# 分析仪表板 - Analytics Dashboard

## 概述 (Overview)

完整的用户分析仪表板生成工具，包含四大核心分析维度：

1. **👥 用户行为跟踪 (User Behavior Tracking)**
   - 用户总数和会话数据
   - 可视化使用分布
   - 参与度等级分类
   - 交互模式分析

2. **🎯 转化漏斗 (Conversion Funnel)**
   - 5阶段转化漏斗：初始化 → 已开始 → 已参与 → 已完成 → 满意
   - 各阶段转化率
   - 流失率分析与严重程度评估

3. **🔍 特征分析 (Feature Analysis)**
   - 四种可视化类型使用统计 (Atlas, Map, Manuscript, Nebula)
   - 平均理解度 (0-5)
   - 平均参与度 (1-7)
   - 综合性能评分
   - 交互类型分布

4. **💫 保留率分析 (Retention Analysis)**
   - 日1、日7、日30留存率
   - 逐日留存趋势曲线
   - 风险用户和忠实用户比例
   - 用户流失指数

---

## 使用方法 (Usage)

### 基本运行
```bash
node tools/analytics-dashboard.mjs
```

### 自定义输出文件
```bash
node tools/analytics-dashboard.mjs --output my-dashboard.html
```

### 输出目录
默认输出到: `data/analytics/analytics_dashboard_<timestamp>.html`

---

## 功能特性 (Features)

### 1. 自动数据加载
- 从 `data/user-study/*.json` 加载真实用户数据
- 如无数据，自动生成演示数据 (20个用户会话)

### 2. 丰富的图表可视化
- **可视化使用分布** - 圆形图 (Doughnut Chart)
- **参与度分布** - 柱状图 (Bar Chart)
- **转化漏斗** - 水平柱状图 (Horizontal Bar)
- **特性性能** - 雷达图 (Radar Chart)
- **交互类型** - 饼图 (Pie Chart)
- **留存趋势** - 折线图 (Line Chart)

### 3. 现代化UI设计
- 渐变色背景和卡片设计
- 响应式布局 (桌面/平板/移动)
- 四色系主题 (#667eea, #764ba2, #f093fb, #4facfe)
- 易于扫描的数据表格

### 4. 数据洞察
- 关键指标高亮显示
- 自动计算转化率和流失率
- 性能评级系统
- 趋势分析

---

## 数据结构 (Data Structure)

### 输入数据格式 (User Session)
```javascript
{
  participantId: "P001",
  timestamp: "2026-11-03T00:09:10Z",
  tasks: [
    {
      visualizationMode: "atlas",
      comprehensionScore: 3.5,      // 0-5
      engagementScore: 5.2,          // 1-7
      comprehensionTime: 45000,      // 毫秒
      interactionCount: 12,
      interactionType: "click"
    },
    // ... 4种可视化各一条
  ],
  demographics: {
    age: 28,
    mathBackground: 3              // 1-5
  },
  qualitativeResponses: {
    q1: "...",
    q2: "...",
    q3: "...",
    q4: "...",
    q5: "..."
  }
}
```

### 输出数据格式 (Dashboard Metrics)
```javascript
{
  userBehavior: {
    totalSessions: 20,
    totalInteractions: 480,
    averageSessionDuration: 145,    // 秒
    visualizationUsage: { atlas: 5, map: 5, ... },
    taskCompletionRate: 75.0,       // %
    engagementPattern: [...]
  },
  conversionFunnel: {
    stages: [...],
    dropoff: {
      initiated_to_started: 0.0,
      started_to_engaged: 15.3,
      // ...
    }
  },
  featureAnalysis: {
    visualizations: {
      atlas: { usage: 5, avgComprehension: 3.2, avgEngagement: 5.1 },
      // ...
    },
    mostUsedVisualization: "atlas",
    topPerformingFeature: "nebula"
  },
  retentionAnalysis: {
    day1: 100,
    day7: 85,
    day30: 60,
    dayXRetention: [...],
    churnRisk: 10,                  // %
    loyalUsers: 45                  // %
  }
}
```

---

## 分析指标解释 (Metrics Explanation)

### 用户行为跟踪
| 指标 | 说明 | 范围 |
|------|------|------|
| 总交互数 | 所有用户的总交互次数 | > 0 |
| 平均会话时长 | 单个会话平均耗时 | 秒 |
| 任务完成率 | 理解度 > 2.0的任务比例 | 0-100% |
| 参与等级 | 基于参与度评分 | ❌低/⚠️中/✓高/⭐非常高 |

### 转化漏斗
| 阶段 | 条件 | 流失率评级 |
|------|------|----------|
| 初始化 | 开始会话 | - |
| 已开始 | 至少1个任务 | < 10%为✓良好 |
| 已参与 | 平均参与度 > 4 | 10-30%为⚠️中等 |
| 已完成 | 全部4个任务 | 30-50%为⚠️高 |
| 满意 | 理解度 > 3 且参与度 > 5 | > 50%为❌严重 |

### 特征分析
| 指标 | 说明 | 使用 |
|------|------|------|
| 使用次数 | 该特性被使用的次数 | 计数 |
| 平均理解度 | 0-5等级平均值 | 越高越好 |
| 平均参与度 | 1-7李克特等级平均值 | 越高越好 |
| 综合评分 | (理解度 + 参与度/1.4) / 2 | 0-5 |

### 保留率分析
| 指标 | 说明 | 含义 |
|------|------|------|
| 日1留存率 | 第1天仍有任务的用户 | 初始参与度 |
| 日7留存率 | 至少完成2个任务的用户 | 短期参与度 |
| 日30留存率 | 全部任务完成+参与度>5的用户 | 长期忠诚度 |
| 风险用户 | 平均参与度 < 3的用户 | 需要改进 |
| 忠实用户 | 完成所有任务+参与度>6的用户 | 核心用户 |

---

## 文件位置 (File Locations)

- **生成工具**: `tools/analytics-dashboard.mjs`
- **输出目录**: `data/analytics/`
- **演示数据**: 自动生成（无真实数据时）
- **用户研究数据**: `data/user-study/P*.json`

---

## 示例输出 (Example Output)

仪表板包含以下部分：

1. **顶部摘要卡片** - 关键KPI总览
2. **用户行为部分** - 可视化使用和参与度分析
3. **转化漏斗部分** - 分段转化路径和流失率
4. **特征分析部分** - 各功能的性能对比
5. **保留率部分** - 用户留存和流失趋势
6. **底部信息** - 生成时间和数据周期

---

## 扩展可能性 (Extensions)

可以扩展以支持:
- [ ] 实时数据更新
- [ ] 导出为PDF/CSV
- [ ] 自定义时间范围分析
- [ ] A/B测试对比
- [ ] 细分用户群体分析
- [ ] 预测性分析
- [ ] 自动报警规则

---

## 命令行选项 (CLI Options)

```bash
--output <file>     指定输出文件路径
--help             显示帮助信息
```

---

## 许可证 (License)

Formula Nebula 项目一部分

## 生成日期: 2026-11-03
