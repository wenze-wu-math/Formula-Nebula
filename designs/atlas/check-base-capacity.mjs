/**
 * designs/atlas/check-base-capacity.mjs — 纯 Node：证明"基础档容量"是几何硬上限。
 *
 *   node designs/atlas/check-base-capacity.mjs
 *
 * 这是 perf.md 里"40 条必须靠放宽候选集凑"这一结论的证据脚本。
 *
 * 背景：L=0 时只有 40 条公式的 labelL ≤ 0（语义缩放下"总览本来就该显示"的那一档），
 * 而它们的星点挤在 394×566 px 的中心区（capacity-all.json 实测）。本脚本穷举参数空间，问：
 *   **在不显示任何 labelL > 0 的越级公式的前提下，这 40 条最多能放下几条？**
 *
 * 若上限 < 40，则"首屏 40 条可读公式"必然包含越级标签 —— 这是设计取舍，必须写明。
 *
 * 扫的维度：
 *   magMax   硬障碍集深度（2/3/4/5/6，6 = 全部星点）
 *   scale    总览态位图缩放（1.0/0.9/0.8/0.7）
 *   maxPush  锚点最大外推（0/32/64/96/128/160/192）
 *   visTol   允许单颗星被遮住的最大面积比（0 / 0.25 / 0.5）
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
const BASE = bodies.filter((b) => b.labelL <= 0)

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

/** 只放基础档（labelL ≤ 0），返回容量与可见遮挡 */
function runBaseOnly({ magMax, scale, maxPush, visTol }) {
  const pushes = []
  for (let e = 0; e <= maxPush; e += 16) pushes.push(e)
  const g = new Map()
  const isHard = (b) => (b.kind === 'star' && b.mag <= magMax) || (b.kind === 'dso' && b.tier <= 1)
  for (const b of bodies) if (isHard(b)) addShape(g, { t: 'c', x: b.x, y: b.y, r: b.r + OBST_PAD }, b.id)
  const cand = BASE.map((b) => ({ ...b, w: b.w * scale, h: b.h * scale })).sort((a, b) => b.imp - a.imp)
  const placed = []
  for (const c of cand) {
    let got = null
    for (const a of ANCHORS) {
      for (const e of pushes) {
        const [x, y] = anchorBox(a, c.x, c.y, c.r, c.w, c.h, e)
        const s = { x, y, w: c.w, h: c.h }
        if (viol(s)) continue
        if (hits(g, s, c.id)) continue
        // 软障碍：非硬障碍星点允许轻微擦边，但可见遮挡不超过 visTol
        let bad = false
        for (const b of bodies) {
          if (isHard(b) || b.id === c.id) continue
          if (b.x + b.r < s.x || b.x - b.r > s.x + s.w || b.y + b.r < s.y || b.y - b.r > s.y + s.h) continue
          if (circleRectArea(b.x, b.y, b.r, s) / (Math.PI * b.r * b.r) > visTol) { bad = true; break }
        }
        if (bad) continue
        got = { s, e }; break
      }
      if (got) break
    }
    if (got) { addShape(g, got.s, c.id); placed.push({ c, s: got.s, e: got.e }) }
  }
  let ge50 = 0
  for (const p of placed) for (const b of bodies) {
    if (b.id === p.c.id) continue
    const a = circleRectArea(b.x, b.y, b.r, p.s)
    if (a > 0 && a / (Math.PI * b.r * b.r) >= 0.5) ge50++
  }
  let ov = 0
  for (let i = 0; i < placed.length; i++) for (let j = i + 1; j < placed.length; j++) if (overlap(placed[i].s, placed[j].s, LABEL_PAD)) ov++
  return { n: placed.length, pushMax: Math.max(0, ...placed.map((p) => p.e)), ge50, ov }
}

console.log(`基础档（labelL ≤ 0）= ${BASE.length} 条。问题：最多能放下几条？\n`)
console.log(['magMax', 'scale', 'maxPush', 'visTol', '放下', 'pushMax', '遮挡≥50%', '重叠'].join('\t'))
let best = { n: -1 }
for (const magMax of [2, 3, 4, 5, 6]) {
  for (const scale of [1, 0.9, 0.8, 0.7]) {
    for (const maxPush of [0, 32, 64, 96, 128, 160, 192]) {
      for (const visTol of [0, 0.25, 0.5]) {
        const r = runBaseOnly({ magMax, scale, maxPush, visTol })
        if (r.ge50 === 0 && r.ov === 0 && r.n > best.n) best = { magMax, scale, maxPush, visTol, ...r }
        if (r.n >= 30) console.log([String(magMax).padEnd(6), String(scale).padEnd(5), String(maxPush).padEnd(7), String(visTol).padEnd(6),
          String(r.n).padStart(4), String(r.pushMax).padStart(7), String(r.ge50).padStart(8), String(r.ov).padStart(4)].join('\t'))
      }
    }
  }
}
console.log(`\n★ 基础档硬上限 = ${best.n} / ${BASE.length} 条（magMax=${best.magMax}, scale=${best.scale}, maxPush=${best.maxPush}, visTol=${best.visTol}）`)
console.log(`  该配置下：可见遮挡 ≥50% 的对数 ${best.ge50}，标签重叠 ${best.ov}`)
console.log(`\n结论：${best.n >= 40 ? '基础档自身就能达到 40 条' : `基础档最多 ${best.n} 条 < 40 条。要凑够 40 条必须放宽候选集（显示 labelL>0 的越级公式），这会削弱语义缩放 —— 这是设计取舍，需 Lead 决策。`}`)
