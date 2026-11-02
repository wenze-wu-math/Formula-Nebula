/**
 * designs/manuscript/layout-stanza.js — 题记选取与诗节划分（SPEC §4.3.4、§4.4）。纯函数。
 *
 * 诗节的目的：让同节诗句在关联图上相近，栏内铅笔弧（只连同栏诗句）就短而密，像诗的韵脚标记。
 * 算法是确定性贪心 BFS：节首 = 未分配者中 importance 最高；按"连到本节的最大关联 weight"降序吸收邻居。
 */
import { byImportance, otherEnd } from './layout-util.js'
import { TEX_EM } from './constants.js'
import { SIZE } from './layout-util.js'

/**
 * 选题记：本章 importance 最高、按题记字号排得下正文宽的那条（太宽就取下一条）。
 * 全都太宽（不会发生）时取最窄的一条，再由调用方按宽收缩。
 */
export function pickEpigraph(verses, dims, maxW) {
  const scale = SIZE.epiEm / TEX_EM
  const sorted = [...verses].sort(byImportance)
  for (const n of sorted) {
    const d = dims.get(n.id)
    if (d && d.w * scale <= maxW) return n
  }
  return sorted.reduce((a, b) => ((dims.get(a.id)?.w ?? 1e9) <= (dims.get(b.id)?.w ?? 1e9) ? a : b))
}

/**
 * 诗节划分。verses = 本章诗句（不含题记）。
 * @returns {Array<{head:node, ids:string[]}>} 按节首 importance 降序；节内 = 节首 → BFS 发现顺序
 */
export function makeStanzas(verses, graph) {
  const N = verses.length
  if (!N) return []
  const K = Math.max(3, Math.min(9, Math.round(N / 8)))
  const cap = Math.ceil(N / K)
  const inCh = new Set(verses.map((n) => n.id))
  const sorted = [...verses].sort(byImportance)
  const assigned = new Map()       // id -> stanza index
  const stanzas = []

  // 章内邻接（按 weight 降序、id 升序，保证确定性）
  const adj = new Map()
  for (const n of verses) {
    const list = []
    for (const l of n.linkIds) {
      const o = otherEnd(l, n.id)
      if (o !== n.id && inCh.has(o)) list.push({ id: o, w: l.weight })
    }
    list.sort((a, b) => b.w - a.w || (a.id < b.id ? -1 : 1))
    adj.set(n.id, list)
  }

  for (const head of sorted) {
    if (assigned.has(head.id)) continue
    const si = stanzas.length
    const ids = [head.id]
    assigned.set(head.id, si)
    // 候选池：未分配邻居 → 它与本节的最强关联
    const best = new Map()
    const offer = (id) => {
      for (const { id: o, w } of adj.get(id)) {
        if (assigned.has(o)) continue
        if (!best.has(o) || best.get(o) < w) best.set(o, w)
      }
    }
    offer(head.id)
    while (ids.length < cap) {
      // 一跳邻居用尽 → 两跳（经任意节点，含本章外，weight 取两段乘积的一半）→ 仍无则按 importance 补满。
      // 保证除最后一节外每节都满 cap，节数 ≈ K（否则稀疏章会剩下一串孤句被并掉，节数掉到 K 以下）。
      if (!best.size) offerTwoHop(ids, assigned, inCh, graph, best)
      if (!best.size) {
        const next = sorted.find((n) => !assigned.has(n.id))
        if (!next) break
        best.set(next.id, 0)
      }
      let pick = null, pw = -1
      for (const [id, w] of best) if (w > pw || (w === pw && id < pick)) { pick = id; pw = w }
      best.delete(pick)
      ids.push(pick)
      assigned.set(pick, si)
      offer(pick)
    }
    stanzas.push({ head, ids })
  }

  // 孤句（只有 1–2 句的节）并入与之关联最强的节；无关联并入最后一个"正常"节
  const isSmall = (s) => s.ids.length <= 2
  const big = stanzas.filter((s) => !isSmall(s))
  if (big.length && big.length < stanzas.length) {
    const small = stanzas.filter(isSmall)
    for (const s of small) {
      for (const id of s.ids) {
        const score = new Map()
        for (const { id: o, w } of adj.get(id)) {
          const t = big.find((b) => b.ids.includes(o))
          if (t) score.set(t, (score.get(t) || 0) + w)
        }
        let target = big[big.length - 1], bw = 0
        for (const b of big) { const w = score.get(b) || 0; if (w > bw) { bw = w; target = b } }
        target.ids.push(id)
      }
    }
    return big
  }
  return stanzas
}

/** 两跳候选：本节诗句 → 任意中间节点 → 本章未分配诗句 */
function offerTwoHop(ids, assigned, inCh, graph, best) {
  for (const id of ids) {
    for (const l1 of graph.byId.get(id).linkIds) {
      const mid = otherEnd(l1, id)
      for (const l2 of graph.byId.get(mid).linkIds) {
        const o = otherEnd(l2, mid)
        if (o === id || !inCh.has(o) || assigned.has(o)) continue
        const w = 0.5 * l1.weight * l2.weight
        if (!best.has(o) || best.get(o) < w) best.set(o, w)
      }
    }
  }
}
