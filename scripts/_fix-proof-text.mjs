/**
 * 维护脚本：批量修正证明数据里"数学段内不合 KaTeX 严格模式"的字符。
 *
 * 为什么把它留下来（而不是像其它一次性修补脚本那样删掉）：
 * 这些问题**每一位作者都会踩**，而症状是"页面上一段公式退化成灰字"，
 * 数据校验只看结构、浏览器验收只看少数几条，都不容易发现。
 * 已知的三类：
 *   ① 段内出现 U+2032（′）——KaTeX 拒绝，应写成 ASCII 撇号 '；
 *   ② 段内出现全角标点或带音标的拉丁字母（，（）é Á）——应包进 \text{...}；
 *   ③ 段内 \text{...} 里又嵌了 $...$——KaTeX 不允许嵌套，应拆开。
 *
 * 本脚本按行扫描数学段并报告（默认只报告，加 --fix 才写回）。
 *
 * 用法：node scripts/_fix-proof-text.mjs [--fix] [file...]
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs'

const fix = process.argv.includes('--fix')
const args = process.argv.slice(2).filter((a) => !a.startsWith('--'))
const files = args.length
  ? args
  : readdirSync('src/data/proofs')
    .filter((n) => n.endsWith('.js') && n !== 'index.js' && n !== 'schema.js')
    .map((n) => 'src/data/proofs/' + n)

const PRIME = '\u2032'
const BAD_TEXT = /[\u2018\u2019\u3001-\u303F\uFF00-\uFFEF\u00C0-\u024F\u1E00-\u1EFF]/g
const NESTED = /\text\{[^{}]*\$[^{}]*\$[^{}]*\}/

function segments(value) {
  // Matches the four math delimiters this project uses: $$...$$, \[...\], \(...\), $...$
  // NOTE: the literal backslash before a bracket must itself be escaped
  // (\\[ not \[), otherwise the regex engine reads `[` as the start of a
  // character class and the whole expression fails to parse.
  const re = /\$\$([\s\S]*?)\$\$|\\\[([\s\S]*?)\\\]|\\\(([\s\S]*?)\\\)|\$([^$\n]+)\$/g
  const out = []
  let m
  while ((m = re.exec(String(value)))) out.push(m[1] ?? m[2] ?? m[3] ?? m[4] ?? '')
  return out
}

let issues = 0
for (const file of files) {
  const source = readFileSync(file, 'utf8')
  const lines = source.split('\n')
  let changed = false
  const report = []
  const fixedLines = lines.map((line, idx) => {
    if (!line.includes('$')) return line
    let next = line
    for (const seg of segments(line)) {
      if (seg.includes(PRIME)) { report.push(`L${idx + 1} 段内 U+2032（应写 ASCII 撇号）`); issues++ }
      if (NESTED.test(seg)) { report.push(`L${idx + 1} \text{} 内嵌 $...$`); issues++ }
      const bad = seg.match(BAD_TEXT)
      if (bad) { report.push(`L${idx + 1} 段内出现 ${[...new Set(bad)].join('')}（应包进 \text{}）`); issues++ }
      if (fix) next = next.split(seg).join(seg.replace(PRIME, "'"))
    }
    if (next !== line) changed = true
    return next
  })
  if (report.length) { console.log(`\n${file}`); for (const r of report.slice(0, 12)) console.log('  ' + r) }
  if (fix && changed) { writeFileSync(file, fixedLines.join('\n'), 'utf8'); console.log(`  → 已替换段内 U+2032`) }
}
console.log(issues ? `\n共 ${issues} 处需要人工确认（--fix 只处理 U+2032 这一类，其余需改写措辞）` : '\n未发现段内非法字符')
