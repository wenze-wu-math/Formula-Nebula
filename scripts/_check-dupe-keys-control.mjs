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

/**
 * Make sure PRE_FIX_REF is present in the local object database.
 *
 * CI checks out with `fetch-depth: 1`, so a historical commit is normally NOT
 * reachable and `git show` dies with "invalid object name". Rather than
 * requiring every contributor to configure a deeper checkout, fetch just that
 * one commit on demand. When the ref is already present (normal local clone)
 * this is a no-op and no network is touched.
 */
function ensureRefAvailable(ref) {
  try {
    execFileSync('git', ['-C', ROOT, 'cat-file', '-e', `${ref}^{commit}`], { stdio: 'ignore' })
    return true
  } catch {
    // fall through to fetch
  }
  for (const args of [
    ['fetch', '--depth', '1', 'origin', ref],
    ['fetch', '--depth', '500', 'origin'],
  ]) {
    try {
      execFileSync('git', ['-C', ROOT, ...args], { stdio: 'ignore', timeout: 120000 })
      execFileSync('git', ['-C', ROOT, 'cat-file', '-e', `${ref}^{commit}`], { stdio: 'ignore' })
      return true
    } catch {
      /* try the next strategy */
    }
  }
  return false
}

const CASES = [
  { file: 'src/data/proofs/batch-02.js', key: 'explanation', expected: 13 },
  { file: 'src/data/proofs/deep-dive.js', key: 'explanation', expected: 5 },
  { file: 'src/data/proofs/batch-21.js', key: 'explanation', expected: 13 },
]

/**
 * A tiny inlined sample of the defect, used when git history is unavailable.
 * It reproduces the exact shape that was wrong: two `explanation:` keys in one
 * node literal, three nodes, one of them nested so indentation must be handled.
 */
const SYNTHETIC_DEFECT = `
export const X = {
  'node-a': {
    statement: 'a',
    explanation: 'first a',
    steps: [],
    conclusion: 'c',
    explanation: 'second a',
  },
  'node-b': {
    statement: 'b',
    explanation: 'first b',
    steps: [
      { id: 's1', body: 'x', uses: [] },
    ],
    explanation: 'second b',
    examples: [],
  },
}
`

let failures = 0

if (ensureRefAvailable(PRE_FIX_REF)) {
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
} else {
  // History not reachable (e.g. fetch-depth: 1 and no network). Fall back to a
  // synthetic sample so the detector still gets exercised, and say so loudly.
  console.log(`NOTE: ${PRE_FIX_REF} not reachable; using the inlined sample instead.`)
  const found = findDuplicateKeys(SYNTHETIC_DEFECT)
  const ok = found.length === 2 && found.every((p) => p.key === 'explanation')
  if (!ok) failures++
  console.log(
    `${ok ? 'OK  ' : 'FAIL'} inlined sample: found ${found.length} duplicate 'explanation' (expected 2)`
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
