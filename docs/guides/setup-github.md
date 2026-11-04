# Formula Nebula - GitHub 设置指南

## 步骤1: 在GitHub上创建仓库

1. 访问 https://github.com/new
2. 仓库名称: `Formula-Nebula`
3. 描述: `代数几何知识图谱的多维可视化 | Multi-dimensional visualization of algebraic geometry knowledge graph`
4. 选择 **Public** (公开项目，推荐)
5. **不要** 初始化README、.gitignore或license（我们本地已有）
6. 点击 "Create repository"

## 步骤2: 连接本地仓库到GitHub

创建完成后，GitHub会显示一个页面，复制"push an existing repository"部分的命令，或者直接运行：

```bash
cd "D:\xiangmu\Formula Nebula"

# 添加远程仓库
git remote add origin https://github.com/wenze-wu-math/Formula-Nebula.git

# 确认当前分支是main
git branch -M main

# 推送到GitHub
git push -u origin main
```

## 步骤3: 验证连接

```bash
# 查看远程仓库配置
git remote -v

# 应该显示：
# origin  https://github.com/wenze-wu-math/Formula-Nebula.git (fetch)
# origin  https://github.com/wenze-wu-math/Formula-Nebula.git (push)
```

## 可选：使用SSH而不是HTTPS

如果你想使用SSH（更方便，不用每次输入密码）：

```bash
# 1. 生成SSH密钥（如果还没有）
ssh-keygen -t ed25519 -C "your_email@example.com"

# 2. 复制公钥内容
cat ~/.ssh/id_ed25519.pub

# 3. 在GitHub上添加SSH key:
#    Settings → SSH and GPG keys → New SSH key

# 4. 更改remote URL为SSH
git remote set-url origin git@github.com:wenze-wu-math/Formula-Nebula.git
```

## 步骤4: 设置仓库描述和主题

在GitHub仓库页面：

1. 点击右上角的 ⚙️ (Settings)
2. 在 "About" 部分添加：
   - 网站: 如果有部署的URL
   - Topics (主题标签):
     - `mathematics`
     - `algebraic-geometry`
     - `knowledge-graph`
     - `visualization`
     - `threejs`
     - `canvas`
     - `interactive`
     - `data-visualization`
     - `mathematical-proofs`
     - `theorem-proving`

## 步骤5: 启用GitHub Pages（可选）

如果想部署静态版本：

1. Settings → Pages
2. Source: Deploy from a branch
3. Branch: `main` / `docs` (选择docs文件夹)
4. Save

## 项目当前状态

✅ 2次提交已完成：
- Commit 1: 添加完整文档和项目基础设施
- Commit 2: 完成3个缺陷修复 + 视觉美化 + 性能优化 + 4个新功能

📊 项目规模：
- 515 文件
- ~1,071,452 行代码
- 67 文件修改（最新提交）
- 12,749 行新增/修改

## 推荐的README徽章

添加到README.md顶部：

```markdown
# Formula Nebula 公式诗云

[![GitHub Stars](https://img.shields.io/github/stars/wenze-wu-math/Formula-Nebula?style=social)](https://github.com/wenze-wu-math/Formula-Nebula)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](../../CONTRIBUTING.md)
[![Build Status](https://img.shields.io/badge/build-passing-success.svg)]()

代数几何知识图谱的四维可视化系统
```

## 下一步

推送到GitHub后，考虑：

1. **创建 LICENSE 文件** (MIT或Apache 2.0推荐)
2. **添加 CONTRIBUTING.md** (贡献指南，已在工作流中生成)
3. **设置 GitHub Actions** (CI/CD，已在工作流中准备)
4. **创建第一个 Release** (v1.0.0)
5. **添加 GitHub Discussions** (社区讨论)
6. **添加 Issue Templates** (Bug报告、功能请求)

## 故障排除

### 推送失败："Updates were rejected"

```bash
# 如果远程仓库有内容，需要先pull
git pull origin main --allow-unrelated-histories
git push -u origin main
```

### 认证失败

从2021年开始，GitHub不再接受密码认证，需要：
- 使用 Personal Access Token (PAT)
- 或使用 SSH 密钥

创建PAT: https://github.com/settings/tokens
- 选择 `repo` 权限
- 生成后复制token（只显示一次）
- 推送时用token替代密码
