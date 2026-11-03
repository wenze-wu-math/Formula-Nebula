# 故障排除指南 · Troubleshooting Guide

这是一份完整的故障排除指南，帮助您快速诊断和解决 Formula Nebula 的各种问题。

---

## 目录 · Table of Contents

- [快速诊断流程](#快速诊断流程)
- [五大常见问题快速修复](#五大常见问题快速修复)
- [系统性故障排查](#系统性故障排查)
- [调试工具和命令](#调试工具和命令)
- [获取帮助](#获取帮助)

---

## 快速诊断流程

使用这个流程来快速定位您的问题：

```
START
  ↓
[问题类型]
  ├─ 安装/启动问题 → 流程 A
  ├─ 渲染/显示问题 → 流程 B
  ├─ 数据/功能问题 → 流程 C
  ├─ 性能问题 → 流程 D
  └─ 部署问题 → 流程 E
```

### 流程 A：安装/启动问题

```
START: npm install / npm run dev 失败
  ↓
[错误信息中包含...]
  ├─ "EACCES" → 权限问题（参考下面的修复）
  ├─ "ENOENT" → 文件缺失（运行 git status）
  ├─ "不兼容的 Node 版本" → 升级 Node.js
  ├─ "找不到 Python" → 安装 Python
  └─ "其他错误" → 查看完整错误日志
```

**快速修复**：
```bash
# 第 1 步：清除旧的依赖
rm -rf node_modules package-lock.json

# 第 2 步：重新安装
npm install

# 第 3 步：验证安装
npm run check-data

# 第 4 步：启动
npm run dev
```

### 流程 B：渲染/显示问题

```
START: 页面黑屏/显示不正常
  ↓
[检查...]
  ├─ 浏览器控制台有错误吗？ 
  │   ├─ 是 → 查看错误信息，搜索相关章节
  │   └─ 否 → 检查浏览器兼容性
  ├─ WebGL 是否支持？
  │   ├─ 否 → 使用软件渲染或更换浏览器
  │   └─ 是 → 继续
  └─ GPU 驱动是否最新？
      ├─ 是 → 硬刷新浏览器（Ctrl+Shift+Delete）
      └─ 否 → 更新显卡驱动
```

**快速修复**：
```bash
# 第 1 步：硬刷新浏览器
Ctrl+Shift+Delete
# 选择"全部时间"并清除

# 第 2 步：在浏览器控制台检查
F12 → Console → 查找 RED 错误

# 第 3 步：如果是着色器错误
npm run clean
npm run build
npm run preview
```

### 流程 C：数据/功能问题

```
START: 数据不显示/功能不工作
  ↓
[问题...]
  ├─ 公式没有显示 → 数据加载失败
  ├─ 搜索返回错误 → 查询语法错误
  ├─ 连线混乱 → 数据一致性问题
  └─ 其他 → 检查数据文件
```

**快速修复**：
```bash
# 第 1 步：验证数据
npm run check-data
npm run verify

# 第 2 步：检查是否有验证错误
npm run verify:proofs

# 第 3 步：如果有错误，查看详细信息
npm run verify 2>&1 | tee verify-output.log
# 查看 verify-output.log
```

### 流程 D：性能问题

```
START: 页面很慢/卡顿
  ↓
[测试...]
  ├─ 首次加载 > 10 秒？
  │   ├─ 是 → 网络问题或 CPU 不足
  │   └─ 否 → 继续
  ├─ 旋转/缩放 FPS < 30？
  │   ├─ 是 → GPU 不足，降低质量
  │   └─ 否 → 继续
  └─ 使用 30 分钟后变慢？
      ├─ 是 → 内存泄漏
      └─ 否 → 完成
```

**快速修复**：
```bash
# 第 1 步：测试性能
npm run perf

# 第 2 步：本地构建优化
npm run build --no-sourcemap

# 第 3 步：降低渲染质量（在应用中）
设置 → 参数 → 关闭 bloom 效果
```

### 流程 E：部署问题

```
START: Vercel/Netlify 部署失败
  ↓
[检查...]
  ├─ 构建日志中有错误吗？ → 查看错误
  ├─ 环境变量正确吗？ → 检查 Dashboard
  ├─ 超时吗？ → 增加超时时间
  └─ 其他 → 检查部署配置
```

**快速修复**：
```bash
# 第 1 步：本地验证构建
npm run build
npm run preview

# 第 2 步：查看构建日志
# 访问 Dashboard → Deployments → 点击失败的部署

# 第 3 步：检查配置文件
cat vercel.json
cat netlify.toml
```

---

## 五大常见问题快速修复

### 问题 1：`npm install` 失败

**症状**：安装时出现错误

**一行修复**：
```bash
rm -rf node_modules package-lock.json && npm cache clean --force && npm install
```

**如果仍失败**：
```bash
# 使用 nvm 重新安装 Node.js
nvm install 18
nvm use 18
npm install
```

---

### 问题 2：端口被占用（无法启动 npm run dev）

**症状**：`Error: listen EADDRINUSE :::5175`

**一行修复**（Windows）：
```powershell
netstat -ano | findstr :5175 | findstr LISTENING | awk '{print $5}' | xargs -I {} taskkill /PID {} /F
npm run dev
```

**一行修复**（Mac/Linux）：
```bash
lsof -ti:5175 | xargs kill -9 2>/dev/null; npm run dev
```

**或改用不同端口**：
```bash
$env:NEBULA_PORT=6000; npm run dev
```

---

### 问题 3：黑屏或无法渲染

**症状**：打开应用只看到黑屏

**一行修复**：
```bash
# 硬刷新
Ctrl+Shift+Delete  # 清除所有缓存
# 然后重新访问应用
```

**如果仍不工作**：
```javascript
// 在浏览器控制台运行
localStorage.clear()
sessionStorage.clear()
location.reload(true)
```

---

### 问题 4：MathJax 加载超时

**症状**：加载卡在 30-50% 不动

**一行修复**：
```bash
# 等待 10 秒后，如果仍卡住，尝试
Ctrl+R  # 刷新
# 或 Ctrl+Shift+R  # 硬刷新
```

**或调大超时时间**：

编辑 `src/loader/mathLoader.js`：
```javascript
const TIMEOUT = 30000;  // 改为 60000 (60 秒)
```

---

### 问题 5：部署后 API 请求 404

**症状**：部署到 Vercel/Netlify 后数据加载失败

**快速检查清单**：
```bash
# 1. 检查数据文件是否在 src/data/
ls src/data/

# 2. 检查构建是否包含了数据
npm run build
grep "404" dist/assets/*.js || echo "未找到 404，可能是网络问题"

# 3. 检查部署配置
cat vercel.json 或 cat netlify.toml

# 4. 在 Dashboard 中重新部署
# Vercel 或 Netlify → Deployments → Redeploy
```

---

## 系统性故障排查

### 检查清单 1：环境验证

运行这个脚本验证你的环境：

```bash
# 检查 Node.js 版本
node -v  # 应该 >= 18.0.0

# 检查 npm 版本
npm -v  # 应该 >= 9.0.0

# 检查 git
git --version

# 检查 Python（如果需要编译原生模块）
python --version  # 应该 >= 3.10

# 检查 GPU 支持
node -e "const c = require('os').cpus(); console.log('CPU:', c[0].model); console.log('核心数:', c.length)"
```

**预期输出**：
```
v18.12.0  ✅ Node.js 足够新
9.1.2     ✅ npm 足够新
git version 2.38.0  ✅ git 已安装
```

---

### 检查清单 2：项目完整性

```bash
# 检查是否在项目根目录
ls package.json  # 应该存在

# 检查关键文件
ls src/index.jsx
ls src/scene.js
ls src/data/

# 检查 git 状态
git status
git log --oneline | head -5
```

---

### 检查清单 3：浏览器状态

打开开发者工具（F12）并检查：

**Console 标签**：
```javascript
// 运行这些命令检查状态

// 1. 检查 Three.js
typeof THREE !== 'undefined' ? '✅ Three.js 加载' : '❌ Three.js 未加载'

// 2. 检查 WebGL
(() => {
  const c = document.createElement('canvas');
  const gl = c.getContext('webgl');
  return gl ? '✅ WebGL 支持' : '❌ WebGL 不支持';
})()

// 3. 检查 localStorage
typeof localStorage !== 'undefined' ? '✅ localStorage 可用' : '❌ localStorage 不可用'

// 4. 查看缓存大小
Object.keys(localStorage).length + ' 个 localStorage 项'
```

**Network 标签**：
```
检查这些资源是否成功加载（状态 200）：
- /index.html
- /dist/assets/index.*.js
- /dist/assets/index.*.css
- 数据 JSON 文件

如果任何一个显示 404/500，可能是构建问题
```

**Storage 标签**：
```
检查 localStorage 中是否有：
- formula-nebula.settings.v1
- (其他缓存数据)

如果不存在，可能是第一次加载
```

---

### 检查清单 4：文件系统

```bash
# 检查重要目录是否存在
ls -la src/          # 源代码
ls -la public/       # 静态资源
ls -la src/data/     # 数据文件

# 检查文件是否有效
file src/data/theorems.js
# 应该显示 "ASCII text" 或 "UTF-8 Unicode text"

# 检查 JSON 文件语法
node -e "JSON.parse(require('fs').readFileSync('src/data/theorems.js', 'utf8'))" && echo "✅ JSON 语法有效" || echo "❌ JSON 语法错误"
```

---

### 检查清单 5：构建输出

```bash
# 查看构建产物
ls -lh dist/

# 检查文件大小（应该合理，不能是 0 字节）
du -sh dist/assets/

# 查看构建日志
npm run build 2>&1 | tee build.log
tail -50 build.log  # 查看最后 50 行
```

---

## 调试工具和命令

### 内置验证脚本

```bash
# 检查数据一致性
npm run check-data

# 完整的项目验证
npm run verify

# 验证证明页数据
npm run verify:proofs

# 验证关系类型
npm run verify:types

# 验证设置
npm run verify:settings

# 验证形状
npm run verify:shapes

# 验证性能
npm run perf

# 验证可读性
npm run check-legibility
```

---

### 本地调试命令

```bash
# 启动开发服务器（支持热重载）
npm run dev

# 构建生产版本
npm run build

# 预览构建产物
npm run preview

# 清除所有构建和缓存
npm run clean

# 格式化代码（ESLint）
npm run lint

# 自动修复格式问题
npm run lint:fix
```

---

### 浏览器控制台命令

```javascript
// 清除所有缓存
localStorage.clear()
sessionStorage.clear()
indexedDB.databases().then(dbs => dbs.forEach(db => indexedDB.deleteDatabase(db.name)))
location.reload(true)

// 获取调试信息
console.log({
  url: window.location.href,
  userAgent: navigator.userAgent,
  storage: {
    localStorage: localStorage.length,
    sessionStorage: sessionStorage.length
  },
  webgl: !!document.querySelector('canvas').getContext('webgl')
})

// 测试性能
console.time('load')
// ... 做某些事 ...
console.timeEnd('load')

// 查看内存使用
performance.memory
```

---

### 日志收集

如果要报告 bug，收集这些信息：

```bash
# 1. 系统信息
uname -a > system-info.txt
npm version >> system-info.txt

# 2. 构建日志
npm run build 2>&1 | tee build-output.log

# 3. 验证输出
npm run verify 2>&1 | tee verify-output.log

# 4. 浏览器控制台错误（手动复制粘贴）
# F12 → Console → 复制所有错误信息

# 5. 压缩并共享
tar czf debug-info.tar.gz system-info.txt build-output.log verify-output.log
```

---

## 获取帮助

### 提报问题的最佳实践

当提交 GitHub Issue 时，请包含：

1. **环境信息**：
   ```
   - 操作系统：Windows/Mac/Linux
   - Node.js 版本：v18.x
   - npm 版本：9.x
   - 浏览器：Chrome/Firefox/Safari
   ```

2. **问题描述**：
   - 出现了什么问题？
   - 何时开始出现的？
   - 能重现吗？

3. **复现步骤**：
   ```
   1. 打开应用
   2. 点击 X
   3. 观察到...
   ```

4. **预期行为**：
   ```
   应该...
   ```

5. **实际行为**：
   ```
   实际上...
   ```

6. **错误日志**：
   - 浏览器控制台的完整错误
   - 构建或运行时的完整错误日志

7. **截图/视频**：如适用

---

### 何时联系维护者

**快速处理**（通常 24 小时内回复）：
- 严重 bug（黑屏、无法运行）
- 安全问题
- 数据损坏

**中等优先级**（通常 3-7 天）：
- 功能请求
- 性能问题
- 文档问题

**低优先级**（通常 > 2 周）：
- 讨论和建议
- 一般问题

---

### 资源链接

- 📖 **完整文档**：[docs/](./docs/)
- 🐛 **报告问题**：[GitHub Issues](https://github.com/wenze-wu-math/Formula-Nebula/issues)
- 💬 **讨论**：[GitHub Discussions](https://github.com/wenze-wu-math/Formula-Nebula/discussions)
- 👥 **贡献者指南**：[CONTRIBUTOR-PATH.md](./CONTRIBUTOR-PATH.md)
- 🎓 **初学者指南**：[BEGINNER_GUIDE.md](./BEGINNER_GUIDE.md)
- ❓ **常见问题**：[FAQ.md](./FAQ.md)

---

## 快速参考卡

### 常用命令速查表

| 命令 | 用途 |
|------|------|
| `npm install` | 安装依赖 |
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 生产构建 |
| `npm run preview` | 预览构建 |
| `npm run verify` | 完整验证 |
| `npm run check-data` | 检查数据 |
| `npm run perf` | 性能测试 |
| `npm run clean` | 清除缓存 |

### 常用快捷键速查表

| 按键 | 效果 |
|------|------|
| `Ctrl+R` / `Cmd+R` | 刷新页面 |
| `Ctrl+Shift+R` / `Cmd+Shift+R` | 硬刷新 |
| `F12` / `Cmd+Option+I` | 打开开发者工具 |
| `Ctrl+Shift+Delete` | 打开清除缓存 |
| `Esc` | 关闭设置面板/搜索 |
| `S` | 打开设置面板 |

---

**最后更新**：2026 年 11 月  
**下一次更新计划**：2026 年 12 月

