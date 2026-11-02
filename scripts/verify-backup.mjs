#!/usr/bin/env node

/**
 * Formula Nebula - Backup Verification System
 *
 * Comprehensive backup integrity verification
 * Tests backup completeness, file integrity, and restore capability
 */

import fs from 'fs';
import path from 'path';
import { createHash } from 'crypto';
import { createGunzip } from 'zlib';
import { pipeline } from 'stream/promises';
import os from 'os';

/**
 * Calculate file hash
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
 * Verify backup manifest
 */
async function verifyManifest(backupPath) {
  console.log('\n📋 Verifying backup manifest...');

  const manifestPath = path.join(backupPath, 'manifest.json');

  if (!fs.existsSync(manifestPath)) {
    return {
      valid: false,
      error: 'Manifest file not found',
      issues: ['Missing manifest.json']
    };
  }

  try {
    const manifest = JSON.parse(await fs.promises.readFile(manifestPath, 'utf8'));
    const issues = [];

    // Check required fields
    const requiredFields = ['timestamp', 'type', 'version', 'files', 'stats'];
    for (const field of requiredFields) {
      if (!manifest[field]) {
        issues.push(`Missing required field: ${field}`);
      }
    }

    // Validate stats
    if (manifest.files && manifest.stats) {
      if (manifest.files.length !== manifest.stats.totalFiles) {
        issues.push(`File count mismatch: ${manifest.files.length} vs ${manifest.stats.totalFiles}`);
      }

      const calculatedSize = manifest.files.reduce((sum, f) => sum + (f.size || 0), 0);
      if (calculatedSize !== manifest.stats.totalSize) {
        issues.push(`Size mismatch: ${calculatedSize} vs ${manifest.stats.totalSize}`);
      }
    }

    if (issues.length > 0) {
      return { valid: false, manifest, issues };
    }

    console.log('   ✅ Manifest is valid');
    console.log(`   Files: ${manifest.stats.totalFiles}`);
    console.log(`   Total size: ${(manifest.stats.totalSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   Type: ${manifest.type}`);

    return { valid: true, manifest, issues: [] };
  } catch (error) {
    return {
      valid: false,
      error: error.message,
      issues: ['Failed to parse manifest']
    };
  }
}

/**
 * Verify file integrity
 */
async function verifyFileIntegrity(backupPath, manifest, options = {}) {
  const { sampleSize = null } = options;

  console.log('\n🔍 Verifying file integrity...');

  const dataDir = path.join(backupPath, 'data');
  const filesToCheck = sampleSize
    ? manifest.files.slice(0, sampleSize)
    : manifest.files;

  console.log(`   Checking ${filesToCheck.length} file(s)...`);

  const results = {
    total: filesToCheck.length,
    verified: 0,
    missing: 0,
    corrupted: 0,
    issues: []
  };

  for (let i = 0; i < filesToCheck.length; i++) {
    const file = filesToCheck[i];
    const progress = `[${i + 1}/${filesToCheck.length}]`;

    process.stdout.write(`\r${progress} Checking: ${file.relative.slice(0, 50).padEnd(50)}`);

    const backupFilePath = file.compressed
      ? path.join(dataDir, file.relative + '.gz')
      : path.join(dataDir, file.relative);

    // Check if file exists
    if (!fs.existsSync(backupFilePath)) {
      results.missing++;
      results.issues.push({
        file: file.relative,
        type: 'missing',
        message: 'Backup file not found'
      });
      continue;
    }

    // Verify file size (compressed files will differ)
    if (!file.compressed) {
      const stats = fs.statSync(backupFilePath);
      if (stats.size !== file.size) {
        results.corrupted++;
        results.issues.push({
          file: file.relative,
          type: 'size_mismatch',
          message: `Size mismatch: expected ${file.size}, got ${stats.size}`
        });
        continue;
      }
    }

    // Verify hash for compressed files by decompressing to temp
    if (file.hash && file.compressed) {
      try {
        const tempPath = path.join(os.tmpdir(), `verify-${Date.now()}-${path.basename(file.relative)}`);
        await decompressFile(backupFilePath, tempPath);

        const hash = await calculateHash(tempPath);
        await fs.promises.unlink(tempPath);

        if (hash !== file.hash) {
          results.corrupted++;
          results.issues.push({
            file: file.relative,
            type: 'hash_mismatch',
            message: 'Content hash mismatch after decompression'
          });
          continue;
        }
      } catch (error) {
        results.corrupted++;
        results.issues.push({
          file: file.relative,
          type: 'decompression_failed',
          message: error.message
        });
        continue;
      }
    }

    results.verified++;
  }

  console.log('\n');

  return results;
}

/**
 * Decompress file
 */
async function decompressFile(sourcePath, destPath) {
  const source = fs.createReadStream(sourcePath);
  const dest = fs.createWriteStream(destPath);
  const gunzip = createGunzip();

  await pipeline(source, gunzip, dest);
}

/**
 * Test restore capability
 */
async function testRestoreCapability(backupPath, manifest) {
  console.log('\n🔧 Testing restore capability...');

  const tempDir = path.join(os.tmpdir(), `restore-test-${Date.now()}`);
  await fs.promises.mkdir(tempDir, { recursive: true });

  console.log(`   Using temporary directory: ${tempDir}`);

  const dataDir = path.join(backupPath, 'data');
  const testFiles = manifest.files.slice(0, Math.min(5, manifest.files.length));

  const results = {
    total: testFiles.length,
    success: 0,
    failed: 0,
    issues: []
  };

  for (let i = 0; i < testFiles.length; i++) {
    const file = testFiles[i];

    process.stdout.write(`\r   Testing restore: ${i + 1}/${testFiles.length}`);

    const sourcePath = file.compressed
      ? path.join(dataDir, file.relative + '.gz')
      : path.join(dataDir, file.relative);

    const destPath = path.join(tempDir, file.relative);

    try {
      if (file.compressed) {
        await decompressFile(sourcePath, destPath);
      } else {
        await fs.promises.mkdir(path.dirname(destPath), { recursive: true });
        await fs.promises.copyFile(sourcePath, destPath);
      }

      // Verify restored file
      if (file.hash) {
        const restoredHash = await calculateHash(destPath);
        if (restoredHash !== file.hash) {
          throw new Error('Hash mismatch after restore');
        }
      }

      results.success++;
    } catch (error) {
      results.failed++;
      results.issues.push({
        file: file.relative,
        error: error.message
      });
    }
  }

  console.log('\n');

  // Cleanup
  try {
    await fs.promises.rm(tempDir, { recursive: true, force: true });
  } catch (error) {
    console.warn(`   Warning: Failed to cleanup temp directory: ${error.message}`);
  }

  return results;
}

/**
 * Check backup consistency
 */
async function checkBackupConsistency(backupRoot) {
  console.log('\n🔗 Checking backup consistency...');

  try {
    const entries = await fs.promises.readdir(backupRoot, { withFileTypes: true });
    const backups = entries
      .filter(e => e.isDirectory() && e.name.startsWith('backup-'))
      .sort((a, b) => a.name.localeCompare(b.name));

    if (backups.length === 0) {
      return {
        valid: true,
        fullBackups: 0,
        incrementalBackups: 0,
        issues: []
      };
    }

    const results = {
      valid: true,
      fullBackups: 0,
      incrementalBackups: 0,
      totalBackups: backups.length,
      issues: []
    };

    let lastFullBackup = null;

    for (const backup of backups) {
      const backupPath = path.join(backupRoot, backup.name);
      const manifestPath = path.join(backupPath, 'manifest.json');

      if (!fs.existsSync(manifestPath)) {
        results.issues.push({
          backup: backup.name,
          issue: 'Missing manifest'
        });
        results.valid = false;
        continue;
      }

      const manifest = JSON.parse(await fs.promises.readFile(manifestPath, 'utf8'));

      if (manifest.type === 'full') {
        results.fullBackups++;
        lastFullBackup = backup.name;
      } else if (manifest.type === 'incremental') {
        results.incrementalBackups++;

        // Incremental backup should have a preceding full backup
        if (!lastFullBackup) {
          results.issues.push({
            backup: backup.name,
            issue: 'Incremental backup without preceding full backup'
          });
          results.valid = false;
        }
      }
    }

    console.log(`   Total backups: ${results.totalBackups}`);
    console.log(`   Full backups: ${results.fullBackups}`);
    console.log(`   Incremental backups: ${results.incrementalBackups}`);

    if (results.issues.length > 0) {
      console.log(`   ⚠️  Issues found: ${results.issues.length}`);
    } else {
      console.log(`   ✅ Backup chain is consistent`);
    }

    return results;
  } catch (error) {
    return {
      valid: false,
      error: error.message,
      issues: [{ issue: 'Failed to check consistency' }]
    };
  }
}

/**
 * Generate verification report
 */
function generateReport(results) {
  const report = {
    timestamp: new Date().toISOString(),
    overallStatus: 'PASS',
    checks: {},
    summary: {},
    recommendations: []
  };

  // Manifest verification
  if (results.manifest) {
    report.checks.manifest = {
      status: results.manifest.valid ? 'PASS' : 'FAIL',
      issues: results.manifest.issues || []
    };

    if (!results.manifest.valid) {
      report.overallStatus = 'FAIL';
    }
  }

  // File integrity
  if (results.integrity) {
    const integrityPass = results.integrity.missing === 0 && results.integrity.corrupted === 0;

    report.checks.integrity = {
      status: integrityPass ? 'PASS' : 'FAIL',
      verified: results.integrity.verified,
      missing: results.integrity.missing,
      corrupted: results.integrity.corrupted,
      issues: results.integrity.issues
    };

    if (!integrityPass) {
      report.overallStatus = 'FAIL';
      report.recommendations.push('Re-run backup to replace corrupted or missing files');
    }
  }

  // Restore capability
  if (results.restore) {
    const restorePass = results.restore.failed === 0;

    report.checks.restore = {
      status: restorePass ? 'PASS' : 'FAIL',
      tested: results.restore.total,
      success: results.restore.success,
      failed: results.restore.failed,
      issues: results.restore.issues
    };

    if (!restorePass) {
      report.overallStatus = 'FAIL';
      report.recommendations.push('Backup may not be restorable - investigate failed files');
    }
  }

  // Consistency
  if (results.consistency) {
    report.checks.consistency = {
      status: results.consistency.valid ? 'PASS' : 'FAIL',
      fullBackups: results.consistency.fullBackups,
      incrementalBackups: results.consistency.incrementalBackups,
      issues: results.consistency.issues
    };

    if (!results.consistency.valid) {
      report.overallStatus = 'WARN';
    }

    if (results.consistency.fullBackups === 0) {
      report.recommendations.push('No full backups found - run a full backup');
    }
  }

  // Generate summary
  report.summary = {
    totalChecks: Object.keys(report.checks).length,
    passed: Object.values(report.checks).filter(c => c.status === 'PASS').length,
    failed: Object.values(report.checks).filter(c => c.status === 'FAIL').length,
    warnings: Object.values(report.checks).filter(c => c.status === 'WARN').length
  };

  return report;
}

/**
 * Display report
 */
function displayReport(report) {
  console.log('\n╔════════════════════════════════════════╗');
  console.log('║     Backup Verification Report         ║');
  console.log('╚════════════════════════════════════════╝\n');

  const statusEmoji = {
    'PASS': '✅',
    'FAIL': '❌',
    'WARN': '⚠️'
  };

  console.log(`Overall Status: ${statusEmoji[report.overallStatus]} ${report.overallStatus}\n`);

  console.log('Checks Performed:\n');

  for (const [checkName, checkResult] of Object.entries(report.checks)) {
    console.log(`  ${statusEmoji[checkResult.status]} ${checkName.toUpperCase()}: ${checkResult.status}`);

    if (checkResult.issues && checkResult.issues.length > 0) {
      console.log(`     Issues: ${checkResult.issues.length}`);
      checkResult.issues.slice(0, 3).forEach(issue => {
        const msg = issue.message || issue.issue || JSON.stringify(issue);
        console.log(`     - ${msg}`);
      });
      if (checkResult.issues.length > 3) {
        console.log(`     ... and ${checkResult.issues.length - 3} more`);
      }
    }
    console.log('');
  }

  console.log(`Summary:`);
  console.log(`  Checks: ${report.summary.totalChecks}`);
  console.log(`  Passed: ${report.summary.passed}`);
  console.log(`  Failed: ${report.summary.failed}`);
  console.log(`  Warnings: ${report.summary.warnings}\n`);

  if (report.recommendations.length > 0) {
    console.log('Recommendations:');
    report.recommendations.forEach((rec, i) => {
      console.log(`  ${i + 1}. ${rec}`);
    });
    console.log('');
  }
}

/**
 * Main verification execution
 */
async function main() {
  console.log('╔════════════════════════════════════════╗');
  console.log('║  Formula Nebula - Backup Verifier     ║');
  console.log('╚════════════════════════════════════════╝');

  const args = process.argv.slice(2);
  const backupRoot = process.env.BACKUP_ROOT || 'backups/local';

  if (args.includes('--help') || args.includes('-h')) {
    console.log('\nUsage:');
    console.log('  node verify-backup.mjs [options]');
    console.log('\nOptions:');
    console.log('  --backup <name>   Verify specific backup (default: latest)');
    console.log('  --quick           Quick verification (sample files only)');
    console.log('  --full            Full verification (all checks)');
    console.log('  --help            Show this help');
    console.log('\nEnvironment:');
    console.log('  BACKUP_ROOT       Backup directory (default: backups/local)');
    process.exit(0);
  }

  try {
    const results = {};

    // Find backup to verify
    let backupPath;

    if (args.includes('--backup')) {
      const backupName = args[args.indexOf('--backup') + 1];
      backupPath = path.join(backupRoot, backupName);
    } else {
      // Find latest backup
      const entries = await fs.promises.readdir(backupRoot, { withFileTypes: true });
      const backups = entries
        .filter(e => e.isDirectory() && e.name.startsWith('backup-'))
        .sort((a, b) => b.name.localeCompare(a.name));

      if (backups.length === 0) {
        console.log('\n❌ No backups found in:', backupRoot);
        process.exit(1);
      }

      backupPath = path.join(backupRoot, backups[0].name);
    }

    console.log(`\n🔍 Verifying backup: ${path.basename(backupPath)}`);

    if (!fs.existsSync(backupPath)) {
      console.log(`\n❌ Backup not found: ${backupPath}`);
      process.exit(1);
    }

    // Verify manifest
    results.manifest = await verifyManifest(backupPath);

    if (!results.manifest.valid) {
      console.log('\n❌ Manifest verification failed. Cannot continue.');
      process.exit(1);
    }

    const manifest = results.manifest.manifest;
    const quickMode = args.includes('--quick');

    // Verify file integrity
    results.integrity = await verifyFileIntegrity(
      backupPath,
      manifest,
      { sampleSize: quickMode ? 10 : null }
    );

    // Test restore capability
    results.restore = await testRestoreCapability(backupPath, manifest);

    // Check backup consistency
    results.consistency = await checkBackupConsistency(backupRoot);

    // Generate and display report
    const report = generateReport(results);
    displayReport(report);

    // Save report
    const reportPath = path.join(backupPath, 'verification-report.json');
    await fs.promises.writeFile(reportPath, JSON.stringify(report, null, 2));
    console.log(`📄 Report saved: ${reportPath}\n`);

    if (report.overallStatus === 'FAIL') {
      console.log('❌ Verification FAILED\n');
      process.exit(1);
    } else if (report.overallStatus === 'WARN') {
      console.log('⚠️  Verification completed with warnings\n');
      process.exit(0);
    } else {
      console.log('✅ Verification PASSED\n');
      process.exit(0);
    }
  } catch (error) {
    console.error('\n❌ Verification failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run verification if executed directly
if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`) {
  main();
}

export { verifyManifest, verifyFileIntegrity, testRestoreCapability, checkBackupConsistency };
