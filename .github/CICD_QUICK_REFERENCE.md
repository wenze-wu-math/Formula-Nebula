# CI/CD Quick Reference

One-page reference for Formula Nebula CI/CD pipeline.

## Workflows

| Workflow | Trigger | Duration | Purpose |
|----------|---------|----------|---------|
| **test.yml** | Push, PR | ~20 min | Lint, test, build, browser tests |
| **build.yml** | Push to main, PR | ~15 min | Security scan, coverage, bundle analysis |
| **deploy.yml** | Push to main, tags, PR | ~25 min | Docker build, staging, production |
| **benchmark.yml** | Nightly 2:30 AM UTC | ~30 min | Performance tracking, regression detection |

## Quick Commands

```bash
# View workflow runs
gh run list

# Watch active run
gh run watch

# Re-run failed jobs
gh run rerun <run-id>

# Download artifacts
gh run download <run-id>

# View logs
gh run view <run-id> --log

# Trigger manual run
gh workflow run benchmark.yml

# List secrets
gh secret list

# Set secret
gh secret set SLACK_WEBHOOK_URL
```

## Workflow Status Badges

Add to README.md:

```markdown
[![Test](https://github.com/USER/REPO/workflows/Test/badge.svg)](https://github.com/USER/REPO/actions/workflows/test.yml)
[![Build](https://github.com/USER/REPO/workflows/Build%20%26%20Security/badge.svg)](https://github.com/USER/REPO/actions/workflows/build.yml)
[![Deploy](https://github.com/USER/REPO/workflows/Deploy/badge.svg)](https://github.com/USER/REPO/actions/workflows/deploy.yml)
```

## Docker Commands

```bash
# Build locally
docker build -t formula-nebula:local .

# Run container
docker run -p 8080:8080 formula-nebula:local

# Check health
curl http://localhost:8080/health

# View logs
docker logs formula-nebula

# Shell into container
docker exec -it formula-nebula sh

# Pull from registry
docker pull ghcr.io/USER/REPO:latest

# Stop container
docker stop formula-nebula
```

## Secrets Required

| Secret | Required? | Purpose |
|--------|-----------|---------|
| `GITHUB_TOKEN` | ✅ Auto | Registry authentication |
| `SNYK_TOKEN` | ❌ Optional | Security scanning |
| `SLACK_WEBHOOK_URL` | ❌ Optional | Notifications |
| `STAGING_API_URL` | ❌ Optional | Staging deployment |
| `PRODUCTION_API_URL` | ❌ Optional | Production deployment |

## Common Issues

| Issue | Solution |
|-------|----------|
| Tests fail in CI | Increase timeout: `npx wait-on -t 60000` |
| Docker build fails | Clear cache: `docker buildx prune -af` |
| Bundle too large | Check: `find dist/ -size +1M` |
| Performance regression | Review: `.benchmarks/latest-comparison.md` |
| Port conflict | Check: `lsof -i :5176` |

## Environment URLs

```bash
# Staging (per PR)
https://staging-pr-123.formula-nebula.dev

# Production
https://formula-nebula.dev

# Health check
https://formula-nebula.dev/health
```

## Matrix Testing

```yaml
# Current matrix
Node.js: [18, 20, 22]
Browsers: [chromium, firefox]
Platforms: [ubuntu-latest]

# Customize in:
.github/workflows/test.yml
```

## Performance Thresholds

```yaml
MAX_LOAD_TIME: 10000ms  # 10 seconds
MAX_MEMORY: 512MB       # 512 megabytes

# Adjust in:
.github/workflows/benchmark.yml
```

## Artifact Retention

| Type | Retention |
|------|-----------|
| Build output | 7 days |
| Security audit | 30 days |
| Coverage reports | 30 days |
| Benchmarks | 90 days |

## Useful Links

- [Full Documentation](../CICD.md)
- [Workflow Details](workflows/README.md)
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Docker Hub](https://hub.docker.com/)

## Emergency Procedures

### Rollback Production

```bash
# Via GitHub UI
1. Go to Actions → Deploy workflow
2. Find last successful run
3. Click "Re-run all jobs"

# Via kubectl (if using K8s)
kubectl rollout undo deployment/formula-nebula
```

### Disable Workflow

```yaml
# Add to workflow file
on:
  push:
    branches-ignore:
      - '**'
```

### Skip CI

```bash
git commit -m "fix: urgent hotfix [skip ci]"
```

## Monitoring

```bash
# Check workflow status
gh run list --workflow=test.yml --limit=10

# View benchmark trends
cat .benchmarks/latest-comparison.md

# Check bundle size
du -sh dist/

# View security audit
gh run download <run-id> -n security-audit-xxx
```

## Support

**Issues:** Label with `ci/cd`
**Docs:** [CICD.md](../CICD.md)
**Slack:** #ci-cd channel (if configured)
