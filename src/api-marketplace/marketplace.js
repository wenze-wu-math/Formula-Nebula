/**
 * API Marketplace - Main Orchestrator
 * Coordinates API publishing, discovery, and consumption
 */

import { APIKeyManager, APIKeyValidator } from '../api-keys/management.js';
import { RateLimiter, RateLimitMiddleware } from '../api-keys/rate-limiter.js';
import { APIPublisher } from './publisher.js';
import { APIConsumer } from './consumer.js';
import { APIRegistry } from './registry.js';
import { APIAnalytics } from './analytics.js';
import { RevenueManager } from './revenue.js';
import { DocumentationGenerator } from './documentation.js';

export class APIMarketplace {
  constructor(options = {}) {
    // Core components
    this.storage = options.storage || new Map();
    this.keyManager = new APIKeyManager({ storage: this.storage });
    this.rateLimiter = new RateLimiter({ storage: this.storage });
    this.registry = new APIRegistry({ storage: this.storage });
    this.analytics = new APIAnalytics({ storage: this.storage });
    this.revenueManager = new RevenueManager({ storage: this.storage });
    this.docGenerator = new DocumentationGenerator();

    // High-level interfaces
    this.publisher = new APIPublisher({
      registry: this.registry,
      docGenerator: this.docGenerator,
      revenueManager: this.revenueManager
    });

    this.consumer = new APIConsumer({
      registry: this.registry,
      keyManager: this.keyManager,
      rateLimiter: this.rateLimiter,
      analytics: this.analytics
    });

    // Middleware
    this.keyValidator = new APIKeyValidator(this.keyManager);
    this.rateLimitMiddleware = new RateLimitMiddleware(
      this.rateLimiter,
      this.keyManager
    );

    // Configuration
    this.config = {
      defaultRevenueShare: options.defaultRevenueShare || 70, // 70% to publisher
      platformFee: options.platformFee || 30, // 30% platform fee
      maxAPIsPerPublisher: options.maxAPIsPerPublisher || 50,
      maxKeysPerConsumer: options.maxKeysPerConsumer || 10
    };
  }

  /**
   * Handle incoming API request
   * Full request lifecycle: auth -> rate limit -> execute -> track
   */
  async handleRequest(req) {
    const startTime = Date.now();

    try {
      // 1. Validate API key
      const authResult = await this.keyValidator.validate(req);
      if (!authResult.valid) {
        return this.createErrorResponse(
          authResult.statusCode,
          authResult.error
        );
      }

      const { keyData } = authResult;

      // 2. Check rate limits
      const rateLimitResult = await this.rateLimitMiddleware.handle(req, keyData);
      if (!rateLimitResult.allowed) {
        await this.analytics.recordRequest({
          apiId: req.apiId,
          apiKeyId: keyData.keyId,
          consumerId: keyData.consumerId,
          endpoint: req.endpoint,
          method: req.method,
          statusCode: rateLimitResult.statusCode,
          responseTime: Date.now() - startTime,
          timestamp: new Date(),
          error: rateLimitResult.error
        });

        return this.createErrorResponse(
          rateLimitResult.statusCode,
          rateLimitResult.error,
          rateLimitResult.headers
        );
      }

      // 3. Get API definition
      const api = await this.registry.getAPI(req.apiId);
      if (!api) {
        return this.createErrorResponse(404, 'API not found');
      }

      if (api.status !== 'published') {
        return this.createErrorResponse(403, 'API not available');
      }

      // 4. Find and execute endpoint
      const endpoint = api.endpoints.find(
        ep => ep.path === req.endpoint && ep.method === req.method
      );

      if (!endpoint) {
        return this.createErrorResponse(404, 'Endpoint not found');
      }

      // 5. Execute the API handler
      const result = await endpoint.handler(req.data, {
        apiId: api.apiId,
        consumerId: keyData.consumerId,
        metadata: req.metadata
      });

      const responseTime = Date.now() - startTime;
      const bytesTransferred = JSON.stringify(result).length;

      // 6. Record analytics
      await this.analytics.recordRequest({
        apiId: req.apiId,
        apiKeyId: keyData.keyId,
        consumerId: keyData.consumerId,
        endpoint: req.endpoint,
        method: req.method,
        statusCode: 200,
        responseTime,
        bytesTransferred,
        timestamp: new Date()
      });

      // 7. Update key usage
      await this.keyManager.recordUsage(keyData.keyId, { bytesTransferred });

      // 8. Track revenue
      await this.revenueManager.recordUsage({
        apiId: api.apiId,
        publisherId: api.publisher.userId,
        consumerId: keyData.consumerId,
        cost: this.calculateCost(api.pricing, 1),
        timestamp: new Date()
      });

      return this.createSuccessResponse(result, {
        ...rateLimitResult.headers,
        'X-Response-Time': responseTime
      });

    } catch (error) {
      const responseTime = Date.now() - startTime;

      await this.analytics.recordRequest({
        apiId: req.apiId,
        apiKeyId: req.keyId,
        endpoint: req.endpoint,
        method: req.method,
        statusCode: 500,
        responseTime,
        timestamp: new Date(),
        error: error.message
      });

      return this.createErrorResponse(500, 'Internal server error');
    }
  }

  /**
   * Publish a new API
   */
  async publishAPI(apiDefinition) {
    return await this.publisher.publish(apiDefinition);
  }

  /**
   * Subscribe to an API
   */
  async subscribeToAPI(consumerId, apiId, tier = 'free') {
    const api = await this.registry.getAPI(apiId);
    if (!api) {
      throw new Error('API not found');
    }

    // Generate API key for this subscription
    const pricingTier = api.pricing.tiers?.find(t => t.name === tier);
    if (!pricingTier && tier !== 'free') {
      throw new Error('Invalid pricing tier');
    }

    const quotas = this.getQuotasForTier(api, tier);

    const keyInfo = await this.keyManager.generateKey({
      consumerId,
      apiId,
      name: `${api.name} - ${tier}`,
      quotas,
      permissions: ['*'] // All endpoints by default
    });

    // Record subscription
    await this.analytics.recordSubscription({
      apiId,
      consumerId,
      tier,
      timestamp: new Date()
    });

    return {
      ...keyInfo,
      api: {
        id: api.apiId,
        name: api.name,
        version: api.version
      },
      tier,
      quotas
    };
  }

  /**
   * Search APIs in marketplace
   */
  async searchAPIs(query, filters = {}) {
    return await this.registry.search(query, filters);
  }

  /**
   * Get API documentation
   */
  async getAPIDocumentation(apiId) {
    const api = await this.registry.getAPI(apiId);
    if (!api) {
      throw new Error('API not found');
    }

    return this.docGenerator.generate(api);
  }

  /**
   * Get publisher analytics
   */
  async getPublisherAnalytics(publisherId, timeRange = '30d') {
    return await this.analytics.getPublisherMetrics(publisherId, timeRange);
  }

  /**
   * Get consumer analytics
   */
  async getConsumerAnalytics(consumerId, timeRange = '30d') {
    return await this.analytics.getConsumerMetrics(consumerId, timeRange);
  }

  /**
   * Get revenue report
   */
  async getRevenueReport(publisherId, period) {
    return await this.revenueManager.getReport(publisherId, period);
  }

  /**
   * Helper: Calculate API call cost
   */
  calculateCost(pricing, calls) {
    if (pricing.model === 'free') {
      return 0;
    }

    if (pricing.model === 'usage') {
      return calls * (pricing.pricePerCall || 0);
    }

    // Tiered pricing - return subscription cost
    return pricing.tiers?.[0]?.price || 0;
  }

  /**
   * Helper: Get quotas for pricing tier
   */
  getQuotasForTier(api, tier) {
    const tierConfig = {
      free: {
        requestsPerMinute: 10,
        requestsPerDay: 1000,
        requestsPerMonth: 30000
      },
      basic: {
        requestsPerMinute: 60,
        requestsPerDay: 10000,
        requestsPerMonth: 300000
      },
      professional: {
        requestsPerMinute: 300,
        requestsPerDay: 100000,
        requestsPerMonth: 3000000
      },
      enterprise: {
        requestsPerMinute: 1000,
        requestsPerDay: 1000000,
        requestsPerMonth: 30000000
      }
    };

    // Use API-specific rate limits if defined
    if (api.rateLimits) {
      return {
        requestsPerMinute: api.rateLimits.requestsPerMinute,
        requestsPerDay: api.rateLimits.requestsPerDay,
        requestsPerMonth: api.rateLimits.requestsPerDay * 30
      };
    }

    return tierConfig[tier] || tierConfig.free;
  }

  /**
   * Create success response
   */
  createSuccessResponse(data, headers = {}) {
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      body: {
        success: true,
        data
      }
    };
  }

  /**
   * Create error response
   */
  createErrorResponse(statusCode, message, headers = {}) {
    return {
      statusCode,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      body: {
        success: false,
        error: {
          code: statusCode,
          message
        }
      }
    };
  }
}

export default APIMarketplace;
