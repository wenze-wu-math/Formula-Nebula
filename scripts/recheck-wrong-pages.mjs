/**
 * 最后一轮：对"上一步抓错页面"的节点逐条换正确条目重查。
 *
 * 为什么不能跳过：`generator=search` 让维基自己挑页面，有 8 条落到了
 * 不相干的条目上（cn-linearization → Spherical space form conjecture、
 * cn-hartshorne-ample → 一个列表页、cn-connes-rigidity → Connes embedding
 * problem（那是**另一个**问题）、cn-group-iso → Graph isomorphism）。
 * 拿这些页面的正文去判断 status 是无效证据 —— "这一页没说它被证明"
 * 不等于"它没被证明"。所以这里给每条**写死正确的条目名**再取一次。
 *
 * 只打印与状态有关的句子，避免灌满上下文。
 */
import path from 'node:path'
import { writeFileSync, mkdirSync } from 'node:fs'

if (!process.env.HTTPS_PROXY && !process.env.https_proxy) {
  console.error('需要代理：HTTPS_PROXY=http://127.0.0.1:7890  NODE_USE_ENV_PROXY=1')
  process.exit(1)
}
const OUT = path.resolve(import.meta.dirname, '../.research')
mkdirSync(OUT, { recursive: true })
const UA = { 'User-Agent': 'formula-nebula-research/1.0 (local; status check)' }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function get(u, tries = 5) {
  let wait = 2500
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
async function extract(title) {
  const r = JSON.parse(await get(`https://en.wikipedia.org/w/api.php?action=query&prop=extracts|revisions&explaintext=1&redirects=1&rvprop=timestamp&rvlimit=1&format=json&titles=${encodeURIComponent(title)}`))
  const p = Object.values(r.query?.pages || {})[0]
  return { text: p?.extract || '', missing: !!p?.missing, rev: p?.revisions?.[0]?.timestamp || '' }
}

/* 写死的正确条目名 */
const TARGETS = [
  ['cn-hodge', 'Hodge conjecture'],
  ['cn-tate', 'Tate conjecture'],
  ['cn-linearization', 'Smith conjecture'],
  ['cn-hartshorne-ample', 'Hartshorne conjecture'],
  ['cn-connes-rigidity', 'Connes rigidity conjecture'],
  ['cn-group-iso', 'Group isomorphism problem'],
  ['cn-zariski-lipman', 'Nakai conjecture'],
  ['cn-rationally-connected', 'Rationally connected variety'],
  ['cn-canonical-model', 'Minimal model program'],
  ['cn-resolution-charp', 'Resolution of singularities'],
  ['cn-lusin', 'Carleson theorem'],
  ['cn-fujita', 'Fujita conjecture'],
  ['cn-yang-mills', 'Yang–Mills existence and mass gap'],
  ['cn-baum-connes', 'Baum–Connes conjecture'],
  ['cn-farrell-jones', 'Farrell–Jones conjecture'],
  ['cn-borel', 'Borel conjecture'],
  ['cn-novikov', 'Novikov conjecture'],
  ['cn-lagarias', 'Riemann hypothesis'],
  ['cn-idempotent', "Kaplansky's conjectures"],
  ['cn-kadison-kaplansky', "Kaplansky's conjectures"],
  ['cn-zero-divisor', "Kaplansky's conjectures"],
  ['cn-bass', 'Bass conjecture'],
  ['cn-artin', 'Artin conjecture (L-functions)'],
  ['cn-gross-prasad', 'Gan–Gross–Prasad conjecture'],
  ['cn-bochner-riesz', 'Bochner–Riesz conjecture'],
  ['cn-hsiang', 'Yau\'s conjecture'],
  ['cn-schanuel', 'Schanuel\'s conjecture'],
]

/* 只要这几类句子：明确的开放/已解决结论 */
const OPEN_RE = /\b(remains?|still|is|are)\b[^.]{0,50}\b(open|unproven|unproved|unsolved|unknown|conjectur)/i
const SOLVED_RE = /\b(proved|proof|proven|solved|settled|resolved|disproved|refuted|counterexample|theorem)\b/i
const YEAR_RE = /\b20(1[5-9]|2[0-6])\b/

const results = []
for (const [id, title] of TARGETS) {
  process.stdout.write(`${id.padEnd(24)} ← ${title.padEnd(38)} `)
  try {
    const { text, missing, rev } = await extract(title)
    if (missing || !text) { console.log('无此条目'); results.push({ id, title, missing: true }); await sleep(1300); continue }
    const ss = text.replace(/\s+/g, ' ').split(/(?<=[.!?])\s+(?=[A-Z(])/).filter((s) => s.length > 35 && s.length < 600)
    const recent = ss.filter((s) => YEAR_RE.test(s) && SOLVED_RE.test(s))
    const openish = ss.filter((s) => OPEN_RE.test(s))
    console.log(`OK ${text.length} 字符, 末次修订 ${rev}`)
    results.push({ id, title, len: text.length, rev, recent: recent.slice(0, 3), openish: openish.slice(0, 2) })
  } catch (e) { console.log('FAIL ' + e.message); results.push({ id, title, err: e.message }) }
  await sleep(1300)
}

writeFileSync(path.join(OUT, 'final-status.json'), JSON.stringify(results, null, 1), 'utf8')

console.log('\n\n' + '='.repeat(76))
console.log('有 2015+ 解决线索的（可能需改 status）')
console.log('='.repeat(76))
let any = false
for (const r of results) {
  if (!r.recent?.length) continue
  any = true
  console.log(`\n★ ${r.id}  ← "${r.title}"`)
  for (const s of r.recent) console.log('    → ' + s.trim().slice(0, 300))
}
if (!any) console.log('（无）')

console.log('\n\n' + '='.repeat(76))
console.log('明确写着"仍未解决"的（status 应保持 open/partial）')
console.log('='.repeat(76))
for (const r of results) {
  if (!r.openish?.length) continue
  console.log(`\n· ${r.id}  ← "${r.title}"`)
  console.log('    ○ ' + r.openish[0].trim().slice(0, 260))
}
console.log('\n→ .research/final-status.json')
