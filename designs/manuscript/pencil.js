/**
 * designs/manuscript/pencil.js — 手绘笔触原语（模块 M3，SPEC §6.2）。
 *
 * 全部在**屏幕坐标**（CSS px）下绘制，线宽单位是屏幕 px。
 * 关键取舍：
 *   · 抖动是 seed 与曲线参数 t 的**确定性**光滑函数（三个正弦叠加），不是逐帧随机 —— 帧间不闪；
 *     又因为抖动只依赖 t 而不依赖屏幕长度，缩放时笔画形状整体伸缩，不会"游动"。
 *   · 两端 1/6 段内抖动渐收为 0，端点严格落在给定坐标上（箭头、圈注对得准）。
 *   · 石墨感用"两遍描画"：第二遍 alpha×0.5、细一点、偏 0.4px，而不是纹理笔刷（便宜、可预测）。
 *   · 只 import constants.js：M4 的界面会把 strokeSample / statusMark / sealStamp 画进自己的小 canvas，
 *     所以这里不得依赖 render 的任何内部状态；每个函数都 save/restore，不污染调用方的 ctx 状态。
 */
import { PALETTE, STATUS_GLYPH, fontCss } from './constants.js'

const TAU = Math.PI * 2
const DEG = Math.PI / 180
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v)

/** 字符串 → 32 位无符号整数种子（FNV-1a） */
export function seedOf(str) {
  const s = String(str)
  let h = 2166136261
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) }
  return h >>> 0
}

/** 由种子产生的确定性随机数生成器 () => [0,1)。先做一次 murmur 混合，避免相邻种子产生相关序列。 */
export function rng(seed) {
  let s = (seed >>> 0) ^ 0x9e3779b9
  s = Math.imul(s ^ (s >>> 16), 0x85ebca6b); s = Math.imul(s ^ (s >>> 13), 0xc2b2ae35); s = (s ^ (s >>> 16)) >>> 0
  if (!s) s = 0x6d2b79f5
  return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296 }
}

/** 光滑的确定性摆动函数 w(t) ∈ [-1, 1]：低频弯曲 + 中频 + 少量高频 */
function wobbler(seed) {
  const R = rng(seed)
  const f0 = 0.6 + R() * 1.1, f1 = 2.4 + R() * 2.2, f2 = 6 + R() * 5
  const p0 = R() * TAU, p1 = R() * TAU, p2 = R() * TAU
  return (t) => 0.6 * Math.sin(f0 * TAU * t + p0) + 0.28 * Math.sin(f1 * TAU * t + p1) + 0.12 * Math.sin(f2 * TAU * t + p2)
}

/* ───────── 贝塞尔求值（c = [x0,y0,x1,y1,x2,y2] 二次 或 [.., x3,y3] 三次） ───────── */
const _o = [0, 0, 0, 0]
function evalBez(c, t, out) {
  const u = 1 - t
  if (c.length === 6) {
    out[0] = u * u * c[0] + 2 * u * t * c[2] + t * t * c[4]
    out[1] = u * u * c[1] + 2 * u * t * c[3] + t * t * c[5]
    out[2] = 2 * (u * (c[2] - c[0]) + t * (c[4] - c[2]))
    out[3] = 2 * (u * (c[3] - c[1]) + t * (c[5] - c[3]))
  } else {
    const a = u * u * u, b = 3 * u * u * t, d = 3 * u * t * t, e = t * t * t
    out[0] = a * c[0] + b * c[2] + d * c[4] + e * c[6]
    out[1] = a * c[1] + b * c[3] + d * c[5] + e * c[7]
    out[2] = 3 * (u * u * (c[2] - c[0]) + 2 * u * t * (c[4] - c[2]) + t * t * (c[6] - c[4]))
    out[3] = 3 * (u * u * (c[3] - c[1]) + 2 * u * t * (c[5] - c[3]) + t * t * (c[7] - c[5]))
  }
  return out
}

/** 曲线长度估计：(弦长 + 控制多边形长) / 2 */
function estLen(c) {
  const n = c.length
  let poly = 0
  for (let i = 2; i < n; i += 2) poly += Math.hypot(c[i] - c[i - 2], c[i + 1] - c[i - 1])
  return (poly + Math.hypot(c[n - 2] - c[0], c[n - 1] - c[1])) / 2
}

/**
 * 沿曲线采样（~每 6px 一点），每点沿法向偏移 jitter·w(t)·包络；wavy 时再叠加按弧长的正弦波。
 * 返回 { n, xs, ys, nx, ny }：抖动后的点与法向（double 线型沿法向再偏移）。
 */
function sampleCurve(c, len, seed, jitter, wavy) {
  const n = clamp(Math.ceil(len / 6), 6, 220)
  const w = wobbler(seed)
  const xs = new Float32Array(n + 1), ys = new Float32Array(n + 1), nxs = new Float32Array(n + 1), nys = new Float32Array(n + 1)
  const chx = c[c.length - 2] - c[0], chy = c[c.length - 1] - c[1]
  const chl = Math.hypot(chx, chy) || 1
  for (let i = 0; i <= n; i++) {
    const t = i / n
    evalBez(c, t, _o)
    let tx = _o[2], ty = _o[3]
    let tl = Math.hypot(tx, ty)
    if (tl < 1e-6) { tx = chx; ty = chy; tl = chl }   // 控制点与端点重合时导数为 0：退回弦方向
    const nx = -ty / tl, ny = tx / tl
    const env = Math.min(1, t * 6, (1 - t) * 6)
    let off = jitter * w(t) * env
    if (wavy) off += wavy.amp * Math.sin((t * len / wavy.wl) * TAU) * Math.min(1, (t * len) / 6, ((1 - t) * len) / 6)
    xs[i] = _o[0] + nx * off; ys[i] = _o[1] + ny * off; nxs[i] = nx; nys[i] = ny
  }
  return { n, xs, ys, nx: nxs, ny: nys }
}

function tracePolyline(ctx, S, off, dx, dy) {
  ctx.beginPath()
  ctx.moveTo(S.xs[0] + S.nx[0] * off + dx, S.ys[0] + S.ny[0] * off + dy)
  for (let i = 1; i <= S.n; i++) ctx.lineTo(S.xs[i] + S.nx[i] * off + dx, S.ys[i] + S.ny[i] * off + dy)
  ctx.stroke()
}

/** 一遍主笔 + 一遍石墨（alpha×0.5、偏移 0.4px） */
function graphite(ctx, S, off, width, alpha) {
  const a0 = ctx.globalAlpha
  ctx.lineWidth = width
  tracePolyline(ctx, S, off, 0, 0)
  ctx.globalAlpha = a0 * 0.5
  ctx.lineWidth = Math.max(0.5, width * 0.7)
  tracePolyline(ctx, S, off, 0.4, 0.35)
  ctx.globalAlpha = a0
}

/** 曲线的核心绘制：按 opt.style 选择笔法 */
function drawCurve(ctx, c, seed, opt) {
  const len = estLen(c)
  if (!(len >= 1.5)) return
  const style = opt.style || 'solid'
  const width = opt.width ?? 1.2
  const color = opt.color || PALETTE.pencil
  const jitter = opt.jitter ?? 0.8
  const wavy = style === 'wavy' ? { amp: 1.6 + width * 0.35, wl: 9 + width * 1.5 } : null
  const S = sampleCurve(c, len, seed >>> 0, jitter, wavy)
  ctx.save()
  ctx.globalAlpha *= opt.alpha ?? 0.7
  ctx.strokeStyle = color
  ctx.lineCap = 'round'; ctx.lineJoin = 'round'
  if (style === 'double') {
    const g = width * 0.85 + 0.8
    graphite(ctx, S, -g, width * 0.85, 1)
    graphite(ctx, S, g, width * 0.85, 1)
  } else if (style === 'dashed') {
    ctx.setLineDash([6 + width * 1.5, 4.5 + width])
    graphite(ctx, S, 0, width, 1)
    ctx.setLineDash([])
  } else if (style === 'dotted') {
    ctx.setLineDash([0.001, Math.max(3.4, width * 3.2)])
    ctx.lineWidth = width * 1.7
    tracePolyline(ctx, S, 0, 0, 0)
    ctx.setLineDash([])
  } else {
    graphite(ctx, S, 0, width, 1)
  }
  if (style === 'arrow') {
    const k = Math.max(0, S.n - 2)
    const ang = Math.atan2(S.ys[S.n] - S.ys[k], S.xs[S.n] - S.xs[k])
    arrowHead(ctx, S.xs[S.n], S.ys[S.n], ang, opt.arrowSize ?? clamp(6 + width * 2.4, 6, 13), { color, width: width * 1.05, seed: seed + 17 })
  }
  ctx.restore()
}

/** 二次曲线铅笔线。opt: {color, alpha(0.7), width(1.2), jitter(0.8), style('solid'|'double'|'arrow'|'dashed'|'dotted'|'wavy')} */
export function pencilCurve(ctx, x0, y0, cx, cy, x1, y1, seed, opt = {}) {
  drawCurve(ctx, [x0, y0, cx, cy, x1, y1], seed, opt)
}

/** 三次曲线铅笔线（选中时的跨栏 / 跨页关联线） */
export function pencilCubic(ctx, x0, y0, c1x, c1y, c2x, c2y, x1, y1, seed, opt = {}) {
  drawCurve(ctx, [x0, y0, c1x, c1y, c2x, c2y, x1, y1], seed, opt)
}

/**
 * 围住屏幕矩形 (x,y,w,h) 的手绘圈注。
 * 形状取超椭圆（n=3.2）而非椭圆：同样外扩量下，宽扁的公式行四角也能被圈进去，又不像矩形框。
 * 起笔在左上（~200°–250°），转一整圈再多走 16°–30°，且半径随转角外扩几 px → 起收笔错开。
 * 线宽在两端渐细（分 10 段描），像毛笔 / 蘸水笔的落笔与提笔。
 * opt: {pad(8), double(true), width(2), color(rubric), alpha(0.9)}
 */
export function inkEllipse(ctx, x, y, w, h, seed, opt = {}) {
  const pad = opt.pad ?? 8
  const width = opt.width ?? 2
  const cx = x + w / 2, cy = y + h / 2
  const rx = (w / 2) * 1.04 + pad, ry = (h / 2) * 1.12 + pad
  ctx.save()
  ctx.globalAlpha *= opt.alpha ?? 0.9
  ctx.strokeStyle = opt.color || PALETTE.rubric
  ctx.lineCap = 'round'; ctx.lineJoin = 'round'
  loop(seed >>> 0, 0)
  if (opt.double ?? true) loop((seed ^ 0x5bd1e995) >>> 0, 2.2 + width * 1.1)
  ctx.restore()

  function loop(sd, grow) {
    const R = rng(sd)
    const start = (200 + R() * 50) * DEG
    const sweep = TAU + (16 + R() * 14) * DEG
    const tilt = (R() - 0.5) * 0.02
    const ct = Math.cos(tilt), st = Math.sin(tilt)
    const wob = wobbler(sd + 3)
    const sep = 2.5 + width
    const perim = Math.PI * (rx + ry) * 1.1
    const n = clamp(Math.round(perim / 4), 28, 170)
    const px = new Float32Array(n + 1), py = new Float32Array(n + 1)
    for (let i = 0; i <= n; i++) {
      const f = i / n
      const th = start + sweep * f
      const c = Math.cos(th), s = Math.sin(th)
      const ex = Math.sign(c) * Math.pow(Math.abs(c), 0.625), ey = Math.sign(s) * Math.pow(Math.abs(s), 0.625)
      const d = grow + f * sep + 1.6 * wob(f)
      const ux = (rx + d) * ex, uy = (ry + d) * ey
      px[i] = cx + ux * ct - uy * st; py[i] = cy + ux * st + uy * ct
    }
    const K = 10
    for (let k = 0; k < K; k++) {
      const i0 = Math.floor((k * n) / K), i1 = Math.floor(((k + 1) * n) / K)
      const fm = (k + 0.5) / K
      ctx.lineWidth = Math.max(0.5, width * Math.min(1, 0.3 + fm * 4.5, 0.3 + (1 - fm) * 3.5))
      ctx.beginPath(); ctx.moveTo(px[i0], py[i0])
      for (let i = i0 + 1; i <= i1; i++) ctx.lineTo(px[i], py[i])
      ctx.stroke()
    }
  }
}

/** 铅笔下划线（悬停项名称下）：略微上扬、带抖动，两遍描画 */
export function pencilUnderline(ctx, x0, x1, y, seed, opt = {}) {
  const len = x1 - x0
  if (!(len > 1)) return
  drawCurve(ctx, [x0 - 2, y + 0.6, (x0 + x1) / 2, y + 1.1, x1 + 3, y - Math.min(2, len * 0.01)], seed, {
    width: 1.1, alpha: 0.8, jitter: 0.7, ...opt, style: 'solid',
  })
}

/**
 * 荧光笔：2–3 道略斜、两端斜切且不齐的半透明粗笔，multiply 合成（交叠处更深，像真的涂了两遍）。
 * opt: {color(highlight), alpha(1)}
 */
export function highlighterWash(ctx, x, y, w, h, seed, opt = {}) {
  if (!(w > 0.5 && h > 0.5)) return
  const R = rng(seed >>> 0)
  const k = 2 + (R() < 0.5 ? 1 : 0)
  ctx.save()
  ctx.globalCompositeOperation = 'multiply'
  ctx.globalAlpha *= opt.alpha ?? 1
  ctx.fillStyle = opt.color || PALETTE.highlight
  const bh = h * (k === 2 ? 0.66 : 0.52)
  for (let i = 0; i < k; i++) {
    const cyy = y + bh / 2 + ((h - bh) * i) / (k - 1) + (R() - 0.5) * h * 0.06
    const xl = x - 2 - R() * 5, xr = x + w + 2 + R() * 6
    const skew = (R() - 0.5) * Math.min(4, h * 0.18)
    const cut = Math.min(6, bh * 0.45)
    const top = cyy - bh / 2, bot = cyy + bh / 2
    ctx.beginPath()
    ctx.moveTo(xl + cut, top + skew)
    ctx.lineTo(xr, top - skew + (R() - 0.5) * 1.2)
    ctx.lineTo(xr - cut * (0.6 + R() * 0.6), bot - skew)
    ctx.lineTo(xl, bot + skew + (R() - 0.5) * 1.2)
    ctx.closePath()
    ctx.fill()
  }
  ctx.restore()
}

/**
 * 朱印：圆角方形 + 边缘残缺（seed 决定缺口位置）+ 白文印字（楷体）+ 几处磨损白点。
 * 多字印文：2 字竖排；3–4 字按传统右起两列。opt: {color(seal), textColor(sealText), alpha(0.92)}
 */
export function sealStamp(ctx, x, y, size, char, seed, opt = {}) {
  if (!(size > 0.5)) return
  ctx.save()
  ctx.globalAlpha *= opt.alpha ?? 0.92
  ctx.fillStyle = opt.color || PALETTE.seal
  if (size < 5) { ctx.fillRect(x, y, size, size); ctx.restore(); return }
  const R = rng(seed >>> 0)
  const r = size * 0.08
  // 外轮廓：沿圆角方形走一圈，每点向内随机收一点；再挑 2–3 处做较深的缺口
  const per = 12
  const notches = []
  const nn = 2 + (R() < 0.5 ? 1 : 0)
  for (let i = 0; i < nn; i++) notches.push({ at: R() * 4 * per, span: 1 + R() * 2, depth: size * (0.03 + R() * 0.04) })
  ctx.beginPath()
  let idx = 0
  const corner = (cx0, cy0, a0) => {   // 圆角：3 点
    for (let j = 0; j <= 2; j++) {
      const a = a0 + (j / 2) * (Math.PI / 2)
      pt(cx0 + Math.cos(a) * r, cy0 + Math.sin(a) * r, Math.cos(a), Math.sin(a))
    }
  }
  const pt = (px, py, nx, ny) => {
    let d = R() * size * 0.012
    for (const q of notches) { const dd = Math.abs(idx - q.at); if (dd < q.span) d += q.depth * (1 - dd / q.span) }
    const X = px - nx * d, Y = py - ny * d
    if (idx === 0) ctx.moveTo(X, Y); else ctx.lineTo(X, Y)
    idx++
  }
  const s = size
  for (let i = 0; i < per; i++) pt(x + r + ((s - 2 * r) * i) / per, y, 0, -1)
  corner(x + s - r, y + r, -Math.PI / 2)
  for (let i = 1; i < per; i++) pt(x + s, y + r + ((s - 2 * r) * i) / per, 1, 0)
  corner(x + s - r, y + s - r, 0)
  for (let i = 1; i < per; i++) pt(x + s - r - ((s - 2 * r) * i) / per, y + s, 0, 1)
  corner(x + r, y + s - r, Math.PI / 2)
  for (let i = 1; i < per; i++) pt(x, y + s - r - ((s - 2 * r) * i) / per, -1, 0)
  corner(x + r, y + r, Math.PI)
  ctx.closePath()
  ctx.fill()
  // 印文
  const chars = [...String(char || '印')]
  ctx.fillStyle = opt.textColor || PALETTE.sealText
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  const cx = x + s / 2, cy = y + s / 2
  if (chars.length === 1) {
    ctx.font = fontCss('hand', s * 0.64, 600)
    ctx.fillText(chars[0], cx, cy + s * 0.04, s * 0.84)
  } else if (chars.length === 2) {
    ctx.font = fontCss('hand', s * 0.4, 600)
    ctx.fillText(chars[0], cx, cy - s * 0.2, s * 0.8)
    ctx.fillText(chars[1], cx, cy + s * 0.24, s * 0.8)
  } else {
    const rows = Math.ceil(chars.length / 2)
    const fs = (s * 0.8) / rows
    ctx.font = fontCss('hand', fs * 0.92, 600)
    chars.forEach((ch, i) => {
      const col = Math.floor(i / rows), row = i % rows   // 右起竖排
      const gx = cx + (col === 0 ? 0.22 : -0.22) * s
      const gy = y + s * 0.1 + fs * (row + 0.55)
      ctx.fillText(ch, gx, gy, s * 0.42)
    })
  }
  // 磨损：几处纸色小点
  if (s >= 20) {
    ctx.globalAlpha *= 0.55
    for (let i = 0; i < 7; i++) {
      ctx.beginPath()
      ctx.arc(x + s * (0.08 + R() * 0.84), y + s * (0.08 + R() * 0.84), s * (0.008 + R() * 0.018), 0, TAU)
      ctx.fill()
    }
  }
  ctx.restore()
}

/** 手绘矩形框：四条略带抖动的边，角上出头 2–4px。opt: {color(pencil), width(1.1), alpha(0.75)} */
export function handFrame(ctx, x, y, w, h, seed, opt = {}) {
  const R = rng(seed >>> 0)
  const o = () => 2 + R() * 2.5
  const sides = [
    [x - o(), y, x + w + o(), y], [x + w, y - o(), x + w, y + h + o()],
    [x + w + o(), y + h, x - o(), y + h], [x, y + h + o(), x, y - o()],
  ]
  const op = { width: 1.1, alpha: 0.75, jitter: 0.6, ...opt, style: 'solid', color: opt.color || PALETTE.pencil }
  sides.forEach(([a, b, c, d], i) => drawCurve(ctx, [a, b, (a + c) / 2 + (R() - 0.5) * 1.5, (b + d) / 2 + (R() - 0.5) * 1.5, c, d], seed + i * 101, op))
}

/** 点线 leader：从 x1 向左按 step 排点（与名称一侧对齐，像书的目录）。opt: {color(ink3), step(8), dot(1.2), alpha(1)} */
export function dottedLeader(ctx, x0, x1, y, opt = {}) {
  const step = Math.max(2, opt.step || 8)
  const d = opt.dot || 1.2
  if (!(x1 - x0 > step)) return
  ctx.save()
  ctx.globalAlpha *= opt.alpha ?? 1
  ctx.fillStyle = opt.color || PALETTE.ink3
  ctx.beginPath()
  for (let x = x1 - step * 0.5; x >= x0; x -= step) ctx.rect(x - d / 2, y - d, d, d)
  ctx.fill()
  ctx.restore()
}

/** 图例用：在 (x,y) 起画一段长 w 的示例笔画（略向上拱）。style ∈ LINK_STROKE 值。 */
export function strokeSample(ctx, x, y, w, style, seed, opt = {}) {
  drawCurve(ctx, [x, y, x + w / 2, y - Math.min(5, w * 0.06), x + w, y], seed ?? seedOf(String(style)), {
    width: 1.4, alpha: 0.88, ...opt, style: style || 'solid',
  })
}

/**
 * 手写状态符号。'?' '½' '~' 用 hand 字体书写；'✓' '✗' 没有手写字形（会回退到印刷体符号字体），
 * 改为两笔手绘，限制在与字形相同的外包框里（宽 opt.w ≈ 量出的字宽，高 0.86em 上伸）。
 * opt: {align('left'|'center'|'right'), color(STATUS_GLYPH 色), alpha(1), w(字宽提示)}
 */
export function statusMark(ctx, x, y, size, status, opt = {}) {
  if (!(size > 0.5)) return
  const g = STATUS_GLYPH[status] || STATUS_GLYPH.open
  ctx.save()
  ctx.globalAlpha *= opt.alpha ?? 1
  const color = opt.color || g.color
  if (g.glyph === '✓' || g.glyph === '✗') {
    const bw = opt.w ?? size * 0.62
    const align = opt.align || 'left'
    const l = align === 'center' ? x - bw / 2 : align === 'right' ? x - bw : x
    ctx.strokeStyle = color
    ctx.lineCap = 'round'; ctx.lineJoin = 'round'
    ctx.lineWidth = Math.max(0.7, size * 0.085)
    ctx.beginPath()
    if (g.glyph === '✓') {
      ctx.moveTo(l + bw * 0.04, y - size * 0.36)
      ctx.quadraticCurveTo(l + bw * 0.22, y - size * 0.2, l + bw * 0.34, y - size * 0.02)
      ctx.quadraticCurveTo(l + bw * 0.55, y - size * 0.5, l + bw * 0.98, y - size * 0.76)
    } else {
      ctx.moveTo(l + bw * 0.06, y - size * 0.7)
      ctx.quadraticCurveTo(l + bw * 0.5, y - size * 0.4, l + bw * 0.94, y - size * 0.04)
      ctx.moveTo(l + bw * 0.9, y - size * 0.74)
      ctx.quadraticCurveTo(l + bw * 0.42, y - size * 0.32, l + bw * 0.1, y - size * 0.02)
    }
    ctx.stroke()
  } else {
    ctx.fillStyle = color
    ctx.font = fontCss('hand', size)
    ctx.textAlign = opt.align || 'left'
    ctx.textBaseline = 'alphabetic'
    if (opt.w) ctx.fillText(g.glyph, x, y, opt.w + 1)
    else ctx.fillText(g.glyph, x, y)
  }
  ctx.restore()
}

/** 手绘箭头（两笔，从两翼末端收向尖端，略弯、两翼不等长）。opt: {color(pencil), width(1.2), alpha(1), seed} */
export function arrowHead(ctx, x, y, angle, size, opt = {}) {
  const R = rng((opt.seed ?? 11) >>> 0)
  ctx.save()
  ctx.globalAlpha *= opt.alpha ?? 1
  ctx.strokeStyle = opt.color || PALETTE.pencil
  ctx.lineWidth = opt.width || 1.2
  ctx.lineCap = 'round'
  for (const side of [-1, 1]) {
    const a = angle + Math.PI + side * (0.42 + (R() - 0.5) * 0.14)
    const L = size * (0.88 + R() * 0.24)
    const ex = x + Math.cos(a) * L, ey = y + Math.sin(a) * L
    const pa = a + (side * Math.PI) / 2
    const mx = (x + ex) / 2 + Math.cos(pa) * L * 0.07, my = (y + ey) / 2 + Math.sin(pa) * L * 0.07
    ctx.beginPath(); ctx.moveTo(ex, ey); ctx.quadraticCurveTo(mx, my, x, y); ctx.stroke()
  }
  ctx.restore()
}

/* ───────── 供 render 使用的曲线求值（非契约导出） ───────── */
/** 二次 / 三次贝塞尔上 t 处的点 → [x, y] */
export function bezPoint(c, t) { evalBez(c, t, _o); return [_o[0], _o[1]] }
