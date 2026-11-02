import { readFileSync, writeFileSync } from 'node:fs'
const p = 'src/data/proofs/batch-08.js'
let lines = readFileSync(p, 'utf8').split('\n')
const fields = ['title','body','statement','explanation','conclusion','history','author','url','doi']
let fixed = 0
for (let i = 0; i < lines.length; i++) {
  const orig = lines[i]
  // 逐个字段：FIELD: ’ ... ’ 且结尾是 ' 或 , 前
  let line = lines[i]
  for (const f of fields) {
    const re = new RegExp(`(${f}):\s*’`, 'g')
    line = line.replace(re, `$1: '`)
  }
  // 剩余的所有 ’ 一律当作闭合定界符（行内已完成替换后，剩下的不可能是开定界符）
  line = line.split('’').join("'")
  if (line !== orig) fixed++
  lines[i] = line
}
writeFileSync(p, lines.join('\n'))
console.log('lines touched:', fixed)
