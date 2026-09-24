/**
 * 决定性排查：把本项目的 59 条猜想，逐条对照数学界**当前**的两份清单：
 *   (甲) "List of unsolved problems in mathematics" —— 命中 = 强证据说明仍 open
 *   (乙) 其中 "Problems solved since 2015" 段 —— 命中 = 强证据说明 status 已过期
 *
 * 为什么必须做这一遍：前几轮我是"挑可疑的看"，容易漏。这一遍是**全量对撞**，
 * 用机械匹配把所有可能的过期条目一次性摊开，再由我逐条判断。
 *
 * 注意两点方法上的克制：
 *   - 清单是 "a composite of notable problems"，**不完备**。所以"不在清单上"
 *     是很弱的证据（不能据此改 status）；只有"在已解决段里"才算强证据。
 *   - 匹配用英文关键词（≥5 字母、去停用词），会有同名不同物的误报
 *     （如 Keller 猜想是立方体铺砌、不是雅可比；Tate 会撞 Birch–Tate）。
 *     所以输出必须带**上下文**供人工确认，不能只看命中与否。
 */
import fs from 'node:fs'

const t = fs.readFileSync('src/data/conjectures.js', 'utf8')
const ids = [...t.matchAll(/id: '([^']+)'/g)].map((m) => m[1])
const rows = []
for (const id of ids) {
  const i = t.indexOf("id: '" + id + "'")
  const seg = t.slice(i, i + 1100)
  const g = (re) => { const m = re.exec(seg); return m ? m[1] : '?' }
  rows.push({ id, st: g(/status: '(\w+)'/), field: g(/field: '(\w+)'/), en: g(/en: '([^']+)'/), name: g(/name: '([^']+)'/) })
}

/* ── 取未解决问题清单全文（优先用缓存，避免再打一次网络） ── */
let listText = ''
try {
  const raw = JSON.parse(fs.readFileSync('.research/raw.json', 'utf8'))
  for (const v of Object.values(raw)) {
    const x = String(v.text || '')
    if (x.includes('Problems solved since 2015') && x.length > listText.length) listText = x
  }
} catch { /* ignore */ }
if (!listText) {
  const resp = await fetch('https://en.wikipedia.org/w/api.php?action=query&prop=extracts&explaintext=1&redirects=1&format=json&titles=' + encodeURIComponent('List of unsolved problems in mathematics'), { headers: { 'User-Agent': 'formula-nebula/1.0' } })
  const j = await resp.json()
  listText = Object.values(j.query?.pages || {})[0]?.extract || ''
}
console.log(`清单全文 ${listText.length} 字符（来源：${listText.length > 90000 ? '缓存 raw.json' : '实时抓取'}）\n`)

const SOLVED_MARK = 'Problems solved since 2015'
const cut = listText.indexOf(SOLVED_MARK)
const unsolvedPart = cut > 0 ? listText.slice(0, cut) : listText
const solvedPart = cut > 0 ? listText.slice(cut) : ''
console.log(`未解决部分 ${unsolvedPart.length} 字符 / 已解决段 ${solvedPart.length} 字符\n`)

/* ── 按 === 标题切段 ── */
function sectionOf(part, idx) {
  const before = part.slice(0, idx)
  const hs = [...before.matchAll(/={2,4}\s*([^=\n]+?)\s*={2,4}/g)]
  const topical = hs.filter((m) => !/^(Unsolved problems|Problems solved|See also|Notes|References|External links|Further reading)/i.test(m[1].trim()))
  return topical.length ? topical[topical.length - 1][1].trim() : '(顶部)'
}

const STOP = new Set(['conjecture', 'conjectures', 'problem', 'problems', 'hypothesis', 'theorem', 'existence', 'smooth', 'generalized', 'generalised', 'classification', 'duality', 'program', 'criterion', 'solving', 'statement', 'about', 'their', 'which', 'these'])

function needlesFor(r) {
  const words = String(r.en).split(/[^A-Za-z\u00C0-\u024F]+/).filter(Boolean)
  const set = new Set()
  for (const w of words) {
    if (w.length >= 6 && !STOP.has(w.toLowerCase())) set.add(w)
  }
  /* 也加上连字符前的长词（Kazhdan–Lusztig → 两个词已覆盖） */
  const core = r.id.replace(/^cn-/, '')
  if (core.length >= 7) set.add(core)
  return [...set]
}

console.log('='.repeat(84))
console.log('甲、在「未解决清单」里命中的条目（→ 支持保持 open/partial）')
console.log('='.repeat(84))
let hitUnsolved = 0
for (const r of rows) {
  const ns = needlesFor(r)
  const found = []
  for (const n of ns) {
    const re = new RegExp(n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
    const m = re.exec(unsolvedPart)
    if (m) {
      const s = Math.max(0, m.index - 130)
      found.push({ n, sec: sectionOf(unsolvedPart, m.index), ctx: unsolvedPart.slice(s, m.index + 180).replace(/\s+/g, ' ') })
    }
  }
  if (!found.length) continue
  hitUnsolved++
  /* 同一节只报一次，优先报信息量大的 */
  const seen = new Set()
  console.log(`\n[${r.id}]  status=${r.st}  ← 命中: ${[...new Set(found.map((f) => f.n))].join(', ')}`)
  for (const f of found) {
    const key = f.sec
    if (seen.has(key)) continue
    seen.add(key)
    console.log(`   § ${f.sec}`)
    console.log(`     …${f.ctx}…`)
  }
}
console.log(`\n>>> 命中未解决清单的节点数: ${hitUnsolved} / ${rows.length}`)

console.log('\n' + '='.repeat(84))
console.log('乙、在「2015 年以来已解决」段里命中的条目（→ 支持改 status ★ 重点）')
console.log('='.repeat(84))
let hitSolved = 0
for (const r of rows) {
  const ns = needlesFor(r)
  for (const n of ns) {
    const re = new RegExp(n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
    const m = re.exec(solvedPart)
    if (!m) continue
    hitSolved++
    const s = Math.max(0, m.index - 150)
    console.log(`\n[${r.id}]  status=${r.st}  ← 关键词 "${n}"`)
    console.log(`   § ${sectionOf(solvedPart, m.index)}`)
    console.log(`     …${solvedPart.slice(s, m.index + 320).replace(/\s+/g, ' ')}…`)
    break
  }
}
if (!hitSolved) console.log('\n（无命中）')
console.log(`\n>>> 命中已解决段的节点数: ${hitSolved} / ${rows.length}`)

console.log('\n' + '='.repeat(84))
console.log('丙、既不在未解决清单、也不在已解决段的节点（中性，保持原状）')
console.log('='.repeat(84))
const nei = []
for (const r of rows) {
  const ns = needlesFor(r)
  const inU = ns.some((n) => new RegExp(n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i').test(unsolvedPart))
  const inS = ns.some((n) => new RegExp(n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i').test(solvedPart))
  if (!inU && !inS) nei.push(`${r.st.padEnd(10)}${r.id.padEnd(25)}${r.en}`)
}
console.log(nei.length ? nei.join('\n') : '（无）')
console.log(`\n合计: ${nei.length} 条中性`)
