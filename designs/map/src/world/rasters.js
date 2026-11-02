/**
 * world/rasters.js — 地形高程、晕渲与海洋栅格（SPEC §6.4 第 12–13 步）。
 *
 * 栅格像素与网格顶点一一对应（NX×NY = 501×361），所以 rect = WORLD_BOUNDS 向外扩半格：
 * 像素 (i,j) 的中心正好落在顶点 (i,j) 上，render 双线性放大后与等值线严格对齐。
 * 模块顶层不碰 DOM；只有 makeCanvas 在调用时才探测 document / OffscreenCanvas。
 */
import { OCEAN_DEPTH_STOPS, RELIEF } from '../constants.js'
import { splat } from './fields.js'
import { fbm } from './rng.js'

/** 高程 → 坡度的私有放大系数（与 RELIEF.zFactor 相乘）。调到"纸面起伏"：最陡处 shade 偏离 ±0.25 左右 */
const H_SCALE = 3.2

/**
 * 高程 H：城市处隆起（重要的城市更高）+ 低频 fbm，乘离岸距离的 smoothstep(0,40) 让海岸平坦。
 * @param coastDist 顶点到海岸线的距离；land 顶点陆地掩码
 */
export function computeHeight(g, cities, land, coastDist, seed) {
  const H = new Float32Array(g.N)
  for (const c of cities) splat(g, H, c.x, c.y, 26, 0.4 + c.importance)
  for (let j = 0; j < g.NY; j++) for (let i = 0; i < g.NX; i++) {
    const k = j * g.NX + i
    if (!land[k]) { H[k] = 0; continue }
    const x = g.x0 + i * g.cell, y = g.y0 + j * g.cell
    const t = Math.min(1, coastDist[k] / 40)
    const s = t * t * (3 - 2 * t)
    H[k] = (H[k] + 0.35 * (fbm(x / 90, y / 90, seed + 7) + 1)) * s
  }
  return H
}

/** 晕渲灰度（0..255，128 = 中性）。Lambert：shade = max(0, n·L)，减去平地的 shade 再放大到灰度 */
export function computeShade(g, H, land) {
  const az = (RELIEF.azimuthDeg * Math.PI) / 180, alt = (RELIEF.altitudeDeg * Math.PI) / 180
  const Lx = Math.cos(alt) * Math.sin(az), Ly = -Math.cos(alt) * Math.cos(az), Lz = Math.sin(alt)
  const flat = Lz
  const k = (RELIEF.zFactor * H_SCALE) / (2 * g.cell)
  const out = new Uint8ClampedArray(g.N)
  for (let j = 0; j < g.NY; j++) for (let i = 0; i < g.NX; i++) {
    const q = j * g.NX + i
    if (!land[q]) { out[q] = 128; continue }
    const hx = (H[j * g.NX + Math.min(g.NX - 1, i + 1)] - H[j * g.NX + Math.max(0, i - 1)]) * k
    const hy = (H[Math.min(g.NY - 1, j + 1) * g.NX + i] - H[Math.max(0, j - 1) * g.NX + i]) * k
    const nl = Math.hypot(hx, hy, 1)
    const shade = Math.max(0, (-hx * Lx - hy * Ly + Lz) / nl)
    out[q] = 128 + (shade - flat) * 255
  }
  return out
}

function hexRgb(h) { const v = parseInt(h.slice(1), 16); return [(v >> 16) & 255, (v >> 8) & 255, v & 255] }
const STOPS = OCEAN_DEPTH_STOPS.map(([d, c]) => [d, hexRgb(c)])
function oceanColor(d, out) {
  if (d <= STOPS[0][0]) { out[0] = STOPS[0][1][0]; out[1] = STOPS[0][1][1]; out[2] = STOPS[0][1][2]; return }
  for (let s = 1; s < STOPS.length; s++) {
    if (d <= STOPS[s][0] || s === STOPS.length - 1) {
      const [d0, c0] = STOPS[s - 1], [d1, c1] = STOPS[s]
      let t = (d - d0) / (d1 - d0); t = t < 0 ? 0 : t > 1 ? 1 : t
      t = t * t * (3 - 2 * t)          // smoothstep：色阶过渡没有折痕
      out[0] = c0[0] + (c1[0] - c0[0]) * t; out[1] = c0[1] + (c1[1] - c0[1]) * t; out[2] = c0[2] + (c1[2] - c0[2]) * t
      return
    }
  }
}

function makeCanvas(w, h) {
  if (typeof document !== 'undefined' && document.createElement) {
    const c = document.createElement('canvas'); c.width = w; c.height = h; return c
  }
  if (typeof OffscreenCanvas !== 'undefined') return new OffscreenCanvas(w, h)
  return null
}

/**
 * @param distAll 顶点到"陆地∪岛屿"的距离（陆上 0）
 * @returns {ocean, relief, rect}（无 DOM 时两张图为 null）
 */
export function buildRasters(g, distAll, shade, land, enabled) {
  const rect = { x0: g.x0 - g.cell / 2, y0: g.y0 - g.cell / 2, x1: g.x0 + (g.NX - 0.5) * g.cell, y1: g.y0 + (g.NY - 0.5) * g.cell }
  if (!enabled) return { ocean: null, relief: null, rect }
  const oc = makeCanvas(g.NX, g.NY), rc = makeCanvas(g.NX, g.NY)
  if (!oc || !rc) return { ocean: null, relief: null, rect }
  const octx = oc.getContext('2d'), rctx = rc.getContext('2d')
  const oi = octx.createImageData(g.NX, g.NY), ri = rctx.createImageData(g.NX, g.NY)
  const col = [0, 0, 0]
  for (let k = 0; k < g.N; k++) {
    oceanColor(distAll[k], col)
    const o = 4 * k
    oi.data[o] = col[0]; oi.data[o + 1] = col[1]; oi.data[o + 2] = col[2]; oi.data[o + 3] = 255
    const s = shade[k]
    ri.data[o] = s; ri.data[o + 1] = s; ri.data[o + 2] = s; ri.data[o + 3] = land[k] ? 255 : 0
  }
  octx.putImageData(oi, 0, 0); rctx.putImageData(ri, 0, 0)
  return { ocean: oc, relief: rc, rect }
}
