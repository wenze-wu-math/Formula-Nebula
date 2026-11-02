/**
 * EnterpriseLicensing.js
 * Main enterprise licensing orchestrator
 *
 * Integrates:
 * - License key validation
 * - Usage reporting
 * - Offline mode
 * - SSO integration
 * - Seat management
 */

import { licenseManager } from './LicenseKey.js';
import { usageReporter } from './UsageReporter.js';
import { offlineModeManager } from './OfflineMode.js';
import { ssoManager } from './SSOIntegration.js';

export class EnterpriseLicensing {
    constructor(config = {}) {
        this.config = {
            publicKey: config.publicKey || null,
            apiEndpoint: config.apiEndpoint || '/api/licensing',
            enableSSO: config.enableSSO !== false,
            enableUsageReporting: config.enableUsageReporting !== false,
            enableOfflineMode: config.enableOfflineMode !== false,
            ...config
        };

        this.initialized = false;
        this.activeSessions = new Map();
        this.seatAllocations = new Map();

        // Initialize sub-systems
        if (this.config.publicKey) {
            licenseManager.setPublicKey(this.config.publicKey);
        }
    }

    /**
     * Initialize enterprise licensing system
     * @returns {Promise<object>} Initialization result
     */
    async initialize() {
        if (this.initialized) {
            return { success: true, message: 'Already initialized' };
        }

        try {
            // Try to load cached license for offline mode
            const cachedLicense = licenseManager.loadFromCache();

            if (cachedLicense && cachedLicense.valid) {
                console.log('Loaded license from cache');

                if (this.config.enableOfflineMode) {
                    const offlineValidation = offlineModeManager.validateOfflineLicense(
                        cachedLicense.license
                    );

                    if (!offlineValidation.canUseOffline) {
                        return {
                            success: false,
                            error: offlineValidation.error,
                            requiresOnline: true
                        };
                    }
                }

                this.initialized = true;
                return {
                    success: true,
                    fromCache: true,
                    license: licenseManager.getSummary()
                };
            }

            // Fetch license from server
            const licenseResult = await this.fetchLicenseFromServer();

            if (!licenseResult.success) {
                return licenseResult;
            }

            this.initialized = true;

            return {
                success: true,
                license: licenseManager.getSummary()
            };
        } catch (error) {
            console.error('Initialization error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Fetch license from server
     * @returns {Promise<object>} Fetch result
     */
    async fetchLicenseFromServer() {
        try {
            const response = await fetch(`${this.config.apiEndpoint}/validate`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${ssoManager.getAccessToken()}`
                }
            });

            if (!response.ok) {
                throw new Error(`License fetch failed: ${response.statusText}`);
            }

            const data = await response.json();
            const validation = await licenseManager.loadLicense(data.licenseKey);

            if (this.config.enableUsageReporting) {
                usageReporter.trackLicenseValidation(validation.valid, {
                    licenseType: validation.license?.type
                });
            }

            return {
                success: validation.valid,
                error: validation.error
            };
        } catch (error) {
            console.error('License fetch error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Authenticate user with SSO
     * @param {string} provider - SSO provider
     * @param {object} options - Authentication options
     * @returns {Promise<object>} Authentication result
     */
    async authenticateWithSSO(provider, options = {}) {
        if (!this.config.enableSSO) {
            return {
                success: false,
                error: 'SSO not enabled'
            };
        }

        try {
            if (options.saml) {
                await ssoManager.initiateSAMLLogin(options.tenantId);
            } else {
                await ssoManager.initiateOAuthLogin(provider);
            }

            // This returns after redirect, so we never reach here
            return { success: true };
        } catch (error) {
            console.error('SSO authentication error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Start user session
     * @param {string} userId - User identifier
     * @param {object} userInfo - User information
     * @returns {Promise<object>} Session start result
     */
    async startSession(userId, userInfo = {}) {
        if (!this.initialized) {
            return {
                success: false,
                error: 'Licensing system not initialized'
            };
        }

        // Check seat availability
        const activeUsers = this.activeSessions.size;
        const canActivate = licenseManager.canActivateSeat(activeUsers);

        if (!canActivate) {
            const seatInfo = licenseManager.getSeatInfo(activeUsers);
            return {
                success: false,
                error: 'No available seats',
                seatInfo
            };
        }

        // Create session
        const sessionId = this.generateSessionId();
        const session = {
            sessionId,
            userId,
            userInfo,
            startedAt: new Date().toISOString(),
            lastActivity: new Date().toISOString()
        };

        this.activeSessions.set(userId, session);
        this.seatAllocations.set(userId, {
            allocatedAt: new Date().toISOString(),
            sessionId
        });

        // Track usage
        if (this.config.enableUsageReporting) {
            usageReporter.trackSessionStart({
                userId,
                ...userInfo,
                licenseType: licenseManager.getLicenseType()
            });

            usageReporter.trackSeatActivation(userId, {
                sessionId,
                totalSeats: licenseManager.getSeatInfo(activeUsers).total,
                usedSeats: activeUsers + 1
            });
        }

        return {
            success: true,
            sessionId,
            seatInfo: licenseManager.getSeatInfo(activeUsers + 1)
        };
    }

    /**
     * End user session
     * @param {string} userId - User identifier
     * @returns {Promise<object>} Session end result
     */
    async endSession(userId) {
        const session = this.activeSessions.get(userId);

        if (!session) {
            return {
                success: false,
                error: 'Session not found'
            };
        }

        // Calculate session duration
        const startTime = new Date(session.startedAt);
        const duration = Date.now() - startTime.getTime();

        // Track usage
        if (this.config.enableUsageReporting) {
            usageReporter.trackSessionEnd({
                userId,
                sessionId: session.sessionId,
                duration
            });

            usageReporter.trackSeatDeactivation(userId, {
                sessionId: session.sessionId,
                duration
            });
        }

        // Remove session
        this.activeSessions.delete(userId);
        this.seatAllocations.delete(userId);

        return {
            success: true,
            duration
        };
    }

    /**
     * Track feature usage
     * @param {string} userId - User identifier
     * @param {string} featureName - Feature name
     * @param {object} details - Usage details
     */
    trackFeatureUsage(userId, featureName, details = {}) {
        // Check if user has access to feature
        if (!licenseManager.hasFeature(featureName)) {
            console.warn(`Feature ${featureName} not available in current license`);
            return;
        }

        // Update session activity
        const session = this.activeSessions.get(userId);
        if (session) {
            session.lastActivity = new Date().toISOString();
        }

        // Track usage
        if (this.config.enableUsageReporting) {
            usageReporter.trackFeatureUsage(featureName, {
                userId,
                ...details
            });
        }
    }

    /**
     * Check if feature is available
     * @param {string} featureName - Feature name
     * @returns {boolean} Availability
     */
    isFeatureAvailable(featureName) {
        return licenseManager.hasFeature(featureName);
    }

    /**
     * Get license information
     * @returns {object} License summary
     */
    getLicenseInfo() {
        return {
            ...licenseManager.getSummary(),
            activeSessions: this.activeSessions.size,
            seatInfo: licenseManager.getSeatInfo(this.activeSessions.size)
        };
    }

    /**
     * Get active sessions
     * @returns {Array} Active sessions
     */
    getActiveSessions() {
        return Array.from(this.activeSessions.values());
    }

    /**
     * Get offline mode status
     * @returns {object} Offline status
     */
    getOfflineStatus() {
        if (!this.config.enableOfflineMode) {
            return { enabled: false };
        }

        return {
            enabled: true,
            ...offlineModeManager.getStatus()
        };
    }

    /**
     * Get usage statistics
     * @returns {object} Usage statistics
     */
    getUsageStatistics() {
        if (!this.config.enableUsageReporting) {
            return { enabled: false };
        }

        return {
            enabled: true,
            ...usageReporter.getStatistics()
        };
    }

    /**
     * Sync offline data
     * @returns {Promise<object>} Sync result
     */
    async syncOfflineData() {
        if (!this.config.enableOfflineMode) {
            return {
                success: false,
                error: 'Offline mode not enabled'
            };
        }

        try {
            const result = await offlineModeManager.syncWithServer();
            return {
                success: true,
                ...result
            };
        } catch (error) {
            console.error('Sync error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Generate unique session ID
     * @returns {string} Session ID
     */
    generateSessionId() {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Clean up inactive sessions
     * @param {number} inactivityThresholdMs - Inactivity threshold
     */
    cleanupInactiveSessions(inactivityThresholdMs = 3600000) {
        const now = Date.now();

        for (const [userId, session] of this.activeSessions.entries()) {
            const lastActivity = new Date(session.lastActivity).getTime();
            const inactivityDuration = now - lastActivity;

            if (inactivityDuration > inactivityThresholdMs) {
                console.log(`Cleaning up inactive session for user ${userId}`);
                this.endSession(userId);
            }
        }
    }

    /**
     * Destroy licensing system
     */
    destroy() {
        // End all sessions
        for (const userId of this.activeSessions.keys()) {
            this.endSession(userId);
        }

        // Cleanup sub-systems
        if (this.config.enableUsageReporting) {
            usageReporter.destroy();
        }

        if (this.config.enableOfflineMode) {
            offlineModeManager.destroy();
        }

        if (this.config.enableSSO) {
            ssoManager.destroy();
        }

        licenseManager.clear();

        this.initialized = false;
    }
}

// Singleton instance
export const enterpriseLicensing = new EnterpriseLicensing();
