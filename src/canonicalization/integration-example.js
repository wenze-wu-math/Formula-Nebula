/**
 * Integration Example: Using Canonicalization with Knowledge Graph
 *
 * This shows how to detect duplicate/equivalent theorems in the
 * Formula Nebula knowledge graph.
 */

import { compareFormulas, groupEquivalentFormulas, buildCanonicalIndex } from './compare.js'

/**
 * Example 1: Find duplicate theorems in knowledge graph
 */
export function findDuplicateTheorems(nodes) {
  console.log('Analyzing knowledge graph for duplicate theorems...\n')

  const formulas = nodes.map(node => ({
    id: node.id,
    latex: node.latex,
    name: node.name
  }))

  const groups = groupEquivalentFormulas(formulas)

  // Find groups with duplicates
  const duplicates = groups.filter(g => g.length > 1)

  if (duplicates.length === 0) {
    console.log('✓ No duplicates found')
    return []
  }

  console.log(`Found ${duplicates.length} groups of equivalent theorems:\n`)

  for (const group of duplicates) {
    console.log('Equivalent group:')
    for (const theorem of group) {
      console.log(`  - ${theorem.id}: ${theorem.name}`)
      console.log(`    ${theorem.latex}`)
    }
    console.log()
  }

  return duplicates
}

/**
 * Example 2: Check if a new theorem already exists
 */
export function checkTheoremExists(newTheorem, existingNodes) {
  const canonicalIndex = buildCanonicalIndex(existingNodes.map(n => ({
    id: n.id,
    latex: n.latex,
    name: n.name
  })))

  const comparison = compareFormulas(newTheorem.latex, existingNodes[0].latex)

  // Check against all existing theorems
  for (const [canonical, theorems] of canonicalIndex.entries()) {
    for (const theorem of theorems) {
      const result = compareFormulas(newTheorem.latex, theorem.latex)
      if (result.equivalent) {
        return {
          exists: true,
          existing: theorem,
          canonical: result.canonical1
        }
      }
    }
  }

  return {
    exists: false,
    canonical: comparison.canonical1
  }
}

/**
 * Example 3: Find related theorems by similarity
 */
export function findRelatedTheorems(targetLat ex, nodes, similarityThreshold = 0.7) {
  const results = []

  for (const node of nodes) {
    const comparison = compareFormulas(targetLatex, node.latex)
    if (comparison.similarity >= similarityThreshold) {
      results.push({
        id: node.id,
        name: node.name,
        latex: node.latex,
        similarity: comparison.similarity,
        equivalent: comparison.equivalent
      })
    }
  }

  results.sort((a, b) => b.similarity - a.similarity)

  return results
}

/**
 * Example 4: Build searchable index
 */
export function buildSearchableIndex(nodes) {
  console.log('Building canonical form index...\n')

  const canonicalIndex = buildCanonicalIndex(nodes.map(n => ({
    id: n.id,
    latex: n.latex,
    name: n.name,
    family: n.family,
    importance: n.importance
  })))

  console.log(`Index built with ${canonicalIndex.size} unique canonical forms`)
  console.log(`Covering ${nodes.length} theorems\n`)

  // Statistics
  const groupSizes = Array.from(canonicalIndex.values()).map(g => g.length)
  const maxGroupSize = Math.max(...groupSizes)
  const avgGroupSize = groupSizes.reduce((a, b) => a + b, 0) / groupSizes.length

  console.log('Statistics:')
  console.log(`  - Unique canonical forms: ${canonicalIndex.size}`)
  console.log(`  - Largest equivalence class: ${maxGroupSize} theorems`)
  console.log(`  - Average group size: ${avgGroupSize.toFixed(2)}`)

  return canonicalIndex
}

/**
 * Example 5: Validate theorem consistency
 */
export function validateTheoremConsistency(nodes) {
  console.log('Validating theorem consistency...\n')

  const issues = []

  // Check for parse errors
  for (const node of nodes) {
    try {
      const ast = parseLatex(node.latex)
      if (!ast) {
        issues.push({
          type: 'parse_error',
          id: node.id,
          name: node.name,
          latex: node.latex
        })
      }
    } catch (error) {
      issues.push({
        type: 'parse_exception',
        id: node.id,
        name: node.name,
        latex: node.latex,
        error: error.message
      })
    }
  }

  // Check for suspicious duplicates (same canonical form, different names)
  const groups = groupEquivalentFormulas(nodes.map(n => ({
    id: n.id,
    latex: n.latex,
    name: n.name
  })))

  for (const group of groups) {
    if (group.length > 1) {
      const names = new Set(group.map(t => t.name))
      if (names.size > 1) {
        issues.push({
          type: 'naming_inconsistency',
          group: group.map(t => ({ id: t.id, name: t.name }))
        })
      }
    }
  }

  if (issues.length === 0) {
    console.log('✓ All theorems are consistent')
  } else {
    console.log(`Found ${issues.length} issues:\n`)
    for (const issue of issues) {
      console.log(`- ${issue.type}: ${JSON.stringify(issue, null, 2)}`)
    }
  }

  return issues
}

/**
 * Example usage with mock data
 */
export function demonstrationRun() {
  const mockNodes = [
    {
      id: 'pythagoras-1',
      latex: 'a^2+b^2=c^2',
      name: 'Pythagorean Theorem',
      family: 'geometry',
      importance: 0.95
    },
    {
      id: 'pythagoras-2',
      latex: 'c^2=b^2+a^2',
      name: 'Pythagorean Theorem (alt)',
      family: 'geometry',
      importance: 0.95
    },
    {
      id: 'commutative-add',
      latex: 'a+b=b+a',
      name: 'Addition Commutativity',
      family: 'algebra',
      importance: 0.80
    },
    {
      id: 'commutative-mult',
      latex: 'a*b=b*a',
      name: 'Multiplication Commutativity',
      family: 'algebra',
      importance: 0.80
    }
  ]

  console.log('='.repeat(60))
  console.log('Canonicalization Integration Demo')
  console.log('='.repeat(60))
  console.log()

  // Demo 1: Find duplicates
  console.log('--- Demo 1: Find Duplicates ---\n')
  findDuplicateTheorems(mockNodes)

  // Demo 2: Check new theorem
  console.log('--- Demo 2: Check New Theorem ---\n')
  const newTheorem = {
    id: 'new-pythagoras',
    latex: 'a^2+b^2=c^2',
    name: 'Pythagorean Theorem (new)'
  }
  const exists = checkTheoremExists(newTheorem, mockNodes)
  if (exists.exists) {
    console.log(`Theorem already exists as: ${exists.existing.id}`)
  } else {
    console.log('Theorem is new')
  }
  console.log()

  // Demo 3: Find related
  console.log('--- Demo 3: Find Related Theorems ---\n')
  const related = findRelatedTheorems('x^2+y^2=z^2', mockNodes)
  console.log('Related theorems:')
  for (const r of related) {
    console.log(`  - ${r.name}: similarity ${r.similarity.toFixed(2)}`)
  }
  console.log()

  // Demo 4: Build index
  console.log('--- Demo 4: Build Index ---\n')
  buildSearchableIndex(mockNodes)
  console.log()

  // Demo 5: Validate
  console.log('--- Demo 5: Validate Consistency ---\n')
  validateTheoremConsistency(mockNodes)
  console.log()

  console.log('='.repeat(60))
  console.log('Demo complete')
  console.log('='.repeat(60))
}

// Uncomment to run demonstration
// demonstrationRun()
