/**
 * kb-src/fetch-mathlib.mjs — 从 Lean mathlib4 抓取**形式化**条目。
 *
 * ═══ 这是知识库的第三个维度 ═══
 *
 *   Stacks  → 定理性（书面的、人工审阅的）
 *   nLab    → 概念性（wiki 散文）
 *   mathlib → **形式化**（Lean 4 机器验证，`--trust=0` 可重编译检查）
 *
 * 用户提出这个源的价值在于"形式化验证层"：
 * 如果某条知识在 mathlib 里，它的正确性不依赖人类共识，而依赖 Lean 内核。
 *
 * ═══ 能抽到什么（实测 Scheme.lean）═══
 *   ✅ 定理名（Lean 标识符，如 `AlgebraicGeometry.Scheme.Hom.continuous`）
 *   ✅ 类型签名（`{X Y : Scheme} (f : X ⟶ Y) : Continuous f`）
 *   ✅ docstring（`/-- ... -/` 里的自然语言说明，42 条 / 1014 行）
 *   ✅ 所在文件与 namespace（可定位）
 *   ❌ 中文陈述（需翻译，本脚本不编造）
 *
 * 用法：
 *   node kb-src/fetch-mathlib.mjs --limit 40
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const OUT = join(HERE, 'out')
const UA = 'FormulaNebula/1.0 (knowledge base builder)'

const argv = process.argv.slice(2)
const li = argv.indexOf('--limit')
const limit = li >= 0 ? Number(argv[li + 1]) : 40

/* ── 要抓的文件清单 ──
 * 用 GitHub 的 git/trees API 一次拿全树（比逐目录列举省配额）。
 * 若配额不足则退回预置清单。 */
/* 文件清单来自 git/trees API 的真实路径（kb-src/out/mathlib-tree.json）。
 * 之前靠猜文件名，17 个 404 —— 不要再猜。 */
const TREE_FILE = join(HERE, 'out', 'mathlib-tree.json')

function loadPreferred() {
  if (!existsSync(TREE_FILE)) {
    throw new Error('缺少 mathlib-tree.json，先运行 node kb-src/probe-mathlib-tree.mjs')
  }
  const tree = JSON.parse(readFileSync(TREE_FILE, 'utf8'))
  /* 优先抓「代数几何核心 + 范畴论/层论基础」，按体积从小到大（小文件定理密度高） */
  /* ═══ 采集范围（2026-11-02 扩大）═══
   *
   * 原来只收 5 个目录 → 110 个文件，而全仓有 9,303 个 .lean。
   * mathlib 是用户列为「形式化验证层唯一持久选择」的来源，覆盖率太低。
   *
   * 扩大后：1,452 个文件 / 15.6 MB。顺序即优先级（前面的先抓）。
   */
  /* ═══ 采集范围（2026-11-02 二次调整）═══
   *
   * 第一版只收 5 个目录 → 110 文件（覆盖太低）。
   * 第二版扩到 8 组 1,452 文件 → 2,639 条 mathlib 节点，
   *   但其中 1,807 条来自「范畴论基础」，与代数几何关系弱，
   *   且把节点总数推到 6,458，**布局耗时飙到 12.9 秒**（不可接受）。
   *
   * 第三版：收敛到**代数几何核心**，目标约 600-800 条 mathlib 节点。
   *   保留：AlgebraicGeometry 全目录（最核心）
   *        RingTheory 的 Localization/Ideal/Spectrum/Flat/Etale（概形的代数基础）
   *        CategoryTheory 的 Sites/Sheaves（层论）
   *        Geometry 的 RingedSpace
   *   去掉：范畴论基础（Limits/Adjunction/Monad/...）、AlgebraicTopology、Homology
   */
  const PREF = [
    /^Mathlib\/AlgebraicGeometry\//,
    /^Mathlib\/RingTheory\/(Localization|Ideal|LocalRing|Spectrum|Flat|Etale|Graded|Polynomial|FractionRing)/,
    /^Mathlib\/CategoryTheory\/(Sites|Sheaves)\//,
    /^Mathlib\/Geometry\/RingedSpace\//,
  ]
  const picked = []
  for (const re of PREF) {
    for (const f of tree.paths) {
      if (re.test(f.path) && !picked.some((x) => x.path === f.path)) picked.push(f)
    }
  }
  /* 排序策略：**大文件优先**。
   * 之前按体积升序抓，结果全是 2-3KB 的碎片文件（docstring 覆盖率仅 18%）。
   * 代数几何的实质内容在 Scheme.lean(38KB)、AffineScheme.lean(61KB) 这类大文件里。 */
  return picked.sort((a, b) => b.size - a.size).map((f) => f.path)
}

const PREFERRED = loadPreferred()

/* 双渠道：直连失败就走代理（用户环境代理在 127.0.0.1:7890）。
 * 不依赖 undici —— 用 Node 内置 http 手写 CONNECT 隧道，零新增依赖。 */
import http from 'node:http'
import tls from 'node:tls'

const PROXY_HOST = '127.0.0.1'
const PROXY_PORT = 7890

/** 经 HTTP 代理抓 HTTPS 页面（CONNECT 隧道） */
function fetchViaProxy(url, timeoutMs = 20000) {
  return new Promise((resolve, reject) => {
    const u = new URL(url)
    const ac = new AbortController()
    const timer = setTimeout(() => { ac.abort(); reject(new Error('timeout')) }, timeoutMs)

    const req = http.request({
      host: PROXY_HOST,
      port: PROXY_PORT,
      method: 'CONNECT',
      path: `${u.hostname}:443`,
      timeout: timeoutMs,
    })
    req.on('connect', (res, socket) => {
      if (res.statusCode !== 200) {
        clearTimeout(timer)
        reject(new Error(`CONNECT ${res.statusCode}`))
        return
      }
      const tlsSock = tls.connect({ socket, servername: u.hostname }, () => {
        const path = u.pathname + u.search
        tlsSock.write(
          `GET ${path} HTTP/1.1\r\nHost: ${u.hostname}\r\nUser-Agent: ${UA}\r\nConnection: close\r\n\r\n`,
        )
      })
      const chunks = []
      tlsSock.on('data', (c) => chunks.push(c))
      tlsSock.on('end', () => {
        clearTimeout(timer)
        const raw = Buffer.concat(chunks).toString('utf8')
        const sep = raw.indexOf('\r\n\r\n')
        const head = raw.slice(0, sep)
        const body = raw.slice(sep + 4)
        const m = /^HTTP\/1\.[01] (\d{3})/.exec(head)
        resolve({ status: m ? Number(m[1]) : 0, text: body })
      })
      tlsSock.on('error', (e) => { clearTimeout(timer); reject(e) })
    })
    req.on('error', (e) => { clearTimeout(timer); reject(e) })
    req.on('timeout', () => { clearTimeout(timer); req.destroy(); reject(new Error('proxy timeout')) })
    req.end()
  })
}

async function raw(path) {
  const url = `https://raw.githubusercontent.com/leanprover-community/mathlib4/master/${path}`

  /* 渠道 1：直连 */
  try {
    const ac = new AbortController()
    const t = setTimeout(() => ac.abort(), 15000)
    const r = await fetch(url, { headers: { 'User-Agent': UA }, signal: ac.signal })
    clearTimeout(t)
    if (r.status === 404) return { _fail: 'HTTP 404' }
    if (r.ok) return { text: await r.text(), via: 'direct' }
  } catch { /* 落下去试代理 */ }

  /* 渠道 2：代理 */
  try {
    const { status, text } = await fetchViaProxy(url)
    if (status === 404) return { _fail: 'HTTP 404' }
    if (status === 200) return { text, via: 'proxy' }
    return { _fail: `HTTP ${status}` }
  } catch (e) {
    return { _fail: `双渠道失败: ${e.message}` }
  }
}

mkdirSync(OUT, { recursive: true })
const dest = join(OUT, 'mathlib-files.json')
const store = existsSync(dest) ? JSON.parse(readFileSync(dest, 'utf8')) : {}

const todo = PREFERRED.filter((p) => !store[p]?.ok).slice(0, limit)
console.log(`待抓 ${todo.length} 个 Lean 文件`)

let ok = 0, fail = 0
for (const p of todo) {
  const r = await raw(p)
  if (r._fail) {
    fail++
    store[p] = { ok: false, _fail: r._fail }
    console.log(`  ✗ ${p.split('/').pop()} ${r._fail}`)
    continue
  }
  ok++
  store[p] = { ok: true, text: r.text }
  console.log(`  ✅ ${p.split('/').pop().padEnd(28)} ${r.text.length} 字节`)
  /* 对 GitHub 友好 */
  await new Promise((r2) => setTimeout(r2, 150))
}

writeFileSync(dest, JSON.stringify(store), 'utf8')
const good = Object.values(store).filter((x) => x.ok)
console.log(`\n完成：成功 ${ok}，失败 ${fail}，累计有效 ${good.length} 个文件 → ${dest}`)
console.log(`缓存大小 ${(Buffer.byteLength(JSON.stringify(store)) / 1024 / 1024).toFixed(1)} MB`)
