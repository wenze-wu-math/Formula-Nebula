# CI/CD Pipeline Setup Guide

Complete CI/CD pipeline for Formula Nebula with GitHub Actions.

## Quick Start

### 1. Prerequisites

```bash
# Required
- GitHub repository
- Node.js 18+ installed locally

# Optional
- Snyk account (for security scanning)
- Slack workspace (for notifications)
- Docker Hub or GitHub Container Registry access
```

### 2. Enable Workflows

Workflows are automatically enabled when merged to main branch. No additional setup required.

### 3. Configure Secrets (Optional)

Go to: **Repository Settings → Secrets and variables → Actions → New repository secret**

```bash
# Security Scanning (optional)
SNYK_TOKEN=your-snyk-token-here

# Notifications (optional)
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/T.../B.../xxx

# Deployment (optional)
STAGING_API_URL=https://staging-api.formula-nebula.dev
PRODUCTION_API_URL=https://api.formula-nebula.dev
```

---

## Pipeline Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Push/PR Trigger                         │
└────────────┬─────────────────────────────────┬──────────────┘
             │                                 │
             v                                 v
    ┌─────────────────┐              ┌─────────────────┐
    │  Test Workflow  │              │ Build & Security │
    │                 │              │                 │
    │ • Lint          │              │ • Security Scan │
    │ • Unit Tests    │              │ • Coverage      │
    │ • Build Check   │              │ • Bundle Size   │
    │ • Browser Tests │              │ • Snyk (opt)    │
    └────────┬────────┘              └────────┬────────┘
             │                                 │
             └───────────────┬─────────────────┘
                             v
                  ┌────────────────────┐
                  │   All Checks Pass  │
                  └──────────┬─────────┘
                             │
                  ┌──────────┴─────────────┐
                  │                        │
                  v                        v
         ┌──────────────┐         ┌──────────────┐
         │Deploy: Docker│         │   Benchmark   │
         │              │         │   (Nightly)   │
         │ • Build Image│         │               │
         │ • Push to Reg│         │ • Chromium    │
         │ • Staging    │         │ • Firefox     │
         │ • Production │         │ • Regression  │
         └──────────────┘         └──────────────┘
```

---

## Workflows Breakdown

### 1. Test Workflow (test.yml)

**Runs on:** Every push and PR

**Duration:** ~15-25 minutes

**Jobs:**

#### Lint (2-3 min)
```bash
✓ Prettier format check
✓ ESLint (if configured)
```

#### Test Matrix (5-10 min per version)
```bash
Node.js: 18, 20, 22
✓ Data integrity verification
✓ Full verification suite
```

#### Build Matrix (5-8 min per version)
```bash
Node.js: 18, 20, 22
✓ Production build
✓ Artifact verification
✓ Upload build artifacts
```

#### Browser Tests (8-12 min per browser)
```bash
Browsers: Chromium, Firefox
✓ Performance profiling
✓ Visual regression
✓ Load time metrics
```

**Artifacts:**
- `dist-{sha}` (7 days)

---

### 2. Build & Security Workflow (build.yml)

**Runs on:** Push to main, PRs to main

**Duration:** ~10-20 minutes

**Jobs:**

#### Security Scan (3-5 min)
```bash
✓ npm audit (moderate threshold)
✓ Dependency review
✓ Vulnerability blocking (high severity)
```

#### Snyk Scan (4-6 min, optional)
```bash
✓ Advanced vulnerability detection
✓ License compliance
✓ High severity threshold
```

#### Coverage Report (6-10 min)
```bash
✓ Verification output analysis
✓ Coverage report generation
✓ PR comment with stats
```

#### Bundle Analysis (5-8 min)
```bash
✓ Bundle size tracking
✓ 10MB size limit
✓ PR comment with breakdown
```

**Artifacts:**
- `security-audit-{sha}` (30 days)
- `coverage-report-{sha}` (30 days)
- `build-output-{sha}` (7 days)

---

### 3. Deploy Workflow (deploy.yml)

**Runs on:** Push to main, version tags, PRs, manual

**Duration:** ~15-35 minutes

**Jobs:**

#### Build Docker (10-20 min)
```bash
✓ Multi-arch: amd64, arm64
✓ Push to ghcr.io
✓ Cache optimization
✓ Multi-tag strategy
```

#### Deploy to Staging (5-10 min)
```bash
Triggers: Pull Requests
✓ PR preview environment
✓ Auto-generate preview URL
✓ Post comment to PR
✓ Smoke tests
```

#### Deploy to Production (8-15 min)
```bash
Triggers: main branch, v* tags
✓ Production deployment
✓ Health checks
✓ Success notification
```

#### Rollback (3-5 min)
```bash
Triggers: Production failure
✓ Automatic revert
✓ Notification
```

**Docker Tags Generated:**
```
ghcr.io/user/formula-nebula:main
ghcr.io/user/formula-nebula:pr-123
ghcr.io/user/formula-nebula:v1.2.3
ghcr.io/user/formula-nebula:1.2
ghcr.io/user/formula-nebula:1
ghcr.io/user/formula-nebula:main-abc1234
ghcr.io/user/formula-nebula:latest
```

---

### 4. Performance Benchmarks (benchmark.yml)

**Runs on:** 
- Nightly at 2:30 AM UTC
- Push to main (src/ changes)
- Manual trigger

**Duration:** ~20-30 minutes

**Jobs:**

#### Benchmark (10-15 min per browser)
```bash
Browsers: Chromium, Firefox
Metrics:
  ✓ Page load time
  ✓ MathJax rendering (464 formulas)
  ✓ Memory footprint
  ✓ Draw calls
  ✓ FPS
```

#### Compare Results (3-5 min)
```bash
✓ Historical comparison
✓ Regression detection
✓ Threshold validation
✓ Commit results to repo
```

#### Alert on Regression (1-2 min)
```bash
✓ Create GitHub issue
✓ Slack notification
✓ Label: performance-regression
```

**Performance Thresholds:**
```yaml
MAX_LOAD_TIME: 10000ms   # 10 seconds
MAX_MEMORY: 512MB        # 512 megabytes
```

**Artifacts:**
- `benchmark-{browser}-{sha}` (90 days)
- `comparison-report-{sha}` (90 days)
- `benchmark-summary-{sha}` (90 days)

---

## Docker Configuration

### Dockerfile Features

- **Multi-stage build**: Separates build and runtime
- **Non-root user**: Security best practice
- **Health checks**: Built-in monitoring
- **Nginx Alpine**: Lightweight (~10MB base)
- **Optimized layers**: Faster builds

### Build and Run Locally

```bash
# Build image
docker build -t formula-nebula:local .

# Run container
docker run -p 8080:8080 formula-nebula:local

# Test health check
curl http://localhost:8080/health

# View application
open http://localhost:8080
```

### Image Size Optimization

```bash
# Check image size
docker images formula-nebula:local

# Expected size: ~50-80MB

# Breakdown:
# - nginx:alpine base: ~10MB
# - Application assets: ~40-70MB
```

---

## Environment Setup

### Staging Environment

Create in: **Repository Settings → Environments → New environment**

```yaml
Name: staging-pr-{number}
URL: https://staging-pr-{number}.formula-nebula.dev
Protection rules: None
Secrets:
  - STAGING_API_URL (optional)
```

### Production Environment

```yaml
Name: production
URL: https://formula-nebula.dev
Protection rules:
  - Required reviewers: 1+
  - Wait timer: 5 minutes (optional)
  - Deployment branches: main only
Secrets:
  - PRODUCTION_API_URL (optional)
```

---

## Notification Setup

### Slack Integration

#### 1. Create Incoming Webhook

```bash
# In Slack
1. Go to: https://api.slack.com/apps
2. Create New App → From scratch
3. Name: "Formula Nebula CI/CD"
4. Select workspace
5. Add Features → Incoming Webhooks
6. Activate: ON
7. Add New Webhook to Workspace
8. Select channel: #ci-cd or #deployments
9. Copy webhook URL
```

#### 2. Add to GitHub

```bash
# In GitHub
1. Repository Settings
2. Secrets and variables → Actions
3. New repository secret
4. Name: SLACK_WEBHOOK_URL
5. Value: https://hooks.slack.com/services/T.../B.../xxx
6. Add secret
```

#### 3. Test Notification

```bash
# Trigger manually
curl -X POST \
  -H 'Content-Type: application/json' \
  --data '{"text":"Test from Formula Nebula CI/CD"}' \
  YOUR_WEBHOOK_URL
```

### Notification Events

| Event | Workflow | When |
|-------|----------|------|
| Build status | build.yml | PR completion |
| Deployment success | deploy.yml | Production deploy |
| Deployment failure | deploy.yml | Production failure |
| Rollback initiated | deploy.yml | After failure |
| Performance regression | benchmark.yml | Threshold exceeded |

---

## Secrets Management

### Required Secrets

None! Pipeline works out-of-the-box with default GitHub token.

### Optional Secrets

| Secret | Purpose | Where to Get |
|--------|---------|--------------|
| `SNYK_TOKEN` | Security scanning | [snyk.io](https://snyk.io) → Account Settings → API Token |
| `SLACK_WEBHOOK_URL` | Notifications | Slack App → Incoming Webhooks |
| `STAGING_API_URL` | Staging API endpoint | Your staging server URL |
| `PRODUCTION_API_URL` | Production API endpoint | Your production server URL |

### Setting Secrets

```bash
# Via GitHub UI
Repository → Settings → Secrets and variables → Actions → New secret

# Via GitHub CLI
gh secret set SNYK_TOKEN
gh secret set SLACK_WEBHOOK_URL
gh secret set STAGING_API_URL
gh secret set PRODUCTION_API_URL

# List secrets
gh secret list
```

---

## Monitoring & Observability

### GitHub Actions Dashboard

```bash
# View workflow runs
Repository → Actions tab

# Filter by workflow
Click workflow name in left sidebar

# View specific run
Click on run → Expand jobs → View logs

# Download artifacts
Scroll to Artifacts section → Click to download
```

### Performance Tracking

**Benchmark History:**
- Location: `.benchmarks/` directory
- Frequency: Nightly + on-demand
- Retention: 90 days in artifacts, permanent in repo

**View trends:**
```bash
# Clone repo
git clone https://github.com/your-org/formula-nebula.git

# View benchmark history
ls -la .benchmarks/

# Compare benchmarks
diff .benchmarks/benchmark-chromium-20241101.md \
     .benchmarks/benchmark-chromium-20241102.md
```

### Health Monitoring

**Container health check:**
```bash
# Check health endpoint
curl http://localhost:8080/health

# Expected response
{"status":"ok","service":"formula-nebula"}

# Health check failures trigger automatic restarts
```

**Deployment health check:**
```yaml
# In deploy.yml
- name: Health check
  run: |
    curl -f https://formula-nebula.dev/health || exit 1
```

---

## Troubleshooting

### Common Issues

#### 1. Test Failures in CI (but pass locally)

**Symptom:** Tests pass on your machine but fail in GitHub Actions

**Causes:**
- Port conflicts
- Timing differences (headless browser)
- Missing environment variables

**Solutions:**
```bash
# Increase wait timeout
npx wait-on http://localhost:5176 -t 60000

# Use dedicated ports
NEBULA_PREVIEW_PORT=5176 npm run preview

# Add explicit delays
sleep 10
```

#### 2. Docker Build Fails

**Symptom:** Docker build succeeds locally but fails in CI

**Causes:**
- Platform differences (arm64 vs amd64)
- Missing files in .dockerignore
- Cache issues

**Solutions:**
```bash
# Build for specific platform
docker buildx build --platform linux/amd64 -t formula-nebula .

# Clear build cache
docker buildx prune -af

# Verify .dockerignore
cat .dockerignore
```

#### 3. Deployment Timeout

**Symptom:** Deployment hangs or times out

**Causes:**
- Health check misconfiguration
- Slow startup
- Network policies

**Solutions:**
```yaml
# Increase timeout
timeout-minutes: 30

# Add startup delay
sleep 30 && curl http://localhost:8080/health

# Check logs
docker logs formula-nebula
```

#### 4. High Bundle Size

**Symptom:** Build fails due to bundle size limit

**Causes:**
- Large dependencies
- Unoptimized assets
- Debug code in production

**Solutions:**
```bash
# Analyze bundle
npm run build
du -sh dist/

# Check large files
find dist/ -size +1M

# Optimize
# - Remove unused dependencies
# - Enable tree shaking
# - Compress assets
```

#### 5. Performance Regression Alerts

**Symptom:** Nightly benchmark creates issues

**Investigation:**
```bash
# Run benchmarks locally
npm run perf

# Check recent commits
git log --oneline -10

# Profile specific changes
git diff HEAD~5 HEAD

# Adjust thresholds if needed
# Edit .github/workflows/benchmark.yml
```

---

## Advanced Configuration

### Matrix Testing Customization

**Add OS variants:**
```yaml
strategy:
  matrix:
    os: [ubuntu-latest, windows-latest, macos-latest]
    node: [18, 20, 22]
runs-on: ${{ matrix.os }}
```

**Add browser variants:**
```yaml
strategy:
  matrix:
    browser: [chromium, firefox, webkit]
```

### Conditional Workflows

**Skip CI:**
```bash
git commit -m "docs: update README [skip ci]"
```

**Run only on specific paths:**
```yaml
on:
  push:
    paths:
      - 'src/**'
      - 'package.json'
```

### Dependency Caching

**Cache npm modules:**
```yaml
- uses: actions/cache@v3
  with:
    path: ~/.npm
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-node-
```

**Cache Playwright browsers:**
```yaml
- uses: actions/cache@v3
  with:
    path: ~/.cache/ms-playwright
    key: playwright-${{ hashFiles('**/package-lock.json') }}
```

### Deployment Strategies

**Blue-Green Deployment:**
```yaml
- name: Deploy to green
  run: ./deploy-to-green.sh

- name: Run smoke tests
  run: ./smoke-test.sh

- name: Switch traffic
  run: ./switch-to-green.sh
```

**Canary Deployment:**
```yaml
- name: Deploy canary (10%)
  run: ./deploy-canary.sh --percentage 10

- name: Monitor metrics
  run: ./monitor.sh --duration 5m

- name: Rollout full (100%)
  run: ./deploy-canary.sh --percentage 100
```

---

## Maintenance

### Regular Tasks

**Weekly:**
```bash
# Review security audit reports
gh run list --workflow=build.yml --limit=5

# Check artifact storage
gh api repos/:owner/:repo/actions/artifacts

# Monitor benchmark trends
cat .benchmarks/latest-comparison.md
```

**Monthly:**
```bash
# Update dependencies
npm update
npm audit fix

# Review workflow efficiency
# Check average duration trends

# Archive old artifacts
gh api --method DELETE repos/:owner/:repo/actions/artifacts/:id
```

**Quarterly:**
```bash
# Update Node.js versions
# Edit matrix in test.yml

# Review performance thresholds
# Edit benchmark.yml

# Audit secrets
gh secret list
# Remove unused secrets
```

### Updating Workflows

```bash
# Clone repo
git clone https://github.com/your-org/formula-nebula.git
cd formula-nebula

# Create branch
git checkout -b update-workflows

# Edit workflows
vi .github/workflows/test.yml

# Test locally (optional)
act -j test

# Commit and push
git add .github/workflows/
git commit -m "ci: update test workflow"
git push origin update-workflows

# Create PR
gh pr create --title "Update CI workflows" --body "Description"
```

---

## Performance Benchmarks

### Metrics Collected

```javascript
{
  "loadTime": 5234,          // milliseconds
  "mathJaxRenderTime": 3821, // milliseconds
  "formulasRendered": 464,
  "memoryUsed": 287,         // megabytes
  "drawCalls": 156,
  "fps": 60,
  "tti": 6123                // time to interactive (ms)
}
```

### Historical Tracking

```bash
# View benchmark history
ls .benchmarks/

# Compare two dates
diff .benchmarks/benchmark-chromium-20241101.md \
     .benchmarks/benchmark-chromium-20241102.md

# Plot trends (requires gnuplot)
./scripts/plot-benchmark-trends.sh
```

### Threshold Configuration

Edit `.github/workflows/benchmark.yml`:

```yaml
# Current thresholds
MAX_LOAD_TIME: 10000  # 10 seconds
MAX_MEMORY: 512       # 512 MB

# Adjust based on baseline
# Recommendation: 90th percentile + 20% margin
```

---

## Security Best Practices

### Workflow Security

```yaml
# Pin action versions to SHA
- uses: actions/checkout@8e5e7e5ab8b370d6c329ec480221332ada57f0ab

# Limit permissions
permissions:
  contents: read
  pull-requests: write

# Use environment secrets
env:
  API_KEY: ${{ secrets.PRODUCTION_API_KEY }}

# Never log secrets
- run: echo "Deploying..."
  # NOT: echo "Key: ${{ secrets.API_KEY }}"
```

### Container Security

```dockerfile
# Use specific versions
FROM node:20.11.0-alpine

# Non-root user
USER nebula

# Health checks
HEALTHCHECK CMD curl -f http://localhost:8080/health || exit 1

# Minimal attack surface
RUN rm -rf /var/cache/apk/*
```

### Dependency Security

```bash
# Regular audits
npm audit

# Fix vulnerabilities
npm audit fix

# Check licenses
npx license-checker --summary

# Update dependencies
npm update
```

---

## Cost Optimization

### GitHub Actions Usage

**Free tier:**
- Public repos: Unlimited
- Private repos: 2,000 minutes/month

**Current usage estimate:**
```
Per push: ~40 minutes (test + build)
Per PR: ~50 minutes (test + build + staging)
Nightly benchmark: ~30 minutes
Monthly: ~1,500-2,000 minutes (typical activity)
```

**Optimization tips:**
```yaml
# Cancel outdated runs
concurrency:
  cancel-in-progress: true

# Skip CI when appropriate
[skip ci] in commit message

# Reduce matrix size
matrix: { node: [20] }  # instead of [18, 20, 22]
```

### Artifact Storage

```bash
# Check current usage
gh api repos/:owner/:repo/actions/artifacts --jq '.total_count'

# Reduce retention
retention-days: 7  # instead of 90

# Delete old artifacts
gh api --method DELETE repos/:owner/:repo/actions/artifacts/:id
```

---

## Migration Guide

### From Travis CI

```yaml
# Travis: .travis.yml
language: node_js
node_js: - "18"

# GitHub Actions: .github/workflows/test.yml
jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node: [18]
```

### From CircleCI

```yaml
# CircleCI: .circleci/config.yml
jobs:
  build:
    docker:
      - image: node:18

# GitHub Actions: .github/workflows/test.yml
jobs:
  build:
    runs-on: ubuntu-latest
    container: node:18
```

### From GitLab CI

```yaml
# GitLab: .gitlab-ci.yml
test:
  script:
    - npm test

# GitHub Actions: .github/workflows/test.yml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - run: npm test
```

---

## Resources

### Documentation
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Workflow Syntax](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions)
- [Docker Documentation](https://docs.docker.com/)
- [Nginx Configuration](https://nginx.org/en/docs/)

### Tools
- [act](https://github.com/nektos/act) - Run Actions locally
- [actionlint](https://github.com/rhysd/actionlint) - Workflow linter
- [gh CLI](https://cli.github.com/) - GitHub command line

### Community
- [GitHub Actions Community](https://github.community/c/code-to-cloud/github-actions/41)
- [Awesome Actions](https://github.com/sdras/awesome-actions)

---

## Support

**Issues:** Create issue with `ci/cd` label
**Questions:** Start a discussion in Discussions tab
**Documentation:** See `.github/workflows/README.md`

---

**Last Updated:** 2024-11-02
**Version:** 1.0.0
