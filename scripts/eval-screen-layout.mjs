/**
 * 离线屏幕空间重叠模型 —— 直接在"屏幕像素"层面评估布局好坏。
 *
 * ── 为什么必须看屏幕空间 ──
 * 公式是 billboard：屏幕上永远是水平长条。盘面是斜看的（俯仰角 φ），
 * 于是盘面里"径向"的方向在屏幕竖直方向被压缩 sinφ 倍。
 * 结果"盘面上互不重叠"完全不代表"屏幕上不压字" ——
 * 盘心尤其糟：那里半径差最小，压缩一次就彻底叠住。
 * 之前的评估都在盘面里算，所以一直偏乐观。
 *
 * 本脚本复刻 graph.js 的完整流程（半径分配 → 切向/径向椭圆松弛），
 * 再按相机参数投影到屏幕、光栅化统计真实重叠。
 *
 * 用法: node scripts/eval-screen-layout.mjs
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const raw = JSON.parse(readFileSync(resolve('scripts', '.node-layout.json'), 'utf8'))
  .map((n) => ({ ...n, aspect: n.w / n.h }))
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v))

/* ── 与 config.js / graph.js 对齐的参数 ── */
const BASE = 7.2, SIZEMIN = 0.60, SIZEMAX = 1.78, SIZECURVE = 0.85
const MAXW = 54, MAXH = 12
const SPACING = 1.16, ALLOW = 0.86, ITERS = 60
const VIEW_W = 1568, VIEW_H = 698, VFOV = 55
const TILT = 40 * Math.PI / 180, MARGIN = 1.10

function sizesFor(n) {
  const sizeScale = SIZEMIN + Math.pow(n.rank, SIZECURVE) * (SIZEMAX - SIZEMIN)
  const area = (BASE * sizeScale) ** 2
  const W = Math.sqrt(area * n.aspect)
  const H = Math.sqrt(area / n.aspect)
  const k = Math.min(1, MAXW / W, MAXH / H)
  return { W: W * k, H: H * k }
}

/** 半径分配：r = rIn + (R−rIn)·c^q，c 为按重要度降序的分位。
 *  q = 0.5 → 每个公式分到等面积（均匀盘，最省地方）
 *  q > 0.5 → 向盘心聚集（更有星系味，但盘心会挤） */
function assignRadii(nodes, R, rIn, q) {
  const order = [...nodes].sort((a, b) => b.rank - a.rank)
  const N = order.length
  const out = new Map()
  order.forEach((n, i) => {
    const c = (i + 0.5) / N
    out.set(n.id, rIn + (R - rIn) * Math.pow(c, q))
  })
  return out
}

function relax(nodes, radii, rIn, freedom, squash) {
  const ns = nodes.map((n) => {
    const { W, H } = sizesFor(n)
    const r = radii.get(n.id)
    return { id: n.id, rank: n.rank, w: W, h: H, r, theta: n.theta,
             x: Math.cos(n.theta) * r, z: Math.sin(n.theta) * r }
  })
  for (const n of ns) {
    const f = freedom * n.r
    n.rMin = Math.max(rIn * 0.35, n.r - f)
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
        const dt = dx * utax + dz * utaz
        const dr = dx * urax + dz * uraz
        const ax = (a.w + b.w) * 0.5 * SPACING
        const az = (a.h + b.h) * 0.5 * SPACING * squash
        const ex = dt / ax, ez = dr / az
        const e2 = ex * ex + ez * ez
        if (e2 >= ALLOW * ALLOW) continue
        let d = Math.sqrt(e2)
        let pdx = dx, pdz = dz
        if (d < 1e-6) { pdx = (i % 7) - 3; pdz = (j % 5) - 2; d = Math.hypot(pdx, pdz) || 1e-3 }
        // 沿归一化椭圆的梯度方向推，换算回世界空间
        const gx = (ex / ax) / d, gz = (ez / az) / d
        const gl = Math.hypot(gx, gz) || 1e-6
        const need = (ALLOW - d) * strength * 0.5 / gl
        a.x -= (gx / gl) * need; a.z -= (gz / gl) * need
        b.x += (gx / gl) * need; b.z += (gz / gl) * need
        void pdx; void pdz
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

/** 投影到屏幕并光栅化，返回屏幕空间指标 */
function screenMetrics(ns, azDeg = 0) {
  const maxR = Math.max(...ns.map((n) => Math.hypot(n.x, n.z)))
  const tanV = Math.tan(VFOV * Math.PI / 360)
  const dist = maxR * Math.sin(TILT) / tanV * MARGIN
  const az = azDeg * Math.PI / 180

  // 相机在 (horiz·sinAz, y, horiz·cosAz)，看向原点。
  // 取相机基向量，把世界坐标投到屏幕。
  const camPos = [dist * Math.cos(TILT) * Math.sin(az), dist * Math.sin(TILT), dist * Math.cos(TILT) * Math.cos(az)]
  const fwd = [-camPos[0] / dist, -camPos[1] / dist, -camPos[2] / dist]
  // right = normalize(cross(fwd, up))，up = (0,1,0)
  let rx = fwd[2] * 1 - 0, ry = 0, rz = -fwd[0]
  const rl = Math.hypot(rx, ry, rz) || 1
  rx /= rl; ry /= rl; rz /= rl
  // 真正的 up = cross(right, fwd)
  const ux = ry * fwd[2] - rz * fwd[1]
  const uy = rz * fwd[0] - rx * fwd[2]
  const uz = rx * fwd[1] - ry * fwd[0]

  const rects = []
  for (const n of ns) {
    const vx = n.x - camPos[0], vy = -camPos[1], vz = n.z - camPos[2]
    const depth = vx * fwd[0] + vy * fwd[1] + vz * fwd[2]
    if (depth <= 1e-3) continue
    const sxw = vx * rx + vy * ry + vz * rz     // 相机右向分量（世界单位）
    const syw = vx * ux + vy * uy + vz * uz
    const pxPerWorld = VIEW_H / (2 * depth * tanV)
    const cx = VIEW_W / 2 + sxw * pxPerWorld
    const cy = VIEW_H / 2 - syw * pxPerWorld
    const hw = n.w * pxPerWorld / 2, hh = n.h * pxPerWorld / 2
    rects.push({ x0: cx - hw, x1: cx + hw, y0: cy - hh, y1: cy + hh, name: n.id, rank: n.rank })
  }

  const CELL = 2
  const gw = Math.ceil(VIEW_W / CELL), gh = Math.ceil(VIEW_H / CELL)
  const cover = new Int32Array(gw * gh)
  for (const r of rects) {
    const x0 = Math.max(0, Math.floor(r.x0 / CELL)), x1 = Math.min(gw - 1, Math.ceil(r.x1 / CELL) - 1)
    const y0 = Math.max(0, Math.floor(r.y0 / CELL)), y1 = Math.min(gh - 1, Math.ceil(r.y1 / CELL) - 1)
    r.gx0 = x0; r.gx1 = x1; r.gy0 = y0; r.gy1 = y1
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) cover[y * gw + x]++
  }
  let covered = 0, overlapCells = 0, sumLayers = 0
  for (let i = 0; i < cover.length; i++) {
    if (cover[i] > 0) { covered++; sumLayers += cover[i] }
    if (cover[i] > 1) overlapCells++
  }
  const per = rects.map((r) => {
    let tot = 0, ov = 0
    for (let y = r.gy0; y <= r.gy1; y++) for (let x = r.gx0; x <= r.gx1; x++) { tot++; if (cover[y * gw + x] > 1) ov++ }
    return { rank: r.rank, v: tot ? ov / tot : 0 }
  })
  const sorted = per.map((p) => p.v).sort((a, b) => a - b)
  const core = per.slice().sort((a, b) => b.rank - a.rank).slice(0, Math.max(1, Math.floor(per.length * 0.2)))
  return {
    overlap: covered ? overlapCells / covered : 0,
    layers: sumLayers / covered,
    coverage: covered / (gw * gh),
    medBury: sorted[Math.floor(sorted.length / 2)],
    p90Bury: sorted[Math.floor(sorted.length * 0.9)],
    coreBury: Math.max(...core.map((c) => c.v)),
    coreMed: core.reduce((s, c) => s + c.v, 0) / core.length,
    maxR,
  }
}

/** 取多个方位角的最坏值（自转一圈都会经过） */
function worstOver(ns, azs = [0, 30, 60, 90, 120, 150]) {
  const ms = azs.map((a) => screenMetrics(ns, a))
  return {
    overlap: Math.max(...ms.map((m) => m.overlap)),
    layers: Math.max(...ms.map((m) => m.layers)),
    coverage: ms.reduce((s, m) => s + m.coverage, 0) / ms.length,
    p90Bury: Math.max(...ms.map((m) => m.p90Bury)),
    coreBury: Math.max(...ms.map((m) => m.coreBury)),
    coreMed: Math.max(...ms.map((m) => m.coreMed)),
    maxR: ms[0].maxR,
  }
}

/* ── 扫掠 ── */
console.log('离线屏幕空间评估（切向/径向椭圆松弛 + 真实投影）\n')
console.log('目标：coreBury 低（盘心重要公式不被压）、overlap 低、盘尽量小（屏幕尺寸大）\n')
console.log('  R_OUT   rIn    q    自由度  压缩   盘半径  coreBury  coreMed   p90     重叠    层数   覆盖')

const rows = []
for (const R of [110, 130, 150, 175, 200, 240, 285]) {
  for (const q of [0.40, 0.50, 0.62, 0.75, 0.90]) {
    for (const freedom of [0.35, 0.50]) {
      const rIn = 26
      for (const squash of [1.0, 1.56, 2.0]) {
        const radii = assignRadii(raw, R, rIn, q)
        const ns = relax(raw, radii, rIn, freedom, squash)
        const m = worstOver(ns)
        rows.push({ R, q, freedom, squash, rIn, ...m })
      }
    }
  }
}

// 排序：先按 coreBury，再按屏幕尺寸（1/盘半径）
rows.sort((a, b) => a.coreBury - b.coreBury || a.overlap - b.overlap)
for (const r of rows.slice(0, 22)) {
  console.log(`  ${String(r.R).padStart(5)}  ${String(r.rIn).padStart(3)}  ${r.q.toFixed(2)}   ${r.freedom.toFixed(2)}   ${r.squash.toFixed(2)}  ${r.maxR.toFixed(0).padStart(5)}   ${r.coreBury.toFixed(3)}   ${r.coreMed.toFixed(3)}   ${r.p90Bury.toFixed(3)}   ${r.overlap.toFixed(3)}   ${r.layers.toFixed(3)}   ${r.coverage.toFixed(3)}`)
}

console.log('\n最佳（coreBury < 0.35 且 overlap < 0.35）：')
const good = rows.filter((r) => r.coreBury < 0.35 && r.overlap < 0.35)
if (good.length) {
  // 在这些里挑盘最小的（屏幕尺寸最大）
  good.sort((a, b) => a.maxR - b.maxR)
  for (const r of good.slice(0, 10)) {
    console.log(`  R=${r.R} q=${r.q} freedom=${r.freedom} squash=${r.squash} → 盘半径 ${r.maxR.toFixed(0)}, coreBury ${r.coreBury.toFixed(3)}, overlap ${r.overlap.toFixed(3)}`)
  }
  const b = good[0]
  console.log(`\n推荐：radiusOuter=${b.R}  q=${b.q}  radialFreedom=${b.freedom}  radialSquash=${b.squash}`)
} else {
  console.log('  无满足条件的组合。')
}
