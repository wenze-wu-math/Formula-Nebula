/**
 * ═══════════════════════════════════════════════════════════════
 *  Spaced Repetition Scheduling System
 * ═══════════════════════════════════════════════════════════════
 *
 * Implementation of enhanced SM-2+ algorithm for optimal review scheduling
 * of mathematical theorems and proofs.
 *
 * Features:
 * - SM-2+ algorithm (improved SuperMemo 2)
 * - Adaptive difficulty weighting
 * - Prerequisite-aware scheduling
 * - Forgetting curve estimation
 * - Review session optimization
 *
 * Based on research by:
 * - Piotr Wozniak (SuperMemo algorithms)
 * - Ebbinghaus (forgetting curve)
 * - Leitner system principles
 */

// ============================================================================
// 1. SPACED REPETITION CARD
// ============================================================================

/**
 * Represents a single theorem/concept for review
 */
export class ReviewCard {
  constructor(theoremId, metadata = {}) {
    this.theoremId = theoremId
    this.metadata = metadata

    // SM-2+ parameters
    this.easinessFactor = 2.5 // EF, range 1.3 - 2.5+
    this.repetitions = 0 // Number of successful reviews
    this.interval = 0 // Days until next review
    this.nextReview = Date.now() // Timestamp of next review
    this.lastReview = null // Timestamp of last review

    // Performance tracking
    this.totalReviews = 0
    this.successfulReviews = 0
    this.consecutiveSuccess = 0
    this.consecutiveFailures = 0
    this.averageQuality = 3 // Average quality of recalls (0-5)

    // Learning analytics
    this.timePerReview = [] // Seconds spent on each review
    this.difficultyRating = [] // User-reported difficulty (1-5)
    this.lapses = 0 // Number of times forgotten after being learned
    this.mature = false // Mature cards have interval >= 21 days

    // Context
    this.created = Date.now()
    this.tags = metadata.tags || []
    this.family = metadata.family
    this.importance = metadata.importance || 0.5
  }

  /**
   * Update card after review (SM-2+ algorithm)
   * @param {number} quality - Quality of recall (0-5)
   *   5: Perfect recall
   *   4: Correct with hesitation
   *   3: Correct with difficulty
   *   2: Incorrect but remembered
   *   1: Incorrect and hard to recall
   *   0: Complete blackout
   * @param {number} timeSpent - Seconds spent on review
   * @param {number} difficulty - User-reported difficulty (1-5)
   */
  review(quality, timeSpent = 0, difficulty = 3) {
    this.totalReviews++
    this.timePerReview.push(timeSpent)
    this.difficultyRating.push(difficulty)
    this.lastReview = Date.now()

    // Update average quality
    this.averageQuality = (this.averageQuality * (this.totalReviews - 1) + quality) / this.totalReviews

    // SM-2+ algorithm
    if (quality >= 3) {
      // Successful recall
      this.successfulReviews++
      this.consecutiveSuccess++
      this.consecutiveFailures = 0

      if (this.repetitions === 0) {
        this.interval = 1 // 1 day
      } else if (this.repetitions === 1) {
        this.interval = 6 // 6 days
      } else {
        this.interval = Math.round(this.interval * this.easinessFactor)
      }

      this.repetitions++

      // Update easiness factor
      this.easinessFactor = Math.max(
        1.3,
        this.easinessFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
      )

    } else {
      // Failed recall
      this.consecutiveSuccess = 0
      this.consecutiveFailures++
      this.repetitions = 0
      this.interval = 1

      // Track lapse if card was previously mature
      if (this.mature) {
        this.lapses++
      }

      // Reduce easiness factor
      this.easinessFactor = Math.max(1.3, this.easinessFactor - 0.2)
    }

    // Difficulty adjustment: increase interval if consistently easy
    if (this.consecutiveSuccess >= 3 && difficulty <= 2) {
      this.interval = Math.round(this.interval * 1.2)
    }

    // Difficulty penalty: decrease interval if consistently hard
    if (difficulty >= 4 && quality < 5) {
      this.interval = Math.round(this.interval * 0.8)
    }

    // Update maturity status
    this.mature = this.interval >= 21

    // Schedule next review
    this.nextReview = Date.now() + this.interval * 24 * 60 * 60 * 1000

    return {
      interval: this.interval,
      nextReview: this.nextReview,
      easinessFactor: this.easinessFactor,
      mature: this.mature,
    }
  }

  /**
   * Check if card is due for review
   */
  isDue(now = Date.now()) {
    return now >= this.nextReview
  }

  /**
   * Get time until next review (milliseconds)
   */
  timeUntilReview(now = Date.now()) {
    return Math.max(0, this.nextReview - now)
  }

  /**
   * Get retention probability estimate (Ebbinghaus forgetting curve)
   */
  getRetentionProbability(now = Date.now()) {
    if (!this.lastReview) return 0.5

    const daysSinceReview = (now - this.lastReview) / (24 * 60 * 60 * 1000)
    const stability = this.interval // Stability is current interval

    // Forgetting curve: R = e^(-t/S)
    const retention = Math.exp(-daysSinceReview / (stability + 1))

    return Math.max(0, Math.min(1, retention))
  }

  /**
   * Export card state for storage
   */
  toJSON() {
    return {
      theoremId: this.theoremId,
      metadata: this.metadata,
      easinessFactor: this.easinessFactor,
      repetitions: this.repetitions,
      interval: this.interval,
      nextReview: this.nextReview,
      lastReview: this.lastReview,
      totalReviews: this.totalReviews,
      successfulReviews: this.successfulReviews,
      consecutiveSuccess: this.consecutiveSuccess,
      consecutiveFailures: this.consecutiveFailures,
      averageQuality: this.averageQuality,
      timePerReview: this.timePerReview,
      difficultyRating: this.difficultyRating,
      lapses: this.lapses,
      mature: this.mature,
      created: this.created,
      tags: this.tags,
      family: this.family,
      importance: this.importance,
    }
  }

  /**
   * Load card from JSON
   */
  static fromJSON(data) {
    const card = new ReviewCard(data.theoremId, data.metadata)
    Object.assign(card, data)
    return card
  }
}

// ============================================================================
// 2. SPACED REPETITION SCHEDULER
// ============================================================================

/**
 * Manages review scheduling for multiple cards
 */
export class SpacedRepetitionScheduler {
  constructor() {
    this.cards = new Map() // theoremId -> ReviewCard
    this.reviewHistory = [] // Historical review records
    this.settings = {
      newCardsPerDay: 20,
      maxReviewsPerDay: 100,
      reviewAheadDays: 0, // How many days ahead to allow reviews
      buryRelated: true, // Bury related cards after review
    }
  }

  /**
   * Add a new theorem to the review system
   */
  addCard(theoremId, metadata = {}) {
    if (this.cards.has(theoremId)) {
      return this.cards.get(theoremId)
    }

    const card = new ReviewCard(theoremId, metadata)
    this.cards.set(theoremId, card)
    return card
  }

  /**
   * Get card by theorem ID
   */
  getCard(theoremId) {
    return this.cards.get(theoremId)
  }

  /**
   * Record a review
   */
  recordReview(theoremId, quality, timeSpent = 0, difficulty = 3) {
    const card = this.cards.get(theoremId)
    if (!card) {
      throw new Error(`Card not found: ${theoremId}`)
    }

    const result = card.review(quality, timeSpent, difficulty)

    // Record in history
    this.reviewHistory.push({
      theoremId,
      timestamp: Date.now(),
      quality,
      timeSpent,
      difficulty,
      interval: result.interval,
      easinessFactor: result.easinessFactor,
    })

    return result
  }

  /**
   * Get all cards due for review
   */
  getDueCards(now = Date.now()) {
    const due = []

    this.cards.forEach(card => {
      if (card.isDue(now)) {
        due.push(card)
      }
    })

    // Sort by urgency (overdue first, then by importance)
    due.sort((a, b) => {
      const aOverdue = now - a.nextReview
      const bOverdue = now - b.nextReview

      if (aOverdue > 0 && bOverdue > 0) {
        // Both overdue: prioritize by how overdue
        if (Math.abs(aOverdue - bOverdue) > 24 * 60 * 60 * 1000) {
          return bOverdue - aOverdue
        }
      }

      // Prioritize by importance
      return (b.importance || 0.5) - (a.importance || 0.5)
    })

    return due.slice(0, this.settings.maxReviewsPerDay)
  }

  /**
   * Get new cards to learn (not yet reviewed)
   */
  getNewCards() {
    const newCards = []

    this.cards.forEach(card => {
      if (card.totalReviews === 0) {
        newCards.push(card)
      }
    })

    // Sort by importance
    newCards.sort((a, b) => (b.importance || 0.5) - (a.importance || 0.5))

    return newCards.slice(0, this.settings.newCardsPerDay)
  }

  /**
   * Get review session (mix of due and new cards)
   */
  getReviewSession(options = {}) {
    const {
      includeDue = true,
      includeNew = true,
      maxCards = 30,
      familyFilter = null,
    } = options

    const session = []

    if (includeDue) {
      const due = this.getDueCards()
      session.push(...due.map(card => ({ card, type: 'review' })))
    }

    if (includeNew && session.length < maxCards) {
      const newCards = this.getNewCards()
      const slotsRemaining = maxCards - session.length
      session.push(...newCards.slice(0, slotsRemaining).map(card => ({ card, type: 'new' })))
    }

    // Apply family filter
    if (familyFilter) {
      return session.filter(item => item.card.family === familyFilter)
    }

    return session.slice(0, maxCards)
  }

  /**
   * Get statistics about review system
   */
  getStats() {
    let totalCards = 0
    let newCards = 0
    let learningCards = 0 // repetitions < 3
    let matureCards = 0
    let due = 0
    let avgEF = 0

    this.cards.forEach(card => {
      totalCards++

      if (card.totalReviews === 0) {
        newCards++
      } else if (card.mature) {
        matureCards++
      } else {
        learningCards++
      }

      if (card.isDue()) {
        due++
      }

      avgEF += card.easinessFactor
    })

    avgEF = totalCards > 0 ? avgEF / totalCards : 2.5

    const retention = this.computeRetention()

    return {
      totalCards,
      newCards,
      learningCards,
      matureCards,
      due,
      avgEasinessFactor: avgEF.toFixed(2),
      retention: (retention * 100).toFixed(1) + '%',
      totalReviews: this.reviewHistory.length,
    }
  }

  /**
   * Compute overall retention rate from recent reviews
   */
  computeRetention() {
    const recentReviews = this.reviewHistory.slice(-100)
    if (recentReviews.length === 0) return 0.9 // Default

    const successful = recentReviews.filter(r => r.quality >= 3).length
    return successful / recentReviews.length
  }

  /**
   * Predict retention for a specific card
   */
  predictRetention(theoremId, daysFromNow = 0) {
    const card = this.cards.get(theoremId)
    if (!card) return null

    const futureTime = Date.now() + daysFromNow * 24 * 60 * 60 * 1000
    return card.getRetentionProbability(futureTime)
  }

  /**
   * Get cards with low retention (at risk of forgetting)
   */
  getAtRiskCards(threshold = 0.7) {
    const atRisk = []

    this.cards.forEach(card => {
      if (card.totalReviews > 0) {
        const retention = card.getRetentionProbability()
        if (retention < threshold) {
          atRisk.push({
            card,
            retention,
            daysSinceReview: (Date.now() - card.lastReview) / (24 * 60 * 60 * 1000),
          })
        }
      }
    })

    // Sort by retention (lowest first)
    atRisk.sort((a, b) => a.retention - b.retention)

    return atRisk
  }

  /**
   * Optimize review schedule (reorder based on forgetting curve)
   */
  optimizeSchedule() {
    const cards = Array.from(this.cards.values())

    // Prioritize cards closest to forgetting threshold
    const optimized = cards
      .filter(card => card.totalReviews > 0)
      .map(card => ({
        card,
        retention: card.getRetentionProbability(),
        priority: this.computePriority(card),
      }))
      .sort((a, b) => b.priority - a.priority)

    return optimized.slice(0, 50) // Top 50 priority cards
  }

  /**
   * Compute review priority (combines retention, importance, overdueness)
   */
  computePriority(card) {
    const retention = card.getRetentionProbability()
    const importance = card.importance || 0.5
    const overdue = Math.max(0, Date.now() - card.nextReview) / (24 * 60 * 60 * 1000)

    // Priority formula:
    // - High if retention is low (forgetting)
    // - High if card is important
    // - High if card is overdue
    const retentionPriority = (1 - retention) * 40
    const importancePriority = importance * 30
    const overduePriority = Math.min(overdue * 5, 30)

    return retentionPriority + importancePriority + overduePriority
  }

  /**
   * Export all cards for backup
   */
  exportData() {
    return {
      cards: Array.from(this.cards.entries()).map(([id, card]) => ({
        id,
        data: card.toJSON(),
      })),
      reviewHistory: this.reviewHistory,
      settings: this.settings,
      exportedAt: new Date().toISOString(),
    }
  }

  /**
   * Import cards from backup
   */
  importData(data) {
    data.cards.forEach(({ id, data: cardData }) => {
      const card = ReviewCard.fromJSON(cardData)
      this.cards.set(id, card)
    })

    this.reviewHistory = data.reviewHistory || []
    this.settings = { ...this.settings, ...data.settings }
  }

  /**
   * Generate review forecast (next 7 days)
   */
  getForecast(days = 7) {
    const forecast = []

    for (let i = 0; i < days; i++) {
      const date = new Date()
      date.setDate(date.getDate() + i)
      date.setHours(0, 0, 0, 0)

      const dayStart = date.getTime()
      const dayEnd = dayStart + 24 * 60 * 60 * 1000

      let dueCount = 0
      let newCount = 0

      this.cards.forEach(card => {
        if (card.nextReview >= dayStart && card.nextReview < dayEnd) {
          if (card.totalReviews === 0) {
            newCount++
          } else {
            dueCount++
          }
        }
      })

      forecast.push({
        date: date.toISOString().split('T')[0],
        dueReviews: dueCount,
        newCards: newCount,
        total: dueCount + newCount,
      })
    }

    return forecast
  }
}

// ============================================================================
// 3. PREREQUISITE-AWARE SCHEDULER
// ============================================================================

/**
 * Enhanced scheduler that respects theorem prerequisites
 */
export class PrerequisiteAwareScheduler extends SpacedRepetitionScheduler {
  constructor(graph, prerequisiteResolver) {
    super()
    this.graph = graph
    this.prerequisiteResolver = prerequisiteResolver
  }

  /**
   * Get review session with prerequisite awareness
   */
  getReviewSession(options = {}) {
    const session = super.getReviewSession(options)

    // Filter out cards whose prerequisites aren't mastered
    const filtered = session.filter(item => {
      if (item.type === 'new') {
        const prereqs = this.prerequisiteResolver.GetPrerequisites(item.card.theoremId)
        return prereqs.every(prereqId => {
          const prereqCard = this.cards.get(prereqId)
          return prereqCard && prereqCard.mature
        })
      }
      return true // Always include review cards
    })

    return filtered
  }

  /**
   * Add card with automatic prerequisite checking
   */
  addCardWithPrerequisites(theoremId, metadata = {}) {
    // Add main card
    const card = this.addCard(theoremId, metadata)

    // Recursively add prerequisite cards if not already present
    const prerequisites = this.prerequisiteResolver.GetPrerequisites(theoremId)
    prerequisites.forEach(prereqId => {
      if (!this.cards.has(prereqId)) {
        const prereqNode = this.graph?.byId?.get(prereqId)
        if (prereqNode) {
          this.addCardWithPrerequisites(prereqId, {
            family: prereqNode.family,
            importance: prereqNode.importance,
            tags: ['prerequisite'],
          })
        }
      }
    })

    return card
  }

  /**
   * Get learning path schedule (spaced repetition applied to curriculum)
   */
  scheduleLearningPath(curriculumPath) {
    const schedule = []
    let currentDay = 0

    curriculumPath.forEach((item, index) => {
      const theoremId = item.theoremId

      // Initial learning: review on day 0, 1, 6
      schedule.push({
        theoremId,
        day: currentDay,
        type: 'initial',
        session: 1,
      })
      schedule.push({
        theoremId,
        day: currentDay + 1,
        type: 'reinforcement',
        session: 2,
      })
      schedule.push({
        theoremId,
        day: currentDay + 6,
        type: 'consolidation',
        session: 3,
      })

      // Move to next theorem after initial learning
      currentDay += 2 // Introduce new theorem every 2 days
    })

    return this.optimizeLearningSchedule(schedule)
  }

  /**
   * Optimize learning schedule to avoid overload
   */
  optimizeLearningSchedule(schedule) {
    const dailyLoad = new Map()

    // Count daily load
    schedule.forEach(item => {
      const day = item.day
      dailyLoad.set(day, (dailyLoad.get(day) || 0) + 1)
    })

    // Redistribute if any day has too many reviews
    const maxPerDay = 10
    const optimized = []

    schedule.forEach(item => {
      let targetDay = item.day
      while ((dailyLoad.get(targetDay) || 0) > maxPerDay && targetDay < 365) {
        targetDay++
      }

      optimized.push({
        ...item,
        day: targetDay,
        originalDay: item.day,
        delayed: targetDay !== item.day,
      })

      dailyLoad.set(targetDay, (dailyLoad.get(targetDay) || 0) + 1)
    })

    return optimized.sort((a, b) => a.day - b.day)
  }
}

export default SpacedRepetitionScheduler
