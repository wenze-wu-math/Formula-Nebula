/**
 * designs/map/src/interact.js — 指针 / 滚轮 / 键盘交互（编排模块，SPEC §10.4）。
 *
 * 取舍：
 *   · 全部用 pointer events（鼠标、笔、触屏同一套）。位移 > 4px 才算拖拽，否则松手算点击 ——
 *     点地图上的小城市时手一抖不该变成平移。
 *   · 单击立即生效（选中 / 取消选中），不为了区分双击而延迟 250ms；双击 = 第二次点击时以该点为锚放大 2 倍。
 *     所以双击城市 = 选中它 + 放大，这正是用户想"凑近看看"时的意图。
 *   · 滚轮逐事件立即缩放（不做动画）：触控板一秒几十个事件，叠动画只会发飘。ctrlKey（触控板捏合）用更大的系数。
 *   · 悬停 pick 节流到 rAF，且用"上一帧的 frame/placement"判定 —— 与屏幕上画出来的东西一致。
 *     相机动画期间指针不动也会重新判定（城市从指针下飞走，tooltip 要跟着消失）。
 *   · 键盘只在焦点不在输入控件时处理；输入框里的 Esc 由 UI 自己处理（SPEC §10.4）。
 */
import { state, bus, actions, invalidate } from './state.js'

const DRAG_PX = 4
const DBL_MS = 320, DBL_PX = 10
const KEY_PAN_PX = 80, KEY_ZOOM = 1.6

/**
 * @param {{canvas: HTMLCanvasElement, camera: object, getPick: (sx:number, sy:number) => string|null, ui: object}} deps
 * @returns {{dispose: () => void, get dragging(): boolean, refreshHover: () => void}}
 */
export function createInteraction({ canvas, camera, getPick, ui }) {
  const pointers = new Map()      // pointerId → {x, y}（相对 canvas）
  let gesture = null              // {kind:'pan'|'pinch', ...}
  let downInfo = null             // 按下时的信息（判定点击）
  let dragging = false
  let lastClick = { t: 0, x: -1e9, y: -1e9 }
  let samples = []                // 拖拽速度采样 [{t, x, y}]
  let hoverPt = null              // 最近的指针位置（悬停用）
  let hoverQueued = false

  const rectOf = () => canvas.getBoundingClientRect()
  const local = (e) => { const r = rectOf(); return { x: e.clientX - r.left, y: e.clientY - r.top } }

  function setDragging(on) {
    if (dragging === on) return
    dragging = on
    canvas.classList.toggle('is-dragging', on)
    if (on) setHover(null, 0, 0)
  }

  /* ───────── 悬停 ───────── */
  function setHover(id, sx, sy) {
    const h = state.hover
    const changed = h.id !== id
    if (!changed && (!id || (h.sx === sx && h.sy === sy))) return
    state.hover = { ...h, id, sx, sy }
    bus.emit('hover', { id, sx, sy })
    if (changed) {
      canvas.style.cursor = id ? 'pointer' : ''
      invalidate()
    }
  }
  function queueHover() {
    if (hoverQueued) return
    hoverQueued = true
    requestAnimationFrame(() => {
      hoverQueued = false
      if (!hoverPt || dragging || pointers.size > 1) return
      let id = null
      try { id = getPick(hoverPt.x, hoverPt.y) } catch (err) { console.warn('[map] pick 出错', err) }
      setHover(id, hoverPt.x, hoverPt.y)
    })
  }

  /* ───────── 指针 ───────── */
  function onDown(e) {
    if (e.button !== undefined && e.button !== 0 && e.pointerType === 'mouse') return
    const p = local(e)
    pointers.set(e.pointerId, p)
    try { canvas.setPointerCapture(e.pointerId) } catch { /* 合成事件可能没有活动指针 */ }
    camera.cancel()
    if (pointers.size === 1) {
      gesture = { kind: 'pan', sx: p.x, sy: p.y, vx: state.view.x, vy: state.view.y }
      downInfo = { x: p.x, y: p.y, t: performance.now(), id: e.pointerId }
      samples = [{ t: performance.now(), x: p.x, y: p.y }]
    } else if (pointers.size === 2) {
      startPinch()
      downInfo = null           // 两指不再算点击
    }
  }

  function startPinch() {
    const [a, b] = [...pointers.values()]
    const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2
    const v = state.view, { w, h } = state.size
    gesture = {
      kind: 'pinch',
      d0: Math.max(10, Math.hypot(a.x - b.x, a.y - b.y)),
      z0: v.z,
      wx: v.x + (mx - w / 2) / v.z, wy: v.y + (my - h / 2) / v.z,   // 两指中点下的世界点
    }
    setDragging(true)
  }

  function onMove(e) {
    const p = local(e)
    if (!pointers.has(e.pointerId)) {
      // 没按下：悬停
      if (e.pointerType !== 'touch') { hoverPt = p; queueHover() }
      return
    }
    pointers.set(e.pointerId, p)
    if (!gesture) return
    if (gesture.kind === 'pan') {
      const dx = p.x - gesture.sx, dy = p.y - gesture.sy
      if (!dragging && Math.hypot(dx, dy) <= DRAG_PX) return
      setDragging(true)
      state.view = clampV({ x: gesture.vx - dx / state.view.z, y: gesture.vy - dy / state.view.z, z: state.view.z })
      const now = performance.now()
      samples.push({ t: now, x: p.x, y: p.y })
      while (samples.length > 2 && now - samples[0].t > 90) samples.shift()
      invalidate()
    } else if (gesture.kind === 'pinch' && pointers.size >= 2) {
      const [a, b] = [...pointers.values()]
      const d = Math.max(10, Math.hypot(a.x - b.x, a.y - b.y))
      const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2
      const { w, h } = state.size
      const z = clampV({ ...state.view, z: gesture.z0 * d / gesture.d0 }).z
      // 两指中点始终压住同一个世界点：缩放 + 平移一起做
      state.view = clampV({ x: gesture.wx - (mx - w / 2) / z, y: gesture.wy - (my - h / 2) / z, z })
      invalidate()
    }
  }

  function onUp(e) {
    const had = pointers.has(e.pointerId)
    pointers.delete(e.pointerId)
    try { canvas.releasePointerCapture(e.pointerId) } catch { /* 已释放 */ }
    if (!had) return
    const p = local(e)

    if (gesture && gesture.kind === 'pinch') {
      if (pointers.size === 1) {
        // 抬起一指：剩下那根手指接着拖
        const [q] = [...pointers.values()]
        gesture = { kind: 'pan', sx: q.x, sy: q.y, vx: state.view.x, vy: state.view.y }
        samples = []
      } else if (pointers.size === 0) { gesture = null; setDragging(false) }
      return
    }
    if (pointers.size > 0) return

    const wasDrag = dragging
    gesture = null
    setDragging(false)

    if (wasDrag) {
      // 惯性：最近 ~90ms 的平均速度
      const now = performance.now()
      samples.push({ t: now, x: p.x, y: p.y })
      const s0 = samples[0], s1 = samples[samples.length - 1]
      const dt = s1.t - s0.t
      if (e.type === 'pointerup' && dt > 8 && now - s1.t < 60) camera.inertia((s1.x - s0.x) / dt, (s1.y - s0.y) / dt)
      return
    }
    if (e.type !== 'pointerup' || !downInfo) return
    downInfo = null
    onClick(p)
  }

  function onClick(p) {
    const now = performance.now()
    const isDbl = now - lastClick.t < DBL_MS && Math.hypot(p.x - lastClick.x, p.y - lastClick.y) < DBL_PX
    lastClick = isDbl ? { t: 0, x: -1e9, y: -1e9 } : { t: now, x: p.x, y: p.y }
    if (isDbl) {
      camera.zoomAround(2, p.x, p.y, { ms: 320 })
      return
    }
    let id = null
    try { id = getPick(p.x, p.y) } catch (err) { console.warn('[map] pick 出错', err) }
    if (id) actions.select(id)
    else if (state.selection.id) actions.deselect()
  }

  function onLeave() {
    hoverPt = null
    if (!dragging) setHover(null, 0, 0)
  }

  /* ───────── 滚轮 / 触控板 ───────── */
  function onWheel(e) {
    e.preventDefault()
    const p = local(e)
    let dy = e.deltaY
    if (e.deltaMode === 1) dy *= 16          // 行
    else if (e.deltaMode === 2) dy *= state.size.h  // 页
    // ctrlKey = 触控板捏合（Chrome/Edge/Safari 都这样合成），单次 delta 很小，系数放大
    const k = e.ctrlKey ? 0.01 : 0.0015
    const exp = Math.max(-0.6, Math.min(0.6, -dy * k))
    if (exp === 0) return
    camera.zoomAtNow(Math.exp(exp), p.x, p.y)
    if (hoverPt) queueHover()
  }

  /* ───────── 键盘 ───────── */
  function isTyping(t) {
    if (!t || t === document.body) return false
    const tag = t.tagName
    return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || t.isContentEditable
  }
  /** 方向键 / ± 只在焦点"属于地图"时生效：别抢面板、名录的滚动与按钮 */
  function focusIsMap(t) {
    return !t || t === document.body || t === document.documentElement || t === canvas
  }

  function onKey(e) {
    if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return
    const t = e.target
    if (isTyping(t)) return
    const k = e.key
    if (k === 'Escape') {
      e.preventDefault()
      escChain()
      return
    }
    if (k === '/') { e.preventDefault(); ui.focusSearch?.(); return }
    if (!focusIsMap(t)) return
    const { w, h } = state.size
    switch (k) {
      case 'ArrowLeft': camera.panBy(-KEY_PAN_PX, 0); break
      case 'ArrowRight': camera.panBy(KEY_PAN_PX, 0); break
      case 'ArrowUp': camera.panBy(0, -KEY_PAN_PX); break
      case 'ArrowDown': camera.panBy(0, KEY_PAN_PX); break
      case '+': case '=': camera.zoomAround(KEY_ZOOM, w / 2, h / 2); break
      case '-': case '_': camera.zoomAround(1 / KEY_ZOOM, w / 2, h / 2); break
      case '0': case 'Home': actions.home(); break
      default: return
    }
    e.preventDefault()
  }

  /** Esc 链：临时浮层 → 选中 → 搜索 → 回全图 */
  function escChain() {
    let closed = false
    try { closed = !!ui.closeTransient?.() } catch (err) { console.warn('[map] closeTransient 出错', err) }
    if (closed) return 'transient'
    if (state.selection.id) { actions.deselect(); return 'deselect' }
    if (state.search.query || state.search.ids.length) { actions.clearSearch(); return 'clearSearch' }
    actions.home()
    return 'home'
  }

  function clampV(v) { return camera.clamp(v) }

  canvas.addEventListener('pointerdown', onDown)
  canvas.addEventListener('pointermove', onMove)
  canvas.addEventListener('pointerup', onUp)
  canvas.addEventListener('pointercancel', onUp)
  canvas.addEventListener('pointerleave', onLeave)
  canvas.addEventListener('wheel', onWheel, { passive: false })
  canvas.addEventListener('contextmenu', (e) => { if (dragging) e.preventDefault() })
  window.addEventListener('keydown', onKey)

  return {
    get dragging() { return dragging },
    /** 相机动画期间由渲染循环调用：指针不动但地图在动，重新判定悬停 */
    refreshHover() { if (hoverPt && !dragging) queueHover() },
    escChain,
    dispose() {
      canvas.removeEventListener('pointerdown', onDown)
      canvas.removeEventListener('pointermove', onMove)
      canvas.removeEventListener('pointerup', onUp)
      canvas.removeEventListener('pointercancel', onUp)
      canvas.removeEventListener('pointerleave', onLeave)
      canvas.removeEventListener('wheel', onWheel)
      window.removeEventListener('keydown', onKey)
    },
  }
}
