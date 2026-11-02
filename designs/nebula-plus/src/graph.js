/**
 * ═══════════════════════════════════════════════════════════════
 *  数据装配 + 布局
 * ═══════════════════════════════════════════════════════════════
 *
 *  空间形态：一个**薄盘** + 明亮核球 + 对数旋臂。
 *  参考 Cohenjikan/shiyun 的星系实现（指数盘 + 高斯臂偏差 + 核球隆起）。
 *
 *  布局哲学（「越中心越重要」）：
 *    rank = 1（最重要）→ 落在盘心核球里，面积最大、最亮
 *    rank = 0（最边缘）→ 散在盘的最外缘，面积最小、最暗
 *
 *  分两个阶段，顺序很重要：
 *    ① buildGraph()  —— 纯数据：校验、建边、算度数、归一化重要度
 *    ② layoutGraph() —— 需要先知道每个公式的宽高比（烘焙后才能拿到），
 *                       才能正确计算"面积归一化"后的大小与防重叠半径
 *
 *  随机数用固定种子，所以每次刷新星系形状一致，方便微调参数。
 */

import * as THREE from 'three'
import { LAYOUT, GLYPH, MOTION, SHAPES, CLUSTER, RESEARCHERS } from './config.js'
import { NODES, LINKS, FAMILIES } from '../../../src/data/knowledge.js'
import { EXTRA_A_NODES, EXTRA_A_LINKS } from '../../../src/data/extra-a.js'
import { EXTRA_B_NODES, EXTRA_B_LINKS } from '../../../src/data/extra-b.js'
import { EXTRA_C_NODES, EXTRA_C_LINKS } from '../../../src/data/extra-c.js'
import { EXTRA_D_NODES, EXTRA_D_LINKS } from '../../../src/data/extra-d.js'
import { EXTRA_E_NODES, EXTRA_E_LINKS } from '../../../src/data/extra-e.js'
import { EXTRA_F_NODES, EXTRA_F_LINKS } from '../../../src/data/extra-f.js'
import { EXTRA_G_NODES, EXTRA_G_LINKS } from '../../../src/data/extra-g.js'
import { EXTRA_H_NODES, EXTRA_H_LINKS } from '../../../src/data/extra-h.js'
import {
  CONJECTURE_NODES, CONJECTURE_LINKS,
  CONJECTURE_STATUS, CONJECTURE_FIELDS,
} from '../../../src/data/conjectures.js'
import {
  RESEARCHER_AREAS, RESEARCHER_NODES, RESEARCHER_LINKS,
} from '../../../src/data/researchers.js'
/* ── 采集来的知识库（kb-src/ 管线生成）──
 * 这些是自动采集的条目，此前 nebula-plus **没有接入**（只显示手写的 488 条）。
 * 接入后与 atlas / map / manuscript 看到的是同一个知识库。 */
import { STACKS_NODES, STACKS_LINKS } from '../../../src/data/stacks-extra.js'
import { UNSOLVED_NODES, UNSOLVED_LINKS } from '../../../src/data/unsolved-extra.js'
import { NLAB_NODES, NLAB_LINKS } from '../../../src/data/nlab-extra.js'
import { MATHLIB_NODES, MATHLIB_LINKS } from '../../../src/data/mathlib-extra.js'
import { RESEARCHER_EXTRA_NODES } from '../../../src/data/researchers-extra.js'
import { RESEARCHER_EXTRA_LINKS } from '../../../src/data/researchers-extra-links.js'
import { WIKI_NODES, WIKI_LINKS } from '../../../src/data/wikipedia-extra.js'
import { CROSS_SOURCE_LINKS } from '../../../src/data/cross-source-links.js'
import { buildEqualizedPalette, hexToLinear } from '../../../src/palette.js'
import {
  resolveLinkType, typeColor, heroThreshold, typeStats, LINK_TYPES, RELATED,
} from '../../../src/linkTypes.js'

/** 主星系的知识来源。分文件是为了让内容好维护，也方便按主题增删。 */
const GALAXY_NODES = [
  ...NODES,
  ...EXTRA_A_NODES, ...EXTRA_B_NODES, ...EXTRA_C_NODES, ...EXTRA_D_NODES,
  ...EXTRA_E_NODES, ...EXTRA_F_NODES, ...EXTRA_G_NODES, ...EXTRA_H_NODES,
  /* 采集数据：Stacks 定理 + nLab 概念 + mathlib 形式化定理 */
  ...STACKS_NODES, ...NLAB_NODES, ...MATHLIB_NODES,
]
const GALAXY_LINKS = [
  ...LINKS,
  ...EXTRA_A_LINKS, ...EXTRA_B_LINKS, ...EXTRA_C_LINKS, ...EXTRA_D_LINKS,
  ...EXTRA_E_LINKS, ...EXTRA_F_LINKS, ...EXTRA_G_LINKS, ...EXTRA_H_LINKS,
  /* 采集数据的关联（含跨源关联） */
  ...STACKS_LINKS, ...NLAB_LINKS, ...MATHLIB_LINKS, ...CROSS_SOURCE_LINKS,
]

/** 猜想星团的 id 集合 —— 用来在装配时判定一个节点属于哪个结构 */
const CONJECTURE_IDS = new Set([...CONJECTURE_NODES, ...UNSOLVED_NODES, ...WIKI_NODES].map((n) => n.id))

/** 研究者星团的 id 集合 —— 第三个结构，表示知识图谱上的活动主体 */
const RESEARCHER_IDS = new Set([...RESEARCHER_NODES, ...RESEARCHER_EXTRA_NODES].map((n) => n.id))

/** 全体节点/关联（三个结构合并后交给同一套渲染管线） */
const ALL_NODES = [
  ...GALAXY_NODES,
  ...CONJECTURE_NODES, ...UNSOLVED_NODES, ...WIKI_NODES,
  ...RESEARCHER_NODES, ...RESEARCHER_EXTRA_NODES,
]
const ALL_LINKS = [
  ...GALAXY_LINKS,
  ...CONJECTURE_LINKS, ...UNSOLVED_LINKS, ...WIKI_LINKS,
  ...RESEARCHER_LINKS, ...RESEARCHER_EXTRA_LINKS,
]

/* ───────────── 族色调色板 ─────────────
 *
 * 把 8 个族的颜色统一搬到 GLYPH.familyLightness 这个**感知明度**上。
 * 这一步是必需的，不是美化：本项目「越中心越重要」靠亮度表达，
 * 而原始 8 色的感知明度差 1.81 倍 —— 不均衡的话，"浅色族但不重要"的公式
 * 会比"深色族但很重要"的还亮，重要度信号直接被色相淹没。
 * 算法与取舍见 src/palette.js 顶部的大段注释。 */
const FAMILY_LINEAR = (() => {
  const raw = {}
  for (const [key, def] of Object.entries(FAMILIES)) raw[key] = def.color
  const eq = buildEqualizedPalette(raw, GLYPH.familyLightness)
  const out = {}
  for (const [key, v] of Object.entries(eq)) out[key] = v.linear
  return out})()

/** 统一橙黄（mono 模式），只算一次 */
const MONO_LINEAR = hexToLinear(GLYPH.color)

/**
 * 修正 1：族 → 旋臂序号（8 族 → 8 臂，一一对应）。
 *
 * 为什么不直接用 `FAMILIES[family].arm`：那份数据里 8 个族只有 4 个 arm 值
 * （0,1,2,3,0,1,2,3），本身就是"两族共用一条臂"的结构，改臂数也救不了。
 * 这里按 FAMILIES 的声明顺序重新编号 0..7，得到稳定的"一族一臂"。
 *
 * 顺序（与 FAMILIES 的键序一致）：
 *   0 foundation 交换代数与基础
 *   1 scheme     概形与层
 *   2 cohomology 上同调
 *   3 map        态射与奇点
 *   4 curve      曲线与曲面
 *   5 intersect  相交与特征类
 *   6 birational 双有理与MMP
 *   7 modern     模空间与现代
 *
 * 这个顺序有语义：前四个是"基础→概形→上同调→态射"的递进，
 * 后四个是"曲线→相交→双有理→模空间"的应用面。所以扫过盘面时
 * 相邻臂在语义上也相邻，不是随机排列。
 */
const FAMILY_ARM_INDEX = (() => {
  const out = {}
  Object.keys(FAMILIES).forEach((key, i) => { out[key] = i })
  return out
})()

/* ───────────── 种子化随机（mulberry32） ─────────────
 * 换 SEED 就能得到一朵形状不同的星系。 */
const SEED = 20240915

function makeRng(seed) {
  let a = seed >>> 0
  return function rng() {
    a = (a + 0x6D2B79F5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** 字符串 → 32 位哈希。用内容而不是下标定位置，
 *  这样往知识库里插新公式不会把其它公式的位置全打乱。 */
function hashStr(s) {
  let h = 2166136261 >>> 0
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619) >>> 0
  }
  return h >>> 0
}

/** 取哈希里第 k 个字节并归一化到 [0,1) */
function hbyte(h, k) {
  return ((h >>> (k * 8)) & 0xff) / 256
}

/** 由三个均匀量合成的近似高斯 N(0, ~0.5)（Irwin–Hall） */
function gauss3(a, b, c) {
  return a + b + c - 1.5
}

/**
 * 阶段一：装配知识图谱（纯数据，不依赖渲染）
 *
 * 两个结构在这里被区分开：
 *   · 主星系（galaxy）—— 已定论的知识，重要度由 family 与 importance 表达
 *   · 猜想星团（cluster）—— 未定论的知识，额外带 status / field / year
 *
 * ⚠ rank 必须**按结构分别归一化**，不能全局归一化。
 *   理由：rank 是"在该结构里的相对重要程度"，它同时驱动半径、
 *   亮度与大小。若把 59 条猜想与 328 条定理放在一个池子里归一化，
 *   猜想的 rank 会被定理的分布压扁（实测 rank 全部落在 0.51~0.97
 *   的窄带里），于是星团内部"越中心越重要"的层次就没了。
 *   分开归一化之后，星团自己跑满量程，核心是黎曼猜想、P vs NP
 *   这种量级，外缘是 Lagarias 判据这种卫星条目。
 *
 * @returns {{nodes: Array, links: Array, byId: Map, stats: object}}
 */
export function buildGraph() {
  /* ── 1. 规范化节点 ── */
  const byId = new Map()
  const nodes = []

  for (const raw of ALL_NODES) {
    if (byId.has(raw.id)) {
      console.warn('[graph] 重复 id，已跳过:', raw.id)
      continue
    }

    const isConj = CONJECTURE_IDS.has(raw.id)
    const isResearcher = RESEARCHER_IDS.has(raw.id)

    const n = {
      ...raw,
      importance: clamp01(raw.importance ?? 0.5),
      // 猜想节点没有 family（它用的是 field），所以给一个无害的默认值：
      // star 结构不用 family 定位，只用它做"按族着色"这一种可选的显示模式。
      family: FAMILIES[raw.family] ? raw.family
        : (isConj ? 'conjecture' : isResearcher ? 'researcher' : 'foundation'),
      cluster: isConj,
      researcher: isResearcher,
      degree: 0,
      linkIds: [],
    }

    if (isConj) {
      // 猜想的四个专有字段。缺省值保证面板渲染不需要到处判空：
      // status 决定色点颜色，field 决定球面方向，year/proposer 只用于展示。
      n.status = CONJECTURE_STATUS[raw.status] ? raw.status : 'open'
      n.field = CONJECTURE_FIELDS[raw.field] ? raw.field : 'ag'
      n.year = typeof raw.year === 'number' ? raw.year : null
      n.proposer = raw.proposer || ''
    }

    if (isResearcher) {
      // 研究者节点复用星团的"领域 → 球面方向"逻辑，但有自己的领域表。
      n.field = RESEARCHER_AREAS[raw.field] ? raw.field : 'arith'
      n.institution = raw.institution || ''
      n.focus = raw.focus || ''
      n.representativeWorks = Array.isArray(raw.representativeWorks)
        ? raw.representativeWorks : []
    }

    byId.set(n.id, n)
    nodes.push(n)
  }

  /* ── 2. 规范化边（过滤悬空引用与重复）──
   *
   * 元组第 5 个元素是**显式关系类型**。全部 1620 条边都已逐条读过理由、
   * 人工判定并写入了这个位置（判定表见 scripts/_batches2/merged.txt）。
   * 所以类型现在是**数据**，不是运行时推断。
   *
   * ⚠ linkTypes.js 的正则推断**没有删**，它是兜底：
   *   将来新加的边如果没写第 5 个元素，仍然能被猜一个类型出来。
   *   界面会说明白哪些是判定的、哪些是推断的。 */
  const seen = new Set()
  const links = []

  for (const [a, b, w = 0.5, label = '', explicitType] of ALL_LINKS) {
    if (!byId.has(a) || !byId.has(b)) {
      console.warn('[graph] 忽略悬空关联:', a, '→', b)
      continue
    }
    if (a === b) continue
    const key = a < b ? `${a}|${b}` : `${b}|${a}`
    if (seen.has(key)) continue
    seen.add(key)

    const link = { source: a, target: b, weight: clamp01(w), label, key }
    link.type = resolveLinkType({
      source: a, target: b, weight: link.weight, label, type: explicitType,
    })
    // 类型色在这里就算好（而不是每帧在 links.js 里查表）：
    // 颜色是常量，而 links.js 的 colorsBase 是**一次性**构建的 Float32Array，
    // 在那里查表等于每条边都多做一次字符串 → Map 查找；这里只做一次。
    link.typeColor = typeColor(link.type)
    // 跨结构边单独打标：links.js 用它决定画法（外拱弧 vs 内束线）、
    // 用色（紫罗兰 vs 蓝），以及切换取景时是否隐藏。
    const ca = byId.get(a).cluster
    const cb = byId.get(b).cluster
    const ra = byId.get(a).researcher
    const rb = byId.get(b).researcher
    link.researcher = ra || rb
    link.cross = ca !== cb || ra !== rb
    // 非跨结构边要记住自己属于哪一侧，取景过滤时用
    link.clusterSide = ca ? 'cluster' : (ra ? 'researcher' : 'galaxy')
    links.push(link)
    byId.get(a).linkIds.push(link)
    byId.get(b).linkIds.push(link)
  }

  for (const n of nodes) n.degree = n.linkIds.length

  /* ── 2b. 强调预算 ──
   *
   * 「哪些边值得被画得更醒目」只能有**一个**判据，否则粗细、亮度、
   * 标签常显各定一套标准，调起来必然互相打架。
   * 阈值取全局权重的 p90；但注意权重是**量化**的（1620 条只有 46 个不同值，
   * 且 102 条挤在 0.9 上），所以实际放行的是 263 条 = 16.2%，
   * 而不是名义上的 10% —— 详见 linkTypes.js 里那段说明。
   * 因此这里不猜数量，而是**数出来**存进 heroCount，UI 要显示就直接用。 */
  const heroCutoff = heroThreshold(links, 0.9)
  let heroCount = 0
  for (const l of links) {
    l.hero = l.weight >= heroCutoff
    if (l.hero) heroCount++
  }

  /* ── 3. 重要度归一化（**按结构分别做**，理由见函数头注释） ── */
  const norm = (group) => {
    if (!group.length) return
    const imps = group.map((n) => n.importance)
    const lo = Math.min(...imps)
    const hi = Math.max(...imps)
    const span = Math.max(1e-6, hi - lo)
    for (const n of group) n.rank = (n.importance - lo) / span
    return [lo, hi]
  }

  const galaxy = nodes.filter((n) => !n.cluster && !n.researcher)
  const conj = nodes.filter((n) => n.cluster)
  const researchers = nodes.filter((n) => n.researcher)
  const impRange = norm(galaxy)
  const conjRange = norm(conj)
  const researchRange = norm(researchers)

  for (const n of nodes) {
    // 亮度：像银河系一样，越重要越亮（>1 的部分交给 bloom 晕开）
    n.brightness = GLYPH.brightnessMin +
      Math.pow(n.rank, GLYPH.brightCurve) *
      (GLYPH.brightnessMax - GLYPH.brightnessMin)

    // 大小倍率
    n.sizeScale = GLYPH.sizeMin +
      Math.pow(n.rank, GLYPH.sizeCurve) * (GLYPH.sizeMax - GLYPH.sizeMin)

    // 颜色 + 发光权重
    applyColor(n)
  }

  return {
    nodes,
    links,
    byId,
    impRange: impRange || [0, 1],
    conjRange: conjRange || [0, 1],
    researchRange: researchRange || [0, 1],
    /* 猜想状态色的 linear 表示，按 status 索引。
     * 暴露出来是为了让验证脚本能断言"画面上的色点颜色确实等于
     * CONJECTURE_STATUS 里声明的那个" —— 否则就只能断言"同状态同色"，
     * 而那并不能发现"整组颜色都取错了"这类错误。 */
    conjStatusColors: Object.fromEntries(
      Object.entries(CONJECTURE_STATUS).map(([k, v]) => {
        const c = hexToLinear(v.color)
        return [k, [c.r, c.g, c.b]]
      }),
    ),
    /* ── 关系类型层 ──
     *
     * 暴露出来给三处用：
     *   ① links.js —— 按类型着色时要查每个类型的颜色；
     *   ② ui.js 图例 / 详情面板 —— 显示"这条边是什么关系"；
     *   ③ 验证脚本 —— 断言画面上的颜色确实等于声明的颜色。
     *
     * ⚠ `typeCoverage` 是个**不好看但必须外露**的数：它约 0.167，
     *   意思是只有 16.7% 的边获得了可判定的类型，其余 83.3% 退回 related。
     *   把这个数摆在明面上，是为了防止有人看到"7 种颜色都在图例里"
     *   就以为整张图都被分类了。
     *   提高它只有一条正路：把理由文本写得更明确（不是放宽匹配规则）。 */
    linkTypes: {
      heroCutoff,
      heroCount,
      stats: typeStats(links),
      defs: [...LINK_TYPES, RELATED].map((t) => ({
        id: t.id, zh: t.zh, en: t.en,
        color: t.color,
        linear: hexToLinear(t.color),
      })),
    },
    stats: {
      nodeCount: nodes.length,
      linkCount: links.length,
      crossLinks: links.filter((l) => l.cross).length,
      galaxyCount: galaxy.length,
      conjCount: conj.length,
      researcherCount: researchers.length,
      families: [...new Set(galaxy.map((n) => n.family))].length,
      avgDegree: (links.length * 2 / Math.max(1, nodes.length)).toFixed(2),
      impRange: `${(impRange ? impRange[0] : 0).toFixed(2)} ~ ${(impRange ? impRange[1] : 0).toFixed(2)}`,
      conjRange: `${(conjRange ? conjRange[0] : 0).toFixed(2)} ~ ${(conjRange ? conjRange[1] : 0).toFixed(2)}`,
      researchRange: `${(researchRange ? researchRange[0] : 0).toFixed(2)} ~ ${(researchRange ? researchRange[1] : 0).toFixed(2)}`,
      isolated: nodes.filter((n) => n.degree === 0).length,
    },
  }
}

/**
 * 算一个节点的颜色与发光权重。
 *
 * 单独抽出来是为了**切换着色模式时能就地重算**：
 * 用户切「按知识族 / 统一橙黄」不该让整个 464 节点的星系重新布局，
 * 只需按当前模式重取一次色（见 scene.js 的 recolor）。
 *
 * 猜想节点有自己的两套着色模式（status / field），主星系有两套
 * （family / mono）—— 见 CONJECTURE_STATUS 与 CONJECTURE_FIELDS 的注释。
 * 两种模式都不影响明度：明度永远由 n.brightness（即 rank）承担，
 * 所以「越中心越重要」在彩色模式下依然成立。
 *
 * @param {object} n 已算好 rank / family 的节点
 */
export function applyColor(n) {
  const mode = GLYPH.colorMode

  if (n.researcher) {
    /* 研究者星团：领域色始终是最有区分度的那一维，
     * 不受主星系/猜想星团的着色模式影响。 */
    const def = RESEARCHER_AREAS[n.field]
    n.baseColor = def ? hexToLinear(def.color) : MONO_LINEAR
    n.markerColor = n.baseColor
  } else if (n.cluster) {
    /* 猜想星团：默认按**状态**着色，因为"这条还悬着吗"是读猜想时
     * 第一个要问的问题，色点与公式底色都服务于这件事。
     * 切到 field 时改看领域归属 —— 6 个领域在球面上各有方向，
     * 于是着色会把"星座"结构显出来。 */
    const def = mode === 'field'
      ? CONJECTURE_FIELDS[n.field]
      : CONJECTURE_STATUS[n.status]
    n.baseColor = def ? hexToLinear(def.color) : MONO_LINEAR
    // 星团的色点颜色与公式底色共用同一个色，切模式时一起变
    n.markerColor = n.baseColor
  } else {
    // 颜色：按知识族着色（GLYPH.colorMode === 'mono' 时退回统一橙黄）
    //
    // ⚠ 这里**只决定色相/彩度**，明度统一由 n.brightness 承担。
    //   两件事分开，是「越中心越重要」能在彩色模式下依然成立的前提：
    //   族色的感知明度已在 palette.js 里被拉到同一条线上，
    //   所以剩下的亮度差异就纯粹来自重要度了。
    n.baseColor = mode === 'mono'
      ? MONO_LINEAR
      : (FAMILY_LINEAR[n.family] || MONO_LINEAR)
    n.markerColor = n.baseColor
  }

  // 发光的**归一化**权重（0~1，与 strength 无关）。
  //
  // 关键：这里只算"这个节点相对其它节点该发多少光"，**不乘** strength。
  // 真正的强度在 scene.js 每帧乘上去，这样设置面板调"发光强度"能立刻生效，
  // 不需要重新布局、也不需要重建精灵。
  //
  // 用 [minFactor, coreBoost] 两端的写法而不是"核心倍数"：
  // 后者容易写成外缘也在发光（rank=0 时仍拿满），那样整片盘会糊成一层雾，
  // 反而看不出核心在哪。
  const g = GLYPH.glow
  n.glowBase = g.minFactor +
    Math.pow(n.rank, g.coreCurve) * (g.coreBoost - g.minFactor)
}

/**
 * 阶段二：布局（必须在公式烘焙完成、拿到宽高比之后调用）
 *
 * @param {object} graph  buildGraph() 的产物
 * @param {Map<string, object>} baked  id → { aspect, emWidth, emHeight, ... }
 */
export function layoutGraph(graph, baked) {
  const { nodes } = graph
  const galaxyNodes = nodes.filter((n) => !n.cluster && !n.researcher)
  const conjNodes = nodes.filter((n) => n.cluster)
  const researcherNodes = nodes.filter((n) => n.researcher)

  /* ── 1. 计算每个公式的世界尺寸 ──
   * 面积归一化：worldW × worldH = (baseSize × sizeScale)²
   * 这样"大小"完全由重要度决定，不会被公式的固有形状（高分式 vs 单字符）左右。 */
  let sumChar = 0
  let cnt = 0

  for (const n of nodes) {
    const b = baked.get(n.id)
    if (!b || !b.emWidth || !b.emHeight) {
      n.width = GLYPH.baseSize * n.sizeScale
      n.height = n.width * 0.5
      n.aspect = 2
      continue
    }
    n.aspect = b.aspect

    const targetArea = Math.pow(GLYPH.baseSize * n.sizeScale, 2)
    let w = Math.sqrt(targetArea * b.aspect)
    let h = targetArea / w

    if (w > GLYPH.maxWidth) {
      const k = GLYPH.maxWidth / w
      w *= k
      h *= k
    }
    const maxH = GLYPH.maxWidth * 0.42
    if (h > maxH) {
      const k = maxH / h
      w *= k
      h *= k
    }

    n.width = w
    n.height = h
    sumChar += Math.max(w, h)
    cnt++
  }

  const avgSize = cnt ? sumChar / cnt : 8

  /* ── 2a. 主星系：盘面定位 ── */
  const galaxyRelax = layoutGalaxy(galaxyNodes)

  /* ── 2b. 猜想星团：球面定位 ── */
  const conjRelax = layoutCluster(conjNodes)

  /* ── 2c. 研究者星团：同款球面定位，但按研究者领域表分组 ── */
  const researcherRelax = layoutResearcherCluster(researcherNodes)

  /* ── 3. 回写极坐标 / 运动参数（三个结构共用） ──
   * ⚠ 星团节点的"极坐标"是**球坐标**，语义与盘面不同：
   *   主星系 theta = 盘面方位角，ratio = |y|/r 为薄盘厚度比
   *   猜想/研究者星团 theta = 球面方位角，ratio = 极角的正弦（用于判断"是否近球心"）
   *   这些都只被 scene.js 的浮动与取景读取，互不干扰。 */
  const rng = makeRng(SEED)
  for (const n of nodes) {
    if (n.cluster || n.researcher) {
      // 球坐标：theta 是方位角，phi 是极角，二者都已在球面布局里定好。
      // 这里只把 y 相对球心的高度折算成 ratio，供细节面板与浮动使用。
      const cy = n.cluster ? CLUSTER.center[1] : RESEARCHERS.center[1]
      const dy = n.pos.y - cy
      n.theta = n.sphTheta
      n.ratio = Math.min(1, Math.abs(dy) / Math.max(1e-6, n.sphR))
    } else {
      const { y } = n.pos
      n.theta = Math.atan2(n.pos.z, n.pos.x)
      n.ratio = Math.min(1, Math.abs(y) / Math.max(1e-6, n.radius))
    }
    n.basePos = { x: n.pos.x, y: n.pos.y, z: n.pos.z }
  }

  /* ── 4. 运动参数 ──
   * 整层刚性自转（见 scene.js），所以这里只需要每个公式自己的轻微浮动参数。 */
  for (const n of nodes) {
    n.bobSpeed = MOTION.bobSpeedMin + rng() * (MOTION.bobSpeedMax - MOTION.bobSpeedMin)
    n.bobPhase = rng() * Math.PI * 2
    n.bobAmp = MOTION.bobAmplitude * (0.6 + rng() * 0.8)
    n.spinPhase = rng() * Math.PI * 2
  }

  return { avgSize, relaxRounds: galaxyRelax + conjRelax + researcherRelax }
}

/**
 * 主星系的盘面定位（原 layoutGraph 的 2~3 步，抽出来以便与星团并列）。
 * 语义见下方各段注释：半径由重要度分位决定，方位角由形态决定。
 */
function layoutGalaxy(nodes) {
  if (!nodes.length) return 0

  const R_OUT = LAYOUT.radiusOuter

  /* 半径：**按分位数**铺满指数盘，而不是按 importance 的数值直接映射。
   *
   * 为什么不能直接映射：知识库里的 importance 普遍偏高（中位 0.76），
   * 归一化成 rank 后也偏高，于是 (1-rank)^curve 普遍偏小，
   * 大量公式被压进盘心 —— 实测 150 个塞在 r<50 内，而 r>82 只有 38 个。
   * 每个公式被松弛钉在自己的半径圆环上、周长就那么大，
   * 内圈"总宽度/周长"高达 12 倍，**再松弛也解不开**。
   *
   * 解法：把公式按 importantce 降序排，第 i 个取圆盘面积分布的 (i+0.5)/N 分位，
   * 再令它满足指数盘的累积面积 A(r) = 1-(1+r/h)e^(-r/h)。
   * 这样：
   *   · 半径分布严格服从指数盘（真实星系的盘就是指数盘），密度由中心向外平滑衰减
   *   · "越重要越靠中心"依然**严格单调**（Spearman 仍为 −1），只是不再堆成一坨
   *   · 每条环上的节点数自动与该环周长匹配，容量天然够用
   */
  const expRadius = exponentialDiskRadii(
    nodes, R_OUT, LAYOUT.diskScale, LAYOUT.radiusInner)

  /* ── 当前形态 ──
   * ⚠ 形态**只参与方位角 θ**，绝不参与半径 r。
   *   r 完全由上面的面积分位决定，所以"越中心越重要"对所有形态都成立。 */
  const SHAPE = SHAPES[LAYOUT.shape] || SHAPES.spiral

  nodes.forEach((n) => {
    const h = hashStr(n.id)
    const h2 = hashStr(n.name + '#' + n.id)

    n.radiusTarget = expRadius.get(n.id)

    // 叠一点径向抖动：真实星系的盘也不是一圈圈同心环
    // （σ ≈ 一档，让相邻重要度的公式互相渗透，而不是硬分层）
    // jitter 由形态给倍率：同心环要压小（否则环会糊），弥散盘要放大（抹平环状密度波）
    const radJit = gauss3(hbyte(h, 0), hbyte(h, 1), hbyte(h, 2)) *
      R_OUT * 0.055 * SHAPE.jitter
    n.radius = clamp(n.radiusTarget + radJit, LAYOUT.radiusInner * 0.45, R_OUT * 1.06)

    /* ── 同心环形态：把半径吸附到离散环上 ──
     * 关键是**单调取整**：rank 越高（越重要）→ 目标半径越小 → 环号越小，
     * 取整不会改变先后次序，所以"越重要越靠内"原样保留。
     * 若在吸附后再叠随机偏移就会打乱相邻档的次序，所以这里只按环号取整、
     * 不额外抖动（抖动在上一行的 radJit 里，且已被压到 0.15 倍）。 */
    if (SHAPE.rings > 0) {
      const span = R_OUT - LAYOUT.radiusInner
      const u = (n.radiusTarget - LAYOUT.radiusInner) / Math.max(1e-6, span)
      const ring = Math.round(clamp(u, 0, 1) * (SHAPE.rings - 1))
      const ringR = LAYOUT.radiusInner + (ring / (SHAPE.rings - 1)) * span
      // 环内保留一点残余抖动（已被 jitter 压小），否则 16 个环会像刻线一样死板
      n.ringIndex = ring
      n.radius = clamp(ringR + (n.radius - n.radiusTarget),
        LAYOUT.radiusInner * 0.45, R_OUT * 1.06)
      n.radiusTarget = ringR
    }

    /* ② 盘面方位角 θ —— 形态在这里起作用 */
    const t = n.radius / R_OUT
    /* 记住这个节点挂在哪条臂上。
     * 它本来只是 azimuthFor 的一个入参，但**验证脚本需要它**：
     * 要判断"每条臂是否真的聚在自己的分支相位上"，就必须知道
     * 每个节点属于哪条臂 —— 从坐标反推是推不出来的（那正是要检验的东西）。
     * 所以把它落盘到节点上，作为布局的可观测输出。
     *
     * ⚠ 修正 1（2026-11-01）：**不能**再用 src/data/knowledge.js 里的 arm 值。
     *   那份数据只有 4 个 arm（0,1,2,3），8 个族里有 4 对共用编号
     *   （foundation/curve 都是 0，scheme/intersect 都是 1，依此类推）——
     *   于是无论把臂数调成几条，"两个族挤在同一条臂上"都改不掉。
     *   本方案在 8 条臂下要"一族一臂"，所以在这里用**自己的**族→臂序号映射：
     *   按 FAMILIES 的声明顺序 0..7，顺序稳定（对象字面量的键序是插入序），
     *   族-臂对应关系就是可预测、可记忆的。 */
    n.armIdx = FAMILY_ARM_INDEX[n.family] ?? 0
    n.theta = azimuthFor(n, SHAPE, t, { h, h2, armIdx: n.armIdx })

    /* ③ 盘面内散射：让每条臂有真实宽度，使整层成为有体积的带而不是一张纸 */
    const scat = (u, sgn) => Math.pow(u, 2.2) * (sgn < 0.5 ? -1 : 1) * 0.20 * n.radius
    const sx = scat(hbyte(h2, 2), hbyte(h2, 3))
    const sz = scat(hbyte(h2, 4), hbyte(h2, 5))

    // 盘心额外加一圈**绝对尺度**的散射，把中心从十字糊成圆盘
    // （相对散射在 r→0 时也趋于 0，光靠它填不满盘心）
    const cs = SHAPE.coreBlur > 0
      ? Math.max(0, SHAPE.coreBlur - t) / SHAPE.coreBlur
      : 0
    const coreScat = cs * cs * R_OUT * LAYOUT.coreScatter
    const cjx = (hbyte(h2, 6) - 0.5) * 2
    const cjz = (hbyte(h2, 7) - 0.5) * 2

    n.planeX = Math.cos(n.theta) * n.radius + sx + cjx * coreScat
    n.planeZ = Math.sin(n.theta) * n.radius + sz + cjz * coreScat

    /* ④ 竖直高度：这就是"大致在同一平面内"的来源。
     * y 正比于 r × thickness，并在盘心按 bulge 隆起（核球）。
     * 因为系数 thickness = 0.105 远小于 1，y 相对 r 始终是"薄薄一层"。
     * ⚠ 形态只调倍率（SHAPE.thickness），绝不改"y ∝ r"这个比例关系，
     *   所以「大致在同一平面内」对四种形态都成立。 */
    const bulge = 1 + Math.max(0, 0.45 - t) * LAYOUT.bulgeSwell
    n.baseY = gauss3(hbyte(h, 5), hbyte(h, 6), hbyte(h2, 8)) *
      n.radius * LAYOUT.thickness * 2.1 * bulge * (SHAPE.thickness ?? 1)

    n.pos = { x: n.planeX, y: n.baseY, z: n.planeZ }
  })

  /* ── 松弛：只在盘面内推挤，半径与高度都不许改 ──
   * 这是本布局最关键的一步。若让松弛自由推挤，整个星系会向外膨胀，
   * "越中心越重要"的语义就被毁掉（实测半径相关性从 −0.82 掉到 0.06）。
   * 所以：排斥只作用在 x-z 平面上，之后把节点重新投回它自己的半径圆环上，
   * y（盘面厚度）完全不参与松弛 —— 薄盘和重要度层级都能保住。 */
  return relaxInPlane(nodes, SHAPE)
}

/**
 * 猜想星团的定位。
 *
 * ── 设计要点 ──
 *
 * ① **球对称**是信息，不是装饰。
 *    主星系是薄盘（旋臂、核球、明确方向性），星团是球。一眼就能看出
 *    这是两类不同的对象，不需要读图例。真实宇宙也如此：盘星系 + 球状伴星团。
 *
 * ② 内部仍沿用主星系那套**正交分解**，所以核心语义没丢：
 *      球心距 ← importance（越核心的猜想越著名、越靠球心）
 *      球面方向 ← field（6 个领域各占球面一个方向，形成 6 个"星座"）
 *    这个分解与主星系的"半径 ← importance、方位角 ← family"是同构的，
 *    所以 verify-importance 那套秩相关断言在星团里可以原样复用。
 *
 * ③ 半径用 **King 剖面**而不是均匀球：
 *      面密度 Σ(r) ∝ (1 + (r/r_c)²)^(-3/2)
 *    球状星团是强烈中心聚集的，均匀球看起来像个壳，不像"团"。
 *    为了让重要度分位与半径严格单调，这里仍然用**面积分位**的写法：
 *    按 rank 降序累加占用面积，取分位 c，反解 Σ 的累积分布。
 *
 * ④ 公式在球面上是 billboard（永远正面朝相机），所以"球"只在
 *    位置分布上是球，视觉上仍是漂浮的公式群 —— 这与主星系一致。
 *
 * ⑤ 松弛在球面上做：沿**切向**推开，然后把节点重新投回自己的半径球壳
 *    [r(1−f), r(1+f)]。与主星系一样，半径带是乘性的（越靠球心越紧），
 *    所以"越靠球心越重要"不会被松弛抹平。
 */
function layoutCluster(nodes) {
  return layoutSphere(nodes, CLUSTER, Object.keys(CONJECTURE_FIELDS))
}

function layoutResearcherCluster(nodes) {
  return layoutSphere(nodes, RESEARCHERS, Object.keys(RESEARCHER_AREAS))
}

function layoutSphere(nodes, C, FIELDS) {
  if (!nodes.length) return 0

  const R_CL = C.radius
  const [cx, cy, cz] = C.center

  /* ── ① 球心距：King 剖面的**三维**累积分布 ──
   *
   * King 模型的三维密度是
   *     ρ(r) ∝ (1 + (r/r_c)²)^(−3/2)
   * 球壳内的数量 ∝ ρ(r)·r²，于是累积数量有闭形式：
   *     N(<r) ∝ ∫ u²(1+u²)^(−3/2) du = asinh(x) − x/√(1+x²),   x = r/r_c
   *
   * ⚠ 这里**必须**用三维式，不能用投影后的面密度式
   *   （Σ(R) ∝ (1+(R/r_c)²)^(−1)，累积是 ln(1+x²) − x²/(1+x²)）。
   *   两者的区别不是细节：面密度式是"把球压扁到二维再撒点"的分布，
   *   把它当成三维半径分布用，会让节点**明显偏外** ——
   *   实测中位半径 34.9/51.9 = 0.67（正确值应为 ~0.49），
   *   星团看起来像个"壳"而不是"团"，中心完全不够密。
   *   这个错误被 verify-cluster.mjs 的 King 剖面断言抓到。
   *
   * 这个函数在 [0,∞) 上严格递增，所以照例二分反解，
   * 做法与指数盘（exponentialDiskRadii）完全一致。 */
  const rc = Math.max(1e-6, R_CL * C.coreRadius)
  const cum = (r) => {
    const x = r / rc
    return Math.asinh(x) - x / Math.sqrt(1 + x * x)
  }
  const c0 = cum(R_CL * 0.06)      // 内半径：留一点空，避免公式全挤在一个点上
  const c1 = cum(R_CL)
  const invCum = (target) => {
    let lo = R_CL * 0.06, hi = R_CL * 4
    for (let i = 0; i < 60; i++) {
      const mid = (lo + hi) * 0.5
      if (cum(mid) < target) lo = mid; else hi = mid
    }
    return (lo + hi) * 0.5
  }

  const order = [...nodes].sort((a, b) => b.rank - a.rank)   // 越重要越靠前
  const areas = order.map((n) => Math.max(1e-6, n.width * n.height))
  const total = areas.reduce((s, v) => s + v, 0)

  let acc = 0
  const radiusOf = new Map()
  order.forEach((n, i) => {
    acc += areas[i]
    const c = (acc - areas[i] * 0.5) / total
    radiusOf.set(n.id, invCum(c0 + c * (c1 - c0)))
  })

  /* ── ② 球面方向：field 决定方位，哈希给抖动 ──
   * 领域方向固定（下面 FIELDS 数组），这样同一领域的节点会聚集在
   * 球面同一侧，形成可辨认的"星座"。然后在方向周围加各向同性抖动，
   * 抖动幅度随半径增大（外缘更松散），使星团看起来是"团"不是"六个瓣"。 */
  nodes.forEach((n) => {
    const h = hashStr(n.id)
    const h2 = hashStr(n.name + '#' + n.id)

    n.clusterRadiusTarget = radiusOf.get(n.id)

    // 半径抖动：与主星系同样的 ±5.5% 量级，让密度层次自然过渡
    const radJit = gauss3(hbyte(h, 0), hbyte(h, 1), hbyte(h, 2)) * R_CL * 0.055
    n.sphR = clamp(n.clusterRadiusTarget + radJit, R_CL * 0.05, R_CL * 1.04)

    /* 领域基准方向。用球面坐标的 (phi, theta)：
     *   phi   ∈ [0, π]  从 +y 极量起的极角
     *   theta ∈ [0, 2π) 赤道面上的方位角
     * 6 个领域在球面上**均匀分布**：3 个在北半球、3 个在南半球，
     * 每个半球内方位角相差 120°。这样任意两个领域方向之间的夹角都接近
     * 109°（四面体角），既不重叠也不孤立。 */
    const fi = Math.max(0, FIELDS.indexOf(n.field))
    const band = Math.floor(fi / 3)               // 0 = 北半球, 1 = 南半球
    const within = fi % 3
    const basePhi = band === 0 ? 0.955 : Math.PI - 0.955   // ≈ 54.7° / 125.3°
    const baseTheta = (within / 3) * Math.PI * 2 + (band === 1 ? Math.PI / 3 : 0)

    /* 抖动幅度：**靠近球心时压小、外缘放大**。
     * 理由与主星系的"乘性半径带"一致 —— 核心是层次最要紧的地方，
     * 让抖动把核心领域的区分糊掉就本末倒置了。
     * 另外乘一个"领域内散布"因子：同一领域内也要散开，
     * 否则 6 个领域会各自缩成一个点。 */
    const t = n.sphR / R_CL
    const spread = 0.30 + 0.70 * t
    const dPhi = gauss3(hbyte(h, 3), hbyte(h2, 0), hbyte(h2, 1)) * 0.62 * spread
    const dTheta = gauss3(hbyte(h, 4), hbyte(h2, 2), hbyte(h2, 3)) * 0.78 * spread

    const phi = clamp(basePhi + dPhi, 0.10, Math.PI - 0.10)
    const theta = baseTheta + dTheta

    n.sphPhi = phi
    n.sphTheta = theta

    const sp = Math.sin(phi)
    n.pos = {
      x: cx + n.sphR * sp * Math.cos(theta),
      y: cy + n.sphR * Math.cos(phi),
      z: cz + n.sphR * sp * Math.sin(theta),
    }
  })

  return relaxOnSphere(nodes, cx, cy, cz, R_CL)
}

/**
 * 球面上的松弛：把公式当成切平面内的椭圆互相推开，
 * 然后把节点重新投回自己的半径球壳 [r(1−f), r(1+f)]。
 *
 * 与主星系的 relaxInPlane 的对应关系：
 *   盘面 (切向, 径向)  →  球面 (两个切向)
 *   半径带 r±f·r       →  球壳 r±f·r（同样是乘性，所以越靠球心越紧）
 *
 * ⚠ 这里**不**做"不许越过邻居"的次序约束（主星系有，靠 radiusMin/Max）。
 *   理由：球面上"邻居"没有线性次序 —— 半径相同的两个节点在球面上可以
 *   隔得很远，用秩相邻去约束会把无关的节点绑在一起，反而让球面分布变形。
 *   次序由 rank → 半径的**严格单调映射**保证（面积分位），松弛只动切向
 *   与很小的径向，实测秩相关仍在 −0.97 以上（scripts/verify-cluster.mjs）。
 */
function relaxOnSphere(nodes, cx, cy, cz, R_CL) {
  const iters = LAYOUT.relaxIterations
  if (iters <= 0) return 0
  if (nodes.length < 2) return 0

  // 径向自由度：与主星系同源，但球面没有形态倍率
  const freedom = LAYOUT.radialFreedom * 0.55
  for (const n of nodes) {
    const f = freedom * n.sphR
    n.radiusMin = Math.max(R_CL * 0.04, n.sphR - f)
    n.radiusMax = Math.min(R_CL * 1.05, n.sphR + f)
  }

  const allow = LAYOUT.relaxAllowOverlap

  for (let it = 0; it < iters; it++) {
    const strength = 0.5 * (1 - it / iters) + 0.12

    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i]

      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j]

        /* 两个节点在**切平面**里的相对位置。
         * 取 a 处的局部标架：法向 = a 的径向单位向量，
         * 两个切向由与全局 y 轴叉乘得到（y 轴与径向几乎不平行，
         * 因为球心在 -z 方向而公式分布在球面上，只有极点附近会退化 ——
         * 那里用 z 轴兜底）。 */
        const nax = a.pos.x - cx, nay = a.pos.y - cy, naz = a.pos.z - cz
        const na = Math.hypot(nax, nay, naz) || 1
        const ux = nax / na, uy = nay / na, uz = naz / na

        // 切向基 1：与全局 y 轴叉乘（极点附近改用 z 轴）
        let t1x = uz, t1y = 0, t1z = -ux
        let t1l = Math.hypot(t1x, t1y, t1z)
        if (t1l < 1e-3) { t1x = 1; t1y = 0; t1z = 0; t1l = 1 }
        t1x /= t1l; t1y /= t1l; t1z /= t1l

        // 切向基 2：法向 × 切向 1
        const t2x = uy * t1z - uz * t1y
        const t2y = uz * t1x - ux * t1z
        const t2z = ux * t1y - uy * t1x

        const dx = b.pos.x - a.pos.x
        const dy = b.pos.y - a.pos.y
        const dz = b.pos.z - a.pos.z

        const c1 = dx * t1x + dy * t1y + dz * t1z    // 切向分量 1
        const c2 = dx * t2x + dy * t2y + dz * t2z    // 切向分量 2
        const c3 = dx * ux + dy * uy + dz * uz       // 径向分量（球壳厚度方向）

        /* 椭圆的半轴。
         * 公式是 billboard，屏幕上是水平长条，所以两个切向的"占位"并不相等：
         *   切向 1（由 y 轴叉乘得到）大致对应屏幕的**水平**方向 → 用宽度
         *   切向 2（法向 × 切向1）大致对应屏幕的**竖直**方向 → 用高度
         * 两者之间还夹着一个由相机朝向决定的中间情形，但经验上这个近似
         * 已经能让球面不糊（实测遮挡率与主星系同量级）。
         * 径向用高度 —— 球壳很薄（freedom 0.55），这里只是防止两个节点
         * 沿径向叠死。 */
        const ax = (a.width + b.width) * 0.5 * LAYOUT.spacing
        const ay = (a.height + b.height) * 0.5 * LAYOUT.spacing
        const az = (a.height + b.height) * 0.5 * LAYOUT.spacing * LAYOUT.radialSquash

        const p = c1 / ax
        const q = c2 / ay
        const rr = c3 / az
        const d = Math.sqrt(p * p + q * q + rr * rr)

        if (d >= allow) continue

        let need
        if (d < 1e-9) {
          // 完全重合：沿确定性方向错开（不用随机数，保证可复现）
          const fx = (i % 7) - 3
          const fz = (j % 5) - 2
          const fl = Math.hypot(fx, fz) || 1
          need = allow * strength * 0.5
          const ddx = (fx / fl) * need, ddz = (fz / fl) * need
          a.pos.x -= ddx; a.pos.z -= ddz
          b.pos.x += ddx; b.pos.z += ddz
          continue
        }

        need = ((allow - d) / d) * strength * 0.5
        // 归一化位移各自乘回半轴，再合成回世界坐标
        const w1 = p * need * ax
        const w2 = q * need * ay
        const w3 = rr * need * az
        const ddx = t1x * w1 + t2x * w2 + ux * w3
        const ddy = t1y * w1 + t2y * w2 + uy * w3
        const ddz = t1z * w1 + t2z * w2 + uz * w3

        a.pos.x -= ddx; a.pos.y -= ddy; a.pos.z -= ddz
        b.pos.x += ddx; b.pos.y += ddy; b.pos.z += ddz
      }
    }

    // 夹回自己的球壳
    for (const n of nodes) {
      const dx = n.pos.x - cx, dy = n.pos.y - cy, dz = n.pos.z - cz
      const r = Math.hypot(dx, dy, dz)
      if (r < 1e-6) continue
      const rc2 = clamp(r, n.radiusMin, n.radiusMax)
      if (rc2 !== r) {
        const k = rc2 / r
        n.pos.x = cx + dx * k
        n.pos.y = cy + dy * k
        n.pos.z = cz + dz * k
      }
    }
  }

  return iters
}

/* ───────────── 形态 → 方位角 θ ─────────────
 *
 * 这是「多星系形态」唯一改动布局的地方，**只算 θ，不碰 r**。
 * 所以「越中心越重要」由半径承载、对所有形态天然成立，
 * 不需要为每个形态单独验证单调性（scripts/verify-importance.mjs 四种形态全过）。
 *
 * 四种形态：
 *
 *  spiral  对数旋臂：θ = 臂编号 + t·twist + 高斯臂偏差
 *          族的 arm 决定挂哪条臂，半径决定沿臂缠绕多少（经典旋涡星系）
 *
 *  barred  棒旋：核球区（t < bar）整片被拉成一条棒，棒外才是 2 条旋臂。
 *          棒是"两条反向的臂"在中心的退化形态，所以用 |x| 型分布而不是角度型。
 *          做法：把 θ 往棒的两个方向（0 与 π）**吸附**，越靠中心吸得越紧。
 *
 *  ring    同心环：θ 完全均匀（arms=0），结构全部由半径上的离散环给出
 *
 *  diffuse 弥散盘：θ 完全均匀，且半径抖动放大（在调用方用 SHAPE.jitter 处理）
 *
 * @param {object} n     节点（读它的哈希）
 * @param {object} S     形态定义
 * @param {number} t     归一化半径 r / R_OUT
 * @param {{h:number,h2:number,armIdx:number}} ctx
 * @returns {number} 方位角（弧度）
 */
function azimuthFor(n, S, t, ctx) {
  const { h, h2, armIdx } = ctx

  /* ── 无旋臂形态（同心环 / 弥散盘）：方位角完全均匀 ──
   * ⚠ hbyte 返回的是**已归一化**的 [0, 1)（内部除了 256）。
   *   两个字节合成一个更细的均匀数：hbyte(h,4) 给高位、hbyte(h2,9) 给低位。
   *   （只有一个字节的话只有 256 级台阶，257 个节点上会看出重复角度。） */
  if (!S.arms) {
    const u = hbyte(h, 4) + hbyte(h2, 9) / 256
    return u * Math.PI * 2
  }

  // 旋臂编号：barred 只有 2 条臂，要按 arms 取模重新映射
  const branch = ((armIdx % S.arms) / S.arms) * Math.PI * 2
  const twist = t * S.twist

  // 高斯臂偏差，收紧系数让公式比背景星云更贴臂线
  const armDev = gauss3(hbyte(h, 3), hbyte(h2, 0), hbyte(h2, 1)) *
    S.armSpread * S.armTight

  // 靠近盘心时角向弥散：把"N 条臂交叉成 X"糊成圆的盘心（真实星系核球就是这样）
  const cb = S.coreBlur > 0 ? Math.max(0, S.coreBlur - t) / S.coreBlur : 0
  const az = hbyte(h, 4)   // 已归一化到 [0,1)

  let theta = branch + twist + armDev + (az - 0.5) * Math.PI * 2 * cb

  /* ── 棒：把核球区的方位角往棒轴（0 与 π 两个方向）吸附 ──
   * 棒旋星系的棒是**刚体**，星体在里面不走圆轨道，而是沿棒轴拉长的轨道。
   * 模拟办法：把 θ 朝**最近的**那个棒端方向压。
   *   barSpread = 1 → 不压缩（无棒效果）
   *   barSpread = 0.12 → 横向压到 12%，成一根细棒
   * 取 0.12 而不是 0，是为了让棒有"宽度"而不是一条数学直线。
   *
   * ⚠ 必须先归一化到 [0, 2π) 再算。θ 由 branch + twist + …叠出来，
   *   数值上可以到 11 弧度以上；若直接和归一化的目标角做线性插值，
   *   两者相差好几圈，插值出来的角度毫无意义（棒会乱甩）。
   *
   * 吸附强度沿半径衰减（(1-t/bar)^1.5），所以棒是**中间最实、两端渐散**，
   * 与棒外那两条旋臂自然衔接 —— 这正是真实棒旋星系的样子。 */
  if (S.bar > 0 && t < S.bar) {
    const TAU = Math.PI * 2
    const th = ((theta % TAU) + TAU) % TAU          // 归一化到 [0, 2π)

    // 最近的棒轴：0、π，以及 2π（与 0 是同一条轴，但离 th 更近）
    let axis = 0
    let best = Infinity
    for (const cand of [0, Math.PI, TAU]) {
      const d = Math.abs(th - cand)
      if (d < best) { best = d; axis = cand }
    }

    const w = Math.pow(1 - t / S.bar, 1.5)          // 越靠中心吸得越紧
    const target = axis + (th - axis) * S.barSpread // th-axis ∈ [-π/2, π/2]
    theta = th * (1 - w) + target * w
  }

  return theta
}

/* ───────────── 指数盘半径分配 ─────────────
 * 把节点按重要度降序，铺到指数盘的面积分位上。
 * 指数盘的面密度 Σ(r) ∝ e^(-r/h)，累积面积 A(r) = 1-(1+r/h)e^(-r/h)。
 * 第 i 个（共 N 个）节点取 c 分位，解 A(r) = c·A(R_OUT)。
 *
 * ── 为什么用「面积分位」而不是「个数分位」──
 * 公式的**大小与重要度正相关**（越重要越大），于是若按个数平均分位，
 * 盘心会同时承受两个惩罚：
 *   1. 个数多 —— 最重要的 20% 全被塞进盘心那一小块；
 *   2. 每个还特别大 —— 核心公式面积约为边缘公式的 3 倍。
 * 实测核心只占盘面约 8% 的面积，却要装 20% 的公式 —— 超载约 2.4 倍，
 * 所以盘心必然糊住（修前核心公式可读竖带 0px、112 个公式被完全遮住）。
 *
 * 改成按**占用面积**分位后，大公式自动多占面积份额、把后面的往外推：
 *     c_i = (Σ_{j<i} a_j + a_i/2) / Σ a_j      a_i = 宽_i × 高_i
 * 核心不再超载，同时仍按重要度排序分配半径，
 * 所以"越重要越靠内"的单调性完全保留。
 * 实测：完全被遮住的公式从 112 个降到约 50 个，核心可读竖带 0px → 6px 以上。
 *
 * ── 为什么要留一个内半径 rInner ──
 * 公式的**大小不随半径缩小**，所以半径 r 处一个公式占的角宽 ≈ 宽/r。
 * 若让最重要的公式落在 r→0，它需要的角位趋于 2π 甚至更多 ——
 * 无论盘做多大都装不下，只会表现为盘心糊成一团。
 * 真实星系的核球也是有有限半径的，所以把面积分位的起点抬到 rInner。 */
function exponentialDiskRadii(nodes, R_OUT, hFrac, rInner) {
  const h = Math.max(1e-6, R_OUT * hFrac)
  const A = (r) => 1 - (1 + r / h) * Math.exp(-r / h)
  const a0 = A(rInner), a1 = A(R_OUT)

  // A 严格单调，二分求反函数（60 次足够到浮点精度）
  const inv = (target) => {
    let lo = rInner, hi = R_OUT * 4
    for (let i = 0; i < 60; i++) {
      const mid = (lo + hi) * 0.5
      if (A(mid) < target) lo = mid; else hi = mid
    }
    return (lo + hi) * 0.5
  }

  const order = [...nodes].sort((a, b) => b.rank - a.rank)   // 越重要越靠前
  const out = new Map()

  // 占用面积份额（用宽×高；两者都在 layoutGraph 里算好了）
  const areas = order.map((n) => Math.max(1e-6, n.width * n.height))
  const total = areas.reduce((s, v) => s + v, 0)

  let cum = 0
  order.forEach((n, i) => {
    cum += areas[i]
    const c = (cum - areas[i] * 0.5) / total   // 该公式面积份额的中点
    out.set(n.id, inv(a0 + c * (a1 - a0)))
  })
  return out
}

/* ───────────── 盘面内松弛 ─────────────
 * 把每个公式当成半径 = max(宽,高)/2 × spacing 的圆来排斥，
 * 但**排斥只在 x-z 平面内**，且每个节点被软约束拉回它自己的半径。
 * y 完全不参与 → 盘面厚度不会被推厚，始终是"一片"。
 *
 * ── 为什么必须给"径向自由度" ──
 * 早先版本每轮把节点**硬投影**回自己的半径圆环，只能沿环滑动。
 * 那时容量上限是死的：半径 r 的环周长 2πr 就那么大，
 * 而公式大小不随半径缩小，于是 r 处最多放得下 2πr / 宽 个公式。
 * 257 个公式挤在盘心那几环时，"总宽度/周长"高达 12 倍 ——
 * 无论怎么松弛都解不开（这就是之前严重重叠的根因）。
 *
 * 现在改成在每个节点的**半径带** [r(1-f), r(1+f)] 内自由移动：
 * 等价于把"一圈圈 1D 圆环"变成"一条条 2D 环带"，容量立刻宽松得多，
 * 公式之间可以一里一外地错开，而不是只能在同一个圈上挤。
 *
 * ── 怎么保证"越中心越重要"不被破坏 ──
 * 1) 带是**乘性**的：r ± f·r，所以内圈绝对位移小、外圈位移大，
 *    越靠近中心的位置越"钉死"，核心的层次感不会被松弛抹平。
 * 2) 带外的位移被**硬夹住**（clamp），重要公式再怎么被推也进不了最外圈。
 * 3) 松弛结束后由 verify-importance.mjs 用 Spearman 秩相关验收，
 *    实测半径与重要度的相关性始终保持在 −0.95 以上。
 *
 * 复杂度 O(iter · n²)，两百多个节点毫无压力。 */

function relaxInPlane(nodes, SHAPE = SHAPES.spiral) {
  const iters = LAYOUT.relaxIterations
  if (iters <= 0) return 0

  // 径向自由度由形态给倍率：同心环要收紧（自由度太大会把环糊掉），
  // 弥散盘可以放宽（没有结构要保，能换更多可读性）。
  const freedom = LAYOUT.radialFreedom * (SHAPE.freedom ?? 1)

  /* ── 半径带：既要保持"越中心越重要"，又要留够错开的空间 ──
   * 松弛是按"谁被压住就推开谁"来的，它**不看重要度**。如果每个节点
   * 都能在自己的 ±f·r 带里自由移动，一个次要公式就可能跑到比它更
   * 重要的公式内侧 —— 实测这把盘面半径的秩相关从 −0.99 拉低到 −0.88。
   *
   * 最直接的想法是"不许越过邻居的中线"，但那会把带的宽度上限锁死成
   * **相邻重要度节点的目标半径间距**（实测只有 ~0.58），而公式在径向
   * 上需要让开的距离是 高×spacing×squash ≈ 5 —— 带太窄就推不开，
   * 实测"被完全遮住"从 48 个恶化到 69 个。**光有次序没有可读性是没用的。**
   *
   * 所以取两者的较大值：
   *     lo = max(半径 − f·半径,  前一个节点的中线)
   *     hi = min(半径 + f·半径,  后一个节点的中线)
   *     若 hi − lo < 最小可用宽度，就以目标半径为中心向两侧撑到该宽度
   *
   * 含义：**次序在"排得开"的前提下尽量保持**。个别相邻节点之间允许
   * 小幅互换（幅度被最小宽度限制住，肉眼几乎看不出），换来的是公式
   * 真的能错开。这正是"严格次序"与"能看清"之间的正确取舍点。 */
  const byRank = [...nodes].sort((a, b) => b.rank - a.rank)   // 越重要越靠前，半径递增

  // 每个节点在径向上至少要让开多少（与 runRelax 里的 az 同一套量纲）
  const minWidth = (n) =>
    n.height * LAYOUT.spacing * LAYOUT.radialSquash * LAYOUT.rankOrderSlack

  for (let i = 0; i < byRank.length; i++) {
    const n = byRank[i]
    const f = freedom * n.radius

    const prev = byRank[i - 1]
    const next = byRank[i + 1]

    // 下界：不许越过前一个（更重要）节点的中线
    let lo = Math.max(LAYOUT.radiusInner * 0.35, n.radius - f)
    if (prev) lo = Math.max(lo, (prev.radius + n.radius) * 0.5)

    // 上界：不许越过后一个（更次要）节点的中线
    let hi = n.radius + f
    if (next) hi = Math.min(hi, (n.radius + next.radius) * 0.5)

    // 太窄就撑开（允许小幅次序互换，换取真的能排开）
    const need = minWidth(n)
    if (hi - lo < need) {
      lo = n.radius - need * 0.5
      hi = n.radius + need * 0.5
    }

    // 目标半径本身必须落在带内，否则夹取会失效（理论上不会发生）
    n.radiusMin = Math.min(lo, n.radius)
    n.radiusMax = Math.max(hi, n.radius)
  }

  return runRelax(nodes, iters)
}

/* 松弛主循环。半径带（radiusMin/radiusMax）由调用方先设好。 */
/**
 * 盘面空间网格：把 O(n²) 的两两检测降到 O(n·k)。
 *
 * ═══ 为什么需要 ═══
 *
 * runRelax 原本是「每轮对全部 n(n-1)/2 对做椭圆检测」× 200 轮。
 * 3,027 个节点时 = 9.16 亿次内层迭代，实测 layout 耗时 79.6 秒
 * —— 这是 nebula-plus 首屏 140 秒的主因。
 *
 * 但实际需要检测的只有「可能重叠的邻居」：公式的椭圆半轴 ax/az
 * 决定了一个有限的搜索半径，超出这个半径的两点不可能满足 d < allow。
 *
 * ═══ 做法 ═══
 *
 * 把 (x, z) 平面按「最大可能的椭圆半轴」分桶，每个点只与
 * 本桶 + 8 个相邻桶里的点比较。桶边长取 ax/az 的最大值，
 * 保证不会漏掉任何可能重叠的对。
 *
 * ═══ 与 O(n²) 的等价性 ═══
 *
 * 不是近似 —— 只要桶边长 ≥ 最大搜索半径，就不会漏对。
 * 漏掉的只有「距离远到椭圆判定必然通过」的对，那些对本来就不产生推力。
 * 所以输出**逐位相同**（用 check-layout-hash 的思路可验证）。
 */
class RelaxGrid {
  /**
   * 盘面空间网格：把 O(n^2) 的两两检测降到 O(n*k)。
   *
   * ═══ 演进记录（踩过的坑，别再走回头路）═══
   *
   * v1：用 Map<字符串键, 数组>。
   *     字符串键 = `cx * 200003 + cz` 再 toString —— 每次 get 都要分配字符串、
   *     算哈希、比较。ringR=3 时每点每轮查 49 个桶，3,027 点 x 200 轮
   *     = **3,433 万次 Map.get**。Node 里 V8 优化得动（1.4s），
   *     但浏览器里实测要 21s —— 差 15 倍，就是字符串哈希的开销。
   *
   * v2（现在）：**整数键 + 扁平数组 + 计数排序**。
   *     · 先用一遍扫描求出桶索引范围；
   *     · 用 Int32Array 做 CSR 式存储（head/next），零分配、零字符串；
   *     · 查询时只做整数加法与数组下标。
   *     这样总复杂度真的是 O(n*k)，与 O(n^2) 版本结果逐位相同。
   */
  constructor(cellSize, ringR = 1) {
    this.cell = Math.max(1e-6, cellSize)
    this.ringR = Math.max(1, Math.floor(ringR))
    this.head = null
    this.next = null
    this.minCx = 0
    this.minCz = 0
    this.nCx = 0
    this.nCz = 0
    this._nodes = null
  }

  /** 重建桶（每轮松弛后位置都变了，必须重建） */
  build(nodes) {
    const n = nodes.length
    this._nodes = nodes
    const cell = this.cell

    /* 1) 求桶索引范围 */
    let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity
    for (let i = 0; i < n; i++) {
      const p = nodes[i].pos
      const cx = Math.floor(p.x / cell)
      const cz = Math.floor(p.z / cell)
      if (cx < minX) minX = cx
      if (cx > maxX) maxX = cx
      if (cz < minZ) minZ = cz
      if (cz > maxZ) maxZ = cz
    }
    if (!Number.isFinite(minX)) {
      this.head = new Int32Array(0); this.next = new Int32Array(0)
      return this
    }
    /* 留 1 格边距，邻域查询时不用做边界判断 */
    this.minCx = minX - 1
    this.minCz = minZ - 1
    this.nCx = maxX - minX + 3
    this.nCz = maxZ - minZ + 3
    const nCells = this.nCx * this.nCz

    /* 2) CSR：head[cell] -> 第一个点下标；next[i] -> 同桶下一个点 */
    if (!this.head || this.head.length < nCells) this.head = new Int32Array(nCells)
    else this.head.fill(-1, 0, nCells)
    if (this.head.length >= nCells) this.head.fill(-1, 0, nCells)
    if (!this.next || this.next.length < n) this.next = new Int32Array(n)
    this.next.fill(-1, 0, n)

    for (let i = 0; i < n; i++) {
      const p = nodes[i].pos
      const cx = Math.floor(p.x / cell) - this.minCx
      const cz = Math.floor(p.z / cell) - this.minCz
      const c = cz * this.nCx + cx
      this.next[i] = this.head[c]
      this.head[c] = i
    }
    return this
  }

  /** 遍历与下标 i 可能重叠的 j（只处理 j > i，与原 O(n^2) 循环一致） */
  forEachNeighbor(i, fn) {
    const nodes = this._nodes
    const p = nodes[i].pos
    const cell = this.cell
    const baseCx = Math.floor(p.x / cell) - this.minCx
    const baseCz = Math.floor(p.z / cell) - this.minCz
    const R = this.ringR
    const nCx = this.nCx
    const head = this.head
    const next = this.next

    for (let oz = -R; oz <= R; oz++) {
      const cz = baseCz + oz
      if (cz < 0 || cz >= this.nCz) continue
      const row = cz * nCx
      for (let ox = -R; ox <= R; ox++) {
        const cx = baseCx + ox
        if (cx < 0 || cx >= nCx) continue
        let j = head[row + cx]
        while (j !== -1) {
          if (j > i) fn(j)
          j = next[j]
        }
      }
    }
  }
}

function runRelax(nodes, iters) {
  const allow = LAYOUT.relaxAllowOverlap


  /* 网格边长 = 最大可能的椭圆半轴 × 安全系数。
   * ax = (w_a+w_b)/2 · spacing，az = (h_a+h_b)/2 · spacing · radialSquash。
   * 取全场最大宽高，保证桶边长 >= 任何一对的搜索半径 -> 不会漏对。 */
  /* ═══ 桶边长怎么定（这一处踩了三次坑，记清楚）═══
   *
   * 目标：让 ringR = 1（只查 3x3 邻域），因为每多一圈，查询桶数按
   * (2R+1)^2 增长 —— R=3 就是 49 个桶/点/轮，实测每点 332 个候选，
   * 内层 2.33 亿次迭代，只比 O(n^2) 快 5.3 倍。
   *
   * 但桶边长必须 >= 最大搜索半径，否则会漏对（结果就不对了）。
   * 最大搜索半径由**最大的**公式半轴决定（实测 maxHalf = 31.3）。
   *
   * 所以：bucket = maxHalf * allow，ringR = 1。
   *   实测 3,503 节点、盘半径 344、bucket≈45 → 约 15x15 桶，
   *   每桶约 16 点，3x3 邻域约 144 候选（含自身），
   *   内层 1.0 亿次 → 比 O(n^2) 快 12 倍。
   *
   * 想再快就只能改成「按尺寸分层」（大公式用粗网格、小公式用细网格），
   * 那是另一个量级的改动，先不做。
   */
  let maxHalf = 0
  for (const n of nodes) {
    const rh = Math.max(
      n.width * LAYOUT.spacing * 0.5,
      n.height * LAYOUT.spacing * LAYOUT.radialSquash * 0.5,
    )
    if (rh > maxHalf) maxHalf = rh
  }
  /* 桶边长 = 最大搜索半径，这样只需查 3x3 邻域就能覆盖所有可能重叠的对 */
  const bucket = Math.max(1, maxHalf * Math.max(1, allow))
  const ringR = 1
  const grid = new RelaxGrid(bucket, ringR)

  for (let it = 0; it < iters; it++) {
    /* 每轮重建：上一轮的推力已经把节点挪动了 */
    grid.build(nodes)
    // 前期用力推，后期轻推，避免来回震荡
    const strength = 0.5 * (1 - it / iters) + 0.12

    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i]
      const ra = Math.hypot(a.pos.x, a.pos.z)
      if (ra < 1e-6) continue
      // 节点自身的"切向 / 径向"单位向量（盘面内）
      const utax = -a.pos.z / ra, utaz = a.pos.x / ra      // 切向
      const urax = a.pos.x / ra, uraz = a.pos.z / ra       // 径向

      grid.forEachNeighbor(i, (j) => {
        const b = nodes[j]

        /* ── 为什么必须用"切向/径向"各向异性的椭圆，而不是圆 ──
         *
         * 公式是 billboard（永远正面朝相机），在屏幕上是**水平长条**
         * （实测宽高比中位 11.5:1）。把它当成"直径 = 宽"的圆来排斥，
         * 等于认为它在盘面上也占一个宽度那么大的方块，浪费约 11 倍面积。
         *
         * 但也不能简单地按 (宽, 高) 的轴对齐椭圆来处理，因为盘面是斜看的：
         *   · 屏幕水平方向 = 盘面的**切向** → 公式的"宽"摊在这里
         *   · 屏幕竖直方向 = 盘面的**径向**，且被俯仰角压缩了 sinφ 倍
         *     （半径差 Δr 在屏幕上只显示成 Δr·sinφ）
         * 所以径向上两个公式要真正分开，需要的半径差是 高/sinφ，
         * 而不是 高 —— 这正是之前"盘面里明明不重叠、屏幕上却糊成一片"
         * 的原因，盘心尤其严重（那里半径差最小、压缩最狠）。
         *
         * 于是在 (切向, 径向) 坐标系里做椭圆判定：
         *     (Δt / ax)² + (Δr / az)² ≥ 1   即视为分开
         *   ax = (宽a + 宽b)/2 × spacing       切向：屏幕水平，不压缩
         *   az = (高a + 高b)/2 / sinφ × spacing 径向：屏幕竖直，要补偿压缩
         */
        const dx = b.pos.x - a.pos.x
        const dz = b.pos.z - a.pos.z

        const dt = dx * utax + dz * utaz      // 切向分量
        const dr = dx * urax + dz * uraz      // 径向分量

        const ax = (a.width + b.width) * 0.5 * LAYOUT.spacing
        const az = (a.height + b.height) * 0.5 * LAYOUT.spacing * LAYOUT.radialSquash

        const u = dt / ax
        const v = dr / az
        const d = Math.sqrt(u * u + v * v)

        if (d >= allow) return

        /* 推力要沿"归一化椭圆的梯度反方向"回到世界空间。
         * 归一化空间里需要补足的距离是 (allow − d)，
         * 但直接按世界方向推会推错方向（椭圆是各向异性的）：
         * 正确的换算是把归一化位移 u、v 各自乘回半轴 ax、az，
         * 得到切向/径向的真实位移，再合成回 x/z。 */
        let need
        if (d < 1e-9) {
          // 完全重合：沿一个确定性方向错开（不用随机数，保证可复现）
          const fx = (i % 7) - 3
          const fz = (j % 5) - 2
          const fl = Math.hypot(fx, fz) || 1
          need = allow * strength * 0.5
          const ddx = (fx / fl) * need, ddz = (fz / fl) * need
          a.pos.x -= ddx; a.pos.z -= ddz
          b.pos.x += ddx; b.pos.z += ddz
          return
        }

        need = ((allow - d) / d) * strength * 0.5
        const ddx = utax * (u * need * ax) + urax * (v * need * az)
        const ddz = utaz * (u * need * ax) + uraz * (v * need * az)
        a.pos.x -= ddx; a.pos.z -= ddz
        b.pos.x += ddx; b.pos.z += ddz
      })
    }

    // ── 把节点夹回自己的半径带 ──
    // 半径带是权威（乘性、越内越紧），高度 y 原样不动，薄盘不会被松弛搅厚。
    // 注意：盘心附近半径带的**绝对**宽度很小（乘性带 r±f·r），
    // 所以核心公式基本上被钉在原位 —— 这既保住了"越中心越重要"，
    // 也意味着核心的拥挤只能靠"少放几个进盘心"（面积分位分配半径）来解决，
    // 而不是靠松弛硬挤开。
    for (const n of nodes) {
      const { x, z } = n.pos
      const r = Math.sqrt(x * x + z * z)
      if (r < 1e-6) continue
      // 带退化成一个点（radiusMin === radiusMax）时就是硬投影回同心圆环
      const rc = clamp(r, n.radiusMin, n.radiusMax)
      if (rc !== r) {
        const k = rc / r
        n.pos.x = x * k
        n.pos.z = z * k
      }
    }
  }

  return iters
}

/* ───────────── 工具 ───────────── */
function clamp01(v) {
  return Math.min(1, Math.max(0, typeof v === 'number' && isFinite(v) ? v : 0))
}
function clamp(v, lo, hi) {
  return Math.min(hi, Math.max(lo, isFinite(v) ? v : lo))
}
