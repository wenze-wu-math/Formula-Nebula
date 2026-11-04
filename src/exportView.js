/**
 * ═══════════════════════════════════════════════════════════════
 *  静态导出：把星系画成一张**俯视平面图**（SVG 字符串）
 * ═══════════════════════════════════════════════════════════════
 *
 *  ── 为什么导出的投影必须换一套 ──
 *
 *  三维视图是**阅读辅助**：它靠交互（拖拽旋转、滚轮缩放、点选聚焦）
 *  把结构一层层交出来，人是在"时间"里读图的。而静态导出（插图、截图、
 *  贴进文档）没有交互，只剩**一帧** —— 那一帧必须自己把结构讲清楚。
 *
 *  40° 斜视在交互时是优点（有立体感、旋臂看得出缠绕），做成静止的图就
 *  变成缺点：盘被压扁 sin(40°)≈0.64，不同半径的公式在纵向叠成一团，
 *  而读者**没有"转一下"这个动作**可以把它们分开。俯视平面图没有这个问题：
 *  (x, z) 直接就是纸面坐标，半径、方位角、密度梯度都是真的，
 *  「越中心越重要」一眼可读。
 *
 *  所以导出不是"截屏"，是有意换一个更能承载信息的投影。这是诚实的选择：
 *  它不假装还有第三维可看，而是把薄盘厚度 y **明确地丢掉** ——
 *  y 的比例只有 0.105（见 config.js 的 LAYOUT.thickness），
 *  丢掉它损失的信息远少于斜视造成的相互遮挡。
 *
 *  ── 投影约定：(x, z) → (svgX, svgY) = (x, −z) ──
 *
 *  两种取法互为镜像，都不是"错的"，但只有一个能和布局本身对得上：
 *
 *    · 布局用 θ = atan2(pos.z, pos.x) 定义盘面方位角（见 graph.js），
 *      半径 r 与 θ 是极坐标里的一对正交量。
 *    · 取 svgY = −z（纸上"上"= +z）时，图中方位角**逆时针**增大，
 *      与数学约定一致 —— 导出图可以直接和布局公式对照着读：
 *      某条臂在代码里是 +twist 缠绕，在图上就是逆时针向外缠。
 *    · 取 svgY = +z 则整张图水平镜像，同一条臂会**看起来朝反方向缠**
 *      （左旋看成右旋）。对"结构就是信息"的这张图来说，那不是风格差异，
 *      是事实性错误。
 *
 *  需要和三维场景里 +Y 俯视相机的取景完全一致时，传 `flipZ: true`
 *  （屏幕向下 = +z）。默认取数学约定。
 *
 *  ── 为什么必须先做 linear → sRGB ──
 *
 *  节点的 baseColor 是**线性光**三元组（palette.js 的 hexToLinear 产物，
 *  GPU 混合用的就是它）。线性值直接当成 sRGB 写进 SVG，颜色会**发灰发暗**：
 *  例如线性 0.5 的显示亮度约等于 sRGB 0.735，反过来把线性值当 sRGB 用，
 *  同一支橙色会掉到一半亮度的暗褐。所以这里做标准传递函数的**逆变换**
 *  （见 linearToSrgb），这是"颜色对不对"的关键一步，不是可选的美化。
 *
 *  ── 为什么有 minLabelRank ──
 *
 *  464 个公式全部标名字不是信息，是噪声：字号被压到 3~4px 之后，
 *  每一条都读不出来，却把盘面糊成一层灰，连"哪里密、哪里空"都看不出了。
 *  标签的价值在于**指认**，而指认只有在稀疏处才成立。
 *  minLabelRank 让调用方按重要度截断：只标 rank ≥ 阈值的公式，
 *  其余的点依然画出来（密度与分布照旧可读），只是不配名字。
 *  于是"整体形状"与"具体是谁"这两件事可以分开导出两张图。
 *
 *  ── 本模块的边界 ──
 *
 *  · **不 import three.js**，只在 import 时不碰 DOM —— 所以能在 Node 里直接
 *    跑断言（scripts/verify-export.mjs）。
 *  · 输入是纯数据（graph.nodes / graph.links），输出是纯字符串。
 *  · 唯一碰 DOM 的是 downloadSVG()，而且是**调用时**才碰，
 *    在 Node 里调用它会抛一个明确的中文错误（静默 no-op 最难查）。
 *  · 不做 exportPNG：光栅化需要 canvas，那是浏览器的事，
 *    把它塞进这层会让整模块失去可测性。
 *  · 空节点列表**不抛错**，返回一张只有背景（和一行提示）的合法 SVG ——
 *    理由见 exportSVG 内注释。
 */

/* ───────────────────────── 颜色 ───────────────────────── */

/**
 * 线性光 → sRGB 传递函数（**逆变换**）。这就是 GPU 在做的编码，
 * 取 1/2.4 次幂的那一支，低段用 12.92 的线性段接上（两段在
 * 0.0031308 处连续，这是 sRGB 规范的定义值，不是拟合出来的）。
 *
 * ⚠ 这里**不做上下钳制**：它就是那条数学函数。超出 [0,1] 的输入
 *   （理论上不会有，但数据坏了的时候会）由 srgbHex 负责钳制，
 *   这样"函数本身"和"显示用的颜色"两件事不会混在一起
 *   —— 断言里 linearToSrgb(0)===0、linearToSrgb(1)===1 才对得上。
 *
 * @param {number} c 线性分量，通常 0~1
 * @returns {number} sRGB 分量
 */
export function linearToSrgb(c) {
  const x = typeof c === 'number' && isFinite(c) ? c : 0
  return x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055
}

/** 取三元组的一个分量。数组与 {r,g,b} 都认，坏值一律当 0（不许 NaN 漏到 SVG 里）。 */
function channel(triple, key, index) {
  if (!triple) return 0
  const v = Array.isArray(triple) ? triple[index] : triple[key]
  return typeof v === 'number' && isFinite(v) ? v : 0
}

/**
 * 线性光三元组 → `#rrggbb`。
 *
 * 接受 `{ r, g, b }`（graph.js 的 baseColor 形状）或 `[r, g, b]`
 * （graph.js 的 conjStatusColors 就是这个形状），也接受已经是
 * `'#rrggbb'` / `'#rgb'` 的字符串（原样规范化返回）—— 后者是防御性的：
 * 哪天数据层改成直接存十六进制，这里不至于悄悄画出一堆黑点。
 *
 * 钳制在这里：先钳 [0,1]，再乘 255 四舍五入。全零颜色会如实渲染成
 * `#000000` —— 数据说它是黑的，就画成黑的，不偷偷替换成别的颜色
 * （那会让"颜色错了"这类数据问题永远查不出来）。
 */
export function srgbHex(triple) {
  if (typeof triple === 'string') {
    const s = triple.trim()
    const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(s)
    if (m) {
      const h = m[1].length === 3
        ? m[1].split('').map((c) => c + c).join('')
        : m[1]
      return '#' + h.toLowerCase()
    }
    return '#000000'
  }
  const hex2 = (v) => {
    const s = Math.max(0, Math.min(1, linearToSrgb(v)))
    return Math.round(s * 255).toString(16).padStart(2, '0')
  }
  return '#' + hex2(channel(triple, 'r', 0)) +
    hex2(channel(triple, 'g', 1)) +
    hex2(channel(triple, 'b', 2))
}

/** cssColor 是 srgbHex 的别名，语义上更贴调用点（"这里要一个 CSS 颜色"）。 */
export function cssColor(linearTriple) {
  return srgbHex(linearTriple)
}

/* ───────────────────────── 投影 ───────────────────────── */

/**
 * 世界 (x, z) → 平面图坐标 (x, y)。俯视时 z 取反，理由见文件头
 * 「投影约定」那一节：这样图上方位角逆时针增大，与布局的
 * θ = atan2(z, x) 同向，旋臂的缠绕方向不会读反。
 *
 * @param {number} x 世界 x
 * @param {number} z 世界 z
 * @param {boolean} [flipZ=false] true = 屏幕向下取 +z（与三维俯视相机一致）
 * @returns {{x:number, y:number}} 平面图坐标（y 是 SVG 的向下轴）
 */
export function projectPoint(x, z, flipZ = false) {
  const px = typeof x === 'number' && isFinite(x) ? x : 0
  const pz = typeof z === 'number' && isFinite(z) ? z : 0
  return { x: px, y: flipZ ? pz : -pz }
}

/** 取节点的平面图坐标；pos 缺失/坏值时当原点，绝不产出 NaN。 */
function projectNode(n, flipZ) {
  const p = n && n.pos ? n.pos : null
  return projectPoint(p ? p.x : 0, p ? p.z : 0, flipZ)
}

/** include 归一化：null=全部 / Set|Map / 数组 / 纯对象做白名单 / 谓词 (id, node) */
function makeIncludeTest(include) {
  if (include == null) return () => true
  if (typeof include === 'function') return (n) => !!include(n.id, n)
  if (include instanceof Set || include instanceof Map) return (n) => include.has(n.id)
  if (Array.isArray(include)) {
    const s = new Set(include)
    return (n) => s.has(n.id)
  }
  if (typeof include === 'object') {
    return (n) => Object.prototype.hasOwnProperty.call(include, n.id)
  }
  return () => true
}

/** 把 graph 归一化成 { nodes, links }；缺 nodes 数组直接抛错，不静默出空图。 */
function normalizeGraph(graph) {
  if (Array.isArray(graph)) return { nodes: graph, links: [] }
  if (graph && typeof graph === 'object' && Array.isArray(graph.nodes)) {
    return { nodes: graph.nodes, links: Array.isArray(graph.links) ? graph.links : [] }
  }
  throw new Error('exportSVG: 需要 { nodes, links }（或节点数组）；' +
    '收到 ' + (graph === null ? 'null' : typeof graph) + '。')
}

/**
 * 计算投影后坐标的包围盒。
 *
 * ⚠ **必须只统计被 include 选中的节点**。
 *   这是导出功能最容易错、后果最明显的一处：整体画面里猜想星团在 +x 方向
 *   外挂 255 个世界单位，如果包围盒按全体节点算，而这一张图只画主星系，
 *   那么盘只占整幅宽度的 (366 / 620) ≈ 六成，再叠上纵横比拟合，
 *   盘会缩成角落里的一小坨、四周大片空白 —— 看起来像"导出坏了"，
 *   其实是包围盒算错了对象。所以包围盒与绘制必须用**同一个**筛选结果。
 *
 * @param {Array} nodes 节点数组（元素需有 id 与 pos）
 * @param {object} [opts]
 * @param {Set|Array|object|Function|null} [opts.include] 节点筛选（id 集合或谓词）
 * @param {boolean} [opts.flipZ=false] 投影时是否翻转 z
 * @returns {{minX:number,maxX:number,minZ:number,maxZ:number,minY:number,maxY:number,
 *            centerX:number,centerZ:number,spanX:number,spanZ:number,span:number,count:number}}
 *   minX/maxX 是世界 x 的极值；minZ/maxZ 是世界 z 的极值；
 *   minY/maxY 是**投影后**纵轴（y）的极值；span = max(spanX, spanZ)。
 *   没有任何节点时全部为 0、count 为 0（不是 Infinity —— 让调用方少写一层判空）。
 */
export function computeBounds(nodes, opts = {}) {
  const flipZ = !!opts.flipZ
  const test = makeIncludeTest(opts.include)

  let minX = Infinity
  let maxX = -Infinity
  let minZ = Infinity
  let maxZ = -Infinity
  let minY = Infinity
  let maxY = -Infinity
  let count = 0

  const list = Array.isArray(nodes) ? nodes : []
  for (const n of list) {
    if (!n || !test(n)) continue
    const p = projectNode(n, flipZ)
    if (p.x < minX) minX = p.x
    if (p.x > maxX) maxX = p.x
    if (p.y < minY) minY = p.y
    if (p.y > maxY) maxY = p.y
    const z = n.pos && typeof n.pos.z === 'number' && isFinite(n.pos.z) ? n.pos.z : 0
    if (z < minZ) minZ = z
    if (z > maxZ) maxZ = z
    count++
  }

  if (!count) {
    return {
      minX: 0, maxX: 0, minZ: 0, maxZ: 0, minY: 0, maxY: 0,
      centerX: 0, centerZ: 0, spanX: 0, spanZ: 0, span: 0, count: 0,
    }
  }

  const spanX = maxX - minX
  const spanZ = maxZ - minZ
  return {
    minX, maxX, minZ, maxZ, minY, maxY,
    centerX: (minX + maxX) * 0.5,
    centerZ: (minZ + maxZ) * 0.5,
    spanX,
    spanZ,
    span: Math.max(spanX, spanZ),
    count,
  }
}

/* ───────────────────────── XML ───────────────────────── */

/**
 * XML 转义。**每一个**插进 SVG 的字符串都要过这里 —— 文本节点和属性值都是。
 *
 * 节点名字段里是中文（本身安全），但同一批数据里还有 latex、family、status、
 * 以及用户可传的 title。只要有一个名字带 `<` 或 `&`，未转义的输出就不是
 * "难看一点"，而是**整份 SVG 打不开**（XML 解析直接失败）。
 * 本函数被 scripts/verify-export.mjs 用一个叫 `<script>&"'` 的节点专门盯着。
 *
 * `&` 必须第一个替换，否则会把后面刚生成的实体再转义一遍。
 * `'` 用 `&apos;`（XML 预定义实体），这样属性值用单引号包也能安全。
 */
export function escapeXml(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/** 坐标/尺寸统一走这里：2 位小数（文件体积），非有限值一律 0（不许 NaN）。 */
function num(v) {
  const x = typeof v === 'number' && isFinite(v) ? v : 0
  return String(Math.round(x * 100) / 100)
}

/** 归一化到 [0,1]；坏值取 fallback。 */
function clamp01(v, fallback = 0) {
  const x = typeof v === 'number' && isFinite(v) ? v : fallback
  return x < 0 ? 0 : (x > 1 ? 1 : x)
}

/**
 * 节点的"面积等效边长"（世界单位）。用 sqrt(宽×高) 而不是宽或高：
 * 布局是**按面积**归一化大小的（graph.js 里 worldW × worldH = (baseSize×sizeScale)²），
 * 所以面积才承载"重要度 → 大小"这条语义，线性的宽或高会把
 * 长条公式（宽高比中位 11.5:1）画成一个横贯盘面的巨点。
 * width/height 缺失时用 rank 退一个合理值，而不是画成看不见的 0。
 */
function glyphSpan(n) {
  const w = n && typeof n.width === 'number' && isFinite(n.width) && n.width > 0 ? n.width : 0
  const h = n && typeof n.height === 'number' && isFinite(n.height) && n.height > 0 ? n.height : 0
  if (w > 0 && h > 0) return Math.sqrt(w * h)
  const rank = clamp01(n ? n.rank : 0, 0)
  return 2 + 6 * rank
}

/* ───────────────────────── 导出 ───────────────────────── */

/** 默认配色。都写成十六进制，方便 verify 脚本用一条正则扫全部 fill/stroke。 */
const DEFAULTS = {
  width: 2400,
  padding: 40,
  background: '#0a0e18',
  linkColor: '#7fa6e8',
  linkCrossColor: '#9b7fe8',
  bundle: 0.30,
  fontStack: 'system-ui, -apple-system, "Microsoft YaHei", "PingFang SC", "Noto Sans CJK SC", sans-serif',
  halo: '#05070f',
}

/**
 * 生成俯视平面图的 SVG 字符串。
 *
 * @param {{nodes:Array, links:Array}|Array} graph
 * @param {object} [opts]
 * @param {number}   [opts.width=2400]      画布宽度（px）
 * @param {number}   [opts.height=width]    画布高度，默认正方（盘是圆的，非正方只会两边留白）
 * @param {number}   [opts.padding=40]      四周留白（px）
 * @param {Set|Array|object|Function} [opts.include] 只画哪些节点（id 集合或谓词 (id, node)）
 * @param {boolean}  [opts.showLinks=false] 是否画全部关联（默认不画：464 个点的全图连线是噪声）
 * @param {Array}    [opts.linkSubset]      只画这一小组关联（"聚焦某个公式"的用法）；给了它就一定会画
 * @param {boolean}  [opts.showLabels=true] 是否画标签
 * @param {number}   [opts.minLabelRank=0]  只标 rank ≥ 此值的节点（理由见文件头）
 * @param {string}   [opts.background='#0a0e18'] 背景色
 * @param {string}   [opts.title]           左上角说明文字（可选）
 * @param {number}   [opts.maxNodes=Infinity] 节点数上限，按 rank 从高到低截断
 * @param {boolean}  [opts.flipZ=false]     投影是否翻转 z（见文件头）
 * @param {number}   [opts.bundle=0.30]     连线的束线系数（控制点朝中心拉多少）
 * @param {'center'|'origin'|Array} [opts.bundleTarget='center'] 束线目标
 * @param {object}   [opts.statusColors]    可选：状态 → 颜色（十六进制或线性三元组），
 *                                          用来给猜想节点的**环**按 status 上色
 * @param {object}   [opts.linkColors]      { normal, cross } 覆盖连线颜色
 * @returns {string} SVG 文本（无 XML 声明、无尾随换行 —— 便于内联进 HTML）
 */
export function exportSVG(graph, opts = {}) {
  const { nodes: allNodes, links: allLinks } = normalizeGraph(graph)

  const width = Math.max(1, Math.round(
    typeof opts.width === 'number' && isFinite(opts.width) && opts.width > 0
      ? opts.width : DEFAULTS.width))
  const height = Math.max(1, Math.round(
    typeof opts.height === 'number' && isFinite(opts.height) && opts.height > 0
      ? opts.height : width))
  const padding = Math.max(0, typeof opts.padding === 'number' && isFinite(opts.padding)
    ? opts.padding : DEFAULTS.padding)
  const flipZ = !!opts.flipZ
  const background = opts.background || DEFAULTS.background
  const title = opts.title == null ? '' : String(opts.title)
  const showLabels = opts.showLabels !== false
  const minLabelRank = typeof opts.minLabelRank === 'number' && isFinite(opts.minLabelRank)
    ? opts.minLabelRank : 0
  const bundle = clamp01(opts.bundle == null ? DEFAULTS.bundle : opts.bundle, DEFAULTS.bundle)
  const linkColor = (opts.linkColors && opts.linkColors.normal) || DEFAULTS.linkColor
  const linkCrossColor = (opts.linkColors && opts.linkColors.cross) || DEFAULTS.linkCrossColor
  const statusColors = opts.statusColors && typeof opts.statusColors === 'object'
    ? opts.statusColors : null
  const maxNodes = typeof opts.maxNodes === 'number' && isFinite(opts.maxNodes) && opts.maxNodes > 0
    ? Math.floor(opts.maxNodes) : Infinity

  const test = makeIncludeTest(opts.include)

  /* ── 1. 筛选节点 ──
   * include 是"这一张图要画什么"的唯一入口：只看主星系 / 只看猜想星团 /
   * 只看某个族。筛选结果同时决定包围盒与绘制内容，两者必须同源。 */
  let picked = []
  const byId = new Map()
  for (const n of allNodes) {
    if (!n || !n.id) continue
    byId.set(n.id, n)
    if (test(n)) picked.push(n)
  }

  // maxNodes：按 rank 从高到低截断。稳定排序（rank 相同看 id），保证可复现。
  if (picked.length > maxNodes) {
    picked = picked
      .map((n, i) => ({ n, i }))
      .sort((a, b) => {
        const ra = clamp01(a.n.rank, 0)
        const rb = clamp01(b.n.rank, 0)
        if (rb !== ra) return rb - ra
        return a.n.id < b.n.id ? -1 : (a.n.id > b.n.id ? 1 : a.i - b.i)
      })
      .slice(0, maxNodes)
      .map((e) => e.n)
  }

  /* ── 2. 包围盒 + 比例 ──
   * 纵横比必须**统一**缩放（scaleX === scaleY），否则圆盘会被拉成椭圆 ——
   * 而"盘是圆的、星团是球的"正是这张图要传达的结构信息之一。
   * 所以取两个方向的较小值做 fit，再让内容居中。 */
  const bounds = computeBounds(picked, { flipZ })

  /* 退化包围盒（就一个节点、或者所有节点恰好在同一个点上，span = 0）。
   * ⚠ 这里必须防一下：span 直接做分母会得到 Infinity，缩放矩阵一坏，
   *   整份 SVG 全是 NaN/Infinity。用一个和字形同量级的"名义跨度"兜底，
   *   于是"导出单个选中的公式"也能得到一张居中、比例正常的图。 */
  let fallbackSpan = 0
  for (const n of picked) fallbackSpan = Math.max(fallbackSpan, glyphSpan(n))
  if (!(fallbackSpan > 0)) fallbackSpan = 1
  const DEGENERATE = 1e-6
  const worldSpanX = bounds.spanX > DEGENERATE ? bounds.spanX : fallbackSpan
  const worldSpanZ = bounds.spanZ > DEGENERATE ? bounds.spanZ : fallbackSpan

  const usableW = Math.max(1, width - padding * 2)
  const usableH = Math.max(1, height - padding * 2)
  const scale = Math.min(usableW / worldSpanX, usableH / worldSpanZ)

  // 居中：用**真实** span 算偏移，所以单节点会精确落在画布中心。
  const originX = (width - bounds.spanX * scale) * 0.5 - bounds.minX * scale
  const originY = (height - bounds.spanZ * scale) * 0.5 - bounds.minY * scale

  const sx = (n) => originX + projectNode(n, flipZ).x * scale
  const sy = (n) => originY + projectNode(n, flipZ).y * scale

  /* 束线目标：默认取**本次导出内容的中心**，而不是世界原点。
   * 世界原点（盘心）是三维场景里的固定锚点，但导出是任意子集：
   * 只导出猜想星团时，世界原点在画外 255 个单位处，朝它拉会让所有弧线
   * 一起甩出画面。取内容中心则永远不会退化，语义也说得通
   * （"朝这张图的中部收拢"正是三维里那个观感的来源）。
   * 想要三维里那一套（朝盘心收）就传 bundleTarget: 'origin'。 */
  let btx = bounds.centerX
  let btz = bounds.centerZ
  if (opts.bundleTarget === 'origin') { btx = 0; btz = 0 } else if (Array.isArray(opts.bundleTarget)) {
    const p = projectPoint(opts.bundleTarget[0], opts.bundleTarget[1], flipZ)
    btx = p.x
    btz = p.y
  } else if (typeof opts.bundleTarget === 'object' && opts.bundleTarget) {
    const p = projectPoint(opts.bundleTarget.x, opts.bundleTarget.z, flipZ)
    btx = p.x
    btz = p.y
  }
  const targetX = originX + btx * scale
  const targetY = originY + btz * scale

  /* ── 3. 连线（画在最底层）──
   * 二次贝塞尔 M…Q：控制点取弦中点再朝束线目标拉 bundle。
   * 与三维里 links.js 的三次贝塞尔同一套思路（控制点在弦的 1/3、2/3 处
   * 朝盘心收），压到二次是因为俯视图里边的弧度本来就小，
   * 一次控制点足够表达"成束"，而且路径短一半。 */
  const wantLinks = !!opts.showLinks || Array.isArray(opts.linkSubset)
  const linkList = Array.isArray(opts.linkSubset)
    ? opts.linkSubset
    : (wantLinks ? allLinks : [])

  const linkParts = []
  let linkCount = 0
  let skippedLinks = 0
  for (const l of linkList) {
    if (!l) { skippedLinks++; continue }
    const aId = typeof l.source === 'object' && l.source ? l.source.id : l.source
    const bId = typeof l.target === 'object' && l.target ? l.target.id : l.target
    const a = byId.get(aId)
    const b = byId.get(bId)
    // 两端都得在本次导出里，否则画出来是半截线（另一端在画面外的坐标上）
    if (!a || !b || !test(a) || !test(b)) { skippedLinks++; continue }
    if (a === b) { skippedLinks++; continue }

    const w = clamp01(l.weight, 0.5)
    const x1 = sx(a)
    const y1 = sy(a)
    const x2 = sx(b)
    const y2 = sy(b)
    const mx = (x1 + x2) * 0.5
    const my = (y1 + y2) * 0.5
    const cx = mx + (targetX - mx) * bundle
    const cy = my + (targetY - my) * bundle
    const cross = !!l.cross
    // 线宽与不透明度都跟着分辨率和权重走：2400px 上的 1px 线在 800px 上等于没有
    const res = width / DEFAULTS.width
    const sw = Math.max(0.4, (0.5 + 1.9 * w) * res)
    const so = 0.16 + 0.62 * w

    linkParts.push(
      '<path class="' + (cross ? 'lk lk-cross' : 'lk') + '"' +
      ' d="M ' + num(x1) + ' ' + num(y1) +
      ' Q ' + num(cx) + ' ' + num(cy) +
      ' ' + num(x2) + ' ' + num(y2) + '"' +
      ' stroke="' + escapeXml(cross ? linkCrossColor : linkColor) + '"' +
      ' stroke-width="' + num(sw) + '"' +
      ' stroke-opacity="' + num(so) + '"' +
      (l.label ? ' data-label="' + escapeXml(l.label) + '"' : '') +
      '/>')
    linkCount++
  }

  /* ── 4. 节点 ──
   * 半径 ∝ sqrt(宽×高)（面积承载重要度），再乘一个"点比字形小得多"的系数：
   * 平面上一个公式的真实占位是 54×3.2 那种长条，照实画会把盘糊死，
   * 导出图要的是**分布与层次**，所以用面积等效圆点表示它。 */
  const res = width / DEFAULTS.width
  const maxR = Math.max(2, width / 40)
  const minR = Math.max(1.2, 1.6 * res)

  const nodeParts = []
  const labelParts = []
  let labelCount = 0

  for (const n of picked) {
    const x = sx(n)
    const y = sy(n)
    const rank = clamp01(n.rank, 0)
    const r = Math.max(minR, Math.min(maxR, scale * glyphSpan(n) * 0.22))
    const fill = cssColor(n.baseColor)
    const op = clamp01(n.brightness, 0.35 + 0.65 * rank)
    const conj = !!n.cluster

    if (conj) {
      /* 猜想节点画成**空心环**：三维里它是球状星团（另一类对象），
       * 平面图上"实心点 / 空心环"是最省笔墨的区分方式，
       * 而且环天生适合按 status 上色（颜色落在描边上更醒目）。 */
      const ring = statusColors && n.status && statusColors[n.status]
        ? statusColors[n.status]
        : null
      const ringColor = ring ? cssColor(ring) : fill
      nodeParts.push(
        '<circle class="nd nd-conj" cx="' + num(x) + '" cy="' + num(y) + '" r="' + num(r) + '"' +
        ' fill="' + escapeXml(fill) + '" fill-opacity="' + num(Math.min(0.28, op * 0.5)) + '"' +
        ' stroke="' + escapeXml(ringColor) + '" stroke-width="' + num(Math.max(1, 1.5 * res)) + '"' +
        ' stroke-opacity="' + num(Math.max(0.55, op)) + '"' +
        (n.status ? ' data-status="' + escapeXml(n.status) + '"' : '') +
        (n.field ? ' data-field="' + escapeXml(n.field) + '"' : '') +
        '/>')
    } else {
      nodeParts.push(
        '<circle class="nd" cx="' + num(x) + '" cy="' + num(y) + '" r="' + num(r) + '"' +
        ' fill="' + escapeXml(fill) + '" fill-opacity="' + num(op) + '"' +
        (n.family ? ' data-family="' + escapeXml(n.family) + '"' : '') +
        '/>')
    }

    /* 标签：字号 = pxPerWorldUnit × 该公式的字形高。
     * ⚠ 不能用固定字号。同一个 SVG 可能在 800px 的文档里显示、也可能
     *   当 4000px 的印刷插图，固定 12px 在一处太大、在另一处看不见 ——
     *   而"看得见"正是标签存在的唯一理由。跟着 scale 走，
     *   再夹到一个与输出宽度成比例的可读区间 [9.6, 48]（2400px 时）。 */
    if (showLabels && rank >= minLabelRank) {
      const fs = Math.max(width * 0.004, Math.min(width * 0.02, scale * glyphSpan(n) * 0.95))
      labelParts.push(
        '<text class="lbl" x="' + num(x) + '" y="' + num(y + r + fs * 0.95) + '"' +
        ' font-size="' + num(fs) + '"' +
        ' fill="' + escapeXml(fill) + '">' +
        escapeXml(n.name || n.id) +
        '</text>')
      labelCount++
    }
  }

  /* ── 5. 空输入 ──
   * `{ nodes: [] }` **不抛错**，返回一张只有背景和一行提示的合法 SVG。
   * 理由：抛错看似"严格"，但实际调用场景是"用户把筛选条件调到了空集"
   * （比如只看某个族、而数据里暂时没有那个族），那是正常状态不是异常，
   * 抛错会让上游不得不加一层 try/catch，而那一层十有八九会吞掉真错误。
   * 一张写着"没有可导出的节点"的合法图，比一个异常更容易查。 */
  const isEmpty = picked.length === 0
  const noticeParts = []
  if (isEmpty) {
    const fs = Math.max(12, Math.min(48, width * 0.014))
    noticeParts.push(
      '<text class="notice" x="' + num(width / 2) + '" y="' + num(height / 2) + '"' +
      ' font-size="' + num(fs) + '">' +
      escapeXml('没有可导出的节点（筛选结果为空）') +
      '</text>')
  }

  const titleParts = []
  if (title) {
    const fs = Math.max(12, Math.min(40, width * 0.016))
    titleParts.push(
      '<text class="title" x="' + num(padding) + '" y="' + num(padding + fs * 0.9) + '"' +
      ' font-size="' + num(fs) + '">' +
      escapeXml(title) +
      '</text>')
  }

  /* ── 6. 组装 ──
   * 共享样式放 <style>，逐元素只留真正逐元素的东西（位置、颜色、字号）。
   * 464 个节点时"每条都写一遍 font-family"能占掉几十 KB。
   *
   * 省略 <?xml ?> 声明：root 元素自带 xmlns，直接内联进 HTML 也能用；
   * 开头就是 <svg、结尾就是 </svg>，方便调用方做前缀/后缀替换。 */
  const style = [
    '<style>',
    'text{font-family:' + DEFAULTS.fontStack + ';text-anchor:middle;dominant-baseline:auto}',
    '.title{text-anchor:start;fill:#cfd8ef}',
    '.notice{text-anchor:middle;fill:#8a93ad}',
    '.lbl{paint-order:stroke fill;stroke:' + DEFAULTS.halo + ';stroke-width:3px;stroke-linejoin:round}',
    '.lk{fill:none;stroke-linecap:round}',
    '.lk-cross{stroke-dasharray:6 4}',
    '.nd{stroke:none}',
    '</style>',
  ].join('')

  const out = []
  out.push('<svg xmlns="http://www.w3.org/2000/svg"' +
    ' width="' + width + '" height="' + height + '"' +
    ' viewBox="0 0 ' + width + ' ' + height + '"' +
    ' data-projection="' + escapeXml(flipZ ? 'x,+z' : 'x,-z') + '"' +
    ' data-node-count="' + picked.length + '"' +
    ' data-link-count="' + linkCount + '"' +
    ' data-label-count="' + labelCount + '"' +
    ' data-px-per-unit="' + num(scale) + '"' +
    '>')
  out.push(style)
  out.push('<rect class="bg" x="0" y="0" width="' + width + '" height="' + height +
    '" fill="' + escapeXml(background) + '"/>')
  if (titleParts.length) out.push('<g class="titles">' + titleParts.join('') + '</g>')
  if (noticeParts.length) out.push('<g class="notices">' + noticeParts.join('') + '</g>')
  out.push('<g class="links" data-link-count="' + linkCount + '">' + linkParts.join('') + '</g>')
  out.push('<g class="nodes" data-node-count="' + picked.length + '">' + nodeParts.join('') + '</g>')
  out.push('<g class="labels" data-label-count="' + labelCount + '">' + labelParts.join('') + '</g>')
  out.push('</svg>')

  return out.join('\n')
}

/* ───────────────────────── 文件名 ───────────────────────── */

/** 只留 ASCII 小写、数字、连字符；其余（含所有 CJK）一律丢掉。 */
function slugify(s) {
  return String(s == null ? '' : s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-')
}

/** Date | 'YYYY-MM-DD…' | 数字时间戳 → 'YYYY-MM-DD'（本地时区，和人看到的日期一致）。 */
function formatDate(d) {
  if (typeof d === 'string') {
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(d.trim())
    if (m) return m[1] + '-' + m[2] + '-' + m[3]
  }
  const t = d instanceof Date ? d : (typeof d === 'number' && isFinite(d) ? new Date(d) : new Date())
  const dt = isFinite(t.getTime()) ? t : new Date()
  const p = (v) => String(v).padStart(2, '0')
  return dt.getFullYear() + '-' + p(dt.getMonth() + 1) + '-' + p(dt.getDate())
}

/**
 * 生成确定性的、文件系统安全的 ASCII 文件名，形如
 * `formula-nebula-overview-2026-09-16.svg`。
 *
 * ⚠ 中文标题**不参与**文件名（slugify 会把它们整段丢掉）。
 *   理由是踩过的坑：CJK 文件名在 zip 解压、URL 引用、跨系统同步、
 *   以及各种 CLI 工具里会变成乱码，而且不同系统的大小写/Unicode 规范化
 *   （NFC vs NFD）还会让"同一个名字"对不上。中文放在 SVG **内部**的
 *   title 上 —— 那里是给人看的，不会被文件系统糟蹋。
 *
 * 同一组 opts 必然给出同一个名字（date 也可以显式传字符串），
 * 这样脚本可以反复跑、覆盖同一个文件而不堆一堆副本。
 *
 * @param {object} [opts]
 * @param {string} [opts.scope='overview'] 视图名（overview / galaxy / cluster / 自定）
 * @param {string} [opts.title]            标题（会被 slug 化；纯中文则自动退回 scope）
 * @param {Date|string|number} [opts.date] 日期，默认今天
 * @param {string} [opts.prefix='formula-nebula'] 前缀
 * @param {string} [opts.ext='svg']        扩展名
 * @returns {string} 文件名
 */
export function exportFilename(opts = {}) {
  const prefix = slugify(opts.prefix || 'formula-nebula') || 'formula-nebula'
  const scope = slugify(opts.scope || '') || slugify(opts.title || '') || 'overview'
  const date = formatDate(opts.date)
  const ext = slugify(opts.ext || 'svg') || 'svg'
  return prefix + '-' + scope + '-' + date + '.' + ext
}

/* ───────────────────────── 下载（唯一碰 DOM 的函数）───────────────────────── */

/**
 * 触发浏览器下载。**本模块唯一碰 DOM 的地方**，而且是调用时才碰 ——
 * import 本身在任何环境都安全（否则 scripts/verify-export.mjs 根本跑不起来）。
 *
 * 在 Node 里调用会**抛错**而不是静默返回：静默 no-op 是这类工具函数最坏的
 * 失败模式 —— 调用方以为导出成功了，用户什么都没拿到，而且没有任何报错可查。
 *
 * @param {string} svgString exportSVG() 的产物
 * @param {string} [filename] 默认由 exportFilename() 生成
 * @returns {string} 实际使用的文件名
 */
export function downloadSVG(svgString, filename) {
  if (typeof svgString !== 'string' || !svgString.length) {
    throw new Error('downloadSVG: 第一个参数必须是 exportSVG() 产出的 SVG 字符串。')
  }
  if (typeof document === 'undefined' || typeof URL === 'undefined' ||
      typeof URL.createObjectURL !== 'function' || typeof Blob === 'undefined') {
    throw new Error('downloadSVG: 只能在浏览器里调用（当前环境没有 document/Blob/URL）。' +
      '在 Node 里请直接把 exportSVG() 的返回值写到文件。')
  }

  const name = filename || exportFilename()
  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.rel = 'noopener'
  a.style.display = 'none'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  // 立刻回收会让部分浏览器来不及取数据，挪到下一轮事件循环
  setTimeout(() => URL.revokeObjectURL(url), 0)
  return name
}
