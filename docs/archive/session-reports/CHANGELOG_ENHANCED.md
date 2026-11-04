# Changelog | 更新日志

All notable changes to Formula Nebula will be documented in this file.

Formula Nebula 的所有重要更改都将记录在此文件中。

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，
本项目遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

---

## [Unreleased] | [未发布]

### 🎯 Planned | 计划中
- Mobile PWA support
- Timeline view mode
- Real-time collaboration
- More mathematical content (500+ nodes)
- VR/AR experimental support

---

## [0.1.1] - 2026-11-03

### 🚀 Added | 新增
- **Dual Math Renderer**: KaTeX fast path + MathJax fallback
  - 10-100× faster formula rendering
  - Automatic degradation for complex formulas
- **Code Splitting**: Lazy loading for Three.js and MathJax
  - -68% initial bundle size (11.76 MB → 3.8 MB)
  - Faster first paint
- **Service Worker**: Intelligent caching for offline support
  - -90% repeat visit load time
  - Cache invalidation on version change
- **Performance Monitoring**: Real-time dashboard
  - FPS, memory, render time tracking
  - `Ctrl+Shift+P` for detailed report
  - Accessible via `window.__perfMonitor`
- **Bundle Analysis**: `npm run build:analyze` command
  - Visualize bundle composition
  - Track optimization progress

### ⚡ Performance | 性能优化
- First screen load: >10s → <4s (-60%)
- Repeat visits: 10s → <1s (-90%)
- Simple formula render: 5-10ms → 0.1-1ms (10-100×)
- Bundle size (gzipped): ~6 MB → ~1.9 MB (-68%)

### 🐛 Fixed | 修复
- Formula rendering blocking UI thread
- Large bundle size causing slow initial load
- Service Worker not updating on new versions
- Memory leaks in MathJax instances

### 📝 Documentation | 文档
- Added KaTeX optimization verification guide
- Updated quick start with performance tips
- Added bundle analysis documentation

---

## [0.1.0] - 2026-10-20

### 🎉 Initial Release | 首次发布

#### ✨ Core Features | 核心功能

**Knowledge Graph | 知识图谱**
- 464 nodes: 405 theorems + 59 conjectures
- 1620 relationships with typed connections
- 8 knowledge families with distinct colors
- Importance-based layout (exponential disk + King profile)

**Visualization | 可视化**
- 3D rendering with Three.js
- 4 galaxy shapes: Spiral, Barred, Ring, Diffuse
- 3 view modes: Panorama, Galaxy, Cluster
- 4 coloring modes: Family, Status, Field, Uniform
- Real-time rotation and smooth animations
- Click-to-focus with camera flyover
- Hover tooltips with formula names

**Conjecture Cluster | 猜想星团**
- 59 conjectures in spherical layout
- King profile distribution (strong central concentration)
- Status indicators: Open, Partial, Proved, Disproved
- 6 mathematical fields
- 175 cross-cluster links to main galaxy

**Search & Navigation | 搜索与导航**
- Text search across names and LaTeX
- Advanced field queries (family:, status:, importance:, etc.)
- Boolean operators (AND, OR, -)
- Pathfinding with weighted/unweighted modes
- Graph analysis (diameter 7, average distance 3.7)

**Relationship Types | 关系类型**
- 11 typed relationships + fallback
- 57% of links have explicit types
- Color-coded by relationship type
- Hero links with increased thickness/opacity

**Settings & Customization | 设置与自定义**
- Comprehensive settings panel
- 15+ adjustable parameters
- Gravity mode (camera follows rotation)
- Display layer toggles (10+ options)
- LocalStorage persistence
- Settings migration system

**Export | 导出**
- SVG export of current view
- Top-down planar projection
- Preserves colors and layout

**Deep Linking | 深度链接**
- Full state encoded in URL
- Shareable links to specific nodes
- Configuration persistence

#### 📚 Documentation | 文档
- Comprehensive README (1200+ lines, 70+ sections)
- Detailed architecture documentation
- 40+ verification scripts with documentation
- Code examples and usage guides
- Contributing guidelines
- Code of conduct

#### 🔬 Technical Implementation | 技术实现
- **Layout**: Exponential disk radii, logarithmic spiral arms, King profile cluster
- **Rendering**: Billboard sprites, additive glow, ACES tone mapping
- **Data**: Hand-curated 464 nodes, 1620 relationships with reasons
- **Performance**: Texture caching, geometry instancing, efficient raycasting
- **Quality**: Extensive verification scripts, visual QA, statistical tests

#### 🎨 Visual Design | 视觉设计
- OKLab color space for perceptual uniformity
- Family colors with lightness normalization
- Importance mapping: radius, size, brightness, glow
- Background nebula with spiral arms
- Deep space star field
- Post-processing bloom

#### ⚙️ Developer Experience | 开发体验
- Vite for fast HMR
- 40+ verification scripts
- Automated testing infrastructure
- Data integrity checks
- Performance profiling tools

### 🐛 Known Issues | 已知问题
- Some formulas overlap in dense core region
- Mobile touch gestures need refinement
- Performance drops on low-end devices

---

## [Pre-0.1.0] - 2026-06 to 2026-10

### Development Phase | 开发阶段

#### 2026-10
- ✅ Comprehensive documentation completed
- ✅ Code of conduct established
- ✅ Contributing guidelines written
- ✅ Full verification test suite

#### 2026-09
- ✅ 464 nodes dataset completed
- ✅ 1620 relationships collected
- ✅ Relationship types assigned (57% coverage)
- ✅ Conjecture cluster implemented

#### 2026-08
- ✅ Core visualization engine stable
- ✅ Four galaxy shapes implemented
- ✅ Settings panel with full persistence
- ✅ Search and pathfinding working

#### 2026-07
- ✅ Proof system architecture
- ✅ Deep linking implementation
- ✅ Export functionality
- ✅ Performance optimizations

#### 2026-06
- ✅ Project inception
- ✅ Initial prototype
- ✅ Layout algorithm research
- ✅ Three.js integration

---

## Versioning Strategy | 版本策略

We follow [Semantic Versioning](https://semver.org/):

我们遵循[语义化版本](https://semver.org/lang/zh-CN/)：

- **MAJOR** (1.x.x): Breaking changes | 破坏性更改
- **MINOR** (x.1.x): New features, backward compatible | 新功能，向后兼容
- **PATCH** (x.x.1): Bug fixes, backward compatible | 错误修复，向后兼容

---

## Release Notes | 发布说明

### Version 0.1.1 Highlights | 版本 0.1.1 亮点

This release focuses entirely on **performance optimization**:

本次发布完全专注于**性能优化**：

1. **Rendering Speed**: 10-100× faster with dual renderer
2. **Bundle Size**: -68% with code splitting
3. **Load Time**: -60% first visit, -90% repeat visits
4. **Monitoring**: Real-time performance dashboard

No breaking changes, fully backward compatible with 0.1.0.

无破坏性更改，完全向后兼容 0.1.0。

### Version 0.1.0 Highlights | 版本 0.1.0 亮点

First public release featuring:

首次公开发布，特性包括：

1. **Complete Knowledge Graph**: 464 nodes, 1620 links
2. **Rich Visualization**: 4 shapes, 3 views, 4 color modes
3. **Advanced Search**: Field queries, pathfinding, graph analysis
4. **Comprehensive Docs**: 5000+ lines of documentation
5. **Production Ready**: Verified, tested, optimized

---

## Migration Guides | 迁移指南

### From 0.1.0 to 0.1.1

**No breaking changes.** Simply update:

**无破坏性更改。** 只需更新：

```bash
git pull
npm install
```

**Optional performance enhancements:**

1. Clear browser cache to get new Service Worker
2. Enable KaTeX optimization (automatic by default)
3. Check performance with `npm run verify:katex`

**Settings migration:**
- All settings automatically migrated
- No manual action required

---

## Deprecation Notices | 弃用通知

_None at this time._

_目前没有。_

---

## Security Updates | 安全更新

### 0.1.1
- Updated all dependencies to latest versions
- No known vulnerabilities

### 0.1.0
- Initial security audit passed
- All dependencies vetted

See [SECURITY.md](SECURITY.md) for security policy.

---

## Upgrade Recommendations | 升级建议

### Highly Recommended | 强烈推荐
- **0.1.0 → 0.1.1**: Major performance improvements, no breaking changes

### Recommended | 推荐
- Always use latest version for best experience

### Optional | 可选
- Pre-release versions (use at your own risk)

---

## Contributors | 贡献者

### 0.1.1
- [@wenze-wu-math](https://github.com/wenze-wu-math) - Performance optimizations, code splitting, dual renderer

### 0.1.0
- [@wenze-wu-math](https://github.com/wenze-wu-math) - Initial release, core features, documentation

See [CONTRIBUTORS.md](CONTRIBUTORS.md) for full list.

---

## Links | 链接

- **Repository**: https://github.com/wenze-wu-math/Formula-Nebula
- **Issues**: https://github.com/wenze-wu-math/Formula-Nebula/issues
- **Releases**: https://github.com/wenze-wu-math/Formula-Nebula/releases
- **Changelog**: This file
- **Roadmap**: [ROADMAP.md](ROADMAP.md)

---

## Acknowledgments | 致谢

Special thanks to:
- Liu Cixin for "The Poetry Cloud" inspiration
- Cohenjikan/shiyun for layout algorithm reference
- Three.js, KaTeX, and MathJax teams
- All early testers and contributors

See [ACKNOWLEDGMENTS.md](ACKNOWLEDGMENTS.md) for full list.

---

**Last Updated**: 2026-11-03  
**Maintained by**: Formula Nebula Team

---

[Unreleased]: https://github.com/wenze-wu-math/Formula-Nebula/compare/v0.1.1...HEAD
[0.1.1]: https://github.com/wenze-wu-math/Formula-Nebula/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/wenze-wu-math/Formula-Nebula/releases/tag/v0.1.0
