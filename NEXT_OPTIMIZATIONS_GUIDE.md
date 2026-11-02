# Formula Nebula - 接下来要做什么？实施指南

> 按优先级排列的具体行动步骤

---

## 🎯 最高优先级优化（本周完成）

### #1: KaTeX迁移 - 立即收益 3MB + 100x速度

**当前状态检查**:
```bash
# 查看当前依赖
grep -r "mathjax" src/ designs/
# 预期: 看到 MathJax-full 被导入
```

**修改步骤**:

#### 第1步: 修改 `designs/shared/tex.js`
```javascript
// 改前
import * as MathJax from 'mathjax-full/js/mathjax.js'

// 改后 - KaTeX优先, MathJax备选
import katex from 'katex'
import 'katex/dist/katex.min.css'

export function renderFormula(latex, options = {}) {
  try {
    // 首先尝试 KaTeX (快速)
    return katex.renderToString(latex, {
      throwOnError: false,
      displayMode: options.display || false,
      ...options
    })
  } catch (e) {
    // 复杂公式降级到 MathJax
    console.warn('KaTeX failed, falling back to MathJax:', latex)
    return renderWithMathJax(latex, options)
  }
}
```

#### 第2步: 更新 `designs/atlas/bake.js`
```javascript
// 改用 KaTeX 进行公式烘焙
const renderFormula = (latex) => {
  try {
    const svg = katex.renderToString(latex, {
      throwOnError: true,
      output: 'mathml'
    })
    return svg
  } catch (e) {
    // 降级处理
    return genericMathSymbol(latex)
  }
}
```

#### 第3步: 更新 `designs/manuscript/formulas.js`
```javascript
// 改用 KaTeX 渲染
const bakeFormula = (latex) => {
  const html = katex.renderToString(latex, {
    throwOnError: false
  })
  return renderToCanvas(html)
}
```

**验证**:
```bash
npm run build
# 预期: 包体积从 3.1MB 降到 ~2.5MB

npm run dev
# 访问 http://localhost:5190/designs/atlas
# 检查: 公式快速渲染, 无明显延迟
```

**预期效果**:
- ✅ 包体积: 3.1MB → 2.5MB (-19%)
- ✅ 首屏: 10s → 8s (-20%)
- ✅ 公式渲染: 秒级 (10倍快)

**时间**: 30分钟

---

### #2: 代码分割 - 68%包体积削减

#### 第1步: 修改 `vite.config.js`
```javascript
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'katex': ['katex'],
          'three': ['three'],
          'designs-atlas': ['./designs/atlas/main.js'],
          'designs-map': ['./designs/map/src/main.js'],
          'designs-manuscript': ['./designs/manuscript/main.js'],
          'designs-nebula': ['./designs/nebula-plus/src/main.js'],
        }
      }
    },
    chunkSizeWarningLimit: 1000,
  }
}
```

#### 第2步: 路由懒加载 (`designs/index.html`)
```javascript
// 改前: 所有设计都同时加载
import Atlas from './atlas/main.js'
import Map from './map/src/main.js'
// ...

// 改后: 按需加载
const loadDesign = async (design) => {
  const modules = {
    atlas: () => import('./atlas/main.js'),
    map: () => import('./map/src/main.js'),
    manuscript: () => import('./manuscript/main.js'),
    nebula: () => import('./nebula-plus/src/main.js'),
  }
  
  try {
    const module = await modules[design]()
    return module.default || module
  } catch (e) {
    console.error(`Failed to load design: ${design}`, e)
    throw e
  }
}

// 点击时加载
document.querySelectorAll('[data-design]').forEach(btn => {
  btn.addEventListener('click', async (e) => {
    const design = e.target.dataset.design
    showLoadingIndicator()
    const DesignModule = await loadDesign(design)
    renderDesign(DesignModule)
    hideLoadingIndicator()
  })
})
```

#### 第3步: 数据按需加载
```javascript
// src/graph.js
// 改前: 全部导入
import * as knowledge from './data/knowledge.js'
import * as stacks from './data/stacks-extra.js'
import * as nlab from './data/nlab-extra.js'
// ...所有56个模块

// 改后: 动态导入
const dataModules = {
  knowledge: () => import('./data/knowledge.js'),
  stacks: () => import('./data/stacks-extra.js'),
  nlab: () => import('./data/nlab-extra.js'),
  // ... 其他
}

export async function loadGraphData(sources = ['knowledge']) {
  const nodes = []
  const links = []
  
  for (const source of sources) {
    const module = await dataModules[source]()
    nodes.push(...module.nodes)
    links.push(...module.links)
  }
  
  return { nodes, links }
}
```

**验证**:
```bash
npm run build
# 预期: 
# - 主bundle: 1.0MB (gzipped)
# - katex-chunk: 300KB
# - three-chunk: 400KB
# - 设计chunks: 200-300KB each

# 比较总大小: 3.1MB → 1.2MB (-61%)
```

**时间**: 1小时

---

### #3: Service Worker缓存 - 即时重复加载

#### 第1步: 创建 `public/sw.js`
```javascript
const CACHE_NAME = 'formula-nebula-v1'
const ASSETS = [
  '/',
  '/index.html',
  '/designs/index.html',
  '/designs/atlas/index.html',
  '/designs/map/index.html',
  '/designs/manuscript/index.html',
  '/designs/nebula-plus/index.html',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS)
    })
  )
})

self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (!response || response.status !== 200) {
          return response
        }
        
        const cloneRes = response.clone()
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, cloneRes)
        })
        return response
      })
      .catch(() => {
        return caches.match(event.request)
          .then((response) => {
            return response || new Response('Offline')
          })
      })
  )
})
```

#### 第2步: 注册 SW (`src/main.js`)
```javascript
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').then(
    (reg) => {
      console.log('Service Worker registered:', reg)
    },
    (error) => {
      console.log('Service Worker registration failed:', error)
    }
  )
}
```

#### 第3步: 添加加载指示 (`designs/index.html`)
```html
<div id="loading-indicator" style="display: none;">
  <div class="spinner"></div>
  <p>正在加载设计...</p>
</div>

<style>
#loading-indicator {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 20px;
  border-radius: 8px;
  z-index: 9999;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 10px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
```

**验证**:
```bash
npm run dev
# 1. 首次访问: 正常加载
# 2. 刷新: 应从缓存加载, 速度明显更快
# 3. 离线模式: 禁用网络, 应显示缓存内容

# 检查缓存
# Chrome DevTools → Application → Cache Storage
# 预期: 看到 formula-nebula-v1 缓存
```

**预期效果**:
- ✅ 重复访问: <1s (vs 原来 5-10s)
- ✅ 离线: 基本功能可用
- ✅ 带宽: 首次后80%缓存命中

**时间**: 45分钟

---

### #4: Tree-shaking Three.js - 500-800KB削减

#### 第1步: 修改 `src/scene.js`
```javascript
// 改前: 导入整个库
import * as THREE from 'three'

// 改后: 只导入需要的
import {
  WebGLRenderer,
  Scene,
  PerspectiveCamera,
  Color,
  Vector3,
  Points,
  PointsMaterial,
  BufferGeometry,
  BufferAttribute,
  Sprite,
  SpriteMaterial,
  CanvasTexture,
  LinearFilter,
  TextureLoader,
  CubeTextureLoader,
  EquirectangularReflectionMapping,
} from 'three'

import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'

// 之前: const renderer = new THREE.WebGLRenderer()
// 改为:
const renderer = new WebGLRenderer({ antialias: true, alpha: true })
```

#### 第2步: 检查所有Three.js导入
```bash
grep -r "import.*THREE" src/
grep -r "from.*three" src/

# 替换所有为命名导入
# 示例:
# THREE.Vector3 → Vector3
# THREE.Scene → Scene
# etc.
```

**验证**:
```bash
npm run build
# 预期: Three.js chunk 从 1.2MB 减到 400-500KB
```

**时间**: 1小时

---

## 📊 第一阶段总结（4个优化完成后）

**组合效果**:
```
┌────────────────────────────────────────┐
│ Before (现状)                          │
├────────────────────────────────────────┤
│ Bundle (gzip):     3.1 MB              │
│ 首屏时间:          >10s (移动端)       │
│ 公式渲染:          分钟级              │
│ 缓存命中:          无                  │
│ 性能评分:          ~45                 │
├────────────────────────────────────────┤
│ After (4个优化)                        │
├────────────────────────────────────────┤
│ Bundle (gzip):     0.9 MB (-71%)       │
│ 首屏时间:          <3s (-70%)          │
│ 公式渲染:          毫秒级 (100x快)    │
│ 缓存命中:          80%+ (重复访问<1s)  │
│ 性能评分:          92+                 │
└────────────────────────────────────────┘
```

**完成后可立即发布 v1.1.0！**

---

## 🚀 后续优化（第2、3阶段）

### 已准备好的其他优化:

**第2周**:
- WebGL 多通道渲染优化
- 移动端自适应质量分层
- WCAG AAA 无障碍合规

**第3周**:
- Firebase Realtime DB 集成
- GraphQL API 端点
- Sentry 监控

**第4周+**:
- PWA 离线体验
- AI 功能强化
- B2B 企业功能

---

## ✅ 质量检查清单

完成每个优化后检查:

- [ ] 构建成功 (无warnings)
- [ ] 功能完整 (所有功能正常)
- [ ] 性能提升 (基准测试通过)
- [ ] 无回归 (旧功能仍然工作)
- [ ] 测试通过 (npm test)
- [ ] 审计通过 (npm audit)
- [ ] 文档更新 (CHANGELOG.md)

---

## 💡 需要帮助?

任何优化步骤遇到问题:

1. **查看完整路线图**: OPTIMIZATION_ROADMAP.md
2. **查看性能报告**: audit-reports/cycle-1-performance.md
3. **查看UX报告**: audit-reports/cycle-1-ux.md

---

*祝优化顺利！这4个优化完成后, Formula Nebula 会变成一个性能杰作! 🚀*
