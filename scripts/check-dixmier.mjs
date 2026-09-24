/**
 * 核实我在 cn-jacobian 的 detail 里新写的那句：
 *   "等价形式极多（如 Dixmier 猜想关于 Weyl 代数的自同态，n ≥ 3 也随之被否证）"
 *
 * 这句话必须站得住，因为它是**由我来做的推论**，不是直接抄来的。
 * 逻辑链：
 *   已知 ① DC_n ⟹ JC_n              （维基引 Bass–Connell–Wright 1982）
 *   已知 ② JC 在 n > 2 全部为假      （Alpöge 2026 的 n=3 反例 + 高维）
 *   推出 ③ DC_n 在 n > 2 全部为假    （①的逆否）
 *   而 ④ 维基「2015 年以来已解决」明确列了 "Dixmier conjecture for n ≥ 3"
 *   → ③ 与 ④ 一致（n>2 的整数即 n ≥ 3）。链条闭合。
 *
 * 另一处要小心：Dixmier 的编号习惯是 DC_n 对应 2n 个变量的雅可比
 * （JC_{2n} ⟹ DC_n 是 Tsuchimoto / Belov-Kanel–Kontsevich 的定理）。
 * 若按这个编号，DC_n ⟹ JC_n 中的 "n" 指的是 Weyl 代数 A_n 的指标 n，
 * 而它对应 n 维雅可比 —— 维基原文写的是 "the Dixmier conjecture for A_n
 * implies the n-dimensional Jacobian conjecture"，即两者同指标 n。
 * 所以 DC_3 ⟹ JC_3，JC_3 假 ⟹ DC_3 假。没问题。
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

say('='.repeat(80))
say('Dixmier 猜想条目：与雅可比的等价关系 + 2026 后的状态')
say('='.repeat(80))
try {
  const j = JSON.parse(await get('https://en.wikipedia.org/w/api.php?action=query&prop=extracts&explaintext=1&redirects=1&format=json&titles=' + encodeURIComponent('Dixmier conjecture')))
  const p = Object.values(j.query?.pages || {})[0]
  const t = p?.extract || ''
  say(`  条目: ${p?.title}  ${t.length} 字符${p?.missing ? ' 【不存在】' : ''}`)
  if (t) {
    for (const s of t.replace(/\s+/g, ' ').split(/(?<=[.!?])\s+(?=[A-Z(])/).filter((x) => x.length > 25)) {
      say('   · ' + s.trim())
    }
  }
} catch (e) { say('   失败: ' + e.message) }
await sleep(1600)

say('\n' + '='.repeat(80))
say('雅可比条目里讲 Dixmier 的全部原句（核对指标 n 的对应）')
say('='.repeat(80))
try {
  const wt = await get('https://en.wikipedia.org/w/index.php?action=raw&title=' + encodeURIComponent('Jacobian conjecture'))
  const body = wt.replace(/\n/g, ' ').replace(/\s+/g, ' ')
  const ss = body.split(/(?<=[.!?])\s+(?=[A-Z(])/).filter((s) => /Dixmier/i.test(s))
  for (const s of ss) say('   · ' + s.replace(/<ref[\s\S]*?<\/ref>/g, '').replace(/<[^>]+>/g, '').trim().slice(0, 620) + '\n')
} catch (e) { say('   失败: ' + e.message) }
await sleep(1600)

say('='.repeat(80))
say('「2015 年以来已解决」里 Dixmier 那一条（原文，去掉公式噪声）')
say('='.repeat(80))
const raw = JSON.parse(fs.readFileSync('.research/raw.json', 'utf8'))
let listText = ''
for (const v of Object.values(raw)) {
  const x = String(v.text || '')
  if (x.includes('Problems solved since 2015') && x.length > listText.length) listText = x
}
const sec = listText.split('Problems solved since 2015')[1] || ''
const i = sec.search(/Dixmier/i)
if (i > 0) {
  say('   ' + sec.slice(Math.max(0, i - 320), i + 260).replace(/\s+/g, ' '))
} else say('   （未找到）')

fs.writeFileSync('.research/dixmier-check.txt', out.join('\n'), 'utf8')
console.log('\n[已存 .research/dixmier-check.txt]')
