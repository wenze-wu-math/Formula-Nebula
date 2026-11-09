/**
 * designs/map/src/ui/search.js — 左上搜索框 + 建议下拉 + 命中计数条 + 工具按钮（SPEC §9.4）。
 *
 * 取舍：
 *  · 下拉用 WAI-ARIA combobox 模式（input role=combobox + listbox + aria-activedescendant），
 *    键盘焦点始终留在输入框里，上下键只移动"高亮项"，这样输入与选择不会互相抢焦点。
 *  · 下拉绝对定位盖在命中条/工具行之上（不把工具行挤下去），所以避让矩形里它是单独一项。
 *  · 点击建议项用 mousedown.preventDefault 阻止输入框失焦，否则 blur 先关掉下拉、click 落空。
 *  · actions.suggest/search 是编排模块提供的；占位期它们返回 []，这里全部防御式调用。
 */
import { actions, bus } from '../state.js'
import { COUNTRY_COLORS } from '../constants.js'
import { h, placeGlyph, swatch, glyphCanvas, drawPort } from './glyphs.js'
import { placeOf, shortWhere, placeColors } from './describe.js'

const DEBOUNCE_MS = 80

export function createSearch(root, { graph, world, onToggleLegend, onToggleRegister, onChange }) {
  root.textContent = ''

  /* ── 输入框 ── */
  const box = h('div', 'ui-card ui-searchbox')
  const icon = svgIcon('M10.5 4a6.5 6.5 0 1 1 0 13a6.5 6.5 0 0 1 0-13zM15.4 15.4L20 20', 'ui-search-ico')
  const input = document.createElement('input')
  input.type = 'search'
  input.className = 'ui-search-input'
  input.placeholder = '搜索定理、猜想、研究者… 例：Hodge / 层上同调 / status:open'
  input.autocomplete = 'off'
  input.spellcheck = false
  input.setAttribute('role', 'combobox')
  input.setAttribute('aria-label', '搜索地图')
  input.setAttribute('aria-autocomplete', 'list')
  input.setAttribute('aria-expanded', 'false')
  input.setAttribute('aria-controls', 'ui-suggest')
  const kbd = h('kbd', 'ui-kbd', '/')
  kbd.title = '按 / 聚焦搜索'
  box.append(icon, input, kbd)

  /* ── 建议下拉 ── */
  const list = h('div', 'ui-card ui-suggest')
  list.id = 'ui-suggest'
  list.setAttribute('role', 'listbox')
  list.setAttribute('aria-label', '搜索建议')
  list.hidden = true

  /* ── 命中条 ── */
  const hits = h('div', 'ui-hits')
  hits.hidden = true
  hits.setAttribute('role', 'status')
  const hitsText = h('span', 'ui-hits-text')
  const hitsClear = h('button', 'ui-linkbtn', '清除')
  hitsClear.type = 'button'
  hitsClear.addEventListener('click', () => { safe(() => actions.clearSearch()); input.value = ''; renderHits('', []) })
  hits.append(hitsText, hitsClear)

  /* ── 工具按钮 ── */
  const tools = h('div', 'ui-tools')
  const bLegend = toolBtn('图例', legendIcon(), '展开或折叠图例')
  const bReg = toolBtn('探险者名录', glyphCanvas(14, 14, (c) => drawPort(c, 7, 7, 0.95)), '打开探险者名录（24 位研究者）')
  const bHome = toolBtn('全图', svgIcon('M4 11.5L12 5l8 6.5M6.5 10v8.5h11V10', 'ui-tool-ico'), '回到全图')
  bLegend.addEventListener('click', () => onToggleLegend())
  bReg.addEventListener('click', () => onToggleRegister())
  bHome.addEventListener('click', () => safe(() => actions.home()))
  tools.append(bLegend, bReg, bHome)

  root.append(box, list, hits, tools)

  /* ── 建议逻辑 ── */
  let items = []        // 当前下拉里可选的 {id, el}
  let active = -1
  let timer = 0
  // 这里原本有一个 `lastQ` 变量：只在 refresh() 里赋一次值，从未被读取，
  // 属于纯粹的死状态（改名成 _lastQ 只会把警告藏起来，不一致仍然存在）。
  // 直接删除，而不是加下划线前缀。

  function openList() {
    if (list.hidden) { list.hidden = false; input.setAttribute('aria-expanded', 'true'); onChange() }
  }
  function closeList() {
    clearTimeout(timer)
    if (list.hidden) return false
    list.hidden = true
    input.setAttribute('aria-expanded', 'false')
    input.removeAttribute('aria-activedescendant')
    active = -1
    onChange()
    return true
  }

  function refresh() {
    const q = input.value.trim()
    if (!q) { closeList(); return }
    let res = []
    try { res = actions.suggest(q, 12) } catch (e) { console.warn('[map/ui] suggest 出错', e) }
    if (!Array.isArray(res)) res = []
    list.textContent = ''
    items = []
    active = -1
    input.removeAttribute('aria-activedescendant')
    for (const r of res) {
      const id = r && (r.id ?? r)
      const place = placeOf(world, graph, id)
      if (!place) continue
      const el = suggestRow(place, items.length)
      const idx = items.length
      el.addEventListener('mousedown', (e) => e.preventDefault())
      el.addEventListener('mouseenter', () => setActive(idx, false))
      el.addEventListener('click', () => choose(idx))
      items.push({ id: place.id, el })
      list.append(el)
    }
    if (!items.length) {
      const hint = h('div', 'ui-suggest-empty')
      hint.append(h('span', null, '没有直接匹配的名字。按 '), h('kbd', 'ui-kbd', 'Enter'), h('span', null, ' 按条件检索全图'))
      const syn = h('div', 'ui-suggest-syntax', '支持 status:open · family:scheme · year:>1990 · A OR B · -排除')
      list.append(hint, syn)
    } else {
      const foot = h('div', 'ui-suggest-foot', '↑↓ 选择 · Enter 打开 · Esc 关闭 · 无高亮时 Enter = 全图检索')
      list.append(foot)
    }
    openList()
  }

  function suggestRow(place, i) {
    const n = place.node
    const row = h('div', 'ui-suggest-row')
    row.id = `ui-sg-${i}`
    row.setAttribute('role', 'option')
    row.setAttribute('aria-selected', 'false')
    const g = h('span', 'ui-suggest-glyph'); g.append(placeGlyph(place, 14))
    const main = h('span', 'ui-suggest-main')
    const l1 = h('span', 'ui-suggest-l1')
    l1.append(h('span', 'ui-suggest-name', n.name), h('span', 'ui-suggest-en', n.en && n.en !== n.name ? n.en : ''))
    const l2 = h('span', 'ui-suggest-l2')
    const col = placeColors(place)
    if (place.kind === 'city') l2.append(swatch(COUNTRY_COLORS[place.country]?.land, COUNTRY_COLORS[place.country]?.ink, 'ui-swatch ui-swatch-sm'))
    else if (place.kind === 'island') l2.append(swatch(col.fill, col.coast, 'ui-swatch ui-swatch-sm'))
    l2.append(h('span', null, shortWhere(place)))
    main.append(l1, l2)
    row.append(g, main)
    return row
  }

  function setActive(i, scroll = true) {
    if (active >= 0 && items[active]) { items[active].el.classList.remove('is-active'); items[active].el.setAttribute('aria-selected', 'false') }
    active = i
    if (i >= 0 && items[i]) {
      const el = items[i].el
      el.classList.add('is-active'); el.setAttribute('aria-selected', 'true')
      input.setAttribute('aria-activedescendant', el.id)
      if (scroll) el.scrollIntoView({ block: 'nearest' })
    } else input.removeAttribute('aria-activedescendant')
  }

  function choose(i) {
    const it = items[i]
    if (!it) return
    const n = graph.byId.get(it.id)
    input.value = n ? n.name : input.value
    closeList()
    input.blur()
    safe(() => actions.select(it.id))
  }

  function submit() {
    const q = input.value.trim()
    closeList()
    if (!q) { safe(() => actions.clearSearch()); renderHits('', []); return }
    const before = searchEvents
    let ids = []
    try { ids = actions.search(q) } catch (e) { console.warn('[map/ui] search 出错', e) }
    // 编排模块会 emit 'search'；占位实现不会 —— 那时用返回值自己刷新命中条
    if (searchEvents === before) renderHits(q, Array.isArray(ids) ? ids : [])
    if (Array.isArray(ids) && ids.length > 0) input.blur()
  }

  input.addEventListener('input', () => {
    clearTimeout(timer)
    if (!input.value.trim()) { closeList(); return }
    timer = setTimeout(refresh, DEBOUNCE_MS)
  })
  input.addEventListener('focus', () => { if (input.value.trim()) refresh() })
  input.addEventListener('blur', () => { closeList() })
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      if (list.hidden) { if (input.value.trim()) refresh(); return }
      if (!items.length) return
      const d = e.key === 'ArrowDown' ? 1 : -1
      // 在 [-1, len-1] 之间循环：走过末项回到"无高亮"（-1，此时 Enter = 全图检索），与常见 combobox 一致
      let next = active + d
      if (next >= items.length) next = -1
      else if (next < -1) next = items.length - 1
      setActive(next)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (!list.hidden && active >= 0) choose(active)
      else { clearTimeout(timer); submit() }
    } else if (e.key === 'Escape') {
      // SPEC §10.4：输入框内的 Esc 由 UI 处理且不冒泡到 interact —— 先清空并关下拉，再按一次失焦
      e.preventDefault()
      e.stopPropagation()
      if (input.value || !list.hidden) { input.value = ''; closeList() }
      else input.blur()
    }
    e.stopPropagation()   // 方向键/字母不应驱动地图平移
  })

  /* "/" 聚焦：编排模块的键盘层会调 focusSearch；若它没 preventDefault，"/" 会被打进输入框 —— 这里吞掉 */
  let focusAt = -1
  input.addEventListener('beforeinput', (e) => {
    if (e.data === '/' && performance.now() - focusAt < 80) e.preventDefault()
  })

  function focus() {
    focusAt = performance.now()
    input.focus()
    input.select()
  }

  /* ── 命中条（来自 'search' 事件） ── */
  let searchEvents = 0
  function renderHits(query, ids) {
    const n = ids.length
    if (!query) { if (!hits.hidden) { hits.hidden = true; onChange() } return }
    hits.classList.toggle('is-empty', n === 0)
    if (n === 0) { hitsText.textContent = `没有找到「${query}」` }
    else if (n === 1) { hitsText.textContent = '命中 1 处 · 已为你打开' }
    else { hitsText.textContent = `命中 ${n} 处 · 已在地图上以金圈标出` }
    if (hits.hidden) { hits.hidden = false }
    onChange()
  }
  bus.on('search', (p) => {
    searchEvents++
    const query = (p && p.query) || ''
    const ids = (p && Array.isArray(p.ids)) ? p.ids : []
    // 外部（深链 / __design.search）发起的检索，把查询写回输入框
    if (document.activeElement !== input) input.value = query
    renderHits(query, ids)
  })

  function setToolState({ legend, register }) {
    if (legend != null) bLegend.setAttribute('aria-pressed', String(!!legend))
    if (register != null) bReg.setAttribute('aria-pressed', String(!!register))
  }

  return {
    focus,
    closeList,
    isOpen: () => !list.hidden,
    suggestEl: list,
    input,
    setToolState,
  }
}

function toolBtn(label, iconEl, title) {
  const b = h('button', 'ui-btn ui-tool')
  b.type = 'button'
  b.title = title
  if (iconEl) b.append(iconEl)
  b.append(h('span', null, label))
  return b
}

function legendIcon() {
  return glyphCanvas(14, 14, (c) => {
    const cols = ['#ecdcb4', '#f2c7b8', '#bfe3d3']
    cols.forEach((col, i) => {
      c.fillStyle = col; c.strokeStyle = 'rgba(80,64,40,.55)'; c.lineWidth = 0.8
      c.fillRect(1.5, 1.5 + i * 4.2, 4, 3.2); c.strokeRect(1.5, 1.5 + i * 4.2, 4, 3.2)
      c.fillStyle = '#7a7468'; c.fillRect(7.5, 2.6 + i * 4.2, 5.5, 1.1)
    })
  })
}

/** 极简描线 SVG 图标（路径常量，不含数据） */
export function svgIcon(d, cls) {
  const NS = 'http://www.w3.org/2000/svg'
  const s = document.createElementNS(NS, 'svg')
  s.setAttribute('viewBox', '0 0 24 24')
  s.setAttribute('class', cls || 'ui-ico')
  s.setAttribute('aria-hidden', 'true')
  const p = document.createElementNS(NS, 'path')
  p.setAttribute('d', d)
  p.setAttribute('fill', 'none')
  p.setAttribute('stroke', 'currentColor')
  p.setAttribute('stroke-width', '2')
  p.setAttribute('stroke-linecap', 'round')
  p.setAttribute('stroke-linejoin', 'round')
  s.append(p)
  return s
}

function safe(fn) {
  try {
    const r = fn()
    if (r && typeof r.catch === 'function') r.catch((e) => console.warn('[map/ui] action 失败', e))
    return r
  } catch (e) { console.warn('[map/ui] action 失败', e) }
}
