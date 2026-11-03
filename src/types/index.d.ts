/**
 * Formula Nebula - Type Definitions
 * 核心数据结构与 API 类型定义
 */

// ============================================================================
// Core Data Types - 核心数据类型
// ============================================================================

/**
 * 知识节点 - 定理、概念或猜想
 */
export interface FormulaNode {
  /** 唯一标识符 */
  id: string;
  /** 中文名称 */
  name: string;
  /** 英文名称 */
  en: string;
  /** LaTeX 公式 */
  latex: string;
  /** 重要度 (0-1) */
  importance: number;
  /** 知识族 */
  family: FamilyType;
  /** 详细描述 */
  summary?: string;
  /** 完整详情 */
  detail?: string;
  /** 是否为猜想 */
  isConjecture?: boolean;
  /** 猜想状态 (仅用于猜想) */
  status?: ConjectureStatus;
  /** 猜想领域 (仅用于猜想) */
  field?: FieldType;
  /** 提出者 */
  proposer?: string;
  /** 提出年份 */
  year?: number;
  /** 最新进展年份 */
  progress?: number;
}

/**
 * 知识关联 - 节点之间的连接
 */
export interface FormulaLink {
  /** 源节点 ID */
  source: string;
  /** 目标节点 ID */
  target: string;
  /** 关联权重 (0-1) */
  weight: number;
  /** 关联理由 */
  reason: string;
  /** 关联类型 */
  type?: LinkType;
}

/**
 * 知识族类型
 */
export type FamilyType =
  | 'curve'        // 曲线
  | 'surface'      // 曲面
  | 'scheme'       // 概形
  | 'sheaf'        // 层
  | 'cohomology'   // 上同调
  | 'topology'     // 拓扑
  | 'modern'       // 现代理论
  | 'commutative'  // 交换代数
  | 'conjecture';  // 猜想 (星团)

/**
 * 猜想状态
 */
export type ConjectureStatus =
  | 'open'       // 未解决
  | 'partial'    // 部分解决
  | 'proved'     // 已证明
  | 'disproved'  // 已推翻
  | 'heuristic'; // 启发式

/**
 * 猜想领域
 */
export type FieldType =
  | 'algebraic-geometry'   // 代数几何
  | 'number-theory'        // 数论
  | 'complex-geometry'     // 复几何
  | 'topology'             // 拓扑
  | 'representation'       // 表示论
  | 'arithmetic';          // 算术几何

/**
 * 关联类型
 */
export type LinkType =
  | 'equivalent'    // 等价
  | 'defines'       // 定义与刻画
  | 'implies'       // 蕴含
  | 'generalizes'   // 推广与特例
  | 'computes'      // 计算与构造
  | 'property'      // 性质与保持
  | 'depends'       // 依赖
  | 'sameFamily'    // 同族
  | 'contrast'      // 对比
  | 'provenance'    // 同条与出处
  | 'analogy'       // 类比
  | 'related';      // 相关 (兜底)

// ============================================================================
// Layout & Rendering - 布局与渲染
// ============================================================================

/**
 * 3D 位置
 */
export interface Position3D {
  x: number;
  y: number;
  z: number;
}

/**
 * 布局节点 - 带空间位置的节点
 */
export interface LayoutNode extends FormulaNode {
  /** 3D 位置 */
  position: Position3D;
  /** 半径 (主星系) 或球心距 (星团) */
  radius: number;
  /** 方位角 */
  azimuth: number;
  /** 归一化重要度 rank */
  rank: number;
  /** 节点大小 */
  size: number;
  /** 亮度 */
  brightness: number;
  /** 光晕强度 */
  glowBase: number;
  /** 旋臂索引 (仅主星系) */
  armIdx?: number;
  /** 是否在星团中 */
  cluster?: boolean;
}

/**
 * 星系形态
 */
export type GalaxyShape =
  | 'spiral'   // 旋涡星系
  | 'barred'   // 棒旋星系
  | 'ring'     // 同心环
  | 'diffuse'; // 弥散盘

/**
 * 取景模式
 */
export type ViewMode =
  | 'panorama' // 全景
  | 'galaxy'   // 主星系
  | 'cluster'; // 猜想星团

/**
 * 着色模式
 */
export type ColorMode =
  | 'family'   // 按知识族
  | 'status'   // 按猜想状态
  | 'field'    // 按猜想领域
  | 'uniform'; // 统一橙黄

// ============================================================================
// Settings & Configuration - 设置与配置
// ============================================================================

/**
 * 应用设置
 */
export interface Settings {
  /** 星系形态 */
  shape: GalaxyShape;
  /** 取景模式 */
  view: ViewMode;
  /** 着色模式 */
  colorMode: ColorMode;

  /** 参数 */
  params: {
    /** 星系自转速度 */
    spinRate: number;
    /** 背景差异旋转 */
    decorSpinRate: number;
    /** 光点大小 */
    glowScale: number;
    /** 光点亮度 */
    glowStrength: number;
    /** 辉光阈值 */
    bloomThreshold: number;
    /** 公式亮度 */
    formulaBrightness: number;
    /** 连线不透明度 */
    lineOpacity: number;
    /** 悬停放大倍数 */
    hoverScale: number;
  };

  /** 显示层 */
  display: {
    /** 关联连线模式 */
    links: 'focus' | 'all' | 'off';
    /** 按关系类型着色连线 */
    linkTypes: boolean;
    /** 猜想星团 */
    cluster: boolean;
    /** 星团柔光 */
    clusterGlow: boolean;
    /** 状态色点 */
    markers: boolean;
    /** 背景星云 */
    nebula: boolean;
    /** 深空星点 */
    stars: boolean;
    /** 盘面辉光 */
    diskGlow: boolean;
    /** 后处理辉光 */
    bloom: boolean;
    /** 图例 */
    legend: boolean;
    /** 公式浮动动画 */
    bob: boolean;
    /** 相机环绕 */
    autoRotate: boolean;
  };

  /** 引力模式 */
  gravity: {
    /** 是否启用 */
    enabled: boolean;
    /** 跟随比例 */
    followRatio: number;
  };
}

// ============================================================================
// Search & Query - 搜索与查询
// ============================================================================

/**
 * 查询结果
 */
export interface QueryResult {
  /** 匹配的节点 */
  nodes: LayoutNode[];
  /** 查询语法错误 (如果有) */
  error?: string;
}

/**
 * 寻路结果
 */
export interface PathResult {
  /** 路径节点序列 */
  path: LayoutNode[];
  /** 跳数 */
  hops: number;
  /** 强度代价 */
  cost: number;
}

// ============================================================================
// Performance Monitoring - 性能监控
// ============================================================================

/**
 * 性能指标
 */
export interface PerformanceMetrics {
  /** FPS */
  fps: number;
  /** 内存使用 (MB) */
  memory: number;
  /** 渲染时间 (ms) */
  renderTime: number;
  /** 公式渲染次数 */
  formulaRenders: number;
  /** Draw calls */
  drawCalls: number;
  /** 三角形数 */
  triangles: number;
}

/**
 * 性能监控器
 */
export interface PerformanceMonitor {
  /** 获取当前指标 */
  getMetrics(): PerformanceMetrics;
  /** 打印报告 */
  printReport(): void;
  /** 开始监控 */
  start(): void;
  /** 停止监控 */
  stop(): void;
}

// ============================================================================
// API & Exports - API 与导出
// ============================================================================

/**
 * 导出选项
 */
export interface ExportOptions {
  /** 输出格式 */
  format: 'svg' | 'png' | 'json';
  /** 输出尺寸 */
  width?: number;
  height?: number;
  /** 是否包含背景 */
  background?: boolean;
  /** 质量 (0-1, 仅 PNG) */
  quality?: number;
}

/**
 * 全局 API
 */
export interface FormulaNebulaAPI {
  /** 版本号 */
  version: string;
  /** 获取所有节点 */
  getNodes(): LayoutNode[];
  /** 获取所有连接 */
  getLinks(): FormulaLink[];
  /** 搜索节点 */
  search(query: string): QueryResult;
  /** 寻路 */
  findPath(from: string, to: string): PathResult | null;
  /** 聚焦节点 */
  focusNode(nodeId: string): void;
  /** 导出 */
  export(options: ExportOptions): Promise<Blob | string>;
  /** 获取设置 */
  getSettings(): Settings;
  /** 更新设置 */
  updateSettings(settings: Partial<Settings>): void;
  /** 性能监控 */
  perfMonitor: PerformanceMonitor;
}

// ============================================================================
// Window Augmentation - 窗口对象增强
// ============================================================================

declare global {
  interface Window {
    /** Formula Nebula 全局 API */
    formulaNebula?: FormulaNebulaAPI;
    /** 性能监控器 (开发模式) */
    __perfMonitor?: PerformanceMonitor;
  }
}
