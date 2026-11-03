# Formula Nebula API Documentation

## 概述 | Overview

Formula Nebula 提供了一套简洁的 JavaScript API，允许程序化控制可视化、查询数据和集成到其他应用。

Formula Nebula provides a clean JavaScript API for programmatic control of the visualization, data querying, and integration into other applications.

## 全局 API | Global API

### 访问 | Access

```javascript
// 全局 API 对象
const api = window.formulaNebula;

// 开发模式下的性能监控
const perf = window.__perfMonitor;
```

## 核心方法 | Core Methods

### `getNodes()`

获取所有知识节点。

Get all knowledge nodes.

```javascript
const nodes = api.getNodes();
console.log(`Total nodes: ${nodes.length}`);
console.log('First node:', nodes[0]);
```

**返回值 | Returns:**
- `LayoutNode[]` - 包含位置和元数据的节点数组

**示例节点结构 | Example Node Structure:**
```javascript
{
  id: "scheme",
  name: "概形",
  en: "Scheme",
  latex: "\\operatorname{Spec} A",
  importance: 0.95,
  family: "scheme",
  position: { x: 10.5, y: 0.2, z: -8.3 },
  radius: 25.4,
  rank: 0.98,
  size: 8.2,
  brightness: 1.35
}
```

---

### `getLinks()`

获取所有知识关联。

Get all knowledge links.

```javascript
const links = api.getLinks();
console.log(`Total links: ${links.length}`);

// 过滤强关联
const strongLinks = links.filter(l => l.weight >= 0.8);
```

**返回值 | Returns:**
- `FormulaLink[]` - 关联数组

**示例关联结构 | Example Link Structure:**
```javascript
{
  source: "scheme",
  target: "spectrum",
  weight: 0.9,
  reason: "素谱是概形的底层空间",
  type: "defines"
}
```

---

### `search(query)`

搜索和查询知识节点。

Search and query knowledge nodes.

```javascript
// 简单搜索
const results = api.search('霍奇');

// 字段查询
const openConjectures = api.search('status:open');

// 组合查询
const important = api.search('importance:>0.9 family:scheme');

// 寻路
const path = api.search('概形 -> Hodge猜想');
```

**参数 | Parameters:**
- `query: string` - 搜索查询字符串

**返回值 | Returns:**
- `QueryResult` - 包含匹配节点和可能的错误信息

**支持的查询语法 | Supported Query Syntax:**

| Syntax | Description | Example |
|--------|-------------|---------|
| 文本搜索 | 在名称/LaTeX中查找 | `霍奇` |
| 字段查询 | `field:value` | `status:open` |
| 数值比较 | `field:>value` | `importance:>=0.9` |
| 布尔组合 | `AND`, `OR`, `-` | `family:scheme -status:proved` |
| 括号分组 | `(...)` | `(family:curve OR family:surface)` |
| 寻路 | `A -> B` | `扎里斯基闭集 -> Hodge猜想` |

**支持的字段 | Supported Fields:**
- `family` - 知识族
- `status` - 猜想状态
- `field` - 猜想领域
- `importance` - 重要度
- `id`, `name`, `en`, `latex` - 标识符

---

### `findPath(from, to, options?)`

在两个节点间寻找最短路径。

Find the shortest path between two nodes.

```javascript
// 最低代价路径 (默认)
const path1 = api.findPath('scheme', 'hodge-conjecture');

// 最少跳数路径
const path2 = api.findPath('scheme', 'hodge-conjecture', { 
  weighted: false 
});

console.log(`Path: ${path1.hops} hops, cost: ${path1.cost.toFixed(3)}`);
path1.path.forEach((node, i) => {
  console.log(`${i}. ${node.name}`);
});
```

**参数 | Parameters:**
- `from: string` - 起始节点 ID
- `to: string` - 目标节点 ID
- `options?: { weighted?: boolean }` - 选项（默认加权寻路）

**返回值 | Returns:**
- `PathResult | null` - 路径结果或 null（不可达）

```javascript
{
  path: [node1, node2, ...],  // 节点序列
  hops: 5,                     // 跳数
  cost: 0.85                   // 强度代价
}
```

---

### `focusNode(nodeId)`

聚焦到指定节点，相机移动到该节点并显示详情面板。

Focus on a specific node, moving the camera and showing details.

```javascript
// 通过 ID 聚焦
api.focusNode('hodge-conjecture');

// 通过搜索结果聚焦
const results = api.search('霍奇猜想');
if (results.nodes.length > 0) {
  api.focusNode(results.nodes[0].id);
}
```

**参数 | Parameters:**
- `nodeId: string` - 节点 ID

---

### `export(options)`

导出当前视图。

Export the current view.

```javascript
// 导出 SVG
const svg = await api.export({ format: 'svg' });
// svg 是 string，可直接保存或显示

// 导出 PNG
const blob = await api.export({ 
  format: 'png',
  width: 1920,
  height: 1080,
  quality: 0.9
});
// blob 可创建下载链接

// 导出数据 JSON
const json = await api.export({ format: 'json' });
// json 是包含所有节点和连接的字符串
```

**参数 | Parameters:**
- `options: ExportOptions`

```typescript
{
  format: 'svg' | 'png' | 'json',
  width?: number,      // PNG 宽度
  height?: number,     // PNG 高度
  quality?: number,    // PNG 质量 (0-1)
  background?: boolean // 是否包含背景
}
```

**返回值 | Returns:**
- `Promise<Blob | string>` - SVG/JSON 返回 string，PNG 返回 Blob

---

### `getSettings()`

获取当前设置。

Get current settings.

```javascript
const settings = api.getSettings();
console.log('Current shape:', settings.shape);
console.log('FPS target:', settings.params.spinRate);
```

**返回值 | Returns:**
- `Settings` - 完整的设置对象

---

### `updateSettings(partial)`

更新设置。

Update settings.

```javascript
// 改变形态
api.updateSettings({ shape: 'barred' });

// 切换取景
api.updateSettings({ view: 'cluster' });

// 调整参数
api.updateSettings({
  params: {
    spinRate: 0.05,
    glowStrength: 0.8
  }
});

// 切换显示层
api.updateSettings({
  display: {
    links: 'all',
    bloom: true
  }
});

// 启用引力模式
api.updateSettings({
  gravity: {
    enabled: true,
    followRatio: 0.98
  }
});
```

**参数 | Parameters:**
- `partial: Partial<Settings>` - 部分设置对象，只更新提供的字段

---

## 性能监控 API | Performance Monitoring API

### 访问 | Access

```javascript
const perf = window.__perfMonitor; // 仅开发模式
// 或
const perf = api.perfMonitor;
```

### `getMetrics()`

获取当前性能指标。

Get current performance metrics.

```javascript
const metrics = perf.getMetrics();
console.log(`FPS: ${metrics.fps.toFixed(1)}`);
console.log(`Memory: ${metrics.memory.toFixed(1)} MB`);
console.log(`Draw calls: ${metrics.drawCalls}`);
```

**返回值 | Returns:**
```javascript
{
  fps: 60,              // 当前 FPS
  memory: 245.3,        // 内存使用 (MB)
  renderTime: 8.5,      // 渲染时间 (ms)
  formulaRenders: 464,  // 公式渲染次数
  drawCalls: 12,        // Draw calls
  triangles: 8940       // 三角形数
}
```

### `printReport()`

在控制台打印详细性能报告。

Print detailed performance report to console.

```javascript
perf.printReport();
```

**快捷键 | Shortcut:**
- `Ctrl+Shift+P` - 在应用中按此键直接打印报告

### `start()` / `stop()`

启动/停止性能监控。

Start/stop performance monitoring.

```javascript
perf.start();  // 开始监控
// ... 运行一段时间 ...
perf.stop();   // 停止监控
perf.printReport();  // 打印结果
```

---

## 事件监听 | Event Listening

Formula Nebula 通过自定义事件发送通知。

Formula Nebula dispatches custom events for notifications.

```javascript
// 节点点击
window.addEventListener('nebula:node:click', (e) => {
  console.log('Node clicked:', e.detail.node);
});

// 节点悬停
window.addEventListener('nebula:node:hover', (e) => {
  console.log('Node hovered:', e.detail.node);
});

// 设置改变
window.addEventListener('nebula:settings:change', (e) => {
  console.log('Settings changed:', e.detail);
});

// 搜索
window.addEventListener('nebula:search', (e) => {
  console.log('Search query:', e.detail.query);
  console.log('Results:', e.detail.results);
});

// 导出完成
window.addEventListener('nebula:export:complete', (e) => {
  console.log('Export completed:', e.detail.format);
});
```

**可用事件 | Available Events:**
- `nebula:node:click` - 节点被点击
- `nebula:node:hover` - 鼠标悬停在节点上
- `nebula:node:unhover` - 鼠标离开节点
- `nebula:settings:change` - 设置改变
- `nebula:search` - 执行搜索
- `nebula:export:start` - 开始导出
- `nebula:export:complete` - 导出完成
- `nebula:ready` - 应用初始化完成

---

## URL Deep Linking

应用状态完全编码在 URL 中，支持深度链接。

Application state is fully encoded in the URL for deep linking.

### URL 参数 | URL Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `node` | string | 聚焦的节点 ID |
| `shape` | string | 星系形态 (spiral/barred/ring/diffuse) |
| `view` | string | 取景模式 (panorama/galaxy/cluster) |
| `color` | string | 着色模式 (family/status/field/uniform) |
| `spin` | number | 星系自转速度 |
| `glow` | number | 光点强度 |
| `links` | string | 连线模式 (focus/all/off) |
| `cluster` | boolean | 显示星团 |
| `bloom` | boolean | 后处理辉光 |

### 示例 URL | Example URLs

```
# 聚焦 Hodge 猜想，棒旋形态
https://example.com/#node=hodge-conjecture&shape=barred

# 猜想星团视图，按状态着色
https://example.com/#view=cluster&color=status

# 所有连线可见，关闭辉光
https://example.com/#links=all&bloom=false

# 完整配置
https://example.com/#node=scheme&shape=ring&view=galaxy&spin=0.03&glow=0.9
```

### 程序化生成链接 | Programmatic Link Generation

```javascript
// 构建深度链接
function buildDeepLink(options) {
  const params = new URLSearchParams();
  Object.entries(options).forEach(([key, value]) => {
    params.set(key, String(value));
  });
  return `${window.location.origin}${window.location.pathname}#${params}`;
}

// 使用
const link = buildDeepLink({
  node: 'hodge-conjecture',
  shape: 'spiral',
  view: 'panorama',
  color: 'family'
});

console.log('Share this link:', link);
```

---

## 集成示例 | Integration Examples

### 嵌入到网页 | Embed in a Web Page

```html
<!DOCTYPE html>
<html>
<head>
  <title>My Math Portal</title>
  <style>
    #nebula-container {
      width: 100%;
      height: 600px;
      border: 1px solid #ccc;
    }
  </style>
</head>
<body>
  <div id="nebula-container">
    <!-- Formula Nebula iframe -->
    <iframe 
      src="https://your-nebula-instance.com/#view=galaxy"
      width="100%" 
      height="100%"
      frameborder="0">
    </iframe>
  </div>

  <script>
    // 通过 postMessage 与 iframe 通信
    const iframe = document.querySelector('iframe');
    
    // 发送命令
    function sendCommand(command, data) {
      iframe.contentWindow.postMessage({
        type: 'nebula:command',
        command,
        data
      }, '*');
    }

    // 聚焦节点
    document.getElementById('focusBtn').addEventListener('click', () => {
      sendCommand('focusNode', { nodeId: 'hodge-conjecture' });
    });
  </script>
</body>
</html>
```

### 自定义主题 | Custom Theme

```javascript
// 自定义颜色方案
const customTheme = {
  background: '#0a0a0a',
  primary: '#ff6b35',
  secondary: '#004e89',
  accent: '#f77f00',
};

// 通过 CSS 变量应用
Object.entries(customTheme).forEach(([key, value]) => {
  document.documentElement.style.setProperty(`--color-${key}`, value);
});
```

### React 集成 | React Integration

```jsx
import { useEffect, useRef, useState } from 'react';

function FormulaNebulaViewer() {
  const containerRef = useRef(null);
  const [api, setApi] = useState(null);

  useEffect(() => {
    // 等待 API 初始化
    const checkApi = setInterval(() => {
      if (window.formulaNebula) {
        setApi(window.formulaNebula);
        clearInterval(checkApi);
      }
    }, 100);

    return () => clearInterval(checkApi);
  }, []);

  const focusRandom = () => {
    if (!api) return;
    const nodes = api.getNodes();
    const random = nodes[Math.floor(Math.random() * nodes.length)];
    api.focusNode(random.id);
  };

  return (
    <div>
      <div ref={containerRef} id="nebula-root" />
      <button onClick={focusRandom}>Random Node</button>
    </div>
  );
}
```

---

## 类型定义 | Type Definitions

完整的 TypeScript 类型定义可在 `src/types/index.d.ts` 找到。

Full TypeScript type definitions are available in `src/types/index.d.ts`.

```typescript
import type {
  FormulaNode,
  FormulaLink,
  Settings,
  PerformanceMetrics
} from './src/types';
```

---

## 浏览器兼容性 | Browser Compatibility

| Browser | Minimum Version |
|---------|----------------|
| Chrome | 90+ |
| Firefox | 88+ |
| Safari | 14+ |
| Edge | 90+ |

**Required Features:**
- WebGL 2.0
- ES2020+
- CSS Grid
- Custom Elements (optional)

---

## 性能建议 | Performance Tips

1. **减少同时显示的连线**
   ```javascript
   api.updateSettings({ display: { links: 'focus' } });
   ```

2. **关闭不需要的后处理**
   ```javascript
   api.updateSettings({ display: { bloom: false } });
   ```

3. **降低自转速度**
   ```javascript
   api.updateSettings({ params: { spinRate: 0.01 } });
   ```

4. **监控性能**
   ```javascript
   setInterval(() => {
     const { fps, memory } = api.perfMonitor.getMetrics();
     if (fps < 30) console.warn('Low FPS detected');
   }, 1000);
   ```

---

## 故障排除 | Troubleshooting

### API 不可用 | API Not Available

```javascript
// 等待 API 初始化
function waitForApi() {
  return new Promise((resolve) => {
    if (window.formulaNebula) {
      resolve(window.formulaNebula);
    } else {
      window.addEventListener('nebula:ready', () => {
        resolve(window.formulaNebula);
      });
    }
  });
}

// 使用
const api = await waitForApi();
```

### WebGL 不支持 | WebGL Not Supported

```javascript
function checkWebGL() {
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl2');
  return !!gl;
}

if (!checkWebGL()) {
  alert('Your browser does not support WebGL 2.0');
}
```

---

## 更多资源 | More Resources

- [GitHub Repository](https://github.com/wenze-wu-math/Formula-Nebula)
- [Live Demo](https://your-demo-link.com)
- [Issue Tracker](https://github.com/wenze-wu-math/Formula-Nebula/issues)
- [Discussions](https://github.com/wenze-wu-math/Formula-Nebula/discussions)

---

**Last Updated**: 2026-11-03  
**Version**: 0.1.1
