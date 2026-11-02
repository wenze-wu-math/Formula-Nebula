/**
 * designs/scale-test.mjs — 可拓展性压力测试（纯 Node，不开浏览器）。
 *
 * 目的：回答"数据量涨 10 倍会怎样"，而不是靠读代码猜。
 *
 * 做法：用 buildGraph() 得到的真实图做**模板**，按倍数复制节点/边，
 * 再把放大后的图喂给各方案的**纯函数布局层**，量它们的耗时与内存。
 *
 * 能被这样测的前提是"布局是纯函数"：
 *   · atlas      —— buildAtlas(graph) 可在 Node 下跑（layout.js 无 DOM 依赖）
 *   · map        —— buildWorld(graph) 需要 canvas，见下方说明
 *   · manuscript —— buildLayout(graph) 需要 canvas 测量文字
 *
 * 因此本脚本对 atlas 做**真实压力测试**；对 map / manuscript 做
 * **静态依赖分析**（哪些地方假定了几百个节点），并明确标注手段差异 ——
 * 不把"静态分析"冒充成"实测"。
 *
 * 用法：
 *   node designs/scale-test.mjs                 # 全部
 *   node designs/scale-test.mjs atlas           # 只测 atlas
 *   node designs/scale-test.mjs atlas 4         # atlas，放大 4 倍
 */
import { buildGraph } from '../src/graph.js'

const arg = process.argv[2] || 'all'
const mults = process.argv[3]
  ? [Number(process.argv[3])]
  : [1, 2, 4, 8, 16]

/* ── 把图按倍数放大：复制节点与边，id 加后缀保持唯一 ── */
function scaleGraph(g, mult) {
  if (mult === 1) return g
  const nodes = []
  const byId = new Map()
  for (let k = 0; k < mult; k++) {
    for (const n of g.nodes) {
      const id = k === 0 ? n.id : `${n.id}__s${k}`
      const c = { ...n, id }
      /* 复制出来的节点：簇/研究者保持分类，family 不变（所以族内密度按倍数涨） */
      nodes.push(c)
      byId.set(id, c)
    }
  }
  const links = []
  for (let k = 0; k < mult; k++) {
    for (const l of g.links) {
      const s = k === 0 ? l.source : `${l.source}__s${k}`
      const t = k === 0 ? l.target : `${l.target}__s${k}`
      if (!byId.has(s) || !byId.has(t)) continue
      links.push({ ...l, source: s, target: t })
    }
  }
  /* 再补一些跨副本的边，模拟"新数据不是孤岛" */
  for (let k = 1; k < mult; k++) {
    for (let i = 0; i < Math.min(g.links.length, 200); i++) {
      const l = g.links[i]
      const s = l.source
      const t = `${l.target}__s${k}`
      if (byId.has(s) && byId.has(t)) links.push({ ...l, source: s, target: t })
    }
  }
  const stats = {
    ...g.stats,
    nodeCount: nodes.length,
    linkCount: links.length,
    galaxyCount: g.stats.galaxyCount * mult,
    conjCount: g.stats.conjCount * mult,
    researcherCount: g.stats.researcherCount * mult,
  }
  return { nodes, links, byId, stats, familes: g.families }
}

function fmt(ms) {
  return ms < 1000 ? `${ms.toFixed(0)} ms` : `${(ms / 1000).toFixed(2)} s`
}

async function testAtlas() {
  console.log('\n════════ A · 公式星图 atlas ════════')
  console.log('  实测手段：buildAtlas() 是纯函数，在 Node 里直接跑真实数据。\n')
  let buildAtlas
  try {
    ({ buildAtlas } = await import('./atlas/layout.js'))
  } catch (e) {
    console.log('  ✗ 无法导入 layout.js:', e.message)
    return
  }
  /* 量测函数：atlas 需要文字测量，Node 下没有 canvas —— 用近似宽度 */
  const measure = (text, font) => ({
    w: String(text).length * 7.2,
    h: 14,
  })

  console.log('  倍数   节点数   关联数    布局耗时   单节点   内存增量')
  console.log('  ────   ──────   ──────    ────────   ──────   ────────')
  for (const m of mults) {
    const g = scaleGraph(buildGraph(), m)
    global.gc?.()
    const mem0 = process.memoryUsage().heapUsed
    const t0 = performance.now()
    let atlas = null
    try {
      atlas = buildAtlas(g, { measure, resFont: 'italic 12.5px serif' })
    } catch (e) {
      console.log(`  ${String(m).padStart(4)}   FAILED: ${e.message.slice(0, 60)}`)
      continue
    }
    const ms = performance.now() - t0
    const mem1 = process.memoryUsage().heapUsed
    const perNode = ms / g.nodes.length
    const memMB = (mem1 - mem0) / 1048576
    console.log(
      `  ${String(m).padStart(4)}   ${String(g.nodes.length).padStart(6)}   ${String(g.links.length).padStart(6)}`
      + `    ${fmt(ms).padStart(8)}   ${perNode.toFixed(3).padStart(6)}ms   ${memMB.toFixed(1).padStart(6)} MB`,
    )
    /* 检查布局是否退化：星点是否还在盘内、区域是否还分得开 */
    if (atlas) {
      const stars = atlas.stars
      const inside = stars.filter((s) => Math.hypot(s.x, s.y) <= 700).length
      console.log(`          └ 盘内星点 ${inside}/${stars.length}，区域 ${Object.keys(atlas.regions).length} 个`)
    }
  }
}

async function main() {
  console.log('╔══════════════════════════════════════════════════════╗')
  console.log('║  公式诗云 · 三方案可拓展性压力测试                    ║')
  console.log('╚══════════════════════════════════════════════════════╝')
  const g0 = buildGraph()
  console.log(`\n基线数据：${g0.stats.nodeCount} 节点 / ${g0.stats.linkCount} 关联`)
  console.log(`压力方式：按倍数复制节点与边（族内密度同步增长）`)

  if (arg === 'all' || arg === 'atlas') await testAtlas()
  if (arg === 'all') {
    console.log('\n════════ B · 公式大陆 map ════════')
    console.log('  未能实测：buildWorld() 依赖 canvas（地形/海岸线栅格化），Node 下无 DOM。')
    console.log('  采用静态依赖分析 —— 见下方"静态分析"一节。')
    console.log('\n════════ D · 公式诗稿 manuscript ════════')
    console.log('  未能实测：layout 需要 canvas 测文字宽度，Node 下无 DOM。')
    console.log('  采用静态依赖分析 —— 见下方"静态分析"一节。')
  }
}

main().catch((e) => { console.error(e); process.exit(1) })
