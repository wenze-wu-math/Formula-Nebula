# 发布笔记模板

用于生成版本发布公告。**每次发布前复制此模板，按需填写，发布至 GitHub Releases**。

---

## 发布信息

- **版本**: `v0.x.y`
- **发布日期**: YYYY-MM-DD
- **标签**: `release/v0.x.y`
- **对比**: `v0.(x-1).z...v0.x.y`

---

## 一句话总结

> [一句话描述这个版本的最核心改进或新功能]

例如：
- "修复核心层可读性问题，集成 11 类关系类型标注"
- "支持猜想星团、状态指示、关联寻路"

---

## 主要特性

### ✨ 新增

- **[功能名]** — 一句话说明它是什么、为什么重要
  ```
  详细说明（可选）
  - 支持什么
  - 怎么使用
  ```

### 🔧 改进

- **[改进名]** — 前后对比、性能收益或用户体验提升
  ```
  前：描述旧行为
  后：描述新行为，定量说明改进幅度（如 ×2 倍、−40% 等）
  ```

### 🐛 修复

- **[BUG 名]** — 具体症状、根因、修复方式
  ```
  症状：什么时候会触发、表现是什么
  根因：为什么会这样
  修复：怎么改的
  ```

### ⚠️ 弃用通知

- **[弃用项]** — 何时会移除、迁移路径

### 🔐 安全修复

- **[安全问题]** — CVE/CWE 号（若有）、风险等级、修复摘要

---

## 性能数据（可选）

| 指标 | 前版本 | 本版本 | 改进 |
|---|---|---|---|
| 加载时间（布局） | 450ms | 320ms | ↓ 29% |
| 交互响应 | 120ms | 85ms | ↓ 29% |
| 内存占用 | 128MB | 110MB | ↓ 14% |
| 字体烘焙 | 5.2s | 3.8s | ↓ 27% |

---

## 已知问题

### 🟠 关键问题（建议立即报告）

- **[问题标题]**
  - 复现步骤：
  - 影响范围：
  - 规划修复时间：

### 🟡 中等问题（建议下个版本修复）

- **[问题标题]**
  - 症状：
  - 规划修复版本：

---

## 升级指南

### 对于最终用户

1. **清除缓存**（可选但推荐）
   ```bash
   浏览器开发者工具 → Application → Clear Site Data
   或直接按 Ctrl+Shift+Delete 打开隐私浏览历史
   ```

2. **刷新页面**
   - 硬刷新：`Ctrl+Shift+R` (Windows/Linux) / `Cmd+Shift+R` (macOS)
   - 或者等待 CDN 缓存过期（通常 24 小时内）

3. **检查浏览器兼容性**
   - Chrome/Edge 90+
   - Firefox 88+
   - Safari 14+
   - (不支持 IE)

### 对于开发者

#### 依赖变更

```bash
# 检查依赖是否有新增/移除
npm install

# 如果升级了主要依赖（如 Three.js），需要：
npm run verify      # 跑全部验证脚本
npm run perf        # 量性能指标
```

#### 数据格式变更（若有）

- **新字段**：`[字段名]` 已加到 `/src/data/` 中。旧数据会自动填充默认值
- **删除字段**：`[字段名]` 已移除。相关逻辑转到 `[新位置]`
- **迁移脚本**：运行 `node scripts/migrate-data.mjs` 转换旧格式

#### 环境变量（若有）

添加或修改的环境变量（`.env` 或 `vite.config.mjs`）：

```bash
# 新增
ENABLE_NEW_FEATURE=true
API_TIMEOUT=5000

# 已弃用（可选保留以兼容，下版本移除）
# OLD_SETTING=value
```

#### 部署变更（若有）

- 构建输出目录：`dist/` → `build/` （需更新部署脚本）
- 新增环境：`staging` 环境支持 A/B 测试功能
- 运行时要求：Node.js 18.0+ （之前支持 16.0+）

#### 配置文件迁移（若有）

旧文件 → 新文件的对应关系：

```bash
# 自动迁移（运行 migrate 脚本自动处理）
src/config/old.js → src/config/new.js

# 手动迁移（需改配置的项目）
vite.config.js    → vite.config.mjs (模块格式)
```

---

## 弃用日程

### 本版本中弃用

| 弃用项 | 理由 | 替代方案 | 移除时间 |
|---|---|---|---|
| `graph.oldLayout()` | 被 `graph.newLayout()` 替代 | 改用 `graph.newLayout()` | v0.3.0 |
| `settings.v0` | 设置格式升级 | 自动迁移至 `settings.v1` | v0.3.0 |

### 后续版本的弃用计划

- **v0.2.0**：弃用 `API.old_endpoint`（迁移指南详见[这里](#迁移指南)）
- **v0.3.0**：删除上述弃用项，移除 IE 支持

---

## 致谢

感谢以下贡献者的参与（按字母序）：

- [@contributor1](https://github.com/contributor1) — 功能开发
- [@contributor2](https://github.com/contributor2) — BUG 修复
- 以及所有提交 issue 和 PR 的社区成员！

---

## 下载

**浏览器打开直接使用**（无需下载）：
- **生产环境**：https://example.com/formula-nebula
- **测试环境**：https://staging.example.com/formula-nebula

**源代码**：
- [Source code (zip)](https://github.com/user/repo/archive/refs/tags/v0.x.y.zip)
- [Source code (tar.gz)](https://github.com/user/repo/archive/refs/tags/v0.x.y.tar.gz)

---

## 反馈 & 报告问题

- 🐛 **报告 BUG**：[GitHub Issues](https://github.com/user/repo/issues)
- 💬 **讨论功能**：[GitHub Discussions](https://github.com/user/repo/discussions)
- 📧 **联系我们**：contact@example.com

---

**上个版本**：[v0.(x-1).z](https://github.com/user/repo/releases/tag/v0.(x-1).z)
**下个版本**：计划于 YYYY-MM-DD
