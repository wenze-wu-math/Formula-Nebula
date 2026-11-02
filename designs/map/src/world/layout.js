/**
 * world/layout.js — 国家中心松弛、城市力导向布局、国名基线（SPEC §6.4 第 1、2、11 步）。
 *
 * 取舍：
 * - 国家相邻拓扑由 FAMILY_SLOTS 的六角槽位决定（8! 穷举的结果），这里只调"距离"不调"谁挨着谁"：
 *   相邻槽位的两国拉到"城市圆盘几乎相切"，保证它们的陆地场在中间连成一条长国界；
 *   不相邻的两国保持足够间隙（>2 倍海岸外扩量），不会意外长出国界。
 * - 城市布局是确定性的位置迭代（PBD 风格：力 + 硬约束投影），不用随机初值：
 *   向日葵初排（tier 升序由内到外，首都在中心）→ 族内弹簧把常一起出现的定理拉近 →
 *   跨族弱弹簧把"外交型"定理拉到朝向邻国的国境一侧 → 最后若干轮纯约束投影保证最小间距。
 */
import { FAMILY_SLOTS, FAMILY_ORDER, COUNTRY_SEEDS } from '../constants.js'
import { mulberry32 } from './rng.js'

/** 城市圆盘可用半径占 R_f 的比例（SPEC：0.92·R_f） */
export const DISK_K = 0.92
/** 不同国家城市之间的最小间距（wu）：给国界两侧各留 ≥ 10 wu 的余量还有富余 */
export const CROSS_MIN = 138  // 46 × 3 (scaled for 6000×4320 world)

/** 六角相邻的国家对（FAMILY_SLOTS 上同排相距 2、或隔排相距 1） */
export function hexAdjacentPairs() {
  const fs = Object.keys(FAMILY_SLOTS)
  const out = []
  for (let i = 0; i < fs.length; i++) for (let j = i + 1; j < fs.length; j++) {
    const [ax, ay] = FAMILY_SLOTS[fs[i]], [bx, by] = FAMILY_SLOTS[fs[j]]
    const dx = Math.abs(ax - bx), dy = Math.abs(ay - by)
    if ((dy === 0 && dx === 2) || (dy === 1 && dx === 1)) out.push(fs[i] < fs[j] ? [fs[i], fs[j]] : [fs[j], fs[i]])
  }
  return out
}

/**
 * 国家中心松弛。
 * @param counts {family: 城市数}
 * @returns {centers: {f:{x,y}}, R: {f:number}}
 */
export function relaxCountries(counts) {
  const fs = FAMILY_ORDER
  const R = Object.fromEntries(fs.map((f) => [f, 21 * Math.sqrt(counts[f] || 1)]))
  const c = Object.fromEntries(fs.map((f) => [f, { x: COUNTRY_SEEDS[f].x, y: COUNTRY_SEEDS[f].y }]))
  const adj = new Set(hexAdjacentPairs().map(([a, b]) => a + '|' + b))
  const GAP_ADJ = 24, GAP_FAR = 390  // 8 × 3, 130 × 3 (scaled for 6000×4320 world)
  for (let it = 0; it < 240; it++) {
    for (let i = 0; i < fs.length; i++) for (let j = i + 1; j < fs.length; j++) {
      const a = fs[i], b = fs[j]
      const key = a < b ? a + '|' + b : b + '|' + a
      const pa = c[a], pb = c[b]
      const dx = pb.x - pa.x, dy = pb.y - pa.y, d = Math.hypot(dx, dy) || 1
      const sum = DISK_K * (R[a] + R[b])
      let move = 0
      if (adj.has(key)) move = (d - (sum + GAP_ADJ)) * 0.04          // 相邻：拉近/推开到"几乎相切"
      else if (d < sum + GAP_FAR) move = (d - (sum + GAP_FAR)) * 0.08 // 不相邻：只推不拉
      if (!move) continue
      // 大国更"重"，小国移动更多
      const wa = R[b] / (R[a] + R[b]), wb = R[a] / (R[a] + R[b])
      pa.x += (dx / d) * move * wa; pa.y += (dy / d) * move * wa
      pb.x -= (dx / d) * move * wb; pb.y -= (dy / d) * move * wb
    }
    // 重新居中（按面积加权），大陆中心保持在原点
    let sx = 0, sy = 0, sw = 0
    for (const f of fs) { const w = R[f] * R[f]; sx += c[f].x * w; sy += c[f].y * w; sw += w }
    for (const f of fs) { c[f].x -= sx / sw; c[f].y -= sy / sw }
  }
  return { centers: c, R }
}

/* ═══ 城市最小间距必须跟随世界尺度（2026-11-02 修）═══
 *
 * 用户反馈："B方案整个世界太小了，所有城市全挤一起了。"
 *
 * 把 WORLD_BOUNDS 从 2000x1440 放大到 4000x2880 后，实测中位最近邻
 * **仍是 17.6 wu，一点没变** —— 因为间距约束是这里的硬编码字面量：
 *
 *     sepOf(t) = 12 + (3-t)*6      // 村落 12、城镇 18、大城市 24、首都 30
 *     tier<=1 之间 34
 *     CROSS_MIN = 46
 *
 * 这些是**世界单位**。世界放大 2 倍而它们没动，布局就仍按原来的密集
 * 间距去排 —— 城市自然挤成一片。
 *
 * 修法：所有间距统一乘 WORLD_SCALE（= 2）。留成常量而不是写字面量，
 * 是为了下次再调世界尺寸时只改一处。
 */
/* 世界尺度由**城市数量**派生，而不是写死 2。
 *
 * 依据：面积律。n 个点要保持同样的视觉间距，国土面积应 ∝ n。
 * 基线取 488 节点（MAP_SPEC 定稿时的数据量）→ 那时 8 个国家刚好摆满
 * 2000x1440 的世界。
 *
 *   WORLD_SCALE = sqrt(n / 488)  （clamp 到 [1, 4]）
 *
 * 实测：4,152 节点 → sqrt(4152/488) = 2.92。
 * 若写死 2，城市间距仍偏挤（实测中位最近邻只有 23.3 wu）。
 */
const BASE_CITIES = 488
const WORLD_SCALE_MAX = 4
let WORLD_SCALE = 2   // 由 layoutCities 入口按实际数量覆盖（见 setCityCount）

/** 城市最小间距的「个人半径」：(12 + (3 - tier)·6) × 世界倍数
 *  1× 时：村落 12、城镇 18、大城市 24、首都 30
 *  2× 时：村落 24、城镇 36、大城市 48、首都 60 */
function sepOf(t) { return (12 + (3 - t) * 6) * WORLD_SCALE }
function minDist(a, b) {
  if (a.fi !== b.fi) return CROSS_MIN * WORLD_SCALE
  if (a.tier <= 1 && b.tier <= 1) return 34 * WORLD_SCALE
  return Math.max(sepOf(a.tier), sepOf(b.tier))
}

/**
 * 城市布局。
 * @param cities Array<{id, fi, family, tier, importance}>（会被就地写入 x, y）
 * @param links  graph.links
 * @param centers/R relaxCountries 的结果
 * @param seed
 */
export function layoutCities(cities, links, centers, R, seed) {
  /* 按城市数量派生世界尺度（面积律）。
   * 基线 488 节点 = 定稿时的数据量（那时 8 国刚好摆满 2000x1440）。
   * 4,152 节点 → sqrt(4152/488) = 2.92，间距随之 ×2.92。 */
  WORLD_SCALE = Math.min(
    WORLD_SCALE_MAX,
    Math.max(1, Math.sqrt(cities.length / BASE_CITIES)),
  )
  const rnd = mulberry32(seed ^ 0x51ed)
  const byId = new Map(cities.map((c) => [c.id, c]))
  // 1) 向日葵初排：每国按 tier/importance 排序，首都在圆心，tier 升序由内到外
  const GA = Math.PI * (3 - Math.sqrt(5))
  const byFam = new Map()
  for (const c of cities) { if (!byFam.has(c.family)) byFam.set(c.family, []); byFam.get(c.family).push(c) }
  for (const [f, list] of byFam) {
    const rot = rnd() * Math.PI * 2
    const n = list.length, Rf = R[f] * DISK_K
    list.forEach((c, i) => {
      const rr = Math.sqrt((i + 0.5) / n) * Rf * 0.9
      c.x = centers[f].x + Math.cos(rot + i * GA) * rr
      c.y = centers[f].y + Math.sin(rot + i * GA) * rr
    })
  }
  // 2) 弹簧表
  const springs = []
  for (const l of links) {
    const a = byId.get(l.source), b = byId.get(l.target)
    if (!a || !b) continue
    springs.push({ a, b, w: l.weight, cross: a.fi !== b.fi })
  }
  const ITER = 360
  for (let it = 0; it < ITER; it++) {
    const alpha = 1 - it / ITER
    // 族内弹簧（静长 102 = 34 × 3）；跨族弱弹簧（×0.15，只拉不推：把它们拉向两国国境，但圆盘约束不许出国）
    for (const s of springs) {
      const dx = s.b.x - s.a.x, dy = s.b.y - s.a.y, d = Math.sqrt(dx * dx + dy * dy) || 1e-6
      let f = (d - 102) / d  // 34 × 3 (scaled for 6000×4320 world)
      if (s.cross) { if (f <= 0) continue; f *= 0.15 }
      f *= 0.06 * s.w * alpha
      s.a.x += dx * f; s.a.y += dy * f; s.b.x -= dx * f; s.b.y -= dy * f
    }
    project(cities, centers, R, alpha, true)
  }
  // 3) 纯约束投影：保证最小间距与圆盘约束（不变量 4）
  for (let it = 0; it < 70; it++) project(cities, centers, R, 0, false)
}

// 网格桶（链表式 typed array，每轮零分配）：覆盖 WORLD_BOUNDS 外扩 300 wu，桶边 144 ≥ 最大最小间距 138
const GB = 144, GX0 = -3300, GY0 = -2460, GW = 46, GH = 35  // GB, GX0, GY0 × 3 (scaled for 6000×4320 world)
const gHead = new Int32Array(GW * GH)
let gNext = new Int32Array(512), gCell = new Int32Array(512)

/**
 * 一轮约束投影：软碰撞（最小间距）、族内轻微扩散、圆盘约束、首都向心。
 */
export function project(cities, centers, R, alpha, spread) {
  const n = cities.length
  if (gNext.length < n) { gNext = new Int32Array(n); gCell = new Int32Array(n) }
  gHead.fill(-1)
  for (let i = 0; i < n; i++) {
    let cx = Math.floor((cities[i].x - GX0) / GB), cy = Math.floor((cities[i].y - GY0) / GB)
    cx = cx < 0 ? 0 : cx >= GW ? GW - 1 : cx; cy = cy < 0 ? 0 : cy >= GH ? GH - 1 : cy
    const h = cy * GW + cx
    gCell[i] = h; gNext[i] = gHead[h]; gHead[h] = i
  }
  for (let i = 0; i < n; i++) {
    const c = cities[i]
    const bx = gCell[i] % GW, by = (gCell[i] - bx) / GW
    for (let yy = by - 1; yy <= by + 1; yy++) {
      if (yy < 0 || yy >= GH) continue
      for (let xx = bx - 1; xx <= bx + 1; xx++) {
        if (xx < 0 || xx >= GW) continue
        for (let jj = gHead[yy * GW + xx]; jj >= 0; jj = gNext[jj]) {
          if (jj <= i) continue
          const o = cities[jj]
          const dx = o.x - c.x, dy = o.y - c.y
          const d = Math.sqrt(dx * dx + dy * dy)
          const m = minDist(c, o)
          let push = 0
          if (d < m) push = (m - d) * 0.5
          else if (spread && c.fi === o.fi && d < 120) push = (120 - d) * 0.03 * alpha  // 族内轻微扩散（40 × 3），避免扎堆
          if (!push) continue
          const ux = d > 1e-3 ? dx / d : Math.cos(i), uy = d > 1e-3 ? dy / d : Math.sin(i)
          c.x -= ux * push; c.y -= uy * push; o.x += ux * push; o.y += uy * push
        }
      }
    }
  }
  for (const c of cities) {
    const ce = centers[c.family]
    if (c.tier === 0) { const k = 0.03 * Math.max(alpha, 0.2); c.x += (ce.x - c.x) * k; c.y += (ce.y - c.y) * k }
    const lim = R[c.family] * DISK_K * (c.tier === 0 ? 0.45 : 1)
    const dx = c.x - ce.x, dy = c.y - ce.y, d = Math.sqrt(dx * dx + dy * dy)
    if (d > lim) { c.x = ce.x + (dx / d) * lim; c.y = ce.y + (dy / d) * lim }
  }
}

/**
 * 国名基线（SPEC §6.4 第 11 步）。
 * @param g 网格；label 顶点标签；bd 到全部国界/海岸的距离场；fi 国家下标
 * @param sampleBd (x,y) → 距离；labelAt (x,y) → 标签
 * @returns {center, labelPath: Float32Array, labelAngle}
 */
export function countryLabelPath(g, label, bd, fi, sampleBd, labelAt) {
  // 不可达极点：本国顶点里离边界最远的
  let best = -1, bv = -1
  let sx = 0, sy = 0, n = 0
  for (let k = 0; k < g.N; k++) {
    if (label[k] !== fi) continue
    const i = k % g.NX, j = (k - i) / g.NX
    const x = g.x0 + i * g.cell, y = g.y0 + j * g.cell
    sx += x; sy += y; n++
    if (bd[k] > bv) { bv = bd[k]; best = k }
  }
  const bi = best % g.NX, bj = (best - bi) / g.NX
  const center = { x: g.x0 + bi * g.cell, y: g.y0 + bj * g.cell }
  // PCA 主轴
  const mx = sx / n, my = sy / n
  let sxx = 0, syy = 0, sxy = 0
  for (let k = 0; k < g.N; k += 2) {
    if (label[k] !== fi) continue
    const i = k % g.NX, j = (k - i) / g.NX
    const dx = g.x0 + i * g.cell - mx, dy = g.y0 + j * g.cell - my
    sxx += dx * dx; syy += dy * dy; sxy += dx * dy
  }
  let ang = 0.5 * Math.atan2(2 * sxy, sxx - syy)
  if (ang > Math.PI / 2) ang -= Math.PI
  if (ang < -Math.PI / 2) ang += Math.PI
  const LIM = (35 * Math.PI) / 180
  ang = Math.max(-LIM, Math.min(LIM, ang))
  const ux = Math.cos(ang), uy = Math.sin(ang)
  const inside = (x, y, m) => labelAt(x, y) === fi && sampleBd(x, y) >= m
  // 沿主轴两侧延伸到离边界 margin 处；国土太窄就放宽 margin
  let tp = 0, tm = 0
  for (const margin of [25, 18, 12, 6]) {
    tp = 0; tm = 0
    while (tp < 190 && inside(center.x + ux * (tp + 4), center.y + uy * (tp + 4), margin)) tp += 4
    while (tm < 190 && inside(center.x - ux * (tm + 4), center.y - uy * (tm + 4), margin)) tm += 4
    if (tp + tm >= 120) break
  }
  // 7 个点，内部点沿法向往"脊线"（离边界更远处）偏一点
  const NP = 7
  const nx = -uy, ny = ux
  const pts = []
  for (let q = 0; q < NP; q++) {
    const t = -tm + ((tp + tm) * q) / (NP - 1)
    let x = center.x + ux * t, y = center.y + uy * t
    if (q > 0 && q < NP - 1) {
      let bo = 0, bs = sampleBd(x, y)
      for (let o = -30; o <= 30; o += 3) {
        const xx = x + nx * o, yy = y + ny * o
        if (labelAt(xx, yy) !== fi) continue
        const s = sampleBd(xx, yy) - 0.35 * Math.abs(o)
        if (s > bs) { bs = s; bo = o }
      }
      x += nx * bo * 0.5; y += ny * bo * 0.5
    }
    pts.push([x, y])
  }
  // 两遍三点平滑（端点固定），避免折角
  for (let r = 0; r < 2; r++) for (let q = 1; q < NP - 1; q++) {
    pts[q][0] = (pts[q - 1][0] + 2 * pts[q][0] + pts[q + 1][0]) / 4
    pts[q][1] = (pts[q - 1][1] + 2 * pts[q][1] + pts[q + 1][1]) / 4
  }
  // 若弯曲后有点出了国境，退回直线
  if (pts.some(([x, y]) => labelAt(x, y) !== fi)) {
    for (let q = 0; q < NP; q++) { const t = -tm + ((tp + tm) * q) / (NP - 1); pts[q] = [center.x + ux * t, center.y + uy * t] }
  }
  if (pts[0][0] > pts[NP - 1][0]) pts.reverse()   // 自西向东
  const labelPath = new Float32Array(NP * 2)
  pts.forEach(([x, y], q) => { labelPath[2 * q] = x; labelPath[2 * q + 1] = y })
  return { center, labelPath, labelAngle: ang }
}

