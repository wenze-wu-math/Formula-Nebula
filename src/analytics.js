/**
 * ═══════════════════════════════════════════════════════════════
 *  隐私友好的使用分析 · Privacy-Friendly Analytics
 * ═══════════════════════════════════════════════════════════════
 *
 * 本地记录用户行为模式，不向外发送数据：
 *  · 最常查看的公式
 *  · 搜索模式
 *  · 功能使用频率
 *  · 会话统计
 *
 * 所有数据存储在 localStorage，用户可随时清除
 */

const ANALYTICS_KEY = 'formula-nebula-analytics'
const SESSION_KEY = 'formula-nebula-session'
const MAX_HISTORY = 100

export class Analytics {
  constructor() {
    this.data = this.load()
    this.session = this.loadSession()
    this.startTime = Date.now()
  }

  /**
   * Load analytics data from localStorage
   */
  load() {
    try {
      const stored = localStorage.getItem(ANALYTICS_KEY)
      if (stored) {
        return JSON.parse(stored)
      }
    } catch (e) {
      console.warn('Failed to load analytics:', e)
    }

    return {
      visits: 0,
      totalTime: 0,
      viewedNodes: {}, // id -> count
      searches: [], // recent searches
      exports: 0,
      tutorialCompleted: false,
      features: {
        search: 0,
        nodeView: 0,
        export: 0,
        shapeChange: 0,
        viewChange: 0,
        colorChange: 0,
        proofView: 0,
      },
      lastVisit: null,
      firstVisit: Date.now(),
    }
  }

  /**
   * Load current session data
   */
  loadSession() {
    return {
      id: this.generateSessionId(),
      startTime: Date.now(),
      pageViews: 0,
      interactions: 0,
    }
  }

  /**
   * Generate a random session ID
   */
  generateSessionId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Save analytics data
   */
  save() {
    try {
      localStorage.setItem(ANALYTICS_KEY, JSON.stringify(this.data))
    } catch (e) {
      console.warn('Failed to save analytics:', e)
    }
  }

  /**
   * Save session data
   */
  saveSession() {
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(this.session))
    } catch (e) {
      console.warn('Failed to save session:', e)
    }
  }

  /**
   * Track page visit
   */
  trackVisit() {
    this.data.visits++
    this.data.lastVisit = Date.now()
    this.session.pageViews++
    this.save()
    this.saveSession()
  }

  /**
   * Track node view
   */
  trackNodeView(nodeId, nodeName) {
    if (!this.data.viewedNodes[nodeId]) {
      this.data.viewedNodes[nodeId] = {
        name: nodeName,
        count: 0,
        lastView: null,
      }
    }

    this.data.viewedNodes[nodeId].count++
    this.data.viewedNodes[nodeId].lastView = Date.now()
    this.data.features.nodeView++
    this.session.interactions++

    this.save()
    this.saveSession()
  }

  /**
   * Track search query
   */
  trackSearch(query, resultsCount) {
    if (!query.trim()) return

    this.data.searches.unshift({
      query,
      resultsCount,
      timestamp: Date.now(),
    })

    // Keep only recent searches
    if (this.data.searches.length > MAX_HISTORY) {
      this.data.searches = this.data.searches.slice(0, MAX_HISTORY)
    }

    this.data.features.search++
    this.session.interactions++

    this.save()
    this.saveSession()
  }

  /**
   * Track export
   */
  trackExport(format = 'svg') {
    this.data.exports++
    this.data.features.export++
    this.session.interactions++

    this.save()
    this.saveSession()
  }

  /**
   * Track feature usage
   */
  trackFeature(feature) {
    if (this.data.features[feature] !== undefined) {
      this.data.features[feature]++
      this.session.interactions++
      this.save()
      this.saveSession()
    }
  }

  /**
   * Track session end
   */
  trackSessionEnd() {
    const duration = Date.now() - this.startTime
    this.data.totalTime += duration
    this.save()
  }

  /**
   * Get most viewed nodes
   */
  getMostViewedNodes(limit = 10) {
    return Object.entries(this.data.viewedNodes)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)
  }

  /**
   * Get recent searches
   */
  getRecentSearches(limit = 10) {
    return this.data.searches.slice(0, limit)
  }

  /**
   * Get popular search terms
   */
  getPopularSearches(limit = 10) {
    const counts = {}

    for (const { query } of this.data.searches) {
      const normalized = query.toLowerCase().trim()
      counts[normalized] = (counts[normalized] || 0) + 1
    }

    return Object.entries(counts)
      .map(([query, count]) => ({ query, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)
  }

  /**
   * Get usage summary
   */
  getSummary() {
    const avgSessionTime = this.data.visits > 0
      ? Math.round(this.data.totalTime / this.data.visits / 1000)
      : 0

    return {
      visits: this.data.visits,
      avgSessionTime: `${Math.floor(avgSessionTime / 60)}分${avgSessionTime % 60}秒`,
      totalTime: `${Math.floor(this.data.totalTime / 1000 / 60)}分钟`,
      uniqueNodesViewed: Object.keys(this.data.viewedNodes).length,
      totalSearches: this.data.searches.length,
      exports: this.data.exports,
      mostUsedFeature: Object.entries(this.data.features)
        .sort(([, a], [, b]) => b - a)[0]?.[0] || 'none',
      daysSinceFirstVisit: Math.floor((Date.now() - this.data.firstVisit) / (1000 * 60 * 60 * 24)),
      currentSessionInteractions: this.session.interactions,
    }
  }

  /**
   * Clear all analytics data
   */
  clear() {
    try {
      localStorage.removeItem(ANALYTICS_KEY)
      sessionStorage.removeItem(SESSION_KEY)
      this.data = this.load()
      this.session = this.loadSession()
      console.log('📊 Analytics data cleared')
    } catch (e) {
      console.warn('Failed to clear analytics:', e)
    }
  }

  /**
   * Export analytics data for user
   */
  exportData() {
    return {
      ...this.data,
      exportedAt: new Date().toISOString(),
      note: 'This data is stored locally on your device and is never sent to any server.',
    }
  }
}

// Singleton instance
let analyticsInstance = null

/**
 * Get analytics instance
 */
export function getAnalytics() {
  if (!analyticsInstance) {
    analyticsInstance = new Analytics()
  }
  return analyticsInstance
}

/**
 * Initialize analytics tracking
 */
export function initAnalytics(scene, ui, settings) {
  const analytics = getAnalytics()

  // Track initial visit
  analytics.trackVisit()

  // Track session end on page unload
  window.addEventListener('beforeunload', () => {
    analytics.trackSessionEnd()
  })

  // Track node views (when detail panel opens)
  if (ui && ui.currentId) {
    const originalShowDetail = ui.showDetail
    ui.showDetail = function(node, ...args) {
      if (node && node.id) {
        analytics.trackNodeView(node.id, node.name)
      }
      return originalShowDetail.call(this, node, ...args)
    }
  }

  // Expose to window for user access
  window.__formulaNebula = window.__formulaNebula || {}
  window.__formulaNebula.analytics = {
    getSummary: () => analytics.getSummary(),
    getMostViewed: (n) => analytics.getMostViewedNodes(n),
    getRecentSearches: (n) => analytics.getRecentSearches(n),
    getPopular: (n) => analytics.getPopularSearches(n),
    export: () => analytics.exportData(),
    clear: () => analytics.clear(),
  }

  console.log('📊 Analytics initialized (local only, privacy-friendly)')
  console.log('💡 View stats: window.__formulaNebula.analytics.getSummary()')

  return analytics
}

/**
 * Show usage insights to user
 */
export function showUsageInsights(analytics) {
  const summary = analytics.getSummary()
  const mostViewed = analytics.getMostViewedNodes(5)
  const popularSearches = analytics.getPopularSearches(5)

  console.group('📊 您的使用统计')
  console.log(`访问次数: ${summary.visits}`)
  console.log(`平均会话时长: ${summary.avgSessionTime}`)
  console.log(`总使用时间: ${summary.totalTime}`)
  console.log(`查看过的公式: ${summary.uniqueNodesViewed}`)
  console.log(`搜索次数: ${summary.totalSearches}`)
  console.log(`导出次数: ${summary.exports}`)
  console.log(`最常用功能: ${summary.mostUsedFeature}`)
  console.log(`使用天数: ${summary.daysSinceFirstVisit}`)

  if (mostViewed.length > 0) {
    console.group('🔥 最常查看的公式')
    mostViewed.forEach((node, i) => {
      console.log(`${i + 1}. ${node.name} (${node.count}次)`)
    })
    console.groupEnd()
  }

  if (popularSearches.length > 0) {
    console.group('🔍 热门搜索')
    popularSearches.forEach((item, i) => {
      console.log(`${i + 1}. "${item.query}" (${item.count}次)`)
    })
    console.groupEnd()
  }

  console.log('💡 提示: 可以通过 window.__formulaNebula.analytics.clear() 清除所有统计数据')
  console.groupEnd()
}
