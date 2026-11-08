/**
 * kb-src/build-cross-links.mjs — 建立三个知识源之间的**跨源关联**。
 *
 * ═══ 问题 ═══
 *
 * 诊断发现：Stacks(1100) / nLab(89) / mathlib(333) 三组之间**零关联**。
 * 星云上是三块互不相连的星区，读者看不出"同一个数学概念在不同源里各有表述"。
 *
 * ═══ 但词匹配很危险 ═══
 *
 * `scheme` 出现在 213 条 Stacks 陈述里 —— 这**不**意味着它们都该连到 nLab 的
 * scheme 页面。盲目连边会让 nLab 的 89 个概念各自连出上百条边，把图谱变成噪声。
 *
 * ═══ 本脚本的三条高标准规则 ═══
 *
 * 规则 A（nLab ↔ Stacks，靠**标题**而非陈述）：
 *   只有当 Stacks 条目的**标题/name** 与 nLab 概念名匹配时才算
 *   —— 标题是"这条讲什么"的可靠信号，陈述里出现一个词不算。
 *
 * 规则 B（nLab ↔ mathlib，靠 namespace 前缀）：
 *   mathlib 定理全名以 `AlgebraicGeometry.Scheme.*` 开头的，
 *   与 nLab 的 `scheme` 概念是同一主题 —— 这是 Lean 的 namespace 约定，可靠。
 *
 * 规则 C（nLab/mathlib ↔ 手写节点）：
 *   手写 405 条是人工精选锚点，两边都该连过去，但要限流：
 *   每个外部节点最多连 2 个手写节点（按词匹配得分取最高）。
 *
 * 所有边权重 0.15–0.25，标签写明依据，**低于真实引用边（0.3–1.0）**。
 */
import { writeFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildGraph } from '../src/graph.js'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = join(HERE, '..')

const g = buildGraph()
const byId = new Map(g.nodes.map((n) => [n.id, n]))

const stacks = g.nodes.filter((n) => n.id.startsWith('stx-'))
const nlab = g.nodes.filter((n) => n.id.startsWith('nlb-'))
const mathlib = g.nodes.filter((n) => n.id.startsWith('ml-'))
const hand = g.nodes.filter((n) => /^(?!stx-|nlb-|ml-|um-|wk-|rz-|rs-|cn-)/.test(n.id))

const links = []
const seen = new Set()
const add = (a, b, w, label, type) => {
  if (!a || !b || a === b) return false
  const k = a < b ? `${a}|${b}` : `${b}|${a}`
  if (seen.has(k)) return false
  seen.add(k)
  links.push([a, b, w, label, type])
  return true
}

const norm = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '').trim()

/* ══════════ 规则 A：nLab 概念 ↔ Stacks 条目（靠标题匹配） ══════════ */
const nlabByNormName = new Map()
for (const n of nlab) {
  const k = norm(n.en || n.name)
  if (k.length >= 4 && k.length <= 40) nlabByNormName.set(k, n.id)
}

/* Stacks 的 name 形如 "lemma · Conormal sheaf of an immersion" —— 前有环境前缀。
 * 剥掉前缀后，用「标题包含概念名」来匹配，但概念名须 ≥6 字符（避免 "sheaf" 泛滥）。 */
function stripEnvPrefix(name) {
  return String(name || '').replace(/^(theorem|lemma|definition|proposition|corollary|example|situation|remark|construction|slogan)\s*·\s*/i, '')
}

/* 只保留足够具体的 nLab 概念（≥6 字符），否则 "sheaf" 会连出几百条 */
const nlabSpecific = [...nlabByNormName.entries()]
  .filter(([k]) => k.length >= 6)
  .map(([k, id]) => ({ k, id }))

/* 按概念名长度降序，优先匹配更具体的（affinescheme 优于 scheme） */
nlabSpecific.sort((a, b) => b.k.length - a.k.length)

let ruleA = 0
const aCount = new Map()   // 每个 nLab 概念连了多少条，用于限流
const A_CAP = 12           // 每概念最多连 12 条，防止单点度爆炸

for (const s of stacks) {
  const title = norm(stripEnvPrefix(s.name))
  if (!title) continue
  for (const t of nlabSpecific) {
    const cur = aCount.get(t.id) || 0
    if (cur >= A_CAP) continue
    if (title.includes(t.k) || t.k.includes(title)) {
      if (add(t.id, s.id, 0.22, '标题对应', 'crossSource')) {
        ruleA++
        aCount.set(t.id, cur + 1)
        break
      }
    }
  }
}
console.log(`规则 A（nLab↔Stacks 标题包含，每概念限 ${A_CAP} 条）: ${ruleA}`)

/* ══════════ 规则 B：nLab 概念 ↔ mathlib 定理（靠 namespace） ══════════ */
let ruleB = 0
/* 把 nLab 概念名规范化后，看 mathlib 全名的 namespace 段是否包含它 */
const nlabTerms = [...nlabByNormName.entries()]
  .filter(([k]) => k.length >= 5)
  .map(([k, id]) => ({ k, id }))

/* ⚠ 规则 B 的陷阱（实测踩过）：
 *   用 `parts[0].includes('category')` 匹配时，`CategoryTheory.*` 下**所有**定理
 *   都会连到 nLab 的 `category` 概念 —— 单点度 133，把图谱变成噪声。
 *
 * 修法：
 *   1. 通用词（category / sheaf / scheme / cohomology …）必须匹配到
 *      **完整的 namespace 段**（legacyAlgGeom.Scheme 里的 Scheme 段），不是子串；
 *   2. 每个概念限流 15 条。
 */
const GENERIC = new Set(['category', 'sheaf', 'scheme', 'cohomology', 'module', 'ring', 'algebra', 'space', 'morphism', 'functor', 'limit', 'topos'])
const B_CAP = 15
const bCount = new Map()

for (const m of mathlib) {
  const full = String(m.lean?.full || '')
  /* Lean namespace 段是大小写敏感的；取前 3 段 */
  const segs = full.split('.')
  const segNorm = segs.slice(0, 3).map((x) => x.toLowerCase())

  let best = null
  for (const t of nlabTerms) {
    const cur = bCount.get(t.id) || 0
    if (cur >= B_CAP) continue
    const isGeneric = GENERIC.has(t.k)
    let hit
    if (isGeneric) {
      /* 通用词：必须是某个段的**完整**匹配 */
      hit = segNorm.some((seg) => seg === t.k)
    } else {
      /* 具体词（如 affinescheme）：允许段内包含 */
      hit = segNorm.some((seg) => seg.includes(t.k) || t.k.includes(seg) && seg.length >= 6)
    }
    if (hit) { best = t.id; break }
  }
  if (best && add(best, m.id, 0.2, 'namespace', 'crossSource')) {
    ruleB++
    bCount.set(best, (bCount.get(best) || 0) + 1)
  }
}
console.log(`规则 B（nLab↔mathlib namespace，每概念限 ${B_CAP} 条）: ${ruleB}`)

/* ══════════ 规则 C：nLab / mathlib ↔ 手写锚点（限流） ══════════ */
let ruleC = 0
const handIndex = hand.map((h) => ({ id: h.id, k: norm(h.en || h.name), name: String(h.name || '') }))

/* 手写节点的**入边限流**：防止 `sheaf(层)` 被几十个外部概念同时连中。
 * 上限 8 —— 手写节点本来就在星云中心，连太多会让它变成毛球。 */
const HAND_IN_CAP = 8
const handIn = new Map()

/** 给一个外部节点找最多 2 个最匹配的手写锚点（手写侧限 8 条入边） */
function attachToHand(node, textForMatch, weight, label) {
  let n = 0
  const scored = []
  for (const h of handIndex) {
    if (h.k.length < 4) continue
    if (textForMatch.includes(h.k)) {
      /* 越长的匹配越可信 */
      scored.push({ id: h.id, score: h.k.length })
    }
  }
  scored.sort((a, b) => b.score - a.score)
  for (const s of scored.slice(0, 2)) {
    if ((handIn.get(s.id) || 0) >= HAND_IN_CAP) continue
    if (add(node.id, s.id, weight, label, 'crossSource')) {
      n++
      handIn.set(s.id, (handIn.get(s.id) || 0) + 1)
    }
  }
  return n
}

/* nLab → hand：用 nLab 名字本身去匹配手写节点的英文名 */
for (const n of nlab) {
  const k = norm(n.en || n.name)
  ruleC += attachToHand(n, k, 0.18, '概念对应')
}
/* mathlib → hand：用 namespace 段匹配 */
for (const m of mathlib) {
  const parts = String(m.lean?.full || '').toLowerCase().split('.')
  const k = norm(parts.slice(0, 2).join(''))
  ruleC += attachToHand(m, k, 0.16, 'namespace 对应')
}
console.log(`规则 C（外部→手写锚点，限流 2 条）: ${ruleC}`)

console.log(`\n跨源关联总数: ${links.length}`)

/* ── 连通性检查 ── */
const touched = new Set()
for (const l of links) { touched.add(l[0]); touched.add(l[1]) }
const nlabTouched = nlab.filter((n) => touched.has(n.id)).length
const mlTouched = mathlib.filter((n) => touched.has(n.id)).length
const stxTouched = stacks.filter((n) => touched.has(n.id)).length
console.log(`覆盖：nLab ${nlabTouched}/${nlab.length}，mathlib ${mlTouched}/${mathlib.length}，Stacks ${stxTouched}/${stacks.length}`)

/* ── 写文件 ── */
const dest = join(ROOT, 'src', 'data', 'cross-source-links.js')
mkdirSync(dirname(dest), { recursive: true })
const body = `/**
 * src/data/cross-source-links.js — 三个知识源之间的跨源关联。
 *
 * ⚠ 生成物。来源：kb-src/build-cross-links.mjs
 *
 * ═══ 为什么需要这个文件 ═══
 *
 * Stacks 的定理（1,100）、nLab 的概念（89）、mathlib 的形式化定理（333）
 * 原本三组之间**零关联** —— 星云上是三块互不相连的星区。
 * 本文件把它们接起来，让"同一概念在不同源里的表述"能被看见。
 *
 * ═══ 三条规则的证据强度（重要，别误读）═══
 *
 *   规则 A  \`同名条目\`   nLab 概念名 == Stacks 条目标题   → 同一主题的不同表述
 *   规则 B  \`namespace\`  mathlib 定理的 Lean namespace 段 == nLab 概念名
 *   规则 C  \`概念对应\`/ \`namespace 对应\`  外部节点 → 手工精选锚点
 *
 * ⚠ 这些是**结构性对应**，不是"逻辑依赖"。权重 0.16–0.22，
 *   低于 Stacks 源码 \`\\ref\` 的真实引用边（0.3–1.0）。
 *   它们的含义是"讲的是同一件事"，不表示"后者依赖前者"。
 *
 * 生成时间：${new Date().toISOString()}
 * 边数：${links.length}
 */

export const CROSS_SOURCE_LINKS = ${JSON.stringify(links, null, 0).replace(/\],\[/g, '],\n  [')}
`
writeFileSync(dest, body, 'utf8')
console.log(`\n写入 ${dest}（${(Buffer.byteLength(body) / 1024).toFixed(1)} KB）`)
