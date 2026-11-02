/**
 * designs/atlas/search.js — 搜索排序（M5 外框，SPEC §10.6）。
 *
 * 纯函数，不碰 DOM，Node 下可测：
 *   rankSearch(graph, query) → { ids, error?, structured }
 *
 * 两种模式：
 *   · 结构化：含 `:` `(` ` OR ` 或以 `-` 开头 → 交给 kb.js 的 parseQuery（词法 + 递归下降，绝不抛），
 *             命中按 importance 降序、id。语法错误原样带回 error，由搜索框显示朱红小字。
 *   · 自由文本：按 SPEC 的分数表给每个节点打分（取各规则最高分），多个词时每个词都必须命中，分数相加。
 *
 * 与 SPEC 字面的两处有意偏差（都只影响"完全相等"这种最明确的意图，见交付说明）：
 *   ① 多词查询整体与某节点 name/en 完全相等时，再加一个 100 分的"整句"项。
 *      否则「Riemann–Roch 定理」与「Riemann–Roch 定理（曲面）」两词各自得分相同，
 *      会被重要度更高的近名节点挤到后面。
 *   ② 结构化模式下，若整个查询与某节点的 name/en/id 完全相等（如英文名里带括号的
 *      「Adjunction Formula (Surfaces)」被括号判成了结构化），该节点钉在第一位；
 *      若此时 parseQuery 报错（英文名带冒号），退回自由文本、不报错。
 *
 * 归一化：NFKC（全角冒号 / 括号 → 半角，这样 `family：curve` 也能当结构化查询）、
 * 小写、各种连字符 / 破折号（‐ ‑ ‒ – — −）统一成 `-`（用户很少会打 en dash）。
 */
import { parseQuery, FAMILIES } from '../shared/kb.js'
import { FAMILY_LATIN } from './constants.js'

/** 自由文本的分数表（SPEC §10.6） */
const S_EXACT = 100, S_ID = 95, S_PREFIX = 80, S_SUB = 60, S_ID_SUB = 50, S_FAMILY = 40, S_LATEX = 35

const DASHES = /[‐‑‒–—−]/g
const nfkc = (s) => { try { return String(s ?? '').normalize('NFKC') } catch { return String(s ?? '') } }
/** 比较用的归一化：NFKC + 小写 + 破折号折叠 */
export const norm = (s) => nfkc(s).toLowerCase().replace(DASHES, '-')

/** 是否按结构化查询处理（chrome.js 也用它给页脚标注"结构化查询"） */
export function isStructured(query) {
  const q = nfkc(query).trim()
  return !!q && (q.includes(':') || q.includes('(') || q.includes(' OR ') || q.startsWith('-'))
}

/* 每个 graph 只建一次小写索引（488 个节点，建一次 < 1ms；按对象身份缓存，HMR 换 graph 时自然失效） */
const indexCache = new WeakMap()
function indexOf(graph) {
  let ix = indexCache.get(graph)
  if (ix) return ix
  const entries = graph.nodes.map((n) => ({
    n,
    id: norm(n.id), name: norm(n.name), en: norm(n.en), latex: norm(n.latex),
    family: n.family,
    theorem: !n.cluster && !n.researcher,
    imp: Number.isFinite(n.importance) ? n.importance : 0,
  }))
  // 族名词表：中文族名 + 拉丁化星座名（两者都可完全相等或前缀命中）
  const families = Object.keys(FAMILIES).map((f) => ({
    family: f, keys: [norm(FAMILIES[f].name), norm(FAMILY_LATIN[f] || f)],
  }))
  ix = { entries, families, byId: new Map(entries.map((e) => [e.n.id, e])) }
  indexCache.set(graph, ix)
  return ix
}

/** 该词命中的族（完全相等或前缀）；一般为空集 */
function familiesOf(ix, t) {
  const out = new Set()
  for (const f of ix.families) if (f.keys.some((k) => k.startsWith(t))) out.add(f.family)
  return out
}

/** 单个词对单个节点的分数（各规则取最高分；0 = 未命中） */
function termScore(e, t, fams) {
  let s = 0
  if (e.name === t || e.en === t) s = S_EXACT
  else if (e.id === t) s = S_ID
  else if (e.name.startsWith(t) || e.en.startsWith(t)) s = S_PREFIX
  else if (e.name.includes(t) || e.en.includes(t)) s = S_SUB
  else if (e.id.includes(t)) s = S_ID_SUB
  else if (e.latex.includes(t)) s = S_LATEX
  if (s < S_FAMILY && e.theorem && fams.has(e.family)) s = S_FAMILY
  return s
}

const byImpId = (a, b) => b.imp - a.imp || (a.n.id < b.n.id ? -1 : a.n.id > b.n.id ? 1 : 0)

/**
 * @param {{nodes: object[]}} graph
 * @param {string} query
 * @returns {{ ids: string[], error?: string, structured: boolean }}
 */
export function rankSearch(graph, query) {
  const raw = nfkc(query).trim()
  if (!raw || !graph || !Array.isArray(graph.nodes)) return { ids: [], structured: false }
  const ix = indexOf(graph)
  const whole = norm(raw)

  if (isStructured(raw)) {
    const pq = parseQuery(raw)
    // 偏差 ②：整句与某节点 name/en/id 完全相等 → 钉到第一位（即使 parseQuery 没命中它）
    const pin = ix.entries.find((e) => e.name === whole || e.en === whole || e.id === whole)
    if (pq.error) {
      // 英文名里带冒号的节点（如 "Condensed Mathematics: Motivation and Objects"）会被判成结构化并报错；
      // 整句恰好是某个真实名字时，用户的意图显然是找它 → 退回自由文本，不报错。
      if (pin) return { ids: rankFree(ix, whole), structured: false }
      return { ids: [], error: pq.error, structured: true }
    }
    const hits = ix.entries.filter((e) => { try { return pq.test(e.n) } catch { return false } })
    hits.sort(byImpId)
    const ids = hits.map((e) => e.n.id)
    if (pin) { const i = ids.indexOf(pin.n.id); if (i >= 0) ids.splice(i, 1); ids.unshift(pin.n.id) }
    return { ids, structured: true }
  }
  return { ids: rankFree(ix, whole), structured: false }
}

/** 自由文本打分排序（whole 已归一化、非空） */
function rankFree(ix, whole) {
  const terms = whole.split(/\s+/).filter(Boolean)
  const fams = terms.map((t) => familiesOf(ix, t))
  const scored = []
  for (const e of ix.entries) {
    let sum = 0, ok = true
    for (let i = 0; i < terms.length; i++) {
      const s = termScore(e, terms[i], fams[i])
      if (!s) { ok = false; break }
      sum += s
    }
    if (!ok) continue
    // 偏差 ①：多词整句完全相等
    if (terms.length > 1 && (e.name === whole || e.en === whole)) sum += S_EXACT
    scored.push({ e, s: sum })
  }
  scored.sort((a, b) => b.s - a.s || byImpId(a.e, b.e))
  return scored.map((x) => x.e.n.id)
}
