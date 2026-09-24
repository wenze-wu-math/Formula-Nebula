/**
 * 扫描：detail 正文与 status 字段是否自相矛盾？
 *
 * 为什么写这个：现在无法联网核对每条猜想的最新状态，
 * 但**数据内部**的矛盾是可以直接查的 —— 如果一条标着 open 的猜想，
 * 它的 detail 里却写着"已由 X 在 YYYY 年证明"，那这条几乎必然过时
 * （或者正文写错了）。这类矛盾不依赖任何外部信息。
 *
 * 反过来也查：标着 proved 的，detail 里却写着"至今未知""仍开放"。
 */
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const dir = path.resolve(import.meta.dirname, '../src/data')
const mod = await import(pathToFileURL(path.join(dir, 'conjectures.js')).href)
const { CONJECTURE_NODES } = mod

/* 表示"已解决"的措辞 */
const SOLVED = [
  /已(由|经|被)?[^。；]{0,30}证明/, /证明了/, /已解决/, /解决了/, /已成(为|立)/,
  /获证/, /已获/, /完成/, /证明了/, /答案(是|为)/,
]
/* 表示"仍未解决"的措辞 */
const UNSOLVED = [
  /仍(然)?(开|未)/, /至今(未|没有)/, /未知/, /开放/, /悬(而|置)/, /尚未/,
  /未解/, /没有(任何)?(一般|已知)?证明/, /仍是开问题/, /仍是开放/,
]

const norm = (s) => (s || '').replace(/\*\*/g, '')

console.log('=== 标 open / partial 但正文说"已证明"的 ===\n')
let n1 = 0
for (const c of CONJECTURE_NODES) {
  if (c.status !== 'open' && c.status !== 'partial') continue
  const d = norm(c.detail)
  const hits = SOLVED.filter((re) => re.test(d))
  if (!hits.length) continue
  // 排除"某特殊情形已证明"这类正常表述：看命中处附近有没有"情形/特例/部分"
  const m = d.match(/[^。；]{0,45}(已(由|经|被)?[^。；]{0,25}证明|证明了)[^。；]{0,55}/)
  const around = m ? m[0] : ''
  const qualified = /情形|特例|部分|某些|特殊|假设|条件|维数\s*[≤<]|n\s*=\s*\d|接近|方向|范围|有限/.test(around)
  console.log(`${qualified ? '·' : '★'} [${c.status}] ${c.id}`)
  console.log(`     …${around.trim()}…`)
  if (!qualified) n1++
  console.log('')
}
console.log(`其中**未加限定**（可疑）的: ${n1} 条\n`)

console.log('=== 标 proved 但正文说"仍未知/开放"的 ===\n')
let n2 = 0
for (const c of CONJECTURE_NODES) {
  if (c.status !== 'proved') continue
  const d = norm(c.detail)
  const m = d.match(/[^。；]{0,45}(仍(然)?(开|未)|至今未|未知|开放|尚未|未解|仍是开问题)[^。；]{0,55}/)
  if (!m) continue
  console.log(`★ [proved] ${c.id}`)
  console.log(`     …${m[0].trim()}…`)
  console.log('')
  n2++
}
console.log(`共 ${n2} 条\n`)

/* 顺带查：CONJECTURE_STATUS 里定义了但没有任何节点在用的状态 */
const used = {}
for (const c of CONJECTURE_NODES) used[c.status] = (used[c.status] || 0) + 1
console.log('=== 状态使用情况 ===')
for (const [k, v] of Object.entries(mod.CONJECTURE_STATUS)) {
  console.log(`  ${used[k] ? ' ' : '★'} ${k.padEnd(10)} ${String(used[k] || 0).padStart(3)} 个   ${v.name}`)
}
const unused = Object.keys(mod.CONJECTURE_STATUS).filter((k) => !used[k])
if (unused.length) console.log(`\n  ★ 定义了但没人用: ${unused.join(', ')}`)
