/**
 * Formula Nebula - Billing Tiers Test Suite
 *
 * Unit tests for the billing and tier management system.
 */

import {
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
  TIER_TYPES
} from './tiers.js';

// ============================================================================
// Test Suite
// ============================================================================

export function runTests() {
  console.log('🧪 Running Billing Tiers Test Suite\n');

  let passed = 0;
  let failed = 0;

  const tests = [
    test_GetTier_DefaultsToFree,
    test_GetTier_ReturnsCorrectTier,
    test_UpgradeTier_Success,
    test_UpgradeTier_InvalidTier,
    test_UpgradeTier_DowngradeBlocked,
    test_CalculateQuotas_Free,
    test_CalculateQuotas_Pro,
    test_CalculateQuotas_Team,
    test_CalculateQuotas_Enterprise,
    test_CheckLimits_Storage,
    test_CheckLimits_Collections,
    test_CheckLimits_PrivateCollections,
    test_CheckLimits_ApiCalls,
    test_CheckLimits_FileUpload,
    test_UpdateUsage_Increment,
    test_UpdateUsage_Decrement,
    test_GetUsageSummary_Basic,
    test_GetUsageSummary_Warnings,
    test_GetAllTiers,
    test_CompareTiers,
    test_HasFeature_Free,
    test_HasFeature_Pro,
    test_HasFeature_Team
  ];

  tests.forEach(test => {
    try {
      test();
      console.log(`✅ ${test.name}`);
      passed++;
    } catch (error) {
      console.error(`❌ ${test.name}`);
      console.error(`   Error: ${error.message}`);
      failed++;
    }
  });

  console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed`);
  return { passed, failed };
}

// ============================================================================
// Test Cases
// ============================================================================

function test_GetTier_DefaultsToFree() {
  const userId = 'test_user_1';
  const tier = GetTier(userId);

  assert(tier.id === TIER_TYPES.FREE, 'Should default to FREE tier');
  assert(tier.name === 'Free', 'Tier name should be Free');
  assert(tier.quotas.storageBytes === 1 * 1024 * 1024 * 1024, 'Storage should be 1 GB');
}

function test_GetTier_ReturnsCorrectTier() {
  const userId = 'test_user_2';

  UpgradeTier(userId, TIER_TYPES.PRO);
  const tier = GetTier(userId);

  assert(tier.id === TIER_TYPES.PRO, 'Should return PRO tier');
  assert(tier.quotas.storageBytes === -1, 'Storage should be unlimited');
}

function test_UpgradeTier_Success() {
  const userId = 'test_user_3';

  const result = UpgradeTier(userId, TIER_TYPES.PRO);

  assert(result.success === true, 'Upgrade should succeed');
  assert(result.newTier.id === TIER_TYPES.PRO, 'New tier should be PRO');
  assert(result.previousTier.id === TIER_TYPES.FREE, 'Previous tier should be FREE');
}

function test_UpgradeTier_InvalidTier() {
  const userId = 'test_user_4';

  try {
    UpgradeTier(userId, 'invalid_tier');
    throw new Error('Should have thrown an error');
  } catch (error) {
    assert(error.message.includes('Invalid tier'), 'Should throw invalid tier error');
  }
}

function test_UpgradeTier_DowngradeBlocked() {
  const userId = 'test_user_5';

  UpgradeTier(userId, TIER_TYPES.TEAM);
  const result = UpgradeTier(userId, TIER_TYPES.FREE);

  assert(result.success === false, 'Downgrade should be blocked');
  assert(result.error.includes('Downgrade not allowed'), 'Should have downgrade error');
}

function test_CalculateQuotas_Free() {
  const quotas = CalculateQuotas(TIER_TYPES.FREE);

  assert(quotas.tier === TIER_TYPES.FREE, 'Tier should be FREE');
  assert(quotas.quotas.storageBytes === 1 * 1024 * 1024 * 1024, 'Storage should be 1 GB');
  assert(quotas.quotas.collections === 5, 'Collections should be 5');
  assert(quotas.quotas.privateCollections === 0, 'Private collections should be 0');
  assert(quotas.pricing.price === 0, 'Price should be 0');
}

function test_CalculateQuotas_Pro() {
  const quotas = CalculateQuotas(TIER_TYPES.PRO);

  assert(quotas.tier === TIER_TYPES.PRO, 'Tier should be PRO');
  assert(quotas.quotas.storageBytes === -1, 'Storage should be unlimited');
  assert(quotas.quotas.collections === -1, 'Collections should be unlimited');
  assert(quotas.pricing.price === 9.99, 'Price should be 9.99');
}

function test_CalculateQuotas_Team() {
  const quotas = CalculateQuotas(TIER_TYPES.TEAM);

  assert(quotas.tier === TIER_TYPES.TEAM, 'Tier should be TEAM');
  assert(quotas.quotas.sso === true, 'SSO should be enabled');
  assert(quotas.quotas.prioritySupport === true, 'Priority support should be enabled');
  assert(quotas.pricing.price === 49.00, 'Price should be 49.00');
  assert(quotas.pricing.teamSize === 5, 'Team size should be 5');
}

function test_CalculateQuotas_Enterprise() {
  const quotas = CalculateQuotas(TIER_TYPES.ENTERPRISE);

  assert(quotas.tier === TIER_TYPES.ENTERPRISE, 'Tier should be ENTERPRISE');
  assert(quotas.quotas.collaborators === -1, 'Collaborators should be unlimited');
  assert(quotas.pricing.price === null, 'Price should be custom (null)');
}

function test_CheckLimits_Storage() {
  const userId = 'test_user_10';

  // Free tier: 1 GB limit
  updateUsage(userId, 'storageUsed', 500 * 1024 * 1024); // 500 MB

  assert(CheckLimits(userId, 'storage') === true, 'Should allow within limit');

  updateUsage(userId, 'storageUsed', 600 * 1024 * 1024); // Total 1.1 GB

  assert(CheckLimits(userId, 'storage') === false, 'Should block over limit');
}

function test_CheckLimits_Collections() {
  const userId = 'test_user_11';

  // Free tier: 5 collections
  for (let i = 0; i < 4; i++) {
    updateUsage(userId, 'collections', 1);
  }

  assert(CheckLimits(userId, 'collections') === true, 'Should allow 5th collection');

  updateUsage(userId, 'collections', 1); // Now at 5

  assert(CheckLimits(userId, 'collections') === false, 'Should block 6th collection');
}

function test_CheckLimits_PrivateCollections() {
  const userId = 'test_user_12';

  // Free tier: 0 private collections
  assert(CheckLimits(userId, 'privateCollections') === false, 'Free tier cannot create private');

  // Upgrade to Pro
  UpgradeTier(userId, TIER_TYPES.PRO);

  assert(CheckLimits(userId, 'privateCollections') === true, 'Pro tier can create private');
}

function test_CheckLimits_ApiCalls() {
  const userId = 'test_user_13';

  // Free tier: 100 API calls per day
  for (let i = 0; i < 99; i++) {
    updateUsage(userId, 'apiCallsToday', 1);
  }

  assert(CheckLimits(userId, 'apiCalls') === true, 'Should allow 100th call');

  updateUsage(userId, 'apiCallsToday', 1); // Now at 100

  assert(CheckLimits(userId, 'apiCalls') === false, 'Should block 101st call');
}

function test_CheckLimits_FileUpload() {
  const userId = 'test_user_14';

  // Free tier: 10 MB max file size
  const smallFile = 5 * 1024 * 1024; // 5 MB
  const largeFile = 15 * 1024 * 1024; // 15 MB

  assert(CheckLimits(userId, 'fileUpload', smallFile) === true, 'Should allow 5 MB file');
  assert(CheckLimits(userId, 'fileUpload', largeFile) === false, 'Should block 15 MB file');
}

function test_UpdateUsage_Increment() {
  const userId = 'test_user_20';

  updateUsage(userId, 'collections', 5);

  const usage = getUserUsage(userId);

  assert(usage.collections === 5, 'Collections should be 5');
}

function test_UpdateUsage_Decrement() {
  const userId = 'test_user_21';

  updateUsage(userId, 'collections', 10);
  updateUsage(userId, 'collections', -3);

  const usage = getUserUsage(userId);

  assert(usage.collections === 7, 'Collections should be 7');
}

function test_GetUsageSummary_Basic() {
  const userId = 'test_user_30';

  updateUsage(userId, 'storageUsed', 500 * 1024 * 1024); // 500 MB
  updateUsage(userId, 'collections', 2);

  const summary = getUsageSummary(userId);

  assert(summary.tier === 'Free', 'Tier should be Free');
  assert(summary.usage.storage.used === 500 * 1024 * 1024, 'Storage usage correct');
  assert(summary.usage.collections.used === 2, 'Collections usage correct');
}

function test_GetUsageSummary_Warnings() {
  const userId = 'test_user_31';

  // Use 90% of storage (warning threshold is 80%)
  updateUsage(userId, 'storageUsed', 900 * 1024 * 1024); // 900 MB

  const summary = getUsageSummary(userId);

  assert(summary.warnings.length > 0, 'Should have warnings');
  assert(
    summary.warnings.some(w => w.type === 'storage'),
    'Should have storage warning'
  );
}

function test_GetAllTiers() {
  const tiers = getAllTiers();

  assert(tiers.length === 4, 'Should return 4 tiers');
  assert(tiers.some(t => t.id === TIER_TYPES.FREE), 'Should include FREE');
  assert(tiers.some(t => t.id === TIER_TYPES.PRO), 'Should include PRO');
  assert(tiers.some(t => t.id === TIER_TYPES.TEAM), 'Should include TEAM');
  assert(tiers.some(t => t.id === TIER_TYPES.ENTERPRISE), 'Should include ENTERPRISE');
}

function test_CompareTiers() {
  assert(compareTiers(TIER_TYPES.FREE, TIER_TYPES.PRO) === -1, 'FREE < PRO');
  assert(compareTiers(TIER_TYPES.PRO, TIER_TYPES.PRO) === 0, 'PRO == PRO');
  assert(compareTiers(TIER_TYPES.TEAM, TIER_TYPES.FREE) === 1, 'TEAM > FREE');
  assert(compareTiers(TIER_TYPES.ENTERPRISE, TIER_TYPES.TEAM) === 1, 'ENTERPRISE > TEAM');
}

function test_HasFeature_Free() {
  assert(hasFeature(TIER_TYPES.FREE, 'privateCollections') === false, 'No private collections');
  assert(hasFeature(TIER_TYPES.FREE, 'sso') === false, 'No SSO');
  assert(hasFeature(TIER_TYPES.FREE, 'unlimitedStorage') === false, 'No unlimited storage');
}

function test_HasFeature_Pro() {
  assert(hasFeature(TIER_TYPES.PRO, 'privateCollections') === true, 'Has private collections');
  assert(hasFeature(TIER_TYPES.PRO, 'unlimitedStorage') === true, 'Has unlimited storage');
  assert(hasFeature(TIER_TYPES.PRO, 'sso') === false, 'No SSO');
}

function test_HasFeature_Team() {
  assert(hasFeature(TIER_TYPES.TEAM, 'privateCollections') === true, 'Has private collections');
  assert(hasFeature(TIER_TYPES.TEAM, 'sso') === true, 'Has SSO');
  assert(hasFeature(TIER_TYPES.TEAM, 'prioritySupport') === true, 'Has priority support');
}

// ============================================================================
// Test Utilities
// ============================================================================

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

// ============================================================================
// Run Tests if Executed Directly
// ============================================================================

if (import.meta.url === `file://${process.argv[1]}`) {
  runTests();
}
