/**
 * 理论上限：如果**完全无视星系结构**、把公式当水平长条最优装箱，
 * 屏幕重叠最好能做到多少？
 *
 * ── 为什么必须先算这个 ──
 * 之前一直在调布局参数，但没验证过"给定公式数量和尺寸，
 * 在整盘入画的取景下，屏幕空间到底够不够"。
 * 如果连最优装箱都放不下，那再怎么调参数都是白费力气，
 * 必须改的是别的东西（公式尺寸上限、数量、或取景方式）。
 *
 * 做法：按每个公式的真实景深算出屏幕像素尺寸，
 * 然后用"货架装箱"（shelf packing，逐行从左到右摆放）塞进
 * 整盘投影出的椭圆里，统计覆盖率与重叠。
 * 这是水平长条能达到的接近最优的结果。
 *
 * 用法: node scripts/bound-screen-capacity.mjs
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const raw = JSON.parse(readFileSync(resolve('scripts', '.node-layout.json'), 'utf8'))
  .map((n) => ({ ...n, aspect: n.w / n.h }))

const VIEW_W = 1568, VIEW_H = 698, VFOV = 55
const TILT = 40 * Math.PI / 180, MARGIN = 1.10
const tanV = Math.tan(VFOV * Math.PI / 360)

function screenSizes(diskR) {
  const d = diskR * Math.sin(TILT) / tanV * MARGIN
  const az = 0
  const cx = d * Math.cos(TILT) * Math.sin(az)
  const cy = d * Math.sin(TILT)
  const cz = d * Math.cos(TILT) * Math.cos(az)
  const fwd = [-cx / d, -cy / d, -cz / d]
  let rx = fwd[2], ry = 0, rz = -fwd[0]
  const rl = Math.hypot(rx, ry, rz) || 1; rx /= rl; ry /= rl; rz /= rl
  const ux = ry * fwd[2] - rz * fwd[1], uy = rz * fwd[0] - rx * fwd[2], uz = rx * fwd[1] - ry * fwd[0]

  const out = []
  for (const n of raw) {
    // 用离线模型里的位置（可能与实际略有出入，但景深分布一致）
    const r = n.radiusTarget ?? 0
    const th = n.theta ?? 0
    const wx = Math.cos(th) * r, wz = Math.sin(th) * r
    const vx = wx - cx, vy = -cy, vz = wz - cz
    const depth = vx * fwd[0] + vy * fwd[1] + vz * fwd[2]
    if (depth <= 1) continue
    const ppw = VIEW_H / (2 * depth * tanV)
    out.push({ id: n.id, W: n.w * ppw, H: n.h * ppw })
  }
  return out
}

/** 货架装箱：按高度分行，行内从左到右排 */
function shelfPack(items, W, H) {
  const sorted = [...items].sort((a, b) => b.H - a.H)
  const rows = []
  let cur = null
  for (const it of sorted) {
    if (it.W > W) it.W = W
    if (!cur || cur.used + it.W > W) {
      cur = { y: rows.length ? rows[rows.length - 1].y + rows[rows.length - 1].h : 0, used: 0, h: it.H, items: [] }
      rows.push(cur)
    }
    cur.items.push({ ...it, x: cur.used })
    cur.used += it.W
    cur.h = Math.max(cur.h, it.H)
  }
  // 光栅化
  const CELL = 2
  const gw = Math.ceil(W / CELL), gh = Math.ceil(H / CELL)
  const cover = new Int32Array(gw * gh)
  let placed = 0
  for (const row of rows) {
    for (const it of row.items) {
      const x0 = Math.floor(it.x / CELL), x1 = Math.ceil((it.x + it.W) / CELL)
      const y0 = Math.floor(row.y / CELL), y1 = Math.ceil((row.y + it.H) / CELL)
      if (y1 > gh) continue
      placed++
      for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) if (y * gw + x < cover.length) cover[y * gw + x]++
    }
  }
  let covered = 0, ovc = 0, layers = 0
  for (let i = 0; i < cover.length; i++) { if (cover[i] > 0) { covered++; layers += cover[i] } if (cover[i] > 1) ovc++ }
  const totalH = rows.length ? rows[rows.length - 1].y + rows[rows.length - 1].h : 0
  return { rows: rows.length, totalH, placed, coverage: covered / (gw * gh), overlap: covered ? ovc / covered : 0, layers: layers / covered }
}

console.log('理论上限：纯水平长条最优装箱 vs 屏幕容量\n')
console.log('盘半径  相机距  公式屏幕总面积    视口面积   理想覆盖率  货架行数  需要总高  视口高  放得下?')

for (const diskR of [150, 173, 210, 240, 285, 340, 420, 520, 650, 820, 1000]) {
  const items = screenSizes(diskR)
  const totalArea = items.reduce((s, i) => s + i.W * i.H, 0)
  const d = diskR * Math.sin(TILT) / tanV * MARGIN
  const ideal = totalArea / (VIEW_W * VIEW_H)
  const pk = shelfPack(items, VIEW_W, VIEW_H)
  const fits = pk.totalH <= VIEW_H
  console.log(`  ${String(diskR).padStart(5)}  ${d.toFixed(0).padStart(6)}  ${totalArea.toFixed(0).padStart(13)}  ${(VIEW_W * VIEW_H).toString().padStart(9)}   ${ideal.toFixed(3).padStart(8)}   ${String(pk.rows).padStart(6)}  ${pk.totalH.toFixed(0).padStart(7)}  ${VIEW_H}   ${fits ? '✓' : '✗ 溢出 ' + (pk.totalH - VIEW_H).toFixed(0) + 'px'}`)
}

console.log('\n结论参考：')
const d173 = screenSizes(173)
const a173 = d173.reduce((s, i) => s + i.W * i.H, 0)
console.log(`  当前盘半径 173：公式屏幕总面积 ${a173.toFixed(0)} px² = 视口的 ${(a173 / (VIEW_W * VIEW_H) * 100).toFixed(0)}%`)
console.log(`  水平长条的理论最密装箱约需 55~65% 视口面积；超过这个比例就一定压字。`)
