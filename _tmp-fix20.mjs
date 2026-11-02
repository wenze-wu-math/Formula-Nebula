import { readFileSync, writeFileSync } from 'node:fs'
const p = 'src/data/proofs/batch-08.js'
let lines = readFileSync(p, 'utf8').split('\n')
let n = 0
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('Gorenstein（') && lines[i].includes('维数，等价地每个局部环是 CM')) {
    lines[i] = lines[i].replace('每个局部环的 $\operatorname{inj.dim}=$ 维数，等价地每个局部环是 CM',
      '每个局部环的内射维数等于它的维数，等价地每个局部环是 CM')
    n++
  }
}
writeFileSync(p, lines.join('\n'))
console.log('replaced on lines:', n)
