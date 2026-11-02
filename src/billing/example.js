/**
 * Formula Nebula - Billing System Integration Example
 *
 * Demonstrates how to integrate the billing and tier system into your application.
 */

import {
  GetTier,
  UpgradeTier,
  CalculateQuotas,
  CheckLimits,
  updateUsage,
  getUsageSummary,
  TIER_TYPES
} from './tiers.js';

import { initBillingDashboard } from './dashboard.js';

// ============================================================================
// Example 1: Basic Tier Information
// ============================================================================

export function example1_GetUserTier() {
  console.log('=== Example 1: Get User Tier ===\n');

  const userId = 'user_123';

  // Get the current tier for a user
  const tier = GetTier(userId);

  console.log('User Tier:', tier.name);
  console.log('Storage Quota:', tier.quotas.storageBytes === -1 ? 'Unlimited' : `${tier.quotas.storageBytes} bytes`);
  console.log('Collections Allowed:', tier.quotas.collections === -1 ? 'Unlimited' : tier.quotas.collections);
  console.log('\nFeatures:');
  tier.features.forEach(feature => console.log(`  - ${feature}`));
}

// ============================================================================
// Example 2: Upgrade User Tier
// ============================================================================

export function example2_UpgradeTier() {
  console.log('\n=== Example 2: Upgrade Tier ===\n');

  const userId = 'user_456';

  // Get current tier
  const currentTier = GetTier(userId);
  console.log('Current Tier:', currentTier.name);

  // Upgrade to Pro
  const upgradeResult = UpgradeTier(userId, TIER_TYPES.PRO, {
    expiresAt: new Date('2027-11-02').toISOString(),
    paymentMethod: 'stripe_pm_123'
  });

  if (upgradeResult.success) {
    console.log('\nUpgrade Successful!');
    console.log('Previous Tier:', upgradeResult.previousTier.name);
    console.log('New Tier:', upgradeResult.newTier.name);
    console.log('Effective Date:', upgradeResult.effectiveDate);
  } else {
    console.log('\nUpgrade Failed:', upgradeResult.error);
  }
}

// ============================================================================
// Example 3: Check Usage Limits
// ============================================================================

export function example3_CheckLimits() {
  console.log('\n=== Example 3: Check Usage Limits ===\n');

  const userId = 'user_789';

  // Simulate creating a collection
  const canCreateCollection = CheckLimits(userId, 'collections');
  console.log('Can create collection?', canCreateCollection ? 'Yes' : 'No - limit reached');

  // Simulate uploading a file
  const fileSize = 5 * 1024 * 1024; // 5 MB
  const canUploadFile = CheckLimits(userId, 'fileUpload', fileSize);
  console.log('Can upload 5MB file?', canUploadFile ? 'Yes' : 'No - file too large');

  // Check storage capacity
  const currentStorageUsed = 500 * 1024 * 1024; // 500 MB
  const canUseStorage = CheckLimits(userId, 'storage', currentStorageUsed);
  console.log('Storage check (500MB)?', canUseStorage ? 'OK' : 'Exceeded limit');
}

// ============================================================================
// Example 4: Track Usage
// ============================================================================

export function example4_TrackUsage() {
  console.log('\n=== Example 4: Track Usage ===\n');

  const userId = 'user_101';

  // Simulate creating collections
  updateUsage(userId, 'collections', 1); // Add 1 collection
  updateUsage(userId, 'collections', 1); // Add another

  // Simulate uploading data
  const uploadSize = 100 * 1024 * 1024; // 100 MB
  updateUsage(userId, 'storageUsed', uploadSize);

  // Get usage summary
  const summary = getUsageSummary(userId);

  console.log('Tier:', summary.tier);
  console.log('\nUsage:');
  console.log('Collections:', `${summary.usage.collections.used} / ${summary.usage.collections.limit === -1 ? '∞' : summary.usage.collections.limit}`);
  console.log('Storage:', `${(summary.usage.storage.used / (1024 * 1024)).toFixed(2)} MB / ${summary.usage.storage.unlimited ? '∞' : (summary.usage.storage.limit / (1024 * 1024 * 1024)) + ' GB'}`);

  if (summary.warnings.length > 0) {
    console.log('\nWarnings:');
    summary.warnings.forEach(warning => {
      console.log(`  [${warning.severity}] ${warning.message}`);
    });
  }
}

// ============================================================================
// Example 5: Calculate Quotas for Different Tiers
// ============================================================================

export function example5_CalculateQuotas() {
  console.log('\n=== Example 5: Calculate Quotas ===\n');

  const tiers = [TIER_TYPES.FREE, TIER_TYPES.PRO, TIER_TYPES.TEAM, TIER_TYPES.ENTERPRISE];

  tiers.forEach(tierType => {
    const quotas = CalculateQuotas(tierType);
    console.log(`\n${quotas.tierName} Tier:`);
    console.log('  Price:', quotas.pricing.price ? `$${quotas.pricing.price}/${quotas.pricing.billingCycle}` : 'Custom');
    console.log('  Storage:', quotas.quotas.storageBytes === -1 ? 'Unlimited' : `${quotas.quotas.storageBytes / (1024 * 1024 * 1024)} GB`);
    console.log('  Collections:', quotas.quotas.collections === -1 ? 'Unlimited' : quotas.quotas.collections);
    console.log('  Private Collections:', quotas.quotas.privateCollections === -1 ? 'Unlimited' : quotas.quotas.privateCollections);
    console.log('  SSO:', quotas.quotas.sso ? 'Yes' : 'No');
  });
}

// ============================================================================
// Example 6: Initialize Billing Dashboard
// ============================================================================

export function example6_InitializeDashboard(containerId = 'billing-dashboard') {
  console.log('\n=== Example 6: Initialize Billing Dashboard ===\n');

  const userId = 'user_dashboard';
  const container = document.getElementById(containerId);

  if (!container) {
    console.error(`Container element '${containerId}' not found`);
    return;
  }

  // Initialize the dashboard
  const dashboard = initBillingDashboard(userId, container, {
    autoRefresh: true,
    refreshInterval: 30000 // Refresh every 30 seconds
  });

  console.log('Billing dashboard initialized');

  // Return dashboard control methods
  return dashboard;
}

// ============================================================================
// Example 7: Real-World Integration - Collection Creation
// ============================================================================

export async function example7_CreateCollection(userId, collectionName, isPrivate = false) {
  console.log('\n=== Example 7: Create Collection with Tier Check ===\n');

  try {
    // Check if user can create another collection
    if (!CheckLimits(userId, 'collections')) {
      const tier = GetTier(userId);
      throw new Error(`Collection limit reached. Upgrade from ${tier.name} to create more collections.`);
    }

    // Check if user can create private collections
    if (isPrivate && !CheckLimits(userId, 'privateCollections')) {
      const tier = GetTier(userId);
      throw new Error(`Private collections not available in ${tier.name} tier. Upgrade to Pro or higher.`);
    }

    // Create the collection (simulated)
    console.log(`Creating collection: ${collectionName}`);
    console.log(`Privacy: ${isPrivate ? 'Private' : 'Public'}`);

    // Update usage
    updateUsage(userId, 'collections', 1);
    if (isPrivate) {
      updateUsage(userId, 'privateCollections', 1);
    }

    console.log('Collection created successfully!');

    return {
      success: true,
      collectionId: `coll_${Date.now()}`,
      name: collectionName,
      private: isPrivate
    };
  } catch (error) {
    console.error('Failed to create collection:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// ============================================================================
// Example 8: Real-World Integration - File Upload
// ============================================================================

export async function example8_UploadFile(userId, fileName, fileSize) {
  console.log('\n=== Example 8: Upload File with Tier Check ===\n');

  try {
    // Check file size limit
    if (!CheckLimits(userId, 'fileUpload', fileSize)) {
      const tier = GetTier(userId);
      const maxSize = tier.limits.maxFileUploadSize;
      throw new Error(
        `File too large. Maximum size for ${tier.name} tier: ${(maxSize / (1024 * 1024)).toFixed(0)} MB`
      );
    }

    // Check storage capacity
    if (!CheckLimits(userId, 'storage')) {
      throw new Error('Storage quota exceeded. Delete files or upgrade your plan.');
    }

    // Upload file (simulated)
    console.log(`Uploading file: ${fileName}`);
    console.log(`Size: ${(fileSize / (1024 * 1024)).toFixed(2)} MB`);

    // Update storage usage
    updateUsage(userId, 'storageUsed', fileSize);

    console.log('File uploaded successfully!');

    return {
      success: true,
      fileId: `file_${Date.now()}`,
      name: fileName,
      size: fileSize
    };
  } catch (error) {
    console.error('Failed to upload file:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// ============================================================================
// Example 9: API Rate Limiting
// ============================================================================

export function example9_RateLimitedAPI(userId) {
  console.log('\n=== Example 9: API Rate Limiting ===\n');

  // Check if user can make API call
  if (!CheckLimits(userId, 'apiCalls')) {
    const tier = GetTier(userId);
    console.log(`API rate limit exceeded for ${tier.name} tier.`);
    console.log('Please wait or upgrade for higher limits.');
    return { success: false, error: 'Rate limit exceeded' };
  }

  // Increment API call counter
  updateUsage(userId, 'apiCallsToday', 1);

  // Make API call (simulated)
  console.log('API call successful');

  return {
    success: true,
    data: { result: 'API response data' }
  };
}

// ============================================================================
// Example 10: Feature Gate
// ============================================================================

export function example10_FeatureGate(userId, featureName) {
  console.log(`\n=== Example 10: Feature Gate - ${featureName} ===\n`);

  const tier = GetTier(userId);

  const featureRequirements = {
    'customBranding': 'team',
    'sso': 'team',
    'prioritySupport': 'team',
    'unlimitedStorage': 'pro',
    'privateCollections': 'pro'
  };

  const requiredTier = featureRequirements[featureName];

  if (!requiredTier) {
    console.log('Feature available to all tiers');
    return true;
  }

  const tierHierarchy = {
    'free': 0,
    'pro': 1,
    'team': 2,
    'enterprise': 3
  };

  const hasAccess = tierHierarchy[tier.id] >= tierHierarchy[requiredTier];

  if (hasAccess) {
    console.log(`Feature '${featureName}' is available in ${tier.name} tier`);
  } else {
    console.log(`Feature '${featureName}' requires ${requiredTier} tier or higher`);
    console.log(`Current tier: ${tier.name}`);
  }

  return hasAccess;
}

// ============================================================================
// Run All Examples
// ============================================================================

export function runAllExamples() {
  example1_GetUserTier();
  example2_UpgradeTier();
  example3_CheckLimits();
  example4_TrackUsage();
  example5_CalculateQuotas();

  // Example 7-10: Simulate real operations
  example7_CreateCollection('user_real', 'My Research Collection', false);
  example7_CreateCollection('user_real', 'Private Notes', true);

  example8_UploadFile('user_real', 'formula_diagram.png', 5 * 1024 * 1024);

  example9_RateLimitedAPI('user_real');

  example10_FeatureGate('user_real', 'privateCollections');
  example10_FeatureGate('user_real', 'sso');
}
