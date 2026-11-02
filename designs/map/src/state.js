/**
 * designs/map/src/state.js — 全局共享状态 + 事件总线 + 动作表（架构师冻结）。
 *
 * 取舍：不做响应式框架。所有模块读同一个可变对象 `state`；
 *   · 只有 main/interact/camera（编排模块）**写** view / selection / search / hover；
 *   · 其它模块只读，需要改状态时调用 `actions.xxx()`（由 main.js 在启动时填入实现）；
 *   · 变化通过 `bus` 广播，UI 订阅后刷新 DOM；画布靠 `invalidate()` 置脏，下一帧重画。
 * 这样 UI 模块不需要 import 编排模块（避免循环依赖），各建造者可以并行写。字段语义见 SPEC §5。
 */

export const state = {
  /** getGraph() 的结果（只读） */
  graph: null,
  /** buildWorld() 的结果（只读，结构见 SPEC §6） */
  world: null,

  /** 相机：屏幕中心（canvas 中心）对准的世界点 + 缩放（css px / wu） */
  view: { x: 0, y: 0, z: 1 },
  /** canvas 的 css 尺寸与 devicePixelRatio */
  size: { w: 1, h: 1, dpr: 1 },
  /** 把 world.fitBounds 装进视口的缩放；语义级别 s = view.z / zFit */
  zFit: 1,
  /** 被 UI 遮住的边距（css px）。面板打开时 right = PANEL_W + 16；飞行取景用它把目标放进可见区。 */
  inset: { top: 0, right: 0, bottom: 0, left: 0 },

  /** 当前选中：id + 一跳邻居（id 集合）+ 相关 link 的 key 集合 + 选中时刻（动画用） */
  selection: { id: null, neighbours: new Set(), linkKeys: new Set(), t0: 0 },
  /** 悬停：place id（画布上）或 link key（面板关系列表上），二者互不影响 */
  hover: { id: null, linkKey: null, sx: 0, sy: 0 },
  /** 已提交的搜索：原始查询、按得分排序的命中 id、集合 */
  search: { query: '', ids: [], set: new Set() },
  /** 道路显示选项。showCross 默认 false：跨族道路不画（见 rules.roadVisible 的 2026-11-01 说明）。
   *  由 UI 的「跨族道路」开关翻转；画布与图例都读它，保证"图例里亮的 = 图上画的"。 */
  roadOptions: { showCross: false },

  /** 首屏画完 + 优先公式烘焙完成 */
  ready: false,
  /** 需要重画 */
  dirty: true,
  /** 最近一帧耗时统计（main 写） */
  perf: { fps: 0, frameMs: 0, placeMs: 0, drawMs: 0 },
}

/* ───────── 事件总线 ─────────
 * 事件名（payload）：
 *   'select'  ({id, prev})           选中变化（id 为 null 表示取消选中）
 *   'search'  ({query, ids})         搜索提交/清空
 *   'hover'   ({id, sx, sy})         画布悬停目标变化
 *   'view'    ({x,y,z,s,level})      相机变化（每帧最多一次）
 *   'bake'    ({done, total})        公式烘焙进度
 *   'ready'   ()                     首屏就绪
 *   'resize'  ({w,h})                视口尺寸变化 */
const handlers = new Map()
export const bus = {
  on(type, fn) {
    if (!handlers.has(type)) handlers.set(type, new Set())
    handlers.get(type).add(fn)
    return () => handlers.get(type)?.delete(fn)
  },
  off(type, fn) { handlers.get(type)?.delete(fn) },
  emit(type, payload) {
    const hs = handlers.get(type)
    if (!hs) return
    for (const fn of [...hs]) {
      try { fn(payload) } catch (e) { console.error(`[map] bus "${type}" handler 出错`, e) }
    }
  },
}

/* ───────── 动作表 ─────────
 * 这里只放占位实现（打印警告）；main.js 启动时用 Object.assign(actions, {...}) 填入真实实现。
 * 签名见 SPEC §5.3。UI 模块只通过它改变状态。 */
const todo = (name) => () => { console.warn(`[map] actions.${name} 尚未实现`) }
export const actions = {
  /** select(id, {fly=true, push=true, instant=false}) → Promise<void>（飞行结束后 resolve） */
  select: todo('select'),
  /** deselect({push=true}) */
  deselect: todo('deselect'),
  /** suggest(q, limit=12) → Array<{id, score}>（纯查询，不改状态；下拉建议用） */
  suggest: () => [],
  /** search(q, {fly=true}) → string[] 命中 id（提交：写 state.search，取景到命中范围） */
  search: () => [],
  /** clearSearch() */
  clearSearch: todo('clearSearch'),
  /** flyTo({x,y,z} | {x,y,s}, {ms}) → Promise<void> */
  flyTo: async () => {},
  /** flyToBounds({x0,y0,x1,y1}, {pad=60, ms}) → Promise<void> */
  flyToBounds: async () => {},
  /** zoomBy(factor, {sx, sy}?) 以屏幕点为锚缩放（默认视口中心），带短动画 */
  zoomBy: todo('zoomBy'),
  /** home({ms}) 回到全图 */
  home: todo('home'),
  /** hoverLink(key | null) 面板关系列表悬停 → 画布上加粗该路线 */
  hoverLink: todo('hoverLink'),
  /** setInset({right?, bottom?, ...}) UI 打开/关闭面板时调用 */
  setInset: todo('setInset'),
  /** setRoads({showCross}) 跨族道路开关；返回实际生效的选项 */
  setRoads: () => ({ showCross: false }),
}

/** 置脏：下一帧重画。任何改变画面的操作都应调用。 */
export function invalidate() { state.dirty = true }
