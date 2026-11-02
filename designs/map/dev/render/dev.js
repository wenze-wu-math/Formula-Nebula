/**
 * dev/render/dev.js — render 模块的独立调试页（不依赖 main.js / interact / ui）。
 *  · 地图模式：用真实 graph + buildWorld 构造世界，按 URL 参数（s / sel / hits / hover / x / y）渲染单帧，
 *    并提供 window.__dev.bench(n) 测 drawMs。
 *  · 样张模式（?mode=specimen）：手工构造的迷你世界，把所有城市 tier、港口、全部道路 kind、全部岛屿状态各画一个，
 *    左图常态、右图选中态，用来对照 SPEC §3.3。
 */
import { getGraph } from '../../../shared/kb.js'
import { buildWorld } from '../../src/world/index.js'
import { createRenderer } from '../../src/render/index.js'
import { makeFrame, fitZoom, fitBoundsView } from '../../src/view.js'
import { drawCity, drawPort, drawFlag, drawCross } from '../../src/render/symbols.js'
import { COUNTRY_COLORS, RIPPLES, ROAD_BEND, FONTS, ISLAND_STATUS } from '../../src/constants.js'

const q = new URLSearchParams(location.search)
const dpr = Math.min(2, window.devicePixelRatio || 1)
const info = document.getElementById('info')

/** 最小 labeler：只画国名（不避让），点标签不画；供 render 单独计时 */
function stubLabeler(world) {
  return {
    drawAreas(ctx, placement, frame) {
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      for (const c of world.countries) {
        const [x, y] = frame.toScreen(c.center.x, c.center.y)
        ctx.font = `700 ${frame.level >= 2 ? 30 : 20}px ${FONTS.country}`
        ctx.globalAlpha = frame.level >= 2 ? 0.28 : 0.85
        ctx.lineWidth = 4; ctx.strokeStyle = c.colors.land; ctx.strokeText(c.zh, x, y - 30)
        ctx.fillStyle = c.colors.ink; ctx.fillText(c.zh, x, y - 30)
      }
      ctx.globalAlpha = 1
    },
    drawPoints() { return { animating: false } },
    hitTest() { return null },
  }
}

function stateFor(world, graph, size, opts) {
  const zFit = fitZoom(world.fitBounds, size.w, size.h, 24)
  const home = fitBoundsView(world.fitBounds, size, { top: 0, right: 0, bottom: 0, left: 0 }, { pad: 24 })
  const sel = opts.sel || null
  const neighbours = new Set(), linkKeys = new Set()
  const n = sel && graph && graph.byId.get(sel)
  if (n) for (const l of n.linkIds) { neighbours.add(l.source === sel ? l.target : l.source); linkKeys.add(l.key) }
  else if (sel && opts.links) for (const k of opts.links) linkKeys.add(k)
  if (sel && opts.neighbours) for (const id of opts.neighbours) neighbours.add(id)
  let x = home.x, y = home.y
  if (opts.x != null) { x = opts.x; y = opts.y } else if (sel && world.placeById.get(sel)) { x = world.placeById.get(sel).x; y = world.placeById.get(sel).y }
  return {
    view: { x, y, z: zFit * (opts.s || 1) }, size, zFit,
    selection: { id: sel, neighbours, linkKeys, t0: opts.t0 ?? 0 },
    hover: { id: opts.hover || null, linkKey: opts.hoverLink || null, sx: 0, sy: 0 },
    search: { query: '', ids: opts.hits || [], set: new Set(opts.hits || []) },
  }
}

async function mapMode() {
  const canvas = document.getElementById('map')
  const graph = getGraph()
  const t0 = performance.now()
  // ?world=build：直接用 M1 尚未接入入口的真实流水线（world/build.js），提前在真实几何上自测
  const build = q.get('world') === 'build' ? (await import('../../src/world/build.js')).buildWorld : buildWorld
  const world = build(graph, { raster: true })
  const worldMs = performance.now() - t0
  let labeler = stubLabeler(world)
  if (q.get('labels') === '1') {
    const { createLabeler } = await import('../../src/labels/index.js')
    labeler = createLabeler(world, graph)
    labeler.bake(() => {})
    await labeler.ready
  }
  const size = { w: innerWidth, h: innerHeight, dpr }
  const renderer = createRenderer(canvas, { world, graph, labeler })
  renderer.resize(size.w, size.h, dpr)
  const opts = {
    s: Number(q.get('s') || 1), sel: q.get('sel'), hover: q.get('hover'),
    hits: q.get('hits') ? q.get('hits').split(',') : [],
    x: q.get('x') != null ? Number(q.get('x')) : null, y: q.get('y') != null ? Number(q.get('y')) : null,
  }
  const st = stateFor(world, graph, size, opts)
  let placement = { items: [], areas: [], stats: {} }
  function render(now = performance.now()) {
    const f = makeFrame(st, [], now)
    if (labeler.place) placement = labeler.place(f)
    const a = performance.now()
    const r = renderer.draw(f, placement)
    return { ms: performance.now() - a, ...r, level: f.level, s: f.s }
  }
  const r0 = render()
  window.__dev = {
    world, graph, renderer, st, render,
    /** n 帧逐帧小幅平移，返回 drawMs 的中位数 / 平均（不含 labels.place） */
    async bench(n = 60) {
      const ms = []
      for (let i = 0; i < n; i++) {
        st.view = { ...st.view, x: st.view.x + 0.7 }
        await new Promise((r) => requestAnimationFrame(r))
        ms.push(render().ms)
      }
      ms.sort((a, b) => a - b)
      return { median: +ms[n >> 1].toFixed(2), mean: +(ms.reduce((s, v) => s + v, 0) / n).toFixed(2), max: +ms[n - 1].toFixed(2) }
    },
    pick(sx, sy) { return renderer.pick(sx, sy, makeFrame(st, [], performance.now()), placement) },
    set(o) { Object.assign(st, stateFor(world, graph, size, o)); return render() },
    ready: true,
  }
  info.textContent = `world ${worldMs.toFixed(0)}ms  stub=${!!world.meta?.stub}  s=${r0.s.toFixed(2)} L${r0.level}  draw ${r0.ms.toFixed(2)}ms`
}

/* ───────── 样张 ───────── */
function wobblyDisc(cx, cy, R, n = 90, half = 0) {
  // half: 0 全圆；-1 左半（x ≤ 边界）；1 右半
  const pts = []
  const border = (y) => cx + 10 * Math.sin(y / 30)
  for (let i = 0; i < n; i++) {
    const t = (i / n) * Math.PI * 2
    const rr = R * (1 + 0.06 * Math.sin(3 * t) + 0.04 * Math.cos(5 * t))
    let x = cx + Math.cos(t) * rr, y = cy + Math.sin(t) * rr
    if (half === -1 && x > border(y)) x = border(y)
    if (half === 1 && x < border(y)) x = border(y)
    pts.push(x, y)
  }
  return new Float32Array(pts)
}
function blob(cx, cy, r, seed, n = 30) {
  const a = new Float32Array(n * 2)
  for (let i = 0; i < n; i++) {
    const t = (i / n) * Math.PI * 2
    const rr = r * (1 + 0.18 * Math.sin(3 * t + seed) + 0.1 * Math.cos(2 * t + seed * 2))
    a[2 * i] = cx + Math.cos(t) * rr; a[2 * i + 1] = cy + Math.sin(t) * rr
  }
  return a
}
function offsetRing(ring, cx, cy, d) {
  const a = new Float32Array(ring.length)
  for (let i = 0; i < ring.length; i += 2) {
    const dx = ring[i] - cx, dy = ring[i + 1] - cy, L = Math.hypot(dx, dy) || 1
    a[i] = ring[i] + (dx / L) * d; a[i + 1] = ring[i + 1] + (dy / L) * d
  }
  return a
}

function specimenWorld() {
  const R = 150
  const full = wobblyDisc(0, 0, R)
  const L = wobblyDisc(0, 0, R, 90, -1), Rr = wobblyDisc(0, 0, R, 90, 1)
  const bpts = []
  for (let y = -R * 0.97; y <= R * 0.97; y += 6) bpts.push(10 * Math.sin(y / 30), y)
  const mkC = (id, ring, cx) => ({ id, zh: id, latin: '', colors: COUNTRY_COLORS[id], rings: [ring], center: { x: cx, y: 0 },
    labelPath: new Float32Array([cx - 40, 0, cx + 40, 0]), labelAngle: 0, area: 1, bbox: { x0: -R, y0: -R, x1: R, y1: R }, capitalId: null, placeIds: [] })
  const countries = [mkC('modern', L, -70), mkC('cohomology', Rr, 70)]
  const node = (id) => ({ id, name: id, en: id, importance: 0.8, linkIds: [] })
  const city = (id, fam, tier, x, y) => ({ id, node: node(id), kind: 'city', family: fam, country: fam, tier, importance: 0.8, x, y, r: 0 })
  const places = [
    city('m0', 'modern', 0, -80, -60), city('m1', 'modern', 1, -100, 20), city('m2', 'modern', 2, -40, 70), city('m3', 'modern', 3, -60, -10),
    city('m3b', 'modern', 3, -110, -30), city('c0', 'cohomology', 0, 80, -50), city('c1', 'cohomology', 1, 60, 40),
    city('c2', 'cohomology', 2, 110, 10), city('c3', 'cohomology', 3, 40, -10),
  ]
  const statuses = ['open', 'partial', 'proved', 'disproved', 'heuristic']
  statuses.forEach((st, i) => {
    const t = -Math.PI * 0.8 + i * 0.4
    const x = Math.cos(t) * 230 + 40, y = Math.sin(t) * 210 + 10
    const r = 14 + (i % 2) * 4
    places.push({ id: 'i-' + st, node: node('i-' + st), kind: 'island', family: 'conjecture', country: null, tier: 1, importance: 0.9,
      status: st, x, y, r, ring: blob(x, y, r, i + 1) })
  })
  places.push({ id: 'port', node: node('port'), kind: 'port', family: 'researcher', country: null, tier: 2, importance: 0.5, x: -40, y: 170, r: 0, pier: { x: -36, y: 148 } })
  places.push({ id: 'port2', node: node('port2'), kind: 'port', family: 'researcher', country: null, tier: 2, importance: 0.5, x: 165, y: 70, r: 0, pier: { x: 146, y: 62 } })
  const placeById = new Map(places.map((p) => [p.id, p]))
  const TYPES = ['implies', 'generalizes', 'depends', 'defines', 'analogy', 'equivalent', 'provenance', 'computes', 'sameFamily']
  const spec = [
    ['m3', 'm2', 'road'], ['m3b', 'm1', 'road'], ['m0', 'm1', 'highway'], ['m3', 'c3', 'crossroad'], ['m1', 'c1', 'crossroad'],
    ['m0', 'c0', 'crossway'], ['m2', 'c2', 'crossway'], ['c0', 'i-proved', 'ferry'], ['m0', 'i-open', 'ferry'],
    ['i-open', 'i-partial', 'lane'], ['port', 'm2', 'expedition'], ['c1', 'c2', 'road'], ['c0', 'c2', 'highway'],
    ['m0', 'i-partial', 'ferry'], ['m0', 'm3', 'road'], ['port2', 'm0', 'expedition'],
  ]
  const roads = spec.map(([a, b, kind], i) => {
    const A = placeById.get(a), B = placeById.get(b)
    const dx = B.x - A.x, dy = B.y - A.y, len = Math.hypot(dx, dy)
    const k = ((i * 0.37) % 1 * 2 - 1) * ROAD_BEND
    return { key: `${a}|${b}`, link: { key: `${a}|${b}` }, kind, hero: kind === 'highway' || kind === 'crossway' || (kind === 'ferry' && i === 7),
      a, b, type: TYPES[i % TYPES.length], weight: 0.5 + (i % 4) * 0.1,
      x0: A.x, y0: A.y, cx: (A.x + B.x) / 2 - dy * k, cy: (A.y + B.y) / 2 + dx * k, x1: B.x, y1: B.y, len }
  })
  const islandRings = places.filter((p) => p.kind === 'island')
  const ripples = RIPPLES.map((rp) => ({ d: rp.d, rings: [offsetRing(full, 0, 0, rp.d), ...islandRings.map((p) => offsetRing(p.ring, p.x, p.y, rp.d))] }))
  const bounds = { x0: -330, y0: -280, x1: 330, y1: 280 }
  return {
    bounds, fitBounds: bounds, places, placeById, countries, countryById: new Map(countries.map((c) => [c.id, c])),
    coast: [full], borders: [{ a: 'cohomology', b: 'modern', pts: new Float32Array(bpts) }], ripples,
    roads, roadByKey: new Map(roads.map((r) => [r.key, r])), seaLabels: [],
    rasters: { ocean: null, relief: null, rect: bounds }, countryAt: () => null, meta: { stub: true },
  }
}

function specimenMode() {
  document.body.classList.add('specimen')
  const host = document.getElementById('spec')
  const world = specimenWorld()
  const labeler = stubLabeler(world)
  const size = { w: 760, h: 640, dpr }
  const panel = (caption, opts, level) => {
    const fig = document.createElement('figure')
    const c = document.createElement('canvas')
    const cap = document.createElement('figcaption'); cap.textContent = caption
    fig.append(c, cap); host.append(fig)
    const r = createRenderer(c, { world, graph: null, labeler })
    r.resize(size.w, size.h, dpr)
    const st = stateFor(world, null, size, { x: 0, y: 0, ...opts })
    // 样张的 s 直接指定级别（L1 ≈ 2，L2 ≈ 4）；世界不大，所以把 z 设成适合看清的值
    st.view.z = opts.z; st.zFit = opts.z / ({ 0: 1, 1: 2, 2: 4, 3: 8 }[level])
    const f = makeFrame(st, [], opts.now ?? 1e9)
    r.draw(f, { items: [], areas: [], stats: {} })
    // 注字：每个对象的说明
    const ctx = c.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.font = `11px ${FONTS.city}`; ctx.fillStyle = '#2b2a26'; ctx.textBaseline = 'middle'
    ctx.lineWidth = 3; ctx.strokeStyle = '#fbf8f1'
    const note = (txt, x, y, dx = 9, dy = 0) => { const [sx, sy] = f.toScreen(x, y); ctx.strokeText(txt, sx + dx, sy + dy); ctx.fillText(txt, sx + dx, sy + dy) }
    const T = ['首都', '大城市', '城镇', '村落']
    for (const p of world.places) {
      if (p.kind === 'city') note(T[p.tier], p.x, p.y)
      else if (p.kind === 'port') note('港口', p.x, p.y)
      else note(`${ISLAND_STATUS[p.status].zh} ${p.status}`, p.x, p.y, p.r * f.view.z + 4)
    }
    for (const rd of world.roads) note(rd.kind, (rd.x0 + rd.x1) / 2 * 0.5 + rd.cx * 0.5, (rd.y0 + rd.y1) / 2 * 0.5 + rd.cy * 0.5, 0, -8)
    return r
  }
  panel('L2 常态：全部道路 kind（expedition 除外，它只在选中时出现）、全部岛屿状态', { s: 4, z: 1.15 }, 2)
  panel('L2 选中首都 m0（遮罩 + 高亮路线含 expedition + 选中圈），悬停 m0↔c0', {
    s: 4, z: 1.15, sel: 'm0', now: 1e9, t0: 1,
    links: world.roads.filter((r) => r.a === 'm0' || r.b === 'm0').map((r) => r.key),
    neighbours: world.roads.filter((r) => r.a === 'm0' || r.b === 'm0').map((r) => (r.a === 'm0' ? r.b : r.a)),
    hoverLink: 'm0|c0',
  }, 2)
  panel('L0 总览（只有 crossway，村落 alpha .5）', { s: 1, z: 0.9 }, 0)
  panel('搜索命中 m1, c2, i-open（金圈 + .35 遮罩）', { s: 4, z: 1.15, hits: ['m1', 'c2', 'i-open'] }, 2)
  panel('L3 近景（z×3）：符号细节 + lane 海道', { s: 8, z: 3.2, x: -40, y: -60 }, 3)
  panel('L3 近景选中 i-partial（岛屿强调重画 + 海道/航线高亮）', { s: 8, z: 3.2, x: -40, y: -60, sel: 'i-partial', t0: 1, now: 1e9,
    links: world.roads.filter((r) => r.a === 'i-partial' || r.b === 'i-partial').map((r) => r.key),
    neighbours: world.roads.filter((r) => r.a === 'i-partial' || r.b === 'i-partial').map((r) => (r.a === 'i-partial' ? r.b : r.a)) }, 3)
  // 符号放大样张（×4）：直接调用 symbols.js 的绘制函数，核对星形 / 靶心 / 锚 / 旗 / × 的细节
  {
    const fig = document.createElement('figure'), c = document.createElement('canvas')
    const cap = document.createElement('figcaption'); cap.textContent = '符号 ×4：首都 / 大城市 / 城镇 / 村落 / 港口 / 旗（已勘明）/ ×（幻岛）'
    fig.append(c, cap); host.prepend(fig)
    const W = 1560, H = 120
    c.width = W * dpr; c.height = H * dpr; c.style.width = W + 'px'; c.style.height = H + 'px'
    const g = c.getContext('2d')
    g.setTransform(dpr, 0, 0, dpr, 0, 0); g.fillStyle = COUNTRY_COLORS.modern.land; g.fillRect(0, 0, W, H)
    g.setTransform(4 * dpr, 0, 0, 4 * dpr, 0, 0)
    const ink = COUNTRY_COLORS.modern.ink
    drawCity(g, 0, 20, 15, 7, ink); drawCity(g, 1, 50, 15, 5, ink); drawCity(g, 2, 80, 15, 3.2, ink); drawCity(g, 3, 110, 15, 2.2, ink)
    drawPort(g, 140, 15, 4.5 * 1.15); drawFlag(g, 175, 15, 1.15); drawCross(g, 210, 15, 1.15)
    drawPort(g, 250, 15, 10); drawCity(g, 0, 290, 15, 10, ink)
  }
  window.__dev = { ready: true, world }
}

try {
  if (q.get('mode') === 'specimen') specimenMode(); else await mapMode()
} catch (e) {
  info.textContent = 'ERROR ' + (e && e.stack)
  throw e
}
