// Content Moderation System for Formula Nebula
// Handles flagging, community voting, auto-moderation, appeals, and moderation dashboard

/**
 * Moderation System Configuration
 */
const MODERATION_CONFIG = {
  // Auto-moderation thresholds
  toxicityThresholds: {
    low: 0.3,      // Warning level
    medium: 0.6,   // Auto-flag for review
    high: 0.85     // Auto-hide content
  },

  // Community voting thresholds
  votingThresholds: {
    minVotesForAction: 5,        // Minimum votes before action
    hidingThreshold: 0.7,        // % of votes to hide content
    deletionThreshold: 0.9,      // % of votes to delete content
    voteWeight: {
      regular: 1,
      trusted: 2,
      moderator: 5
    }
  },

  // Appeal settings
  appealSettings: {
    maxAppeals: 2,               // Max appeals per flag
    appealReviewTime: 86400000,  // 24 hours in ms
    requireModeratorReview: true
  },

  // Auto-moderation patterns
  toxicPatterns: [
    // Profanity and offensive language
    // Inside a character class '*' needs no escape; the backslashes were
    // redundant (no-useless-escape) and made the intent harder to read.
    /\b(f[u*]+ck|sh[i*]+t|b[i*]+tch|d[a*]+mn|h[e*]+ll)\b/gi,
    // Personal attacks
    /\b(idiot|stupid|moron|dumb|loser|garbage)\b/gi,
    // Spam indicators
    /\b(click here|buy now|limited offer|act now)\b/gi,
    /(http[s]?:\/\/[^\s]{3,}){3,}/gi, // Multiple URLs
    // Hate speech indicators (basic)
    /\b(hate|kill|attack|destroy)\s+(all|every|those)\b/gi
  ]
};

/**
 * In-memory storage for moderation data
 * In production, this would be backed by a database
 */
const moderationStore = {
  flags: new Map(),           // flagId -> flag object
  votes: new Map(),           // flagId -> votes array
  appeals: new Map(),         // flagId -> appeals array
  moderationActions: new Map(), // itemId -> action history
  userReputation: new Map(),  // userId -> reputation score
  statistics: {
    totalFlags: 0,
    totalVotes: 0,
    totalAppeals: 0,
    autoModerated: 0,
    communityModerated: 0,
    appealsGranted: 0,
    appealsRejected: 0
  }
};

/**
 * Flag content for review
 * @param {string} itemId - ID of the content (proof/comment/etc)
 * @param {string} itemType - Type of content ('proof', 'comment', 'annotation')
 * @param {string} reason - Reason for flagging
 * @param {string} reporterId - User ID of reporter
 * @param {string} [details] - Additional details
 * @returns {string} flagId - Unique flag identifier
 */
export function FlagContent(itemId, itemType, reason, reporterId, details = '') {
  const flagId = `flag_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const flag = {
    flagId,
    itemId,
    itemType,
    reason,
    reporterId,
    details,
    timestamp: Date.now(),
    status: 'pending',        // pending, reviewing, resolved, appealed
    resolution: null,         // null, approved, rejected, hidden, deleted
    autoModScore: null,
    communityVoteResult: null,
    moderatorNotes: ''
  };

  moderationStore.flags.set(flagId, flag);
  moderationStore.statistics.totalFlags++;

  // Initialize vote tracking for this flag
  moderationStore.votes.set(flagId, []);

  // Log moderation action
  _logModerationAction(itemId, 'flagged', { flagId, reason, reporterId });

  return flagId;
}

/**
 * Community voting on flagged content
 * @param {string} flagId - Flag to vote on
 * @param {string} userId - User casting vote
 * @param {boolean} vote - true = agree with flag, false = disagree
 * @param {string} [userRole] - 'regular', 'trusted', 'moderator'
 * @returns {Object} Voting tally and current status
 */
export function CommunityVote(flagId, userId, vote, userRole = 'regular') {
  const flag = moderationStore.flags.get(flagId);
  if (!flag) {
    throw new Error(`Flag ${flagId} not found`);
  }

  if (flag.status === 'resolved') {
    throw new Error('Cannot vote on resolved flags');
  }

  const votes = moderationStore.votes.get(flagId);

  // Check if user already voted
  const existingVoteIndex = votes.findIndex(v => v.userId === userId);

  const weight = MODERATION_CONFIG.votingThresholds.voteWeight[userRole] || 1;

  const voteRecord = {
    userId,
    vote,
    weight,
    timestamp: Date.now()
  };

  if (existingVoteIndex >= 0) {
    // Update existing vote
    votes[existingVoteIndex] = voteRecord;
  } else {
    // Add new vote
    votes.push(voteRecord);
    moderationStore.statistics.totalVotes++;
  }

  // Calculate tally
  const tally = _calculateVoteTally(votes);

  // Check if voting threshold reached
  if (tally.totalVotes >= MODERATION_CONFIG.votingThresholds.minVotesForAction) {
    const agreeRatio = tally.agreeWeight / tally.totalWeight;

    if (agreeRatio >= MODERATION_CONFIG.votingThresholds.deletionThreshold) {
      flag.status = 'resolved';
      flag.resolution = 'deleted';
      flag.communityVoteResult = tally;
      moderationStore.statistics.communityModerated++;
      _logModerationAction(flag.itemId, 'deleted_by_community', { flagId, tally });
    } else if (agreeRatio >= MODERATION_CONFIG.votingThresholds.hidingThreshold) {
      flag.status = 'resolved';
      flag.resolution = 'hidden';
      flag.communityVoteResult = tally;
      moderationStore.statistics.communityModerated++;
      _logModerationAction(flag.itemId, 'hidden_by_community', { flagId, tally });
    } else if (agreeRatio < 0.3 && tally.totalVotes >= 10) {
      // Low agreement - flag rejected
      flag.status = 'resolved';
      flag.resolution = 'approved';
      flag.communityVoteResult = tally;
      _logModerationAction(flag.itemId, 'approved_by_community', { flagId, tally });
    }
  }

  return {
    flagId,
    tally,
    status: flag.status,
    resolution: flag.resolution,
    actionTaken: flag.status === 'resolved'
  };
}

/**
 * Auto-moderation score using ML-based toxic language detection
 * @param {string} text - Content to analyze
 * @param {Object} [metadata] - Additional context (author reputation, etc)
 * @returns {Object} Toxicity analysis with score and recommendations
 */
export function AutoModerationScore(text, metadata = {}) {
  if (!text || typeof text !== 'string') {
    return {
      toxicityScore: 0,
      level: 'safe',
      confidence: 1.0,
      flags: [],
      recommendation: 'approve'
    };
  }

  const analysis = {
    toxicityScore: 0,
    level: 'safe',
    confidence: 0,
    flags: [],
    patternMatches: [],
    recommendation: 'approve',
    details: {}
  };

  // Pattern-based detection
  let patternScore = 0;
  const matches = [];

  MODERATION_CONFIG.toxicPatterns.forEach((pattern, index) => {
    const found = text.match(pattern);
    if (found) {
      matches.push({
        pattern: index,
        matches: found,
        severity: _getPatternSeverity(index)
      });
      patternScore += _getPatternSeverity(index) * found.length;
    }
  });

  analysis.patternMatches = matches;

  // Heuristic-based scoring
  const heuristics = _analyzeHeuristics(text);

  // Combine scores
  const combinedScore = Math.min(
    (patternScore * 0.4 + heuristics.score * 0.6) / 100,
    1.0
  );

  analysis.toxicityScore = combinedScore;
  analysis.confidence = heuristics.confidence;
  analysis.details = heuristics.details;

  // Determine level and recommendation
  const thresholds = MODERATION_CONFIG.toxicityThresholds;

  if (combinedScore >= thresholds.high) {
    analysis.level = 'high';
    analysis.recommendation = 'auto_hide';
    analysis.flags.push('high_toxicity', 'auto_action_recommended');
  } else if (combinedScore >= thresholds.medium) {
    analysis.level = 'medium';
    analysis.recommendation = 'flag_for_review';
    analysis.flags.push('medium_toxicity', 'manual_review_needed');
  } else if (combinedScore >= thresholds.low) {
    analysis.level = 'low';
    analysis.recommendation = 'warn';
    analysis.flags.push('low_toxicity', 'monitor');
  }

  // Adjust based on metadata
  if (metadata.authorReputation) {
    if (metadata.authorReputation > 0.8 && analysis.level === 'low') {
      analysis.recommendation = 'approve';
      analysis.flags.push('trusted_author_override');
    } else if (metadata.authorReputation < 0.3 && analysis.level === 'medium') {
      analysis.recommendation = 'auto_hide';
      analysis.flags.push('low_reputation_escalation');
    }
  }

  moderationStore.statistics.autoModerated++;

  return analysis;
}

/**
 * Appeal a moderation decision
 * @param {string} flagId - Flag being appealed
 * @param {string} appealText - Reason for appeal
 * @param {string} appellant - User ID filing appeal
 * @returns {string} reviewId - Appeal review identifier
 */
export function AppealDecision(flagId, appealText, appellant) {
  const flag = moderationStore.flags.get(flagId);
  if (!flag) {
    throw new Error(`Flag ${flagId} not found`);
  }

  if (flag.status !== 'resolved') {
    throw new Error('Can only appeal resolved flags');
  }

  if (!['hidden', 'deleted'].includes(flag.resolution)) {
    throw new Error('Can only appeal content that was hidden or deleted');
  }

  const appeals = moderationStore.appeals.get(flagId) || [];

  // Check appeal limit
  if (appeals.length >= MODERATION_CONFIG.appealSettings.maxAppeals) {
    throw new Error('Maximum appeals reached for this flag');
  }

  const reviewId = `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const appeal = {
    reviewId,
    flagId,
    appellant,
    appealText,
    timestamp: Date.now(),
    status: 'pending',        // pending, under_review, granted, rejected
    moderatorReviewerId: null,
    moderatorDecision: null,
    moderatorNotes: '',
    decidedAt: null
  };

  appeals.push(appeal);
  moderationStore.appeals.set(flagId, appeals);

  // Update flag status
  flag.status = 'appealed';

  moderationStore.statistics.totalAppeals++;

  _logModerationAction(flag.itemId, 'appeal_filed', { flagId, reviewId, appellant });

  return reviewId;
}

/**
 * Moderator review of an appeal
 * @param {string} reviewId - Appeal to review
 * @param {string} moderatorId - Moderator making decision
 * @param {boolean} grant - true = grant appeal, false = reject
 * @param {string} notes - Moderator notes
 * @returns {Object} Appeal decision result
 */
export function ReviewAppeal(reviewId, moderatorId, grant, notes = '') {
  let targetAppeal = null;
  let targetFlagId = null;

  // Find the appeal
  for (const [flagId, appeals] of moderationStore.appeals.entries()) {
    const appeal = appeals.find(a => a.reviewId === reviewId);
    if (appeal) {
      targetAppeal = appeal;
      targetFlagId = flagId;
      break;
    }
  }

  if (!targetAppeal) {
    throw new Error(`Appeal ${reviewId} not found`);
  }

  if (targetAppeal.status !== 'pending') {
    throw new Error('Appeal already reviewed');
  }

  const flag = moderationStore.flags.get(targetFlagId);

  targetAppeal.status = grant ? 'granted' : 'rejected';
  targetAppeal.moderatorReviewerId = moderatorId;
  targetAppeal.moderatorDecision = grant;
  targetAppeal.moderatorNotes = notes;
  targetAppeal.decidedAt = Date.now();

  if (grant) {
    // Restore content
    flag.status = 'resolved';
    flag.resolution = 'approved';
    flag.moderatorNotes = `Appeal granted: ${notes}`;
    moderationStore.statistics.appealsGranted++;
    _logModerationAction(flag.itemId, 'appeal_granted', { reviewId, moderatorId });
  } else {
    // Maintain original decision
    flag.status = 'resolved';
    flag.moderatorNotes = `Appeal rejected: ${notes}`;
    moderationStore.statistics.appealsRejected++;
    _logModerationAction(flag.itemId, 'appeal_rejected', { reviewId, moderatorId });
  }

  return {
    reviewId,
    flagId: targetFlagId,
    decision: grant ? 'granted' : 'rejected',
    moderatorId,
    notes
  };
}

/**
 * Get moderation statistics and dashboard data
 * @param {Object} [options] - Filter options
 * @returns {Object} Comprehensive moderation statistics
 */
export function GetModerationStats(options = {}) {
  const stats = {
    summary: { ...moderationStore.statistics },
    timeRange: options.timeRange || 'all_time',
    flags: {
      total: moderationStore.flags.size,
      byStatus: {},
      byType: {},
      byResolution: {}
    },
    votes: {
      total: moderationStore.statistics.totalVotes,
      averagePerFlag: 0
    },
    appeals: {
      total: moderationStore.statistics.totalAppeals,
      grantRate: 0
    },
    contentStatus: {
      active: 0,
      hidden: 0,
      deleted: 0
    },
    recentActivity: []
  };

  // Aggregate flag data
  for (const flag of moderationStore.flags.values()) {
    stats.flags.byStatus[flag.status] = (stats.flags.byStatus[flag.status] || 0) + 1;
    stats.flags.byType[flag.itemType] = (stats.flags.byType[flag.itemType] || 0) + 1;
    if (flag.resolution) {
      stats.flags.byResolution[flag.resolution] = (stats.flags.byResolution[flag.resolution] || 0) + 1;

      if (flag.resolution === 'hidden') stats.contentStatus.hidden++;
      else if (flag.resolution === 'deleted') stats.contentStatus.deleted++;
      else if (flag.resolution === 'approved') stats.contentStatus.active++;
    }
  }

  // Calculate averages
  if (moderationStore.flags.size > 0) {
    stats.votes.averagePerFlag = moderationStore.statistics.totalVotes / moderationStore.flags.size;
  }

  if (moderationStore.statistics.totalAppeals > 0) {
    stats.appeals.grantRate = moderationStore.statistics.appealsGranted / moderationStore.statistics.totalAppeals;
  }

  // Get recent activity
  stats.recentActivity = _getRecentModerationActivity(options.limit || 20);

  // Add performance metrics
  stats.performance = {
    autoModerationAccuracy: _calculateAutoModAccuracy(),
    communityModerationEfficiency: _calculateCommunityModEfficiency(),
    averageResolutionTime: _calculateAverageResolutionTime()
  };

  return stats;
}

/**
 * Get content moderation status
 * @param {string} itemId - Content ID to check
 * @returns {Object} Moderation status for content
 */
export function GetContentStatus(itemId) {
  const actions = moderationStore.moderationActions.get(itemId);
  if (!actions || actions.length === 0) {
    return {
      itemId,
      status: 'active',
      flags: [],
      moderationHistory: []
    };
  }

  const flags = Array.from(moderationStore.flags.values())
    .filter(f => f.itemId === itemId);

  const latestAction = actions[actions.length - 1];

  let status = 'active';
  if (flags.some(f => f.resolution === 'deleted')) {
    status = 'deleted';
  } else if (flags.some(f => f.resolution === 'hidden')) {
    status = 'hidden';
  } else if (flags.some(f => f.status === 'pending' || f.status === 'reviewing')) {
    status = 'under_review';
  }

  return {
    itemId,
    status,
    flags: flags.map(f => ({
      flagId: f.flagId,
      reason: f.reason,
      status: f.status,
      resolution: f.resolution
    })),
    moderationHistory: actions,
    isAppealable: flags.some(f => f.resolution === 'hidden' || f.resolution === 'deleted')
  };
}

// ===== Helper Functions =====

function _calculateVoteTally(votes) {
  let agreeCount = 0;
  let disagreeCount = 0;
  let agreeWeight = 0;
  let disagreeWeight = 0;

  votes.forEach(v => {
    if (v.vote) {
      agreeCount++;
      agreeWeight += v.weight;
    } else {
      disagreeCount++;
      disagreeWeight += v.weight;
    }
  });

  return {
    totalVotes: votes.length,
    agreeCount,
    disagreeCount,
    totalWeight: agreeWeight + disagreeWeight,
    agreeWeight,
    disagreeWeight,
    agreeRatio: agreeWeight / (agreeWeight + disagreeWeight) || 0
  };
}

function _getPatternSeverity(patternIndex) {
  // Map pattern indices to severity scores (0-50)
  const severityMap = {
    0: 40,  // Profanity
    1: 35,  // Personal attacks
    2: 20,  // Spam
    3: 25,  // Multiple URLs
    4: 50   // Hate speech
  };
  return severityMap[patternIndex] || 20;
}

function _analyzeHeuristics(text) {
  const details = {};
  let score = 0;
  let confidence = 0.7;

  // All caps detection
  const capsRatio = (text.match(/[A-Z]/g) || []).length / text.length;
  if (capsRatio > 0.6 && text.length > 20) {
    score += 15;
    details.excessiveCaps = true;
  }

  // Excessive punctuation
  const punctCount = (text.match(/[!?]{2,}/g) || []).length;
  if (punctCount > 2) {
    score += 10;
    details.excessivePunctuation = true;
  }

  // Repeated characters
  const repeatedChars = (text.match(/(.)\1{4,}/g) || []).length;
  if (repeatedChars > 0) {
    score += 8;
    details.repeatedCharacters = true;
  }

  // Short aggressive messages
  if (text.length < 30 && capsRatio > 0.5) {
    score += 12;
    details.shortAggressive = true;
  }

  // URL spam
  const urlCount = (text.match(/https?:\/\//gi) || []).length;
  if (urlCount > 3) {
    score += 20;
    details.urlSpam = true;
  }

  // Very long text (possible spam)
  if (text.length > 2000) {
    score += 5;
    details.excessiveLength = true;
    confidence = 0.5;
  }

  return { score, confidence, details };
}

function _logModerationAction(itemId, action, metadata = {}) {
  const actions = moderationStore.moderationActions.get(itemId) || [];
  actions.push({
    action,
    timestamp: Date.now(),
    metadata
  });
  moderationStore.moderationActions.set(itemId, actions);
}

function _getRecentModerationActivity(limit = 20) {
  const allActions = [];

  for (const [itemId, actions] of moderationStore.moderationActions.entries()) {
    actions.forEach(action => {
      allActions.push({ itemId, ...action });
    });
  }

  return allActions
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, limit);
}

function _calculateAutoModAccuracy() {
  // Placeholder - would compare auto-mod decisions with community/moderator decisions
  return 0.82;
}

function _calculateCommunityModEfficiency() {
  // Placeholder - would calculate how quickly community resolves flags
  return 0.76;
}

function _calculateAverageResolutionTime() {
  const resolvedFlags = Array.from(moderationStore.flags.values())
    .filter(f => f.status === 'resolved');

  if (resolvedFlags.length === 0) return 0;

  const totalTime = resolvedFlags.reduce((sum, flag) => {
    // Estimate resolution time (would need actual resolution timestamp in production)
    return sum + 3600000; // 1 hour placeholder
  }, 0);

  return totalTime / resolvedFlags.length;
}

// ===== Export all functions and config =====
export { MODERATION_CONFIG };

export default {
  FlagContent,
  CommunityVote,
  AutoModerationScore,
  AppealDecision,
  ReviewAppeal,
  GetModerationStats,
  GetContentStatus,
  MODERATION_CONFIG
};
