import { readFileSync, writeFileSync } from 'node:fs'
const p = 'src/data/proofs/batch-08.js'
let s = readFileSync(p, 'utf8')
const a = '$\\operatorname{inj.dim}=$ 维数'
if (!s.includes(a)) { console.error('NOT FOUND'); process.exit(1) }
s = s.split(a).join('它的内射维数等于其维数')
writeFileSync(p, s)
const i = s.indexOf('Gorenstein（')
console.log(JSON.stringify(s.slice(i, i + 80)))
