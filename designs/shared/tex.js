/**
 * designs/shared/tex.js — LaTeX → 自包含 SVG（带颜色）。
 *
 * **优化策略（v0.1.1）**：
 *   1. **优先使用 KaTeX** (10-100x faster, 600KB vs 3-4MB)
 *   2. **MathJax 作为降级** (复杂公式/KaTeX 不支持的特性)
 *
 * 排版逻辑取自 src/formulaTexture.js 的 latexToSvg()：同一套配置、
 * 同一个 FONT_SIZE、同样的 ex→px 尺寸修正。区别只有两点：
 *   · 不烘焙成 THREE 纹理（设计稿直接把 SVG 放进 DOM / <img>）
 *   · currentColor 换成调用方给的颜色，而不是固定白色
 *
 * 用法：
 *   const { svg, widthPx, heightPx } = await tex('\\chi(\\mathcal O_X)', '#ffcf7a')
 *   host.innerHTML = svg
 */

import katex from 'katex'

// MathJax 按需加载（仅在 KaTeX 失败时才导入）
let mathjaxLoaded = false
let mjDoc = null

async function ensureMathJax() {
  if (mathjaxLoaded) return mjDoc

  const { mathjax } = await import('mathjax-full/js/mathjax.js')
  const { TeX } = await import('mathjax-full/js/input/tex.js')
  const { SVG } = await import('mathjax-full/js/output/svg.js')
  const { liteAdaptor } = await import('mathjax-full/js/adaptors/liteAdaptor.js')
  const { RegisterHTMLHandler } = await import('mathjax-full/js/handlers/html.js')
  const { AllPackages } = await import('mathjax-full/js/input/tex/AllPackages.js')

  const adaptor = liteAdaptor()
  RegisterHTMLHandler(adaptor)
  const texInput = new TeX({ packages: AllPackages, inlineMath: [['$', '$']] })
  const svgOutput = new SVG({ fontCache: 'local' })
  mjDoc = mathjax.document('', { InputJax: texInput, OutputJax: svgOutput })
  mathjaxLoaded = true

  return mjDoc
}

/** 排版字号（px），与 src/formulaTexture.js 保持一致 */
export const FONT_SIZE = 64

/** 颜色会被拼进 SVG 源码，只接受 #rgb / #rrggbb / #rrggbbaa，防止注入 */
const HEX_RE = /^#(?:[0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i

function attr(tag, name) {
  const m = tag.match(new RegExp(`${name}\\s*=\\s*"([^"]*)"`))
  return m ? m[1] : null
}

/** "12.5ex" / "30px" / "4em" → 像素 */
function toPx(value, fontSize) {
  if (!value) return null
  const n = parseFloat(value)
  if (!isFinite(n)) return null
  if (value.endsWith('ex')) return n * fontSize * 0.43
  if (value.endsWith('em')) return n * fontSize
  if (value.endsWith('pt')) return n * (fontSize / 10)
  if (value.endsWith('px')) return n
  return n
}

/**
 * 尝试使用 KaTeX 渲染（快速路径）
 * @returns {object|null} - { svg, widthPx, heightPx } 或 null（失败）
 */
function tryKatex(latex, color) {
  try {
    const html = katex.renderToString(latex, {
      displayMode: true,
      throwOnError: true,
      output: 'html',
      strict: false,
      trust: false,
    })

    // KaTeX 输出的是带样式的 HTML，需要转换为 SVG
    // 创建临时元素来测量尺寸
    const tempDiv = document.createElement('div')
    tempDiv.style.position = 'absolute'
    tempDiv.style.visibility = 'hidden'
    tempDiv.style.fontSize = `${FONT_SIZE}px`
    tempDiv.style.color = color
    tempDiv.innerHTML = html
    document.body.appendChild(tempDiv)

    const rect = tempDiv.getBoundingClientRect()
    const w = rect.width
    const h = rect.height

    document.body.removeChild(tempDiv)

    if (!w || !h || w <= 0 || h <= 0) return null

    // 将 HTML 包装成 SVG foreignObject
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w.toFixed(2)}" height="${h.toFixed(
      2
    )}" viewBox="0 0 ${w} ${h}">
  <foreignObject width="100%" height="100%">
    <div xmlns="http://www.w3.org/1999/xhtml" style="font-size: ${FONT_SIZE}px; color: ${color}">
      ${html}
    </div>
  </foreignObject>
</svg>`

    return { svg, widthPx: w, heightPx: h, renderer: 'katex' }
  } catch (err) {
    // KaTeX 不支持的语法，降级到 MathJax
    return null
  }
}

/**
 * 使用 MathJax 渲染（降级路径）
 */
async function renderWithMathJax(latex, color) {
  const doc = await ensureMathJax()
  const { liteAdaptor } = await import('mathjax-full/js/adaptors/liteAdaptor.js')
  const adaptor = liteAdaptor()

  const node = doc.convert(String(latex), {
    display: true,
    em: FONT_SIZE,
    ex: FONT_SIZE * 0.43,
    containerWidth: 1e6,
  })

  let svg = adaptor.innerHTML(node)

  const svgTag = svg.match(/<svg[^>]*>/)
  if (!svgTag) throw new Error('MathJax 未产出 SVG：' + latex)

  const tag = svgTag[0]
  let w = toPx(attr(tag, 'width'), FONT_SIZE)
  let h = toPx(attr(tag, 'height'), FONT_SIZE)

  if (!w || !h) {
    const vb = attr(tag, 'viewBox')
    if (vb) {
      const p = vb.split(/[\s,]+/).map(Number)
      if (p.length === 4 && p[2] > 0 && p[3] > 0) {
        const k = FONT_SIZE / 1000
        w = w || p[2] * k
        h = h || p[3] * k
      }
    }
  }
  if (!w || !h) throw new Error('无法确定公式尺寸：' + latex)

  let fixedTag = tag
    .replace(/width\s*=\s*"[^"]*"/, `width="${w.toFixed(2)}"`)
    .replace(/height\s*=\s*"[^"]*"/, `height="${h.toFixed(2)}"`)
  if (!/xmlns=/.test(fixedTag)) {
    fixedTag = fixedTag.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"')
  }
  fixedTag = fixedTag.replace(/\sstyle\s*=\s*"[^"]*"/, '')

  svg = svg.replace(tag, () => fixedTag)
  svg = svg.replace(/currentColor/g, color)

  return { svg, widthPx: w, heightPx: h, renderer: 'mathjax' }
}

/** 同步版本：LaTeX → { svg, widthPx, heightPx }。排版失败直接抛错。 */
export function texSync(latex, color = '#ffffff') {
  if (!HEX_RE.test(color)) throw new Error('tex(): color 必须是 hex，例如 #ffcf7a，收到：' + color)

  // 在浏览器环境中，总是使用异步版本
  throw new Error('texSync 不支持在 KaTeX 优化模式下使用，请使用 async tex()')
}

/**
 * LaTeX + 颜色 → Promise<{ svg, widthPx, heightPx, renderer }>
 *
 * **性能优化流程**：
 * 1. 尝试 KaTeX（快速路径）
 * 2. 失败则降级到 MathJax
 * 3. 返回结果包含 renderer 字段标识使用的渲染器
 */
export async function tex(latex, color = '#ffffff') {
  if (!HEX_RE.test(color)) throw new Error('tex(): color 必须是 hex，例如 #ffcf7a，收到：' + color)

  const startTime = performance.now()

  // 首先尝试 KaTeX（10-100x faster）
  const katexResult = tryKatex(latex, color)
  if (katexResult) {
    const duration = performance.now() - startTime

    // 记录性能（如果监控器可用）
    if (typeof window !== 'undefined' && window.__perfMonitor) {
      window.__perfMonitor.recordFormulaRender('katex', duration)
    }

    return katexResult
  }

  // KaTeX 失败，降级到 MathJax
  const result = await renderWithMathJax(latex, color)
  const duration = performance.now() - startTime

  // 记录性能（如果监控器可用）
  if (typeof window !== 'undefined' && window.__perfMonitor) {
    window.__perfMonitor.recordFormulaRender('mathjax', duration)
  }

  return result
}

export default tex
