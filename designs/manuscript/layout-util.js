/**
 * designs/manuscript/layout-util.js — M1 排版的私有几何常量与小工具（只被 layout*.js 引用）。
 *
 * 取舍：所有尺寸都在"世界 px"下给出，按 1600×1000 全卷适配 zoom≈0.12 反推：
 *   题记 em 88 → 屏幕 ~10.5px（≥ LEGIBLE_PX 9，全卷可读）；章题 150 → ~18px；诗句 em 22–40 在全卷只是灰行。
 * 页尺寸 2000×3400、页距 180：5×2 铺开后全卷 10720×6980（含 ~200 留白 11120×7380），宽高比 1.51，
 * 与可见区 1536×944（1.63）接近，适配时由高度决定 zoom。
 */
import { fontCss, PALETTE } from './constants.js'

/* ───────── 页面网格 ───────── */
export const G = {
  PAGE_W: 2160, PAGE_H: 3400, GAP: 160, BLEED: 180,
  PAD_L: 150, PAD_R: 100, PAD_T: 120, PAD_B: 150,
  MARGIN_W: 360,          // 外侧页边（批注区）宽
  MARGIN_GAP: 50,         // 正文与页边之间
  COL_GAP: 60,            // 两栏之间
  ARC_W: 64,              // 栏内弧区（弧向左鼓出 ≤ 60）
  NUM_W: 40,              // 行号区
  NUM_GAP: 12,            // 行号区与公式之间
}
// 正文宽 = 2000 − 150 − 110 − 380 − 60 = 1300；每栏 (1300 − 60)/2 = 620；栏内公式区 620 − 64 − 40 − 12 = 504
G.TEXT_W = G.PAGE_W - G.PAD_L - G.PAD_R - G.MARGIN_W - G.MARGIN_GAP
G.COL_W = (G.TEXT_W - G.COL_GAP) / 2
G.CONTENT_OFF = G.ARC_W + G.NUM_W + G.NUM_GAP
G.CONTENT_W = G.COL_W - G.CONTENT_OFF

/* ───────── 诗句字号（SPEC §4.5）：核心 scale = CORE·k，普通 scale = (BASE + SPAN·rankInChapter)·k；k∈[K_MIN, K_MAX] ───────── */
export const F = { CORE: 0.56, BASE: 0.32, SPAN: 0.08, ROW_GAP: 14, K_MIN: 0.75, K_MAX: 1.5 }

/* ───────── 章页竖向节奏（相对页顶的偏移；全部是基线或线的 y） ───────── */
export const V = {
  RUNHEAD: 150,           // 页眉基线（italic 22）
  RUNHEAD_RULE: 172,      // 页眉下细线
  CHAPNUM: 340,           // 章号基线（120）
  TITLE: 520,             // 章题基线（150）
  LATIN: 606,             // 拉丁副题基线（52）
  DRULE: 652,             // 章题下双线
  PARA: 736,              // 导言首行基线（34，行距 1.75 → 59.5）
  FOLIO_FROM_BOTTOM: 70,  // 页码基线距页底
  BODY_BOTTOM_FROM_BOTTOM: 170, // 正文/页边的底边距页底
}

export const SIZE = {
  runhead: 22, folio: 28, chapnum: 120, title: 150, latin: 52, para: 34, paraLH: 1.75,
  epiEm: 88,              // 题记 em（世界 px）；TEX_EM=64 → scale 1.375
  epiAttr: 30, epiSub: 20,
  stanza: 30, lineno: 15, sub: 18,
  noteName: 22, noteGlyph: 40, noteLetter: 18, noteSub: 15, noteEmMax: 14,
  /* 题跋署名（SPEC §4.9 原为 sign 40 / signInst 18 / signFocus 17）。
   * 放大理由（纯 Node 版面预算，见 shots/designs/manuscript/_d_colophon_budget.mjs）：
   *   原 40 → 题跋页适配 zoom 0.2612 下姓名只有 10.45 屏幕 px，低于正文级可读的 12px 下限。
   *   56 → 14.63px（+40%）；机构 24 → 6.27px、方向 22 → 5.75px，保持 2.5 : 1.1 : 1 的字号阶梯。
   *   选中一条署名时相机到阅读 zoom 0.62，三者是 34.72 / 14.88 / 13.64px，全部 ≥ 12px。
   * 上限由版式反推：署名 24 条排 2 栏 × 12 行，行距 pitch ≈ 166 世界 px；
   *   本组署名块高 128.2 世界 px，同栏最小行间留白 38.1px，疏朗气质不变。
   *   再大一档（64/28/26）行间留白降到 20.4px 且出现 1 处布局重叠，故取 56。 */
  sign: 56, signInst: 24, signFocus: 22, seal: 72,
}

/* ───────── 量宽（带缓存：二分填充系数会反复量同一串字） ───────── */
export function makeMeasurer(measure) {
  const cache = new Map()
  return function m(family, size, weight, style, text) {
    const font = fontCss(family, size, weight, style)
    const key = font + '|' + text
    let w = cache.get(key)
    if (w === undefined) { w = measure(font, text); cache.set(key, w) }
    return w
  }
}

/** TextRun 构造（SPEC §4.2）。w 一律来自 measure，与 render 的 fontCss 一致。 */
export function mkRun(m, x, y, text, family, size, opt = {}) {
  const weight = opt.weight || 400, style = opt.style || (family === 'italic' ? 'italic' : 'normal')
  const r = {
    x, y, text, family, size, weight, style,
    color: opt.color || PALETTE.ink, align: opt.align || 'left',
    w: m(family, size, weight, style, text),
    role: opt.role || 'front', label: opt.label !== false,
  }
  if (opt.itemId) r.itemId = opt.itemId
  if (opt.hot) r.hot = opt.hot
  return r
}

/** 把文字截到 maxW 以内（超出时末尾加 …）。按"字素"截，拉丁词也逐字截（只用于名称、机构这类短串）。 */
export function fitText(m, family, size, weight, style, text, maxW) {
  if (m(family, size, weight, style, text) <= maxW) return text
  const chars = [...text]
  let lo = 0, hi = chars.length
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1
    if (m(family, size, weight, style, chars.slice(0, mid).join('').trimEnd() + '…') <= maxW) lo = mid
    else hi = mid - 1
  }
  return chars.slice(0, lo).join('').trimEnd() + '…'
}

/* ───────── 断行：汉字逐字、拉丁按词，避头点 ───────── */
const NO_START = new Set([...'，。、；：？！）」』》〉】,.;:?!)·…—'])
const NO_END = new Set([...'（「『《〈【('])
const CJK = /[⺀-鿿　-〿＀-￯]/

/** 切成断行单位：每个汉字/标点一个，连续拉丁字符（含数字、连字符）一个，空格单独一个 */
function tokens(text) {
  const out = []
  let buf = ''
  for (const ch of text) {
    if (ch === ' ') { if (buf) out.push(buf); buf = ''; out.push(' '); continue }
    if (CJK.test(ch) || NO_START.has(ch) || NO_END.has(ch)) { if (buf) out.push(buf); buf = ''; out.push(ch); continue }
    buf += ch
  }
  if (buf) out.push(buf)
  return out
}

/**
 * 按宽度断行。widthOf(i) 给出第 i 行的可用宽度（首字旁的行更窄）。
 * 避头点：行首若是「，。」之类，把上一行末一个单位一起挪下来；行尾若是「（「」，挪到下一行。
 */
export function wrapLines(m, family, size, weight, style, text, widthOf) {
  const tk = tokens(text)
  const lines = []
  let i = 0
  while (i < tk.length) {
    const maxW = widthOf(lines.length)
    let j = i, cur = ''
    while (j < tk.length) {
      const next = cur + tk[j]
      if (cur && m(family, size, weight, style, next.trimEnd()) > maxW) break
      cur = next; j++
    }
    // 避头：下一行首是禁则标点 → 本行退一个单位（至少留 2 个单位）
    while (j < tk.length && NO_START.has(tk[j]) && j - i > 2) { j--; cur = tk.slice(i, j).join('') }
    // 避尾：本行末是开括号 → 挪到下一行
    while (j - i > 2 && NO_END.has(tk[j - 1])) { j--; cur = tk.slice(i, j).join('') }
    lines.push(cur.trim())
    i = j
    while (i < tk.length && tk[i] === ' ') i++
  }
  return lines
}

/* ───────── 杂项 ───────── */
export function union(a, b) {
  if (!a) return b ? { ...b } : null
  if (!b) return { ...a }
  const x = Math.min(a.x, b.x), y = Math.min(a.y, b.y)
  return { x, y, w: Math.max(a.x + a.w, b.x + b.w) - x, h: Math.max(a.y + a.h, b.y + b.h) - y }
}

const CN_DIGIT = '〇一二三四五六七八九'
/** 1 → 一，10 → 十，12 → 十二，24 → 二十四，405 → 四百零五（够用到 999） */
export function cnNum(n) {
  if (n < 10) return CN_DIGIT[n]
  if (n < 20) return '十' + (n % 10 ? CN_DIGIT[n % 10] : '')
  if (n < 100) return CN_DIGIT[Math.floor(n / 10)] + '十' + (n % 10 ? CN_DIGIT[n % 10] : '')
  const h = Math.floor(n / 100), r = n % 100
  if (!r) return CN_DIGIT[h] + '百'
  return CN_DIGIT[h] + '百' + (r < 10 ? '零' + CN_DIGIT[r] : r < 20 ? '一' + cnNum(r) : cnNum(r))
}

/** 稳定的比较器：importance 降序，id 升序兜底（保证确定性） */
export function byImportance(a, b) { return b.importance - a.importance || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0) }

/** 节点 n 的边 l 的另一端 id */
export function otherEnd(l, id) { return l.source === id ? l.target : l.source }

/** 条目两侧的关联线端点：box 左右两侧中点外 10 世界 px */
export function anchorsOf(box) {
  const my = box.y + box.h / 2
  return { l: [box.x - 10, my], r: [box.x + box.w + 10, my] }
}

/** 文字行的矩形（与 geom.runRect 相同算法；此处为免循环依赖直接引用 geom） */
export { runRect } from './geom.js'
