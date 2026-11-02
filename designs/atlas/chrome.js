/**
 * designs/atlas/chrome.js — 外框（M5，SPEC §10）：标题框、搜索框 + 结果下拉、图例、缩放按钮、首次提示。
 *
 * 设计取舍：
 *   · 外框只是星图的"页边"，视觉上要克制：深色半透明底、细金线、楷体标题，不引入第三种饱和色。
 *   · 搜索列表**只由 'search' 事件驱动渲染**：输入框防抖后调 actions.search(q)，main 广播结果，
 *     这里再画列表。这样 __design.search() / 图例里的状态按钮 / 键入三条路径走的是同一份结果。
 *   · 所有数据文本（中文名、英文名、机构、报错）都用 textContent；公式交给 KaTeX 的 render（自带转义），
 *     不往 innerHTML 里拼任何数据。
 *   · 遮挡区：四个外框元素的屏幕矩形登记给 actions.setOccluder，标签避让会绕开它们。
 *     ResizeObserver 覆盖尺寸变化（下拉展开、图例折叠、字体加载），窗口 resize / 面板开关覆盖位置变化。
 *   · 窄屏判定用 matchMedia(SHEET_BREAKPOINT) 在 JS 里加 class，阈值只在 constants.js 定义一次，CSS 不写死数字。
 */
import katex from 'katex'
import 'katex/dist/katex.min.css'
import { state, on, actions } from './state.js'
import {
  COLOR, FONT_KAI, FONT_SERIF, FONT_SANS, PANEL_W, SHEET_BREAKPOINT, SHEET_VH,
  MAG_LABEL_L, NAME_EXTRA_L, RES_LABEL_L,
} from './constants.js'
import { glyphCanvas, drawStar } from './glyphs.js'
import { CONJECTURE_STATUS } from '../shared/kb.js'
import { isStructured } from './search.js'

/** 下拉最多显示的条数（SPEC §10.2） */
const MAX_ITEMS = 12
const DEBOUNCE_MS = 120
const BLUR_CLOSE_MS = 150
const HINT_DELAY_MS = 2000
/** 猜想状态在图例中的顺序（与 glyphs.js 的符号说明一致） */
const STATUS_ORDER = ['open', 'partial', 'proved', 'disproved', 'heuristic']
/** 搜索框为空时，下拉里给出的结构化查询示例（点按即搜） */
const EXAMPLES = ['status:open', 'is:conjecture importance:>0.85', 'family:curve', 'is:researcher', 'degree:>25']

/* ───────── 小工具 ───────── */
function el(tag, cls, text) {
  const e = document.createElement(tag)
  if (cls) e.className = cls
  if (text != null) e.textContent = text
  return e
}
const isTouch = typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches

/** 某节点的图标规格：优先用布局里的 body（有 mag），否则按节点字段推断 */
function glyphSpecOf(id) {
  const b = state.atlas?.bodies?.get(id)
  const n = b?.node || state.graph?.byId?.get(id)
  if (b?.kind === 'star') return { kind: 'star', mag: b.mag }
  if (b?.kind === 'dso' || n?.cluster) return { kind: 'dso', status: b?.status || n?.status || 'open' }
  if (b?.kind === 'researcher' || n?.researcher) return { kind: 'researcher' }
  return { kind: 'star', mag: 3 }
}
const kindOf = (n) => (n?.researcher ? 'researcher' : n?.cluster ? 'dso' : 'star')

/* KaTeX 小公式按 id 缓存（下拉每次键入都会重画 12 行，克隆缓存的 DOM 比重新排版便宜得多） */
const texCache = new Map()
function texNode(id, latex) {
  let node = texCache.get(id)
  if (!node) {
    node = document.createElement('span')
    try {
      katex.render(String(latex || ''), node, { displayMode: false, throwOnError: false, output: 'html', strict: 'ignore' })
    } catch {
      node.textContent = String(latex || '')
    }
    texCache.set(id, node)
  }
  return node.cloneNode(true)
}

/** 当前 L 下图例底部的动态说明（SPEC §10.3：k = 满足 MAG_LABEL_L[k−1] ≤ L 的最大 k） */
function magReach(L) {
  let k = 0, kn = 0
  for (let i = 0; i < MAG_LABEL_L.length; i++) {
    if (MAG_LABEL_L[i] <= L) k = i + 1
    if (MAG_LABEL_L[i] + NAME_EXTRA_L <= L) kn = i + 1
  }
  return { k, kn }
}

/* ═══════════════════════════════════════════════════════════════ */

/**
 * @param {{ title: HTMLElement, search: HTMLElement, legend: HTMLElement, zoom: HTMLElement, hint?: HTMLElement }} els
 * @returns {{ focusSearch(): void, closeSearch(): boolean }}
 */
export function initChrome({ title, search, legend, zoom, hint }) {
  const roots = [title, search, legend, zoom, hint].filter(Boolean)
  // 字体与尺寸常量以 CSS 变量形式交给 chrome.css（常量只在 constants.js 定义一次）
  for (const r of roots) {
    r.style.setProperty('--kai', FONT_KAI)
    r.style.setProperty('--serif', FONT_SERIF)
    r.style.setProperty('--sans', FONT_SANS)
  }
  zoom.style.setProperty('--panel-w', PANEL_W + 'px')
  zoom.style.setProperty('--sheet-h', (SHEET_VH * 100) + 'vh')

  buildTitle(title)
  const S = buildSearch(search)
  const G = buildLegend(legend, (q) => S.runQuery(q))
  buildZoom(zoom)
  if (hint) buildHint(hint)

  /* ── 窄屏 ── */
  const mq = typeof matchMedia === 'function' ? matchMedia(`(max-width: ${SHEET_BREAKPOINT - 0.02}px)`) : null
  const applyNarrow = (first) => {
    const narrow = !!mq?.matches
    for (const r of roots) r.classList.toggle('is-narrow', narrow)
    S.setNarrow(narrow)
    G.onNarrow(narrow, first)
    layout()
  }
  mq?.addEventListener?.('change', () => applyNarrow(false))

  /* ── 位置与遮挡区 ── */
  function layout() {
    // 搜索框紧贴标题框下方（标题高度随字体加载 / 窄屏换行而变，所以按实测算）
    const tr = title.getBoundingClientRect()
    if (tr.height > 0) search.style.top = Math.round(tr.bottom + 10) + 'px'
    S.fitDrop()
    updateOccluders()
  }
  function updateOccluders() {
    for (const [name, e] of [['title', title], ['search', search], ['legend', legend], ['zoom', zoom]]) {
      const r = e.getBoundingClientRect()
      actions.setOccluder(name, r.width > 0 && r.height > 0
        ? { x: r.left, y: r.top, w: r.width, h: r.height }
        : null)
    }
  }
  S.onLayout(updateOccluders)
  G.onLayout(updateOccluders)

  if (typeof ResizeObserver === 'function') {
    const ro = new ResizeObserver(() => layout())
    for (const e of [title, search, legend, zoom]) ro.observe(e)
  }
  addEventListener('resize', layout)
  on('resize', layout)
  // 面板开关会让缩放按钮左移（CSS 过渡 220ms）：过渡结束后再量一次
  zoom.addEventListener('transitionend', updateOccluders)
  on('select', () => { setTimeout(updateOccluders, 280) })
  document.fonts?.ready?.then(layout).catch(() => {})

  applyNarrow(true)

  return {
    focusSearch: () => S.focus(),
    closeSearch: () => S.close(),
  }
}

/* ───────── §10.1 标题框 ───────── */
function buildTitle(root) {
  root.replaceChildren()
  root.setAttribute('aria-label', '公式星图 · Atlas Coelestis')
  for (const c of ['tl', 'tr', 'bl', 'br']) root.append(el('span', `at-corner at-${c}`))
  const h = el('h1', 'at-name', '公式星图')
  const latin = el('p', 'at-latin', 'ATLAS COELESTIS · FORMULARUM')
  const rule = el('span', 'at-rule')
  rule.setAttribute('aria-hidden', 'true')
  // 统计从 graph 实算，不写死（知识库增删条目后标题自动跟上）
  const nodes = state.graph?.nodes || []
  let stars = 0, dsos = 0, res = 0
  for (const n of nodes) { if (n.researcher) res++; else if (n.cluster) dsos++; else stars++ }
  const stats = el('p', 'at-stats')
  const parts = [[stars, '恒星'], [dsos, '深空天体'], [res, '研究者'], [state.graph?.links?.length || 0, '关联']]
  parts.forEach(([num, label], i) => {
    if (i) stats.append(el('span', 'at-sep', ' · '))
    stats.append(el('span', 'at-num', String(num)), document.createTextNode(' ' + label))
  })
  root.append(h, latin, rule, stats)
}

/* ───────── §10.2 搜索 ───────── */
function buildSearch(root) {
  root.replaceChildren()
  root.setAttribute('role', 'search')
  const box = el('div', 'as-box')
  const icon = searchIcon()
  const input = el('input', 'as-input')
  input.type = 'search'
  input.placeholder = '搜索公式、名称或 family:curve status:open …'
  input.autocomplete = 'off'
  input.spellcheck = false
  input.setAttribute('aria-label', '搜索星图')
  input.setAttribute('role', 'combobox')
  input.setAttribute('aria-autocomplete', 'list')
  input.setAttribute('aria-expanded', 'false')
  input.setAttribute('aria-controls', 'atlas-search-list')
  const kbd = el('kbd', 'as-kbd', '/')
  kbd.title = '按 / 或 Ctrl+K 聚焦搜索'
  kbd.setAttribute('aria-hidden', 'true')
  box.append(icon, input, kbd)

  const drop = el('div', 'as-drop')
  drop.hidden = true
  const err = el('p', 'as-error')
  err.setAttribute('role', 'alert')
  err.hidden = true
  const list = el('ul', 'as-list')
  list.id = 'atlas-search-list'
  list.setAttribute('role', 'listbox')
  list.setAttribute('aria-label', '搜索结果')
  const empty = el('p', 'as-empty', '没有匹配的星辰')
  empty.hidden = true
  const help = buildHelp()
  help.hidden = true
  const foot = el('p', 'as-foot')
  foot.hidden = true
  drop.append(err, list, empty, help, foot)
  root.append(box, drop)

  let open = false, active = -1, hits = [], shown = [], query = ''
  let debounce = 0, blurTimer = 0, layoutCb = () => {}
  /* 输入：防抖 120ms → actions.search；清空立即执行 */
  input.addEventListener('input', () => {
    clearTimeout(debounce)
    const q = input.value
    if (!q.trim()) { debounce = 0; actions.search(''); return }
    debounce = setTimeout(() => { debounce = 0; actions.search(q) }, DEBOUNCE_MS)
  })
  input.addEventListener('focus', () => {
    clearTimeout(blurTimer)
    // 已有结果时展开结果；输入为空时展开语法提示
    render(lastError)
    setOpen(true)
  })
  input.addEventListener('blur', () => {
    clearTimeout(blurTimer)
    blurTimer = setTimeout(() => setOpen(false), BLUR_CLOSE_MS)
  })
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      if (!open) setOpen(true)
      if (!shown.length) return
      const d = e.key === 'ArrowDown' ? 1 : -1
      setActive(active < 0 ? (d > 0 ? 0 : shown.length - 1) : (active + d + shown.length) % shown.length, true)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      // 防抖还没触发就按了 Enter：先同步搜一次，保证选中的是当前输入的结果
      if (debounce) { clearTimeout(debounce); debounce = 0; actions.search(input.value) }
      const id = shown[active] ?? hits[0]
      if (id) choose(id)
    } else if (e.key === 'Escape') {
      // Esc 语义（SPEC §10.2）：先收起列表；再按清空输入；输入已空时失焦，之后的 Esc 交给 main 取消选中。
      // main 的 window 级 keydown 在冒泡到 window 时才收到同一事件（它会调 closeSearch()）；
      // 这里处理过的就 stopPropagation，避免一次 Esc 被两边各算一次。
      e.preventDefault()   // 阻止 type=search 原生的"Esc 清空"，由下面统一处理
      if (open && hasContent()) setOpen(false)
      else if (input.value) { input.value = ''; clearTimeout(debounce); debounce = 0; actions.search('') }
      else { input.blur(); return }   // 不拦截：main 的 closeSearch() 返回 false → 取消选中
      e.stopPropagation()
    }
  })

  /* 列表项：pointerdown 阻止默认，避免输入框先失焦把列表收掉 */
  list.addEventListener('pointerdown', (e) => { if (e.target.closest('.as-item')) e.preventDefault() })
  list.addEventListener('click', (e) => {
    const li = e.target.closest('.as-item')
    if (li) choose(li.dataset.id)
  })
  list.addEventListener('pointermove', (e) => {
    const li = e.target.closest('.as-item')
    if (li) { const i = shown.indexOf(li.dataset.id); if (i !== active) setActive(i, false) }
  })
  list.addEventListener('pointerleave', () => { if (active >= 0) setActive(-1, false) })
  help.addEventListener('pointerdown', (e) => { if (e.target.closest('button')) e.preventDefault() })
  help.addEventListener('click', (e) => {
    const b = e.target.closest('button[data-q]')
    if (b) runQuery(b.dataset.q)
  })
  // 点在搜索框以外的任何地方 → 收起（输入框没有焦点时也成立，例如结果由 __design.search 打开）
  document.addEventListener('pointerdown', (e) => { if (open && !root.contains(e.target)) setOpen(false) }, true)

  /* 结果由 'search' 事件驱动（SPEC §10.2） */
  let lastError
  on('search', (p) => {
    query = String(p?.query ?? '')
    hits = Array.isArray(p?.hits) ? p.hits : []
    lastError = p?.error
    // 外部发起的搜索（__design.search、图例按钮）把查询同步回输入框；用户正在键入时不覆盖
    if (document.activeElement !== input && input.value !== query) input.value = query
    render(lastError)
    if (query.trim()) setOpen(true)
    else if (document.activeElement !== input) setOpen(false)
  })

  /** 下拉有没有东西可显示：有查询，或者输入框有焦点（显示语法提示） */
  function hasContent() { return !!query.trim() || document.activeElement === input }

  function render(error) {
    const q = query.trim()
    err.hidden = !error
    err.textContent = error ? '查询有误：' + error : ''
    if (active >= 0) setActive(-1, false)
    list.replaceChildren()
    input.removeAttribute('aria-activedescendant')
    shown = error ? [] : hits.slice(0, MAX_ITEMS)
    const byId = state.graph?.byId
    shown = shown.filter((id) => byId?.get(id))
    shown.forEach((id, i) => list.append(itemOf(byId.get(id), i)))
    list.hidden = !shown.length
    help.hidden = !!q
    empty.hidden = !(q && !error && hits.length === 0)
    foot.hidden = !(q && !error && hits.length > 0)
    if (!foot.hidden) {
      const head = (isStructured(q) ? '结构化查询 · ' : '') + `共 ${hits.length} 条`
      const more = hits.length > MAX_ITEMS ? `，显示前 ${MAX_ITEMS} 条` : ''
      foot.textContent = `${head}${more} · ↑↓ 选择 · Enter 定位`
    }
    layoutCb()
  }

  function itemOf(n, i) {
    const li = el('li', 'as-item')
    li.id = 'atlas-search-opt-' + i
    li.dataset.id = n.id
    li.setAttribute('role', 'option')
    li.setAttribute('aria-selected', 'false')
    const kind = kindOf(n)
    li.classList.add('k-' + kind)
    const g = el('span', 'as-glyph')
    g.append(glyphCanvas(glyphSpecOf(n.id), 18))
    const txt = el('span', 'as-text')
    const line = el('span', 'as-line')
    line.append(el('span', 'as-name', n.name || n.id))
    if (n.en && n.en !== n.name) line.append(el('span', 'as-en', n.en))
    txt.append(line)
    if (kind === 'researcher') {
      // 研究者的 latex 只是 \text{姓名}，重复无益，改显示机构
      if (n.institution) txt.append(el('span', 'as-sub', n.institution))
    } else if (n.latex) {
      const f = el('span', 'as-tex')
      f.setAttribute('aria-hidden', 'true')
      f.append(texNode(n.id, n.latex))
      txt.append(f)
    }
    li.append(g, txt)
    return li
  }
  function setActive(i, fromKeyboard) {
    const items = list.children
    if (active >= 0 && items[active]) { items[active].classList.remove('is-active'); items[active].setAttribute('aria-selected', 'false') }
    active = i
    if (i >= 0 && items[i]) {
      items[i].classList.add('is-active'); items[i].setAttribute('aria-selected', 'true')
      input.setAttribute('aria-activedescendant', items[i].id)
      if (fromKeyboard) items[i].scrollIntoView({ block: 'nearest' })
      actions.hoverPreview(shown[i])
    } else {
      active = -1
      input.removeAttribute('aria-activedescendant')
      actions.hoverPreview(null)
    }
  }

  function setOpen(v) {
    v = !!v && hasContent()
    if (v === open) return
    open = v
    drop.hidden = !v
    root.classList.toggle('is-open', v)
    input.setAttribute('aria-expanded', String(v))
    if (!v && active >= 0) setActive(-1, false)
    layoutCb()
  }

  function choose(id) {
    clearTimeout(blurTimer)
    setOpen(false)
    actions.hoverPreview(null)
    // 失焦：让 + − 0 等地图快捷键立刻可用（输入框有焦点时它们不生效）
    input.blur()
    actions.select(id)
  }

  function runQuery(q) {
    clearTimeout(debounce); debounce = 0
    input.value = q
    actions.search(q)
    input.focus()
  }

  /** 下拉最大高度：不超出视口底部（列表内部滚动） */
  function fitDrop() {
    const r = box.getBoundingClientRect()
    drop.style.maxHeight = Math.round(Math.max(160, innerHeight - r.bottom - 24)) + 'px'
  }

  return {
    focus() { clearTimeout(blurTimer); input.focus(); input.select() },
    /** 收起下拉；原本是展开的返回 true（main 的 Esc 先调它，返回 false 才取消选中） */
    close() {
      clearTimeout(blurTimer)
      if (!open) return false
      setOpen(false)
      return true
    },
    runQuery,
    fitDrop,
    /** 窄屏 placeholder 缩短（完整版在 300px 宽里会被截断） */
    setNarrow(n) { input.placeholder = n ? '搜索公式、名称或 status:open …' : '搜索公式、名称或 family:curve status:open …' },
    onLayout(cb) { layoutCb = cb },
  }
}

function buildHelp() {
  const help = el('div', 'as-help')
  help.append(el('p', 'as-help-title', '输入名称、英文或公式片段；也可以按字段筛选：'))
  const row = el('div', 'as-chips')
  for (const q of EXAMPLES) {
    const b = el('button', 'as-chip', q)
    b.type = 'button'
    b.dataset.q = q
    b.tabIndex = -1
    row.append(b)
  }
  help.append(row, el('p', 'as-help-note', '空格 = 且 · 大写 OR = 或 · 前缀 - = 非 · 字段 family status field importance degree year …'))
  return help
}

/** 放大镜图标（小 canvas 画，金线，与星图线宽一致） */
function searchIcon() {
  const size = 16, dpr = Math.min(2, (typeof devicePixelRatio === 'number' && devicePixelRatio) || 1)
  const c = document.createElement('canvas')
  c.width = size * dpr; c.height = size * dpr
  c.style.width = size + 'px'; c.style.height = size + 'px'
  c.className = 'as-icon'
  c.setAttribute('aria-hidden', 'true')
  const ctx = c.getContext('2d')
  ctx.scale(dpr, dpr)
  ctx.strokeStyle = COLOR.ringDim
  ctx.lineWidth = 1.2
  ctx.beginPath(); ctx.arc(6.6, 6.6, 4.6, 0, Math.PI * 2); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(10, 10); ctx.lineTo(14, 14); ctx.stroke()
  // 镜心一颗小星：呼应"在星图里找星"
  drawStar(ctx, 6.6, 6.6, 1.1, { mag: 6, halo: false })
  return c
}
/* ───────── §10.3 图例 ───────── */
function buildLegend(root, runQuery) {
  root.replaceChildren()
  const head = el('div', 'al-head')
  const titleTxt = el('h2', 'al-title')
  titleTxt.append(document.createTextNode('图例'), el('span', 'al-title-latin', ' · LEGENDA'))

  // Theme switcher button
  const themeBtn = el('button', 'al-theme')
  themeBtn.type = 'button'
  themeBtn.textContent = '🌙'
  themeBtn.title = '切换主题'
  themeBtn.setAttribute('aria-label', '切换主题')

  const toggle = el('button', 'al-toggle')
  toggle.type = 'button'
  toggle.setAttribute('aria-controls', 'atlas-legend-body')
  head.append(titleTxt, themeBtn, toggle)

  const body = el('div', 'al-body')
  body.id = 'atlas-legend-body'

  /* 星等 1–6：与地图上同一个 drawStar（经 glyphCanvas） */
  const magSec = el('div', 'al-sec')
  magSec.append(el('p', 'al-cap', '恒星 · 定理'))
  const mags = el('div', 'al-mags')
  const magCells = []
  for (let m = 1; m <= 6; m++) {
    const cell = el('span', 'al-mag')
    cell.append(glyphCanvas({ kind: 'star', mag: m }, 20), el('span', 'al-mag-n', String(m)))
    cell.title = `${m} 等星`
    mags.append(cell)
    magCells.push(cell)
  }
  const magNote = el('p', 'al-note', '星等 = 重要度排位，1 等最亮')
  magSec.append(mags, magNote)

  /* 深空天体：5 种状态，数量实算（为 0 的也列出）；点按 = 搜索该状态 */
  const counts = Object.fromEntries(STATUS_ORDER.map((s) => [s, 0]))
  for (const n of state.graph?.nodes || []) if (n.cluster && n.status in counts) counts[n.status]++
  const dsoSec = el('div', 'al-sec')
  dsoSec.append(el('p', 'al-cap', '深空天体 · 猜想'))
  const dl = el('ul', 'al-dsos')
  for (const s of STATUS_ORDER) {
    const li = el('li')
    const b = el('button', 'al-dso')
    b.type = 'button'
    b.title = `${CONJECTURE_STATUS[s]?.hint || ''}（点按搜索 status:${s}）`
    if (!counts[s]) b.classList.add('is-zero')
    b.append(glyphCanvas({ kind: 'dso', status: s }, 18), el('span', 'al-dso-name', CONJECTURE_STATUS[s]?.name || s),
      el('span', 'al-count', String(counts[s])))
    b.addEventListener('click', () => runQuery('status:' + s))
    li.append(b)
    dl.append(li)
  }
  dsoSec.append(dl)

  /* 研究者 + 线型 */
  const lineSec = el('div', 'al-sec')
  lineSec.append(el('p', 'al-cap', '研究者与线型'))
  const lines = el('ul', 'al-lines')
  const row = (sample, text) => { const li = el('li', 'al-line'); li.append(sample, el('span', null, text)); lines.append(li) }
  row(glyphCanvas({ kind: 'researcher' }, 18), '研究者（环外刻度与名字）')
  row(lineSample('figure'), '星座连线')
  row(lineSample('boundary'), '星座边界')
  row(lineSample('theorem'), '关联 · 定理')
  row(lineSample('conj'), '关联 · 猜想')
  row(lineSample('researcher'), '研究者引导线')
  lineSec.append(lines)

  /* 动态提示：当前 L 下显示到几等星的公式（订阅 'view'） */
  const live = el('p', 'al-live')
  live.setAttribute('aria-live', 'off')
  body.append(magSec, dsoSec, lineSec)
  root.append(head, body, live)

  // Theme cycling: dark → light → sepia → dark
  const themes = ['dark', 'light', 'sepia']
  let currentTheme = 0
  const themeIcons = { dark: '🌙', light: '☀️', sepia: '📜' }

  themeBtn.addEventListener('click', () => {
    currentTheme = (currentTheme + 1) % themes.length
    const theme = themes[currentTheme]
    document.body.dataset.theme = theme
    themeBtn.textContent = themeIcons[theme]
    themeBtn.title = `当前: ${theme === 'dark' ? '暗色' : theme === 'light' ? '亮色' : '羊皮纸'} 主题`
    // Trigger theme change event
    actions.setTheme?.(theme)
  })

  let lastText = ''
  const updateLive = () => {
    const L = Number.isFinite(state.L) ? state.L : 0
    const { k, kn } = magReach(L)
    let text, sub = ''
    if (!k) text = L >= RES_LABEL_L ? '仅星点与研究者名 · 拉近显示公式' : '仅星点 · 拉近显示公式'
    else { text = `当前显示到 mag ≤ ${k} 的公式`; if (kn) sub = `mag ≤ ${kn} 另带中文名` }
    if (text + sub !== lastText) {
      lastText = text + sub
      live.textContent = text
      if (sub) live.append(el('span', 'al-live-sub', sub))
      magCells.forEach((c, i) => c.classList.toggle('is-on', i < k))
    }
  }
  on('view', updateLive)
  on('resize', updateLive)
  on('ready', updateLive)
  updateLive()

  let collapsed = false, userSet = false, layoutCb = () => {}
  const setCollapsed = (v) => {
    collapsed = !!v
    root.classList.toggle('is-collapsed', collapsed)
    body.hidden = collapsed
    toggle.textContent = collapsed ? '展开' : '收起'
    toggle.setAttribute('aria-expanded', String(!collapsed))
    toggle.setAttribute('aria-label', collapsed ? '展开图例' : '收起图例')
    layoutCb()
  }
  toggle.addEventListener('click', () => { userSet = true; setCollapsed(!collapsed) })
  // 窄屏点标题行也能展开（按钮太小不好点）
  head.addEventListener('click', (e) => { if (e.target === head || e.target.closest('.al-title')) { userSet = true; setCollapsed(!collapsed) } })
  setCollapsed(false)

  return {
    /** 窄屏默认折叠；用户手动开合过之后不再自动改 */
    onNarrow(narrow, first) { if (first || !userSet) setCollapsed(narrow) },
    onLayout(cb) { layoutCb = cb },
  }
}

/** 图例线型样例：与 render 用同一组颜色 / 虚线规格（屏幕 px） */
function lineSample(kind, w = 34, h = 14) {
  const dpr = Math.min(2, (typeof devicePixelRatio === 'number' && devicePixelRatio) || 1)
  const c = document.createElement('canvas')
  c.width = Math.round(w * dpr); c.height = Math.round(h * dpr)
  c.style.width = w + 'px'; c.style.height = h + 'px'
  c.className = 'al-sample'
  c.setAttribute('aria-hidden', 'true')
  const ctx = c.getContext('2d')
  ctx.scale(dpr, dpr)
  ctx.lineWidth = 1
  ctx.lineCap = 'round'
  const y = h / 2
  if (kind === 'figure') {
    // 两颗星之间的实线，两端留 3px 空隙（同 render 的规则）
    ctx.strokeStyle = COLOR.figure
    ctx.beginPath(); ctx.moveTo(4 + 2.6 + 3, y + 3); ctx.lineTo(w - 4 - 2 - 3, y - 3); ctx.stroke()
    drawStar(ctx, 4, y + 3.5, 2.6, { mag: 4, halo: false })
    drawStar(ctx, w - 4, y - 3.5, 2, { mag: 5, halo: false })
  } else if (kind === 'boundary') {
    // IAU 式阶梯边界：沿网格线的折线 + [5,4] 虚线
    ctx.strokeStyle = COLOR.boundary
    ctx.setLineDash([5, 4])
    ctx.lineCap = 'butt'
    ctx.beginPath(); ctx.moveTo(1, h - 3); ctx.lineTo(13, h - 3); ctx.lineTo(13, 3); ctx.lineTo(w - 1, 3); ctx.stroke()
  } else if (kind === 'theorem' || kind === 'conj') {
    ctx.strokeStyle = kind === 'theorem' ? COLOR.arcTheorem : COLOR.arcConj
    ctx.lineWidth = 1.3
    ctx.beginPath(); ctx.moveTo(2, h - 3); ctx.quadraticCurveTo(w / 2, -3, w - 2, h - 3); ctx.stroke()
  } else {
    ctx.strokeStyle = COLOR.arcResearcher
    ctx.setLineDash([3, 3])
    ctx.beginPath(); ctx.moveTo(2, y); ctx.lineTo(w - 2, y); ctx.stroke()
  }
  return c
}
/* ───────── §10.4 缩放按钮 ───────── */
function buildZoom(root) {
  root.replaceChildren()
  root.setAttribute('role', 'group')
  root.setAttribute('aria-label', '缩放')
  const defs = [
    ['+', '放大', '放大（+）', () => actions.zoomBy(2)],
    ['−', '缩小', '缩小（−）', () => actions.zoomBy(0.5)],
    ['⌂', '全图', '全图（0）', () => actions.resetView()],
  ]
  for (const [glyph, label, tip, fn] of defs) {
    const b = el('button', 'az-btn', glyph)
    b.type = 'button'
    b.setAttribute('aria-label', label)
    b.title = tip
    b.addEventListener('click', fn)
    if (glyph === '⌂') b.classList.add('az-home')
    root.append(b)
  }
}

/* ───────── §10.5 首次提示 ───────── */
function buildHint(root) {
  root.replaceChildren()
  root.textContent = isTouch ? '双指缩放 · 拖动平移 · 轻点星辰查看' : '滚轮缩放 · 拖拽平移 · 点击星辰查看'
  root.setAttribute('aria-hidden', 'true')
  // 只有用户真正动过之后才淡出：启动时 main 自己也会发一次 'view'，所以与基准视图比较，而不是"收到就算"
  let phase = 'pending', base = null
  const snap = () => ({ ...state.view })
  const moved = () => {
    const v = state.view
    if (!base || !v) return false
    return Math.abs(Math.log((v.zoom || 1) / (base.zoom || 1))) > 0.02 ||
      Math.hypot(v.cx - base.cx, v.cy - base.cy) * (v.zoom || 1) > 3
  }
  const gone = () => {
    if (phase === 'gone') return
    phase = 'gone'
    root.classList.remove('is-shown')
    offView(); offSel()
  }
  const offView = on('view', () => { if (!base) base = snap(); else if (moved()) gone() })
  const offSel = on('select', (id) => { if (id) gone() })
  setTimeout(() => {
    if (phase !== 'pending') return
    if (!base) base = snap()
    if (state.selected || moved()) { gone(); return }
    phase = 'shown'
    base = snap()
    root.classList.add('is-shown')
  }, HINT_DELAY_MS)
}
