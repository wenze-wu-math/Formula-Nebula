/**
 * designs/map/src/labels/grid.js — 屏幕空间的均匀网格索引（碰撞检测用）。
 *
 * 取舍：标签数量 ~500、障碍 ~1000，四叉树的常数开销反而更大；固定 64px 格的哈希网格
 * 每帧重建只是几个数组 push，查询只看框覆盖的 1–6 个格子。每帧 reset() 复用数组，避免 GC 抖动。
 * 障碍有两种形状：矩形（标签框、UI 浮层、字框）与圆（符号）。圆按真实圆-矩形距离判定，
 * 否则符号的外接方框会把贴着符号放的标签全部判成相交。
 * owner：符号圆记录所属 place id，查询时可排除"自己的符号"。
 */

export const CELL = 64

/** 两矩形是否相交（重叠宽高都 > eps；贴边不算） */
export function rectsOverlap(a, b, eps = 0) {
  return Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x) > eps &&
    Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y) > eps
}

/** 两矩形的交叠面积 */
export function overlapArea(a, b) {
  const w = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x)
  const h = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y)
  return w > 0 && h > 0 ? w * h : 0
}

/** 圆 (cx,cy,r) 与矩形是否相交（严格：相切不算） */
export function circleRect(cx, cy, r, b) {
  const nx = cx < b.x ? b.x : cx > b.x + b.w ? b.x + b.w : cx
  const ny = cy < b.y ? b.y : cy > b.y + b.h ? b.y + b.h : cy
  const dx = cx - nx, dy = cy - ny
  return dx * dx + dy * dy < r * r - 1e-6
}

export function createGrid() {
  let cols = 1, rows = 1
  /** @type {Array<Array<object>>} */
  let cells = []
  let stamp = 1

  function cellRange(x0, y0, x1, y1) {
    const c0 = Math.max(0, Math.floor(x0 / CELL)), c1 = Math.min(cols - 1, Math.floor(x1 / CELL))
    const r0 = Math.max(0, Math.floor(y0 / CELL)), r1 = Math.min(rows - 1, Math.floor(y1 / CELL))
    return [c0, c1, r0, r1]
  }
  function insert(o, x0, y0, x1, y1) {
    const [c0, c1, r0, r1] = cellRange(x0, y0, x1, y1)
    for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) cells[r * cols + c].push(o)
  }

  return {
    /** 每帧开始时调用：按视口尺寸重设格子并清空 */
    reset(w, h) {
      const nc = Math.max(1, Math.ceil(w / CELL)), nr = Math.max(1, Math.ceil(h / CELL))
      if (nc !== cols || nr !== rows || cells.length !== nc * nr) {
        cols = nc; rows = nr
        cells = Array.from({ length: cols * rows }, () => [])
      } else {
        for (const c of cells) c.length = 0
      }
    },
    /** 矩形障碍 {x,y,w,h}；owner 可选 */
    addRect(b, owner = null) {
      const o = { t: 0, x: b.x, y: b.y, w: b.w, h: b.h, owner, s: 0 }
      insert(o, b.x, b.y, b.x + b.w, b.y + b.h)
      return o
    },
    /** 圆形障碍（符号）。tier / emph 供 softCount 判断"可被高等级标签压住"的符号 */
    addCircle(cx, cy, r, owner = null, tier = 0, emph = false) {
      const o = { t: 1, cx, cy, r, owner, s: 0, tier, emph }
      insert(o, cx - r, cy - r, cx + r, cy + r)
      return o
    },
    /** 框 b 是否与任一障碍相交；ignoreOwner 的圆/矩形跳过 */
    hits(b, ignoreOwner = null) {
      const s = ++stamp
      const [c0, c1, r0, r1] = cellRange(b.x, b.y, b.x + b.w, b.y + b.h)
      for (let r = r0; r <= r1; r++) {
        for (let c = c0; c <= c1; c++) {
          const list = cells[r * cols + c]
          for (let i = 0; i < list.length; i++) {
            const o = list[i]
            if (o.s === s) continue
            o.s = s
            if (ignoreOwner !== null && o.owner === ignoreOwner) continue
            if (o.t === 0 ? rectsOverlap(o, b) : circleRect(o.cx, o.cy, o.r, b)) return true
          }
        }
      }
      return false
    },
    /**
     * 宽松判定：矩形障碍与"硬"符号（emph，或 tier ≤ labelTier）一律不可压 → 返回 -1；
     * 否则返回被压住的"软"符号个数（低等级、非强调的符号）。
     */
    softCount(b, ignoreOwner, labelTier) {
      const s = ++stamp
      let n = 0
      const [c0, c1, r0, r1] = cellRange(b.x, b.y, b.x + b.w, b.y + b.h)
      for (let r = r0; r <= r1; r++) {
        for (let c = c0; c <= c1; c++) {
          const list = cells[r * cols + c]
          for (let i = 0; i < list.length; i++) {
            const o = list[i]
            if (o.s === s) continue
            o.s = s
            if (ignoreOwner !== null && o.owner === ignoreOwner) continue
            if (o.t === 0) { if (rectsOverlap(o, b)) return -1; continue }
            if (!circleRect(o.cx, o.cy, o.r, b)) continue
            if (o.emph || o.tier <= labelTier) return -1
            n++
          }
        }
      }
      return n
    },
  }
}
