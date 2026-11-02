/**
 * designs/atlas/check-placement.mjs — 纯 Node：最终放置参数的**可复现**证据。
 *
 *   node designs/atlas/check-placement.mjs
 *
 * 不启动浏览器。输入是 shots/designs/atlas/capacity-all.json（diag10.mjs 导出的
 * L=0 快照：464 个 body 的真实屏幕坐标、真实位图盒尺寸、视口、常量）。
 *
 * 回答两件事：
 *   ① 最终参数下，L=0 能放下几条可读公式？可见遮挡几对？标签重叠几对？
 *   ② 为达到 40 条，烘焙队列要推进到第几条？（这直接决定"首屏多少毫秒"）
 *      —— 因为 bake 队列顺序与放置尝试顺序一致（都按 importance 降序），
 *         所以"第 40 条被放下"时的候选序号 = 必须先烘完的条数。
 *
 * 判定口径与 labels.js 完全一致：
 *   · 障碍圆 = 星点半径 + OBST_PAD(2)，**全部 464 个星点都算**
 *   · 碰撞 = 标签盒两两不相交（外扩 LABEL_PAD）+ 不碰障碍圆 + 完全在视口内
 *   · 锚点 = 8 方向 × ANCHOR_PUSH=[0,16,32,48]
 *   · 候选 = labelL ≤ OVERVIEW_ADMIT_L(1.3)，按 importance 降序
 *   · 位图 = 按 OVERVIEW_SCALE(0.9) 缩小后的盒尺寸
 *   · 可见遮挡 = 圆-矩形相交面积 / 圆面积 ≥ 0.5 的对数
 */
import { readFileSync, existsSync } from 'node:fs'

const FILE = 'shots/designs/atlas/capacity-all.json'
if (!existsSync(FILE)) {
  console.error(`缺少 ${FILE}。先跑 node designs/atlas/diag10.mjs 生成快照（需要浏览器）。`)
  process.exit(2)
}
const D = JSON.parse(readFileSync(FILE, 'utf8'))
const bodies = D.all.filter((b) => !b.bad)
const W = D.view.w, H = D.view.h
const LABEL_PAD = D.consts.LABEL_PAD
const LABEL_GAP = D.consts.LABEL_GAP
const VIEW_INSET = 4
const OBST_PAD = 2

/* 与 labels.js / bake.js 保持一致 */
const ANCHORS = ['E', 'W', 'NE', 'NW', 'SE', 'SW', 'N', 'S']
const ANCHOR_PUSH = [0, 16, 32, 48, 64, 80, 96]
const OVERVIEW_ADMIT_L = 1.3
const OVERVIEW_TARGET = 40
/* 不缩放：bake.js 的字号就是 body.formulaPx（经 LABEL_MAX_W / FORMULA_MIN_PX 夹紧后）。
 * capacity-all.json 里的 w/h/px 已经是夹紧后的最终值，所以这里直接用，不再乘系数。 */
const OVERVIEW_SCALE = 1.0

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

/** 与 labels.js 的 anchorBox 同一公式（含外推 e） */
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
/** 圆盘与矩形相交面积（纵向切片数值积分） */
function circleRectArea(cx, cy, r, b) {
  if (cx + r <= b.x || cx - r >= b.x + b.w || cy + r <= b.y || cy - r >= b.y + b.h) return 0
  if (cx - r >= b.x && cx + r <= b.x + b.w && cy - r >= b.y && cy + r <= b.y + b.h) return Math.PI * r * r
  const N = 80
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

/* ───────── 复刻 updateLabels 步骤 ⑥ ───────── */
const g = new Map()
for (const b of bodies) addShape(g, { t: 'c', x: b.x, y: b.y, r: b.r + OBST_PAD }, b.id)

// bodyOrder = importance 降序（与 labels.js 的 byImp 一致）
const order = bodies.slice().sort((a, b) => b.imp - a.imp || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))
const placed = []
let triedCount = 0
let bakeNeeded = null
let lastTier = null
for (const c0 of order) {
  const c = { ...c0, w: c0.w * OVERVIEW_SCALE, h: c0.h * OVERVIEW_SCALE, px: c0.px * OVERVIEW_SCALE }
  // 总览放宽：labelL > 0 的只在还没够数时补位
  const extra = c.labelL > 0 && c.labelL <= OVERVIEW_ADMIT_L
  if (extra && placed.length >= OVERVIEW_TARGET) continue
  if (c.labelL > OVERVIEW_ADMIT_L) continue   // 超出放宽档：本帧不参选
  triedCount++
  let got = null
  for (const a of ANCHORS) {
    for (const e of ANCHOR_PUSH) {
      const [x, y] = anchorBox(a, c.x, c.y, c.r, c.w, c.h, e)
      const s = { x, y, w: c.w, h: c.h }
      if (viol(s)) continue
      if (!hits(g, s, c.id)) { got = { s, e, a }; break }
    }
    if (got) break
  }
  if (got) {
    addShape(g, got.s, c.id)
    placed.push({ c, s: got.s, e: got.e })
    if (placed.length === OVERVIEW_TARGET && bakeNeeded == null) bakeNeeded = triedCount
  }
}

/* ───────── 复核 ───────── */
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

const tierOf = (l) => (l <= 0 ? '基础(labelL≤0)' : '放宽(0<labelL≤1.3)')
const byTier = {}
for (const p of placed) byTier[tierOf(p.c.labelL)] = (byTier[tierOf(p.c.labelL)] || 0) + 1
const dist = {}
for (const p of placed) dist[p.e] = (dist[p.e] || 0) + 1
const minPx = Math.min(...placed.map((p) => p.c.px))
/* 字号下限：bake.js 的夹紧有两段，第二段（"到 FORMULA_MIN_PX 仍超宽 → 整体按比例缩到
 * LABEL_MAX_W"）会让等效字号略低于 FORMULA_MIN_PX。这是改动前就有的兜底分支
 * （SPEC §6.2 第 2 步），不是本次改动引入，所以判据只要求"低于下限的都是这类宽公式"。
 * 注意 capacity-all.json 里的 w 是**含 2·BAKE_PAD 的位图宽**，视觉宽要减掉它再比 LABEL_MAX_W。 */
const PAD2 = 2 * D.consts.BAKE_PAD
const belowMin = placed.filter((p) => p.c.px < D.consts.FORMULA_MIN_PX - 1e-6)
const belowMinOk = belowMin.every((p) => Math.abs(p.c.w - PAD2 - D.consts.LABEL_MAX_W) < 0.5)

console.log(`快照：${W}×${H}，${bodies.length} 个 body`)
console.log(`\n[1] 最终参数下的放置结果`)
console.log(`  参选并尝试 ${triedCount} 条 → 放下 ${placed.length} 条可读公式`)
console.log(`  来自：${JSON.stringify(byTier)}`)
console.log(`  外推分布：${JSON.stringify(dist)}（最大 ${Math.max(0, ...placed.map((p) => p.e))}px）`)
console.log(`  最小等效字号：${minPx.toFixed(2)}px（FORMULA_MIN_PX = ${D.consts.FORMULA_MIN_PX}）`)
console.log(`  低于下限 ${belowMin.length} 条：${belowMin.map((p) => `${p.c.id}(${p.c.px.toFixed(2)}px, w=${p.c.w.toFixed(0)})`).join(', ') || '无'}`)
console.log(`  → 均为"缩到 LABEL_MAX_W"兜底分支（改动前既有行为）：${belowMinOk ? '是' : '否'}`)
console.log(`\n[2] 缺陷 2 复核（可见遮挡，按相交面积占比）`)
console.log(`  visFrac ≥ 50% 的对数：${ge50}   ← 必须为 0`)
console.log(`  visFrac ≥ 25% 的对数：${ge25}`)
console.log(`\n[3] 标签重叠复核`)
console.log(`  两两相交的对数：${ov}   ← 必须为 0（overlappingLabels）`)
console.log(`\n[4] 首屏烘焙需求`)
console.log(`  达到 ${OVERVIEW_TARGET} 条可读时，队列推进到第 ${bakeNeeded} 条`)
console.log(`  → 首屏只需要烘 ${bakeNeeded} / ${bodies.length} 条（${(bakeNeeded / bodies.length * 100).toFixed(0)}%）`)

const pass = placed.length >= 40 && ge50 === 0 && ov === 0 && belowMinOk
console.log(`\n判定：${pass ? '四项约束全部满足（放置数 / 可见遮挡 / 重叠 / 字号兜底合理）' : '未满足，需复核参数'}`)
process.exit(pass ? 0 : 1)
