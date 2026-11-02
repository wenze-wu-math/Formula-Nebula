/**
 * designs/manuscript/render-text.js — 文字语义缩放与"本帧可读标签"簿记（M3 私有，供 render*.js 使用）。
 *
 * 取舍：
 *   · LOD 逐项按屏幕字号 emPx = size·z 决定（SPEC §2.2）：不画 / 墨条 / 淡入真字 / 满墨。
 *     ink3 级小字（行号、页眉、拉丁副题）真字要求 emPx ≥ 7 —— 6px 的灰色小字只会是噪点，墨条反而像"远看一行字"。
 *   · 全卷视图（z < 0.2）下诗句名称与正文一律画墨条（SPEC §6.3 性能条款）：省掉几百次 fillText，也让版面更整齐。
 *   · fillText 带 maxWidth = 量出的宽度 + 1：即使系统字体回退导致字形略宽，字也被压在 layout 给的矩形里，
 *     世界坐标不相交 ⇒ 屏幕上不相交 这一保证不会被字体差异打破。
 *   · 只有以 ≥ LEGIBLE_PX 画出的字才登记进 F.labels（屏幕矩形 = runRect 经均匀缩放），本帧末交给 countOverlaps。
 */
import { LOD, PALETTE, fontCss } from './constants.js'

export const clamp = (v, a, b) => (v < a ? a : v > b ? b : v)
export function smoothstep(a, b, x) { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t) }

/* 字体串缓存：字号量化到 1/8 px，键 = family|size|weight|style */
const fontCache = new Map()
export function font(family, px, weight = 400, style = 'normal') {
  const q = Math.round(px * 8) / 8
  const k = family + '|' + q + '|' + weight + '|' + style
  let f = fontCache.get(k)
  if (f === undefined) {
    if (fontCache.size > 4000) fontCache.clear()
    f = fontCss(family, q, weight, style)
    fontCache.set(k, f)
  }
  return f
}

/** 全卷视图下只画墨条的角色（诗句名称与正文类） */
const FAR_BAR = new Set(['name', 'name-core', 'sub', 'para', 'note-name', 'sign-name', 'sign-inst', 'sign-focus',
  'colophon', 'stanza', 'lineno', 'ref', 'epi-attr'])

/** 圆角墨条（cy = 条的中线） */
export function inkBar(ctx, x, cy, w, h) {
  w = Math.max(0.6, w); h = Math.max(0.6, h)
  if (h < 1.8 || !ctx.roundRect) { ctx.fillRect(x, cy - h / 2, w, h); return }
  ctx.beginPath()
  ctx.roundRect(x, cy - h / 2, w, h, h / 2)
  ctx.fill()
}

/** 登记一个本帧可读标签的屏幕矩形；tag 只在报告重叠对时才转成字符串 */
export function addLabel(F, x, y, w, h, tag) {
  F.labels.push({ x, y, w, h })
  F.tags.push(tag)
}

/** 屏幕矩形 r 是否与本帧已登记的可读标签都不相交（各外扩 1px），且整个落在可见区内 */
export function fitsFree(F, r) {
  const v = F.vr
  if (r.x < v.x || r.y < v.y || r.x + r.w > v.x + v.w || r.y + r.h > v.y + v.h) return false
  for (const l of F.labels) {
    if (r.x - 1 < l.x + l.w && r.x + r.w + 1 > l.x && r.y - 1 < l.y + l.h && r.y + r.h + 1 > l.y) return false
  }
  return true
}

/**
 * 按 LOD 画一个 TextRun。aMul = 条目级透明度（检索压暗、选中压暗）。
 * 返回 0 = 没画，1 = 墨条，2 = 淡入真字，3 = 满墨真字。
 */
export function drawRun(F, r, aMul = 1, tag = r) {
  if (!r || !r.text) return 0
  const z = F.z, em = r.size * z
  if (em < LOD.HIDE_PX || aMul <= 0.005) return 0
  const ctx = F.ctx
  const w = r.w * z
  const ax = r.x * z + F.tx, by = r.y * z + F.ty
  const lx = r.align === 'center' ? ax - w / 2 : r.align === 'right' ? ax - w : ax
  const minReal = r.color === PALETTE.ink3 ? 7 : LOD.GREEK_PX
  if (em < minReal || (F.far && FAR_BAR.has(r.role))) {
    ctx.globalAlpha = aMul * LOD.GREEK_ALPHA
    ctx.fillStyle = r.color || PALETTE.ink
    inkBar(ctx, lx, by - em * 0.33, w, em * 0.42)
    return 1
  }
  const legible = em >= LOD.LEGIBLE_PX
  const a = legible ? 1 : LOD.FADE_FROM_ALPHA + (1 - LOD.FADE_FROM_ALPHA) * (em - minReal) / Math.max(0.01, LOD.LEGIBLE_PX - minReal)
  ctx.globalAlpha = aMul * a
  ctx.font = font(r.family, em, r.weight || 400, r.style || 'normal')
  ctx.fillStyle = r.color || PALETTE.ink
  ctx.textAlign = r.align || 'left'
  ctx.fillText(r.text, ax, by, w + 1)
  if (legible && r.label !== false) addLabel(F, lx, by - r.size * 0.86 * z, w, r.size * 1.1 * z, tag)
  return legible ? 3 : 2
}

/** 屏幕矩形描述（重叠对调试输出用） */
export function tagText(t) {
  if (!t) return '?'
  if (typeof t === 'string') return t
  if (t.itemId) return `${t.itemId}:${t.role}`
  if (t.text !== undefined) return `${t.role || 'text'}:${String(t.text).slice(0, 14)}`
  if (t.id) return `${t.id}:formula`
  return '?'
}
