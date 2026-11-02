# Enterprise Licensing - Quick Reference

## 🚀 Quick Start (3 Steps)

```javascript
// 1. Import
import { enterpriseLicensing } from './licensing/index.js';

// 2. Initialize
await enterpriseLicensing.initialize();

// 3. Start Session
await enterpriseLicensing.startSession('user-id', { email: 'user@example.com' });
```

## 📦 Components

| Component | Purpose | Singleton |
|-----------|---------|-----------|
| `LicenseKey` | Validate licenses, manage seats | `licenseManager` |
| `UsageReporter` | Track usage events | `usageReporter` |
| `OfflineMode` | Handle offline scenarios | `offlineModeManager` |
| `SSOIntegration` | SSO/SAML authentication | `ssoManager` |
| `EnterpriseLicensing` | Main orchestrator | `enterpriseLicensing` |

## 🔑 Common Tasks

### Check License Status
```javascript
const info = enterpriseLicensing.getLicenseInfo();
console.log(info.type);           // enterprise
console.log(info.seats);          // 100
console.log(info.daysRemaining);  // 365
console.log(info.seatInfo);       // { available: 95, total: 100, used: 5 }
```

### Check Feature Availability
```javascript
if (enterpriseLicensing.isFeatureAvailable('offline_mode')) {
    // Feature is available
}
```

### Track Feature Usage
```javascript
enterpriseLicensing.trackFeatureUsage('user-id', 'advanced_visualization', {
    action: 'create',
    objectType: 'graph',
    nodeCount: 150
});
```

### Handle Offline Mode
```javascript
const status = enterpriseLicensing.getOfflineStatus();
if (status.isOffline) {
    console.log('Offline for:', status.offlineDuration, 'ms');
    console.log('Queued actions:', status.queuedActions);
}

// Sync when back online
await enterpriseLicensing.syncOfflineData();
```

### SSO Authentication
```javascript
// Initiate login
await ssoManager.initiateOAuthLogin('google');  // or 'azure', 'okta'

// Check auth status
if (ssoManager.isAuthenticated()) {
    const user = ssoManager.getCurrentUser();
    const token = ssoManager.getAccessToken();
}

// Check permissions
if (ssoManager.hasRole('admin')) {
    // User is admin
}

// Logout
await ssoManager.logout();
```

### Session Management
```javascript
// Start
const result = await enterpriseLicensing.startSession('user-123', {
    email: 'user@example.com',
    role: 'analyst'
});

// End
await enterpriseLicensing.endSession('user-123');

// Get active sessions
const sessions = enterpriseLicensing.getActiveSessions();

// Cleanup inactive (1 hour threshold)
enterpriseLicensing.cleanupInactiveSessions(3600000);
```

### Manual License Validation
```javascript
import { licenseManager } from './licensing/index.js';

// Set public key
licenseManager.setPublicKey(publicKeyPEM);

// Validate license
const validation = await licenseManager.loadLicense(licenseKey);
if (validation.valid) {
    console.log('License valid:', validation.license);
} else {
    console.error('Invalid:', validation.error);
}
```

### Usage Statistics
```javascript
const stats = enterpriseLicensing.getUsageStatistics();
console.log('Total events:', stats.totalEvents);
console.log('Features used:', stats.featuresUsed);
console.log('Session duration:', stats.sessionDuration);
```

## 🔧 Configuration

```javascript
const config = {
    // Required
    publicKey: '-----BEGIN PUBLIC KEY-----...',
    apiEndpoint: '/api/licensing',

    // Optional
    enableSSO: true,                    // Enable SSO integration
    enableUsageReporting: true,         // Track usage
    enableOfflineMode: true,            // Support offline

    // Advanced
    reportingEndpoint: '/api/usage/report',
    batchSize: 50,                      // Events per batch
    flushInterval: 60000,               // 1 minute
    gracePeriodDays: 7,                 // Offline grace period
    maxOfflineDuration: 2592000000      // 30 days in ms
};

Object.assign(enterpriseLicensing.config, config);
```

## 📋 License Format

```
BASE64(JSON).BASE64(SIGNATURE)
```

Example JSON:
```json
{
    "licenseId": "lic_...",
    "customerId": "cust_...",
    "customerName": "Company Name",
    "type": "enterprise",
    "seats": 100,
    "features": ["advanced_visualization", "offline_mode", ...],
    "activatedAt": "2026-01-01T00:00:00Z",
    "expiresAt": "2027-01-01T00:00:00Z"
}
```

## 🎯 License Types

| Type | Seats | Features | Duration |
|------|-------|----------|----------|
| trial | 1-5 | Basic | 30 days |
| standard | 1-10 | Standard | 1 year |
| professional | 1-50 | Advanced | 1 year |
| enterprise | Unlimited | All | 1 year |

## ✨ Feature Flags

- `basic_visualization`
- `advanced_visualization`
- `collaboration`
- `offline_mode`
- `sso_integration`
- `usage_analytics`
- `api_access`
- `custom_branding`
- `priority_support`

## 🛠️ CLI Tools

### Generate Keys
```bash
node license-generator.js --generateKeys true
```

### Generate License
```bash
node license-generator.js \
  --customer "Company Name" \
  --seats 100 \
  --type enterprise \
  --duration 365
```

### Options
```
--customer        Customer name (required)
--seats           Number of seats (default: 10)
--type            trial|standard|professional|enterprise
--duration        Duration in days (optional)
--privateKey      Path to private key (default: private.pem)
--output          Output filename (default: license.json)
--verify          Verify license (default: true)
```

## 🐛 Error Handling

```javascript
try {
    const result = await enterpriseLicensing.startSession(userId, userInfo);

    if (!result.success) {
        switch (result.error) {
            case 'No available seats':
                handleNoSeatsError(result.seatInfo);
                break;
            case 'License expired':
                handleExpiredError();
                break;
            case 'Licensing system not initialized':
                await enterpriseLicensing.initialize();
                break;
            default:
                handleGenericError(result.error);
        }
    }
} catch (error) {
    console.error('Licensing error:', error);
}
```

## 📊 Events Tracked

| Event | Data |
|-------|------|
| `session.start` | userId, email, role, licenseType |
| `session.end` | userId, duration |
| `seat.activated` | userId, activatedAt |
| `seat.deactivated` | userId, deactivatedAt |
| `feature.used` | feature, userId, metadata |
| `license.validated` | success, licenseType |
| `performance.metric` | metric, value, unit |
| `error.occurred` | message, stack, context |

## 🔐 Security Notes

- Private key: Server-side ONLY, never expose
- Public key: Client-side, embedded in app
- Access tokens: 1-hour expiry
- Refresh tokens: 30-day expiry
- License cache: 1-hour validity
- Grace period: 7 days
- Max offline: 30 days

## 📡 Required API Endpoints

```
GET  /api/licensing/validate
POST /api/usage/report
POST /api/sync
POST /api/auth/saml
POST /api/auth/saml/callback
GET  /api/auth/oauth/{provider}
POST /api/auth/token
POST /api/auth/token/refresh
POST /api/auth/logout
HEAD /api/health
```

## 🧪 Testing

```bash
# Run test suite
open src/licensing/tests.html

# Run demo
open src/licensing/demo.html
```

## 📚 Documentation

- `README.md` - Full API documentation
- `IMPLEMENTATION.md` - Implementation guide
- `QUICK_REFERENCE.md` - This file

## 💡 Tips

1. **Always initialize before use**
   ```javascript
   await enterpriseLicensing.initialize();
   ```

2. **Check seat availability before login**
   ```javascript
   const info = enterpriseLicensing.getLicenseInfo();
   if (info.seatInfo.available === 0) {
       showNoSeatsError();
   }
   ```

3. **Track feature usage consistently**
   ```javascript
   // Every time a feature is used
   enterpriseLicensing.trackFeatureUsage(userId, featureName, metadata);
   ```

4. **Monitor offline status**
   ```javascript
   setInterval(() => {
       const status = enterpriseLicensing.getOfflineStatus();
       updateUIIndicator(status);
   }, 60000);
   ```

5. **Clean up sessions on exit**
   ```javascript
   window.addEventListener('beforeunload', () => {
       enterpriseLicensing.endSession(userId);
   });
   ```

## 🎯 Common Patterns

### Feature Gate
```javascript
function useFeature(featureName) {
    if (!enterpriseLicensing.isFeatureAvailable(featureName)) {
        showUpgradeDialog(featureName);
        return;
    }

    // Use feature
    executeFeature();

    // Track usage
    enterpriseLicensing.trackFeatureUsage(userId, featureName);
}
```

### Offline Indicator
```javascript
const offlineStatus = enterpriseLicensing.getOfflineStatus();
if (offlineStatus.isOffline) {
    const hours = Math.round(offlineStatus.offlineDuration / 3600000);
    showBanner(`⚠️ Offline for ${hours} hours. ${offlineStatus.queuedActions} actions queued.`);
}
```

### Seat Monitoring
```javascript
const info = enterpriseLicensing.getLicenseInfo();
const utilization = (info.seatInfo.used / info.seatInfo.total) * 100;

if (utilization > 90) {
    notifyAdmin(`Seat utilization at ${utilization.toFixed(0)}%`);
}
```

## 🔗 Links

- Demo: `src/licensing/demo.html`
- Tests: `src/licensing/tests.html`
- Docs: `src/licensing/README.md`
- Implementation: `src/licensing/IMPLEMENTATION.md`

---

**Quick tip:** Use `enterpriseLicensing.getLicenseInfo()` to inspect current license state anytime!
