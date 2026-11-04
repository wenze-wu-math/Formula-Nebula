import { pathToFileURL } from 'node:url'
const base = 'D:/xiangmu/Formula Nebula/src/data/'
const names = ['knowledge.js','extra-a.js','extra-b.js','extra-c.js','extra-d.js','extra-e.js','extra-f.js','extra-g.js','extra-h.js','conjectures.js']
const ids = new Set()
for (const n of names) {
  try {
    const mod = await import(pathToFileURL(base + n).href)
    for (const v of Object.values(mod)) if (Array.isArray(v)) for (const x of v) if (x?.id) ids.add(x.id)
  } catch (e) { console.log('IMPORT FAIL', n, e.message) }
}
const want = ['iitaka-fibration','canonical-model','flop','kahler-manifold','hodge-decomposition','theta-functions','neron-severi','modular-curve']
for (const w of want) console.log((ids.has(w) ? 'OK   ' : 'MISS '), w)
console.log('total node ids:', ids.size)
