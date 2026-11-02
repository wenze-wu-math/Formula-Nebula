/**
 * LicenseKey.js
 * Enterprise license key validation and management
 *
 * Features:
 * - RSA signature verification
 * - Seat limit enforcement
 * - Expiration checks
 * - Feature flag support
 * - Offline validation
 */

export class LicenseKey {
    constructor() {
        this.license = null;
        this.publicKey = null;
        this.validationCache = new Map();
        this.CACHE_TTL = 3600000; // 1 hour
    }

    /**
     * Initialize with public key for signature verification
     * @param {string} publicKeyPEM - RSA public key in PEM format
     */
    setPublicKey(publicKeyPEM) {
        this.publicKey = publicKeyPEM;
    }

    /**
     * Load and validate license key
     * @param {string} licenseString - Encoded license key
     * @returns {Promise<object>} Validation result
     */
    async loadLicense(licenseString) {
        try {
            // Decode license (base64 encoded JSON + signature)
            const decoded = this.decodeLicense(licenseString);

            // Verify signature
            const isValid = await this.verifySignature(decoded.data, decoded.signature);

            if (!isValid) {
                return {
                    valid: false,
                    error: 'Invalid license signature'
                };
            }

            // Parse license data
            this.license = JSON.parse(decoded.data);

            // Validate license properties
            const validation = this.validateLicense();

            if (validation.valid) {
                this.cacheLicense();
            }

            return validation;
        } catch (error) {
            return {
                valid: false,
                error: `License parsing error: ${error.message}`
            };
        }
    }

    /**
     * Decode license string into data and signature components
     * @param {string} licenseString - Encoded license
     * @returns {object} Decoded components
     */
    decodeLicense(licenseString) {
        // Format: BASE64(JSON).BASE64(SIGNATURE)
        const parts = licenseString.split('.');

        if (parts.length !== 2) {
            throw new Error('Invalid license format');
        }

        return {
            data: atob(parts[0]),
            signature: parts[1]
        };
    }

    /**
     * Verify RSA signature (browser-compatible)
     * @param {string} data - License data
     * @param {string} signature - Base64 encoded signature
     * @returns {Promise<boolean>} Verification result
     */
    async verifySignature(data, signature) {
        if (!this.publicKey) {
            throw new Error('Public key not set');
        }

        try {
            // Import public key
            const keyData = this.pemToArrayBuffer(this.publicKey);
            const cryptoKey = await crypto.subtle.importKey(
                'spki',
                keyData,
                {
                    name: 'RSASSA-PKCS1-v1_5',
                    hash: 'SHA-256'
                },
                false,
                ['verify']
            );

            // Verify signature
            const dataBuffer = new TextEncoder().encode(data);
            const signatureBuffer = this.base64ToArrayBuffer(signature);

            return await crypto.subtle.verify(
                'RSASSA-PKCS1-v1_5',
                cryptoKey,
                signatureBuffer,
                dataBuffer
            );
        } catch (error) {
            console.error('Signature verification error:', error);
            return false;
        }
    }

    /**
     * Convert PEM to ArrayBuffer
     * @param {string} pem - PEM formatted key
     * @returns {ArrayBuffer} Binary key data
     */
    pemToArrayBuffer(pem) {
        const b64 = pem
            .replace(/-----BEGIN PUBLIC KEY-----/, '')
            .replace(/-----END PUBLIC KEY-----/, '')
            .replace(/\s/g, '');
        return this.base64ToArrayBuffer(b64);
    }

    /**
     * Convert base64 to ArrayBuffer
     * @param {string} base64 - Base64 string
     * @returns {ArrayBuffer} Binary data
     */
    base64ToArrayBuffer(base64) {
        const binaryString = atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
    }

    /**
     * Validate license properties
     * @returns {object} Validation result
     */
    validateLicense() {
        if (!this.license) {
            return { valid: false, error: 'No license loaded' };
        }

        // Check expiration
        if (this.license.expiresAt) {
            const expiryDate = new Date(this.license.expiresAt);
            if (expiryDate < new Date()) {
                return {
                    valid: false,
                    error: 'License expired',
                    expiredAt: this.license.expiresAt
                };
            }
        }

        // Check activation date
        if (this.license.activatedAt) {
            const activationDate = new Date(this.license.activatedAt);
            if (activationDate > new Date()) {
                return {
                    valid: false,
                    error: 'License not yet active'
                };
            }
        }

        // Check required fields
        const requiredFields = ['licenseId', 'customerId', 'type', 'seats'];
        for (const field of requiredFields) {
            if (!this.license[field]) {
                return {
                    valid: false,
                    error: `Missing required field: ${field}`
                };
            }
        }

        return {
            valid: true,
            license: this.license
        };
    }

    /**
     * Check if user can activate a seat
     * @param {number} currentActiveUsers - Currently active users
     * @returns {boolean} Whether activation is allowed
     */
    canActivateSeat(currentActiveUsers) {
        if (!this.license) return false;

        const maxSeats = this.license.seats;
        return currentActiveUsers < maxSeats;
    }

    /**
     * Get available seats
     * @param {number} currentActiveUsers - Currently active users
     * @returns {object} Seat information
     */
    getSeatInfo(currentActiveUsers) {
        if (!this.license) {
            return { available: 0, total: 0, used: 0 };
        }

        const total = this.license.seats;
        const used = currentActiveUsers;
        const available = Math.max(0, total - used);

        return { available, total, used };
    }

    /**
     * Check if a feature is enabled
     * @param {string} featureName - Feature to check
     * @returns {boolean} Whether feature is enabled
     */
    hasFeature(featureName) {
        if (!this.license || !this.license.features) {
            return false;
        }

        return this.license.features.includes(featureName);
    }

    /**
     * Get license type
     * @returns {string|null} License type (trial, standard, enterprise, etc.)
     */
    getLicenseType() {
        return this.license ? this.license.type : null;
    }

    /**
     * Get days until expiration
     * @returns {number|null} Days remaining or null if no expiration
     */
    getDaysUntilExpiration() {
        if (!this.license || !this.license.expiresAt) {
            return null;
        }

        const now = new Date();
        const expiry = new Date(this.license.expiresAt);
        const diffTime = expiry - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return diffDays;
    }

    /**
     * Cache license for offline use
     */
    cacheLicense() {
        if (!this.license) return;

        const cacheData = {
            license: this.license,
            cachedAt: new Date().toISOString(),
            validUntil: new Date(Date.now() + this.CACHE_TTL).toISOString()
        };

        try {
            localStorage.setItem('fn_license_cache', JSON.stringify(cacheData));
        } catch (error) {
            console.warn('Failed to cache license:', error);
        }
    }

    /**
     * Load license from cache (offline mode)
     * @returns {object|null} Cached license or null
     */
    loadFromCache() {
        try {
            const cached = localStorage.getItem('fn_license_cache');
            if (!cached) return null;

            const cacheData = JSON.parse(cached);
            const validUntil = new Date(cacheData.validUntil);

            // Check if cache is still valid
            if (validUntil < new Date()) {
                localStorage.removeItem('fn_license_cache');
                return null;
            }

            this.license = cacheData.license;
            return {
                valid: true,
                license: this.license,
                fromCache: true,
                cachedAt: cacheData.cachedAt
            };
        } catch (error) {
            console.error('Failed to load cached license:', error);
            return null;
        }
    }

    /**
     * Export license summary
     * @returns {object} License summary
     */
    getSummary() {
        if (!this.license) {
            return null;
        }

        return {
            licenseId: this.license.licenseId,
            customerId: this.license.customerId,
            customerName: this.license.customerName,
            type: this.license.type,
            seats: this.license.seats,
            features: this.license.features || [],
            activatedAt: this.license.activatedAt,
            expiresAt: this.license.expiresAt,
            daysRemaining: this.getDaysUntilExpiration()
        };
    }

    /**
     * Clear loaded license
     */
    clear() {
        this.license = null;
        this.validationCache.clear();
        try {
            localStorage.removeItem('fn_license_cache');
        } catch (error) {
            console.warn('Failed to clear license cache:', error);
        }
    }
}

// Singleton instance
export const licenseManager = new LicenseKey();
