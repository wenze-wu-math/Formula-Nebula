# Formula Nebula - Billing & Subscription System

Complete freemium SaaS tier management system with usage tracking, quota enforcement, and billing dashboard.

## Table of Contents

- [Overview](#overview)
- [Tier Structure](#tier-structure)
- [Installation](#installation)
- [API Reference](#api-reference)
- [Usage Examples](#usage-examples)
- [Dashboard Integration](#dashboard-integration)
- [Production Deployment](#production-deployment)

---

## Overview

The billing system provides a complete freemium SaaS solution with:

- **4 subscription tiers** (Free, Pro, Team, Enterprise)
- **Quota management** for storage, collections, API calls, and more
- **Usage tracking** with real-time monitoring
- **Billing dashboard** with upgrade flows
- **Feature gates** for tier-based access control

### Key Features

- ✅ Flexible tier definitions with customizable quotas
- ✅ Real-time usage tracking and limit enforcement
- ✅ Beautiful, responsive billing dashboard
- ✅ Automatic upgrade/downgrade workflows
- ✅ Warning system for approaching limits
- ✅ API rate limiting
- ✅ Feature-based access control

---

## Tier Structure

### Free Tier

**Price:** $0/month

**Quotas:**
- 1 GB storage
- 5 saved collections
- 100 formulas per collection
- 100 API calls per day
- No private collections
- Export formats: PNG, JSON

**Features:**
- Community access
- Public sharing
- Basic graph exploration

### Pro Tier

**Price:** $9.99/month

**Quotas:**
- Unlimited storage
- Unlimited collections
- Unlimited formulas per collection
- 10,000 API calls per day
- Unlimited private collections
- 3 collaborators
- Export formats: PNG, SVG, PDF, JSON, LaTeX

**Features:**
- Everything in Free
- Pro badge
- Advanced export formats
- Priority rendering
- Ad-free experience

### Team Tier

**Price:** $49/month (5 users)

**Quotas:**
- Unlimited storage
- Unlimited collections
- 50,000 API calls per day
- 5 team members
- SSO integration
- Custom branding
- Export formats: PNG, SVG, PDF, JSON, LaTeX, HTML

**Features:**
- Everything in Pro
- Team workspace
- Priority support
- Advanced collaboration
- Audit logs
- Custom domains

### Enterprise Tier

**Price:** Custom pricing

**Quotas:**
- Unlimited everything
- Unlimited team members
- Custom integrations

**Features:**
- Everything in Team
- On-premise deployment option
- Dedicated account manager
- SLA guarantees
- White-label options
- Priority feature requests

---

## Installation

### 1. Import the Billing Module

```javascript
import {
  GetTier,
  UpgradeTier,
  CalculateQuotas,
  CheckLimits,
  updateUsage,
  getUsageSummary
} from './src/billing/tiers.js';

import { initBillingDashboard } from './src/billing/dashboard.js';
```

### 2. Include Dashboard CSS

```html
<link rel="stylesheet" href="/src/billing/dashboard.css">
```

### 3. Create Dashboard Container

```html
<div id="billing-dashboard"></div>
```

---

## API Reference

### Core Functions

#### `GetTier(userId)`

Get the current tier for a user.

**Parameters:**
- `userId` (string) - User identifier

**Returns:** Tier object with quotas, features, and metadata

**Example:**
```javascript
const tier = GetTier('user_123');
console.log(tier.name); // "Free"
console.log(tier.quotas.storageBytes); // 1073741824 (1 GB)
```

---

#### `UpgradeTier(userId, tier, options)`

Upgrade or change a user's subscription tier.

**Parameters:**
- `userId` (string) - User identifier
- `tier` (string) - Target tier: 'free', 'pro', 'team', 'enterprise'
- `options` (object, optional):
  - `expiresAt` (string) - ISO date when subscription expires
  - `allowDowngrade` (boolean) - Allow tier downgrades
  - `paymentMethod` (string) - Payment method identifier
  - `customPricing` (number) - Custom price for enterprise

**Returns:** Upgrade result with success status

**Example:**
```javascript
const result = UpgradeTier('user_123', 'pro', {
  expiresAt: '2027-11-02T00:00:00Z',
  paymentMethod: 'stripe_pm_abc123'
});

if (result.success) {
  console.log('Upgraded to', result.newTier.name);
}
```

---

#### `CalculateQuotas(tier)`

Calculate quotas and limits for a specific tier.

**Parameters:**
- `tier` (string) - Tier type

**Returns:** Object with quotas, limits, features, and pricing

**Example:**
```javascript
const quotas = CalculateQuotas('pro');
console.log(quotas.quotas.storageBytes); // -1 (unlimited)
console.log(quotas.pricing.price); // 9.99
```

---

#### `CheckLimits(userId, resource, requested)`

Check if a user can perform an action based on tier limits.

**Parameters:**
- `userId` (string) - User identifier
- `resource` (string) - Resource type:
  - `'storage'` - Storage capacity
  - `'collections'` - Number of collections
  - `'privateCollections'` - Private collections
  - `'collaborators'` - Collaborators
  - `'apiCalls'` - API calls per day
  - `'fileUpload'` - File upload size
  - `'annotations'` - Annotations
  - `'sharedLinks'` - Shared links
- `requested` (number, optional) - Amount to check

**Returns:** Boolean indicating if action is allowed

**Example:**
```javascript
// Check if user can create another collection
if (CheckLimits('user_123', 'collections')) {
  createCollection();
} else {
  showUpgradePrompt();
}

// Check if file size is allowed
const fileSize = 50 * 1024 * 1024; // 50 MB
if (CheckLimits('user_123', 'fileUpload', fileSize)) {
  uploadFile();
}
```

---

#### `updateUsage(userId, resource, delta)`

Update usage statistics for a user.

**Parameters:**
- `userId` (string) - User identifier
- `resource` (string) - Resource type
- `delta` (number) - Change amount (positive or negative)

**Example:**
```javascript
// User created a collection
updateUsage('user_123', 'collections', 1);

// User uploaded 100 MB
updateUsage('user_123', 'storageUsed', 100 * 1024 * 1024);

// User deleted a collection
updateUsage('user_123', 'collections', -1);
```

---

#### `getUsageSummary(userId)`

Get comprehensive usage summary with percentages and warnings.

**Parameters:**
- `userId` (string) - User identifier

**Returns:** Usage summary object

**Example:**
```javascript
const summary = getUsageSummary('user_123');
console.log(summary.usage.storage.percentage); // 45.2
console.log(summary.warnings); // Array of warning objects
```

---

### Dashboard Functions

#### `initBillingDashboard(userId, container, options)`

Initialize the interactive billing dashboard.

**Parameters:**
- `userId` (string) - User identifier
- `container` (HTMLElement) - Container element
- `options` (object, optional):
  - `autoRefresh` (boolean) - Enable auto-refresh
  - `refreshInterval` (number) - Refresh interval in ms

**Returns:** Dashboard control object with methods

**Example:**
```javascript
const container = document.getElementById('billing-dashboard');
const dashboard = initBillingDashboard('user_123', container, {
  autoRefresh: true,
  refreshInterval: 30000 // 30 seconds
});

// Manually refresh
dashboard.refresh();

// Clean up
dashboard.destroy();
```

---

## Usage Examples

### Example 1: Create Collection with Tier Check

```javascript
async function createCollection(userId, collectionName, isPrivate = false) {
  // Check collection limit
  if (!CheckLimits(userId, 'collections')) {
    const tier = GetTier(userId);
    throw new Error(`Collection limit reached. Upgrade from ${tier.name}.`);
  }

  // Check private collection access
  if (isPrivate && !CheckLimits(userId, 'privateCollections')) {
    throw new Error('Private collections require Pro tier or higher.');
  }

  // Create collection
  const collection = await db.collections.create({
    userId,
    name: collectionName,
    private: isPrivate
  });

  // Update usage
  updateUsage(userId, 'collections', 1);
  if (isPrivate) {
    updateUsage(userId, 'privateCollections', 1);
  }

  return collection;
}
```

### Example 2: File Upload with Size Check

```javascript
async function uploadFile(userId, file) {
  // Check file size limit
  if (!CheckLimits(userId, 'fileUpload', file.size)) {
    const tier = GetTier(userId);
    const maxSize = tier.limits.maxFileUploadSize;
    throw new Error(
      `File too large. Max size: ${(maxSize / 1024 / 1024).toFixed(0)} MB`
    );
  }

  // Check storage capacity
  const usage = getUserUsage(userId);
  if (!CheckLimits(userId, 'storage', usage.storageUsed + file.size)) {
    throw new Error('Storage quota exceeded. Delete files or upgrade.');
  }

  // Upload file
  const uploadedFile = await storage.upload(file);

  // Update storage usage
  updateUsage(userId, 'storageUsed', file.size);

  return uploadedFile;
}
```

### Example 3: API Rate Limiting Middleware

```javascript
function apiRateLimitMiddleware(req, res, next) {
  const userId = req.user.id;

  if (!CheckLimits(userId, 'apiCalls')) {
    const tier = GetTier(userId);
    const limit = tier.quotas.apiCallsPerDay;

    return res.status(429).json({
      error: 'API rate limit exceeded',
      limit: limit,
      resetTime: getNextResetTime()
    });
  }

  // Increment API call counter
  updateUsage(userId, 'apiCallsToday', 1);

  next();
}

app.use('/api', apiRateLimitMiddleware);
```

### Example 4: Feature Gate Component

```javascript
function FeatureGate({ userId, feature, children, fallback }) {
  const tier = GetTier(userId);

  const hasAccess = (() => {
    switch (feature) {
      case 'privateCollections':
        return tier.quotas.privateCollections !== 0;
      case 'sso':
        return tier.quotas.sso;
      case 'customBranding':
        return tier.quotas.customBranding;
      default:
        return true;
    }
  })();

  if (hasAccess) {
    return children;
  }

  return fallback || (
    <UpgradePrompt feature={feature} currentTier={tier.name} />
  );
}

// Usage
<FeatureGate userId={userId} feature="privateCollections">
  <PrivateCollectionSettings />
</FeatureGate>
```

---

## Dashboard Integration

### Basic Setup

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="/src/billing/dashboard.css">
</head>
<body>
  <div id="billing-dashboard"></div>

  <script type="module">
    import { initBillingDashboard } from './src/billing/dashboard.js';

    const userId = getCurrentUserId();
    const container = document.getElementById('billing-dashboard');

    initBillingDashboard(userId, container, {
      autoRefresh: true,
      refreshInterval: 30000
    });
  </script>
</body>
</html>
```

### React Integration

```jsx
import { useEffect, useRef } from 'react';
import { initBillingDashboard } from './src/billing/dashboard.js';
import './src/billing/dashboard.css';

function BillingDashboard({ userId }) {
  const containerRef = useRef(null);
  const dashboardRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      dashboardRef.current = initBillingDashboard(
        userId,
        containerRef.current,
        { autoRefresh: true }
      );
    }

    return () => {
      dashboardRef.current?.destroy();
    };
  }, [userId]);

  return <div ref={containerRef} />;
}
```

---

## Production Deployment

### 1. Replace In-Memory Storage

The current implementation uses in-memory `Map` objects. For production, replace with a database:

```javascript
// Before (development)
const userTiers = new Map();

// After (production)
async function getUserTier(userId) {
  return await db.users.findOne({ id: userId }).select('tier');
}

async function setUserTier(userId, tier) {
  return await db.users.updateOne(
    { id: userId },
    { $set: { tier, updatedAt: new Date() } }
  );
}
```

### 2. Integrate Payment Processing

Add Stripe or another payment processor:

```javascript
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function processTierUpgrade(userId, tier) {
  const tierDef = TIER_DEFINITIONS[tier];

  // Create subscription
  const subscription = await stripe.subscriptions.create({
    customer: user.stripeCustomerId,
    items: [{ price: tierDef.stripePriceId }],
    metadata: { userId, tier }
  });

  // Update user tier
  await UpgradeTier(userId, tier, {
    expiresAt: new Date(subscription.current_period_end * 1000).toISOString(),
    paymentMethod: subscription.default_payment_method
  });

  return subscription;
}
```

### 3. Add Webhook Handlers

Handle subscription events:

```javascript
app.post('/webhooks/stripe', async (req, res) => {
  const event = stripe.webhooks.constructEvent(
    req.body,
    req.headers['stripe-signature'],
    process.env.STRIPE_WEBHOOK_SECRET
  );

  switch (event.type) {
    case 'customer.subscription.updated':
      await handleSubscriptionUpdate(event.data.object);
      break;
    case 'customer.subscription.deleted':
      await handleSubscriptionCancellation(event.data.object);
      break;
    case 'invoice.payment_failed':
      await handlePaymentFailure(event.data.object);
      break;
  }

  res.json({ received: true });
});
```

### 4. Schedule Daily Reset Jobs

Reset daily counters (e.g., API calls):

```javascript
// Using node-cron or similar
cron.schedule('0 0 * * *', async () => {
  const users = await db.users.find({});

  for (const user of users) {
    await resetUsageCounters(user.id);
  }

  console.log('Daily usage counters reset');
});
```

### 5. Add Usage Monitoring

Track usage across your application:

```javascript
// Middleware to track all operations
app.use((req, res, next) => {
  res.on('finish', () => {
    if (req.user && req.path.startsWith('/api/')) {
      updateUsage(req.user.id, 'apiCallsToday', 1);
    }
  });
  next();
});

// Storage tracking
storage.on('upload', (userId, fileSize) => {
  updateUsage(userId, 'storageUsed', fileSize);
});

storage.on('delete', (userId, fileSize) => {
  updateUsage(userId, 'storageUsed', -fileSize);
});
```

---

## Testing

Run the example suite to test functionality:

```javascript
import { runAllExamples } from './src/billing/example.js';

runAllExamples();
```

---

## License

Part of Formula Nebula. See main project LICENSE.

---

## Support

For questions or issues, contact the Formula Nebula team or open an issue on GitHub.
