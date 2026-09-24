/**
 * ═══════════════════════════════════════════════════════════════
 *  可分享的地址栏状态（深链 / permalink）
 * ═══════════════════════════════════════════════════════════════
 *
 *  ── 为什么要做这件事 ──
 *
 *  这个页面最好的用法不是"从头逛一遍"，而是**指着一条公式说**：
 *  「你看雅可比猜想这条，切到猜想星团视图、按状态上色」。
 *  在此之前这句话只能靠嘴描述 —— 因为地址栏永远是同一个 URL，
 *  464 条公式 + 4 种形态 + 4 种着色 + 11 个显示开关，
 *  对方要手动复现四五步才站到跟你一样的画面上。
 *
 *  深链把这句话变成一条 URL：点开就是你看到的那个画面。
 *
 *  ── 为什么**不**存相机姿态（四元数 / 距离）──
 *
 *  这是本模块最重要的一个取舍，值得写清楚：
 *  存了相机，URL 就**只在发送者那块屏幕上正确**。窗口宽高比一变，
 *  同样的四元数 + 距离会框出完全不同的构图（窄屏上星系会被裁掉两侧）；
 *  更糟的是本项目有详情面板 —— 面板占掉右侧 30% 时相机是偏心的，
 *  接收方若面板没开，看到的就是一个莫名偏左的星系。
 *
 *  而 "节点 id + 取景 + 形态" 是**与屏幕无关**的语义描述：
 *  任何人打开都会得到同一片知识区域、同一套配色、同一套构图逻辑
 *  （相机由 scene.js 的 fitCamera / focusOn 自己算）。宁可少存，
 *  也不能存出一个在对方机器上是坏的链接。
 *
 *  ── 为什么 decode 必须**永不抛异常** ──
 *
 *  它解析的是地址栏里的**不可信输入**：用户手改、别的程序拼接、
 *  旧版本链接、截断的链接。任何一次抛出都会发生在 main.js 启动路径上，
 *  表现为**整页白屏** —— 一个错误的分享链接不该让页面打不开。
 *  所以这里所有分支都必须有安全的兜底值，宁可"忽略这一段"，
 *  也不能让一个字符毁掉整个启动过程。
 *
 *  ── 版本号的意义 ──
 *
 *  hash 以 `v1` 开头。将来若字段含义变了，就升到 v2；
 *  v1 的解析器遇到 v2 的链接会**整条忽略**（见 decodeState），
 *  而不是按 v1 的规则去猜 v2 的字段 —— 猜错的后果是悄悄把用户
 *  送到一个错误的状态，比什么都不做更坏。同理，没有版本号的
 *  输入（`n=cn-hodge` 这种裸参数）也一律忽略：无从判断它是哪个年代的东西。
 */

export const SCHEMA_VERSION = 1

/* ───────────── 枚举 ─────────────
 *
 *  ⚠ 这三个表必须与 src/settings.js 保持一致：
 *     SHAPES  ↔ config.js 的 SHAPES
 *     VIEWS   ↔ config.js 的 VIEWS
 *     COLORINGS ↔ settings.js 的 COLOR_MODES
 *
 *  这里**故意复制一份**而不去 import：urlState 要保持纯净可测
 *  （见 scripts/verify-url-state.mjs，它在 Node 里直接 import 本文件）。
 *  config.js 会连带拖进一大坨渲染常量，而 settings.js 在模块顶层就会
 *  碰 localStorage。复制的代价是可能不同步，所以验证脚本里有一条
 *  专门断言这三个表与 config.js 的实际枚举**逐项相等**。
 */
export const VIEWS = ['overview', 'galaxy', 'cluster']
export const SHAPES = ['spiral', 'barred', 'ring', 'diffuse']
export const COLORINGS = ['family', 'status', 'field', 'mono']

/* ───────────── 短键表 ─────────────
 *
 *  URL 是要被复制粘贴的，越长越容易被聊天软件折断。
 *  所以参数用单字母代码。**只增不改**：已发布的链接靠这张表解读，
 *  改一个字母等于作废一批旧链接。 */
const PARAM_CODES = {
  r: 'spinRate',
  d: 'decorRatio',
  b: 'bloomStrength',
  t: 'bloomThreshold',
  l: 'brightness',
  g: 'glowStrength',
  z: 'glowScale',
  o: 'linkOpacity',
  h: 'hoverScale',
}
const CODE_OF_PARAM = Object.fromEntries(
  Object.entries(PARAM_CODES).map(([c, k]) => [k, c]),
)

const DISPLAY_CODES = {
  l: 'links',
  c: 'cluster',
  h: 'clusterHalo',
  m: 'markers',
  n: 'nebula',
  s: 'stars',
  d: 'disc',
  b: 'bloom',
  g: 'legend',
  o: 'bob',
  r: 'autoRotate',
  /* 按关系类型着色。用 y（tYpe）—— 单字母里 t/l/c/h/m/n/s/d/b/g/o/r
   * 都被占了，而 't' 在**参数**命名空间里是 tilt，两个命名空间虽然
   * 不冲突（URL 里是 p= 与 d= 两段），但同一个字母表示两件事
   * 迟早会看错，所以换一个没人用的。 */
  y: 'linkTypes',
}
const CODE_OF_DISPLAY = Object.fromEntries(
  Object.entries(DISPLAY_CODES).map(([c, k]) => [k, c]),
)

/* 数值精度：6 位小数。
 * 不取整会让 URL 里带上 0.30000000000000004 这种浮点噪声（长且难看），
 * 取到 6 位远超所有滑块 step（最小 0.001）的分辨率，来回转换无损失。 */
function round6(v) {
  return Number(Number(v).toFixed(6))
}

/* 数值相等判定的容差。
 *
 * 这个数不是随手取的，它**由 round6 的精度反推**：
 * 两个值只要相差不超过 1e-6，编码后就会得到同一个字符串
 * （round6 把 5e-7 以内的差抹平）。既然它们在链接里根本区分不出来，
 * 那在语义比较里也必须算相等 —— 否则会出现"两条 URL 字节不同、
 * 但我们认为相同"和"两条 URL 完全相同、我们却认为不同"这种自相矛盾。
 *
 * 上界很宽松：滑块最小 step 是 0.001，比这里的 1e-6 大三个数量级，
 * 所以这个容差**不可能**把用户真的拖过的两格判成同一格。 */
const EQ_EPS = 1e-6

/* ───────────── 编码 ───────────── */

/**
 * 把一份状态编成 hash 字符串（**不含**开头的 `#`）。
 *
 * 设计约定：调用方只传**与默认值不同**的字段。谁都知道默认值是什么吗？
 * ——不知道，所以本模块不持有默认值，默认值由调用方通过 stateToHashInput()
 * 传进来。这样 config.js 改默认值时，链接自动跟着变，不需要改这里。
 *
 * @param {{node?:string, view?:string, shape?:string, coloring?:string,
 *          params?:Object, display?:Object}} state 只含非默认字段
 * @returns {string} 例如 'v1&n=cn-hodge&w=cluster&s=barred'
 */
export function encodeState(state) {
  const s = state && typeof state === 'object' ? state : {}
  const parts = [`v${SCHEMA_VERSION}`]

  if (typeof s.node === 'string' && s.node) {
    parts.push(`n=${encodeURIComponent(s.node)}`)
  }
  if (VIEWS.includes(s.view)) parts.push(`w=${s.view}`)
  if (SHAPES.includes(s.shape)) parts.push(`s=${s.shape}`)
  if (COLORINGS.includes(s.coloring)) parts.push(`c=${s.coloring}`)

  // 数值参数：code + 值紧挨着，用 , 分隔。r0.02,l1.2
  if (s.params && typeof s.params === 'object') {
    const segs = []
    for (const [k, v] of Object.entries(s.params)) {
      const code = CODE_OF_PARAM[k]
      if (!code) continue                 // 未知参数名：不编进去，别污染链接
      const n = Number(v)
      if (!Number.isFinite(n)) continue
      segs.push(`${code}${round6(n)}`)
    }
    if (segs.length) parts.push(`p=${segs.join(',')}`)
  }

  /* 显示开关：每项两个字符，1 开 / 0 关。1l0c = 连线开、星团关。
   *
   * ⚠ 这里**绝对不能用 `+` / `-`** —— 这是我第一版踩的坑，值得留档：
   *   hash 是用 `new URLSearchParams(body)` 解析的，而表单编码规则里
   *   **`+` 代表空格**（不是加号）。所以 `d=+l-c` 解出来是 `" l-c"`，
   *   开关不但全部失效，还会把 ` l` 当成未知段塞进 unknown。
   *   实测症状：勾掉星团、打开连线，分享出去链接打开后只有星团那个开关生效。
   *   用 1/0 就完全绕开这个转义层 —— 它们在任何编码方案里都不特殊。 */
  if (s.display && typeof s.display === 'object') {
    let seg = ''
    // 按键名排序，让同样的状态总是产生同样的字符串（便于 hashEquals 之外的
    // 字符串比较，也便于人工比对两条链接是不是同一个画面）
    for (const k of Object.keys(s.display).sort()) {
      const code = CODE_OF_DISPLAY[k]
      if (!code) continue
      const v = s.display[k]
      if (typeof v !== 'boolean') continue
      seg += (v ? '1' : '0') + code
    }
    if (seg) parts.push(`d=${seg}`)
  }

  return parts.join('&')
}

/* ───────────── 解码 ───────────── */

/**
 * 解析 hash → 状态。**永不抛异常**（理由见文件头）。
 *
 * 返回的 `unknown` 收集了所有无法识别的键值。**不静默丢弃**是有意的：
 * 链接里出现了我不认识的参数，通常意味着链接来自更新的版本，
 * 把它记下来（并可在控制台打印）比悄悄吃掉更容易定位问题。
 *
 * @param {string} hash 可带或不带开头的 '#'
 */
export function decodeState(hash) {
  const out = {
    version: 0,
    node: undefined,
    view: undefined,
    shape: undefined,
    coloring: undefined,
    params: {},
    display: {},
    unknown: {},
  }

  if (typeof hash !== 'string') return out
  const body = hash.startsWith('#') ? hash.slice(1) : hash
  if (!body) return out

  let sp
  try {
    sp = new URLSearchParams(body)
  } catch {
    return out        // 理论上 URLSearchParams 不会抛，兜底不留缺口
  }

  /* 版本标记是一个**裸键**（`v1`），不是 `v=1`。
   * 这样它在 URLSearchParams 里表现为"键 v1、值为空串"，
   * 用正则从键名里把它捞出来。 */
  let version = 0
  for (const key of sp.keys()) {
    const m = /^v(\d+)$/.exec(key)
    if (m) { version = Number(m[1]); break }
  }
  out.version = version

  // 没有版本号，或者版本号不是 1 → 整条忽略，只回一个安全的空壳。
  // 前者：不知道这是哪个年代的裸参数；后者：未来的 schema，猜不得。
  if (version !== SCHEMA_VERSION) {
    for (const [k, v] of sp.entries()) {
      if (!/^v\d+$/.test(k)) out.unknown[k] = v
    }
    return out
  }

  for (const [k, v] of sp.entries()) {
    switch (k) {
      case 'n':
        // 空串视为"没指定"：`n=` 不该被当成"选中了 id 为空的节点"
        if (v) out.node = v
        break
      case 'w':
        if (VIEWS.includes(v)) out.view = v
        else out.unknown.w = v
        break
      case 's':
        if (SHAPES.includes(v)) out.shape = v
        else out.unknown.s = v
        break
      case 'c':
        if (COLORINGS.includes(v)) out.coloring = v
        else out.unknown.c = v
        break
      case 'p': {
        for (const seg of v.split(',')) {
          if (!seg) continue
          const code = seg[0]
          const key = PARAM_CODES[code]
          const num = Number(seg.slice(1))
          // 三个条件缺一不可：认得这个代码、值是有限数、不是空串。
          // Number('') === 0 是个陷阱，所以额外要求 seg.length > 1。
          if (!key || seg.length < 2 || !Number.isFinite(num)) {
            out.unknown[`p:${seg}`] = true
            continue
          }
          /* 这里**只**做有限性检查，不做区间 clamp。
           * 区间归 settings.js 的 TWEAKABLE 管（它是唯一的真相来源），
           * 在这里再抄一份 min/max 迟早会跟那边不一致 ——
           * 抄错了的后果是把一个合法值夹掉。越界值交给 setTweak 去夹。 */
          out.params[key] = num
        }
        break
      }
      case 'd': {
        for (let i = 0; i + 1 < v.length; i += 2) {
          const sign = v[i]
          const key = DISPLAY_CODES[v[i + 1]]
          if (!key || (sign !== '1' && sign !== '0')) {
            out.unknown[`d:${v.slice(i, i + 2)}`] = true
            continue
          }
          out.display[key] = sign === '1'
        }
        break
      }
      default:
        if (!/^v\d+$/.test(k)) out.unknown[k] = v
    }
  }

  return out
}

/* ───────────── 与设置对象对接 ───────────── */

/**
 * 把解码出的（有效的）字段合并到一份**设置形状**的对象上。
 *
 * 字段名映射是有意做的：URL 里叫 `coloring`（面向读者：这是"按什么上色"），
 * settings.js 里叫 `colorMode`（面向实现）。两个名字各自在自己的语境里
 * 更自然，所以在边界上翻译一次，而不是把某一边的名字硬套到另一边。
 *
 * **不修改 base**：调用方（main.js）会把它当成"默认设置"反复使用。
 *
 * @param {Object} base    形如 settings.state
 * @param {Object} decoded decodeState 的返回
 * @returns {Object} 新对象
 */
export function mergeState(base, decoded) {
  const b = base && typeof base === 'object' ? base : {}
  const d = decoded && typeof decoded === 'object' ? decoded : {}

  // 先做一层浅拷贝 + 子对象的深拷贝，保证下面怎么改都碰不到 base
  const out = {
    ...b,
    tweak: { ...(b.tweak || {}) },
    display: { ...(b.display || {}) },
  }

  if (d.shape !== undefined) out.shape = d.shape
  if (d.coloring !== undefined) out.colorMode = d.coloring
  if (d.view !== undefined) out.view = d.view

  for (const [k, v] of Object.entries(d.params || {})) out.tweak[k] = v
  for (const [k, v] of Object.entries(d.display || {})) out.display[k] = v

  return out
}

/**
 * `mergeState` 的逆操作：从一份完整设置里挑出**与默认值不同**的字段，
 * 组成 encodeState 期待的输入。
 *
 * 默认值必须由调用方给（本模块不持有默认值，理由见 encodeState）。
 *
 * @param {Object} state    完整状态
 * @param {Object} defaults 同形状的默认值
 */
export function stateToHashInput(state, defaults) {
  const s = state && typeof state === 'object' ? state : {}
  const def = defaults && typeof defaults === 'object' ? defaults : {}

  const out = { params: {}, display: {} }

  if (typeof s.node === 'string' && s.node) out.node = s.node
  if (s.view !== undefined && s.view !== def.view) out.view = s.view
  if (s.shape !== undefined && s.shape !== def.shape) out.shape = s.shape
  // colorMode / coloring 两个名字都接受：调用方可能直接递 settings.state
  const col = s.colorMode !== undefined ? s.colorMode : s.coloring
  const colDef = def.colorMode !== undefined ? def.colorMode : def.coloring
  if (col !== undefined && col !== colDef) out.coloring = col

  for (const [k, v] of Object.entries(s.tweak || {})) {
    const dv = (def.tweak || {})[k]
    // 用容差比较：浮点滑块值经过 URL 往返（6 位小数）后，
    // 严格 !== 会把一个"其实等于默认"的值误判成改动，于是链接里
    // 多出一堆没意义的参数。
    if (dv === undefined || Math.abs(Number(v) - Number(dv)) > EQ_EPS) {
      out.params[k] = v
    }
  }
  for (const [k, v] of Object.entries(s.display || {})) {
    const dv = (def.display || {})[k]
    if (dv === undefined || !!v !== !!dv) out.display[k] = !!v
  }

  if (!Object.keys(out.params).length) delete out.params
  if (!Object.keys(out.display).length) delete out.display
  return out
}

/**
 * 两条 hash 是否表达同一个状态。
 *
 * 比较的是**解码后的语义**，不是字符串 —— 所以参数顺序不同、
 * 或者一条带了默认值的冗余参数，都会被判为相等。
 * main.js 用它来避免"每次相机动一下就 push 一条历史"。
 */
export function hashEquals(a, b) {
  const A = decodeState(a)
  const B = decodeState(b)
  if (A.version !== B.version) return false
  if ((A.node || '') !== (B.node || '')) return false
  if (A.view !== B.view) return false
  if (A.shape !== B.shape) return false
  if (A.coloring !== B.coloring) return false

  const keysEq = (x, y) => {
    const kx = Object.keys(x).sort()
    const ky = Object.keys(y).sort()
    if (kx.length !== ky.length) return false
    for (let i = 0; i < kx.length; i++) {
      if (kx[i] !== ky[i]) return false
      // 数值用容差比，理由同 stateToHashInput
      if (Math.abs(Number(x[kx[i]]) - Number(y[ky[i]])) > EQ_EPS) return false
    }
    return true
  }
  if (!keysEq(A.params, B.params)) return false
  if (!keysEq(A.display, B.display)) return false

  return true
}
