/**
 * designs/map/src/ui/app.js — UI 组装：把各浮层挂进 index.html 的容器，订阅 bus，提供避让矩形（SPEC §9）。
 * src/ui/index.js 只 re-export 这里的 initUI（并行开发的原子性：入口任何时刻都可 import）。
 *
 * 避让矩形（obstacles）每帧被调用，所以：
 *   · 结果缓存；只有"脏"时才重新 getBoundingClientRect。
 *   · 置脏来源：ResizeObserver（各浮层尺寸变化）、窗口 resize、我们自己显隐/移动浮层时、
 *     以及 CSS 过渡/动画期间（transitionrun/animationstart 起的 ~0.6s 内每帧都算 —— 位移过渡
 *     不会触发 ResizeObserver）。
 *   · 置脏后顺带 invalidate()，让标签按新的浮层位置重新避让。
 */
import { bus, state, invalidate } from '../state.js'
import { createSearch } from './search.js'
import { createCartouche } from './cartouche.js'
import { createRegister } from './register.js'
import { createPanel } from './panel.js'
import { createHud } from './hud.js'
import { createTooltip } from './tooltip.js'
import { placeOf, longWhere } from './describe.js'

const PAD = 6
const GAP = 12

export function initUI({ graph, world }) {
  const $ = (id) => document.getElementById(id)
  const canvas = $('map')
  const app = $('app') || document.body
  const elSearch = $('search'), elCart = $('cartouche'), elReg = $('register')
  const elPanel = $('panel'), elHud = $('hud'), elTip = $('tooltip'), elLive = $('sr-live')
  document.documentElement.classList.add('has-ui')

  /* ── 避让矩形缓存 ── */
  let dirty = true
  let cache = []
  let liveUntil = 0
  function markDirty() {
    if (!dirty) { dirty = true; invalidate() }
  }
  function rectsOf(els) {
    const out = []
    const cr = canvas ? canvas.getBoundingClientRect() : { left: 0, top: 0 }
    for (const el of els) {
      if (!el || el.hidden) continue
      const r = el.getBoundingClientRect()
      if (r.width < 1 || r.height < 1) continue
      out.push({ x: r.left - cr.left - PAD, y: r.top - cr.top - PAD, w: r.width + 2 * PAD, h: r.height + 2 * PAD })
    }
    return out
  }
  function obstacles() {
    if (performance.now() < liveUntil) { dirty = true; invalidate() }   // 过渡中：每帧重算并保持重画
    if (!dirty) return cache
    dirty = false
    // #search 的子元素各算一块（工具行比输入框窄，下拉是绝对定位溢出容器的）
    const searchParts = elSearch ? [...elSearch.children] : []
    const hudParts = elHud ? [...elHud.children] : []
    cache = rectsOf([...searchParts, elCart, elReg, elPanel, ...hudParts])
    return cache
  }
  const onAnim = () => { liveUntil = performance.now() + 650; markDirty() }
  app.addEventListener('transitionrun', onAnim)
  app.addEventListener('animationstart', onAnim)
  app.addEventListener('transitionend', markDirty)
  app.addEventListener('animationend', markDirty)

  /* ── 各模块 ── */
  const onChange = () => { layoutRegister(); markDirty() }
  const register = createRegister(elReg, { graph, onChange, onClose: () => toggleRegister(false) })
  const cart = createCartouche(elCart, { graph, world, onChange })
  const search = createSearch(elSearch, {
    graph, world, onChange,
    onToggleLegend: () => cart.toggle(),
    onToggleRegister: () => toggleRegister(),
  })
  const panel = createPanel(elPanel, { graph, world, onChange })
  const hud = createHud(elHud, { world, onChange })
  const tip = createTooltip(elTip, { graph, world, canvas })

  cart.onToggle((open) => { search.setToolState({ legend: open }); if (open) legendAutoCollapsed = false })
  search.setToolState({ legend: cart.isOpen(), register: false })

  /* ── 名录：位置跟随搜索区底边；与图框挤不下时临时收起图例 ── */
  let legendAutoCollapsed = false
  function toggleRegister(v) {
    const want = v == null ? !register.isOpen() : !!v
    register.setOpen(want)
    search.setToolState({ register: want })
    if (want) {
      layoutRegister()
      if (availRegisterH() < 300 && cart.isOpen()) { cart.setOpen(false); legendAutoCollapsed = true; search.setToolState({ legend: false }) }
    } else if (legendAutoCollapsed) {
      legendAutoCollapsed = false
      cart.setOpen(true)
    }
    layoutRegister()
    markDirty()
  }
  function availRegisterH() {
    const top = registerTop()
    const cartTop = elCart ? elCart.getBoundingClientRect().top : window.innerHeight
    return cartTop - GAP - top
  }
  function registerTop() {
    // 只看输入框与工具行（下拉打开时不应把名录挤下去）
    let b = 16
    for (const el of elSearch ? elSearch.children : []) {
      if (el.hidden || el.classList.contains('ui-suggest')) continue
      const r = el.getBoundingClientRect()
      if (r.height > 0) b = Math.max(b, r.bottom)
    }
    return Math.round(b + 10)
  }
  function layoutRegister() {
    if (!elReg || elReg.hidden) return
    const top = registerTop()
    elReg.style.top = `${top}px`
    elReg.style.maxHeight = `${Math.max(180, Math.floor(availRegisterH()))}px`
  }

  /* ── 选中 ── */
  let lastAnnounced = ''
  function announce(text) {
    if (!elLive) return
    // 同文本重复播报：先清空再写，读屏器才会再读一次
    if (text === lastAnnounced) elLive.textContent = ''
    lastAnnounced = text
    requestAnimationFrame(() => { elLive.textContent = text })
  }
  function onSelect(p) {
    const id = p && p.id
    if (id) {
      panel.show(id)          // 同步：打开面板 + setInset（M5 在 emit 之后才取景，SPEC §10.3）
      const n = graph.byId.get(id)
      announce(n ? `已选中 ${n.name}，${longWhere(placeOf(world, graph, id))}，关联 ${n.linkIds?.length ?? 0} 条` : '')
    } else {
      panel.hide()
      if (p && p.prev) announce('已取消选中')
    }
    register.highlight(id || null)
    document.documentElement.classList.toggle('has-panel', !!id)
    document.documentElement.classList.toggle('has-drawer', !!id && panel.isNarrow())
    markDirty()
  }
  bus.on('select', onSelect)
  bus.on('search', (p) => {
    const n = p && Array.isArray(p.ids) ? p.ids.length : 0
    if (p && p.query) announce(n ? `检索「${p.query}」命中 ${n} 处` : `检索「${p.query}」没有找到`)
    markDirty()
  })
  bus.on('hover', (p) => tip.onHover(p))
  bus.on('view', (v) => hud.onView(v))
  bus.on('bake', (p) => hud.onBake(p))
  bus.on('resize', () => { layoutRegister(); markDirty(); hud.onView() })
  bus.on('ready', () => { document.documentElement.classList.add('ui-ready'); hud.onView(); markDirty() })
  window.addEventListener('resize', () => { layoutRegister(); markDirty() })

  if (typeof ResizeObserver === 'function') {
    const ro = new ResizeObserver(() => { layoutRegister(); markDirty() })
    for (const el of [elSearch, elCart, elReg, elPanel, elHud]) if (el) ro.observe(el)
  }

  // 窄屏切换时同步抽屉类
  if (window.matchMedia) {
    const mq = window.matchMedia('(max-width: 759.98px)')
    const f = () => { document.documentElement.classList.toggle('has-drawer', !!panel.currentId() && mq.matches); markDirty() }
    mq.addEventListener ? mq.addEventListener('change', f) : mq.addListener(f)
  }

  // 启动时可能已经有选中（深链在 initUI 之后才解析，一般不会；防御一下）
  if (state.selection?.id) onSelect({ id: state.selection.id, prev: null })
  hud.onView()

  /* "/" 聚焦的后备：编排模块的键盘层若已处理（defaultPrevented）则跳过 */
  window.addEventListener('keydown', (e) => {
    if (e.key !== '/' || e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey) return
    const t = e.target
    if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return
    e.preventDefault()
    search.focus()
  })

  return {
    obstacles,
    closeTransient() {
      if (search.closeList()) return true
      if (register.isOpen()) { toggleRegister(false); return true }
      return false
    },
    focusSearch() { search.focus() },
  }
}
