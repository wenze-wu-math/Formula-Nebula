/**
 * designs/atlas/camera.js — 相机的纯函数部分（M6 所有，SPEC §7.1）。
 *
 * 只做数学，不碰 state / DOM：输入视图与视口，输出视图。飞行动画的"时钟"在 main.js，
 * 这里只给出 planFly() 生成的插值函数，Node 下可直接单测。
 *
 * 视图 view = { cx, cy, zoom }：世界点 (cx, cy) 在**画布**中心（geo.js 约定）。
 * 面板打开时"可视区中心"不等于画布中心，所以所有"把某点居中"的操作都通过
 * viewPlacing(x, y, zoom, w, h, px, py) 把世界点放到可视区中心 (px, py)，而不是改 view 的语义。
 */
import { FIT_MARGIN, L_MIN, L_MAX, FLY_EXTRA_L, FLY_MAX_L, FLY_MIN_MS, FLY_MAX_MS, PANEL_W, SHEET_BREAKPOINT, SHEET_VH } from './constants.js'
/* 世界长度量从 runtime.js 取（可缩放 live binding）；见 runtime.js 头注释 */
import { FIT_RADIUS } from './runtime.js'
import { clamp } from './geo.js'

/** 全图适配缩放：按整个视口算，不扣面板（开关面板 L 不变） */
export const fitZoom = (w, h) => Math.max(1e-4, (Math.min(w, h) / 2 - FIT_MARGIN) / FIT_RADIUS)
export const zoomToL = (zoom, zoom0) => Math.log2(zoom / zoom0)
export const LToZoom = (L, zoom0) => zoom0 * Math.pow(2, L)
export const clampL = (L) => clamp(L, L_MIN, L_MAX)

/**
 * 夹紧：L ∈ [L_MIN, L_MAX]；"可视区中心"下的世界点离原点 ≤ FIT_RADIUS。
 * off = 可视区中心相对画布中心的偏移（css px，面板打开时为负 x）。
 * 取舍：按可视区中心而不是画布中心夹紧——否则面板打开时，被选中的外缘研究者
 * 会被夹紧推到面板底下。无面板时 off = 0，与"中心离原点 ≤ FIT_RADIUS"完全一致。
 */
export function clampView(v, zoom0, off = { x: 0, y: 0 }) {
  if (![v.cx, v.cy, v.zoom].every(Number.isFinite) || v.zoom <= 0) return { cx: 0, cy: 0, zoom: zoom0 }
  const zoom = LToZoom(clampL(zoomToL(v.zoom, zoom0)), zoom0)
  const ox = off.x / zoom, oy = off.y / zoom
  const px = v.cx + ox, py = v.cy + oy           // 可视区中心下的世界点
  const d = Math.hypot(px, py), k = d > FIT_RADIUS ? FIT_RADIUS / d : 1
  return { cx: px * k - ox, cy: py * k - oy, zoom }
}

/**
 * 面板遮挡矩形。panel.js 打开时会登记 occluders.get('panel')；
 * 但 select 时面板的 'select' 处理器与本次飞行目标的计算有先后之分（且面板有 220ms 滑入），
 * 所以当"已选中但还没登记"时按 SPEC 的尺寸**预测**一个，保证第一次飞行就扣掉面板。
 */
export function panelRect(w, h, occluders, selected) {
  const p = occluders.get('panel')
  if (p) return p
  if (!selected) return null
  if (w < SHEET_BREAKPOINT) { const sh = Math.round(h * SHEET_VH); return { x: 0, y: h - sh, w, h: sh } }
  return { x: w - PANEL_W, y: 0, w: PANEL_W, h }
}

/**
 * 可视区（css px 矩形）：扣掉右侧面板 / 底部抽屉。
 * 区分两种形态：矩形贴底且宽≈视口 → 抽屉；否则 → 右侧面板。
 */
export function visibleRect(w, h, panel) {
  if (!panel) return { x: 0, y: 0, w, h }
  const sheet = panel.y > 1 && panel.w >= w * 0.9
  if (sheet) return { x: 0, y: 0, w, h: clamp(panel.y, 1, h) }
  return { x: 0, y: 0, w: clamp(panel.x, 1, w), h }
}

/** 可视区中心（css px） */
export function visibleCenter(w, h, panel) {
  // 兼容脚手架签名：第三参数也可以是 occluders Map
  if (panel instanceof Map) panel = panel.get('panel') || null
  const r = visibleRect(w, h, panel)
  return { x: r.x + r.w / 2, y: r.y + r.h / 2 }
}

/** 以屏幕点 (sx, sy) 为锚缩放 factor 倍，返回新 view（未夹紧） */
export function zoomAt(v, w, h, factor, sx, sy) {
  const wx = (sx - w / 2) / v.zoom + v.cx, wy = (sy - h / 2) / v.zoom + v.cy
  const zoom = v.zoom * factor
  return { cx: wx - (sx - w / 2) / zoom, cy: wy - (sy - h / 2) / zoom, zoom }
}

/**
 * 以锚点缩放，但先把 factor 夹到 L 范围内——这样撞到 L_MIN/L_MAX 时锚点下的世界点
 * 仍然不动（若先算再夹紧 zoom，中心会漂）。
 */
export function zoomAtClamped(v, zoom0, w, h, factor, sx, sy) {
  const L1 = clampL(zoomToL(v.zoom * factor, zoom0))
  return zoomAt(v, w, h, LToZoom(L1, zoom0) / v.zoom, sx, sy)
}

/** 让世界点 (x, y) 落在屏幕点 (px, py) 时的 view */
export function viewPlacing(x, y, zoom, w, h, px, py) {
  return { cx: x - (px - w / 2) / zoom, cy: y - (py - h / 2) / zoom, zoom }
}

/** 选中某 body 时的目标 L（SPEC §7.1）：至少能显示公式 + 中文名，再加 FLY_EXTRA_L */
export const focusL = (body, curL) => clampL(Math.max(curL, Math.min(FLY_MAX_L, body.nameL + FLY_EXTRA_L)))

/**
 * 把世界包围盒装进可视区 vr（四周留 margin px），返回 view。
 * Lmin/Lmax 限制结果的语义级。
 */
export function fitBox(box, w, h, vr, zoom0, margin = 48, Lmin = L_MIN, Lmax = L_MAX) {
  const bw = Math.max(1, box.x1 - box.x0), bh = Math.max(1, box.y1 - box.y0)
  const aw = Math.max(40, vr.w - 2 * margin), ah = Math.max(40, vr.h - 2 * margin)
  const L = clamp(zoomToL(Math.min(aw / bw, ah / bh), zoom0), Math.max(L_MIN, Lmin), Math.min(L_MAX, Lmax))
  return viewPlacing((box.x0 + box.x1) / 2, (box.y0 + box.y1) / 2, LToZoom(L, zoom0), w, h, vr.x + vr.w / 2, vr.y + vr.h / 2)
}

/* ───────── 飞行 ───────── */

/** 两个视图中心之间的屏幕距离（按起点 zoom 算，css px） */
export const screenDist = (a, b) => Math.hypot(b.cx - a.cx, b.cy - a.cy) * a.zoom

/** SPEC §7.1 的飞行时长 */
export function flyDuration(from, to, zoom0) {
  const dL = Math.abs(zoomToL(to.zoom, zoom0) - zoomToL(from.zoom, zoom0))
  return clamp(FLY_MIN_MS + 180 * dL + 0.6 * screenDist(from, to), FLY_MIN_MS, FLY_MAX_MS)
}

/**
 * 生成飞行插值 at(e) → view，e ∈ [0,1] 为缓动后的进度。
 *
 * - L：线性插值；若屏幕距离 > 1.2·视口宽，叠加一个 sin 形"鼓包"让中途 L 先降 0.8（先拉远再拉近）。
 * - 中心（无锚点）：按"屏幕上匀速"参数化——中心移动 du 世界单位在屏幕上是 du·zoom 像素，
 *   要屏幕速度恒定就得 du/de ∝ 1/zoom(e)。用 64 段数值积分建表 u(e) = F(e)/F(1)。拉远时世界跨度大、拉近时跨度小，
 *   视觉上就是 van Wijk 式的平滑"飞行"，而不会出现"先冲过头再缩"的感觉。
 * - 中心（有锚点 anchor = {wx,wy}，锚点屏幕位置下的世界点，双击 / 按钮缩放用）：锚点下的世界点全程不动，
 *   即 center = W + (C0 − W)·z0/z(e)，与 zoomAt 一致。
 */
export function planFly(from, to, zoom0, vw, anchor = null) {
  const L0 = zoomToL(from.zoom, zoom0), L1 = zoomToL(to.zoom, zoom0)
  const bump = !anchor && screenDist(from, to) > 1.2 * vw ? 0.8 : 0
  const Lat = (e) => clampL(L0 + (L1 - L0) * e - bump * Math.sin(Math.PI * e))
  if (anchor) {
    // 锚点下的世界点 W：from 视图里锚点对应的世界坐标（to 由 zoomAt 生成，W 相同）
    const { wx, wy } = anchor
    return (e) => {
      const zoom = LToZoom(Lat(e), zoom0)
      if (e >= 1) return { ...to }
      const k = from.zoom / zoom
      return { cx: wx + (from.cx - wx) * k, cy: wy + (from.cy - wy) * k, zoom }
    }
  }
  const N = 64, F = new Float64Array(N + 1)
  for (let i = 1; i <= N; i++) {
    const e = (i - 0.5) / N
    F[i] = F[i - 1] + 1 / LToZoom(Lat(e), zoom0)
  }
  const tot = F[N] || 1
  const u = (e) => {
    const p = clamp(e, 0, 1) * N, i = Math.min(N - 1, Math.floor(p)), f = p - i
    return (F[i] + (F[i + 1] - F[i]) * f) / tot
  }
  return (e) => {
    if (e >= 1) return { ...to }
    const k = u(e)
    return { cx: from.cx + (to.cx - from.cx) * k, cy: from.cy + (to.cy - from.cy) * k, zoom: LToZoom(Lat(e), zoom0) }
  }
}
