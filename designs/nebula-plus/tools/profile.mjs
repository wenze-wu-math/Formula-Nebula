/**
 * 亮度剖面工具（复用 designs/imgstat.mjs 作为像素源，不自己解 PNG）。
 *
 * 为什么需要它：imgstat 的 --crop 只能给"某个矩形区域的均值"，
 * 而"硬边"是一个**沿某个方向的一维问题** —— 要判断边缘处是跳变还是连续，
 * 必须取一条穿过边缘的窄带序列，看相邻两格的差。
 *
 * 用法：
 *   node designs/nebula-plus/tools/profile.mjs <png> --cx 1306 --cy 332 --r 141
 *        [--axis x|y] [--len 10] [--thick 16]
 *   node designs/nebula-plus/tools/profile.mjs <png> --x0 100 --x1 400 --y0 300 --y1 340 --axis x --len 8
 *
 * 输出：每个格子的 meanLum / 相邻差值，以及 maxJump（相邻最大跳变）
 * 与 edgeRatio（边缘外侧一格的落差 ÷ 内侧三格的平均落差）——
 * 硬边的特征是 maxJump 出现在**最外一格**且 edgeRatio 远大于 1。
 */
import { execFileSync } from 'node:child_process'

const argv = process.argv.slice(2)
const file = argv[0]
if (!file) {
  console.error('usage: node designs/nebula-plus/tools/profile.mjs <png> [--cx --cy --r] | [--x0 --x1 --y0 --y1] [--axis x|y] [--len n] [--thick n]')
  process.exit(2)
}
const num = (name, d) => {
  const i = argv.indexOf(`--${name}`)
  return i > 0 ? Number(argv[i + 1]) : d
}
const str = (name, d) => {
  const i = argv.indexOf(`--${name}`)
  return i > 0 ? argv[i + 1] : d
}

const axis = str('axis', 'x')
const len = num('len', 10)
const thick = num('thick', 16)

let x0, x1, y0, y1
if (argv.includes('--cx')) {
  const cx = num('cx'), cy = num('cy'), r = num('r')
  // 从中心往外扫到 1.35r（覆盖边缘内外两侧）
  if (axis === 'x') {
    x0 = Math.round(cx); x1 = Math.round(cx + r * 1.35)
    y0 = Math.round(cy - thick / 2); y1 = Math.round(cy + thick / 2)
  } else {
    y0 = Math.round(cy); y1 = Math.round(cy + r * 1.35)
    x0 = Math.round(cx - thick / 2); x1 = Math.round(cx + thick / 2)
  }
} else {
  x0 = num('x0', 0); x1 = num('x1', 400); y0 = num('y0', 0); y1 = num('y1', 100)
}

function meanLum(x, y, w, h) {
  const raw = execFileSync(process.execPath, ['designs/imgstat.mjs', file, '--json',
    '--crop', `${x},${y},${w},${h}`], { encoding: 'utf8', maxBuffer: 1 << 24 })
  return JSON.parse(raw).region.meanLum
}

const cells = []
if (axis === 'x') {
  for (let x = x0; x + len <= x1; x += len) {
    cells.push({ at: x, mid: x + len / 2, lum: meanLum(x, y0, len, y1 - y0) })
  }
} else {
  for (let y = y0; y + len <= y1; y += len) {
    cells.push({ at: y, mid: y + len / 2, lum: meanLum(x0, y, x1 - x0, len) })
  }
}

const deltas = []
for (let i = 1; i < cells.length; i++) deltas.push(+(cells[i].lum - cells[i - 1].lum).toFixed(3))

const absD = deltas.map(Math.abs)
const maxJump = absD.length ? Math.max(...absD) : 0
const maxAt = absD.length ? absD.indexOf(maxJump) : -1
// 内侧三格（不含最外）的平均落差，作为"正常梯度"的尺度
const inner = absD.slice(Math.max(0, absD.length - 4), Math.max(1, absD.length - 1))
const innerAvg = inner.length ? inner.reduce((a, b) => a + b, 0) / inner.length : 0
const edgeRatio = innerAvg > 1e-6 ? +(maxJump / innerAvg).toFixed(2) : null

console.log(`${file}  axis=${axis}  ${cells.length} 格 × ${len}px`)
console.log(`  ${axis}     亮度    Δ`)
for (let i = 0; i < cells.length; i++) {
  const d = i ? deltas[i - 1] : ''
  const mark = (i === maxAt + 1) ? '   ← 最大跳变' : ''
  console.log(`  ${String(cells[i].at).padStart(5)}  ${String(cells[i].lum).padStart(7)}  ${String(d).padStart(8)}${mark}`)
}
console.log(`  maxJump=${maxJump}（在第 ${maxAt + 1} 格之间）  innerAvg=${+innerAvg.toFixed(3)}  edgeRatio=${edgeRatio}`)
const mono = deltas.length ? deltas.every((d) => d <= 0.001) : false
console.log(`  单调不增=${mono}  （柔光剖面应单调不增且无孤立跳变）`)

/* 机器判据（供 README 引用）：
 *   硬边 = 最大跳变出现在**最外一格**，且该跳变 ≥ 内侧平均落差的 3 倍，
 *          同时最外一格之后立刻掉到背景级（< 内侧首格的一半）。
 * 这个判据不依赖"看起来"，只依赖数字。 */
const _lastJump = absD.length ? absD[absD.length - 1] : 0
const hardEdge = absD.length > 3 &&
  maxAt === absD.length - 1 &&
  (edgeRatio === null ? false : edgeRatio >= 3) &&
  cells[cells.length - 1].lum < cells[0].lum * 0.5
console.log(`  判定：${hardEdge ? 'HARD_EDGE（硬边）' : 'SMOOTH（梯度连续）'}`)
