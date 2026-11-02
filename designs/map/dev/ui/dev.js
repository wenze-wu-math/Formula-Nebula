/**
 * designs/map/dev/ui/dev.js — ui 模块的独立调试页。
 *
 * 只为测 UI：用真实 world（失败则退回空世界）+ 极简画布（圆点），actions 全部在这里用简易实现填上
 * （suggest/search 用编排模块的纯函数 searchNodes，相机瞬移）。不依赖 render/labels 的进度。
 * ?obs=1 时把 obstacles() 矩形画成红色虚线框，检查避让矩形是否贴合浮层。
 */
import { getGraph } from '../../../shared/kb.js'
import { state, bus, actions, invalidate } from '../../src/state.js'
import { fitZoom, clampView, fitBoundsView, makeFrame } from '../../src/view.js'
import { levelOf, symbolRadius } from '../../src/rules.js'
import { COUNTRY_COLORS, PANEL_W } from '../../src/constants.js'
import { buildWorld } from '../../src/world/index.js'
import { searchNodes } from '../../src/search.js'
import { initUI } from '../../src/ui/app.js'

const canvas = document.getElementById('map')
const ctx = canvas.getContext('2d')
const graph = getGraph()
state.graph = graph
const world = buildWorld(graph, { raster: false })
state.world = world
const log = []

function homeView() { return clampView(fitBoundsView(world.fitBounds, state.size, state.inset, { pad: 24 }), state.size, state.zFit, world.bounds) }

Object.assign(actions, {
  select(id) {
    const n = graph.byId.get(id)
    if (!n) { console.warn('no such id', id); return Promise.resolve() }
    const prev = state.selection.id
    const neighbours = new Set(), linkKeys = new Set()
    for (const l of n.linkIds) { neighbours.add(l.source === id ? l.target : l.source); linkKeys.add(l.key) }
    state.selection = { id, neighbours, linkKeys, t0: performance.now() }
    bus.emit('select', { id, prev })
    const p = world.placeById.get(id)
    if (p) state.view = clampView({ x: p.x + (state.inset.right / 2) / state.view.z, y: p.y, z: Math.max(state.view.z, 2 * state.zFit) }, state.size, state.zFit, world.bounds)
    log.push(['select', id]); invalidate()
    return Promise.resolve()
  },
  deselect() {
    const prev = state.selection.id
    if (!prev) return
    state.selection = { id: null, neighbours: new Set(), linkKeys: new Set(), t0: 0 }
    bus.emit('select', { id: null, prev }); log.push(['deselect']); invalidate()
  },
  suggest: (q, limit = 12) => searchNodes(graph, q, { limit }),
  search(q) {
    const query = String(q || '').trim()
    if (!query) { actions.clearSearch(); return [] }
    const ids = searchNodes(graph, query).map((r) => r.id)
    state.search = { query, ids, set: new Set(ids) }
    bus.emit('search', { query, ids }); log.push(['search', query, ids.length]); invalidate()
    if (ids.length === 1) actions.select(ids[0])
    return ids
  },
  clearSearch() { state.search = { query: '', ids: [], set: new Set() }; bus.emit('search', { query: '', ids: [] }); log.push(['clearSearch']); invalidate() },
  flyTo(t) { state.view = clampView({ x: t.x, y: t.y, z: t.s ? t.s * state.zFit : t.z }, state.size, state.zFit, world.bounds); invalidate(); return Promise.resolve() },
  flyToBounds(b, { pad = 60 } = {}) { state.view = clampView(fitBoundsView(b, state.size, state.inset, { pad }), state.size, state.zFit, world.bounds); log.push(['flyToBounds']); invalidate(); return Promise.resolve() },
  zoomBy(f) { state.view = clampView({ ...state.view, z: state.view.z * f }, state.size, state.zFit, world.bounds); log.push(['zoomBy', f]); invalidate() },
  home() { state.view = homeView(); log.push(['home']); invalidate(); return Promise.resolve() },
  hoverLink(key) { state.hover = { ...state.hover, linkKey: key }; log.push(['hoverLink', key]); invalidate() },
  setInset(p) { state.inset = { ...state.inset, ...p }; log.push(['setInset', JSON.stringify(p)]); invalidate() },
})

const ui = initUI({ graph, world })

function resize() {
  const w = canvas.clientWidth, h = canvas.clientHeight, dpr = Math.min(2, devicePixelRatio || 1)
  const first = state.size.w <= 1
  state.size = { w, h, dpr }
  state.zFit = fitZoom(world.fitBounds, w, h)
  canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr)
  if (first) state.view = homeView()
  bus.emit('resize', { w, h }); invalidate()
}
addEventListener('resize', resize)
resize()

/* 极简画布：国家填色 + 城市圆点（只为给 UI 一个背景） */
const showObs = new URLSearchParams(location.search).has('obs')
let lastObs = []
function draw() {
  requestAnimationFrame(draw)
  if (!state.dirty) return
  state.dirty = false
  const obs = ui.obstacles()
  lastObs = obs
  const f = makeFrame(state, obs, performance.now())
  const { dpr, w, h } = state.size, v = state.view
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.fillStyle = '#a9cfe2'; ctx.fillRect(0, 0, w, h)
  ctx.setTransform(dpr * v.z, 0, 0, dpr * v.z, dpr * (w / 2 - v.x * v.z), dpr * (h / 2 - v.y * v.z))
  for (const c of world.countries) {
    ctx.beginPath()
    for (const r of c.rings) { ctx.moveTo(r[0], r[1]); for (let i = 2; i < r.length; i += 2) ctx.lineTo(r[i], r[i + 1]); ctx.closePath() }
    ctx.fillStyle = c.colors.land; ctx.fill()
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  for (const p of world.places) {
    const [sx, sy] = f.toScreen(p.x, p.y)
    if (sx < -20 || sy < -20 || sx > w + 20 || sy > h + 20) continue
    ctx.beginPath(); ctx.arc(sx, sy, p.kind === 'island' ? Math.max(4, p.r * v.z) : symbolRadius(p, f.level, v.z), 0, Math.PI * 2)
    ctx.fillStyle = p.kind === 'city' ? COUNTRY_COLORS[p.country].ink : p.kind === 'port' ? '#24486a' : '#f3ead2'
    ctx.globalAlpha = f.selectedId && f.selectedId !== p.id && !f.neighbours.has(p.id) ? 0.3 : 1
    ctx.fill()
    if (f.hits.has(p.id)) { ctx.strokeStyle = '#d9a521'; ctx.lineWidth = 2; ctx.stroke() }
    if (f.selectedId === p.id) { ctx.strokeStyle = '#d63a55'; ctx.lineWidth = 2.5; ctx.stroke() }
  }
  ctx.globalAlpha = 1
  if (showObs) { ctx.strokeStyle = 'rgba(214,58,85,.9)'; ctx.setLineDash([4, 3]); ctx.lineWidth = 1; for (const r of obs) ctx.strokeRect(r.x, r.y, r.w, r.h); ctx.setLineDash([]) }
  const s = v.z / state.zFit
  bus.emit('view', { ...v, s, level: levelOf(s) })
}
requestAnimationFrame(draw)

/* 模拟烘焙进度 */
let done = 0
const total = 464
const bakeTimer = setInterval(() => { done = Math.min(total, done + 37); bus.emit('bake', { done, total }); if (done >= total) clearInterval(bakeTimer) }, 120)

/* Esc 链（简化版，与 SPEC §10.4 一致） */
addEventListener('keydown', (e) => {
  if (e.defaultPrevented) return
  if (e.key === 'Escape') {
    if (ui.closeTransient()) { log.push(['esc', 'transient']); return }
    if (state.selection.id) { actions.deselect(); return }
    if (state.search.query) { actions.clearSearch(); return }
    actions.home()
  }
})

/* 画布悬停：最近城市 → hover 事件 */
canvas.addEventListener('pointermove', (e) => {
  const r = canvas.getBoundingClientRect(), sx = e.clientX - r.left, sy = e.clientY - r.top
  const f = makeFrame(state, [], 0)
  let best = null, bd = 12
  for (const p of world.places) { const [x, y] = f.toScreen(p.x, p.y); const d = Math.hypot(x - sx, y - sy); if (d < bd) { bd = d; best = p.id } }
  if (best !== state.hover.id) { state.hover = { ...state.hover, id: best, sx, sy }; bus.emit('hover', { id: best, sx, sy }) }
})
canvas.addEventListener('click', (e) => {
  if (state.hover.id) actions.select(state.hover.id); else actions.deselect()
})

window.__design = {
  ready: false, graph, world, state, ui, log,
  select: (id) => actions.select(id), deselect: () => actions.deselect(), search: (q) => actions.search(q),
  view: () => ({ ...state.view, s: state.view.z / state.zFit, selected: state.selection.id, inset: { ...state.inset } }),
  setView: (v) => { state.view = clampView({ ...state.view, ...v, z: v.s ? v.s * state.zFit : (v.z ?? state.view.z) }, state.size, state.zFit, world.bounds); invalidate() },
  obstacles: () => lastObs,
  stats: () => ({ visibleLabels: 0, overlappingLabels: 0 }),
  PANEL_W,
}
requestAnimationFrame(() => requestAnimationFrame(() => {
  document.documentElement.classList.add('is-ready')
  window.__design.ready = true
  bus.emit('ready')
}))
