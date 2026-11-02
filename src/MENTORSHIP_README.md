# 公式诗云 · 师徒匹配系统

## 📚 概述

智能师徒匹配系统,为代数几何学习者提供个性化导师推荐、学习计划制定和进度追踪。

### 核心特性

1. **智能匹配算法** - 多维度评分系统,精准匹配导师与学生
2. **个性化学习计划** - 根据学习者背景和目标自动生成分阶段计划
3. **里程碑追踪** - 可视化进度管理,健康度评估
4. **师徒沟通** - 进度更新、问题咨询、反馈交流
5. **市场界面** - 直观的浏览、筛选、申请体验

---

## 🚀 快速开始

### 1. 引入核心模块

```javascript
import {
  MatchMentorMentee,
  ApplyForMentorship,
  CreateMentoringPlan,
  TrackMilestones,
  SendMentoringUpdate
} from './mentorship.js';
```

### 2. 初始化UI界面

```javascript
import { initMentorshipMarketplace } from './mentorship-ui.js';

// 在HTML中创建容器
// <div id="mentorship-marketplace"></div>

const marketplace = initMentorshipMarketplace('mentorship-marketplace');
```

### 3. 查看演示

在浏览器中打开 `mentorship-demo.html`:

```bash
# 使用本地服务器
python -m http.server 8000
# 或
npx serve .

# 访问 http://localhost:8000/src/mentorship-demo.html
```

---

## 📖 API 文档

### 核心函数

#### 1. MatchMentorMentee(learner)

智能匹配导师与学习者。

**参数:**
```javascript
const learner = {
  id: "learner_001",
  name: "张三",
  interests: ["代数几何", "scheme理论"],
  currentLevel: "硕士",
  goals: ["深入学习代数几何", "准备博士申请"],
  learningStyle: "理论型",  // "视觉型" | "听觉型" | "实践型" | "理论型"
  timeCommitment: 15,        // 每周小时数
  background: ["抽象代数", "拓扑学"]
};
```

**返回:**
```javascript
{
  suggestions: [
    {
      mentor: {/* 导师档案 */},
      score: 85,              // 匹配度评分 (0-100)
      breakdown: {            // 分项评分
        expertise: 0.9,
        teachingStyle: 0.8,
        availability: 0.85,
        rating: 0.96,
        levelMatch: 1.0
      },
      reasons: [
        "专业高度契合: 代数几何, scheme理论",
        "高评分导师 (4.8/5.0)"
      ],
      estimatedWeeklyHours: 3
    },
    // ... 更多推荐
  ],
  totalMatches: 3,
  learnerProfile: {/* 学习者档案 */}
}
```

**匹配算法维度:**
- **专业领域匹配度** (40%) - 完全匹配 > 部分匹配 > 相关领域
- **教学风格契合度** (25%) - 根据学习风格推荐教学方式
- **可用性匹配** (15%) - 导师时间与学习者投入时间匹配
- **导师评分** (10%) - 历史评分越高越优先
- **学术水平匹配** (10%) - 满足导师最低水平要求

---

#### 2. ApplyForMentorship(learnerId, mentorId, motivation)

申请导师指导。

**参数:**
```javascript
const learnerId = "learner_001";
const mentorId = "mentor_001";
const motivation = `
  我对代数几何非常感兴趣,希望在您的指导下系统学习...
  (建议至少100字,详细说明学习目标、背景知识、时间承诺)
`;
```

**返回:**
```javascript
{
  success: true,
  status: "pending",
  applicationId: "app_1234567890_abc123",
  message: "申请已提交,导师将在3个工作日内审核",
  qualityScore: 85,  // 申请质量评分 (0-100)
  qualityFeedback: {
    level: "excellent",  // "excellent" | "good" | "needs_improvement"
    message: "申请质量优秀,详细的动机说明将提高通过率",
    tips: []
  },
  estimatedResponseTime: "3个工作日",
  nextSteps: [
    "导师将审核您的申请",
    "如果通过,导师会与您联系安排初次会面",
    "初次会面后将制定个性化学习计划"
  ]
}
```

**申请质量评分标准:**
- 动机长度 (20分): ≥200字得满分
- 具体目标 (30分): 包含明确学习目标
- 背景知识 (25分): 说明已掌握的知识
- 档案完整度 (25分): 兴趣、目标、背景完整

---

#### 3. CreateMentoringPlan(pair)

为师徒配对创建个性化学习计划。

**参数:**
```javascript
const pair = {
  mentorshipId: "mentorship_1234567890_xyz",
  focusAreas: ["代数几何", "scheme理论"],
  durationWeeks: 12  // 计划周期(周)
};
```

**返回:**
```javascript
{
  success: true,
  plan: {
    id: "plan_1234567890",
    mentorshipId: "mentorship_1234567890_xyz",
    focusAreas: ["代数几何", "scheme理论"],
    duration: 12,
    startDate: Date,
    endDate: Date,
    phases: [
      {
        name: "基础建立",
        duration: 4,
        weeks: [1, 4],
        goals: [
          "掌握核心概念和基本定义",
          "建立知识框架",
          "熟悉相关数学工具"
        ],
        activities: [
          "阅读基础教材章节",
          "完成基础练习题",
          "定期知识点讨论"
        ],
        resources: ["《代数几何基础教程》"]
      },
      // ... 更多阶段
    ],
    resources: {
      books: ["Hartshorne - Algebraic Geometry"],
      papers: ["Grothendieck - EGA系列"],
      onlineCourses: ["公式诗云 · Formula Nebula (本平台)"],
      tools: ["Macaulay2 (计算代数软件)", "LaTeX (数学排版)"]
    },
    meetingSchedule: {
      frequency: "每周",
      format: "在线会议",
      duration: "1-2小时"
    },
    objectives: [/* 学习目标列表 */],
    assessmentMethods: [
      "定期知识检查",
      "项目实践",
      "论文阅读汇报",
      "问题解决能力评估"
    ]
  },
  milestones: [
    {
      id: "milestone_1",
      title: "基础建立 - 里程碑 1",
      phase: "基础建立",
      targetWeek: 2,
      targetDate: Date,
      description: "掌握核心概念和基本定义",
      deliverables: ["阅读基础教材章节", "完成基础练习题"],
      status: "pending",  // "pending" | "in_progress" | "completed" | "delayed"
      progress: 0,
      notes: []
    },
    // ... 更多里程碑
  ],
  summary: {
    duration: "12周",
    phases: 3,
    totalMilestones: 9,
    focusAreas: ["代数几何", "scheme理论"],
    nextSteps: [
      "第一阶段: 基础建立",
      "首个里程碑: 基础建立 - 里程碑 1",
      "下次会面: 每周"
    ]
  }
}
```

**学习计划结构:**
- **第一阶段: 基础建立** (1/3 时间) - 掌握核心概念
- **第二阶段: 深入学习** (1/3 时间) - 理解高级理论
- **第三阶段: 实践应用** (1/3 时间) - 独立研究项目

---

#### 4. TrackMilestones(mentorshipId)

追踪师徒关系的里程碑进度。

**参数:**
```javascript
const mentorshipId = "mentorship_1234567890_xyz";
```

**返回:**
```javascript
{
  mentorshipId: "mentorship_1234567890_xyz",
  elapsedWeeks: 5,
  totalWeeks: 12,
  overallProgress: 45,  // 总体进度百分比
  stats: {
    total: 9,
    completed: 4,
    inProgress: 2,
    pending: 2,
    delayed: 1,
    onTrack: 6
  },
  healthScore: {
    score: 75,
    level: "good",  // "excellent" | "good" | "needs_attention" | "critical"
    label: "良好"
  },
  currentMilestones: [/* 当前进行中的里程碑 */],
  upcomingMilestones: [/* 即将到来的里程碑 */],
  recentlyCompleted: [/* 最近完成的里程碑 */],
  delayedMilestones: [/* 延迟的里程碑 */],
  estimatedCompletionDate: Date,
  recommendations: [
    {
      priority: "medium",  // "high" | "medium" | "low"
      category: "活动启动",
      suggestion: "当前没有进行中的里程碑,建议开始下一个",
      actions: ["启动下一个里程碑", "与导师确认优先级"]
    }
  ],
  timeline: [/* 进度时间线 */]
}
```

**健康度评分算法:**
- 进度因素: 实际进度 vs 预期进度
- 延迟因素: 延迟里程碑比例
- 活动因素: 有进行中的里程碑可加分

---

#### 5. SendMentoringUpdate(pair, update)

发送师徒进度更新通知。

**参数:**
```javascript
const pair = {
  mentorshipId: "mentorship_1234567890_xyz",
  sender: "mentee"  // "mentor" | "mentee"
};

const update = {
  type: "progress",  // "progress" | "question" | "feedback" | "meeting_summary"
  subject: "本周学习总结",
  content: "本周完成了scheme理论的基础学习...",
  attachments: []  // 可选
};
```

**返回:**
```javascript
{
  success: true,
  updateId: "update_1234567890_abc",
  notification: {
    title: "进度更新: 本周学习总结",
    from: "张三",
    to: "李四",
    content: "本周完成了scheme理论的基础学习...",
    timestamp: Date,
    actionRequired: false,
    priority: "normal",  // "high" | "normal"
    metadata: {
      mentorshipId: "mentorship_1234567890_xyz",
      updateId: "update_1234567890_abc",
      phase: "基础建立"
    }
  },
  deliveryStatus: "sent",
  recipient: "mentor",
  timestamp: Date
}
```

---

### 辅助函数

#### GetAvailableMentors()

获取所有可用导师。

```javascript
const result = GetAvailableMentors();
// {
//   total: 3,
//   mentors: [/* 导师列表 */]
// }
```

#### UpdateMilestoneStatus(mentorshipId, milestoneId, status, progress, notes)

更新里程碑状态。

```javascript
const result = UpdateMilestoneStatus(
  "mentorship_123",
  "milestone_1",
  "completed",  // "pending" | "in_progress" | "completed" | "delayed"
  100,          // 进度百分比
  "顺利完成第一个里程碑"
);
```

#### ReplyToUpdate(mentorshipId, updateId, reply)

回复更新消息。

```javascript
const result = ReplyToUpdate(
  "mentorship_123",
  "update_456",
  {
    content: "进度很好!下周可以开始新主题。",
    sender: "mentor"
  }
);
```

#### GetMentorshipStatistics()

获取平台统计数据。

```javascript
const stats = GetMentorshipStatistics();
// {
//   totalMentors: 3,
//   totalLearners: 5,
//   activeMentorships: 2,
//   totalMentorships: 2,
//   pendingApplications: 1,
//   averageRating: "4.77",
//   popularExpertise: [
//     { name: "代数几何", count: 2 },
//     { name: "同调代数", count: 2 }
//   ]
// }
```

---

## 🎨 UI 组件

### MentorshipMarketplace 类

主界面类,管理所有视图和交互。

```javascript
import { MentorshipMarketplace } from './mentorship-ui.js';

const marketplace = new MentorshipMarketplace('container-id');

// 切换视图
marketplace.switchView('matches');  // 'browse' | 'matches' | 'myMentorships' | 'dashboard'

// 显示申请模态框
marketplace.showApplicationModal('mentor_001');
```

### 视图类型

1. **浏览导师 (browse)** - 网格展示所有可用导师,支持搜索和筛选
2. **智能匹配 (matches)** - 填写学习档案,获取个性化推荐
3. **我的师徒 (myMentorships)** - 查看已建立的师徒关系
4. **进度看板 (dashboard)** - 可视化学习进度和里程碑

---

## 🧪 测试

运行完整测试套件:

```bash
node src/mentorship.test.js
```

或在浏览器中:

```javascript
import { runAllTests } from './mentorship.test.js';
runAllTests();
```

### 测试覆盖

- ✅ 匹配导师功能
- ✅ 申请导师功能
- ✅ 审核申请功能
- ✅ 创建学习计划
- ✅ 追踪里程碑
- ✅ 师徒沟通
- ✅ 获取可用导师
- ✅ 获取统计信息
- ✅ 匹配算法测试

---

## 📊 数据结构

### MentorProfile (导师档案)

```typescript
interface MentorProfile {
  id: string;
  name: string;
  expertise: string[];
  experience: number;
  level: "教授" | "博士后" | "博士生" | "硕士生";
  maxMentees: number;
  currentMentees: number;
  teachingStyle: ("理论导向" | "实践优先" | "研讨式" | "项目驱动")[];
  availability: "高" | "中" | "低";
  rating: number;
  preferences: {
    minLevel: string;
    focusAreas: string[];
    communicationFrequency: string;
  };
}
```

### LearnerProfile (学习者档案)

```typescript
interface LearnerProfile {
  id: string;
  name: string;
  interests: string[];
  currentLevel: "本科" | "硕士" | "博士" | "自学者";
  goals: string[];
  learningStyle: "视觉型" | "听觉型" | "实践型" | "理论型";
  timeCommitment: number;
  background: string[];
}
```

### Mentorship (师徒关系)

```typescript
interface Mentorship {
  id: string;
  mentorId: string;
  menteeId: string;
  status: "pending" | "active" | "completed" | "cancelled";
  startDate: Date;
  plan: MentoringPlan | null;
  milestones: Milestone[];
  updates: Update[];
}
```

---

## 🎯 使用场景

### 场景1: 新学习者寻找导师

```javascript
// 1. 填写学习档案
const learnerProfile = {
  id: "learner_001",
  name: "张三",
  interests: ["代数几何", "scheme理论"],
  currentLevel: "硕士",
  goals: ["系统学习代数几何", "准备博士申请"],
  learningStyle: "理论型",
  timeCommitment: 15,
  background: ["抽象代数", "拓扑学"]
};

// 2. 获取匹配推荐
const matches = MatchMentorMentee(learnerProfile);
console.log(`找到 ${matches.suggestions.length} 位匹配导师`);

// 3. 申请最匹配的导师
const topMentor = matches.suggestions[0].mentor;
const application = ApplyForMentorship(
  learnerProfile.id,
  topMentor.id,
  "详细的申请动机..."
);

console.log(`申请已提交,质量评分: ${application.qualityScore}/100`);
```

### 场景2: 导师审核申请并创建计划

```javascript
// 1. 导师审核申请
const review = ReviewApplication(
  "app_123",
  "approved",
  "申请材料优秀,欢迎加入"
);

// 2. 创建学习计划
const plan = CreateMentoringPlan({
  mentorshipId: review.mentorshipId,
  focusAreas: ["代数几何", "scheme理论"],
  durationWeeks: 12
});

console.log(`学习计划已创建,共 ${plan.milestones.length} 个里程碑`);
```

### 场景3: 追踪学习进度

```javascript
// 1. 更新里程碑状态
UpdateMilestoneStatus(
  "mentorship_123",
  "milestone_1",
  "completed",
  100,
  "第一个里程碑顺利完成"
);

// 2. 查看整体进度
const progress = TrackMilestones("mentorship_123");
console.log(`总体进度: ${progress.overallProgress}%`);
console.log(`健康度: ${progress.healthScore.label}`);

// 3. 发送进度更新
SendMentoringUpdate(
  { mentorshipId: "mentorship_123", sender: "mentee" },
  {
    type: "progress",
    subject: "本周学习总结",
    content: "完成了scheme理论第二章的学习..."
  }
);
```

---

## 🔧 自定义配置

### 添加新的专业领域

修改 `mentorship.js` 中的 `areRelatedFields` 函数:

```javascript
const relatedGroups = [
  ["代数几何", "scheme理论", "层论", "代数曲线"],
  ["同调代数", "范畴论", "导出范畴", "三角范畴"],
  // 添加新领域
  ["微分几何", "黎曼几何", "辛几何"],
];
```

### 调整匹配算法权重

修改 `calculateMatchScore` 函数中的权重:

```javascript
const weights = {
  expertise: 0.40,      // 专业领域匹配度
  teachingStyle: 0.25,  // 教学风格契合度
  availability: 0.15,   // 可用性匹配
  rating: 0.10,         // 导师评分
  levelMatch: 0.10      // 学术水平匹配
};
```

### 自定义学习计划阶段

修改 `generateLearningPhases` 函数:

```javascript
phases.push({
  name: "自定义阶段",
  duration: 4,
  weeks: [1, 4],
  goals: ["目标1", "目标2"],
  activities: ["活动1", "活动2"],
  resources: ["资源1"]
});
```

---

## 🌟 最佳实践

### 1. 申请动机撰写

优秀申请动机应包含:
- **为什么选择这位导师**: 具体到导师的研究方向和专长
- **学习目标**: 明确、可衡量的目标
- **背景知识**: 已掌握的相关知识
- **时间承诺**: 每周可投入的时间和精力

### 2. 学习计划执行

- **定期沟通**: 遵循计划的会议频率
- **及时更新**: 完成里程碑后立即更新状态
- **主动反馈**: 遇到困难及时向导师求助
- **记录笔记**: 每个里程碑添加学习笔记

### 3. 进度管理

- **健康度监控**: 保持健康度在"良好"以上
- **延迟处理**: 出现延迟里程碑时及时调整计划
- **阶段回顾**: 每个学习阶段结束后进行总结

---

## 📝 文件结构

```
src/
├── mentorship.js           # 核心逻辑和算法
├── mentorship-ui.js        # UI界面组件
├── mentorship.css          # 样式表
├── mentorship-demo.html    # 演示页面
├── mentorship.test.js      # 测试套件
└── MENTORSHIP_README.md    # 本文档
```

---

## 🤝 贡献

欢迎贡献代码、报告问题或提出建议!

---

## 📄 许可

本项目是公式诗云 (Formula Nebula) 项目的一部分。

---

## 📧 联系方式

如有问题或建议,请通过公式诗云项目主页联系我们。
