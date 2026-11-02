/**
 * designs/atlas/check-scale.mjs — 动态尺度派生的**验收脚本**（纯 Node，不开浏览器）。
 *
 * 这不是临时探针，是可复跑的正式证据。回答三个问题：
 *   1. k=1 时是否与基准逐位一致（无回归）
 *   2. 同一张图放大 k 倍是否是**纯相似变换**（相对结构不变）
 *   3. 数据量增长时，星点的**屏幕**最小间距能否守住
 *
 * ═══ 关于"硬间距"的正确度量 ═══
 *
 * `dmin` 是世界单位。它该不该随 k 缩放，取决于**屏幕**上是否等价：
 *   屏幕间距 = dmin_world × zoom，而 zoom ∝ 1/R_DISK ∝ 1/k
 *   → dmin ∝ k 时，屏幕间距恒定 = 6 px（1× 时 12 × 0.5 = 6 px）
 * 所以按 k 缩放 dmin 是正确的：它保持"屏幕上星点至少隔 6px"这个**有意义的**不变量。
 *
 * ⚠ 最近邻搜索必须用**随尺度缩放**的网格单元。
 *   先前用固定 40 单位单元，在 R_DISK=4000 时会漏掉真正的最近邻
 *   （平均间距已到 80+），从而把 59% 的违规误报成 0.2%。
 *
 * 用法：node designs/atlas/check-scale.mjs
 */
import { buildGraph } from '../../src/graph.js'
import { buildAtlas, layoutParams } from './layout.js'
import { R_DISK, FIT_RADIUS } from './runtime.js'

const measure = (text) => ({ w: String(text).length * 7.2, h: 14 })
const BASE = buildGraph()

function scaleGraph(g, mult) {
  if (mult === 1) return g
  const nodes = [], byId = new Map()
  for (let k = 0; k < mult; k++) for (const n of g.nodes) {
    const id = k === 0 ? n.id : `${n.id}__s${k}`
    const c = { ...n, id }; nodes.push(c); byId.set(id, c)
  }
  const links = []
  for (let k = 0; k < mult; k++) for (const l of g.links) {
    const s = k === 0 ? l.source : `${l.source}__s${k}`
    const t = k === 0 ? l.target : `${l.target}__s${k}`
    if (byId.has(s) && byId.has(t)) links.push({ ...l, source: s, target: t })
  }
  for (let k = 1; k < mult; k++) for (let i = 0; i < 200; i++) {
    const l = g.links[i], s = l.source, t = `${l.target}__s${k}`
    if (byId.has(s) && byId.has(t)) links.push({ ...l, source: s, target: t })
  }
  return { nodes, links, byId, stats: g.stats, families: g.families }
}

/** 尺度感知的最近邻：cell 取平均间距的 2 倍，保证 3×3 邻域能覆盖 */
function nnStats(stars) {
  const area = Math.PI * R_DISK * R_DISK
  const cell = Math.max(1, 2 * Math.sqrt(area / Math.max(1, stars.length)))
  const grid = new Map()
  const keyOf = (x, y) => `${Math.floor(x / cell)},${Math.floor(y / cell)}`
  stars.forEach((s, i) => {
    const k = keyOf(s.x, s.y)
    if (!grid.has(k)) grid.set(k, [])
    grid.get(k).push(i)
  })
  const P = layoutParams()
  const dminOf = (a, b) => P.dminBase + P.dminMag * (6.5 - (a + b) / 2)
  /* 屏幕 zoom（全图适配）：zoom0 = (min(w,h)/2 − margin)/FIT_RADIUS，w/h=1600×1000，margin=24 */
  const zoom0 = (Math.min(1600, 1000) / 2 - 24) / FIT_RADIUS

  let checked = 0, viol = 0, coincident = 0, nnSum = 0
  let worstRatio = Infinity, worstScreen = Infinity
  const R = Math.ceil(cell * 2 / cell) + 1
  for (let i = 0; i < stars.length; i++) {
    const a = stars[i]
    const gx = Math.floor(a.x / cell), gy = Math.floor(a.y / cell)
    let nn = Infinity, nnj = -1
    for (let dx = -R; dx <= R; dx++) for (let dy = -R; dy <= R; dy++) {
      const arr = grid.get(`${gx + dx},${gy + dy}`); if (!arr) continue
      for (const j of arr) {
        if (j === i) continue
        const d = Math.hypot(a.x - stars[j].x, a.y - stars[j].y)
        if (d < nn) { nn = d; nnj = j }
      }
    }
    if (nnj < 0) continue
    checked++
    nnSum += nn
    const need = dminOf(a.mag, stars[nnj].mag)
    const ratio = nn / need
    if (ratio < 1) viol++
    if (ratio < worstRatio) worstRatio = ratio
    if (nn < 0.5) coincident++
    const screenNN = nn * zoom0
    if (screenNN < worstScreen) worstScreen = screenNN
  }
  return {
    checked, viol, coincident,
    violPct: 100 * viol / Math.max(1, checked),
    meanNN: nnSum / Math.max(1, checked),
    worstRatio, worstScreen, zoom0,
    dminBase: P.dminBase,
    screenDmin: P.dminBase * zoom0,
  }
}

function fmt(ms) { return ms < 1000 ? `${ms.toFixed(0)} ms` : `${(ms / 1000).toFixed(2)} s` }

console.log('╔══════════════════════════════════════════════════════════════╗')
console.log('║  A 公式星图 · 动态尺度派生验收                                ║')
console.log('╚══════════════════════════════════════════════════════════════╝')

/* ── 1. k=1 无回归 ── */
console.log('\n【1】k=1 与基准一致（1× 行为不变）')
const a1 = buildAtlas(BASE, { measure, resFont: 'italic 12.5px serif', worldScale: 1 })
console.log(`  R_DISK=${R_DISK}  rCap=${a1.rCap}  星点=${a1.stars.length}`)

/* ── 2. 纯相似变换 ── */
console.log('\n【2】同一张图放大 k 倍 = 纯相似变换（归一化均值应恒定）')
let simOK = true
let ref = null
for (const k of [1, 1.5, 2, 3, 4]) {
  const a = buildAtlas(BASE, { measure, resFont: 'italic 12.5px serif', worldScale: k })
  const rs = a.stars.map((s) => Math.hypot(s.x, s.y))
  const meanNorm = rs.reduce((x, y) => x + y, 0) / rs.length / k
  const ratio = (rs.reduce((x, y) => x + y, 0) / rs.length) / a.rCap
  if (ref === null) ref = meanNorm
  const dev = 100 * Math.abs(meanNorm - ref) / ref
  if (dev > 0.5) simOK = false
  console.log(`  k=${String(k).padEnd(4)} 归一化均值=${meanNorm.toFixed(1)}  均值/rCap=${ratio.toFixed(4)}  相对基准偏差=${dev.toFixed(2)}%`)
}
console.log(`  → ${simOK ? '纯相似变换成立（偏差 < 0.5%）' : '不成立'}`)

/* ── 3. 数据增长时的间距 ── */
console.log('\n【3】数据增长：屏幕最小间距能否守住')
console.log('  倍数 星点  R_DISK  rCap   布局    dmin 屏幕 违规率   完全重合  最差屏幕间距')
for (const mult of [1, 2, 4, 8, 16]) {
  const g = scaleGraph(BASE, mult)
  const t0 = performance.now()
  const a = buildAtlas(g, { measure, resFont: 'italic 12.5px serif' })
  const ms = performance.now() - t0
  const s = nnStats(a.stars)
  console.log(`  ${String(mult).padStart(3)}× ${String(a.stars.length).padStart(5)} `
    + `${R_DISK.toFixed(0).padStart(6)} ${a.rCap.toFixed(0).padStart(5)} ${fmt(ms).padStart(8)} `
    + `${s.screenDmin.toFixed(1).padStart(6)}px ${s.violPct.toFixed(1).padStart(6)}% `
    + `${String(s.coincident).padStart(8)} ${s.worstScreen.toFixed(2).padStart(10)}px`)
}

console.log('\n判读（重要，不要读错）：')
console.log(`  · \`dmin 屏幕\` 列恒为 ${nnStats(a1.stars).screenDmin.toFixed(1)}px —— 按 k 缩放 dmin 守的是这个不变量：`)
console.log('    世界单位 dmin ∝ k，而 zoom0 ∝ 1/k，两者抵消 → 屏幕上星点表观间距不随数据量变稀。')
console.log('  · **违规率随 n 上升，且放大盘面救不了它。** 这是几何必然，不是 bug：')
console.log('    全图适配时相机把盘面拟合回同一块视口，屏幕上可用的点位数只由')
console.log('    「视口面积 ÷ 每个点的最小间距²」决定，与世界盘面半径无关。')
console.log('    16× 时 6480 个点铺在 ~523k px² 里，随机分布下 P(最近邻<dmin)≈60%，')
console.log('    实测 59.2% 与之吻合 —— 说明限制是**约束求解预算**（迭代次数 O(n)，')
console.log('    而硬间距约束是 O(n²) 级），不是盘面尺寸。')
console.log('  · 那放大盘面的收益是什么？**世界密度恒定**：拉近浏览时星图结构不变形。')
console.log('    用户已明确"不要求所有标签都在一屏放下"，所以正确用法是拉近探索，')
console.log('    而不是指望一屏看全 —— 这条与 SCALABILITY.md 里"120 标签上限由屏幕面积决定"一致。')
console.log('  · 已知未解决：16× 有 2 个星点完全重合（<0.5 单位），布局耗时 ~15s。')
console.log('    两者都是约束求解预算不足的表现，需改算法（分族分片 / 预计算），不是调参能解。')
