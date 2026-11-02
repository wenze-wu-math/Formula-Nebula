/**
 * designs/atlas/check-layout-hash.mjs — 布局指纹（回归护栏，非交付物）。
 *
 * 用途：几何尺度重构前后，同一份数据必须产出**逐位一致**的布局。
 * k=1 时任何差异都说明重构破坏了既有行为。
 *
 * 用法：node designs/atlas/check-layout-hash.mjs [倍数]
 */
import { createHash } from 'node:crypto'
import { buildGraph } from '../../src/graph.js'
import { buildAtlas } from './layout.js'

const mult = Number(process.argv[2] || 1)

function scaleGraph(g, m) {
  if (m === 1) return g
  const nodes = [], byId = new Map()
  for (let k = 0; k < m; k++) for (const n of g.nodes) {
    const id = k === 0 ? n.id : `${n.id}__s${k}`
    const c = { ...n, id }; nodes.push(c); byId.set(id, c)
  }
  const links = []
  for (let k = 0; k < m; k++) for (const l of g.links) {
    const s = k === 0 ? l.source : `${l.source}__s${k}`
    const t = k === 0 ? l.target : `${l.target}__s${k}`
    if (byId.has(s) && byId.has(t)) links.push({ ...l, source: s, target: t })
  }
  return { nodes, links, byId, stats: g.stats, families: g.families }
}

const measure = (text) => ({ w: String(text).length * 7.2, h: 14 })
const atlas = buildAtlas(scaleGraph(buildGraph(), mult), { measure, resFont: 'italic 12.5px serif' })

/* 指纹只取几何量，且按稳定顺序拼接 */
const parts = []
for (const s of atlas.stars) parts.push(`S|${s.id}|${s.x}|${s.y}|${s.mag}`)
for (const d of atlas.dsos) parts.push(`D|${d.id}|${d.x}|${d.y}|${d.tier}`)
for (const r of atlas.researchers) parts.push(`R|${r.id}|${r.x}|${r.y}`)
parts.push(`rCap|${atlas.rCap}`)

const h = createHash('sha256').update(parts.join('\n')).digest('hex').slice(0, 32)
console.log(`mult=${mult}  stars=${atlas.stars.length}  rCap=${atlas.rCap}`)
console.log(`LAYOUT_SHA256=${h}`)
