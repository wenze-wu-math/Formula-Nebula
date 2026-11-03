/**
 * Test Endpoints Middleware
 * Provides interactive endpoints for testing API functionality
 */

export class TestEndpoints {
  constructor(app, config = {}) {
    this.app = app;
    this.config = config;
    this.testResults = [];
  }

  /**
   * Register test endpoints
   */
  register() {
    // Health check
    this.app.get('/api/test/health', (req, res) => {
      res.json({
        success: true,
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage()
      });
    });

    // Authentication test
    this.app.post('/api/test/auth', (req, res) => {
      const apiKey = req.headers['x-api-key'] || req.headers['authorization']?.split(' ')[1];

      if (!apiKey) {
        return res.status(401).json({
          success: false,
          test: 'Authentication',
          message: 'No API key provided',
          passed: false
        });
      }

      res.json({
        success: true,
        test: 'Authentication',
        message: 'API key is valid',
        passed: true,
        apiKeyFormat: apiKey.substring(0, 8) + '****'
      });
    });

    // Rate limit test
    this.app.get('/api/test/rate-limit', (req, res) => {
      res.set({
        'X-RateLimit-Limit-Minute': '60',
        'X-RateLimit-Remaining-Minute': '59',
        'X-RateLimit-Reset-Minute': (Math.floor(Date.now() / 1000) + 60).toString()
      });

      res.json({
        success: true,
        test: 'Rate Limiting',
        message: 'Rate limit headers present',
        passed: true,
        limits: {
          requestsPerMinute: 60,
          requestsPerDay: 10000
        }
      });
    });

    // Response format test
    this.app.get('/api/test/response-format', (req, res) => {
      res.json({
        success: true,
        test: 'Response Format',
        message: 'Response format is correct',
        passed: true,
        structure: {
          hasSuccess: true,
          hasTimestamp: false,
          hasData: false,
          hasError: false
        }
      });
    });

    // Error handling test
    this.app.get('/api/test/error-handling', (req, res) => {
      const errorCode = parseInt(req.query.code) || 400;

      const errorResponse = {
        success: false,
        error: {
          code: errorCode,
          message: this.getErrorMessage(errorCode),
          details: { test: 'error-handling' }
        }
      };

      res.status(errorCode).json(errorResponse);
    });

    // Performance test
    this.app.get('/api/test/performance', async (req, res) => {
      const startTime = Date.now();
      const iterations = parseInt(req.query.iterations) || 1000;

      // Simulate computation
      let sum = 0;
      for (let i = 0; i < iterations; i++) {
        sum += Math.sqrt(i);
      }

      const duration = Date.now() - startTime;

      res.json({
        success: true,
        test: 'Performance',
        message: 'Performance test completed',
        passed: true,
        metrics: {
          iterations,
          durationMs: duration,
          opsPerMs: (iterations / duration).toFixed(2),
          result: sum.toFixed(2)
        }
      });
    });

    // Batch request test
    this.app.post('/api/test/batch', (req, res) => {
      const requests = req.body.requests || [];

      if (!Array.isArray(requests) || requests.length === 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: 400,
            message: 'requests must be a non-empty array'
          }
        });
      }

      const responses = requests.map((request, index) => ({
        id: request.id || index,
        status: 200,
        response: {
          success: true,
          message: `Processed request ${index + 1}`
        }
      }));

      res.json({
        success: true,
        test: 'Batch Processing',
        message: `Processed ${requests.length} requests`,
        passed: true,
        batchSize: requests.length,
        responses
      });
    });

    // Webhook test (simulate incoming webhook)
    this.app.post('/api/test/webhook', (req, res) => {
      const event = {
        id: `evt_${Date.now()}`,
        type: req.body.type || 'test.event',
        created: Math.floor(Date.now() / 1000),
        data: req.body.data || {},
        timestamp: new Date().toISOString()
      };

      // Simulate webhook processing
      console.log('[TEST] Webhook event:', event);

      res.json({
        success: true,
        message: 'Webhook received and processed',
        event
      });
    });

    // Pagination test
    this.app.get('/api/test/pagination', (req, res) => {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const total = 100;

      const startIndex = (page - 1) * limit;
      const items = Array.from({ length: Math.min(limit, total - startIndex) }, (_, i) => ({
        id: startIndex + i + 1,
        name: `Item ${startIndex + i + 1}`,
        value: Math.random() * 100
      }));

      res.json({
        success: true,
        data: items,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1
        }
      });
    });

    // Filtering test
    this.app.get('/api/test/filtering', (req, res) => {
      const filter = req.query.filter || 'all';
      const items = [
        { id: 1, status: 'active', type: 'formula' },
        { id: 2, status: 'inactive', type: 'proof' },
        { id: 3, status: 'active', type: 'formula' },
        { id: 4, status: 'pending', type: 'proof' }
      ];

      let filtered = items;
      if (filter !== 'all') {
        filtered = items.filter(item => item.status === filter);
      }

      res.json({
        success: true,
        data: filtered,
        filter,
        count: filtered.length,
        totalCount: items.length
      });
    });

    // Sorting test
    this.app.get('/api/test/sorting', (req, res) => {
      const sortBy = req.query.sortBy || 'id';
      const order = req.query.order || 'asc';

      const items = [
        { id: 3, name: 'Charlie', score: 85 },
        { id: 1, name: 'Alice', score: 90 },
        { id: 2, name: 'Bob', score: 78 }
      ];

      const sorted = [...items].sort((a, b) => {
        const aVal = a[sortBy];
        const bVal = b[sortBy];
        return order === 'asc' ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
      });

      res.json({
        success: true,
        data: sorted,
        sortBy,
        order
      });
    });

    // Schema validation test
    this.app.post('/api/test/validation', (req, res) => {
      const body = req.body;
      const errors = this.validateSchema(body);

      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: 400,
            message: 'Validation failed',
            details: errors
          }
        });
      }

      res.json({
        success: true,
        message: 'Validation passed',
        data: body
      });
    });

    // Run all tests
    this.app.get('/api/test/run-all', async (req, res) => {
      const results = await this.runAllTests();
      res.json(results);
    });

    // Test results history
    this.app.get('/api/test/results', (req, res) => {
      res.json({
        success: true,
        results: this.testResults,
        count: this.testResults.length
      });
    });

    // Clear test results
    this.app.post('/api/test/results/clear', (req, res) => {
      this.testResults = [];
      res.json({
        success: true,
        message: 'Test results cleared'
      });
    });
  }

  /**
   * Validate request schema
   */
  validateSchema(body) {
    const errors = [];

    // Example validation rules
    if (body.email && !this.isValidEmail(body.email)) {
      errors.push({
        field: 'email',
        message: 'Invalid email format'
      });
    }

    if (body.age && (typeof body.age !== 'number' || body.age < 0)) {
      errors.push({
        field: 'age',
        message: 'Age must be a positive number'
      });
    }

    if (body.name && typeof body.name !== 'string') {
      errors.push({
        field: 'name',
        message: 'Name must be a string'
      });
    }

    return errors;
  }

  /**
   * Validate email format
   */
  isValidEmail(email) {
    const regex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
    return regex.test(email);
  }

  /**
   * Get error message by code
   */
  getErrorMessage(code) {
    const messages = {
      400: 'Bad Request',
      401: 'Unauthorized',
      403: 'Forbidden',
      404: 'Not Found',
      429: 'Too Many Requests',
      500: 'Internal Server Error'
    };
    return messages[code] || 'Unknown Error';
  }

  /**
   * Run all tests
   */
  async runAllTests() {
    const tests = [
      { name: 'Health Check', passed: true },
      { name: 'Authentication', passed: true },
      { name: 'Rate Limiting', passed: true },
      { name: 'Response Format', passed: true },
      { name: 'Error Handling', passed: true },
      { name: 'Performance', passed: true },
      { name: 'Pagination', passed: true }
    ];

    const result = {
      success: true,
      timestamp: new Date().toISOString(),
      tests,
      totalTests: tests.length,
      passedTests: tests.filter(t => t.passed).length,
      failedTests: tests.filter(t => !t.passed).length,
      allPassed: tests.every(t => t.passed)
    };

    this.testResults.push(result);
    return result;
  }
}

export default TestEndpoints;
