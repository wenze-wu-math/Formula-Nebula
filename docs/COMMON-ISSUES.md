# 常见问题解答 · Common Issues Reference

本文档收集了用户和开发者遇到的常见问题及其解决方案。

---

## 目录 · Table of Contents

- [安装和设置问题](#安装和设置问题)
- [运行时错误](#运行时错误)
- [渲染和显示问题](#渲染和显示问题)
- [数据相关问题](#数据相关问题)
- [搜索和查询问题](#搜索和查询问题)
- [性能问题](#性能问题)
- [浏览器兼容性](#浏览器兼容性)
- [部署问题](#部署问题)

---

## 安装和设置问题

### 问题 1：`npm install` 失败，出现"EACCES"错误

**症状**：
```
npm ERR! code EACCES
npm ERR! syscall mkdir
npm ERR! path /usr/local/lib/node_modules
```

**原因**：权限不足

**解决方案**：

**方案 A：使用 sudo（快速但不推荐）**
```bash
sudo npm install -g
```

**方案 B：修复 npm 权限（推荐）**
```bash
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
export PATH=~/.npm-global/bin:$PATH
```

**方案 C：使用 nvm（最佳）**
```bash
# 安装 nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc

# 安装 Node.js
nvm install 18
nvm use 18

# 现在使用 npm
npm install
```

---

### 问题 2：Node.js 版本不兼容

**症状**：
```
npm ERR! The engine "node" is incompatible with this package.
npm ERR! Expected version ">=18.0.0 but got v16.13.0"
```

**原因**：Node.js 版本过旧

**解决方案**：

**检查版本**：
```bash
node --version  # 应该是 v18.0.0 或更高
```

**升级 Node.js**：

**Windows**：
- 从 [nodejs.org](https://nodejs.org) 下载最新版本
- 运行安装程序

**Mac**：
```bash
brew upgrade node
# 或使用 nvm
nvm install 18
nvm use 18
```

**Linux**：
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nodejs npm

# 或使用 nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
```

---

### 问题 3：缺少 Python（Windows 特定）

**症状**：
```
gyp ERR! build error
gyp ERR! Python executable not found in PATH
```

**原因**：需要 Python 来编译某些原生模块

**解决方案**：
```bash
# 安装 Python 3.10+
# 从 https://www.python.org/downloads/ 下载

# 或使用 Windows 包管理器
choco install python

# 或使用 Microsoft Store
# 搜索"Python"并安装
```

---

### 问题 4：`.git` 文件夹损坏

**症状**：
```
fatal: Not a git repository
fatal: 'origin' does not appear to be a 'git' repository
```

**原因**：Git 配置受损

**解决方案**：

**快速修复**：
```bash
# 删除 node_modules 和 package-lock.json
rm -rf node_modules package-lock.json

# 重新初始化 git
git init
git remote add origin https://github.com/wenze-wu-math/Formula-Nebula.git
git pull origin main

# 重新安装依赖
npm install
```

**完全重置**：
```bash
git clean -fd
git reset --hard HEAD
git pull origin main
npm install
```

---

## 运行时错误

### 问题 5：启动时 `Cannot find module` 错误

**症状**：
```
Error: Cannot find module 'three'
```

**原因**：依赖未正确安装

**解决方案**：

```bash
# 清理并重新安装
rm -rf node_modules package-lock.json
npm install

# 或只安装特定包
npm install three

# 如果仍然失败
npm cache clean --force
npm install
```

---

### 问题 6：Vite 服务器启动失败

**症状**：
```
Error: listen EADDRINUSE :::5175
```

**原因**：端口已被占用

**解决方案**：

**查看占用端口的进程**：

**Windows**：
```powershell
netstat -ano | findstr :5175
taskkill /PID <PID> /F
```

**Mac/Linux**：
```bash
lsof -i :5175
kill -9 <PID>
```

**改用不同端口**：
```bash
# 环境变量方式
$env:NEBULA_PORT=6000; npm run dev  # PowerShell

set NEBULA_PORT=6000 && npm run dev  # CMD
```

**或编辑 vite.config.js**：
```javascript
export default {
  server: {
    port: 6000
  },
  preview: {
    port: 6001
  }
}
```

---

### 问题 7：MathJax 渲染超时

**症状**：
```
MathJax rendering timeout: formula not rendered
Loading stuck at X%
```

**原因**：网络慢或系统资源不足

**解决方案**：

**方案 1：等待（正常情况下 3-6 秒）**
```
首次加载会比较慢，之后会缓存结果
```

**方案 2：检查网络**
```bash
# 检查网络连接
ping cdn.jsdelivr.net

# 如果 CDN 慢，考虑本地化
# 编辑 vite.config.js 中的 MathJax 配置
```

**方案 3：清除浏览器缓存**
- 按 `F12` 打开开发者工具
- 右键刷新按钮 → 清空缓存并硬刷新
- 或 `Ctrl+Shift+Delete`

**方案 4：增加超时时间**

编辑 `src/loader/mathLoader.js`：
```javascript
const TIMEOUT = 30000;  // 改为更大的值
```

---

### 问题 8：ThreeJS 着色器编译错误

**症状**：
```
ShaderError: THREE.ShaderLib is undefined
或 GLSL compilation error
```

**原因**：GLSL 语法错误或 Three.js 版本不匹配

**解决方案**：

**检查 Three.js 版本**：
```bash
npm list three
# 应该是 r140+
```

**清除着色器缓存**：
```bash
# 浏览器缓存
localStorage.clear()
sessionStorage.clear()

# 或删除本地构建
rm -rf dist/
npm run build
```

**检查着色器代码**：
- 着色器文件位于 `src/shaders/`
- 查看浏览器控制台的详细错误信息
- 在 [Three.js 文档](https://threejs.org/docs/) 中查找正确的语法

---

## 渲染和显示问题

### 问题 9：公式渲染后文字模糊或缺失

**症状**：
- 字体像素化或模糊
- 某些字符不显示
- LaTeX 公式部分丢失

**原因**：纹理分辨率不足或字体问题

**解决方案**：

**增加纹理分辨率**：

编辑 `src/glyph.js`：
```javascript
const TEXTURE_SIZE = 2048;  // 从 1024 改为 2048
const GLYPH_SCALE = 3;      // 增加到 4 或 5
```

**清除缓存并重建**：
```bash
npm run build
# 删除浏览器缓存
# 重新加载
```

**检查字体文件**：
```bash
# 确保字体文件存在于 public/fonts/
ls public/fonts/
```

---

### 问题 10：三维视图显示黑屏

**症状**：
- 打开应用只看到黑屏
- 或偶现黑屏闪烁

**原因**：渲染器初始化失败或 GPU 不支持

**解决方案**：

**检查浏览器控制台**：
- 按 `F12` 打开开发者工具
- 查看 Console 标签的错误信息

**检查 GPU 支持**：
```javascript
// 在控制台运行
const canvas = document.createElement('canvas');
const gl = canvas.getContext('webgl');
console.log(gl ? 'WebGL 支持' : 'WebGL 不支持');
```

**启用软件渲染**（如果 GPU 不支持）：

编辑 `src/scene.js`：
```javascript
const renderer = new THREE.WebGLRenderer({
  powerPreference: 'low-power',
  antialias: false  // 关闭抗锯齿加速
});
```

**更新显卡驱动**：
- NVIDIA：[nvidia.com/download](https://www.nvidia.com/download/driverDetails.aspx)
- AMD：[amd.com/drivers](https://www.amd.com/drivers)
- Intel：[ark.intel.com](https://ark.intel.com/)

---

### 问题 11：星云旋转/缩放不顺滑

**症状**：
- 鼠标拖拽时有卡顿
- 缩放不流畅，有掉帧

**原因**：性能不足或浏览器设置问题

**解决方案**：

**降低渲染质量**：

设置面板 → 参数 → 降低分辨率或关闭某些效果：
- 关闭"后处理辉光"
- 关闭"深空星点"
- 降低"公式浮动"

**关闭后台标签页**：
- 其他浏览器标签页会竞争 GPU 资源

**使用硬件加速**：
- Chrome：设置 → 高级 → 系统 → 开启硬件加速

**清理浏览器缓存**：
```bash
# 按 Ctrl+H 打开历史记录
# 清除所有时间段的缓存
# 重启浏览器
```

---

### 问题 12：设置面板无法拖动或点击

**症状**：
- 点击设置选项无反应
- 无法拖动面板位置

**原因**：JavaScript 事件处理失败或 CSS 问题

**解决方案**：

**硬刷新浏览器**：
```bash
Ctrl+Shift+Delete  # 打开清除缓存对话框
# 选择"全部时间"
# 清除所有数据
```

**检查浏览器控制台**：
- 按 `F12` → Console
- 查看是否有 JavaScript 错误

**禁用浏览器扩展**：
- 某些扩展（如 uBlock Origin）可能干扰
- 尝试在无痕模式下打开

---

## 数据相关问题

### 问题 13：数据加载失败或不完整

**症状**：
```
Failed to load data
Only X formulas loaded (expected 405)
```

**原因**：数据文件损坏或网络问题

**解决方案**：

**检查数据文件**：
```bash
# 验证 JSON 语法
npm run check-data

# 运行完整验证
npm run verify
```

**修复损坏的数据**：
```bash
# 从 GitHub 重新获取
git checkout src/data/

# 或重新安装
npm install
npm run build
```

**检查网络连接**：
```bash
# 查看网络请求
# 按 F12 → Network
# 刷新页面，查看失败的请求
```

---

### 问题 14：新添加的公式不显示

**症状**：
- 在数据文件中添加了新公式
- 但应用中看不到

**原因**：缓存未更新或数据验证失败

**解决方案**：

**清除缓存并重建**：
```bash
npm run clean
npm run build
npm run preview
```

**验证数据语法**：
```bash
npm run check-data

# 检查是否有错误
# 修复格式错误
```

**检查构建产物**：
```bash
# 确保新数据被编译进去
grep "你的公式名称" dist/assets/*.js

# 如果不存在，重新构建
npm run build
```

---

### 问题 15：关联（edges）损坏或混乱

**症状**：
- 连线指向错误的公式
- 搜索返回不相关的结果
- 寻路失败

**原因**：数据一致性问题

**解决方案**：

**验证关联数据**：
```bash
npm run verify
# 查看具体的验证失败

npm run verify:proofs
# 验证证明数据
```

**修复数据**：
```bash
# 检查 src/data/edges.js
# 确保所有引用都指向存在的公式 ID
# 格式：[源ID, 目标ID, 权重, 理由文本, 关系类型]
```

**从备份恢复**：
```bash
git checkout HEAD -- src/data/
# 或
git log --oneline -- src/data/
git show <commit>:src/data/edges.js > src/data/edges.js.bak
```

---

## 搜索和查询问题

### 问题 16：搜索没有返回结果

**症状**：
```
未找到"某个关键词"
搜索结果为空
```

**原因**：搜索语法错误或数据不包含该词

**解决方案**：

**检查拼写**：
- 中文：确保汉字正确
- 英文：大小写敏感（通常不区分）
- LaTeX：确保转义正确（如 `\alpha` 而不是 `alpha`）

**使用字段查询**：
```
status:open      (只搜猜想)
family:geometry  (只搜某族)
importance:>0.9  (重要度高于 0.9)
```

**尝试子串查询**：
```
霍      (搜索"霍奇猜想"只需输入"霍")
Hodge   (搜索"Hodge conjecture"只需输入"Hodge")
```

**检查是否已过滤**：
- 某个搜索过滤可能隐藏了结果
- 点击"清除过滤"或按 `Esc`

---

### 问题 17：寻路（pathfinding）不工作

**症状**：
```
A -> B: 未找到路径
或 路径结果明显不合理
```

**原因**：网络断开或查询语法错误

**解决方案**：

**检查查询语法**：
```
正确：A -> B（有空格）
错误：A->B（没空格）或 A > B（单个箭头）
```

**验证节点存在**：
- 先单独搜索 A 和 B，确认它们存在

**检查网络连通性**：
```bash
npm run verify:graph
# 验证图的连通性
# 应该显示"1 个连通分量"
```

**尝试加权 vs 非加权**：
- 默认是加权（最强关联）
- 关闭加权可以查找最短路径

---

### 问题 18：过滤条件无效

**症状**：
```
status:open 没有过滤出猜想
或 is:theorem 返回了错误的结果
```

**原因**：字段名拼写或值不正确

**解决方案**：

**使用正确的字段名**：
```bash
有效字段：family, status, field, id, name, en, latex, 
         importance, degree, rank, cluster, is

例如：
status:open           ✅ 有效
status:unresolved     ❌ 错误（应该是 open）

is:conjecture         ✅ 有效
is:guess              ❌ 错误（应该是 conjecture）
```

**组合条件**：
```
(family:geometry OR family:layer) AND status:open
# 前后必须有空格，OR 必须大写
```

---

## 性能问题

### 问题 19：加载时间过长（>10 秒）

**症状**：
```
加载进度条卡在 X%
或 整个页面响应缓慢
```

**原因**：网络慢、CPU 不足或浏览器问题

**解决方案**：

**检查网络速度**：
```bash
# 在浏览器开发者工具中查看 Network 标签
# 查看每个资源的加载时间
# 如果 > 1MB 的资源加载 > 10 秒，可能是网络问题
```

**优化本地运行**：
```bash
# 关闭 source maps（生产环境）
npm run build --no-sourcemap

# 或在 vite.config.js 中
build: {
  sourcemap: false
}
```

**清除浏览器缓存**：
```bash
# 完全清除 localStorage
# F12 → Console → 输入：
localStorage.clear()
location.reload()
```

**禁用浏览器扩展**：
- 某些扩展会减慢加载速度
- 在无痕模式下测试

---

### 问题 20：帧率低（动画卡顿）

**症状**：
```
FPS 显示 < 30（应该是 60）
自转/旋转卡顿
```

**原因**：GPU 不足、渲染质量太高或后台进程占用

**解决方案**：

**降低渲染质量**：
- 设置 → 参数 → 关闭以下选项：
  - 后处理辉光
  - 盘面辉光
  - 深空星点
  - 公式浮动

**降低分辨率**：
```javascript
// src/scene.js
renderer.setPixelRatio(window.devicePixelRatio * 0.75);
// 从 1.0 改为 0.75
```

**关闭浏览器其他标签页**：
- 其他标签页竞争 GPU 资源

**检查硬件加速**：
- Chrome 设置 → 高级 → 系统 → 启用硬件加速

**重启浏览器**：
```bash
完全关闭浏览器（包括后台进程）
重新打开
```

---

### 问题 21：内存不断增长（内存泄漏）

**症状**：
```
使用 30 分钟后页面变得很慢
DevTools 内存图表不断上升
```

**原因**：资源未正确释放

**解决方案**：

**检查内存泄漏**：
- 按 `F12` → Memory 标签
- 点击"Take snapshot"拍摄快照
- 比较两个快照
- 查看增长最多的对象

**强制垃圾回收**：
```javascript
// 浏览器控制台
if (window.gc) gc();
```

**重启浏览器**：
```bash
定期重启浏览器可以释放内存
```

---

## 浏览器兼容性

### 问题 22：在 Safari 上不工作

**症状**：
```
页面空白或错误信息
或 功能不完整
```

**原因**：Safari 对某些特性的支持不完善

**解决方案**：

**检查 Safari 版本**：
```
需要 Safari 15+
如果更旧，需要更新 macOS 或 iOS
```

**启用必要的功能**：
- Safari 设置 → 隐私 → 启用"防止跨站追踪"（可选）

**清除 Safari 缓存**：
- Safari → 开发 → 清空缓存
- 或 Safari 偏好设置 → 隐私 → 管理网站数据

**使用 Chrome 替代**：
- 许多问题在 Chrome 中不会出现
- 可以用 Chrome 进行完整体验

---

### 问题 23：在 Firefox 上显示不正常

**症状**：
```
颜色偏差或效果不显示
或 性能比 Chrome 差
```

**原因**：Firefox 对 WebGL 的支持与 Chrome 略有不同

**解决方案**：

**更新 Firefox**：
```
需要 Firefox 90+
检查：菜单 → 帮助 → 关于 Firefox
```

**启用 WebGL**：
```
about:config
搜索 webgl
将 webgl.enabled 设置为 true
```

**禁用某些扩展**：
- 某些隐私扩展可能干扰 WebGL
- 尝试禁用后测试

---

### 问题 24：在 IE11 不工作

**症状**：
```
页面无法加载
或 显示"浏览器不支持"
```

**原因**：IE11 太旧，不支持 ES6+

**解决方案**：

**升级浏览器**：
- IE 已停止支持
- 使用 Edge、Chrome、Firefox 等现代浏览器

---

## 部署问题

### 问题 25：Vercel 部署后 API 请求失败

**症状**：
```
部署到 Vercel 后数据加载失败
或 出现 CORS 错误
```

**原因**：环境配置不正确

**解决方案**：

**检查 CORS 配置**：

在 `vercel.json` 中配置：
```json
{
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {"key": "Access-Control-Allow-Origin", "value": "*"},
        {"key": "Access-Control-Allow-Methods", "value": "GET, POST"},
        {"key": "Access-Control-Allow-Headers", "value": "Content-Type"}
      ]
    }
  ]
}
```

**检查环境变量**：
```bash
# 在 Vercel Dashboard 中设置环境变量
# Settings → Environment Variables
```

---

### 问题 26：Docker 构建失败

**症状**：
```
docker build 出错
或 dockerfile 语法错误
```

**原因**：依赖缺失或 Docker 版本不兼容

**解决方案**：

**检查 Dockerfile**：
```dockerfile
# 确保 base image 存在且正确
FROM node:18-alpine

# 清除缓存
RUN npm cache clean --force
```

**重新构建**：
```bash
docker build --no-cache -t formula-nebula:latest .
```

**查看构建日志**：
```bash
docker build -t formula-nebula:latest . 2>&1 | tee build.log
# 查看 build.log 找出具体错误
```

---

### 问题 27：Netlify 部署构建超时

**症状**：
```
Build timeout - Build exceeded 15 minutes
```

**原因**：`npm run build` 耗时过长

**解决方案**：

**在 netlify.toml 中增加超时**：
```toml
[build]
command = "npm run build"
publish = "dist"
timeout = 300  # 5 分钟
```

**优化构建过程**：
```bash
# 跳过某些验证脚本
npm run build -- --skip-verify

# 只编译生产代码
NODE_ENV=production npm run build
```

---

## 更多资源

- 📖 完整文档：[docs/](./docs/)
- 🐛 提报 bug：[GitHub Issues](https://github.com/wenze-wu-math/Formula-Nebula/issues)
- 💬 讨论问题：[GitHub Discussions](https://github.com/wenze-wu-math/Formula-Nebula/discussions)
- 📞 联系维护者：[@wenze-wu-math](https://github.com/wenze-wu-math)

---

**最后更新**：2026 年 11 月  
**下一次更新计划**：2026 年 12 月

