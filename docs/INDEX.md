# 分析仪表板文档索引 (Documentation Index)

## 概述

这是Formula Nebula用户研究项目的**分析仪表板**文档中心。包含4大分析维度：
1. 用户行为跟踪 (User Behavior Tracking)
2. 转化漏斗 (Conversion Funnel)
3. 特征分析 (Feature Analysis)
4. 保留率分析 (Retention Analysis)

---

## 文档导航

### 新用户入门
**耗时: 5-10分钟**

1. **[快速开始指南](DASHBOARD_QUICKSTART.md)** ⚡
   - 一分钟快速生成仪表板
   - 四大分析维度简介
   - 实际应用场景
   - 常见问题解答

### 完整使用指南
**耗时: 30分钟**

2. **[仪表板完整文档](../ANALYTICS_DASHBOARD_README.md)** 📖
   - 功能特性详解
   - 数据结构说明
   - 所有指标解释
   - 扩展可能性
   - 命令行选项

### 技术实现
**耗时: 20分钟** (仅适合开发者)

3. **[技术架构文档](DASHBOARD_ARCHITECTURE.md)** 🔧
   - 系统设计概览
   - 核心类详解
   - 数据流程分析
   - 性能优化
   - 部署选项

### 快速参考
**耗时: 3分钟** (随时查阅)

4. **[部署总结](../ANALYTICS_DASHBOARD_SUMMARY.txt)** ✨
   - 一页纸总结
   - 关键指标速查
   - 快速命令行指南

---

## 快速命令

### 生成仪表板
```bash
cd "D:\xiangmu\Formula Nebula"
node tools/analytics-dashboard.mjs
```

### 自定义输出
```bash
node tools/analytics-dashboard.mjs --output my-dashboard.html
```

### 查看结果
```bash
open data/analytics/analytics_dashboard_*.html
```

---

## 主要功能

| 功能 | 说明 | 文档位置 |
|------|------|---------|
| 用户行为追踪 | 用户交互数据聚合 | DASHBOARD_QUICKSTART.md#1️⃣ |
| 转化漏斗分析 | 5阶段用户转化路径 | DASHBOARD_QUICKSTART.md#2️⃣ |
| 特征性能对比 | 4个可视化性能排名 | DASHBOARD_QUICKSTART.md#3️⃣ |
| 保留率分析 | 日1/7/30留存率 | DASHBOARD_QUICKSTART.md#4️⃣ |
| 交互式图表 | 6个Chart.js图表 | DASHBOARD_ARCHITECTURE.md#图表配置 |
| 自动数据生成 | 无数据时演示数据 | ANALYTICS_DASHBOARD_README.md#Data结构 |

---

## 关键指标参考表

### 健康指标阈值

| 指标 | 优秀 | 良好 | 需改进 |
|------|------|------|--------|
| 任务完成率 | >80% | 70-80% | <70% |
| 日1留存率 | >95% | 90-95% | <90% |
| 日7留存率 | >70% | 60-70% | <60% |
| 日30留存率 | >50% | 40-50% | <40% |
| 平均参与度 | >5.0 | 4.0-5.0 | <4.0 |
| 转化流失率 | <10% | 10-30% | >30% |

详见: DASHBOARD_QUICKSTART.md#关键指标参考

---

## 文件结构

```
Formula Nebula/
├── tools/
│   └── analytics-dashboard.mjs          ← 主工具 (36 KB)
├── data/
│   ├── user-study/                      ← 输入数据
│   └── analytics/                       ← 输出仪表板
│       └── analytics_dashboard_*.html   ← 可交互的HTML
├── docs/
│   ├── INDEX.md                         ← 本文件
│   ├── DASHBOARD_QUICKSTART.md          ← 快速开始
│   └── DASHBOARD_ARCHITECTURE.md        ← 技术架构
├── ANALYTICS_DASHBOARD_README.md        ← 完整文档
└── ANALYTICS_DASHBOARD_SUMMARY.txt      ← 一页纸总结
```

---

## 学习路径

### 路径A: 用户/分析师
```
1. 阅读: DASHBOARD_QUICKSTART.md (5分钟)
2. 生成: node tools/analytics-dashboard.mjs (1分钟)
3. 探索: 打开HTML, 查看图表 (5分钟)
4. 分析: 对照关键指标, 制定改进方案 (10分钟)
```

### 路径B: 产品经理
```
1. 阅读: DASHBOARD_QUICKSTART.md (5分钟)
2. 查看: ANALYTICS_DASHBOARD_README.md (20分钟)
3. 分析: 各维度数据, 对标行业 (15分钟)
4. 规划: 制定OKR和改进计划 (20分钟)
```

### 路径C: 开发者
```
1. 查看: DASHBOARD_ARCHITECTURE.md (20分钟)
2. 阅读: tools/analytics-dashboard.mjs源码 (15分钟)
3. 运行: node tools/analytics-dashboard.mjs (1分钟)
4. 扩展: 自定义分析或集成 (30分钟+)
```

---

## 常见问题

**Q: 第一次使用，应该看什么?**
A: 从 [快速开始指南](DASHBOARD_QUICKSTART.md) 开始

**Q: 如何解释仪表板上的数字?**
A: 查看 [关键指标参考表](#关键指标参考表) 或 [完整文档](../ANALYTICS_DASHBOARD_README.md)

**Q: 想了解技术实现?**
A: 阅读 [技术架构文档](DASHBOARD_ARCHITECTURE.md)

**Q: 数据从哪来?**
A: 来自 `data/user-study/` 的JSON文件，或自动生成演示数据

**Q: 如何自定义输出?**
A: 使用 `--output` 选项: `node tools/analytics-dashboard.mjs --output myfile.html`

---

## 关键概念

### 四大分析维度

#### 👥 用户行为跟踪 (User Behavior Tracking)
- 看的是: 用户**如何**与系统交互
- 关键问题: 哪个功能最受欢迎? 参与度如何?
- 主要图表: 使用分布 + 参与度分布

#### 🎯 转化漏斗 (Conversion Funnel)
- 看的是: 用户**从开始到完成**的路径
- 关键问题: 用户在哪里流失? 流失有多严重?
- 主要图表: 漏斗图 + 流失率表格

#### 🔍 特征分析 (Feature Analysis)
- 看的是: 不同功能的**相对性能**
- 关键问题: 哪个功能最好? 哪个需要改进?
- 主要图表: 性能对比 + 评分排名

#### 💫 保留率分析 (Retention Analysis)
- 看的是: 用户**随时间如何流失或忠诚**
- 关键问题: 用户粘性如何? 谁是风险用户?
- 主要图表: 留存曲线 + 趋势分析

---

## 相关工具

### 其他分析工具
- `tools/analyze-user-study.mjs` - 详细统计分析 (ANOVA等)
- `tools/user-study-runner.mjs` - 用户研究数据收集

### 可视化
- 仪表板使用 Chart.js 3.9.1 (CDN加载)
- 支持现代浏览器 (Chrome, Firefox, Safari, Edge)

---

## 版本信息

- **仪表板版本**: 1.0
- **发布日期**: 2026-11-03
- **最后更新**: 2026-11-03
- **项目**: Formula Nebula

---

## 快速链接

| 链接 | 描述 |
|------|------|
| [快速开始](DASHBOARD_QUICKSTART.md) | 5分钟入门 |
| [完整文档](../ANALYTICS_DASHBOARD_README.md) | 30分钟深入 |
| [技术架构](DASHBOARD_ARCHITECTURE.md) | 开发者必读 |
| [一页纸总结](../ANALYTICS_DASHBOARD_SUMMARY.txt) | 随时参考 |

---

## 下一步

1. **现在就开始**: 生成你的第一个仪表板
   ```bash
   node tools/analytics-dashboard.mjs
   ```

2. **理解数据**: 查看四大维度的分析结果

3. **制定改进**: 根据指标优化产品

4. **定期跟踪**: 每周生成一次快照对比进度

---

**准备好开始了吗?** → [快速开始指南](DASHBOARD_QUICKSTART.md)

