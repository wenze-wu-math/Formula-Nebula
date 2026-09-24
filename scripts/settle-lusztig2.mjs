/**
 * 定案 cn-lusztig（第二轮）：`proved` 还是 `partial`？
 *
 * 上一轮拿到关键句（Wikipedia "Geordie Williamson"）：
 *   "The conjecture was proved in 1994-95 by … Andersen, Jantzen, and Soergel …
 *    for sufficiently large group-specific characteristics (without explicit
 *    bound) and later by Peter Fiebig for a very high explicitly stated bound."
 *   "Williamson found several infinite families of counterexamples to the
 *    generally suspected validity limits of Lusztig's conjecture."
 *
 * 这两句合起来有两种读法，结论完全相反：
 *   (甲) 现代版猜想**自带"p 足够大"这个前提**，前提已证 ⟹ `proved`。
 *   (乙) 猜想原本声称对所有 p 成立，小 p 有反例 ⟹ 命题为假或只在大 p 成立 ⟹ `partial`。
 *
 * 判据：查**官方未解决问题清单**里到底有没有它。若清单仍列它未解决，
 * 说明数学界认为它没被彻底解决 ⟹ `partial`；若清单不列，而正文说 proved
 * ⟹ `proved`。同时确认小特征到底是"未知"还是"已有反例"（这决定本地
 * detail 的"小素数时未知"是否也需要跟着改）。
 */
import fs from 'node:fs'

if (!process.env.HTTPS_PROXY && !process.env.https_proxy) { console.error('需要代理'); process.exit(1) }
const UA = { 'User-Agent': 'formula-nebula-research/1.0 (lusztig round 2)' }
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
const jget = async (u) => JSON.parse(await get(u))
const plain = async (title) => {
  const r = await jget(`https://en.wikipedia.org/w/api.php?action=query&prop=extracts&explaintext=1&redirects=1&format=json&titles=${encodeURIComponent(title)}`)
  const p = Object.values(r.query?.pages || {})[0]
  return { text: p?.extract || '', missing: !!p?.missing, title: p?.title || title }
}

const out = []
const say = (s) => { console.log(s); out.push(s) }

/* ── A. 官方未解决问题清单的 Algebra 段 ── */
say('='.repeat(78))
say('A. "List of unsolved problems in mathematics" 的 Algebra / 表示论段')
say('='.repeat(78))
try {
  const { text } = await plain('List of unsolved problems in mathematics')
  const i = text.indexOf('=== Algebra ===')
  const j = text.indexOf('===', i + 10)
  const sec = text.slice(i, j > 0 ? j : i + 6000)
  say(sec.replace(/\n{2,}/g, '\n').slice(0, 3500))
  say('\n  >>> 该段是否出现 Lusztig: ' + (/Lusztig/i.test(sec) ? '出现 ★' : '未出现'))
} catch (e) { say('   失败: ' + e.message) }
await sleep(1500)

/* ── B. 全站 insource 检索：谁在讲 Lusztig 猜想的"小特征失效" ── */
say('\n' + '='.repeat(78))
say('B. 全站检索（insource）')
say('='.repeat(78))
for (const q of [
  'insource:"Lusztig conjecture"',
  'insource:"Lusztig\'s conjecture"',
  'insource:/Lusztig conjecture/ characteristic',
  'Lusztig conjecture failure small characteristic explicit counterexample algebraic group',
]) {
  try {
    const r = await jget(`https://en.wikipedia.org/w/api.php?action=query&list=search&srlimit=8&format=json&srsearch=${encodeURIComponent(q)}`)
    const s = r.query?.search || []
    say(`\n  检索: ${q}   → ${s.length} 条`)
    for (const x of s) {
      const sn = (x.snippet || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
      say(`    · ${x.title} [${x.wordcount} 词]`)
      say(`      ${sn.slice(0, 300)}`)
    }
  } catch (e) { say('   失败: ' + e.message) }
  await sleep(1600)
}

/* ── C. 相关条目里所有含 Lusztig + 特征 的句子 ── */
say('\n' + '='.repeat(78))
say('C. 相关条目正文（只看 Lusztig 与特征/界有关的句子）')
say('='.repeat(78))
for (const t of ['Lusztig\'s conjecture', 'Representation theory of semisimple Lie algebras',
                 'Algebraic group', 'Frobenius twist', 'Henning Haahr Andersen', 'Peter Fiebig',
                 'Wolfgang Soergel']) {
  try {
    const { text, missing, title } = await plain(t)
    say(`\n── "${t}" → ${title} (${text.length} 字符)${missing ? ' 【不存在】' : ''}`)
    if (!text) { await sleep(1300); continue }
    const ss = text.replace(/\s+/g, ' ').split(/(?<=[.!?])\s+(?=[A-Z(])/)
    const hits = ss.filter((s) => /Lusztig/i.test(s) && s.length > 30 && s.length < 520)
    if (!hits.length) say('   （无含 Lusztig 的句子）')
    for (const s of hits.slice(0, 12)) say('   · ' + s.trim())
  } catch (e) { say(`   失败 ${t}: ` + e.message) }
  await sleep(1400)
}

fs.writeFileSync('.research/lusztig-round2.txt', out.join('\n'), 'utf8')
console.log('\n[已存 .research/lusztig-round2.txt]')
