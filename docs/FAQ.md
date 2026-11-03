# 常见问题 · Frequently Asked Questions

## 目录 · Table of Contents

- [一般问题](#一般问题-general-questions)
- [使用相关](#使用相关-usage)
- [数学内容](#数学内容-mathematical-content)
- [技术相关](#技术相关-technical)
- [性能相关](#性能相关-performance)
- [贡献相关](#贡献相关-contribution)

---

## 一般问题 · General Questions

### Q1: 什么是公式诗云（Formula Nebula）？

**A:** 公式诗云是一个交互式 3D 知识可视化平台，专注于代数几何领域。它展示了 400+ 条数学定理和 59 条未解决的猜想之间的关系，就像一个"星系"一样组织和显示这些知识。

**英文:** Formula Nebula is an interactive 3D knowledge visualization platform focused on algebraic geometry. It displays relationships between 400+ mathematical theorems and 59 unsolved conjectures, organized and displayed like a "galaxy."

---

### Q2: 这个项目的目标是什么？

**A:** 
- 帮助学生和研究者理解代数几何中的知识结构
- 通过可视化展示数学公式之间的关联
- 提供一个可探索的知识图
- 支持教学和学习

---

### Q3: 项目是开源的吗？

**A:** 是的！公式诗云完全开源。您可以：
- 查看源代码
- 贡献新的数据或改进
- 在您自己的项目中部署
- 报告问题和建议功能

详见 [CONTRIBUTOR-PATH.md](./CONTRIBUTOR-PATH.md)

---

### Q4: 支持哪些语言？

**A:** 目前支持：
- **简体中文** - 完整支持
- **English** - 基础支持

每条公式都同时提供中英文名称和 LaTeX 表达式。

---

## 使用相关 · Usage

### Q5: 如何开始使用公式诗云？

**A:** 最快的方式：

1. **在线版本**：访问 [https://formula-nebula.vercel.app](https://formula-nebula.vercel.app)
2. **本地运行**：
   ```bash
   git clone https://github.com/wenze-wu-math/Formula-Nebula.git
   cd Formula-Nebula
   npm install
   npm run dev
   ```
3. **查看教程**：打开应用后，点击左上角的 `?` 或查看 [TUTORIAL-GUIDE.md](./TUTORIAL-GUIDE.md)

详见 [USER-GUIDE.md](./USER-GUIDE.md)

---

### Q6: 如何搜索一个特定的数学公式？

**A:** 使用右上角的搜索框，支持三种方式：

**方式 1：普通搜索**
```
霍奇      (中文名称)
Hodge     (英文名称)
H^{2k}    (LaTeX 表达式)
```

**方式 2：字段查询**
```
status:open           (未解决的猜想)
is:conjecture         (只显示猜想)
family:scheme         (某个知识族)
importance:>0.9       (重要度高于 0.9)
```

**方式 3：寻路**
```
霍奇猜想 -> 黎曼猜想    (找两者之间的关联)
```

详见 README.md 的「搜索、查询与寻路」部分。

---

### Q7: 如何查看一个公式的详细信息？

**A:** 
1. 在星云中**单击**任意公式
2. 右侧会打开详情面板，显示：
   - 公式的完整名称和 LaTeX 表达式
   - 中英文描述
   - 知识族分类
   - 相关关联
   - 重要度评分
3. 点击「阅读证明与知识脉络」查看完整的证明页面

---

### Q8: 星团（Cluster）是什么？

**A:** 星团是一个**球形结构**，包含 59 条未解决的数学猜想。与主星系（定理）不同：

- **位置**：右侧的球形区域
- **颜色点**：每条猜想旁有一个色点表示其状态
  - 🟠 橙红：未解决
  - 🟡 黄色：部分解决
  - 🟢 绿色：已证明
  - 🔴 玫红：已被推翻
- **含义**：越靠近球心越著名

---

### Q9: 设置面板里的各个选项有什么用？

**A:** 按 `S` 键或点击右上角 ⚙️ 打开设置面板：

| 设置项 | 作用 |
|-------|------|
| **星系形态** | 切换布局：旋涡星系/棒旋星系/同心环/弥散盘 |
| **取景** | 选择视图：全景/只看主星系/只看星团 |
| **着色** | 按知识族/按猜想状态/按猜想领域/统一橙黄 |
| **参数** | 调整自转速度、光点大小等 |
| **显示层** | 开关关联连线、背景星云等 |
| **引力** | 相机跟随星系自转，让公式保持静止 |

---

### Q10: 为什么整盘入画时公式这么小？

**A:** 这是**数学上的必然**，不是 bug。

当 464 个公式都入画时，屏幕被填满。要让单个公式更大，必须：
- 减少显示的公式数量（切换取景到"主星系"或"星团"）
- 单击一个公式放大（视角会自动飞过去）
- 使用滚轮缩放

详见 README.md 的「为什么单个字这么小」部分。

---

## 数学内容 · Mathematical Content

### Q11: "重要度"是怎么定义的？

**A:** 重要度（importance）反映了一个公式在代数几何中的**基础性和影响力**：

- **0.0** - 边缘的、极其专门的概念
- **0.5** - 中等重要
- **1.0** - 最基础、最重要的定理（如"概形"）

重要度同时驱动三个维度：
1. **位置**：越重要越靠近中心
2. **大小**：越重要越大
3. **亮度**：越重要越亮

实测相关性：秩相关 **−0.99**（非常强）

---

### Q12: 如何理解连线和关联？

**A:** 每条连线代表两个公式之间的**关系**。关系分为多种类型：

| 类型 | 颜色 | 例子 |
|------|------|------|
| **等价** | 青绿 | A 即 B |
| **蕴含** | 玫红 | A 推出 B |
| **定义** | 天蓝 | A 定义 B |
| **推广** | 草绿 | A 是 B 的推广 |
| **依赖** | 琥珀 | A 依赖 B |
| **同族** | 靛蓝 | A 与 B 属于同一知识族 |

默认只显示与选中公式相关的连线。要显示全部，打开设置 → 显示层 → 关联连线 → 全部。

---

### Q13: 什么是"知识族"？

**A:** 知识族是对数学主题的分类。主要有 8 个族：

1. **几何 Geometry** - 概形、簇等
2. **层论 Layer Theory** - 层、上同调等
3. **同调 Homology** - 同调理论、谱序列等
4. **数值 Numerical** - 数值不变量、特征类等
5. **分析 Analysis** - 解析方面的性质
6. **代数 Algebra** - 代数结构、理想等
7. **逻辑 Logic** - 逻辑框架、形式化
8. **应用 Application** - 实际应用、计算

每条公式用不同的颜色标记其所属族。

---

### Q14: 星团的 6 个领域是什么？

**A:** 猜想星团的 6 个领域分布在球面上：

1. **Hodge 理论** - Hodge 猜想、Hodge 标准猜想等
2. **模空间理论** - 模空间、K-稳定性相关
3. **代数闭包** - 分圆、Galois 理论相关
4. **拓扑方法** - 拓扑不变量、上同调相关
5. **计算复杂性** - 算法、计算性相关
6. **函数论** - 函数论、解析相关

这个分布让相似的猜想在球面上聚集在一起。

---

## 技术相关 · Technical

### Q15: 项目用了什么技术栈？

**A:** 

**前端：**
- React 18 - UI 框架
- Three.js - 3D 渲染
- Vite - 构建工具
- GLSL - 着色器

**后端：**
- Node.js - 数据处理
- Express（可选）- API

**构建 & 部署：**
- Vercel / Netlify - 前端部署
- Docker - 容器化

**测试 & 验证：**
- Jest - 单元测试
- Puppeteer - 端到端测试

---

### Q16: 能在本地运行吗？

**A:** 完全可以！需求：

```bash
# 环境要求
- Node.js 18+
- npm 9+

# 安装和运行
git clone https://github.com/wenze-wu-math/Formula-Nebula.git
cd Formula-Nebula
npm install
npm run dev        # 开发服务器，http://localhost:5175

# 或查看其他命令
npm run build      # 生产构建
npm run preview    # 预览构建
npm run verify     # 运行验证脚本
```

详见 [DEPLOYMENT-GUIDE.md](./DEPLOYMENT-GUIDE.md)

---

### Q17: 如何部署到自己的服务器？

**A:** 几种选择：

**选项 1：一键部署到 Vercel**
```
点击 README.md 中的 "Deploy to Vercel" 按钮
```

**选项 2：部署到 Netlify**
```
连接 GitHub 仓库到 Netlify，自动构建和部署
```

**选项 3：Docker 部署**
```bash
docker build -t formula-nebula .
docker run -p 3000:3000 formula-nebula
```

**选项 4：手动部署**
```bash
npm run build
# 将 dist/ 目录上传到你的服务器
```

详见 [DEPLOYMENT-GUIDE.md](./DEPLOYMENT-GUIDE.md) 和 `k8s/` 目录

---

### Q18: 如何修改数据（添加新公式）？

**A:** 数据文件位于 `src/data/` 目录：

1. **修改已有公式**：编辑 JSON 文件
2. **添加新公式**：在相应的 JSON 数组中添加条目
3. **更新关联**：在 edges 数组中添加新的连接
4. **验证数据**：运行验证脚本
   ```bash
   npm run verify
   npm run check-data
   ```

详见 [README.md](../README.md) 的「怎么改内容」部分和贡献指南。

---

## 性能相关 · Performance

### Q19: 应用加载很慢？

**A:** 首次加载需要 3-6 秒来渲染 464 个公式的 LaTeX，这是**正常的**。

**加速方法：**
1. **硬刷新浏览器**：`Ctrl+F5`（清除缓存）
2. **检查网络**：确保网络连接稳定
3. **关掉背景应用**：释放 CPU 资源
4. **使用 Chrome**：通常性能最好

如果仍然很慢（>10 秒）：
```bash
# 本地调试性能
npm run perf
```

详见 [PERFORMANCE.md](./PERFORMANCE.md)

---

### Q20: 在手机上能用吗？

**A:** 部分支持：

✅ **可以**：
- 基础旋转/缩放（手指拖拽）
- 查看公式详情
- 搜索功能

❌ **不推荐**：
- 小屏幕上公式太小
- 触摸精度不够
- 性能可能较差

**建议**：在电脑/平板上使用体验最佳。

---

### Q21: 支持离线使用吗？

**A:** 部分支持：

**支持离线的**：
- 将站点下载到本地运行
- PWA 缓存（如果启用）

**需要网络的**：
- 第一次加载
- MathJax 字体下载

本地部署最完整：
```bash
npm install && npm run build
npm run preview  # 离线访问
```

---

## 贡献相关 · Contribution

### Q22: 我想要贡献代码，从哪里开始？

**A:** 按以下步骤：

1. **阅读** [CONTRIBUTOR-PATH.md](./CONTRIBUTOR-PATH.md)
2. **Fork** 仓库
3. **创建分支**：`git checkout -b feature/your-feature`
4. **做出改变**
5. **运行测试**：`npm run verify`
6. **提交 PR**
7. **等待审查**

详见 [BEGINNER_GUIDE.md](./BEGINNER_GUIDE.md)

---

### Q23: 我可以添加新的数学公式吗？

**A:** 可以！步骤：

1. 在 `src/data/theorems.js` 中添加条目
2. 在 `src/data/edges.js` 中添加关联
3. 添加对应的英文翻译
4. 运行验证：`npm run check-data`
5. 提交 PR

**要求**：
- 公式必须是已发表的、经过同行评审的
- 提供出处和学术参考
- 包括英文名称和中文名称

---

### Q24: 如果我发现了 bug 怎么办？

**A:** 
1. 检查 [Issues](https://github.com/wenze-wu-math/Formula-Nebula/issues) 中是否已有相同报告
2. 如果没有，创建新的 Issue，包含：
   - 问题描述
   - 复现步骤
   - 预期行为 vs 实际行为
   - 浏览器和系统信息
   - 截图或视频（如适用）
3. 等待维护者回复

---

### Q25: 项目的许可证是什么？

**A:** 公式诗云使用 **MIT 许可证**。

这意味着您可以：
- ✅ 自由使用、修改、分发
- ✅ 用于商业用途
- ✅ 私自使用

要求：
- 保留许可证和版权声明

详见根目录的 LICENSE 文件。

---

### Q26: 如何和贡献者社区联系？

**A:** 多种方式：

1. **GitHub Issues** - 报告问题、讨论功能
2. **GitHub Discussions** - 更自由的讨论
3. **Pull Requests** - 代码审查
4. **Email** - 联系维护者

维护者：[@wenze-wu-math](https://github.com/wenze-wu-math)

---

## 更多帮助

### 找不到答案？

- 📖 查看完整文档：[docs/](./docs/)
- 🎓 教程：[TUTORIAL-GUIDE.md](./TUTORIAL-GUIDE.md)
- 👤 用户指南：[USER-GUIDE.md](./USER-GUIDE.md)
- 🐛 报告问题：[GitHub Issues](https://github.com/wenze-wu-math/Formula-Nebula/issues)
- 💬 讨论：[GitHub Discussions](https://github.com/wenze-wu-math/Formula-Nebula/discussions)

---

**最后更新**：2026 年 11 月  
**下一次更新计划**：2026 年 12 月

