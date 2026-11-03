/**
 * Authoritative check: no object literal in the data files declares the same
 * key twice (ESLint's `no-dupe-keys`, reimplemented for the generated data
 * files that the lint config ignores).
 *
 * Implementation: a tiny indent-based block tracker.
 *   - A key at indent N belongs to the object opened at indent N.
 *   - That object's sibling keys are, by construction, at the SAME indent N and
 *     come later; therefore a repeated key at indent N before the block closes
 *     is a duplicate.
 *   - A block "closes" when a line appears at indent < N that is not a
 *     continuation of a multi-line value.
 *
 * Because a plain parser is easy to get subtly wrong, this script is paired
 * with _check-dupe-keys-control.mjs, which asserts the same code DOES find the
 * known pre-fix duplicates. If the control fails, ignore this script's result.
 *
 * Usage: node scripts/_check-dupe-keys.mjs [dir ...]
 */

import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')

/**
 * Collect duplicate keys in a source string.
 * @returns {{line:number,key:string,first:number}[]}
 */
export function findDuplicateKeys(source) {
  const lines = source.split(/\r?\n/)
  /** stack of { indent, keys: Map<key, firstLineIndex> } */
  const stack = []
  const problems = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) {
      continue
    }

    const indentStr = line.match(/^[ \t]*/)[0]
    if (indentStr.includes('\t')) continue // skip mixed-indent lines
    const indent = indentStr.length

    // Close every object whose keys live at an indent >= this line's indent.
    // (A key at indent N means: "I am a member of the object whose members are
    // indented N". Any deeper block has ended; any equal-indent block is the
    // same one.)
    while (stack.length && stack[stack.length - 1].indent > indent) stack.pop()

    const m = line.match(/^([ \t]*)([A-Za-z_$][\w$]*)\s*:/)
    if (!m) continue
    const key = m[2]

    let holder = stack.find((b) => b.indent === indent)
    if (!holder) {
      holder = { indent, keys: new Map() }
      stack.push(holder)
    }

    if (holder.keys.has(key)) {
      problems.push({ line: i + 1, key, first: holder.keys.get(key) })
    } else {
      holder.keys.set(key, i + 1)
    }
  }
  return problems
}

if (import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}`) {
  const dirs =
    process.argv.length > 2
      ? process.argv.slice(2)
      : [path.join(ROOT, 'src', 'data', 'proofs'), path.join(ROOT, 'src', 'data')]

  const files = []
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) continue
    for (const f of fs.readdirSync(dir)) if (f.endsWith('.js')) files.push(path.join(dir, f))
  }

  let total = 0
  for (const file of files) {
    const problems = findDuplicateKeys(fs.readFileSync(file, 'utf8'))
    if (!problems.length) continue
    console.log(`\n${path.relative(ROOT, file).replace(/\\/g, '/')}`)
    for (const p of problems) {
      console.log(`  line ${p.line}: duplicate key '${p.key}' (first at line ${p.first})`)
      total++
    }
  }
  console.log(`\nfiles scanned: ${files.length}`)
  console.log(`duplicate keys: ${total}`)
  process.exit(total === 0 ? 0 : 1)
}
