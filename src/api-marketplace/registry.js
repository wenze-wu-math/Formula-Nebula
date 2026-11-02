/**
 * API Registry
 * Central repository for API metadata and discovery
 */

export class APIRegistry {
  constructor(options = {}) {
    this.storage = options.storage || new Map();
    this.searchIndex = new Map(); // Simple in-memory search index
  }

  /**
   * Register new API
   */
  async register(api) {
    await this.storage.set(api.apiId, api);
    this.indexAPI(api);
    return api;
  }

  /**
   * Get API by ID
   */
  async getAPI(apiId) {
    return this.storage.get(apiId) || null;
  }

  /**
   * Update API
   */
  async update(apiId, updates) {
    const api = await this.getAPI(apiId);
    if (!api) {
      throw new Error('API not found');
    }

    const updated = { ...api, ...updates };
    await this.storage.set(apiId, updated);
    this.indexAPI(updated);

    return updated;
  }

  /**
   * List APIs with filters
   */
  async list(filters = {}) {
    const apis = Array.from(this.storage.values())
      .filter(api => !api.apiId.startsWith('consumer:')); // Exclude internal keys

    let results = apis;

    // Filter by status
    if (filters.status) {
      results = results.filter(api => api.status === filters.status);
    }

    // Filter by category
    if (filters.category) {
      results = results.filter(api =>
        api.category && api.category.includes(filters.category)
      );
    }

    // Filter by publisher
    if (filters.publisherId) {
      results = results.filter(api =>
        api.publisher.userId === filters.publisherId
      );
    }

    // Sort by metrics
    if (filters.sortBy === 'popular') {
      results.sort((a, b) => b.metrics.activeConsumers - a.metrics.activeConsumers);
    } else if (filters.sortBy === 'performance') {
      results.sort((a, b) => a.metrics.avgResponseTime - b.metrics.avgResponseTime);
    } else if (filters.sortBy === 'newest') {
      results.sort((a, b) => b.createdAt - a.createdAt);
    }

    // Pagination
    const limit = filters.limit || 50;
    const offset = filters.offset || 0;

    return results.slice(offset, offset + limit);
  }

  /**
   * Search APIs by query
   */
  async search(query, filters = {}) {
    if (!query) {
      return this.list(filters);
    }

    const lowerQuery = query.toLowerCase();
    const apis = Array.from(this.storage.values())
      .filter(api => !api.apiId.startsWith('consumer:'));

    // Simple text search
    const results = apis.filter(api => {
      const searchableText = [
        api.name,
        api.description,
        ...(api.category || [])
      ].join(' ').toLowerCase();

      return searchableText.includes(lowerQuery);
    });

    // Score results by relevance
    const scored = results.map(api => {
      let score = 0;

      // Name match is highest priority
      if (api.name.toLowerCase().includes(lowerQuery)) {
        score += 10;
      }

      // Description match
      if (api.description && api.description.toLowerCase().includes(lowerQuery)) {
        score += 5;
      }

      // Category match
      if (api.category && api.category.some(c => c.toLowerCase().includes(lowerQuery))) {
        score += 7;
      }

      // Boost by metrics
      score += api.metrics.activeConsumers * 0.1;
      score -= api.metrics.errorRate * 2;

      return { api, score };
    });

    // Sort by score
    scored.sort((a, b) => b.score - a.score);

    return scored.map(item => item.api);
  }

  /**
   * Get subscriber count for API
   */
  async getSubscriberCount(apiId) {
    // Count unique consumers with active keys for this API
    let count = 0;
    const consumers = new Set();

    for (const [key, value] of this.storage.entries()) {
      if (key.startsWith('key_') && value.apiId === apiId && value.status === 'active') {
        consumers.add(value.consumerId);
      }
    }

    return consumers.size;
  }

  /**
   * Get API versions
   */
  async getVersions(apiId) {
    const versions = [];

    for (const api of this.storage.values()) {
      if (api.parentApiId === apiId || api.apiId === apiId) {
        versions.push({
          version: api.version,
          apiId: api.apiId,
          status: api.status,
          createdAt: api.createdAt
        });
      }
    }

    // Sort by version (semantic versioning)
    versions.sort((a, b) => {
      const [aMajor, aMinor, aPatch] = a.version.split('.').map(Number);
      const [bMajor, bMinor, bPatch] = b.version.split('.').map(Number);

      if (aMajor !== bMajor) return bMajor - aMajor;
      if (aMinor !== bMinor) return bMinor - aMinor;
      return bPatch - aPatch;
    });

    return versions;
  }

  /**
   * Index API for fast searching
   */
  indexAPI(api) {
    // Simple keyword indexing
    const keywords = [
      ...api.name.toLowerCase().split(/\s+/),
      ...(api.description || '').toLowerCase().split(/\s+/),
      ...(api.category || []).map(c => c.toLowerCase())
    ];

    keywords.forEach(keyword => {
      if (!this.searchIndex.has(keyword)) {
        this.searchIndex.set(keyword, new Set());
      }
      this.searchIndex.get(keyword).add(api.apiId);
    });
  }

  /**
   * Get featured APIs
   */
  async getFeatured(limit = 10) {
    const apis = await this.list({ status: 'published' });

    // Score by multiple factors
    const scored = apis.map(api => {
      const score =
        api.metrics.activeConsumers * 2 +
        (5 - api.metrics.avgResponseTime / 100) +
        (1 - api.metrics.errorRate) * 10 +
        (api.publisher.reputation || 0);

      return { api, score };
    });

    scored.sort((a, b) => b.score - a.score);

    return scored.slice(0, limit).map(item => item.api);
  }
}

export default APIRegistry;
