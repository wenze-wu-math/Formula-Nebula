/**
 * designs/map/src/ui/cartouche.js — 左下标题图框（cartouche）+ 可折叠图例（SPEC §9.5）。
 *
 * 取舍：
 *  · 所有数字（城市数、岛屿各状态数、道路数）都从 graph/world 现算，不写死 —— 数据改了图例自动对。
 *  · 符号用 glyphs.js 按 constants 重画，保证"图例里的路 = 地图上的路"。
 *  · 道路组列出 world 里真实存在的全部 7 类（SPEC §9.5 只点名了 5 类，但 crossroad 与 lane
 *    在 L2/L3 确实会画出来，图例缺项会让读者猜）；每项计数取自 world.roads。
 *  · 卡片贴底（bottom:16px），图例展开时向上长；折叠状态存 localStorage `map.legend`。
 */
import { actions, bus, state } from '../state.js'
import { COUNTRY_COLORS, COUNTRY_NAMES, FAMILY_ORDER, ISLAND_STATUS } from '../constants.js'
import { TIER_NAMES, CROSS_ROAD_SHOW_N } from '../rules.js'
import { h, swatch, cityGlyph, islandGlyph, roadGlyph, portGlyph, LEGEND_INK } from './glyphs.js'

const LS_KEY = 'map.legend'

const ROAD_LEGEND = [
  { kind: 'crossway', zh: '跨境公路', note: '跨族强关联 · 总览可见' },
  { kind: 'crossroad', zh: '跨境道路', note: '跨族关联 · 城市级' },
  { kind: 'highway', zh: '国内高速', note: '族内强关联 · 国家级' },
  { kind: 'road', zh: '道路', note: '族内关联 · 城市级' },
  { kind: 'ferry', zh: '航线', note: '定理 ↔ 猜想' },
  { kind: 'lane', zh: '海道', note: '猜想 ↔ 猜想 · 街区级' },
  { kind: 'expedition', zh: '探险路线', note: '研究者 ↔ 研究对象 · 选中时显示' },
]
const STATUS_ORDER = ['open', 'partial', 'proved', 'disproved', 'heuristic']

export function createCartouche(root, { graph, world, onChange }) {
  root.textContent = ''
  const places = world.places || []
  const nCity = places.filter((p) => p.kind === 'city').length || graph.nodes.filter((n) => !n.cluster && !n.researcher).length
  const nIsland = places.filter((p) => p.kind === 'island').length || graph.nodes.filter((n) => n.cluster).length
  const nPort = places.filter((p) => p.kind === 'port').length || graph.nodes.filter((n) => n.researcher).length
  const nRoad = (world.roads || graph.links).length

  const card = h('div', 'ui-card ui-cartouche')

  /* ── 图例（在上，向上展开） ── */
  const legend = h('div', 'ui-legend')
  legend.id = 'ui-legend'

  // 1. 国家
  const gCountry = group('国家', 'Regna')
  const grid = h('div', 'ui-legend-countries')
  for (const f of FAMILY_ORDER) {
    const c = world.countryById?.get(f)
    const cnt = c?.placeIds?.length ?? places.filter((p) => p.kind === 'city' && p.country === f).length
    const b = h('button', 'ui-legend-country')
    b.type = 'button'
    b.title = `飞到「${COUNTRY_NAMES[f].zh}」`
    b.append(swatch(COUNTRY_COLORS[f].land, COUNTRY_COLORS[f].ink), h('span', 'ui-legend-cname', COUNTRY_NAMES[f].zh), h('span', 'ui-legend-num', cnt))
    b.style.setProperty('--ink', COUNTRY_COLORS[f].ink)
    b.addEventListener('click', () => {
      const bbox = c?.bbox
      if (!bbox) return
      try { const r = actions.flyToBounds(bbox, { pad: 60 }); if (r && r.catch) r.catch(() => {}) } catch (e) { console.warn('[map/ui] flyToBounds 失败', e) }
    })
    grid.append(b)
  }
  gCountry.append(grid)

  // 2. 城市
  const gCity = group('城市', 'Urbes', '按族内重要度')
  const cities = h('div', 'ui-legend-grid')
  const tierCount = [0, 0, 0, 0]
  for (const p of places) if (p.kind === 'city' && tierCount[p.tier] != null) tierCount[p.tier]++
  TIER_NAMES.forEach((zh, t) => cities.append(item(cityGlyph(t, LEGEND_INK, 18), zh, tierCount[t])))
  gCity.append(cities)

  // 3. 道路与航线
  const gRoad = group('道路与航线', 'Viae')
  const roads = h('div', 'ui-legend-grid')
  const roadCount = {}
  for (const r of world.roads || []) roadCount[r.kind] = (roadCount[r.kind] || 0) + 1
  const roadItems = new Map()
  for (const r of ROAD_LEGEND) {
    const it = item(roadGlyph(r.kind, 30, 14), r.zh, roadCount[r.kind] ?? '')
    it.title = r.note
    roadItems.set(r.kind, it)
    roads.append(it)
  }
  gRoad.append(roads)

  /* 跨族道路开关：默认关（画面留白）。打开后只显示权重最高的 CROSS_ROAD_SHOW_N 条。
     图例里被关掉的跨族项加 is-off 类并改写计数，避免"图例说有 80 条、图上一根都没有"。 */
  const crossKinds = ['crossway', 'crossroad']
  const crossTotal = crossKinds.reduce((s, k) => s + (roadCount[k] || 0), 0)
  const bCross = h('button', 'ui-linkbtn ui-road-toggle')
  bCross.type = 'button'
  bCross.setAttribute('aria-pressed', 'false')
  gRoad.append(bCross)
  function syncRoadToggle(show) {
    bCross.textContent = show ? `隐藏跨族道路（显示前 ${CROSS_ROAD_SHOW_N} 条）` : `显示跨族道路（默认隐藏，共 ${crossTotal} 条）`
    bCross.setAttribute('aria-pressed', String(!!show))
    for (const k of crossKinds) {
      const it = roadItems.get(k)
      if (!it) continue
      it.classList.toggle('is-off', !show)
      const num = it.querySelector('.ui-legend-num')
      if (num) num.textContent = show ? `${Math.min(CROSS_ROAD_SHOW_N, roadCount[k] || 0)} / ${roadCount[k] || 0}` : '0'
    }
    onChange()
  }
  bCross.addEventListener('click', () => {
    try {
      const r = actions.setRoads({ showCross: !(state.roadOptions && state.roadOptions.showCross) })
      if (r) syncRoadToggle(!!r.showCross)
    } catch (e) { console.warn('[map/ui] setRoads 失败', e) }
  })
  syncRoadToggle(!!(state.roadOptions && state.roadOptions.showCross))
  bus.on('roads', (p) => syncRoadToggle(!!(p && p.showCross)))

  // 4. 海图
  const gSea = group('海图', 'Mare')
  const sea = h('div', 'ui-legend-grid')
  const stCount = {}
  for (const n of graph.nodes) if (n.cluster) stCount[n.status] = (stCount[n.status] || 0) + 1
  for (const s of STATUS_ORDER) {
    const st = ISLAND_STATUS[s]
    const label = s === 'disproved' ? `${st.zh}（E.D.）` : st.zh
    const it = item(islandGlyph(s, 24, 16), label, stCount[s] || 0)
    it.title = st.note
    if (!stCount[s]) it.classList.add('is-zero')
    sea.append(it)
  }
  sea.append(item(portGlyph(16, true), '研究者港口', nPort))
  gSea.append(sea, h('p', 'ui-legend-note', '越不确定的岛离大陆越远'))

  legend.append(gCountry, gCity, gRoad, gSea)

  /* ── 标题 ── */
  const title = h('div', 'ui-cart-title')
  const t1 = h('h1', 'ui-cart-h1', '公式大陆')
  const t2 = h('div', 'ui-cart-latin', 'TERRA FORMULARUM')
  const t3 = h('div', 'ui-cart-stats', `代数几何知识地图 · ${nCity} 座城市 · ${nIsland} 座岛屿 · ${nPort} 处港口 · ${nRoad} 条道路与航线`)
  const toggle = h('button', 'ui-linkbtn ui-legend-toggle')
  toggle.type = 'button'
  toggle.setAttribute('aria-controls', 'ui-legend')
  toggle.addEventListener('click', () => setOpen(!open, true))
  const rule = h('div', 'ui-cart-rule')
  rule.append(h('span', 'ui-cart-orn', '❦'))
  title.append(t1, t2, rule, t3, toggle)

  card.append(legend, title)
  root.append(card)

  /* ── 折叠状态 ── */
  let stored = null
  try { stored = localStorage.getItem(LS_KEY) } catch { /* 隐私模式 */ }
  let open = stored != null ? stored === '1' : !(window.innerHeight < 760 || window.innerWidth < 760)
  let listeners = []
  function setOpen(v, persist = false) {
    open = !!v
    legend.hidden = !open
    card.classList.toggle('is-collapsed', !open)
    toggle.textContent = open ? '收起图例 ▾' : '展开图例 ▴'
    toggle.setAttribute('aria-expanded', String(open))
    if (persist) { try { localStorage.setItem(LS_KEY, open ? '1' : '0') } catch { /* 忽略 */ } }
    for (const fn of listeners) fn(open)
    onChange()
  }
  setOpen(open)

  return {
    isOpen: () => open,
    setOpen,
    toggle: () => setOpen(!open, true),
    onToggle: (fn) => listeners.push(fn),
    el: card,
  }
}

function group(zh, latin, note) {
  const g = h('section', 'ui-legend-group')
  const head = h('h3', 'ui-legend-h')
  head.append(h('span', null, zh), h('span', 'ui-legend-latin', latin))
  if (note) head.append(h('span', 'ui-legend-hnote', note))
  g.append(head)
  return g
}

function item(glyph, label, count) {
  const it = h('div', 'ui-legend-item')
  const g = h('span', 'ui-legend-glyph'); g.append(glyph)
  it.append(g, h('span', 'ui-legend-label', label))
  if (count !== '' && count != null) it.append(h('span', 'ui-legend-num', count))
  return it
}
