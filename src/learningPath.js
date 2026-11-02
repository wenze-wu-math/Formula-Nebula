/**
 * Learning Path Recommendation System for Formula Nebula
 *
 * Features:
 * 1. Track user's learning progress across theorems
 * 2. Suggest next theorems based on prerequisites
 * 3. Adapt difficulty based on engagement metrics
 * 4. Create custom curricula between topics
 * 5. Integrate with proof explorer for immediate practice
 *
 * Core Components:
 * - PrerequisiteResolver: Builds dependency graphs
 * - SuitabilityRanker: Scores candidates by user profile
 * - CurriculumBuilder: Creates learning paths
 * - ProgressTracker: Records engagement metrics
 */

// ============================================================================
// 1. DATA STRUCTURES & STORAGE
// ============================================================================

/**
 * User progress data structure
 * @typedef {Object} UserProgress
 * @property {string} userId - Unique user identifier
 * @property {Map<string, TheoremProgress>} theorems - Progress per theorem
 * @property {number} overallLevel - Computed skill level (0-100)
 * @property {Set<string>} masteredTheorems - Fully understood theorems
 * @property {Set<string>} inProgressTheorems - Currently studying
 * @property {Object} preferences - Learning preferences
 */

/**
 * Individual theorem progress
 * @typedef {Object} TheoremProgress
 * @property {string} theoremId
 * @property {number} timeSpent - Total seconds spent
 * @property {number} visits - Number of times opened
 * @property {number} understandingScore - Self-reported 0-5
 * @property {number} completionRate - Steps completed / total steps
 * @property {Date} firstVisited
 * @property {Date} lastVisited
 * @property {string[]} proofStepsCompleted - IDs of completed proof steps
 * @property {boolean} exported - Whether exported LaTeX
 * @property {boolean} explored - Whether used proof explorer features
 */

class ProgressStorage {
  constructor() {
    this.STORAGE_KEY = 'formula-nebula-progress'
    this.cache = null
  }

  /**
   * Load user progress from localStorage
   */
  load(userId = 'default') {
    if (this.cache) return this.cache

    const raw = localStorage.getItem(this.STORAGE_KEY)
    if (!raw) {
      this.cache = this.createEmpty(userId)
      return this.cache
    }

    try {
      const data = JSON.parse(raw)
      // Convert plain objects to Maps/Sets
      data.theorems = new Map(Object.entries(data.theorems || {}))
      data.masteredTheorems = new Set(data.masteredTheorems || [])
      data.inProgressTheorems = new Set(data.inProgressTheorems || [])
      this.cache = data
      return data
    } catch (e) {
      console.error('Failed to parse progress data:', e)
      this.cache = this.createEmpty(userId)
      return this.cache
    }
  }

  /**
   * Save progress to localStorage
   */
  save(progress) {
    const serializable = {
      ...progress,
      theorems: Object.fromEntries(progress.theorems),
      masteredTheorems: Array.from(progress.masteredTheorems),
      inProgressTheorems: Array.from(progress.inProgressTheorems)
    }
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(serializable))
    this.cache = progress
  }

  /**
   * Create empty progress structure
   */
  createEmpty(userId) {
    return {
      userId,
      theorems: new Map(),
      overallLevel: 0,
      masteredTheorems: new Set(),
      inProgressTheorems: new Set(),
      preferences: {
        preferredFamilies: [],
        difficultyLevel: 'medium', // 'easy', 'medium', 'hard'
        learningStyle: 'balanced', // 'visual', 'proof-heavy', 'balanced'
        sessionDuration: 30 // minutes
      }
    }
  }

  /**
   * Export progress for backup
   */
  exportToJSON() {
    const progress = this.load()
    return JSON.stringify({
      ...progress,
      theorems: Object.fromEntries(progress.theorems),
      masteredTheorems: Array.from(progress.masteredTheorems),
      inProgressTheorems: Array.from(progress.inProgressTheorems),
      exportedAt: new Date().toISOString()
    }, null, 2)
  }

  /**
   * Import progress from backup
   */
  importFromJSON(jsonString) {
    const data = JSON.parse(jsonString)
    data.theorems = new Map(Object.entries(data.theorems || {}))
    data.masteredTheorems = new Set(data.masteredTheorems || [])
    data.inProgressTheorems = new Set(data.inProgressTheorems || [])
    this.save(data)
    return data
  }
}

// ============================================================================
// 2. PREREQUISITE RESOLVER
// ============================================================================

export class PrerequisiteResolver {
  constructor(graph) {
    this.graph = graph
    this.cache = new Map()
  }

  /**
   * Get direct prerequisites for a theorem
   * @param {string} theoremId
   * @returns {string[]} Array of prerequisite theorem IDs
   */
  GetPrerequisites(theoremId) {
    if (this.cache.has(theoremId)) {
      return this.cache.get(theoremId)
    }

    const node = this.graph?.byId?.get(theoremId)
    if (!node) return []

    const prerequisites = new Set()

    // From proof dependencies
    if (node.proof?.dependencies) {
      node.proof.dependencies.forEach(dep => prerequisites.add(dep))
    }

    // From proof steps that reference other theorems
    if (node.proof?.steps) {
      node.proof.steps.forEach(step => {
        if (step.uses) {
          step.uses.forEach(use => {
            const useId = typeof use === 'object' ? use.id : use
            if (useId) prerequisites.add(useId)
          })
        }
      })
    }

    // From graph links (incoming edges with "requires" type)
    const edges = this.graph?.links || []
    edges.forEach(edge => {
      if (edge.target === theoremId || (edge[1] === theoremId && edge.length === 4)) {
        const sourceId = edge.source || edge[0]
        const linkType = edge.type || edge[3]
        if (linkType?.includes('requires') || linkType?.includes('prerequisite')) {
          prerequisites.add(sourceId)
        }
      }
    })

    const result = Array.from(prerequisites)
    this.cache.set(theoremId, result)
    return result
  }

  /**
   * Get all transitive prerequisites (recursive)
   */
  GetAllPrerequisites(theoremId, visited = new Set()) {
    if (visited.has(theoremId)) return []

    visited.add(theoremId)
    const direct = this.GetPrerequisites(theoremId)
    const all = [...direct]

    direct.forEach(prereqId => {
      const transitive = this.GetAllPrerequisites(prereqId, visited)
      transitive.forEach(id => {
        if (!all.includes(id)) all.push(id)
      })
    })

    return all
  }

  /**
   * Get theorems that depend on this one
   */
  GetDependents(theoremId) {
    const dependents = []
    const nodes = Array.from(this.graph?.byId?.values() || [])

    nodes.forEach(node => {
      const prerequisites = this.GetPrerequisites(node.id)
      if (prerequisites.includes(theoremId)) {
        dependents.push(node.id)
      }
    })

    return dependents
  }

  /**
   * Check if all prerequisites are mastered
   */
  ArePrerequisitesMastered(theoremId, masteredSet) {
    const prerequisites = this.GetPrerequisites(theoremId)
    return prerequisites.every(prereq => masteredSet.has(prereq))
  }

  /**
   * Get foundation-level theorems (no prerequisites)
   */
  GetFoundationTheorems() {
    const nodes = Array.from(this.graph?.byId?.values() || [])
    return nodes
      .filter(node => this.GetPrerequisites(node.id).length === 0)
      .map(node => node.id)
  }
}

// ============================================================================
// 3. SUITABILITY RANKER
// ============================================================================

export class SuitabilityRanker {
  constructor(graph, prerequisiteResolver) {
    this.graph = graph
    this.prerequisiteResolver = prerequisiteResolver
  }

  /**
   * Rank candidate theorems by suitability for user
   * @param {UserProgress} user - User progress data
   * @param {string[]} candidates - Candidate theorem IDs
   * @returns {Array<{theoremId: string, score: number, reason: string}>}
   */
  RankBySuitability(user, candidates) {
    const scored = candidates.map(theoremId => {
      const score = this.computeSuitabilityScore(user, theoremId)
      return {
        theoremId,
        ...score
      }
    })

    return scored.sort((a, b) => b.score - a.score)
  }

  /**
   * Compute suitability score for a single theorem
   */
  computeSuitabilityScore(user, theoremId) {
    const node = this.graph?.byId?.get(theoremId)
    if (!node) return { score: 0, reason: 'Not found' }

    let score = 0
    const reasons = []

    // 1. Prerequisite readiness (40 points max)
    const prereqScore = this.scorePrerequisites(user, theoremId)
    score += prereqScore.score
    if (prereqScore.reason) reasons.push(prereqScore.reason)

    // 2. Difficulty match (25 points max)
    const difficultyScore = this.scoreDifficulty(user, node)
    score += difficultyScore.score
    if (difficultyScore.reason) reasons.push(difficultyScore.reason)

    // 3. Family preference (15 points max)
    const familyScore = this.scoreFamilyPreference(user, node)
    score += familyScore.score
    if (familyScore.reason) reasons.push(familyScore.reason)

    // 4. Importance/centrality (10 points max)
    const importanceScore = (node.importance || 0.5) * 10
    score += importanceScore
    if (node.importance >= 0.85) {
      reasons.push('Highly important theorem')
    }

    // 5. Novelty (10 points max) - prefer unseen theorems
    const noveltyScore = this.scoreNovelty(user, theoremId)
    score += noveltyScore.score
    if (noveltyScore.reason) reasons.push(noveltyScore.reason)

    return {
      score: Math.round(score),
      reason: reasons.join('; ')
    }
  }

  /**
   * Score based on prerequisite mastery
   */
  scorePrerequisites(user, theoremId) {
    const prerequisites = this.prerequisiteResolver.GetPrerequisites(theoremId)
    if (prerequisites.length === 0) {
      return { score: 40, reason: 'Foundation theorem' }
    }

    const masteredCount = prerequisites.filter(p =>
      user.masteredTheorems.has(p)
    ).length
    const ratio = masteredCount / prerequisites.length

    if (ratio === 1.0) {
      return { score: 40, reason: 'All prerequisites mastered' }
    } else if (ratio >= 0.7) {
      return { score: 30, reason: 'Most prerequisites ready' }
    } else if (ratio >= 0.4) {
      return { score: 15, reason: 'Some prerequisites missing' }
    } else {
      return { score: 5, reason: 'Many prerequisites not ready' }
    }
  }

  /**
   * Score based on difficulty match
   */
  scoreDifficulty(user, node) {
    const estimatedDifficulty = this.estimateTheoremDifficulty(node)
    const userLevel = user.overallLevel / 100 // normalize to 0-1

    const difficultyGap = Math.abs(estimatedDifficulty - userLevel)

    if (difficultyGap < 0.1) {
      return { score: 25, reason: 'Perfect difficulty match' }
    } else if (difficultyGap < 0.2) {
      return { score: 20, reason: 'Good difficulty match' }
    } else if (difficultyGap < 0.3) {
      return { score: 12, reason: 'Acceptable difficulty' }
    } else {
      return { score: 5, reason: 'Difficulty mismatch' }
    }
  }

  /**
   * Estimate theorem difficulty (0-1 scale)
   */
  estimateTheoremDifficulty(node) {
    let difficulty = 0.5 // baseline

    // Factor 1: Number of proof steps
    const steps = node.proof?.steps?.length || 0
    difficulty += Math.min(steps / 20, 0.2)

    // Factor 2: Number of dependencies
    const deps = node.proof?.dependencies?.length || 0
    difficulty += Math.min(deps / 10, 0.15)

    // Factor 3: Importance (higher importance often means more advanced)
    difficulty += (node.importance || 0.5) * 0.15

    return Math.min(difficulty, 1.0)
  }

  /**
   * Score based on family preference
   */
  scoreFamilyPreference(user, node) {
    const preferredFamilies = user.preferences.preferredFamilies || []
    if (preferredFamilies.length === 0) {
      return { score: 7, reason: '' } // neutral
    }

    if (preferredFamilies.includes(node.family)) {
      return { score: 15, reason: 'Matches preferred topic' }
    } else {
      return { score: 3, reason: '' }
    }
  }

  /**
   * Score based on novelty
   */
  scoreNovelty(user, theoremId) {
    const progress = user.theorems.get(theoremId)

    if (!progress) {
      return { score: 10, reason: 'New theorem' }
    } else if (progress.visits < 2) {
      return { score: 7, reason: 'Barely explored' }
    } else if (progress.visits < 5) {
      return { score: 4, reason: '' }
    } else {
      return { score: 1, reason: 'Already well-explored' }
    }
  }
}

// ============================================================================
// 4. CURRICULUM BUILDER
// ============================================================================

export class CurriculumBuilder {
  constructor(graph, prerequisiteResolver, suitabilityRanker) {
    this.graph = graph
    this.prerequisiteResolver = prerequisiteResolver
    this.suitabilityRanker = suitabilityRanker
  }

  /**
   * Create a curriculum from start topic to target topic
   * @param {string} startTopic - Starting theorem ID or family
   * @param {string} targetTopic - Goal theorem ID or family
   * @param {string} difficulty - 'easy', 'medium', 'hard'
   * @param {UserProgress} user - User progress (optional)
   * @returns {Array<{theoremId: string, reason: string, order: number}>}
   */
  CreateCurriculum(startTopic, targetTopic, difficulty = 'medium', user = null) {
    // Resolve topics to theorem IDs
    const startTheorems = this.resolveToTheorems(startTopic)
    const targetTheorems = this.resolveToTheorems(targetTopic)

    if (startTheorems.length === 0 || targetTheorems.length === 0) {
      return []
    }

    // Find paths from start to target
    const paths = []
    startTheorems.forEach(start => {
      targetTheorems.forEach(target => {
        const path = this.findLearningPath(start, target, difficulty, user)
        if (path.length > 0) {
          paths.push(path)
        }
      })
    })

    if (paths.length === 0) {
      // No direct path found, create step-by-step curriculum
      return this.createGeneralCurriculum(startTheorems[0], targetTheorems[0], difficulty, user)
    }

    // Return shortest path with highest average suitability
    const bestPath = paths.reduce((best, current) => {
      const currentScore = this.pathScore(current, user)
      const bestScore = this.pathScore(best, user)
      return currentScore > bestScore ? current : best
    })

    return bestPath.map((item, index) => ({
      ...item,
      order: index + 1
    }))
  }

  /**
   * Resolve topic (ID or family name) to theorem IDs
   */
  resolveToTheorems(topic) {
    // Check if it's a theorem ID
    if (this.graph?.byId?.has(topic)) {
      return [topic]
    }

    // Check if it's a family name
    const nodes = Array.from(this.graph?.byId?.values() || [])
    const familyNodes = nodes.filter(n => n.family === topic)
    if (familyNodes.length > 0) {
      // Return most important theorems in family
      return familyNodes
        .sort((a, b) => (b.importance || 0) - (a.importance || 0))
        .slice(0, 3)
        .map(n => n.id)
    }

    return []
  }

  /**
   * Find learning path using BFS with prerequisite awareness
   */
  findLearningPath(startId, targetId, difficulty, user) {
    if (startId === targetId) return []

    const queue = [[startId]]
    const visited = new Set([startId])
    const maxDepth = 15

    while (queue.length > 0) {
      const path = queue.shift()
      const current = path[path.length - 1]

      if (path.length > maxDepth) continue

      // Get next candidates
      const dependents = this.prerequisiteResolver.GetDependents(current)

      for (const next of dependents) {
        if (visited.has(next)) continue
        visited.add(next)

        const newPath = [...path, next]

        if (next === targetId) {
          // Found path! Convert to curriculum format
          return this.enrichPath(newPath, difficulty, user)
        }

        queue.push(newPath)
      }
    }

    return []
  }

  /**
   * Create general curriculum when no direct path exists
   */
  createGeneralCurriculum(startId, targetId, difficulty, user) {
    const curriculum = []

    // Start with prerequisites of target
    const targetPrereqs = this.prerequisiteResolver.GetAllPrerequisites(targetId)

    // Filter out already mastered if user provided
    let candidates = targetPrereqs
    if (user) {
      candidates = candidates.filter(id => !user.masteredTheorems.has(id))
    }

    // Rank by suitability
    if (user && candidates.length > 0) {
      const ranked = this.suitabilityRanker.RankBySuitability(user, candidates)
      candidates = ranked.slice(0, 10).map(r => r.theoremId)
    }

    // Build curriculum
    const maxSteps = difficulty === 'easy' ? 5 : difficulty === 'medium' ? 8 : 12
    candidates.slice(0, maxSteps).forEach((theoremId, index) => {
      curriculum.push({
        theoremId,
        reason: index === 0 ? 'Starting point' : 'Prerequisite for target',
        order: index + 1
      })
    })

    // Add target
    curriculum.push({
      theoremId: targetId,
      reason: 'Learning goal',
      order: curriculum.length + 1
    })

    return curriculum
  }

  /**
   * Enrich path with reasons and metadata
   */
  enrichPath(path, difficulty, user) {
    return path.map((theoremId, index) => {
      let reason = ''
      if (index === 0) {
        reason = 'Starting theorem'
      } else if (index === path.length - 1) {
        reason = 'Target theorem'
      } else {
        reason = 'Stepping stone'
      }

      return {
        theoremId,
        reason,
        order: index + 1
      }
    })
  }

  /**
   * Score a path based on average suitability
   */
  pathScore(path, user) {
    if (!user) return path.length // prefer shorter paths

    const scores = path.map(item => {
      const result = this.suitabilityRanker.computeSuitabilityScore(user, item.theoremId)
      return result.score
    })

    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length
    const lengthPenalty = path.length * 2 // prefer shorter

    return avgScore - lengthPenalty
  }
}

// ============================================================================
// 5. PROGRESS TRACKER
// ============================================================================

export class ProgressTracker {
  constructor(graph, storage) {
    this.graph = graph
    this.storage = storage
    this.activeSession = null
  }

  /**
   * Track interaction with a theorem
   * @param {string} userId
   * @param {string} theoremId
   * @param {number} timeSpent - seconds
   * @param {number} understanding - 0-5 scale (optional)
   */
  TrackProgress(userId, theoremId, timeSpent, understanding = null) {
    const progress = this.storage.load(userId)

    // Get or create theorem progress
    let theoremProgress = progress.theorems.get(theoremId)
    if (!theoremProgress) {
      theoremProgress = {
        theoremId,
        timeSpent: 0,
        visits: 0,
        understandingScore: 0,
        completionRate: 0,
        firstVisited: new Date(),
        lastVisited: new Date(),
        proofStepsCompleted: [],
        exported: false,
        explored: false
      }
      progress.theorems.set(theoremId, theoremProgress)
    }

    // Update metrics
    theoremProgress.timeSpent += timeSpent
    theoremProgress.visits += 1
    theoremProgress.lastVisited = new Date()

    if (understanding !== null) {
      theoremProgress.understandingScore = understanding
    }

    // Auto-classify based on engagement
    this.classifyTheoremStatus(progress, theoremId)

    // Recompute overall level
    this.computeOverallLevel(progress)

    this.storage.save(progress)

    return theoremProgress
  }

  /**
   * Start a learning session
   */
  startSession(userId, theoremId) {
    this.activeSession = {
      userId,
      theoremId,
      startTime: Date.now(),
      interactions: []
    }
  }

  /**
   * End learning session and save
   */
  endSession() {
    if (!this.activeSession) return

    const duration = Math.floor((Date.now() - this.activeSession.startTime) / 1000)

    this.TrackProgress(
      this.activeSession.userId,
      this.activeSession.theoremId,
      duration
    )

    this.activeSession = null
  }

  /**
   * Record proof step completion
   */
  recordStepCompletion(userId, theoremId, stepId) {
    const progress = this.storage.load(userId)
    const theoremProgress = progress.theorems.get(theoremId)

    if (theoremProgress && !theoremProgress.proofStepsCompleted.includes(stepId)) {
      theoremProgress.proofStepsCompleted.push(stepId)

      // Update completion rate
      const node = this.graph?.byId?.get(theoremId)
      const totalSteps = node?.proof?.steps?.length || 1
      theoremProgress.completionRate = theoremProgress.proofStepsCompleted.length / totalSteps

      this.classifyTheoremStatus(progress, theoremId)
      this.storage.save(progress)
    }
  }

  /**
   * Record LaTeX export
   */
  recordExport(userId, theoremId) {
    const progress = this.storage.load(userId)
    const theoremProgress = progress.theorems.get(theoremId)

    if (theoremProgress) {
      theoremProgress.exported = true
      this.storage.save(progress)
    }
  }

  /**
   * Record proof explorer usage
   */
  recordExplorerUsage(userId, theoremId) {
    const progress = this.storage.load(userId)
    const theoremProgress = progress.theorems.get(theoremId)

    if (theoremProgress) {
      theoremProgress.explored = true
      this.storage.save(progress)
    }
  }

  /**
   * Mark theorem as mastered
   */
  markAsMastered(userId, theoremId) {
    const progress = this.storage.load(userId)
    progress.masteredTheorems.add(theoremId)
    progress.inProgressTheorems.delete(theoremId)
    this.computeOverallLevel(progress)
    this.storage.save(progress)
  }

  /**
   * Classify theorem status based on engagement
   */
  classifyTheoremStatus(progress, theoremId) {
    const theoremProgress = progress.theorems.get(theoremId)
    if (!theoremProgress) return

    const {
      timeSpent,
      visits,
      understandingScore,
      completionRate,
      explored,
      exported
    } = theoremProgress

    // Mastery criteria
    const isMastered = (
      understandingScore >= 4 &&
      completionRate >= 0.8 &&
      visits >= 3 &&
      timeSpent >= 180
    ) || (
      understandingScore === 5 &&
      completionRate === 1.0
    )

    if (isMastered) {
      progress.masteredTheorems.add(theoremId)
      progress.inProgressTheorems.delete(theoremId)
    } else if (visits > 0) {
      progress.inProgressTheorems.add(theoremId)
    }
  }

  /**
   * Compute user's overall skill level (0-100)
   */
  computeOverallLevel(progress) {
    const masteredCount = progress.masteredTheorems.size
    const inProgressCount = progress.inProgressTheorems.size

    // Base score from mastered theorems
    let level = masteredCount * 5

    // Bonus from in-progress theorems
    level += inProgressCount * 1.5

    // Bonus from high-importance theorems
    progress.masteredTheorems.forEach(theoremId => {
      const node = this.graph?.byId?.get(theoremId)
      if (node && node.importance >= 0.85) {
        level += 5
      }
    })

    progress.overallLevel = Math.min(Math.round(level), 100)
  }

  /**
   * Get learning statistics
   */
  getStats(userId) {
    const progress = this.storage.load(userId)

    const totalTime = Array.from(progress.theorems.values())
      .reduce((sum, t) => sum + t.timeSpent, 0)

    const avgUnderstanding = Array.from(progress.theorems.values())
      .filter(t => t.understandingScore > 0)
      .reduce((sum, t, _, arr) => sum + t.understandingScore / arr.length, 0)

    return {
      totalTheoremsStudied: progress.theorems.size,
      masteredCount: progress.masteredTheorems.size,
      inProgressCount: progress.inProgressTheorems.size,
      totalTimeMinutes: Math.round(totalTime / 60),
      averageUnderstanding: avgUnderstanding.toFixed(1),
      overallLevel: progress.overallLevel
    }
  }
}

// ============================================================================
// 6. MAIN LEARNING PATH MANAGER
// ============================================================================

export class LearningPathManager {
  constructor(graph) {
    this.graph = graph
    this.storage = new ProgressStorage()
    this.prerequisiteResolver = new PrerequisiteResolver(graph)
    this.suitabilityRanker = new SuitabilityRanker(graph, this.prerequisiteResolver)
    this.curriculumBuilder = new CurriculumBuilder(
      graph,
      this.prerequisiteResolver,
      this.suitabilityRanker
    )
    this.progressTracker = new ProgressTracker(graph, this.storage)
  }

  /**
   * Get next recommended theorems for user
   */
  getRecommendations(userId, count = 5) {
    const progress = this.storage.load(userId)

    // Find candidates: theorems with mastered prerequisites
    const allNodes = Array.from(this.graph?.byId?.values() || [])
    const candidates = allNodes
      .map(n => n.id)
      .filter(id => !progress.masteredTheorems.has(id))
      .filter(id => {
        const prereqs = this.prerequisiteResolver.GetPrerequisites(id)
        return prereqs.every(p => progress.masteredTheorems.has(p)) ||
               prereqs.length === 0
      })

    // Rank by suitability
    const ranked = this.suitabilityRanker.RankBySuitability(progress, candidates)

    return ranked.slice(0, count)
  }

  /**
   * Create custom curriculum
   */
  createCurriculum(userId, startTopic, targetTopic, difficulty = 'medium') {
    const progress = this.storage.load(userId)
    return this.curriculumBuilder.CreateCurriculum(
      startTopic,
      targetTopic,
      difficulty,
      progress
    )
  }

  /**
   * Track theorem interaction
   */
  trackProgress(userId, theoremId, timeSpent, understanding) {
    return this.progressTracker.TrackProgress(userId, theoremId, timeSpent, understanding)
  }

  /**
   * Get user statistics
   */
  getUserStats(userId) {
    return this.progressTracker.getStats(userId)
  }

  /**
   * Export/Import progress
   */
  exportProgress() {
    return this.storage.exportToJSON()
  }

  importProgress(jsonString) {
    return this.storage.importFromJSON(jsonString)
  }
}

export default LearningPathManager
