/**
 * Premium Feature Gate
 *
 * Controls access to premium features based on user tier
 */

import { PREMIUM_TIERS, USAGE_LIMITS, FEATURE_FLAGS } from './config.js';

export class PremiumGate {
  constructor() {
    this.userTier = 'free';  // Default
    this.usage = {};  // Track usage for rate limits
    this.loadUserTier();
    this.loadUsageData();
  }

  loadUserTier() {
    // TODO: Load from authentication system
    const stored = localStorage.getItem('formula-nebula.premium.tier');
    if (stored) {
      this.userTier = stored;
    }
  }

  loadUsageData() {
    // Load usage tracking data
    const stored = localStorage.getItem('formula-nebula.premium.usage');
    if (stored) {
      try {
        this.usage = JSON.parse(stored);
        this.cleanExpiredUsage();
      } catch (e) {
        this.usage = {};
      }
    }
  }

  saveUsageData() {
    localStorage.setItem('formula-nebula.premium.usage', JSON.stringify(this.usage));
  }

  cleanExpiredUsage() {
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;

    // Clean daily limits (older than 24h)
    for (const [key, data] of Object.entries(this.usage)) {
      if (key.endsWith(':daily') && data.resetAt < now) {
        delete this.usage[key];
      }
    }

    // Clean monthly limits (older than 30 days)
    for (const [key, data] of Object.entries(this.usage)) {
      if (key.endsWith(':monthly') && data.resetAt < now - 30 * dayMs) {
        delete this.usage[key];
      }
    }
  }

  /**
   * Check if user has access to a feature
   * @param {string} featureId - Feature identifier
   * @returns {boolean}
   */
  hasAccess(featureId) {
    const flag = FEATURE_FLAGS[featureId];
    if (!flag) {
      console.warn(`[PremiumGate] Unknown feature: ${featureId}`);
      return false;
    }

    if (!flag.enabled) {
      return false;
    }

    const tierOrder = ['free', 'scholar', 'professional', 'research'];
    const userTierIndex = tierOrder.indexOf(this.userTier);
    const requiredTierIndex = tierOrder.indexOf(flag.requiredTier);

    return userTierIndex >= requiredTierIndex;
  }

  /**
   * Check if user can perform an action within usage limits
   * @param {string} action - Action name (e.g., 'semanticSearch')
   * @param {string} period - 'daily' or 'monthly'
   * @returns {Object} { allowed: boolean, remaining: number, limit: number }
   */
  checkLimit(action, period = 'daily') {
    const limits = USAGE_LIMITS[this.userTier];
    if (!limits || !limits[action]) {
      return { allowed: false, remaining: 0, limit: 0 };
    }

    const actionLimit = limits[action][period];
    if (actionLimit === -1) {
      return { allowed: true, remaining: -1, limit: -1 };  // Unlimited
    }

    const usageKey = `${action}:${period}`;
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    const resetMs = period === 'daily' ? dayMs : 30 * dayMs;

    if (!this.usage[usageKey] || this.usage[usageKey].resetAt < now) {
      // Initialize or reset
      this.usage[usageKey] = {
        count: 0,
        resetAt: now + resetMs
      };
    }

    const current = this.usage[usageKey].count;
    const remaining = Math.max(0, actionLimit - current);
    const allowed = current < actionLimit;

    return { allowed, remaining, limit: actionLimit };
  }

  /**
   * Consume one unit of a limited action
   * @param {string} action
   * @param {string} period
   * @returns {boolean} Success
   */
  consume(action, period = 'daily') {
    const check = this.checkLimit(action, period);
    if (!check.allowed) {
      return false;
    }

    const usageKey = `${action}:${period}`;
    this.usage[usageKey].count++;
    this.saveUsageData();
    return true;
  }

  /**
   * Get remaining quota for an action
   * @param {string} action
   * @param {string} period
   * @returns {number} -1 for unlimited
   */
  getRemaining(action, period = 'daily') {
    return this.checkLimit(action, period).remaining;
  }

  /**
   * Show upgrade prompt
   * @param {string} featureId
   * @param {string} reason - Why upgrade is needed
   */
  promptUpgrade(featureId, reason = '') {
    console.log(`[PremiumGate] Upgrade required: ${featureId}`);

    // Find minimum required tier
    const flag = FEATURE_FLAGS[featureId];
    const requiredTier = flag?.requiredTier || 'scholar';

    // TODO: Show modal with upgrade options
    const message = reason
      ? `${reason}\n\n需要升级至 ${PREMIUM_TIERS[requiredTier].name} 以解锁此功能。`
      : `此功能需要 ${PREMIUM_TIERS[requiredTier].name}。`;

    if (confirm(`${message}\n\n现在升级？`)) {
      this.showPremiumModal(requiredTier);
    }
  }

  /**
   * Show limit reached message
   * @param {string} action
   * @param {string} period
   */
  promptLimitReached(action, period = 'daily') {
    const check = this.checkLimit(action, period);
    const resetTime = this.usage[`${action}:${period}`]?.resetAt || Date.now();
    const hoursUntilReset = Math.ceil((resetTime - Date.now()) / (60 * 60 * 1000));

    const periodText = period === 'daily' ? '每日' : '每月';
    const message = `您已达到${periodText}${action}限额 (${check.limit})。\n\n` +
      `将在 ${hoursUntilReset} 小时后重置，或升级以获得更多额度。`;

    if (confirm(`${message}\n\n查看升级选项？`)) {
      this.showPremiumModal();
    }
  }

  /**
   * Check access with automatic prompts
   * @param {string} featureId
   * @returns {boolean}
   */
  requireAccess(featureId) {
    if (!this.hasAccess(featureId)) {
      this.promptUpgrade(featureId);
      return false;
    }
    return true;
  }

  /**
   * Check limit with automatic prompts
   * @param {string} action
   * @param {string} period
   * @returns {boolean}
   */
  requireLimit(action, period = 'daily') {
    const check = this.checkLimit(action, period);
    if (!check.allowed) {
      this.promptLimitReached(action, period);
      return false;
    }
    return this.consume(action, period);
  }

  showPremiumModal(suggestedTier = null) {
    // Dispatch event for UI to show modal
    window.dispatchEvent(new CustomEvent('show-premium-modal', {
      detail: { suggestedTier }
    }));
  }

  /**
   * Get user's current tier info
   */
  getTierInfo() {
    return PREMIUM_TIERS[this.userTier];
  }

  /**
   * Get all usage stats
   */
  getUsageStats() {
    const stats = {};
    const limits = USAGE_LIMITS[this.userTier];

    for (const [action, limit] of Object.entries(limits)) {
      if (typeof limit === 'object' && (limit.daily !== undefined || limit.monthly !== undefined)) {
        stats[action] = {
          daily: limit.daily !== undefined ? this.checkLimit(action, 'daily') : null,
          monthly: limit.monthly !== undefined ? this.checkLimit(action, 'monthly') : null
        };
      }
    }

    return stats;
  }

  /**
   * Debug: Set tier (for testing)
   */
  _debugSetTier(tier) {
    if (PREMIUM_TIERS[tier]) {
      this.userTier = tier;
      localStorage.setItem('formula-nebula.premium.tier', tier);
      console.log(`[PremiumGate] Tier set to: ${tier}`);
    }
  }

  /**
   * Debug: Reset usage
   */
  _debugResetUsage() {
    this.usage = {};
    this.saveUsageData();
    console.log('[PremiumGate] Usage reset');
  }
}

// Singleton instance
export const premiumGate = new PremiumGate();

// Example usage patterns
export const PremiumExamples = {
  // Check feature access
  checkProofGeneration() {
    if (!premiumGate.requireAccess('proofGeneration')) {
      return false;
    }
    // Proceed with proof generation
    return true;
  },

  // Check rate limit
  async performSemanticSearch(query) {
    if (!premiumGate.requireLimit('semanticSearch', 'daily')) {
      return null;
    }
    // Proceed with search
    return await searchAPI(query);
  },

  // Check both access and limit
  async analyzeTheoremDiscovery() {
    if (!premiumGate.requireAccess('theoremDiscovery')) {
      return null;
    }
    if (!premiumGate.requireLimit('theoremDiscovery', 'monthly')) {
      return null;
    }
    // Proceed with analysis
    return await discoveryAPI();
  },

  // Show current tier
  displayTierBadge() {
    const tier = premiumGate.getTierInfo();
    console.log(`Current tier: ${tier.name}`);
  },

  // Show usage stats
  displayUsageStats() {
    const stats = premiumGate.getUsageStats();
    console.table(stats);
  }
};

// Mock API functions (remove in production)
function searchAPI(query) {
  return new Promise(resolve => setTimeout(() => resolve({ results: [] }), 100));
}

function discoveryAPI() {
  return new Promise(resolve => setTimeout(() => resolve({ theorems: [] }), 100));
}
