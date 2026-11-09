/**
 * designs/manuscript/render-links.js — 关联的三层画法（M3 私有，SPEC §6.3 第 3、4、7、8 步）。
 *
 *   全卷：章际丝线 threads（pencilSoft，宽随关联数，带纸色圆底的手写数字）
 *   章节：栏内铅笔弧 arcs（像诗的韵脚标记）
 *   选中：一跳关联全部用手绘铅笔线拉出，笔法 = LINK_STROKE[type]；arrow 方向恒为 source → target。
 * 所有手写小标签（丝线数字、关系名、屏幕外箭头的计数）都先用 fitsFree 检查不与本帧可读字相交再画，
 * 并登记为可读标签 —— overlappingLabels 因而对它们也保持 0。
 */
import { PALETTE, LINK_STROKE, THREADS_FADE, AMBIENT_FADE } from './constants.js'
import { pencilCurve, seedOf } from './pencil.js'
import { clamp, smoothstep, font, addLabel, fitsFree } from './render-text.js'

const _ARC_FROM_FORMULA = 52      // 弧区右缘 = 公式左缘 − (行号区 40 + 间距 12)，与 layout 的 Arc.x 一致

/* ───────── 3. 章际丝线 ───────── */
export function drawThreads(F, threads) {
  const out = []
  const a = 1 - smoothstep(THREADS_FADE[0], THREADS_FADE[1], F.z)
  if (!(a > 0.01) || !threads || !threads.length) return out
  const ctx = F.ctx, z = F.z
  let maxC = 1
  for (const t of threads) if (t.count > maxC) maxC = t.count
  const dim = F.sel ? 0.45 : 1
  for (const t of threads) {
    const x0 = t.x0 * z + F.tx, y0 = t.y0 * z + F.ty, x1 = t.x1 * z + F.tx, y1 = t.y1 * z + F.ty
    const cx = t.cx * z + F.tx, cy = t.cy * z + F.ty
    if (Math.max(x0, x1, cx) < -20 || Math.min(x0, x1, cx) > F.vw + 20 || Math.max(y0, y1, cy) < -20 || Math.min(y0, y1, cy) > F.vh + 20) continue
    ctx.globalAlpha = 1
    pencilCurve(ctx, x0, y0, cx, cy, x1, y1, seedOf('th' + t.from + '-' + t.to), {
      color: PALETTE.pencil, alpha: 0.42 * a * dim, width: 1 + 2.2 * (t.count / maxC), jitter: 1.1, style: 'solid',
    })
    F.threads++
    if (t.label && a > 0.35) out.push({ t, a: a * dim })
  }
  return out
}

/** 丝线数字：纸色圆底 + 手写数字；画在条目之后，避让本帧可读字 */
export function drawThreadLabels(F, list) {
  const ctx = F.ctx, z = F.z
  for (const { t, a } of list) {
    const fs = clamp(z * 90, 9, 13)
    const text = t.label.text
    ctx.font = font('hand', fs)
    const tw = ctx.measureText(text).width
    const r = Math.max(fs * 0.85, tw / 2 + fs * 0.45)
    const x = t.label.x * z + F.tx, y = t.label.y * z + F.ty
    const box = { x: x - r, y: y - r, w: 2 * r, h: 2 * r }
    if (!fitsFree(F, box)) continue
    ctx.globalAlpha = 0.92 * a
    ctx.fillStyle = PALETTE.paper
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill()
    ctx.strokeStyle = PALETTE.pencilSoft; ctx.lineWidth = 0.8
    ctx.stroke()
    ctx.globalAlpha = a
    ctx.fillStyle = PALETTE.pencil
    ctx.textAlign = 'center'
    ctx.fillText(text, x, y + fs * 0.34)
    addLabel(F, box.x, box.y, box.w, box.h, 'thread:' + text)
  }
}

/* ───────── 4. 栏内铅笔弧 ───────── */
export function drawArcs(F, arcs, showAmbient) {
  const a = smoothstep(AMBIENT_FADE[0], AMBIENT_FADE[1], F.z)
  if (!showAmbient || !(a > 0.01) || !arcs) return
  const ctx = F.ctx, z = F.z, vp = F.vp
  const sel = F.sel
  for (const arc of arcs) {
    const top = Math.min(arc.y0, arc.y1), bot = Math.max(arc.y0, arc.y1)
    if (arc.x < vp.x - 80 || arc.x - arc.bulge > vp.x + vp.w || bot < vp.y || top > vp.y + vp.h) continue
    const mine = sel && (arc.a === sel.id || arc.b === sel.id)
    if (mine) continue                          // 选中层会用铅笔色重描这条
    const x = arc.x * z + F.tx, y0 = arc.y0 * z + F.ty, y1 = arc.y1 * z + F.ty
    const cx = (arc.x - arc.bulge) * z + F.tx
    ctx.globalAlpha = 1
    pencilCurve(ctx, x, y0, cx, (y0 + y1) / 2, x, y1, arc._seed || (arc._seed = seedOf(arc.key || arc.a + '|' + arc.b)), {
      color: PALETTE.pencilSoft, alpha: a * (sel ? 0.3 : 1) * (0.75 + 0.5 * (arc.weight || 0.5)), width: 0.9, jitter: 0.6, style: 'solid',
    })
    F.arcs++
  }
}
/*__LINKS_PART2__*/
