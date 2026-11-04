/**
 * 扫「目标分离度 allow」—— 决定松弛到底把公式推到多开。
 *
 * ── 为什么这是最关键的一个旋钮 ──
 * 松弛里 allow 的含义是"允许两公式靠到多近"：
 *   allow = 1.0 → 要求完全分开（屏幕上不重叠）
 *   allow < 1.0 → 允许互相压进来（当前 0.86，即允许多占 14%）
 *
 * 实测盘面投影后的填充率约 0.46，而水平长条"货架式"装箱能装到 0.65~0.70
 * 都不重叠 —— 也就是说**几何上是有可能完全不重叠的**，
 * 之所以现在核心公式可读竖带只有 0~2px、112 个公式被完全遮住，
 * 是因为松弛太早就停在一个"随机松散"的亚稳态，而不是"压实"态。
 *
 * 本脚本扫 allow × 迭代次数 × 盘半径，找"核心能读"的组合。
 *
 * 用法: node scripts/sweep-allow.mjs
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const raw = JSON.parse(readFileSync(resolve('scripts', '.node-layout.json'), 'utf8'))
  .map((n) => ({ ...n, aspect: n.w / n.h }))
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v))

const BASE = 7.2, SIZEMIN = 0.60, SIZEMAX = 1.78, SIZECURVE = 0.85
const MAXW = 54, MAXH = 12
const SPACING = 1.16
const VIEW_W = 1568, VIEW_H = 698, VFOV = 55
const TILT = 40 * Math.PI / 180, MARGIN = 1.10
const TANV = Math.tan(VFOV * Math.PI / 360)

function sizesFor(n) {
  const ss = SIZEMIN + Math.pow(n.rank, SIZECURVE) * (SIZEMAX - SIZEMIN)
  const area = (BASE * ss) ** 2
  const W = Math.sqrt(area * n.aspect), H = Math.sqrt(area / n.aspect)
  const k = Math.min(1, MAXW / W, MAXH / H)
  return { W: W * k, H: H * k }
}
const SIZES = new Map(raw.map((n) => [n.id, sizesFor(n)]))

function assignRadii(nodes, R, rIn, hFrac) {
  const h = R * hFrac
  const A = (r) => 1 - (1 + r / h) * Math.exp(-r / h)
  const a0 = A(rIn), a1 = A(R)
  const inv = (t) => { let lo = rIn, hi = R * 4; for (let i = 0; i < 50; i++) { const m = (lo + hi) / 2; if (A(m) < t) lo = m; else hi = m } return (lo + hi) / 2 }
  const order = [...nodes].sort((a, b) => b.rank - a.rank)
  const N = order.length
  const out = new Map()
  // 面积分位：大公式多占份额，核心不再超载
  const areas = order.map((n) => { const s = SIZES.get(n.id); return s.W * s.H })
  const tot = areas.reduce((s, v) => s + v, 0)
  let cum = 0
  order.forEach((n, i) => {
    cum += areas[i]
    const c = (cum - areas[i] / 2) / tot
    out.set(n.id, inv(a0 + c * (a1 - a0)))
  })
  return out
}

/** 精确的各向异性松弛：在归一化椭圆空间里把两节点推到 allow 距离 */
function relax(nodes, radii, rIn, freedom, squash, allow, iters) {
  const ns = nodes.map((n) => {
    const { W, H } = SIZES.get(n.id)
    const r = radii.get(n.id)
    return { id: n.id, rank: n.rank, w: W, h: H, r, x: Math.cos(n.theta) * r, z: Math.sin(n.theta) * r }
  })
  for (const n of ns) {
    const f = freedom * n.r
    n.rMin = Math.max(rIn * 0.3, n.r - f)
    n.rMax = n.r + f
  }
  for (let it = 0; it < iters; it++) {
    const strength = 0.85 * (1 - it / iters) + 0.15
    for (let i = 0; i < ns.length; i++) {
      const a = ns[i]
      const ra = Math.hypot(a.x, a.z)
      if (ra < 1e-6) continue
      const tax = -a.z / ra, taz = a.x / ra     // 切向（屏幕水平）
      const rax = a.x / ra, raz = a.z / ra      // 径向（屏幕竖直，被压缩）
      for (let j = i + 1; j < ns.length; j++) {
        const b = ns[j]
        const dx = b.x - a.x, dz = b.z - a.z
        const dt = dx * tax + dz * taz
        const dr = dx * rax + dz * raz
        const ax = (a.w + b.w) * 0.5 * SPACING
        const az = (a.h + b.h) * 0.5 * SPACING * squash
        const u = dt / ax, v = dr / az
        const d = Math.hypot(u, v)
        if (d >= allow || d < 1e-9) continue
        // 归一化空间里沿径向方向补足 (allow − d)，再换算回世界空间
        const need = (allow - d) * strength * 0.5 / d
        const ddt = u * need * ax
        const ddr = v * need * az
        a.x -= tax * ddt + rax * ddr; a.z -= taz * ddt + raz * ddr
        b.x += tax * ddt + rax * ddr; b.z += taz * ddt + raz * ddr
      }
    }
    for (const n of ns) {
      const r = Math.hypot(n.x, n.z)
      if (r < 1e-6) continue
      const rc = clamp(r, n.rMin, n.rMax)
      if (rc !== r) { const k = rc / r; n.x *= k; n.z *= k }
    }
  }
  return ns
}

/** 真指标：未被遮挡的最长连续像素行（可读竖带） */
function screenMetrics(ns, azDeg) {
  const maxR = Math.max(...ns.map((n) => Math.hypot(n.x, n.z)))
  const dist = maxR * Math.sin(TILT) / TANV * MARGIN
  const az = azDeg * Math.PI / 180
  const cx = dist * Math.cos(TILT) * Math.sin(az), cy = dist * Math.sin(TILT), cz = dist * Math.cos(TILT) * Math.cos(az)
  const fwd = [-cx / dist, -cy / dist, -cz / dist]
  let rx = fwd[2], ry = 0, rz = -fwd[0]
  const rl = Math.hypot(rx, ry, rz) || 1; rx /= rl; ry /= rl; rz /= rl
  const ux = ry * fwd[2] - rz * fwd[1], uy = rz * fwd[0] - rx * fwd[2], uz = rx * fwd[1] - ry * fwd[0]

  const q = []
  for (const n of ns) {
    const vx = n.x - cx, vy = -cy, vz = n.z - cz
    const depth = vx * fwd[0] + vy * fwd[1] + vz * fwd[2]
    if (depth <= 1) continue
    const ppw = VIEW_H / (2 * depth * TANV)
    const sxp = VIEW_W / 2 + (vx * rx + vy * ry + vz * rz) * ppw
    const syp = VIEW_H / 2 - (vx * ux + vy * uy + vz * uz) * ppw
    q.push({ x0: sxp - n.w * ppw / 2, x1: sxp + n.w * ppw / 2,
             y0: syp - n.h * ppw / 2, y1: syp + n.h * ppw / 2,
             W: n.w * ppw, H: n.h * ppw, rank: n.rank })
  }
  const bands = []
  let buried = 0
  for (const a of q) {
    const y0 = Math.max(0, Math.floor(a.y0)), y1 = Math.min(VIEW_H - 1, Math.ceil(a.y1))
    const hgt = Math.max(1, y1 - y0 + 1)
    const blk = new Uint8Array(hgt)
    for (const b of q) {
      if (b === a) continue
      if (b.x1 <= a.x0 || b.x0 >= a.x1) continue
      const by0 = Math.max(y0, Math.floor(b.y0)), by1 = Math.min(y1, Math.ceil(b.y1))
      for (let y = by0; y <= by1; y++) if (y - y0 < hgt) blk[y - y0] = 1
    }
    let best = 0, cur = 0
    for (let i = 0; i < hgt; i++) { if (!blk[i]) { cur++; if (cur > best) best = cur } else cur = 0 }
    bands.push({ rank: a.rank, band: best, H: a.H })
    if (best === 0) buried++
  }
  const sb = bands.map((b) => b.band).sort((a, b) => a - b)
  const core = bands.slice().sort((a, b) => b.rank - a.rank).slice(0, Math.max(1, Math.floor(bands.length * 0.2)))
  const allH = q.map((x) => x.H).sort((a, b) => a - b)
  return {
    maxR, bandMed: sb[Math.floor(sb.length / 2)], bandP25: sb[Math.floor(sb.length * 0.25)],
    buried: buried / bands.length, coreBandMin: Math.min(...core.map((c) => c.band)),
    coreBandMed: core.reduce((s, c) => s + c.band, 0) / core.length,
    coreBandAvg: core.reduce((s, c) => s + c.band, 0) / core.length,
    coreH: core.reduce((s, c) => s + c.H, 0) / core.length,
    coreOk: core.filter((c) => c.band >= 8).length + '/' + core.length,
    medH: allH[Math.floor(allH.length / 2)],
  }
}
function worstOver(ns) {
  const ms = [0, 30, 60, 90, 120, 150].map((a) => screenMetrics(ns, a))
  return {
    bandMed: Math.min(...ms.map((m) => m.bandMed)), bandP25: Math.min(...ms.map((m) => m.bandP25)),
    buried: Math.max(...ms.map((m) => m.buried)), coreBandMin: Math.min(...ms.map((m) => m.coreBandMin)),
    coreBandMed: Math.min(...ms.map((m) => m.coreBandMed)), coreOk: ms.map((m) => m.coreOk).sort()[0],
    coreH: Math.min(...ms.map((m) => m.coreH)), medH: Math.min(...ms.map((m) => m.medH)), maxR: ms[0].maxR,
  }
}

console.log('扫「目标分离度 allow」× 迭代次数（指标：可读竖带 px，≥8px 才能读）\n')
console.log('  自由度  allow  R_OUT  盘半径  填充率  中位带  p25带  完全被遮%  核心均值带  核心达标  核心px  中位px')

const rows = []
for (const freedom of [0.35, 0.60, 0.90]) {
  for (const allow of [0.95, 1.10, 1.25, 1.45]) {
    for (const R of [150, 175, 200]) {
      const iters = 250
      const radii = assignRadii(raw, R, 24, 1.4)
      const ns = relax(raw, radii, 24, freedom, 1.56, allow, iters)
      const m = worstOver(ns)
      const f = 24273/(Math.PI*m.maxR*m.maxR); rows.push({ freedom, allow, iters, R, f, ...m })
      console.log(`  ${freedom.toFixed(2)}  ${allow.toFixed(2)}  ${String(R).padStart(5)}  ${m.maxR.toFixed(0).padStart(5)}  ${f.toFixed(3)}  ${String(m.bandMed).padStart(6)}  ${String(m.bandP25).padStart(5)}   ${(m.buried * 100).toFixed(1).padStart(7)}   ${m.coreBandMed.toFixed(1).padStart(8)}   ${m.coreOk.padStart(6)}  ${m.coreH.toFixed(1).padStart(6)} ${m.medH.toFixed(1).padStart(6)}`)
    }
  }
}

console.log('\n按「核心均值竖带」排序前 12：')
// 综合分：可读性（核心均值带 + 中位带）与拥挤度（被遮率）的平衡
for (const r of rows) r.score = r.coreBandMed + r.bandMed * 0.7 - r.buried * 12
rows.sort((a, b) => b.score - a.score)
console.log('  综合分 = 核心均值带 + 0.7×中位带 − 12×被遮率（越大越好）')
for (const r of rows.slice(0, 12))
  console.log(`  freedom=${r.freedom} allow=${r.allow} R=${r.R} → 分 ${r.score.toFixed(1)} | 核心带 ${r.coreBandMed.toFixed(1)}px 达标 ${r.coreOk} | 中位带 ${r.bandMed}px | 被遮 ${(r.buried*100).toFixed(1)}% | 填充率 ${r.f} | 中位px ${r.medH.toFixed(1)} | 盘 ${r.maxR.toFixed(0)}`)
