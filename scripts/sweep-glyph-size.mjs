/**
 * 扫掠公式世界尺寸，找"屏幕可读性"与"重叠率"的最佳平衡。
 *
 * ── 为什么这是有效的杠杆 ──
 * 相机取景由**盘半径**决定（LAYOUT.radiusOuter），与公式大小无关。
 * 所以把所有公式放大时：
 *   · 相机距离不变 → 屏幕像素尺寸**线性变大**
 *   · 盘半径基本不变（节点被夹在 r ± radialFreedom·r 的带里）
 *   · 只有重叠率上升
 * 于是"放大公式"几乎是纯收益，直到重叠率触顶。
 *
 * 反过来，放大盘半径是**无效**的：相机跟着退远，屏幕尺寸原地不动。
 *
 * 用法: node scripts/sweep-glyph-size.mjs
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const raw = JSON.parse(readFileSync(resolve('scripts', '.node-layout.json'), 'utf8'))
  .map((n) => ({ ...n, aspect: n.aspect ?? (n.w / n.h) }))   // 缓存里可能没有 aspect，由 w/h 推
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v))

/* graph.js 里尺寸的算法：面积 = (baseSize × sizeScale)²，再按宽高比摊开 */
const BASE = 7.2, SIZEMIN = 0.60, SIZEMAX = 1.78, SIZECURVE = 0.85
const MAXW = 54, MAXH = 12

function sizesFor(n, scale) {
  const sizeScale = SIZEMIN + Math.pow(n.rank, SIZECURVE) * (SIZEMAX - SIZEMIN)
  const area = (BASE * scale * sizeScale) ** 2
  const W = Math.sqrt(area * n.aspect)
  const H = Math.sqrt(area / n.aspect)
  // 上限也要跟着缩放，否则放大后所有长公式都被同一个 maxWidth 截断，
  // 反而失去"重要度决定大小"的层次
  const k = Math.min(1, (MAXW * scale) / W, (MAXH * scale) / H)
  return { W: W * k, H: H * k }
}

function assignRadii(nodes, R_OUT, hFrac, rInner) {
  const h = R_OUT * hFrac
  const A = (r) => 1 - (1 + r / h) * Math.exp(-r / h)
  const a0 = A(rInner), a1 = A(R_OUT)
  const inv = (t) => { let lo = rInner, hi = R_OUT * 4; for (let i = 0; i < 50; i++) { const m = (lo + hi) / 2; if (A(m) < t) lo = m; else hi = m } return (lo + hi) / 2 }
  const order = [...nodes].sort((a, b) => b.rank - a.rank)
  const N = order.length
  const out = new Map()
  order.forEach((n, i) => out.set(n.id, inv(a0 + ((i + 0.5) / N) * (a1 - a0))))
  return out
}

const SPACING = 1.16, ALLOW = 0.86, ITERS = 60

function relaxPositions(nodes, radii, rInner, freedom, scale) {
  const ns = nodes.map((n) => {
    const r = radii.get(n.id)
    const { W, H } = sizesFor(n, scale)
    return { id: n.id, rank: n.rank, w: W, h: H, radius: r,
             x: Math.cos(n.theta) * r, z: Math.sin(n.theta) * r }
  })
  for (const n of ns) {
    const f = freedom * n.radius
    n.radiusMin = Math.max(rInner * 0.35, n.radius - f)
    n.radiusMax = n.radius + f
  }
  for (let it = 0; it < ITERS; it++) {
    const strength = 0.5 * (1 - it / ITERS) + 0.12
    for (let i = 0; i < ns.length; i++) {
      const a = ns[i], ra = Math.max(a.w, a.h) * 0.5 * SPACING
      for (let j = i + 1; j < ns.length; j++) {
        const b = ns[j], rb = Math.max(b.w, b.h) * 0.5 * SPACING
        const minD = (ra + rb) * ALLOW
        let dx = b.x - a.x, dz = b.z - a.z
        const d2 = dx * dx + dz * dz
        if (d2 >= minD * minD) continue
        let d = Math.sqrt(d2)
        if (d < 1e-6) { dx = (i % 7) - 3; dz = (j % 5) - 2; d = Math.hypot(dx, dz) || 1e-3 }
        const push = ((minD - d) / d) * strength
        a.x -= dx * push; a.z -= dz * push
        b.x += dx * push; b.z += dz * push
      }
    }
    for (const n of ns) {
      const r = Math.hypot(n.x, n.z)
      if (r < 1e-6) continue
      const rc = clamp(r, n.radiusMin, n.radiusMax)
      if (rc !== r) { const k = rc / r; n.x *= k; n.z *= k }
    }
  }
  return ns
}

function burying(ns) {
  const out = ns.map(() => 0)
  let ov = 0, tot = 0
  for (let i = 0; i < ns.length; i++) for (let j = i + 1; j < ns.length; j++) {
    tot++
    const a = ns[i], b = ns[j]
    const dx = Math.abs(a.x - b.x), dz = Math.abs(a.z - b.z)
    const rx = (a.w + b.w) / 2, rz = (a.h + b.h) / 2
    const t = (dx / rx) ** 2 + (dz / rz) ** 2
    if (t < 1) { ov++; const s = 1 - t; out[i] += s; out[j] += s }
  }
  return { fracs: out.map((v) => Math.min(1, v)), pct: (ov / tot) * 100 }
}

function spearman(ns) {
  const n = ns.length
  const rank = (arr) => { const idx = arr.map((v, i) => [v, i]).sort((a, b) => a[0] - b[0]); const r = new Array(n); idx.forEach(([, i], k) => { r[i] = k }); return r }
  const ra = rank(ns.map((x) => x.rank)), rb = rank(ns.map((x) => Math.hypot(x.x, x.z)))
  const mean = (a) => a.reduce((s, v) => s + v, 0) / n
  const ma = mean(ra), mb = mean(rb)
  let num = 0, da = 0, db = 0
  for (let i = 0; i < n; i++) { num += (ra[i] - ma) * (rb[i] - mb); da += (ra[i] - ma) ** 2; db += (rb[i] - mb) ** 2 }
  return num / Math.sqrt(da * db)
}

/* 屏幕像素换算。
 * 相机取景距离（scene.js 的 fitCamera）：
 *     dist = maxR · sinφ / tan(vFov/2) · margin
 * 公式在屏幕上的高度：
 *     px = h · H / (2 · dist · tan(vFov/2))
 *        = h · H / (2 · maxR · sinφ · margin)
 * 也就是 px = C · h / maxR，其中 C = H / (2·sinφ·margin) 与盘半径无关。
 *
 * ⚠ 早先这里用"实测中位 px × 实测盘半径"当 C，那是错的：
 *   两个量都带了各自的距离因子，乘起来并不等于 C。
 *   正确的 C 直接由视口高、俯仰角、取景余量算出。 */
const VIEW_H = 698, TILT = 40 * Math.PI / 180, MARGIN = 1.10
const C = VIEW_H / (2 * Math.sin(TILT) * MARGIN)

const R_OUT = 285, HFRAC = 0.80, FREEDOM = 0.35
console.log('扫掠公式世界尺寸（盘半径固定 285，相机自动取景）\n')
console.log(`  （换算常数 C = ${C.toFixed(0)}，px = C · 世界高度 / 盘半径）\n`)
console.log('  尺寸缩放   重叠%   被压中位  p90    最大   核心被压   盘半径   屏幕高度px(中位/核心)   秩相关')

const rows = []
for (const scale of [1.0, 1.1, 1.2, 1.4, 1.6, 1.8, 2.0, 2.3, 2.6, 3.0]) {
  const rInner = R_OUT * 0.09
  const radii = assignRadii(raw, R_OUT, HFRAC, rInner)
  const ns = relaxPositions(raw, radii, rInner, FREEDOM, scale)
  const { fracs, pct } = burying(ns)
  const sorted = [...fracs].sort((a, b) => a - b)
  const q = (p) => sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * p))]
  const order = [...ns].sort((a, b) => b.rank - a.rank)
  const coreMax = Math.max(...order.slice(0, Math.max(1, Math.floor(ns.length * 0.2))).map((n) => fracs[ns.indexOf(n)]))
  const rho = spearman(ns)
  const maxR = Math.max(...ns.map((n) => Math.hypot(n.x, n.z)))

  const hs = ns.map((n) => n.h).sort((a, b) => a - b)
  const medH = C * hs[Math.floor(hs.length / 2)] / maxR
  const coreH = C * Math.max(...ns.map((n) => n.h)) / maxR

  rows.push({ scale, pct, med: q(0.5), p90: q(0.9), max: sorted[sorted.length - 1], coreMax, maxR, medH, coreH, rho })
  console.log(`   ${scale.toFixed(1)}     ${pct.toFixed(1).padStart(5)}   ${q(0.5).toFixed(3)}   ${q(0.9).toFixed(3)}   ${sorted[sorted.length - 1].toFixed(3)}    ${coreMax.toFixed(3)}   ${maxR.toFixed(0).padStart(6)}      ${medH.toFixed(1).padStart(5)} / ${coreH.toFixed(1).padStart(5)}       ${rho.toFixed(4)}`)
}

console.log('\n筛选：核心被压 < 0.55 且 |秩相关| ≥ 0.93')
const good = rows.filter((r) => r.coreMax < 0.55 && Math.abs(r.rho) >= 0.93)
if (good.length) {
  good.sort((a, b) => b.medH - a.medH)
  const b = good[0]
  console.log(`\n推荐尺寸缩放 = ${b.scale}`)
  console.log(`  重叠 ${b.pct.toFixed(1)}%   核心被压 ${b.coreMax.toFixed(3)}   秩相关 ${b.rho.toFixed(4)}`)
  console.log(`  屏幕高度 中位 ${b.medH.toFixed(1)}px / 核心 ${b.coreH.toFixed(1)}px`)
  console.log(`  → GLYPH.baseSize = ${(7.2 * b.scale).toFixed(1)}, maxWidth = ${(54 * b.scale).toFixed(0)}`)
} else {
  console.log('\n无满足条件的缩放。')
  for (const r of rows.slice().sort((a, b) => a.coreMax - b.coreMax).slice(0, 5))
    console.log(`  scale=${r.scale} 核心被压=${r.coreMax.toFixed(3)} 秩相关=${r.rho.toFixed(4)} 中位px=${r.medH.toFixed(1)}`)
}
