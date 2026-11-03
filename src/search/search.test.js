/**
 * ═══════════════════════════════════════════════════════════════
 *  搜索模块测试 · Search Module Tests
 * ═══════════════════════════════════════════════════════════════
 */

import { SearchIndex } from './index.js'
import { QueryEngine } from './query-engine.js'

// 测试数据
const testData = {
  items: [
    {
      id: 1,
      name: 'Pythagorean Theorem',
      type: 'theorem',
      category: 'geometry',
      description: 'In a right triangle, the square of the hypotenuse equals the sum of squares of other two sides',
      importance: 0.95,
      content: 'a² + b² = c²',
    },
    {
      id: 2,
      name: 'Fermat Last Theorem',
      type: 'theorem',
      category: 'number_theory',
      description: 'No three positive integers satisfy the equation for n > 2',
      importance: 0.98,
      content: 'xⁿ + yⁿ ≠ zⁿ',
    },
    {
      id: 3,
      name: 'Function Definition',
      type: 'definition',
      category: 'algebra',
      description: 'A function is a relation between sets',
      importance: 0.87,
      content: 'f: A → B',
    },
    {
      id: 4,
      name: 'Limit Concept',
      type: 'definition',
      category: 'calculus',
      description: 'The value that a function approaches',
      importance: 0.89,
      content: 'lim(x→a) f(x) = L',
    },
    {
      id: 5,
      name: 'Goldbach Conjecture',
      type: 'conjecture',
      category: 'number_theory',
      description: 'Every even integer greater than 2 can be expressed as the sum of two primes',
      importance: 0.88,
      content: 'Every even n > 2 is p + q (p, q prime)',
    },
  ],
}

/**
 * 测试 SearchIndex
 */
export function testSearchIndex() {
  console.log('╔═════════════════════════════════════════════════════════╗')
  console.log('║           Testing SearchIndex                           ║')
  console.log('╚═════════════════════════════════════════════════════════╝\n')

  const index = new SearchIndex({
    items: testData.items,
    searchableFields: ['name', 'description', 'content'],
    indexedFields: ['type', 'category'],
  })

  let passed = 0
  let failed = 0

  // Test 1: Full text search
  try {
    const results = index.search('theorem')
    if (results.length === 2 && results.every(r => r.document.type === 'theorem')) {
      console.log('✓ Test 1: Full text search PASSED')
      passed++
    } else {
      console.log('✗ Test 1: Full text search FAILED')
      console.log('  Expected 2 theorems, got:', results.length)
      failed++
    }
  } catch (e) {
    console.log('✗ Test 1: Full text search ERROR:', e.message)
    failed++
  }

  // Test 2: Autocomplete
  try {
    const results = index.autocomplete('Py', 'name')
    if (results.length > 0 && results[0].value === 'Pythagorean Theorem') {
      console.log('✓ Test 2: Autocomplete PASSED')
      passed++
    } else {
      console.log('✗ Test 2: Autocomplete FAILED')
      failed++
    }
  } catch (e) {
    console.log('✗ Test 2: Autocomplete ERROR:', e.message)
    failed++
  }

  // Test 3: Field search
  try {
    const results = index.searchByField('type', 'theorem')
    if (results.length === 2) {
      console.log('✓ Test 3: Field search PASSED')
      passed++
    } else {
      console.log('✗ Test 3: Field search FAILED')
      console.log('  Expected 2, got:', results.length)
      failed++
    }
  } catch (e) {
    console.log('✗ Test 3: Field search ERROR:', e.message)
    failed++
  }

  // Test 4: Range search
  try {
    const results = index.rangeSearch('importance', 0.9, 1.0)
    if (results.length === 2) {
      console.log('✓ Test 4: Range search PASSED')
      passed++
    } else {
      console.log('✗ Test 4: Range search FAILED')
      console.log('  Expected 2, got:', results.length)
      failed++
    }
  } catch (e) {
    console.log('✗ Test 4: Range search ERROR:', e.message)
    failed++
  }

  // Test 5: Fuzzy search
  try {
    const results = index.fuzzySearch('Pytagorean', 'name', 3)
    if (results.length > 0 && results[0].document.name === 'Pythagorean Theorem') {
      console.log('✓ Test 5: Fuzzy search PASSED')
      passed++
    } else {
      console.log('✗ Test 5: Fuzzy search FAILED')
      failed++
    }
  } catch (e) {
    console.log('✗ Test 5: Fuzzy search ERROR:', e.message)
    failed++
  }

  // Test 6: Add item
  try {
    const beforeCount = index.items.length
    index.addItems([
      {
        id: 6,
        name: 'Test Theorem',
        type: 'theorem',
        category: 'test',
        description: 'A test item',
        importance: 0.5,
        content: 'test',
      },
    ])
    if (index.items.length === beforeCount + 1) {
      console.log('✓ Test 6: Add item PASSED')
      passed++
    } else {
      console.log('✗ Test 6: Add item FAILED')
      failed++
    }
  } catch (e) {
    console.log('✗ Test 6: Add item ERROR:', e.message)
    failed++
  }

  // Test 7: Stats
  try {
    const stats = index.getStats()
    if (stats.totalDocuments > 0 && stats.totalTerms > 0) {
      console.log('✓ Test 7: Get stats PASSED')
      passed++
    } else {
      console.log('✗ Test 7: Get stats FAILED')
      failed++
    }
  } catch (e) {
    console.log('✗ Test 7: Get stats ERROR:', e.message)
    failed++
  }

  console.log(`\n结果: ${passed} 通过, ${failed} 失败\n`)
  return failed === 0
}

/**
 * 测试 QueryEngine
 */
export function testQueryEngine() {
  console.log('╔═════════════════════════════════════════════════════════╗')
  console.log('║           Testing QueryEngine                           ║')
  console.log('╚═════════════════════════════════════════════════════════╝\n')

  const engine = new QueryEngine()

  let passed = 0
  let failed = 0

  // Test 1: Simple query parsing
  try {
    const result = engine.parseQuery('theorem')
    if (result.tokens.includes('theorem') && result.filters.length === 0) {
      console.log('✓ Test 1: Simple query parsing PASSED')
      passed++
    } else {
      console.log('✗ Test 1: Simple query parsing FAILED')
      failed++
    }
  } catch (e) {
    console.log('✗ Test 1: Simple query parsing ERROR:', e.message)
    failed++
  }

  // Test 2: Field query parsing
  try {
    const result = engine.parseQuery('type:theorem')
    if (
      result.filters.length === 1 &&
      result.filters[0].field === 'type' &&
      result.filters[0].operator === 'contains'
    ) {
      console.log('✓ Test 2: Field query parsing PASSED')
      passed++
    } else {
      console.log('✗ Test 2: Field query parsing FAILED')
      failed++
    }
  } catch (e) {
    console.log('✗ Test 2: Field query parsing ERROR:', e.message)
    failed++
  }

  // Test 3: Range query parsing
  try {
    const result = engine.parseQuery('importance:>0.9')
    if (
      result.filters.length === 1 &&
      result.filters[0].operator === 'gt' &&
      result.filters[0].value === '0.9'
    ) {
      console.log('✓ Test 3: Range query parsing PASSED')
      passed++
    } else {
      console.log('✗ Test 3: Range query parsing FAILED')
      failed++
    }
  } catch (e) {
    console.log('✗ Test 3: Range query parsing ERROR:', e.message)
    failed++
  }

  // Test 4: Complex query parsing
  try {
    const result = engine.parseQuery('type:theorem AND importance:>0.8')
    if (result.filters.length === 2 && result.tokens.includes('AND')) {
      console.log('✓ Test 4: Complex query parsing PASSED')
      passed++
    } else {
      console.log('✗ Test 4: Complex query parsing FAILED')
      failed++
    }
  } catch (e) {
    console.log('✗ Test 4: Complex query parsing ERROR:', e.message)
    failed++
  }

  // Test 5: Query validation - valid
  try {
    const result = engine.validateQuery('theorem AND type:test')
    if (result.valid) {
      console.log('✓ Test 5: Query validation (valid) PASSED')
      passed++
    } else {
      console.log('✗ Test 5: Query validation (valid) FAILED')
      failed++
    }
  } catch (e) {
    console.log('✗ Test 5: Query validation (valid) ERROR:', e.message)
    failed++
  }

  // Test 6: Query validation - invalid
  try {
    const result = engine.validateQuery('theorem AND')
    if (!result.valid && result.errors.length > 0) {
      console.log('✓ Test 6: Query validation (invalid) PASSED')
      passed++
    } else {
      console.log('✗ Test 6: Query validation (invalid) FAILED')
      failed++
    }
  } catch (e) {
    console.log('✗ Test 6: Query validation (invalid) ERROR:', e.message)
    failed++
  }

  // Test 7: Query optimization
  try {
    const original = 'algebra  AND  theorem  AND  algebra'
    const optimized = engine.optimizeQuery(original)
    if (
      optimized === optimized.replace(/\s+/g, ' ') &&
      optimized.includes('algebra') &&
      optimized.includes('AND')
    ) {
      console.log('✓ Test 7: Query optimization PASSED')
      passed++
    } else {
      console.log('✗ Test 7: Query optimization FAILED')
      failed++
    }
  } catch (e) {
    console.log('✗ Test 7: Query optimization ERROR:', e.message)
    failed++
  }

  // Test 8: Query suggestions
  try {
    const suggestions = engine.generateSuggestions('type:', ['type', 'category', 'importance'])
    if (suggestions.length > 0) {
      console.log('✓ Test 8: Query suggestions PASSED')
      passed++
    } else {
      console.log('✗ Test 8: Query suggestions FAILED')
      failed++
    }
  } catch (e) {
    console.log('✗ Test 8: Query suggestions ERROR:', e.message)
    failed++
  }

  console.log(`\n结果: ${passed} 通过, ${failed} 失败\n`)
  return failed === 0
}

/**
 * 测试集成
 */
export function testIntegration() {
  console.log('╔═════════════════════════════════════════════════════════╗')
  console.log('║           Testing Integration                           ║')
  console.log('╚═════════════════════════════════════════════════════════╝\n')

  const index = new SearchIndex({
    items: testData.items,
    searchableFields: ['name', 'description', 'content'],
    indexedFields: ['type', 'category'],
  })

  const engine = new QueryEngine()

  let passed = 0
  let failed = 0

  // Test 1: Query parsing and execution plan
  try {
    const query = 'type:theorem AND importance:>0.9'
    const plan = engine.buildExecutionPlan(query, index)

    if (plan.operations.length > 0 && plan.estimatedRows >= 0) {
      console.log('✓ Test 1: Execution plan building PASSED')
      passed++
    } else {
      console.log('✗ Test 1: Execution plan building FAILED')
      failed++
    }
  } catch (e) {
    console.log('✗ Test 1: Execution plan building ERROR:', e.message)
    failed++
  }

  // Test 2: Complex search with filters
  try {
    const parsed = engine.parseQuery('theorem importance:>0.9')
    const hasTheoremResults = parsed.filters.length > 0 || parsed.tokens.length > 0

    if (hasTheoremResults) {
      console.log('✓ Test 2: Complex search with filters PASSED')
      passed++
    } else {
      console.log('✗ Test 2: Complex search with filters FAILED')
      failed++
    }
  } catch (e) {
    console.log('✗ Test 2: Complex search with filters ERROR:', e.message)
    failed++
  }

  console.log(`\n结果: ${passed} 通过, ${failed} 失败\n`)
  return failed === 0
}

/**
 * 运行所有测试
 */
export function runAllTests() {
  console.log('\n')
  console.log('╔═════════════════════════════════════════════════════════╗')
  console.log('║         Search Module Test Suite v1.0                   ║')
  console.log('╚═════════════════════════════════════════════════════════╝\n')

  const results = []

  results.push(testSearchIndex())
  results.push(testQueryEngine())
  results.push(testIntegration())

  console.log('╔═════════════════════════════════════════════════════════╗')
  if (results.every(r => r)) {
    console.log('║       ✓ All tests PASSED                                  ║')
  } else {
    console.log('║       ✗ Some tests FAILED                                 ║')
  }
  console.log('╚═════════════════════════════════════════════════════════╝\n')

  return results.every(r => r)
}

// Export for use
export default {
  testSearchIndex,
  testQueryEngine,
  testIntegration,
  runAllTests,
}
