/**
 * world/islands.js — 猜想群岛、研究者港口、海名（SPEC §6.4 第 7、9、10 步）。
 *
 * 制图隐喻：越不确定的猜想离大陆越远（ISLAND_OFFSHORE[status] 是"岛岸到大陆海岸"的目标距离）。
 * 岛的初始方位 = 它关联的定理城市的加权重心 —— 所以"关于曲线的猜想"漂在曲线半岛外海。
 * 港口贴在离研究者关联定理重心最近的海岸上，符号沿外法向离岸 11 wu。
 */
import { ISLAND_R0, ISLAND_R1, ISLAND_OFFSHORE, SEA_NAMES } from '../constants.js'
import { sample, gradient } from './fields.js'
import { chaikin, nearestOnPoly } from './contour.js'
import { hashStr, mulberry32 } from './rng.js'

const otherEnd = (l, id) => (l.source === id ? l.target : l.source)

/** 岛形：半径 r 的圆 + 3 个低频正弦扰动（总幅 ≤ 0.25r，相位来自 hash(id)），Chaikin 一遍 → 32 点 */
export function islandRing(x, y, r, id) {
  const rnd = mulberry32(hashStr(id))
  const p1 = rnd() * 6.283, p2 = rnd() * 6.283, p3 = rnd() * 6.283
  const a1 = 0.10 + rnd() * 0.04, a2 = 0.06 + rnd() * 0.03, a3 = 0.03 + rnd() * 0.03
  const N = 16, pts = []
  for (let i = 0; i < N; i++) {
    const t = (i / N) * Math.PI * 2
    const rr = r * (1 + a1 * Math.sin(2 * t + p1) + a2 * Math.sin(3 * t + p2) + a3 * Math.sin(5 * t + p3))
    pts.push(x + Math.cos(t) * rr, y + Math.sin(t) * rr)
  }
  return new Float32Array(chaikin(pts, 1, true))
}

/**
 * 放置 59 座岛。
 * @param ctx {g, sd（到大陆海岸的有符号距离：海上正、陆上负）, bounds, cityById}
 * @returns Place[]（kind='island'，按 graph 顺序）
 */
export function placeIslands(graph, tiers, ctx) {
  const { g, sd, bounds, cityById } = ctx
  const conj = graph.nodes.filter((n) => n.cluster)
  const isl = conj.map((n) => {
    let sx = 0, sy = 0, sw = 0
    for (const l of n.linkIds) {
      const c = cityById.get(otherEnd(l, n.id))
      if (!c) continue
      const w = 0.3 + l.weight
      sx += c.x * w; sy += c.y * w; sw += w
    }
    const r = ISLAND_R0 + ISLAND_R1 * n.importance
    // 离岸距离 = 状态基准 × [0.9, 1.5) 的确定性抖动：保留"越不确定越远"的总趋势，
    // 又不让同状态的岛排成一条等距"项链"（基准值相同的 33 座未勘探岛会正好落在同一条等距线上）
    const off = (ISLAND_OFFSHORE[n.status] ?? 100) * (0.9 + 0.6 * ((hashStr(n.id + '#off') % 1000) / 1000))
    const off0 = ISLAND_OFFSHORE[n.status] ?? 100
    return { n, r, off, off0, x: sw ? sx / sw : NaN, y: sw ? sy / sw : NaN, has: sw > 0 }
  })
  const byId = new Map(isl.map((o) => [o.n.id, o]))
  // 没有关联定理的猜想：用关联猜想的重心；再没有就按 hash 给一个方位
  for (const o of isl) {
    if (o.has) continue
    let sx = 0, sy = 0, k = 0
    for (const l of o.n.linkIds) { const p = byId.get(otherEnd(l, o.n.id)); if (p && p.has) { sx += p.x; sy += p.y; k++ } }
    const a = (hashStr(o.n.id) % 6283) / 1000
    if (k) { o.x = sx / k; o.y = sy / k } else { o.x = Math.cos(a) * 200; o.y = Math.sin(a) * 200 }
  }
  // 沿"离开大陆"方向推到目标离岸距离（岛心到海岸 = off + r）
  const lim = (o) => ({ x0: bounds.x0 + 40 + o.r * 1.3, x1: bounds.x1 - 40 - o.r * 1.3, y0: bounds.y0 + 40 + o.r * 1.3, y1: bounds.y1 - 40 - o.r * 1.3 })
  for (const o of isl) {
    const a = (hashStr(o.n.id) % 6283) / 1000
    let rx = o.x, ry = o.y, rl = Math.hypot(rx, ry)
    if (rl < 30) { rx = Math.cos(a); ry = Math.sin(a); rl = 1 }
    rx /= rl; ry /= rl
    for (let s = 0; s < 400; s++) {
      const v = sample(g, sd, o.x, o.y)
      const want = o.off + o.r
      if (v > 0 && Math.abs(v - want) < 1) break
      let [gx, gy] = gradient(g, sd, o.x, o.y, 3)
      const gl = Math.hypot(gx, gy)
      if (v < 0 || gl < 0.3) { gx = rx; gy = ry } else { gx /= gl; gy /= gl }
      const step = v < 0 ? 6 : Math.max(-6, Math.min(6, (want - v) * 0.5))
      o.x += gx * step; o.y += gy * step
      const L = lim(o)
      o.x = Math.max(L.x0, Math.min(L.x1, o.x)); o.y = Math.max(L.y0, Math.min(L.y1, o.y))
    }
  }
  // 松弛：岛与岛不重叠（含扰动余量 + 间隙）、离岸距离靠近目标、相互关联的猜想轻微相吸、不出界
  const lanes = []
  for (const o of isl) for (const l of o.n.linkIds) {
    const p = byId.get(otherEnd(l, o.n.id))
    if (p && o.n.id < p.n.id) lanes.push([o, p, l.weight])
  }
  for (let it = 0; it < 240; it++) {
    const alpha = 1 - it / 240
    for (const [a, b, w] of lanes) {
      const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 1
      const rest = (a.r + b.r) * 1.3 + 40
      if (d <= rest) continue
      const f = ((d - rest) / d) * 0.004 * w * alpha
      a.x += dx * f; a.y += dy * f; b.x -= dx * f; b.y -= dy * f
    }
    for (const o of isl) {
      const v = sample(g, sd, o.x, o.y)
      const want = o.off + o.r
      const minOk = 0.75 * o.off0 + o.r * 1.3
      let [gx, gy] = gradient(g, sd, o.x, o.y, 3)
      const gl = Math.hypot(gx, gy) || 1
      gx /= gl; gy /= gl
      let step = (want - v) * 0.08
      if (v < minOk) step = Math.max(step, (minOk - v) * 0.6)
      step = Math.max(-3, Math.min(8, step))
      o.x += gx * step; o.y += gy * step
    }
    for (let i = 0; i < isl.length; i++) for (let j = i + 1; j < isl.length; j++) {
      const a = isl[i], b = isl[j]
      const dx = b.x - a.x, dy = b.y - a.y
      let d = Math.hypot(dx, dy)
      const m = (a.r + b.r) * 1.28 + 12
      if (d >= m) continue
      if (d < 1e-3) d = 1e-3
      const push = (m - d) / 2
      const ux = d > 1e-3 ? dx / d : 1, uy = d > 1e-3 ? dy / d : 0
      a.x -= ux * push; a.y -= uy * push; b.x += ux * push; b.y += uy * push
    }
    for (const o of isl) { const L = lim(o); o.x = Math.max(L.x0, Math.min(L.x1, o.x)); o.y = Math.max(L.y0, Math.min(L.y1, o.y)) }
  }
  return isl.map((o) => ({
    id: o.n.id, node: o.n, kind: 'island', family: 'conjecture', country: null,
    tier: tiers.get(o.n.id), importance: o.n.importance,
    x: o.x, y: o.y, r: o.r, status: o.n.status,
    ring: islandRing(o.x, o.y, o.r, o.n.id),
  }))
}

/** 闭合环的弧长表 */
function arcTable(ring) {
  const n = ring.length >> 1
  const cum = new Float64Array(n + 1)
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n
    cum[i + 1] = cum[i] + Math.hypot(ring[2 * j] - ring[2 * i], ring[2 * j + 1] - ring[2 * i + 1])
  }
  return cum
}
function pointAtArc(ring, cum, s) {
  const n = ring.length >> 1, P = cum[n]
  s = ((s % P) + P) % P
  let lo = 0, hi = n
  while (hi - lo > 1) { const m = (lo + hi) >> 1; if (cum[m] <= s) lo = m; else hi = m }
  const j = (lo + 1) % n
  const u = (s - cum[lo]) / ((cum[lo + 1] - cum[lo]) || 1)
  return [ring[2 * lo] + (ring[2 * j] - ring[2 * lo]) * u, ring[2 * lo + 1] + (ring[2 * j + 1] - ring[2 * lo + 1]) * u]
}

/**
 * 放置 24 处港口。
 * @param ctx {coastRings: Float32Array[]（大陆海岸，陆地在左）, isLand(x,y), placeById（城市+岛屿）, islands, distAll}
 */
export function placePorts(graph, ctx) {
  const { coastRings, isLand, placeById, islands } = ctx
  const PIER = 11, MIN_GAP = 22
  const rings = coastRings.map((r) => ({ r, cum: arcTable(r) }))
  const rs = graph.nodes.filter((n) => n.researcher)
  const ports = rs.map((n) => {
    let sx = 0, sy = 0, sw = 0
    for (const l of n.linkIds) {
      const p = placeById.get(otherEnd(l, n.id))
      if (p && p.kind === 'city') { const w = 0.3 + l.weight; sx += p.x * w; sy += p.y * w; sw += w }
    }
    if (!sw) for (const l of n.linkIds) {  // 只关联猜想：用关联岛屿的重心
      const p = placeById.get(otherEnd(l, n.id))
      if (p && p.kind === 'island') { sx += p.x; sy += p.y; sw += 1 }
    }
    const tx = sw ? sx / sw : 0, ty = sw ? sy / sw : 0
    let best = null
    rings.forEach((R, ri) => {
      const q = nearestOnPoly(R.r, tx, ty, true)
      if (!best || q.d < best.d) best = { ri, s: R.cum[q.seg] + q.u * (R.cum[q.seg + 1] - R.cum[q.seg]), d: q.d }
    })
    return { n, ri: best.ri, s: best.s }
  })
  // 港口几何：pier = 海岸点；符号 = pier + 外法向·11（法向取 ±8 wu 弦，抗局部抖动）
  const geom = (p) => {
    const R = rings[p.ri]
    const [x, y] = pointAtArc(R.r, R.cum, p.s)
    const [ax, ay] = pointAtArc(R.r, R.cum, p.s - 8)
    const [bx, by] = pointAtArc(R.r, R.cum, p.s + 8)
    let tx = bx - ax, ty = by - ay
    const tl = Math.hypot(tx, ty) || 1
    tx /= tl; ty /= tl
    let nx = ty, ny = -tx                      // 陆地在左 → 右法向朝海
    if (isLand(x + nx * 6, y + ny * 6)) { nx = -nx; ny = -ny }
    return { pier: { x, y }, x: x + nx * PIER, y: y + ny * PIER }
  }
  const coastDist = (x, y) => { let d = Infinity; for (const R of rings) d = Math.min(d, nearestOnPoly(R.r, x, y, true).d); return d }
  // 沿岸 1D 松弛：同一条海岸上相邻港口弧长 ≥ 26
  for (let it = 0; it < 120; it++) {
    let moved = false
    for (let ri = 0; ri < rings.length; ri++) {
      const list = ports.filter((p) => p.ri === ri).sort((a, b) => a.s - b.s)
      const P = rings[ri].cum[rings[ri].cum.length - 1]
      for (let k = 0; k < list.length && list.length > 1; k++) {
        const a = list[k], b = list[(k + 1) % list.length]
        let gap = b.s - a.s; if (k === list.length - 1) gap += P
        if (gap < 26) { const m = (26 - gap) / 2; a.s -= m; b.s += m; moved = true }
      }
    }
    if (!moved) break
  }
  // 校验与修正：符号离岸 8–14、不落在岛上、港口两两 ≥ 22（跨海湾的弦距也算）；不满足就沿岸挪
  const out = ports.map((p) => ({ p, ...geom(p) }))
  for (let round = 0; round < 80; round++) {
    let bad = false
    for (let i = 0; i < out.length; i++) {
      const o = out[i]
      const cd = coastDist(o.x, o.y)
      let ok = cd >= 8.5 && cd <= 13.5 && !isLand(o.x, o.y)
      if (ok) for (const isl of islands) if (Math.hypot(o.x - isl.x, o.y - isl.y) < isl.r * 1.3 + 6) { ok = false; break }
      if (ok) for (let j = 0; j < i; j++) if (Math.hypot(o.x - out[j].x, o.y - out[j].y) < MIN_GAP + 1) { ok = false; break }
      if (!ok) {
        bad = true
        o.p.s += ((hashStr(o.p.n.id) & 1) ? 1 : -1) * 7 * (1 + (round >> 3))
        Object.assign(o, geom(o.p))
      }
    }
    if (!bad) break
  }
  return out.map((o) => ({
    id: o.p.n.id, node: o.p.n, kind: 'port', family: 'researcher', country: null,
    tier: 2, importance: o.p.n.importance, x: o.x, y: o.y, r: 0, pier: o.pier,
  }))
}

/**
 * 海名：离陆/岛最远的开阔海域（distAll 的大值处），贪心两两 ≥ 450 wu；「此处有龙」放在幻岛附近。
 * @param area 候选区域（home 取景框内缩，保证总览能看见）
 */
export function placeSeaLabels(g, distAll, islands, area) {
  const cands = []
  const STEP = 5
  for (let j = 0; j < g.NY; j += STEP) for (let i = 0; i < g.NX; i += STEP) {
    const x = g.x0 + i * g.cell, y = g.y0 + j * g.cell
    if (x < area.x0 || x > area.x1 || y < area.y0 || y > area.y1) continue
    const v = distAll[j * g.NX + i]
    if (v < 60) continue
    cands.push({ x, y, v: Math.min(v, 130) - 0.12 * Math.sqrt(x * x + y * y) })
  }
  cands.sort((a, b) => b.v - a.v)
  const out = []
  const angleAt = (x, y) => {
    const [gx, gy] = gradient(g, distAll, x, y, 12)
    let a = Math.atan2(gx, -gy)        // 切向 = 梯度旋转 90°
    if (a > Math.PI / 2) a -= Math.PI
    if (a < -Math.PI / 2) a += Math.PI
    const L = (15 * Math.PI) / 180
    return Math.max(-L, Math.min(L, a))
  }
  for (const c of cands) {
    if (out.length >= 3) break
    if (out.some((o) => Math.hypot(o.x - c.x, o.y - c.y) < 450)) continue
    const nm = SEA_NAMES[out.length]
    out.push({ zh: nm.zh, latin: nm.latin, x: c.x, y: c.y, angle: angleAt(c.x, c.y) })
  }
  // 此处有龙：两个幻岛的重心；若两岛相距太远（重心落在大陆上），改用离岸最远的那一座
  const dis = islands.filter((p) => p.status === 'disproved')
  if (dis.length) {
    let tx = dis.reduce((s, p) => s + p.x, 0) / dis.length, ty = dis.reduce((s, p) => s + p.y, 0) / dis.length
    if (sample(g, distAll, tx, ty) < 30) {
      const far = dis.slice().sort((a, b) => sample(g, distAll, b.x, b.y) - sample(g, distAll, a.x, a.y))[0]
      tx = far.x; ty = far.y
    }
    let best = null, bd = Infinity
    for (let j = 0; j < g.NY; j += 2) for (let i = 0; i < g.NX; i += 2) {
      const x = g.x0 + i * g.cell, y = g.y0 + j * g.cell
      if (x < area.x0 || x > area.x1 || y < area.y0 || y > area.y1) continue
      if (distAll[j * g.NX + i] < 48) continue
      if (out.some((o) => Math.hypot(o.x - x, o.y - y) < 260)) continue
      const d = Math.hypot(x - tx, y - ty)
      if (d < bd) { bd = d; best = { x, y } }
    }
    const nm = SEA_NAMES[3]
    if (best) out.push({ zh: nm.zh, latin: nm.latin, x: best.x, y: best.y, angle: angleAt(best.x, best.y), small: true })
  }
  return out
}
