/**
 * API Publisher
 * Handles API publication, versioning, and management
 */

export class APIPublisher {
  constructor(options = {}) {
    this.registry = options.registry;
    this.docGenerator = options.docGenerator;
    this.revenueManager = options.revenueManager;
  }

  /**
   * Publish a new API
   */
  async publish(definition) {
    // Validate definition
    this.validateDefinition(definition);

    // Generate API ID
    const apiId = this.generateAPIId(definition.name);

    // Auto-generate documentation if not provided
    const documentation = definition.documentation ||
      await this.docGenerator.generate(definition);

    // Create API entry
    const api = {
      apiId,
      name: definition.name,
      version: definition.version || '1.0.0',
      publisher: definition.publisher,
      description: definition.description,
      category: definition.category || [],
      endpoints: definition.endpoints,
      pricing: this.normalizePricing(definition.pricing),
      rateLimits: definition.rateLimits || this.getDefaultRateLimits(),
      documentation,
      metrics: {
        totalCalls: 0,
        activeConsumers: 0,
        avgResponseTime: 0,
        errorRate: 0
      },
      revenueShare: {
        publisherShare: definition.revenueShare?.publisherShare || 70,
        platformFee: definition.revenueShare?.platformFee || 30
      },
      status: definition.status || 'published',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Register in marketplace
    await this.registry.register(api);

    // Initialize revenue tracking
    await this.revenueManager.initializeAPI(apiId, api.publisher.userId);

    return api;
  }

  /**
   * Update existing API
   */
  async update(apiId, updates) {
    const api = await this.registry.getAPI(apiId);
    if (!api) {
      throw new Error('API not found');
    }

    // Handle version update
    if (updates.version && updates.version !== api.version) {
      return await this.publishNewVersion(apiId, updates);
    }

    // Update fields
    const updatedAPI = {
      ...api,
      ...updates,
      updatedAt: new Date()
    };

    // Regenerate documentation if endpoints changed
    if (updates.endpoints) {
      updatedAPI.documentation = await this.docGenerator.generate(updatedAPI);
    }

    await this.registry.update(apiId, updatedAPI);

    return updatedAPI;
  }

  /**
   * Publish new version of API
   */
  async publishNewVersion(apiId, updates) {
    const currentAPI = await this.registry.getAPI(apiId);

    // Create new version
    const newVersion = {
      ...currentAPI,
      ...updates,
      version: updates.version,
      apiId: `${apiId}-v${updates.version.replace(/\./g, '-')}`,
      parentApiId: apiId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Regenerate documentation
    newVersion.documentation = await this.docGenerator.generate(newVersion);

    // Register new version
    await this.registry.register(newVersion);

    // Mark old version as deprecated if requested
    if (updates.deprecateOld) {
      await this.deprecate(apiId);
    }

    return newVersion;
  }

  /**
   * Deprecate an API
   */
  async deprecate(apiId) {
    const api = await this.registry.getAPI(apiId);
    if (!api) {
      throw new Error('API not found');
    }

    api.status = 'deprecated';
    api.deprecatedAt = new Date();

    await this.registry.update(apiId, api);

    return api;
  }

  /**
   * Unpublish an API
   */
  async unpublish(apiId) {
    const api = await this.registry.getAPI(apiId);
    if (!api) {
      throw new Error('API not found');
    }

    api.status = 'unpublished';
    api.unpublishedAt = new Date();

    await this.registry.update(apiId, api);

    return api;
  }

  /**
   * Get API statistics
   */
  async getStats(apiId) {
    const api = await this.registry.getAPI(apiId);
    if (!api) {
      throw new Error('API not found');
    }

    return {
      apiId,
      name: api.name,
      version: api.version,
      status: api.status,
      metrics: api.metrics,
      subscribers: await this.registry.getSubscriberCount(apiId),
      revenue: await this.revenueManager.getAPIRevenue(apiId),
      createdAt: api.createdAt,
      updatedAt: api.updatedAt
    };
  }

  // Validation and helpers

  validateDefinition(definition) {
    const required = ['name', 'endpoints', 'publisher'];
    const missing = required.filter(field => !definition[field]);

    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(', ')}`);
    }

    if (!Array.isArray(definition.endpoints) || definition.endpoints.length === 0) {
      throw new Error('At least one endpoint required');
    }

    // Validate endpoints
    definition.endpoints.forEach((endpoint, i) => {
      if (!endpoint.path || !endpoint.method || !endpoint.handler) {
        throw new Error(`Endpoint ${i}: path, method, and handler required`);
      }

      if (typeof endpoint.handler !== 'function') {
        throw new Error(`Endpoint ${i}: handler must be a function`);
      }
    });

    // Validate publisher
    if (!definition.publisher.userId) {
      throw new Error('Publisher userId required');
    }
  }

  generateAPIId(name) {
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const timestamp = Date.now().toString(36);
    return `${slug}-${timestamp}`;
  }

  normalizePricing(pricing) {
    if (!pricing) {
      return {
        model: 'free',
        tiers: [{ name: 'free', limit: Infinity, price: 0 }]
      };
    }

    return pricing;
  }

  getDefaultRateLimits() {
    return {
      requestsPerMinute: 100,
      requestsPerDay: 10000,
      burstLimit: 200
    };
  }
}

export default APIPublisher;
