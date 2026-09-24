/**
 * 定案：两个仍需确认的点，取**一手来源**。
 *
 * ① cn-jacobian 的 2026 反例 —— 这是本轮唯一一个真正要改 status 的节点，
 *    而且说法惊人（"AI 参与发现的 87 年悬案的证伪"），所以不能只看维基。
 *    直接取 Terence Tao 的博客原文（一手），看它到底讲了什么。
 *    已知该页面 HTTP 200 且标题为 "A digestion of the Jacobian conjecture
 *    counterexample"。
 *
 * ② cn-lusztig 为什么不该标 proved —— 本地 detail 写着"小素数时未知"，
 *    而 status 是 proved。需要确认 Williamson 的反例到底推翻了什么：
 *    是"Lusztig 猜想在 p 不够大时也成立"这个预期，还是猜想本身？
 *    这两者对应完全不同的 status（partial vs disproved）。
 *
 * ③ 顺带确认：线性化猜想是否真的蕴含雅可比猜想。若为真且线性化在
 *    n ≤ 3 已知成立，而雅可比 n = 3 已被否证，本地数据就自相矛盾了 ——
 *    这种矛盾必须报告，不能凭猜改写。
 */
import path from 'node:path'

if (!process.env.HTTPS_PROXY && !process.env.https_proxy) {
  console.error('需要代理')
  process.exit(1)
}
const UA = { 'User-Agent': 'Mozilla/5.0 (compatible; formula-nebula-research/1.0)' }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function get(u, tries = 4, raw = false) {
  let wait = 2500
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(u, { headers: UA })
      if (r.status === 429) { await sleep(wait); wait *= 1.9; continue }
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      return raw ? await r.text() : JSON.parse(await r.text())
    } catch (e) {
      if (i === tries - 1) throw e
      await sleep(wait); wait *= 1.9
    }
  }
  throw new Error('重试耗尽')
}

/* ───────── ① Tao 博客原文 ───────── */
console.log('='.repeat(76))
console.log('① Tao 博客：雅可比猜想反例（一手来源）')
console.log('='.repeat(76))
try {
  const html = await get('https://terrytao.wordpress.com/2026/07/21/a-digestion-of-the-jacobian-conjecture-counterexample/', 4, true)
  /* 粗暴去标签，取正文文本 */
  const body = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&#8217;/g, "'")
    .replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
  const i = body.indexOf('Conjecture 1')
  const seg = i > 0 ? body.slice(Math.max(0, i - 1500), i + 6000) : body.slice(0, 7000)
  console.log(seg.slice(0, 5200))
} catch (e) { console.log('  失败: ' + e.message) }
await sleep(1500)

/* ───────── ② Lusztig 猜想：Williamson 反例推翻了什么 ───────── */
console.log('\n\n' + '='.repeat(76))
console.log('② Lusztig 猜想：小素数情形到底"未知"还是"已否证"')
console.log('='.repeat(76))
const QS = [
  'Lusztig conjecture counterexample small characteristic Williamson torsion explosion',
  'insource:"torsion explosion" Williamson',
  'Lusztig conjecture status proved large p false small p',
]
for (const q of QS) {
  try {
    const r = await get(`https://en.wikipedia.org/w/api.php?action=query&list=search&srlimit=6&format=json&srsearch=${encodeURIComponent(q)}`)
    console.log(`\n  检索: ${q}`)
    for (const s of r.query?.search || []) {
      const sn = (s.snippet || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
      console.log(`    · ${s.title} [${s.wordcount} 词]  ${sn.slice(0, 210)}`)
    }
  } catch (e) { console.log('  失败: ' + e.message) }
  await sleep(1600)
}

/* 取 Williamson 与相关条目正文，找讲 Lusztig 猜想状态的原句 */
for (const title of ['Geordie Williamson', 'Lusztig conjecture', 'Torsion explosion']) {
  try {
    const r = await get(`https://en.wikipedia.org/w/api.php?action=query&prop=extracts&explaintext=1&redirects=1&format=json&titles=${encodeURIComponent(title)}`)
    const p = Object.values(r.query?.pages || {})[0]
    const t = p?.extract || ''
    console.log(`\n  ── "${title}"  (${t.length} 字符) ${p?.missing ? '【条目不存在】' : ''}`)
    if (t) {
      const ss = t.replace(/\s+/g, ' ').split(/(?<=[.!?])\s+(?=[A-Z(])/)
      const hits = ss.filter((s) => /(Lusztig|characteristic|prime|p\b|counterexample|conjectur|bound|torsion)/i.test(s) && s.length > 40 && s.length < 500)
      for (const s of hits.slice(0, 14)) console.log('     * ' + s.trim())
    }
  } catch (e) { console.log(`  失败 ${title}: ` + e.message) }
  await sleep(1500)
}

/* ───────── ③ 线性化猜想是否蕴含雅可比猜想 ───────── */
console.log('\n\n' + '='.repeat(76))
console.log('③ 线性化猜想 ⟹ 雅可比猜想？维度如何对应')
console.log('='.repeat(76))
for (const q of [
  'linearization conjecture implies Jacobian conjecture Kraft Popov',
  'insource:"linearization conjecture" Jacobian',
]) {
  try {
    const r = await get(`https://en.wikipedia.org/w/api.php?action=query&list=search&srlimit=6&format=json&srsearch=${encodeURIComponent(q)}`)
    console.log(`\n  检索: ${q}`)
    for (const s of r.query?.search || []) {
      const sn = (s.snippet || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
      console.log(`    · ${s.title} [${s.wordcount} 词]  ${sn.slice(0, 230)}`)
    }
  } catch (e) { console.log('  失败: ' + e.message) }
  await sleep(1600)
}
try {
  const r = await get('https://en.wikipedia.org/w/api.php?action=query&prop=extracts&explaintext=1&redirects=1&format=json&titles=' + encodeURIComponent('Jacobian conjecture'))
  const t = Object.values(r.query?.pages || {})[0]?.extract || ''
  const ss = t.replace(/\s+/g, ' ').split(/(?<=[.!?])\s+(?=[A-Z(])/)
  console.log('\n  ── Jacobian conjecture 条目里提到 linearization / Dixmier 的句子')
  for (const s of ss.filter((x) => /(lineariz|Dixmier|equivalen|implies)/i.test(x) && x.length > 30 && x.length < 600).slice(0, 12)) {
    console.log('     * ' + s.trim())
  }
} catch (e) { console.log('  失败: ' + e.message) }
