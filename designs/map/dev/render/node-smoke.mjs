// node 冒烟测试：用记录调用的假 ctx / Path2D 跑一遍 createRenderer → draw → pick，
// 验证各级别、选中、搜索状态下不抛异常，且图层调用顺序符合 SPEC §7.2。
// 用法：cd "/d/xiangmu/Formula Nebula" && node designs/map/dev/render/node-smoke.mjs
import { getGraph } from '../../../shared/kb.js'
import { buildWorld } from '../../src/world/index.js'
import { makeFrame, fitZoom, fitBoundsView } from '../../src/view.js'

class P2 { constructor() { this.n = 0 } moveTo() { this.n++ } lineTo() { this.n++ } quadraticCurveTo() { this.n++ } arc() { this.n++ } closePath() {} addPath(p) { this.n += p.n } }
globalThis.Path2D = P2
const log = []
const ctx = new Proxy({}, {
  get(t, k) {
    if (k in t) return t[k]
    return (...a) => { log.push(k); if (k === 'stroke' || k === 'fill') log.push(k + ':' + t.strokeStyle + '/' + t.fillStyle) }
  },
  set(t, k, v) { t[k] = v; return true },
})
const canvas = { getContext: () => ctx, style: {} }
const graph = getGraph()
const world = buildWorld(graph, { raster: false })
const { createRenderer } = await import('../../src/render/index.js')
const calls = { areas: 0, points: 0 }
const labeler = {
  drawAreas() { log.push('AREAS'); calls.areas++ },
  drawPoints() { log.push('POINTS'); calls.points++; return { animating: false } },
  hitTest() { return null },
}
const r = createRenderer(canvas, { world, graph, labeler })
r.resize(1600, 1000, 1)
const size = { w: 1600, h: 1000, dpr: 1 }
const zFit = fitZoom(world.fitBounds, 1600, 1000, 24)
const inset = { top: 0, right: 0, bottom: 0, left: 0 }
const base = fitBoundsView(world.fitBounds, size, inset, { pad: 24 })
const mk = (s, sel = null, hits = []) => {
  const n = sel ? graph.byId.get(sel) : null
  const neighbours = new Set(), linkKeys = new Set()
  if (n) for (const l of n.linkIds) { neighbours.add(l.source === sel ? l.target : l.source); linkKeys.add(l.key) }
  const st = { view: { ...base, z: zFit * s }, size, zFit, selection: { id: sel, neighbours, linkKeys, t0: 0 },
    hover: { id: null, linkKey: [...linkKeys][0] ?? null }, search: { set: new Set(hits) } }
  return makeFrame(st, [], 100)
}
const pl = { items: [], areas: [], stats: {} }
for (const s of [1, 2, 4, 8]) {
  log.length = 0
  const t0 = performance.now()
  const res = r.draw(mk(s), pl)
  console.log('s', s, 'calls', log.length, 'ms', (performance.now() - t0).toFixed(2), res)
}
log.length = 0
let res = r.draw(mk(2, 'cn-hodge'), pl)
console.log('select cn-hodge animating(t0=0 → 不动画)', res, 'AREAS idx', log.indexOf('AREAS'), 'POINTS idx', log.indexOf('POINTS'), 'n', log.length)
res = r.draw(mk(2, null, graph.nodes.slice(0, 30).map((n) => n.id)), pl)
console.log('search', res)
// pick：首都屏幕位置
const f = mk(1)
const cap = world.places.find((p) => p.kind === 'city' && p.tier === 0)
const [sx, sy] = f.toScreen(cap.x, cap.y)
console.log('pick capital', cap.id, '→', r.pick(sx + 2, sy + 1, f, pl))
const isl = world.places.find((p) => p.kind === 'island')
const [ix, iy] = f.toScreen(isl.x, isl.y)
console.log('pick island', isl.id, '→', r.pick(ix, iy, f, pl))
console.log('pick empty sea →', r.pick(3, 3, f, pl))
// 选中后动画
const fa = mk(2, 'cn-hodge'); fa.selectT0 = 50; fa.now = 300
console.log('anim', r.draw(fa, pl))
