import { readFileSync, writeFileSync } from 'node:fs'
const nodeModules = [
  './src/data/knowledge.js', './src/data/extra-a.js', './src/data/extra-b.js',
  './src/data/extra-c.js', './src/data/extra-d.js', './src/data/extra-e.js',
  './src/data/extra-f.js', './src/data/extra-g.js', './src/data/extra-h.js',
  './src/data/conjectures.js',
]
const all = []
const seen = new Set()
for (const m of nodeModules) {
  const mod = await import(m)
  for (const v of Object.values(mod)) {
    if (!Array.isArray(v)) continue
    for (const n of v) if (n?.id && !seen.has(n.id)) { seen.add(n.id); all.push(n) }
  }
}
writeFileSync('_tmp-nodes.json', JSON.stringify(all, null, 1))
console.log('written', all.length)
