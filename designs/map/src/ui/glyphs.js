/**
 * designs/map/src/ui/glyphs.js — 界面里的小地图符号（图例、面板、建议下拉、名录共用）。
 *
 * 取舍：图例必须与画布上的符号"一模一样"，所以这里不画图标字体或 emoji，
 * 而是用与 render 相同的 constants 数值（CITY_SYMBOL / ISLAND_STATUS / ROAD_STYLE / PORT）
 * 在小 <canvas> 上按 dpr 重画一遍。尺寸取 level 1（symbolScale = 1）时的屏幕尺寸。
 * 所有函数只返回 DOM 元素，不读数据文本。
 */
import { COUNTRY_COLORS, CITY_SYMBOL, SYMBOL_STROKE, ISLAND_STATUS, ROAD_STYLE, PORT, ROUTE_TYPE_COLORS, OCEAN } from '../constants.js'

/** 图例中性墨色（城市符号在图例里不属于任何一国，用国界灰褐的深色版） */
export const LEGEND_INK = '#4a4236'

/** 建一个按 dpr 放大的小 canvas，在 css 尺寸 (w,h) 坐标系里调用 draw(ctx) */
export function glyphCanvas(w, h, draw, cls = 'ui-glyph') {
  const c = document.createElement('canvas')
  const dpr = Math.min(3, Math.max(1, window.devicePixelRatio || 1))
  c.width = Math.round(w * dpr); c.height = Math.round(h * dpr)
  c.style.width = w + 'px'; c.style.height = h + 'px'
  c.className = cls
  c.setAttribute('aria-hidden', 'true')
  const ctx = c.getContext('2d')
  if (ctx) { ctx.scale(dpr, dpr); draw(ctx) }
  return c
}

/* ───────── 底层绘制（ctx, 中心, 参数） ───────── */

function star(ctx, x, y, R, r, n = 5) {
  ctx.beginPath()
  for (let i = 0; i < n * 2; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / n
    const rr = i % 2 ? r : R
    ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr)
  }
  ctx.closePath()
}

/** 城市符号（与 SPEC §3.3 一致）。tier 0 首都 / 1 大城市 / 2 城镇 / 3 村落 */
export function drawCity(ctx, x, y, tier, ink, k = 1) {
  const r = CITY_SYMBOL[tier].r * k
  ctx.save()
  if (tier === 0) {
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fillStyle = '#fff'; ctx.fill()
    ctx.lineWidth = 1.6; ctx.strokeStyle = ink; ctx.stroke()
    star(ctx, x, y, r * 0.62, r * 0.62 * 0.42)
    ctx.fillStyle = ink; ctx.fill()
  } else if (tier === 1) {
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fillStyle = '#fff'; ctx.fill()
    ctx.lineWidth = 2; ctx.strokeStyle = ink; ctx.stroke()
    ctx.beginPath(); ctx.arc(x, y, r * 0.38, 0, Math.PI * 2)
    ctx.fillStyle = ink; ctx.fill()
  } else if (tier === 2) {
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fillStyle = ink; ctx.fill()
    ctx.lineWidth = 1; ctx.strokeStyle = SYMBOL_STROKE; ctx.stroke()
  } else {
    ctx.globalAlpha = 0.85
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fillStyle = ink; ctx.fill()
  }
  ctx.restore()
}

/** 白色锚形（路径画，不依赖 ⚓ 字体）。r = 港口圆半径 */
function anchor(ctx, x, y, r, color) {
  ctx.save()
  ctx.strokeStyle = color; ctx.lineWidth = Math.max(0.9, r * 0.22); ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.arc(x, y - r * 0.5, r * 0.17, 0, Math.PI * 2)            // 锚环
  ctx.moveTo(x, y - r * 0.33); ctx.lineTo(x, y + r * 0.6)        // 锚杆
  ctx.moveTo(x - r * 0.34, y - r * 0.12); ctx.lineTo(x + r * 0.34, y - r * 0.12)   // 横杆
  ctx.moveTo(x - r * 0.55, y + r * 0.12)
  ctx.quadraticCurveTo(x - r * 0.45, y + r * 0.62, x, y + r * 0.6)   // 锚爪
  ctx.quadraticCurveTo(x + r * 0.45, y + r * 0.62, x + r * 0.55, y + r * 0.12)
  ctx.stroke()
  ctx.restore()
}

/** 研究者港口：实心圆 + 白锚；pier=true 时左侧加一段栈桥线 */
export function drawPort(ctx, x, y, k = 1, pier = false) {
  const r = PORT.r * k
  ctx.save()
  if (pier) {
    ctx.strokeStyle = PORT.color; ctx.lineWidth = 1.2
    ctx.beginPath(); ctx.moveTo(x - r - 7, y + 3); ctx.lineTo(x - r * 0.6, y + 1); ctx.stroke()
  }
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2)
  ctx.fillStyle = PORT.color; ctx.fill()
  anchor(ctx, x, y, r, '#fff')
  ctx.restore()
}

/** 有机小岛轮廓（固定的低频扰动，图例用；画布上的岛形由 world 生成） */
function islandPath(ctx, x, y, r) {
  ctx.beginPath()
  const n = 36
  for (let i = 0; i <= n; i++) {
    const t = (i / n) * Math.PI * 2
    const rr = r * (1 + 0.16 * Math.sin(3 * t + 0.7) + 0.09 * Math.sin(5 * t + 2.1))
    const px = x + Math.cos(t) * rr * 1.18, py = y + Math.sin(t) * rr * 0.86
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py)
  }
  ctx.closePath()
}

/** 岛屿状态符号（填色 / 斜线 / 海岸线型 / 旗或 ×），与 ISLAND_STATUS 一致 */
export function drawIsland(ctx, x, y, r, status) {
  const st = ISLAND_STATUS[status] || ISLAND_STATUS.open
  ctx.save()
  islandPath(ctx, x, y, r)
  if (st.fill) { ctx.fillStyle = st.fill; ctx.fill() }
  if (st.hatch) {
    ctx.save(); ctx.clip()
    ctx.strokeStyle = st.ink; ctx.globalAlpha = 0.25; ctx.lineWidth = 0.8
    ctx.beginPath()
    for (let d = -r * 3; d < r * 3; d += 4) { ctx.moveTo(x + d - r * 2, y + r * 2); ctx.lineTo(x + d + r * 2, y - r * 2) }
    ctx.stroke(); ctx.restore()
  }
  islandPath(ctx, x, y, r)
  ctx.setLineDash(st.coastDash || [])
  ctx.lineWidth = 1.2; ctx.strokeStyle = st.coast; ctx.stroke()
  ctx.setLineDash([])
  if (st.mark === 'flag') {
    ctx.strokeStyle = '#3d6a33'; ctx.lineWidth = 1.1
    ctx.beginPath(); ctx.moveTo(x - 1, y + 4.5); ctx.lineTo(x - 1, y - 4.5); ctx.stroke()
    ctx.fillStyle = '#3d6a33'
    ctx.beginPath(); ctx.moveTo(x - 1, y - 4.5); ctx.lineTo(x + 5, y - 2.5); ctx.lineTo(x - 1, y - 0.5); ctx.closePath(); ctx.fill()
  } else if (st.mark === 'cross') {
    ctx.strokeStyle = st.ink; ctx.lineWidth = 1.4; ctx.lineCap = 'round'
    const s = Math.min(3.5, r * 0.45)
    ctx.beginPath(); ctx.moveTo(x - s, y - s); ctx.lineTo(x + s, y + s); ctx.moveTo(x + s, y - s); ctx.lineTo(x - s, y + s); ctx.stroke()
  }
  ctx.restore()
}

/** 一小段道路示意：casing + core 两遍描边；航线类为虚线。kind 同 road.kind */
export function drawRoad(ctx, x0, y0, x1, y1, kind) {
  const s = ROAD_STYLE[kind]
  if (!s) return
  ctx.save()
  ctx.lineCap = 'round'
  // 一点弯度，像地图上的路而不是直尺线
  const mx = (x0 + x1) / 2, my = (y0 + y1) / 2 - 3
  const path = () => { ctx.beginPath(); ctx.moveTo(x0, y0); ctx.quadraticCurveTo(mx, my, x1, y1) }
  if (s.casing) {
    path(); ctx.strokeStyle = s.casing; ctx.lineWidth = s.w; ctx.stroke()
    path(); ctx.strokeStyle = s.core; ctx.lineWidth = s.cw; ctx.stroke()
  } else {
    ctx.lineCap = 'butt'
    ctx.setLineDash(s.dash || [])
    path(); ctx.strokeStyle = s.color; ctx.lineWidth = s.w; ctx.stroke()
  }
  ctx.restore()
}

/* ───────── 现成的 DOM 小符号 ───────── */

export function cityGlyph(tier, ink = LEGEND_INK, size = 18) {
  return glyphCanvas(size, size, (ctx) => drawCity(ctx, size / 2, size / 2, tier, ink))
}
export function portGlyph(size = 18, pier = false) {
  const w = pier ? size + 8 : size
  return glyphCanvas(w, size, (ctx) => drawPort(ctx, w - size / 2, size / 2, 1, pier))
}
export function islandGlyph(status, w = 26, h = 18) {
  // 图例岛屿放在一小片近岸浅水色上，否则"幻岛"（无填色）在纸面上看不出是海上的东西
  return glyphCanvas(w, h, (ctx) => {
    ctx.fillStyle = OCEAN.shallow
    roundRect(ctx, 0.5, 0.5, w - 1, h - 1, 3); ctx.fill()
    drawIsland(ctx, w / 2, h / 2, Math.min(w, h) * 0.3, status)
  })
}
export function roadGlyph(kind, w = 34, h = 14) {
  return glyphCanvas(w, h, (ctx) => drawRoad(ctx, 3, h / 2 + 2, w - 3, h / 2 + 2, kind))
}
/** 关系类型色点 */
export function typeDot(type) {
  const s = document.createElement('span')
  s.className = 'ui-typedot'
  s.style.background = ROUTE_TYPE_COLORS[type] || ROUTE_TYPE_COLORS.related
  s.setAttribute('aria-hidden', 'true')
  return s
}
/** 国家 / 状态色块（land 填色 + ink 细边） */
export function swatch(fill, edge, cls = 'ui-swatch') {
  const s = document.createElement('span')
  s.className = cls
  s.style.background = fill || 'transparent'
  s.style.borderColor = edge || 'rgba(0,0,0,.25)'
  s.setAttribute('aria-hidden', 'true')
  return s
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath()
}

/** 一个 place 的"类型小符号"：城市按 tier（本国 ink）/ 岛屿按状态 / 港口锚。建议下拉与面板关联行共用 */
export function placeGlyph(place, size = 16) {
  if (!place) return glyphCanvas(size, size, () => {})
  if (place.kind === 'island') return islandGlyph(place.status, size + 6, size)
  if (place.kind === 'port') return portGlyph(size)
  const ink = (place.country && countryInk(place.country)) || LEGEND_INK
  return cityGlyph(place.tier, ink, size)
}

function countryInk(f) { return COUNTRY_COLORS[f]?.ink }

/** DOM 辅助：createElement + class + 文本（只用 textContent） */
export function h(tag, cls, text) {
  const e = document.createElement(tag)
  if (cls) e.className = cls
  if (text != null) e.textContent = String(text)
  return e
}
