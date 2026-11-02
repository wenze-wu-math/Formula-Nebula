import { readFileSync, writeFileSync } from 'node:fs'
const p = 'src/data/proofs/batch-08.js'
let lines = readFileSync(p, 'utf8').split('\n')
const fields = ['title','body','statement','explanation','conclusion','history','author','url','doi','uses']
let n = 0
for (let i = 0; i < lines.length; i++) {
  const orig = lines[i]
  let line = lines[i]
  for (const f of fields) {
    line = line.replace(new RegExp(`(${f}):\s*’`, 'g'), `$1: '`)
  }
  line = line.split('’').join("'")
  if (line !== orig) n++
  lines[i] = line
}
writeFileSync(p, lines.join('\n'))
console.log('lines touched:', n)
