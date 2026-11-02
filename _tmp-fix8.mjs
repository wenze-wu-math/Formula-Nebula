import { readFileSync, writeFileSync } from 'node:fs'
const p = 'src/data/proofs/batch-08.js'
let s = readFileSync(p, 'utf8')
const before = (s.match(/\'/g) || []).length
s = s.split("\'").join('’')   // 现在字符串内部的 ’ 是被误转义的撇号，恢复
writeFileSync(p, s)
console.log('restored apostrophes:', before)
