/**
 * ═══════════════════════════════════════════════════════════════
 *  调色：按族着色，但不许破坏「越中心越重要」
 * ═══════════════════════════════════════════════════════════════
 *
 *  【要解决的问题】
 *  给 8 个知识族各配一个颜色，看起来只是"换个 tint"。但本项目的核心语义
 *  是**亮度和重要度挂钩**（核心 1.42、外缘 0.34，差 4.18 倍），
 *  而这个亮度是拿 `颜色 × brightness` 算出来的。
 *
 *  于是问题来了：不同色相的**感知明度**差得很远。
 *  实测原始 8 色（Rec.709 相对亮度 Y，线性空间）:
 *
 *      #7fd4ff 交换代数   Y = 0.583
 *      #e0e0ff 模空间     Y = 0.762
 *      #ff9fd0 态射       Y = 0.512
 *      ...
 *
 *  最亮与最暗差 **1.63 倍**。也就是说一个"不重要但正好在浅色族"的公式，
 *  会显得比"很重要但在深色族"的公式还亮 —— **重要度信号被色相本身的
 *  明度差淹没了**。这是不可接受的：它是本项目排在第一位的那条约束。
 *
 *  【解法】
 *  把所有族色统一到**同一个感知明度**，同时尽量保住各自的色相与彩度。
 *
 *  为什么用 OKLab 而不是直接缩放线性 RGB：
 *  1. 线性缩放虽然能把 Y 拉平，但会连带改变感知彩度 —— 把暗蓝乘 1.6 倍
 *     只是变亮了，看起来仍然"发灰"，而且高倍放大后通道溢出、被 ACES
 *     压向白色（项目里已经踩过这个坑：亮度超过 1.42 就丢橙色）。
 *  2. OKLab 的 L 是**感知均匀**的明度轴。固定 L、只调 C（彩度）到
 *     恰好落在 sRGB 色域内，就能在"一样亮"的前提下最大化保住颜色个性。
 *
 *  【色域处理】
 *  固定 L 后并非任意 (C, h) 都在 sRGB 内（比如 L 很高时纯蓝根本不存在）。
 *  这里用**二分收缩彩度**找到最大可用 C —— 比直接钳制 RGB 通道好得多，
 *  钳制会同时改变色相和明度，把颜色弄脏。
 */

/* ───────────── sRGB ↔ 线性 ───────────── */

/** sRGB 分量（0~1）→ 线性光。这是 GPU 实际混合的空间。 */
export function srgbToLinear(c) {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
}

export function linearToSrgb(c) {
  return c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055
}

/** '#rrggbb' → { r, g, b } 线性光（0~1 以上不钳制，允许 >1 触发 bloom） */
export function hexToLinear(hex) {
  const h = hex.replace('#', '')
  const n = parseInt(h.length === 3
    ? h.split('').map((c) => c + c).join('')
    : h, 16)
  return {
    r: srgbToLinear(((n >> 16) & 255) / 255),
    g: srgbToLinear(((n >> 8) & 255) / 255),
    b: srgbToLinear((n & 255) / 255),
  }
}

/** 线性光 → '#rrggbb'（输出时钳到 [0,1]，因为 hex 表示不了 >1） */
export function linearToHex({ r, g, b }) {
  const to = (v) => {
    const s = Math.round(Math.min(1, Math.max(0, linearToSrgb(v))) * 255)
    return s.toString(16).padStart(2, '0')
  }
  return '#' + to(r) + to(g) + to(b)
}

/* ───────────── 线性光 ↔ OKLab ───────────── */

export function linearToOklab({ r, g, b }) {
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b)
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b)
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b)
  return {
    L: 0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s,
    a: 1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s,
    b: 0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s,
  }
}

export function oklabToLinear({ L, a, b }) {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const s = (L - 0.0894841775 * a - 1.2914855480 * b) ** 3
  return {
    r: 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    g: -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    b: -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s,
  }
}

/** 线性光 → OKLCh（L 感知明度、C 彩度、h 色相角/弧度） */
export function linearToOklch(rgb) {
  const { L, a, b } = linearToOklab(rgb)
  return { L, C: Math.hypot(a, b), h: Math.atan2(b, a) }
}

export function oklchToLinear({ L, C, h }) {
  return oklabToLinear({ L, a: C * Math.cos(h), b: C * Math.sin(h) })
}

/* ───────────── 色域 ───────────── */

/** 是否落在 sRGB 色域内（留一点余量，避免 8bit 量化后的边界抖动） */
function inGamut(rgb, eps = 1e-4) {
  const lim = 1 + eps
  return rgb.r >= -eps && rgb.g >= -eps && rgb.b >= -eps
    && rgb.r <= lim && rgb.g <= lim && rgb.b <= lim
}

/**
 * 固定感知明度 L 与色相 h，把彩度收缩到 sRGB 内允许的最大值。
 * 二分 24 次，精度足够（彩度 0~0.4 量级，误差 < 3e-8）。
 */
export function clampChromaToGamut(L, C, h) {
  if (inGamut(oklchToLinear({ L, C, h }))) return C
  let lo = 0
  let hi = C
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2
    if (inGamut(oklchToLinear({ L, C: mid, h }))) lo = mid
    else hi = mid
  }
  return lo
}

/* ───────────── 对外主函数 ───────────── */

/**
 * 把一个颜色搬到指定的感知明度上，色相不变、彩度取色域内最大值。
 * @param {string} hex    源颜色
 * @param {number} targetL OKLab 明度（0~1）
 * @returns {{ hex:string, linear:{r,g,b}, L:number, C:number, h:number }}
 */
export function equalizeLightness(hex, targetL) {
  const src = linearToOklch(hexToLinear(hex))
  const C = clampChromaToGamut(targetL, src.C, src.h)
  const linear = oklchToLinear({ L: targetL, C, h: src.h })
  return { hex: linearToHex(linear), linear, L: targetL, C, h: src.h }
}

/** Rec.709 相对亮度（线性空间）—— 数值验收用，不参与配色决策 */
export function relativeLuminance({ r, g, b }) {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/**
 * 给定一组族色，产出**感知明度统一**的调色板。
 *
 * @param {Record<string,string>} familyHex  族 → '#rrggbb'
 * @param {number} targetL                  目标 OKLab 明度
 * @returns {Record<string,{hex,linear,L,C,h}>}
 */
export function buildEqualizedPalette(familyHex, targetL) {
  const out = {}
  for (const [key, hex] of Object.entries(familyHex)) {
    out[key] = equalizeLightness(hex, targetL)
  }
  return out
}
