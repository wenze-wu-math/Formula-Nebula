import { readFileSync, writeFileSync } from 'node:fs'
const p = 'src/data/proofs/batch-07.js'
let s = readFileSync(p, 'utf8')
// strip all backslash-apostrophes back to plain apostrophes
s = s.split("\\'").join("'")
const idx = s.indexOf("  /* ═══════════════════════════════════════════════════════════\n   * 12.")
console.log('cut index', idx, 'len', s.length)
const head = s.slice(0, idx)
writeFileSync('_batch07_head.js', head + '\n};\n')
writeFileSync(p, head + '\n};\n')
console.log('head written', head.length)
