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
        throw new Error(`加载 ${file} 失败：${e.message}（${url}）`, { cause: e })
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

/* ── 证明数据：单独按需加载 ──
 *
 * 245 条长篇证明（JSON 约 1.8 MB）与知识图谱的加载时机**不同**：
 * 图谱是首屏必须的，证明只在用户点开某个定理的证明页时才需要。
 * 之前它们由 main.js 静态 import，导致首屏无条件下载并解析 3.3 MB 源码 ——
 * 那是主包 gzip 1265 KB 里的主要剩余部分。
 *
 * 现在只在第一次真正要看证明时加载一次，之后缓存复用。
 */
let proofsPromise = null
let proofsCache = null

/**
 * 确保证明数据已加载。
 * @returns {Promise<Record<string, object>>} id -> 证明对象
 */
export function loadProofs() {
  if (proofsCache) return Promise.resolve(proofsCache)
  if (!proofsPromise) {
    proofsPromise = (async () => {
      const url = new URL('proofs.json', dataBase()).href
      const res = await fetch(url)
      if (!res.ok) throw new Error(`加载 proofs.json 失败：HTTP ${res.status}`)
      const json = await res.json()
      proofsCache = json.proofs || {}
      return proofsCache
    })().catch((e) => {
      // 失败后允许重试，否则一次网络抖动会让证明页永久不可用
      proofsPromise = null
      throw e
    })
  }
  return proofsPromise
}

/** 同步取已加载的证明；未加载时返回 null（调用方应先 await loadProofs()）。 */
export function getLoadedProof(nodeId) {
  if (!proofsCache) return null
  return proofsCache[nodeId] ?? null
}

/** 已加载的证明条数（未加载时为 0）。 */
export function getLoadedProofCount() {
  return proofsCache ? Object.keys(proofsCache).length : 0
}
