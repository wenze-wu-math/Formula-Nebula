# Backup Strategy & Recovery Procedures

## Overview

Formula Nebula implements a comprehensive, production-grade backup and disaster recovery system designed to protect the mathematical knowledge graph data against various failure scenarios.

## System Components

### 1. **backup.mjs** - Automated Backup Engine
- **Daily automated snapshots** with configurable schedule
- **Incremental backups** (daily) + **full backups** (weekly)
- **Compression** using gzip (level 6) for optimal storage efficiency
- **Cross-region replication** support for geographic redundancy
- **Automated cleanup** based on retention policies
- **Manifest generation** with file hashes for integrity verification

### 2. **restore.mjs** - Recovery System
- **Point-in-time recovery** to any previous backup date
- **Selective file restoration** with filtering capabilities
- **Incremental restore** applies full backup + subsequent incremental changes
- **Hash verification** during restore to ensure data integrity
- **Interactive confirmation** to prevent accidental overwrites
- **Dry-run mode** to preview restore operations

### 3. **verify-backup.mjs** - Integrity Verification
- **Manifest validation** checks backup metadata completeness
- **File integrity verification** compares stored hashes
- **Restore capability testing** simulates actual recovery
- **Backup chain consistency** validates incremental backup sequences
- **Automated reporting** generates detailed verification reports

### 4. **DR_PLAYBOOK.md** - Disaster Recovery Procedures
- **5 recovery scenarios** with step-by-step procedures
- **RTO/RPO targets** for different data priorities
- **Decision trees** for incident response
- **Testing procedures** and validation checklists
- **Emergency contact information** and escalation paths

## Key Features

### Daily Snapshots
```javascript
// Automatically backs up:
- kb-src/out/          // Knowledge base data (~18 MB)
- .research/           // Research and citations
- designs/manuscript/  // Manuscript cache
```

### Compression & Efficiency
- **~60-70% compression ratio** on JSON data
- Typical backup: 18 MB → 6 MB compressed
- Minimal storage footprint with high data density

### Cross-Region Replication
```javascript
CONFIG.destinations = {
  local: 'backups/local',              // Primary backup
  remote: process.env.BACKUP_REMOTE_PATH,    // NAS/network storage
  crossRegion: process.env.BACKUP_CROSS_REGION_PATH  // Geographic redundancy
};
```

### Retention Policy
- **Daily incremental backups:** 7 days retention
- **Weekly full backups:** 30 days retention
- **Monthly snapshots:** 365 days retention

### Point-in-Time Recovery
Restore to any previous state by combining:
1. Most recent full backup before target date
2. All incremental backups between full and target
3. Sequential application maintains data consistency

## Quick Start

### Running Backups

```bash
# Manual backup (follows automatic schedule logic)
npm run backup

# Or directly with Node
node scripts/backup.mjs
```

**Backup Process:**
1. Determines if full or incremental backup needed (7-day cycle)
2. Scans configured source directories
3. Compares with previous backup (for incremental)
4. Compresses and copies changed files
5. Generates manifest with file hashes
6. Replicates to remote/cross-region locations
7. Cleans up old backups per retention policy

### Verifying Backups

```bash
# Quick verification (sample files)
npm run backup:verify -- --quick

# Full verification (all files)
npm run backup:verify -- --full

# Verify specific backup
npm run backup:verify -- --backup backup-full-2026-11-02T10-30-00
```

**Verification Process:**
1. Validates backup manifest structure
2. Checks file existence and sizes
3. Verifies file integrity via hash comparison
4. Tests restore capability with sample files
5. Validates backup chain consistency
6. Generates detailed verification report

### Restoring Data

```bash
# List available backups
npm run restore

# Restore latest backup
npm run restore:latest

# Restore specific backup
node scripts/restore.mjs --backup backup-full-2026-11-02T10-30-00

# Point-in-time restore to specific date
node scripts/restore.mjs --date "2026-10-25T12:00:00Z"

# Dry run (preview without making changes)
node scripts/restore.mjs --latest --dry-run
```

## Automated Scheduling

### Linux/macOS (crontab)

```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * cd /path/to/formula-nebula && node scripts/backup.mjs >> logs/backup.log 2>&1

# Weekly verification on Sundays at 3 AM
0 3 * * 0 cd /path/to/formula-nebula && node scripts/verify-backup.mjs --quick >> logs/verify.log 2>&1
```

### Windows (Task Scheduler)

```powershell
# Create daily backup task
schtasks /create /tn "Formula Nebula Backup" /tr "node D:\xiangmu\Formula Nebula\scripts\backup.mjs" /sc daily /st 02:00

# Create weekly verification task
schtasks /create /tn "Formula Nebula Verify" /tr "node D:\xiangmu\Formula Nebula\scripts\verify-backup.mjs --quick" /sc weekly /d SUN /st 03:00
```

## Configuration

### Environment Variables

```bash
# Primary backup location (default: backups/local)
export BACKUP_ROOT="backups/local"

# Remote backup location (NAS, network drive)
export BACKUP_REMOTE_PATH="/mnt/nas/formula-nebula-backups"

# Cross-region backup (cloud storage, secondary datacenter)
export BACKUP_CROSS_REGION_PATH="s3://formula-nebula-dr/backups"

# Restore target directory (default: current directory)
export RESTORE_TARGET="D:\xiangmu\Formula Nebula"
```

### Customizing Backup Sources

Edit `scripts/backup.mjs`:

```javascript
const CONFIG = {
  sources: [
    'kb-src/out',                    // Core knowledge base
    'kb-src/unsolvedmath-categories.json',
    'kb-src/unsolvedmath-problems.json',
    '.research',                     // Research data
    'designs/manuscript'             // Manuscript cache
    // Add more paths as needed
  ],
  
  retention: {
    daily: 7,      // Keep daily backups for 7 days
    weekly: 30,    // Keep weekly backups for 30 days
    monthly: 365   // Keep monthly backups for 1 year
  },
  
  incremental: {
    enabled: true,
    baselineInterval: 7  // Full backup every 7 days
  }
};
```

## Recovery Scenarios

### Scenario 1: Single File Corruption
**Symptoms:** One JSON file fails to parse  
**RTO:** 1-2 hours  
**Procedure:** Restore specific file from latest backup  

```bash
node scripts/restore.mjs --latest
# Confirm when prompted, or use --dry-run first
```

### Scenario 2: Complete Data Loss
**Symptoms:** Entire data directory missing/corrupted  
**RTO:** 4 hours  
**Procedure:** Full restore from latest backup

```bash
# Backup current state (if any data exists)
mkdir -p recovery-backup
cp -r kb-src/out recovery-backup/

# Restore
npm run restore:latest

# Verify
npm run backup:verify -- --full
npm run check-data
```

### Scenario 3: Point-in-Time Recovery
**Symptoms:** Need to revert to previous state  
**RTO:** 6 hours  
**Procedure:** Restore to specific date

```bash
# Create checkpoint of current state
mkdir -p recovery-checkpoint
cp -r kb-src/out recovery-checkpoint/

# Restore to target date
node scripts/restore.mjs --date "2026-10-25T12:00:00Z"

# Verify
npm run verify
```

### Scenario 4: Cross-Region Failover
**Symptoms:** Primary datacenter unavailable  
**RTO:** 2 hours  
**Procedure:** Switch to cross-region backup

```bash
# Point to secondary region
export BACKUP_ROOT="$BACKUP_CROSS_REGION_PATH"

# Restore from secondary
node scripts/restore.mjs --latest
```

### Scenario 5: Security Incident
**Symptoms:** Ransomware, unauthorized access  
**RTO:** 8 hours  
**Procedure:** Restore from clean backup before incident

```bash
# ISOLATE system immediately
# Find clean backup BEFORE incident
node scripts/restore.mjs

# Restore to isolated location
export RESTORE_TARGET="secure-recovery/restored-data"
node scripts/restore.mjs --backup <clean-backup>

# Verify integrity
node scripts/verify-backup.mjs --full

# Scan for malware before production restore
```

**See DR_PLAYBOOK.md for detailed procedures**

## Performance Characteristics

### Backup Performance
- **Scan rate:** ~100 files/second
- **Compression:** ~5-10 MB/second (depends on CPU)
- **Typical backup time:** 30-60 seconds for full backup
- **Incremental backup:** 10-20 seconds (changed files only)

### Restore Performance
- **Decompression:** ~20-30 MB/second
- **Hash verification:** ~15-20 MB/second
- **Typical restore time:** 1-2 minutes for full restore
- **Point-in-time restore:** 2-5 minutes (full + incrementals)

### Storage Requirements
- **Raw data:** ~18 MB
- **Compressed backup:** ~6 MB
- **7 daily incremental backups:** ~10-15 MB (total)
- **4 weekly full backups:** ~24 MB (total)
- **12 monthly snapshots:** ~72 MB (total)
- **Total annual storage:** ~110 MB

## Monitoring & Alerting

### Health Checks

```bash
# Check latest backup age
ls -lht backups/local/ | head -5

# Verify backup manifest
node scripts/verify-backup.mjs --quick

# Check backup integrity
node scripts/verify-backup.mjs --full
```

### Recommended Monitoring

1. **Daily:** Automated backup completion status
2. **Weekly:** Quick verification of latest backup
3. **Monthly:** Full verification including restore test
4. **Quarterly:** Complete disaster recovery drill

### Alert Conditions

- ⚠️ Backup age > 36 hours
- ⚠️ Verification failures
- ⚠️ Storage capacity < 20%
- 🚨 No successful backup in 48 hours
- 🚨 Multiple verification failures
- 🚨 Backup chain broken

## Best Practices

### Daily Operations
1. ✅ Run automated backups during low-activity hours
2. ✅ Monitor backup logs for errors
3. ✅ Keep at least 7 days of incremental backups
4. ✅ Verify backups regularly

### Security
1. 🔒 Encrypt backups at rest (filesystem-level)
2. 🔒 Restrict backup directory permissions
3. 🔒 Separate backup credentials from production
4. 🔒 Test restore from cold backup quarterly

### Disaster Recovery
1. 📋 Review DR playbook quarterly
2. 📋 Update contact information
3. 📋 Conduct recovery drills
4. 📋 Document all recovery incidents

### Storage Management
1. 💾 Monitor disk space usage
2. 💾 Adjust retention policies as needed
3. 💾 Archive old backups to cold storage
4. 💾 Verify cross-region replication working

## Testing & Validation

### Post-Backup Validation

```bash
# After each backup, verify:
npm run backup:verify -- --quick

# Check data integrity
npm run check-data
```

### Post-Restore Validation

```bash
# After any restore, run:
npm run verify              # Full verification suite
npm run check-data          # Data integrity
npm run verify:proofs       # Proof verification

# Manual testing
npm run dev                 # Start application
# Verify in browser:
# - All datasets load
# - Search works
# - Visualization renders
# - No console errors
```

### Quarterly DR Drill

1. Schedule maintenance window
2. Simulate data loss scenario
3. Execute recovery procedure
4. Measure RTO/RPO achieved
5. Document lessons learned
6. Update DR playbook

## Troubleshooting

### Backup Fails

**"No changes detected"**
- Normal for incremental backup when no files changed
- Full backup runs on schedule (every 7 days)

**"Source not found"**
- Check CONFIG.sources paths in backup.mjs
- Verify directories exist

**"Compression failed"**
- Check disk space
- Verify write permissions
- Check file locks

### Restore Fails

**"Backup manifest not found"**
- Backup may be corrupted
- Try previous backup
- Run verification on backup

**"Hash mismatch"**
- File corrupted during backup or storage
- Try restore with --no-verify (skip hash check)
- Re-run backup to replace corrupted backup

**"Decompression failed"**
- Backup file corrupted
- Storage media issue
- Try different backup version

### Verification Fails

**"Missing files"**
- Backup incomplete
- Re-run backup
- Check backup process logs

**"Corrupted files"**
- Storage media issue
- Re-run backup immediately
- Check cross-region backup

**"Restore test failed"**
- Permissions issue
- Disk space
- Check error details in verification report

## Support & Documentation

- **Disaster Recovery Playbook:** `DR_PLAYBOOK.md`
- **Backup Scripts:** `scripts/backup.mjs`, `scripts/restore.mjs`, `scripts/verify-backup.mjs`
- **Quick Reference:** Run `npm run dr:help`
- **Issues:** Check backup logs in `backups/*/backup-report.json`

## Revision History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-11-02 | Initial backup strategy documentation |

---

**Remember:** The best backup is one that has been tested and verified!

Run a test restore quarterly to ensure your recovery procedures work when you need them.
