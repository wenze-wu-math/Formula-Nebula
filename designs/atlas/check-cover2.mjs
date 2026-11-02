/**
 * designs/atlas/check-cover2.mjs — 纯 Node：把"压星点"按**视觉可见度**分档。
 *
 *   node designs/atlas/check-cover2.mjs
 *
 * 为什么需要这一层：check-cover.mjs 用"圆心到矩形距离 < r"计数，会把
 * "标签边角蹭到 1.5px 暗星最外沿 0.1px" 也算一次覆盖，数字很大但没有视觉意义。
 * 真正决定观感的是**被遮住的星点面积占比**：
 *
 *   visFrac = 标签盒与星点圆盘的相交面积 / 星点圆面积
 *
 * 分档统计：visFrac ≥ 0.5（星点基本被盖住，明显缺陷）、≥0.25、≥0.05（仅蹭边）。
 * 同时对比三种障碍策略，选出"可见遮挡最少 + 仍放得下 40 条"的组合。
 */
import { readFileSync } from 'node:fs'

const D = JSON.parse(readFileSync('shots/designs/atlas/capacity-all.json', 'utf8'))
const bodies = D.all.filter((b) => !b.bad)
const W = D.view.w, H = D.view.h
const LABEL_PAD = D.consts.LABEL_PAD
const LABEL_GAP = D.consts.LABEL_GAP
const VIEW_INSET = 4
const OBST_PAD = 2
const ANCHORS = ['E', 'W', 'NE', 'NW', 'SE', 'SW', 'N', 'S']

const CELL = 64
const key = (gx, gy) => gx * 65536 + gy
function addShape(g, s, owner) {
  const b = s.t === 'c' ? { x: s.x - s.r, y: s.y - s.r, w: 2 * s.r, h: 2 * s.r } : s
  for (let gx = Math.floor(b.x / CELL); gx <= Math.floor((b.x + b.w) / CELL); gx++)
    for (let gy = Math.floor(b.y / CELL); gy <= Math.floor((b.y + b.h) / CELL); gy++) {
      const k = key(gx, gy); let c = g.get(k); if (!c) g.set(k, (c = [])); c.push({ s, owner })
    }
}
const circleRect = (x, y, r, b) => {
  const nx = Math.max(b.x, Math.min(x, b.x + b.w)), ny = Math.max(b.y, Math.min(y, b.y + b.h))
  return (x - nx) ** 2 + (y - ny) ** 2 < r * r
}
const overlap = (p, q, pad) => p.x < q.x + q.w + pad && q.x < p.x + p.w + pad && p.y < q.y + q.h + pad && q.y < p.y + p.h + pad
function hits(g, s, self) {
  const seen = new Set()
  for (let gx = Math.floor((s.x - LABEL_PAD) / CELL); gx <= Math.floor((s.x + s.w + LABEL_PAD) / CELL); gx++)
    for (let gy = Math.floor((s.y - LABEL_PAD) / CELL); gy <= Math.floor((s.y + s.h + LABEL_PAD) / CELL); gy++) {
      const cell = g.get(key(gx, gy)); if (!cell) continue
      for (const it of cell) {
        const tag = it.owner + '|' + Math.round(it.s.x ?? it.s.cx) + '|' + Math.round(it.s.y ?? it.s.cy)
        if (seen.has(tag)) continue; seen.add(tag)
        const q = it.s
        if (q.t === 'c') { if (it.owner === self) continue; if (circleRect(q.x, q.y, q.r, s)) return true }
        else if (overlap(s, q, LABEL_PAD)) return true
      }
    }
  return false
}
const viol = (s) => s.x < VIEW_INSET || s.y < VIEW_INSET || s.x + s.w > W - VIEW_INSET || s.y + s.h > H - VIEW_INSET
function anchorBox(a, bx, by, r, Wd, Hd, e = 0) {
  const g = LABEL_GAP + e, k = r * 0.7, kk = e * 0.7
  switch (a) {
    case 'E': return [bx + r + g, by - Hd / 2]
    case 'W': return [bx - r - g - Wd, by - Hd / 2]
    case 'NE': return [bx + k + kk, by - k - kk - Hd - 1]
    case 'NW': return [bx - k - kk - Wd, by - k - kk - Hd - 1]
    case 'SE': return [bx + k + kk, by + k + kk + 1]
    case 'SW': return [bx - k - kk - Wd, by + k + kk + 1]
    case 'N': return [bx - Wd / 2, by - r - g - Hd]
    default: return [bx - Wd / 2, by + r + g]
  }
}

/** 圆盘与矩形的相交面积（解析解） */
function circleRectArea(cx, cy, r, b) {
  // 快速排除
  if (cx + r <= b.x || cx - r >= b.x + b.w || cy + r <= b.y || cy - r >= b.y + b.h) return 0
  // 完全在内
  if (cx - r >= b.x && cx + r <= b.x + b.w && cy - r >= b.y && cy + r <= b.y + b.h) return Math.PI * r * r
  // 数值积分（纵向切片，100 段足够判档）
  const N = 100
  const x0 = Math.max(b.x, cx - r), x1 = Math.min(b.x + b.w, cx + r)
  if (x1 <= x0) return 0
  const dx = (x1 - x0) / N
  let area = 0
  for (let i = 0; i < N; i++) {
    const x = x0 + (i + 0.5) * dx
    const h = Math.sqrt(Math.max(0, r * r - (x - cx) ** 2))
    const yTop = Math.max(b.y, cy - h), yBot = Math.min(b.y + b.h, cy + h)
    if (yBot > yTop) area += (yBot - yTop) * dx
  }
  return area
}

function run({ magMax, pushes, T }) {
  const g = new Map()
  const isObst = (b) => (b.kind === 'star' && b.mag <= magMax) || (b.kind === 'dso' && b.tier <= 1)
  for (const b of bodies) if (isObst(b)) addShape(g, { t: 'c', x: b.x, y: b.y, r: b.r + OBST_PAD }, b.id)
  const cand = bodies.filter((b) => b.labelL <= T).sort((a, b) => b.imp - a.imp)
  const placed = []
  for (const c of cand) {
    let got = null
    for (const a of ANCHORS) {
      for (const e of pushes) {
        const [x, y] = anchorBox(a, c.x, c.y, c.r, c.w, c.h, e)
        const s = { x, y, w: c.w, h: c.h }
        if (viol(s)) continue
        if (!hits(g, s, c.id)) { got = { s, e }; break }
      }
      if (got) break
    }
    if (got) { addShape(g, got.s, c.id); placed.push({ c, s: got.s, e: got.e }) }
  }
  let ge50 = 0, ge25 = 0, ge05 = 0, worst = 0
  const rows = []
  for (const p of placed) {
    for (const b of bodies) {
      if (b.id === p.c.id || isObst(b)) continue
      const a = circleRectArea(b.x, b.y, b.r, p.s)
      if (a <= 0) continue
      const f = a / (Math.PI * b.r * b.r)
      if (f >= 0.05) ge05++
      if (f >= 0.25) ge25++
      if (f >= 0.5) ge50++
      worst = Math.max(worst, f)
      if (f >= 0.25) rows.push({ label: p.c.id, star: b.id, mag: b.mag ?? b.tier, frac: Math.round(f * 100) / 100, r: b.r })
    }
  }
  return { placed: placed.length, pushMax: Math.max(0, ...placed.map((p) => p.e)), ge50, ge25, ge05, worst: Math.round(worst * 100) / 100, rows }
}

const PUSH_SETS = [['0..48', [0, 16, 32, 48]], ['0..64', [0, 16, 32, 48, 64]], ['0..80', [0, 16, 32, 48, 64, 80]]]
console.log('按"被遮住的星点面积占比"统计（visFrac）\n')
console.log(['magMax', 'pushes', 'placed', 'pushMax', '≥50%', '≥25%', '≥5%', 'worst'].join('\t'))
for (const magMax of [2, 3, 4]) {
  for (const [pn, pushes] of PUSH_SETS) {
    const r = run({ magMax, pushes, T: 0.55 })
    console.log([String(magMax).padEnd(6), pn.padEnd(6), String(r.placed).padStart(6), String(r.pushMax).padStart(7),
      String(r.ge50).padStart(5), String(r.ge25).padStart(5), String(r.ge05).padStart(5), String(r.worst).padStart(6)].join('\t'))
  }
}

console.log('\n--- 达标（placed ≥ 40）且可见遮挡最少的组合 ---')
const cands = []
for (const magMax of [2, 3, 4]) for (const [pn, pushes] of PUSH_SETS) {
  const r = run({ magMax, pushes, T: 0.55 })
  if (r.placed >= 40) cands.push({ magMax, pn, ...r })
}
cands.sort((a, b) => a.ge50 - b.ge50 || a.ge25 - b.ge25 || a.pushMax - b.pushMax)
for (const c of cands) console.log(`magMax=${c.magMax} ${c.pn}: placed=${c.placed} pushMax=${c.pushMax}  ≥50%=${c.ge50} ≥25%=${c.ge25} ≥5%=${c.ge05} worst=${c.worst}`)
if (cands.length) {
  console.log('\n最差遮挡明细（magMax=' + cands[0].magMax + ' ' + cands[0].pn + '）：')
  for (const r of cands[0].rows.slice(0, 12)) console.log(`  ${r.label} 压住 ${r.star}（mag${r.mag}, r=${r.r}）遮 ${(r.frac * 100).toFixed(0)}%`)
}
