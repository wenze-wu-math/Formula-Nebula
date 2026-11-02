/**
 * 公式诗云 · Formula Nebula - 师徒匹配系统使用示例
 * Mentorship System Usage Examples
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
  _resetData
} from './mentorship.js';

// ============================================================================
// 场景 1: 新学习者寻找导师
// ============================================================================

export function example1_FindMentor() {
  console.log("\n" + "=".repeat(60));
  console.log("场景 1: 新学习者寻找导师");
  console.log("=".repeat(60));

  _resetData();

  // 步骤 1: 学习者填写档案
  const learnerProfile = {
    id: "alice_2024",
    name: "Alice Zhang",
    interests: ["代数几何", "scheme理论", "层论"],
    currentLevel: "硕士",
    goals: [
      "深入理解scheme理论的核心概念",
      "掌握层上同调的计算方法",
      "为博士研究做准备"
    ],
    learningStyle: "理论型",
    timeCommitment: 15,
    background: ["抽象代数", "拓扑学", "交换代数基础"]
  };

  console.log("\n📝 学习者档案:");
  console.log(`   姓名: ${learnerProfile.name}`);
  console.log(`   水平: ${learnerProfile.currentLevel}`);
  console.log(`   兴趣: ${learnerProfile.interests.join(", ")}`);
  console.log(`   时间投入: ${learnerProfile.timeCommitment}小时/周`);

  // 步骤 2: 智能匹配导师
  const matchResult = MatchMentorMentee(learnerProfile);

  console.log(`\n✨ 匹配结果: 找到 ${matchResult.suggestions.length} 位导师`);

  matchResult.suggestions.forEach((match, index) => {
    console.log(`\n   ${index + 1}. ${match.mentor.name} (${match.mentor.level})`);
    console.log(`      匹配度: ${match.score}%`);
    console.log(`      专长: ${match.mentor.expertise.join(", ")}`);
    console.log(`      推荐理由:`);
    match.reasons.forEach(reason => {
      console.log(`         - ${reason}`);
    });
    console.log(`      预计每周: ${match.estimatedWeeklyHours}小时`);
  });

  // 步骤 3: 申请最匹配的导师
  const topMentor = matchResult.suggestions[0].mentor;

  const motivation = `
尊敬的${topMentor.name}教授:

我是一名对代数几何充满热情的硕士研究生。在学习过程中,我深深被scheme理论的优雅和深刻所吸引。

我选择向您申请指导的原因:
1. 您在${topMentor.expertise[0]}领域的深厚造诣与我的研究兴趣完美契合
2. 您的教学风格(${topMentor.teachingStyle.join(", ")})正是我所期望的
3. 我希望在您的指导下系统掌握scheme理论,为博士研究奠定坚实基础

我的学习背景:
- 已完成抽象代数、拓扑学和交换代数的基础课程
- 自学了代数几何导论,对affine scheme有初步理解
- 有良好的数学分析和证明能力

我的学习目标:
1. 深入理解scheme的定义和基本性质
2. 掌握层论的基本理论和上同调计算
3. 能够阅读和理解代数几何的经典论文
4. 为博士阶段的研究课题做准备

时间承诺:
我每周可以投入15小时进行专门学习,包括:
- 教材阅读和习题练习 (8小时)
- 论文精读 (4小时)
- 与您的定期讨论 (2-3小时)

我承诺会认真完成您布置的每一项任务,积极思考和提问,争取在您的指导下取得实质性进步。

期待您的回复!

此致
敬礼

Alice Zhang
  `.trim();

  const applicationResult = ApplyForMentorship(
    learnerProfile.id,
    topMentor.id,
    motivation
  );

  console.log(`\n📬 申请状态: ${applicationResult.status}`);
  console.log(`   申请ID: ${applicationResult.applicationId}`);
  console.log(`   质量评分: ${applicationResult.qualityScore}/100`);
  console.log(`   反馈: ${applicationResult.qualityFeedback.message}`);

  return {
    learnerProfile,
    matchResult,
    applicationResult
  };
}

// ============================================================================
// 场景 2: 导师审核申请并创建学习计划
// ============================================================================

export function example2_ApproveAndCreatePlan() {
  console.log("\n" + "=".repeat(60));
  console.log("场景 2: 导师审核申请并创建学习计划");
  console.log("=".repeat(60));

  // 先执行场景1
  const scenario1 = example1_FindMentor();

  // 步骤 1: 导师审核申请
  console.log("\n📋 导师审核申请...");

  const reviewResult = ReviewApplication(
    scenario1.applicationResult.applicationId,
    "approved",
    "申请材料非常优秀!你的学习背景和目标都很清晰。我很期待与你一起探索代数几何的美妙世界。欢迎加入!"
  );

  console.log(`   审核结果: ${reviewResult.status}`);
  console.log(`   师徒关系ID: ${reviewResult.mentorshipId}`);
  console.log(`   反馈: ${reviewResult.message}`);

  // 步骤 2: 创建个性化学习计划
  console.log("\n📚 创建学习计划...");

  const planResult = CreateMentoringPlan({
    mentorshipId: reviewResult.mentorshipId,
    focusAreas: ["代数几何", "scheme理论", "层论"],
    durationWeeks: 16
  });

  console.log(`   计划周期: ${planResult.summary.duration}`);
  console.log(`   学习阶段: ${planResult.summary.phases}个`);
  console.log(`   里程碑总数: ${planResult.summary.totalMilestones}个`);

  console.log("\n   学习阶段详情:");
  planResult.plan.phases.forEach((phase, index) => {
    console.log(`\n   阶段 ${index + 1}: ${phase.name} (${phase.duration}周)`);
    console.log(`      目标:`);
    phase.goals.forEach(goal => {
      console.log(`         - ${goal}`);
    });
    console.log(`      活动:`);
    phase.activities.forEach(activity => {
      console.log(`         - ${activity}`);
    });
  });

  console.log("\n   推荐资源:");
  console.log(`      书籍: ${planResult.plan.resources.books.join(", ")}`);
  console.log(`      论文: ${planResult.plan.resources.papers.join(", ")}`);
  console.log(`      工具: ${planResult.plan.resources.tools.join(", ")}`);

  console.log("\n   里程碑列表:");
  planResult.milestones.slice(0, 3).forEach((milestone, index) => {
    console.log(`      ${index + 1}. ${milestone.title}`);
    console.log(`         目标周: 第${milestone.targetWeek}周`);
    console.log(`         描述: ${milestone.description}`);
  });

  return {
    reviewResult,
    planResult
  };
}

// ============================================================================
// 场景 3: 学习过程中的进度追踪
// ============================================================================

export function example3_TrackProgress() {
  console.log("\n" + "=".repeat(60));
  console.log("场景 3: 学习过程中的进度追踪");
  console.log("=".repeat(60));

  // 执行前面的场景
  const scenario2 = example2_ApproveAndCreatePlan();
  const mentorshipId = scenario2.reviewResult.mentorshipId;
  const milestones = scenario2.planResult.milestones;

  // 步骤 1: 完成第一个里程碑
  console.log("\n✅ 学生完成第一个里程碑...");

  const milestone1 = milestones[0];
  UpdateMilestoneStatus(
    mentorshipId,
    milestone1.id,
    "completed",
    100,
    "完成了代数几何基础教材第一章的学习,理解了affine scheme的定义和基本性质。完成了所有习题。"
  );

  console.log(`   里程碑: ${milestone1.title}`);
  console.log(`   状态: completed`);
  console.log(`   进度: 100%`);

  // 步骤 2: 进行第二个里程碑
  const milestone2 = milestones[1];
  UpdateMilestoneStatus(
    mentorshipId,
    milestone2.id,
    "in_progress",
    60,
    "正在学习scheme的性质和morphism,已完成60%。"
  );

  console.log(`\n🔄 当前里程碑:`);
  console.log(`   里程碑: ${milestone2.title}`);
  console.log(`   状态: in_progress`);
  console.log(`   进度: 60%`);

  // 步骤 3: 学生发送进度更新
  console.log("\n📝 学生发送进度更新...");

  const updateResult = SendMentoringUpdate(
    {
      mentorshipId: mentorshipId,
      sender: "mentee"
    },
    {
      type: "progress",
      subject: "第2周学习总结",
      content: `
本周学习总结:

1. 完成内容:
   - 完成了第一个里程碑的所有学习任务
   - 理解了affine scheme的定义:Spec(A)的构造
   - 掌握了Zariski拓扑的基本性质
   - 完成了教材中的15道习题

2. 当前进展:
   - 正在学习scheme morphism的定义
   - 理解了局部环同态的作用
   - 在研究separated和proper morphism的例子

3. 遇到的问题:
   - 对于层的stalk的理解还不够深入
   - 希望下次讨论时能重点讲解这部分

4. 下周计划:
   - 完成scheme morphism的学习
   - 开始层论的基础部分
   - 准备第二个里程碑的完成

总体感觉学习节奏良好,对内容的理解在逐步深入。期待下周的讨论!
      `.trim()
    }
  );

  console.log(`   更新ID: ${updateResult.updateId}`);
  console.log(`   接收者: ${updateResult.recipient}`);
  console.log(`   通知: ${updateResult.notification.title}`);

  // 步骤 4: 追踪整体进度
  console.log("\n📊 整体进度追踪:");

  const trackResult = TrackMilestones(mentorshipId);

  console.log(`   已过周数: ${trackResult.elapsedWeeks}/${trackResult.totalWeeks}`);
  console.log(`   总体进度: ${trackResult.overallProgress}%`);
  console.log(`   健康度评分: ${trackResult.healthScore.score} (${trackResult.healthScore.label})`);

  console.log("\n   里程碑统计:");
  console.log(`      总数: ${trackResult.stats.total}`);
  console.log(`      已完成: ${trackResult.stats.completed}`);
  console.log(`      进行中: ${trackResult.stats.inProgress}`);
  console.log(`      待开始: ${trackResult.stats.pending}`);
  console.log(`      延迟: ${trackResult.stats.delayed}`);

  if (trackResult.recommendations.length > 0) {
    console.log("\n   建议:");
    trackResult.recommendations.forEach(rec => {
      console.log(`      [${rec.priority}] ${rec.suggestion}`);
      rec.actions.forEach(action => {
        console.log(`         - ${action}`);
      });
    });
  }

  return {
    updateResult,
    trackResult
  };
}

// ============================================================================
// 运行所有示例
// ============================================================================

export function runAllExamples() {
  console.log("\n");
  console.log("╔════════════════════════════════════════════════════════════╗");
  console.log("║  公式诗云 · 师徒匹配系统 - 使用示例                       ║");
  console.log("║  Mentorship System - Usage Examples                       ║");
  console.log("╚════════════════════════════════════════════════════════════╝");

  try {
    // 场景 1
    const result1 = example1_FindMentor();

    // 场景 2
    const result2 = example2_ApproveAndCreatePlan();

    // 场景 3
    const result3 = example3_TrackProgress();

    console.log("\n" + "=".repeat(60));
    console.log("🎉 所有场景演示完成!");
    console.log("=".repeat(60));

    return {
      scenario1: result1,
      scenario2: result2,
      scenario3: result3
    };
  } catch (error) {
    console.error("\n❌ 示例运行出错:");
    console.error(error);
    throw error;
  }
}

// Node.js 环境直接运行
if (typeof process !== 'undefined' && process.argv[1]?.includes('mentorship-example.js')) {
  runAllExamples();
}
