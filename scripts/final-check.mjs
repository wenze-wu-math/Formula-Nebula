/**
 * 收尾核对：还剩三条 open/proved 我无法从已抓正文判断，逐条定位。
 *
 * 为什么要单独一轮：
 *   · cn-lusztig  标 proved，但它自己的 detail 写着"小素数时未知" —— 自相矛盾
 *   · cn-howe     标 proved，但本地 detail 只说"近十年有广泛结果"，不像已证
 *   · cn-zariski-lipman / cn-linearization 上一步抓到了**不相干的条目**
 *     （Nakai conjecture / Spherical space form conjecture），拿那种正文
 *     判断 status 等于没判断。
 *
 * 方法：先用 insource 检索定位到真正讲这条猜想的页面，再取正文，
 * 只打印含"证明/反例/开放/特征 p"的句子。
 */
import path from 'node:path'

if (!process.env.HTTPS_PROXY && !process.env.https_proxy) {
  console.error('需要代理')
  process.exit(1)
}
const UA = { 'User-Agent': 'formula-nebula-research/1.0 (local; final check)' }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function get(u, tries = 4) {
  let wait = 2500
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(u, { headers: UA })
      if (r.status === 429) { await sleep(wait); wait *= 1.9; continue }
      return await r.text()
    } catch (e) {
      if (i === tries - 1) throw e
      await sleep(wait); wait *= 1.9
    }
  }
  throw new Error('重试耗尽')
}
const j = async (u) => JSON.parse(await get(u))

async function search(q, limit = 5) {
  const r = await j(`https://en.wikipedia.org/w/api.php?action=query&list=search&srlimit=${limit}&format=json&srsearch=${encodeURIComponent(q)}`)
  return r.query?.search || []
}
async function extract(title) {
  const r = await j(`https://en.wikipedia.org/w/api.php?action=query&prop=extracts&explaintext=1&redirects=1&format=json&titles=${encodeURIComponent(title)}`)
  const p = Object.values(r.query?.pages || {})[0]
  return p?.extract || ''
}

const KEY = /(Lusztig|characteristic|prime|p >|counterexample|conjectur|proved|disprov|open|unknown|multiplicity|dual pair|Howe|Zariski|Lipman|linearization|free|Kähler differential)/i

async function show(label, titles, q) {
  console.log(`\n${'='.repeat(76)}\n### ${label}\n${'='.repeat(76)}`)
  if (q) {
    console.log(`检索: ${q}`)
    const s = await search(q)
    for (const x of s) console.log(`   · ${x.title}  [${x.wordcount} 词]  ${(x.snippet || '').replace(/<[^>]+>/g, '').slice(0, 150)}`)
    await sleep(1500)
  }
  for (const t of titles) {
    let txt = ''
    try { txt = await extract(t) } catch (e) { console.log(`\n  [${t}] 抓取失败 ${e.message}`); continue }
    console.log(`\n  ── "${t}"  (${txt.length} 字符) ──`)
    if (!txt) { console.log('     （无正文）'); await sleep(1200); continue }
    const ss = txt.replace(/\s+/g, ' ').split(/(?<=[.!?])\s+(?=[A-Z(])/)
    const hits = ss.filter((s) => KEY.test(s) && s.length > 40 && s.length < 480)
    for (const s of hits.slice(0, 14)) console.log('     * ' + s.trim())
    await sleep(1400)
  }
}

await show('cn-lusztig —— Lusztig 猜想（正特征）',
  ['Geordie Williamson', 'Kazhdan–Lusztig conjecture'],
  'insource:"Lusztig conjecture" torsion explosion Williamson')

await show('cn-howe —— Howe 对偶的重数自由',
  ['Howe duality', 'Dual pair'],
  'insource:"Howe" multiplicity free dual pair conjecture')

await show('cn-zariski-lipman / cn-linearization',
  ['Zariski–Lipman conjecture', 'Nakai conjecture', 'Linearization conjecture'],
  'insource:"Zariski-Lipman" OR insource:"Zariski–Lipman"')

await show('cn-navier-stokes —— 2026 声明的当前地位',
  ['Navier–Stokes existence and smoothness'],
  null)
