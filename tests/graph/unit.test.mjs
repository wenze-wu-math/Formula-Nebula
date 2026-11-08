/**
 * Unit tests for src/graph.js — the module that assembles the whole knowledge
 * graph (4306 nodes / 8747 links).
 *
 * Why this file exists: buildGraph() is the single most load-bearing pure
 * function in the project, and until now it had no unit test at all. Every
 * visual invariant downstream (layout, radius, colour, search) assumes the
 * properties asserted here.
 *
 * Scope is deliberately about *invariants*, not exact numbers: exact counts
 * change whenever data is added. What must never silently break is the shape
 * and internal consistency of the result.
 *
 * Run: node tests/graph/unit.test.mjs
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

const { buildGraph, applyColor } = await import('../../src/graph.js')

let graph
try {
  graph = buildGraph()
} catch (e) {
  console.log(`✗ buildGraph() threw: ${e.message}`)
  console.log('\nResults: 0 passed, 1 failed')
  process.exit(1)
}

// ── shape ──────────────────────────────────────────────────────────────────
check('buildGraph returns the documented shape', () => {
  assert(graph && typeof graph === 'object', 'not an object')
  assert(Array.isArray(graph.nodes), 'nodes is not an array')
  assert(Array.isArray(graph.links), 'links is not an array')
  assert(graph.byId instanceof Map, 'byId is not a Map')
  assert(graph.stats && typeof graph.stats === 'object', 'stats missing')
  return `${graph.nodes.length} nodes, ${graph.links.length} links`
})

check('graph is non-trivial', () => {
  assert(graph.nodes.length > 1000, `only ${graph.nodes.length} nodes`)
  assert(graph.links.length > 1000, `only ${graph.links.length} links`)
  return `${graph.nodes.length} / ${graph.links.length}`
})

// ── identity invariants ────────────────────────────────────────────────────
check('every node has a unique id', () => {
  const seen = new Set()
  const dupes = []
  for (const n of graph.nodes) {
    assert(typeof n.id === 'string' && n.id.length > 0, `node without id: ${JSON.stringify(n).slice(0, 80)}`)
    if (seen.has(n.id)) dupes.push(n.id)
    seen.add(n.id)
  }
  assert(dupes.length === 0, `${dupes.length} duplicate ids, e.g. ${dupes.slice(0, 3).join(', ')}`)
  return `${seen.size} unique`
})

check('byId indexes exactly the nodes array', () => {
  assert(graph.byId.size === graph.nodes.length, `byId.size=${graph.byId.size} but nodes=${graph.nodes.length}`)
  for (const n of graph.nodes) {
    assert(graph.byId.get(n.id) === n, `byId mismatch for ${n.id}`)
  }
  return `${graph.byId.size} entries`
})

// ── link integrity: the thing a sloppy refactor breaks first ───────────────
check('every link endpoint resolves to a real node', () => {
  let bad = 0
  let sample = ''
  for (const l of graph.links) {
    const s = l.source?.id ?? l.source
    const t = l.target?.id ?? l.target
    if (!graph.byId.has(s) || !graph.byId.has(t)) {
      bad++
      if (!sample) sample = `${s} -> ${t}`
    }
  }
  assert(bad === 0, `${bad} dangling links, e.g. ${sample}`)
  return `${graph.links.length} resolved`
})

check('no self-loops', () => {
  const self = graph.links.filter((l) => {
    const s = l.source?.id ?? l.source
    const t = l.target?.id ?? l.target
    return s === t
  })
  assert(self.length === 0, `${self.length} self-loops`)
  return 'none'
})

check('links carry a numeric weight', () => {
  const bad = graph.links.filter((l) => typeof l.weight !== 'number' || !Number.isFinite(l.weight))
  assert(bad.length === 0, `${bad.length} links without a finite weight`)
  const min = Math.min(...graph.links.map((l) => l.weight))
  const max = Math.max(...graph.links.map((l) => l.weight))
  return `weight ${min.toFixed(2)}..${max.toFixed(2)}`
})

// ── ranges: layout divides by their span, so they must be sane ─────────────
check('importance range is ordered and non-degenerate', () => {
  const [lo, hi] = graph.impRange
  assert(Number.isFinite(lo) && Number.isFinite(hi), `not finite: ${graph.impRange}`)
  assert(lo <= hi, `inverted: ${lo} > ${hi}`)
  assert(hi > lo, `degenerate span: ${lo}..${hi} (layout would divide by zero)`)
  return `${lo} .. ${hi}`
})

check('conjecture range is ordered', () => {
  const [lo, hi] = graph.conjRange
  assert(Number.isFinite(lo) && Number.isFinite(hi), `not finite: ${graph.conjRange}`)
  assert(lo <= hi, `inverted: ${lo} > ${hi}`)
  return `${lo} .. ${hi}`
})

check('stats agree with the actual arrays', () => {
  const s = graph.stats
  assert(s.nodeCount === graph.nodes.length, `stats.nodeCount=${s.nodeCount} vs ${graph.nodes.length}`)
  assert(s.linkCount === graph.links.length, `stats.linkCount=${s.linkCount} vs ${graph.links.length}`)
  // The three populations should sum to the total; this catches a batch being
  // dropped or double-counted.
  const sum = s.galaxyCount + s.conjCount + s.researcherCount
  assert(sum === s.nodeCount, `galaxy+conj+researcher=${sum} but nodeCount=${s.nodeCount}`)
  return `${s.galaxyCount}+${s.conjCount}+${s.researcherCount}=${s.nodeCount}`
})

check('every node belongs to a known population', () => {
  let clusters = 0
  let researchers = 0
  let plain = 0
  for (const n of graph.nodes) {
    if (n.researcher) researchers++
    else if (n.cluster) clusters++
    else plain++
  }
  const s = graph.stats
  assert(plain === s.galaxyCount, `plain=${plain} vs galaxyCount=${s.galaxyCount}`)
  assert(clusters === s.conjCount, `cluster=${clusters} vs conjCount=${s.conjCount}`)
  assert(researchers === s.researcherCount, `researcher=${researchers} vs researcherCount=${s.researcherCount}`)
  return 'populations consistent'
})

// ── determinism: layout and tests depend on it ─────────────────────────────
check('buildGraph is deterministic', () => {
  const again = buildGraph()
  assert(again.nodes.length === graph.nodes.length, 'node count differs between calls')
  assert(again.links.length === graph.links.length, 'link count differs between calls')
  // Compare a stable fingerprint rather than the objects themselves.
  const fp = (g) => g.nodes.map((n) => n.id).join('|')
  assert(fp(again) === fp(graph), 'node order differs between calls — layout would not be reproducible')
  return 'identical across two calls'
})

// ── applyColor: a documented in-place mutator ──────────────────────────────
// Note: applyColor(n) writes n.baseColor / n.markerColor / glow weights onto
// the node it is given and returns nothing. That is its contract (colour is
// recomputed in place when the colour mode changes), so the test asserts the
// contract rather than an imaginary functional purity.
check('applyColor sets colours in place', () => {
  assert(typeof applyColor === 'function', 'applyColor is not exported')
  const node = graph.nodes.find((n) => n && typeof n === 'object')
  assert(node, 'no node to test with')

  const out = applyColor(node)
  assert(out === undefined, `expected in-place mutation (returns undefined), got ${typeof out}`)
  assert(node.baseColor !== undefined, 'baseColor was not set')
  assert(node.markerColor !== undefined, 'markerColor was not set')
  assert(node.markerColor === node.baseColor, 'markerColor should track baseColor')

  // The colour is a linear-space {r,g,b} record; the renderer reads it
  // directly and a NaN would blank the sprite without raising an error.
  const c = node.baseColor
  assert(c && typeof c === 'object', `baseColor is not an object: ${typeof c}`)
  for (const k of ['r', 'g', 'b']) {
    assert(typeof c[k] === 'number', `baseColor.${k} is ${typeof c[k]}, expected number`)
    assert(Number.isFinite(c[k]), `baseColor.${k} is not finite: ${c[k]}`)
    assert(c[k] >= 0 && c[k] <= 1, `baseColor.${k} out of [0,1]: ${c[k]}`)
  }
  return `rgb(${c.r.toFixed(2)}, ${c.g.toFixed(2)}, ${c.b.toFixed(2)})`
})

check('applyColor is idempotent', () => {
  const node = graph.nodes.find((n) => n && typeof n === 'object')
  applyColor(node)
  const first = { ...node.baseColor }
  applyColor(node)
  const second = node.baseColor
  assert(
    Math.abs(first.r - second.r) < 1e-9 &&
      Math.abs(first.g - second.g) < 1e-9 &&
      Math.abs(first.b - second.b) < 1e-9,
    `colours drifted between calls: ${JSON.stringify(first)} vs ${JSON.stringify(second)}`
  )
  return 'stable'
})

// ── report ─────────────────────────────────────────────────────────────────
console.log(`\nResults: ${passed} passed, ${failed} failed`)
process.exit(failed === 0 ? 0 : 1)
