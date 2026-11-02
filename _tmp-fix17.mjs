import { readFileSync, writeFileSync } from 'node:fs'
const p = 'src/data/proofs/batch-08.js'
let s = readFileSync(p, 'utf8')
const a = '（每个局部环的 $\\operatorname{inj.dim}=$ 维数，等价地'
const b = '（每个局部环的内射维数等于它的维数，等价地'
if (!s.includes(a)) { console.error('NOT FOUND'); process.exit(1) }
s = s.split(a).join(b)
writeFileSync(p, s)
console.log('ok')
