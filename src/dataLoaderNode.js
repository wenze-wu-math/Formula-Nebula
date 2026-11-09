/**
 * 数据加载器 — Node 专用路径。
 *
 * ⚠ 这个文件**只应被 Node 环境引用**（测试、check/verify 脚本、构建期工具）。
 * 它静态 import 全部 src/data/*.js，如果被浏览器入口引入，Vite 会把这些
 * 约 6 MB 的数据重新打进主包 —— 那正是 G5 要消除的事情。
 *
 * 因此它**刻意**与 src/dataLoader.js 分开：
 *   · dataLoader.js  —— 浏览器走 fetch(public/data/*.json)
 *   · 本文件         —— Node 走静态 import，源码即数据
 *
 * 两条路径产出相同形状的 { nodes, links }，并都打上同样的结构标记
 * （cluster / researcher），所以 buildGraph() 不关心数据从哪来。
 *
 * 保持一致的保证：scripts/build-data-json.mjs 从同一批源 .js 生成 JSON，
 * 而 scripts/verify-data-json.mjs 断言两者内容等价 —— 任何漂移都会在 CI 失败。
 */

import { setGraphData } from './graph.js'

export async function loadDataForNode() {
  const [{ NODES, LINKS }, conj, res] = await Promise.all([
    import('./data/knowledge.js'),
    import('./data/conjectures.js'),
    import('./data/researchers.js'),
  ])

  const extraNames = 'ABCDEFGH'.split('')
  const extras = await Promise.all(extraNames.map((c) => import(`./data/extra-${c.toLowerCase()}.js`)))
  const [stacks, nlab, mathlib, unsolved, wiki, resExtra, resExtraLinks, cross] = await Promise.all([
    import('./data/stacks-extra.js'),
    import('./data/nlab-extra.js'),
    import('./data/mathlib-extra.js'),
    import('./data/unsolved-extra.js'),
    import('./data/wikipedia-extra.js'),
    import('./data/researchers-extra.js'),
    import('./data/researchers-extra-links.js'),
    import('./data/cross-source-links.js'),
  ])

  const nodes = []
  const links = []

  // 定理层
  nodes.push(...NODES)
  links.push(...LINKS)
  for (let i = 0; i < extras.length; i++) {
    const c = extraNames[i]
    nodes.push(...(extras[i][`EXTRA_${c}_NODES`] || []))
    links.push(...(extras[i][`EXTRA_${c}_LINKS`] || []))
  }
  nodes.push(...(stacks.STACKS_NODES || []))
  links.push(...(stacks.STACKS_LINKS || []))
  nodes.push(...(nlab.NLAB_NODES || []))
  links.push(...(nlab.NLAB_LINKS || []))
  nodes.push(...(mathlib.MATHLIB_NODES || []))
  links.push(...(mathlib.MATHLIB_LINKS || []))

  // 猜想层（打 cluster 标记，与 build-data-json.mjs 的规则一致）
  const markCluster = (arr) => (arr || []).map((n) => ({ ...n, cluster: true }))
  nodes.push(...markCluster(conj.CONJECTURE_NODES))
  links.push(...(conj.CONJECTURE_LINKS || []))
  nodes.push(...markCluster(unsolved.UNSOLVED_NODES))
  links.push(...(unsolved.UNSOLVED_LINKS || []))
  nodes.push(...markCluster(wiki.WIKI_NODES))
  links.push(...(wiki.WIKI_LINKS || []))

  // 研究者层
  const markResearcher = (arr) => (arr || []).map((n) => ({ ...n, researcher: true }))
  nodes.push(...markResearcher(res.RESEARCHER_NODES))
  links.push(...(res.RESEARCHER_LINKS || []))
  nodes.push(...markResearcher(resExtra.RESEARCHER_EXTRA_NODES))
  links.push(...(resExtraLinks.RESEARCHER_EXTRA_LINKS || []))

  // 跨源关联
  links.push(...(cross.CROSS_SOURCE_LINKS || []))

  const data = { nodes, links }
  setGraphData(data)
  return data
}
