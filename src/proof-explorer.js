/**
 * Proof Explorer Module for Formula Nebula
 *
 * Provides interactive features for proof exploration:
 * 1. Proof step highlighting and focusing
 * 2. Referenced theorem popup on hover
 * 3. Dependency graph visualization
 * 4. Alternate proofs comparison
 * 5. Proof completeness indicator
 * 6. LaTeX export
 * 7. Proof search (theorem usage finder)
 * 8. Animated proof flow diagram
 */

import katex from 'katex'

// ============================================================================
// 1. PROOF STEP HIGHLIGHTING
// ============================================================================

export class ProofStepHighlighter {
  constructor(proofView) {
    this.proofView = proofView
    this.activeStep = null
    this.highlightedSteps = new Set()
    this.init()
  }

  init() {
    // Listen for proof open events
    if (this.proofView.root) {
      this.attachListeners()
    }
  }

  attachListeners() {
    const root = this.proofView.root
    if (!root) return

    // Click to focus on step
    root.addEventListener('click', (e) => {
      const step = e.target.closest('.pv-step')
      if (step) {
        this.focusStep(step)
      }
    })

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (!root.classList.contains('is-open')) return

      if (e.key === 'ArrowDown' && !e.shiftKey) {
        e.preventDefault()
        this.navigateStep('next')
      } else if (e.key === 'ArrowUp' && !e.shiftKey) {
        e.preventDefault()
        this.navigateStep('prev')
      } else if (e.key === 'Enter' && this.activeStep) {
        e.preventDefault()
        this.toggleStep(this.activeStep)
      }
    })
  }

  focusStep(stepElement) {
    // Remove previous focus
    if (this.activeStep) {
      this.activeStep.classList.remove('pv-step-focused')
    }

    // Add new focus
    stepElement.classList.add('pv-step-focused')
    this.activeStep = stepElement

    // Smooth scroll to center
    stepElement.scrollIntoView({ behavior: 'smooth', block: 'center' })

    // Emit event
    this.emit('step:focus', { stepId: stepElement.id })
  }

  toggleStep(stepElement) {
    if (stepElement instanceof HTMLDetailsElement) {
      stepElement.open = !stepElement.open
    }
  }

  navigateStep(direction) {
    const steps = Array.from(this.proofView.root?.querySelectorAll('.pv-step') || [])
    if (!steps.length) return

    let index = this.activeStep ? steps.indexOf(this.activeStep) : -1

    if (direction === 'next') {
      index = (index + 1) % steps.length
    } else {
      index = index <= 0 ? steps.length - 1 : index - 1
    }

    this.focusStep(steps[index])
  }

  highlightSteps(stepIds) {
    this.clearHighlights()
    stepIds.forEach(id => {
      const step = this.proofView.root?.querySelector(`#proof-step-${this.safeId(id)}`)
      if (step) {
        step.classList.add('pv-step-highlight')
        this.highlightedSteps.add(id)
      }
    })
  }

  clearHighlights() {
    this.highlightedSteps.forEach(id => {
      const step = this.proofView.root?.querySelector(`#proof-step-${this.safeId(id)}`)
      step?.classList.remove('pv-step-highlight')
    })
    this.highlightedSteps.clear()
  }

  safeId(value) {
    return String(value).replace(/[^a-zA-Z0-9_-]/g, '_')
  }

  emit(name, detail) {
    if (this.proofView.root) {
      this.proofView.root.dispatchEvent(new CustomEvent(name, { detail }))
    }
  }
}

// ============================================================================
// 2. REFERENCED THEOREM POPUP
// ============================================================================

export class TheoremPopup {
  constructor(proofView, graph) {
    this.proofView = proofView
    this.graph = graph
    this.popup = null
    this.currentTarget = null
    this.hideTimeout = null
    this.init()
  }

  init() {
    this.createPopup()
    this.attachListeners()
  }

  createPopup() {
    this.popup = document.createElement('div')
    this.popup.className = 'pv-theorem-popup'
    this.popup.style.cssText = `
      position: fixed;
      z-index: 9999;
      max-width: 480px;
      padding: 16px 20px;
      background: rgba(12, 17, 29, 0.96);
      border: 1px solid rgba(120, 215, 255, 0.3);
      border-radius: 8px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(20px);
      color: var(--pv-mute, #c5d2e6);
      font-size: 13px;
      line-height: 1.7;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.2s ease;
      display: none;
    `
    document.body.appendChild(this.popup)
  }

  attachListeners() {
    const root = this.proofView.root
    if (!root) return

    root.addEventListener('mouseover', (e) => {
      const link = e.target.closest('.pv-link[data-theorem-id]')
      if (link) {
        this.showPopup(link, link.dataset.theoremId)
      }
    })

    root.addEventListener('mouseout', (e) => {
      const link = e.target.closest('.pv-link[data-theorem-id]')
      if (link) {
        this.scheduleHide()
      }
    })
  }

  showPopup(target, theoremId) {
    clearTimeout(this.hideTimeout)

    const theorem = this.resolveTheorem(theoremId)
    if (!theorem) return

    // Build popup content
    const title = theorem.name || theorem.id
    const statement = theorem.latex || theorem.proof?.statement || ''
    const summary = theorem.summary || ''

    let html = `<div style="font-weight: 600; color: var(--pv-ink, #f5f8ff); margin-bottom: 8px;">${this.escapeHtml(title)}</div>`

    if (statement) {
      try {
        const latex = katex.renderToString(statement, { displayMode: false, throwOnError: false })
        html += `<div style="margin: 8px 0; color: var(--pv-gold, #ffcf7a);">${latex}</div>`
      } catch {
        html += `<div style="margin: 8px 0; color: var(--pv-gold, #ffcf7a);">${this.escapeHtml(statement)}</div>`
      }
    }

    if (summary) {
      html += `<div style="margin-top: 8px; font-size: 12px; color: var(--pv-dim, #94a8c4);">${this.escapeHtml(summary)}</div>`
    }

    this.popup.innerHTML = html
    this.positionPopup(target)
    this.popup.style.display = 'block'
    setTimeout(() => {
      this.popup.style.opacity = '1'
    }, 10)
  }

  scheduleHide() {
    this.hideTimeout = setTimeout(() => {
      this.popup.style.opacity = '0'
      setTimeout(() => {
        this.popup.style.display = 'none'
      }, 200)
    }, 150)
  }

  positionPopup(target) {
    const rect = target.getBoundingClientRect()
    const popupRect = this.popup.getBoundingClientRect()

    let left = rect.left + (rect.width / 2) - (popupRect.width / 2)
    let top = rect.bottom + 8

    // Keep within viewport
    if (left < 8) left = 8
    if (left + popupRect.width > window.innerWidth - 8) {
      left = window.innerWidth - popupRect.width - 8
    }

    if (top + popupRect.height > window.innerHeight - 8) {
      top = rect.top - popupRect.height - 8
    }

    this.popup.style.left = `${left}px`
    this.popup.style.top = `${top}px`
  }

  resolveTheorem(id) {
    return this.graph?.byId?.get(id) || null
  }

  escapeHtml(text) {
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
  }

  destroy() {
    this.popup?.remove()
  }
}

// ============================================================================
// 3. DEPENDENCY GRAPH VISUALIZATION
// ============================================================================

export class DependencyGraph {
  constructor(container) {
    this.container = container
    this.canvas = null
    this.ctx = null
    this.nodes = []
    this.edges = []
    this.width = 0
    this.height = 0
  }

  render(proofData, graph) {
    this.clear()
    this.canvas = document.createElement('canvas')
    this.canvas.style.cssText = 'width: 100%; height: 400px; border-radius: 6px; background: rgba(12, 17, 29, 0.5);'
    this.container.appendChild(this.canvas)

    this.width = this.canvas.offsetWidth
    this.height = 400
    this.canvas.width = this.width * 2
    this.canvas.height = this.height * 2
    this.ctx = this.canvas.getContext('2d')
    this.ctx.scale(2, 2)

    // Build graph from proof steps and dependencies
    this.buildGraph(proofData, graph)
    this.layoutGraph()
    this.draw()
  }

  buildGraph(proofData, graph) {
    const steps = proofData.steps || []
    const dependencies = proofData.dependencies || []

    // Add current proof as root
    this.nodes.push({
      id: 'root',
      label: proofData.title || 'Proof',
      x: 0,
      y: 0,
      color: '#ffcf7a'
    })

    // Add steps
    steps.forEach((step, i) => {
      this.nodes.push({
        id: step.id || `step-${i}`,
        label: step.title || `Step ${i + 1}`,
        x: 0,
        y: 0,
        color: '#78d7ff',
        type: 'step'
      })
    })

    // Add dependencies
    dependencies.forEach(depId => {
      const dep = graph?.byId?.get(depId)
      if (dep) {
        this.nodes.push({
          id: depId,
          label: dep.name || depId,
          x: 0,
          y: 0,
          color: '#c9aeff',
          type: 'dependency'
        })
        this.edges.push({ from: 'root', to: depId })
      }
    })

    // Add step dependencies
    steps.forEach((step, i) => {
      const stepId = step.id || `step-${i}`
      if (step.uses) {
        step.uses.forEach(use => {
          const useId = typeof use === 'object' ? use.id : use
          this.edges.push({ from: stepId, to: useId })
        })
      }
    })
  }

  layoutGraph() {
    // Simple hierarchical layout
    const layers = this.computeLayers()
    const layerHeight = this.height / (layers.length + 1)

    layers.forEach((layer, layerIndex) => {
      const layerWidth = this.width / (layer.length + 1)
      layer.forEach((node, nodeIndex) => {
        node.x = layerWidth * (nodeIndex + 1)
        node.y = layerHeight * (layerIndex + 1)
      })
    })
  }

  computeLayers() {
    const layers = []
    const visited = new Set()
    const nodeMap = new Map(this.nodes.map(n => [n.id, n]))

    const visit = (nodeId, depth) => {
      if (visited.has(nodeId)) return
      visited.add(nodeId)

      if (!layers[depth]) layers[depth] = []
      const node = nodeMap.get(nodeId)
      if (node) layers[depth].push(node)

      this.edges
        .filter(e => e.from === nodeId)
        .forEach(e => visit(e.to, depth + 1))
    }

    visit('root', 0)
    return layers
  }

  draw() {
    const ctx = this.ctx
    ctx.clearRect(0, 0, this.width, this.height)

    // Draw edges
    ctx.strokeStyle = 'rgba(148, 178, 220, 0.3)'
    ctx.lineWidth = 1.5
    this.edges.forEach(edge => {
      const from = this.nodes.find(n => n.id === edge.from)
      const to = this.nodes.find(n => n.id === edge.to)
      if (from && to) {
        ctx.beginPath()
        ctx.moveTo(from.x, from.y)
        ctx.lineTo(to.x, to.y)
        ctx.stroke()

        // Draw arrow
        const angle = Math.atan2(to.y - from.y, to.x - from.x)
        const arrowSize = 6
        ctx.beginPath()
        ctx.moveTo(to.x, to.y)
        ctx.lineTo(
          to.x - arrowSize * Math.cos(angle - Math.PI / 6),
          to.y - arrowSize * Math.sin(angle - Math.PI / 6)
        )
        ctx.lineTo(
          to.x - arrowSize * Math.cos(angle + Math.PI / 6),
          to.y - arrowSize * Math.sin(angle + Math.PI / 6)
        )
        ctx.closePath()
        ctx.fillStyle = ctx.strokeStyle
        ctx.fill()
      }
    })

    // Draw nodes
    this.nodes.forEach(node => {
      ctx.beginPath()
      ctx.arc(node.x, node.y, 8, 0, 2 * Math.PI)
      ctx.fillStyle = node.color
      ctx.fill()
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
      ctx.lineWidth = 2
      ctx.stroke()

      // Draw label
      ctx.font = '11px Inter, sans-serif'
      ctx.fillStyle = '#f5f8ff'
      ctx.textAlign = 'center'
      ctx.fillText(node.label, node.x, node.y - 16)
    })
  }

  clear() {
    this.canvas?.remove()
    this.nodes = []
    this.edges = []
  }
}

// ============================================================================
// 4. ALTERNATE PROOFS COMPARISON
// ============================================================================

export class AlternateProofsComparer {
  constructor(container) {
    this.container = container
  }

  render(mainProof, alternateProofs) {
    const wrapper = document.createElement('div')
    wrapper.className = 'pv-alternate-proofs'
    wrapper.style.cssText = `
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
      margin: 20px 0;
    `

    // Main proof
    wrapper.appendChild(this.createProofCard(mainProof, true))

    // Alternates
    alternateProofs.forEach(proof => {
      wrapper.appendChild(this.createProofCard(proof, false))
    })

    this.container.appendChild(wrapper)
  }

  createProofCard(proof, isMain) {
    const card = document.createElement('div')
    card.className = 'pv-proof-card'
    card.style.cssText = `
      padding: 18px;
      border: 1px solid ${isMain ? 'rgba(255, 207, 122, 0.4)' : 'rgba(148, 178, 220, 0.2)'};
      border-radius: 8px;
      background: rgba(12, 17, 29, 0.3);
    `

    const title = document.createElement('h4')
    title.textContent = proof.title || (isMain ? 'Main Proof' : 'Alternate Proof')
    title.style.cssText = `
      margin: 0 0 12px;
      font-size: 14px;
      font-weight: 600;
      color: ${isMain ? '#ffcf7a' : '#78d7ff'};
    `

    const meta = document.createElement('div')
    meta.style.cssText = 'font-size: 11px; color: #94a8c4; margin-bottom: 12px;'
    meta.innerHTML = `
      <div>步骤: ${proof.steps?.length || 0}</div>
      <div>依赖: ${proof.dependencies?.length || 0}</div>
      <div>难度: ${this.estimateDifficulty(proof)}</div>
    `

    const summary = document.createElement('p')
    summary.textContent = proof.explanation || proof.summary || 'No description available.'
    summary.style.cssText = 'font-size: 12.5px; line-height: 1.7; color: #c5d2e6; margin: 0;'

    card.appendChild(title)
    card.appendChild(meta)
    card.appendChild(summary)

    if (!isMain) {
      const selectBtn = document.createElement('button')
      selectBtn.textContent = '查看此证明'
      selectBtn.className = 'pv-btn'
      selectBtn.style.cssText = 'margin-top: 12px; width: 100%;'
      selectBtn.onclick = () => this.switchProof(proof)
      card.appendChild(selectBtn)
    }

    return card
  }

  estimateDifficulty(proof) {
    const steps = proof.steps?.length || 0
    const deps = proof.dependencies?.length || 0
    const score = steps + deps * 2

    if (score < 5) return '⭐ 简单'
    if (score < 10) return '⭐⭐ 中等'
    if (score < 15) return '⭐⭐⭐ 较难'
    return '⭐⭐⭐⭐ 困难'
  }

  switchProof(proof) {
    const event = new CustomEvent('proof:switch', { detail: { proof } })
    this.container.dispatchEvent(event)
  }
}

// ============================================================================
// 5. PROOF COMPLETENESS INDICATOR
// ============================================================================

export class CompletenessIndicator {
  constructor(container) {
    this.container = container
  }

  render(proof) {
    const score = this.calculateCompleteness(proof)
    const indicator = document.createElement('div')
    indicator.className = 'pv-completeness'
    indicator.style.cssText = `
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 18px;
      background: linear-gradient(135deg, rgba(120, 215, 255, 0.08), rgba(201, 174, 255, 0.08));
      border-left: 3px solid ${this.getColor(score)};
      border-radius: 6px;
      margin: 20px 0;
    `

    const label = document.createElement('div')
    label.textContent = '证明完整度'
    label.style.cssText = 'font-size: 12px; font-weight: 600; color: #c5d2e6; letter-spacing: 0.05em;'

    const bar = document.createElement('div')
    bar.style.cssText = `
      flex: 1;
      height: 8px;
      background: rgba(148, 178, 220, 0.15);
      border-radius: 4px;
      overflow: hidden;
    `

    const fill = document.createElement('div')
    fill.style.cssText = `
      height: 100%;
      width: ${score}%;
      background: linear-gradient(90deg, ${this.getColor(score)}, ${this.getColor(score, 0.6)});
      border-radius: 4px;
      transition: width 0.5s ease;
    `

    const percentage = document.createElement('div')
    percentage.textContent = `${score}%`
    percentage.style.cssText = `
      font-size: 14px;
      font-weight: 600;
      color: ${this.getColor(score)};
      min-width: 50px;
      text-align: right;
    `

    bar.appendChild(fill)
    indicator.appendChild(label)
    indicator.appendChild(bar)
    indicator.appendChild(percentage)

    // Add details
    const details = this.createDetailsPanel(proof, score)
    indicator.appendChild(details)

    this.container.appendChild(indicator)
  }

  calculateCompleteness(proof) {
    let score = 0
    const checks = [
      { key: 'statement', weight: 20, present: !!proof.statement },
      { key: 'steps', weight: 25, present: proof.steps?.length > 0 },
      { key: 'explanation', weight: 15, present: !!proof.explanation },
      { key: 'conclusion', weight: 10, present: !!proof.conclusion },
      { key: 'examples', weight: 10, present: proof.examples?.length > 0 },
      { key: 'references', weight: 10, present: proof.references?.length > 0 },
      { key: 'history', weight: 5, present: !!proof.history },
      { key: 'remarks', weight: 5, present: proof.remarks?.length > 0 }
    ]

    checks.forEach(check => {
      if (check.present) score += check.weight
    })

    return Math.round(score)
  }

  createDetailsPanel(proof, score) {
    const panel = document.createElement('details')
    panel.style.cssText = 'width: 100%; margin-top: 10px;'

    const summary = document.createElement('summary')
    summary.textContent = '查看详情'
    summary.style.cssText = `
      cursor: pointer;
      font-size: 11px;
      color: #78d7ff;
      letter-spacing: 0.05em;
      user-select: none;
    `

    const content = document.createElement('div')
    content.style.cssText = 'margin-top: 10px; font-size: 11.5px; line-height: 2; color: #c5d2e6;'

    const items = [
      { label: '命题陈述', present: !!proof.statement },
      { label: '分步证明', present: proof.steps?.length > 0 },
      { label: '直观解释', present: !!proof.explanation },
      { label: '结论', present: !!proof.conclusion },
      { label: '例子', present: proof.examples?.length > 0 },
      { label: '参考文献', present: proof.references?.length > 0 },
      { label: '历史背景', present: !!proof.history },
      { label: '备注', present: proof.remarks?.length > 0 }
    ]

    items.forEach(item => {
      const line = document.createElement('div')
      const icon = item.present ? '✓' : '○'
      const color = item.present ? '#78d7ff' : '#94a8c4'
      line.innerHTML = `<span style="color: ${color}; font-weight: 600;">${icon}</span> ${item.label}`
      content.appendChild(line)
    })

    panel.appendChild(summary)
    panel.appendChild(content)
    return panel
  }

  getColor(score, alpha = 1) {
    if (score >= 80) return `rgba(120, 215, 255, ${alpha})`
    if (score >= 60) return `rgba(255, 207, 122, ${alpha})`
    return `rgba(255, 155, 127, ${alpha})`
  }
}

// ============================================================================
// 6. LATEX EXPORT
// ============================================================================

export class LaTeXExporter {
  export(proof, metadata = {}) {
    const lines = []

    lines.push('\\documentclass[12pt]{article}')
    lines.push('\\usepackage{amsmath, amssymb, amsthm}')
    lines.push('\\usepackage[utf8]{inputenc}')
    lines.push('\\usepackage{xeCJK}')
    lines.push('')
    lines.push('\\theoremstyle{plain}')
    lines.push('\\newtheorem{theorem}{定理}')
    lines.push('\\newtheorem{lemma}{引理}')
    lines.push('\\theoremstyle{definition}')
    lines.push('\\newtheorem{definition}{定义}')
    lines.push('\\theoremstyle{remark}')
    lines.push('\\newtheorem{remark}{备注}')
    lines.push('')
    lines.push('\\begin{document}')
    lines.push('')
    lines.push(`\\title{${this.escape(metadata.title || '证明')}}`)
    if (metadata.author) lines.push(`\\author{${this.escape(metadata.author)}}`)
    lines.push('\\date{\\today}')
    lines.push('\\maketitle')
    lines.push('')

    // Statement
    if (proof.statement) {
      lines.push('\\begin{theorem}')
      lines.push(this.cleanMath(proof.statement))
      lines.push('\\end{theorem}')
      lines.push('')
    }

    // Explanation
    if (proof.explanation) {
      lines.push('\\subsection*{直观解释}')
      lines.push(this.cleanText(proof.explanation))
      lines.push('')
    }

    // Proof steps
    if (proof.steps?.length) {
      lines.push('\\begin{proof}')
      proof.steps.forEach((step, i) => {
        lines.push(`\\textbf{步骤 ${i + 1}: ${this.escape(step.title || '')}}`)
        lines.push('')
        if (step.body) {
          lines.push(this.cleanText(step.body))
          lines.push('')
        }
        if (step.uses?.length) {
          lines.push(`引用: ${step.uses.map(u => this.escape(String(u))).join(', ')}`)
          lines.push('')
        }
      })
      lines.push('\\end{proof}')
      lines.push('')
    }

    // Conclusion
    if (proof.conclusion) {
      lines.push('\\subsection*{结论}')
      lines.push(this.cleanText(proof.conclusion))
      lines.push('')
    }

    // Examples
    if (proof.examples?.length) {
      lines.push('\\subsection*{例子}')
      proof.examples.forEach(ex => {
        lines.push(`\\textbf{${this.escape(ex.title)}}`)
        lines.push('')
        lines.push(this.cleanText(ex.body))
        lines.push('')
      })
    }

    // References
    if (proof.references?.length) {
      lines.push('\\begin{thebibliography}{99}')
      proof.references.forEach((ref, i) => {
        lines.push(`\\bibitem{ref${i + 1}} ${this.escape(ref.title || ref.name || '')}`)
        if (ref.author) lines.push(`, ${this.escape(ref.author)}`)
        if (ref.year) lines.push(` (${ref.year})`)
        lines.push('')
      })
      lines.push('\\end{thebibliography}')
      lines.push('')
    }

    lines.push('\\end{document}')

    return lines.join('\n')
  }

  downloadAsFile(proof, filename = 'proof.tex') {
    const content = this.export(proof)
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  /**
   * Escape plain text for safe inclusion in a LaTeX document.
   *
   * This must be a SINGLE pass over the input. A chain of .replace() calls
   * cannot express it correctly: every replacement string introduces
   * backslashes and braces (\textbackslash{}, \{, \%), so any later .replace()
   * in the chain re-processes characters that an earlier one just produced.
   *
   * The original code did exactly that and emitted broken LaTeX:
   *   "back\slash" -> back\textbackslash\{\}slash   (braces escaped again)
   *   "a_b"        -> a\textbackslash{}_b           (the prefix got mangled)
   *
   * A single character-by-character pass is the only formulation where the
   * output of one substitution can never be seen by another.
   *
   * Note: this is LaTeX escaping, not HTML escaping. The result goes into a
   * .tex file the user downloads; it is never inserted into the DOM.
   */
  escape(text) {
    const map = {
      '\\': '\\textbackslash{}',
      '&': '\\&',
      '%': '\\%',
      $: '\\$',
      '#': '\\#',
      _: '\\_',
      '{': '\\{',
      '}': '\\}',
      '~': '\\textasciitilde{}',
      '^': '\\textasciicircum{}',
    }
    let out = ''
    for (const ch of String(text)) out += map[ch] ?? ch
    return out
  }

  cleanMath(text) {
    // Convert $...$ to LaTeX display math
    return String(text)
      .replace(/\$\$([\s\S]*?)\$\$/g, '\\[\n$1\n\\]')
      .replace(/\\\[([\s\S]*?)\\\]/g, '\\[\n$1\n\\]')
      .replace(/\$([^$]+)\$/g, '$$$1$$')
  }

  cleanText(text) {
    return this.escape(String(text).replace(/\*\*([^*]+)\*\*/g, '\\textbf{$1}'))
  }
}

// ============================================================================
// 7. PROOF SEARCH
// ============================================================================

export class ProofSearch {
  constructor(graph) {
    this.graph = graph
  }

  findUsages(theoremId) {
    const usages = []
    const nodes = Array.from(this.graph?.byId?.values() || [])

    nodes.forEach(node => {
      if (!node.proof) return

      // Check in steps
      if (node.proof.steps) {
        node.proof.steps.forEach(step => {
          if (step.uses?.includes(theoremId)) {
            usages.push({
              proofId: node.id,
              proofName: node.name,
              stepId: step.id,
              stepTitle: step.title,
              context: step.body?.slice(0, 200)
            })
          }
        })
      }

      // Check in dependencies
      if (node.proof.dependencies?.includes(theoremId)) {
        usages.push({
          proofId: node.id,
          proofName: node.name,
          type: 'dependency',
          context: node.summary?.slice(0, 200)
        })
      }
    })

    return usages
  }

  searchProofs(query) {
    const results = []
    const nodes = Array.from(this.graph?.byId?.values() || [])
    const lowerQuery = query.toLowerCase()

    nodes.forEach(node => {
      if (!node.proof) return

      let score = 0
      const matches = []

      // Search in statement
      if (node.proof.statement?.toLowerCase().includes(lowerQuery)) {
        score += 10
        matches.push({ field: 'statement', text: node.proof.statement })
      }

      // Search in steps
      node.proof.steps?.forEach(step => {
        if (step.title?.toLowerCase().includes(lowerQuery) ||
            step.body?.toLowerCase().includes(lowerQuery)) {
          score += 5
          matches.push({ field: 'step', text: step.title })
        }
      })

      // Search in explanation
      if (node.proof.explanation?.toLowerCase().includes(lowerQuery)) {
        score += 3
        matches.push({ field: 'explanation', text: node.proof.explanation })
      }

      if (score > 0) {
        results.push({
          node,
          score,
          matches
        })
      }
    })

    return results.sort((a, b) => b.score - a.score)
  }
}

// ============================================================================
// 8. ANIMATED PROOF FLOW DIAGRAM
// ============================================================================

export class ProofFlowAnimator {
  constructor(container) {
    this.container = container
    this.canvas = null
    this.ctx = null
    this.animationFrame = null
    this.particles = []
    this.time = 0
  }

  render(proof) {
    this.canvas = document.createElement('canvas')
    this.canvas.style.cssText = `
      width: 100%;
      height: 300px;
      border-radius: 8px;
      background: linear-gradient(135deg, rgba(8, 11, 20, 0.9), rgba(12, 17, 29, 0.9));
    `
    this.container.appendChild(this.canvas)

    const width = this.canvas.offsetWidth
    const height = 300
    this.canvas.width = width * 2
    this.canvas.height = height * 2
    this.ctx = this.canvas.getContext('2d')
    this.ctx.scale(2, 2)

    // Create flow based on proof steps
    this.createFlow(proof, width, height)
    this.animate()
  }

  createFlow(proof, width, height) {
    const steps = proof.steps || []
    const stepCount = steps.length || 1
    const spacing = width / (stepCount + 1)

    steps.forEach((step, i) => {
      const x = spacing * (i + 1)
      const y = height / 2

      // Create particles flowing through each step
      for (let j = 0; j < 3; j++) {
        this.particles.push({
          x,
          y: y + (Math.random() - 0.5) * 40,
          vx: 1 + Math.random(),
          vy: (Math.random() - 0.5) * 0.5,
          radius: 2 + Math.random() * 2,
          color: this.getStepColor(i, stepCount),
          alpha: 0.6 + Math.random() * 0.4,
          stepIndex: i
        })
      }
    })
  }

  animate() {
    const ctx = this.ctx
    const width = this.canvas.width / 2
    const height = this.canvas.height / 2

    ctx.fillStyle = 'rgba(8, 11, 20, 0.2)'
    ctx.fillRect(0, 0, width, height)

    // Update and draw particles
    this.particles.forEach((p, i) => {
      p.x += p.vx
      p.y += p.vy

      // Reset if out of bounds
      if (p.x > width + 10) {
        p.x = -10
        p.y = height / 2 + (Math.random() - 0.5) * 40
      }

      // Draw particle
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.radius, 0, 2 * Math.PI)
      ctx.fillStyle = p.color.replace('rgb', 'rgba').replace(')', `, ${p.alpha})`)
      ctx.fill()

      // Draw trail
      ctx.beginPath()
      ctx.moveTo(p.x, p.y)
      ctx.lineTo(p.x - p.vx * 5, p.y - p.vy * 5)
      ctx.strokeStyle = p.color.replace('rgb', 'rgba').replace(')', `, ${p.alpha * 0.3})`)
      ctx.lineWidth = p.radius * 0.5
      ctx.stroke()
    })

    this.time += 0.016
    this.animationFrame = requestAnimationFrame(() => this.animate())
  }

  getStepColor(index, total) {
    const hue = (index / total) * 60 + 180 // From cyan to blue
    return `hsl(${hue}, 70%, 65%)`
  }

  destroy() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame)
    }
    this.canvas?.remove()
  }
}

// ============================================================================
// MAIN PROOF EXPLORER
// ============================================================================

export class ProofExplorer {
  constructor(proofView, graph) {
    this.proofView = proofView
    this.graph = graph

    // Initialize features
    this.stepHighlighter = new ProofStepHighlighter(proofView)
    this.theoremPopup = new TheoremPopup(proofView, graph)
    this.latexExporter = new LaTeXExporter()
    this.proofSearch = new ProofSearch(graph)

    // Feature instances (created on demand)
    this.dependencyGraph = null
    this.alternateProofsComparer = null
    this.completenessIndicator = null
    this.flowAnimator = null
  }

  enhanceProofView(nodeId) {
    const node = this.graph?.byId?.get(nodeId)
    if (!node || !node.proof) return

    // Wait for proof view to render
    setTimeout(() => {
      this.injectEnhancements(node)
    }, 100)
  }

  injectEnhancements(node) {
    const content = this.proofView.root?.querySelector('.pv-page')
    if (!content) return

    // Add completeness indicator
    const firstCard = content.querySelector('.pv-card')
    if (firstCard) {
      const indicator = new CompletenessIndicator(firstCard)
      indicator.render(node.proof)
    }

    // Add dependency graph
    const proofCard = Array.from(content.querySelectorAll('.pv-card')).find(c =>
      c.querySelector('h2')?.textContent.includes('证明')
    )
    if (proofCard && node.proof.steps?.length) {
      const graphContainer = document.createElement('div')
      graphContainer.style.marginTop = '24px'
      proofCard.appendChild(graphContainer)

      this.dependencyGraph = new DependencyGraph(graphContainer)
      this.dependencyGraph.render(node.proof, this.graph)
    }

    // Add flow animator
    if (proofCard && node.proof.steps?.length > 2) {
      const flowContainer = document.createElement('div')
      flowContainer.style.marginTop = '20px'
      proofCard.appendChild(flowContainer)

      this.flowAnimator = new ProofFlowAnimator(flowContainer)
      this.flowAnimator.render(node.proof)
    }

    // Add LaTeX export button
    this.addExportButton(node)

    // Add usage search
    this.addUsageInfo(node)
  }

  addExportButton(node) {
    const head = this.proofView.root?.querySelector('.pv-head')
    if (!head) return

    const exportBtn = document.createElement('button')
    exportBtn.className = 'pv-btn'
    exportBtn.textContent = '📄 导出 LaTeX'
    exportBtn.title = '导出为 LaTeX 文档'
    exportBtn.onclick = () => {
      this.latexExporter.downloadAsFile(
        node.proof,
        `proof-${node.id}.tex`
      )
    }

    // Insert before close button
    const closeBtn = head.querySelector('.pv-btn:last-child')
    if (closeBtn) {
      head.insertBefore(exportBtn, closeBtn)
    } else {
      head.appendChild(exportBtn)
    }
  }

  addUsageInfo(node) {
    const content = this.proofView.root?.querySelector('.pv-page')
    if (!content) return

    const usages = this.proofSearch.findUsages(node.id)
    if (!usages.length) return

    const usageCard = document.createElement('section')
    usageCard.className = 'pv-card'
    usageCard.innerHTML = `<h2>被引用情况 · ${usages.length}</h2>`

    const list = document.createElement('ul')
    list.className = 'pv-ref-list'

    usages.slice(0, 10).forEach(usage => {
      const li = document.createElement('li')
      li.className = 'pv-ref'

      const link = document.createElement('button')
      link.className = 'pv-link'
      link.textContent = usage.proofName
      link.onclick = () => {
        this.proofView.open(usage.proofId, { pushHistory: true })
      }

      const context = document.createElement('span')
      context.style.cssText = 'color: #94a8c4; font-size: 11.5px; margin-left: 8px;'
      context.textContent = usage.stepTitle || usage.type || ''

      li.appendChild(link)
      if (context.textContent) li.appendChild(context)
      list.appendChild(li)
    })

    usageCard.appendChild(list)
    content.appendChild(usageCard)
  }

  destroy() {
    this.theoremPopup?.destroy()
    this.dependencyGraph?.clear()
    this.flowAnimator?.destroy()
  }
}

// Export all classes
export default ProofExplorer

