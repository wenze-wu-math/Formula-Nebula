/**
 * render/roads.js — 道路与航线（SPEC §7.2 第 9、11、12 层）。
 *
 * 取舍：
 *  · 端点固定、与缩放无关 → 每个 kind 一条 Path2D（ferry 再按 hero 拆两条，因为 roadVisible 对它分级），
 *    构造时建好，每帧只设线宽重描。1670 条贝塞尔一次 stroke 远比逐条 stroke 便宜。
 *  · 陆路两遍描边（casing 底 + core 芯）按 kind 分组：同一 kind 先画全部 casing 再画全部 core，
 *    这样交叉口处芯线连成一片，像真正的路网；kind 之间按 road → crossroad → highway → crossway 叠放（重要的在上）。
 *  · roadAlpha < 1 时 casing 与 core 各自乘 alpha，交叠处会略深 —— 等价于"半透明路网"，比离屏合成便宜得多。
 *
 * 2026-11-01（道路密度修正）：跨族道路（crossway / crossroad）默认不画。Path2D 按"当前开关 + top-N 集合"
 * 缓存：签名不变就复用，只有用户切换开关时才重建一次（重建 1670 条贝塞尔 ~几 ms，可接受）。
 */
import { ROAD_STYLE, PORT } from '../constants.js'
import { roadVisible, roadAlpha, topCrossRoadKeys, CROSS_ROAD_SHOW_N } from '../rules.js'

export const LAND_KINDS = ['road', 'crossroad', 'highway', 'crossway']
const CROSS_KINDS = new Set(['crossway', 'crossroad'])

function addRoad(path, rd) {
  path.moveTo(rd.x0, rd.y0)
  path.quadraticCurveTo(rd.cx, rd.cy, rd.x1, rd.y1)
}

/** 某组道路在当前级别是否画、alpha 多少（同组的 roadVisible / roadAlpha 只依赖 kind 与 hero） */
function groupState(sample, level, opt) {
  if (!sample) return null
  if (!roadVisible(sample, level, opt)) return null
  return roadAlpha(sample, level)
}

/**
 * @param world
 * @param {{showCross?: boolean}} [opt] showCross=true 时只画权重最高的 CROSS_ROAD_SHOW_N 条跨族道路
 */
export function buildRoads(world, opt = {}) {
  const showCross = !!opt.showCross
  const keep = showCross ? topCrossRoadKeys(world.roads, CROSS_ROAD_SHOW_N) : null
  const groups = new Map()   // gid → {path, sample, count}
  const gid = (rd) => (rd.kind === 'ferry' ? (rd.hero ? 'ferry:hero' : 'ferry') : rd.kind)
  for (const rd of world.roads) {
    if (rd.kind === 'expedition') continue           // 只在选中时作为高亮路线出现
    if (CROSS_KINDS.has(rd.kind) && (!keep || !keep.has(rd.key))) continue
    const k = gid(rd)
    let g = groups.get(k)
    if (!g) { g = { path: new Path2D(), sample: rd, count: 0 }; groups.set(k, g) }
    addRoad(g.path, rd)
    g.count++
  }
  // 栈桥：pier → 港口符号
  const piers = new Path2D()
  let pierCount = 0
  for (const p of world.places) {
    if (p.kind !== 'port' || !p.pier) continue
    piers.moveTo(p.pier.x, p.pier.y); piers.lineTo(p.x, p.y); pierCount++
  }
  const crossCount = (groups.get('crossway')?.count || 0) + (groups.get('crossroad')?.count || 0)
  return { groups, piers, pierCount, showCross, crossCount }
}

/** 按当前选项取（必要时重建）道路几何；签名不变则复用上一份 */
export function roadsFor(world, opt, cache) {
  const sig = opt.showCross ? `cross:${CROSS_ROAD_SHOW_N}` : 'cross:0'
  if (cache && cache.sig === sig) return cache.rb
  const rb = buildRoads(world, opt)
  if (cache) { cache.sig = sig; cache.rb = rb }
  return rb
}

/** 当前级别 + 选项下**真正会画出来**的道路条数（按 kind 分组）。给 stats 提供机器证据。 */
export function drawnRoadCounts(rb, level, opt) {
  const out = {}
  for (const [gid, g] of rb.groups) {
    if (!g || !g.sample) continue
    if (!roadVisible(g.sample, level, opt)) continue
    out[gid] = g.count
  }
  return out
}

/** 第 9 层：航线（ferry）与海道（lane），岛屿之下 */
export function drawSeaRoutes(ctx, rb, level, z, opt) {
  const iz = 1 / z
  ctx.lineCap = 'round'
  for (const gid of ['lane', 'ferry', 'ferry:hero']) {
    const g = rb.groups.get(gid)
    const a = groupState(g?.sample, level, opt)
    if (a == null) continue
    const st = ROAD_STYLE[g.sample.kind]
    ctx.globalAlpha = a
    ctx.strokeStyle = st.color
    ctx.lineWidth = st.w * iz
    ctx.setLineDash(st.dash.map((d) => d * iz))
    ctx.stroke(g.path)
  }
  ctx.setLineDash([])
  ctx.globalAlpha = 1
}

/** 第 11 层：陆路，两遍描边（添加手绘波浪线效果） */
export function drawLandRoads(ctx, rb, level, z, opt) {
  const iz = 1 / z
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.setLineDash([])

  // 手绘效果：在较大缩放级别添加微阴影
  const useHandDrawn = z > 0.8

  for (const kind of LAND_KINDS) {
    const g = rb.groups.get(kind)
    const a = groupState(g?.sample, level, opt)
    if (a == null) continue
    const st = ROAD_STYLE[kind]
    ctx.globalAlpha = a

    // Casing 层
    ctx.strokeStyle = st.casing
    ctx.lineWidth = st.w * iz
    if (useHandDrawn) {
      ctx.save()
      ctx.shadowColor = 'rgba(0,0,0,0.06)'
      ctx.shadowBlur = 0.4 * iz
      ctx.shadowOffsetX = 0.15 * iz
      ctx.shadowOffsetY = 0.15 * iz
    }
    ctx.stroke(g.path)
    if (useHandDrawn) ctx.restore()

    // Core 层（芯线）
    ctx.strokeStyle = st.core
    ctx.lineWidth = st.cw * iz
    ctx.stroke(g.path)
  }
  ctx.globalAlpha = 1
}

/** 第 12 层：港口栈桥（1.2px，港口色）。L0 时淡一些，免得 24 根短线在总览里像毛刺 */
export function drawPiers(ctx, rb, level, z) {
  if (!rb.pierCount) return
  ctx.globalAlpha = level === 0 ? 0.6 : 0.9
  ctx.strokeStyle = PORT.color
  ctx.lineWidth = 1.2 / z
  ctx.lineCap = 'round'
  ctx.setLineDash([])
  ctx.stroke(rb.piers)
  ctx.globalAlpha = 1
}
