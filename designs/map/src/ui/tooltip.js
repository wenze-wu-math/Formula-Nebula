/**
 * designs/map/src/ui/tooltip.js — 画布悬停提示（SPEC §9.9）。
 *
 * 'hover' 事件只在悬停目标变化时发出；提示框显示期间这里另外监听 canvas 的 pointermove，
 * 让提示框跟着指针走（只读事件坐标，不改状态）。拖拽中（#map.is-dragging 或按键按下）隐藏。
 * 不显示公式：地图标签上已经有了，提示框只补"它是谁、在哪"。
 */
import { h } from './glyphs.js'
import { placeOf, longWhere } from './describe.js'

const OFF = 14

export function createTooltip(root, { graph, world, canvas }) {
  root.textContent = ''
  root.classList.add('ui-tooltip')
  const l1 = h('div', 'ui-tt-l1')
  const name = h('span', 'ui-tt-name')
  const en = h('span', 'ui-tt-en')
  l1.append(name, en)
  const l2 = h('div', 'ui-tt-l2')
  root.append(l1, l2)
  root.hidden = true

  let id = null
  let px = 0, py = 0   // 相对视口（client）坐标
  let dragging = false

  function place() {
    const r = root.getBoundingClientRect()
    const vw = window.innerWidth, vh = window.innerHeight
    let x = px + OFF, y = py + OFF
    if (x + r.width > vw - 8) x = px - OFF - r.width     // 贴右边 → 翻到左侧
    if (y + r.height > vh - 8) y = py - OFF - r.height   // 贴底边 → 翻到上方
    root.style.transform = `translate(${Math.max(4, Math.round(x))}px, ${Math.max(4, Math.round(y))}px)`
  }

  function show(nid, sx, sy) {
    const n = graph.byId.get(nid)
    if (!n) { hide(); return }
    id = nid
    const p = placeOf(world, graph, nid)
    name.textContent = n.name
    en.textContent = n.en && n.en !== n.name ? n.en : ''
    l2.textContent = longWhere(p)
    if (Number.isFinite(sx) && Number.isFinite(sy) && canvas) {
      const cr = canvas.getBoundingClientRect()
      px = cr.left + sx; py = cr.top + sy
    }
    if (dragging || canvas?.classList.contains('is-dragging')) { root.hidden = true; return }
    root.hidden = false
    place()
  }
  function hide() { id = null; root.hidden = true }

  if (canvas) {
    canvas.addEventListener('pointermove', (e) => {
      px = e.clientX; py = e.clientY
      dragging = e.buttons !== 0
      if (!id) return
      if (dragging) { root.hidden = true; return }
      if (root.hidden) root.hidden = false
      place()
    })
    canvas.addEventListener('pointerdown', () => { dragging = true; root.hidden = true })
    canvas.addEventListener('pointerup', () => { dragging = false })
    canvas.addEventListener('pointerleave', hide)
    canvas.addEventListener('wheel', () => { root.hidden = true }, { passive: true })
  }

  return {
    onHover(p) {
      if (p && p.id) show(p.id, p.sx, p.sy)
      else hide()
    },
    hide,
  }
}
