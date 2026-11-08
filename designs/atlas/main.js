/**
 * designs/atlas/main.js — 入口与编排（M6 所有）。
 *
 * 职责：启动顺序、画布尺寸、渲染循环、相机（飞行 / 惯性 / 夹紧）、动作表实现、深链、window.__design。
 * 其它模块之间互不 import 对方的实现（除 SPEC §11 表中列出的依赖），只经由这里与 state.js 拼接。
 *
 * 关键取舍：
 * - **按需重画**：只有 dirty / 上一帧还在动画 / 飞行 / 惯性 / bench 时才画；静止时每帧只跑 pumpBakes。
 *   公式在后台按优先级烘焙，完成一个就置 dirty，所以首屏先出星图、公式渐进浮现。
 * - **相机状态机只在这里**：fly（插值函数 + 时钟）与 coast（惯性速度）互斥；
 *   任何用户输入调 interrupt() 中断二者，被中断的飞行 Promise 照常 resolve（调用方不会挂起）。
 * - **state 只有本文件写**（input.js 属于本模块，负责 state.hover）；
 *   view 一律经 setViewNow() 写入，统一夹紧、算 L、置 dirty，并把 'view' 事件合并到每帧至多一次。
 * - **深链**：选中变化 pushState（后退可回到上一个选中），视图变化防抖 replaceState；
 *   首次用户交互前不写地址栏（打开干净的 URL 不会立刻被改成 #v=…）。
 */
import { getGraph } from '../shared/kb.js'
import { state, emit, on, actions, computeFocus } from './state.js'
import { BAKE_BUDGET_MS, FONT_SERIF, RES_PX, RES_LABEL_L, FLY_MAX_L, HASH_DEBOUNCE_MS } from './constants.js'
import { makeProjector, clamp } from './geo.js'
import { bodyRadius } from './glyphs.js'
import { buildAtlas } from './layout.js'
import { initRender, drawScene, drawOverlay } from './render.js'
import { initLabels, updateLabels, drawLabels, labelStats, labelBoxes } from './labels.js'
import { pumpBakes, bakeStats, requestBake, setBakeDpr } from './bake.js'
import { initPanel } from './panel.js'
import { initTooltip } from './tooltip.js'
import { initChrome } from './chrome.js'
import { rankSearch } from './search.js'
import {
  fitZoom, zoomToL, LToZoom, clampL, clampView, panelRect, visibleRect, zoomAtClamped,
  viewPlacing, focusL, fitBox, flyDuration, planFly,
} from './camera.js'
import { attachInput, pick, refreshHover, isGesturing } from './input.js'
import { decodeHash, encodeHash } from './hash.js'

const $ = (id) => document.getElementById(id)
const T0 = performance.now()

/* ───────── 循环 / 相机的模块级状态（放最前，避免启动阶段的 TDZ） ───────── */
let lastNow = 0, prevLoopDrew = false, animating = true, firstDrawn = false
let viewEmit = true          // 有未广播的视图变化（首帧也广播一次，图例据此初始化）
let hashDirty = false        // 有未写入地址栏的视图变化
let hashArmed = false        // 首次用户交互 / 显式选中之后才开始写地址栏
let hashTimer = 0
let drawCount = 0
const drawWaiters = []       // afterDraw() 的 resolve 列表：下一次实际绘制完成后调用
const drawMs = [], intervals = []   // 最近 60 个实际绘制帧的绘制耗时 / 帧间隔
const pumpMs = []                    // 最近 60 帧 pumpBakes 的同步耗时（诊断用：MathJax 排版会占主线程）
let fly = null               // { at(e)→view, to, t0, ms, resolve }
let coast = null             // { vx, vy } px/ms
let benchRun = null          // { ms, t0, iv:[], dm:[], dir, v0, resolve }
let lastBakeDone = -1

/* ───────── 启动 ───────── */
const graph = getGraph()
const mctx = document.createElement('canvas').getContext('2d')
const measure = (text, font) => { mctx.font = font; return mctx.measureText(text).width }
const atlas = buildAtlas(graph, { measure, resFont: `italic ${RES_PX}px ${FONT_SERIF}` })
Object.assign(state, { graph, atlas, canvas: $('atlas-canvas') })
state.ctx = state.canvas.getContext('2d')
state.searchT0 = 0

// dpr 在 initLabels 之前定下来：labels 初始化时就会按优先级登记烘焙，避免随后 setBakeDpr 再整体重排
state.dpr = currentDpr()
setBakeDpr(state.dpr)
initRender(atlas)
initLabels(atlas)
measureCanvas()
state.zoom0 = fitZoom(state.w, state.h)
state.view = { cx: 0, cy: 0, zoom: state.zoom0 }
state.L = 0

/* ───────── 尺寸 ───────── */
function currentDpr() { return Math.min(2, Math.max(1, devicePixelRatio || 1)) }
function measureCanvas() {
  const c = state.canvas, r = c.getBoundingClientRect()
  state.w = Math.max(1, r.width || innerWidth); state.h = Math.max(1, r.height || innerHeight)
  c.width = Math.max(1, Math.round(state.w * state.dpr)); c.height = Math.max(1, Math.round(state.h * state.dpr))
}
/** resize：保持 L 与视图中心 (cx, cy) 不变，只换 zoom0；dpr 变化时通知烘焙层重烘 */
function resize() {
  const dpr = currentDpr()
  if (dpr !== state.dpr) { state.dpr = dpr; setBakeDpr(dpr) }
  const L = state.L
  measureCanvas()
  state.zoom0 = fitZoom(state.w, state.h)
  setViewNow({ cx: state.view.cx, cy: state.view.cy, zoom: LToZoom(L, state.zoom0) }, true)
  state.dirty = true
  emit('resize', { w: state.w, h: state.h })
}
addEventListener('resize', resize)
// 窗口拖到另一块不同 dpr 的屏幕上时不一定有 resize 事件：监听 resolution 媒体查询
;(function watchDpr() {
  if (typeof matchMedia !== 'function') return
  const mq = matchMedia(`(resolution: ${currentDpr()}dppx)`)
  mq.addEventListener?.('change', () => { resize(); watchDpr() }, { once: true })
})()
if (typeof matchMedia === 'function') {
  const rm = matchMedia('(prefers-reduced-motion: reduce)')
  rm.addEventListener?.('change', () => { state.reducedMotion = rm.matches; state.dirty = true })
}

/* ───────── 相机 ───────── */
/** 当前（或即将打开的）面板矩形；选中但面板还没登记时按 SPEC 尺寸预测 */
const curPanel = () => panelRect(state.w, state.h, state.occluders, state.selected)
/** 可视区中心相对画布中心的偏移（clampView 用） */
function panelOffset(panel = curPanel()) {
  const vr = visibleRect(state.w, state.h, panel)
  return { x: vr.x + vr.w / 2 - state.w / 2, y: vr.y + vr.h / 2 - state.h / 2 }
}
/** 唯一写 state.view 的地方：夹紧、算 L、置 dirty、登记 'view' 广播与地址栏更新 */
function setViewNow(v, force = false) {
  const nv = clampView(v, state.zoom0, panelOffset())
  const o = state.view
  if (!force && o && nv.cx === o.cx && nv.cy === o.cy && nv.zoom === o.zoom) return false
  state.view = nv
  state.L = zoomToL(nv.zoom, state.zoom0)
  state.dirty = true
  viewEmit = true; hashDirty = true
  return true
}
function interruptFly() { if (fly) { const r = fly.resolve; fly = null; r() } }
function stopCoast() { coast = null }
function interrupt() { interruptFly(); stopCoast() }

/** 研究者的目标包围盒：名字 + 刻度起点 + 全部关联节点（世界坐标） */
function researcherBox(b) {
  let x0 = Math.min(b.x, b.anchorX ?? b.x), x1 = Math.max(b.x, b.anchorX ?? b.x)
  let y0 = Math.min(b.y, b.anchorY ?? b.y), y1 = Math.max(b.y, b.anchorY ?? b.y)
  for (const nb of atlas.neighbours.get(b.id) || []) {
    const o = atlas.bodies.get(nb.id)
    if (!o) continue
    x0 = Math.min(x0, o.x); x1 = Math.max(x1, o.x); y0 = Math.min(y0, o.y); y1 = Math.max(y1, o.y)
  }
  const pad = 70                              // 名字半宽的世界单位估计
  x0 -= pad; y0 -= pad; x1 += pad; y1 += pad
  const minS = 320                            // 只有一两个关联时不至于拉得太近、失去上下文
  if (x1 - x0 < minS) { const c = (x0 + x1) / 2; x0 = c - minS / 2; x1 = c + minS / 2 }
  if (y1 - y0 < minS) { const c = (y0 + y1) / 2; y0 = c - minS / 2; y1 = c + minS / 2 }
  return { x0, y0, x1, y1 }
}

/**
 * 目标 → 已夹紧的 view。target：{cx,cy,L|zoom} | {id[,L]} | {family}。
 * 居中一律按可视区中心（扣面板 / 抽屉）。
 */
function targetView(t) {
  if (!t) return null
  const { w, h, zoom0 } = state
  const panel = curPanel(), vr = visibleRect(w, h, panel)
  const vcx = vr.x + vr.w / 2, vcy = vr.y + vr.h / 2
  let v
  if (t.id != null) {
    const b = atlas.bodies.get(t.id)
    if (!b) return null
    if (b.kind === 'researcher') v = fitBox(researcherBox(b), w, h, vr, zoom0, 56, RES_LABEL_L + 0.1, FLY_MAX_L)
    else {
      let L = Number.isFinite(t.L) ? clampL(t.L) : focusL(b, state.L)
      if (!Number.isFinite(L)) L = clampL(state.L + 1)       // 防御：nameL 缺失
      v = viewPlacing(b.x, b.y, LToZoom(L, zoom0), w, h, vcx, vcy)
    }
  } else if (t.family != null) {
    const r = atlas.regions?.[t.family]
    if (!r || !r.bbox) return null
    v = fitBox(r.bbox, w, h, vr, zoom0, 40)
  } else {
    const zoom = Number.isFinite(t.L) ? LToZoom(clampL(t.L), zoom0) : Number.isFinite(t.zoom) && t.zoom > 0 ? t.zoom : state.view.zoom
    v = { cx: Number.isFinite(t.cx) ? t.cx : state.view.cx, cy: Number.isFinite(t.cy) ? t.cy : state.view.cy, zoom }
  }
  return clampView(v, zoom0, panelOffset(panel))
}

/**
 * 飞到一个已算好的 view。o.ms 指定时长（缺省按 SPEC 公式）；o.anchor = {wx,wy} 时
 * 锚点下的世界点全程不动（双击 / 按钮缩放）。reducedMotion 或 ms=0：瞬移。
 */
function flyView(to, o = {}) {
  interrupt()
  if (!to) return Promise.resolve()
  const from = { ...state.view }
  if (state.reducedMotion || o.ms === 0 || (from.cx === to.cx && from.cy === to.cy && from.zoom === to.zoom)) {
    setViewNow(to)
    return Promise.resolve()
  }
  const ms = o.ms ?? flyDuration(from, to, state.zoom0)
  const at = planFly(from, to, state.zoom0, state.w, o.anchor || null)
  state.dirty = true
  return new Promise((resolve) => { fly = { at, to, t0: performance.now(), ms, resolve } })
}
const flyTo = (t, o = {}) => flyView(targetView(t), o)

function stepFly(now) {
  if (!fly) return
  const f = fly
  const t = clamp((now - f.t0) / f.ms, 0, 1)
  const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2   // easeInOutCubic
  setViewNow(t >= 1 ? f.to : f.at(e))
  if (t >= 1 && fly === f) { fly = null; f.resolve() }
}

/** 惯性：每帧速度 ×0.92（按 60fps 归一，帧率无关），< 0.02 px/ms 停；撞到夹紧边界也停 */
function stepCoast(dt) {
  if (!coast) return
  const v = state.view
  const moved = setViewNow({ cx: v.cx - coast.vx * dt / v.zoom, cy: v.cy - coast.vy * dt / v.zoom, zoom: v.zoom })
  const k = Math.pow(0.92, dt / (1000 / 60))
  coast.vx *= k; coast.vy *= k
  if (!moved || Math.hypot(coast.vx, coast.vy) < 0.02) coast = null
}

/** 以屏幕点为锚缩放的飞行（按钮 / 键盘 / 双击）。连按时以正在进行的飞行终点为基准累积。 */
function zoomByAnim(f, sx, sy, ms = 260) {
  const vr = visibleRect(state.w, state.h, curPanel())
  if (!Number.isFinite(sx) || !Number.isFinite(sy)) { sx = vr.x + vr.w / 2; sy = vr.y + vr.h / 2 }
  const chained = !!fly
  const base = chained ? fly.to : state.view
  const raw = zoomAtClamped(base, state.zoom0, state.w, state.h, f, sx, sy)
  const to = clampView(raw, state.zoom0, panelOffset())
  const P = makeProjector(state.view, state.w, state.h)
  // 夹紧改动了中心、或在连按途中：锚点公式的终点对不上，退回普通插值
  const exact = !chained && Math.abs(to.cx - raw.cx) < 1e-9 && Math.abs(to.cy - raw.cy) < 1e-9
  return flyView(to, { ms, anchor: exact ? { wx: P.wx(sx), wy: P.wy(sy) } : null })
}

/* ───────── 选中 ───────── */
function doSelect(id) {
  const b = atlas.bodies.get(id)
  state.selected = id
  state.focus = computeFocus(atlas, id, performance.now())
  requestBake(id, -1)
  for (const e of (state.focus?.edges || []).slice(0, 24)) requestBake(e.other, 0)
  state.dirty = true
  const live = $('atlas-live')
  if (live) live.textContent = '已选中：' + (b.node?.name || id)
  emit('select', id)
}
function doDeselect() {
  state.selected = null; state.focus = null; state.dirty = true
  const live = $('atlas-live')
  if (live) live.textContent = '已取消选中'
  emit('select', null)
}

/* ───────── 动作表（SPEC §8.2） ───────── */
Object.assign(actions, {
  async select(id, o = {}) {
    if (id == null || !atlas.bodies.has(id)) return
    if (id !== state.selected) doSelect(id)
    if (o.push !== false) writeHash(true)
    if (o.fly !== false) await flyTo({ id })
  },
  deselect() {
    if (!state.selected) return
    doDeselect()
    writeHash(true)
  },
  /** 来自面板 / 搜索列表的悬停预览：只画地图上的悬停圈，不发 'hover'（tooltip 只跟地图悬停） */
  hoverPreview(id) {
    if (id != null && atlas.bodies.has(id)) state.hover = { kind: 'body', id, source: 'ui' }
    else if (state.hover && state.hover.source === 'ui') state.hover = null
    else return
    state.dirty = true
  },
  search(q) {
    const query = String(q ?? '')
    let r
    try { r = rankSearch(graph, query) || {} } catch (e) { r = { ids: [], error: String(e?.message || e), structured: false } }
    const ids = Array.isArray(r.ids) ? r.ids.filter((id) => atlas.bodies.has(id)) : []
    state.searchQuery = query; state.searchHits = ids; state.searchT0 = performance.now()
    state.dirty = true
    for (const id of ids.slice(0, 12)) requestBake(id, 0)     // 命中前 12 个不论 L 都显示公式
    emit('search', { query, hits: ids, error: r.error, structured: !!r.structured })
    return ids
  },
  flyTo,
  zoomBy(f, sx, sy) { return zoomByAnim(f, sx, sy) },
  resetView() {
    const vr = visibleRect(state.w, state.h, curPanel())
    return flyView(clampView(viewPlacing(0, 0, state.zoom0, state.w, state.h, vr.x + vr.w / 2, vr.y + vr.h / 2), state.zoom0, panelOffset()))
  },
  // setOccluder / requestDraw：沿用 state.js 的默认实现
})

const chrome = initChrome({ title: $('atlas-title'), search: $('atlas-search'), legend: $('atlas-legend'), zoom: $('atlas-zoom'), hint: $('atlas-hint') }) || {}
initPanel($('atlas-panel'))
initTooltip($('atlas-tooltip'))

attachInput(state.canvas, {
  panBy(dx, dy) { interruptFly(); const v = state.view; setViewNow({ cx: v.cx - dx / v.zoom, cy: v.cy - dy / v.zoom, zoom: v.zoom }) },
  zoomAt(f, sx, sy) { interrupt(); setViewNow(zoomAtClamped(state.view, state.zoom0, state.w, state.h, f, sx, sy)) },
  pinch(dx, dy, f, sx, sy) {
    interrupt()
    const v = state.view
    setViewNow(zoomAtClamped({ cx: v.cx - dx / v.zoom, cy: v.cy - dy / v.zoom, zoom: v.zoom }, state.zoom0, state.w, state.h, f, sx, sy))
  },
  interrupt,
  inertia(vx, vy) { if (!state.reducedMotion && Math.hypot(vx, vy) >= 0.02) { coast = { vx, vy }; state.dirty = true } },
  dblZoom(sx, sy, out) { zoomByAnim(out ? 0.5 : 2, sx, sy, 260) },
  keyPan(dx, dy) {
    const base = fly ? fly.to : state.view
    flyView(clampView({ cx: base.cx - dx / base.zoom, cy: base.cy - dy / base.zoom, zoom: base.zoom }, state.zoom0, panelOffset()), { ms: 160 })
  },
  closeSearch() { try { return !!chrome.closeSearch?.() } catch { return false } },
  focusSearch() { try { chrome.focusSearch?.() } catch { /* chrome 未就绪 */ } },
})
// 首次用户交互后才开始把视图写进地址栏
for (const ev of ['pointerdown', 'wheel', 'keydown']) addEventListener(ev, () => { hashArmed = true }, { capture: true, passive: true, once: true })

/* ───────── 深链（SPEC §7.3） ───────── */
function writeHash(push) {
  if (push) hashArmed = true
  if (!hashArmed) return
  clearTimeout(hashTimer); hashTimer = 0
  const go = () => {
    hashTimer = 0; hashDirty = false
    const s = encodeHash({ node: state.selected, view: { cx: state.view.cx, cy: state.view.cy, L: state.L } })
    if (s === location.hash.replace(/^#/, '')) return
    try { history[push ? 'pushState' : 'replaceState'](null, '', '#' + s) } catch { /* 沙箱 iframe 等 */ }
  }
  if (push) go(); else hashTimer = setTimeout(go, HASH_DEBOUNCE_MS)
}
/** popstate / hashchange / 启动：解析并应用（不 push）。幂等：重复调用不产生变化。 */
function applyHash() {
  clearTimeout(hashTimer); hashTimer = 0
  const h = decodeHash(location.hash, (id) => atlas.bodies.has(id))
  if (h.node) { if (h.node !== state.selected) doSelect(h.node) }
  else if (state.selected) doDeselect()
  if (h.view) { interrupt(); setViewNow({ cx: h.view.cx, cy: h.view.cy, zoom: LToZoom(clampL(h.view.L), state.zoom0) }) }
  else if (h.node) { interrupt(); setViewNow(targetView({ id: h.node })) }
  hashDirty = false            // 刚从地址栏读来的状态，不要再写回去
}
addEventListener('popstate', applyHash)
addEventListener('hashchange', applyHash)
applyHash()
if (location.hash.length > 1) hashArmed = true   // 带着 hash 打开：之后的视图变化照常回写（坏 hash 也会被规整）

/* ───────── 渲染循环（SPEC §8.3） ───────── */
function makeFrame(now, dt) {
  return {
    now, dt, w: state.w, h: state.h, dpr: state.dpr, view: state.view, L: state.L,
    P: makeProjector(state.view, state.w, state.h), atlas, graph,
    selected: state.selected, focus: state.focus, hover: state.hover,
    searchHits: state.searchHits, searchT0: state.searchT0,
    occluders: [...state.occluders.values()], reducedMotion: state.reducedMotion,
  }
}
const push60 = (a, x) => { a.push(x); if (a.length > 60) a.shift() }

function stepBench(now, dt) {
  const b = benchRun
  if (!b) return
  if (b.t0 == null) b.t0 = now
  // 缓慢来回平移（约 1 px/帧），每 900ms 换向，保证不撞夹紧边界
  if (now - b.t0 > (b.flip + 1) * 900) { b.flip++; b.dir = -b.dir }
  const v = state.view
  setViewNow({ cx: v.cx + b.dir * 0.06 * dt / v.zoom, cy: v.cy, zoom: v.zoom }, true)
}
function finishBench(now) {
  const b = benchRun
  if (!b || b.t0 == null || now - b.t0 < b.ms) return
  benchRun = null
  const avg = (a) => (a.length ? a.reduce((s, x) => s + x, 0) / a.length : 0)
  const p95 = (a) => { const s = [...a].sort((x, y) => x - y); return s.length ? s[Math.min(s.length - 1, Math.floor(s.length * 0.95))] : 0 }
  const iv = b.iv.slice(1)     // 第一个间隔可能跨过 bench 之前的空闲
  const mi = avg(iv)
  setViewNow(b.v0)
  b.resolve({
    fps: mi ? Math.round(1000 / mi * 10) / 10 : 0,
    frameMs: Math.round(avg(b.dm) * 100) / 100,
    p95: Math.round(p95(b.dm) * 100) / 100,          // 绘制耗时的 p95（ms）
    intervalP95: Math.round(p95(iv) * 100) / 100,    // 帧间隔的 p95（ms）
    frames: b.dm.length,
  })
}

/** 就绪判定（SPEC §8.3）：首帧已画 + 想放的公式都烘好了；兜底 = 模块启动后 2.5 s（且不晚于导航起 2.6 s），
 *  到点后首帧一画完就算就绪——公式之后继续渐进浮现。放在 pumpBakes 之前，免得一次长排版把就绪推迟一帧。 */
function checkReady(now) {
  if (state.ready || !firstDrawn) return
  let pending
  try { pending = labelStats().pendingBakes || 0 } catch { pending = 0 }
  if (pending === 0 || now >= Math.min(T0 + 2500, 2600)) {
    state.ready = true
    window.__design.ready = true
    window.__design.readyMs = Math.round(performance.now())
    emit('ready')
  }
}

let lastDrawNow = 0
function loop(now) {
  requestAnimationFrame(loop)        // 先排下一帧：本帧任何模块抛错都不会让循环停掉（异常照常冒泡给控制台）
  const dt = lastNow ? clamp(now - lastNow, 1, 100) : 16
  lastNow = now
  state.now = now
  stepFly(now)
  stepCoast(dt)
  stepBench(now, dt)
  const draw = state.dirty || animating || !!fly || !!coast || !!benchRun
  if (draw) {
    const s = performance.now()
    let a1 = false, a2 = false, a3 = false
    try {
      const f = makeFrame(now, dt)
      a1 = updateLabels(f)
      const ctx = state.ctx
      ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0)
      ctx.clearRect(0, 0, state.w, state.h)
      a2 = drawScene(ctx, f)
      drawLabels(ctx, f)
      a3 = drawOverlay(ctx, f)
    } finally {
      animating = !!(a1 || a2 || a3)
      state.dirty = false
      const ms = performance.now() - s
      push60(drawMs, ms)
      if (prevLoopDrew) push60(intervals, now - lastDrawNow)   // 只统计连续绘制帧之间的间隔
      if (benchRun) { benchRun.dm.push(ms); if (prevLoopDrew) benchRun.iv.push(now - lastDrawNow) }
      lastDrawNow = now
      firstDrawn = true
      drawCount++
      if (viewEmit) {
        viewEmit = false
        emit('view', state.view)
        if (!isGesturing()) refreshHover()     // 视图在指针下移动了：重新判定悬停
      }
      if (hashDirty && hashArmed && !benchRun) { hashDirty = false; writeHash(false) }
      if (drawWaiters.length) for (const r of drawWaiters.splice(0)) r()
    }
  }
  prevLoopDrew = draw
  finishBench(now)
  checkReady(now)

  // 烘焙：解码是异步的，完成发生在帧与帧之间——所以跨帧比较完成数，而不是只比较 pump 前后
  // 相机在动时只给烘焙 2ms（pumpBakes 每次至少排一条，所以仍逐帧推进），优先保证交互帧率；静止时用满预算
  const moving = !!fly || !!coast || !!benchRun || isGesturing()
  const ps = performance.now()
  pumpBakes(moving ? 2 : BAKE_BUDGET_MS)
  push60(pumpMs, performance.now() - ps)
  const bs = bakeStats()
  const done = (bs.done || 0) + (bs.failed || 0)
  if (done !== lastBakeDone) { lastBakeDone = done; state.dirty = true }
}

/* ───────── 调试句柄（SPEC §8.4） ───────── */
const avg = (a) => (a.length ? a.reduce((s, x) => s + x, 0) / a.length : 0)
/** 下一次实际绘制完成后 resolve（置 dirty 保证会画） */
function afterDraw() { state.dirty = true; return new Promise((r) => drawWaiters.push(r)) }

window.__design = {
  ready: false, readyMs: null, graph, atlas,
  /** 选中并飞行；await 到飞行结束 + 下一帧画完。o.fly=false 时不飞（批量测试用） */
  async select(id, o = {}) {
    await actions.select(id, { fly: o.fly !== false, push: o.push !== false })
    await afterDraw()
  },
  deselect() { actions.deselect() },
  search(q) { return actions.search(q) },
  view() {
    return {
      cx: state.view.cx, cy: state.view.cy, zoom: state.view.zoom, L: state.L, w: state.w, h: state.h,
      selected: state.selected, hover: state.hover?.id ?? null, panelOpen: state.occluders.has('panel'),
      searchQuery: state.searchQuery,
    }
  },
  /** {cx?,cy?,zoom?|L?} | {id[,L]} | {family}；animate=false 瞬移并画完一帧再 resolve */
  async setView(o = {}) {
    hashArmed = true
    const t = o.id != null ? { id: o.id, L: o.L } : o.family != null ? { family: o.family }
      : { cx: o.cx, cy: o.cy, L: o.L, zoom: o.L == null ? o.zoom : undefined }
    if (o.animate) await flyTo(t)
    else { interrupt(); const v = targetView(t); if (v) setViewNow(v) }
    await afterDraw()
  },
  stats() {
    let ls
    try { ls = labelStats() || {} } catch { ls = {} }
    const P = makeProjector(state.view, state.w, state.h)
    let onScreen = 0
    for (const b of atlas.bodies.values()) {
      const x = P.sx(b.x), y = P.sy(b.y)
      if (x >= 0 && y >= 0 && x <= state.w && y <= state.h) onScreen++
    }
    const iv = avg(intervals)
    return {
      ...ls,
      fps: iv ? Math.round(1000 / iv * 10) / 10 : 0,
      frameMs: Math.round(avg(drawMs) * 100) / 100,
      bakes: bakeStats(), layoutMs: atlas.ms, nodes: atlas.bodies.size, bodiesOnScreen: onScreen,
      pumpMs: Math.round(avg(pumpMs) * 100) / 100, pumpMsMax: Math.round(Math.max(0, ...pumpMs) * 10) / 10,
      L: state.L, draws: drawCount, readyMs: window.__design.readyMs, flying: !!fly, coasting: !!coast,
    }
  },
  screenOf(id) {
    const b = atlas.bodies.get(id)
    if (!b) return null
    const P = makeProjector(state.view, state.w, state.h), x = P.sx(b.x), y = P.sy(b.y)
    return { x, y, r: bodyRadius(b, state.L), visible: x >= 0 && y >= 0 && x <= state.w && y <= state.h }
  },
  pick: (x, y) => pick(x, y),
  labels: () => labelBoxes(),
  /** 强制连续重画 ms 毫秒（期间缓慢来回平移），结束后恢复原视图 */
  bench(ms = 2000) {
    if (benchRun) return benchRun.promise
    interrupt()
    let resolve
    const promise = new Promise((r) => { resolve = r })
    benchRun = { ms: Math.max(200, Number(ms) || 2000), t0: null, iv: [], dm: [], dir: 1, flip: 0, v0: { ...state.view }, resolve, promise }
    state.dirty = true
    return promise
  },
}
on('select', () => { state.dirty = true })
requestAnimationFrame(loop)
