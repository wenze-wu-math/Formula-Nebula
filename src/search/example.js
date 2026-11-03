/**
 * ═══════════════════════════════════════════════════════════════
 *  搜索模块集成示例 · Search Module Integration Example
 * ═══════════════════════════════════════════════════════════════
 */

import { SearchUI } from './search-ui.js'
import { SearchIndex } from './index.js'
import { QueryEngine } from './query-engine.js'

/**
 * 示例数据
 */
const exampleData = {
  items: [
    {
      id: 'thm-1',
      name: '毕达哥拉斯定理',
      type: 'theorem',
      category: 'geometry',
      description: '直角三角形中，斜边的平方等于两条直角边的平方和',
      importance: 0.95,
      content: 'a² + b² = c²',
    },
    {
      id: 'conj-1',
      name: '哥德巴赫猜想',
      type: 'conjecture',
      category: 'number_theory',
      description: '每个大于2的偶数都可以表示为两个质数之和',
      importance: 0.88,
      content: 'Every even integer > 2 can be expressed as sum of two primes',
    },
    {
      id: 'def-1',
      name: '函数',
      type: 'definition',
      category: 'algebra',
      description: '设A和B是非空集合，从A到B的函数是一个对应关系',
      importance: 0.92,
      content: 'f: A → B, 每个 a ∈ A 对应唯一的 b ∈ B',
    },
    {
      id: 'thm-2',
      name: '费马最后定理',
      type: 'theorem',
      category: 'number_theory',
      description: '当n > 2时，不存在整数x, y, z满足 x^n + y^n = z^n',
      importance: 0.98,
      content: 'x^n + y^n ≠ z^n for all n > 2',
    },
    {
      id: 'def-2',
      name: '极限',
      type: 'definition',
      category: 'calculus',
      description: '当自变量趋向于某个值时，函数值趋向于一个值的概念',
      importance: 0.89,
      content: 'lim(x→a) f(x) = L',
    },
  ],
}

/**
 * 初始化搜索UI
 */
export function initializeSearch(containerId = 'search-container') {
  const container = document.getElementById(containerId)

  if (!container) {
    console.error(`Container with id "${containerId}" not found`)
    return null
  }

  // 导入 CSS
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = './search-ui.css'
  document.head.appendChild(link)

  // 创建搜索UI实例
  const searchUI = new SearchUI({
    container,
    data: exampleData,
    searchableFields: ['name', 'description', 'content'],
    indexedFields: ['type', 'category'],
    onSearch: (result) => {
      console.log('Search performed:', result)
    },
    onResultSelect: (item) => {
      console.log('Result selected:', item)
      // 处理结果选择，例如导航、高亮等
    },
  })

  return searchUI
}

/**
 * 搜索索引示例
 */
export function demonstrateSearchIndex() {
  const index = new SearchIndex({
    items: exampleData.items,
    searchableFields: ['name', 'description', 'content'],
    indexedFields: ['type', 'category'],
  })

  console.log('=== 搜索索引演示 ===')

  // 全文搜索
  console.log('\n1. 全文搜索 "theorem"')
  const results = index.search('theorem')
  console.log('Results:', results)

  // 前缀搜索
  console.log('\n2. 前缀搜索 "费"')
  const autocomplete = index.autocomplete('费', 'name')
  console.log('Autocomplete:', autocomplete)

  // 字段搜索
  console.log('\n3. 字段搜索 type=theorem')
  const fieldResults = index.searchByField('type', 'theorem')
  console.log('Field search results:', fieldResults)

  // 范围搜索
  console.log('\n4. 范围搜索 importance >= 0.9')
  const rangeResults = index.rangeSearch('importance', 0.9, 1.0)
  console.log('Range search results:', rangeResults)

  // 模糊搜索
  console.log('\n5. 模糊搜索 "phtgrs" (接近 Pythagorean)')
  const fuzzyResults = index.fuzzySearch('phtgrs', 'name', 3)
  console.log('Fuzzy search results:', fuzzyResults)

  // 统计
  console.log('\n6. 索引统计')
  console.log('Stats:', index.getStats())
}

/**
 * 查询引擎示例
 */
export function demonstrateQueryEngine() {
  const engine = new QueryEngine()

  console.log('=== 查询引擎演示 ===')

  // 解析查询
  const queries = [
    'algebra',
    'type:theorem',
    'importance:>0.9',
    'type:theorem AND importance:>0.8',
    'category:geometry OR category:algebra',
  ]

  queries.forEach(query => {
    console.log(`\n解析查询: "${query}"`)
    const parsed = engine.parseQuery(query)
    console.log('Tokens:', parsed.tokens)
    console.log('Filters:', parsed.filters)
  })

  // 验证查询
  console.log('\n\n验证查询:')
  const validationTests = [
    'valid query',
    'type:theorem AND',
    'unclosed "quote',
    '(unbalanced)',
  ]

  validationTests.forEach(query => {
    const validation = engine.validateQuery(query)
    console.log(`"${query}" - Valid: ${validation.valid}, Errors: ${validation.errors.join(', ')}`)
  })

  // 优化查询
  console.log('\n\n优化查询:')
  const queryToOptimize = 'algebra  AND  type:theorem  AND  algebra'
  console.log('Original:', queryToOptimize)
  console.log('Optimized:', engine.optimizeQuery(queryToOptimize))

  // 生成建议
  console.log('\n\n查询建议:')
  const suggestions = engine.generateSuggestions('type:', ['type', 'category', 'importance'])
  console.log('Suggestions:', suggestions)
}

/**
 * 集成示例
 */
export function integrateWithGraphVisualization() {
  // 假设已有图可视化系统
  const searchUI = initializeSearch()

  if (searchUI) {
    // 当搜索结果被选中时
    searchUI.onResultSelect = (item) => {
      console.log('Highlighting node in graph:', item.id)
      // 调用图可视化API高亮相关节点
      // highlightNode(item.id)

      // 更新图焦点
      // focusNode(item.id)
    }

    // 当搜索执行时
    searchUI.onSearch = (result) => {
      console.log('Search results:', result.results)

      // 过滤图显示
      // filterGraphNodes(result.results.map(r => r.id))

      // 显示搜索统计
      const stats = searchUI.getStats()
      console.log('Search stats:', stats)
    }
  }
}

/**
 * 高级API用法示例
 */
export function advancedUsageExample() {
  console.log('=== 高级用法示例 ===')

  // 1. 创建自定义索引
  const customIndex = new SearchIndex({
    items: exampleData.items,
    searchableFields: ['name', 'description'],
    indexedFields: ['type', 'category', 'importance'],
  })

  // 2. 搜索并获取统计
  const results = customIndex.search('theorem', {
    limit: 10,
    boostFields: {
      name: 2, // name字段权重加倍
      description: 1,
    },
  })

  console.log('Search results with boosted fields:', results)

  // 3. 获取建议
  const suggestions = customIndex.getSuggestions('theorem', {
    limit: 5,
    type: 'spelling',
  })

  console.log('Spelling suggestions:', suggestions)

  // 4. 批量操作
  customIndex.addItems([
    {
      id: 'thm-3',
      name: '中值定理',
      type: 'theorem',
      category: 'calculus',
      description: 'If a function is continuous on [a,b] and differentiable on (a,b)...',
      importance: 0.85,
      content: 'Mean Value Theorem',
    },
  ])

  console.log('Index stats after adding item:', customIndex.getStats())

  // 5. 复杂查询
  const engine = new QueryEngine()
  const executionPlan = engine.buildExecutionPlan(
    'type:theorem AND importance:>0.8',
    customIndex
  )

  console.log('Execution plan:', executionPlan)
}

/**
 * 性能测试
 */
export function performanceTest() {
  console.log('=== 性能测试 ===')

  // 创建大型数据集
  const largeDataset = {
    items: Array.from({ length: 10000 }, (_, i) => ({
      id: `item-${i}`,
      name: `Item ${i}`,
      type: ['theorem', 'conjecture', 'definition', 'lemma'][i % 4],
      category: ['algebra', 'geometry', 'number_theory', 'calculus'][i % 4],
      description: `Description for item ${i}`.repeat(Math.random() > 0.5 ? 1 : 2),
      importance: Math.random(),
      content: `Content ${i}`.repeat(5),
    })),
  }

  const index = new SearchIndex({
    items: largeDataset.items,
    searchableFields: ['name', 'description', 'content'],
    indexedFields: ['type', 'category'],
  })

  console.log('Index built with 10,000 items')

  // 测试搜索性能
  console.time('Full text search')
  const searchResults = index.search('item', { limit: 100 })
  console.timeEnd('Full text search')
  console.log(`Found ${searchResults.length} results`)

  // 测试字段搜索性能
  console.time('Field search')
  const fieldResults = index.searchByField('type', 'theorem')
  console.timeEnd('Field search')
  console.log(`Found ${fieldResults.length} results`)

  // 测试模糊搜索性能
  console.time('Fuzzy search')
  const fuzzyResults = index.fuzzySearch('itme', 'name', 2, 50)
  console.timeEnd('Fuzzy search')
  console.log(`Found ${fuzzyResults.length} results`)

  // 统计
  const stats = index.getStats()
  console.log('\nFinal statistics:', stats)
}

/**
 * 导出函数供外部使用
 */
export default {
  initializeSearch,
  demonstrateSearchIndex,
  demonstrateQueryEngine,
  integrateWithGraphVisualization,
  advancedUsageExample,
  performanceTest,
  SearchUI,
  SearchIndex,
  QueryEngine,
}
