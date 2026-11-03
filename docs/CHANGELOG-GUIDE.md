# 变更日志方案指南

完整的版本管理、发布流程、升级指南和弃用管理系统。

---

## 核心文档

### 📋 [CHANGELOG.md](../CHANGELOG.md)

**用途**：记录所有版本的变更历史

**内容**：
- 未发布的变更（持续积累）
- 已发布版本的完整变更（按版本号）
- 格式遵循 [Keep a Changelog](https://keepachangelog.com/)

**维护方式**：
- 日常：开发者在每个提交时更新"未发布"部分
- 发布前：从 Git 提交自动生成（可选）
  ```bash
  node scripts/generate-changelog.mjs
  ```

**示例**：
```markdown
## [0.1.0] - 2026-11-03
### 新增
- 三维星云可视化
### 修复
- 核心层可读性问题

## 未发布
### 新增
- [待填充]
```

---

### 📝 [RELEASE-NOTES-TEMPLATE.md](../RELEASE-NOTES-TEMPLATE.md)

**用途**：生成面向用户的发布公告

**内容**：
- 一句话总结
- 主要特性（分新增/改进/修复/弃用/安全）
- 性能数据
- 升级步骤（用户/开发者）
- 已知问题
- 下载链接和反馈渠道

**使用方式**：
```bash
# 基于模板创建本次发布的笔记
node scripts/create-release-notes.mjs v0.1.0

# 输出：docs/releases/v0.1.0-release-notes.md
# 编辑后发布到 GitHub Releases
```

**示例**：
```markdown
# Release v0.1.0 - Initial Launch

## 一句话总结
代数几何知识星云首个正式版本，支持定理+猜想双结构

## 主要特性

### ✨ 新增
- 三维星云可视化
- 双结构设计（定理盘 + 猜想球）

### 🔧 改进
- 核心层可读性 ×2 提升
- 星云效果优化
```

---

### 🆙 [UPGRADE-GUIDE.md](../UPGRADE-GUIDE.md)

**用途**：指导用户从旧版升级到新版

**内容**：
- 快速升级检查清单
- 按版本的升级路径
- 设置迁移规则
- 数据兼容性说明
- 浏览器兼容性矩阵
- 部署环境升级步骤
- 常见问题 & 排查
- 回滚指南

**结构**：
```
快速检查清单
├─ 所有用户都需要（清除缓存、刷新页面）
├─ 开发者需要（运行验证脚本）
└─ 部署需要（备份数据、灰度发布）

按版本升级路径
├─ 从 v0.0.x → v0.1.0（第一个大升级）
├─ 破坏性变更说明
├─ 浏览器端迁移
└─ 开发者升级步骤
```

**使用场景**：
- 用户更新到新版本时首先查看
- 部署前检查依赖/配置变更
- 遇到升级问题时查询常见问题

---

### ⚠️ [DEPRECATION-NOTICES.md](../DEPRECATION-NOTICES.md)

**用途**：管理弃用项、迁移路径、时间表

**内容**：
- 弃用状态速查表（活跃/弃用中/计划弃用/已移除）
- 功能弃用详情（何时弃用、何时删除、替代方案）
- 浏览器支持弃用（IE 11 计划移除）
- 数据格式变更
- **完整的迁移指南和代码示例**
- 向后兼容承诺
- 时间表（Roadmap）

**速查表示例**：

| 项 | 状态 | 弃用版本 | 删除版本 | 替代方案 |
|---|---|---|---|---|
| `graph.oldLayout()` | ⚠️ 弃用中 | v0.1.0 | v0.3.0 | `graph.exponentialDiskRadii()` |
| `settings.v0` | ⚠️ 弃用中 | v0.1.0 | v0.3.0 | 自动迁移至 `v1` |
| IE 11 | ⚠️ 计划移除 | v0.1.0 | v0.2.0 | 升级至 Chrome/Firefox/Safari |

**完整时间表**：
```
2024-11 v0.1.0 → 开始弃用 settings.v0, oldLayout(), IE 11
2025-02 v0.2.0 → 删除 makeRandom() 别名，续弃用 IE
2025-06 v0.3.0 → 删除所有 v0.1.0 弃用项，彻底移除 IE 支持
```

---

### 📚 [VERSIONING.md](./VERSIONING.md)

**用途**：版本号管理、发布流程、Git 约定

**内容**：
- 版本号方案（语义版本控制）
- **完整的 8 步发布流程**
- Git 提交消息约定（Conventional Commits）
- 版本生命周期表
- 预发布版本 (beta/rc)
- CI/CD 集成示例
- 常见问题（修复已发布版本、跳过版本号、回滚等）

**发布流程速查**：
```
1. 前置检查 (npm run verify, npm run build)
2. 更新版本号 (package.json)
3. 更新 CHANGELOG
4. 创建发布笔记
5. 提交变更 (git commit)
6. 标记发布 (git tag v0.1.0)
7. 推送到仓库 (git push --tags)
8. 部署 (npm run deploy)
```

---

## 快速导航

### 我是...

#### 🔹 **普通用户**
1. 升级前 → 查看 [UPGRADE-GUIDE.md](../UPGRADE-GUIDE.md) 的快速检查清单
2. 想了解新版本 → 查看 [CHANGELOG.md](../CHANGELOG.md)
3. 需要详细说明 → 查看该版本的发布笔记 (`docs/releases/v*.md`)

#### 🔹 **开发者**
1. 提交代码前 → 遵循 [VERSIONING.md](./VERSIONING.md) 的 Git 约定
2. 发布新版本 → 按 [VERSIONING.md](./VERSIONING.md) 的 8 步流程
3. 计划迁移 → 查看 [DEPRECATION-NOTICES.md](../DEPRECATION-NOTICES.md)

#### 🔹 **维护者/核心贡献者**
1. 日常维护 → 在 CHANGELOG.md 记录变更
2. 发布前准备 → 自动生成 CHANGELOG，创建发布笔记
3. 版本规划 → 管理 [DEPRECATION-NOTICES.md](../DEPRECATION-NOTICES.md) 的时间表

#### 🔹 **部署工程师**
1. 升级部署 → [UPGRADE-GUIDE.md](../UPGRADE-GUIDE.md) 中的部署环节
2. 回滚计划 → [UPGRADE-GUIDE.md](../UPGRADE-GUIDE.md) 的回滚指南
3. 依赖更新 → [UPGRADE-GUIDE.md](../UPGRADE-GUIDE.md) 的数据兼容性

---

## 自动化工具

### `scripts/generate-changelog.mjs`

从 Git 提交自动生成 CHANGELOG 的"未发布"部分

```bash
# 基础用法
node scripts/generate-changelog.mjs

# 指定版本范围
node scripts/generate-changelog.mjs --from v0.0.3 --to v0.1.0

# 预览不保存
node scripts/generate-changelog.mjs --dry-run
```

**工作原理**：
1. 读取 Git log（`feat:`、`fix:` 等约定前缀）
2. 按类型分类（新增/改进/修复/其他）
3. 生成 Markdown 格式
4. 更新 CHANGELOG.md 的"未发布"部分

### `scripts/create-release-notes.mjs`

基于模板生成发布笔记

```bash
node scripts/create-release-notes.mjs v0.1.0        # 创建文件
node scripts/create-release-notes.mjs v0.1.0 --draft # 仅预览
```

**输出**：
- 创建文件：`docs/releases/v0.1.0-release-notes.md`
- 基于 `RELEASE-NOTES-TEMPLATE.md` 自动填充版本号、日期、对比版本等
- 供维护者手动补充具体内容后发布

---

## 使用场景示例

### 场景 1：发布新版本

```bash
# 1. 确保代码通过测试
npm run verify
npm run build

# 2. 自动生成 CHANGELOG
node scripts/generate-changelog.mjs

# 3. 手动审查和编辑 CHANGELOG.md
# (确保描述清晰、分类正确)

# 4. 创建发布笔记
node scripts/create-release-notes.mjs v0.2.0

# 5. 编辑 docs/releases/v0.2.0-release-notes.md
# (补充性能指标、已知问题等)

# 6. 提交
git add CHANGELOG.md DEPRECATION-NOTICES.md docs/releases/v0.2.0-release-notes.md
git commit -m "chore: prepare release v0.2.0"

# 7. 标记和推送
npm version minor    # v0.1.0 → v0.2.0
git push origin --tags
```

### 场景 2：用户升级遇到问题

1. **检查兼容性** → 查 [UPGRADE-GUIDE.md](../UPGRADE-GUIDE.md) 的浏览器兼容性表
2. **查看升级步骤** → 看该版本的升级路径
3. **常见问题排查** → 查"常见问题"章节
4. **数据迁移** → 了解设置、localStorage 如何自动迁移

### 场景 3：计划弃用某个功能

1. **记录到 DEPRECATION-NOTICES.md**
   - 弃用版本：当前版本
   - 删除版本：2-3 个 minor 版本后
   - 迁移路径：提供代码示例

2. **更新发布笔记**
   - 在 `### ⚠️ 弃用通知` 章节列出

3. **更新升级指南**
   - 在 [UPGRADE-GUIDE.md](../UPGRADE-GUIDE.md) 的相应版本下列出迁移步骤

4. **在代码中打 console.warn**
   ```javascript
   console.warn('⚠️ graph.makeRandom() 已弃用，请改用 graph.seedRandomGenerator()');
   console.warn('详见 https://github.com/user/repo/blob/main/DEPRECATION-NOTICES.md');
   ```

---

## 文件结构

```
D:\xiangmu\Formula Nebula
├── CHANGELOG.md                          ← 完整变更历史
├── RELEASE-NOTES-TEMPLATE.md             ← 发布笔记模板
├── UPGRADE-GUIDE.md                      ← 升级指南
├── DEPRECATION-NOTICES.md                ← 弃用和迁移路径
├── docs/
│   ├── VERSIONING.md                     ← 版本号 & 发布流程
│   ├── CHANGELOG-GUIDE.md                ← 本文件
│   └── releases/
│       ├── v0.1.0-release-notes.md       ← 版本 0.1.0 的发布笔记
│       ├── v0.2.0-release-notes.md       ← 版本 0.2.0 的发布笔记
│       └── ...
└── scripts/
    ├── generate-changelog.mjs            ← 自动生成 CHANGELOG
    └── create-release-notes.mjs          ← 生成发布笔记
```

---

## 最佳实践

### ✅ 推荐

1. **定期更新** — 每个提交时更新 CHANGELOG
2. **清晰的 Git 消息** — 遵循 Conventional Commits 约定
3. **提前规划弃用** — 给用户充分的迁移时间（至少 2 个版本）
4. **完整的发布笔记** — 包括新增、改进、修复、升级步骤、已知问题
5. **自动化检查** — 验证脚本确保版本号、日期一致性
6. **向后兼容** — 除非有充分理由，尽量保留旧 API/字段

### ❌ 避免

1. **事后补充 CHANGELOG** — 容易遗漏，应该日常记录
2. **忽视弃用期** — 直接删除会让用户措手不及
3. **发布笔记不完整** — 缺少升级步骤、已知问题等
4. **手动改 Git tag** — 应该创建新版本而非改写历史
5. **忘记更新 DEPRECATION-NOTICES.md** — 用户需要了解时间表

---

## 常见问题

### Q: CHANGELOG 格式是否严格？

**A**: 遵循 [Keep a Changelog](https://keepachangelog.com/) 约定，但关键是**保持一致**和**清晰**。自动生成脚本会按统一格式输出。

### Q: 发布笔记要怎么写？

**A**: 使用模板（`RELEASE-NOTES-TEMPLATE.md`），然后：
1. 补充新增、改进、修复的具体项
2. 添加性能数据或已知问题（若有）
3. 详细的升级步骤（用户 + 开发者）
4. 确保包含下载链接和反馈渠道

### Q: 如果某个版本弃用时间表有变，怎么办？

**A**: 更新 DEPRECATION-NOTICES.md 和下个版本的发布笔记。变更历史本身可以在 Git log 中看到。

### Q: 预发布版本 (beta/rc) 需要发布笔记吗？

**A**: 可以发布简化笔记（不需要完整的升级步骤），主要说明测试重点和已知问题。

---

## 链接和参考

- [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
- [Semantic Versioning 2.0.0](https://semver.org/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [GitHub Release Management](https://docs.github.com/en/repositories/releasing-projects-on-github)

---

**最后更新**：2026-11-03
**维护者**：[@author](https://github.com/author)
