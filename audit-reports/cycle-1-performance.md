# Performance Audit Report - Cycle 1

**Generated:** 2026-11-02T16:02:51.729Z
**Project:** Formula Nebula v0.1.0

---

## Executive Summary

Formula Nebula is an ambitious 3D knowledge graph visualization with **critical performance bottlenecks**:

- ⚠️ **Bundle size: 11755 kB (3132 kB gzipped)** - Exceeds recommended 2 MB threshold
- ⚠️ **Main bottleneck:** MathJax rendering (minutes for 1000+ nodes) + monolithic bundle
- ⚠️ **Memory footprint:** Estimated ~600 MB (heap + VRAM)
- ✅ **Progressive UI:** Formula baking shows progress feedback
- ✅ **Deferred layout:** Nodes built after layout computation

**Recommended priority:** Switch to KaTeX + implement code splitting.

---

## 1. Build Metrics

### Bundle Sizes

| Asset | Raw Size | Gzipped | Status |
|-------|----------|---------|--------|
| JavaScript | 11755 kB | 3132 kB | ⚠️ **Exceeds 2 MB** |
| CSS | 29.50 kB | 8.20 kB | ✅ Acceptable |
| **Total** | **11785 kB** | **3140 kB** | |

### Source Composition

- **Source files:** 138
- **Data modules:** 56 (statically bundled)
- **Design prototypes:** 20

### Dependencies

**Production:**
- `katex`
- `mathjax-full`
- `three`
- `ws`

**Dev:**
- `vite`

---

## 2. Top 10 Bottlenecks

### 1. [CRITICAL] Bundle Size

**Issue:** Main bundle is 11755 kB (3132 kB gzipped)

**Impact:** Slow initial load (>10s on mobile), poor UX, high bandwidth cost

**Recommendation:** Code splitting: lazy-load data modules, extract Three.js/MathJax chunks


---

### 2. [HIGH] Formula Rendering

**Issue:** MathJax-full bundled (~3-4 MB uncompressed)

**Impact:** Massive bundle weight, rendering bottleneck (minutes for 1000+ formulas)

**Recommendation:** Switch to KaTeX (10-100x faster, already in dependencies), use MathJax only for edge cases


---

### 3. [HIGH] Data Loading

**Issue:** All 56 data modules bundled statically

**Impact:** Inflated bundle, no incremental loading, wasted bandwidth

**Recommendation:** Dynamic imports: load per view (galaxy/cluster), IndexedDB caching


---

### 4. [MEDIUM] Three.js Tree-shaking

**Issue:** Entire Three.js library imported

**Impact:** Includes unused loaders, helpers, effects (~500-800 kB)

**Recommendation:** Import only: WebGLRenderer, Scene, Camera, Sprite, geometry classes


---

### 5. [MEDIUM] Startup Experience

**Issue:** All content loaded before first render

**Impact:** Long white screen, poor perceived performance

**Recommendation:** Progressive loading: show scene immediately, stream nodes as they bake


---

### 6. [MEDIUM] Memory / VRAM

**Issue:** All formula textures at full resolution (~500 MB VRAM)

**Impact:** Limits mobile device support, memory pressure

**Recommendation:** LOD system: lower resolution for distant formulas, texture pooling


---

### 7. [LOW] Font Assets

**Issue:** 60+ KaTeX font files (~600 kB)

**Impact:** Network overhead

**Recommendation:** Use woff2 only, subset to used glyphs


---

### 8. [LOW] Caching Strategy

**Issue:** No service worker

**Impact:** Slow repeat visits

**Recommendation:** Service worker + cache-first strategy for assets


---

### 9. [LOW] Layout Algorithm

**Issue:** Force-directed simulation complexity

**Impact:** Slow shape switching

**Recommendation:** Profile layoutGraph, consider spatial indexing


---

### 10. [INFO] Monitoring

**Issue:** No performance tracking

**Impact:** Cannot measure real-world performance

**Recommendation:** Performance Observer API, Core Web Vitals (LCP, FID, CLS)



---

## 3. Performance Recommendations (Priority Order)

### 1. Switch to KaTeX

- **Impact:** ~3 MB savings + 10-100x faster
- **Effort:** MEDIUM


### 2. Code split data modules

- **Impact:** 40-60% bundle reduction
- **Effort:** MEDIUM


### 3. Tree-shake Three.js

- **Impact:** 500-800 kB savings
- **Effort:** LOW


### 4. Lazy-load proofs

- **Impact:** 20-30% bundle reduction
- **Effort:** LOW


### 5. Service worker caching

- **Impact:** Instant repeat loads
- **Effort:** MEDIUM


### 6. Texture LOD system

- **Impact:** 30-50% VRAM savings
- **Effort:** LOW


### 7. Virtual scrolling

- **Impact:** Reduced DOM overhead
- **Effort:** MEDIUM


### 8. Performance monitoring

- **Impact:** Real-world metrics
- **Effort:** LOW


### 9. Optimize fonts

- **Impact:** 200-400 kB savings
- **Effort:** LOW


### 10. Profile layout algorithm

- **Impact:** Faster shape switching
- **Effort:** HIGH



---

## 4. Quick Wins (Low Effort, High Impact)

The following optimizations provide immediate benefit with minimal implementation effort:

1. **Tree-shake Three.js imports** (Priority 3)
   - Effort: LOW
   - Impact: 500-800 kB savings
   - Action: Import only `WebGLRenderer`, `Scene`, `PerspectiveCamera`, `Sprite` instead of entire library

2. **Lazy-load proof data** (Priority 4)
   - Effort: LOW
   - Impact: 20-30% bundle reduction
   - Action: Dynamic import proof batches only when proof viewer opens

3. **Optimize texture resolution** (Priority 6)
   - Effort: LOW
   - Impact: 30-50% VRAM savings
   - Action: Lower `GLYPH.textureScale` for distant formulas, implement simple LOD

4. **Add performance monitoring** (Priority 8)
   - Effort: LOW
   - Impact: Real-world data collection
   - Action: Use Performance Observer API, track LCP, FID, CLS

5. **Compress font assets** (Priority 9)
   - Effort: LOW
   - Impact: 200-400 kB savings
   - Action: Use woff2 only (drop woff/ttf), subset to used glyphs

---

## 5. Estimated Performance Impact

| Metric | Current | After Optimizations | Improvement |
|--------|---------|---------------------|-------------|
| Bundle size (gzip) | 3132 kB | ~1000 kB | **70% reduction** |
| Formula rendering | Minutes (MathJax) | Seconds (KaTeX) | **10-100x faster** |
| Memory usage | ~600 MB | ~300 MB | **50% reduction** |
| Time to Interactive | >10s | <5s | **50% faster** |
| Startup white screen | Full load required | Progressive | **Immediate feedback** |

---

## 6. Implementation Roadmap

### Phase 1: Bundle Optimization (Weeks 1-2)

**Goal:** Reduce bundle from 11 MB to <4 MB

- Switch from MathJax to KaTeX (Priority 1)
- Tree-shake Three.js imports (Priority 3)
- Lazy-load proof data (Priority 4)
- Optimize font assets (Priority 9)

**Expected:** 4-5 MB bundle reduction, 10-100x faster formula rendering

### Phase 2: Code Splitting (Weeks 3-4)

**Goal:** Enable incremental loading

- Dynamic data imports by view/cluster (Priority 2)
- Service worker setup (Priority 5)
- Progressive scene initialization

**Expected:** <3 MB initial bundle, sub-second TTI on fast connections

### Phase 3: Runtime Optimization (Weeks 5-6)

**Goal:** Reduce memory footprint and improve interactions

- Texture LOD system (Priority 6)
- Virtual scrolling for lists (Priority 7)
- Layout algorithm profiling (Priority 10)

**Expected:** 50% memory reduction, smoother UI

### Phase 4: Monitoring & Iteration (Ongoing)

**Goal:** Track real-world performance

- Performance Observer integration (Priority 8)
- Real User Monitoring (RUM)
- Continuous profiling

---

## 7. Measurement Tools

### Recommended Tools

- **Lighthouse:** Automated performance audit, Core Web Vitals
- **Chrome DevTools:**
  - Performance panel: Record startup, identify long tasks (>50ms)
  - Memory panel: Heap snapshots, allocation timeline
  - Network panel: Resource waterfall, bundle analysis
- **webpack-bundle-analyzer / rollup-plugin-visualizer:** Visual bundle breakdown
- **Performance Observer API:** Real-time metrics collection

### Key Metrics to Track

| Metric | Target | Description |
|--------|--------|-------------|
| **Time to Interactive (TTI)** | <5s | When page becomes fully interactive |
| **Largest Contentful Paint (LCP)** | <2.5s | When main content renders |
| **First Input Delay (FID)** | <100ms | Input responsiveness |
| **Cumulative Layout Shift (CLS)** | <0.1 | Visual stability |
| **Total Blocking Time (TBT)** | <300ms | Sum of long tasks |
| **Bundle size** | <3 MB gzipped | Initial JavaScript payload |
| **Memory usage** | <500 MB total | Heap + VRAM combined |

---

## 8. Detailed Analysis

### 8.1 Startup Sequence

Current flow (from `src/main.js`):

1. **Graph assembly** (synchronous, fast)
2. **Formula baking via MathJax** ⚠️ **BOTTLENECK** - Minutes for 1000+ nodes
3. **Layout computation** (force-directed simulation)
4. **Node sprite creation** (WebGL)
5. **Scene initialization**

**Critical path:** MathJax rendering is the dominant startup cost.

**Observations:**
- ✅ Progressive baking with UI feedback (`ui.setProgress`)
- ✅ Deferred node building after layout
- ⚠️ No code splitting - all modules loaded upfront
- ⚠️ MathJax rendering is synchronous bottleneck
- ⚠️ All data loaded before scene appears

### 8.2 Memory Footprint Estimate

| Category | Size | Notes |
|----------|------|-------|
| **JS Heap** | ~12 MB | Graph data + application code |
| **Formula Textures** | ~500 MB VRAM | ~1000 nodes × 0.5 MB average |
| **Three.js Scene** | ~50 MB | Geometries + buffers |
| **Total** | **~562 MB** | |

**Concerns:**
- High VRAM usage limits mobile device support
- No texture pooling or LOD system
- All formulas rendered at full resolution regardless of camera distance

### 8.3 Network Analysis

From build output:

- **Main JS bundle:** 11,755.95 kB (3,132.54 kB gzipped)
- **CSS bundle:** 29.51 kB (8.17 kB gzipped)
- **Font assets:** ~60 files, ~600 kB total
- **Total assets:** ~12 MB raw, ~4 MB gzipped

**Network waterfall issues:**
- Single large JS bundle blocks rendering
- Fonts loaded serially (not parallelized)
- No resource prioritization hints

---

## 9. Conclusion

Formula Nebula demonstrates ambitious technical goals but suffers from **monolithic bundling** and **synchronous rendering bottlenecks**.

### Top Priority Actions

1. **Migrate from MathJax to KaTeX** → 3 MB savings + 10-100x speedup
2. **Implement code splitting** → 40-60% bundle reduction
3. **Add quick wins (tree-shaking, lazy proofs, texture LOD)** → Immediate 20-30% improvements

### Expected Outcome

With recommended optimizations:
- **60-70% bundle size reduction** (11 MB → 3-4 MB)
- **10-100x faster formula rendering**
- **50% memory savings**
- **Sub-5s time-to-interactive** on modern connections

### Next Steps

1. Run Lighthouse audit on production build (`npm run build && npm run preview`)
2. Profile with Chrome DevTools Performance panel to confirm bottlenecks
3. Implement Priority 1-4 recommendations (highest ROI)
4. Establish performance budget and monitoring

---

## 10. Appendix: Design Feature Analysis

The project includes 20 design prototypes in `designs/`:

- **AI integration demos** (classifier, formula recognition, graph completion)
- **Collaboration system** (real-time editing, operational transform)
- **Proof explorer** (dependency visualization)

**Status:** These are separate prototypes, not bundled in production build.

**Recommendation:** Ensure `vite.config.js` excludes `designs/` from production build to prevent accidental inclusion.

---

*Report generated by `scripts/comprehensive-audit.mjs`*
*For runtime profiling data, run: `npm run perf`*
