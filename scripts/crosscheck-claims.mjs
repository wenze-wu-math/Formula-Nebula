/**
 * 交叉验证：那些"2026 年 AI 证明/推翻了 XX"的说法可信吗？
 *
 * ── 为什么必须做这一步 ──
 * 抓下来的维基正文里出现了大量惊人说法，例如：
 *   · 2026-07-19 Levent Alpöge 给出雅可比猜想 n>2 的反例，归功于 "Claude Fable 5"
 *   · 2026-08 Anthropic 的模型证明 RH 至少 2/3 零点在临界线上
 *   · 2026-09-08 OpenAI 用一万个 AI agent 找到 Navier–Stokes 的有限时间奇点
 *   · 2026 Lech Mazur 用 "GPT-5.6 Pro" 解决 Sendov 猜想
 * 这些全部在我的训练数据之外。如果它们是**维基被破坏**或**代理返回了伪造内容**，
 * 我据此改 status 就等于往项目里写假数学 —— README 明确禁止这件事。
 *
 * ── 判据（三重独立核对）──
 *   ① 其他语种维基（de/zh/fr）是否有同样说法 —— 破坏通常只改一个语种
 *   ② arXiv API 是否能搜到对应论文 —— 真结果一般有预印本
 *   ③ 页面本身的最近修订时间 —— 若关键句子是"刚刚"加的，可疑
 *
 * 注意：本会话的 web_search / web_fetch 工具坏了，这里是直接用 Node fetch
 * 走系统代理（HTTPS_PROXY=127.0.0.1:7890 + NODE_USE_ENV_PROXY=1）。
 */
import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

if (!process.env.HTTPS_PROXY && !process.env.https_proxy) {
  console.error('需要代理：HTTPS_PROXY=http://127.0.0.1:7890  NODE_USE_ENV_PROXY=1')
  process.exit(1)
}
const ROOT = path.resolve(import.meta.dirname, '..')
const UA = { 'User-Agent': 'formula-nebula-research/1.0 (local; verifying claims)' }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function get(u, tries = 4) {
  let wait = 2000
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(u, { headers: UA })
      if (r.status === 429) { await sleep(wait); wait *= 1.8; continue }
      return { status: r.status, body: await r.text() }
    } catch (e) {
      if (i === tries - 1) return { status: 0, body: '', err: e.message }
      await sleep(wait); wait *= 1.8
    }
  }
  return { status: 429, body: '' }
}

/* 待核的"惊人说法"：id → 关键词（用来在其他语种里找同一句） */
const CLAIMS = [
  { id: 'cn-jacobian', title: 'Jacobian conjecture', claims: ['Alpöge', '2026', 'counterexample', 'Claude', 'n > 2', 'three variables'] },
  { id: 'cn-riemann', title: 'Riemann hypothesis', claims: ['2026', 'two-thirds', 'Claude', 'Anthropic', 'critical line'] },
  { id: 'cn-navier-stokes', title: 'Navier–Stokes existence and smoothness', claims: ['2026', 'OpenAI', 'singularity', 'Lean', 'agent'] },
  { id: 'cn-collatz', title: 'Collatz conjecture', claims: ['2026', 'Lean', 'Nanoda', 'disproof', 'invalid'] },
  { id: 'cn-kakeya', title: 'Kakeya set', claims: ['2025', 'Wang', 'Zahl', 'three-dimensional', 'Fields Medal', '2026'] },
]

const out = []

/* ① 各语种维基是否都写了这件事 */
const LANGS = ['en', 'de', 'zh', 'fr', 'ja']
for (const c of CLAIMS) {
  console.log(`\n${'='.repeat(74)}\n### ${c.id}   ${c.title}\n${'='.repeat(74)}`)
  for (const lang of LANGS) {
    const u = `https://${lang}.wikipedia.org/w/api.php?action=query&prop=extracts|revisions&explaintext=1&redirects=1&rvprop=timestamp|user&rvlimit=1&format=json&titles=${encodeURIComponent(c.title)}`
    const r = await get(u)
    let text = '', rev = null
    try {
      const j = JSON.parse(r.body)
      const p = Object.values(j.query?.pages || {})[0]
      text = p?.extract || ''
      rev = p?.revisions?.[0] || null
    } catch { /* ignore */ }
    if (!text) { console.log(`  [${lang}] 无此条目`); await sleep(700); continue }
    const found = c.claims.filter((k) => text.includes(k))
    const years = [...new Set((text.match(/\b(202[4-9])\b/g) || []))].sort()
    console.log(`  [${lang}] ${text.length} 字符 | 末次修订 ${rev?.timestamp || '?'} by ${rev?.user || '?'}`)
    console.log(`        命中关键词: ${found.length ? found.join(', ') : '（无）'}   出现的年份: ${years.join(' ') || '（无 2024+）'}`)
    out.push({ id: c.id, lang, len: text.length, rev, found, years })
    await sleep(700)
  }
}

/* ② arXiv 能否搜到对应论文 */
console.log(`\n\n${'='.repeat(74)}\n### arXiv 检索（独立于维基）\n${'='.repeat(74)}`)
const QUERIES = [
  ['jacobian-alpoge', 'all:"Jacobian conjecture" AND all:Alpoge'],
  ['jacobian-counterexample', 'ti:"Jacobian conjecture" AND abs:counterexample'],
  ['kakeya-3d', 'ti:"Kakeya" AND au:Zahl'],
  ['riemann-66', 'abs:"Riemann zeta" AND abs:"critical line" AND abs:"two-thirds"'],
  ['navier-stokes-singularity', 'ti:"Navier-Stokes" AND abs:singularity AND abs:2026'],
]
const arxivOut = {}
for (const [tag, q] of QUERIES) {
  const u = `http://export.arxiv.org/api/query?search_query=${encodeURIComponent(q)}&start=0&max_results=5&sortBy=submittedDate&sortOrder=descending`
  const r = await get(u)
  const entries = []
  for (const m of (r.body || '').matchAll(/<entry>([\s\S]*?)<\/entry>/g)) {
    const e = m[1]
    const t = ((e.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || '').replace(/\s+/g, ' ').trim()
    const d = ((e.match(/<published>([\s\S]*?)<\/published>/) || [])[1] || '').slice(0, 10)
    const a = [...e.matchAll(/<name>([\s\S]*?)<\/name>/g)].map((x) => x[1].trim()).slice(0, 4).join(', ')
    entries.push({ t, d, a })
  }
  arxivOut[tag] = entries
  console.log(`\n[${tag}]  ${q}   → ${entries.length} 条`)
  for (const e of entries) console.log(`   ${e.d}  ${e.t.slice(0, 110)}  (${e.a})`)
  await sleep(3200)
}

writeFileSync(path.join(ROOT, '.research/crosscheck.json'), JSON.stringify({ out, arxivOut }, null, 1), 'utf8')
console.log('\n→ .research/crosscheck.json')
