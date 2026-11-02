/**
 * render/symbols.js — 点符号（SPEC §7.2 第 16 层，屏幕 transform）。
 *
 * 首都：白底圆 + ink 外圈 + ink 五角星；大城市：白底圆 + 粗 ink 外圈 + 圆心点；
 * 城镇：ink 实心圆 + 白描边；村落：ink 实心圆（总览 alpha .5 → "人口密度"纹理）；
 * 港口：港口色实心圆 + 白色锚形（路径绘制，不依赖 emoji 字体）；岛屿：只画 mark（旗 / ×）。
 * 取舍：
 *  · 城镇 / 村落 ~350 个，按 (国家, tier) 合批，一组一次 fill（+ 一次白描边）。首都 / 大城市 / 港口数量少，逐个画。
 *  · "特殊"符号（选中 / 邻居 / 命中 / 悬停）不进合批，最后逐个画在最上层，保证不被别的点压住、不被减淡。
 *  · 半径一律来自 rules.symbolRadius，labels 的避让与 pick 用的是同一个数，三者不会错位。
 */
import { COUNTRY_COLORS, SYMBOL_STROKE, PORT, PULSE_MS, ISLAND_STATUS } from '../constants.js'
import { symbolRadius, symbolAlpha, symbolScale } from '../rules.js'

const TAU = Math.PI * 2
export const HIT_RING = '#d9a521'
export const SELECT_RING = '#d63a55'
const FLAG_COLOR = '#3d6a33'
const POLE_COLOR = '#2c3a26'

function inkOf(p) {
  if (p.kind === 'city') return (COUNTRY_COLORS[p.family] || COUNTRY_COLORS.modern).ink
  if (p.kind === 'port') return PORT.color
  return (ISLAND_STATUS[p.status] || ISLAND_STATUS.open).ink
}

function star(ctx, x, y, ro, ri) {
  ctx.beginPath()
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5
    const r = i % 2 ? ri : ro
    if (i) ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); else ctx.moveTo(x + Math.cos(a) * r, y + Math.sin(a) * r)
  }
  ctx.closePath()
}

/** 单个城市符号（屏幕坐标），增强版：首都=城堡、大城=塔楼、城镇=房屋、村落=小圆点 */
export function drawCity(ctx, tier, x, y, r, ink) {
  if (tier === 0) {
    // 首都：城堡造型（方形底 + 城垛 + 旗帜）
    drawCastle(ctx, x, y, r, ink)
  } else if (tier === 1) {
    // 大城市：塔楼造型（圆塔 + 窗）
    drawTower(ctx, x, y, r, ink)
  } else if (tier === 2) {
    // 城镇：房屋造型（方形 + 尖顶）
    drawHouse(ctx, x, y, r, ink)
  } else {
    // 村落：保持原简单圆点
    ctx.beginPath(); ctx.arc(x, y, r, 0, TAU)
    ctx.fillStyle = ink; ctx.fill()
  }
}

/** 城堡符号（首都）：矩形底座 + 城垛 */
function drawCastle(ctx, x, y, r, ink) {
  const w = r * 1.4, h = r * 1.3
  // 底座
  ctx.fillStyle = SYMBOL_STROKE
  ctx.fillRect(x - w / 2, y - h / 2, w, h)
  // 城墙色
  ctx.fillStyle = ink
  ctx.fillRect(x - w / 2 + 1.2, y - h / 2 + 1.2, w - 2.4, h - 2.4)
  // 城垛（顶部锯齿）
  ctx.fillStyle = SYMBOL_STROKE
  const notchW = w / 5
  for (let i = 0; i < 3; i++) {
    ctx.fillRect(x - w / 2 + i * notchW * 1.6 + notchW * 0.3, y - h / 2 - 2, notchW * 0.8, 2.5)
  }
  // 小旗
  ctx.beginPath()
  ctx.moveTo(x, y - h / 2 - 2)
  ctx.lineTo(x, y - h / 2 - r * 0.9)
  ctx.lineWidth = 0.8
  ctx.strokeStyle = ink
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(x + 0.3, y - h / 2 - r * 0.85)
  ctx.lineTo(x + r * 0.5, y - h / 2 - r * 0.68)
  ctx.lineTo(x + 0.3, y - h / 2 - r * 0.5)
  ctx.closePath()
  ctx.fillStyle = ink
  ctx.fill()
}

/** 塔楼符号（大城市）：圆形塔 + 窗口 */
function drawTower(ctx, x, y, r, ink) {
  // 塔身
  ctx.beginPath()
  ctx.arc(x, y, r, 0, TAU)
  ctx.fillStyle = SYMBOL_STROKE
  ctx.fill()
  ctx.lineWidth = 1.8
  ctx.strokeStyle = ink
  ctx.stroke()
  // 窗口（2个小矩形）
  ctx.fillStyle = SYMBOL_STROKE
  const winW = r * 0.25, winH = r * 0.35
  ctx.fillRect(x - winW / 2, y - r * 0.3, winW, winH)
  ctx.fillRect(x - winW / 2, y + r * 0.1, winW, winH * 0.6)
}

/** 房屋符号（城镇）：方形 + 三角顶 */
function drawHouse(ctx, x, y, r, ink) {
  const w = r * 1.3, h = r * 1.1
  // 屋身
  ctx.fillStyle = ink
  ctx.fillRect(x - w / 2, y - h / 4, w, h * 0.75)
  ctx.lineWidth = 1
  ctx.strokeStyle = SYMBOL_STROKE
  ctx.strokeRect(x - w / 2, y - h / 4, w, h * 0.75)
  // 屋顶（三角）
  ctx.beginPath()
  ctx.moveTo(x - w / 2 - 1, y - h / 4)
  ctx.lineTo(x, y - h / 2 - r * 0.4)
  ctx.lineTo(x + w / 2 + 1, y - h / 4)
  ctx.closePath()
  ctx.fillStyle = '#6b6255'
  ctx.fill()
  ctx.strokeStyle = SYMBOL_STROKE
  ctx.stroke()
}

/** 港口：实心圆 + 白色锚（环、柄、横杆、弧形锚臂） */
export function drawPort(ctx, x, y, r) {
  ctx.beginPath(); ctx.arc(x, y, r, 0, TAU)
  ctx.fillStyle = PORT.color; ctx.fill()
  ctx.lineWidth = 1; ctx.strokeStyle = SYMBOL_STROKE; ctx.stroke()
  const u = r * 0.8
  ctx.beginPath()
  ctx.moveTo(x + 0.17 * u, y - 0.62 * u); ctx.arc(x, y - 0.62 * u, 0.17 * u, 0, TAU)   // 锚环
  ctx.moveTo(x, y - 0.45 * u); ctx.lineTo(x, y + 0.62 * u)                              // 锚柄
  ctx.moveTo(x - 0.34 * u, y - 0.24 * u); ctx.lineTo(x + 0.34 * u, y - 0.24 * u)        // 横杆
  ctx.moveTo(x + Math.cos(0.12 * Math.PI) * 0.6 * u, y + 0.04 * u + Math.sin(0.12 * Math.PI) * 0.6 * u)
  ctx.arc(x, y + 0.04 * u, 0.6 * u, 0.12 * Math.PI, 0.88 * Math.PI)                   // 锚臂
  ctx.lineWidth = Math.max(0.85, r * 0.19)
  ctx.lineCap = 'round'
  ctx.strokeStyle = SYMBOL_STROKE
  ctx.stroke()
}

/** 已证明岛屿的小旗（旗杆 9px，k = symbolScale） */
export function drawFlag(ctx, x, y, k = 1) {
  const h = 9 * k, top = y - h * 0.6, bot = y + h * 0.4
  ctx.beginPath(); ctx.moveTo(x, bot); ctx.lineTo(x, top)
  ctx.lineWidth = 1.3; ctx.lineCap = 'round'; ctx.strokeStyle = POLE_COLOR; ctx.stroke()
  ctx.beginPath(); ctx.moveTo(x + 0.4, top); ctx.lineTo(x + 6.5 * k, top + 2.2 * k); ctx.lineTo(x + 0.4, top + 4.4 * k); ctx.closePath()
  ctx.fillStyle = FLAG_COLOR; ctx.fill()
}

/** 幻岛的 ×（E.D.） */
export function drawCross(ctx, x, y, k = 1, ink = ISLAND_STATUS.disproved.ink) {
  const a = 3.6 * k
  ctx.beginPath()
  ctx.moveTo(x - a, y - a); ctx.lineTo(x + a, y + a)
  ctx.moveTo(x + a, y - a); ctx.lineTo(x - a, y + a)
  ctx.lineCap = 'round'; ctx.lineWidth = 1.9; ctx.strokeStyle = ink; ctx.stroke()
}

function ring(ctx, x, y, r, w, color, alpha = 1) {
  ctx.globalAlpha = alpha
  ctx.beginPath(); ctx.arc(x, y, r, 0, TAU)
  ctx.lineWidth = w; ctx.strokeStyle = color; ctx.stroke()
  ctx.globalAlpha = 1
}

export function buildSymbols(world, ib) {
  const cities = [], ports = [], islands = []
  for (const p of world.places) {
    if (p.kind === 'city') cities.push(p)
    else if (p.kind === 'port') ports.push(p)
    else islands.push(p)
  }
  // 岛屿的屏幕外接半径（ring 离岛心最远的点，wu），选中圈 / 命中圈 / pick 用
  const islandRMax = new Map()
  for (const it of ib.list) {
    let m = it.p.r || 0
    for (let i = 0; i < it.ring.length; i += 2) m = Math.max(m, Math.hypot(it.ring[i] - it.p.x, it.ring[i + 1] - it.p.y))
    islandRMax.set(it.p.id, m)
  }
  const families = [...new Set(cities.map((p) => p.family))]
  return { cities, ports, islands, islandRMax, families }
}

/** 选中 / 搜索状态下的减淡系数 */
export function dimOf(p, frame, hasSel, hasSearch) {
  if (hasSel) return p.id === frame.selectedId || (frame.neighbours && frame.neighbours.has(p.id)) ? 1 : 0.35
  if (hasSearch) return frame.hits.has(p.id) ? 1 : 0.5
  return 1
}

/** 屏幕半径：岛屿用外接半径（比 symbolRadius 的名义 r 更贴合有机岛形） */
export function screenRadius(sb, p, level, z) {
  if (p.kind === 'island') return Math.max(4, (sb.islandRMax.get(p.id) || p.r) * z)
  return symbolRadius(p, level, z)
}

/**
 * 第 16 层。ctx 处于屏幕 transform。
 * @returns {boolean} animating（选中脉冲进行中）
 */
export function drawSymbols(ctx, sb, frame) {
  const { level, view } = frame
  const z = view.z
  /* 语义缩放比：拉远时符号跟着变小，避免全图糊成一片 */
  const sRatio = frame.zFit > 0 ? z / frame.zFit : 1
  const k = symbolScale(level, sRatio)
  const vw = frame.visibleWorld, m = 30 / z
  const vis = (p) => p.x >= vw.x0 - m && p.x <= vw.x1 + m && p.y >= vw.y0 - m && p.y <= vw.y1 + m
  const sel = frame.selectedId
  const hits = frame.hits || new Set()
  const hasSel = !!sel
  const hasSearch = !hasSel && hits.size > 0
  const isSpecial = (id) => id === sel || id === frame.hoverId || (hasSel && frame.neighbours && frame.neighbours.has(id)) || hits.has(id)
  const special = []
  ctx.lineJoin = 'round'

  // ── 岛屿记号（旗 / ×） ──
  for (const p of sb.islands) {
    if (!vis(p)) continue
    const mark = (ISLAND_STATUS[p.status] || ISLAND_STATUS.open).mark
    if (mark === 'none') { if (isSpecial(p.id)) special.push(p); continue }
    if (isSpecial(p.id)) { special.push(p); continue }
    const [sx, sy] = frame.toScreen(p.x, p.y)
    ctx.globalAlpha = dimOf(p, frame, hasSel, hasSearch)
    if (mark === 'flag') drawFlag(ctx, sx, sy, k); else drawCross(ctx, sx, sy, k)
  }
  ctx.globalAlpha = 1

  // ── 村落、城镇：按 (国家, tier) 合批 ──
  for (const tier of [3, 2]) {
    for (const fam of sb.families) {
      const ink = COUNTRY_COLORS[fam]?.ink || '#555'
      let n = 0, alpha = 1
      ctx.beginPath()
      for (const p of sb.cities) {
        if (p.tier !== tier || p.family !== fam || !vis(p)) continue
        if (isSpecial(p.id)) { special.push(p); continue }
        const [sx, sy] = frame.toScreen(p.x, p.y)
        const r = symbolRadius(p, level, z)
        ctx.moveTo(sx + r, sy); ctx.arc(sx, sy, r, 0, TAU)
        alpha = symbolAlpha(p, level) * dimOf(p, frame, hasSel, hasSearch)
        n++
      }
      if (!n) continue
      ctx.globalAlpha = alpha
      ctx.fillStyle = ink; ctx.fill()
      if (tier === 2) { ctx.lineWidth = 1; ctx.strokeStyle = SYMBOL_STROKE; ctx.stroke() }
    }
  }
  ctx.globalAlpha = 1

  // ── 大城市、首都、港口：逐个 ──
  for (const tier of [1, 0]) {
    for (const p of sb.cities) {
      if (p.tier !== tier || !vis(p)) continue
      if (isSpecial(p.id)) { special.push(p); continue }
      const [sx, sy] = frame.toScreen(p.x, p.y)
      ctx.globalAlpha = symbolAlpha(p, level) * dimOf(p, frame, hasSel, hasSearch)
      drawCity(ctx, tier, sx, sy, symbolRadius(p, level, z), inkOf(p))
    }
  }
  for (const p of sb.ports) {
    if (!vis(p)) continue
    if (isSpecial(p.id)) { special.push(p); continue }
    const [sx, sy] = frame.toScreen(p.x, p.y)
    ctx.globalAlpha = dimOf(p, frame, hasSel, hasSearch)
    drawPort(ctx, sx, sy, symbolRadius(p, level, z))
  }
  ctx.globalAlpha = 1

  // ── 特殊符号：邻居 / 命中 → 选中 → 悬停，依次在最上层 ──
  const rank = (p) => (p.id === frame.hoverId ? 3 : p.id === sel ? 2 : 1)
  special.sort((a, b) => rank(a) - rank(b) || a.tier - b.tier)
  let animating = false
  for (const p of special) {
    const [sx, sy] = frame.toScreen(p.x, p.y)
    const hov = p.id === frame.hoverId
    const dim = dimOf(p, frame, hasSel, hasSearch)
    let r = screenRadius(sb, p, level, z)
    if (p.kind !== 'island' && hov) r *= 1.25
    ctx.globalAlpha = dim
    if (p.kind === 'city') drawCity(ctx, p.tier, sx, sy, r, inkOf(p))
    else if (p.kind === 'port') drawPort(ctx, sx, sy, r)
    else {
      const mark = (ISLAND_STATUS[p.status] || ISLAND_STATUS.open).mark
      const kk = hov ? k * 1.25 : k
      if (mark === 'flag') drawFlag(ctx, sx, sy, kk); else if (mark === 'cross') drawCross(ctx, sx, sy, kk)
    }
    ctx.globalAlpha = 1
    if (hits.has(p.id)) ring(ctx, sx, sy, r + 5, 2, HIT_RING, hasSel && dim < 1 ? 0.5 : 1)
    if (p.id === sel) {
      ring(ctx, sx, sy, r + 6, 2.5, SELECT_RING)
      const dt = frame.now - (frame.selectT0 || 0)
      if (frame.selectT0 && dt >= 0 && dt < PULSE_MS) {
        const q = dt / PULSE_MS
        const e = 1 - Math.pow(1 - q, 2)
        ring(ctx, sx, sy, r + 4 + 24 * e, 2, SELECT_RING, 1 - q)
        animating = true
      }
    }
  }
  ctx.lineCap = 'butt'
  return animating
}
