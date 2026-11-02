/**
 * designs/manuscript/geom.js — 矩形几何小工具（冻结文件，建造者只读）。
 *
 * 为什么单独成文件：layout 的自检（checkLayout）与 render 的屏幕重叠统计（stats().overlappingLabels）
 * 必须用**同一个**"文字行 → 外包矩形"的算法，否则两边对"重叠"的判断会不一致。SPEC §3.4。
 */

/** 文字行（TextRun，SPEC §4.2）在世界坐标下的外包矩形。y 是基线；汉字上伸约 0.86em、下伸约 0.24em。 */
export function runRect(run) {
  const w = run.w
  const x = run.align === 'center' ? run.x - w / 2 : run.align === 'right' ? run.x - w : run.x
  return { x, y: run.y - run.size * 0.86, w, h: run.size * 1.1 }
}

/** 两矩形是否相交（pad > 0 时把两者各外扩 pad 再判断；pad < 0 表示允许轻微贴边） */
export function rectsOverlap(a, b, pad = 0) {
  return a.x - pad < b.x + b.w + pad && a.x + a.w + pad > b.x - pad &&
    a.y - pad < b.y + b.h + pad && a.y + a.h + pad > b.y - pad
}

export function unionRect(a, b) {
  if (!a) return b ? { ...b } : null
  if (!b) return { ...a }
  const x = Math.min(a.x, b.x), y = Math.min(a.y, b.y)
  return { x, y, w: Math.max(a.x + a.w, b.x + b.w) - x, h: Math.max(a.y + a.h, b.y + b.h) - y }
}

export function inflate(r, d) { return { x: r.x - d, y: r.y - d, w: r.w + 2 * d, h: r.h + 2 * d } }

export function containsPt(r, x, y) { return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h }

/** 世界矩形 → 屏幕矩形（给定 w2s 函数与 zoom） */
export function toScreen(r, w2s, z) {
  const [x, y] = w2s(r.x, r.y)
  return { x, y, w: r.w * z, h: r.h * z }
}

/**
 * 统计一组矩形里两两相交的对数（均匀网格哈希，O(n) 期望）。
 * render 每帧对"本帧真正画成可读字的标签"的**屏幕矩形**调用一次；layout 自检对世界矩形调用。
 * shrink：比较前每个矩形各向内收缩的量（吸收字体度量的亚像素误差），默认 0.5。
 * @returns {{count:number, pairs:Array<[number,number]>}} pairs 最多返回 50 对（调试用）
 */
export function countOverlaps(rects, shrink = 0.5, cell = 64) {
  const grid = new Map()
  const pairs = []
  let count = 0
  const seen = new Set()
  rects.forEach((r0, i) => {
    const r = { x: r0.x + shrink, y: r0.y + shrink, w: r0.w - 2 * shrink, h: r0.h - 2 * shrink }
    if (r.w <= 0 || r.h <= 0) return
    const gx0 = Math.floor(r.x / cell), gx1 = Math.floor((r.x + r.w) / cell)
    const gy0 = Math.floor(r.y / cell), gy1 = Math.floor((r.y + r.h) / cell)
    for (let gx = gx0; gx <= gx1; gx++) for (let gy = gy0; gy <= gy1; gy++) {
      const k = gx * 73856093 ^ gy * 19349663
      let bucket = grid.get(k)
      if (!bucket) { bucket = []; grid.set(k, bucket) }
      for (const j of bucket) {
        const key = j * 100003 + i
        if (seen.has(key)) continue
        const o = rects[j]
        const s = { x: o.x + shrink, y: o.y + shrink, w: o.w - 2 * shrink, h: o.h - 2 * shrink }
        if (rectsOverlap(r, s)) { seen.add(key); count++; if (pairs.length < 50) pairs.push([j, i]) }
      }
      bucket.push(i)
    }
  })
  return { count, pairs }
}
