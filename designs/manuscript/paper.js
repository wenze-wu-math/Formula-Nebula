/**
 * designs/manuscript/paper.js — 纸面与书桌（模块 M3，SPEC §6.1）。
 *
 * 全部纹理在 boot 时程序生成（canvas 噪声 + 短纤维线 + 周期正弦木纹），不加载任何图片。
 * 关键取舍：
 *   · 阴影不用逐帧 shadowBlur：boot 时把一块模糊矩形烘焙成 9-slice 位图，每页按屏幕尺寸拉伸贴上（4 角 + 4 边 + 不画中心）。
 *     阴影角的屏幕尺寸随 zoom 在 6–28px 间变化，远看是一圈淡影，近看是柔和的落影。
 *   · 泛黄与 foxing 斑是低频信号，所以每页预烘焙一张小图（长边 ~320px，按 page.seed 确定），绘制时拉伸到页面屏幕矩形 ——
 *     每帧每页只多一次 drawImage，而不是几十个径向渐变。
 *   · 纸纤维是高频信号，用 256² 可平铺 pattern，锚定在纸页上（pattern.setTransform 跟随页的屏幕原点），
 *     缩放时纹理尺度 clamp 在 0.5–2 倍：拉远时不变成一片灰，拉近时不变成粗颗粒。
 *   · 书桌纹理同理平铺，随相机平移；暗角用一张缓存的径向渐变（只在视口尺寸变化时重建）。
 */
import { PALETTE } from './constants.js'
import { rng } from './pencil.js'

const TILE = 256
const SHADOW_PAD = 32                   // 9-slice 阴影位图里模糊半径（位图 px）
const AGE_LONG = 320                    // 泛黄 / foxing 预烘焙图的长边像素

function mk(w, h) {
  const c = document.createElement('canvas')
  c.width = w; c.height = h
  return c
}

/* ───────── 可平铺噪声：周期格点值噪声（双线性 + smoothstep），保证 tile 无缝 ───────── */
function tileNoise(R, period) {
  const g = new Float32Array(period * period)
  for (let i = 0; i < g.length; i++) g[i] = R()
  return (x, y) => {   // x, y ∈ [0, period)
    const x0 = Math.floor(x), y0 = Math.floor(y)
    const fx = x - x0, fy = y - y0
    const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy)
    const i0 = ((x0 % period) + period) % period, j0 = ((y0 % period) + period) % period
    const i1 = (i0 + 1) % period, j1 = (j0 + 1) % period
    const a = g[j0 * period + i0], b = g[j0 * period + i1], c = g[j1 * period + i0], d = g[j1 * period + i1]
    return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy
  }
}

/** 纸纤维 tile：低频云絮（纸浆厚薄）+ 像素颗粒 + 短纤维线（含少量跨边的线，画两次保证无缝） */
function makeFiberTile() {
  const c = mk(TILE, TILE)
  const g = c.getContext('2d')
  const R = rng(0x5eed)
  const n1 = tileNoise(R, 8), n2 = tileNoise(R, 32)
  const img = g.createImageData(TILE, TILE)
  const d = img.data
  for (let y = 0; y < TILE; y++) for (let x = 0; x < TILE; x++) {
    const cloud = n1((x / TILE) * 8, (y / TILE) * 8) * 0.6 + n2((x / TILE) * 32, (y / TILE) * 32) * 0.4
    const grain = R()
    // 暗颗粒与亮颗粒都用暖褐色，只调 alpha：叠在纸色上像纸浆的不均匀
    const a = Math.max(0, (cloud - 0.45) * 0.10 + (grain > 0.93 ? 0.07 : 0) + grain * 0.025)
    const i = (y * TILE + x) * 4
    d[i] = 110; d[i + 1] = 86; d[i + 2] = 50; d[i + 3] = Math.round(a * 255)
  }
  g.putImageData(img, 0, 0)
  // 短纤维：略弯的细线，大多与纸的"纵向"成小角度（抄纸时纤维顺着水流）
  g.lineCap = 'round'
  for (let k = 0; k < 150; k++) {
    const x = R() * TILE, y = R() * TILE
    const len = 5 + R() * 18
    const ang = (R() < 0.7 ? Math.PI / 2 : 0) + (R() - 0.5) * 1.3
    const bend = (R() - 0.5) * len * 0.35
    const dark = R() < 0.75
    g.strokeStyle = dark ? PALETTE.fiber : 'rgba(255,252,240,.55)'
    g.lineWidth = 0.5 + R() * 0.7
    for (const [ox, oy] of [[0, 0], [-TILE, 0], [TILE, 0], [0, -TILE], [0, TILE]]) {
      const x0 = x + ox, y0 = y + oy
      const x1 = x0 + Math.cos(ang) * len, y1 = y0 + Math.sin(ang) * len
      if (Math.max(x0, x1) < -2 || Math.min(x0, x1) > TILE + 2 || Math.max(y0, y1) < -2 || Math.min(y0, y1) > TILE + 2) continue
      g.beginPath()
      g.moveTo(x0, y0)
      g.quadraticCurveTo((x0 + x1) / 2 - Math.sin(ang) * bend, (y0 + y1) / 2 + Math.cos(ang) * bend, x1, y1)
      g.stroke()
    }
  }
  return c
}

/** 书桌 tile：横向木纹（周期正弦 + 噪声扰动，两方向都周期，tile 无缝）+ 细颗粒 */
function makeDeskTile() {
  const c = mk(TILE, TILE)
  const g = c.getContext('2d')
  const R = rng(0xdec5)
  const n = tileNoise(R, 16), n2 = tileNoise(R, 64)
  const img = g.createImageData(TILE, TILE)
  const d = img.data
  const TAU = Math.PI * 2
  for (let y = 0; y < TILE; y++) for (let x = 0; x < TILE; x++) {
    const u = x / TILE, v = y / TILE
    const warp = n(u * 16, v * 16) * 2.2 + 0.4 * Math.sin(TAU * u * 2)
    const ring = Math.sin(TAU * (v * 9 + warp)) * 0.5 + 0.5          // 年轮条纹（横向）
    const fine = Math.sin(TAU * (v * 41 + warp * 3)) * 0.5 + 0.5
    const grain = n2(u * 64, v * 64)
    const t = ring * 0.55 + fine * 0.2 + grain * 0.25
    const i = (y * TILE + x) * 4
    // 在 desk 与 deskDeep 之间插值，只用 alpha 叠暗色，底色由 fillRect(desk) 给
    d[i] = 120; d[i + 1] = 100; d[i + 2] = 70
    d[i + 3] = Math.round(Math.max(0, t - 0.25) * 0.20 * 255 + R() * 6)
  }
  g.putImageData(img, 0, 0)
  return c
}

/** 9-slice 阴影：一块圆角矩形的模糊影（只在 boot 时用一次 shadowBlur） */
function makeShadow() {
  const S = SHADOW_PAD * 2 + 24
  const c = mk(S, S)
  const g = c.getContext('2d')
  g.shadowColor = PALETTE.paperShadow
  g.shadowBlur = SHADOW_PAD * 0.75
  g.shadowOffsetX = S * 3              // 把形状本体画到画布外，只留下影子
  g.fillStyle = '#000'
  g.fillRect(SHADOW_PAD - S * 3, SHADOW_PAD, S - 2 * SHADOW_PAD, S - 2 * SHADOW_PAD)
  return c
}

/** boot 一次：生成全部纹理 */
export function makeTextures() {
  return {
    fiber: makeFiberTile(),
    desk: makeDeskTile(),
    shadow: makeShadow(),
    fiberPat: null, deskPat: null,      // pattern 依赖 ctx，首次绘制时创建
    patCtx: null,
    age: new Map(),                     // page.seed → 泛黄/foxing 预烘焙图
    vignette: null, vignetteKey: '',
  }
}

function patterns(ctx, tex) {
  if (tex.patCtx !== ctx) {
    tex.patCtx = ctx
    tex.fiberPat = ctx.createPattern(tex.fiber, 'repeat')
    tex.deskPat = ctx.createPattern(tex.desk, 'repeat')
  }
}

/** 纹理缩放：随 zoom 变，但 clamp 在 0.5–2 倍（SPEC §6.1） */
const texScale = (z, base) => Math.min(2, Math.max(0.5, z * base))

/* ───────── 书桌 ───────── */
export function drawDesk(ctx, tex, vw, vh, cam) {
  ctx.fillStyle = PALETTE.desk
  ctx.fillRect(0, 0, vw, vh)
  if (!tex || !tex.desk) return
  patterns(ctx, tex)
  const z = cam ? cam.z : 1
  const s = texScale(z, 6)
  // 纹理随相机平移：世界原点在屏幕上的位置 = -cam.x * z + 视口中心（近似，不需要精确对齐可见区）
  const ox = cam ? -cam.x * z + vw / 2 : 0, oy = cam ? -cam.y * z + vh / 2 : 0
  if (tex.deskPat && tex.deskPat.setTransform) {
    tex.deskPat.setTransform(new DOMMatrix([s, 0, 0, s, ox % (TILE * s), oy % (TILE * s)]))
    ctx.fillStyle = tex.deskPat
    ctx.fillRect(0, 0, vw, vh)
  }
  // 暗角：桌面四周略暗，像台灯照在中间
  const key = vw + 'x' + vh
  if (tex.vignetteKey !== key) {
    const r = Math.hypot(vw, vh) / 2
    const gr = ctx.createRadialGradient(vw / 2, vh / 2, r * 0.45, vw / 2, vh / 2, r * 1.05)
    gr.addColorStop(0, 'rgba(70,52,28,0)')
    gr.addColorStop(1, 'rgba(70,52,28,.20)')
    tex.vignette = gr; tex.vignetteKey = key
  }
  ctx.fillStyle = tex.vignette
  ctx.fillRect(0, 0, vw, vh)
}
/* ───────── 单页的泛黄与 foxing（按 page.seed 确定，预烘焙一次） ───────── */
function makeAge(page) {
  const asp = page.w / page.h
  const W = asp < 1 ? Math.round(AGE_LONG * asp) : AGE_LONG
  const H = asp < 1 ? AGE_LONG : Math.round(AGE_LONG / asp)
  const c = mk(W, H)
  const g = c.getContext('2d')
  const R = rng((page.seed >>> 0) || 1)
  // 1) 纸边泛黄：四边向内的线性渐变，宽度各边略不同（不同边受光、受潮不同）
  const edge = (x0, y0, x1, y1, a) => {
    const gr = g.createLinearGradient(x0, y0, x1, y1)
    gr.addColorStop(0, `rgba(196,164,104,${a})`)
    gr.addColorStop(0.35, `rgba(214,190,138,${a * 0.35})`)
    gr.addColorStop(1, 'rgba(232,221,196,0)')
    g.fillStyle = gr
    g.fillRect(0, 0, W, H)
  }
  const ew = () => W * (0.045 + R() * 0.04)
  edge(0, 0, ew(), 0, 0.42 + R() * 0.15)
  edge(W, 0, W - ew(), 0, 0.42 + R() * 0.15)
  edge(0, 0, 0, ew(), 0.42 + R() * 0.15)
  edge(0, H, 0, H - ew(), 0.5 + R() * 0.15)
  // 2) 角上更深（翻页的手指、日晒）
  for (const [cx, cy] of [[0, 0], [W, 0], [0, H], [W, H]]) {
    const r = W * (0.12 + R() * 0.12)
    const gr = g.createRadialGradient(cx, cy, 0, cx, cy, r)
    gr.addColorStop(0, `rgba(180,140,80,${0.16 + R() * 0.14})`)
    gr.addColorStop(1, 'rgba(180,140,80,0)')
    g.fillStyle = gr
    g.fillRect(0, 0, W, H)
  }
  // 3) 纸面整体的不均匀：几团极淡的大斑
  for (let i = 0; i < 5; i++) {
    const cx = R() * W, cy = R() * H, r = W * (0.2 + R() * 0.35)
    const gr = g.createRadialGradient(cx, cy, 0, cx, cy, r)
    gr.addColorStop(0, `rgba(214,188,132,${0.05 + R() * 0.06})`)
    gr.addColorStop(1, 'rgba(214,188,132,0)')
    g.fillStyle = gr
    g.fillRect(0, 0, W, H)
  }
  // 4) foxing：锈褐小斑，多在纸边附近，成簇出现
  const clusters = 2 + Math.floor(R() * 3)
  for (let k = 0; k < clusters; k++) {
    const nearEdge = R() < 0.75
    let cx = R() * W, cy = R() * H
    if (nearEdge) { if (R() < 0.5) cx = R() < 0.5 ? R() * W * 0.12 : W - R() * W * 0.12; else cy = R() < 0.5 ? R() * H * 0.1 : H - R() * H * 0.1 }
    const n = 3 + Math.floor(R() * 7)
    for (let i = 0; i < n; i++) {
      const x = cx + (R() - 0.5) * W * 0.12, y = cy + (R() - 0.5) * W * 0.12
      const r = 0.6 + R() * R() * 3.4
      const gr = g.createRadialGradient(x, y, 0, x, y, r * 1.8)
      gr.addColorStop(0, `rgba(150,98,48,${0.22 + R() * 0.2})`)
      gr.addColorStop(0.45, `rgba(165,115,60,${0.12 + R() * 0.08})`)
      gr.addColorStop(1, 'rgba(170,120,70,0)')
      g.fillStyle = gr
      g.beginPath(); g.arc(x, y, r * 1.8, 0, Math.PI * 2); g.fill()
    }
  }
  // 5) 少数页有一圈极淡的水渍（杯底印），确定性地按 seed 决定有无
  if (R() < 0.35) {
    const x = W * (0.2 + R() * 0.6), y = H * (0.15 + R() * 0.7), r = W * (0.08 + R() * 0.05)
    g.strokeStyle = 'rgba(160,120,64,.08)'
    g.lineWidth = 1.2
    g.beginPath(); g.ellipse(x, y, r, r * (0.92 + R() * 0.1), R() * 3, 0.3, Math.PI * 2 - 0.2); g.stroke()
    g.strokeStyle = 'rgba(160,120,64,.05)'
    g.lineWidth = 2.4
    g.beginPath(); g.ellipse(x + 0.6, y + 0.4, r * 0.97, r * 0.95, 0, 0, Math.PI * 2); g.stroke()
  }
  return c
}

/** 9-slice 阴影贴图：shape 映射到 (x,y,w,h)，c = 屏幕上的角尺寸 */
function drawShadow(ctx, img, x, y, w, h, c) {
  const S = img.width, P = SHADOW_PAD, k = P + 4          // 源图：shape 占 [P, S-P]，角切片 k
  const f = c / k
  const o = P * f                                          // 影子伸出 shape 的距离（屏幕 px）
  const X0 = x - o, Y0 = y - o, X1 = x + w + o, Y1 = y + h + o
  const xs = [X0, X0 + c, X1 - c, X1], ys = [Y0, Y0 + c, Y1 - c, Y1]
  if (xs[2] < xs[1] || ys[2] < ys[1]) return
  const ss = [0, k, S - k, S]
  for (let j = 0; j < 3; j++) for (let i = 0; i < 3; i++) {
    const dw = xs[i + 1] - xs[i], dh = ys[j + 1] - ys[j]
    if (dw <= 0 || dh <= 0) continue
    ctx.drawImage(img, ss[i], ss[j], ss[i + 1] - ss[i], ss[j + 1] - ss[j], xs[i], ys[j], dw, dh)
  }
}

/**
 * 一页纸：两层阴影（9-slice 软影 + 一层贴边的接触影）、纸面、纤维、泛黄与 foxing、页边细线、极淡的版心框。
 * sx,sy,sw,sh = 页的屏幕矩形；z = 当前 zoom。
 */
export function drawPage(ctx, tex, page, sx, sy, sw, sh, z) {
  const c = Math.min(28, Math.max(6, z * 110))
  const off = Math.min(9, Math.max(2, z * 30))
  if (tex && tex.shadow) drawShadow(ctx, tex.shadow, sx + off * 0.5, sy + off, sw, sh, c)
  ctx.fillStyle = 'rgba(58,42,18,.16)'
  ctx.fillRect(sx + 0.8, sy + 1.4, sw, sh)
  ctx.fillStyle = PALETTE.paper
  ctx.fillRect(sx, sy, sw, sh)
  if (sw < 40 || !tex) return
  patterns(ctx, tex)
  // 纤维：pattern 锚定在页的屏幕原点 → 平移时纤维跟着纸走
  if (tex.fiberPat && tex.fiberPat.setTransform) {
    const s = texScale(z, 1.6)
    tex.fiberPat.setTransform(new DOMMatrix([s, 0, 0, s, sx, sy]))
    ctx.fillStyle = tex.fiberPat
    ctx.fillRect(sx, sy, sw, sh)
  }
  // 泛黄与 foxing（拉伸的预烘焙小图；低频信号，拉伸不失真）
  let age = tex.age.get(page.seed)
  if (!age) { age = makeAge(page); tex.age.set(page.seed, age) }
  ctx.drawImage(age, sx, sy, sw, sh)
  // 纸边：一条极细的暗线让纸边清楚（远看不糊进书桌）
  ctx.strokeStyle = 'rgba(120,92,50,.28)'
  ctx.lineWidth = 1
  ctx.strokeRect(Math.round(sx) + 0.5, Math.round(sy) + 0.5, Math.round(sw) - 1, Math.round(sh) - 1)
  // 极淡的版心框：正文区 ∪ 页边区外扩一点（像抄写前用铅笔打的格）
  if (sw > 160 && page.text) {
    const k = sw / page.w
    let x0 = page.text.x, y0 = page.text.y, x1 = page.text.x + page.text.w, y1 = page.text.y + page.text.h
    if (page.margin) { x1 = Math.max(x1, page.margin.x + page.margin.w); y1 = Math.max(y1, page.margin.y + page.margin.h) }
    const pad = 40
    ctx.strokeStyle = 'rgba(110,90,60,.13)'
    ctx.lineWidth = 1
    ctx.strokeRect(sx + (x0 - pad - page.x) * k, sy + (y0 - pad - page.y) * k, (x1 - x0 + 2 * pad) * k, (y1 - y0 + 2 * pad) * k)
  }
}
