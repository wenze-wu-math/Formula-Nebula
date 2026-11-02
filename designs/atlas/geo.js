/**
 * designs/atlas/geo.js — 坐标与小工具（冻结文件，架构师维护，建造者只读）。
 *
 * 为什么单列：极坐标 ↔ 世界坐标 ↔ 屏幕坐标的换算被布局 / 渲染 / 标签 / 相机
 * 四方共用，ra 的方向（逆时针）和 canvas arc 角（顺时针）恰好相反，
 * 各写一份必然有人写反。所有换算只许走这里。纯函数，Node 下可 import。
 */
/* 长度量从 runtime.js 取（**可缩放**的 live binding）；无纲量从 constants.js 取。
 * 注意不能写 `import { R_DISK } from './constants.js'` —— 那是 1× 的固定值，
 * 会让 cellOf() 把网格锁死在 r < 1000，从而使整条尺度派生失效。见 runtime.js 头注释。 */
import { R_DISK, BAND_W } from './runtime.js'
import { regionCols, REGION_BANDS } from './constants.js'

const TAU = Math.PI * 2

/* ───────── 极坐标 ─────────
 * ra：弧度，0 = 正上方，逆时针增加，归一化到 [0, 2π)。
 * r ：到天极（原点）的世界距离。
 * 世界坐标 y 向下（与屏幕一致），所以正上方是 (0, -r)。 */

/** 把任意角归一化到 [0, 2π) */
export const normRa = (a) => ((a % TAU) + TAU) % TAU

/** 两个 ra 的有符号差 b - a，落在 (-π, π] */
export function raDelta(a, b) {
  let d = normRa(b - a)
  if (d > Math.PI) d -= TAU
  return d
}

/** (r, ra) → 世界坐标 {x, y} */
export function polarToWorld(r, ra) {
  return { x: -r * Math.sin(ra), y: -r * Math.cos(ra) }
}

/** 世界坐标 → {r, ra} */
export function worldToPolar(x, y) {
  return { r: Math.hypot(x, y), ra: normRa(Math.atan2(-x, -y)) }
}

/** ra → canvas ctx.arc 用的角（从 +x 轴顺时针）。
 *  画 ra0→ra1（ra 递增）的弧：ctx.arc(cx, cy, R, raToCanvas(ra0), raToCanvas(ra1), true) */
export const raToCanvas = (ra) => -Math.PI / 2 - ra

/** 赤纬（度，90=极，0=盘缘）→ 半径 */
export const decToR = (dec) => R_DISK * (90 - dec) / 90

/** 赤经小时（0..24）→ ra 弧度 */
export const hoursToRa = (h) => normRa(h / 24 * TAU)

/* ───────── 区域网格 ─────────
 * band b 覆盖 r ∈ [b*BAND_W, (b+1)*BAND_W)；该档有 regionCols(b) 列，
 * 列 c 覆盖 ra ∈ [c, c+1) * 2π / cols。 */

/** 世界坐标所在格 → {band, col}；盘外返回 null */
export function cellOf(x, y) {
  const { r, ra } = worldToPolar(x, y)
  if (r >= R_DISK) return null
  const band = Math.min(REGION_BANDS - 1, Math.floor(r / BAND_W))
  const cols = regionCols(band)
  const col = Math.min(cols - 1, Math.floor(ra / TAU * cols))
  return { band, col }
}

/** 格的极坐标范围 */
export function cellBounds(band, col) {
  const cols = regionCols(band)
  return {
    r0: band * BAND_W, r1: (band + 1) * BAND_W,
    ra0: col / cols * TAU, ra1: (col + 1) / cols * TAU,
  }
}

/* ───────── 视图 ↔ 屏幕 ─────────
 * view = { cx, cy, zoom }：世界点 (cx, cy) 位于画布中心，zoom = css px / 世界单位。
 * w, h 是画布的 css 像素尺寸。 */

export function worldToScreen(view, w, h, x, y) {
  return { x: (x - view.cx) * view.zoom + w / 2, y: (y - view.cy) * view.zoom + h / 2 }
}

export function screenToWorld(view, w, h, sx, sy) {
  return { x: (sx - w / 2) / view.zoom + view.cx, y: (sy - h / 2) / view.zoom + view.cy }
}

/**
 * 每帧建一次的投影器，避免在热循环里反复传 view/w/h。
 * @returns {{ sx(x):number, sy(y):number, wx(sx):number, wy(sy):number, zoom:number, w:number, h:number }}
 */
export function makeProjector(view, w, h) {
  const z = view.zoom, ox = w / 2 - view.cx * z, oy = h / 2 - view.cy * z
  return {
    zoom: z, w, h,
    sx: (x) => x * z + ox,
    sy: (y) => y * z + oy,
    wx: (sx) => (sx - ox) / z,
    wy: (sy) => (sy - oy) / z,
  }
}

/* ───────── 确定性随机 ───────── */

/** mulberry32：给定种子的确定性 PRNG，返回 () => [0,1) */
export function makeRng(seed) {
  let a = seed >>> 0
  return function rng() {
    a = (a + 0x6D2B79F5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** 字符串 → 32 位无符号哈希（djb2-xor），用于按 id 派生种子 */
export function hashStr(str) {
  let h = 5381
  for (let i = 0; i < str.length; i++) h = (Math.imul(h, 33) ^ str.charCodeAt(i)) >>> 0
  return h >>> 0
}

/* ───────── 杂项 ───────── */
export const clamp = (v, a, b) => (v < a ? a : v > b ? b : v)
export const lerp = (a, b, t) => a + (b - a) * t
export const smoothstep = (a, b, v) => { const t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t) }
export const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

/** 轴对齐矩形相交（{x,y,w,h}，含 pad 外扩） */
export function rectsOverlap(a, b, pad = 0) {
  return a.x - pad < b.x + b.w && b.x - pad < a.x + a.w && a.y - pad < b.y + b.h && b.y - pad < a.y + a.h
}

/** 圆与轴对齐矩形相交 */
export function circleRect(cx, cy, r, b) {
  const nx = clamp(cx, b.x, b.x + b.w), ny = clamp(cy, b.y, b.y + b.h)
  return (cx - nx) ** 2 + (cy - ny) ** 2 < r * r
}
