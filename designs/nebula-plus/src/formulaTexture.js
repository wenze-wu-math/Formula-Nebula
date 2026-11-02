/**
 * ═══════════════════════════════════════════════════════════════
 *  公式 → 贴图
 * ═══════════════════════════════════════════════════════════════
 *
 *  为什么用 MathJax 而不是 KaTeX：
 *  MathJax 的 SVG 输出**把字形转成了路径（path）**，完全自包含，
 *  不依赖任何外部字体文件或 CSS。因此可以直接：
 *      SVG 字符串 → Blob URL → <img> → canvas.drawImage → CanvasTexture
 *  而 KaTeX 输出的是 HTML + CSS + webfont，要转图片就得走 html2canvas
 *  这类库，且字体没加载完就截图会糊。这里 MathJax 完胜。
 *
 *  字号一致性：所有公式都以同一个 fontSizePx 排版，返回的 emHeight
 *  表示"这个公式有几 em 高"。布局时用 世界高度 = emHeight × emWorld
 *  就能保证星云里所有公式的字号视觉上一致——分式自然比单字符高，
 *  这正是正确的排版行为。
 */

import * as THREE from 'three'

import { mathjax } from 'mathjax-full/js/mathjax.js'
import { TeX } from 'mathjax-full/js/input/tex.js'
import { SVG } from 'mathjax-full/js/output/svg.js'
import { liteAdaptor } from 'mathjax-full/js/adaptors/liteAdaptor.js'
import { RegisterHTMLHandler } from 'mathjax-full/js/handlers/html.js'
import { AllPackages } from 'mathjax-full/js/input/tex/AllPackages.js'

/* ── 初始化 MathJax（模块级只做一次） ── */
const adaptor = liteAdaptor()
RegisterHTMLHandler(adaptor)

const texInput = new TeX({
  packages: AllPackages,
  inlineMath: [['$', '$']],
})

const svgOutput = new SVG({
  fontCache: 'local',   // 字形路径内联到每个 SVG，保证自包含
})

const mjDoc = mathjax.document('', { InputJax: texInput, OutputJax: svgOutput })

/** 排版字号（px）。所有公式统一用它，保证字号一致。 */
const FONT_SIZE = 64

/** 贴图里字形的颜色。画成纯白，真实颜色交给材质按重要度染。 */
const GLYPH_COLOR = '#ffffff'

/** 从标签字符串里取属性值 */
function attr(tag, name) {
  const m = tag.match(new RegExp(`${name}\\s*=\\s*"([^"]*)"`))
  return m ? m[1] : null
}

/** 把 "12.5ex" / "30px" / "4em" 统一换成像素 */
function toPx(value, fontSize) {
  if (!value) return null
  const n = parseFloat(value)
  if (!isFinite(n)) return null
  if (value.endsWith('ex')) return n * fontSize * 0.43
  if (value.endsWith('em')) return n * fontSize
  if (value.endsWith('pt')) return n * (fontSize / 10)
  if (value.endsWith('px')) return n
  return n   // 无单位时按 px 处理
}

/**
 * LaTeX → 自包含 SVG 字符串 + 像素尺寸
 * @returns {{ svg: string, widthPx: number, heightPx: number }}
 */
function latexToSvg(latex) {
  const node = mjDoc.convert(latex, {
    display: true,
    em: FONT_SIZE,
    ex: FONT_SIZE * 0.43,
    containerWidth: 1e6,   // 给足宽度，避免自动换行
  })

  // 关键：必须用 innerHTML 而不是 outerHTML！
  // outerHTML 会返回 <mjx-container class="MathJax">…<svg>…</svg></mjx-container>，
  // 外层那个自定义标签不是合法 SVG 根元素，浏览器加载时会直接 onerror。
  let svg = adaptor.innerHTML(node)

  // 取出 <svg ...> 开标签
  const svgTag = svg.match(/<svg[^>]*>/)
  if (!svgTag) throw new Error('MathJax 未产出 SVG：' + latex)

  const tag = svgTag[0]
  let w = toPx(attr(tag, 'width'), FONT_SIZE)
  let h = toPx(attr(tag, 'height'), FONT_SIZE)

  // 兜底：万一没有 width/height，用 viewBox 推断
  if (!w || !h) {
    const vb = attr(tag, 'viewBox')
    if (vb) {
      const p = vb.split(/[\s,]+/).map(Number)
      if (p.length === 4 && p[2] > 0 && p[3] > 0) {
        // viewBox 单位是 1000 units/em
        const k = FONT_SIZE / 1000
        w = w || p[2] * k
        h = h || p[3] * k
      }
    }
  }
  if (!w || !h) throw new Error('无法确定公式尺寸：' + latex)

  // 关键：把 ex 单位换成明确的 px，避免 <img> 里 ex 按 16px 字号解析导致缩放错乱
  let fixedTag = tag
    .replace(/width\s*=\s*"[^"]*"/, `width="${w.toFixed(2)}"`)
    .replace(/height\s*=\s*"[^"]*"/, `height="${h.toFixed(2)}"`)

  if (!/xmlns=/.test(fixedTag)) {
    fixedTag = fixedTag.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"')
  }
  // 去掉竖直对齐样式，画到 canvas 时我们自己定位
  fixedTag = fixedTag.replace(/\sstyle\s*=\s*"[^"]*"/, '')

  // 用函数替换，避免 fixedTag 里万一出现 $ 被当成替换模式
  svg = svg.replace(tag, () => fixedTag)

  // currentColor → 实色白，保证 canvas 上画得出来
  svg = svg.replace(/currentColor/g, GLYPH_COLOR)

  return { svg, widthPx: w, heightPx: h }
}

/** SVG 字符串 → HTMLImageElement */
function svgToImage(svg) {
  return new Promise((resolve, reject) => {
    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('SVG 转图片失败'))
    }
    img.src = url
  })
}

/**
 * 把一个 LaTeX 公式烘焙成 THREE.CanvasTexture
 *
 * @param {string} latex
 * @param {object} [opts]
 * @param {number} [opts.textureScale=2] 分辨率倍率，越大越清晰、显存越贵
 * @param {number} [opts.padding=12]     四周留白（设备像素），防止辉光被裁切
 * @returns {Promise<{texture, aspect, emWidth, emHeight, canvas}>}
 *   aspect   = 宽 / 高（不含留白）
 *   emHeight = 高 / 字号，即在世界里应占多少个 em 的高度
 */
/**
 * 把"排版 → 解码 → 绘制"拆成两半，好让解码与下一次排版重叠。
 *
 * ── 为什么要拆 ──
 * 原来 bakeAll 是一个纯粹的串行循环：
 *
 *     for (...) { 排版(i); await 解码(i); 绘制(i) }
 *
 * 但实测（scripts/probe-bake-breakdown.mjs，464 个公式）：
 *
 *     烘焙总计        5296 ms   100%
 *     其中 <img> 解码 2869 ms    54.2%   ← 与排版无依赖
 *     排版 + 绘制     2427 ms    45.8%   ← 排版必须串行（MathJax 非线程安全）
 *
 * **解码占了 54.2%**，而它跟排版之间没有任何依赖 ——
 * `svgToImage` 走的是 Blob URL + `<img>`，解码由浏览器在**别的线程**上做，
 * 主线程只是在 `await` 上空等。串行循环把这 2869 ms 完全浪费了。
 *
 * 拆开之后：先排版第 i 个并**启动**它的解码（不 await），
 * 再去 await 更早启动、此时已经解得差不多的那些。
 * 主线程在等解码时，别的解码正在并行推进。
 *
 * ── 为什么保序 ──
 * 结果 Map 的迭代顺序会影响下游（布局按插入顺序处理），
 * 所以结果先按序号摆进数组，最后再统一建 Map。
 *
 * @param {string} latex
 * @param {object} opts
 * @returns {{promise: Promise<object>, ...}} 已经完成了同步的排版部分
 */
function beginBake(latex, opts) {
  // ① 同步：MathJax 排版成 SVG 字符串（必须串行，但很快）
  const { svg, widthPx, heightPx } = latexToSvg(latex)
  // ② 启动解码：异步、在别的线程上跑，**这里不 await**
  return { imgPromise: svgToImage(svg), widthPx, heightPx, opts }
}

/** 收尾：等解码结束，然后绘制 + 建纹理 */
async function finishBake(handle) {
  const { textureScale = 2, padding = 12 } = handle.opts
  const img = await handle.imgPromise
  const { widthPx, heightPx } = handle

  // 纹理尺寸：既要清晰，又不能吃掉显存。
  // 关键点：**不乘 devicePixelRatio**。sprite 在屏幕上通常只有一两百像素高，
  // 再乘 dpr 会让显存占用翻两番还多；公式是矢量排版，本身已足够锐利。
  // 再加一道硬上限，防止个别超长公式（如黎曼-罗赫）撑爆纹理。
  const MAX_W = 1024
  const MAX_H = 512
  const scale = Math.max(0.34, Math.min(
    textureScale,
    MAX_W / widthPx,
    MAX_H / heightPx,
  ))

  const iw = Math.max(1, Math.round(widthPx * scale))
  const ih = Math.max(1, Math.round(heightPx * scale))

  const canvas = document.createElement('canvas')
  canvas.width = iw + padding * 2
  canvas.height = ih + padding * 2

  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(img, padding, padding, iw, ih)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.minFilter = THREE.LinearMipmapLinearFilter
  texture.magFilter = THREE.LinearFilter
  texture.generateMipmaps = true
  texture.anisotropy = 8
  texture.needsUpdate = true

  return {
    texture,
    aspect: iw / ih,
    emWidth: widthPx / FONT_SIZE,
    emHeight: heightPx / FONT_SIZE,
    // 画布含留白，字形只占中间 contentW×contentH 的区域。
    // 摆放时需要这两个值把"字形高度"精确换算成 sprite 缩放。
    canvasW: canvas.width,
    canvasH: canvas.height,
    contentW: iw,
    contentH: ih,
    canvas,
  }
}

export async function bakeFormulaTexture(latex, opts = {}) {
  return finishBake(beginBake(latex, opts))
}

/**
 * 批量烘焙，带进度回调。
 *
 * ── 流水线：为什么不是简单的串行循环 ──
 * 原来写的是 `for (...) { await bakeFormulaTexture(...) }`，
 * 每个公式都"排版 → 等解码 → 绘制"一步步走完再处理下一个。
 *
 * 实测发现**解码占了总耗时的 54.2%**（2869 / 5296 ms，464 个公式），
 * 而它跟排版之间毫无依赖 —— `svgToImage` 用 Blob URL + `<img>`，
 * 解码是浏览器在别的线程做的。串行循环让主线程在这 2869 ms 里纯空等。
 *
 * 现在改成**有界前瞻**：
 *   1. 先把前 LOOKAHEAD 个公式**只做排版**并启动解码（不 await）
 *   2. 然后逐个 await（此时多半已经解好），收尾后立刻补进下一个
 *
 * 这样任意时刻都有若干个解码在并行推进，主线程等的时间大幅减少。
 *
 * ── 为什么前瞻深度要有界 ──
 * 无限前瞻会在内存里同时堆 464 个解码后的位图（每个都可能 1024×512），
 * 峰值内存会非常难看。实测锁在 8 个时已经足够填满解码延迟，
 * 再深收益就趋于平坦了（解码中位只有 5.2 ms，8 个的窗口远大于它）。
 *
 * ── 顺序必须保住 ──
 * 结果先按序号摆进数组，最后统一建 Map —— 这样 Map 的迭代顺序
 * 与 items 一致。下游（布局、建节点）依赖这个顺序，不能乱。
 *
 * @param {Array<{id:string, latex:string}>} items
 * @param {(done:number,total:number,label:string)=>void} [onProgress]
 * @param {object} [opts]
 * @param {number} [opts.lookahead=8] 流水线深度；设 1 即退化成原串行行为
 * @returns {Promise<Map<string, object>>} id → 烘焙结果
 */
export async function bakeAll(items, onProgress, opts = {}) {
  const total = items.length
  const errors = []
  const results = new Array(total)      // 按下标放，最后建 Map 保序

  const { lookahead = 16, ...bakeOpts } = opts  // Increased from 8 to 16 for better parallelism
  const depth = Math.max(1, Math.min(lookahead, total))

  /** 已经排版并启动解码、但还没收尾的槽位 */
  const inflight = new Array(depth).fill(null)
  let nextStart = 0    // 下一个要排版的
  let nextFinish = 0   // 下一个要收尾的

  /** 排版第 i 个并启动它的解码（同步很快，解码异步跑着） */
  const start = (i) => {
    const it = items[i]
    try {
      inflight[i % depth] = { handle: beginBake(it.latex, bakeOpts), item: it, i }
    } catch (err) {
      // 排版阶段就失败（LaTeX 语法错等）
      const msg = (err && err.message) || String(err)
      if (errors.length < 5) errors.push(`${it.id}: ${msg}`)
      console.warn('[formulaTexture] 排版失败', it.id, it.latex, err)
      inflight[i % depth] = { failed: true, item: it, i }
    }
  }

  // 预fill：把流水线灌满
  while (nextStart < depth) start(nextStart++)

  while (nextFinish < total) {
    const slot = inflight[nextFinish % depth]
    const it = items[nextFinish]
    try {
      if (slot && slot.failed) {
        results[nextFinish] = null
      } else if (slot && slot.handle) {
        results[nextFinish] = await finishBake(slot.handle)
      } else {
        // 理论上不会走到（除非 lookahead 逻辑被改坏）
        results[nextFinish] = await bakeFormulaTexture(it.latex, bakeOpts)
      }
    } catch (err) {
      const msg = (err && err.message) || String(err)
      if (errors.length < 5) errors.push(`${it.id}: ${msg}`)
      console.warn('[formulaTexture] 烘焙失败', it.id, it.latex, err)
      results[nextFinish] = null
    }
    inflight[nextFinish % depth] = null

    if (onProgress) onProgress(nextFinish + 1, total, it.name || it.id)

    // 收尾完一个就补进下一个，保持流水线始终是满的
    if (nextStart < total) start(nextStart++)

    // 每若干个让出主线程，让进度条能动、也避免长任务警告。
    // 注意：让出期间解码仍在别的线程推进，所以这一步不会浪费流水线。
    if (nextFinish % 8 === 7) await new Promise((r) => setTimeout(r, 0))

    nextFinish++
  }

  // 统一建 Map —— 顺序与 items 一致
  const out = new Map()
  for (let i = 0; i < total; i++) out.set(items[i].id, results[i])

  // 把失败原因挂到 Map 上，方便自动化验证读取
  out.errors = errors
  return out
}
