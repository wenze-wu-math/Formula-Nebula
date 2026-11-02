# Load Testing & Capacity Planning

Complete guide to load testing and capacity planning for Formula Nebula.

## Overview

This project includes comprehensive load testing and capacity planning tools designed to ensure Formula Nebula can scale to **100,000 concurrent users** while maintaining excellent performance.

### Tools Provided

1. **k6 Load Tests** (`scripts/load-test.js`)
   - Progressive load testing from 1K to 100K users
   - Multiple test scenarios (smoke, load, stress, spike, soak)
   - WebSocket collaboration testing
   - Custom metrics for rendering performance

2. **Capacity Planning** (`scripts/capacity-plan.mjs`)
   - Bottleneck identification
   - Infrastructure sizing recommendations
   - Cost estimation
   - Auto-scaling strategies

3. **Performance Budgets** (`monitoring/perf-budget.json`)
   - Hard limits for key metrics
   - Device-specific budgets
   - Optimization priorities

## Quick Start

### Install k6

**Windows:**
```powershell
choco install k6
```

**macOS:**
```bash
brew install k6
```

**Linux:**
```bash
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6
```

**Alternative: Using Docker**
```bash
docker pull grafana/k6
```

### Run Tests

```bash
# Simulated test (no k6 required)
npm run capacity-report

# Real load tests (requires k6)
npm run load-test:smoke    # Quick smoke test (2 minutes)
npm run load-test          # Full load test (30 minutes)
npm run load-test:stress   # Stress test to 50K users (45 minutes)

# Generate capacity plan from results
npm run capacity-plan
```

## Test Scenarios

### 1. Smoke Test
**Duration:** 2 minutes  
**Users:** 10  
**Purpose:** Verify system works under minimal load

```bash
k6 run -e STAGE=smoke scripts/load-test.js
```

### 2. Load Test
**Duration:** 16 minutes  
**Users:** 100 → 1,000  
**Purpose:** Test normal expected load

```bash
k6 run -e STAGE=load scripts/load-test.js
```

### 3. Stress Test
**Duration:** 45 minutes  
**Users:** 1,000 → 10,000 → 50,000  
**Purpose:** Find breaking point

```bash
k6 run -e STAGE=stress scripts/load-test.js
```

### 4. Spike Test
**Duration:** 8 minutes  
**Users:** 100 ⚡ 10,000 (sudden spike)  
**Purpose:** Test resilience to traffic spikes

```bash
k6 run -e STAGE=spike scripts/load-test.js
```

### 5. Soak Test
**Duration:** 3+ hours  
**Users:** 1,000 sustained  
**Purpose:** Detect memory leaks and degradation

```bash
k6 run -e STAGE=soak scripts/load-test.js
```

## User Profiles

The load test simulates three types of users:

### Casual Browser (60%)
- Loads main page
- Views 2-5 formulas
- Session: 5-10 minutes
- No WebSocket usage

### Active Explorer (25%)
- Intensive navigation
- Views 10+ formulas
- Reads proofs
- Uses search
- Session: 10-20 minutes

### Collaborator (15%)
- WebSocket connection
- Sends annotations
- Real-time cursor sharing
- 5-15 messages per session
- Session: 10-30 minutes

## Performance Thresholds

### Response Time
- **Target:** p95 < 500ms, p99 < 1000ms
- **Critical:** p95 > 1000ms
- **Action:** Scale horizontally if exceeded

### Error Rate
- **Target:** < 1%
- **Critical:** > 5%
- **Action:** Immediate investigation

### Render Performance
- **Target:** p95 < 2000ms
- **Warning:** p95 > 2500ms
- **Action:** Optimize rendering pipeline

### Frame Rate
- **Target:** p50 > 30 fps, p95 > 20 fps
- **Critical:** p50 < 20 fps
- **Action:** Reduce scene complexity

## Capacity Planning Results

Based on load testing with 10,000 concurrent users:

### Current Performance
- **Response Time p95:** 156ms ✅
- **Error Rate:** 0.90% ✅
- **Render Time p95:** 2200ms ⚠️
- **Average FPS:** 42 ✅

### Bottlenecks Identified

#### 1. Render Performance [HIGH]
**Current:** 2200ms | **Target:** 2000ms

**Recommendations:**
- Implement progressive loading for formulas
- Use Web Workers for graph layout computation
- Optimize Three.js scene (reduce draw calls)
- Implement LOD (Level of Detail) system
- Cache texture baking results
- Use instanced rendering for particles

#### 2. Memory Usage [HIGH]
**Current:** 0.5MB per user | **Target:** 0.41MB per user

**Recommendations:**
- Implement connection pooling
- Add memory limits per connection
- Use streaming for large datasets
- Lazy load proof content
- Use typed arrays for graph data
- Tune garbage collection

### Infrastructure Requirements

#### For 100,000 Concurrent Users

**Application Servers:**
- Count: 1 (with auto-scaling to 2)
- CPU: 4 cores per instance
- Memory: 4GB per instance
- Type: AWS t3.xlarge or equivalent

**WebSocket Servers:**
- Count: 2 (15% use collaboration features)
- CPU: 2 cores per instance
- Memory: 2GB per instance
- Max connections: 10,000 per server

**Database:**
- Type: PostgreSQL or MongoDB
- CPU: 8 cores
- Memory: 16GB
- Storage: 500GB SSD
- Replicas: 2 (primary + standby)

**Cache Layer:**
- Type: Redis
- CPU: 4 cores
- Memory: 8GB
- Replicas: 2

**CDN:**
- Bandwidth: 100GB/day
- Requests: 10M/day
- Regions: Global edge locations

### Auto-Scaling Strategy

**Scale Up Triggers:**
- CPU > 70% for 5 minutes
- Memory > 80% for 5 minutes
- Response time p95 > 800ms for 3 minutes
- WebSocket connections > 8,000 per server

**Scale Down Triggers:**
- Below 30% capacity for 10 minutes

**Limits:**
- Max app servers: 2
- Max WebSocket servers: 4
- Min instances: 1 (always-on)

### Cost Estimation

**Monthly Infrastructure Cost: $1,892**

**Breakdown:**
- Compute: $918 (app + WS servers)
- Storage: $73 (EBS + S3)
- Network: $901 (data transfer + CDN)

**Annual Cost: $22,705**

**Cost Savings Opportunities:**
- Implement CDN: Save $500-1,000/month
- Use reserved instances: Save 30-40%
- Optimize bundle size: Reduce bandwidth costs by 30%

## Optimization Roadmap

### Immediate (Week 1)
- [x] Establish performance budgets
- [x] Set up load testing infrastructure
- [ ] Fix render performance bottleneck
- [ ] Implement basic monitoring

### Short-Term (Month 1-3)

#### HIGH Priority
1. **Implement CDN**
   - Offload static assets
   - Reduce origin server load by ~70%
   - Estimated savings: $500-1,000/month

2. **Add Redis Caching**
   - Cache formula textures
   - Cache graph layout results
   - Estimated improvement: 50-70% faster responses

#### MEDIUM Priority
3. **Optimize Bundle Size**
   - Implement code splitting
   - Tree-shake Three.js modules
   - Use lightweight KaTeX subset
   - Estimated improvement: 30-40% faster initial load

4. **Progressive Rendering**
   - Load visible formulas first
   - Lazy-load proofs
   - Estimated improvement: 60-80% faster time-to-interactive

### Long-Term (Month 6+)

#### HIGH Priority
1. **Microservices Architecture**
   - Static asset service (CDN)
   - API gateway
   - Graph computation service
   - WebSocket collaboration service
   - Proof rendering service
   
   **Benefits:** Independent scaling, better resource utilization

#### MEDIUM Priority
2. **Edge Computing**
   - Deploy to multiple regions
   - Reduce latency for global users
   - Estimated improvement: 50-200ms latency reduction

3. **Advanced Optimization**
   - WebGL 2.0 features
   - Compute shaders for layout
   - Texture compression (KTX2)
   - Virtual geometry

## Monitoring & Alerting

### Key Metrics to Monitor

**Application Performance:**
- Response time (p50, p95, p99)
- Error rate
- Request throughput
- Active connections

**Rendering Performance:**
- Frame rate (FPS)
- Render time
- JS heap size
- WebGL draw calls

**Infrastructure:**
- CPU utilization
- Memory usage
- Network bandwidth
- Disk I/O

**Business Metrics:**
- Concurrent users
- Session duration
- Formula views
- Collaboration usage

### Alerting Rules

```yaml
# Critical Alerts (Page immediately)
- Response time p95 > 1000ms for 5 minutes
- Error rate > 5% for 2 minutes
- CPU > 90% for 5 minutes
- Memory > 95% for 2 minutes
- WebSocket disconnection rate > 10%

# Warning Alerts (Notify via Slack)
- Response time p95 > 500ms for 10 minutes
- Error rate > 1% for 5 minutes
- CPU > 70% for 10 minutes
- Memory > 80% for 10 minutes
- Render time p95 > 2500ms
```

## Performance Budget Enforcement

The `monitoring/perf-budget.json` file defines hard limits for key metrics.

**Integrate with CI/CD:**

```bash
# Run Lighthouse CI
npm install -g @lhci/cli
lhci autorun --config=lighthouserc.js

# Fail build if budgets exceeded
if [ $? -ne 0 ]; then
  echo "Performance budgets exceeded!"
  exit 1
fi
```

**Budget Categories:**
- Load Time (FCP, LCP, TTI, TBT, CLS)
- Bundle Size (JS, CSS, HTML)
- Assets (images, fonts, data files)
- Runtime (FPS, heap size, draw calls)
- API (response times, WebSocket latency)
- Scalability (concurrent users, error rate)

## Load Testing Best Practices

### Before Testing

1. **Start with smoke tests**
   - Verify basic functionality
   - Catch obvious issues early

2. **Use production-like environment**
   - Same hardware specs
   - Same network conditions
   - Same data volume

3. **Clear state between tests**
   - Reset database
   - Clear caches
   - Restart services

### During Testing

1. **Monitor everything**
   - Application metrics
   - Infrastructure metrics
   - User experience metrics

2. **Document observations**
   - When did issues appear?
   - What was the load level?
   - What was the error pattern?

3. **Take snapshots**
   - Memory profiles
   - CPU profiles
   - Network traces

### After Testing

1. **Analyze results**
   - Identify bottlenecks
   - Calculate capacity
   - Estimate costs

2. **Generate reports**
   - Share with team
   - Document findings
   - Create action items

3. **Update plans**
   - Revise capacity estimates
   - Update scaling rules
   - Adjust budgets

## Troubleshooting

### High Response Times

**Symptoms:** p95 > 500ms

**Possible Causes:**
- Database query performance
- Network latency
- Cold cache
- Resource contention

**Investigation:**
```bash
# Check slow queries
npm run db:slow-queries

# Profile application
npm run profile

# Check network
curl -w "@curl-format.txt" -o /dev/null -s $URL
```

### Memory Leaks

**Symptoms:** Gradual memory increase over time

**Investigation:**
```bash
# Heap snapshot
node --expose-gc --inspect app.js

# In Chrome DevTools:
# - Take initial heap snapshot
# - Run load test
# - Take final heap snapshot
# - Compare to find leaks
```

**Common causes in Three.js apps:**
- Forgotten dispose() calls
- Event listeners not removed
- Retained DOM references
- Texture leaks

### WebSocket Issues

**Symptoms:** Connection drops, high latency

**Investigation:**
```bash
# Check connection health
wscat -c ws://localhost:8765

# Monitor message rate
npm run ws:monitor

# Check for backpressure
npm run ws:stats
```

## Additional Resources

### Tools
- [k6 Documentation](https://k6.io/docs/)
- [Grafana k6 Cloud](https://k6.io/cloud/)
- [Artillery](https://www.artillery.io/) (Alternative)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)
- [WebPageTest](https://www.webpagetest.org/)

### Guides
- [Three.js Performance Guide](https://threejs.org/docs/#manual/en/introduction/How-to-optimize-your-scene)
- [WebGL Performance Best Practices](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices)
- [Web.dev Performance](https://web.dev/performance/)

### Monitoring Services
- DataDog
- New Relic
- Prometheus + Grafana
- AWS CloudWatch
- Google Cloud Monitoring

## Support

For questions or issues related to load testing and capacity planning:

1. Check existing capacity reports in `scripts/capacity-report.txt`
2. Review performance budget in `monitoring/perf-budget.json`
3. Consult load test results in `scripts/load-test-results.json`
4. Review this documentation

---

**Last Updated:** 2026-11-02  
**Next Review:** 2026-12-02  
**Maintained by:** DevOps Team
