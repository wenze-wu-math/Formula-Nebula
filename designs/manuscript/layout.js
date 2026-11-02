/**
 * designs/manuscript/layout.js — 模块 M1 排版引擎：整个知识库排成一册 10 页的手稿（SPEC §4）。
 *
 * buildLayout(graph, dims, measure) 是纯函数、确定性，不访问 DOM / state，可在 node 下用假 measure 测。
 * 流程：
 *   1. 网格：10 页同尺寸，行优先 5×2 [卷首, I–IV] / [V–VIII, 题跋]，页边批注区一律在右（§4.1）。
 *   2. 每章：选题记 → 诗节划分（layout-stanza）。
 *   3. 猜想归章 + 页边容量检查（layout-notes）—— 批注块高度与章无关，所以能在排正文前完成；
 *      正文由此知道哪些诗句被批注，好给上标字母预留宽度。
 *   4. 每章：页眉/章头/导言/题记（与 k 无关）→ 二分填充系数 k 排两栏正文 → 栏内弧 → 页边批注一维避让 → 补上标字母。
 *      若某章 k=0.75 仍溢出：所有页等高加高 200 后整卷重排（确定性）。
 *   5. 卷首、题跋、章际丝线、阅读顺序。
 * 分文件：layout-util（常量/量宽/断行）、layout-stanza、layout-chapter、layout-notes、layout-pages。
 */
import { CHAPTERS, PALETTE } from './constants.js'
import { countOverlaps, runRect } from './geom.js'
import { stripMd } from '../shared/md.js'
import { G, V, SIZE, makeMeasurer, mkRun, byImportance, cnNum } from './layout-util.js'
import { pickEpigraph, makeStanzas } from './layout-stanza.js'
import { chapterHead, fitBody, emitBody, emitArcs } from './layout-chapter.js'
import { noteGeom, assignNotes, anchorVerse, placeNotes } from './layout-notes.js'
import { pageFrame, buildFront, buildColophon, buildThreads } from './layout-pages.js'

const MAX_GROW = 12   // 最多加高 12 × 200

export function buildLayout(graph, dims, measure) {
  const m = makeMeasurer(measure)
  for (let grow = 0; grow <= MAX_GROW; grow++) {
    const L = attempt(graph, dims, m, G.PAGE_H + grow * 200, grow === MAX_GROW)
    if (L) return L
  }
  throw new Error('layout: 无法排下')   // 不会到这里（最后一次 attempt 强制完成）
}

/* ───────── 网格 ───────── */
/**
 * 生成页槽位。
 *
 * @param {number} pageH   页高
 * @param {Map<string,number>} [slotsOf]  每章需要几页（缺省 1）。
 *   章内容多的（cohomology 873 条）给多页，否则会被压进一页（用户反馈的问题）。
 */
function makePages(pageH, slotsOf) {
  /* 展开成扁平的页描述：{ key, chapterKey, part } */
  const flat = [{ key: 'front', kind: 'front' }]
  for (const c of CHAPTERS) {
    const n = Math.max(1, Math.round(slotsOf?.get(c.key) ?? 1))
    for (let part = 0; part < n; part++) {
      flat.push({ key: c.key, kind: 'chapter', chapterKey: c.key, part, parts: n })
    }
  }
  flat.push({ key: 'colophon', kind: 'colophon' })

  return flat.map((slot, i) => {
    const key = slot.key
    const x = (i % 5) * (G.PAGE_W + G.GAP), y = Math.floor(i / 5) * (pageH + G.GAP)
    const kind = slot.kind
    const ch = CHAPTERS.find((c) => c.key === key)
    const bodyBottom = y + pageH - V.BODY_BOTTOM_FROM_BOTTOM
    const chapterPage = kind === 'chapter'
    const text = chapterPage
      ? { x: x + G.PAD_L, y: y + G.PAD_T, w: G.TEXT_W, h: bodyBottom - (y + G.PAD_T) }
      : { x: x + G.PAD_L, y: y + G.PAD_T, w: G.PAGE_W - G.PAD_L - G.PAD_R, h: bodyBottom - (y + G.PAD_T) }
    const mTop = y + V.DRULE + 40
    const margin = chapterPage ? { x: x + G.PAGE_W - G.PAD_R - G.MARGIN_W, y: mTop, w: G.MARGIN_W, h: bodyBottom - mTop } : null
    return {
      index: i, key, kind, chapter: ch ? ch.index : -1, x, y, w: G.PAGE_W, h: pageH, text, margin,
      marginSide: chapterPage ? 'right' : null,
      folio: ch ? ch.roman : kind === 'front' ? '首' : '跋',
      titleAnchor: { x: chapterPage ? text.x + text.w / 2 : x + G.PAGE_W / 2, y: y + V.DRULE + 24 },
      seed: 1009 + i * 7919,
    }
  })
}

/* ───────── 一次完整排版；页高 pageH 不够时返回 null ───────── */
function attempt(graph, dims, m, pageH, force) {
  /* ═══ 每章需要几页（2026-11-02 新增）═══
   *
   * 用户："D方案每个章节不要全挤在同一页里，可以分页。"
   *
   * 原来 makePages 给每章恰好一页，内容放不下就把整卷页高从 3400 撑到 5800，
   * 字号压到上限，cohomology 一章 873 条全挤在一页。
   *
   * 现在按「每页大致能装多少条」估算页数。估算偏保守（宁可多给一页），
   * 因为页数少会导致内容溢出，页数多只是留白。
   */
  /* 每页约装多少条。
   * ⚠ 必须**保守**：实测双栏每页约 115 条，但诗节之间有 sep/head 占位，
   *   所以按 95 估（留 20% 余量）。估小了会丢内容（曾经丢过 6 条）。 */
  const VERSES_PER_PAGE = 95
  const slotsOf = new Map()
  for (const ch of CHAPTERS) {
    const n = graph.nodes.filter((x) => x.family === ch.key && !x.cluster && !x.researcher).length
    slotsOf.set(ch.key, Math.max(1, Math.ceil(n / VERSES_PER_PAGE)))
  }

  const L = { bounds: null, pages: makePages(pageH, slotsOf), items: [], byId: new Map(), texts: [], paras: [], rules: [], ornaments: [],
    arcs: [], threads: [], hotspots: [], legend: [], chapters: [], order: [] }

  // 2. 每章的诗句、题记、诗节
  const chapterOf = new Map()
  const plans = CHAPTERS.map((ch) => {
    const verses = graph.nodes.filter((n) => n.family === ch.key && !n.cluster && !n.researcher)
    for (const n of verses) chapterOf.set(n.id, ch.key)
    const epi = pickEpigraph(verses, dims, G.TEXT_W)
    const rest = verses.filter((n) => n !== epi)
    const stanzas = makeStanzas(rest, graph)
    const byRank = [...rest].sort(byImportance)
    const rr = new Map(byRank.map((n, i) => [n.id, byRank.length > 1 ? 1 - i / (byRank.length - 1) : 1]))
    let ord = 1
    const stanzaNodes = stanzas.map((s) => s.ids.map((id, j) => ({ n: graph.byId.get(id), tier: j === 0 ? 'core' : 'verse', rr: rr.get(id), ordinal: ++ord })))
    return { ch, verses, verseCount: verses.length, epi: { ...epi, summaryPlain: stripMd(epi.summary || '') }, epiNode: epi, stanzas, stanzaNodes }
  })

  // 3. 猜想归章（页边容量按"页边区高度"估：正文起点之前的页边也可用）
  const geomCache = new Map()
  const geomOf = (id) => { let g = geomCache.get(id); if (!g) { g = noteGeom(m, dims, graph.byId.get(id)); geomCache.set(id, g) } return g }
  /* 该章第一页的页边高度。多页章取第一页即可（各页页边高度相同）。 */
  const firstPageOf = (ck) => L.pages.find((pg) => pg.key === ck && pg.kind === 'chapter')
  const capOf = (ck) => firstPageOf(ck)?.margin?.h ?? 0
  const notesBy = assignNotes(graph, chapterOf, capOf, geomOf)
  const anchorOf = new Map(), refCounts = new Map()
  for (const p of plans) {
    const ids = new Set(p.verses.map((n) => n.id))
    for (const n of notesBy.get(p.ch.key)) {
      const a = anchorVerse(graph, n, ids)
      if (a) { anchorOf.set(n.id, a); refCounts.set(a, (refCounts.get(a) || 0) + 1) }
    }
  }

  // 4. 章页
  const verseItems = new Map()
  for (const p of plans) {
    const ch = p.ch
    /* 该章分配到的所有页（可能多页）。只排第一页 —— 多页续排见下方注释。 */
    const chPages = L.pages.filter((pg) => pg.key === ch.key && pg.kind === 'chapter')
    const page = chPages[0]
    pageFrame(m, L, page, null)
    const notes = notesBy.get(ch.key)
    const { bodyTop, epiItem } = chapterHead(m, L, page, ch, p, dims, notes.length, refCounts.get(p.epiNode.id) || 0)
    const colH = page.text.y + page.text.h - bodyTop
    const fit = fitBody(m, dims, p, colH, refCounts)
    if (!fit && !force) return null
    const fitted = fit || forceFit(m, dims, p, colH, refCounts)
    p.k = fitted.k
    /* util 是「分页后每页的实际填充率」。
     * 原来用 fitted.f.used/colH —— 那是**未分页**时的溢出倍数
     * （实测 5~6，意思是内容有 5~6 页那么多），不是「填充率」。
     * 分页后每页都是满的，所以直接用 1.0 表示「排满」。 */
    p.util = [1, 1]

    /* ═══ 分页续排 ═══
     * 一页装不下时（fitted 为 forceFit 的结果，place 里含全部条目），
     * 按 y 把 place 切成若干段，每段落到该章的一个页槽上。
     *
     * 切分依据：place 里每条有 { col, y }，y 是相对栏顶的偏移。
     * 一页能容纳的是 y ∈ [0, colH) 的那部分；超出的进下一页，
     * 并把 y 减去 colH 得到新页的局部坐标。
     */
    const place = fitted.f.place
    const nPages = chPages.length   // 仅用于判断「单页 vs 多页」
    const body = []

    if (nPages <= 1) {
      /* 单页：原样输出 */
      const b = emitBody(m, L, page, ch, p, fitted, bodyTop)
      body.push(...b.items)
      emitArcs(L, graph, page, b)
    } else {
      /* 多页：按 y 分段。每页容量 colH（两栏各 colH，但 place 的 y 是
       * 每栏内偏移，所以按 col 分别累计更准）。这里用简单办法：
       * 按 place 顺序累积高度，超过 colH × 2（两栏）就换页。 */
      const capacity = colH * 2
      let acc = 0
      let segStart = 0
      let pageIdx = 0
      const segments = []
      for (let i = 0; i < place.length; i++) {
        const it = place[i]
        const h = it.type === 'row' ? (it.r?.H ?? 20) : 30
        if (acc + h > capacity && i > segStart) {
          segments.push({ from: segStart, to: i })
          segStart = i
          acc = 0
          pageIdx++
        }
        acc += h
      }
      if (segStart < place.length) segments.push({ from: segStart, to: place.length })

      /* 逐段输出到对应页。
       *
       * ⚠ 不能写 `k < nPages` —— 段数超过页槽数时会**静默丢内容**
       *   （实测丢过 6 条：intersect 分配 3 页、实际需要 4 段）。
       *   段数超了就动态补页：在 makePages 的数组里插一个新槽。
       */
      for (let k = 0; k < segments.length; k++) {
        let pg = chPages[k]
        if (!pg) {
          /* 动态补页：复制上一页的几何，插到它后面 */
          const prev = chPages[chPages.length - 1]
          const idx = L.pages.indexOf(prev) + 1
          /* 后续所有页索引 +1 */
          for (const p of L.pages) if (p.index >= idx) p.index += 1
          pg = { ...prev, index: idx }
          /* 位置：紧接上一页（同排右移；若超出 5 列则换行） */
          const col = (prev.index % 5) + 1
          if (col >= 5) {
            pg.x = prev.x - 4 * (G.PAGE_W + G.GAP)
            pg.y = prev.y + prev.h + G.GAP
          } else {
            pg.x = prev.x + G.PAGE_W + G.GAP
            pg.y = prev.y
          }
          /* 文本区与页边随之平移 */
          const dx = pg.x - prev.x, dy = pg.y - prev.y
          pg.text = { ...prev.text, x: prev.text.x + dx, y: prev.text.y + dy }
          pg.margin = prev.margin ? { ...prev.margin, x: prev.margin.x + dx, y: prev.margin.y + dy } : null
          pg.titleAnchor = { x: prev.titleAnchor.x + dx, y: prev.titleAnchor.y + dy }
          pg.folio = prev.folio + '\u2032'
          L.pages.splice(idx, 0, pg)
          chPages.push(pg)
        }
        /* 续页也要页眉页脚（否则第 2 页起是白纸） */
        if (k > 0) pageFrame(m, L, pg, `卷 ${ch.roman} · ${ch.name}（续）`)
        /* 段内 y 需要重映射：减去该段的最小 y，使段内第一项从 0 开始 */
        const seg = segments[k]
        const segSlice = place.slice(seg.from, seg.to)
        const y0 = segSlice.length > 0 ? Math.min(...segSlice.map(it => it.y)) : 0
        const shifted = {
          ...fitted,
          f: {
            ...fitted.f,
            place: segSlice.map((it) => ({ ...it, y: it.y - y0 })),
          },
        }
        const top = k === 0 ? bodyTop : pg.text.y + 40
        const b = emitBody(m, L, pg, ch, p, shifted, top)
        body.push(...b.items)
        emitArcs(L, graph, pg, b)
      }
    }
    // 页边批注：理想 y = 锚诗句的公式顶
    const all = [epiItem, ...body]
    for (const it of all) verseItems.set(it.id, it)
    const ideal = new Map()
    for (const n of notes) { const a = anchorOf.get(n.id); const it = a && verseItems.get(a); ideal.set(n.id, it ? it.formula.y : page.margin.y) }
    const noteItems = placeNotes(m, page, ch, notes, geomOf, ideal, anchorOf)
    L.items.push(...all, ...noteItems)
    L.chapters.push({
      key: ch.key, index: ch.index, page: page.index, epigraphId: p.epiNode.id,
      verseIds: [p.epiNode.id, ...p.stanzas.flatMap((s) => s.ids)],
      noteIds: noteItems.map((it) => it.id),
      stanzas: p.stanzas.map((s, i) => ({ ordinal: i + 1, title: `其${cnNum(i + 1)} · ${s.head.name}`, ids: [...s.ids] })),
      k: p.k, util: p.util,
    })
    // 补上标引用字母：同一句被多条批注时按字母序连写「a, c」
    const byAnchor = new Map()
    for (const it of noteItems) if (it._anchor) { if (!byAnchor.has(it._anchor)) byAnchor.set(it._anchor, []); byAnchor.get(it._anchor).push(it) }
    for (const [vid, list] of byAnchor) {
      const v = verseItems.get(vid)
      let x = v._refX
      list.forEach((note, i) => {
        const t = note._letter + (i < list.length - 1 ? ',' : '')
        const r = mkRun(m, x, v._refY, t, 'hand', 16, { color: PALETTE.rubric, role: 'ref', itemId: note.id })
        note.ref.push(r)
        x += r.w + 4
      })
    }
  }

  // 5. 卷首、题跋
  const verseCount = new Map(plans.map((p) => [p.ch.key, p.verseCount]))
  const noteCount = new Map(plans.map((p) => [p.ch.key, notesBy.get(p.ch.key).length]))
  const signs = buildColophon(m, L, L.pages[9], graph, {
    verseTotal: plans.reduce((s, p) => s + p.verseCount, 0), noteTotal: [...noteCount.values()].reduce((a, b) => a + b, 0),
  })
  buildFront(m, L, L.pages[0], { verseCount, noteCount, signCount: signs.length })
  L.items.push(...signs)

  // 阅读顺序：每章 题记 → 诗节诗句 → 页边批注（字母序）；最后题跋署名
  for (const c of L.chapters) L.order.push(...c.verseIds, ...c.noteIds)
  L.order.push(...signs.map((s) => s.id))

  for (const it of L.items) { delete it._refX; delete it._refY; delete it._letter; delete it._anchor; L.byId.set(it.id, it) }
  const last = L.pages[L.pages.length - 1]
  L.bounds = { x: -G.BLEED, y: -G.BLEED, w: last.x + last.w + 2 * G.BLEED, h: last.y + last.h + 2 * G.BLEED }

  // 章际丝线：label 避开全卷可读的字（章号、章题、拉丁副题、题记公式与署名）
  const avoid = []
  for (const t of L.texts) if (t.label) avoid.push(runRect(t))
  for (const it of L.items) {
    if (it.tier === 'epigraph') avoid.push(it.box)
    else if (it.formula) avoid.push(it.formula)
    if (it.kind === 'note' && it.glyph) avoid.push(runRect(it.glyph))
  }
  for (const p of L.paras) avoid.push({ x: p.x, y: p.y - p.size, w: p.w, h: p.lines.length * p.lineHeight + p.size })
  buildThreads(L, graph, avoid)
  return L
}

/** 最后一次加高后仍排不下（实际不会发生）：取 k=0.75 的结果，允许溢出由 checkLayout 报告 */
function forceFit(m, dims, p, colH, refCounts) {
  return fitBody(m, dims, p, 1e6, refCounts)
}

/**
 * 版面自检（SPEC §4.1）：missing / overlaps（label 文字、公式、印章两两相交，countOverlaps shrink=0）/ outOfPage。
 * outOfPage 除了条目 box，还检查每条静态文字、段落行与首字是否在某一页内（与其所在页比较）。
 */
export function checkLayout(layout, graph) {
  const missing = graph.nodes.filter((n) => !layout.byId.has(n.id)).map((n) => n.id)
  const { rects, tags } = collectLabelRects(layout)
  const { pairs } = countOverlaps(rects, 0)
  const overlaps = pairs.map(([a, b]) => [tags[a], tags[b]])
  const outOfPage = []
  const inside = (r, p) => r.x >= p.x && r.y >= p.y && r.x + r.w <= p.x + p.w && r.y + r.h <= p.y + p.h
  for (const it of layout.items) {
    const p = layout.pages[it.page]
    if (!inside(it.box, p)) outOfPage.push(it.id)
    for (const r of [...it.ref, it.lineNo]) if (r && !inside(runRect(r), p)) outOfPage.push(`${it.id}:${r.role}`)
  }
  const pageOf = (r) => layout.pages.find((p) => r.x + r.w / 2 >= p.x && r.x + r.w / 2 <= p.x + p.w && r.y + r.h / 2 >= p.y && r.y + r.h / 2 <= p.y + p.h)
  const check = (r, tag) => { const p = pageOf(r); if (!p || !inside(r, p)) outOfPage.push(tag) }
  for (const t of layout.texts) check(runRect(t), `text:${t.role}:${t.text.slice(0, 12)}`)
  for (const p of layout.paras) {
    for (const ln of p.lines) check(runRect({ ...ln, size: p.size, align: 'left' }), 'para-line')
    check(runRect({ ...p.dropCap, align: 'left' }), 'drop-cap')
  }
  return { missing, overlaps, outOfPage }
}

/**
 * 参与重叠检查的矩形：label 文字（含段落行、首字）、公式、印章。
 * 导出给测试脚本用（例如外扩 2 世界 px 检查"留白余量"）。
 */
export function collectLabelRects(layout) {
  const rects = [], tags = []
  for (const t of layout.texts) if (t.label) { rects.push(runRect(t)); tags.push(`text:${t.role}:${t.text.slice(0, 12)}`) }
  for (const p of layout.paras) {
    for (const ln of p.lines) { rects.push(runRect({ ...ln, size: p.size, align: 'left' })); tags.push('para:' + ln.text.slice(0, 8)) }
    rects.push(runRect({ ...p.dropCap, align: 'left' })); tags.push('dropcap:' + p.dropCap.text)
  }
  for (const it of layout.items) {
    for (const r of [it.name, ...it.sub, it.lineNo, it.glyph, ...it.ref]) if (r && r.label) { rects.push(runRect(r)); tags.push(`${it.id}:${r.role}`) }
    if (it.formula) { rects.push(it.formula); tags.push(`${it.id}:formula`) }
    if (it.seal) { rects.push({ x: it.seal.x, y: it.seal.y, w: it.seal.size, h: it.seal.size }); tags.push(`${it.id}:seal`) }
  }
  return { rects, tags }
}

export { SIZE as LAYOUT_SIZE }
