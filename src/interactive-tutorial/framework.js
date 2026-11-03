/**
 * 交互式教程框架
 * Interactive Tutorial Framework for Formula Nebula
 *
 * 包含四大支柱：
 * 1. 逐步引导 (Step-by-step guidance)
 * 2. 实时代码示例 (Real-time code examples)
 * 3. 动画演示 (Animation demonstrations)
 * 4. 完成检查点 (Completion checkpoints)
 */

/**
 * 教程步骤类
 */
export class TutorialStep {
  constructor(config) {
    this.id = config.id;
    this.title = config.title;
    this.description = config.description;
    this.order = config.order || 0;
    this.targetElement = config.targetElement;
    this.guidance = config.guidance;
    this.codeExample = config.codeExample;
    this.animation = config.animation;
    this.checkpoint = config.checkpoint;
    this.hints = config.hints || [];
    this.completed = false;
  }

  /**
   * 执行步骤
   */
  async execute(context) {
    try {
      // 1. 显示指导
      await this.showGuidance(context);

      // 2. 显示代码示例
      if (this.codeExample) {
        await this.showCodeExample(context);
      }

      // 3. 播放动画演示
      if (this.animation) {
        await this.playAnimation(context);
      }

      // 4. 等待检查点完成
      if (this.checkpoint) {
        await this.waitForCheckpoint(context);
      }

      this.completed = true;
      return { success: true, stepId: this.id };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async showGuidance(context) {
    return new Promise((resolve) => {
      const guidancePanel = context.createGuidancePanel({
        title: this.title,
        description: this.description,
        guidance: this.guidance,
        hints: this.hints,
        targetElement: this.targetElement,
        onDismiss: resolve,
      });
    });
  }

  async showCodeExample(context) {
    return new Promise((resolve) => {
      const codePanel = context.createCodePanel({
        title: this.title,
        code: this.codeExample.code,
        language: this.codeExample.language,
        explanation: this.codeExample.explanation,
        copyable: this.codeExample.copyable !== false,
        runnable: this.codeExample.runnable || false,
        onRun: this.codeExample.onRun,
        onDismiss: resolve,
      });
    });
  }

  async playAnimation(context) {
    return new Promise((resolve) => {
      const animationController = context.createAnimationController({
        type: this.animation.type,
        duration: this.animation.duration,
        target: this.animation.target,
        keyframes: this.animation.keyframes,
        easing: this.animation.easing,
        onComplete: resolve,
      });

      animationController.play();
    });
  }

  async waitForCheckpoint(context) {
    return new Promise((resolve, reject) => {
      const checkpointValidator = context.createCheckpoint({
        condition: this.checkpoint.condition,
        timeout: this.checkpoint.timeout || 30000,
        onSuccess: () => resolve(true),
        onTimeout: () => reject(new Error('Checkpoint timeout')),
        feedbackMessages: this.checkpoint.feedbackMessages,
      });
    });
  }
}

/**
 * 教程管理器
 */
export class TutorialManager {
  constructor(config = {}) {
    this.steps = [];
    this.currentStepIndex = 0;
    this.context = {};
    this.config = {
      autoProgress: config.autoProgress !== false,
      showProgressBar: config.showProgressBar !== false,
      persistProgress: config.persistProgress !== false,
      theme: config.theme || 'light',
      ...config,
    };
    this.progressBar = null;
    this.currentPanel = null;
  }

  /**
   * 添加教程步骤
   */
  addStep(stepConfig) {
    const step = new TutorialStep({
      order: this.steps.length,
      ...stepConfig,
    });
    this.steps.push(step);
    return this;
  }

  /**
   * 批量添加步骤
   */
  addSteps(stepsConfig) {
    stepsConfig.forEach((config) => this.addStep(config));
    return this;
  }

  /**
   * 初始化教程
   */
  async initialize(context) {
    this.context = context;

    // 恢复进度
    if (this.config.persistProgress) {
      this.currentStepIndex = this.loadProgress();
    }

    // 显示进度条
    if (this.config.showProgressBar) {
      this.showProgressBar();
    }

    return this;
  }

  /**
   * 启动教程
   */
  async start() {
    while (this.currentStepIndex < this.steps.length) {
      const step = this.steps[this.currentStepIndex];
      console.log(`Starting step ${this.currentStepIndex + 1}/${this.steps.length}: ${step.id}`);

      const result = await step.execute(this.context);

      if (!result.success) {
        console.error(`Step ${step.id} failed:`, result.error);
        if (!this.config.continueOnError) {
          throw new Error(`Tutorial failed at step ${step.id}`);
        }
      }

      this.updateProgressBar();
      this.saveProgress();

      if (this.config.autoProgress) {
        this.currentStepIndex++;
      } else {
        break;
      }
    }

    return this.complete();
  }

  /**
   * 前进到下一步
   */
  next() {
    if (this.currentStepIndex < this.steps.length - 1) {
      this.currentStepIndex++;
      this.updateProgressBar();
      this.saveProgress();
      return this.start();
    }
  }

  /**
   * 返回到上一步
   */
  previous() {
    if (this.currentStepIndex > 0) {
      this.currentStepIndex--;
      this.updateProgressBar();
      this.saveProgress();
    }
  }

  /**
   * 跳转到指定步骤
   */
  goToStep(stepIndex) {
    if (stepIndex >= 0 && stepIndex < this.steps.length) {
      this.currentStepIndex = stepIndex;
      this.updateProgressBar();
      this.saveProgress();
    }
  }

  /**
   * 显示进度条
   */
  showProgressBar() {
    const container = document.createElement('div');
    container.className = 'tutorial-progress-container';
    container.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: #f0f0f0;
      z-index: 9999;
    `;

    const bar = document.createElement('div');
    bar.className = 'tutorial-progress-bar';
    bar.style.cssText = `
      height: 100%;
      background: linear-gradient(90deg, #3d5c96, #7fa6e8);
      width: 0%;
      transition: width 0.3s ease;
    `;

    container.appendChild(bar);
    document.body.appendChild(container);

    this.progressBar = bar;
    this.updateProgressBar();
  }

  /**
   * 更新进度条
   */
  updateProgressBar() {
    if (this.progressBar) {
      const progress = ((this.currentStepIndex + 1) / this.steps.length) * 100;
      this.progressBar.style.width = `${progress}%`;
    }
  }

  /**
   * 保存进度
   */
  saveProgress() {
    if (this.config.persistProgress) {
      sessionStorage.setItem('tutorialProgress', this.currentStepIndex.toString());
    }
  }

  /**
   * 加载进度
   */
  loadProgress() {
    if (this.config.persistProgress) {
      const saved = sessionStorage.getItem('tutorialProgress');
      return saved ? parseInt(saved) : 0;
    }
    return 0;
  }

  /**
   * 完成教程
   */
  async complete() {
    console.log('Tutorial completed!');

    if (this.config.persistProgress) {
      sessionStorage.removeItem('tutorialProgress');
    }

    if (this.progressBar) {
      this.progressBar.style.width = '100%';
    }

    return {
      completed: true,
      totalSteps: this.steps.length,
      completedSteps: this.steps.filter((s) => s.completed).length,
    };
  }

  /**
   * 重置教程
   */
  reset() {
    this.currentStepIndex = 0;
    this.steps.forEach((step) => {
      step.completed = false;
    });
    this.saveProgress();
    this.updateProgressBar();
  }
}

/**
 * 代码示例管理器
 */
export class CodeExampleManager {
  constructor(config = {}) {
    this.examples = new Map();
    this.activeExample = null;
    this.config = config;
  }

  /**
   * 注册代码示例
   */
  register(id, code, metadata = {}) {
    this.examples.set(id, {
      id,
      code,
      language: metadata.language || 'javascript',
      explanation: metadata.explanation || '',
      copyable: metadata.copyable !== false,
      runnable: metadata.runnable || false,
      previewable: metadata.previewable !== false,
      ...metadata,
    });
    return this;
  }

  /**
   * 获取示例
   */
  get(id) {
    return this.examples.get(id);
  }

  /**
   * 显示示例
   */
  display(id, container) {
    const example = this.get(id);
    if (!example) return null;

    this.activeExample = example;
    this.render(example, container);
    return example;
  }

  /**
   * 渲染代码示例
   */
  render(example, container) {
    const panel = document.createElement('div');
    panel.className = 'code-example-panel';
    panel.innerHTML = `
      <div class="code-header">
        <span class="language-badge">${example.language}</span>
        ${
          example.copyable
            ? '<button class="copy-btn">复制</button>'
            : ''
        }
        ${
          example.runnable
            ? '<button class="run-btn">运行</button>'
            : ''
        }
      </div>
      <pre><code class="language-${example.language}">${this.escapeHtml(
      example.code
    )}</code></pre>
      ${
        example.explanation
          ? `<div class="explanation">${example.explanation}</div>`
          : ''
      }
    `;

    // 添加事件监听
    const copyBtn = panel.querySelector('.copy-btn');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => this.copy(example));
    }

    const runBtn = panel.querySelector('.run-btn');
    if (runBtn) {
      runBtn.addEventListener('click', () => this.run(example));
    }

    container.appendChild(panel);
  }

  /**
   * 复制代码
   */
  copy(example) {
    navigator.clipboard.writeText(example.code).then(() => {
      console.log('Code copied to clipboard');
    });
  }

  /**
   * 运行代码
   */
  async run(example) {
    try {
      // eslint-disable-next-line no-eval
      const result = await eval(example.code);
      console.log('Code execution result:', result);
      return result;
    } catch (error) {
      console.error('Code execution error:', error);
    }
  }

  /**
   * 转义 HTML
   */
  escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  }
}

/**
 * 动画演示管理器
 */
export class AnimationDemoManager {
  constructor(config = {}) {
    this.animations = new Map();
    this.currentAnimation = null;
    this.config = config;
  }

  /**
   * 注册动画
   */
  register(id, keyframes, options = {}) {
    this.animations.set(id, {
      id,
      keyframes,
      duration: options.duration || 1000,
      easing: options.easing || 'ease-in-out',
      delay: options.delay || 0,
      iterations: options.iterations || 1,
      direction: options.direction || 'normal',
      fillMode: options.fillMode || 'forwards',
      ...options,
    });
    return this;
  }

  /**
   * 播放动画
   */
  play(id, element) {
    const animation = this.animations.get(id);
    if (!animation) return null;

    this.currentAnimation = animation;

    const animation_obj = element.animate(animation.keyframes, {
      duration: animation.duration,
      easing: animation.easing,
      delay: animation.delay,
      iterations: animation.iterations,
      direction: animation.direction,
      fill: animation.fillMode,
    });

    return animation_obj;
  }

  /**
   * 停止动画
   */
  stop() {
    if (this.currentAnimation) {
      this.currentAnimation.cancel();
      this.currentAnimation = null;
    }
  }

  /**
   * 暂停动画
   */
  pause() {
    if (this.currentAnimation) {
      this.currentAnimation.pause();
    }
  }

  /**
   * 恢复动画
   */
  resume() {
    if (this.currentAnimation) {
      this.currentAnimation.play();
    }
  }

  /**
   * 创建过渡动画
   */
  createTransition(fromValue, toValue, duration = 1000) {
    return [{ opacity: fromValue }, { opacity: toValue }];
  }

  /**
   * 创建旋转动画
   */
  createRotation(degrees, duration = 1000) {
    return [
      { transform: 'rotate(0deg)' },
      { transform: `rotate(${degrees}deg)` },
    ];
  }

  /**
   * 创建缩放动画
   */
  createScale(fromScale, toScale, duration = 1000) {
    return [
      { transform: `scale(${fromScale})` },
      { transform: `scale(${toScale})` },
    ];
  }

  /**
   * 创建移动动画
   */
  createTranslate(fromX, fromY, toX, toY, duration = 1000) {
    return [
      { transform: `translate(${fromX}, ${fromY})` },
      { transform: `translate(${toX}, ${toY})` },
    ];
  }
}

/**
 * 检查点验证器
 */
export class CheckpointValidator {
  constructor(config = {}) {
    this.checkpoints = new Map();
    this.config = config;
  }

  /**
   * 注册检查点
   */
  register(id, condition, metadata = {}) {
    this.checkpoints.set(id, {
      id,
      condition,
      timeout: metadata.timeout || 30000,
      feedbackMessages: metadata.feedbackMessages || {},
      attempts: 0,
      maxAttempts: metadata.maxAttempts || 5,
      ...metadata,
    });
    return this;
  }

  /**
   * 验证检查点
   */
  async validate(id) {
    const checkpoint = this.checkpoints.get(id);
    if (!checkpoint) return { success: false, error: 'Checkpoint not found' };

    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        resolve({
          success: false,
          error: 'Timeout',
          message: checkpoint.feedbackMessages.timeout,
        });
      }, checkpoint.timeout);

      const check = setInterval(() => {
        checkpoint.attempts++;

        if (checkpoint.condition()) {
          clearInterval(check);
          clearTimeout(timeout);
          resolve({ success: true, attempts: checkpoint.attempts });
        }

        if (checkpoint.attempts >= checkpoint.maxAttempts) {
          clearInterval(check);
          clearTimeout(timeout);
          resolve({
            success: false,
            error: 'Max attempts exceeded',
            message: checkpoint.feedbackMessages.maxAttemptsExceeded,
          });
        }
      }, 100);
    });
  }

  /**
   * 重置检查点
   */
  reset(id) {
    const checkpoint = this.checkpoints.get(id);
    if (checkpoint) {
      checkpoint.attempts = 0;
    }
  }
}

/**
 * 教程上下文创建器
 */
export class TutorialContextBuilder {
  constructor(doc = document) {
    this.doc = doc;
    this.panels = new Map();
  }

  /**
   * 创建指导面板
   */
  createGuidancePanel(config) {
    const panel = this.doc.createElement('div');
    panel.className = 'guidance-panel';
    panel.innerHTML = `
      <div class="panel-header">
        <h3>${config.title}</h3>
        <button class="close-btn">×</button>
      </div>
      <div class="panel-content">
        <p class="description">${config.description}</p>
        <div class="guidance-text">${config.guidance}</div>
        ${config.hints ? `<div class="hints">${config.hints.map((h) => `<p>• ${h}</p>`).join('')}</div>` : ''}
      </div>
    `;

    panel.querySelector('.close-btn').addEventListener('click', () => {
      panel.remove();
      config.onDismiss?.();
    });

    this.doc.body.appendChild(panel);
    this.panels.set(config.title, panel);

    return panel;
  }

  /**
   * 创建代码面板
   */
  createCodePanel(config) {
    const panel = this.doc.createElement('div');
    panel.className = 'code-panel';
    panel.innerHTML = `
      <div class="panel-header">
        <h3>${config.title}</h3>
        <button class="close-btn">×</button>
      </div>
      <div class="panel-content">
        <div class="code-container">
          <pre><code>${this.escapeHtml(config.code)}</code></pre>
        </div>
        ${config.explanation ? `<p class="explanation">${config.explanation}</p>` : ''}
      </div>
    `;

    panel.querySelector('.close-btn').addEventListener('click', () => {
      panel.remove();
      config.onDismiss?.();
    });

    this.doc.body.appendChild(panel);
    return panel;
  }

  /**
   * 创建动画控制器
   */
  createAnimationController(config) {
    return {
      play: () => {
        const element = config.target;
        return element.animate(config.keyframes, {
          duration: config.duration,
          easing: config.easing,
        }).onfinish = config.onComplete;
      },
    };
  }

  /**
   * 创建检查点
   */
  createCheckpoint(config) {
    return {
      validate: async () => {
        return new Promise((resolve) => {
          const check = () => {
            if (config.condition()) {
              config.onSuccess?.();
              resolve(true);
            }
          };

          const interval = setInterval(check, 100);
          const timeout = setTimeout(() => {
            clearInterval(interval);
            config.onTimeout?.();
          }, config.timeout);
        });
      },
    };
  }

  /**
   * 转义 HTML
   */
  escapeHtml(text) {
    const div = this.doc.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

export default {
  TutorialStep,
  TutorialManager,
  CodeExampleManager,
  AnimationDemoManager,
  CheckpointValidator,
  TutorialContextBuilder,
};
