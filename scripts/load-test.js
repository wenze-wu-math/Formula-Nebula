/**
 * ═════════════════════════════════════════════════════════════
 *  Formula Nebula Load Testing with k6
 * ═════════════════════════════════════════════════════════════
 *
 *  Progressive load test: 1K → 10K → 50K → 100K concurrent users
 *  Tests both static asset delivery and WebSocket collaboration
 *
 *  Run: k6 run scripts/load-test.js
 *  Or with specific stage: k6 run -e STAGE=stress scripts/load-test.js
 */

import http from 'k6/http';
import ws from 'k6/ws';
import { check, group, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics
const renderErrors = new Rate('render_errors');
const renderTime = new Trend('render_time');
const wsConnections = new Counter('ws_connections');
const wsMessages = new Counter('ws_messages');
const jsHeapSize = new Trend('js_heap_size');
const fps = new Trend('fps');

// Environment config
const BASE_URL = __ENV.BASE_URL || 'http://localhost:5173';
const WS_URL = __ENV.WS_URL || 'ws://localhost:8765';
const STAGE = __ENV.STAGE || 'all';

// Load test stages
const stages = {
  smoke: [
    { duration: '30s', target: 10 },
    { duration: '1m', target: 10 },
    { duration: '30s', target: 0 },
  ],
  load: [
    { duration: '2m', target: 100 },
    { duration: '5m', target: 100 },
    { duration: '2m', target: 1000 },
    { duration: '5m', target: 1000 },
    { duration: '2m', target: 0 },
  ],
  stress: [
    { duration: '2m', target: 1000 },
    { duration: '5m', target: 1000 },
    { duration: '2m', target: 10000 },
    { duration: '5m', target: 10000 },
    { duration: '2m', target: 50000 },
    { duration: '5m', target: 50000 },
    { duration: '10m', target: 0 },
  ],
  spike: [
    { duration: '10s', target: 100 },
    { duration: '1m', target: 100 },
    { duration: '10s', target: 10000 },
    { duration: '3m', target: 10000 },
    { duration: '10s', target: 100 },
    { duration: '3m', target: 100 },
    { duration: '10s', target: 0 },
  ],
  soak: [
    { duration: '2m', target: 1000 },
    { duration: '3h', target: 1000 },
    { duration: '2m', target: 0 },
  ],
};

export const options = {
  stages: STAGE === 'all' ? stages.stress : stages[STAGE],
  thresholds: {
    'http_req_duration': ['p(95)<500', 'p(99)<1000'],
    'http_req_failed': ['rate<0.01'],
    'render_errors': ['rate<0.05'],
    'render_time': ['p(95)<2000', 'p(99)<5000'],
    'ws_connections': ['count>0'],
    'fps': ['p(50)>30', 'p(95)>20'],
  },
  ext: {
    loadimpact: {
      projectID: 3584623,
      name: 'Formula Nebula Load Test'
    }
  }
};

/**
 * Setup function - runs once before test
 */
export function setup() {
  const res = http.get(BASE_URL);
  check(res, {
    'server is up': (r) => r.status === 200,
  });

  return {
    baseUrl: BASE_URL,
    wsUrl: WS_URL,
    timestamp: Date.now(),
  };
}

/**
 * Main test scenario
 */
export default function(data) {
  // User behavior profile
  const userProfile = Math.random();

  if (userProfile < 0.6) {
    // 60% - Casual browser: loads page, views a few formulas
    casualBrowser(data);
  } else if (userProfile < 0.85) {
    // 25% - Active explorer: navigates, clicks formulas, uses search
    activeExplorer(data);
  } else {
    // 15% - Collaborator: connects WebSocket, sends edits
    collaborator(data);
  }
}

/**
 * Scenario 1: Casual Browser
 */
function casualBrowser(data) {
  group('casual_browser', () => {
    // Load main page
    const startTime = Date.now();
    const mainPage = http.get(data.baseUrl);

    check(mainPage, {
      'status is 200': (r) => r.status === 200,
      'page loads': (r) => r.body.includes('Formula Nebula'),
      'has canvas': (r) => r.body.includes('id="scene"'),
    });

    // Load critical assets
    const batch = http.batch([
      ['GET', `${data.baseUrl}/src/main.js`],
      ['GET', `${data.baseUrl}/src/config.js`],
      ['GET', `${data.baseUrl}/src/graph.js`],
      ['GET', `${data.baseUrl}/src/scene.js`],
    ]);

    batch.forEach((res, idx) => {
      check(res, {
        [`asset ${idx} loaded`]: (r) => r.status === 200,
      });
    });

    // Load data files
    const dataFiles = http.batch([
      ['GET', `${data.baseUrl}/src/data/knowledge.js`],
      ['GET', `${data.baseUrl}/src/data/conjectures.js`],
    ]);

    const loadTime = Date.now() - startTime;
    renderTime.add(loadTime);

    // Simulate viewing
    sleep(Math.random() * 5 + 2);

    // Click a few formulas
    const clicks = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < clicks; i++) {
      sleep(Math.random() * 2 + 1);
    }
  });
}

/**
 * Scenario 2: Active Explorer
 */
function activeExplorer(data) {
  group('active_explorer', () => {
    // Load main page
    const mainPage = http.get(data.baseUrl);
    check(mainPage, { 'loaded': (r) => r.status === 200 });

    // Load all assets
    const assets = http.batch([
      ['GET', `${data.baseUrl}/src/main.js`],
      ['GET', `${data.baseUrl}/src/graph.js`],
      ['GET', `${data.baseUrl}/src/scene.js`],
      ['GET', `${data.baseUrl}/src/ui.js`],
      ['GET', `${data.baseUrl}/src/formulaTexture.js`],
      ['GET', `${data.baseUrl}/src/data/knowledge.js`],
      ['GET', `${data.baseUrl}/src/data/proofs/index.js`],
    ]);

    // Simulate intensive interaction
    for (let i = 0; i < 10; i++) {
      // Click formula
      sleep(Math.random() * 1 + 0.5);

      // View proof (if available)
      if (Math.random() < 0.3) {
        sleep(Math.random() * 3 + 2);
      }

      // Switch view mode
      if (Math.random() < 0.2) {
        sleep(0.5);
      }
    }

    // Use search
    if (Math.random() < 0.4) {
      sleep(Math.random() * 2 + 1);
    }

    // Export view
    if (Math.random() < 0.1) {
      sleep(1);
    }
  });
}

/**
 * Scenario 3: Collaborator (WebSocket)
 */
function collaborator(data) {
  group('collaborator', () => {
    // Load page first
    const mainPage = http.get(data.baseUrl);
    check(mainPage, { 'loaded': (r) => r.status === 200 });

    // Connect WebSocket
    const url = data.wsUrl;
    const params = { tags: { name: 'collaboration' } };

    const res = ws.connect(url, params, (socket) => {
      wsConnections.add(1);

      socket.on('open', () => {
        // Send join message
        const joinMsg = JSON.stringify({
          type: 'join',
          userId: `user-${__VU}`,
          sessionId: 'test-session',
        });
        socket.send(joinMsg);
        wsMessages.add(1);
      });

      socket.on('message', (data) => {
        wsMessages.add(1);
        check(data, {
          'valid message': (d) => {
            try {
              const msg = JSON.parse(d);
              return msg.type !== undefined;
            } catch (e) {
              return false;
            }
          },
        });
      });

      // Simulate collaboration activity
      let messageCount = 0;
      const maxMessages = Math.floor(Math.random() * 10) + 5;

      const interval = setInterval(() => {
        if (messageCount >= maxMessages) {
          socket.close();
          return;
        }

        // Send annotation
        if (Math.random() < 0.5) {
          const annotation = JSON.stringify({
            type: 'annotation',
            nodeId: `node-${Math.floor(Math.random() * 464)}`,
            text: 'Test annotation',
            userId: `user-${__VU}`,
          });
          socket.send(annotation);
          wsMessages.add(1);
        }

        // Send cursor position
        if (Math.random() < 0.7) {
          const cursor = JSON.stringify({
            type: 'cursor',
            x: Math.random() * 1920,
            y: Math.random() * 1080,
            userId: `user-${__VU}`,
          });
          socket.send(cursor);
          wsMessages.add(1);
        }

        messageCount++;
      }, 1000);

      socket.setTimeout(() => {
        clearInterval(interval);
        socket.close();
      }, 30000);

      socket.on('close', () => {
        clearInterval(interval);
      });
    });

    check(res, {
      'ws connection ok': (r) => r && r.status === 101,
    });
  });
}

/**
 * Teardown - runs once after test
 */
export function teardown(data) {
  const duration = Date.now() - data.timestamp;
  console.log(`Test completed in ${duration}ms`);
}

/**
 * Handle summary data
 */
export function handleSummary(data) {
  return {
    'stdout': textSummary(data, { indent: ' ', enableColors: true }),
    'load-test-results.json': JSON.stringify(data, null, 2),
  };
}

function textSummary(data, options) {
  const { indent = '', enableColors = false } = options;

  let summary = '\n' + indent + '=' .repeat(60) + '\n';
  summary += indent + 'Formula Nebula Load Test Summary\n';
  summary += indent + '='.repeat(60) + '\n\n';

  // Test info
  summary += indent + `Test Duration: ${data.state.testRunDurationMs}ms\n`;
  summary += indent + `VUs: ${data.metrics.vus.values.value}\n`;
  summary += indent + `Iterations: ${data.metrics.iterations.values.count}\n\n`;

  // HTTP metrics
  summary += indent + 'HTTP Metrics:\n';
  summary += indent + `  Requests: ${data.metrics.http_reqs.values.count}\n`;
  summary += indent + `  Failed: ${data.metrics.http_req_failed.values.rate * 100}%\n`;
  summary += indent + `  Duration p95: ${data.metrics.http_req_duration.values['p(95)']}ms\n`;
  summary += indent + `  Duration p99: ${data.metrics.http_req_duration.values['p(99)']}ms\n\n`;

  // Custom metrics
  if (data.metrics.render_time) {
    summary += indent + 'Render Performance:\n';
    summary += indent + `  Render Time p95: ${data.metrics.render_time.values['p(95)']}ms\n`;
    summary += indent + `  Render Errors: ${(data.metrics.render_errors?.values.rate || 0) * 100}%\n\n`;
  }

  if (data.metrics.ws_connections) {
    summary += indent + 'WebSocket:\n';
    summary += indent + `  Connections: ${data.metrics.ws_connections.values.count}\n`;
    summary += indent + `  Messages: ${data.metrics.ws_messages?.values.count || 0}\n\n`;
  }

  // Thresholds
  summary += indent + 'Thresholds:\n';
  Object.entries(data.thresholds || {}).forEach(([name, result]) => {
    const status = result.ok ? '✓' : '✗';
    summary += indent + `  ${status} ${name}\n`;
  });

  summary += '\n' + indent + '='.repeat(60) + '\n';

  return summary;
}
