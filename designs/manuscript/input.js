/**
 * designs/manuscript/input.js — 指针 / 滚轮 / 双指 / 键盘（SPEC §8.4）。
 *
 * 只调用 camera.js（相机）与 actions（交互状态），从不直接写 state 的交互字段。
 *
 * 取舍：
 *   · 单击与拖动用 4px 阈值区分；拖动松手按最近 ~80ms 的速度起惯性（≤400ms，可被任何手势打断）。
 *   · 双击自己检测（两次 pointerup 间隔 < 320ms、相距 < 10px），不依赖原生 dblclick：
 *     触屏上原生 dblclick 不可靠，鼠标与手指走同一套逻辑更可预期。第一下单击照常生效（选中），
 *     第二下再"升级"为定位 / 放大，两者语义一致，不需要延迟单击来等双击。
 *   · 滚轮：普通滚轮 = 以光标为不动点缩放；ctrl+wheel（触控板捏合）同样缩放但增益更大（其 deltaY 很小）；
 *     Shift+滚轮 = 横向平移；触控板双指滑动（有 deltaX 且非整格）= 平移。
 *   · 键盘只在焦点不在输入框时生效；Esc 例外（输入框内也生效，ui 的检索框会先拦截"收起下拉"那一下）。
 *     注释页内部可滚动区域获得焦点时，方向键 / 翻页键留给它自己滚动。
 */
import { state, visibleRect } from './state.js'
import { ZOOM } from './constants.js'
import { zoomAt, panBy, startInertia, stopInertia, flyTo, targetView, cancelFly } from './camera.js'
import { pick, pickHotspot } from './render.js'

const DRAG_PX = 4
const DBL_MS = 320
const DBL_PX = 10
const KEY_PAN = 120
const KEY_ZOOM = 1.25

/** @param {HTMLCanvasElement} canvas  @param {object} actions SPEC §8.2 */
export function attachInput(canvas, actions) {
  const pointers = new Map()   // pointerId → {x, y}
  let drag = null              // { id, sx, sy, x, y, moved, samples: [{t,x,y}] }
  let pinch = null             // { d, mx, my }
  let lastTap = null           // { t, x, y }
  let hoverPt = null

  const runHotspot = (hs) => {
    const a = hs.action || {}
    if (a.type === 'chapter') actions.gotoChapter(a.key)
    else if (a.type === 'select') actions.locate(a.id)
  }

  canvas.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return
    try { canvas.setPointerCapture(e.pointerId) } catch { /* 合成事件没有真实指针 */ }
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })
    stopInertia(); cancelFly()
    if (pointers.size === 2) {
      // 第二根手指：从拖动转为捏合，本次手势不再算单击
      const [a, b] = [...pointers.values()]
      pinch = { d: Math.hypot(a.x - b.x, a.y - b.y) || 1, mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2 }
      if (drag) drag.moved = true
      return
    }
    if (pointers.size > 2) return
    drag = { id: e.pointerId, sx: e.clientX, sy: e.clientY, x: e.clientX, y: e.clientY, moved: false, samples: [{ t: e.timeStamp, x: e.clientX, y: e.clientY }] }
  })

  canvas.addEventListener('pointermove', (e) => {
    const p = pointers.get(e.pointerId)
    if (p) { p.x = e.clientX; p.y = e.clientY }
    if (pinch && pointers.size >= 2) {
      const [a, b] = [...pointers.values()]
      const d = Math.hypot(a.x - b.x, a.y - b.y) || 1
      const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2
      panBy(mx - pinch.mx, my - pinch.my)
      zoomAt(mx, my, d / pinch.d)
      pinch = { d, mx, my }
      return
    }
    if (drag && e.pointerId === drag.id) {
      if (!drag.moved && Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) > DRAG_PX) {
        drag.moved = true
        canvas.classList.add('dragging')
        actions.hover(null, e.clientX, e.clientY, 'canvas')
        // 越过阈值的那 4px 也要补上，否则起拖时内容会"落后"手指一截
        drag.x = drag.sx; drag.y = drag.sy
      }
      if (drag.moved) {
        panBy(e.clientX - drag.x, e.clientY - drag.y)
        drag.samples.push({ t: e.timeStamp, x: e.clientX, y: e.clientY })
        if (drag.samples.length > 8) drag.samples.shift()
      }
      drag.x = e.clientX; drag.y = e.clientY
      return
    }
    if (pointers.size) return
    hoverPt = [e.clientX, e.clientY]
    updateHover()
  })

  function updateHover() {
    if (!hoverPt || drag || pinch) return
    const [x, y] = hoverPt
    const hs = pickHotspot(x, y)
    const it = hs ? null : pick(x, y)
    actions.hover(it ? it.id : null, x, y, 'canvas')
    canvas.classList.toggle('pointing', !!(it || hs))
  }

  const endPointer = (e, cancelled) => {
    if (!pointers.has(e.pointerId)) return
    pointers.delete(e.pointerId)
    try { canvas.releasePointerCapture(e.pointerId) } catch { /* 已释放 */ }
    if (pinch) {
      if (pointers.size < 2) pinch = null
      if (pointers.size === 0) { drag = null; canvas.classList.remove('dragging') }
      else if (pointers.size === 1) {
        // 剩一根手指：接着当拖动（不算单击）
        const [id, q] = [...pointers.entries()][0]
        drag = { id, sx: q.x, sy: q.y, x: q.x, y: q.y, moved: true, samples: [] }
      }
      return
    }
    if (!drag || e.pointerId !== drag.id) return
    const d = drag
    drag = null
    canvas.classList.remove('dragging')
    if (cancelled) return
    if (d.moved) {
      // 惯性：取最近 ~80ms 的位移速度
      const s = d.samples
      const now = e.timeStamp
      const recent = s.filter((q) => now - q.t < 80)
      if (recent.length >= 2) {
        const a = recent[0], b = recent[recent.length - 1]
        const dt = Math.max(8, b.t - a.t)
        if (now - b.t < 50) startInertia((b.x - a.x) / dt, (b.y - a.y) / dt)
      }
      return
    }
    click(e.clientX, e.clientY, e.timeStamp)
  }
  canvas.addEventListener('pointerup', (e) => endPointer(e, false))
  canvas.addEventListener('pointercancel', (e) => endPointer(e, true))
  canvas.addEventListener('pointerleave', (e) => {
    if (pointers.size) return
    hoverPt = null
    actions.hover(null, e.clientX, e.clientY, 'canvas')
    canvas.classList.remove('pointing')
  })

  function click(x, y, t) {
    const dbl = lastTap && t - lastTap.t < DBL_MS && Math.hypot(x - lastTap.x, y - lastTap.y) < DBL_PX
    lastTap = dbl ? null : { t, x, y }
    const hs = pickHotspot(x, y)
    if (hs) { if (!dbl) runHotspot(hs); return }
    const it = pick(x, y)
    if (dbl) {
      // 双击条目：定位并飞到阅读字号；双击空白：以光标为中心放大 2×
      if (it) actions.locate(it.id, { force: true })
      else zoomTo(x, y, 2)
      return
    }
    if (it) actions.select(it.id, { fly: false })
    else actions.deselect()
  }

  /** 以屏幕点为不动点的动画缩放（双击用；比 zoomAt 的瞬跳更容易看清自己到了哪儿） */
  function zoomTo(sx, sy, factor) {
    const c = state.cam
    const z = Math.max(state.fitZoom * ZOOM.MIN_FACTOR, Math.min(ZOOM.MAX, c.z * factor))
    const r = visibleRectLocal()
    const wx = (sx - r.cx) / c.z + c.x, wy = (sy - r.cy) / c.z + c.y
    flyTo({ x: wx - (sx - r.cx) / z, y: wy - (sy - r.cy) / z, z }, 260)
  }
  function visibleRectLocal() {
    const r = visibleRect()
    return { cx: r.x + r.w / 2, cy: r.y + r.h / 2 }
  }

  /* ───────── 滚轮 ───────── */
  canvas.addEventListener('wheel', (e) => {
    e.preventDefault()
    stopInertia()
    const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? state.vh : 1
    const dx = e.deltaX * unit, dy = e.deltaY * unit
    if (e.ctrlKey) {
      // 触控板捏合（浏览器合成为 ctrl+wheel，deltaY 小而连续）或真的按住 Ctrl 滚轮
      const f = Math.pow(ZOOM.WHEEL_STEP, -dy * (Math.abs(dy) < 20 ? 6 : 1))
      zoomAt(e.clientX, e.clientY, clampF(f))
    } else if (e.shiftKey) {
      panBy(-(dx || dy), 0)
    } else if (Math.abs(dx) > 0.5 && e.deltaMode === 0 && Math.abs(dx) >= Math.abs(dy) * 0.25) {
      // 触控板双指滑动：两轴平移
      panBy(-dx, -dy)
    } else {
      zoomAt(e.clientX, e.clientY, clampF(Math.pow(ZOOM.WHEEL_STEP, -dy)))
    }
    hoverPt = [e.clientX, e.clientY]
    updateHover()
  }, { passive: false })
  const clampF = (f) => Math.max(0.5, Math.min(2, f))

  // 原生 dblclick 只用来阻止浏览器默认的选字行为；逻辑在 click() 里
  canvas.addEventListener('dblclick', (e) => e.preventDefault())
  canvas.addEventListener('contextmenu', (e) => { if (pinch) e.preventDefault() })

  /* ───────── 键盘 ───────── */
  window.addEventListener('keydown', (e) => {
    const t = e.target
    const typing = t instanceof HTMLElement && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))
    if (e.key === 'Escape') {
      if (e.isComposing) return
      actions.escape()
      return
    }
    if ((e.key === 'k' || e.key === 'K') && (e.ctrlKey || e.metaKey) && !e.altKey) {
      e.preventDefault(); actions.focusSearch(); return
    }
    if (typing || e.defaultPrevented || e.isComposing || e.altKey || e.ctrlKey || e.metaKey) return
    if (!state.ready) return
    const navKey = /^(Arrow(Up|Down|Left|Right)|PageUp|PageDown|Home)$/.test(e.key)
    if (navKey && inScrollable(t)) return
    let handled = true
    switch (e.key) {
      case '/': actions.focusSearch(); break
      case '0': case 'Home': actions.fit(); break
      case '+': case '=': keyZoom(KEY_ZOOM); break
      case '-': case '_': keyZoom(1 / KEY_ZOOM); break
      case 'ArrowLeft': actions.step(-1); break
      case 'ArrowRight': actions.step(1); break
      case '[': case 'PageUp': actions.stepChapter(-1); break
      case ']': case 'PageDown': actions.stepChapter(1); break
      case 'ArrowUp': keyPan(KEY_PAN); break
      case 'ArrowDown': keyPan(-KEY_PAN); break
      case 'a': case 'A': actions.toggleAmbient(); break
      case '?': actions.toggleLegend(); break
      default: handled = false
    }
    if (handled) e.preventDefault()
  })

  /** ↑/↓：平移 120 屏幕 px（短动画；连按在飞行目标上累加） */
  function keyPan(dy) {
    const v = targetView()
    flyTo({ x: v.x, y: v.y - dy / v.z, z: v.z }, 160)
  }
  function keyZoom(f) { actions.zoomBy(f) }
}

/** 焦点元素（或其祖先，到 body 为止）是否是可滚动区域（注释页、下拉、凡例） */
function inScrollable(el) {
  for (let n = el; n && n instanceof HTMLElement && n !== document.body; n = n.parentElement) {
    if (n.tagName === 'CANVAS') return false
    const cs = getComputedStyle(n)
    if (/(auto|scroll)/.test(cs.overflowY) && n.scrollHeight > n.clientHeight + 1) return true
  }
  return false
}
