/**
 * ═══════════════════════════════════════════════════════════════
 *  搜索功能完整示例 · Search Feature Complete Example
 * ═══════════════════════════════════════════════════════════════
 *
 * 这个文件展示了如何集成搜索功能到 Formula Nebula 项目中。
 * 包含所有四项功能的完整工作示例。
 */

import { SearchManager } from './SearchManager.js'
import { AdvancedSearchUI } from './AdvancedSearchUI.js'

/**
 * 搜索集成类
 * 负责将搜索功能与图数据相连接
 */
export class SearchIntegration {
  constructor(options = {}) {
    this.graphData = options.graphData || { nodes: [], edges: [] }
    this.container = options.container
    this.onResultsChange = options.onResultsChange || (() => {})
    this.onVisualizationUpdate = options.onVisualizationUpdate || (() => {})

    this.searchManager = new SearchManager({
      storageKey: options.storageKey || 'formula_nebula_searches',
      maxHistory: 50,
      maxSaved: 20,
    })

    this.searchUI = null
    this.currentResults = []
    this.init()
  }

  init() {
    this.setupSearchUI()
    this.loadQuickFilterPresets()
  }

  setupSearchUI() {
    this.searchUI = new AdvancedSearchUI({
      container: this.container,
      searchManager: this.searchManager,
      graphData: this.graphData,
      onSearch: (searchObj) => this.handleSearch(searchObj),
      onFilterChange: (filters) => this.handleFilterChange(filters),
    })
  }

  /**
   * 主搜索处理函数
   * 实现了完整的搜索流程：解析 → 过滤 → 缓存 → 呈现
   */
  handleSearch(searchObj) {
    const { query, filters } = searchObj

    // 检查缓存
    const cacheKey = `${query}:${JSON.stringify(filters)}`
    let results = this.searchManager.getCachedResults(cacheKey)

    if (results) {
      console.log('Using cached results')
      this.displayResults(results, searchObj)
      return
    }

    // 执行搜索
    results = this.performSearch(query, filters)

    // 缓存结果
    this.searchManager.cacheResults(cacheKey, results)

    // 呈现结果
    this.displayResults(results, searchObj)
  }

  /**
   * 执行搜索查询
   */
  performSearch(query, filters) {
    let results = [...this.graphData.nodes]

    // 第一步：应用多条件过滤
    if (filters && filters.length > 0) {
      results = this.searchManager.executeFilters(results, filters)
    }

    // 第二步：应用文本搜索
    if (query && query.trim()) {
      results = this.performTextSearch(results, query)
    }

    // 第三步：排序结果（按相关性）
    results = this.rankResults(results, query)

    return results
  }

  /**
   * 文本搜索实现
   * 支持多字段搜索：name, id, latex, description
   */
  performTextSearch(items, query) {
    const queryLower = query.toLowerCase()

    return items.filter(item => {
      const searchFields = [
        item.name || '',
        item.id || '',
        item.latex || '',
        item.en || '',
        item.proposer || '',
      ].map(f => String(f).toLowerCase())

      return searchFields.some(field => field.includes(queryLower))
    })
  }

  /**
   * 结果排名（相关性排序）
   */
  rankResults(items, query) {
    if (!query) return items

    const queryLower = query.toLowerCase()

    return items.sort((a, b) => {
      // 计算 a 的相关性得分
      const scoreA = this.calculateRelevance(a, queryLower)
      // 计算 b 的相关性得分
      const scoreB = this.calculateRelevance(b, queryLower)
      // 高分优先
      return scoreB - scoreA
    })
  }

  /**
   * 计算单项的相关性得分
   */
  calculateRelevance(item, query) {
    let score = 0

    // 名称精确匹配得 10 分
    if (String(item.name).toLowerCase() === query) {
      score += 10
    }
    // 名称开头匹配得 5 分
    else if (String(item.name).toLowerCase().startsWith(query)) {
      score += 5
    }
    // 名称包含得 2 分
    else if (String(item.name).toLowerCase().includes(query)) {
      score += 2
    }

    // ID 匹配得 3 分
    if (String(item.id).toLowerCase().includes(query)) {
      score += 3
    }

    // 重要度加权（高重要度的结果排名靠前）
    if (item.importance) {
      score += item.importance
    }

    return score
  }

  /**
   * 过滤条件变更处理
   * 可用于实时预览
   */
  handleFilterChange(filters) {
    // 可选：显示实时预览
    const previewCount = this.searchManager.executeFilters(
      this.graphData.nodes,
      filters
    ).length

    console.log(`Preview: ${previewCount} results with current filters`)
  }

  /**
   * 呈现搜索结果
   */
  displayResults(results, searchObj) {
    this.currentResults = results

    // 触发结果变更回调
    this.onResultsChange({
      results,
      count: results.length,
      searchObj,
    })

    // 触发可视化更新
    this.onVisualizationUpdate({
      nodes: results,
    })

    // 打印日志
    console.log(`Search completed: ${results.length} results found`, {
      query: searchObj.query,
      filters: searchObj.filters,
    })
  }

  /**
   * 加载快速过滤预设
   * 可根据实际数据定制
   */
  loadQuickFilterPresets() {
    // 统计数据用于生成预设
    const stats = this.analyzeGraphData()
    console.log('Graph data stats:', stats)
  }

  /**
   * 分析图数据生成统计信息
   */
  analyzeGraphData() {
    const stats = {
      totalNodes: this.graphData.nodes.length,
      families: new Set(),
      fields: new Set(),
      statuses: new Set(),
      importanceRange: { min: Infinity, max: -Infinity },
    }

    this.graphData.nodes.forEach(node => {
      if (node.family) stats.families.add(node.family)
      if (node.field) stats.fields.add(node.field)
      if (node.status) stats.statuses.add(node.status)
      if (node.importance) {
        stats.importanceRange.min = Math.min(
          stats.importanceRange.min,
          node.importance
        )
        stats.importanceRange.max = Math.max(
          stats.importanceRange.max,
          node.importance
        )
      }
    })

    return stats
  }

  /**
   * 导出搜索数据
   */
  exportSearchData() {
    return this.searchManager.export()
  }

  /**
   * 导入搜索数据
   */
  importSearchData(data) {
    this.searchManager.import(data)
    this.searchUI.refreshSavedSearchesDisplay()
  }

  /**
   * 获取搜索统计
   */
  getSearchStats() {
    return this.searchManager.getStats()
  }

  /**
   * 获取当前结果
   */
  getCurrentResults() {
    return [...this.currentResults]
  }
}

/**
 * 简化的使用示例
 */
export function createSearchExample() {
  // 模拟图数据
  const mockGraphData = {
    nodes: [
      {
        id: 'hodge-conjecture',
        name: 'Hodge 猜想',
        en: 'Hodge Conjecture',
        family: 'algebraic-geometry',
        field: 'cohomology',
        status: 'open',
        importance: 0.95,
        proposer: 'William Vallance Douglas Hodge',
        year: 1950,
        latex: 'H^{p,p}(X) \\subset H^{2p}(X, \\mathbb{Q})',
      },
      {
        id: 'riemann-hypothesis',
        name: 'Riemann 假设',
        en: 'Riemann Hypothesis',
        family: 'number-theory',
        field: 'analytic-number-theory',
        status: 'open',
        importance: 0.98,
        proposer: 'Georg Friedrich Bernhard Riemann',
        year: 1859,
        latex: '\\zeta(s) = 0 \\implies \\Re(s) = 1/2',
      },
      {
        id: 'fermat-last-theorem',
        name: 'Fermat 最后定理',
        en: "Fermat's Last Theorem",
        family: 'number-theory',
        field: 'number-theory',
        status: 'proved',
        importance: 0.92,
        proposer: 'Pierre de Fermat',
        year: 1637,
        latex: 'x^n + y^n = z^n, n > 2',
      },
      {
        id: 'birch-swinnerton-dyer',
        name: 'Birch-Swinnerton-Dyer 猜想',
        en: 'Birch-Swinnerton-Dyer Conjecture',
        family: 'elliptic-curves',
        field: 'algebraic-number-theory',
        status: 'open',
        importance: 0.88,
        proposer: 'Bryan Birch, Peter Swinnerton-Dyer',
        year: 1963,
        latex: 'L(E, s) = 0 \\implies \\text{rank}(E(\\mathbb{Q}))',
      },
    ],
    edges: [],
  }

  // 创建容器
  const container = document.createElement('div')
  document.body.appendChild(container)

  // 初始化搜索
  const search = new SearchIntegration({
    graphData: mockGraphData,
    container,
    onResultsChange: (info) => {
      console.log('Results changed:', info)
      displayResultsTable(info.results)
    },
  })

  return search
}

/**
 * 显示结果表格（演示用）
 */
function displayResultsTable(results) {
  const resultsDiv = document.getElementById('search-results') ||
    (() => {
      const div = document.createElement('div')
      div.id = 'search-results'
      div.style.cssText = 'margin-top: 20px; padding: 16px; background: #f5f5f5; border-radius: 8px;'
      document.body.appendChild(div)
      return div
    })()

  if (results.length === 0) {
    resultsDiv.innerHTML = '<p>没有找到结果</p>'
    return
  }

  const html = `
    <h3>搜索结果 (${results.length})</h3>
    <table style="width: 100%; border-collapse: collapse;">
      <thead>
        <tr style="background: #ddd;">
          <th style="padding: 8px; text-align: left; border: 1px solid #999;">名称</th>
          <th style="padding: 8px; text-align: left; border: 1px solid #999;">族</th>
          <th style="padding: 8px; text-align: left; border: 1px solid #999;">状态</th>
          <th style="padding: 8px; text-align: left; border: 1px solid #999;">重要度</th>
        </tr>
      </thead>
      <tbody>
        ${results
          .map(
            r => `
          <tr style="border: 1px solid #ddd;">
            <td style="padding: 8px;">${r.name}</td>
            <td style="padding: 8px;">${r.family}</td>
            <td style="padding: 8px;">${r.status}</td>
            <td style="padding: 8px;">${(r.importance || 0).toFixed(2)}</td>
          </tr>
        `
          )
          .join('')}
      </tbody>
    </table>
  `

  resultsDiv.innerHTML = html
}

// 导出使用方式
export { SearchManager, AdvancedSearchUI }
