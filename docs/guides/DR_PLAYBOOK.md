# Disaster Recovery Playbook

## Formula Nebula - Knowledge Graph Recovery Procedures

**Version:** 1.0.0  
**Last Updated:** 2026-11-02  
**Maintainer:** Formula Nebula Team

---

## Table of Contents

1. [Overview](#overview)
2. [Recovery Objectives](#recovery-objectives)
3. [Backup Architecture](#backup-architecture)
4. [Recovery Scenarios](#recovery-scenarios)
5. [Step-by-Step Procedures](#step-by-step-procedures)
6. [Verification & Testing](#verification--testing)
7. [Emergency Contacts](#emergency-contacts)
8. [Post-Recovery Actions](#post-recovery-actions)

---

## Overview

This playbook provides comprehensive procedures for recovering the Formula Nebula knowledge graph system from various disaster scenarios. The system includes mathematical knowledge bases (MathLib, nLab, Stacks Project, zbMATH, Wikipedia) and associated research data.

### Critical Assets

- **Knowledge Base Data** (`kb-src/out/`)
  - `mathlib-files.json` (~6.2 MB) - MathLib theorem database
  - `mathlib-tree.json` (~785 KB) - MathLib hierarchy
  - `nlab-pages.json` (~2.5 MB) - nLab mathematical content
  - `stacks-results.json` (~8.5 MB) - Stacks Project data
  - `wikipedia-conjectures.json` (~59 KB) - Unsolved problems
  - `zbmath-authors.json` (~96 KB) - Author metadata

- **Research Data** (`.research/`)
  - Citations, cross-references, verification results

- **Manuscript Data** (`designs/manuscript/`)
  - Formula cache and design documents

### Recovery Time Objective (RTO)

- **Critical Priority (P0):** < 4 hours
- **High Priority (P1):** < 24 hours  
- **Medium Priority (P2):** < 72 hours
- **Low Priority (P3):** < 1 week

### Recovery Point Objective (RPO)

- **Daily incremental backups:** RPO ≤ 24 hours
- **Cross-region replication:** RPO ≤ 1 hour (with replication enabled)

---

## Recovery Objectives

### Service Level Agreements

| Component | RTO | RPO | Priority |
|-----------|-----|-----|----------|
| Knowledge Base (Core) | 4h | 24h | P0 |
| Research Data | 12h | 24h | P1 |
| Manuscript Data | 24h | 48h | P2 |
| Historical Backups | 72h | 7d | P3 |

---

## Backup Architecture

### Backup Strategy

```
┌─────────────────────────────────────────────┐
│           Source Data                       │
│  - kb-src/out/                             │
│  - .research/                              │
│  - designs/manuscript/                     │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│       Daily Automated Backup                │
│  - Full backup: Every 7 days               │
│  - Incremental: Daily                      │
│  - Compression: gzip level 6               │
└──────────────┬──────────────────────────────┘
               │
               ├──────────────┬──────────────┐
               ▼              ▼              ▼
       ┌──────────┐   ┌──────────┐  ┌──────────┐
       │  Local   │   │  Remote  │  │  Cross   │
       │  Backup  │   │  Backup  │  │  Region  │
       └──────────┘   └──────────┘  └──────────┘
         backups/     S3/Cloud      Geographic
          local/      Storage       Redundancy
```

### Retention Policy

- **Daily incremental backups:** 7 days
- **Weekly full backups:** 30 days
- **Monthly full backups:** 365 days

### Backup Verification

- **Automated verification:** After each backup
- **Manual audit:** Monthly
- **Restore testing:** Quarterly

---

## Recovery Scenarios

### Scenario 1: Single File Corruption

**Symptoms:**
- Specific JSON file fails to parse
- Application errors when loading particular dataset
- Hash verification failure

**Impact:** Low to Medium  
**RTO:** 1-2 hours  
**Recovery Procedure:** [See Section 5.1](#51-single-file-recovery)

---

### Scenario 2: Complete Data Loss

**Symptoms:**
- Entire `kb-src/out/` directory missing
- Multiple critical files corrupted
- Storage system failure

**Impact:** Critical  
**RTO:** 4 hours  
**Recovery Procedure:** [See Section 5.2](#52-complete-data-recovery)

---

### Scenario 3: Point-in-Time Recovery

**Symptoms:**
- Need to revert to specific date due to data quality issues
- Accidental bulk deletion
- Compromised data integrity

**Impact:** Medium to High  
**RTO:** 6 hours  
**Recovery Procedure:** [See Section 5.3](#53-point-in-time-recovery)

---

### Scenario 4: Cross-Region Failover

**Symptoms:**
- Primary datacenter unavailable
- Regional outage
- Network partition

**Impact:** High  
**RTO:** 2 hours  
**Recovery Procedure:** [See Section 5.4](#54-cross-region-failover)

---

### Scenario 5: Ransomware/Security Incident

**Symptoms:**
- Files encrypted by malware
- Unauthorized access detected
- Data tampering suspected

**Impact:** Critical  
**RTO:** 8 hours  
**Recovery Procedure:** [See Section 5.5](#55-security-incident-recovery)

---

## Step-by-Step Procedures

### 5.1 Single File Recovery

**Prerequisites:**
- Backup system accessible
- Sufficient disk space
- Network connectivity

**Steps:**

1. **Identify the corrupted file**
   ```bash
   # Check file integrity
   node scripts/verify-backup.mjs --quick
   ```

2. **List available backups**
   ```bash
   node scripts/restore.mjs
   ```

3. **Restore specific file from latest backup**
   ```bash
   # Set environment for targeted restore
   export RESTORE_TARGET="D:\xiangmu\Formula Nebula"
   
   # Restore latest backup (will prompt for confirmation)
   node scripts/restore.mjs --latest
   ```

4. **Verify restored file**
   ```bash
   # Check file hash
   node scripts/verify-backup.mjs --backup <backup-name>
   ```

5. **Test application functionality**
   ```bash
   npm run check-data
   ```

**Estimated Time:** 30-60 minutes

**Rollback Plan:** Keep original corrupted file as `.corrupted` backup until verification passes.

---

### 5.2 Complete Data Recovery

**Prerequisites:**
- Full backup available
- System access restored
- Adequate storage space

**Steps:**

1. **Assess damage scope**
   ```bash
   # Check what data exists
   ls -la kb-src/out/
   ls -la .research/
   ```

2. **Create damage report**
   ```bash
   # Document missing/corrupted files
   echo "Recovery started: $(date)" > recovery-log.txt
   ```

3. **Identify latest valid backup**
   ```bash
   node scripts/restore.mjs
   # Note the latest backup timestamp
   ```

4. **Perform full restore**
   ```bash
   # Backup current state (if any data exists)
   mkdir -p recovery-backup/$(date +%Y%m%d-%H%M%S)
   cp -r kb-src/out recovery-backup/$(date +%Y%m%d-%H%M%S)/ 2>/dev/null || true
   
   # Execute restore
   export RESTORE_TARGET="D:\xiangmu\Formula Nebula"
   node scripts/restore.mjs --latest --no-verify
   
   # Then verify after restore
   node scripts/verify-backup.mjs --full
   ```

5. **Verify data integrity**
   ```bash
   # Run comprehensive verification
   node scripts/check-data.mjs
   node scripts/verify-proofs.mjs
   ```

6. **Test all data sources**
   ```bash
   # Test each knowledge base
   npm run dev
   # Manually verify each dataset loads correctly
   ```

7. **Document recovery**
   ```bash
   echo "Recovery completed: $(date)" >> recovery-log.txt
   echo "Backup used: <backup-name>" >> recovery-log.txt
   echo "Files restored: <count>" >> recovery-log.txt
   ```

**Estimated Time:** 2-4 hours

**Critical Success Factors:**
- All JSON files parse correctly
- Total file count matches backup manifest
- No hash mismatches in verification
- Application loads all datasets successfully

---

### 5.3 Point-in-Time Recovery

**Use Cases:**
- Revert accidental bulk modifications
- Recover from data quality degradation
- Restore to known-good state

**Steps:**

1. **Determine target recovery point**
   ```bash
   # List backups with timestamps
   node scripts/restore.mjs
   
   # Identify the backup closest to desired timestamp
   ```

2. **Create checkpoint of current state**
   ```bash
   # Backup current state before recovery
   CHECKPOINT_DIR="recovery-checkpoint-$(date +%Y%m%d-%H%M%S)"
   mkdir -p "backups/${CHECKPOINT_DIR}"
   cp -r kb-src/out "backups/${CHECKPOINT_DIR}/"
   cp -r .research "backups/${CHECKPOINT_DIR}/"
   ```

3. **Perform point-in-time restore**
   ```bash
   # Restore to specific date
   export RESTORE_TARGET="D:\xiangmu\Formula Nebula"
   node scripts/restore.mjs --date "2026-10-25T12:00:00Z"
   ```

4. **Verify recovered state**
   ```bash
   # Verify backup integrity
   node scripts/verify-backup.mjs --full
   
   # Check data quality
   node scripts/check-data.mjs
   ```

5. **Compare with checkpoint**
   ```bash
   # Generate diff report
   diff -r "backups/${CHECKPOINT_DIR}/kb-src/out" kb-src/out > pit-recovery-diff.txt
   ```

6. **Test functionality**
   ```bash
   npm run dev
   # Verify expected state is restored
   ```

**Estimated Time:** 4-6 hours (including verification)

**Considerations:**
- Data created after recovery point will be lost
- Incremental backups between full backup and target date will be applied
- Always create checkpoint before PITR

---

### 5.4 Cross-Region Failover

**Prerequisites:**
- Cross-region replication configured
- Network connectivity to secondary region
- DNS/routing capabilities

**Steps:**

1. **Verify primary region status**
   ```bash
   # Attempt to access primary backup location
   ping <primary-backup-server>
   
   # Check backup availability
   ls -la backups/local/
   ```

2. **Activate secondary region**
   ```bash
   # Point to cross-region backup location
   export BACKUP_ROOT="$BACKUP_CROSS_REGION_PATH"
   
   # Verify backup availability
   node scripts/restore.mjs
   ```

3. **Restore from cross-region backup**
   ```bash
   export RESTORE_TARGET="D:\xiangmu\Formula Nebula"
   node scripts/restore.mjs --latest
   ```

4. **Update application configuration**
   ```bash
   # Update any region-specific settings
   # Modify backup paths in scripts/backup.mjs if needed
   ```

5. **Verify system operation**
   ```bash
   npm run verify
   npm run dev
   ```

6. **Monitor replication lag**
   ```bash
   # Check latest backup timestamp
   # Compare with expected RPO
   ```

7. **Document failover**
   ```bash
   echo "Failover executed: $(date)" > failover-log.txt
   echo "Primary: <primary-region>" >> failover-log.txt
   echo "Secondary: <secondary-region>" >> failover-log.txt
   echo "RPO achieved: <hours>" >> failover-log.txt
   ```

**Estimated Time:** 1-2 hours

**Recovery to Primary:**
Once primary region is restored:
1. Sync latest data to primary
2. Run backup in primary region
3. Verify primary backup integrity
4. Switch back to primary
5. Resume normal replication

---

### 5.5 Security Incident Recovery

**CRITICAL: Isolate system immediately upon detection**

**Steps:**

1. **Immediate Response**
   ```bash
   # STOP all automated processes
   # Disconnect from network if ransomware suspected
   
   # Document incident
   echo "Security incident detected: $(date)" > security-incident-log.txt
   ```

2. **Assess compromise scope**
   ```bash
   # Check file modification timestamps
   find kb-src/out -type f -mtime -1 -ls > recent-modifications.txt
   
   # Look for suspicious files
   find . -name "*.encrypted" -o -name "README.txt" > suspicious-files.txt
   ```

3. **Identify clean backup**
   ```bash
   # List backups BEFORE incident
   node scripts/restore.mjs
   
   # Verify backup integrity (use oldest recent backup)
   node scripts/verify-backup.mjs --backup <backup-before-incident>
   ```

4. **Secure clean restore environment**
   ```bash
   # Create isolated restore directory
   mkdir -p secure-recovery/$(date +%Y%m%d-%H%M%S)
   cd secure-recovery/$(date +%Y%m%d-%H%M%S)
   ```

5. **Restore from clean backup**
   ```bash
   # Restore to isolated location
   export RESTORE_TARGET="$(pwd)/restored-data"
   node ../../scripts/restore.mjs --backup <clean-backup> --no-verify
   ```

6. **Scan restored data**
   ```bash
   # Run antivirus/malware scan on restored files
   # Verify no malicious code injected
   
   # Check file integrity
   node ../../scripts/verify-backup.mjs --full
   ```

7. **Investigate root cause**
   - Review access logs
   - Check for unauthorized access
   - Identify vulnerability
   - Document findings

8. **Implement security fixes**
   - Patch vulnerabilities
   - Rotate credentials
   - Update access controls
   - Enable additional monitoring

9. **Restore to production (after security clearance)**
   ```bash
   # Copy cleaned data back
   cp -r restored-data/* ../../
   
   # Verify system integrity
   cd ../../
   npm run verify
   ```

10. **Post-incident monitoring**
    - Enable enhanced logging
    - Monitor for reinfection
    - Schedule security audit

**Estimated Time:** 8-24 hours (depending on incident severity)

**DO NOT:**
- ❌ Restore immediately without verification
- ❌ Connect compromised system to network
- ❌ Pay ransom (data may still be corrupted)
- ❌ Delete evidence before investigation

**DO:**
- ✅ Isolate affected systems immediately
- ✅ Preserve evidence for investigation
- ✅ Use backups from before incident
- ✅ Verify all restored data integrity
- ✅ Contact security team/authorities

---

## Verification & Testing

### Post-Recovery Verification Checklist

- [ ] All JSON files parse successfully
- [ ] File sizes match backup manifest
- [ ] Hash verification passes for all files
- [ ] Application starts without errors
- [ ] Each knowledge base loads correctly
  - [ ] MathLib (6.2 MB, ~XXX theorems)
  - [ ] nLab (2.5 MB, ~XXX pages)
  - [ ] Stacks Project (8.5 MB, ~XXX results)
  - [ ] Wikipedia (59 KB, ~XXX conjectures)
  - [ ] zbMATH (96 KB, ~XXX authors)
- [ ] Research data accessible
- [ ] Manuscript cache valid
- [ ] Search functionality works
- [ ] Visualization renders correctly
- [ ] No console errors in browser
- [ ] Performance within acceptable range

### Testing Commands

```bash
# Data integrity
node scripts/check-data.mjs

# Proof verification
node scripts/verify-proofs.mjs

# Performance check
node scripts/probe-perf.mjs

# Full verification suite
npm run verify

# Start application for manual testing
npm run dev
```

### Regression Testing

After recovery, perform these manual tests:

1. **Search Test:** Search for "Riemann hypothesis"
2. **Navigation Test:** Browse theorem hierarchy
3. **Visualization Test:** Load 3D knowledge graph
4. **Citation Test:** Check cross-references work
5. **Export Test:** Export data subset

### Performance Baselines

| Metric | Baseline | Acceptable | Action Required |
|--------|----------|------------|-----------------|
| Data load time | < 2s | < 5s | > 5s |
| Search response | < 100ms | < 300ms | > 300ms |
| Visualization FPS | > 45 | > 30 | < 30 |
| Memory usage | < 500MB | < 800MB | > 800MB |

---

## Emergency Contacts

### Internal Team

| Role | Contact | Availability |
|------|---------|--------------|
| System Administrator | admin@formula-nebula.org | 24/7 |
| Lead Developer | dev@formula-nebula.org | 9-5 weekdays |
| Security Officer | security@formula-nebula.org | 24/7 |
| Data Steward | data@formula-nebula.org | 9-5 weekdays |

### External Resources

| Service | Contact | Purpose |
|---------|---------|---------|
| Cloud Provider | support.cloud.com | Infrastructure issues |
| Security Consultant | security-firm.com | Incident response |
| Data Recovery Service | recovery-service.com | Catastrophic loss |

### Escalation Path

```
Level 1: System Admin (0-1h)
   ↓
Level 2: Lead Developer (1-4h)
   ↓
Level 3: Security Officer (4-8h)
   ↓
Level 4: External Consultants (8h+)
```

---

## Post-Recovery Actions

### Immediate (0-24 hours)

1. **Document incident**
   - What happened
   - When it was detected
   - Recovery actions taken
   - Time to recovery
   - Data loss quantified

2. **Notify stakeholders**
   - Users affected
   - Management
   - Regulatory bodies (if required)

3. **Verify restoration**
   - Run full verification suite
   - Manual testing
   - User acceptance testing

4. **Monitor stability**
   - Watch for recurring issues
   - Check system logs
   - Monitor performance metrics

### Short-term (1-7 days)

1. **Root cause analysis**
   - Investigate failure cause
   - Document findings
   - Identify contributing factors

2. **Implement preventive measures**
   - Fix underlying issues
   - Update procedures
   - Add monitoring

3. **Backup verification**
   - Test restore from new backup
   - Verify replication working
   - Update retention if needed

4. **Update documentation**
   - Revise DR playbook
   - Update recovery time estimates
   - Document lessons learned

### Long-term (1-4 weeks)

1. **Conduct post-mortem**
   - Team review meeting
   - Document timeline
   - Identify improvements

2. **Update disaster recovery plan**
   - Incorporate lessons learned
   - Revise RTO/RPO targets
   - Update contact information

3. **Schedule DR drill**
   - Test updated procedures
   - Train team members
   - Measure improvement

4. **Review backup strategy**
   - Assess adequacy
   - Consider additional redundancy
   - Evaluate costs vs. risks

---

## Backup Command Reference

### Creating Backups

```bash
# Manual full backup
node scripts/backup.mjs

# Set custom backup destination
export BACKUP_REMOTE_PATH="/mnt/remote-backup"
export BACKUP_CROSS_REGION_PATH="/mnt/cross-region"
node scripts/backup.mjs
```

### Restoring Backups

```bash
# List available backups
node scripts/restore.mjs

# Restore latest backup
node scripts/restore.mjs --latest

# Restore specific backup
node scripts/restore.mjs --backup backup-full-2026-11-02T10-30-00

# Point-in-time restore
node scripts/restore.mjs --date "2026-10-25T12:00:00Z"

# Dry run (show what would be restored)
node scripts/restore.mjs --latest --dry-run

# Skip hash verification (faster, less safe)
node scripts/restore.mjs --latest --no-verify
```

### Verifying Backups

```bash
# Verify latest backup
node scripts/verify-backup.mjs

# Verify specific backup
node scripts/verify-backup.mjs --backup backup-full-2026-11-02T10-30-00

# Quick verification (sample files only)
node scripts/verify-backup.mjs --quick

# Full verification (all files)
node scripts/verify-backup.mjs --full
```

### Environment Variables

```bash
# Backup source (default: current directory)
export BACKUP_SOURCE="D:\xiangmu\Formula Nebula"

# Primary backup destination
export BACKUP_ROOT="backups/local"

# Remote backup location
export BACKUP_REMOTE_PATH="/mnt/nas/formula-nebula-backups"

# Cross-region backup
export BACKUP_CROSS_REGION_PATH="s3://formula-nebula-dr/backups"

# Restore target directory
export RESTORE_TARGET="D:\xiangmu\Formula Nebula"
```

---

## Automated Backup Schedule

### Cron Configuration

Add to system crontab:

```cron
# Daily incremental backup at 2:00 AM
0 2 * * * cd /path/to/formula-nebula && node scripts/backup.mjs >> logs/backup.log 2>&1

# Weekly verification on Sundays at 3:00 AM
0 3 * * 0 cd /path/to/formula-nebula && node scripts/verify-backup.mjs --quick >> logs/verify.log 2>&1

# Monthly full verification on 1st of month at 4:00 AM
0 4 1 * * cd /path/to/formula-nebula && node scripts/verify-backup.mjs --full >> logs/verify-full.log 2>&1
```

### Windows Task Scheduler

```powershell
# Create daily backup task
schtasks /create /tn "Formula Nebula Backup" /tr "node D:\xiangmu\Formula Nebula\scripts\backup.mjs" /sc daily /st 02:00

# Create weekly verification task
schtasks /create /tn "Formula Nebula Verify" /tr "node D:\xiangmu\Formula Nebula\scripts\verify-backup.mjs --quick" /sc weekly /d SUN /st 03:00
```

---

## Recovery Metrics

Track these metrics for each recovery:

| Metric | Target | Measured | Status |
|--------|--------|----------|--------|
| Detection time | < 15 min | _____ | _____ |
| Response time | < 30 min | _____ | _____ |
| Recovery time | < RTO | _____ | _____ |
| Data loss | < RPO | _____ | _____ |
| Verification time | < 1 hour | _____ | _____ |
| Total downtime | < RTO + 1h | _____ | _____ |

---

## Appendix A: Backup File Structure

```
backups/
├── local/
│   ├── backup-full-2026-11-02T10-30-00/
│   │   ├── data/
│   │   │   ├── kb-src/
│   │   │   │   └── out/
│   │   │   │       ├── mathlib-files.json.gz
│   │   │   │       ├── mathlib-tree.json.gz
│   │   │   │       ├── nlab-pages.json.gz
│   │   │   │       ├── stacks-results.json.gz
│   │   │   │       ├── wikipedia-conjectures.json.gz
│   │   │   │       └── zbmath-authors.json.gz
│   │   │   ├── .research/
│   │   │   │   └── *.json.gz
│   │   │   └── designs/
│   │   │       └── manuscript/
│   │   │           └── *.json.gz
│   │   ├── manifest.json
│   │   ├── backup-report.json
│   │   └── verification-report.json
│   ├── backup-incremental-2026-11-03T10-30-00/
│   │   └── ...
│   └── latest-manifest.json (symlink to latest)
├── remote/
│   └── (mirrors local structure)
└── cross-region/
    └── (mirrors local structure)
```

---

## Appendix B: Recovery Decision Tree

```
Incident Detected
    │
    ├─> Single file issue?
    │   └─> Yes → Procedure 5.1 (Single File Recovery)
    │
    ├─> Multiple files affected?
    │   └─> Yes → Procedure 5.2 (Complete Data Recovery)
    │
    ├─> Need specific date?
    │   └─> Yes → Procedure 5.3 (Point-in-Time Recovery)
    │
    ├─> Regional outage?
    │   └─> Yes → Procedure 5.4 (Cross-Region Failover)
    │
    └─> Security incident?
        └─> Yes → Procedure 5.5 (Security Incident Recovery)
```

---

## Appendix C: Validation Tests

After any recovery, run this validation script:

```bash
#!/bin/bash
# validation-suite.sh

echo "=== Formula Nebula Recovery Validation ==="

# 1. File existence
echo "1. Checking file existence..."
test -f kb-src/out/mathlib-files.json && echo "✓ mathlib-files.json" || echo "✗ mathlib-files.json MISSING"
test -f kb-src/out/mathlib-tree.json && echo "✓ mathlib-tree.json" || echo "✗ mathlib-tree.json MISSING"
test -f kb-src/out/nlab-pages.json && echo "✓ nlab-pages.json" || echo "✗ nlab-pages.json MISSING"
test -f kb-src/out/stacks-results.json && echo "✓ stacks-results.json" || echo "✗ stacks-results.json MISSING"
test -f kb-src/out/wikipedia-conjectures.json && echo "✓ wikipedia-conjectures.json" || echo "✗ wikipedia-conjectures.json MISSING"
test -f kb-src/out/zbmath-authors.json && echo "✓ zbmath-authors.json" || echo "✗ zbmath-authors.json MISSING"

# 2. JSON validity
echo -e "\n2. Checking JSON validity..."
for file in kb-src/out/*.json; do
    if node -e "JSON.parse(require('fs').readFileSync('$file', 'utf8'))" 2>/dev/null; then
        echo "✓ $(basename $file)"
    else
        echo "✗ $(basename $file) INVALID JSON"
    fi
done

# 3. File sizes
echo -e "\n3. Checking file sizes..."
du -h kb-src/out/*.json

# 4. Application tests
echo -e "\n4. Running application tests..."
node scripts/check-data.mjs
node scripts/verify-proofs.mjs

echo -e "\n=== Validation Complete ==="
```

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-11-02 | System | Initial version with 5 recovery scenarios |

---

## Quick Reference Card

**EMERGENCY: Data Loss Detected**

1. ✋ **STOP** - Don't make changes  
2. 📋 **ASSESS** - Run `node scripts/restore.mjs` to see backups  
3. 🔄 **RESTORE** - Run `node scripts/restore.mjs --latest`  
4. ✅ **VERIFY** - Run `node scripts/verify-backup.mjs`  
5. 🧪 **TEST** - Run `npm run verify`  

**Need Help?** Contact: admin@formula-nebula.org (24/7)

---

*This playbook should be reviewed quarterly and updated after each recovery incident.*
