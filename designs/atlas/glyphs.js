/**
 * designs/atlas/glyphs.js — 恒星与深空天体符号（冻结文件，架构师维护）。
 *
 * 为什么单列：地图（render.js）、图例（chrome.js）、详情面板关联列表（panel.js）
 * 必须画出**完全相同**的符号，否则图例就失去了意义。三方都只调这里。
 *
 * 符号系统（SPEC §1.4）：
 *   定理 = 恒星：奶白实心圆，外围一圈底色"挖空"（印刷星图让星点压断坐标线的效果）；
 *               mag ≤ 2 加一层极淡的柔光，mag 1 再加四芒细刺。
 *   猜想 = 深空天体，朱红单色，按状态：
 *     open       虚线圆（"尚未看清的星云"）
 *     partial    圆 + 左半填实
 *     proved     实心圆 + 外圈细环
 *     disproved  圆 + 一道斜杠穿过
 *     heuristic  倾斜椭圆（星系符号）
 */
import { COLOR, STAR_R, DSO_R, glyphScale } from './constants.js'

/**
 * 某 body 在语义级 L 下的屏幕半径（css px）。渲染、标签锚点、命中测试三方共用。
 * @param {{kind:'star'|'dso'|'researcher', mag:number, tier:number}} body
 * @param {number} L
 */
export function bodyRadius(body, L) {
  if (body.kind === 'star') return Math.max(0.8, STAR_R[body.mag - 1] * glyphScale(L))
  if (body.kind === 'dso') return Math.max(1.2, DSO_R[body.tier - 1] * glyphScale(L))
  return 3
}

/**
 * 画一颗恒星。
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x @param {number} y   屏幕坐标（css px，调用方已处理 dpr 变换）
 * @param {number} r                      半径（css px）
 * @param {{ alpha?:number, mag?:number, halo?:boolean }} [o]
 */
/**
 * 批量画同星等的恒星（性能关键路径，2026-11-02 新增）。
 *
 * ═══ 为什么需要它 ═══
 *
 * 知识库从 488 涨到 1708 节点后，`drawStar` 逐颗调用成了瓶颈：
 * 每颗都要 `save()/restore()`、建路径、单独 `fill()`，星点一多就是
 * 每帧 1500+ 次状态切换。实测 `frameMs` 从 141ms 涨到 605ms，
 * 帧率掉到 0.3，烘焙泵被饿死（吞吐从 83 条/秒跌到 4 条/秒）。
 *
 * 改法：同星等的星点**共用一条路径、一次 fill**，状态切换从 O(n) 降到 O(星等数=6)。
 * 视觉上完全等价 —— 同一 fillStyle、同一 alpha、同一半径下，
 * 逐个画和批量画的结果逐像素相同。
 *
 * 注意：mag ≤ 2 的亮星有径向渐变光晕，**必须逐颗画**（渐变以星点为中心，
 * 不能合并）。好在这类只占 5%+15%，代价可接受。
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {Array<{x:number,y:number,r:number,alpha:number}>} pts 屏幕坐标 + 半径
 * @param {number} mag 该批的星等
 * @param {{halo?:boolean}} [o]
 */
export function drawStarBatch(ctx, pts, mag, o = {}) {
  if (!pts.length) return
  const halo = o.halo ?? true
  ctx.save()
  /* halo：先统一画一圈"挖空"描边（底色），再画星点本体 */
  if (halo) {
    ctx.fillStyle = COLOR.starHalo
    ctx.beginPath()
    for (const p of pts) {
      if (p.alpha <= 0.004 || p.r <= 0) continue
      ctx.moveTo(p.x + p.r + 1.3, p.y)
      ctx.arc(p.x, p.y, p.r + 1.3, 0, Math.PI * 2)
    }
    ctx.fill()
  }
  /* 星点本体：同 alpha 的合批。alpha 只有两档（压暗 0.28 / 正常 1），
   * 这里按出现顺序分组，最多两次 fill。 */
  const groups = new Map()
  for (const p of pts) {
    if (p.alpha <= 0.004 || p.r <= 0) continue
    const k = Math.round(p.alpha * 1000)
    if (!groups.has(k)) groups.set(k, [])
    groups.get(k).push(p)
  }
  for (const [k, arr] of groups) {
    ctx.globalAlpha = k / 1000
    ctx.fillStyle = COLOR.star
    ctx.beginPath()
    for (const p of arr) {
      ctx.moveTo(p.x + p.r, p.y)
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
    }
    ctx.fill()
  }
  ctx.restore()
}

export function drawStar(ctx, x, y, r, o = {}) {
  const alpha = o.alpha ?? 1, mag = o.mag ?? 6, halo = o.halo ?? true
  if (alpha <= 0.004 || r <= 0) return
  ctx.save()
  ctx.globalAlpha = alpha
  if (mag <= 2) {
    // Enhanced radial gradient with smoother alpha falloff
    const g = ctx.createRadialGradient(x, y, 0, x, y, r * 3.5)
    g.addColorStop(0, 'rgba(244,236,216,0.35)')
    g.addColorStop(0.3, 'rgba(244,236,216,0.18)')
    g.addColorStop(0.6, 'rgba(244,236,216,0.08)')
    g.addColorStop(1, 'rgba(244,236,216,0)')
    ctx.fillStyle = g
    ctx.beginPath(); ctx.arc(x, y, r * 3.5, 0, Math.PI * 2); ctx.fill()
  }
  if (halo) {
    ctx.fillStyle = COLOR.starHalo
    ctx.beginPath(); ctx.arc(x, y, r + 1.3, 0, Math.PI * 2); ctx.fill()
  }
  ctx.fillStyle = COLOR.star
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill()
  if (mag === 1) {
    ctx.strokeStyle = COLOR.star
    ctx.globalAlpha = alpha * 0.55
    ctx.lineWidth = 0.8
    const a = r * 1.35, b = r * 2.5
    ctx.beginPath()
    ctx.moveTo(x - b, y); ctx.lineTo(x - a, y); ctx.moveTo(x + a, y); ctx.lineTo(x + b, y)
    ctx.moveTo(x, y - b); ctx.lineTo(x, y - a); ctx.moveTo(x, y + a); ctx.lineTo(x, y + b)
    ctx.stroke()
  }
  ctx.restore()
}

/** 构建某状态符号的描边路径（不含填充部分） */
function dsoPath(ctx, x, y, r, status) {
  ctx.beginPath()
  if (status === 'heuristic') {
    ctx.ellipse(x, y, r * 1.3, r * 0.62, -Math.PI / 6, 0, Math.PI * 2)
  } else {
    ctx.arc(x, y, r, 0, Math.PI * 2)
  }
  if (status === 'disproved') {
    const k = r * 1.3 * Math.SQRT1_2
    ctx.moveTo(x - k, y + k); ctx.lineTo(x + k, y - k)
  }
}

/**
 * 画一个深空天体（猜想）符号。
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x @param {number} y @param {number} r
 * @param {'open'|'partial'|'proved'|'disproved'|'heuristic'} status
 * @param {{ alpha?:number, halo?:boolean, color?:string }} [o]  color 缺省 COLOR.conj
 */
export function drawDso(ctx, x, y, r, status, o = {}) {
  const alpha = o.alpha ?? 1, halo = o.halo ?? true, color = o.color ?? COLOR.conj
  if (alpha <= 0.004 || r <= 0) return
  const lw = Math.max(1, r * 0.22)
  ctx.save()
  ctx.globalAlpha = alpha
  ctx.lineCap = 'round'
  // ① 挖空：用底色粗描一遍，压断下面的坐标线
  if (halo) {
    ctx.strokeStyle = COLOR.starHalo
    ctx.lineWidth = lw + 2.6
    dsoPath(ctx, x, y, r, status)
    ctx.stroke()
    if (status === 'proved' || status === 'partial') {
      ctx.fillStyle = COLOR.starHalo
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill()
    }
  }
  // ② 填充部分
  ctx.fillStyle = color
  if (status === 'proved') {
    ctx.beginPath(); ctx.arc(x, y, r * 0.62, 0, Math.PI * 2); ctx.fill()
  } else if (status === 'partial') {
    ctx.beginPath(); ctx.arc(x, y, r, Math.PI / 2, Math.PI * 3 / 2); ctx.closePath(); ctx.fill()
  }
  // ③ 描边
  ctx.strokeStyle = color
  ctx.lineWidth = lw
  if (status === 'open') ctx.setLineDash([Math.max(1.6, r * 0.55), Math.max(1.4, r * 0.42)])
  dsoPath(ctx, x, y, r, status)
  ctx.stroke()
  ctx.restore()
}

/**
 * 生成一个 DOM 用的小图标画布（图例、面板关联列表、搜索下拉用）。
 * @param {{ kind:'star', mag:number } | { kind:'dso', status:string } | { kind:'researcher' }} spec
 * @param {number} [size=18]  css px（正方形）
 * @returns {HTMLCanvasElement}  已设置 style.width/height，带 class="atlas-glyph"
 */
export function glyphCanvas(spec, size = 18) {
  const dpr = Math.min(2, (typeof devicePixelRatio === 'number' && devicePixelRatio) || 1)
  const c = document.createElement('canvas')
  c.width = Math.round(size * dpr); c.height = Math.round(size * dpr)
  c.style.width = size + 'px'; c.style.height = size + 'px'
  c.className = 'atlas-glyph'
  c.setAttribute('aria-hidden', 'true')
  const ctx = c.getContext('2d')
  ctx.scale(dpr, dpr)
  const m = size / 2
  if (spec.kind === 'star') {
    const R = [5.2, 4.2, 3.3, 2.6, 2.0, 1.5][Math.max(0, Math.min(5, (spec.mag ?? 6) - 1))]
    drawStar(ctx, m, m, R * Math.min(1.25, size / 18), { mag: spec.mag, halo: false })
  } else if (spec.kind === 'dso') {
    drawDso(ctx, m, m, size * 0.3, spec.status, { halo: false })
  } else {
    // 研究者：刻度环外的一道短金色刻度
    ctx.strokeStyle = COLOR.researcher
    ctx.lineWidth = 1.4
    ctx.beginPath(); ctx.moveTo(m, size * 0.2); ctx.lineTo(m, size * 0.8); ctx.stroke()
  }
  return c
}
