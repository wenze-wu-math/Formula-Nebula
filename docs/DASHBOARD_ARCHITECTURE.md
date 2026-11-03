# 分析仪表板技术架构 (Technical Architecture)

## 系统概览

```
┌─────────────────────────────────────────────────────────┐
│           数据流程 (Data Pipeline)                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  User Data               Analysis Engine                │
│  (JSON files)     ────→  AnalyticsEngine     ────→      │
│                           - trackUserBehavior()         │
│                           - analyzeConversionFunnel()   │
│  Demo Data                - analyzeFeatureUsage()       │
│  (Generated)              - analyzeRetention()          │
│                                                         │
│                              ↓                          │
│                                                         │
│                    Metrics Object                       │
│                    {                                    │
│                      userBehavior: {...},              │
│                      conversionFunnel: {...},          │
│                      featureAnalysis: {...},           │
│                      retentionAnalysis: {...}          │
│                    }                                    │
│                              ↓                          │
│                                                         │
│                   DashboardGenerator                    │
│                   buildHTMLDashboard()    ────→         │
│                                                         │
│                              ↓                          │
│                                                         │
│                      HTML Dashboard                     │
│                  (with Chart.js visualizations)         │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## 核心类设计

### 1. AnalyticsEngine
**职责**: 数据分析和指标计算

```
AnalyticsEngine
├── trackUserBehavior()
│   ├── 计算总交互数
│   ├── 汇总可视化使用频率
│   ├── 统计任务完成率
│   └── 生成参与度分布
├── analyzeConversionFunnel()
│   ├── 定义5个转化阶段
│   ├── 计算各阶段转化率
│   └── 分析流失率
├── analyzeFeatureUsage()
│   ├── 统计4个可视化使用量
│   ├── 计算平均理解度
│   ├── 计算平均参与度
│   └── 生成综合评分
└── analyzeRetention()
    ├── 计算日1/7/30留存率
    ├── 识别风险/忠实用户
    └── 生成留存趋势曲线
```

### 2. DashboardGenerator
**职责**: HTML仪表板生成

```
DashboardGenerator
├── buildHTMLDashboard()
│   ├── 生成HTML骨架
│   ├── 嵌入CSS样式
│   ├── 渲染数据表格
│   ├── 嵌入Chart.js配置
│   └── 添加交互脚本
├── calculateAverageEngagement()
│   └── 计算平均参与度
├── getEngagementLevel()
│   └── 参与度评级
└── getSeverityLevel()
    └── 流失率严重程度评级
```

### 3. DataLoader
**职责**: 数据加载和预处理

```
DataLoader
├── loadAllData()
│   ├── 检查数据目录
│   ├── 读取JSON文件
│   ├── 解析参与者数据
│   └── 返回会话数组
└── generateDemoData()
    ├── 生成20个参与者
    ├── 每个4个任务
    ├── 随机参数
    └── 模拟真实数据
```

## 数据流程详解

### 输入: 用户会话数据
```javascript
Session = {
  participantId: string,
  timestamp: ISO8601,
  tasks: Task[],
  demographics: Demographics,
  finalRankings: Ranking[],
  qualitativeResponses: object
}

Task = {
  visualizationMode: enum("atlas"|"map"|"manuscript"|"nebula"),
  comprehensionScore: float[0-5],      // 理解度
  engagementScore: float[1-7],         // 参与度
  comprehensionTime: milliseconds,     // 时间
  interactionCount: integer,           // 交互次数
  interactionType: string              // 交互类型
}
```

### 处理: 四层分析

#### 第1层: 用户行为跟踪
```
输入: sessions[]
└─ 遍历每个会话
   ├─ 统计总交互数 = sum(task.interactionCount)
   ├─ 按可视化分类统计
   ├─ 计算平均时长 = sum(time) / count / 1000
   └─ 分类参与度分布
输出: userBehavior{
  totalSessions, totalInteractions, averageSessionDuration,
  visualizationUsage, taskCompletionRate, engagementPattern
}
```

#### 第2层: 转化漏斗
```
输入: sessions[]
└─ 定义5个阶段
   1. 初始化 (Initiated): 会话数
   2. 已开始 (Started): 有≥1任务
   3. 已参与 (Engaged): 平均参与 > 4
   4. 已完成 (Completed): 全部4任务
   5. 满意 (Satisfied): 理解>3 AND 参与>5
└─ 计算各阶段转化率 = stageCurrent/stageInitial * 100
└─ 计算流失率 = (1 - next/current) * 100
输出: conversionFunnel{
  stages[], dropoff{}
}
```

#### 第3层: 特征分析
```
输入: sessions[]
└─ 对每个可视化类型
   ├─ 统计使用次数
   ├─ 计算平均理解度
   ├─ 计算平均参与度
   └─ 生成综合评分
   
综合评分 = (理解度 + 参与度/1.4) / 2
└─ 范围: 0-5分

输出: featureAnalysis{
  visualizations{}, mostUsedVisualization,
  topPerformingFeature, interactionTypesArray
}
```

#### 第4层: 保留率分析
```
输入: sessions[]
└─ 根据完成度计算留存
   ├─ 日1: 任务数 > 0 → 100% 初始
   ├─ 日7: 完成 >= 2 → 中期留存
   └─ 日30: 完成 == 4 AND 参与 > 5 → 长期留存
└─ 分类风险用户: 参与 < 3
└─ 分类忠实用户: 完成全部 AND 参与 > 6
└─ 生成日X留存曲线 (模拟衰减)
输出: retentionAnalysis{
  day1, day7, day30, dayXRetention,
  churnRisk, loyalUsers
}
```

### 输出: 交互式HTML仪表板

```
HTML结构:
├── <head>
│   ├── Meta标签 (响应式)
│   ├── Chart.js库 (CDN)
│   └── 嵌入式CSS (完整样式)
├── <body>
│   ├── 容器 (.container)
│   ├── 顶部摘要 (.header)
│   │   ├── 标题和描述
│   │   └── 4个KPI卡片
│   ├── 用户行为部分 (.section)
│   │   ├── 2个图表 (Doughnut + Bar)
│   │   ├── 数据表格
│   │   └── 高亮指标
│   ├── 转化漏斗部分 (.section)
│   │   ├── 1个图表 (Horizontal Bar)
│   │   ├── 漏斗可视化
│   │   └── 流失率表格
│   ├── 特征分析部分 (.section)
│   │   ├── 2个图表 (Radar + Pie)
│   │   └── 性能表格
│   ├── 保留率分析部分 (.section)
│   │   ├── 1个图表 (Line)
│   │   ├── KPI显示
│   │   └── 趋势表格
│   └── 页脚 (.footer)
└── <script>
    └── Chart.js初始化脚本 (6个图表)
```

## 图表配置

### 6个交互式Chart.js图表

1. **visualizationUsageChart** (Doughnut)
   - 显示: 4个可视化使用分布
   - 颜色: 四色系
   - 交互: 点击图例切换显示

2. **engagementDistributionChart** (Bar)
   - 显示: 参与度分段用户数
   - 分段: 1-2低 / 3-4中 / 5-6高 / 7非常高
   - 交互: 悬停显示数值

3. **funnelChart** (Horizontal Bar)
   - 显示: 5阶段用户数和百分比
   - 长度: 对应转化率
   - 颜色: 渐进式

4. **featurePerformanceChart** (Radar)
   - 显示: 2个维度 (理解度+参与度)
   - 维度: 4个可视化
   - 形状: 雷达图

5. **interactionTypesChart** (Pie)
   - 显示: Top 5交互类型
   - 比例: 占比
   - 交互: 点击图例

6. **retentionCurveChart** (Line)
   - 显示: 6个时间点留存率
   - 时间: Day 1, 2, 3, 7, 14, 30
   - 趋势: 曲线展示衰减

## 性能考虑

### 时间复杂度
| 操作 | 复杂度 | 耗时 |
|------|--------|------|
| 数据加载 | O(n) | <100ms |
| 用户行为分析 | O(n·m) | <50ms |
| 转化漏斗 | O(n·m) | <30ms |
| 特征分析 | O(n·m) | <40ms |
| 保留率分析 | O(n·m) | <30ms |
| HTML生成 | O(n) | <100ms |
| **总计** | **O(n·m)** | **<250ms** |

*n = 会话数, m = 平均任务数(4)*

### 内存使用
- 20个用户会话: ~1-2 MB
- 生成的HTML: ~20 KB
- 运行时内存: <10 MB

## 扩展性

### 支持更多数据源
```javascript
// 添加新的加载器
class NewDataLoader extends DataLoader {
  loadFromAPI() { ... }
  loadFromDatabase() { ... }
  transformData() { ... }
}
```

### 支持更多维度
```javascript
// 添加新的分析方法
analyzeUserSegmentation() { ... }
analyzeBehaviorPatterns() { ... }
predictChurn() { ... }
```

### 支持实时更新
```javascript
// 使用WebSocket + 定时刷新
setInterval(() => {
  loadAllData();
  metrics = engine.analyze();
  updateCharts(metrics);
}, 5000);
```

## 部署选项

### 本地使用
```bash
node tools/analytics-dashboard.mjs
open data/analytics/analytics_dashboard_*.html
```

### 服务器部署
```bash
# Express服务器
app.get('/dashboard', (req, res) => {
  const metrics = analyzeData();
  res.send(new DashboardGenerator(metrics).buildHTMLDashboard());
});

app.listen(3000);
```

### 自动化流程
```bash
# 定时任务 (cron)
0 9 * * * cd /app && node tools/analytics-dashboard.mjs

# 持续集成
- 每次数据更新后自动生成
- 保存到版本控制
- 通知利益相关者
```

## 依赖关系

```
tools/analytics-dashboard.mjs
├── fs (Node.js内置)
├── path (Node.js内置)
├── fileURLToPath (Node.js内置)
├── Chart.js 3.9.1 (CDN - 客户端)
└── 无外部npm依赖 (轻量级)
```

## 浏览器兼容性

| 浏览器 | 支持 |
|--------|------|
| Chrome | ✅ |
| Firefox | ✅ |
| Safari | ✅ |
| Edge | ✅ |
| IE 11 | ⚠️ (需Polyfill) |

## 文件结构

```
Formula Nebula/
├── tools/
│   ├── analytics-dashboard.mjs       # 主生成工具
│   ├── analyze-user-study.mjs        # 统计分析
│   └── user-study-runner.mjs         # 数据收集
├── data/
│   ├── user-study/                   # 输入数据
│   │   └── P*.json
│   └── analytics/                    # 输出仪表板
│       └── analytics_dashboard_*.html
├── docs/
│   ├── DASHBOARD_QUICKSTART.md       # 快速指南
│   └── DASHBOARD_ARCHITECTURE.md     # 本文件
└── ANALYTICS_DASHBOARD_README.md     # 完整文档
```

---

最后更新: 2026-11-03
