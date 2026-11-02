/**
 * designs/manuscript/render.js — 【脚手架桩】模块 M3 的建造者会整体重写本文件。
 *
 * 契约见 SPEC §6.3：Canvas 2D 渲染器。每帧整页重画（只画视口内的东西），
 * 语义缩放按"屏幕字号"逐项决定画法，并统计屏幕标签的可见数 / 重叠数。
 */
import { state, w2s, s2w, worldViewport } from './state.js'
import { PALETTE, LOD, TEX_EM, fontCss } from './constants.js'
import { getBitmap, pumpBakes, bitmapStats } from './formulas.js'
import { makeTextures, drawDesk, drawPage } from './paper.js'
import { inkEllipse } from './pencil.js'

let canvas = null, ctx = null, textures = null
let lastStats = { visibleLabels: 0, overlappingLabels: 0, drawnItems: 0, pendingVisible: 0, drawMs: 0, threads: 0, arcs: 0, links: 0, legibleFormulas: 0, bitmaps: null }

/** boot 时调用一次。 */
export function initRenderer(cnv) {
  canvas = cnv
  ctx = canvas.getContext('2d')
  textures = makeTextures()
}

/** canvas 尺寸变化时调用（CSS px + dpr）。 */
export function resizeRenderer(vw, vh, dpr) {
  canvas.width = Math.round(vw * dpr); canvas.height = Math.round(vh * dpr)
  canvas.style.width = vw + 'px'; canvas.style.height = vh + 'px'
}

/** 画一帧（main 的 rAF 循环在 state.dirty 时调用）。返回本帧统计。 */
export function draw() {
  const t0 = performance.now()
  pumpBakes(6)
  const { vw, vh, dpr } = state
  const z = state.cam.z
  const L = state.layout
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  drawDesk(ctx, textures, vw, vh, state.cam)
  const vp = worldViewport()
  for (const p of L.pages) {
    if (!hit(p, vp)) continue
    const [sx, sy] = w2s(p.x, p.y)
    drawPage(ctx, textures, p, sx, sy, p.w * z, p.h * z, z)
  }
  ctx.fillStyle = PALETTE.ink
  for (const t of L.texts) {
    const px = t.size * z
    if (px < LOD.GREEK_PX) continue
    const [sx, sy] = w2s(t.x, t.y)
    ctx.font = fontCss(t.family, px, t.weight, t.style)
    ctx.textAlign = t.align
    ctx.fillStyle = t.color
    ctx.fillText(t.text, sx, sy)
  }
  let visible = 0, pendingVisible = 0
  for (const it of L.items) {
    if (!hit(it.box, vp)) continue
    const f = it.formula
    if (f) {
      const [sx, sy] = w2s(f.x, f.y)
      const em = f.scale * TEX_EM * z
      if (em < LOD.GREEK_PX) {
        ctx.fillStyle = PALETTE.ink; ctx.globalAlpha = LOD.GREEK_ALPHA
        ctx.fillRect(sx, sy + f.h * z * 0.35, f.w * z, Math.max(1, f.h * z * 0.3)); ctx.globalAlpha = 1
      } else {
        const bm = getBitmap(it.id, f.scale * z * state.dpr)
        if (bm) ctx.drawImage(bm.canvas, sx, sy, f.w * z, f.h * z)
        if (!bm || !bm.exact) pendingVisible++
        if (em >= LOD.LEGIBLE_PX) visible++
      }
    }
    const n = it.name
    if (n && n.size * z >= LOD.GREEK_PX) {
      const [sx, sy] = w2s(n.x, n.y)
      ctx.font = fontCss(n.family, n.size * z, n.weight, n.style)
      ctx.textAlign = n.align; ctx.fillStyle = n.color
      ctx.fillText(n.text, sx, sy)
    }
    if (it.id === state.selectedId) {
      const [sx, sy] = w2s(it.box.x, it.box.y)
      inkEllipse(ctx, sx, sy, it.box.w * z, it.box.h * z, 1)
    }
  }
  lastStats = { visibleLabels: visible, overlappingLabels: 0, drawnItems: L.items.length, pendingVisible, drawMs: performance.now() - t0, threads: 0, arcs: 0, links: 0, legibleFormulas: visible, bitmaps: bitmapStats() }
  return lastStats
}

function hit(r, vp) { return r.x < vp.x + vp.w && r.x + r.w > vp.x && r.y < vp.y + vp.h && r.y + r.h > vp.y }

/** 屏幕坐标 → 命中的 Item（或 null）。桩：线性扫描。 */
export function pick(sx, sy) {
  const z = state.cam.z
  for (const it of state.layout.items) {
    const [x, y] = w2s(it.box.x, it.box.y)
    if (sx >= x - 3 && sx <= x + it.box.w * z + 3 && sy >= y - 3 && sy <= y + it.box.h * z + 3) return it
  }
  return null
}

/** 屏幕点 → 热区（卷首目录等），SPEC §6.3 */
export function pickHotspot(sx, sy) {
  const [wx, wy] = s2w(sx, sy)
  for (const h of state.layout.hotspots) {
    const r = h.rect
    if (wx >= r.x && wx <= r.x + r.w && wy >= r.y && wy <= r.y + r.h) return h
  }
  return null
}

/** 条目 box 的当前屏幕矩形 */
export function itemScreenRect(id) {
  const it = state.layout.byId.get(id)
  if (!it) return null
  const [x, y] = w2s(it.box.x, it.box.y)
  return { x, y, w: it.box.w * state.cam.z, h: it.box.h * state.cam.z }
}

/** 某节点当前是否以可读字号显示（ui 用来决定悬停时要不要弹提示）。 */
export function isLegible(id) {
  const it = state.layout.byId.get(id)
  if (!it) return false
  const em = it.formula ? it.formula.scale * TEX_EM * state.cam.z : (it.name ? it.name.size * state.cam.z : 0)
  return em >= LOD.LEGIBLE_PX
}

/** 最近一帧的统计 */
export function renderStats() { return lastStats }
