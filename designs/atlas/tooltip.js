/**
 * designs/atlas/tooltip.js — 地图悬停提示（M4，SPEC §9.2）。
 *
 * 设计取舍：
 *   · 悬停稳定 80ms 才出现：扫过密集星区时不会闪成一串；同一目标上的后续 pointermove
 *     只更新位置，不重置计时。hover(null) / 换目标立即隐藏。
 *   · 只响应 source==='map'（面板 / 搜索列表的预览不弹提示，信息已经在列表里了）；
 *     被选中的节点也不弹（详情面板已经展示），避免点击后提示马上又出现在准星旁。
 *   · 触屏不显示：pointer: coarse 媒体查询 + 最近一次 pointerType==='touch'（二合一设备上
 *     以实际输入为准）。触屏上的"悬停"其实是按下前的一瞬，弹出来只会挡住手指要点的东西。
 *   · 相机变化（拖拽 / 缩放 / 飞行）时隐藏：目标已经离开指针，留着会指错地方。
 *   · 定位先量尺寸再放置：默认在指针右下 14px，越界翻到左 / 上；还会避开打开的右侧面板。
 */
import katex from 'katex'
import 'katex/dist/katex.min.css'
import { state, on } from './state.js'
import { FAMILY_LATIN, FONT_SERIF, FONT_SANS } from './constants.js'
import { glyphCanvas } from './glyphs.js'
import { FAMILIES, CONJECTURE_STATUS } from '../shared/kb.js'

const DELAY_MS = 80
const OFFSET = 14
const MARGIN = 8

function h(tag, cls, text) {
  const e = document.createElement(tag)
  if (cls) e.className = cls
  if (text != null) e.textContent = String(text)
  return e
}

/* 提示里的公式按 id 缓存（与面板的缓存分开：两处会同时存在于 DOM 中） */
const texCache = new Map()
function tipTex(id, latex) {
  let el = texCache.get(id)
  if (!el) {
    el = h('div', 'at-katex')
    try { katex.render(String(latex ?? ''), el, { displayMode: false, throwOnError: false, strict: 'ignore' }) }
    catch { el.textContent = String(latex ?? '') }
    texCache.set(id, el)
  }
  return el
}

export function initTooltip(el) {
  el.classList.add('at')
  el.setAttribute('aria-hidden', 'true')
  el.style.setProperty('--at-serif', FONT_SERIF)
  el.style.setProperty('--at-sans', FONT_SANS)

  let lastPointer = null
  addEventListener('pointerdown', (e) => { lastPointer = e.pointerType }, true)
  addEventListener('pointermove', (e) => { lastPointer = e.pointerType }, { capture: true, passive: true })
  const coarse = typeof matchMedia === 'function' ? matchMedia('(pointer: coarse)') : null
  const isTouch = () => (lastPointer ? lastPointer === 'touch' : !!(coarse && coarse.matches))

  let key = null        // 当前目标的键（'b:<id>' | 'c:<family>'）
  let timer = 0
  let shown = false
  let pos = { x: 0, y: 0 }

  function hide() {
    clearTimeout(timer); timer = 0
    key = null
    if (!shown && !el.classList.contains('show')) return
    shown = false
    el.classList.remove('show')
    el.setAttribute('aria-hidden', 'true')
  }

  function place() {
    const W = innerWidth, H = innerHeight
    // 右侧面板打开时把它的左沿当作右边界（抽屉则当作下边界）
    const p = state.occluders && state.occluders.get('panel')
    let right = W - MARGIN, bottom = H - MARGIN
    if (p) {
      if (p.y > 1) bottom = Math.min(bottom, p.y - MARGIN)
      else right = Math.min(right, p.x - MARGIN)
    }
    const w = el.offsetWidth, ht = el.offsetHeight
    let x = pos.x + OFFSET, y = pos.y + OFFSET
    if (x + w > right) x = pos.x - OFFSET - w
    if (y + ht > bottom) y = pos.y - OFFSET - ht
    x = Math.max(MARGIN, Math.min(x, right - w))
    y = Math.max(MARGIN, Math.min(y, bottom - ht))
    el.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`
  }

  function show(target) {
    const content = build(target)
    if (!content) { hide(); return }
    el.replaceChildren(...content)
    el.dataset.kind = target.kind === 'constellation' ? 'constellation' : (state.atlas.bodies.get(target.id)?.kind || '')
    // 长公式在 360px 内放不下时右端渐隐（只在真溢出时加，短公式不受影响）
    const f = el.querySelector('.at-formula')
    if (f) f.classList.toggle('is-overflow', f.scrollWidth > f.clientWidth + 1)
    place()
    shown = true
    el.classList.add('show')
    el.setAttribute('aria-hidden', 'false')
  }

  on('hover', (ev) => {
    const t = ev && ev.target
    if (!t || t.source === 'ui' || isTouch() || !state.atlas) { hide(); return }
    if (t.kind === 'body' && t.id === state.selected) { hide(); return }
    const k = t.kind === 'constellation' ? 'c:' + t.family : t.kind === 'body' ? 'b:' + t.id : null
    if (!k) { hide(); return }
    pos = { x: ev.sx, y: ev.sy }
    if (k === key) {
      if (shown) place()
      return
    }
    hide()
    key = k
    timer = setTimeout(() => { timer = 0; if (key === k) show(t) }, DELAY_MS)
  })
  on('select', hide)
  on('view', hide)
  addEventListener('blur', hide)
}

/** 提示内容：眉题（面板眉题的缩写）+ 名字 + 公式 / 机构；星座：名 · 拉丁名 · N 颗星 */
function build(t) {
  if (t.kind === 'constellation') {
    const r = state.atlas.regions && state.atlas.regions[t.family]
    if (!r) return null
    const eye = h('div', 'at-eyebrow', '星座 · Constellatio')
    const name = h('div', 'at-name')
    name.append(h('span', null, (r.name || (FAMILIES[t.family] && FAMILIES[t.family].name) || t.family) + '座'))
    const sub = h('div', 'at-sub')
    sub.append(h('span', 'at-latin', r.latin || FAMILY_LATIN[t.family] || ''), h('span', 'at-sep', '·'),
      h('span', null, `${(r.starIds || []).length} 颗星`))
    return [eye, name, sub, h('div', 'at-hint', '点击飞往该星座')]
  }
  const b = state.atlas.bodies.get(t.id)
  if (!b) return null
  const n = b.node
  const eye = h('div', 'at-eyebrow')
  if (b.kind === 'star') {
    eye.append(glyphCanvas({ kind: 'star', mag: b.mag }, 12),
      h('span', null, `恒星 · mag ${b.mag} · ${FAMILIES[b.family] ? FAMILIES[b.family].name + '座' : ''}`))
  } else if (b.kind === 'dso') {
    const st = CONJECTURE_STATUS[b.status]
    eye.append(glyphCanvas({ kind: 'dso', status: b.status }, 12),
      h('span', null, '深空天体 · ' + (st ? st.name : (b.status || '猜想'))))
  } else {
    eye.append(glyphCanvas({ kind: 'researcher' }, 12), h('span', null, '研究者'))
  }
  const out = [eye, h('div', 'at-name', n.name || n.id)]
  if (n.en && n.en !== n.name) out.push(h('div', 'at-en', n.en))
  if (b.kind === 'researcher') {
    if (n.institution) out.push(h('div', 'at-sub', n.institution))
  } else if (n.latex) {
    const f = h('div', 'at-formula')
    f.append(tipTex(b.id, n.latex))
    out.push(f)
  }
  return out
}
