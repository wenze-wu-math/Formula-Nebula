/**
 * designs/map/src/camera.js — 相机动画（编排模块，SPEC §10.3）。
 *
 * 只有一条"当前动画"，由渲染循环每帧调用 step(now) 推进；动画本身不调 rAF，
 * 这样"相机动了 → 这一帧重画"天然同步，不会出现相机比画面快一帧的撕裂。
 *
 * 动画种类：
 *   · fly   —— van Wijk & Nuij（2003）平滑缩放平移：远距离先拉远再推近，比线性插值省眼睛。
 *              参数化为 [ux, uy, w]（w = 视口宽度对应的世界宽度 = size.w / z），与 d3.interpolateZoom 同一公式。
 *              时长 = FLY_MS × clamp(0.5, 1.4, 0.55 + 0.45·|S|)（S 是路径的"感知长度"），easeInOutCubic。
 *   · zoom  —— 以屏幕点为锚的缩放（按钮 / 键盘 / 双击）：log z 线性插值、锚点世界坐标线性插值，easeOutCubic。
 *              连按时以上一段动画的终点为基准叠加，所以连点三下 ＋ 就是 1.6³ 倍，不会"吃掉"中途的按键。
 *   · pan   —— 方向键平移：同 zoom 的插值（z 不变），连按同样叠加。
 *   · inertia —— 拖拽松手惯性：速度（px/帧）每 16.7ms 衰减到 0.92。
 *
 * 约定：
 *   · 每帧结果都过 clamp（= view.js 的 clampView），终点也事先 clamp，所以动画终点就是最终视图。
 *   · prefers-reduced-motion → 所有动画瞬移（惯性直接不做）。
 *   · cancel()（用户拖拽 / 滚轮 / 新动画）会立即停在当前位置，被取消的 promise 照常 resolve。
 *   · promise 在终点那一帧**画完之后**才 resolve（经 whenDrawn），截图工具拿到的就是最终画面。
 */
import { FLY_MS } from './constants.js'

const RHO = 1.3            // van Wijk 的 ρ：越大越倾向"先拉远"；√2（d3 默认）在本图上拉得太远，1.3 更克制
const RHO2 = RHO * RHO, RHO4 = RHO2 * RHO2

export const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
export const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3)

/**
 * van Wijk–Nuij 插值。p = [ux, uy, w]。
 * @returns {{at: (t:number) => [number, number, number], S: number}}
 */
export function interpolateZoom(p0, p1) {
  const [ux0, uy0, w0] = p0, [ux1, uy1, w1] = p1
  const dx = ux1 - ux0, dy = uy1 - uy0, d2 = dx * dx + dy * dy
  if (d2 < 1e-12) {
    const S = Math.log(w1 / w0) / RHO
    return { S, at: (t) => [ux0 + t * dx, uy0 + t * dy, w0 * Math.exp(RHO * t * S)] }
  }
  const d1 = Math.sqrt(d2)
  const b0 = (w1 * w1 - w0 * w0 + RHO4 * d2) / (2 * w0 * RHO2 * d1)
  const b1 = (w1 * w1 - w0 * w0 - RHO4 * d2) / (2 * w1 * RHO2 * d1)
  const r0 = Math.log(Math.sqrt(b0 * b0 + 1) - b0)
  const r1 = Math.log(Math.sqrt(b1 * b1 + 1) - b1)
  const S = (r1 - r0) / RHO
  const coshr0 = Math.cosh(r0), sinhr0 = Math.sinh(r0)
  return {
    S,
    at: (t) => {
      if (t >= 1) return [ux1, uy1, w1]
      const s = t * S
      const u = (w0 / (RHO2 * d1)) * (coshr0 * Math.tanh(RHO * s + r0) - sinhr0)
      return [ux0 + u * dx, uy0 + u * dy, (w0 * coshr0) / Math.cosh(RHO * s + r0)]
    },
  }
}

/**
 * @param {{state: object, clamp: (v) => {x,y,z}, whenDrawn: () => Promise<void>, invalidate: () => void}} deps
 */
export function createCamera({ state, clamp, whenDrawn, invalidate }) {
  /** 当前动画：{kind, t0, ms, at(e)→view, ease, goal, resolve} 或惯性 {kind:'inertia', vx, vy, last} */
  let anim = null

  function reducedMotion() {
    try { return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches } catch { return false }
  }

  function settle(a) {
    if (a && a.resolve) { const r = a.resolve; a.resolve = null; whenDrawn().then(r) }
  }

  /** 立即停在当前位置（被取消的 promise 照常 resolve） */
  function cancel() {
    if (!anim) return
    const a = anim
    anim = null
    settle(a)
  }

  /** 无动画直接设视图；画完后 resolve */
  function jump(v) {
    cancel()
    state.view = clamp(v)
    invalidate()
    return whenDrawn()
  }

  function start(kind, at, ms, ease, goal) {
    cancel()
    if (!(ms > 0) || reducedMotion()) return jump(goal)
    return new Promise((resolve) => {
      anim = { kind, at, ms, ease, goal, t0: performance.now(), resolve }
      invalidate()
    })
  }

  /** 锚点插值：锚点（屏幕 sx,sy）下的世界点线性插值、log z 线性插值（zoom/pan 共用） */
  function anchored(v0, v1, sx, sy) {
    const { w, h } = state.size
    const ax = sx - w / 2, ay = sy - h / 2
    const wx0 = v0.x + ax / v0.z, wy0 = v0.y + ay / v0.z
    const wx1 = v1.x + ax / v1.z, wy1 = v1.y + ay / v1.z
    const l0 = Math.log(v0.z), l1 = Math.log(v1.z)
    return (e) => {
      const z = Math.exp(l0 + (l1 - l0) * e)
      return { x: wx0 + (wx1 - wx0) * e - ax / z, y: wy0 + (wy1 - wy0) * e - ay / z, z }
    }
  }

  /**
   * 平滑飞到目标视图（canvas 中心坐标 + z）。
   * @param {{x,y,z}} target
   * @param {{ms?: number}} [opt] 不传则按距离自动定时长
   */
  function flyTo(target, { ms } = {}) {
    const v0 = state.view
    const goal = clamp({ x: target.x ?? v0.x, y: target.y ?? v0.y, z: target.z ?? v0.z })
    const W = Math.max(1, state.size.w)
    const iz = interpolateZoom([v0.x, v0.y, W / v0.z], [goal.x, goal.y, W / goal.z])
    // 几乎没动：不值得做动画（也避免 S≈0 时的除零）
    const movedPx = Math.hypot(goal.x - v0.x, goal.y - v0.y) * goal.z
    if (Math.abs(Math.log(goal.z / v0.z)) < 1e-3 && movedPx < 0.5) return jump(goal)
    const dur = ms ?? FLY_MS * Math.min(1.4, Math.max(0.5, 0.55 + 0.45 * Math.abs(iz.S)))
    const at = (e) => { const [ux, uy, w] = iz.at(e); return { x: ux, y: uy, z: W / w } }
    return start('fly', at, dur, easeInOutCubic, goal)
  }

  /** 连按叠加：同类动画进行中时以它的终点为基准 */
  function baseFor(kind) {
    return anim && anim.kind === kind && anim.goal ? anim.goal : state.view
  }

  /** 以屏幕点 (sx, sy) 为锚缩放 factor 倍（短动画） */
  function zoomAround(factor, sx, sy, { ms = 260 } = {}) {
    const base = baseFor('zoom')
    const { w, h } = state.size
    const ax = sx - w / 2, ay = sy - h / 2
    const wx = base.x + ax / base.z, wy = base.y + ay / base.z
    const z = clamp({ ...base, z: base.z * factor }).z
    const goal = clamp({ x: wx - ax / z, y: wy - ay / z, z })
    return start('zoom', anchored(state.view, goal, sx, sy), ms, easeOutCubic, goal)
  }

  /** 以屏幕点为锚立即缩放（滚轮 / 捏合，逐事件调用，不做动画） */
  function zoomAtNow(factor, sx, sy) {
    cancel()
    const v = state.view
    const { w, h } = state.size
    const ax = sx - w / 2, ay = sy - h / 2
    const wx = v.x + ax / v.z, wy = v.y + ay / v.z
    const z = clamp({ ...v, z: v.z * factor }).z
    state.view = clamp({ x: wx - ax / z, y: wy - ay / z, z })
    invalidate()
  }

  /** 平移屏幕像素（方向键），短动画，连按叠加 */
  function panBy(dxPx, dyPx, { ms = 180 } = {}) {
    const base = baseFor('pan')
    const goal = clamp({ x: base.x + dxPx / base.z, y: base.y + dyPx / base.z, z: base.z })
    const { w, h } = state.size
    return start('pan', anchored(state.view, goal, w / 2, h / 2), ms, easeOutCubic, goal)
  }

  /** 拖拽松手惯性；v = 屏幕速度（px/ms） */
  function inertia(vxPxMs, vyPxMs) {
    cancel()
    if (reducedMotion()) return
    const vx = vxPxMs * 16.7, vy = vyPxMs * 16.7  // → px/帧
    if (Math.hypot(vx, vy) < 1.5) return
    anim = { kind: 'inertia', vx, vy, last: performance.now() }
    invalidate()
  }

  /**
   * 渲染循环每帧调用。
   * @returns {boolean} 本帧视图是否被动画改变
   */
  function step(now) {
    if (!anim) return false
    const a = anim
    if (a.kind === 'inertia') {
      const dt = Math.min(64, Math.max(0, now - a.last)) || 16.7
      a.last = now
      const k = dt / 16.7
      const v = state.view
      const nv = clamp({ x: v.x - (a.vx * k) / v.z, y: v.y - (a.vy * k) / v.z, z: v.z })
      const decay = Math.pow(0.92, k)
      a.vx *= decay; a.vy *= decay
      // 撞到平移边界就停（否则会在边上"卡住"空转）
      const stuck = Math.abs(nv.x - v.x) + Math.abs(nv.y - v.y) < 1e-9
      state.view = nv
      if (stuck || Math.hypot(a.vx, a.vy) < 0.08) anim = null
      return true
    }
    const t = Math.min(1, Math.max(0, (now - a.t0) / a.ms))
    if (t >= 1) {
      state.view = a.goal
      anim = null
      settle(a)
    } else {
      state.view = clamp(a.at(a.ease(t)))
    }
    return true
  }

  return {
    flyTo, zoomAround, zoomAtNow, panBy, inertia, jump, cancel, step, clamp,
    /** 当前动画终点（无动画 / 惯性时为 null） */
    goal: () => (anim && anim.goal) || null,
    get animating() { return !!anim },
    get kind() { return anim ? anim.kind : null },
  }
}
