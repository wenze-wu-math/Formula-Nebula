# 初学者贡献指南 · Beginner's Contribution Guide

欢迎！本指南专为第一次贡献的人设计。无论您的技术背景如何，我们都很高兴您考虑为公式诗云做贡献。

Welcome! This guide is designed specifically for first-time contributors. Regardless of your technical background, we're excited that you're considering contributing to Formula Nebula.

---

## 目录 · Table of Contents

- [这是什么项目？](#这是什么项目)
- [我需要什么？](#我需要什么)
- [第 1 步：设置您的环境](#第-1-步设置您的环境)
- [第 2 步：找到任务](#第-2-步找到任务)
- [第 3 步：创建更改](#第-3-步创建更改)
- [第 4 步：提交您的工作](#第-4-步提交您的工作)
- [常见问题](#常见问题)
- [下一步](#下一步)

---

## 这是什么项目？

公式诗云是一个**3D 知识可视化项目**，帮助数学家和学生理解代数几何中的关系。

它创建了一个交互式的"星系"，其中每个"星"是一个数学公式，它们之间的连接表示不同公式之间的关系。

### 项目的关键方面

**前端** - React + Three.js（3D 可视化）  
**后端** - Node.js（数据处理）  
**数据** - 400+ 数学公式及其关系  
**文档** - 60+ markdown 文件，非常详细  

### 为什么这很酷

- 🌌 **3D 可视化** - 看到数学关系活跃起来
- 📚 **教育** - 帮助学生理解复杂概念
- 🔗 **知识图** - 展示数学如何相互联系
- ⭐ **开源** - 任何人都可以贡献改进

---

## 我需要什么？

### 技能

- **基础 Git 知识** - 如何 clone 仓库和提交更改
- **JavaScript** - 不需要高级技能；基础就可以了
- **英语 / 中文** - 理解文档和评论

**不需要的东西：**
- ❌ 高级数学知识（虽然帮助，但不是必须的）
- ❌ 3D 图形经验（学习时获得）
- ❌ 以前的开源经验（我们会指导您）

### 工具

- **计算机** - Windows、Mac 或 Linux
- **编辑器** - VSCode（推荐，免费）
- **Git** - 版本控制（免费，GitHub 账户）
- **Node.js** - v18+（免费）
- **npm** - 包管理器（随 Node.js 一起安装）

---

## 第 1 步：设置您的环境

### 1.1 安装必要的工具

#### Windows 用户

```bash
# 安装 Node.js（v18 或更高版本）
# 从 https://nodejs.org 下载并安装

# 验证安装
node --version
npm --version
```

#### Mac 用户

```bash
# 使用 Homebrew 安装（如果没有，先安装 Homebrew）
brew install node

# 验证
node --version
npm --version
```

#### Linux 用户

```bash
# Ubuntu/Debian
sudo apt-get install nodejs npm

# 或使用 nvm（推荐）
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
```

### 1.2 设置 GitHub 账户和 Git

```bash
# 1. 创建 GitHub 账户（如果还没有）
# https://github.com/signup

# 2. 安装 Git
# Windows: https://git-scm.com/download/win
# Mac: brew install git
# Linux: sudo apt-get install git

# 3. 配置 Git
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# 4. 生成 SSH 密钥（可选，但推荐）
ssh-keygen -t ed25519 -C "your.email@example.com"

# 5. 将公钥添加到 GitHub
# 访问 https://github.com/settings/keys
```

### 1.3 Fork 和 Clone 仓库

```bash
# 1. 访问 GitHub 仓库
# https://github.com/formula-nebula/formula-nebula

# 2. 点击右上角的 "Fork" 按钮
# 这会在您的账户中创建仓库副本

# 3. Clone 您的 fork 到本地
git clone https://github.com/YOUR_USERNAME/formula-nebula.git
cd formula-nebula

# 4. 添加上游仓库（保持同步）
git remote add upstream https://github.com/formula-nebula/formula-nebula.git

# 5. 验证设置
git remote -v
# 应该看到两个远程：origin 和 upstream
```

### 1.4 安装项目依赖

```bash
# 安装所有依赖项
npm install

# 这需要几分钟。如果遇到错误，您可以：
# npm install --legacy-peer-deps
```

### 1.5 启动开发服务器

```bash
# 启动开发服务器
npm run dev

# 应该看到：
# ✓ 已准备就绪: http://localhost:5175

# 在浏览器中打开该 URL 并查看项目！

# 按 Ctrl+C 停止服务器
```

**恭喜！** ✨ 您已成功设置开发环境。

---

## 第 2 步：找到任务

### 2.1 查找"好第一问题"

访问 GitHub 问题页面并筛选"好第一问题"：

```
https://github.com/formula-nebula/formula-nebula/issues?q=label:good-first-issue
```

### 2.2 选择任务时要查找什么

选择满足以下条件的问题：

✅ **有清晰的描述** - 您理解需要什么  
✅ **有关链接资源** - 文档或相关代码  
✅ **标记为"容易"或"初级"** - 复杂度合理  
✅ **未被认领** - 评论中没有人说"我在做这个"  
✅ **有标题含义明确** - 问题很具体  

### 2.3 好第一问题示例

#### 示例 1：修复拼写错误

```markdown
## 问题
README.md 第 42 行的"通畅"应该是"畅通"

难度：容易 ⭐
预计时间：5 分钟
```

**为什么这很适合初学者：**
- 无需编写复杂代码
- 学习基本的 Git 工作流
- 快速成功体验

#### 示例 2：添加缺失的文档

```markdown
## 问题
src/components/Galaxy.jsx 缺少 JSDoc 注释

难度：容易 ⭐
预计时间：15 分钟
```

**为什么这很适合初学者：**
- 通过示例学习
- 理解代码目的
- 进行简单的添加（评论）

#### 示例 3：添加测试

```markdown
## 问题
scripts/verify-importance.mjs 应该测试负数输入

难度：中等 ⭐⭐
预计时间：30 分钟
```

**为什么这很适合初学者：**
- 学习如何编写测试
- 理解代码如何失败
- 获得代码工作原理的理解

### 2.4 声称一个问题

找到您想处理的问题后：

1. 在问题中**评论** "@username 我想处理这个"
2. **等待维护者回应**（通常 < 24 小时）
3. **获得批准**后开始工作

示例评论：
```markdown
@maintainer 我是这个项目的新贡献者，想要帮忙解决这个问题。
我已经设置了开发环境并准备好开始工作。感谢指导！
```

---

## 第 3 步：创建更改

### 3.1 创建功能分支

```bash
# 确保您使用最新代码
git fetch upstream
git checkout main
git reset --hard upstream/main

# 创建新分支（使用描述性名称）
git checkout -b fix/spelling-readme

# 或对于功能
git checkout -b feature/add-dark-mode
```

**分支命名约定：**
- `fix/description` - 用于 bug 修复
- `feature/description` - 用于新功能
- `docs/description` - 用于文档
- `refactor/description` - 用于代码改进

### 3.2 进行您的更改

```bash
# 编辑文件（使用 VSCode 或您喜欢的编辑器）
code src/components/Galaxy.jsx

# 或简单地编辑文件
# 记得经常保存
```

### 3.3 测试您的更改

```bash
# 1. 运行开发服务器以查看您的更改
npm run dev

# 2. 在浏览器中测试（http://localhost:5175）

# 3. 运行验证脚本
npm run verify

# 如果一切看起来都很好，请继续
```

### 3.4 提交您的更改

```bash
# 1. 查看更改
git status
git diff

# 2. 暂存更改
git add .
# 或特定文件
git add src/components/Galaxy.jsx

# 3. 提交（使用清晰的消息）
git commit -m "fix(readme): correct spelling of '通畅' to '畅通'"

# 提交消息格式：
# fix(scope): clear description
# feat(scope): what is added
# docs(scope): what documentation changed

# 4. 验证提交
git log --oneline -2
```

### 3.5 推送到您的 Fork

```bash
# 推送更改到您的 GitHub fork
git push origin fix/spelling-readme

# 如果首次推送此分支，您可能需要：
git push --set-upstream origin fix/spelling-readme
```

---

## 第 4 步：提交您的工作

### 4.1 创建拉取请求

1. 访问 https://github.com/formula-nebula/formula-nebula
2. 您应该会看到一个黄色横幅，询问"创建拉取请求"
3. 点击"创建拉取请求"

或手动：
1. 转到您的 fork（https://github.com/YOUR_USERNAME/formula-nebula）
2. 点击"拉取请求"标签
3. 点击"新建拉取请求"
4. 选择您的分支和目标分支

### 4.2 填写 PR 描述

使用此模板填写 PR 描述：

```markdown
## 描述
我修复了 README 中的拼写错误。

## 相关问题
Closes #123

## 变更类型
- [x] Bug 修复
- [ ] 新功能
- [ ] 文档

## 测试清单
- [x] 本地验证脚本通过
- [x] 没有新的警告

## 屏幕截图（如适用）
[如果您修改了 UI，添加屏幕截图]
```

### 4.3 等待审查

**维护者会：**

✅ 阅读您的 PR  
✅ 可能请求更改  
✅ 如果一切看起来都很好就批准  
✅ 合并您的更改  

**期间发生什么：**

- 自动检查会运行（CI/CD）
- 维护者会审查代码
- 您可能会收到修改请求
- 一旦批准，您的代码就会合并

### 4.4 处理反馈

如果维护者要求更改：

```bash
# 1. 进行请求的更改
# （编辑文件）

# 2. 提交更改
git add .
git commit -m "address review feedback"

# 3. 推送更新
git push origin fix/spelling-readme

# PR 会自动用新提交更新
# 维护者会再次审查
```

### 4.5 您的 PR 被合并！

🎉 **恭喜！** 您已成功为开源项目做出贡献！

您会看到：
- ✅ PR 被标记为"合并"
- 🔗 您的分支被删除
- 📜 您的名字出现在提交历史中

---

## 常见问题

### 我犯了一个错误，我的提交有什么问题？

**不用担心！** 这很正常。以下是修复方法：

```bash
# 如果未推送，修改最后一次提交
git commit --amend

# 如果已推送
git push --force-with-lease origin branch-name

# 或只是创建一个新提交来修复它
```

### 我遇到了合并冲突，我该怎么办？

**合并冲突** 在多人编辑同一文件时发生。

```bash
# 1. 更新您的分支
git fetch upstream
git rebase upstream/main

# 2. 解决冲突
# Git 会在冲突文件中标记冲突
# 编辑文件并移除冲突标记

# 3. 标记为已解决
git add .
git rebase --continue

# 4. 推送更新
git push --force-with-lease origin branch-name
```

### 我需要多久才能得到审查？

通常：
- **简单更改**（文档、拼写）：1-2 天
- **中等更改**（新功能）：3-7 天
- **大型更改**：1-2 周

### 我可以一次处理多个问题吗？

**不，请一次处理一个。** 这样做的原因：

✅ 更容易审查  
✅ 更快合并  
✅ 如果有问题，更容易回滚  

完成一个 PR 后，您可以随时开始另一个！

### 如果我卡住了怎么办？

1. **查看现有文档** - 答案可能就在那里
2. **搜索现有 Issues** - 有人可能已经问过
3. **发表评论** - 在 PR/Issue 中询问
4. **提出讨论** - 在 GitHub Discussions 中寻求帮助

## 下一步

### 完成您的第一个 PR 后

🎊 **现在您是贡献者了！**

下一步是什么：

1. **庆祝** - 您刚刚完成了开源贡献！
2. **寻找另一个问题** - 选择下一个 `good-first-issue`
3. **加入社区** - 在 Discord 或论坛中打个招呼
4. **申请导师** - 如果您想更深入地学习

### 学习更多

阅读这些资源以加深您的知识：

- [完整贡献指南](../CONTRIBUTING.md)
- [项目 README](../README.md)
- [协作架构](./collaboration-architecture.md)
- [目录结构说明](../DIRECTORY_STRUCTURE.md)

### 成长路径

```
初学者 → 常规贡献者 → 审查者 → 维护者
  ↓          ↓             ↓         ↓
好第一问题  中等功能   审查他人PR   主导功能
```

您不需要一开始就成为专家。通过一个一个的 PR，您将学到很多东西！

---

## 资源

### 社区

- **GitHub Issues** - 报告 bug 或请求功能
- **GitHub Discussions** - 提出问题和讨论想法
- **Discord** - 实时社区聊天
- **导师项目** - 获得一对一指导

### 学习

- [Conventional Commits](https://www.conventionalcommits.org/) - 提交消息格式
- [GitHub Flow 指南](https://guides.github.com/introduction/flow/) - Git 工作流
- [开源指南](https://opensource.guide/) - 为开源做贡献
- [编写好的 PR 描述](https://www.pullrequest.com/blog/write-a-great-pull-request-description/) - PR 最佳实践

---

## 最终提示

- **开始小** - 从简单的问题开始
- **提出问题** - 不确定？问！
- **耐心** - 维护者是志愿者
- **学习** - 每个贡献都是学习机会
- **享受** - 为开源做贡献应该很有趣！

---

**祝您好运！** 🚀

有任何问题，请随时寻求帮助。我们很高兴您在这里！

---

**最后更新** · Last Updated: 2026-11-03  
**为初学者编写** · Written for First-Time Contributors
