import { readFileSync, writeFileSync } from 'node:fs'
const p = 'src/data/proofs/batch-08.js'
let s = readFileSync(p, 'utf8')
const before = (s.match(/\'/g) || []).length
s = s.split("\'").join('’')
writeFileSync(p, s)
console.log('replaced escaped apostrophes:', before)
