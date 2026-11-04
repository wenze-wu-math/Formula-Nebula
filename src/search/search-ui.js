/**
 * ═══════════════════════════════════════════════════════════════
 *  搜索UI组件 · Search UI Component
 * ═══════════════════════════════════════════════════════════════
 *
 * 整合搜索功能的完整UI：
 *   · 搜索栏与建议
 *   · 搜索结果显示
 *   · 过滤面板
 *   · 搜索历史
 */

import { SearchIndex } from './index.js'
import { QueryEngine } from './query-engine.js'

export class SearchUI {
  constructor(options = {}) {
    this.container = options.container
    this.data = options.data || {}
    this.onResultSelect = options.onResultSelect || (() => {})
    this.onSearch = options.onSearch || (() => {})

    // 初始化搜索组件
    this.index = new SearchIndex({
      items: this.data.items || [],
      searchableFields: options.searchableFields || ['name', 'description'],
      indexedFields: options.indexedFields || ['id', 'type'],
    })

    this.queryEngine = new QueryEngine()

    // UI 状态
    this.results = []
    this.history = []
    this.isSearching = false
    this.currentQuery = ''

    this.init()
  }

  init() {
    this.render()
    this.attachEventListeners()
  }

  render() {
    const html = `
      <div class="search-ui-container">
        <div class="search-box-wrapper">
          <input
            type="text"
            class="search-input"
            id="searchInput"
            placeholder="搜索..."
            autocomplete="off"
          />
          <button class="search-icon-btn" id="searchBtn">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
            </svg>
          </button>

          <div class="suggestions-dropdown" id="suggestionsDropdown" style="display: none;">
            <div class="suggestions-list" id="suggestionsList"></div>
          </div>
        </div>

        <div class="search-results-section" id="resultsSection" style="display: none;">
          <div class="results-header">
            <span class="results-count" id="resultsCount">0 结果</span>
            <button class="clear-results-btn" id="clearResultsBtn">清除</button>
          </div>
          <div class="results-list" id="resultsList"></div>
        </div>

        <div class="search-history-section" id="historySection" style="display: none;">
          <div class="history-header">
            <h4>最近搜索</h4>
            <button class="clear-history-btn" id="clearHistoryBtn">清空历史</button>
          </div>
          <div class="history-list" id="historyList"></div>
        </div>
      </div>
    `

    this.container.innerHTML = html
    this.cacheElements()
  }

  cacheElements() {
    this.elements = {
      searchInput: this.container.querySelector('#searchInput'),
      searchBtn: this.container.querySelector('#searchBtn'),
      suggestionsDropdown: this.container.querySelector('#suggestionsDropdown'),
      suggestionsList: this.container.querySelector('#suggestionsList'),
      resultsSection: this.container.querySelector('#resultsSection'),
      resultsList: this.container.querySelector('#resultsList'),
      resultsCount: this.container.querySelector('#resultsCount'),
      clearResultsBtn: this.container.querySelector('#clearResultsBtn'),
      historySection: this.container.querySelector('#historySection'),
      historyList: this.container.querySelector('#historyList'),
      clearHistoryBtn: this.container.querySelector('#clearHistoryBtn'),
    }
  }

  attachEventListeners() {
    // 搜索输入事件
    this.elements.searchInput.addEventListener('input', e => this.onSearchInput(e))
    this.elements.searchInput.addEventListener('keydown', e => this.onSearchKeydown(e))
    this.elements.searchInput.addEventListener('focus', () => this.showSuggestions())
    this.elements.searchInput.addEventListener('blur', () => {
      setTimeout(() => this.hideSuggestions(), 200)
    })

    // 搜索按钮
    this.elements.searchBtn.addEventListener('click', () => this.performSearch())

    // 结果操作
    this.elements.clearResultsBtn?.addEventListener('click', () => this.clearResults())
    this.elements.clearHistoryBtn?.addEventListener('click', () => this.clearHistory())
  }

  /**
   * 搜索输入处理
   */
  onSearchInput(event) {
    const query = event.target.value.trim()
    this.currentQuery = query

    if (query.length === 0) {
      this.showHistory()
      this.hideSuggestions()
      return
    }

    this.updateSuggestions(query)
    this.showSuggestions()
  }

  /**
   * 搜索按键处理
   */
  onSearchKeydown(event) {
    if (event.key === 'Enter') {
      event.preventDefault()
      this.performSearch()
    } else if (event.key === 'Escape') {
      this.hideSuggestions()
    } else if (event.key === 'ArrowDown') {
      this.focusNextSuggestion()
    } else if (event.key === 'ArrowUp') {
      this.focusPreviousSuggestion()
    }
  }

  /**
   * 执行搜索
   */
  performSearch() {
    const query = this.currentQuery

    if (!query || query.length === 0) {
      return
    }

    this.isSearching = true
    this.addToHistory(query)

    // 执行查询
    const results = this.executeQuery(query)

    this.results = results
    this.displayResults(results)
    this.hideSuggestions()

    this.onSearch({
      query,
      results,
      count: results.length,
    })

    this.isSearching = false
  }

  /**
   * 执行查询
   */
  executeQuery(query) {
    const optimized = this.queryEngine.optimizeQuery(query)
    const parsed = this.queryEngine.parseQuery(optimized)

    // Assigned in both branches of the if/else below; the empty-array
    // initialiser was dead.
    let results

    // 如果有过滤条件，先执行过滤
    if (parsed.filters.length > 0) {
      results = this.applyFilters(parsed.filters)
    } else {
      results = this.index.items
    }

    // 执行全文搜索
    if (parsed.tokens.length > 0) {
      const searchTokens = parsed.tokens.filter(t => !this.queryEngine.isOperator(t))
      const searchQuery = searchTokens.join(' ')

      const searchResults = this.index.search(searchQuery, {
        limit: 1000,
      })

      const searchDocIds = searchResults.map(r => r.document.id)
      results = results.filter(item => searchDocIds.includes(item.id))

      // 根据搜索相关性排序
      const scoreMap = new Map(searchResults.map(r => [r.document.id, r.score]))
      results.sort((a, b) => {
        const scoreA = scoreMap.get(a.id) || 0
        const scoreB = scoreMap.get(b.id) || 0
        return scoreB - scoreA
      })
    }

    return results
  }

  /**
   * 应用过滤条件
   */
  applyFilters(filters) {
    let results = this.index.items

    filters.forEach(filter => {
      results = results.filter(item => {
        const value = item[filter.field]

        if (value === undefined || value === null) {
          return false
        }

        switch (filter.operator) {
          case 'eq':
            return String(value).toLowerCase() === String(filter.value).toLowerCase()

          case 'neq':
            return String(value).toLowerCase() !== String(filter.value).toLowerCase()

          case 'gt':
            return Number(value) > Number(filter.value)

          case 'gte':
            return Number(value) >= Number(filter.value)

          case 'lt':
            return Number(value) < Number(filter.value)

          case 'lte':
            return Number(value) <= Number(filter.value)

          case 'contains':
            return String(value).toLowerCase().includes(String(filter.value).toLowerCase())

          case 'startsWith':
            return String(value).toLowerCase().startsWith(String(filter.value).toLowerCase())

          case 'endsWith':
            return String(value).toLowerCase().endsWith(String(filter.value).toLowerCase())

          case 'in': {
            const values = String(filter.value)
              .split(',')
              .map(v => v.trim().toLowerCase())
            return values.includes(String(value).toLowerCase())
          }

          default:
            return true
        }
      })
    })

    return results
  }

  /**
   * 更新建议
   */
  updateSuggestions(query) {
    // 获取搜索建议
    const searchSuggestions = this.index.fuzzySearch(query, 'name', 2, 5).map(item => ({
      type: 'search',
      text: item.document.name,
      document: item.document,
    }))

    // 获取查询建议
    const querySuggestions = this.queryEngine.generateSuggestions(query, [
      'type',
      'category',
      'importance',
    ])

    const suggestions = [...searchSuggestions, ...querySuggestions]

    this.renderSuggestions(suggestions)
  }

  /**
   * 渲染建议
   */
  renderSuggestions(suggestions) {
    const html = suggestions
      .map(
        (item, index) => `
      <div class="suggestion-item" data-index="${index}">
        <div class="suggestion-icon">${this.getIconForType(item.type)}</div>
        <div class="suggestion-content">
          <div class="suggestion-text">${this.escapeHtml(item.text)}</div>
          ${item.description ? `<div class="suggestion-desc">${this.escapeHtml(item.description)}</div>` : ''}
        </div>
      </div>
    `
      )
      .join('')

    this.elements.suggestionsList.innerHTML = html

    // 添加点击事件
    this.elements.suggestionsList.querySelectorAll('.suggestion-item').forEach(item => {
      item.addEventListener('click', () => {
        const index = parseInt(item.dataset.index)
        this.selectSuggestion(suggestions[index])
      })
    })
  }

  /**
   * 选择建议
   */
  selectSuggestion(suggestion) {
    if (suggestion.type === 'search') {
      this.elements.searchInput.value = suggestion.document.name
      this.currentQuery = suggestion.document.name
    } else {
      this.elements.searchInput.value = suggestion.text
      this.currentQuery = suggestion.text
    }

    this.performSearch()
  }

  /**
   * 显示建议
   */
  showSuggestions() {
    if (this.results.length === 0) {
      this.elements.suggestionsDropdown.style.display = 'block'
    }
  }

  /**
   * 隐藏建议
   */
  hideSuggestions() {
    this.elements.suggestionsDropdown.style.display = 'none'
  }

  /**
   * 显示结果
   */
  displayResults(results) {
    this.elements.resultsCount.textContent = `${results.length} 结果`

    const html = results
      .map(
        item => `
      <div class="result-item" data-id="${item.id}">
        <div class="result-header">
          <h4 class="result-title">${this.escapeHtml(item.name || item.title || 'Untitled')}</h4>
          <span class="result-type">${this.escapeHtml(item.type || 'Item')}</span>
        </div>
        ${item.description ? `<p class="result-description">${this.escapeHtml(item.description)}</p>` : ''}
        <div class="result-meta">
          ${item.category ? `<span class="meta-tag">${this.escapeHtml(item.category)}</span>` : ''}
          ${item.importance ? `<span class="meta-importance">重要性: ${item.importance.toFixed(2)}</span>` : ''}
        </div>
      </div>
    `
      )
      .join('')

    this.elements.resultsList.innerHTML = html

    // 添加点击事件
    this.elements.resultsList.querySelectorAll('.result-item').forEach(item => {
      item.addEventListener('click', () => {
        const id = item.dataset.id
        const result = results.find(r => r.id === id)
        this.onResultSelect(result)
      })
    })

    this.elements.resultsSection.style.display = 'block'
  }

  /**
   * 显示历史
   */
  showHistory() {
    if (this.history.length === 0) {
      this.elements.historySection.style.display = 'none'
      return
    }

    const html = this.history
      .slice()
      .reverse()
      .slice(0, 10)
      .map(
        query => `
      <div class="history-item" data-query="${this.escapeHtml(query)}">
        <span class="history-icon">🕐</span>
        <span class="history-query">${this.escapeHtml(query)}</span>
      </div>
    `
      )
      .join('')

    this.elements.historyList.innerHTML = html

    // 添加点击事件
    this.elements.historyList.querySelectorAll('.history-item').forEach(item => {
      item.addEventListener('click', () => {
        const query = item.dataset.query
        this.elements.searchInput.value = query
        this.currentQuery = query
        this.performSearch()
      })
    })

    this.elements.historySection.style.display = 'block'
  }

  /**
   * 添加到历史
   */
  addToHistory(query) {
    // 移除重复
    this.history = this.history.filter(q => q !== query)
    // 添加到最前
    this.history.unshift(query)
    // 限制大小
    if (this.history.length > 50) {
      this.history.pop()
    }
  }

  /**
   * 清除结果
   */
  clearResults() {
    this.results = []
    this.elements.resultsSection.style.display = 'none'
    this.elements.searchInput.value = ''
    this.currentQuery = ''
    this.elements.searchInput.focus()
  }

  /**
   * 清除历史
   */
  clearHistory() {
    this.history = []
    this.elements.historySection.style.display = 'none'
  }

  /**
   * 获取类型图标
   */
  getIconForType(type) {
    const icons = {
      search: '🔍',
      field: '📋',
      operator: '⚙️',
    }
    return icons[type] || '•'
  }

  /**
   * HTML 转义
   */
  escapeHtml(text) {
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
  }

  /**
   * 焦点导航
   */
  focusNextSuggestion() {
    const items = this.elements.suggestionsList.querySelectorAll('.suggestion-item')
    // TODO: 实现焦点导航
  }

  focusPreviousSuggestion() {
    // TODO: 实现焦点导航
  }

  /**
   * 更新数据
   */
  updateData(newData) {
    this.data = newData
    this.index = new SearchIndex({
      items: newData.items || [],
      searchableFields: ['name', 'description'],
      indexedFields: ['id', 'type'],
    })
  }

  /**
   * 获取搜索统计
   */
  getStats() {
    return {
      totalSearches: this.history.length,
      totalResults: this.results.length,
      indexStats: this.index.getStats(),
    }
  }
}
