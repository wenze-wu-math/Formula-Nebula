/**
 * designs/manuscript/layout-pages.js — 卷首、卷末题跋、章际丝线（SPEC §4.7、§4.9）。纯函数。
 */
import { PALETTE, CHAPTERS, COLOPHON, FIELD_SEAL, STATUS_GLYPH } from './constants.js'
import { RESEARCHER_AREAS as RESEARCHER_LABELS } from '../shared/kb.js'
import { G, SIZE, mkRun, fitText, union, cnNum, byImportance, anchorsOf, runRect } from './layout-util.js'
import { emitPara } from './layout-chapter.js'
import { rectsOverlap } from './geom.js'

/** 页眉 + 页码 + 页码两侧花饰（卷首 / 题跋 / 章页共用） */
export function pageFrame(m, L, page, rightHead) {
  const tx = page.x + G.PAD_L, tr = page.x + G.PAGE_W - G.PAD_R
  if (rightHead) {
    L.texts.push(mkRun(m, tx, page.y + 150, '公式诗稿', 'serif', SIZE.runhead, { color: PALETTE.ink3, role: 'runhead' }))
    L.texts.push(mkRun(m, tr, page.y + 150, rightHead, 'serif', SIZE.runhead, { color: PALETTE.ink3, role: 'runhead', align: 'right' }))
    L.rules.push({ x0: tx, y0: page.y + 172, x1: tr, y1: page.y + 172, width: 1, color: PALETTE.rule, style: 'hair' })
  }
  const cx = page.x + G.PAGE_W / 2, fy = page.y + page.h - 70
  const f = mkRun(m, cx, fy, page.folio, page.folio.length > 1 || /[A-Z]/.test(page.folio) ? 'italic' : 'serif', SIZE.folio,
    { color: PALETTE.ink3, role: 'folio', align: 'center' })
  L.texts.push(f)
  const half = f.w / 2 + 22
  L.ornaments.push({ kind: 'fleuron', x: cx - half - 26, y: fy - 22, w: 26, h: 26, color: PALETTE.rubric, seed: page.seed })
  L.ornaments.push({ kind: 'fleuron', x: cx + half, y: fy - 22, w: 26, h: 26, color: PALETTE.rubric, seed: page.seed + 1 })
}

/* ───────── 卷首 ───────── */
const STATUS_ORDER = ['open', 'partial', 'proved', 'disproved', 'heuristic']
const STROKES = [
  ['solid', '单线　定义、计算、性质、相关'],
  ['double', '双线　等价'],
  ['arrow', '箭头　蕴含、推广、依赖（甲 → 乙）'],
  ['dashed', '虚线　类比'],
  ['dotted', '点线　同族、出处'],
  ['wavy', '波浪线　对比'],
]

export function buildFront(m, L, page, ctx) {
  pageFrame(m, L, page, null)
  const cx = page.x + G.PAGE_W / 2
  const tx = page.x + G.PAD_L + 100, tr = page.x + G.PAGE_W - G.PAD_R - 100, tw = tr - tx
  const y = (dy) => page.y + dy
  L.ornaments.push({ kind: 'fleuron', x: cx - 40, y: y(330), w: 80, h: 80, color: PALETTE.rubric, seed: 5 })
  L.texts.push(mkRun(m, cx, y(720), '公式诗稿', 'serif', 260, { weight: 600, role: 'title', align: 'center' }))
  L.texts.push(mkRun(m, cx, y(850), 'Formula Manuscript · 代数几何四百八十八则', 'italic', 52, { color: PALETTE.ink3, role: 'latin', align: 'center', style: 'normal' }))
  L.rules.push({ x0: cx - 420, y0: y(900), x1: cx + 420, y1: y(900), width: 4, color: PALETTE.ink2, style: 'double' })
  L.texts.push(mkRun(m, cx, y(1010), '每一条公式都是一行诗：它说出一件真事，而且说得很短。', 'serif', 40, { color: PALETTE.ink2, role: 'front', align: 'center' }))
  // 目录
  L.texts.push(mkRun(m, cx, y(1200), '目　录', 'serif', 56, { weight: 600, role: 'front', align: 'center' }))
  const rows = [...CHAPTERS.map((c) => ({ key: c.key, roman: c.roman, name: c.name, tail: `诗 ${ctx.verseCount.get(c.key)} · 问 ${ctx.noteCount.get(c.key)}` })),
    { key: 'colophon', roman: '跋', name: COLOPHON.name, tail: `署名 ${ctx.signCount}` }]
  const numR = tx + 110, nameX = tx + 150
  rows.forEach((r, i) => {
    const by = y(1320) + i * 74
    const hot = 'toc-' + r.key
    L.texts.push(mkRun(m, numR, by, r.roman, r.roman === '跋' ? 'serif' : 'italic', 32, { color: PALETTE.rubric, role: 'toc', align: 'right', hot, style: 'normal' }))
    const nm = mkRun(m, nameX, by, r.name, 'serif', 32, { role: 'toc', hot })
    const tl = mkRun(m, tr, by, r.tail, 'serif', 26, { color: PALETTE.ink2, role: 'toc-num', align: 'right', hot })
    L.texts.push(nm, tl)
    L.ornaments.push({ kind: 'leader', x: nameX + nm.w + 20, y: by, w: tr - tl.w - 20 - (nameX + nm.w + 20), h: 0, color: PALETTE.ink3, seed: 300 + i })
    L.hotspots.push({ id: hot, rect: { x: tx, y: by - 40, w: tw, h: 56 }, action: { type: 'chapter', key: r.key } })
  })
  // 凡例
  const ly = y(2090)
  L.rules.push({ x0: cx - 160, y0: ly - 70, x1: cx + 160, y1: ly - 70, width: 1, color: PALETTE.rule, style: 'hair' })
  L.texts.push(mkRun(m, cx, ly, '凡　例', 'serif', 56, { weight: 600, role: 'front', align: 'center' }))
  const c1 = tx, c2 = tx + tw / 2 + 30, colW = tw / 2 - 30
  let yy = ly + 110
  L.texts.push(mkRun(m, c1, yy, '页边批注的手写符号', 'serif', 30, { color: PALETTE.rubric, role: 'legend' }))
  yy += 66
  for (const s of STATUS_ORDER) {
    const g = STATUS_GLYPH[s]
    L.legend.push({ kind: 'status', key: s, rect: { x: c1, y: yy - 40, w: 50, h: 50 } })
    L.texts.push(mkRun(m, c1 + 70, yy, fitText(m, 'serif', 28, 400, 'normal', `${g.name}　${g.hint || ''}`.trim(), colW - 70), 'serif', 28, { color: PALETTE.ink2, role: 'legend' }))
    yy += 62
  }
  yy += 30
  L.texts.push(mkRun(m, c1, yy, '字号的阶梯', 'serif', 30, { color: PALETTE.rubric, role: 'legend' }))
  yy += 70
  const tiers = [['epigraph', 56, '题记 —— 每章最重要的一条，全卷可读'], ['core', 36, '节首 —— 每节第一句，稍大'], ['verse', 26, '诗句 —— 按重要度排序，越核心越大']]
  for (const [key, sz, t] of tiers) {
    const r = mkRun(m, c1, yy, fitText(m, 'serif', sz, 400, 'normal', t, colW), 'serif', sz, { color: PALETTE.ink, role: 'legend' })
    L.texts.push(r)
    L.legend.push({ kind: 'tier', key, rect: { x: c1, y: yy - 0.86 * sz, w: r.w, h: 1.1 * sz } })
    yy += sz * 1.1 + 34
  }
  yy += 20
  L.legend.push({ kind: 'seal', key: 'ag', rect: { x: c1, y: yy - 46, w: 60, h: 60 } })
  L.texts.push(mkRun(m, c1 + 80, yy, '朱印 —— 卷末题跋的署名', 'serif', 28, { color: PALETTE.ink2, role: 'legend' }))
  L.texts.push(mkRun(m, c1 + 80, yy + 46, '印文是作者所治之学（几、数、代…）', 'serif', 24, { color: PALETTE.ink3, role: 'legend' }))
  // 右栏：笔法
  yy = ly + 110
  L.texts.push(mkRun(m, c2, yy, '铅笔批注线的笔法', 'serif', 30, { color: PALETTE.rubric, role: 'legend' }))
  yy += 66
  for (const [k, t] of STROKES) {
    L.legend.push({ kind: 'stroke', key: k, rect: { x: c2, y: yy - 24, w: 110, h: 20 } })
    L.texts.push(mkRun(m, c2 + 130, yy, fitText(m, 'serif', 28, 400, 'normal', t, colW - 130), 'serif', 28, { color: PALETTE.ink2, role: 'legend' }))
    yy += 62
  }
  yy += 30
  L.texts.push(mkRun(m, c2, yy, '其　他', 'serif', 30, { color: PALETTE.rubric, role: 'legend' }))
  yy += 66
  for (const t of ['蓝黑墨手书 —— 页边的未解之问（猜想）', '朱色上标字母 —— 该句有页边批注', '栏左铅笔弧 —— 同栏诗句之间的关联', '章与章之间的丝线 —— 跨章关联的条数', '点选一句：铅笔线拉出它的全部关联']) {
    L.texts.push(mkRun(m, c2, yy, fitText(m, 'serif', 26, 400, 'normal', t, colW), 'serif', 26, { color: PALETTE.ink2, role: 'legend' }))
    yy += 56
  }
  L.texts.push(mkRun(m, cx, y(3080), '— 手稿本 · 凡十页 —', 'italic', 26, { color: PALETTE.ink3, role: 'front', align: 'center', style: 'normal' }))
}

/* ───────── 卷末题跋 ───────── */
export function buildColophon(m, L, page, graph, ctx) {
  pageFrame(m, L, page, '卷末 · 题跋')
  const tx = page.x + G.PAD_L, tr = page.x + G.PAGE_W - G.PAD_R, tw = tr - tx, cx = tx + tw / 2
  L.texts.push(mkRun(m, cx, page.y + 470, '题跋', 'serif', 150, { weight: 600, role: 'title', align: 'center' }))
  L.texts.push(mkRun(m, cx, page.y + 560, 'Colophon · Signatures', 'italic', 52, { color: PALETTE.ink3, role: 'latin', align: 'center' }))
  L.rules.push({ x0: tx, y0: page.y + 610, x1: tr, y1: page.y + 610, width: 4, color: PALETTE.ink2, style: 'double' })
  const rs = graph.nodes.filter((n) => n.researcher).sort(byImportance)
  // 印文说明按实际出现的领域、出现次数降序
  const cnt = new Map()
  for (const n of rs) cnt.set(n.field, (cnt.get(n.field) || 0) + 1)
  const fields = [...cnt.keys()].sort((a, b) => cnt.get(b) - cnt.get(a) || (a < b ? -1 : 1))
  const legend = fields.map((f) => `${FIELD_SEAL[f] || '印'} ${RESEARCHER_LABELS[f]?.name || f}`).join('、')
  const text = `以上八章，诗${cnNum(ctx.verseTotal)}首，页边未解之问${cnNum(ctx.noteTotal)}则。录诸位当代作者署名${cnNum(rs.length)}于后，` +
    `以其在本卷中的分量为序；印文为其所治之学：${legend}。点选署名，铅笔线会连到其人所涉的诗句与问题。`
  const pb = emitPara(m, L, tx, page.y + 700, tw, text, PALETTE.ink2, SIZE.para)
  const top = pb + 90
  const bottom = page.y + page.h - 470      // 页尾留给大印与 tailpiece
  const pitch = Math.min(170, (bottom - top) / 12)
  const colW = (tw - 80) / 2
  const items = []
  rs.forEach((n, i) => {
    const col = i % 2, row = Math.floor(i / 2)
    const x = tx + col * (colW + 80), y = top + row * pitch
    const seal = { x, y, size: SIZE.seal, char: FIELD_SEAL[n.field] || '印' }
    const nx = x + SIZE.seal + 24, nw = colW - SIZE.seal - 24
    /* 三条文字的基线一律由字号推出，不写死像素：姓名的上伸对齐朱印顶（0.86em，留 3px 视觉补偿），
     * 机构、研究方向依次往下排，各留 8px 行距。原先写死的 `y + 38` 只适合 sign=40，
     * 改成 56 后姓名会与机构压在一起 —— 这是本次一并修掉的原因。 */
    const nameBase = y + 0.86 * SIZE.sign + 3
    const name = mkRun(m, nx, nameBase, fitText(m, 'hand', SIZE.sign, 400, 'normal', n.name, nw), 'hand', SIZE.sign, { role: 'sign-name', itemId: n.id })
    const inst = mkRun(m, nx, nameBase + 0.24 * SIZE.sign + 8 + 0.86 * SIZE.signInst, fitText(m, 'italic', SIZE.signInst, 400, 'italic', String(n.institution || ''), nw), 'italic', SIZE.signInst,
      { color: PALETTE.ink3, role: 'sign-inst', itemId: n.id })
    const focusRaw = String(n.focus || '')
    const focus = mkRun(m, nx, inst.y + 0.24 * SIZE.signInst + 8 + 0.86 * SIZE.signFocus,
      fitText(m, 'serif', SIZE.signFocus, 400, 'normal', focusRaw.length > 60 ? focusRaw.slice(0, 60).trimEnd() + '…' : focusRaw, nw), 'serif', SIZE.signFocus,
      { color: PALETTE.ink2, role: 'sign-focus', itemId: n.id })
    const sub = [inst, focus].filter((r) => r.text)
    let box = union({ x, y, w: SIZE.seal, h: SIZE.seal }, runRect(name))
    for (const s of sub) box = union(box, runRect(s))
    items.push({
      id: n.id, kind: 'sign', page: page.index, chapter: 'colophon', tier: 'sign', stanza: null, ordinal: i + 1,
      locator: `跋·${i + 1}`, box, formula: null, name, sub, leader: null, lineNo: null, glyph: null, ref: [], seal,
      anchors: anchorsOf(box),
    })
  })
  // 页尾：tailpiece + 一枚大号「诗稿」朱印（装饰，非条目）
  const yb = page.y + page.h - 330
  L.ornaments.push({ kind: 'tailpiece', x: cx - 150, y: yb, w: 300, h: 90, color: PALETTE.ink3, seed: 909 })
  L.ornaments.push({ kind: 'frame', x: tr - 190, y: yb - 40, w: 170, h: 170, color: PALETTE.seal, seed: 910, text: '诗稿' })
  return items
}

/* ───────── 章际丝线 ───────── */
const LABEL_W = 150, LABEL_H = 110     // 丝线 label（纸色圆底 + 数字）在世界坐标里的避让框，按全卷 z≈0.12 时 ~16px 估

export function buildThreads(L, graph, avoid) {
  const pageOf = new Map(L.items.filter((it) => it.kind !== 'sign').map((it) => [it.id, it.page]))
  const acc = new Map()
  for (const l of graph.links) {
    const a = pageOf.get(l.source), b = pageOf.get(l.target)
    if (a === undefined || b === undefined || a === b) continue
    const k = Math.min(a, b) * 100 + Math.max(a, b)
    const e = acc.get(k) || { from: Math.min(a, b), to: Math.max(a, b), count: 0, weight: 0 }
    e.count++; e.weight += l.weight
    acc.set(k, e)
  }
  const b = L.bounds, mx = b.x + b.w / 2, my = b.y + b.h / 2
  for (const e of [...acc.values()].sort((p, q) => p.from - q.from || p.to - q.to)) {
    if (e.count < 8) continue
    const pa = L.pages[e.from], pb = L.pages[e.to]
    const { x: x0, y: y0 } = pa.titleAnchor, { x: x1, y: y1 } = pb.titleAnchor
    const cx0 = (x0 + x1) / 2, cy0 = (y0 + y1) / 2
    const dist = Math.hypot(x1 - x0, y1 - y0)
    let nx, ny
    if (Math.abs(y1 - y0) < 1) { nx = 0; ny = -1 }                      // 同一行：向上拱
    else {
      nx = -(y1 - y0) / dist; ny = (x1 - x0) / dist                     // 法向；取远离全卷中心的一侧
      if (nx * (cx0 - mx) + ny * (cy0 - my) < 0) { nx = -nx; ny = -ny }
    }
    const off = 0.18 * dist
    const cx = cx0 + nx * off, cy = cy0 + ny * off
    const at = (t) => [(1 - t) * (1 - t) * x0 + 2 * t * (1 - t) * cx + t * t * x1, (1 - t) * (1 - t) * y0 + 2 * t * (1 - t) * cy + t * t * y1]
    let label = null
    for (const t of [0.5, 0.46, 0.54, 0.42, 0.58, 0.38, 0.62, 0.35, 0.65]) {
      const [lx, ly] = at(t)
      const r = { x: lx - LABEL_W / 2, y: ly - LABEL_H / 2, w: LABEL_W, h: LABEL_H }
      if (!avoid.some((a) => rectsOverlap(a, r)) && !L.threads.some((th) => th.label && rectsOverlap(r, { x: th.label.x - LABEL_W / 2, y: th.label.y - LABEL_H / 2, w: LABEL_W, h: LABEL_H }))) {
        label = { x: lx, y: ly, text: String(e.count) }
        break
      }
    }
    L.threads.push({ from: e.from, to: e.to, count: e.count, weight: e.weight, x0, y0, x1, y1, cx, cy, label })
  }
}
