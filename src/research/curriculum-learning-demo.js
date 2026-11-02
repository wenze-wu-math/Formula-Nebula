/**
 * ═══════════════════════════════════════════════════════════════
 *  Curriculum Learning System Demo & Evaluation
 * ═══════════════════════════════════════════════════════════════
 *
 * Comprehensive demonstration and evaluation of the curriculum learning
 * research system.
 */

import CurriculumLearningSystem from './curriculum-learning.mjs'
import SpacedRepetitionScheduler, { PrerequisiteAwareScheduler } from './spaced-repetition.js'
import {
  MultiObjectiveOptimizer,
  HumanBaselineEvaluator,
  LearningOutcomePredictor,
} from './optimal-paths.js'

// ============================================================================
// DEMO FUNCTIONS
// ============================================================================

/**
 * Demo 1: Extract and analyze prerequisite graph
 */
export function demoPrerequisiteGraph(graph) {
  console.log('='.repeat(70))
  console.log('DEMO 1: Prerequisite Graph Analysis')
  console.log('='.repeat(70))

  const system = new CurriculumLearningSystem(graph)
  const analysis = system.analyzeGraph()

  console.log('\n📊 Graph Metrics:')
  console.log(`  Total nodes: ${analysis.metrics.nodes}`)
  console.log(`  Total edges: ${analysis.metrics.edges}`)
  console.log(`  Average in-degree: ${analysis.metrics.avgInDegree.toFixed(2)}`)
  console.log(`  Average out-degree: ${analysis.metrics.avgOutDegree.toFixed(2)}`)
  console.log(`  Max in-degree: ${analysis.metrics.maxInDegree}`)
  console.log(`  Max out-degree: ${analysis.metrics.maxOutDegree}`)
  console.log(`  Foundation theorems (no prerequisites): ${analysis.metrics.sources.length}`)
  console.log(`  Advanced theorems (no dependents): ${analysis.metrics.sinks.length}`)

  console.log('\n🔝 Central Nodes (by betweenness centrality):')
  analysis.metrics.centralNodes.slice(0, 5).forEach((node, i) => {
    const theorem = graph?.byId?.get(node.nodeId)
    console.log(`  ${i + 1}. ${theorem?.name || node.nodeId} (centrality: ${node.centrality.toFixed(2)})`)
  })

  console.log('\n🛤️  Critical Paths (longest learning sequences):')
  analysis.metrics.criticalPaths.slice(0, 3).forEach((pathInfo, i) => {
    console.log(`  Path ${i + 1}: ${pathInfo.length} steps`)
    pathInfo.path.slice(0, 5).forEach(id => {
      const theorem = graph?.byId?.get(id)
      console.log(`    → ${theorem?.name || id}`)
    })
    if (pathInfo.path.length > 5) console.log(`    ... and ${pathInfo.path.length - 5} more`)
  })

  console.log('\n🔄 Cycles detected:', analysis.hasCycles ? 'YES ⚠️' : 'NO ✓')
  if (analysis.hasCycles) {
    console.log('  Warning: Prerequisite cycles found. This indicates circular dependencies.')
    analysis.cycles.forEach((cycle, i) => {
      console.log(`  Cycle ${i + 1}: ${cycle.map(id => graph?.byId?.get(id)?.name || id).join(' → ')}`)
    })
  }

  return analysis
}

/**
 * Demo 2: Find optimal learning path with A*
 */
export function demoOptimalPath(graph, startId, goalId, userProfile) {
  console.log('\n' + '='.repeat(70))
  console.log('DEMO 2: Optimal Path Finding (A* Search)')
  console.log('='.repeat(70))

  const startNode = graph?.byId?.get(startId)
  const goalNode = graph?.byId?.get(goalId)

  console.log(`\n🎯 Finding path from:`)
  console.log(`   Start: ${startNode?.name || startId}`)
  console.log(`   Goal:  ${goalNode?.name || goalId}`)

  const system = new CurriculumLearningSystem(graph)

  // Generate curriculum with different optimizations
  const result = system.generateCurriculum(startId, goalId, userProfile, {
    includeAlternatives: true,
    adaptDifficulty: true,
  })

  if (!result.success) {
    console.log('\n❌ Error:', result.error)
    return null
  }

  console.log('\n✅ Main Path Found:')
  console.log(`   Steps: ${result.mainPath.steps}`)
  console.log(`   Total cost: ${result.mainPath.cost.toFixed(2)}`)
  console.log(`   Avg difficulty: ${result.mainPath.avgDifficulty.toFixed(2)}`)
  console.log(`   Total complexity: ${result.mainPath.totalComplexity.toFixed(2)}`)

  console.log('\n📚 Learning Sequence:')
  result.mainPath.path.forEach((step, i) => {
    const marker = step.isStart ? '🏁' : step.isGoal ? '🎯' : '→'
    console.log(`   ${marker} ${i + 1}. ${step.name}`)
    console.log(`      Family: ${step.family}, Difficulty: ${step.difficulty.toFixed(2)}, Complexity: ${step.complexity.toFixed(1)}`)
  })

  if (result.alternatives && result.alternatives.length > 0) {
    console.log('\n🔀 Alternative Paths:')
    result.alternatives.forEach((alt, i) => {
      console.log(`   ${i + 1}. ${alt.optimizedFor} optimization:`)
      console.log(`      Steps: ${alt.steps}, Cost: ${alt.cost.toFixed(2)}, Avg Difficulty: ${alt.avgDifficulty.toFixed(2)}`)
    })
  }

  if (result.adjustedProfile?.difficultyAdjustment) {
    const adj = result.adjustedProfile.difficultyAdjustment
    console.log('\n📈 Difficulty Adjustment:')
    console.log(`   ${adj.reason}`)
    console.log(`   Flow state: ${adj.flowState}`)
    console.log(`   Target difficulty: ${adj.targetDifficulty.level} (${adj.targetDifficulty.value.toFixed(2)})`)
  }

  return result
}

/**
 * Demo 3: Personalized difficulty adjustment
 */
export function demoDifficultyAdjustment(userProfile, recentPerformance) {
  console.log('\n' + '='.repeat(70))
  console.log('DEMO 3: Personalized Difficulty Adjustment')
  console.log('='.repeat(70))

  const system = new CurriculumLearningSystem(null)
  const adjustment = system.difficultyAdjuster.adjustDifficulty(userProfile, recentPerformance)

  console.log('\n👤 User Profile:')
  console.log(`   Overall level: ${userProfile.overallLevel}`)
  console.log(`   Mastered theorems: ${userProfile.masteredTheorems?.size || 0}`)
  console.log(`   In progress: ${userProfile.inProgressTheorems?.size || 0}`)

  console.log('\n📊 Recent Performance:')
  if (recentPerformance.length > 0) {
    const successRate = recentPerformance.filter(p => p.understanding >= 3).length / recentPerformance.length
    const avgUnderstanding = recentPerformance.reduce((s, p) => s + p.understanding, 0) / recentPerformance.length
    console.log(`   Success rate: ${(successRate * 100).toFixed(1)}%`)
    console.log(`   Avg understanding: ${avgUnderstanding.toFixed(1)}/5`)
    console.log(`   Sample size: ${recentPerformance.length} recent items`)
  } else {
    console.log(`   No recent performance data`)
  }

  console.log('\n🎚️  Adjustment:')
  console.log(`   Direction: ${adjustment.adjustment > 0 ? '📈 Increase' : adjustment.adjustment < 0 ? '📉 Decrease' : '➡️  Maintain'}`)
  console.log(`   Amount: ${adjustment.adjustment >= 0 ? '+' : ''}${adjustment.adjustment.toFixed(3)}`)
  console.log(`   Reason: ${adjustment.reason}`)

  console.log('\n🌊 Flow State:')
  console.log(`   Current state: ${adjustment.flowState}`)
  console.log(`   ${adjustment.flowState === 'flow' ? '✅ Optimal challenge level' :
                adjustment.flowState === 'anxiety' ? '⚠️  Content may be too challenging' :
                adjustment.flowState === 'boredom' ? '⚠️  Content may be too easy' : '➡️  Balanced'}`)

  console.log('\n💡 Recommendations:')
  adjustment.recommendations.forEach(rec => {
    console.log(`   • [${rec.type}] ${rec.message}`)
  })

  return adjustment
}

/**
 * Demo 4: Spaced repetition scheduling
 */
export function demoSpacedRepetition(graph, theoremIds) {
  console.log('\n' + '='.repeat(70))
  console.log('DEMO 4: Spaced Repetition Scheduling')
  console.log('='.repeat(70))

  const scheduler = new SpacedRepetitionScheduler()

  console.log('\n📝 Adding cards to review system...')
  theoremIds.forEach(id => {
    const node = graph?.byId?.get(id)
    scheduler.addCard(id, {
      family: node?.family,
      importance: node?.importance || 0.5,
      tags: [],
    })
    console.log(`   ✓ Added: ${node?.name || id}`)
  })

  console.log('\n📅 Simulating review sessions...')

  // Simulate some reviews
  const simulatedReviews = [
    { id: theoremIds[0], quality: 4, time: 180, difficulty: 3 },
    { id: theoremIds[1], quality: 5, time: 120, difficulty: 2 },
    { id: theoremIds[2], quality: 3, time: 300, difficulty: 4 },
    { id: theoremIds[0], quality: 5, time: 150, difficulty: 2 }, // Second review
  ]

  simulatedReviews.forEach((review, i) => {
    const node = graph?.byId?.get(review.id)
    console.log(`   Session ${i + 1}: ${node?.name || review.id}`)
    const result = scheduler.recordReview(review.id, review.quality, review.time, review.difficulty)
    console.log(`     Quality: ${review.quality}/5, Next review in ${result.interval} days`)
    console.log(`     Easiness factor: ${result.easinessFactor.toFixed(2)}, Mature: ${result.mature ? 'Yes' : 'No'}`)
  })

  console.log('\n📊 System Statistics:')
  const stats = scheduler.getStats()
  Object.entries(stats).forEach(([key, value]) => {
    console.log(`   ${key}: ${value}`)
  })

  console.log('\n📆 7-Day Forecast:')
  const forecast = scheduler.getForecast(7)
  forecast.forEach(day => {
    console.log(`   ${day.date}: ${day.dueReviews} reviews, ${day.newCards} new cards (total: ${day.total})`)
  })

  console.log('\n🎯 Next Review Session:')
  const session = scheduler.getReviewSession({ maxCards: 5 })
  session.forEach((item, i) => {
    const node = graph?.byId?.get(item.card.theoremId)
    const retention = (item.card.getRetentionProbability() * 100).toFixed(0)
    console.log(`   ${i + 1}. [${item.type}] ${node?.name || item.card.theoremId}`)
    console.log(`      Retention: ${retention}%, Reviews: ${item.card.totalReviews}`)
  })

  return scheduler
}

/**
 * Demo 5: Evaluate against human instructor baseline
 */
export function demoHumanBaselineEvaluation(algorithmPath, topicPair) {
  console.log('\n' + '='.repeat(70))
  console.log('DEMO 5: Human Baseline Evaluation')
  console.log('='.repeat(70))

  const evaluator = new HumanBaselineEvaluator()

  // Register some synthetic human paths for comparison
  console.log('\n📚 Registering human instructor baselines...')

  // Example human path 1
  evaluator.registerHumanPath(topicPair, [
    'ag-varieties-def',
    'ag-morphism-def',
    'ag-projective-def',
    'ag-sheaf-def',
    'ag-cohomology-intro',
  ], {
    instructor: 'Prof. Smith',
    institution: 'University A',
    studentLevel: 'graduate',
    successRate: 0.85,
    avgTimeToMastery: 60, // days
  })

  // Example human path 2
  evaluator.registerHumanPath(topicPair, [
    'ag-varieties-def',
    'ag-dimension-def',
    'ag-morphism-def',
    'ag-sheaf-def',
    'ag-cohomology-intro',
    'ag-schemes-intro',
  ], {
    instructor: 'Prof. Johnson',
    institution: 'University B',
    studentLevel: 'graduate',
    successRate: 0.78,
    avgTimeToMastery: 75,
  })

  console.log('   ✓ Registered 2 human baseline curricula')

  console.log('\n🔍 Comparing algorithm path to human baselines...')
  const evaluation = evaluator.evaluateAgainstHuman(algorithmPath, topicPair)

  if (!evaluation.hasBaseline) {
    console.log('   ℹ️ ', evaluation.message)
    return null
  }

  console.log(`\n📊 Comparison Results (vs ${evaluation.humanBaselines} human paths):`)
  const comp = evaluation.comparison
  console.log(`   Length ratio: ${comp.lengthRatio?.toFixed(2)} (1.0 = same length)`)
  console.log(`   Content overlap: ${(comp.overlapRatio * 100)?.toFixed(1)}%`)
  console.log(`   Order similarity: ${(comp.orderSimilarity * 100)?.toFixed(1)}%`)

  console.log('\n💬 Assessment:')
  console.log(`   ${comp.assessment}`)

  console.log('\n🧪 A/B Test Framework:')
  const abTest = evaluator.runABTest(algorithmPath, evaluation.details[0], 100, 30)
  console.log('   Design:')
  Object.entries(abTest.framework).forEach(([phase, description]) => {
    console.log(`     • ${phase}: ${description}`)
  })

  return evaluation
}

/**
 * Demo 6: Predict learning outcomes
 */
export function demoOutcomePrediction(path, learnerProfile) {
  console.log('\n' + '='.repeat(70))
  console.log('DEMO 6: Learning Outcome Prediction')
  console.log('='.repeat(70))

  const predictor = new LearningOutcomePredictor()

  // Train with synthetic data (in practice, use real historical data)
  console.log('\n🏋️  Training predictor...')
  const syntheticData = generateSyntheticTrainingData(50)
  predictor.train(syntheticData)
  console.log(`   ✓ Trained on ${syntheticData.length} historical learning records`)

  console.log('\n🔮 Predicting outcomes for this path...')
  const predictions = predictor.predict(path, learnerProfile)

  console.log('\n📈 Predictions:')
  console.log(`   Time to mastery: ${predictions.timeToMastery} days`)
  console.log(`   Success probability: ${(predictions.successProbability * 100).toFixed(1)}%`)
  console.log(`   Retention rate: ${(predictions.retentionRate * 100).toFixed(1)}%`)
  console.log(`   Expected difficulty: ${predictions.expectedDifficulty.toFixed(2)}/1.0`)
  console.log(`   Confidence: ${(predictions.confidence * 100).toFixed(1)}%`)

  console.log('\n💡 Interpretation:')
  if (predictions.successProbability > 0.75) {
    console.log('   ✅ High probability of success. Path is well-suited.')
  } else if (predictions.successProbability > 0.5) {
    console.log('   ⚠️  Moderate success probability. Consider additional support.')
  } else {
    console.log('   ❌ Low success probability. Path may be too challenging.')
  }

  if (predictions.timeToMastery > 90) {
    console.log('   ⏰ Long learning path. Consider breaking into sub-goals.')
  } else if (predictions.timeToMastery < 30) {
    console.log('   ⚡ Quick learning path. Good for rapid skill building.')
  }

  return predictions
}

/**
 * Demo 7: Multi-objective optimization
 */
export function demoMultiObjectiveOptimization(graph, startId, goalId, userProfile) {
  console.log('\n' + '='.repeat(70))
  console.log('DEMO 7: Multi-Objective Path Optimization')
  console.log('='.repeat(70))

  const system = new CurriculumLearningSystem(graph)
  const optimizer = new MultiObjectiveOptimizer(graph, system.pathFinder)

  console.log('\n🎯 Finding Pareto-optimal paths...')
  console.log(`   Optimizing for: time, difficulty, retention, engagement`)

  const paretoFrontier = optimizer.findParetoOptimalPaths(
    startId,
    goalId,
    userProfile,
    ['time', 'difficulty', 'retention', 'engagement']
  )

  console.log(`\n✅ Found ${paretoFrontier.length} Pareto-optimal solutions`)

  paretoFrontier.forEach((solution, i) => {
    console.log(`\n   Solution ${i + 1}:`)
    console.log(`   Steps: ${solution.path.steps}`)
    console.log(`   Objectives:`)
    Object.entries(solution.objectives).forEach(([obj, value]) => {
      console.log(`     • ${obj}: ${typeof value === 'number' ? value.toFixed(3) : value}`)
    })
  })

  console.log('\n🔧 Selecting best path based on user preferences...')
  const selected = optimizer.selectPath(paretoFrontier, {
    prioritizeTime: 0.2,
    prioritizeDifficulty: 0.3,
    prioritizeRetention: 0.5,
  })

  console.log('\n🏆 Selected Path:')
  console.log(`   Preference score: ${selected.preferenceScore.toFixed(3)}`)
  console.log(`   ${selected.path.steps} steps, optimized for ${selected.path.strategy}`)

  return { paretoFrontier, selected }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generate synthetic training data for outcome predictor
 */
function generateSyntheticTrainingData(count) {
  const data = []

  for (let i = 0; i < count; i++) {
    const pathLength = Math.floor(Math.random() * 15) + 5
    const difficulty = Math.random()
    const learnerLevel = Math.random()

    // Simulate outcome based on difficulty match
    const difficultyMatch = 1 - Math.abs(difficulty - learnerLevel)
    const successRate = 0.5 + difficultyMatch * 0.4

    data.push({
      pathLength,
      difficulty,
      learnerLevel,
      successRate,
      timeToMastery: pathLength * (2 - difficultyMatch) * (2 - learnerLevel),
      retentionRate: 0.6 + difficultyMatch * 0.3,
    })
  }

  return data
}

/**
 * Create sample user profile
 */
export function createSampleUserProfile() {
  return {
    userId: 'demo-user',
    overallLevel: 45,
    masteredTheorems: new Set(['ag-varieties-def', 'ag-morphism-def']),
    inProgressTheorems: new Set(['ag-sheaf-def']),
    theorems: new Map([
      ['ag-varieties-def', { visits: 5, understanding: 4, timeSpent: 1200 }],
      ['ag-morphism-def', { visits: 3, understanding: 4, timeSpent: 900 }],
      ['ag-sheaf-def', { visits: 2, understanding: 3, timeSpent: 600 }],
    ]),
    preferences: {
      preferredFamilies: ['Algebraic Geometry'],
      difficultyLevel: 'medium',
      learningStyle: 'balanced',
    },
    recentPerformance: [
      { theoremId: 'ag-varieties-def', understanding: 4, timeSpent: 300, estimatedComplexity: 3, completionRate: 0.9 },
      { theoremId: 'ag-morphism-def', understanding: 4, timeSpent: 350, estimatedComplexity: 4, completionRate: 0.85 },
      { theoremId: 'ag-sheaf-def', understanding: 3, timeSpent: 450, estimatedComplexity: 4, completionRate: 0.7 },
    ],
  }
}

/**
 * Run full demo suite
 */
export function runFullDemo(graph) {
  console.log('\n')
  console.log('╔' + '═'.repeat(68) + '╗')
  console.log('║' + ' '.repeat(10) + 'CURRICULUM LEARNING RESEARCH SYSTEM DEMO' + ' '.repeat(18) + '║')
  console.log('╚' + '═'.repeat(68) + '╝')

  const userProfile = createSampleUserProfile()

  // Get some theorem IDs for demos
  const theoremIds = Array.from(graph?.byId?.keys() || []).slice(0, 10)
  const startId = theoremIds[0]
  const goalId = theoremIds[5]

  // Run all demos
  const results = {}

  results.graph = demoPrerequisiteGraph(graph)
  results.path = demoOptimalPath(graph, startId, goalId, userProfile)
  results.difficulty = demoDifficultyAdjustment(userProfile, userProfile.recentPerformance)
  results.spaced = demoSpacedRepetition(graph, theoremIds.slice(0, 5))

  if (results.path && results.path.success) {
    results.baseline = demoHumanBaselineEvaluation(results.path.mainPath, { start: startId, goal: goalId })
    results.prediction = demoOutcomePrediction(results.path.mainPath, userProfile)
    results.multiobj = demoMultiObjectiveOptimization(graph, startId, goalId, userProfile)
  }

  console.log('\n' + '='.repeat(70))
  console.log('DEMO COMPLETE')
  console.log('='.repeat(70))
  console.log('\n✅ All curriculum learning components demonstrated successfully!')
  console.log('\nExport graph visualization: system.exportGraphVisualization("dot")')
  console.log('Export schedule data: scheduler.exportData()')

  return results
}

export default {
  runFullDemo,
  demoPrerequisiteGraph,
  demoOptimalPath,
  demoDifficultyAdjustment,
  demoSpacedRepetition,
  demoHumanBaselineEvaluation,
  demoOutcomePrediction,
  demoMultiObjectiveOptimization,
  createSampleUserProfile,
}
