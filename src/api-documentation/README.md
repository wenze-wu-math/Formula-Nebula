# Formula Nebula API Documentation

Complete, production-ready API documentation system with Swagger integration, code examples, and interactive testing.

## 📋 Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Components](#components)
- [Usage Examples](#usage-examples)
- [API Endpoints](#api-endpoints)
- [Configuration](#configuration)
- [Testing](#testing)

## ✨ Features

- **Swagger/OpenAPI 3.0**: Automatically generated OpenAPI specifications
- **Interactive Documentation**: Swagger UI and ReDoc for beautiful API docs
- **Code Examples**: Generate code examples in JavaScript, Python, TypeScript, Go, Java, cURL
- **Postman Collection**: Export collection for Postman testing
- **Test Endpoints**: Interactive endpoints for API testing and validation
- **Multiple Formats**: Markdown, HTML, JSON, and more
- **Rate Limiting Docs**: Detailed rate limiting information
- **Error Handling**: Comprehensive error documentation with examples
- **Batch Processing**: Support for batch request testing
- **Performance Testing**: Built-in performance monitoring endpoints

## 📦 Installation

### Option 1: Use in Existing Express App

```javascript
import { setupApiDocumentation } from './api-documentation/documentation-server.js';

const app = express();
app.use(express.json());

// Define your endpoints
const endpoints = [
  {
    path: '/api/formulas',
    method: 'GET',
    tag: 'Formulas',
    summary: 'List formulas',
    description: 'Retrieve all formulas',
    responseExample: { /* ... */ }
  }
];

// Setup documentation
setupApiDocumentation(app, endpoints, {
  title: 'My API',
  version: '1.0.0'
});

app.listen(3000);
```

### Option 2: Standalone Documentation Server

```javascript
import { createDocumentationServer } from './api-documentation/documentation-server.js';

const endpoints = [ /* ... */ ];

const app = createDocumentationServer(endpoints, {
  port: 3002,
  title: 'Formula Nebula API'
});
```

## 🚀 Quick Start

### 1. Basic Setup

```javascript
import express from 'express';
import { setupApiDocumentation } from './api-documentation/documentation-server.js';

const app = express();
app.use(express.json());

const endpoints = [
  {
    path: '/api/users',
    method: 'GET',
    tag: 'Users',
    summary: 'Get all users',
    description: 'Retrieve a list of all users',
    queryParams: [
      { name: 'page', type: 'integer', required: false }
    ],
    responseExample: {
      success: true,
      data: [{ id: 1, name: 'John' }]
    }
  }
];

setupApiDocumentation(app, endpoints);

app.listen(3000, () => {
  console.log('📚 Docs: http://localhost:3000/api/swagger-ui');
});
```

### 2. Access Documentation

- **Swagger UI**: `http://localhost:3000/api/swagger-ui`
- **ReDoc**: `http://localhost:3000/api/redoc`
- **OpenAPI JSON**: `http://localhost:3000/api/swagger.json`
- **Markdown**: `http://localhost:3000/api/markdown`
- **HTML**: `http://localhost:3000/api/html`

### 3. Test Endpoints

```bash
# Run all tests
curl http://localhost:3000/api/test/run-all

# Health check
curl http://localhost:3000/api/test/health

# Authentication test
curl http://localhost:3000/api/test/auth \\
  -H "X-API-Key: YOUR_KEY"

# Rate limit test
curl http://localhost:3000/api/test/rate-limit
```

## 🏗️ Components

### 1. SwaggerGenerator

Generates OpenAPI 3.0 specifications and Swagger UI/ReDoc HTML.

```javascript
import { SwaggerGenerator } from './swagger-generator.js';

const gen = new SwaggerGenerator({
  title: 'My API',
  version: '1.0.0',
  baseUrl: 'https://api.example.com'
});

const spec = gen.generate(endpoints);
const html = gen.generateSwaggerUI('/api/swagger.json');
```

### 2. EnhancedDocumentationGenerator

Creates comprehensive documentation in multiple formats with code examples.

```javascript
import { EnhancedDocumentationGenerator } from './enhanced-documentation.js';

const gen = new EnhancedDocumentationGenerator({
  baseUrl: 'https://api.example.com'
});

const docs = await gen.generateDocumentation(endpoints);
// Returns: { markdown, examples, testCollection, html }
```

### 3. TestEndpoints

Provides interactive test endpoints for validation and debugging.

```javascript
import { TestEndpoints } from './test-endpoints.js';

const tests = new TestEndpoints(app);
tests.register();

// Available at:
// /api/test/health
// /api/test/auth
// /api/test/rate-limit
// /api/test/performance
// etc.
```

### 4. DocumentationServer

Main integration point that brings everything together.

```javascript
import { setupApiDocumentation } from './documentation-server.js';

setupApiDocumentation(app, endpoints, config);
```

## 📖 Usage Examples

### Define Endpoint with All Details

```javascript
const endpoint = {
  path: '/api/formulas/{id}/proof',
  method: 'GET',
  tag: 'Proofs',
  summary: 'Get formula proof',
  description: 'Retrieve mathematical proof for a formula',
  operationId: 'getFormulaProof',
  
  // Path parameters
  parameters: [
    {
      name: 'id',
      in: 'path',
      required: true,
      schema: { type: 'string' }
    }
  ],
  
  // Query parameters
  queryParams: [
    {
      name: 'format',
      type: 'string',
      required: false,
      description: 'Output format: json, latex, plain'
    },
    {
      name: 'detailed',
      type: 'boolean',
      required: false,
      description: 'Include detailed steps'
    }
  ],
  
  // Response
  responseExample: {
    success: true,
    data: {
      formulaId: 'f123',
      proof: 'By induction...',
      steps: [],
      verified: true
    }
  },
  
  // Authentication
  public: false // Requires auth
};
```

### Generate Code Examples

```javascript
const examples = docGen.generateCodeExamples(endpoints);

console.log(examples['GET_api_formulas'].javascript);
console.log(examples['GET_api_formulas'].python);
console.log(examples['GET_api_formulas'].typescript);
```

### Export Postman Collection

```javascript
const collection = docGen.generatePostmanCollection(endpoints);
fs.writeFileSync('collection.json', JSON.stringify(collection, null, 2));
```

### Generate Multiple Documentation Formats

```javascript
const docs = await docGen.generateDocumentation(endpoints);

// Markdown
fs.writeFileSync('API.md', docs.markdown);

// HTML
fs.writeFileSync('index.html', docs.html);

// Postman
fs.writeFileSync('postman.json', JSON.stringify(docs.testCollection, null, 2));
```

## 🔌 API Endpoints

### Documentation Routes

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api` | GET | Documentation index |
| `/api/swagger.json` | GET | OpenAPI specification |
| `/api/swagger-ui` | GET | Swagger UI HTML |
| `/api/redoc` | GET | ReDoc UI HTML |
| `/api/markdown` | GET | Markdown documentation |
| `/api/html` | GET | HTML documentation |
| `/api/postman.json` | GET | Postman collection |
| `/api/examples/:language` | GET | Code examples |

### Test Routes

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/test/health` | GET | Health check |
| `/api/test/auth` | POST | Authentication test |
| `/api/test/rate-limit` | GET | Rate limiting test |
| `/api/test/response-format` | GET | Response format validation |
| `/api/test/error-handling` | GET | Error handling test |
| `/api/test/performance` | GET | Performance metrics |
| `/api/test/batch` | POST | Batch request test |
| `/api/test/webhook` | POST | Webhook test |
| `/api/test/pagination` | GET | Pagination test |
| `/api/test/filtering` | GET | Filtering test |
| `/api/test/sorting` | GET | Sorting test |
| `/api/test/validation` | POST | Schema validation |
| `/api/test/run-all` | GET | Run all tests |
| `/api/test/results` | GET | Test history |

## ⚙️ Configuration

### Setup Options

```javascript
setupApiDocumentation(app, endpoints, {
  // API information
  title: 'Formula Nebula API',
  version: '1.0.0',
  description: 'Mathematical discovery platform',
  baseUrl: 'https://api.formula-nebula.com',
  
  // Servers
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Development'
    },
    {
      url: 'https://api.example.com',
      description: 'Production'
    }
  ],
  
  // Optional
  staticDir: './public' // Serve static files
});
```

### Endpoint Configuration

```javascript
{
  // Required
  path: '/api/endpoint',
  method: 'GET|POST|PUT|DELETE|PATCH',
  
  // Recommended
  tag: 'Category',
  summary: 'Short description',
  description: 'Detailed description',
  operationId: 'uniqueId',
  
  // Parameters
  queryParams: [],
  headerParams: [],
  
  // Request/Response
  requestBody: {
    required: true,
    example: {}
  },
  responseExample: {},
  
  // Security
  public: false // Requires authentication
}
```

## 🧪 Testing

### Run All Tests

```bash
curl http://localhost:3000/api/test/run-all
```

Response:
```json
{
  "success": true,
  "tests": [
    { "name": "Health Check", "passed": true },
    { "name": "Authentication", "passed": true },
    { "name": "Rate Limiting", "passed": true }
  ],
  "allPassed": true
}
```

### Test with cURL

```bash
# Test authentication
curl -X POST http://localhost:3000/api/test/auth \\
  -H "X-API-Key: test-key"

# Test performance
curl "http://localhost:3000/api/test/performance?iterations=5000"

# Test pagination
curl "http://localhost:3000/api/test/pagination?page=2&limit=10"

# Test filtering
curl "http://localhost:3000/api/test/filtering?filter=active"

# Test sorting
curl "http://localhost:3000/api/test/sorting?sortBy=name&order=asc"

# Test validation
curl -X POST http://localhost:3000/api/test/validation \\
  -H "Content-Type: application/json" \\
  -d '{"email":"test@example.com","age":25}'
```

### Postman Testing

1. Download collection: `GET /api/postman.json`
2. Import into Postman
3. Set variables: `base_url`, `api_key`
4. Run collection

## 📚 Documentation Views

### Swagger UI
- Interactive API explorer
- Try it out functionality
- Request/response examples
- Parameter validation
- Authorization testing

### ReDoc
- Modern, mobile-friendly view
- Better for reading
- Advanced search
- Built-in code samples

### HTML
- Standalone view
- No external dependencies
- Easy to customize
- Fast loading

### Markdown
- Version control friendly
- Easy to edit
- Good for documentation sites
- Generates static HTML

## 🔒 Security

### API Key Management

```javascript
// Authentication test
curl -X POST http://localhost:3000/api/test/auth \\
  -H "X-API-Key: YOUR_KEY"

// Response
{
  "success": true,
  "passed": true,
  "apiKeyFormat": "sk_test_****"
}
```

### Rate Limit Headers

```
X-RateLimit-Limit-Minute: 60
X-RateLimit-Remaining-Minute: 59
X-RateLimit-Reset-Minute: 1234567890
```

## 📦 Example Files

- `swagger-generator.js` - OpenAPI spec generation
- `enhanced-documentation.js` - Multi-format docs
- `test-endpoints.js` - Interactive testing
- `documentation-server.js` - Integration layer
- `example-integration.js` - Complete example

## 🤝 Integration with Existing APIs

```javascript
import { setupApiDocumentation } from './api-documentation/documentation-server.js';

// In your existing server
const app = express();

// Your existing routes
app.get('/api/users', (req, res) => { /* ... */ });
app.post('/api/users', (req, res) => { /* ... */ });

// Add documentation
const endpoints = [
  /* Define your endpoints here */
];

setupApiDocumentation(app, endpoints);

app.listen(3000);
```

## 📊 Monitoring

View test results history:

```bash
curl http://localhost:3000/api/test/results
```

Clear test history:

```bash
curl -X POST http://localhost:3000/api/test/results/clear
```

## 🎯 Best Practices

1. **Define Endpoints First**: Document endpoints before implementation
2. **Use Consistent Tags**: Group related endpoints with tags
3. **Add Examples**: Include realistic request/response examples
4. **Test Regularly**: Run test suite before deployment
5. **Keep Docs Updated**: Update documentation with each API change
6. **Version Your API**: Use semantic versioning
7. **Document Errors**: Include common error codes and meanings
8. **Rate Limiting**: Clearly communicate rate limits
9. **Authentication**: Explain auth methods clearly
10. **Base URLs**: Document all available environments

## 🚀 Production Deployment

```javascript
setupApiDocumentation(app, endpoints, {
  title: 'Formula Nebula API',
  version: '1.0.0',
  baseUrl: process.env.API_URL || 'https://api.formula-nebula.com',
  servers: [
    {
      url: 'https://api.formula-nebula.com',
      description: 'Production'
    },
    {
      url: 'https://staging.formula-nebula.com',
      description: 'Staging'
    }
  ]
});
```

## 📞 Support

For issues or questions:
- Check existing examples: `example-integration.js`
- Review component documentation
- Run test endpoints to verify setup
- Check browser console for errors

## 📄 License

MIT

---

**Version**: 1.0.0  
**Last Updated**: 2024-11-03  
**Maintained by**: Formula Nebula Team
