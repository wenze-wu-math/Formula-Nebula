/**
 * Formula Nebula - Billing System Entry Point
 *
 * Export all billing and tier management functionality.
 */

// Core tier management
export {
  GetTier,
  UpgradeTier,
  CalculateQuotas,
  CheckLimits,
  getUserUsage,
  updateUsage,
  getUsageSummary,
  getAllTiers,
  compareTiers,
  hasFeature,
  TIER_TYPES,
  TIER_DEFINITIONS
} from './tiers.js';

// Dashboard UI
export {
  initBillingDashboard,
  refreshDashboard,
  destroyDashboard
} from './dashboard.js';

// Examples (for development/testing)
export {
  example1_GetUserTier,
  example2_UpgradeTier,
  example3_CheckLimits,
  example4_TrackUsage,
  example5_CalculateQuotas,
  example6_InitializeDashboard,
  example7_CreateCollection,
  example8_UploadFile,
  example9_RateLimitedAPI,
  example10_FeatureGate,
  runAllExamples
} from './example.js';

// Test suite
export {
  runTests
} from './tiers.test.js';
