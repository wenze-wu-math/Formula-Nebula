import { readFileSync, writeFileSync } from 'node:fs'
const p = 'src/data/proofs/batch-07.js'
let s = readFileSync(p, 'utf8')
// Undo everything: strip backslash-apostrophe.
s = s.split("\\'").join("'")
// Re-escape exactly the prime-usages that appear in the two new records.
// These are: X', Y', f', g', f'', g'', and the sub/superscripted forms.
const targets = [
  "X'", "Y'", "f'", "g'",
  "f''", "g''",
]
// Replace occurrences that occur inside $-math or as math identifiers, but NOT the
// JS string delimiters. Strategy: only replace when the prime is surrounded by
// characters that make it a math prime, i.e. immediately followed by one of , . ) ] } : space * _ ^ $ and preceded by a letter.
s = s.replace(/([A-Za-z][A-Za-z0-9_]*)((?:')+)(?=[\s,.:;)\]}^{*_$\\]|$)/g, (m, head, primes) => {
  // skip JS string ends: apostrophe immediately followed by comma+newline or by ')'
  return head + primes.split('').map(() => "\\'").join('')
})
writeFileSync(p, s)
console.log('processed', s.length)
