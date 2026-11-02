# CI/CD Pipeline Documentation

This directory contains GitHub Actions workflows for the Formula Nebula project.

## Workflows Overview

### 1. Test Workflow (`test.yml`)

**Trigger:** Push to main/develop, Pull Requests

**Purpose:** Run comprehensive tests on every code change

**Jobs:**
- **lint**: Code style and formatting checks
  - Prettier formatting validation
  - ESLint (if configured)
  - Runs on: ubuntu-latest
  - Duration: ~2-3 minutes

- **test**: Matrix testing across Node.js versions
  - Node versions: 18, 20, 22
  - Data integrity verification (`npm run check-data`)
  - Full verification suite (`npm run verify`)
  - Runs on: ubuntu-latest
  - Duration: ~5-10 minutes per version

- **build**: Build verification across Node.js versions
  - Node versions: 18, 20, 22
  - Production build test
  - Artifact verification
  - Uploads build artifacts (Node 20 only)
  - Runs on: ubuntu-latest
  - Duration: ~5-8 minutes per version

- **browser-test**: Cross-browser testing
  - Browsers: Chromium, Firefox
  - Performance profiling (`probe-perf.mjs`)
  - Visual rendering verification
  - Runs on: ubuntu-latest with Playwright
  - Duration: ~8-12 minutes per browser

- **all-checks-passed**: Gate job
  - Ensures all checks pass before merging
  - Provides clear success/failure status

**Configuration:**
```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true  # Cancel outdated runs on new pushes
```

---

### 2. Build & Security Workflow (`build.yml`)

**Trigger:** Pull Requests to main, Push to main

**Purpose:** Security scanning and coverage reporting

**Jobs:**
- **security-scan**: Vulnerability detection
  - npm audit (moderate level threshold)
  - Dependency review for PRs
  - High-severity vulnerability blocking
  - Audit report artifacts (30-day retention)
  - Runs on: ubuntu-latest
  - Duration: ~3-5 minutes

- **snyk-scan**: Advanced security analysis (optional)
  - Requires `SNYK_TOKEN` secret
  - High-severity threshold
  - Runs on PRs only
  - Continue on error (non-blocking)
  - Runs on: ubuntu-latest
  - Duration: ~4-6 minutes

- **coverage**: Test coverage reporting
  - Verification output analysis
  - Coverage report generation
  - PR comments with coverage data
  - Runs on: ubuntu-latest
  - Duration: ~6-10 minutes

- **build-and-analyze**: Bundle size analysis
  - Production build
  - Bundle size tracking
  - 10MB size limit enforcement
  - PR comments with analysis
  - Build artifacts (7-day retention)
  - Runs on: ubuntu-latest
  - Duration: ~5-8 minutes

- **notify**: Slack notifications
  - Aggregates all job results
  - Posts to Slack on PR completion
  - Requires `SLACK_WEBHOOK_URL` secret
  - Runs on: ubuntu-latest
  - Duration: ~1 minute

**Required Secrets:**
- `SNYK_TOKEN` (optional): Snyk API token
- `SLACK_WEBHOOK_URL` (optional): Slack webhook for notifications

---

### 3. Deploy Workflow (`deploy.yml`)

**Trigger:** 
- Push to main branch
- Version tags (v*)
- Pull Requests to main
- Manual dispatch

**Purpose:** Build Docker images and deploy to staging/production

**Jobs:**
- **build-docker**: Multi-architecture Docker build
  - Platforms: linux/amd64, linux/arm64
  - Registry: GitHub Container Registry (ghcr.io)
  - Tags: branch, PR, semver, SHA, latest
  - BuildKit cache optimization
  - Runs on: ubuntu-latest
  - Duration: ~10-20 minutes

- **deploy-staging**: PR preview deployments
  - Triggers on: Pull Requests
  - Environment: staging-pr-{number}
  - Automatic PR comments with preview URL
  - Smoke tests after deployment
  - Runs on: ubuntu-latest
  - Duration: ~5-10 minutes

- **deploy-production**: Production deployments
  - Triggers on: main branch, version tags
  - Environment: production (with protection rules)
  - Health checks after deployment
  - Success/failure Slack notifications
  - Runs on: ubuntu-latest
  - Duration: ~8-15 minutes

- **rollback**: Automatic rollback on failure
  - Triggers only if production deployment fails
  - Reverts to previous stable version
  - Slack notification
  - Runs on: ubuntu-latest
  - Duration: ~3-5 minutes

**Required Secrets:**
- `GITHUB_TOKEN` (auto-provided): Container registry authentication
- `STAGING_API_URL` (optional): Staging API endpoint
- `PRODUCTION_API_URL` (optional): Production API endpoint
- `SLACK_WEBHOOK_URL` (optional): Slack notifications

**Environment Variables:**
- `REGISTRY`: ghcr.io
- `IMAGE_NAME`: ${{ github.repository }}

**Docker Image Tags:**
```
ghcr.io/owner/repo:main
ghcr.io/owner/repo:pr-123
ghcr.io/owner/repo:v1.2.3
ghcr.io/owner/repo:1.2
ghcr.io/owner/repo:1
ghcr.io/owner/repo:main-abc1234
ghcr.io/owner/repo:latest
```

---

### 4. Performance Benchmarks Workflow (`benchmark.yml`)

**Trigger:**
- Schedule: Daily at 2:30 AM UTC
- Manual dispatch
- Push to main (src/** changes)

**Purpose:** Track performance metrics and detect regressions

**Jobs:**
- **benchmark**: Performance profiling
  - Matrix: Chromium, Firefox
  - Metrics: Load time, memory usage, draw calls
  - 90-day artifact retention
  - Runs on: ubuntu-latest with Playwright
  - Duration: ~10-15 minutes per browser

- **compare**: Historical comparison
  - Baseline comparison
  - Regression detection
  - Performance thresholds:
    - Load time: 10 seconds
    - Memory: 512 MB
  - Commits results to `.benchmarks/` directory
  - Runs on: ubuntu-latest
  - Duration: ~3-5 minutes

- **alert**: Regression notifications
  - Triggers only on regression detection
  - Creates GitHub issue (or updates existing)
  - Slack alert
  - Issue labels: `performance-regression`, `automated`
  - Runs on: ubuntu-latest
  - Duration: ~1-2 minutes

- **report**: Summary generation
  - Aggregates all benchmark results
  - Posts to workflow summary
  - 90-day artifact retention
  - Runs on: ubuntu-latest
  - Duration: ~2-3 minutes

**Performance Thresholds:**
```javascript
MAX_LOAD_TIME: 10000ms  // 10 seconds
MAX_MEMORY: 512MB       // 512 megabytes
```

**Benchmark Metrics:**
- Page load time
- MathJax rendering time (464 formulas)
- Memory footprint
- WebGL draw calls
- Frame rate (FPS)
- Time to interactive (TTI)

---

## Configuration Requirements

### GitHub Secrets

Set these in: Repository Settings → Secrets and variables → Actions

**Required:**
- None (workflows work without secrets)

**Optional:**
```bash
SNYK_TOKEN              # Snyk security scanning
SLACK_WEBHOOK_URL       # Slack notifications
STAGING_API_URL         # Staging environment API
PRODUCTION_API_URL      # Production environment API
```

### Environment Setup

**Staging Environment:**
- Name: `staging-pr-{number}` (dynamic per PR)
- URL: `https://staging-pr-{number}.formula-nebula.dev`
- Protection: None
- Reviewers: Not required

**Production Environment:**
- Name: `production`
- URL: `https://formula-nebula.dev`
- Protection: Required reviewers recommended
- Reviewers: Add team leads

To configure environments:
1. Go to: Repository Settings → Environments
2. Click "New environment"
3. Set protection rules (for production)
4. Add required reviewers
5. Set environment secrets (if different from repo secrets)

---

## Workflow Permissions

Each workflow declares minimal required permissions:

**test.yml:**
```yaml
permissions: read-all  # Default, read-only
```

**build.yml:**
```yaml
permissions:
  contents: read
  security-events: write
  pull-requests: write
```

**deploy.yml:**
```yaml
permissions:
  contents: read
  packages: write
  deployments: write
```

**benchmark.yml:**
```yaml
permissions:
  contents: write
  issues: write
```

---

## Artifact Retention

| Artifact Type | Retention | Location |
|---------------|-----------|----------|
| Build output | 7 days | `dist-{sha}` |
| Security audit | 30 days | `security-audit-{sha}` |
| Coverage reports | 30 days | `coverage-report-{sha}` |
| Benchmarks | 90 days | `benchmark-{browser}-{sha}` |
| Comparison reports | 90 days | `comparison-report-{sha}` |

To download artifacts:
1. Go to workflow run
2. Scroll to "Artifacts" section
3. Click artifact name to download

---

## Slack Integration

### Webhook Setup

1. Create Slack webhook:
   - Go to Slack workspace settings
   - Create new incoming webhook
   - Select target channel
   - Copy webhook URL

2. Add to GitHub secrets:
   ```
   Name: SLACK_WEBHOOK_URL
   Value: https://hooks.slack.com/services/T.../B.../xxx...
   ```

### Notification Events

- **Build & Security**: PR build completion
- **Deploy**: Production deployment success/failure
- **Deploy**: Rollback initiated
- **Benchmark**: Performance regression detected

### Notification Format

```json
{
  "blocks": [
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*Workflow Status*\n**Repository:** owner/repo\n**Status:** ✅/❌"
      }
    }
  ]
}
```

---

## Caching Strategy

### npm Dependencies

All workflows use `actions/setup-node@v4` with cache:

```yaml
- uses: actions/setup-node@v4
  with:
    node-version: '20'
    cache: 'npm'
```

**Cache key:** Hash of `package-lock.json`
**Cache path:** `~/.npm`
**Benefit:** 30-60% faster dependency installation

### Docker Build Cache

Deploy workflow uses GitHub Actions cache:

```yaml
cache-from: type=gha
cache-to: type=gha,mode=max
```

**Benefit:** 50-80% faster Docker builds on cache hits

---

## Troubleshooting

### Test Failures

**Symptom:** Tests pass locally but fail in CI

**Common causes:**
1. Port conflicts (preview server)
2. Missing dependencies
3. Timing issues (headless browser)

**Solutions:**
```bash
# Check server port
lsof -i :5176

# Increase wait timeout
npx wait-on http://localhost:5176 -t 60000

# Add explicit delays
sleep 5
```

### Build Failures

**Symptom:** Build succeeds locally but fails in CI

**Common causes:**
1. Missing files in .dockerignore
2. Platform-specific dependencies
3. Memory limits

**Solutions:**
```dockerfile
# Increase Node memory
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Use alpine-compatible packages
RUN apk add --no-cache python3 make g++
```

### Deployment Failures

**Symptom:** Deployment hangs or times out

**Common causes:**
1. Health check misconfiguration
2. Network policies
3. Resource quotas

**Solutions:**
```yaml
# Increase timeout
timeout-minutes: 30

# Check health endpoint
curl -v http://localhost:8080/health

# Review deployment logs
kubectl logs -f deployment/formula-nebula
```

### Performance Regressions

**Symptom:** Benchmark workflow creates alerts

**Investigation steps:**
1. Review benchmark artifacts
2. Compare with baseline
3. Check recent commits
4. Profile locally:
   ```bash
   npm run perf
   ```

**Thresholds adjustment:**
Edit `.github/workflows/benchmark.yml`:
```yaml
MAX_LOAD_TIME=15000  # Increase to 15s
MAX_MEMORY=768       # Increase to 768MB
```

---

## Local Testing

### Test workflows locally with act

Install: `brew install act` or `choco install act-cli`

```bash
# Test the test workflow
act -j test

# Test with secrets
act -j deploy --secret-file .secrets

# Test specific job
act -j build-docker

# Dry run
act --dryrun
```

### Validate workflow syntax

```bash
# Install actionlint
brew install actionlint  # or download from GitHub

# Validate all workflows
actionlint .github/workflows/*.yml

# Auto-fix issues
actionlint -format '{{range $err := .}}::error file={{$err.Filepath}},line={{$err.Line}},col={{$err.Column}}::{{$err.Message}}{{end}}'
```

---

## Maintenance

### Regular Tasks

**Weekly:**
- Review security audit reports
- Check artifact storage usage
- Monitor benchmark trends

**Monthly:**
- Update dependencies
- Review and adjust performance thresholds
- Archive old benchmark data

**Quarterly:**
- Review workflow efficiency
- Update Node.js versions in matrix
- Optimize caching strategy

### Updating Dependencies

**In workflows:**
```yaml
# Update to latest major version
uses: actions/checkout@v4  # was v3

# Pin to specific version
uses: actions/checkout@v4.1.1

# Use SHA (most secure)
uses: actions/checkout@8e5e7e5ab8b370d6c329ec480221332ada57f0ab
```

**Security best practices:**
- Pin action versions
- Review action code for major updates
- Use official actions when possible
- Monitor Dependabot alerts

---

## Performance Optimization Tips

### Reduce Workflow Duration

1. **Parallel jobs:**
   ```yaml
   strategy:
     matrix:
       node: [18, 20, 22]
     max-parallel: 3
   ```

2. **Cache aggressively:**
   ```yaml
   - uses: actions/cache@v3
     with:
       path: ~/.npm
       key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
       restore-keys: |
         ${{ runner.os }}-node-
   ```

3. **Skip unnecessary steps:**
   ```yaml
   - name: Build
     if: github.event_name == 'push'
   ```

4. **Use concurrency:**
   ```yaml
   concurrency:
     group: ${{ github.workflow }}-${{ github.ref }}
     cancel-in-progress: true
   ```

### Reduce Artifact Storage

```yaml
# Shorter retention
retention-days: 7  # instead of 90

# Compress artifacts
- run: tar -czf dist.tar.gz dist/

# Delete old artifacts via API
```

---

## Migration Notes

### From v1 to v2

If upgrading from an older CI setup:

1. **Update Node.js versions:**
   ```diff
   - node: [14, 16, 18]
   + node: [18, 20, 22]
   ```

2. **Update action versions:**
   ```diff
   - uses: actions/checkout@v3
   + uses: actions/checkout@v4
   ```

3. **Add security scanning:**
   - Configure Snyk token
   - Enable dependency review
   - Set up Slack notifications

4. **Configure environments:**
   - Create staging environment
   - Create production environment
   - Add protection rules

5. **Test thoroughly:**
   ```bash
   # Test each workflow
   act -j test
   act -j build-docker
   act -j benchmark
   ```

---

## Support

**Issues:** Create issue with `ci/cd` label
**Documentation:** [Formula Nebula Wiki](../wiki)
**Actions Logs:** Workflow runs → Click run → View logs
