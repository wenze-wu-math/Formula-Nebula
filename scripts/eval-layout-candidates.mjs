/**
 * 候选布局配置的多目标评估。
 *
 * 三个目标必须同时满足，不能只看重叠率：
 *   ① 重叠率        —— 字不能糊在一起
 *   ② 核心被压程度  —— 盘心那几个最重要的公式尤其不能糊（用户明确要求核心最突出）
 *   ③ 重要度→半径秩相关 —— 必须仍是强负相关，否则"越中心越重要"就名存实亡
 *
 * 径向自由度 freedom 是这三者的主要矛盾点：
 *   freedom 越大，排列越松（①②好），但半径越可能脱离重要度排序（③差）。
 * 本脚本就是找这个平衡点。
 *
 * 用法: node scripts/eval-layout-candidates.mjs
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const raw = JSON.parse(readFileSync(resolve('scripts', '.node-layout.json'), 'utf8'))
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v))

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

function relaxPositions(nodes, radii, rInner, freedom) {
  const ns = nodes.map((n) => {
    const r = radii.get(n.id)
    return { id: n.id, rank: n.rank, w: n.w, h: n.h, radius: r,
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
      const a = ns[i]
      for (let j = i + 1; j < ns.length; j++) {
        const b = ns[j]
        // 椭圆排斥：与 graph.js 的 relaxInPlane 保持一致
        const sx = 2 / ((a.w + b.w) * SPACING)
        const sz = 2 / ((a.h + b.h) * SPACING)
        let dx = b.x - a.x, dz = b.z - a.z
        const ex = dx * sx, ez = dz * sz
        const e2 = ex * ex + ez * ez
        if (e2 >= ALLOW * ALLOW) continue
        let d = Math.sqrt(e2)
        if (d < 1e-6) { dx = (i % 7) - 3; dz = (j % 5) - 2; d = Math.hypot(dx, dz) || 1e-3 }
        const push = ((ALLOW - d) / d) * strength * 0.5
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

/** Spearman 秩相关：重要度 vs 松弛后的实际半径 */
function spearman(ns) {
  const n = ns.length
  const rank = (arr) => {
    const idx = arr.map((v, i) => [v, i]).sort((a, b) => a[0] - b[0])
    const r = new Array(n)
    idx.forEach(([, i], k) => { r[i] = k })
    return r
  }
  const ra = rank(ns.map((x) => x.rank))
  const rb = rank(ns.map((x) => Math.hypot(x.x, x.z)))
  const mean = (a) => a.reduce((s, v) => s + v, 0) / n
  const ma = mean(ra), mb = mean(rb)
  let num = 0, da = 0, db = 0
  for (let i = 0; i < n; i++) {
    num += (ra[i] - ma) * (rb[i] - mb); da += (ra[i] - ma) ** 2; db += (rb[i] - mb) ** 2
  }
  return num / Math.sqrt(da * db)
}

/** 每个节点被压的严重程度（0=不受影响，1=完全被压住） */
function burying(ns) {
  const out = ns.map(() => 0)
  let ovPairs = 0, tot = 0
  for (let i = 0; i < ns.length; i++) for (let j = i + 1; j < ns.length; j++) {
    tot++
    const a = ns[i], b = ns[j]
    const dx = Math.abs(a.x - b.x), dz = Math.abs(a.z - b.z)
    const rx = (a.w + b.w) / 2, rz = (a.h + b.h) / 2
    const t = (dx / rx) ** 2 + (dz / rz) ** 2   // 椭圆相交：t<1 即压字
    if (t < 1) { ovPairs++; const sev = 1 - t; out[i] += sev; out[j] += sev }
  }
  return { fracs: out.map((v) => Math.min(1, v)), pct: (ovPairs / tot) * 100 }
}

const R = 340   // 屏幕像素的标定点：px ∝ 1/盘半径
const CFGS = [
  { R_OUT: 285, hFrac: 0.80, rIn: 26, freedom: 0.35, tag: '新半径+椭圆松弛' },
  { R_OUT: 240, hFrac: 0.90, rIn: 26, freedom: 0.35, tag: '' },
  { R_OUT: 210, hFrac: 1.00, rIn: 26, freedom: 0.35, tag: '' },
  { R_OUT: 185, hFrac: 1.10, rIn: 26, freedom: 0.35, tag: '' },
  { R_OUT: 165, hFrac: 1.20, rIn: 26, freedom: 0.35, tag: '' },
  { R_OUT: 150, hFrac: 1.40, rIn: 26, freedom: 0.35, tag: '' },
  { R_OUT: 135, hFrac: 1.60, rIn: 26, freedom: 0.35, tag: '' },
  { R_OUT: 120, hFrac: 2.00, rIn: 26, freedom: 0.35, tag: '' },
  { R_OUT: 110, hFrac: 2.50, rIn: 26, freedom: 0.35, tag: '' },
]

console.log('多目标评估：重叠率 / 核心被压 / 重要度→半径秩相关\n')
console.log('  R_OUT   h/R   自由度   重叠%   被压中位  p90    最大   核心被压   盘半径  相对屏幕尺寸  秩相关')
const rows = []
for (const c of CFGS) {
  const rInner = c.rIn
  const radii = assignRadii(raw, c.R_OUT, c.hFrac, rInner)
  const ns = relaxPositions(raw, radii, rInner, c.freedom)
  const { fracs, pct } = burying(ns)
  const sorted = [...fracs].sort((a, b) => a - b)
  const q = (p) => sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * p))]
  // "核心被压" = 重要度前 20% 的公式里，被压比例的最大值
  const order = [...ns].sort((a, b) => b.rank - a.rank)
  const coreFracs = order.slice(0, Math.max(1, Math.floor(ns.length * 0.2))).map((n) => fracs[ns.indexOf(n)])
  const coreMax = Math.max(...coreFracs)
  const rho = spearman(ns)
  const maxR = Math.max(...ns.map((n) => Math.hypot(n.x, n.z)))
  const rel = R / maxR     // 相对屏幕尺寸（越大越清楚）
  rows.push({ ...c, pct, med: q(0.5), p90: q(0.9), max: sorted[sorted.length - 1], coreMax, maxR, rel, rho })
  console.log(`  ${String(c.R_OUT).padStart(5)}  ${c.hFrac.toFixed(2)}   ${c.freedom.toFixed(2)}   ${pct.toFixed(1).padStart(5)}   ${q(0.5).toFixed(3)}   ${q(0.9).toFixed(3)}   ${sorted[sorted.length - 1].toFixed(3)}    ${coreMax.toFixed(3)}   ${maxR.toFixed(0).padStart(6)}      ${rel.toFixed(2)}        ${rho.toFixed(4)}${c.tag ? '  ← ' + c.tag : ''}`)
}

// 综合评分：重叠、核心被压、屏幕尺寸都要好，秩相关必须 ≥ 0.95
console.log('\n综合筛选（秩相关 ≥ 0.95 且 核心被压 < 0.5）：')
const good = rows.filter((r) => Math.abs(r.rho) >= 0.95 && r.coreMax < 0.5)
if (good.length) {
  good.sort((a, b) => b.rel - a.rel)
  console.log('  R_OUT   h/R   自由度   核心被压   相对屏幕尺寸   秩相关   重叠%')
  for (const r of good) {
    console.log(`  ${String(r.R_OUT).padStart(5)}  ${r.hFrac.toFixed(2)}   ${r.freedom.toFixed(2)}    ${r.coreMax.toFixed(3)}      ${r.rel.toFixed(2)}          ${r.rho.toFixed(4)}   ${r.pct.toFixed(1)}`)
  }
  const b = good[0]
  console.log(`\n推荐：radiusOuter=${b.R_OUT}  diskScale=${b.hFrac}  radialFreedom=${b.freedom}`)
  console.log(`  核心被压 ${b.coreMax.toFixed(3)}（越低越好）`)
  console.log(`  相对屏幕尺寸 ${b.rel.toFixed(2)}（当前配置为 ${rows[0].rel.toFixed(2)}，越大越好）`)
  console.log(`  秩相关 ${b.rho.toFixed(4)}（越接近 −1 越好）`)
} else {
  console.log('  没有同时满足的配置，需要在脚本里放宽阈值或扩大搜索范围。')
}
