import { readFileSync, writeFileSync } from 'node:fs'
const p = 'src/data/proofs/batch-08.js'
let s = readFileSync(p, 'utf8')
const fields = 'title|body|statement|explanation|conclusion|history|author|url|doi'
let re = new RegExp(`(${fields}):\s*’`, 'g')
s = s.replace(re, "$1: '")
// 闭合位置：’, 之后是空格加 } 或 ] 结尾；或 ’, uses: 或 ’, author: 或 ’, year:
s = s.replace(/’,(\s*(\}|]|uses:))/g, "'$1")
writeFileSync(p, s)
