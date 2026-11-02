/**
 * Tests for formula comparison
 */

import { compareFormulas, findEquivalentFormulas, groupEquivalentFormulas, buildCanonicalIndex } from '../../src/canonicalization/compare.js'

// Test: Compare identical formulas
export function test_compare_identical() {
  const result = compareFormulas('a+b', 'a+b')
  console.assert(result.equivalent === true, 'Identical formulas should be equivalent')
  console.assert(result.similarity === 1.0, 'Similarity should be 1.0')
  return true
}

// Test: Compare commutative equivalents
export function test_compare_commutative() {
  const result = compareFormulas('a+b', 'b+a')
  console.assert(result.equivalent === true, 'a+b should equal b+a')
  console.assert(result.similarity === 1.0, 'Similarity should be 1.0')
  return true
}

// Test: Compare associative equivalents
export function test_compare_associative() {
  const result = compareFormulas('(a+b)+c', 'a+(b+c)')
  console.assert(result.equivalent === true, 'Associative expressions should be equivalent')
  return true
}

// Test: Compare non-equivalent formulas
export function test_compare_different() {
  const result = compareFormulas('a+b', 'a*b')
  console.assert(result.equivalent === false, 'Different operations should not be equivalent')
  console.assert(result.similarity < 1.0, 'Similarity should be less than 1.0')
  return true
}

// Test: Compare power simplifications
export function test_compare_power_simplification() {
  const result = compareFormulas('x^1', 'x')
  console.assert(result.equivalent === true, 'x^1 should equal x')
  return true
}

// Test: Compare fraction simplifications
export function test_compare_fraction_simplification() {
  const result = compareFormulas('\\frac{x}{1}', 'x')
  console.assert(result.equivalent === true, 'x/1 should equal x')
  return true
}

// Test: Find equivalent formulas in collection
export function test_find_equivalent() {
  const target = 'a+b'
  const collection = [
    { id: '1', latex: 'b+a' },
    { id: '2', latex: 'a*b' },
    { id: '3', latex: 'a+b' }
  ]
  const results = findEquivalentFormulas(target, collection)
  console.assert(results.length === 2, 'Should find 2 equivalent formulas')
  console.assert(results[0].equivalent === true, 'First result should be equivalent')
  return true
}

// Test: Group equivalent formulas
export function test_group_equivalent() {
  const formulas = [
    { id: '1', latex: 'a+b' },
    { id: '2', latex: 'b+a' },
    { id: '3', latex: 'x*y' },
    { id: '4', latex: 'y*x' }
  ]
  const groups = groupEquivalentFormulas(formulas)
  console.assert(groups.length === 2, 'Should have 2 groups')
  console.assert(groups[0].length === 2, 'First group should have 2 formulas')
  console.assert(groups[1].length === 2, 'Second group should have 2 formulas')
  return true
}

// Test: Build canonical index
export function test_build_index() {
  const formulas = [
    { id: '1', latex: 'a+b' },
    { id: '2', latex: 'b+a' },
    { id: '3', latex: 'x*y' }
  ]
  const index = buildCanonicalIndex(formulas)
  console.assert(index.size === 2, 'Should have 2 canonical forms')

  // Find the canonical form for a+b
  let foundGroup = false
  for (const [canonical, group] of index.entries()) {
    if (group.length === 2) {
      foundGroup = true
      console.assert(group.some(f => f.id === '1'), 'Group should contain formula 1')
      console.assert(group.some(f => f.id === '2'), 'Group should contain formula 2')
    }
  }
  console.assert(foundGroup, 'Should find group with 2 formulas')
  return true
}

// Test: Similarity score calculation
export function test_similarity_score() {
  const result1 = compareFormulas('a+b', 'a+c')
  const result2 = compareFormulas('a+b', 'x+y')
  console.assert(result1.similarity > result2.similarity, 'a+b more similar to a+c than x+y')
  return true
}

// Test: Complex expression comparison
export function test_complex_comparison() {
  const result = compareFormulas('a+b*c', 'a+c*b')
  console.assert(result.equivalent === true, 'Should handle complex expressions with commutativity')
  return true
}

// Test: Error handling for invalid LaTeX
export function test_error_handling() {
  const result = compareFormulas('\\invalid{syntax', 'a+b')
  console.assert(result.equivalent === false, 'Should return false for parse errors')
  console.assert('error' in result, 'Should have error property')
  return true
}

// Run all tests
export function runAllTests() {
  const tests = [
    test_compare_identical,
    test_compare_commutative,
    test_compare_associative,
    test_compare_different,
    test_compare_power_simplification,
    test_compare_fraction_simplification,
    test_find_equivalent,
    test_group_equivalent,
    test_build_index,
    test_similarity_score,
    test_complex_comparison,
    test_error_handling
  ]

  let passed = 0
  let failed = 0

  for (const test of tests) {
    try {
      const result = test()
      if (result) {
        passed++
        console.log(`✓ ${test.name}`)
      } else {
        failed++
        console.log(`✗ ${test.name}`)
      }
    } catch (error) {
      failed++
      console.log(`✗ ${test.name}: ${error.message}`)
    }
  }

  console.log(`\nResults: ${passed} passed, ${failed} failed`)
  return failed === 0
}
