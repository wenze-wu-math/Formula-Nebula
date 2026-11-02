/**
 * designs/map/src/labels/area.js — 面状标签（国名、海名）的逐字排版（SPEC §8.3 第 3 步）。
 *
 * 国名：沿 country.labelPath（世界坐标折线，转屏幕后按弧长参数化）把 zh 逐字均匀排开，
 *   字号 = min(COUNTRY_LABEL.px[level], 路径长 / (字数·(1+tracking)))；每字旋转 = 路径切线角。
 *   取舍：0.55em 的大字距在 L0 会把字号压得很小（路径只有一百多 px），所以字号不足上限时
 *   字距可从 0.55em 逐步收到 0.25em 换字号——地图字"拉开字距"的味道保留，但优先读得清。
 *   拉丁副标题沿同一路径向下偏移 px·0.9，路径不够长时沿两端切线外延。
 * 海名：中心 + angle，中文一行、拉丁一行（小一号）在下方，均逐字成 glyph。
 *
 * 碰撞框：每个字一个旋转后的外接框（含光晕）。同一条标签内的相邻字框若因旋转而交叠，
 * 互相裁掉交叠部分（框只用于避让与重叠统计，裁掉的是字距里的空白，不影响观感）。
 * 国名的拉丁副标题框记在 softBoxes：作为点标签障碍，但不计入 countOverlaps（SPEC：拉丁"只画"）。
 */
import { COUNTRY_LABEL, SEA_LABEL, FONTS } from '../constants.js'
import { rectsOverlap } from './grid.js'

const MIN_COUNTRY_PX = 12
const COUNTRY_HALO = 4       // 国名光晕（land 色）宽
const SEA_HALO = 3
const LATIN_TRACK = 0.3

export const countryFont = (px) => `700 ${px.toFixed(1)}px ${FONTS.country}`
export const latinFont = (px) => `400 ${px.toFixed(1)}px ${FONTS.latin}`
export const seaFont = (px) => `italic 400 ${px.toFixed(1)}px ${FONTS.sea}`

/** 屏幕折线 → 弧长采样器 */
function polyline(pts) {
  const n = pts.length >> 1
  const cum = new Float64Array(n)
  for (let i = 1; i < n; i++) cum[i] = cum[i - 1] + Math.hypot(pts[2 * i] - pts[2 * i - 2], pts[2 * i + 1] - pts[2 * i - 1])
  const L = cum[n - 1]
  function at(t) {
    if (n < 2) return [pts[0], pts[1]]
    if (t <= 0) {
      const dx = pts[2] - pts[0], dy = pts[3] - pts[1], d = Math.hypot(dx, dy) || 1
      return [pts[0] + dx / d * t, pts[1] + dy / d * t]
    }
    if (t >= L) {
      const k = 2 * (n - 1), dx = pts[k] - pts[k - 2], dy = pts[k + 1] - pts[k - 1], d = Math.hypot(dx, dy) || 1
      return [pts[k] + dx / d * (t - L), pts[k + 1] + dy / d * (t - L)]
    }
    let i = 1
    while (i < n - 1 && cum[i] < t) i++
    const seg = cum[i] - cum[i - 1] || 1, u = (t - cum[i - 1]) / seg
    return [pts[2 * i - 2] + (pts[2 * i] - pts[2 * i - 2]) * u, pts[2 * i - 1] + (pts[2 * i + 1] - pts[2 * i - 1]) * u]
  }
  /** 切线角：中心差分（平滑后的折线在折点处不跳角） */
  function angle(t, d = 6) {
    // 外延段（t<0 或 t>L）沿用端点切线；否则两端夹紧后会反向，字被倒过来
    const tc = Math.min(L, Math.max(0, t))
    const a = at(Math.max(0, tc - d)), b = at(Math.min(L, tc + d))
    return Math.atan2(b[1] - a[1], b[0] - a[0])
  }
  return { L, at, angle }
}

/** 旋转字形的外接框（中心 cx,cy；字墨宽 w、高 h；外加光晕 halo） */
function glyphBox(cx, cy, w, h, ang, halo) {
  const c = Math.abs(Math.cos(ang)), s = Math.abs(Math.sin(ang))
  const hw = (w / 2) * c + (h / 2) * s + halo / 2
  const hh = (w / 2) * s + (h / 2) * c + halo / 2
  return { x: cx - hw, y: cy - hh, w: 2 * hw, h: 2 * hh }
}

/** 同一标签内的框两两裁掉交叠（沿交叠较小的轴各退一半） */
function untangle(boxes) {
  for (let i = 0; i < boxes.length; i++) {
    for (let j = i + 1; j < boxes.length; j++) {
      const a = boxes[i], b = boxes[j]
      if (!rectsOverlap(a, b)) continue
      const ox = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x)
      const oy = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y)
      const cut = (ox <= oy ? ox : oy) / 2 + 0.05
      if (ox <= oy) {
        if (a.x + a.w / 2 <= b.x + b.w / 2) { a.w -= cut; b.x += cut; b.w -= cut } else { b.w -= cut; a.x += cut; a.w -= cut }
      } else {
        if (a.y + a.h / 2 <= b.y + b.h / 2) { a.h -= cut; b.y += cut; b.h -= cut } else { b.h -= cut; a.y += cut; a.h -= cut }
      }
    }
  }
}

/**
 * @param world
 * @param frame
 * @param measure (font, text) → width
 * @param accept (country, layout{glyphs,boxes,latin,softBoxes}, shift) → 评分（0 = 理想；越大越差）。
 *               仅用于国名的法向平移搜索；水印级别（L2+）不调用。
 * @returns AreaLabel[]（含不画的已剔除）
 */
export function layoutAreas(world, frame, measure, accept = null) {
  const { level, size } = frame
  const out = []
  const inView = (x, y) => x >= 0 && y >= 0 && x <= size.w && y <= size.h
  const active = level <= 1

  // ── 国名：面积降序 ──
  const countries = [...world.countries].sort((a, b) => b.area - a.area)
  for (const c of countries) {
    const lp = c.labelPath
    if (!lp || lp.length < 4) continue
    const scr = new Float64Array(lp.length)
    for (let i = 0; i < lp.length; i += 2) { const s = frame.toScreen(lp[i], lp[i + 1]); scr[i] = s[0]; scr[i + 1] = s[1] }
    const path = polyline(scr)
    const mid = path.at(path.L / 2)
    if (!inView(mid[0], mid[1])) continue
    const chars = [...c.zh]
    const n = chars.length
    const maxPx = COUNTRY_LABEL.px[level]
    let track = COUNTRY_LABEL.tracking
    let px = Math.min(maxPx, path.L / (n * (1 + track)))
    // 字号不足上限时，字距可收窄到 0.25em 换取字号
    if (px < maxPx) {
      const tMin = 0.25
      const pxT = Math.min(maxPx, path.L / (n * (1 + tMin)))
      if (pxT > px) { px = pxT; track = Math.max(tMin, path.L / (n * px) - 1) }
    }
    if (px < MIN_COUNTRY_PX) continue
    const font = countryFont(px)
    const lpx = COUNTRY_LABEL.latinPx[level]
    const lfont = latinFont(lpx)
    const cw = chars.map((ch) => measure(font, ch))
    const lchars = [...c.latin]
    const lw = lchars.map((ch) => measure(lfont, ch))
    const ltot = lw.reduce((s, w) => s + w, 0) + LATIN_TRACK * lpx * (lchars.length - 1)
    const adv = px * (1 + track)
    const loff = px * 0.9          // 拉丁行中心相对国名基线的法向偏移（SPEC：px·0.9）

    /** 整条国名沿法向平移 shift px 后的排版 */
    const build = (shift) => {
      const glyphs = [], boxes = [], latin = [], softBoxes = []
      const t0 = path.L / 2 - (adv * (n - 1)) / 2
      for (let i = 0; i < n; i++) {
        const t = t0 + i * adv
        const [x0, y0] = path.at(t)
        const ang = path.angle(t)
        const x = x0 - Math.sin(ang) * shift, y = y0 + Math.cos(ang) * shift
        glyphs.push({ ch: chars[i], x, y, angle: ang, px })
        boxes.push(glyphBox(x, y, cw[i], px * 0.92, ang, COUNTRY_HALO))
      }
      let tt = path.L / 2 - ltot / 2
      const off = shift + loff
      for (let i = 0; i < lchars.length; i++) {
        const t = tt + lw[i] / 2
        const [x, y] = path.at(t)
        const ang = path.angle(t)
        const gx = x - Math.sin(ang) * off, gy = y + Math.cos(ang) * off
        latin.push({ ch: lchars[i], x: gx, y: gy, angle: ang, px: lpx })
        if (lchars[i] !== ' ') softBoxes.push(glyphBox(gx, gy, lw[i], lpx * 0.75, ang, 2))
        tt += lw[i] + LATIN_TRACK * lpx
      }
      untangle(boxes)
      return { glyphs, boxes, latin, softBoxes }
    }
    // 法向平移搜索：0, -1, +1, -2, +2 …（单位 step），取 accept 评分最低者（同分取更小位移）。
    // 目的：国名别压住首都/大城市符号，并给首都公式留出位置（SPEC 只给了一条基线，这里是本地补强）。
    let best = null
    const step = Math.max(8, px * 0.55)
    for (let k = 0; k <= 8; k++) {
      const shift = (k === 0 ? 0 : (k % 2 ? -1 : 1) * Math.ceil(k / 2)) * step
      const lay = build(shift)
      const bad = accept && active ? accept(c, lay, shift) : 0
      if (!best || bad < best.bad) best = { ...lay, bad, shift }
      if (bad === 0) break
    }
    out.push({ kind: 'country', id: c.id, active, glyphs: best.glyphs, boxes: best.boxes, latin: best.latin, softBoxes: best.softBoxes,
      alpha: COUNTRY_LABEL.alpha[level], font, lfont, track, shift: best.shift })
  }

  // ── 海名 ──
  ;(world.seaLabels || []).forEach((sl, idx) => {
    const k = sl.small ? 0.75 : 1
    const px = SEA_LABEL.px[level] * k
    const lpx = Math.max(9, px * 0.62)
    const ang = sl.angle || 0
    const ca = Math.cos(ang), sa = Math.sin(ang)
    const [cx, cy] = frame.toScreen(sl.x, sl.y)
    if (!inView(cx, cy)) return
    const font = seaFont(px), lfont = seaFont(lpx)
    const glyphs = [], boxes = [], latin = []
    const lineGap = px * 0.62 + lpx * 0.55
    // 中文行（中心在 cy 上方 lineGap/2）
    const put = (str, f, p, trackEm, dy, arr, boxH, halo) => {
      const ch = [...str]
      const ws = ch.map((c) => measure(f, c))
      const tot = ws.reduce((s, w) => s + w, 0) + trackEm * p * (ch.length - 1)
      let u = -tot / 2
      for (let i = 0; i < ch.length; i++) {
        const t = u + ws[i] / 2
        const x = cx + ca * t - sa * dy, y = cy + sa * t + ca * dy
        arr.push({ ch: ch[i], x, y, angle: ang, px: p })
        if (ch[i] !== ' ') boxes.push(glyphBox(x, y, ws[i], p * boxH, ang, halo))
        u += ws[i] + trackEm * p
      }
    }
    put(sl.zh, font, px, SEA_LABEL.tracking, -lineGap / 2, glyphs, 0.92, SEA_HALO)
    if (sl.latin) put(sl.latin, lfont, lpx, LATIN_TRACK, lineGap / 2, latin, 0.75, 2)
    untangle(boxes)
    out.push({ kind: 'sea', id: idx, active: true, glyphs, boxes, latin, softBoxes: [], alpha: SEA_LABEL.alpha[level], font, lfont, small: !!sl.small })
  })

  // ── 面状标签之间互斥：后放的整条不画（active 的才参与；水印不互斥） ──
  const kept = []
  for (const a of out) {
    if (a.active) {
      const mine = a.boxes.concat(a.softBoxes)
      let bad = false
      for (const b of kept) {
        if (!b.active) continue
        const theirs = b.boxes.concat(b.softBoxes)
        outer: for (const p of mine) for (const q of theirs) if (rectsOverlap(p, q)) { bad = true; break outer }
        if (bad) break
      }
      if (bad) continue
    }
    kept.push(a)
  }
  return kept
}
