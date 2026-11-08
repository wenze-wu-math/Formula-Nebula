/**
 * designs/map/src/ui/panel.js — 右侧详情面板（窄屏为底部抽屉），SPEC §9.7。
 *
 * 取舍：
 *  · 面板是"纸面档案卡"：顶部色带用该地的地图配色（国家 land / 岛屿状态填色 / 港口蓝），
 *    让面板与地图上的那块颜色一眼对上；岛屿色带的下边框线型 = 地图上的海岸线型（虚线 = 未勘探）。
 *  · 关联路线按 world.roads 的 kind 分组（国内 / 跨境 / 航线 / 海道 / 探险），与地图上的道路层级同名，
 *    行悬停 → actions.hoverLink 让画布上那条路加粗：面板与地图是同一张图的两种读法。
 *  · 数据文本一律 textContent / inlineMd；代表作链接只接受 http(s)。
 *  · #panel 在 index.html 里带 aria-live="polite"；整卡重渲染会让读屏器把全文读一遍，
 *    这里改成 off，选中播报交给 #sr-live 的一句话（见 index.js）。
 */
import katex from 'katex'
import 'katex/dist/katex.min.css'
import { actions } from '../state.js'
import { COUNTRY_COLORS, COUNTRY_NAMES, ISLAND_STATUS, PANEL_W, ROUTE_TYPE_COLORS } from '../constants.js'
import { TIER_NAMES } from '../rules.js'
import { typeLabel, CONJECTURE_STATUS, CONJECTURE_FIELDS, RESEARCHER_AREAS, FAMILIES, PROGRESS_EVIDENCE, progressOf } from '../../../shared/kb.js'
import { inlineMd } from '../../../shared/md.js'
import { h, placeGlyph, swatch, roadGlyph, typeDot } from './glyphs.js'
import { placeOf, placeColors, statusZh } from './describe.js'

/** 关联分组：顺序即面板里的顺序；glyph = 组标题旁的道路示意 */
const REL_GROUPS = [
  { id: 'domestic', zh: '国内道路', kinds: ['highway', 'road'], glyph: 'highway' },
  { id: 'border', zh: '跨境公路', kinds: ['crossway', 'crossroad'], glyph: 'crossway' },
  { id: 'ferry', zh: '航线', kinds: ['ferry'], glyph: 'ferry' },
  { id: 'lane', zh: '海道', kinds: ['lane'], glyph: 'lane' },
  { id: 'expedition', zh: '探险路线', kinds: ['expedition'], glyph: 'expedition' },
]
const KIND_TO_GROUP = Object.fromEntries(REL_GROUPS.flatMap((g) => g.kinds.map((k) => [k, g])))
const NARROW_Q = '(max-width: 759.98px)'
const DRAWER_VH = 0.46

/** 与 world 同一规则推断 kind（world.roadByKey 缺项时兜底，SPEC §6.2） */
function kindOf(world, link, graph) {
  const r = world?.roadByKey?.get(link.key)
  if (r) return r.kind
  const a = graph.byId.get(link.source), b = graph.byId.get(link.target)
  if (!a || !b) return 'road'
  if (a.researcher || b.researcher) return 'expedition'
  if (a.cluster && b.cluster) return 'lane'
  if (a.cluster || b.cluster) return 'ferry'
  return a.family === b.family ? (link.hero ? 'highway' : 'road') : (link.hero ? 'crossway' : 'crossroad')
}

export function createPanel(root, { graph, world, onChange }) {
  root.textContent = ''
  root.classList.add('ui-card', 'ui-panel')
  root.setAttribute('aria-live', 'off')
  root.hidden = true

  const band = h('div', 'ui-panel-band')
  const bandGlyph = h('span', 'ui-panel-band-glyph')
  const bandText = h('div', 'ui-panel-band-text')
  const close = h('button', 'ui-iconbtn ui-panel-close', '×')
  close.type = 'button'
  close.setAttribute('aria-label', '关闭详情（Esc）')
  close.title = '关闭（Esc）'
  close.addEventListener('click', () => { try { actions.deselect() } catch (e) { console.warn(e) } })
  band.append(bandGlyph, bandText, close)

  const scroll = h('div', 'ui-panel-scroll')
  const foot = h('div', 'ui-panel-foot')
  const openNebula = h('a', 'ui-btn ui-btn-primary', '在原星云中打开')
  openNebula.target = '_blank'
  openNebula.rel = 'noopener'
  const copy = h('button', 'ui-btn', '复制本页链接')
  copy.type = 'button'
  let copyTimer = 0
  copy.addEventListener('click', async () => {
    const ok = await copyText(location.href)
    copy.textContent = ok ? '已复制' : '复制失败'
    clearTimeout(copyTimer)
    copyTimer = setTimeout(() => { copy.textContent = '复制本页链接' }, 1400)
  })
  foot.append(openNebula, copy)
  root.append(band, scroll, foot)

  let currentId = null
  let hoveredKey = null
  const mq = window.matchMedia ? window.matchMedia(NARROW_Q) : null
  const isNarrow = () => (mq ? mq.matches : window.innerWidth < 760)

  function applyInset() {
    let p
    if (!currentId) p = { right: 0, bottom: 0 }
    else if (isNarrow()) p = { right: 0, bottom: Math.round(window.innerHeight * DRAWER_VH) + 8 }
    else p = { right: PANEL_W + 16, bottom: 0 }
    try { actions.setInset(p) } catch (e) { console.warn('[map/ui] setInset 失败', e) }
  }
  const onMq = () => { if (currentId) applyInset(); onChange() }
  if (mq) { mq.addEventListener ? mq.addEventListener('change', onMq) : mq.addListener(onMq) }
  window.addEventListener('resize', () => { if (currentId && isNarrow()) applyInset() })

  function setHoverLink(key) {
    if (hoveredKey === key) return
    hoveredKey = key
    try { actions.hoverLink(key) } catch (e) { /* 占位期 */ }
  }

  function show(id) {
    const n = graph.byId.get(id)
    if (!n) { hide(); return }
    const place = placeOf(world, graph, id)
    setHoverLink(null)
    currentId = id
    renderBand(place)
    renderBody(place)
    openNebula.href = `/#v1&n=${encodeURIComponent(id)}`
    openNebula.title = '在原 3D 星云应用中打开这一条'
    const wasHidden = root.hidden
    root.hidden = false
    if (wasHidden) { root.classList.remove('is-entering'); void root.offsetWidth; root.classList.add('is-entering') }
    scroll.scrollTop = 0
    applyInset()
    onChange()
  }

  function hide() {
    setHoverLink(null)
    const was = currentId
    currentId = null
    root.hidden = true
    applyInset()
    if (was) onChange()
  }

  /* ── 顶条 ── */
  function renderBand(place) {
    const n = place.node
    const col = placeColors(place)
    band.className = 'ui-panel-band'
    band.style.removeProperty('--band-edge')
    bandGlyph.textContent = ''
    bandGlyph.append(placeGlyph(place, 18))
    bandText.textContent = ''
    let l1, l2
    if (place.kind === 'city') {
      l1 = `${COUNTRY_NAMES[place.country]?.zh || place.country} · ${TIER_NAMES[place.tier] ?? ''}`
      l2 = `${COUNTRY_NAMES[place.country]?.latin || ''}${FAMILIES[place.country] ? ' · 知识族「' + FAMILIES[place.country].name + '」' : ''}`
      band.style.background = col.fill
      band.style.color = col.ink
      band.style.setProperty('--band-edge', col.ink)
    } else if (place.kind === 'island') {
      const s = place.status || n.status
      const st = ISLAND_STATUS[s] || ISLAND_STATUS.open
      l1 = `猜想岛屿 · ${statusZh(s)}${s === 'disproved' ? '（E.D.）' : ''}`
      l2 = `${CONJECTURE_STATUS[s]?.name || ''} — ${CONJECTURE_STATUS[s]?.hint || ''}`
      band.style.background = st.fill || '#f3e7e4'
      band.style.color = st.ink
      band.style.setProperty('--band-edge', st.coast)
      band.classList.add(`is-coast-${s}`)
    } else {
      l1 = `研究者港口 · ${RESEARCHER_AREAS[n.field]?.name || '研究者'}`
      l2 = 'Explorer’s Port'
      band.style.background = col.fill
      band.style.color = col.ink
      band.style.setProperty('--band-edge', col.ink)
    }
    bandText.append(h('div', 'ui-panel-band-l1', l1), h('div', 'ui-panel-band-l2', l2))
  }

  /* ── 正文 ── */
  function renderBody(place) {
    const n = place.node
    scroll.textContent = ''

    const head = h('header', 'ui-panel-head')
    const title = h('h2', 'ui-panel-title', n.name)
    head.append(title)
    if (n.en && n.en !== n.name) head.append(h('div', 'ui-panel-en', n.en))
    scroll.append(head)

    if (!n.researcher && n.latex) {
      const fx = h('div', 'ui-panel-formula')
      fx.setAttribute('role', 'math')
      fx.setAttribute('aria-label', n.latex)
      try {
        katex.render(String(n.latex), fx, { displayMode: true, throwOnError: false, output: 'htmlAndMathml', strict: 'ignore' })
      } catch (e) {
        fx.textContent = n.latex   // KaTeX 本身失败：退回源码
        fx.classList.add('is-raw')
      }
      scroll.append(fx)
    }

    // 元信息
    const meta = h('div', 'ui-panel-meta')
    const chip = (label, value, cls) => {
      const c = h('span', 'ui-chip' + (cls ? ' ' + cls : ''))
      if (label) c.append(h('span', 'ui-chip-k', label))
      c.append(h('span', 'ui-chip-v', value))
      meta.append(c)
    }
    if (n.researcher) {
      if (n.institution) chip('机构', n.institution)
      chip('关联', `${n.degree ?? n.linkIds?.length ?? 0} 条`)
    } else if (n.cluster) {
      if (n.proposer) chip('提出者', n.proposer)
      if (n.year) chip('年份', String(n.year))
      if (n.field) chip('领域', CONJECTURE_FIELDS[n.field]?.name || n.field)
      chip('重要度', fmtImp(n.importance))
    } else {
      chip('重要度', fmtImp(n.importance), 'ui-chip-imp')
      chip('关联', `${n.degree ?? n.linkIds?.length ?? 0} 条`)
    }
    scroll.append(meta)
    if (!n.researcher && !n.cluster) {
      const bar = h('div', 'ui-impbar')
      const fill = h('span', 'ui-impbar-fill')
      fill.style.width = `${Math.round(Math.max(0, Math.min(1, n.importance || 0)) * 100)}%`
      fill.style.background = placeColors(place).ink
      bar.append(fill)
      bar.setAttribute('aria-hidden', 'true')
      scroll.append(bar)
    }

    if (n.cluster) {
      const ev = PROGRESS_EVIDENCE?.[n.id]
      const yr = progressOf(n.id)
      if (yr) {
        const p = h('p', 'ui-panel-progress')
        p.append(h('span', 'ui-panel-progress-k', `最近进展（${yr}）`))
        if (ev && ev[1]) p.append(document.createTextNode('：'), ...inlineMd(ev[1]))
        scroll.append(p)
      }
    }
    if (n.researcher && n.focus) {
      const p = h('p', 'ui-panel-focus')
      p.append(h('span', 'ui-panel-focus-k', '研究方向'), document.createTextNode(n.focus))
      scroll.append(p)
    }

    if (n.summary) {
      const p = h('p', 'ui-panel-summary')
      p.append(...inlineMd(n.summary))
      scroll.append(p)
    }
    if (n.detail) {
      const d = h('div', 'ui-panel-detail')
      for (const para of String(n.detail).split(/\n+/)) {
        if (!para.trim()) continue
        const p = h('p')
        p.append(...inlineMd(para))
        d.append(p)
      }
      scroll.append(d)
    }

    if (n.researcher && Array.isArray(n.representativeWorks) && n.representativeWorks.length) {
      scroll.append(sectionHead('代表作', 'Opera'))
      const ul = h('ul', 'ui-works')
      for (const w of n.representativeWorks) {
        const li = h('li', 'ui-work')
        const t = safeUrl(w.url) ? h('a', 'ui-work-title', w.title) : h('span', 'ui-work-title', w.title)
        if (t.tagName === 'A') { t.href = w.url; t.target = '_blank'; t.rel = 'noopener noreferrer' }
        const l1 = h('div', 'ui-work-l1')
        l1.append(t)
        if (w.year) l1.append(h('span', 'ui-work-year', String(w.year)))
        li.append(l1)
        if (w.note) { const nt = h('div', 'ui-work-note'); nt.append(...inlineMd(w.note)); li.append(nt) }
        ul.append(li)
      }
      scroll.append(ul)
    }

    renderRelations(n)
  }

  function renderRelations(n) {
    const links = Array.isArray(n.linkIds) ? n.linkIds : []
    if (!links.length) return
    const buckets = new Map(REL_GROUPS.map((g) => [g.id, []]))
    for (const l of links) {
      const g = KIND_TO_GROUP[kindOf(world, l, graph)] || REL_GROUPS[0]
      buckets.get(g.id).push(l)
    }
    scroll.append(sectionHead('关联路线', 'Itinera', `${links.length} 条`))
    const wrap = h('div', 'ui-rels')
    wrap.addEventListener('mouseleave', () => setHoverLink(null))
    for (const g of REL_GROUPS) {
      const list = buckets.get(g.id)
      if (!list.length) continue
      list.sort((a, b) => (b.weight - a.weight) || String(a.key).localeCompare(String(b.key)))
      const sec = h('section', 'ui-rel-group')
      const gh = h('h4', 'ui-rel-gh')
      const gg = h('span', 'ui-rel-gglyph'); gg.append(roadGlyph(g.glyph, 28, 12))
      gh.append(gg, h('span', null, g.zh), h('span', 'ui-rel-count', list.length))
      sec.append(gh)
      const ul = h('ul', 'ui-rel-list')
      for (const l of list) ul.append(relRow(n, l))
      sec.append(ul)
      wrap.append(sec)
    }
    scroll.append(wrap)
  }

  function relRow(n, l) {
    const otherId = l.source === n.id ? l.target : l.source
    const other = graph.byId.get(otherId)
    const op = placeOf(world, graph, otherId)
    const li = h('li')
    const b = h('button', 'ui-rel-row')
    b.type = 'button'
    b.style.setProperty('--rel', ROUTE_TYPE_COLORS[l.type] || ROUTE_TYPE_COLORS.related)
    const l1 = h('span', 'ui-rel-l1')
    const ty = h('span', 'ui-rel-type', typeLabel(l.type))
    l1.append(typeDot(l.type), ty)
    const name = h('span', 'ui-rel-name', other ? other.name : otherId)
    l1.append(name)
    if (op) {
      const col = placeColors(op)
      const sw = op.kind === 'city'
        ? swatch(COUNTRY_COLORS[op.country]?.land, COUNTRY_COLORS[op.country]?.ink, 'ui-swatch ui-swatch-sm')
        : op.kind === 'island' ? swatch(col.fill, col.coast, 'ui-swatch ui-swatch-sm ui-swatch-island') : swatch('#24486a', '#24486a', 'ui-swatch ui-swatch-sm ui-swatch-port')
      sw.title = op.kind === 'city' ? (COUNTRY_NAMES[op.country]?.zh || '') : op.kind === 'island' ? `猜想岛屿 · ${statusZh(op.status || other?.status)}` : '研究者港口'
      l1.append(sw)
    }
    b.append(l1)
    if (l.label) { const l2 = h('span', 'ui-rel-l2'); l2.append(...inlineMd(l.label)); b.append(l2) }
    b.title = other ? `前往「${other.name}」` : ''
    b.addEventListener('mouseenter', () => setHoverLink(l.key))
    b.addEventListener('focus', () => setHoverLink(l.key))
    b.addEventListener('blur', () => setHoverLink(null))
    b.addEventListener('click', () => {
      setHoverLink(null)
      try { const r = actions.select(otherId); if (r && r.catch) r.catch(() => {}) } catch (e) { console.warn('[map/ui] select 失败', e) }
    })
    li.append(b)
    return li
  }

  return { show, hide, isOpen: () => !root.hidden, currentId: () => currentId, applyInset, isNarrow }
}

function sectionHead(zh, latin, note) {
  const s = h('h3', 'ui-panel-sh')
  s.append(h('span', null, zh), h('span', 'ui-panel-sh-latin', latin))
  if (note) s.append(h('span', 'ui-panel-sh-note', note))
  return s
}

function fmtImp(v) { return (Math.round((v || 0) * 100) / 100).toFixed(2) }

/** 只接受 http(s)://（防 javascript: 等协议注入） */
function safeUrl(u) {
  if (typeof u !== 'string') return false
  try { const x = new URL(u); return x.protocol === 'http:' || x.protocol === 'https:' } catch { return false }
}

async function copyText(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) { await navigator.clipboard.writeText(text); return true }
  } catch { /* 退回 execCommand */ }
  try {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.setAttribute('readonly', '')
    ta.style.position = 'fixed'; ta.style.opacity = '0'; ta.style.left = '-9999px'
    document.body.append(ta)
    ta.select()
    const ok = document.execCommand('copy')
    ta.remove()
    return ok
  } catch { return false }
}
