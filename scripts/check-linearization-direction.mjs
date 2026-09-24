/**
 * 核实 cn-linearization 的 detail 里那句话的方向：
 *   本地原文："它被证明蕴含**雅可比猜想**（Jacobian conjecture）"  即 LC ⟹ JC
 *
 * 为什么怀疑：线性化猜想（Kraft–Popov：Ga 在 Aⁿ 上的正则作用是否线性化）
 * 在 n ≤ 3 早已被 Kraft / Popov / Miyanishi 等人证明。而雅可比猜想在 n = 3
 * 直到 2026 年才被否证（若不否证则一直悬置到 2026）。若 LC(3) ⟹ JC(3)，
 * 那么 1970–80 年代 LC(3) 一旦成立，JC(3) 就自动成立 —— 与"悬置 87 年"矛盾。
 * 所以方向很可能写反了（已知的应是 **JC ⟹ LC**）。
 *
 * 只用权威来源定这个方向：
 *   (a) Wikipedia "Jacobian conjecture" 的 infobox 字段 implied by / equivalent to
 *   (b) 相关的 locally nilpotent derivation 条目
 *   (c) arXiv 摘要里同时出现 linearization 与 Jacobian 且含 implies 的句子
 */
import fs from 'node:fs'

if (!process.env.HTTPS_PROXY && !process.env.https_proxy) { console.error('需要代理'); process.exit(1) }
const UA = { 'User-Agent': 'formula-nebula-research/1.0' }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
async function get(u, tries = 5) {
  let wait = 2600
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(u, { headers: UA })
      if (r.status === 429) { await sleep(wait); wait *= 1.9; continue }
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      return await r.text()
    } catch (e) { if (i === tries - 1) throw e; await sleep(wait); wait *= 1.9 }
  }
  throw new Error('重试耗尽')
}

const out = []
const say = (s) => { console.log(s); out.push(s) }

/* (a) infobox 字段 */
say('='.repeat(80))
say('(a) "Jacobian conjecture" infobox 的 implied by / equivalent to')
say('='.repeat(80))
try {
  const wt = await get('https://en.wikipedia.org/w/index.php?action=raw&title=' + encodeURIComponent('Jacobian conjecture'))
  const lines = wt.split('\n')
  for (const key of ['implied by', 'equivalent to', 'known cases', 'open problem', 'conjectured by', 'conjecture date']) {
    const hits = lines.filter((l) => new RegExp('^\\s*\\|\\s*' + key + '\\s*=', 'i').test(l))
    for (const h of hits) say(`   ${h.trim()}`)
  }
  /* 正文里含 lineariz 的句子 */
  say('\n   正文中所有含 "lineariz" 的行（截断）:')
  const body = wt.replace(/\n/g, ' ')
  const ss = body.replace(/\s+/g, ' ').split(/(?<=[.!?])\s+(?=[A-Z(])/)
  const hits = ss.filter((s) => /lineariz/i.test(s))
  if (!hits.length) say('     （正文无 lineariz）')
  for (const s of hits.slice(0, 8)) say('     * ' + s.slice(0, 420))
} catch (e) { say('   失败: ' + e.message) }
await sleep(1600)

/* (b) locally nilpotent derivation 条目里找 Kraft–Popov / linearization 的表述 */
say('\n' + '='.repeat(80))
say('(b) "Locally nilpotent derivation" 条目：linearization / Jacobian 的关系')
say('='.repeat(80))
try {
  const j = JSON.parse(await get('https://en.wikipedia.org/w/api.php?action=query&prop=extracts&explaintext=1&redirects=1&format=json&titles=' + encodeURIComponent('Locally nilpotent derivation')))
  const t = Object.values(j.query?.pages || {})[0]?.extract || ''
  say(`   （${t.length} 字符）`)
  const ss = t.replace(/\s+/g, ' ').split(/(?<=[.!?])\s+(?=[A-Z(])/)
  const hits = ss.filter((s) => /(lineariz|Kraft|Popov|Jacobian|implies)/i.test(s) && s.length > 30 && s.length < 600)
  if (!hits.length) say('   （无相关句子）')
  for (const s of hits.slice(0, 16)) say('   · ' + s.trim())
} catch (e) { say('   失败: ' + e.message) }
await sleep(1600)

/* (c) arXiv：linearization 与 Jacobian 同时出现 */
say('\n' + '='.repeat(80))
say('(c) arXiv 摘要（all: 全文检索，找 implies 句）')
say('='.repeat(80))
for (const q of ['all:"linearization conjecture" AND all:"Jacobian conjecture"',
                 'all:"Kraft-Popov" AND all:Jacobian']) {
  try {
    const xml = await get(`http://export.arxiv.org/api/query?search_query=${encodeURIComponent(q)}&start=0&max_results=15`)
    const total = (/<opensearch:totalResults[^>]*>(\d+)</.exec(xml) || [])[1] || '?'
    const entries = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map((x) => x[1])
    say(`\n  查询: ${q}\n  总数 ${total}，取回 ${entries.length}`)
    for (const e of entries) {
      const ti = ((/<title>([\s\S]*?)<\/title>/.exec(e) || [])[1] || '').replace(/\s+/g, ' ').trim()
      const su = ((/<summary>([\s\S]*?)<\/summary>/.exec(e) || [])[1] || '').replace(/\s+/g, ' ').trim()
      const pu = ((/<published>([\s\S]*?)<\/published>/.exec(e) || [])[1] || '').slice(0, 10)
      say(`   · [${pu}] ${ti}`)
      /* 只打印含关键词的片段 */
      const m = /([^.]*(?:lineariz|Kraft|Popov|implies|equivalent)[^.]*\.)/i.exec(su)
      if (m) say(`     …${m[1].trim().slice(0, 330)}`)
    }
  } catch (e) { say('   失败: ' + e.message) }
  await sleep(3200)
}

fs.writeFileSync('.research/linearization-direction.txt', out.join('\n'), 'utf8')
console.log('\n[已存 .research/linearization-direction.txt]')
