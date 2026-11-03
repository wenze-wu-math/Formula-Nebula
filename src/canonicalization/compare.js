/**
 * Formula Comparison System
 * Compare formulas for semantic equivalence
 */

import { parseLatex, normalize, toCanonicalLatex, compareNodes } from './normalize.js'

/**
 * Compare two LaTeX formulas for semantic equivalence
 * @param {string} latex1 - First formula
 * @param {string} latex2 - Second formula
 * @returns {object} Comparison result
 */
export function compareFormulas(latex1, latex2) {
  try {
    const ast1 = parseLatex(latex1)
    const ast2 = parseLatex(latex2)

    // A failed parse yields a null AST. This guard keeps that distinguishable
    // from a genuine "not equivalent" result.
    if (!ast1 || !ast2) {
      return {
        equivalent: false,
        error: `could not parse ${!ast1 ? 'left' : 'right'}-hand formula`,
        similarity: 0
      }
    }

    const norm1 = normalize(ast1)
    const norm2 = normalize(ast2)

    const canonical1 = toCanonicalLatex(norm1)
    const canonical2 = toCanonicalLatex(norm2)

    const areEquivalent = canonical1 === canonical2

    return {
      equivalent: areEquivalent,
      canonical1,
      canonical2,
      ast1: norm1,
      ast2: norm2,
      similarity: areEquivalent ? 1.0 : computeSimilarity(norm1, norm2)
    }
  } catch (error) {
    return {
      equivalent: false,
      error: error.message,
      similarity: 0
    }
  }
}

/**
 * Compute structural similarity between two AST nodes
 * @param {object} node1 - First AST node
 * @param {object} node2 - Second AST node
 * @returns {number} Similarity score [0, 1]
 */
function computeSimilarity(node1, node2) {
  if (!node1 || !node2) return 0
  if (node1.type !== node2.type) return 0.2

  switch (node1.type) {
    case 'number':
      return node1.value === node2.value ? 1.0 : 0.5

    case 'variable':
      return node1.name === node2.name ? 1.0 : 0.3

    case 'binary_op':
      if (node1.operator !== node2.operator) return 0.4
      const leftSim = computeSimilarity(node1.left, node2.left)
      const rightSim = computeSimilarity(node1.right, node2.right)
      return 0.3 + 0.35 * leftSim + 0.35 * rightSim

    case 'power':
      const baseSim = computeSimilarity(node1.base, node2.base)
      const expSim = computeSimilarity(node1.exponent, node2.exponent)
      return 0.3 + 0.4 * baseSim + 0.3 * expSim

    case 'fraction':
      const numSim = computeSimilarity(node1.numerator, node2.numerator)
      const denSim = computeSimilarity(node1.denominator, node2.denominator)
      return 0.3 + 0.35 * numSim + 0.35 * denSim

    default:
      return 0.5
  }
}

/**
 * Find semantically equivalent formulas in a collection
 * @param {string} targetFormula - Formula to match
 * @param {Array<{id: string, latex: string}>} formulas - Collection of formulas
 * @param {number} threshold - Minimum similarity threshold (default 0.95)
 * @returns {Array} Matches with similarity scores
 */
export function findEquivalentFormulas(targetFormula, formulas, threshold = 0.95) {
  const results = []

  for (const formula of formulas) {
    const comparison = compareFormulas(targetFormula, formula.latex)
    if (comparison.similarity >= threshold) {
      results.push({
        id: formula.id,
        latex: formula.latex,
        canonical: comparison.canonical2,
        similarity: comparison.similarity,
        equivalent: comparison.equivalent
      })
    }
  }

  // Sort by similarity (descending)
  results.sort((a, b) => b.similarity - a.similarity)

  return results
}

/**
 * Group formulas by semantic equivalence
 * @param {Array<{id: string, latex: string}>} formulas
 * @returns {Array<Array>} Groups of equivalent formulas
 */
export function groupEquivalentFormulas(formulas) {
  const groups = []
  const processed = new Set()

  for (let i = 0; i < formulas.length; i++) {
    if (processed.has(i)) continue

    const group = [formulas[i]]
    processed.add(i)

    for (let j = i + 1; j < formulas.length; j++) {
      if (processed.has(j)) continue

      const comparison = compareFormulas(formulas[i].latex, formulas[j].latex)
      if (comparison.equivalent) {
        group.push(formulas[j])
        processed.add(j)
      }
    }

    groups.push(group)
  }

  return groups
}

/**
 * Check if a formula matches any canonical form in a set
 * @param {string} latex - Formula to check
 * @param {Set<string>} canonicalForms - Set of canonical forms
 * @returns {boolean}
 */
export function matchesCanonicalSet(latex, canonicalForms) {
  try {
    const ast = parseLatex(latex)
    const normalized = normalize(ast)
    const canonical = toCanonicalLatex(normalized)
    return canonicalForms.has(canonical)
  } catch {
    return false
  }
}

/**
 * Build canonical form index for fast lookup
 * @param {Array<{id: string, latex: string}>} formulas
 * @returns {Map<string, Array>} Map from canonical form to formula list
 */
export function buildCanonicalIndex(formulas) {
  const index = new Map()

  for (const formula of formulas) {
    try {
      const ast = parseLatex(formula.latex)
      const normalized = normalize(ast)
      const canonical = toCanonicalLatex(normalized)

      if (!index.has(canonical)) {
        index.set(canonical, [])
      }
      index.get(canonical).push(formula)
    } catch (error) {
      // Skip formulas that can't be parsed
      console.warn(`Failed to parse formula ${formula.id}:`, error.message)
    }
  }

  return index
}
