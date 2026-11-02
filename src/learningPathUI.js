/**
 * Learning Path UI Components for Formula Nebula
 *
 * Provides interactive UI for personalized learning:
 * - Recommendations panel
 * - Progress dashboard
 * - Curriculum visualization
 * - Understanding feedback forms
 * - Session timer
 */

import { LearningPathManager } from './learningPath.js'

// ============================================================================
// 1. LEARNING PATH PANEL
// ============================================================================

export class LearningPathPanel {
  constructor(graph, proofView) {
    this.graph = graph
    this.proofView = proofView
    this.manager = new LearningPathManager(graph)
    this.userId = 'default'
    this.panel = null
    this.currentCurriculum = null
  }

  /**
   * Initialize and inject panel into UI
   */
  init() {
    this.createPanel()
    this.attachToUI()
    this.attachEventListeners()
    this.render()
  }

  /**
   * Create panel DOM structure
   */
  createPanel() {
    this.panel = document.createElement('div')
    this.panel.className = 'learning-path-panel'
    this.panel.id = 'learning-path-panel'
    this.panel.style.cssText = `
      position: fixed;
      right: 20px;
      top: 80px;
      width: 360px;
      max-height: calc(100vh - 100px);
      background: rgba(12, 17, 29, 0.95);
      border: 1px solid rgba(120, 215, 255, 0.25);
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(20px);
      overflow: hidden;
      z-index: 8000;
      display: flex;
      flex-direction: column;
      transform: translateX(400px);
      transition: transform 0.3s ease;
    `

    // Header
    const header = document.createElement('div')
    header.className = 'lp-header'
    header.style.cssText = `
      padding: 16px 20px;
      background: linear-gradient(135deg, rgba(120, 215, 255, 0.12), rgba(201, 174, 255, 0.12));
      border-bottom: 1px solid rgba(148, 178, 220, 0.15);
      display: flex;
      justify-content: space-between;
      align-items: center;
    `

    const title = document.createElement('h3')
    title.textContent = '🎯 学习路径'
    title.style.cssText = `
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: #f5f8ff;
      letter-spacing: 0.03em;
    `

    const closeBtn = document.createElement('button')
    closeBtn.className = 'lp-close-btn'
    closeBtn.innerHTML = '×'
    closeBtn.style.cssText = `
      background: none;
      border: none;
      color: #94a8c4;
      font-size: 24px;
      cursor: pointer;
      padding: 0;
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
      transition: all 0.2s;
    `
    closeBtn.onmouseover = () => {
      closeBtn.style.background = 'rgba(148, 178, 220, 0.1)'
      closeBtn.style.color = '#f5f8ff'
    }
    closeBtn.onmouseout = () => {
      closeBtn.style.background = 'none'
      closeBtn.style.color = '#94a8c4'
    }
    closeBtn.onclick = () => this.hide()

    header.appendChild(title)
    header.appendChild(closeBtn)

    // Content area
    const content = document.createElement('div')
    content.className = 'lp-content'
    content.style.cssText = `
      flex: 1;
      overflow-y: auto;
      padding: 20px;
    `

    this.panel.appendChild(header)
    this.panel.appendChild(content)
  }

  /**
   * Attach panel to document
   */
  attachToUI() {
    document.body.appendChild(this.panel)

    // Create toggle button
    const toggleBtn = document.createElement('button')
    toggleBtn.id = 'lp-toggle-btn'
    toggleBtn.innerHTML = '🎯'
    toggleBtn.title = '学习路径推荐'
    toggleBtn.style.cssText = `
      position: fixed;
      right: 20px;
      top: 20px;
      width: 48px;
      height: 48px;
      background: linear-gradient(135deg, rgba(120, 215, 255, 0.15), rgba(201, 174, 255, 0.15));
      border: 1px solid rgba(120, 215, 255, 0.3);
      border-radius: 12px;
      color: #78d7ff;
      font-size: 24px;
      cursor: pointer;
      z-index: 7999;
      backdrop-filter: blur(10px);
      transition: all 0.3s;
    `
    toggleBtn.onmouseover = () => {
      toggleBtn.style.transform = 'scale(1.05)'
      toggleBtn.style.borderColor = 'rgba(120, 215, 255, 0.6)'
    }
    toggleBtn.onmouseout = () => {
      toggleBtn.style.transform = 'scale(1)'
      toggleBtn.style.borderColor = 'rgba(120, 215, 255, 0.3)'
    }
    toggleBtn.onclick = () => this.toggle()

    document.body.appendChild(toggleBtn)
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    // Track when user opens a proof
    if (this.proofView) {
      const originalOpen = this.proofView.open
      this.proofView.open = (nodeId, options) => {
        this.manager.progressTracker.startSession(this.userId, nodeId)
        this.showFeedbackPrompt(nodeId)
        return originalOpen.call(this.proofView, nodeId, options)
      }

      const originalClose = this.proofView.close
      this.proofView.close = () => {
        this.manager.progressTracker.endSession()
        return originalClose.call(this.proofView)
      }
    }
  }

  /**
   * Render panel content
   */
  render() {
    const content = this.panel.querySelector('.lp-content')
    content.innerHTML = ''

    // Stats section
    content.appendChild(this.createStatsSection())

    // Tabs
    const tabs = this.createTabs()
    content.appendChild(tabs.container)

    // Default: show recommendations
    this.renderRecommendations(tabs.contentArea)
  }

  /**
   * Create stats section
   */
  createStatsSection() {
    const stats = this.manager.getUserStats(this.userId)

    const section = document.createElement('div')
    section.className = 'lp-stats'
    section.style.cssText = `
      background: linear-gradient(135deg, rgba(120, 215, 255, 0.08), rgba(201, 174, 255, 0.08));
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 20px;
    `

    const level = document.createElement('div')
    level.style.cssText = 'margin-bottom: 14px;'
    level.innerHTML = `
      <div style="font-size: 12px; color: #94a8c4; margin-bottom: 6px;">当前等级</div>
      <div style="display: flex; align-items: center; gap: 12px;">
        <div style="font-size: 28px; font-weight: 700; color: #78d7ff;">${stats.overallLevel}</div>
        <div style="flex: 1; height: 8px; background: rgba(148, 178, 220, 0.15); border-radius: 4px; overflow: hidden;">
          <div style="height: 100%; width: ${stats.overallLevel}%; background: linear-gradient(90deg, #78d7ff, #c9aeff); border-radius: 4px; transition: width 0.5s;"></div>
        </div>
      </div>
    `

    const grid = document.createElement('div')
    grid.style.cssText = 'display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-top: 14px;'

    const metrics = [
      { label: '已掌握', value: stats.masteredCount, icon: '✓' },
      { label: '学习中', value: stats.inProgressCount, icon: '⋯' },
      { label: '总学时', value: `${stats.totalTimeMinutes}m`, icon: '⏱' },
      { label: '理解度', value: stats.averageUnderstanding, icon: '★' }
    ]

    metrics.forEach(m => {
      const item = document.createElement('div')
      item.style.cssText = 'display: flex; align-items: center; gap: 8px; font-size: 12px;'
      item.innerHTML = `
        <span style="color: #78d7ff; font-size: 14px;">${m.icon}</span>
        <span style="color: #c5d2e6;">${m.label}</span>
        <span style="color: #f5f8ff; font-weight: 600; margin-left: auto;">${m.value}</span>
      `
      grid.appendChild(item)
    })

    section.appendChild(level)
    section.appendChild(grid)

    return section
  }

  /**
   * Create tab navigation
   */
  createTabs() {
    const container = document.createElement('div')
    container.className = 'lp-tabs'

    const nav = document.createElement('div')
    nav.style.cssText = `
      display: flex;
      gap: 8px;
      margin-bottom: 16px;
      border-bottom: 1px solid rgba(148, 178, 220, 0.1);
      padding-bottom: 8px;
    `

    const contentArea = document.createElement('div')
    contentArea.className = 'lp-tab-content'

    const tabs = [
      { id: 'recommendations', label: '推荐', icon: '💡' },
      { id: 'curriculum', label: '课程', icon: '📚' },
      { id: 'progress', label: '进度', icon: '📊' }
    ]

    tabs.forEach((tab, index) => {
      const btn = document.createElement('button')
      btn.className = 'lp-tab-btn'
      btn.dataset.tab = tab.id
      btn.textContent = `${tab.icon} ${tab.label}`
      btn.style.cssText = `
        flex: 1;
        padding: 8px 12px;
        background: ${index === 0 ? 'rgba(120, 215, 255, 0.12)' : 'none'};
        border: none;
        border-radius: 6px;
        color: ${index === 0 ? '#78d7ff' : '#94a8c4'};
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
      `

      btn.onclick = () => {
        // Reset all tabs
        nav.querySelectorAll('.lp-tab-btn').forEach(b => {
          b.style.background = 'none'
          b.style.color = '#94a8c4'
        })
        // Activate clicked tab
        btn.style.background = 'rgba(120, 215, 255, 0.12)'
        btn.style.color = '#78d7ff'

        // Render content
        contentArea.innerHTML = ''
        if (tab.id === 'recommendations') {
          this.renderRecommendations(contentArea)
        } else if (tab.id === 'curriculum') {
          this.renderCurriculum(contentArea)
        } else if (tab.id === 'progress') {
          this.renderProgress(contentArea)
        }
      }

      nav.appendChild(btn)
    })

    container.appendChild(nav)
    container.appendChild(contentArea)

    return { container, contentArea }
  }

  /**
   * Render recommendations tab
   */
  renderRecommendations(container) {
    const recommendations = this.manager.getRecommendations(this.userId, 8)

    if (recommendations.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 40px 20px; color: #94a8c4; font-size: 13px;">
          暂无推荐<br>先掌握一些基础定理吧！
        </div>
      `
      return
    }

    const list = document.createElement('div')
    list.className = 'lp-recommendation-list'
    list.style.cssText = 'display: flex; flex-direction: column; gap: 12px;'

    recommendations.forEach((rec, index) => {
      const node = this.graph?.byId?.get(rec.theoremId)
      if (!node) return

      const item = document.createElement('div')
      item.className = 'lp-rec-item'
      item.style.cssText = `
        padding: 14px 16px;
        background: rgba(12, 17, 29, 0.5);
        border: 1px solid rgba(148, 178, 220, 0.15);
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s;
      `

      const rank = document.createElement('div')
      rank.style.cssText = `
        display: inline-block;
        width: 24px;
        height: 24px;
        background: ${index < 3 ? 'linear-gradient(135deg, #78d7ff, #c9aeff)' : 'rgba(148, 178, 220, 0.2)'};
        border-radius: 6px;
        text-align: center;
        line-height: 24px;
        font-size: 12px;
        font-weight: 600;
        color: ${index < 3 ? '#0c111d' : '#94a8c4'};
        margin-bottom: 8px;
      `
      rank.textContent = index + 1

      const name = document.createElement('div')
      name.style.cssText = 'font-size: 14px; font-weight: 600; color: #f5f8ff; margin-bottom: 6px;'
      name.textContent = node.name || node.id

      const score = document.createElement('div')
      score.style.cssText = 'font-size: 11px; color: #78d7ff; margin-bottom: 8px;'
      score.textContent = `匹配度: ${rec.score}/100`

      const reason = document.createElement('div')
      reason.style.cssText = 'font-size: 11.5px; color: #94a8c4; line-height: 1.5;'
      reason.textContent = rec.reason

      item.appendChild(rank)
      item.appendChild(name)
      item.appendChild(score)
      item.appendChild(reason)

      item.onmouseover = () => {
        item.style.borderColor = 'rgba(120, 215, 255, 0.4)'
        item.style.background = 'rgba(120, 215, 255, 0.08)'
      }
      item.onmouseout = () => {
        item.style.borderColor = 'rgba(148, 178, 220, 0.15)'
        item.style.background = 'rgba(12, 17, 29, 0.5)'
      }
      item.onclick = () => {
        this.proofView.open(rec.theoremId, { pushHistory: true })
        this.hide()
      }

      list.appendChild(item)
    })

    container.appendChild(list)
  }

  /**
   * Render curriculum tab
   */
  renderCurriculum(container) {
    // Curriculum builder form
    const form = document.createElement('div')
    form.style.cssText = 'margin-bottom: 20px;'

    const formHTML = `
      <div style="margin-bottom: 12px;">
        <label style="display: block; font-size: 12px; color: #c5d2e6; margin-bottom: 6px;">起点主题</label>
        <input type="text" id="lp-start-topic" placeholder="输入定理ID或family" style="width: 100%; padding: 10px 12px; background: rgba(12, 17, 29, 0.6); border: 1px solid rgba(148, 178, 220, 0.2); border-radius: 6px; color: #f5f8ff; font-size: 13px;">
      </div>
      <div style="margin-bottom: 12px;">
        <label style="display: block; font-size: 12px; color: #c5d2e6; margin-bottom: 6px;">目标主题</label>
        <input type="text" id="lp-target-topic" placeholder="输入定理ID或family" style="width: 100%; padding: 10px 12px; background: rgba(12, 17, 29, 0.6); border: 1px solid rgba(148, 178, 220, 0.2); border-radius: 6px; color: #f5f8ff; font-size: 13px;">
      </div>
      <div style="margin-bottom: 16px;">
        <label style="display: block; font-size: 12px; color: #c5d2e6; margin-bottom: 6px;">难度</label>
        <select id="lp-difficulty" style="width: 100%; padding: 10px 12px; background: rgba(12, 17, 29, 0.6); border: 1px solid rgba(148, 178, 220, 0.2); border-radius: 6px; color: #f5f8ff; font-size: 13px;">
          <option value="easy">简单 (5步)</option>
          <option value="medium" selected>中等 (8步)</option>
          <option value="hard">困难 (12步)</option>
        </select>
      </div>
      <button id="lp-generate-btn" style="width: 100%; padding: 12px; background: linear-gradient(135deg, #78d7ff, #c9aeff); border: none; border-radius: 8px; color: #0c111d; font-size: 14px; font-weight: 600; cursor: pointer; transition: opacity 0.2s;">
        生成学习路径
      </button>
    `
    form.innerHTML = formHTML

    container.appendChild(form)

    // Result area
    const resultArea = document.createElement('div')
    resultArea.id = 'lp-curriculum-result'
    container.appendChild(resultArea)

    // Attach event
    setTimeout(() => {
      const generateBtn = document.getElementById('lp-generate-btn')
      generateBtn.onmouseover = () => generateBtn.style.opacity = '0.85'
      generateBtn.onmouseout = () => generateBtn.style.opacity = '1'
      generateBtn.onclick = () => {
        const start = document.getElementById('lp-start-topic').value.trim()
        const target = document.getElementById('lp-target-topic').value.trim()
        const difficulty = document.getElementById('lp-difficulty').value

        if (!start || !target) {
          alert('请输入起点和目标主题')
          return
        }

        this.currentCurriculum = this.manager.createCurriculum(
          this.userId,
          start,
          target,
          difficulty
        )

        this.displayCurriculum(resultArea, this.currentCurriculum)
      }
    }, 0)
  }

  /**
   * Display curriculum result
   */
  displayCurriculum(container, curriculum) {
    container.innerHTML = ''

    if (curriculum.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 30px 20px; color: #94a8c4; font-size: 13px;">
          未找到学习路径<br>请检查输入的主题ID
        </div>
      `
      return
    }

    const header = document.createElement('div')
    header.style.cssText = 'font-size: 13px; color: #c5d2e6; margin-bottom: 14px; font-weight: 600;'
    header.textContent = `学习路径 (${curriculum.length} 步)`

    const list = document.createElement('div')
    list.style.cssText = 'display: flex; flex-direction: column; gap: 10px;'

    curriculum.forEach((step, index) => {
      const node = this.graph?.byId?.get(step.theoremId)
      if (!node) return

      const item = document.createElement('div')
      item.style.cssText = `
        display: flex;
        align-items: flex-start;
        gap: 12px;
        padding: 12px;
        background: rgba(12, 17, 29, 0.5);
        border-left: 3px solid ${index === 0 ? '#78d7ff' : index === curriculum.length - 1 ? '#ffcf7a' : '#94a8c4'};
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s;
      `

      const order = document.createElement('div')
      order.style.cssText = `
        flex-shrink: 0;
        width: 28px;
        height: 28px;
        background: rgba(120, 215, 255, 0.15);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: 600;
        color: #78d7ff;
      `
      order.textContent = step.order

      const info = document.createElement('div')
      info.style.cssText = 'flex: 1;'
      info.innerHTML = `
        <div style="font-size: 13px; font-weight: 600; color: #f5f8ff; margin-bottom: 4px;">${node.name || node.id}</div>
        <div style="font-size: 11px; color: #94a8c4;">${step.reason}</div>
      `

      item.appendChild(order)
      item.appendChild(info)

      item.onmouseover = () => {
        item.style.background = 'rgba(120, 215, 255, 0.08)'
      }
      item.onmouseout = () => {
        item.style.background = 'rgba(12, 17, 29, 0.5)'
      }
      item.onclick = () => {
        this.proofView.open(step.theoremId, { pushHistory: true })
        this.hide()
      }

      list.appendChild(item)
    })

    container.appendChild(header)
    container.appendChild(list)
  }

  /**
   * Render progress tab
   */
  renderProgress(container) {
    const progress = this.manager.storage.load(this.userId)
    const theoremsList = Array.from(progress.theorems.entries())
      .sort((a, b) => b[1].lastVisited - a[1].lastVisited)
      .slice(0, 15)

    if (theoremsList.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 40px 20px; color: #94a8c4; font-size: 13px;">
          还没有学习记录<br>开始探索星云吧！
        </div>
      `
      return
    }

    const list = document.createElement('div')
    list.style.cssText = 'display: flex; flex-direction: column; gap: 12px;'

    theoremsList.forEach(([theoremId, data]) => {
      const node = this.graph?.byId?.get(theoremId)
      if (!node) return

      const item = document.createElement('div')
      item.style.cssText = `
        padding: 14px;
        background: rgba(12, 17, 29, 0.5);
        border: 1px solid rgba(148, 178, 220, 0.15);
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s;
      `

      const status = progress.masteredTheorems.has(theoremId) ? '✓ 已掌握' :
                     progress.inProgressTheorems.has(theoremId) ? '⋯ 学习中' : '○ 已浏览'
      const statusColor = progress.masteredTheorems.has(theoremId) ? '#78d7ff' : '#ffcf7a'

      item.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <div style="font-size: 13px; font-weight: 600; color: #f5f8ff;">${node.name}</div>
          <div style="font-size: 11px; color: ${statusColor};">${status}</div>
        </div>
        <div style="display: flex; gap: 16px; font-size: 11px; color: #94a8c4;">
          <span>⏱ ${Math.floor(data.timeSpent / 60)}m</span>
          <span>👁 ${data.visits}次</span>
          <span>★ ${data.understandingScore}/5</span>
          <span>完成 ${Math.round(data.completionRate * 100)}%</span>
        </div>
      `

      item.onmouseover = () => {
        item.style.borderColor = 'rgba(120, 215, 255, 0.4)'
        item.style.background = 'rgba(120, 215, 255, 0.08)'
      }
      item.onmouseout = () => {
        item.style.borderColor = 'rgba(148, 178, 220, 0.15)'
        item.style.background = 'rgba(12, 17, 29, 0.5)'
      }
      item.onclick = () => {
        this.proofView.open(theoremId, { pushHistory: true })
        this.hide()
      }

      list.appendChild(item)
    })

    container.appendChild(list)
  }

  /**
   * Show feedback prompt after viewing proof
   */
  showFeedbackPrompt(theoremId) {
    setTimeout(() => {
      const existingPrompt = document.getElementById('lp-feedback-prompt')
      if (existingPrompt) existingPrompt.remove()

      const prompt = document.createElement('div')
      prompt.id = 'lp-feedback-prompt'
      prompt.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 320px;
        padding: 18px 22px;
        background: rgba(12, 17, 29, 0.96);
        border: 1px solid rgba(120, 215, 255, 0.3);
        border-radius: 10px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
        z-index: 9500;
        animation: slideInUp 0.3s ease;
      `

      prompt.innerHTML = `
        <style>
          @keyframes slideInUp {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
        </style>
        <div style="font-size: 13px; font-weight: 600; color: #f5f8ff; margin-bottom: 10px;">理解程度如何？</div>
        <div style="display: flex; gap: 8px; margin-bottom: 12px;">
          ${[1, 2, 3, 4, 5].map(n => `
            <button class="lp-rating-btn" data-rating="${n}" style="flex: 1; padding: 8px; background: rgba(120, 215, 255, 0.1); border: 1px solid rgba(120, 215, 255, 0.2); border-radius: 6px; color: #78d7ff; font-size: 18px; cursor: pointer; transition: all 0.2s;">★</button>
          `).join('')}
        </div>
        <button class="lp-skip-btn" style="width: 100%; padding: 8px; background: none; border: 1px solid rgba(148, 178, 220, 0.2); border-radius: 6px; color: #94a8c4; font-size: 12px; cursor: pointer;">稍后</button>
      `

      document.body.appendChild(prompt)

      // Attach events
      prompt.querySelectorAll('.lp-rating-btn').forEach(btn => {
        btn.onmouseover = () => {
          btn.style.background = 'rgba(120, 215, 255, 0.25)'
          btn.style.transform = 'scale(1.05)'
        }
        btn.onmouseout = () => {
          btn.style.background = 'rgba(120, 215, 255, 0.1)'
          btn.style.transform = 'scale(1)'
        }
        btn.onclick = () => {
          const rating = parseInt(btn.dataset.rating)
          const session = this.manager.progressTracker.activeSession
          if (session) {
            const timeSpent = Math.floor((Date.now() - session.startTime) / 1000)
            this.manager.trackProgress(this.userId, theoremId, timeSpent, rating)
          }
          prompt.remove()
          this.render() // Refresh stats
        }
      })

      prompt.querySelector('.lp-skip-btn').onclick = () => {
        prompt.remove()
      }

      // Auto-hide after 15 seconds
      setTimeout(() => {
        if (document.contains(prompt)) {
          prompt.remove()
        }
      }, 15000)
    }, 2000)
  }

  /**
   * Show/hide panel
   */
  show() {
    this.panel.style.transform = 'translateX(0)'
    this.render() // Refresh on show
  }

  hide() {
    this.panel.style.transform = 'translateX(400px)'
  }

  toggle() {
    const isVisible = this.panel.style.transform === 'translateX(0px)'
    if (isVisible) {
      this.hide()
    } else {
      this.show()
    }
  }
}

export default LearningPathPanel
