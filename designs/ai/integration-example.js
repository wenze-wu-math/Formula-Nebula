/**
 * designs/ai/integration-example.js — Integration Example with Formula Nebula Atlas
 *
 * Demonstrates how to integrate the theorem prover into the main atlas interface
 */

import { getProofAssistant, proveTheorem } from './proof-assistant.js'
import { state, emit, on } from '../atlas/state.js'

/**
 * Initialize theorem prover integration with atlas
 */
export function initTheoremProver() {
  const assistant = getProofAssistant()

  // Listen for theorem node selections
  on('select', async (nodeId) => {
    const node = state.graph.nodes[nodeId]

    if (node && node.type === 'theorem') {
      await handleTheoremSelection(node, assistant)
    }
  })

  // Add proof search to main search
  on('search', async (event) => {
    const proofResults = assistant.searchLibrary(event.query)

    if (proofResults.length > 0) {
      emit('proof-search-results', proofResults)
    }
  })

  console.log('Theorem prover initialized')
}

/**
 * Handle theorem node selection
 */
async function handleTheoremSelection(node, assistant) {
  try {
    // Start proof session
    const session = await assistant.startSession(node.statement || node.name)

    // Store session in state
    state.activeProofSession = session.sessionId

    // Emit event for UI to display suggestions
    emit('proof-suggestions-ready', {
      nodeId: node.id,
      theorem: session.theorem,
      suggestions: session.suggestions
    })

    // Auto-select best strategy if enabled
    if (state.autoProve) {
      const proof = assistant.selectStrategy(session.sessionId, 0)

      emit('proof-selected', {
        nodeId: node.id,
        proof: proof.proof,
        steps: proof.steps
      })
    }
  } catch (error) {
    console.error('Failed to start proof session:', error)
    emit('proof-error', {
      nodeId: node.id,
      error: error.message
    })
  }
}

/**
 * Panel UI integration
 */
export function renderProofPanel(_nodeId) {
  const assistant = getProofAssistant()
  const session = assistant.getActiveSession()

  if (!session) {
    return '<div class="proof-panel">No active proof session</div>'
  }

  return `
    <div class="proof-panel">
      <div class="proof-header">
        <h3>Theorem Prover</h3>
        <button onclick="window.__design.closeProof()">×</button>
      </div>

      <div class="proof-theorem">
        <h4>Statement</h4>
        <p>${session.theorem.original}</p>
        <code class="lean-code">${session.theorem.lean}</code>
      </div>

      <div class="proof-suggestions">
        <h4>Proof Strategies</h4>
        ${renderSuggestions(session.suggestions, assistant, session.sessionId)}
      </div>

      ${session.currentProof ? renderCurrentProof(session, assistant) : ''}

      <div class="proof-actions">
        ${renderActions(session, assistant)}
      </div>
    </div>
  `
}

/**
 * Render proof strategy suggestions
 */
function renderSuggestions(suggestions, assistant, sessionId) {
  if (!suggestions || suggestions.length === 0) {
    return '<p>No suggestions available</p>'
  }

  return suggestions.map((sug, index) => `
    <div class="suggestion" data-index="${index}">
      <div class="suggestion-header">
        <span class="strategy">${sug.strategy}</span>
        <span class="score">${Math.round(sug.score)}/100</span>
      </div>
      <div class="suggestion-info">
        <span class="steps">${sug.steps.length} steps</span>
        <span class="difficulty">${sug.estimated_difficulty}</span>
      </div>
      <button onclick="window.__design.selectStrategy('${sessionId}', ${index})">
        Select
      </button>
    </div>
  `).join('')
}

/**
 * Render current proof progress
 */
function renderCurrentProof(session, assistant) {
  const proof = session.currentProof

  if (!proof) return ''

  const nextStep = assistant.getNextStep(session)

  return `
    <div class="current-proof">
      <h4>Proof (${proof.strategy})</h4>

      <div class="proof-steps">
        ${renderSteps(proof.steps, session)}
      </div>

      ${nextStep ? `
        <div class="next-step">
          <h5>Next Step</h5>
          <p>${nextStep.content}</p>
          <p class="hint"><em>${nextStep.hint}</em></p>
          <textarea id="step-input" placeholder="Enter your proof for this step..."></textarea>
          <button onclick="window.__design.submitStep(${nextStep.index})">
            Submit Step
          </button>
        </div>
      ` : ''}
    </div>
  `
}

/**
 * Render proof steps
 */
function renderSteps(steps, session) {
  const completedCount = session.history.filter(h => h.step.action === 'complete_step').length

  return steps.map((step, index) => {
    const isCompleted = index < completedCount
    const isCurrent = index === completedCount

    return `
      <div class="proof-step ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}">
        <span class="step-number">${index + 1}</span>
        <span class="step-type">${step.type}</span>
        <p class="step-content">${step.content}</p>
        ${isCompleted ? '<span class="checkmark">✓</span>' : ''}
      </div>
    `
  }).join('')
}

/**
 * Render action buttons
 */
function renderActions(session, _assistant) {
  const buttons = []

  if (session.currentProof) {
    buttons.push(`
      <button onclick="window.__design.verifyProof()">
        Verify Proof
      </button>
    `)

    buttons.push(`
      <button onclick="window.__design.generateAlternatives()">
        Generate Alternatives
      </button>
    `)

    if (session.verified) {
      buttons.push(`
        <button onclick="window.__design.saveProof()">
          Save to Library
        </button>
      `)
    }
  }

  buttons.push(`
    <button onclick="window.__design.exportSession()">
      Export Session
    </button>
  `)

  return buttons.join('')
}

/**
 * Expose API to window.__design for UI interaction
 */
export function exposeProofAPI() {
  const assistant = getProofAssistant()

  Object.assign(window.__design, {
    // Proof actions
    async selectStrategy(sessionId, index) {
      const result = assistant.selectStrategy(sessionId, index)
      emit('proof-selected', result)
      state.dirty = true
    },

    async submitStep(stepIndex) {
      const session = assistant.getActiveSession()
      const input = document.getElementById('step-input')?.value

      if (!session || !input) return

      const result = await assistant.completeStep(
        session.id,
        stepIndex,
        input
      )

      emit('step-completed', result)
      state.dirty = true
    },

    async verifyProof() {
      const session = assistant.getActiveSession()
      if (!session) return

      emit('proof-verifying', {})

      const result = await assistant.verifyProof(session.id)

      emit('proof-verified', result)
      state.dirty = true

      if (result.verified) {
        alert('Proof verified successfully!')
      } else {
        alert('Proof verification failed:\n' + result.errors.join('\n'))
      }
    },

    async generateAlternatives() {
      const session = assistant.getActiveSession()
      if (!session) return

      const variants = await assistant.generateAlternatives(session.id, 3)

      emit('alternatives-generated', variants)
      state.dirty = true
    },

    async saveProof() {
      const session = assistant.getActiveSession()
      if (!session) return

      const name = prompt('Enter name for this proof:')
      if (!name) return

      const result = assistant.saveProof(session.id, name)

      emit('proof-saved', result)
      state.dirty = true

      alert(`Proof saved as "${name}"`)
    },

    exportSession() {
      const session = assistant.getActiveSession()
      if (!session) return

      const data = assistant.exportSession(session.id)
      const json = JSON.stringify(data, null, 2)

      // Download as file
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `proof-session-${session.id}.json`
      a.click()
      URL.revokeObjectURL(url)
    },

    closeProof() {
      const session = assistant.getActiveSession()
      if (session) {
        assistant.closeSession(session.id)
      }

      state.activeProofSession = null
      emit('proof-closed', {})
      state.dirty = true
    },

    // Getter for current session
    getProofSession() {
      return assistant.getActiveSession()
    }
  })
}

/**
 * CSS styles for proof panel
 */
export const proofPanelStyles = `
.proof-panel {
  padding: 20px;
  font-family: -apple-system, system-ui, sans-serif;
}

.proof-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.proof-theorem {
  background: #f5f5f5;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.lean-code {
  display: block;
  background: #2d2d2d;
  color: #f8f8f2;
  padding: 10px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  margin-top: 10px;
  overflow-x: auto;
}

.proof-suggestions {
  margin-bottom: 20px;
}

.suggestion {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 10px;
  transition: all 0.2s;
}

.suggestion:hover {
  border-color: #4a90e2;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.suggestion-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.strategy {
  font-weight: 600;
  text-transform: capitalize;
}

.score {
  color: #4a90e2;
  font-weight: 600;
}

.suggestion-info {
  display: flex;
  gap: 15px;
  font-size: 0.9em;
  color: #666;
  margin-bottom: 10px;
}

.proof-step {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px;
  margin-bottom: 8px;
  border-left: 3px solid #ddd;
}

.proof-step.completed {
  border-left-color: #4caf50;
  opacity: 0.7;
}

.proof-step.current {
  border-left-color: #4a90e2;
  background: #f0f7ff;
}

.step-number {
  font-weight: 600;
  color: #666;
}

.step-type {
  font-size: 0.85em;
  color: #888;
  text-transform: uppercase;
}

.checkmark {
  color: #4caf50;
  font-size: 1.2em;
}

.next-step {
  background: #fff9e6;
  border: 1px solid #ffeb3b;
  padding: 15px;
  border-radius: 8px;
  margin-top: 15px;
}

.hint {
  color: #666;
  font-size: 0.9em;
}

#step-input {
  width: 100%;
  min-height: 80px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  margin: 10px 0;
  resize: vertical;
}

.proof-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

button {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  background: #4a90e2;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

button:hover {
  background: #357abd;
}

button:active {
  transform: translateY(1px);
}
`

/**
 * Example: Complete workflow
 */
export async function exampleWorkflow() {
  // Initialize
  initTheoremProver()
  exposeProofAPI()

  // Start a proof
  const result = await proveTheorem("For all natural numbers n, n + 0 = n")

  console.log('Theorem parsed:', result.theorem.ast)
  console.log('Suggestions:', result.suggestions.length)

  // The UI would then call:
  // window.__design.selectStrategy(result.sessionId, 0)
  // window.__design.verifyProof()
  // etc.

  return result
}
