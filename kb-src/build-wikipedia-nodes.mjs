/**
 * kb-src/build-wikipedia-nodes.mjs — 把 Wikipedia 猜想转成知识库节点。
 *
 * ═══ 与 UnsolvedMath 节点的区别 ═══
 *
 *   UnsolvedMath: 有难度分级(L1-L5)/分类/set，importance 可由难度派生
 *   Wikipedia:    只有"名字 + 一句话陈述"，没有难度
 *
 * 所以 importance 只能用**启发式**：
 *   · 陈述里含公式 → 更具体，稍微重要
 *   · 陈述长度适中（30-150）→ 信息密度好
 *   · 名字里含"conjecture/problem"→ 确认是猜想
 * 这是诚实的降级：没有真实难度数据就不假装有。
 *
 * 由 wiki 名的首字母从「未解决」侧判定 —— 列表页里出现的都在未解决问题章节，
 * 所以 status 统一 'open'（除非标题里明确写 solved/disproved）。
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { pathToFileURL } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = join(HERE, '..')
const items = JSON.parse(readFileSync(join(HERE, 'out', 'wikipedia-conjectures.json'), 'utf8'))

/* ── 与现有去重 ── */
const norm = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '')
const existing = await import(pathToFileURL(join(ROOT, 'src/data/conjectures.js')).href)
const unsolved = await import(pathToFileURL(join(ROOT, 'src/data/unsolved-extra.js')).href)

const seen = new Set()
for (const n of existing.CONJECTURE_NODES) { seen.add(norm(n.en)); seen.add(norm(n.name)) }
for (const n of unsolved.UNSOLVED_NODES) {
  seen.add(norm(n.en)); seen.add(norm(n.name))
  seen.add(norm(String(n.en || '').replace(/^the\s+/i, '')))
}

/* 过滤非猜想条目：
 *   · 名字不含 conjecture/problem/question/hypothesis/… → 可能是概念（perfect cuboid）
 *   · 名字像期刊名（Journal of …）→ 列表页里的引用残留
 *   · 陈述为空或过短
 * 但保留少量确实以别的方式命名的（如 SIC-POVM 其实是 open problem）。
 */
const NON_CONJ_NAME = /^journal\b|^proceedings\b|^annals\b|^bulletin\b/i
const CONJ_WORD = /conjecture|problem|question|hypothesis|program|conj\.|\bhypothesis\b/i

const fresh = []
const localSeen = new Set()
const dropped = []
for (const w of items) {
  const k = norm(w.name)
  const k2 = norm(w.name.replace(/^(The|the)\s+/, ''))
  if (!k || localSeen.has(k) || seen.has(k) || seen.has(k2)) continue
  if (NON_CONJ_NAME.test(w.name)) { dropped.push([w.name, '期刊名']); continue }
  /* 名字不含猜想词，且陈述也看不出是开放问题的 → 丢 */
  if (!CONJ_WORD.test(w.name) && !CONJ_WORD.test(w.statement.slice(0, 80))) {
    dropped.push([w.name, '名字与陈述都不是猜想'])
    continue
  }
  if (!w.statement || w.statement.length < 20) { dropped.push([w.name, '陈述过短']); continue }
  localSeen.add(k)
  fresh.push(w)
}
console.log(`过滤掉 ${dropped.length} 条非猜想: ${dropped.slice(0, 5).map((d) => d[0]).join(', ')}`)
console.log(`Wikipedia ${items.length} → 去重后新增 ${fresh.length}`)

/** 把 Wikipedia 陈述转成可渲染的 LaTeX。
 *  陈述里已有 $...$ 的直接用；没有的用 \text{} 包住（与猜想库一致）。 */
function toLatex(statement, name) {
  const s = String(statement || '').trim()
  if (!s) return `\\text{${String(name).slice(0, 60)}}`
  /* 含 $...$ 的：保留整句（星云上显示完整命题） */
  if (/\$[^$]+\$/.test(s)) {
    const one = s.replace(/\s+/g, ' ').trim()
    const LIMIT = 150
    if (one.length <= LIMIT) return one
    /* 截在完整 $ 边界 */
    const D = String.fromCharCode(36)
    const cut = one.slice(0, LIMIT)
    let dollars = 0, lastClose = -1
    for (let i = 0; i < cut.length; i++) {
      if (cut[i] === D) { dollars++; if (dollars % 2 === 0) lastClose = i }
    }
    let tail = dollars % 2 === 1
      ? (lastClose > 40 ? cut.slice(0, lastClose + 1) : cut.slice(0, cut.lastIndexOf(' ')))
      : cut.slice(0, cut.lastIndexOf(' '))
    if (!tail || tail.length < 40) tail = cut
    return (tail.trimEnd() + ' …').replace(/\s+/g, ' ')
  }
  /* 纯文字：\text{} 占位（转义 _ ^ \ { }） */
  const esc = s.replace(/[\\{}]/g, '').replace(/[_^]/g, (m) => `\\${m}`)
  /* \text{} 也要短：星云标签盒放不下长文字 */
  const LIMIT = 90
  const head = esc.length > LIMIT
    ? esc.slice(0, Math.max(40, esc.lastIndexOf(' ', LIMIT))) + ' …'
    : esc
  return `\\text{${head}}`
}

function makeId(w) {
  return 'wk-' + String(w.wikiTitle || w.name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60)
}

/** Wikipedia 没有难度数据 —— 用陈述质量做诚实降级 */
function importanceOf(w) {
  let imp = 0.58
  const s = String(w.statement || '')
  if (/\$[^$]+\$/.test(s)) imp += 0.06        // 有公式 → 更具体
  if (s.length >= 40 && s.length <= 160) imp += 0.04  // 信息密度好
  if (/conjecture|problem|question/i.test(w.name)) imp += 0.02
  return Math.round(Math.min(0.86, imp) * 100) / 100
}

const nodes = fresh.map((w) => ({
  id: makeId(w),
  latex: toLatex(w.statement, w.name),
  name: w.name,
  en: w.name,
  importance: importanceOf(w),
  family: w.family,
  status: /solved|disproved/i.test(w.statement) ? 'proved' : 'open',
  field: w.field,
  year: null,
  proposer: '',
  summary: w.statement.slice(0, 180),
  detail: [
    w.statement,
    '',
    `来源：Wikipedia「List of unsolved problems in mathematics」${w.section} 章节。`,
    `页面：${w.url}`,
    '',
    '⚠ 本条由 Wikipedia 列表页自动抽取。该列表随数学进展修订，',
    '  所以状态（open/solved）可能已变化，请以原页面为准。',
    '  Wikipedia 列表不提供难度分级，importance 由陈述质量启发式派生。',
  ].join('\n'),
  source: `Wikipedia · ${w.section}`,
  url: w.url,
  wiki: { title: w.wikiTitle, section: w.section },
}))

/* id 去重 */
const byId = new Map()
for (const n of nodes) if (!byId.has(n.id)) byId.set(n.id, n)
const uniq = [...byId.values()]
console.log(`生成节点 ${uniq.length}`)

const byField = {}
for (const n of uniq) byField[n.field] = (byField[n.field] || 0) + 1
console.log('按 field:', JSON.stringify(byField))
const withReal = uniq.filter((n) => /\$/.test(n.latex)).length
console.log(`latex 含真公式: ${withReal} / ${uniq.length}`)

/* ── 关联：同章节互连 + 挂到现有同 field 猜想锚点 ── */
const links = []
const seenL = new Set()
const add = (a, b, w, label, type) => {
  if (!a || !b || a === b) return false
  const k = a < b ? `${a}|${b}` : `${b}|${a}`
  if (seenL.has(k)) return false
  seenL.add(k)
  links.push([a, b, w, label, type])
  return true
}

/* a) 同章节相邻成链 */
const bySec = new Map()
for (const n of uniq) {
  const s = n.wiki.section
  if (!bySec.has(s)) bySec.set(s, [])
  bySec.get(s).push(n)
}
for (const [sec, list] of bySec) {
  for (let i = 0; i + 1 < list.length; i++) {
    add(list[i].id, list[i + 1].id, 0.22, '同章节', 'related')
  }
}

/* b) 挂到现有同 field 的手写猜想锚点 */
const ANCHOR = { ag: 'cn-hodge', arith: 'cn-riemann', topo: null, algebra: null, analysis: null, logic: null }
const existingIds = new Set(existing.CONJECTURE_NODES.map((n) => n.id))
let anchored = 0
for (const n of uniq) {
  const a = ANCHOR[n.field]
  if (a && existingIds.has(a) && add(a, n.id, 0.16, 'field', 'sameFamily')) anchored++
}
console.log(`锚点 ${anchored} / 同章节链 ${links.length - anchored}`)

/* c) 孤立兜底 */
const touched = new Set()
for (const l of links) { touched.add(l[0]); touched.add(l[1]) }
const orphans = uniq.filter((n) => !touched.has(n.id))
const famAnchor = new Map()
for (const n of uniq) {
  if (!touched.has(n.id)) continue
  const c = famAnchor.get(n.field)
  if (!c || n.importance > c.importance) famAnchor.set(n.field, n)
}
let oe = 0
for (const n of orphans) {
  const a = famAnchor.get(n.field)
  if (a && add(a.id, n.id, 0.12, '本族锚点', 'related')) oe++
}
console.log(`兜底 ${oe}；总关联 ${links.length}`)

const dest = join(ROOT, 'src', 'data', 'wikipedia-extra.js')
mkdirSync(dirname(dest), { recursive: true })
const body = `/**
 * src/data/wikipedia-extra.js — 从 Wikipedia「未解决数学问题列表」采集的猜想。
 *
 * ⚠ 生成物，不要手改。重新生成：
 *     node kb-src/fetch-wikipedia.mjs && node kb-src/build-wikipedia-nodes.mjs
 *
 * 来源：https://en.wikipedia.org/wiki/List_of_unsolved_problems_in_mathematics
 * （列表页 wikitext 本身是结构化清单：\`* [[猜想名]]: 一句话陈述\`，含内嵌 <math>）
 *
 * ═══ 与 UnsolvedMath 的分工 ═══
 *   UnsolvedMath: 有难度分级/分类/来源集 → 做主线（${unsolved.UNSOLVED_NODES.length} 条）
 *   Wikipedia:    别名更全、一句话陈述更清楚 → 补漏（本文件 ${uniq.length} 条）
 *
 * ═══ 数据可靠性说明 ═══
 *   · 每条有 \`url\` 指向 Wikipedia 条目，可复核
 *   · status 统一按 'open'（列表页里出现的都是未解决），
 *     除非陈述里明确含 solved/disproved
 *   · **Wikipedia 不提供难度分级**，importance 由陈述质量启发式派生，
 *     不代表真实难度
 *   · 该列表随数学进展修订，状态可能已变化
 *
 * 生成时间：${new Date().toISOString()}
 * 节点数：${uniq.length}　关联数：${links.length}
 */

export const WIKI_NODES = ${JSON.stringify(uniq, null, 1)}

export const WIKI_LINKS = ${JSON.stringify(links, null, 0).replace(/\],\[/g, '],\n  [')}
`
writeFileSync(dest, body, 'utf8')
console.log(`\n写入 ${dest}（${(Buffer.byteLength(body) / 1024).toFixed(1)} KB）`)
