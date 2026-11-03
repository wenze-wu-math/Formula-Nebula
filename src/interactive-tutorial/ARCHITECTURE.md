# 教程框架架构文档
# Tutorial Framework Architecture Document

## 概览

Formula Nebula 交互式教程框架是一个完整的、模块化的教学系统，建立在四个核心支柱之上。

### 四大支柱

```
┌─────────────────────────────────────────────────────────────┐
│                    交互式教程框架                             │
│                 Interactive Tutorial System                  │
└─────────────────────────────────────────────────────────────┘
    ┌──────────────────────┬──────────────────────┐
    │                      │                      │
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  逐步引导         │  │  实时代码示例     │  │  动画演示        │
│ Step Guidance    │  │ Code Examples    │  │ Animations       │
│                  │  │                  │  │                  │
│ • 结构化步骤      │  │ • 语法高亮       │  │ • 关键帧系统      │
│ • 进度管理        │  │ • 可执行代码      │  │ • 缓动函数        │
│ • 持久化存储      │  │ • 复制功能       │  │ • 播放控制        │
│ • 详细提示        │  │ • 解释说明       │  │ • 集成控制        │
└──────────────────┘  └──────────────────┘  └──────────────────┘
    │                      │                      │
    └──────────────────────┼──────────────────────┘
                           │
                    ┌──────▼──────┐
                    │ 完成检查点    │
                    │Checkpoints   │
                    │              │
                    │ • 条件验证   │
                    │ • 超时控制   │
                    │ • 反馈系统   │
                    └──────────────┘
```

## 模块设计

### 1. 核心管理模块 (Core Management)

#### TutorialManager
- **职责**: 教程的总体协调
- **功能**:
  - 步骤的顺序执行或随机访问
  - 进度的保存和恢复
  - 前后导航
  - 事件分发

```
┌──────────────────────┐
│  TutorialManager     │
├──────────────────────┤
│ - steps: Step[]      │
│ - currentIndex: int  │
│ - context: Context   │
│ - config: Config     │
├──────────────────────┤
│ + addStep()          │
│ + start()            │
│ + next()             │
│ + previous()         │
│ + reset()            │
└──────────────────────┘
```

#### TutorialStep
- **职责**: 单个教程步骤的执行
- **功能**:
  - 显示指导信息
  - 展示代码示例
  - 播放动画
  - 验证检查点

```
┌──────────────────────┐
│  TutorialStep        │
├──────────────────────┤
│ - id: string         │
│ - title: string      │
│ - guidance: string   │
│ - codeExample: Obj   │
│ - animation: Obj     │
│ - checkpoint: Obj    │
├──────────────────────┤
│ + execute()          │
│ + showGuidance()     │
│ + showCode()         │
│ + playAnimation()    │
│ + validateCheckpoint │
└──────────────────────┘
```

### 2. 内容管理模块 (Content Management)

#### CodeExampleManager
```
┌──────────────────────────┐
│  CodeExampleManager      │
├──────────────────────────┤
│ - examples: Map          │
│ - activeExample: Example │
├──────────────────────────┤
│ + register()             │
│ + get()                  │
│ + display()              │
│ + render()               │
│ + copy()                 │
│ + run()                  │
└──────────────────────────┘
```

#### AnimationDemoManager
```
┌──────────────────────────┐
│ AnimationDemoManager     │
├──────────────────────────┤
│ - animations: Map        │
│ - currentAnimation: Anim │
├──────────────────────────┤
│ + register()             │
│ + play()                 │
│ + stop()                 │
│ + pause()                │
│ + resume()               │
│ + create*()              │
└──────────────────────────┘
```

### 3. 验证模块 (Validation)

#### CheckpointValidator
```
┌──────────────────────────┐
│ CheckpointValidator      │
├──────────────────────────┤
│ - checkpoints: Map       │
│ - config: Config         │
├──────────────────────────┤
│ + register()             │
│ + validate()             │
│ + reset()                │
└──────────────────────────┘
```

### 4. UI 基础设施 (UI Infrastructure)

#### TutorialContextBuilder
```
┌──────────────────────────┐
│ TutorialContextBuilder   │
├──────────────────────────┤
│ - doc: Document          │
│ - panels: Map            │
├──────────────────────────┤
│ + createGuidancePanel()  │
│ + createCodePanel()      │
│ + createAnimController() │
│ + createCheckpoint()     │
│ + escapeHtml()           │
└──────────────────────────┘
```

## 数据流

### 教程执行流程

```
用户启动教程
     │
     ▼
TutorialManager.initialize()
     ├─ 加载进度
     ├─ 创建进度条
     └─ 准备上下文
     │
     ▼
TutorialManager.start()
     │
     ├──┬──────────────────────────────────┐
     │  │ 对于每个步骤                      │
     │  │ For each step                    │
     │  │                                  │
     │  ▼                                  │
     │  TutorialStep.execute()             │
     │  ├─ showGuidance()                 │
     │  │  └─ createGuidancePanel()       │
     │  │     └─ 显示指导内容              │
     │  │                                  │
     │  ├─ showCodeExample() (可选)        │
     │  │  └─ createCodePanel()           │
     │  │     └─ 渲染代码示例              │
     │  │                                  │
     │  ├─ playAnimation() (可选)          │
     │  │  └─ createAnimationController() │
     │  │     └─ 执行动画序列              │
     │  │                                  │
     │  └─ waitForCheckpoint() (可选)      │
     │     └─ createCheckpoint()          │
     │        └─ 验证条件                 │
     │                                  │
     │  ▼                                │
     │  更新进度
     │  保存状态
     │  │
     │  └─ 如果 autoProgress
     │     └─ 继续下一步
     │
     └──────────────────────────────────┘
     │
     ▼
教程完成
```

### 检查点验证流程

```
创建检查点
    │
    ▼
设置验证条件
    │
    ├─ 启动计时器
    │
    ├─ 轮询检查条件 (每 100ms)
    │  │
    │  ├─ 条件为真?
    │  │  └─ YES → 验证成功 ✓
    │  │
    │  ├─ 超时?
    │  │  └─ YES → 验证失败 ✗
    │  │
    │  └─ 尝试次数超限?
    │     └─ YES → 验证失败 ✗
    │
    ▼
返回结果
显示反馈信息
```

## 类型系统

### 核心类型定义

```typescript
// 步骤配置
interface StepConfig {
  id: string;
  title: string;
  description: string;
  order?: number;
  guidance?: string | GuidanceConfig;
  codeExample?: CodeExampleConfig;
  animation?: AnimationConfig;
  checkpoint?: CheckpointConfig;
  hints?: string[];
}

// 指导配置
interface GuidanceConfig {
  title: string;
  description: string;
  guidance: string;
  hints: string[];
  targetElement?: HTMLElement;
  onDismiss?: () => void;
}

// 代码示例配置
interface CodeExampleConfig {
  code: string;
  language: string;
  explanation?: string;
  copyable?: boolean;
  runnable?: boolean;
  onRun?: () => Promise<any>;
}

// 动画配置
interface AnimationConfig {
  type: string;
  duration: number;
  target: HTMLElement | string;
  keyframes: Keyframe[];
  easing?: string;
  onComplete?: () => void;
}

// 检查点配置
interface CheckpointConfig {
  condition: () => boolean;
  timeout?: number;
  maxAttempts?: number;
  feedbackMessages?: FeedbackMessages;
}

// 管理器配置
interface ManagerConfig {
  autoProgress?: boolean;
  showProgressBar?: boolean;
  persistProgress?: boolean;
  theme?: 'light' | 'dark';
  continueOnError?: boolean;
}
```

## 生命周期

### 教程生命周期

```
[创建] → [配置] → [初始化] → [运行] → [完成] → [重置]
```

### 步骤生命周期

```
[等待] → [开始] → [显示指导] → [代码/动画] → [验证] → [完成]
```

### UI 元素生命周期

```
[创建] → [插入] → [显示] → [交互] → [移除] → [销毁]
```

## 状态管理

### 全局状态

```javascript
{
  // 教程状态
  tutorialState: {
    currentStepIndex: number,
    totalSteps: number,
    isRunning: boolean,
    isPaused: boolean,
    completedSteps: string[]
  },
  
  // 步骤状态
  stepState: {
    id: string,
    status: 'pending' | 'running' | 'completed' | 'failed',
    startTime: number,
    endTime: number,
    attempts: number
  },
  
  // UI 状态
  uiState: {
    activePanel: string,
    visibleElements: string[],
    theme: 'light' | 'dark'
  }
}
```

## 事件系统

### 事件流

```
用户交互
    │
    ├─ 点击
    ├─ 输入
    └─ 键盘
    │
    ▼
事件处理器
    │
    ├─ 验证事件
    ├─ 更新状态
    └─ 触发回调
    │
    ▼
UI 更新
    │
    ├─ 刷新面板
    ├─ 更新进度条
    └─ 显示反馈
```

## 样式架构

### 样式层次

```
全局样式
    ├─ 基础颜色和字体
    ├─ 布局和间距
    └─ 响应式基础
    │
    ├─ 浅色主题
    │  ├─ 背景色
    │  ├─ 文本色
    │  └─ 边框色
    │
    └─ 暗色主题
       ├─ 背景色
       ├─ 文本色
       └─ 边框色

组件样式
    ├─ 指导面板
    ├─ 代码面板
    ├─ 动画容器
    ├─ 进度条
    └─ 反馈消息

响应式样式
    ├─ 桌面 (>1024px)
    ├─ 平板 (768-1024px)
    └─ 手机 (<768px)
```

## 扩展点

### 如何扩展框架

#### 1. 添加新的步骤类型

```javascript
// 继承 TutorialStep
class CustomStep extends TutorialStep {
  async execute(context) {
    // 自定义逻辑
  }
}
```

#### 2. 添加新的检查点条件

```javascript
// 创建自定义验证器
function createCustomCheckpoint(config) {
  return {
    validate: async () => {
      // 自定义验证逻辑
    }
  };
}
```

#### 3. 添加新的动画类型

```javascript
// 在 AnimationDemoManager 中添加
createCustomAnimation(param1, param2) {
  return [
    { /* 起始状态 */ },
    { /* 结束状态 */ }
  ];
}
```

#### 4. 自定义 UI 主题

```css
/* 创建新主题 */
.tutorial-custom-theme {
  --primary-color: #custom;
  --text-color: #custom;
  --border-color: #custom;
}
```

## 性能优化

### 内存管理

- **轻量级**: 核心框架 < 100KB
- **缓存**: 代码示例和动画缓存
- **清理**: 步骤完成后清理 DOM

### 渲染优化

- **虚拟化**: 长列表使用虚拟滚动
- **防抖**: 输入事件防抖处理
- **节流**: 滚轮事件节流处理

### 动画优化

- **GPU 加速**: 使用 transform 和 opacity
- **帧率**: 自适应帧率
- **节流**: 60fps 目标

## 测试策略

### 单元测试

```javascript
// 测试步骤执行
describe('TutorialStep', () => {
  it('should execute step', async () => {
    const step = new TutorialStep(config);
    const result = await step.execute(context);
    expect(result.success).toBe(true);
  });
});
```

### 集成测试

```javascript
// 测试整个教程流程
describe('TutorialManager', () => {
  it('should complete full tutorial', async () => {
    const manager = new TutorialManager();
    manager.addSteps([...]);
    const result = await manager.start();
    expect(result.completed).toBe(true);
  });
});
```

### E2E 测试

```javascript
// 模拟用户交互
describe('Tutorial E2E', () => {
  it('should guide user through tutorial', async () => {
    // 1. 启动教程
    // 2. 点击下一步
    // 3. 验证界面变化
    // 4. 完成教程
  });
});
```

## 浏览器兼容性

### 支持的浏览器

| 浏览器 | 最低版本 | 状态 |
|-------|--------|------|
| Chrome | 90 | ✅ 完全支持 |
| Firefox | 88 | ✅ 完全支持 |
| Safari | 14 | ✅ 完全支持 |
| Edge | 90 | ✅ 完全支持 |
| IE 11 | - | ❌ 不支持 |

### Polyfills 需求

- Array methods (includes, flat)
- Promise support
- Web Animations API

## 安全考虑

### XSS 防护

```javascript
// HTML 转义
escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
```

### CSP 兼容性

- 内联样式使用类名代替
- 事件处理使用 addEventListener
- 无内联脚本

## 无障碍支持

### WCAG 2.1 合规

- ✅ 键盘导航支持
- ✅ 屏幕阅读器支持
- ✅ 焦点管理
- ✅ 对比度检查
- ✅ 运动减少模式

---

**文档版本**: 1.0.0
**最后更新**: 2026-11-03
**维护者**: Formula Nebula Team
