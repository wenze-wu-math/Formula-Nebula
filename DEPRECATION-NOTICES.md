# 弃用通知

本文档记录所有已弃用、计划弃用、以及即将删除的功能。**每个条目包含时间表、迁移路径和具体代码示例**。

---

## 弃用状态说明

| 状态 | 符号 | 含义 |
|---|---|---|
| **活跃** | ✅ | 正常维护，建议使用 |
| **弃用中** | ⚠️ | 仍可用，但计划移除；建议迁移 |
| **计划弃用** | 📅 | 尚未弃用，但已知未来会移除 |
| **已移除** | ❌ | 不再支持；需要迁移到新方案 |
| **替代品可用** | 🔄 | 有直接替代方案 |

---

## v0.1.0 及以后

### ⚠️ API 端点

| 端点 | 状态 | 弃用版本 | 删除版本 | 替代方案 |
|---|---|---|---|---|
| `graph.oldLayout()` | ⚠️ 弃用中 | v0.1.0 | v0.3.0 | `graph.exponentialDiskRadii()` |
| `/api/legacy/search` | ⚠️ 弃用中 | v0.1.0 | v0.3.0 | `/api/v2/search` |
| `nodeGroup.rebuildLayout()` | 🔄 改名 | v0.1.0 | v0.2.0 | `layoutManager.rebuild()` |

---

## 功能弃用

### 🟠 关键级 —— 会影响可用性

#### `settings.v0` localStorage 格式

**状态**: ⚠️ **弃用中**
**发布版本**: v0.1.0
**自动迁移**: ✅ 是
**删除时间**: v0.3.0 (预计 2026-Q2)

**说明**：
v0.0.x 使用无版本的 `formula-nebula.settings` 键存储用户设置。
新版本改为 `formula-nebula.settings.v1` 并支持结构化迁移。

**旧格式**：
```javascript
localStorage.formula-nebula.settings = JSON.stringify({
  layout: 'spiral',
  glowScale: 2.6,
  …
});
```

**新格式**：
```javascript
localStorage['formula-nebula.settings.v1'] = JSON.stringify({
  layout: 'spiral',
  glowScale: 0.85,
  …
});
```

**迁移路径**：
- ✅ **自动迁移** —— 首次打开 v0.1.0 时自动转换到 v1 格式
- 迁移规则见 `src/settings.js` 的 `MIGRATIONS` 表
- 若要手动清除旧设置：
  ```javascript
  localStorage.removeItem('formula-nebula.settings');
  localStorage.removeItem('formula-nebula.settings.v0');
  ```

**影响范围**：
- 用户设置（形态、取景、颜色）会保留
- 新参数使用新默认值
- 旧参数若被修改过，会按规则迁移（详见 UPGRADE-GUIDE.md）

---

### 🟡 中等级 —— 功能逐步转移

#### 相机机位硬编码配置

**状态**: 📅 **计划弃用** (暂未执行)
**发布版本**: v0.1.0
**计划弃用**: v0.2.0
**删除时间**: v0.3.0

**说明**：
当前相机初始位置、视角、缩放等写死在 `scene.js` 中。
计划迁移到 `vite.config.mjs` 统一配置管理。

**现状** (v0.1.0)：
```javascript
// src/scene.js （硬编码）
const CAMERA = {
  startPos: [0, 115, 155],
  startTilt: 40 * DEG2RAD,
  …
};
```

**计划改动** (v0.2.0+)：
```javascript
// vite.config.mjs （统一配置）
export default {
  define: {
    'VITE_CAMERA': JSON.stringify({
      startPos: [0, 115, 155],
      startTilt: 40 * DEG2RAD,
    })
  }
};
```

**迁移建议**：
- 暂无需立即改动（v0.2.0 前还有 6+ 个月）
- 若要提前适配，在 `scene.js` 改用 `import.meta.env.VITE_CAMERA`
- 与其他硬编码配置（如 `CLUSTER.center`）一起计划迁移

---

### 🟢 低级 —— 工具函数变更

#### `graph.makeRandom(seed)` 函数签名

**状态**: 🔄 **改名**
**改动版本**: v0.1.0
**删除时间**: v0.2.0

**说明**：
函数名改为更清楚的 `graph.seedRandomGenerator(seed)`。

**旧用法**：
```javascript
const rnd = graph.makeRandom(12345);
const val = rnd();
```

**新用法**：
```javascript
const rnd = graph.seedRandomGenerator(12345);
const val = rnd();
```

**兼容层**（v0.1.0 & v0.2.0）：
```javascript
// graph.js 中保留兼容别名
export const makeRandom = seedRandomGenerator;  // 会打 console.warn
```

**何时移除**：
v0.2.0 中删除兼容别名，直接调用 `makeRandom()` 会报错。

---

## 浏览器兼容性弃用

### ❌ IE 11 支持

**状态**: ⚠️ **弃用中，计划完全移除**
**最后支持版本**: v0.1.0 (部分特性已不可用)
**完全删除**: v0.2.0 (预计 2026-Q2)

**现状** (v0.1.0):
- IE 不支持 ES2020、WebGL 2.0、Promise 等必需特性
- 打开页面会显示「浏览器不兼容」提示
- 无法正常使用

**建议**：
用户应升级至：
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**开发者影响**：
v0.2.0 后可以安全使用：
- ES2020+ 语法（不再需要 Babel 降级）
- 移除 IE polyfill 库
- 优化构建输出体积 (~2-5% 减少)

---

## 数据格式弃用

### 关联边第 4 元素（理由字段）

**状态**: ✅ **保留** (不弃用)
**说明**: 虽然新增了第 5 元素（类型），第 4 元素（理由）会一直保留

```javascript
// 格式：[节点A, 节点B, 权重, 理由, 类型]
['hodge-conjecture', 'standard-conjectures', 0.8, '标准猜想蕴含…', 'implies']
//                                                 ^^^^^^^^^^^^^^      ^^^^^^
//                                                  第4元素(保留)      第5元素(新)
```

---

## 弃用日程表

### 完整时间表

```
2024-11 v0.1.0
  ├─ 开始弃用：settings.v0, oldLayout(), IE 11
  └─ 计划弃用：相机硬编码, makeRandom() 别名
     
2025-02 (预期) v0.2.0
  ├─ 删除：makeRandom() 别名
  ├─ 开始弃用：任何其他待定的功能
  └─ 保留但强烈不推荐：IE 支持
     
2025-06 (预期) v0.3.0
  ├─ 删除：settings.v0, oldLayout(), IE 11 支持
  ├─ 删除：相机硬编码（迁移到配置）
  └─ 所有 v0.1.0 弃用项都将移除
```

---

## 迁移指南（按优先级）

### 🔴 立即需要（v0.1.0 用户）

#### 1. 清除旧 localStorage

```javascript
// 浏览器 Console（可选，但推荐）
localStorage.removeItem('formula-nebula.settings');
localStorage.removeItem('formula-nebula.settings.v0');
location.reload();
```

**效果**：系统会用新格式重新初始化设置

#### 2. 更新部署脚本中的端口

```bash
# 旧脚本（preview 和 dev 争抢 5175）
DEV_PORT=5175 npm run dev &
PREVIEW_PORT=5175 npm run preview    # ← 失败

# 新脚本（分开 5175 和 5176）
DEV_PORT=5175 npm run dev &
PREVIEW_PORT=5176 npm run preview    # ✓ 成功
```

### 🟡 计划中（v0.2.0 用户）

#### 1. 更新函数调用

```javascript
// 旧写法（v0.2.0 删除）
const rnd = graph.makeRandom(12345);

// 新写法
const rnd = graph.seedRandomGenerator(12345);
```

#### 2. 审计自定义配置

```javascript
// 若在本地改过这些硬编码值，计划迁移到 vite.config.mjs
// src/scene.js 中的 CAMERA, CLUSTER 配置
// 见 vite.config.mjs.sample 的示例
```

---

## 向后兼容承诺

### 承诺

- **v0.1.x**: 同一 minor 版本内 100% 兼容（z 版本升级无需改代码）
- **v0.x → v1.0**: 提前至少 2 个 minor 版本（e.g., v0.3.0）通知破坏性变更
- **数据持久化**: 用户数据（localStorage 设置、书签等）至少向后兼容 3 个 minor 版本

### 例外

- **安全修复** —— 可能不保证兼容，但会提前 2 周通知
- **严重 BUG** —— 修复优先于兼容性

---

## 反馈和讨论

有关弃用计划的反馈：

- 📝 **提案讨论**：[GitHub Discussions](https://github.com/user/repo/discussions)
- 🐛 **向后兼容问题**：[GitHub Issues](https://github.com/user/repo/issues)
- 📧 **直接反馈**：contact@example.com

---

**最后更新**：2026-11-03
**下次审查**：2026-12-03
**维护者**：[@author](https://github.com/author)
