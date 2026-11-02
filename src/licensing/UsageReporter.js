/**
 * UsageReporter.js
 * Enterprise usage tracking and reporting
 *
 * Features:
 * - Session tracking
 * - Feature usage metrics
 * - Seat utilization reporting
 * - Batched API reporting
 * - Offline queue support
 */

export class UsageReporter {
    constructor(config = {}) {
        this.config = {
            reportingEndpoint: config.reportingEndpoint || '/api/usage/report',
            batchSize: config.batchSize || 50,
            flushInterval: config.flushInterval || 60000, // 1 minute
            retryAttempts: config.retryAttempts || 3,
            retryDelay: config.retryDelay || 5000,
            offlineQueueSize: config.offlineQueueSize || 1000,
            ...config
        };

        this.sessionId = this.generateSessionId();
        this.events = [];
        this.offlineQueue = [];
        this.flushTimer = null;
        this.isOnline = navigator.onLine;

        this.initializeMonitoring();
        this.loadOfflineQueue();
        this.startAutoFlush();
    }

    /**
     * Generate unique session ID
     * @returns {string} Session ID
     */
    generateSessionId() {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Initialize network and visibility monitoring
     */
    initializeMonitoring() {
        // Monitor online/offline status
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.processOfflineQueue();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
        });

        // Flush on page unload
        window.addEventListener('beforeunload', () => {
            this.flush(true); // Synchronous flush
        });

        // Track visibility for session duration
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.trackEvent('session.hidden');
            } else {
                this.trackEvent('session.visible');
            }
        });
    }

    /**
     * Track usage event
     * @param {string} eventType - Type of event
     * @param {object} metadata - Additional event data
     */
    trackEvent(eventType, metadata = {}) {
        const event = {
            eventId: this.generateEventId(),
            sessionId: this.sessionId,
            eventType,
            timestamp: new Date().toISOString(),
            metadata: {
                ...metadata,
                userAgent: navigator.userAgent,
                viewport: {
                    width: window.innerWidth,
                    height: window.innerHeight
                }
            }
        };

        this.events.push(event);

        // Auto-flush if batch size reached
        if (this.events.length >= this.config.batchSize) {
            this.flush();
        }
    }

    /**
     * Generate unique event ID
     * @returns {string} Event ID
     */
    generateEventId() {
        return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Track session start
     * @param {object} userInfo - User information
     */
    trackSessionStart(userInfo = {}) {
        this.trackEvent('session.start', {
            userId: userInfo.userId,
            email: userInfo.email,
            role: userInfo.role,
            licenseType: userInfo.licenseType,
            sessionStartTime: new Date().toISOString()
        });
    }

    /**
     * Track session end
     * @param {object} summary - Session summary
     */
    trackSessionEnd(summary = {}) {
        this.trackEvent('session.end', {
            ...summary,
            sessionEndTime: new Date().toISOString(),
            duration: summary.duration || this.getSessionDuration()
        });

        this.flush(true);
    }

    /**
     * Track feature usage
     * @param {string} featureName - Feature identifier
     * @param {object} details - Usage details
     */
    trackFeatureUsage(featureName, details = {}) {
        this.trackEvent('feature.used', {
            feature: featureName,
            ...details
        });
    }

    /**
     * Track seat activation
     * @param {string} userId - User ID
     * @param {object} seatInfo - Seat information
     */
    trackSeatActivation(userId, seatInfo = {}) {
        this.trackEvent('seat.activated', {
            userId,
            ...seatInfo,
            activatedAt: new Date().toISOString()
        });
    }

    /**
     * Track seat deactivation
     * @param {string} userId - User ID
     * @param {object} seatInfo - Seat information
     */
    trackSeatDeactivation(userId, seatInfo = {}) {
        this.trackEvent('seat.deactivated', {
            userId,
            ...seatInfo,
            deactivatedAt: new Date().toISOString()
        });
    }

    /**
     * Track license validation
     * @param {boolean} success - Whether validation succeeded
     * @param {object} details - Validation details
     */
    trackLicenseValidation(success, details = {}) {
        this.trackEvent('license.validated', {
            success,
            ...details,
            validatedAt: new Date().toISOString()
        });
    }

    /**
     * Track performance metrics
     * @param {string} metricName - Metric identifier
     * @param {number} value - Metric value
     * @param {object} context - Additional context
     */
    trackPerformance(metricName, value, context = {}) {
        this.trackEvent('performance.metric', {
            metric: metricName,
            value,
            unit: context.unit || 'ms',
            ...context
        });
    }

    /**
     * Track error
     * @param {Error} error - Error object
     * @param {object} context - Error context
     */
    trackError(error, context = {}) {
        this.trackEvent('error.occurred', {
            message: error.message,
            stack: error.stack,
            name: error.name,
            ...context
        });
    }

    /**
     * Get session duration in milliseconds
     * @returns {number} Duration
     */
    getSessionDuration() {
        const sessionStart = this.events.find(e => e.eventType === 'session.start');
        if (!sessionStart) return 0;

        return Date.now() - new Date(sessionStart.timestamp).getTime();
    }

    /**
     * Start auto-flush timer
     */
    startAutoFlush() {
        this.flushTimer = setInterval(() => {
            if (this.events.length > 0) {
                this.flush();
            }
        }, this.config.flushInterval);
    }

    /**
     * Stop auto-flush timer
     */
    stopAutoFlush() {
        if (this.flushTimer) {
            clearInterval(this.flushTimer);
            this.flushTimer = null;
        }
    }

    /**
     * Flush events to server
     * @param {boolean} synchronous - Whether to use synchronous request
     * @returns {Promise<void>}
     */
    async flush(synchronous = false) {
        if (this.events.length === 0) return;

        const eventsToSend = [...this.events];
        this.events = [];

        const payload = {
            sessionId: this.sessionId,
            events: eventsToSend,
            reportedAt: new Date().toISOString()
        };

        if (!this.isOnline) {
            this.queueOffline(payload);
            return;
        }

        try {
            if (synchronous) {
                // Use sendBeacon for synchronous requests (e.g., on page unload)
                const blob = new Blob([JSON.stringify(payload)], {
                    type: 'application/json'
                });
                navigator.sendBeacon(this.config.reportingEndpoint, blob);
            } else {
                await this.sendReport(payload);
            }
        } catch (error) {
            console.error('Failed to send usage report:', error);
            this.queueOffline(payload);
        }
    }

    /**
     * Send report to server
     * @param {object} payload - Report payload
     * @param {number} attempt - Retry attempt number
     * @returns {Promise<void>}
     */
    async sendReport(payload, attempt = 1) {
        try {
            const response = await fetch(this.config.reportingEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            if (attempt < this.config.retryAttempts) {
                await this.delay(this.config.retryDelay * attempt);
                return this.sendReport(payload, attempt + 1);
            }
            throw error;
        }
    }

    /**
     * Queue events for offline processing
     * @param {object} payload - Events payload
     */
    queueOffline(payload) {
        this.offlineQueue.push(payload);

        // Limit queue size
        if (this.offlineQueue.length > this.config.offlineQueueSize) {
            this.offlineQueue.shift(); // Remove oldest
        }

        this.saveOfflineQueue();
    }

    /**
     * Process offline queue when back online
     */
    async processOfflineQueue() {
        if (this.offlineQueue.length === 0) return;

        const queue = [...this.offlineQueue];
        this.offlineQueue = [];

        for (const payload of queue) {
            try {
                await this.sendReport(payload);
            } catch (error) {
                console.error('Failed to process offline event:', error);
                this.offlineQueue.push(payload); // Re-queue
            }
        }

        this.saveOfflineQueue();
    }

    /**
     * Save offline queue to localStorage
     */
    saveOfflineQueue() {
        try {
            localStorage.setItem(
                'fn_usage_queue',
                JSON.stringify(this.offlineQueue)
            );
        } catch (error) {
            console.warn('Failed to save offline queue:', error);
        }
    }

    /**
     * Load offline queue from localStorage
     */
    loadOfflineQueue() {
        try {
            const saved = localStorage.getItem('fn_usage_queue');
            if (saved) {
                this.offlineQueue = JSON.parse(saved);
            }
        } catch (error) {
            console.warn('Failed to load offline queue:', error);
            this.offlineQueue = [];
        }
    }

    /**
     * Get usage statistics
     * @returns {object} Statistics summary
     */
    getStatistics() {
        const eventTypes = {};
        const features = new Set();

        for (const event of this.events) {
            eventTypes[event.eventType] = (eventTypes[event.eventType] || 0) + 1;

            if (event.eventType === 'feature.used' && event.metadata.feature) {
                features.add(event.metadata.feature);
            }
        }

        return {
            sessionId: this.sessionId,
            totalEvents: this.events.length,
            queuedEvents: this.offlineQueue.length,
            eventTypes,
            featuresUsed: Array.from(features),
            sessionDuration: this.getSessionDuration(),
            isOnline: this.isOnline
        };
    }

    /**
     * Delay helper for retry logic
     * @param {number} ms - Milliseconds to delay
     * @returns {Promise<void>}
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Destroy reporter and cleanup
     */
    destroy() {
        this.stopAutoFlush();
        this.flush(true);
        this.events = [];
        this.offlineQueue = [];
    }
}

// Singleton instance
export const usageReporter = new UsageReporter();
