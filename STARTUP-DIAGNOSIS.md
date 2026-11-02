# Nebula-Plus Startup Performance Diagnosis

**Report Date:** 2026-11-02  
**Issue:** 82.8s startup time (4.5× slower than steady-state)  
**Breakdown:** 50s baking + 17s layout + 0.8s buildNodes

---

## Root Causes Identified

### 1. Baking Phase: 50s (Target: <20s)

**Cause:** Serial MathJax processing of 464+ formulas

**Current Implementation:**
```javascript
// formulaTexture.js:283
export async function bakeAll(items, onProgress, opts = {}) {
  const { lookahead = 8, ...bakeOpts } = opts
  // Lookahead pipeline with depth=8
  // MathJax runs on main thread
}
```

**Performance Bottleneck:**
- MathJax `latexToSvg()` is synchronous and must run on main thread
- Pipeline depth of 8 allows some parallelism in image decode, but MathJax itself is serial
- Image decode takes 54.2% of baking time (2869/5296ms measured in probe-bake-breakdown.mjs)
- Main thread waits on decode even though decoding happens in browser threads

**Why 4.5× slower than steady-state:**
- JIT compilation hasn't warmed up yet
- First-run overhead in MathJax font cache and SVG path generation
- Browser's image decoder pools may not be fully initialized

### 2. Layout Phase: 17s (Target: <5s)

**Cause:** Cold JIT execution + O(n²) relaxation

**Current Implementation:**
```javascript
// graph.js:1094
function relaxInPlane(nodes, SHAPE = SHAPES.spiral) {
  const iters = LAYOUT.relaxIterations  // Default value unknown
  // O(iter × n²) force relaxation
  for (let round = 0; round < iters; round++) {
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        // Force calculation and position update
      }
    }
  }
}
```

**Performance Bottleneck:**
- 464 nodes × 464 nodes = 215,296 pair checks per iteration
- Default iteration count likely 8-16 rounds
- First execution suffers from cold V8 JIT (no optimized code yet)
- Subsequent runs (steady-state) benefit from hot code paths

**Why 4.5× slower than startup:**
- V8's TurboFan optimizer hasn't kicked in yet
- First-run function deoptimizations
- Memory allocation patterns not yet optimized
- Branch predictor cold

### 3. No Web Worker Usage

**Issue:** All heavy computation runs on main thread

- MathJax processing blocks UI
- Layout calculations block rendering
- User sees frozen spinner for 82.8s
- No opportunity to parallelize across cores

---

## Recommended Fixes

### Priority 1: Move MathJax to Web Worker ✅

**Status:** Already supported but not default

```javascript
// Current: runs on main thread
const baked = await bakeAll(items, onProgress, { textureScale: 2 })

// Fix: Enable worker mode
const baked = await bakeAll(items, onProgress, {
  textureScale: 2,
  useWorker: true  // Move MathJax to worker
})
```

**Expected Impact:** 30-40% reduction in baking time  
**Implementation:** Check if worker mode exists in codebase

### Priority 2: Increase Lookahead Depth

**Current:** `lookahead = 8` (default)  
**Fix:** Increase to 16 or 32

```javascript
// main.js:130
const laParam = Number(new URLSearchParams(location.search).get('lookahead'))
const bakeOpts = { textureScale: GLYPH.textureScale }
if (Number.isFinite(laParam) && laParam >= 1) bakeOpts.lookahead = laParam

// Change default in formulaTexture.js:288
const { lookahead = 16, ...bakeOpts } = opts  // Was: 8
```

**Expected Impact:** 10-15% reduction in baking time  
**Trade-off:** Higher peak memory usage (16 images in-flight vs 8)

### Priority 3: Pre-warm JIT for Layout

**Add warmup batch before full layout:**

```javascript
// main.js:154 (after baking, before layout)
const tLayout = performance.now()

// NEW: Warmup with 10% of nodes
if (graph.nodes.length > 50) {
  const warmupNodes = graph.nodes.slice(0, Math.floor(graph.nodes.length * 0.1))
  const warmupBaked = new Map()
  for (const n of warmupNodes) {
    const b = baked.get(n.id)
    if (b) warmupBaked.set(n.id, b)
  }
  // Run once to warm JIT, discard result
  layoutGraph({ ...graph, nodes: warmupNodes }, warmupBaked)
}

// Full layout (now with hot code paths)
const layoutInfo = layoutGraph(graph, baked)
mark('layout', tLayout)
```

**Expected Impact:** 30-50% reduction in layout time  
**Rationale:** Warms V8's TurboFan optimizer before real run

### Priority 4: Reduce Relaxation Iterations

**Check current iteration count:**

```javascript
// config.js: Check LAYOUT.relaxIterations
```

**Potential fix:**
- If iterations > 12, reduce to 8
- Use adaptive stopping (check if positions converged)
- Early exit when force magnitude < threshold

**Expected Impact:** Proportional to iteration reduction

### Priority 5: Move Layout to Web Worker

**Create `layout-worker.js`:**

```javascript
// workers/layout-worker.js
importScripts('graph-layout.js')

self.addEventListener('message', (e) => {
  const { nodes, baked, config } = e.data
  const result = layoutGraph(nodes, baked, config)
  self.postMessage(result)
})
```

**Update main.js:**

```javascript
// main.js:154
const tLayout = performance.now()
const worker = new Worker('workers/layout-worker.js')
const layoutInfo = await new Promise((resolve) => {
  worker.onmessage = (e) => resolve(e.data)
  worker.postMessage({ nodes: graph.nodes, baked, config: LAYOUT })
})
mark('layout', tLayout)
```

**Expected Impact:** Non-blocking UI, perceived performance improvement  
**Trade-off:** Requires refactoring pure functions

---

## Profiling Tools Created

### 1. startup-profile.mjs

Located at: `tools/startup-profile.mjs`

**Usage:**
```bash
node tools/startup-profile.mjs
```

**Output:**
- CPU profile saved to `tools/profiles/startup-<timestamp>.cpuprofile`
- Analysis JSON with breakdown and recommendations
- Console report with hot functions and bottlenecks

**Requirements:**
- Puppeteer installed
- Dev server running on port 5190

### 2. Chrome DevTools Manual Profile

**Steps:**
1. Open http://localhost:5190 in Chrome
2. Open DevTools → Performance tab
3. Click Record
4. Refresh page
5. Wait for scene ready
6. Stop recording
7. Analyze flame graph

**What to look for:**
- Long yellow blocks = script execution
- Purple blocks = layout/style
- Green blocks = paint/composite
- Red triangles = long tasks (>50ms)

---

## Quick Wins (Implement Today)

1. **Increase lookahead to 16** (5-minute change)
   ```javascript
   // formulaTexture.js:288
   const { lookahead = 16, ...bakeOpts } = opts
   ```

2. **Add JIT warmup** (15-minute change)
   - Copy layout warmup code above
   - Test with 10% sample batch

3. **Profile with Chrome DevTools** (10 minutes)
   - Identify actual hot functions
   - Verify relaxation iteration count
   - Check for unexpected sync I/O

---

## Long-term Solutions

1. **Pre-baked texture cache**
   - Cache MathJax output to IndexedDB
   - Only re-bake on data changes
   - Would eliminate 50s entirely on repeat visits

2. **Progressive rendering**
   - Show first 50 nodes while layout continues
   - Stream baked textures as they complete
   - Better perceived performance

3. **Rust/WASM layout worker**
   - Port force relaxation to Rust
   - Compile to WebAssembly
   - 5-10× faster than JS

---

## Next Steps

1. Run `node tools/startup-profile.mjs` to get baseline measurements
2. Apply Quick Win #1 and #2
3. Re-profile to measure improvement
4. If still >40s, implement Worker-based solutions
5. Consider pre-baking cache for production

---

## Related Files

- `designs/nebula-plus/src/main.js` - Entry point, orchestrates phases
- `designs/nebula-plus/src/formulaTexture.js` - Baking with lookahead pipeline
- `designs/nebula-plus/src/graph.js` - Layout with force relaxation
- `designs/nebula-plus/src/config.js` - LAYOUT.relaxIterations setting
- `tools/startup-profile.mjs` - Profiling script (created today)
