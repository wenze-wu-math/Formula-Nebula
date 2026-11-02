# Payment Integration - Quick Reference Card

## 🚀 Quick Start (5 minutes)

```bash
# 1. Install dependencies
npm install

# 2. Get Stripe keys from https://dashboard.stripe.com/test/apikeys
# Add to .env:
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# 3. Start billing server
npm run billing:server

# 4. Open billing portal
open http://localhost:3001/billing/portal.html

# 5. Test webhooks (separate terminal)
stripe listen --forward-to localhost:3001/webhooks/stripe
```

## 📁 File Locations

```
src/
├── payments/
│   ├── stripe.js           ← Main Stripe wrapper
│   ├── webhooks.mjs        ← Webhook handler
│   └── stripe.test.js      ← Tests
└── billing/
    ├── invoices.js         ← Invoice generation
    ├── portal.html         ← Customer portal UI
    ├── portal.js           ← Portal logic
    ├── api-routes.js       ← REST API
    └── server.js           ← Express server
```

## 💳 Test Cards

```
Success:      4242 4242 4242 4242
Declined:     4000 0000 0000 0002
Insufficient: 4000 0000 0000 9995
3D Secure:    4000 0025 0000 3155

Exp: 12/34 | CVC: 123 | ZIP: 12345
```

## 🔌 Common API Calls

### Get Subscription
```javascript
import { SubscriptionManager } from './src/payments/stripe.js';

const result = await SubscriptionManager.listSubscriptions(customerId);
```

### Create Subscription
```javascript
const result = await SubscriptionManager.createSubscription({
  customerId: 'cus_xxx',
  priceId: 'price_xxx',
  paymentMethodId: 'pm_xxx'
});
```

### Cancel Subscription
```javascript
const result = await SubscriptionManager.cancelSubscription(
  subscriptionId,
  { immediately: false }
);
```

### Get Invoices
```javascript
import { InvoiceService } from './src/billing/invoices.js';

const result = await InvoiceService.getCustomerInvoices(customerId);
```

## 🌐 API Endpoints

```
POST   /api/billing/subscription/create
POST   /api/billing/subscription/change
POST   /api/billing/subscription/cancel
GET    /api/billing/invoices
GET    /api/billing/payment-methods
POST   /api/billing/portal-session
POST   /webhooks/stripe
```

## 🎯 Subscription Plans

| Plan | Price | API ID |
|------|-------|--------|
| Free | $0 | `free` |
| Basic | $9.99 | `price_basic_monthly` |
| Pro | $29.99 | `price_pro_monthly` |
| Enterprise | $99.99 | `price_enterprise_monthly` |

## 🔔 Webhook Events

```javascript
// Handled events:
- checkout.session.completed
- customer.subscription.created
- customer.subscription.updated
- customer.subscription.deleted
- invoice.paid
- invoice.payment_failed
- payment_intent.succeeded
- payment_intent.payment_failed
- charge.refunded
```

## 🧪 Testing

```bash
# Run test suite
npm run billing:test

# Trigger webhook events
stripe trigger payment_intent.succeeded
stripe trigger invoice.payment_failed

# Test API endpoint
curl http://localhost:3001/api/billing/plans
```

## 🐛 Debugging

```javascript
// Enable Stripe logging
import Stripe from 'stripe';
const stripe = new Stripe(key, { typescript: true });

stripe.on('request', req => console.log('[Stripe]', req));
```

## ⚠️ Common Issues

### Webhook Signature Failed
```javascript
// ✅ Correct
app.post('/webhooks/stripe', 
  express.raw({ type: 'application/json' }),
  webhookHandler
);

// ❌ Wrong (don't parse before verification)
app.use(express.json());
app.post('/webhooks/stripe', webhookHandler);
```

### Payment Declined
- Check test card number
- Verify expiry date is future
- Try different test card for scenario

### Customer Not Found
```javascript
// Create customer first
const result = await CustomerManager.createCustomer({
  email: 'user@example.com',
  userId: 'user_123'
});
```

## 📊 Database Tables

```sql
-- Users
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255),
  stripe_customer_id VARCHAR(255)
);

-- Subscriptions
CREATE TABLE subscriptions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  stripe_subscription_id VARCHAR(255),
  status VARCHAR(50)
);

-- Invoices
CREATE TABLE invoices (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  stripe_invoice_id VARCHAR(255),
  amount DECIMAL(10, 2)
);
```

## 🔐 Security Checklist

- [ ] HTTPS in production
- [ ] Webhook signature verification enabled
- [ ] API keys in environment variables (not code)
- [ ] Authentication on all endpoints
- [ ] Rate limiting configured
- [ ] Stripe Radar enabled

## 📚 Documentation

- **Setup Guide**: `STRIPE_SETUP_GUIDE.md`
- **Summary**: `PAYMENT_INTEGRATION_SUMMARY.md`
- **Stripe Docs**: https://stripe.com/docs
- **API Reference**: https://stripe.com/docs/api

## 🆘 Support

### Stripe Issues
- Dashboard: https://dashboard.stripe.com
- Support: https://support.stripe.com
- Status: https://status.stripe.com

### Formula Nebula Issues
- Check server logs
- Review test suite
- See documentation files

## 💡 Pro Tips

1. **Always use test mode** during development
2. **Test webhook delivery** with Stripe CLI
3. **Monitor failed payments** in dashboard
4. **Keep SDK updated**: `npm update stripe`
5. **Review logs** for debugging
6. **Test edge cases** (zero-dollar, prorations)

## 🔄 Common Workflows

### New User Subscribes
```
1. Create customer → 2. Attach payment method 
→ 3. Create subscription → 4. Confirm payment
→ 5. Grant access
```

### User Upgrades Plan
```
1. Get current subscription → 2. Update with new price
→ 3. Calculate proration → 4. Charge difference
→ 5. Update access
```

### Payment Fails
```
1. Webhook received → 2. Send notification
→ 3. Retry (3, 7, 14 days) → 4. Grace period
→ 5. Downgrade/cancel
```

## 🎨 Frontend Integration

```html
<!-- Include Stripe.js -->
<script src="https://js.stripe.com/v3/"></script>

<script>
const stripe = Stripe('pk_test_...');
const elements = stripe.elements();
const cardElement = elements.create('card');
cardElement.mount('#card-element');

// Create payment method
const {paymentMethod, error} = await stripe.createPaymentMethod({
  type: 'card',
  card: cardElement
});

// Send to backend
await fetch('/api/billing/subscription/create', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    priceId: 'price_xxx',
    paymentMethodId: paymentMethod.id
  })
});
</script>
```

## 📈 Monitoring

```javascript
// Key metrics to track
- Monthly Recurring Revenue (MRR)
- Churn rate
- Payment success rate
- Failed payment recovery rate
- Webhook delivery rate
- API response times
```

---

**Quick Commands:**

```bash
npm run billing:server    # Start server
npm run billing:test      # Run tests
stripe login              # Authenticate CLI
stripe listen             # Forward webhooks
stripe trigger <event>    # Test webhook
```

**Environment Setup:**

```bash
# .env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
BILLING_PORT=3001
```

---

*Keep this card handy for quick reference during development!*
