/**
 * Request Analytics Middleware
 * Collect, aggregate, and store request metrics
 */

export class AnalyticsMiddleware {
  constructor(options = {}) {
    this.enabled = options.enabled !== false;
    this.sampleRate = options.sampleRate || 1.0; // 100% sampling by default
    this.batchSize = options.batchSize || 100;
    this.excludePaths = new Set(options.excludePaths || []);
  }

  async handle(request, env, ctx) {
    if (!this.enabled || !this.shouldSample()) {
      return null;
    }

    // Start timing
    ctx.analyticsStart = Date.now();

    return null; // Continue to next middleware
  }

  async recordMetrics(request, response, ctx, env) {
    if (!this.enabled || !env.ANALYTICS_KV) {
      return;
    }

    const url = new URL(request.url);

    // Skip excluded paths
    if (this.excludePaths.has(url.pathname)) {
      return;
    }

    const duration = ctx.analyticsStart
      ? Date.now() - ctx.analyticsStart
      : 0;

    const metrics = {
      timestamp: Date.now(),
      method: request.method,
      path: url.pathname,
      status: response.status,
      duration: duration,
      clientId: this.getClientId(request),
      userAgent: request.headers.get('User-Agent') || '',
      referer: request.headers.get('Referer') || '',
      country: ctx.geoData?.country || 'XX',
      colo: ctx.geoData?.colo || 'XXX',
      cacheStatus: response.headers.get('X-Cache-Status') || 'NONE',
      contentLength: response.headers.get('Content-Length') || '0',
      protocol: url.protocol,
      host: url.host
    };

    // Store metrics asynchronously
    ctx.waitUntil(this.storeMetrics(metrics, env));
  }

  async storeMetrics(metrics, env) {
    try {
      // Create time-based key for aggregation
      const timestamp = new Date(metrics.timestamp);
      const minuteKey = this.getTimeKey(timestamp, 'minute');
      const hourKey = this.getTimeKey(timestamp, 'hour');
      const dayKey = this.getTimeKey(timestamp, 'day');

      // Store raw metric
      const rawKey = `analytics:raw:${metrics.timestamp}:${Math.random().toString(36).substring(7)}`;
      await env.ANALYTICS_KV.put(rawKey, JSON.stringify(metrics), {
        expirationTtl: 86400 // Keep raw data for 1 day
      });

      // Update aggregated metrics
      await Promise.all([
        this.updateAggregatedMetrics(minuteKey, metrics, env, 3600),      // 1 hour TTL
        this.updateAggregatedMetrics(hourKey, metrics, env, 86400),       // 1 day TTL
        this.updateAggregatedMetrics(dayKey, metrics, env, 2592000)       // 30 days TTL
      ]);

      // Update endpoint-specific metrics
      await this.updateEndpointMetrics(metrics, env);

    } catch (error) {
      console.error('Error storing metrics:', error);
    }
  }

  async updateAggregatedMetrics(key, metrics, env, ttl) {
    try {
      let data = await env.ANALYTICS_KV.get(key, { type: 'json' });

      if (!data) {
        data = {
          requests: 0,
          errors: 0,
          totalDuration: 0,
          methods: {},
          statuses: {},
          paths: {},
          countries: {},
          cacheHits: 0,
          cacheMisses: 0
        };
      }

      // Update aggregated data
      data.requests += 1;
      if (metrics.status >= 400) {
        data.errors += 1;
      }
      data.totalDuration += metrics.duration;

      // Count by method
      data.methods[metrics.method] = (data.methods[metrics.method] || 0) + 1;

      // Count by status
      data.statuses[metrics.status] = (data.statuses[metrics.status] || 0) + 1;

      // Count by path (top 100)
      if (Object.keys(data.paths).length < 100 || data.paths[metrics.path]) {
        data.paths[metrics.path] = (data.paths[metrics.path] || 0) + 1;
      }

      // Count by country
      data.countries[metrics.country] = (data.countries[metrics.country] || 0) + 1;

      // Cache statistics
      if (metrics.cacheStatus === 'HIT') {
        data.cacheHits += 1;
      } else if (metrics.cacheStatus === 'MISS') {
        data.cacheMisses += 1;
      }

      await env.ANALYTICS_KV.put(key, JSON.stringify(data), {
        expirationTtl: ttl
      });

    } catch (error) {
      console.error('Error updating aggregated metrics:', error);
    }
  }

  async updateEndpointMetrics(metrics, env) {
    const endpointKey = `analytics:endpoint:${this.normalizeEndpoint(metrics.path)}`;

    try {
      let data = await env.ANALYTICS_KV.get(endpointKey, { type: 'json' });

      if (!data) {
        data = {
          path: metrics.path,
          hits: 0,
          errors: 0,
          totalDuration: 0,
          minDuration: Infinity,
          maxDuration: 0,
          p50: 0,
          p95: 0,
          p99: 0,
          recentDurations: []
        };
      }

      // Update endpoint stats
      data.hits += 1;
      if (metrics.status >= 400) {
        data.errors += 1;
      }
      data.totalDuration += metrics.duration;
      data.minDuration = Math.min(data.minDuration, metrics.duration);
      data.maxDuration = Math.max(data.maxDuration, metrics.duration);

      // Track recent durations for percentile calculation (last 1000)
      data.recentDurations.push(metrics.duration);
      if (data.recentDurations.length > 1000) {
        data.recentDurations = data.recentDurations.slice(-1000);
      }

      // Calculate percentiles
      const sorted = [...data.recentDurations].sort((a, b) => a - b);
      data.p50 = this.percentile(sorted, 0.5);
      data.p95 = this.percentile(sorted, 0.95);
      data.p99 = this.percentile(sorted, 0.99);

      await env.ANALYTICS_KV.put(endpointKey, JSON.stringify(data), {
        expirationTtl: 2592000 // 30 days
      });

    } catch (error) {
      console.error('Error updating endpoint metrics:', error);
    }
  }

  async getMetrics(timeRange, env) {
    const key = this.getTimeKey(new Date(), timeRange);

    try {
      const data = await env.ANALYTICS_KV.get(key, { type: 'json' });
      return data || null;
    } catch (error) {
      console.error('Error getting metrics:', error);
      return null;
    }
  }

  async getEndpointMetrics(path, env) {
    const key = `analytics:endpoint:${this.normalizeEndpoint(path)}`;

    try {
      const data = await env.ANALYTICS_KV.get(key, { type: 'json' });
      return data || null;
    } catch (error) {
      console.error('Error getting endpoint metrics:', error);
      return null;
    }
  }

  getTimeKey(date, granularity) {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const hour = String(date.getUTCHours()).padStart(2, '0');
    const minute = String(date.getUTCMinutes()).padStart(2, '0');

    switch (granularity) {
      case 'minute':
        return `analytics:agg:${year}-${month}-${day}T${hour}:${minute}`;
      case 'hour':
        return `analytics:agg:${year}-${month}-${day}T${hour}`;
      case 'day':
        return `analytics:agg:${year}-${month}-${day}`;
      default:
        return `analytics:agg:${year}-${month}-${day}`;
    }
  }

  normalizeEndpoint(path) {
    // Normalize paths with IDs: /api/users/123 -> /api/users/:id
    return path.replace(/\/\d+/g, '/:id')
               .replace(/\/[a-f0-9-]{36}/gi, '/:uuid');
  }

  percentile(sorted, p) {
    if (sorted.length === 0) return 0;
    const index = Math.ceil(sorted.length * p) - 1;
    return sorted[Math.max(0, index)];
  }

  shouldSample() {
    return Math.random() < this.sampleRate;
  }

  getClientId(request) {
    return request.headers.get('CF-Connecting-IP') ||
           request.headers.get('X-Forwarded-For')?.split(',')[0].trim() ||
           'unknown';
  }

  /**
   * Generate analytics dashboard data
   */
  async getDashboardData(env, timeRange = 'hour') {
    try {
      const metrics = await this.getMetrics(timeRange, env);

      if (!metrics) {
        return null;
      }

      const avgDuration = metrics.requests > 0
        ? metrics.totalDuration / metrics.requests
        : 0;

      const errorRate = metrics.requests > 0
        ? (metrics.errors / metrics.requests) * 100
        : 0;

      const cacheHitRate = (metrics.cacheHits + metrics.cacheMisses) > 0
        ? (metrics.cacheHits / (metrics.cacheHits + metrics.cacheMisses)) * 100
        : 0;

      return {
        timeRange: timeRange,
        totalRequests: metrics.requests,
        totalErrors: metrics.errors,
        errorRate: errorRate.toFixed(2) + '%',
        avgDuration: avgDuration.toFixed(2) + 'ms',
        cacheHitRate: cacheHitRate.toFixed(2) + '%',
        topPaths: this.getTop(metrics.paths, 10),
        topCountries: this.getTop(metrics.countries, 10),
        statusDistribution: metrics.statuses,
        methodDistribution: metrics.methods
      };

    } catch (error) {
      console.error('Error generating dashboard data:', error);
      return null;
    }
  }

  getTop(obj, n) {
    return Object.entries(obj)
      .sort(([, a], [, b]) => b - a)
      .slice(0, n)
      .map(([key, value]) => ({ key, value }));
  }
}
