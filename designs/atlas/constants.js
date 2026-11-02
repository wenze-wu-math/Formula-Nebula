/**
 * designs/atlas/constants.js — 星图的全部"设计常量"（冻结文件，建造者只读）。
 *
 * 为什么集中在一处：配色、星等、语义缩放阈值同时被布局 / 标签 / 渲染 / 面板 /
 * 图例五个模块使用，分散定义必然漂移（图例画的星等和图上的不一致是最常见的坏味道）。
 * 模块若需要私有的微调常量，写在自己的文件里，不要改这里。
 *
 * 坐标约定（详见 SPEC.md §2）：世界坐标原点 = 天极（星图中心），单位"世界单位"，
 * 盘面（赤纬 0°）半径 R_DISK = 1000；屏幕 y 向下。赤经 ra（弧度）从正上方起
 * **逆时针**增加（与真实的"从天球内部仰望"星图一致：东在左）。
 */

/* ───────── 几何：同心环带（世界单位） ───────── */
export const R_DISK = 1000          // 盘面边缘 = 赤纬 0°
export const R_SCALE_IN = 1000      // 刻度环内沿（与盘面边缘重合）
export const R_SCALE_MID = 1018     // 刻度环中线（短刻度终点）
export const R_SCALE_OUT = 1072     // 刻度环外沿（双线：1072 与 1076）
export const R_HOUR_TEXT = 1046     // 赤经时数字的圆心半径
export const R_RES_TICK = 1076      // 研究者短刻度起点（= 刻度环外沿外线）
export const R_RES_TICK_END = 1094  // 研究者短刻度终点
export const R_RES = 1112           // 研究者名字（沿弧排字）基线半径
export const FIT_RADIUS = 1165      // "全图适配"时要装进视口的半径（含研究者名字）
export const FIT_MARGIN = 24        // 适配时四周留白（css px）

/* ───────── 坐标网 ───────── */
export const DEC_STEP_DEG = 10      // 赤纬圈间隔：90°(极) → 0°(盘缘)，每 10° 一圈，半径 = R_DISK*(90-dec)/90
export const RA_LINE_HOURS = 1      // 赤经线间隔（小时），24 条，从 dec=80° 圈画到盘缘
export const RA_MAJOR_HOURS = 6     // 粗一点的主赤经线（0h/6h/12h/18h），从极点画起

/* ───────── 星座（知识族）排布 ─────────
 * foundation 放极冠（最基础的族 = 天极附近的"小熊座"），其余 7 族沿赤经环绕。
 * RING_ORDER 是对 7 族所有环形排列穷举后、相邻族之间跨族关联数之和最大的一种
 * （214 条，见 SPEC §3.1），这样跨族连线多半落在相邻星座的边界附近。
 * 顺序 = 赤经递增方向（屏幕上逆时针）；RING_ORDER[0] 的扇区中心对准 ra=0（正上方）。 */
export const POLE_FAMILY = 'foundation'
export const RING_ORDER = ['scheme', 'cohomology', 'modern', 'intersect', 'curve', 'birational', 'map']
export const FAMILY_ORDER = [POLE_FAMILY, ...RING_ORDER]
/** 拉丁化星座名（仿 IAU 星座名的拉丁风格，纯装饰性副标题） */
export const FAMILY_LATIN = {
  foundation: 'FUNDAMENTUM',
  scheme: 'SCHEMA',
  cohomology: 'COHOMOLOGIA',
  map: 'MORPHISMUS',
  curve: 'CURVAE',
  intersect: 'INTERSECTIO',
  birational: 'BIRATIONALIS',
  modern: 'MODULI',
}
/** 星座区域网格（IAU 式阶梯边界沿这些网格线走）。band 0 在极点。 */
export const REGION_BANDS = 20                       // 径向 20 档，每档 BAND_W 世界单位
export const BAND_W = R_DISK / REGION_BANDS          // = 50
export const regionCols = (band) => (band < 2 ? 12 : band < 8 ? 24 : 48)   // 每档的赤经格数（12|24|48 互相整除）
/** 星点离所在区域边界的最小距离（世界单位），布局保证 */
export const REGION_INSET = 8

/* ───────── 配色（两种墨色 + 金线，见 SPEC §1） ───────── */
export const COLOR = {
  bgOuter: '#050a15',            // 盘外深空
  diskInner: '#11203b',          // 盘心
  diskOuter: '#0a1529',          // 盘缘
  grid: 'rgba(201,168,106,0.13)',        // 赤纬圈 / 赤经线
  gridMajor: 'rgba(201,168,106,0.26)',   // 主赤经线、30°/60° 赤纬圈
  ring: '#c9a86a',               // 刻度环、时数字
  ringDim: 'rgba(201,168,106,0.55)',
  boundary: 'rgba(214,180,112,0.50)',    // 星座边界虚线
  figure: 'rgba(236,216,166,0.50)',      // 星座连线
  star: '#f4ecd8',               // 恒星（奶白，单色）
  starHalo: '#0a1529',           // 星点外的"挖空"描边（印刷星图的白边效果，这里是底色）
  ink: '#f1e7cf',                // 定理公式标签
  inkName: 'rgba(241,231,207,0.74)',     // 中文名
  conj: '#ef6a4a',               // 第二墨色：朱红（猜想 = 深空天体）
  conjName: 'rgba(239,106,74,0.86)',
  researcher: '#d9c08a',         // 研究者名字（金）
  constName: 'rgba(222,196,140,0.40)',   // 星座名
  constLatin: 'rgba(222,196,140,0.30)',
  arcTheorem: '#e9c878',         // 选中后浮现的关联弧：定理—定理
  arcConj: '#ef6a4a',            //                    涉及猜想
  arcResearcher: '#a9bfdc',      //                    研究者引导线（虚线）
  reticle: '#ffe2a0',            // 选中准星
  searchHit: '#9fd4ff',          // 搜索命中圈（唯一的冷色，只用于临时状态）
  labelHalo: '#0a1529',          // 标签文字底下的晕边
  regionFocus: 'rgba(201,168,106,0.05)', // 选中节点所在星座区域的极淡金色铺底
}
/** 公式位图只能用 hex 颜色（tex.js 限制）；与 COLOR.ink / COLOR.conj 相同色相 */
export const INK_HEX = '#f1e7cf'
export const CONJ_HEX = '#ef6a4a'
export const INK_HI_HEX = '#fff4d6'   // 选中节点自己的公式（更亮一点）

/** 选中某节点后，与其无关的元素的透明度倍数 */
export const DIM = { star: 0.28, glyph: 0.32, label: 0.0, figure: 0.25, constName: 0.5, researcher: 0.35 }

/* ───────── 字体（离线：只用系统字体；本机已确认有 Palatino Linotype / KaiTi / YaHei） ───────── */
export const FONT_SERIF = '"Palatino Linotype","Book Antiqua",Palatino,Georgia,"Noto Serif SC","Source Han Serif SC","Songti SC","STSong","SimSun",serif'
export const FONT_KAI = '"STKaiti","KaiTi","Kaiti SC","Palatino Linotype",serif'   // 星座中文名（古籍楷体气质）
export const FONT_SANS = '"Inter","PingFang SC","Microsoft YaHei",system-ui,sans-serif'

/* ───────── 星等 ─────────
 * 定理按 importance 降序（同值按 id 字典序）切 6 档，累计比例： */
export const MAG_CUTS = [0.05, 0.15, 0.30, 0.50, 0.75, 1.00]     // mag 1..6
/** L=0（全图适配）时各星等的星点半径（css px），下标 = mag-1 */
export const STAR_R = [5.2, 4.2, 3.3, 2.6, 2.0, 1.5]
/** 猜想按 importance 分 3 档：≥0.88 → 1，≥0.76 → 2，否则 3 */
export const DSO_TIER_CUTS = [0.88, 0.76]
export const DSO_R = [6.6, 5.4, 4.4]
/** 拉近时符号略放大：r * (1 + GLYPH_GAIN * clamp(L, 0, 4))；拉远（L<0）时按 2^(L*0.72) 缩小，最小 0.16px
 *
 * ═══ 为什么缩小的指数和下限都改过（2026-11-02）═══
 *
 * 原值 `2^(L*0.5)`、下限 0.35 —— 实测 L=-0.6 时 glyphScale 只到 0.81，
 * 1 等星半径仍有 4.2px。而盘面在缩小态要压进同一块视口，
 * 星点数从 405 涨到 3,027 后密度高得多，于是**全盘糊成一片白**
 * （用户反馈："A方案在缩小时太挤了，把行星缩放比例调小一点"）。
 *
 * 改法：
 *   · 指数 0.5 → 0.72：缩小时的缩小幅度更陡，星点跟着盘面一起变小；
 *   · 下限 0.35 → 0.16：允许缩得更小，避免大盘面上的暗星仍然占几个像素。
 *
 * 实测对照（1 等星半径，css px）：
 *   L     改前(2^0.5L)  改后(2^0.85L)  每星可用半径
 *   -1.2     3.43          2.38           2.82
 *   -0.6     4.22          3.32           4.27
 *   -0.3     4.69          4.14           5.34
 *    0       5.20          5.20           6.47
 *   0.6      5.70          5.70           9.80   ← L>0 完全不受影响
 *
 * 判据：星点半径应**明显小于**每星可用半径（约 0.75 倍），
 * 才能在缩小态看出"点与点之间的空隙"。改前 L=-0.6 时 4.22 / 4.27 = 0.99
 * —— 正好占满，所以糊成一片。改后 3.32 / 4.27 = 0.78，留出可见空隙。
 */
export const GLYPH_GAIN = 0.16
export const glyphScale = (L) => (L >= 0 ? 1 + GLYPH_GAIN * Math.min(L, 4) : Math.max(0.16, Math.pow(2, L * 0.85)))

/* ───────── 语义缩放 ─────────
 * L = log2(zoom / zoom0)，zoom0 = 全图适配缩放（按整个视口算，不扣面板，
 * 所以开关面板 L 不变）。下面的阈值都是 L。 */
export const L_MIN = -1.2
export const L_MAX = 5.0
/** 定理公式标签开始参选的 L（按星等，下标 = mag-1）
 *
 * 2026-11-01 重定：为了让语义缩放**单调**（放大一定看到更多），
 * 取消了原先"总览态用 skipL 越级补位凑数"的机制，改为把阈值本身排好。
 *
 * 实测各档累计数（perf.md 的星等分布）：
 *   mag1=20  mag≤2=60  mag≤3=121  mag≤4=202  mag≤5=303  mag≤6=405
 *
 * 档位按"总览 → 拉近"的阅读节奏排：
 *   L ≥ -0.3 → 20 条   （仅 mag 1）
 *   L ≥  0.0 → 60 条   （mag ≤ 2）总览默认落在这里
 *   L ≥  0.6 → 121 条
 *   L ≥  1.2 → 202 条
 *   L ≥  1.8 → 303 条
 *   L ≥  2.4 → 405 条  拉到最近：全部
 *
 * 2026-11-01 实测总览（L=0）只放下 19 个公式：参选 60 个，
 * 但 405 个星点挤在 677×662px 里，空隙被星点禁区切碎，只放得下 19 个。
 * 这是**几何容量上限**，不是档位问题 —— 图例显示的是"参选范围"（mag ≤ 2），
 * 与实际放下的数量本来就不是一回事。
 *
 * ⚠ 这是**冻结文件**（SPEC §11）。本次修的是"缩放语义反了"的 bug，属于必须改的情形。
 */
export const MAG_LABEL_L = [-0.3, 0.0, 0.6, 1.2, 1.8, 2.4]
/** 猜想公式标签开始参选的 L（按档，下标 = tier-1）
 * 2026-11-01 同步改为等间距，理由同 MAG_LABEL_L。 */
export const DSO_LABEL_L = [-0.3, 0.25, 0.8]
/** 中文名行在公式之后再拉近多少级出现 */
export const NAME_EXTRA_L = 0.9
/** 研究者名字参选的 L */
export const RES_LABEL_L = -0.6
/** 星座名：L ≤ CONST_FADE_L0 全显，到 CONST_FADE_L1 淡到 0 并退出避让 */
export const CONST_FADE_L0 = 2.2
export const CONST_FADE_L1 = 3.0
/** 星座连线：L ≥ FIGURE_FADE_L0 开始淡出，到 FIGURE_FADE_L1 剩 40% */
export const FIGURE_FADE_L0 = 2.5
export const FIGURE_FADE_L1 = 3.5
/** 参选滞回：已显示的标签在阈值以下 HYSTERESIS 级内仍保留，避免缩放时闪烁 */
export const HYSTERESIS = 0.15
/** 点选飞行时的目标 L：至少让被选节点的公式和中文名都能显示，再加 FLY_EXTRA_L，上限 FLY_MAX_L */
export const FLY_EXTRA_L = 0.4
export const FLY_MAX_L = 4.0

/* ───────── 标签尺寸 ───────── */
/** 公式显示字号（等价 MathJax em，css px），按星等 / 猜想档
 *
 * 2026-11-01 调整第一档 19 → 15：实测总览（L=0）下 405 个星点挤在 677×662 px
 * 的中心区，而 19px 的公式标签宽 185–233px，放置器只能放下 19 条，达不到
 * "总览可读 40 条"的目标。缩小最高星等档的字号后标签更紧凑，同样的空间能放下更多。
 * 拉近后（L 增大）星等更低的档位字号不变，语义缩放与星图气质不受影响。 */
export const FORMULA_PX = [15, 14, 13, 12.5, 12, 11.5]
export const DSO_FORMULA_PX = [18, 16, 14.5]
export const FORMULA_MIN_PX = 10.5       // 长公式被压缩时的下限
export const LABEL_MAX_W = 360           // 公式标签最大宽度（css px），超出则缩小字号直到 FORMULA_MIN_PX；仍超出则按比例缩到此宽
export const NAME_PX = 12                // 中文名字号
export const RES_PX = 12.5               // 研究者名字字号
export const CONST_PX = 15               // 星座中文名字号（字间距 0.5em）
export const CONST_LATIN_PX = 9.5        // 拉丁名字号（字间距 0.35em）
export const HOUR_PX = 11                // 刻度环上赤经时数字字号
export const BAKE_PAD = 3                // 公式位图四周为晕边预留的 css px
export const LABEL_GAP = 4               // 标签与星点的间距（px）
export const LABEL_PAD = 2               // 碰撞盒外扩（px）
export const NAME_GAP = 1                // 公式与其下中文名之间的间距（px）

/* ───────── 时间 ───────── */
export const FADE_IN_MS = 180
export const FADE_OUT_MS = 120
export const ARC_GROW_MS = 380           // 选中后关联弧"画出来"的时长
export const FLY_MIN_MS = 420
export const FLY_MAX_MS = 1100
export const HASH_DEBOUNCE_MS = 400
export const BAKE_BUDGET_MS = 8          // 每帧用于 MathJax 排版的时间预算
export const BAKE_CONCURRENCY = 6        // 同时在解码中的 SVG <img> 数

/* ───────── 面板 ───────── */
export const PANEL_W = 400               // 桌面右侧面板宽（px）
export const SHEET_BREAKPOINT = 860      // 视口宽 < 此值时面板改为底部抽屉
export const SHEET_VH = 0.46             // 底部抽屉高度占视口比例

/** 原星云应用的深链：在原应用中打开某个节点（格式见 src/urlState.js：v1&n=<id>） */
export const nebulaLink = (id) => `/#v1&n=${encodeURIComponent(id)}`
