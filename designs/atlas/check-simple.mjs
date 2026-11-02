/**
 * designs/atlas/check-simple.mjs — 纯 Node：验证"不用缩放"的更简方案。
 *
 *   node designs/atlas/check-simple.mjs
 *
 * 上一版实现引入了 OVERVIEW_SCALE（总览态把公式位图缩到 0.9）。代价是：
 *   · 需要 setBakeScale + 重烘全部已烘条目
 *   · 需要 main.js 里的滞回逻辑，缩放跨档会触发整队重排（464 条重烘）
 *   · 风险明显高于收益（0.9 只把最小字号从 11.8px 压到 10.6px，贴近下限）
 *
 * 本脚本验证：**不做缩放**（scale=1.0，字号就是 FORMULA_PX），只靠"外推锚点"能否达到 40 条。
 * 如果能，就删掉缩放机制，实现更简单、风险更低。
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
function circleRectArea(cx, cy, r, b) {
  if (cx + r <= b.x || cx - r >= b.x + b.w || cy + r <= b.y || cy - r >= b.y + b.h) return 0
  if (cx - r >= b.x && cx + r <= b.x + b.w && cy - r >= b.y && cy + r <= b.y + b.h) return Math.PI * r * r
  const N = 60
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

function run({ T, pushes, target = Infinity }) {
  const g = new Map()
  for (const b of bodies) addShape(g, { t: 'c', x: b.x, y: b.y, r: b.r + OBST_PAD }, b.id)
  const cand = bodies.filter((b) => b.labelL <= T).sort((a, b) => b.imp - a.imp)
  const placed = []
  for (const c of cand) {
    if (placed.length >= target) break
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
  let ge50 = 0, ge25 = 0
  for (const p of placed) for (const b of bodies) {
    if (b.id === p.c.id) continue
    const a = circleRectArea(b.x, b.y, b.r, p.s)
    if (a <= 0) continue
    const f = a / (Math.PI * b.r * b.r)
    if (f >= 0.25) ge25++
    if (f >= 0.5) ge50++
  }
  let ov = 0
  for (let i = 0; i < placed.length; i++) for (let j = i + 1; j < placed.length; j++) if (overlap(placed[i].s, placed[j].s, LABEL_PAD)) ov++
  const nBase = placed.filter((p) => p.c.labelL <= 0).length
  return { n: placed.length, nBase, nAdmit: placed.length - nBase,
    pushMax: Math.max(0, ...placed.map((p) => p.e)),
    minPx: Math.min(...placed.map((p) => p.c.px)), ge50, ge25, ov }
}

const mkE = (n, step) => Array.from({ length: n }, (_, i) => i * step)
console.log('scale = 1.0（不缩放，字号就是 FORMULA_PX）。全星点硬障碍。\n')
console.log(['T', 'pushes', '总', '基础', '放宽', 'pushMax', 'minPx', '≥50%', '≥25%', '重叠'].join('\t'))
for (const T of [0.55, 1.3]) {
  for (const [pn, pushes] of [['0..48', mkE(4, 16)], ['0..64', mkE(5, 16)], ['0..80', mkE(6, 16)], ['0..96', mkE(7, 16)]]) {
    const r = run({ T, pushes })
    console.log([String(T).padEnd(5), pn.padEnd(6), String(r.n).padStart(3), String(r.nBase).padStart(4), String(r.nAdmit).padStart(4),
      String(r.pushMax).padStart(7), r.minPx.toFixed(1) + 'px', String(r.ge50).padStart(5), String(r.ge25).padStart(5), String(r.ov).padStart(4)].join('\t'))
  }
}

console.log('\n--- 达到 40 条时"够数就停"（避免不必要的外推）---')
for (const T of [0.55, 1.3]) {
  for (const [pn, pushes] of [['0..48', mkE(4, 16)], ['0..64', mkE(5, 16)], ['0..80', mkE(6, 16)], ['0..96', mkE(7, 16)]]) {
    const r = run({ T, pushes, target: 40 })
    if (r.n >= 40) console.log(`T=${T} ${pn}: 总=${r.n} 基础=${r.nBase} 放宽=${r.nAdmit} pushMax=${r.pushMax} minPx=${r.minPx.toFixed(1)} ≥50%=${r.ge50} 重叠=${r.ov}`)
  }
}
