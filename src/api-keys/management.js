/**
 * API Key Management System
 * Handles API key lifecycle, authentication, and security
 */

import crypto from 'crypto';

export class APIKeyManager {
  constructor(options = {}) {
    this.storage = options.storage || new Map();
    this.keyPrefix = options.keyPrefix || 'fn_';
    this.keyLength = options.keyLength || 32;
    this.hashAlgorithm = options.hashAlgorithm || 'sha256';
  }

  /**
   * Generate a new API key
   * @param {Object} params - Key generation parameters
   * @returns {Object} Generated key information
   */
  async generateKey(params) {
    const {
      consumerId,
      apiId,
      name,
      permissions = [],
      quotas = this.getDefaultQuotas(),
      expiresInDays = 365
    } = params;

    // Generate cryptographically secure random key
    const rawKey = crypto.randomBytes(this.keyLength).toString('base64url');
    const fullKey = `${this.keyPrefix}${rawKey}`;

    // Hash the key for storage
    const keyHash = this.hashKey(fullKey);
    const keyId = this.generateKeyId();

    const keyData = {
      keyId,
      keyHash,
      consumerId,
      apiId,
      name,
      permissions,
      quotas: {
        ...quotas,
        remaining: {
          minute: quotas.requestsPerMinute,
          day: quotas.requestsPerDay,
          month: quotas.requestsPerMonth
        },
        resetAt: {
          minute: Date.now() + 60000,
          day: Date.now() + 86400000,
          month: this.getNextMonthTimestamp()
        }
      },
      usage: {
        totalRequests: 0,
        lastUsed: null,
        bandwidth: 0
      },
      status: 'active',
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + expiresInDays * 86400000)
    };

    await this.storage.set(keyId, keyData);
    await this.indexByConsumer(consumerId, keyId);

    return {
      keyId,
      key: fullKey, // Only returned once
      ...keyData,
      keyHash: undefined // Don't return hash
    };
  }

  /**
   * Validate an API key
   * @param {string} key - The API key to validate
   * @returns {Object|null} Key data if valid, null otherwise
   */
  async validateKey(key) {
    if (!key || !key.startsWith(this.keyPrefix)) {
      return null;
    }

    const keyHash = this.hashKey(key);

    // Find key by hash (in production, use indexed lookup)
    for (const [keyId, keyData] of this.storage.entries()) {
      if (keyData.keyHash === keyHash) {
        // Check expiration
        if (new Date() > keyData.expiresAt) {
          return { valid: false, reason: 'expired', keyData };
        }

        // Check status
        if (keyData.status !== 'active') {
          return { valid: false, reason: 'inactive', keyData };
        }

        return { valid: true, keyData };
      }
    }

    return null;
  }

  /**
   * Revoke an API key
   * @param {string} keyId - The key ID to revoke
   * @returns {boolean} Success status
   */
  async revokeKey(keyId) {
    const keyData = this.storage.get(keyId);
    if (!keyData) {
      return false;
    }

    keyData.status = 'revoked';
    keyData.revokedAt = new Date();
    await this.storage.set(keyId, keyData);

    return true;
  }

  /**
   * Suspend an API key temporarily
   * @param {string} keyId - The key ID to suspend
   * @param {string} reason - Suspension reason
   * @returns {boolean} Success status
   */
  async suspendKey(keyId, reason) {
    const keyData = this.storage.get(keyId);
    if (!keyData) {
      return false;
    }

    keyData.status = 'suspended';
    keyData.suspendedAt = new Date();
    keyData.suspensionReason = reason;
    await this.storage.set(keyId, keyData);

    return true;
  }

  /**
   * Reactivate a suspended key
   * @param {string} keyId - The key ID to reactivate
   * @returns {boolean} Success status
   */
  async reactivateKey(keyId) {
    const keyData = this.storage.get(keyId);
    if (!keyData || keyData.status !== 'suspended') {
      return false;
    }

    keyData.status = 'active';
    keyData.reactivatedAt = new Date();
    await this.storage.set(keyId, keyData);

    return true;
  }

  /**
   * Rotate an API key (generate new key, revoke old)
   * @param {string} oldKeyId - The old key ID
   * @returns {Object} New key information
   */
  async rotateKey(oldKeyId) {
    const oldKeyData = this.storage.get(oldKeyId);
    if (!oldKeyData) {
      throw new Error('Key not found');
    }

    // Generate new key with same properties
    const newKey = await this.generateKey({
      consumerId: oldKeyData.consumerId,
      apiId: oldKeyData.apiId,
      name: `${oldKeyData.name} (rotated)`,
      permissions: oldKeyData.permissions,
      quotas: {
        requestsPerMinute: oldKeyData.quotas.requestsPerMinute,
        requestsPerDay: oldKeyData.quotas.requestsPerDay,
        requestsPerMonth: oldKeyData.quotas.requestsPerMonth
      }
    });

    // Revoke old key
    await this.revokeKey(oldKeyId);

    return newKey;
  }

  /**
   * List all keys for a consumer
   * @param {string} consumerId - The consumer ID
   * @returns {Array} List of keys
   */
  async listKeys(consumerId) {
    const keys = [];
    for (const [keyId, keyData] of this.storage.entries()) {
      if (keyData.consumerId === consumerId) {
        keys.push({
          ...keyData,
          keyHash: undefined // Don't expose hash
        });
      }
    }
    return keys;
  }

  /**
   * Update key permissions
   * @param {string} keyId - The key ID
   * @param {Array} permissions - New permissions list
   * @returns {boolean} Success status
   */
  async updatePermissions(keyId, permissions) {
    const keyData = this.storage.get(keyId);
    if (!keyData) {
      return false;
    }

    keyData.permissions = permissions;
    keyData.updatedAt = new Date();
    await this.storage.set(keyId, keyData);

    return true;
  }

  /**
   * Update key quotas
   * @param {string} keyId - The key ID
   * @param {Object} quotas - New quota limits
   * @returns {boolean} Success status
   */
  async updateQuotas(keyId, quotas) {
    const keyData = this.storage.get(keyId);
    if (!keyData) {
      return false;
    }

    keyData.quotas = {
      ...keyData.quotas,
      ...quotas
    };
    keyData.updatedAt = new Date();
    await this.storage.set(keyId, keyData);

    return true;
  }

  /**
   * Record key usage
   * @param {string} keyId - The key ID
   * @param {Object} usage - Usage data
   */
  async recordUsage(keyId, usage) {
    const keyData = this.storage.get(keyId);
    if (!keyData) {
      return;
    }

    keyData.usage.totalRequests++;
    keyData.usage.lastUsed = new Date();
    keyData.usage.bandwidth += usage.bytesTransferred || 0;

    await this.storage.set(keyId, keyData);
  }

  /**
   * Get key statistics
   * @param {string} keyId - The key ID
   * @returns {Object} Key statistics
   */
  async getKeyStats(keyId) {
    const keyData = this.storage.get(keyId);
    if (!keyData) {
      return null;
    }

    return {
      keyId,
      totalRequests: keyData.usage.totalRequests,
      lastUsed: keyData.usage.lastUsed,
      bandwidth: keyData.usage.bandwidth,
      quotaUsage: {
        minute: {
          used: keyData.quotas.requestsPerMinute - keyData.quotas.remaining.minute,
          limit: keyData.quotas.requestsPerMinute,
          percentage: ((keyData.quotas.requestsPerMinute - keyData.quotas.remaining.minute) / keyData.quotas.requestsPerMinute * 100).toFixed(2)
        },
        day: {
          used: keyData.quotas.requestsPerDay - keyData.quotas.remaining.day,
          limit: keyData.quotas.requestsPerDay,
          percentage: ((keyData.quotas.requestsPerDay - keyData.quotas.remaining.day) / keyData.quotas.requestsPerDay * 100).toFixed(2)
        },
        month: {
          used: keyData.quotas.requestsPerMonth - keyData.quotas.remaining.month,
          limit: keyData.quotas.requestsPerMonth,
          percentage: ((keyData.quotas.requestsPerMonth - keyData.quotas.remaining.month) / keyData.quotas.requestsPerMonth * 100).toFixed(2)
        }
      },
      daysUntilExpiry: Math.ceil((keyData.expiresAt - new Date()) / 86400000),
      status: keyData.status
    };
  }

  // Helper methods

  hashKey(key) {
    return crypto.createHash(this.hashAlgorithm).update(key).digest('hex');
  }

  generateKeyId() {
    return `key_${crypto.randomBytes(16).toString('hex')}`;
  }

  getDefaultQuotas() {
    return {
      requestsPerMinute: 60,
      requestsPerDay: 10000,
      requestsPerMonth: 300000
    };
  }

  getNextMonthTimestamp() {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1, 1).getTime();
  }

  async indexByConsumer(consumerId, keyId) {
    // In production, maintain separate index for fast lookup
    const index = this.storage.get(`consumer:${consumerId}`) || [];
    index.push(keyId);
    await this.storage.set(`consumer:${consumerId}`, index);
  }
}

/**
 * API Key Validator Middleware
 */
export class APIKeyValidator {
  constructor(keyManager) {
    this.keyManager = keyManager;
  }

  /**
   * Middleware to validate API keys from requests
   */
  async validate(req) {
    // Extract key from Authorization header or query param
    const key = this.extractKey(req);

    if (!key) {
      return {
        valid: false,
        error: 'API key missing',
        statusCode: 401
      };
    }

    const validation = await this.keyManager.validateKey(key);

    if (!validation) {
      return {
        valid: false,
        error: 'Invalid API key',
        statusCode: 401
      };
    }

    if (!validation.valid) {
      return {
        valid: false,
        error: `API key ${validation.reason}`,
        statusCode: 403
      };
    }

    // Check endpoint permissions
    if (!this.hasPermission(validation.keyData, req.endpoint)) {
      return {
        valid: false,
        error: 'Insufficient permissions',
        statusCode: 403
      };
    }

    return {
      valid: true,
      keyData: validation.keyData
    };
  }

  extractKey(req) {
    // Try Authorization header: Bearer <key>
    const authHeader = req.headers?.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    // Try X-API-Key header
    if (req.headers?.['x-api-key']) {
      return req.headers['x-api-key'];
    }

    // Try query parameter
    if (req.query?.apiKey) {
      return req.query.apiKey;
    }

    return null;
  }

  hasPermission(keyData, endpoint) {
    // If no permissions set, allow all
    if (!keyData.permissions || keyData.permissions.length === 0) {
      return true;
    }

    // Check if endpoint matches any permission pattern
    return keyData.permissions.some(pattern => {
      if (pattern === '*') return true;
      if (pattern === endpoint) return true;

      // Wildcard matching
      const regex = new RegExp('^' + pattern.replace('*', '.*') + '$');
      return regex.test(endpoint);
    });
  }
}

export default APIKeyManager;
