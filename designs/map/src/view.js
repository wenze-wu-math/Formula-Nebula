/**
 * designs/map/src/view.js — 相机数学（架构师冻结，纯函数）。
 *
 * 相机 = { x, y, z }：canvas 中心对准世界点 (x, y)，z = css px / wu。
 * 屏幕坐标一律是 css px、原点在 canvas 左上角（不乘 dpr；dpr 只在 render 设置 transform 时用）。
 */
import { ZOOM_MIN_S, ZOOM_MAX_S } from './constants.js'
import { levelOf } from './rules.js'

/** 把世界矩形 b 装进 w×h 视口（四周留 pad px）所需的 z */
export function fitZoom(b, w, h, pad = 24) {
  return Math.min((w - 2 * pad) / (b.x1 - b.x0), (h - 2 * pad) / (b.y1 - b.y0))
}

export function worldToScreen(view, size, x, y) {
  return [(x - view.x) * view.z + size.w / 2, (y - view.y) * view.z + size.h / 2]
}
export function screenToWorld(view, size, sx, sy) {
  return [(sx - size.w / 2) / view.z + view.x, (sy - size.h / 2) / view.z + view.y]
}

/** 当前视口覆盖的世界矩形 */
export function visibleWorldRect(view, size) {
  const hw = size.w / 2 / view.z, hh = size.h / 2 / view.z
  return { x0: view.x - hw, y0: view.y - hh, x1: view.x + hw, y1: view.y + hh }
}

/**
 * 限制相机：缩放在 [ZOOM_MIN_S, ZOOM_MAX_S]·zFit；中心不离开 bounds（允许出界半个视口，拖拽手感不"撞墙"）。
 * @returns 新对象
 */
export function clampView(view, size, zFit, bounds) {
  const z = Math.min(ZOOM_MAX_S * zFit, Math.max(ZOOM_MIN_S * zFit, view.z))
  const x = Math.min(bounds.x1, Math.max(bounds.x0, view.x))
  const y = Math.min(bounds.y1, Math.max(bounds.y0, view.y))
  return { x, y, z }
}

/**
 * 让世界矩形 b 落在"可见区"（视口扣掉 inset）内的相机。
 * 用于 home / 搜索取景 / 选中取景。inset 让面板打开时目标不被面板挡住。
 */
export function fitBoundsView(b, size, inset, { pad = 60, minZ = 0, maxZ = Infinity } = {}) {
  const aw = Math.max(80, size.w - inset.left - inset.right)
  const ah = Math.max(80, size.h - inset.top - inset.bottom)
  const bw = Math.max(1e-6, b.x1 - b.x0), bh = Math.max(1e-6, b.y1 - b.y0)
  let z = Math.min((aw - 2 * pad) / bw, (ah - 2 * pad) / bh)
  z = Math.min(maxZ, Math.max(minZ, z))
  return centerOn((b.x0 + b.x1) / 2, (b.y0 + b.y1) / 2, z, size, inset)
}

/** 相机使世界点 (x,y) 落在可见区中心（考虑 inset 偏移） */
export function centerOn(x, y, z, size, inset) {
  const dx = (inset.right - inset.left) / 2 / z
  const dy = (inset.bottom - inset.top) / 2 / z
  return { x: x + dx, y: y + dy, z }
}

/**
 * 每帧构造一次的"帧上下文"，render 与 labels 都只读它（结构见 SPEC §5.2）。
 * @param {object} state  state.js 的 state
 * @param {Array<{x,y,w,h}>} uiRects  UI 浮层的屏幕矩形（labels 要避让）
 * @param {number} now performance.now()
 */
export function makeFrame(state, uiRects, now) {
  const { view, size, zFit, selection, hover, search } = state
  const s = view.z / zFit
  const level = levelOf(s)
  const vw = visibleWorldRect(view, size)
  return {
    view, size, zFit, s, level, now,
    visibleWorld: vw,
    selectedId: selection.id,
    neighbours: selection.neighbours,
    linkKeys: selection.linkKeys,
    selectT0: selection.t0,
    hoverId: hover.id,
    hoverLinkKey: hover.linkKey,
    hits: search.set,
    roadOptions: state.roadOptions || { showCross: false },
    uiRects: uiRects || [],
    toScreen: (x, y) => [(x - view.x) * view.z + size.w / 2, (y - view.y) * view.z + size.h / 2],
  }
}
