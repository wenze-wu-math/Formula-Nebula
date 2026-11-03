# Formula Nebula Tutorial | 使用教程

欢迎来到 Formula Nebula！本教程将帮助你快速上手这个代数几何知识可视化工具。

Welcome to Formula Nebula! This tutorial will help you quickly get started with this algebraic geometry knowledge visualization tool.

---

## 📚 Table of Contents | 目录

1. [First Steps | 入门](#first-steps--入门)
2. [Navigating the Galaxy | 探索星系](#navigating-the-galaxy--探索星系)
3. [Understanding the Structure | 理解结构](#understanding-the-structure--理解结构)
4. [Search & Query | 搜索与查询](#search--query--搜索与查询)
5. [Customization | 自定义](#customization--自定义)
6. [Advanced Features | 高级功能](#advanced-features--高级功能)
7. [Tips & Tricks | 技巧](#tips--tricks--技巧)

---

## First Steps | 入门

### 1. 启动应用 | Launch the Application

```bash
# 开发模式
npm run dev

# 或访问在线版本
# Visit the online version at: https://your-deployment-url.com
```

### 2. 首次加载 | First Load

第一次打开应用时，你会看到：

When you first open the application, you'll see:

1. **加载进度条** - Loading progress bar
   - 464 个公式正在渲染
   - 通常需要 3-6 秒

2. **初始视图** - Initial view
   - 旋涡星系形态
   - 全景模式（主星系 + 猜想星团）
   - 按知识族着色

### 3. 基本操作 | Basic Controls

| 操作 | Action | 效果 | Effect |
|------|--------|------|--------|
| 🖱️ 拖拽 | Drag | 旋转星云 | Rotate nebula |
| 🖱️ 滚轮 | Scroll | 缩放 | Zoom in/out |
| 🖱️ 悬停 | Hover | 显示公式名称 | Show formula name |
| 🖱️ 单击 | Click | 聚焦 + 显示详情 | Focus + show details |
| ⌨️ Esc | Esc | 关闭面板 | Close panels |
| ⌨️ S | S | 打开设置 | Open settings |

---

## Navigating the Galaxy | 探索星系

### 理解视图 | Understanding the View

#### 主星系 (Main Galaxy)
- **扁盘结构** - Disk structure
- **405 个定理** - 405 theorems
- **越靠近中心越重要** - More central = more important
- **4 条旋臂** - 4 spiral arms

#### 猜想星团 (Conjecture Cluster)
- **球状结构** - Spherical structure  
- **59 个猜想** - 59 conjectures
- **按球心距排列** - Arranged by distance from center
- **状态色点** - Status indicators

### 切换视图 | Switch Views

1. 点击右上角 **⚙ 设置** 图标
2. 在 **取景** 部分选择：
   - **全景** - 看到主星系和猜想星团
   - **主星系** - 只看定理
   - **猜想星团** - 只看猜想

---

## Understanding the Structure | 理解结构

### 颜色编码 | Color Coding

#### 按知识族 (By Family)
8 个不同的知识族，各有独特颜色：

8 different knowledge families, each with a unique color:

- 🟦 **曲线** (Curve) - 代数曲线理论
- 🟩 **曲面** (Surface) - 曲面几何
- 🟪 **概形** (Scheme) - 概形理论
- 🟨 **层** (Sheaf) - 层论
- 🟧 **上同调** (Cohomology) - 上同调理论
- 🟥 **拓扑** (Topology) - 拓扑学
- 🟫 **现代** (Modern) - 现代发展
- ⬜ **交换代数** (Commutative) - 交换代数

#### 猜想状态 (Conjecture Status)
- 🟠 **未解决** (Open) - 仍然悬而未决
- 🟡 **部分解决** (Partial) - 特殊情况下成立
- 🟢 **已证明** (Proved) - 曾经是猜想，现已证明
- 🔴 **已推翻** (Disproved) - 被反例否证

### 大小与亮度 | Size & Brightness

- **更大** = 更重要 | Larger = More important
- **更亮** = 更核心 | Brighter = More foundational
- **光点** = 强调重要性 | Glow = Emphasizes importance

### 连线 | Links

- **粗细** = 关联强度 | Thickness = Link strength
- **颜色** = 关系类型 | Color = Relationship type
  - 蓝色：一般关联 | Blue: General relation
  - 青绿：等价 | Cyan: Equivalent
  - 玫红：蕴含 | Magenta: Implies
  - 草绿：推广 | Green: Generalizes
  - (更多见设置面板)

---

## Search & Query | 搜索与查询

### 基础搜索 | Basic Search

在右上角搜索框输入：

Type in the search box (top right):

```
霍奇        # 搜索"霍奇"
Hodge      # Search "Hodge"
概形        # 搜索"概形"
```

### 高级查询 | Advanced Queries

#### 字段查询 | Field Queries

```
status:open              # 未解决的猜想
importance:>0.9          # 重要度 > 0.9
family:scheme            # 概形族的公式
field:algebraic-geometry # 代数几何领域的猜想
```

#### 组合查询 | Combined Queries

```
family:curve AND importance:>0.8   # 重要的曲线理论
status:open -field:topology        # 非拓扑的未解决猜想
(family:scheme OR family:sheaf)    # 概形或层论
```

### 寻路 | Pathfinding

找到两个知识点之间的关联路径：

Find the connection path between two concepts:

```
概形 -> Hodge猜想
Zariski topology -> cohomology
扎里斯基闭集 -> 陈类
```

**结果显示** | Results show:
- 🔢 **跳数** - Number of hops
- 💰 **代价** - Strength cost
- 📍 **路径** - Full path

---

## Customization | 自定义

### 更改形态 | Change Shape

**设置 → 星系形态**

1. **旋涡星系** (Spiral) - 默认，4 条旋臂
2. **棒旋星系** (Barred) - 中心有"棒"，2 条旋臂
3. **同心环** (Ring) - 16 个同心环
4. **弥散盘** (Diffuse) - 无结构，平滑分布

### 调整参数 | Adjust Parameters

**设置 → 参数**

- **星系自转** - 转得更快/更慢
- **光点大小** - 调整光晕
- **光点亮度** - 更亮或更暗
- **公式亮度** - 整体亮度
- **连线不透明度** - 连线的可见性

### 显示层控制 | Display Controls

**设置 → 显示层**

- ✅ **关联连线** - 显示/隐藏连线（focus/all/off）
- ✅ **猜想星团** - 显示/隐藏星团
- ✅ **背景星云** - 背景旋臂效果
- ✅ **后处理辉光** - Bloom 效果
- ✅ **图例** - 颜色图例

### 引力模式 | Gravity Mode

**设置 → 引力 → 启用**

- 相机随星系一起旋转
- 公式在屏幕上保持静止
- 更容易阅读和点击

---

## Advanced Features | 高级功能

### 1. 深度链接 | Deep Linking

URL 完全编码了当前状态，可以直接分享：

The URL fully encodes the current state for sharing:

```
# 聚焦特定节点
https://example.com/#node=hodge-conjecture

# 特定配置
https://example.com/#shape=barred&view=cluster&color=status
```

### 2. 导出 | Export

**左下角"导出 SVG"按钮**

- 导出当前视图为 SVG 矢量图
- 俯视平面图
- 保留颜色和布局

### 3. 性能监控 | Performance Monitoring

**开发模式功能** (Development mode only)

- 点击右上角 ⚡ 图标查看实时性能
- 按 `Ctrl+Shift+P` 打印详细报告
- 监控 FPS、内存、渲染统计

### 4. 键盘快捷键 | Keyboard Shortcuts

| 快捷键 | Shortcut | 功能 | Function |
|--------|----------|------|----------|
| S | S | 打开设置 | Open settings |
| Esc | Esc | 关闭面板 | Close panels |
| Ctrl+Shift+P | Ctrl+Shift+P | 性能报告 | Performance report |

---

## Tips & Tricks | 技巧

### 💡 探索技巧 | Exploration Tips

1. **从核心开始** - Start from the center
   - 核心区域是最基础的概念
   - The core contains the most foundational concepts

2. **跟随连线** - Follow the links
   - 点击一个公式，查看它的关联
   - Click a formula to see its connections
   - 再点击关联公式继续探索
   - Click a connected formula to continue exploring

3. **使用寻路** - Use pathfinding
   - 发现两个看似无关概念的联系
   - Discover how seemingly unrelated concepts connect
   - 理解数学的整体结构
   - Understand the overall structure of mathematics

4. **尝试不同形态** - Try different shapes
   - 每种形态突出不同的结构特征
   - Each shape highlights different structural features
   - 同心环最直观地展示层级
   - Rings most clearly show hierarchy

### 🎨 视觉技巧 | Visual Tips

1. **调整亮度**
   - 暗环境：降低公式亮度和光点亮度
   - Dark environment: Reduce formula and glow brightness
   - 亮环境：关闭辉光，提高对比度
   - Bright environment: Disable bloom, increase contrast

2. **减少拥挤感**
   - 切换到主星系或星团单独视图
   - Switch to galaxy-only or cluster-only view
   - 缩放到感兴趣的区域
   - Zoom to region of interest
   - 关闭不需要的连线
   - Turn off unnecessary links

3. **引力模式读字**
   - 整盘视图时公式很小
   - Formulas are small in full view
   - 启用引力模式让它们静止
   - Enable gravity mode to freeze them
   - 或直接点击感兴趣的公式
   - Or click directly on formulas of interest

### 🔍 学习技巧 | Learning Tips

1. **系统学习路径**
   ```
   入门：扎里斯基拓扑 → 概形 → 层
   进阶：上同调 → 陈类 → 曲线
   高级：标准猜想 → Hodge猜想
   ```

2. **按领域探索**
   - 代数几何：scheme, cohomology, sheaf
   - 曲线理论：curve, Riemann-Roch
   - 现代理论：K-theory, motives

3. **理解证明**
   - 点击公式 → "阅读证明与知识脉络"
   - 查看证明步骤和相关知识
   - 注意：部分公式暂无详细证明数据

### 📱 移动端使用 | Mobile Usage

虽然 Formula Nebula 主要为桌面设计，但也可以在移动设备上使用：

While primarily designed for desktop, Formula Nebula works on mobile:

1. **横屏使用** - Use landscape orientation
2. **双指缩放** - Pinch to zoom
3. **单指拖拽旋转** - Single finger to rotate
4. **轻触查看详情** - Tap to view details

---

## Troubleshooting | 故障排除

### 常见问题 | Common Issues

#### Q: 加载很慢 | Loading is slow
**A:** 首次加载需要渲染 464 个公式，这需要几秒钟。之后会缓存，再次访问会快得多。

First load needs to render 464 formulas, which takes a few seconds. Subsequent visits use cached data and are much faster.

#### Q: 公式太小看不清 | Formulas are too small
**A:** 这是设计如此。解决方法：
1. 滚轮放大
2. 点击公式聚焦
3. 切换到单独视图（主星系或星团）
4. 启用引力模式

This is by design. Solutions:
1. Zoom in with scroll wheel
2. Click formulas to focus
3. Switch to single view (galaxy or cluster only)
4. Enable gravity mode

#### Q: 性能不佳/卡顿 | Poor performance/lag
**A:** 尝试以下优化：
1. 关闭后处理辉光
2. 减少连线显示（设为 focus）
3. 降低光点亮度
4. 关闭公式浮动动画
5. 使用更强大的 GPU

Try these optimizations:
1. Disable bloom
2. Reduce links (set to focus)
3. Lower glow brightness
4. Disable formula bob animation
5. Use a more powerful GPU

#### Q: 搜索找不到结果 | Search returns no results
**A:** 检查：
1. 拼写是否正确
2. 尝试英文名或中文名
3. 使用部分关键词
4. 查看控制台是否有错误信息

Check:
1. Spelling is correct
2. Try English or Chinese name
3. Use partial keywords
4. Check console for errors

---

## Next Steps | 下一步

### 📖 进一步阅读 | Further Reading
- [API Documentation](API.md) - 程序化使用
- [Contributing Guide](../CONTRIBUTING.md) - 如何贡献
- [Roadmap](../ROADMAP.md) - 未来计划

### 💬 获取帮助 | Get Help
- [GitHub Discussions](https://github.com/wenze-wu-math/Formula-Nebula/discussions) - 提问和讨论
- [Issue Tracker](https://github.com/wenze-wu-math/Formula-Nebula/issues) - 报告 bug

### 🎓 学习资源 | Learning Resources
- Hartshorne's "Algebraic Geometry"
- The Stacks Project
- nLab

---

## Conclusion | 结语

Formula Nebula 不仅是一个可视化工具，更是一个探索数学结构和美的平台。希望它能帮助你：

Formula Nebula is not just a visualization tool, but a platform for exploring mathematical structure and beauty. We hope it helps you:

- 🔭 **发现** 数学知识之间的联系 | **Discover** connections between concepts
- 🧭 **导航** 复杂的理论体系 | **Navigate** complex theoretical systems  
- 💡 **理解** 代数几何的整体架构 | **Understand** the overall architecture of algebraic geometry
- 🎨 **欣赏** 数学的内在美 | **Appreciate** the inherent beauty of mathematics

Happy exploring! 祝探索愉快！🚀

---

**Last Updated**: 2026-11-03  
**Version**: 0.1.1  
**Feedback**: [Open an issue](https://github.com/wenze-wu-math/Formula-Nebula/issues/new/choose)
