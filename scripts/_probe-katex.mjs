/**
 * 探针：确认 proofView / verify-proofs 使用的 KaTeX 严格模式下
 * 哪些写法可以通过。只读，不改文件。
 * 用法：node scripts/_probe-katex.mjs
 */
import katex from 'katex'

const samples = [
  'x^2+1',
  'R \\to S',
  '\\mathfrak{p} \\cap S = \\emptyset',
  '\\operatorname{Spec}(R)',
  '\\text{中文}',
  '\\text{ 中文 }',
  '\\text{中文，标点}',
  'A \\otimes_R B',
  'H^i(X, \\mathcal{F})',
  '\\ell(D) - \\ell(K-D)',
  '\\deg D + 1 - g',
  '\\Omega_{B/A}',
  '\\operatorname{Hom}_B(\\Omega_{B/A}, M)',
  '\\sqrt{J}',
  '\\mathbf{P}^n_k',
  '\\mathbb{P}^n_k',
  'x_1,\\ldots,x_n',
  'M \\neq 0',
  '\\mathfrak{m}^{2^n}',
  'f^{\\prime}(a)',
  "f'(a)",
  '\\bar{k}',
  'k\\text{-}algebra',
  '\\varphi',
  '\\Longleftrightarrow',
  '\\Longrightarrow',
  '\\Rightarrow',
  '\\subset',
  '\\subseteq',
  '\\sum_{i} r_i a_i',
  '\\bigcap_i Q_i',
  '\\dim X = \\dim Y + \\dim X_\\eta',
  'X_\\eta',
  '\\mathcal{O}_X(d)',
  '\\mathcal{C}^p(\\mathcal{U}, \\mathcal{F})',
  '\\check{H}^p',
  '\\check{C}',
  '\\v{C}',
  '\\mathrm{trdeg}',
  '\\operatorname{trdeg}',
  '\\mathrm{Frac}',
  '\\operatorname{Frac}',
  'S^{-1}R',
  '\\ell',
  '\\ell(D)',
  '\\ne',
  '\\colon',
  '\\mid',
  '\\setminus',
  '\\mapsto',
  '2g_X - 2 = n(2g_Y-2) + \\deg R',
  '\\mathbb{Z}_p',
  '\\varprojlim',
  '\\mathfrak{a}',
  '\\\\',
  '%',
  '\\%',
  '#',
  '\\#',
  '&',
  '\\&',
  '_',
  '\\_',
  'A \\to B \\to C',
  '\\alpha \\equiv a \\pmod{\\mathfrak{m}}',
  '\\pmod{m}',
  '\\bmod',
  '\\deg',
  '\\operatorname{Jac}',
  '\\mathcal{F}\\text{-module}',
  'x \\in \\mathfrak{p}',
  'I \\subsetneq J',
  '\\subsetneq',
  '\\nsubseteq',
  '\\ncong',
  '\\cong',
  '\\simeq',
  '\\to',
  '\\hookrightarrow',
  '\\twoheadrightarrow',
  '\\xrightarrow{f}',
  '\\overset{f}{\\longrightarrow}',
]

let pass = 0
for (const sample of samples) {
  try {
    katex.renderToString(sample, { throwOnError: true, strict: 'error', trust: false })
    pass++
    console.log(`ok    ${JSON.stringify(sample)}`)
  } catch (error) {
    console.log(`FAIL  ${JSON.stringify(sample)}  ->  ${error.message.replace(/\s+/g, ' ').slice(0, 110)}`)
  }
}
console.log(`\n${pass} / ${samples.length} 通过（strict: 'error'）`)
