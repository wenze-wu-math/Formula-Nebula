# 交互式教程框架完全指南
# Complete Interactive Tutorial Framework Guide

## 📋 目录

1. [快速开始](#快速开始)
2. [架构设计](#架构设计)
3. [核心概念](#核心概念)
4. [使用教程](#使用教程)
5. [API 文档](#api-文档)
6. [最佳实践](#最佳实践)
7. [常见问题](#常见问题)

---

## 快速开始

### 安装

教程框架已包含在项目中，无需额外安装。

### 最小化示例

```javascript
import { TutorialManager, TutorialContextBuilder } from 
  './src/interactive-tutorial/framework.js';

// 1. 创建教程管理器
const tutorial = new TutorialManager();

// 2. 添加步骤
tutorial.addStep({
  id: 'step1',
  title: '第一步',
  description: '开始学习',
  guidance: '这是你的第一个步骤',
  order: 0
});

// 3. 创建上下文
const contextBuilder = new TutorialContextBuilder();

// 4. 初始化
await tutorial.initialize({
  createGuidancePanel: (config) => contextBuilder.createGuidancePanel(config),
  createCodePanel: (config) => contextBuilder.createCodePanel(config),
  createAnimationController: (config) => contextBuilder.createAnimationController(config),
  createCheckpoint: (config) => contextBuilder.createCheckpoint(config)
});

// 5. 启动
await tutorial.start();
```

### 使用预定义教程

```javascript
import { createNebulaTutorial } from './src/interactive-tutorial/example-tutorials.js';

const tutorial = createNebulaTutorial();
// ... 初始化并启动
```

---

## 架构设计

### 系统架构

```
┌─────────────────────────────────────────────────────────┐
│              TutorialManager (教程管理器)                │
│  ┌──────────────────────────────────────────────────┐  │
│  │ 步骤编排 | 进度管理 | 导航控制 | 持久化          │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────┬────────────────────────────────────────┘
                 │
        ┌────────┴────────┬──────────────┬──────────────┐
        │                 │              │              │
   ┌─────────┐    ┌─────────────┐  ┌──────────────┐  ┌──────────────┐
   │  Step   │    │CodeExample  │  │ AnimationDemo│  │ CheckpointValidator
   │Management   │Manager      │  │Manager       │  │
   └────────────┘    └─────────────┘  └──────────────┘  └──────────────┘
        │                │              │              │
        └────────┬───────┴──────────────┴──────────────┘
                 │
        ┌────────▼────────────────────┐
        │TutorialContextBuilder       │
        │(UI 组件创建和事件管理)        │
        └─────────────────────────────┘
```

### 四大支柱

#### 1. 逐步引导 (Step-by-step Guidance)

**目的**: 以结构化的方式引导用户学习

**组件**:
- `TutorialStep`: 单个步骤
- `TutorialManager`: 步骤编排和进度管理
- 指导面板 UI

**特性**:
- 顺序执行或手动选择
- 进度保存和恢复
- 详细提示和反馈

#### 2. 实时代码示例 (Real-time Code Examples)

**目的**: 提供可执行的代码样本

**组件**:
- `CodeExampleManager`: 代码管理
- 代码面板 UI
- 语法高亮和格式化

**特性**:
- 多语言支持
- 复制功能
- 代码执行
- 解释说明

#### 3. 动画演示 (Animation Demonstrations)

**目的**: 通过动画展示关键操作

**组件**:
- `AnimationDemoManager`: 动画管理
- 关键帧系统
- 缓动函数库

**特性**:
- 预定义动画
- 自定义关键帧
- 播放控制
- 与步骤无缝集成

#### 4. 完成检查点 (Completion Checkpoints)

**目的**: 验证学习成果

**组件**:
- `CheckpointValidator`: 验证管理
- 条件系统
- 反馈机制

**特性**:
- 灵活的条件表达式
- 超时控制
- 详细的反馈消息
- 自动进度跟踪

---

## 核心概念

### 步骤 (Step)

一个教程步骤是一个原子单位，包含：

```javascript
{
  id: 'unique-id',           // 唯一标识符
  title: 'Step Title',       // 标题
  description: 'Description',// 描述
  order: 0,                  // 执行顺序
  
  guidance: {
    title: '...',            // 指导标题
    text: '...',             // 指导文本
    hints: ['...']           // 提示列表
  },
  
  codeExample: {
    code: '...',             // 代码内容
    language: 'javascript',  // 编程语言
    explanation: '...',      // 解释说明
    copyable: true,          // 是否可复制
    runnable: false          // 是否可执行
  },
  
  animation: {
    type: 'rotation',        // 动画类型
    duration: 3000,          // 持续时间（ms）
    keyframes: [...],        // 关键帧
    easing: 'ease-in-out'    // 缓动函数
  },
  
  checkpoint: {
    condition: () => {...},  // 验证条件
    timeout: 30000,          // 超时时间（ms）
    feedbackMessages: {...}  // 反馈消息
  }
}
```

### 教程管理器 (Manager)

教程的主控制器，负责：
- 步骤的组织和执行
- 进度的跟踪和保存
- 用户导航
- 事件分发

```javascript
const manager = new TutorialManager(options);

manager
  .addStep(step1)      // 添加单个步骤
  .addSteps([...])     // 添加多个步骤
  .initialize(context) // 初始化
  .start()             // 启动
  .next()              // 下一步
  .previous()          // 上一步
  .goToStep(index)     // 跳转
  .reset()             // 重置
  .complete()          // 完成
```

### 上下文 (Context)

运行时环境，提供 UI 组件创建和工具函数：

```javascript
{
  createGuidancePanel(config),     // 创建指导面板
  createCodePanel(config),          // 创建代码面板
  createAnimationController(config),// 创建动画控制器
  createCheckpoint(config)          // 创建检查点验证器
}
```

---

## 使用教程

### 教程 1: 创建简单教程

```javascript
// 1. 导入
import {
  TutorialManager,
  TutorialContextBuilder
} from './src/interactive-tutorial/framework.js';

// 2. 创建管理器
const tutorial = new TutorialManager({
  persistProgress: true,      // 保存进度
  showProgressBar: true,      // 显示进度条
  autoProgress: false,        // 手动进度控制
  theme: 'light'              // 浅色主题
});

// 3. 添加步骤
tutorial
  .addStep({
    id: 'welcome',
    title: '欢迎',
    description: '开始学习之旅',
    guidance: '点击下一步继续',
    order: 0
  })
  .addStep({
    id: 'basics',
    title: '基础知识',
    description: '学习基本概念',
    guidance: '这是基础知识',
    order: 1,
    codeExample: {
      language: 'javascript',
      code: `console.log('Hello, Tutorial!');`,
      explanation: '这是一个简单的例子'
    }
  });

// 4. 创建上下文
const contextBuilder = new TutorialContextBuilder(document);

const context = {
  createGuidancePanel: (config) => 
    contextBuilder.createGuidancePanel(config),
  createCodePanel: (config) => 
    contextBuilder.createCodePanel(config),
  createAnimationController: (config) =>
    contextBuilder.createAnimationController(config),
  createCheckpoint: (config) =>
    contextBuilder.createCheckpoint(config)
};

// 5. 初始化和启动
(async () => {
  await tutorial.initialize(context);
  await tutorial.start();
})();
```

### 教程 2: 添加代码示例

```javascript
tutorial.addStep({
  id: 'coding',
  title: '编码示例',
  description: '学习通过代码与系统交互',
  guidance: '查看下面的代码示例并尝试理解',
  
  codeExample: {
    language: 'javascript',
    code: `
// 获取场景中的对象
const formula = scene.getObjectByName('hodge-conjecture');

// 移动摄像机
camera.position.copy(formula.position);
camera.lookAt(formula);

// 打开详情面板
showDetailsPanel(formula);
    `,
    explanation: '这个示例展示如何编程方式与公式交互',
    copyable: true,
    runnable: false
  }
});
```

### 教程 3: 添加动画演示

```javascript
tutorial.addStep({
  id: 'animation',
  title: '动画演示',
  description: '观看实际操作的演示',
  guidance: '下面的动画展示了旋转操作',
  
  animation: {
    type: 'rotation',
    duration: 4000,
    target: '.scene-container',
    keyframes: [
      { transform: 'rotateX(0deg) rotateY(0deg)' },
      { transform: 'rotateX(360deg) rotateY(360deg)' }
    ],
    easing: 'ease-in-out'
  }
});
```

### 教程 4: 添加检查点

```javascript
tutorial.addStep({
  id: 'interaction',
  title: '交互练习',
  description: '动手实践',
  guidance: '点击屏幕上的一个公式来完成这个步骤',
  
  checkpoint: {
    condition: () => {
      // 检查用户是否点击了公式
      return sessionStorage.getItem('formulaClicked') === 'true';
    },
    timeout: 60000,  // 60 秒超时
    maxAttempts: 5,
    feedbackMessages: {
      timeout: '时间已到，继续下一步吧',
      maxAttemptsExceeded: '尝试次数过多，跳过此步',
      success: '很好！你已完成此步骤'
    }
  }
});
```

---

## API 文档

### TutorialManager

#### 构造函数

```javascript
new TutorialManager(config)
```

**config 选项**:
| 选项 | 类型 | 默认值 | 说明 |
|-----|------|------|------|
| `autoProgress` | boolean | true | 自动进行到下一步 |
| `showProgressBar` | boolean | true | 显示进度条 |
| `persistProgress` | boolean | true | 保存进度 |
| `theme` | string | 'light' | 主题（'light' 或 'dark'） |
| `continueOnError` | boolean | false | 错误后是否继续 |

#### 方法

```javascript
// 添加步骤
.addStep(stepConfig): TutorialManager
.addSteps(stepsConfig[]): TutorialManager

// 初始化和控制
.initialize(context): Promise<TutorialManager>
.start(): Promise<Result>
.complete(): Promise<Result>

// 导航
.next(): Promise<void>
.previous(): void
.goToStep(index): void

// 管理
.reset(): void
.updateProgressBar(): void
.saveProgress(): void
.loadProgress(): number
```

### TutorialStep

#### 构造函数

```javascript
new TutorialStep(config)
```

#### 方法

```javascript
// 执行步骤
.execute(context): Promise<Result>

// 内部方法
.showGuidance(context): Promise<void>
.showCodeExample(context): Promise<void>
.playAnimation(context): Promise<void>
.waitForCheckpoint(context): Promise<boolean>
```

### CodeExampleManager

```javascript
// 注册代码
.register(id, code, metadata): CodeExampleManager

// 操作
.get(id): CodeExample
.display(id, container): CodeExample
.render(example, container): void
.copy(example): void
.run(example): Promise<any>
```

### AnimationDemoManager

```javascript
// 注册动画
.register(id, keyframes, options): AnimationDemoManager

// 控制
.play(id, element): Animation
.stop(): void
.pause(): void
.resume(): void

// 工具函数
.createTransition(fromValue, toValue, duration): Keyframes
.createRotation(degrees, duration): Keyframes
.createScale(fromScale, toScale, duration): Keyframes
.createTranslate(fromX, fromY, toX, toY, duration): Keyframes
```

### CheckpointValidator

```javascript
// 注册检查点
.register(id, condition, metadata): CheckpointValidator

// 验证
.validate(id): Promise<Result>
.reset(id): void
```

### TutorialContextBuilder

```javascript
// 创建 UI 组件
.createGuidancePanel(config): HTMLElement
.createCodePanel(config): HTMLElement
.createAnimationController(config): Controller
.createCheckpoint(config): Validator
```

---

## 最佳实践

### 1. 步骤设计

✅ **好的实践**:
- 每个步骤专注于一个概念
- 提供清晰的指导和提示
- 使用检查点验证学习成果

❌ **避免**:
- 步骤太长或包含多个概念
- 提示不清或模糊不清
- 忽略错误情况的处理

### 2. 代码示例

✅ **好的实践**:
```javascript
// ✓ 完整的、有注释的示例
codeExample: {
  code: `
// 获取目标对象
const target = scene.getObjectByName('target');

// 验证存在
if (!target) {
  console.error('Target not found');
  return;
}

// 执行操作
camera.lookAt(target.position);
  `,
  explanation: '这个示例展示了安全的对象获取和操作'
}
```

❌ **避免**:
```javascript
// ✗ 片段化、无注释
code: `scene.lookAt(obj);`
```

### 3. 动画设计

✅ **好的实践**:
- 动画时长 2-4 秒
- 使用合适的缓动函数
- 提供重放选项

❌ **避免**:
- 过于短或过于长的动画
- 过度动画（闪烁、快速变换）
- 无法暂停或重放

### 4. 检查点设计

✅ **好的实践**:
```javascript
checkpoint: {
  condition: () => {
    // 清晰的、可验证的条件
    const panel = document.querySelector('.details-panel');
    return panel && panel.classList.contains('visible');
  },
  timeout: 30000,
  feedbackMessages: {
    timeout: '请点击一个公式来查看详情',
    success: '很好！现在尝试搜索'
  }
}
```

❌ **避免**:
```javascript
// ✗ 模糊的条件
condition: () => someGlobalFlag === true
```

### 5. 进度管理

✅ **好的实践**:
- 启用 `persistProgress` 恢复用户进度
- 提供清晰的进度条反馈
- 允许用户返回上一步

❌ **避免**:
- 强制从头开始
- 无法追踪进度
- 不允许重复学习

---

## 常见问题

### Q1: 如何自定义样式？

**A**: 编辑 `src/interactive-tutorial/styles.css` 或覆盖 CSS 变量：

```css
/* 自定义主色 */
.guidance-panel .panel-header {
  background: linear-gradient(135deg, #your-color-1, #your-color-2);
}

/* 自定义字体 */
.guidance-panel {
  font-family: 'Your Font', sans-serif;
}
```

### Q2: 如何在现有项目中集成？

**A**:

1. 复制 `src/interactive-tutorial/` 目录
2. 导入样式表
3. 按照快速开始部分创建教程

```html
<link rel="stylesheet" href="./src/interactive-tutorial/styles.css">
<script type="module">
  import { quickStart } from './src/interactive-tutorial/index.js';
  
  const tutorial = await quickStart('nebula');
  // ...
</script>
```

### Q3: 支持哪些浏览器？

**A**: 
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Q4: 如何调试教程？

**A**:

```javascript
// 启用详细日志
const tutorial = new TutorialManager({
  debug: true
});

// 检查当前状态
console.log('Current step:', tutorial.steps[tutorial.currentStepIndex]);
console.log('Progress:', tutorial.currentStepIndex + 1, 'of', tutorial.steps.length);

// 手动完成检查点
sessionStorage.setItem('tutorialCheckpoint', 'complete');
```

### Q5: 如何添加国际化支持？

**A**:

```javascript
// 创建多语言配置
const translations = {
  en: { welcome: 'Welcome', ...},
  zh: { welcome: '欢迎', ...},
  es: { welcome: 'Bienvenido', ...}
};

const language = navigator.language.split('-')[0];
const t = translations[language] || translations.en;

tutorial.addStep({
  title: t.welcome,
  guidance: t.guidance,
  // ...
});
```

### Q6: 性能考虑？

**A**:
- 教程框架占用内存 < 200KB
- 不影响主应用性能
- 动画使用 GPU 加速
- 建议同时加载的步骤 < 10

---

## 文件结构

```
src/interactive-tutorial/
├── framework.js          # 核心框架（约 800 行）
├── example-tutorials.js  # 示例教程（约 400 行）
├── styles.css           # 样式表（约 700 行）
├── index.js             # 入口点
└── README.md            # 文档

examples/
└── tutorial-demo.html   # 完整演示

docs/
└── TUTORIAL-GUIDE.md    # 本文件
```

---

## 版本历史

### v1.0.0 (2026-11-03)
- ✨ 初始发布
- ✨ 四大支柱完整实现
- ✨ 4 个预定义教程
- ✨ 完整的样式和无障碍支持
- ✨ 详细文档和示例

---

## 许可证

MIT License - 详见项目根目录

## 贡献

欢迎 Issues 和 Pull Requests!

## 联系和支持

- 📧 Email: support@formula-nebula.dev
- 🐛 Bug Report: https://github.com/example/issues
- 💬 Discussions: https://github.com/example/discussions

---

**最后更新**: 2026-11-03
**维护者**: Formula Nebula Team
**文档版本**: v1.0.0
