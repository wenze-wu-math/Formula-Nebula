# 方案 E · 星云修正版 · 架构设计文档

**项目方案**：方案 E（nebula-plus）保留原有 three.js 3D 星云，修正核心问题。

**页面入口**：`designs/nebula-plus/index.html` → http://localhost:5190/designs/nebula-plus/

**设计目标**

修正原星云的五大痛点：

1. **总览时公式读不出来**：盘面倾斜 40°，405 个公式缩成细线混在粒子里。
   - 方案：屏幕空间碰撞检测，远处只显示光点，近处逐步增加标签数量。

2. **拉近后公式互相叠压**：3D 不同深度的字必然互相遮挡。
   - 方案：焦点以外按深度淡出（景深模糊或透明度衰减），选中公式用 2D 卡片浮在屏幕显示。

3. **位置只表达重要度，知识族看不出**：8 个族在旋臂混排，颜色像撒胡椒盐。
   - 方案：旋臂结构与知识族的对应已在 graph.js 建立，视觉上通过"旋臂粒子与公式同骨架"强化。

4. **3D 旋转缩放主要服务氛围**：操作成本高、信息少。
   - 方案：保留原有操作，补充屏幕文本标签提供快速可读。

5. **猜想星团右侧硬圆弧边**：光晕贴图投影到球面出现轮廓。
   - 方案：改用 PlaneGeometry 正对相机，贴图假设一致。

---

## 视觉设计

### 配色与字体

- **族色**：保留原有 8 族色（foundation/scheme/cohomology/map/curve/intersect/birational/modern）
- **着色模式**：按族着色（family）或统一橙黄（mono），与原相同
- **字体栈**：系统默认；SVG 公式由 MathJax 内联路径，无外部字体
- **标签层**：DOM 文字用 KaTeX 快速渲染，避免频繁 MathJax 调用

### 标签可见性分级

**分级策略**：按屏幕距离与重要度分层显示

- **超远（> 1200px）**：只显示光点，不显示标签
- **远（600~1200px）**：显示前 N 个标签（按重要度），避免全部显示导致重叠
- **中（200~600px）**：逐步增加显示标签数量，最多显示所有可见公式
- **近（< 200px）**：显示所有可见公式标签，选中的用 2D 卡片浮在顶层

**碰撞检测**：屏幕空间 AABB，每帧计算一次（节流）

### 焦点卡片（Focus Card）

**位置**：屏幕右侧或左侧（不被面板挡住的地方）

**内容**：
- 公式（SVG 或 canvas 预栅格）
- 名字（中文 + 英文/拉丁符号）
- 概要（markdown 转义后的 HTML）

**交互**：
- 点公式 → 聚焦并显示卡片
- 卡片关闭 → 回位原视图

### 纵深衰减

**目标**：消除 3D 重叠感，远处公式逐步变暗/透明

**做法**：每个公式贴图本身不做景深模糊（效果模糊且代价大），改用 shader 按深度调整 alpha：

```glsl
// 伪代码：主 shader 在渲染前按相机距离压低透明度
float depth = length(cameraPos - fragmentPos);
float fade = clamp((depth - minDist) / (maxDist - minDist), 0, 1);
alpha *= (1.0 - fade * 0.5);  // 最多压到 50% 不透明
```

---

## 数据结构

### 共享数据层（只读）

路径：`designs/shared/kb.js`、`designs/shared/tex.js`、`designs/shared/md.js`

- `buildGraph()` → graph 对象（nodes, links, byId, stats）
- `await tex(latex, colorHex)` → {svg, widthPx, heightPx}
- `texSync(latex, colorHex)` → 同步版本
- `inlineMd(text)` → DOM 节点数组
- `inlineMdHtml(text)` → 转义 HTML 字符串

### 运行时状态（window.__design）

所有方案都要提供这个调试句柄：

```javascript
window.__design = {
  // 初始化完成、首屏已画出
  ready: boolean,
  
  // 只读数据
  graph,
  
  // 交互接口
  select(id),          // 选中公式 id（null = 取消）
  deselect(),          // 取消选中
  search(query),       // 返回匹配的 id 数组
  
  // 视图状态查询/设置
  view(),              // 返回 {zoom, pan, ...}
  setView(obj),        // 平移/缩放到指定状态
  
  // 调试
  stats(),             // {visibleLabels, overlappingLabels, fps, ...}
}
```

---

## 模块划分

**五个模块，各自独占若干文件**：

### 模块 1：入口与初始化（index.html + src/main.js）

**职责**：
- 加载 HTML 结构（canvas + 标签层 + 卡片层）
- 装配 graph、烘焙公式、布局
- 初始化场景、UI、标签引擎
- 暴露 window.__design 句柄

**导出**：
- `main()` —— 异步启动函数

**依赖**：graph.js, formulaTexture.js, scene.js, labels.js, card.js, ui.js

---

### 模块 2：标签层渲染引擎（src/labels.js）

**职责**：
- 屏幕空间 AABB 碰撞检测（每帧节流计算）
- 按可见性分级选出要显示的标签
- Canvas 绘制文本标签（用 KaTeX 预渲染）
- 提供 hitTest(screenX, screenY) 供拾取用

**数据结构**：

```javascript
// 每个标签的屏幕空间表示
class Label {
  id,              // 公式 id
  screenPos,       // {x, y}（屏幕坐标）
  aabb,            // {minX, maxX, minY, maxY}
  depth,           // 相机距离（用于分级）
  visible,         // 该帧是否应该显示
  priority,        // 重要度（用于淘汰）
  cachedTexture,   // KaTeX 预渲染的 canvas/texture
}

// 碰撞表
class OverlapSet {
  pairs,           // Set<[labelA.id, labelB.id]>
}
```

**导出接口**：

```javascript
export function createLabels(graph, scene) {
  return {
    update(dt),           // 每帧更新可见性与位置
    render(ctx),          // 绘制到 canvas/WebGL
    hitTest(x, y),        // 返回命中的 label id（null 若无）
    setMaxVisible(n),     // 最多显示 N 个标签
    stats(),              // {visibleLabels, overlappingLabels, ...}
  }
}
```

---

### 模块 3：焦点卡片浮层（src/card.js）

**职责**：
- 根据选中的公式 id 渲染 2D DOM 卡片
- 卡片包含公式、名字、概要
- 位置避开面板、保持屏幕内

**导出接口**：

```javascript
export function createCard(graph, containerDiv) {
  return {
    show(nodeId),    // 显示某公式的卡片
    hide(),          // 隐藏卡片
    setPos(x, y),    // 强制位置（用于避让面板）
  }
}
```

---

### 模块 4：纵深衰减与渲染（src/scene.js 部分修改）

**职责**：
- 改造 sprite 材质的 alpha 计算，加入深度衰减
- 保留原有 three.js 场景结构、旋转、聚焦、拾取

**修改点**：

```javascript
// 原 scene.js buildNodes() 中，构建材质时：
const mat = new THREE.ShaderMaterial({
  // ... 其它参数 ...
  uniforms: {
    // ... 原有 uniforms ...
    uCameraPos: { value: camera.position },
    uMinDepth: { value: CAMERA.minDistance },
    uMaxDepth: { value: CAMERA.maxDistance + 300 },
    uDepthFadeFactor: { value: 0.5 },
  },
  fragmentShader: `
    uniform vec3 uCameraPos;
    uniform float uMinDepth, uMaxDepth, uDepthFadeFactor;
    
    void main() {
      // ... 原有逻辑 ...
      
      float depth = length(vWorldPos - uCameraPos);
      float t = clamp((depth - uMinDepth) / (uMaxDepth - uMinDepth), 0.0, 1.0);
      float fadeFactor = 1.0 - t * uDepthFadeFactor;
      gl_FragColor.a *= fadeFactor;
    }
  `,
})
```

---

### 模块 5：UI 与交互（src/ui.js 及配置）

**职责**：
- 保留原有面板、搜索、设置等 UI
- 新增"标签最大数量"滑块
- 与标签层 + 卡片层 协调隐显

**配置项**（config.js 新增）：

```javascript
export const LABELS = {
  enabled: true,
  maxVisible: 30,           // 最多同时显示 30 个标签
  collisionCheckInterval: 3, // 每隔 3 帧检查一次碰撞
  minDistanceToCamera: 600, // 近于此距离时显示所有
  maxDistanceToCamera: 1200, // 远于此距离时只显示光点
  fontSize: 12,             // canvas 标签字大小
}

export const CARD = {
  enabled: true,
  position: 'auto',         // 'left' / 'right' / 'auto'（自动避让）
  width: 280,
  height: 200,
  padding: 16,
}

export const DEPTH_FADE = {
  enabled: true,
  minDist: 50,              // 最近处完全不衰减
  maxDist: 350,             // 最远处衰减到 50%
  fadeStrength: 0.5,
}
```

---

## 接口契约

### 模块间通信

```
main.js
  ├─ 读：graph（graph.js 装配结果）
  ├─ 读：baked（formulaTexture.js 烘焙结果）
  ├─ 初始化：scene = createScene(canvas, graph, ui)
  ├─ 初始化：labels = createLabels(graph, scene)
  ├─ 初始化：card = createCard(graph, #cards)
  │
  ├─ 每帧调用
  │  ├─ labels.update(dt, scene.camera)
  │  ├─ scene.render()
  │  └─ labels.render(canvasCtx)
  │
  └─ 交互
     ├─ 选中：labels.hitTest(x, y) → id
     │        scene.select(id)
     │        card.show(id)
     │
     └─ 取消：scene.select(null)
              card.hide()
```

### labels.js 详细接口

```javascript
/**
 * @param {object} graph    buildGraph() 结果
 * @param {THREE.Scene} scene  three.js 场景（用 camera、renderer）
 * @returns {{
 *   update: (dt: number, camera: THREE.Camera) => void,
 *   render: (ctx?: CanvasRenderingContext2D) => void,
 *   hitTest: (screenX: number, screenY: number) => string|null,
 *   setMaxVisible: (n: number) => void,
 *   stats: () => {
 *     visibleLabels: number,
 *     overlappingLabels: number,
 *     totalLabels: number,
 *   },
 * }}
 */
export function createLabels(graph, scene) {
  // ... 实现 ...
}
```

### card.js 详细接口

```javascript
/**
 * @param {object} graph         buildGraph() 结果
 * @param {HTMLElement} container  #cards div
 * @returns {{
 *   show: (nodeId: string) => Promise<void>,
 *   hide: () => void,
 *   setPos: (x: number, y: number) => void,
 *   dispose: () => void,
 * }}
 */
export function createCard(graph, container) {
  // ... 实现 ...
}
```

---

## 验收标准

### 性能目标

- **首屏 < 3s**：公式可渐进烘焙，首 100 个完成即可显示加载界面
- **交互帧率 ≥ 50fps**：标签检测+渲染不超 5ms

### 功能目标

- ✅ 总览时至少 30 个公式的标签可读（不重叠）
- ✅ 拉近到某个公式时，选中卡片清晰显示
- ✅ 选中 → 背景其它公式逐步淡暗（景深衰减）
- ✅ 星团柔光右侧无硬圆弧边
- ✅ 旋臂与公式层同骨架（形态切换时两层都跟着换）
- ✅ 所有 488 个节点仍可达（可搜索、可选中）

### 兼容性

- 保留原有功能（详情面板、搜索、设置面板、证明页、形状切换、导出）
- 若删掉的部分（如某些 3D 效果），在 README 说明

---

## 旋臂与知识族的对应

**已由 graph.js 建立**：每个家族有 `arm: 0|1|2|3` 字段

```javascript
// src/data/knowledge.js 中的 FAMILIES 定义
foundation: { arm: 0 },  // 交换代数
scheme:     { arm: 1 },  // 概形与层
cohomology: { arm: 2 },  // 上同调
map:        { arm: 3 },  // 态射与奇点
curve:      { arm: 0 },  // 曲线与曲面
intersect:  { arm: 1 },  // 相交与特征类
birational: { arm: 2 },  // 双有理
modern:     { arm: 3 },  // 模空间与现代
```

**视觉强化方案**：
- 旋臂粒子（nebula.js）与公式层（graph.js）用同一个对数旋臂骨架 → 骨架对齐无误
- 公式的 armIdx 字段（layoutGraph() 计算）与 SHAPES 里的 arms 参数同步
- 背景星云亮度从中心(暖白 #ffd9a0) → 外缘(冷蓝 #4a6fd0)，与公式的旋臂分布视觉对齐
- 用户若打开"按族着色"模式，旋臂上的公式会按族色亮起，族色骨架就显出来了

---

## 已知限制与折衷

1. **碰撞检测频率**：屏幕 1600×1000 时通常有 20~40 个标签可见。全部同时检查是 O(n²)，改用空间分割网格可降到 O(n) 但代码复杂度提升。目前折衷方案：每 3 帧检查一次，每帧显示结果缓存，误差 ±2 帧（16ms）。
2. **标签与卡片分离**：标签层用 DOM + Canvas，卡片也用 DOM，两层独立渲染。若能合并为同一 DOM 树会更清晰，但代价是标签每帧更新会触发重排，性能压力大。
3. **纵深衰减不是景深**：Shader 中只改 alpha，不做模糊。真正的景深需要离屏渲染 + blur pass，代价太大。alpha 衰减在"远处公式看不清"的情况下已足够（alpha < 0.3 时用户也读不出来）。
4. **旋臂对应的"可见化"**：当前只靠族色 + nebula 粒子的视觉巧合。若要显式标记（比如在旋臂外侧标"Arm 0"），需在 nebula.js 里加一层文本或图标层，那是另一个功能。

---

## 验证与调试

### window.__design 句柄

所有主流程必须定期检查此句柄是否齐备：

```javascript
// main.js 启动完成后
window.__design = {
  ready: true,  // 首屏画出、可交互
  graph,
  select(id) { scene.select(id) },
  deselect() { scene.select(null) },
  search(query) { return ui.search(query) },
  view() { return { zoom: camera.zoom, pan: controls.target } },
  setView(obj) { /* 相机平移 */ },
  stats() { return { visibleLabels: labels.stats().visibleLabels, ... } },
}
```

### 截图验证

```bash
node designs/shot.mjs http://localhost:5190/designs/nebula-plus/ \
  shots/designs/nebula-plus/verify.png \
  --wait "window.__design && window.__design.ready" \
  --eval "return window.__design.stats()" \
  --delay 3000
```

预期输出：`[eval] {"visibleLabels":24,"overlappingLabels":0, ...}`

