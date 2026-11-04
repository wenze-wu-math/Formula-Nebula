import { readFileSync, writeFileSync } from 'node:fs'
const p = 'src/data/proofs/batch-08.js'
const lines = readFileSync(p, 'utf8').split('\n')
for (let i = 0; i < lines.length; i++) {
  let line = lines[i]
  line = line.replace(/(=\s*)’/g, "$1'")           // HISTORY = ’
  line = line.replace(/(:\s*)’/g, "$1'")            // key: ’
  line = line.replace(/([([]\s*)’/g, "$1'")         // ( ’ / [ ’
  // 剩余的 ’：若其后是 } ] , 或行尾 → 闭引号；否则按开引号处理（此时取下一个 紧跟内容）
  line = line.replace(/’(?=\s*[}\],])/g, "'")
  line = line.replace(/’(?=\s*$)/g, "'")
  // 还有剩余的 ’ 一律视为字符串内部的撇号，替换为 Unicode U+2019
  line = line.split('’').join('’')
  lines[i] = line
}
writeFileSync(p, lines.join('\n'))
