/**
 * Interactive demo of formula canonicalization
 */

import { parseLatex, normalize, toCanonicalLatex } from './normalize.js'
import { compareFormulas, findEquivalentFormulas } from './compare.js'

console.log('='.repeat(70))
console.log('  Formula Canonicalization System - Interactive Demo')
console.log('='.repeat(70))
console.log()

// Demo 1: Basic parsing and normalization
console.log('1. BASIC PARSING AND NORMALIZATION')
console.log('-'.repeat(70))

const examples = [
  'a+b',
  'b+a',
  'x^2',
  '\\frac{a}{b}',
  '(a+b)+c',
  'a+(b+c)',
  'x^1',
  'x^0',
  '\\alpha+\\beta'
]

for (const latex of examples) {
  const ast = parseLatex(latex)
  const normalized = normalize(ast)
  const canonical = toCanonicalLatex(normalized)
  console.log(`  Input:     ${latex}`)
  console.log(`  Canonical: ${canonical}`)
  console.log()
}

// Demo 2: Equivalence detection
console.log()
console.log('2. EQUIVALENCE DETECTION')
console.log('-'.repeat(70))

const pairs = [
  ['a+b', 'b+a'],
  ['(a+b)+c', 'a+(b+c)'],
  ['a*b', 'b*a'],
  ['x^1', 'x'],
  ['x^0', '1'],
  ['\\frac{x}{1}', 'x'],
  ['a+b', 'a*b']
]

for (const [f1, f2] of pairs) {
  const result = compareFormulas(f1, f2)
  const status = result.equivalent ? '✓ EQUIVALENT' : '✗ DIFFERENT'
  console.log(`  ${f1}  vs  ${f2}`)
  console.log(`    ${status} (similarity: ${result.similarity.toFixed(2)})`)
  console.log(`    Canonical 1: ${result.canonical1}`)
  console.log(`    Canonical 2: ${result.canonical2}`)
  console.log()
}

// Demo 3: Commutativity with multiple terms
console.log()
console.log('3. COMMUTATIVITY WITH MULTIPLE TERMS')
console.log('-'.repeat(70))

const multiTerm = [
  'a+b+c',
  'c+b+a',
  'b+a+c',
  'c+a+b'
]

console.log('  All of these should have the same canonical form:')
console.log()

for (const latex of multiTerm) {
  const ast = parseLatex(latex)
  const normalized = normalize(ast)
  const canonical = toCanonicalLatex(normalized)
  console.log(`  ${latex.padEnd(15)} → ${canonical}`)
}

// Demo 4: Complex expressions
console.log()
console.log()
console.log('4. COMPLEX EXPRESSIONS')
console.log('-'.repeat(70))

const complexPairs = [
  ['a+b*c', 'b*c+a'],
  ['(a+b)*c', 'c*(a+b)'],
  ['a^2+b^2', 'b^2+a^2'],
  ['\\frac{a+b}{c}', '\\frac{b+a}{c}']
]

for (const [f1, f2] of complexPairs) {
  const result = compareFormulas(f1, f2)
  const status = result.equivalent ? '✓ EQUIVALENT' : '✗ DIFFERENT'
  console.log(`  ${f1}  vs  ${f2}`)
  console.log(`    ${status}`)
  console.log()
}

// Demo 5: Finding equivalent formulas in a collection
console.log()
console.log('5. FINDING EQUIVALENT FORMULAS IN COLLECTION')
console.log('-'.repeat(70))

const target = 'a+b'
const collection = [
  { id: 'formula1', latex: 'b+a' },
  { id: 'formula2', latex: 'a*b' },
  { id: 'formula3', latex: 'a+b' },
  { id: 'formula4', latex: 'x+y' },
  { id: 'formula5', latex: 'b+a+0' }
]

console.log(`  Target formula: ${target}`)
console.log(`  Searching in ${collection.length} formulas...`)
console.log()

const matches = findEquivalentFormulas(target, collection, 0.90)

console.log(`  Found ${matches.length} matches:`)
for (const match of matches) {
  console.log(`    - ${match.id}: ${match.latex}`)
  console.log(`      Similarity: ${match.similarity.toFixed(2)}, Equivalent: ${match.equivalent}`)
}

// Demo 6: Algebraic Identities
console.log()
console.log()
console.log('6. ALGEBRAIC IDENTITIES')
console.log('-'.repeat(70))
console.log('  Note: Current system handles structural equivalence only.')
console.log('  Algebraic identities like (a+b)² = a²+2ab+b² are NOT detected.')
console.log()

const identities = [
  ['a+a', '2*a'],
  ['a-a', '0'],
  ['a*0', '0'],
  ['a*1', 'a']
]

for (const [f1, f2] of identities) {
  const result = compareFormulas(f1, f2)
  const status = result.equivalent ? '✓ DETECTED' : '✗ NOT DETECTED'
  console.log(`  ${f1}  =  ${f2}: ${status}`)
}

console.log()
console.log('='.repeat(70))
console.log('Demo complete! Check README.md for API documentation.')
console.log('='.repeat(70))
