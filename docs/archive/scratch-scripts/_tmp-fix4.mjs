import { readFileSync, writeFileSync } from 'node:fs'
const p = 'src/data/proofs/batch-08.js'
let s = readFileSync(p, 'utf8')
// 字段名定界符
s = s.replace(/(^\s*)(statement|explanation|conclusion|history|remarks|examples|references|dependencies|consequences|corollaries|title|body|uses|author|year|url|doi|name|value|id):\s*’/gm, "$1$2: '")
s = s.replace(/(^\s*)(statement|explanation|conclusion|history):\s*([\s\S]*?)’,\s*$/gm, "$1$2: '$3',")
writeFileSync(p, s)
