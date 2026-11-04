/**
 * Regression check for API-key permission pattern matching.
 *
 * The matcher used to concatenate the stored pattern straight into a RegExp,
 * so regex metacharacters acted as operators instead of literal text. That
 * mis-matched endpoints and allowed catastrophic backtracking.
 *
 * Run: node tests/api-keys/permission-match.test.mjs
 */

import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..', '..')
const SRC = path.join(ROOT, 'src', 'api-keys', 'management.js')

// Pull the matcher out of the class so we exercise the real implementation.
const source = fs.readFileSync(SRC, 'utf8')
const start = source.indexOf('  hasPermission(')
const end = source.indexOf('\n  }', start)
if (start < 0 || end < 0) {
  console.error('could not locate hasPermission() in src/api-keys/management.js')
  process.exit(1)
}
const body = source.slice(start, end + 4)
const validator = new Function(
  `class APIKeyValidator { constructor() {} ${body}\n}\nreturn new APIKeyValidator();`
)()

const matches = (permissions, endpoint) => validator.hasPermission({ permissions }, endpoint)

let passed = 0
let failed = 0
const check = (name, actual, expected) => {
  if (actual === expected) {
    passed++
    console.log(`✓ ${name}`)
  } else {
    failed++
    console.log(`✗ ${name}\n    expected: ${expected}\n    actual:   ${actual}`)
  }
}

// Intended wildcard behaviour.
check('exact match', matches(['/api/v1/x'], '/api/v1/x'), true)
check('wildcard suffix', matches(['/api/v1/*'], '/api/v1/foo'), true)
check('full wildcard', matches(['*'], '/anything'), true)
check('no match', matches(['/api/v1/*'], '/other/foo'), false)
check('empty permissions allows all', matches([], '/whatever'), true)

// The regression: metacharacters must be literal.
check('dot is literal, not "any char"', matches(['a.b'], 'axb'), false)
check('dot still matches itself', matches(['a.b'], 'a.b'), true)
check('plus is literal', matches(['/api/v1/a+'], '/api/v1/aaa'), false)
check('plus still matches itself', matches(['/api/v1/a+'], '/api/v1/a+'), true)
check('parens are literal', matches(['(a|b)'], 'a'), false)
check('parens still match themselves', matches(['(a|b)'], '(a|b)'), true)
check('backslash is literal', matches(['a\\b'], 'ab'), false)

// ReDoS: the classic catastrophic pattern must now be a literal string and
// therefore fast. 100k characters of input would previously hang.
const t0 = Date.now()
const redos = matches(['(a+)+b'], 'a'.repeat(100000))
const ms = Date.now() - t0
check('catastrophic pattern is now literal', redos, false)
check(`catastrophic pattern is fast (${ms}ms)`, ms < 200, true)

// Multiple patterns: any match wins.
check('any-of semantics', matches(['/nope', '/api/v1/*'], '/api/v1/x'), true)

console.log(`\nResults: ${passed} passed, ${failed} failed`)
process.exit(failed === 0 ? 0 : 1)
