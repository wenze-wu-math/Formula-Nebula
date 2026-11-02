/**
 * designs/atlas/state.js — 全局共享状态 + 事件总线 + 动作表（冻结文件，架构师维护）。
 *
 * 取舍：六个模块并行开发，彼此只通过这里交流：
 *   · state   —— 唯一的可变状态对象。**只有 main.js 写**（例外：见各字段注释），
 *                其它模块只读。这样任何"状态怎么变了"的问题只需查 main.js。
 *   · on/emit —— 状态变化后由 main.js 广播；UI 模块订阅后自己更新 DOM。
 *   · actions —— UI 模块想改状态时调用的函数表。默认是空实现（模块单独测试时不崩），
 *                main.js 启动时用 Object.assign(actions, {...}) 填入真实实现。
 * 不用任何框架：488 个节点、十来个事件，一个 Map 足够。
 */

export const state = {
  /** getGraph() 的结果（只读） */
  graph: null,
  /** layout.js buildAtlas() 的结果（只读，结构见 SPEC §3.6） */
  atlas: null,

  /** 主画布与 2D 上下文；w/h 是 css px，dpr = devicePixelRatio（上限 2） */
  canvas: null, ctx: null, w: 0, h: 0, dpr: 1,

  /** 相机：世界点 (cx, cy) 在画布中心，zoom = css px / 世界单位 */
  view: { cx: 0, cy: 0, zoom: 1 },
  /** 全图适配缩放（按整个视口算，不扣面板）；L = log2(view.zoom / zoom0) */
  zoom0: 1,
  L: 0,

  /** 悬停目标：{ kind:'body', id, source:'map'|'ui' } | { kind:'constellation', family } | null
   *  source='ui' 表示由面板 / 搜索列表的悬停预览触发（tooltip 不显示，地图上照样画悬停圈） */
  hover: null,
  /** 选中的节点 id | null */
  selected: null,
  /** 选中后的关联信息（computeFocus 的结果）| null */
  focus: null,
  /** 当前搜索命中（按相关度排序的 id 数组）；空数组 = 无搜索 */
  searchHits: [],
  searchQuery: '',

  /** 屏幕遮挡区：name → {x,y,w,h}（css px）。UI 模块通过 actions.setOccluder 登记，
   *  标签避让会绕开这些矩形，相机居中会扣掉右侧面板。 */
  occluders: new Map(),

  /** 本帧时间戳（performance.now()），main 每帧写 */
  now: 0,
  /** 需要重画（任何模块可置 true，例外允许写的字段） */
  dirty: true,
  /** 首屏完成 */
  ready: false,
  /** 用户偏好减少动态效果：飞行改为瞬移、淡入淡出缩短为 0 */
  reducedMotion: typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches,
}

/* ───────── 事件总线 ─────────
 * 事件名与负载（全部由 main.js 发出）：
 *   'ready'   ()                                   首屏画完
 *   'select'  (id | null)                          选中 / 取消选中之后（state.selected/focus 已更新）
 *   'hover'   ({ target, sx, sy } | null)          地图上的悬停变化；target 同 state.hover；sx/sy 为指针 css px
 *   'view'    (view)                               相机变化（节流到每帧最多一次）
 *   'search'  ({ query, hits })                    搜索结果变化（state.searchHits 已更新）
 *   'resize'  ({ w, h })                           画布尺寸变化
 */
const handlers = new Map()

export function on(name, fn) {
  if (!handlers.has(name)) handlers.set(name, new Set())
  handlers.get(name).add(fn)
  return () => handlers.get(name).delete(fn)
}

export function emit(name, payload) {
  const set = handlers.get(name)
  if (!set) return
  for (const fn of [...set]) {
    try { fn(payload) } catch (e) { console.error(`[atlas] '${name}' 处理器出错`, e) }
  }
}

/* ───────── 动作表（main.js 填充真实实现） ─────────
 * 签名见 SPEC §8.2。默认实现只打警告，保证 UI 模块可以在 main 未完成时单独加载。 */
const warn = (name) => (...a) => { console.warn(`[atlas] actions.${name} 尚未接线`, a); return undefined }
export const actions = {
  /** 选中并（默认）飞行定位：select(id, { fly = true, push = true }) → Promise<void> */
  select: warn('select'),
  /** 取消选中 */
  deselect: warn('deselect'),
  /** 来自 UI 列表的悬停预览：hoverPreview(id | null) */
  hoverPreview: warn('hoverPreview'),
  /** 执行搜索并广播 'search'：search(query) → id[] */
  search: (q) => { warn('search')(q); return [] },
  /** 飞到目标：flyTo({ cx, cy, L } | { id } | { family }, { ms }) → Promise<void> */
  flyTo: async (t) => { warn('flyTo')(t) },
  /** 以屏幕点（缺省 = 可视区中心）为锚缩放：zoomBy(factor, sx?, sy?) */
  zoomBy: warn('zoomBy'),
  /** 回到全图适配 */
  resetView: warn('resetView'),
  /** 登记 / 清除屏幕遮挡区：setOccluder(name, rect | null) */
  setOccluder: (name, rect) => {
    if (rect) state.occluders.set(name, rect)
    else state.occluders.delete(name)
    state.dirty = true
  },
  /** 请求重画一帧 */
  requestDraw: () => { state.dirty = true },
}

/* ───────── 选中关联（纯函数，main 在 select 时调用） ─────────
 * 返回 FocusInfo：
 *   { id, t0, ids:Set<string>, edges:[{ other, weight, kind, type, label }] }
 *   kind：'theorem'（两端都是定理）| 'conj'（任一端是猜想）| 'researcher'（任一端是研究者）
 *   edges 按 weight 降序；ids 含 id 自己 + 全部一跳邻居。 */
export function computeFocus(atlas, id, t0 = 0) {
  const self = atlas.bodies.get(id)
  if (!self) return null
  const ids = new Set([id])
  const edges = []
  for (const nb of atlas.neighbours.get(id) || []) {
    const other = atlas.bodies.get(nb.id)
    if (!other) continue
    ids.add(nb.id)
    const kind = (self.kind === 'researcher' || other.kind === 'researcher') ? 'researcher'
      : (self.kind === 'dso' || other.kind === 'dso') ? 'conj' : 'theorem'
    edges.push({ other: nb.id, weight: nb.weight, kind, type: nb.type, label: nb.label })
  }
  edges.sort((a, b) => b.weight - a.weight || (a.other < b.other ? -1 : 1))
  return { id, t0, ids, edges }
}

/** 选中时某个 body 是否应被压暗（无选中时恒 false） */
export const isDimmed = (id) => !!state.focus && !state.focus.ids.has(id)
