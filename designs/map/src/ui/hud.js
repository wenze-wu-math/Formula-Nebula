/**
 * designs/map/src/ui/hud.js — 右下 HUD：指北针、比例尺、级别读数、缩放按钮、烘焙进度（SPEC §9.8）。
 *
 * 比例尺是制图隐喻而非真实距离："1 跳" = 全部道路长度的中位数（world.roads[].len），
 * 即"沿一条关联走一步"在当前缩放下有多长。刻度取 1/2/5 × 10^k，使条长落在 80–120px。
 */
import { actions, state } from '../state.js'
import { ZOOM_LEVELS } from '../constants.js'
import { levelOf } from '../rules.js'
import { h } from './glyphs.js'
import { svgIcon } from './search.js'

const LEVEL_NAMES = ['总览', '国家', '城市', '街区']
const LEVEL_LATIN = ['Orbis', 'Regnum', 'Urbs', 'Vicus']
const BAR_MIN = 80, BAR_MAX = 120

export function createHud(root, { world, onChange }) {
  root.textContent = ''
  root.classList.add('ui-hud')

  /* 中位道路长度（wu）。world 缺 roads 时退回 60 wu */
  const lens = (world.roads || []).map((r) => r.len).filter((v) => v > 0).sort((a, b) => a - b)
  const hopWu = lens.length ? lens[lens.length >> 1] : 60

  /* ── 读数卡：级别 + 比例尺 + 进度 ── */
  const card = h('div', 'ui-card ui-hud-card')
  const lvl = h('div', 'ui-hud-level')
  const lvlName = h('span', 'ui-hud-lvl-name', '总览')
  const lvlLatin = h('span', 'ui-hud-lvl-latin', 'Orbis')
  const lvlDots = h('span', 'ui-hud-lvl-dots')
  lvlDots.setAttribute('aria-hidden', 'true')
  const dots = [0, 1, 2, 3].map(() => { const d = h('i'); lvlDots.append(d); return d })
  lvl.append(lvlDots, lvlName, lvlLatin)
  lvl.title = `语义缩放级别：s < ${ZOOM_LEVELS[0]} 总览，< ${ZOOM_LEVELS[1]} 国家，< ${ZOOM_LEVELS[2]} 城市，其余街区`

  const scale = h('div', 'ui-scale')
  const bar = h('div', 'ui-scale-bar')
  for (let i = 0; i < 4; i++) bar.append(h('i'))   // 黑白交替刻度段（CSS 着色）
  const scaleLbl = h('div', 'ui-scale-lbl')
  const scaleL0 = h('span', null, '0')
  const scaleL1 = h('span', 'ui-scale-n', '≈ 1 跳')
  scaleLbl.append(scaleL0, scaleL1)
  scale.append(bar, scaleLbl)
  scale.title = '1 跳 = 道路长度中位数：沿一条关联走一步的图上距离（示意，不是真实距离）'

  const bake = h('div', 'ui-bake')
  const bakeBar = h('span', 'ui-bake-bar')
  const bakeFill = h('i')
  bakeBar.append(bakeFill)
  const bakeTxt = h('span', 'ui-bake-txt', '')
  bake.append(bakeTxt, bakeBar)
  bake.hidden = true

  card.append(lvl, scale, bake)

  /* ── 指北针 + 缩放按钮 ── */
  const side = h('div', 'ui-hud-side')
  const compass = compassSvg()
  const zoom = h('div', 'ui-card ui-zoom')
  const bIn = zoomBtn('M12 6v12M6 12h12', '放大', () => actions.zoomBy(1.6))
  const bOut = zoomBtn('M6 12h12', '缩小', () => actions.zoomBy(1 / 1.6))
  const bHome = zoomBtn('M4 11.5L12 5l8 6.5M6.5 10v8.5h11V10', '回到全图', () => actions.home())
  zoom.append(bIn, bOut, bHome)
  side.append(compass, zoom)

  root.append(card, side)

  /* ── 更新 ── */
  let lastLevel = -1, lastKey = ''
  function onView(v) {
    const z = v?.z ?? state.view.z
    const s = v?.s ?? (z / (state.zFit || 1))
    const level = v?.level ?? levelOf(s)
    if (level !== lastLevel) {
      lastLevel = level
      lvlName.textContent = LEVEL_NAMES[level] ?? ''
      lvlLatin.textContent = LEVEL_LATIN[level] ?? ''
      dots.forEach((d, i) => d.classList.toggle('on', i <= level))
    }
    const pxPerHop = hopWu * z
    const { n, px } = niceScale(pxPerHop)
    const key = `${n}|${Math.round(px)}`
    if (key !== lastKey) {
      lastKey = key
      bar.style.width = `${Math.round(px)}px`
      scaleL1.textContent = n === 0 ? '< 1 跳' : `≈ ${fmtN(n)} 跳`
    }
  }

  let bakeDone = false, fadeTimer = 0
  function onBake(p) {
    if (!p || !p.total) return
    const { done, total } = p
    if (done >= total) {
      if (bakeDone) return
      bakeDone = true
      bakeTxt.textContent = `公式排版完成 ${total}/${total}`
      bakeFill.style.width = '100%'
      bake.classList.add('is-done')
      clearTimeout(fadeTimer)
      fadeTimer = setTimeout(() => { bake.hidden = true; onChange() }, 1600)
      return
    }
    bakeDone = false
    bake.classList.remove('is-done')
    bakeTxt.textContent = `公式排版 ${done}/${total}`
    bakeFill.style.width = `${Math.round((done / total) * 100)}%`
    if (bake.hidden) { bake.hidden = false; onChange() }
  }

  return { onView, onBake, el: root }
}

/** 取 1/2/5×10^k 跳（k ≥ 0，SPEC 要整数跳），使条长 ∈ [80,120]px；落不进区间时取最接近 100px 的。
 * 放得很大时 1 跳就超过 120px：条长封顶 BAR_CAP，标「< 1 跳」（不编造小数跳）。 */
const BAR_CAP = 150
export function niceScale(pxPerHop) {
  if (!(pxPerHop > 0)) return { n: 1, px: 100 }
  if (pxPerHop > BAR_MAX) return pxPerHop <= BAR_CAP ? { n: 1, px: pxPerHop } : { n: 0, px: BAR_CAP }
  let best = null
  for (let k = 0; k <= 4; k++) {
    for (const m of [1, 2, 5]) {
      const n = m * Math.pow(10, k)
      const px = n * pxPerHop
      const score = (px >= BAR_MIN && px <= BAR_MAX) ? Math.abs(px - 100) : 1000 + Math.abs(px - 100)
      if (!best || score < best.score) best = { n, px, score }
    }
  }
  return { n: best.n, px: best.px }
}
function fmtN(n) { return String(Math.round(n)) }

function zoomBtn(d, label, fn) {
  const b = h('button', 'ui-zoom-btn')
  b.type = 'button'
  b.setAttribute('aria-label', label)
  b.title = label
  b.append(svgIcon(d, 'ui-zoom-ico'))
  b.addEventListener('click', () => { try { const r = fn(); if (r && r.catch) r.catch(() => {}) } catch (e) { console.warn('[map/ui]', e) } })
  return b
}

/** 老地图风指北针：外圈刻度 + 双色菱形针 + 衬线 N */
function compassSvg() {
  const NS = 'http://www.w3.org/2000/svg'
  const svg = document.createElementNS(NS, 'svg')
  svg.setAttribute('viewBox', '0 0 48 56')
  svg.setAttribute('class', 'ui-compass')
  svg.setAttribute('role', 'img')
  svg.setAttribute('aria-label', '指北针：上方为北')
  const el = (tag, attrs) => { const e = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v); svg.append(e); return e }
  const cx = 24, cy = 32, R = 15
  el('circle', { cx, cy, r: R + 4, fill: '#fbf8f1', stroke: '#8a7f73', 'stroke-width': 1 })
  el('circle', { cx, cy, r: R, fill: 'none', stroke: '#8a7f73', 'stroke-width': 0.6 })
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2
    const r0 = i % 4 === 0 ? R - 3 : R - 1.5
    el('line', { x1: cx + Math.sin(a) * r0, y1: cy - Math.cos(a) * r0, x2: cx + Math.sin(a) * R, y2: cy - Math.cos(a) * R, stroke: '#8a7f73', 'stroke-width': i % 4 === 0 ? 1 : 0.6 })
  }
  // 东西针（细，浅）
  el('path', { d: `M${cx - R + 3} ${cy} L${cx} ${cy - 2.6} L${cx + R - 3} ${cy} L${cx} ${cy + 2.6} Z`, fill: '#e8e0cf', stroke: '#8a7f73', 'stroke-width': 0.6 })
  // 南北针：北半深红、南半纸白，左右两半明暗分开（老海图的立体针）
  el('path', { d: `M${cx} ${cy - R + 1} L${cx - 4} ${cy} L${cx} ${cy} Z`, fill: '#b5402e' })
  el('path', { d: `M${cx} ${cy - R + 1} L${cx + 4} ${cy} L${cx} ${cy} Z`, fill: '#8a2d1f' })
  el('path', { d: `M${cx} ${cy + R - 1} L${cx - 4} ${cy} L${cx} ${cy} Z`, fill: '#fbf8f1', stroke: '#6b6255', 'stroke-width': 0.6 })
  el('path', { d: `M${cx} ${cy + R - 1} L${cx + 4} ${cy} L${cx} ${cy} Z`, fill: '#d9cfbc', stroke: '#6b6255', 'stroke-width': 0.6 })
  el('circle', { cx, cy, r: 1.6, fill: '#4a4236' })
  const t = el('text', { x: cx, y: 9.5, 'text-anchor': 'middle', 'font-family': 'Georgia, "Times New Roman", serif', 'font-size': 11, 'font-weight': 700, fill: '#4a4236' })
  t.textContent = 'N'
  return svg
}
