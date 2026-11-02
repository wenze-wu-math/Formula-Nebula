/**
 * designs/map/src/labels/draw.js — 标签绘制（SPEC §8.4）。ctx 进入时已是屏幕层 transform（dpr, 0, 0, dpr, 0, 0）。
 *
 * 取舍：
 *  · 面状标签逐字 save/translate/rotate；先把整条的光晕描完再统一填字，避免后一个字的光晕压住前一个字。
 *  · 公式位图按设备像素对齐贴图（坐标取整到 1/dpr），烘焙 dpr 与当前一致时 1:1 采样，没有插值模糊。
 *    选中放大 ×1.15 时直接放大已有位图（SPEC 允许轻微模糊）。
 *  · 淡入：每个标签记首次出现时刻 t0，alpha = (now - t0) / LABEL_FADE_MS；有未淡完的标签返回 animating，
 *    同时 invalidate() 一次——这样即使渲染器没把 animating 并入循环，淡入也不会停在半透明。
 */
import { COUNTRY_COLORS, ISLAND_STATUS, OCEAN, PORT, HALO, LABEL_FADE_MS, LABEL_SIZE } from '../constants.js'
import { invalidate } from '../state.js'

const SEL_DIM = 0.4
const HIT_DIM = 0.55
const AREA_SEL_DIM = 0.5

function inkOf(p) {
  if (p.kind === 'city') return COUNTRY_COLORS[p.family]?.ink || '#333'
  if (p.kind === 'island') return (ISLAND_STATUS[p.status] || ISLAND_STATUS.open).ink
  return PORT.ink
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

function glyphRun(ctx, list, mode, dpr) {
  for (const g of list) {
    if (g.ch === ' ') continue
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.translate(g.x, g.y)
    if (g.angle) ctx.rotate(g.angle)
    if (mode === 'stroke') ctx.strokeText(g.ch, 0, 0)
    else ctx.fillText(g.ch, 0, 0)
  }
}

/** 从当前 transform 读出 dpr（屏幕层 transform 的 a 分量） */
function dprOf(ctx) {
  const m = ctx.getTransform ? ctx.getTransform() : null
  return m && m.a > 0 ? m.a : 1
}

export function drawAreas(ctx, placement, frame) {
  if (!placement || !placement.areas || !placement.areas.length) return
  const dpr = dprOf(ctx)
  ctx.save()
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.lineJoin = 'round'
  const dim = frame.selectedId ? AREA_SEL_DIM : 1
  for (const a of placement.areas) {
    const isC = a.kind === 'country'
    const ink = isC ? COUNTRY_COLORS[a.id]?.ink || '#555' : OCEAN.seaLabel
    const halo = isC ? COUNTRY_COLORS[a.id]?.land || HALO.color : OCEAN.shallow
    ctx.globalAlpha = a.alpha * dim
    // 主名
    ctx.font = a.font
    ctx.strokeStyle = halo
    ctx.lineWidth = isC ? 4 : 3
    glyphRun(ctx, a.glyphs, 'stroke', dpr)
    ctx.fillStyle = ink
    glyphRun(ctx, a.glyphs, 'fill', dpr)
    // 拉丁副标题（更淡、更细的光晕）
    if (a.latin && a.latin.length) {
      ctx.font = a.lfont
      ctx.globalAlpha = a.alpha * dim * (isC ? 0.85 : 0.9)
      ctx.lineWidth = 2.5
      glyphRun(ctx, a.latin, 'stroke', dpr)
      glyphRun(ctx, a.latin, 'fill', dpr)
    }
  }
  ctx.restore()
}

/** @returns {{animating: boolean}} */
export function drawPoints(ctx, placement, frame) {
  if (!placement || !placement.items || !placement.items.length) return { animating: false }
  const dpr = dprOf(ctx)
  const snap = (v) => Math.round(v * dpr) / dpr
  const now = frame.now
  const hasSel = !!frame.selectedId
  const hasHits = !hasSel && frame.hits && frame.hits.size > 0
  let animating = false
  ctx.save()
  ctx.textBaseline = 'middle'
  ctx.lineJoin = 'round'
  ctx.miterLimit = 2
  ctx.imageSmoothingEnabled = true
  // 选中标签最后画（压在最上面）
  const list = placement.items
  for (let pass = 0; pass < 2; pass++) {
    for (const it of list) {
      const isSel = it.emphasis === 'selected'
      if ((pass === 1) !== isSel) continue
      const age = now - (it.t0 ?? now)
      let a = age >= LABEL_FADE_MS ? 1 : Math.max(0, age / LABEL_FADE_MS)
      if (a < 1) animating = true
      it.alpha = a
      if (hasSel && !it.emphasis) a *= SEL_DIM
      else if (hasHits && it.emphasis !== 'hit' && !it.hover) a *= HIT_DIM
      if (a <= 0.004) continue
      ctx.globalAlpha = a
      const { box, blk } = it
      const ink = inkOf(it.place)
      if (isSel) {
        ctx.save()
        ctx.shadowColor = 'rgba(0,0,0,.15)'; ctx.shadowBlur = 8; ctx.shadowOffsetY = 2
        roundRect(ctx, box.x + 0.5, box.y + 0.5, box.w - 1, box.h - 1, 6)
        ctx.fillStyle = '#ffffff'; ctx.fill()
        ctx.restore()
        roundRect(ctx, box.x + 0.5, box.y + 0.5, box.w - 1, box.h - 1, 6)
        ctx.lineWidth = 1; ctx.strokeStyle = ink; ctx.stroke()
      }
      const ix = box.x + blk.pad, iy = box.y + blk.pad, iw = box.w - 2 * blk.pad
      let nameY
      if (it.mode === 'formula' && blk.fe && blk.fe.bmp) {
        const fw = blk.fw, fh = blk.fh
        const fx = it.align === 'left' ? ix : it.align === 'right' ? ix + iw - fw : ix + (iw - fw) / 2
        if (blk.k === 1 && Math.abs(blk.fe.dpr - dpr) < 1e-3) {
          // 1:1 设备像素贴图
          ctx.drawImage(blk.fe.bmp, snap(fx), snap(iy), blk.fe.bmp.width / dpr, blk.fe.bmp.height / dpr)
        } else {
          ctx.drawImage(blk.fe.bmp, fx, iy, fw, fh)
        }
        nameY = iy + fh + LABEL_SIZE.lineGap + blk.nh / 2
      } else {
        nameY = iy + blk.nh / 2
      }
      // 名字：光晕描边 + 墨色填字。左/右对齐时让出光晕半宽
      const hw = HALO.width / 2
      ctx.font = it.font
      let tx
      if (it.align === 'left') { ctx.textAlign = 'left'; tx = ix + hw }
      else if (it.align === 'right') { ctx.textAlign = 'right'; tx = ix + iw - hw }
      else { ctx.textAlign = 'center'; tx = ix + iw / 2 }
      const ty = snap(nameY)
      ctx.strokeStyle = HALO.color
      ctx.lineWidth = HALO.width
      ctx.strokeText(it.text, tx, ty)
      ctx.fillStyle = ink
      ctx.fillText(it.text, tx, ty)
      if (it.emphasis === 'neighbour') {
        const tw = blk.nw - HALO.width
        const ux = it.align === 'left' ? tx : it.align === 'right' ? tx - tw : tx - tw / 2
        const uy = snap(nameY + blk.nh * 0.42) + 0.5
        ctx.fillStyle = ink
        ctx.fillRect(ux, uy - 0.5, tw, 1)
      }
    }
  }
  ctx.restore()
  if (animating) invalidate()
  return { animating }
}

/** 点在某标签框内 → id（后画的在上，倒序查） */
export function hitTest(sx, sy, placement) {
  const items = placement && placement.items
  if (!items) return null
  for (let i = items.length - 1; i >= 0; i--) {
    const b = items[i].box
    if (sx >= b.x && sx <= b.x + b.w && sy >= b.y && sy <= b.y + b.h) return items[i].id
  }
  return null
}

/** 屏幕上互相重叠（交叠 > 1px²）的活动标签框对数 —— 必须为 0 */
export function countOverlaps(placement) {
  if (!placement) return 0
  const boxes = []
  for (const it of placement.items || []) boxes.push(it.box)
  for (const a of placement.areas || []) if (a.active) for (const b of a.boxes) boxes.push(b)
  let n = 0
  for (let i = 0; i < boxes.length; i++) {
    const a = boxes[i]
    for (let j = i + 1; j < boxes.length; j++) {
      const b = boxes[j]
      const w = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x)
      if (w <= 0) continue
      const h = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y)
      if (h > 0 && w * h > 1) n++
    }
  }
  return n
}
