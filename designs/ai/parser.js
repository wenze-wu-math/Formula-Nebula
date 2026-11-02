/**
 * designs/ai/parser.js — Natural Language to Mathematical AST Parser
 *
 * Converts natural language mathematical statements to structured AST
 */

/**
 * Parse natural language statement to AST
 */
export function parseStatement(statement) {
  const tokens = tokenize(statement)
  const ast = {
    type: 'statement',
    quantifiers: extractQuantifiers(tokens),
    predicates: extractPredicates(tokens),
    variables: extractVariables(tokens),
    operators: extractOperators(tokens),
    confidence: 0.85
  }

  return ast
}

/**
 * Convert AST to Lean 4 syntax
 */
export function statementToLean(ast) {
  let lean = ''

  // Add quantifiers
  for (const q of ast.quantifiers || []) {
    if (q.type === 'forall') {
      lean += `∀ ${q.variable} : ${q.domain || 'ℕ'}, `
    } else if (q.type === 'exists') {
      lean += `∃ ${q.variable} : ${q.domain || 'ℕ'}, `
    }
  }

  // Add predicates
  if (ast.predicates && ast.predicates.length > 0) {
    lean += ast.predicates.map(p => p.lean || p.text).join(' ∧ ')
  }

  return lean || 'true'
}

/**
 * Tokenize statement
 */
function tokenize(statement) {
  return statement
    .toLowerCase()
    .replace(/[,.:;]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 0)
}

/**
 * Extract quantifiers
 */
function extractQuantifiers(tokens) {
  const quantifiers = []

  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i] === 'for' && tokens[i + 1] === 'all') {
      quantifiers.push({
        type: 'forall',
        variable: tokens[i + 2] || 'x',
        position: i
      })
    } else if (tokens[i] === 'exists' || tokens[i] === 'there') {
      quantifiers.push({
        type: 'exists',
        variable: tokens[i + 2] || 'x',
        position: i
      })
    }
  }

  return quantifiers
}

/**
 * Extract predicates
 */
function extractPredicates(tokens) {
  const predicates = []

  const predicatePatterns = [
    { pattern: ['is', 'prime'], type: 'prime' },
    { pattern: ['is', 'even'], type: 'even' },
    { pattern: ['is', 'odd'], type: 'odd' },
    { pattern: ['divides'], type: 'divides' },
    { pattern: ['greater', 'than'], type: 'gt' },
    { pattern: ['less', 'than'], type: 'lt' },
    { pattern: ['equal', 'to'], type: 'eq' }
  ]

  for (const { pattern, type } of predicatePatterns) {
    for (let i = 0; i <= tokens.length - pattern.length; i++) {
      const matches = pattern.every((p, j) => tokens[i + j] === p)
      if (matches) {
        predicates.push({ type, text: pattern.join(' '), position: i })
      }
    }
  }

  return predicates
}

/**
 * Extract variables
 */
function extractVariables(tokens) {
  const variables = new Set()

  // Single letter variables
  for (const token of tokens) {
    if (/^[a-z]$/.test(token) && token !== 'a') {
      variables.add(token)
    }
  }

  return Array.from(variables)
}

/**
 * Extract operators
 */
function extractOperators(tokens) {
  const operators = []
  const opMap = {
    '+': 'add',
    '-': 'sub',
    '*': 'mul',
    '/': 'div',
    '=': 'eq',
    '<': 'lt',
    '>': 'gt',
    '≤': 'le',
    '≥': 'ge'
  }

  for (const token of tokens) {
    if (opMap[token]) {
      operators.push({ symbol: token, type: opMap[token] })
    }
  }

  return operators
}
