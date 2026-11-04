/**
 * Regression check for the LaTeX escape helper in proof-explorer.
 *
 * The helper turns arbitrary text into something safe to drop into a .tex
 * file. The bug: it substituted backslashes into \textbackslash{} BEFORE
 * escaping braces, so the braces it had just introduced got escaped again and
 * the document received \textbackslash\{\} instead of \textbackslash{}.
 *
 * Run: node tests/export/latex-escape.test.mjs
 */

import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..', '..')
const SRC = path.join(ROOT, 'src', 'proof-explorer.js')

// Pull the escape() method out of the class text so we test the real code.
const source = fs.readFileSync(SRC, 'utf8')
const match = source.match(/\n  escape\(text\) \{[\s\S]*?\n  \}\n/)
if (!match) {
  console.error('could not locate escape() in src/proof-explorer.js')
  process.exit(1)
}
const escape = new Function(`${match[0].replace(/^\n  escape/, 'function escape')}; return escape;`)()

let passed = 0
let failed = 0
const check = (name, actual, expected) => {
  if (actual === expected) {
    passed++
    console.log(`✓ ${name}`)
  } else {
    failed++
    console.log(`✗ ${name}\n    expected: ${JSON.stringify(expected)}\n    actual:   ${JSON.stringify(actual)}`)
  }
}

// Plain text is untouched.
check('plain text', escape('simple text'), 'simple text')

// Characters that take a single backslash prefix.
check('underscore', escape('a_b'), 'a\\_b')
check('percent', escape('50% off'), '50\\% off')
check('ampersand', escape('a&b'), 'a\\&b')
check('hash', escape('a#b'), 'a\\#b')
check('dollar', escape('a$b'), 'a\\$b')
check('open brace', escape('a{b'), 'a\\{b')
check('close brace', escape('a}b'), 'a\\}b')

// The regression: replacements that themselves contain braces must NOT have
// their braces escaped afterwards.
check('backslash is not double-escaped', escape('a\\b'), 'a\\textbackslash{}b')
check('tilde is not double-escaped', escape('a~b'), 'a\\textasciitilde{}b')
check('caret is not double-escaped', escape('a^b'), 'a\\textasciicircum{}b')

// A mixed string exercises the ordering end to end.
check(
  'mixed content',
  escape('x_1 \\ y~z^2 & 50%'),
  'x\\_1 \\textbackslash{} y\\textasciitilde{}z\\textasciicircum{}2 \\& 50\\%'
)

// No output should ever contain the tell-tale double escape.
for (const s of ['a\\b', 'a~b', 'a^b', 'x\\y~z^w_v%u&t#s$r{q}']) {
  const out = escape(s)
  if (/\\text(backslash|asciitilde|asciicircum)\\\{/.test(out)) {
    failed++
    console.log(`✗ double escape leaked through for ${JSON.stringify(s)}: ${out}`)
  }
}

console.log(`\nResults: ${passed} passed, ${failed} failed`)
process.exit(failed === 0 ? 0 : 1)
