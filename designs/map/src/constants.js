/**
 * designs/map/src/constants.js — 「公式大陆」的全部设计常量（架构师冻结，建造者只读）。
 *
 * 为什么集中在一处：配色、线宽、字号、语义缩放阈值同时被 world / render / labels / ui
 * 四个模块使用；分散定义必然漂移（图例里画的道路和地图上的不一致是最常见的坏味道）。
 * 模块若需要私有微调常量，写在自己的文件里，不要改这里。详见 SPEC.md §3。
 *
 * 坐标约定（SPEC §2）：世界坐标原点 = 大陆中心，单位"世界单位 wu"，x 向东、y 向南（与屏幕同向）。
 */

/* ───────── 世界范围与网格 ─────────
 * ═══ 为什么从 2000x1440 放大到 4000x2880（2026-11-02）═══
 *
 * 知识库从 488 节点涨到 4,152 后，用户反馈：
 *   "B方案整个世界太小了，所有城市全挤一起了。"
 *
 * 实测（4,152 个 place）：
 *   · 世界 2000x1440 = 2.88M wu²，每点平均只有 694 wu²
 *   · 中位最近邻距离 **17.6 wu**（城市符号屏幕上直径 6.4~14 px，几乎贴着）
 *   · 甚至溢出到 2289x1588 —— 说明原尺寸早已装不下
 *
 * 按面积律（间距 ∝ √(面积/点数)），世界线性放大 2× → 面积 4×，
 * 中位最近邻约 35 wu，城市之间留出可见空隙。
 *
 * ⚠ 放大世界时必须**同步放大所有世界单位的常量**，否则内容还是挤在中间：
 *   WORLD_BOUNDS / GRID_CELL / SLOT_UNIT / RIPPLES / 各类 inset
 * 城市符号是屏幕 px（CITY_SYMBOL 不随之变），所以符号大小不变、只是散开。
 */
export const WORLD_BOUNDS = { x0: -3000, y0: -2160, x1: 3000, y1: 2160 }
/** 标量场网格边长（wu）。与世界同步放大：顶点数保持约 18 万，
 *  相对精度不变（海岸线的网格感与放大前一致）。
 *  若只放大世界而 cell 不变 → 顶点数 9×（163 万），构建会非常慢。 */
export const GRID_CELL = 12
/** 所有程序生成（噪声、布局初值）共用的种子：同一份数据永远生成同一张地图。 */
export const SEED = 20261031

/* ───────── 国家（知识族）排布 ─────────
 * 8 族放进一个 3-3-2 的六角槽位（同排相邻槽距 2 个单位，排距 √3）。
 * 排列是对 8! 种排法穷举、"六角相邻槽位之间的跨族定理关联数之和"最大的一种
 * （435 / 588 = 74% 的跨族关联落在相邻国之间；脚本见 shots/designs/map/_arr4.mjs）。
 * modern 落在唯一的 6 邻槽 —— 它与 6 个族都有大量关联，做"腹地"名副其实。 */
export const SLOT_UNIT = 510   // 1 个槽位单位 = 340 wu → 同排相邻国中心距 680 wu（随世界 2× 同步放大）
export const FAMILY_SLOTS = {
  scheme:     [-2, -1],
  cohomology: [0, -1],
  curve:      [2, -1],
  foundation: [-3, 0],
  modern:     [-1, 0],
  intersect:  [1, 0],
  map:        [-2, 1],
  birational: [0, 1],
}
export const FAMILY_ORDER = ['foundation', 'scheme', 'cohomology', 'map', 'curve', 'intersect', 'birational', 'modern']

/** 槽位 → 世界坐标的国家中心种子（已整体居中）。world/layout 以此为初值再做力导向微调。 */
export const COUNTRY_SEEDS = (() => {
  const S3 = Math.sqrt(3)
  const pts = Object.entries(FAMILY_SLOTS).map(([f, [sx, sy]]) => [f, sx * SLOT_UNIT, sy * S3 * SLOT_UNIT])
  const mx = pts.reduce((s, p) => s + p[1], 0) / pts.length
  const my = pts.reduce((s, p) => s + p[2], 0) / pts.length
  return Object.fromEntries(pts.map(([f, x, y]) => [f, { x: x - mx, y: y - my }]))
})()

/** 国名（地图上的大字）、拉丁副标题。中文国名取自 FAMILIES[k].name 的地名化改写。 */
export const COUNTRY_NAMES = {
  foundation: { zh: '交换代数古国', latin: 'TERRA FUNDAMENTORUM' },
  scheme:     { zh: '概形与层王国', latin: 'REGNUM SCHEMATUM' },
  cohomology: { zh: '上同调联邦', latin: 'FOEDUS COHOMOLOGIAE' },
  map:        { zh: '态射与奇点山地', latin: 'MONTES MORPHISMORUM' },
  curve:      { zh: '曲线曲面半岛', latin: 'PENINSULA CURVARUM' },
  intersect:  { zh: '相交理论公国', latin: 'DUCATUS INTERSECTIONIS' },
  birational: { zh: '双有理高原', latin: 'PLANITIES BIRATIONALIS' },
  modern:     { zh: '模空间腹地', latin: 'TERRA MODULORUM' },
}

/* ───────── 配色：国家 ─────────
 * land = 陆地填色（低饱和粉彩，政区图惯例），ink = 该国文字/城市符号色（同色相深色）。
 * 相邻国色相刻意拉开（相邻关系见 FAMILY_SLOTS）；全部避开海洋蓝。 */
export const COUNTRY_COLORS = {
  foundation: { land: '#ecdcb4', ink: '#7a5a14' },  // 麦黄
  scheme:     { land: '#cfe0b4', ink: '#3f6420' },  // 苔绿
  cohomology: { land: '#f2c7b8', ink: '#9a3b22' },  // 珊瑚
  map:        { land: '#ebc6dc', ink: '#8a2f66' },  // 玫瑰
  curve:      { land: '#bfe3d3', ink: '#1f6e55' },  // 薄荷
  intersect:  { land: '#f5e3a0', ink: '#806300' },  // 奶油黄
  birational: { land: '#f6d2a6', ink: '#94511a' },  // 杏
  modern:     { land: '#d9d0ef', ink: '#4f3f94' },  // 薰衣草
}

/* ───────── 配色：海洋与海岸 ───────── */
export const OCEAN = {
  shallow: '#d4e9f2',   // 近岸浅水
  deep: '#a9cfe2',      // 远海
  deepest: '#93c0d8',   // 世界边缘
  graticule: 'rgba(60,110,150,.10)',  // 经纬网（只画在海上）
  ripple: '#7fa9c4',    // 等深线 / 波纹
  coast: '#5b7f96',     // 海岸线
  seaLabel: '#4b7692',  // 海名（斜体）
}
/** 等深线：离岸距离（wu）与线 alpha。越远越淡，形成老海图的"水纹"。 */
export const RIPPLES = [
  { d: 7, alpha: 0.55, width: 0.9 },
  { d: 15, alpha: 0.40, width: 0.8 },
  { d: 26, alpha: 0.28, width: 0.7 },
  { d: 42, alpha: 0.18, width: 0.7 },
  { d: 66, alpha: 0.10, width: 0.6, dash: [4, 4] },
]
/** 海洋栅格的深度着色：离岸距离 (wu) → 颜色停靠点 */
export const OCEAN_DEPTH_STOPS = [[0, OCEAN.shallow], [180, '#c0dfec'], [480, OCEAN.deep], [1080, OCEAN.deepest]]   // wu，随世界 2×
/** 经纬网间隔（wu） */
export const GRATICULE_STEP = 600   // 经纬网间距（wu）；随世界 2× 同步，保持同样数目的格线

/** 海名：world 在最大的几片开阔海域（离陆/岛最远的点）依次放置；最后一条放在幻岛附近的远海。 */
export const SEA_NAMES = [
  { zh: '未解之海', latin: 'MARE INCOGNITUM' },
  { zh: '猜想大洋', latin: 'OCEANUS CONIECTURARUM' },
  { zh: '证明湾', latin: 'SINUS DEMONSTRATIONIS' },
  { zh: '此处有龙', latin: 'HIC SUNT DRACONES', small: true },
]

/* ───────── 国界与地形 ───────── */
export const BORDER = {
  color: '#8a7f73',     // 国界实线（中性灰褐）
  width: 1.1,           // 屏幕 px（不随缩放变粗）
  ribbon: 7,            // 国界内侧色带宽（屏幕 px），颜色 = 该国 ink，alpha 见下
  ribbonAlpha: 0.16,
}
export const COAST = { width: 1.3 }
/** 地形晕渲：光源方向（西北 315°，高度角 45°）、叠加强度。克制：只做"纸面起伏"，不抢城市。 */
export const RELIEF = { azimuthDeg: 315, altitudeDeg: 45, strength: 0.22, zFactor: 2.2 }

/* ───────── 道路 / 航线（宽度均为屏幕 px） ───────── */
export const ROAD_STYLE = {
  road:       { casing: '#c9bfae', core: '#ffffff', w: 1.6, cw: 0.9 },  // 族内普通关联
  highway:    { casing: '#c8962f', core: '#ffe7a3', w: 3.0, cw: 1.8 },  // 族内 hero 关联
  crossroad:  { casing: '#b9764a', core: '#ffd9bf', w: 2.0, cw: 1.1 },  // 跨族普通关联
  crossway:   { casing: '#b0532b', core: '#ffc79a', w: 3.2, cw: 2.0 },  // 跨族 hero = 跨境公路
  ferry:      { color: '#4f7f9e', w: 1.2, dash: [5, 4] },               // 定理 ↔ 猜想 = 航线
  lane:       { color: '#6f93ad', w: 1.0, dash: [1.5, 4] },             // 猜想 ↔ 猜想 = 海道
  expedition: { color: '#24486a', w: 1.2, dash: [7, 3, 1.5, 3] },       // 研究者 ↔ 任意 = 探险路线
}
/** 选中后高亮路线：白色描边 + 关系类型色芯 */
export const ROUTE = { casing: '#ffffff', casingW: 6, coreW: 3.2, drawInMs: 600 }
/** 关系类型 → 路线色（在 LINK_TYPES 原色基础上压暗，适配浅色底图）。键与 LINK_TYPES[i].id / RELATED.id 一致。 */
export const ROUTE_TYPE_COLORS = {
  equivalent: '#1f9e90', defines: '#2a8fb5', implies: '#d63a55', generalizes: '#4f9a2a',
  computes: '#8a9a1e', property: '#857766', depends: '#d0761f', sameFamily: '#3f62d6',
  contrast: '#6c6496', provenance: '#58657a', analogy: '#a650bf', related: '#4a6a96',
}
/** 道路曲率：二次贝塞尔控制点沿法向偏移 = 长度 × 该系数 × hash(key)∈[-1,1] */
export const ROAD_BEND = 0.12

/* ───────── 城市符号（屏幕 px，未乘 symbolScale） ─────────
 * tier 0 = 首都，1 = 大城市，2 = 城镇，3 = 村落（定义见 rules.js assignTiers）。 */
export const CITY_SYMBOL = [
  { r: 7.0, kind: 'capital' },   // 白底圆 + 国家 ink 五角星 + ink 外圈
  { r: 5.0, kind: 'major' },     // 白底圆 + ink 粗外圈 + ink 圆心点
  { r: 3.2, kind: 'town' },      // ink 实心圆 + 白描边
  { r: 2.2, kind: 'village' },   // ink 实心圆（alpha .85）
]
export const SYMBOL_STROKE = '#ffffff'

/* ───────── 猜想岛屿（状态 → 地图符号） ───────── */
export const ISLAND_STATUS = {
  open:      { fill: '#f3ead2', coast: '#6a5a3a', ink: '#7a3b1e', coastDash: [5, 4], hatch: false, mark: 'none',  zh: '未勘探', note: '虚线海岸 = 尚未勘明' },
  partial:   { fill: '#ece2bf', coast: '#6a5a3a', ink: '#7a5a10', coastDash: [12, 3, 2, 3], hatch: true, mark: 'none', zh: '部分勘探', note: '点划海岸 + 斜线 = 局部已知' },
  proved:    { fill: '#cfe6bf', coast: '#3d6a33', ink: '#2f5a28', coastDash: null, hatch: false, mark: 'flag',  zh: '已勘明', note: '实线海岸 + 旗 = 已证明' },
  disproved: { fill: null,      coast: '#9a5a5a', ink: '#8a3a3a', coastDash: [1.5, 3], hatch: false, mark: 'cross', zh: '幻岛', note: '点状虚边 + × = 已被推翻（E.D.）' },
  heuristic: { fill: '#e4e3f4', coast: '#5f5c8f', ink: '#4a4780', coastDash: [2, 3], hatch: false, mark: 'none', zh: '传闻之地', note: '点状海岸 = 启发式预期' },
}
/** 岛屿半径（wu）= ISLAND_R0 + ISLAND_R1 × importance；离岸距离按状态递增（越不确定越远） */
export const ISLAND_R0 = 6
export const ISLAND_R1 = 48        // 岛屿基础半径（wu）；随世界 2× 同步（符号是屏幕 px，不随之变）
export const ISLAND_OFFSHORE = { proved: 120, partial: 210, heuristic: 300, open: 330, disproved: 450 }   // wu，随世界 2×

/* ───────── 研究者港口 ───────── */
export const PORT = { color: '#24486a', r: 4.5, ink: '#24486a', pier: 9 }

/* ───────── 语义缩放 ─────────
 * 级别由 s = zoom / zFit 决定（zFit = 把 world.fitBounds 装满视口的缩放），因此与屏幕尺寸无关。 */
export const ZOOM_LEVELS = [1.6, 3.2, 6.4]   // s < 1.6 → L0；< 3.2 → L1；< 6.4 → L2；否则 L3
export const ZOOM_MIN_S = 0.6
export const ZOOM_MAX_S = 16
/** 每级符号缩放（随级别略放大，让近景的城市"有分量"） */
export const SYMBOL_SCALE = [0.9, 1.0, 1.15, 1.3]

/* ───────── 标签排版 ───────── */
export const FONTS = {
  title: '"Source Han Serif SC", "Noto Serif SC", "Songti SC", "STSong", "SimSun", Georgia, serif',
  country: '"Microsoft YaHei", "PingFang SC", "Noto Sans SC", "Source Han Sans SC", sans-serif',
  latin: 'Georgia, "Times New Roman", serif',
  sea: 'Georgia, "KaiTi", "STKaiti", "Kaiti SC", serif',
  city: '"Microsoft YaHei", "PingFang SC", "Noto Sans SC", "Source Han Sans SC", system-ui, sans-serif',
  port: 'Georgia, "KaiTi", "STKaiti", "Kaiti SC", serif',
}
/** 公式标签的显示高度（css px，指 tex 字号 64px 那一行缩放后的字号）与中文名字号，按 tier 索引。
 * 岛屿用 ISLAND_* 行，港口只显示名字。 */
export const LABEL_SIZE = {
  formulaPx: [19, 16, 14, 12.5],    // tier 0..3 公式字号（tex 64px → 这个 px）
  namePx:    [14, 12.5, 11.5, 10.5],
  nameWeight: [700, 600, 500, 400],
  islandFormulaPx: [16, 14, 12.5],  // 岛屿 tier 1..3（岛屿没有 tier 0）
  islandNamePx: [13, 12, 11],
  portNamePx: 11.5,
  maxFormulaW: 300,                 // 公式最大显示宽（px）；超出则等比缩小（不低于 0.75 倍字号，否则退化为名字）
  maxNameChars: 12,                 // 名字超出截断 + "…"（完整名在面板/tooltip）
  gap: 3,                           // 符号与标签间距 px
  lineGap: 1,                       // 公式行与名字行间距 px
}
export const HALO = { color: '#fbf8f1', width: 3 }   // 标签光晕（地图字的"留白描边"）
/** 国名：字号（px）随级别；alpha 随级别淡出。≥ L2 变为不参与碰撞的水印。 */
export const COUNTRY_LABEL = { px: [30, 36, 44, 52], alpha: [0.9, 0.7, 0.28, 0.16], tracking: 0.55, latinPx: [11, 12, 13, 14] }
export const SEA_LABEL = { px: [17, 19, 22, 24], alpha: [0.85, 0.8, 0.6, 0.45], tracking: 0.4 }

/* ───────── 交互与动画 ───────── */
export const PANEL_W = 400            // 详情面板宽（px）；打开时 state.inset.right = PANEL_W + 16
export const FLY_MS = 750
export const HIT_RADIUS = 12          // 点选判定半径（px，≥ 符号半径）
export const SELECT_FOCUS_S = [1.8, 5.0]  // 选中飞行时的 s 区间（框住一跳邻居，但不小于/大于此）
export const PULSE_MS = 900
export const LABEL_FADE_MS = 160
export const HASH_DEBOUNCE_MS = 300
