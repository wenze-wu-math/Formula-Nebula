/**
 * 核对 59 条猜想的最新状态 —— 抓取阶段。
 *
 * ── 为什么必须联网核对，不能凭记忆改 ──
 * 当前系统日期是 2026-09。抓 Kakeya 时维基百科原文写着：
 *   "in 2026 Hong Wang was awarded the Fields Medal in part due to this work"
 * 也就是说**在我的训练数据之后还发生了事**。凭记忆改 status 极可能写错，
 * 而 README 里明确写了"status 必须真实，这个项目的诚实性靠它"。
 *
 * ── 网络环境（踩过的坑）──
 * 本会话 web_search / web_fetch 工具都坏了（401 / 非公网 IP 拦截），
 * 但系统网络通 —— 只是 Node fetch 默认不走代理：
 *   · PowerShell 走系统代理 → 200
 *   · Node fetch 直连 wikipedia → CONNECT_TIMEOUT，arxiv → ECONNRESET
 *   · Node fetch 直连 example.com → 200（假象！）
 * 系统里跑着 127.0.0.1:7890（Clash）。解法：HTTPS_PROXY + NODE_USE_ENV_PROXY=1。
 *
 * 上一版一次连发 8 个请求后被 429 限流，所以这版加了退避重试。
 */
import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

if (!process.env.HTTPS_PROXY && !process.env.https_proxy) {
  console.error('需要代理：HTTPS_PROXY=http://127.0.0.1:7890  NODE_USE_ENV_PROXY=1')
  process.exit(1)
}

const ROOT = path.resolve(import.meta.dirname, '..')
const OUT = path.join(ROOT, '.research')
mkdirSync(OUT, { recursive: true })

const mod = await import(pathToFileURL(path.join(ROOT, 'src/data/conjectures.js')).href)
const NODES = mod.CONJECTURE_NODES

const UA = { 'User-Agent': 'formula-nebula-research/1.0 (local project; conjecture status audit)' }

/* 维基条目名覆盖表。
 * 自动搜索对某些条目会跑偏（比如搜 "Howe conjecture" 会落到别的东西），
 * 所以能确定的就写死。 */
const TITLE_OVERRIDE = {
  'cn-hodge': 'Hodge conjecture',
  'cn-tate': 'Tate conjecture',
  'cn-standard': 'Standard conjectures on algebraic cycles',
  'cn-canonical-model': 'Minimal model program',
  'cn-resolution-charp': 'Resolution of singularities',
  'cn-rationally-connected': 'Rationally connected variety',
  'cn-fujita': 'Fujita conjecture',
  'cn-zariski-lipman': 'Zariski–Lipman conjecture',
  'cn-linearization': 'Linearization conjecture',
  'cn-jacobian': 'Jacobian conjecture',
  'cn-hartshorne-ample': "Hartshorne's conjecture",
  'cn-riemann': 'Riemann hypothesis',
  'cn-grh': 'Generalized Riemann hypothesis',
  'cn-bsd': 'Birch and Swinnerton-Dyer conjecture',
  'cn-abc': 'abc conjecture',
  'cn-collatz': 'Collatz conjecture',
  'cn-szpiro': 'Szpiro conjecture',
  'cn-schanuel': 'Schanuel conjecture',
  'cn-novikov': 'Novikov conjecture',
  'cn-borel': 'Borel conjecture',
  'cn-farrell-jones': 'Farrell–Jones conjecture',
  'cn-four-dim-poincare': 'Generalized Poincaré conjecture',
  'cn-navier-stokes': 'Navier–Stokes existence and smoothness',
  'cn-yang-mills': 'Yang–Mills existence and mass gap',
  'cn-lusin': 'Carleson–Hunt theorem',
  'cn-connes-rigidity': 'Connes rigidity conjecture',
  'cn-baum-connes': 'Baum–Connes conjecture',
  'cn-idempotent': 'Idempotent conjecture',
  'cn-kadison-kaplansky': 'Kadison–Kaplansky conjecture',
  'cn-lagarias': 'Lagarias criterion',
  'cn-sat': 'P versus NP problem',
  'cn-bass': 'Bass conjecture',
  'cn-zero-divisor': 'Zero divisor conjecture',
  'cn-group-iso': 'Group isomorphism problem',
  'cn-goldbach': 'Goldbach conjecture',
  'cn-twin-prime': 'Twin prime conjecture',
  'cn-hsiang': 'Minimal surface',
  'cn-kakeya': 'Kakeya set',
  'cn-restriction': 'Restriction conjecture',
  'cn-bochner-riesz': 'Bochner–Riesz conjecture',
  'cn-langlands-functoriality': 'Langlands program',
  'cn-artin': 'Artin conjecture',
  'cn-gross-prasad': 'Gan–Gross–Prasad conjecture',
  'cn-continuum': 'Continuum hypothesis',
  'cn-yau-tian': 'Yau–Tian conjecture',
  'cn-sato-tate': 'Sato–Tate conjecture',
  'cn-fermat': "Fermat's Last Theorem",
  'cn-mordell': "Mordell's theorem",
  'cn-class-number': 'Class number problem',
  'cn-poincare': 'Poincaré conjecture',
  'cn-geometrization': 'Geometrization conjecture',
  'cn-thurston-norm': 'Thurston norm',
  'cn-virtual-fibering': 'Virtual fibering conjecture',
  'cn-finite-simple': 'Classification of finite simple groups',
  'cn-kazhdan-lusztig': 'Kazhdan–Lusztig conjecture',
  'cn-lusztig': 'Lusztig conjecture',
  'cn-howe': 'Howe duality',
  'cn-modularity': 'Modularity theorem',
  'cn-novikov-word': 'Dehn twist',
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function api(params, tries = 5) {
  const qs = new URLSearchParams({ format: 'json', ...params })
  const u = `https://en.wikipedia.org/w/api.php?${qs}`
  let wait = 1500
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(u, { headers: UA })
      if (r.status === 429) {
        console.log(`    429，等 ${wait}ms 重试…`)
        await sleep(wait)
        wait *= 2
        continue
      }
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      return await r.json()
    } catch (e) {
      if (i === tries - 1) throw e
      await sleep(wait)
      wait *= 2
    }
  }
  throw new Error('重试耗尽')
}

function extractOf(json) {
  const pages = json.query?.pages || {}
  return Object.values(pages)
    .map((p) => p.extract || '')
    .filter(Boolean)
    .join('\n')
}

/* 用 generator=search 让维基自己找最相关的条目，一次调用同时拿到
 * 标题、链接和正文 —— 比先搜再取省一半请求（上一版就是被限流卡住的）。 */
async function fetchOne(node) {
  const title = TITLE_OVERRIDE[node.id] || node.en || node.name
  const j = await api({
    action: 'query',
    generator: 'search',
    gsrsearch: title,
    gsrlimit: 1,
    prop: 'extracts',
    explaintext: 1,
    redirects: 1,
  })
  const pages = j.query?.pages || {}
  const first = Object.values(pages)[0]
  return { query: title, resolved: first?.title || '', text: extractOf(j) }
}

const cacheFile = path.join(OUT, 'raw.json')
const cache = existsSync(cacheFile) ? JSON.parse(readFileSync(cacheFile, 'utf8')) : {}

let done = 0
for (const n of NODES) {
  if (cache[n.id]?.text) { done++; continue }
  process.stdout.write(`[${String(done + 1).padStart(2)}/${NODES.length}] ${n.id.padEnd(24)} `)
  try {
    const r = await fetchOne(n)
    cache[n.id] = { ...r, status: n.status, name: n.name, en: n.en }
    console.log(`${r.resolved}  (${r.text.length})`)
  } catch (e) {
    console.log(`FAIL ${e.message}`)
  }
  writeFileSync(cacheFile, JSON.stringify(cache, null, 1), 'utf8')
  done++
  await sleep(1100)
}
const ok = Object.values(cache).filter((v) => v.text).length
console.log(`\n${ok}/${NODES.length} 抓到 → .research/raw.json`)
