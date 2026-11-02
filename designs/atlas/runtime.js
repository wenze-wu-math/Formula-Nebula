/**
 * designs/atlas/runtime.js — 可缩放的世界几何（**单一来源**）。
 *
 * ═══ 为什么需要这一层 ═══
 *
 * 星图的所有几何原本都是 `constants.js` 里的模块常量。数据量增长时盘面不该
 * 保持 1000，否则星点会被压到一起。但常量是 import 时就绑死的值，不能运行时改。
 *
 * 之前 `layout.js` 试过用模块级可变对象 `RT` 覆盖，**但只覆盖了自己的 7 处**。
 * `geo.js` 的 `cellOf()` 仍然读常量 `R_DISK`/`BAND_W`：
 *
 *     if (r >= R_DISK) return null            // 常量 → 网格只覆盖 r < 1000
 *     const band = Math.floor(r / BAND_W)     // BAND_W = R_DISK/20 = 50
 *
 * 而 `layout.js` 的收纳步骤要求 `allowed()`（内部就是 `cellOf !== null`），
 * 于是**一切都被拉回 r < 1000**。实测 `applyScale({R_DISK:4000})` 后
 * 星点最大半径仍是 1000，但 `rCap` 却按 4000 算了 —— 一个静默的半坏状态。
 *
 * 所以缩放必须**整条几何栈同步**。ESM 的 live binding 正好能做到：
 * 导出用 `export let`，消费方 import 到的就是活的绑定，重新赋值后所有消费方
 * 立刻看到新值，无需重新 import、无需改签名。
 *
 * ═══ 约定 ═══
 *
 * · `constants.js` 是 **1× 基准**（唯一真源，保持冻结）；
 * · 本模块从 constants 取基准值，乘上 `worldScale` 后**重新导出**；
 * · 消费方（geo/layout/render/labels/input/camera）一律从**本模块**取长度量；
 * · `setWorldScale(1)` 得到的值与基准**逐位相同**，所以 1× 行为不允许有任何变化。
 *
 * ═══ 哪些量缩放、哪些不缩放 ═══
 *
 * 缩放（世界长度，幂等相似变换）：
 *   R_DISK、BAND_W、刻度环半径、研究者环半径、FIT_RADIUS
 *
 * 不缩放：
 *   · 角度（DEC_STEP_DEG、扇区角宽……）
 *   · **屏幕 px 量**（STAR_R、FORMULA_PX、各种 PX 字号）：它们经 zoom 换算到
 *     世界后自然 ∝ R，本来就跟着放大，这里再乘一次会双重缩放；
 *   · 无量纲结构（REGION_BANDS、MAG_CUTS……）。
 */
import {
  R_DISK as BASE_R_DISK,
  R_SCALE_IN as BASE_R_SCALE_IN,
  R_SCALE_MID as BASE_R_SCALE_MID,
  R_SCALE_OUT as BASE_R_SCALE_OUT,
  R_HOUR_TEXT as BASE_R_HOUR_TEXT,
  R_RES_TICK as BASE_R_RES_TICK,
  R_RES_TICK_END as BASE_R_RES_TICK_END,
  R_RES as BASE_R_RES,
  FIT_RADIUS as BASE_FIT_RADIUS,
  REGION_BANDS,
} from './constants.js'

/** 当前世界尺度倍数（1 = constants.js 的基准） */
export let worldScale = 1

/** 盘面半径（赤纬 0°） */
export let R_DISK = BASE_R_DISK
/** 每档区域网格的径向宽度 = R_DISK / REGION_BANDS */
export let BAND_W = BASE_R_DISK / REGION_BANDS
/** 刻度环：内沿 / 中线 / 外沿 / 赤经时数字半径 */
export let R_SCALE_IN = BASE_R_SCALE_IN
export let R_SCALE_MID = BASE_R_SCALE_MID
export let R_SCALE_OUT = BASE_R_SCALE_OUT
export let R_HOUR_TEXT = BASE_R_HOUR_TEXT
/** 研究者：短刻度起止、名字基线 */
export let R_RES_TICK = BASE_R_RES_TICK
export let R_RES_TICK_END = BASE_R_RES_TICK_END
export let R_RES = BASE_R_RES
/** 全图适配半径（含研究者名字） */
export let FIT_RADIUS = BASE_FIT_RADIUS

/**
 * 设置世界尺度。
 *
 * @param {number} k  倍数（1 = 基准）。非有限值或 ≤0 时回到 1，避免把布局拉成 NaN。
 */
export function setWorldScale(k) {
  const s = Number.isFinite(k) && k > 0 ? k : 1
  worldScale = s
  R_DISK = BASE_R_DISK * s
  BAND_W = R_DISK / REGION_BANDS
  R_SCALE_IN = BASE_R_SCALE_IN * s
  R_SCALE_MID = BASE_R_SCALE_MID * s
  R_SCALE_OUT = BASE_R_SCALE_OUT * s
  R_HOUR_TEXT = BASE_R_HOUR_TEXT * s
  R_RES_TICK = BASE_R_RES_TICK * s
  R_RES_TICK_END = BASE_R_RES_TICK_END * s
  R_RES = BASE_R_RES * s
  FIT_RADIUS = BASE_FIT_RADIUS * s
  return s
}

/** 当前尺度（函数形式，便于只想读值的调用方） */
export const currentWorldScale = () => worldScale

/**
 * 1× 基准值快照 —— 仅供**测试**核对"constants 与 runtime 在 k=1 时逐位一致"。
 * 生产代码不要用它（它会绕过缩放）。
 */
export const BASE_SNAPSHOT = Object.freeze({
  R_DISK: BASE_R_DISK,
  BAND_W: BASE_R_DISK / REGION_BANDS,
  R_SCALE_IN: BASE_R_SCALE_IN,
  R_SCALE_MID: BASE_R_SCALE_MID,
  R_SCALE_OUT: BASE_R_SCALE_OUT,
  R_HOUR_TEXT: BASE_R_HOUR_TEXT,
  R_RES_TICK: BASE_R_RES_TICK,
  R_RES_TICK_END: BASE_R_RES_TICK_END,
  R_RES: BASE_R_RES,
  FIT_RADIUS: BASE_FIT_RADIUS,
})
