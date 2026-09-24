// 确认 <use> 引用的 <defs> 在同一 SVG 文档内；对比 fontCache 模式
import { mathjax } from 'mathjax-full/js/mathjax.js'
import { TeX } from 'mathjax-full/js/input/tex.js'
import { SVG } from 'mathjax-full/js/output/svg.js'
import { liteAdaptor } from 'mathjax-full/js/adaptors/liteAdaptor.js'
import { RegisterHTMLHandler } from 'mathjax-full/js/handlers/html.js'
import { AllPackages } from 'mathjax-full/js/input/tex/AllPackages.js'

const adaptor = liteAdaptor()
RegisterHTMLHandler(adaptor)
const tex = new TeX({ packages: AllPackages })

const CASES = [
  String.raw`e^{i\pi}+1=0`,
  String.raw`\int_0^\infty e^{-x^2}dx=\frac{\sqrt{\pi}}{2}`,
  String.raw`\operatorname{Spec}:\mathbf{CRing}^{\mathrm{op}}\to\mathbf{Sch}`,
]

for (const mode of ['local', 'none']) {
  const svgOut = new SVG({ fontCache: mode })
  const doc = mathjax.document('', { InputJax: tex, OutputJax: svgOut })
  console.log('='.repeat(72))
  console.log('fontCache =', mode)
  for (const t of CASES) {
    const node = doc.convert(t, { display: true, em: 64, ex: 27, containerWidth: 1e6 })
    const out = adaptor.outerHTML(node)
    const defs = (out.match(/<defs/g) || []).length
    const uses = [...out.matchAll(/<use[^>]*xlink:href="#([^"]+)"/g)].map(m => m[1])
    const defIds = [...out.matchAll(/<path[^>]*id="([^"]+)"/g)].map(m => m[1])
    const missing = uses.filter(u => !defIds.includes(u))
    console.log('  ', t.slice(0, 42).padEnd(44),
      'len=' + String(out.length).padEnd(7),
      'defs=' + defs,
      'use=' + uses.length,
      'missingRefs=' + missing.length)
    if (missing.length) console.log('      !! 未解析引用:', missing.slice(0, 3))
  }
}

// 检查同一次会话里不同公式是否复用相同 id（跨 blob 无影响，但确认一下）
const svgOut = new SVG({ fontCache: 'local' })
const doc = mathjax.document('', { InputJax: tex, OutputJax: svgOut })
const a = adaptor.outerHTML(doc.convert(CASES[0], { display: true, em: 64, ex: 27, containerWidth: 1e6 }))
const b = adaptor.outerHTML(doc.convert(CASES[0], { display: true, em: 64, ex: 27, containerWidth: 1e6 }))
const idsA = [...a.matchAll(/id="([^"]+)"/g)].map(m => m[1]).sort().join(',')
const idsB = [...b.matchAll(/id="([^"]+)"/g)].map(m => m[1]).sort().join(',')
console.log('='.repeat(72))
console.log('同公式两次转换 id 集合相同:', idsA === idsB)
console.log('样例 id:', idsA.split(',').slice(0, 4).join(' | '))
