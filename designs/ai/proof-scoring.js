/**
 * designs/ai/proof-scoring.js — Proof Elegance and Efficiency Scoring
 *
 * Multi-factor scoring system for ranking proof quality
 */

/**
 * Score proof based on multiple criteria
 * @param {Object} proof - Proof object to score
 * @returns {Promise<number>} Score from 0-100
 */
export async function scoreProof(proof) {
  const weights = {
    brevity: 0.25,
    clarity: 0.20,
    efficiency: 0.20,
    elegance: 0.20,
    dependencies: 0.15
  }

  const scores = {
    brevity: scoreBrevity(proof),
    clarity: scoreClarity(proof),
    efficiency: scoreEfficiency(proof),
    elegance: scoreElegance(proof),
    dependencies: scoreDependencies(proof)
  }

  let totalScore = 0
  for (const [criterion, weight] of Object.entries(weights)) {
    totalScore += scores[criterion] * weight
  }

  return Math.round(totalScore * 100) / 100
}

/**
 * Score brevity - shorter proofs score higher
 */
function scoreBrevity(proof) {
  const stepCount = proof.steps?.length || 0

  if (stepCount <= 3) return 100
  if (stepCount <= 5) return 85
  if (stepCount <= 7) return 70
  if (stepCount <= 10) return 55
  if (stepCount <= 15) return 40
  return 25
}

/**
 * Score clarity - well-structured, logical flow
 */
function scoreClarity(proof) {
  let score = 100

  // Penalize if no clear structure
  if (!proof.steps || proof.steps.length === 0) {
    return 0
  }

  // Check for logical flow
  const hasIntro = proof.steps.some(s => s.type === 'intro' || s.type === 'assume')
  const hasConclusion = proof.steps.some(s => s.type === 'conclude' || s.type === 'qed')

  if (!hasIntro) score -= 15
  if (!hasConclusion) score -= 15

  // Check for step documentation
  const documentedSteps = proof.steps.filter(s => s.content && s.content.length > 5).length
  const docRatio = documentedSteps / proof.steps.length

  score *= docRatio

  return Math.max(0, score)
}

/**
 * Score efficiency - minimal computational complexity
 */
function scoreEfficiency(proof) {
  let score = 100

  const complexityPenalty = {
    exponential: -40,
    polynomial: -20,
    quadratic: -15,
    linear: -5,
    constant: 0
  }

  const complexity = estimateComplexity(proof)
  score += complexityPenalty[complexity] || 0

  // Penalize for redundant steps
  const redundancy = detectRedundancy(proof)
  score -= redundancy * 10

  return Math.max(0, score)
}

/**
 * Score elegance - mathematical beauty, insight
 */
function scoreElegance(proof) {
  let score = 70 // Base score

  // Bonus for using powerful theorems
  if (proof.dependencies?.some(d => isPowerfulTheorem(d))) {
    score += 15
  }

  // Bonus for symmetry in proof structure
  if (hasSymmetry(proof)) {
    score += 10
  }

  // Bonus for constructive vs contradiction
  if (proof.strategy === 'direct' || proof.strategy === 'construction') {
    score += 10
  }

  // Bonus for generality
  if (proof.generalizes) {
    score += 15
  }

  return Math.min(100, score)
}

/**
 * Score based on dependency complexity
 */
function scoreDependencies(proof) {
  const depCount = proof.dependencies?.length || 0

  if (depCount === 0) return 100 // Self-contained proof is elegant

  // Optimal: 1-3 dependencies
  if (depCount <= 3) return 90

  // Acceptable: 4-6 dependencies
  if (depCount <= 6) return 70

  // Many dependencies reduces score
  return Math.max(30, 100 - depCount * 8)
}

/**
 * Estimate computational complexity
 */
function estimateComplexity(proof) {
  const steps = proof.steps || []

  // Heuristics based on step types
  let complexity = 'constant'

  for (const step of steps) {
    if (step.type === 'induction' || step.type === 'recursion') {
      complexity = 'linear'
    }
    if (step.type === 'double_induction' || step.content?.includes('nested')) {
      complexity = 'quadratic'
    }
    if (step.content?.includes('all subsets') || step.content?.includes('permutation')) {
      complexity = 'exponential'
    }
  }

  return complexity
}

/**
 * Detect redundant steps
 */
function detectRedundancy(proof) {
  const steps = proof.steps || []
  let redundantCount = 0

  // Check for duplicate step types in sequence
  for (let i = 1; i < steps.length; i++) {
    if (steps[i].type === steps[i - 1].type) {
      redundantCount++
    }
  }

  // Check for unnecessary intermediate steps
  const unnecessaryTypes = ['restate', 'remark', 'note']
  redundantCount += steps.filter(s => unnecessaryTypes.includes(s.type)).length

  return Math.min(5, redundantCount)
}

/**
 * Check if dependency is a powerful theorem
 */
function isPowerfulTheorem(dependency) {
  const powerfulTheorems = [
    'fundamental_theorem',
    'pythagorean',
    'fermat',
    'euler',
    'cauchy',
    'bezout',
    'lagrange',
    'sylow',
    'chinese_remainder'
  ]

  const name = dependency.name?.toLowerCase() || ''
  return powerfulTheorems.some(theorem => name.includes(theorem))
}

/**
 * Check for symmetry in proof structure
 */
function hasSymmetry(proof) {
  const steps = proof.steps || []

  if (steps.length < 4) return false

  // Check if first and last steps mirror each other
  const first = steps[0].type
  const last = steps[steps.length - 1].type

  const symmetricPairs = [
    ['assume', 'conclude'],
    ['intro', 'qed'],
    ['split', 'combine']
  ]

  return symmetricPairs.some(([a, b]) => first === a && last === b)
}

/**
 * Detailed scoring breakdown
 */
export async function scoreProofDetailed(proof) {
  const scores = {
    brevity: scoreBrevity(proof),
    clarity: scoreClarity(proof),
    efficiency: scoreEfficiency(proof),
    elegance: scoreElegance(proof),
    dependencies: scoreDependencies(proof)
  }

  const total = await scoreProof(proof)

  return {
    total,
    breakdown: scores,
    rank: getRank(total),
    feedback: generateFeedback(scores)
  }
}

/**
 * Convert score to rank
 */
function getRank(score) {
  if (score >= 90) return 'Excellent'
  if (score >= 75) return 'Good'
  if (score >= 60) return 'Acceptable'
  if (score >= 40) return 'Needs Improvement'
  return 'Poor'
}

/**
 * Generate improvement feedback
 */
function generateFeedback(scores) {
  const feedback = []

  if (scores.brevity < 60) {
    feedback.push('Consider simplifying or combining proof steps')
  }
  if (scores.clarity < 60) {
    feedback.push('Add clearer documentation and logical structure')
  }
  if (scores.efficiency < 60) {
    feedback.push('Look for more efficient proof strategies')
  }
  if (scores.elegance < 60) {
    feedback.push('Consider using more powerful theorems or insights')
  }
  if (scores.dependencies < 60) {
    feedback.push('Try to reduce dependency on external lemmas')
  }

  return feedback.length > 0 ? feedback : ['Proof is well-structured']
}
