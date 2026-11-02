/**
 * designs/map/src/search.js — 检索打分（编排模块，SPEC §10.5）。纯函数，Node 可测，顶层不碰 DOM。
 *
 * 两条分支：
 *   · 高级语法（含 `:`、`(`、` OR `、` AND `，或有以 `-` 开头的词）→ 交给 kb 的 parseQuery，
 *     命中按 importance 降序，score = importance；语法错误返回 []。
 *   · 普通文本 → 对 name / en / id / latex 逐字段打分（小写、去空白后比较）：
 *     完全相等 100、前缀 60、词首 40、子串 25；summary 子串 8；多字段取最大，再 + importance·5。
 *
 * 取舍：
 *   · "去空白比较"让「Hodge猜想」「hodge 猜想」「Hodge  猜想」都等价；但词首要看原文的分隔符，
 *     所以预处理时把原文里"空格 / 连字符 / 破折号 / 斜杠 / 括号"之后的位置映射到去空白串的下标。
 *   · 预处理结果按 graph 对象缓存（WeakMap）：488 个节点每次按键只做 indexOf，< 0.2 ms。
 *     图在开发期可能热更新，但热更新会产生新的 graph 对象，WeakMap 自然失效。
 */
import { parseQuery } from '../../shared/kb.js'

/** 词首分隔符：其后一个字符算"词首" */
const SEP = /[\s\-–—_/()（）·,，.:;]/

/** 小写 + 去掉全部空白 */
export function normalize(s) {
  return String(s == null ? '' : s).toLowerCase().replace(/\s+/g, '')
}

/** 预处理一个字段：去空白小写串 + 词首下标集合（以去空白串为坐标） */
function prepField(raw) {
  const src = String(raw == null ? '' : raw).toLowerCase()
  let out = ''
  const starts = new Set([0])
  let prevSep = true
  for (const ch of src) {
    if (/\s/.test(ch)) { prevSep = true; continue }
    if (prevSep) starts.add(out.length)
    out += ch
    prevSep = SEP.test(ch)
  }
  return { s: out, starts }
}

const cache = new WeakMap()
function indexOf(graph) {
  let idx = cache.get(graph)
  if (idx) return idx
  idx = graph.nodes.map((n) => ({
    id: n.id,
    imp: typeof n.importance === 'number' && isFinite(n.importance) ? n.importance : 0,
    fields: [prepField(n.name), prepField(n.en), prepField(n.id), prepField(n.latex)],
    summary: normalize(n.summary),
  }))
  cache.set(graph, idx)
  return idx
}

/** 单字段得分 */
function fieldScore(f, q) {
  if (!f.s) return 0
  if (f.s === q) return 100
  if (f.s.startsWith(q)) return 60
  let i = f.s.indexOf(q, 1)
  if (i < 0) return 0
  while (i >= 0) {
    if (f.starts.has(i)) return 40
    i = f.s.indexOf(q, i + 1)
  }
  return 25
}

/** 是否走高级语法分支 */
export function isAdvancedQuery(q) {
  return /[:(]/.test(q) || / OR | AND /.test(q) || /(^|\s)-\S/.test(q)
}

/**
 * @param {object} graph getGraph() 结果
 * @param {string} q 原始查询
 * @param {{limit?: number}} [opt]
 * @returns {Array<{id: string, score: number}>} 按 score 降序（同分按 importance、再按 id 保证确定性）
 */
export function searchNodes(graph, q, { limit = Infinity } = {}) {
  const raw = typeof q === 'string' ? q.trim() : ''
  if (!raw || !graph || !Array.isArray(graph.nodes)) return []
  const lim = Math.max(0, limit === Infinity ? Infinity : Math.floor(Number(limit) || 0))
  if (lim === 0) return []

  let out
  if (isAdvancedQuery(raw)) {
    const pq = parseQuery(raw)
    if (pq.error) return []
    out = []
    for (const n of graph.nodes) {
      let ok = false
      try { ok = pq.test(n) } catch { ok = false }
      if (ok) out.push({ id: n.id, score: typeof n.importance === 'number' ? n.importance : 0 })
    }
    out.sort((a, b) => b.score - a.score || (a.id < b.id ? -1 : 1))
  } else {
    const nq = normalize(raw)
    if (!nq) return []
    out = []
    for (const e of indexOf(graph)) {
      let best = 0
      for (const f of e.fields) {
        const v = fieldScore(f, nq)
        if (v > best) { best = v; if (v === 100) break }
      }
      if (best < 8 && e.summary.includes(nq)) best = 8
      if (best > 0) out.push({ id: e.id, score: best + e.imp * 5, imp: e.imp })
    }
    out.sort((a, b) => b.score - a.score || b.imp - a.imp || (a.id < b.id ? -1 : 1))
    out = out.map(({ id, score }) => ({ id, score }))
  }
  return lim < out.length ? out.slice(0, lim) : out
}
