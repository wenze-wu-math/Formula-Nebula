/**
 * designs/manuscript/constants.js — 方案 D「公式诗稿」的跨模块设计常量（冻结文件，建造者只读）。
 *
 * 只放**两个以上模块共同依赖**的东西：配色、字体栈、语义缩放阈值、章节元数据、符号系统。
 * 某个模块私有的尺寸（例如 layout 的栏宽、行距）写在该模块自己的文件里，不要加到这里。
 * 改这里等于改契约 —— 见 SPEC.md §3。
 *
 * 坐标约定：世界坐标单位 = "世界像素"（zoom = 1 时 1 世界单位 = 1 CSS px），y 向下。
 */

import { FAMILIES, CONJECTURE_STATUS } from '../shared/kb.js'

export const DESIGN_ID = 'manuscript'

/* ───────── 配色（全部在米黄纸上校过对比度，括号内为与 paper 的对比度） ───────── */
export const PALETTE = {
  desk: '#cdc2a8',          // 书桌（页面之外）——比纸深一档，让纸页"浮"出来
  deskDeep: '#b8ab8e',      // 书桌暗角 / 纹理
  paper: '#f6f0e1',         // 纸面
  paperEdge: '#e8ddc4',     // 纸边泛黄
  paperShadow: 'rgba(58,42,18,.30)',
  fiber: 'rgba(120,96,58,.10)',
  ink: '#1b1712',           // 印刷墨（公式、正文）≈ 16:1
  ink2: '#463e33',          // 次级墨（名称旁注、段落）≈ 10:1
  ink3: '#776c5c',          // 三级（行号、拉丁副题、页眉）≈ 4.7:1
  rubric: '#a3291b',        // 朱墨（章号、首字、选中圈注）≈ 6.6:1
  rubricSoft: 'rgba(163,41,27,.14)',
  pencil: '#55524c',        // 铅笔（关联线、批注字）≈ 7:1
  pencilSoft: 'rgba(72,69,63,.32)',
  noteInk: '#1f3a5c',       // 页边手书（猜想）蓝黑墨 ≈ 10:1
  noteInk2: '#4b6383',
  highlight: 'rgba(238,196,72,.48)',   // 检索命中的荧光笔
  seal: '#b3322a',          // 研究者朱印
  sealText: '#f8f1e2',
  rule: 'rgba(110,90,60,.38)',         // 版框细线
}

/* ───────── 字体栈（全部是 Windows / macOS 系统字体，不加载网络字体） ─────────
 * serif：拉丁字母先走 Georgia（老式数字、斜体好看），汉字落到思源宋体 / 宋体。
 * hand ：页边手书与铅笔批注。拉丁字母走 Segoe Print（手写体），汉字逐字回退到楷体；
 *        不用 italic：楷体没有斜体，Chrome 会合成难看的假斜体。
 * italic：拉丁副题、行号、页码（Georgia Italic）。 */
export const FONTS = {
  serif: 'Georgia, "Noto Serif SC", "Source Han Serif SC", "Songti SC", SimSun, serif',
  hand: '"Segoe Print", "Bradley Hand", KaiTi, STKaiti, "Kaiti SC", "Noto Serif SC", serif',
  italic: 'Georgia, "Times New Roman", "Noto Serif SC", serif',
  mono: '"Cascadia Code", Consolas, monospace',
}

/** 组装 canvas / CSS 的 font 字符串。layout 量宽与 render 绘制必须用同一个函数，否则量出来的宽度不准。 */
export function fontCss(family, sizePx, weight = 400, style = 'normal') {
  return `${style} ${weight} ${Math.max(0.5, sizePx).toFixed(2)}px ${FONTS[family] || FONTS.serif}`
}

/* ───────── 语义缩放（以"屏幕上的字号像素"为准，而不是全局 zoom） ─────────
 * emPx = 该字在屏幕上的 em 大小：文字 = size * z；公式 = formula.scale * TEX_EM * z。
 *   emPx < HIDE_PX               不画
 *   HIDE_PX ≤ emPx < GREEK_PX    "灰条"：最小 mip 位图或圆角墨条（像远看的一行字）
 *   GREEK_PX ≤ emPx < LEGIBLE_PX 真字，透明度从 0.55 线性升到 1
 *   emPx ≥ LEGIBLE_PX            满墨，计入 stats().visibleLabels */
export const TEX_EM = 64          // tex.js 的 FONT_SIZE：公式 SVG 的 1 em = 64 MathJax px
export const LOD = {
  HIDE_PX: 1.2,
  GREEK_PX: 4.5,
  LEGIBLE_PX: 9,
  GREEK_ALPHA: 0.42,              // 灰条的墨色透明度
  FADE_FROM_ALPHA: 0.55,
}

/** 全局层级（只用于 UI 显示"全卷/章节/诗句"与少量整体淡入淡出） */
export const LOD_LEVELS = [
  { id: 'volume', name: '全卷', below: 0.2 },
  { id: 'chapter', name: '章节', below: 0.45 },
  { id: 'verse', name: '诗句', below: Infinity },
]
export function lodLevel(z) { return LOD_LEVELS.find((l) => z < l.below) }

export const ZOOM = {
  MIN_FACTOR: 0.8,     // 最小 zoom = 全卷适配 zoom × 0.8
  MAX: 3.2,
  READING: 0.62,       // 兜底的阅读 zoom（条目没有公式时用）
  READ_EM_PX: 26,      // 选中 / 定位时让该条公式的屏幕 em ≈ 26px（readingZoom()，SPEC §8.3）
  READ_MIN: 0.35,      // readingZoom 的下限 / 上限
  READ_MAX: 1.6,
  WHEEL_STEP: 1.0018,  // zoom *= WHEEL_STEP ** (-deltaY)
}

/** 关联线标签（选中时曲线中点的手写小字）出现所需的最小 zoom */
export const LINK_LABEL_MIN_Z = 0.42

/** 章际"丝线"（全卷视图的聚合关联弧）与栏内铅笔弧的淡入淡出区间 [全显, 全隐] / [开始, 全显] */
export const THREADS_FADE = [0.16, 0.26]
export const AMBIENT_FADE = [0.22, 0.34]

/* ───────── 章节：8 个知识族 = 8 章，按"教科书顺序"排列 ─────────
 * 顺序取舍：没有按跨族关联数最优化（试算过，最优序只比教学序多 ~6% 相邻关联），
 * 而是按读者熟悉的课程顺序：交换代数 → 概形 → 态射 → 上同调 → 相交 → 曲线曲面 → 双有理 → 现代。
 * 一本书的章序应当可预期。版面：10 页排成 5×2 —— 卷首、I–IV ／ V–VIII、题跋（SPEC §4.1）。 */
export const CHAPTER_ORDER = ['foundation', 'scheme', 'map', 'cohomology', 'intersect', 'curve', 'birational', 'modern']
export const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X']

const CH_META = {
  foundation: { latin: 'Commutative Algebra & Foundations', short: '基础' },
  scheme: { latin: 'Schemes & Sheaves', short: '概形' },
  map: { latin: 'Morphisms & Singularities', short: '态射' },
  cohomology: { latin: 'Cohomology', short: '上同调' },
  intersect: { latin: 'Intersection & Characteristic Classes', short: '相交' },
  curve: { latin: 'Curves & Surfaces', short: '曲线' },
  birational: { latin: 'Birational Geometry & MMP', short: '双有理' },
  modern: { latin: 'Moduli & Modern Themes', short: '现代' },
}

/** CHAPTERS[i] = { key, index, roman, name(中文族名), latin, short } */
export const CHAPTERS = CHAPTER_ORDER.map((key, index) => ({
  key, index, roman: ROMAN[index], name: FAMILIES[key].name, ...CH_META[key],
}))
export const CHAPTER_BY_KEY = Object.fromEntries(CHAPTERS.map((c) => [c.key, c]))

/** 卷末"题跋"页（研究者）与卷首（扉页）的元数据，供 rail / 面板显示 */
export const COLOPHON = { key: 'colophon', roman: '跋', name: '题跋 · 署名', latin: 'Colophon', short: '题跋' }
export const FRONT = { key: 'front', roman: '首', name: '卷首', latin: 'Frontispiece', short: '卷首' }

/* ───────── 猜想状态：手写符号系统 ─────────
 * 符号用 hand 字体手写在页边批注之前；颜色是"批注墨"而非原星云的霓虹色。 */
export const STATUS_GLYPH = {
  open: { glyph: '?', color: '#a3291b', name: CONJECTURE_STATUS.open.name, hint: CONJECTURE_STATUS.open.hint },
  partial: { glyph: '½', color: '#9a6a12', name: CONJECTURE_STATUS.partial.name, hint: CONJECTURE_STATUS.partial.hint },
  proved: { glyph: '✓', color: '#2f6b3a', name: CONJECTURE_STATUS.proved.name, hint: CONJECTURE_STATUS.proved.hint },
  disproved: { glyph: '✗', color: '#7a1f3d', name: CONJECTURE_STATUS.disproved.name, hint: CONJECTURE_STATUS.disproved.hint },
  heuristic: { glyph: '~', color: '#33508a', name: CONJECTURE_STATUS.heuristic.name, hint: CONJECTURE_STATUS.heuristic.hint },
}
export function statusGlyph(status) { return STATUS_GLYPH[status] || STATUS_GLYPH.open }

/* ───────── 研究者朱印：印文 = 领域首字 ───────── */
export const FIELD_SEAL = { ag: '几', arith: '数', topo: '拓', algebra: '代', analysis: '析', logic: '逻' }

/* ───────── 关系线型（铅笔批注的笔法）─────────
 * 不用颜色区分关系类型（铅笔只有一种颜色），改用笔法：
 *   solid 单线 / double 双线 / arrow 带箭头 / dashed 虚线 / dotted 点线 / wavy 波浪线
 * related（未分类）用最轻的单线。 */
export const LINK_STROKE = {
  equivalent: 'double',
  defines: 'solid',
  implies: 'arrow',
  generalizes: 'arrow',
  computes: 'solid',
  property: 'solid',
  depends: 'arrow',
  sameFamily: 'dotted',
  contrast: 'wavy',
  provenance: 'dotted',
  analogy: 'dashed',
  related: 'solid',
}

/* ───────── 界面框架尺寸（CSS px）—— ui.js 的 CSS 与 camera 的可见区计算共用 ───────── */
export const CHROME = {
  TOP: 56,          // 顶栏高度
  RAIL: 64,         // 左侧书签栏宽度
  PANEL: 420,       // 右侧注释页宽度（打开时）
  FIT_MARGIN: 28,   // 适配时四周留白
}

/** 原星云深链（只读约定，见 src/urlState.js）：'/#v1&n=<id>' */
export function nebulaLink(id) { return `/#v1&n=${encodeURIComponent(id)}` }
