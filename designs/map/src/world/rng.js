/**
 * world/rng.js — 确定性随机源与噪声（纯函数，Node/浏览器通用，不碰 DOM）。
 *
 * 取舍：全部程序生成只用 SEED 驱动的 mulberry32 与按坐标哈希的值噪声，
 * 不用 Math.random —— 同一份数据必须逐字节生成同一张地图（SPEC §6.1），深链里的坐标才稳定。
 */

/** mulberry32：32 位状态的小型 PRNG，返回 [0,1) */
export function mulberry32(seed) {
  let a = seed >>> 0
  return function () {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** FNV-1a 字符串哈希 → 32 位无符号整数 */
export function hashStr(s) {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) }
  return h >>> 0
}
/** 字符串哈希 → [0,1)（与占位实现的 hash01 一致：道路弯曲方向沿用同一函数，评审截图前后可比） */
export function hash01(s) {
  let h = 2166136261
  for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619) }
  return ((h >>> 0) % 10000) / 10000
}

/** 整数格点哈希 → [0,1) */
function lattice(ix, iy, seed) {
  let h = Math.imul(ix | 0, 374761393) ^ Math.imul(iy | 0, 668265263) ^ Math.imul(seed | 0, 1442695041)
  h = Math.imul(h ^ (h >>> 13), 1274126177)
  h ^= h >>> 16
  return (h >>> 0) / 4294967296
}

/** 二维值噪声，输出 [-1,1]，五次平滑插值（无格点方向感） */
export function valueNoise(x, y, seed) {
  const ix = Math.floor(x), iy = Math.floor(y)
  const fx = x - ix, fy = y - iy
  const u = fx * fx * fx * (fx * (fx * 6 - 15) + 10)
  const v = fy * fy * fy * (fy * (fy * 6 - 15) + 10)
  const a = lattice(ix, iy, seed), b = lattice(ix + 1, iy, seed)
  const c = lattice(ix, iy + 1, seed), d = lattice(ix + 1, iy + 1, seed)
  const top = a + (b - a) * u, bot = c + (d - c) * u
  return (top + (bot - top) * v) * 2 - 1
}

/** 分形布朗运动（4 倍频），输出约 [-1,1] */
export function fbm(x, y, seed, oct = 4) {
  let amp = 1, f = 1, sum = 0, norm = 0
  for (let o = 0; o < oct; o++) {
    sum += amp * valueNoise(x * f + o * 17.3, y * f - o * 9.1, seed + o * 101)
    norm += amp; amp *= 0.5; f *= 2.03
  }
  return sum / norm
}
