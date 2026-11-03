/**
 * ═══════════════════════════════════════════════════════════════
 *  高级搜索UI · Advanced Search Interface
 * ═══════════════════════════════════════════════════════════════
 *
 * 提供四大功能：
 *   1. 高级搜索 UI - 多字段条件构建
 *   2. 多条件过滤 - 实时过滤与组合
 *   3. 保存搜索 - 持久化查询条件
 *   4. 搜索历史 - 快速访问历史查询
 */

export class AdvancedSearchUI {
  constructor(options = {}) {
    this.container = options.container
    this.searchManager = options.searchManager
    this.graphData = options.graphData
    this.onSearch = options.onSearch || (() => {})
    this.onFilterChange = options.onFilterChange || (() => {})
    this.maxSavedSearches = options.maxSavedSearches || 20
    this.maxHistoryItems = options.maxHistoryItems || 50

    this.currentFilters = {}
    this.filterGroups = []
    this.isExpanded = false

    this.init()
  }

  init() {
    this.render()
    this.attachEventListeners()
    this.loadSavedSearches()
  }

  render() {
    const html = `
      <div class="advanced-search-container">
        <!-- 主搜索栏 -->
        <div class="search-header">
          <div class="search-bar-wrapper">
            <input
              type="text"
              class="search-input"
              placeholder="搜索公式、定理、猜想..."
              id="mainSearchInput"
            >
            <button class="search-btn" id="searchBtn">
              <svg width="16" height="16" viewBox="0 0 16 16">
                <path d="M11.742 10.344h-.494a6.5 6.5 0 1 0-.868.868l.502.49.618.619.093.092a.75.75 0 1 0 1.060-1.061l-.093-.092-.618-.619-.502-.491zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
              </svg>
            </button>
          </div>
          <button class="filter-toggle" id="filterToggle" title="高级过滤">
            <svg width="16" height="16" viewBox="0 0 16 16">
              <path d="M6.5 12a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM4 8a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM12 4a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"/>
            </svg>
          </button>
        </div>

        <!-- 高级过滤面板 -->
        <div class="advanced-filters-panel" id="filtersPanel" style="display: none;">
          <div class="filters-content">
            <!-- 过滤组 -->
            <div class="filter-groups" id="filterGroups"></div>

            <!-- 添加过滤按钮 -->
            <button class="btn-add-filter" id="addFilterBtn">+ 添加过滤条件</button>
          </div>

          <!-- 快速过滤预设 -->
          <div class="quick-filters">
            <h4>快速过滤</h4>
            <div class="quick-filter-chips" id="quickFilters"></div>
          </div>

          <!-- 操作按钮 -->
          <div class="filter-actions">
            <button class="btn-primary" id="applyFiltersBtn">应用过滤</button>
            <button class="btn-secondary" id="clearFiltersBtn">清除所有</button>
            <button class="btn-save-search" id="saveSearchBtn">保存搜索</button>
          </div>
        </div>

        <!-- 搜索历史 & 保存的搜索 -->
        <div class="search-history-section" id="historySection" style="display: none;">
          <div class="history-tabs">
            <button class="tab-btn active" data-tab="saved">已保存 (<span id="savedCount">0</span>)</button>
            <button class="tab-btn" data-tab="history">历史 (<span id="historyCount">0</span>)</button>
          </div>

          <!-- 已保存搜索 -->
          <div class="tab-content" id="savedTab">
            <div class="saved-searches" id="savedSearchesList"></div>
          </div>

          <!-- 搜索历史 -->
          <div class="tab-content" id="historyTab" style="display: none;">
            <div class="search-history" id="searchHistoryList"></div>
          </div>
        </div>

        <!-- 保存搜索对话框 -->
        <div class="modal" id="saveSearchModal" style="display: none;">
          <div class="modal-content">
            <div class="modal-header">
              <h3>保存搜索</h3>
              <button class="close-btn" id="closeSaveModal">&times;</button>
            </div>
            <div class="modal-body">
              <label>搜索名称</label>
              <input type="text" id="searchNameInput" placeholder="e.g., 未证明的猜想">
              <label>描述 (可选)</label>
              <textarea id="searchDescInput" placeholder="添加描述以便以后找到"></textarea>
            </div>
            <div class="modal-footer">
              <button class="btn-cancel" id="cancelSaveBtn">取消</button>
              <button class="btn-primary" id="confirmSaveBtn">保存</button>
            </div>
          </div>
        </div>
      </div>
    `

    this.container.innerHTML = html
    this.cacheDOMElements()
  }

  cacheDOMElements() {
    this.elements = {
      mainInput: this.container.querySelector('#mainSearchInput'),
      searchBtn: this.container.querySelector('#searchBtn'),
      filterToggle: this.container.querySelector('#filterToggle'),
      filtersPanel: this.container.querySelector('#filtersPanel'),
      filterGroups: this.container.querySelector('#filterGroups'),
      addFilterBtn: this.container.querySelector('#addFilterBtn'),
      applyFiltersBtn: this.container.querySelector('#applyFiltersBtn'),
      clearFiltersBtn: this.container.querySelector('#clearFiltersBtn'),
      saveSearchBtn: this.container.querySelector('#saveSearchBtn'),
      historySection: this.container.querySelector('#historySection'),
      quickFilters: this.container.querySelector('#quickFilters'),
      savedSearchesList: this.container.querySelector('#savedSearchesList'),
      searchHistoryList: this.container.querySelector('#searchHistoryList'),
      saveSearchModal: this.container.querySelector('#saveSearchModal'),
      searchNameInput: this.container.querySelector('#searchNameInput'),
      searchDescInput: this.container.querySelector('#searchDescInput'),
      savedTab: this.container.querySelector('#savedTab'),
      historyTab: this.container.querySelector('#historyTab'),
      savedCount: this.container.querySelector('#savedCount'),
      historyCount: this.container.querySelector('#historyCount'),
    }
  }

  attachEventListeners() {
    // 主搜索
    this.elements.searchBtn.addEventListener('click', () => this.performSearch())
    this.elements.mainInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this.performSearch()
    })

    // 过滤面板
    this.elements.filterToggle.addEventListener('click', () => this.toggleFiltersPanel())
    this.elements.addFilterBtn.addEventListener('click', () => this.addFilterGroup())
    this.elements.applyFiltersBtn.addEventListener('click', () => this.applyFilters())
    this.elements.clearFiltersBtn.addEventListener('click', () => this.clearAllFilters())

    // 保存搜索
    this.elements.saveSearchBtn.addEventListener('click', () => this.showSaveSearchModal())
    this.container.querySelector('#confirmSaveBtn').addEventListener('click', () => this.confirmSaveSearch())
    this.container.querySelector('#cancelSaveBtn').addEventListener('click', () => this.hideSaveSearchModal())
    this.container.querySelector('#closeSaveModal').addEventListener('click', () => this.hideSaveSearchModal())

    // 标签切换
    this.container.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab))
    })

    // 快速过滤
    this.renderQuickFilters()
  }

  toggleFiltersPanel() {
    this.isExpanded = !this.isExpanded
    this.elements.filtersPanel.style.display = this.isExpanded ? 'block' : 'none'
    this.elements.historySection.style.display = this.isExpanded ? 'block' : 'none'
  }

  addFilterGroup(fieldType = '', operator = '', value = '') {
    const groupId = `filter-${Date.now()}`
    const group = {
      id: groupId,
      fieldType,
      operator,
      value,
    }

    this.filterGroups.push(group)
    this.renderFilterGroup(group)
  }

  renderFilterGroup(group) {
    const groupElement = document.createElement('div')
    groupElement.className = 'filter-group'
    groupElement.dataset.groupId = group.id

    groupElement.innerHTML = `
      <div class="filter-controls">
        <select class="field-select" data-group-id="${group.id}">
          <option value="">选择字段...</option>
          <optgroup label="文本字段">
            <option value="name" ${group.fieldType === 'name' ? 'selected' : ''}>公式名称</option>
            <option value="id" ${group.fieldType === 'id' ? 'selected' : ''}>ID</option>
            <option value="latex" ${group.fieldType === 'latex' ? 'selected' : ''}>LaTeX</option>
            <option value="proposer" ${group.fieldType === 'proposer' ? 'selected' : ''}>提出者</option>
          </optgroup>
          <optgroup label="分类字段">
            <option value="family" ${group.fieldType === 'family' ? 'selected' : ''}>所属族</option>
            <option value="field" ${group.fieldType === 'field' ? 'selected' : ''}>领域</option>
            <option value="status" ${group.fieldType === 'status' ? 'selected' : ''}>状态</option>
          </optgroup>
          <optgroup label="数值字段">
            <option value="importance" ${group.fieldType === 'importance' ? 'selected' : ''}>重要度</option>
            <option value="degree" ${group.fieldType === 'degree' ? 'selected' : ''}>度数</option>
            <option value="year" ${group.fieldType === 'year' ? 'selected' : ''}>年份</option>
          </optgroup>
        </select>

        <select class="operator-select" data-group-id="${group.id}">
          <option value="">操作符...</option>
          <option value="contains" ${group.operator === 'contains' ? 'selected' : ''}>包含</option>
          <option value="equals" ${group.operator === 'equals' ? 'selected' : ''}>等于</option>
          <option value="notcontains" ${group.operator === 'notcontains' ? 'selected' : ''}>不包含</option>
          <option value="gt" ${group.operator === 'gt' ? 'selected' : ''}>&gt;</option>
          <option value="gte" ${group.operator === 'gte' ? 'selected' : ''}>&ge;</option>
          <option value="lt" ${group.operator === 'lt' ? 'selected' : ''}>&lt;</option>
          <option value="lte" ${group.operator === 'lte' ? 'selected' : ''}>&le;</option>
        </select>

        <input
          type="text"
          class="value-input"
          data-group-id="${group.id}"
          value="${group.value}"
          placeholder="输入值"
        >

        <button class="btn-remove-filter" data-group-id="${group.id}" title="移除此过滤">
          <svg width="16" height="16" viewBox="0 0 16 16">
            <path d="M5.5 5.5A.5.5 0 0 1 6 5h4a.5.5 0 0 1 .5.5v1H5v-1a.5.5 0 0 1 .5-.5zm-1 1v4.5a1.5 1.5 0 0 0 1.5 1.5h4a1.5 1.5 0 0 0 1.5-1.5V6.5H4.5z"/>
          </svg>
        </button>
      </div>
    `

    this.elements.filterGroups.appendChild(groupElement)

    // 绑定事件
    groupElement.querySelector('.field-select').addEventListener('change', (e) => {
      const gId = e.target.dataset.groupId
      const g = this.filterGroups.find(fg => fg.id === gId)
      if (g) g.fieldType = e.target.value
    })

    groupElement.querySelector('.operator-select').addEventListener('change', (e) => {
      const gId = e.target.dataset.groupId
      const g = this.filterGroups.find(fg => fg.id === gId)
      if (g) g.operator = e.target.value
    })

    groupElement.querySelector('.value-input').addEventListener('change', (e) => {
      const gId = e.target.dataset.groupId
      const g = this.filterGroups.find(fg => fg.id === gId)
      if (g) g.value = e.target.value
    })

    groupElement.querySelector('.btn-remove-filter').addEventListener('click', (e) => {
      const gId = e.currentTarget.dataset.groupId
      this.removeFilterGroup(gId)
    })
  }

  removeFilterGroup(groupId) {
    this.filterGroups = this.filterGroups.filter(g => g.id !== groupId)
    const element = this.elements.filterGroups.querySelector(`[data-group-id="${groupId}"]`)
    if (element) element.remove()
  }

  renderQuickFilters() {
    const quickFilters = [
      { label: '未证明的定理', query: 'status:open' },
      { label: '高重要度 (>0.8)', query: 'importance:>0.8' },
      { label: '最近五年', query: 'year:>=2020' },
      { label: '概形与族', query: 'family:scheme OR family:topo' },
      { label: '上同调理论', query: 'field:cohomology' },
    ]

    const container = this.elements.quickFilters
    container.innerHTML = quickFilters
      .map(f => `
        <button class="quick-filter-chip" data-query="${f.query}">
          ${f.label}
        </button>
      `)
      .join('')

    container.querySelectorAll('.quick-filter-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        this.elements.mainInput.value = btn.dataset.query
        this.performSearch()
      })
    })
  }

  applyFilters() {
    const validFilters = this.filterGroups.filter(g => g.fieldType && g.operator && g.value)

    if (validFilters.length === 0) {
      console.warn('No valid filters')
      return
    }

    this.currentFilters = validFilters
    this.onFilterChange(this.currentFilters)
    this.performSearch()
  }

  clearAllFilters() {
    this.filterGroups = []
    this.currentFilters = {}
    this.elements.filterGroups.innerHTML = ''
    this.elements.mainInput.value = ''
    this.onFilterChange({})
  }

  performSearch() {
    const query = this.elements.mainInput.value.trim()

    if (!query) return

    const searchObj = {
      query,
      filters: this.currentFilters,
      timestamp: Date.now(),
    }

    // 添加到历史
    this.searchManager.addToHistory(searchObj)
    this.refreshHistoryDisplay()

    // 执行搜索
    this.onSearch(searchObj)
  }

  showSaveSearchModal() {
    this.elements.searchNameInput.value = ''
    this.elements.searchDescInput.value = ''
    this.elements.saveSearchModal.style.display = 'flex'
  }

  hideSaveSearchModal() {
    this.elements.saveSearchModal.style.display = 'none'
  }

  confirmSaveSearch() {
    const name = this.elements.searchNameInput.value.trim()

    if (!name) {
      alert('请输入搜索名称')
      return
    }

    const searchObj = {
      id: `saved-${Date.now()}`,
      name,
      description: this.elements.searchDescInput.value.trim(),
      query: this.elements.mainInput.value,
      filters: this.currentFilters,
      savedAt: Date.now(),
    }

    this.searchManager.saveSearch(searchObj)
    this.refreshSavedSearchesDisplay()
    this.hideSaveSearchModal()
  }

  loadSavedSearches() {
    const saved = this.searchManager.getSavedSearches()
    this.elements.savedCount.textContent = saved.length
    this.refreshSavedSearchesDisplay()
  }

  refreshSavedSearchesDisplay() {
    const saved = this.searchManager.getSavedSearches()
    this.elements.savedCount.textContent = saved.length

    this.elements.savedSearchesList.innerHTML = saved
      .map(s => `
        <div class="search-item">
          <div class="search-item-header">
            <span class="search-item-name">${this.escapeHtml(s.name)}</span>
            <span class="search-item-date">${new Date(s.savedAt).toLocaleDateString('zh-CN')}</span>
          </div>
          ${s.description ? `<div class="search-item-desc">${this.escapeHtml(s.description)}</div>` : ''}
          <div class="search-item-query">${this.escapeHtml(s.query)}</div>
          <div class="search-item-actions">
            <button class="btn-small" data-action="load" data-search-id="${s.id}">加载</button>
            <button class="btn-small" data-action="edit" data-search-id="${s.id}">编辑</button>
            <button class="btn-small btn-danger" data-action="delete" data-search-id="${s.id}">删除</button>
          </div>
        </div>
      `)
      .join('')

    // 绑定事件
    this.elements.savedSearchesList.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = e.target.dataset.action
        const searchId = e.target.dataset.searchId

        if (action === 'load') {
          const search = this.searchManager.getSavedSearches().find(s => s.id === searchId)
          if (search) {
            this.elements.mainInput.value = search.query
            this.currentFilters = search.filters || {}
            this.performSearch()
          }
        } else if (action === 'delete') {
          this.searchManager.deleteSearch(searchId)
          this.refreshSavedSearchesDisplay()
        }
      })
    })
  }

  refreshHistoryDisplay() {
    const history = this.searchManager.getHistory()
    this.elements.historyCount.textContent = history.length

    this.elements.searchHistoryList.innerHTML = history
      .slice()
      .reverse()
      .map((h, idx) => `
        <div class="search-item">
          <div class="search-item-header">
            <span class="search-item-query">${this.escapeHtml(h.query)}</span>
            <span class="search-item-date">${new Date(h.timestamp).toLocaleTimeString('zh-CN')}</span>
          </div>
          <div class="search-item-actions">
            <button class="btn-small" data-action="reuse" data-history-index="${idx}">重用</button>
            <button class="btn-small btn-danger" data-action="remove" data-history-index="${idx}">删除</button>
          </div>
        </div>
      `)
      .join('')

    // 绑定事件
    this.elements.searchHistoryList.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = e.target.dataset.action
        const index = parseInt(e.target.dataset.historyIndex, 10)
        const history = this.searchManager.getHistory()
        const item = history[history.length - 1 - index]

        if (action === 'reuse' && item) {
          this.elements.mainInput.value = item.query
          this.currentFilters = item.filters || {}
          this.performSearch()
        } else if (action === 'remove') {
          this.searchManager.removeFromHistory(index)
          this.refreshHistoryDisplay()
        }
      })
    })
  }

  switchTab(tabName) {
    // 隐藏所有标签
    this.container.querySelectorAll('.tab-content').forEach(t => t.style.display = 'none')
    this.container.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'))

    // 显示选中标签
    if (tabName === 'saved') {
      this.elements.savedTab.style.display = 'block'
    } else if (tabName === 'history') {
      this.elements.historyTab.style.display = 'block'
      this.refreshHistoryDisplay()
    }

    this.container.querySelector(`[data-tab="${tabName}"]`).classList.add('active')
  }

  escapeHtml(text) {
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
  }
}
