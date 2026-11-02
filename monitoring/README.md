# Formula Nebula Monitoring & Observability

Comprehensive monitoring and observability stack for Formula Nebula, including metrics collection, distributed tracing, log aggregation, visualization, and alerting.

## 📊 Stack Overview

- **Prometheus**: Metrics collection and time-series database
- **Grafana**: Dashboards and visualization
- **Jaeger**: Distributed tracing
- **ELK Stack**: Log aggregation and analysis (Elasticsearch, Logstash, Kibana)
- **Alertmanager**: Alert routing and management
- **PagerDuty**: Incident response and on-call management

## 🚀 Quick Start

### 1. Start the Monitoring Stack

```bash
cd monitoring
docker-compose up -d
```

### 2. Access the Dashboards

- **Grafana**: http://localhost:3001 (admin/admin)
- **Prometheus**: http://localhost:9090
- **Jaeger UI**: http://localhost:16686
- **Kibana**: http://localhost:5601
- **Alertmanager**: http://localhost:9093

### 3. Integrate into Application

```javascript
import { globalMonitoring } from './src/metrics.js';

// Initialize monitoring
await globalMonitoring.initialize();

// Record metrics
globalMetrics.recordHttpRequest('GET', '/api/nodes', 200, 0.125);
globalMetrics.recordSearch('semantic', 0.050);

// Create traces
const context = globalMonitoring.createContext('loadGraph');
// ... perform operation
context.finish({ nodes: 1234, links: 5678 });

// Log events
globalLogger.info('Graph loaded successfully', {
  traceId: context.traceId,
  nodes: 1234,
  links: 5678
});
```

## 📈 Available Metrics

### Application Metrics

- `http_requests_total` - Total HTTP requests (counter)
- `http_request_duration_seconds` - HTTP request latency (histogram)
- `ws_connections_active` - Active WebSocket connections (gauge)
- `ws_messages_total` - WebSocket messages (counter)
- `graph_nodes_total` - Total graph nodes (gauge)
- `graph_links_total` - Total graph links (gauge)
- `render_fps` - Current rendering FPS (gauge)
- `render_frame_time_ms` - Frame rendering time (histogram)
- `search_queries_total` - Search queries (counter)
- `search_duration_seconds` - Search duration (histogram)
- `errors_total` - Total errors (counter)
- `memory_used_bytes` - Memory usage (gauge)
- `learning_paths_active` - Active learning paths (gauge)
- `learning_path_progress` - Learning path progress (histogram)

### System Metrics (via Node Exporter)

- CPU usage
- Memory usage
- Disk I/O
- Network traffic
- Process statistics

## 🎯 Key Dashboards

### System Overview
Main dashboard showing:
- Application health status
- Request rates and latency
- Error rates
- Resource utilization
- Active connections

### Performance Analysis
Deep dive into:
- Request latency percentiles (P50, P95, P99)
- Frame rendering performance
- Search query performance
- Memory usage trends

### Error Tracking
Detailed error analysis:
- Error rates by type and severity
- HTTP status code distribution
- Error trends over time

### Business Metrics
Application-specific KPIs:
- Search query patterns
- Learning path engagement
- Graph size evolution
- User activity metrics

## 🔔 Alerting

### Alert Severity Levels

- **Critical**: Immediate action required (pages on-call)
  - Application down
  - Very high error rate
  - Critical memory usage

- **Warning**: Investigation needed (Slack notification)
  - High latency
  - Elevated error rate
  - High resource usage

- **Info**: Informational only
  - Low activity periods
  - Capacity planning warnings

### Alert Configuration

Alerts are defined in `alerts.yaml` and routed through Alertmanager to:
- PagerDuty (critical alerts)
- Slack (team notifications)
- Email (summary reports)

### PagerDuty Integration

1. Get your PagerDuty integration key from: Services → Service Directory → (your service) → Integrations → Prometheus

2. Update `alertmanager.yaml`:
```yaml
receivers:
  - name: 'pagerduty-critical'
    pagerduty_configs:
      - service_key: 'YOUR_INTEGRATION_KEY'
```

3. Configure in application:
```javascript
const monitoring = new MonitoringSystem({
  pagerDutyIntegrationKey: 'YOUR_INTEGRATION_KEY',
  alertThresholds: {
    errorRate: 5.0,        // %
    responseTime: 1000,    // ms
    memoryUsage: 85        // %
  }
});
```

## 🔍 Distributed Tracing

### Creating Traces

```javascript
import { globalMonitoring } from './src/metrics.js';

// Start a trace
const traceId = globalTracer.startTrace();

// Create spans
const spanId = globalTracer.startSpan('loadGraphData');

// Add tags and logs
globalTracer.setTags(spanId, {
  nodeCount: 1234,
  linkCount: 5678
});

globalTracer.log(spanId, 'data_loaded', {
  duration_ms: 125
});

// Finish span
globalTracer.finishSpan(spanId, { success: true });

// View in Jaeger UI
console.log(`Trace ID: ${traceId}`);
```

### Trace Context Propagation

Traces automatically propagate through:
- HTTP requests (via headers)
- WebSocket messages
- Async operations
- Error contexts

## 📝 Logging

### Structured Logging

```javascript
import { globalLogger } from './src/metrics.js';

// Log levels
globalLogger.debug('Detailed debug info', { variable: value });
globalLogger.info('Operation completed', { duration: 125 });
globalLogger.warn('Resource usage high', { usage: 85 });
globalLogger.error('Operation failed', { reason: 'timeout' }, error);
```

### Log Fields

All logs include:
- `@timestamp` - ISO timestamp
- `level` - Log level (DEBUG, INFO, WARN, ERROR)
- `message` - Log message
- `service` - Service name
- `environment` - Environment (development, production)
- `trace_id` - Distributed trace ID
- `span_id` - Current span ID
- `context` - Additional context object

### ELK Stack

Logs are:
1. Collected by Logstash (HTTP/UDP endpoints)
2. Parsed and enriched
3. Stored in Elasticsearch
4. Visualized in Kibana

Query logs in Kibana: http://localhost:5601

## 🎛️ Configuration

### Environment Variables

```bash
# Monitoring endpoints
METRICS_ENDPOINT=/metrics
LOGS_ENDPOINT=http://localhost:5000
TRACING_ENDPOINT=http://localhost:14268/api/traces

# PagerDuty
PAGERDUTY_INTEGRATION_KEY=your-key-here

# Alert thresholds
ALERT_ERROR_RATE_THRESHOLD=5.0
ALERT_RESPONSE_TIME_THRESHOLD=1000
ALERT_MEMORY_THRESHOLD=85

# Environment
NODE_ENV=production
SERVICE_NAME=formula-nebula
```

### Custom Metrics

Add custom metrics:

```javascript
import { globalRegistry } from './src/metrics.js';

// Create counter
const myCounter = globalRegistry.counter(
  'my_custom_counter',
  'Description of counter',
  ['label1', 'label2']
);

// Increment
const labels = { label1: 'value1', label2: 'value2 };
const labelKey = JSON.stringify(labels);
myCounter.values.set(labelKey, (myCounter.values.get(labelKey) || 0) + 1);
```

## 🔧 Advanced Usage

### Performance Monitoring

```javascript
import { globalMonitoring } from './src/metrics.js';

// Measure async operation
const result = await globalMonitoring.performance.measureAsync(
  'complexOperation',
  async () => {
    // Your code here
    return await doSomething();
  },
  { userId: 123 }  // tags
);

// Measure sync operation
const result = globalMonitoring.performance.measureSync(
  'calculation',
  () => performCalculation(),
  { type: 'heavy' }
);
```

### Manual Alert Triggering

```javascript
import { globalMonitoring } from './src/metrics.js';

// Send alert
await globalMonitoring.alerts.sendAlert(
  'critical',                    // severity
  'Database connection lost',    // title
  {                              // details
    database: 'main',
    error: 'timeout',
    retries: 3
  },
  'db-connection-lost'          // dedup key
);
```

### Export Metrics

```javascript
// Browser console or Node.js
const prometheusMetrics = window.__exportMetrics();
const traces = window.__exportTraces();
const logs = window.__exportLogs();

console.log(prometheusMetrics);
```

## 📊 Prometheus Query Examples

```promql
# Request rate
rate(http_requests_total[5m])

# Error percentage
sum(rate(http_requests_total{status=~"5.."}[5m])) /
sum(rate(http_requests_total[5m])) * 100

# P95 latency
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))

# Memory usage percentage
memory_used_bytes{type="heap_used"} /
memory_used_bytes{type="heap_limit"} * 100

# Requests per second by path
sum by (path) (rate(http_requests_total[5m]))
```

## 🛠️ Maintenance

### Backup Prometheus Data

```bash
docker exec formula-nebula-prometheus \
  tar czf /tmp/prometheus-backup.tar.gz /prometheus

docker cp formula-nebula-prometheus:/tmp/prometheus-backup.tar.gz \
  ./backups/prometheus-$(date +%Y%m%d).tar.gz
```

### Clean Old Data

```bash
# Prometheus retention is configured in prometheus.yaml
# Default: 15 days

# Elasticsearch cleanup (older than 30 days)
curl -X DELETE "localhost:9200/formula-nebula-logs-$(date -d '30 days ago' +%Y.%m.%d)"
```

### Update Dashboards

1. Edit dashboard in Grafana UI
2. Export as JSON: Share → Export → Save to file
3. Replace `monitoring/grafana-dashboard.json`
4. Commit changes to version control

## 🐛 Troubleshooting

### Prometheus Not Scraping Metrics

1. Check target status: http://localhost:9090/targets
2. Verify application exposes `/metrics` endpoint
3. Check network connectivity

### Logs Not Appearing in Kibana

1. Verify Logstash is receiving logs: http://localhost:9600
2. Check Elasticsearch indices: http://localhost:9200/_cat/indices
3. Create index pattern in Kibana: Management → Index Patterns

### Alerts Not Firing

1. Check alert rules: http://localhost:9090/alerts
2. Verify Alertmanager config: http://localhost:9093
3. Check alert routing rules in `alertmanager.yaml`

### High Memory Usage

1. Reduce Prometheus retention time
2. Decrease scrape frequency
3. Limit number of time series (reduce label cardinality)

## 📚 Resources

- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [Jaeger Documentation](https://www.jaegertracing.io/docs/)
- [ELK Stack Guide](https://www.elastic.co/guide/)
- [PagerDuty Integration](https://www.pagerduty.com/docs/guides/prometheus-integration-guide/)

## 🤝 Contributing

When adding new metrics:

1. Define metric in `src/metrics.js`
2. Add recording rule to `recording_rules.yaml` if needed
3. Create alert rule in `alerts.yaml` if applicable
4. Update Grafana dashboard
5. Document in this README

## 📄 License

Part of Formula Nebula project.
