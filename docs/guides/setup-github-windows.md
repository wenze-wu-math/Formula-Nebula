# Formula Nebula - GitHub 设置（Windows 完整指南）

## 🚀 快速开始（3步搞定）

### 第1步：在GitHub创建仓库（2分钟）

1. 打开浏览器访问：**https://github.com/new**
2. 填写：
   - Repository name: **Formula-Nebula**
   - Description: **代数几何知识图谱的多维可视化**
   - 选择：**✅ Public**
   - **不要勾选** README、.gitignore、license
3. 点击 **Create repository**

### 第2步：推送代码到GitHub（使用HTTPS - 最简单）

打开 Git Bash 或 PowerShell，运行：

```bash
cd "D:\xiangmu\Formula Nebula"

# 添加远程仓库
git remote add origin https://github.com/wenze-wu-math/Formula-Nebula.git

# 推送代码
git push -u origin main
```

**首次推送会弹出登录窗口：**
- 选择 "Sign in with your browser"
- 在浏览器中登录GitHub
- 授权完成后自动返回

### 第3步：验证（1分钟）

访问：**https://github.com/wenze-wu-math/Formula-Nebula**

你应该能看到：
- ✅ 2个commits
- ✅ 515个文件
- ✅ README.md 显示在首页
- ✅ 项目描述和stars按钮

---

## 🔐 方式2：使用SSH（更安全，一次配置永久使用）

### 2.1 生成SSH密钥

在Git Bash中运行：

```bash
# 生成密钥（替换为你的GitHub邮箱）
ssh-keygen -t ed25519 -C "your_email@example.com"

# 按3次回车（使用默认路径，不设置密码）
```

### 2.2 复制公钥

```bash
# 显示公钥内容
cat ~/.ssh/id_ed25519.pub
```

复制输出的完整内容（从 `ssh-ed25519` 开始）

### 2.3 添加到GitHub

1. 访问：**https://github.com/settings/ssh/new**
2. Title: **Formula Nebula** (或任意名称)
3. Key: 粘贴刚才复制的公钥
4. 点击 **Add SSH key**

### 2.4 测试连接

```bash
ssh -T git@github.com
```

看到 "Hi wenze-wu-math!" 说明成功！

### 2.5 使用SSH推送

```bash
cd "D:\xiangmu\Formula Nebula"

# 添加SSH远程地址
git remote add origin git@github.com:wenze-wu-math/Formula-Nebula.git

# 推送
git push -u origin main
```

---

## ✅ 完成后的检查清单

- [ ] GitHub仓库已创建
- [ ] 代码已推送（2个commits）
- [ ] README.md正确显示
- [ ] 可以访问 https://github.com/wenze-wu-math/Formula-Nebula

## 🎯 下一步建议

### 1. 添加仓库描述和标签

在GitHub仓库页面点击右上角的 ⚙️ Settings：

**About 部分添加 Topics:**
```
mathematics, algebraic-geometry, knowledge-graph, 
visualization, threejs, canvas, data-visualization, 
theorem-proving, mathematical-proofs, webgl
```

### 2. 添加LICENSE文件

创建 `LICENSE` 文件（推荐MIT）：

```bash
cd "D:\xiangmu\Formula Nebula"
curl -o LICENSE https://raw.githubusercontent.com/licenses/license-templates/master/templates/mit.txt
# 编辑LICENSE文件，替换[year]和[fullname]
git add LICENSE
git commit -m "Add MIT license"
git push
```

### 3. 创建第一个Release

1. 访问：https://github.com/wenze-wu-math/Formula-Nebula/releases/new
2. Tag version: **v1.0.0**
3. Release title: **Formula Nebula v1.0.0 - Initial Release**
4. Description: 复制CHANGELOG或README的功能列表
5. 点击 **Publish release**

### 4. 启用GitHub Pages（可选）

部署在线预览版本：

1. Settings → Pages
2. Source: **Deploy from a branch**
3. Branch: **main** / **docs**
4. Save

访问：https://wenze-wu-math.github.io/Formula-Nebula/

### 5. 添加README徽章

在README.md顶部添加：

```markdown
[![GitHub Stars](https://img.shields.io/github/stars/wenze-wu-math/Formula-Nebula?style=social)](https://github.com/wenze-wu-math/Formula-Nebula)
[![GitHub Forks](https://img.shields.io/github/forks/wenze-wu-math/Formula-Nebula?style=social)](https://github.com/wenze-wu-math/Formula-Nebula/fork)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](../../CONTRIBUTING.md)
```

---

## 🐛 常见问题

### Q: 推送时要求输入用户名密码？

**A:** GitHub不再支持密码认证，需要：
- 使用GitHub网页登录（推荐，会自动弹出）
- 或创建Personal Access Token: https://github.com/settings/tokens
  - 权限：勾选 `repo` (Full control of private repositories)
  - 生成后复制token
  - 推送时用token替代密码

### Q: fatal: remote origin already exists

**A:** 远程仓库已存在，先删除再添加：
```bash
git remote remove origin
git remote add origin https://github.com/wenze-wu-math/Formula-Nebula.git
```

### Q: SSH连接失败："Permission denied"

**A:** 检查：
```bash
# 1. 确认SSH agent运行中
eval $(ssh-agent -s)

# 2. 添加密钥
ssh-add ~/.ssh/id_ed25519

# 3. 测试连接
ssh -T git@github.com
```

### Q: 推送失败："Updates were rejected"

**A:** 远程仓库有内容（可能创建仓库时勾选了README），需要先拉取：
```bash
git pull origin main --allow-unrelated-histories
git push -u origin main
```

---

## 📊 当前项目状态

✅ **已完成：**
- 2次提交（文档+功能）
- 515文件
- ~1,071,452行代码
- 3个关键缺陷已修复
- 4个新功能已添加
- 全面视觉美化
- 性能优化

🚀 **等待推送：**
- 将在GitHub上可见
- 可以开始接受贡献
- 可以部署在线版本
- 可以开始推广

---

## 💡 推送成功后

1. **分享给朋友**：直接发送GitHub链接
2. **提交到awesome列表**：如awesome-math、awesome-visualization
3. **在社交媒体宣传**：Twitter、Reddit r/math、知乎
4. **提交到产品社区**：Product Hunt、Hacker News
5. **申请GitHub Topics推荐**：出现在 github.com/topics/visualization

**恭喜！你的开源项目即将上线！** 🎉
