/**
 * API Marketplace Integration Example
 * Shows how to integrate the marketplace into Formula Nebula
 */

import { APIMarketplace } from './marketplace.js';
import { createFormulaAPI } from './examples/formula-api.js';
import { createGraphAPI } from './examples/graph-api.js';
import { createProofAPI } from './examples/proof-api.js';

/**
 * Initialize marketplace with Formula Nebula integration
 */
export function initializeMarketplace(config = {}) {
  const marketplace = new APIMarketplace({
    storage: config.storage || new Map(),
    defaultRevenueShare: config.revenueShare || 70,
    platformFee: config.platformFee || 30,
    maxAPIsPerPublisher: config.maxAPIs || 50,
    maxKeysPerConsumer: config.maxKeys || 10
  });

  // Auto-publish core APIs
  if (config.autoPublishCoreAPIs !== false) {
    publishCoreAPIs(marketplace);
  }

  return marketplace;
}

/**
 * Publish core Formula Nebula APIs
 */
async function publishCoreAPIs(marketplace) {
  try {
    await createFormulaAPI(marketplace);
    await createGraphAPI(marketplace);
    await createProofAPI(marketplace);
    console.log('Core APIs published successfully');
  } catch (error) {
    console.error('Failed to publish core APIs:', error);
  }
}

/**
 * Express/HTTP server integration
 */
export function createAPIMiddleware(marketplace) {
  return async (req, res, next) => {
    // Parse API request from HTTP request
    const apiRequest = {
      apiId: req.params.apiId || req.query.apiId,
      endpoint: req.path,
      method: req.method,
      data: req.body || req.query,
      headers: req.headers,
      metadata: {
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip,
        timestamp: new Date()
      }
    };

    try {
      // Handle request through marketplace
      const result = await marketplace.handleRequest(apiRequest);

      // Set response headers
      Object.entries(result.headers).forEach(([key, value]) => {
        res.setHeader(key, value);
      });

      // Send response
      res.status(result.statusCode).json(result.body);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: 500,
          message: 'Internal server error',
          details: error.message
        }
      });
    }
  };
}

/**
 * WebSocket integration for real-time API calls
 */
export function createWebSocketHandler(marketplace) {
  return async (ws, message) => {
    try {
      const request = JSON.parse(message);

      const result = await marketplace.handleRequest({
        ...request,
        metadata: {
          protocol: 'websocket',
          timestamp: new Date()
        }
      });

      ws.send(JSON.stringify(result.body));
    } catch (error) {
      ws.send(JSON.stringify({
        success: false,
        error: {
          code: 500,
          message: error.message
        }
      }));
    }
  };
}

/**
 * CLI integration for API management
 */
export class MarketplaceCLI {
  constructor(marketplace) {
    this.marketplace = marketplace;
  }

  async handleCommand(command, args) {
    switch (command) {
      case 'publish':
        return await this.publishAPI(args);
      case 'subscribe':
        return await this.subscribeAPI(args);
      case 'keys':
        return await this.listKeys(args);
      case 'usage':
        return await this.showUsage(args);
      case 'search':
        return await this.searchAPIs(args);
      default:
        throw new Error(`Unknown command: ${command}`);
    }
  }

  async publishAPI(args) {
    const apiDefinition = require(args.file);
    const api = await this.marketplace.publishAPI(apiDefinition);
    console.log(`Published ${api.name} v${api.version}`);
    console.log(`API ID: ${api.apiId}`);
    return api;
  }

  async subscribeAPI(args) {
    const subscription = await this.marketplace.subscribeToAPI(
      args.consumerId,
      args.apiId,
      args.tier || 'free'
    );
    console.log(`Subscribed to ${subscription.api.name}`);
    console.log(`API Key: ${subscription.key}`);
    console.log(`Save this key securely!`);
    return subscription;
  }

  async listKeys(args) {
    const keys = await this.marketplace.keyManager.listKeys(args.consumerId);
    console.log(`\nAPI Keys for ${args.consumerId}:\n`);
    keys.forEach(key => {
      console.log(`  ${key.name}`);
      console.log(`    Status: ${key.status}`);
      console.log(`    Usage: ${key.usage.totalRequests} requests`);
      console.log(`    Expires: ${new Date(key.expiresAt).toLocaleDateString()}`);
      console.log();
    });
    return keys;
  }

  async showUsage(args) {
    const analytics = await this.marketplace.getConsumerAnalytics(
      args.consumerId,
      args.timeRange || '30d'
    );
    console.log(`\nUsage for ${args.consumerId}:\n`);
    console.log(`  Total requests: ${analytics.totalRequests}`);
    console.log(`  APIs used: ${analytics.totalAPIs}`);
    console.log(`  Avg response time: ${analytics.avgResponseTime.toFixed(2)}ms`);
    console.log(`  Error rate: ${(analytics.errorRate * 100).toFixed(2)}%`);
    console.log();
    return analytics;
  }

  async searchAPIs(args) {
    const results = await this.marketplace.searchAPIs(args.query, {
      status: 'published',
      limit: args.limit || 10
    });
    console.log(`\nFound ${results.length} APIs:\n`);
    results.forEach(api => {
      console.log(`  ${api.name} v${api.version}`);
      console.log(`    ${api.description}`);
      console.log(`    ID: ${api.apiId}`);
      console.log();
    });
    return results;
  }
}

/**
 * React/Frontend integration
 */
export class MarketplaceClient {
  constructor(options = {}) {
    this.baseURL = options.baseURL || '/api/marketplace';
    this.apiKey = options.apiKey;
  }

  async callAPI(apiId, endpoint, method = 'GET', data = {}) {
    const url = `${this.baseURL}/${apiId}${endpoint}`;

    const response = await fetch(url, {
      method,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: method !== 'GET' ? JSON.stringify(data) : undefined
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error.message);
    }

    return result.data;
  }

  async searchAPIs(query) {
    const response = await fetch(`${this.baseURL}/search?q=${encodeURIComponent(query)}`);
    return await response.json();
  }

  async getDocumentation(apiId) {
    const response = await fetch(`${this.baseURL}/${apiId}/docs`);
    return await response.json();
  }

  async getUsageStats() {
    const response = await fetch(`${this.baseURL}/usage`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      }
    });
    return await response.json();
  }
}

/**
 * Usage example for Formula Nebula visualization
 */
export async function integrateWithVisualization(marketplace, graph) {
  // Add API marketplace panel to UI
  const marketplacePanel = {
    title: 'API Marketplace',
    icon: 'api',
    content: createMarketplaceUI(marketplace)
  };

  // Add graph API endpoints to enable external access
  graph.enableAPIAccess = async (consumerId) => {
    const subscription = await marketplace.subscribeToAPI(
      consumerId,
      'knowledge-graph-api',
      'basic'
    );

    return {
      apiKey: subscription.key,
      endpoints: [
        '/search - Search the knowledge graph',
        '/path - Find paths between concepts',
        '/neighbors - Get neighboring concepts',
        '/subgraph - Extract subgraphs'
      ]
    };
  };

  // Add formula API integration
  graph.enableFormulaAPI = async (consumerId) => {
    const subscription = await marketplace.subscribeToAPI(
      consumerId,
      'formula-evaluator-api',
      'basic'
    );

    return {
      apiKey: subscription.key,
      endpoints: [
        '/evaluate - Evaluate expressions',
        '/parse - Parse formulas',
        '/simplify - Simplify expressions',
        '/derivative - Calculate derivatives'
      ]
    };
  };

  return marketplacePanel;
}

/**
 * Create marketplace UI component
 */
function createMarketplaceUI(marketplace) {
  return {
    async render() {
      const apis = await marketplace.searchAPIs('', { status: 'published' });

      return `
        <div class="marketplace-panel">
          <div class="marketplace-header">
            <h2>API Marketplace</h2>
            <button id="browse-apis">Browse APIs</button>
          </div>

          <div class="api-list">
            ${apis.map(api => `
              <div class="api-card" data-api-id="${api.apiId}">
                <h3>${api.name}</h3>
                <p>${api.description}</p>
                <div class="api-meta">
                  <span class="version">v${api.version}</span>
                  <span class="category">${api.category.join(', ')}</span>
                </div>
                <div class="api-actions">
                  <button class="btn-docs" data-api-id="${api.apiId}">Documentation</button>
                  <button class="btn-subscribe" data-api-id="${api.apiId}">Subscribe</button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    },

    async handleSubscribe(apiId, consumerId) {
      const subscription = await marketplace.subscribeToAPI(consumerId, apiId);

      return {
        success: true,
        message: 'Subscribed successfully',
        apiKey: subscription.key,
        quotas: subscription.quotas
      };
    },

    async showDocumentation(apiId) {
      const docs = await marketplace.getAPIDocumentation(apiId);
      // Render documentation in modal or side panel
      return docs;
    }
  };
}

/**
 * Example: Complete integration setup
 */
export async function setupCompleteIntegration() {
  // 1. Initialize marketplace
  const marketplace = initializeMarketplace({
    revenueShare: 70,
    platformFee: 30
  });

  // 2. Set up HTTP server (Express example)
  // const app = express();
  // app.use('/api/marketplace/:apiId/*', createAPIMiddleware(marketplace));

  // 3. Set up CLI
  const cli = new MarketplaceCLI(marketplace);

  // 4. Set up frontend client
  const client = new MarketplaceClient({
    baseURL: 'https://api.formula-nebula.com/marketplace',
    apiKey: process.env.API_KEY
  });

  // 5. Integrate with visualization
  // await integrateWithVisualization(marketplace, graphInstance);

  console.log('API Marketplace fully integrated');

  return {
    marketplace,
    cli,
    client
  };
}

export default {
  initializeMarketplace,
  createAPIMiddleware,
  createWebSocketHandler,
  MarketplaceCLI,
  MarketplaceClient,
  integrateWithVisualization,
  setupCompleteIntegration
};
