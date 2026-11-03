/**
 * Performance Dashboard Component
 *
 * 实时显示性能指标的可视化面板
 */

export class PerformanceDashboard {
  constructor(container, monitor) {
    this.container = container
    this.monitor = monitor
    this.updateInterval = null
    this.isVisible = false

    this.createUI()
  }

  /**
   * 创建UI
   */
  createUI() {
    this.panel = document.createElement('div')
    this.panel.id = 'performance-dashboard'
    this.panel.style.cssText = `
      position: fixed;
      top: 80px;
      right: 20px;
      width: 320px;
      background: rgba(15, 23, 42, 0.95);
      backdrop-filter: blur(10px);
      color: #f8fafc;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      z-index: 9999;
      display: none;
      overflow: hidden;
    `

    this.panel.innerHTML = `
      <div style="padding: 16px; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h3 style="margin: 0; font-size: 16px; font-weight: 600;">
            ⚡ 性能监控
          </h3>
          <button id="perf-close" style="
            background: none;
            border: none;
            color: #94a3b8;
            cursor: pointer;
            font-size: 20px;
            padding: 0;
            width: 24px;
            height: 24px;
          ">×</button>
        </div>
      </div>

      <div style="padding: 16px; max-height: 500px; overflow-y: auto;">
        <!-- FPS -->
        <div class="metric-card" style="
          background: rgba(99, 102, 241, 0.1);
          border: 1px solid rgba(99, 102, 241, 0.3);
          border-radius: 8px;
          padding: 12px;
          margin-bottom: 12px;
        ">
          <div style="font-size: 12px; color: #94a3b8; margin-bottom: 4px;">帧率 (FPS)</div>
          <div id="fps-value" style="font-size: 24px; font-weight: 700; color: #6366f1;">
            --
          </div>
          <div style="font-size: 11px; color: #64748b; margin-top: 4px;">
            平均: <span id="fps-avg">--</span>
          </div>
        </div>

        <!-- 公式渲染 -->
        <div class="metric-card" style="
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.3);
          border-radius: 8px;
          padding: 12px;
          margin-bottom: 12px;
        ">
          <div style="font-size: 12px; color: #94a3b8; margin-bottom: 4px;">公式渲染</div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <div>
              <div style="font-size: 11px; color: #10b981;">KaTeX</div>
              <div style="font-size: 16px; font-weight: 600; color: #10b981;">
                <span id="katex-count">0</span>
                <span style="font-size: 11px; opacity: 0.7;"> renders</span>
              </div>
              <div style="font-size: 10px; color: #64748b;">
                ~<span id="katex-avg">0</span>ms
              </div>
            </div>
            <div>
              <div style="font-size: 11px; color: #f59e0b;">MathJax</div>
              <div style="font-size: 16px; font-weight: 600; color: #f59e0b;">
                <span id="mathjax-count">0</span>
                <span style="font-size: 11px; opacity: 0.7;"> renders</span>
              </div>
              <div style="font-size: 10px; color: #64748b;">
                ~<span id="mathjax-avg">0</span>ms
              </div>
            </div>
          </div>
          <div id="speedup-indicator" style="
            font-size: 11px;
            color: #10b981;
            text-align: center;
            padding: 4px 8px;
            background: rgba(16, 185, 129, 0.1);
            border-radius: 4px;
            display: none;
          "></div>
        </div>

        <!-- 内存使用 -->
        <div class="metric-card" style="
          background: rgba(139, 92, 246, 0.1);
          border: 1px solid rgba(139, 92, 246, 0.3);
          border-radius: 8px;
          padding: 12px;
          margin-bottom: 12px;
        ">
          <div style="font-size: 12px; color: #94a3b8; margin-bottom: 4px;">内存使用</div>
          <div id="memory-value" style="font-size: 20px; font-weight: 600; color: #8b5cf6;">
            -- MB
          </div>
          <div style="width: 100%; height: 4px; background: rgba(139, 92, 246, 0.2); border-radius: 2px; margin-top: 8px; overflow: hidden;">
            <div id="memory-bar" style="height: 100%; background: #8b5cf6; width: 0%; transition: width 0.3s;"></div>
          </div>
          <div style="font-size: 10px; color: #64748b; margin-top: 4px;">
            <span id="memory-percent">0</span>% of <span id="memory-limit">--</span> MB
          </div>
        </div>

        <!-- 网络 -->
        <div class="metric-card" style="
          background: rgba(236, 72, 153, 0.1);
          border: 1px solid rgba(236, 72, 153, 0.3);
          border-radius: 8px;
          padding: 12px;
        ">
          <div style="font-size: 12px; color: #94a3b8; margin-bottom: 4px;">网络</div>
          <div style="font-size: 16px; font-weight: 600; color: #ec4899;">
            <span id="network-requests">0</span>
            <span style="font-size: 11px; opacity: 0.7;"> requests</span>
          </div>
          <div style="font-size: 11px; color: #64748b; margin-top: 4px;">
            总计: <span id="network-size">0 KB</span>
          </div>
        </div>
      </div>

      <div style="
        padding: 12px 16px;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        display: flex;
        gap: 8px;
      ">
        <button id="perf-export" style="
          flex: 1;
          background: rgba(99, 102, 241, 0.1);
          border: 1px solid rgba(99, 102, 241, 0.3);
          color: #6366f1;
          padding: 8px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 500;
        ">
          导出数据
        </button>
        <button id="perf-reset" style="
          flex: 1;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #ef4444;
          padding: 8px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 500;
        ">
          重置
        </button>
      </div>
    `

    // 绑定事件
    this.panel.querySelector('#perf-close').addEventListener('click', () => this.hide())
    this.panel.querySelector('#perf-export').addEventListener('click', () => this.exportData())
    this.panel.querySelector('#perf-reset').addEventListener('click', () => this.reset())

    if (this.container) {
      this.container.appendChild(this.panel)
    } else {
      document.body.appendChild(this.panel)
    }
  }

  /**
   * 显示面板
   */
  show() {
    this.isVisible = true
    this.panel.style.display = 'block'

    // 开始更新
    if (!this.updateInterval) {
      this.updateInterval = setInterval(() => this.update(), 100)
    }
  }

  /**
   * 隐藏面板
   */
  hide() {
    this.isVisible = false
    this.panel.style.display = 'none'

    // 停止更新
    if (this.updateInterval) {
      clearInterval(this.updateInterval)
      this.updateInterval = null
    }
  }

  /**
   * 切换显示/隐藏
   */
  toggle() {
    if (this.isVisible) {
      this.hide()
    } else {
      this.show()
    }
  }

  /**
   * 更新显示
   */
  update() {
    if (!this.monitor.enabled) return

    const summary = this.monitor.getSummary()

    // 更新 FPS
    this.updateElement('fps-value', summary.fps.current.toFixed(0))
    this.updateElement('fps-avg', summary.fps.average.toFixed(1))

    // 更新公式渲染
    this.updateElement('katex-count', summary.rendering.katex.count)
    this.updateElement('katex-avg', summary.rendering.katex.avgTime.toFixed(1))
    this.updateElement('mathjax-count', summary.rendering.mathjax.count)
    this.updateElement('mathjax-avg', summary.rendering.mathjax.avgTime.toFixed(1))

    // 更新加速比
    if (summary.rendering.speedup > 0) {
      const speedupEl = this.panel.querySelector('#speedup-indicator')
      speedupEl.textContent = `🚀 KaTeX ${summary.rendering.speedup.toFixed(1)}x faster`
      speedupEl.style.display = 'block'
    }

    // 更新内存
    if (summary.memory) {
      const usedMB = summary.memory.usedJSHeapSize / 1024 / 1024
      const limitMB = summary.memory.jsHeapSizeLimit / 1024 / 1024

      this.updateElement('memory-value', usedMB.toFixed(1))
      this.updateElement('memory-percent', summary.memory.usedPercent.toFixed(1))
      this.updateElement('memory-limit', limitMB.toFixed(0))

      const memoryBar = this.panel.querySelector('#memory-bar')
      memoryBar.style.width = `${summary.memory.usedPercent}%`

      // 根据使用率改变颜色
      if (summary.memory.usedPercent > 80) {
        memoryBar.style.background = '#ef4444'
      } else if (summary.memory.usedPercent > 60) {
        memoryBar.style.background = '#f59e0b'
      } else {
        memoryBar.style.background = '#8b5cf6'
      }
    }

    // 更新网络
    this.updateElement('network-requests', summary.network.totalRequests)
    this.updateElement('network-size', (summary.network.totalSize / 1024).toFixed(1))
  }

  /**
   * 更新元素内容
   */
  updateElement(id, value) {
    const el = this.panel.querySelector(`#${id}`)
    if (el) {
      el.textContent = value
    }
  }

  /**
   * 导出数据
   */
  exportData() {
    const data = this.monitor.exportJSON()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = url
    a.download = `performance-data-${Date.now()}.json`
    a.click()

    URL.revokeObjectURL(url)

    console.log('[PerfDashboard] Performance data exported')
  }

  /**
   * 重置数据
   */
  reset() {
    if (confirm('确定要重置所有性能数据吗？')) {
      this.monitor.reset()
      console.log('[PerfDashboard] Performance data reset')
    }
  }

  /**
   * 销毁面板
   */
  destroy() {
    this.hide()
    this.panel.remove()
  }
}

/**
 * 创建切换按钮
 */
export function createToggleButton(dashboard) {
  const button = document.createElement('button')
  button.id = 'perf-toggle-button'
  button.textContent = '⚡'
  button.title = '性能监控'
  button.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    width: 48px;
    height: 48px;
    background: rgba(99, 102, 241, 0.9);
    backdrop-filter: blur(10px);
    color: white;
    border: none;
    border-radius: 50%;
    font-size: 24px;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
    z-index: 10000;
    transition: all 0.3s;
  `

  button.addEventListener('mouseenter', () => {
    button.style.transform = 'scale(1.1)'
    button.style.boxShadow = '0 6px 20px rgba(99, 102, 241, 0.6)'
  })

  button.addEventListener('mouseleave', () => {
    button.style.transform = 'scale(1)'
    button.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.4)'
  })

  button.addEventListener('click', () => {
    dashboard.toggle()
  })

  document.body.appendChild(button)

  return button
}

export default PerformanceDashboard
