/**
 * designs/map/dev/labels/node-test.mjs — labels 纯逻辑自测（node 下跑，不需要浏览器）。
 *   cd "/d/xiangmu/Formula Nebula" && node designs/map/dev/labels/node-test.mjs
 * 用当前 world（占位或真实）+ 近似 measureText，在 L0–L3、选中、搜索、随机平移下断言 countOverlaps = 0，
 * 并统计 place() 耗时。
 */
import { getGraph } from '../../../shared/kb.js'
import { buildWorld } from '../../src/world/index.js'
import { makeFrame, fitZoom, fitBoundsView } from '../../src/view.js'
import { createBaker } from '../../src/labels/bake.js'
import { createPlacer } from '../../src/labels/place.js'
import { countOverlaps } from '../../src/labels/draw.js'

/** 近似字宽：CJK = 1em，其它 0.56em */
function measure(font, text) {
  const px = parseFloat(font.match(/([\d.]+)px/)[1])
  let w = 0
  for (const ch of text) w += /[　-鿿＀-￯]/.test(ch) ? px : px * 0.56
  return w
}

const graph = getGraph()
const world = buildWorld(graph, { raster: false })
const baker = createBaker(world)
const tb = performance.now()
baker.layoutOnly()
const st = { ready: 0, failed: 0, tooWide: 0 }
for (const e of baker.entries.values()) st[e.state] = (st[e.state] || 0) + 1
console.log('layout', (performance.now() - tb).toFixed(0), 'ms', st, 'stub world:', !!world.meta?.stub)

const placer = createPlacer(world, baker, measure)
const size = { w: 1600, h: 1000, dpr: 1 }
const zFit = fitZoom(world.fitBounds, size.w, size.h)
const home = fitBoundsView(world.fitBounds, size, { top: 0, right: 0, bottom: 0, left: 0 }, { pad: 24 })
const ui = [{ x: 10, y: 10, w: 372, h: 60 }, { x: 10, y: 760, w: 312, h: 230 }, { x: 1440, y: 830, w: 150, h: 160 }]

function state(view, sel = null, hits = []) {
  const n = sel ? graph.byId.get(sel) : null
  const neighbours = new Set(), linkKeys = new Set()
  if (n) for (const l of n.linkIds) { neighbours.add(l.source === sel ? l.target : l.source); linkKeys.add(l.key) }
  return { view, size, zFit, selection: { id: sel, neighbours, linkKeys, t0: 0 }, hover: { id: null, linkKey: null }, search: { set: new Set(hits) } }
}

let fail = 0, now = 1000
function run(label, view, sel, hits, uiRects = ui) {
  let pl, ms = []
  for (let k = 0; k < 6; k++) { now += 16; pl = placer.place(makeFrame(state(view, sel, hits), uiRects, now)); ms.push(pl.stats.ms) }
  const ov = countOverlaps(pl)
  ms.sort((a, b) => a - b)
  if (ov) fail++
  console.log(label.padEnd(28), `items ${String(pl.items.length).padStart(3)} (f ${pl.stats.formula} n ${pl.stats.name}) areas ${pl.areas.filter((a) => a.active).length}/${pl.areas.length} cand ${pl.stats.candidates} overlaps ${ov} place ${ms[3].toFixed(2)}ms (area ${pl.stats.areaMs.toFixed(2)})`)
  return pl
}

const pl0 = run('L0 home', home)
console.log('  L0 formulas:', pl0.items.filter((i) => i.mode === 'formula').map((i) => i.id).join(' '))
for (const s of [1, 1.8, 2.2, 3.4, 4.5, 6.5, 9, 14]) run(`s=${s}`, { x: home.x, y: home.y, z: s * zFit })
run('select cn-hodge s=2.2', { ...world.placeById.get('cn-hodge'), z: 2.2 * zFit }, 'cn-hodge')
run('select nullstellensatz', { ...world.placeById.get('nullstellensatz'), z: 2.6 * zFit }, 'nullstellensatz')
const hits = graph.nodes.filter((n) => /同调/.test(n.name)).map((n) => n.id)
run(`search 同调 (${hits.length})`, { x: home.x, y: home.y, z: 1.4 * zFit }, null, hits)
// 随机平移缩放
let rs = 7
const rnd = () => ((rs = (rs * 16807) % 2147483647) / 2147483647)
let worst = 0, maxMs = 0
for (let i = 0; i < 200; i++) {
  const s = 0.6 + rnd() * 12
  const v = { x: (rnd() * 2 - 1) * 900, y: (rnd() * 2 - 1) * 600, z: s * zFit }
  const ids = [...world.placeById.keys()]
  const sel = rnd() < 0.3 ? ids[(rnd() * ids.length) | 0] : null
  now += 16
  const pl = placer.place(makeFrame(state(v, sel), ui, now))
  const ov = countOverlaps(pl)
  maxMs = Math.max(maxMs, pl.stats.ms)
  if (ov) { worst++; if (worst < 4) console.log('  overlap at', JSON.stringify(v), sel, ov) }
}
console.log('random 200: frames with overlap', worst, 'max place ms', maxMs.toFixed(2))
if (worst) fail++
console.log(fail ? 'FAIL' : 'OK')
process.exit(fail ? 1 : 0)
