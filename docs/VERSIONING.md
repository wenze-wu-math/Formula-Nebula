# 版本控制与发布流程

本文档规范项目的版本号管理、发布流程、以及变更日志维护。

---

## 版本号方案

遵循 [语义版本控制 2.0.0](https://semver.org/lang/zh-CN/)：

```
v主版本号.次版本号.修订号[-预发布标识][+构建元数据]

例：
  v0.1.0          初始发布
  v0.1.1          修复 bug
  v0.2.0          新功能（向后兼容）
  v1.0.0          破坏性变更
  v1.0.0-rc.1     候选发布
  v1.0.0-beta.2   测试版本
```

### 增版规则

| 情况 | 变更 | 示例 |
|---|---|---|
| 主版本 | 有破坏性变更 | v0.1.0 → v1.0.0 |
| 次版本 | 新增向后兼容功能 | v0.1.0 → v0.2.0 |
| 修订号 | 修复 bug（向后兼容） | v0.1.0 → v0.1.1 |

---

## 发布流程

### 前置检查（Pre-Release）

在创建发布前，确保：

```bash
# 1. 代码通过所有测试
npm run verify        # 验证脚本
npm run verify:proofs # LaTeX 校验
npm run build         # 生产构建

# 2. 代码格式检查（若有 linter）
npm run lint

# 3. 性能基准线（可选）
npm run perf

# 4. 文档最新
# - CHANGELOG.md 已更新
# - UPGRADE-GUIDE.md 已审查
# - DEPRECATION-NOTICES.md 已更新
```

### 发布步骤

#### 第 1 步：更新版本号和日期

```bash
# 方法一：手动编辑 package.json
{
  "version": "0.1.0",      # ← 改这里
  ...
}

# 方法二：使用 npm version（自动 Git 标记）
npm version patch     # v0.1.0 → v0.1.1
npm version minor     # v0.1.0 → v0.2.0
npm version major     # v0.1.0 → v1.0.0
```

#### 第 2 步：更新 CHANGELOG

```bash
# 从 Git 提交自动生成"未发布"部分（可选）
node scripts/generate-changelog.mjs

# 或者手动编辑 CHANGELOG.md
# 将"## 未发布"改为"## [0.1.0] - 2026-11-03"
```

#### 第 3 步：创建发布笔记

```bash
# 生成基于模板的发布笔记
node scripts/create-release-notes.mjs v0.1.0

# 手动编辑 docs/releases/v0.1.0-release-notes.md
# 填充：新增、改进、修复、已知问题等
```

#### 第 4 步：提交变更

```bash
# 暂存相关文件
git add CHANGELOG.md DEPRECATION-NOTICES.md package.json docs/releases/

# 提交（遵循约定消息格式）
git commit -m "chore: bump version to 0.1.0

- Update CHANGELOG.md
- Add release notes
- Update deprecation notices"
```

#### 第 5 步：标记发布

```bash
# 创建带注解的 tag（包含发布说明）
git tag -a v0.1.0 -m "Release v0.1.0 - Initial launch"

# 或者用轻量级 tag（仅记录提交）
git tag v0.1.0
```

#### 第 6 步：推送到仓库

```bash
# 推送分支
git push origin main

# 推送 tag
git push origin v0.1.0

# 或一次推送所有 tag
git push origin --tags
```

#### 第 7 步：发布到 GitHub Releases（可选自动化）

在 GitHub 上手动创建 Release，或用脚本自动化：

```bash
# 使用 GitHub CLI（需安装 gh）
gh release create v0.1.0 \
  --title "Release v0.1.0" \
  --notes-file docs/releases/v0.1.0-release-notes.md \
  --draft false
```

#### 第 8 步：部署

```bash
# 构建生产版本
npm run build

# 部署到 CDN / 静态服务
# （具体命令取决于部署平台）
npm run deploy

# 或者如果用 Docker
docker build -t formula-nebula:v0.1.0 .
docker push registry.example.com/formula-nebula:v0.1.0
```

---

## Git 提交消息约定

遵循 [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### 类型 (type)

| 类型 | 含义 | 示例 |
|---|---|---|
| `feat` | 新功能 | `feat: add cluster visualization` |
| `fix` | 修复 bug | `fix: incorrect radius calculation` |
| `perf` | 性能改进 | `perf: optimize mesh rendering` |
| `refactor` | 代码重构 | `refactor: extract layout algorithm` |
| `docs` | 文档 | `docs: update README` |
| `test` | 测试 | `test: add layout verification` |
| `chore` | 工具链、依赖 | `chore: upgrade Three.js` |
| `style` | 格式、空格 | `style: fix indentation` |

### 破坏性变更

在正文或 footer 中标记 BREAKING CHANGE：

```
feat!: change API response format

BREAKING CHANGE: The response format has changed from {...} to [...]
All clients must be updated to handle the new format.
```

或在 type 后加 `!`：

```
feat!: change API response format
```

### 示例

```
feat: add relationship type coloring

- Implement 11 type categories (equivalent, implies, depends, etc.)
- Use OKLab color space for consistency
- Update link rendering pipeline

Closes #42
```

---

## 变更日志维护

### 日常记录（持续）

每次提交时，开发者应在 CHANGELOG.md 的"## 未发布"部分记录：

```markdown
## 未发布

### 新增
- 新功能名称 — 一句话说明

### 改进
- 改进名称 — 性能收益或优化说明

### 修复
- BUG 名称 — 症状、根因简述
```

### 发布前整理（每个版本）

1. **生成 CHANGELOG**
   ```bash
   node scripts/generate-changelog.mjs --from v0.0.3 --to v0.1.0
   ```

2. **审查和润色**
   - 合并重复条目
   - 调整排序（破坏性 → 新增 → 改进 → 修复）
   - 补充缺失信息

3. **移动到版本段**
   ```markdown
   ## [0.1.0] - 2026-11-03
   ### 新增
   ...
   
   ## 未发布
   ### 新增
   -
   ```

---

## 版本生命周期

### 支持周期

| 版本 | 发布日期 | LTS 结束 | 安全支持 | 状态 |
|---|---|---|---|---|
| v0.1.0 | 2024-11-03 | 2025-05-03 | 2025-08-03 | ✅ 活跃 |
| v0.2.0 | 2025-02-03 (预期) | 2025-08-03 | 2025-11-03 | 📅 计划中 |
| v1.0.0 | 2025-06-03 (预期) | 2027-06-03 | 2028-06-03 | 📅 计划中 |

**LTS（长期支持）**：提供 6 个月维护和 3 个月安全修复

### 弃用时间表

详见 DEPRECATION-NOTICES.md 和 UPGRADE-GUIDE.md

---

## 预发布版本

用于测试和验证的版本号：

### Beta 版本

```bash
# 标记 beta 版本（可多次迭代）
npm version 0.2.0-beta.1
npm version 0.2.0-beta.2
...
git tag v0.2.0-beta.1
git push origin v0.2.0-beta.1
```

### Release Candidate (RC)

```bash
# 最后的候选发布
npm version 0.2.0-rc.1
git tag v0.2.0-rc.1
git push origin v0.2.0-rc.1
```

### Staging 环境

```bash
# 预发布测试（用 +metadata）
npm version 0.2.0-rc.1+staging.1
```

---

## CI/CD 集成

### 自动发布流程（可选）

```yaml
# .github/workflows/release.yml
name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build
        run: npm ci && npm run build
      
      - name: Create Release
        uses: softprops/action-gh-release@v1
        with:
          files: dist/**/*
          body_path: docs/releases/LATEST-RELEASE-NOTES.md
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

---

## 常见问题

### Q: 如何修复已发布版本中的 bug？

**A**: 创建补丁版本：

```bash
git checkout v0.1.0              # 检出该版本
git checkout -b fix/security     # 创建修复分支
# ... 编辑并测试修复 ...
git commit -am "fix: security issue #42"
npm version patch                # v0.1.0 → v0.1.1
git tag v0.1.1
git push origin v0.1.1
```

### Q: 可以跳过某个版本号吗？

**A**: 可以，但不推荐。若必须：

```bash
# 强制指定版本
npm version 0.3.0 --force
```

### Q: 如何回滚已发布的版本？

**A**: 创建"修复"版本或新建补丁，不修改已发布的 tag。

```bash
# ❌ 不要这样做（改写历史）
git tag -d v0.1.0
git push origin :v0.1.0

# ✅ 改为
git tag v0.1.1        # 修复版本
git push origin v0.1.1
```

---

## 工具和参考

- **CHANGELOG.md** — 完整变更历史
- **RELEASE-NOTES-TEMPLATE.md** — 发布笔记模板
- **UPGRADE-GUIDE.md** — 用户升级指南
- **DEPRECATION-NOTICES.md** — 弃用和迁移路径
- `scripts/generate-changelog.mjs` — 自动生成 CHANGELOG
- `scripts/create-release-notes.mjs` — 生成发布笔记

---

**最后更新**：2026-11-03
**维护者**：[@author](https://github.com/author)
