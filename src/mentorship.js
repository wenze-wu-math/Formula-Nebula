/**
 * 公式诗云 · Formula Nebula - 师徒匹配系统
 * Mentorship Matching System
 *
 * 智能配对算法 + 学习计划 + 里程碑追踪
 */

// ============================================================================
// 数据结构定义
// ============================================================================

/**
 * 导师档案
 * @typedef {Object} MentorProfile
 * @property {string} id - 导师ID
 * @property {string} name - 姓名
 * @property {string[]} expertise - 专业领域 (e.g., ["代数几何", "同调代数", "范畴论"])
 * @property {number} experience - 经验年限
 * @property {string} level - 学术等级 ("教授", "博士后", "博士生", "硕士生")
 * @property {number} maxMentees - 最大学生数
 * @property {number} currentMentees - 当前学生数
 * @property {string[]} teachingStyle - 教学风格 (["理论导向", "实践优先", "研讨式", "项目驱动"])
 * @property {string} availability - 可用时间 ("高", "中", "低")
 * @property {number} rating - 评分 (1-5)
 * @property {Object} preferences - 偏好设置
 */

/**
 * 学习者档案
 * @typedef {Object} LearnerProfile
 * @property {string} id - 学习者ID
 * @property {string} name - 姓名
 * @property {string[]} interests - 兴趣领域
 * @property {string} currentLevel - 当前水平 ("本科", "硕士", "博士", "自学者")
 * @property {string[]} goals - 学习目标
 * @property {string} learningStyle - 学习风格 ("视觉型", "听觉型", "实践型", "理论型")
 * @property {number} timeCommitment - 每周可投入小时数
 * @property {string[]} background - 已掌握知识
 */

/**
 * 师徒配对
 * @typedef {Object} Mentorship
 * @property {string} id - 配对ID
 * @property {string} mentorId - 导师ID
 * @property {string} menteeId - 学生ID
 * @property {string} status - 状态 ("pending", "active", "completed", "cancelled")
 * @property {Date} startDate - 开始时间
 * @property {Object} plan - 学习计划
 * @property {Object[]} milestones - 里程碑列表
 * @property {Object[]} updates - 进度更新
 */

// ============================================================================
// 数据存储 (模拟数据库)
// ============================================================================

const mentors = new Map();
const learners = new Map();
const mentorships = new Map();
const applications = new Map();

// 初始化示例数据
function initializeSampleData() {
  // 示例导师
  const sampleMentors = [
    {
      id: "mentor_001",
      name: "张三",
      expertise: ["代数几何", "scheme理论", "层论"],
      experience: 10,
      level: "教授",
      maxMentees: 5,
      currentMentees: 2,
      teachingStyle: ["理论导向", "研讨式"],
      availability: "中",
      rating: 4.8,
      preferences: {
        minLevel: "硕士",
        focusAreas: ["代数几何"],
        communicationFrequency: "每周"
      }
    },
    {
      id: "mentor_002",
      name: "李四",
      expertise: ["同调代数", "范畴论", "导出范畴"],
      experience: 7,
      level: "博士后",
      maxMentees: 3,
      currentMentees: 1,
      teachingStyle: ["项目驱动", "实践优先"],
      availability: "高",
      rating: 4.9,
      preferences: {
        minLevel: "本科",
        focusAreas: ["同调代数", "范畴论"],
        communicationFrequency: "双周"
      }
    },
    {
      id: "mentor_003",
      name: "王五",
      expertise: ["交换代数", "奇点理论", "代数曲线"],
      experience: 5,
      level: "博士生",
      maxMentees: 2,
      currentMentees: 0,
      teachingStyle: ["理论导向", "实践优先"],
      availability: "高",
      rating: 4.6,
      preferences: {
        minLevel: "本科",
        focusAreas: ["交换代数"],
        communicationFrequency: "每周"
      }
    }
  ];

  sampleMentors.forEach(mentor => mentors.set(mentor.id, mentor));
}

initializeSampleData();

// ============================================================================
// 核心功能: 匹配算法
// ============================================================================

/**
 * 匹配导师与学习者
 * 使用多维度评分算法
 *
 * @param {LearnerProfile} learner - 学习者档案
 * @returns {Array<{mentor: MentorProfile, score: number, reasons: string[]}>}
 */
export function MatchMentorMentee(learner) {
  if (!learner || !learner.id) {
    throw new Error("Invalid learner profile");
  }

  // 存储学习者档案
  learners.set(learner.id, learner);

  const suggestions = [];

  for (const mentor of mentors.values()) {
    // 跳过已满员的导师
    if (mentor.currentMentees >= mentor.maxMentees) {
      continue;
    }

    const matchScore = calculateMatchScore(mentor, learner);

    if (matchScore.totalScore > 0) {
      suggestions.push({
        mentor,
        score: matchScore.totalScore,
        breakdown: matchScore.breakdown,
        reasons: matchScore.reasons,
        estimatedWeeklyHours: estimateWeeklyCommitment(mentor, learner)
      });
    }
  }

  // 按评分降序排序
  suggestions.sort((a, b) => b.score - a.score);

  return {
    suggestions: suggestions.slice(0, 5), // 返回前5个推荐
    totalMatches: suggestions.length,
    learnerProfile: learner
  };
}

/**
 * 计算匹配评分 (多维度算法)
 * 评分维度:
 * 1. 专业领域匹配度 (40%)
 * 2. 教学风格契合度 (25%)
 * 3. 可用性匹配 (15%)
 * 4. 导师评分 (10%)
 * 5. 学术水平匹配 (10%)
 */
function calculateMatchScore(mentor, learner) {
  const weights = {
    expertise: 0.40,
    teachingStyle: 0.25,
    availability: 0.15,
    rating: 0.10,
    levelMatch: 0.10
  };

  const breakdown = {};
  const reasons = [];

  // 1. 专业领域匹配度
  const expertiseScore = calculateExpertiseMatch(mentor.expertise, learner.interests);
  breakdown.expertise = expertiseScore;

  if (expertiseScore > 0.7) {
    const commonAreas = mentor.expertise.filter(e =>
      learner.interests.some(i => i.includes(e) || e.includes(i))
    );
    reasons.push(`专业高度契合: ${commonAreas.join(", ")}`);
  }

  // 2. 教学风格契合度
  const styleScore = calculateStyleMatch(mentor.teachingStyle, learner.learningStyle);
  breakdown.teachingStyle = styleScore;

  if (styleScore > 0.6) {
    reasons.push(`教学风格适配: ${mentor.teachingStyle.join(", ")}`);
  }

  // 3. 可用性匹配
  const availScore = calculateAvailabilityMatch(
    mentor.availability,
    learner.timeCommitment
  );
  breakdown.availability = availScore;

  // 4. 导师评分 (归一化到0-1)
  const ratingScore = mentor.rating / 5.0;
  breakdown.rating = ratingScore;

  if (mentor.rating >= 4.5) {
    reasons.push(`高评分导师 (${mentor.rating}/5.0)`);
  }

  // 5. 学术水平匹配
  const levelScore = calculateLevelMatch(mentor.preferences.minLevel, learner.currentLevel);
  breakdown.levelMatch = levelScore;

  // 计算加权总分
  const totalScore =
    expertiseScore * weights.expertise +
    styleScore * weights.teachingStyle +
    availScore * weights.availability +
    ratingScore * weights.rating +
    levelScore * weights.levelMatch;

  // 额外加分项
  if (mentor.currentMentees === 0) {
    reasons.push("导师当前有充足时间");
  }

  return {
    totalScore: Math.round(totalScore * 100), // 转换为0-100分
    breakdown,
    reasons
  };
}

/**
 * 计算专业领域匹配度
 */
function calculateExpertiseMatch(mentorExpertise, learnerInterests) {
  if (!learnerInterests || learnerInterests.length === 0) return 0;

  let matchCount = 0;
  const totalInterests = learnerInterests.length;

  for (const interest of learnerInterests) {
    for (const expertise of mentorExpertise) {
      // 完全匹配
      if (interest.toLowerCase() === expertise.toLowerCase()) {
        matchCount += 1.0;
        break;
      }
      // 部分匹配
      if (interest.includes(expertise) || expertise.includes(interest)) {
        matchCount += 0.6;
        break;
      }
      // 相关领域 (简化处理)
      if (areRelatedFields(interest, expertise)) {
        matchCount += 0.3;
        break;
      }
    }
  }

  return Math.min(matchCount / totalInterests, 1.0);
}

/**
 * 判断是否为相关领域
 */
function areRelatedFields(field1, field2) {
  const relatedGroups = [
    ["代数几何", "scheme理论", "层论", "代数曲线"],
    ["同调代数", "范畴论", "导出范畴", "三角范畴"],
    ["交换代数", "代数数论", "局部代数"],
    ["微分几何", "黎曼几何", "辛几何"],
  ];

  for (const group of relatedGroups) {
    const has1 = group.some(f => field1.includes(f) || f.includes(field1));
    const has2 = group.some(f => field2.includes(f) || f.includes(field2));
    if (has1 && has2) return true;
  }

  return false;
}

/**
 * 计算教学风格匹配度
 */
function calculateStyleMatch(teachingStyles, learningStyle) {
  const styleMapping = {
    "视觉型": ["实践优先", "项目驱动"],
    "听觉型": ["研讨式", "理论导向"],
    "实践型": ["项目驱动", "实践优先"],
    "理论型": ["理论导向", "研讨式"]
  };

  const preferredStyles = styleMapping[learningStyle] || [];

  if (preferredStyles.length === 0) return 0.5; // 中性分数

  const matchCount = teachingStyles.filter(ts =>
    preferredStyles.includes(ts)
  ).length;

  return matchCount / preferredStyles.length;
}

/**
 * 计算可用性匹配度
 */
function calculateAvailabilityMatch(mentorAvailability, learnerTimeCommitment) {
  const availabilityMap = {
    "高": { min: 0, max: 20 },
    "中": { min: 5, max: 15 },
    "低": { min: 10, max: Infinity }
  };

  const range = availabilityMap[mentorAvailability];
  if (!range) return 0.5;

  if (learnerTimeCommitment >= range.min && learnerTimeCommitment <= range.max) {
    return 1.0;
  } else if (learnerTimeCommitment < range.min) {
    return 0.7; // 学习者时间少于导师预期
  } else {
    return 0.5; // 学习者时间多于导师可用时间
  }
}

/**
 * 计算学术水平匹配度
 */
function calculateLevelMatch(minLevel, currentLevel) {
  const levelHierarchy = ["自学者", "本科", "硕士", "博士", "博士后"];

  const minIndex = levelHierarchy.indexOf(minLevel);
  const currentIndex = levelHierarchy.indexOf(currentLevel);

  if (minIndex === -1 || currentIndex === -1) return 0.5;

  if (currentIndex >= minIndex) {
    return 1.0; // 满足最低要求
  } else {
    // 差距越大,分数越低
    const gap = minIndex - currentIndex;
    return Math.max(0, 1.0 - gap * 0.3);
  }
}

/**
 * 估算每周所需时间
 */
function estimateWeeklyCommitment(mentor, learner) {
  const baseHours = 2; // 基础交流时间

  const complexityFactor = mentor.teachingStyle.includes("理论导向") ? 1.5 : 1.0;
  const levelFactor = learner.currentLevel === "本科" ? 1.2 : 1.0;

  return Math.ceil(baseHours * complexityFactor * levelFactor);
}

// ============================================================================
// 核心功能: 申请导师
// ============================================================================

/**
 * 申请导师指导
 *
 * @param {string} learnerId - 学习者ID
 * @param {string} mentorId - 导师ID
 * @param {string} motivation - 申请动机
 * @returns {Object} 申请结果
 */
export function ApplyForMentorship(learnerId, mentorId, motivation) {
  // 验证输入
  if (!learnerId || !mentorId || !motivation) {
    throw new Error("Missing required fields: learnerId, mentorId, or motivation");
  }

  const learner = learners.get(learnerId);
  const mentor = mentors.get(mentorId);

  if (!learner) {
    throw new Error(`Learner not found: ${learnerId}`);
  }

  if (!mentor) {
    throw new Error(`Mentor not found: ${mentorId}`);
  }

  // 检查导师是否已满员
  if (mentor.currentMentees >= mentor.maxMentees) {
    return {
      success: false,
      status: "rejected",
      reason: "导师当前学生已满,无法接受新申请"
    };
  }

  // 检查是否已有申请
  const existingApplication = Array.from(applications.values()).find(
    app => app.learnerId === learnerId && app.mentorId === mentorId && app.status === "pending"
  );

  if (existingApplication) {
    return {
      success: false,
      status: "duplicate",
      reason: "您已向该导师提交过申请,请等待审核",
      applicationId: existingApplication.id
    };
  }

  // 创建申请
  const applicationId = `app_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const application = {
    id: applicationId,
    learnerId,
    mentorId,
    motivation,
    status: "pending", // pending, approved, rejected
    submittedAt: new Date(),
    learnerProfile: learner,
    mentorProfile: mentor
  };

  applications.set(applicationId, application);

  // 自动评估申请质量
  const qualityScore = evaluateApplicationQuality(application);

  return {
    success: true,
    status: "pending",
    applicationId,
    message: "申请已提交,导师将在3个工作日内审核",
    qualityScore,
    qualityFeedback: getQualityFeedback(qualityScore),
    estimatedResponseTime: "3个工作日",
    nextSteps: [
      "导师将审核您的申请",
      "如果通过,导师会与您联系安排初次会面",
      "初次会面后将制定个性化学习计划"
    ]
  };
}

/**
 * 评估申请质量
 */
function evaluateApplicationQuality(application) {
  const { motivation, learnerProfile } = application;

  let score = 0;

  // 1. 动机长度 (20分)
  const motivationLength = motivation.length;
  if (motivationLength >= 200) score += 20;
  else if (motivationLength >= 100) score += 15;
  else if (motivationLength >= 50) score += 10;
  else score += 5;

  // 2. 是否包含具体目标 (30分)
  const goalKeywords = ["学习", "掌握", "研究", "理解", "应用", "探索"];
  const hasGoals = goalKeywords.some(kw => motivation.includes(kw));
  if (hasGoals) score += 30;

  // 3. 是否提到背景知识 (25分)
  const backgroundKeywords = ["已学", "了解", "掌握", "接触过", "基础"];
  const hasBackground = backgroundKeywords.some(kw => motivation.includes(kw));
  if (hasBackground) score += 25;

  // 4. 档案完整度 (25分)
  let profileScore = 0;
  if (learnerProfile.interests && learnerProfile.interests.length > 0) profileScore += 8;
  if (learnerProfile.goals && learnerProfile.goals.length > 0) profileScore += 8;
  if (learnerProfile.background && learnerProfile.background.length > 0) profileScore += 9;
  score += profileScore;

  return Math.min(score, 100);
}

/**
 * 获取质量反馈
 */
function getQualityFeedback(score) {
  if (score >= 80) {
    return {
      level: "excellent",
      message: "申请质量优秀,详细的动机说明将提高通过率",
      tips: []
    };
  } else if (score >= 60) {
    return {
      level: "good",
      message: "申请质量良好,建议补充以下信息:",
      tips: [
        "更详细地说明您的学习目标",
        "介绍您当前的知识背景"
      ]
    };
  } else {
    return {
      level: "needs_improvement",
      message: "建议改进申请内容以提高通过率:",
      tips: [
        "详细说明为什么选择这位导师 (至少100字)",
        "列出具体的学习目标",
        "介绍您的学术背景和已掌握的知识",
        "说明您能投入的时间和精力"
      ]
    };
  }
}

/**
 * 导师审核申请 (辅助函数)
 */
export function ReviewApplication(applicationId, decision, feedback = "") {
  const application = applications.get(applicationId);

  if (!application) {
    throw new Error(`Application not found: ${applicationId}`);
  }

  if (application.status !== "pending") {
    throw new Error(`Application already processed: ${application.status}`);
  }

  application.status = decision; // "approved" or "rejected"
  application.reviewedAt = new Date();
  application.feedback = feedback;

  if (decision === "approved") {
    // 创建师徒关系
    const mentorshipId = createMentorshipRelation(
      application.mentorId,
      application.learnerId
    );

    // 更新导师的当前学生数
    const mentor = mentors.get(application.mentorId);
    mentor.currentMentees += 1;

    return {
      success: true,
      status: "approved",
      mentorshipId,
      message: "申请已通过,师徒关系已建立"
    };
  } else {
    return {
      success: true,
      status: "rejected",
      reason: feedback,
      message: "申请未通过"
    };
  }
}

/**
 * 创建师徒关系
 */
function createMentorshipRelation(mentorId, menteeId) {
  const mentorshipId = `mentorship_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const mentorship = {
    id: mentorshipId,
    mentorId,
    menteeId,
    status: "active",
    startDate: new Date(),
    plan: null, // 将通过 CreateMentoringPlan 创建
    milestones: [],
    updates: [],
    meetings: [],
    createdAt: new Date()
  };

  mentorships.set(mentorshipId, mentorship);

  return mentorshipId;
}

// ============================================================================
// 核心功能: 创建学习计划
// ============================================================================

/**
 * 为师徒配对创建个性化学习计划
 *
 * @param {Object} pair - 师徒配对信息
 * @param {string} pair.mentorshipId - 配对ID
 * @param {string[]} pair.focusAreas - 重点领域
 * @param {number} pair.durationWeeks - 计划周期(周)
 * @returns {Object} 学习计划
 */
export function CreateMentoringPlan(pair) {
  const { mentorshipId, focusAreas, durationWeeks = 12 } = pair;

  const mentorship = mentorships.get(mentorshipId);
  if (!mentorship) {
    throw new Error(`Mentorship not found: ${mentorshipId}`);
  }

  const mentor = mentors.get(mentorship.mentorId);
  const mentee = learners.get(mentorship.menteeId);

  if (!mentor || !mentee) {
    throw new Error("Mentor or mentee profile not found");
  }

  // 生成学习计划
  const plan = {
    id: `plan_${Date.now()}`,
    mentorshipId,
    focusAreas: focusAreas || mentee.interests.slice(0, 3),
    duration: durationWeeks,
    startDate: new Date(),
    endDate: new Date(Date.now() + durationWeeks * 7 * 24 * 60 * 60 * 1000),
    phases: generateLearningPhases(focusAreas, durationWeeks, mentee.currentLevel),
    resources: generateResourceList(focusAreas, mentor.expertise),
    meetingSchedule: {
      frequency: mentor.preferences.communicationFrequency || "每周",
      format: "在线会议",
      duration: "1-2小时"
    },
    objectives: generateLearningObjectives(focusAreas, mentee.goals),
    assessmentMethods: [
      "定期知识检查",
      "项目实践",
      "论文阅读汇报",
      "问题解决能力评估"
    ],
    createdAt: new Date()
  };

  // 生成里程碑
  const milestones = generateMilestones(plan);

  // 更新师徒关系
  mentorship.plan = plan;
  mentorship.milestones = milestones;

  return {
    success: true,
    plan,
    milestones,
    summary: {
      duration: `${durationWeeks}周`,
      phases: plan.phases.length,
      totalMilestones: milestones.length,
      focusAreas: plan.focusAreas,
      nextSteps: [
        `第一阶段: ${plan.phases[0].name}`,
        `首个里程碑: ${milestones[0].title}`,
        `下次会面: ${plan.meetingSchedule.frequency}`
      ]
    }
  };
}

/**
 * 生成学习阶段
 */
function generateLearningPhases(focusAreas, durationWeeks, currentLevel) {
  const phases = [];

  // 第一阶段: 基础建立 (1/3 时间)
  const phase1Duration = Math.ceil(durationWeeks / 3);
  phases.push({
    name: "基础建立",
    duration: phase1Duration,
    weeks: [1, phase1Duration],
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
    resources: focusAreas.map(area => `《${area}基础教程》`)
  });

  // 第二阶段: 深入学习 (1/3 时间)
  const phase2Duration = Math.ceil(durationWeeks / 3);
  phases.push({
    name: "深入学习",
    duration: phase2Duration,
    weeks: [phase1Duration + 1, phase1Duration + phase2Duration],
    goals: [
      "理解高级理论和证明技巧",
      "掌握经典定理及其应用",
      "培养独立思考能力"
    ],
    activities: [
      "阅读经典论文",
      "解决挑战性问题",
      "论文精读和汇报"
    ],
    resources: focusAreas.map(area => `${area}领域重要论文选集`)
  });

  // 第三阶段: 实践应用 (1/3 时间)
  const phase3Duration = durationWeeks - phase1Duration - phase2Duration;
  phases.push({
    name: "实践应用",
    duration: phase3Duration,
    weeks: [phase1Duration + phase2Duration + 1, durationWeeks],
    goals: [
      "独立完成研究项目",
      "撰写研究报告或论文",
      "展示研究成果"
    ],
    activities: [
      "独立研究项目",
      "撰写技术文档",
      "成果汇报和答辩"
    ],
    resources: ["研究工具和软件", "学术写作指南"]
  });

  return phases;
}

/**
 * 生成资源列表
 */
function generateResourceList(focusAreas, mentorExpertise) {
  const resources = {
    books: [],
    papers: [],
    onlineCourses: [],
    tools: []
  };

  for (const area of focusAreas) {
    // 根据领域推荐资源 (简化示例)
    if (area.includes("代数几何")) {
      resources.books.push("Hartshorne - Algebraic Geometry");
      resources.papers.push("Grothendieck - EGA系列");
      resources.tools.push("Macaulay2 (计算代数软件)");
    }

    if (area.includes("同调代数")) {
      resources.books.push("Weibel - An Introduction to Homological Algebra");
      resources.papers.push("Cartan-Eilenberg - Homological Algebra");
    }

    if (area.includes("范畴论")) {
      resources.books.push("Mac Lane - Categories for the Working Mathematician");
      resources.onlineCourses.push("nLab (范畴论wiki)");
    }
  }

  // 通用资源
  resources.onlineCourses.push("公式诗云 · Formula Nebula (本平台)");
  resources.tools.push("LaTeX (数学排版)", "Anki (记忆卡片)");

  return resources;
}

/**
 * 生成学习目标
 */
function generateLearningObjectives(focusAreas, personalGoals) {
  const objectives = [];

  // 从兴趣领域生成目标
  for (const area of focusAreas) {
    objectives.push({
      category: "知识掌握",
      description: `深入理解${area}的核心理论`,
      measurable: `能够独立证明${area}中的主要定理`,
      timeframe: "12周"
    });
  }

  // 从个人目标生成目标
  if (personalGoals && personalGoals.length > 0) {
    for (const goal of personalGoals) {
      objectives.push({
        category: "个人发展",
        description: goal,
        measurable: "根据具体目标制定评估标准",
        timeframe: "12周"
      });
    }
  }

  // 通用能力目标
  objectives.push({
    category: "研究能力",
    description: "培养独立研究和问题解决能力",
    measurable: "能够独立完成一个小型研究项目",
    timeframe: "12周"
  });

  return objectives;
}

/**
 * 生成里程碑
 */
function generateMilestones(plan) {
  const milestones = [];
  let milestoneCount = 1;

  for (const phase of plan.phases) {
    const phaseWeeks = phase.weeks[1] - phase.weeks[0] + 1;
    const milestonesPerPhase = Math.max(1, Math.ceil(phaseWeeks / 3));

    for (let i = 0; i < milestonesPerPhase; i++) {
      const weekOffset = Math.ceil((phaseWeeks / milestonesPerPhase) * i);
      const targetWeek = phase.weeks[0] + weekOffset;

      milestones.push({
        id: `milestone_${milestoneCount}`,
        title: `${phase.name} - 里程碑 ${i + 1}`,
        phase: phase.name,
        targetWeek,
        targetDate: new Date(plan.startDate.getTime() + targetWeek * 7 * 24 * 60 * 60 * 1000),
        description: phase.goals[i] || phase.goals[0],
        deliverables: phase.activities.slice(0, 2),
        status: "pending", // pending, in_progress, completed, delayed
        progress: 0,
        notes: []
      });

      milestoneCount++;
    }
  }

  return milestones;
}

// ============================================================================
// 核心功能: 追踪里程碑
// ============================================================================

/**
 * 追踪师徒关系的里程碑进度
 *
 * @param {string} mentorshipId - 师徒关系ID
 * @returns {Object} 进度报告
 */
export function TrackMilestones(mentorshipId) {
  const mentorship = mentorships.get(mentorshipId);

  if (!mentorship) {
    throw new Error(`Mentorship not found: ${mentorshipId}`);
  }

  const { milestones, plan } = mentorship;

  if (!milestones || milestones.length === 0) {
    return {
      mentorshipId,
      status: "no_plan",
      message: "尚未创建学习计划和里程碑"
    };
  }

  // 计算当前周数
  const now = new Date();
  const startDate = plan.startDate;
  const elapsedWeeks = Math.floor((now - startDate) / (7 * 24 * 60 * 60 * 1000));

  // 统计各状态里程碑
  const stats = {
    total: milestones.length,
    completed: 0,
    inProgress: 0,
    pending: 0,
    delayed: 0,
    onTrack: 0
  };

  const currentMilestones = [];
  const upcomingMilestones = [];
  const completedMilestones = [];
  const delayedMilestones = [];

  for (const milestone of milestones) {
    stats[milestone.status]++;

    // 判断是否延迟
    if (milestone.status !== "completed" && milestone.targetWeek < elapsedWeeks) {
      milestone.status = "delayed";
      stats.delayed++;
      delayedMilestones.push(milestone);
    }

    // 判断是否按计划进行
    if (milestone.status === "completed" ||
        (milestone.status === "in_progress" && milestone.targetWeek >= elapsedWeeks)) {
      stats.onTrack++;
    }

    // 分类里程碑
    if (milestone.status === "completed") {
      completedMilestones.push(milestone);
    } else if (milestone.status === "in_progress") {
      currentMilestones.push(milestone);
    } else if (milestone.status === "pending" && milestone.targetWeek <= elapsedWeeks + 2) {
      upcomingMilestones.push(milestone);
    }
  }

  // 计算总体进度
  const overallProgress = Math.round(
    (stats.completed / stats.total) * 100
  );

  // 计算预计完成时间
  const avgWeeksPerMilestone = elapsedWeeks / Math.max(stats.completed, 1);
  const remainingMilestones = stats.total - stats.completed;
  const estimatedWeeksToComplete = remainingMilestones * avgWeeksPerMilestone;
  const estimatedCompletionDate = new Date(
    now.getTime() + estimatedWeeksToComplete * 7 * 24 * 60 * 60 * 1000
  );

  // 生成健康度评分
  const healthScore = calculateMentorshipHealth(stats, overallProgress, elapsedWeeks, plan.duration);

  return {
    mentorshipId,
    elapsedWeeks,
    totalWeeks: plan.duration,
    overallProgress,
    stats,
    healthScore,
    currentMilestones,
    upcomingMilestones: upcomingMilestones.slice(0, 3),
    recentlyCompleted: completedMilestones.slice(-3),
    delayedMilestones,
    estimatedCompletionDate,
    recommendations: generateProgressRecommendations(stats, healthScore, delayedMilestones),
    timeline: generateProgressTimeline(milestones, plan)
  };
}

/**
 * 计算师徒关系健康度
 */
function calculateMentorshipHealth(stats, progress, elapsedWeeks, totalWeeks) {
  let score = 100;

  // 进度因素 (-30)
  const expectedProgress = (elapsedWeeks / totalWeeks) * 100;
  const progressGap = expectedProgress - progress;
  if (progressGap > 20) score -= 30;
  else if (progressGap > 10) score -= 20;
  else if (progressGap > 5) score -= 10;

  // 延迟因素 (-40)
  const delayedRatio = stats.delayed / stats.total;
  if (delayedRatio > 0.3) score -= 40;
  else if (delayedRatio > 0.15) score -= 25;
  else if (delayedRatio > 0) score -= 10;

  // 进行中因素 (+10 bonus)
  if (stats.inProgress > 0) score += 10;

  score = Math.max(0, Math.min(100, score));

  return {
    score,
    level: score >= 80 ? "excellent" : score >= 60 ? "good" : score >= 40 ? "needs_attention" : "critical",
    label: score >= 80 ? "优秀" : score >= 60 ? "良好" : score >= 40 ? "需要关注" : "严重滞后"
  };
}

/**
 * 生成进度建议
 */
function generateProgressRecommendations(stats, healthScore, delayedMilestones) {
  const recommendations = [];

  if (healthScore.level === "critical" || healthScore.level === "needs_attention") {
    recommendations.push({
      priority: "high",
      category: "进度管理",
      suggestion: "当前进度明显滞后,建议与导师讨论调整学习计划",
      actions: [
        "安排紧急会议回顾进度",
        "识别主要障碍",
        "调整里程碑时间线或范围"
      ]
    });
  }

  if (delayedMilestones.length > 0) {
    recommendations.push({
      priority: "high",
      category: "延迟里程碑",
      suggestion: `有 ${delayedMilestones.length} 个里程碑已延迟`,
      actions: delayedMilestones.slice(0, 2).map(m => `完成: ${m.title}`)
    });
  }

  if (stats.inProgress === 0 && stats.pending > 0) {
    recommendations.push({
      priority: "medium",
      category: "活动启动",
      suggestion: "当前没有进行中的里程碑,建议开始下一个",
      actions: ["启动下一个里程碑", "与导师确认优先级"]
    });
  }

  if (recommendations.length === 0) {
    recommendations.push({
      priority: "low",
      category: "保持节奏",
      suggestion: "当前进度良好,继续保持!",
      actions: ["按计划完成当前里程碑", "定期与导师沟通"]
    });
  }

  return recommendations;
}

/**
 * 生成进度时间线
 */
function generateProgressTimeline(milestones, plan) {
  return milestones.map(m => ({
    week: m.targetWeek,
    title: m.title,
    status: m.status,
    progress: m.progress,
    phase: m.phase
  }));
}

/**
 * 更新里程碑状态 (辅助函数)
 */
export function UpdateMilestoneStatus(mentorshipId, milestoneId, status, progress, notes = "") {
  const mentorship = mentorships.get(mentorshipId);

  if (!mentorship) {
    throw new Error(`Mentorship not found: ${mentorshipId}`);
  }

  const milestone = mentorship.milestones.find(m => m.id === milestoneId);

  if (!milestone) {
    throw new Error(`Milestone not found: ${milestoneId}`);
  }

  milestone.status = status;
  milestone.progress = progress;

  if (notes) {
    milestone.notes.push({
      timestamp: new Date(),
      content: notes
    });
  }

  if (status === "completed") {
    milestone.completedDate = new Date();
  }

  return {
    success: true,
    milestone,
    message: "里程碑状态已更新"
  };
}

// ============================================================================
// 核心功能: 师徒沟通
// ============================================================================

/**
 * 发送师徒进度更新通知
 *
 * @param {Object} pair - 师徒配对信息
 * @param {string} pair.mentorshipId - 配对ID
 * @param {string} pair.sender - 发送者 ("mentor" or "mentee")
 * @param {Object} update - 更新内容
 * @returns {Object} 通知结果
 */
export function SendMentoringUpdate(pair, update) {
  const { mentorshipId, sender } = pair;

  if (!mentorshipId || !sender) {
    throw new Error("Missing mentorshipId or sender");
  }

  if (!update || !update.content) {
    throw new Error("Update content is required");
  }

  const mentorship = mentorships.get(mentorshipId);

  if (!mentorship) {
    throw new Error(`Mentorship not found: ${mentorshipId}`);
  }

  // 验证发送者
  const validSenders = [mentorship.mentorId, mentorship.menteeId, "mentor", "mentee"];
  const senderRole = sender === mentorship.mentorId || sender === "mentor" ? "mentor" : "mentee";

  // 创建更新记录
  const updateRecord = {
    id: `update_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    mentorshipId,
    sender: senderRole,
    senderId: senderRole === "mentor" ? mentorship.mentorId : mentorship.menteeId,
    type: update.type || "progress", // progress, question, feedback, meeting_summary
    subject: update.subject || "进度更新",
    content: update.content,
    attachments: update.attachments || [],
    timestamp: new Date(),
    read: false,
    responses: []
  };

  // 添加到师徒关系的更新列表
  mentorship.updates.push(updateRecord);

  // 生成通知内容
  const notification = generateUpdateNotification(updateRecord, mentorship, senderRole);

  return {
    success: true,
    updateId: updateRecord.id,
    notification,
    deliveryStatus: "sent",
    recipient: senderRole === "mentor" ? "mentee" : "mentor",
    timestamp: updateRecord.timestamp
  };
}

/**
 * 生成更新通知
 */
function generateUpdateNotification(update, mentorship, senderRole) {
  const mentor = mentors.get(mentorship.mentorId);
  const mentee = learners.get(mentorship.menteeId);

  const senderName = senderRole === "mentor" ? mentor.name : mentee.name;
  const recipientName = senderRole === "mentor" ? mentee.name : mentor.name;

  const typeLabels = {
    progress: "进度更新",
    question: "问题咨询",
    feedback: "反馈建议",
    meeting_summary: "会议纪要",
    milestone_completed: "里程碑完成",
    resource_shared: "资源分享"
  };

  return {
    title: `${typeLabels[update.type] || "新消息"}: ${update.subject}`,
    from: senderName,
    to: recipientName,
    content: update.content,
    timestamp: update.timestamp,
    actionRequired: update.type === "question",
    priority: update.type === "question" ? "high" : "normal",
    metadata: {
      mentorshipId: mentorship.id,
      updateId: update.id,
      phase: getCurrentPhase(mentorship)
    }
  };
}

/**
 * 获取当前学习阶段
 */
function getCurrentPhase(mentorship) {
  if (!mentorship.plan) return null;

  const now = new Date();
  const elapsedWeeks = Math.floor(
    (now - mentorship.plan.startDate) / (7 * 24 * 60 * 60 * 1000)
  );

  for (const phase of mentorship.plan.phases) {
    if (elapsedWeeks >= phase.weeks[0] && elapsedWeeks <= phase.weeks[1]) {
      return phase.name;
    }
  }

  return "已完成";
}

/**
 * 回复更新 (辅助函数)
 */
export function ReplyToUpdate(mentorshipId, updateId, reply) {
  const mentorship = mentorships.get(mentorshipId);

  if (!mentorship) {
    throw new Error(`Mentorship not found: ${mentorshipId}`);
  }

  const update = mentorship.updates.find(u => u.id === updateId);

  if (!update) {
    throw new Error(`Update not found: ${updateId}`);
  }

  const replyRecord = {
    id: `reply_${Date.now()}`,
    content: reply.content,
    sender: reply.sender,
    timestamp: new Date()
  };

  update.responses.push(replyRecord);
  update.read = true;

  return {
    success: true,
    replyId: replyRecord.id,
    message: "回复已发送"
  };
}

// ============================================================================
// 辅助查询功能
// ============================================================================

/**
 * 获取所有可用导师
 */
export function GetAvailableMentors() {
  const available = Array.from(mentors.values()).filter(
    m => m.currentMentees < m.maxMentees
  );

  return {
    total: available.length,
    mentors: available.map(m => ({
      id: m.id,
      name: m.name,
      expertise: m.expertise,
      level: m.level,
      rating: m.rating,
      availability: m.availability,
      openSlots: m.maxMentees - m.currentMentees
    }))
  };
}

/**
 * 获取学习者的所有师徒关系
 */
export function GetLearnerMentorships(learnerId) {
  const learnerMentorships = Array.from(mentorships.values()).filter(
    m => m.menteeId === learnerId
  );

  return {
    total: learnerMentorships.length,
    mentorships: learnerMentorships.map(m => ({
      id: m.id,
      mentor: mentors.get(m.mentorId),
      status: m.status,
      startDate: m.startDate,
      progress: calculateMentorshipProgress(m)
    }))
  };
}

/**
 * 获取导师的所有学生
 */
export function GetMentorStudents(mentorId) {
  const mentorMentorships = Array.from(mentorships.values()).filter(
    m => m.mentorId === mentorId
  );

  return {
    total: mentorMentorships.length,
    students: mentorMentorships.map(m => ({
      id: m.id,
      mentee: learners.get(m.menteeId),
      status: m.status,
      startDate: m.startDate,
      progress: calculateMentorshipProgress(m)
    }))
  };
}

/**
 * 计算师徒关系总体进度
 */
function calculateMentorshipProgress(mentorship) {
  if (!mentorship.milestones || mentorship.milestones.length === 0) {
    return 0;
  }

  const completed = mentorship.milestones.filter(m => m.status === "completed").length;
  return Math.round((completed / mentorship.milestones.length) * 100);
}

/**
 * 获取统计数据
 */
export function GetMentorshipStatistics() {
  return {
    totalMentors: mentors.size,
    totalLearners: learners.size,
    activeMentorships: Array.from(mentorships.values()).filter(m => m.status === "active").length,
    totalMentorships: mentorships.size,
    pendingApplications: Array.from(applications.values()).filter(a => a.status === "pending").length,
    averageRating: calculateAverageRating(),
    popularExpertise: getPopularExpertise()
  };
}

function calculateAverageRating() {
  const ratings = Array.from(mentors.values()).map(m => m.rating);
  if (ratings.length === 0) return 0;
  return (ratings.reduce((sum, r) => sum + r, 0) / ratings.length).toFixed(2);
}

function getPopularExpertise() {
  const expertiseCount = {};

  for (const mentor of mentors.values()) {
    for (const exp of mentor.expertise) {
      expertiseCount[exp] = (expertiseCount[exp] || 0) + 1;
    }
  }

  return Object.entries(expertiseCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));
}

// ============================================================================
// 导出数据访问 (用于测试和调试)
// ============================================================================

export function _getInternalData() {
  return {
    mentors: Array.from(mentors.values()),
    learners: Array.from(learners.values()),
    mentorships: Array.from(mentorships.values()),
    applications: Array.from(applications.values())
  };
}

export function _resetData() {
  mentors.clear();
  learners.clear();
  mentorships.clear();
  applications.clear();
  initializeSampleData();
}

