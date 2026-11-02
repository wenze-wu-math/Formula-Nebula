#!/usr/bin/env node

/**
 * Formula Nebula - Automated Backup System
 *
 * Daily snapshots with versioning, compression, and cross-region replication
 * Supports incremental backups and retention policies
 */

import fs from 'fs';
import path from 'path';
import { createHash } from 'crypto';
import { createGzip } from 'zlib';
import { pipeline } from 'stream/promises';

const CONFIG = {
  // Backup sources
  sources: [
    'kb-src/out',
    'kb-src/unsolvedmath-categories.json',
    'kb-src/unsolvedmath-problems.json',
    '.research',
    'designs/manuscript'
  ],

  // Backup destinations
  destinations: {
    local: 'backups/local',
    remote: process.env.BACKUP_REMOTE_PATH || 'backups/remote',
    crossRegion: process.env.BACKUP_CROSS_REGION_PATH || null
  },

  // Retention policy (days)
  retention: {
    daily: 7,
    weekly: 30,
    monthly: 365
  },

  // Compression settings
  compression: {
    enabled: true,
    level: 6 // 1-9, 6 is balanced
  },

  // Incremental backup settings
  incremental: {
    enabled: true,
    baselineInterval: 7 // Full backup every N days
  }
};

/**
 * Generate timestamp for backup naming
 */
function getTimestamp() {
  const now = new Date();
  return now.toISOString().replace(/[:.]/g, '-').slice(0, -5);
}

/**
 * Calculate file hash for integrity verification
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
 * Get file metadata
 */
function getFileMetadata(filePath) {
  const stats = fs.statSync(filePath);
  return {
    path: filePath,
    size: stats.size,
    modified: stats.mtime.toISOString(),
    created: stats.birthtime.toISOString()
  };
}

/**
 * Scan directory recursively
 */
function scanDirectory(dirPath, baseDir = dirPath) {
  const files = [];
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      files.push(...scanDirectory(fullPath, baseDir));
    } else {
      files.push({
        absolute: fullPath,
        relative: path.relative(baseDir, fullPath),
        ...getFileMetadata(fullPath)
      });
    }
  }

  return files;
}

/**
 * Load previous backup manifest
 */
function loadPreviousManifest(backupDir) {
  try {
    const manifestPath = path.join(backupDir, 'latest-manifest.json');
    if (fs.existsSync(manifestPath)) {
      return JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    }
  } catch (error) {
    console.warn('Could not load previous manifest:', error.message);
  }
  return null;
}

/**
 * Determine if file has changed since last backup
 */
function hasFileChanged(file, previousManifest) {
  if (!previousManifest || !previousManifest.files) return true;

  const prevFile = previousManifest.files.find(f => f.relative === file.relative);
  if (!prevFile) return true;

  return file.modified !== prevFile.modified || file.size !== prevFile.size;
}

/**
 * Compress file
 */
async function compressFile(sourcePath, destPath) {
  await fs.promises.mkdir(path.dirname(destPath), { recursive: true });

  const source = fs.createReadStream(sourcePath);
  const dest = fs.createWriteStream(destPath);
  const gzip = createGzip({ level: CONFIG.compression.level });

  await pipeline(source, gzip, dest);
}

/**
 * Copy file
 */
async function copyFile(sourcePath, destPath) {
  await fs.promises.mkdir(path.dirname(destPath), { recursive: true });
  await fs.promises.copyFile(sourcePath, destPath);
}

/**
 * Create backup manifest
 */
async function createManifest(backupInfo, files) {
  const manifest = {
    timestamp: backupInfo.timestamp,
    type: backupInfo.type,
    version: '1.0.0',
    files: files.map(f => ({
      relative: f.relative,
      size: f.size,
      modified: f.modified,
      hash: f.hash,
      compressed: CONFIG.compression.enabled
    })),
    stats: {
      totalFiles: files.length,
      totalSize: files.reduce((sum, f) => sum + f.size, 0),
      compressedSize: backupInfo.compressedSize || 0
    },
    config: {
      sources: CONFIG.sources,
      compression: CONFIG.compression,
      incremental: backupInfo.type === 'incremental'
    }
  };

  return manifest;
}

/**
 * Perform backup operation
 */
async function performBackup(destination, isIncremental = false) {
  const timestamp = getTimestamp();
  const backupType = isIncremental ? 'incremental' : 'full';
  const backupDir = path.join(destination, `backup-${backupType}-${timestamp}`);

  console.log(`\n🔄 Starting ${backupType} backup to: ${backupDir}`);
  console.log(`📅 Timestamp: ${timestamp}\n`);

  // Load previous manifest for incremental backup
  const previousManifest = isIncremental ? loadPreviousManifest(destination) : null;

  // Collect all files to backup
  const allFiles = [];
  const projectRoot = process.cwd();

  for (const source of CONFIG.sources) {
    const sourcePath = path.join(projectRoot, source);

    if (!fs.existsSync(sourcePath)) {
      console.warn(`⚠️  Source not found: ${source}`);
      continue;
    }

    const stat = fs.statSync(sourcePath);

    if (stat.isDirectory()) {
      console.log(`📂 Scanning directory: ${source}`);
      allFiles.push(...scanDirectory(sourcePath, projectRoot));
    } else {
      console.log(`📄 Adding file: ${source}`);
      allFiles.push({
        absolute: sourcePath,
        relative: source,
        ...getFileMetadata(sourcePath)
      });
    }
  }

  // Filter files for incremental backup
  const filesToBackup = isIncremental
    ? allFiles.filter(f => hasFileChanged(f, previousManifest))
    : allFiles;

  console.log(`\n📊 Backup summary:`);
  console.log(`   Total files scanned: ${allFiles.length}`);
  console.log(`   Files to backup: ${filesToBackup.length}`);

  if (filesToBackup.length === 0) {
    console.log('\n✅ No changes detected. Backup skipped.');
    return null;
  }

  // Create backup directory
  await fs.promises.mkdir(backupDir, { recursive: true });

  // Backup files
  let compressedSize = 0;
  const backedUpFiles = [];

  for (let i = 0; i < filesToBackup.length; i++) {
    const file = filesToBackup[i];
    const progress = `[${i + 1}/${filesToBackup.length}]`;

    process.stdout.write(`\r${progress} Backing up: ${file.relative.slice(0, 50).padEnd(50)}`);

    const destPath = CONFIG.compression.enabled
      ? path.join(backupDir, 'data', file.relative + '.gz')
      : path.join(backupDir, 'data', file.relative);

    try {
      if (CONFIG.compression.enabled) {
        await compressFile(file.absolute, destPath);
      } else {
        await copyFile(file.absolute, destPath);
      }

      const hash = await calculateHash(file.absolute);
      const destStats = fs.statSync(destPath);
      compressedSize += destStats.size;

      backedUpFiles.push({
        ...file,
        hash
      });
    } catch (error) {
      console.error(`\n❌ Failed to backup ${file.relative}:`, error.message);
    }
  }

  console.log('\n');

  // Create and save manifest
  const manifest = await createManifest(
    { timestamp, type: backupType, compressedSize },
    backedUpFiles
  );

  const manifestPath = path.join(backupDir, 'manifest.json');
  await fs.promises.writeFile(manifestPath, JSON.stringify(manifest, null, 2));

  // Update latest manifest symlink
  const latestManifestPath = path.join(destination, 'latest-manifest.json');
  await fs.promises.writeFile(latestManifestPath, JSON.stringify(manifest, null, 2));

  // Calculate compression ratio
  const compressionRatio = manifest.stats.totalSize > 0
    ? ((1 - compressedSize / manifest.stats.totalSize) * 100).toFixed(1)
    : 0;

  console.log(`✅ Backup completed successfully!\n`);
  console.log(`📦 Backup details:`);
  console.log(`   Location: ${backupDir}`);
  console.log(`   Files backed up: ${backedUpFiles.length}`);
  console.log(`   Original size: ${(manifest.stats.totalSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`   Compressed size: ${(compressedSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`   Compression ratio: ${compressionRatio}%`);
  console.log(`   Manifest: ${manifestPath}\n`);

  return {
    backupDir,
    manifest,
    timestamp
  };
}

/**
 * Replicate backup to remote/cross-region
 */
async function replicateBackup(sourceDir, destinationPath) {
  if (!destinationPath) return;

  console.log(`\n🌐 Replicating backup to: ${destinationPath}`);

  try {
    const destDir = path.join(destinationPath, path.basename(sourceDir));
    await fs.promises.mkdir(destDir, { recursive: true });

    // Copy entire backup directory
    await copyDirectoryRecursive(sourceDir, destDir);

    console.log(`✅ Replication completed: ${destDir}\n`);
  } catch (error) {
    console.error(`❌ Replication failed:`, error.message);
  }
}

async function copyDirectoryRecursive(source, dest) {
  await fs.promises.mkdir(dest, { recursive: true });
  const entries = await fs.promises.readdir(source, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(source, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyDirectoryRecursive(srcPath, destPath);
    } else {
      await fs.promises.copyFile(srcPath, destPath);
    }
  }
}

/**
 * Clean up old backups based on retention policy
 */
async function cleanupOldBackups(backupRoot) {
  console.log('\n🧹 Cleaning up old backups...');

  try {
    const entries = await fs.promises.readdir(backupRoot, { withFileTypes: true });
    const backups = entries.filter(e => e.isDirectory() && e.name.startsWith('backup-'));

    const now = Date.now();
    const retentionMs = {
      daily: CONFIG.retention.daily * 24 * 60 * 60 * 1000,
      weekly: CONFIG.retention.weekly * 24 * 60 * 60 * 1000,
      monthly: CONFIG.retention.monthly * 24 * 60 * 60 * 1000
    };

    let deletedCount = 0;

    for (const backup of backups) {
      const backupPath = path.join(backupRoot, backup.name);
      const stats = await fs.promises.stat(backupPath);
      const age = now - stats.mtime.getTime();

      let shouldDelete = false;

      if (backup.name.includes('incremental')) {
        shouldDelete = age > retentionMs.daily;
      } else if (backup.name.includes('full')) {
        // Keep weekly full backups for monthly retention
        const dayOfWeek = new Date(stats.mtime).getDay();
        if (dayOfWeek === 0) { // Sunday backup
          shouldDelete = age > retentionMs.monthly;
        } else {
          shouldDelete = age > retentionMs.weekly;
        }
      }

      if (shouldDelete) {
        await fs.promises.rm(backupPath, { recursive: true, force: true });
        deletedCount++;
        console.log(`   Deleted old backup: ${backup.name}`);
      }
    }

    if (deletedCount === 0) {
      console.log('   No old backups to clean up.');
    } else {
      console.log(`   Cleaned up ${deletedCount} old backup(s).`);
    }
  } catch (error) {
    console.error('⚠️  Cleanup failed:', error.message);
  }
}

/**
 * Determine backup type based on schedule
 */
function determineBackupType() {
  const now = new Date();
  const daysSinceEpoch = Math.floor(now.getTime() / (24 * 60 * 60 * 1000));

  // Full backup every N days
  return daysSinceEpoch % CONFIG.incremental.baselineInterval === 0 ? 'full' : 'incremental';
}

/**
 * Main backup execution
 */
async function main() {
  console.log('╔════════════════════════════════════════╗');
  console.log('║  Formula Nebula - Backup System       ║');
  console.log('╚════════════════════════════════════════╝');

  const startTime = Date.now();

  try {
    // Determine backup type
    const backupType = CONFIG.incremental.enabled ? determineBackupType() : 'full';
    const isIncremental = backupType === 'incremental';

    // Perform primary backup
    const result = await performBackup(CONFIG.destinations.local, isIncremental);

    if (!result) {
      console.log('Backup process completed (no changes).');
      return;
    }

    // Replicate to remote locations
    if (CONFIG.destinations.remote) {
      await replicateBackup(result.backupDir, CONFIG.destinations.remote);
    }

    if (CONFIG.destinations.crossRegion) {
      await replicateBackup(result.backupDir, CONFIG.destinations.crossRegion);
    }

    // Clean up old backups
    await cleanupOldBackups(CONFIG.destinations.local);

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`\n⏱️  Total backup time: ${duration}s`);
    console.log(`\n✨ All backup operations completed successfully!`);

    // Generate backup report
    const report = {
      success: true,
      timestamp: result.timestamp,
      type: backupType,
      duration: duration,
      filesBackedUp: result.manifest.stats.totalFiles,
      totalSize: result.manifest.stats.totalSize,
      backupLocation: result.backupDir
    };

    // Save backup report
    const reportPath = path.join(result.backupDir, 'backup-report.json');
    await fs.promises.writeFile(reportPath, JSON.stringify(report, null, 2));

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Backup failed:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run backup if executed directly
if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`) {
  main();
}

export { performBackup, replicateBackup, cleanupOldBackups };

