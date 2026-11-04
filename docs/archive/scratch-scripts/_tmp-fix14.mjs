import { readFileSync, writeFileSync } from 'node:fs'
const p = 'src/data/proofs/batch-08.js'
let s = readFileSync(p, 'utf8')
// 对象键：行首 ’xxx’:
s = s.replace(/^(\s*)’([A-Za-z0-9._-]+)’(\s*:)/gm, "$1'$2'$3")
// 顶层键：  ’xxx’: {
writeFileSync(p, s)
