/**
 * designs/map/src/render/index.js — 画布渲染入口（M2，SPEC §7）。
 *
 * createRenderer(canvas, {world, graph, labeler}) → { resize, draw, pick }
 *
 * 图层（自下而上，SPEC §7.2）：
 *   世界层  1 海洋栅格 → 2 经纬网 → 3 等深线 → 4 国家填色 → 5 晕渲 → 6 国界内侧色带 → 7 国界 → 8 海岸线
 *           → 9 航线/海道 → 10 岛屿 → 11 陆路 → 12 栈桥
 *   屏幕层  13 labeler.drawAreas → 14 选中/搜索遮罩
 *           → 15 高亮路线（世界 transform）→ 16 符号 → 17 labeler.drawPoints
 * 取舍：
 *  · 构造时把全部世界几何缓存为 Path2D（basemap / roads / islands），每帧只换 transform 与 lineWidth。
 *  · 遮罩是整屏半透明纸色：比"逐层改 alpha"便宜，且自然地把底图、道路、国名一起压淡；
 *    强调对象（高亮路线、邻居符号、强调的岛）都画在遮罩之上。
 *  · 每帧开头 setTransform 重置 + 清掉 dash / alpha / composite，任何图层的状态泄漏都不会跨帧累积。
 */
import { buildBasemap, drawBasemap } from './basemap.js'
import { roadsFor, drawSeaRoutes, drawLandRoads, drawPiers, drawnRoadCounts } from './roads.js'
import { buildIslands, drawIslands, drawIslandEmphasis, pointInRing } from './islands.js'
import { buildSymbols, drawSymbols, screenRadius } from './symbols.js'
import { drawHighlight } from './highlight.js'
import { HIT_RADIUS } from '../constants.js'
import { symbolRadius } from '../rules.js'

const MASK_SELECT = 'rgba(251,248,241,.55)'
const MASK_SEARCH = 'rgba(251,248,241,.35)'

export function createRenderer(canvas, { world, _graph, labeler }) {
  const ctx = canvas.getContext('2d')
  let size = { w: 1, h: 1, dpr: 1 }

  const bm = buildBasemap(world)
  /** 道路几何缓存：跨族道路开关变化时才重建（默认不画跨族路，见 rules.roadVisible） */
  const roadCache = { sig: null, rb: null }
  const ib = buildIslands(world)
  const sb = buildSymbols(world, ib)
  /** 最近一帧实际画出的道路分组计数（stats 用，给"默认视图跨族道路条数"提供机器证据） */
  let lastRoadInfo = { showCross: false, crossCount: 0, drawn: {} }

  /** 当前帧的 transform 切换器（islands 的斜线需要在世界 / 屏幕之间来回切） */
  let cur = { view: { x: 0, y: 0, z: 1 } }
  const xf = {
    world() {
      const { dpr, w, h } = size, v = cur.view
      ctx.setTransform(dpr * v.z, 0, 0, dpr * v.z, dpr * (w / 2 - v.x * v.z), dpr * (h / 2 - v.y * v.z))
    },
    screen() { ctx.setTransform(size.dpr, 0, 0, size.dpr, 0, 0) },
  }

  function resetState() {
    ctx.globalAlpha = 1
    ctx.globalCompositeOperation = 'source-over'
    ctx.setLineDash([])
    ctx.lineDashOffset = 0
    ctx.lineCap = 'butt'
    ctx.lineJoin = 'round'
  }

  return {
    resize(w, h, dpr) {
      size = { w, h, dpr }
      canvas.width = Math.max(1, Math.round(w * dpr))
      canvas.height = Math.max(1, Math.round(h * dpr))
      canvas.style.width = w + 'px'
      canvas.style.height = h + 'px'
    },

    /** @returns {{animating: boolean}} */
    draw(frame, placement) {
      cur = frame
      const { level } = frame
      const z = frame.view.z
      const hits = frame.hits || new Set()
      const hasSel = !!frame.selectedId
      const hasSearch = !hasSel && hits.size > 0
      let animating = false

      // 若 size 尚未通过 resize 同步（M5 先 makeFrame 后 resize 的极端情况），以 frame.size 为准
      if (frame.size && (frame.size.w !== size.w || frame.size.h !== size.h)) size = { ...size, w: frame.size.w, h: frame.size.h }

      resetState()
      xf.screen()
      ctx.clearRect(0, 0, size.w, size.h)

      // ── 世界层 1–12 ──
      const roadOpt = { showCross: !!(frame.roadOptions && frame.roadOptions.showCross) }
      const rb = roadsFor(world, roadOpt, roadCache)
      const drawn = drawnRoadCounts(rb, level, roadOpt)
      lastRoadInfo = {
        showCross: roadOpt.showCross,
        /** 真正画出的跨族道路条数（默认视图必须为 0） */
        crossCount: (drawn.crossway || 0) + (drawn.crossroad || 0),
        /** 构建进 Path2D 的跨族道路条数（开关打开时 = min(N, 全部)；关闭时 0） */
        crossBuilt: (rb.groups.get('crossway')?.count || 0) + (rb.groups.get('crossroad')?.count || 0),
        drawn,
      }
      xf.world()
      drawBasemap(ctx, bm, world, z, frame.visibleWorld, frame.now || Date.now())
      drawSeaRoutes(ctx, rb, level, z, roadOpt)
      drawIslands(ctx, ib, xf, frame)
      drawLandRoads(ctx, rb, level, z, roadOpt)
      drawPiers(ctx, rb, level, z)
      resetState()

      // ── 13 国名 / 海名 ──
      xf.screen()
      if (placement) labeler.drawAreas(ctx, placement, frame)
      resetState()
      xf.screen()

      // ── 14 遮罩 ──
      if (hasSel || hasSearch) {
        ctx.fillStyle = hasSel ? MASK_SELECT : MASK_SEARCH
        ctx.fillRect(0, 0, size.w, size.h)
        // 强调的岛在遮罩之上重画（否则选中的猜想岛本身会被压淡）
        const ids = []
        for (const it of ib.list) {
          const id = it.p.id
          if (id === frame.selectedId || id === frame.hoverId || (hasSel && frame.neighbours?.has(id)) || (hasSearch && hits.has(id))) ids.push(id)
        }
        if (ids.length) drawIslandEmphasis(ctx, ib, xf, frame, ids, frame.hoverId)
      } else if (frame.hoverId && ib.byId.has(frame.hoverId)) {
        drawIslandEmphasis(ctx, ib, xf, frame, [frame.hoverId], frame.hoverId)
      }

      // ── 15 高亮路线 ──
      if (hasSel) {
        xf.world()
        if (drawHighlight(ctx, world, frame)) animating = true
      }
      resetState()

      // ── 16 符号 ──
      xf.screen()
      if (drawSymbols(ctx, sb, frame)) animating = true
      resetState()

      // ── 17 点标签 ──
      xf.screen()
      if (placement) {
        const r = labeler.drawPoints(ctx, placement, frame)
        if (r && r.animating) animating = true
      }
      resetState()
      return { animating }
    },

    /** 点选 / 悬停命中（SPEC §7.4）：标签框 → 最近符号 → null */
    pick(sx, sy, frame, placement) {      if (placement) {
        const hit = labeler.hitTest(sx, sy, placement)
        if (hit) return hit
      }
      const { level } = frame
      const z = frame.view.z
      const [wx, wy] = [(sx - frame.size.w / 2) / z + frame.view.x, (sy - frame.size.h / 2) / z + frame.view.y]
      let best = null, bestScore = Infinity
      for (const p of world.places) {
        const [px, py] = frame.toScreen(p.x, p.y)
        if (px < -40 || py < -40 || px > frame.size.w + 40 || py > frame.size.h + 40) continue   // 只考虑画出来的
        const d = Math.hypot(px - sx, py - sy)
        let score
        if (p.kind === 'island') {
          const it = ib.byId.get(p.id)
          // 在岛形内 → 视作命中岛心附近（比相邻城市点优先）；否则要求离岛心 ≤ r·z + 4
          if (it && pointInRing(it.ring, wx, wy)) score = Math.min(d, 2)
          else if (d <= Math.max(screenRadius(sb, p, level, z), p.r * z) + 4) score = d - p.r * z
          else continue
        } else {
          if (d > Math.max(HIT_RADIUS, symbolRadius(p, level, z) + 3)) continue
          score = d
        }
        if (score < bestScore) { bestScore = score; best = p.id }
      }
      return best
    },

    /** 最近一帧实际画出的道路分组计数（stats().roads 用；跨族道路条数的机器证据） */
    roadInfo: () => lastRoadInfo,
  }
}
