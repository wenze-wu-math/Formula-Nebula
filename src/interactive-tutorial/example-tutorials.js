/**
 * 教程示例
 * Example Tutorials for Formula Nebula
 */

import {
  TutorialManager,
  CodeExampleManager,
  AnimationDemoManager,
  CheckpointValidator,
  TutorialContextBuilder,
} from './framework.js';

/**
 * 创建"星云基础入门"教程
 * Create "Nebula Basics" Tutorial
 */
export function createNebulaTutorial() {
  const manager = new TutorialManager({
    persistProgress: true,
    showProgressBar: true,
    autoProgress: false,
    theme: 'light',
  });

  return manager
    .addStep({
      id: 'intro',
      title: '欢迎来到公式诗云',
      description: '深入了解代数几何的知识图谱',
      order: 0,
      guidance: `
        公式诗云是一个交互式的知识可视化工具。
        它展示了 405 条代数几何定理和 59 条猜想之间的关联。

        整个知识库被组织成两个结构：
        • 主星系（盘状）：已定论的定理
        • 猜想星团（球状）：未定论的猜想

        让我们从基础开始！
      `,
      hints: [
        '点击界面中的任何公式来查看详细信息',
        '使用鼠标拖拽可以旋转星云',
        '滚轮缩放来改变视图大小',
      ],
      checkpoint: {
        condition: () => {
          // 检查用户是否已经与界面交互
          return document.querySelectorAll('[data-tutorial-interaction]').length > 0;
        },
        timeout: 60000,
        feedbackMessages: {
          timeout: '请与界面交互以继续',
          maxAttemptsExceeded: '达到最大尝试次数',
        },
      },
    })
    .addStep({
      id: 'rotation',
      title: '旋转视图',
      description: '学会旋转和移动摄像机',
      order: 1,
      guidance: `
        现在让我们练习旋转星云。
        这个操作让我们从不同角度观察知识结构。
      `,
      codeExample: {
        language: 'javascript',
        code: `
// 旋转摄像机
camera.position.applyAxisAngle(
  new Vector3(0, 1, 0),
  0.01
);

// 或使用控制器
controls.rotateLeft(0.01);
controls.rotateUp(0.01);
        `,
        explanation: '使用鼠标拖拽或代码来旋转视图',
      },
      animation: {
        type: 'rotation',
        duration: 3000,
        target: '.scene-container',
        keyframes: [
          { transform: 'rotateY(0deg)' },
          { transform: 'rotateY(360deg)' },
        ],
        easing: 'ease-in-out',
      },
      checkpoint: {
        condition: () => {
          // 检查摄像机是否已旋转
          return sessionStorage.getItem('cameraRotated') === 'true';
        },
        timeout: 30000,
      },
    })
    .addStep({
      id: 'zoom',
      title: '缩放操作',
      description: '学会放大和缩小视图',
      order: 2,
      guidance: `
        使用鼠标滚轮或触摸板进行缩放。
        这让我们能够看到整个星云或某个特定区域的细节。
      `,
      codeExample: {
        language: 'javascript',
        code: `
// 缩放摄像机
camera.position.multiplyScalar(1.1); // 放大
camera.position.multiplyScalar(0.9); // 缩小

// 使用轨道控制器
controls.autoRotate = true;
controls.autoRotateSpeed = 2;
        `,
        explanation: '调整摄像机距离来实现缩放',
      },
      checkpoint: {
        condition: () => {
          return sessionStorage.getItem('cameraZoomed') === 'true';
        },
        timeout: 30000,
      },
    })
    .addStep({
      id: 'selection',
      title: '选中公式',
      description: '点击公式查看详细信息',
      order: 3,
      guidance: `
        现在让我们点击一个公式来查看它的详细信息。
        每个公式都包含：
        • 中文名称和英文名称
        • 数学表达式
        • 相关的其他公式
        • 证明和背景信息
      `,
      codeExample: {
        language: 'javascript',
        code: `
// 点击监听器
document.addEventListener('click', (event) => {
  const formula = raycaster.intersectObjects(scene.children)[0];
  if (formula) {
    selectFormula(formula.object);
    showDetailsPanel(formula.object.data);
  }
});

// 显示细节面板
function showDetailsPanel(data) {
  const panel = document.createElement('div');
  panel.className = 'details-panel';
  panel.innerHTML = \`
    <h2>\${data.name}</h2>
    <p>\${data.description}</p>
  \`;
}
        `,
        explanation: '光线投射来检测点击的公式',
      },
      checkpoint: {
        condition: () => {
          return document.querySelector('.details-panel') !== null;
        },
        timeout: 45000,
      },
    })
    .addStep({
      id: 'search',
      title: '搜索功能',
      description: '使用搜索功能快速找到公式',
      order: 4,
      guidance: `
        使用右上角的搜索框来查找公式。
        支持多种查询方式：
        • 普通搜索：输入公式名称
        • 字段查询：status:open（开放问题）
        • 布尔组合：(family:scheme OR family:topo) -status:proved
        • 寻路：A -> B（找两个知识点的关联链）
      `,
      codeExample: {
        language: 'javascript',
        code: `
// 搜索处理
function handleSearch(query) {
  const results = searchEngine.query(query);

  if (query.includes('->')) {
    // 寻路查询
    const [start, end] = query.split('->');
    return findPath(start.trim(), end.trim());
  } else if (query.startsWith('status:')) {
    // 字段查询
    return filterByStatus(query.substring(7));
  } else {
    // 普通搜索
    return fullTextSearch(query);
  }
}
        `,
        explanation: '支持复杂的查询语法',
      },
      checkpoint: {
        condition: () => {
          return sessionStorage.getItem('searchPerformed') === 'true';
        },
        timeout: 40000,
      },
    })
    .addStep({
      id: 'settings',
      title: '设置和定制',
      description: '自定义视图和显示选项',
      order: 5,
      guidance: `
        点击右上角的"设置 ⚙"打开设置面板。

        可调整的选项包括：
        • 星系形态：旋涡、棒旋、同心环、弥散
        • 着色方式：按族、按状态、按领域
        • 显示层：切换各种元素的显示
        • 参数调整：旋转速度、光点大小等
      `,
      codeExample: {
        language: 'javascript',
        code: `
// 设置管理
const settings = {
  morphology: 'spiral', // 星系形态
  coloring: 'family',   // 着色方式
  features: {
    links: true,        // 显示连线
    cluster: true,      // 显示猜想星团
    glyphs: true,       // 显示公式
  },
  parameters: {
    spinRate: 0.02,
    glowScale: 0.85,
    brightness: 1.0,
  }
};

// 保存到 localStorage
localStorage.setItem('nebula.settings', JSON.stringify(settings));
        `,
        explanation: '所有设置保存在浏览器本地存储',
      },
      checkpoint: {
        condition: () => {
          return document.querySelector('.settings-panel') !== null;
        },
        timeout: 35000,
      },
    })
    .addStep({
      id: 'advanced',
      title: '高级功能',
      description: '探索高级交互特性',
      order: 6,
      guidance: `
        一些高级功能可以深化对知识结构的理解：

        • 关联连线：单击公式会显示与它相关的其他公式
        • 关系类型：不同的连线颜色表示不同的关系（等价、蕴含等）
        • 深链接：URL 编码了当前的视图状态，可以分享
        • 导出 SVG：将当前视图导出为矢量图
      `,
      codeExample: {
        language: 'javascript',
        code: `
// 获取当前视图的深链接
function generateDeepLink() {
  const state = {
    selectedNode: currentSelection.id,
    camera: {
      position: camera.position,
      target: controls.target,
    },
    settings: getCurrentSettings(),
  };

  const encoded = btoa(JSON.stringify(state));
  return \`\${window.location.origin}?state=\${encoded}\`;
}

// 导出 SVG
function exportSVG() {
  const svg = new SVGRenderer();
  svg.render(scene, camera);
  downloadFile(svg.domElement.outerHTML, 'nebula.svg');
}
        `,
        explanation: '分享和导出当前的可视化',
        runnable: true,
      },
      checkpoint: {
        condition: () => true,
        timeout: 30000,
      },
    });
}

/**
 * 创建"数据导入"教程
 */
export function createDataImportTutorial() {
  const manager = new TutorialManager({
    persistProgress: true,
    showProgressBar: true,
  });

  return manager
    .addStep({
      id: 'data-structure',
      title: '理解数据结构',
      description: '学习如何组织代数几何知识',
      order: 0,
      guidance: '代数几何知识被组织成节点（公式）和边（关联）。',
      codeExample: {
        language: 'javascript',
        code: `
// 节点结构
const formula = {
  id: 'hodge-conjecture',
  name: 'Hodge 猜想',
  en: 'Hodge Conjecture',
  family: 'hodge',
  importance: 0.95,
  latex: 'H^{2k}(X,\\mathbb{Q}) \\cap H^{k,k}',
  description: '...',
  status: 'open',
};

// 边结构
const link = [
  'hodge-conjecture',
  'algebraic-cycle',
  0.8,
  '代数圈的 Hodge 分解',
  'implies',
];
        `,
        explanation: '每个公式和关联都有标准化的数据格式',
      },
    })
    .addStep({
      id: 'format-validation',
      title: '格式验证',
      description: '确保数据格式正确',
      order: 1,
      guidance: '所有导入的数据必须通过格式检查。',
      codeExample: {
        language: 'javascript',
        code: `
// 验证节点
function validateFormula(formula) {
  const required = ['id', 'name', 'en', 'family', 'importance'];
  const missing = required.filter(key => !formula[key]);

  if (missing.length > 0) {
    throw new Error(\`Missing fields: \${missing.join(', ')}\`);
  }

  if (formula.importance < 0 || formula.importance > 1) {
    throw new Error('Importance must be between 0 and 1');
  }

  return true;
}

// 验证边
function validateLink(link) {
  const [source, target, weight, reason, type] = link;

  if (!source || !target) throw new Error('Missing node IDs');
  if (weight < 0 || weight > 1) throw new Error('Invalid weight');
  if (!type || !VALID_TYPES.includes(type)) {
    throw new Error('Invalid link type');
  }

  return true;
}
        `,
        explanation: '在导入前验证所有数据',
      },
    });
}

/**
 * 创建"性能优化"教程
 */
export function createPerformanceTutorial() {
  const manager = new TutorialManager({
    persistProgress: true,
  });

  return manager
    .addStep({
      id: 'perf-basics',
      title: '性能基础',
      description: '理解渲染性能的关键因素',
      order: 0,
      guidance: `
        公式诗云需要实时渲染 464 个 3D 对象。
        关键的性能指标包括：
        • FPS（帧率）：目标 60fps
        • Draw calls：越少越好
        • 显存占用：纹理和几何体的大小
      `,
      codeExample: {
        language: 'javascript',
        code: `
// 监测性能
class PerformanceMonitor {
  constructor() {
    this.stats = new Stats();
    this.stats.showPanel(0); // 0: fps, 1: ms, 2: mb
    document.body.appendChild(this.stats.dom);
  }

  update() {
    this.stats.update();

    // 记录性能数据
    const fps = this.stats.getFps();
    const memory = performance.memory?.usedJSHeapSize;

    if (fps < 50) {
      console.warn('Performance warning: FPS dropped to', fps);
    }
  }
}
        `,
        explanation: '使用 Stats.js 监测实时性能',
      },
    })
    .addStep({
      id: 'optimization-tips',
      title: '优化技巧',
      description: '实用的性能改进方法',
      order: 1,
      guidance: '几个可以立即应用的优化技巧。',
      codeExample: {
        language: 'javascript',
        code: `
// 1. 使用实例化渲染
const geometry = new BoxGeometry(1, 1, 1);
const material = new MeshStandardMaterial();
const mesh = new InstancedMesh(geometry, material, 464);
scene.add(mesh);

// 2. 启用 frustum 剔除
camera.frustumCulled = true;
mesh.frustumCulled = true;

// 3. 使用 LOD（细节层次）
const lod = new LOD();
const highPoly = createHighPolyMesh();
const lowPoly = createLowPolyMesh();

lod.addLevel(highPoly, 0);
lod.addLevel(lowPoly, 100);
scene.add(lod);

// 4. 缓存纹理
const textureCache = new Map();
function getTexture(url) {
  if (!textureCache.has(url)) {
    textureCache.set(url, new TextureLoader().load(url));
  }
  return textureCache.get(url);
}
        `,
        explanation: '实现高效的渲染管线',
      },
    });
}

/**
 * 创建"自定义主题"教程
 */
export function createThemingTutorial() {
  const manager = new TutorialManager({
    persistProgress: true,
  });

  return manager
    .addStep({
      id: 'color-system',
      title: '颜色系统',
      description: '了解配色方案',
      order: 0,
      guidance: `
        公式诗云使用 OKLab 色彩空间进行精确的色彩管理。

        主要的配色方案：
        • 8 个知识族，各有独特颜色
        • 统一橙黄模式：仅用亮度区分重要度
        • 状态颜色：绿（已证明）、橙（未解决）等
      `,
      codeExample: {
        language: 'javascript',
        code: `
// 定义颜色调色板
const PALETTE = {
  families: {
    scheme: { sRGB: '#e74c3c', oklab: { L: 0.82, a: 0.12, b: -0.05 } },
    curve: { sRGB: '#3498db', oklab: { L: 0.82, a: -0.08, b: -0.15 } },
    topo: { sRGB: '#2ecc71', oklab: { L: 0.82, a: -0.12, b: 0.08 } },
  },
  status: {
    open: '#ff8f6b',
    proved: '#7ee0a8',
    disproved: '#ff6b8a',
  }
};

// 转换到 OKLab
function sRGBtoOKLab(hex) {
  // 实现 sRGB -> 线性 -> OKLab 转换
  const rgb = parseInt(hex.slice(1), 16);
  // ... 转换逻辑
}
        `,
        explanation: '精确的色彩空间管理',
      },
    });
}

export default {
  createNebulaTutorial,
  createDataImportTutorial,
  createPerformanceTutorial,
  createThemingTutorial,
};
