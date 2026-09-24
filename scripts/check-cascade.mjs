/**
 * 2026 年雅可比猜想被否证后，会不会**波及**本项目的其他节点？
 *
 * 为什么必须查：本地 cn-linearization 的 detail 写着"它被证明蕴含**雅可比
 * 猜想**"，而 cn-linearization 自己的 status 是 open、detail 说"n ≤ 3 成立"。
 * 如果 LC(n) ⟹ JC(n) 且 JC(3) 已被反例否证，那 LC(3) 也该是假的 ——
 * 这与"n ≤ 3 成立"直接矛盾。要么本地的蕴含方向写错了，要么维度对应不同。
 * 无论哪种，都不能靠猜：**改错一条 status 比不改更糟**。
 *
 * 同时核对 Dixmier 猜想（本地只在 cn-jacobian 的 detail 里提到）：
 * 维基「2015 年以来已解决」列表里写着 "Dixmier conjecture for n ≥ 3,
 * stably equivalent to the Jacobian conjecture"，即它也被否证了。
 *
 * 另一件事：上一轮我用 "Linearization conjecture" 去查，维基把它重定向到
 * "Spherical space form conjecture"（那是 **Smith 猜想**，讲群作用在球面上
 * 的线性化）。本项目讲的是 **Kraft–Popov**：加法群 Ga 在仿射空间 Aⁿ 上的
 * 作用。两者同名不同物，必须分开查，否则会拿错页面的正文去判断 status。
 */
import path from 'node:path'

if (!process.env.HTTPS_PROXY && !process.env.https_proxy) {
  console.error('需要代理')
  process.exit(1)
}
const UA = { 'User-Agent': 'formula-nebula-research/1.0 (local; cascade check)' }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function get(u, tries = 5) {
  let wait = 2600
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(u, { headers: UA })
      if (r.status === 429) { await sleep(wait); wait *= 1.9; continue }
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      return await r.text()
    } catch (e) {
      if (i === tries - 1) throw e
      await sleep(wait); wait *= 1.9
    }
  }
  throw new Error('重试耗尽')
}
const jget = async (u) => JSON.parse(await get(u))
async function search(q, limit = 6) {
  const r = await jget(`https://en.wikipedia.org/w/api.php?action=query&list=search&srlimit=${limit}&format=json&srsearch=${encodeURIComponent(q)}`)
  return r.query?.search || []
}
async function plain(title) {
  const r = await jget(`https://en.wikipedia.org/w/api.php?action=query&prop=extracts&explaintext=1&redirects=1&format=json&titles=${encodeURIComponent(title)}`)
  const p = Object.values(r.query?.pages || {})[0]
  return { text: p?.extract || '', missing: !!p?.missing, title: p?.title || title }
}

async function hunt(label, queries, pages) {
  console.log(`\n${'='.repeat(76)}\n### ${label}\n${'='.repeat(76)}`)
  for (const q of queries) {
    try {
      console.log(`\n  检索: ${q}`)
      const s = await search(q)
      if (!s.length) console.log('    （无结果）')
      for (const x of s) {
        const sn = (x.snippet || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
        console.log(`    · ${x.title} [${x.wordcount} 词]`)
        console.log(`      ${sn.slice(0, 230)}`)
      }
    } catch (e) { console.log('    失败: ' + e.message) }
    await sleep(1600)
  }
  for (const t of pages) {
    try {
      const { text, missing, title } = await plain(t)
      console.log(`\n  ── "${t}" → ${title} (${text.length} 字符)${missing ? ' 【不存在】' : ''}`)
      if (!text) { await sleep(1300); continue }
      const ss = text.replace(/\s+/g, ' ').split(/(?<=[.!?])\s+(?=[A-Z(])/)
      const KEY = /(lineariz|Jacobian|Dixmier|implies|equivalen|Kraft|Popov|proved|conjectur|open|n ≤|dimension)/i
      for (const s of ss.filter((x) => KEY.test(x) && x.length > 35 && x.length < 480).slice(0, 16)) {
        console.log('     * ' + s.trim())
      }
    } catch (e) { console.log(`    失败 ${t}: ` + e.message) }
    await sleep(1400)
  }
}

await hunt('① Kraft–Popov 线性化猜想：状态 + 与雅可比猜想的蕴含方向',
  ['Kraft Popov linearization conjecture additive group affine space',
   'insource:"linearization conjecture" additive group affine'],
  ['Linearization conjecture (affine space)', 'Kraft–Popov conjecture', 'Jacobian conjecture'])

await hunt('② Dixmier 猜想：2026 之后的状态',
  ['Dixmier conjecture Weyl algebra endomorphism automorphism status 2026'],
  ['Dixmier conjecture'])

await hunt('③ 2026 年那批 AI 结果还牵动了哪些猜想（防止漏改）',
  ['List of unsolved problems in mathematics 2026 proved'],
  ['List of unsolved problems in mathematics'])
