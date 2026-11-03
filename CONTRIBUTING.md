# Contributing to Formula Nebula

感谢你考虑为 Formula Nebula 做贡献！🎉

Formula Nebula 是一个代数几何知识图谱的三维可视化项目。我们欢迎所有形式的贡献：代码、文档、设计、问题报告、功能建议等。

---

## 📋 快速开始

### 1. Fork 和 Clone

```bash
# Fork 项目到你的账号

# Clone 你的 fork
git clone https://github.com/YOUR_USERNAME/Formula-Nebula.git
cd Formula-Nebula

# 添加上游仓库
git remote add upstream https://github.com/wenze-wu-math/Formula-Nebula.git
```

### 2. 安装依赖

```bash
npm install
```

### 3. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:5175/

### 4. 运行测试

```bash
npm run verify
```

---

## 💡 贡献类型

### 🐛 修复 Bug

查看 [Issues](https://github.com/wenze-wu-math/Formula-Nebula/issues?q=is%3Aissue+is%3Aopen+label%3Abug) 中标记为 `bug` 的问题。

**适合新手**：查找 `good first issue` 标签。

### ✨ 添加新功能

1. 先查看 [OPTIMIZATION_ROADMAP.md](OPTIMIZATION_ROADMAP.md)
2. 创建 Issue 讨论你的想法
3. 等待反馈后开始实施

### 📝 改进文档

- 修复错误
- 添加示例
- 翻译内容
- 改进 API 文档

### ⚡ 性能优化

查看 [OPTIMIZATION_ROADMAP.md](OPTIMIZATION_ROADMAP.md) 了解优化机会。

---

## 📏 代码规范

### JavaScript

- 使用 ES6+ 语法
- 优先 `const`，需要时用 `let`
- 使用箭头函数
- 使用模板字符串

### 命名

- **文件名**: kebab-case (`performance-monitor.js`)
- **类名**: PascalCase (`PerformanceDashboard`)
- **函数名**: camelCase (`formatBytes`)
- **常量**: UPPER_SNAKE_CASE (`MAX_SIZE`)

### 提交消息

使用 [Conventional Commits](https://www.conventionalcommits.org/):

```bash
feat: add new feature
fix: resolve bug
docs: update documentation
perf: improve performance
```

---

## 🧪 测试

### 运行测试

```bash
# 所有测试
npm run verify

# 特定测试
npm run verify:katex
npm run perf
```

### 添加测试

确保你的代码有适当的测试覆盖。

---

## 📝 Pull Request 流程

### 1. 创建分支

```bash
git checkout -b feature/your-feature-name
```

### 2. 进行更改

遵循代码规范进行开发。

### 3. 测试

```bash
npm run verify
npm run build
```

### 4. 提交

```bash
git add .
git commit -m "feat: add new feature"
git push origin feature/your-feature-name
```

### 5. 创建 PR

1. 访问 GitHub
2. 点击 "Compare & pull request"
3. 填写 PR 模板
4. 等待 review

---

## 🐛 Bug 报告

### 模板

```markdown
## 描述
清晰描述 bug

## 复现步骤
1. 访问...
2. 点击...
3. 看到错误

## 预期行为
描述预期结果

## 实际行为
描述实际结果

## 环境
- OS: Windows 11
- Browser: Chrome 120
- Version: v0.1.1

## 截图
[如适用]
```

---

## 💭 功能请求

### 模板

```markdown
## 功能描述
描述你想要的功能

## 问题
这解决什么问题？

## 建议方案
描述你的实现想法

## 替代方案
其他考虑过的方案
```

---

## ⚡ 性能优化指南

### 测试性能

```bash
npm run perf
npm run build:analyze
```

### 在 PR 中包含数据

```markdown
## 性能改进

### Before
- Bundle: 3.8 MB
- Load: 4.2s

### After  
- Bundle: 3.3 MB (-13%)
- Load: 3.8s (-10%)
```

---

## 📚 文档规范

### Markdown

- 清晰的标题层次
- 代码示例
- 列表和表格
- 图片和截图

### 示例

```markdown
# 功能名称

简短描述。

## 使用

\`\`\`javascript
const result = feature(input)
\`\`\`

## 参数

| 名称 | 类型 | 描述 |
|------|------|------|
| input | string | 输入值 |
```

---

## 🎨 设计规范

### 颜色

```css
--primary: #6366f1;
--secondary: #8b5cf6;
--accent: #ec4899;
--dark-bg: #0f172a;
```

### 间距

使用 8px 网格：
```css
--spacing-1: 0.5rem;  /* 8px */
--spacing-2: 1rem;    /* 16px */
--spacing-3: 1.5rem;  /* 24px */
```

---

## 🤝 Code Review

### 作为作者

- 保持 PR 小而专注
- 描述清晰
- 确保测试通过
- 及时回复反馈

### 作为 Reviewer

- 24-48 小时内 review
- 提供建设性建议
- 指出具体问题
- 认可好的工作

---

## 🏆 贡献者认可

所有贡献者都会被添加到 README 的贡献者列表。

### 特殊认可

- **Top Contributor**: 月度最活跃
- **Bug Hunter**: 发现重要 bug
- **Performance Hero**: 重大性能改进
- **Documentation Star**: 文档贡献突出

---

## 📞 联系

- **GitHub Issues**: Bug 和功能请求
- **GitHub Discussions**: 一般讨论
- **Pull Requests**: 代码贡献

---

## ❓ FAQ

**Q: 我是新手，可以贡献吗？**  
A: 当然！查找 `good first issue` 标签开始。

**Q: PR 多久会被 review？**  
A: 通常 24-48 小时内。

**Q: 我不会编程，能贡献吗？**  
A: 可以！你可以改进文档、报告 bug、提供设计建议等。

---

## 🙏 感谢

感谢你的贡献！每一个贡献都让 Formula Nebula 变得更好。

**Happy Contributing!** 🎉

---

**最后更新**: 2026-11-03
