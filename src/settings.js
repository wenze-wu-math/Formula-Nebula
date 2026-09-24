/**
 * ═══════════════════════════════════════════════════════════════
 *  运行时设置 + localStorage 持久化
 * ═══════════════════════════════════════════════════════════════
 *
 *  设计参考 Cohenjikan/shiyun 的 zustand store + SettingsMenu：
 *  分组式的设置面板、每项有默认值、能一键恢复默认、选择被记住。
 *  这里不引入 zustand（本项目是纯 three.js，没有 React），
 *  用一个极小的发布订阅 store 实现同样的东西。
 *
 *  ── 两类设置，分清很重要 ──
 *
 *  ① 形态级（shape）：改了要**重新布局**（半径/角度全部重算）→ 代价大
 *  ② 运行时（tweak/display/gravity）：改了**立刻生效**，不用重排
 *
 *  所以面板上分两组呈现，形态切换会走一次"重排"路径并给出提示。
 *
 *  ── 持久化 ──
 *  localStorage 里的键是 SETTINGS_KEY。**只存用户改过的值**（diff），
 *  这样以后我改了 config.js 的默认值，老用户不会被困在旧默认上。
 *  读取时每一项都要过一遍 clamp + 校验，避免手改 localStorage
 *  把一个非法值（NaN / 字符串 / 越界）灌进渲染循环 —— 那会让整个场景白屏。
 */

import { SHAPES, SHAPE_IDS, TWEAKABLE, GRAVITY, LAYOUT, MOTION, LINKS, BLOOM, NEBULA, INTERACTION, GLYPH, UI, CLUSTER, VIEWS } from './config.js'

const SETTINGS_KEY = 'formula-nebula.settings.v1'

/** 默认着色模式（config.js 里的初值），恢复默认时用 */
const GLYPH_COLOR_MODE_DEFAULT = GLYPH.colorMode

/* ───────────── 旧存档迁移 ─────────────
 *
 *  ⚠ 为什么必须有这个：save() 存的是**整个 tweak 对象**（不是 diff，
 *  上面的注释写得不准），所以只要用户打开过一次页面，localStorage 里
 *  就躺着当时的所有参数值。之后我改了 config.js 的默认值，
 *  **老用户永远看不到新默认** —— 存档会把它们盖回去。
 *
 *  「光晕 → 光点」这次改动就正好踩在这上面：默认从
 *  scale 2.6 / strength 0.55 改成 0.85 / 0.55，但老存档里是 2.6，
 *  而且 2.6 仍然落在我把上限放宽后的 [0.3, 3.0] 区间里，
 *  clamp 根本不会拦它 —— 用户会以为改动没生效。
 *
 *  迁移策略：**只有当存档值恰好等于"旧默认值"时才替换**。
 *  等于旧默认 = 用户从没动过这个滑块，那就该跟着新默认走；
 *  如果存档值是别的数（比如 1.8），那是用户自己拖的，必须尊重。
 */
const MIGRATIONS = [
  // 光晕尺寸语义变了（大光晕 → 小光点），旧默认 2.6 不再代表"默认"
  { key: 'glowScale', from: 2.6, to: TWEAKABLE.glowScale.def },
]

/* ───────────── 着色模式 ─────────────
 *
 *  'family' 按 8 个知识族分别着色（默认）
 *  'mono'   全部统一橙黄（本项目最初的方案）
 *  'status' 猜想星团按**解决状态**着色（未解决/部分解决/已证明/已推翻）
 *  'field'  猜想星团按**领域**着色（6 个领域，球面上各占一个方向）
 *
 * ── 为什么把星团的两个模式也放进来，而不是分两套菜单 ──
 *
 * 主星系与星团是同一个画面的两部分，用一个下拉框切换更符合"看整体"的
 * 直觉：用户想要的是"这张图按什么维度上色"，而不是"我先选对象再选维度"。
 * 代价是四个模式里有两个只对星团生效（主星系在那两个模式下会退回族色），
 * 这一条在设置面板里用 hint 明确说明，不让人猜。
 *
 * ── 为什么 'status' 是星团默认 ──
 *
 * 读一条猜想时第一个要问的就是"这条还悬着吗"。色点已经表达了这件事，
 * 但底色也跟着一起按状态上色时，整片星团的"认识论地图"会一眼显形：
 * 哪些区域已经稳固（绿）、哪些还完全开放（橙）。这比按领域上色信息量更大，
 * 所以是默认；按领域上色则用来读"星座"结构（见 CONJECTURE_FIELDS）。 */
export const COLOR_MODES = {
  family: { label: '按知识族', hint: '8 个族各一种颜色，冷暖分区一眼可辨' },
  status: { label: '按猜想状态', hint: '星团按未解决/部分/已证/已推翻上色（主星系仍按族）' },
  field:  { label: '按猜想领域', hint: '星团按 6 个数学领域上色，显出球面上的星座（主星系仍按族）' },
  mono:   { label: '统一橙黄', hint: '所有公式同一色相，只靠明暗区分重要度' },
}
export const COLOR_MODE_IDS = Object.keys(COLOR_MODES)

/* ───────────── 显示层开关 ───────────── */
export const DISPLAY = {
  links: { def: LINKS.enabled, label: '关联连线', hint: '公式之间的知识关联弧线' },
  /* 按关系类型着色：把"蕴含/等价/推广…"用不同色相画出来。
   * 提示里**必须**写明只对 16.7% 的边生效 —— 否则用户会以为
   * 蓝色的线也是一种类型（详见 linkTypes.js）。 */
  linkTypes: {
    def: LINKS.colorByType,
    label: '按关系类型着色',
    hint: '已判定关系的边换用类型色（实测 16.7%，其余仍是权重蓝）',
  },
  cluster: { def: CLUSTER.enabled, label: '猜想星团', hint: '未定论的知识球（关掉只看主星系）' },
  clusterHalo: { def: CLUSTER.haloEnabled, label: '星团柔光', hint: '星团的整体光晕' },
  markers: { def: CLUSTER.markerEnabled, label: '状态色点', hint: '每条猜想左侧的解决状态标记' },
  nebula: { def: NEBULA.enabled, label: '背景星云', hint: '旋臂粒子云（关闭可提升帧率）' },
  stars: { def: true, label: '深空星点', hint: '远景星点' },
  disc: { def: true, label: '盘面辉光', hint: '盘面中央的柔光' },
  bloom: { def: BLOOM.enabled, label: '后处理辉光', hint: '核心公式的光晕（关闭可提升帧率）' },
  legend: { def: UI.showLegend, label: '图例', hint: '右下角重要度图例' },
  bob: { def: true, label: '公式浮动', hint: '每个公式的轻微漂浮' },
  autoRotate: { def: false, label: '相机环绕', hint: '相机自己绕着星系转（与自转独立）' },
}

/* ───────────── 出厂默认值（快照）─────────────
 *
 *  ⚠ 为什么必须**在这里**抓一份快照，而不是用到的时候现读 config：
 *
 *  applyToConfig() 会把 state 里的值**写回** config（LAYOUT.shape、
 *  GLYPH.colorMode …）。所以一旦用户改过设置，config 里躺的就是
 *  "当前值"而不是"默认值"了 —— 那时再去读 GLYPH.colorMode 当默认值，
 *  等于把用户当前的着色当成默认，于是这个字段**永远不会出现在 URL 里**。
 *
 *  这个 bug 我在深链上真实踩到过：以 `#v1&n=cn-jacobian&w=cluster&c=status`
 *  冷启动后，地址栏被规范化成 `#v1&w=cluster` —— `c=status` 被吃掉了，
 *  因为 applyState 之后 GLYPH.colorMode 已经变成 'status'，
 *  buildHash 就认为"这和默认一样，不用写"。分享出去的链接因此丢掉着色。
 *
 *  这份快照在 load() 之前求值，所以是**真正的出厂默认**，
 *  且永远不会被后续写入污染（下面都是值拷贝，不是引用）。
 *  urlState.stateToHashInput 需要它来判断"哪些字段偏离了默认"。
 */
export const DEFAULTS = {
  shape: LAYOUT.shape,
  colorMode: GLYPH_COLOR_MODE_DEFAULT,
  view: 'overview',
  tweak: Object.fromEntries(
    Object.entries(TWEAKABLE).map(([k, spec]) => [k, spec.def])),
  display: Object.fromEntries(
    Object.entries(DISPLAY).map(([k, spec]) => [k, spec.def])),
}

/* ───────────── 内部状态 ───────────── */
const state = {
  shape: LAYOUT.shape,
  colorMode: GLYPH.colorMode,
  view: 'overview',
  tweak: {},
  display: {},
  gravity: GRAVITY.enabled,
  gravityFollow: GRAVITY.followRate,
}

for (const [k, spec] of Object.entries(TWEAKABLE)) state.tweak[k] = spec.def
for (const [k, spec] of Object.entries(DISPLAY)) state.display[k] = spec.def

const listeners = new Set()
/** 需要"重新布局"的监听器与"立刻生效"的监听器分开，避免切形态时白跑一遍 */
const rebuildListeners = new Set()
/** 只需要"重新着色"的（切换着色模式）—— 比 rebuild 轻得多 */
const recolorListeners = new Set()
/** 只需要"重新取景"的（切换视图）—— 不重排、不重着色 */
const viewListeners = new Set()

function clampNum(v, spec) {
  const n = Number(v)
  if (!Number.isFinite(n)) return spec.def
  return Math.min(spec.max, Math.max(spec.min, n))
}

/* ───────────── 持久化 ───────────── */
function load() {
  let raw
  try {
    raw = localStorage.getItem(SETTINGS_KEY)
  } catch {
    return   // 隐私模式 / 禁用 storage：当作没有存档，不能因此启动失败
  }
  if (!raw) return

  let saved
  try {
    saved = JSON.parse(raw)
  } catch {
    return
  }
  if (!saved || typeof saved !== 'object') return

  // 形态：必须是已知 id
  if (typeof saved.shape === 'string' && SHAPES[saved.shape]) state.shape = saved.shape

  // 着色模式
  if (typeof saved.colorMode === 'string' && COLOR_MODES[saved.colorMode]) {
    state.colorMode = saved.colorMode
  }

  // 取景
  if (typeof saved.view === 'string' && VIEWS[saved.view]) state.view = saved.view

  // 运行时数值：逐项 clamp
  if (saved.tweak && typeof saved.tweak === 'object') {
    for (const [k, spec] of Object.entries(TWEAKABLE)) {
      if (k in saved.tweak) state.tweak[k] = clampNum(saved.tweak[k], spec)
    }
    // 迁移：拿**原始存档值**比对（不是 clamp 之后的），
    // 这样即使有一天新区间不再包含旧默认值（被 clamp 掉），也能正确识别。
    for (const m of MIGRATIONS) {
      const raw = Number(saved.tweak[m.key])
      if (Number.isFinite(raw) && Math.abs(raw - m.from) < 1e-9) {
        state.tweak[m.key] = m.to
      }
    }
  }

  // 开关：强制成布尔
  if (saved.display && typeof saved.display === 'object') {
    for (const k of Object.keys(DISPLAY)) {
      if (k in saved.display) state.display[k] = !!saved.display[k]
    }
  }

  if (typeof saved.gravity === 'boolean') state.gravity = saved.gravity
  if (Number.isFinite(Number(saved.gravityFollow))) {
    state.gravityFollow = Math.min(2, Math.max(0, Number(saved.gravityFollow)))
  }
}

function save() {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({
      shape: state.shape,
      colorMode: state.colorMode,
      view: state.view,
      tweak: state.tweak,
      display: state.display,
      gravity: state.gravity,
      gravityFollow: state.gravityFollow,
    }))
  } catch {
    /* storage 满 / 被禁用：忽略，不影响运行 */
  }
}

function emit(rebuild = false) {
  save()
  for (const fn of listeners) fn(state)
  if (rebuild) for (const fn of rebuildListeners) fn(state)
}

/* ───────────── 把设置写进 config（渲染代码照旧读 config） ─────────────
 *  这是关键设计：渲染代码不需要知道"设置"的存在，
 *  它继续读 MOTION.spinRate / BLOOM.strength 这些老路径。
 *  设置面板只是把这些值**改掉** —— 改动立刻被下一帧读到。
 */
export function applyToConfig() {
  MOTION.spinRate = state.tweak.spinRate
  MOTION.decorSpinRate = state.tweak.spinRate * state.tweak.decorRatio
  // ⚠ MOTION.enabled 必须恒为 true：它门控的是整个 updateMotion()，
  //   而 billboard（公式始终正对相机）就在里面。关掉它公式会侧过去变成一条线。
  //   "浮动"开关走单独的 bobEnabled，只影响位移那一小段。
  MOTION.enabled = true
  MOTION.bobEnabled = state.display.bob

  BLOOM.strength = state.tweak.bloomStrength
  BLOOM.threshold = state.tweak.bloomThreshold
  LINKS.opacity = state.tweak.linkOpacity
  INTERACTION.hoverScale = state.tweak.hoverScale

  // 发光：两个值都是每帧现读（scene.js 的 updateAppearance），
  // 所以拖滑块立刻见效，不需要重排或重建精灵。
  GLYPH.glow.strength = state.tweak.glowStrength
  GLYPH.glow.scale = state.tweak.glowScale

  // 着色模式。⚠ 改它必须**重新着色**（比重建轻得多）：
  //   颜色是在 buildGraph 里算进 n.baseColor 的，改完要让所有材质重取一次色。
  //   这条注释早先写的是"必须重建节点"，那是错的 —— 重建会 dispose 掉
  //   464 个 geometry 再新建 464 个，只为换个颜色，代价完全不同量级。
  GLYPH.colorMode = state.colorMode

  // 星团显示层。display.cluster 是**总开关**，关掉整组隐藏；
  // halo / markers 是两个子项，只作用在星团内部。
  CLUSTER.enabled = state.display.cluster
  CLUSTER.haloEnabled = state.display.clusterHalo
  CLUSTER.markerEnabled = state.display.markers

  GRAVITY.enabled = state.gravity
  GRAVITY.followRate = state.gravityFollow

  // 形态：把选中形态的参数**覆盖进 LAYOUT**，
  // 因为 graph.js / nebula.js 读的是 LAYOUT.twist 这些路径。
  const s = SHAPES[state.shape]
  if (s) {
    LAYOUT.shape = state.shape
    LAYOUT.twist = s.twist
    LAYOUT.armSpread = s.armSpread
    LAYOUT.armTight = s.armTight
    LAYOUT.coreBlur = s.coreBlur
  }
}

/* ───────────── 对外 API ───────────── */
export const settings = {
  get state() { return state },
  get shape() { return state.shape },

  /** 当前形态的定义对象 */
  get shapeDef() { return SHAPES[state.shape] },

  /** 订阅（任何改动都触发）。返回取消订阅函数。 */
  subscribe(fn) {
    listeners.add(fn)
    return () => listeners.delete(fn)
  },

  /** 只订阅"需要重新布局"的改动（切换形态） */
  onRebuild(fn) {
    rebuildListeners.add(fn)
    return () => rebuildListeners.delete(fn)
  },

  setShape(id) {
    if (!SHAPES[id] || id === state.shape) return false
    state.shape = id
    applyToConfig()
    emit(true)
    return true
  },

  setTweak(key, value) {
    const spec = TWEAKABLE[key]
    if (!spec) return
    const v = clampNum(value, spec)
    if (state.tweak[key] === v) return
    state.tweak[key] = v
    applyToConfig()
    emit(false)
  },

  /**
   * 切换着色模式。
   *
   * ⚠ 它需要**重新着色**（不是重新布局）：颜色是在 buildGraph 里算进
   *   n.baseColor 的，改完必须让所有材质重新取一次色。
   *   走 recolor 监听器而不是 rebuild 监听器 —— 后者会连半径/角度一起重算，
   *   明明只是换个颜色，没必要让整个星系动一下。
   */
  setColorMode(id) {
    if (!COLOR_MODES[id] || id === state.colorMode) return false
    state.colorMode = id
    applyToConfig()
    emit(false)
    for (const fn of recolorListeners) fn(state)
    return true
  },

  /** 只订阅"需要重新着色"的改动（切换着色模式） */
  onRecolor(fn) {
    recolorListeners.add(fn)
    return () => recolorListeners.delete(fn)
  },

  /**
   * 切换取景（全景 / 主星系 / 星团）。
   *
   * 注意它**不重新布局**：三个视图共用同一套世界坐标，切换只是隐藏
   * 另一侧 + 重新取景（见 scene.js 的 setView）。所以走的是一般监听器，
   * 不是 rebuild 监听器 —— 切个视图不该让 464 个公式重新排一遍。
   */
  setView(id) {
    if (!VIEWS[id] || id === state.view) return false
    state.view = id
    emit(false)
    for (const fn of viewListeners) fn(state)
    return true
  },

  get view() { return state.view },
  get viewDef() { return VIEWS[state.view] },

  /** 只订阅取景切换 */
  onView(fn) {
    viewListeners.add(fn)
    return () => viewListeners.delete(fn)
  },

  toggleDisplay(key) {
    if (!(key in DISPLAY)) return
    state.display[key] = !state.display[key]
    applyToConfig()
    emit(false)
  },

  setGravity(on) {
    state.gravity = !!on
    applyToConfig()
    emit(false)
  },

  setGravityFollow(v) {
    const n = Number(v)
    if (!Number.isFinite(n)) return
    state.gravityFollow = Math.min(2, Math.max(0, n))
    applyToConfig()
    emit(false)
  },

  /** 是否处于默认状态（用于"恢复默认"按钮的禁用态） */
  get isDefault() {
    if (state.shape !== 'spiral') return false
    if (state.colorMode !== GLYPH_COLOR_MODE_DEFAULT) return false
    if (state.view !== 'overview') return false
    if (state.gravity !== false || state.gravityFollow !== 1.0) return false
    for (const [k, spec] of Object.entries(TWEAKABLE)) {
      if (Math.abs(state.tweak[k] - spec.def) > 1e-9) return false
    }
    for (const [k, spec] of Object.entries(DISPLAY)) {
      if (state.display[k] !== spec.def) return false
    }
    return true
  },

  resetAll() {
    state.shape = 'spiral'
    state.colorMode = GLYPH_COLOR_MODE_DEFAULT
    state.view = 'overview'
    for (const [k, spec] of Object.entries(TWEAKABLE)) state.tweak[k] = spec.def
    for (const [k, spec] of Object.entries(DISPLAY)) state.display[k] = spec.def
    state.gravity = false
    state.gravityFollow = 1.0
    applyToConfig()
    emit(true)
    for (const fn of recolorListeners) fn(state)
    for (const fn of viewListeners) fn(state)
  },

  /** 清除存档并回到默认（供调试/验证脚本使用） */
  clearStorage() {
    try { localStorage.removeItem(SETTINGS_KEY) } catch { /* ignore */ }
  },

  /**
   * 一次性套用一份完整的设置状态（URL 深链恢复时用）。
   *
   * ⚠ 为什么不复用 setShape / setColorMode / setView / setTweak 逐个调：
   *   它们每一个都会各自 emit 一次，而 setShape 那条还会**触发重新布局**
   *   —— 从深链恢复时，布局本来就要在建节点前按最终形态做一次，
   *   若在这里先按存档形态排一遍、再按 URL 形态排一遍，
   *   用户会看到星系先跳一下（而且白花一次几百毫秒的排版）。
   *   逐个调还会让 onRecolor / onView 各自跑一次重着色与重新取景，
   *   同理都是浪费。
   *
   * 所以这个函数只做三件事：写进 state、applyToConfig、然后通知
   * **"哪些方面变了"对应的监听器**。调用方（main.js）在启动的最早期
   * 调用它，那时场景还没建好，监听器基本是空的，天然无害。
   *
   * @param {Object} next 形如 settings.state 的对象（来自 urlState.mergeState）
   * @returns {{shape:boolean, colorMode:boolean, view:boolean}} 各项是否变化
   */
  applyState(next) {
    if (!next || typeof next !== 'object') return { shape: false, colorMode: false, view: false }

    const changed = { shape: false, colorMode: false, view: false }

    if (typeof next.shape === 'string' && SHAPES[next.shape] && next.shape !== state.shape) {
      state.shape = next.shape
      changed.shape = true
    }
    if (typeof next.colorMode === 'string' && COLOR_MODES[next.colorMode]
      && next.colorMode !== state.colorMode) {
      state.colorMode = next.colorMode
      changed.colorMode = true
    }
    if (typeof next.view === 'string' && VIEWS[next.view] && next.view !== state.view) {
      state.view = next.view
      changed.view = true
    }

    // 数值参数逐项 clamp —— 与 load() 同一个理由：
    // URL 和 localStorage 一样是**外部输入**，一个越界值灌进渲染循环会白屏。
    if (next.tweak && typeof next.tweak === 'object') {
      for (const [k, spec] of Object.entries(TWEAKABLE)) {
        if (k in next.tweak) state.tweak[k] = clampNum(next.tweak[k], spec)
      }
    }
    if (next.display && typeof next.display === 'object') {
      for (const k of Object.keys(DISPLAY)) {
        if (k in next.display) state.display[k] = !!next.display[k]
      }
    }
    if (typeof next.gravity === 'boolean') state.gravity = next.gravity

    applyToConfig()
    // 只通知一般监听器（让面板刷新、场景应用参数）。
    // rebuild/recolor/view 三条**故意不发** —— 调用时机在建场景之前，
    // 那时该做的事情由 main.js 的启动流程自己按最终状态做一遍。
    for (const fn of listeners) fn(state)
    return changed
  },
}

load()
applyToConfig()

export { SHAPES, SHAPE_IDS, TWEAKABLE }