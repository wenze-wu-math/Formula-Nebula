# Formula Nebula Roadmap | 开发路线图

> **Last Updated**: 2026-11-03  
> This roadmap outlines planned features and improvements. Priorities may change based on community feedback.  
> 本路线图概述了计划的功能和改进。优先级可能根据社区反馈而改变。

---

## 🎯 Vision | 愿景

将 Formula Nebula 打造成**最直观、最强大的数学知识可视化平台**，帮助学生、研究者和爱好者理解代数几何的结构与美。

Build Formula Nebula into the **most intuitive and powerful mathematical knowledge visualization platform**, helping students, researchers, and enthusiasts understand the structure and beauty of algebraic geometry.

---

## 🚀 Release Plan | 发布计划

### v0.2.0 - Enhanced Interaction (Q1 2027)
**重点：交互增强**

#### Core Features | 核心功能
- [ ] **时间轴模式** - Timeline Mode
  - 按时间排布公式 (1800-2026)
  - 可视化数学发展历程
  - 按年代筛选和播放动画
  
- [ ] **多层级缩放** - Multi-Level Zoom
  - 语义缩放：远观看星系，近看读公式
  - 自动 LOD (Level of Detail)
  - 平滑过渡动画

- [ ] **公式详情增强** - Enhanced Formula Details
  - 完整证明浏览器 (带步骤导航)
  - 相关论文链接 (arXiv, zbMATH)
  - 历史注记和趣闻

#### Improvements | 改进
- [ ] 移动端优化
- [ ] 触摸手势支持
- [ ] 离线 PWA 支持
- [ ] 多语言切换 (i18n 完善)

---

### v0.3.0 - Collaborative Features (Q2 2027)
**重点：协作功能**

#### Collaboration | 协作
- [ ] **实时协作** - Real-time Collaboration
  - 多用户同时浏览
  - 光标和选中状态同步
  - 聊天和标注功能

- [ ] **个人笔记** - Personal Notes
  - 在任何公式上添加私人笔记
  - Markdown 支持
  - 云端同步 (可选)

- [ ] **分享与嵌入** - Share & Embed
  - 生成分享卡片 (Open Graph)
  - 可嵌入的 iframe 组件
  - 导出为交互式 HTML

#### Community | 社区
- [ ] 用户贡献系统
- [ ] 公式纠错和补充
- [ ] 投票和评论

---

### v0.4.0 - Extended Knowledge (Q3 2027)
**重点：知识扩展**

#### Content | 内容
- [ ] **更多数学领域** - More Mathematical Fields
  - 数论子图 (500+ 节点)
  - 拓扑学子图 (300+ 节点)
  - 微分几何子图 (400+ 节点)

- [ ] **跨领域连接** - Cross-Domain Links
  - 代数几何 ↔ 数论
  - 代数几何 ↔ 拓扑
  - 统一的知识宇宙

- [ ] **动态内容** - Dynamic Content
  - 从 arXiv 自动抓取新论文
  - AI 辅助的关系推断
  - 社区驱动的知识更新

#### Visualization | 可视化
- [ ] 3D 音效 (可选)
- [ ] VR/AR 支持 (实验性)
- [ ] 动态粒子效果

---

### v0.5.0 - Educational Tools (Q4 2027)
**重点：教育工具**

#### Learning | 学习
- [ ] **学习路径** - Learning Paths
  - 从入门到高级的推荐路线
  - 交互式教程
  - 进度追踪

- [ ] **概念解释** - Concept Explanations
  - 每个公式的直观解释
  - 可视化证明 (部分定理)
  - 相关习题和解答

- [ ] **课程集成** - Course Integration
  - LMS (Moodle, Canvas) 插件
  - 教师仪表板
  - 学生分析

#### Accessibility | 无障碍
- [ ] 完整的键盘导航
- [ ] 屏幕阅读器支持
- [ ] 高对比度模式
- [ ] 色盲友好配色

---

### v1.0.0 - Stable Release (2028)
**里程碑：稳定版本**

#### Stability | 稳定性
- [ ] 完整的测试覆盖 (>90%)
- [ ] 性能基准达标
- [ ] 全面的文档
- [ ] 长期支持承诺

#### Platform | 平台
- [ ] 桌面应用 (Electron)
- [ ] 移动应用 (React Native)
- [ ] API 服务
- [ ] 插件生态系统

---

## 🔬 Research & Experiments | 研究与实验

### In Progress | 进行中
- **AI 辅助搜索** - 自然语言查询 ("找一个关于曲线上同调的定理")
- **知识图谱补全** - 机器学习预测缺失的关联
- **自动证明可视化** - 将形式化证明渲染成交互式图表

### Ideas | 想法
- **量子知识图谱** - 利用量子算法加速路径查找
- **神经网络嵌入** - 学习公式的语义向量表示
- **区块链存证** - 知识贡献的不可篡改记录

---

## 📊 Metrics & Goals | 指标与目标

### Performance | 性能
- [x] 首屏加载 < 4s ✅
- [x] 60 FPS 渲染 ✅
- [ ] Bundle < 2 MB (gzipped)
- [ ] Time to Interactive < 3s
- [ ] Lighthouse Score > 90

### Usage | 使用
- [ ] 1,000 active users
- [ ] 10,000 nodes explored per week
- [ ] 100 community contributions
- [ ] 50% returning user rate

### Quality | 质量
- [ ] Test coverage > 90%
- [ ] Zero critical bugs
- [ ] < 1% error rate
- [ ] A11y score 100

---

## 🤝 Community Priorities | 社区优先事项

Vote on features at [GitHub Discussions](https://github.com/wenze-wu-math/Formula-Nebula/discussions/categories/feature-requests)!

在 [GitHub Discussions](https://github.com/wenze-wu-math/Formula-Nebula/discussions/categories/feature-requests) 投票选择功能！

### Top Requested Features | 最受欢迎的功能请求
1. 📱 Mobile app
2. 🎓 Learning paths
3. 🌍 More languages
4. 🔗 External integrations (Notion, Obsidian)
5. 📝 Note-taking system

---

## 🛠️ Technical Debt | 技术债务

### High Priority | 高优先级
- [ ] Migrate to TypeScript (gradually)
- [ ] Implement proper state management (Zustand/Redux)
- [ ] Refactor monolithic scene.js (split into modules)
- [ ] Add E2E tests (Playwright)
- [ ] Improve error boundaries

### Medium Priority | 中优先级
- [ ] Code splitting optimization
- [ ] Service Worker improvements
- [ ] Bundle size reduction
- [ ] Accessibility audit

### Low Priority | 低优先级
- [ ] Code style consistency
- [ ] Comment coverage
- [ ] Performance profiling

---

## 📅 Timeline | 时间线

```
2026 Q4: ████████░░ v0.1.x - Foundation & Performance ✅
2027 Q1: ░░░░░░░░░░ v0.2.0 - Enhanced Interaction
2027 Q2: ░░░░░░░░░░ v0.3.0 - Collaborative Features  
2027 Q3: ░░░░░░░░░░ v0.4.0 - Extended Knowledge
2027 Q4: ░░░░░░░░░░ v0.5.0 - Educational Tools
2028 H1: ░░░░░░░░░░ v1.0.0 - Stable Release 🎉
```

---

## 🤔 How to Contribute | 如何贡献

We welcome contributions to any items on this roadmap!

欢迎为路线图上的任何项目做出贡献！

1. **Pick an item** - Choose from roadmap or [Good First Issues](https://github.com/wenze-wu-math/Formula-Nebula/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22)
2. **Discuss** - Open a discussion or comment on existing issue
3. **Implement** - Follow [CONTRIBUTING.md](CONTRIBUTING.md)
4. **Submit PR** - We'll review and merge

### Areas We Need Help | 需要帮助的领域
- 🎨 UI/UX Design
- 📝 Technical Writing
- 🌐 Translations
- 🧪 Testing
- 📊 Data Collection (more theorems!)
- 🎓 Educational Content

---

## 📞 Feedback | 反馈

Your input shapes this roadmap!

你的意见塑造这个路线图！

- 💬 [Discussions](https://github.com/wenze-wu-math/Formula-Nebula/discussions)
- 🐛 [Issues](https://github.com/wenze-wu-math/Formula-Nebula/issues)
- 📧 Email: (see package.json)

---

## 📜 Version History | 版本历史

### Released | 已发布
- **v0.1.1** (2026-11-03) - Performance optimizations
  - KaTeX + MathJax dual renderer
  - Code splitting (-68% bundle)
  - Service Worker caching
  - Performance monitoring

- **v0.1.0** (2026-10-20) - Initial release
  - 464 nodes (405 theorems + 59 conjectures)
  - 4 galaxy shapes
  - 3 view modes
  - Advanced search & pathfinding

---

**Note**: This roadmap is aspirational and subject to change. Dates are estimates. Priority is given to features that benefit the most users while maintaining code quality.

**注意**：本路线图为展望性质，可能会有变化。日期为估算值。优先考虑使最多用户受益同时保持代码质量的功能。

---

**Maintained by**: Formula Nebula Team  
**License**: MIT  
**Status**: 🟢 Active Development
