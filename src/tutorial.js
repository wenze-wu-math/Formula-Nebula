/**
 * ═══════════════════════════════════════════════════════════════
 *  交互式教程系统 · Interactive Tutorial
 * ═══════════════════════════════════════════════════════════════
 *
 * 首次访问时的引导流程：
 *  1. 欢迎提示 - 简介项目
 *  2. 搜索演示 - 展示搜索功能
 *  3. 节点交互 - 点击查看详情
 *  4. 视图切换 - 不同形态展示
 *  5. 导出功能 - SVG 导出说明
 */

const TUTORIAL_KEY = 'formula-nebula-tutorial-completed'
const TUTORIAL_VERSION = '1.0'

export class Tutorial {
  constructor(scene, ui, stats = null) {
    this.scene = scene
    this.ui = ui
    // Live counts, passed in from main.js (graph.stats). Previously the intro
    // step hard-coded "405 theorems / 59 conjectures", which is the size of the
    // curated core dataset — not what the app actually renders. A first-time
    // user was told 405 while looking at 3630 points.
    this.stats = stats || null
    this.currentStep = 0
    this.steps = []
    this.overlay = null
    this.tooltip = null
    this.isActive = false
  }

  /**
   * Check if tutorial should be shown
   */
  shouldShow() {
    try {
      const completed = localStorage.getItem(TUTORIAL_KEY)
      return completed !== TUTORIAL_VERSION
    } catch {
      return true
    }
  }

  /**
   * Mark tutorial as completed
   */
  markCompleted() {
    try {
      localStorage.setItem(TUTORIAL_KEY, TUTORIAL_VERSION)
    } catch {
      // localStorage might be unavailable
    }
  }

  /**
   * Start the tutorial
   */
  start() {
    if (this.isActive) return
    this.isActive = true
    this.currentStep = 0

    this.createOverlay()
    this.defineSteps()
    this.showStep(0)
  }

  /**
   * Define tutorial steps
   */
  defineSteps() {
    this.steps = [
      {
        title: '欢迎来到公式星云 🌌',
        // Numbers come from live graph stats (see constructor). Falls back to
        // generic wording rather than to stale hard-coded figures.
        content:
          '这是一个代数几何知识图谱的 3D 可视化。<br><br>' +
          (this.stats
            ? `${this.stats.galaxyCount} 条定理构成主星系，${this.stats.conjCount} 条猜想形成星团。` +
              '每个公式的位置、大小和连线都承载着数学的结构。'
            : '定理构成主星系，未解决的猜想形成星团。每个公式的位置、大小和连线都承载着数学的结构。'),
        target: null,
        action: null,
      },
      {
        title: '搜索与查询 🔍',
        content: '按 <kbd>/</kbd> 键或点击右上角搜索框，可以查找任何公式。<br><br>支持高级查询：<br>· status:open（未解决的猜想）<br>· importance:>0.9（重要度高的定理）<br>· 霍奇 -> 黎曼（寻找两者之间的关联路径）',
        target: '#search input',
        highlight: '#search',
        action: () => {
          const input = document.querySelector('#search input')
          if (input) {
            input.focus()
            input.value = '霍奇'
            input.dispatchEvent(new Event('input', { bubbles: true }))
          }
        },
      },
      {
        title: '探索公式 ✨',
        content: '点击任何公式节点可查看详细信息：<br>· 公式的完整陈述<br>· 历史背景与证明思路<br>· 关联的其它定理<br><br>鼠标悬停在连线上可以看到两个公式为什么相关。',
        target: null,
        action: () => {
          // Highlight a prominent node
          const nodes = this.scene?.graph?.nodes
          if (nodes && nodes.length > 0) {
            // Find Hodge conjecture if exists
            const hodge = nodes.find(n => n.name && n.name.includes('霍奇'))
            if (hodge && this.scene.focusOn) {
              this.scene.focusOn(hodge.id, { silent: false })
            }
          }
        },
      },
      {
        title: '视图模式 🎨',
        content: '右上角的设置按钮（⚙）可以：<br>· 切换形态（螺旋、球面、柱状）<br>· 改变着色方式<br>· 调整显示层（连线、光晕、标记）<br>· 在主星系/星团/全览之间切换',
        target: '#st-open',
        highlight: '#st-open',
        action: null,
      },
      {
        title: '导出与分享 📤',
        content: '左下角的"导出 SVG"按钮可以将当前视图保存为高质量矢量图，适合用于：<br>· 学术论文插图<br>· 演示文稿<br>· 打印海报<br><br>地址栏的 URL 会实时更新，可以直接分享给他人。',
        target: '#export',
        highlight: '#exportwrap',
        action: null,
      },
      {
        title: '开始探索！🚀',
        content: '教程结束。现在你已经了解了基本操作：<br><br>· 用鼠标拖动旋转视图<br>· 滚轮缩放<br>· 点击节点查看详情<br>· 搜索框支持复杂查询<br><br>祝你在数学的星空中发现美的规律！',
        target: null,
        action: () => {
          this.markCompleted()
        },
      },
    ]
  }

  /**
   * Show a specific step
   */
  showStep(index) {
    if (index < 0 || index >= this.steps.length) {
      this.end()
      return
    }

    this.currentStep = index
    const step = this.steps[index]

    // Clear previous highlights
    this.clearHighlights()

    // Execute step action if any
    if (step.action) {
      setTimeout(() => step.action(), 300)
    }

    // Highlight target element
    if (step.highlight || step.target) {
      this.highlightElement(step.highlight || step.target)
    }

    // Show tooltip
    this.showTooltip(step)
  }

  /**
   * Create overlay
   */
  createOverlay() {
    if (this.overlay) return

    this.overlay = document.createElement('div')
    this.overlay.id = 'tutorial-overlay'
    this.overlay.style.cssText = `
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.7);
      z-index: 9998;
      backdrop-filter: blur(3px);
      transition: opacity 0.3s;
    `

    document.body.appendChild(this.overlay)

    // Click overlay to skip tutorial
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) {
        this.end()
      }
    })
  }

  /**
   * Highlight an element
   */
  highlightElement(selector) {
    const el = document.querySelector(selector)
    if (!el) return

    el.style.position = 'relative'
    el.style.zIndex = '9999'
    el.classList.add('tutorial-highlight')

    // Add highlight styles
    if (!document.getElementById('tutorial-highlight-style')) {
      const style = document.createElement('style')
      style.id = 'tutorial-highlight-style'
      style.textContent = `
        .tutorial-highlight {
          box-shadow: 0 0 0 4px rgba(120, 215, 255, 0.6),
                      0 0 0 8px rgba(120, 215, 255, 0.3),
                      0 0 30px rgba(120, 215, 255, 0.4) !important;
          border-radius: 8px;
          animation: tutorial-pulse 2s ease-in-out infinite;
        }

        @keyframes tutorial-pulse {
          0%, 100% { box-shadow: 0 0 0 4px rgba(120, 215, 255, 0.6),
                                  0 0 0 8px rgba(120, 215, 255, 0.3),
                                  0 0 30px rgba(120, 215, 255, 0.4); }
          50% { box-shadow: 0 0 0 4px rgba(120, 215, 255, 0.8),
                            0 0 0 8px rgba(120, 215, 255, 0.5),
                            0 0 40px rgba(120, 215, 255, 0.6); }
        }
      `
      document.head.appendChild(style)
    }
  }

  /**
   * Clear all highlights
   */
  clearHighlights() {
    document.querySelectorAll('.tutorial-highlight').forEach(el => {
      el.classList.remove('tutorial-highlight')
      el.style.zIndex = ''
    })
  }

  /**
   * Show tooltip for current step
   */
  showTooltip(step) {
    if (this.tooltip) {
      this.tooltip.remove()
    }

    this.tooltip = document.createElement('div')
    this.tooltip.id = 'tutorial-tooltip'
    this.tooltip.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(12, 17, 29, 0.96);
      border: 2px solid rgba(120, 215, 255, 0.6);
      border-radius: 16px;
      padding: 32px;
      max-width: 500px;
      width: 90%;
      z-index: 10000;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(20px);
      color: #f5f8ff;
    `

    const title = document.createElement('h3')
    title.style.cssText = `
      margin: 0 0 16px;
      font-size: 22px;
      color: #78d7ff;
      font-weight: 600;
    `
    title.innerHTML = step.title

    const content = document.createElement('div')
    content.style.cssText = `
      margin: 0 0 24px;
      font-size: 15px;
      line-height: 1.8;
      color: #c5d2e6;
    `
    content.innerHTML = step.content

    // Add kbd styling
    const kbdStyle = document.createElement('style')
    kbdStyle.textContent = `
      #tutorial-tooltip kbd {
        background: rgba(148,178,220,.15);
        border: 1px solid rgba(148,178,220,.3);
        border-radius: 4px;
        padding: 3px 7px;
        font-family: 'Monaco', 'Consolas', monospace;
        font-size: 13px;
        color: #ffcf7a;
      }
    `
    document.head.appendChild(kbdStyle)

    const controls = document.createElement('div')
    controls.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
    `

    const progress = document.createElement('div')
    progress.style.cssText = `
      font-size: 13px;
      color: #94a8c4;
    `
    progress.textContent = `${this.currentStep + 1} / ${this.steps.length}`

    const buttons = document.createElement('div')
    buttons.style.cssText = `
      display: flex;
      gap: 12px;
    `

    if (this.currentStep > 0) {
      const prevBtn = this.createButton('上一步', () => this.showStep(this.currentStep - 1))
      prevBtn.style.background = 'rgba(148,178,220,.1)'
      buttons.appendChild(prevBtn)
    }

    const nextBtn = this.createButton(
      this.currentStep === this.steps.length - 1 ? '完成' : '下一步',
      () => this.showStep(this.currentStep + 1)
    )
    nextBtn.style.background = 'rgba(120, 215, 255, 0.2)'
    nextBtn.style.borderColor = 'rgba(120, 215, 255, 0.5)'
    buttons.appendChild(nextBtn)

    const skipBtn = document.createElement('button')
    skipBtn.textContent = '跳过教程'
    skipBtn.style.cssText = `
      background: transparent;
      border: none;
      color: #8fa4c4;
      font-size: 12px;
      cursor: pointer;
      padding: 4px 8px;
      transition: color 0.2s;
    `
    skipBtn.addEventListener('mouseenter', () => skipBtn.style.color = '#f5f8ff')
    skipBtn.addEventListener('mouseleave', () => skipBtn.style.color = '#8fa4c4')
    skipBtn.addEventListener('click', () => this.end())

    controls.appendChild(progress)
    controls.appendChild(buttons)

    this.tooltip.appendChild(title)
    this.tooltip.appendChild(content)
    this.tooltip.appendChild(controls)
    this.tooltip.appendChild(skipBtn)

    document.body.appendChild(this.tooltip)
  }

  /**
   * Create a button
   */
  createButton(text, onClick) {
    const btn = document.createElement('button')
    btn.textContent = text
    btn.style.cssText = `
      padding: 10px 20px;
      border-radius: 8px;
      border: 1px solid rgba(148,178,220,.3);
      background: rgba(148,178,220,.1);
      color: #f5f8ff;
      font-size: 14px;
      font-family: inherit;
      cursor: pointer;
      transition: all 0.2s;
    `
    btn.addEventListener('mouseenter', () => {
      btn.style.transform = 'translateY(-1px)'
      btn.style.boxShadow = '0 4px 12px rgba(120,215,255,.3)'
    })
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = ''
      btn.style.boxShadow = ''
    })
    btn.addEventListener('click', onClick)
    return btn
  }

  /**
   * End the tutorial
   */
  end() {
    this.isActive = false
    this.clearHighlights()

    if (this.tooltip) {
      this.tooltip.remove()
      this.tooltip = null
    }

    if (this.overlay) {
      this.overlay.style.opacity = '0'
      setTimeout(() => {
        if (this.overlay) {
          this.overlay.remove()
          this.overlay = null
        }
      }, 300)
    }

    this.markCompleted()
  }
}

/**
 * Create and optionally start tutorial
 */
export function createTutorial(scene, ui, autoStart = true, stats = null) {
  const tutorial = new Tutorial(scene, ui, stats)

  if (autoStart && tutorial.shouldShow()) {
    // Wait a bit for the scene to be fully ready
    setTimeout(() => {
      tutorial.start()
    }, 1500)
  }

  // Expose to window for manual trigger
  window.__formulaNebula = window.__formulaNebula || {}
  window.__formulaNebula.tutorial = tutorial

  return tutorial
}
