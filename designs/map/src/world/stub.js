/**
 * designs/map/src/world/stub.js — 世界构建的【占位实现】：国家 = 正圆，城市 = 向日葵排布，无国界/地形。
 *
 * ⚠ 这不是交付用的世界。它只用来在没有栅格/没有 DOM 的环境里跑通链路，以及给 dev/ 调试页做对照。
 *   正式实现是 build.js（距离场 + 域扭曲 + marching squares 的有机海岸线），由 index.js 转发。
 *
 * 保留它的理由：dev/world/dev.js 的 `?mod=stub` 需要一张"改前"的基准图来对比海岸线有机化前后的差异；
 * 那个对比是 README 里"国家边界有机化"一节的证据来源。
 */
import { COUNTRY_SEEDS, COUNTRY_NAMES, COUNTRY_COLORS, FAMILY_ORDER, WORLD_BOUNDS, RIPPLES, ISLAND_R0, ISLAND_R1, SEA_NAMES, ROAD_BEND } from '../constants.js'
import { assignTiers } from '../rules.js'

function circleRing(cx, cy, r, n = 64) {
  const a = new Float32Array(n * 2)
  for (let i = 0; i < n; i++) { const t = (i / n) * Math.PI * 2; a[2 * i] = cx + Math.cos(t) * r; a[2 * i + 1] = cy + Math.sin(t) * r }
  return a
}
function hash01(s) { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619) } return ((h >>> 0) % 10000) / 10000 }

/**
 * @param {object} graph getGraph()
 * @param {{raster?: boolean}} [opts]
 * @returns {object} World（SPEC §6）
 */
export function buildWorld(graph, opts = {}) {
  void opts
  const t0 = performance.now()
  const tiers = assignTiers(graph.nodes)
  const places = []
  const countries = []
  const GA = Math.PI * (3 - Math.sqrt(5))
  for (const f of FAMILY_ORDER) {
    const c = COUNTRY_SEEDS[f]
    const list = graph.nodes.filter((n) => !n.cluster && !n.researcher && n.family === f)
      .sort((a, b) => tiers.get(a.id) - tiers.get(b.id) || b.importance - a.importance)
    const R = Math.sqrt(list.length) * 21
    list.forEach((n, i) => {
      const rr = Math.sqrt(i + 0.5) / Math.sqrt(list.length) * R * 0.85
      places.push({ id: n.id, node: n, kind: 'city', family: f, country: f, tier: tiers.get(n.id), importance: n.importance,
        x: c.x + Math.cos(i * GA) * rr, y: c.y + Math.sin(i * GA) * rr, r: 0 })
    })
    countries.push({ id: f, zh: COUNTRY_NAMES[f].zh, latin: COUNTRY_NAMES[f].latin, colors: COUNTRY_COLORS[f],
      rings: [circleRing(c.x, c.y, R)], center: { x: c.x, y: c.y },
      labelPath: new Float32Array([c.x - R * 0.6, c.y, c.x + R * 0.6, c.y]), labelAngle: 0,
      area: Math.PI * R * R, bbox: { x0: c.x - R, y0: c.y - R, x1: c.x + R, y1: c.y + R },
      capitalId: list[0]?.id ?? null, placeIds: list.map((n) => n.id) })
  }
  const conj = graph.nodes.filter((n) => n.cluster)
  conj.forEach((n, i) => {
    const t = (i / conj.length) * Math.PI * 2
    const x = Math.cos(t) * 820, y = Math.sin(t) * 560
    const r = ISLAND_R0 + ISLAND_R1 * n.importance
    places.push({ id: n.id, node: n, kind: 'island', family: 'conjecture', country: null, tier: tiers.get(n.id), importance: n.importance,
      status: n.status, x, y, r, ring: circleRing(x, y, r, 24) })
  })
  const rs = graph.nodes.filter((n) => n.researcher)
  rs.forEach((n, i) => {
    const t = (i / rs.length) * Math.PI * 2
    const x = Math.cos(t) * 640, y = Math.sin(t) * 470
    places.push({ id: n.id, node: n, kind: 'port', family: 'researcher', country: null, tier: 2, importance: n.importance,
      x, y, r: 0, pier: { x: x * 0.97, y: y * 0.97 } })
  })
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

  const coast = countries.map((c) => c.rings[0])
  const ripples = RIPPLES.map((rp) => ({ d: rp.d, rings: countries.map((c) => circleRing(c.center.x, c.center.y, (c.bbox.x1 - c.center.x) + rp.d)) }))
  return {
    bounds: WORLD_BOUNDS,
    fitBounds: { x0: -880, y0: -620, x1: 880, y1: 620 },
    places, placeById,
    countries, countryById: new Map(countries.map((c) => [c.id, c])),
    coast, borders: [], ripples,
    roads, roadByKey: new Map(roads.map((r) => [r.key, r])),
    seaLabels: [
      { ...SEA_NAMES[0], x: 0, y: -600, angle: 0 },
      { ...SEA_NAMES[1], x: 760, y: 360, angle: -0.2 },
    ],
    rasters: { ocean: null, relief: null, rect: WORLD_BOUNDS },
    /** 世界点所属国家 id（海上为 null）；占位实现按圆判定 */
    countryAt(x, y) { for (const c of countries) { if (Math.hypot(x - c.center.x, y - c.center.y) < c.bbox.x1 - c.center.x) return c.id } return null },
    meta: { stub: true, ms: { total: performance.now() - t0 } },
  }
}
