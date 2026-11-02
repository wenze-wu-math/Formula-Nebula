/**
 * designs/map/dev/labels/dev.js — labels 模块的独立调试 / 压测页。
 *
 * 不依赖 render / ui / main（它们在并行开发中），自己画一个极简底图（国家环 + 符号点），
 * 只验证 labels：烘焙耗时、place() 耗时、重叠为 0、绘制效果。
 * ?stress=N 时把 world.places 换成 N 个随机点（复用真实节点的公式/名字，id 加后缀保证唯一）。
 *
 */
import { getGraph } from '../../../shared/kb.js'
import { buildWorld } from '../../src/world/index.js'
import { makeFrame, fitZoom, fitBoundsView } from '../../src/view.js'
import { state } from '../../src/state.js'
import { COUNTRY_COLORS, FAMILY_ORDER } from '../../src/constants.js'
import { symbolRadius } from '../../src/rules.js'

const q = new URLSearchParams(location.search)
const mod = await import('../../src/labels/index.js')

const graph = getGraph()
const tw0 = performance.now()
let world = buildWorld(graph, { raster: false })
const worldMs = performance.now() - tw0

// ── 压测：N 个随机点 ──
const N = Number(q.get('stress') || 0)
if (N > 0) {
  let s = 12345
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647)
  const src = graph.nodes.filter((n) => !n.researcher)
  const places = []
  for (let i = 0; i < N; i++) {
    const n = src[i % src.length]
    const f = FAMILY_ORDER[i % 8]
    const c = world.countryById.get(f)
    const a = rnd() * Math.PI * 2, r = Math.sqrt(rnd()) * (c.bbox.x1 - c.center.x) * 0.9
    const tier = i < 8 ? 0 : rnd() < 0.12 ? 1 : rnd() < 0.4 ? 2 : 3
    places.push({ id: n.id + '#' + i, node: n, kind: 'city', family: f, country: f, tier, importance: rnd(), x: c.center.x + Math.cos(a) * r, y: c.center.y + Math.sin(a) * r, r: 0 })
  }
  world = { ...world, places, placeById: new Map(places.map((p) => [p.id, p])) }
}

const canvas = document.getElementById('c')
const hud = document.getElementById('hud')
const ctx = canvas.getContext('2d')
const labeler = mod.createLabeler(world, graph)
const tb0 = performance.now()
let bakeInfo = { done: 0, total: 0 }
const bakeAll = labeler.bake((p) => { bakeInfo = p })
let readyMs = 0, allMs = 0
labeler.ready.then(() => { readyMs = performance.now() - tb0; state.dirty = true })
bakeAll.then(() => { allMs = performance.now() - tb0; state.dirty = true })

function resize() {
  const dpr = Math.min(2, devicePixelRatio || 1)
  state.size = { w: innerWidth, h: innerHeight, dpr }
  state.zFit = fitZoom(world.fitBounds, innerWidth, innerHeight)
  canvas.width = Math.round(innerWidth * dpr); canvas.height = Math.round(innerHeight * dpr)
  state.dirty = true
}
resize()
addEventListener('resize', resize)
state.view = fitBoundsView(world.fitBounds, state.size, state.inset, { pad: 24 })
if (q.get('s')) state.view.z = Number(q.get('s')) * state.zFit

function setSelection(id) {
  const n = graph.byId.get(String(id || '').split('#')[0])
  const neighbours = new Set(), linkKeys = new Set()
  if (n && id) for (const l of n.linkIds) { neighbours.add(l.source === n.id ? l.target : l.source); linkKeys.add(l.key) }
  state.selection = { id: id || null, neighbours, linkKeys, t0: performance.now() }
  state.dirty = true
}
if (q.get('sel')) setSelection(q.get('sel'))

let placement = null, placeMs = [], drawMs = 0
function draw(now) {
  requestAnimationFrame(draw)
  if (!state.dirty) return
  state.dirty = false
  const { dpr, w, h } = state.size
  const v = state.view
  const frame = makeFrame(state, [], now)
  const t0 = performance.now()
  placement = labeler.place(frame)
  const t1 = performance.now()
  placeMs.push(t1 - t0); if (placeMs.length > 60) placeMs.shift()
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.fillStyle = '#a9cfe2'; ctx.fillRect(0, 0, w, h)
  ctx.setTransform(dpr * v.z, 0, 0, dpr * v.z, dpr * (w / 2 - v.x * v.z), dpr * (h / 2 - v.y * v.z))
  for (const c of world.countries) {
    for (const r of c.rings) {
      ctx.beginPath(); ctx.moveTo(r[0], r[1]); for (let i = 2; i < r.length; i += 2) ctx.lineTo(r[i], r[i + 1]); ctx.closePath()
      ctx.fillStyle = c.colors.land; ctx.fill()
    }
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  labeler.drawAreas(ctx, placement, frame)
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  for (const p of world.places) {
    const [sx, sy] = frame.toScreen(p.x, p.y)
    if (sx < -20 || sy < -20 || sx > w + 20 || sy > h + 20) continue
    ctx.beginPath(); ctx.arc(sx, sy, symbolRadius(p, frame.level, v.z), 0, Math.PI * 2)
    ctx.fillStyle = p.kind === 'city' ? COUNTRY_COLORS[p.family].ink : p.kind === 'island' ? '#f3ead2' : '#24486a'
    ctx.fill()
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  const anim = labeler.drawPoints(ctx, placement, frame).animating
  if (anim) state.dirty = true
  drawMs = performance.now() - t1
  const st = stats()
  hud.textContent = `s ${st.s.toFixed(2)}  L${st.level}  labels ${st.visibleLabels} (公式 ${st.formulaLabels} 名字 ${st.nameLabels})  areas ${st.areaLabels}  overlaps ${st.overlappingLabels}\n` +
    `place 中位 ${st.placeMs.toFixed(2)} ms / 最大 ${st.placeMaxMs.toFixed(2)} ms  draw ${drawMs.toFixed(1)} ms  烘焙 ${bakeInfo.done}/${bakeInfo.total}  ready ${readyMs.toFixed(0)} ms  全部 ${allMs.toFixed(0)} ms  world ${worldMs.toFixed(0)} ms`
}
requestAnimationFrame(draw)

function stats() {
  const s = [...placeMs].sort((a, b) => a - b)
  return {
    s: state.view.z / state.zFit, level: makeFrame(state, [], 0).level,
    visibleLabels: placement ? placement.items.length : 0,
    overlappingLabels: placement ? labeler.countOverlaps(placement) : 0,
    formulaLabels: placement ? placement.items.filter((i) => i.mode === 'formula').length : 0,
    nameLabels: placement ? placement.items.filter((i) => i.mode === 'name').length : 0,
    areaLabels: placement ? placement.areas.length : 0,
    placeMs: s[s.length >> 1] || 0, placeMaxMs: s[s.length - 1] || 0, drawMs,
    bake: bakeInfo, readyMs, allMs, bakeStats: labeler.bakeStats,
  }
}

// 拖拽 / 滚轮
let drag = null
canvas.addEventListener('pointerdown', (e) => { drag = { x: e.clientX, y: e.clientY, vx: state.view.x, vy: state.view.y } })
addEventListener('pointerup', () => { drag = null })
canvas.addEventListener('pointermove', (e) => {
  if (!drag) return
  state.view = { ...state.view, x: drag.vx - (e.clientX - drag.x) / state.view.z, y: drag.vy - (e.clientY - drag.y) / state.view.z }
  state.dirty = true
})
canvas.addEventListener('wheel', (e) => {
  e.preventDefault()
  const v = state.view, { w, h } = state.size
  const wx = (e.clientX - w / 2) / v.z + v.x, wy = (e.clientY - h / 2) / v.z + v.y
  const z = v.z * Math.exp(-e.deltaY * 0.0015)
  state.view = { x: wx - (e.clientX - w / 2) / z, y: wy - (e.clientY - h / 2) / z, z }
  state.dirty = true
}, { passive: false })
canvas.addEventListener('click', (e) => { const id = labeler.hitTest(e.clientX, e.clientY, placement); setSelection(id) })

/** 让 placeMs 有足够样本：连续重画 n 帧（每帧小幅平移） */
async function bench(n = 60) {
  placeMs = []
  for (let i = 0; i < n; i++) {
    state.view = { ...state.view, x: state.view.x + (i % 2 ? 0.5 : -0.5) }
    state.dirty = true
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
  }
  return stats()
}

window.__dev = {
  get ready() { return readyMs > 0 && !!placement },
  stats, bench, labeler, world,
  setS(s, x, y) { state.view = { x: x ?? state.view.x, y: y ?? state.view.y, z: s * state.zFit }; state.dirty = true; return new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => r(stats())))) },
  select(id) { setSelection(id); return new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => r(stats())))) },
  allBaked: () => bakeAll.then(() => stats()),
}
