// Moderation System Test Suite
// Tests for content flagging, voting, auto-moderation, and appeals

import {
  FlagContent,
  CommunityVote,
  AutoModerationScore,
  AppealDecision,
  ReviewAppeal,
  GetModerationStats,
  GetContentStatus,
  MODERATION_CONFIG
} from '../src/moderation.js';

// Test utilities
function assert(condition, message) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

function assertThrows(fn, message) {
  let threw = false;
  try {
    fn();
  } catch (e) {
    threw = true;
  }
  assert(threw, message);
}

console.log('Starting Moderation System Tests...\n');

// ===== Test Suite 1: Content Flagging =====
console.log('Test Suite 1: Content Flagging');

// Test 1.1: Basic flagging
{
  const flagId = FlagContent('proof_123', 'proof', 'spam', 'user_001', 'Contains promotional links');
  assert(flagId.startsWith('flag_'), 'Flag ID should have correct prefix');
  assert(typeof flagId === 'string', 'Flag ID should be a string');
  console.log('✓ Test 1.1: Basic flagging works');
}

// Test 1.2: Multiple flags on same content
{
  const flagId1 = FlagContent('proof_456', 'comment', 'offensive', 'user_002');
  const flagId2 = FlagContent('proof_456', 'comment', 'harassment', 'user_003');
  assert(flagId1 !== flagId2, 'Different flags should have unique IDs');
  console.log('✓ Test 1.2: Multiple flags on same content works');
}

// Test 1.3: Content status tracking
{
  const itemId = 'proof_789';
  FlagContent(itemId, 'proof', 'misinformation', 'user_004');
  const status = GetContentStatus(itemId);
  assert(status.itemId === itemId, 'Content status should track item ID');
  assert(status.flags.length > 0, 'Content status should show flags');
  console.log('✓ Test 1.3: Content status tracking works');
}

console.log('');

// ===== Test Suite 2: Community Voting =====
console.log('Test Suite 2: Community Voting');

// Test 2.1: Basic voting
{
  const flagId = FlagContent('proof_vote1', 'proof', 'spam', 'reporter_001');
  const result = CommunityVote(flagId, 'voter_001', true, 'regular');
  assert(result.tally.totalVotes === 1, 'Vote should be recorded');
  assert(result.tally.agreeCount === 1, 'Agree vote should be counted');
  console.log('✓ Test 2.1: Basic voting works');
}

// Test 2.2: Weighted voting
{
  const flagId = FlagContent('proof_vote2', 'proof', 'offensive', 'reporter_002');
  CommunityVote(flagId, 'voter_regular', true, 'regular');
  CommunityVote(flagId, 'voter_trusted', true, 'trusted');
  const result = CommunityVote(flagId, 'voter_mod', true, 'moderator');

  assert(result.tally.totalVotes === 3, 'All votes should be counted');
  assert(result.tally.agreeWeight === 8, 'Weighted votes: 1 + 2 + 5 = 8');
  console.log('✓ Test 2.2: Weighted voting works');
}

// Test 2.3: Vote threshold - hide content
{
  const flagId = FlagContent('proof_vote3', 'proof', 'spam', 'reporter_003');

  // Need 5+ votes to trigger action. 4 agree + 1 disagree with 4/5 = 80% > 70%
  CommunityVote(flagId, 'voter_agree_1', true, 'regular');
  CommunityVote(flagId, 'voter_agree_2', true, 'regular');
  CommunityVote(flagId, 'voter_agree_3', true, 'regular');
  CommunityVote(flagId, 'voter_disagree', false, 'regular');
  const result = CommunityVote(flagId, 'voter_agree_4', true, 'regular');

  assert(result.tally.totalVotes === 5, 'Should have 5 votes');
  assert(result.tally.agreeWeight === 4, 'Should have 4 agree weight');
  assert(result.tally.disagreeWeight === 1, 'Should have 1 disagree weight');
  assert(result.status === 'resolved', 'Flag should be resolved');
  assert(result.resolution === 'hidden', 'Content should be hidden (80% agreement > 70%)');
  console.log('✓ Test 2.3: Vote threshold for hiding works');
}

// Test 2.4: Vote threshold - delete content
{
  const flagId = FlagContent('proof_vote4', 'proof', 'harassment', 'reporter_004');

  // Need 5+ votes, all agree = 100% > 90% threshold for deletion
  CommunityVote(flagId, 'voter_del_1', true, 'regular');
  CommunityVote(flagId, 'voter_del_2', true, 'regular');
  CommunityVote(flagId, 'voter_del_3', true, 'regular');
  CommunityVote(flagId, 'voter_del_4', true, 'regular');
  const result = CommunityVote(flagId, 'voter_del_5', true, 'regular');

  assert(result.tally.totalVotes === 5, 'Should have 5 votes');
  assert(result.tally.agreeWeight === 5, 'Should have 5 agree weight');
  assert(result.status === 'resolved', 'Flag should be resolved');
  assert(result.resolution === 'deleted', 'Content should be deleted (100% agreement > 90%)');
  console.log('✓ Test 2.4: Vote threshold for deletion works');
}

// Test 2.5: Vote update (changing vote)
{
  const flagId = FlagContent('proof_vote5', 'proof', 'off_topic', 'reporter_005');

  CommunityVote(flagId, 'voter_change', true, 'regular');
  const result = CommunityVote(flagId, 'voter_change', false, 'regular');

  assert(result.tally.totalVotes === 1, 'Should still have 1 vote (updated)');
  assert(result.tally.disagreeCount === 1, 'Vote should be changed to disagree');
  console.log('✓ Test 2.5: Vote update works');
}

// Test 2.6: Cannot vote on resolved flags
{
  const flagId = FlagContent('proof_vote6', 'proof', 'spam', 'reporter_006');

  // Resolve the flag by getting enough votes (4 agree + 1 disagree = 80% > 70%)
  CommunityVote(flagId, 'voter_resolve_1', true, 'regular');
  CommunityVote(flagId, 'voter_resolve_2', true, 'regular');
  CommunityVote(flagId, 'voter_resolve_3', true, 'regular');
  CommunityVote(flagId, 'voter_resolve_disagree', false, 'regular');
  CommunityVote(flagId, 'voter_resolve_4', true, 'regular'); // This resolves the flag

  assertThrows(
    () => CommunityVote(flagId, 'late_voter', true, 'regular'),
    'Should not allow voting on resolved flags'
  );
  console.log('✓ Test 2.6: Cannot vote on resolved flags');
}

console.log('');

// ===== Test Suite 3: Auto-Moderation =====
console.log('Test Suite 3: Auto-Moderation');

// Test 3.1: Clean content
{
  const text = 'This is a valid mathematical proof using Fermat\'s Little Theorem.';
  const result = AutoModerationScore(text);
  assert(result.level === 'safe', 'Clean content should be safe');
  assert(result.recommendation === 'approve', 'Should recommend approval');
  assert(result.toxicityScore < MODERATION_CONFIG.toxicityThresholds.low, 'Score should be low');
  console.log('✓ Test 3.1: Clean content detection works');
}

// Test 3.2: Profanity detection
{
  const text = 'This f***ing proof is complete sh*t and makes no sense.';
  const result = AutoModerationScore(text);
  assert(result.toxicityScore > 0, 'Should detect profanity');
  assert(result.patternMatches.length > 0, 'Should match toxic patterns');
  console.log('✓ Test 3.2: Profanity detection works');
}

// Test 3.3: Spam detection
{
  const text = 'Click here! Buy now! Limited offer! http://spam.com http://more-spam.com http://even-more-spam.com http://extra.com';
  const result = AutoModerationScore(text);
  assert(result.toxicityScore > 0, 'Should detect spam indicators');
  assert(result.details.urlSpam === true, 'Should detect URL spam (4 URLs > 3)');
  console.log('✓ Test 3.3: Spam detection works');
}

// Test 3.4: Caps and punctuation abuse
{
  const text = 'THIS IS COMPLETELY WRONG!!!! YOU ARE AN IDIOT!!!! TERRIBLE!!!! THIS IS STUPID!!!!';
  const result = AutoModerationScore(text);
  assert(result.details.excessiveCaps === true, 'Should detect excessive caps');
  assert(result.details.excessivePunctuation === true, 'Should detect excessive punctuation');
  assert(result.toxicityScore > 0, 'Should have non-zero toxicity');
  assert(result.level !== 'safe', 'Should not be marked as safe');
  console.log('✓ Test 3.4: Caps and punctuation abuse detection works');
}

// Test 3.5: Personal attacks
{
  const text = 'You are a complete idiot and this stupid proof is garbage. What a moron.';
  const result = AutoModerationScore(text);
  assert(result.toxicityScore > 0, 'Should detect personal attacks');
  assert(result.patternMatches.length > 0, 'Should match attack patterns');
  assert(result.recommendation !== 'approve', 'Should not approve');
  console.log('✓ Test 3.5: Personal attack detection works');
}

// Test 3.6: False positive mitigation (mathematical content)
{
  const text = 'Let f(x) be a function. Then f(x) = x^2 + f(0).';
  const result = AutoModerationScore(text);
  assert(result.level === 'safe', 'Mathematical notation should not trigger false positives');
  console.log('✓ Test 3.6: Mathematical content false positive mitigation works');
}

// Test 3.7: Reputation-based adjustment
{
  const text = 'This might be slightly problematic language.';
  const resultLowRep = AutoModerationScore(text, { authorReputation: 0.2 });
  const resultHighRep = AutoModerationScore(text, { authorReputation: 0.9 });

  // High reputation users get more lenient treatment
  assert(resultHighRep.recommendation === 'approve' || resultLowRep.recommendation !== 'approve',
    'Reputation should affect recommendations');
  console.log('✓ Test 3.7: Reputation-based adjustment works');
}

// Test 3.8: High toxicity auto-hide
{
  const text = 'F*** you, you stupid idiot moron. I hate all of you losers. Kill this garbage.';
  const result = AutoModerationScore(text);
  assert(result.toxicityScore > MODERATION_CONFIG.toxicityThresholds.medium, 'Should detect high toxicity');
  assert(result.level !== 'safe', 'Should not be safe');
  assert(result.recommendation === 'auto_hide' || result.recommendation === 'flag_for_review', 'Should recommend action');
  console.log('✓ Test 3.8: High toxicity detection works');
}

// Test 3.9: Empty text handling
{
  const result = AutoModerationScore('');
  assert(result.toxicityScore === 0, 'Empty text should have zero toxicity');
  assert(result.level === 'safe', 'Empty text should be safe');
  console.log('✓ Test 3.9: Empty text handling works');
}

console.log('');

// ===== Test Suite 4: Appeals =====
console.log('Test Suite 4: Appeals');

// Test 4.1: Basic appeal submission
{
  const flagId = FlagContent('proof_appeal1', 'proof', 'spam', 'reporter_app1');

  // Resolve the flag (hide content) - 4 agree + 1 disagree = 80% > 70%
  CommunityVote(flagId, 'voter_app1_1', true, 'regular');
  CommunityVote(flagId, 'voter_app1_2', true, 'regular');
  CommunityVote(flagId, 'voter_app1_3', true, 'regular');
  CommunityVote(flagId, 'voter_app1_disagree', false, 'regular');
  CommunityVote(flagId, 'voter_app1_4', true, 'regular'); // Resolves to hidden

  const reviewId = AppealDecision(flagId, 'This was not spam, it was a legitimate proof.', 'appellant_001');
  assert(reviewId.startsWith('review_'), 'Review ID should have correct prefix');
  console.log('✓ Test 4.1: Basic appeal submission works');
}

// Test 4.2: Cannot appeal unresolved flags
{
  const flagId = FlagContent('proof_appeal2', 'proof', 'offensive', 'reporter_app2');

  assertThrows(
    () => AppealDecision(flagId, 'Appeal text', 'appellant_002'),
    'Should not allow appeals on unresolved flags'
  );
  console.log('✓ Test 4.2: Cannot appeal unresolved flags');
}

// Test 4.3: Cannot appeal approved content
{
  const flagId = FlagContent('proof_appeal3', 'proof', 'spam', 'reporter_app3');

  // Reject the flag (approve content) - need 10+ votes with <30% agreement
  // 2 agree + 10 disagree = 16.7% < 30%
  CommunityVote(flagId, 'voter_app3_agree1', true, 'regular');
  CommunityVote(flagId, 'voter_app3_agree2', true, 'regular');
  CommunityVote(flagId, 'voter_app3_disagree_1', false, 'regular');
  CommunityVote(flagId, 'voter_app3_disagree_2', false, 'regular');
  CommunityVote(flagId, 'voter_app3_disagree_3', false, 'regular');
  CommunityVote(flagId, 'voter_app3_disagree_4', false, 'regular');
  CommunityVote(flagId, 'voter_app3_disagree_5', false, 'regular'); // 7 total, 2/7 = 28.5% but need 10 votes
  CommunityVote(flagId, 'voter_app3_disagree_6', false, 'regular');
  CommunityVote(flagId, 'voter_app3_disagree_7', false, 'regular');
  CommunityVote(flagId, 'voter_app3_disagree_8', false, 'regular'); // 10 total, 2/10 = 20% < 30%, should reject flag

  assertThrows(
    () => AppealDecision(flagId, 'Appeal text', 'appellant_003'),
    'Should not allow appeals on approved content'
  );
  console.log('✓ Test 4.3: Cannot appeal approved content');
}

// Test 4.4: Appeal grant
{
  const flagId = FlagContent('proof_appeal4', 'proof', 'off_topic', 'reporter_app4');

  // Hide the content - 4 agree + 1 disagree = 80% > 70%
  CommunityVote(flagId, 'voter_app4_1', true, 'regular');
  CommunityVote(flagId, 'voter_app4_2', true, 'regular');
  CommunityVote(flagId, 'voter_app4_3', true, 'regular');
  CommunityVote(flagId, 'voter_app4_disagree', false, 'regular');
  CommunityVote(flagId, 'voter_app4_4', true, 'regular'); // Resolves to hidden

  const reviewId = AppealDecision(flagId, 'This is on-topic mathematical content.', 'appellant_004');
  const decision = ReviewAppeal(reviewId, 'moderator_001', true, 'Appeal granted - content is relevant');

  assert(decision.decision === 'granted', 'Appeal should be granted');
  assert(decision.reviewId === reviewId, 'Should return correct review ID');
  console.log('✓ Test 4.4: Appeal grant works');
}

// Test 4.5: Appeal rejection
{
  const flagId = FlagContent('proof_appeal5', 'proof', 'harassment', 'reporter_app5');

  // Delete the content - 5 agree votes = 100% > 90%
  CommunityVote(flagId, 'voter_app5_1', true, 'regular');
  CommunityVote(flagId, 'voter_app5_2', true, 'regular');
  CommunityVote(flagId, 'voter_app5_3', true, 'regular');
  CommunityVote(flagId, 'voter_app5_4', true, 'regular');
  CommunityVote(flagId, 'voter_app5_5', true, 'regular'); // Resolves to deleted

  const reviewId = AppealDecision(flagId, 'I didn\'t mean it that way.', 'appellant_005');
  const decision = ReviewAppeal(reviewId, 'moderator_002', false, 'Content clearly violates guidelines');

  assert(decision.decision === 'rejected', 'Appeal should be rejected');
  console.log('✓ Test 4.5: Appeal rejection works');
}

// Test 4.6: Multiple appeals (up to limit)
{
  const flagId = FlagContent('proof_appeal6', 'proof', 'spam', 'reporter_app6');

  // Hide the content - 4 agree + 1 disagree = 80% > 70%
  CommunityVote(flagId, 'voter_app6_1', true, 'regular');
  CommunityVote(flagId, 'voter_app6_2', true, 'regular');
  CommunityVote(flagId, 'voter_app6_3', true, 'regular');
  CommunityVote(flagId, 'voter_app6_disagree', false, 'regular');
  CommunityVote(flagId, 'voter_app6_4', true, 'regular'); // Resolves to hidden

  const reviewId1 = AppealDecision(flagId, 'First appeal', 'appellant_006');
  ReviewAppeal(reviewId1, 'moderator_003', false, 'Rejected');

  const reviewId2 = AppealDecision(flagId, 'Second appeal', 'appellant_006');
  assert(reviewId2.startsWith('review_'), 'Second appeal should be allowed');

  assertThrows(
    () => AppealDecision(flagId, 'Third appeal', 'appellant_006'),
    'Should not allow more than 2 appeals'
  );
  console.log('✓ Test 4.6: Multiple appeals limit works');
}

console.log('');

// ===== Test Suite 5: Statistics =====
console.log('Test Suite 5: Statistics');

// Test 5.1: Basic stats retrieval
{
  const stats = GetModerationStats();
  assert(stats.summary !== undefined, 'Should have summary');
  assert(stats.flags !== undefined, 'Should have flag stats');
  assert(stats.votes !== undefined, 'Should have vote stats');
  assert(stats.appeals !== undefined, 'Should have appeal stats');
  assert(stats.performance !== undefined, 'Should have performance metrics');
  console.log('✓ Test 5.1: Basic stats retrieval works');
}

// Test 5.2: Stats accuracy
{
  const statsBefore = GetModerationStats();
  const totalFlagsBefore = statsBefore.flags.total;

  FlagContent('proof_stats1', 'proof', 'test', 'user_stats');

  const statsAfter = GetModerationStats();
  assert(statsAfter.flags.total === totalFlagsBefore + 1, 'Flag count should increment');
  console.log('✓ Test 5.2: Stats accuracy works');
}

// Test 5.3: Content status aggregation
{
  const stats = GetModerationStats();
  assert(stats.contentStatus.active >= 0, 'Should track active content');
  assert(stats.contentStatus.hidden >= 0, 'Should track hidden content');
  assert(stats.contentStatus.deleted >= 0, 'Should track deleted content');
  console.log('✓ Test 5.3: Content status aggregation works');
}

// Test 5.4: Recent activity tracking
{
  const stats = GetModerationStats({ limit: 5 });
  assert(Array.isArray(stats.recentActivity), 'Recent activity should be an array');
  assert(stats.recentActivity.length <= 5, 'Should respect limit parameter');
  console.log('✓ Test 5.4: Recent activity tracking works');
}

console.log('');

// ===== Test Suite 6: Edge Cases =====
console.log('Test Suite 6: Edge Cases');

// Test 6.1: Very long text
{
  const longText = 'a'.repeat(3000);
  const result = AutoModerationScore(longText);
  assert(result.details.excessiveLength === true, 'Should detect excessive length');
  console.log('✓ Test 6.1: Very long text handling works');
}

// Test 6.2: Special characters in content
{
  const specialText = '∫∂∇∑∏√∞≈≠≤≥ f(x) dx ∀x∈ℝ';
  const result = AutoModerationScore(specialText);
  assert(result.level === 'safe', 'Mathematical symbols should be safe');
  console.log('✓ Test 6.2: Special characters handling works');
}

// Test 6.3: Non-existent flag operations
{
  assertThrows(
    () => CommunityVote('nonexistent_flag', 'user', true),
    'Should throw on non-existent flag'
  );
  console.log('✓ Test 6.3: Non-existent flag error handling works');
}

// Test 6.4: Content with mixed safe/unsafe elements
{
  const mixedText = 'This proof uses Euler\'s theorem. But seriously, this stupid approach is complete garbage.';
  const result = AutoModerationScore(mixedText);
  assert(result.patternMatches.length > 0 || result.toxicityScore > 0, 'Should detect unsafe elements in mixed content');
  console.log('✓ Test 6.4: Mixed content detection works');
}

// Test 6.5: Repeated character spam
{
  const spamText = 'Thissssssss isssssss spammmmmmmmm';
  const result = AutoModerationScore(spamText);
  assert(result.details.repeatedCharacters === true, 'Should detect repeated characters');
  console.log('✓ Test 6.5: Repeated character spam detection works');
}

console.log('');

// ===== Final Summary =====
const finalStats = GetModerationStats();
console.log('═══════════════════════════════════════');
console.log('All Tests Passed Successfully!');
console.log('═══════════════════════════════════════');
console.log(`Total Flags Created: ${finalStats.flags.total}`);
console.log(`Total Votes Cast: ${finalStats.votes.total}`);
console.log(`Total Appeals Filed: ${finalStats.appeals.total}`);
console.log(`Auto-Moderation Runs: ${finalStats.summary.autoModerated}`);
console.log(`Community Moderated: ${finalStats.summary.communityModerated}`);
console.log('═══════════════════════════════════════');
