const nodeModules = [
  './src/data/knowledge.js', './src/data/extra-a.js', './src/data/extra-b.js',
  './src/data/extra-c.js', './src/data/extra-d.js', './src/data/extra-e.js',
  './src/data/extra-f.js', './src/data/extra-g.js', './src/data/extra-h.js',
  './src/data/conjectures.js',
]
const ids = new Set()
for (const m of nodeModules) {
  const mod = await import(m)
  for (const v of Object.values(mod)) {
    if (!Array.isArray(v)) continue
    for (const n of v) if (n?.id) ids.add(n.id)
  }
}
const want = ['a-cartier-divisor','a-ample','a-line-bundle-degree','a-verdier-duality','a-dualizing-complex','a-stein-factorization','b-canonical-embedding','b-hyperelliptic','b-weil-pairing','b-tate-module','b-mordell-weil','b-elliptic-integral','b-chow-variety']
for (const w of want) console.log(w, ids.has(w) ? 'OK' : 'MISSING')
console.log('---total ids---', ids.size)
const related = [...ids].filter(i => /cartier|ample|deg|dual|stein|canonical|hyperell|weil|tate|mordell|elliptic|chow|divisor|serre|riemann|jacob|picard|proj|embed/i.test(i)).sort()
console.log(related.join('\n'))
