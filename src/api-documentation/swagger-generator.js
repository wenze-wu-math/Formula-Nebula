/**
 * Swagger/OpenAPI Generator for Formula Nebula APIs
 * Generates complete Swagger/OpenAPI 3.0 documentation
 */

export class SwaggerGenerator {
  constructor(config = {}) {
    this.title = config.title || 'Formula Nebula API';
    this.version = config.version || '1.0.0';
    this.description = config.description || 'Mathematical Formula Discovery and Proof Generation API';
    this.baseUrl = config.baseUrl || 'https://api.formula-nebula.com';
    this.servers = config.servers || [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      },
      {
        url: 'https://api.formula-nebula.com',
        description: 'Production server'
      }
    ];
  }

  /**
   * Generate complete Swagger/OpenAPI specification
   */
  generate(endpoints, options = {}) {
    const spec = {
      openapi: '3.0.0',
      info: {
        title: this.title,
        version: this.version,
        description: this.description,
        contact: {
          name: 'Formula Nebula Support',
          url: 'https://formula-nebula.com/support',
          email: 'support@formula-nebula.com'
        },
        license: {
          name: 'MIT',
          url: 'https://opensource.org/licenses/MIT'
        }
      },
      servers: this.servers,
      security: [
        {
          bearerAuth: []
        },
        {
          apiKeyAuth: []
        }
      ],
      paths: this.generatePaths(endpoints),
      components: this.generateComponents(),
      tags: this.generateTags(endpoints),
      externalDocs: {
        description: 'Find out more about Formula Nebula',
        url: 'https://formula-nebula.com/docs'
      }
    };

    return spec;
  }

  /**
   * Generate OpenAPI paths object
   */
  generatePaths(endpoints) {
    const paths = {};

    endpoints.forEach(endpoint => {
      const path = endpoint.path;
      if (!paths[path]) {
        paths[path] = {};
      }

      const methodKey = endpoint.method.toLowerCase();
      paths[path][methodKey] = this.generateEndpointSpec(endpoint);
    });

    return paths;
  }

  /**
   * Generate specification for single endpoint
   */
  generateEndpointSpec(endpoint) {
    const spec = {
      tags: [endpoint.tag || 'General'],
      summary: endpoint.summary || `${endpoint.method} ${endpoint.path}`,
      description: endpoint.description || '',
      operationId: endpoint.operationId || this.generateOperationId(endpoint),
      parameters: this.generateParameters(endpoint),
      requestBody: endpoint.method !== 'GET' ? this.generateRequestBody(endpoint) : undefined,
      responses: this.generateResponses(endpoint),
      security: endpoint.public !== true ? [
        { bearerAuth: [] },
        { apiKeyAuth: [] }
      ] : []
    };

    // Remove undefined fields
    Object.keys(spec).forEach(key => {
      if (spec[key] === undefined) {
        delete spec[key];
      }
    });

    return spec;
  }

  /**
   * Generate operation ID from endpoint
   */
  generateOperationId(endpoint) {
    const method = endpoint.method.toLowerCase();
    const path = endpoint.path
      .replace(/\{([^}]+)\}/g, 'By$1')
      .replace(/[/-]/g, '_')
      .replace(/^_/, '');
    return `${method}_${path}`;
  }

  /**
   * Generate parameters from endpoint
   */
  generateParameters(endpoint) {
    const parameters = [];

    // Path parameters
    const pathParams = endpoint.path.match(/\{([^}]+)\}/g) || [];
    pathParams.forEach(param => {
      const name = param.replace(/[{}]/g, '');
      parameters.push({
        name,
        in: 'path',
        required: true,
        schema: {
          type: 'string'
        },
        description: `The ${name} identifier`
      });
    });

    // Query parameters
    if (endpoint.queryParams) {
      endpoint.queryParams.forEach(param => {
        parameters.push({
          name: param.name,
          in: 'query',
          required: param.required || false,
          schema: {
            type: param.type || 'string'
          },
          description: param.description || ''
        });
      });
    }

    // Header parameters
    if (endpoint.headerParams) {
      endpoint.headerParams.forEach(param => {
        parameters.push({
          name: param.name,
          in: 'header',
          required: param.required || false,
          schema: {
            type: param.type || 'string'
          },
          description: param.description || ''
        });
      });
    }

    return parameters.length > 0 ? parameters : undefined;
  }

  /**
   * Generate request body specification
   */
  generateRequestBody(endpoint) {
    if (!endpoint.requestBody) {
      return undefined;
    }

    return {
      required: endpoint.requestBody.required !== false,
      content: {
        'application/json': {
          schema: endpoint.requestBody.schema || {
            type: 'object',
            example: endpoint.requestBody.example || {}
          },
          examples: endpoint.requestBody.examples ? {
            example1: {
              summary: 'Example request',
              value: endpoint.requestBody.examples[0] || endpoint.requestBody.example || {}
            }
          } : undefined
        }
      }
    };
  }

  /**
   * Generate response specifications
   */
  generateResponses(endpoint) {
    const responses = {};

    // Success response
    responses['200'] = {
      description: 'Successful response',
      content: {
        'application/json': {
          schema: endpoint.responseSchema || {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: { type: 'object' }
            }
          },
          examples: endpoint.responseExamples ? {
            success: {
              summary: 'Successful response example',
              value: endpoint.responseExamples[0] || {
                success: true,
                data: {}
              }
            }
          } : undefined
        }
      }
    };

    // Error responses
    responses['400'] = {
      description: 'Bad Request - Invalid parameters',
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/Error'
          }
        }
      }
    };

    responses['401'] = {
      description: 'Unauthorized - Invalid or missing API key',
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/Error'
          }
        }
      }
    };

    responses['429'] = {
      description: 'Too Many Requests - Rate limit exceeded',
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/RateLimitError'
          }
        }
      }
    };

    responses['500'] = {
      description: 'Internal Server Error',
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/Error'
          }
        }
      }
    };

    return responses;
  }

  /**
   * Generate components/schemas
   */
  generateComponents() {
    return {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT Authorization header using the Bearer scheme'
        },
        apiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-Key',
          description: 'API Key for authorization'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            error: {
              type: 'object',
              properties: {
                code: {
                  type: 'integer',
                  example: 400
                },
                message: {
                  type: 'string',
                  example: 'Bad Request'
                },
                details: {
                  type: 'object',
                  example: {}
                }
              },
              required: ['code', 'message']
            }
          },
          required: ['success', 'error']
        },
        RateLimitError: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            error: {
              type: 'object',
              properties: {
                code: {
                  type: 'integer',
                  example: 429
                },
                message: {
                  type: 'string',
                  example: 'Rate limit exceeded'
                }
              }
            },
            retryAfter: {
              type: 'integer',
              description: 'Seconds to wait before retrying',
              example: 60
            }
          },
          required: ['success', 'error', 'retryAfter']
        },
        PaginationMeta: {
          type: 'object',
          properties: {
            total: {
              type: 'integer',
              example: 100
            },
            page: {
              type: 'integer',
              example: 1
            },
            pageSize: {
              type: 'integer',
              example: 20
            },
            totalPages: {
              type: 'integer',
              example: 5
            }
          }
        }
      }
    };
  }

  /**
   * Generate tags for API organization
   */
  generateTags(endpoints) {
    const tags = new Set();
    endpoints.forEach(endpoint => {
      if (endpoint.tag) {
        tags.add(endpoint.tag);
      }
    });

    return Array.from(tags).map(tag => ({
      name: tag,
      description: `${tag} operations`
    }));
  }

  /**
   * Generate Swagger UI HTML
   */
  generateSwaggerUI(specUrl = '/api/swagger.json') {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Formula Nebula API Documentation</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@3/swagger-ui.css">
    <link rel="icon" type="image/png" href="https://formula-nebula.com/favicon.ico">
    <style>
        html {
            box-sizing: border-box;
            overflow: -moz-scrollbars-vertical;
            overflow-y: scroll;
        }
        *,
        *:before,
        *:after {
            box-sizing: inherit;
        }
        body {
            margin: 0;
            background: #fafafa;
            font-family: sans-serif;
        }
        .topbar {
            background-color: #1a1a1a;
            padding: 10px 20px;
            display: flex;
            align-items: center;
            gap: 20px;
        }
        .topbar h1 {
            color: white;
            margin: 0;
            font-size: 24px;
        }
        .topbar-item {
            color: #ccc;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="topbar">
        <h1>📐 Formula Nebula API</h1>
        <div class="topbar-item">Interactive API Documentation</div>
    </div>
    <div id="swagger-ui"></div>
    <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@3/swagger-ui-bundle.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@3/swagger-ui-standalone-preset.js"></script>
    <script>
        window.onload = function() {
            window.ui = SwaggerUIBundle({
                url: "${specUrl}",
                dom_id: '#swagger-ui',
                deepLinking: true,
                presets: [
                    SwaggerUIBundle.presets.apis,
                    SwaggerUIStandalonePreset
                ],
                plugins: [
                    SwaggerUIBundle.plugins.DownloadUrl
                ],
                layout: "StandaloneLayout",
                defaultModelsExpandDepth: 1,
                docExpansion: 'list'
            });
        }
    </script>
</body>
</html>`;
  }

  /**
   * Generate ReDoc HTML for alternative documentation view
   */
  generateReDocUI(specUrl = '/api/swagger.json') {
    return `<!DOCTYPE html>
<html>
<head>
    <title>Formula Nebula API - ReDoc</title>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link href="https://fonts.googleapis.com/css?family=Montserrat:300,400,700|Roboto:300,400,700" rel="stylesheet">
    <style>
        body {
            margin: 0;
            padding: 0;
        }
    </style>
</head>
<body>
    <redoc spec-url='${specUrl}'></redoc>
    <script src="https://cdn.jsdelivr.net/npm/redoc@next/bundles/redoc.standalone.js"></script>
</body>
</html>`;
  }
}

export default SwaggerGenerator;
