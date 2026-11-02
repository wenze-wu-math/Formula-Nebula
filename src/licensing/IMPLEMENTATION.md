# Enterprise Licensing System - Implementation Guide

## Overview

Complete enterprise licensing system for Formula Nebula with per-seat licensing, usage reporting, offline mode support, and SSO/SAML integration.

## 📁 File Structure

```
src/licensing/
├── LicenseKey.js              # License validation & seat management
├── UsageReporter.js           # Usage tracking & analytics
├── OfflineMode.js             # Offline support & sync queue
├── SSOIntegration.js          # SAML/OAuth authentication
├── EnterpriseLicensing.js     # Main orchestrator
├── index.js                   # Module exports
├── license-generator.js       # Server-side license generation (Node.js)
├── demo.html                  # Interactive demo
├── tests.html                 # Test suite
├── README.md                  # API documentation
└── IMPLEMENTATION.md          # This file
```

## ✨ Features Implemented

### 1. Per-Seat Licensing ✓
- Concurrent user seat tracking
- Automatic seat allocation/deallocation
- Seat limit enforcement
- Real-time seat availability checking
- Seat utilization reporting

### 2. License Key Validation ✓
- RSA-2048 signature verification
- Offline license caching (1-hour TTL)
- License expiration checking
- Feature flag validation
- Grace period support (7 days)
- Secure browser-compatible crypto

### 3. Usage Reporting ✓
- Session tracking (start/end)
- Feature usage metrics
- Performance monitoring
- Error tracking
- Batched API reporting (configurable batch size)
- Offline queue (1000 events max)
- Auto-flush (60s interval)
- Retry logic (3 attempts)

### 4. Offline Mode Support ✓
- Offline license validation
- Sync queue management
- Network status monitoring
- Heartbeat connectivity checks (30s interval)
- Grace period enforcement
- Maximum offline duration (30 days)
- Automatic sync when reconnected

### 5. SSO/SAML Integration ✓
- SAML 2.0 authentication flow
- OAuth 2.0 / OpenID Connect support
- JWT token management
- Automatic token refresh (5min before expiry)
- Role-based access control (RBAC)
- Permission checking
- Multi-tenant support

## 🚀 Quick Start

### Step 1: Generate RSA Keys (Server-Side)

```bash
node src/licensing/license-generator.js --generateKeys true
```

This creates `private.pem` and `public.pem` files.

### Step 2: Generate License

```bash
node src/licensing/license-generator.js \
  --customer "Acme Corporation" \
  --seats 100 \
  --type enterprise \
  --duration 365
```

Output: License key in `license.json`

### Step 3: Initialize in Application

```javascript
import { enterpriseLicensing } from './licensing/index.js';

// Configure
const config = {
    publicKey: `-----BEGIN PUBLIC KEY-----
    ... your public key ...
    -----END PUBLIC KEY-----`,
    apiEndpoint: '/api/licensing',
    enableSSO: true,
    enableUsageReporting: true,
    enableOfflineMode: true
};

Object.assign(enterpriseLicensing.config, config);

// Initialize
const result = await enterpriseLicensing.initialize();
if (result.success) {
    console.log('License:', result.license);
} else {
    console.error('Error:', result.error);
}
```

### Step 4: Start User Session

```javascript
// Start session
const session = await enterpriseLicensing.startSession('user-123', {
    email: 'user@example.com',
    name: 'John Doe',
    role: 'analyst'
});

if (session.success) {
    console.log('Session ID:', session.sessionId);
    console.log('Seats:', session.seatInfo);
}
```

### Step 5: Track Feature Usage

```javascript
// Check feature availability
if (enterpriseLicensing.isFeatureAvailable('advanced_visualization')) {
    // Use feature
    createVisualization();

    // Track usage
    enterpriseLicensing.trackFeatureUsage(
        'user-123',
        'advanced_visualization',
        { action: 'create', nodes: 100 }
    );
}
```

## 🔐 Security Features

### License Signing
- RSA-2048 with SHA-256
- Server-side private key (never exposed)
- Client-side public key validation
- Tamper-proof license encoding

### Token Security
- Access tokens: 1-hour expiry
- Refresh tokens: 30-day expiry
- Automatic rotation
- SessionStorage (cleared on close)

### Offline Security
- Cached licenses: 1-hour validity
- Signature verification on load
- Grace period: 7 days post-expiration
- Max offline: 30 days

## 📊 License Types

| Type         | Seats | Features | Duration | Price Point |
|--------------|-------|----------|----------|-------------|
| Trial        | 1-5   | Basic    | 30 days  | Free        |
| Standard     | 1-10  | Standard | 1 year   | $$$         |
| Professional | 1-50  | Advanced | 1 year   | $$$$        |
| Enterprise   | Unlimited | All  | 1 year   | $$$$$       |

## 🎯 Feature Flags

Available features:
- `basic_visualization` - Standard 2D/3D graphs
- `advanced_visualization` - Custom layouts, animations
- `collaboration` - Real-time sync, comments
- `offline_mode` - Offline validation & sync
- `sso_integration` - SAML/OAuth
- `usage_analytics` - Advanced reporting
- `api_access` - REST API
- `custom_branding` - White-label
- `priority_support` - 24/7 support

## 📡 API Integration

### Backend Endpoints Required

```javascript
// License validation
GET  /api/licensing/validate
Response: { licenseKey: "..." }

// Usage reporting
POST /api/usage/report
Body: { sessionId, events, reportedAt }

// Offline sync
POST /api/sync
Body: { id, type, data, queuedAt }

// SAML authentication
POST /api/auth/saml
Body: { tenantId, redirectUri }

POST /api/auth/saml/callback
Body: { samlResponse, relayState }

// OAuth authentication
GET  /api/auth/oauth/{provider}
POST /api/auth/token
POST /api/auth/token/refresh
POST /api/auth/logout

// Health check
HEAD /api/health
```

## 🧪 Testing

### Run Test Suite

Open `src/licensing/tests.html` in browser and click "Run All Tests".

Tests cover:
- License validation
- Seat management
- Usage tracking
- Offline mode
- SSO integration
- Enterprise orchestration

### Manual Testing

Open `src/licensing/demo.html` for interactive demo with:
- License initialization
- Session management
- Feature tracking
- Offline sync
- Real-time status monitoring

## 📈 Usage Examples

### Example 1: Complete Integration

```javascript
class Application {
    async start() {
        // Initialize licensing
        const licensing = enterpriseLicensing;
        await licensing.initialize();

        // Authenticate with SSO
        await licensing.authenticateWithSSO('azure');

        // Start session
        const user = await this.getCurrentUser();
        await licensing.startSession(user.id, user);

        // Monitor features
        this.monitorFeatureUsage(licensing);

        // Cleanup on exit
        window.addEventListener('beforeunload', () => {
            licensing.endSession(user.id);
        });
    }

    monitorFeatureUsage(licensing) {
        document.addEventListener('feature:used', (e) => {
            const user = this.getCurrentUser();
            licensing.trackFeatureUsage(
                user.id,
                e.detail.feature,
                e.detail.metadata
            );
        });
    }
}
```

### Example 2: Offline Support

```javascript
// Monitor offline status
setInterval(() => {
    const status = enterpriseLicensing.getOfflineStatus();

    if (status.isOffline) {
        showOfflineIndicator();

        const hours = status.offlineDuration / (1000 * 60 * 60);
        if (hours > 24) {
            showOfflineWarning(`Offline for ${Math.round(hours)} hours`);
        }
    } else {
        hideOfflineIndicator();
        // Auto-sync when back online
        enterpriseLicensing.syncOfflineData();
    }
}, 60000); // Check every minute
```

### Example 3: Seat Management

```javascript
// Pre-flight seat check before login
async function canUserLogin(userId) {
    const licenseInfo = enterpriseLicensing.getLicenseInfo();
    const seatInfo = licenseInfo.seatInfo;

    if (seatInfo.available === 0) {
        showError(`No seats available. ${seatInfo.used}/${seatInfo.total} in use.`);
        return false;
    }

    if (seatInfo.available <= 2) {
        showWarning(`Only ${seatInfo.available} seats remaining.`);
    }

    return true;
}

// Inactive session cleanup
setInterval(() => {
    enterpriseLicensing.cleanupInactiveSessions(3600000); // 1 hour
}, 300000); // Check every 5 minutes
```

## 🐛 Troubleshooting

### License Won't Validate
1. Check public key format (PEM)
2. Verify license hasn't expired
3. Check browser console for signature errors
4. Ensure license was generated with matching private key

### No Available Seats
1. Check active sessions: `licensing.getActiveSessions()`
2. Clean up inactive sessions: `licensing.cleanupInactiveSessions()`
3. End sessions manually: `licensing.endSession(userId)`

### Offline Mode Issues
1. Verify `offline_mode` feature in license
2. Check offline duration: `getOfflineStatus()`
3. Clear offline cache: `offlineModeManager.clearOfflineData()`
4. Sync manually: `syncOfflineData()`

### Usage Not Reporting
1. Check `enableUsageReporting` config
2. Verify API endpoint accessibility
3. Check offline queue: `usageReporter.getStatistics()`
4. Monitor network tab for failed requests

## 🔄 Migration from Previous System

If migrating from an existing license system:

1. Export existing licenses
2. Generate new RSA keys
3. Re-sign licenses with new system
4. Deploy public key to clients
5. Update API endpoints
6. Test in staging environment
7. Gradual rollout to production

## 📞 Support

For implementation support:
- Documentation: `README.md`
- Examples: `demo.html`
- Tests: `tests.html`
- Issues: GitHub Issues
- Email: support@formulanebula.com

## 🎓 Best Practices

1. **Key Management**
   - Store private key securely (vault/secrets manager)
   - Never commit keys to version control
   - Rotate keys annually
   - Use HSM for production

2. **Session Management**
   - Set reasonable inactivity timeouts
   - Clean up sessions regularly
   - Monitor seat utilization
   - Alert on capacity approaching limit

3. **Offline Mode**
   - Set appropriate grace periods
   - Monitor offline durations
   - Alert users approaching limits
   - Provide clear offline indicators

4. **Usage Reporting**
   - Batch events appropriately
   - Monitor queue sizes
   - Set retention policies
   - Aggregate for analytics

5. **SSO Integration**
   - Use standard protocols (SAML 2.0, OIDC)
   - Implement proper error handling
   - Log authentication events
   - Support multiple providers

## 📝 License Format Example

```json
{
    "licenseId": "lic_1730534400_a1b2c3d4",
    "customerId": "cust_1730534400_e5f6g7h8",
    "customerName": "Acme Corporation",
    "type": "enterprise",
    "seats": 100,
    "features": [
        "advanced_visualization",
        "collaboration",
        "offline_mode",
        "sso_integration",
        "usage_analytics",
        "api_access",
        "custom_branding",
        "priority_support"
    ],
    "activatedAt": "2026-11-02T00:00:00.000Z",
    "expiresAt": "2027-11-02T00:00:00.000Z",
    "metadata": {
        "salesforceId": "SF-12345",
        "accountManager": "jane.doe@formulanebula.com"
    }
}
```

## 🚀 Deployment Checklist

- [ ] Generate production RSA keys
- [ ] Deploy public key to CDN/static assets
- [ ] Set up license generation pipeline
- [ ] Configure API endpoints
- [ ] Set up SSO/SAML with IdP
- [ ] Configure usage reporting backend
- [ ] Set up monitoring/alerting
- [ ] Test license validation
- [ ] Test seat allocation
- [ ] Test offline mode
- [ ] Test SSO flow
- [ ] Load test with expected capacity
- [ ] Document customer onboarding
- [ ] Train support team
- [ ] Create customer dashboard

## 📊 Monitoring Metrics

Key metrics to track:
- License validation success rate
- Active sessions per license
- Seat utilization (%)
- Offline duration (avg/max)
- Sync success rate
- Feature usage by type
- Authentication failures
- Token refresh failures
- API response times

## 🎉 Summary

The enterprise licensing system is now complete with:

✅ Per-seat licensing with automatic allocation  
✅ RSA signature validation (2048-bit)  
✅ Comprehensive usage tracking & reporting  
✅ Full offline mode support (30-day max)  
✅ SAML 2.0 and OAuth 2.0 integration  
✅ Role-based access control  
✅ Browser-compatible crypto  
✅ Automatic token refresh  
✅ Retry logic & error handling  
✅ Interactive demo & test suite  
✅ Complete documentation  

Ready for production deployment!
