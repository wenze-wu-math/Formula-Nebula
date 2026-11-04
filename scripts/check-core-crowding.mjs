/**
 * 检查"盘缩小"后**核心**是否被压垮。
 *
 * 总体重叠率是个平均值，可能掩盖"盘心几个大公式糊成一团"。
 * 而盘心恰恰是用户第一眼看到的地方，必须单独校验。
 *
 * 输出每个配置下：总体重叠率、每个公式的**被压比例**分布（中位/p90/最大）、
 * 以及被压最狠的几个公式名字。
 *
 * 用法: node scripts/check-core-crowding.mjs
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
    return { id: n.id, name: n.id, w: n.w, h: n.h, radius: r, x: Math.cos(n.theta) * r, z: Math.sin(n.theta) * r }
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

/** 每个节点被多少别的节点压住（按重叠面积占比估算） */
function perNodeOverlap(ns) {
  const out = ns.map(() => 0)
  let ovPairs = 0, totPairs = 0
  for (let i = 0; i < ns.length; i++) for (let j = i + 1; j < ns.length; j++) {
    totPairs++
    const a = ns[i], b = ns[j]
    const dx = Math.abs(a.x - b.x), dz = Math.abs(a.z - b.z)
    const rx = (a.w + b.w) / 2, rz = (a.h + b.h) / 2
    const t = (dx / rx) ** 2 + (dz / rz) ** 2
    if (t < 1) {
      ovPairs++
      const sev = 1 - t
      out[i] += sev; out[j] += sev
    }
  }
  return { fracs: out.map((v) => Math.min(1, v)), pct: (ovPairs / totPairs) * 100 }
}

const CFGS = [
  { R_OUT: 320, hFrac: 0.60, freedom: 0.30, tag: 'R=320 f=.30 (当前)' },
  { R_OUT: 280, hFrac: 0.70, freedom: 0.30, tag: 'R=280 f=.30' },
  { R_OUT: 265, hFrac: 0.80, freedom: 0.30, tag: 'R=265 f=.30' },
  { R_OUT: 265, hFrac: 0.80, freedom: 0.45, tag: 'R=265 f=.45' },
  { R_OUT: 250, hFrac: 0.90, freedom: 0.45, tag: 'R=250 f=.45' },
  { R_OUT: 250, hFrac: 0.90, freedom: 0.60, tag: 'R=250 f=.60' },
  { R_OUT: 235, hFrac: 1.00, freedom: 0.60, tag: 'R=235 f=.60' },
  { R_OUT: 220, hFrac: 1.20, freedom: 0.75, tag: 'R=220 f=.75' },
]

console.log('核心拥挤度对比（含实际被压程度，不只是对数）\n')
console.log('  配置                总体重叠   中位    p90    最大   盘半径  屏幕px  被压>50%的公式')
for (const c of CFGS) {
  const rInner = Math.max(6, c.R_OUT * 0.09)
  const radii = assignRadii(raw, c.R_OUT, c.hFrac, rInner)
  const ns = relaxPositions(raw, radii, rInner, c.freedom)
  const { fracs, pct } = perNodeOverlap(ns)
  const sorted = [...fracs].sort((a, b) => a - b)
  const q = (p) => sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * p))]
  // 找一个被压最狠的
  const idx = fracs.map((v,i)=>[v,i]).sort((a,b)=>b[0]-a[0]).slice(0,3)
  const worst = idx.filter(([v])=>v>0.5).map(([v,i])=>ns[i].id+'('+v.toFixed(2)+')').join(' ')
  const maxR = Math.max(...ns.map(n=>Math.hypot(n.x,n.z)))
  const pxMed = (5.1*365/maxR).toFixed(1)
  console.log(`  ${c.tag.padEnd(20)}  ${pct.toFixed(1).padStart(5)}%     ${q(0.5).toFixed(3)}   ${q(0.9).toFixed(3)}   ${sorted[sorted.length-1].toFixed(3)}   ${worst||'-'}`)
}
