# 升级指南

完整的跨版本升级说明。**首次升级或跨多个版本升级请从下往上逐个阅读**。

---

## 快速升级检查清单

### 🟢 所有升级都需要

- [ ] 检查[浏览器兼容性](#浏览器兼容性)
- [ ] 清除浏览器缓存（推荐）
- [ ] 刷新页面（硬刷新）
- [ ] 检查 localStorage 中的设置是否保留（见[设置迁移](#设置迁移)）

### 🟡 开发者环境升级

- [ ] 运行 `npm install` 更新依赖
- [ ] 验证构建：`npm run build`
- [ ] 跑验证脚本：`npm run verify`
- [ ] 本地测试：`npm run dev` 启动开发服务器

### 🔴 部署环境升级

- [ ] 备份当前生产环境数据（若有）
- [ ] 在测试环境先行验证
- [ ] 更新部署脚本（如有配置改动）
- [ ] 灰度发布或完整切换
- [ ] 监控错误日志 24 小时

---

## 按版本升级路径

### 从 v0.0.x 升级到 v0.1.0

这是第一个正式版本，包含完整重构。

#### 破坏性变更

| 项目 | 旧版本 | 新版本 | 影响 | 迁移 |
|---|---|---|---|---|
| **端口约定** | dev/preview 共用 5175 | dev 5175, preview 5176 | 脚本连接 | 更新脚本中的 URL |
| **设置存储** | localStorage 无版本 | `v1` 版本控制 | 设置迁移 | 自动迁移，见下 |
| **数据格式** | 303 条定理 | 405 条定理 + 59 条猜想 | 前端和脚本 | 重新下载数据 |
| **链接类型** | 无类型 | 11 种明确类型 + `related` | 可视化 | 无影响（纯增量） |

#### 浏览器端用户

1. **清除存储**
   ```javascript
   // 浏览器开发者工具 → Console，运行：
   localStorage.removeItem('formula-nebula.settings');
   sessionStorage.clear();
   ```

2. **刷新页面**
   - Windows/Linux: `Ctrl+Shift+R`
   - macOS: `Cmd+Shift+R`

3. **首次加载会较慢**（新增 59 条猜想，总计 464 条公式）
   - 预期 3~6 秒烘焙时间
   - 结果会在 localStorage 中缓存，后续操作不再有延迟

#### 开发者升级

1. **依赖更新**
   ```bash
   npm install
   ```

2. **验证新数据**
   ```bash
   npm run check-data      # 检查数据完整性
   npm run verify:proofs   # 校验 LaTeX 与证明
   ```

3. **端口更新**
   ```bash
   # 改 vite.config.js
   const DEFAULT_PORT = 5175;
   const PREVIEW_PORT = 5176;
   
   # 或用环境变量临时覆盖
   $env:NEBULA_PORT=5175; npm run dev
   $env:NEBULA_PREVIEW_PORT=5176; npm run preview
   ```

4. **脚本更新**
   ```bash
   # 所有脚本默认连 http://localhost:5176/
   # 若要改地址，设置 $env:URL
   $env:URL=http://localhost:3000 npm run verify
   ```

---

## 设置迁移规则

### localStorage 自动迁移

**说明**：新版本在读取旧设置时会自动迁移到新格式。迁移遵循以下规则：

| 项 | 旧值 | 新值 | 迁移规则 |
|---|---|---|---|
| `glowScale` | `2.6`（旧默认） | `0.85`（新默认） | 若值恰等于旧默认值 → 替换；否则保留 |
| `layout` | `'spiral'` | 同 | 无变更 |
| `colorMode` | `'family'` | 同 | 无变更 |
| *其他参数* | — | — | 逐位保留 |

**实例**：
- 用户未动过 `glowScale` 滑块 → 读到旧默认 2.6 → 自动升到新默认 0.85 ✓
- 用户把 `glowScale` 调到 2.0 → 保留 2.0（用户的刻意选择） ✓
- 用户把 `glowScale` 调到 2.6（恰好=旧默认） → 升到新默认 0.85（无法区分，采保守） ✓

### 手动重置

若要恢复所有设置到当前版本的默认值：

```javascript
// 浏览器 Console：
localStorage.removeItem('formula-nebula.settings.v1');
location.reload();
```

或在应用内：设置面板 → 右下角「全部恢复默认」

---

## 数据兼容性

### 新增字段

猜想星团引入新数据字段（不影响旧公式）：

```javascript
// 新增到每条猜想
{
  id: 'hodge-conjecture',
  status: 'open',           // 新：未解决/部分解决/已证明/已推翻
  field: 'algebraic',       // 新：所属领域
  year: 1950,               // 新：提出年份
  progress: 2024,           // 新：最新进展年份（可选）
  detail: '…',              // 新：扩展说明
  …
}
```

### 关联边新增字段

```javascript
// 第 5 个元素：关系类型（新）
[nodeA, nodeB, weight, reason, 'implies']
//                            ^^^^^^^^^ 新增
```

**向后兼容**：旧数据（不带第 5 元素）会自动推断为 `'related'`。

---

## 浏览器兼容性

### 支持矩阵

| 浏览器 | 最低版本 | 状态 | 备注 |
|---|---|---|---|
| **Chrome** | 90+ | ✅ 完全支持 | 推荐 120+ |
| **Edge** | 90+ | ✅ 完全支持 | 推荐 120+ |
| **Firefox** | 88+ | ✅ 完全支持 | 推荐 121+ |
| **Safari** | 14+ | ✅ 完全支持 | macOS 11+ / iOS 14+ |
| **Opera** | 76+ | ✅ 完全支持 | 基于 Chromium |
| **IE 11** | — | ❌ 不支持 | 已弃用，见下 |

### 必需功能

所有支持的浏览器都必须有以下功能：

- WebGL 2.0（3D 渲染）
- ES2020（JavaScript 特性）
- localStorage（设置持久化）
- requestAnimationFrame（平滑动画）
- Promise（异步处理）

### 已弃用支持

**IE 11 支持在 v0.2.0 版本中将被移除**。建议用户升级至现代浏览器。

---

## 部署环境升级

### Docker 部署（若有）

```dockerfile
# 旧 Dockerfile
FROM node:16-alpine
…

# 新 Dockerfile
FROM node:18-alpine  # ← 更新 Node.js 版本
…
```

```bash
# 重建镜像
docker build -t formula-nebula:v0.1.0 .
docker run -p 5175:5175 formula-nebula:v0.1.0
```

### Kubernetes 部署（若有）

```yaml
spec:
  containers:
  - name: formula-nebula
    image: formula-nebula:v0.1.0  # ← 更新标签
    ports:
    - containerPort: 5175
    env:
    - name: NODE_ENV
      value: "production"
```

### 环境变量

**新增**（可选）：
```bash
ENABLE_CLUSTER=true        # 启用猜想星团（默认开启）
LINK_TYPES_ENABLED=true    # 启用关系类型着色（默认开启）
```

**已移除**（若之前配置过）：
```bash
# 不再需要
LAYOUT_ALGORITHM=v1
OLD_PORT_MAPPING=true
```

---

## 常见问题

### Q: 升级后页面显示不出来？

**A**: 按以下顺序排查：

1. 打开浏览器开发者工具 (`F12`)
2. 检查 Console 有无红色错误
3. 检查 Network 标签，看资源是否加载
4. **清除缓存并硬刷新** (`Ctrl+Shift+R`)
5. 尝试无痕窗口（排除扩展程序干扰）

若仍有问题，提交 issue 时附上：
- 浏览器版本
- Console 错误信息的截图
- 网络标签中失败请求的详情

### Q: 升级后设置没有保留？

**A**: 这是预期行为。旧版本的设置格式与新版本不兼容。

- 新版本会**自动迁移**大部分设置
- 少数参数因为改了名字或默认值，会恢复为新默认
- 若要恢复旧设置，手动调整滑块或用配置文件

详见[设置迁移](#设置迁移)。

### Q: 脚本连不上服务器？

**A**: 检查端口：

```bash
# 旧版本（都在 5175）
npm run dev        # :5175
npm run preview    # :5175（争抢端口）

# 新版本（分开）
npm run dev        # :5175
npm run preview    # :5176（不争抢）

# 脚本默认连 :5176，若改了，用环境变量覆盖：
$env:URL=http://localhost:5175 npm run verify
```

### Q: 加载很慢？

**A**: 首次加载需要烘焙 464 张公式贴图。

- 预期时间：3~6 秒（取决于硬件）
- 结果缓存在 localStorage，后续切形态/切色不再烘焙
- 若卡在加载页面 > 30 秒，检查浏览器 Console 有无错误

### Q: 某些公式显示不全？

**A**: 这与版本无关，是布局算法的已知限制。

- 整盘视角下约 40 个公式可能被部分遮挡（改前 112 个）
- **解决方案**：单击公式，相机会推近，该公式就能看清
- 或打开设置 → 引力模式，把公式锁在屏幕上

详见 README.md 的「为什么单个字这么小」一节。

---

## 回滚指南

若升级后遇到严重问题，可回滚到上个版本：

### 浏览器回滚

只需在地址栏改版本号（假如用了 CDN 版本控制）：

```javascript
// 旧 URL
https://example.com/formula-nebula/v0.1.0/index.html

// 回滚到
https://example.com/formula-nebula/v0.0.3/index.html
```

### 本地开发回滚

```bash
# 回到上个版本的 tag
git checkout tags/v0.0.3

# 重新安装依赖
rm -rf node_modules package-lock.json
npm install

# 启动
npm run dev
```

---

## 获得帮助

- 📖 **文档**：README.md、脚本注释
- 🐛 **报告 BUG**：[GitHub Issues](https://github.com/user/repo/issues)
- 💬 **讨论**：[GitHub Discussions](https://github.com/user/repo/discussions)
- 📧 **邮件**：contact@example.com

---

**最后更新**：2026-11-03
**维护者**：[@author](https://github.com/author)
