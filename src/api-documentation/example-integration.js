/**
 * Example: How to integrate API Documentation into your server
 */

import express from 'express';
import { setupApiDocumentation } from './documentation-server.js';

// Create Express app
const app = express();
app.use(express.json());

// Example endpoints definition
const API_ENDPOINTS = [
  {
    path: '/api/formulas',
    method: 'GET',
    tag: 'Formulas',
    summary: 'List all formulas',
    description: 'Retrieve a list of mathematical formulas',
    operationId: 'listFormulas',
    queryParams: [
      {
        name: 'page',
        type: 'integer',
        required: false,
        description: 'Page number (default: 1)'
      },
      {
        name: 'limit',
        type: 'integer',
        required: false,
        description: 'Items per page (default: 20)'
      },
      {
        name: 'search',
        type: 'string',
        required: false,
        description: 'Search query'
      }
    ],
    responseExample: {
      success: true,
      data: [
        {
          id: 'formula_1',
          name: 'Fibonacci',
          formula: 'F(n) = F(n-1) + F(n-2)',
          category: 'sequences',
          complexity: 'basic'
        }
      ],
      pagination: {
        page: 1,
        limit: 20,
        total: 100,
        totalPages: 5
      }
    }
  },
  {
    path: '/api/formulas/{id}',
    method: 'GET',
    tag: 'Formulas',
    summary: 'Get formula by ID',
    description: 'Retrieve a specific formula by its identifier',
    operationId: 'getFormula',
    responseExample: {
      success: true,
      data: {
        id: 'formula_1',
        name: 'Fibonacci',
        formula: 'F(n) = F(n-1) + F(n-2)',
        description: 'Fibonacci sequence formula',
        proof: 'Proved by mathematical induction',
        examples: ['1, 1, 2, 3, 5, 8, 13...'],
        complexity: 'O(n)',
        category: 'sequences'
      }
    }
  },
  {
    path: '/api/formulas/discover',
    method: 'POST',
    tag: 'Discovery',
    summary: 'Discover new formulas',
    description: 'Discover new mathematical formulas based on input patterns',
    operationId: 'discoverFormulas',
    requestBody: {
      required: true,
      example: {
        input: 'sequence: 1, 2, 4, 8, 16',
        type: 'sequence',
        limit: 5
      }
    },
    responseExample: {
      success: true,
      data: [
        {
          formula: '2^(n-1)',
          confidence: 0.95,
          pattern: 'geometric',
          explanation: 'Powers of 2'
        }
      ]
    }
  },
  {
    path: '/api/formulas/{id}/proof',
    method: 'GET',
    tag: 'Proofs',
    summary: 'Get proof for formula',
    description: 'Retrieve the mathematical proof for a specific formula',
    operationId: 'getProof',
    responseExample: {
      success: true,
      data: {
        formulaId: 'formula_1',
        proof: 'By mathematical induction...',
        steps: [
          'Base case: F(1) = 1',
          'Inductive step: assume F(k) = F(k-1) + F(k-2)',
          'Prove: F(k+1) = F(k) + F(k-1)'
        ],
        complexity: 'O(1)',
        verified: true
      }
    }
  },
  {
    path: '/api/proofs/verify',
    method: 'POST',
    tag: 'Proofs',
    summary: 'Verify a proof',
    description: 'Verify the validity of a mathematical proof',
    operationId: 'verifyProof',
    requestBody: {
      required: true,
      example: {
        proof: 'By mathematical induction...',
        formula: 'F(n) = F(n-1) + F(n-2)',
        context: {}
      }
    },
    responseExample: {
      success: true,
      data: {
        valid: true,
        confidence: 0.98,
        issues: [],
        suggestions: []
      }
    }
  },
  {
    path: '/api/graphs',
    method: 'POST',
    tag: 'Graphs',
    summary: 'Generate computational graph',
    description: 'Generate a computational graph from formulas',
    operationId: 'generateGraph',
    requestBody: {
      required: true,
      example: {
        formulas: ['formula_1', 'formula_2'],
        layout: 'hierarchical'
      }
    },
    responseExample: {
      success: true,
      data: {
        nodes: [
          { id: 'n1', formula: 'F(n)', label: 'Fibonacci' }
        ],
        edges: [
          { from: 'n1', to: 'n2', type: 'dependency' }
        ],
        layout: {
          type: 'hierarchical',
          direction: 'top-to-bottom'
        }
      }
    }
  },
  {
    path: '/api/recommendations',
    method: 'GET',
    tag: 'Recommendations',
    summary: 'Get formula recommendations',
    description: 'Get personalized formula recommendations',
    operationId: 'getRecommendations',
    queryParams: [
      {
        name: 'context',
        type: 'string',
        required: false,
        description: 'Context for recommendations'
      },
      {
        name: 'limit',
        type: 'integer',
        required: false,
        description: 'Number of recommendations (default: 5)'
      }
    ],
    responseExample: {
      success: true,
      data: [
        {
          formula: 'F(n)',
          relevance: 0.92,
          reason: 'Related to your previous search'
        }
      ]
    }
  }
];

// Setup API documentation with custom configuration
setupApiDocumentation(app, API_ENDPOINTS, {
  title: 'Formula Nebula API',
  version: '1.0.0',
  description: 'Discover, prove, and explore mathematical formulas',
  baseUrl: 'https://api.formula-nebula.com'
});

// Implement actual API endpoints
app.get('/api/formulas', (req, res) => {
  res.json({
    success: true,
    data: [],
    pagination: { page: 1, limit: 20, total: 0, totalPages: 0 }
  });
});

app.get('/api/formulas/:id', (req, res) => {
  res.json({
    success: true,
    data: { id: req.params.id, name: 'Example Formula' }
  });
});

app.post('/api/formulas/discover', (req, res) => {
  res.json({
    success: true,
    data: []
  });
});

// Additional middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    success: false,
    error: {
      code: 500,
      message: 'Internal server error'
    }
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\\n╔══════════════════════════════════════════════╗`);
  console.log(`║       Formula Nebula API Server              ║`);
  console.log(`║       With Complete Documentation            ║`);
  console.log(`╚══════════════════════════════════════════════╝\\n`);

  console.log(`🚀 Server running on http://localhost:${PORT}\\n`);

  console.log('📚 Documentation:');
  console.log(`   📖 Swagger UI: http://localhost:${PORT}/api/swagger-ui`);
  console.log(`   📘 ReDoc: http://localhost:${PORT}/api/redoc`);
  console.log(`   📄 OpenAPI: http://localhost:${PORT}/api/swagger.json`);
  console.log(`   📝 Markdown: http://localhost:${PORT}/api/markdown`);
  console.log(`   🌐 HTML: http://localhost:${PORT}/api/html\\n`);

  console.log('🧪 Testing:');
  console.log(`   ✅ All Tests: http://localhost:${PORT}/api/test/run-all`);
  console.log(`   💚 Health: http://localhost:${PORT}/api/test/health`);
  console.log(`   🔐 Auth Test: http://localhost:${PORT}/api/test/auth`);
  console.log(`   ⚡ Performance: http://localhost:${PORT}/api/test/performance\\n`);

  console.log('💾 Download:');
  console.log(`   📦 Postman: http://localhost:${PORT}/api/postman.json`);
  console.log(`   🐍 Python: http://localhost:${PORT}/api/examples/python`);
  console.log(`   🟨 JavaScript: http://localhost:${PORT}/api/examples/javascript\\n`);
});

export default app;
