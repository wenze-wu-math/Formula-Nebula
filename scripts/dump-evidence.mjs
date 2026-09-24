/**
 * 抽取单条猜想的完整证据：本地字段 + 抓到的维基句子。
 *
 * 用途：在决定改 status 之前，把"本地怎么写的"和"外部怎么说的"并排看。
 * 用法: node scripts/dump-evidence.mjs cn-jacobian cn-navier-stokes ...
 */
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const ROOT = path.resolve(import.meta.dirname, '..')
const raw = JSON.parse(readFileSync(path.join(ROOT, '.research/raw.json'), 'utf8'))
const mod = await import(pathToFileURL(path.join(ROOT, 'src/data/conjectures.js')).href)
const byId = new Map(mod.CONJECTURE_NODES.map((n) => [n.id, n]))

const ids = process.argv.slice(2)
if (!ids.length) { console.error('用法: node scripts/dump-evidence.mjs <id> [...]'); process.exit(1) }

const KEY = /(202[4-9]|proved|proof|disprov|counterexample|remains? open|unsolved|still open|no proof|verified|announced|claimed|accepted|refuted|retracted)/i

for (const id of ids) {
  const n = byId.get(id)
  const v = raw[id]
  console.log('\n' + '='.repeat(78))
  console.log(`## ${id}   [status = ${n?.status}]  ${n?.name} / ${n?.en}`)
  console.log('='.repeat(78))
  console.log(`本地 summary: ${n?.summary}`)
  console.log(`本地 detail : ${n?.detail}`)
  console.log(`\n维基条目: ${v?.resolved || '(没抓到)'}`)
  if (v?.text) {
    const ss = v.text.replace(/\s+/g, ' ').split(/(?<=[.!?])\s+(?=[A-Z(])/).filter((s) => s.length > 40 && s.length < 800)
    const hits = ss.filter((s) => KEY.test(s))
    console.log(`命中关键句 ${hits.length} 条（取前 12）:`)
    for (const s of hits.slice(0, 12)) console.log('  * ' + s.trim())
  }
}
