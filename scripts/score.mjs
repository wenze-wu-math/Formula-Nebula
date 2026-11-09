/**
 * Evolution score — machine-verifiable progress against docs/EVOLUTION-GOAL.md.
 *
 * Each of the ten goals gets one of:
 *   PASS   measurable and currently met
 *   FAIL   measurable and currently not met
 *   TODO   not yet measurable (needs a tool that does not exist yet)
 *
 * A goal that cannot be measured reports TODO, never PASS. Claiming success
 * without a measurement is exactly the failure mode this whole file exists to
 * prevent.
 *
 * Usage:
 *   node scripts/score.mjs          # human readable, plus the N/10 line
 *   node scripts/score.mjs --json   # machine readable
 *
 * Exit code is always 0 — this is a scoreboard, not a gate. Use `npm run ci`
 * for pass/fail.
 */

import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import zlib from 'node:zlib'

const ROOT = path.resolve(import.meta.dirname, '..')
const AS_JSON = process.argv.includes('--json')

const results = []
const record = (id, title, status, detail) => results.push({ id, title, status, detail })

const read = (rel) => {
  try {
    return fs.readFileSync(path.join(ROOT, rel), 'utf8')
  } catch {
    return null
  }
}
const exists = (rel) => fs.existsSync(path.join(ROOT, rel))

// ── helpers ────────────────────────────────────────────────────────────────

/** Largest non-map JS chunk in dist/, gzipped. */
function measureMainBundle() {
  const dir = path.join(ROOT, 'dist', 'assets')
  if (!fs.existsSync(dir)) return null
  const js = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.js') && !f.endsWith('.map'))
    .map((f) => {
      const buf = fs.readFileSync(path.join(dir, f))
      return { name: f, raw: buf.length, gzip: zlib.gzipSync(buf, { level: 9 }).length }
    })
    .sort((a, b) => b.raw - a.raw)
  if (!js.length) return null
  return { largest: js[0], count: js.length }
}

function countSourceMaps() {
  const dir = path.join(ROOT, 'dist')
  if (!fs.existsSync(dir)) return null
  let n = 0
  const walk = (d) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name)
      if (e.isDirectory()) walk(p)
      else if (e.name.endsWith('.map')) n++
    }
  }
  walk(dir)
  return n
}

/** Does the primary JS chunk contain the large data batches? */
function mainBundleContainsExtraData() {
  const dir = path.join(ROOT, 'dist', 'assets')
  if (!fs.existsSync(dir)) return null
  const js = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.js') && !f.endsWith('.map'))
    .map((f) => ({ f, size: fs.statSync(path.join(dir, f)).size }))
    .sort((a, b) => b.size - a.size)[0]
  if (!js) return null
  const text = fs.readFileSync(path.join(dir, js.f), 'utf8')

  // 判据必须是**真实数据内容**，不能是关键词。
  //
  // 第一版用 /nLab|Wikipedia|unsolved/i 之类做探针，结果数据已经外置到
  // public/data/*.json 之后它仍然报"内联"——因为那些词也出现在代码注释、
  // 模块路径和 UI 文案里。这种探针既会假阳（数据已移走仍报 FAIL），
  // 也会假阴（数据内联但词不出现）。两种错误都让指标失去意义。
  //
  // 现在改为探测**具体节点 id**：这些字符串只存在于数据里，不可能出现在
  // 代码中。取各批次的一条代表，任一出现即说明该批数据仍被并进主包。
  const probes = [
    ['stacks-batch', 'stx-01bh'],
    ['nlab-batch', 'nlb-coherent-sheaf'],
    ['mathlib-batch', 'ml-hasringhomproperty'],
    ['unsolved-batch', 'cn-hodge'],
    ['wikipedia-batch', 'cn-collatz'],
    ['proofs-batch', 'tensor-right-exact'],
  ]
  const found = probes.filter(([, id]) => text.includes(id)).map(([name]) => name)

  return { file: js.f, sizeBytes: js.size, found }
}

function lintCounts() {
  try {
    const out = execFileSync('npx', ['eslint', '.', '--ext', '.js,.mjs', '-f', 'json'], {
      cwd: ROOT,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
      maxBuffer: 64 * 1024 * 1024,
      shell: true,
    })
    const arr = JSON.parse(out)
    let errors = 0
    let warnings = 0
    for (const f of arr) {
      errors += f.errorCount
      warnings += f.warningCount
    }
    return { errors, warnings }
  } catch (e) {
    // eslint exits 1 when errors exist; stdout still has the report.
    try {
      const arr = JSON.parse(e.stdout || '[]')
      let errors = 0
      let warnings = 0
      for (const f of arr) {
        errors += f.errorCount
        warnings += f.warningCount
      }
      return { errors, warnings }
    } catch {
      return null
    }
  }
}

// ── G1 · source maps not published ─────────────────────────────────────────
{
  if (!exists('dist')) {
    record('G1', 'source map 不公开部署', 'TODO', 'dist/ 不存在，先 npm run build')
  } else {
    const maps = countSourceMaps()
    record(
      'G1',
      'source map 不公开部署',
      maps === 0 ? 'PASS' : 'FAIL',
      maps === 0 ? 'dist/ 内无 .map' : `dist/ 内仍有 ${maps} 个 .map（会被部署）`
    )
  }
}

// ── G2 · every verifier has a negative control on record ───────────────────
{
  const doc = read('docs/NEGATIVE-CONTROLS.md')
  const pkg = JSON.parse(read('package.json') || '{}')
  const verifiers = Object.entries(pkg.scripts || {})
    .filter(([k]) => /^verify:|^check-/.test(k))
    .map(([k]) => k)
  if (!doc) {
    record('G2', '每个 verify 脚本有负向对照', 'TODO', 'docs/NEGATIVE-CONTROLS.md 不存在')
  } else {
    // Only count entries under "## 已完成". A script merely NAMED somewhere in
    // the file is not covered — the first draft of the doc listed two scripts
    // under "待补" (to-do) and this check happily scored them as done, which is
    // the same false-green this project keeps hunting.
    const doneStart = doc.indexOf('## 已完成')
    const todoStart = doc.indexOf('## 待补')
    let doneSection = ''
    if (doneStart !== -1) {
      doneSection = doc.slice(doneStart, todoStart === -1 ? undefined : todoStart)
    }
    // Require the script name to appear as a heading-ish entry in that section.
    const missing = verifiers.filter((v) => !doneSection.includes(v))
    record(
      'G2',
      '每个 verify 脚本有负向对照',
      missing.length === 0 ? 'PASS' : 'FAIL',
      missing.length === 0
        ? `已完成段覆盖 ${verifiers.length} 个`
        : `缺 ${missing.length} 个：${missing.slice(0, 4).join(', ')}`
    )
  }
}

// ── G3 / G4 · main bundle gzip size ────────────────────────────────────────
{
  const m = measureMainBundle()
  if (!m) {
    record('G3', '主包 gzip ≤ 1500 KB', 'TODO', 'dist/ 不存在')
    record('G4', '主包 gzip ≤ 1000 KB', 'TODO', 'dist/ 不存在')
  } else {
    const kb = Math.round(m.largest.gzip / 1024)
    record('G3', '主包 gzip ≤ 1500 KB', kb <= 1500 ? 'PASS' : 'FAIL', `${kb} KB（${m.largest.name}）`)
    record('G4', '主包 gzip ≤ 1000 KB', kb <= 1000 ? 'PASS' : 'FAIL', `${kb} KB`)
  }
}

// ── G5 · data loaded on demand ─────────────────────────────────────────────
{
  const m = mainBundleContainsExtraData()
  if (!m) {
    record('G5', '数据按需加载', 'TODO', 'dist/ 不存在')
  } else {
    const mb = (m.sizeBytes / 1024 / 1024).toFixed(1)
    // 只看真实节点 id 是否出现。体积不再单独作为判据：主包里还有证明数据
    // 等尚未外置的内容，"体积大"不等于"这些批次被内联"，把两件事混在一个
    // 目标里会让判定受另一个目标影响。
    const pass = m.found.length === 0
    record(
      'G5',
      '数据按需加载',
      pass ? 'PASS' : 'FAIL',
      pass
        ? `主包 ${mb} MB，不含任何批次数据（已外置到 public/data/）`
        : `主包 ${mb} MB，仍内联：${m.found.join(', ')}`
    )
  }
}

// ── G6 · first frame bakes only what is visible ────────────────────────────
// ── G6 · first frame must not wait for the full bake ──────────────────────
{
  // 判据基于实测（docs/perf-baseline.json，由 npm run measure:first-paint 生成），
  // 而不是"代码里出现了某个变量名"这种自欺式的检查。
  //
  // 达标条件：首帧（splash 消失）明显早于烘焙结束，即
  //     fullBakeMs - firstVisibleMs >= 5000
  // 也就是说，用户看到内容时，至少还有 5 秒的烘焙工作留在后面跑。
  // 如果两者相差无几，说明首帧仍在等全部烘焙 —— 那正是要解决的问题本身。
  const base = read('docs/perf-baseline.json')
  if (!base) {
    record('G6', '首屏只烘焙可见公式', 'TODO', '无测量基线：先跑 npm run measure:first-paint（约 1–4 分钟）')
  } else {
    let b
    try {
      b = JSON.parse(base)
    } catch {
      b = null
    }
    if (!b || typeof b.fullBakeMs !== 'number' || typeof b.firstVisibleMs !== 'number') {
      record('G6', '首屏只烘焙可见公式', 'TODO', '基线文件缺少 firstVisibleMs / fullBakeMs')
    } else {
      const gap = b.fullBakeMs - b.firstVisibleMs
      const pass = gap >= 5000
      record(
        'G6',
        '首屏只烘焙可见公式',
        pass ? 'PASS' : 'FAIL',
        pass
          ? `首帧 ${(b.firstVisibleMs / 1000).toFixed(1)}s，烘焙 ${(b.fullBakeMs / 1000).toFixed(1)}s，差 ${(gap / 1000).toFixed(1)}s`
          : `首帧 ${(b.firstVisibleMs / 1000).toFixed(1)}s 几乎等于烘焙完成 ${(b.fullBakeMs / 1000).toFixed(1)}s（差 ${(gap / 1000).toFixed(1)}s）——首帧仍在等全部烘焙`
      )
    }
  }
}

// ── G7 · TTI ───────────────────────────────────────────────────────────────
record('G7', 'TTI ≤ 15 秒', 'TODO', '依赖 G6 的可信测量，当前无可比基线')

// ── G8 / G9 · core module unit tests ───────────────────────────────────────
{
  // G9 originally pointed at src/layout.js, which does not exist — the layout
  // is `layoutGraph()` inside src/graph.js. Judging by "a test file imports the
  // module" is too weak here, because tests/graph/unit.test.mjs would satisfy
  // it for G8 and G9 simultaneously without ever touching the layout. So G9
  // additionally requires that the test actually calls layoutGraph().
  const testFilesImporting = (relPath) => {
    const dir = path.join(ROOT, 'tests')
    if (!fs.existsSync(dir)) return null
    const wanted = relPath.replace(/\\/g, '/')
    const hits = []
    const walk = (d) => {
      for (const e of fs.readdirSync(d, { withFileTypes: true })) {
        const p = path.join(d, e.name)
        if (e.isDirectory()) walk(p)
        else if (/\.(mjs|js)$/.test(e.name)) {
          const body = fs.readFileSync(p, 'utf8')
          if (body.includes(`src/${wanted}`) || body.includes(`/${wanted}`)) {
            hits.push({ file: p, body })
          }
        }
      }
    }
    walk(dir)
    return hits
  }

  for (const [id, label, rel, mustCall] of [
    ['G8', 'src/graph.js 有单元测试', 'graph.js', 'buildGraph'],
    ['G9', '星云布局(layoutGraph)有单元测试', 'graph.js', 'layoutGraph'],
  ]) {
    const hits = testFilesImporting(rel)
    if (hits === null) {
      record(id, label, 'FAIL', 'tests/ 目录不存在')
    } else if (hits.length === 0) {
      record(id, label, 'FAIL', `没有任何测试 import src/${rel}`)
    } else {
      const calling = hits.filter((h) => h.body.includes(mustCall))
      if (calling.length === 0) {
        record(id, label, 'FAIL', `测试 import 了 src/${rel} 但从未调用 ${mustCall}()`)
      } else {
        record(id, label, 'PASS', path.relative(ROOT, calling[0].file).replace(/\\/g, '/'))
      }
    }
  }
}

// ── G10 · lint warnings ────────────────────────────────────────────────────
{
  const l = lintCounts()
  if (!l) {
    record('G10', 'lint warnings ≤ 200', 'TODO', 'eslint 运行失败')
  } else {
    record('G10', 'lint warnings ≤ 200', l.warnings <= 200 ? 'PASS' : 'FAIL', `${l.errors} 错 / ${l.warnings} 警`)
  }
}

// ── report ─────────────────────────────────────────────────────────────────
const pass = results.filter((r) => r.status === 'PASS').length
const total = results.length

if (AS_JSON) {
  console.log(JSON.stringify({ score: pass, total, results }, null, 2))
  process.exit(0)
}

console.log('\n═══ 自进化进度 ═══\n')
for (const r of results) {
  const tag = r.status === 'PASS' ? 'PASS' : r.status === 'FAIL' ? 'FAIL' : 'TODO'
  console.log(`  [${tag}] ${r.id.padEnd(3)} ${r.title.padEnd(26)} ${r.detail}`)
}
console.log(`\n  得分：${pass}/${total}`)
const todo = results.filter((r) => r.status === 'TODO').length
const fail = results.filter((r) => r.status === 'FAIL').length
console.log(`  ${pass} 达标 / ${fail} 未达标 / ${todo} 待建测量\n`)
