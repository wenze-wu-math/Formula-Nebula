/**
 * 最后两个必须定案的问题（都要一手/权威来源，不靠记忆）：
 *
 * ① 「Representation theory」段里到底有没有 **Lusztig 猜想**？
 *    上一轮的匹配把 cn-lusztig 判成"命中未解决清单"，但那是被
 *    "Kazhdan–Lusztig" 里的 Lusztig 三个字误伤了 —— 假阳性。
 *    真正的判据：清单该段里是否**单独**列了 Lusztig 的（正特征）猜想。
 *    有 → 数学界认为它没彻底解决 → partial 站得住；
 *    没有 → 只有"p 足够大时已证明"这个共识 → proved 更准。
 *
 * ② 线性化猜想与雅可比猜想的**蕴含方向**。
 *    本地 detail 写"它（线性化）被证明蕴含雅可比猜想"，即 LC ⟹ JC。
 *    但这与事实冲突：LC 在 n ≤ 3 早已证明（Kraft/Popov/Miyanishi），
 *    而 JC 在 n = 3 直到 2026 年才被否证 —— 若 LC(3) ⟹ JC(3)，
 *    JC(3) 不可能悬置八十多年。所以方向存疑。
 *    用 arXiv 摘要来定方向（若真为 LC ⟹ JC，则 2026 年后 LC 也该塌）。
 *
 * 注意：②只影响 detail 的文字，不影响任何 status（LC 无论真假在高维都
 * 仍是 open）。所以这里只是为了**给用户一个准确的报告**，不据此改字段。
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

/* ───────── ① 未解决清单的 Representation theory 段 ───────── */
say('='.repeat(80))
say('① 未解决清单里的「Representation theory」段全文')
say('='.repeat(80))
const raw = JSON.parse(fs.readFileSync('.research/raw.json', 'utf8'))
let listText = ''
for (const v of Object.values(raw)) {
  const x = String(v.text || '')
  if (x.includes('Problems solved since 2015') && x.length > listText.length) listText = x
}
const unsolved = listText.split('Problems solved since 2015')[0]
const m = /={2,4}\s*Representation theory\s*={2,4}/.exec(unsolved)
if (m) {
  const rest = unsolved.slice(m.index + m[0].length)
  const nx = /={2,4}\s*[^=\n]+?\s*={2,4}/.exec(rest)
  const sec = rest.slice(0, nx ? nx.index : 3000)
  say(sec.replace(/\n{2,}/g, '\n').trim())
  say('\n  >>> 该段出现 "Lusztig" 的次数: ' + (sec.match(/Lusztig/gi) || []).length)
  say('  >>> 是否出现独立的 "Lusztig conjecture"（非 Kazhdan–Lusztig）: ' +
    (/Lusztig(?!\s*[–-]\s*Lusztig)/.test(sec.replace(/Kazhdan[–-]Lusztig/gi, 'KL')) ? '★ 出现' : '未出现'))
} else {
  say('  （未找到该段）')
}

/* ───────── ② arXiv 摘要定方向 ───────── */
say('\n' + '='.repeat(80))
say('② 线性化猜想 ↔ 雅可比猜想：蕴含方向（arXiv 摘要）')
say('='.repeat(80))
for (const q of [
  'all:"linearization conjecture" AND all:Jacobian',
  'abs:"linearization conjecture" AND abs:"Jacobian conjecture"',
  'ti:"linearization conjecture"',
]) {
  const url = `http://export.arxiv.org/api/query?search_query=${encodeURIComponent(q)}&start=0&max_results=12`
  try {
    const xml = await get(url)
    const total = (/<opensearch:totalResults[^>]*>(\d+)</.exec(xml) || [])[1] || '?'
    const entries = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map((x) => x[1])
    say(`\n  查询: ${q}\n  命中总数 ${total}，取回 ${entries.length} 条`)
    for (const e of entries) {
      const ti = ((/<title>([\s\S]*?)<\/title>/.exec(e) || [])[1] || '').replace(/\s+/g, ' ').trim()
      const su = ((/<summary>([\s\S]*?)<\/summary>/.exec(e) || [])[1] || '').replace(/\s+/g, ' ').trim()
      const id = ((/<id>([\s\S]*?)<\/id>/.exec(e) || [])[1] || '').trim()
      const rel = /(implies|implied|equivalent|lineariz)/i.test(su)
      say(`   · ${ti}`)
      say(`     ${id}`)
      if (rel) say(`     ${su.slice(0, 460)}`)
    }
  } catch (e) { say('   失败: ' + e.message) }
  await sleep(3200)
}

/* ───────── ③ Lusztig 正特征猜想的 arXiv 近况 ───────── */
say('\n' + '='.repeat(80))
say('③ arXiv 上关于 Lusztig 正特征猜想"小特征失效/界"的摘要')
say('='.repeat(80))
for (const q of [
  'abs:"Lusztig\'s conjecture" AND abs:characteristic',
  'all:"Lusztig conjecture" AND all:"small characteristic"',
]) {
  const url = `http://export.arxiv.org/api/query?search_query=${encodeURIComponent(q)}&start=0&max_results=14&sortBy=submittedDate&sortOrder=descending`
  try {
    const xml = await get(url)
    const total = (/<opensearch:totalResults[^>]*>(\d+)</.exec(xml) || [])[1] || '?'
    const entries = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map((x) => x[1])
    say(`\n  查询: ${q}\n  命中总数 ${total}，取回 ${entries.length} 条`)
    for (const e of entries) {
      const ti = ((/<title>([\s\S]*?)<\/title>/.exec(e) || [])[1] || '').replace(/\s+/g, ' ').trim()
      const su = ((/<summary>([\s\S]*?)<\/summary>/.exec(e) || [])[1] || '').replace(/\s+/g, ' ').trim()
      const pu = ((/<published>([\s\S]*?)<\/published>/.exec(e) || [])[1] || '').slice(0, 10)
      say(`   · [${pu}] ${ti}`)
      say(`     ${su.slice(0, 400)}`)
    }
  } catch (e) { say('   失败: ' + e.message) }
  await sleep(3200)
}

fs.writeFileSync('.research/final-deciders.txt', out.join('\n'), 'utf8')
console.log('\n[已存 .research/final-deciders.txt]')
