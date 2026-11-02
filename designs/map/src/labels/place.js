/**
 * designs/map/src/labels/place.js — 点标签的碰撞放置（SPEC §8.3）。
 *
 * 贪心 + 优先级：先放面状标签（国名/海名，active 的字框成为障碍），再把视口内的候选按 labelPriority
 * 降序逐个尝试 [模式序列] × [8 方位]，第一个不与任何障碍相交的框就接受并入网格。都不行 → 不标（符号照画）。
 * 障碍 = UI 浮层 + 视口边缘（框必须完全在内缩 4px 的视口里）+ symbolIsObstacle 的符号圆（自身除外）
 *      + active 面状字框 + 已放下的标签。
 * 防闪烁的滞回：上一帧放过的标签优先级 +0.5，且上一帧用的方位（同模式时）先试。
 *
 * 取舍：
 *  · 公式在上、名字在下的两行块整体垂直居中于符号（E/W），N/S 时贴在符号上/下方。
 *  · 岛屿是世界尺寸的陆地，放大后屏幕半径可达上百 px；标签若贴岛的外缘就会离岛很远。
 *    所以岛屿标签的"锚定半径"封顶 14px（贴着岛心标在岛上，海图惯例），而岛形本身仍是
 *    其它标签的障碍（按岛形最远点的半径算，不只是名义半径 r）。
 *  · 选中 / 邻居符号即使低 tier 也算障碍（它们在选中遮罩上是唯一清楚的符号，不能被字盖住）。
 */
import { LABEL_SIZE, HALO, FONTS } from '../constants.js'
import { labelModes, labelPriority, symbolIsObstacle, symbolRadius, truncName } from '../rules.js'
import { createGrid, circleRect, rectsOverlap } from './grid.js'
import { layoutAreas } from './area.js'

const EDGE = 4                  // 视口边缘内缩
const PLATE_PAD = 6             // 选中底板内边距
const SELECT_SCALE = 1.15       // 选中公式放大
const ISLAND_ANCHOR_R = 14      // 岛屿标签的锚定半径上限（px）
const VIEW_MARGIN = 30          // 符号障碍：视口外扩
const ANCHORS = ['E', 'W', 'NE', 'SE', 'NW', 'SW', 'N', 'S']

/** 名字字号 / 字重 / 字体串 */
export function nameStyle(place) {
  if (place.kind === 'port') return { px: LABEL_SIZE.portNamePx, font: `italic 500 ${LABEL_SIZE.portNamePx}px ${FONTS.port}` }
  if (place.kind === 'island') {
    const px = LABEL_SIZE.islandNamePx[Math.max(0, place.tier - 1)] ?? 11
    return { px, font: `${place.tier <= 1 ? 600 : 500} ${px}px ${FONTS.city}` }
  }
  const px = LABEL_SIZE.namePx[place.tier] ?? 10.5
  return { px, font: `${LABEL_SIZE.nameWeight[place.tier] ?? 400} ${px}px ${FONTS.city}` }
}
export function nameText(place) {
  const t = truncName(place.node && place.node.name)
  return place.kind === 'island' && place.status === 'disproved' ? t + ' (E.D.)' : t
}

/**
 * @param world
 * @param baker createBaker() 的结果（get(id) → 已烘焙条目或 null）
 * @param measure (font, text) → width（带缓存）
 */
export function createPlacer(world, baker, measure) {
  const grid = createGrid()
  /** id → {anchor, mode, t0}：上一帧放置结果（滞回 + 淡入起点） */
  let mem = new Map()

  // 每个 place 的静态信息（名字、字体、岛形外径）只算一次
  const info = new Map()
  for (const p of world.places) {
    const st = nameStyle(p)
    let ringR = p.r || 0
    if (p.kind === 'island' && p.ring) {
      for (let i = 0; i < p.ring.length; i += 2) ringR = Math.max(ringR, Math.hypot(p.ring[i] - p.x, p.ring[i + 1] - p.y))
    }
    info.set(p.id, { text: nameText(p), font: st.font, px: st.px, nameW: -1, ringR })
  }
  function nameWidth(p) {
    const inf = info.get(p.id)
    if (inf.nameW < 0) inf.nameW = measure(inf.font, inf.text)
    return inf.nameW
  }

  /**
   * 计算某模式下标签块的尺寸与内部排版（相对框左上角）。
   * 返回 null 表示该模式不可用（公式未烘焙/失败/过宽）。
   */
  function blockOf(p, mode, selected) {
    const inf = info.get(p.id)
    const nw = nameWidth(p) + HALO.width
    const nh = inf.px * 1.25
    const pad = selected ? PLATE_PAD : 0
    if (mode === 'name') {
      return { w: nw + 2 * pad, h: nh + 2 * pad, pad, nw, nh, fe: null, fw: 0, fh: 0, k: 1 }
    }
    const e = baker.get(p.id)
    if (!e) return null
    const k = selected ? SELECT_SCALE : 1
    const fw = e.bw * k, fh = e.bh * k
    const nh2 = inf.px * 1.2
    const w = Math.max(fw, nw) + 2 * pad
    const h = fh + LABEL_SIZE.lineGap + nh2 + 2 * pad
    return { w, h, pad, nw, nh: nh2, fe: e, fw, fh, k }
  }

  /** 方位 → 框左上角（sx,sy 为符号中心，r 为锚定半径） */
  function boxAt(anchor, sx, sy, r, w, h) {
    const g = LABEL_SIZE.gap
    const d = r * 0.7 + g
    switch (anchor) {
      case 'E': return { x: sx + r + g, y: sy - h / 2, w, h }
      case 'W': return { x: sx - r - g - w, y: sy - h / 2, w, h }
      case 'N': return { x: sx - w / 2, y: sy - r - g - h, w, h }
      case 'S': return { x: sx - w / 2, y: sy + r + g, w, h }
      case 'NE': return { x: sx + d, y: sy - d - h, w, h }
      case 'SE': return { x: sx + d, y: sy + d, w, h }
      case 'NW': return { x: sx - d - w, y: sy - d - h, w, h }
      case 'SW': return { x: sx - d - w, y: sy + d, w, h }
    }
    return null
  }

  function place(frame) {
    const t0 = performance.now()
    const { level, size, view } = frame
    const W = size.w, H = size.h
    grid.reset(W, H)
    for (const r of frame.uiRects || []) grid.addRect(r)

    // 1) 符号障碍 + 候选
    const sel = frame.selectedId, nb = frame.neighbours, hits = frame.hits, hov = frame.hoverId
    const hasHits = hits && hits.size > 0
    const cands = []
    const major = []          // 国名要避开的显眼符号（tier≤1 城市、岛屿）：{sx, sy, r}
    for (const p of world.places) {
      const [sx, sy] = frame.toScreen(p.x, p.y)
      const isSel = p.id === sel, isNb = !!(nb && nb.has(p.id))
      const ringR = p.kind === 'island' ? Math.max(4, info.get(p.id).ringR * view.z) : 0
      const sr = p.kind === 'island' ? ringR : symbolRadius(p, level, view.z)
      if (sx < -VIEW_MARGIN - sr || sy < -VIEW_MARGIN - sr || sx > W + VIEW_MARGIN + sr || sy > H + VIEW_MARGIN + sr) continue
      if (symbolIsObstacle(p, level) || isSel || isNb) grid.addCircle(sx, sy, sr + 1, p.id, p.tier, isSel || isNb)
      if ((p.kind === 'city' && p.tier <= 1) || p.kind === 'island') major.push({ sx, sy, r: sr + 2 })
      if (sx < 0 || sy < 0 || sx > W || sy > H) continue
      const flags = { selected: isSel, neighbour: isNb, hit: hasHits && hits.has(p.id), hover: p.id === hov, wasPlaced: mem.has(p.id) }
      const modes = labelModes(p, level, flags)
      if (!modes.length) continue
      cands.push({ p, sx, sy, flags, modes, pri: labelPriority(p, flags),
        ar: p.kind === 'island' ? Math.min(ISLAND_ANCHOR_R, symbolRadius(p, level, view.z)) : symbolRadius(p, level, view.z) })
    }

    // 2) 面状标签（国名做法向平移搜索：避开显眼符号、留在本国、给首都公式留位）
    const accept = (c, lay) => {
      let bad = 0
      const all = lay.boxes.concat(lay.softBoxes)
      // 先用整条标签的外包框筛掉远处的符号（L0 时 major ~110 个，逐框全测太贵）
      let bx0 = Infinity, by0 = Infinity, bx1 = -Infinity, by1 = -Infinity
      for (const b of all) { if (b.x < bx0) bx0 = b.x; if (b.y < by0) by0 = b.y; if (b.x + b.w > bx1) bx1 = b.x + b.w; if (b.y + b.h > by1) by1 = b.y + b.h }
      for (const m of major) {
        if (m.sx + m.r < bx0 || m.sx - m.r > bx1 || m.sy + m.r < by0 || m.sy - m.r > by1) continue
        for (const b of all) if (circleRect(m.sx, m.sy, m.r, b)) bad += 1
      }
      for (const g of lay.glyphs) {
        const wx = (g.x - W / 2) / view.z + view.x, wy = (g.y - H / 2) / view.z + view.y
        if (world.countryAt(wx, wy) !== c.id) bad += 2
      }
      const cap = c.capitalId && world.placeById.get(c.capitalId)
      if (cap) {
        const [sx, sy] = frame.toScreen(cap.x, cap.y)
        const blk = blockOf(cap, 'formula', false) || blockOf(cap, 'name', false)
        if (blk && sx > 0 && sy > 0 && sx < W && sy < H) {
          const r = symbolRadius(cap, level, view.z)
          let ok = false
          for (const an of ANCHORS) {
            const b = boxAt(an, sx, sy, r, blk.w, blk.h)
            if (b.x < EDGE || b.y < EDGE || b.x + b.w > W - EDGE || b.y + b.h > H - EDGE) continue
            if (!all.some((q) => rectsOverlap(q, b))) { ok = true; break }
          }
          if (!ok) bad += 3
        }
      }
      return bad
    }
    const tA = performance.now()
    const areas = layoutAreas(world, frame, measure, accept)
    const areaMs = performance.now() - tA
    for (const a of areas) {
      if (!a.active) continue
      for (const b of a.boxes) grid.addRect(b, 'area')
      for (const b of a.softBoxes) grid.addRect(b, 'area')
    }
    cands.sort((a, b) => b.pri - a.pri)

    // 3) 贪心放置
    const items = []
    const nextMem = new Map()
    let nFormula = 0, nName = 0
    const x0 = EDGE, y0 = EDGE, x1 = W - EDGE, y1 = H - EDGE
    for (const c of cands) {
      const { p, sx, sy, flags } = c
      const prev = mem.get(p.id)
      let done = null
      // 宽松档：首都、选中、邻居的标签找不到严格位置时，允许压住最少个低等级、非强调的符号
      // （标签框之间仍严格互斥）。否则总览时首都公式会被周围大城市的点挡得无处可放。
      const relaxTier = flags.selected || flags.neighbour ? -1 : p.kind === 'city' && p.tier === 0 ? 0 : null
      for (const mode of c.modes) {
        const blk = blockOf(p, mode, flags.selected)
        if (!blk) continue
        const order = prev && prev.mode === mode ? [prev.anchor, ...ANCHORS.filter((a) => a !== prev.anchor)] : ANCHORS
        let soft = null
        for (const anchor of order) {
          const b = boxAt(anchor, sx, sy, c.ar, blk.w, blk.h)
          if (b.x < x0 || b.y < y0 || b.x + b.w > x1 || b.y + b.h > y1) continue
          if (!grid.hits(b, p.id)) { done = { mode, anchor, b, blk }; break }
          if (relaxTier !== null) {
            const n = grid.softCount(b, p.id, relaxTier)
            if (n >= 0 && (!soft || n < soft.n)) soft = { n, mode, anchor, b, blk }
          }
        }
        if (!done && soft) done = soft
        if (done) break
      }
      if (!done) continue
      grid.addRect(done.b, p.id)
      const t = prev ? prev.t0 : frame.now
      nextMem.set(p.id, { anchor: done.anchor, mode: done.mode, t0: t })
      const emphasis = flags.selected ? 'selected' : flags.neighbour ? 'neighbour' : flags.hit ? 'hit' : null
      const align = done.anchor === 'N' || done.anchor === 'S' ? 'center' : done.anchor.includes('W') ? 'right' : 'left'
      items.push({
        id: p.id, kind: p.kind, mode: done.mode, anchor: done.anchor, box: done.b,
        alpha: 1, emphasis, t0: t,
        // 以下为绘制用的私有字段
        place: p, sx, sy, align, blk: done.blk, text: info.get(p.id).text, font: info.get(p.id).font, hover: flags.hover,
      })
      if (done.mode === 'formula') nFormula++; else nName++
    }
    mem = nextMem
    return { items, areas, stats: { candidates: cands.length, placed: items.length, formula: nFormula, name: nName, areaMs, ms: performance.now() - t0 } }
  }

  return { place, info }
}
