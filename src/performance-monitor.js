/**
 * Performance Monitor - 性能监控模块
 *
 * 功能：
 * - 监控渲染性能（FPS、帧时间）
 * - 监控公式渲染性能（KaTeX vs MathJax）
 * - 监控内存使用
 * - 监控网络请求
 * - 生成性能报告
 */

class PerformanceMonitor {
  constructor() {
    this.enabled = false
    this.metrics = {
      fps: [],
      frameTime: [],
      formulaRenders: [],
      memoryUsage: [],
      networkRequests: [],
      renderCalls: 0,
      totalRenderTime: 0,
    }

    this.rendererStats = {
      katex: { count: 0, totalTime: 0, avgTime: 0 },
      mathjax: { count: 0, totalTime: 0, avgTime: 0 },
    }

    this.lastFrameTime = performance.now()
    this.frameCount = 0
    this.rafId = null

    this.observers = []
  }

  /**
   * 启动监控
   */
  start() {
    if (this.enabled) return

    this.enabled = true
    this.startTime = performance.now()
    console.log('[PerfMon] Performance monitoring started')

    // 启动 FPS 监控
    this.startFPSMonitoring()

    // 启动内存监控
    if (performance.memory) {
      this.startMemoryMonitoring()
    }

    // 监听性能条目
    this.observePerformance()
  }

  /**
   * 停止监控
   */
  stop() {
    if (!this.enabled) return

    this.enabled = false
    console.log('[PerfMon] Performance monitoring stopped')

    // 停止 FPS 监控
    if (this.rafId) {
      cancelAnimationFrame(this.rafId)
      this.rafId = null
    }

    // 停止内存监控
    if (this.memoryIntervalId) {
      clearInterval(this.memoryIntervalId)
      this.memoryIntervalId = null
    }

    // 断开观察者
    this.observers.forEach((observer) => observer.disconnect())
    this.observers = []
  }

  /**
   * FPS 监控
   */
  startFPSMonitoring() {
    const measureFrame = () => {
      if (!this.enabled) return

      const now = performance.now()
      const delta = now - this.lastFrameTime
      this.lastFrameTime = now

      // 计算 FPS
      const fps = 1000 / delta

      // 记录数据（保留最近 100 帧）
      this.metrics.fps.push(fps)
      this.metrics.frameTime.push(delta)

      if (this.metrics.fps.length > 100) {
        this.metrics.fps.shift()
        this.metrics.frameTime.shift()
      }

      this.frameCount++
      this.rafId = requestAnimationFrame(measureFrame)
    }

    this.rafId = requestAnimationFrame(measureFrame)
  }

  /**
   * 内存监控
   */
  startMemoryMonitoring() {
    const measureMemory = () => {
      if (!this.enabled) return

      const memory = {
        timestamp: Date.now(),
        usedJSHeapSize: performance.memory.usedJSHeapSize,
        totalJSHeapSize: performance.memory.totalJSHeapSize,
        jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
      }

      this.metrics.memoryUsage.push(memory)

      // 保留最近 60 个数据点（约 1 分钟）
      if (this.metrics.memoryUsage.length > 60) {
        this.metrics.memoryUsage.shift()
      }
    }

    // 每秒采样一次
    this.memoryIntervalId = setInterval(measureMemory, 1000)
  }

  /**
   * 观察性能条目
   */
  observePerformance() {
    if (!('PerformanceObserver' in window)) return

    // 观察资源加载
    try {
      const resourceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'resource') {
            this.metrics.networkRequests.push({
              name: entry.name,
              duration: entry.duration,
              size: entry.transferSize || 0,
              type: entry.initiatorType,
            })
          }
        }
      })

      resourceObserver.observe({ entryTypes: ['resource'] })
      this.observers.push(resourceObserver)
    } catch (e) {
      console.warn('[PerfMon] Resource observer not available')
    }

    // 观察长任务
    try {
      const longTaskObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          console.warn('[PerfMon] Long task detected:', entry.duration, 'ms')
        }
      })

      longTaskObserver.observe({ entryTypes: ['longtask'] })
      this.observers.push(longTaskObserver)
    } catch (e) {
      console.warn('[PerfMon] Long task observer not available')
    }
  }

  /**
   * 记录公式渲染
   */
  recordFormulaRender(renderer, duration) {
    this.metrics.formulaRenders.push({
      renderer,
      duration,
      timestamp: Date.now(),
    })

    this.metrics.renderCalls++
    this.metrics.totalRenderTime += duration

    // 更新渲染器统计
    if (this.rendererStats[renderer]) {
      this.rendererStats[renderer].count++
      this.rendererStats[renderer].totalTime += duration
      this.rendererStats[renderer].avgTime =
        this.rendererStats[renderer].totalTime / this.rendererStats[renderer].count
    }

    // 保留最近 1000 次渲染
    if (this.metrics.formulaRenders.length > 1000) {
      this.metrics.formulaRenders.shift()
    }
  }

  /**
   * 获取当前 FPS
   */
  getCurrentFPS() {
    if (this.metrics.fps.length === 0) return 0
    return this.metrics.fps[this.metrics.fps.length - 1]
  }

  /**
   * 获取平均 FPS
   */
  getAverageFPS() {
    if (this.metrics.fps.length === 0) return 0
    const sum = this.metrics.fps.reduce((a, b) => a + b, 0)
    return sum / this.metrics.fps.length
  }

  /**
   * 获取当前内存使用
   */
  getCurrentMemory() {
    if (!performance.memory) return null

    return {
      usedJSHeapSize: performance.memory.usedJSHeapSize,
      totalJSHeapSize: performance.memory.totalJSHeapSize,
      jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
      usedPercent: (performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit) * 100,
    }
  }

  /**
   * 获取性能摘要
   */
  getSummary() {
    const now = performance.now()
    const duration = now - this.startTime

    return {
      duration: duration,
      durationFormatted: this.formatDuration(duration),

      // FPS 统计
      fps: {
        current: this.getCurrentFPS(),
        average: this.getAverageFPS(),
        min: Math.min(...this.metrics.fps),
        max: Math.max(...this.metrics.fps),
      },

      // 帧时间统计
      frameTime: {
        average: this.metrics.frameTime.reduce((a, b) => a + b, 0) / this.metrics.frameTime.length,
        min: Math.min(...this.metrics.frameTime),
        max: Math.max(...this.metrics.frameTime),
      },

      // 公式渲染统计
      rendering: {
        totalCalls: this.metrics.renderCalls,
        totalTime: this.metrics.totalRenderTime,
        averageTime: this.metrics.renderCalls > 0
          ? this.metrics.totalRenderTime / this.metrics.renderCalls
          : 0,

        katex: {
          count: this.rendererStats.katex.count,
          totalTime: this.rendererStats.katex.totalTime,
          avgTime: this.rendererStats.katex.avgTime,
          percentage: this.metrics.renderCalls > 0
            ? (this.rendererStats.katex.count / this.metrics.renderCalls) * 100
            : 0,
        },

        mathjax: {
          count: this.rendererStats.mathjax.count,
          totalTime: this.rendererStats.mathjax.totalTime,
          avgTime: this.rendererStats.mathjax.avgTime,
          percentage: this.metrics.renderCalls > 0
            ? (this.rendererStats.mathjax.count / this.metrics.renderCalls) * 100
            : 0,
        },

        speedup: this.rendererStats.katex.avgTime > 0 && this.rendererStats.mathjax.avgTime > 0
          ? this.rendererStats.mathjax.avgTime / this.rendererStats.katex.avgTime
          : 0,
      },

      // 内存统计
      memory: this.getCurrentMemory(),

      // 网络统计
      network: {
        totalRequests: this.metrics.networkRequests.length,
        totalSize: this.metrics.networkRequests.reduce((sum, req) => sum + req.size, 0),
        averageDuration: this.metrics.networkRequests.length > 0
          ? this.metrics.networkRequests.reduce((sum, req) => sum + req.duration, 0) / this.metrics.networkRequests.length
          : 0,
      },
    }
  }

  /**
   * 生成性能报告
   */
  generateReport() {
    const summary = this.getSummary()

    let report = '# Performance Report\n\n'
    report += `Generated: ${new Date().toISOString()}\n`
    report += `Duration: ${summary.durationFormatted}\n\n`

    report += '## Rendering Performance\n\n'
    report += `- Current FPS: ${summary.fps.current.toFixed(1)}\n`
    report += `- Average FPS: ${summary.fps.average.toFixed(1)}\n`
    report += `- Min/Max FPS: ${summary.fps.min.toFixed(1)} / ${summary.fps.max.toFixed(1)}\n\n`

    report += '## Formula Rendering\n\n'
    report += `- Total Renders: ${summary.rendering.totalCalls}\n`
    report += `- Average Time: ${summary.rendering.averageTime.toFixed(2)}ms\n\n`

    report += `### KaTeX (${summary.rendering.katex.percentage.toFixed(1)}%)\n`
    report += `- Count: ${summary.rendering.katex.count}\n`
    report += `- Avg Time: ${summary.rendering.katex.avgTime.toFixed(2)}ms\n\n`

    report += `### MathJax (${summary.rendering.mathjax.percentage.toFixed(1)}%)\n`
    report += `- Count: ${summary.rendering.mathjax.count}\n`
    report += `- Avg Time: ${summary.rendering.mathjax.avgTime.toFixed(2)}ms\n\n`

    if (summary.rendering.speedup > 0) {
      report += `**Speedup: ${summary.rendering.speedup.toFixed(1)}x** (MathJax / KaTeX)\n\n`
    }

    if (summary.memory) {
      report += '## Memory Usage\n\n'
      report += `- Used: ${this.formatBytes(summary.memory.usedJSHeapSize)}\n`
      report += `- Total: ${this.formatBytes(summary.memory.totalJSHeapSize)}\n`
      report += `- Limit: ${this.formatBytes(summary.memory.jsHeapSizeLimit)}\n`
      report += `- Usage: ${summary.memory.usedPercent.toFixed(1)}%\n\n`
    }

    report += '## Network\n\n'
    report += `- Total Requests: ${summary.network.totalRequests}\n`
    report += `- Total Size: ${this.formatBytes(summary.network.totalSize)}\n`
    report += `- Avg Duration: ${summary.network.averageDuration.toFixed(2)}ms\n`

    return report
  }

  /**
   * 打印性能报告到控制台
   */
  printReport() {
    console.log(this.generateReport())
  }

  /**
   * 导出性能数据为 JSON
   */
  exportJSON() {
    return {
      summary: this.getSummary(),
      metrics: this.metrics,
      rendererStats: this.rendererStats,
    }
  }

  /**
   * 格式化时间
   */
  formatDuration(ms) {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`
    } else {
      return `${seconds}s`
    }
  }

  /**
   * 格式化字节大小
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes'

    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  /**
   * 重置所有数据
   */
  reset() {
    this.metrics = {
      fps: [],
      frameTime: [],
      formulaRenders: [],
      memoryUsage: [],
      networkRequests: [],
      renderCalls: 0,
      totalRenderTime: 0,
    }

    this.rendererStats = {
      katex: { count: 0, totalTime: 0, avgTime: 0 },
      mathjax: { count: 0, totalTime: 0, avgTime: 0 },
    }

    this.frameCount = 0
    this.startTime = performance.now()
  }
}

// 创建全局实例
const perfMonitor = new PerformanceMonitor()

// 导出实例和类
export { perfMonitor, PerformanceMonitor }
export default perfMonitor

// 在开发环境自动启动
if (import.meta.env.DEV) {
  perfMonitor.start()

  // 添加全局快捷键（Ctrl+Shift+P）打印报告
  window.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'P') {
      perfMonitor.printReport()
    }
  })

  // 暴露到全局（方便调试）
  window.__perfMonitor = perfMonitor
  console.log('[PerfMon] Performance monitor available as window.__perfMonitor')
  console.log('[PerfMon] Press Ctrl+Shift+P to print performance report')
}
