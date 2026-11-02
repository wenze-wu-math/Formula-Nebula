/**
 * designs/map/src/labels/index.js — 标签系统入口（公式烘焙 + 碰撞放置 + 绘制，SPEC §8）。
 *
 * 分工：
 *   bake.js  公式 → 带光晕位图（优先集先烘 → ready；其余分批让出主线程）
 *   area.js  国名/海名逐字排版（沿 labelPath；国名做法向平移搜索避开首都与大城市）
 *   place.js 点标签贪心碰撞放置（优先级 × 模式降级 × 8 方位，64px 网格，滞回防闪烁）
 *   draw.js  绘制、命中、重叠统计
 *   grid.js  屏幕网格索引
 * 本文件只做组装：建 measureText 缓存，把各部分接成 SPEC §8.1 的 Labeler。
 */
import { createBaker } from './bake.js'
import { createPlacer } from './place.js'
import { drawAreas, drawPoints, hitTest, countOverlaps } from './draw.js'

/** measureText 缓存：(font, text) → width。没有 canvas（node）时按字符类别近似 */
function createMeasure() {
  let ctx = null
  try {
    if (typeof OffscreenCanvas !== 'undefined') ctx = new OffscreenCanvas(4, 4).getContext('2d')
    else if (typeof document !== 'undefined') ctx = document.createElement('canvas').getContext('2d')
  } catch { ctx = null }
  const cache = new Map()
  return function measure(font, text) {
    const key = font + '|' + text
    let w = cache.get(key)
    if (w !== undefined) return w
    if (ctx) {
      ctx.font = font
      w = ctx.measureText(text).width
    } else {
      const px = parseFloat((/([\d.]+)px/.exec(font) || [0, 12])[1])
      w = 0
      for (const ch of text) w += /[　-鿿＀-￯]/.test(ch) ? px : px * 0.56
    }
    cache.set(key, w)
    return w
  }
}

/**
 * @param world buildWorld() 结果
 * @param graph getGraph() 结果（目前只经 world.places[].node 使用）
 * @returns Labeler（SPEC §8.1）
 */
export function createLabeler(world, graph) {
  void graph
  const measure = createMeasure()
  const baker = createBaker(world)
  const placer = createPlacer(world, baker, measure)
  let last = null
  return {
    bake: (onProgress) => baker.bake(onProgress),
    ready: baker.ready,
    place(frame) { last = placer.place(frame); return last },
    drawAreas,
    drawPoints,
    hitTest,
    countOverlaps,
    /** 调试：烘焙进度与耗时（readyMs = 优先集，allMs = 全部） */
    get bakeStats() { return { done: baker.done, total: baker.total, ...baker.timing } },
    get lastCount() { return last ? last.items.length : 0 },
    /** 调试：某 id 的烘焙条目状态 */
    entry: (id) => { const e = baker.entries.get(id); return e ? { state: e.state, w: e.w, h: e.h, wrapped: !!e.wrapped } : null },
  }
}
