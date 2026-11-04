/**
 * Verify the factual claims made in README.md.
 *
 * A README that states numbers must keep stating the right ones. Several of
 * the claims in the previous README had drifted badly (it said 226 proofs when
 * the data had 245, and claimed a 68% bundle reduction that was an artefact of
 * comparing gzipped size against on-disk size).
 *
 * Run: node scripts/verify-readme-claims.mjs
 */

import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const readme = fs.readFileSync(path.join(ROOT, 'README.md'), 'utf8')

let passed = 0
let failed = 0
const check = (name, ok, detail = '') => {
  if (ok) {
    passed++
    console.log(`✓ ${name}${detail ? ' — ' + detail : ''}`)
  } else {
    failed++
    console.log(`✗ ${name}${detail ? ' — ' + detail : ''}`)
  }
}

// ── graph node counts ──────────────────────────────────────────────────────
const { pathToFileURL } = await import('node:url')
const asUrl = (p) => pathToFileURL(p).href
const { buildGraph } = await import(asUrl(path.join(ROOT, 'src', 'graph.js')))
const graph = buildGraph()
const stats = graph.stats

// IMPORTANT: this project has two different node counts and the README used to
// quote the wrong one.
//
//   curated core (src/data, reported by check-data.mjs)
//       405 theorems + 59 conjectures                             = 464
//   what the app actually renders (graph.stats)
//       3630 theorems + 607 conjectures + 69 researchers          = 4306
//
// Someone opening the app sees 4306 points on screen, so the front page must
// quote 4306. The 464 figure is an internal dataset size used by the editing
// workflow; it belongs in the technical notes, not the landing page.

check(
  'README quotes the node count the app renders (4306)',
  readme.includes(String(stats.nodeCount)) && stats.nodeCount === 4306,
  `${stats.nodeCount} nodes`
)
check(
  'theorem count matches runtime (3630)',
  readme.includes(String(stats.galaxyCount)) && stats.galaxyCount === 3630,
  `${stats.galaxyCount} galaxy nodes`
)
check(
  'conjecture count matches runtime (607)',
  readme.includes(String(stats.conjCount)) && stats.conjCount === 607,
  `${stats.conjCount} cluster nodes`
)
check(
  'link count matches runtime (8747)',
  readme.includes(String(stats.linkCount)) && stats.linkCount === 8747,
  `${stats.linkCount} links`
)
check(
  'README does not present the internal curated count (464) as the app size',
  !/(^|[^\d])464([^\d]|$)/.test(readme),
  '464 is the curated dataset size, not what users see'
)

// ── proof coverage ─────────────────────────────────────────────────────────
const proofsModule = await import(asUrl(path.join(ROOT, 'src', 'data', 'proofs', 'index.js')))
const proofCount = Object.keys(proofsModule.PROOFS ?? {}).length

check(
  'proof count stated as 245',
  readme.includes('245') && proofCount === 245,
  `${proofCount} proof records`
)

// ── dev server port ────────────────────────────────────────────────────────
const viteConfig = fs.readFileSync(path.join(ROOT, 'vite.config.js'), 'utf8')
const portMatch = viteConfig.match(/const DEFAULT_PORT = (\d+)/)
const devPort = portMatch ? portMatch[1] : null
check(
  'dev port in README matches vite.config.js',
  devPort !== null && readme.includes(`localhost:${devPort}`),
  `vite DEFAULT_PORT=${devPort}`
)

// ── scripts referenced in the README must exist ────────────────────────────
for (const cmd of ['npm install', 'npm run dev', 'npm run ci']) {
  check(`README documents "${cmd}"`, readme.includes(cmd))
}

const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'))
check('npm run dev exists', typeof pkg.scripts.dev === 'string')
check('npm run ci exists', typeof pkg.scripts.ci === 'string')

// ── CI badge points at a workflow that exists ──────────────────────────────
const badgeMatch = readme.match(/actions\/workflows\/([\w.-]+)\/badge\.svg/)
if (badgeMatch) {
  const wf = path.join(ROOT, '.github', 'workflows', badgeMatch[1])
  check(`CI badge targets an existing workflow (${badgeMatch[1]})`, fs.existsSync(wf))
}

// ── length budget ──────────────────────────────────────────────────────────
const lines = readme.split('\n').length
check('README stays under 160 lines', lines <= 160, `${lines} lines`)

console.log(`\nResults: ${passed} passed, ${failed} failed`)
process.exit(failed === 0 ? 0 : 1)
