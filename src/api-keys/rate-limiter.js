/**
 * Rate Limiting Engine
 * Token bucket algorithm with multi-tier support
 */

export class RateLimiter {
  constructor(options = {}) {
    this.storage = options.storage || new Map();
    this.algorithm = options.algorithm || 'token-bucket';
  }

  /**
   * Check if request is allowed under rate limits
   * @param {string} keyId - API key ID
   * @param {Object} limits - Rate limit configuration
   * @returns {Object} Rate limit result
   */
  async checkLimit(keyId, limits) {
    const now = Date.now();
    const buckets = this.getBuckets(keyId);

    // Check minute limit
    const minuteResult = this.checkBucket(
      buckets.minute,
      limits.requestsPerMinute,
      limits.burstLimit || limits.requestsPerMinute * 2,
      60000, // 1 minute
      now
    );

    if (!minuteResult.allowed) {
      return {
        allowed: false,
        reason: 'minute_limit_exceeded',
        retryAfter: minuteResult.retryAfter,
        remaining: minuteResult.remaining,
        limit: limits.requestsPerMinute
      };
    }

    // Check day limit
    const dayResult = this.checkBucket(
      buckets.day,
      limits.requestsPerDay,
      limits.requestsPerDay,
      86400000, // 24 hours
      now
    );

    if (!dayResult.allowed) {
      return {
        allowed: false,
        reason: 'daily_limit_exceeded',
        retryAfter: dayResult.retryAfter,
        remaining: dayResult.remaining,
        limit: limits.requestsPerDay
      };
    }

    // Consume tokens from all buckets
    this.consumeToken(buckets.minute, now);
    this.consumeToken(buckets.day, now);

    this.storage.set(keyId, buckets);

    return {
      allowed: true,
      remaining: {
        minute: minuteResult.remaining - 1,
        day: dayResult.remaining - 1
      },
      resetAt: {
        minute: buckets.minute.resetAt,
        day: buckets.day.resetAt
      }
    };
  }

  /**
   * Get or initialize token buckets for a key
   */
  getBuckets(keyId) {
    let buckets = this.storage.get(keyId);

    if (!buckets) {
      const now = Date.now();
      buckets = {
        minute: {
          tokens: 0,
          lastRefill: now,
          resetAt: now + 60000
        },
        day: {
          tokens: 0,
          lastRefill: now,
          resetAt: now + 86400000
        }
      };
    }

    return buckets;
  }

  /**
   * Check if bucket allows request
   */
  checkBucket(bucket, capacity, burstCapacity, refillInterval, now) {
    // Refill tokens based on time elapsed
    const timeSinceRefill = now - bucket.lastRefill;
    const refillRate = capacity / refillInterval;
    const tokensToAdd = Math.floor(timeSinceRefill * refillRate);

    let currentTokens = Math.min(
      bucket.tokens + tokensToAdd,
      burstCapacity
    );

    // Reset bucket if interval passed
    if (now >= bucket.resetAt) {
      currentTokens = capacity;
      bucket.resetAt = now + refillInterval;
      bucket.lastRefill = now;
    }

    if (currentTokens < 1) {
      // Calculate retry after
      const tokensNeeded = 1 - currentTokens;
      const timeNeeded = Math.ceil(tokensNeeded / refillRate);

      return {
        allowed: false,
        remaining: 0,
        retryAfter: timeNeeded
      };
    }

    return {
      allowed: true,
      remaining: Math.floor(currentTokens)
    };
  }

  /**
   * Consume a token from bucket
   */
  consumeToken(bucket, now) {
    bucket.tokens = Math.max(0, bucket.tokens - 1);
    bucket.lastRefill = now;
  }

  /**
   * Get current rate limit status
   * @param {string} keyId - API key ID
   * @param {Object} limits - Rate limit configuration
   * @returns {Object} Current status
   */
  async getStatus(keyId, limits) {
    const buckets = this.getBuckets(keyId);
    const now = Date.now();

    const minuteStatus = this.calculateRemaining(
      buckets.minute,
      limits.requestsPerMinute,
      60000,
      now
    );

    const dayStatus = this.calculateRemaining(
      buckets.day,
      limits.requestsPerDay,
      86400000,
      now
    );

    return {
      minute: {
        remaining: minuteStatus.remaining,
        limit: limits.requestsPerMinute,
        resetAt: buckets.minute.resetAt,
        resetIn: Math.max(0, buckets.minute.resetAt - now)
      },
      day: {
        remaining: dayStatus.remaining,
        limit: limits.requestsPerDay,
        resetAt: buckets.day.resetAt,
        resetIn: Math.max(0, buckets.day.resetAt - now)
      }
    };
  }

  calculateRemaining(bucket, capacity, refillInterval, now) {
    const timeSinceRefill = now - bucket.lastRefill;
    const refillRate = capacity / refillInterval;
    const tokensToAdd = Math.floor(timeSinceRefill * refillRate);

    const remaining = Math.min(bucket.tokens + tokensToAdd, capacity);

    return {
      remaining: Math.floor(remaining)
    };
  }

  /**
   * Reset rate limits for a key
   * @param {string} keyId - API key ID
   */
  async reset(keyId) {
    this.storage.delete(keyId);
  }

  /**
   * Clear all rate limit data
   */
  async clearAll() {
    this.storage.clear();
  }
}

/**
 * Rate limit middleware
 */
export class RateLimitMiddleware {
  constructor(rateLimiter, keyManager) {
    this.rateLimiter = rateLimiter;
    this.keyManager = keyManager;
  }

  async handle(req, keyData) {
    const limits = keyData.quotas;

    const result = await this.rateLimiter.checkLimit(keyData.keyId, {
      requestsPerMinute: limits.requestsPerMinute,
      requestsPerDay: limits.requestsPerDay,
      burstLimit: limits.burstLimit || limits.requestsPerMinute * 2
    });

    // Add rate limit headers to response
    req.rateLimitHeaders = {
      'X-RateLimit-Limit-Minute': limits.requestsPerMinute,
      'X-RateLimit-Limit-Day': limits.requestsPerDay,
      'X-RateLimit-Remaining-Minute': result.remaining?.minute || 0,
      'X-RateLimit-Remaining-Day': result.remaining?.day || 0,
      'X-RateLimit-Reset-Minute': result.resetAt?.minute || 0,
      'X-RateLimit-Reset-Day': result.resetAt?.day || 0
    };

    if (!result.allowed) {
      req.rateLimitHeaders['Retry-After'] = Math.ceil(result.retryAfter / 1000);

      return {
        allowed: false,
        error: `Rate limit exceeded: ${result.reason}`,
        statusCode: 429,
        headers: req.rateLimitHeaders,
        retryAfter: result.retryAfter
      };
    }

    return {
      allowed: true,
      headers: req.rateLimitHeaders
    };
  }
}

export default RateLimiter;
