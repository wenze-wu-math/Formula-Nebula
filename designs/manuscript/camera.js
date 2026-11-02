/**
 * designs/manuscript/camera.js — 相机：适配、钳制、飞行动画、以光标为不动点缩放、拖动惯性（SPEC §8.3）。
 *
 * state.cam / state.camAnimating / state.fitZoom **只由本文件写**。其他模块要动相机，调用这里的函数。
 *
 * 设计取舍：
 *   · 飞行的缩放用**对数插值**：从 0.12 飞到 1.2，前半程与后半程在感知上各占一半；线性插值会"先猛冲再磨蹭"。
 *   · 远距离飞行（起止视图互不覆盖）用两段式"先拉远、再拉近"（van Wijk 的简化版）：中途的 zoom 取
 *     能同时看见起点与终点中心的那一档。读者在全卷尺度下看见自己从哪一页去了哪一页，不会迷路。
 *   · 平移按 1/z 加权插值（屏幕空间均匀）：直接对世界坐标线性插值时，低 zoom 段一闪而过、高 zoom 段拖沓。
 *   · 平移钳制只要求"相机中心不离开 layout.bounds"——比"纸页必须充满屏幕"宽松，放大看页角时不会被硬推回去。
 *   · fitZoom 跟随当前可见区（面板开合、窗口尺寸变化时由 main 调 refreshFit() 重算），minZoom = fitZoom × MIN_FACTOR。
 */
import { state, requestDraw, visibleRect, s2w } from './state.js'
import { ZOOM, CHROME, TEX_EM } from './constants.js'

let fly = null      // { from, to, peak, t0, ms, resolve }
let inertia = null  // { vx, vy (屏幕 px/ms), t0, last }

const FLY_MIN_MS = 520
const FLY_MAX_MS = 900
const INERTIA_MS = 380       // 惯性滑行时长上限（契约 ≤ 400ms）
const INERTIA_MIN_V = 0.12   // 松手速度低于此（屏幕 px/ms）就不滑行

/* ───────── 适配 ───────── */

/** 让世界矩形 rect 恰好装进可见区（四周留 margin 屏幕 px）的视图，已钳制。 */
export function fitRect(rect, margin = CHROME.FIT_MARGIN) {
  return clampView(rawFit(rect, margin))
}

function rawFit(rect, margin = CHROME.FIT_MARGIN) {
  const r = visibleRect()
  const w = Math.max(1, rect.w), h = Math.max(1, rect.h)
  const z = Math.min(Math.max(10, r.w - 2 * margin) / w, Math.max(10, r.h - 2 * margin) / h)
  return { x: rect.x + w / 2, y: rect.y + h / 2, z }
}

/** 重算 state.fitZoom（全卷恰好装进当前可见区的 zoom）。先写 fitZoom 再钳制，否则 minZoom 会用旧值。 */
export function refreshFit() {
  if (!state.layout) return state.fitZoom
  state.fitZoom = rawFit(state.layout.bounds).z
  return state.fitZoom
}

/** 全卷适配视图 {x,y,z}，并写 state.fitZoom。 */
export function fitAll() {
  refreshFit()
  return clampView(rawFit(state.layout.bounds))
}

/** 让该条公式的屏幕 em = ZOOM.READ_EM_PX 的 zoom，钳在 [READ_MIN, READ_MAX]；没有公式（研究者）用 ZOOM.READING。 */
export function readingZoom(item) {
  if (!item || !item.formula || !(item.formula.scale > 0)) return ZOOM.READING
  const z = ZOOM.READ_EM_PX / (item.formula.scale * TEX_EM)
  return Math.max(ZOOM.READ_MIN, Math.min(ZOOM.READ_MAX, z))
}

export function minZoom() { return state.fitZoom * ZOOM.MIN_FACTOR }

/** 钳制：zoom ∈ [minZoom, MAX]；相机中心不离开 layout.bounds。非有限值回退到当前相机。 */
export function clampView(v) {
  const c = state.cam
  const num = (a, d) => (typeof a === 'number' && Number.isFinite(a) ? a : d)
  const z = Math.max(minZoom(), Math.min(ZOOM.MAX, num(v && v.z, c.z)))
  let x = num(v && v.x, c.x), y = num(v && v.y, c.y)
  const b = state.layout && state.layout.bounds
  if (b) {
    x = Math.max(b.x, Math.min(b.x + b.w, x))
    y = Math.max(b.y, Math.min(b.y + b.h, y))
  }
  return { x, y, z }
}

/* ───────── 立即设置 ───────── */

/** 立即设置相机（打断飞行与惯性）。v 可只给部分字段。 */
export function setCam(v) {
  cancelFly(); inertia = null
  Object.assign(state.cam, clampView({ ...state.cam, ...v }))
  requestDraw()
}

/**
 * 面板开合时由 main 调用：把相机中心水平移动 dx 世界单位，**不打断**正在进行的飞行
 * （飞行的起点与终点一起移，飞行中开合面板也不跳）。不做钳制：这是坐标系补偿，不是用户平移。
 */
export function shiftView(dx) {
  state.cam.x += dx
  if (fly) { fly.from.x += dx; fly.to.x += dx }
  requestDraw()
}

/* ───────── 飞行 ───────── */

/** 正在飞往的目标（没在飞就是当前相机）。键盘连按 +/-、↑/↓ 时在目标上累加，不会因打断而"丢步"。 */
export function targetView() { return fly ? { ...fly.to } : { ...state.cam } }

/**
 * 动画飞到 v（部分字段可省）。ms 省略时按距离自动取 520–900ms；ms=0 立即到位。
 * 返回 Promise：飞到、被新的飞行 / 手势打断时都会 resolve（不会悬而不决）。
 * 用户设置了 prefers-reduced-motion 时直接到位。
 */
export function flyTo(v, ms) {
  cancelFly(); inertia = null
  const from = { ...state.cam }
  const to = clampView({ ...from, ...v })
  const r = visibleRect()
  // 两端都在"对方视野"之内吗？不在 → 两段式，中途拉远到能同时看见两个中心的 zoom
  const dxs = Math.abs(to.x - from.x), dys = Math.abs(to.y - from.y)
  const zSee = Math.min((r.w * 0.8) / Math.max(1, dxs), (r.h * 0.8) / Math.max(1, dys))
  const lo = Math.min(from.z, to.z)
  const peak = zSee < lo * 0.92 ? Math.max(minZoom(), zSee) : null
  if (ms === undefined) {
    // 时长：以"对数 zoom 变化 + 以较小 zoom 计的屏幕位移"衡量路程
    const zoomOct = Math.abs(Math.log2(to.z / from.z)) + (peak ? 2 * Math.log2(lo / peak) : 0)
    const screenDist = Math.hypot(dxs, dys) * (peak || lo) / Math.hypot(r.w, r.h)
    ms = FLY_MIN_MS + Math.min(1, (zoomOct * 0.35 + screenDist) / 2.5) * (FLY_MAX_MS - FLY_MIN_MS)
  }
  if (!ms || ms <= 0 || reducedMotion() || (dxs * to.z < 0.5 && dys * to.z < 0.5 && Math.abs(to.z - from.z) < 1e-6)) {
    Object.assign(state.cam, to); requestDraw(); return Promise.resolve()
  }
  return new Promise((resolve) => {
    fly = { from, to, peak, t0: performance.now(), ms, resolve }
    state.camAnimating = true
    requestDraw()
  })
}

/** 取消飞行：相机停在当前位置，Promise resolve。 */
export function cancelFly() {
  if (!fly) return
  const f = fly
  fly = null
  state.camAnimating = false
  f.resolve()
}

export function isFlying() { return !!fly }

function reducedMotion() {
  try { return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) } catch { return false }
}

const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

/** 每帧调用：推进飞行或惯性。返回相机是否仍在运动。 */
export function stepCamera(now = performance.now()) {
  if (fly) {
    const t = Math.min(1, Math.max(0, (now - fly.t0) / fly.ms))
    const e = ease(t)
    const { from, to, peak } = fly
    const lf = Math.log(from.z), lt = Math.log(to.z)
    let lz
    if (peak) {
      // 对数 zoom 走一条抛物线：两端是 from/to，中点 e=0.5 处落在 peak
      const lp = Math.log(peak)
      const mid = (lf + lt) / 2
      lz = lf + (lt - lf) * e + 4 * (lp - mid) * e * (1 - e)
    } else lz = lf + (lt - lf) * e
    const z = Math.exp(lz)
    // 平移进度按 1/z 加权：u(e) = ∫ 1/z / ∫ 1/z。用两端 + 当前 zoom 的简化：屏幕空间里近似匀速
    const u = panProgress(from.z, to.z, peak, e)
    state.cam.z = z
    state.cam.x = from.x + (to.x - from.x) * u
    state.cam.y = from.y + (to.y - from.y) * u
    requestDraw()
    if (t >= 1) {
      Object.assign(state.cam, to)
      const f = fly; fly = null; state.camAnimating = false; f.resolve()
    }
    return !!fly
  }
  if (inertia) {
    const dt = Math.min(48, now - inertia.last)
    inertia.last = now
    const age = now - inertia.t0
    const k = Math.max(0, 1 - age / INERTIA_MS)
    const vx = inertia.vx * k * k, vy = inertia.vy * k * k
    if (k <= 0 || Math.hypot(vx, vy) < 0.02) { inertia = null; state.camAnimating = false; return false }
    applyPan(vx * dt, vy * dt)
    return true
  }
  return false
}

/** 平移进度：对 1/z(s) 在 [0,e] 上做数值积分再归一化（8 段梯形，够用且每帧开销可忽略）。 */
function panProgress(z0, z1, peak, e) {
  if (Math.abs(Math.log(z1 / z0)) < 1e-3 && !peak) return e
  const lf = Math.log(z0), lt = Math.log(z1)
  const lp = peak ? Math.log(peak) : 0, mid = (lf + lt) / 2
  const inv = (s) => Math.exp(-(lf + (lt - lf) * s + (peak ? 4 * (lp - mid) * s * (1 - s) : 0)))
  const integ = (a) => {
    const n = 8, h = a / n
    let sum = (inv(0) + inv(a)) / 2
    for (let i = 1; i < n; i++) sum += inv(i * h)
    return sum * h
  }
  const total = integ(1)
  return total > 0 ? integ(e) / total : e
}

/* ───────── 手势 ───────── */

/** 以屏幕点 (sx,sy) 为不动点缩放 factor 倍（打断飞行与惯性）。 */
export function zoomAt(sx, sy, factor) {
  cancelFly(); inertia = null
  if (!(factor > 0) || !Number.isFinite(factor)) return
  const [wx, wy] = s2w(sx, sy)
  const z = Math.max(minZoom(), Math.min(ZOOM.MAX, state.cam.z * factor))
  const r = visibleRect()
  const v = clampView({ x: wx - (sx - r.x - r.w / 2) / z, y: wy - (sy - r.y - r.h / 2) / z, z })
  Object.assign(state.cam, v)
  requestDraw()
}

/** 按屏幕像素平移（内容跟着手指走：dx>0 内容右移）。打断飞行与惯性。 */
export function panBy(dx, dy) {
  cancelFly(); inertia = null
  applyPan(dx, dy)
}

function applyPan(dx, dy) {
  const v = clampView({ x: state.cam.x - dx / state.cam.z, y: state.cam.y - dy / state.cam.z, z: state.cam.z })
  state.cam.x = v.x; state.cam.y = v.y
  requestDraw()
}

/** 拖动松手后启动惯性滑行（屏幕 px/ms）。速度太低不滑。 */
export function startInertia(vx, vy) {
  inertia = null
  if (!Number.isFinite(vx) || !Number.isFinite(vy) || Math.hypot(vx, vy) < INERTIA_MIN_V || reducedMotion()) return
  const now = performance.now()
  const cap = 4   // px/ms 上限，避免一甩飞出整卷
  const s = Math.min(1, cap / Math.hypot(vx, vy))
  inertia = { vx: vx * s, vy: vy * s, t0: now, last: now }
  state.camAnimating = true
  requestDraw()
}

export function stopInertia() { if (inertia) { inertia = null; state.camAnimating = false } }

/** 相机是否在动（飞行或惯性）——main 的帧循环据此决定是否继续画、是否暂缓写 hash。 */
export function isMoving() { return !!fly || !!inertia }
