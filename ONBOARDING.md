# 员工入职文档 · Formula Nebula

欢迎加入 Formula Nebula 项目团队。本文档指导新贡献者快速理解项目、建立开发环境、参与代码审查和发布流程。

---

## 1. 新贡献者指南

### 项目概览

**Formula Nebula**（公式诗云）是代数几何知识图谱的三维星云可视化。

- **核心数据**：405 条已定论的定理（主星系）+ 59 条未定论的猜想（猜想星团）
- **可视化**：基于旋涡星系结构，用位置和大小编码知识的重要度
- **技术栈**：Vite + Three.js + MathJax + Node.js
- **部署**：Vercel（生产），本地开发环境（5175 / 5176 端口）

### 关键概念速查

| 概念 | 说明 |
|---|---|
| **主星系（Galaxy）** | 扁盘结构，3630 条定理按重要度排序。越中心越重要，越亮，越大。|
| **猜想星团（Cluster）** | 球形结构，607 条猜想。按状态色标（未解/部分解/已证/已推翻）展示。|
| **研究者（Researcher）** | 69 位研究者单独成团，挂在与其工作相关的定理附近。|
| **重要度映射** | 影响三个维度：半径/球心距、大小、亮度。由 `importance ∈ [0,1]` 驱动。|
| **知识族（Family）** | 8 个代数几何分支：scheme, variety, topo, curve, modern, algebra, compute, logic。|
| **关系类型** | 8747 条边的语义分类：等价、定义、蕴含、依赖等 11 种 + 兜底。|
| **关联权重** | 0–1，表示两个公式的相关强度。搜索寻路时用作边权。|

> **两套规模数字，别混**：`src/data/*` 里手写的核心数据集是 **405 条定理 + 59 条猜想**
> （`npm run check-data` 校验的就是它，也是编辑工作的对象）；而应用实际渲染、你在屏幕上
> 看到的是 `buildGraph()` 组装的 **4306 节点 / 8747 关联**，因为还包含了自动抓取的批次
> 和研究者节点。以 `graph.stats` 为准。

### 代码组织

```
src/
├── main.js                 # 应用入口
├── scene.js               # Three.js 场景管理、相机控制、交互
├── graph.js               # 图布局算法、坐标计算
├── links.js               # 边渲染、拾取、提示
├── data/                  # 数据文件
│   ├── formulas.js        # 405 个定理的定义
│   ├── conjectures.js     # 59 个猜想
│   └── edges.json         # 1620 条关联
├── components/            # UI 组件（React / Vue）
│   ├── SettingsPanel.jsx  # 设置面板
│   ├── SearchBox.jsx      # 搜索框
│   └── DetailPanel.jsx    # 详情面板
├── canonicalization/      # 数据规范化（内部工具）
├── recommendations/       # 推荐引擎（可选）
├── research/              # 研究用脚本（内部）
└── verification/          # 验证脚本集

scripts/
├── verify-*.mjs           # 验证脚本（40+个）
├── check-data.mjs         # 数据完整性检查
├── probe-perf.mjs         # 性能分析
└── load-test.js           # 压力测试

designs/
├── atlas/                 # 设计系统
└── research/              # 用户研究资料

tests/
├── canonicalization/      # 规范化测试
└── 其他测试目录
```

### 文件约定

- **`.mjs`** 是 Node.js ESM 脚本，`npm run` 的 target
- **`.js`** 可能是 CommonJS（config）或 ESM（source）
- **`.test.js`** 是单元测试（Jest）
- 数据用 `.js` 导出（便于类型提示）或 `.json`（纯数据）
- 所有配置都在根目录（package.json, vite.*.config.mjs 等）

### 数据流向

```
数据文件（formulas.js, edges.json）
    ↓
BuildGraph（src/graph.js）
    ↓ 坐标计算、布局松弛
图布局对象 { nodes, edges }
    ↓
Scene（src/scene.js）
    ↓ 烘焙 LaTeX、纹理上传
Three.js Mesh 对象
    ↓
Render（rAF 循环）
    ↓ 交互、相机、后处理
屏幕输出
```

### 快速阅读清单

- **核心的核心**：`src/scene.js` 的 `updateFocus()` 和 `src/graph.js` 的 `buildGraph()`
- **布局算法**：README.md 「布局算法：六个踩过的坑」（第 822 行）—— 改任何位置计算前**必读**
- **重要度**：README.md 「越中心越重要」（第 611 行）
- **验证**：`scripts/verify-importance.mjs` 和 `scripts/check-data.mjs`

---

## 2. 开发环境设置

### 前置条件

- **Node.js** ≥ 18.0（支持 ESM）
- **npm** ≥ 9.0
- **Git** 2.0+
- 操作系统：Windows / macOS / Linux

### 一键启动

```bash
# 克隆仓库
git clone https://github.com/your-org/formula-nebula.git
cd formula-nebula

# 安装依赖
npm install

# 启动开发服务器（端口 5175）
npm run dev

# 在另一个终端启动预览服务器（端口 5176）
npm run preview

# 验证全部检查
npm run verify
```

首次访问 http://localhost:5175 会加载 3–6 秒（464 个公式的 LaTeX 排版）。

### 常用命令

| 命令 | 用途 |
|---|---|
| `npm run dev` | 开发服务器（热重载），端口 5175 |
| `npm run build` | 生产构建 → `dist/` |
| `npm run preview` | 预览构建产物，端口 5176（严格端口，验证脚本连这里） |
| `npm run verify` | 跑全部验证脚本 |
| `npm run verify:proofs` | 只验证证明数据 |
| `npm run check-data` | 仅检查数据完整性（快） |
| `npm run perf` | 测启动耗时 / GPU 显存 / draw call |

### 端口与环境变量

**为什么 dev 和 preview 用不同端口？**

40 多个验证脚本全部连 http://localhost:5176 (preview)。若预览也用 5175，Vite 找不到端口会往后找一个，导致脚本连上了另一个实例，读的是陈旧数据。

**临时改端口**（PowerShell）：
```powershell
$env:NEBULA_PORT=6000; npm run dev
$env:NEBULA_PREVIEW_PORT=6001; npm run preview
$env:URL=http://localhost:6001; npm run verify
```

**临时改端口**（bash）：
```bash
export NEBULA_PORT=6000
npm run dev

export NEBULA_PREVIEW_PORT=6001  
npm run preview

export URL=http://localhost:6001
npm run verify
```

### IDE 配置

#### VS Code

推荐扩展：
- **Vite** (antfu.vite)
- **Three.js** (m7ebrother.three-js-snippets)
- **ES7+ React/Redux** (dsznajder.es7-react-js-snippets)
- **Prettier** (esbenp.prettier-vscode)

`.vscode/settings.json` 示例：
```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "files.exclude": {
    "node_modules": true,
    "dist": true
  }
}
```

#### 调试

在 `.vscode/launch.json` 添加：
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "Launch Chrome",
      "url": "http://localhost:5175",
      "webRoot": "${workspaceFolder}",
      "runtimeExecutable": "chrome"
    }
  ]
}
```

### 验证安装成功

```bash
npm run check-data
# 输出应显示：
# ✓ 405 formulas loaded
# ✓ 59 conjectures loaded
# ✓ 1620 edges verified
```

---

## 3. 代码审查流程

### 分支策略

- **`main`** 是生产分支，总是可部署的
- **功能分支** 命名 `feature/what-you-add` 或 `fix/what-you-fix`
- **从 `main` 新建分支**
- **禁止直接推 `main`**

### 提 Pull Request

#### 前置准备

1. 本地创建功能分支：
   ```bash
   git checkout -b feature/my-feature
   ```

2. 做改动，提交信息要清晰：
   ```bash
   git add src/scene.js
   git commit -m "fix(scene): correct camera focus animation timing"
   ```

3. 推送：
   ```bash
   git push -u origin feature/my-feature
   ```

#### PR 描述模板

```markdown
## 描述
这个 PR 做了什么。

## 改动类型
- [ ] 功能新增
- [ ] Bug 修复
- [ ] 文档更新
- [ ] 性能优化
- [ ] 数据更新
- [x] 其他：___

## 检查清单
- [x] 代码跑过本地验证 (`npm run verify`)
- [x] 新增代码有注释说明思路
- [x] 改了数据就跑了 `npm run check-data`
- [x] 改了布局算法就跑了 `npm run verify:shapes`（见下）
- [ ] 修改了用户界面（如是，截图附上）

## 关联 Issue
Closes #123
```

#### 关键验证

改不同部分的清单：

| 改动范围 | 必须跑 |
|---|---|
| 任何 .js | `npm run check-data` |
| 数据（formulas.js, edges.json 等） | `npm run verify` (全部) |
| 布局相关（graph.js 坐标计算） | `npm run verify:shapes` |
| 颜色 / 着色 | `npm run verify:colors` |
| 聚焦动画（scene.js） | 截图或录屏对比 |
| 性能 | `npm run perf` 对比改动前后 |

### 审查反馈

#### 常见审查点

- **重要度语义是否破坏**：秩相关是否仍在 **−0.99** 以上
- **布局是否因改动而重排**：若不应该重排但重排了，是 bug
- **数据完整性**：是否有孤立节点、悬空边
- **可读性**：盘心的公式是否被压住
- **性能**：启动延迟是否增加超过 500ms

#### 修改意见格式

不接受：`这样太复杂了`

接受：
```
在 scene.js 的 focusAnimation() 里，用 exponential smoothing
而不是 Hermite 插值，可以让镜头跟随更稳。实测
抖动从 8% 降到 2%（用 scripts/verify-camera.mjs）。
```

### CI/CD 自动检查

推送 PR 后，GitHub Actions 自动运行：

1. **Lint**（代码风格）—— 必须通过
2. **Build**（构建） —— 必须成功
3. **Data validation**（数据检查） —— 必须通过
4. **Tests** —— 必须通过

都通过才能合并。

### 合并与冲突

- 仅项目维护者可合并到 `main`
- 冲突自己解决，不要让审查者改冲突
  ```bash
  git fetch origin
  git rebase origin/main
  # 手动解决冲突
  git add .
  git rebase --continue
  git push -f origin feature/my-feature
  ```

### 事后

- PR 合并后，分支会自动删除
- 本地清理：
  ```bash
  git checkout main
  git pull origin main
  git branch -d feature/my-feature
  ```

---

## 4. 发布流程

### 版本号约定

遵循语义化版本 (SemVer)：`MAJOR.MINOR.PATCH`

- **MAJOR**（0 → 1）：不兼容 API 改动、大功能上线
- **MINOR**（0.1 → 0.2）：向后兼容的功能新增、新数据
- **PATCH**（0.1.0 → 0.1.1）：Bug 修复、数据勘误

当前版本：**0.1.0**（见 `package.json` 的 `"version"`）

### 发布检查清单

```bash
# ① 确保 main 分支是最新的
git checkout main
git pull origin main

# ② 跑全部验证
npm run verify

# ③ 生产构建
npm run build

# ④ 预览构建产物（确认无问题）
npm run preview
# 手动点几个公式，看交互是否正常

# ⑤ 如果上面都过了，发布标签
npm version patch  # 或 minor / major
# 这会：
#  - 更新 package.json 的 version
#  - 创建 Git tag
#  - 自动提交

# ⑥ 推送标签
git push origin main --tags

# ⑦ GitHub 自动触发部署到 Vercel
```

### 部署流程

**自动化**：当标签推到 `origin/main` 时，GitHub Actions 自动：

1. 跑完整验证
2. 构建优化版本
3. 推送到 Vercel 的生产环境

**手动干预**：在 Vercel 控制面板 https://vercel.com/projects/formula-nebula 查看部署进度。若失败，查看日志并修复。

### 部署后

- 检查 https://formula-nebula.vercel.app（生产环境）
- 验证数据是否更新
- 确认 3D 交互无卡顿
- 测试搜索、寻路功能

### 回滚

若生产有严重问题：

```bash
# 查看历史 tag
git tag | tail -10

# 回退到上一个版本
git checkout v0.0.9
git push origin main --force  # 危险操作，需要权限

# 或创建一个修复分支
git checkout -b hotfix/revert-bad-feature v0.0.9
# 修复问题
npm version patch  # 这会生成 0.0.10
git push origin hotfix/revert-bad-feature --tags
```

### 发布日志

每次 `npm version` 后，创建 `CHANGELOG.md` 条目（或用 `conventional-changelog`）：

```markdown
## [0.1.1] - 2026-11-03

### Fixed
- 修复猜想星团中心聚集度计算错误（坑3：King 剖面）
- 修复搜索框在某些输入下的死锁

### Added
- 关系类型可视化（11 种类型 + 兜底）
- 悬停连线显示理由文本

### Changed
- 重要度亮度映射调整（从 rank^1.20 改为 rank^1.30）
```

---

## 附录：快速参考

### 紧急情况

| 问题 | 解决方案 |
|---|---|
| 改了代码，开发服务器崩溃 | `Ctrl+C` 停止，`npm run dev` 重启 |
| 端口被占用 | `npm run dev -- --port 6000` 或改环境变量 |
| 验证脚本连不上 | 确保 `npm run preview` 在 5176 运行，且 `strictPort: true` |
| 构建超大 | 跑 `npm run build` 看产物大小，检查是否有重复依赖 |
| 无法合并 PR | 自己 rebase main，解决冲突，`git push -f` 更新 PR |

### 文档导航

所有深度讨论都在 **README.md**：

- L 822–1016：布局算法（改坐标前必读）
- L 611–663：重要度映射
- L 705–737：着色机制
- L 1018–1077：搜索与寻路
- L 1080–1188：关系类型系统

### 联系方式

- **项目 Issue**：GitHub Issues（bug / feature request）
- **代码问题**：在 PR 或 Commit 里评论
- **数据问题**：编辑 `src/data/` 并提 PR
- **基础设施问题**：联系维护者（见 MAINTAINERS.md）

---

**欢迎贡献！** 如有疑问，先看 README.md，再查相关源代码。代码本身就是最好的文档。

