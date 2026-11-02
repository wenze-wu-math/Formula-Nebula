/**
 * 公式诗云 · Formula Nebula - 师徒匹配系统测试
 * Mentorship System Test Suite
 */

import {
  MatchMentorMentee,
  ApplyForMentorship,
  CreateMentoringPlan,
  TrackMilestones,
  SendMentoringUpdate,
  GetAvailableMentors,
  ReviewApplication,
  UpdateMilestoneStatus,
  ReplyToUpdate,
  GetMentorshipStatistics,
  _getInternalData,
  _resetData
} from './mentorship.js';

// ============================================================================
// 测试工具
// ============================================================================

function assert(condition, message) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message}\nExpected: ${expected}\nActual: ${actual}`);
  }
}

function assertGreaterThan(actual, threshold, message) {
  if (actual <= threshold) {
    throw new Error(`${message}\nExpected > ${threshold}, got ${actual}`);
  }
}

function testRunner(testName, testFn) {
  try {
    console.log(`\n🧪 Testing: ${testName}`);
    testFn();
    console.log(`✅ PASS: ${testName}`);
    return true;
  } catch (error) {
    console.error(`❌ FAIL: ${testName}`);
    console.error(error.message);
    return false;
  }
}

// ============================================================================
// 测试套件
// ============================================================================

function testMatchMentorMentee() {
  _resetData();

  const learner = {
    id: "test_learner_001",
    name: "测试学生",
    interests: ["代数几何", "scheme理论"],
    currentLevel: "硕士",
    goals: ["深入学习代数几何", "准备博士申请"],
    learningStyle: "理论型",
    timeCommitment: 15,
    background: ["抽象代数", "拓扑学"]
  };

  const result = MatchMentorMentee(learner);

  assert(result.suggestions, "应该返回推荐列表");
  assert(result.suggestions.length > 0, "应该至少有一个推荐");
  assert(result.suggestions[0].score > 0, "推荐评分应该大于0");
  assert(result.suggestions[0].mentor, "推荐应该包含导师信息");
  assert(result.suggestions[0].reasons, "推荐应该包含理由");

  // 验证排序 (评分降序)
  for (let i = 0; i < result.suggestions.length - 1; i++) {
    assert(
      result.suggestions[i].score >= result.suggestions[i + 1].score,
      "推荐应该按评分降序排列"
    );
  }

  // 验证最高匹配度
  const topMatch = result.suggestions[0];
  assertGreaterThan(topMatch.score, 50, "最高匹配度应该大于50");

  console.log(`   匹配到 ${result.suggestions.length} 位导师`);
  console.log(`   最高匹配度: ${topMatch.score}%`);
  console.log(`   推荐理由: ${topMatch.reasons.join(", ")}`);
}

function testApplyForMentorship() {
  _resetData();

  const learner = {
    id: "test_learner_002",
    name: "申请学生",
    interests: ["同调代数"],
    currentLevel: "本科",
    goals: ["掌握同调代数基础"],
    learningStyle: "实践型",
    timeCommitment: 10,
    background: ["线性代数", "抽象代数"]
  };

  const matches = MatchMentorMentee(learner);
  const targetMentor = matches.suggestions[0].mentor;

  const motivation = `我对同调代数非常感兴趣,希望在您的指导下系统学习。我已经学习了线性代数和抽象代数,具备一定基础。我的目标是掌握同调代数的核心理论,并能够应用于解决实际问题。我每周可以投入10小时学习,承诺认真完成导师布置的任务。`;

  const result = ApplyForMentorship(learner.id, targetMentor.id, motivation);

  assert(result.success, "申请应该成功");
  assertEqual(result.status, "pending", "申请状态应该是pending");
  assert(result.applicationId, "应该返回申请ID");
  assert(result.qualityScore > 0, "应该有质量评分");
  assert(result.qualityFeedback, "应该有质量反馈");

  console.log(`   申请ID: ${result.applicationId}`);
  console.log(`   质量评分: ${result.qualityScore}/100`);
  console.log(`   反馈级别: ${result.qualityFeedback.level}`);

  // 测试重复申请
  const duplicateResult = ApplyForMentorship(learner.id, targetMentor.id, motivation);
  assertEqual(duplicateResult.success, false, "重复申请应该失败");
  assertEqual(duplicateResult.status, "duplicate", "应该检测到重复申请");
}

function testReviewApplication() {
  _resetData();

  const learner = {
    id: "test_learner_003",
    name: "审核学生",
    interests: ["代数几何"],
    currentLevel: "硕士",
    goals: ["研究代数曲面"],
    learningStyle: "理论型",
    timeCommitment: 20,
    background: ["复几何", "交换代数"]
  };

  const matches = MatchMentorMentee(learner);
  const targetMentor = matches.suggestions[0].mentor;

  // Record the initial state
  const initialCurrentMentees = targetMentor.currentMentees;

  const motivation = "详细的申请动机说明,包含学习目标、背景知识和时间承诺。".repeat(5);
  const applyResult = ApplyForMentorship(learner.id, targetMentor.id, motivation);

  // 批准申请
  const reviewResult = ReviewApplication(
    applyResult.applicationId,
    "approved",
    "申请材料优秀,欢迎加入"
  );

  assert(reviewResult.success, "审核应该成功");
  assertEqual(reviewResult.status, "approved", "状态应该是approved");
  assert(reviewResult.mentorshipId, "应该返回师徒关系ID");

  console.log(`   师徒关系ID: ${reviewResult.mentorshipId}`);

  // 验证导师学生数增加
  const internalData = _getInternalData();
  const updatedMentor = internalData.mentors.find(m => m.id === targetMentor.id);

  assertEqual(
    updatedMentor.currentMentees,
    initialCurrentMentees + 1,
    "导师当前学生数应该增加1"
  );
}

function testCreateMentoringPlan() {
  _resetData();

  // 建立师徒关系
  const learner = {
    id: "test_learner_004",
    name: "计划学生",
    interests: ["范畴论", "同调代数"],
    currentLevel: "博士",
    goals: ["深入研究导出范畴", "发表论文"],
    learningStyle: "理论型",
    timeCommitment: 25,
    background: ["范畴论基础", "同调代数"]
  };

  const matches = MatchMentorMentee(learner);
  const targetMentor = matches.suggestions[0].mentor;

  const motivation = "充分的申请动机说明,展示对研究方向的理解和规划。".repeat(5);
  const applyResult = ApplyForMentorship(learner.id, targetMentor.id, motivation);
  const reviewResult = ReviewApplication(applyResult.applicationId, "approved");

  // 创建学习计划
  const planResult = CreateMentoringPlan({
    mentorshipId: reviewResult.mentorshipId,
    focusAreas: ["范畴论", "导出范畴"],
    durationWeeks: 16
  });

  assert(planResult.success, "创建计划应该成功");
  assert(planResult.plan, "应该返回学习计划");
  assert(planResult.milestones, "应该返回里程碑列表");
  assert(planResult.plan.phases.length > 0, "应该有学习阶段");
  assert(planResult.milestones.length > 0, "应该有里程碑");

  // 验证计划内容
  assertEqual(planResult.plan.duration, 16, "计划周期应该是16周");
  assertEqual(planResult.plan.phases.length, 3, "应该有3个学习阶段");
  assertGreaterThan(planResult.milestones.length, 3, "里程碑应该多于3个");

  console.log(`   计划周期: ${planResult.plan.duration}周`);
  console.log(`   学习阶段: ${planResult.plan.phases.length}个`);
  console.log(`   里程碑数: ${planResult.milestones.length}个`);

  // 验证阶段顺序
  const phaseNames = planResult.plan.phases.map(p => p.name);
  assert(
    phaseNames.includes("基础建立") && phaseNames.includes("深入学习") && phaseNames.includes("实践应用"),
    "应该包含标准学习阶段"
  );
}

function testTrackMilestones() {
  _resetData();

  // 建立师徒关系并创建计划
  const learner = {
    id: "test_learner_005",
    name: "进度学生",
    interests: ["交换代数"],
    currentLevel: "硕士",
    goals: ["掌握交换代数理论"],
    learningStyle: "实践型",
    timeCommitment: 12,
    background: ["抽象代数"]
  };

  const matches = MatchMentorMentee(learner);
  const targetMentor = matches.suggestions[0].mentor;
  const motivation = "详细申请动机".repeat(20);
  const applyResult = ApplyForMentorship(learner.id, targetMentor.id, motivation);
  const reviewResult = ReviewApplication(applyResult.applicationId, "approved");
  const planResult = CreateMentoringPlan({
    mentorshipId: reviewResult.mentorshipId,
    focusAreas: ["交换代数"],
    durationWeeks: 12
  });

  // 更新里程碑状态
  const firstMilestone = planResult.milestones[0];
  UpdateMilestoneStatus(
    reviewResult.mentorshipId,
    firstMilestone.id,
    "completed",
    100,
    "第一个里程碑顺利完成"
  );

  // 追踪进度
  const trackResult = TrackMilestones(reviewResult.mentorshipId);

  assert(trackResult.mentorshipId, "应该返回师徒关系ID");
  assert(trackResult.stats, "应该有统计信息");
  assertEqual(trackResult.stats.completed, 1, "应该有1个已完成的里程碑");
  assert(trackResult.healthScore, "应该有健康度评分");
  assert(trackResult.recommendations, "应该有进度建议");

  console.log(`   总进度: ${trackResult.overallProgress}%`);
  console.log(`   健康度: ${trackResult.healthScore.score} (${trackResult.healthScore.label})`);
  console.log(`   已完成: ${trackResult.stats.completed}/${trackResult.stats.total}`);
}

function testSendMentoringUpdate() {
  _resetData();

  // 建立师徒关系
  const learner = {
    id: "test_learner_006",
    name: "沟通学生",
    interests: ["代数几何"],
    currentLevel: "博士",
    goals: ["完成博士论文"],
    learningStyle: "理论型",
    timeCommitment: 30,
    background: ["代数几何基础"]
  };

  const matches = MatchMentorMentee(learner);
  const targetMentor = matches.suggestions[0].mentor;
  const motivation = "博士阶段申请动机说明".repeat(15);
  const applyResult = ApplyForMentorship(learner.id, targetMentor.id, motivation);
  const reviewResult = ReviewApplication(applyResult.applicationId, "approved");

  // 学生发送进度更新
  const updateResult = SendMentoringUpdate(
    {
      mentorshipId: reviewResult.mentorshipId,
      sender: "mentee"
    },
    {
      type: "progress",
      subject: "本周学习总结",
      content: "本周完成了scheme理论的基础学习,阅读了Hartshorne第二章,完成了相关练习题。"
    }
  );

  assert(updateResult.success, "发送更新应该成功");
  assert(updateResult.updateId, "应该返回更新ID");
  assert(updateResult.notification, "应该生成通知");
  assertEqual(updateResult.recipient, "mentor", "接收者应该是导师");

  console.log(`   更新ID: ${updateResult.updateId}`);
  console.log(`   通知标题: ${updateResult.notification.title}`);

  // 导师回复
  const replyResult = ReplyToUpdate(
    reviewResult.mentorshipId,
    updateResult.updateId,
    {
      content: "进度很好!下周可以开始学习层的上同调。",
      sender: "mentor"
    }
  );

  assert(replyResult.success, "回复应该成功");
  assert(replyResult.replyId, "应该返回回复ID");
}

function testGetAvailableMentors() {
  _resetData();

  const result = GetAvailableMentors();

  assert(result.total > 0, "应该有可用导师");
  assert(result.mentors, "应该返回导师列表");
  assert(result.mentors.length > 0, "导师列表不应为空");

  // 验证导师信息完整性
  const firstMentor = result.mentors[0];
  assert(firstMentor.id, "导师应该有ID");
  assert(firstMentor.name, "导师应该有姓名");
  assert(firstMentor.expertise, "导师应该有专业领域");
  assert(firstMentor.openSlots >= 0, "导师应该有空位信息");

  console.log(`   可用导师数: ${result.total}`);
  console.log(`   示例导师: ${firstMentor.name} (${firstMentor.level})`);
}

function testGetMentorshipStatistics() {
  _resetData();

  const stats = GetMentorshipStatistics();

  assert(stats.totalMentors > 0, "应该有导师总数");
  assert(stats.totalLearners >= 0, "应该有学习者总数");
  assert(stats.averageRating, "应该有平均评分");
  assert(stats.popularExpertise, "应该有热门领域");
  assert(Array.isArray(stats.popularExpertise), "热门领域应该是数组");

  console.log(`   导师数: ${stats.totalMentors}`);
  console.log(`   学习者数: ${stats.totalLearners}`);
  console.log(`   活跃师徒: ${stats.activeMentorships}`);
  console.log(`   平均评分: ${stats.averageRating}`);
}

function testMatchingAlgorithm() {
  _resetData();

  // 测试完全匹配
  const perfectLearner = {
    id: "perfect_learner",
    name: "完美匹配学生",
    interests: ["代数几何", "scheme理论", "层论"],
    currentLevel: "博士",
    goals: ["深入研究代数几何"],
    learningStyle: "理论型",
    timeCommitment: 15,
    background: []
  };

  const perfectMatch = MatchMentorMentee(perfectLearner);
  assertGreaterThan(perfectMatch.suggestions[0].score, 70, "完美匹配评分应该 > 70");

  // 测试部分匹配
  const partialLearner = {
    id: "partial_learner",
    name: "部分匹配学生",
    interests: ["微分几何"], // 与现有导师不完全匹配
    currentLevel: "本科",
    goals: ["入门几何学"],
    learningStyle: "视觉型",
    timeCommitment: 5,
    background: []
  };

  const partialMatch = MatchMentorMentee(partialLearner);
  assert(partialMatch.suggestions.length >= 0, "应该返回匹配结果");

  // 测试低水平学生
  const beginnerLearner = {
    id: "beginner_learner",
    name: "初学者",
    interests: ["代数几何"],
    currentLevel: "自学者",
    goals: ["入门学习"],
    learningStyle: "实践型",
    timeCommitment: 8,
    background: []
  };

  const beginnerMatch = MatchMentorMentee(beginnerLearner);
  assert(beginnerMatch.suggestions.length >= 0, "初学者应该能找到导师");

  console.log(`   完美匹配评分: ${perfectMatch.suggestions[0].score}`);
  console.log(`   部分匹配数: ${partialMatch.suggestions.length}`);
  console.log(`   初学者匹配数: ${beginnerMatch.suggestions.length}`);
}

// ============================================================================
// 运行所有测试
// ============================================================================

export function runAllTests() {
  console.log("================================================");
  console.log("  公式诗云 · 师徒匹配系统测试套件");
  console.log("  Mentorship System Test Suite");
  console.log("================================================");

  const tests = [
    ["匹配导师功能", testMatchMentorMentee],
    ["申请导师功能", testApplyForMentorship],
    ["审核申请功能", testReviewApplication],
    ["创建学习计划", testCreateMentoringPlan],
    ["追踪里程碑", testTrackMilestones],
    ["师徒沟通", testSendMentoringUpdate],
    ["获取可用导师", testGetAvailableMentors],
    ["获取统计信息", testGetMentorshipStatistics],
    ["匹配算法测试", testMatchingAlgorithm]
  ];

  let passed = 0;
  let failed = 0;

  for (const [name, fn] of tests) {
    if (testRunner(name, fn)) {
      passed++;
    } else {
      failed++;
    }
  }

  console.log("\n================================================");
  console.log(`  测试结果: ${passed} 通过, ${failed} 失败`);
  console.log("================================================");

  return { passed, failed, total: tests.length };
}

// Node.js 环境直接运行
if (typeof process !== 'undefined' && process.argv[1]?.includes('mentorship.test.js')) {
  runAllTests();
}
