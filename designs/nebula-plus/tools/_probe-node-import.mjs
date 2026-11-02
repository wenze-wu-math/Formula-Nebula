/* 试探：纯 Node 能否直接跑 buildGraph() + layoutGraph()（不启浏览器）。
 * 目的：第 1 项「旋臂↔知识族」的对齐度要在没有浏览器时也能给出数字。 */
import { buildGraph, layoutGraph } from '../src/graph.js'

const t0 = Date.now()
const g = buildGraph()
console.log('buildGraph ok', g.stats.nodeCount, g.stats.linkCount, Date.now() - t0, 'ms')

// 用空 baked：layoutGraph 会走 n.width/height 的兜底分支（不依赖真实贴图）
const baked = new Map()
const info = layoutGraph(g, baked)
console.log('layoutGraph ok', JSON.stringify(info), Date.now() - t0, 'ms')

const galaxy = g.nodes.filter((n) => !n.cluster && !n.researcher)
console.log('galaxy nodes', galaxy.length)
console.log('sample', JSON.stringify(galaxy.slice(0, 3).map((n) => ({
  id: n.id, family: n.family, armIdx: n.armIdx, radius: +n.radius.toFixed(2),
  theta: +n.theta.toFixed(3), w: +n.width.toFixed(2), h: +n.height.toFixed(2),
}))))
