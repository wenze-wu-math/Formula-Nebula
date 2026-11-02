/**
 * designs/map/src/labels/bake.js — 公式预烘焙：MathJax SVG → 带光晕的位图（SPEC §8.2）。
 *
 * 为什么预烘焙：每帧 drawImage 一张 SVG <img> 会让 Chrome 反复光栅化矢量（~500 个公式时掉帧），
 * 而且光晕（描边留白）无法直接给 SVG 加。所以每个公式只光栅化一次，烘成"光晕 + 墨色"同一张位图，
 * 分辨率 = 显示尺寸 × min(2, dpr)，绘制时按设备像素对齐 1:1 贴图，字形锐利。
 *
 * 光晕的做法：SPEC 写的是"把 ink 换成 HALO 色的同一份 SVG 在 8 个方向偏移各画一遍"。这里等价地
 * 只解码一份 ink 版：先把 ink 版按 8 个方向偏移画进画布，再用 source-in 把这片膨胀轮廓整体染成 HALO 色，
 * 最后 source-over 叠上 ink 版本身。结果逐像素相同，但每个公式少解码一次 SVG（解码是烘焙的主要开销）。
 *
 * 顺序：优先集（8 首都 + tier1 城市 + tier1 岛屿）先烘焙 → resolve ready（首屏需要的公式），
 * 其余按 tier 升序、importance 降序每批 16 个，批间 setTimeout(0) 让出主线程，每批 onProgress + invalidate。
 * 未烘焙完成 / 排版失败 / 过宽（tooWide）的公式：formula 模式不可用，自动降级为名字。
 */
import { texSync } from '../../../shared/tex.js'
import { COUNTRY_COLORS, ISLAND_STATUS, LABEL_SIZE, HALO } from '../constants.js'
import { invalidate } from '../state.js'

const TEX_PX = 64            // tex.js 的排版字号
const CONCURRENCY = 6        // 同时解码的 SVG 数
const BATCH = 16             // 非优先集每批数量

/**
 * 过宽公式的折行：在顶层（不在 {}、\left…\right、\begin…\end 内）的逗号或蕴含箭头处断开，
 * 选最接近中点的断点，排成左对齐两行 array。返回 null 表示没有可用断点。
 * （SPEC 规定过宽即退化为名字；对首都 Hironaka 等十来条长公式，两行排版比只显示名字更有信息量。）
 */
export function wrapLatex(latex) {
  const s = String(latex)
  const cuts = []
  let depth = 0
  for (let i = 0; i < s.length; i++) {
    const ch = s[i]
    if (ch === '\\') {
      const m = /^\\([a-zA-Z]+|.)/.exec(s.slice(i))
      const cmd = m ? m[1] : ''
      if (cmd === 'left' || cmd === 'begin') depth++
      else if (cmd === 'right' || cmd === 'end') depth--
      else if (depth === 0 && /^(Longrightarrow|implies|iff|Rightarrow)$/.test(cmd)) cuts.push(i)
      i += (m ? m[0].length : 1) - 1
      continue
    }
    if (ch === '{') depth++
    else if (ch === '}') depth--
    else if (ch === ',' && depth === 0) cuts.push(i + 1)
  }
  if (!cuts.length) return null
  const mid = s.length / 2
  cuts.sort((a, b) => Math.abs(a - mid) - Math.abs(b - mid))
  const at = cuts[0]
  const a = s.slice(0, at).replace(/(\\[ ,;:!]|\\quad|\\qquad|\s)+$/, '')
  const b = s.slice(at).replace(/^(\\[ ,;:!]|\\quad|\\qquad|\s)+/, '')
  if (!a.trim() || !b.trim()) return null
  return '\\begin{array}{l}' + a + '\\\\ \\quad ' + b + '\\end{array}'
}

/** 公式显示字号（css px）；港口/无公式返回 0 */
export function formulaPxOf(place) {
  if (place.kind === 'city') return LABEL_SIZE.formulaPx[place.tier] ?? LABEL_SIZE.formulaPx[3]
  if (place.kind === 'island') return LABEL_SIZE.islandFormulaPx[Math.max(0, place.tier - 1)] ?? LABEL_SIZE.islandFormulaPx[2]
  return 0
}
/** 标签墨色（公式与名字同色） */
export function inkOf(place) {
  if (place.kind === 'city') return COUNTRY_COLORS[place.family]?.ink || '#333333'
  if (place.kind === 'island') return (ISLAND_STATUS[place.status] || ISLAND_STATUS.open).ink
  return null
}

/**
 * Entry = {
 *   id, state: 'pending'|'ready'|'failed'|'tooWide',
 *   w, h,      // 公式墨迹区显示尺寸（css px，已按 maxFormulaW 缩放）
 *   bw, bh,    // 位图的显示尺寸（= w,h 四周各加 HALO.width/2 的光晕边），标签框按它算
 *   pad,       // 光晕边宽（css px）
 *   bmp,       // ImageBitmap | canvas
 *   dpr,       // 烘焙时的像素比
 * }
 */
export function createBaker(world) {
  const entries = new Map()
  const order = []
  for (const p of world.places) {
    if (p.kind === 'port') continue
    const latex = p.node && p.node.latex
    if (!latex) continue
    const e = { id: p.id, place: p, latex, ink: inkOf(p), px: formulaPxOf(p), state: 'pending', w: 0, h: 0, bw: 0, bh: 0, pad: HALO.width / 2, bmp: null, dpr: 1 }
    entries.set(p.id, e)
    order.push(e)
  }
  // 优先集：首屏（L0/L1）会出现的公式
  //
  // ⚠ 必须有**硬上限**。知识库从 488 涨到 3,503 条后，tier<=1 的节点
  //   从几十条涨到 436 条，优先集烘焙要 30+ 秒，而 main.js 的
  //   `await labeler.ready` 会阻塞整个首屏 —— 实测 bootMs 33.6s。
  //
  //   首屏（1600x1000）实际能显示的公式标签约 100 个（见 SCALABILITY.md），
  //   烘 150 条足够覆盖首屏 + 一点缓冲。多烘的都是白等。
  const PRI_CAP = 150
  const isPri = (e) => e.place.kind === 'city' ? e.place.tier <= 1 : e.place.tier <= 1
  /* 优先集内部也按「层级 -> 重要度」排，保证烘的是最该先看到的 */
  const priAll = order
    .filter(isPri)
    .sort((a, b) => (a.place.tier - b.place.tier) || (b.place.importance - a.place.importance))
  const pri = priAll.slice(0, PRI_CAP)
  const priOverflow = priAll.slice(PRI_CAP)
  const rest = [
    ...priOverflow,
    ...order.filter((e) => !isPri(e)),
  ].sort((a, b) => (a.place.tier - b.place.tier) || (b.place.importance - a.place.importance))

  let done = 0
  const total = order.length
  let started = false
  let onProgress = null
  let resolveReady, resolveAll
  const ready = new Promise((r) => { resolveReady = r })
  const all = new Promise((r) => { resolveAll = r })
  const timing = { start: 0, readyMs: 0, allMs: 0, texMs: 0, decodeMs: 0, batches: [] }
  let warned = 0

  const canBake = typeof Image !== 'undefined' && typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function'

  /** 只做排版与尺寸（node 下也能跑）；返回 svg 或 null */
  function layout(e) {
    let r
    const t0 = performance.now()
    try {
      r = texSync(e.latex, e.ink)
    } catch (err) {
      e.state = 'failed'
      if (warned++ < 8) console.warn('[map/labels] 公式排版失败，改用名字：', e.id, err && err.message)
      return null
    } finally {
      timing.texMs += performance.now() - t0
    }
    let w = r.widthPx * e.px / TEX_PX, h = r.heightPx * e.px / TEX_PX
    if (w > LABEL_SIZE.maxFormulaW / 0.75) {
      // 过宽：先试两行排版
      const wl = wrapLatex(e.latex)
      if (wl) {
        try {
          const r2 = texSync(wl, e.ink)
          const w2 = r2.widthPx * e.px / TEX_PX
          if (w2 < w * 0.8) { r = r2; w = w2; h = r2.heightPx * e.px / TEX_PX; e.wrapped = true }
        } catch { /* 折行失败就按原样判定 */ }
      }
    }
    if (w > LABEL_SIZE.maxFormulaW) {
      const k = LABEL_SIZE.maxFormulaW / w
      if (k < 0.75) { e.state = 'tooWide'; return null }   // 缩到看不清 → 永久名字模式
      w *= k; h *= k
    }
    e.w = w; e.h = h
    e.bw = w + 2 * e.pad; e.bh = h + 2 * e.pad
    return r.svg
  }

  function makeCanvas(W, H) {
    if (typeof OffscreenCanvas !== 'undefined') return new OffscreenCanvas(W, H)
    const c = document.createElement('canvas'); c.width = W; c.height = H; return c
  }

  async function bakeOne(e) {
    const svg = layout(e)
    if (!svg) return
    if (!canBake) { e.state = 'failed'; return }
    const t0 = performance.now()
    const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }))
    try {
      const img = new Image()
      img.decoding = 'async'
      img.src = url
      await img.decode()
      const dpr = Math.min(2, (typeof devicePixelRatio !== 'undefined' && devicePixelRatio) || 1)
      const W = Math.max(1, Math.ceil(e.bw * dpr)), H = Math.max(1, Math.ceil(e.bh * dpr))
      const cv = makeCanvas(W, H)
      const g = cv.getContext('2d')
      const p = e.pad * dpr, iw = e.w * dpr, ih = e.h * dpr
      // 1) 8 方向偏移的 ink 版 → 膨胀轮廓
      for (let k = 0; k < 8; k++) {
        const a = k * Math.PI / 4
        g.drawImage(img, p + Math.cos(a) * p, p + Math.sin(a) * p, iw, ih)
      }
      // 2) 轮廓整体染成光晕色
      g.globalCompositeOperation = 'source-in'
      g.fillStyle = HALO.color
      g.fillRect(0, 0, W, H)
      // 3) 墨色本体
      g.globalCompositeOperation = 'source-over'
      g.drawImage(img, p, p, iw, ih)
      e.bmp = typeof cv.transferToImageBitmap === 'function' ? cv.transferToImageBitmap()
        : typeof createImageBitmap === 'function' ? await createImageBitmap(cv) : cv
      e.dpr = dpr
      e.state = 'ready'
    } catch (err) {
      e.state = 'failed'
      if (warned++ < 8) console.warn('[map/labels] 公式位图解码失败，改用名字：', e.id, err && err.message)
    } finally {
      URL.revokeObjectURL(url)
      timing.decodeMs += performance.now() - t0
    }
  }

  /** 并发 CONCURRENCY 个处理一组 */
  async function pool(list) {
    let i = 0
    const worker = async () => { while (i < list.length) { const e = list[i++]; await bakeOne(e); done++ } }
    await Promise.all(Array.from({ length: Math.min(CONCURRENCY, list.length) }, worker))
  }
  const yieldMain = () => new Promise((r) => setTimeout(r, 0))
  const progress = () => { try { onProgress && onProgress({ done, total }) } catch (err) { console.error(err) } invalidate() }

  async function run() {
    timing.start = performance.now()
    progress()
    for (let i = 0; i < pri.length; i += BATCH) await pool(pri.slice(i, i + BATCH))
    timing.readyMs = performance.now() - timing.start
    progress()
    resolveReady()
    for (let i = 0; i < rest.length; i += BATCH) {
      const ty = performance.now()
      await yieldMain()
      const tp = performance.now()
      await pool(rest.slice(i, i + BATCH))
      const td = performance.now()
      progress()
      // [让出等待, 烘焙, 进度回调+置脏] 毫秒，诊断用
      if (timing.batches.length < 64) timing.batches.push([Math.round(tp - ty), Math.round(td - tp), Math.round(performance.now() - td)])
    }
    timing.allMs = performance.now() - timing.start
    resolveAll()
  }
  function start() {
    if (started) return
    started = true
    run().catch((err) => { console.error('[map/labels] 烘焙中断', err); resolveReady(); resolveAll() })
  }
  // main 会立即调用 bake()；若调用方忘了，下一个微任务自动开始，ready 不会永远悬挂
  if (canBake) queueMicrotask(start)

  return {
    entries,
    timing,
    ready,
    get done() { return done },
    total,
    /** 可用于 formula 模式的条目（已烘焙），否则 null */
    get(id) { const e = entries.get(id); return e && e.state === 'ready' ? e : null },
    bake(cb) { if (cb) onProgress = cb; if (canBake) start(); else { resolveReady(); resolveAll() } return all },
    /** node 测试用：只排版不出位图，把条目置为 ready（bmp=null） */
    layoutOnly() {
      for (const e of order) { if (layout(e)) e.state = 'ready' }
      done = total; resolveReady(); resolveAll()
    },
  }
}
