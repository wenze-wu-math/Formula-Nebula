import { readFileSync } from 'node:fs'
const all = JSON.parse(readFileSync('_tmp-nodes.json','utf8'))
const want = new Set(process.argv.slice(2))
for (const n of all) if (want.has(n.id)) console.log(`### ${n.id} | ${n.name} | ${n.en}\nlatex: ${n.latex||''}\n${n.summary||''}\n${n.detail||''}\n`)
