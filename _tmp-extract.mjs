const nodeModules = [
  './src/data/knowledge.js', './src/data/extra-a.js', './src/data/extra-b.js',
  './src/data/extra-c.js', './src/data/extra-d.js', './src/data/extra-e.js',
  './src/data/extra-f.js', './src/data/extra-g.js', './src/data/extra-h.js',
  './src/data/conjectures.js',
]
const all = []
for (const m of nodeModules) {
  const mod = await import(m)
  for (const v of Object.values(mod)) {
    if (!Array.isArray(v)) continue
    for (const n of v) if (n?.id) all.push(n)
  }
}
const want = new Set(['a-cartier-divisor','a-ample','a-line-bundle-degree','a-verdier-duality','a-dualizing-complex','a-stein-factorization','b-canonical-embedding','b-hyperelliptic','b-weil-pairing','b-tate-module','b-mordell-weil','b-elliptic-integral','b-chow-variety','divisor','serre-duality','b-riemann-roch-curve','b-serre-duality-curve','ample-line-bundle','b-picard-group','jacobian','elliptic-curve','canonical-sheaf','b-coherent-duality','serre-vanishing','e-ample-vanishing','cn-jacobian','b-chern-weil','riemann-roch','h-stein-factorization','g-stein-factorization-technique'])
for (const n of all) if (want.has(n.id)) console.log(JSON.stringify(n).slice(0,600))
