import { readdirSync } from 'node:fs'
import { join, resolve, dirname } from 'node:path'
import { pathToFileURL, fileURLToPath } from 'node:url'
const dir = resolve('D:/xiangmu/Formula Nebula/src/data/proofs')
const all = new Map()
for (const name of readdirSync(dir).filter(n => n.endsWith('.js') && n !== 'index.js' && n !== 'schema.js').sort()) {
  const mod = await import(pathToFileURL(join(dir, name)).href)
  for (const [en, v] of Object.entries(mod)) {
    if (!/PROOFS$/.test(en) || typeof v !== 'object' || Array.isArray(v)) continue
    const keys = Object.keys(v)
    for (const k of keys) {
      if (all.has(k)) console.log('DUP', k, all.get(k), name)
      all.set(k, name)
    }
    console.log(String(name).padEnd(22), keys.length, keys.join(','))
  }
}
console.log('\nTOTAL KEYS', all.size)
for (const want of ['descent','ruled-surface','rational-surface','del-pezzo','grothendieck-topology','iitaka-fibration','canonical-model','flop','kahler-manifold','hodge-decomposition','theta-functions','neron-severi','modular-curve']) {
  console.log(all.has(want) ? 'COVERED  ' + all.get(want) : 'MISSING  ', want)
}
