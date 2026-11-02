# Formula Nebula Developer API Documentation

Complete technical reference for integrating, extending, and automating Formula Nebula.

---

## Table of Contents

1. [Graph Data Structure](#1-graph-data-structure)
2. [buildGraph() Function](#2-buildgraph-function)
3. [Layout Engines](#3-layout-engines)
4. [window.__design API](#4-window__design-api)
5. [CDP Automation](#5-cdp-automation)
6. [Knowledge Base Pipeline](#6-knowledge-base-pipeline)
7. [Extension Points](#7-extension-points)
8. [Performance Tuning](#8-performance-tuning)

---

## 1. Graph Data Structure

The graph is the central data structure representing the algebraic geometry knowledge network.

### 1.1 Node Schema

Every node represents a theorem, conjecture, or researcher:

```javascript
{
  id: string,              // Unique identifier (e.g., "scheme", "riemann-roch")
  name: string,            // Display name (Chinese)
  latex?: string,          // LaTeX formula
  description?: string,    // Markdown description
  importance: number,      // 0.0 to 1.0 (derived from connectivity & manual tags)
  family?: string,         // Knowledge family: "foundation" | "scheme" | "cohomology" | ...
  
  // Type flags (mutually exclusive)
  cluster?: boolean,       // true = conjecture (in cluster structure)
  researcher?: boolean,    // true = researcher node
  
  // Metadata
  source?: string,         // "stacks" | "nlab" | "mathlib" | "wikipedia" | "manual"
  tag?: string,            // External stable ID (Stacks tag, arXiv ID, etc.)
  url?: string,            // Authoritative source URL
  
  // Visual (computed by buildGraph)
  baseColor?: [r,g,b],     // Linear RGB (0-1) before importance modulation
  degree?: number,         // Total edge count
}
```

### 1.2 Link Schema

Links represent mathematical relationships:

```javascript
{
  source: string,          // Node ID
  target: string,          // Node ID
  type?: string,           // Relationship type (see linkTypes.js)
  weight?: number,         // 0.0 to 1.0 (importance of this connection)
  
  // Optional metadata
  label?: string,          // Readable description
  bidirectional?: boolean, // true if relation is symmetric
}
```

### 1.3 Knowledge Families

Eight families organized by algebraic geometry subfields:

| Family | Key | Color | Description |
|--------|-----|-------|-------------|
| 交换代数与基础 | `foundation` | Blue | Commutative algebra, categories, sheaves |
| 概形与层 | `scheme` | Purple | Schemes, algebraic spaces |
| 上同调 | `cohomology` | Green | Cohomology theories |
| 态射与奇点 | `map` | Orange | Morphisms, singularities |
| 曲线与曲面 | `curve` | Pink | Curves, surfaces, divisors |
| 相交与特征类 | `intersect` | Yellow | Intersection theory |
| 双有理与MMP | `birational` | Cyan | Birational geometry, MMP |
| 模空间与现代 | `modern` | Red | Moduli spaces, stacks |

Access family metadata:

```javascript
import { FAMILIES } from './src/data/knowledge.js'

FAMILIES.scheme
// { name: "概形与层", color: "#8b5cf6", arm: 1, ... }
```

---

## 2. buildGraph() Function

Assembles and normalizes the knowledge graph.

### 2.1 Basic Usage

```javascript
import { buildGraph } from './src/graph.js'

const graph = buildGraph()

console.log(graph.nodes.length)  // 464+ nodes
console.log(graph.links.length)  // 1600+ links
```

### 2.2 Returned Structure

```javascript
{
  nodes: Node[],           // All nodes (theorems + conjectures + researchers)
  links: Link[],           // All edges
  
  // Index structures
  nodeMap: Map<id, Node>,  // Fast lookup by ID
  adj: Map<id, Set<id>>,   // Adjacency list (undirected)
  
  // Statistics
  maxDegree: number,       // Highest node degree
  maxImportance: number,   // Always 1.0 (normalized)
}
```

### 2.3 Data Pipeline

`buildGraph()` performs these transformations:

1. **Merge sources**: Combines `NODES`, `EXTRA_*`, `STACKS_NODES`, `NLAB_NODES`, `MATHLIB_NODES`, etc.
2. **Deduplicate**: Removes duplicate IDs (last wins)
3. **Build edges**: Converts link arrays to indexed structures
4. **Compute degrees**: Counts connections per node
5. **Normalize importance**: Rescales to [0, 1] based on degree and manual tags
6. **Apply colors**: Maps family → base color via equalized palette

### 2.4 Color Normalization

All family colors are perceptually equalized to `GLYPH.familyLightness`:

```javascript
import { buildEqualizedPalette, hexToLinear } from './src/palette.js'

const rawColors = {
  foundation: "#3b82f6",
  scheme: "#8b5cf6",
  // ...
}

const equalized = buildEqualizedPalette(rawColors, 0.4)
// All colors now have same perceptual lightness
```

---

## 3. Layout Engines

Four design variants with distinct layout algorithms.

### 3.1 Atlas (2D Polar Star Map)

**File**: `designs/atlas/layout.js`

**Algorithm**: Deterministic force-directed layout on polar grid

```javascript
import { buildAtlas } from './designs/atlas/layout.js'
import { getGraph } from './designs/shared/kb.js'

const graph = getGraph()
const atlas = buildAtlas(graph, {
  seed: 20261031,          // RNG seed (default: from constants.js)
  measure: (text, font) => { /* return width in px */ },
  resFont: "italic 18px serif",
})

console.log(atlas.bodies.size)      // Star count
console.log(atlas.regions.foundation) // Sector boundaries
```

**Key structures**:
- **Sectors**: 8 annular regions (1 polar cap + 7 rings)
- **Bodies**: Stars with `(r, ra)` polar coordinates
- **Regions**: Convex hull boundaries per family
- **Constellations**: MST edges for intra-family structure

### 3.2 Map (2D Cartesian Terrain)

**File**: `designs/map/src/world/layout.js`

**Algorithm**: Geo-inspired with terrain elevation

```javascript
import { buildTerrain } from './designs/map/src/world/layout.js'

const terrain = buildTerrain(graph, {
  width: 3000,
  height: 2000,
  elevationScale: 0.8,
})

terrain.nations.forEach(nation => {
  console.log(nation.family, nation.capital, nation.cities.length)
})
```

**Key structures**:
- **Nations**: Knowledge families as geographic regions
- **Cities**: Theorems with `(x, y)` Cartesian coordinates
- **Islands**: Conjectures offshore
- **Harbors**: Researchers on coastlines

### 3.3 Manuscript (Hierarchical Flow)

**File**: `designs/manuscript/layout.js`

**Algorithm**: Tiered cascade with importance-driven Y positioning

```javascript
import { buildFlow } from './designs/manuscript/layout.js'

const flow = buildFlow(graph, {
  maxWidth: 1400,
  rowHeight: 120,
  tierCount: 5,
})

flow.tiers.forEach((tier, i) => {
  console.log(`Tier ${i}: ${tier.items.length} formulas`)
})
```

**Key structures**:
- **Tiers**: Horizontal importance bands
- **Flows**: Vertical connections between tiers
- **Clusters**: Family-based grouping within tiers

### 3.4 Nebula (3D Spiral Galaxy)

**File**: `designs/nebula-plus/src/graph.js` + `src/Scene.js`

**Algorithm**: 3D spiral arms with exponential disk radius

```javascript
// Configured via src/config.js
{
  spiral: {
    arms: 8,               // One per knowledge family
    armSpread: 0.085,      // Angular spread (radians)
    twist: 2.6,            // Spiral tightness
  },
  nebula: {
    diskRadius: 550,       // Galaxy radius
    diskThickness: 80,     // Vertical spread
  }
}
```

---

## 4. window.__design API

All four designs expose a unified `window.__design` interface for automation and testing.

### 4.1 Common Properties

```javascript
window.__design = {
  ready: boolean,          // true when all assets loaded
  readyMs: number | null,  // Milliseconds from page load to ready
  graph: Graph,            // Knowledge graph (read-only)
  atlas?: Atlas,           // Layout-specific structure (if applicable)
}
```

### 4.2 Selection

```javascript
// Select a node and fly to it
await window.__design.select("riemann-roch")
await window.__design.select("riemann-roch", { fly: false }) // No animation

// Deselect
window.__design.deselect()
```

### 4.3 Search

```javascript
// Returns array of matching node IDs
const hits = window.__design.search("上同调")
// ["cohomology", "etale-cohomology", ...]

// Structured query (atlas/map/manuscript)
const hits = window.__design.search("family:cohomology")
```

### 4.4 View Control

```javascript
// Get current view
const view = window.__design.view()
// { cx, cy, zoom, L, w, h, selected, hover, panelOpen, searchQuery }

// Set view (fly to coordinates)
await window.__design.setView({
  cx: 100,
  cy: -50,
  L: 2.5,  // Or use zoom: 1.8
  animate: true
})

// Set view (fly to node)
await window.__design.setView({
  id: "scheme",
  animate: true
})

// Set view (fit family region)
await window.__design.setView({
  family: "cohomology",
  animate: true
})
```

### 4.5 Statistics

```javascript
const stats = window.__design.stats()
```

Returns:

```javascript
{
  // Rendering
  fps: number,             // Average frame rate
  frameMs: number,         // Average frame time
  
  // Labels (atlas/map/manuscript)
  visibleLabels?: number,  // Count of formulas on screen
  overlappingLabels?: number,  // Count of unresolved collisions
  legibleLabels?: number,  // Count readable without pan/zoom
  
  // Layout
  nodes: number,           // Total node count
  bodiesOnScreen: number,  // Nodes in viewport
  layoutMs: number,        // Layout computation time
  
  // Performance
  readyMs: number,         // Time to first interactive
  draws: number,           // Total frames rendered
  flying: boolean,         // Camera animation active
  coasting: boolean,       // Inertia scroll active
  
  // Baking (atlas only)
  bakes: {
    pending: number,       // Formulas awaiting render
    done: number,
    failed: number,
  }
}
```

### 4.6 Benchmarking

```javascript
// Continuous redraw stress test (atlas/map/manuscript)
const result = await window.__design.bench(2000)
// { fps: 59.4, frameMs: 16.8, p95: 18.2, frames: 119 }
```

### 4.7 Design-Specific Extensions

**Atlas only**:
```javascript
window.__design.screenOf("riemann-roch")
// { x: 450, y: 320, r: 12, visible: true }

window.__design.pick(x, y)
// { kind: "body", id: "...", sx, sy } | { kind: "link", ... } | null

window.__design.labels()
// [{ id, text, x, y, w, h, visible }, ...]
```

**Nebula only**:
```javascript
window.__nebula.scene      // THREE.Scene instance
window.__nebula.camera     // THREE.PerspectiveCamera
window.__nebula.resetView()
```

---

## 5. CDP Automation

Headless browser control for screenshot, testing, and verification.

### 5.1 Basic Session

**File**: `designs/cdp.mjs`

```javascript
import { openPage } from './designs/cdp.mjs'

const page = await openPage({
  url: 'http://localhost:5190/designs/atlas/',
  width: 1600,
  height: 1000,
  wait: 'window.__design && window.__design.ready',
  waitMs: 45000,
})

console.log(page.ready)      // true if wait condition met
console.log(page.errors)     // [{ type, text }]
console.log(page.logs)       // [{ type, text }]

await page.close()
```

### 5.2 Interactive Commands

```javascript
// Execute JavaScript
const result = await page.eval('window.__design.view()')
await page.eval('await __design.select("scheme")')

// Take screenshot
await page.shot('output/atlas-scheme.png')

// Change viewport
await page.viewport(390, 844)  // Mobile

// Reload
const ok = await page.reload('window.__design.ready')
```

### 5.3 Error Collection

CDP automatically captures:

- **Runtime exceptions** (`Runtime.exceptionThrown`)
- **Console errors** (`console.error`)
- **Network errors** (HTTP 4xx/5xx, excluding favicon)

```javascript
page.errors.forEach(err => {
  console.log(err.type)  // "exception" | "console.error" | "log.error"
  console.log(err.text)
})
```

### 5.4 Browser Locking

CDP enforces **one headless instance at a time** to prevent system overload:

```javascript
// Automatic: openPage() acquires lock, page.close() releases it
// Multiple calls queue serially
```

Manual lock control (advanced):

```javascript
import { acquireBrowserLock, releaseBrowserLock } from './designs/_browser-lock.mjs'

const lock = await acquireBrowserLock('custom-task')
try {
  // Your headless work
} finally {
  releaseBrowserLock(lock)
}
```

---

## 6. Knowledge Base Pipeline

How data flows from external sources to the graph.

### 6.1 Data Sources

| Source | File | Node Count | Link Count | Description |
|--------|------|------------|------------|-------------|
| Manual | `src/data/knowledge.js` | 405 | ~800 | Hand-curated Chinese theorems |
| Stacks Project | `src/data/stacks-extra.js` | ~200 | ~150 | Auto-extracted from Stacks |
| nLab | `src/data/nlab-extra.js` | ~80 | ~60 | Concept definitions |
| mathlib | `src/data/mathlib-extra.js` | ~150 | ~100 | Formalized Lean proofs |
| Wikipedia | `src/data/wikipedia-extra.js` | ~30 | ~20 | Unsolved conjectures |
| zbMATH | `src/data/researchers-extra.js` | 24 | ~50 | Researcher profiles |

### 6.2 Build Scripts

**Location**: `kb-src/`

#### Fetch Phase

```bash
# Fetch raw data
node kb-src/fetch-stacks.mjs        # Scrape Stacks tags
node kb-src/fetch-nlab.mjs          # Scrape nLab pages
node kb-src/fetch-mathlib.mjs       # Query Lean API
node kb-src/fetch-wikipedia.mjs     # Parse Wikipedia lists
node kb-src/fetch-zbmath.mjs        # Query zbMATH Open API
```

#### Build Phase

```bash
# Transform to node/link arrays
node kb-src/build-nodes.mjs --limit 300     # Generate first 300 Stacks nodes
node kb-src/build-nlab-nodes.mjs
node kb-src/build-mathlib-nodes.mjs
node kb-src/build-wikipedia-nodes.mjs
node kb-src/build-researchers.mjs

# Cross-source links
node kb-src/build-cross-links.mjs
```

#### Verification

```bash
# Check data integrity
node kb-src/verify-cross.mjs
node kb-src/verify-mathlib.mjs
node kb-src/verify-nlab.mjs
npm run check-data  # High-level integrity check
```

### 6.3 Adding a New Node

Manual addition to `src/data/knowledge.js`:

```javascript
export const NODES = [
  // ...existing nodes
  {
    id: "my-theorem",
    name: "我的定理",
    latex: "\\int_X \\omega = 0",
    description: "一个重要的结果",
    importance: 0.75,
    family: "cohomology",
    source: "manual",
  }
]

export const LINKS = [
  // ...existing links
  {
    source: "my-theorem",
    target: "riemann-roch",
    type: "generalization",
    weight: 0.8,
  }
]
```

### 6.4 Custom Data Source

Implement a fetch + build script pair:

1. **Fetch** (`kb-src/fetch-custom.mjs`):
   ```javascript
   // Scrape/query external API
   // Save raw JSON to kb-src/out/custom-raw.json
   ```

2. **Build** (`kb-src/build-custom.mjs`):
   ```javascript
   // Read raw JSON
   // Transform to { id, name, latex, ... } format
   // Write src/data/custom-extra.js
   ```

3. **Import** in `src/graph.js`:
   ```javascript
   import { CUSTOM_NODES, CUSTOM_LINKS } from './data/custom-extra.js'
   const ALL_NODES = [...GALAXY_NODES, ...CUSTOM_NODES]
   ```

---

## 7. Extension Points

### 7.1 Custom Layout Algorithm

Implement the layout interface:

```javascript
// designs/my-layout/layout.js
export function buildMyLayout(graph, opts = {}) {
  const bodies = new Map()
  
  graph.nodes.forEach(node => {
    bodies.set(node.id, {
      id: node.id,
      x: /* your X coordinate */,
      y: /* your Y coordinate */,
      r: /* visual radius */,
      node,
    })
  })
  
  return {
    bodies,
    // ...other structures
    ms: Date.now() - t0,
  }
}
```

### 7.2 Custom Link Type

Add to `src/linkTypes.js`:

```javascript
export const LINK_TYPES = {
  // ...existing types
  'custom-relation': {
    label: "Custom Relation",
    color: "#ff6b35",
    weight: 0.6,
    bidirectional: false,
  }
}
```

Usage:

```javascript
{
  source: "node-a",
  target: "node-b",
  type: "custom-relation",
}
```

### 7.3 Custom Visual Theme

Override CSS variables (all designs):

```css
:root {
  --bg-color: #0a0e27;
  --fg-color: #e2e8f0;
  --accent-color: #fbbf24;
  --link-color: rgba(255, 255, 255, 0.15);
  /* See designs/shared/style-base.css for full list */
}
```

Atlas-specific (star sizes/colors):

```javascript
// designs/atlas/constants.js
export const GLYPH = {
  color: "#fbbf24",             // Mono theme color
  familyLightness: 0.4,         // Equalized perceptual lightness
  minR: 2,                      // Minimum star radius (px)
  maxR: 18,                     // Maximum star radius (px)
  glowIntensity: 0.8,           // Bloom strength
}
```

### 7.4 Custom Search Ranker

Override `rankSearch` in atlas/map/manuscript:

```javascript
// designs/atlas/search.js
export function rankSearch(graph, query) {
  const hits = []
  
  graph.nodes.forEach(node => {
    const score = /* your ranking logic */
    if (score > 0) {
      hits.push({ id: node.id, score })
    }
  })
  
  hits.sort((a, b) => b.score - a.score)
  return { ids: hits.map(h => h.id), structured: false }
}
```

---

## 8. Performance Tuning

### 8.1 Key Metrics

Measure via `scripts/probe-perf.mjs`:

```bash
node scripts/probe-perf.mjs
```

Reports:
- **readyMs**: Time to first interactive (target: < 3000ms)
- **fps**: Average frame rate (target: 55+)
- **overlappingLabels**: Label collisions (atlas/map/manuscript)
- **bakes.pending**: Unbaked formulas (atlas only)

### 8.2 Atlas Performance Knobs

**File**: `designs/atlas/constants.js`

```javascript
// Baking (formula texture generation)
export const BAKE_BUDGET_MS = 8  // Milliseconds per frame for baking

// Label visibility thresholds
export const MAG_LABEL_L = [3.2, 2.4, 1.7, 0.9, 0, -1]  // Per magnitude

// Force-directed layout iterations (in layout.js)
const P = {
  iter: 320,               // Main force iterations
  relaxIter: 40,           // Region refinement iterations
  dsoIter: 200,            // Deep-sky object iterations
  resIter: 200,            // Researcher label iterations
}
```

### 8.3 Map Performance Knobs

**File**: `designs/map/src/world/config.js`

```javascript
export const WORLD = {
  width: 3000,             // Terrain width (world units)
  height: 2000,            // Terrain height
  tileSize: 64,            // Tile granularity (affects batch count)
}

export const LABELS = {
  maxVisible: 120,         // Label budget
  fadeInMs: 200,           // Label appear animation
}
```

### 8.4 Nebula Performance Knobs

**File**: `designs/nebula-plus/src/config.js`

```javascript
export const PERFORMANCE = {
  targetFPS: 60,
  pixelRatio: Math.min(2, devicePixelRatio),  // Cap DPR
  antialias: true,         // WebGL antialiasing
}

export const PARTICLES = {
  count: 0,                // Background dust (disabled for clarity)
}

export const TEXT = {
  textMinPx: 8,            // Switch to dot below this screen height
  textFullPx: 24,          // Full formula above this height
  dotScale: 5.2,           // Dot size multiplier when far
}
```

### 8.5 Common Optimizations

**Reduce label budget**:
```javascript
// Atlas: Raise L thresholds to show fewer labels
export const MAG_LABEL_L = [4.0, 3.0, 2.5, 1.5, 0.5, -0.5]
```

**Lower DPR**:
```javascript
// All designs check devicePixelRatio
state.dpr = Math.min(1.5, devicePixelRatio)
```

**Disable bloom**:
```css
/* Atlas */
#atlas-canvas {
  filter: none;  /* Remove drop-shadow */
}
```

**Simplify force layout** (atlas):
```javascript
const P = {
  iter: 200,               // Reduce from 320
  kRep: 4,                 // Reduce repulsion strength
}
```

### 8.6 Profiling

Use browser DevTools Performance panel:

1. Open DevTools → Performance
2. Start recording
3. Interact with the visualization
4. Stop recording
5. Analyze:
   - **Main thread**: JS execution (layout, baking)
   - **GPU**: Rendering (canvas draws, WebGL)
   - **Frame rate**: Target 60fps (16.67ms per frame)

Look for:
- Long tasks (> 50ms blocks main thread)
- Forced layouts (reflow/repaint storms)
- GC pauses

---

## Code Examples

### Example 1: Batch Screenshot All Nodes

```javascript
import { openPage } from './designs/cdp.mjs'
import { getGraph } from './designs/shared/kb.js'
import { mkdirSync } from 'node:fs'

const graph = getGraph()
const page = await openPage({
  url: 'http://localhost:5190/designs/atlas/',
  wait: 'window.__design.ready',
})

mkdirSync('shots/all', { recursive: true })

for (const node of graph.nodes.slice(0, 10)) {
  await page.eval(`await __design.select("${node.id}", { fly: true })`)
  await page.shot(`shots/all/${node.id}.png`)
}

await page.close()
```

### Example 2: Custom Query Language

```javascript
// Extend rankSearch to support "degree:>50"
export function rankSearch(graph, query) {
  const degreeMatch = query.match(/degree:>(\d+)/)
  if (degreeMatch) {
    const minDegree = parseInt(degreeMatch[1])
    return {
      ids: graph.nodes
        .filter(n => n.degree > minDegree)
        .sort((a, b) => b.degree - a.degree)
        .map(n => n.id),
      structured: true,
    }
  }
  
  // Fallback to default text search
  return defaultRankSearch(graph, query)
}
```

### Example 3: Export Layout Coordinates

```javascript
import { buildAtlas } from './designs/atlas/layout.js'
import { getGraph } from './designs/shared/kb.js'
import { writeFileSync } from 'node:fs'

const graph = getGraph()
const atlas = buildAtlas(graph)

const coords = []
atlas.bodies.forEach(b => {
  coords.push({
    id: b.id,
    x: b.x,
    y: b.y,
    r: b.r,
    ra: b.ra,
    family: b.node.family,
  })
})

writeFileSync('atlas-coords.json', JSON.stringify(coords, null, 2))
```

### Example 4: Verify All Deep Links

```javascript
import { openPage } from './designs/cdp.mjs'

const ids = ["scheme", "riemann-roch", "cohomology"]

for (const id of ids) {
  const page = await openPage({
    url: `http://localhost:5190/designs/atlas/#n=${id}`,
    wait: 'window.__design.ready',
  })
  
  const view = await page.eval('window.__design.view()')
  console.log(id, view.selected === id ? 'PASS' : 'FAIL')
  
  await page.close()
}
```

---

## Additional Resources

- **Main README**: `README.md` — Project overview and quick start
- **Design Specifications**:
  - `designs/atlas/SPEC.md`
  - `designs/map/SPEC.md`
  - `designs/manuscript/SPEC.md`
  - `designs/nebula-plus/SPEC.md`
- **Data Pipeline**: `kb-src/README.md`
- **Verification**: `scripts/README.md` (if exists) or `npm run verify`
- **Performance Analysis**: `designs/SCALABILITY.md`, `designs/NEBULA-PLUS-PERF.md`

---

## Support

For questions or issues:

1. Check existing documentation in `docs/` and `designs/`
2. Review verification scripts in `scripts/` for usage patterns
3. Inspect working examples in `designs/verify.mjs`

---

**Last Updated**: 2026-11-02  
**API Version**: 1.0 (aligned with designs verification suite)
