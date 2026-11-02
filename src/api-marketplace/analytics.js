/**
 * API Analytics
 * Usage tracking and metrics calculation
 */

export class APIAnalytics {
  constructor(options = {}) {
    this.storage = options.storage || new Map();
    this.aggregationInterval = options.aggregationInterval || 3600000; // 1 hour
  }

  /**
   * Record API request
   */
  async recordRequest(record) {
    const recordId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const requestRecord = {
      recordId,
      ...record,
      timestamp: record.timestamp || new Date()
    };

    await this.storage.set(recordId, requestRecord);

    // Update real-time metrics
    await this.updateMetrics(record.apiId, requestRecord);

    return recordId;
  }

  /**
   * Record subscription event
   */
  async recordSubscription(event) {
    const eventId = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    await this.storage.set(eventId, {
      eventId,
      type: 'subscription',
      ...event
    });

    return eventId;
  }

  /**
   * Get publisher metrics
   */
  async getPublisherMetrics(publisherId, timeRange = '30d') {
    const { startDate, endDate } = this.parseTimeRange(timeRange);

    const apiIds = await this.getPublisherAPIs(publisherId);
    const requests = await this.getRequestsInRange(apiIds, startDate, endDate);

    return {
      publisherId,
      timeRange,
      totalAPIs: apiIds.length,
      totalRequests: requests.length,
      totalConsumers: new Set(requests.map(r => r.consumerId)).size,
      avgResponseTime: this.calculateAverage(requests.map(r => r.responseTime)),
      errorRate: requests.filter(r => r.statusCode >= 400).length / requests.length,
      requestsByAPI: this.groupByAPI(requests),
      requestsByDay: this.groupByDay(requests),
      topConsumers: this.getTopConsumers(requests, 10),
      topEndpoints: this.getTopEndpoints(requests, 10),
      bandwidthUsed: requests.reduce((sum, r) => sum + (r.bytesTransferred || 0), 0)
    };
  }

  /**
   * Get consumer metrics
   */
  async getConsumerMetrics(consumerId, timeRange = '30d') {
    const { startDate, endDate } = this.parseTimeRange(timeRange);
    const requests = await this.getConsumerRequests(consumerId, startDate, endDate);

    const apiUsage = this.groupByAPI(requests);

    return {
      consumerId,
      timeRange,
      totalRequests: requests.length,
      totalAPIs: Object.keys(apiUsage).length,
      avgResponseTime: this.calculateAverage(requests.map(r => r.responseTime)),
      errorRate: requests.filter(r => r.statusCode >= 400).length / requests.length,
      requestsByAPI: apiUsage,
      requestsByDay: this.groupByDay(requests),
      bandwidthUsed: requests.reduce((sum, r) => sum + (r.bytesTransferred || 0), 0),
      mostUsedAPIs: Object.entries(apiUsage)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([apiId, count]) => ({ apiId, count }))
    };
  }

  /**
   * Get API metrics
   */
  async getAPIMetrics(apiId, timeRange = '30d') {
    const { startDate, endDate } = this.parseTimeRange(timeRange);
    const requests = await this.getRequestsInRange([apiId], startDate, endDate);

    return {
      apiId,
      timeRange,
      totalRequests: requests.length,
      uniqueConsumers: new Set(requests.map(r => r.consumerId)).size,
      avgResponseTime: this.calculateAverage(requests.map(r => r.responseTime)),
      p95ResponseTime: this.calculatePercentile(requests.map(r => r.responseTime), 95),
      p99ResponseTime: this.calculatePercentile(requests.map(r => r.responseTime), 99),
      errorRate: requests.filter(r => r.statusCode >= 400).length / requests.length,
      requestsByDay: this.groupByDay(requests),
      requestsByEndpoint: this.groupByEndpoint(requests),
      requestsByStatus: this.groupByStatus(requests),
      topConsumers: this.getTopConsumers(requests, 10),
      bandwidthUsed: requests.reduce((sum, r) => sum + (r.bytesTransferred || 0), 0)
    };
  }

  /**
   * Update real-time API metrics
   */
  async updateMetrics(apiId, request) {
    const api = this.storage.get(apiId);
    if (!api || !api.metrics) {
      return;
    }

    const metrics = api.metrics;

    // Update rolling averages
    metrics.totalCalls++;

    const alpha = 0.1; // Exponential moving average weight
    metrics.avgResponseTime = metrics.avgResponseTime * (1 - alpha) + request.responseTime * alpha;

    if (request.statusCode >= 400) {
      metrics.errorRate = metrics.errorRate * (1 - alpha) + alpha;
    } else {
      metrics.errorRate = metrics.errorRate * (1 - alpha);
    }

    // Update active consumers count (approximate)
    const recentRequests = await this.getRequestsInRange([apiId], Date.now() - 86400000, Date.now());
    metrics.activeConsumers = new Set(recentRequests.map(r => r.consumerId)).size;

    await this.storage.set(apiId, api);
  }

  // Helper methods

  parseTimeRange(timeRange) {
    const match = timeRange.match(/^(\d+)([hdwm])$/);
    if (!match) {
      throw new Error('Invalid time range format');
    }

    const [, value, unit] = match;
    const amount = parseInt(value);

    const multipliers = {
      h: 3600000,
      d: 86400000,
      w: 604800000,
      m: 2592000000
    };

    const endDate = Date.now();
    const startDate = endDate - amount * multipliers[unit];

    return { startDate, endDate };
  }

  async getPublisherAPIs(publisherId) {
    const apiIds = [];
    for (const [key, value] of this.storage.entries()) {
      if (value.publisher && value.publisher.userId === publisherId) {
        apiIds.push(value.apiId);
      }
    }
    return apiIds;
  }

  async getRequestsInRange(apiIds, startDate, endDate) {
    const requests = [];
    for (const [key, value] of this.storage.entries()) {
      if (key.startsWith('req_') &&
          apiIds.includes(value.apiId) &&
          value.timestamp >= startDate &&
          value.timestamp <= endDate) {
        requests.push(value);
      }
    }
    return requests;
  }

  async getConsumerRequests(consumerId, startDate, endDate) {
    const requests = [];
    for (const [key, value] of this.storage.entries()) {
      if (key.startsWith('req_') &&
          value.consumerId === consumerId &&
          value.timestamp >= startDate &&
          value.timestamp <= endDate) {
        requests.push(value);
      }
    }
    return requests;
  }

  groupByAPI(requests) {
    const grouped = {};
    requests.forEach(r => {
      grouped[r.apiId] = (grouped[r.apiId] || 0) + 1;
    });
    return grouped;
  }

  groupByDay(requests) {
    const grouped = {};
    requests.forEach(r => {
      const day = new Date(r.timestamp).toISOString().split('T')[0];
      grouped[day] = (grouped[day] || 0) + 1;
    });
    return grouped;
  }

  groupByEndpoint(requests) {
    const grouped = {};
    requests.forEach(r => {
      const key = `${r.method} ${r.endpoint}`;
      grouped[key] = (grouped[key] || 0) + 1;
    });
    return grouped;
  }

  groupByStatus(requests) {
    const grouped = {};
    requests.forEach(r => {
      const statusClass = Math.floor(r.statusCode / 100) * 100;
      grouped[statusClass] = (grouped[statusClass] || 0) + 1;
    });
    return grouped;
  }

  getTopConsumers(requests, limit) {
    const counts = {};
    requests.forEach(r => {
      counts[r.consumerId] = (counts[r.consumerId] || 0) + 1;
    });

    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([consumerId, count]) => ({ consumerId, count }));
  }

  getTopEndpoints(requests, limit) {
    const counts = {};
    requests.forEach(r => {
      const key = `${r.method} ${r.endpoint}`;
      counts[key] = (counts[key] || 0) + 1;
    });

    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([endpoint, count]) => ({ endpoint, count }));
  }

  calculateAverage(values) {
    if (values.length === 0) return 0;
    return values.reduce((sum, v) => sum + v, 0) / values.length;
  }

  calculatePercentile(values, percentile) {
    if (values.length === 0) return 0;
    const sorted = values.sort((a, b) => a - b);
    const index = Math.ceil(sorted.length * percentile / 100) - 1;
    return sorted[index];
  }
}

export default APIAnalytics;
