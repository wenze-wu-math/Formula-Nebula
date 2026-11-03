# 交互式教程框架
# Interactive Tutorial Framework

一个完整的、模块化的教程系统，用于 Formula Nebula 项目。

## 功能特性

### 1. 逐步引导 (Step-by-step Guidance)

- 结构化的步骤管理
- 自动或手动进度控制
- 进度持久化（浏览器本地存储）
- 详细的提示和指导信息

```javascript
const tutorial = new TutorialManager();

tutorial.addStep({
  id: 'intro',
  title: '欢迎',
  description: '开始教程',
  guidance: '点击屏幕上的任何公式...',
  hints: ['提示 1', '提示 2'],
  order: 0
});
```

### 2. 实时代码示例 (Real-time Code Examples)

- 支持多种编程语言的代码高亮
- 可复制的代码块
- 可执行的代码片段
- 代码解释和说明

```javascript
const codeExample = {
  language: 'javascript',
  code: `
    const formula = scene.getObjectByName('hodge-conjecture');
    camera.lookAt(formula.position);
  `,
  explanation: '通过编程接口控制摄像机',
  copyable: true,
  runnable: true
};
```

### 3. 动画演示 (Animation Demonstrations)

- 关键帧动画系统
- 多种缓动函数
- 自动或手动控制
- 与教程步骤的无缝集成

```javascript
const animation = {
  type: 'rotation',
  duration: 3000,
  keyframes: [
    { transform: 'rotateY(0deg)' },
    { transform: 'rotateY(360deg)' }
  ],
  easing: 'ease-in-out'
};
```

### 4. 完成检查点 (Completion Checkpoints)

- 灵活的条件验证
- 超时控制
- 反馈消息系统
- 自动化的学习进度跟踪

```javascript
const checkpoint = {
  condition: () => {
    return document.querySelector('.details-panel') !== null;
  },
  timeout: 45000,
  feedbackMessages: {
    timeout: '请与界面交互以继续',
    maxAttemptsExceeded: '达到最大尝试次数'
  }
};
```

## 模块说明

### TutorialStep

单个教程步骤的类，包含：
- 指导信息
- 代码示例
- 动画演示
- 完成检查点

```javascript
const step = new TutorialStep({
  id: 'rotation',
  title: '旋转视图',
  guidance: '...',
  codeExample: { ... },
  animation: { ... },
  checkpoint: { ... }
});

await step.execute(context);
```

### TutorialManager

教程的主管理器，负责：
- 步骤编排
- 进度管理
- 进度条显示
- 前后导航

```javascript
const manager = new TutorialManager({
  persistProgress: true,
  showProgressBar: true,
  autoProgress: false,
  theme: 'light'
});

manager
  .addStep({ ... })
  .addStep({ ... })
  .addSteps([ ... ]);

await manager.initialize(context);
await manager.start();
```

### CodeExampleManager

代码示例的管理和渲染：
- 注册代码片段
- 语法高亮
- 复制功能
- 代码执行

```javascript
const codeManager = new CodeExampleManager();

codeManager.register('example-1', `
  console.log('Hello Tutorial!');
`, {
  language: 'javascript',
  explanation: '这是一个简单的例子',
  copyable: true
});

codeManager.display('example-1', container);
```

### AnimationDemoManager

动画演示管理：
- 预定义动画
- 自定义关键帧
- 播放控制

```javascript
const animManager = new AnimationDemoManager();

animManager.register('rotate', [
  { transform: 'rotate(0deg)' },
  { transform: 'rotate(360deg)' }
], {
  duration: 2000,
  easing: 'ease-in-out'
});

const animation = animManager.play('rotate', element);
```

### CheckpointValidator

检查点验证系统：
- 条件检查
- 超时管理
- 反馈处理

```javascript
const validator = new CheckpointValidator();

validator.register('interaction', () => {
  return userHasInteracted;
}, {
  timeout: 30000,
  maxAttempts: 5,
  feedbackMessages: {
    timeout: '超时了',
    maxAttemptsExceeded: '尝试次数过多'
  }
});

await validator.validate('interaction');
```

### TutorialContextBuilder

创建教程运行时上下文：
- 创建 UI 面板
- 管理事件监听
- 提供工具函数

```javascript
const builder = new TutorialContextBuilder(document);

const guidancePanel = builder.createGuidancePanel({
  title: '欢迎',
  description: '开始学习',
  guidance: '...',
  onDismiss: () => { ... }
});
```

## 使用示例

### 基础教程

```javascript
import {
  TutorialManager,
  TutorialContextBuilder
} from './framework.js';
import { createNebulaTutorial } from './example-tutorials.js';

// 创建教程
const tutorial = createNebulaTutorial();

// 创建上下文
const contextBuilder = new TutorialContextBuilder();

// 初始化
await tutorial.initialize({
  createGuidancePanel: (config) => contextBuilder.createGuidancePanel(config),
  createCodePanel: (config) => contextBuilder.createCodePanel(config),
  createAnimationController: (config) => contextBuilder.createAnimationController(config),
  createCheckpoint: (config) => contextBuilder.createCheckpoint(config)
});

// 启动
await tutorial.start();
```

### 自定义教程

```javascript
const customTutorial = new TutorialManager({
  persistProgress: true,
  showProgressBar: true,
  theme: 'dark'
});

customTutorial
  .addStep({
    id: 'step1',
    title: '第一步',
    description: '...',
    guidance: '...',
    codeExample: { ... },
    checkpoint: { ... }
  })
  .addStep({
    id: 'step2',
    title: '第二步',
    description: '...',
    guidance: '...'
  });

// 启动教程
await customTutorial.start();

// 导航
customTutorial.next();
customTutorial.previous();
customTutorial.goToStep(2);
customTutorial.reset();
```

## 样式定制

### 主题

```javascript
const manager = new TutorialManager({
  theme: 'light' // 或 'dark'
});
```

### CSS 类

所有主要组件都有 CSS 类名，支持自定义样式：

- `.guidance-panel` - 指导面板
- `.code-panel` - 代码面板
- `.animation-demo-container` - 动画容器
- `.checkpoint-feedback` - 检查点反馈
- `.tutorial-progress-bar` - 进度条

### 响应式设计

框架自动适配不同屏幕尺寸：
- 桌面（>1024px）：全尺寸面板
- 平板（768px-1024px）：中等尺寸
- 手机（<768px）：全屏面板

## 预定义教程

### Nebula 基础教程

```javascript
import { createNebulaTutorial } from './example-tutorials.js';

const tutorial = createNebulaTutorial();
// 包含 7 个步骤：介绍、旋转、缩放、选择、搜索、设置、高级功能
```

### 数据导入教程

```javascript
import { createDataImportTutorial } from './example-tutorials.js';

const tutorial = createDataImportTutorial();
// 包含数据结构和格式验证
```

### 性能优化教程

```javascript
import { createPerformanceTutorial } from './example-tutorials.js';

const tutorial = createPerformanceTutorial();
// 包含性能监测和优化技巧
```

### 主题定制教程

```javascript
import { createThemingTutorial } from './example-tutorials.js';

const tutorial = createThemingTutorial();
// 包含色彩系统说明
```

## 集成到现有项目

### 1. 导入文件

```javascript
import {
  TutorialManager,
  CodeExampleManager,
  AnimationDemoManager,
  CheckpointValidator,
  TutorialContextBuilder
} from './src/interactive-tutorial/framework.js';
```

### 2. 导入样式

```html
<link rel="stylesheet" href="./src/interactive-tutorial/styles.css">
```

### 3. 在应用中使用

```javascript
// 在主应用初始化时
const tutorial = new TutorialManager();
// ... 添加步骤
await tutorial.initialize(context);
await tutorial.start();
```

## 高级功能

### 条件分支

```javascript
manager.addStep({
  id: 'branch',
  title: '条件步骤',
  condition: () => userLevel > 1,
  guidance: '这个步骤仅对高级用户显示'
});
```

### 自定义反馈

```javascript
checkpoint: {
  condition: () => isComplete,
  feedbackMessages: {
    success: '很好！现在尝试...',
    timeout: '时间到了，继续吧',
    error: '出错了，再试一次'
  }
}
```

### 链式调用

```javascript
manager
  .addStep({ ... })
  .addStep({ ... })
  .addSteps([ ... ])
  .initialize(context)
  .then(() => manager.start());
```

## 无障碍设计

框架包含完整的无障碍支持：

- 键盘导航（Tab、Enter、Esc）
- 屏幕阅读器支持
- 焦点管理
- 对比度检查
- 运动减少模式支持

## API 参考

### TutorialManager

```javascript
new TutorialManager(config)
  .addStep(stepConfig)
  .addSteps(stepsConfig)
  .initialize(context)
  .start()
  .next()
  .previous()
  .goToStep(index)
  .reset()
  .complete()
```

### TutorialStep

```javascript
new TutorialStep(config)
  .execute(context)
  .showGuidance(context)
  .showCodeExample(context)
  .playAnimation(context)
  .waitForCheckpoint(context)
```

### 更多详见源代码注释

## 许可证

MIT

## 贡献

欢迎提交 Issue 和 Pull Request！

## 常见问题

**Q: 如何保存教程进度？**
A: 设置 `persistProgress: true`，进度会自动保存到 `sessionStorage`。

**Q: 如何自定义样式？**
A: 修改 `styles.css` 或使用 CSS 变量进行主题定制。

**Q: 支持哪些编程语言？**
A: 支持所有 Prism.js 支持的语言（JavaScript, Python, Java 等）。

**Q: 如何调试教程？**
A: 在浏览器控制台中使用 `tutorial` 对象，或启用详细日志。

## 更新日志

### v1.0.0 (2026-11-03)
- 初始发布
- 包含四大支柱功能
- 提供 4 个预定义教程
- 完整的 CSS 样式和无障碍支持
