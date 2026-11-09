/**
 * Monitoring Integration Example
 *
 * Shows how to integrate the monitoring and observability system
 * into Formula Nebula application code.
 */

import {
  globalMonitoring,
  globalMetrics,
  globalTracer,
  globalLogger
} from './metrics.js';

// ============================================================================
// Initialization
// ============================================================================

/**
 * Initialize monitoring system on application startup
 */
export async function initializeMonitoring() {
  const config = {
    serviceName: 'formula-nebula',
    environment: process.env.NODE_ENV || 'development',
    metricsEndpoint: '/metrics',
    logsEndpoint: process.env.LOGS_ENDPOINT || 'http://localhost:5000',
    tracingEndpoint: process.env.TRACING_ENDPOINT || 'http://localhost:14268/api/traces',
    pagerDutyIntegrationKey: process.env.PAGERDUTY_INTEGRATION_KEY || '',
    alertThresholds: {
      errorRate: parseFloat(process.env.ALERT_ERROR_RATE || '5.0'),
      responseTime: parseInt(process.env.ALERT_RESPONSE_TIME || '1000'),
      memoryUsage: parseFloat(process.env.ALERT_MEMORY_THRESHOLD || '85')
    }
  };

  await globalMonitoring.initialize();

  globalLogger.info('Monitoring system initialized', {
    serviceName: config.serviceName,
    environment: config.environment
  });

  return globalMonitoring;
}

// ============================================================================
// HTTP Request Monitoring
// ============================================================================

/**
 * Middleware for monitoring HTTP requests
 */
export function httpMonitoringMiddleware(handler) {
  return async (req, res) => {
    const startTime = performance.now();
    const spanId = globalTracer.startSpan('http_request');

    // Add trace context to request
    req.traceId = globalTracer.traceId;
    req.spanId = spanId;

    globalTracer.setTags(spanId, {
      'http.method': req.method,
      'http.url': req.url,
      'http.user_agent': req.headers['user-agent']
    });

    try {
      // Execute handler
      const result = await handler(req, res);

      // Record metrics
      const duration = (performance.now() - startTime) / 1000;
      globalMetrics.recordHttpRequest(
        req.method,
        req.url,
        res.statusCode || 200,
        duration
      );

      globalTracer.finishSpan(spanId, {
        'http.status_code': res.statusCode || 200,
        success: true
      });

      globalLogger.info('HTTP request completed', {
        traceId: req.traceId,
        spanId,
        method: req.method,
        url: req.url,
        status: res.statusCode || 200,
        duration
      });

      return result;
    } catch (error) {
      // Record error
      globalMetrics.recordError('http_request', 'error');

      globalTracer.setTags(spanId, {
        error: true,
        'error.message': error.message
      });
      globalTracer.finishSpan(spanId);

      globalLogger.error('HTTP request failed', {
        traceId: req.traceId,
        spanId,
        method: req.method,
        url: req.url
      }, error);

      throw error;
    }
  };
}

// ============================================================================
// WebSocket Monitoring
// ============================================================================

/**
 * Monitor WebSocket connections and messages
 */
export class MonitoredWebSocket {
  constructor(ws) {
    this.ws = ws;
    this.setupMonitoring();
  }

  setupMonitoring() {
    // Track connection
    this.ws.on('open', () => {
      this.updateConnectionCount(1);
      globalLogger.info('WebSocket connected', {
        id: this.ws.id
      });
    });

    this.ws.on('close', () => {
      this.updateConnectionCount(-1);
      globalLogger.info('WebSocket disconnected', {
        id: this.ws.id
      });
    });

    // Monitor messages
    this.ws.on('message', (data) => {
      try {
        const message = JSON.parse(data);
        globalMetrics.recordWsMessage('inbound', message.type || 'unknown');

        globalLogger.debug('WebSocket message received', {
          id: this.ws.id,
          type: message.type,
          size: data.length
        });
      } catch (error) {
        globalMetrics.recordError('ws_message_parse', 'error');
      }
    });
  }

  updateConnectionCount(delta) {
    // This should be tracked globally in your WebSocket server
    const currentCount = (globalMetrics.wsConnectionsActive.values.get('{}') || 0) + delta;
    globalMetrics.setWsConnections(Math.max(0, currentCount));
  }

  send(data) {
    try {
      const message = typeof data === 'string' ? JSON.parse(data) : data;
      globalMetrics.recordWsMessage('outbound', message.type || 'unknown');

      this.ws.send(typeof data === 'string' ? data : JSON.stringify(data));

      globalLogger.debug('WebSocket message sent', {
        id: this.ws.id,
        type: message.type,
        size: JSON.stringify(data).length
      });
    } catch (error) {
      globalMetrics.recordError('ws_message_send', 'error');
      globalLogger.error('Failed to send WebSocket message', {
        id: this.ws.id
      }, error);
      throw error;
    }
  }
}

// ============================================================================
// Graph Operations Monitoring
// ============================================================================

/**
 * Monitor graph loading and updates
 */
export async function loadGraphWithMonitoring(dataSource) {
  const context = globalMonitoring.createContext('loadGraph');
  const startTime = performance.now();

  try {
    globalLogger.info('Loading graph data', {
      traceId: context.traceId,
      spanId: context.spanId,
      source: dataSource
    });

    // Load graph data
    const graph = await loadGraphData(dataSource);

    // Update metrics
    globalMetrics.setGraphStats(
      graph.nodes.length,
      graph.links.length
    );

    const duration = (performance.now() - startTime) / 1000;

    context.finish({
      nodes: graph.nodes.length,
      links: graph.links.length,
      success: true
    });

    globalLogger.info('Graph loaded successfully', {
      traceId: context.traceId,
      nodes: graph.nodes.length,
      links: graph.links.length,
      duration
    });

    return graph;
  } catch (error) {
    globalMetrics.recordError('graph_load', 'error');

    context.finish({ error: true });

    globalLogger.error('Failed to load graph', {
      traceId: context.traceId,
      source: dataSource
    }, error);

    throw error;
  }
}

// Placeholder for actual implementation
async function loadGraphData(_source) {
  // Your actual graph loading code here
  return { nodes: [], links: [] };
}

// ============================================================================
// Rendering Performance Monitoring
// ============================================================================

/**
 * Monitor rendering performance
 */
export class RenderingMonitor {
  constructor() {
    this.frameCount = 0;
    this.lastFrameTime = performance.now();
    this.fpsUpdateInterval = 1000; // Update FPS every second
    this.lastFpsUpdate = performance.now();
  }

  onFrameRender() {
    const now = performance.now();
    const frameTime = now - this.lastFrameTime;

    // Record frame time
    globalMetrics.recordRenderFrame(
      this.calculateCurrentFPS(),
      frameTime
    );

    // Log slow frames
    if (frameTime > 33.33) { // Slower than 30fps
      globalLogger.warn('Slow frame detected', {
        frameTime,
        targetTime: 16.67 // 60fps target
      });
    }

    this.frameCount++;
    this.lastFrameTime = now;

    // Update FPS periodically
    if (now - this.lastFpsUpdate >= this.fpsUpdateInterval) {
      const fps = this.calculateCurrentFPS();
      globalLogger.debug('FPS update', { fps });
      this.lastFpsUpdate = now;
    }
  }

  calculateCurrentFPS() {
    const elapsed = performance.now() - this.lastFpsUpdate;
    return elapsed > 0 ? (this.frameCount / elapsed) * 1000 : 0;
  }

  reset() {
    this.frameCount = 0;
    this.lastFrameTime = performance.now();
    this.lastFpsUpdate = performance.now();
  }
}

// ============================================================================
// Search Operations Monitoring
// ============================================================================

/**
 * Monitor search queries
 */
export async function searchWithMonitoring(query, type = 'text') {
  const context = globalMonitoring.createContext('search');
  const startTime = performance.now();

  try {
    globalLogger.info('Search started', {
      traceId: context.traceId,
      spanId: context.spanId,
      query,
      type
    });

    // Perform search
    const results = await performSearch(query, type);

    const duration = (performance.now() - startTime) / 1000;

    // Record metrics
    globalMetrics.recordSearch(type, duration);

    context.finish({
      type,
      resultsCount: results.length,
      success: true
    });

    globalLogger.info('Search completed', {
      traceId: context.traceId,
      query,
      type,
      resultsCount: results.length,
      duration
    });

    return results;
  } catch (error) {
    globalMetrics.recordError('search', 'error');

    context.finish({ error: true });

    globalLogger.error('Search failed', {
      traceId: context.traceId,
      query,
      type
    }, error);

    throw error;
  }
}

// Placeholder for actual implementation
async function performSearch(_query, _type) {
  // Your actual search code here
  return [];
}

// ============================================================================
// Error Tracking
// ============================================================================

/**
 * Global error handler with monitoring
 */
export function setupErrorMonitoring() {
  // Uncaught errors
  window.addEventListener('error', (event) => {
    globalMetrics.recordError('uncaught_error', 'error');

    globalLogger.error('Uncaught error', {
      message: event.message,
      filename: event.filename,
      line: event.lineno,
      column: event.colno
    }, event.error);

    // Send critical alert for unhandled errors
    if (globalMonitoring.config.environment === 'production') {
      globalMonitoring.alerts.sendAlert(
        'error',
        'Uncaught error in production',
        {
          message: event.message,
          filename: event.filename,
          stack: event.error?.stack
        },
        'uncaught_error'
      );
    }
  });

  // Unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    globalMetrics.recordError('unhandled_rejection', 'error');

    globalLogger.error('Unhandled promise rejection', {
      reason: event.reason
    }, event.reason);

    if (globalMonitoring.config.environment === 'production') {
      globalMonitoring.alerts.sendAlert(
        'error',
        'Unhandled promise rejection',
        {
          reason: String(event.reason)
        },
        'unhandled_rejection'
      );
    }
  });
}

// ============================================================================
// Memory Monitoring
// ============================================================================

/**
 * Periodic memory usage monitoring
 */
export function startMemoryMonitoring(interval = 10000) {
  if (!performance.memory) {
    globalLogger.warn('Performance.memory API not available');
    return null;
  }

  const timerId = setInterval(() => {
    const memory = performance.memory;

    globalMetrics.setMemoryUsage('heap_used', memory.usedJSHeapSize);
    globalMetrics.setMemoryUsage('heap_total', memory.totalJSHeapSize);
    globalMetrics.setMemoryUsage('heap_limit', memory.jsHeapSizeLimit);

    const usagePercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;

    // Log high memory usage
    if (usagePercent > 80) {
      globalLogger.warn('High memory usage detected', {
        usagePercent: usagePercent.toFixed(2),
        usedMB: (memory.usedJSHeapSize / 1048576).toFixed(2),
        limitMB: (memory.jsHeapSizeLimit / 1048576).toFixed(2)
      });
    }
  }, interval);

  return timerId;
}

// ============================================================================
// Complete Integration Example
// ============================================================================

/**
 * Full monitoring setup for Formula Nebula
 */
export async function setupCompleteMonitoring() {
  // 1. Initialize monitoring system
  await initializeMonitoring();

  // 2. Setup error monitoring
  setupErrorMonitoring();

  // 3. Start memory monitoring
  startMemoryMonitoring();

  // 4. Create rendering monitor
  const renderMonitor = new RenderingMonitor();

  // 5. Setup periodic health checks
  setInterval(() => {
    const health = {
      uptime: performance.now(),
      memory: performance.memory ? {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize
      } : null
    };

    globalLogger.debug('Health check', health);
  }, 60000); // Every minute

  globalLogger.info('Complete monitoring setup finished');

  return {
    monitoring: globalMonitoring,
    renderMonitor
  };
}

// ============================================================================
// Usage Example
// ============================================================================

/**
 * Example: Using monitoring in main application
 */
export async function exampleUsage() {
  // Initialize
  const { monitoring, renderMonitor } = await setupCompleteMonitoring();

  // In your render loop
  function renderFrame() {
    renderMonitor.onFrameRender();
    // ... your rendering code
  }

  // In your HTTP handler
  const _monitoredHandler = httpMonitoringMiddleware(async (_req, _res) => {
    // Your handler code
  });

  // In your search function
  const _results = await searchWithMonitoring('Riemann Hypothesis', 'semantic');

  // In your graph loading
  const _graph = await loadGraphWithMonitoring('algebraic-geometry.json');

  // Custom metric
  globalMetrics.recordError('custom_error', 'warning');

  // Custom log
  globalLogger.info('Custom event', {
    userId: 123,
    action: 'view_proof'
  });
}
