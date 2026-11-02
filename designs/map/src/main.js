/**
 * designs/map/src/main.js — 「公式大陆」入口与编排（编排模块，SPEC §10）。
 *
 * 启动顺序（SPEC §10.1）：
 *   rAF（先让"正在测绘大陆…"画出来）→ getGraph → buildWorld → createLabeler（开始烘焙）→ createRenderer
 *   → initUI → resize → 读 hash 定初始相机/选中（无动画）→ 渲染循环 → 等 labeler.ready → 两个 rAF → ready
 *
 * 关键取舍：
 *   · 渲染循环常驻但"懒"：只有 state.dirty 或 相机/renderer/labels 任一在动画时才画。静止时 0 开销。
 *   · 相机动画由循环每帧 camera.step() 推进（camera 不自己调 rAF），相机位置与画面永远是同一帧。
 *   · whenDrawn()：任何"等画面更新"的 promise（select / setView / 飞行结束）都挂在这里，
 *     在下一次 draw **之后** resolve —— 截图工具 await 之后拿到的就是新画面。
 *   · 选中的时序（SPEC §10.3）：写 selection → emit 'select'（UI 同步打开面板并 setInset）→ 再按新 inset 取景
 *     → 写 hash。先 emit 再取景，是因为取景要知道面板占了多宽。
 *   · hash：选中变化 pushState（Back 能回到上一个选中）；相机变化防抖 replaceState（不污染历史）。
 *     ready 之前不写相机 hash —— 打开一个干净的 URL 不该立刻被改写。
 */
import { getGraph } from '../../shared/kb.js'
import { state, bus, actions, invalidate } from './state.js'
import { fitZoom, clampView, makeFrame, fitBoundsView, centerOn } from './view.js'
import { levelOf } from './rules.js'
import { SELECT_FOCUS_S, HASH_DEBOUNCE_MS } from './constants.js'
import { buildWorld } from './world/index.js'
import { createLabeler } from './labels/index.js'
import { createRenderer } from './render/index.js'
import { initUI } from './ui/index.js'
import { createCamera } from './camera.js'
import { createInteraction } from './interact.js'
import { encodeHash, decodeHash } from './hash.js'
import { searchNodes } from './search.js'
import { installDebug } from './debug.js'

const canvas = document.getElementById('map')
const loadingEl = document.getElementById('loading')
const T_START = performance.now()

/** 选中取景：选中点到画框边留的屏幕余量（px），给邻居的标签留位置 */
const SELECT_PAD = 70
/** 多命中搜索取景的 s 上限（SPEC §10.3） */
const SEARCH_MAX_S = 3.2

const nextFrame = () => new Promise((r) => requestAnimationFrame(() => r()))

async function boot() {
  // 先让 "正在测绘大陆…" 真正画到屏幕上：rAF 回调在本帧绘制之前执行，所以再让出一次宏任务
  await nextFrame()
  await new Promise((r) => setTimeout(r, 0))

  const graph = getGraph()
  state.graph = graph
  const tw = performance.now()
  const world = await buildWorld(graph, { raster: true })
  const worldMs = performance.now() - tw
  state.world = world

  const bakeState = { done: 0, total: 0 }
  const labeler = createLabeler(world, graph)
  const bakeDone = Promise.resolve()
    .then(() => labeler.bake((p) => { Object.assign(bakeState, p); bus.emit('bake', { ...bakeState }); invalidate() }))
    .catch((e) => console.error('[map] 公式烘焙失败', e))
  const renderer = createRenderer(canvas, { world, graph, labeler })
  const ui = initUI({ graph, world })

  /* ───────── 画完回调 ───────── */
  let drawWaiters = []
  /** 下一次 draw 完成后 resolve（页面在后台、rAF 停了时 1.5s 兜底，promise 总会 resolve） */
  function whenDrawn() {
    return new Promise((resolve) => {
      let done = false
      const fin = () => { if (!done) { done = true; resolve() } }
      drawWaiters.push(fin)
      setTimeout(fin, 1500)
      invalidate()
    })
  }

  const clamp = (v) => clampView(v, state.size, state.zFit, world.bounds)
  const camera = createCamera({ state, clamp, whenDrawn, invalidate })

  /* ───────── 尺寸 ───────── */
  function resize() {
    const host = canvas.parentElement
    const w = Math.max(1, host.clientWidth), h = Math.max(1, host.clientHeight)
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    const first = state.size.w <= 1
    const s = state.view.z / state.zFit
    state.size = { w, h, dpr }
    state.zFit = fitZoom(world.fitBounds, w, h, 24)
    renderer.resize(w, h, dpr)
    // 保持语义尺度 s 不变（窗口变化不该改变"看到第几级细节"）
    state.view = first ? homeView() : clamp({ ...state.view, z: s * state.zFit })
    bus.emit('resize', { w, h })
    invalidate()
  }
  function homeView() {
    return clamp(fitBoundsView(world.fitBounds, state.size, state.inset, { pad: 24 }))
  }

  /* ───────── 渲染循环 ───────── */
  let animating = false
  let lastPlacement = { items: [], areas: [], stats: {} }
  let lastFrame = null
  let lastViewKey = ''
  let frames = 0
  let fpsT = 0, fpsN = 0, prevDraw = 0
  let errCount = 0
  const frameErrors = []
  /** 每帧重画的原因计数（调试：静止时这三个数都不该涨） */
  const drawWhy = { dirty: 0, anim: 0, cam: 0 }
  let hashTimer = 0

  function tick(now) {
    requestAnimationFrame(tick)
    const camMoved = camera.step(now)
    if (!state.dirty && !animating && !camMoved) return
    drawWhy.dirty += state.dirty ? 1 : 0; drawWhy.anim += animating ? 1 : 0; drawWhy.cam += camMoved ? 1 : 0
    state.dirty = false
    const waiters = drawWaiters
    drawWaiters = []
    try {
      const t0 = performance.now()
      const f = makeFrame(state, ui.obstacles(), now)
      const placement = labeler.place(f)
      const t1 = performance.now()
      const r = renderer.draw(f, placement) || {}
      const t2 = performance.now()
      animating = !!r.animating
      lastPlacement = placement
      lastFrame = f
      frames++
      const p = state.perf
      p.placeMs = t1 - t0; p.drawMs = t2 - t1; p.frameMs = t2 - t0
      // fps 只统计连续重画的帧：间隔 > 100ms 说明中间静止过，重新起算
      if (prevDraw && now - prevDraw < 100) {
        fpsT += now - prevDraw; fpsN++
        if (fpsT > 500) { p.fps = Math.round(1000 * fpsN / fpsT); fpsT = 0; fpsN = 0 }
      } else { fpsT = 0; fpsN = 0 }
      prevDraw = now
      if (camMoved || camera.animating) interaction.refreshHover()
      const v = state.view
      const vk = `${v.x.toFixed(2)},${v.y.toFixed(2)},${v.z.toFixed(4)}`
      if (vk !== lastViewKey) {
        lastViewKey = vk
        bus.emit('view', { x: v.x, y: v.y, z: v.z, s: f.s, level: f.level })
        if (state.ready) scheduleCameraHash()
      }
    } catch (e) {
      errCount++
      frameErrors.push(String((e && e.stack) || e).slice(0, 600)); if (frameErrors.length > 5) frameErrors.shift()
      if (errCount <= 3) {
        console.error('[map] 帧绘制出错', e)
        // 第一次出错再异步抛出，让截图工具的 [page exception] 能看到；循环本身继续
        if (errCount === 1) setTimeout(() => { throw e })
      }
    } finally {
      for (const w of waiters) w()
    }
  }

  /* ───────── hash ───────── */
  let lastHash = location.hash
  function camOf(v) { return { x: v.x, y: v.y, s: v.z / state.zFit } }
  function writeHash(push, v = state.view) {
    const h = encodeHash({ id: state.selection.id, cam: camOf(v) })
    lastHash = h
    if (h === location.hash) return
    try {
      if (push) history.pushState(null, '', h)
      else history.replaceState(null, '', h)
    } catch (e) { console.warn('[map] 写 hash 失败', e) }
  }
  function scheduleCameraHash() {
    clearTimeout(hashTimer)
    hashTimer = setTimeout(() => {
      // 飞行中不写（飞行结束会再触发一次 view 变化）
      if (camera.animating && camera.kind !== 'inertia') return
      writeHash(false)
    }, HASH_DEBOUNCE_MS)
  }

  /** 按 hash 恢复状态。boot = 启动（全部瞬时）；否则 popstate/hashchange（选中带飞行，不 push） */
  function applyHash(hash, { boot = false } = {}) {
    const d = decodeHash(hash, { has: (id) => graph.byId.has(id) && world.placeById.has(id) })
    for (const w of d.warnings) console.warn('[map] 深链：' + w)
    lastHash = hash
    const target = d.cam ? clamp({ x: d.cam.x, y: d.cam.y, z: d.cam.s * state.zFit }) : null
    if (d.id) {
      if (d.id !== state.selection.id || boot) {
        // 有 c：选中但不取景，相机交给 c；只有 n：按选中规则取景
        doSelect(d.id, { fly: !target, push: false, instant: boot, writeHashAfter: !boot })
      }
    } else if (state.selection.id) {
      doDeselect({ push: false, writeHashAfter: false })
    }
    if (target) {
      if (boot) camera.jump(target)
      else camera.flyTo(target)
    } else if (!d.id && !boot && d.ok === false) {
      // 回到没有 hash 的初始条目：回全图
      camera.flyTo(homeView())
    }
  }
  function onHashNav() {
    if (location.hash === lastHash) return
    applyHash(location.hash)
  }

  /* ───────── 取景 ───────── */
  /** 可见区（扣掉 inset 与外圈余量）的屏幕矩形 */
  function visibleArea(margin = 0) {
    const { w, h } = state.size, i = state.inset
    return { x0: i.left + margin, y0: i.top + margin, x1: w - i.right - margin, y1: h - i.bottom - margin }
  }

  /**
   * 选中取景：选中点居可见区中心，z 让一跳邻居都进画框（以选中点为中心对称），s 夹到 SELECT_FOCUS_S。
   * 用"以选中点为中心的对称半宽"而不是邻居包围盒的中心：选中的东西必须在正中，邻居偏一侧时宁可多留白。
   */
  function selectView(place, neighbourIds) {
    const a = visibleArea()
    const aw = Math.max(80, a.x1 - a.x0) / 2 - SELECT_PAD, ah = Math.max(80, a.y1 - a.y0) / 2 - SELECT_PAD
    let hx = 0, hy = 0
    for (const id of neighbourIds) {
      const q = world.placeById.get(id)
      if (!q) continue
      hx = Math.max(hx, Math.abs(q.x - place.x) + (q.r || 0))
      hy = Math.max(hy, Math.abs(q.y - place.y) + (q.r || 0))
    }
    let z = Math.min(hx > 0 ? Math.max(20, aw) / hx : Infinity, hy > 0 ? Math.max(20, ah) / hy : Infinity)
    const [sMin, sMax] = SELECT_FOCUS_S
    if (!isFinite(z)) z = sMax * state.zFit
    z = Math.min(sMax * state.zFit, Math.max(sMin * state.zFit, z))
    return clamp(centerOn(place.x, place.y, z, state.size, state.inset))
  }

  /**
   * 是否需要为选中重新取景。
   * 偏差（相对 SPEC §10.3"s 在区间内才不飞"）：s 高于区间上限时也不飞 ——
   * 用户已放大到街区级再点一个村落，把他拉回 s=5 反而丢了上下文。只有 s 低于下限或点不在可见区时才飞。
   */
  function needsFraming(place) {
    const s = state.view.z / state.zFit
    if (s < SELECT_FOCUS_S[0] - 1e-6) return true
    const v = state.view, { w, h } = state.size
    const sx = (place.x - v.x) * v.z + w / 2, sy = (place.y - v.y) * v.z + h / 2
    const a = visibleArea(48)
    return !(sx >= a.x0 && sx <= a.x1 && sy >= a.y0 && sy <= a.y1)
  }

  /* ───────── actions ───────── */
  function doSelect(id, { fly = true, push = true, instant = false, writeHashAfter = true } = {}) {
    if (id == null) { doDeselect({ push }); return whenDrawn() }
    const n = graph.byId.get(id)
    if (!n) { console.warn(`[map] select：没有 id「${id}」`); return Promise.resolve() }
    const prev = state.selection.id
    const neighbours = new Set(), linkKeys = new Set()
    for (const l of n.linkIds || []) {
      const s = typeof l.source === 'object' ? l.source.id : l.source
      const t = typeof l.target === 'object' ? l.target.id : l.target
      neighbours.add(s === id ? t : s)
      linkKeys.add(l.key)
    }
    neighbours.delete(id)
    state.selection = { id, neighbours, linkKeys, t0: performance.now() }
    // 先通知 UI（同步打开面板并 setInset），再按新 inset 取景
    bus.emit('select', { id, prev })
    invalidate()

    const place = world.placeById.get(id)
    let target = null
    if (place && (fly || instant) && needsFraming(place)) target = selectView(place, neighbours)
    clearTimeout(hashTimer)
    if (writeHashAfter) writeHash(push, target || state.view)
    if (target) return instant ? camera.jump(target) : camera.flyTo(target)
    return whenDrawn()
  }

  function doDeselect({ push = true, writeHashAfter = true } = {}) {
    const prev = state.selection.id
    if (!prev) return
    state.selection = { id: null, neighbours: new Set(), linkKeys: new Set(), t0: 0 }
    state.hover = { ...state.hover, linkKey: null }
    bus.emit('select', { id: null, prev })
    invalidate()
    clearTimeout(hashTimer)
    if (writeHashAfter) writeHash(push)
  }

  function searchBounds(ids) {
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity
    for (const id of ids) {
      const p = world.placeById.get(id)
      if (!p) continue
      const r = p.r || 0
      x0 = Math.min(x0, p.x - r); y0 = Math.min(y0, p.y - r); x1 = Math.max(x1, p.x + r); y1 = Math.max(y1, p.y + r)
    }
    return isFinite(x0) ? { x0, y0, x1, y1 } : null
  }

  function boundsView(b, { pad = 60, maxS = Infinity } = {}) {
    return clamp(fitBoundsView(b, state.size, state.inset, { pad, maxZ: maxS * state.zFit }))
  }

  Object.assign(actions, {
    select: (id, opt) => doSelect(id, opt),
    deselect: (opt) => doDeselect(opt),
    suggest(q, limit = 12) {
      return searchNodes(graph, q, { limit })
    },
    search(q, { fly = true } = {}) {
      const query = typeof q === 'string' ? q.trim() : ''
      if (!query) { actions.clearSearch(); return [] }
      const ids = searchNodes(graph, query).map((r) => r.id).filter((id) => world.placeById.has(id))
      state.search = { query, ids, set: new Set(ids) }
      bus.emit('search', { query, ids: ids.slice() })
      invalidate()
      if (ids.length === 1) doSelect(ids[0], { fly })
      else if (ids.length > 1 && fly) {
        const b = searchBounds(ids)
        if (b) camera.flyTo(boundsView(b, { pad: 80, maxS: SEARCH_MAX_S }))
      }
      return ids
    },
    clearSearch() {
      if (!state.search.query && !state.search.ids.length) return
      state.search = { query: '', ids: [], set: new Set() }
      bus.emit('search', { query: '', ids: [] })
      invalidate()
    },
    flyTo(t = {}, { ms } = {}) {
      const z = typeof t.s === 'number' ? t.s * state.zFit : t.z
      return camera.flyTo({ x: t.x, y: t.y, z }, { ms })
    },
    flyToBounds(b, { pad = 60, ms } = {}) {
      if (!b || ![b.x0, b.y0, b.x1, b.y1].every(Number.isFinite)) return Promise.resolve()
      return camera.flyTo(boundsView(b, { pad }), { ms })
    },
    zoomBy(factor, { sx, sy } = {}) {
      const f = Number(factor)
      if (!(f > 0) || !isFinite(f)) return
      camera.zoomAround(f, sx ?? state.size.w / 2, sy ?? state.size.h / 2)
    },
    home({ ms } = {}) {
      return camera.flyTo(homeView(), { ms })
    },
    hoverLink(key) {
      const k = key ?? null
      if (state.hover.linkKey === k) return
      state.hover = { ...state.hover, linkKey: k }
      invalidate()
    },
    setInset(p = {}) {
      const next = { ...state.inset }
      for (const k of ['top', 'right', 'bottom', 'left']) if (typeof p[k] === 'number' && isFinite(p[k])) next[k] = Math.max(0, p[k])
      state.inset = next
      invalidate()
    },
    /** 跨族道路开关（默认关）。返回生效后的选项，UI 据此同步按钮状态。 */
    setRoads(p = {}) {
      const next = { ...state.roadOptions }
      if (typeof p.showCross === 'boolean') next.showCross = p.showCross
      const changed = next.showCross !== state.roadOptions.showCross
      state.roadOptions = next
      if (changed) { invalidate(); bus.emit('roads', { ...next }) }
      return { ...next }
    },
  })

  window.addEventListener('resize', resize)
  resize()

  let bootMs = null
  const pick = (sx, sy) => (lastFrame ? renderer.pick(sx, sy, lastFrame, lastPlacement) : null)
  const interaction = createInteraction({ canvas, camera, getPick: pick, ui })

  const dbg = installDebug({
    state, graph, world, labeler, renderer, actions, camera, interaction, whenDrawn, clamp, pick,
    getPlacement: () => lastPlacement,
    getFrame: () => lastFrame,
    bake: () => bakeState,
    frames: () => frames,
    bootMs: () => bootMs,
    frameErrors: () => frameErrors.slice(),
    drawWhy: () => ({ ...drawWhy }),
    roadInfo: () => renderer.roadInfo(),
  })
  if (world.meta) world.meta.orchWorldMs = worldMs

  // 初始状态：hash → 相机 / 选中（全部瞬时，不写历史）
  applyHash(location.hash, { boot: true })
  window.addEventListener('popstate', onHashNav)
  window.addEventListener('hashchange', onHashNav)

  requestAnimationFrame(tick)

  try { await labeler.ready } catch (e) { console.error('[map] 优先公式烘焙失败', e) }
  await nextFrame(); await nextFrame()
  if (!lastFrame) await whenDrawn()
  bootMs = Math.round(performance.now() - T_START)
  state.ready = true
  dbg.ready = true
  document.documentElement.classList.add('is-ready')
  bus.emit('ready')
  // ready 之后补发一次 view（UI 的比例尺 / 级别读数以此为准）；不触发写 hash：干净的 URL 不该被立刻改写
  { const v = state.view, s = v.z / state.zFit; bus.emit('view', { x: v.x, y: v.y, z: v.z, s, level: levelOf(s) }) }
  invalidate()
  bakeDone.then(() => invalidate())
}

boot().catch((e) => {
  console.error('[map] 启动失败', e)
  if (loadingEl) {
    loadingEl.textContent = '地图生成失败：' + ((e && e.message) || String(e))
    loadingEl.style.color = '#a3243b'
    loadingEl.style.letterSpacing = '0'
  }
  document.documentElement.classList.remove('is-ready')
  throw e
})
