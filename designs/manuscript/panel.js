/**
 * designs/manuscript/panel.js — 注释页（右侧详情笺）的内容构建（SPEC §7.3，模块 M4）。
 *
 * 一张"注释笺"：定位行 → 名称 → 状态 / 署名信息 → 公式 → 题解 → 笺注 → 代表作 → 关联 → 页脚。
 *
 * 取舍：
 *   · 公式用 formulas.svgUrlFor(id) 的 <img>，与画布上是**同一份 MathJax 排版**（不用 KaTeX：
 *     两套排版结果会不一致，且部分 latex 用了 KaTeX 不支持的宏）。
 *   · 一切数据文本都走 textContent / inlineMd（**粗体** → <b class="em">，朱墨），绝不拼进 innerHTML。
 *   · 外链只接受 ^https?:// —— 数据里出现 javascript: 之类的协议时降级为纯文本。
 *   · 关联按关系类型分组，组名旁画该类型的铅笔笔法小样（与画布上选中时的连线同一套笔法），
 *     读者在侧栏里学会的符号，回到画布上马上认得。
 */
import { inlineMd } from '../shared/md.js'
import { typeLabel, CONJECTURE_FIELDS, RESEARCHER_AREAS, progressOf, DATA_AS_OF, PROGRESS_EVIDENCE } from '../shared/kb.js'
import {
  PALETTE, CHAPTER_BY_KEY, COLOPHON, statusGlyph, FIELD_SEAL, LINK_STROKE, nebulaLink, TEX_EM,
} from './constants.js'
import { svgUrlFor } from './formulas.js'
import { strokeSample, sealStamp, statusMark, seedOf } from './pencil.js'
import { state as globalState } from './state.js'

/** 关联分组的显示顺序：强关系在前，"同族 / 出处 / 相关"这类弱关系在后 */
const TYPE_ORDER = ['equivalent', 'implies', 'generalizes', 'depends', 'defines', 'computes', 'property',
  'analogy', 'contrast', 'sameFamily', 'provenance', 'related']

/** 条目层级的中文名（定位行副标） */
const TIER_NAME = { epigraph: '题记', core: '核心诗句', verse: '诗句', note: '页边批注', sign: '署名' }

/** 注释页里公式的目标 em（CSS px）：比正文大一号，读得清上下标 */
const PANEL_FORMULA_EM = 30
const PANEL_FORMULA_MAX_H = 120
const PANEL_INNER_W = 420 - 2 * 28 - 8   // 留出滚动条

/**
 * @param {object} node  graph 节点
 * @param {{graph:object, layout:object, actions:object, state?:object}} deps
 * @returns {HTMLElement}
 */
export function buildPanelContent(node, deps) {
  const { graph, layout, actions } = deps
  const st = deps.state || globalState
  const item = layout?.byId?.get(node.id) || null

  const leaf = el('article', 'mx-leaf')
  leaf.setAttribute('aria-label', `注释：${node.name}`)
  leaf.dataset.id = node.id

  /* 1. 定位行：locator + ‹ › ✕ */
  const loc = el('div', 'mx-leaf-loc')
  const locText = el('span', 'mx-loc')
  locText.textContent = locatorOf(node, item)
  const tierText = el('span', 'mx-tier')
  tierText.textContent = tierOf(node, item)
  const nav = el('div', 'mx-leaf-nav')
  nav.append(
    iconBtn('‹', '上一句（←）', () => actions.step(-1)),
    iconBtn('›', '下一句（→）', () => actions.step(1)),
    iconBtn('✕', '关闭注释（Esc）', () => actions.deselect(), 'mx-close'),
  )
  loc.append(locText, tierText, nav)
  leaf.append(loc)

  /* 2. 名称 + 类别信息 */
  const head = el('header', 'mx-leaf-head')
  if (node.cluster) {
    // 与画布同一支笔：✓ ✗ 在 pencil.statusMark 里是两笔手绘（手写字体没有这两个字形）
    const glyph = hiDpiCanvas(40, 46, 'mx-glyph-big')
    try { statusMark(glyph.getContext('2d'), 20, 38, 40, node.status, { align: 'center' }) } catch { /* 笔触模块未就绪 */ }
    glyph.setAttribute('aria-hidden', 'true')
    head.append(glyph)
    head.classList.add('has-glyph')
  } else if (node.researcher) {
    head.append(sealCanvas(FIELD_SEAL[node.field] || '学', 52, node.id))
    head.classList.add('has-seal')
  }
  const titles = el('div', 'mx-leaf-titles')
  const h = el('h2', 'mx-name'); h.textContent = node.name
  titles.append(h)
  if (node.en && node.en !== node.name) { const en = el('p', 'mx-en'); en.textContent = node.en; titles.append(en) }
  head.append(titles)
  leaf.append(head)

  if (node.cluster) leaf.append(conjectureMeta(node))
  else if (node.researcher) leaf.append(researcherMeta(node))

  /* 3. 公式（研究者没有） */
  if (!node.researcher) {
    const fig = el('figure', 'mx-formula')
    const url = svgUrlFor(node.id)
    if (url) {
      const img = new Image()
      img.alt = `公式：${node.latex}`
      img.decoding = 'async'
      img.src = url
      const d = st.dims && st.dims.get(node.id)
      if (d) sizeFormula(img, d.w, d.h)
      else img.addEventListener('load', () => sizeFormula(img, img.naturalWidth, img.naturalHeight), { once: true })
      fig.append(img)
    } else {
      // 公式尚未量取（启动早期）——退回 latex 源码，用等宽字显示
      const code = el('code', 'mx-latex'); code.textContent = node.latex; fig.append(code)
    }
    leaf.append(fig)
  }

  /* 4. 题解 / 笺注 */
  if (node.summary) leaf.append(section('题解', 'Argumentum', mdPara(node.summary, 'mx-summary')))
  if (node.detail && node.detail !== node.summary) {
    const paras = String(node.detail).split(/\n{2,}/).filter(Boolean).map((t, i) => mdPara(t, i === 0 ? 'mx-detail mx-initial' : 'mx-detail'))
    leaf.append(section('笺注', 'Commentarius', ...paras))
  }

  /* 5. 代表作（研究者） */
  if (node.researcher && node.representativeWorks?.length) leaf.append(section('代表作', 'Opera', worksList(node.representativeWorks)))

  /* 6. 关联 */
  const rel = relations(node, graph, layout, actions)
  if (rel) leaf.append(rel)

  /* 7. 页脚 */
  const foot = el('footer', 'mx-leaf-foot')
  const copy = el('button', 'mx-link-btn'); copy.type = 'button'; copy.textContent = '复制本页链接'
  copy.setAttribute('aria-label', '复制指向本条注释的链接')
  copy.addEventListener('click', () => actions.copyLink())
  const neb = el('a', 'mx-link-btn'); neb.textContent = '在原星云中打开 ↗'
  neb.href = nebulaLink(node.id); neb.target = '_blank'; neb.rel = 'noopener'
  neb.setAttribute('aria-label', `在原三维星云中打开「${node.name}」（新标签页）`)
  foot.append(copy, neb)
  leaf.append(foot)
  return leaf
}

/* ───────── 各段 ───────── */

function conjectureMeta(node) {
  const g = statusGlyph(node.status)
  const box = el('div', 'mx-meta')
  const status = el('p', 'mx-status')
  const sn = el('b', 'mx-status-name'); sn.textContent = g.name; sn.style.color = g.color
  status.append(sn)
  if (g.hint) { const hint = el('span', 'mx-status-hint'); hint.textContent = ' · ' + g.hint; status.append(hint) }
  box.append(status)
  const dl = el('dl', 'mx-dl')
  const field = CONJECTURE_FIELDS[node.field]
  if (field) addRow(dl, '领域', field.name)
  if (node.proposer) addRow(dl, '提出者', node.proposer)
  if (node.year) addRow(dl, '提出年份', String(node.year))
  const py = progressOf(node.id)
  if (py) {
    const dd = addRow(dl, '最近进展', `${py} 年`)
    const ev = PROGRESS_EVIDENCE?.[node.id]?.[1]
    if (ev) { const q = el('span', 'mx-evidence'); q.textContent = `「${ev}」`; dd.append(q) }
    const asof = el('span', 'mx-asof'); asof.textContent = `（数据截至 ${DATA_AS_OF}）`; dd.append(asof)
  }
  if (dl.childElementCount) box.append(dl)
  return box
}

function researcherMeta(node) {
  const box = el('div', 'mx-meta')
  const dl = el('dl', 'mx-dl')
  const area = RESEARCHER_AREAS[node.field] || CONJECTURE_FIELDS[node.field]
  if (area) addRow(dl, '印文', `${FIELD_SEAL[node.field] || '学'} · ${area.name}`)
  if (node.institution) addRow(dl, '机构', node.institution)
  if (node.focus) addRow(dl, '研究方向', node.focus)
  box.append(dl)
  return box
}

function worksList(works) {
  const ol = el('ol', 'mx-works')
  for (const w of works) {
    const li = el('li', 'mx-work')
    const title = /^https?:\/\//i.test(String(w.url || '')) ? el('a', 'mx-work-title') : el('span', 'mx-work-title')
    title.textContent = w.title || '（无题）'
    if (title.tagName === 'A') { title.href = w.url; title.target = '_blank'; title.rel = 'noopener' }
    li.append(title)
    if (w.year) { const y = el('span', 'mx-work-year'); y.textContent = ` · ${w.year}`; li.append(y) }
    if (w.note) { const n = el('p', 'mx-work-note'); n.append(...inlineMd(w.note)); li.append(n) }
    ol.append(li)
  }
  return ol
}

function relations(node, graph, layout, actions) {
  const links = node.linkIds || []
  if (!links.length) return null
  const groups = new Map()
  for (const l of links) {
    const t = l.type || 'related'
    if (!groups.has(t)) groups.set(t, [])
    groups.get(t).push(l)
  }
  const types = [...groups.keys()].sort((a, b) => rankOf(a) - rankOf(b))
  const body = []
  for (const t of types) {
    const ls = groups.get(t).sort((a, b) => b.weight - a.weight)
    const g = el('div', 'mx-rel-group')
    const gh = el('h4', 'mx-rel-head')
    const style = LINK_STROKE[t] || 'solid'
    gh.append(strokeCanvas(style, t), text('span', 'mx-rel-type', typeLabel(t)), text('span', 'mx-rel-count', String(ls.length)))
    g.append(gh)
    const ul = el('ul', 'mx-rel-list')
    for (const l of ls) {
      const otherId = l.source === node.id ? l.target : l.source
      const other = graph.byId.get(otherId)
      if (!other) continue
      ul.append(relRow(node, l, other, layout, actions, style))
    }
    g.append(ul)
    body.push(g)
  }
  return section('关联', `Nexus · ${links.length}`, ...body)
}

function relRow(node, l, other, layout, actions, style) {
  const li = el('li')
  const b = el('button', 'mx-rel')
  b.type = 'button'
  const oit = layout?.byId?.get(other.id)
  const top = el('span', 'mx-rel-top')
  if (style === 'arrow') {
    // 方向：source → target。本条在 source 端 = 指出去
    const dir = el('span', 'mx-rel-dir'); dir.textContent = l.source === node.id ? '→' : '←'
    dir.title = l.source === node.id ? '本条指向它' : '它指向本条'
    top.append(dir)
  }
  if (other.cluster) {
    const g = statusGlyph(other.status)
    const s = el('span', 'mx-rel-glyph'); s.textContent = g.glyph; s.style.color = g.color; top.append(s)
  }
  top.append(text('span', 'mx-rel-name', other.name))
  top.append(text('span', 'mx-rel-loc', locatorOf(other, oit)))
  b.append(top)
  const label = readableLabel(l.label, other)
  if (label) { const p = el('span', 'mx-rel-label'); p.append(...inlineMd(label)); b.append(p) }
  b.setAttribute('aria-label', `关联：${other.name}（${typeLabel(l.type)}）`)
  const enter = () => actions.hover(other.id, 0, 0, 'panel')
  const leave = () => actions.hover(null, 0, 0, 'panel')
  b.addEventListener('mouseenter', enter)
  b.addEventListener('mouseleave', leave)
  b.addEventListener('focus', enter)
  b.addEventListener('blur', leave)
  b.addEventListener('click', () => { leave(); actions.locate(other.id) })
  li.append(b)
  return li
}

/* ───────── 小工具 ───────── */

function rankOf(t) { const i = TYPE_ORDER.indexOf(t); return i < 0 ? TYPE_ORDER.length : i }

/** 研究者关联的说明文本里直接写着对方的 id（"…连接到 c-padic-hodge"），替换成名称更可读 */
function readableLabel(label, other) {
  const s = String(label || '')
  return s.split(other.id).join(`「${other.name}」`)
}

export function locatorOf(node, item) {
  if (item?.locator) return item.locator
  if (node.researcher) return `${COLOPHON.roman}`
  const ch = CHAPTER_BY_KEY[node.family]
  return ch ? ch.roman : ''
}

function tierOf(node, item) {
  const t = item?.tier ? TIER_NAME[item.tier] : node.researcher ? '署名' : node.cluster ? '页边批注' : '诗句'
  const chKey = item?.chapter || node.family
  const ch = CHAPTER_BY_KEY[chKey]
  const where = ch ? `卷 ${ch.roman} · ${ch.name}` : node.researcher ? `卷末${COLOPHON.short}` : ''
  return [t, where].filter(Boolean).join(' · ')
}

function sizeFormula(img, w, h) {
  if (!w || !h) return
  let s = PANEL_FORMULA_EM / TEX_EM
  s = Math.min(s, PANEL_INNER_W / w, PANEL_FORMULA_MAX_H / h)
  img.style.width = `${Math.round(w * s)}px`
  // 只定宽、高随比例（max-width 收缩时不变形）
}

function section(zh, latin, ...children) {
  const s = el('section', 'mx-sec')
  const h = el('h3', 'mx-sec-head')
  h.append(text('span', 'mx-sec-zh', zh), text('span', 'mx-sec-la', latin))
  s.append(h, ...children)
  return s
}

function mdPara(t, cls) { const p = el('p', cls); p.append(...inlineMd(t)); return p }

function addRow(dl, k, v) {
  const dt = el('dt'); dt.textContent = k
  const dd = el('dd'); dd.textContent = v
  dl.append(dt, dd)
  return dd
}

function iconBtn(glyph, label, fn, cls = '') {
  const b = el('button', `mx-icon ${cls}`.trim())
  b.type = 'button'; b.textContent = glyph
  b.setAttribute('aria-label', label); b.title = label
  b.addEventListener('click', fn)
  return b
}

/** 笔法小样（铅笔色，画进 44×14 的小 canvas） */
export function strokeCanvas(style, seedKey = style, w = 44, h = 14) {
  const c = hiDpiCanvas(w, h, 'mx-stroke')
  const ctx = c.getContext('2d')
  try { strokeSample(ctx, 3, h / 2, w - 6, style, seedOf(String(seedKey)), { color: PALETTE.pencil, alpha: 0.9, width: 1.3 }) } catch { /* 笔触模块未就绪时留空 */ }
  c.setAttribute('aria-hidden', 'true')
  return c
}

/** 朱印小样 */
export function sealCanvas(char, size, seedKey = char) {
  const c = hiDpiCanvas(size, size, 'mx-seal')
  const ctx = c.getContext('2d')
  try { sealStamp(ctx, 2, 2, size - 4, char, seedOf(String(seedKey)), {}) } catch { /* 留空 */ }
  c.setAttribute('aria-hidden', 'true')
  return c
}

/** 按 devicePixelRatio 放大位图、CSS 尺寸不变；返回的 ctx 已缩放到 CSS px */
export function hiDpiCanvas(w, h, cls) {
  const dpr = Math.min(2, window.devicePixelRatio || 1)
  const c = document.createElement('canvas')
  c.className = cls
  c.width = Math.ceil(w * dpr); c.height = Math.ceil(h * dpr)
  c.style.width = `${w}px`; c.style.height = `${h}px`
  c.getContext('2d').setTransform(dpr, 0, 0, dpr, 0, 0)
  return c
}

function el(tag, cls) { const e = document.createElement(tag); if (cls) e.className = cls; return e }
function text(tag, cls, t) { const e = el(tag, cls); e.textContent = t; return e }
