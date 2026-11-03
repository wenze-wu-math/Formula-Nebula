/**
 * ═══════════════════════════════════════════════════════════════
 *  搜索管理器 · Search Manager
 * ═══════════════════════════════════════════════════════════════
 *
 * 负责：
 *   · 搜索历史的存储与管理
 *   · 保存搜索的持久化
 *   · 搜索结果的缓存
 *   · 多条件过滤的执行
 */

export class SearchManager {
  constructor(options = {}) {
    this.storageKey = options.storageKey || 'formula_nebula_searches'
    this.maxHistory = options.maxHistory || 50
    this.maxSaved = options.maxSaved || 20
    this.maxCacheSize = options.maxCacheSize || 100

    this.history = []
    this.savedSearches = []
    this.resultCache = new Map()

    this.loadFromStorage()
  }

  /**
   * 添加搜索到历史
   */
  addToHistory(searchObj) {
    const item = {
      query: searchObj.query,
      filters: searchObj.filters || {},
      timestamp: Date.now(),
    }

    // 避免连续重复
    if (this.history.length > 0) {
      const last = this.history[this.history.length - 1]
      if (
        last.query === item.query &&
        JSON.stringify(last.filters) === JSON.stringify(item.filters)
      ) {
        return
      }
    }

    this.history.push(item)

    // 超过限制则删除最早的
    if (this.history.length > this.maxHistory) {
      this.history.shift()
    }

    this.saveToStorage()
  }

  /**
   * 获取搜索历史
   */
  getHistory() {
    return [...this.history]
  }

  /**
   * 清除历史
   */
  clearHistory() {
    this.history = []
    this.saveToStorage()
  }

  /**
   * 从历史中移除项
   */
  removeFromHistory(index) {
    this.history.splice(index, 1)
    this.saveToStorage()
  }

  /**
   * 保存搜索
   */
  saveSearch(searchObj) {
    const saved = {
      id: searchObj.id || `saved-${Date.now()}`,
      name: searchObj.name,
      description: searchObj.description || '',
      query: searchObj.query,
      filters: searchObj.filters || {},
      savedAt: searchObj.savedAt || Date.now(),
    }

    // 检查是否已存在
    const existingIndex = this.savedSearches.findIndex(s => s.id === saved.id)
    if (existingIndex >= 0) {
      this.savedSearches[existingIndex] = saved
    } else {
      this.savedSearches.push(saved)

      // 超过限制则删除最早的
      if (this.savedSearches.length > this.maxSaved) {
        this.savedSearches.shift()
      }
    }

    this.saveToStorage()
    return saved.id
  }

  /**
   * 获取已保存的搜索
   */
  getSavedSearches() {
    return [...this.savedSearches]
  }

  /**
   * 获取单个已保存搜索
   */
  getSearchById(id) {
    return this.savedSearches.find(s => s.id === id)
  }

  /**
   * 删除已保存的搜索
   */
  deleteSearch(id) {
    this.savedSearches = this.savedSearches.filter(s => s.id !== id)
    this.saveToStorage()
  }

  /**
   * 更新已保存搜索
   */
  updateSearch(id, updates) {
    const search = this.savedSearches.find(s => s.id === id)
    if (search) {
      Object.assign(search, updates)
      this.saveToStorage()
    }
  }

  /**
   * 执行多条件过滤
   * filters: Array<{fieldType, operator, value}>
   */
  executeFilters(items, filters) {
    if (!filters || filters.length === 0) return items

    return items.filter(item => {
      return filters.every(filter => this.matchesFilter(item, filter))
    })
  }

  /**
   * 检查单个项是否匹配过滤条件
   */
  matchesFilter(item, filter) {
    const { fieldType, operator, value } = filter
    const itemValue = item[fieldType]

    if (itemValue === undefined || itemValue === null) {
      return false
    }

    switch (operator) {
      case 'contains':
        return String(itemValue).toLowerCase().includes(String(value).toLowerCase())

      case 'equals':
        return String(itemValue).toLowerCase() === String(value).toLowerCase()

      case 'notcontains':
        return !String(itemValue).toLowerCase().includes(String(value).toLowerCase())

      case 'gt':
        return Number(itemValue) > Number(value)

      case 'gte':
        return Number(itemValue) >= Number(value)

      case 'lt':
        return Number(itemValue) < Number(value)

      case 'lte':
        return Number(itemValue) <= Number(value)

      case 'in':
        return String(value)
          .split(',')
          .map(v => v.trim().toLowerCase())
          .includes(String(itemValue).toLowerCase())

      default:
        return false
    }
  }

  /**
   * 缓存搜索结果
   */
  cacheResults(key, results) {
    if (this.resultCache.size >= this.maxCacheSize) {
      const firstKey = this.resultCache.keys().next().value
      this.resultCache.delete(firstKey)
    }

    this.resultCache.set(key, {
      results,
      timestamp: Date.now(),
    })
  }

  /**
   * 获取缓存的结果
   */
  getCachedResults(key, maxAge = 5 * 60 * 1000) {
    const cached = this.resultCache.get(key)

    if (!cached) return null

    const age = Date.now() - cached.timestamp
    if (age > maxAge) {
      this.resultCache.delete(key)
      return null
    }

    return cached.results
  }

  /**
   * 清除缓存
   */
  clearCache() {
    this.resultCache.clear()
  }

  /**
   * 保存到本地存储
   */
  saveToStorage() {
    try {
      const data = {
        history: this.history,
        savedSearches: this.savedSearches,
        version: 1,
      }

      localStorage.setItem(this.storageKey, JSON.stringify(data))
    } catch (e) {
      console.warn('Failed to save searches to localStorage:', e)
    }
  }

  /**
   * 从本地存储加载
   */
  loadFromStorage() {
    try {
      const stored = localStorage.getItem(this.storageKey)

      if (stored) {
        const data = JSON.parse(stored)

        if (data.version === 1) {
          this.history = data.history || []
          this.savedSearches = data.savedSearches || []
        }
      }
    } catch (e) {
      console.warn('Failed to load searches from localStorage:', e)
    }
  }

  /**
   * 导出搜索数据
   */
  export() {
    return {
      history: this.history,
      savedSearches: this.savedSearches,
      exportedAt: new Date().toISOString(),
    }
  }

  /**
   * 导入搜索数据
   */
  import(data) {
    if (data.history) {
      this.history = data.history.slice(-this.maxHistory)
    }

    if (data.savedSearches) {
      this.savedSearches = data.savedSearches.slice(-this.maxSaved)
    }

    this.saveToStorage()
  }

  /**
   * 统计搜索使用
   */
  getStats() {
    const queryFreq = {}
    const filterFreq = {}

    this.history.forEach(item => {
      queryFreq[item.query] = (queryFreq[item.query] || 0) + 1

      item.filters.forEach(filter => {
        const key = `${filter.fieldType}:${filter.operator}`
        filterFreq[key] = (filterFreq[key] || 0) + 1
      })
    })

    return {
      totalSearches: this.history.length,
      totalSaved: this.savedSearches.length,
      mostUsedQueries: Object.entries(queryFreq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([query, count]) => ({ query, count })),
      mostUsedFilters: Object.entries(filterFreq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([filter, count]) => ({ filter, count })),
    }
  }
}
