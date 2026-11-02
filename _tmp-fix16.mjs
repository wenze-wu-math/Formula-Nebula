import { readFileSync, writeFileSync } from 'node:fs'
const p = 'src/data/proofs/batch-08.js'
let s = readFileSync(p, 'utf8')
s = s.replace(/’\)/g, "')")          // ’)
s = s.replace(/’\]/g, "']")          // ’]
s = s.replace(/’\}/g, "'}")          // ’}
s = s.replace(/’(\s*),/g, "'$1,")    // ’, 
writeFileSync(p, s)
