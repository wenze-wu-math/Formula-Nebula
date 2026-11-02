/**
 * OfflineMode.js
 * Offline mode support with license validation
 *
 * Features:
 * - Offline license validation
 * - Grace period management
 * - Cached credential verification
 * - Sync queue management
 * - Network status monitoring
 */

export class OfflineMode {
    constructor(config = {}) {
        this.config = {
            gracePeriodDays: config.gracePeriodDays || 7,
            maxOfflineDuration: config.maxOfflineDuration || 30 * 24 * 60 * 60 * 1000, // 30 days
            syncEndpoint: config.syncEndpoint || '/api/sync',
            heartbeatInterval: config.heartbeatInterval || 30000, // 30 seconds
            ...config
        };

        this.isOffline = !navigator.onLine;
        this.offlineSince = null;
        this.lastSync = null;
        this.syncQueue = [];
        this.heartbeatTimer = null;

        this.initializeNetworkMonitoring();
        this.loadOfflineState();
    }

    /**
     * Initialize network status monitoring
     */
    initializeNetworkMonitoring() {
        window.addEventListener('online', () => {
            this.handleOnline();
        });

        window.addEventListener('offline', () => {
            this.handleOffline();
        });

        // Start heartbeat to detect connectivity
        this.startHeartbeat();
    }

    /**
     * Handle online event
     */
    async handleOnline() {
        console.log('Network connection restored');
        this.isOffline = false;

        const offlineDuration = this.getOfflineDuration();
        if (offlineDuration > 0) {
            console.log(`Was offline for ${Math.round(offlineDuration / 1000 / 60)} minutes`);
        }

        // Sync queued data
        await this.syncWithServer();

        this.offlineSince = null;
        this.saveOfflineState();
    }

    /**
     * Handle offline event
     */
    handleOffline() {
        console.log('Network connection lost - entering offline mode');
        this.isOffline = true;
        this.offlineSince = new Date().toISOString();
        this.saveOfflineState();
    }

    /**
     * Start heartbeat to monitor connectivity
     */
    startHeartbeat() {
        this.heartbeatTimer = setInterval(async () => {
            const isReachable = await this.checkConnectivity();

            if (isReachable && this.isOffline) {
                this.handleOnline();
            } else if (!isReachable && !this.isOffline) {
                this.handleOffline();
            }
        }, this.config.heartbeatInterval);
    }

    /**
     * Stop heartbeat monitoring
     */
    stopHeartbeat() {
        if (this.heartbeatTimer) {
            clearInterval(this.heartbeatTimer);
            this.heartbeatTimer = null;
        }
    }

    /**
     * Check server connectivity
     * @returns {Promise<boolean>} Whether server is reachable
     */
    async checkConnectivity() {
        if (!navigator.onLine) {
            return false;
        }

        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 5000);

            const response = await fetch('/api/health', {
                method: 'HEAD',
                signal: controller.signal,
                cache: 'no-cache'
            });

            clearTimeout(timeout);
            return response.ok;
        } catch (error) {
            return false;
        }
    }

    /**
     * Validate license in offline mode
     * @param {object} license - License object
     * @returns {object} Validation result
     */
    validateOfflineLicense(license) {
        if (!license) {
            return {
                valid: false,
                error: 'No license available',
                canUseOffline: false
            };
        }

        // Check if license supports offline mode
        if (!license.features || !license.features.includes('offline_mode')) {
            return {
                valid: false,
                error: 'License does not support offline mode',
                canUseOffline: false
            };
        }

        // Check offline duration
        const offlineDuration = this.getOfflineDuration();
        if (offlineDuration > this.config.maxOfflineDuration) {
            return {
                valid: false,
                error: 'Maximum offline duration exceeded',
                canUseOffline: false,
                offlineDuration,
                maxDuration: this.config.maxOfflineDuration
            };
        }

        // Check license expiration with grace period
        if (license.expiresAt) {
            const expiryDate = new Date(license.expiresAt);
            const gracePeriodMs = this.config.gracePeriodDays * 24 * 60 * 60 * 1000;
            const effectiveExpiry = new Date(expiryDate.getTime() + gracePeriodMs);

            if (effectiveExpiry < new Date()) {
                return {
                    valid: false,
                    error: 'License expired (including grace period)',
                    canUseOffline: false,
                    expiredAt: license.expiresAt,
                    gracePeriodExpiredAt: effectiveExpiry.toISOString()
                };
            }
        }

        // Check if we're in grace period
        const inGracePeriod = this.isInGracePeriod(license);

        return {
            valid: true,
            canUseOffline: true,
            offlineDuration,
            inGracePeriod,
            warningMessage: inGracePeriod ? 'License in grace period - please connect to validate' : null
        };
    }

    /**
     * Check if license is in grace period
     * @param {object} license - License object
     * @returns {boolean} Whether in grace period
     */
    isInGracePeriod(license) {
        if (!license.expiresAt) return false;

        const expiryDate = new Date(license.expiresAt);
        const now = new Date();

        return now > expiryDate;
    }

    /**
     * Get offline duration in milliseconds
     * @returns {number} Duration
     */
    getOfflineDuration() {
        if (!this.offlineSince) return 0;

        const offlineStart = new Date(this.offlineSince);
        return Date.now() - offlineStart.getTime();
    }

    /**
     * Queue action for sync when online
     * @param {string} actionType - Type of action
     * @param {object} data - Action data
     */
    queueAction(actionType, data) {
        const action = {
            id: this.generateActionId(),
            type: actionType,
            data,
            queuedAt: new Date().toISOString()
        };

        this.syncQueue.push(action);
        this.saveSyncQueue();

        console.log(`Queued action: ${actionType}`);
    }

    /**
     * Generate unique action ID
     * @returns {string} Action ID
     */
    generateActionId() {
        return `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Sync queued actions with server
     * @returns {Promise<object>} Sync result
     */
    async syncWithServer() {
        if (this.syncQueue.length === 0) {
            console.log('No actions to sync');
            return { synced: 0, failed: 0 };
        }

        console.log(`Syncing ${this.syncQueue.length} queued actions...`);

        const results = {
            synced: 0,
            failed: 0,
            errors: []
        };

        const actionsToSync = [...this.syncQueue];
        this.syncQueue = [];

        for (const action of actionsToSync) {
            try {
                await this.syncAction(action);
                results.synced++;
            } catch (error) {
                console.error(`Failed to sync action ${action.id}:`, error);
                results.failed++;
                results.errors.push({
                    actionId: action.id,
                    error: error.message
                });

                // Re-queue failed action
                this.syncQueue.push(action);
            }
        }

        if (results.synced > 0) {
            this.lastSync = new Date().toISOString();
        }

        this.saveSyncQueue();
        this.saveOfflineState();

        console.log(`Sync complete: ${results.synced} synced, ${results.failed} failed`);

        return results;
    }

    /**
     * Sync single action with server
     * @param {object} action - Action to sync
     * @returns {Promise<void>}
     */
    async syncAction(action) {
        const response = await fetch(this.config.syncEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(action)
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.json();
    }

    /**
     * Get offline mode status
     * @returns {object} Status information
     */
    getStatus() {
        return {
            isOffline: this.isOffline,
            offlineSince: this.offlineSince,
            offlineDuration: this.getOfflineDuration(),
            lastSync: this.lastSync,
            queuedActions: this.syncQueue.length,
            gracePeriodDays: this.config.gracePeriodDays,
            maxOfflineDuration: this.config.maxOfflineDuration,
            canUseOffline: this.getOfflineDuration() <= this.config.maxOfflineDuration
        };
    }

    /**
     * Save offline state to localStorage
     */
    saveOfflineState() {
        try {
            const state = {
                offlineSince: this.offlineSince,
                lastSync: this.lastSync
            };

            localStorage.setItem('fn_offline_state', JSON.stringify(state));
        } catch (error) {
            console.warn('Failed to save offline state:', error);
        }
    }

    /**
     * Load offline state from localStorage
     */
    loadOfflineState() {
        try {
            const saved = localStorage.getItem('fn_offline_state');
            if (saved) {
                const state = JSON.parse(saved);
                this.offlineSince = state.offlineSince;
                this.lastSync = state.lastSync;
            }
        } catch (error) {
            console.warn('Failed to load offline state:', error);
        }
    }

    /**
     * Save sync queue to localStorage
     */
    saveSyncQueue() {
        try {
            localStorage.setItem('fn_sync_queue', JSON.stringify(this.syncQueue));
        } catch (error) {
            console.warn('Failed to save sync queue:', error);
        }
    }

    /**
     * Load sync queue from localStorage
     */
    loadSyncQueue() {
        try {
            const saved = localStorage.getItem('fn_sync_queue');
            if (saved) {
                this.syncQueue = JSON.parse(saved);
            }
        } catch (error) {
            console.warn('Failed to load sync queue:', error);
            this.syncQueue = [];
        }
    }

    /**
     * Clear offline data
     */
    clearOfflineData() {
        this.syncQueue = [];
        this.offlineSince = null;
        this.lastSync = null;

        try {
            localStorage.removeItem('fn_offline_state');
            localStorage.removeItem('fn_sync_queue');
        } catch (error) {
            console.warn('Failed to clear offline data:', error);
        }
    }

    /**
     * Destroy offline mode manager
     */
    destroy() {
        this.stopHeartbeat();
        this.clearOfflineData();
    }
}

// Singleton instance
export const offlineModeManager = new OfflineMode();
