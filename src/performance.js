/**
 * ═══════════════════════════════════════════════════════════════
 *  性能监控 · Performance Monitoring & Optimization
 * ═══════════════════════════════════════════════════════════════
 *
 * 监控关键指标：
 *  · FPS (Frames Per Second) - 保持 60fps 目标
 *  · Memory usage - WebGL 纹理内存
 *  · Loading times - 各阶段耗时
 *  · Interaction latency - 点击响应延迟
 */

export class PerformanceMonitor {
  constructor() {
    this.metrics = {
      fps: 60,
      frameTime: 0,
      memory: 0,
      loadingPhases: new Map(),
      interactions: [],
    }

    this.fpsHistory = []
    this.maxHistoryLength = 60 // 1 second at 60fps

    this.lastFrameTime = performance.now()
    this.frameCount = 0
    this.measuring = false
  }

  /**
   * Start FPS measurement
   */
  startMeasuring() {
    this.measuring = true
    this._measureFrame()
  }

  /**
   * Stop FPS measurement
   */
  stopMeasuring() {
    this.measuring = false
  }

  /**
   * Internal frame measurement
   */
  _measureFrame() {
    if (!this.measuring) return

    const now = performance.now()
    const delta = now - this.lastFrameTime

    if (delta > 0) {
      const fps = 1000 / delta
      this.fpsHistory.push(fps)

      if (this.fpsHistory.length > this.maxHistoryLength) {
        this.fpsHistory.shift()
      }

      // Calculate average FPS
      this.metrics.fps = this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length
      this.metrics.frameTime = delta
    }

    this.lastFrameTime = now
    requestAnimationFrame(() => this._measureFrame())
  }

  /**
   * Record loading phase timing
   */
  recordPhase(name, duration) {
    this.metrics.loadingPhases.set(name, duration)
  }

  /**
   * Start timing a phase
   */
  startPhase(name) {
    performance.mark(`phase-${name}-start`)
  }

  /**
   * End timing a phase
   */
  endPhase(name) {
    try {
      performance.mark(`phase-${name}-end`)
      performance.measure(
        `phase-${name}`,
        `phase-${name}-start`,
        `phase-${name}-end`
      )

      const measure = performance.getEntriesByName(`phase-${name}`)[0]
      if (measure) {
        this.recordPhase(name, measure.duration)
        console.log(`⏱️ ${name}: ${measure.duration.toFixed(2)}ms`)
      }
    } catch (e) {
      console.warn(`Failed to measure phase ${name}:`, e)
    }
  }

  /**
   * Record interaction latency
   */
  recordInteraction(type, latency) {
    this.metrics.interactions.push({
      type,
      latency,
      timestamp: Date.now(),
    })

    // Keep only last 100 interactions
    if (this.metrics.interactions.length > 100) {
      this.metrics.interactions.shift()
    }
  }

  /**
   * Get performance summary
   */
  getSummary() {
    const avgInteractionLatency = this.metrics.interactions.length > 0
      ? this.metrics.interactions.reduce((sum, i) => sum + i.latency, 0) / this.metrics.interactions.length
      : 0

    return {
      fps: Math.round(this.metrics.fps),
      frameTime: this.metrics.frameTime.toFixed(2),
      avgInteractionLatency: avgInteractionLatency.toFixed(2),
      loadingPhases: Object.fromEntries(this.metrics.loadingPhases),
      totalLoadTime: Array.from(this.metrics.loadingPhases.values()).reduce((a, b) => a + b, 0).toFixed(2),
    }
  }

  /**
   * Get memory info if available
   */
  getMemoryInfo() {
    if (performance.memory) {
      return {
        usedJSHeapSize: (performance.memory.usedJSHeapSize / 1048576).toFixed(2) + ' MB',
        totalJSHeapSize: (performance.memory.totalJSHeapSize / 1048576).toFixed(2) + ' MB',
        jsHeapSizeLimit: (performance.memory.jsHeapSizeLimit / 1048576).toFixed(2) + ' MB',
      }
    }
    return null
  }

  /**
   * Log performance report to console
   */
  logReport() {
    const summary = this.getSummary()
    const memory = this.getMemoryInfo()

    console.group('📊 Performance Report')
    console.log('FPS:', summary.fps)
    console.log('Frame Time:', summary.frameTime + 'ms')
    console.log('Avg Interaction Latency:', summary.avgInteractionLatency + 'ms')
    console.log('Total Load Time:', summary.totalLoadTime + 'ms')

    console.group('Loading Phases')
    for (const [name, duration] of this.metrics.loadingPhases) {
      console.log(`  ${name}:`, duration.toFixed(2) + 'ms')
    }
    console.groupEnd()

    if (memory) {
      console.group('Memory')
      console.log('  Used:', memory.usedJSHeapSize)
      console.log('  Total:', memory.totalJSHeapSize)
      console.log('  Limit:', memory.jsHeapSizeLimit)
      console.groupEnd()
    }

    console.groupEnd()
  }

  /**
   * Check if performance is good
   */
  isPerformanceGood() {
    return this.metrics.fps >= 50 // Accept 50fps as "good enough"
  }

  /**
   * Get performance grade
   */
  getGrade() {
    const fps = this.metrics.fps
    if (fps >= 58) return 'A'
    if (fps >= 50) return 'B'
    if (fps >= 40) return 'C'
    if (fps >= 30) return 'D'
    return 'F'
  }
}

// Singleton instance
export const perfMonitor = new PerformanceMonitor()

/**
 * Debounce function for performance optimization
 */
export function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Throttle function for performance optimization
 */
export function throttle(func, limit) {
  let inThrottle
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

/**
 * Request idle callback with fallback
 */
export const requestIdleCallback = window.requestIdleCallback ||
  function(cb) {
    const start = Date.now()
    return setTimeout(() => {
      cb({
        didTimeout: false,
        timeRemaining: () => Math.max(0, 50 - (Date.now() - start))
      })
    }, 1)
  }

/**
 * Cancel idle callback with fallback
 */
export const cancelIdleCallback = window.cancelIdleCallback ||
  function(id) {
    clearTimeout(id)
  }
