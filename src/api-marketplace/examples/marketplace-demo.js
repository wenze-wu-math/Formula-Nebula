/**
 * API Marketplace Demo
 * Complete example showing publishing, subscribing, and using APIs
 */

import { APIMarketplace } from '../marketplace.js';
import { createFormulaAPI } from './formula-api.js';
import { createGraphAPI } from './graph-api.js';
import { createProofAPI } from './proof-api.js';

/**
 * Demo: Complete API marketplace workflow
 */
export async function runMarketplaceDemo() {
  console.log('=== Formula Nebula API Marketplace Demo ===\n');

  // Initialize marketplace
  const marketplace = new APIMarketplace({
    defaultRevenueShare: 70,
    platformFee: 30
  });

  // ====================================
  // Phase 1: Publisher publishes APIs
  // ====================================
  console.log('Phase 1: Publishing APIs\n');

  const formulaAPI = await createFormulaAPI(marketplace);
  console.log(`✓ Published: ${formulaAPI.name} v${formulaAPI.version}`);

  const graphAPI = await createGraphAPI(marketplace);
  console.log(`✓ Published: ${graphAPI.name} v${graphAPI.version}`);

  const proofAPI = await createProofAPI(marketplace);
  console.log(`✓ Published: ${proofAPI.name} v${proofAPI.version}\n`);

  // ====================================
  // Phase 2: Consumer discovers APIs
  // ====================================
  console.log('Phase 2: Discovering APIs\n');

  const searchResults = await marketplace.searchAPIs('formula', {
    status: 'published'
  });

  console.log(`Found ${searchResults.length} APIs matching "formula":`);
  searchResults.forEach(api => {
    console.log(`  - ${api.name}: ${api.description}`);
  });
  console.log();

  // ====================================
  // Phase 3: Consumer subscribes
  // ====================================
  console.log('Phase 3: Subscribing to APIs\n');

  const consumerId = 'user_alice_123';

  const subscription1 = await marketplace.subscribeToAPI(
    consumerId,
    formulaAPI.apiId,
    'basic'
  );

  console.log(`✓ Subscribed to ${formulaAPI.name}`);
  console.log(`  API Key: ${subscription1.key.substring(0, 20)}...`);
  console.log(`  Tier: ${subscription1.tier}`);
  console.log(`  Quotas: ${subscription1.quotas.requestsPerDay} req/day\n`);

  // ====================================
  // Phase 4: Consumer uses APIs
  // ====================================
  console.log('Phase 4: Using APIs\n');

  // Example 1: Evaluate formula
  const evalResult = await marketplace.handleRequest({
    apiId: formulaAPI.apiId,
    endpoint: '/evaluate',
    method: 'POST',
    data: {
      expression: 'x^2 + 2*x + 1',
      variables: { x: 3 }
    },
    headers: {
      authorization: `Bearer ${subscription1.key}`
    },
    keyId: subscription1.keyId
  });

  console.log('Formula evaluation result:');
  console.log(`  Expression: x^2 + 2*x + 1 where x = 3`);
  console.log(`  Result: ${evalResult.body.data.result}`);
  console.log(`  LaTeX: ${evalResult.body.data.latex}\n`);

  // Example 2: Parse formula
  const parseResult = await marketplace.handleRequest({
    apiId: formulaAPI.apiId,
    endpoint: '/parse',
    method: 'POST',
    data: {
      expression: 'a + b * c'
    },
    headers: {
      authorization: `Bearer ${subscription1.key}`
    },
    keyId: subscription1.keyId
  });

  console.log('Formula parsing result:');
  console.log(`  Expression: a + b * c`);
  console.log(`  AST: ${JSON.stringify(parseResult.body.data.ast, null, 2)}\n`);

  // Subscribe to graph API
  const subscription2 = await marketplace.subscribeToAPI(
    consumerId,
    graphAPI.apiId,
    'free'
  );

  // Example 3: Search graph
  const searchResult = await marketplace.handleRequest({
    apiId: graphAPI.apiId,
    endpoint: '/search',
    method: 'GET',
    data: {
      query: 'algebra',
      limit: 5
    },
    headers: {
      authorization: `Bearer ${subscription2.key}`
    },
    keyId: subscription2.keyId
  });

  console.log('Graph search result:');
  console.log(`  Query: algebra`);
  console.log(`  Found: ${searchResult.body.data.total} concepts`);
  searchResult.body.data.results.forEach(r => {
    console.log(`    - ${r.name} (score: ${r.score})`);
  });
  console.log();

  // ====================================
  // Phase 5: Analytics and monitoring
  // ====================================
  console.log('Phase 5: Analytics\n');

  const publisherAnalytics = await marketplace.getPublisherAnalytics(
    'formula-nebula',
    '30d'
  );

  console.log('Publisher analytics:');
  console.log(`  Total APIs: ${publisherAnalytics.totalAPIs}`);
  console.log(`  Total requests: ${publisherAnalytics.totalRequests}`);
  console.log(`  Unique consumers: ${publisherAnalytics.totalConsumers}`);
  console.log(`  Avg response time: ${publisherAnalytics.avgResponseTime.toFixed(2)}ms`);
  console.log(`  Error rate: ${(publisherAnalytics.errorRate * 100).toFixed(2)}%\n`);

  const consumerAnalytics = await marketplace.getConsumerAnalytics(
    consumerId,
    '30d'
  );

  console.log('Consumer analytics:');
  console.log(`  Total requests: ${consumerAnalytics.totalRequests}`);
  console.log(`  APIs used: ${consumerAnalytics.totalAPIs}`);
  console.log(`  Avg response time: ${consumerAnalytics.avgResponseTime.toFixed(2)}ms\n`);

  // ====================================
  // Phase 6: Rate limiting demo
  // ====================================
  console.log('Phase 6: Rate Limiting\n');

  const keyStatus = await marketplace.consumer.getKeyStatus(subscription1.key);

  console.log('API key status:');
  console.log(`  Valid: ${keyStatus.valid}`);
  console.log(`  Status: ${keyStatus.status}`);
  console.log(`  Quota usage (minute): ${keyStatus.quotas.minute.percentage}%`);
  console.log(`  Quota usage (day): ${keyStatus.quotas.day.percentage}%`);
  console.log(`  Total requests: ${keyStatus.usage.totalRequests}`);
  console.log(`  Expires in: ${keyStatus.expiresIn} days\n`);

  // ====================================
  // Phase 7: Revenue tracking
  // ====================================
  console.log('Phase 7: Revenue Tracking\n');

  const currentPeriod = new Date().toISOString().substring(0, 7);
  const revenueReport = await marketplace.getRevenueReport(
    'formula-nebula',
    currentPeriod
  );

  console.log('Revenue report:');
  console.log(`  Period: ${revenueReport.period}`);
  console.log(`  Total revenue: $${revenueReport.summary.totalRevenue.toFixed(2)}`);
  console.log(`  Publisher share: $${revenueReport.summary.totalPublisherAmount.toFixed(2)}`);
  console.log(`  Total calls: ${revenueReport.summary.totalCalls}`);
  console.log(`  APIs: ${revenueReport.summary.totalAPIs}\n`);

  // ====================================
  // Phase 8: Documentation
  // ====================================
  console.log('Phase 8: Auto-generated Documentation\n');

  const docs = await marketplace.getAPIDocumentation(formulaAPI.apiId);

  console.log('Documentation generated:');
  console.log(`  Auto-generated: ${docs.autoGenerated}`);
  console.log(`  Endpoints documented: ${docs.endpoints.length}`);
  console.log(`  Code examples: ${docs.examples.length} languages`);
  console.log(`  Authentication: ${docs.authentication.type}\n`);

  // Sample documentation excerpt
  console.log('Sample endpoint documentation:');
  const sampleEndpoint = docs.endpoints[0];
  console.log(`  Path: ${sampleEndpoint.method} ${sampleEndpoint.path}`);
  console.log(`  Description: ${sampleEndpoint.description}`);
  console.log(`  Parameters: ${Object.keys(sampleEndpoint.parameters).join(', ')}\n`);

  // ====================================
  // Summary
  // ====================================
  console.log('=== Demo Complete ===\n');

  return {
    marketplace,
    publishedAPIs: [formulaAPI, graphAPI, proofAPI],
    subscriptions: [subscription1, subscription2],
    analytics: {
      publisher: publisherAnalytics,
      consumer: consumerAnalytics
    },
    revenue: revenueReport
  };
}

/**
 * Demo: API key management
 */
export async function demoKeyManagement() {
  console.log('\n=== API Key Management Demo ===\n');

  const marketplace = new APIMarketplace();

  // Create API
  const api = await marketplace.publishAPI({
    name: 'Test API',
    version: '1.0.0',
    publisher: { userId: 'test-publisher', displayName: 'Test Publisher' },
    endpoints: [
      {
        path: '/test',
        method: 'GET',
        handler: async () => ({ message: 'Hello' })
      }
    ]
  });

  const consumerId = 'test-consumer';

  // Generate key
  console.log('1. Generating API key...');
  const key1 = await marketplace.keyManager.generateKey({
    consumerId,
    apiId: api.apiId,
    name: 'Development Key',
    permissions: ['/test'],
    quotas: {
      requestsPerMinute: 10,
      requestsPerDay: 1000,
      requestsPerMonth: 30000
    }
  });
  console.log(`   Key ID: ${key1.keyId}`);
  console.log(`   Key: ${key1.key.substring(0, 20)}...\n`);

  // Validate key
  console.log('2. Validating key...');
  const validation = await marketplace.keyManager.validateKey(key1.key);
  console.log(`   Valid: ${validation.valid}`);
  console.log(`   Status: ${validation.keyData.status}\n`);

  // Rotate key
  console.log('3. Rotating key...');
  const key2 = await marketplace.keyManager.rotateKey(key1.keyId);
  console.log(`   New Key ID: ${key2.keyId}`);
  console.log(`   Old key revoked: ${key1.keyId}\n`);

  // List keys
  console.log('4. Listing all keys...');
  const keys = await marketplace.keyManager.listKeys(consumerId);
  console.log(`   Total keys: ${keys.length}`);
  keys.forEach(k => {
    console.log(`     - ${k.name}: ${k.status}`);
  });
  console.log();

  // Suspend key
  console.log('5. Suspending key...');
  await marketplace.keyManager.suspendKey(key2.keyId, 'Testing suspension');
  const suspended = await marketplace.keyManager.validateKey(key2.key);
  console.log(`   Suspended: ${!suspended.valid}`);
  console.log(`   Reason: ${suspended.reason}\n`);

  // Reactivate key
  console.log('6. Reactivating key...');
  await marketplace.keyManager.reactivateKey(key2.keyId);
  const reactivated = await marketplace.keyManager.validateKey(key2.key);
  console.log(`   Reactivated: ${reactivated.valid}\n`);

  console.log('=== Key Management Demo Complete ===\n');
}

/**
 * Demo: Rate limiting scenarios
 */
export async function demoRateLimiting() {
  console.log('\n=== Rate Limiting Demo ===\n');

  const marketplace = new APIMarketplace();

  const api = await marketplace.publishAPI({
    name: 'Rate Limited API',
    version: '1.0.0',
    publisher: { userId: 'test-publisher', displayName: 'Test Publisher' },
    endpoints: [
      {
        path: '/endpoint',
        method: 'GET',
        handler: async () => ({ data: 'success' })
      }
    ],
    rateLimits: {
      requestsPerMinute: 5,
      requestsPerDay: 100
    }
  });

  const subscription = await marketplace.subscribeToAPI('test-user', api.apiId, 'free');

  console.log('Testing rate limits (5 req/min):\n');

  // Make requests
  for (let i = 1; i <= 7; i++) {
    const result = await marketplace.handleRequest({
      apiId: api.apiId,
      endpoint: '/endpoint',
      method: 'GET',
      data: {},
      headers: {
        authorization: `Bearer ${subscription.key}`
      },
      keyId: subscription.keyId
    });

    if (result.statusCode === 200) {
      console.log(`Request ${i}: ✓ Success (${result.headers['X-RateLimit-Remaining-Minute']} remaining)`);
    } else if (result.statusCode === 429) {
      console.log(`Request ${i}: ✗ Rate limited (retry after ${result.headers['Retry-After']}s)`);
    }
  }

  console.log('\n=== Rate Limiting Demo Complete ===\n');
}

// Run demos if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  (async () => {
    await runMarketplaceDemo();
    await demoKeyManagement();
    await demoRateLimiting();
  })();
}

export default runMarketplaceDemo;
