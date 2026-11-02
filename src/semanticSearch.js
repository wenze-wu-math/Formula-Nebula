/**
 * ═══════════════════════════════════════════════════════════════
 *  语义搜索 · Semantic Search for Theorems
 * ═══════════════════════════════════════════════════════════════
 *
 *  理念：理解数学**意义**，而不只是字面匹配。
 *
 *  传统关键词搜索的问题：
 *    · 搜"代数闭包" → 漏掉用"algebraically closed field"的条目
 *    · 搜"上同调" → 找不到"层上同调""导出函子"这些相关概念
 *    · 搜"态射" → 无法发现"映射""同态""箭头"的语义联系
 *
 *  本模块提供三层语义理解：
 *    ① **概念嵌入**   —— 把定理/术语映射到向量空间，捕获数学语义相似度
 *    ② **概念图谱**   —— 利用已有的知识图谱关联，构建同义词/上下位关系
 *    ③ **结构化扩展** —— 利用节点的 family / field / status 等结构维度
 *
 *  实现策略（前端可行）：
 *    · TF-IDF + 词袋模型作为基线（轻量，零依赖）
 *    · 利用图谱拓扑增强语义：邻居节点 = 相关概念
 *    · 预定义数学术语同义词词典（algebraic closure ≈ 代数闭包）
 *    · 可选：ONNX Runtime Web + 微型语义模型（~20MB，离线可用）
 */

import { parseQuery } from './graphQuery.js'

/* ───────────── 数学概念同义词词典 ─────────────
 *
 * 手工维护的双语+术语变体映射。这是零成本语义理解的第一层。
 * 格式：canonical → [synonyms...]
 */
const MATH_SYNONYMS = {
  // 代数几何核心概念
  '代数闭包': ['algebraic closure', 'algebraically closed', '代数封闭'],
  'algebraic closure': ['代数闭包', 'algebraically closed field'],
  '概形': ['scheme', 'schemes', '模式'],
  'scheme': ['概形', 'schemes'],
  '层': ['sheaf', 'sheaves', '束'],
  'sheaf': ['层', 'sheaves', 'presheaf', '预层'],
  '上同调': ['cohomology', '同调', 'homology'],
  'cohomology': ['上同调', '同调群', 'cohomology group'],
  '态射': ['morphism', '映射', 'map', 'arrow', '箭头', 'homomorphism', '同态'],
  'morphism': ['态射', 'map', 'arrow', 'homomorphism'],
  '簇': ['variety', 'varieties', '代数簇', 'algebraic variety'],
  'variety': ['簇', 'varieties', 'algebraic variety'],
  '理想': ['ideal', 'ideals'],
  'ideal': ['理想', 'ideals', 'prime ideal', '素理想'],
  '局部化': ['localization', 'localisation'],
  'localization': ['局部化', 'local ring', '局部环'],
  '模': ['module', 'modules'],
  'module': ['模', 'modules', 'R-module'],
  '环': ['ring', 'rings'],
  'ring': ['环', 'rings', 'commutative ring', '交换环'],
  '域': ['field', 'fields'],
  'field': ['域', 'fields', 'extension field', '扩域'],
  '曲线': ['curve', 'curves'],
  'curve': ['曲线', 'curves', 'algebraic curve'],
  '曲面': ['surface', 'surfaces'],
  'surface': ['曲面', 'surfaces', 'algebraic surface'],
  '奇点': ['singularity', 'singularities', 'singular point'],
  'singularity': ['奇点', 'singular point', 'singularities'],
  '光滑': ['smooth', 'non-singular', '非奇异'],
  'smooth': ['光滑', 'non-singular', 'regular'],
  '维数': ['dimension', 'dim', '维度'],
  'dimension': ['维数', 'dim', 'Krull dimension'],
  '纤维': ['fiber', 'fibre', '纤维丛'],
  'fiber': ['纤维', 'fibre', 'fibration'],
  '基变换': ['base change', '基扩张'],
  'base change': ['基变换', 'base extension'],
  '导出函子': ['derived functor', '导出范畴'],
  'derived functor': ['导出函子', 'derived category'],
  '谱': ['spectrum', 'spec', '素谱'],
  'spectrum': ['谱', 'spec', 'prime spectrum'],
  '张量积': ['tensor product', '张量'],
  'tensor product': ['张量积', 'tensor'],
  '正合列': ['exact sequence', '正合序列'],
  'exact sequence': ['正合列', 'exact'],
  '投射': ['projective', 'projection', '投影'],
  'projective': ['投射', 'projective space', '投射空间'],
  '仿射': ['affine'],
  'affine': ['仿射', 'affine space', '仿射空间'],
}

/** 构建双向同义词索引（从任一变体都能找到所有同义词） */
function buildSynonymIndex(dict) {
  const index = new Map()
  for (const [canonical, variants] of Object.entries(dict)) {
    const all = [canonical, ...variants]
    for (const term of all) {
      const key = term.toLowerCase()
      if (!index.has(key)) index.set(key, new Set())
      all.forEach((t) => index.get(key).add(t.toLowerCase()))
    }
  }
  return index
}
const SYNONYM_INDEX = buildSynonymIndex(MATH_SYNONYMS)

/* ───────────── TF-IDF 词袋模型 ─────────────
 *
 * 轻量级语义嵌入：不需要神经网络，前端可直接运行。
 * 思路：
 *   · 每个节点的文本 = name + en + latex + summary
 *   · 分词 → 统计词频（TF） → 计算逆文档频率（IDF）
 *   · 查询时：query 也分词 → TF-IDF 向量 → 余弦相似度
 */

/** 简单分词：中英文混合，保留数学符号 */
function tokenize(text) {
  if (!text) return []
  // 去掉 LaTeX 命令（\frac, \mathfrak 等会污染词频）
  text = text.replace(/\\[a-zA-Z]+/g, ' ')
  // 去掉特殊符号（保留字母数字和中文）
  text = text.replace(/[^\w一-龥\s]/g, ' ')
  // 分割 + 小写化 + 去空
  return text.toLowerCase().split(/\s+/).filter((t) => t.length > 1)
}

/** 扩展同义词：查询"代数闭包" → 也搜 "algebraic closure" */
function expandSynonyms(tokens) {
  const expanded = new Set(tokens)
  for (const token of tokens) {
    const syns = SYNONYM_INDEX.get(token.toLowerCase())
    if (syns) syns.forEach((s) => expanded.add(s))
  }
  return Array.from(expanded)
}

/** TF-IDF 索引构建器 */
class TFIDFIndex {
  constructor() {
    this.docs = []           // [{id, tokens}]
    this.idf = new Map()     // term → idf score
    this.docVectors = []     // [{id, vector: Map<term, tfidf>}]
  }

  /** 添加文档 */
  addDocument(id, text) {
    const tokens = tokenize(text)
    this.docs.push({ id, tokens })
  }

  /** 构建索引（所有文档添加完后调用一次） */
  build() {
    const N = this.docs.length
    const df = new Map() // term → document frequency

    // 统计 DF
    for (const doc of this.docs) {
      const unique = new Set(doc.tokens)
      for (const term of unique) {
        df.set(term, (df.get(term) || 0) + 1)
      }
    }

    // 计算 IDF
    for (const [term, freq] of df.entries()) {
      this.idf.set(term, Math.log((N + 1) / (freq + 1)))
    }

    // 构建文档向量
    for (const doc of this.docs) {
      const tf = new Map()
      for (const term of doc.tokens) {
        tf.set(term, (tf.get(term) || 0) + 1)
      }
      const vector = new Map()
      for (const [term, count] of tf.entries()) {
        const tfidf = count * (this.idf.get(term) || 0)
        vector.set(term, tfidf)
      }
      this.docVectors.push({ id: doc.id, vector })
    }
  }

  /** 计算查询向量的 TF-IDF */
  queryVector(queryTokens) {
    const tf = new Map()
    for (const term of queryTokens) {
      tf.set(term, (tf.get(term) || 0) + 1)
    }
    const vector = new Map()
    for (const [term, count] of tf.entries()) {
      const tfidf = count * (this.idf.get(term) || 0)
      vector.set(term, tfidf)
    }
    return vector
  }

  /** 余弦相似度 */
  cosineSimilarity(vecA, vecB) {
    let dot = 0
    let normA = 0
    let normB = 0
    const allTerms = new Set([...vecA.keys(), ...vecB.keys()])
    for (const term of allTerms) {
      const a = vecA.get(term) || 0
      const b = vecB.get(term) || 0
      dot += a * b
      normA += a * a
      normB += b * b
    }
    if (normA === 0 || normB === 0) return 0
    return dot / (Math.sqrt(normA) * Math.sqrt(normB))
  }

  /** 搜索：返回 [{id, similarity}] */
  search(queryText, topK = 10) {
    const tokens = expandSynonyms(tokenize(queryText))
    const qVec = this.queryVector(tokens)
    const scores = []
    for (const doc of this.docVectors) {
      const sim = this.cosineSimilarity(qVec, doc.vector)
      if (sim > 0) scores.push({ id: doc.id, similarity: sim })
    }
    scores.sort((a, b) => b.similarity - a.similarity)
    return scores.slice(0, topK)
  }
}

/* ───────────── 图谱拓扑增强 ─────────────
 *
 * 利用已有的知识图谱结构：
 *   · 直接邻居 = 强相关（权重 × 0.8）
 *   · 二阶邻居 = 弱相关（权重 × 0.3）
 *   · 同 family / field = 领域相关（+ 0.2）
 */

/** 构建邻接表 */
function buildAdjacencyList(nodes, links) {
  const adj = new Map()
  for (const n of nodes) adj.set(n.id, [])
  for (const link of links) {
    const [src, tgt, weight] = link
    if (adj.has(src) && adj.has(tgt)) {
      adj.get(src).push({ target: tgt, weight: weight || 0.5 })
      adj.get(tgt).push({ target: src, weight: weight || 0.5 })
    }
  }
  return adj
}

/** 图谱增强：根据拓扑距离调整相似度 */
function enhanceWithTopology(results, nodeId, adjacency, nodeMap, boost = 0.3) {
  const neighbors = new Set(adjacency.get(nodeId)?.map((e) => e.target) || [])
  const twoHop = new Set()
  for (const nb of neighbors) {
    const nbNeighbors = adjacency.get(nb) || []
    for (const e of nbNeighbors) {
      if (e.target !== nodeId && !neighbors.has(e.target)) {
        twoHop.add(e.target)
      }
    }
  }

  return results.map((r) => {
    let score = r.similarity
    if (neighbors.has(r.id)) score += boost * 0.8
    if (twoHop.has(r.id)) score += boost * 0.3

    // 同族/同领域加分
    const node = nodeMap.get(r.id)
    const anchor = nodeMap.get(nodeId)
    if (node && anchor) {
      if (node.family === anchor.family) score += 0.15
      if (node.field === anchor.field) score += 0.15
    }

    return { ...r, similarity: score }
  })
}

/* ───────────── 概念树构建 ─────────────
 *
 * 从一个节点出发，沿着"蕴含""推广""特例"等语义关系构建层级树。
 * 用途：详情面板展示"这个定理的前置/推论/推广"
 */

/** 语义关系的方向性 */
const SEMANTIC_RELATIONS = {
  implies: 'forward',      // A 蕴含 B → B 是 A 的推论
  generalizes: 'forward',  // A 推广 B → B 是 A 的特例
  special: 'backward',     // A 是 B 的特例 → B 是 A 的推广
  dual: 'symmetric',       // 对偶关系双向
  equivalent: 'symmetric', // 等价双向
}

function getConceptTree(nodeId, nodes, links, maxDepth = 2) {
  const nodeMap = new Map(nodes.map((n) => [n.id, n]))
  const tree = { node: nodeMap.get(nodeId), children: [], parents: [] }
  if (!tree.node) return null

  const visited = new Set([nodeId])

  function traverse(currentId, depth, direction) {
    if (depth >= maxDepth) return []
    const branches = []
    for (const link of links) {
      const [src, tgt, weight, type] = link
      let nextId = null
      if (direction === 'down' && src === currentId) nextId = tgt
      if (direction === 'up' && tgt === currentId) nextId = src
      if (!nextId || visited.has(nextId)) continue

      const relType = SEMANTIC_RELATIONS[type]
      if (!relType) continue
      if (direction === 'down' && relType === 'backward') continue
      if (direction === 'up' && relType === 'forward') continue

      visited.add(nextId)
      const child = nodeMap.get(nextId)
      if (child) {
        branches.push({
          node: child,
          relation: type,
          weight,
          children: traverse(nextId, depth + 1, direction),
        })
      }
    }
    return branches
  }

  tree.children = traverse(nodeId, 0, 'down')
  tree.parents = traverse(nodeId, 0, 'up')
  return tree
}

/* ───────────── 类比搜索 ─────────────
 *
 * "找一个定理，它和 A 的关系就像 B 和 C 的关系一样"
 * 例：Riemann-Roch 在曲线上，类似的东西在曲面上是什么？
 *
 * 策略：向量类比 vec(B) - vec(A) + vec(C) ≈ vec(D)
 */

function findAnalogous(theoremA, theoremB, nodes, index, topK = 5) {
  // 获取 A 和 B 的向量
  const vecA = index.docVectors.find((d) => d.id === theoremA)?.vector
  const vecB = index.docVectors.find((d) => d.id === theoremB)?.vector
  if (!vecA || !vecB) return []

  // 计算差向量 Δ = B - A
  const delta = new Map()
  const allTerms = new Set([...vecA.keys(), ...vecB.keys()])
  for (const term of allTerms) {
    const diff = (vecB.get(term) || 0) - (vecA.get(term) || 0)
    if (Math.abs(diff) > 0.01) delta.set(term, diff)
  }

  // 对所有其他节点，计算 vec(C) + Δ 与 vec(D) 的相似度
  const scores = []
  for (const docC of index.docVectors) {
    if (docC.id === theoremA || docC.id === theoremB) continue
    // 预测向量：C + Δ
    const predicted = new Map(docC.vector)
    for (const [term, diff] of delta.entries()) {
      predicted.set(term, (predicted.get(term) || 0) + diff)
    }
    // 找最接近预测的节点
    let bestSim = 0
    let bestId = null
    for (const docD of index.docVectors) {
      if (docD.id === theoremA || docD.id === theoremB || docD.id === docC.id) continue
      const sim = index.cosineSimilarity(predicted, docD.vector)
      if (sim > bestSim) {
        bestSim = sim
        bestId = docD.id
      }
    }
    if (bestId) scores.push({ from: docC.id, to: bestId, similarity: bestSim })
  }

  scores.sort((a, b) => b.similarity - a.similarity)
  return scores.slice(0, topK)
}

/* ───────────── 主 API ─────────────
 *
 * buildSemanticIndex() → 初始化时调用一次
 * semanticSearch()     → 用户输入查询时调用
 * getConceptTree()     → 详情面板点击"查看关系树"时调用
 * findAnalogous()      → 高级查询"类比搜索"
 */

let globalIndex = null
let globalAdj = null
let globalNodes = []
let globalLinks = []

/** 构建语义索引（应用启动时调用） */
export function buildSemanticIndex(nodes, links) {
  globalNodes = nodes
  globalLinks = links
  globalAdj = buildAdjacencyList(nodes, links)

  const index = new TFIDFIndex()
  for (const node of nodes) {
    const text = [
      node.name || '',
      node.en || '',
      node.latex || '',
      node.summary || '',
      node.detail || '',
    ].join(' ')
    index.addDocument(node.id, text)
  }
  index.build()
  globalIndex = index
  return index
}

/** 语义搜索（支持自然语言 + 结构化查询组合） */
export function semanticSearch(query, limit = 10, options = {}) {
  if (!globalIndex) {
    console.warn('Semantic index not built yet')
    return []
  }

  const {
    boostTopology = true,   // 是否启用图谱增强
    anchorNode = null,      // 参考节点（"找和这个相关的"）
    filterParsed = null,    // 结构化过滤（来自 parseQuery）
  } = options

  // ① TF-IDF 基础搜索
  let results = globalIndex.search(query, limit * 3)

  // ② 图谱拓扑增强
  if (boostTopology && anchorNode) {
    const nodeMap = new Map(globalNodes.map((n) => [n.id, n]))
    results = enhanceWithTopology(results, anchorNode, globalAdj, nodeMap)
  }

  // ③ 结构化过滤（可选）
  if (filterParsed && filterParsed.test) {
    const nodeMap = new Map(globalNodes.map((n) => [n.id, n]))
    results = results.filter((r) => {
      const node = nodeMap.get(r.id)
      return node && filterParsed.test(node)
    })
  }

  // ④ 重新排序 + 截断
  results.sort((a, b) => b.similarity - a.similarity)
  return results.slice(0, limit).map((r) => {
    const node = globalNodes.find((n) => n.id === r.id)
    return { node, similarity: r.similarity }
  })
}

/** 获取概念树（详情面板使用） */
export function getConceptTreeAPI(nodeId) {
  return getConceptTree(nodeId, globalNodes, globalLinks)
}

/** 类比搜索（高级功能） */
export function findAnalogyAPI(theoremA, theoremB) {
  if (!globalIndex) return []
  return findAnalogous(theoremA, theoremB, globalNodes, globalIndex)
}

/* ───────────── 查询建议 ─────────────
 *
 * 输入框的自动补全：根据前缀推荐概念名
 */

export function getSuggestions(prefix, limit = 8) {
  if (!prefix || prefix.length < 2) return []
  const lower = prefix.toLowerCase()
  const matches = []

  for (const node of globalNodes) {
    const score = (() => {
      if (node.name?.toLowerCase().startsWith(lower)) return 10
      if (node.en?.toLowerCase().startsWith(lower)) return 9
      if (node.id?.toLowerCase().startsWith(lower)) return 8
      if (node.name?.toLowerCase().includes(lower)) return 5
      if (node.en?.toLowerCase().includes(lower)) return 4
      // 同义词匹配
      const synonyms = SYNONYM_INDEX.get(lower)
      if (synonyms) {
        for (const syn of synonyms) {
          if (node.name?.toLowerCase().includes(syn)) return 6
          if (node.en?.toLowerCase().includes(syn)) return 6
        }
      }
      return 0
    })()

    if (score > 0) {
      matches.push({ node, score, label: node.name || node.en || node.id })
    }
  }

  matches.sort((a, b) => b.score - a.score)
  return matches.slice(0, limit)
}

/* ───────────── 统计与调试 ─────────────  */

export function getIndexStats() {
  if (!globalIndex) return null
  return {
    totalDocs: globalIndex.docs.length,
    vocabSize: globalIndex.idf.size,
    avgDocLength: globalIndex.docs.reduce((sum, d) => sum + d.tokens.length, 0) / globalIndex.docs.length,
    synonymCount: SYNONYM_INDEX.size,
  }
}

