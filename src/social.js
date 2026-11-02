/**
 * ═══════════════════════════════════════════════════════════════
 *  Social Learning Features
 * ═══════════════════════════════════════════════════════════════
 *
 * Features:
 * - User profiles with learning statistics
 * - Follow system for mathematicians
 * - Activity feed (proofs viewed, theorems proved, etc)
 * - Leaderboards (most proofs understood, best contributions)
 * - Badges and achievements system
 */

// ══════════════════════════════════════════════════════════════
// Data Schema
// ══════════════════════════════════════════════════════════════

/**
 * User Profile Schema
 * @typedef {Object} UserProfile
 * @property {string} userId - Unique identifier
 * @property {string} username - Display name
 * @property {string} avatar - Avatar URL or initials
 * @property {string} bio - User biography
 * @property {Date} joinedAt - Registration timestamp
 * @property {Object} stats - Learning statistics
 * @property {number} stats.proofsViewed - Total proofs viewed
 * @property {number} stats.proofsUnderstood - Proofs marked as understood
 * @property {number} stats.theoremsProved - Theorems proved (formal proofs)
 * @property {number} stats.contributionsCount - Total contributions
 * @property {number} stats.learningStreak - Current daily streak
 * @property {number} stats.totalStudyTime - Total study time (minutes)
 * @property {Array<string>} stats.specializations - Mathematical areas
 * @property {Object} preferences - User preferences
 * @property {string} preferences.visibility - 'public' | 'followers' | 'private'
 * @property {boolean} preferences.showActivity - Show activity in feed
 * @property {Array<string>} badges - Array of badge IDs
 * @property {number} level - User level (derived from stats)
 * @property {number} xp - Experience points
 */

/**
 * Follow Relationship Schema
 * @typedef {Object} Follow
 * @property {string} followId - Unique follow ID
 * @property {string} followerId - User who is following
 * @property {string} followingId - User being followed
 * @property {Date} followedAt - Timestamp of follow action
 * @property {boolean} notifications - Receive notifications
 */

/**
 * Activity Schema
 * @typedef {Object} Activity
 * @property {string} activityId - Unique activity ID
 * @property {string} userId - User who performed the activity
 * @property {string} type - Activity type
 * @property {Object} metadata - Activity-specific data
 * @property {Date} timestamp - When activity occurred
 * @property {string} visibility - 'public' | 'followers' | 'private'
 */

/**
 * Badge Schema
 * @typedef {Object} Badge
 * @property {string} badgeId - Unique badge identifier
 * @property {string} name - Badge name
 * @property {string} description - Achievement description
 * @property {string} icon - Icon/emoji representation
 * @property {string} tier - 'bronze' | 'silver' | 'gold' | 'platinum'
 * @property {Object} criteria - Unlock criteria
 * @property {number} rarity - Rarity percentage (0-1)
 */

/**
 * Leaderboard Entry Schema
 * @typedef {Object} LeaderboardEntry
 * @property {number} rank - Current rank
 * @property {string} userId - User identifier
 * @property {string} username - Display name
 * @property {string} avatar - Avatar URL
 * @property {number} score - Score for this metric
 * @property {string} change - Rank change ('up' | 'down' | 'same')
 * @property {number} changeAmount - Amount of rank change
 */

// ══════════════════════════════════════════════════════════════
// Storage Layer (LocalStorage + IndexedDB hybrid)
// ══════════════════════════════════════════════════════════════

const STORAGE_KEYS = {
  CURRENT_USER: 'social:currentUser',
  USER_PROFILES: 'social:profiles',
  FOLLOWS: 'social:follows',
  ACTIVITIES: 'social:activities',
  BADGES: 'social:badges',
  USER_BADGES: 'social:userBadges',
  LEADERBOARD_CACHE: 'social:leaderboardCache',
}

class SocialStorage {
  constructor() {
    this.cache = new Map()
  }

  get(key) {
    if (this.cache.has(key)) {
      return this.cache.get(key)
    }
    const data = localStorage.getItem(key)
    if (!data) return null
    const parsed = JSON.parse(data)
    this.cache.set(key, parsed)
    return parsed
  }

  set(key, value) {
    this.cache.set(key, value)
    localStorage.setItem(key, JSON.stringify(value))
  }

  delete(key) {
    this.cache.delete(key)
    localStorage.removeItem(key)
  }

  // Get all items matching a prefix
  getAllWithPrefix(prefix) {
    const results = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key.startsWith(prefix)) {
        results.push(this.get(key))
      }
    }
    return results
  }
}

const storage = new SocialStorage()

// ══════════════════════════════════════════════════════════════
// Badge Definitions
// ══════════════════════════════════════════════════════════════

export const BADGE_DEFINITIONS = {
  // Exploration Badges
  first_proof: {
    badgeId: 'first_proof',
    name: 'First Steps',
    description: 'Viewed your first proof',
    icon: '👣',
    tier: 'bronze',
    criteria: { proofsViewed: 1 },
    rarity: 1.0,
  },
  curious_explorer: {
    badgeId: 'curious_explorer',
    name: 'Curious Explorer',
    description: 'Viewed 50 different proofs',
    icon: '🔍',
    tier: 'silver',
    criteria: { proofsViewed: 50 },
    rarity: 0.4,
  },
  theorem_hunter: {
    badgeId: 'theorem_hunter',
    name: 'Theorem Hunter',
    description: 'Viewed 200 proofs',
    icon: '🎯',
    tier: 'gold',
    criteria: { proofsViewed: 200 },
    rarity: 0.1,
  },

  // Understanding Badges
  apprentice: {
    badgeId: 'apprentice',
    name: 'Apprentice',
    description: 'Understood 10 proofs',
    icon: '🎓',
    tier: 'bronze',
    criteria: { proofsUnderstood: 10 },
    rarity: 0.6,
  },
  scholar: {
    badgeId: 'scholar',
    name: 'Scholar',
    description: 'Understood 50 proofs',
    icon: '📚',
    tier: 'silver',
    criteria: { proofsUnderstood: 50 },
    rarity: 0.3,
  },
  master: {
    badgeId: 'master',
    name: 'Master Mathematician',
    description: 'Understood 100 proofs',
    icon: '🏆',
    tier: 'gold',
    criteria: { proofsUnderstood: 100 },
    rarity: 0.08,
  },

  // Contribution Badges
  contributor: {
    badgeId: 'contributor',
    name: 'Contributor',
    description: 'Made your first contribution',
    icon: '✨',
    tier: 'bronze',
    criteria: { contributionsCount: 1 },
    rarity: 0.5,
  },
  active_contributor: {
    badgeId: 'active_contributor',
    name: 'Active Contributor',
    description: 'Made 25 contributions',
    icon: '🌟',
    tier: 'silver',
    criteria: { contributionsCount: 25 },
    rarity: 0.15,
  },

  // Streak Badges
  dedicated: {
    badgeId: 'dedicated',
    name: 'Dedicated',
    description: '7-day learning streak',
    icon: '🔥',
    tier: 'bronze',
    criteria: { learningStreak: 7 },
    rarity: 0.25,
  },
  unstoppable: {
    badgeId: 'unstoppable',
    name: 'Unstoppable',
    description: '30-day learning streak',
    icon: '⚡',
    tier: 'gold',
    criteria: { learningStreak: 30 },
    rarity: 0.05,
  },

  // Formal Verification Badges
  proof_writer: {
    badgeId: 'proof_writer',
    name: 'Proof Writer',
    description: 'Wrote your first formal proof',
    icon: '📝',
    tier: 'silver',
    criteria: { theoremsProved: 1 },
    rarity: 0.2,
  },
  proof_master: {
    badgeId: 'proof_master',
    name: 'Proof Master',
    description: 'Wrote 10 formal proofs',
    icon: '🖋️',
    tier: 'gold',
    criteria: { theoremsProved: 10 },
    rarity: 0.04,
  },

  // Specialization Badges
  specialist: {
    badgeId: 'specialist',
    name: 'Specialist',
    description: 'Mastered a specialization area',
    icon: '💎',
    tier: 'platinum',
    criteria: { specializations: 1 },
    rarity: 0.12,
  },
  polymath: {
    badgeId: 'polymath',
    name: 'Polymath',
    description: 'Mastered 3 specialization areas',
    icon: '🌈',
    tier: 'platinum',
    criteria: { specializations: 3 },
    rarity: 0.03,
  },

  // Social Badges
  networker: {
    badgeId: 'networker',
    name: 'Networker',
    description: 'Follow 10 mathematicians',
    icon: '🤝',
    tier: 'bronze',
    criteria: { following: 10 },
    rarity: 0.4,
  },
  influencer: {
    badgeId: 'influencer',
    name: 'Influencer',
    description: '50 followers',
    icon: '👥',
    tier: 'gold',
    criteria: { followers: 50 },
    rarity: 0.02,
  },
}

// ══════════════════════════════════════════════════════════════
// Activity Types
// ══════════════════════════════════════════════════════════════

export const ACTIVITY_TYPES = {
  PROOF_VIEWED: 'proof_viewed',
  PROOF_UNDERSTOOD: 'proof_understood',
  THEOREM_PROVED: 'theorem_proved',
  BADGE_EARNED: 'badge_earned',
  LEVEL_UP: 'level_up',
  CONTRIBUTION: 'contribution',
  FOLLOWED_USER: 'followed_user',
  STARTED_LEARNING_PATH: 'started_learning_path',
  COMPLETED_LEARNING_PATH: 'completed_learning_path',
}

// ══════════════════════════════════════════════════════════════
// Core Functions
// ══════════════════════════════════════════════════════════════

/**
 * Get current user ID (creates demo user if none exists)
 */
export function getCurrentUserId() {
  let userId = storage.get(STORAGE_KEYS.CURRENT_USER)
  if (!userId) {
    // Create demo user
    userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    storage.set(STORAGE_KEYS.CURRENT_USER, userId)

    // Initialize user profile
    const profile = {
      userId,
      username: `Mathematician_${Math.floor(Math.random() * 10000)}`,
      avatar: generateAvatar(userId),
      bio: 'Exploring the beauty of mathematics',
      joinedAt: new Date().toISOString(),
      stats: {
        proofsViewed: 0,
        proofsUnderstood: 0,
        theoremsProved: 0,
        contributionsCount: 0,
        learningStreak: 0,
        totalStudyTime: 0,
        specializations: [],
      },
      preferences: {
        visibility: 'public',
        showActivity: true,
      },
      badges: [],
      level: 1,
      xp: 0,
    }
    storage.set(`${STORAGE_KEYS.USER_PROFILES}:${userId}`, profile)
  }
  return userId
}

/**
 * Generate avatar initials or pattern
 */
function generateAvatar(userId) {
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2']
  const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const color = colors[hash % colors.length]
  return { type: 'color', color, initials: userId.substr(0, 2).toUpperCase() }
}

/**
 * Get user profile by ID
 * @param {string} userId - User identifier
 * @returns {UserProfile|null}
 */
export function GetUserProfile(userId) {
  const profile = storage.get(`${STORAGE_KEYS.USER_PROFILES}:${userId}`)
  if (!profile) return null

  // Calculate derived fields
  profile.level = calculateLevel(profile.xp)
  profile.stats.following = getFollowingCount(userId)
  profile.stats.followers = getFollowersCount(userId)

  return profile
}

/**
 * Update user profile
 * @param {string} userId - User identifier
 * @param {Partial<UserProfile>} updates - Fields to update
 */
export function updateUserProfile(userId, updates) {
  const profile = GetUserProfile(userId)
  if (!profile) return null

  const updated = { ...profile, ...updates }
  storage.set(`${STORAGE_KEYS.USER_PROFILES}:${userId}`, updated)
  return updated
}

/**
 * Update user stats
 * @param {string} userId - User identifier
 * @param {Partial<UserProfile['stats']>} stats - Stats to update
 */
export function updateUserStats(userId, stats) {
  const profile = GetUserProfile(userId)
  if (!profile) return null

  const updatedProfile = {
    ...profile,
    stats: { ...profile.stats, ...stats },
  }

  // Calculate XP gain
  const xpGain = calculateXPGain(stats)
  updatedProfile.xp += xpGain
  updatedProfile.level = calculateLevel(updatedProfile.xp)

  storage.set(`${STORAGE_KEYS.USER_PROFILES}:${userId}`, updatedProfile)

  // Check for badge unlocks
  checkBadgeUnlocks(userId, updatedProfile)

  return updatedProfile
}

/**
 * Calculate user level from XP
 */
function calculateLevel(xp) {
  // Level formula: level = floor(sqrt(xp / 100)) + 1
  return Math.floor(Math.sqrt(xp / 100)) + 1
}

/**
 * Calculate XP gain from stats
 */
function calculateXPGain(stats) {
  let xp = 0
  if (stats.proofsViewed) xp += stats.proofsViewed * 10
  if (stats.proofsUnderstood) xp += stats.proofsUnderstood * 50
  if (stats.theoremsProved) xp += stats.theoremsProved * 200
  if (stats.contributionsCount) xp += stats.contributionsCount * 100
  return xp
}

/**
 * Follow another user
 * @param {string} userId - Follower's user ID
 * @param {string} targetId - User to follow
 * @returns {Follow}
 */
export function FollowUser(userId, targetId) {
  if (userId === targetId) {
    throw new Error('Cannot follow yourself')
  }

  // Check if already following
  const existingFollow = getFollow(userId, targetId)
  if (existingFollow) {
    return existingFollow
  }

  const follow = {
    followId: `follow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    followerId: userId,
    followingId: targetId,
    followedAt: new Date().toISOString(),
    notifications: true,
  }

  storage.set(`${STORAGE_KEYS.FOLLOWS}:${follow.followId}`, follow)

  // Record activity
  recordActivity(userId, ACTIVITY_TYPES.FOLLOWED_USER, {
    targetUserId: targetId,
    targetUsername: GetUserProfile(targetId)?.username,
  })

  return follow
}

/**
 * Unfollow a user
 */
export function UnfollowUser(userId, targetId) {
  const follow = getFollow(userId, targetId)
  if (!follow) return false

  storage.delete(`${STORAGE_KEYS.FOLLOWS}:${follow.followId}`)
  return true
}

/**
 * Check if user is following another user
 */
export function isFollowing(userId, targetId) {
  return getFollow(userId, targetId) !== null
}

/**
 * Get follow relationship
 */
function getFollow(followerId, followingId) {
  const follows = storage.getAllWithPrefix(STORAGE_KEYS.FOLLOWS)
  return follows.find(f => f.followerId === followerId && f.followingId === followingId) || null
}

/**
 * Get following count
 */
function getFollowingCount(userId) {
  const follows = storage.getAllWithPrefix(STORAGE_KEYS.FOLLOWS)
  return follows.filter(f => f.followerId === userId).length
}

/**
 * Get followers count
 */
function getFollowersCount(userId) {
  const follows = storage.getAllWithPrefix(STORAGE_KEYS.FOLLOWS)
  return follows.filter(f => f.followingId === userId).length
}

/**
 * Get users that a user is following
 */
export function getFollowing(userId) {
  const follows = storage.getAllWithPrefix(STORAGE_KEYS.FOLLOWS)
  const following = follows.filter(f => f.followerId === userId)
  return following.map(f => GetUserProfile(f.followingId)).filter(Boolean)
}

/**
 * Get user's followers
 */
export function getFollowers(userId) {
  const follows = storage.getAllWithPrefix(STORAGE_KEYS.FOLLOWS)
  const followers = follows.filter(f => f.followingId === userId)
  return followers.map(f => GetUserProfile(f.followerId)).filter(Boolean)
}

/**
 * Get activity feed for a user
 * @param {string} userId - User ID to get feed for
 * @param {number} limit - Maximum number of activities to return
 * @returns {Array<Activity>}
 */
export function GetActivityFeed(userId, limit = 50) {
  const userProfile = GetUserProfile(userId)
  if (!userProfile) return []

  // Get all activities
  let activities = storage.getAllWithPrefix(STORAGE_KEYS.ACTIVITIES)

  // Filter based on visibility and following
  const following = getFollowing(userId).map(u => u.userId)
  following.push(userId) // Include own activities

  activities = activities.filter(activity => {
    // Own activities
    if (activity.userId === userId) return true

    // Check if following this user
    if (!following.includes(activity.userId)) return false

    // Check visibility
    const actorProfile = GetUserProfile(activity.userId)
    if (!actorProfile) return false

    if (activity.visibility === 'private') return false
    if (activity.visibility === 'followers' && !following.includes(activity.userId)) return false

    return true
  })

  // Sort by timestamp (newest first)
  activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

  // Limit results
  return activities.slice(0, limit).map(enrichActivity)
}

/**
 * Enrich activity with user data
 */
function enrichActivity(activity) {
  const user = GetUserProfile(activity.userId)
  return {
    ...activity,
    user: user ? {
      userId: user.userId,
      username: user.username,
      avatar: user.avatar,
      level: user.level,
    } : null,
  }
}

/**
 * Record an activity
 */
export function recordActivity(userId, type, metadata = {}) {
  const userProfile = GetUserProfile(userId)
  if (!userProfile || !userProfile.preferences.showActivity) return null

  const activity = {
    activityId: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    type,
    metadata,
    timestamp: new Date().toISOString(),
    visibility: userProfile.preferences.visibility,
  }

  storage.set(`${STORAGE_KEYS.ACTIVITIES}:${activity.activityId}`, activity)
  return activity
}

/**
 * Compute leaderboard for a specific metric
 * @param {string} metric - Metric to rank by
 * @param {number} limit - Number of entries to return
 * @returns {Array<LeaderboardEntry>}
 */
export function ComputeLeaderboard(metric, limit = 100) {
  const profiles = storage.getAllWithPrefix(STORAGE_KEYS.USER_PROFILES)

  // Define metric extractors
  const metricExtractors = {
    proofsViewed: p => p.stats.proofsViewed,
    proofsUnderstood: p => p.stats.proofsUnderstood,
    theoremsProved: p => p.stats.theoremsProved,
    contributions: p => p.stats.contributionsCount,
    level: p => p.level,
    xp: p => p.xp,
    streak: p => p.stats.learningStreak,
    studyTime: p => p.stats.totalStudyTime,
  }

  const extractor = metricExtractors[metric]
  if (!extractor) {
    throw new Error(`Unknown metric: ${metric}`)
  }

  // Filter public profiles and extract scores
  const entries = profiles
    .filter(p => p.preferences.visibility === 'public')
    .map(p => ({
      userId: p.userId,
      username: p.username,
      avatar: p.avatar,
      score: extractor(p),
      badges: p.badges,
      level: p.level,
    }))
    .filter(e => e.score > 0)

  // Sort by score (descending)
  entries.sort((a, b) => b.score - a.score)

  // Add ranks and change indicators
  const leaderboard = entries.slice(0, limit).map((entry, index) => ({
    rank: index + 1,
    ...entry,
    change: 'same', // TODO: Track rank changes
    changeAmount: 0,
  }))

  return leaderboard
}

/**
 * Award a badge to a user
 * @param {string} userId - User ID
 * @param {string} badgeId - Badge identifier
 * @returns {Object} Achievement result
 */
export function AwardBadge(userId, badgeId) {
  const profile = GetUserProfile(userId)
  if (!profile) {
    return { success: false, reason: 'User not found' }
  }

  // Check if badge exists
  const badge = BADGE_DEFINITIONS[badgeId]
  if (!badge) {
    return { success: false, reason: 'Badge not found' }
  }

  // Check if already awarded
  if (profile.badges.includes(badgeId)) {
    return { success: false, reason: 'Badge already earned' }
  }

  // Award badge
  profile.badges.push(badgeId)
  profile.xp += getBadgeXP(badge.tier)
  storage.set(`${STORAGE_KEYS.USER_PROFILES}:${userId}`, profile)

  // Record activity
  recordActivity(userId, ACTIVITY_TYPES.BADGE_EARNED, {
    badgeId,
    badgeName: badge.name,
    badgeTier: badge.tier,
  })

  return {
    success: true,
    badge,
    xpGained: getBadgeXP(badge.tier),
  }
}

/**
 * Get XP value for badge tier
 */
function getBadgeXP(tier) {
  const xpValues = {
    bronze: 100,
    silver: 250,
    gold: 500,
    platinum: 1000,
  }
  return xpValues[tier] || 100
}

/**
 * Check and award badges based on user stats
 */
function checkBadgeUnlocks(userId, profile) {
  const { stats } = profile

  // Check each badge definition
  Object.values(BADGE_DEFINITIONS).forEach(badge => {
    // Skip if already earned
    if (profile.badges.includes(badge.badgeId)) return

    // Check criteria
    let meetsAllCriteria = true
    for (const [key, value] of Object.entries(badge.criteria)) {
      if (key === 'following') {
        if (stats.following < value) meetsAllCriteria = false
      } else if (key === 'followers') {
        if (stats.followers < value) meetsAllCriteria = false
      } else if (key === 'specializations') {
        if (stats.specializations.length < value) meetsAllCriteria = false
      } else if (stats[key] < value) {
        meetsAllCriteria = false
      }
    }

    // Award if criteria met
    if (meetsAllCriteria) {
      AwardBadge(userId, badge.badgeId)
    }
  })
}

/**
 * Get user's badges with definitions
 */
export function getUserBadges(userId) {
  const profile = GetUserProfile(userId)
  if (!profile) return []

  return profile.badges
    .map(badgeId => BADGE_DEFINITIONS[badgeId])
    .filter(Boolean)
    .sort((a, b) => {
      const tierOrder = { platinum: 4, gold: 3, silver: 2, bronze: 1 }
      return tierOrder[b.tier] - tierOrder[a.tier]
    })
}

/**
 * Search users by username
 */
export function searchUsers(query, limit = 20) {
  const profiles = storage.getAllWithPrefix(STORAGE_KEYS.USER_PROFILES)
  const lowerQuery = query.toLowerCase()

  return profiles
    .filter(p => p.username.toLowerCase().includes(lowerQuery))
    .filter(p => p.preferences.visibility !== 'private')
    .slice(0, limit)
    .map(p => ({
      userId: p.userId,
      username: p.username,
      avatar: p.avatar,
      level: p.level,
      badges: p.badges.slice(0, 3), // Show top 3 badges
    }))
}

// ══════════════════════════════════════════════════════════════
// Integration with Learning System
// ══════════════════════════════════════════════════════════════

/**
 * Track proof view
 */
export function trackProofView(proofId, proofTitle) {
  const userId = getCurrentUserId()
  updateUserStats(userId, { proofsViewed: 1 })

  recordActivity(userId, ACTIVITY_TYPES.PROOF_VIEWED, {
    proofId,
    proofTitle,
  })
}

/**
 * Track proof understanding
 */
export function trackProofUnderstood(proofId, proofTitle) {
  const userId = getCurrentUserId()
  updateUserStats(userId, { proofsUnderstood: 1 })

  recordActivity(userId, ACTIVITY_TYPES.PROOF_UNDERSTOOD, {
    proofId,
    proofTitle,
  })
}

/**
 * Track theorem proved
 */
export function trackTheoremProved(theoremId, theoremTitle) {
  const userId = getCurrentUserId()
  updateUserStats(userId, { theoremsProved: 1 })

  recordActivity(userId, ACTIVITY_TYPES.THEOREM_PROVED, {
    theoremId,
    theoremTitle,
  })
}

/**
 * Track contribution
 */
export function trackContribution(contributionType, details) {
  const userId = getCurrentUserId()
  updateUserStats(userId, { contributionsCount: 1 })

  recordActivity(userId, ACTIVITY_TYPES.CONTRIBUTION, {
    contributionType,
    ...details,
  })
}

/**
 * Update learning streak
 */
export function updateLearningStreak() {
  const userId = getCurrentUserId()
  const profile = GetUserProfile(userId)
  if (!profile) return

  const lastActivity = getLastActivityDate(userId)
  const today = new Date().setHours(0, 0, 0, 0)
  const yesterday = today - 86400000

  if (!lastActivity) {
    // First activity
    updateUserStats(userId, { learningStreak: 1 })
  } else {
    const lastDate = new Date(lastActivity).setHours(0, 0, 0, 0)

    if (lastDate === today) {
      // Already logged today
      return
    } else if (lastDate === yesterday) {
      // Streak continues
      updateUserStats(userId, { learningStreak: profile.stats.learningStreak + 1 })
    } else {
      // Streak broken
      updateUserStats(userId, { learningStreak: 1 })
    }
  }
}

/**
 * Get last activity date
 */
function getLastActivityDate(userId) {
  const activities = storage.getAllWithPrefix(STORAGE_KEYS.ACTIVITIES)
  const userActivities = activities
    .filter(a => a.userId === userId)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

  return userActivities[0]?.timestamp || null
}

/**
 * Initialize social features (call on app startup)
 */
export function initializeSocialFeatures() {
  // Ensure current user exists
  getCurrentUserId()

  // Update streak
  updateLearningStreak()

  console.log('[Social] Features initialized')
}

