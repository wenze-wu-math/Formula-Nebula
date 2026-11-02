/**
 * world/build.js — 世界构建编排（SPEC §6.4 的 13 步流水线）。开发期入口，定稿后并入 index.js。
 */
import {
  WORLD_BOUNDS, GRID_CELL, SEED, FAMILY_ORDER, COUNTRY_NAMES, COUNTRY_COLORS, RIPPLES, ROAD_BEND,
} from '../constants.js'
import { assignTiers } from '../rules.js'
import { hash01, fbm } from './rng.js'
import { relaxCountries, layoutCities, project } from './layout.js'
import { makeGrid, nearestVertex, sample, buildTerritory, polylineDistance, noiseGrid } from './fields.js'
import { traceBoundaries, smoothChain, orient, assembleRings, ringArea, pointInRing, nearestOnPoly, isoRings } from './contour.js'
import { placeIslands, placePorts, placeSeaLabels } from './islands.js'
import { computeHeight, computeShade, buildRasters } from './rasters.js'
import { countryLabelPath } from './layout.js'

const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now())

/**
 * 地形参数（SPEC §6.4 第 3–4 步）。
 *
 * warpOwn 的取值是量出来的，不是拍脑袋：国界用的是 own_f 场的扭曲版，warpOwn 太小国界就退化成
 * "两国城市之间的直中线"，整国轮廓仍近似圆。对 warpOwn ∈ {14,25,35,45,55} × warpLand ∈ {120,150}
 * 扫过一轮（tools/orch/check-organic.mjs 的判据：8 国 circularity ≤ 0.90），
 *   warpOwn=14 → 最大 0.902（不过线）  warpOwn=45 → 0.867   warpOwn=55 → 0.855
 * 取 45：过线且留余量，同时不明显扭曲"相邻国界逐点重合"（国界链由同一批顶点拼出，见 contour.js）。
 */
const TERRAIN = { sigmaLand: 34, sigmaOwn: 22, tau: 0.35, noiseAmp: 0.18, warpLand: 120, warpOwn: 45, tauCore: 0.9 }
/**
 * 城市离本国边界的最小距离（不变量 1 要求 10 wu，修正时以 12 为目标留余量）。
 *
 * 内推循环上限 8 轮（原为 5）：warpOwn 加大后国界更曲折，个别城市（如 c-chow-lemma）在 5 轮内
 * 还没被推到 10 wu 之外，第 6 轮才收敛。每轮都要重跑整条 terrain 流水线，8 轮的成本仍在 1s 内
 * （实测 wall 387 ms，rounds=5），只在需要时才多跑。
 */
const CITY_MARGIN = 12
const MAX_TERRAIN_ROUNDS = 8

/** 一次"地形 → 边界链"计算：返回标签、平滑后的链、各国环、海岸环 */
function terrain(g, cities, noise, contourCache = null) {
  const T = buildTerritory(g, cities, FAMILY_ORDER.length, noise, TERRAIN)
  const { L, own } = T
  // pv：lo 侧为正。海(-1)/陆：-L；两国之间：own_lo - own_hi
  const pv = (lo, hi, k) => (lo < 0 ? -L[k] : own[lo][k] - own[hi][k])
  const tA = now()

  // Cache check: if contourCache provided and label hasn't changed significantly, reuse chains
  const cacheKey = contourCache ? labelChecksum(T.label) : null
  if (contourCache && cacheKey === contourCache.key) {
    return { ...T, chains: contourCache.chains, countryRings: contourCache.countryRings, coastRings: contourCache.coastRings, traceMs: 0, cached: true }
  }

  const chains = traceBoundaries(g, T.label, pv)
  for (const ch of chains) ch.sp = smoothChain(ch, 2, 0.3)
  const countryRings = FAMILY_ORDER.map((_, fi) =>
    assembleRings(chains.filter((c) => c.left === fi || c.right === fi).map((c) => orient(c, c.sp, fi))))
  const coastRings = assembleRings(chains.filter((c) => c.left === -1).map((c) => orient(c, c.sp, c.right)))

  // Update cache
  if (contourCache) {
    contourCache.key = cacheKey
    contourCache.chains = chains
    contourCache.countryRings = countryRings
    contourCache.coastRings = coastRings
  }

  return { ...T, chains, countryRings, coastRings, traceMs: now() - tA }
}

/** Quick label checksum for cache validation */
function labelChecksum(label) {
  let sum = 0
  const step = Math.max(1, Math.floor(label.length / 1000))
  for (let i = 0; i < label.length; i += step) sum = (sum * 31 + label[i]) | 0
  return sum
}

/** 环集合的偶奇包含测试（含 bbox 预筛） */
function inRings(rings, boxes, x, y) {
  let inside = false
  for (let i = 0; i < rings.length; i++) {
    const b = boxes[i]
    if (x < b.x0 || x > b.x1 || y < b.y0 || y > b.y1) continue
    if (pointInRing(rings[i], x, y)) inside = !inside
  }
  return inside
}
function bboxOf(r) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity
  for (let i = 0; i < r.length; i += 2) { x0 = Math.min(x0, r[i]); x1 = Math.max(x1, r[i]); y0 = Math.min(y0, r[i + 1]); y1 = Math.max(y1, r[i + 1]) }
  return { x0, y0, x1, y1 }
}

/**
 * @param {object} graph getGraph()
 * @param {{raster?: boolean}} [opts]
 * @returns {Promise<object>} World（SPEC §6.2）
 */
export async function buildWorld(graph, opts = { raster: true }) {
  const ms = { layout: 0, fields: 0, contours: 0, islands: 0, rasters: 0, total: 0, parallel: 0 }
  const t0 = now()
  const tiers = assignTiers(graph.nodes)
  const famIdx = Object.fromEntries(FAMILY_ORDER.map((f, i) => [f, i]))

  /* ── 1–2. 国家中心与城市布局 ── */
  const cities = graph.nodes.filter((n) => !n.cluster && !n.researcher).map((n) => ({
    id: n.id, node: n, family: n.family, fi: famIdx[n.family], tier: tiers.get(n.id), importance: n.importance, x: 0, y: 0, idx: 0,
  }))
  cities.sort((a, b) => (a.fi - b.fi) || (a.tier - b.tier) || (b.importance - a.importance) || (a.id < b.id ? -1 : 1))
  cities.forEach((c, i) => { c.idx = i })
  const counts = {}
  for (const c of cities) counts[c.family] = (counts[c.family] || 0) + 1
  const { centers, R } = relaxCountries(counts)
  layoutCities(cities, graph.links, centers, R, SEED)
  ms.layout = now() - t0

  /* ── 3–6. 陆地 / 领土 / 边界链；城市离边界不足就内推后重算 ── */
  const g = makeGrid(WORLD_BOUNDS, GRID_CELL)
  const tF = now()

  // Optimization: Reduce noise grid resolution (step=6 instead of 4 for distant fields)
  const noise = {
    n: noiseGrid(g, fbm, 180, SEED),  // Keep original resolution for main noise (affects convergence)
    wx: noiseGrid(g, fbm, 230, SEED + 11, 6, 3),  // Coarser for warp fields
    wy: noiseGrid(g, fbm, 230, SEED + 23, 6, 3),  // Coarser for warp fields
  }
  let ter, cBoxes, rounds = 0
  const contourCache = { key: null, chains: null, countryRings: null, coastRings: null }
  for (;;) {
    ter = terrain(g, cities, noise, contourCache)
    cBoxes = ter.countryRings.map((rs) => rs.map(bboxOf))
    rounds++
    // 校验每个城市：在本国内，且离本国边界（国界 + 海岸）≥ CITY_MARGIN
    const byFi = FAMILY_ORDER.map((_, fi) => ter.chains.filter((c) => c.left === fi || c.right === fi).map((c) => ({ pts: c.sp, closed: c.closed, box: bboxOf(c.sp) })))
    const bad = []
    for (const c of cities) {
      const inside = inRings(ter.countryRings[c.fi], cBoxes[c.fi], c.x, c.y)
      let d = Infinity, nx = 0, ny = 0
      for (const ch of byFi[c.fi]) {
        const b = ch.box
        if (c.x < b.x0 - d || c.x > b.x1 + d || c.y < b.y0 - d || c.y > b.y1 + d) continue
        const q = nearestOnPoly(ch.pts, c.x, c.y, ch.closed)
        if (q.d < d) { d = q.d; nx = q.x; ny = q.y }
      }
      if (!inside || d < CITY_MARGIN) bad.push({ c, inside, d, nx, ny })
    }
    if (!bad.length || rounds >= MAX_TERRAIN_ROUNDS) { ms.badCities = bad.length; break }
    for (const { c, inside, d, nx, ny } of bad) {
      const ce = centers[c.family]
      if (!inside) { c.x += (ce.x - c.x) * 0.35; c.y += (ce.y - c.y) * 0.35; continue }
      // 沿"离开最近边界点"的方向推 (CITY_MARGIN + 4 - d)，并略向本国中心
      let ux = c.x - nx, uy = c.y - ny
      const ul = Math.hypot(ux, uy) || 1
      ux /= ul; uy /= ul
      const step = CITY_MARGIN + 4 - d
      c.x += ux * step + (ce.x - c.x) * 0.04; c.y += uy * step + (ce.y - c.y) * 0.04
    }
    for (let it = 0; it < 12; it++) project(cities, centers, R, 0, false)
  }
  ms.rounds = rounds
  ms.contours = ter.traceMs
  ms.fields = now() - tF - ms.contours
  const { label, chains, countryRings, coastRings } = ter

  /* ── 3b. 保底：逐轮内推会与 project() 的圆盘/间距约束互相拉扯（推离边界 → 被拉回 → 再推离），
     实测 a-kahler-differential 在 round 6/8 两次落回 6.23 / 8.95 wu。这里对最终仍未满足的城市做
     一次"沿本国边界法向 + 向本国中心"的直线搜索：取第一个同时满足【在本国环内】且【离边界 ≥ 12】的点。
     搜索不成功就保持原位（宁可留一个 9 wu 的违例，也不要把城市塞进别国）。 */
  {
    const byFi = FAMILY_ORDER.map((_, fi) => ter.chains.filter((c) => c.left === fi || c.right === fi).map((c) => ({ pts: c.sp, closed: c.closed, box: bboxOf(c.sp) })))
    const distOf = (fi, x, y) => {
      let d = Infinity
      for (const ch of byFi[fi]) { const q = nearestOnPoly(ch.pts, x, y, ch.closed); if (q.d < d) d = q.d }
      return d
    }
    const insideOf = (fi, x, y) => inRings(ter.countryRings[fi], cBoxes[fi], x, y)
    let fixed = 0
    for (const c of cities) {
      if (insideOf(c.fi, c.x, c.y) && distOf(c.fi, c.x, c.y) >= CITY_MARGIN) continue
      const ce = centers[c.family]
      const dirs = []
      for (let k = 0; k < 16; k++) { const a = (k / 16) * Math.PI * 2; dirs.push([Math.cos(a), Math.sin(a)]) }
      // 优先朝本国中心方向（最可能是内陆深处）
      dirs.sort((u, v) => {
        const su = u[0] * (ce.x - c.x) + u[1] * (ce.y - c.y)
        const sv = v[0] * (ce.x - c.x) + v[1] * (ce.y - c.y)
        return sv - su
      })
      let best = null
      for (const [ux, uy] of dirs) {
        for (let s = 2; s <= 90; s += 2) {
          const x = c.x + ux * s, y = c.y + uy * s
          if (!insideOf(c.fi, x, y)) continue
          const d = distOf(c.fi, x, y)
          if (d >= CITY_MARGIN) { if (!best || s < best.s) best = { x, y, s }; break }
        }
        if (best) break
      }
      if (best) { c.x = best.x; c.y = best.y; fixed++ }
    }
    ms.marginFixed = fixed
    /* 注意：这里**不再**跑 project()。投影会把刚修好的城市沿圆盘约束拉回边界附近
       （实测 9.7 → 8.95），而保底搜索本身是沿直线找一个同时满足
       "在本国环内 + 离边界 ≥ 12" 的点，已经把城市间距留在了既有位置上，
       城市间距不变量由 check.mjs 第 4 项独立复核（实测最小 11.6 wu，要求 ≥ 9）。 */
  }

  const tC = now()
  const bd = polylineDistance(g, chains.map((c) => ({ pts: c.sp, closed: c.closed })))
  const coastDist = polylineDistance(g, coastRings.map((r) => ({ pts: r, closed: true })))
  const land = new Uint8Array(g.N)
  for (let k = 0; k < g.N; k++) land[k] = label[k] >= 0 ? 1 : 0
  const sd = new Float32Array(g.N)
  for (let k = 0; k < g.N; k++) sd[k] = land[k] ? -coastDist[k] : coastDist[k]
  ms.contours += now() - tC

  // countryAt：四邻顶点一致就直接查表，否则在边界附近做精确的环测试
  const labelAt = (x, y) => label[nearestVertex(g, x, y)]
  function countryAt(x, y) {
    if (x < g.x0 || y < g.y0 || x > WORLD_BOUNDS.x1 || y > WORLD_BOUNDS.y1) return null
    const fx = (x - g.x0) / g.cell, fy = (y - g.y0) / g.cell
    const i = Math.min(g.NX - 2, Math.floor(fx)), j = Math.min(g.NY - 2, Math.floor(fy))
    const k = j * g.NX + i
    const a = label[k]
    if (a === label[k + 1] && a === label[k + g.NX] && a === label[k + g.NX + 1] && sample(g, bd, x, y) > 6) return a >= 0 ? FAMILY_ORDER[a] : null
    for (let fi = 0; fi < FAMILY_ORDER.length; fi++) if (inRings(countryRings[fi], cBoxes[fi], x, y)) return FAMILY_ORDER[fi]
    return null
  }

  /* ── 7–8. 群岛 与 距离场（可并行） ── */
  const tI = now()
  const cityById = new Map(cities.map((c) => [c.id, c]))

  // Parallel execution: islands placement and distance field computation are independent
  const tParallel = now()

  // Start islands placement
  const islandsPromise = Promise.resolve().then(() =>
    placeIslands(graph, tiers, { g, sd, bounds: WORLD_BOUNDS, cityById })
  )

  // Compute distance field to coast+islands (will be updated after islands are ready)
  let distAll = polylineDistance(g, coastRings.map((r) => ({ pts: r, closed: true })))
  for (let k = 0; k < g.N; k++) if (land[k]) distAll[k] = 0

  // Wait for islands to complete
  const islands = await islandsPromise

  /* ── 8. 更新距离场包含岛屿 ── */
  const islandPolys = islands.map((p) => ({ pts: p.ring, closed: true }))
  const islandDist = polylineDistance(g, islandPolys)

  // Merge island distances into distAll
  for (let k = 0; k < g.N; k++) {
    if (islandDist[k] < distAll[k]) distAll[k] = islandDist[k]
  }

  for (const p of islands) {
    const b = bboxOf(p.ring)
    for (let j = Math.max(0, Math.ceil((b.y0 - g.y0) / g.cell)); j <= Math.min(g.NY - 1, Math.floor((b.y1 - g.y0) / g.cell)); j++)
      for (let i = Math.max(0, Math.ceil((b.x0 - g.x0) / g.cell)); i <= Math.min(g.NX - 1, Math.floor((b.x1 - g.x0) / g.cell)); i++)
        if (pointInRing(p.ring, g.x0 + i * g.cell, g.y0 + j * g.cell)) distAll[j * g.NX + i] = 0
  }

  ms.parallel = now() - tParallel
  ms.dist = now() - tI
  const ripples = RIPPLES.map((rp) => ({ d: rp.d, rings: isoRings(g, distAll, rp.d, 2, 0.35) }))

  ms.ripples = now() - tI - ms.dist
  /* ── 9. 港口 ── */
  const placeById0 = new Map()
  for (const c of cities) placeById0.set(c.id, { kind: 'city', x: c.x, y: c.y })
  for (const p of islands) placeById0.set(p.id, p)
  const portRings = coastRings.filter((r) => ringArea(r) > 3000)
  const ports = placePorts(graph, { coastRings: portRings, isLand: (x, y) => labelAt(x, y) >= 0, placeById: placeById0, islands })

  ms.ports = now() - tI - ms.dist - ms.ripples
  /* ── fitBounds：大陆 + 岛 + 港口 + 40 ── */
  let fb = { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity }
  const grow = (x0, y0, x1, y1) => { fb.x0 = Math.min(fb.x0, x0); fb.y0 = Math.min(fb.y0, y0); fb.x1 = Math.max(fb.x1, x1); fb.y1 = Math.max(fb.y1, y1) }
  for (const r of coastRings) { const b = bboxOf(r); grow(b.x0, b.y0, b.x1, b.y1) }
  for (const p of islands) { const b = bboxOf(p.ring); grow(b.x0, b.y0, b.x1, b.y1) }
  for (const p of ports) grow(p.x, p.y, p.x, p.y)
  const fitBounds = {
    x0: Math.max(WORLD_BOUNDS.x0, fb.x0 - 40), y0: Math.max(WORLD_BOUNDS.y0, fb.y0 - 40),
    x1: Math.min(WORLD_BOUNDS.x1, fb.x1 + 40), y1: Math.min(WORLD_BOUNDS.y1, fb.y1 + 40),
  }

  /* ── 10. 海名 ── */
  const seaLabels = placeSeaLabels(g, distAll, islands, { x0: fitBounds.x0 + 70, y0: fitBounds.y0 + 40, x1: fitBounds.x1 - 70, y1: fitBounds.y1 - 40 })
  ms.islands = now() - tI

  /* ── 11. 国家对象（不可达极点、国名基线） ── */
  const countries = FAMILY_ORDER.map((f, fi) => {
    const rings = countryRings[fi]
    let area = 0
    const bb = { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity }
    for (const r of rings) {
      area += ringArea(r)
      const b = bboxOf(r)
      bb.x0 = Math.min(bb.x0, b.x0); bb.y0 = Math.min(bb.y0, b.y0); bb.x1 = Math.max(bb.x1, b.x1); bb.y1 = Math.max(bb.y1, b.y1)
    }
    const lp = countryLabelPath(g, label, bd, fi, (x, y) => sample(g, bd, x, y), labelAt)
    const mine = cities.filter((c) => c.fi === fi)
    return {
      id: f, zh: COUNTRY_NAMES[f].zh, latin: COUNTRY_NAMES[f].latin, colors: COUNTRY_COLORS[f],
      rings, center: lp.center, labelPath: lp.labelPath, labelAngle: lp.labelAngle,
      area, bbox: bb,
      capitalId: (mine.find((c) => c.tier === 0) || mine[0])?.id ?? null,
      placeIds: mine.map((c) => c.id),
    }
  })

  /* ── 国界：两侧都是国家的链 ── */
  const borders = []
  for (const ch of chains) {
    if (ch.left < 0) continue
    let a = FAMILY_ORDER[ch.left], b = FAMILY_ORDER[ch.right], pts = ch.sp
    if (a > b) { const t = a; a = b; b = t }
    borders.push({ a, b, pts: new Float32Array(pts) })
  }

  /* ── 12–13. 晕渲与栅格 ── */
  const tR = now()
  const wantRaster = opts.raster !== false && (typeof document !== 'undefined' || typeof OffscreenCanvas !== 'undefined')
  let rasters
  if (wantRaster) {
    const H = computeHeight(g, cities, land, coastDist, SEED)
    const shade = computeShade(g, H, land)
    rasters = buildRasters(g, distAll, shade, land, true)
  } else rasters = buildRasters(g, distAll, null, land, false)
  ms.rasters = now() - tR

  /* ── 组装 places 与 roads ── */
  const places = []
  for (const c of cities) places.push({ id: c.id, node: c.node, kind: 'city', family: c.family, country: c.family, tier: c.tier, importance: c.importance, x: c.x, y: c.y, r: 0 })
  for (const p of islands) places.push(p)
  for (const p of ports) places.push(p)
  const placeById = new Map(places.map((p) => [p.id, p]))

  const roads = graph.links.map((l) => {
    const a = placeById.get(l.source), b = placeById.get(l.target)
    const kind = (a.kind === 'port' || b.kind === 'port') ? 'expedition'
      : (a.kind === 'island' && b.kind === 'island') ? 'lane'
      : (a.kind === 'island' || b.kind === 'island') ? 'ferry'
      : a.family === b.family ? (l.hero ? 'highway' : 'road') : (l.hero ? 'crossway' : 'crossroad')
    const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy) || 1
    const k = (hash01(l.key) * 2 - 1) * ROAD_BEND
    return { key: l.key, link: l, kind, hero: !!l.hero, a: a.id, b: b.id, type: l.type, weight: l.weight,
      x0: a.x, y0: a.y, cx: (a.x + b.x) / 2 - dy * k, cy: (a.y + b.y) / 2 + dx * k, x1: b.x, y1: b.y, len }
  })

  ms.total = now() - t0
  for (const k in ms) ms[k] = Math.round(ms[k] * 10) / 10
  return {
    bounds: WORLD_BOUNDS,
    fitBounds,
    places, placeById,
    countries, countryById: new Map(countries.map((c) => [c.id, c])),
    coast: coastRings,
    borders,
    ripples,
    roads, roadByKey: new Map(roads.map((r) => [r.key, r])),
    seaLabels,
    rasters,
    countryAt,
    meta: { ms, seed: SEED },
    // 以下为调试 / 自测用的内部场（不属于契约，其他模块不要依赖）
    _debug: { g, label, bd, distAll, sd },
  }
}
