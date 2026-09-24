/**
 * 定向核对：几个"可能已变"但上一步没查清的条目。
 *
 * 这一步存在的理由：上一步用 generator=search 自动找条目，有几条落到了
 * **不相干的页面**上（cn-lusztig 落到 "Kazhdan–Lusztig polynomial"，
 * cn-howe 落到 "Reductive dual pair"，cn-hsiang 落到 "Minimal surface"）。
 * 拿这些页面的正文判断 status 是无效的 —— "这一页没说它被证明" 不等于
 * "它没被证明"。所以这里用**明确的检索式**重新定位，并打印命中的段落。
 *
 * 同时把上一步被截断的"A. 关键外部引用真实性"重跑一遍：
 * 那三条引用（Tao 博客 / Anthropic / OpenAI）如果真实存在，说明
 * 2026 年那些惊人说法不是维基被破坏 —— 伪造者不会连外部站点一起建。
 */
import path from 'node:path'

if (!process.env.HTTPS_PROXY && !process.env.https_proxy) {
  console.error('需要代理：HTTPS_PROXY=http://127.0.0.1:7890  NODE_USE_ENV_PROXY=1')
  process.exit(1)
}
const UA = { 'User-Agent': 'formula-nebula-research/1.0 (local; targeted check)' }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function get(u, tries = 4) {
  let wait = 2500
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(u, { headers: UA })
      if (r.status === 429) { await sleep(wait); wait *= 1.9; continue }
      return { status: r.status, body: await r.text(), url: r.url }
    } catch (e) {
      if (i === tries - 1) return { status: 0, body: '', err: e.message }
      await sleep(wait); wait *= 1.9
    }
  }
  return { status: 429, body: '' }
}

/* ── A. 外部引用真实性（这是最强的一类证据）── */
console.log('='.repeat(78))
console.log('A. 外部引用是否真实存在')
console.log('='.repeat(78))
const REFS = [
  ['Tao 博客 · 雅可比反例', 'https://terrytao.wordpress.com/2026/07/21/a-digestion-of-the-jacobian-conjecture-counterexample/'],
  ['Anthropic · 黎曼 zeta', 'https://www.anthropic.com/research/riemann-zeta'],
  ['OpenAI · Navier–Stokes', 'https://openai.com/index/navier-stokes-solution/'],
  ['Guardian · OpenAI 报道', 'https://www.theguardian.com/science/2026/sep/08/openai-claims-to-have-solved-maths-problem-that-stumped-humans-for-decades'],
]
for (const [label, u] of REFS) {
  const r = await get(u, 2)
  const t = ((r.body || '').match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || ''
  const desc = ((r.body || '').match(/<meta[^>]+(?:property|name)=["'](?:og:description|description)["'][^>]+content=["']([^"']{0,300})/i) || [])[1] || ''
  console.log(`\n  HTTP ${r.status || r.err}   ${label}`)
  console.log(`    标题: ${t.replace(/\s+/g, ' ').trim().slice(0, 140) || '(无)'}`)
  if (desc) console.log(`    摘要: ${desc.replace(/\s+/g, ' ').trim().slice(0, 240)}`)
  await sleep(1500)
}

/* ── B. 重新定位几个条目 ── */
console.log('\n\n' + '='.repeat(78))
console.log('B. 用精确检索式重新定位条目')
console.log('='.repeat(78))

async function search(q, limit = 6) {
  const r = await get(`https://en.wikipedia.org/w/api.php?action=query&list=search&srlimit=${limit}&format=json&srsearch=${encodeURIComponent(q)}`)
  try { return JSON.parse(r.body).query?.search || [] } catch { return [] }
}
async function extract(title) {
  const r = await get(`https://en.wikipedia.org/w/api.php?action=query&prop=extracts&explaintext=1&redirects=1&format=json&titles=${encodeURIComponent(title)}`)
  try {
    const p = Object.values(JSON.parse(r.body).query?.pages || {})[0]
    return p?.extract || ''
  } catch { return '' }
}

const QUERIES = [
  ['cn-lusztig', 'insource:"Lusztig\'s conjecture" representation theory algebraic groups'],
  ['cn-howe', 'insource:"Howe conjecture" OR insource:"Howe duality conjecture" multiplicity'],
  ['cn-hsiang', 'insource:"Hsiang" OR insource:"Lawson conjecture" minimal hypersurface'],
  ['cn-connes-rigidity', 'insource:"Connes rigidity" OR insource:"rigidity conjecture" group von Neumann'],
  ['cn-abc', 'abc conjecture Mochizuki status'],
]
for (const [id, q] of QUERIES) {
  console.log(`\n── ${id}\n   检索: ${q}`)
  const res = await search(q)
  for (const s of res) {
    const sn = (s.snippet || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
    console.log(`   · ${s.title}   [${s.wordcount} 词]`)
    console.log(`     ${sn.slice(0, 200)}`)
  }
  await sleep(1600)
}

/* ── C. 对上面找到的正确定位，打印相关段落 ── */
console.log('\n\n' + '='.repeat(78))
console.log('C. 相关段落')
console.log('='.repeat(78))
const PAGES = [
  ['cn-lusztig', "Lusztig's conjecture"],
  ['cn-howe', 'Howe duality'],
  ['cn-hsiang', 'Yau\'s conjecture'],
  ['cn-connes-rigidity', 'Connes rigidity conjecture'],
]
for (const [id, title] of PAGES) {
  const t = await extract(title)
  console.log(`\n── ${id}  ← "${title}"  (${t.length} 字符)`)
  if (!t) { console.log('   （无正文）'); await sleep(1400); continue }
  const ss = t.replace(/\s+/g, ' ').split(/(?<=[.!?])\s+(?=[A-Z(])/)
  const key = /(conjectur|proved|proof|open|unknown|remains|disprov|counterexample|characteristic|multiplicity)/i
  for (const s of ss.filter((s) => key.test(s) && s.length > 40 && s.length < 400).slice(0, 10)) {
    console.log('   * ' + s.trim())
  }
  await sleep(1400)
}
