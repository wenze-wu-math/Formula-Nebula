# Stripe Payment Integration - Setup Guide

## Table of Contents
1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Stripe Account Setup](#stripe-account-setup)
4. [Test Account Configuration](#test-account-configuration)
5. [Integration Setup](#integration-setup)
6. [Testing Payment Flows](#testing-payment-flows)
7. [Webhook Configuration](#webhook-configuration)
8. [Production Deployment](#production-deployment)
9. [Troubleshooting](#troubleshooting)

---

## Overview

Formula Nebula's payment integration provides:
- ✅ Subscription management (Free, Basic, Pro, Enterprise)
- ✅ Invoice generation and delivery
- ✅ Payment webhook handling
- ✅ Dunning management for failed payments
- ✅ Refund processing
- ✅ Self-service billing portal

## Prerequisites

1. **Node.js** (v16 or higher)
2. **Stripe Account** (create at [stripe.com](https://stripe.com))
3. **Express.js** server running
4. **PostgreSQL** or MongoDB (for user/subscription storage)

## Stripe Account Setup

### Step 1: Create Stripe Account

1. Go to [https://dashboard.stripe.com/register](https://dashboard.stripe.com/register)
2. Sign up with your email
3. Complete account verification
4. Navigate to **Developers > API Keys**

### Step 2: Get API Keys

You'll need two sets of keys:

#### Test Mode Keys (for development)
```bash
# .env file
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

#### Live Mode Keys (for production)
```bash
# .env.production file
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Step 3: Create Products and Prices

Navigate to **Products** in the Stripe Dashboard:

#### Free Plan
- **Name**: Formula Nebula - Free
- **Price**: $0.00
- **Recurring**: No subscription required
- **Price ID**: (Not needed - free tier)

#### Basic Plan
- **Name**: Formula Nebula - Basic
- **Price**: $9.99 USD
- **Recurring**: Monthly
- **Price ID**: `price_basic_monthly` (copy this)

#### Pro Plan
- **Name**: Formula Nebula - Pro
- **Price**: $29.99 USD
- **Recurring**: Monthly
- **Price ID**: `price_pro_monthly` (copy this)

#### Enterprise Plan
- **Name**: Formula Nebula - Enterprise
- **Price**: $99.99 USD
- **Recurring**: Monthly
- **Price ID**: `price_enterprise_monthly` (copy this)

**Update `src/payments/stripe.js`** with your actual Price IDs:

```javascript
export const SUBSCRIPTION_PLANS = {
  BASIC: {
    id: 'price_YOUR_ACTUAL_BASIC_PRICE_ID',
    // ...
  },
  PRO: {
    id: 'price_YOUR_ACTUAL_PRO_PRICE_ID',
    // ...
  },
  ENTERPRISE: {
    id: 'price_YOUR_ACTUAL_ENTERPRISE_PRICE_ID',
    // ...
  }
};
```

## Test Account Configuration

### Test Credit Card Numbers

Stripe provides test cards that simulate different scenarios:

#### Success Cases
```
Card Number: 4242 4242 4242 4242
Expiry: Any future date (e.g., 12/34)
CVC: Any 3 digits (e.g., 123)
ZIP: Any 5 digits (e.g., 12345)
```

#### Declined Payment
```
Card Number: 4000 0000 0000 0002
Result: Generic decline
```

#### Insufficient Funds
```
Card Number: 4000 0000 0000 9995
Result: Insufficient funds decline
```

#### Requires Authentication (3D Secure)
```
Card Number: 4000 0025 0000 3155
Result: Triggers 3D Secure authentication
```

#### Failed 3D Secure
```
Card Number: 4000 0000 0000 9979
Result: 3D Secure authentication fails
```

### Test Webhook Events

Use Stripe CLI to test webhooks locally:

```bash
# Install Stripe CLI
npm install -g stripe

# Login to your Stripe account
stripe login

# Forward webhooks to your local server
stripe listen --forward-to localhost:3000/webhooks/stripe

# Trigger test events
stripe trigger payment_intent.succeeded
stripe trigger customer.subscription.created
stripe trigger invoice.payment_failed
```

## Integration Setup

### Step 1: Install Dependencies

```bash
npm install stripe express
```

### Step 2: Configure Environment Variables

Create `.env` file:

```bash
# Application
NODE_ENV=development
APP_URL=http://localhost:3000
APP_PORT=3000

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_51234567890abcdef
STRIPE_PUBLISHABLE_KEY=pk_test_51234567890abcdef
STRIPE_WEBHOOK_SECRET=whsec_1234567890abcdef

# Database
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=formula_nebula
POSTGRES_USER=your_user
POSTGRES_PASSWORD=your_password
```

### Step 3: Setup Express Server

Create `server.js`:

```javascript
import express from 'express';
import { setupWebhooks } from './src/payments/webhooks.mjs';
import billingRoutes from './src/billing/api-routes.js';

const app = express();

// Important: Webhooks need raw body for signature verification
setupWebhooks(app);

// Parse JSON for other routes
app.use(express.json());

// Mount billing routes
app.use('/api/billing', billingRoutes);

// Serve billing portal
app.use('/billing', express.static('src/billing'));

const PORT = process.env.APP_PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### Step 4: Database Schema

Create tables for user and subscription management:

```sql
-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(100) UNIQUE NOT NULL,
  stripe_customer_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Subscriptions table
CREATE TABLE subscriptions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  stripe_subscription_id VARCHAR(255) UNIQUE,
  stripe_customer_id VARCHAR(255),
  plan_id VARCHAR(100),
  status VARCHAR(50),
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  cancelled_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Invoices table
CREATE TABLE invoices (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  stripe_invoice_id VARCHAR(255) UNIQUE,
  amount DECIMAL(10, 2),
  currency VARCHAR(3),
  status VARCHAR(50),
  paid_at TIMESTAMP,
  invoice_url TEXT,
  pdf_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Failed payments table (for dunning)
CREATE TABLE failed_payments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  stripe_invoice_id VARCHAR(255),
  amount DECIMAL(10, 2),
  attempt_count INTEGER DEFAULT 1,
  failed_at TIMESTAMP DEFAULT NOW()
);
```

## Testing Payment Flows

### 1. Test Subscription Creation

```bash
curl -X POST http://localhost:3000/api/billing/subscription/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_USER_TOKEN" \
  -d '{
    "priceId": "price_basic_monthly",
    "paymentMethodId": "pm_test_card_visa"
  }'
```

### 2. Test Plan Upgrade

```bash
curl -X POST http://localhost:3000/api/billing/subscription/change \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_USER_TOKEN" \
  -d '{
    "planId": "pro"
  }'
```

### 3. Test Subscription Cancellation

```bash
curl -X POST http://localhost:3000/api/billing/subscription/cancel \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_USER_TOKEN" \
  -d '{
    "immediately": false
  }'
```

### 4. Test Invoice Retrieval

```bash
curl http://localhost:3000/api/billing/invoices \
  -H "Authorization: Bearer YOUR_USER_TOKEN"
```

### 5. Test Billing Portal

```bash
curl -X POST http://localhost:3000/api/billing/portal-session \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_USER_TOKEN" \
  -d '{
    "returnUrl": "http://localhost:3000/billing"
  }'
```

## Webhook Configuration

### Step 1: Register Webhook Endpoint

In Stripe Dashboard:
1. Go to **Developers > Webhooks**
2. Click **Add endpoint**
3. Enter your URL: `https://yourdomain.com/webhooks/stripe`
4. Select events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `invoice.payment_failed`
   - `invoice.finalized`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `customer.deleted`
   - `charge.refunded`

### Step 2: Save Webhook Secret

Copy the webhook signing secret and add to `.env`:

```bash
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

### Step 3: Test Webhooks

```bash
# Using Stripe CLI
stripe trigger customer.subscription.created

# Or send test webhook from dashboard
# Dashboard > Webhooks > Select endpoint > Send test webhook
```

### Step 4: Monitor Webhook Logs

Check webhook delivery status in:
- Stripe Dashboard > Developers > Webhooks > [Your endpoint]
- View request/response logs
- Retry failed webhooks

## Production Deployment

### Pre-Deployment Checklist

- [ ] Switch to Live API keys
- [ ] Update webhook endpoint URL
- [ ] Configure production database
- [ ] Set up SSL certificate (HTTPS required)
- [ ] Enable Stripe Radar for fraud detection
- [ ] Configure billing portal settings
- [ ] Set up email notifications
- [ ] Test all payment flows
- [ ] Review subscription plans and pricing
- [ ] Configure dunning settings
- [ ] Set up monitoring and alerts

### Environment Variables (Production)

```bash
NODE_ENV=production
APP_URL=https://formulanebula.com
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_live_...
```

### Stripe Radar Configuration

1. Go to **Radar** in Stripe Dashboard
2. Review default rules
3. Add custom rules for your use case:
   - Block high-risk cards
   - Require 3D Secure for amounts > $100
   - Review suspicious patterns

### Billing Portal Configuration

1. Go to **Settings > Billing**
2. Configure:
   - Allow customers to update payment methods
   - Allow customers to cancel subscriptions
   - Set cancellation policy
   - Customize portal appearance
   - Add terms of service URL

## Troubleshooting

### Common Issues

#### 1. Webhook Signature Verification Failed

**Problem**: `Webhook Error: No signatures found matching the expected signature`

**Solution**:
- Ensure you're using the correct webhook secret
- Check that raw body is being passed to webhook handler
- Verify webhook secret matches the endpoint

```javascript
// Correct setup
app.post('/webhooks/stripe',
  express.raw({ type: 'application/json' }),
  webhookHandler
);

// Incorrect setup (don't parse JSON before verification)
app.use(express.json()); // ❌ This breaks signature verification
app.post('/webhooks/stripe', webhookHandler);
```

#### 2. Payment Method Declined

**Problem**: Test card being declined

**Solution**:
- Use correct test card numbers (see Test Account Configuration)
- Check card expiry is in the future
- Verify CVC is 3 digits
- Try different test card for specific scenario

#### 3. Subscription Not Creating

**Problem**: Subscription creation fails

**Solution**:
- Verify Price ID is correct
- Ensure payment method is attached to customer
- Check customer has valid default payment method
- Review Stripe Dashboard logs

#### 4. Webhooks Not Received

**Problem**: Webhook events not triggering

**Solution**:
- Check webhook endpoint is publicly accessible (use ngrok for local testing)
- Verify webhook URL in Stripe Dashboard
- Check server logs for incoming requests
- Use Stripe CLI for local testing

```bash
# Test locally with Stripe CLI
stripe listen --forward-to localhost:3000/webhooks/stripe
```

#### 5. Invoice Not Generated

**Problem**: No invoice created after subscription

**Solution**:
- Check subscription status
- Verify billing cycle anchor
- Review webhook logs for `invoice.created` event
- Check invoice settings in subscription

### Debug Mode

Enable debug logging:

```javascript
// In stripe.js
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-11-20.acacia',
  maxNetworkRetries: 3,
  timeout: 10000,
  telemetry: false,
  // Add for debugging
  typescript: true
});

// Enable Stripe request logging
stripe.on('request', (request) => {
  console.log('[Stripe Request]', request);
});

stripe.on('response', (response) => {
  console.log('[Stripe Response]', response);
});
```

### Support Resources

- **Stripe Documentation**: https://stripe.com/docs
- **Stripe Support**: https://support.stripe.com
- **API Reference**: https://stripe.com/docs/api
- **Webhook Guide**: https://stripe.com/docs/webhooks
- **Test Cards**: https://stripe.com/docs/testing

---

## Quick Start Summary

```bash
# 1. Install dependencies
npm install stripe express

# 2. Configure environment
cp .env.example .env
# Edit .env with your Stripe keys

# 3. Start server
node server.js

# 4. Test webhook locally
stripe listen --forward-to localhost:3000/webhooks/stripe

# 5. Open billing portal
open http://localhost:3000/billing/portal.html
```

## Next Steps

1. ✅ Create Stripe account and get API keys
2. ✅ Configure products and prices
3. ✅ Set up webhook endpoint
4. ✅ Test payment flows with test cards
5. ✅ Integrate billing portal into main app
6. ✅ Configure dunning management
7. ✅ Set up production environment
8. ✅ Enable Stripe Radar
9. ✅ Launch! 🚀

---

**Need Help?** Contact the development team or consult the [Stripe Discord Community](https://discord.gg/stripe).
