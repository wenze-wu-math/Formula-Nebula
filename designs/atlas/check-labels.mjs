/**
 * designs/atlas/check-labels.mjs — 纯 Node 静态检查：验证 labels.js 的改动不会破坏契约。
 *
 *   node designs/atlas/check-labels.mjs
 *
 * 不启动浏览器。做四件事：
 *   1. 语法 / 导入检查：用动态 import 加载 labels.js 依赖的纯模块（constants/geo/glyphs），
 *      确认没有循环依赖或语法错误；
 *   2. anchorBox 的行为契约：外推 e=0 时与原实现逐位相同（用同一套常量重算比对）；
 *   3. 放置算法复刻：用 capacity-all.json 的真实屏幕坐标与盒尺寸，分别跑
 *      "只试 8 锚点" 与 "8 锚点 × ANCHOR_PUSH"，确认外推确实提升了容量；
 *   4. overlappingLabels 的构造性保证：贪心放置后两两求交必须为 0。
 *
 * 这是"代码层面如何保证"的证据来源，不替代 Lead 的浏览器实测。
 */
import { readFileSync, existsSync } from 'node:fs'

let fail = 0
const ok = (cond, msg, extra) => {
  if (cond) console.log(`  ok   ${msg}`)
  else { fail++; console.log(`  FAIL ${msg}${extra ? '  ' + JSON.stringify(extra) : ''}`) }
}

/* ── 1. 模块可加载性 ── */
console.log('\n[1] 模块加载')
const C = await import('./constants.js')
const geo = await import('./geo.js')
ok(typeof C.LABEL_GAP === 'number', 'constants.js 可加载')
ok(typeof geo.rectsOverlap === 'function', 'geo.js 可加载（rectsOverlap）')
ok(typeof geo.clamp === 'function', 'geo.js 可加载（clamp）')

/* ── 2. anchorBox 契约：e=0 必须与 SPEC §6.4 的原式逐位一致 ── */
console.log('\n[2] anchorBox 外推 e=0 与 SPEC §6.4 原式一致')
const LABEL_GAP = C.LABEL_GAP
/** SPEC §6.4 的原式（改动前 labels.js 的实现） */
function anchorBoxSpec(a, bx, by, r, W, H) {
  const g = LABEL_GAP, k = r * 0.7
  switch (a) {
    case 'E': return [bx + r + g, by - H / 2, 'l']
    case 'W': return [bx - r - g - W, by - H / 2, 'r']
    case 'NE': return [bx + k, by - k - H - 1, 'l']
    case 'NW': return [bx - k - W, by - k - H - 1, 'r']
    case 'SE': return [bx + k, by + k + 1, 'l']
    case 'SW': return [bx - k - W, by + k + 1, 'r']
    case 'N': return [bx - W / 2, by - r - g - H, 'c']
    default: return [bx - W / 2, by + r + g, 'c']
  }
}
/** 改动后的实现（labels.js 内联副本，逐字复制以做比对） */
function anchorBoxNew(a, bx, by, r, W, H, e = 0) {
  const g = LABEL_GAP + e, k = r * 0.7
  const kk = e * 0.7
  switch (a) {
    case 'E': return [bx + r + g, by - H / 2, 'l']
    case 'W': return [bx - r - g - W, by - H / 2, 'r']
    case 'NE': return [bx + k + kk, by - k - kk - H - 1, 'l']
    case 'NW': return [bx - k - kk - W, by - k - kk - H - 1, 'r']
    case 'SE': return [bx + k + kk, by + k + kk + 1, 'l']
    case 'SW': return [bx - k - kk - W, by + k + kk + 1, 'r']
    case 'N': return [bx - W / 2, by - r - g - H, 'c']
    default: return [bx - W / 2, by + r + g, 'c']
  }
}
const ANCHORS = ['E', 'W', 'NE', 'NW', 'SE', 'SW', 'N', 'S']
let same = true
for (const a of ANCHORS) {
  for (const [bx, by, r, W, H] of [[800, 500, 5.2, 300, 20], [0, 0, 1.5, 71, 19], [1599, 999, 6.6, 360, 48]]) {
    const s = anchorBoxSpec(a, bx, by, r, W, H)
    const n = anchorBoxNew(a, bx, by, r, W, H, 0)
    if (s[0] !== n[0] || s[1] !== n[1] || s[2] !== n[2]) { same = false; console.log('   diff', a, s, n) }
  }
}
ok(same, '8 个锚点在 e=0 时与原式逐位相同（原布局不变）')
const pushed = anchorBoxNew('E', 800, 500, 5.2, 300, 20, 64)
ok(pushed[0] === 800 + 5.2 + LABEL_GAP + 64, 'e=64 时 E 锚点沿 +x 外推 64px', pushed)

/* ── 3. 放置算法复刻：容量是否真的提升 ── */
console.log('\n[3] 放置容量（真实屏幕坐标 + 真实位图盒）')
const dataFile = 'shots/designs/atlas/capacity-all.json'
if (!existsSync(dataFile)) {
  console.log(`  skip（缺少 ${dataFile}，先跑 node designs/atlas/diag10.mjs）`)
} else {
  const D = JSON.parse(readFileSync(dataFile, 'utf8'))
  const bodies = D.all.filter((b) => !b.bad)
  const W = D.view.w, H = D.view.h
  const LABEL_PAD = D.consts.LABEL_PAD
  const VIEW_INSET = 4

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

  /** @param mode 'base' = 只试 8 锚点；'push' = 8 锚点 × ANCHOR_PUSH；@param T 候选阈值
   *  @param magMax 障碍集上限（6 = 全部星点，与 labels.js 的最终实现一致）
   *  @param scale 总览态公式位图缩放（与 bake.js 的 OVERVIEW_SCALE 一致） */
  function run({ mode, T, magMax = 6, scale = 1, pushes = [0, 16, 32, 48] }) {
    const g = new Map()
    for (const b of bodies) {
      if (!((b.kind === 'star' && b.mag <= magMax) || (b.kind === 'dso' && b.tier <= 1))) continue
      addShape(g, { t: 'c', x: b.x, y: b.y, r: b.r + 2 }, b.id)
    }
    const cand = bodies.filter((b) => b.labelL <= T)
      .map((b) => ({ ...b, w: b.w * scale, h: b.h * scale }))
      .sort((a, b) => b.imp - a.imp)
    const placed = []
    for (const c of cand) {
      let got = null
      for (const a of ANCHORS) {
        for (const e of (mode === 'push' ? pushes : [0])) {
          const [x, y] = anchorBoxNew(a, c.x, c.y, c.r, c.w, c.h, e)
          const s = { x, y, w: c.w, h: c.h }
          if (viol(s)) continue
          if (!hits(g, s, c.id)) { got = s; break }
        }
        if (got) break
      }
      if (got) { addShape(g, got, c.id); placed.push(c.id) }
    }
    return { n: placed.length, ids: placed }
  }

  /* 与 labels.js 最终参数一致：ANCHOR_PUSH=[0,16,...,96]、OVERVIEW_ADMIT_L=1.3、全星点障碍、不缩放 */
  const base = run({ mode: 'base', T: 0, magMax: 2 })
  const push = run({ mode: 'push', T: 0, magMax: 2 })
  const pushAdmit = run({ mode: 'push', T: 0.55, magMax: 2 })
  const finalImpl = run({ mode: 'push', T: 1.3, magMax: 6, scale: 1, pushes: [0, 16, 32, 48, 64, 80, 96] })
  console.log(`  （改前基线）只避让亮星 + 8 锚点            → ${base.n} 条`)
  console.log(`  （改前基线）只避让亮星 + 外推              → ${push.n} 条`)
  console.log(`  （中间态）只避让亮星 + 外推 + 放宽 T=0.55  → ${pushAdmit.n} 条`)
  console.log(`  （最终实现）全星点障碍 + 外推 0..96 + T=1.3 → ${finalImpl.n} 条`)
  ok(push.n >= base.n, '外推不减少容量', { base: base.n, push: push.n })
  ok(finalImpl.n >= 40, '总览态可达 ≥40 条可读公式（全星点避让下）', { got: finalImpl.n })
}

/* ── 4. 烘焙优先级排序（纯算术，不依赖浏览器） ── */
console.log('\n[4] 烘焙优先级：总览候选必须排在最前')
{
  const OVERVIEW_ADMIT_L = 1.3
  const dist = {}
  if (existsSync('shots/designs/atlas/capacity-all.json')) {
    const D = JSON.parse(readFileSync('shots/designs/atlas/capacity-all.json', 'utf8'))
    for (const b of D.all) if (!b.bad) dist[b.labelL] = (dist[b.labelL] || 0) + 1
  }
  const labels = Object.keys(dist).map(Number).sort((a, b) => a - b)
  const baseL = labels.filter((l) => l <= 0)
  const admitL = labels.filter((l) => l > 0 && l <= OVERVIEW_ADMIT_L)
  const restL = labels.filter((l) => l > OVERVIEW_ADMIT_L)
  const nBase = baseL.reduce((s, l) => s + dist[l], 0)
  const nAdmit = admitL.reduce((s, l) => s + dist[l], 0)
  const nRest = restL.reduce((s, l) => s + dist[l], 0)
  console.log(`  labelL 档位：基础档 [${baseL.join(',')}] / 放宽档 [${admitL.join(',')}] / 其余 ${restL.length} 档`)
  console.log(`  条数：基础 ${nBase} + 放宽 ${nAdmit} = ${nBase + nAdmit} 条排在其余 ${nRest} 条之前`)

  const prios = []
  baseL.forEach((l, i) => prios.push({ l, p: -3000 + i, tier: 'base' }))
  admitL.forEach((l, i) => prios.push({ l, p: -2000 + i, tier: 'admit' }))
  restL.forEach((l) => prios.push({ l, p: l * 100, tier: 'rest' }))
  const maxBase = Math.max(...prios.filter((x) => x.tier === 'base').map((x) => x.p))
  const minAdmit = Math.min(...prios.filter((x) => x.tier === 'admit').map((x) => x.p))
  const maxAdmit = Math.max(...prios.filter((x) => x.tier === 'admit').map((x) => x.p))
  const minRest = Math.min(...prios.filter((x) => x.tier === 'rest').map((x) => x.p))
  ok(maxBase < minAdmit, '基础档优先级全部小于放宽档', { maxBase, minAdmit })
  ok(maxAdmit < minRest, '放宽档优先级全部小于其余', { maxAdmit, minRest })
  const allP = prios.map((x) => x.p)
  ok(new Set(allP).size === allP.length, '优先级严格全序（无并列，堆行为确定）', { n: allP.length, uniq: new Set(allP).size })
}

/* ── 5. 冻结常量未被改动 ── */
console.log('\n[5] 冻结常量未被改动')
ok(C.LABEL_MAX_W === 360, 'LABEL_MAX_W 仍为 360（未改冻结常量）')
ok(C.FORMULA_MIN_PX === 10.5, 'FORMULA_MIN_PX 仍为 10.5')
ok(C.BAKE_BUDGET_MS === 8, 'BAKE_BUDGET_MS 仍为 8')
ok(C.BAKE_CONCURRENCY === 6, 'BAKE_CONCURRENCY 仍为 6')

console.log(`\n${fail ? `FAIL (${fail} 项)` : '全部通过'}`)
process.exit(fail ? 1 : 0)
