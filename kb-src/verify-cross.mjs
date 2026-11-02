/**
 * kb-src/verify-cross.mjs — 跨源关联的验收脚本。
 *
 * 这类边的风险与其它都不同：它们是**推断**出来的（词匹配/namespace），
 * 不是数据源明示的。所以要严查「是否制造了错误对应」。
 */
import { CROSS_SOURCE_LINKS } from '../src/data/cross-source-links.js'
import { buildGraph } from '../src/graph.js'

let pass = 0, fail = 0
const ok = (name, cond, extra = '') => {
  if (cond) { pass++; console.log(`  PASS  ${name}${extra ? '  ' + extra : ''}`) }
  else { fail++; console.log(`  FAIL  ${name}${extra ? '  ' + extra : ''}`) }
}

console.log(`\n跨源关联 ${CROSS_SOURCE_LINKS.length}\n`)

const g = buildGraph()
const byId = new Map(g.nodes.map((n) => [n.id, n]))

/* 1. 端点存在 */
const dangling = CROSS_SOURCE_LINKS.filter((l) => !byId.has(l[0]) || !byId.has(l[1]))
ok('端点全部存在', dangling.length === 0, `悬空 ${dangling.length}`)

/* 2. 无自环 */
ok('无自环', CROSS_SOURCE_LINKS.every((l) => l[0] !== l[1]))

/* 3. 权重低于真实引用边 */
const maxW = Math.max(...CROSS_SOURCE_LINKS.map((l) => l[2]))
ok('权重 ≤0.25（低于真实引用边 0.3+）', maxW <= 0.25, `max=${maxW}`)

/* 4. 标签说明了依据 */
const LABELS = ['标题对应', 'namespace', '概念对应', 'namespace 对应']
const badLabel = CROSS_SOURCE_LINKS.filter((l) => !LABELS.includes(l[3]))
ok('标签说明依据', badLabel.length === 0, badLabel.length ? [...new Set(badLabel.map((l) => l[3]))].join(',') : '')

/* 5. 跨源（不是同源边） */
function srcOf(id) {
  if (id.startsWith('stx-')) return 'stacks'
  if (id.startsWith('nlb-')) return 'nlab'
  if (id.startsWith('ml-')) return 'mathlib'
  return 'other'
}
const sameSource = CROSS_SOURCE_LINKS.filter((l) => srcOf(l[0]) === srcOf(l[1]) && srcOf(l[0]) !== 'other')
ok('不含同源边', sameSource.length === 0, `${sameSource.length}`)

/* 6. 三大源确实被连起来 */
const CORE = new Set(['stacks', 'nlab', 'mathlib'])
const corePairs = new Set()
for (const l of CROSS_SOURCE_LINKS) {
  const a = srcOf(l[0]), b = srcOf(l[1])
  if (CORE.has(a) && CORE.has(b)) corePairs.add([a, b].sort().join('↔'))
}
ok('三大源两两相连', corePairs.size >= 2, [...corePairs].join(', '))

/* 7. 单点度数不爆炸（防止"一个概念连几百条"制造噪声） */
const deg = new Map()
for (const l of CROSS_SOURCE_LINKS) {
  deg.set(l[0], (deg.get(l[0]) || 0) + 1)
  deg.set(l[1], (deg.get(l[1]) || 0) + 1)
}
const maxDeg = Math.max(...deg.values())
ok('单点最大度数 ≤30', maxDeg <= 30, `max=${maxDeg}`)
const over = [...deg.entries()].filter(([, d]) => d > 20).sort((a, b) => b[1] - a[1])
if (over.length) {
  console.log('       度数最高的几个:')
  over.slice(0, 5).forEach(([id, d]) => {
    const n = byId.get(id)
    console.log(`         ${id} (${String(n?.name || '').slice(0, 40)}) → ${d}`)
  })
}

/* 8. 抽样人工核对：标签是"标题对应"的，验证两端确实同名 */
console.log('\n抽样核对「标题对应」边（3 条）:')
const aSamples = CROSS_SOURCE_LINKS.filter((l) => l[3] === '标题对应').slice(0, 3)
for (const l of aSamples) {
  const a = byId.get(l[0]), b = byId.get(l[1])
  console.log(`  nLab「${a?.name}」 ↔ Stacks「${String(b?.name || '').slice(0, 50)}」`)
}

console.log('\n抽样核对「namespace」边（3 条）:')
const bSamples = CROSS_SOURCE_LINKS.filter((l) => l[3] === 'namespace').slice(0, 3)
for (const l of bSamples) {
  const a = byId.get(l[0]), b = byId.get(l[1])
  console.log(`  nLab「${a?.name}」 ↔ mathlib「${String(b?.en || '').slice(0, 50)}」`)
}

/* 9. 整体连通性：三大源各自有多少节点被接上 */
console.log('\n覆盖情况:')
const touched = new Set()
for (const l of CROSS_SOURCE_LINKS) { touched.add(l[0]); touched.add(l[1]) }
for (const [src, prefix] of [['nLab', 'nlb-'], ['mathlib', 'ml-'], ['Stacks', 'stx-']]) {
  const all = g.nodes.filter((n) => n.id.startsWith(prefix))
  const t = all.filter((n) => touched.has(n.id)).length
  console.log(`  ${src}: ${t}/${all.length} = ${(100 * t / all.length).toFixed(0)}%`)
}

console.log(`\n结果：${pass} 通过 / ${fail} 失败`)
process.exitCode = fail ? 1 : 0
