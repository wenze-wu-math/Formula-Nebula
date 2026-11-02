/**
 * designs/shared/kb.js — 知识库的统一入口，供所有设计稿复用。
 *
 * 只做转发，不复制逻辑：buildGraph() 就是 src/graph.js 里那一个，
 * 所以设计稿拿到的图结构与正式应用**逐字段一致**，改数据不用改两处。
 *
 * ⚠ src/graph.js 顶部有一行 `import * as THREE from 'three'`（文件内并未使用）。
 *   因此本模块会**间接**加载 three；设计稿本身不需要、也不应直接用它。
 *   bare specifier 由 Vite dev server 解析 —— 请用 `npm run dev` 打开
 *   http://localhost:5175/designs/ ，不要用 file:// 直接双击（浏览器会拦截 ES module）。
 */

/* ── 图谱装配（原样转发） ── */
export { buildGraph, applyColor, layoutGraph } from '../../src/graph.js'

/* ── 数据表：设计稿做图例 / 分组 / 着色时要用 ── */
export { FAMILIES, NODES, LINKS } from '../../src/data/knowledge.js'
export {
  CONJECTURE_STATUS, CONJECTURE_FIELDS, CONJECTURE_NODES, CONJECTURE_LINKS,
} from '../../src/data/conjectures.js'
export {
  RESEARCHER_AREAS, RESEARCHER_NODES, RESEARCHER_LINKS, FRONTIER_LINKS,
} from '../../src/data/researchers.js'
export { progressOf, DATA_AS_OF, PROGRESS_EVIDENCE } from '../../src/data/progress.js'

/* ── 关系类型 / 查询（纯函数，不碰 DOM 与渲染） ── */
export {
  LINK_TYPES, RELATED, typeColor, typeLabel, allTypeDefs, resolveLinkType,
} from '../../src/linkTypes.js'
export {
  parseQuery, findPath, neighbourhood, neighbourhoodEdges, queryStats, QUERY_KEYS,
} from '../../src/graphQuery.js'

/* ── 颜色工具 ── */
export { hexToLinear, linearToHex, buildEqualizedPalette } from '../../src/palette.js'

import { buildGraph } from '../../src/graph.js'
import { linearToHex } from '../../src/palette.js'

/** buildGraph() 很重（~1600 条边 + 归一化），设计稿之间共享一份即可。 */
let cached = null
export function getGraph() {
  if (!cached) cached = buildGraph()
  return cached
}

/** 节点的 CSS 颜色（baseColor 是 linear RGB，设计稿多半要 sRGB hex） */
export function nodeHex(n) {
  return n.baseColor ? linearToHex(n.baseColor) : '#ffffff'
}
