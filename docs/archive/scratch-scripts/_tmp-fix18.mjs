import { readFileSync, writeFileSync } from 'node:fs'
const p = 'src/data/proofs/batch-08.js'
let s = readFileSync(p, 'utf8')
const idx = s.indexOf('operatorname{inj.dim}')
console.log(JSON.stringify(s.slice(idx - 30, idx + 40)))
const a = s.slice(idx - 12, idx + 22)
s = s.replace(a, '内射维数等于它的维数，等价地')
writeFileSync(p, s)
