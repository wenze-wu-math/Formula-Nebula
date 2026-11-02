/**
 * render/highlight.js — 选中后的高亮路线（SPEC §7.2 第 15 层）。
 *
 * 白色 6px casing + 关系类型色 3.2px 芯；航线 / 海道 / 探险路线的芯保留各自的虚线语汇（节距随线宽放大）。
 * "画出"动画：SPEC 建议用 setLineDash + lineDashOffset；但那样虚线芯就没法同时保留自己的虚线，
 * 所以这里改用 de Casteljau 把二次贝塞尔在参数 t 处截断，只画 [0, t] 段 —— 视觉等价（从选中点向外"长出"），
 * 且任何线型都适用。路线方向统一从选中节点出发。
 */
import { ROUTE, ROUTE_TYPE_COLORS } from '../constants.js'

/** 高亮时虚线芯的节距（屏幕 px，按 3.2px 芯宽重新定的；round cap 让 0 长度的段成为圆点） */
const CORE_DASH = {
  ferry: [8, 6],
  lane: [0.01, 6.5],
  expedition: [11, 5, 0.01, 5],
}
const HOVER_CORE_W = 5
const HOVER_CASING_W = 8.5
const EDGE_COLOR = 'rgba(40,50,60,.22)'

function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3) }

/** 二次贝塞尔 [0,t] 子段（可选反向，使起点 = 选中节点） */
function subCurve(rd, t, reverse) {
  let ax = rd.x0, ay = rd.y0, bx = rd.x1, by = rd.y1
  if (reverse) { ax = rd.x1; ay = rd.y1; bx = rd.x0; by = rd.y0 }
  const cx = rd.cx, cy = rd.cy
  if (t >= 1) return [ax, ay, cx, cy, bx, by]
  const q0x = ax + (cx - ax) * t, q0y = ay + (cy - ay) * t
  const q1x = cx + (bx - cx) * t, q1y = cy + (by - cy) * t
  return [ax, ay, q0x, q0y, q0x + (q1x - q0x) * t, q0y + (q1y - q0y) * t]
}

function roadInView(rd, vw, m) {
  const x0 = Math.min(rd.x0, rd.cx, rd.x1), x1 = Math.max(rd.x0, rd.cx, rd.x1)
  const y0 = Math.min(rd.y0, rd.cy, rd.y1), y1 = Math.max(rd.y0, rd.cy, rd.y1)
  return x1 >= vw.x0 - m && x0 <= vw.x1 + m && y1 >= vw.y0 - m && y0 <= vw.y1 + m
}

/**
 * @returns {boolean} 画出动画是否仍在进行
 */
export function drawHighlight(ctx, world, frame) {
  const keys = frame.linkKeys
  if (!frame.selectedId || !keys || keys.size === 0) return false
  const z = frame.view.z, iz = 1 / z
  const vw = frame.visibleWorld, m = 40 * iz
  const dt = frame.selectT0 ? frame.now - frame.selectT0 : Infinity
  const raw = Math.max(0, Math.min(1, dt / ROUTE.drawInMs))
  const t = easeOutCubic(raw)
  const animating = raw < 1

  const list = []
  let hover = null
  for (const key of keys) {
    const rd = world.roadByKey.get(key)
    if (!rd || !roadInView(rd, vw, m)) continue
    if (key === frame.hoverLinkKey) hover = rd
    else list.push(rd)
  }
  if (!list.length && !hover) return animating
  list.sort((a, b) => (a.weight || 0) - (b.weight || 0))   // 强关联画在上面
  if (hover) list.push(hover)

  const sel = frame.selectedId
  const geo = list.map((rd) => subCurve(rd, t, rd.b === sel && rd.a !== sel))
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  // casing：普通路线合成一条 path 一次描完（避免逐条白边互相切断芯线）
  ctx.setLineDash([])
  const casing = new Path2D()
  for (let i = 0; i < list.length; i++) { const g = geo[i]; casing.moveTo(g[0], g[1]); casing.quadraticCurveTo(g[2], g[3], g[4], g[5]) }
  // 白 casing 落在纸色遮罩上几乎无对比，先垫一圈很淡的暗边（宽 +1.6px），让路线从遮罩里"浮"出来（SPEC 之外的增补）
  ctx.strokeStyle = EDGE_COLOR
  ctx.lineWidth = (ROUTE.casingW + 1.6) * iz
  ctx.stroke(casing)
  ctx.strokeStyle = ROUTE.casing
  ctx.globalAlpha = 0.95
  ctx.lineWidth = ROUTE.casingW * iz
  ctx.stroke(casing)
  ctx.globalAlpha = 1

  for (let i = 0; i < list.length; i++) {
    const rd = list[i], g = geo[i]
    const isHover = rd === hover
    if (isHover) {
      // 悬停路线：加粗的 casing 单独画在最上面
      ctx.setLineDash([])
      ctx.strokeStyle = ROUTE.casing
      ctx.lineWidth = HOVER_CASING_W * iz
      ctx.beginPath(); ctx.moveTo(g[0], g[1]); ctx.quadraticCurveTo(g[2], g[3], g[4], g[5]); ctx.stroke()
    }
    const dash = CORE_DASH[rd.kind]
    ctx.setLineDash(dash ? dash.map((d) => d * iz) : [])
    ctx.strokeStyle = ROUTE_TYPE_COLORS[rd.type] || ROUTE_TYPE_COLORS.related
    ctx.lineWidth = (isHover ? HOVER_CORE_W : ROUTE.coreW) * iz
    ctx.beginPath(); ctx.moveTo(g[0], g[1]); ctx.quadraticCurveTo(g[2], g[3], g[4], g[5]); ctx.stroke()
  }
  ctx.setLineDash([])
  return animating
}
