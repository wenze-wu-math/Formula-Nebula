import { readFileSync, writeFileSync } from 'node:fs'
const p = 'src/data/proofs/batch-08.js'
let lines = readFileSync(p, 'utf8').split('\n')
for (let i = 0; i < lines.length; i++) {
  let line = lines[i]
  // 通用：字段冒号后的 ’ 作为开引号
  line = line.replace(/([:,([]\s*)’/g, "$1'")
  // 通用：紧跟 } ] , 或行尾（可能带空格）的 ’ 作为闭引号
  line = line.replace(/’(\s*[}\],])/g, "'$1")
  line = line.replace(/’(\s*)$/g, "'$1")
  line = line.replace(/’(\s*,)/g, "'$1")
  line = line.replace(/,(\s*)’/g, ",'$1")
  lines[i] = line
}
writeFileSync(p, lines.join('\n'))
