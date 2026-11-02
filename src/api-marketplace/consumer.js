/**
 * API Consumer
 * Handles API discovery and consumption
 */

export class APIConsumer {
  constructor(options = {}) {
    this.registry = options.registry;
    this.keyManager = options.keyManager;
    this.rateLimiter = options.rateLimiter;
    this.analytics = options.analytics;
  }

  /**
   * Call an API endpoint
   */
  async call(apiId, request) {
    const { endpoint, method = 'GET', data = {}, apiKey } = request;

    // Validate API key
    const validation = await this.keyManager.validateKey(apiKey);
    if (!validation || !validation.valid) {
      throw new Error('Invalid or expired API key');
    }

    const keyData = validation.keyData;

    // Check rate limits
    const rateLimitResult = await this.rateLimiter.checkLimit(keyData.keyId, keyData.quotas);
    if (!rateLimitResult.allowed) {
      throw new Error(`Rate limit exceeded: ${rateLimitResult.reason}`);
    }

    // Get API
    const api = await this.registry.getAPI(apiId);
    if (!api || api.status !== 'published') {
      throw new Error('API not available');
    }

    // Find endpoint
    const ep = api.endpoints.find(
      e => e.path === endpoint && e.method === method
    );

    if (!ep) {
      throw new Error('Endpoint not found');
    }

    // Execute
    const startTime = Date.now();
    try {
      const result = await ep.handler(data, {
        apiId,
        consumerId: keyData.consumerId
      });

      const responseTime = Date.now() - startTime;

      // Record usage
      await this.analytics.recordRequest({
        apiId,
        apiKeyId: keyData.keyId,
        consumerId: keyData.consumerId,
        endpoint,
        method,
        statusCode: 200,
        responseTime,
        timestamp: new Date()
      });

      return {
        success: true,
        data: result,
        metadata: {
          responseTime,
          rateLimitRemaining: rateLimitResult.remaining
        }
      };
    } catch (error) {
      await this.analytics.recordRequest({
        apiId,
        apiKeyId: keyData.keyId,
        consumerId: keyData.consumerId,
        endpoint,
        method,
        statusCode: 500,
        responseTime: Date.now() - startTime,
        timestamp: new Date(),
        error: error.message
      });

      throw error;
    }
  }

  /**
   * Discover APIs by category
   */
  async discover(filters = {}) {
    const apis = await this.registry.list(filters);

    return apis.map(api => ({
      apiId: api.apiId,
      name: api.name,
      description: api.description,
      version: api.version,
      category: api.category,
      pricing: api.pricing,
      metrics: {
        activeConsumers: api.metrics.activeConsumers,
        avgResponseTime: api.metrics.avgResponseTime
      },
      publisher: {
        displayName: api.publisher.displayName,
        reputation: api.publisher.reputation
      }
    }));
  }

  /**
   * Get usage statistics
   */
  async getUsage(consumerId, timeRange = '30d') {
    return await this.analytics.getConsumerMetrics(consumerId, timeRange);
  }

  /**
   * Get API key status
   */
  async getKeyStatus(apiKey) {
    const validation = await this.keyManager.validateKey(apiKey);
    if (!validation) {
      return { valid: false };
    }

    const keyData = validation.keyData;
    const stats = await this.keyManager.getKeyStats(keyData.keyId);

    return {
      valid: validation.valid,
      status: keyData.status,
      quotas: stats.quotaUsage,
      usage: {
        totalRequests: stats.totalRequests,
        lastUsed: stats.lastUsed
      },
      expiresIn: stats.daysUntilExpiry
    };
  }
}

export default APIConsumer;
