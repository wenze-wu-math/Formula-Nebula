/**
 * dev/world/dev.js — world 模块调试页：不经 render/labels，直接把 World 的全部几何画出来。
 * 参数：?mod=build（正式实现 build.js，默认；index.js 现在转发到它）&mod=stub（旧占位实现，圆）
 *       &view=x,y,z（世界中心与缩放；默认装满 fitBounds）
 *       &layers=ocean,relief,...（默认全部）
 *
 * 用途：README「国家边界有机化」一节的前后对比图就是 ?mod=stub 与 ?mod=build 两张。
 */
import { getGraph } from '../../../shared/kb.js'
import { COUNTRY_COLORS, OCEAN, RIPPLES, BORDER, ISLAND_STATUS, PORT, ROAD_STYLE } from '../../src/constants.js'

const qs = new URLSearchParams(location.search)
const mod = qs.get('mod') === 'stub' ? '../../src/world/stub.js' : '../../src/world/build.js'
const { buildWorld } = await import(mod)

const graph = getGraph()
const t0 = performance.now()
const world = buildWorld(graph, { raster: true })
const buildMs = performance.now() - t0
window.__world = world

const cv = document.getElementById('c')
const ctx = cv.getContext('2d')
const W = innerWidth, H = innerHeight, dpr = Math.min(2, devicePixelRatio || 1)
cv.width = W * dpr; cv.height = H * dpr
const fb = world.fitBounds
let view
if (qs.get('view')) { const [x, y, z] = qs.get('view').split(',').map(Number); view = { x, y, z } }
else view = { x: (fb.x0 + fb.x1) / 2, y: (fb.y0 + fb.y1) / 2, z: Math.min((W - 40) / (fb.x1 - fb.x0), (H - 40) / (fb.y1 - fb.y0)) }
const layers = new Set((qs.get('layers') || 'ocean,grat,ripple,land,relief,ribbon,border,coast,road,island,port,city,label,sea,debug').split(','))
const z = view.z
const path = (r, closed = true) => { const p = new Path2D(); p.moveTo(r[0], r[1]); for (let i = 2; i < r.length; i += 2) p.lineTo(r[i], r[i + 1]); if (closed) p.closePath(); return p }

ctx.setTransform(dpr * z, 0, 0, dpr * z, dpr * (W / 2 - view.x * z), dpr * (H / 2 - view.y * z))
ctx.fillStyle = OCEAN.deepest; ctx.fillRect(world.bounds.x0 - 2000, world.bounds.y0 - 2000, 6000, 6000)
const R = world.rasters
if (layers.has('ocean') && R.ocean) { ctx.imageSmoothingEnabled = true; ctx.drawImage(R.ocean, R.rect.x0, R.rect.y0, R.rect.x1 - R.rect.x0, R.rect.y1 - R.rect.y0) }
if (layers.has('grat')) {
  ctx.strokeStyle = OCEAN.graticule; ctx.lineWidth = 0.8 / z; ctx.beginPath()
  for (let x = -1000; x <= 1000; x += 200) { ctx.moveTo(x, -720); ctx.lineTo(x, 720) }
  for (let y = -600; y <= 600; y += 200) { ctx.moveTo(-1000, y); ctx.lineTo(1000, y) }
  ctx.stroke()
}
if (layers.has('ripple')) world.ripples.forEach((rp, i) => {
  const st = RIPPLES[i]
  ctx.strokeStyle = OCEAN.ripple; ctx.globalAlpha = st.alpha; ctx.lineWidth = st.width / z
  ctx.setLineDash(st.dash ? st.dash.map((d) => d / z) : [])
  for (const r of rp.rings) ctx.stroke(path(r))
  ctx.setLineDash([]); ctx.globalAlpha = 1
})
const cpaths = world.countries.map((c) => { const p = new Path2D(); for (const r of c.rings) p.addPath(path(r)); return p })
if (layers.has('land')) world.countries.forEach((c, i) => { ctx.fillStyle = c.colors.land; ctx.fill(cpaths[i]) })
const coastPath = new Path2D(); for (const r of world.coast) coastPath.addPath(path(r))
if (layers.has('relief') && R.relief) {
  ctx.save(); ctx.clip(coastPath); ctx.globalCompositeOperation = 'overlay'; ctx.globalAlpha = 0.22
  ctx.drawImage(R.relief, R.rect.x0, R.rect.y0, R.rect.x1 - R.rect.x0, R.rect.y1 - R.rect.y0); ctx.restore()
}
if (layers.has('ribbon')) world.countries.forEach((c, i) => {
  ctx.save(); ctx.clip(cpaths[i]); ctx.strokeStyle = c.colors.ink; ctx.globalAlpha = BORDER.ribbonAlpha; ctx.lineWidth = 2 * BORDER.ribbon / z; ctx.stroke(cpaths[i]); ctx.restore()
})
if (layers.has('border')) { ctx.strokeStyle = BORDER.color; ctx.lineWidth = BORDER.width / z; for (const b of world.borders) ctx.stroke(path(b.pts, false)) }
if (layers.has('coast')) { ctx.strokeStyle = OCEAN.coast; ctx.lineWidth = 1.3 / z; ctx.stroke(coastPath) }
if (layers.has('road')) {
  for (const kind of ['road', 'highway', 'crossway', 'ferry']) {
    const st = ROAD_STYLE[kind]
    ctx.strokeStyle = st.casing || st.color; ctx.lineWidth = st.w / z; ctx.globalAlpha = kind === 'road' ? 0.5 : 0.8
    ctx.setLineDash(st.dash ? st.dash.map((d) => d / z) : [])
    ctx.beginPath()
    for (const rd of world.roads) if (rd.kind === kind) { ctx.moveTo(rd.x0, rd.y0); ctx.quadraticCurveTo(rd.cx, rd.cy, rd.x1, rd.y1) }
    ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha = 1
  }
}
const places = world.places
if (layers.has('island')) for (const p of places) {
  if (p.kind !== 'island') continue
  const st = ISLAND_STATUS[p.status]
  const pp = path(p.ring)
  if (st.fill) { ctx.fillStyle = st.fill; ctx.fill(pp) }
  ctx.strokeStyle = st.coast; ctx.lineWidth = 1.2 / z; ctx.setLineDash(st.coastDash ? st.coastDash.map((d) => d / z) : []); ctx.stroke(pp); ctx.setLineDash([])
  if (st.mark === 'cross') { ctx.beginPath(); ctx.moveTo(p.x - 4, p.y - 4); ctx.lineTo(p.x + 4, p.y + 4); ctx.moveTo(p.x + 4, p.y - 4); ctx.lineTo(p.x - 4, p.y + 4); ctx.stroke() }
  if (st.mark === 'flag') { ctx.fillStyle = '#3d6a33'; ctx.beginPath(); ctx.moveTo(p.x, p.y - 8 / z * 1.5); ctx.lineTo(p.x + 7 / z, p.y - 5 / z * 1.5); ctx.lineTo(p.x, p.y - 2 / z); ctx.fill() }
}
if (layers.has('port')) for (const p of places) {
  if (p.kind !== 'port') continue
  ctx.strokeStyle = PORT.color; ctx.lineWidth = 1.2 / z; ctx.beginPath(); ctx.moveTo(p.pier.x, p.pier.y); ctx.lineTo(p.x, p.y); ctx.stroke()
  ctx.fillStyle = PORT.color; ctx.beginPath(); ctx.arc(p.x, p.y, 4.5 / z, 0, 7); ctx.fill()
}
if (layers.has('city')) for (const p of places) {
  if (p.kind !== 'city') continue
  const ink = COUNTRY_COLORS[p.family].ink
  const r = [7, 5, 3.2, 2.2][p.tier] / z
  ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, 7)
  if (p.tier <= 1) { ctx.fillStyle = '#fff'; ctx.fill(); ctx.strokeStyle = ink; ctx.lineWidth = 1.8 / z; ctx.stroke() } else { ctx.fillStyle = ink; ctx.globalAlpha = p.tier === 3 ? 0.7 : 1; ctx.fill(); ctx.globalAlpha = 1 }
}
if (layers.has('label')) for (const c of world.countries) {
  ctx.strokeStyle = c.colors.ink; ctx.globalAlpha = 0.6; ctx.lineWidth = 2 / z
  ctx.stroke(path(c.labelPath, false)); ctx.globalAlpha = 1
  ctx.fillStyle = c.colors.ink; ctx.beginPath(); ctx.arc(c.center.x, c.center.y, 3 / z, 0, 7); ctx.fill()
  const lp = c.labelPath
  ctx.beginPath(); ctx.arc(lp[0], lp[1], 2.5 / z, 0, 7); ctx.fill()
}
// 屏幕层文字
ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
const ts = (x, y) => [(x - view.x) * z + W / 2, (y - view.y) * z + H / 2]
if (layers.has('label')) for (const c of world.countries) {
  const lp = c.labelPath, m = lp.length >> 2 << 1
  const [sx, sy] = ts(lp[m], lp[m + 1])
  ctx.save(); ctx.translate(sx, sy); ctx.rotate(c.labelAngle)
  ctx.font = 'bold 20px "Microsoft YaHei"'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  ctx.lineWidth = 4; ctx.strokeStyle = c.colors.land; ctx.strokeText(c.zh, 0, -14); ctx.fillStyle = c.colors.ink; ctx.fillText(c.zh, 0, -14)
  ctx.restore()
}
if (layers.has('sea')) for (const s of world.seaLabels) {
  const [sx, sy] = ts(s.x, s.y)
  ctx.save(); ctx.translate(sx, sy); ctx.rotate(s.angle)
  ctx.font = `italic ${s.small ? 13 : 18}px Georgia, KaiTi`; ctx.textAlign = 'center'; ctx.fillStyle = OCEAN.seaLabel
  ctx.fillText(s.zh, 0, 0); ctx.font = `italic ${s.small ? 9 : 11}px Georgia`; ctx.fillText(s.latin, 0, 16)
  ctx.restore()
}
const ms = world.meta.ms
document.getElementById('info').textContent =
  `world ${mod.includes('stub') ? 'stub.js（旧·圆）' : 'build.js（有机）'}  浏览器构建 ${buildMs.toFixed(0)} ms\n` +
  Object.entries(ms).map(([k, v]) => `${k} ${v}`).join(' · ') +
  `\nplaces ${places.length} · roads ${world.roads.length} · borders ${world.borders.length} · coast ${world.coast.length} · sea ${world.seaLabels.length}`
window.__devReady = true
