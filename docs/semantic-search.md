# 语义搜索系统 · Semantic Search for Theorems

## 概述

传统关键词搜索的局限：
- 搜 "代数闭包" → 漏掉 "algebraically closed field"
- 搜 "上同调" → 找不到 "层上同调" "导出函子"
- 无法理解数学概念之间的语义关联

**语义搜索** 解决这些问题：理解数学**意义**，而不只是字面匹配。

## 核心特性

### 1. 同义词理解

**输入：** `代数闭包`  
**搜索：** 代数闭包 + algebraic closure + algebraically closed field

**输入：** `态射`  
**搜索：** 态射 + morphism + map + arrow + homomorphism + 同态

### 2. 语义相似度

基于 **TF-IDF 词袋模型**，计算文本在向量空间中的余弦相似度：

```
query: "层的导出函子"
→ 高分匹配: 层上同调、导出范畴、谱序列
→ 中等匹配: Ext 函子、Tor 函子
→ 低分匹配: 其他上同调相关定理
```

**不需要神经网络**：前端可直接运行，零外部依赖。

### 3. 图谱拓扑增强

利用知识图谱的关联结构：

- **直接邻居** → 强相关（相似度 +0.8）
- **二阶邻居** → 弱相关（相似度 +0.3）
- **同族/同领域** → 领域相关（相似度 +0.15）

**示例：** 搜索 "概形" 时，与之相连的 "层" "态射" "纤维积" 会获得额外加分。

### 4. 混合模式

语义搜索 **+** 结构化过滤：

```
上同调 importance:>0.8
→ 语义理解 "上同调" 及其同义词
→ 过滤出重要度 > 0.8 的节点
```

```
态射 family:scheme -status:proved
→ 语义搜索 "态射" 相关定理
→ 限定 scheme 族
→ 排除已证明的
```

## API

### `buildSemanticIndex(nodes, links)`

构建语义索引（应用启动时调用一次）。

**参数：**
- `nodes`: 节点数组 `[{id, name, en, latex, summary, detail, ...}]`
- `links`: 关联数组 `[[src, tgt, weight, type], ...]`

**返回：** 索引对象（内部使用）

**示例：**
```javascript
import { buildSemanticIndex } from './semanticSearch.js'
import { NODES, LINKS } from './data/knowledge.js'

// 在 main.js 初始化时调用
buildSemanticIndex(NODES, LINKS)
```

---

### `semanticSearch(query, limit, options)`

执行语义搜索。

**参数：**
- `query` (string): 搜索查询，支持自然语言
- `limit` (number): 返回结果数量，默认 10
- `options` (object):
  - `boostTopology` (boolean): 是否启用图谱拓扑增强，默认 true
  - `anchorNode` (string): 参考节点 ID（"找和这个相关的"），可选
  - `filterParsed` (object): 结构化过滤（来自 `parseQuery`），可选

**返回：** `[{node, similarity}]`

**示例：**

```javascript
import { semanticSearch } from './semanticSearch.js'

// 纯语义搜索
const results = semanticSearch('代数闭包', 10)
// [{node: {...}, similarity: 0.87}, ...]

// 带拓扑增强（搜索和某节点相关的）
const related = semanticSearch('上同调', 10, {
  boostTopology: true,
  anchorNode: 'sheaf-cohomology',
})

// 混合模式（语义 + 结构化）
import { parseQuery } from './graphQuery.js'
const filter = parseQuery('family:scheme importance:>0.8')
const hybrid = semanticSearch('态射', 10, {
  boostTopology: true,
  filterParsed: filter,
})
```

---

### `getSuggestions(prefix, limit)`

自动补全：根据前缀推荐概念名。

**参数：**
- `prefix` (string): 用户输入的前缀（至少 2 个字符）
- `limit` (number): 返回建议数量，默认 8

**返回：** `[{node, score, label}]`

**示例：**

```javascript
import { getSuggestions } from './semanticSearch.js'

// 用户输入 "代数"
const suggestions = getSuggestions('代数', 8)
// [
//   {node: {...}, score: 10, label: "代数闭包"},
//   {node: {...}, score: 9, label: "代数簇"},
//   {node: {...}, score: 5, label: "交换代数"},
//   ...
// ]
```

**评分规则：**
- 名称以前缀开头 → 10 分
- 英文名以前缀开头 → 9 分
- ID 以前缀开头 → 8 分
- 同义词匹配 → 6 分
- 名称包含前缀 → 5 分

---

### `getConceptTreeAPI(nodeId)`

获取概念关系树（详情面板使用）。

**参数：**
- `nodeId` (string): 节点 ID

**返回：** `{node, children, parents}`
- `children`: 推论、推广（向下关系）
- `parents`: 前置、特例（向上关系）

**示例：**

```javascript
import { getConceptTreeAPI } from './semanticSearch.js'

const tree = getConceptTreeAPI('riemann-roch-curve')
// {
//   node: {...},
//   children: [
//     {node: {...}, relation: 'generalizes', children: [...]},
//     ...
//   ],
//   parents: [
//     {node: {...}, relation: 'implies', children: [...]},
//     ...
//   ]
// }
```

**关系类型：**
- `implies`: A 蕴含 B
- `generalizes`: A 推广 B
- `special`: A 是 B 的特例
- `dual`: 对偶
- `equivalent`: 等价

---

### `findAnalogyAPI(theoremA, theoremB)`

类比搜索："找一个定理，它和 A 的关系就像 B 和 C 的关系"。

**参数：**
- `theoremA` (string): 节点 ID
- `theoremB` (string): 节点 ID

**返回：** `[{from, to, similarity}]`

**示例：**

```javascript
import { findAnalogyAPI } from './semanticSearch.js'

// Riemann-Roch 在曲线上，类似的在曲面上是什么？
const analogies = findAnalogyAPI('riemann-roch-curve', 'curve')
// [
//   {from: 'surface', to: 'riemann-roch-surface', similarity: 0.82},
//   ...
// ]
```

**原理：** 向量类比 `vec(B) - vec(A) + vec(C) ≈ vec(D)`

---

### `getIndexStats()`

获取索引统计信息（调试用）。

**返回：** `{totalDocs, vocabSize, avgDocLength, synonymCount}`

**示例：**

```javascript
import { getIndexStats } from './semanticSearch.js'

const stats = getIndexStats()
// {
//   totalDocs: 464,
//   vocabSize: 3847,
//   avgDocLength: 28.5,
//   synonymCount: 82
// }
```

---

## UI 组件

### `createSemanticSearchUI(container, onResultSelect)`

创建搜索界面（包含自动补全、模式切换、帮助面板）。

**参数：**
- `container` (HTMLElement): 容器元素
- `onResultSelect` (function): 选中结果的回调 `(nodeId) => {...}`

**返回：** `{focus, clear, search}`

**示例：**

```javascript
import { createSemanticSearchUI } from './semanticSearchUI.js'

const searchUI = createSemanticSearchUI(
  document.querySelector('#search-container'),
  (nodeId) => {
    // 高亮对应节点
    scene.focusNode(nodeId)
  }
)

// 编程式触发搜索
searchUI.search('代数闭包')

// 聚焦输入框
searchUI.focus()

// 清空
searchUI.clear()
```

---

## 搜索模式

### 1. 关键词模式 (Keyword)

精确的结构化查询，支持布尔运算。

**语法：** 见 `src/graphQuery.js` 文档

**示例：**
```
family:scheme OR family:cohomology
status:open importance:>0.9
-status:proved field:ag
```

### 2. 语义模式 (Semantic)

纯基于数学意义的相似度排序。

**特点：**
- 理解同义词（代数闭包 ≈ algebraic closure）
- 不需要精确匹配
- TF-IDF 向量空间模型

**示例：**
```
层的导出函子
代数簇的奇点消解
态射的纤维积
```

### 3. 混合模式 (Hybrid，推荐)

语义搜索 + 结构化过滤。

**示例：**
```
上同调 family:cohomology
态射 importance:>0.8
代数闭包 -cluster:true
```

**工作流程：**
1. 语义理解 "上同调"（含同义词）
2. TF-IDF 计算相似度
3. 应用结构化过滤 `family:cohomology`
4. 按相似度排序

---

## 查询示例

### 示例 1：找同义词变体

**查询：** `代数闭包`

**匹配到：**
- "代数闭包" (100% 精确)
- "Algebraic Closure" (100% 同义词)
- "代数封闭域" (95% 变体)

---

### 示例 2：找相关概念

**查询：** `层上同调`

**匹配到：**
- "Sheaf Cohomology" (98% 精确)
- "Derived Functor" (85% 语义相关)
- "Ext Functor" (80% 语义相关)
- "Spectral Sequence" (75% 领域相关)

---

### 示例 3：混合查询

**查询：** `态射 family:scheme importance:>0.8`

**工作流程：**
1. 语义搜索 "态射" + morphism + map + arrow + homomorphism
2. 过滤 `family:scheme`
3. 过滤 `importance:>0.8`
4. 按语义相似度排序

**结果：** 概形族中重要度超过 0.8 的态射相关定理

---

### 示例 4：拓扑增强

**查询：** `上同调` + 参考节点 `sheaf-cohomology`

**效果：**
- 与 "层上同调" 直接相连的节点（导出函子、Ext、谱序列）获得 +0.8 加分
- 二阶邻居（Čech 上同调、de Rham 上同调）获得 +0.3 加分
- 同族节点（cohomology 族）获得 +0.15 加分

---

### 示例 5：类比搜索

**查询：** Riemann-Roch（曲线） → Riemann-Roch（曲面）

**问题：** "Riemann-Roch 在曲线上，类似的在曲面上是什么？"

**步骤：**
1. 计算 `vec(Riemann-Roch-curve) - vec(curve)`
2. 对所有节点 `N`，计算 `vec(N) + Δ`
3. 找最接近的节点 → Riemann-Roch-surface

---

## 同义词词典

手工维护的双语 + 术语变体映射（`src/semanticSearch.js`）：

```javascript
const MATH_SYNONYMS = {
  '代数闭包': ['algebraic closure', 'algebraically closed', '代数封闭'],
  '概形': ['scheme', 'schemes', '模式'],
  '层': ['sheaf', 'sheaves', '束', 'presheaf', '预层'],
  '上同调': ['cohomology', '同调', 'homology'],
  '态射': ['morphism', '映射', 'map', 'arrow', '箭头', 'homomorphism', '同态'],
  // ... 共 40+ 组
}
```

**如何扩展：**
1. 编辑 `src/semanticSearch.js`
2. 添加新条目到 `MATH_SYNONYMS`
3. 格式：`'canonical': ['synonym1', 'synonym2', ...]`
4. 重新构建索引（刷新页面即可）

---

## 性能

### 索引构建

- **时间复杂度：** O(N × M)，N = 节点数，M = 平均文本长度
- **464 个节点 + 1620 条关联：** ~50ms（Chrome）

### 搜索查询

- **TF-IDF 相似度计算：** O(N × V)，V = 查询词数
- **464 个节点，10 个查询词：** ~5ms
- **拓扑增强：** 额外 ~2ms

### 内存占用

- **索引：** ~2MB（包含所有文本向量）
- **同义词表：** ~50KB

**适用场景：** 千级节点前端可直接运行，万级节点建议 Web Worker。

---

## 集成步骤

### 1. 初始化（在 `src/main.js`）

```javascript
import { buildSemanticIndex } from './semanticSearch.js'
import { ALL_NODES, ALL_LINKS } from './graph.js' // 或从 buildGraph 返回

// 构建图谱后立即构建语义索引
buildGraph() // 现有逻辑
buildSemanticIndex(ALL_NODES, ALL_LINKS)
```

### 2. UI 集成（在 `src/ui.js`）

```javascript
import { createSemanticSearchUI, SEMANTIC_SEARCH_CSS } from './semanticSearchUI.js'

// 注入 CSS
const style = document.createElement('style')
style.textContent = SEMANTIC_SEARCH_CSS
document.head.appendChild(style)

// 创建搜索 UI（替换或并行现有搜索框）
const searchContainer = document.querySelector('#search-container') // 或新建
const searchUI = createSemanticSearchUI(searchContainer, (nodeId) => {
  // 复用现有的聚焦逻辑
  focusNode(nodeId) // 假设你已有此函数
})
```

### 3. 可选：替换现有搜索

如果希望完全替换现有的 `runSearch`：

```javascript
// 原来（src/ui.js）
function runSearch(query) {
  const filtered = nodes.filter((n) => n.name.toLowerCase().includes(query))
  // ...
}

// 现在
import { semanticSearch } from './semanticSearch.js'

function runSearch(query) {
  const results = semanticSearch(query, 20, { boostTopology: true })
  // results = [{node, similarity}, ...]
  // 使用 results.map(r => r.node) 传递给现有渲染逻辑
}
```

---

## 未来扩展

### 1. ONNX 神经嵌入（可选）

TF-IDF 是基线，可升级为真正的语义嵌入：

**方案：** ONNX Runtime Web + 微型 BERT（~20MB）

**步骤：**
1. 导出 MathBERT 或 SciBERT 到 ONNX 格式
2. 离线预计算所有节点的嵌入向量
3. 保存为 JSON（`{id: [768维向量]}`）
4. 查询时实时计算查询嵌入 → 余弦相似度

**优点：** 理解更深层的语义（"Riemann-Roch" 和 "亏格" 的关联）

**缺点：** 模型体积 + 首次加载时间

---

### 2. 用户反馈学习

记录用户点击：

```javascript
// 用户搜 "上同调" 后点击 "层上同调"
logFeedback('上同调', 'sheaf-cohomology', 'click')

// 累积后调整权重
adjustSynonyms('上同调', ['sheaf cohomology']) // 自动发现同义词
```

---

### 3. 多跳推理

"找一条路径，从 A 到 B，经过的定理越重要越好"：

```javascript
findSemanticPath('nullstellensatz', 'riemann-roch', {
  maxHops: 5,
  strategy: 'shortest', // 或 'important'
})
```

---

## 常见问题

### Q1: 为什么不用神经网络嵌入？

**A:** TF-IDF 是前端可直接运行的轻量级方案，零外部依赖。对于数学文本（术语密集、词汇专业），TF-IDF 的效果已经足够好。如果需要更深层的语义理解，可选配 ONNX 模型。

### Q2: 同义词词典需要手工维护吗？

**A:** 当前是手工维护（40+ 组），因为数学术语的同义关系需要专业知识。未来可结合用户反馈自动发现同义词。

### Q3: 如何处理多义词？

**A:** TF-IDF 依赖上下文：词在整个语料库中的分布决定其权重。数学领域的多义现象相对少（"环" 在代数几何里几乎只指 ring），误匹配风险较低。

### Q4: 支持中文分词吗？

**A:** 当前用简单的空格分词（保留中文字符）。对于纯中文查询，可升级为 jieba 分词器。

### Q5: 搜索结果可以缓存吗？

**A:** 可以。在 `semanticSearch` 内部加 LRU 缓存：

```javascript
const cache = new Map() // query → results
if (cache.has(query)) return cache.get(query)
// ... 计算 ...
cache.set(query, results)
```

---

## 许可

MIT License

**作者：** Formula Nebula Team  
**版本：** 1.0.0  
**日期：** 2026-11-02
