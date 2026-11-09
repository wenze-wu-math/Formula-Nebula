/**
 * designs/manuscript/render-deco.js — 版式装饰（M3 私有）：版框细线 rules、花饰 ornaments、卷首图例 legend。
 *
 * 装饰字符不用 ❦ ⁂ 等 Unicode 字形（系统字体覆盖不一，回退字形大小不可控），全部程序绘制：
 *   fleuron = 常春藤叶 + 卷须；asterism = 三颗六芒小星排成三角；tailpiece = 对称卷草 + 中央菱形；frame = 「诗稿」大印。
 * 装饰不是文字，不参与重叠统计。
 */
import { PALETTE, STATUS_GLYPH, FIELD_SEAL } from './constants.js'
import { sealStamp, statusMark, strokeSample, dottedLeader } from './pencil.js'
import { clamp } from './render-text.js'

const TAU = Math.PI * 2

/** Rule：solid / hair 单线；double 为"文武线"——上粗下细两条 */
export function drawRule(F, r) {
  const ctx = F.ctx, z = F.z
  const x0 = r.x0 * z + F.tx, y0 = r.y0 * z + F.ty, x1 = r.x1 * z + F.tx, y1 = r.y1 * z + F.ty
  ctx.strokeStyle = r.color || PALETTE.rule
  ctx.lineCap = 'butt'
  const line = (dy, w) => {
    const ww = Math.max(0.5, w)
    ctx.globalAlpha = w < 0.5 ? Math.max(0.25, w / 0.5) : 1
    ctx.lineWidth = ww
    ctx.beginPath(); ctx.moveTo(x0, y0 + dy); ctx.lineTo(x1, y1 + dy); ctx.stroke()
  }
  if (r.style === 'double') {
    const gap = Math.max(1.6, (r.width || 4) * z * 1.6)
    line(-gap / 2, Math.max(0.9, (r.width || 4) * z * 0.75))
    line(gap / 2, Math.max(0.5, (r.width || 4) * z * 0.3))
  } else {
    line(0, (r.width || 1) * z)
  }
}

/* ───────── 花饰 ───────── */
function fleuron(ctx, x, y, w, h, color) {
  const s = Math.min(w, h)
  const cx = x + w / 2, cy = y + h / 2
  ctx.fillStyle = color
  if (s < 5) { ctx.beginPath(); ctx.arc(cx, cy, s * 0.3, 0, TAU); ctx.fill(); return }
  // 常春藤叶（心形，尖端朝右下），左上一条卷须
  ctx.save()
  ctx.translate(cx, cy); ctx.rotate(-0.5)
  const r = s * 0.42
  ctx.beginPath()
  ctx.moveTo(r * 0.95, 0)
  ctx.bezierCurveTo(r * 0.35, -r * 0.35, -r * 0.1, -r * 1.05, -r * 0.55, -r * 0.55)
  ctx.bezierCurveTo(-r * 0.85, -r * 0.25, -r * 0.6, -r * 0.02, -r * 0.35, 0)
  ctx.bezierCurveTo(-r * 0.6, r * 0.02, -r * 0.85, r * 0.25, -r * 0.55, r * 0.55)
  ctx.bezierCurveTo(-r * 0.1, r * 1.05, r * 0.35, r * 0.35, r * 0.95, 0)
  ctx.fill()
  ctx.strokeStyle = color
  ctx.lineWidth = Math.max(0.6, s * 0.06)
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(-r * 0.4, 0)
  ctx.bezierCurveTo(-r * 1.0, 0, -r * 1.25, r * 0.4, -r * 0.95, r * 0.7)
  ctx.quadraticCurveTo(-r * 0.75, r * 0.85, -r * 0.65, r * 0.65)
  ctx.stroke()
  ctx.restore()
}

function star(ctx, cx, cy, r) {
  ctx.beginPath()
  for (let i = 0; i < 12; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 6
    const rr = i % 2 ? r * 0.42 : r
    if (i) ctx.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); else ctx.moveTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr)
  }
  ctx.closePath(); ctx.fill()
}

/** ⁂：三颗小星排成倒三角（两上一下）——诗节之间 */
function asterism(ctx, x, y, w, h, color) {
  ctx.fillStyle = color
  const r = Math.min(w / 6, h / 4.2)
  if (r < 0.8) { ctx.fillRect(x + w * 0.3, y + h / 2 - 0.4, w * 0.4, 0.8); return }
  const cx = x + w / 2, cy = y + h / 2
  star(ctx, cx - r * 1.35, cy - r * 0.75, r)
  star(ctx, cx + r * 1.35, cy - r * 0.75, r)
  star(ctx, cx, cy + r * 1.1, r)
}

/** 章末 tailpiece：中央菱形 + 两侧对称的卷草线 + 末端小圆点 */
function tailpiece(ctx, x, y, w, h, color) {
  const cx = x + w / 2, cy = y + h / 2
  ctx.fillStyle = color; ctx.strokeStyle = color
  ctx.lineCap = 'round'
  const s = h / 2
  ctx.beginPath()
  ctx.moveTo(cx, cy - s * 0.55); ctx.lineTo(cx + s * 0.32, cy); ctx.lineTo(cx, cy + s * 0.55); ctx.lineTo(cx - s * 0.32, cy); ctx.closePath()
  ctx.fill()
  ctx.lineWidth = Math.max(0.6, h * 0.035)
  for (const d of [-1, 1]) {
    const x0 = cx + d * s * 0.45
    ctx.beginPath()
    ctx.moveTo(x0, cy)
    ctx.bezierCurveTo(x0 + d * w * 0.12, cy - s * 0.9, x0 + d * w * 0.22, cy + s * 0.75, x0 + d * w * 0.3, cy)
    ctx.bezierCurveTo(x0 + d * w * 0.34, cy - s * 0.35, x0 + d * w * 0.4, cy - s * 0.3, x0 + d * w * 0.42, cy - s * 0.05)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(x0 + d * w * 0.06, cy + s * 0.08)
    ctx.quadraticCurveTo(x0 + d * w * 0.12, cy + s * 0.6, x0 + d * w * 0.2, cy + s * 0.35)
    ctx.stroke()
    ctx.beginPath(); ctx.arc(x0 + d * w * 0.445, cy - s * 0.02, Math.max(0.7, h * 0.05), 0, TAU); ctx.fill()
  }
}

/** Ornament：sw = 屏幕宽 */
export function drawOrnament(F, o) {
  const ctx = F.ctx, z = F.z
  const x = o.x * z + F.tx, y = o.y * z + F.ty, w = o.w * z, h = o.h * z
  const color = o.color || PALETTE.ink3
  ctx.globalAlpha = 1
  if (o.kind === 'leader') {
    if (w < 6) return
    const step = clamp(18 * z, 2.4, 10), dot = clamp(2.6 * z, 0.6, 1.6)
    dottedLeader(ctx, x, x + w, y, { color, step, dot, alpha: F.far ? 0.6 : 0.9 })
    return
  }
  if (Math.max(w, h) < 2.5) return
  if (o.kind === 'fleuron') fleuron(ctx, x, y, w, h, color)
  else if (o.kind === 'asterism') asterism(ctx, x, y, w, h, color)
  else if (o.kind === 'tailpiece') tailpiece(ctx, x, y, w, h, color)
  else if (o.kind === 'frame') sealStamp(ctx, x, y, Math.min(w, h), o.text || '诗稿', o.seed || 1, { color: o.color || PALETTE.seal })
}

/** 卷首图例的示例图元（文字在 layout.texts 里） */
export function drawLegend(F, e, _statusOf) {
  const ctx = F.ctx, z = F.z
  const r = e.rect
  const x = r.x * z + F.tx, y = r.y * z + F.ty, w = r.w * z, h = r.h * z
  ctx.globalAlpha = 1
  if (e.kind === 'status') {
    const size = h * 0.95
    if (size < 3) return
    const g = STATUS_GLYPH[e.key]
    if (size < 6) { ctx.fillStyle = g ? g.color : PALETTE.ink; ctx.beginPath(); ctx.arc(x + w / 2, y + h * 0.6, Math.max(0.8, size * 0.18), 0, TAU); ctx.fill(); return }
    statusMark(ctx, x + w / 2, y + h * 0.86, size, e.key, { align: 'center' })
  } else if (e.kind === 'stroke') {
    if (w < 10) return
    strokeSample(ctx, x, y + h * 0.6, w, e.key, 4000 + e.key.length * 13, { width: clamp(z * 9, 0.7, 1.8) })
  } else if (e.kind === 'seal') {
    if (w < 3) return
    sealStamp(ctx, x, y, Math.min(w, h), FIELD_SEAL[e.key] || '印', 5150, {})
  }
  // tier：示例文字本身就是图例（layout.texts 里的不同字号的行），无需额外图元
}
