/**
 * designs/atlas/scale.js — 按数据规模动态派生布局尺度。
 *
 * ═══ 要解决的问题 ═══
 *
 * 星图的几何参数原本都是常量：`R_DISK = 1000`、`STAR_R` 固定 6 档、
 * `repR/dminBase/dminMag` 固定。于是节点翻倍时盘面不跟着变大，
 * 星点被弹簧与斥力挤出边界。
 *
 * 实测（`designs/scale-test.mjs`，纯 Node 跑真实放大数据）：
 *
 *   倍数   节点   盘内星点        布局耗时
 *   1×      488   339/405 (84%)   147 ms
 *   4×     1952   978/1620 (60%)  663 ms
 *   16×    7808   3258/6480 (50%) 10.29 s
 *
 * 一半星点跑到盘外 —— 这不是性能问题，是**几何容量**问题。
 *
 * ═══ 派生的基本原则 ═══
 *
 * **面积律**：星图是二维盘面，"每颗星占的面积"应当基本恒定，
 * 否则数据一多就挤成一团、一少就空得慌。所以
 *
 *     R ∝ √n        （盘面积 ∝ n，与星点数成正比）
 *
 * 同理，星间距、斥力半径、最小硬间距也都按 √n 缩放，
 * 这样**密度不随数据量变化**，星图看起来始终是同一张"星图"，
 * 只是变大或变小。
 *
 * ═══ 与标签容量的关系（重要） ═══
 *
 * 盘面变大**不会**提升"一屏能放下的标签数"——那个上限由
 * 屏幕面积 ÷ 标签面积决定，与盘在世界里的尺度无关
 * （实测峰值约 120 个）。
 *
 * 但用户已明确：**不要求所有标签在一屏里放下**。
 * 所以这里的目标不是"塞进一屏"，而是：
 *   · 盘面按 √n 变大，保证星点不被挤出；
 *   · 拉远看结构（星点 + 星座），拉近读公式（标签逐档展开）；
 *   · 平移浏览整张星图，而不是压缩到一屏。
 *
 * 因此本模块只负责"几何不溢出、密度恒定"，不追求"标签全入画"。
 */

/** 基准规模：以当前真实数据（405 条定理）为 1× */
export const BASE_THEOREMS = 405

/**
 * 派生整套布局尺度。
 *
 * @param {number} theoremCount 定理数量（不含猜想与研究者）
 * @param {object} [opts]
 * @param {number} [opts.baseDisk=1000]  1× 时的盘面半径
 * @param {number} [opts.maxScale=6]     最大放大倍数（防止极端数据把盘面拉爆）
 * @returns {{
 *   scale:number, R_DISK:number, repR:number, dminBase:number, dminMag:number,
 *   starRK:number, labelPxK:number, relaxIter:number, iter:number,
 *   density:number, notes:string
 * }}
 */
export function deriveLayoutScale(theoremCount, opts = {}) {
  const baseDisk = opts.baseDisk ?? 1000
  const maxScale = opts.maxScale ?? 6
  const n = Math.max(1, Number(theoremCount) || BASE_THEOREMS)

  /* ── 核心：面积律 ──
   * scale = √(n / base)。n 翻 4 倍 → 盘面翻 2 倍；面积翻 4 倍，与星点数同步。
   * 上限 maxScale 防止 100 倍数据把盘面拉到 10 倍（那时该走"分册"而不是继续放大）。 */
  const scale = Math.min(maxScale, Math.sqrt(n / BASE_THEOREMS))

  /* 盘面半径按 scale 线性增长（面积 ∝ scale² ∝ n，正是面积律） */
  const R_DISK = baseDisk * scale

  /* ── 星间距离参数 ──
   * 盘面上相邻星点的平均间距 ∝ R / √n ∝ √n/√n = 常数。
   * 所以这些"世界单位"的间距参数在理想情况下**应当保持不变** ——
   * 这正是面积律的意义：密度恒定，星点不会因为数据变多而互相挤压。
   *
   * 但有一个二阶效应需要补偿：力导向是**有限迭代**，节点越多，
   * 每次迭代的松弛相对不足（来不及收敛），实际分布会比理论更挤。
   * 用 scale^0.15 做轻微补偿 —— 指数取得很小，因为主效应已由 R_DISK 承担，
   * 这里只是补"收敛不足"的那一点。
   */
  const relaxComp = Math.pow(scale, 0.15)
  const repR = 140 * relaxComp
  const dminBase = 12 * relaxComp
  const dminMag = 4 * relaxComp

  /* ── 星点半径 ──
   * 星点按**屏幕像素**设定（STAR_R 是 css px），但它画在世界里。
   * 盘面变大后如果星点也跟着变大，"每颗星占的屏幕面积"就变了，会显得糊。
   *
   * 这里让星点半径**略微缩小**（scale^-0.25）：
   *   · 完全不缩（×1）：星点在屏幕上的相对大小随缩放变化，拉远时糊成一片；
   *   · 按 1/scale 缩：等于世界尺寸恒定，屏幕上看起来一样大 —— 这其实更对，
   *     但那会让"重要度 → 星点大小"的层次在大数据下被压扁。
   * 取 -0.25 是折中：大盘上的星点略小，层次仍在，也不糊。
   */
  const starRK = Math.pow(scale, -0.25)

  /* ── 标签字号 ──
   * 标签是 **css px**，与盘面尺度无关，所以理论上不用变。
   * 但盘面变大后，同样的字号相对于盘面变小 → 视觉层次变弱。
   * 给一个很轻微的放大（scale^0.12），让大星图的标签不至于显得过小。
   * 上限 1.35：字再大就挤了，宁可让用户拉近看。
   */
  const labelPxK = Math.min(1.35, Math.pow(scale, 0.12))

  /* ── 迭代次数 ──
   * 力导向是 O(iter × pairs)，而 pairs 随 n 增长。
   * 大数据下**不能**按比例增加迭代（那会变成 O(n²) 的墙），
   * 反而应当减少每节点迭代数、靠面积律保证初始分布已足够均匀。
   * 用 n^-0.12 缓降：n×16 时迭代从 320 降到约 220，总耗时约 ×11 而不是 ×22。
   */
  const iter = Math.round(320 * Math.pow(BASE_THEOREMS / n, 0.12))
  const relaxIter = Math.round(40 * Math.pow(BASE_THEOREMS / n, 0.10))

  /* 密度指标：星点占盘面积比。理想值应当恒定（= 1× 时的值） */
  const density = n / (Math.PI * R_DISK * R_DISK)

  return {
    scale, R_DISK, repR, dminBase, dminMag, starRK, labelPxK, iter, relaxIter, density,
    notes: buildNotes({ n, scale, iter, relaxIter, capped: scale >= maxScale }),
  }
}

function buildNotes({ n, scale, iter, relaxIter, capped }) {
  const parts = [`${n} 条定理 → 盘面 ×${scale.toFixed(2)}`]
  if (capped) parts.push('已达 maxScale 上限（继续增长应改走"分族分册"而不是放大盘面）')
  parts.push(`迭代 ${iter}/松弛 ${relaxIter}`)
  return parts.join('，')
}

/**
 * 把派生结果展开成"可直接覆盖常量"的补丁对象。
 *
 * 为什么用补丁而不是直接改 constants.js：
 * `constants.js` 在 SPEC 里标为冻结文件，被多个模块 import。
 * 直接改它会让所有模块在 import 时就绑定死值；而派生结果依赖运行时数据量。
 * 所以走"注入"：layout 接受一个 scale 对象，内部优先用它、缺省回落到常量。
 *
 * @param {ReturnType<typeof deriveLayoutScale>} s
 */
export function scalePatch(s) {
  return {
    R_DISK: s.R_DISK,
    REP_R: s.repR,
    DMIN_BASE: s.dminBase,
    DMIN_MAG: s.dminMag,
    STAR_R_K: s.starRK,
    FORMULA_PX_K: s.labelPxK,
    ITER: s.iter,
    RELAX_ITER: s.relaxIter,
  }
}
