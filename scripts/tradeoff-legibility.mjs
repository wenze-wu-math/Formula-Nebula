/**
 * 在"屏幕可读性"与"重叠率"之间找最优配置。
 *
 * ── 两个目标直接冲突 ──
 *   · 盘小 → 相机可以靠近 → 每个公式在屏幕上大、看得清
 *   · 盘大 → 公式之间不重叠
 *
 * ── 一条重要的定量结论 ──
 * 用分位数给节点分配半径时，第 i 个节点"独占"一圈面积 πR²/N。
 * 要让节点填满这一圈，其宽度得接近 √(πR²/N)，于是
 *      W  ∝  R/√N   →   R ∝ W·√N
 * 代入屏幕像素高度 px = H·(视口高) / (2·距离·tan(vFov/2))、距离 ∝ R，得
 *      px ∝ H/R ∝ H/(W·√N) ∝ 1/(√N · aspect)
 * **与 R 无关！** 也就是说盘放大缩小时屏幕尺寸不变，
 * 真正决定可读性的只有公式数 N 和公式的长宽比 aspect。
 * 257 个 aspect≈5 的公式，即使 100% 完美填满，全盘入画时也只有 ~10px 高。
 * 所以"整片星系入画时公式很小"是**数学必然**，不是调参失误；
 * 想看清必须放大（滚轮/点击聚焦），这与 shiyun / poem-cloud 的观感一致。
 *
 * 既然 px 的绝对值被 N 和 aspect 锁死，本脚本改为优化剩下的自由度：
 *   ① 让盘**刚好**装下所有公式（fill 尽量高）→ 盘最小 → px 最大
 *   ② 同时把重叠压在可接受范围内
 *
 * 用法: node scripts/tradeoff-legibility.mjs
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const raw = JSON.parse(readFileSync(resolve('scripts', '.node-layout.json'), 'utf8'))
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v))

/* ── 复刻 graph.js 的半径分配（分位数 → 指数盘） ── */
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

/* ── 复刻 relaxInPlane ── */
const SPACING = 1.16, ALLOW = 0.86, ITERS = 60

function relaxPositions(nodes, radii, rInner, freedom) {
  // 初值用**抓下来的原始 theta**（旋臂结构 + 盘心弥散都在里面），
  // 而不是从松弛后的 x/z 反算角度 —— 后者已经是松弛结果，
  // 会让离线模型的初值比真实情况"更均匀"，从而低估重叠。
  const ns = nodes.map((n) => {
    const r = radii.get(n.id)
    return { id: n.id, w: n.w, h: n.h, radius: r, x: Math.cos(n.theta) * r, z: Math.sin(n.theta) * r }
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
        let d2 = dx * dx + dz * dz
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

/** 真实椭圆相交判定 —— 比"中心距/半径"更接近肉眼看到的"字压字" */
function overlapPct(ns) {
  let ov = 0, tot = 0
  for (let i = 0; i < ns.length; i++) for (let j = i + 1; j < ns.length; j++) {
    tot++
    const a = ns[i], b = ns[j]
    const dx = Math.abs(a.x - b.x), dz = Math.abs(a.z - b.z)
    const rx = (a.w + b.w) / 2, rz = (a.h + b.h) / 2
    if ((dx / rx) ** 2 + (dz / rz) ** 2 < 1) ov++
  }
  return (ov / tot) * 100
}

function fillRate(ns) {
  const maxR = Math.max(...ns.map((n) => Math.hypot(n.x, n.z)))
  const sum = ns.reduce((s, n) => s + n.w * n.h, 0)
  return { fill: sum / (Math.PI * maxR * maxR), maxR }
}

/* ── 相机：给定盘半径与俯仰角，算出公式的屏幕高度 ──
 * 盘面在仰角 φ 下投影成椭圆：横半轴 maxR，纵半轴 maxR·sin(φ)。
 * 16:9 视口下竖直方向更吃紧，取景距离由它决定。 */
const VFOV = 55, VH = 849, MARGIN = 1.06
function pxHeight(maxR, tiltDeg) {
  const phi = tiltDeg * Math.PI / 180
  const tanV = Math.tan(VFOV / 2 * Math.PI / 180)
  const dist = (maxR * Math.sin(phi) / tanV) * MARGIN
  return { dist, pxPerWorld: VH / (2 * dist * tanV) }
}

/* ── 扫掠：找"盘最小且重叠可接受"的配置 ── */
const TILT = 40
console.log(`扫掠：R_OUT × 盘尺度 h/R × 径向自由度（俯仰角固定 ${TILT}°）`)
console.log('目标：盘尽量小（→ 屏幕尺寸大）且重叠率低\n')
console.log('  R_OUT  h/R  自由度   重叠率   填充率   实际盘半径  相机距离  公式屏幕高度(中位/核心)')

const rows = []
for (const R_OUT of [100, 115, 130, 145, 160, 180, 200, 230, 260, 300]) {
  for (const hFrac of [0.5, 0.8, 1.2, 2.0, 3.0]) {
    for (const freedom of [0.20, 0.30, 0.45, 0.60]) {
      const rInner = R_OUT * 0.09
      const radii = assignRadii(raw, R_OUT, hFrac, rInner)
      const ns = relaxPositions(raw, radii, rInner, freedom)
      const ov = overlapPct(ns)
      const { fill, maxR } = fillRate(ns)
      const { dist, pxPerWorld } = pxHeight(maxR, TILT)
      const hs = ns.map((n) => n.h * pxPerWorld)
      const med = [...hs].sort((a, b) => a - b)[Math.floor(hs.length / 2)]
      const core = Math.max(...hs)
      rows.push({ R_OUT, hFrac, freedom, ov, fill, maxR, dist, med, core })
    }
  }
}

// 可行 = 重叠率 ≤ 3%；在此前提下挑屏幕尺寸最大的（= 盘最小的）
const ok = rows.filter((r) => r.ov <= 3)
ok.sort((a, b) => b.med - a.med || a.ov - b.ov)
for (const r of ok.slice(0, 16)) {
  console.log(`  ${String(r.R_OUT).padStart(5)}  ${r.hFrac.toFixed(1)}   ${r.freedom.toFixed(2)}   ${r.ov.toFixed(1).padStart(5)}%   ${r.fill.toFixed(3)}    ${r.maxR.toFixed(0).padStart(6)}   ${r.dist.toFixed(0).padStart(6)}      ${r.med.toFixed(1).padStart(5)} / ${r.core.toFixed(1)}`)
}

if (ok.length) {
  const b = ok[0]
  console.log(`\n最优：R_OUT=${b.R_OUT}  diskScale=${b.hFrac}  radialFreedom=${b.freedom}`)
  console.log(`  重叠 ${b.ov.toFixed(1)}%  填充率 ${b.fill.toFixed(3)}  盘半径 ${b.maxR.toFixed(0)}`)
  console.log(`  相机距离 ${b.dist.toFixed(0)}   公式屏幕高度 中位 ${b.med.toFixed(1)}px / 最大 ${b.core.toFixed(1)}px`)
}

// 也看看 fill 最高的
console.log('\n填充率最高的 8 组（盘铺得最满）：')
console.log('  R_OUT  h/R  自由度   重叠率   填充率   盘半径')
for (const r of rows.slice().sort((a, b) => b.fill - a.fill).slice(0, 8)) {
  console.log(`  ${String(r.R_OUT).padStart(5)}  ${r.hFrac.toFixed(1)}   ${r.freedom.toFixed(2)}   ${r.ov.toFixed(1).padStart(5)}%   ${r.fill.toFixed(3)}   ${r.maxR.toFixed(0)}`)
}
