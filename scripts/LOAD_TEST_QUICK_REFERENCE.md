# Load Testing Quick Reference

## Quick Commands

```bash
# Generate simulated test results + capacity report
npm run capacity-report

# Run real load tests (requires k6)
npm run load-test:smoke    # 2 min, 10 users
npm run load-test          # 16 min, 100-1K users  
npm run load-test:stress   # 45 min, 1K-50K users

# Generate capacity plan from existing results
npm run capacity-plan
```

## Test Stages

| Stage | Duration | Users | Purpose |
|-------|----------|-------|---------|
| **smoke** | 2 min | 10 | Quick validation |
| **load** | 16 min | 100 → 1K | Normal load |
| **stress** | 45 min | 1K → 50K | Find limits |
| **spike** | 8 min | 100 ⚡ 10K | Sudden traffic |
| **soak** | 3+ hours | 1K sustained | Memory leaks |

## Performance Targets

| Metric | Target | Critical |
|--------|--------|----------|
| Response time p95 | < 500ms | > 1000ms |
| Error rate | < 1% | > 5% |
| Render time p95 | < 2000ms | > 2500ms |
| FPS p50 | > 30 | < 20 |
| Memory per user | < 0.5MB | > 1MB |

## Capacity @ 100K Users

| Component | Count | Specs |
|-----------|-------|-------|
| App servers | 1-2 | 4 cores, 4GB |
| WS servers | 2 | 2 cores, 2GB |
| Database | 1 | 8 cores, 16GB |
| Redis cache | 1 | 4 cores, 8GB |
| **Monthly cost** | | **$1,892** |

## Identified Bottlenecks

1. **Render Performance** [HIGH]
   - Current: 2200ms p95
   - Fix: Progressive loading, Web Workers, LOD

2. **Memory Usage** [HIGH]
   - Current: 0.5MB/user
   - Fix: Connection pooling, lazy loading

## Quick Wins

1. **CDN Implementation** → Save $500-1K/month
2. **Redis Caching** → 50-70% faster responses
3. **Bundle Optimization** → 30-40% faster load

## Auto-Scaling Rules

| Metric | Threshold | Action | Cooldown |
|--------|-----------|--------|----------|
| CPU | > 70% | +1 app server | 5 min |
| Memory | > 80% | +1 app server | 5 min |
| Response time | > 800ms p95 | +1 app server | 3 min |
| WS connections | > 8000 | +1 WS server | 2 min |

## File Locations

```
scripts/
  ├── load-test.js              # k6 test script
  ├── simulate-load-test.mjs    # Generate test data
  ├── capacity-plan.mjs         # Capacity analyzer
  ├── load-test-results.json    # Test results
  ├── capacity-report.txt       # Human-readable report
  └── capacity-plan.json        # Structured data

monitoring/
  └── perf-budget.json          # Performance budgets
```

## Interpreting Results

### Response Time Distribution
```
p50 (median)  - 50% of requests faster
p95          - 95% of requests faster (SLA target)
p99          - 99% of requests faster (outlier detection)
```

### Error Rate
```
< 0.1%  ✅ Excellent
< 1.0%  ✅ Good (target)
< 5.0%  ⚠️  Warning
> 5.0%  ❌ Critical
```

### WebSocket Health
```
Connections   - Total active WS connections
Messages      - Total messages sent/received
Latency       - Round-trip message time
```

## Common Issues

### Issue: High Response Time
**Check:** Database queries, cache hit rate, network latency  
**Fix:** Add indexes, increase cache, use CDN

### Issue: Memory Growth
**Check:** Heap snapshots, GC frequency  
**Fix:** Fix leaks, increase memory, tune GC

### Issue: Low FPS
**Check:** Draw calls, triangle count, shader complexity  
**Fix:** LOD system, frustum culling, optimize shaders

### Issue: WebSocket Drops
**Check:** Connection timeout, max connections, load balancer  
**Fix:** Increase timeout, scale WS servers, sticky sessions

## Next Steps

1. **Immediate** (This week)
   - Review capacity report
   - Fix render bottleneck
   - Set up monitoring

2. **Short-term** (Next month)
   - Implement CDN
   - Add Redis cache
   - Optimize bundles

3. **Long-term** (6+ months)
   - Microservices architecture
   - Edge computing
   - Advanced optimizations

## Get Help

- 📖 Full docs: `LOAD_TESTING.md`
- 📊 Latest report: `scripts/capacity-report.txt`
- 💰 Budget: `monitoring/perf-budget.json`
- 🔍 Test results: `scripts/load-test-results.json`
