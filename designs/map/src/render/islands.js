/**
 * render/islands.js — 猜想岛屿（SPEC §7.2 第 10 层；旗 / × 记号在 symbols.js 的第 16 层）。
 *
 * 状态 → 制图符号（ISLAND_STATUS）：
 *   open 羊皮纸 + 虚线海岸；partial 浅黄 + 45° 细斜线 + 点划海岸；proved 绿地 + 实线；
 *   disproved 不填色（透出海）+ 点状海岸；heuristic 淡紫 + 点状海岸。
 * 取舍：
 *  · 岛形是世界尺寸的陆地，随缩放变大；海岸虚线却是屏幕固定节距（dash / z），远看近看都是"虚线海岸"。
 *  · 同状态的岛合成一条 Path2D：填色 1 次、描边 1 次。斜线必须逐岛 clip（clip 的是岛形），
 *    但 partial 只有 9 个，且只处理视口内的。
 *  · 斜线用屏幕坐标画（间距 4px 恒定），clip 在世界 transform 下设置 —— clip 区域在设置时就固定为设备像素，
 *    之后切换 transform 不影响它。
 *  · 遮罩（第 14 层）会把岛屿也压淡；选中 / 邻居 / 命中的岛由 drawIslandEmphasis 在遮罩之上重画一次（SPEC 未写明，见交付说明）。
 */
import { ISLAND_STATUS } from '../constants.js'
import { addRing } from './basemap.js'

const STATUS_ORDER = ['open', 'partial', 'heuristic', 'proved', 'disproved']
const HATCH_PX = 4
const COAST_W = 1.2

function styleOf(status) { return ISLAND_STATUS[status] || ISLAND_STATUS.open }

function ringOf(p) {
  if (p.ring && p.ring.length >= 6) return p.ring
  // 兜底：没有岛形就用圆
  const n = 24, a = new Float32Array(n * 2)
  for (let i = 0; i < n; i++) { const t = (i / n) * Math.PI * 2; a[2 * i] = p.x + Math.cos(t) * p.r; a[2 * i + 1] = p.y + Math.sin(t) * p.r }
  return a
}

export function buildIslands(world) {
  const list = []
  const byStatus = new Map()
  for (const p of world.places) {
    if (p.kind !== 'island') continue
    const ring = ringOf(p)
    const path = new Path2D()
    addRing(path, ring)
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity
    for (let i = 0; i < ring.length; i += 2) {
      x0 = Math.min(x0, ring[i]); x1 = Math.max(x1, ring[i]); y0 = Math.min(y0, ring[i + 1]); y1 = Math.max(y1, ring[i + 1])
    }
    const st = ISLAND_STATUS[p.status] ? p.status : 'open'
    const it = { p, path, ring, status: st, bbox: { x0, y0, x1, y1 } }
    list.push(it)
    if (!byStatus.has(st)) byStatus.set(st, new Path2D())
    byStatus.get(st).addPath(path)
  }
  return { list, byStatus, byId: new Map(list.map((it) => [it.p.id, it])) }
}

function inView(bb, vw, m) { return bb.x1 >= vw.x0 - m && bb.x0 <= vw.x1 + m && bb.y1 >= vw.y0 - m && bb.y0 <= vw.y1 + m }

/** 斜线：在 clip(岛形) 下以屏幕坐标画 45° 细线。xf 提供 world()/screen() 切换 */
function hatch(ctx, it, xf, frame) {
  const st = styleOf(it.status)
  ctx.save()
  xf.world()
  ctx.clip(it.path)
  xf.screen()
  const [ax, ay] = frame.toScreen(it.bbox.x0, it.bbox.y0)
  const [bx, by] = frame.toScreen(it.bbox.x1, it.bbox.y1)
  ctx.beginPath()
  // 45° 线 x - y = c；c 以 HATCH_PX·√2 为步长对齐到屏幕整格，平移时斜线不"游动"太明显
  const step = HATCH_PX * Math.SQRT2
  const c0 = Math.floor((ax - by) / step) * step, c1 = bx - ay
  for (let c = c0; c <= c1; c += step) { ctx.moveTo(ay + c, ay); ctx.lineTo(by + c, by) }
  ctx.strokeStyle = st.ink
  ctx.globalAlpha = 0.25
  ctx.lineWidth = 0.8
  ctx.setLineDash([])
  ctx.stroke()
  ctx.restore()
}

function strokeCoast(ctx, path, st, z, wMul = 1) {
  ctx.strokeStyle = st.coast
  ctx.lineWidth = COAST_W * wMul / z
  ctx.setLineDash(st.coastDash ? st.coastDash.map((d) => d / z) : [])
  ctx.stroke(path)
}

/** 第 10 层：全部岛屿（ctx 处于世界 transform；结束时仍是世界 transform） */
export function drawIslands(ctx, ib, xf, frame) {
  const z = frame.view.z
  ctx.lineJoin = 'round'
  ctx.lineCap = 'butt'
  for (const s of STATUS_ORDER) {
    const path = ib.byStatus.get(s)
    if (!path) continue
    const st = styleOf(s)
    if (st.fill) { ctx.fillStyle = st.fill; ctx.fill(path) }
  }
  // partial 斜线（视口内逐岛 clip）
  for (const it of ib.list) {
    if (!styleOf(it.status).hatch) continue
    if (!inView(it.bbox, frame.visibleWorld, 10)) continue
    if ((it.bbox.x1 - it.bbox.x0) * z < 5) continue   // 太小就不画斜线，免得糊成一团
    hatch(ctx, it, xf, frame)
  }
  xf.world()
  for (const s of STATUS_ORDER) {
    const path = ib.byStatus.get(s)
    if (path) strokeCoast(ctx, path, styleOf(s), z)
  }
  ctx.setLineDash([])
}

/**
 * 遮罩之上重画强调的岛（选中 / 邻居 / 命中 / 悬停）：保证它们不被第 14 层压淡。
 * @param {Iterable<string>} ids
 */
export function drawIslandEmphasis(ctx, ib, xf, frame, ids, hoverId) {
  const z = frame.view.z
  xf.world()
  ctx.lineJoin = 'round'
  for (const id of ids) {
    const it = ib.byId.get(id)
    if (!it || !inView(it.bbox, frame.visibleWorld, 10)) continue
    const st = styleOf(it.status)
    if (st.fill) { ctx.fillStyle = st.fill; ctx.fill(it.path) }
    if (st.hatch && (it.bbox.x1 - it.bbox.x0) * z >= 5) { hatch(ctx, it, xf, frame); xf.world() }
    strokeCoast(ctx, it.path, st, z, id === hoverId ? 1.8 : 1.3)
  }
  ctx.setLineDash([])
}

/** 点是否落在岛形内（世界坐标；pick 用） */
export function pointInRing(ring, x, y) {
  let inside = false
  for (let i = 0, j = ring.length - 2; i < ring.length; j = i, i += 2) {
    const xi = ring[i], yi = ring[i + 1], xj = ring[j], yj = ring[j + 1]
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside
  }
  return inside
}
