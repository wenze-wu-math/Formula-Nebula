/**
 * Formula Normalization System
 *
 * Parses LaTeX expressions into a canonical abstract syntax tree (AST) representation
 * for semantic comparison and equivalence checking.
 *
 * Key features:
 * - Tokenization of LaTeX input
 * - Recursive descent parsing with precedence handling
 * - AST normalization including associativity and commutativity rules
 * - Canonical form generation for deterministic comparison
 *
 * @module canonicalization/normalize
 */

/**
 * Abstract Syntax Tree node types
 * @type {Object.<string, string>}
 * @constant
 */
export const NodeType = {
  NUMBER: 'number',           // Numeric literal (e.g., 3.14)
  VARIABLE: 'variable',       // Variable or symbol (e.g., x, alpha)
  BINARY_OP: 'binary_op',     // Binary operation (e.g., +, *, \cdot)
  UNARY_OP: 'unary_op',       // Unary operation (e.g., -, \sqrt)
  FUNCTION: 'function',       // Function application
  FRACTION: 'fraction',       // Fraction (\frac)
  POWER: 'power',             // Exponentiation (^)
  SQRT: 'sqrt',               // Square root (\sqrt)
  RELATION: 'relation',       // Relations (=, <, >)
  PAREN: 'paren',             // Parenthesized expression
  TEXT: 'text'                // Raw text/command
}

/**
 * Operators that satisfy the commutative property: a⊕b = b⊕a
 * @type {Set<string>}
 * @private
 */
const COMMUTATIVE_OPS = new Set(['+', '\\cdot', '\\times', '\\cap', '\\cup'])

/**
 * Operators that satisfy the associative property: (a⊕b)⊕c = a⊕(b⊕c)
 * @type {Set<string>}
 * @private
 */
const ASSOCIATIVE_OPS = new Set(['+', '\\cdot', '\\times', '\\cap', '\\cup'])

/**
 * Parse LaTeX expression into an abstract syntax tree
 *
 * @param {string} latex - LaTeX expression to parse
 * @returns {Object|null} Root node of the AST, or null if parsing fails
 *
 * @example
 * const ast = parseLatex('x^2 + 2x + 1')
 * // Returns AST representing the quadratic expression
 */
export function parseLatex(latex) {
  const tokens = tokenize(latex)
  const ast = parseExpression(tokens, 0)
  return ast.node
}

/**
 * Tokenize LaTeX expression into a stream of tokens
 *
 * Recognizes:
 * - LaTeX commands (\frac, \alpha, etc.)
 * - Numeric literals (including decimals)
 * - Variables and identifiers
 * - Operators and delimiters
 * - Whitespace (ignored)
 *
 * @param {string} latex - Input LaTeX string
 * @returns {Array<Object>} Array of token objects with {type, value}
 * @private
 */
function tokenize(latex) {
  const tokens = []
  let i = 0
  while (i < latex.length) {
    // Skip whitespace
    if (/\s/.test(latex[i])) { i++; continue }

    // LaTeX command (\frac, \alpha, etc.)
    if (latex[i] === '\\') {
      let j = i + 1
      while (j < latex.length && /[a-zA-Z]/.test(latex[j])) j++
      tokens.push({ type: 'command', value: latex.slice(i, j) })
      i = j
    }
    // Numeric literal (with optional decimal point)
    else if (/\d/.test(latex[i])) {
      let j = i
      while (j < latex.length && /[\d.]/.test(latex[j])) j++
      tokens.push({ type: 'number', value: latex.slice(i, j) })
      i = j
    }
    // Variable (single letter)
    else if (/[a-zA-Z]/.test(latex[i])) {
      tokens.push({ type: 'variable', value: latex[i] })
      i++
    }
    // Operators and delimiters
    else if ('+-*/=<>()[]{}|^_'.includes(latex[i])) {
      tokens.push({ type: 'symbol', value: latex[i] })
      i++
    }
    // Unknown character - skip
    else {
      i++
    }
  }
  return tokens
}

/**
 * Parse expression with relation operators (=, <, >)
 * Lowest precedence level
 *
 * @param {Array<Object>} t - Token stream
 * @param {number} p - Current position in token stream
 * @returns {Object} {node: AST node, pos: updated position}
 * @private
 */
function parseRelation(t, p) {
  let l = parseAdditive(t, p)
  p = l.pos
  while (p < t.length && t[p].type === 'symbol' && '=<>'.includes(t[p].value)) {
    const op = t[p++].value
    const r = parseAdditive(t, p)
    l = { node: { type: NodeType.RELATION, operator: op, left: l.node, right: r.node }, pos: r.pos }
  }
  return l
}

/**
 * Parse additive expressions (+ and -)
 * Second-lowest precedence level
 *
 * @param {Array<Object>} t - Token stream
 * @param {number} p - Current position in token stream
 * @returns {Object} {node: AST node, pos: updated position}
 * @private
 */
function parseAdditive(t, p) {
  let l = parseMultiplicative(t, p)
  p = l.pos
  while (p < t.length && t[p].type === 'symbol' && '+-'.includes(t[p].value)) {
    const op = t[p++].value
    const r = parseMultiplicative(t, p)
    l = { node: { type: NodeType.BINARY_OP, operator: op, left: l.node, right: r.node }, pos: r.pos }
  }
  return l
}

/**
 * Parse multiplicative expressions (* and / and \cdot)
 * Higher precedence than addition
 *
 * @param {Array<Object>} t - Token stream
 * @param {number} p - Current position in token stream
 * @returns {Object} {node: AST node, pos: updated position}
 * @private
 */
function parseMultiplicative(t, p) {
  let l = parsePower(t, p)
  p = l.pos
  while (p < t.length) {
    if (t[p].type === 'symbol' && '*/'.includes(t[p].value)) {
      const op = t[p++].value
      const r = parsePower(t, p)
      l = { node: { type: NodeType.BINARY_OP, operator: op, left: l.node, right: r.node }, pos: r.pos }
    } else if (t[p].type === 'command' && ['\\cdot', '\\times'].includes(t[p].value)) {
      const op = t[p++].value
      const r = parsePower(t, p)
      l = { node: { type: NodeType.BINARY_OP, operator: op, left: l.node, right: r.node }, pos: r.pos }
    } else break
  }
  return l
}

/**
 * Parse exponentiation (^)
 * Right-associative: a^b^c = a^(b^c)
 * Higher precedence than multiplication
 *
 * @param {Array<Object>} t - Token stream
 * @param {number} p - Current position in token stream
 * @returns {Object} {node: AST node, pos: updated position}
 * @private
 */
function parsePower(t, p) {
  let base = parsePrimary(t, p)
  p = base.pos
  if (p < t.length && t[p].type === 'symbol' && t[p].value === '^') {
    p++
    const exp = parsePower(t, p) // Right-associative recursion
    return { node: { type: NodeType.POWER, base: base.node, exponent: exp.node }, pos: exp.pos }
  }
  return base
}

/**
 * Parse primary expressions (atoms and compounds)
 *
 * Handles:
 * - Numeric literals (integers and decimals)
 * - Variables and Greek letters
 * - Parenthesized expressions
 * - LaTeX commands (\frac, Greek letters, etc.)
 * - Braced groups
 *
 * @param {Array<Object>} t - Token stream
 * @param {number} p - Current position in token stream
 * @returns {Object} {node: AST node or null, pos: updated position}
 * @private
 */
function parsePrimary(t, p) {
  if (p >= t.length) return { node: null, pos: p }

  const tok = t[p]

  // Numeric literal
  if (tok.type === 'number') {
    return { node: { type: NodeType.NUMBER, value: parseFloat(tok.value) }, pos: p + 1 }
  }

  // Variable identifier
  if (tok.type === 'variable') {
    return { node: { type: NodeType.VARIABLE, name: tok.value }, pos: p + 1 }
  }

  // Parenthesized expression
  if (tok.type === 'symbol' && tok.value === '(') {
    p++
    const inner = parseExpression(t, p)
    p = inner.pos
    if (p < t.length && t[p].value === ')') p++
    return { node: { type: NodeType.PAREN, inner: inner.node }, pos: p }
  }

  // LaTeX command
  if (tok.type === 'command') {
    return parseCommand(t, p)
  }

  // Braced group { ... }
  if (tok.type === 'symbol' && tok.value === '{') {
    p++
    const inner = parseExpression(t, p)
    p = inner.pos
    if (p < t.length && t[p].value === '}') p++
    return inner
  }

  return { node: null, pos: p }
}

function parseCommand(t, p) {
  const cmd = t[p].value
  if (cmd === '\\frac') {
    p++
    if (p < t.length && t[p].value === '{') {
      p++
      const num = parseExpression(t, p)
      p = num.pos
      if (p < t.length && t[p].value === '}') p++
      if (p < t.length && t[p].value === '{') {
        p++
        const den = parseExpression(t, p)
        p = den.pos
        if (p < t.length && t[p].value === '}') p++
        return { node: { type: NodeType.FRACTION, numerator: num.node, denominator: den.node }, pos: p }
      }
    }
  }
  const greekLetters = ['\\alpha', '\\beta', '\\gamma', '\\delta', '\\pi', '\\theta', '\\sigma', '\\phi', '\\omega']
  if (greekLetters.includes(cmd)) return { node: { type: NodeType.VARIABLE, name: cmd }, pos: p + 1 }
  return { node: { type: NodeType.TEXT, value: cmd }, pos: p + 1 }
}

// PLACEHOLDER_3

export function normalize(node) {
  if (!node) return null
  switch (node.type) {
    case NodeType.NUMBER:
    case NodeType.VARIABLE:
    case NodeType.TEXT:
      return node
    case NodeType.BINARY_OP:
      return normalizeBinaryOp(node)
    case NodeType.POWER:
      return normalizePower(node)
    case NodeType.FRACTION:
      return normalizeFraction(node)
    case NodeType.PAREN:
      return normalize(node.inner)
    case NodeType.RELATION:
      return {
        type: NodeType.RELATION,
        operator: node.operator,
        left: normalize(node.left),
        right: normalize(node.right)
      }
    default:
      return node
  }
}

function normalizeBinaryOp(node) {
  const left = normalize(node.left)
  const right = normalize(node.right)
  const op = node.operator
  if (ASSOCIATIVE_OPS.has(op)) {
    const operands = flattenAssociative(node, op).map(normalize)
    if (COMMUTATIVE_OPS.has(op)) operands.sort(compareNodes)
    return reconstructBinaryOp(operands, op)
  }
  return { type: NodeType.BINARY_OP, operator: op, left, right }
}

function flattenAssociative(node, targetOp) {
  if (node.type !== NodeType.BINARY_OP || node.operator !== targetOp) return [node]
  return [...flattenAssociative(node.left, targetOp), ...flattenAssociative(node.right, targetOp)]
}

function reconstructBinaryOp(operands, op) {
  if (operands.length === 0) return null
  if (operands.length === 1) return operands[0]
  let result = operands[0]
  for (let i = 1; i < operands.length; i++) {
    result = { type: NodeType.BINARY_OP, operator: op, left: result, right: operands[i] }
  }
  return result
}

function normalizePower(node) {
  const base = normalize(node.base)
  const exponent = normalize(node.exponent)
  if (exponent.type === NodeType.NUMBER && exponent.value === 1) return base
  if (exponent.type === NodeType.NUMBER && exponent.value === 0) return { type: NodeType.NUMBER, value: 1 }
  return { type: NodeType.POWER, base, exponent }
}

function normalizeFraction(node) {
  const numerator = normalize(node.numerator)
  const denominator = normalize(node.denominator)
  if (denominator.type === NodeType.NUMBER && denominator.value === 1) return numerator
  return { type: NodeType.FRACTION, numerator, denominator }
}

// PLACEHOLDER_4

export function compareNodes(a, b) {
  if (!a && !b) return 0
  if (!a) return -1
  if (!b) return 1
  const typeOrder = [NodeType.NUMBER, NodeType.VARIABLE, NodeType.FUNCTION, NodeType.BINARY_OP, NodeType.POWER, NodeType.FRACTION]
  const aIdx = typeOrder.indexOf(a.type)
  const bIdx = typeOrder.indexOf(b.type)
  if (aIdx !== bIdx) return aIdx - bIdx
  switch (a.type) {
    case NodeType.NUMBER:
      return a.value - b.value
    case NodeType.VARIABLE:
      return a.name.localeCompare(b.name)
    case NodeType.BINARY_OP:
      const opCmp = a.operator.localeCompare(b.operator)
      if (opCmp !== 0) return opCmp
      const leftCmp = compareNodes(a.left, b.left)
      if (leftCmp !== 0) return leftCmp
      return compareNodes(a.right, b.right)
    case NodeType.POWER:
      const baseCmp = compareNodes(a.base, b.base)
      if (baseCmp !== 0) return baseCmp
      return compareNodes(a.exponent, b.exponent)
    case NodeType.FRACTION:
      const numCmp = compareNodes(a.numerator, b.numerator)
      if (numCmp !== 0) return numCmp
      return compareNodes(a.denominator, b.denominator)
    default:
      return 0
  }
}

export function toCanonicalLatex(node) {
  if (!node) return ''
  switch (node.type) {
    case NodeType.NUMBER:
      return String(node.value)
    case NodeType.VARIABLE:
      return node.name
    case NodeType.TEXT:
      return node.value
    case NodeType.BINARY_OP:
      const op = node.operator === '*' ? '\\cdot' : node.operator
      return `${toCanonicalLatex(node.left)}${op}${toCanonicalLatex(node.right)}`
    case NodeType.POWER:
      return `{${toCanonicalLatex(node.base)}}^{${toCanonicalLatex(node.exponent)}}`
    case NodeType.FRACTION:
      return `\\frac{${toCanonicalLatex(node.numerator)}}{${toCanonicalLatex(node.denominator)}}`
    case NodeType.RELATION:
      return `${toCanonicalLatex(node.left)}${node.operator}${toCanonicalLatex(node.right)}`
    case NodeType.PAREN:
      return `(${toCanonicalLatex(node.inner)})`
    default:
      return ''
  }
}




