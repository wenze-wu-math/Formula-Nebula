/**
 * Evolution loop health check — the "体检" step of docs/EVOLUTION_LOOP.md.
 *
 * Prints every signal needed to decide what to work on next, and exits
 * non-zero if anything is actually broken (so it can be used in CI as a
 * drift alarm, not just by a human).
 *
 * Read-only: it never modifies the working tree.
 *
 * Usage: node scripts/health.mjs [--json]
 */

import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const JSON_OUT = process.argv.includes('--json')

const run = (args, { allowFail = false } = {}) => {
  try {
    return execFileSync(args[0], args.slice(1), {
      cwd: ROOT,
      encoding: 'utf8',
      maxBuffer: 32 * 1024 * 1024,
      stdio: ['ignore', 'pipe', 'pipe'],
    }).trim()
  } catch (err) {
    if (allowFail) return (err.stdout || '').trim()
    throw err
  }
}

const git = (...args) => run(['git', ...args])
const tryGit = (...args) => run(['git', ...args], { allowFail: true })

const report = { ok: true, problems: [] }
const record = (label, value) => {
  report[label] = value
  return value
}

// ── git state ──────────────────────────────────────────────────────────────
const head = record('head', git('rev-parse', '--short', 'HEAD'))
const branch = record('branch', git('branch', '--show-current'))
const dirty = record('dirtyFiles', git('status', '--porcelain'))

const aheadBehind = tryGit('rev-list', '--left-right', '--count', 'origin/main...HEAD')
const [behind, ahead] = aheadBehind ? aheadBehind.split(/\s+/).map(Number) : [0, 0]
record('ahead', ahead)
record('behind', behind)

// ── repo size ──────────────────────────────────────────────────────────────
const countObjects = tryGit('count-objects', '-vH')
const packLine = countObjects.split('\n').find((l) => l.startsWith('size-pack:')) || ''
const packMB = parseFloat((packLine.match(/([\d.]+)\s*MiB/) || [])[1] || '0')
record('gitSizeMiB', packMB)

// ── root file count ────────────────────────────────────────────────────────
const rootFiles = fs
  .readdirSync(ROOT, { withFileTypes: true })
  .filter((d) => d.isFile() && !d.name.startsWith('.') && d.name !== 'commitmsg.tmp.txt')
  .map((d) => d.name)
record('rootFileCount', rootFiles.length)

// ── lint ───────────────────────────────────────────────────────────────────
// Both are assigned on every path below (success, eslint-error-with-JSON, and
// the parse-failure fallback), so no initial value is needed.
let lintErrors
let lintWarnings
try {
  const out = execFileSync(process.execPath, [path.join(ROOT, 'node_modules', 'eslint', 'bin', 'eslint.js'), '.', '--ext', '.js,.mjs', '-f', 'json'], {
    cwd: ROOT,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
    stdio: ['ignore', 'pipe', 'ignore'],
  })
  const parsed = JSON.parse(out)
  lintErrors = parsed.reduce((n, f) => n + f.errorCount, 0)
  lintWarnings = parsed.reduce((n, f) => n + f.warningCount, 0)
} catch (err) {
  // eslint exits non-zero when there are errors; its JSON is still on stdout
  try {
    const parsed = JSON.parse(err.stdout || '[]')
    lintErrors = parsed.reduce((n, f) => n + f.errorCount, 0)
    lintWarnings = parsed.reduce((n, f) => n + f.warningCount, 0)
  } catch {
    lintErrors = -1
  }
}
record('lintErrors', lintErrors)
record('lintWarnings', lintWarnings)

// ── test counts (fast, pure node) ──────────────────────────────────────────
const suites = [
  ['canonicalization', 'tests/canonicalization/run-tests.js'],
  ['routing', 'tests/routing/run-tests.js'],
  ['latex-escape', 'tests/export/latex-escape.test.mjs'],
  ['api-keys', 'tests/api-keys/permission-match.test.mjs'],
]
const tests = {}
for (const [name, file] of suites) {
  const abs = path.join(ROOT, file)
  if (!fs.existsSync(abs)) {
    tests[name] = 'missing'
    report.problems.push(`test suite missing: ${file}`)
    continue
  }
  try {
    const out = run([process.execPath, file])
    // A suite may print more than one "Results: N passed, M failed" line (the
    // canonicalization runner reports normalization and comparison separately),
    // so sum every occurrence instead of taking the first.
    const lines = [...out.matchAll(/Results:\s*(\d+) passed,\s*(\d+) failed/g)]
    if (lines.length) {
      const passed = lines.reduce((n, m) => n + Number(m[1]), 0)
      const failed = lines.reduce((n, m) => n + Number(m[2]), 0)
      tests[name] = `${passed} ok, ${failed} failed`
      if (failed > 0) report.problems.push(`${name}: ${failed} failing`)
    } else {
      tests[name] = 'ran'
    }
  } catch {
    tests[name] = 'FAILED'
    report.problems.push(`${name}: suite exited non-zero`)
  }
}
record('tests', tests)

// ── expectations (drift thresholds) ────────────────────────────────────────
const LIMITS = {
  rootFileCount: 55,
  gitSizeMiB: 35,
  lintErrors: 55,
}

if (rootFiles.length > LIMITS.rootFileCount)
  report.problems.push(`root has ${rootFiles.length} files (limit ${LIMITS.rootFileCount}) — archive more`)
if (packMB > LIMITS.gitSizeMiB)
  report.problems.push(`.git is ${packMB} MiB (limit ${LIMITS.gitSizeMiB}) — something large was committed`)
if (lintErrors > LIMITS.lintErrors)
  report.problems.push(`lint errors ${lintErrors} exceed budget ${LIMITS.lintErrors}`)
if (dirty) report.problems.push('working tree is dirty — commit or discard before starting a round')
if (behind > 0) report.problems.push(`${behind} commit(s) behind origin/main`)

report.ok = report.problems.length === 0

if (JSON_OUT) {
  console.log(JSON.stringify(report, null, 2))
  process.exit(report.ok ? 0 : 1)
}

// ── human-readable ─────────────────────────────────────────────────────────
const pad = (s, n) => String(s).padEnd(n)
console.log('\n═══ Evolution loop health check ═══\n')
console.log(`  ${pad('branch', 16)} ${branch} @ ${head}`)
console.log(`  ${pad('sync', 16)} ${ahead} ahead / ${behind} behind origin/main`)
console.log(`  ${pad('working tree', 16)} ${dirty ? 'DIRTY' : 'clean'}`)
console.log(`  ${pad('root files', 16)} ${rootFiles.length}  (limit ${LIMITS.rootFileCount})`)
console.log(`  ${pad('.git size', 16)} ${packMB} MiB  (limit ${LIMITS.gitSizeMiB})`)
console.log(`  ${pad('lint', 16)} ${lintErrors} errors, ${lintWarnings} warnings  (error budget ${LIMITS.lintErrors})`)
console.log(`  ${pad('tests', 16)}`)
for (const [k, v] of Object.entries(tests)) console.log(`      ${pad(k, 18)} ${v}`)

console.log('')
if (report.ok) {
  console.log('  ✓ all signals within budget — nothing is broken.')
} else {
  console.log(`  ! ${report.problems.length} item(s) need attention:`)
  for (const p of report.problems) console.log(`      - ${p}`)
}
console.log('\n  Next step: pick ONE item from docs/EVOLUTION_LOOP.md section 三.\n')
process.exit(report.ok ? 0 : 1)
