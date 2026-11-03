/**
 * API Documentation Server Integration
 * Integrates Swagger, documentation, and test endpoints into the main server
 */

import express from 'express';
import { SwaggerGenerator } from './swagger-generator.js';
import { EnhancedDocumentationGenerator } from './enhanced-documentation.js';
import { TestEndpoints } from './test-endpoints.js';

/**
 * Setup API documentation on an Express app
 * Usage: setupApiDocumentation(app, endpoints, config)
 */
export function setupApiDocumentation(app, endpoints = [], config = {}) {
  const router = express.Router();

  // Initialize documentation generators
  const swaggerGen = new SwaggerGenerator({
    title: config.title || 'Formula Nebula API',
    version: config.version || '1.0.0',
    description: config.description || 'Mathematical Formula Discovery and Proof Generation API',
    baseUrl: config.baseUrl || 'https://api.formula-nebula.com'
  });

  const docGen = new EnhancedDocumentationGenerator({
    baseUrl: config.baseUrl || 'https://api.formula-nebula.com',
    apiVersion: config.version || '1.0.0'
  });

  // Generate Swagger spec
  const swaggerSpec = swaggerGen.generate(endpoints);

  // Swagger JSON endpoint
  router.get('/swagger.json', (req, res) => {
    res.json(swaggerSpec);
  });

  // Swagger UI
  router.get('/swagger-ui', (req, res) => {
    res.type('html').send(swaggerGen.generateSwaggerUI('/api/swagger.json'));
  });

  // ReDoc UI
  router.get('/redoc', (req, res) => {
    res.type('html').send(swaggerGen.generateReDocUI('/api/swagger.json'));
  });

  // Markdown documentation
  router.get('/markdown', (req, res) => {
    const markdown = docGen.generateMarkdownDocs(endpoints);
    res.set('Content-Type', 'text/markdown');
    res.send(markdown);
  });

  // HTML documentation
  router.get('/html', (req, res) => {
    const html = docGen.generateHTMLDocs(endpoints);
    res.type('html').send(html);
  });

  // Postman collection
  router.get('/postman.json', (req, res) => {
    const collection = docGen.generatePostmanCollection(endpoints);
    res.json(collection);
  });

  // Code examples
  router.get('/examples/:language', (req, res) => {
    const examples = docGen.generateCodeExamples(endpoints);
    const language = req.params.language.toLowerCase();

    // Get first endpoint example
    const firstExample = Object.values(examples)[0];
    if (!firstExample || !firstExample[language]) {
      return res.status(404).json({
        error: 'Language or examples not found',
        availableLanguages: Object.keys(firstExample || {})
      });
    }

    res.type('text/plain').send(firstExample[language]);
  });

  // Documentation index
  router.get('/', (req, res) => {
    res.json({
      title: 'API Documentation',
      version: config.version || '1.0.0',
      endpoints: {
        'Swagger UI': '/api/swagger-ui',
        'ReDoc': '/api/redoc',
        'OpenAPI Spec': '/api/swagger.json',
        'Markdown': '/api/markdown',
        'HTML': '/api/html',
        'Postman Collection': '/api/postman.json',
        'Code Examples': '/api/examples/{language}'
      },
      examples: {
        javascript: '/api/examples/javascript',
        python: '/api/examples/python',
        typescript: '/api/examples/typescript',
        go: '/api/examples/go',
        java: '/api/examples/java',
        curl: '/api/examples/curl'
      },
      testing: {
        'All Tests': '/api/test/run-all',
        'Health Check': '/api/test/health',
        'Authentication': '/api/test/auth',
        'Rate Limits': '/api/test/rate-limit',
        'Response Format': '/api/test/response-format',
        'Error Handling': '/api/test/error-handling',
        'Performance': '/api/test/performance',
        'Pagination': '/api/test/pagination',
        'Filtering': '/api/test/filtering',
        'Sorting': '/api/test/sorting',
        'Validation': '/api/test/validation'
      },
      documentation: {
        guide: 'See /api/markdown or /api/html',
        spec: 'See /api/swagger.json',
        postman: 'See /api/postman.json'
      }
    });
  });

  // Register test endpoints
  const testEndpoints = new TestEndpoints(app, config);
  testEndpoints.register();

  // Mount documentation router
  app.use('/api', router);

  console.log('✅ API Documentation endpoints registered:');
  console.log('   📖 Swagger UI: /api/swagger-ui');
  console.log('   📘 ReDoc: /api/redoc');
  console.log('   📄 OpenAPI: /api/swagger.json');
  console.log('   📝 Markdown: /api/markdown');
  console.log('   🌐 HTML: /api/html');
  console.log('   📦 Postman: /api/postman.json');
  console.log('   🧪 Testing: /api/test/run-all');
}

/**
 * Create a standalone documentation server
 */
export function createDocumentationServer(endpoints, config = {}) {
  const app = express();
  const port = config.port || 3002;

  app.use(express.json());

  // CORS
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
  });

  // Setup documentation
  setupApiDocumentation(app, endpoints, config);

  // Static file serving (if needed)
  if (config.staticDir) {
    app.use(express.static(config.staticDir));
  }

  // Start server
  app.listen(port, () => {
    console.log(`\\n📚 API Documentation Server`);
    console.log(`🚀 Running on http://localhost:${port}`);
    console.log(`\\n📖 Access points:`);
    console.log(`   - Swagger UI: http://localhost:${port}/api/swagger-ui`);
    console.log(`   - ReDoc: http://localhost:${port}/api/redoc`);
    console.log(`   - HTML Docs: http://localhost:${port}/api/html`);
    console.log(`   - Testing: http://localhost:${port}/api/test/run-all\\n`);
  });

  return app;
}

/**
 * Export for use in modules
 */
export { SwaggerGenerator, EnhancedDocumentationGenerator, TestEndpoints };

export default setupApiDocumentation;
