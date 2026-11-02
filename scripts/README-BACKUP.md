# Backup & Recovery Scripts

## Overview

Three automated scripts provide comprehensive backup, restore, and verification capabilities for Formula Nebula's mathematical knowledge graph data.

## Scripts

### 📦 backup.mjs - Automated Backup System

Creates compressed, versioned snapshots of critical data with cross-region replication.

**Usage:**
```bash
node scripts/backup.mjs
# or
npm run backup
```

**Features:**
- Automatic full/incremental backup selection (7-day cycle)
- Gzip compression (level 6) for optimal storage
- SHA-256 hash generation for integrity verification
- Cross-region replication support
- Automated retention policy enforcement
- Detailed manifest and reporting

**Environment Variables:**
- `BACKUP_REMOTE_PATH` - Remote backup destination
- `BACKUP_CROSS_REGION_PATH` - Geographic redundancy location

**Output:**
```
backups/local/backup-full-2026-11-02T10-30-00/
├── data/
│   ├── kb-src/out/*.json.gz
│   ├── .research/*.json.gz
│   └── designs/manuscript/*.json.gz
├── manifest.json
├── backup-report.json
└── verification-report.json (after verify)
```

---

### 🔄 restore.mjs - Recovery System

Restores data from backups with point-in-time recovery and verification.

**Usage:**
```bash
# List available backups
node scripts/restore.mjs

# Restore latest backup
node scripts/restore.mjs --latest

# Restore specific backup
node scripts/restore.mjs --backup backup-full-2026-11-02T10-30-00

# Point-in-time restore
node scripts/restore.mjs --date "2026-10-25T12:00:00Z"

# Dry run (preview only)
node scripts/restore.mjs --latest --dry-run

# Skip hash verification (faster, less safe)
node scripts/restore.mjs --latest --no-verify
```

**Features:**
- Point-in-time recovery (combines full + incremental backups)
- Selective file restoration
- Hash verification during restore
- Interactive confirmation prompts
- Dry-run mode for testing

**Environment Variables:**
- `BACKUP_ROOT` - Source backup directory (default: `backups/local`)
- `RESTORE_TARGET` - Target restore directory (default: current directory)

---

### ✅ verify-backup.mjs - Integrity Verification

Comprehensive backup validation with integrity checks and restore testing.

**Usage:**
```bash
# Verify latest backup
node scripts/verify-backup.mjs

# Verify specific backup
node scripts/verify-backup.mjs --backup backup-full-2026-11-02T10-30-00

# Quick verification (sample files)
node scripts/verify-backup.mjs --quick

# Full verification (all files)
node scripts/verify-backup.mjs --full
```

**Verification Checks:**
1. **Manifest Validation** - Structure and metadata completeness
2. **File Integrity** - Existence, size, and hash verification
3. **Restore Capability** - Simulated restore test
4. **Backup Consistency** - Chain validation (full + incrementals)

**Output:**
```
╔════════════════════════════════════════╗
║     Backup Verification Report         ║
╚════════════════════════════════════════╝

Overall Status: ✅ PASS

Checks Performed:
  ✅ MANIFEST: PASS
  ✅ INTEGRITY: PASS
  ✅ RESTORE: PASS
  ✅ CONSISTENCY: PASS

Summary:
  Checks: 4
  Passed: 4
  Failed: 0
  Warnings: 0
```

---

## Quick Reference

### Common Tasks

**Daily Backup:**
```bash
npm run backup
```

**Verify Backup:**
```bash
npm run backup:verify -- --quick
```

**Restore Latest:**
```bash
npm run restore:latest
```

**Emergency Recovery:**
```bash
# List backups
node scripts/restore.mjs

# Restore with verification
node scripts/restore.mjs --latest

# Verify restore
npm run backup:verify -- --full
npm run check-data
```

### Automated Scheduling

**Linux/macOS (crontab):**
```bash
# Daily backup at 2 AM
0 2 * * * cd /path/to/formula-nebula && node scripts/backup.mjs >> logs/backup.log 2>&1

# Weekly verification at 3 AM on Sunday
0 3 * * 0 cd /path/to/formula-nebula && node scripts/verify-backup.mjs --quick >> logs/verify.log 2>&1
```

**Windows (Task Scheduler):**
```powershell
schtasks /create /tn "Formula Nebula Backup" /tr "node D:\xiangmu\Formula Nebula\scripts\backup.mjs" /sc daily /st 02:00
```

---

## Configuration

### Backup Sources (backup.mjs)

```javascript
const CONFIG = {
  sources: [
    'kb-src/out',                    // ~18 MB knowledge base
    'kb-src/unsolvedmath-categories.json',
    'kb-src/unsolvedmath-problems.json',
    '.research',                     // Research data
    'designs/manuscript'             // Manuscript cache
  ],
  
  retention: {
    daily: 7,      // Days to keep daily incremental backups
    weekly: 30,    // Days to keep weekly full backups
    monthly: 365   // Days to keep monthly snapshots
  },
  
  compression: {
    enabled: true,
    level: 6       // 1-9, 6 is balanced speed/ratio
  },
  
  incremental: {
    enabled: true,
    baselineInterval: 7  // Full backup every N days
  }
};
```

---

## Backup Strategy

### Schedule
- **Full backup:** Every 7 days (Sunday)
- **Incremental backup:** Daily (Monday-Saturday)
- **Verification:** Weekly (Sunday, after backup)
- **Full verification:** Monthly

### Storage Requirements
- Raw data: ~18 MB
- Compressed backup: ~6 MB
- 7 daily incrementals: ~10-15 MB
- 4 weekly full backups: ~24 MB
- Annual storage: ~110 MB

### Retention Policy
```
Day 0:   Full backup (keep 365 days if Sunday)
Day 1-6: Incremental backups (keep 7 days)
Day 7:   Full backup (keep 30 days if not Sunday)
```

---

## Recovery Procedures

### Single File Corruption
```bash
# 1. Identify corrupted file
npm run check-data

# 2. List backups
node scripts/restore.mjs

# 3. Restore latest
npm run restore:latest

# 4. Verify
npm run backup:verify
```

### Complete Data Loss
```bash
# 1. Check backup availability
node scripts/restore.mjs

# 2. Backup current state (if any)
mkdir -p recovery-backup
cp -r kb-src/out recovery-backup/ 2>/dev/null || true

# 3. Restore
npm run restore:latest

# 4. Verify integrity
npm run backup:verify -- --full
npm run check-data
npm run verify:proofs
```

### Point-in-Time Recovery
```bash
# 1. Create checkpoint
mkdir -p recovery-checkpoint
cp -r kb-src/out recovery-checkpoint/

# 2. Identify target date
node scripts/restore.mjs  # List backups with dates

# 3. Restore to date
node scripts/restore.mjs --date "2026-10-25T12:00:00Z"

# 4. Verify
npm run verify
```

---

## Troubleshooting

### "No changes detected"
✅ **Normal** - Incremental backup found no changed files

### "Source not found"
❌ Check CONFIG.sources paths in backup.mjs

### "Hash mismatch"
❌ File corrupted - try previous backup or re-run backup

### "Decompression failed"
❌ Backup file corrupted - use different backup

### "Manifest not found"
❌ Incomplete backup - use previous backup

---

## Monitoring

### Check Backup Health
```bash
# Latest backup age
ls -lht backups/local/ | head -5

# Verify integrity
npm run backup:verify -- --quick

# Check backup chain
node scripts/verify-backup.mjs
```

### Alert Conditions
- ⚠️ No backup in 36 hours
- ⚠️ Verification failures
- ⚠️ Storage < 20% free
- 🚨 No backup in 48 hours
- 🚨 Multiple verification failures
- 🚨 Broken backup chain

---

## Testing

### Manual Backup Test
```bash
# Run backup
npm run backup

# Verify
npm run backup:verify -- --quick

# Check report
cat backups/local/backup-*/backup-report.json
```

### Manual Restore Test
```bash
# Create test directory
mkdir -p test-restore

# Dry run
RESTORE_TARGET="test-restore" node scripts/restore.mjs --latest --dry-run

# Actual restore
RESTORE_TARGET="test-restore" node scripts/restore.mjs --latest

# Verify
cd test-restore
npm run check-data
```

### Quarterly DR Drill
1. Schedule maintenance window
2. Simulate data loss
3. Execute restore procedure
4. Measure recovery time
5. Update DR playbook

---

## Performance

### Backup Performance
- Scan: ~100 files/second
- Compression: ~5-10 MB/second
- Full backup: 30-60 seconds
- Incremental: 10-20 seconds

### Restore Performance
- Decompression: ~20-30 MB/second
- Verification: ~15-20 MB/second
- Full restore: 1-2 minutes
- PITR: 2-5 minutes

---

## Integration

### Pre-commit Hook
```bash
# .git/hooks/pre-commit
#!/bin/bash
# Verify data integrity before commit
node scripts/check-data.mjs || exit 1
```

### CI/CD Pipeline
```yaml
# .github/workflows/backup.yml
name: Backup Verification
on:
  schedule:
    - cron: '0 3 * * 0'  # Weekly on Sunday
jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Verify Latest Backup
        run: npm run backup:verify -- --quick
```

---

## Documentation

- **Disaster Recovery Playbook:** `DR_PLAYBOOK.md` - Complete recovery procedures
- **Backup Strategy:** `BACKUP_STRATEGY.md` - Architecture and planning
- **Script Documentation:** This file

---

## Support

For disaster recovery procedures and detailed recovery scenarios, see:
- `DR_PLAYBOOK.md` - 5 recovery scenarios with step-by-step procedures
- `BACKUP_STRATEGY.md` - Strategy overview and best practices

Run `npm run dr:help` for quick reference.

---

**Last Updated:** 2026-11-02  
**Version:** 1.0.0
