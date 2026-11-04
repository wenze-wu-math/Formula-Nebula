import { readFileSync, writeFileSync } from 'node:fs'
const p = 'src/data/proofs/batch-08.js'
let s = readFileSync(p, 'utf8')
const fields = 'title|body|statement|explanation|conclusion|history|author|url|doi|uses'
const re = new RegExp(`(${fields}):\s*’`, 'g')
s = s.replace(re, "$1: '")
// 闭合：’, 或 ’ }, 或 ’ ],
s = s.replace(/’,(\s*\}\s*,?)/g, "'$1")
s = s.replace(/’(\s*\},?\s*)$/gm, "'$1")
s = s.replace(/’(\s*\],?\s*)$/gm, "'$1")
writeFileSync(p, s)
