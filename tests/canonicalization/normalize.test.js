/**
 * Tests for formula normalization
 */

import { parseLatex, normalize, toCanonicalLatex, compareNodes } from '../../src/canonicalization/normalize.js'

// Test: Parse simple numbers
export function test_parse_numbers() {
  const ast = parseLatex('42')
  console.assert(ast.type === 'number', 'Should parse number')
  console.assert(ast.value === 42, 'Should have correct value')
  return true
}

// Test: Parse variables
export function test_parse_variables() {
  const ast = parseLatex('x')
  console.assert(ast.type === 'variable', 'Should parse variable')
  console.assert(ast.name === 'x', 'Should have correct name')
  return true
}

// Test: Parse Greek letters
export function test_parse_greek() {
  const ast = parseLatex('\\alpha')
  console.assert(ast.type === 'variable', 'Should parse Greek letter as variable')
  console.assert(ast.name === '\\alpha', 'Should preserve LaTeX name')
  return true
}

// Test: Parse addition
export function test_parse_addition() {
  const ast = parseLatex('a+b')
  console.assert(ast.type === 'binary_op', 'Should parse binary operation')
  console.assert(ast.operator === '+', 'Should have + operator')
  console.assert(ast.left.name === 'a', 'Left operand correct')
  console.assert(ast.right.name === 'b', 'Right operand correct')
  return true
}

// Test: Parse multiplication
export function test_parse_multiplication() {
  const ast = parseLatex('a*b')
  console.assert(ast.type === 'binary_op', 'Should parse multiplication')
  console.assert(ast.operator === '*', 'Should have * operator')
  return true
}

// Test: Parse power
export function test_parse_power() {
  const ast = parseLatex('x^2')
  console.assert(ast.type === 'power', 'Should parse power')
  console.assert(ast.base.name === 'x', 'Base correct')
  console.assert(ast.exponent.value === 2, 'Exponent correct')
  return true
}

// Test: Parse fraction
export function test_parse_fraction() {
  const ast = parseLatex('\\frac{a}{b}')
  console.assert(ast.type === 'fraction', 'Should parse fraction')
  console.assert(ast.numerator.name === 'a', 'Numerator correct')
  console.assert(ast.denominator.name === 'b', 'Denominator correct')
  return true
}

// Test: Parse complex expression
export function test_parse_complex() {
  const ast = parseLatex('a+b*c')
  console.assert(ast.type === 'binary_op', 'Root is binary op')
  console.assert(ast.operator === '+', 'Root operator is +')
  console.assert(ast.right.operator === '*', 'Right side is multiplication')
  return true
}

// Test: Commutativity normalization
export function test_commutative_normalization() {
  const ast1 = parseLatex('a+b')
  const ast2 = parseLatex('b+a')
  const norm1 = normalize(ast1)
  const norm2 = normalize(ast2)
  const canonical1 = toCanonicalLatex(norm1)
  const canonical2 = toCanonicalLatex(norm2)
  console.assert(canonical1 === canonical2, 'a+b should equal b+a')
  return true
}

// Test: Associativity normalization
export function test_associative_normalization() {
  const ast1 = parseLatex('(a+b)+c')
  const ast2 = parseLatex('a+(b+c)')
  const norm1 = normalize(ast1)
  const norm2 = normalize(ast2)
  const canonical1 = toCanonicalLatex(norm1)
  const canonical2 = toCanonicalLatex(norm2)
  console.assert(canonical1 === canonical2, '(a+b)+c should equal a+(b+c)')
  return true
}

// Test: Power of 1 normalization
export function test_power_one_normalization() {
  const ast = parseLatex('x^1')
  const norm = normalize(ast)
  console.assert(norm.type === 'variable', 'x^1 should normalize to x')
  console.assert(norm.name === 'x', 'Should be variable x')
  return true
}

// Test: Power of 0 normalization
export function test_power_zero_normalization() {
  const ast = parseLatex('x^0')
  const norm = normalize(ast)
  console.assert(norm.type === 'number', 'x^0 should normalize to number')
  console.assert(norm.value === 1, 'x^0 should be 1')
  return true
}

// Test: Fraction with denominator 1
export function test_fraction_one_normalization() {
  const ast = parseLatex('\\frac{x}{1}')
  const norm = normalize(ast)
  console.assert(norm.type === 'variable', 'x/1 should normalize to x')
  return true
}

// Test: Multiple terms with commutativity
export function test_multiple_commutative() {
  const ast1 = parseLatex('a+b+c')
  const ast2 = parseLatex('c+a+b')
  const norm1 = normalize(ast1)
  const norm2 = normalize(ast2)
  const canonical1 = toCanonicalLatex(norm1)
  const canonical2 = toCanonicalLatex(norm2)
  console.assert(canonical1 === canonical2, 'a+b+c should equal c+a+b')
  return true
}

// Test: compareNodes function
export function test_compare_nodes() {
  const node1 = { type: 'number', value: 1 }
  const node2 = { type: 'number', value: 2 }
  const node3 = { type: 'variable', name: 'x' }
  console.assert(compareNodes(node1, node2) < 0, '1 < 2')
  console.assert(compareNodes(node2, node1) > 0, '2 > 1')
  console.assert(compareNodes(node1, node1) === 0, '1 === 1')
  console.assert(compareNodes(node1, node3) < 0, 'number < variable in type order')
  return true
}

// Test: Canonical LaTeX output
export function test_canonical_latex() {
  const ast = parseLatex('a+b')
  const norm = normalize(ast)
  const latex = toCanonicalLatex(norm)
  console.assert(latex.includes('a'), 'Contains a')
  console.assert(latex.includes('b'), 'Contains b')
  console.assert(latex.includes('+'), 'Contains +')
  return true
}

// Run all tests
export function runAllTests() {
  const tests = [
    test_parse_numbers,
    test_parse_variables,
    test_parse_greek,
    test_parse_addition,
    test_parse_multiplication,
    test_parse_power,
    test_parse_fraction,
    test_parse_complex,
    test_commutative_normalization,
    test_associative_normalization,
    test_power_one_normalization,
    test_power_zero_normalization,
    test_fraction_one_normalization,
    test_multiple_commutative,
    test_compare_nodes,
    test_canonical_latex
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
