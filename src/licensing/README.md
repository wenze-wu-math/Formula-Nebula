# Enterprise Licensing System

Comprehensive enterprise licensing system for Formula Nebula with per-seat licensing, usage reporting, offline mode, and SSO integration.

## Features

- **Per-seat Licensing**: Manage concurrent user seats with automatic allocation
- **License Key Validation**: RSA signature verification with offline caching
- **Usage Reporting**: Track sessions, features, and seat utilization
- **Offline Mode**: Full functionality with license validation during network outages
- **SSO/SAML Integration**: Enterprise authentication with OAuth 2.0 and SAML 2.0

## Quick Start

### 1. Initialize the Licensing System

```javascript
import { enterpriseLicensing } from './licensing/index.js';

// Configure with your public key
const config = {
    publicKey: `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...
-----END PUBLIC KEY-----`,
    apiEndpoint: '/api/licensing',
    enableSSO: true,
    enableUsageReporting: true,
    enableOfflineMode: true
};

// Initialize
const result = await enterpriseLicensing.initialize();
if (!result.success) {
    console.error('License initialization failed:', result.error);
}
```

### 2. Authenticate with SSO

```javascript
// SAML authentication
await enterpriseLicensing.authenticateWithSSO('saml', {
    saml: true,
    tenantId: 'your-tenant-id'
});

// OAuth authentication
await enterpriseLicensing.authenticateWithSSO('google');
await enterpriseLicensing.authenticateWithSSO('azure');
```

### 3. Start User Session

```javascript
const sessionResult = await enterpriseLicensing.startSession('user-123', {
    email: 'user@example.com',
    name: 'John Doe',
    role: 'analyst'
});

if (sessionResult.success) {
    console.log('Session started:', sessionResult.sessionId);
    console.log('Seat info:', sessionResult.seatInfo);
} else {
    console.error('No available seats:', sessionResult.seatInfo);
}
```

### 4. Track Feature Usage

```javascript
// Check if feature is available
if (enterpriseLicensing.isFeatureAvailable('advanced_visualization')) {
    // Use the feature
    performAdvancedVisualization();

    // Track usage
    enterpriseLicensing.trackFeatureUsage('user-123', 'advanced_visualization', {
        action: 'create',
        objectType: 'graph'
    });
}
```

### 5. Handle Offline Mode

```javascript
// Check offline status
const offlineStatus = enterpriseLicensing.getOfflineStatus();
console.log('Offline:', offlineStatus.isOffline);
console.log('Offline duration:', offlineStatus.offlineDuration);

// Sync when back online
if (offlineStatus.isOffline === false) {
    const syncResult = await enterpriseLicensing.syncOfflineData();
    console.log('Synced:', syncResult.synced, 'Failed:', syncResult.failed);
}
```

## Component API

### LicenseKey

Validates and manages license keys with RSA signature verification.

```javascript
import { licenseManager } from './licensing/index.js';

// Set public key
licenseManager.setPublicKey(publicKeyPEM);

// Load and validate license
const validation = await licenseManager.loadLicense(licenseString);
console.log('Valid:', validation.valid);
console.log('License:', validation.license);

// Check seat availability
const canActivate = licenseManager.canActivateSeat(currentActiveUsers);
const seatInfo = licenseManager.getSeatInfo(currentActiveUsers);

// Check feature availability
const hasFeature = licenseManager.hasFeature('offline_mode');

// Get license summary
const summary = licenseManager.getSummary();
```

### UsageReporter

Tracks and reports usage metrics with offline queue support.

```javascript
import { usageReporter } from './licensing/index.js';

// Track session
usageReporter.trackSessionStart({
    userId: 'user-123',
    email: 'user@example.com',
    role: 'analyst'
});

usageReporter.trackSessionEnd({
    userId: 'user-123',
    duration: 3600000 // 1 hour
});

// Track feature usage
usageReporter.trackFeatureUsage('visualization', {
    action: 'create',
    details: { nodes: 100 }
});

// Track performance
usageReporter.trackPerformance('render_time', 450, {
    unit: 'ms',
    component: 'nebula'
});

// Track errors
usageReporter.trackError(error, {
    component: 'license_validation',
    userId: 'user-123'
});

// Get statistics
const stats = usageReporter.getStatistics();
console.log('Total events:', stats.totalEvents);
console.log('Features used:', stats.featuresUsed);
```

### OfflineMode

Manages offline license validation and sync queue.

```javascript
import { offlineModeManager } from './licensing/index.js';

// Validate license in offline mode
const validation = offlineModeManager.validateOfflineLicense(license);
console.log('Can use offline:', validation.canUseOffline);
console.log('In grace period:', validation.inGracePeriod);

// Queue actions for sync
offlineModeManager.queueAction('seat_activation', {
    userId: 'user-123',
    timestamp: new Date().toISOString()
});

// Check connectivity
const isOnline = await offlineModeManager.checkConnectivity();

// Sync when online
const syncResult = await offlineModeManager.syncWithServer();
console.log('Synced:', syncResult.synced, 'Failed:', syncResult.failed);

// Get status
const status = offlineModeManager.getStatus();
console.log('Offline since:', status.offlineSince);
console.log('Queued actions:', status.queuedActions);
```

### SSOIntegration

Handles SSO authentication with SAML and OAuth.

```javascript
import { ssoManager } from './licensing/index.js';

// SAML login
await ssoManager.initiateSAMLLogin('tenant-id');

// OAuth login
await ssoManager.initiateOAuthLogin('google');

// Handle callbacks
const samlResult = await ssoManager.handleSAMLCallback(samlResponse, relayState);
const oauthResult = await ssoManager.handleOAuthCallback(code, state);

// Check authentication
const isAuth = ssoManager.isAuthenticated();
const user = ssoManager.getCurrentUser();
const token = ssoManager.getAccessToken();

// Check roles and permissions
const hasRole = ssoManager.hasRole('admin');
const hasPermission = ssoManager.hasPermission('edit_config');

// Logout
await ssoManager.logout();
```

## License Format

License keys are encoded as: `BASE64(JSON).BASE64(SIGNATURE)`

License JSON structure:
```json
{
    "licenseId": "lic_abc123",
    "customerId": "cust_xyz789",
    "customerName": "Acme Corporation",
    "type": "enterprise",
    "seats": 100,
    "features": [
        "advanced_visualization",
        "collaboration",
        "offline_mode",
        "sso_integration"
    ],
    "activatedAt": "2026-01-01T00:00:00Z",
    "expiresAt": "2027-01-01T00:00:00Z"
}
```

## License Types

- **trial**: Limited features, 14-30 days
- **standard**: Basic features, up to 10 seats
- **professional**: Advanced features, up to 50 seats
- **enterprise**: All features, unlimited seats, SSO, offline mode

## Feature Flags

Available feature flags:
- `advanced_visualization`: 3D visualizations, custom layouts
- `collaboration`: Real-time collaboration, comments, annotations
- `offline_mode`: Offline license validation, sync queue
- `sso_integration`: SAML/OAuth authentication
- `usage_analytics`: Advanced usage reporting and analytics
- `api_access`: REST API access
- `custom_branding`: White-label customization
- `priority_support`: Priority customer support

## Security

### License Signing

Licenses are signed using RSA-2048 with SHA-256:

1. Create license JSON
2. Sign with private key: `openssl dgst -sha256 -sign private.pem -out signature.bin license.json`
3. Encode: `base64(license.json).base64(signature.bin)`

### Token Management

- Access tokens expire after 1 hour
- Refresh tokens expire after 30 days
- Automatic token refresh 5 minutes before expiry
- Tokens stored in sessionStorage (cleared on browser close)

### Offline Security

- Cached licenses valid for 1 hour
- Grace period: 7 days after expiration
- Maximum offline duration: 30 days
- Signature verification required on initial load

## Integration Example

Complete integration example:

```javascript
import { enterpriseLicensing } from './licensing/index.js';

class App {
    async initialize() {
        // Initialize licensing
        const config = {
            publicKey: this.getPublicKey(),
            apiEndpoint: '/api/licensing',
            enableSSO: true,
            enableUsageReporting: true,
            enableOfflineMode: true
        };

        Object.assign(enterpriseLicensing.config, config);

        // Try to initialize
        const result = await enterpriseLicensing.initialize();

        if (!result.success) {
            if (result.requiresOnline) {
                this.showOfflineError();
                return;
            }

            this.showLicenseError(result.error);
            return;
        }

        // Show license info
        const licenseInfo = enterpriseLicensing.getLicenseInfo();
        console.log('License:', licenseInfo.type);
        console.log('Seats:', licenseInfo.seatInfo);
        console.log('Days remaining:', licenseInfo.daysRemaining);

        // Start user session
        const user = await this.getCurrentUser();
        const session = await enterpriseLicensing.startSession(user.id, user);

        if (!session.success) {
            this.showSeatLimitError(session.seatInfo);
            return;
        }

        // Track feature usage
        this.setupFeatureTracking();

        // Monitor offline status
        this.monitorOfflineStatus();

        // Cleanup on unload
        window.addEventListener('beforeunload', () => {
            enterpriseLicensing.endSession(user.id);
        });
    }

    setupFeatureTracking() {
        // Track when features are used
        document.addEventListener('feature:used', (event) => {
            const user = this.getCurrentUser();
            enterpriseLicensing.trackFeatureUsage(
                user.id,
                event.detail.feature,
                event.detail.metadata
            );
        });
    }

    monitorOfflineStatus() {
        setInterval(() => {
            const status = enterpriseLicensing.getOfflineStatus();

            if (status.isOffline && status.offlineDuration > 24 * 60 * 60 * 1000) {
                this.showOfflineWarning(status);
            }
        }, 60000); // Check every minute
    }
}
```

## Error Handling

```javascript
try {
    const result = await enterpriseLicensing.startSession(userId, userInfo);

    if (!result.success) {
        switch (result.error) {
            case 'No available seats':
                showSeatLimitDialog(result.seatInfo);
                break;
            case 'License expired':
                showLicenseExpiredDialog();
                break;
            case 'Licensing system not initialized':
                await enterpriseLicensing.initialize();
                break;
            default:
                showGenericError(result.error);
        }
    }
} catch (error) {
    console.error('Licensing error:', error);
    showGenericError(error.message);
}
```

## Testing

```javascript
// Mock license for testing
const mockLicense = {
    licenseId: 'test_lic_123',
    customerId: 'test_cust_456',
    customerName: 'Test Company',
    type: 'enterprise',
    seats: 10,
    features: ['advanced_visualization', 'offline_mode'],
    activatedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
};

// Test license validation
const encoded = encodeMockLicense(mockLicense);
const validation = await licenseManager.loadLicense(encoded);
console.assert(validation.valid, 'License should be valid');

// Test seat allocation
const session1 = await enterpriseLicensing.startSession('user1', {});
console.assert(session1.success, 'Should allocate first seat');

const session2 = await enterpriseLicensing.startSession('user2', {});
console.assert(session2.success, 'Should allocate second seat');
```

## Support

For issues or questions:
- Documentation: `/docs/licensing`
- API Reference: `/api/docs`
- Support: support@formulanebula.com
