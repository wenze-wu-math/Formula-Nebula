/**
 * 去除数据文件中方向相反/完全重复的连线（保留权重较大的那条）。
 * 用法: node scripts/dedupe-links.mjs <文件...>
 */
import { readFileSync, writeFileSync } from 'node:fs'

const files = process.argv.slice(2)
if (!files.length) { console.log('用法: node scripts/dedupe-links.mjs <文件...>'); process.exit(1) }

let totalDropped = 0
for (const p of files) {
  const lines = readFileSync(p, 'utf8').split('\n')
  const re = /^\s*\['([^']+)',\s*'([^']+)',\s*([\d.]+),/
  const entries = []
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(re)
    if (m) entries.push({ i, a: m[1], b: m[2], w: parseFloat(m[3]) })
  }
  // 同一条无向边保留权重最大者；权重相同保留最先出现者
  const best = new Map()
  for (const e of entries) {
    const k = e.a < e.b ? `${e.a}|${e.b}` : `${e.b}|${e.a}`
    const cur = best.get(k)
    if (!cur || e.w > cur.w) best.set(k, e)
  }
  const keep = new Set([...best.values()].map(e => e.i))
  const drop = entries.filter(e => !keep.has(e.i))
  if (!drop.length) { console.log(`${p}: 无重复`); continue }

  for (const d of drop) console.log(`  ${p}: 删 ${d.a} | ${d.b}  w=${d.w}`)
  const keepIdx = new Set(drop.map(d => d.i))
  writeFileSync(p, lines.filter((_, i) => !keepIdx.has(i)).join('\n'))
  console.log(`${p}: 删除 ${drop.length} 条重复连线（原有 ${entries.length}，保留 ${keep.size}）`)
  totalDropped += drop.length
}
console.log(`\n合计删除 ${totalDropped} 条`)
