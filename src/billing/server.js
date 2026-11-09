/**
 * Billing Server
 *
 * Express server for payment processing and billing management
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { setupWebhooks } from '../payments/webhooks.mjs';
import billingRoutes from './api-routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.BILLING_PORT || 3001;

// IMPORTANT: Setup webhooks BEFORE express.json()
// Webhooks need raw body for signature verification
setupWebhooks(app);

// Parse JSON for other routes
app.use(express.json());

// CORS middleware
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
});

// Mock authentication middleware (replace with actual auth)
app.use((req, res, next) => {
  // In production, verify JWT token or session
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);

    // Mock user for testing
    req.user = {
      id: 'user_123',
      email: 'test@formulanebula.com',
      username: 'testuser',
      stripeCustomerId: null, // Will be created on first billing action
      isAdmin: false
    };
  }

  next();
});

// API routes
app.use('/api/billing', billingRoutes);

// Serve billing portal static files
app.use('/billing', express.static(__dirname));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'Formula Nebula Billing',
    timestamp: new Date().toISOString(),
    stripe: {
      configured: !!process.env.STRIPE_SECRET_KEY,
      mode: process.env.STRIPE_SECRET_KEY?.startsWith('sk_test') ? 'test' : 'live'
    }
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'Formula Nebula Billing API',
    version: '1.0.0',
    endpoints: {
      billing: '/api/billing',
      webhooks: '/webhooks/stripe',
      portal: '/billing/portal.html',
      health: '/health'
    },
    documentation: '/docs'
  });
});

// Error handling middleware
app.use((err, req, res, _next) => {
  console.error('Error:', err);

  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    path: req.path
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║         Formula Nebula - Billing Server                  ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝

🚀 Server running on port ${PORT}
🌐 Environment: ${process.env.NODE_ENV || 'development'}
💳 Stripe Mode: ${process.env.STRIPE_SECRET_KEY?.startsWith('sk_test') ? 'TEST' : 'LIVE'}

📍 Endpoints:
   - API:      http://localhost:${PORT}/api/billing
   - Webhooks: http://localhost:${PORT}/webhooks/stripe
   - Portal:   http://localhost:${PORT}/billing/portal.html
   - Health:   http://localhost:${PORT}/health

📚 Documentation: ${process.env.APP_URL || `http://localhost:${PORT}`}/docs
`);
});

export default app;
