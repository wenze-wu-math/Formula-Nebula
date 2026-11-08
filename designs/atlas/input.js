/**
 * designs/atlas/input.js — 指针 / 滚轮 / 键盘（M6 所有，SPEC §7.2）。
 *
 * 只把原始输入翻译成"意图"，相机的实际改动经 cb 回调交给 main.js（main 持有飞行 / 惯性状态机），
 * 选中 / 取消 / 飞到星座走 actions。这样 input 不需要知道相机怎么插值。
 *
 * 取舍：
 * - 全部用 pointer events（鼠标、笔、触屏一套代码）；多指用 Map 追踪，前两指构成捏合。
 * - 画布固定铺满视口（atlas.css：position fixed; inset 0），所以 clientX/Y 就是画布 css px，
 *   热路径上不调 getBoundingClientRect。
 * - 双击：自己按 pointerup 的时间 / 距离识别（触屏上 dblclick 不可靠），同时监听原生 dblclick
 *   以兼容只发 dblclick 的场景；两条路径用时间戳去重，保证一次双击只缩放一次。
 * - 单击不做"等待是否双击"的延迟（那会让每次选中都慢 300ms）；双击的第一下照常选中 / 取消，
 *   第二下以光标为锚放大，与 Google Maps 一致。
 */
import { state, emit, actions } from './state.js'
import { hitLabel } from './labels.js'
import { bodyRadius } from './glyphs.js'
import { makeProjector, polarToWorld } from './geo.js'
import { RES_PX, RES_LABEL_L, HYSTERESIS, FONT_SERIF } from './constants.js'
/* 世界长度量从 runtime.js 取（可缩放 live binding）；见 runtime.js 头注释 */
import { R_RES_TICK, R_RES_TICK_END } from './runtime.js'

const DRAG_PX = { mouse: 4, pen: 4, touch: 8 }   // 超过才算拖拽（SPEC：> 4px；手指抖动更大，放宽到 8）
const DBL_MS = 320, DBL_PX = 24
const VEL_WINDOW_MS = 80                          // 惯性取最后 80ms 的速度

/* 研究者名字宽度：与 layout / labels 用同一字体串测量 */
let mctx = null
const nameW = new Map()
function measureName(text) {
  let w = nameW.get(text)
  if (w == null) {
    if (!mctx && typeof document !== 'undefined') mctx = document.createElement('canvas').getContext('2d')
    if (mctx) { mctx.font = `italic ${RES_PX}px ${FONT_SERIF}`; w = mctx.measureText(text).width }
    else w = text.length * RES_PX * 0.8
    nameW.set(text, w)
  }
  return w
}

/** 点 p 到线段 ab 的距离 */
function segDist(px, py, ax, ay, bx, by) {
  const dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy || 1
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / l2))
  return Math.hypot(px - ax - t * dx, py - ay - t * dy)
}

/**
 * 屏幕点 → 命中目标（SPEC §7.2 pick 顺序）：
 *   ① labels.hitLabel（已显示的公式 / 中文名 / 星座名 / 研究者名标签盒）
 *   ② body：恒星 / 深空天体取屏幕距离 ≤ max(r+4, 9) 的最近者；
 *      研究者按名字有向盒（沿 R_RES 弧的弦方向）+ 刻度线段命中
 *   ③ null
 * @param {{touch?:boolean}} [o] 触屏点按放宽命中半径（手指比光标粗）
 * @returns {{kind:'body', id:string} | {kind:'constellation', family:string} | null}
 */
export function pick(sx, sy, o = {}) {
  if (!Number.isFinite(sx) || !Number.isFinite(sy)) return null
  let lab
  try { lab = hitLabel(sx, sy) } catch { lab = null }
  if (lab) return lab
  const { atlas, view, w, h, L } = state
  if (!atlas) return null
  const P = makeProjector(view, w, h)
  const extra = o.touch ? 10 : 4, floor = o.touch ? 18 : 9
  let best = null, bd = Infinity
  for (const b of atlas.stars) bd = test(b, bd)
  for (const b of atlas.dsos) bd = test(b, bd)
  function test(b, cur) {
    const dx = P.sx(b.x) - sx, dy = P.sy(b.y) - sy
    const lim = Math.max(bodyRadius(b, L) + extra, floor)
    if (Math.abs(dx) > lim || Math.abs(dy) > lim) return cur
    const d = Math.hypot(dx, dy)
    if (d <= lim && d < cur) { best = b; return d }
    return cur
  }
  // 研究者：名字盒（名字可见时）+ 刻度（任何 L）
  const showName = L >= RES_LABEL_L - HYSTERESIS
  const tickTol = o.touch ? 12 : 6
  for (const b of atlas.researchers) {
    const ra = b.raLabel ?? 0
    const t0 = polarToWorld(R_RES_TICK, ra), t1 = polarToWorld(R_RES_TICK_END, ra)
    let d = segDist(sx, sy, P.sx(t0.x), P.sy(t0.y), P.sx(t1.x), P.sy(t1.y))
    if (d > tickTol) d = Infinity
    if (showName) {
      // 名字中心 (b.x, b.y)；弦方向 = 该处切向 (−cos ra, sin ra)，法向 = 径向 (−sin ra, −cos ra)
      const cx = P.sx(b.x), cy = P.sy(b.y)
      const tx = -Math.cos(ra), ty = Math.sin(ra)
      const u = (sx - cx) * tx + (sy - cy) * ty, v = (sx - cx) * -ty + (sy - cy) * tx
      const hw = measureName(b.node.name || b.id) / 2 + (o.touch ? 8 : 3), hh = RES_PX * 0.65 + (o.touch ? 8 : 3)
      if (Math.abs(u) <= hw && Math.abs(v) <= hh) d = Math.min(d, 0)
    }
    if (d < bd) { bd = d; best = b }
  }
  return best ? { kind: 'body', id: best.id } : null
}

/* ───────── 指针状态（模块内） ───────── */
let canvasEl = null
let lastPointer = null        // { x, y, type }：最近一次指针位置，用于视图变化后重新判定悬停
let inside = false
let gesture = null            // { kind:'press'|'pinch', ... }
const pointers = new Map()    // pointerId → { x, y, type }

/** 当前是否在拖拽 / 捏合中（main 用来决定是否重判悬停） */
export const isGesturing = () => !!gesture

function sameTarget(a, b) {
  if (a === b) return true
  if (!a || !b) return false
  return a.kind === b.kind && a.id === b.id && a.family === b.family && a.source === b.source
}

function setCursor() {
  if (!canvasEl) return
  const dragging = !!gesture && (gesture.kind === 'pinch' || gesture.drag)
  canvasEl.classList.toggle('dragging', dragging)
  canvasEl.classList.toggle('pointing', !dragging && !!state.hover && state.hover.source === 'map')
}

/** 地图悬停：变化时写 state.hover 并发 'hover'；目标不变但指针在动时也发（tooltip 跟随指针） */
function setHover(t, sx = 0, sy = 0) {
  const next = t ? { ...t, source: 'map' } : null
  const prev = state.hover
  // 来自 UI 列表的悬停预览（source='ui'）不被地图上的"空白"覆盖
  if (!next && prev && prev.source === 'ui') { setCursor(); return }
  if (sameTarget(prev, next)) {
    if (next) emit('hover', { target: next, sx, sy })
    return
  }
  state.hover = next; state.dirty = true
  emit('hover', next ? { target: next, sx, sy } : null)
  setCursor()
}

/** 视图变了（滚轮 / 飞行 / 惯性）而指针没动时，重新判定悬停。main 在画完视图变化的帧后调用。 */
export function refreshHover() {
  if (!inside || !lastPointer || gesture || lastPointer.type === 'touch') return
  setHover(pick(lastPointer.x, lastPointer.y), lastPointer.x, lastPointer.y)
}

const isTyping = (el) => !!el && (el.isContentEditable || el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement)

/**
 * @param {HTMLCanvasElement} canvas
 * @param {{
 *   panBy(dx:number, dy:number):void,            // 立即平移（屏幕 px，正 = 内容跟手移动的方向）
 *   zoomAt(factor:number, sx:number, sy:number):void,   // 立即以锚缩放
 *   pinch(dx:number, dy:number, factor:number, sx:number, sy:number):void, // 平移 + 以新中点为锚缩放
 *   interrupt():void,                            // 中断飞行与惯性
 *   inertia(vx:number, vy:number):void,          // 松手惯性（px/ms）
 *   dblZoom(sx:number, sy:number, out:boolean):void,
 *   keyPan(dx:number, dy:number):void,
 *   closeSearch():boolean, focusSearch():void,
 * }} cb
 */
export function attachInput(canvas, cb) {
  canvasEl = canvas
  let lastTap = null, lastDbl = -1e9

  const capture = (e) => { try { canvas.setPointerCapture(e.pointerId) } catch { /* 合成事件的 pointerId 可能无效 */ } }

  canvas.addEventListener('pointerdown', (e) => {
    const type = e.pointerType || 'mouse'
    if (type === 'mouse' && e.button !== 0) return       // 右键 / 中键不拖拽
    capture(e)
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY, type })
    lastPointer = { x: e.clientX, y: e.clientY, type }; inside = true
    cb.interrupt()
    if (pointers.size === 1) {
      const t = performance.now()
      gesture = { kind: 'press', type, sx: e.clientX, sy: e.clientY, lx: e.clientX, ly: e.clientY, drag: false, samples: [[t, e.clientX, e.clientY]], shift: e.shiftKey }
    } else if (pointers.size === 2) {
      // 第二根手指落下：转为捏合；本次手势不再产生单击
      const [a, b] = [...pointers.values()]
      gesture = { kind: 'pinch', mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2, d: Math.max(1, Math.hypot(a.x - b.x, a.y - b.y)) }
      setHover(null)
    }
    setCursor()
  })

  canvas.addEventListener('pointermove', (e) => {
    const type = e.pointerType || 'mouse'
    lastPointer = { x: e.clientX, y: e.clientY, type }; inside = true
    const p = pointers.get(e.pointerId)
    if (p) {
      p.x = e.clientX; p.y = e.clientY
      if (!gesture) return
      if (gesture.kind === 'pinch') {
        if (pointers.size < 2) return
        const [a, b] = [...pointers.values()]
        const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2, d = Math.max(1, Math.hypot(a.x - b.x, a.y - b.y))
        cb.pinch(mx - gesture.mx, my - gesture.my, d / gesture.d, mx, my)
        gesture.mx = mx; gesture.my = my; gesture.d = d
        return
      }
      const g = gesture
      if (!g.drag && Math.hypot(e.clientX - g.sx, e.clientY - g.sy) > (DRAG_PX[g.type] ?? 4)) {
        g.drag = true
        setHover(null)        // 拖拽中不做悬停，并立即发 hover(null)
        setCursor()
      }
      if (g.drag) {
        cb.panBy(e.clientX - g.lx, e.clientY - g.ly)
        g.lx = e.clientX; g.ly = e.clientY
        const t = performance.now()
        g.samples.push([t, e.clientX, e.clientY])
        while (g.samples.length > 2 && t - g.samples[0][0] > VEL_WINDOW_MS * 2) g.samples.shift()
      }
      return
    }
    // 无按键的移动：悬停（触屏没有悬停）
    if (type === 'touch' || gesture) return
    setHover(pick(e.clientX, e.clientY), e.clientX, e.clientY)
  })

  const release = (e, cancelled) => {
    if (!pointers.has(e.pointerId)) return
    pointers.delete(e.pointerId)
    try { canvas.releasePointerCapture(e.pointerId) } catch { /* 已释放 */ }
    const g = gesture
    if (!g) return
    if (g.kind === 'pinch') {
      if (pointers.size === 1) {
        // 抬起一指：剩下那根继续拖拽（不再算单击）
        const [q] = [...pointers.values()]
        gesture = { kind: 'press', type: q.type, sx: q.x, sy: q.y, lx: q.x, ly: q.y, drag: true, samples: [[performance.now(), q.x, q.y]] }
      } else if (pointers.size === 0) gesture = null
      setCursor()
      return
    }
    gesture = null
    setCursor()
    if (cancelled) return
    if (g.drag) {
      // 惯性：最后 80ms 的平均速度；松手前停顿超过 80ms 则无惯性
      const t = performance.now(), s = g.samples
      const lastS = s[s.length - 1]
      let first = lastS
      for (const q of s) if (t - q[0] <= VEL_WINDOW_MS) { first = q; break }
      const dt = lastS[0] - first[0]
      if (t - lastS[0] <= VEL_WINDOW_MS && dt >= 8) cb.inertia((lastS[1] - first[1]) / dt, (lastS[2] - first[2]) / dt)
      return
    }
    // 单击 / 点按
    const x = e.clientX, y = e.clientY, now = performance.now()
    if (lastTap && now - lastTap.t < DBL_MS && Math.hypot(x - lastTap.x, y - lastTap.y) < DBL_PX) {
      lastTap = null; lastDbl = now
      cb.dblZoom(x, y, e.shiftKey)
      return
    }
    lastTap = { t: now, x, y }
    const t = pick(x, y, { touch: g.type === 'touch' })
    if (t && t.kind === 'body') actions.select(t.id)
    else if (t && t.kind === 'constellation') actions.flyTo({ family: t.family })
    else actions.deselect()
    if (g.type !== 'touch') setHover(pick(x, y), x, y)
  }
  canvas.addEventListener('pointerup', (e) => release(e, false))
  canvas.addEventListener('pointercancel', (e) => release(e, true))
  canvas.addEventListener('lostpointercapture', (e) => { if (pointers.has(e.pointerId) && e.buttons === 0) release(e, true) })

  canvas.addEventListener('pointerleave', (e) => {
    if (pointers.has(e.pointerId)) return
    inside = false
    setHover(null)
  })
  canvas.addEventListener('pointerenter', () => { inside = true })

  canvas.addEventListener('dblclick', (e) => {
    e.preventDefault()
    if (performance.now() - lastDbl < 250) return     // 已由 pointerup 识别过（原生 dblclick 紧随第二次 pointerup 之后到达）
    lastDbl = performance.now(); lastTap = null
    cb.dblZoom(e.clientX, e.clientY, e.shiftKey)
  })
  canvas.addEventListener('contextmenu', (e) => { if (gesture) e.preventDefault() })

  canvas.addEventListener('wheel', (e) => {
    e.preventDefault()
    cb.interrupt()
    let dy = e.deltaY
    if (e.deltaMode === 1) dy *= 16
    else if (e.deltaMode === 2) dy *= state.h || 800
    if (!dy) return
    const k = 0.0015 * (e.ctrlKey ? 4 : 1)              // ctrlKey = 触控板捏合
    const f = Math.min(4, Math.max(0.25, Math.exp(-dy * k)))
    cb.zoomAt(f, e.clientX, e.clientY)
    lastPointer = { x: e.clientX, y: e.clientY, type: 'mouse' }; inside = true
  }, { passive: false })

  /* ───────── 键盘 ─────────
   * Esc 在 window 冒泡阶段处理：搜索框自己先处理（收起列表 / 清空输入，处理过就 stopPropagation，
   * 不会到这里）；到这里时先 closeSearch()（焦点不在搜索框但列表开着的情况），返回 false 才取消选中。 */
  addEventListener('keydown', (e) => {
    if (e.key !== 'Escape' || e.isComposing) return
    cb.interrupt()
    if (cb.closeSearch()) { e.preventDefault(); return }
    actions.deselect()
  })

  addEventListener('keydown', (e) => {
    if (e.key === 'Escape' || e.isComposing || e.defaultPrevented) return
    const el = e.target
    if (isTyping(el)) return                            // 搜索框获得焦点时，除 Esc 外不生效
    const mod = e.ctrlKey || e.metaKey
    if ((e.key === 'k' || e.key === 'K') && mod && !e.altKey) { e.preventDefault(); cb.focusSearch(); return }
    if (mod || e.altKey) return                         // 不劫持浏览器自身的 Ctrl +/- 缩放等
    if (e.key === '/') { e.preventDefault(); cb.focusSearch(); return }
    if (e.key === '+' || e.key === '=') { e.preventDefault(); actions.zoomBy(2); return }
    if (e.key === '-' || e.key === '_') { e.preventDefault(); actions.zoomBy(0.5); return }
    if (e.key === '0') { e.preventDefault(); actions.resetView(); return }
    const arrows = { ArrowLeft: [80, 0], ArrowRight: [-80, 0], ArrowUp: [0, 80], ArrowDown: [0, -80] }
    const a = arrows[e.key]
    if (a) {
      // 面板（可滚动、关联列表）与列表框里的方向键留给它们自己
      if (el instanceof Element && el.closest('#atlas-panel, [role="listbox"]')) return
      e.preventDefault()
      cb.keyPan(a[0], a[1])
    }
  })
}
