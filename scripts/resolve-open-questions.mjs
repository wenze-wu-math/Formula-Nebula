/**
 * 三个仍未定的问题，做最后一轮取证。
 *
 * ① cn-jacobian 该标 disproved 还是 partial？
 *    —— 需要确认"n ≥ 3 被反例否证、n = 2 仍开放"这个说法，以及
 *       它在维基「未解决问题列表」里是出现在**未解决**段还是**已解决**段。
 *       上一版我用 `low.includes(名字)` 粗暴匹配，会把"已解决"一节里的
 *       条目也算成"仍列在未解决列表里"，对 jacobian 正好会得出错误结论。
 *
 * ② cn-navier-stokes：2026-09-08 OpenAI 的声明是"声称"还是"已接受"？
 *    —— 声明才 8 天，且有优先权争议、明确表示不领 Clay 奖。
 *       要看条目正文现在到底怎么定性。
 *
 * ③ cn-howe：标 proved 有没有依据？
 *    —— 上一轮抓到的 "Howe duality" 页里**没有**任何"猜想已被证明"的句子，
 *       只有 Howe 的对偶对分类定理（那是另一件事）。需要换检索式确认。
 */
import path from 'node:path'

if (!process.env.HTTPS_PROXY && !process.env.https_proxy) {
  console.error('需要代理')
  process.exit(1)
}
const UA = { 'User-Agent': 'formula-nebula-research/1.0 (local; final)' }
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
async function wikitext(title) {
  const r = await jget(`https://en.wikipedia.org/w/api.php?action=parse&prop=wikitext&redirects=1&format=json&page=${encodeURIComponent(title)}`)
  return r.parse?.wikitext?.['*'] || ''
}
async function plain(title) {
  const r = await jget(`https://en.wikipedia.org/w/api.php?action=query&prop=extracts&explaintext=1&redirects=1&format=json&titles=${encodeURIComponent(title)}`)
  return Object.values(r.query?.pages || {})[0]?.extract || ''
}

/* ───────── ① Jacobian 在未解决列表里的位置 ───────── */
console.log('='.repeat(76))
console.log('① Jacobian：在「未解决问题列表」里位于哪一节')
console.log('='.repeat(76))
try {
  const wt = await wikitext('List of unsolved problems in mathematics')
  /* 按 == 标题切段，找出 Jacobian 出现在哪个标题下 */
  const secs = []
  let cur = '(lead)'
  for (const line of wt.split('\n')) {
    const m = line.match(/^(={2,4})\s*(.+?)\s*\1\s*$/)
    if (m) { cur = m[2]; continue }
    if (/jacobian/i.test(line)) secs.push({ sec: cur, line: line.replace(/\s+/g, ' ').trim().slice(0, 240) })
  }
  if (!secs.length) console.log('  （列表页里找不到 Jacobian）')
  for (const s of secs) console.log(`  § ${s.sec}\n      ${s.line}`)
} catch (e) { console.log('  失败: ' + e.message) }
await sleep(1500)

/* ───────── ② Navier–Stokes 现在怎么定性 ───────── */
console.log('\n\n' + '='.repeat(76))
console.log('② Navier–Stokes：2026-09-08 声明之后的定性')
console.log('='.repeat(76))
try {
  const t = await plain('Navier–Stokes existence and smoothness')
  const ss = t.replace(/\s+/g, ' ').split(/(?<=[.!?])\s+(?=[A-Z(])/)
  const key = /(unsolved|open|claim|verif|accept|peer|Lean|formaliz|contest|dispute|prize|remains|not been|skeptic)/i
  for (const s of ss.filter((x) => key.test(x) && x.length > 40 && x.length < 600).slice(0, 16)) {
    console.log('  * ' + s.trim())
  }
} catch (e) { console.log('  失败: ' + e.message) }
await sleep(1500)

/* 列表页里 NS 出现在哪一节 */
try {
  const wt = await wikitext('List of unsolved problems in mathematics')
  const secs = []
  let cur = '(lead)'
  for (const line of wt.split('\n')) {
    const m = line.match(/^(={2,4})\s*(.+?)\s*\1\s*$/)
    if (m) { cur = m[2]; continue }
    if (/navier/i.test(line)) secs.push({ sec: cur, line: line.replace(/\s+/g, ' ').trim().slice(0, 220) })
  }
  console.log('\n  在「未解决问题列表」中的位置:')
  if (!secs.length) console.log('    （找不到）')
  for (const s of secs) console.log(`    § ${s.sec}\n        ${s.line}`)
} catch (e) { console.log('  失败: ' + e.message) }
await sleep(1500)

/* ───────── ③ Howe 猜想的状态 ───────── */
console.log('\n\n' + '='.repeat(76))
console.log('③ Howe 猜想（重数自由）：到底证明了没有')
console.log('='.repeat(76))
const QUERIES = [
  'insource:"Howe conjecture"',
  'insource:"multiplicity-free" dual pair Howe proved',
  'Howe duality conjecture p-adic multiplicity free status',
]
for (const q of QUERIES) {
  try {
    const r = await jget(`https://en.wikipedia.org/w/api.php?action=query&list=search&srlimit=6&format=json&srsearch=${encodeURIComponent(q)}`)
    console.log(`\n  检索: ${q}`)
    for (const s of r.query?.search || []) {
      const sn = (s.snippet || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
      console.log(`    · ${s.title}  [${s.wordcount} 词]`)
      console.log(`      ${sn.slice(0, 220)}`)
    }
  } catch (e) { console.log('  检索失败: ' + e.message) }
  await sleep(1500)
}

/* 取两份可能相关的正文，找"猜想/证明"句 */
for (const title of ['Howe duality', 'Theta correspondence', 'Dual pair']) {
  try {
    const t = await plain(title)
    const ss = t.replace(/\s+/g, ' ').split(/(?<=[.!?])\s+(?=[A-Z(])/)
    const hits = ss.filter((x) => /(conjectur|multiplicity[- ]free|proved|unitar| Howe )/i.test(x) && x.length > 40 && x.length < 500)
    console.log(`\n  ── "${title}" (${t.length} 字符) 命中 ${hits.length} 句`)
    for (const s of hits.slice(0, 12)) console.log('     * ' + s.trim())
  } catch (e) { console.log(`  失败 ${title}: ` + e.message) }
  await sleep(1500)
}
