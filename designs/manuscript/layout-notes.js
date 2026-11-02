/**
 * designs/manuscript/layout-notes.js — 页边批注（猜想 → note，SPEC §4.8）。纯函数。
 *
 * 取舍：
 *   · 批注块的高度与所在章无关（页边宽一样、公式 em 固定 16），所以可以先归章、做容量检查，再排正文；
 *     正文需要知道哪些诗句被批注（给上标字母预留宽度），但不需要知道字母本身 —— 字母在最终 y 排定后才定。
 *   · 页边公式 em 固定为 14（SIZE.noteEmMax），低于各章普通诗句 em 的中位数（最密的章 ≈ 17），
 *     保持"题记 > 核心 > 普通 > 页边"的字号关系；最宽的猜想公式按页边宽 360 收缩后 em ≈ 12.7 仍可读。
 *   · 状态符号用 hand 40（SPEC 建议 30）：全卷 z≈0.12 时 40 → 4.8px，正好越过 GREEK_PX 开始显出真字形，
 *     页边一列 ? ✓ ½ 远看可辨；30 则只剩墨条。
 *   · 副行（提出者 · 年份）用 hand 15 而不是 italic：提出者多为汉字，italic 会被合成假斜体（SPEC §1.2）。
 */
import { PALETTE, CHAPTER_ORDER, CHAPTERS, statusGlyph, TEX_EM } from './constants.js'
import { G, SIZE, mkRun, fitText, wrapLines, union, byImportance, otherEnd, anchorsOf, runRect } from './layout-util.js'

export const NOTE_GAP = 28
const NOTE_EM = SIZE.noteEmMax
const GLYPHS = ['?', '½', '✓', '✗', '~']

/** 批注块的相对几何（原点 = 页边区左缘、块顶）。 */
export function noteGeom(m, dims, n) {
  const MW = G.MARGIN_W
  const letterW = m('hand', SIZE.noteLetter, 400, 'normal', 'mm')     // 预留两个字母宽（字母数 > 26 时是 aa、ab…）
  const gx = letterW + 6
  const gwMax = Math.max(...GLYPHS.map((g) => m('hand', SIZE.noteGlyph, 400, 'normal', g)))
  const nx = gx + gwMax + 10
  const nameW = MW - nx
  let lines = wrapLines(m, 'hand', SIZE.noteName, 400, 'normal', n.name, () => nameW)
  if (lines.length > 2) lines = [lines[0], fitText(m, 'hand', SIZE.noteName, 400, 'normal', lines.slice(1).join(''), nameW)]
  const glyphBase = 0.86 * SIZE.noteGlyph                                 // 符号顶 = 块顶
  const nameBase = [30, 30 + SIZE.noteName * 1.3].slice(0, lines.length)
  const nameBottom = nameBase[nameBase.length - 1] + 0.24 * SIZE.noteName
  const d = dims.get(n.id) || { w: 400, h: 64 }
  const scale = Math.min(NOTE_EM / TEX_EM, MW / d.w)
  const fy = Math.max(glyphBase + 0.24 * SIZE.noteGlyph, nameBottom) + 10
  const fh = d.h * scale
  const subText = [n.proposer, n.year].filter((v) => v !== undefined && v !== null && String(v).trim()).join(' · ')
  const sub = subText ? fitText(m, 'hand', SIZE.noteSub, 400, 'normal', subText, MW - nx) : ''
  const subBase = fy + fh + 6 + 0.86 * SIZE.noteSub
  const H = sub ? subBase + 0.24 * SIZE.noteSub : fy + fh
  return { n, gx, nx, lines, glyphBase, nameBase, scale, fy, fw: d.w * scale, fh, sub, subBase, H }
}

/**
 * 归章 + 容量检查。
 * @param chapterOf Map<verseId, chKey>
 * @param capOf     (chKey) => 页边可用高度
 * @param geomOf    (id) => noteGeom
 * @returns {Map<chKey, node[]>}
 */
export function assignNotes(graph, chapterOf, capOf, geomOf) {
  const conj = graph.nodes.filter((n) => n.cluster).sort(byImportance)
  const prefs = new Map(), at = new Map()
  for (const n of conj) {
    const score = new Map()
    for (const l of n.linkIds) {
      const ck = chapterOf.get(otherEnd(l, n.id))
      if (ck) score.set(ck, (score.get(ck) || 0) + l.weight)
    }
    const order = [...CHAPTER_ORDER].sort((a, b) => (score.get(b) || 0) - (score.get(a) || 0) || CHAPTER_ORDER.indexOf(a) - CHAPTER_ORDER.indexOf(b))
    prefs.set(n.id, order)
    at.set(n.id, 0)
  }
  const chapterOfNote = (id) => prefs.get(id)[at.get(id)]
  const used = (ck) => {
    const list = conj.filter((n) => chapterOfNote(n.id) === ck)
    return { list, h: list.reduce((s, n) => s + geomOf(n.id).H, 0) + NOTE_GAP * Math.max(0, list.length - 1) }
  }
  // 溢出：按 importance 低者优先移到下一偏好章；最多迭代 conj.length × 8 次（确定性、必收敛）
  for (let guard = 0; guard < conj.length * 8; guard++) {
    let moved = false
    for (const ck of CHAPTER_ORDER) {
      const { list, h } = used(ck)
      if (h <= capOf(ck)) continue
      const victim = list.filter((n) => at.get(n.id) < 7).sort(byImportance).pop()
      if (victim) { at.set(victim.id, at.get(victim.id) + 1); moved = true; break }
    }
    if (!moved) break
  }
  const out = new Map(CHAPTER_ORDER.map((k) => [k, []]))
  for (const n of conj) out.get(chapterOfNote(n.id)).push(n)
  return out
}

/** 锚诗句：本章内与该猜想关联 weight 最大的诗句（并列取 importance 高、id 小者） */
export function anchorVerse(graph, n, verseIds) {
  let best = null, bw = -1
  for (const l of n.linkIds) {
    const o = otherEnd(l, n.id)
    if (!verseIds.has(o)) continue
    const on = graph.byId.get(o)
    if (l.weight > bw || (l.weight === bw && byImportance(on, graph.byId.get(best)) < 0)) { best = o; bw = l.weight }
  }
  return best
}

const letterOf = (i) => (i < 26 ? String.fromCharCode(97 + i) : String.fromCharCode(97 + Math.floor(i / 26) - 1) + String.fromCharCode(97 + (i % 26)))

/**
 * 一维避让排批注，生成 note Item。
 * @param ideal Map<noteId, 理想 y（锚诗句公式顶）>
 * @returns note items（按字母序）
 */
export function placeNotes(m, page, ch, notes, geomOf, ideal, anchorOf) {
  const reg = page.margin
  const y0 = reg.y, y1 = reg.y + reg.h
  const list = notes.map((n) => ({ n, g: geomOf(n.id), want: Math.max(y0, ideal.get(n.id) ?? y0) }))
  list.sort((a, b) => a.want - b.want || byImportance(a.n, b.n))
  let prev = -Infinity
  for (const e of list) { e.y = Math.max(e.want, prev + NOTE_GAP); prev = e.y + e.g.H }
  // 溢出页底 → 自下而上整体上推
  for (let i = list.length - 1; i >= 0; i--) {
    const limit = (i === list.length - 1 ? y1 : list[i + 1].y - NOTE_GAP) - list[i].g.H
    if (list[i].y > limit) list[i].y = limit
  }
  const items = []
  list.forEach((e, i) => {
    const { n, g, y } = e
    const mx = reg.x
    const letter = letterOf(i)
    const st = statusGlyph(n.status)
    const glyph = mkRun(m, mx + g.gx, y + g.glyphBase, st.glyph, 'hand', SIZE.noteGlyph, { color: st.color, role: 'note-glyph', itemId: n.id })
    const name = mkRun(m, mx + g.nx, y + g.nameBase[0], g.lines[0], 'hand', SIZE.noteName, { color: PALETTE.noteInk, role: 'note-name', itemId: n.id })
    const sub = []
    if (g.lines[1]) sub.push(mkRun(m, mx + g.nx, y + g.nameBase[1], g.lines[1], 'hand', SIZE.noteName, { color: PALETTE.noteInk, role: 'note-name', itemId: n.id }))
    if (g.sub) sub.push(mkRun(m, mx + g.nx, y + g.subBase, g.sub, 'hand', SIZE.noteSub, { color: PALETTE.noteInk2, role: 'sub', itemId: n.id }))
    const formula = { x: mx, y: y + g.fy, w: g.fw, h: g.fh, scale: g.scale }
    const ref = [mkRun(m, mx, y + 30, letter, 'hand', SIZE.noteLetter, { color: PALETTE.rubric, role: 'ref', itemId: n.id })]
    let box = union(formula, runRect(glyph))
    box = union(box, runRect(name))
    for (const s of sub) box = union(box, runRect(s))
    items.push({
      id: n.id, kind: 'note', page: page.index, chapter: ch.key, tier: 'note', stanza: null, ordinal: i + 1,
      locator: `${ch.roman}·页边 ${letter}`, box, formula, name, sub, leader: null, lineNo: null, glyph, ref, seal: null,
      anchors: anchorsOf(box), _letter: letter, _anchor: anchorOf.get(n.id) || null,
    })
  })
  return items
}

export { CHAPTERS }
