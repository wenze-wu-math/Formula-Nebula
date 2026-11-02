/**
 * designs/ai/proof-assistant.js — Interactive Proof Assistant
 *
 * High-level interface for theorem proving workflow:
 * - Session management
 * - Step-by-step proof guidance
 * - Interactive verification
 * - Proof library management
 * - Educational scaffolding
 */

import {
  NaturalLanguageToParsed,
  ProofSuggestions,
  VerifyAgainstLean,
  GenerateVariants
} from './theorem-prover.js'

/**
 * Proof session state
 */
class ProofSession {
  constructor(theorem) {
    this.id = generateSessionId()
    this.theorem = theorem
    this.currentProof = null
    this.history = []
    this.suggestions = []
    this.verified = false
    this.startTime = Date.now()
    this.lastUpdate = Date.now()
  }

  addStep(step) {
    this.history.push({
      step,
      timestamp: Date.now()
    })
    this.lastUpdate = Date.now()
  }

  setCurrentProof(proof) {
    this.currentProof = proof
    this.lastUpdate = Date.now()
  }

  markVerified(result) {
    this.verified = result.valid
    this.verificationResult = result
    this.lastUpdate = Date.now()
  }
}

/**
 * Main proof assistant controller
 */
export class ProofAssistant {
  constructor() {
    this.sessions = new Map()
    this.proofLibrary = new Map()
    this.activeSessionId = null
  }

  /**
   * Start new proof session from natural language
   * @param {string} statement - Mathematical statement in natural language
   * @returns {Object} Session info with parsed theorem
   */
  async startSession(statement) {
    const parsed = NaturalLanguageToParsed(statement)

    if (parsed.error) {
      throw new Error(`Failed to parse statement: ${parsed.error}`)
    }

    const session = new ProofSession(parsed)
    this.sessions.set(session.id, session)
    this.activeSessionId = session.id

    // Generate initial suggestions
    session.suggestions = await ProofSuggestions(parsed)

    return {
      sessionId: session.id,
      theorem: parsed,
      suggestions: session.suggestions,
      recommendedStrategy: session.suggestions[0]?.strategy || 'direct'
    }
  }

  /**
   * Get current active session
   */
  getActiveSession() {
    if (!this.activeSessionId) return null
    return this.sessions.get(this.activeSessionId)
  }

  /**
   * Select and apply proof strategy
   * @param {string} sessionId - Session identifier
   * @param {number} suggestionIndex - Index of suggestion to use
   * @returns {Object} Selected proof with steps
   */
  selectStrategy(sessionId, suggestionIndex = 0) {
    const session = this.sessions.get(sessionId)
    if (!session) throw new Error('Session not found')

    if (suggestionIndex >= session.suggestions.length) {
      throw new Error('Invalid suggestion index')
    }

    const selectedProof = session.suggestions[suggestionIndex]
    session.setCurrentProof(selectedProof)
    session.addStep({
      action: 'select_strategy',
      strategy: selectedProof.strategy,
      score: selectedProof.score
    })

    return {
      proof: selectedProof,
      steps: selectedProof.steps,
      nextStep: this.getNextStep(session)
    }
  }

  /**
   * Get next suggested proof step
   */
  getNextStep(session) {
    if (!session.currentProof) return null

    const completedSteps = session.history.filter(h => h.step.action === 'complete_step').length
    const allSteps = session.currentProof.steps || []

    if (completedSteps >= allSteps.length) {
      return {
        type: 'verify',
        message: 'All steps complete. Ready to verify proof.'
      }
    }

    const nextStep = allSteps[completedSteps]
    return {
      type: nextStep.type,
      content: nextStep.content,
      hint: this.generateHint(nextStep, session.theorem),
      index: completedSteps
    }
  }

  /**
   * Generate contextual hint for proof step
   */
  generateHint(step, theorem) {
    const hints = {
      assume: `Start by assuming ${theorem.original}`,
      intro: 'Introduce the variable mentioned in the universal quantifier',
      apply: 'Look for relevant lemmas that match the current goal',
      calculate: 'Perform the necessary algebraic manipulations',
      base: 'Prove the statement holds for n=0 or n=1',
      inductive_hypothesis: 'Assume the statement is true for some arbitrary n',
      inductive_step: 'Use the inductive hypothesis to prove for n+1',
      contradiction: 'Show this leads to an impossible situation',
      conclude: 'State the final result follows from previous steps'
    }

    return hints[step.type] || 'Proceed with the proof step'
  }

  /**
   * Complete a proof step
   * @param {string} sessionId - Session identifier
   * @param {number} stepIndex - Step index to complete
   * @param {string} userProof - User's proof for this step
   * @returns {Object} Validation result and next step
   */
  async completeStep(sessionId, stepIndex, userProof) {
    const session = this.sessions.get(sessionId)
    if (!session) throw new Error('Session not found')

    session.addStep({
      action: 'complete_step',
      stepIndex,
      userProof
    })

    // Validate step (simplified - would use Lean in production)
    const isValid = await this.validateStep(userProof, session.currentProof.steps[stepIndex])

    return {
      valid: isValid,
      nextStep: this.getNextStep(session),
      feedback: isValid ? 'Step accepted' : 'Step needs revision'
    }
  }

  /**
   * Validate individual proof step
   */
  async validateStep(userProof, expectedStep) {
    // Simplified validation - in production, would check against Lean
    if (!userProof || userProof.trim().length === 0) {
      return false
    }

    // Accept step if it contains key terms
    const keyTerms = expectedStep.content.toLowerCase().split(' ')
    const userLower = userProof.toLowerCase()

    return keyTerms.some(term => term.length > 3 && userLower.includes(term))
  }

  /**
   * Verify complete proof against Lean
   * @param {string} sessionId - Session identifier
   * @returns {Promise<Object>} Verification result
   */
  async verifyProof(sessionId) {
    const session = this.sessions.get(sessionId)
    if (!session) throw new Error('Session not found')

    if (!session.currentProof) {
      throw new Error('No proof selected')
    }

    const result = await VerifyAgainstLean(session.currentProof)
    session.markVerified(result)

    session.addStep({
      action: 'verify',
      result: result.valid ? 'success' : 'failure',
      errors: result.errors
    })

    return {
      verified: result.valid,
      errors: result.errors,
      lean_output: result.lean_output,
      proof_status: result.proof_status,
      suggestions: result.valid ? [] : await this.getSuggestions(result.errors)
    }
  }

  /**
   * Get improvement suggestions based on errors
   */
  async getSuggestions(errors) {
    const suggestions = []

    for (const error of errors) {
      if (error.includes('type mismatch')) {
        suggestions.push('Check variable types and ensure they match expected types')
      } else if (error.includes('unknown identifier')) {
        suggestions.push('Verify all identifiers are properly introduced or imported')
      } else if (error.includes('tactic failed')) {
        suggestions.push('Try a different proof strategy or break down the step')
      } else {
        suggestions.push('Review the proof logic and check for missing steps')
      }
    }

    return suggestions
  }

  /**
   * Generate alternative proofs
   * @param {string} sessionId - Session identifier
   * @param {number} variantCount - Number of variants to generate
   * @returns {Promise<Array>} Alternative proofs ranked by score
   */
  async generateAlternatives(sessionId, variantCount = 3) {
    const session = this.sessions.get(sessionId)
    if (!session) throw new Error('Session not found')

    if (!session.currentProof) {
      throw new Error('No proof to generate alternatives from')
    }

    const variants = await GenerateVariants(session.currentProof, variantCount)

    session.addStep({
      action: 'generate_alternatives',
      variantCount: variants.length
    })

    return variants.map(v => ({
      technique: v.technique,
      score: v.score,
      improvement: v.improvement,
      steps: v.steps,
      summary: this.summarizeProof(v)
    }))
  }

  /**
   * Generate human-readable proof summary
   */
  summarizeProof(proof) {
    const stepCount = proof.steps?.length || 0
    const strategy = proof.strategy || 'unknown'

    return `${strategy} proof with ${stepCount} steps (difficulty: ${proof.difficulty || 'medium'})`
  }

  /**
   * Save proof to library
   * @param {string} sessionId - Session identifier
   * @param {string} name - Name for the proof
   * @returns {Object} Saved proof info
   */
  saveProof(sessionId, name) {
    const session = this.sessions.get(sessionId)
    if (!session) throw new Error('Session not found')

    if (!session.verified) {
      throw new Error('Cannot save unverified proof')
    }

    const proofEntry = {
      name,
      theorem: session.theorem,
      proof: session.currentProof,
      verificationResult: session.verificationResult,
      history: session.history,
      savedAt: Date.now()
    }

    this.proofLibrary.set(name, proofEntry)

    return {
      name,
      saved: true,
      librarySize: this.proofLibrary.size
    }
  }

  /**
   * Search proof library
   * @param {string} query - Search query
   * @returns {Array} Matching proofs
   */
  searchLibrary(query) {
    const results = []
    const queryLower = query.toLowerCase()

    for (const [name, entry] of this.proofLibrary.entries()) {
      const matchName = name.toLowerCase().includes(queryLower)
      const matchTheorem = entry.theorem.original.toLowerCase().includes(queryLower)

      if (matchName || matchTheorem) {
        results.push({
          name,
          theorem: entry.theorem.original,
          strategy: entry.proof.strategy,
          savedAt: entry.savedAt
        })
      }
    }

    return results.sort((a, b) => b.savedAt - a.savedAt)
  }

  /**
   * Get session statistics
   */
  getSessionStats(sessionId) {
    const session = this.sessions.get(sessionId)
    if (!session) throw new Error('Session not found')

    const duration = Date.now() - session.startTime
    const stepCount = session.history.length

    return {
      sessionId: session.id,
      duration: Math.round(duration / 1000), // seconds
      stepCount,
      verified: session.verified,
      strategy: session.currentProof?.strategy || 'none',
      theoremComplexity: session.theorem.metadata?.complexity || 'unknown'
    }
  }

  /**
   * Export session to JSON
   */
  exportSession(sessionId) {
    const session = this.sessions.get(sessionId)
    if (!session) throw new Error('Session not found')

    return {
      id: session.id,
      theorem: session.theorem,
      proof: session.currentProof,
      history: session.history,
      verified: session.verified,
      verificationResult: session.verificationResult,
      stats: this.getSessionStats(sessionId)
    }
  }

  /**
   * Close session
   */
  closeSession(sessionId) {
    const session = this.sessions.get(sessionId)
    if (!session) throw new Error('Session not found')

    if (this.activeSessionId === sessionId) {
      this.activeSessionId = null
    }

    this.sessions.delete(sessionId)

    return {
      closed: true,
      stats: {
        duration: Math.round((session.lastUpdate - session.startTime) / 1000),
        verified: session.verified
      }
    }
  }
}

// ──────────── Helper Functions ────────────

/**
 * Generate unique session ID
 */
function generateSessionId() {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Create singleton instance
 */
let assistantInstance = null

export function getProofAssistant() {
  if (!assistantInstance) {
    assistantInstance = new ProofAssistant()
  }
  return assistantInstance
}

/**
 * Quick start helper - full workflow
 */
export async function proveTheorem(statement, options = {}) {
  const assistant = getProofAssistant()

  // Start session
  const sessionInfo = await assistant.startSession(statement)

  // Auto-select best strategy if requested
  if (options.autoSelect !== false) {
    assistant.selectStrategy(sessionInfo.sessionId, 0)
  }

  return {
    sessionId: sessionInfo.sessionId,
    theorem: sessionInfo.theorem,
    suggestions: sessionInfo.suggestions,
    assistant
  }
}
