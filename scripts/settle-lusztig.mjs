/**
 * 定案 cn-lusztig：`proved` 是否该改成 `partial`？
 *
 * 这是本轮**唯一一个逆着用户预期**的改动（用户预期是 open → proved），
 * 所以必须有硬证据，否则不动。
 *
 * 关键区分（决定 status 完全不同）：
 *   (a) 猜想对一切 p 成立，只是"p 多大才够"的界没写清楚   → proved 就够了
 *   (b) 猜想对小的 p **是假的**（有反例），只对大 p 是定理 → partial
 *
 * 本地 detail 写的是"小素数时未知" —— 若实情是 (b)，这句本身就是错的，
 * 而 status 也不能是 proved。Williamson 的 "torsion explosion" 正是关键：
 * 它推翻的到底是"Lusztig 猜想的期望界"，还是"Lusztig 猜想本身"？
 */
if (!process.env.HTTPS_PROXY && !process.env.https_proxy) { console.error('需要代理'); process.exit(1) }
const UA = { 'User-Agent': 'formula-nebula-research/1.0 (lusztig status)' }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
async function get(u, tries = 5, raw = false) {
  let wait = 2600
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(u, { headers: UA })
      if (r.status === 429) { await sleep(wait); wait *= 1.9; continue }
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      return raw ? await r.text() : JSON.parse(await r.text())
    } catch (e) { if (i === tries - 1) throw e; await sleep(wait); wait *= 1.9 }
  }
  throw new Error('重试耗尽')
}
const plain = async (title) => {
  const r = await get(`https://en.wikipedia.org/w/api.php?action=query&prop=extracts&explaintext=1&redirects=1&format=json&titles=${encodeURIComponent(title)}`)
  const p = Object.values(r.query?.pages || {})[0]
  return { text: p?.extract || '', missing: !!p?.missing, title: p?.title || title }
}

console.log('='.repeat(78))
console.log('A. 直接找讲 "Lusztig 猜想" 与 "小特征" 的原句')
console.log('='.repeat(78))
for (const t of ['Lusztig conjecture', 'Modular representation theory', 'Geordie Williamson',
                 'Kazhdan–Lusztig conjecture', 'Torsion explosion', 'James E. Humphreys']) {
  try {
    const { text, missing, title } = await plain(t)
    console.log(`\n── "${t}" → ${title} (${text.length} 字符)${missing ? ' 【不存在】' : ''}`)
    if (!text) { await sleep(1300); continue }
    const ss = text.replace(/\s+/g, ' ').split(/(?<=[.!?])\s+(?=[A-Z(])/)
    const KEY = /(Lusztig|small|large|sufficien|characteristic|prime|p\b|bound|counterexample|conjectur|explicit|fail|false|torsion)/i
    const hits = ss.filter((s) => KEY.test(s) && s.length > 40 && s.length < 520)
    for (const s of hits.slice(0, 18)) console.log('   · ' + s.trim())
  } catch (e) { console.log(`   失败 ${t}: ` + e.message) }
  await sleep(1400)
}

console.log('\n' + '='.repeat(78))
console.log('B. 检索式确认')
console.log('='.repeat(78))
for (const q of [
  'Lusztig conjecture false small characteristic Williamson counterexample bound',
  'insource:"Lusztig\'s conjecture" counterexample characteristic',
  'Lusztig conjecture proved large p Andersen Jantzen Soergel Fiebig',
]) {
  try {
    const r = await get(`https://en.wikipedia.org/w/api.php?action=query&list=search&srlimit=6&format=json&srsearch=${encodeURIComponent(q)}`)
    console.log(`\n  检索: ${q}`)
    const s = r.query?.search || []
    if (!s.length) console.log('    （无结果）')
    for (const x of s) {
      const sn = (x.snippet || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
      console.log(`    · ${x.title} [${x.wordcount} 词]  ${sn.slice(0, 240)}`)
    }
  } catch (e) { console.log('   失败: ' + e.message) }
  await sleep(1600)
}

console.log('\n' + '='.repeat(78))
console.log('C. arXiv 上找 Williamson 的原始论文标题（看它宣称推翻了什么）')
console.log('='.repeat(78))
try {
  const xml = await get('http://export.arxiv.org/api/query?search_query=au:Williamson_G+AND+cat:math.RT&start=0&max_results=30&sortBy=submittedDate&sortOrder=descending', 5, true)
  const entries = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map((m) => m[1])
  console.log(`  找到 ${entries.length} 条`)
  for (const e of entries) {
    const ti = (/<title>([\s\S]*?)<\/title>/.exec(e) || [])[1] || ''
    const pu = (/<published>([\s\S]*?)<\/published>/.exec(e) || [])[1] || ''
    const id = (/<id>([\s\S]*?)<\/id>/.exec(e) || [])[1] || ''
    console.log(`   · ${pu.slice(0, 10)}  ${ti.replace(/\s+/g, ' ').trim()}`)
    console.log(`     ${id.trim()}`)
  }
} catch (e) { console.log('   失败: ' + e.message) }
