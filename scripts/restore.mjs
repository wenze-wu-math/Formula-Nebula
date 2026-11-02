#!/usr/bin/env node

/**
 * Formula Nebula - Backup Restore System
 *
 * Point-in-time recovery with verification
 * Supports full and incremental restore operations
 */

import fs from 'fs';
import path from 'path';
import { createHash } from 'crypto';
import { createGunzip } from 'zlib';
import { pipeline } from 'stream/promises';
import readline from 'readline';

/**
 * List available backups
 */
async function listBackups(backupRoot) {
  try {
    const entries = await fs.promises.readdir(backupRoot, { withFileTypes: true });
    const backups = [];

    for (const entry of entries) {
      if (!entry.isDirectory() || !entry.name.startsWith('backup-')) continue;

      const backupPath = path.join(backupRoot, entry.name);
      const manifestPath = path.join(backupPath, 'manifest.json');

      if (fs.existsSync(manifestPath)) {
        const manifest = JSON.parse(await fs.promises.readFile(manifestPath, 'utf8'));
        const stats = await fs.promises.stat(backupPath);

        backups.push({
          name: entry.name,
          path: backupPath,
          timestamp: manifest.timestamp,
          type: manifest.type,
          filesCount: manifest.stats.totalFiles,
          totalSize: manifest.stats.totalSize,
          created: stats.birthtime,
          manifest
        });
      }
    }

    // Sort by timestamp (newest first)
    backups.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return backups;
  } catch (error) {
    console.error('Failed to list backups:', error.message);
    return [];
  }
}

/**
 * Display available backups
 */
function displayBackups(backups) {
  console.log('\n📦 Available Backups:\n');

  if (backups.length === 0) {
    console.log('   No backups found.');
    return;
  }

  backups.forEach((backup, index) => {
    const sizeMB = (backup.totalSize / 1024 / 1024).toFixed(2);
    const date = new Date(backup.timestamp).toLocaleString();

    console.log(`${index + 1}. ${backup.name}`);
    console.log(`   Type: ${backup.type.toUpperCase()}`);
    console.log(`   Date: ${date}`);
    console.log(`   Files: ${backup.filesCount}`);
    console.log(`   Size: ${sizeMB} MB`);
    console.log(`   Path: ${backup.path}`);
    console.log('');
  });
}

/**
 * Calculate file hash for verification
 */
async function calculateHash(filePath) {
  return new Promise((resolve, reject) => {
    const hash = createHash('sha256');
    const stream = fs.createReadStream(filePath);

    stream.on('data', data => hash.update(data));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', reject);
  });
}

/**
 * Decompress file
 */
async function decompressFile(sourcePath, destPath) {
  await fs.promises.mkdir(path.dirname(destPath), { recursive: true });

  const source = fs.createReadStream(sourcePath);
  const dest = fs.createWriteStream(destPath);
  const gunzip = createGunzip();

  await pipeline(source, gunzip, dest);
}

/**
 * Copy file
 */
async function copyFile(sourcePath, destPath) {
  await fs.promises.mkdir(path.dirname(destPath), { recursive: true });
  await fs.promises.copyFile(sourcePath, destPath);
}

/**
 * Restore files from backup
 */
async function restoreFromBackup(backupPath, targetDir, options = {}) {
  const {
    verify = true,
    dryRun = false,
    fileFilter = null
  } = options;

  console.log(`\n🔄 Restoring from backup: ${path.basename(backupPath)}`);
  console.log(`📁 Target directory: ${targetDir}\n`);

  if (dryRun) {
    console.log('🔍 DRY RUN MODE - No files will be modified\n');
  }

  // Load manifest
  const manifestPath = path.join(backupPath, 'manifest.json');
  if (!fs.existsSync(manifestPath)) {
    throw new Error('Backup manifest not found');
  }

  const manifest = JSON.parse(await fs.promises.readFile(manifestPath, 'utf8'));
  const dataDir = path.join(backupPath, 'data');

  // Filter files if needed
  let filesToRestore = manifest.files;
  if (fileFilter) {
    filesToRestore = filesToRestore.filter(fileFilter);
  }

  console.log(`📊 Restore summary:`);
  console.log(`   Total files in backup: ${manifest.files.length}`);
  console.log(`   Files to restore: ${filesToRestore.length}`);
  console.log(`   Verification: ${verify ? 'ENABLED' : 'DISABLED'}\n`);

  if (filesToRestore.length === 0) {
    console.log('No files to restore.');
    return { success: true, restoredFiles: 0 };
  }

  // Confirm restore operation
  if (!dryRun && !options.skipConfirmation) {
    const confirmed = await confirmRestore(filesToRestore.length, targetDir);
    if (!confirmed) {
      console.log('Restore cancelled by user.');
      return { success: false, cancelled: true };
    }
  }

  // Restore files
  const restoredFiles = [];
  const failedFiles = [];

  for (let i = 0; i < filesToRestore.length; i++) {
    const file = filesToRestore[i];
    const progress = `[${i + 1}/${filesToRestore.length}]`;

    process.stdout.write(`\r${progress} Restoring: ${file.relative.slice(0, 50).padEnd(50)}`);

    const sourcePath = file.compressed
      ? path.join(dataDir, file.relative + '.gz')
      : path.join(dataDir, file.relative);

    const destPath = path.join(targetDir, file.relative);

    if (!fs.existsSync(sourcePath)) {
      failedFiles.push({ file: file.relative, error: 'Source file not found' });
      continue;
    }

    try {
      if (!dryRun) {
        if (file.compressed) {
          await decompressFile(sourcePath, destPath);
        } else {
          await copyFile(sourcePath, destPath);
        }

        // Verify hash if enabled
        if (verify && file.hash) {
          const restoredHash = await calculateHash(destPath);
          if (restoredHash !== file.hash) {
            failedFiles.push({ file: file.relative, error: 'Hash mismatch' });
            await fs.promises.unlink(destPath);
            continue;
          }
        }
      }

      restoredFiles.push(file.relative);
    } catch (error) {
      failedFiles.push({ file: file.relative, error: error.message });
    }
  }

  console.log('\n');

  // Display results
  console.log(`✅ Restore completed!\n`);
  console.log(`📊 Results:`);
  console.log(`   Successfully restored: ${restoredFiles.length}`);
  console.log(`   Failed: ${failedFiles.length}`);

  if (failedFiles.length > 0) {
    console.log(`\n⚠️  Failed files:`);
    failedFiles.slice(0, 10).forEach(({ file, error }) => {
      console.log(`   - ${file}: ${error}`);
    });
    if (failedFiles.length > 10) {
      console.log(`   ... and ${failedFiles.length - 10} more`);
    }
  }

  return {
    success: failedFiles.length === 0,
    restoredFiles: restoredFiles.length,
    failedFiles: failedFiles.length,
    files: restoredFiles
  };
}

/**
 * Point-in-time restore
 */
async function restorePointInTime(backupRoot, targetDate, targetDir, options = {}) {
  console.log(`\n⏰ Point-in-time restore to: ${targetDate.toLocaleString()}`);

  const backups = await listBackups(backupRoot);
  if (backups.length === 0) {
    throw new Error('No backups available for restore');
  }

  // Find the most recent full backup before target date
  const fullBackup = backups.find(b =>
    b.type === 'full' && new Date(b.timestamp) <= targetDate
  );

  if (!fullBackup) {
    throw new Error('No full backup found before target date');
  }

  console.log(`📦 Using full backup: ${fullBackup.name}`);

  // Find all incremental backups between full backup and target date
  const incrementalBackups = backups.filter(b =>
    b.type === 'incremental' &&
    new Date(b.timestamp) > new Date(fullBackup.timestamp) &&
    new Date(b.timestamp) <= targetDate
  ).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  if (incrementalBackups.length > 0) {
    console.log(`📦 Incremental backups to apply: ${incrementalBackups.length}`);
  }

  // Restore full backup
  console.log('\n--- Restoring full backup ---');
  const fullResult = await restoreFromBackup(fullBackup.path, targetDir, options);

  if (!fullResult.success) {
    return fullResult;
  }

  // Apply incremental backups
  for (const backup of incrementalBackups) {
    console.log(`\n--- Applying incremental: ${backup.name} ---`);
    const incResult = await restoreFromBackup(backup.path, targetDir, {
      ...options,
      skipConfirmation: true
    });

    if (!incResult.success) {
      console.warn(`⚠️  Incremental restore failed: ${backup.name}`);
    }
  }

  console.log(`\n✨ Point-in-time restore completed!`);
  return fullResult;
}

/**
 * Confirm restore operation with user
 */
async function confirmRestore(fileCount, targetDir) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(
      `\n⚠️  WARNING: This will restore ${fileCount} files to ${targetDir}\n` +
      `   Existing files will be overwritten.\n\n` +
      `   Continue? (yes/no): `,
      (answer) => {
        rl.close();
        resolve(answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y');
      }
    );
  });
}

/**
 * Main restore execution
 */
async function main() {
  console.log('╔════════════════════════════════════════╗');
  console.log('║  Formula Nebula - Restore System      ║');
  console.log('╚════════════════════════════════════════╝');

  const args = process.argv.slice(2);
  const backupRoot = process.env.BACKUP_ROOT || 'backups/local';
  const targetDir = process.env.RESTORE_TARGET || process.cwd();

  try {
    // List available backups
    const backups = await listBackups(backupRoot);
    displayBackups(backups);

    if (backups.length === 0) {
      console.log('No backups available. Run backup.mjs first.');
      process.exit(0);
    }

    // Check for command line arguments
    if (args.includes('--help') || args.includes('-h')) {
      console.log('\nUsage:');
      console.log('  node restore.mjs [options]');
      console.log('\nOptions:');
      console.log('  --latest          Restore from latest backup');
      console.log('  --backup <name>   Restore from specific backup');
      console.log('  --date <ISO>      Point-in-time restore to date');
      console.log('  --dry-run         Show what would be restored');
      console.log('  --no-verify       Skip hash verification');
      console.log('  --help            Show this help');
      console.log('\nEnvironment:');
      console.log('  BACKUP_ROOT       Source backup directory (default: backups/local)');
      console.log('  RESTORE_TARGET    Target restore directory (default: current dir)');
      process.exit(0);
    }

    const options = {
      verify: !args.includes('--no-verify'),
      dryRun: args.includes('--dry-run'),
      skipConfirmation: false
    };

    let result;

    if (args.includes('--latest')) {
      // Restore latest backup
      const latest = backups[0];
      console.log(`\n🔄 Restoring latest backup: ${latest.name}`);
      result = await restoreFromBackup(latest.path, targetDir, options);
    } else if (args.includes('--backup')) {
      // Restore specific backup
      const backupName = args[args.indexOf('--backup') + 1];
      const backup = backups.find(b => b.name === backupName);

      if (!backup) {
        throw new Error(`Backup not found: ${backupName}`);
      }

      result = await restoreFromBackup(backup.path, targetDir, options);
    } else if (args.includes('--date')) {
      // Point-in-time restore
      const dateStr = args[args.indexOf('--date') + 1];
      const targetDate = new Date(dateStr);

      if (isNaN(targetDate.getTime())) {
        throw new Error(`Invalid date: ${dateStr}`);
      }

      result = await restorePointInTime(backupRoot, targetDate, targetDir, options);
    } else {
      // Interactive mode
      console.log('ℹ️  Use --latest, --backup <name>, or --date <ISO> to restore');
      console.log('   Or run with --help for more options');
      process.exit(0);
    }

    if (result.success) {
      console.log('\n✨ Restore operation completed successfully!');
      process.exit(0);
    } else {
      console.log('\n⚠️  Restore completed with errors.');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Restore failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run restore if executed directly
if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`) {
  main();
}

export { listBackups, restoreFromBackup, restorePointInTime };
