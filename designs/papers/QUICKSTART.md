# 快速开始 Quick Start Guide

论文摘要与推荐系统的 5 分钟入门指南。

## 📋 前置要求

- Node.js 18+ (已安装)
- 网络连接 (访问 arXiv API)
- 磁盘空间 ~50MB (用于缓存)

## 🚀 启动步骤

### 方式 1: Web 界面 (推荐)

```bash
# 1. 进入项目目录
cd "D:\xiangmu\Formula Nebula"

# 2. 启动 API 服务器
node designs/papers/api-server.mjs

# 3. 打开浏览器
# 访问 http://localhost:3456
```

界面操作:
1. 从下拉菜单选择定理 (如 "Hilbert Nullstellensatz")
2. 点击"搜索"按钮
3. 浏览论文卡片,点击查看详情
4. 点击"生成阅读列表"获取推荐

### 方式 2: 命令行

```bash
# 搜索论文
node kb-src/summarize-papers.mjs fetch nullstellensatz

# 生成阅读列表 (JSON)
node kb-src/summarize-papers.mjs reading riemann-roch --depth 2

# 生成阅读列表 (Markdown)
node kb-src/summarize-papers.mjs reading serre-duality --depth 2 --markdown

# 提取引用
node kb-src/summarize-papers.mjs cite "The Nullstellensatz shows..."
```

## 🎯 典型使用场景

### 场景 1: 学习新定理

```bash
# 找 Riemann-Roch 定理的现代论文
node kb-src/summarize-papers.mjs fetch riemann-roch
```

输出示例:
```json
[
  {
    "id": "2305.12345",
    "title": "Generalized Riemann-Roch for Singular Varieties",
    "authors": ["John Smith", "Jane Doe"],
    "published": "2023-05-15",
    "abstract": "We extend the classical Riemann-Roch...",
    "url": "https://arxiv.org/abs/2305.12345"
  },
  ...
]
```

### 场景 2: 构建阅读路径

```bash
# 从零点定理出发,2 层深度
node kb-src/summarize-papers.mjs reading nullstellensatz --depth 2 --markdown

# 查看生成的 Markdown 文件
cat kb-src/out/reading-list-nullstellensatz.md
```

输出结构:
```markdown
# Reading List

## Level 0
### Hilbert's Nullstellensatz and Schemes
...

## Level 1
### Applications to Commutative Algebra
...

## Level 2
### Modern Perspectives on Algebraic Geometry
...
```

### 场景 3: 验证论文引用

```javascript
// 在你的代码中
import { ExtractCitations } from './kb-src/summarize-papers.mjs'

const manuscript = `
  We use the Nullstellensatz to show that V(I) is empty
  if and only if 1 ∈ I. By Serre duality...
`

const citations = ExtractCitations(manuscript)
console.log(citations)
// ['nullstellensatz', 'serre-duality']
```

## 🔧 配置调整

### 修改搜索参数

编辑 `kb-src/summarize-papers.mjs`:

```javascript
// 默认搜索结果数 (20 → 50)
const maxResults = options.maxResults || 50

// 缓存过期时间 (7天 → 30天)
const age = Date.now() - cached.timestamp
if (age < 30 * 24 * 60 * 60 * 1000) { ... }

// arXiv 分类 (仅代数几何 → 所有数学)
category = 'math'  // 替代 'math.AG'
```

### 修改 API 服务器端口

```bash
# 环境变量
PORT=8080 node designs/papers/api-server.mjs

# 或编辑 api-server.mjs
const PORT = process.env.PORT || 8080
```

## 📊 数据格式

### 论文对象 (Paper)

```javascript
{
  id: "2305.12345",           // arXiv ID
  arxivId: "2305.12345",
  title: "论文标题",
  abstract: "摘要...",
  authors: ["作者1", "作者2"],
  published: "2023-05-15",
  categories: ["math.AG", "math.AC"],
  url: "https://arxiv.org/abs/...",
  pdfUrl: "https://arxiv.org/pdf/...",
  relatedTo: "nullstellensatz"  // 关联的定理 ID
}
```

### 摘要对象 (Summary)

```javascript
{
  paperId: "2305.12345",
  title: "论文标题",
  abstract: "原始摘要",
  keyResults: [
    "主要结果 1",
    "主要结果 2"
  ],
  theorems: [
    {
      type: "theorem",
      statement: "定理陈述"
    }
  ],
  methods: [
    "cohomology",
    "sheaf theory"
  ],
  relevanceScore: 0.85  // 0-1 之间
}
```

### 阅读列表项 (Reading List Item)

```javascript
{
  ...paper,              // 包含所有论文字段
  summary: {...},        // 包含摘要对象
  level: 0,              // 引用深度 (0 = 起点)
  sourceTheorem: "nullstellensatz"
}
```

## 🐛 故障排查

### 问题 1: API 服务器无法启动

```bash
Error: Cannot find module './kb-src/summarize-papers.mjs'
```

**解决**: 确保在项目根目录运行

```bash
cd "D:\xiangmu\Formula Nebula"
node designs/papers/api-server.mjs
```

### 问题 2: 搜索无结果

```bash
Found 0 papers for nullstellensatz
```

**可能原因**:
1. 网络连接问题 (无法访问 arXiv)
2. 定理 ID 不存在于知识图谱
3. arXiv API 暂时不可用

**解决**:
```bash
# 测试网络连接
curl http://export.arxiv.org/api/query?search_query=all:algebraic+geometry&max_results=1

# 使用已知的定理 ID
node kb-src/summarize-papers.mjs fetch riemann-roch

# 检查知识图谱
grep "id: 'nullstellensatz'" src/data/knowledge.js
```

### 问题 3: 缓存过时

```bash
# 清除缓存
rm -rf kb-src/out/papers-cache/*

# 或单个定理
rm kb-src/out/papers-cache/nullstellensatz-papers.json

# 重新搜索
node kb-src/summarize-papers.mjs fetch nullstellensatz
```

### 问题 4: arXiv 速率限制

```
Error: arXiv API error: 429
```

**解决**: 系统自动等待 3 秒,但如果并发请求过多:

```javascript
// 增加等待时间 (summarize-papers.mjs)
await new Promise(resolve => setTimeout(resolve, 5000))  // 3000 → 5000
```

## 📚 进阶使用

### 自定义定理列表

创建 `kb-src/out/theorems-list.json`:

```json
[
  {
    "id": "my-theorem",
    "name": "My Custom Theorem",
    "en": "Custom Theorem",
    "latex": "A = B"
  }
]
```

### 集成到现有工作流

```javascript
// 你的脚本
import { FetchRelatedPapers, SummarizePaper } from './kb-src/summarize-papers.mjs'

async function buildBibliography(theorems) {
  const bibliography = []

  for (const thm of theorems) {
    const papers = await FetchRelatedPapers(thm, { maxResults: 10 })

    for (const paper of papers) {
      const summary = await SummarizePaper(paper)
      if (summary.relevanceScore > 0.7) {
        bibliography.push({
          theorem: thm,
          paper,
          summary
        })
      }
    }
  }

  return bibliography
}
```

### 导出为 BibTeX

```javascript
function exportBibTeX(papers) {
  return papers.map(p => `
@article{${p.arxivId.replace(/\./g, '_')},
  title = {${p.title}},
  author = {${p.authors.join(' and ')}},
  journal = {arXiv preprint arXiv:${p.arxivId}},
  year = {${p.published.split('-')[0]}},
  url = {${p.url}}
}
  `).join('\n')
}
```

## 🎓 学习资源

### 理解系统设计

1. 阅读 `designs/papers/README.md` - 完整文档
2. 查看 `kb-src/summarize-papers.mjs` - 源码注释
3. 运行测试: `node designs/papers/test-integration.mjs`

### 理解 NLP 管线

```bash
# 单独测试引用提取
node kb-src/summarize-papers.mjs cite "Grothendieck proved..."

# 查看摘要提取结果
node kb-src/summarize-papers.mjs fetch riemann-roch | jq '.[0].abstract'
```

### 探索 arXiv API

```bash
# 直接查询 arXiv
curl "http://export.arxiv.org/api/query?search_query=all:nullstellensatz&max_results=5"

# 查看 XML 响应格式
```

## 💡 最佳实践

### 1. 使用缓存

```bash
# 首次搜索会较慢 (API 调用)
time node kb-src/summarize-papers.mjs fetch nullstellensatz
# Real: 4.2s

# 第二次会很快 (缓存命中)
time node kb-src/summarize-papers.mjs fetch nullstellensatz
# Real: 0.3s
```

### 2. 批量处理

```javascript
// ❌ 慢: 串行处理
for (const thm of theorems) {
  const papers = await FetchRelatedPapers(thm)
}

// ✓ 快: 使用缓存 + 合理间隔
const allPapers = []
for (const thm of theorems) {
  const papers = await FetchRelatedPapers(thm)
  allPapers.push(...papers)
  await new Promise(resolve => setTimeout(resolve, 3000))
}
```

### 3. 渐进式深度

```bash
# 先浅层探索
node kb-src/summarize-papers.mjs reading nullstellensatz --depth 1

# 确认有价值后再深入
node kb-src/summarize-papers.mjs reading nullstellensatz --depth 2
```

## 📞 获取帮助

- **功能问题**: 查看 `designs/papers/README.md`
- **API 错误**: 检查 arXiv API 状态
- **代码问题**: 阅读源码注释
- **建议反馈**: 提交 GitHub Issue

---

**更新时间**: 2026-11-02  
**适用版本**: v1.0.0
