/**
 * Formula Nebula - Billing Tiers System
 *
 * Manages subscription tiers, quotas, and usage limits for the freemium SaaS model.
 *
 * Tier Structure:
 * - Free: 1 GB storage, 5 saved collections, community access
 * - Pro: Unlimited storage, private collections, pro badge ($9.99/mo)
 * - Team: 5 users, SSO, priority support ($49/mo)
 * - Enterprise: Custom pricing, on-prem option
 */

// ============================================================================
// Tier Definitions
// ============================================================================

export const TIER_TYPES = {
  FREE: 'free',
  PRO: 'pro',
  TEAM: 'team',
  ENTERPRISE: 'enterprise'
};

export const TIER_DEFINITIONS = {
  [TIER_TYPES.FREE]: {
    id: TIER_TYPES.FREE,
    name: 'Free',
    price: 0,
    billingCycle: null,
    features: [
      '1 GB storage',
      '5 saved collections',
      'Community access',
      'Public sharing',
      'Basic graph exploration'
    ],
    quotas: {
      storageBytes: 1 * 1024 * 1024 * 1024, // 1 GB
      collections: 5,
      formulasPerCollection: 100,
      collaborators: 0,
      privateCollections: 0,
      apiCallsPerDay: 100,
      exportFormats: ['png', 'json'],
      prioritySupport: false,
      customBranding: false,
      sso: false
    },
    limits: {
      maxFileUploadSize: 10 * 1024 * 1024, // 10 MB
      maxAnnotations: 50,
      maxSharedLinks: 10
    }
  },

  [TIER_TYPES.PRO]: {
    id: TIER_TYPES.PRO,
    name: 'Pro',
    price: 9.99,
    billingCycle: 'monthly',
    features: [
      'Unlimited storage',
      'Unlimited collections',
      'Private collections',
      'Pro badge',
      'Advanced export formats',
      'Priority rendering',
      'Ad-free experience'
    ],
    quotas: {
      storageBytes: -1, // Unlimited
      collections: -1, // Unlimited
      formulasPerCollection: -1, // Unlimited
      collaborators: 3,
      privateCollections: -1, // Unlimited
      apiCallsPerDay: 10000,
      exportFormats: ['png', 'svg', 'pdf', 'json', 'latex'],
      prioritySupport: false,
      customBranding: false,
      sso: false
    },
    limits: {
      maxFileUploadSize: 100 * 1024 * 1024, // 100 MB
      maxAnnotations: -1, // Unlimited
      maxSharedLinks: -1 // Unlimited
    }
  },

  [TIER_TYPES.TEAM]: {
    id: TIER_TYPES.TEAM,
    name: 'Team',
    price: 49.00,
    billingCycle: 'monthly',
    teamSize: 5,
    features: [
      'Everything in Pro',
      '5 team members included',
      'Team workspace',
      'SSO integration',
      'Priority support',
      'Advanced collaboration',
      'Audit logs',
      'Custom domains'
    ],
    quotas: {
      storageBytes: -1, // Unlimited
      collections: -1, // Unlimited
      formulasPerCollection: -1, // Unlimited
      collaborators: 5,
      privateCollections: -1, // Unlimited
      apiCallsPerDay: 50000,
      exportFormats: ['png', 'svg', 'pdf', 'json', 'latex', 'html'],
      prioritySupport: true,
      customBranding: true,
      sso: true
    },
    limits: {
      maxFileUploadSize: 500 * 1024 * 1024, // 500 MB
      maxAnnotations: -1, // Unlimited
      maxSharedLinks: -1 // Unlimited
    }
  },

  [TIER_TYPES.ENTERPRISE]: {
    id: TIER_TYPES.ENTERPRISE,
    name: 'Enterprise',
    price: null, // Custom pricing
    billingCycle: 'custom',
    features: [
      'Everything in Team',
      'Unlimited team members',
      'On-premise deployment option',
      'Dedicated account manager',
      'SLA guarantees',
      'Custom integrations',
      'Advanced security features',
      'White-label options',
      'Priority feature requests'
    ],
    quotas: {
      storageBytes: -1, // Unlimited
      collections: -1, // Unlimited
      formulasPerCollection: -1, // Unlimited
      collaborators: -1, // Unlimited
      privateCollections: -1, // Unlimited
      apiCallsPerDay: -1, // Unlimited
      exportFormats: ['png', 'svg', 'pdf', 'json', 'latex', 'html', 'custom'],
      prioritySupport: true,
      customBranding: true,
      sso: true
    },
    limits: {
      maxFileUploadSize: -1, // Unlimited
      maxAnnotations: -1, // Unlimited
      maxSharedLinks: -1 // Unlimited
    }
  }
};

// ============================================================================
// In-Memory Storage (Replace with database in production)
// ============================================================================

const userTiers = new Map();
const usageTracking = new Map();

// ============================================================================
// Core Functions
// ============================================================================

/**
 * Get the current tier for a user
 * @param {string} userId - User identifier
 * @returns {Object} Tier object with id, name, features, quotas
 */
export function GetTier(userId) {
  if (!userId) {
    throw new Error('userId is required');
  }

  const tierType = userTiers.get(userId) || TIER_TYPES.FREE;
  const tier = TIER_DEFINITIONS[tierType];

  if (!tier) {
    console.warn(`Unknown tier type: ${tierType}, defaulting to FREE`);
    return TIER_DEFINITIONS[TIER_TYPES.FREE];
  }

  return {
    ...tier,
    userId,
    activatedAt: getUserTierMetadata(userId)?.activatedAt || new Date().toISOString(),
    expiresAt: getUserTierMetadata(userId)?.expiresAt || null
  };
}

/**
 * Upgrade or change a user's tier
 * @param {string} userId - User identifier
 * @param {string} tier - Target tier (free, pro, team, enterprise)
 * @param {Object} options - Additional options (expiresAt, metadata)
 * @returns {Object} Upgrade result with success status and new tier
 */
export function UpgradeTier(userId, tier, options = {}) {
  if (!userId) {
    throw new Error('userId is required');
  }

  if (!TIER_DEFINITIONS[tier]) {
    throw new Error(`Invalid tier: ${tier}. Valid tiers: ${Object.keys(TIER_TYPES).join(', ')}`);
  }

  const currentTier = userTiers.get(userId) || TIER_TYPES.FREE;
  const newTier = tier;

  // Validate tier transition
  const tierHierarchy = [TIER_TYPES.FREE, TIER_TYPES.PRO, TIER_TYPES.TEAM, TIER_TYPES.ENTERPRISE];
  const currentIndex = tierHierarchy.indexOf(currentTier);
  const newIndex = tierHierarchy.indexOf(newTier);

  if (newIndex < currentIndex && !options.allowDowngrade) {
    return {
      success: false,
      error: 'Downgrade not allowed without explicit confirmation',
      currentTier: TIER_DEFINITIONS[currentTier],
      requestedTier: TIER_DEFINITIONS[newTier]
    };
  }

  // Set the new tier
  userTiers.set(userId, newTier);

  // Store metadata
  const metadata = {
    previousTier: currentTier,
    activatedAt: new Date().toISOString(),
    expiresAt: options.expiresAt || null,
    paymentMethod: options.paymentMethod || null,
    customPricing: options.customPricing || null
  };

  setUserTierMetadata(userId, metadata);

  // Reset usage counters on upgrade
  resetUsageCounters(userId);

  return {
    success: true,
    previousTier: TIER_DEFINITIONS[currentTier],
    newTier: TIER_DEFINITIONS[newTier],
    metadata,
    effectiveDate: metadata.activatedAt
  };
}

/**
 * Calculate quotas for a given tier
 * @param {string} tier - Tier type (free, pro, team, enterprise)
 * @returns {Object} Quotas object with all limits and allowances
 */
export function CalculateQuotas(tier) {
  if (!tier) {
    throw new Error('tier is required');
  }

  const tierDef = TIER_DEFINITIONS[tier];

  if (!tierDef) {
    throw new Error(`Invalid tier: ${tier}`);
  }

  return {
    tier: tierDef.id,
    tierName: tierDef.name,
    quotas: { ...tierDef.quotas },
    limits: { ...tierDef.limits },
    features: [...tierDef.features],
    pricing: {
      price: tierDef.price,
      billingCycle: tierDef.billingCycle,
      teamSize: tierDef.teamSize || 1
    }
  };
}

/**
 * Check if a user can perform an action based on their tier limits
 * @param {string} userId - User identifier
 * @param {string} resource - Resource type (storage, collections, collaborators, etc.)
 * @param {number} requested - Amount requested (optional, defaults to current usage + 1)
 * @returns {boolean} Whether the action is allowed
 */
export function CheckLimits(userId, resource, requested = null) {
  if (!userId || !resource) {
    throw new Error('userId and resource are required');
  }

  const tier = GetTier(userId);
  const quotas = tier.quotas;
  const limits = tier.limits;

  // Get current usage
  const usage = getUserUsage(userId);

  // Check based on resource type
  switch (resource) {
    case 'storage': {
      if (quotas.storageBytes === -1) return true; // Unlimited
      const requestedStorage = requested || usage.storageUsed || 0;
      return requestedStorage <= quotas.storageBytes;
      }

    case 'collections': {
      if (quotas.collections === -1) return true; // Unlimited
      const currentCollections = usage.collections || 0;
      const requestedCollections = requested !== null ? requested : currentCollections + 1;
      return requestedCollections <= quotas.collections;
      }

    case 'privateCollections': {
      if (quotas.privateCollections === -1) return true; // Unlimited
      const currentPrivate = usage.privateCollections || 0;
      const requestedPrivate = requested !== null ? requested : currentPrivate + 1;
      return requestedPrivate <= quotas.privateCollections;
      }

    case 'collaborators': {
      if (quotas.collaborators === -1) return true; // Unlimited
      const currentCollaborators = usage.collaborators || 0;
      const requestedCollaborators = requested !== null ? requested : currentCollaborators + 1;
      return requestedCollaborators <= quotas.collaborators;
      }

    case 'apiCalls': {
      if (quotas.apiCallsPerDay === -1) return true; // Unlimited
      const currentApiCalls = usage.apiCallsToday || 0;
      return currentApiCalls < quotas.apiCallsPerDay;
      }

    case 'fileUpload': {
      if (limits.maxFileUploadSize === -1) return true; // Unlimited
      const fileSize = requested || 0;
      return fileSize <= limits.maxFileUploadSize;
      }

    case 'annotations': {
      if (limits.maxAnnotations === -1) return true; // Unlimited
      const currentAnnotations = usage.annotations || 0;
      const requestedAnnotations = requested !== null ? requested : currentAnnotations + 1;
      return requestedAnnotations <= limits.maxAnnotations;
      }

    case 'sharedLinks': {
      if (limits.maxSharedLinks === -1) return true; // Unlimited
      const currentLinks = usage.sharedLinks || 0;
      const requestedLinks = requested !== null ? requested : currentLinks + 1;
      return requestedLinks <= limits.maxSharedLinks;
      }

    default:
      console.warn(`Unknown resource type: ${resource}`);
      return false;
  }
}

// ============================================================================
// Usage Tracking Functions
// ============================================================================

/**
 * Get current usage for a user
 * @param {string} userId - User identifier
 * @returns {Object} Usage statistics
 */
export function getUserUsage(userId) {
  if (!usageTracking.has(userId)) {
    usageTracking.set(userId, {
      storageUsed: 0,
      collections: 0,
      privateCollections: 0,
      collaborators: 0,
      apiCallsToday: 0,
      annotations: 0,
      sharedLinks: 0,
      lastReset: new Date().toISOString()
    });
  }
  return usageTracking.get(userId);
}

/**
 * Update usage for a user
 * @param {string} userId - User identifier
 * @param {string} resource - Resource type
 * @param {number} delta - Change amount (positive or negative)
 */
export function updateUsage(userId, resource, delta) {
  const usage = getUserUsage(userId);

  if (usage[resource] !== undefined) {
    usage[resource] = Math.max(0, (usage[resource] || 0) + delta);
    usageTracking.set(userId, usage);
  } else {
    console.warn(`Unknown resource for usage tracking: ${resource}`);
  }
}

/**
 * Reset usage counters (e.g., daily API calls)
 * @param {string} userId - User identifier
 */
function resetUsageCounters(userId) {
  const usage = getUserUsage(userId);
  usage.apiCallsToday = 0;
  usage.lastReset = new Date().toISOString();
  usageTracking.set(userId, usage);
}

/**
 * Get usage summary with tier limits
 * @param {string} userId - User identifier
 * @returns {Object} Usage summary with percentages
 */
export function getUsageSummary(userId) {
  const tier = GetTier(userId);
  const usage = getUserUsage(userId);
  const quotas = tier.quotas;
  const limits = tier.limits;

  const calculatePercentage = (used, limit) => {
    if (limit === -1) return 0; // Unlimited
    if (limit === 0) return 100; // Not allowed
    return Math.min(100, (used / limit) * 100);
  };

  return {
    tier: tier.name,
    userId,
    usage: {
      storage: {
        used: usage.storageUsed,
        limit: quotas.storageBytes,
        percentage: calculatePercentage(usage.storageUsed, quotas.storageBytes),
        unlimited: quotas.storageBytes === -1
      },
      collections: {
        used: usage.collections,
        limit: quotas.collections,
        percentage: calculatePercentage(usage.collections, quotas.collections),
        unlimited: quotas.collections === -1
      },
      privateCollections: {
        used: usage.privateCollections,
        limit: quotas.privateCollections,
        percentage: calculatePercentage(usage.privateCollections, quotas.privateCollections),
        unlimited: quotas.privateCollections === -1
      },
      collaborators: {
        used: usage.collaborators,
        limit: quotas.collaborators,
        percentage: calculatePercentage(usage.collaborators, quotas.collaborators),
        unlimited: quotas.collaborators === -1
      },
      apiCallsToday: {
        used: usage.apiCallsToday,
        limit: quotas.apiCallsPerDay,
        percentage: calculatePercentage(usage.apiCallsToday, quotas.apiCallsPerDay),
        unlimited: quotas.apiCallsPerDay === -1
      }
    },
    warnings: generateUsageWarnings(usage, quotas, limits)
  };
}

/**
 * Generate warnings for approaching limits
 */
function generateUsageWarnings(usage, quotas, _limits) {
  const warnings = [];
  const threshold = 0.8; // 80% usage warning

  if (quotas.storageBytes !== -1 && usage.storageUsed / quotas.storageBytes > threshold) {
    warnings.push({
      type: 'storage',
      message: 'Storage usage is above 80%. Consider upgrading or removing unused data.',
      severity: 'warning'
    });
  }

  if (quotas.collections !== -1 && usage.collections / quotas.collections > threshold) {
    warnings.push({
      type: 'collections',
      message: 'Collection limit nearly reached. Upgrade to create more collections.',
      severity: 'warning'
    });
  }

  if (quotas.apiCallsPerDay !== -1 && usage.apiCallsToday / quotas.apiCallsPerDay > threshold) {
    warnings.push({
      type: 'apiCalls',
      message: 'API call limit nearly reached for today.',
      severity: 'warning'
    });
  }

  return warnings;
}

// ============================================================================
// Helper Functions
// ============================================================================

const userMetadata = new Map();

function getUserTierMetadata(userId) {
  return userMetadata.get(userId) || null;
}

function setUserTierMetadata(userId, metadata) {
  userMetadata.set(userId, metadata);
}

/**
 * Get all available tiers
 * @returns {Array} Array of tier definitions
 */
export function getAllTiers() {
  return Object.values(TIER_DEFINITIONS);
}

/**
 * Compare two tiers
 * @param {string} tier1 - First tier
 * @param {string} tier2 - Second tier
 * @returns {number} -1 if tier1 < tier2, 0 if equal, 1 if tier1 > tier2
 */
export function compareTiers(tier1, tier2) {
  const hierarchy = [TIER_TYPES.FREE, TIER_TYPES.PRO, TIER_TYPES.TEAM, TIER_TYPES.ENTERPRISE];
  const index1 = hierarchy.indexOf(tier1);
  const index2 = hierarchy.indexOf(tier2);

  if (index1 === index2) return 0;
  return index1 < index2 ? -1 : 1;
}

/**
 * Check if a feature is available in a tier
 * @param {string} tier - Tier type
 * @param {string} feature - Feature identifier
 * @returns {boolean} Whether the feature is available
 */
export function hasFeature(tier, feature) {
  const tierDef = TIER_DEFINITIONS[tier];
  if (!tierDef) return false;

  const featureMap = {
    'privateCollections': tierDef.quotas.privateCollections !== 0,
    'prioritySupport': tierDef.quotas.prioritySupport,
    'customBranding': tierDef.quotas.customBranding,
    'sso': tierDef.quotas.sso,
    'unlimitedStorage': tierDef.quotas.storageBytes === -1,
    'unlimitedCollections': tierDef.quotas.collections === -1
  };

  return featureMap[feature] || false;
}
