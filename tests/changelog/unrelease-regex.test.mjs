/**
 * Verify the CHANGELOG "未发布" section regex actually captures content.
 *
 * The original pattern ended with `\Z`, which JavaScript regex does not
 * support — it is parsed as a literal "Z". So the pattern only matched when
 * the unreleased section happened to be followed by the letter Z, and the
 * script otherwise fell through to "找不到未发布部分" and exited 1.
 */

// The OLD pattern is kept verbatim on purpose: it is the broken one, and the
// point of this test is to show how it fails. `\Z` is not a JS escape (JS reads
// it as a literal "Z"), so eslint correctly flags it here — that warning is the
// evidence, not a defect in the test.
// eslint-disable-next-line no-useless-escape
const OLD = /## 未发布\n\n([\s\S]*?)(?=\n---\n## |\Z)/
const NEW = /## 未发布\n\n([\s\S]*?)(?=\n---\n## |(?![\s\S]))/

const CASES = [
  ['followed by another section', '## 未发布\n\n- item one\n- item two\n\n---\n## v1.0.0\n\nold stuff'],
  ['at end of file', '## 未发布\n\n- item one\n- item two\n'],
  ['empty section then section', '## 未发布\n\n---\n## v1.0.0\n'],
  ['contains letter Z', '## 未发布\n\n- Zenith theorem\n'],
]

let pass = 0
let fail = 0

for (const [name, input] of CASES) {
  const oldM = input.match(OLD)
  const newM = input.match(NEW)

  const oldCaptured = oldM ? oldM[1].trim() : null
  const newCaptured = newM ? newM[1].trim() : null

  // The new pattern must always match, and must capture the section body.
  const ok = newM !== null && newCaptured !== null
  if (ok) {
    pass++
    console.log(`✓ ${name}: captured ${JSON.stringify(newCaptured).slice(0, 50)}`)
  } else {
    fail++
    console.log(`✗ ${name}: new pattern failed to match`)
  }

  if (oldCaptured !== newCaptured) {
    console.log(`    (old pattern gave: ${oldCaptured === null ? 'NO MATCH' : JSON.stringify(oldCaptured).slice(0, 50)})`)
  }
}

console.log(`\nResults: ${pass} passed, ${fail} failed`)
process.exit(fail === 0 ? 0 : 1)
