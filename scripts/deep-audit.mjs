/**
 * 深挖：把所有抓到的维基正文再筛一遍，找"2015 年以后被解决"的线索，
 * 并核对关键外部引用是否真实存在。
 *
 * ── 为什么需要这一步 ──
 * 上一轮只筛了"提到 2024+"的句子，但那会漏掉 2015–2023 之间的结果
 * （比如一个 2018 年的证明足以让 status 从 open 变成 proved）。
 * 这一轮把窗口放宽到 2015+，并补做三件事：
 *   A. 关键外部引用是否真实存在（独立信源，不看维基自己怎么说）
 *   B. 几个条目名不确定的猜想，用维基检索找正确条目
 *   C. 逐条列出"2015 年以后 + 解决/仍未解决"的句子，人工判断
 *   D. 34 条 open 里哪些仍出现在维基「未解决问题列表」中
 *
 * 判据的强弱要分清：
 *   · A 最强 —— 外部站点真实存在且标题吻合，伪造者不会连 arXiv 编号都编对
 *   · D 中等 —— 在"未解决"列表里说明仍开放；**不在**列表里不能反推已解决
 *     （那个列表本来就不全），所以 D 的阴性结果不作为证据。
 */
import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

if (!process.env.HTTPS_PROXY && !process.env.https_proxy) {
  console.error('需要代理：HTTPS_PROXY=http://127.0.0.1:7890  NODE_USE_ENV_PROXY=1')
  process.exit(1)
}
const ROOT = path.resolve(import.meta.dirname, '..')
const raw = JSON.parse(readFileSync(path.join(ROOT, '.research/raw.json'), 'utf8'))
const mod = await import(pathToFileURL(path.join(ROOT, 'src/data/conjectures.js')).href)
const nodes = mod.CONJECTURE_NODES
const UA = { 'User-Agent': 'formula-nebula-research/1.0 (local; deep audit)' }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function get(u, tries = 4) {
  let wait = 2500
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(u, { headers: UA })
      if (r.status === 429) { await sleep(wait); wait *= 1.9; continue }
      return { status: r.status, body: await r.text() }
    } catch (e) {
      if (i === tries - 1) return { status: 0, body: '', err: e.message }
      await sleep(wait); wait *= 1.9
    }
  }
  return { status: 429, body: '' }
}

/* ───────── A. 关键外部引用是否真实存在 ───────── */
console.log('='.repeat(78))
console.log('A. 关键外部引用真实性（独立于维基）')
console.log('='.repeat(78))
const REFS = [
  ['Tao 博客：雅可比反例', 'https://terrytao.wordpress.com/2026/07/21/a-digestion-of-the-jacobian-conjecture-counterexample/'],
  ['Anthropic：黎曼 zeta 结果', 'https://www.anthropic.com/research/riemann-zeta'],
  ['OpenAI：Navier–Stokes 声明', 'https://openai.com/index/navier-stokes-solution/'],
]
for (const [label, u] of REFS) {
  const r = await get(u, 2)
  const title = ((r.body || '').match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || ''
  console.log(`\n  HTTP ${r.status || r.err}  ${label}`)
  console.log(`    ${title.replace(/\s+/g, ' ').trim().slice(0, 150) || '(拿不到标题)'}`)
  await sleep(1500)
}

/* ───────── B. 条目名不确定的，用维基检索找 ───────── */
console.log('\n\n' + '='.repeat(78))
console.log('B. 维基检索：条目名不确定的几条')
console.log('='.repeat(78))
const SEARCHES = [
  ['cn-lusztig', 'Lusztig conjecture algebraic groups characteristic p irreducible characters'],
  ['cn-howe', 'Howe conjecture multiplicity free dual pair reductive'],
  ['cn-hsiang', 'Hsiang Lawson conjecture minimal hypersurface sphere'],
  ['cn-hartshorne-ample', 'Hartshorne conjecture ample vector bundle'],
  ['cn-artin', 'Artin conjecture L-function entire'],
]
for (const [id, q] of SEARCHES) {
  const r = await get(`https://en.wikipedia.org/w/api.php?action=query&list=search&srlimit=5&format=json&srsearch=${encodeURIComponent(q)}`)
  let j = {}
  try { j = JSON.parse(r.body) } catch { /* ignore */ }
  console.log(`\n[${id}]  ${q}`)
  const found = j.query?.search || []
  if (!found.length) console.log('   （无结果 / 请求失败）')
  for (const s of found) {
    const sn = (s.snippet || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
    console.log(`   · ${s.title}   [${s.wordcount} 词]`)
    console.log(`     ${sn.slice(0, 190)}`)
  }
  await sleep(1600)
}

/* ───────── C. 2015 年以后的"解决"线索 ───────── */
console.log('\n\n' + '='.repeat(78))
console.log('C. 2015 年以后的解决/未解决线索（逐条）')
console.log('='.repeat(78))
const YEAR = /\b20(1[5-9]|2[0-6])\b/
const RES = /(prov|disprov|solv|settl|resolv|refut|counterexample|remains? open|still open|unsolved|no known proof)/i
let flagged = 0
for (const n of nodes) {
  const v = raw[n.id]
  if (!v?.text) continue
  const ss = v.text.replace(/\s+/g, ' ').split(/(?<=[.!?])\s+(?=[A-Z(])/)
  const hits = ss.filter((s) => YEAR.test(s) && RES.test(s) && s.length > 40 && s.length < 600)
  if (!hits.length) continue
  flagged++
  console.log(`\n── ${n.id}  [${n.status}]  ${n.name}    (维基: ${v.resolved})`)
  for (const s of hits.slice(0, 4)) console.log('   * ' + s.trim().slice(0, 250))
}
console.log(`\n共 ${flagged} 条有 2015+ 的解决线索`)

/* ───────── D. open 的是否仍在"未解决问题"列表里 ───────── */
console.log('\n\n' + '='.repeat(78))
console.log('D. open 的条目与维基「未解决问题列表」对照')
console.log('='.repeat(78))
let listPage = ''
for (const v of Object.values(raw)) {
  if (/^List of unsolved problems in mathematics$/.test(v.resolved || '')) { listPage = v.text; break }
}
if (!listPage) console.log('（没抓到该列表页）')
else {
  const low = listPage.toLowerCase()
  const open = nodes.filter((n) => n.status === 'open')
  const inList = [], notIn = []
  for (const n of open) {
    const k = (n.en || '').replace(/\s*(conjecture|hypothesis|problem|theorem)s?\s*$/i, '').trim().toLowerCase()
    if (k.length >= 5 && low.includes(k)) inList.push(n); else notIn.push(n)
  }
  console.log(`\n在列表中（= 仍算未解决）: ${inList.length} / ${open.length}`)
  for (const n of inList) console.log('   ✓ ' + n.id.padEnd(24) + n.name)
  console.log(`\n未出现（列表不全，**不能**反推已解决）: ${notIn.length}`)
  for (const n of notIn) console.log('   ? ' + n.id.padEnd(24) + n.name + '  / ' + n.en)
}
writeFileSync(path.join(ROOT, '.research/deep-audit.txt'), 'done', 'utf8')
