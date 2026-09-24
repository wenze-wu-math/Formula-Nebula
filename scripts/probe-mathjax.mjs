// 验证 MathJax SVG 输出是否自包含（字形是否已转为 path）
import { mathjax } from 'mathjax-full/js/mathjax.js'
import { TeX } from 'mathjax-full/js/input/tex.js'
import { SVG } from 'mathjax-full/js/output/svg.js'
import { liteAdaptor } from 'mathjax-full/js/adaptors/liteAdaptor.js'
import { RegisterHTMLHandler } from 'mathjax-full/js/handlers/html.js'
import { AllPackages } from 'mathjax-full/js/input/tex/AllPackages.js'

const adaptor = liteAdaptor()
RegisterHTMLHandler(adaptor)

const tex = new TeX({ packages: AllPackages })
const svg = new SVG({ fontCache: 'local' })
const doc = mathjax.document('', { InputJax: tex, OutputJax: svg })

const tests = [
  String.raw`e^{i\pi}+1=0`,
  String.raw`\int_0^\infty e^{-x^2}dx=\frac{\sqrt{\pi}}{2}`,
  String.raw`H^i(X,\mathcal F)=R^i\Gamma(X,\mathcal F)`,
  String.raw`\operatorname{Spec}:\mathbf{CRing}^{\mathrm{op}}\to\mathbf{Sch}`,
  String.raw`\nabla\times\mathbf{B}=\frac{1}{c}\frac{\partial\mathbf{E}}{\partial t}`,
  String.raw`\omega_X=\bigwedge\nolimits^{\dim X}\Omega^1_{X/k}`,
]

for (const t of tests) {
  const node = doc.convert(t, { display: true, em: 64, ex: 27, containerWidth: 1e6 })
  const out = adaptor.outerHTML(node)
  const pathCount = (out.match(/<path/g) || []).length
  const useCount = (out.match(/<use/g) || []).length
  const hasFont = /font-family|<text/i.test(out)
  const tag = out.match(/<svg[^>]*>/)[0]
  console.log('─'.repeat(70))
  console.log('LATEX :', t)
  console.log('  path 数:', pathCount, '| use 数:', useCount, '| 含 font/text:', hasFont)
  console.log('  svg 标签:', tag.slice(0, 220))
  console.log('  长度:', out.length)
}
