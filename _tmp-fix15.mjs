import { readFileSync, writeFileSync } from 'node:fs'
const p = 'src/data/proofs/batch-08.js'
let lines = readFileSync(p, 'utf8').split('\n')
for (let i = 0; i < lines.length; i++) {
  let line = lines[i]
  // 数组元素/调用参数： 行首（缩进后）直接是 ’
  line = line.replace(/^(\s*)’/, "$1'")
  lines[i] = line
}
writeFileSync(p, lines.join('\n'))
