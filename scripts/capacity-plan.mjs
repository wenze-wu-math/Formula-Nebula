#!/usr/bin/env node
/**
 * ═════════════════════════════════════════════════════════════
 *  Formula Nebula Capacity Planning & Bottleneck Analysis
 * ═════════════════════════════════════════════════════════════
 *
 *  Analyzes load test results and generates capacity recommendations
 *
 *  Run: node scripts/capacity-plan.mjs [load-test-results.json]
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Configuration
const CONFIG = {
  targetResponseTime: 500, // ms, p95
  targetErrorRate: 0.01, // 1%
  targetFPS: 30,
  targetConcurrentUsers: 100000,
  memoryLimit: 4096, // MB per instance
  cpuLimit: 4, // cores per instance
};

/**
 * Load test results
 */
function loadResults(filePath) {
  const defaultPath = join(__dirname, 'load-test-results.json');
  const path = filePath || defaultPath;

  if (!existsSync(path)) {
    console.error(`Results file not found: ${path}`);
    console.log('Run load tests first: k6 run scripts/load-test.js');
    process.exit(1);
  }

  return JSON.parse(readFileSync(path, 'utf-8'));
}

/**
 * Analyze bottlenecks
 */
function analyzeBottlenecks(data) {
  const bottlenecks = [];

  // HTTP response time
  const httpDuration = data.metrics.http_req_duration?.values;
  if (httpDuration && httpDuration['p(95)'] > CONFIG.targetResponseTime) {
    bottlenecks.push({
      category: 'HTTP Response Time',
      severity: 'high',
      current: `${httpDuration['p(95)']}ms`,
      target: `${CONFIG.targetResponseTime}ms`,
      impact: 'Users experience slow page loads',
      recommendations: [
        'Enable CDN for static assets',
        'Implement HTTP/2 or HTTP/3',
        'Add Redis caching layer',
        'Optimize bundle size (code splitting)',
        'Enable Brotli compression',
      ],
    });
  }

  // Error rate
  const errorRate = data.metrics.http_req_failed?.values.rate || 0;
  if (errorRate > CONFIG.targetErrorRate) {
    bottlenecks.push({
      category: 'Error Rate',
      severity: 'critical',
      current: `${(errorRate * 100).toFixed(2)}%`,
      target: `${(CONFIG.targetErrorRate * 100).toFixed(2)}%`,
      impact: 'Users cannot access the application',
      recommendations: [
        'Implement circuit breakers',
        'Add retry logic with exponential backoff',
        'Scale horizontally (add more instances)',
        'Increase connection pool size',
        'Add health checks and auto-recovery',
      ],
    });
  }

  // Render performance
  const renderTime = data.metrics.render_time?.values;
  if (renderTime && renderTime['p(95)'] > 2000) {
    bottlenecks.push({
      category: 'Render Performance',
      severity: 'high',
      current: `${renderTime['p(95)']}ms`,
      target: '2000ms',
      impact: 'Initial render is slow, poor UX',
      recommendations: [
        'Implement progressive loading for formulas',
        'Use Web Workers for graph layout',
        'Optimize Three.js scene (reduce draw calls)',
        'Implement LOD (Level of Detail) system',
        'Cache texture baking results',
        'Use instanced rendering for particles',
      ],
    });
  }

  // WebSocket capacity
  const wsConnections = data.metrics.ws_connections?.values.count || 0;
  const wsMessages = data.metrics.ws_messages?.values.count || 0;
  const _avgMsgPerConn = wsConnections > 0 ? wsMessages / wsConnections : 0;

  if (wsConnections > 10000) {
    bottlenecks.push({
      category: 'WebSocket Scalability',
      severity: 'medium',
      current: `${wsConnections} connections`,
      target: 'Unlimited with proper architecture',
      impact: 'Collaboration features may degrade',
      recommendations: [
        'Use Redis Pub/Sub for message distribution',
        'Implement WebSocket clustering (Socket.IO with Redis adapter)',
        'Add message queuing (RabbitMQ/Kafka)',
        'Implement presence tracking with Redis',
        'Use sticky sessions for load balancing',
        'Consider separate WebSocket service',
      ],
    });
  }

  // Memory usage estimation
  const estimatedMemory = estimateMemoryUsage(data);
  if (estimatedMemory.perUser * 10000 > CONFIG.memoryLimit) {
    bottlenecks.push({
      category: 'Memory Usage',
      severity: 'high',
      current: `${estimatedMemory.perUser}MB per user`,
      target: `${CONFIG.memoryLimit / 10000}MB per user`,
      impact: 'Server OOM under high load',
      recommendations: [
        'Implement connection pooling',
        'Add memory limits per connection',
        'Use streaming for large datasets',
        'Implement lazy loading for proof content',
        'Optimize data structures (use typed arrays)',
        'Enable garbage collection tuning',
      ],
    });
  }

  return bottlenecks;
}

/**
 * Estimate memory usage
 */
function estimateMemoryUsage(data) {
  const vus = data.metrics.vus?.values.value || 1000;
  const wsConnections = data.metrics.ws_connections?.values.count || 0;

  // Estimates based on application profile
  return {
    perUser: 0.5, // MB per concurrent user
    wsOverhead: 0.3, // MB per WebSocket connection
    staticAssets: 150, // MB for cached assets
    total: (vus * 0.5) + (wsConnections * 0.3) + 150,
  };
}

/**
 * Calculate required capacity
 */
function calculateCapacity(data, _bottlenecks) {
  const httpReqs = data.metrics.http_reqs?.values.count || 0;
  const duration = data.state.testRunDurationMs / 1000; // seconds
  const rps = httpReqs / duration; // requests per second

  // Current performance
  const currentVUs = data.metrics.vus?.values.max || 1000;
  const httpDuration = data.metrics.http_req_duration?.values['p(95)'] || 500;

  // Capacity calculations
  const reqPerVU = httpReqs / currentVUs;
  const targetVUs = CONFIG.targetConcurrentUsers;

  // Estimated RPS at target load
  const targetRPS = (targetVUs * reqPerVU) / duration;

  // Instance calculations
  const rpsPerInstance = 5000; // Conservative estimate
  const requiredInstances = Math.ceil(targetRPS / rpsPerInstance);

  // Memory requirements
  const memPerInstance = CONFIG.memoryLimit;
  const totalMemory = requiredInstances * memPerInstance;

  // CPU requirements
  const cpuPerInstance = CONFIG.cpuLimit;
  const totalCPU = requiredInstances * cpuPerInstance;

  // Database capacity
  const dbConnections = requiredInstances * 100; // 100 connections per instance

  // WebSocket servers
  const wsPerServer = 10000; // connections per WS server
  const wsServers = Math.ceil(targetVUs * 0.15 / wsPerServer); // 15% use WS

  return {
    current: {
      vus: currentVUs,
      rps: rps.toFixed(2),
      responseTime: `${httpDuration}ms`,
    },
    target: {
      vus: targetVUs,
      estimatedRPS: targetRPS.toFixed(2),
      targetResponseTime: `${CONFIG.targetResponseTime}ms`,
    },
    capacity: {
      appServers: {
        count: requiredInstances,
        cpu: cpuPerInstance,
        memory: `${memPerInstance}MB`,
        totalCPU: totalCPU,
        totalMemory: `${totalMemory}MB`,
      },
      wsServers: {
        count: wsServers,
        cpu: 2,
        memory: '2048MB',
        connectionsPerServer: wsPerServer,
      },
      database: {
        connections: dbConnections,
        cpu: 8,
        memory: '16GB',
        storage: '500GB SSD',
        replicas: 2,
      },
      cache: {
        type: 'Redis',
        cpu: 4,
        memory: '8GB',
        replicas: 2,
      },
      cdn: {
        bandwidth: '100GB/day',
        requests: '10M/day',
      },
    },
  };
}

/**
 * Generate scaling strategy
 */
function generateScalingStrategy(capacity) {
  return {
    horizontal: [
      {
        metric: 'CPU > 70%',
        action: 'Add 1 app server instance',
        cooldown: '5 minutes',
      },
      {
        metric: 'Memory > 80%',
        action: 'Add 1 app server instance',
        cooldown: '5 minutes',
      },
      {
        metric: 'Response time p95 > 800ms',
        action: 'Add 1 app server instance',
        cooldown: '3 minutes',
      },
      {
        metric: 'WS connections > 8000 per server',
        action: 'Add 1 WebSocket server',
        cooldown: '2 minutes',
      },
    ],
    vertical: [
      {
        condition: 'Sustained high CPU (>80%) despite scaling',
        action: 'Upgrade to larger instance type',
        note: 'Consider 8-core instances',
      },
      {
        condition: 'Memory pressure with frequent GC',
        action: 'Increase memory to 8GB per instance',
        note: 'Profile memory usage first',
      },
    ],
    limits: {
      maxAppServers: Math.ceil(capacity.capacity.appServers.count * 2),
      maxWSServers: Math.ceil(capacity.capacity.wsServers.count * 2),
      scaleDownThreshold: '30% capacity for 10 minutes',
    },
  };
}

/**
 * Cost estimation
 */
function estimateCosts(capacity) {
  const costs = {
    // AWS EC2 pricing estimates (us-east-1)
    compute: {
      appServers: {
        type: 't3.xlarge',
        hourly: 0.1664,
        count: capacity.capacity.appServers.count,
        monthly: capacity.capacity.appServers.count * 0.1664 * 730,
      },
      wsServers: {
        type: 't3.medium',
        hourly: 0.0416,
        count: capacity.capacity.wsServers.count,
        monthly: capacity.capacity.wsServers.count * 0.0416 * 730,
      },
      database: {
        type: 'db.r5.2xlarge',
        hourly: 1.008,
        count: 1,
        monthly: 1.008 * 730,
      },
    },
    storage: {
      ebs: {
        gb: 500,
        monthly: 500 * 0.10, // $0.10/GB-month for gp3
      },
      s3: {
        gb: 1000,
        monthly: 1000 * 0.023, // $0.023/GB-month
      },
    },
    network: {
      dataTransfer: {
        gb: 10000,
        monthly: 10000 * 0.09, // $0.09/GB after first 100GB
      },
      cdn: {
        requests: 10000000,
        monthly: 10000000 * 0.0000001, // CloudFront pricing
      },
    },
  };

  // Calculate totals
  const computeTotal =
    costs.compute.appServers.monthly +
    costs.compute.wsServers.monthly +
    costs.compute.database.monthly;

  const storageTotal = costs.storage.ebs.monthly + costs.storage.s3.monthly;

  const networkTotal =
    costs.network.dataTransfer.monthly + costs.network.cdn.monthly;

  const monthlyTotal = computeTotal + storageTotal + networkTotal;

  return {
    breakdown: costs,
    totals: {
      compute: computeTotal.toFixed(2),
      storage: storageTotal.toFixed(2),
      network: networkTotal.toFixed(2),
      monthly: monthlyTotal.toFixed(2),
      annual: (monthlyTotal * 12).toFixed(2),
    },
  };
}

/**
 * Generate recommendations
 */
function generateRecommendations(bottlenecks, _capacity) {
  const recommendations = {
    immediate: [],
    shortTerm: [],
    longTerm: [],
  };

  // Immediate actions (critical issues)
  const criticalBottlenecks = bottlenecks.filter((b) => b.severity === 'critical');
  if (criticalBottlenecks.length > 0) {
    recommendations.immediate.push({
      priority: 'CRITICAL',
      action: 'Address error rate issues',
      steps: criticalBottlenecks[0].recommendations,
    });
  }

  // Short-term improvements
  recommendations.shortTerm.push(
    {
      priority: 'HIGH',
      action: 'Implement CDN',
      rationale: 'Offload static assets, reduce origin server load by ~70%',
      estimatedSavings: '$500-1000/month at scale',
    },
    {
      priority: 'HIGH',
      action: 'Add Redis caching',
      rationale: 'Cache formula textures, graph data, reduce DB load',
      estimatedImprovement: '50-70% reduction in response time',
    },
    {
      priority: 'MEDIUM',
      action: 'Optimize bundle size',
      rationale: 'Current bundle includes KaTeX + Three.js, implement code splitting',
      estimatedImprovement: '30-40% faster initial load',
    }
  );

  // Long-term architecture
  recommendations.longTerm.push(
    {
      priority: 'HIGH',
      action: 'Implement microservices architecture',
      components: [
        'Static asset service (CDN)',
        'API gateway',
        'Graph computation service',
        'WebSocket collaboration service',
        'Proof rendering service',
      ],
      rationale: 'Independent scaling, better resource utilization',
    },
    {
      priority: 'MEDIUM',
      action: 'Add edge computing',
      rationale: 'Deploy to multiple regions, reduce latency for global users',
      estimatedImprovement: '50-200ms latency reduction',
    },
    {
      priority: 'MEDIUM',
      action: 'Implement progressive rendering',
      rationale: 'Load visible formulas first, lazy-load others',
      estimatedImprovement: '60-80% faster time-to-interactive',
    }
  );

  return recommendations;
}

/**
 * Format and print report
 */
function printReport(data, bottlenecks, capacity, scaling, costs, recommendations) {
  const report = [];

  report.push('═'.repeat(70));
  report.push('Formula Nebula Capacity Planning Report');
  report.push('═'.repeat(70));
  report.push('');

  // Executive Summary
  report.push('EXECUTIVE SUMMARY');
  report.push('-'.repeat(70));
  report.push(`Target Capacity: ${CONFIG.targetConcurrentUsers.toLocaleString()} concurrent users`);
  report.push(`Current Max Tested: ${capacity.current.vus.toLocaleString()} users`);
  report.push(`Estimated Monthly Cost: $${costs.totals.monthly}`);
  report.push(`Critical Issues: ${bottlenecks.filter((b) => b.severity === 'critical').length}`);
  report.push('');

  // Bottlenecks
  if (bottlenecks.length > 0) {
    report.push('IDENTIFIED BOTTLENECKS');
    report.push('-'.repeat(70));
    bottlenecks.forEach((b, i) => {
      report.push(`${i + 1}. ${b.category} [${b.severity.toUpperCase()}]`);
      report.push(`   Current: ${b.current} | Target: ${b.target}`);
      report.push(`   Impact: ${b.impact}`);
      report.push('   Recommendations:');
      b.recommendations.forEach((r) => report.push(`     - ${r}`));
      report.push('');
    });
  }

  // Capacity Requirements
  report.push('CAPACITY REQUIREMENTS');
  report.push('-'.repeat(70));
  report.push('Application Servers:');
  report.push(`  Count: ${capacity.capacity.appServers.count}`);
  report.push(`  CPU per instance: ${capacity.capacity.appServers.cpu} cores`);
  report.push(`  Memory per instance: ${capacity.capacity.appServers.memory}`);
  report.push(`  Total CPU: ${capacity.capacity.appServers.totalCPU} cores`);
  report.push(`  Total Memory: ${capacity.capacity.appServers.totalMemory}`);
  report.push('');
  report.push('WebSocket Servers:');
  report.push(`  Count: ${capacity.capacity.wsServers.count}`);
  report.push(`  Connections per server: ${capacity.capacity.wsServers.connectionsPerServer}`);
  report.push('');
  report.push('Database:');
  report.push(`  Max connections: ${capacity.capacity.database.connections}`);
  report.push(`  CPU: ${capacity.capacity.database.cpu} cores`);
  report.push(`  Memory: ${capacity.capacity.database.memory}`);
  report.push(`  Storage: ${capacity.capacity.database.storage}`);
  report.push('');

  // Scaling Strategy
  report.push('AUTO-SCALING STRATEGY');
  report.push('-'.repeat(70));
  report.push('Horizontal Scaling Rules:');
  scaling.horizontal.forEach((rule) => {
    report.push(`  - ${rule.metric} → ${rule.action} (cooldown: ${rule.cooldown})`);
  });
  report.push('');
  report.push('Scaling Limits:');
  report.push(`  Max app servers: ${scaling.limits.maxAppServers}`);
  report.push(`  Max WS servers: ${scaling.limits.maxWSServers}`);
  report.push(`  Scale-down threshold: ${scaling.limits.scaleDownThreshold}`);
  report.push('');

  // Cost Breakdown
  report.push('COST ESTIMATION');
  report.push('-'.repeat(70));
  report.push('Monthly Costs:');
  report.push(`  Compute: $${costs.totals.compute}`);
  report.push(`  Storage: $${costs.totals.storage}`);
  report.push(`  Network: $${costs.totals.network}`);
  report.push(`  TOTAL: $${costs.totals.monthly}/month ($${costs.totals.annual}/year)`);
  report.push('');

  // Recommendations
  report.push('RECOMMENDATIONS');
  report.push('-'.repeat(70));

  if (recommendations.immediate.length > 0) {
    report.push('IMMEDIATE (Week 1):');
    recommendations.immediate.forEach((r) => {
      report.push(`  [${r.priority}] ${r.action}`);
      if (r.steps) {
        r.steps.forEach((s) => report.push(`    - ${s}`));
      }
    });
    report.push('');
  }

  report.push('SHORT-TERM (Month 1-3):');
  recommendations.shortTerm.forEach((r) => {
    report.push(`  [${r.priority}] ${r.action}`);
    report.push(`    Rationale: ${r.rationale}`);
    if (r.estimatedSavings) {
      report.push(`    Est. Savings: ${r.estimatedSavings}`);
    }
    if (r.estimatedImprovement) {
      report.push(`    Est. Improvement: ${r.estimatedImprovement}`);
    }
  });
  report.push('');

  report.push('LONG-TERM (Month 6+):');
  recommendations.longTerm.forEach((r) => {
    report.push(`  [${r.priority}] ${r.action}`);
    report.push(`    Rationale: ${r.rationale}`);
    if (r.components) {
      report.push('    Components:');
      r.components.forEach((c) => report.push(`      - ${c}`));
    }
    if (r.estimatedImprovement) {
      report.push(`    Est. Improvement: ${r.estimatedImprovement}`);
    }
  });
  report.push('');

  report.push('═'.repeat(70));
  report.push(`Report generated: ${new Date().toISOString()}`);
  report.push('═'.repeat(70));

  return report.join('\n');
}

/**
 * Main execution
 */
function main() {
  const resultsFile = process.argv[2];

  console.log('Loading test results...');
  const data = loadResults(resultsFile);

  console.log('Analyzing bottlenecks...');
  const bottlenecks = analyzeBottlenecks(data);

  console.log('Calculating capacity requirements...');
  const capacity = calculateCapacity(data, bottlenecks);

  console.log('Generating scaling strategy...');
  const scaling = generateScalingStrategy(capacity);

  console.log('Estimating costs...');
  const costs = estimateCosts(capacity);

  console.log('Generating recommendations...');
  const recommendations = generateRecommendations(bottlenecks, capacity);

  console.log('');
  const report = printReport(data, bottlenecks, capacity, scaling, costs, recommendations);
  console.log(report);

  // Save report
  const reportPath = join(__dirname, 'capacity-report.txt');
  writeFileSync(reportPath, report);
  console.log(`\nReport saved to: ${reportPath}`);

  // Save structured data
  const jsonPath = join(__dirname, 'capacity-plan.json');
  const structuredData = {
    timestamp: new Date().toISOString(),
    bottlenecks,
    capacity,
    scaling,
    costs,
    recommendations,
  };
  writeFileSync(jsonPath, JSON.stringify(structuredData, null, 2));
  console.log(`Structured data saved to: ${jsonPath}`);
}

main();
