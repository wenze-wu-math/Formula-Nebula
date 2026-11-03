/**
 * Formula Nebula API Documentation
 * Complete API documentation system with Swagger, examples, and testing
 */

export { SwaggerGenerator } from './swagger-generator.js';
export { EnhancedDocumentationGenerator } from './enhanced-documentation.js';
export { TestEndpoints } from './test-endpoints.js';
export {
  setupApiDocumentation,
  createDocumentationServer
} from './documentation-server.js';

// Re-export for convenience
import {
  setupApiDocumentation,
  createDocumentationServer,
  SwaggerGenerator,
  EnhancedDocumentationGenerator,
  TestEndpoints
} from './documentation-server.js';

export default {
  setupApiDocumentation,
  createDocumentationServer,
  SwaggerGenerator,
  EnhancedDocumentationGenerator,
  TestEndpoints
};
