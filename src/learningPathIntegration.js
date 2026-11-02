/**
 * Learning Path Integration with Proof Explorer
 *
 * Connects the learning path system with proof explorer features:
 * - Auto-track step completions
 * - Record explorer feature usage
 * - Suggest related theorems after mastery
 * - Create mini-curricula from dependencies
 */

import { LearningPathManager } from './learningPath.js'
import { LearningPathPanel } from './learningPathUI.js'

export class LearningPathIntegration {
  constructor(graph, proofView, proofExplorer) {
    this.graph = graph
    this.proofView = proofView
    this.proofExplorer = proofExplorer
    this.manager = new LearningPathManager(graph)
    this.panel = new LearningPathPanel(graph, proofView)
    this.userId = 'default'
    this.currentTheoremId = null
  }

  /**
   * Initialize integration
   */
  init() {
    this.panel.init()
    this.hookProofStepHighlighter()
    this.hookTheoremPopup()
    this.hookLaTeXExport()
    this.hookProofSearch()
    this.attachKeyboardShortcuts()
  }

  /**
   * Hook into proof step highlighter
   */
  hookProofStepHighlighter() {
    const highlighter = this.proofExplorer?.stepHighlighter
    if (!highlighter) return

    // Override focusStep to track completion
    const originalFocus = highlighter.focusStep.bind(highlighter)
    highlighter.focusStep = (stepElement) => {
      originalFocus(stepElement)

      // Extract step ID and record
      const stepId = stepElement.id?.replace('proof-step-', '')
      if (stepId && this.currentTheoremId) {
        this.manager.progressTracker.recordStepCompletion(
          this.userId,
          this.currentTheoremId,
          stepId
        )
      }
    }

    // Listen for step focus events
    if (this.proofView.root) {
      this.proofView.root.addEventListener('step:focus', (e) => {
        const stepId = e.detail?.stepId?.replace('proof-step-', '')
        if (stepId && this.currentTheoremId) {
          this.manager.progressTracker.recordStepCompletion(
            this.userId,
            this.currentTheoremId,
            stepId
          )
        }
      })
    }
  }

  /**
   * Hook into theorem popup for quick navigation suggestions
   */
  hookTheoremPopup() {
    const popup = this.proofExplorer?.theoremPopup
    if (!popup) return

    // Override showPopup to add learning path info
    const originalShow = popup.showPopup.bind(popup)
    popup.showPopup = (target, theoremId) => {
      originalShow(target, theoremId)

      // Add learning path hint
      const progress = this.manager.storage.load(this.userId)
      const isMastered = progress.masteredTheorems.has(theoremId)
      const isPrereq = this.currentTheoremId ?
        this.manager.prerequisiteResolver.GetPrerequisites(this.currentTheoremId).includes(theoremId) :
        false

      if (isMastered || isPrereq) {
        const hint = document.createElement('div')
        hint.style.cssText = `
          margin-top: 8px;
          padding: 6px 10px;
          background: rgba(120, 215, 255, 0.1);
          border-left: 2px solid #78d7ff;
          border-radius: 4px;
          font-size: 11px;
          color: #78d7ff;
        `
        hint.textContent = isMastered ? '✓ 已掌握' : isPrereq ? '⚡ 前置定理' : ''

        popup.popup.appendChild(hint)
      }
    }
  }

  /**
   * Hook into LaTeX export
   */
  hookLaTeXExport() {
    const exporter = this.proofExplorer?.latexExporter
    if (!exporter) return

    // Override downloadAsFile
    const originalDownload = exporter.downloadAsFile.bind(exporter)
    exporter.downloadAsFile = (proof, filename) => {
      originalDownload(proof, filename)

      // Record export event
      if (this.currentTheoremId) {
        this.manager.progressTracker.recordExport(this.userId, this.currentTheoremId)
      }
    }
  }

  /**
   * Hook into proof search
   */
  hookProofSearch() {
    const search = this.proofExplorer?.proofSearch
    if (!search) return

    // Track when user explores dependencies
    const originalFindUsages = search.findUsages.bind(search)
    search.findUsages = (theoremId) => {
      const result = originalFindUsages(theoremId)

      // Record explorer usage
      if (result.length > 0 && this.currentTheoremId) {
        this.manager.progressTracker.recordExplorerUsage(
          this.userId,
          this.currentTheoremId
        )
      }

      return result
    }
  }

  /**
   * Update current theorem context
   */
  setCurrentTheorem(theoremId) {
    this.currentTheoremId = theoremId

    // Check if user should see "mastery" notification
    this.checkMasteryStatus(theoremId)
  }

  /**
   * Check and notify mastery achievement
   */
  checkMasteryStatus(theoremId) {
    const progress = this.manager.storage.load(this.userId)
    const theoremProgress = progress.theorems.get(theoremId)

    if (!theoremProgress) return

    // Check if theorem just became mastered
    const wasMastered = progress.masteredTheorems.has(theoremId)

    // Re-classify
    this.manager.progressTracker.classifyTheoremStatus(progress, theoremId)
    const isNowMastered = progress.masteredTheorems.has(theoremId)

    if (!wasMastered && isNowMastered) {
      this.showMasteryNotification(theoremId)
    }
  }

  /**
   * Show mastery notification with next steps
   */
  showMasteryNotification(theoremId) {
    const node = this.graph?.byId?.get(theoremId)
    if (!node) return

    const notification = document.createElement('div')
    notification.className = 'lp-mastery-notification'
    notification.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) scale(0.9);
      width: 420px;
      padding: 28px 32px;
      background: linear-gradient(135deg, rgba(12, 17, 29, 0.98), rgba(8, 11, 20, 0.98));
      border: 2px solid rgba(120, 215, 255, 0.4);
      border-radius: 16px;
      box-shadow: 0 12px 48px rgba(0, 0, 0, 0.8);
      z-index: 10000;
      opacity: 0;
      animation: masteryAppear 0.5s ease forwards;
    `

    const style = document.createElement('style')
    style.textContent = `
      @keyframes masteryAppear {
        to {
          opacity: 1;
          transform: translate(-50%, -50%) scale(1);
        }
      }
    `
    document.head.appendChild(style)

    // Get next suggestions
    const recommendations = this.manager.getRecommendations(this.userId, 3)

    notification.innerHTML = `
      <div style="text-align: center; margin-bottom: 20px;">
        <div style="font-size: 48px; margin-bottom: 12px;">🎉</div>
        <div style="font-size: 18px; font-weight: 700; color: #78d7ff; margin-bottom: 8px;">掌握成就</div>
        <div style="font-size: 15px; color: #f5f8ff; font-weight: 600;">${node.name}</div>
      </div>

      <div style="padding: 16px; background: rgba(120, 215, 255, 0.08); border-radius: 10px; margin-bottom: 20px;">
        <div style="font-size: 13px; font-weight: 600; color: #c5d2e6; margin-bottom: 12px;">推荐下一步</div>
        <div style="display: flex; flex-direction: column; gap: 10px;">
          ${recommendations.slice(0, 3).map(rec => {
            const recNode = this.graph?.byId?.get(rec.theoremId)
            return `
              <button class="lp-next-step" data-theorem="${rec.theoremId}" style="
                padding: 12px;
                background: rgba(12, 17, 29, 0.5);
                border: 1px solid rgba(120, 215, 255, 0.2);
                border-radius: 8px;
                text-align: left;
                cursor: pointer;
                transition: all 0.2s;
                color: #f5f8ff;
                font-size: 13px;
              ">
                <div style="font-weight: 600; margin-bottom: 4px;">${recNode?.name || rec.theoremId}</div>
                <div style="font-size: 11px; color: #94a8c4;">匹配度: ${rec.score}/100</div>
              </button>
            `
          }).join('')}
        </div>
      </div>

      <button class="lp-close-notification" style="
        width: 100%;
        padding: 12px;
        background: rgba(148, 178, 220, 0.15);
        border: 1px solid rgba(148, 178, 220, 0.2);
        border-radius: 8px;
        color: #c5d2e6;
        font-size: 13px;
        cursor: pointer;
        transition: all 0.2s;
      ">继续当前学习</button>
    `

    document.body.appendChild(notification)

    // Attach events
    notification.querySelectorAll('.lp-next-step').forEach(btn => {
      btn.onmouseover = () => {
        btn.style.background = 'rgba(120, 215, 255, 0.15)'
        btn.style.borderColor = 'rgba(120, 215, 255, 0.4)'
      }
      btn.onmouseout = () => {
        btn.style.background = 'rgba(12, 17, 29, 0.5)'
        btn.style.borderColor = 'rgba(120, 215, 255, 0.2)'
      }
      btn.onclick = () => {
        const theoremId = btn.dataset.theorem
        this.proofView.open(theoremId, { pushHistory: true })
        notification.remove()
      }
    })

    notification.querySelector('.lp-close-notification').onclick = () => {
      notification.remove()
    }

    // Auto-close after 10 seconds
    setTimeout(() => {
      if (document.contains(notification)) {
        notification.remove()
      }
    }, 10000)
  }

  /**
   * Attach keyboard shortcuts
   */
  attachKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Ctrl+Shift+L: Toggle learning path panel
      if (e.ctrlKey && e.shiftKey && e.key === 'L') {
        e.preventDefault()
        this.panel.toggle()
      }

      // Ctrl+Shift+M: Mark current theorem as mastered
      if (e.ctrlKey && e.shiftKey && e.key === 'M') {
        e.preventDefault()
        if (this.currentTheoremId) {
          this.manager.progressTracker.markAsMastered(this.userId, this.currentTheoremId)
          this.showMasteryNotification(this.currentTheoremId)
          this.panel.render()
        }
      }

      // Ctrl+Shift+N: Show next recommendations
      if (e.ctrlKey && e.shiftKey && e.key === 'N') {
        e.preventDefault()
        this.panel.show()
        // Switch to recommendations tab
        const recTab = document.querySelector('[data-tab="recommendations"]')
        recTab?.click()
      }
    })
  }

  /**
   * Create mini-curriculum from current theorem's dependencies
   */
  createDependencyCurriculum(theoremId) {
    const prerequisites = this.manager.prerequisiteResolver.GetAllPrerequisites(theoremId)
    const progress = this.manager.storage.load(this.userId)

    // Filter unmastered prerequisites
    const unmastered = prerequisites.filter(id => !progress.masteredTheorems.has(id))

    // Rank by suitability
    const ranked = this.manager.suitabilityRanker.RankBySuitability(progress, unmastered)

    return ranked.slice(0, 8).map((rec, index) => ({
      theoremId: rec.theoremId,
      reason: 'Prerequisite for current theorem',
      order: index + 1,
      score: rec.score
    }))
  }

  /**
   * Export learning progress
   */
  exportProgress() {
    const json = this.manager.exportProgress()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `formula-nebula-progress-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  /**
   * Import learning progress
   */
  importProgress(file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const json = e.target.result
        this.manager.importProgress(json)
        this.panel.render()
        alert('进度导入成功！')
      } catch (error) {
        alert('进度导入失败: ' + error.message)
      }
    }
    reader.readAsText(file)
  }
}

/**
 * Initialize learning path system
 * Call this after graph and proof view are initialized
 */
export function initLearningPath(graph, proofView, proofExplorer) {
  const integration = new LearningPathIntegration(graph, proofView, proofExplorer)
  integration.init()

  // Track theorem opens
  const originalOpen = proofView.open
  proofView.open = (nodeId, options) => {
    integration.setCurrentTheorem(nodeId)
    return originalOpen.call(proofView, nodeId, options)
  }

  // Expose to window for console access
  window.learningPath = integration

  console.log('%c🎯 Learning Path System Initialized', 'color: #78d7ff; font-weight: bold;')
  console.log('Keyboard shortcuts:')
  console.log('  Ctrl+Shift+L: Toggle learning path panel')
  console.log('  Ctrl+Shift+M: Mark current theorem as mastered')
  console.log('  Ctrl+Shift+N: Show next recommendations')

  return integration
}

export default { LearningPathIntegration, initLearningPath }
