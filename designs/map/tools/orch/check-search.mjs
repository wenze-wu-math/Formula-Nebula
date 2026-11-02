/**
 * tools/orch/check-search.mjs — search.js 的 Node 断言（编排模块）。
 * 运行：cd "/d/xiangmu/Formula Nebula" && node designs/map/tools/orch/check-search.mjs
 */
import { getGraph } from '../../../shared/kb.js'
import { searchNodes, normalize, isAdvancedQuery } from '../../src/search.js'

const g = getGraph()
let fails = 0
const ok = (cond, msg) => { if (!cond) { fails++; console.error('✗', msg) } else console.log('✓', msg) }

// 1) Hodge
const h = searchNodes(g, 'Hodge')
const top = h.slice(0, 8).map((r) => r.id)
ok(h.some((r) => r.id === 'cn-hodge'), `'Hodge' 命中含 cn-hodge（共 ${h.length}）`)
ok(top.indexOf('cn-hodge') >= 0 && top.indexOf('cn-hodge') < 3, `'Hodge' 前 3 含 cn-hodge：${top.slice(0, 5).join(', ')}`)
ok(h.every((r, i) => i === 0 || h[i - 1].score >= r.score), `'Hodge' 按 score 降序`)
// 前缀命中应排在纯子串命中之前：p-adic Hodge 理论（子串/词首）不应排在 Hodge 猜想（前缀）之前
const iPad = h.findIndex((r) => r.id === 'c-padic-hodge'), iCn = h.findIndex((r) => r.id === 'cn-hodge')
ok(iPad < 0 || iCn < iPad, `前缀命中（cn-hodge #${iCn}）排在词首命中（c-padic-hodge #${iPad}）之前`)
ok(searchNodes(g, 'hodge 猜想')[0]?.id === 'cn-hodge' || searchNodes(g, 'hodge 猜想')[0]?.id === 'hodge-conjecture', `'hodge 猜想' 去空白后完全相等排第一：${searchNodes(g, 'hodge 猜想')[0]?.id}`)

// 2) 高级语法
const open = searchNodes(g, 'status:open')
ok(open.length === 33, `'status:open' 返回 ${open.length}（期望 33）`)
ok(open.every((r, i) => i === 0 || open[i - 1].score >= r.score), 'status:open 按 importance 降序')
ok(searchNodes(g, 'status:(open').length === 0, "语法错误 'status:(open' 返回 []")
ok(isAdvancedQuery('-family:scheme') && isAdvancedQuery('a OR b') && !isAdvancedQuery('p-adic Hodge'), 'isAdvancedQuery 判定')

// 3) 每个节点都能用 name 搜到（前 5）
let miss = []
for (const n of g.nodes) {
  const r = searchNodes(g, n.name, { limit: 5 })
  if (!r.some((x) => x.id === n.id)) miss.push(`${n.id}(${n.name})`)
}
ok(miss.length === 0, `488 个节点 name 搜索前 5 名可达（失败 ${miss.length}）${miss.slice(0, 5).join(' ')}`)
let missEn = 0
for (const n of g.nodes) if (!searchNodes(g, n.en, { limit: 5 }).some((x) => x.id === n.id)) missEn++
console.log(`  （参考）en 名前 5 名不可达：${missEn}`)
let missId = 0
for (const n of g.nodes) if (searchNodes(g, n.id, { limit: 1 })[0]?.id !== n.id) missId++
ok(missId === 0, `id 搜索排第一（失败 ${missId}）`)

// 4) limit / 空输入 / 非字符串
ok(searchNodes(g, '层', { limit: 12 }).length <= 12, "limit 生效（'层'）")
ok(searchNodes(g, '').length === 0 && searchNodes(g, '   ').length === 0 && searchNodes(g, null).length === 0, '空输入返回 []')
console.log(`  '层' 命中 ${searchNodes(g, '层').length}`)

// 5) 性能：每次 < 2 ms
const qs = ['Hodge', '层', 'status:open', 'h', '上同调', 'scheme', 'Grothendieck', 'family:modern OR family:curve', 'x', '定理']
searchNodes(g, 'warm')
let worst = 0, total = 0, N = 0
for (let k = 0; k < 20; k++) for (const q of qs) {
  const t = performance.now(); searchNodes(g, q); const dt = performance.now() - t
  worst = Math.max(worst, dt); total += dt; N++
}
// 首字符按键模拟：随机 name 的前 1–3 个字符
for (const n of g.nodes) { const q = n.name.slice(0, 2); const t = performance.now(); searchNodes(g, q, { limit: 12 }); const dt = performance.now() - t; worst = Math.max(worst, dt); total += dt; N++ }
ok(worst < 2, `单次搜索最坏 ${worst.toFixed(3)} ms，平均 ${(total / N).toFixed(3)} ms（< 2 ms）`)
ok(normalize(' A  b\tC ') === 'abc', 'normalize')

console.log(fails ? `\n${fails} 项失败` : '\n全部通过')
process.exit(fails ? 1 : 0)
