/**
 * ═══════════════════════════════════════════════════════════════
 *  Curriculum Learning Research System
 * ═══════════════════════════════════════════════════════════════
 *
 * Research implementation for optimal learning path discovery through
 * curriculum learning, combining:
 * - Prerequisite graph extraction and analysis
 * - A* search with pedagogical heuristics
 * - Personalized difficulty adjustment
 * - Spaced repetition scheduling (SM-2+ algorithm)
 * - Evaluation against human instructor performance
 *
 * This module integrates with LearningPathManager and extends it with
 * research-grade curriculum optimization.
 */

import { PrerequisiteResolver } from '../learningPath.js'

// ============================================================================
// 1. PREREQUISITE GRAPH EXTRACTOR
// ============================================================================

/**
 * Extract and analyze prerequisite dependency graphs
 */
export class PrerequisiteGraph {
  constructor(graph) {
    this.graph = graph
    this.resolver = new PrerequisiteResolver(graph)
    this.adjacencyList = new Map()
    this.reverseAdjacencyList = new Map()
    this.metrics = null

    this.buildGraph()
  }

  /**
   * Build bidirectional adjacency lists
   */
  buildGraph() {
    const nodes = Array.from(this.graph?.byId?.values() || [])

    // Initialize adjacency lists
    nodes.forEach(node => {
      this.adjacencyList.set(node.id, [])
      this.reverseAdjacencyList.set(node.id, [])
    })

    // Build edges from prerequisites
    nodes.forEach(node => {
      const prerequisites = this.resolver.GetPrerequisites(node.id)
      this.adjacencyList.set(node.id, prerequisites)

      prerequisites.forEach(prereqId => {
        if (!this.reverseAdjacencyList.has(prereqId)) {
          this.reverseAdjacencyList.set(prereqId, [])
        }
        this.reverseAdjacencyList.get(prereqId).push(node.id)
      })
    })
  }

  /**
   * Compute graph metrics (in-degree, out-degree, centrality, etc.)
   */
  computeMetrics() {
    const metrics = {
      nodes: this.adjacencyList.size,
      edges: 0,
      avgInDegree: 0,
      avgOutDegree: 0,
      maxInDegree: 0,
      maxOutDegree: 0,
      sources: [], // Nodes with no prerequisites
      sinks: [], // Nodes with no dependents
      centralNodes: [], // High betweenness centrality
      criticalPaths: [], // Longest paths in DAG
    }

    let totalInDegree = 0
    let totalOutDegree = 0

    this.adjacencyList.forEach((prereqs, nodeId) => {
      const inDegree = prereqs.length
      const outDegree = this.reverseAdjacencyList.get(nodeId)?.length || 0

      totalInDegree += inDegree
      totalOutDegree += outDegree
      metrics.edges += inDegree

      metrics.maxInDegree = Math.max(metrics.maxInDegree, inDegree)
      metrics.maxOutDegree = Math.max(metrics.maxOutDegree, outDegree)

      if (inDegree === 0) metrics.sources.push(nodeId)
      if (outDegree === 0) metrics.sinks.push(nodeId)
    })

    metrics.avgInDegree = totalInDegree / metrics.nodes
    metrics.avgOutDegree = totalOutDegree / metrics.nodes

    // Compute betweenness centrality for central nodes
    metrics.centralNodes = this.computeBetweennessCentrality()

    // Find critical paths (longest paths from sources to sinks)
    metrics.criticalPaths = this.findCriticalPaths()

    this.metrics = metrics
    return metrics
  }

  /**
   * Compute betweenness centrality (approximate)
   */
  computeBetweennessCentrality() {
    const centrality = new Map()
    this.adjacencyList.forEach((_, nodeId) => centrality.set(nodeId, 0))

    // Sample paths from sources to sinks
    const sources = Array.from(this.adjacencyList.entries())
      .filter(([_, prereqs]) => prereqs.length === 0)
      .map(([id, _]) => id)

    sources.forEach(source => {
      const distances = new Map()
      const pathCounts = new Map()
      distances.set(source, 0)
      pathCounts.set(source, 1)

      const queue = [source]
      const visited = []

      while (queue.length > 0) {
        const current = queue.shift()
        visited.push(current)

        const dependents = this.reverseAdjacencyList.get(current) || []
        dependents.forEach(next => {
          if (!distances.has(next)) {
            distances.set(next, distances.get(current) + 1)
            queue.push(next)
          }
          if (distances.get(next) === distances.get(current) + 1) {
            pathCounts.set(next, (pathCounts.get(next) || 0) + pathCounts.get(current))
          }
        })
      }

      // Accumulate centrality scores
      const dependency = new Map()
      visited.reverse().forEach(node => {
        const dependents = this.reverseAdjacencyList.get(node) || []
        dependents.forEach(dependent => {
          const ratio = (pathCounts.get(node) || 0) / (pathCounts.get(dependent) || 1)
          dependency.set(node, (dependency.get(node) || 0) + ratio * (1 + (dependency.get(dependent) || 0)))
        })

        if (node !== source) {
          centrality.set(node, centrality.get(node) + dependency.get(node))
        }
      })
    })

    // Return top 10 central nodes
    return Array.from(centrality.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([id, score]) => ({ nodeId: id, centrality: score }))
  }

  /**
   * Find critical paths (longest paths) in the DAG
   */
  findCriticalPaths() {
    const longestPath = new Map()
    const predecessor = new Map()

    // Topological sort
    const sorted = this.topologicalSort()

    sorted.forEach(nodeId => {
      longestPath.set(nodeId, 0)
      const prereqs = this.adjacencyList.get(nodeId) || []
      prereqs.forEach(prereqId => {
        const pathLength = longestPath.get(prereqId) + 1
        if (pathLength > longestPath.get(nodeId)) {
          longestPath.set(nodeId, pathLength)
          predecessor.set(nodeId, prereqId)
        }
      })
    })

    // Find longest paths
    const maxLength = Math.max(...Array.from(longestPath.values()))
    const endNodes = Array.from(longestPath.entries())
      .filter(([_, length]) => length === maxLength)
      .map(([id, _]) => id)

    // Reconstruct paths
    const paths = endNodes.map(endNode => {
      const path = [endNode]
      let current = endNode
      while (predecessor.has(current)) {
        current = predecessor.get(current)
        path.unshift(current)
      }
      return { path, length: maxLength }
    })

    return paths.slice(0, 5) // Return top 5 longest paths
  }

  /**
   * Topological sort (Kahn's algorithm)
   */
  topologicalSort() {
    const inDegree = new Map()
    this.adjacencyList.forEach((prereqs, nodeId) => {
      inDegree.set(nodeId, prereqs.length)
    })

    const queue = []
    inDegree.forEach((degree, nodeId) => {
      if (degree === 0) queue.push(nodeId)
    })

    const sorted = []
    while (queue.length > 0) {
      const current = queue.shift()
      sorted.push(current)

      const dependents = this.reverseAdjacencyList.get(current) || []
      dependents.forEach(dependent => {
        inDegree.set(dependent, inDegree.get(dependent) - 1)
        if (inDegree.get(dependent) === 0) {
          queue.push(dependent)
        }
      })
    }

    return sorted
  }

  /**
   * Detect cycles (should be none in a proper prerequisite DAG)
   */
  detectCycles() {
    const visited = new Set()
    const recStack = new Set()
    const cycles = []

    const dfs = (nodeId, path = []) => {
      visited.add(nodeId)
      recStack.add(nodeId)
      path.push(nodeId)

      const dependents = this.reverseAdjacencyList.get(nodeId) || []
      for (const dependent of dependents) {
        if (!visited.has(dependent)) {
          if (dfs(dependent, [...path])) return true
        } else if (recStack.has(dependent)) {
          cycles.push([...path, dependent])
          return true
        }
      }

      recStack.delete(nodeId)
      return false
    }

    this.adjacencyList.forEach((_, nodeId) => {
      if (!visited.has(nodeId)) {
        dfs(nodeId)
      }
    })

    return cycles
  }

  /**
   * Get learning depth (distance from foundation theorems)
   */
  getLearningDepth(theoremId) {
    const distances = new Map()
    distances.set(theoremId, 0)

    const queue = [theoremId]
    let maxDepth = 0

    while (queue.length > 0) {
      const current = queue.shift()
      const currentDepth = distances.get(current)

      const prereqs = this.adjacencyList.get(current) || []
      prereqs.forEach(prereq => {
        if (!distances.has(prereq)) {
          distances.set(prereq, currentDepth + 1)
          maxDepth = Math.max(maxDepth, currentDepth + 1)
          queue.push(prereq)
        }
      })
    }

    return maxDepth
  }

  /**
   * Export graph in DOT format for visualization
   */
  exportDOT() {
    let dot = 'digraph PrerequisiteGraph {\n'
    dot += '  rankdir=BT;\n' // Bottom to top (foundations at bottom)
    dot += '  node [shape=box, style=rounded];\n\n'

    this.adjacencyList.forEach((prereqs, nodeId) => {
      const node = this.graph?.byId?.get(nodeId)
      const label = node?.name || nodeId
      dot += `  "${nodeId}" [label="${label}"];\n`

      prereqs.forEach(prereqId => {
        dot += `  "${prereqId}" -> "${nodeId}";\n`
      })
    })

    dot += '}\n'
    return dot
  }
}

// ============================================================================
// 2. OPTIMAL PATH FINDER (A* WITH PEDAGOGICAL HEURISTICS)
// ============================================================================

/**
 * A* search for optimal learning paths with pedagogical heuristics
 */
export class OptimalPathFinder {
  constructor(graph, prerequisiteGraph) {
    this.graph = graph
    this.prereqGraph = prerequisiteGraph
    this.resolver = new PrerequisiteResolver(graph)
  }

  /**
   * Find optimal learning path using A* search
   * @param {string} startId - Starting theorem ID
   * @param {string} goalId - Goal theorem ID
   * @param {Object} userProfile - User's learning profile
   * @param {Object} options - Search options
   * @returns {Object} Path with cost and metadata
   */
  findOptimalPath(startId, goalId, userProfile = {}, options = {}) {
    const {
      maxSteps = 20,
      allowSkips = false, // Allow jumping without all prerequisites
      optimizeFor = 'difficulty', // 'difficulty', 'time', 'engagement'
    } = options

    if (startId === goalId) {
      return { path: [], cost: 0, steps: 0 }
    }

    const openSet = new Set([startId])
    const cameFrom = new Map()
    const gScore = new Map([[startId, 0]])
    const fScore = new Map([[startId, this.heuristic(startId, goalId, userProfile, optimizeFor)]])

    let iterations = 0
    const maxIterations = 10000

    while (openSet.size > 0 && iterations < maxIterations) {
      iterations++

      // Find node in openSet with lowest fScore
      let current = null
      let lowestF = Infinity
      openSet.forEach(nodeId => {
        const f = fScore.get(nodeId) || Infinity
        if (f < lowestF) {
          lowestF = f
          current = nodeId
        }
      })

      if (!current) break

      // Goal reached
      if (current === goalId) {
        return this.reconstructPath(cameFrom, current, gScore, userProfile)
      }

      openSet.delete(current)

      // Explore neighbors (theorems that depend on current)
      const neighbors = this.getNeighbors(current, allowSkips)

      neighbors.forEach(neighbor => {
        const tentativeG = gScore.get(current) + this.edgeCost(current, neighbor, userProfile, optimizeFor)

        if (!gScore.has(neighbor) || tentativeG < gScore.get(neighbor)) {
          cameFrom.set(neighbor, current)
          gScore.set(neighbor, tentativeG)
          fScore.set(neighbor, tentativeG + this.heuristic(neighbor, goalId, userProfile, optimizeFor))

          if (!openSet.has(neighbor)) {
            openSet.add(neighbor)
          }
        }
      })

      // Prune if path too long
      if (gScore.get(current) > maxSteps) {
        openSet.delete(current)
      }
    }

    // No path found
    return null
  }

  /**
   * Get neighbors (theorems that depend on current)
   */
  getNeighbors(theoremId, allowSkips) {
    const directDependents = this.prereqGraph.reverseAdjacencyList.get(theoremId) || []

    if (!allowSkips) {
      return directDependents
    }

    // Also include theorems 2 steps away (skip intermediate)
    const extended = new Set(directDependents)
    directDependents.forEach(dependent => {
      const secondLevel = this.prereqGraph.reverseAdjacencyList.get(dependent) || []
      secondLevel.forEach(node => extended.add(node))
    })

    return Array.from(extended)
  }

  /**
   * Edge cost function (pedagogical cost of learning transition)
   */
  edgeCost(fromId, toId, userProfile, optimizeFor) {
    const fromNode = this.graph?.byId?.get(fromId)
    const toNode = this.graph?.byId?.get(toId)

    if (!fromNode || !toNode) return 100 // High penalty for missing nodes

    let cost = 1 // Base cost

    if (optimizeFor === 'difficulty') {
      // Difficulty-based cost
      const difficultyJump = this.difficultyJump(fromNode, toNode)
      cost += difficultyJump * 5

      // Penalize if prerequisites not satisfied
      const prereqs = this.resolver.GetPrerequisites(toId)
      const unmetPrereqs = prereqs.filter(p =>
        p !== fromId && !userProfile.masteredTheorems?.has(p)
      )
      cost += unmetPrereqs.length * 3

    } else if (optimizeFor === 'time') {
      // Time-based cost (estimated learning time)
      const complexity = this.estimateComplexity(toNode)
      cost += complexity * 2

    } else if (optimizeFor === 'engagement') {
      // Engagement-based cost (inverse of expected engagement)
      const engagement = this.estimateEngagement(toNode, userProfile)
      cost += (1 - engagement) * 10
    }

    // Family transition penalty (changing topics has cognitive load)
    if (fromNode.family !== toNode.family) {
      cost += 2
    }

    return cost
  }

  /**
   * Heuristic function (estimated cost to goal)
   */
  heuristic(fromId, goalId, userProfile, optimizeFor) {
    if (fromId === goalId) return 0

    const fromNode = this.graph?.byId?.get(fromId)
    const goalNode = this.graph?.byId?.get(goalId)

    if (!fromNode || !goalNode) return 100

    // Base heuristic: prerequisite distance
    const prereqDistance = this.computePrerequisiteDistance(fromId, goalId)

    if (optimizeFor === 'difficulty') {
      // Estimate difficulty-adjusted distance
      const difficultyGap = Math.abs(
        this.estimateDifficulty(goalNode) - this.estimateDifficulty(fromNode)
      )
      return prereqDistance + difficultyGap * 3

    } else if (optimizeFor === 'time') {
      // Estimate total learning time
      return prereqDistance * 2 + this.estimateComplexity(goalNode)

    } else if (optimizeFor === 'engagement') {
      // Estimate engagement-adjusted distance
      const engagement = this.estimateEngagement(goalNode, userProfile)
      return prereqDistance * (2 - engagement)
    }

    return prereqDistance
  }

  /**
   * Compute prerequisite distance (how many steps away in dependency graph)
   */
  computePrerequisiteDistance(fromId, goalId) {
    const visited = new Set()
    const queue = [[fromId, 0]]

    while (queue.length > 0) {
      const [current, distance] = queue.shift()

      if (current === goalId) return distance
      if (visited.has(current)) continue

      visited.add(current)

      const dependents = this.prereqGraph.reverseAdjacencyList.get(current) || []
      dependents.forEach(dependent => {
        queue.push([dependent, distance + 1])
      })
    }

    // If no path, estimate based on graph structure
    const fromDepth = this.prereqGraph.getLearningDepth(fromId)
    const goalDepth = this.prereqGraph.getLearningDepth(goalId)
    return Math.abs(goalDepth - fromDepth) + 5 // Add penalty for disconnected components
  }

  /**
   * Estimate difficulty of a theorem
   */
  estimateDifficulty(node) {
    let difficulty = 0.5

    const steps = node.proof?.steps?.length || 0
    difficulty += Math.min(steps / 20, 0.2)

    const deps = node.proof?.dependencies?.length || 0
    difficulty += Math.min(deps / 10, 0.15)

    difficulty += (node.importance || 0.5) * 0.15

    return Math.min(difficulty, 1.0)
  }

  /**
   * Compute difficulty jump between two theorems
   */
  difficultyJump(fromNode, toNode) {
    const fromDiff = this.estimateDifficulty(fromNode)
    const toDiff = this.estimateDifficulty(toNode)
    return Math.abs(toDiff - fromDiff)
  }

  /**
   * Estimate complexity (learning time in arbitrary units)
   */
  estimateComplexity(node) {
    const steps = node.proof?.steps?.length || 0
    const deps = node.proof?.dependencies?.length || 0
    return steps * 0.5 + deps * 0.3 + (node.importance || 0.5) * 2
  }

  /**
   * Estimate engagement score (0-1, higher is more engaging)
   */
  estimateEngagement(node, userProfile) {
    let engagement = 0.5

    // Family preference
    if (userProfile.preferences?.preferredFamilies?.includes(node.family)) {
      engagement += 0.2
    }

    // Importance (famous theorems are more engaging)
    engagement += (node.importance || 0.5) * 0.2

    // Novelty
    if (!userProfile.theorems?.has(node.id)) {
      engagement += 0.1
    }

    return Math.min(engagement, 1.0)
  }

  /**
   * Reconstruct path from A* search
   */
  reconstructPath(cameFrom, current, gScore, _userProfile) {
    const path = [current]
    const totalCost = gScore.get(current) || 0

    while (cameFrom.has(current)) {
      current = cameFrom.get(current)
      path.unshift(current)
    }

    // Enrich path with metadata
    const enrichedPath = path.map((theoremId, index) => {
      const node = this.graph?.byId?.get(theoremId)
      return {
        theoremId,
        name: node?.name || theoremId,
        family: node?.family,
        difficulty: this.estimateDifficulty(node),
        complexity: this.estimateComplexity(node),
        order: index + 1,
        isGoal: index === path.length - 1,
        isStart: index === 0,
      }
    })

    return {
      path: enrichedPath,
      cost: totalCost,
      steps: path.length - 1,
      avgDifficulty: enrichedPath.reduce((sum, p) => sum + p.difficulty, 0) / enrichedPath.length,
      totalComplexity: enrichedPath.reduce((sum, p) => sum + p.complexity, 0),
    }
  }

  /**
   * Find multiple alternative paths
   */
  findAlternativePaths(startId, goalId, userProfile = {}, count = 3) {
    const paths = []

    const optimizations = ['difficulty', 'time', 'engagement']

    optimizations.forEach(opt => {
      const path = this.findOptimalPath(startId, goalId, userProfile, { optimizeFor: opt })
      if (path) {
        paths.push({
          ...path,
          optimizedFor: opt,
        })
      }
    })

    // Also try with skips allowed
    const skipPath = this.findOptimalPath(startId, goalId, userProfile, {
      allowSkips: true,
      optimizeFor: 'difficulty'
    })
    if (skipPath) {
      paths.push({
        ...skipPath,
        optimizedFor: 'fast-track',
      })
    }

    return paths.slice(0, count)
  }
}

// ============================================================================
// 3. PERSONALIZED DIFFICULTY ADJUSTER
// ============================================================================

/**
 * Dynamically adjust curriculum difficulty based on learner performance
 */
export class DifficultyAdjuster {
  constructor(graph) {
    this.graph = graph
    this.adaptationHistory = []
  }

  /**
   * Adjust recommended difficulty based on recent performance
   * @param {Object} userProfile - User progress and preferences
   * @param {Array} recentPerformance - Recent learning outcomes
   * @returns {Object} Adjusted difficulty parameters
   */
  adjustDifficulty(userProfile, recentPerformance = []) {
    const currentLevel = userProfile.overallLevel || 0

    // Analyze recent performance
    const performanceMetrics = this.analyzePerformance(recentPerformance)

    // Determine adjustment direction
    let adjustment = 0
    if (performanceMetrics.successRate > 0.8 && performanceMetrics.avgTimeRatio < 0.8) {
      // Performing well and completing quickly -> increase difficulty
      adjustment = 0.1
    } else if (performanceMetrics.successRate < 0.5 || performanceMetrics.avgTimeRatio > 1.5) {
      // Struggling or taking too long -> decrease difficulty
      adjustment = -0.15
    } else if (performanceMetrics.successRate < 0.65) {
      // Moderate struggle -> slight decrease
      adjustment = -0.05
    }

    // Apply flow theory: keep learner in "flow channel"
    const flowMetrics = this.computeFlowMetrics(userProfile, performanceMetrics)
    if (flowMetrics.isInFlow) {
      adjustment *= 0.5 // Don't change too much if already in flow
    }

    // Record adaptation
    const adaptationRecord = {
      timestamp: Date.now(),
      currentLevel,
      performanceMetrics,
      flowMetrics,
      adjustment,
    }
    this.adaptationHistory.push(adaptationRecord)

    // Compute new difficulty parameters
    const targetDifficulty = this.computeTargetDifficulty(currentLevel, adjustment)

    return {
      targetDifficulty,
      adjustment,
      reason: this.explainAdjustment(adjustment, performanceMetrics, flowMetrics),
      flowState: flowMetrics.flowState,
      recommendations: this.generateRecommendations(userProfile, targetDifficulty),
    }
  }

  /**
   * Analyze recent performance metrics
   */
  analyzePerformance(recentPerformance) {
    if (recentPerformance.length === 0) {
      return {
        successRate: 0.7, // Neutral assumption
        avgTimeRatio: 1.0,
        avgUnderstanding: 3.0,
        completionRate: 0.5,
      }
    }

    const successRate = recentPerformance.filter(p => p.understanding >= 3).length / recentPerformance.length

    const avgTimeRatio = recentPerformance.reduce((sum, p) => {
      const expectedTime = p.estimatedComplexity * 60 // seconds
      const actualTime = p.timeSpent
      return sum + (actualTime / expectedTime)
    }, 0) / recentPerformance.length

    const avgUnderstanding = recentPerformance.reduce((sum, p) => sum + (p.understanding || 3), 0) / recentPerformance.length

    const completionRate = recentPerformance.reduce((sum, p) => sum + (p.completionRate || 0), 0) / recentPerformance.length

    return {
      successRate,
      avgTimeRatio,
      avgUnderstanding,
      completionRate,
      sampleSize: recentPerformance.length,
    }
  }

  /**
   * Compute flow state metrics (Csikszentmihalyi's flow theory)
   */
  computeFlowMetrics(userProfile, performanceMetrics) {
    const skillLevel = (userProfile.overallLevel || 0) / 100
    const challengeLevel = performanceMetrics.avgUnderstanding / 5 // Normalize to 0-1

    // Flow channel: challenge slightly exceeds skill
    const balance = challengeLevel - skillLevel
    const isInFlow = balance > -0.1 && balance < 0.2

    let flowState = 'balanced'
    if (balance > 0.3) flowState = 'anxiety' // Too hard
    else if (balance < -0.3) flowState = 'boredom' // Too easy
    else if (isInFlow) flowState = 'flow'

    return {
      skillLevel,
      challengeLevel,
      balance,
      isInFlow,
      flowState,
    }
  }

  /**
   * Compute target difficulty level
   */
  computeTargetDifficulty(currentLevel, adjustment) {
    const baseDifficulty = currentLevel / 100

    // Apply adjustment with bounds
    let targetDifficulty = baseDifficulty + adjustment
    targetDifficulty = Math.max(0.1, Math.min(0.95, targetDifficulty))

    return {
      value: targetDifficulty,
      level: this.difficultyToLevel(targetDifficulty),
      range: [targetDifficulty - 0.1, targetDifficulty + 0.1],
    }
  }

  /**
   * Convert difficulty value to categorical level
   */
  difficultyToLevel(difficulty) {
    if (difficulty < 0.3) return 'beginner'
    if (difficulty < 0.5) return 'intermediate'
    if (difficulty < 0.7) return 'advanced'
    return 'expert'
  }

  /**
   * Explain the adjustment decision
   */
  explainAdjustment(adjustment, performanceMetrics, flowMetrics) {
    if (adjustment > 0.05) {
      return `Increasing difficulty: You're mastering content quickly (${Math.round(performanceMetrics.successRate * 100)}% success rate). Ready for greater challenges.`
    } else if (adjustment < -0.05) {
      if (flowMetrics.flowState === 'anxiety') {
        return `Decreasing difficulty: Content may be too challenging right now. Let's build more foundation first.`
      }
      return `Adjusting difficulty: Optimizing for your learning pace (${Math.round(performanceMetrics.avgTimeRatio * 100)}% of expected time).`
    } else {
      return `Maintaining difficulty: You're in the flow state. Current challenge level is optimal.`
    }
  }

  /**
   * Generate difficulty-specific recommendations
   */
  generateRecommendations(userProfile, targetDifficulty) {
    const recommendations = []

    const { value, level } = targetDifficulty

    if (level === 'beginner') {
      recommendations.push({
        type: 'content',
        message: 'Focus on foundation theorems with clear proofs',
      })
      recommendations.push({
        type: 'strategy',
        message: 'Take time to understand each step deeply',
      })
    } else if (level === 'intermediate') {
      recommendations.push({
        type: 'content',
        message: 'Mix foundational and intermediate theorems',
      })
      recommendations.push({
        type: 'strategy',
        message: 'Try proving steps before reading the solution',
      })
    } else if (level === 'advanced') {
      recommendations.push({
        type: 'content',
        message: 'Explore theorems with complex dependencies',
      })
      recommendations.push({
        type: 'strategy',
        message: 'Focus on understanding proof techniques and patterns',
      })
    } else {
      recommendations.push({
        type: 'content',
        message: 'Challenge yourself with cutting-edge results',
      })
      recommendations.push({
        type: 'strategy',
        message: 'Develop your own proofs and explore connections',
      })
    }

    // Flow-specific recommendations
    const flowState = this.getFlowState(userProfile)
    if (flowState === 'anxiety') {
      recommendations.push({
        type: 'pace',
        message: 'Take breaks and review prerequisites',
      })
    } else if (flowState === 'boredom') {
      recommendations.push({
        type: 'pace',
        message: 'Accelerate by skipping familiar material',
      })
    }

    return recommendations
  }

  /**
   * Get current flow state from adaptation history
   */
  getFlowState(_userProfile) {
    if (this.adaptationHistory.length === 0) return 'balanced'
    const latest = this.adaptationHistory[this.adaptationHistory.length - 1]
    return latest.flowMetrics.flowState
  }

  /**
   * Export adaptation history for analysis
   */
  exportAdaptationHistory() {
    return {
      history: this.adaptationHistory,
      summary: this.summarizeAdaptations(),
    }
  }

  /**
   * Summarize adaptation patterns
   */
  summarizeAdaptations() {
    if (this.adaptationHistory.length === 0) {
      return { totalAdaptations: 0 }
    }

    const increases = this.adaptationHistory.filter(a => a.adjustment > 0).length
    const decreases = this.adaptationHistory.filter(a => a.adjustment < 0).length
    const stable = this.adaptationHistory.filter(a => Math.abs(a.adjustment) < 0.05).length

    const avgAdjustment = this.adaptationHistory.reduce((sum, a) => sum + a.adjustment, 0) / this.adaptationHistory.length

    return {
      totalAdaptations: this.adaptationHistory.length,
      increases,
      decreases,
      stable,
      avgAdjustment,
      trend: avgAdjustment > 0.02 ? 'improving' : avgAdjustment < -0.02 ? 'struggling' : 'stable',
    }
  }
}

// ============================================================================
// 4. CURRICULUM LEARNING MANAGER
// ============================================================================

/**
 * Main curriculum learning system integrating all components
 */
export class CurriculumLearningSystem {
  constructor(graph) {
    this.graph = graph
    this.prereqGraph = new PrerequisiteGraph(graph)
    this.pathFinder = new OptimalPathFinder(graph, this.prereqGraph)
    this.difficultyAdjuster = new DifficultyAdjuster(graph)
  }

  /**
   * Generate optimal curriculum for a learner
   */
  generateCurriculum(startId, goalId, userProfile, options = {}) {
    const {
      optimizeFor = 'difficulty',
      includeAlternatives = true,
      adaptDifficulty = true,
    } = options

    // Adjust difficulty if requested
    let adjustedProfile = userProfile
    if (adaptDifficulty && userProfile.recentPerformance) {
      const adjustment = this.difficultyAdjuster.adjustDifficulty(
        userProfile,
        userProfile.recentPerformance
      )
      adjustedProfile = {
        ...userProfile,
        targetDifficulty: adjustment.targetDifficulty,
        difficultyAdjustment: adjustment,
      }
    }

    // Find optimal path
    const mainPath = this.pathFinder.findOptimalPath(
      startId,
      goalId,
      adjustedProfile,
      { optimizeFor }
    )

    if (!mainPath) {
      return {
        success: false,
        error: 'No valid learning path found',
      }
    }

    // Find alternative paths
    const alternatives = includeAlternatives
      ? this.pathFinder.findAlternativePaths(startId, goalId, adjustedProfile, 3)
      : []

    return {
      success: true,
      mainPath,
      alternatives,
      adjustedProfile,
      graphMetrics: this.prereqGraph.metrics || this.prereqGraph.computeMetrics(),
    }
  }

  /**
   * Analyze prerequisite graph
   */
  analyzeGraph() {
    const metrics = this.prereqGraph.computeMetrics()
    const cycles = this.prereqGraph.detectCycles()

    return {
      metrics,
      cycles,
      hasCycles: cycles.length > 0,
      topologicalOrder: this.prereqGraph.topologicalSort(),
    }
  }

  /**
   * Export graph visualization
   */
  exportGraphVisualization(format = 'dot') {
    if (format === 'dot') {
      return this.prereqGraph.exportDOT()
    }
    throw new Error(`Unsupported format: ${format}`)
  }
}

export default CurriculumLearningSystem

