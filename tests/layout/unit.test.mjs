/**
 * Unit tests for layoutGraph() — the nebula layout.
 *
 * NOTE on the goal wording: docs/EVOLUTION-GOAL.md listed this as
 * "src/layout.js 有单元测试", but no such file exists. The layout lives in
 * src/graph.js as `layoutGraph(graph, baked)` (graph.js:437). The goal's
 * intent — "the layout has unit tests" — is what is being satisfied here; the
 * G9 threshold in scripts/score.mjs now points at the real module.
 *
 * Why invariants and not golden numbers: positions are deterministic for a
 * given shape, but any data addition shifts every radius. What must never
 * silently break is the geometry's contract — the renderer and the picking
 * code both trust it blindly.
 *
 * Run: node tests/layout/unit.test.mjs
 */

let passed = 0
let failed = 0

const check = (name, fn) => {
  try {
    const detail = fn()
    passed++
    console.log(`✓ ${name}${detail ? ' — ' + detail : ''}`)
  } catch (e) {
    failed++
    console.log(`✗ ${name}: ${e.message}`)
  }
}
const assert = (cond, msg) => {
  if (!cond) throw new Error(msg)
}

const { buildGraph, layoutGraph } = await import('../../src/graph.js')
const { loadDataForNode } = await import('../../src/dataLoaderNode.js')
await loadDataForNode()
const { LAYOUT } = await import('../../src/config.js')

/**
 * A stand-in for the baked-glyph map that the browser produces.
 *
 * layoutGraph() needs each glyph's aspect ratio to compute a world size whose
 * area is normalised. In Node there are no canvases, so we synthesise an
 * aspect that is deterministic per id (stable across runs, varied across
 * nodes) — the point is to exercise the branch that uses baked metrics, not to
 * reproduce real typesetting.
 */
function fakeBaked(nodes) {
  const m = new Map()
  for (const n of nodes) {
    // Deterministic pseudo-aspect in a plausible range.
    let h = 0
    for (let i = 0; i < n.id.length; i++) h = (h * 31 + n.id.charCodeAt(i)) | 0
    const aspect = 1.5 + (Math.abs(h) % 1000) / 1000 * 8.5
    m.set(n.id, {
      emWidth: Math.sqrt(aspect),
      emHeight: 1 / Math.sqrt(aspect),
      aspect,
      canvasW: 100,
      canvasH: 100,
      contentW: 100,
      contentH: 100,
      texture: null,
    })
  }
  return m
}

const graph = buildGraph()
layoutGraph(graph, fakeBaked(graph.nodes))

const isFinitePos = (n) =>
  n.pos && Number.isFinite(n.pos.x) && Number.isFinite(n.pos.y) && Number.isFinite(n.pos.z)

// ── every node gets a usable position ──────────────────────────────────────
check('every node has a finite position', () => {
  const bad = graph.nodes.filter((n) => !isFinitePos(n))
  assert(bad.length === 0, `${bad.length} nodes without a finite pos, e.g. ${bad[0]?.id}`)
  return `${graph.nodes.length} positioned`
})

check('no NaN or Infinity anywhere in the output', () => {
  // Not every node carries `radius` (only those that participated in the
  // radial relaxation); what must be finite everywhere is pos and the size
  // fields the renderer reads unconditionally.
  let bad = 0
  let sample = ''
  for (const n of graph.nodes) {
    for (const k of ['x', 'y', 'z']) {
      const v = n.pos?.[k]
      if (!Number.isFinite(v)) {
        bad++
        if (!sample) sample = `${n.id}.pos.${k}=${v}`
      }
    }
    for (const k of ['width', 'height', 'radiusTarget']) {
      if (n[k] !== undefined && !Number.isFinite(n[k])) {
        bad++
        if (!sample) sample = `${n.id}.${k}=${n[k]}`
      }
    }
    if (n.radius !== undefined && !Number.isFinite(n.radius)) {
      bad++
      if (!sample) sample = `${n.id}.radius=${n.radius}`
    }
  }
  assert(bad === 0, `${bad} non-finite values, e.g. ${sample}`)
  return 'all finite'
})

// ── geometry contract the renderer depends on ──────────────────────────────
check('node sizes are positive', () => {
  const bad = graph.nodes.filter((n) => !(n.width > 0) || !(n.height > 0))
  assert(bad.length === 0, `${bad.length} nodes with non-positive size, e.g. ${bad[0]?.id}`)
  return 'all positive'
})

check('galaxy is a flattened disc, not a ball', () => {
  // The whole visual metaphor is a disc: radii spread wide, |y| stays small.
  const galaxy = graph.nodes.filter((n) => !n.cluster && !n.researcher && n.pos)
  const radii = galaxy.map((n) => Math.hypot(n.pos.x, n.pos.z))
  const ys = galaxy.map((n) => Math.abs(n.pos.y))
  const maxR = Math.max(...radii)
  const maxY = Math.max(...ys)
  assert(maxR > 0, 'zero radius')
  const flatness = maxR / maxY
  assert(flatness > 3, `disc is not flat enough: maxRadius/maxY = ${flatness.toFixed(2)}`)
  return `R=${maxR.toFixed(1)} maxY=${maxY.toFixed(1)} ratio=${flatness.toFixed(1)}`
})

check('cluster is a ball, not a disc', () => {
  const cl = graph.nodes.filter((n) => n.cluster && n.pos)
  assert(cl.length > 0, 'no cluster nodes')
  // The cluster is a sphere *displaced* from the origin (it sits off to the
  // side of the galaxy), so extents must be measured about its own centroid —
  // measuring from the origin would wrongly report it as flattened.
  const centroid = (k) => cl.reduce((s, n) => s + n.pos[k], 0) / cl.length
  const cx = centroid('x')
  const cy = centroid('y')
  const cz = centroid('z')
  const rel = (k, c) => Math.max(...cl.map((n) => Math.abs(n.pos[k] - c)))
  const ex = rel('x', cx)
  const ey = rel('y', cy)
  const ez = rel('z', cz)
  const ratio = Math.max(ex, ey, ez) / Math.min(ex, ey, ez)
  assert(ratio < 1.5, `cluster is not ball-shaped about its centroid: ${ex.toFixed(1)}/${ey.toFixed(1)}/${ez.toFixed(1)}`)
  return `extents ${ex.toFixed(1)}/${ey.toFixed(1)}/${ez.toFixed(1)} @ (${cx.toFixed(0)},${cy.toFixed(0)},${cz.toFixed(0)})`
})

check('galaxy radii are bounded by the configured outer radius', () => {
  const galaxy = graph.nodes.filter((n) => !n.cluster && !n.researcher && n.pos)
  const maxR = Math.max(...galaxy.map((n) => Math.hypot(n.pos.x, n.pos.z)))
  // LAYOUT.radiusOuter is the authored disc radius. Allow 1.5× for outer-arm
  // jitter and relaxation, but catch a runaway that would push nodes so far
  // out that the initial camera fit can never reach them.
  const budget = LAYOUT.radiusOuter * 1.5
  assert(Number.isFinite(budget), `LAYOUT.radiusOuter is not a number: ${LAYOUT.radiusOuter}`)
  assert(maxR <= budget, `max radius ${maxR.toFixed(1)} exceeds 1.5×radiusOuter (${budget.toFixed(1)})`)
  return `maxR=${maxR.toFixed(1)} budget=${budget.toFixed(1)}`
})

// ── determinism ────────────────────────────────────────────────────────────
check('layout is deterministic for the same input', () => {
  const g2 = buildGraph()
  layoutGraph(g2, fakeBaked(g2.nodes))
  const byId = new Map(graph.nodes.map((n) => [n.id, n]))
  let mismatches = 0
  let sample = ''
  for (const n of g2.nodes) {
    const a = byId.get(n.id)
    if (!a) continue
    const d = Math.abs(a.pos.x - n.pos.x) + Math.abs(a.pos.y - n.pos.y) + Math.abs(a.pos.z - n.pos.z)
    if (d > 1e-6) {
      mismatches++
      if (!sample) sample = `${n.id} (Δ=${d.toFixed(6)})`
    }
  }
  assert(mismatches === 0, `${mismatches} nodes differ between runs, e.g. ${sample}`)
  return 'identical'
})

// ── rank is the depth cue; it must be a sane ordering key ──────────────────
check('importance rank is normalised and monotone with importance', () => {
  const galaxy = graph.nodes.filter((n) => !n.cluster && !n.researcher)
  // rank is a NORMALISED 0..1 depth key, and it is BANDED — many nodes
  // legitimately share a rank (observed: 58 distinct values across 3630
  // nodes). Asserting uniqueness would be asserting a property the design
  // never had.
  const bad = galaxy.filter(
    (n) => typeof n.rank !== 'number' || !Number.isFinite(n.rank) || n.rank < 0 || n.rank > 1
  )
  assert(bad.length === 0, `${bad.length} nodes with rank outside [0,1], e.g. ${bad[0]?.id}=${bad[0]?.rank}`)

  const distinct = new Set(galaxy.map((n) => n.rank))
  assert(distinct.size > 1, `degenerate: every node has the same rank (${[...distinct][0]})`)

  // The real contract: rank must order with importance. If this inverts, the
  // "brighter/outer = more important" cue is lying to the user.
  const sorted = [...galaxy].sort((a, b) => a.importance - b.importance)
  let inversions = 0
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i].rank < sorted[i - 1].rank) inversions++
  }
  const rate = inversions / sorted.length
  assert(rate < 0.05, `rank disagrees with importance ${(rate * 100).toFixed(1)}% of the time`)
  return `${distinct.size} bands, ${(rate * 100).toFixed(1)}% inversions`
})

// ── report ─────────────────────────────────────────────────────────────────
console.log(`\nResults: ${passed} passed, ${failed} failed`)
process.exit(failed === 0 ? 0 : 1)
