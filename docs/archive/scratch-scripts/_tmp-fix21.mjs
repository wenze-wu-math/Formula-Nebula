import { readFileSync, writeFileSync } from 'node:fs'
const p = 'src/data/proofs/batch-08.js'
const lines = readFileSync(p, 'utf8').split('\n')
for (let i = 0; i < lines.length; i++) {
  const k = lines[i].indexOf('Gorenstein（')
  if (k < 0) continue
  console.log('line', i + 1, JSON.stringify(lines[i].slice(k, k + 90)))
}
