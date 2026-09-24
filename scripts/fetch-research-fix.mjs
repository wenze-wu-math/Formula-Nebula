/**
 * 补抓：上一轮 429 失败的 3 条 + 解析到错误条目的若干条。
 *
 * 为什么要单独一个脚本：`fetch-research.mjs` 用 generator=search 自动找条目，
 * 有几个跑偏了（搜 "Howe conjecture" 落到 429，搜 "Lusztig conjecture"
 * 落到 Kazhdan–Lusztig polynomial —— 那是**另一个**猜想）。这些必须
 * 用**精确标题**直接取，不能再让搜索猜。
 */
import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

if (!process.env.HTTPS_PROXY && !process.env.https_proxy) {
  console.error('需要代理：HTTPS_PROXY=http://127.0.0.1:7890  NODE_USE_ENV_PROXY=1')
  process.exit(1)
}
const OUT = path.resolve(import.meta.dirname, '../.research')
mkdirSync(OUT, { recursive: true })
const UA = { 'User-Agent': 'formula-nebula-research/1.0 (local project; conjecture status audit)' }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

/* 精确标题 —— 这些不再走搜索，直接取正文 */
const EXACT = {
  'cn-fermat': "Fermat's Last Theorem",
  'cn-baum-connes': 'Baum–Connes conjecture',
  'cn-howe': 'Howe duality',
  'cn-lusztig': 'Lusztig conjecture',
  'cn-hartshorne-ample': 'Hartshorne conjecture',
  'cn-connes-rigidity': 'Connes embedding problem',
  'cn-novikov-word': 'Word problem for groups',
  'cn-group-iso': 'Group isomorphism problem',
  'cn-artin': 'Artin L-function',
  'cn-hsiang': 'Hsiang–Lawson conjecture',
  'cn-lagarias': 'Lagarias criterion',
  'cn-canonical-model': 'Minimal model program',
  'cn-resolution-charp': 'Resolution of singularities',
  'cn-cn-rationally-connected': 'Rationally connected variety',
  'cn-jacobian': 'Jacobian conjecture',
  'cn-linearization': 'Linearization conjecture',
  'cn-zero-divisor': 'Zero-divisor conjecture',
  'cn-idempotent': 'Idempotent conjecture',
  'cn-kadison-kaplansky': 'Kadison–Kaplansky conjecture',
  'cn-bass': 'Bass conjecture',
  'cn-fujita': 'Fujita conjecture',
  'cn-zariski-lipman': 'Zariski–Lipman conjecture',
  'cn-standard': 'Standard conjectures on algebraic cycles',
  'cn-gross-prasad': 'Gan–Gross–Prasad conjecture',
  'cn-schanuel': 'Schanuel conjecture',
  'cn-lusin': 'Carleson–Hunt theorem',
  'cn-bochner-riesz': 'Bochner–Riesz conjecture',
  'cn-restriction': 'Restriction conjecture',
  'cn-rationally-connected': 'Rationally connected variety',
}

async function exact(title, tries = 6) {
  const qs = new URLSearchParams({
    action: 'query', prop: 'extracts', explaintext: 1, redirects: 1,
    format: 'json', titles: title,
  })
  let wait = 2000
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(`https://en.wikipedia.org/w/api.php?${qs}`, { headers: UA })
      if (r.status === 429) { await sleep(wait); wait *= 1.8; continue }
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      const j = await r.json()
      const pages = j.query?.pages || {}
      const p = Object.values(pages)[0]
      return { resolved: p?.title || '', missing: !!p?.missing, text: p?.extract || '' }
    } catch (e) {
      if (i === tries - 1) throw e
      await sleep(wait); wait *= 1.8
    }
  }
  throw new Error('重试耗尽')
}

const cacheFile = path.join(OUT, 'raw.json')
const cache = existsSync(cacheFile) ? JSON.parse(readFileSync(cacheFile, 'utf8')) : {}

let ok = 0
for (const [id, title] of Object.entries(EXACT)) {
  process.stdout.write(`${id.padEnd(24)} ${title.padEnd(42)} `)
  try {
    const r = await exact(title)
    if (r.missing || !r.text) { console.log('条目不存在/无正文'); }
    else {
      cache[id] = { ...(cache[id] || {}), query: title, resolved: r.resolved, text: r.text, exact: true }
      console.log(`OK ${r.resolved} (${r.text.length})`)
      ok++
    }
  } catch (e) { console.log('FAIL ' + e.message) }
  writeFileSync(cacheFile, JSON.stringify(cache, null, 1), 'utf8')
  await sleep(1600)
}
console.log(`\n补抓成功 ${ok}，总计 ${Object.values(cache).filter((v) => v.text).length} 条有正文`)
