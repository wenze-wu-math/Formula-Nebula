import { readFileSync, writeFileSync } from 'node:fs'
const p = 'src/data/proofs/batch-08.js'
let s = readFileSync(p, 'utf8')
// 行首（可能有空格）的 ’xxx’: 是对象键的定界符
s = s.replace(/(^\s*)’([A-Za-z0-9_-]+)’(\s*:)/gm, "$1'$2'$3")
writeFileSync(p, s)
