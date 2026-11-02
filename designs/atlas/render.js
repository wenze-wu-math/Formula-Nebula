/**
 * designs/atlas/render.js — 画布渲染（M2 所有）。规格：SPEC §1、§4、§5。
 *
 * 只画"图"本身：背景、盘面、坐标网、刻度环、星座区域与边界、星座连线、关联弧、
 * 研究者刻度、深空天体与恒星；overlay 画搜索命中圈、悬停圈、选中准星与离屏箭头。
 * 参与避让的文字（公式、中文名、星座名、研究者名）全部归 labels.js，这里只画
 * 刻度环上的赤经时数字与 L ≥ 2.5 时的赤纬度数小字（二者位置固定、不会与彼此相撞）。
 *
 * 关键取舍：
 *   · 每帧整画（画面元素 < 2000 个，增量重画的脏区管理反而更贵也更易错）。
 *   · 同色同线宽的线合成一条 path 一次 stroke；按视口裁剪（圆只画落在视口里的那段弧，
 *     边界段 / 刻度 / 星点逐个包围盒裁剪），拉近到 L=5 时盘面圆周长达数万 px，
 *     整圆描边（尤其虚线）会让 Skia 细分出成千上万段，必须裁剪。
 *   · 星座区域铺底用世界坐标的 Path2D（init 时按格子拼一次），绘制时只换变换矩阵。
 *   · 恒星 / 深空天体一律调 glyphs.js 的 drawStar / drawDso，保证与图例、面板图标一致。
 *   · 纸面颗粒是一次性生成的 256×256 噪声 pattern，屏幕空间平铺（不随平移移动，像印在玻璃上的
 *     网点而不是星图本身的内容；与"纸"的直觉略有出入，但平移时不会出现颗粒游动的闪烁）。
 */
import {
  COLOR,
  DIM, FIGURE_FADE_L0, FIGURE_FADE_L1, FONT_SERIF, HOUR_PX, ARC_GROW_MS, FAMILY_ORDER,
} from './constants.js'
/* 世界长度量从 runtime.js 取（可缩放 live binding）；见 runtime.js 头注释 */
import { R_DISK, R_SCALE_IN, R_SCALE_MID, R_SCALE_OUT, R_HOUR_TEXT, R_RES_TICK, R_RES_TICK_END, BAND_W } from './runtime.js'
import { raToCanvas, decToR, smoothstep, clamp, makeRng, polarToWorld } from './geo.js'
import { drawStar, drawStarBatch, drawDso, bodyRadius } from './glyphs.js'
import { state } from './state.js'

const TAU = Math.PI * 2
const DEC_MINOR = [80, 70, 50, 40, 20, 10]
const DEC_MAJOR = [60, 30]
const DEC_ALL = [80, 70, 60, 50, 40, 30, 20, 10]
/** 刻度长（世界单位）：1° / 5° / 15° 三级
 *
 * ⚠ 必须**每次现算**，不能做成模块级常量：它依赖 R_SCALE_MID − R_SCALE_IN，
 * 而两者都随世界尺度变化。写成常量会在 import 时冻结成 1× 的值，
 * 放大盘面后刻度会短得看不见。 */
const tickLen = () => [0.35, 0.65, 1.0].map((k) => k * (R_SCALE_MID - R_SCALE_IN))
const NOISE_ALPHA = 0.035
const PULSE_MS = 1200

/* ───────── 一次性缓存（initRender 生成） ───────── */
let A = null
let micro = []          // [{alpha, pts: Float64Array[x,y,r,...]}]，按 alpha 分 4 桶，各桶一次 fill
let ticks = []          // 360 个 {ux, uy, level}
let hours = []          // 24 个 {ux, uy, rot, label}
let bounds = []         // [{s, x0, y0, x1, y1}]：边界段 + 世界包围盒（裁剪用）
let figs = []           // [{a, b, fi}]：星座连线两端 body + 族下标
let resTick = new Map() // 研究者 id → {ux, uy, mx, my}（单位向量 + 刻度中点世界坐标）
let regionPaths = null  // family → Path2D（世界坐标）
let noise = null        // {canvas, pattern, ctx}
let hourW = null        // 100px 字号下各时数字宽度，及 'h' 宽
let perf = { sceneMs: 0, overlayMs: 0, layers: {} }
let lt = 0
/** 分层计时（调试用，每帧十来次 performance.now，开销可忽略）：记录自上次打点以来的耗时 */
function mark(name) { const t = performance.now(); perf.layers[name] = Math.round((t - lt) * 1000) / 1000; lt = t }

/** 生成背景微星、刻度表、边界包围盒、星座区域 Path2D 等一次性缓存 */
export function initRender(atlas) {
  A = atlas
  // 背景微星：世界坐标、固定种子；环带 [R_SCALE_OUT+40, 2.2·R_DISK]，按面积均匀
  // 每颗微星带一个相位（用于闪烁动画）
  const rng = makeRng(0x5eed2026)
  const r0 = R_SCALE_OUT + 40, r1 = 2.2 * R_DISK
  const buckets = [[], [], [], []]
  for (let i = 0; i < 300; i++) {
    const r = Math.sqrt(r0 * r0 + rng() * (r1 * r1 - r0 * r0)), ra = rng() * TAU
    const p = polarToWorld(r, ra)
    const size = 0.4 + 0.5 * rng(), k = Math.min(3, Math.floor(rng() * 4))
    const phase = rng()  // [0,1) 相位，用于闪烁
    buckets[k].push(p.x, p.y, size, phase)
  }
  micro = buckets.map((pts, k) => ({ alpha: 0.15 + k * 0.0667, pts: Float64Array.from(pts) }))

  // 刻度：每 1°；level 0 = 1°，1 = 5°，2 = 15°（1 小时）
  ticks = []
  for (let d = 0; d < 360; d++) {
    const a = raToCanvas(d / 360 * TAU)
    ticks.push({ ux: Math.cos(a), uy: Math.sin(a), level: d % 15 === 0 ? 2 : d % 5 === 0 ? 1 : 0 })
  }
  // 时数字：切向排字；字顶朝外，下半圈（cos ra < 0）翻转 180° 保持正立
  hours = []
  for (let h = 0; h < 24; h++) {
    const ra = h / 24 * TAU, a = raToCanvas(ra)
    let rot = -ra
    if (Math.cos(ra) < -1e-6) rot += Math.PI
    hours.push({ ux: Math.cos(a), uy: Math.sin(a), rot, label: String(h) })
  }
  hourW = null

  // 边界段：世界包围盒（弧按 0.1 rad 采样，外扩 2 单位）
  bounds = atlas.boundaries.map((s) => {
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity
    const add = (r, ra) => { const p = polarToWorld(r, ra); x0 = Math.min(x0, p.x); y0 = Math.min(y0, p.y); x1 = Math.max(x1, p.x); y1 = Math.max(y1, p.y) }
    if (s.kind === 'arc') {
      const n = Math.max(1, Math.ceil((s.ra1 - s.ra0) / 0.1))
      for (let i = 0; i <= n; i++) add(s.r, s.ra0 + (s.ra1 - s.ra0) * i / n)
    } else { add(s.r0, s.ra); add(s.r1, s.ra) }
    return { s, x0: x0 - 2, y0: y0 - 2, x1: x1 + 2, y1: y1 + 2 }
  })

  figs = []
  for (const [fam, pairs] of Object.entries(atlas.figures || {})) {
    for (const [ia, ib] of pairs) {
      const a = atlas.bodies.get(ia), b = atlas.bodies.get(ib)
      if (a && b) figs.push({ a, b, fam })
    }
  }

  resTick = new Map()
  for (const r of atlas.researchers) {
    const a = raToCanvas(r.raLabel ?? 0), ux = Math.cos(a), uy = Math.sin(a), rm = (R_RES_TICK + R_RES_TICK_END) / 2
    resTick.set(r.id, { ux, uy, mx: ux * rm, my: uy * rm })
  }
  regionPaths = null
}

/** 星座区域铺底的世界坐标 Path2D：每档把同族的连续列合并成一个扇环（首次需要时生成） */
function buildRegionPaths() {
  regionPaths = {}
  if (typeof Path2D === 'undefined') return
  for (const f of FAMILY_ORDER) regionPaths[f] = new Path2D()
  A.cells.forEach((row, band) => {
    const cols = row.length, rIn = band * BAND_W, rOut = (band + 1) * BAND_W
    const uniform = row.every((v) => v === row[0])
    if (uniform) {     // 整档同族：完整圆环（外圈逆向、内圈正向，非零环绕规则下挖空中间）
      const p = regionPaths[FAMILY_ORDER[row[0]]]
      p.moveTo(rOut, 0); p.arc(0, 0, rOut, 0, TAU, false)
      if (rIn > 0) { p.moveTo(rIn, 0); p.arc(0, 0, rIn, TAU, 0, true) }
      return
    }
    let c = 0
    while (c < cols) {
      const fi = row[c]
      let e = c + 1
      while (e < cols && row[e] === fi) e++
      const ra0 = c / cols * TAU, ra1 = e / cols * TAU
      const p = regionPaths[FAMILY_ORDER[fi]]
      const a0 = raToCanvas(ra0), a1 = raToCanvas(ra1)
      p.moveTo(Math.cos(a0) * rOut, Math.sin(a0) * rOut)
      p.arc(0, 0, rOut, a0, a1, true)
      if (rIn > 0) p.arc(0, 0, rIn, a1, a0, false)
      else p.lineTo(0, 0)
      p.closePath()
      c = e
    }
  })
}

/** 纸面颗粒：256×256，细颗粒 + 16 格周期值噪声的低频斑驳（可无缝平铺）；奶白 / 深蓝双向 */
function ensureNoise(ctx, dpr) {
  if (noise && noise.ctx === ctx && noise.dpr === dpr) return noise.pattern
  if (!noise || !noise.canvas) {
    const N = 256, G = 16, c = document.createElement('canvas')
    c.width = c.height = N
    const g = c.getContext('2d'), img = g.createImageData(N, N), d = img.data
    const rng = makeRng(0x9a9e2026)
    const lat = new Float32Array(G * G)
    for (let i = 0; i < lat.length; i++) lat[i] = rng()
    const L = (i, j) => lat[((j + G) % G) * G + ((i + G) % G)]
    for (let y = 0; y < N; y++) {
      for (let x = 0; x < N; x++) {
        const fx = x / N * G, fy = y / N * G, i = Math.floor(fx), j = Math.floor(fy)
        let u = fx - i, v = fy - j
        u = u * u * (3 - 2 * u); v = v * v * (3 - 2 * v)
        const low = (L(i, j) * (1 - u) + L(i + 1, j) * u) * (1 - v) + (L(i, j + 1) * (1 - u) + L(i + 1, j + 1) * u) * v
        const val = 0.6 * rng() + 0.4 * low - 0.5           // ≈ [-0.5, 0.5]
        const o = (y * N + x) * 4
        if (val > 0) { d[o] = 244; d[o + 1] = 236; d[o + 2] = 216 } else { d[o] = 2; d[o + 1] = 6; d[o + 2] = 14 }
        d[o + 3] = Math.min(255, Math.round(Math.abs(val) * 2 * 255))
      }
    }
    g.putImageData(img, 0, 0)
    noise = { canvas: c }
  }
  const pattern = ctx.createPattern(noise.canvas, 'repeat')
  // 让一个噪声像素对应一个设备像素（主变换已乘 dpr，这里反除），颗粒在高分屏上不发糊
  if (pattern && pattern.setTransform && typeof DOMMatrix !== 'undefined') pattern.setTransform(new DOMMatrix([1 / dpr, 0, 0, 1 / dpr, 0, 0]))
  Object.assign(noise, { ctx, dpr, pattern })
  return pattern
}

/** §4 星座连线 alpha：L ≤ 2.5 为 1，到 3.5 降到 0.4 */
export function figureAlpha(L) { return 1 - 0.6 * smoothstep(FIGURE_FADE_L0, FIGURE_FADE_L1, L) }

/** 调试：最近一帧 drawScene / drawOverlay 自身耗时（ms） */
export function renderStats() { return { sceneMs: perf.sceneMs, overlayMs: perf.overlayMs, layers: { ...perf.layers } } }

/* ───────── 视口几何小工具 ───────── */

/** 原点 (ox, oy) 到视口矩形的最近 / 最远距离（px） */
function rectDist(ox, oy, w, h) {
  const nx = clamp(ox, 0, w) - ox, ny = clamp(oy, 0, h) - oy
  const fx = Math.max(Math.abs(ox), Math.abs(w - ox)), fy = Math.max(Math.abs(oy), Math.abs(h - oy))
  return { near: Math.hypot(nx, ny), far: Math.hypot(fx, fy) }
}

/** 视口（外扩 m）相对原点的张角 [a0, a1]（canvas 角，a0 < a1）；原点在视口内返回 null = 需要整圆。
 *  与半径无关，所以每帧算一次即可供所有同心圆复用。 */
function viewSpan(ox, oy, w, h, m) {
  if (ox > -m && ox < w + m && oy > -m && oy < h + m) return null
  const cx = clamp(ox, -m, w + m), cy = clamp(oy, -m, h + m)
  const base = Math.atan2(cy - oy, cx - ox)
  let lo = 0, hi = 0
  for (const [x, y] of [[-m, -m], [w + m, -m], [-m, h + m], [w + m, h + m]]) {
    let d = Math.atan2(y - oy, x - ox) - base
    d -= Math.round(d / TAU) * TAU
    if (d < lo) lo = d
    if (d > hi) hi = d
  }
  return [base + lo, base + hi]
}

/** 往当前 path 里加一个半径 R 的圆（只加视口里那段） */
function addCircle(ctx, ox, oy, R, span, dist) {
  if (R < dist.near - 2 || R > dist.far + 2 || R <= 0) return
  if (!span) { ctx.moveTo(ox + R, oy); ctx.arc(ox, oy, R, 0, TAU); return }
  ctx.moveTo(ox + Math.cos(span[0]) * R, oy + Math.sin(span[0]) * R)
  ctx.arc(ox, oy, R, span[0], span[1], false)
}

/** 半径 R 的圆盘 path（视口外的大圆退化为一个包住视口的扇形，避免超大圆的细分开销） */
function diskPath(ctx, ox, oy, R, span) {
  ctx.beginPath()
  if (!span) { ctx.arc(ox, oy, R, 0, TAU); return }
  ctx.moveTo(ox, oy)
  ctx.arc(ox, oy, R, span[0], span[1], false)
  ctx.closePath()
}

/* ───────── drawScene ───────── */

/**
 * 画底图（§5.1 第 1–11 层）。调用前 main 已 setTransform(dpr)。
 * @returns {boolean} 关联弧生长动画是否仍在进行
 */
export function drawScene(ctx, f) {
  if (!A || A !== f.atlas) initRender(f.atlas)
  const t0 = performance.now()
  lt = t0
  const { P, w, h, L } = f
  const z = P.zoom, ox = P.sx(0), oy = P.sy(0)
  const span = viewSpan(ox, oy, w, h, 8)
  const dist = rectDist(ox, oy, w, h)
  let animating = false
  ctx.save()
  ctx.lineCap = 'butt'; ctx.lineJoin = 'miter'; ctx.setLineDash([]); ctx.globalAlpha = 1

  /* 1 背景 + 盘外微星（世界坐标，随平移移动） */
  ctx.fillStyle = COLOR.bgOuter
  ctx.fillRect(0, 0, w, h)
  ctx.fillStyle = COLOR.star
  // 微星闪烁动画：周期 3.2s，幅度 ±0.15，按相位错开
  const twinkle = !f.reducedMotion
  for (const bk of micro) {
    ctx.globalAlpha = bk.alpha
    ctx.beginPath()
    const p = bk.pts
    for (let i = 0; i < p.length; i += 4) {
      const x = P.sx(p[i]), y = P.sy(p[i + 1])
      if (x < -2 || y < -2 || x > w + 2 || y > h + 2) continue
      let r = p[i + 2]
      if (twinkle) {
        const phase = p[i + 3]
        const t = ((f.now / 3200 + phase) % 1) * TAU
        r *= 1 + 0.15 * Math.sin(t)
      }
      ctx.moveTo(x + r, y); ctx.arc(x, y, r, 0, TAU)
    }
    ctx.fill()
  }
  ctx.globalAlpha = 1
  mark('bg')
  if (twinkle) animating = true

  const diskVisible = dist.near < R_SCALE_OUT * z + 8
  if (diskVisible) {
    /* 刻度环带底色：盘缘到刻度环外沿用盘缘色，给刻度环一块"印刷底" */
    if (dist.far > R_DISK * z - 2) {
      diskPath(ctx, ox, oy, (R_SCALE_OUT + 4) * z, span)
      ctx.fillStyle = COLOR.diskOuter
      ctx.globalAlpha = 0.55
      ctx.fill()
      ctx.globalAlpha = 1
    }
    /* 2 盘面：径向渐变 + 纸面颗粒 */
    if (dist.near < R_DISK * z) {
      const g = ctx.createRadialGradient(ox, oy, 0, ox, oy, R_DISK * z)
      g.addColorStop(0, COLOR.diskInner)
      g.addColorStop(1, COLOR.diskOuter)
      ctx.fillStyle = g
      const full = dist.far <= R_DISK * z      // 视口完全在盘内：直接铺满矩形
      if (full) ctx.fillRect(0, 0, w, h)
      else { diskPath(ctx, ox, oy, R_DISK * z, span); ctx.fill() }
      const pat = ensureNoise(ctx, f.dpr || 1)
      if (pat) {
        ctx.fillStyle = pat
        ctx.globalAlpha = NOISE_ALPHA
        if (full) ctx.fillRect(0, 0, w, h)
        else ctx.fill()
        ctx.globalAlpha = 1
      }
    }
    mark('disk')
    drawGrid(ctx, f, ox, oy, z, span, dist)
    mark('grid')
    drawRing(ctx, f, ox, oy, z, span, dist)
    mark('ring')
  }

  /* 5 星座区域铺底：选中星所在族 / 悬停的星座 */
  const focusFams = new Set()
  const sel = f.selected ? A.bodies.get(f.selected) : null
  if (sel && sel.kind === 'star') focusFams.add(sel.family)
  if (f.hover && f.hover.kind === 'constellation' && f.hover.family) focusFams.add(f.hover.family)
  if (focusFams.size) {
    if (!regionPaths) buildRegionPaths()
    const dpr = f.dpr || 1
    ctx.setTransform(dpr * z, 0, 0, dpr * z, dpr * ox, dpr * oy)
    ctx.fillStyle = COLOR.regionFocus
    for (const fam of focusFams) if (regionPaths[fam]) ctx.fill(regionPaths[fam])
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }

  /* 6 星座边界：IAU 式阶梯虚线（逐段起新子路径，虚线相位每段重置，拐角处干净） */
  if (diskVisible) {
    const wx0 = P.wx(-4), wy0 = P.wy(-4), wx1 = P.wx(w + 4), wy1 = P.wy(h + 4)
    ctx.strokeStyle = COLOR.boundary
    ctx.lineWidth = 1
    ctx.setLineDash([5, 4])
    ctx.beginPath()
    for (const b of bounds) {
      if (b.x1 < wx0 || b.x0 > wx1 || b.y1 < wy0 || b.y0 > wy1) continue
      const s = b.s
      if (s.kind === 'arc') {
        const R = s.r * z, a0 = raToCanvas(s.ra0), a1 = raToCanvas(s.ra1)
        let c0 = a0, c1 = a1
        if (span && R * (s.ra1 - s.ra0) > 4 * (w + h)) {
          // 极大的弧：只画视口张角内的部分（a 递减方向；把视口张角映射进 [a1, a0]）
          const lo = span[0], hi = span[1]
          const k = Math.round(((a0 + a1) - (lo + hi)) / 2 / TAU)
          const sLo = lo + k * TAU, sHi = hi + k * TAU
          c0 = Math.min(a0, sHi); c1 = Math.max(a1, sLo)
          if (c0 <= c1) continue
          // 起点对齐到虚线整周期（9px）：否则裁剪起点随平移连续变化，虚线会"爬动"。
          // 少退一个周期，保证对齐后的起点仍在视口外扩区之外（viewSpan 外扩 8px）。
          const dTh = 9 / R, n = Math.floor((a0 - c0) / dTh)
          c0 = a0 - Math.max(0, n - 1) * dTh
        }
        ctx.moveTo(ox + Math.cos(c0) * R, oy + Math.sin(c0) * R)
        ctx.arc(ox, oy, R, c0, c1, true)
      } else {
        const a = raToCanvas(s.ra), ca = Math.cos(a), sa = Math.sin(a)
        ctx.moveTo(ox + ca * s.r0 * z, oy + sa * s.r0 * z)
        ctx.lineTo(ox + ca * s.r1 * z, oy + sa * s.r1 * z)
      }
    }
    ctx.stroke()
    ctx.setLineDash([])
  }
  mark('bounds')

  /* 7 星座连线：两端在星点外留 3px 空隙；选中时非焦点族 × DIM.figure */
  const fa = figureAlpha(L)
  const focusFam = sel ? (sel.kind === 'star' ? sel.family : null) : undefined
  ctx.strokeStyle = COLOR.figure
  ctx.lineWidth = 1
  for (const pass of [0, 1]) {   // 0 = 压暗组，1 = 正常组（后画，压在上面）
    const alpha = pass === 0 ? fa * DIM.figure : fa
    let any = false
    ctx.beginPath()
    for (const e of figs) {
      const dimmed = focusFam !== undefined && e.fam !== focusFam
      if ((pass === 0) !== dimmed) continue
      const ax = P.sx(e.a.x), ay = P.sy(e.a.y), bx = P.sx(e.b.x), by = P.sy(e.b.y)
      if (Math.max(ax, bx) < 0 || Math.min(ax, bx) > w || Math.max(ay, by) < 0 || Math.min(ay, by) > h) continue
      const dx = bx - ax, dy = by - ay, len = Math.hypot(dx, dy)
      const ga = bodyRadius(e.a, L) + 3, gb = bodyRadius(e.b, L) + 3
      if (len <= ga + gb + 1) continue
      const ux = dx / len, uy = dy / len
      ctx.moveTo(ax + ux * ga, ay + uy * ga); ctx.lineTo(bx - ux * gb, by - uy * gb)
      any = true
    }
    if (any) { ctx.globalAlpha = alpha; ctx.stroke() }
  }
  ctx.globalAlpha = 1
  mark('figs')

  /* 8 关联弧 */
  if (f.focus && sel) animating = drawArcs(ctx, f, sel) || animating

  /* 9 研究者刻度 */
  drawResearcherTicks(ctx, f, ox, oy, z)
  mark('arcs+res')

  /* 10 深空天体 / 11 恒星（视口外裁掉；选中时压暗组先画，焦点组后画压在上面）
   *
   * 性能关键：星点从 405 涨到 1505 后，逐颗 drawStar（每颗 save/restore + 单独 fill）
   * 让 frameMs 从 141ms 涨到 605ms，帧率掉到 0.3 —— 烘焙泵随之被饿死。
   * 改为**按星等合批**：同星等共用一条路径、一次 fill，状态切换 O(n)→O(6)。
   * 亮星（mag ≤ 2）有径向光晕，仍逐颗画。 */
  const ids = f.focus ? f.focus.ids : null
  const starBuckets = new Map()   // mag → [{x,y,r,alpha}]
  for (const pass of ids ? [0, 1] : [1]) {
    for (const d of A.dsos) {
      if (ids && (pass === 1) !== ids.has(d.id)) continue
      const x = P.sx(d.x), y = P.sy(d.y)
      if (x < -20 || y < -20 || x > w + 20 || y > h + 20) continue
      drawDso(ctx, x, y, bodyRadius(d, L), d.status, { alpha: pass === 0 ? DIM.glyph : 1 })
    }
    for (let i = A.stars.length - 1; i >= 0; i--) {   // stars 按 mag 升序 → 倒序 = 暗星先画
      const s = A.stars[i]
      if (ids && (pass === 1) !== ids.has(s.id)) continue
      const x = P.sx(s.x), y = P.sy(s.y), r = bodyRadius(s, L), m = r * 3.3 + 2
      if (x < -m || y < -m || x > w + m || y > h + m) continue
      const alpha = pass === 0 ? DIM.star : 1
      if (s.mag <= 2) {
        /* 亮星：光晕以星点为中心，必须逐颗画 */
        drawStar(ctx, x, y, r, { mag: s.mag, alpha })
      } else {
        if (!starBuckets.has(s.mag)) starBuckets.set(s.mag, [])
        starBuckets.get(s.mag).push({ x, y, r, alpha })
      }
    }
  }
  for (const [mag, pts] of starBuckets) drawStarBatch(ctx, pts, mag)

  mark('bodies')
  ctx.restore()
  perf.sceneMs = performance.now() - t0
  return animating
}

/* 3 坐标网：赤纬圈 + 赤经线 + 极点小十字；L ≥ 2.5 时赤纬度数小字 */
function drawGrid(ctx, f, ox, oy, z, span, dist) {
  const { w, h, L } = f
  // 次要赤纬圈 + 19 条次要赤经线（同色同宽，一条 path）
  ctx.lineWidth = 0.75
  ctx.strokeStyle = COLOR.grid
  ctx.beginPath()
  for (const d of DEC_MINOR) addCircle(ctx, ox, oy, decToR(d) * z, span, dist)
  const rA = decToR(80) * z, rB = R_DISK * z
  for (let hh = 0; hh < 24; hh++) {
    if (hh % 6 === 0) continue
    const t = ticks[hh * 15]
    ctx.moveTo(ox + t.ux * rA, oy + t.uy * rA); ctx.lineTo(ox + t.ux * rB, oy + t.uy * rB)
  }
  ctx.stroke()
  // 主线：30°/60° 赤纬圈 + 0/6/12/18h 赤经线（从极点画起）
  ctx.lineWidth = 1
  ctx.strokeStyle = COLOR.gridMajor
  ctx.beginPath()
  for (const d of DEC_MAJOR) addCircle(ctx, ox, oy, decToR(d) * z, span, dist)
  const rP = 5     // 主赤经线在极点十字外 5px 处起笔，十字本身单独画（不让四线在极点叠成一团）
  for (let hh = 0; hh < 24; hh += 6) {
    const t = ticks[hh * 15]
    ctx.moveTo(ox + t.ux * rP, oy + t.uy * rP); ctx.lineTo(ox + t.ux * rB, oy + t.uy * rB)
  }
  ctx.stroke()
  // 极点：6px 小十字（用刻度环金色，作为整张图的"针眼"）
  if (ox > -6 && oy > -6 && ox < w + 6 && oy < h + 6) {
    ctx.strokeStyle = COLOR.ringDim
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(ox - 3, oy); ctx.lineTo(ox + 3, oy); ctx.moveTo(ox, oy - 3); ctx.lineTo(ox, oy + 3)
    ctx.stroke()
  }
  // 赤纬度数小字：每条赤纬圈与主赤经线交点旁，alpha 0.5（L 2.5 起 0.25 级内淡入）
  if (L >= 2.5) {
    const a = 0.5 * smoothstep(2.5, 2.75, L)
    ctx.font = `9.5px ${FONT_SERIF}`
    ctx.textAlign = 'left'
    ctx.textBaseline = 'bottom'
    ctx.lineJoin = 'round'
    ctx.lineWidth = 2.5
    ctx.strokeStyle = COLOR.labelHalo
    ctx.fillStyle = COLOR.ring
    for (const d of DEC_ALL) {
      const R = decToR(d) * z
      for (let hh = 0; hh < 24; hh += 6) {
        const t = ticks[hh * 15], x = ox + t.ux * R + 3, y = oy + t.uy * R - 2
        if (x < -40 || y < -4 || x > w + 4 || y > h + 16) continue
        const txt = '+' + d + '°'
        ctx.globalAlpha = a * 0.8; ctx.strokeText(txt, x, y)
        ctx.globalAlpha = a; ctx.fillText(txt, x, y)
      }
    }
    ctx.globalAlpha = 1
    ctx.lineJoin = 'miter'
  }
}

/* 4 刻度环：三道圆 + 三级刻度 + 赤经时数字 */
function drawRing(ctx, f, ox, oy, z, span, dist) {
  const { w, h } = f
  if (dist.far < R_SCALE_IN * z - 2) return     // 视口完全在盘内
  ctx.strokeStyle = COLOR.ring
  ctx.lineWidth = 1
  ctx.beginPath()
  addCircle(ctx, ox, oy, R_SCALE_IN * z, span, dist)
  addCircle(ctx, ox, oy, R_SCALE_OUT * z, span, dist)
  addCircle(ctx, ox, oy, (R_SCALE_OUT + 4) * z, span, dist)
  // 刻度：屏幕长度 < 1.5px 的那一级整级省略；视口外的逐根裁掉
  const r0 = R_SCALE_IN * z
  const TL = tickLen()
  const show = TL.map((l) => l * z >= 1.5)
  for (const t of ticks) {
    if (!show[t.level]) continue
    const x0 = ox + t.ux * r0, y0 = oy + t.uy * r0
    if (x0 < -30 || y0 < -30 || x0 > w + 30 || y0 > h + 30) continue
    const r1 = r0 + TL[t.level] * z
    ctx.moveTo(x0, y0); ctx.lineTo(ox + t.ux * r1, oy + t.uy * r1)
  }
  ctx.stroke()

  // 赤经时数字：字号受环带宽度约束（拉远时缩小，过小不画）；"h" 作上标
  const band = (R_SCALE_OUT - R_SCALE_MID) * z
  const px = Math.min(HOUR_PX, band * 0.62)
  if (px < 5.5) return
  if (!hourW) {
    ctx.font = `100px ${FONT_SERIF}`
    hourW = { n: hours.map((hr) => ctx.measureText(hr.label).width), h: 0 }
    ctx.font = `italic 100px ${FONT_SERIF}`
    hourW.h = ctx.measureText('h').width
  }
  const hpx = px * 0.66, k = px / 100, kh = hpx / 100
  const R = R_HOUR_TEXT * z, dpr = f.dpr || 1
  const items = []
  for (let i = 0; i < 24; i++) {
    const hr = hours[i], x = ox + hr.ux * R, y = oy + hr.uy * R
    if (x < -20 || y < -20 || x > w + 20 || y > h + 20) continue
    const wn = hourW.n[i] * k, wh = hourW.h * kh, tot = wn + wh + px * 0.04
    items.push({ x, y, hr, xs: -tot / 2, xh: -tot / 2 + wn + px * 0.04 })
  }
  if (!items.length) return
  ctx.fillStyle = COLOR.ringDim
  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'
  const base = px * 0.36          // 基线相对字中心的下移量（近似 x 高 / 2 + 数字字身）
  ctx.font = `${px.toFixed(2)}px ${FONT_SERIF}`
  for (const it of items) {
    const c = Math.cos(it.hr.rot), s = Math.sin(it.hr.rot)
    ctx.setTransform(dpr * c, dpr * s, -dpr * s, dpr * c, dpr * it.x, dpr * it.y)
    ctx.fillText(it.hr.label, it.xs, base)
  }
  ctx.font = `italic ${hpx.toFixed(2)}px ${FONT_SERIF}`
  for (const it of items) {
    const c = Math.cos(it.hr.rot), s = Math.sin(it.hr.rot)
    ctx.setTransform(dpr * c, dpr * s, -dpr * s, dpr * c, dpr * it.x, dpr * it.y)
    ctx.fillText('h', it.xh, base - px * 0.34)
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
}

/* 9 研究者刻度：R_RES_TICK → R_RES_TICK_END 的金色短刻；选中 / 关联者 2px，选中时其余压暗 */
function drawResearcherTicks(ctx, f, ox, oy, z) {
  const { w, h } = f
  const ids = f.focus ? f.focus.ids : null
  const r0 = R_RES_TICK * z, r1 = R_RES_TICK_END * z
  ctx.strokeStyle = COLOR.researcher
  for (const hi of ids ? [false, true] : [false]) {
    ctx.lineWidth = hi ? 2 : 1.2
    ctx.globalAlpha = ids && !hi ? DIM.researcher : 0.9
    ctx.beginPath()
    let any = false
    for (const r of A.researchers) {
      if (ids && ids.has(r.id) !== hi) continue
      const t = resTick.get(r.id)
      if (!t) continue
      const x0 = ox + t.ux * r0, y0 = oy + t.uy * r0
      if (x0 < -30 || y0 < -30 || x0 > w + 30 || y0 > h + 30) continue
      ctx.moveTo(x0, y0); ctx.lineTo(ox + t.ux * r1, oy + t.uy * r1)
      any = true
    }
    if (any) ctx.stroke()
  }
  ctx.globalAlpha = 1
}

/** 研究者引导线 / 刻度的屏幕锚点 */
function anchorOf(P, b) {
  if (b.kind === 'researcher') {
    if (b.anchorX != null) return { x: P.sx(b.anchorX), y: P.sy(b.anchorY) }
    const p = polarToWorld(R_RES_TICK, b.raLabel ?? 0)
    return { x: P.sx(p.x), y: P.sy(p.y) }
  }
  return { x: P.sx(b.x), y: P.sy(b.y) }
}

/** 弧端缩进：星 / 深空天体 = bodyRadius + 2，研究者锚点（刻度起点）= 1 */
const endGap = (b, L) => (b.kind === 'researcher' ? 1 : bodyRadius(b, L) + 2)

/**
 * 8 关联弧：定理/猜想之间二次贝塞尔（向远离天极一侧弯），研究者一端为虚线直线。
 * 生长：第 i 条延迟 min(i·18, 200) ms，时长 ARC_GROW_MS；按 de Casteljau 截取子曲线。
 * 绘制顺序 = 权重升序（强关联最后画、压在上面）。
 */
function drawArcs(ctx, f, sel) {
  const { P, L, w, h } = f
  const edges = f.focus.edges
  const now = f.now, t0 = f.focus.t0 || 0
  const S = anchorOf(P, sel), gS = endGap(sel, L)
  let animating = false
  ctx.lineCap = 'round'
  const dashed = []
  for (let i = edges.length - 1; i >= 0; i--) {
    const e = edges[i], O = A.bodies.get(e.other)
    if (!O) continue
    let t = 1
    if (!f.reducedMotion) {
      t = clamp((now - t0 - Math.min(i * 18, 200)) / ARC_GROW_MS, 0, 1)
      if (t < 1) animating = true
      t = 1 - (1 - t) * (1 - t) * (1 - t)     // easeOutCubic：起笔快、收笔慢
    }
    if (t <= 0) continue
    const B = anchorOf(P, O), gB = endGap(O, L)
    if (e.kind === 'researcher' || sel.kind === 'researcher' || O.kind === 'researcher') {
      dashed.push({ S, B, gS, gB, t })
      continue
    }
    // 控制点：中点 + 法向偏移 0.18·弦长，取远离天极（屏幕上的原点）的那一侧
    const dx = B.x - S.x, dy = B.y - S.y, c = Math.hypot(dx, dy)
    if (c < gS + gB + 1) continue
    const mx = (S.x + B.x) / 2, my = (S.y + B.y) / 2
    let nx = -dy / c, ny = dx / c
    const px0 = P.sx(0), py0 = P.sy(0)
    if (nx * (mx - px0) + ny * (my - py0) < 0) { nx = -nx; ny = -ny }
    const cx = mx + nx * 0.18 * c, cy = my + ny * 0.18 * c
    // 包围盒裁剪（贝塞尔在三个控制点凸包内）
    if (Math.max(S.x, B.x, cx) < -4 || Math.min(S.x, B.x, cx) > w + 4 || Math.max(S.y, B.y, cy) < -4 || Math.min(S.y, B.y, cy) > h + 4) continue
    // 弧长 ≈ 1.02c（偏移 0.18 时）；两端缩进换算成参数
    const len = c * 1.02
    const u0 = gS / len, u1 = Math.min(u0 + (1 - u0 - gB / len) * t, 1 - gB / len)
    if (u1 <= u0) continue
    const q = subQuad(S.x, S.y, cx, cy, B.x, B.y, u0, u1)
    ctx.strokeStyle = e.kind === 'conj' ? COLOR.arcConj : COLOR.arcTheorem
    ctx.lineWidth = 0.8 + 1.6 * e.weight
    ctx.globalAlpha = 0.35 + 0.55 * e.weight
    ctx.beginPath()
    ctx.moveTo(q[0], q[1]); ctx.quadraticCurveTo(q[2], q[3], q[4], q[5])
    ctx.stroke()
  }
  // 研究者引导线：1px 虚线 [3,3]，从选中端向另一端生长；同色同宽合成一条 path
  if (dashed.length) {
    ctx.lineCap = 'butt'
    ctx.strokeStyle = COLOR.arcResearcher
    ctx.lineWidth = 1
    ctx.globalAlpha = 0.85
    ctx.setLineDash([3, 3])
    ctx.beginPath()
    for (const d of dashed) {
      const dx = d.B.x - d.S.x, dy = d.B.y - d.S.y, c = Math.hypot(dx, dy)
      if (c < d.gS + d.gB + 1) continue
      const ux = dx / c, uy = dy / c, a = d.gS, b = a + (c - d.gS - d.gB) * d.t
      const x0 = d.S.x + ux * a, y0 = d.S.y + uy * a, x1 = d.S.x + ux * b, y1 = d.S.y + uy * b
      if (Math.max(x0, x1) < -4 || Math.min(x0, x1) > w + 4 || Math.max(y0, y1) < -4 || Math.min(y0, y1) > h + 4) continue
      ctx.moveTo(x0, y0); ctx.lineTo(x1, y1)
    }
    ctx.stroke()
    ctx.setLineDash([])
  }
  ctx.globalAlpha = 1
  ctx.lineCap = 'butt'
  return animating
}

/** 二次贝塞尔 (P0, C, P1) 在参数 [u0, u1] 上的子曲线 → [x0,y0, cx,cy, x1,y1]（开花公式） */
function subQuad(x0, y0, cx, cy, x1, y1, u0, u1) {
  const at = (u) => { const m = 1 - u; return [m * m * x0 + 2 * m * u * cx + u * u * x1, m * m * y0 + 2 * m * u * cy + u * u * y1] }
  // 子曲线控制点 = 开花值 b(u0, u1) = (1-u0)(1-u1)P0 + [(1-u0)u1 + u0(1-u1)]C + u0·u1·P1
  const a = (1 - u0) * (1 - u1), b = (1 - u0) * u1 + u0 * (1 - u1), c = u0 * u1
  const p = at(u0), q = at(u1)
  return [p[0], p[1], a * x0 + b * cx + c * x1, a * y0 + b * cy + c * y1, q[0], q[1]]
}

/* ───────── drawOverlay（§5.2，在标签之上） ───────── */

/** 准星 / 命中圈的中心与半径：研究者用刻度中点（名字由 labels 画，圈不压字） */
function markOf(P, b, L) {
  if (b.kind === 'researcher') {
    const t = resTick.get(b.id)
    if (t) return { x: P.sx(t.mx), y: P.sy(t.my), r: 5 }
  }
  return { x: P.sx(b.x), y: P.sy(b.y), r: bodyRadius(b, L) }
}

/** 可视区（扣掉右侧面板 / 底部抽屉）：{x0, y0, x1, y1} */
function visibleRect(f) {
  let x1 = f.w, y1 = f.h
  const p = state.occluders && state.occluders.get ? state.occluders.get('panel') : null
  if (p) {
    if (p.x > 1 && p.y <= 1 && p.h >= f.h * 0.5) x1 = Math.min(x1, p.x)        // 右侧面板
    else if (p.y > 1 && p.w >= f.w * 0.5) y1 = Math.min(y1, p.y)              // 底部抽屉
  }
  return { x0: 0, y0: 0, x1, y1 }
}

/**
 * 画搜索命中圈 + 脉冲、悬停圈、选中准星、选中目标离屏箭头。
 * @returns {boolean} 搜索脉冲是否仍在进行
 */
export function drawOverlay(ctx, f) {
  if (!A || A !== f.atlas) initRender(f.atlas)
  const t0 = performance.now()
  const { P, L, w, h } = f
  let animating = false
  ctx.save()
  ctx.setLineDash([]); ctx.lineCap = 'butt'; ctx.globalAlpha = 1

  /* 搜索命中：前 30 个；1.2 s 内一次向外扩散的脉冲 */
  const hits = f.searchHits || []
  if (hits.length) {
    const age = f.now - (f.searchT0 || 0)
    const pulse = !f.reducedMotion && age >= 0 && age < PULSE_MS
    const marks = []
    for (let i = 0; i < hits.length && i < 30; i++) {
      const b = A.bodies.get(hits[i])
      if (!b) continue
      const m = markOf(P, b, L)
      if (m.x < -30 || m.y < -30 || m.x > w + 30 || m.y > h + 30) continue
      marks.push(m)
    }
    ctx.strokeStyle = COLOR.searchHit
    ctx.lineWidth = 1.2
    ctx.beginPath()
    for (const m of marks) { const R = m.r + 5; ctx.moveTo(m.x + R, m.y); ctx.arc(m.x, m.y, R, 0, TAU) }
    ctx.stroke()
    if (pulse) {
      const k = age / PULSE_MS, e = 1 - (1 - k) * (1 - k)
      ctx.globalAlpha = 1 - k
      ctx.lineWidth = 1
      ctx.beginPath()
      for (const m of marks) { const R = m.r + 5 + 14 * e; ctx.moveTo(m.x + R, m.y); ctx.arc(m.x, m.y, R, 0, TAU) }
      ctx.stroke()
      ctx.globalAlpha = 1
      animating = true
    }
  }

  /* 悬停圈（选中者本身不画，由准星代替） */
  if (f.hover && f.hover.kind === 'body' && f.hover.id !== f.selected) {
    const b = A.bodies.get(f.hover.id)
    if (b) {
      const m = markOf(P, b, L)
      ctx.strokeStyle = COLOR.reticle
      ctx.lineWidth = 1
      ctx.globalAlpha = 0.9
      ctx.beginPath(); ctx.arc(m.x, m.y, m.r + 4, 0, TAU); ctx.stroke()
      ctx.globalAlpha = 1
    }
  }

  /* 选中：准星，或离屏时可视区边缘的指向箭头 */
  const sel = f.selected ? A.bodies.get(f.selected) : null
  if (sel) {
    const m = markOf(P, sel, L), vr = visibleRect(f)
    const inside = m.x >= vr.x0 && m.y >= vr.y0 && m.x <= vr.x1 && m.y <= vr.y1
    ctx.strokeStyle = COLOR.reticle
    ctx.fillStyle = COLOR.reticle
    if (inside) {
      const r1 = m.r + 6, r2 = m.r + 10
      ctx.lineWidth = 1
      ctx.beginPath(); ctx.arc(m.x, m.y, r1, 0, TAU); ctx.stroke()
      ctx.globalAlpha = 0.5
      ctx.beginPath(); ctx.arc(m.x, m.y, r2, 0, TAU); ctx.stroke()
      ctx.globalAlpha = 1
      // 四个方向的 5px 短刻：从外圈向外
      ctx.beginPath()
      ctx.moveTo(m.x, m.y - r2); ctx.lineTo(m.x, m.y - r2 - 5)
      ctx.moveTo(m.x, m.y + r2); ctx.lineTo(m.x, m.y + r2 + 5)
      ctx.moveTo(m.x - r2, m.y); ctx.lineTo(m.x - r2 - 5, m.y)
      ctx.moveTo(m.x + r2, m.y); ctx.lineTo(m.x + r2 + 5, m.y)
      ctx.stroke()
    } else {
      drawEdgeArrow(ctx, vr, m.x, m.y)
    }
  }

  ctx.restore()
  perf.overlayMs = performance.now() - t0
  return animating
}

/** 在可视区边缘（内缩 14px）画一个指向 (tx, ty) 的 8px 实心小三角（带底色晕边） */
function drawEdgeArrow(ctx, vr, tx, ty) {
  const m = 14
  const cx = (vr.x0 + vr.x1) / 2, cy = (vr.y0 + vr.y1) / 2
  const dx = tx - cx, dy = ty - cy
  if (!dx && !dy) return
  const hx = (vr.x1 - vr.x0) / 2 - m, hy = (vr.y1 - vr.y0) / 2 - m
  if (hx <= 0 || hy <= 0) return
  const s = Math.min(dx ? hx / Math.abs(dx) : Infinity, dy ? hy / Math.abs(dy) : Infinity)
  const x = cx + dx * s, y = cy + dy * s
  const len = Math.hypot(dx, dy), ux = dx / len, uy = dy / len
  const L = 8, W = 5
  ctx.beginPath()
  ctx.moveTo(x + ux * L * 0.5, y + uy * L * 0.5)
  ctx.lineTo(x - ux * L * 0.5 - uy * W, y - uy * L * 0.5 + ux * W)
  ctx.lineTo(x - ux * L * 0.5 + uy * W, y - uy * L * 0.5 - ux * W)
  ctx.closePath()
  ctx.lineJoin = 'round'
  ctx.lineWidth = 3
  ctx.strokeStyle = COLOR.labelHalo
  ctx.stroke()
  ctx.fillStyle = COLOR.reticle
  ctx.fill()
}
