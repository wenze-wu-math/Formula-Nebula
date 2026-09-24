/**
 * 测试「尺寸感知的半径下限」。
 *
 * ── 为什么纯按重要度分配半径会挤爆盘心 ──
 * 半径 r 处，一个公式占的角宽 ≈ 宽/r。核心公式**又大又靠内**：
 *   概形 宽 54（撞到 maxWidth 上限），在 r=26 处占 54/26 ≈ 2.1 弧度 = 118°！
 * 一个公式就吃掉三分之一圈，几个核心公式叠在盘心必然互相压住。
 *
 * 面积上盘是够的（填充率仅 0.33），问题纯粹是"大公式放得太靠里"。
 *
 * ── 修法 ──
 * 给每个公式加一个**尺寸下限**：
 *     r_i ≥ 宽_i / θmax
 * θmax = 单个公式允许占的最大角宽（弧度）。这样大公式自动被推到
 * 能容下它的半径，盘心不再被几个巨型公式锁死。
 *
 * 本脚本扫 θmax，看 coreBury 与盘半径的权衡。
 *
 * 用法: node scripts/test-size-aware-radius.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const raw = JSON.parse(readFileSync(resolve('scripts', '.node-layout.json'), 'utf8'))
  .map((n) => ({ ...n, aspect: n.w / n.h }))
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v))

const BASE = 7.2, SIZEMIN = 0.60, SIZEMAX = 1.78, SIZECURVE = 0.85
const MAXW = 54, MAXH = 12
const SPACING = 1.16, ALLOW = 0.86, ITERS = 80
const VIEW_W = 1568, VIEW_H = 698, VFOV = 55
const TILT = 40 * Math.PI / 180, MARGIN = 1.10

function sizesFor(n) {
  const ss = SIZEMIN + Math.pow(n.rank, SIZECURVE) * (SIZEMAX - SIZEMIN)
  const area = (BASE * ss) ** 2
  let W = Math.sqrt(area * n.aspect), H = Math.sqrt(area / n.aspect)
  const k = Math.min(1, MAXW / W, MAXH / H)
  return { W: W * k, H: H * k }
}

const SIZES = new Map(raw.map((n) => [n.id, sizesFor(n)]))

/** 半径分配：指数盘分位 → 再抬到尺寸下限 */
function assignRadii(nodes, R, rIn, hFrac, thetaMax) {
  const h = R * hFrac
  const A = (r) => 1 - (1 + r / h) * Math.exp(-r / h)
  const a0 = A(rIn), a1 = A(R)
  const inv = (t) => { let lo = rIn, hi = R * 4; for (let i = 0; i < 50; i++) { const m = (lo + hi) / 2; if (A(m) < t) lo = m; else hi = m } return (lo + hi) / 2 }
  const order = [...nodes].sort((a, b) => b.rank - a.rank)
  const N = order.length
  const out = new Map()
  order.forEach((n, i) => {
    const c = (i + 0.5) / N
    const r0 = inv(a0 + c * (a1 - a0))
    // 尺寸下限：宽 / θmax
    const floor = thetaMax > 0 ? SIZES.get(n.id).W / thetaMax : 0
    out.set(n.id, Math.max(r0, floor))
  })
  return out
}

function relax(nodes, radii, rIn, freedom, squash) {
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
        // 梯度方向推出
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

function screenMetrics(ns, azDeg) {
  const maxR = Math.max(...ns.map((n) => Math.hypot(n.x, n.z)))
  const tanV = Math.tan(VFOV * Math.PI / 360)
  const dist = maxR * Math.sin(TILT) / tanV * MARGIN
  const az = azDeg * Math.PI / 180
  const cx = dist * Math.cos(TILT) * Math.sin(az)
  const cy = dist * Math.sin(TILT)
  const cz = dist * Math.cos(TILT) * Math.cos(az)
  const fwd = [-cx / dist, -cy / dist, -cz / dist]
  let rx = fwd[2], ry = 0, rz = -fwd[0]
  const rl = Math.hypot(rx, ry, rz) || 1; rx /= rl; ry /= rl; rz /= rl
  const ux = ry * fwd[2] - rz * fwd[1], uy = rz * fwd[0] - rx * fwd[2], uz = rx * fwd[1] - ry * fwd[0]

  const rects = []
  for (const n of ns) {
    const vx = n.x - cx, vy = -cy, vz = n.z - cz
    const depth = vx * fwd[0] + vy * fwd[1] + vz * fwd[2]
    if (depth <= 1e-3) continue
    const ppx = VIEW_H / (2 * depth * tanV)
    const sxp = VIEW_W / 2 + (vx * rx + vy * ry + vz * rz) * ppx
    const syp = VIEW_H / 2 - (vx * ux + vy * uy + vz * uz) * ppx
    rects.push({ x0: sxp - n.w * ppx / 2, x1: sxp + n.w * ppx / 2, y0: syp - n.h * ppx / 2, y1: syp + n.h * ppx / 2, rank: n.rank, h: n.h * ppx })
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
  let covered = 0, ovc = 0, layers = 0
  for (let i = 0; i < cover.length; i++) { if (cover[i] > 0) { covered++; layers += cover[i] } if (cover[i] > 1) ovc++ }
  const per = rects.map((r) => {
    let tot = 0, ov = 0
    for (let y = r.gy0; y <= r.gy1; y++) for (let x = r.gx0; x <= r.gx1; x++) { tot++; if (cover[y * gw + x] > 1) ov++ }
    return { rank: r.rank, v: tot ? ov / tot : 0, h: r.h }
  })
  const sorted = per.map((p) => p.v).sort((a, b) => a - b)
  const core = per.slice().sort((a, b) => b.rank - a.rank).slice(0, Math.max(1, Math.floor(per.length * 0.2)))
  return {
    overlap: covered ? ovc / covered : 0,
    layers: layers / covered,
    coverage: covered / (gw * gh),
    p90: sorted[Math.floor(sorted.length * 0.9)],
    coreBury: Math.max(...core.map((c) => c.v)),
    coreMed: core.reduce((s, c) => s + c.v, 0) / core.length,
    coreH: core.reduce((s, c) => s + c.h, 0) / core.length,
    medH: per.map((p) => p.h).sort((a, b) => a - b)[Math.floor(per.length / 2)],
    maxR,
  }
}

function worstOver(ns) {
  const ms = [0, 30, 60, 90, 120, 150].map((a) => screenMetrics(ns, a))
  return {
    overlap: Math.max(...ms.map((m) => m.overlap)),
    layers: Math.max(...ms.map((m) => m.layers)),
    coverage: ms.reduce((s, m) => s + m.coverage, 0) / ms.length,
    p90: Math.max(...ms.map((m) => m.p90)),
    coreBury: Math.max(...ms.map((m) => m.coreBury)),
    coreMed: Math.max(...ms.map((m) => m.coreMed)),
    coreH: Math.min(...ms.map((m) => m.coreH)),
    medH: Math.min(...ms.map((m) => m.medH)),
    maxR: ms[0].maxR,
  }
}

console.log('尺寸感知半径下限：r_i ≥ 宽_i / θmax\n')
console.log(' θmax    盘半径  coreBury coreMed  p90     重叠    层数   覆盖   核心px  中位px')

const rows = []
for (const R of [150, 180, 210, 240, 285]) {
  for (const thetaMax of [0, 0.35, 0.50, 0.70, 1.00]) {
    for (const hFrac of [0.9, 1.4]) {
      const rIn = 26
      const radii = assignRadii(raw, R, rIn, hFrac, thetaMax)
      const ns = relax(raw, radii, rIn, 0.35, 1.56)
      const m = worstOver(ns)
      rows.push({ R, thetaMax, hFrac, ...m })
      console.log(`  ${thetaMax.toFixed(2)}   ${String(R).padStart(5)}   ${m.coreBury.toFixed(3)}   ${m.coreMed.toFixed(3)}   ${m.p90.toFixed(3)}   ${m.overlap.toFixed(3)}   ${m.layers.toFixed(3)}   ${m.coverage.toFixed(3)}   ${m.coreH.toFixed(1).padStart(5)}  ${m.medH.toFixed(1).padStart(5)}`)
    }
  }
}

console.log('\n评选：coreBury < 0.40 且 核心px ≥ 12（核心公式看得清）')
const good = rows.filter((r) => r.coreBury < 0.40 && r.coreH >= 12)
good.sort((a, b) => b.medH - a.medH)
if (good.length) {
  for (const r of good.slice(0, 8))
    console.log(`  R=${r.R} θmax=${r.thetaMax} hFrac=${r.hFrac} → coreBury ${r.coreBury.toFixed(3)}, 核心 ${r.coreH.toFixed(1)}px, 中位 ${r.medH.toFixed(1)}px, 盘 ${r.maxR.toFixed(0)}, 覆盖 ${r.coverage.toFixed(3)}`)
  const b = good[0]
  console.log(`\n最佳：radiusOuter=${b.R}  thetaMax=${b.thetaMax}  diskScale=${b.hFrac}`)
} else {
  console.log('  无满足条件的组合，放松阈值看看最接近的：')
  for (const r of rows.slice().sort((a, b) => a.coreBury - b.coreBury).slice(0, 8))
    console.log(`  R=${r.R} θmax=${r.thetaMax} hFrac=${r.hFrac} → coreBury ${r.coreBury.toFixed(3)}, 核心 ${r.coreH.toFixed(1)}px, 中位 ${r.medH.toFixed(1)}px, 盘 ${r.maxR.toFixed(0)}`)
}
