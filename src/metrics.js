/**
 * Monitoring and Observability Instrumentation
 *
 * Provides:
 * - Prometheus metrics (requests/sec, latency, errors)
 * - Distributed tracing with Jaeger
 * - ELK stack logging integration
 * - Performance monitoring
 * - Error tracking
 */

// ============================================================================
// Metrics Registry
// ============================================================================

class MetricsRegistry {
  constructor() {
    this.counters = new Map();
    this.gauges = new Map();
    this.histograms = new Map();
    this.summaries = new Map();
    this.labels = new Map();
  }

  /**
   * Register a counter metric
   */
  counter(name, help, labelNames = []) {
    if (!this.counters.has(name)) {
      this.counters.set(name, {
        name,
        help,
        type: 'counter',
        labelNames,
        values: new Map()
      });
    }
    return this.counters.get(name);
  }

  /**
   * Register a gauge metric
   */
  gauge(name, help, labelNames = []) {
    if (!this.gauges.has(name)) {
      this.gauges.set(name, {
        name,
        help,
        type: 'gauge',
        labelNames,
        values: new Map()
      });
    }
    return this.gauges.get(name);
  }

  /**
   * Register a histogram metric
   */
  histogram(name, help, labelNames = [], buckets = [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10]) {
    if (!this.histograms.has(name)) {
      this.histograms.set(name, {
        name,
        help,
        type: 'histogram',
        labelNames,
        buckets,
        values: new Map()
      });
    }
    return this.histograms.get(name);
  }

  /**
   * Export metrics in Prometheus format
   */
  export() {
    const lines = [];

    // Export counters
    for (const [name, metric] of this.counters) {
      lines.push(`# HELP ${name} ${metric.help}`);
      lines.push(`# TYPE ${name} counter`);
      for (const [labels, value] of metric.values) {
        const labelStr = this._formatLabels(labels);
        lines.push(`${name}${labelStr} ${value}`);
      }
    }

    // Export gauges
    for (const [name, metric] of this.gauges) {
      lines.push(`# HELP ${name} ${metric.help}`);
      lines.push(`# TYPE ${name} gauge`);
      for (const [labels, value] of metric.values) {
        const labelStr = this._formatLabels(labels);
        lines.push(`${name}${labelStr} ${value}`);
      }
    }

    // Export histograms
    for (const [name, metric] of this.histograms) {
      lines.push(`# HELP ${name} ${metric.help}`);
      lines.push(`# TYPE ${name} histogram`);
      for (const [labels, data] of metric.values) {
        const labelStr = this._formatLabels(labels);

        // Bucket counts
        for (const bucket of metric.buckets) {
          const count = data.buckets.get(bucket) || 0;
          lines.push(`${name}_bucket${this._addLabel(labelStr, `le="${bucket}"`)} ${count}`);
        }
        lines.push(`${name}_bucket${this._addLabel(labelStr, 'le="+Inf"')} ${data.count}`);

        // Sum and count
        lines.push(`${name}_sum${labelStr} ${data.sum}`);
        lines.push(`${name}_count${labelStr} ${data.count}`);
      }
    }

    return lines.join('\n');
  }

  _formatLabels(labels) {
    if (!labels || Object.keys(labels).length === 0) return '';
    const pairs = Object.entries(labels).map(([k, v]) => `${k}="${v}"`);
    return `{${pairs.join(',')}}`;
  }

  _addLabel(existingLabels, newLabel) {
    if (!existingLabels) return `{${newLabel}}`;
    return existingLabels.slice(0, -1) + `,${newLabel}}`;
  }
}

// ============================================================================
// Application Metrics
// ============================================================================

class ApplicationMetrics {
  constructor(registry) {
    this.registry = registry;
    this._initializeMetrics();
  }

  _initializeMetrics() {
    // HTTP Request metrics
    this.httpRequestsTotal = this.registry.counter(
      'http_requests_total',
      'Total HTTP requests',
      ['method', 'path', 'status']
    );

    this.httpRequestDuration = this.registry.histogram(
      'http_request_duration_seconds',
      'HTTP request duration in seconds',
      ['method', 'path'],
      [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5]
    );

    // WebSocket metrics
    this.wsConnectionsActive = this.registry.gauge(
      'ws_connections_active',
      'Active WebSocket connections'
    );

    this.wsMessagesTotal = this.registry.counter(
      'ws_messages_total',
      'Total WebSocket messages',
      ['direction', 'type']
    );

    // Application metrics
    this.graphNodesTotal = this.registry.gauge(
      'graph_nodes_total',
      'Total nodes in knowledge graph'
    );

    this.graphLinksTotal = this.registry.gauge(
      'graph_links_total',
      'Total links in knowledge graph'
    );

    this.renderFps = this.registry.gauge(
      'render_fps',
      'Current rendering FPS'
    );

    this.renderFrameTime = this.registry.histogram(
      'render_frame_time_ms',
      'Frame rendering time in milliseconds',
      [],
      [1, 5, 10, 16.67, 25, 33.33, 50, 100]
    );

    // Search metrics
    this.searchQueriesTotal = this.registry.counter(
      'search_queries_total',
      'Total search queries',
      ['type']
    );

    this.searchDuration = this.registry.histogram(
      'search_duration_seconds',
      'Search query duration',
      ['type']
    );

    // Error metrics
    this.errorsTotal = this.registry.counter(
      'errors_total',
      'Total errors',
      ['type', 'severity']
    );

    // Memory metrics
    this.memoryUsedBytes = this.registry.gauge(
      'memory_used_bytes',
      'Memory used in bytes',
      ['type']
    );

    // Learning path metrics
    this.learningPathsActive = this.registry.gauge(
      'learning_paths_active',
      'Active learning paths'
    );

    this.learningPathProgress = this.registry.histogram(
      'learning_path_progress',
      'Learning path completion progress',
      ['path_id']
    );
  }

  // Helper methods for recording metrics
  recordHttpRequest(method, path, status, duration) {
    const labels = { method, path, status: status.toString() };
    const labelKey = JSON.stringify(labels);

    const counter = this.httpRequestsTotal;
    counter.values.set(labelKey, (counter.values.get(labelKey) || 0) + 1);

    this._recordHistogram(this.httpRequestDuration, { method, path }, duration);
  }

  recordWsMessage(direction, type) {
    const labels = { direction, type };
    const labelKey = JSON.stringify(labels);

    const counter = this.wsMessagesTotal;
    counter.values.set(labelKey, (counter.values.get(labelKey) || 0) + 1);
  }

  setWsConnections(count) {
    this.wsConnectionsActive.values.set('{}', count);
  }

  setGraphStats(nodes, links) {
    this.graphNodesTotal.values.set('{}', nodes);
    this.graphLinksTotal.values.set('{}', links);
  }

  recordRenderFrame(fps, frameTime) {
    this.renderFps.values.set('{}', fps);
    this._recordHistogram(this.renderFrameTime, {}, frameTime);
  }

  recordSearch(type, duration) {
    const labels = { type };
    const labelKey = JSON.stringify(labels);

    const counter = this.searchQueriesTotal;
    counter.values.set(labelKey, (counter.values.get(labelKey) || 0) + 1);

    this._recordHistogram(this.searchDuration, { type }, duration);
  }

  recordError(type, severity = 'error') {
    const labels = { type, severity };
    const labelKey = JSON.stringify(labels);

    const counter = this.errorsTotal;
    counter.values.set(labelKey, (counter.values.get(labelKey) || 0) + 1);
  }

  setMemoryUsage(type, bytes) {
    const labelKey = JSON.stringify({ type });
    this.memoryUsedBytes.values.set(labelKey, bytes);
  }

  _recordHistogram(histogram, labels, value) {
    const labelKey = JSON.stringify(labels);

    if (!histogram.values.has(labelKey)) {
      histogram.values.set(labelKey, {
        sum: 0,
        count: 0,
        buckets: new Map()
      });
    }

    const data = histogram.values.get(labelKey);
    data.sum += value;
    data.count += 1;

    // Update buckets
    for (const bucket of histogram.buckets) {
      if (value <= bucket) {
        data.buckets.set(bucket, (data.buckets.get(bucket) || 0) + 1);
      }
    }
  }
}

// ============================================================================
// Distributed Tracing (Jaeger)
// ============================================================================

class TracingManager {
  constructor(serviceName = 'formula-nebula') {
    this.serviceName = serviceName;
    this.activeSpans = new Map();
    this.spans = [];
    this.traceId = null;
  }

  /**
   * Start a new trace
   */
  startTrace() {
    this.traceId = this._generateTraceId();
    return this.traceId;
  }

  /**
   * Start a new span
   */
  startSpan(operationName, parentSpanId = null) {
    const spanId = this._generateSpanId();
    const span = {
      traceId: this.traceId || this._generateTraceId(),
      spanId,
      parentSpanId,
      operationName,
      startTime: Date.now() * 1000, // microseconds
      tags: {},
      logs: []
    };

    this.activeSpans.set(spanId, span);
    return spanId;
  }

  /**
   * Finish a span
   */
  finishSpan(spanId, tags = {}) {
    const span = this.activeSpans.get(spanId);
    if (!span) return;

    span.finishTime = Date.now() * 1000;
    span.duration = span.finishTime - span.startTime;
    span.tags = { ...span.tags, ...tags };

    this.spans.push(span);
    this.activeSpans.delete(spanId);

    return span;
  }

  /**
   * Add tags to a span
   */
  setTags(spanId, tags) {
    const span = this.activeSpans.get(spanId);
    if (span) {
      span.tags = { ...span.tags, ...tags };
    }
  }

  /**
   * Add a log entry to a span
   */
  log(spanId, event, fields = {}) {
    const span = this.activeSpans.get(spanId);
    if (span) {
      span.logs.push({
        timestamp: Date.now() * 1000,
        event,
        fields
      });
    }
  }

  /**
   * Export spans in Jaeger format
   */
  export() {
    return {
      data: [{
        traceID: this.traceId,
        spans: this.spans.map(span => ({
          traceID: span.traceId,
          spanID: span.spanId,
          parentSpanID: span.parentSpanId || '',
          operationName: span.operationName,
          startTime: span.startTime,
          duration: span.duration,
          tags: Object.entries(span.tags).map(([key, value]) => ({
            key,
            type: typeof value,
            value
          })),
          logs: span.logs
        })),
        processes: {
          p1: {
            serviceName: this.serviceName,
            tags: []
          }
        }
      }]
    };
  }

  _generateTraceId() {
    return Array.from({ length: 32 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
  }

  _generateSpanId() {
    return Array.from({ length: 16 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
  }
}

// ============================================================================
// Structured Logging (ELK Stack)
// ============================================================================

class StructuredLogger {
  constructor(serviceName = 'formula-nebula', environment = 'production') {
    this.serviceName = serviceName;
    this.environment = environment;
    this.logBuffer = [];
    this.maxBufferSize = 100;
  }

  /**
   * Log at various levels
   */
  debug(message, context = {}) {
    this._log('DEBUG', message, context);
  }

  info(message, context = {}) {
    this._log('INFO', message, context);
  }

  warn(message, context = {}) {
    this._log('WARN', message, context);
  }

  error(message, context = {}, error = null) {
    const errorContext = error ? {
      ...context,
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name
      }
    } : context;
    this._log('ERROR', message, errorContext);
  }

  /**
   * Internal logging method
   */
  _log(level, message, context) {
    const logEntry = {
      '@timestamp': new Date().toISOString(),
      level,
      message,
      service: this.serviceName,
      environment: this.environment,
      context,
      trace_id: context.traceId || null,
      span_id: context.spanId || null
    };

    // Add to buffer
    this.logBuffer.push(logEntry);
    if (this.logBuffer.length > this.maxBufferSize) {
      this.logBuffer.shift();
    }

    // Console output for development
    if (this.environment === 'development') {
      const consoleMethod = level === 'ERROR' ? 'error' :
                           level === 'WARN' ? 'warn' :
                           level === 'DEBUG' ? 'debug' : 'log';
      console[consoleMethod](`[${level}] ${message}`, context);
    }

    return logEntry;
  }

  /**
   * Export logs for ELK stack
   */
  export() {
    return this.logBuffer.map(entry => JSON.stringify(entry)).join('\n');
  }

  /**
   * Flush logs to endpoint
   */
  async flush(endpoint) {
    if (this.logBuffer.length === 0) return;

    try {
      await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-ndjson'
        },
        body: this.export()
      });
      this.logBuffer = [];
    } catch (error) {
      console.error('Failed to flush logs:', error);
    }
  }
}

// ============================================================================
// Performance Monitoring
// ============================================================================

class PerformanceMonitor {
  constructor(metrics, logger) {
    this.metrics = metrics;
    this.logger = logger;
    this.observations = [];
  }

  /**
   * Start monitoring performance
   */
  startMonitoring() {
    // Monitor memory usage
    if (performance.memory) {
      setInterval(() => {
        const memory = performance.memory;
        this.metrics.setMemoryUsage('heap_used', memory.usedJSHeapSize);
        this.metrics.setMemoryUsage('heap_total', memory.totalJSHeapSize);
        this.metrics.setMemoryUsage('heap_limit', memory.jsHeapSizeLimit);
      }, 10000); // Every 10 seconds
    }

    // Monitor long tasks
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.duration > 50) {
              this.logger.warn('Long task detected', {
                name: entry.name,
                duration: entry.duration,
                startTime: entry.startTime
              });
            }
          }
        });
        observer.observe({ entryTypes: ['longtask'] });
      } catch (e) {
        // Long task API not supported
      }
    }
  }

  /**
   * Measure operation performance
   */
  async measureAsync(name, operation, tags = {}) {
    const startTime = performance.now();
    const spanId = globalTracer.startSpan(name);

    try {
      const result = await operation();
      const duration = (performance.now() - startTime) / 1000; // seconds

      globalTracer.finishSpan(spanId, { ...tags, success: true });
      this.logger.info(`Operation completed: ${name}`, {
        duration,
        ...tags
      });

      return result;
    } catch (error) {
      const duration = (performance.now() - startTime) / 1000;

      globalTracer.setTags(spanId, { ...tags, error: true });
      globalTracer.finishSpan(spanId);

      this.logger.error(`Operation failed: ${name}`, {
        duration,
        ...tags
      }, error);

      throw error;
    }
  }

  measureSync(name, operation, tags = {}) {
    const startTime = performance.now();
    const spanId = globalTracer.startSpan(name);

    try {
      const result = operation();
      const duration = (performance.now() - startTime) / 1000;

      globalTracer.finishSpan(spanId, { ...tags, success: true });
      return result;
    } catch (error) {
      globalTracer.setTags(spanId, { ...tags, error: true });
      globalTracer.finishSpan(spanId);
      throw error;
    }
  }
}

// ============================================================================
// Alerting (PagerDuty Integration)
// ============================================================================

class AlertManager {
  constructor(logger, config = {}) {
    this.logger = logger;
    this.integrationKey = config.pagerDutyIntegrationKey || '';
    this.alertThresholds = config.thresholds || {};
    this.alertHistory = [];
    this.alertCooldowns = new Map();
  }

  /**
   * Send alert to PagerDuty
   */
  async sendAlert(severity, title, details, dedupeKey = null) {
    // Check cooldown
    if (dedupeKey && this.alertCooldowns.has(dedupeKey)) {
      const lastAlert = this.alertCooldowns.get(dedupeKey);
      if (Date.now() - lastAlert < 300000) { // 5 minutes cooldown
        return;
      }
    }

    const alert = {
      routing_key: this.integrationKey,
      event_action: 'trigger',
      dedup_key: dedupeKey || this._generateDedupeKey(),
      payload: {
        summary: title,
        severity,
        source: 'formula-nebula',
        timestamp: new Date().toISOString(),
        custom_details: details
      }
    };

    this.alertHistory.push({
      timestamp: Date.now(),
      severity,
      title,
      details
    });

    if (dedupeKey) {
      this.alertCooldowns.set(dedupeKey, Date.now());
    }

    this.logger.warn('Alert triggered', { severity, title, details });

    // Send to PagerDuty
    if (this.integrationKey) {
      try {
        await fetch('https://events.pagerduty.com/v2/enqueue', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(alert)
        });
      } catch (error) {
        this.logger.error('Failed to send PagerDuty alert', {}, error);
      }
    }

    return alert;
  }

  /**
   * Check metrics against thresholds
   */
  checkThresholds(metrics) {
    const checks = [];

    // Error rate threshold
    if (this.alertThresholds.errorRate) {
      const errorRate = this._calculateErrorRate(metrics);
      if (errorRate > this.alertThresholds.errorRate) {
        checks.push({
          type: 'error_rate',
          severity: 'error',
          message: `Error rate ${errorRate.toFixed(2)}% exceeds threshold`,
          value: errorRate
        });
      }
    }

    // Response time threshold
    if (this.alertThresholds.responseTime) {
      const p95 = this._calculateP95ResponseTime(metrics);
      if (p95 > this.alertThresholds.responseTime) {
        checks.push({
          type: 'response_time',
          severity: 'warning',
          message: `P95 response time ${p95.toFixed(0)}ms exceeds threshold`,
          value: p95
        });
      }
    }

    // Memory threshold
    if (this.alertThresholds.memoryUsage && performance.memory) {
      const usagePercent = (performance.memory.usedJSHeapSize /
                           performance.memory.jsHeapSizeLimit) * 100;
      if (usagePercent > this.alertThresholds.memoryUsage) {
        checks.push({
          type: 'memory_usage',
          severity: 'warning',
          message: `Memory usage ${usagePercent.toFixed(1)}% exceeds threshold`,
          value: usagePercent
        });
      }
    }

    return checks;
  }

  _calculateErrorRate(_metrics) {
    // Placeholder - would calculate from actual metrics
    return 0;
  }

  _calculateP95ResponseTime(_metrics) {
    // Placeholder - would calculate from histogram
    return 0;
  }

  _generateDedupeKey() {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// ============================================================================
// Main Monitoring System
// ============================================================================

class MonitoringSystem {
  constructor(config = {}) {
    this.config = {
      serviceName: 'formula-nebula',
      environment: process.env.NODE_ENV || 'development',
      metricsEndpoint: config.metricsEndpoint || '/metrics',
      logsEndpoint: config.logsEndpoint || null,
      tracingEndpoint: config.tracingEndpoint || null,
      pagerDutyIntegrationKey: config.pagerDutyIntegrationKey || '',
      ...config
    };

    this.registry = new MetricsRegistry();
    this.metrics = new ApplicationMetrics(this.registry);
    this.tracer = new TracingManager(this.config.serviceName);
    this.logger = new StructuredLogger(
      this.config.serviceName,
      this.config.environment
    );
    this.performance = new PerformanceMonitor(this.metrics, this.logger);
    this.alerts = new AlertManager(this.logger, {
      pagerDutyIntegrationKey: this.config.pagerDutyIntegrationKey,
      thresholds: this.config.alertThresholds || {}
    });

    this.initialized = false;
  }

  /**
   * Initialize monitoring system
   */
  async initialize() {
    if (this.initialized) return;

    this.logger.info('Initializing monitoring system', {
      serviceName: this.config.serviceName,
      environment: this.config.environment
    });

    // Start performance monitoring
    this.performance.startMonitoring();

    // Set up metrics export endpoint
    if (typeof window !== 'undefined') {
      this._setupMetricsEndpoint();
    }

    // Start periodic metric collection
    this._startPeriodicCollection();

    // Start periodic log flushing
    if (this.config.logsEndpoint) {
      this._startLogFlushing();
    }

    this.initialized = true;
    this.logger.info('Monitoring system initialized');
  }

  /**
   * Set up metrics export endpoint
   */
  _setupMetricsEndpoint() {
    // In browser, expose metrics via global
    if (typeof window !== 'undefined') {
      window.__exportMetrics = () => this.registry.export();
      window.__exportTraces = () => this.tracer.export();
      window.__exportLogs = () => this.logger.export();
    }
  }

  /**
   * Start periodic metric collection
   */
  _startPeriodicCollection() {
    setInterval(() => {
      // Collect system metrics
      if (performance.memory) {
        this.metrics.setMemoryUsage('heap_used', performance.memory.usedJSHeapSize);
      }

      // Check alert thresholds
      const alerts = this.alerts.checkThresholds(this.metrics);
      for (const alert of alerts) {
        this.alerts.sendAlert(
          alert.severity,
          alert.message,
          { type: alert.type, value: alert.value },
          alert.type
        );
      }
    }, 60000); // Every minute
  }

  /**
   * Start periodic log flushing
   */
  _startLogFlushing() {
    setInterval(async () => {
      if (this.config.logsEndpoint) {
        await this.logger.flush(this.config.logsEndpoint);
      }
    }, 30000); // Every 30 seconds
  }

  /**
   * Get monitoring context for current operation
   */
  createContext(operationName, parentContext = null) {
    const traceId = parentContext?.traceId || this.tracer.startTrace();
    const spanId = this.tracer.startSpan(operationName, parentContext?.spanId);

    return {
      traceId,
      spanId,
      finish: (tags = {}) => this.tracer.finishSpan(spanId, tags)
    };
  }
}

// ============================================================================
// Global Instance
// ============================================================================

const globalMonitoring = new MonitoringSystem();
const globalRegistry = globalMonitoring.registry;
const globalMetrics = globalMonitoring.metrics;
const globalTracer = globalMonitoring.tracer;
const globalLogger = globalMonitoring.logger;

// ============================================================================
// Exports
// ============================================================================

export {
  MonitoringSystem,
  MetricsRegistry,
  ApplicationMetrics,
  TracingManager,
  StructuredLogger,
  PerformanceMonitor,
  AlertManager,
  globalMonitoring,
  globalRegistry,
  globalMetrics,
  globalTracer,
  globalLogger
};

export default globalMonitoring;

