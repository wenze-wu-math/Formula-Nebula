/**
 * designs/map/src/world/index.js — 世界构建入口（SPEC §6）。
 *
 * 2026-11-01：原先这里是一份"国家 = 正圆"的占位实现，而真正的地形流水线写在 build.js 里却没被
 * 任何生产代码 import —— main.js 一直拿到的是圆。这就是交接文档记的"国家是规整的圆"的根因。
 * 现在 index.js 只做转发：正式世界一律来自 build.js（距离场 + 域扭曲 + marching squares）。
 * 占位实现移到 stub.js，仅供 dev/world/dev.js 做"改前"对照，不参与生产。
 *
 * 导出签名不变（SPEC §6）：buildWorld(graph, {raster}) → World。
 */
export { buildWorld } from './build.js'
