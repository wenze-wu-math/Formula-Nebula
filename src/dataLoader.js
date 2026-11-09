/**
 * 知识数据加载器 — 浏览器路径。
 *
 * 数据从 15 个 ES 模块搬到了 public/data/*.json（见 scripts/build-data-json.mjs），
 * 于是它们不再被并进主包：访客不必为了看到第一帧先下载整个数据库。
 *
 * ⚠ 这个文件**不包含** Node 路径。Node 下静态 import 源 .js 的实现放在
 *   src/dataLoaderNode.js —— 故意分开，因为如果浏览器入口能到达那些静态
 *   import，Vite 会把约 6 MB 数据重新打进主包，G5 就白做了。
 */

import { setGraphData } from './graph.js'

const GROUP_FILES = [
  'core.json',
  'extra.json',
  'stacks.json',
  'nlab.json',
  'mathlib.json',
  'unsolved.json',
  'wikipedia.json',
  'researchers.json',
  'crosslinks.json',
]

/** 数据基准路径。放在 public/data/ 下，构建后位于站点根目录的 data/。 */
function dataBase() {
  if (typeof document !== 'undefined' && document.baseURI) {
    return new URL('data/', document.baseURI).href
  }
  return '/data/'
}

/**
 * 并行 fetch 所有数据分片，合并后注入 graph.js。
 *
 * @param {(done: number, total: number, id: string) => void} [onProgress]
 * @returns {Promise<{nodes: Array, links: Array}>}
 */
export async function loadGraphData(onProgress) {
  const total = GROUP_FILES.length
  let done = 0
  const base = dataBase()

  const parts = await Promise.all(
    GROUP_FILES.map(async (file) => {
      const url = new URL(file, base).href
      let res
      try {
        res = await fetch(url)
      } catch (e) {
        throw new Error(`加载 ${file} 失败：${e.message}（${url}）`)
      }
      if (!res.ok) {
        throw new Error(`加载 ${file} 失败：HTTP ${res.status}（${url}）`)
      }
      const json = await res.json()
      done++
      if (onProgress) {
        try {
          onProgress(done, total, file.replace(/\.json$/, ''))
        } catch {
          /* 进度回调不该影响加载 */
        }
      }
      return json
    })
  )

  const nodes = []
  const links = []
  for (const p of parts) {
    if (Array.isArray(p.nodes)) nodes.push(...p.nodes)
    if (Array.isArray(p.links)) links.push(...p.links)
  }

  const data = { nodes, links }
  setGraphData(data)
  return data
}
