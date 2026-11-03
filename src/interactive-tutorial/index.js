/**
 * 交互式教程框架入口
 * Interactive Tutorial Framework Entry Point
 */

// 导出所有核心类
export {
  TutorialStep,
  TutorialManager,
  CodeExampleManager,
  AnimationDemoManager,
  CheckpointValidator,
  TutorialContextBuilder,
} from './framework.js';

// 导出预定义教程
export {
  createNebulaTutorial,
  createDataImportTutorial,
  createPerformanceTutorial,
  createThemingTutorial,
} from './example-tutorials.js';

// 提供快速启动函数
export async function quickStart(tutorialType = 'nebula') {
  const {
    createNebulaTutorial,
    createDataImportTutorial,
    createPerformanceTutorial,
    createThemingTutorial,
  } = await import('./example-tutorials.js');

  const { TutorialContextBuilder } = await import('./framework.js');

  const tutorials = {
    nebula: createNebulaTutorial,
    dataimport: createDataImportTutorial,
    performance: createPerformanceTutorial,
    theming: createThemingTutorial,
  };

  const tutorialFactory = tutorials[tutorialType.toLowerCase()];
  if (!tutorialFactory) {
    throw new Error(`Unknown tutorial type: ${tutorialType}`);
  }

  const tutorial = tutorialFactory();
  const contextBuilder = new TutorialContextBuilder(document);

  const context = {
    createGuidancePanel: (config) => contextBuilder.createGuidancePanel(config),
    createCodePanel: (config) => contextBuilder.createCodePanel(config),
    createAnimationController: (config) =>
      contextBuilder.createAnimationController(config),
    createCheckpoint: (config) => contextBuilder.createCheckpoint(config),
  };

  await tutorial.initialize(context);
  return tutorial;
}

// 版本信息
export const VERSION = '1.0.0';
export const RELEASE_DATE = '2026-11-03';

// 默认导出
export default {
  VERSION,
  RELEASE_DATE,
  quickStart,
};
