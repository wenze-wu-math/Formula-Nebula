/**
 * Negative control for _check-dupe-keys.mjs.
 *
 * Runs the very same detector over the PRE-FIX version of a proof file taken
 * from git history and asserts it finds the duplicates we know were there.
 * Without this, a "0 duplicates" result is not evidence of anything.
 *
 * Usage: node scripts/_check-dupe-keys-control.mjs
 */

import { execFileSync } from 'node:child_process'
import path from 'node:path'
import { findDuplicateKeys } from './_check-dupe-keys.mjs'

const ROOT = path.resolve(import.meta.dirname, '..')

// Commit immediately before the rescue landed.
const PRE_FIX_REF = 'ca49a38'

const CASES = [
  { file: 'src/data/proofs/batch-02.js', key: 'explanation', expected: 13 },
  { file: 'src/data/proofs/deep-dive.js', key: 'explanation', expected: 5 },
  { file: 'src/data/proofs/batch-21.js', key: 'explanation', expected: 13 },
]

let failures = 0

for (const c of CASES) {
  const old = execFileSync('git', ['-C', ROOT, 'show', `${PRE_FIX_REF}:${c.file}`], {
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  })
  const found = findDuplicateKeys(old).filter((p) => p.key === c.key)
  const ok = found.length === c.expected
  if (!ok) failures++
  console.log(
    `${ok ? 'OK  ' : 'FAIL'} ${c.file} @ ${PRE_FIX_REF}: ` +
      `found ${found.length} duplicate '${c.key}' (expected ${c.expected})`
  )
}

// And confirm the CURRENT tree is clean.
const fs = await import('node:fs')
const now = findDuplicateKeys(fs.readFileSync(path.join(ROOT, CASES[0].file), 'utf8'))
console.log(
  `${now.length === 0 ? 'OK  ' : 'FAIL'} current ${CASES[0].file}: ${now.length} duplicates (expected 0)`
)
if (now.length !== 0) failures++

console.log('')
if (failures) {
  console.log(`CONTROL FAILED (${failures}). The detector cannot be trusted.`)
  process.exit(1)
}
console.log('CONTROL OK: the detector reproduces all known pre-fix duplicates')
console.log('and reports none on the current tree.')
