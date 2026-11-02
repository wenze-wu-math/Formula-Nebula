/**
 * render/basemap.js — 底图图层（SPEC §7.2 第 1–8 层）：海洋栅格、经纬网、等深线、国家填色、
 * 地形晕渲、国界内侧色带、国界、海岸线。
 *
 * 取舍：
 *  · 全部几何在构造时一次性转成世界坐标的 Path2D；每帧只换 transform 和 lineWidth（= px / z），
 *    浏览器自己做视口裁剪。这样无论 world 是占位版（圆）还是真实版（几千点的海岸）每帧开销都只是若干次 stroke/fill。
 *  · 国界内侧色带靠 clip(本国) + 双倍宽描边实现：描边一半落在国外被 clip 掉，只剩本国一侧 7px。
 *    海岸处同样会出现一圈内侧色带 —— 政区图常见的"沿岸晕色"，有意保留（SPEC §7.2-6）。
 *  · 对 rasters=null（Node 构建 / 占位 world）、borders=[]、ripples 与 RIPPLES 长度不符 都要能画。
 */
import {
  OCEAN, RIPPLES, GRATICULE_STEP, BORDER, COAST, RELIEF, WORLD_BOUNDS,
} from '../constants.js'

/** Float32Array 闭合环 / 开放折线 → 追加进 Path2D */
export function addRing(path, ring, closed = true) {
  if (!ring || ring.length < 4) return
  path.moveTo(ring[0], ring[1])
  for (let i = 2; i < ring.length; i += 2) path.lineTo(ring[i], ring[i + 1])
  if (closed) path.closePath()
}

/** 构造时缓存底图的全部 Path2D */
export function buildBasemap(world) {
  const b = world.bounds || WORLD_BOUNDS

  // 国家：每国一条 Path2D（外环 + 离岸小岛环；不做洞，用 nonzero 填充即可）
  const countries = world.countries.map((c) => {
    const p = new Path2D()
    for (const r of c.rings || []) addRing(p, r)
    return { c, path: p }
  })

  // 全部海岸（大陆）：晕渲 clip 与海岸描边共用。若 world.coast 为空就退回到国家环的并
  const coast = new Path2D()
  const coastRings = world.coast && world.coast.length ? world.coast : world.countries.flatMap((c) => c.rings || [])
  for (const r of coastRings) addRing(coast, r)
  const landClip = new Path2D()
  for (const { path } of countries) landClip.addPath(path)

  // 国界：开放折线，合成一条
  const borders = new Path2D()
  for (const bd of world.borders || []) addRing(borders, bd.pts, false)
  const hasBorders = (world.borders || []).length > 0

  // 等深线：与 RIPPLES 按 d 对应（world 理应一一对应，这里按 d 查表更稳）
  const ripples = (world.ripples || []).map((rp, i) => {
    const style = RIPPLES.find((s) => s.d === rp.d) || RIPPLES[Math.min(i, RIPPLES.length - 1)]
    const p = new Path2D()
    for (const r of rp.rings || []) addRing(p, r)
    return { style, path: p }
  })

  // 经纬网：bounds 内每 GRATICULE_STEP 一条（含 0 线）
  const graticule = new Path2D()
  const st = GRATICULE_STEP
  for (let x = Math.ceil(b.x0 / st) * st; x <= b.x1; x += st) { graticule.moveTo(x, b.y0); graticule.lineTo(x, b.y1) }
  for (let y = Math.ceil(b.y0 / st) * st; y <= b.y1; y += st) { graticule.moveTo(b.x0, y); graticule.lineTo(b.x1, y) }

  return { bounds: b, countries, coast, landClip, borders, hasBorders, ripples, graticule }
}

/**
 * 画第 1–8 层。调用时 ctx 已是世界层 transform。
 * @param {CanvasRenderingContext2D} ctx
 * @param {object} bm buildBasemap 的结果
 * @param {object} world
 * @param {number} z 当前缩放（css px / wu）
 * @param {object} vw frame.visibleWorld（只用来填满屏幕的底色）
 */
export function drawBasemap(ctx, bm, world, z, vw) {
  const iz = 1 / z
  // 1. 海洋：有栅格时先用最深色铺满视口（栅格边缘离岸 > 360wu，本身就是 deepest，接缝不可见），再贴距离场栅格；
  //    无栅格时整个视口用 deep 纯色（只在 bounds 内填会在世界边界留下一道硬边）
  const rs = world.rasters
  ctx.fillStyle = rs && rs.ocean ? OCEAN.deepest : OCEAN.deep
  ctx.fillRect(vw.x0 - 10, vw.y0 - 10, vw.x1 - vw.x0 + 20, vw.y1 - vw.y0 + 20)
  if (rs && rs.ocean) {
    const r = rs.rect || bm.bounds
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(rs.ocean, r.x0, r.y0, r.x1 - r.x0, r.y1 - r.y0)
  }

  ctx.lineJoin = 'round'
  ctx.lineCap = 'round'

  // 2. 经纬网（会被陆地盖住 → 视觉上只在海上）
  ctx.strokeStyle = OCEAN.graticule
  ctx.lineWidth = 0.8 * iz
  ctx.stroke(bm.graticule)

  // 3. 等深线：由内到外 alpha 递减，最外圈虚线
  ctx.strokeStyle = OCEAN.ripple
  for (const { style, path } of bm.ripples) {
    ctx.globalAlpha = style.alpha
    ctx.lineWidth = style.width * iz
    ctx.setLineDash(style.dash ? style.dash.map((d) => d * iz) : [])
    ctx.stroke(path)
  }
  ctx.setLineDash([])
  ctx.globalAlpha = 1

  // 4. 国家填色
  for (const { c, path } of bm.countries) {
    ctx.fillStyle = c.colors.land
    ctx.fill(path)
  }

  // 5. 地形晕渲：clip 到陆地 + overlay（中灰 128 = 不变），强度克制
  if (rs && rs.relief) {
    const r = rs.rect || bm.bounds
    ctx.save()
    ctx.clip(bm.landClip)
    ctx.globalCompositeOperation = 'overlay'
    ctx.globalAlpha = RELIEF.strength
    ctx.imageSmoothingEnabled = true
    ctx.drawImage(rs.relief, r.x0, r.y0, r.x1 - r.x0, r.y1 - r.y0)
    ctx.restore()
  }

  // 6. 国界内侧色带：clip 本国后描 2 倍宽，只剩本国一侧
  ctx.lineWidth = 2 * BORDER.ribbon * iz
  ctx.globalAlpha = BORDER.ribbonAlpha
  for (const { c, path } of bm.countries) {
    ctx.save()
    ctx.clip(path)
    ctx.strokeStyle = c.colors.ink
    ctx.stroke(path)
    ctx.restore()
  }
  ctx.globalAlpha = 1

  // 7. 国界
  if (bm.hasBorders) {
    ctx.strokeStyle = BORDER.color
    ctx.lineWidth = BORDER.width * iz
    ctx.stroke(bm.borders)
  }

  // 8. 海岸线
  ctx.strokeStyle = OCEAN.coast
  ctx.lineWidth = COAST.width * iz
  ctx.stroke(bm.coast)
}
