/**
 * kb-src/link-researchers.mjs — 给 zbMATH 研究者补关联。
 *
 * 问题：新加的 45 位研究者没有 links，成了孤立节点（星云里漂浮的点）。
 * zbMATH 不给合作者网络，所以不能照抄。
 *
 * 可用的真实信号：
 *   1. **MSC 领域** → 连到该领域最重要的定理/猜想（领域锚点）
 *   2. **获奖级别** → 连到与其地位相称的核心定理
 *
 * 这属于"结构性关联"，权重必须低于真实引用边（0.15-0.25），
 * 并在 label 里标明来源，避免被误读成"此人证明了这个定理"。
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = join(HERE, '..')

const { RESEARCHER_EXTRA_NODES } = await import(new URL('../src/data/researchers-extra.js', import.meta.url).href)
const { buildGraph } = await import(new URL('../src/graph.js', import.meta.url).href)

const g = buildGraph()
const theoremById = new Map(g.nodes.filter((n) => !n.cluster && !n.researcher).map((n) => [n.id, n]))
const conjById = new Map(g.nodes.filter((n) => n.cluster).map((n) => [n.id, n]))

/* 每个 researcher field 对应一组"领域锚点"（用现有手写节点，人工精选的） */
const FIELD_ANCHORS = {
  ag: ['scheme', 'coherent-sheaf', 'derived-category', 'hodge-structure', 'chow-group', 'picard-group'],
  arith: ['etale-cohomology', 'weil-conjecture', 'galois-representation'],
  topo: ['fundamental-group', 'singular-cohomology', 'characteristic-class'],
  algebra: ['group-cohomology', 'representation-theory', 'hopf-algebra'],
  analysis: ['sobolev-space', 'elliptic-operator'],
  logic: ['model-theory', 'proof-theory'],
}

/* 各 field 的猜想锚点 */
const FIELD_CONJ = {
  ag: ['cn-hodge', 'cn-tate', 'cn-standard'],
  arith: ['cn-riemann', 'cn-bsd'],
  topo: ['cn-poincare'],
  algebra: ['cn-langlands'],
  analysis: ['cn-navier-stokes'],
  logic: ['cn-continuum'],
}

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

let fieldEdges = 0, conjEdges = 0
for (const r of RESEARCHER_EXTRA_NODES) {
  /* 1) 连到本领域的定理锚点（取实际存在的） */
  const anchors = (FIELD_ANCHORS[r.field] || []).filter((id) => theoremById.has(id))
  for (const a of anchors) {
    if (add(r.id, a, 0.18, 'MSC 领域', 'related')) fieldEdges++
  }
  /* 2) 连到本领域的猜想锚点 */
  const conjs = (FIELD_CONJ[r.field] || []).filter((id) => conjById.has(id))
  for (const c of conjs) {
    if (add(r.id, c, 0.14, 'MSC 领域', 'related')) conjEdges++
  }
}

console.log(`研究者 ${RESEARCHER_EXTRA_NODES.length} 人`)
console.log(`领域→定理边: ${fieldEdges}　领域→猜想边: ${conjEdges}　合计 ${links.length}`)

/* 检查还有多少人没有边 */
const touched = new Set()
for (const l of links) { touched.add(l[0]); touched.add(l[1]) }
const orphans = RESEARCHER_EXTRA_NODES.filter((r) => !touched.has(r.id))
console.log(`仍孤立: ${orphans.length}${orphans.length ? '（' + orphans.map((o) => o.name).slice(0, 5).join(', ') + '）' : ''}`)

const dest = join(ROOT, 'src', 'data', 'researchers-extra-links.js')
const body = `/**
 * src/data/researchers-extra-links.js — zbMATH 研究者与定理/猜想的关联。
 *
 * ⚠ 生成物。来源：kb-src/link-researchers.mjs
 *
 * ═══ 这些边的含义（重要，别误读）═══
 *
 * zbMATH **不提供合作者网络**，所以这里没有"谁与谁合作"的边。
 * 本文件只有**领域关联**：某人的主 MSC 分类 → 该领域的人工精选锚点定理。
 *
 * 标签统一写 "MSC 领域"，权重 0.14–0.18（低于真实引用边 0.3–1.0），
 * 表示"此人活跃在这个领域"，**不表示**"此人证明了这个定理"。
 *
 * 生成时间：${new Date().toISOString()}
 * 边数：${links.length}
 */

export const RESEARCHER_EXTRA_LINKS = ${JSON.stringify(links, null, 0).replace(/\],\[/g, '],\n  [')}
`
writeFileSync(dest, body, 'utf8')
console.log(`\n写入 ${dest}`)
