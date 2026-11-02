# 07 · 开发者 API (15 分钟)

## 元信息

- **视频时长**：15 分钟
- **目标观众**：开发者，想集成公式诗云的技术用户
- **学习目标**：
  - 掌握 REST API 的基本使用
  - 了解 SDK 的安装与调用
  - 学会嵌入可视化组件
  - 掌握 WebSocket 实时协作 API
- **前置要求**：基本编程知识（JavaScript/Python）
- **录制版本**：v2.0+

---

## 时间轴

| 时间 | 内容 |
|------|------|
| 0:00-1:00 | API 概览与认证 |
| 1:00-3:00 | REST API：查询定理与证明 |
| 3:00-5:00 | 知识图谱查询与寻路 |
| 5:00-7:00 | SDK 使用（TypeScript/Python） |
| 7:00-9:00 | 嵌入可视化组件 |
| 9:00-11:00 | WebSocket 实时协作 |
| 11:00-13:00 | AI 服务 API |
| 13:00-14:30 | 速率限制与最佳实践 |
| 14:30-15:00 | 总结与资源链接 |

---

## 脚本内容

### [0:00-1:00] API 概览与认证

**画面**：代码编辑器 + API 文档页面

**讲解词**：
```
公式诗云提供完整的 REST API，
让你可以在自己的项目中：
- 查询定理和证明
- 遍历知识图谱
- 生成证明步骤
- 识别手写公式
- 创建实时协作会话

API 地址：`https://api.formula-nebula.com`

[认证]
大部分读取操作不需要认证。
写入操作（创建证明、标注等）需要 JWT token。

获取 token：
```bash
curl -X POST https://api.formula-nebula.com/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "dev@example.com",
    "username": "devuser",
    "password": "securepass123"
  }'
```

返回：
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_abc123",
    "username": "devuser"
  }
}
```

之后在请求头带上：
```
Authorization: Bearer YOUR_TOKEN
```
```

**操作提示**：
- 0:00-0:30：显示 API 文档首页（30 秒）
- 0:30-1:00：演示注册 + 获取 token（30 秒）

---

### [1:00-3:00] REST API：查询定理与证明

**画面**：终端 + curl 命令

**讲解词**：
```
[查询定理列表]
```bash
curl https://api.formula-nebula.com/api/theorems
```

返回 405 条定理的元数据：
```json
{
  "theorems": [
    {
      "id": "scheme",
      "name": "概形",
      "en": "Scheme",
      "importance": 0.98,
      "family": "scheme",
      "summary": "代数几何的基本对象..."
    },
    ...
  ],
  "total": 405
}
```

[过滤查询]
```bash
# 只列概形论的定理
curl "https://api.formula-nebula.com/api/theorems?family=scheme"

# 只列重要度 > 0.9 的
curl "https://api.formula-nebula.com/api/theorems?importance_min=0.9"

# 组合条件
curl "https://api.formula-nebula.com/api/theorems?family=scheme&importance_min=0.8"
```

[获取单个定理]
```bash
curl https://api.formula-nebula.com/api/theorems/riemann-roch
```

返回完整信息，包括 LaTeX、概述、关联。

[获取证明]
```bash
curl https://api.formula-nebula.com/api/proofs/riemann-roch
```

返回：
```json
{
  "id": "riemann-roch",
  "statement": "...",
  "proof": {
    "outline": "证明思路...",
    "steps": [
      {
        "step": 1,
        "content": "首先证明层的上同调...",
        "dependencies": ["cohomology", "sheaf"]
      },
      ...
    ]
  },
  "prerequisites": ["divisor", "line-bundle"]
}
```

[查询相关定理]
```bash
curl https://api.formula-nebula.com/api/theorems/scheme/related
```

返回与"概形"直接关联的定理列表，
包括关联类型和理由。
```

**操作提示**：
- 1:00-1:30：演示列表查询（30 秒）
- 1:30-2:00：演示过滤查询（30 秒）
- 2:00-2:30：演示获取单个定理（30 秒）
- 2:30-3:00：演示获取证明（30 秒）

---

### [3:00-5:00] 知识图谱查询与寻路

**画面**：代码编辑器 + Postman/Insomnia

**讲解词**：
```
[图谱查询]
```bash
curl -X POST https://api.formula-nebula.com/api/graphs/query \
  -H "Content-Type: application/json" \
  -d '{
    "start": "scheme",
    "depth": 2,
    "filter": {
      "importance_min": 0.7
    }
  }'
```

返回从"概形"出发、深度 2 的子图：
```json
{
  "nodes": [
    {"id": "scheme", "name": "概形", ...},
    {"id": "morphism", "name": "态射", ...},
    {"id": "sheaf", "name": "层", ...}
  ],
  "edges": [
    {
      "from": "scheme",
      "to": "morphism",
      "type": "defines",
      "weight": 0.9,
      "reason": "概形之间的态射定义了结构保持映射"
    },
    ...
  ]
}
```

[最短路径]
```bash
curl -X POST https://api.formula-nebula.com/api/graphs/shortest-path \
  -H "Content-Type: application/json" \
  -d '{
    "from": "hodge-conjecture",
    "to": "riemann-hypothesis",
    "weighted": true
  }'
```

返回：
```json
{
  "path": [
    "hodge-conjecture",
    "cohomology",
    "weil-conjectures",
    "zeta-function",
    "riemann-hypothesis"
  ],
  "hops": 4,
  "cost": 0.82,
  "weighted": true
}
```

`weighted: true` 优先强关联，
`weighted: false` 优先最少跳数。

[推荐]
```bash
curl -X POST https://api.formula-nebula.com/api/graphs/recommend \
  -H "Content-Type: application/json" \
  -d '{
    "based_on": ["scheme", "sheaf"],
    "exclude": ["morphism"],
    "limit": 5
  }'
```

基于"概形"和"层"，推荐 5 个相关定理，
排除"态射"（已经读过）。

用途：构建"接下来读什么"推荐系统。
```

**操作提示**：
- 3:00-3:45：演示图谱查询（45 秒）
- 3:45-4:30：演示最短路径（45 秒）
- 4:30-5:00：演示推荐 API（30 秒）

---

### [5:00-7:00] SDK 使用

**画面**：代码编辑器，分屏显示 TypeScript 和 Python

**讲解词**：
```
我们提供官方 SDK：
- TypeScript（Axios）
- Python
- JavaScript

[安装]
```bash
# TypeScript/JavaScript
npm install @formula-nebula/sdk

# Python
pip install formula-nebula
```

[TypeScript 示例]
```typescript
import { FormulaNebula } from '@formula-nebula/sdk';

const client = new FormulaNebula({
  apiKey: 'YOUR_TOKEN',
  baseURL: 'https://api.formula-nebula.com'
});

// 查询定理
const theorems = await client.theorems.list({
  family: 'scheme',
  importanceMin: 0.8
});

// 获取证明
const proof = await client.proofs.get('riemann-roch');

// 寻路
const path = await client.graphs.shortestPath({
  from: 'hodge-conjecture',
  to: 'riemann-hypothesis',
  weighted: true
});

console.log(`路径: ${path.path.join(' → ')}`);
console.log(`跳数: ${path.hops}, 代价: ${path.cost}`);
```

[Python 示例]
```python
from formula_nebula import FormulaNebula

client = FormulaNebula(
    api_key='YOUR_TOKEN',
    base_url='https://api.formula-nebula.com'
)

# 查询定理
theorems = client.theorems.list(
    family='scheme',
    importance_min=0.8
)

# 获取证明
proof = client.proofs.get('riemann-roch')

# 寻路
path = client.graphs.shortest_path(
    from_='hodge-conjecture',
    to='riemann-hypothesis',
    weighted=True
)

print(f"路径: {' → '.join(path.path)}")
print(f"跳数: {path.hops}, 代价: {path.cost}")
```

[错误处理]
```typescript
try {
  const proof = await client.proofs.get('nonexistent');
} catch (error) {
  if (error.status === 404) {
    console.log('定理不存在');
  } else if (error.status === 429) {
    console.log('速率限制，请稍后重试');
  }
}
```

SDK 自动处理：
- 重试（429 错误）
- 超时
- JSON 解析
- 类型检查（TypeScript）
```

**操作提示**：
- 5:00-6:00：编写并运行 TypeScript 示例（60 秒）
- 6:00-7:00：编写并运行 Python 示例（60 秒）

---

### [7:00-9:00] 嵌入可视化组件

**画面**：网页编辑器（CodePen/JSFiddle）

**讲解词**：
```
你可以把公式诗云的三维可视化
嵌入到自己的网页中。

[方法一：iframe 嵌入]
```html
<iframe 
  src="https://formula-nebula.com/?embed=true&view=cluster&color=status"
  width="100%"
  height="600px"
  frameborder="0"
></iframe>
```

`?embed=true` 隐藏顶栏和设置按钮，
只保留核心可视化。

其它参数同深链分享：
- `view=` 取景
- `color=` 着色
- `node=` 预选节点
- `shape=` 形态

[方法二：Web Component]
```html
<script src="https://cdn.formula-nebula.com/embed.js"></script>

<formula-nebula
  view="cluster"
  color="status"
  width="800"
  height="600"
  interactive="true"
></formula-nebula>
```

属性：
- `view` - galaxy | cluster | all
- `color` - family | status | field | uniform
- `shape` - spiral | barred | ring | diffuse
- `interactive` - true 允许旋转缩放
- `auto-rotate` - false 禁用自转

[方法三：React 组件]
```bash
npm install @formula-nebula/react
```

```tsx
import { FormulaNebula } from '@formula-nebula/react';

function App() {
  return (
    <FormulaNebula
      view="cluster"
      color="status"
      onNodeClick={(node) => {
        console.log('点击了:', node.name);
      }}
      onReady={() => {
        console.log('加载完成');
      }}
    />
  );
}
```

支持的事件：
- `onNodeClick` - 点击公式
- `onNodeHover` - 悬停
- `onReady` - 加载完成
- `onError` - 加载失败

[方法四：Vue 组件]
```bash
npm install @formula-nebula/vue
```

```vue
<template>
  <FormulaNebula
    view="cluster"
    color="status"
    @node-click="handleClick"
    @ready="handleReady"
  />
</template>

<script setup>
import { FormulaNebula } from '@formula-nebula/vue';

function handleClick(node) {
  console.log('点击了:', node.name);
}

function handleReady() {
  console.log('加载完成');
}
</script>
```
```

**操作提示**：
- 7:00-7:30：iframe 嵌入演示（30 秒）
- 7:30-8:00：Web Component 演示（30 秒）
- 8:00-8:30：React 组件演示（30 秒）
- 8:30-9:00：Vue 组件演示（30 秒）

---

### [9:00-11:00] WebSocket 实时协作

**画面**：代码编辑器 + 双窗口演示

**讲解词**：
```
协作功能通过 WebSocket 实现。

[连接]
```typescript
import { CollabClient } from '@formula-nebula/sdk';

const collab = new CollabClient({
  url: 'wss://api.formula-nebula.com/collab',
  token: 'YOUR_TOKEN'
});

// 创建会话
const session = await collab.createSession({
  name: 'Team Discussion',
  privacy: 'invite-only',
  permissions: {
    annotate: 'members',
    comment: 'all'
  }
});

console.log('会话 ID:', session.id);
console.log('分享链接:', session.shareUrl);
```

[加入会话]
```typescript
const session = await collab.joinSession('session_abc123');

// 监听其它成员的操作
session.on('member-joined', (member) => {
  console.log(`${member.username} 加入了`);
});

session.on('node-selected', (data) => {
  console.log(`${data.username} 选中了 ${data.nodeId}`);
});

session.on('camera-moved', (data) => {
  // 同步相机位置（可选）
  camera.position.copy(data.position);
});

session.on('annotation-added', (annotation) => {
  console.log('新标注:', annotation.content);
});
```

[发送操作]
```typescript
// 选中节点
session.selectNode('hodge-conjecture');

// 移动相机
session.updateCamera({
  position: camera.position,
  target: controls.target
});

// 添加标注
const annotation = await session.addAnnotation({
  nodeId: 'hodge-conjecture',
  content: '这个猜想是证明的关键',
  position: { x: 100, y: 150 }
});

// 回复标注
await session.replyAnnotation(annotation.id, {
  content: '同意，但只适用于紧流形'
});
```

[离开会话]
```typescript
await session.leave();
```

[管理会话]
```typescript
// 踢出成员（需要管理员权限）
await session.removeMember('user_xyz');

// 修改权限
await session.updatePermissions({
  annotate: 'admins-only',
  comment: 'members'
});

// 保存快照
const snapshot = await session.saveSnapshot();
console.log('快照 URL:', snapshot.url);

// 恢复快照
await session.restoreSnapshot(snapshot.id);
```

[事件列表]
- `member-joined` / `member-left`
- `node-selected` / `node-deselected`
- `camera-moved`
- `annotation-added` / `annotation-updated` / `annotation-deleted`
- `comment-added`
- `permissions-changed`
```

**操作提示**：
- 9:00-9:40：创建会话（40 秒）
- 9:40-10:20：加入会话 + 监听事件（40 秒）
- 10:20-11:00：发送操作 + 双窗口同步演示（40 秒）

---

### [11:00-13:00] AI 服务 API

**画面**：代码编辑器 + AI 响应

**讲解词**：
```
公式诗云提供三个 AI 服务：
- 证明生成
- 公式识别
- 智能建议

[证明生成]
```typescript
const proof = await client.ai.prove({
  statement: '对于紧 Kähler 流形 X，H^{2k}(X,Q) ∩ H^{k,k} 是代数闭的',
  context: ['hodge-theory', 'kahler-manifold'],
  style: 'outline' // 'outline' | 'detailed' | 'formal'
});

console.log(proof.outline);
console.log(proof.steps);
console.log(proof.prerequisites);
```

返回：
```json
{
  "outline": "使用 Hodge 分解和 Lefschetz (1,1) 定理...",
  "steps": [
    {
      "step": 1,
      "content": "首先证明 Hodge 分解存在...",
      "justification": "紧 Kähler 流形上 Laplace 算子有谱分解"
    },
    ...
  ],
  "prerequisites": ["hodge-decomposition", "lefschetz-theorem"],
  "confidence": 0.87
}
```

**注意**：AI 生成的证明需要人工验证。
`confidence < 0.8` 的结果应谨慎使用。

[公式识别]
```typescript
// 从图片识别
const formula = await client.ai.recognize({
  image: imageBase64, // 或 imageUrl
  context: 'algebraic-geometry'
});

console.log('LaTeX:', formula.latex);
console.log('置信度:', formula.confidence);

// 可能的匹配
console.log('可能是:', formula.candidates);
```

返回：
```json
{
  "latex": "H^{2k}(X,\\mathbb{Q}) \\cap H^{k,k}",
  "confidence": 0.92,
  "candidates": [
    {"id": "hodge-conjecture", "score": 0.88},
    {"id": "hodge-decomposition", "score": 0.65}
  ]
}
```

[智能建议]
```typescript
const suggestions = await client.ai.suggest({
  currentNode: 'scheme',
  readHistory: ['morphism', 'sheaf', 'cohomology'],
  goal: 'understand-etale-cohomology'
});

console.log('建议阅读:', suggestions.next);
console.log('原因:', suggestions.reason);
```

返回：
```json
{
  "next": [
    {
      "id": "flat-morphism",
      "reason": "étale 态射是平坦态射的特例",
      "priority": 0.9
    },
    {
      "id": "fundamental-group",
      "reason": "étale 上同调推广了基本群",
      "priority": 0.85
    }
  ],
  "learningPath": [
    "flat-morphism",
    "etale-morphism",
    "etale-topology",
    "etale-cohomology"
  ]
}
```

[速率限制]
AI 端点速率限制更严格：
- 免费：20 次/15 分钟
- 付费：200 次/15 分钟

返回 429 时应退避重试。
```

**操作提示**：
- 11:00-11:40：演示证明生成（40 秒）
- 11:40-12:20：演示公式识别（40 秒）
- 12:20-13:00：演示智能建议（40 秒）

---

### [13:00-14:30] 速率限制与最佳实践

**画面**：代码编辑器 + 文档页面

**讲解词**：
```
[速率限制]
- 一般端点：100 次/15 分钟
- AI 端点：20 次/15 分钟（免费）
- WebSocket：10 个并发连接

返回 429 时响应头包含：
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1699999999
```

[重试策略]
```typescript
async function callWithRetry(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (error.status === 429 && i < maxRetries - 1) {
        const resetTime = parseInt(error.headers['x-ratelimit-reset']);
        const waitMs = (resetTime * 1000) - Date.now() + 1000;
        console.log(`速率限制，等待 ${waitMs}ms`);
        await new Promise(resolve => setTimeout(resolve, waitMs));
      } else {
        throw error;
      }
    }
  }
}

// 使用
const theorems = await callWithRetry(() => 
  client.theorems.list({ family: 'scheme' })
);
```

[缓存]
```typescript
// 定理列表很少变化，可以缓存
const cache = new Map();

async function getTheorems(family) {
  const key = `theorems:${family}`;
  if (cache.has(key)) {
    return cache.get(key);
  }
  
  const theorems = await client.theorems.list({ family });
  cache.set(key, theorems);
  
  // 1 小时后过期
  setTimeout(() => cache.delete(key), 3600000);
  
  return theorems;
}
```

[批量查询]
```typescript
// ❌ 不好：逐个查询
for (const id of ids) {
  const theorem = await client.theorems.get(id);
  // ...
}

// ✅ 好：批量查询
const theorems = await client.theorems.batchGet(ids);
```

[错误处理]
```typescript
try {
  const proof = await client.proofs.get('theorem-id');
} catch (error) {
  switch (error.status) {
    case 404:
      console.log('定理不存在');
      break;
    case 429:
      console.log('速率限制');
      break;
    case 500:
      console.log('服务器错误，请稍后重试');
      break;
    default:
      console.error('未知错误:', error);
  }
}
```

[最佳实践]
1. 缓存不变的数据（定理列表、证明内容）
2. 使用批量查询减少请求数
3. 实现指数退避重试
4. 监控速率限制头
5. 使用 WebSocket 而不是轮询
6. 在 AI 端点前先本地过滤
```

**操作提示**：
- 13:00-13:40：演示速率限制触发（40 秒）
- 13:40-14:10：演示重试策略（30 秒）
- 14:10-14:30：演示缓存与批量查询（20 秒）

---

### [14:30-15:00] 总结与资源

**画面**：文档首页 + GitHub 仓库

**讲解词**：
```
公式诗云 API 的完整文档：
https://api.formula-nebula.com/docs

OpenAPI 规范：
https://api.formula-nebula.com/openapi.yaml

SDK 仓库：
- TypeScript: github.com/formula-nebula/sdk-typescript
- Python: github.com/formula-nebula/sdk-python
- React: github.com/formula-nebula/react
- Vue: github.com/formula-nebula/vue

示例项目：
github.com/formula-nebula/examples

社区：
- Discord: discord.gg/formula-nebula
- GitHub Discussions
- Stack Overflow (标签 formula-nebula)

如果你构建了有趣的集成，
欢迎在社区分享！

感谢观看公式诗云系列教程。
```

**操作提示**：
- 14:30-14:50：展示各资源链接（20 秒）
- 14:50-15:00：淡出到 Logo + 系列完结（10 秒）

---

## 演示素材准备

### 开发环境
- Node.js 18+
- Python 3.9+
- VS Code / WebStorm
- Postman / Insomnia

### API 密钥
- 提前注册测试账号
- 准备好 token（隐藏真实 token，用占位符）

### 代码示例
- 所有示例代码提前测试通过
- 准备好错误场景（404, 429, 500）

---

## 常见问题

**Q1: API 是否免费？**
A: 读取操作免费（有速率限制）。AI 服务和高频写入需要付费计划。

**Q2: 是否提供本地部署？**
A: 企业版支持本地部署。联系 sales@formula-nebula.com

**Q3: 数据更新频率？**
A: 定理数据每月更新一次。实时协作数据即时同步。

---

## 后期制作检查清单

- [ ] 代码语法高亮
- [ ] API 响应 JSON 格式化
- [ ] 双窗口协作演示
- [ ] 错误场景截图
- [ ] 资源链接字幕
- [ ] 中文 + 英文字幕
- [ ] 片尾完整资源列表

---

## 脚本版本

- **创建日期**：2026-11-03
- **适用版本**：v2.0+
