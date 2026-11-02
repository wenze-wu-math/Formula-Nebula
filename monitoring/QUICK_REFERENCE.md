# Monitoring Quick Reference

## 🚀 Quick Start

```bash
# Start monitoring stack
cd monitoring && docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f prometheus
```

## 🌐 Access URLs

| Service | URL | Credentials |
|---------|-----|-------------|
| Grafana | http://localhost:3001 | admin/admin |
| Prometheus | http://localhost:9090 | - |
| Jaeger | http://localhost:16686 | - |
| Kibana | http://localhost:5601 | - |
| Alertmanager | http://localhost:9093 | - |

## 📊 Key Metrics

```javascript
import { globalMetrics, globalLogger, globalTracer } from './src/metrics.js';

// HTTP request
globalMetrics.recordHttpRequest('GET', '/api/nodes', 200, 0.125);

// WebSocket
globalMetrics.recordWsMessage('inbound', 'graph_update');
globalMetrics.setWsConnections(42);

// Graph stats
globalMetrics.setGraphStats(1234, 5678);

// Rendering
globalMetrics.recordRenderFrame(60, 16.7);

// Search
globalMetrics.recordSearch('semantic', 0.050);

// Errors
globalMetrics.recordError('validation_error', 'warning');

// Memory
globalMetrics.setMemoryUsage('heap_used', 52428800);
```

## 🔍 Tracing

```javascript
// Start trace
const context = globalMonitoring.createContext('myOperation');

// Add tags
globalTracer.setTags(context.spanId, { userId: 123 });

// Log event
globalTracer.log(context.spanId, 'checkpoint', { progress: 50 });

// Finish
context.finish({ success: true });
```

## 📝 Logging

```javascript
// Log levels
globalLogger.debug('Debug info', { detail: 'value' });
globalLogger.info('Operation completed', { duration: 125 });
globalLogger.warn('Resource usage high', { usage: 85 });
globalLogger.error('Operation failed', { reason: 'timeout' }, error);

// With trace context
globalLogger.info('Event', {
  traceId: context.traceId,
  spanId: context.spanId,
  data: { key: 'value' }
});
```

## 🔔 Alerts

```javascript
// Send alert
await globalMonitoring.alerts.sendAlert(
  'critical',              // severity: critical, error, warning, info
  'Service unavailable',   // title
  { service: 'database' }, // details
  'db-down'               // dedup key (optional)
);

// Check thresholds
const alerts = globalMonitoring.alerts.checkThresholds(metrics);
```

## 📈 Prometheus Queries

```promql
# Request rate
rate(http_requests_total[5m])

# Error percentage
sum(rate(http_requests_total{status=~"5.."}[5m])) / 
sum(rate(http_requests_total[5m])) * 100

# P95 latency
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))

# Memory usage %
memory_used_bytes{type="heap_used"} / 
memory_used_bytes{type="heap_limit"} * 100

# Active connections
ws_connections_active

# FPS
render_fps

# Search rate by type
sum by (type) (rate(search_queries_total[5m]))
```

## 🎯 PromQL Functions

| Function | Purpose | Example |
|----------|---------|---------|
| `rate()` | Per-second rate | `rate(http_requests_total[5m])` |
| `histogram_quantile()` | Percentile | `histogram_quantile(0.95, rate(bucket[5m]))` |
| `sum()` | Sum values | `sum(rate(http_requests_total[5m]))` |
| `avg()` | Average | `avg(memory_used_bytes)` |
| `max()` | Maximum | `max(http_request_duration_seconds)` |
| `by()` | Group by labels | `sum by (path) (rate(...))` |
| `increase()` | Total increase | `increase(http_requests_total[1h])` |
| `predict_linear()` | Trend prediction | `predict_linear(metric[1h], 3600)` |

## 📊 Grafana Tips

### Variables
```
# Create query variable
label_values(http_requests_total, path)

# Use in query
rate(http_requests_total{path="$path"}[5m])
```

### Panel Types
- **Graph**: Time series data
- **Stat**: Single value
- **Table**: Tabular data
- **Heatmap**: Distribution
- **Gauge**: Progress/percentage

### Best Practices
- Use recording rules for complex queries
- Set appropriate refresh intervals
- Use template variables for flexibility
- Add annotations for deployments
- Link related dashboards

## 🐛 Troubleshooting

### Metrics Not Appearing

```bash
# Check Prometheus targets
curl http://localhost:9090/api/v1/targets

# Check metric endpoint
curl http://localhost:3000/metrics

# Reload Prometheus config
curl -X POST http://localhost:9090/-/reload
```

### Logs Not in Kibana

```bash
# Check Logstash
curl http://localhost:9600/_node/stats

# Check Elasticsearch indices
curl http://localhost:9200/_cat/indices

# Check Logstash logs
docker-compose logs logstash
```

### Alerts Not Firing

```bash
# Check alert rules
curl http://localhost:9090/api/v1/rules

# Check Alertmanager
curl http://localhost:9093/api/v2/alerts

# Test alert
curl -X POST http://localhost:9093/api/v1/alerts -d '[
  {
    "labels": {"alertname":"TestAlert","severity":"warning"},
    "annotations": {"summary":"Test alert"}
  }
]'
```

## 🔧 Common Tasks

### Reload Configuration

```bash
# Prometheus
curl -X POST http://localhost:9090/-/reload

# Alertmanager
curl -X POST http://localhost:9093/-/reload

# Restart service
docker-compose restart prometheus
```

### Backup Data

```bash
# Prometheus
docker exec formula-nebula-prometheus \
  tar czf /tmp/backup.tar.gz /prometheus

# Grafana
docker exec formula-nebula-grafana \
  tar czf /tmp/backup.tar.gz /var/lib/grafana

# Copy to host
docker cp formula-nebula-prometheus:/tmp/backup.tar.gz ./backup.tar.gz
```

### Clean Old Data

```bash
# Elasticsearch (older than 30 days)
curl -X DELETE "localhost:9200/formula-nebula-logs-$(date -d '30 days ago' +%Y.%m.%d)"

# Prometheus (configured in prometheus.yaml)
# Default retention: 15 days
```

## 📱 Mobile Access

### PagerDuty
- Download PagerDuty mobile app
- Configure notifications
- Set up on-call schedules

### Grafana Mobile
- Use Grafana mobile app
- Configure push notifications
- View dashboards on the go

## 🔒 Security

### Change Default Passwords

```bash
# Grafana
docker exec -it formula-nebula-grafana \
  grafana-cli admin reset-admin-password newpassword
```

### Enable Authentication

Update `docker-compose.yaml`:
```yaml
prometheus:
  command:
    - '--web.enable-admin-api'
    - '--web.enable-lifecycle'
    # Add basic auth
```

### Network Security
- Expose only necessary ports
- Use firewall rules
- Enable TLS/SSL
- Use reverse proxy (nginx, Traefik)

## 📚 Learning Resources

- [Prometheus Docs](https://prometheus.io/docs/)
- [PromQL Tutorial](https://prometheus.io/docs/prometheus/latest/querying/basics/)
- [Grafana Docs](https://grafana.com/docs/)
- [Jaeger Docs](https://www.jaegertracing.io/docs/)
- [ELK Stack Guide](https://www.elastic.co/guide/)

## 🆘 Support

### Common Issues

**Q: Prometheus not scraping targets?**
A: Check network connectivity, verify metrics endpoint, review scrape config

**Q: High memory usage?**
A: Reduce retention time, decrease scrape frequency, limit label cardinality

**Q: Alerts not routing correctly?**
A: Check Alertmanager config, verify receiver configs, test routing rules

**Q: Grafana dashboard not loading?**
A: Check datasource connection, verify Prometheus is running, check browser console

### Performance Tips

1. Use recording rules for expensive queries
2. Set appropriate scrape intervals (10-30s)
3. Limit label cardinality
4. Use summary metrics for high-frequency data
5. Configure retention based on storage capacity
6. Use remote write for long-term storage

## 🎓 Best Practices

### Metrics
- ✅ Use consistent naming (service_metric_unit)
- ✅ Add helpful labels (but not too many)
- ✅ Use appropriate metric types
- ❌ Don't use high-cardinality labels
- ❌ Don't create metrics per user/session

### Logging
- ✅ Use structured JSON logs
- ✅ Include trace context
- ✅ Log at appropriate levels
- ❌ Don't log sensitive data
- ❌ Don't log in tight loops

### Alerting
- ✅ Alert on symptoms, not causes
- ✅ Make alerts actionable
- ✅ Group related alerts
- ❌ Don't create alert storms
- ❌ Don't alert on every anomaly

---

**Last Updated:** 2026-11-02
**Version:** 1.0.0
