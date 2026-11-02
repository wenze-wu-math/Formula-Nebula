/**
 * Quota Tracker
 * Tracks and manages API usage quotas
 */

export class QuotaTracker {
  constructor(options = {}) {
    this.storage = options.storage || new Map();
  }

  /**
   * Check if quota allows request
   */
  async checkQuota(keyId, quotas) {
    const usage = await this.getUsage(keyId);
    const now = Date.now();

    // Check minute quota
    if (usage.minute.count >= quotas.requestsPerMinute) {
      const resetIn = usage.minute.resetAt - now;
      if (resetIn > 0) {
        return {
          allowed: false,
          reason: 'minute_quota_exceeded',
          resetIn,
          remaining: 0
        };
      }
    }

    // Check day quota
    if (usage.day.count >= quotas.requestsPerDay) {
      const resetIn = usage.day.resetAt - now;
      if (resetIn > 0) {
        return {
          allowed: false,
          reason: 'daily_quota_exceeded',
          resetIn,
          remaining: 0
        };
      }
    }

    // Check month quota
    if (quotas.requestsPerMonth && usage.month.count >= quotas.requestsPerMonth) {
      const resetIn = usage.month.resetAt - now;
      if (resetIn > 0) {
        return {
          allowed: false,
          reason: 'monthly_quota_exceeded',
          resetIn,
          remaining: 0
        };
      }
    }

    return {
      allowed: true,
      remaining: {
        minute: quotas.requestsPerMinute - usage.minute.count,
        day: quotas.requestsPerDay - usage.day.count,
        month: quotas.requestsPerMonth - usage.month.count
      }
    };
  }

  /**
   * Record quota usage
   */
  async recordUsage(keyId, quotas) {
    const usage = await this.getUsage(keyId);
    const now = Date.now();

    // Reset if windows expired
    if (now >= usage.minute.resetAt) {
      usage.minute = {
        count: 0,
        resetAt: now + 60000
      };
    }

    if (now >= usage.day.resetAt) {
      usage.day = {
        count: 0,
        resetAt: now + 86400000
      };
    }

    if (now >= usage.month.resetAt) {
      usage.month = {
        count: 0,
        resetAt: this.getNextMonthTimestamp()
      };
    }

    // Increment counters
    usage.minute.count++;
    usage.day.count++;
    usage.month.count++;
    usage.totalRequests++;

    await this.storage.set(`quota:${keyId}`, usage);

    return usage;
  }

  /**
   * Get current usage
   */
  async getUsage(keyId) {
    let usage = this.storage.get(`quota:${keyId}`);

    if (!usage) {
      const now = Date.now();
      usage = {
        minute: {
          count: 0,
          resetAt: now + 60000
        },
        day: {
          count: 0,
          resetAt: now + 86400000
        },
        month: {
          count: 0,
          resetAt: this.getNextMonthTimestamp()
        },
        totalRequests: 0
      };
    }

    return usage;
  }

  /**
   * Reset quota for key
   */
  async resetQuota(keyId) {
    this.storage.delete(`quota:${keyId}`);
  }

  /**
   * Get quota statistics
   */
  async getStats(keyId, quotas) {
    const usage = await this.getUsage(keyId);
    const now = Date.now();

    return {
      minute: {
        used: usage.minute.count,
        limit: quotas.requestsPerMinute,
        remaining: Math.max(0, quotas.requestsPerMinute - usage.minute.count),
        percentage: (usage.minute.count / quotas.requestsPerMinute * 100).toFixed(2),
        resetIn: Math.max(0, usage.minute.resetAt - now)
      },
      day: {
        used: usage.day.count,
        limit: quotas.requestsPerDay,
        remaining: Math.max(0, quotas.requestsPerDay - usage.day.count),
        percentage: (usage.day.count / quotas.requestsPerDay * 100).toFixed(2),
        resetIn: Math.max(0, usage.day.resetAt - now)
      },
      month: {
        used: usage.month.count,
        limit: quotas.requestsPerMonth,
        remaining: Math.max(0, quotas.requestsPerMonth - usage.month.count),
        percentage: (usage.month.count / quotas.requestsPerMonth * 100).toFixed(2),
        resetIn: Math.max(0, usage.month.resetAt - now)
      },
      totalRequests: usage.totalRequests
    };
  }

  getNextMonthTimestamp() {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1, 1).getTime();
  }
}

export default QuotaTracker;
