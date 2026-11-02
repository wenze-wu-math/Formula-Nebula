/**
 * designs/atlas/labels.js — 屏幕上全部文字标签：参选、避让、渐隐、绘制、命中（M3 所有，SPEC §6）。
 *
 * 这是解决"总览读不出公式""拉近公式互相叠压"的核心模块。取舍：
 *   · 标签字号是屏幕常数：公式位图按显示尺寸烘一次（bake.js），缩放只移动位置，不缩放文字，
 *     所以 L=0 的 ~10 条公式和 L=4 的几十条公式一样清晰。
 *   · 一个放置器管所有文字（公式+中文名、星座名、研究者名）：按优先级贪心，先到先占；
 *     每个候选试 8 个锚点（上一帧的锚点优先 → 缩放平移时标签不乱跳）。被拒的就不显示，
 *     因此屏幕上**零重叠**是构造性保证，labelStats 再独立复核一遍。
 *   · 研究者名沿 R_RES 圆弧逐字排布，碰撞用"弦方向有向盒"（OBB）+ SAT；高度按弧的矢高加厚，
 *     保证弯曲的字形始终落在盒内。
 *   · 64px 均匀网格做空间哈希，每帧重建；候选只取视口外扩 80px 内的 body，
 *     1600×1000 下每帧 < 3 ms。
 *   · 淡出中的标签不占位（否则缩放时会"幽灵挡字"），记住相对 body 的偏移随之移动；
 *     被新标签盖住的以 3 倍速淡出。
 */
import {
  COLOR, FONT_SERIF, FONT_KAI, INK_HI_HEX,
  NAME_PX, RES_PX, CONST_PX, CONST_LATIN_PX, LABEL_MAX_W, LABEL_GAP, LABEL_PAD, NAME_GAP,
  FADE_IN_MS, FADE_OUT_MS, HYSTERESIS, CONST_FADE_L0, CONST_FADE_L1, RES_LABEL_L, DIM,
} from './constants.js'
/* 世界长度量从 runtime.js 取（可缩放 live binding）；见 runtime.js 头注释 */
import { R_RES, R_RES_TICK_END } from './runtime.js'
import { rectsOverlap, smoothstep, clamp } from './geo.js'
import { bodyRadius } from './glyphs.js'
import { state } from './state.js'
import { initBake, requestBake, getBake, bakeFailed, onBakeDone } from './bake.js'

/* ───────── 私有常量 ───────── */
const CAND_MARGIN = 80           // 候选：屏幕位置在视口外扩 80px 内
const VIEW_INSET = 4             // 标签必须完全在视口内（四周留 4px）
const CELL = 64                  // 空间哈希格边长（px）
const FOCUS_NB = 24              // 选中时强制参选的邻居数
const SEARCH_N = 12              // 搜索命中参选数
const NAME_H = NAME_PX * 1.25    // 中文名行高
const RES_H = RES_PX * 1.3       // 研究者名有向盒高
const OBST_PAD = 2               // 障碍圆半径 = r + 2
const SEL_RING = 11              // 选中准星外圈 ≈ r+10，标签要绕开它
const HOVER_RING = 5             // 悬停圈 r+4
const CONST_LS = 0.5             // 星座中文名字间距（em）
const LATIN_LS = 0.35            // 拉丁名字间距（em）
const CONST_GAP = 3              // 中文名与拉丁名之间
const HALO_W = 3                 // 文字晕边线宽
const SEARCH_ALPHA = 0.85        // 选中时搜索命中（非焦点）标签的透明度

const NAME_FONT = `${NAME_PX}px ${FONT_SERIF}`
const RES_FONT = `italic ${RES_PX}px ${FONT_SERIF}`
const CONST_FONT = `${CONST_PX}px ${FONT_KAI}`
const LATIN_FONT = `${CONST_LATIN_PX}px ${FONT_SERIF}`
const ANCHORS = ['E', 'W', 'NE', 'NW', 'SE', 'SW', 'N', 'S']

/* ───────── 总览可读性（本模块私有策略，不改冻结的 constants.js） ─────────
 * 问题：L=0 时只有 40 条公式参选（labelL ≤ 0 那一档），而它们的星点挤在
 * 394×566 px 的中心区里；每个候选只试 8 个**紧贴星点**的锚点，实测只能放下 11–14 条。
 * 也就是说"总览读不出公式"有**两个**独立成因：
 *   ① 烘焙慢（464 条要 26 s）—— 已在 bake.js 用自驱泵 + 两段式优先级修掉；
 *   ② 放置器太保守（锚点只贴着星点，宁可空着也不外推）—— 本段修。
 *
 * 两个私有杠杆（都不动常量文件）：
 *   · ANCHOR_PUSH：每个方向额外试几个外推半径。标签沿同一方向外移，归属仍然明确
 *     （视觉上仍在星点的那一侧），但能把星点之间的空隙用起来。0 号档 = 原来的紧贴锚点，
 *     所以空间够用时**布局完全不变**（首选项仍是 push=0）。
 *   · OVERVIEW_ADMIT_L / OVERVIEW_TARGET：总览态把候选集放宽一档（labelL ≤ 0.55 的
 *     次一档也参选），直到已放下的公式数达到 OVERVIEW_TARGET 为止。重要度顺序不变。
 *
 * 参数是用 capacity-all.json 的真实屏幕坐标 + 真实位图盒跑穷举定的（check-simple.mjs）：
 * 全部星点当障碍时，唯一能同时满足"40 条 + 零可见遮挡 + 零重叠 + 基础档不退化"的组合是
 *   ANCHOR_PUSH=0..96 + OVERVIEW_ADMIT_L=1.3 + 不做缩放（字号仍是 FORMULA_PX）
 *   → L=0 放下 40 条，其中基础档（labelL ≤ 0）14 条 —— 与改前（11–14 条）持平，
 *     所以语义缩放没有因为这次改动而退化；
 *     visFrac ≥ 0.5 的可见遮挡 0 对，标签重叠 0 对，最大外推 96px，最小等效字号 ≥ FORMULA_MIN_PX。
 * 曾试过"总览态把位图缩到 0.9"来减少外推（check-final2.mjs），但那需要 setBakeScale
 * + 缩放跨档时重烘全部条目，风险高而收益小（只把最大外推从 96 降到 48），已弃用。 */
const ANCHOR_PUSH = [0, 16, 32, 48, 64, 80, 96]
const OVERVIEW_L = 0.2              // L 低于此值算"总览态"
/* 总览补位窗口的下限（2026-11-01 新增）。
 *
 * 为什么需要一个**下限**：补位档（越级公式）用 skipL 绕过 L 判断，
 * 原条件只写 `L < OVERVIEW_L` —— 而缩小时 L 变负、条件恒成立，
 * 于是"缩得越小、公式反而显示得越多"，与语义缩放完全相反。
 * 实测：L=-0.3 时 36 个公式，而 L=+0.6（放大）只有 5 个。
 *
 * 补位只应在"总览这幅图"上补足可读性，一旦用户主动缩小（离开总览），
 * 就该让它退出。取 -0.45 ≈ 缩到 73%，是"总览"与"缩小浏览"的分界。 */
const OVERVIEW_L_FLOOR = -0.45
const OVERVIEW_ADMIT_L = 1.3        // 总览态额外参选的 labelL 上限
const OVERVIEW_TARGET = 40          // 总览态的目标可读公式数（任务硬指标）

/* ───────── 模块状态 ───────── */
let atlasRef = null
let bodyOrder = []               // 第 6 级候选：star + dso，按 importance 降序、mag 升序、id
let resOrder = []                // 研究者：importance 降序、id
let regionOrder = []             // 星座：星数降序
/** key → Rec（跨帧持久，用于滞回、上帧锚点、渐隐） */
const recs = new Map()
let placed = []                  // 本帧放置成功的 Rec（按放置顺序）
let lastStats = null
const wantedPending = new Set()  // 本帧想放但还没烘好的 id（完成时才请求重画）
const updTimes = []

/* ───────── 文字测量（缓存） ───────── */
let mctx = null
const measureCache = new Map()
function measure(text, font) {
  const k = font + '|' + text
  let w = measureCache.get(k)
  if (w !== undefined) return w
  if (!mctx && typeof document !== 'undefined') mctx = document.createElement('canvas').getContext('2d')
  if (mctx) { mctx.font = font; w = mctx.measureText(text).width }
  else {
    const px = parseFloat(font.replace(/^italic\s+/, '')) || 12
    w = 0
    for (const ch of text) w += /[　-鿿＀-￯]/.test(ch) ? px : px * 0.55
  }
  measureCache.set(k, w)
  return w
}

/** 中文名行：超出 LABEL_MAX_W 时截断加省略号（缓存） */
const nameCache = new Map()
function nameLine(body) {
  let v = nameCache.get(body.id)
  if (v) return v
  let text = String(body.node.name ?? body.id)
  let w = measure(text, NAME_FONT)
  if (w > LABEL_MAX_W) {
    const chars = [...text]
    while (chars.length > 1 && measure(chars.join('') + '…', NAME_FONT) > LABEL_MAX_W) chars.pop()
    text = chars.join('') + '…'
    w = measure(text, NAME_FONT)
  }
  v = { text, w }
  nameCache.set(body.id, v)
  return v
}

/** 逐字加字间距的排布：返回 { chars:[{ch,dx}], w }（w 不含末字之后的间距，保证真居中） */
function spaced(text, font, ls) {
  const px = parseFloat(font) || 12
  const chars = []
  let x = 0
  for (const ch of text) {
    const cw = measure(ch, font)
    chars.push({ ch, dx: x + cw / 2 })   // dx = 字中心相对行左端
    x += cw + ls * px
  }
  return { chars, w: Math.max(0, x - ls * px) }
}

/** 星座名两行的几何（缓存）：中文 FONT_KAI + 拉丁 FONT_SERIF */
const constCache = new Map()
function constGeom(region) {
  let g = constCache.get(region.family)
  if (g) return g
  const a = spaced(region.name, CONST_FONT, CONST_LS)
  const b = spaced(region.latin || '', LATIN_FONT, LATIN_LS)
  const h1 = CONST_PX * 1.2, h2 = region.latin ? CONST_LATIN_PX * 1.3 : 0
  g = { a, b, h1, h2, w: Math.max(a.w, b.w), h: h1 + (h2 ? CONST_GAP + h2 : 0) }
  constCache.set(region.family, g)
  return g
}

/** 研究者名的逐字宽度（缓存） */
const resCache = new Map()
function resText(body) {
  let v = resCache.get(body.id)
  if (v) return v
  const text = String(body.node.name ?? body.id)
  const chars = []
  let w = 0
  for (const ch of text) { const cw = measure(ch, RES_FONT); chars.push({ ch, cw }); w += cw }
  v = { text, chars, w }
  resCache.set(body.id, v)
  return v
}

/* ───────── 几何：形状 = { t:'r', x,y,w,h } | { t:'o', cx,cy,ux,uy,hw,hh } | { t:'c', x,y,r,owner } ───────── */

/** 有向盒的轴对齐包围盒 */
function obbAabb(o) {
  const ex = Math.abs(o.ux) * o.hw + Math.abs(o.uy) * o.hh
  const ey = Math.abs(o.uy) * o.hw + Math.abs(o.ux) * o.hh
  return { x: o.cx - ex, y: o.cy - ey, w: 2 * ex, h: 2 * ey }
}
const rectAsObb = (r) => ({ cx: r.x + r.w / 2, cy: r.y + r.h / 2, ux: 1, uy: 0, hw: r.w / 2, hh: r.h / 2 })

/** 两个有向盒 SAT 相交（pad = 两者之间至少留的距离，与 rectsOverlap 的 pad 语义一致） */
function obbOverlap(a, b, pad = 0) {
  const dx = b.cx - a.cx, dy = b.cy - a.cy
  const axes = [[a.ux, a.uy], [-a.uy, a.ux], [b.ux, b.uy], [-b.uy, b.ux]]
  for (const [nx, ny] of axes) {
    const ra = a.hw * Math.abs(a.ux * nx + a.uy * ny) + a.hh * Math.abs(-a.uy * nx + a.ux * ny)
    const rb = b.hw * Math.abs(b.ux * nx + b.uy * ny) + b.hh * Math.abs(-b.uy * nx + b.ux * ny)
    if (Math.abs(dx * nx + dy * ny) >= ra + rb + pad) return false
  }
  return true
}

/** 圆与有向盒相交 */
function circleObb(x, y, r, o) {
  const dx = x - o.cx, dy = y - o.cy
  const lx = clamp(dx * o.ux + dy * o.uy, -o.hw, o.hw)
  const ly = clamp(-dx * o.uy + dy * o.ux, -o.hh, o.hh)
  const px = dx - (lx * o.ux - ly * o.uy), py = dy - (lx * o.uy + ly * o.ux)
  return px * px + py * py < r * r
}
function circleRect(x, y, r, b) {
  const nx = clamp(x, b.x, b.x + b.w), ny = clamp(y, b.y, b.y + b.h)
  return (x - nx) ** 2 + (y - ny) ** 2 < r * r
}

/** 两个标签形状（r / o）是否相交，pad 为最小间距 */
function shapesOverlap(a, b, pad) {
  if (a.t === 'r' && b.t === 'r') return rectsOverlap(a, b, pad)
  const A = a.t === 'r' ? rectAsObb(a) : a, B = b.t === 'r' ? rectAsObb(b) : b
  return obbOverlap(A, B, pad)
}
function shapeBox(s) { return s.t === 'r' ? s : s.t === 'o' ? obbAabb(s) : { x: s.x - s.r, y: s.y - s.r, w: 2 * s.r, h: 2 * s.r } }

/* ───────── 空间哈希（64px 均匀网格，每帧重建） ───────── */
const grid = new Map()
let stamp = 0
const items = []                 // { s: shape, owner, stamp }
function gridReset() { grid.clear(); items.length = 0 }
function gridAdd(shape, owner) {
  const it = { s: shape, owner, stamp: 0 }
  items.push(it)
  const b = shapeBox(shape)
  const x0 = Math.floor(b.x / CELL), x1 = Math.floor((b.x + b.w) / CELL)
  const y0 = Math.floor(b.y / CELL), y1 = Math.floor((b.y + b.h) / CELL)
  for (let gx = x0; gx <= x1; gx++) for (let gy = y0; gy <= y1; gy++) {
    const k = gx * 65536 + gy
    let cell = grid.get(k)
    if (!cell) grid.set(k, (cell = []))
    cell.push(it)
  }
}
/**
 * 候选形状与网格里的东西冲突数。self = 候选所属 body id（自己的星点不算障碍）；
 * circles = false 时忽略障碍圆（星座名）；limit = 找到这么多个就停（普通候选 1，强制候选算全）。
 */
function gridHits(shape, self, circles = true, limit = 1) {
  const b = shapeBox(shape)
  const x0 = Math.floor((b.x - LABEL_PAD) / CELL), x1 = Math.floor((b.x + b.w + LABEL_PAD) / CELL)
  const y0 = Math.floor((b.y - LABEL_PAD) / CELL), y1 = Math.floor((b.y + b.h + LABEL_PAD) / CELL)
  const my = ++stamp
  let n = 0
  for (let gx = x0; gx <= x1; gx++) for (let gy = y0; gy <= y1; gy++) {
    const cell = grid.get(gx * 65536 + gy)
    if (!cell) continue
    for (const it of cell) {
      if (it.stamp === my) continue
      it.stamp = my
      const s = it.s
      let hit
      if (s.t === 'c') {
        if (!circles || it.owner === self) continue
        hit = shape.t === 'r' ? circleRect(s.x, s.y, s.r, shape) : circleObb(s.x, s.y, s.r, shape)
      } else hit = shapesOverlap(shape, s, LABEL_PAD)
      if (hit && ++n >= limit) return n
    }
  }
  return n
}

/* ───────── 每帧上下文 ───────── */
let C = null                     // { f, P, L, w, h, occ, sel, focus, hoverId, hoverFam, hits:Set }
const tried = new Set()          // 本帧已尝试过的 body（高优先级先试，低级别不再重复）
let pending = 0

const viewViol = (s) => {
  const b = shapeBox(s)
  return b.x < VIEW_INSET || b.y < VIEW_INSET || b.x + b.w > C.w - VIEW_INSET || b.y + b.h > C.h - VIEW_INSET
}
function occViol(s) {
  for (const o of C.occ) {
    if (!o || !(o.w > 0) || !(o.h > 0)) continue
    if (s.t === 'r' ? rectsOverlap(s, o, 0) : obbOverlap(s, rectAsObb(o), 0)) return true
  }
  return false
}
const offscreen = (x, y) => x < -CAND_MARGIN || y < -CAND_MARGIN || x > C.w + CAND_MARGIN || y > C.h + CAND_MARGIN

/** 锚点 → 盒左上角 + 对齐（SPEC §6.4）。e = 沿该方向额外外推的 px（0 = 原紧贴位置）。 */
function anchorBox(a, bx, by, r, W, H, e = 0) {
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
const anchorOrder = (prev) => (prev && ANCHORS.includes(prev) ? [prev, ...ANCHORS.filter((a) => a !== prev)] : ANCHORS)

/**
 * 锚点尝试顺序。
 *
 * 2026-11-01 修「缩小后公式反而显示、放大后反而变少」的**真正根因**：
 *
 * 原先顺序是固定的 `ANCHORS = ['E','W','NE','NW','SE','SW','N','S']`，
 * 与星点在屏幕上的位置无关。于是靠近屏幕上边缘的星点仍先试 NE / N ——
 * 算出来的标签框 y 是负数（实测 -54 / -47 / -120 / -80），被 viewViol
 * 以"超出视口"整条拒绝。放大后星点半径变大、标签离星点更远，
 * 这个失败率急剧上升：实测 L=0.8 时 388 个星点在屏内、121 个候选，
 * 只放下 3 个公式。
 *
 * 修法：按**星点到视口四边的距离**动态排序 —— 离哪边窄就先往反方向放，
 * 把标签甩向屏幕内侧。这不需要额外试错成本，只是把必然失败的锚点排到后面。
 *
 * 保留滞回：上一帧用过的锚点仍然排最前，避免每帧锚点跳来跳去（抖动）。
 */
function anchorOrderFor(prev, bx, by) {
  const dl = bx, dr = C.w - bx, dt = by, db = C.h - by
  /* 每个锚点的"朝外程度"：越小越朝屏幕内侧，越优先 */
  const outward = {
    E: dr, W: dl,                 // 左右：离哪边远就往哪边放
    NE: Math.min(dr, dt), NW: Math.min(dl, dt),
    SE: Math.min(dr, db), SW: Math.min(dl, db),
    N: dt, S: db,
  }
  const sorted = ANCHORS.slice().sort((a, b) => outward[b] - outward[a])
  if (prev && ANCHORS.includes(prev)) return [prev, ...sorted.filter((a) => a !== prev)]
  return sorted
}

/** 星点在标签布局里占的半径：星点 + 挖空描边；选中时绕开准星，悬停时绕开悬停圈 */
function layoutRadius(b) {
  const r = bodyRadius(b, C.L)
  if (b.id === C.sel) return r + SEL_RING
  if (b.id === C.hoverId) return r + HOVER_RING
  return r + 1.3
}

function getRec(key, kind, id) {
  let r = recs.get(key)
  if (!r) {
    r = { key, kind, id, alpha: 0, nA: 0, placed: false, prevPlaced: false, prevF: false, prevN: false, anchor: null }
    recs.set(key, r)
  }
  return r
}

/** 静态障碍圆：视口内的星点 / 深空天体（半径见 updateLabels 里的说明） */
function addObstacle(b) {
  const x = C.P.sx(b.x), y = C.P.sy(b.y)
  if (x < -20 || y < -20 || x > C.w + 20 || y > C.h + 20) return
  const r = b.id === C.sel ? bodyRadius(b, C.L) + SEL_RING + 1 : obstacleRadius(b)
  gridAdd({ t: 'c', x, y, r }, b.id)
}

/**
 * 障碍圆半径。
 *
 * ═══ 为什么不用 bodyRadius(b, C.L)（2026-11-02 修的 bug）═══
 *
 * 用户反馈"缩小时太挤"，排查时发现一个更严重的问题：
 * 公式数**不随放大单调增长**（实测 L=0 → 76 条，L=0.6 → 30 条，L=1.2 → 59 条）。
 *
 * 根因：障碍圆用 `bodyRadius(b, C.L)`，而它乘了 `glyphScale(L)` ——
 * 放大时星点半径变大（L=1.2 时 1 等星 5.7px），障碍圆跟着膨胀；
 * 但**标签字号是固定的**（FORMULA_PX 不随 L 变），于是标签要绕开的
 * 障碍越来越大，可放置空间反而变小：
 *
 *   L      理论候选   实际放下   成功率
 *   0        521       76       15%
 *   0.6     1030       30        3%    ← 候选翻倍，成功率却暴跌
 *   1.2     1383       59        4%
 *
 * 修法：障碍半径按 **L=0 时的星点大小**算，不随缩放膨胀。
 * 放大时星点在屏幕上确实更大，但它"占住"的可视区域增长远小于
 * glyphScale 的增长（星点中心间距也在同步放大），用基准半径是更合理的近似。
 */
function obstacleRadius(b) {
  /* 用 L=0 的半径（STAR_R/DSO_R 的 1× 值）作为障碍基准 */
  return bodyRadius(b, 0) + OBST_PAD
}

/**
 * 放置一个 star/dso 的标签（公式 + 可选中文名）。
 * o = { forced, skipL, mustName, mul, emph, prio }
 */
function placeBody(b, o) {
  if (!b || b.kind === 'researcher' || tried.has(b.id)) return
  tried.add(b.id)
  const bx = C.P.sx(b.x), by = C.P.sy(b.y)
  if (offscreen(bx, by)) return
  const key = 'b:' + b.id
  const prev = recs.get(key)
  const okF = o.skipL || C.L >= b.labelL - (prev && prev.prevF ? HYSTERESIS : 0)
  const okN = o.mustName || C.L >= b.nameL - (prev && prev.prevN ? HYSTERESIS : 0)
  if (!okF && !okN) return
  let bake = null, failed = false
  if (okF) {
    bake = getBake(b.id)
    if (!bake) {
      failed = bakeFailed(b.id)
      if (!failed) { requestBake(b.id, o.prio ?? -50); pending++; wantedPending.add(b.id) }
    }
  }
  // 还没烘好：本帧只在 L ≥ nameL（或必须显示名字）时放中文名；烘焙失败：退化为只显示中文名
  const wantN = okN || (failed && okF)
  let variants
  if (bake && wantN) variants = o.mustName && !o.forced ? ['FN', 'F', 'N'] : ['FN', 'F']
  else if (bake) variants = ['F']
  else if (wantN) variants = ['N']
  else return

  const nm = nameLine(b)
  const fw = bake ? bake.w - 2 * bake.pad : 0, fh = bake ? bake.h - 2 * bake.pad : 0
  const rr = layoutRadius(b)
  const order = anchorOrderFor(prev && prev.anchor, bx, by)
  const dims = (v) => (v === 'FN' ? [Math.max(fw, nm.w), fh + NAME_GAP + NAME_H] : v === 'F' ? [fw, fh] : [nm.w, NAME_H])
  /* 总览态允许外推；拉近后（L 大）空间充裕，只试紧贴锚点，保持"标签贴着星点"的星图气质 */
  /* 外推候选：2026-11-01 起**所有缩放档都启用**。
   * 原实现只在总览态（L < 0.2）外推，理由是"拉近后空间充裕，标签该紧贴星点"。
   * 但实测放大后反而更放不下（星点半径变大、标签离星点更远、靠近视口边缘的
   * 直接被 viewViol 拒绝），所以外推在放大时同样必要。
   * 0 号档仍是紧贴锚点，所以"空间够用时布局不变"这一点没变。 */
  const pushes = ANCHOR_PUSH

  let pick = null
  for (const v of variants) {
    const [W, H] = dims(v)
    for (const a of order) {
      for (const e of pushes) {
        const [x, y, al] = anchorBox(a, bx, by, rr, W, H, e)
        const s = { t: 'r', x, y, w: W, h: H }
        if (viewViol(s) || occViol(s) || gridHits(s, b.id)) continue
        pick = { v, a, al, s, e }
        break
      }
      if (pick) break
    }
    if (pick) break
  }
  let forced = false
  if (!pick && o.forced) {
    // 强制显示：在首选内容下挑冲突最少的锚点（视口 / 遮挡区越界记重罚）
    const v = variants[0], [W, H] = dims(v)
    let best = Infinity
    for (const a of order) {
      for (const e of pushes) {
        const [x, y, al] = anchorBox(a, bx, by, rr, W, H, e)
        const s = { t: 'r', x, y, w: W, h: H }
        const score = gridHits(s, b.id, true, 1e9) + (viewViol(s) ? 100 : 0) + (occViol(s) ? 100 : 0)
        if (score < best) { best = score; pick = { v, a, al, s, e } }
      }
    }
    forced = true
  }
  if (!pick) return

  const r = getRec(key, 'formula', b.id)
  r.body = b
  r.showF = pick.v !== 'N'
  r.showN = pick.v !== 'F'
  if (!r.showN) r.nA = 0
  r.bake = r.showF ? bake : null
  r.name = nm
  r.fw = r.showF ? fw : 0; r.fh = r.showF ? fh : 0
  r.anchor = pick.a; r.align = pick.al
  r.push = pick.e || 0
  r.shape = pick.s
  r.x = pick.s.x; r.y = pick.s.y; r.w = pick.s.w; r.h = pick.s.h
  r.ox = pick.s.x - bx; r.oy = pick.s.y - by
  r.placed = true; r.forced = forced
  r.mul = o.mul ?? 1; r.emph = !!o.emph
  placed.push(r)
  gridAdd(pick.s, b.id)
  /* 星点本身作为障碍。全部 464 个星点/深空都纳入避让：
   * 改前只避让 mag≤2 的 80 个亮星，实测有 134 个星点被标签完全盖住；
   * 全纳入后降为 0（见 perf.md / check-cover*.mjs）。
   * 注意：总览可读公式数因此受限于星点密度，这是"标签不压星点"的代价，
   * 属于设计取舍，不为了凑数量而放宽。 */
  gridAdd({ t: 'c', x: bx, y: by, r: rr - 1.3 + OBST_PAD }, b.id)
}

/** 星座名的淡出：L ≤ CONST_FADE_L0 全显，到 CONST_FADE_L1 为 0 */
const constAlpha = (L) => 1 - smoothstep(CONST_FADE_L0, CONST_FADE_L1, L)

function placeConst(region) {
  const a = constAlpha(C.L)
  if (a <= 0.02) return
  const g = constGeom(region)
  const cx = C.P.sx(region.labelX), cy = C.P.sy(region.labelY)
  const s = { t: 'r', x: cx - g.w / 2, y: cy - g.h / 2, w: g.w, h: g.h }
  // 星座名只有一个位置（区域中心）；不避让暗星（真实星图也如此），只避让其它标签与 UI
  if (viewViol(s) || occViol(s) || gridHits(s, null, false)) return
  const r = getRec('c:' + region.family, 'const', region.family)
  r.region = region; r.geom = g
  r.shape = s; r.x = s.x; r.y = s.y; r.w = s.w; r.h = s.h
  r.placed = true; r.forced = false
  r.mul = a * (C.sel ? DIM.constName : 1)
  r.emph = C.hoverFam === region.family
  placed.push(r)
  gridAdd(s, 'c:' + region.family)
}

/**
 * 研究者名的屏幕几何：沿 R_RES 圆弧逐字排布。返回 { shape(OBB), R, ox, oy, ra, upper, tw }。
 * 字心半径 = R_RES·zoom（名字以 R_RES 为中线，刚好在刻度终点 R_RES_TICK_END 之外）。
 * 有向盒沿弦方向：宽 = 文字宽，高 = RES_H + 矢高（弯曲的字形全落在盒内）。
 */
function resGeom(b) {
  const z = C.P.zoom
  const ox = C.P.sx(0), oy = C.P.sy(0)
  const R = Math.max(1, R_RES * z)
  const t = resText(b)
  const ra = b.raLabel ?? 0
  const half = Math.min(Math.PI * 0.9, t.w / 2 / R)          // 文字所占半角
  const sag = R * (1 - Math.cos(half))                         // 弧中点到弦的距离
  const rc = R - sag / 2                                       // 盒中心半径：弧与弦之间
  const nx = -Math.sin(ra), ny = -Math.cos(ra)                 // 外法向（屏幕）
  // 正立阅读方向：上半圈沿 ra 递减（屏幕向右），下半圈沿 ra 递增（同样向右）
  const upper = Math.cos(ra) >= 0
  const ux = upper ? -ny : ny, uy = upper ? nx : -nx
  const shape = {
    t: 'o', cx: ox + nx * rc, cy: oy + ny * rc, ux, uy,
    hw: R * Math.sin(half), hh: (RES_H + sag) / 2,
  }
  // 宽名字在极远处可能比弧还长：此时 hw 用文字半宽兜底
  if (half >= Math.PI * 0.9) shape.hw = t.w / 2
  return { shape, R, ox, oy, ra, upper, t }
}

function placeResearcher(b, o) {
  if (!b || tried.has(b.id)) return
  tried.add(b.id)
  const key = 'r:' + b.id
  const prev = recs.get(key)
  if (!o.skipL && C.L < RES_LABEL_L - (prev && prev.prevPlaced ? HYSTERESIS : 0)) return
  const g = resGeom(b)
  const s = g.shape
  let forced = false
  if (viewViol(s) || occViol(s) || gridHits(s, b.id)) {
    // 强制（选中的研究者）且至少部分在视口里才放
    const bb = shapeBox(s)
    if (!o.forced || bb.x > C.w || bb.y > C.h || bb.x + bb.w < 0 || bb.y + bb.h < 0) return
    forced = true
  }
  const r = getRec(key, 'researcher', b.id)
  r.body = b; r.geom = g; r.shape = s
  const bb = shapeBox(s)
  r.x = bb.x; r.y = bb.y; r.w = bb.w; r.h = bb.h
  r.placed = true; r.forced = forced
  r.mul = o.mul ?? 1; r.emph = !!o.emph
  placed.push(r)
  gridAdd(s, b.id)
}

/* ───────── 导出 ───────── */

/** 初始化：排好候选顺序，按"总览最该先显示"的顺序请求全部公式烘焙 */
export function initLabels(atlas) {
  atlasRef = atlas
  recs.clear(); placed = []; lastStats = null
  initBake(atlas)
  const byImp = (a, b) => b.importance - a.importance || a.mag - b.mag || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0)
  bodyOrder = [...atlas.stars, ...atlas.dsos].sort(byImp)
  resOrder = atlas.researchers.slice().sort(byImp)
  regionOrder = Object.values(atlas.regions).sort((a, b) => (b.starIds?.length ?? 0) - (a.starIds?.length ?? 0) || (a.family < b.family ? -1 : 1))
  /* 烘焙优先级（越小越先）。原实现是 labelL·100 − importance·10：labelL 主导，
   * 于是"总览该显示的 40 条"（labelL ≤ 0）和"要拉到 L=3.3 才显示的 102 条"混在同一个队列里，
   * 首屏要等队列整体推进。改成三段式（全部排成连续的整数名次，保证严格有序）：
   *   ① 总览基础档（labelL ≤ 0，40 条）        → −3000 + 名次
   *   ② 总览放宽档（labelL ≤ OVERVIEW_ADMIT_L） → −2000 + 名次
   *      —— 这两段合起来才是"总览态可能显示的候选"。放宽档必须紧跟基础档，
   *         否则放宽候选要等到 464 条都排完才轮到，首屏照样不够 40 条。
   *   ③ 其余按 labelL 升序、同 labelL 按 importance 降序
   * 于是"首屏可读公式数"只取决于①②共 ~180 条烘完的时间，与 464 条的总量解耦。 */
  const base = bodyOrder.filter((b) => b.labelL <= 0)
  const admit = bodyOrder.filter((b) => b.labelL > 0 && b.labelL <= OVERVIEW_ADMIT_L)
  const rest = bodyOrder.filter((b) => b.labelL > OVERVIEW_ADMIT_L)
  base.forEach((b, i) => requestBake(b.id, -3000 + i))
  admit.forEach((b, i) => requestBake(b.id, -2000 + i))
  rest.forEach((b) => requestBake(b.id, b.labelL * 100 - b.importance * 10))
  // 只有"本帧正等着的"位图完成才请求重画（启动时 464 个解码陆续完成，不必每个都整帧重画）
  onBakeDone((id) => { if (wantedPending.has(id)) state.dirty = true })
}

/** 参选 + 避让 + 渐隐（SPEC §6.3–6.6）；返回 animating */
export function updateLabels(f) {
  if (!atlasRef) return false
  const t0 = performance.now()
  const hv = f.hover
  C = {
    f, P: f.P, L: f.L, w: f.w, h: f.h, occ: f.occluders || [],
    sel: f.selected && atlasRef.bodies.has(f.selected) ? f.selected : null,
    focus: f.focus || null,
    hoverId: hv && hv.kind === 'body' ? hv.id : null,
    hoverFam: hv && hv.kind === 'constellation' ? hv.family : null,
  }
  for (const r of recs.values()) { r.prevPlaced = r.placed; r.prevF = r.placed && r.showF; r.prevN = r.placed && r.showN; r.placed = false; r.covered = false }
  placed = []
  tried.clear(); wantedPending.clear(); pending = 0
  gridReset()

  /* 静态障碍圆：**视口内所有会画出来的星点 / 深空天体**，不只是亮星。
   * 原实现只把 mag ≤ 2 的 80 个亮星当障碍，mag 3–6 的 384 个星点可以被标签压住 ——
   * 这就是交接文档记的"部分公式标签压在星点上"。实测（check-cover2.mjs，用圆-矩形
   * 相交面积算 visFrac）：只避让亮星时，L=0 的 44 个公式标签里有 134 个把某个星点
   * **完全盖住**（visFrac = 100%），其中大量是 mag3/mag4（r = 3.3/2.6 px）的可见星点。
   * 改成全量避让后，配合下面的外推锚点，L=0 仍能放下 44 条且 visFrac ≥ 0.5 的对数为 0。
   * 代价：网格条目从 80 增到 464，但每帧只在视口内重建、且单条候选只查 9 个格子，
   * 实测 updateMs 仍在毫秒级（见 perf.md 的 updateMs 一栏）。 */
  /* 静态障碍圆：视口内的星点 / 深空天体。
   *
   * ⚠ 性能（2026-11-02）：知识库从 405 涨到 1208 节点后，这里每帧要
   *   对全部星点算 `P.sx/sy` + `bodyRadius` + `gridAdd`，实测 updateMs = 76 ms，
   *   把帧率压到 1.3 fps，进而饿死烘焙泵（吞吐 24 条/秒 vs 历史 83）。
   *
   *   优化：先用**世界坐标**做一次廉价剔除。视口在世界坐标里是个矩形，
   *   由 projector 反算四个边界；星点在世界里就落在盘面内，
   *   所以先比世界坐标能省掉 `sx/sy` 两次乘加与 `bodyRadius` 的分支判断。
   *   命中率低时收益最大（放大后视口只覆盖盘面一小块）。 */
  const wx0 = C.P.wx(-20), wx1 = C.P.wx(C.w + 20)
  const wy0 = C.P.wy(-20), wy1 = C.P.wy(C.h + 20)
  const wLoX = Math.min(wx0, wx1), wHiX = Math.max(wx0, wx1)
  const wLoY = Math.min(wy0, wy1), wHiY = Math.max(wy0, wy1)
  for (const s of atlasRef.stars) {
    if (s.x < wLoX || s.x > wHiX || s.y < wLoY || s.y > wHiY) continue
    addObstacle(s)
  }
  for (const d of atlasRef.dsos) {
    if (d.x < wLoX || d.x > wHiX || d.y < wLoY || d.y > wHiY) continue
    addObstacle(d)
  }
  const selB = C.sel ? atlasRef.bodies.get(C.sel) : null
  if (selB && selB.kind !== 'researcher' && selB.kind !== 'star' && selB.kind !== 'dso') addObstacle(selB)

  const inFocus = (id) => !C.focus || C.focus.ids.has(id)
  // ① 选中（强制）
  if (selB) {
    if (selB.kind === 'researcher') placeResearcher(selB, { forced: true, skipL: true, emph: true })
    else placeBody(selB, { forced: true, skipL: true, mustName: true, emph: true, prio: -200 })
  }
  // ② 悬停（不强制，跳过 L 阈值）
  if (C.hoverId) {
    const hb = atlasRef.bodies.get(C.hoverId)
    if (hb && hb.kind === 'researcher') placeResearcher(hb, { skipL: true, mul: 1 })
    else if (hb) placeBody(hb, { skipL: true, mustName: true, prio: -100 })
  }
  // ③ 星座名
  for (const rg of regionOrder) placeConst(rg)
  // ④ 焦点邻居前 24（不论 L）+ 研究者名字
  if (C.focus) {
    for (const e of C.focus.edges.slice(0, FOCUS_NB)) {
      const nb = atlasRef.bodies.get(e.other)
      if (!nb) continue
      if (nb.kind === 'researcher') placeResearcher(nb, { skipL: true })
      else placeBody(nb, { skipL: true, mustName: true, prio: -60 })
    }
  }
  for (const rb of resOrder) placeResearcher(rb, { mul: inFocus(rb.id) ? 1 : DIM.researcher })
  // ⑤ 搜索命中前 12（不论 L）
  const hits = f.searchHits || []
  for (let i = 0; i < hits.length && i < SEARCH_N; i++) {
    const hb = atlasRef.bodies.get(hits[i])
    if (!hb) continue
    const mul = inFocus(hb.id) ? 1 : SEARCH_ALPHA
    if (hb.kind === 'researcher') placeResearcher(hb, { skipL: true, mul })
    else placeBody(hb, { skipL: true, mul, prio: -40 })
  }
  // ⑥ 其余（选中时跳过：压暗 = 其它标签隐藏）
  if (!C.sel) {
    /* ── 单一轮放置：完全由 labelL 阈值决定，不再有"补位档" ──
     *
     * 2026-11-01 重构（用户报告"缩小后公式反而显示出来"的最终修法）：
     *
     * 原设计有两套机制在打架：
     *   · 语义缩放：`okF = C.L >= b.labelL`，L 越大显示的越多（正确）；
     *   · 总览补位：L < 0.2 时用 `skipL: true` **绕过**上面的阈值，强行
     *     塞入越级公式凑到 40 条（这本身就是对语义缩放的破坏）。
     *
     * 两套机制叠加的结果是矛盾的：
     *     缩小到 L=-1.2 → 补位仍生效 → 34 个公式（该消失的没消失）
     *     L=0（总览）   → 30 个
     *     L=0.25        → 补位窗口关闭 → 掉到 10 个（该增多的反而减少）
     *     L=0.8         → 16 个
     * 用户看到的就是"缩小了反而显示公式"，而且越放大越少。
     *
     * 修法：**删掉补位机制**，只保留语义缩放这一条规则。
     * 总览要有足够公式，就把它做进 MAG_LABEL_L 的第一档（constants.js 已改为
     * 等间距档位：-0.3 / 0.25 / 0.8 / 1.35 / 1.9 / 2.45），
     * 让"每一档都在该出现的时候自然出现"，而不是靠越级硬塞。
     *
     * 于是公式数随 L **单调不减**：这是语义缩放唯一正确的行为。
     */
    for (const b of bodyOrder) {
      if (tried.has(b.id)) continue
      placeBody(b, {})
    }
  }

  // 未放置（淡出中）的标签：跟随 body 移动；被本帧新标签覆盖的 3 倍速淡出
  for (const r of recs.values()) {
    if (r.placed || r.alpha <= 0) continue
    if (r.kind === 'formula') {
      const bx = C.P.sx(r.body.x), by = C.P.sy(r.body.y)
      r.x = bx + r.ox; r.y = by + r.oy
      r.shape = { t: 'r', x: r.x, y: r.y, w: r.w, h: r.h }
    } else if (r.kind === 'const') {
      const g = r.geom, cx = C.P.sx(r.region.labelX), cy = C.P.sy(r.region.labelY)
      r.x = cx - g.w / 2; r.y = cy - g.h / 2
      r.shape = { t: 'r', x: r.x, y: r.y, w: r.w, h: r.h }
    } else {
      r.geom = resGeom(r.body); r.shape = r.geom.shape
      const bb = shapeBox(r.shape); r.x = bb.x; r.y = bb.y; r.w = bb.w; r.h = bb.h
    }
    r.covered = gridHits(r.shape, null, false) > 0
  }

  // 渐隐渐现
  let anim = false
  const dt = Math.max(0, Math.min(100, f.dt || 16))
  for (const [k, r] of recs) {
    const target = r.placed ? 1 : 0
    if (f.reducedMotion) { r.alpha = target; r.nA = r.placed && r.showN ? 1 : 0 }
    else {
      if (r.alpha < target) r.alpha = Math.min(1, r.alpha + dt / FADE_IN_MS)
      else if (r.alpha > target) r.alpha = Math.max(0, r.alpha - dt / FADE_OUT_MS * (r.covered ? 3 : 1))
      // 中文名行单独淡入（公式已在、名字后到时不突兀）；隐藏时立即消失（盒子已经变了）
      const nt = r.placed && r.showN ? 1 : 0
      if (r.nA < nt) r.nA = Math.min(1, r.nA + dt / FADE_IN_MS)
      else if (r.nA > nt) r.nA = r.alpha > 0 && !r.placed ? r.nA : 0
      if (r.alpha !== target || r.nA !== nt) anim = true
    }
    if (!r.placed && r.alpha <= 0) recs.delete(k)
  }

  lastStats = null
  const ms = performance.now() - t0
  updTimes.push(ms); if (updTimes.length > 60) updTimes.shift()
  return anim || pending > 0
}

/* ───────── 绘制 ───────── */

/** 晕边文字：先 strokeText(labelHalo, 3px, round) 再 fillText */
function haloText(ctx, text, x, y, fill, haloAlpha = 1) {
  const a = ctx.globalAlpha
  ctx.globalAlpha = a * haloAlpha
  ctx.strokeStyle = COLOR.labelHalo
  ctx.strokeText(text, x, y)
  ctx.globalAlpha = a
  ctx.fillStyle = fill
  ctx.fillText(text, x, y)
}

function drawFormula(ctx, r, dpr) {
  const b = r.body
  const a = r.alpha * (r.mul ?? 1)
  if (a <= 0.004) return
  const isConj = b.kind === 'dso'
  if (r.showF && r.bake) {
    const bk = r.bake
    const fx = r.align === 'l' ? r.x : r.align === 'r' ? r.x + r.w - r.fw : r.x + (r.w - r.fw) / 2
    // 对齐到设备像素，位图 1:1 贴出，避免发虚
    const dx = Math.round((fx - bk.pad) * dpr) / dpr, dy = Math.round((r.y - bk.pad) * dpr) / dpr
    ctx.globalAlpha = a
    if (r.emph) {
      // 选中：不重新烘焙，叠一层柔光 + 一层 lighter 提亮（INK_HI_HEX 色调）
      ctx.save()
      ctx.shadowColor = isConj ? 'rgba(255,150,120,0.55)' : 'rgba(255,226,160,0.55)'
      ctx.shadowBlur = 10 * dpr
      ctx.drawImage(bk.canvas, dx, dy, bk.w, bk.h)
      ctx.restore()
      ctx.globalAlpha = a
      ctx.drawImage(bk.canvas, dx, dy, bk.w, bk.h)
      ctx.globalCompositeOperation = 'lighter'
      ctx.globalAlpha = a * 0.45
      ctx.drawImage(bk.canvas, dx, dy, bk.w, bk.h)
      ctx.globalCompositeOperation = 'source-over'
    } else ctx.drawImage(bk.canvas, dx, dy, bk.w, bk.h)
  }
  if (r.showN && r.nA > 0) {
    const nm = r.name
    const ny = r.showF && r.bake ? r.y + r.fh + NAME_GAP : r.y
    ctx.font = NAME_FONT
    ctx.textBaseline = 'middle'
    ctx.textAlign = r.align === 'l' ? 'left' : r.align === 'r' ? 'right' : 'center'
    const tx = r.align === 'l' ? r.x : r.align === 'r' ? r.x + r.w : r.x + r.w / 2
    ctx.globalAlpha = a * r.nA
    const fill = r.emph ? (isConj ? '#ff9a7e' : INK_HI_HEX) : isConj ? COLOR.conjName : COLOR.inkName
    haloText(ctx, nm.text, tx, ny + NAME_H / 2, fill)
  }
}

function drawSpaced(ctx, sp, cx, y, fill, haloAlpha) {
  const x0 = cx - sp.w / 2
  ctx.textAlign = 'center'
  const a = ctx.globalAlpha
  ctx.globalAlpha = a * haloAlpha
  ctx.strokeStyle = COLOR.labelHalo
  for (const c of sp.chars) ctx.strokeText(c.ch, x0 + c.dx, y)
  ctx.globalAlpha = a
  ctx.fillStyle = fill
  for (const c of sp.chars) ctx.fillText(c.ch, x0 + c.dx, y)
}

function drawConst(ctx, r) {
  const a = r.alpha * (r.mul ?? 1)
  if (a <= 0.004) return
  const g = r.geom, cx = r.x + r.w / 2
  ctx.globalAlpha = a
  ctx.textBaseline = 'middle'
  ctx.font = CONST_FONT
  // 悬停时提亮（星座名平时只有 40% 墨色，低调）
  drawSpaced(ctx, g.a, cx, r.y + g.h1 / 2, r.emph ? 'rgba(236,212,160,0.85)' : COLOR.constName, 0.55)
  if (g.h2) {
    ctx.font = LATIN_FONT
    drawSpaced(ctx, g.b, cx, r.y + g.h1 + CONST_GAP + g.h2 / 2, r.emph ? 'rgba(236,212,160,0.7)' : COLOR.constLatin, 0.45)
  }
}

/** 研究者名：逐字沿弧，切向旋转；上半圈沿 ra 递减排、下半圈沿 ra 递增排，都保持正立从左到右 */
function drawResearcher(ctx, r, dpr) {
  const a = r.alpha * (r.mul ?? 1)
  if (a <= 0.004) return
  const g = r.geom, t = g.t
  ctx.font = RES_FONT
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  const fill = r.emph ? COLOR.reticle : COLOR.researcher
  const pass = (stroke) => {
    let acc = 0
    for (const c of t.chars) {
      const off = (acc + c.cw / 2 - t.w / 2) / g.R        // 字心相对名字中心的弧角
      acc += c.cw
      const th = g.upper ? g.ra - off : g.ra + off
      const x = g.ox - g.R * Math.sin(th), y = g.oy - g.R * Math.cos(th)
      const rot = g.upper ? -th : Math.PI - th
      const cs = Math.cos(rot), sn = Math.sin(rot)
      ctx.setTransform(cs * dpr, sn * dpr, -sn * dpr, cs * dpr, x * dpr, y * dpr)
      if (stroke) ctx.strokeText(c.ch, 0, 0); else ctx.fillText(c.ch, 0, 0)
    }
  }
  ctx.globalAlpha = a * 0.8
  ctx.strokeStyle = COLOR.labelHalo
  pass(true)
  ctx.globalAlpha = a
  ctx.fillStyle = fill
  pass(false)
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
}

/** 画全部 alpha > 0 的标签：淡出中的先画，再按放置优先级倒序（高优先级压在最上），选中的最后 */
export function drawLabels(ctx, f) {
  if (!atlasRef) return
  const dpr = f.dpr || 1
  ctx.save()
  ctx.lineJoin = 'round'
  ctx.lineWidth = HALO_W
  const draw = (r) => {
    if (r.kind === 'formula') drawFormula(ctx, r, dpr)
    else if (r.kind === 'const') drawConst(ctx, r)
    else drawResearcher(ctx, r, dpr)
  }
  for (const r of recs.values()) if (!r.placed && r.alpha > 0) draw(r)
  for (let i = placed.length - 1; i >= 0; i--) draw(placed[i])
  ctx.restore()
  ctx.globalAlpha = 1
}

/** 命中已显示（alpha ≥ 0.5）的标签盒：公式 / 中文名 → body；星座名 → constellation；研究者名 → body */
export function hitLabel(sx, sy) {
  for (let i = 0; i < placed.length; i++) {
    const r = placed[i]
    if (r.alpha < 0.5 || (r.mul ?? 1) <= 0.05) continue
    const s = r.shape
    const hit = s.t === 'r' ? (sx >= s.x && sx <= s.x + s.w && sy >= s.y && sy <= s.y + s.h) : circleObb(sx, sy, 0.5, s)
    if (!hit) continue
    if (r.kind === 'const') return { kind: 'constellation', family: r.id }
    return { kind: 'body', id: r.id }
  }
  return null
}

function computeStats() {
  let visible = 0, formulas = 0, names = 0, consts = 0, res = 0
  for (const r of recs.values()) {
    if (r.alpha < 0.5) continue
    visible++
    if (r.kind === 'formula') { if (r.showF && r.bake) formulas++; if (r.showN) names++ }
    else if (r.kind === 'const') consts++
    else res++
  }
  // 独立复核：本帧已放置的标签盒两两求交（不外扩；研究者有向盒用 SAT）
  let overlapping = 0, forcedOverlaps = 0
  for (let i = 0; i < placed.length; i++) {
    const a = placed[i], ab = shapeBox(a.shape)
    for (let j = i + 1; j < placed.length; j++) {
      const b = placed[j]
      if (!rectsOverlap(ab, shapeBox(b.shape), 0)) continue
      if (!shapesOverlap(a.shape, b.shape, 0)) continue
      if (a.forced || b.forced) forcedOverlaps++
      else overlapping++
    }
  }
  const avg = updTimes.length ? updTimes.reduce((s, x) => s + x, 0) / updTimes.length : 0
  return {
    visibleLabels: visible, overlappingLabels: overlapping, forcedOverlaps,
    formulas, names, constellations: consts, researchers: res,
    pendingBakes: pending,
    // 附加（非契约字段，评审参考）
    placedLabels: placed.length,
    updateMs: Math.round((updTimes[updTimes.length - 1] || 0) * 100) / 100,
    updateMsAvg: Math.round(avg * 100) / 100,
    updateMsMax: Math.round(Math.max(0, ...updTimes) * 100) / 100,
  }
}

export function labelStats() {
  if (!lastStats) lastStats = computeStats()
  return lastStats
}

/** 调试 / 评审用：全部 alpha > 0 的标签盒（css px）；研究者另带有向盒 obb */
export function labelBoxes() {
  const out = []
  for (const r of recs.values()) {
    if (r.alpha <= 0 || !r.shape) continue
    const o = { kind: r.kind, id: r.id, x: r.x, y: r.y, w: r.w, h: r.h, alpha: Math.round(r.alpha * (r.mul ?? 1) * 1000) / 1000, placed: r.placed, forced: !!r.forced }
    if (r.kind === 'formula') { o.formula = !!(r.showF && r.bake); o.name = !!r.showN; o.anchor = r.anchor }
    if (r.shape.t === 'o') { const s = r.shape; o.obb = { cx: s.cx, cy: s.cy, ux: s.ux, uy: s.uy, hw: s.hw, hh: s.hh } }
    out.push(o)
  }
  return out
}
