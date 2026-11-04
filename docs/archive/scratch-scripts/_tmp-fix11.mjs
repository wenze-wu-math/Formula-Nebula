import { readFileSync, writeFileSync } from 'node:fs'
const p = 'src/data/proofs/batch-08.js'
let s = readFileSync(p, 'utf8')
s = s.replace(/, author: ’/g, ", author: '").replace(/, url: ’/g, ", url: '")
s = s.replace(/’The Stacks Project’/g, "'The Stacks Project'")
s = s.replace(/’(\s*\})/g, "'$1").replace(/’(\s*\],)/g, "'$1")
// 结尾处的闭合：
s = s.replace(/’, year/g, "', year")
writeFileSync(p, s)
