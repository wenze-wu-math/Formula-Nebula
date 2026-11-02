import { readdirSync, readFileSync } from 'node:fs'
const bdir = 'D:/xiangmu/Formula Nebula/shots/proof-targets/batches'
const pdir = 'D:/xiangmu/Formula Nebula/src/data/proofs'
// gap file -> keys
const gap = {}
for (const f of readdirSync(bdir).filter(n => /^gap-.*\.md$/.test(n))) {
  const txt = readFileSync(`${bdir}/${f}`, 'utf8')
  gap[f] = [...txt.matchAll(/^## (.+)$/gm)].map(m => m[1].trim())
}
// batch file -> keys (the real ones, from grep)
const batches = {}
for (const f of readdirSync(pdir).filter(n => /^batch-.*\.js$/.test(n))) {
  const txt = readFileSync(`${pdir}/${f}`, 'utf8')
  batches[f] = [...txt.matchAll(/^  '([^']+)': \{$/gm)].map(m => m[1])
}
for (const [bf, keys] of Object.entries(batches)) {
  let best = '', bestN = -1
  for (const [gf, gk] of Object.entries(gap)) {
    const n = keys.filter(k => gk.includes(k)).length
    if (n > bestN) { bestN = n; best = gf }
  }
  console.log(bf.padEnd(14), 'keys=', String(keys.length).padStart(2), '| best gap:', best, bestN, '/', keys.length)
}
