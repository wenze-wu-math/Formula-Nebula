# GitHub Discussions 配置清单

本清单用于完成 GitHub Discussions 的初始化设置。

---

## ✅ 配置已完成

### 📚 文档部分
- [x] **README.md** - 讨论区总体指南与分类说明
- [x] **categories.json** - 5 个讨论分类 + 10 个标签定义
- [x] **featured.md** - 精选讨论管理与展示
- [x] **moderator-handbook.md** - 版主完整操作手册
- [x] **quick-reference.md** - 版主快速参考卡片
- [x] **SETUP-CHECKLIST.md** - 本文件

### 🎯 配置内容

#### 1. 五个讨论分类
```
📚 知识与研究 (knowledge-research)
   - 讨论代数几何、知识图谱、数学理论
   
🎨 设计与可视化 (design-visualization)
   - 讨论视觉设计、交互、配色
   
💻 技术实现 (technical-implementation)
   - 讨论代码、算法、WebGL/Three.js
   
🐛 问题反馈与建议 (feedback-suggestions)
   - 报告 bug、提需求、建议改进
   
🌟 项目公告 (announcements)
   - 版本发布、重要更新、里程碑
```

#### 2. 十个标签
- `good-first-issue` - 适合新手
- `help-wanted` - 需要帮助
- `answer-provided` - 已有回答
- `needs-attention` - 需要版主审视
- `duplicate` - 重复讨论
- `enhancement` - 功能需求
- `question` - 问题型讨论
- `documentation` - 文档相关
- `performance` - 性能相关
- `archived` - 已归档讨论

#### 3. 精选讨论体系
- 定义了 5 条示例精选讨论
- 建立了评选标准和推荐流程
- 文档化了精选讨论的价值和用途

#### 4. 版主指南体系
- 完整的版主手册（8 个主要章节）
- 快速参考卡片（日常操作速查）
- 冲突处理流程
- 行为准则执行指南

---

## 🚀 后续手动配置步骤

### 第 1 步：在 GitHub 设置分类

进度: **需要版主执行**

GitHub Discussions 需要通过 Web 界面创建分类（暂不支持 API 自动化）。

1. 打开仓库 → **Settings** → **General**
2. 向下滚到 **Discussions**
3. 点击 **Set up discussions**
4. 为每个分类创建：

```
名称: 📚 知识与研究
描述: 讨论代数几何、知识图谱、数学理论及相关研究话题
[重复 x5]
```

**预计时间:** 10-15 分钟

**检查清单:**
- [ ] 📚 知识与研究
- [ ] 🎨 设计与可视化
- [ ] 💻 技术实现
- [ ] 🐛 问题反馈与建议
- [ ] 🌟 项目公告

### 第 2 步：创建标签

进度: **建议由版主执行，也可自动化**

#### 方法 A：手工创建（快速）
1. 任意讨论 → 右侧 **Labels**
2. 输入标签名 + 选择颜色
3. 重复 10 次

**预计时间:** 5 分钟

#### 方法 B：脚本创建（推荐大规模应用）
```bash
# 需要 GitHub CLI 和必要权限
gh label create "good-first-issue" --color 7057ff
gh label create "help-wanted" --color 33aa3f
# ... 等等
```

**检查清单:**
- [ ] 10 个标签已创建

### 第 3 步：首次讨论与精选展示

进度: **可选但推荐**

1. 创建一个"欢迎来到 Discussions"的讨论
2. 手工创建或转换 5 条示例讨论为精选
3. 在 [featured.md](./featured.md) 中链接实际讨论 ID

**示例:**
```markdown
### 1. 布局算法的优化挑战与解决
**讨论 ID:** 讨论/123

[完整 URL]: https://github.com/wenze-wu-math/Formula-Nebula/discussions/123
```

### 第 4 步：任命版主

进度: **由仓库所有者执行**

1. 打开 Discussions 页面
2. 点击右上角 **Settings**
3. **Moderation** → **Discussions**
4. 添加版主（推荐 2-3 人）

**角色:**
- 1 个 **Maintainer**（通常是项目所有者）
- 2-3 个 **Moderators**（活跃社区成员）
- 可选：1-2 个 **Community Specialists**（特定领域专家）

### 第 5 步：集成到项目文档

进度: **文档维护者执行**

在以下位置添加 Discussions 的链接：

1. **README.md**
   ```markdown
   ## 社区与讨论
   
   - [📚 GitHub Discussions](../../discussions) - 知识分享和问题讨论
   - [🐛 GitHub Issues](../../issues) - 报告 bug 和需求
   ```

2. **CONTRIBUTING.md**
   ```markdown
   ### 参与讨论
   
   - 使用[GitHub Discussions](../../discussions)提出问题和想法
   - 见[讨论分类指南](/.github/discussions/README.md)
   ```

3. **docs/** 或 **wiki/**
   - 在适当位置链接精选讨论

### 第 6 步：版主培训

进度: **由版主团队执行**

1. 阅读本清单和完整手册
2. 查看示例讨论的管理过程
3. 熟悉标签和分类系统
4. 讨论和统一冲突处理方针

**建议:**
- 安排 1 小时的版主入职会议
- 分享完整手册和快速参考
- 讨论具体场景和决策方法

---

## 📋 验证清单

完成上述配置后，检查以下项目：

### 功能验证
- [ ] 所有 5 个分类可见且可选
- [ ] 所有 10 个标签可用
- [ ] 新讨论可以正确分类
- [ ] 讨论可以添加标签
- [ ] 版主可以关闭、隐藏、转为 Issue
- [ ] 标记为"答案"功能可用

### 文档验证
- [ ] README.md 可以轻松找到
- [ ] 版主手册链接正确
- [ ] 快速参考卡片易于访问
- [ ] 精选讨论列表完整且链接有效

### 社区体验
- [ ] 新用户能理解 5 个分类的区别
- [ ] 标签使用一致且有帮助
- [ ] 版主能高效地执行日常任务
- [ ] 讨论流程清晰明了

---

## 🔧 配置参考

### 文件结构
```
.github/
└── discussions/
    ├── README.md                    # 总体指南
    ├── categories.json              # 分类和标签定义
    ├── featured.md                  # 精选讨论管理
    ├── moderator-handbook.md        # 版主完整手册
    ├── quick-reference.md           # 版主快速参考
    └── SETUP-CHECKLIST.md          # 本文件
```

### 权限需求

| 角色 | 需要权限 |
|------|---------|
| 项目所有者 | 创建分类、任命版主 |
| 版主 | 管理讨论、隐藏评论、关闭讨论 |
| 社区成员 | 创建讨论、评论 |

### 相关文档链接

- [GitHub Discussions 官方文档](https://docs.github.com/en/discussions)
- [讨论设置选项](https://docs.github.com/en/discussions/managing-discussions-for-your-community/managing-discussions)
- [版主工具](https://docs.github.com/en/discussions/managing-discussions-for-your-community)

---

## 📞 支持和问题

### 常见问题

**Q: 如何添加更多分类？**
A: 在 GitHub Settings → Discussions 中添加。最多可以有大量分类，但建议保持 5-8 个以保持简洁。

**Q: 能否自动创建标签？**
A: 是的，使用 GitHub CLI：
```bash
gh label create "标签名" --color "十六进制色码"
```

**Q: 讨论如何与 Issue 互动？**
A: 可以从讨论转为 Issue，但反向不支持。讨论完全解决后通常转为 Issue 或关闭。

**Q: 版主团队如何沟通？**
A: 建议：
- 定期会议（每月一次）
- 私下讨论敏感问题
- 在项目内部 Issue 或团队讨论

### 获取帮助

- **技术问题:** [GitHub Discussions 帮助](https://support.github.com/)
- **功能请求:** [GitHub 反馈论坛](https://github.com/github/feedback)
- **项目内:** 在 Issues 中打标签 `discussions` 或联系 @[项目维护者]

---

## 📊 成功指标

配置完成后，定期检查这些指标：

| 指标 | 目标 | 频率 |
|------|------|------|
| 新讨论 | >2 个/周 | 每周 |
| 平均回复时间 | <48 小时 | 每周 |
| 讨论分类正确率 | >95% | 每月 |
| 已标记为已答 | >70% | 每月 |
| 版主回应率 | >90% | 每月 |
| 社区满意度 | 定期反馈 | 每季度 |

---

## 🎉 下一步

配置完成后：

1. ✅ 在 README 中宣布 Discussions 启用
2. ✅ 发送欢迎讨论邀请社区
3. ✅ 固定重要链接到 Discussions 主页
4. ✅ 在定期会议中提及 Discussions 政策
5. ✅ 持续监测和优化

---

**配置日期:** 2026-11-03  
**文档版本:** 1.0  
**最后审查:** 2026-11-03

---

## 快速开始命令

如果使用 GitHub CLI，快速创建所有标签：

```bash
# 复制粘贴或保存为脚本运行
gh label create "good-first-issue" --color 7057ff
gh label create "help-wanted" --color 33aa3f
gh label create "answer-provided" --color 4caf50
gh label create "needs-attention" --color ff6b6b
gh label create "duplicate" --color cfd3d7
gh label create "wontfix" --color e4e669
gh label create "enhancement" --color a2eeef
gh label create "question" --color d876e3
gh label create "documentation" --color 0075ca
gh label create "performance" --color b60205
```

运行后检查：
```bash
gh label list
```

---

**此配置完成！** 🎊

所有必要文档已准备就绪。现在只需执行"后续手动配置步骤"中的 GitHub 界面操作，即可完全启用 GitHub Discussions。
