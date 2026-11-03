/**
 * One-off migration: rescue the silently-dropped duplicate `explanation` key.
 *
 * In 24 proof data files, each node literal contains TWO `explanation:` keys.
 * JavaScript keeps the last one, so the first ("直观解释" — the intuition /
 * motivation paragraph) was silently discarded at runtime: 80,706 characters
 * of authored content that no user has ever seen.
 *
 * This renames ONLY the first occurrence to `deepExplanation`, preserving both
 * pieces of writing. The second occurrence keeps the `explanation` name, so
 * existing consumers (proofView, proof-explorer scoring, search) are untouched.
 *
 * Safety rules:
 *  - A key is only renamed if, within the same object literal, another
 *    `explanation:` key follows it (i.e. it is the one being clobbered).
 *  - The rename is applied to a unique line range, verified before writing.
 *  - The file's total number of `explanation:` occurrences must not change.
 *
 * Usage: node scripts/_fix-dupe-explanation.mjs [--write]
 */

import fs from 'node:fs'
import path from 'node:path'

const WRITE = process.argv.includes('--write')
const ROOT = path.resolve(import.meta.dirname, '..')
const PROOFS_DIR = path.join(ROOT, 'src', 'data', 'proofs')

/** Count non-overlapping matches of a regex in a string. */
const count = (s, re) => (s.match(re) || []).length

/**
 * Find, for every `explanation:` key, the index of the next `explanation:` key.
 * If the gap between them contains no closing `}` that would end the enclosing
 * object literal, the earlier key belongs to the same literal and is clobbered.
 */
function findClobbered(lines) {
  const keyIdx = []
  for (let i = 0; i < lines.length; i++) {
    if (/^\s*explanation:\s/.test(lines[i])) keyIdx.push(i)
  }

  const clobbered = []
  for (let n = 0; n < keyIdx.length - 1; n++) {
    const a = keyIdx[n]
    const b = keyIdx[n + 1]
    // Inspect the lines strictly between the two keys. A top-level `}` closing
    // the enclosing node literal would mean they belong to different nodes.
    let sameObject = true
    for (let i = a + 1; i < b; i++) {
      if (/^\s{0,2}\},?\s*$/.test(lines[i])) {
        sameObject = false
        break
      }
    }
    if (sameObject) clobbered.push(a)
  }
  return { clobbered, total: keyIdx.length }
}

const report = []
let totalRenamed = 0
let filesChanged = 0

const files = fs
  .readdirSync(PROOFS_DIR)
  .filter((f) => f.endsWith('.js'))
  .map((f) => path.join(PROOFS_DIR, f))

for (const file of files) {
  const raw = fs.readFileSync(file, 'utf8')
  const eol = raw.includes('\r\n') ? '\r\n' : '\n'
  const lines = raw.split(/\r?\n/)

  const before = count(raw, /^\s*explanation:\s/gm)
  if (before < 2) continue

  const { clobbered, total } = findClobbered(lines)
  if (!clobbered.length) continue

  for (const idx of clobbered) {
    lines[idx] = lines[idx].replace(/^(\s*)explanation:/, '$1deepExplanation:')
  }

  const out = lines.join(eol)
  const after = count(out, /^\s*explanation:\s/gm)
  const afterDeep = count(out, /^\s*deepExplanation:\s/gm)

  // Invariants: we only renamed, never added or removed a key.
  if (after !== before - clobbered.length) {
    throw new Error(
      `${path.basename(file)}: explanation count ${before} -> ${after} after renaming ${clobbered.length}`
    )
  }
  if (afterDeep !== clobbered.length) {
    throw new Error(`${path.basename(file)}: expected ${clobbered.length} deepExplanation, got ${afterDeep}`)
  }

  if (WRITE) fs.writeFileSync(file, out, 'utf8')

  filesChanged++
  totalRenamed += clobbered.length
  report.push({
    file: path.relative(ROOT, file).replace(/\\/g, '/'),
    renamed: clobbered.length,
    lines: clobbered.map((i) => i + 1),
  })
}

console.log(`mode: ${WRITE ? 'WRITE' : 'DRY RUN'}`)
console.log(`files touched: ${filesChanged}`)
console.log(`keys rescued:  ${totalRenamed}\n`)
for (const r of report) {
  console.log(`  ${r.file}  ->  ${r.renamed} (lines ${r.lines.join(', ')})`)
}
