/**
 * 按「面积分位」而不是「个数分位」分配半径 —— 并对比几种分配方式。
 *
 * ── 问题 ──
 * 原来把 257 个公式按重要度排序后，每个取 (i+0.5)/N 的**个数**分位。
 * 但公式大小与重要度正相关（越重要越大），于是核心区同时承受两个惩罚：
 *   1. 个数多（前 20% 都被塞进盘心）
 *   2. 每个还特别大（核心公式面积约为边缘的 3 倍）
 * 实测：核心只占盘面 8.3% 的面积，却要装 20% 的公式 —— 超载 2.4 倍，
 * 所以盘心必然糊成一团（核心公式可读竖带 0px，112 个公式被完全遮住）。
 *
 * ── 修法 ──
 * 让「累计占用面积」与「累计可用面积」对齐：
 *   c_i = (Σ_{j<i} a_j + a_i/2) / Σ a_j      a_i = 宽_i × 高_i
 *   r_i = 使环带面积占比等于 c_i 的半径
 * 这样大公式自动多占面积份额、把后面的公式往外推，核心不再超载。
 *
 * 同时保留"越重要越靠内"的单调性（仍按重要度排序后再分配半径）。
 *
 * 用法: node scripts/test-area-quantile.mjs
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const raw = JSON.parse(readFileSync(resolve('scripts', '.node-layout.json'), 'utf8'))
  .map((n) => ({ ...n, aspect: n.w / n.h }))
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v))

const BASE = 7.2, SIZEMIN = 0.60, SIZEMAX = 1.78, SIZECURVE = 0.85
const MAXW = 54, MAXH = 12
const SPACING = 1.16, ALLOW = 0.86, ITERS = 80
const VIEW_W = 1568, VIEW_H = 698, VFOV = 55
const TILT = 40 * Math.PI / 180, MARGIN = 1.10

const _RANK = new Map(raw.map((n) => [n.id, n.rank]))

function sizesFor(n, sizeBoost = 1.0, maxW = MAXW, maxH = MAXH) {
  const ss = SIZEMIN + Math.pow(n.rank, SIZECURVE) * (SIZEMAX - SIZEMIN)
  const area = (BASE * sizeBoost * ss) ** 2
  const W = Math.sqrt(area * n.aspect), H = Math.sqrt(area / n.aspect)
  const k = Math.min(1, maxW / W, maxH / H)
  return { W: W * k, H: H * k }
}

/** 分配半径。mode: 'count' = 旧的个数分位；'area' = 面积分位 */
function assignRadii(nodes, R, rIn, hFrac, mode, sizes) {
  const h = R * hFrac
  const Aexp = (r) => 1 - (1 + r / h) * Math.exp(-r / h)
  const a0 = Aexp(rIn), a1 = Aexp(R)
  const invExp = (t) => { let lo = rIn, hi = R * 4; for (let i = 0; i < 50; i++) { const m = (lo + hi) / 2; if (Aexp(m) < t) lo = m; else hi = m } return (lo + hi) / 2 }

  // 统一盘（面积均匀）：环带面积 ∝ r² − rIn²
  const invUni = (c) => Math.sqrt(rIn * rIn + c * (R * R - rIn * rIn))

  const order = [...nodes].sort((a, b) => b.rank - a.rank)
  const N = order.length
  const out = new Map()

  if (mode === 'count') {
    order.forEach((n, i) => out.set(n.id, invExp(a0 + ((i + 0.5) / N) * (a1 - a0))))
    return out
  }

  // 面积分位
  const areas = order.map((n) => { const s = sizes.get(n.id); return s.W * s.H })
  const total = areas.reduce((s, v) => s + v, 0)
  let cum = 0
  order.forEach((n, i) => {
    cum += areas[i]
    const c = (cum - areas[i] / 2) / total      // 该公式面积份额的中点
    out.set(n.id, hFrac >= 900 ? invUni(c) : invExp(a0 + c * (a1 - a0)))
  })
  return out
}

function relax(nodes, radii, sizes, rIn, freedom, squash) {
  const ns = nodes.map((n) => {
    const { W, H } = sizes.get(n.id)
    const r = radii.get(n.id)
    return { id: n.id, rank: n.rank, w: W, h: H, r, x: Math.cos(n.theta) * r, z: Math.sin(n.theta) * r }
  })
  for (const n of ns) {
    const f = freedom * n.r
    n.rMin = Math.max(rIn * 0.3, n.r - f)
    n.rMax = n.r + f
  }
  for (let it = 0; it < ITERS; it++) {
    const strength = 0.5 * (1 - it / ITERS) + 0.12
    for (let i = 0; i < ns.length; i++) {
      const a = ns[i]
      const ra = Math.hypot(a.x, a.z)
      if (ra < 1e-6) continue
      const utax = -a.z / ra, utaz = a.x / ra
      const urax = a.x / ra, uraz = a.z / ra
      for (let j = i + 1; j < ns.length; j++) {
        const b = ns[j]
        const dx = b.x - a.x, dz = b.z - a.z
        const dt = dx * utax + dz * utaz, dr = dx * urax + dz * uraz
        const ax = (a.w + b.w) * 0.5 * SPACING
        const az = (a.h + b.h) * 0.5 * SPACING * squash
        const ex = dt / ax, ez = dr / az
        const e2 = ex * ex + ez * ez
        if (e2 >= ALLOW * ALLOW) continue
        const d = Math.sqrt(e2) || 1e-6
        const gx = (ex / ax) / d, gz = (ez / az) / d
        const gl = Math.hypot(gx, gz) || 1e-6
        const need = (ALLOW - d) * strength * 0.5 / gl
        a.x -= (gx / gl) * need; a.z -= (gz / gl) * need
        b.x += (gx / gl) * need; b.z += (gz / gl) * need
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

/** 真指标：每个公式"未被遮挡的最长连续像素行"（可读竖带） */
function screenMetrics(ns, azDeg) {
  const maxR = Math.max(...ns.map((n) => Math.hypot(n.x, n.z)))
  const tanV = Math.tan(VFOV * Math.PI / 360)
  const dist = maxR * Math.sin(TILT) / tanV * MARGIN
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
    const ppw = VIEW_H / (2 * depth * tanV)
    const sxp = VIEW_W / 2 + (vx * rx + vy * ry + vz * rz) * ppw
    const syp = VIEW_H / 2 - (vx * ux + vy * uy + vz * uz) * ppw
    q.push({ x0: sxp - n.w * ppw / 2, x1: sxp + n.w * ppw / 2,
             y0: syp - n.h * ppw / 2, y1: syp + n.h * ppw / 2,
             W: n.w * ppw, H: n.h * ppw, rank: n.rank })
  }
  // 可读竖带
  let bandSum = 0, buried = 0
  const bands = []
  for (const a of q) {
    const y0 = Math.max(0, Math.floor(a.y0)), y1 = Math.min(VIEW_H - 1, Math.ceil(a.y1))
    const hgt = Math.max(1, y1 - y0 + 1)
    const blk = new Uint8Array(hgt)
    for (const b of q) {
      if (b === a) continue
      if (b.x1 <= a.x0 || b.x0 >= a.x1) continue
      const by0 = Math.max(y0, Math.floor(b.y0)), by1 = Math.min(y1, Math.ceil(b.y1))
      for (let y = by0; y <= by1; y++) if (y >= y0 && y - y0 < hgt) blk[y - y0] = 1
    }
    let best = 0, cur = 0
    for (let i = 0; i < hgt; i++) { if (!blk[i]) { cur++; if (cur > best) best = cur } else cur = 0 }
    bands.push({ rank: a.rank, band: best, H: a.H })
    bandSum += best
    if (best === 0) buried++
  }
  const sortedB = bands.map((b) => b.band).sort((a, b) => a - b)
  const core = bands.slice().sort((a, b) => b.rank - a.rank).slice(0, Math.max(1, Math.floor(bands.length * 0.2)))
  const allH = q.map((x) => x.H).sort((a, b) => a - b)
  return {
    maxR,
    bandMed: sortedB[Math.floor(sortedB.length / 2)],
    bandP25: sortedB[Math.floor(sortedB.length * 0.25)],
    buried: buried / bands.length,
    coreBandMin: Math.min(...core.map((c) => c.band)),
    coreBandMed: core.reduce((s, c) => s + c.band, 0) / core.length,
    coreH: core.reduce((s, c) => s + c.H, 0) / core.length,
    medH: allH[Math.floor(allH.length / 2)],
  }
}

function worstOver(ns) {
  const ms = [0, 30, 60, 90, 120, 150].map((a) => screenMetrics(ns, a))
  return {
    bandMed: Math.min(...ms.map((m) => m.bandMed)),
    bandP25: Math.min(...ms.map((m) => m.bandP25)),
    buried: Math.max(...ms.map((m) => m.buried)),
    coreBandMin: Math.min(...ms.map((m) => m.coreBandMin)),
    coreBandMed: Math.min(...ms.map((m) => m.coreBandMed)),
    coreH: Math.min(...ms.map((m) => m.coreH)),
    medH: Math.min(...ms.map((m) => m.medH)),
    maxR: ms[0].maxR,
  }
}

console.log('分配方式对比：个数分位 vs 面积分位')
console.log('（指标 = 可读竖带 px，即公式未被遮挡的最长连续行数；≥8px 才算能读）\n')
console.log('  方式      R_OUT  盘尺度  rIn   盘半径  中位带  p25带  完全被遮% 核心最小带 核心均值带 核心px 中位px')

const CFGS = []
for (const mode of ['count', 'area']) {
  for (const R of [150, 175, 200, 240]) {
    for (const hFrac of [1.0, 1.4, 2.0]) {
      for (const rIn of [24, 40]) CFGS.push({ mode, R, hFrac, rIn })
    }
  }
}
// 另加"均匀盘"作参照
for (const R of [150, 175, 200, 240]) CFGS.push({ mode: 'area', R, hFrac: 999, rIn: 24 })

const rows = []
for (const c of CFGS) {
  const sizes = new Map(raw.map((n) => [n.id, sizesFor(n)]))
  const radii = assignRadii(raw, c.R, c.rIn, c.hFrac, c.mode, sizes)
  const ns = relax(raw, radii, sizes, c.rIn, 0.35, 1.56)
  const m = worstOver(ns)
  const r = { ...c, ...m }
  rows.push(r)
  const tag = c.hFrac >= 900 ? '面积/均匀' : (c.mode === 'area' ? '面积' : '个数')
  console.log(`  ${tag.padEnd(9)} ${String(c.R).padStart(5)}  ${(c.hFrac >= 900 ? '均匀' : c.hFrac.toFixed(1)).padStart(6)}  ${String(c.rIn).padStart(3)}   ${m.maxR.toFixed(0).padStart(5)}  ${String(m.bandMed).padStart(6)}  ${String(m.bandP25).padStart(5)}   ${(m.buried * 100).toFixed(1).padStart(7)}   ${String(m.coreBandMin).padStart(8)}   ${m.coreBandMed.toFixed(1).padStart(8)}  ${m.coreH.toFixed(1).padStart(6)} ${m.medH.toFixed(1).padStart(6)}`)
}

console.log('\n按「核心可读竖带」排序的前 10：')
rows.sort((a, b) => b.coreBandMin - a.coreBandMin || b.medH - a.medH)
for (const r of rows.slice(0, 10)) {
  const tag = r.hFrac >= 900 ? '面积/均匀' : (r.mode === 'area' ? '面积' : '个数')
  console.log(`  ${tag} R=${r.R} h=${r.hFrac >= 900 ? '均匀' : r.hFrac} rIn=${r.rIn} → 核心最小带 ${r.coreBandMin}px, 完全被遮 ${(r.buried * 100).toFixed(1)}%, 中位px ${r.medH.toFixed(1)}, 盘 ${r.maxR.toFixed(0)}`)
}
