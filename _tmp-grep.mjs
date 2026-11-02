import { readFileSync } from 'node:fs'
const all = JSON.parse(readFileSync('_tmp-nodes.json','utf8'))
const kw = process.argv[2] ? new RegExp(process.argv[2],'i') : null
for (const n of all) {
  if (kw && !kw.test(n.id + ' ' + (n.name||'') + ' ' + (n.en||''))) continue
  console.log(`${n.id} | ${n.name} | ${n.en} | ${n.family||n.field||''}`)
}
