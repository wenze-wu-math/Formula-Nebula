/**
 * 诊断脚本（只读）：把**节点字段**（latex / summary / detail）当作
 * proofView 会渲染的那样送进 KaTeX，找出会退化成 .pv-plain 的段。
 *
 * 为什么单独查节点字段：proofView 在 proof.statement 之外还会渲染
 *   · node.latex —— 整段当作 display 公式（appendProofText 的 looksLikeLatex 分支）
 *   · node.summary / node.detail —— 走普通富文本路径
 * 这些字段不归 src/data/proofs 管，逐文件检查器看不到它们，
 * 但它们照样出现在证明页上，KaTeX 一旦拒绝就会留下灰色的原文。
 *
 * 用法：node scripts/_find-plain-node-math.mjs [nodeId ...]
 */
import katex from 'katex'

const nodeModules = [
  '../src/data/knowledge.js', '../src/data/extra-a.js', '../src/data/extra-b.js',
  '../src/data/extra-c.js', '../src/data/extra-d.js', '../src/data/extra-e.js',
  '../src/data/extra-f.js', '../src/data/extra-g.js', '../src/data/extra-h.js',
  '../src/data/conjectures.js',
]
const nodes = new Map()
for (const modulePath of nodeModules) {
  const mod = await import(modulePath)
  for (const value of Object.values(mod)) {
    if (!Array.isArray(value)) continue
    for (const node of value) if (node?.id) nodes.set(node.id, node)
  }
}

const { PROOFS } = await import('../src/data/proofs/index.js')
const requested = process.argv.slice(2)
// 默认只查有证明页的节点：那才是证明页实际会渲染的集合。
const ids = requested.length ? requested : Object.keys(PROOFS)

// 与 proofView.appendRichText 一致的分隔符扫描。
function mathSegments(value) {
  const source = String(value)
  const out = []
  let cursor = 0
  while (cursor < source.length) {
    if (source[cursor] === '\\' && (source.startsWith('\\[', cursor) || source.startsWith('\\(', cursor))) {
      const close = source.startsWith('\\[', cursor) ? '\\]' : '\\)'
      const end = source.indexOf(close, cursor + 2)
      if (end < 0) break
      out.push({ tex: source.slice(cursor + 2, end), display: true })
      cursor = end + 2
      continue
    }
    if (source[cursor] !== '$') { cursor++; continue }
    const display = source.startsWith('$$', cursor)
    const open = display ? '$$' : '$'
    if (!display && /\s/.test(source[cursor + 1] || '')) { cursor++; continue }
    const end = source.indexOf(open, cursor + open.length)
    if (end < 0) { cursor++; continue }
    out.push({ tex: source.slice(cursor + open.length, end), display })
    cursor = end + open.length
  }
  return out
}

// 与 proofView.appendProofText 一致：无分隔符但有这些命令 → 整段当公式。
const LOOKS_LATEX = /\\(?:text|boxed|mathfrak|mathbb|mathrm|operatorname|sqrt|frac|forall|exists|subset|supset|begin|end|bigcup|bigcap|cap|cup|ker|mapsto|Rightarrow|Longrightarrow|cdot|times|le|ge|neq)\b/

let failures = 0
for (const id of ids) {
  const node = nodes.get(id)
  if (!node) continue
  const fields = [['latex', node.latex], ['summary', node.summary], ['detail', node.detail]]
  for (const [field, value] of fields) {
    if (typeof value !== 'string' || !value) continue
    const segments = mathSegments(value)
    const whole = !segments.length && LOOKS_LATEX.test(value)
    const candidates = whole ? [{ tex: value.trim(), display: true, whole: true }] : segments
    for (const segment of candidates) {
      try {
        katex.renderToString(segment.tex, {
          displayMode: segment.display, throwOnError: true, trust: false, strict: false,
        })
      } catch (error) {
        failures++
        console.log(`${id.padEnd(22)} ${field.padEnd(8)} ${segment.whole ? '整段公式' : '分隔段'} → KaTeX 失败`)
        console.log(`   ${JSON.stringify(segment.tex)}`)
        console.log(`   ${error.message.split('\n')[0].slice(0, 160)}`)
      }
    }
  }
}
console.log(failures
  ? `\n共 ${failures} 处节点字段会在证明页退化成 .pv-plain`
  : `\n已检查 ${ids.length} 个节点的 latex/summary/detail，未发现 KaTeX 失败`)
