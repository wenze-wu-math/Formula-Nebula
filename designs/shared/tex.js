/**
 * designs/shared/tex.js — LaTeX → 自包含 SVG（带颜色）。
 *
 * 排版逻辑取自 src/formulaTexture.js 的 latexToSvg()：同一套 MathJax 配置、
 * 同一个 FONT_SIZE、同样的 ex→px 尺寸修正。区别只有两点：
 *   · 不烘焙成 THREE 纹理（设计稿直接把 SVG 放进 DOM / <img>）
 *   · currentColor 换成调用方给的颜色，而不是固定白色
 *
 * 用法：
 *   const { svg, widthPx, heightPx } = await tex('\\chi(\\mathcal O_X)', '#ffcf7a')
 *   host.innerHTML = svg
 *
 * mathjax-full 是 CommonJS 包，由 Vite dev server 预打包后才能在浏览器里 import。
 */

import { mathjax } from 'mathjax-full/js/mathjax.js'
import { TeX } from 'mathjax-full/js/input/tex.js'
import { SVG } from 'mathjax-full/js/output/svg.js'
import { liteAdaptor } from 'mathjax-full/js/adaptors/liteAdaptor.js'
import { RegisterHTMLHandler } from 'mathjax-full/js/handlers/html.js'
import { AllPackages } from 'mathjax-full/js/input/tex/AllPackages.js'

/* ── 初始化 MathJax（模块级只做一次，与 formulaTexture.js 相同） ── */
const adaptor = liteAdaptor()
RegisterHTMLHandler(adaptor)

const texInput = new TeX({ packages: AllPackages, inlineMath: [['$', '$']] })
const svgOutput = new SVG({ fontCache: 'local' })   // 字形路径内联，SVG 自包含
const mjDoc = mathjax.document('', { InputJax: texInput, OutputJax: svgOutput })

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

/** 同步版本：LaTeX → { svg, widthPx, heightPx }。排版失败直接抛错。 */
export function texSync(latex, color = '#ffffff') {
  if (!HEX_RE.test(color)) throw new Error('tex(): color 必须是 hex，例如 #ffcf7a，收到：' + color)

  const node = mjDoc.convert(String(latex), {
    display: true,
    em: FONT_SIZE,
    ex: FONT_SIZE * 0.43,
    containerWidth: 1e6,   // 给足宽度，避免自动换行
  })

  // 必须用 innerHTML：outerHTML 带着 <mjx-container>，不是合法 SVG 根元素
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
        const k = FONT_SIZE / 1000   // viewBox 是 1000 units/em
        w = w || p[2] * k
        h = h || p[3] * k
      }
    }
  }
  if (!w || !h) throw new Error('无法确定公式尺寸：' + latex)

  // ex 换成明确的 px，避免 <img> 里 ex 按 16px 字号解析导致缩放错乱
  let fixedTag = tag
    .replace(/width\s*=\s*"[^"]*"/, `width="${w.toFixed(2)}"`)
    .replace(/height\s*=\s*"[^"]*"/, `height="${h.toFixed(2)}"`)
  if (!/xmlns=/.test(fixedTag)) {
    fixedTag = fixedTag.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"')
  }
  fixedTag = fixedTag.replace(/\sstyle\s*=\s*"[^"]*"/, '')

  svg = svg.replace(tag, () => fixedTag)
  svg = svg.replace(/currentColor/g, color)

  return { svg, widthPx: w, heightPx: h }
}

/**
 * LaTeX + 颜色 → Promise<{ svg, widthPx, heightPx }>
 * 排版本身是同步的；包成 Promise 是为了让错误统一走 reject，调用方好写。
 */
export async function tex(latex, color = '#ffffff') {
  return texSync(latex, color)
}

export default tex
