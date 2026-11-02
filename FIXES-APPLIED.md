# Startup Performance Fixes Applied

**Date:** 2026-11-02  
**Target:** Reduce 82.8s startup time to <40s

---

## Changes Made

### 1. Increased Baking Lookahead Depth ✅

**File:** `designs/nebula-plus/src/formulaTexture.js:288`

**Change:**
```javascript
// Before
const { lookahead = 8, ...bakeOpts } = opts

// After
const { lookahead = 16, ...bakeOpts } = opts  // Increased from 8 to 16 for better parallelism
```

**Expected Impact:** 10-15% reduction in baking time (50s → ~43s)

**Rationale:**
- Image decode takes 54.2% of baking time (2869/5296ms measured)
- Decode happens in browser threads, not main thread
- Deeper pipeline allows more decodes to run in parallel
- Memory trade-off: 16 images in-flight vs 8 (negligible with 464 formulas)

---

### 2. Added JIT Warmup for Layout ✅

**File:** `designs/nebula-plus/src/main.js:154`

**Change:**
```javascript
// Added before full layout
if (graph.nodes.length > 50) {
  const sampleSize = Math.floor(graph.nodes.length * 0.10)
  const warmupNodes = graph.nodes.slice(0, sampleSize)
  const warmupBaked = new Map()
  for (const n of warmupNodes) {
    const b = baked.get(n.id)
    if (b) warmupBaked.set(n.id, b)
  }
  // Warmup run - discard result, only want JIT side effect
  layoutGraph({ ...graph, nodes: warmupNodes }, warmupBaked)
}
```

**Expected Impact:** 30-50% reduction in layout time (17s → ~9-12s)

**Rationale:**
- Layout is 4.5× slower on first run due to cold V8 JIT
- 10% sample batch (~46 nodes) is large enough to trigger TurboFan optimizer
- Covers all hot code paths in force relaxation loop
- Warmup cost is ~1.7s, saves 5-8s on full layout

---

### 3. Reduced Relaxation Iterations (Conservative) ✅

**File:** `designs/nebula-plus/src/config.js:253`

**Change:**
```javascript
// Before
relaxIterations: 200,

// After
relaxIterations: 150,  // Temporarily reduced for faster startup (was: 200)
```

**Expected Impact:** 25% reduction in layout time (17s → ~13s after warmup)

**Rationale:**
- O(iter × n²) complexity means linear speedup
- 200 iterations was determined to be "性价比拐点" (cost-benefit inflection)
- 150 is conservative - may need revert if quality degrades
- Can be tuned per-shape if needed

**⚠️ NEEDS VERIFICATION:**
- Run visual inspection after changes
- Check overlap metrics: `核心可读竖带` should stay >5px
- If quality drops, revert to 175 or 200

---

## Expected Total Impact

### Before
- Baking: 50s
- Layout: 17s
- BuildNodes: 0.8s
- **Total: 82.8s**

### After (Projected)
- Baking: ~43s (10% improvement)
- Layout: ~10s (41% improvement with warmup)
- BuildNodes: 0.8s
- **Total: ~53.8s** (35% improvement)

### Stretch Goal (with Worker)
- Baking: ~30s (offload to worker)
- Layout: ~8s (worker + warmup)
- BuildNodes: 0.8s
- **Total: ~38.8s** (53% improvement)

---

## Next Steps

### Immediate (Test Today)

1. **Build and test:**
   ```bash
   npm run dev
   # Navigate to http://localhost:5190
   # Measure actual startup time
   ```

2. **Verify quality:**
   - Check for increased formula overlap
   - Verify `核心可读竖带 >= 5px`
   - Run existing verification scripts if available

3. **Profile with Chrome DevTools:**
   - Open DevTools → Performance
   - Record full startup
   - Verify layout time actually decreased
   - Check if any new bottlenecks appeared

### Short-term (This Week)

4. **Run automated profiler:**
   ```bash
   node tools/startup-profile.mjs
   ```
   - Captures CPU profile
   - Generates detailed analysis
   - Saves baseline for future comparison

5. **Fine-tune relaxation:**
   - If quality is acceptable, try 125 iterations
   - If quality dropped, revert to 175
   - Document sweet spot in config comments

### Medium-term (Next Sprint)

6. **Implement Web Worker for baking:**
   - Move MathJax to worker thread
   - Non-blocking UI during baking
   - Target: 30s baking time

7. **Implement Web Worker for layout:**
   - Offload force relaxation to worker
   - Requires refactoring pure functions
   - Target: 8s layout time

8. **Add early termination to relaxation:**
   ```javascript
   // Stop if forces converged
   if (totalForce < threshold) break
   ```

### Long-term (Future)

9. **Pre-baked texture cache:**
   - Cache MathJax output to IndexedDB
   - Only re-bake on data changes
   - Would eliminate 50s on repeat visits

10. **Progressive rendering:**
    - Show first 50 nodes while layout continues
    - Stream textures as they complete
    - Better perceived performance

---

## Rollback Instructions

If any change causes issues:

### Revert Lookahead
```bash
git checkout HEAD -- designs/nebula-plus/src/formulaTexture.js
```

### Revert JIT Warmup
```bash
git checkout HEAD -- designs/nebula-plus/src/main.js
```

### Revert Relaxation Change
```bash
git checkout HEAD -- designs/nebula-plus/src/config.js
```

Or manually change values back to originals.

---

## Monitoring

After deployment, track:
- Actual startup time via `#diag` element
- User-reported quality issues
- Frame rate during startup
- Memory usage peaks

---

## Related Files

- Diagnosis: `STARTUP-DIAGNOSIS.md`
- Profiler: `tools/startup-profile.mjs`
- Config: `designs/nebula-plus/src/config.js`
- Main: `designs/nebula-plus/src/main.js`
- Baking: `designs/nebula-plus/src/formulaTexture.js`
- Layout: `designs/nebula-plus/src/graph.js`
