import { readFileSync, writeFileSync } from 'node:fs'
const p = 'src/data/proofs/batch-08.js'
const lines = readFileSync(p, 'utf8').split('\n')
const fields = ['title','body','statement','explanation','conclusion','history','author','url','doi','uses']
for (let i = 0; i < lines.length; i++) {
  let line = lines[i]
  // 先把字符串内部的误转义撇号还原为 Unicode 右单引号（安全字符，不会破坏 JS 字符串）
  line = line.split("\'").join('’')
  // 再把字段值开头的 ’ 换成标准单引号
  for (const f of fields) {
    line = line.replace(new RegExp(`(${f}):\s*’`, 'g'), `$1: '`)
  }
  lines[i] = line
}
writeFileSync(p, lines.join('\n'))
