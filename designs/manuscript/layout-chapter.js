/**
 * designs/manuscript/layout-chapter.js — 章页版式（SPEC §4.3、§4.5、§4.6）。纯函数。
 *
 * 分三步，便于二分填充系数 k：
 *   chapterHead()  页眉、章头、导言 Para、题记 —— 与 k 无关，返回正文起点 bodyTop；
 *   fitBody()      对给定 k 计算每句的"行几何"（相对坐标）并按栏流排，二分求最大可容纳的 k；
 *   emitBody()     把行几何平移到世界坐标，生成 Item / 诗节号 / 星号三角 / 栏内弧。
 * 行几何用"所有可读矩形的外包框"决定行高，而不是只看公式高 —— 名称、上标引用字母、英文副名
 * 都被算进去，保证相邻两行在世界坐标里零相交（行距再另加 18·k 的空）。
 */
import { PALETTE, TEX_EM } from './constants.js'
import { G, V, SIZE, F, mkRun, fitText, wrapLines, union, cnNum, anchorsOf, runRect } from './layout-util.js'

const HEAD_H = 30 * 1.1 + 14 // 诗节号行（含其下空）
const SEP_H = 50             // 诗节之间：空一行 + ⁂（⁂ 高 30，上下各 10）
const NAME_GAP = 24          // 公式与名称之间的最小空（含 leader 两端各 12）
const LEADER_MIN = 40
const REF_SIZE = 16
const TALL_EM = 2.0          // 公式高 ≤ 2 em（MathJax 单行公式高 ≈ 1.1 em，两层分式 ≈ 2.2–2.8 em）
const SHRINK_MIN = 0.75     // 为让名称留在行内，公式最多收缩到 0.75 倍

/* ───────── 页眉 / 章头 / 导言 / 题记 ───────── */

/**
 * @returns {{ bodyTop:number, epiItem:object }} 并把静态文字写进 L.texts / L.rules / L.ornaments / L.paras
 */
export function chapterHead(m, L, page, ch, plan, dims, noteCount, refCount = 0) {
  const px = page.x, py = page.y
  const tx = page.text.x, tw = page.text.w, cx = tx + tw / 2
  // 1. 页眉 + 细线（汉字不用 italic：会被合成假斜体）
  L.texts.push(mkRun(m, tx, py + V.RUNHEAD, '公式诗稿', 'serif', SIZE.runhead, { color: PALETTE.ink3, role: 'runhead' }))
  L.texts.push(mkRun(m, tx + tw, py + V.RUNHEAD, `卷 ${ch.roman} · ${ch.name}`, 'serif', SIZE.runhead, { color: PALETTE.ink3, role: 'runhead', align: 'right' }))
  L.rules.push({ x0: tx, y0: py + V.RUNHEAD_RULE, x1: page.x + G.PAGE_W - G.PAD_R, y1: py + V.RUNHEAD_RULE, width: 1, color: PALETTE.rule, style: 'hair' })
  // 2. 章头
  L.texts.push(mkRun(m, cx, py + V.CHAPNUM, ch.roman, 'serif', SIZE.chapnum, { color: PALETTE.rubric, role: 'chapnum', align: 'center' }))
  L.texts.push(mkRun(m, cx, py + V.TITLE, ch.name, 'serif', SIZE.title, { weight: 600, role: 'title', align: 'center' }))
  L.texts.push(mkRun(m, cx, py + V.LATIN, ch.latin, 'italic', SIZE.latin, { color: PALETTE.ink3, role: 'latin', align: 'center' }))
  L.rules.push({ x0: tx, y0: py + V.DRULE, x1: tx + tw, y1: py + V.DRULE, width: 4, color: PALETTE.ink2, style: 'double' })
  // 3. 导言：首字取章名首字（每章不同），正文由数据生成
  const epi = plan.epi
  const summary = String(epi.summaryPlain || '').replace(/[。．.\s]+$/, '')
  const text = `${ch.name}。题记取「${epi.name}」：${summary}。本章收诗${cnNum(plan.verseCount)}首，分${cnNum(plan.stanzas.length)}节，` +
    `页边记未解之问${cnNum(noteCount)}则。`
  const paraBottom = emitPara(m, L, tx, py + V.PARA, tw, text, PALETTE.ink2, SIZE.para)
  // 4. 题记：居中大字公式 + 右齐署名行（——名称）+ 英文副名
  const d = dims.get(epi.id) || { w: 400, h: 64 }
  const scale = Math.min(SIZE.epiEm / TEX_EM, tw / d.w)
  const fw = d.w * scale, fh = d.h * scale
  const fy = paraBottom + 58
  const formula = { x: cx - fw / 2, y: fy, w: fw, h: fh, scale }
  const attrY = fy + fh + 0.86 * SIZE.epiAttr + 18
  const refW = refCount ? 5 + refCount * (m('hand', REF_SIZE, 400, 'normal', 'm') + m('hand', REF_SIZE, 400, 'normal', ',') + 4) : 0
  const name = mkRun(m, tx + tw - refW, attrY, '——' + fitText(m, 'serif', SIZE.epiAttr, 400, 'normal', epi.name, tw - 80), 'serif', SIZE.epiAttr,
    { color: PALETTE.ink2, role: 'epi-attr', align: 'right', itemId: epi.id })
  const sub = []
  if (epi.en) sub.push(mkRun(m, tx + tw, attrY + 1.1 * SIZE.epiSub + 14, fitText(m, 'italic', SIZE.epiSub, 400, 'italic', epi.en, tw - 80), 'italic', SIZE.epiSub,
    { color: PALETTE.ink3, role: 'sub', align: 'right', itemId: epi.id }))
  let box = union(formula, runRect(name))
  for (const s of sub) box = union(box, runRect(s))
  const epiItem = {
    id: epi.id, kind: 'verse', page: page.index, chapter: ch.key, tier: 'epigraph', stanza: null, ordinal: 1,
    locator: `${ch.roman}·题记`, box, formula, name, sub, leader: null, lineNo: null, glyph: null, ref: [], seal: null,
    anchors: anchorsOf(box),
    _refX: tx + tw - refW + 5, _refY: attrY - 0.45 * SIZE.epiAttr,
  }
  const ruleY = box.y + box.h + 34
  L.rules.push({ x0: cx - 160, y0: ruleY, x1: cx + 160, y1: ruleY, width: 1, color: PALETTE.rule, style: 'hair' })
  return { bodyTop: ruleY + 44, epiItem }
}

/**
 * 带朱色首字的段落（SPEC §4.2 Para）。首字跨三行；首字矩形与之相交的行都缩进（一般是前三行）。
 * @returns 段落（含首字）底边 y
 */
export function emitPara(m, L, x, y0, w, text, color, size) {
  const lh = size * SIZE.paraLH
  const chars = [...text]
  const capChar = chars[0], body = chars.slice(1).join('')
  const capSize = Math.round(size * 4.4)               // 34 → 150
  const capW = m('serif', capSize, 600, 'normal', capChar)
  // 首字基线：第三行基线上提 10，使首字矩形（下伸 0.24em）不压到第四行
  const capY = y0 + 2 * lh - 10
  const capRect = { y0: capY - 0.86 * capSize, y1: capY + 0.24 * capSize }
  const indent = capW + 24
  const indented = (i) => {
    const ly = y0 + i * lh
    return ly - 0.86 * size < capRect.y1 + 3 && ly + 0.24 * size > capRect.y0 - 3
  }
  const lines = wrapLines(m, 'serif', size, 400, 'normal', body, (i) => (indented(i) ? w - indent : w))
  const out = lines.map((t, i) => {
    const lx = indented(i) ? x + indent : x
    return { x: lx, y: y0 + i * lh, text: t, w: m('serif', size, 400, 'normal', t) }
  })
  L.paras.push({
    x, y: y0, w, lineHeight: lh, size, family: 'serif', color,
    dropCap: { x, y: capY, text: capChar, size: capSize, color: PALETTE.rubric, w: capW },
    lines: out,
  })
  const lastY = y0 + (out.length - 1) * lh
  return Math.max(lastY + 0.24 * size, capRect.y1)
}

/* ───────── 诗句行几何（相对坐标：原点 = 公式左上角） ───────── */

function rowGeom(m, dims, n, tier, rr, k, refCount, ordinal) {
  const d = dims.get(n.id) || { w: 400, h: 64 }
  const core = tier === 'core'
  const CW = G.CONTENT_W
  let scale = core ? F.CORE * k : (F.BASE + F.SPAN * rr) * k
  // 宽不超过栏内公式区；多层分式等特别高的公式把高度限制在 1.5 em·scale 的 1.6 倍以内，免得一句撑开整行
  scale = Math.min(scale, CW / d.w, (TALL_EM * TEX_EM * scale) / Math.max(d.h, 1))
  let fw = d.w * scale, fh = d.h * scale
  const ns = core ? 26 : Math.max(22, Math.min(24, 21 + 2 * k))
  const weight = core ? 600 : 400
  const refW = refCount ? 5 + refCount * (m('hand', REF_SIZE, 400, 'normal', 'm') + m('hand', REF_SIZE, 400, 'normal', ',') + 4) : 0
  const nameRight = CW - refW
  const nameText = fitText(m, 'serif', ns, weight, 'normal', n.name, nameRight)
  const nw = m('serif', ns, weight, 'normal', nameText)
  const subText = core && n.en ? fitText(m, 'italic', SIZE.sub, 400, 'italic', n.en, CW) : null
  const subW = subText ? m('italic', SIZE.sub, 400, 'italic', subText) : 0
  // 名称放得下 → 同一基线；放不下时先试"收缩公式到 ≥ 0.75 倍让名称留在行内"（换行一句要多花 ~50 世界 px 行高，
  // 密章 68 句里六成换行会把页撑高 20%）；收缩到 0.75 倍仍放不下才换行（SPEC §4.5 的偏差，见交付说明）
  const roomF = Math.min(nameRight - NAME_GAP - LEADER_MIN - nw, subText ? CW - NAME_GAP - subW : Infinity)
  let inline = fw <= roomF
  if (!inline && roomF >= fw * SHRINK_MIN) {
    const s = roomF / fw
    scale *= s; fw *= s; fh *= s
    inline = true
  }
  const nameBase = inline ? fh / 2 + 0.35 * ns : fh + 0.86 * ns + 8
  const subBase = nameBase + 0.24 * ns + 0.86 * SIZE.sub + 5
  // 外包框（所有可读矩形）：公式、名称、副名、上标、行号
  let top = 0, bottom = fh
  const take = (t, b) => { if (t < top) top = t; if (b > bottom) bottom = b }
  take(nameBase - 0.86 * ns, nameBase + 0.24 * ns)
  if (subText) take(subBase - 0.86 * SIZE.sub, subBase + 0.24 * SIZE.sub)
  if (refCount) { const rb = nameBase - 0.45 * ns; take(rb - 0.86 * REF_SIZE, rb + 0.24 * REF_SIZE) }
  const hasNo = ordinal % 5 === 0
  const noBase = fh / 2 + 0.31 * SIZE.lineno
  if (hasNo) take(noBase - 0.86 * SIZE.lineno, noBase + 0.24 * SIZE.lineno)
  const H = bottom - top + F.ROW_GAP * k
  return { n, tier, ordinal, scale, fw, fh, ns, weight, nameText, nw, nameRight, nameBase, subText, subBase, inline, hasNo, noBase, top, H, refCount }
}

/* ───────── 栏流排 ───────── */

/**
 * 诗节依次往下流，左栏满了接右栏；诗节号至少带 2 句才开始（不孤立在栏底）。
 * @returns {{ok:boolean, used:[number,number], place:Array}} place 里是 {type, col, y, ...}
 */
function flow(stanzaRows, colH) {
  let col = 0, y = 0, ok = true
  const used = [0, 0], place = []
  const breakCol = () => { used[col] = Math.max(used[col], y); if (col === 0) { col = 1; y = 0; return true } ok = false; return false }
  stanzaRows.forEach((rows, si) => {
    const need = (y > 0 ? SEP_H : 0) + HEAD_H + rows[0].H + (rows[1] ? rows[1].H : 0)
    if (y > 0 && y + need > colH) breakCol()
    if (y > 0) { place.push({ type: 'sep', col, y }); y += SEP_H }
    place.push({ type: 'head', col, y, si })
    y += HEAD_H
    for (const r of rows) {
      if (y + r.H > colH && y > 0) breakCol()
      place.push({ type: 'row', col, y, r, si })
      y += r.H
    }
  })
  used[col] = Math.max(used[col], y)
  if (used[1] > colH || used[0] > colH) ok = false
  return { ok, used, place }
}

/**
 * 求填充系数 k：最大的 k∈[0.75, 1.5] 使正文排得进两栏（二分 22 次）。
 * k = 1.5 仍有富余 → 不再放大字号，改为二分"栏高"让两栏等高（版面更像书页），余下空白放 tailpiece。
 * k = 0.75 仍溢出 → 返回 null，由调用方把所有页加高后重排。
 */
export function fitBody(m, dims, plan, colH, refCounts) {
  const rowsAt = (k) => plan.stanzaNodes.map((list) => list.map(({ n, tier, rr, ordinal }) =>
    rowGeom(m, dims, n, tier, rr, k, refCounts.get(n.id) || 0, ordinal)))
  const tryK = (k, h = colH) => { const rows = rowsAt(k); return { k, rows, f: flow(rows, h) } }
  let best = tryK(F.K_MAX)
  if (best.f.ok) {
    let lo = 0, hi = colH
    for (let i = 0; i < 22; i++) { const mid = (lo + hi) / 2; if (flow(best.rows, mid).ok) hi = mid; else lo = mid }
    return { ...best, f: flow(best.rows, hi), colH, balanced: true }
  }
  const low = tryK(F.K_MIN)
  if (!low.f.ok) return null
  let lo = F.K_MIN, hi = F.K_MAX
  best = low
  for (let i = 0; i < 22; i++) {
    const mid = (lo + hi) / 2
    const t = tryK(mid)
    if (t.f.ok) { lo = mid; best = t } else hi = mid
  }
  return { ...best, colH, balanced: false }
}

/* ───────── 生成条目 ───────── */

/**
 * 输出正文条目。
 *
 * @param {object} [slice] 可选：只输出 place 的某一段（用于分页续排）。
 *   { from: number, to: number } —— 按 fit.f.place 的下标区间。
 *   不传则输出全部（原有行为）。
 */
export function emitBody(m, L, page, ch, plan, fit, bodyTop, slice) {
  const tx = page.text.x
  const colX = (c) => tx + c * (G.COL_W + G.COL_GAP)
  const items = []
  const centreY = new Map()       // id -> 公式中心 y（弧端点）
  const colOf = new Map()
  const src = slice ? fit.f.place.slice(slice.from, slice.to) : fit.f.place
  for (const p of src) {
    const x0 = colX(p.col), y = bodyTop + p.y
    if (p.type === 'sep') {
      L.ornaments.push({ kind: 'asterism', x: x0 + G.COL_W / 2 - 24, y: y + 10, w: 48, h: 30, color: PALETTE.ink3, seed: page.index * 1000 + p.y | 0 })
    } else if (p.type === 'head') {
      const s = plan.stanzas[p.si]
      const t = `其${cnNum(p.si + 1)} · ${s.head.name}`
      const fx = x0 + G.CONTENT_OFF
      L.texts.push(mkRun(m, fx, y + 0.86 * SIZE.stanza, fitText(m, 'serif', SIZE.stanza, 400, 'normal', t, G.CONTENT_W), 'serif', SIZE.stanza,
        { color: PALETTE.rubric, role: 'stanza' }))
    } else {
      const r = p.r, n = r.n
      const ox = x0 + G.CONTENT_OFF, oy = y - r.top
      const formula = { x: ox, y: oy, w: r.fw, h: r.fh, scale: r.scale }
      const core = r.tier === 'core'
      const name = mkRun(m, ox + r.nameRight, oy + r.nameBase, r.nameText, 'serif', r.ns,
        { weight: r.weight, align: 'right', color: core ? PALETTE.ink : PALETTE.ink2, role: core ? 'name-core' : 'name', itemId: n.id })
      const sub = r.subText ? [mkRun(m, ox + G.CONTENT_W, oy + r.subBase, r.subText, 'italic', SIZE.sub,
        { align: 'right', color: PALETTE.ink3, role: 'sub', itemId: n.id })] : []
      const leader = r.inline ? { kind: 'leader', x: ox + r.fw + 12, y: oy + r.nameBase, w: (ox + r.nameRight - r.nw - 12) - (ox + r.fw + 12), h: 0, color: PALETTE.ink3, seed: r.ordinal + 1000 * ch.index } : null
      const lineNo = r.hasNo ? mkRun(m, ox - G.NUM_GAP, oy + r.noBase, String(r.ordinal), 'italic', SIZE.lineno,
        { align: 'right', color: PALETTE.ink3, role: 'lineno', itemId: n.id }) : null
      let box = union(formula, runRect(name))
      for (const s of sub) box = union(box, runRect(s))
      items.push({
        id: n.id, kind: 'verse', page: page.index, chapter: ch.key, tier: r.tier, stanza: p.si + 1, ordinal: r.ordinal,
        locator: `${ch.roman}·其${cnNum(p.si + 1)}·${r.ordinal}`, box, formula, name, sub, leader, lineNo,
        glyph: null, ref: [], seal: null, anchors: anchorsOf(box),
        _refX: ox + r.nameRight + 5, _refY: oy + r.nameBase - 0.45 * r.ns,   // 上标引用字母的起点（批注排好后填）
      })
      centreY.set(n.id, oy + r.fh / 2)
      colOf.set(n.id, p.col)
    }
  }
  // tailpiece：两栏等高时放在两栏下方居中；否则右栏底若空 ≥ 300 放在右栏
  const bottomLimit = bodyTop + fit.colH
  if (fit.balanced) {
    const yb = bodyTop + Math.max(fit.f.used[0], fit.f.used[1])
    const room = page.y + page.h - V.BODY_BOTTOM_FROM_BOTTOM - yb
    if (room >= 300) L.ornaments.push({ kind: 'tailpiece', x: tx + G.TEXT_W / 2 - 150, y: yb + 90, w: 300, h: 90, color: PALETTE.ink3, seed: 77 + ch.index })
  } else if (bottomLimit - (bodyTop + fit.f.used[1]) >= 300) {
    L.ornaments.push({ kind: 'tailpiece', x: colX(1) + G.COL_W / 2 - 130, y: bodyTop + fit.f.used[1] + 80, w: 260, h: 80, color: PALETTE.ink3, seed: 77 + ch.index })
  }
  return { items, centreY, colOf, colX }
}

/** 栏内铅笔弧（SPEC §4.6）：只取两端在同一栏的章内诗句关联，每栏按 weight 取前 18 条 */
export function emitArcs(L, graph, page, body) {
  const per = [[], []]
  const seen = new Set()
  for (const [id, col] of body.colOf) {
    const n = graph.byId.get(id)
    for (const l of n.linkIds) {
      if (seen.has(l.key)) continue
      const o = l.source === id ? l.target : l.source
      if (body.colOf.get(o) !== col) continue
      seen.add(l.key)
      const y0 = body.centreY.get(l.source), y1 = body.centreY.get(l.target)
      per[col].push({ a: l.source, b: l.target, x: body.colX(col) + G.ARC_W, y0, y1,
        bulge: Math.min(60, 10 + 0.12 * Math.abs(y1 - y0)), weight: l.weight, type: l.type, key: l.key })
    }
  }
  for (const list of per) {
    list.sort((p, q) => q.weight - p.weight || (p.key < q.key ? -1 : 1))
    L.arcs.push(...list.slice(0, 18))
  }
}
