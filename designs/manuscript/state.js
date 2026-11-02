/**
 * designs/manuscript/state.js — 共享状态对象 + 事件总线 + 坐标变换（冻结文件，建造者只读）。
 *
 * 取舍：用一个**可变的单例** state，而不是 store/reducer。原因：
 *   · render 每帧要读十几个字段，走订阅/拷贝太重；
 *   · 写入方很少且固定（见 SPEC §3.2 的"字段归属"表）：camera 字段只由 camera.js 写，
 *     selection / hover / search 只由 main.js 的 actions 写，其余模块**只读**。
 * 任何写入后都要调用 requestDraw()，否则下一帧不会重画。
 */

import { CHROME } from './constants.js'

export const state = {
  /* ── 数据（boot 时写入一次，之后只读） ── */
  graph: null,          // getGraph() 的结果
  layout: null,         // layout.buildLayout() 的结果（SPEC §4.2 的 Layout）
  dims: null,           // Map<id, {w, h}>：公式 SVG 尺寸（MathJax px），formulas.computeDims() 的结果

  /* ── 相机（只由 camera.js 写） ── */
  cam: { x: 0, y: 0, z: 0.15 },   // 世界坐标 (x, y) 显示在可见区中心；z = 屏幕 px / 世界单位
  camAnimating: false,
  fitZoom: 0.15,                  // 全卷适配时的 zoom（camera.fitAll 计算后写入）

  /* ── 视口（只由 main.js 在 resize 时写） ── */
  vw: 1600, vh: 1000, dpr: 1,     // canvas 的 CSS 尺寸与 devicePixelRatio

  /* ── 界面框架（只由 main.js 根据 ui 的面板开合写） ── */
  panelOpen: false,

  /* ── 交互状态（只由 main.js 的 actions 写） ── */
  selectedId: null,
  hoverId: null,                  // 画布悬停 或 面板关联列表悬停 的节点 id
  hoverSource: null,              // 'canvas' | 'panel' | null：panel 悬停时 render 把对应关联线描成朱墨
  flash: null,                    // { id, t0 }：定位后的一次性"朱墨点按"涟漪（render 画 ~900ms，期间自行 requestDraw）
  query: '',
  hits: [],                       // 搜索命中 id（按相关度/重要度排序）
  hitSet: new Set(),
  showAmbient: true,              // 栏内铅笔弧（默认开）
  showLegend: false,

  /* ── 渲染簿记 ── */
  dirty: true,                    // 下一帧需要重画
  ready: false,
  fps: 0,
}

/** 标记需要重画（任何模块改了会影响画面的状态后都调用它） */
export function requestDraw() { state.dirty = true }

/* ───────── 可见区（扣掉顶栏、左栏、打开时的右侧面板）───────── */

/** 画布上"可用来看内容"的矩形（CSS px，相对 canvas 左上角）。相机中心对准它的中心。 */
export function visibleRect() {
  const left = CHROME.RAIL
  const top = CHROME.TOP
  const right = state.vw - (state.panelOpen ? CHROME.PANEL : 0)
  const bottom = state.vh
  return { x: left, y: top, w: Math.max(50, right - left), h: Math.max(50, bottom - top) }
}

/* ───────── 坐标变换 ─────────
 * screen = (world - cam) * z + 可见区中心 */
export function w2s(wx, wy) {
  const r = visibleRect()
  return [(wx - state.cam.x) * state.cam.z + r.x + r.w / 2, (wy - state.cam.y) * state.cam.z + r.y + r.h / 2]
}
export function s2w(sx, sy) {
  const r = visibleRect()
  return [(sx - r.x - r.w / 2) / state.cam.z + state.cam.x, (sy - r.y - r.h / 2) / state.cam.z + state.cam.y]
}
/** 当前整个 canvas（不只是可见区）覆盖的世界矩形 {x,y,w,h}，用于裁剪 */
export function worldViewport() {
  const [x0, y0] = s2w(0, 0)
  const [x1, y1] = s2w(state.vw, state.vh)
  return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 }
}

/* ───────── 事件总线 ─────────
 * 事件名与载荷（SPEC §3.3）：
 *   'select'  { id|null, prev|null }      main.actions.select/deselect 之后
 *   'hover'   { id|null, sx, sy, legible, source } main 在悬停目标变化或移动时（source: 'canvas'|'panel'）
 *   'search'  { query, hits, error|null }  main.actions.search 之后
 *   'view'    { x, y, z, level }           相机变化后（main 节流到每帧最多一次）
 *   'chrome'  { panelOpen }                面板开合
 *   'ready'   {}                           首屏完成
 *   'progress'{ phase, done, total }       启动进度（公式量尺寸 / 烘焙）
 */
const handlers = new Map()
export const bus = {
  on(name, fn) {
    if (!handlers.has(name)) handlers.set(name, new Set())
    handlers.get(name).add(fn)
    return () => handlers.get(name).delete(fn)
  },
  emit(name, payload) {
    const set = handlers.get(name)
    if (!set) return
    for (const fn of [...set]) {
      try { fn(payload) } catch (e) { console.error(`[bus:${name}]`, e) }
    }
  },
}
