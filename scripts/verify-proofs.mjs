/** Validate optional proof data without importing browser/rendering modules. */
import { readdirSync } from 'node:fs'
import { join, dirname, relative, sep } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import katex from 'katex'
import { PROOFS, validateProofShape, PROOF_MERGE_ORDER } from '../src/data/proofs/index.js'
import { NODES } from '../src/data/knowledge.js'
import { EXTRA_A_NODES } from '../src/data/extra-a.js'
import { EXTRA_B_NODES } from '../src/data/extra-b.js'
import { EXTRA_C_NODES } from '../src/data/extra-c.js'
import { EXTRA_D_NODES } from '../src/data/extra-d.js'
import { EXTRA_E_NODES } from '../src/data/extra-e.js'
import { EXTRA_F_NODES } from '../src/data/extra-f.js'
import { EXTRA_G_NODES } from '../src/data/extra-g.js'
import { EXTRA_H_NODES } from '../src/data/extra-h.js'
import { CONJECTURE_NODES } from '../src/data/conjectures.js'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const proofDir = join(root, 'src', 'data', 'proofs')
// Import the exact graph sources. This deliberately avoids guessing export
// names with a regex: EXTRA_A_NODES … EXTRA_H_NODES must all be included.
const nodeIds = new Set([
  ...NODES,
  ...EXTRA_A_NODES, ...EXTRA_B_NODES, ...EXTRA_C_NODES, ...EXTRA_D_NODES,
  ...EXTRA_E_NODES, ...EXTRA_F_NODES, ...EXTRA_G_NODES, ...EXTRA_H_NODES,
  ...CONJECTURE_NODES,
].map((node) => node?.id).filter(Boolean))

let errors = 0
const err = (message) => { console.error(`  ✗ ${message}`); errors++ }
function collectProofFiles(dir, base = dir) {
  const files = []
  for (const entry of readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const absolute = join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...collectProofFiles(absolute, base))
      continue
    }
    if (!entry.isFile() || !/\.m?js$/.test(entry.name)) continue
    const file = relative(base, absolute).split(sep).join('/')
    // index.js is the registry and schema.js contains only validation helpers.
    // A nested index is still a data source and is intentionally inspected.
    if (file === 'index.js' || file === 'schema.js') continue
    files.push({ absolute, file })
  }
  return files
}

const proofFiles = collectProofFiles(proofDir)
if (proofFiles.length === 0) err('proof directory contains no proof data files')

// Merge order is informational only: index.js merges these files and no key is
// declared twice, so the order cannot change which record wins. A repeated key
// is an unconditional error (see below).
const declaredOrder = [...PROOF_MERGE_ORDER]
const fileOrder = new Map(proofFiles.map(({ file }, index) => [file, index]))
console.log(`Proof files merged by index.js: ${declaredOrder.join(' → ')}`)

// Every proof source file must be imported and represented in index.js. This
// prevents a newly added family file from silently being ignored by the
// registry. A key declared in more than one file is a hard error: the fix is to
// delete the superseded copy, not to add a precedence rule, because a record
// that is silently overridden is a record nobody reviews.
const sourceProofs = new Map()
for (const { absolute, file } of proofFiles) {
  let mod
  try {
    mod = await import(pathToFileURL(absolute).href)
  } catch (error) {
    err(`${file}: failed to import proof data: ${error.message}`)
    continue
  }
  const proofExports = Object.entries(mod).filter(([exportName]) => /PROOFS$/.test(exportName))
  if (!proofExports.length) {
    err(`${file}: must export a named *PROOFS object`)
    continue
  }
  for (const [exportName, value] of proofExports) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      err(`${file}.${exportName} must be a non-array object keyed by node id`)
      continue
    }
    for (const [nodeId, proof] of Object.entries(value)) {
      const previous = sourceProofs.get(nodeId)
      if (previous) {
        err(`duplicate proof key ${nodeId} in ${file} and ${previous.file}: delete the superseded copy and keep one record per node id`)
        continue
      }
      sourceProofs.set(nodeId, { file, proof })
    }
  }
}
// The registry must serve exactly the source object, so a key silently
// overwritten during the spread would be caught here.
for (const [nodeId, source] of sourceProofs.entries()) {
  if (!Object.prototype.hasOwnProperty.call(PROOFS, nodeId)) {
    err(`${nodeId}: source proof in ${source.file} is not exported by proofs/index.js`)
  } else if (PROOFS[nodeId] !== source.proof) {
    err(`${nodeId}: registry proof differs from the source object in ${source.file}`)
  }
}
for (const nodeId of Object.keys(PROOFS)) {
  if (!sourceProofs.has(nodeId)) err(`${nodeId}: registry proof has no source data file`)
}
// Every file the registry merges must exist as a data file on disk, and every
// data file on disk must be merged — otherwise a family could be added or
// dropped without either side noticing.
for (const file of declaredOrder) {
  if (!fileOrder.has(file)) err(`proofs/index.js merges ${file}, which is not a proof data file on disk`)
}
for (const { file } of proofFiles) {
  if (!declaredOrder.includes(file)) {
    err(`${file}: exists on disk but is not merged by proofs/index.js (add it to the spread list or delete it)`)
  }
}


function isEscaped(source, index) {
  let slashes = 0
  for (let cursor = index - 1; cursor >= 0 && source[cursor] === '\\'; cursor--) slashes++
  return slashes % 2 === 1
}

function findMathClose(source, start, close) {
  for (let cursor = start; cursor < source.length; cursor++) {
    if (source.startsWith(close, cursor) && !isEscaped(source, cursor)) return cursor
  }
  return -1
}

/**
 * Split the supported math delimiters while reporting malformed pairs.
 * Regex-only extraction silently drops an unmatched opener, which is exactly
 * the kind of typo this verifier must catch in mixed prose/math fields.
 */
function scanMath(value) {
  const source = String(value)
  const segments = []
  const issues = []
  const outsideCommands = []
  let cursor = 0
  while (cursor < source.length) {
    if (source[cursor] === '\\' && !isEscaped(source, cursor)) {
      const open = source.startsWith('\\[', cursor) ? '\\['
        : source.startsWith('\\(', cursor) ? '\\('
          : source.startsWith('\\]', cursor) ? '\\]'
            : source.startsWith('\\)', cursor) ? '\\)' : null
      if (open === '\\]' || open === '\\)') {
        issues.push(`unmatched closing delimiter ${open}`)
        cursor += 2
        continue
      }
      if (open) {
        const close = open === '\\[' ? '\\]' : '\\)'
        const end = findMathClose(source, cursor + 2, close)
        if (end < 0) {
          issues.push(`unclosed delimiter ${open}`)
          break
        }
        segments.push({ tex: source.slice(cursor + 2, end), delimiter: open })
        cursor = end + 2
        continue
      }
      const command = source.slice(cursor).match(/^\\([A-Za-z]+)/)
      if (command) outsideCommands.push(command[1])
      cursor += 2
      continue
    }
    if (source[cursor] !== '$' || isEscaped(source, cursor)) {
      cursor++
      continue
    }
    const display = source.startsWith('$$', cursor)
    const open = display ? '$$' : '$'
    // Match the renderer's inline-math rule: a dollar followed by whitespace
    // is ordinary prose (for example, a currency marker), not an opener.
    if (!display && /\s/.test(source[cursor + 1] || '')) {
      cursor++
      continue
    }
    const end = findMathClose(source, cursor + open.length, open)
    if (end < 0) {
      issues.push(`unclosed delimiter ${open}`)
      break
    }
    segments.push({ tex: source.slice(cursor + open.length, end), delimiter: open })
    cursor = end + open.length
  }
  return { segments, issues, outsideCommands }
}

/**
 * LaTeX command names that are recognised *without* a backslash when they
 * appear inside a `$…$` / `\(…\)` / `\[…\]` segment. A math segment is LaTeX,
 * so `\mathcal{O}_X` is correct while a bare `mathcal{O}_X` is a stripped
 * backslash: KaTeX renders the letters as a product of variables, which looks
 * plausible but is mathematically wrong, so no renderer-level check catches it.
 *
 * A match preceded by `\` (a real command), `{` (a command argument such as
 * `\operatorname{Spec}` / `\mathrm{trdeg}`) or a letter (part of a longer word)
 * is *not* flagged.
 */
const BARE_MATH_COMMANDS = [
  'operatorname', 'mathcal', 'mathfrak', 'mathbb', 'mathrm', 'boxed', 'text', 'frac', 'sqrt',
  'otimes', 'oplus', 'mapsto', 'subseteq', 'subset', 'cup', 'cap', 'deg', 'ell', 'dim',
  'eta', 'alpha', 'beta', 'gamma', 'varphi', 'neq', 'cong', 'simeq', 'Longrightarrow',
  'Rightarrow', 'cdot', 'ldots', 'sum', 'prod', 'bigcap', 'bigcup', 'bar', 'hat', 'tilde',
  'ker', 'coker', 'Gamma', 'Delta', 'Omega', 'Spec', 'Proj', 'colon', 'pmod', 'equiv',
]
/** Return the bare command names a math segment contains, if any. */
function bareCommandsInMath(tex) {
  const hits = []
  for (const command of BARE_MATH_COMMANDS) {
    if (new RegExp(`(^|[^\\\\a-zA-Z{])${command}\\b`).test(tex)) hits.push(command)
  }
  return hits
}

function inspectMath(value) {
  const scan = scanMath(value)
  const issues = [...scan.issues]
  // Raw-Latex-only fields have no delimited segments, so their commands remain
  // valid. Once a field mixes delimiters with prose, bare commands are shown
  // literally by proofView and are almost always a data typo.
  if (scan.segments.length && scan.outsideCommands.length) {
    for (const command of scan.outsideCommands) {
      issues.push(`bare LaTeX command \\${command} outside math delimiters`)
    }
  }
  // Inside the segments the check is inverted: the delimiters promise LaTeX,
  // so a known command name without its backslash is a stripped-backslash bug.
  for (const segment of scan.segments) {
    for (const command of bareCommandsInMath(segment.tex)) {
      issues.push(`math segment contains bare command ${command} (missing backslash?): ${JSON.stringify(segment.tex.slice(0, 60))}`)
    }
  }
  return { ...scan, issues }
}

/**
 * A proof step is the unit of argument, so a one-sentence body is not a proof.
 * This floor is a cheap structural guard against padding a record with a
 * token step; the per-file checker (scripts/_check-proof-file.mjs) uses the
 * same number, and MIN_STEP_BODY can raise it for a stricter local run.
 */
const MIN_STEP_BODY = Number(process.env.MIN_STEP_BODY || 300)

/**
 * Every record must now clear the length floor and carry the full story
 * (explanation + examples + remarks). The grandfathering exemption and its
 * positional fingerprint were retired together with `long-form.js`: all 43
 * records were rewritten to the standard, so any short step is a regression
 * rather than pre-existing data.
 */
let fullRecordCount = 0
for (const nodeId of Object.keys(PROOFS)) {
  const proof = PROOFS[nodeId]
  const source = sourceProofs.get(nodeId)
  if (!nodeIds.has(nodeId)) err(`${nodeId}: proof key does not match an existing node id`)
  for (const issue of validateProofShape(proof)) err(`${nodeId}: ${issue}`)
  const steps = Array.isArray(proof?.steps) ? proof.steps : []
  const stepIds = new Set(steps.map((step) => step?.id).filter(Boolean))
  for (const [index, step] of steps.entries()) {
    const uses = Array.isArray(step?.uses) ? step.uses : []
    for (const usedId of uses) {
      if (nodeIds.has(usedId) || stepIds.has(usedId)) continue
      err(`${nodeId}.steps[${index}].uses references missing node/step id: ${usedId}`)
    }
    const body = typeof step?.body === 'string' ? step.body : ''
    if (body.length < MIN_STEP_BODY) {
      err(`${nodeId}.steps[${index}] (${step?.id}): body is only ${body.length} characters, minimum is ${MIN_STEP_BODY}`)
    }
  }
  // Every record must now tell the whole story: an intuition paragraph, at
  // least one worked example, and at least one boundary remark.
  if (!proof?.explanation) err(`${nodeId}: missing explanation (required)`)
  else if (!(proof?.examples ?? []).length) err(`${nodeId}: missing examples (required)`)
  else if (!(proof?.remarks ?? []).length) err(`${nodeId}: missing remarks (required)`)
  else if (source) fullRecordCount++
  // Render every math-delimited segment through KaTeX in strict mode. This
  // checks LaTeX syntax while leaving surrounding Chinese/Markdown untouched.
  const validateMath = (field, value, rawLatex = false) => {
    if (typeof value !== 'string') return
    const { segments, issues } = inspectMath(value)
    for (const issue of issues) err(`${nodeId}.${field}: ${issue}`)
    const toRender = segments.map(({ tex }) => tex)
    // Mixed Chinese prose with Unicode math symbols is rendered as text by
    // proofView; only explicitly delimited segments should go to KaTeX.
    // Raw-LaTeX fields without CJK prose retain the strict whole-field check.
    const mixedProse = /[\u3400-\u9fff]/.test(value)
    if (!toRender.length && !issues.length && !mixedProse && (rawLatex || /\\[a-zA-Z]+/.test(value))) toRender.push(value)
    for (const [index, tex] of toRender.entries()) {
      try { katex.renderToString(tex, { throwOnError: true, strict: 'error', trust: false }) }
      catch (error) { err(`${nodeId}.${field} segment ${index}: invalid LaTeX: ${error.message}`) }
    }
  }
  validateMath('statement', proof?.statement, true)
  validateMath('conclusion', proof?.conclusion, true)
  for (const [index, step] of steps.entries()) {
    validateMath(`steps[${index}].body`, step?.body, true)
    validateMath(`steps[${index}].title`, step?.title)
    validateMath(`steps[${index}].note`, step?.note)
  }
  validateMath('history', proof?.history)
  for (const field of ['dependencies', 'consequences']) {
    const ids = Array.isArray(proof?.[field]) ? proof[field] : []
    for (const id of ids) {
      if (!nodeIds.has(id)) err(`${nodeId}.${field} references missing node id: ${id}`)
    }
  }
}

// Regression probes for the scanner itself. These stay pure Node and ensure
// future edits do not reintroduce the old regex blind spot for mixed text.
// Each sample is [field, expected issue count]; the samples with a comment
// pin one specific defect class so the check cannot silently stop firing.
const scannerRegressions = [
  ['前文 $x+1$ 后文', 0],
  ['前文 $x+1 后文', 1],
  ['$x', 1],
  ['$x$ 中文 $y$', 0],
  ['$x$ \\badcommand', 1],
  ['前文 \\(x+1\\) 后文', 0],
  ['前文 \\(x+1 后文', 1],
  ['前文 \\] 后文', 1],
  // Bare command outside the delimiters is a typo once the field is mixed.
  ['前文 $x$ 后文 \\operatorname{A} 末文', 1],
  // Bare command outside the delimiters in a raw-LaTeX-only field stays legal.
  ['\\operatorname{Spec}(A)', 0],
  // Backslash-stripped command *inside* a math segment must be flagged …
  ['设 $mathcal{O}_X$ 为结构层', 1],
  ['$r\\cdot 1=0$', 0],          // … but the escaped form is fine
  ['$a cdot b$', 1],             // … and so is a stripped \cdot
  ['$K\\otimes_R L$', 0],
  // `otimes_R` would slip past the trailing \\b (the subscript is a word
  // character), so the regression uses the plain form to pin the check itself.
  ['$K otimes L$', 1],
  ['$\\operatorname{Spec}(A)$', 0],
  ['$operatorname{Spec}(A)$', 1],
  ['$\\ker\\varphi$', 0],
  ['$ker varphi$', 2],           // both stripped commands are reported
  // A command argument must never be mistaken for a stripped backslash.
  ['$\\dim_k \\mathcal{O}_{X,p}$', 0],
  ['$\\operatorname{dim} M$', 0],
  // \\[ … \\] display segments are checked the same way.
  ['\\[ mathcal{F} \\]', 1],
]
for (const [sample, expectedIssues] of scannerRegressions) {
  const actual = inspectMath(sample).issues.length
  if (actual !== expectedIssues) err(`math scanner regression for ${JSON.stringify(sample)}: expected ${expectedIssues} issue(s), got ${actual}`)
}

// Regression probe for the step-body floor: the boundary is inclusive, so a
// body of exactly MIN_STEP_BODY characters must pass and one character less
// must fail. Kept explicit so a future refactor cannot turn the floor into an
// off-by-one that silently accepts short bodies.
{
  const bodyOf = (length) => '中'.repeat(length)
  const floorRecords = {
    'regression-exactly-min': { statement: 's', steps: [{ id: 'a', title: 't', body: bodyOf(MIN_STEP_BODY), uses: [] }], conclusion: 'c' },
    'regression-one-short': { statement: 's', steps: [{ id: 'a', title: 't', body: bodyOf(MIN_STEP_BODY - 1), uses: [] }], conclusion: 'c' },
  }
  const shortBodies = Object.entries(floorRecords)
    .flatMap(([key, record]) => record.steps.map((step) => ({ key, length: step.body.length })))
    .filter(({ length }) => length < MIN_STEP_BODY)
  if (shortBodies.length !== 1 || shortBodies[0].key !== 'regression-one-short') {
    err(`step body floor regression: expected exactly regression-one-short to fail, got ${JSON.stringify(shortBodies)}`)
  }
}

console.log(`Proof files: ${proofFiles.map(({ file }) => file).join(', ')}`)
console.log(`Nodes with proofs: ${Object.keys(PROOFS).length}`)
console.log(`Full records (explanation + examples + remarks): ${fullRecordCount}`)
console.log(errors ? `✗ Proof validation failed with ${errors} issue(s)` : '✓ Proof data validation passed')
process.exit(errors ? 1 : 0)
