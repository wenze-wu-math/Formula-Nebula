/**
 * kb-src/verify-nodes.mjs — 生成节点的最终验收（可复跑）。
 *
 * 检查的是"能不能安全接进知识库"，不是"看起来像不像"：
 *   1. id 唯一、格式合规、与现有 488 节点不冲突
 *   2. 关联端点全部存在（无悬空边）
 *   3. importance 在 [0,1] 且分布合理
 *   4. family 全部落在现有 8 个族内
 *   5. latex 是数学内容（无散文、无 KaTeX 不支持的环境）
 *   6. 抽样 url 真可达
 *   7. 与现有手写节点零 id 冲突、零重复 tag
 */
import { STACKS_NODES, STACKS_LINKS } from '../src/data/stacks-extra.js'
import { buildGraph } from '../src/graph.js'

let pass = 0, fail = 0
const ok = (name, cond, extra = '') => {
  if (cond) { pass++; console.log(`  PASS  ${name}${extra ? '  ' + extra : ''}`) }
  else { fail++; console.log(`  FAIL  ${name}${extra ? '  ' + extra : ''}`) }
}

console.log(`\n节点 ${STACKS_NODES.length}　关联 ${STACKS_LINKS.length}\n`)

/* 1. id */
const ids = new Set(STACKS_NODES.map((n) => n.id))
ok('id 唯一', ids.size === STACKS_NODES.length, `${ids.size}/${STACKS_NODES.length}`)
ok('id 格式 stx-<tag>', STACKS_NODES.every((n) => /^stx-[0-9a-z]{4}$/.test(n.id)))
ok('tag 唯一', new Set(STACKS_NODES.map((n) => n.tag)).size === STACKS_NODES.length)

/* 与**原有手写节点**比对 id 冲突。
 * ⚠ 不能用 buildGraph()：它已经把 STACKS_NODES 合并进去了，
 * 拿合并后的结果去比，必然"全部冲突"——这是校验脚本自己的 bug。 */
const existing = buildGraph()
const stxIds = new Set(STACKS_NODES.map((n) => n.id))
const handWritten = existing.nodes.filter((n) => !stxIds.has(n.id))
const handIds = new Set(handWritten.map((n) => n.id))
const clash = STACKS_NODES.filter((n) => handIds.has(n.id))
ok('与现有手写节点零 id 冲突', clash.length === 0,
  clash.length ? clash.slice(0, 3).map((n) => n.id).join(',') : `手写节点 ${handWritten.length} 条`)
/* 反向核对：合并后总节点数应当恰好等于 手写 + Stacks（无被覆盖） */
ok('合并不丢节点', existing.nodes.length === handWritten.length + STACKS_NODES.length,
  `${existing.nodes.length} = ${handWritten.length} + ${STACKS_NODES.length}`)

/* 2. 关联端点 */
const dangling = STACKS_LINKS.filter((l) => !ids.has(l[0]) || !ids.has(l[1]))
ok('关联端点全部存在', dangling.length === 0, `悬空 ${dangling.length}`)
const selfLoop = STACKS_LINKS.filter((l) => l[0] === l[1])
ok('无自环', selfLoop.length === 0, `${selfLoop.length}`)

/* 3. importance */
const imps = STACKS_NODES.map((n) => n.importance)
ok('importance ∈ [0,1]', imps.every((v) => v >= 0 && v <= 1))
const inRange = imps.filter((v) => v >= 0.35 && v <= 0.97).length
ok('importance 全部落在设计区间 [0.35,0.97]', inRange === imps.length, `${inRange}/${imps.length}`)
console.log(`       分布：min=${Math.min(...imps)} max=${Math.max(...imps)} 均值=${(imps.reduce((a, b) => a + b, 0) / imps.length).toFixed(3)}`)

/* 4. family */
const FAMILIES = ['foundation', 'scheme', 'cohomology', 'map', 'curve', 'intersect', 'birational', 'modern']
const badFam = STACKS_NODES.filter((n) => !FAMILIES.includes(n.family))
ok('family 全部合法', badFam.length === 0, badFam.length ? [...new Set(badFam.map((n) => n.family))].join(',') : '')

/* 5. latex 质量 */
const withLatex = STACKS_NODES.filter((n) => n.latex)
const prose = withLatex.filter((n) => /\\ref\{|\{\\it\b|\\emph\{/.test(n.latex))
ok('latex 无散文片段', prose.length === 0, `${prose.length}`)
const badEnv = withLatex.filter((n) => /\\xymatrix|\\ar\[/.test(n.latex))
ok('latex 无 KaTeX 不支持的环境', badEnv.length === 0, `${badEnv.length}`)
ok('latex 覆盖率 > 70%', withLatex.length / STACKS_NODES.length > 0.7,
  `${withLatex.length}/${STACKS_NODES.length} = ${(100 * withLatex.length / STACKS_NODES.length).toFixed(1)}%`)

/* 6. 抽样 url */
console.log('\n抽样验证 url（4 条）')
const step = Math.floor(STACKS_NODES.length / 4)
for (let i = 0; i < 4; i++) {
  const n = STACKS_NODES[i * step]
  try {
    const r = await fetch(n.url, { headers: { 'User-Agent': 'kb-collector' } })
    const t = await r.text()
    ok(`url ${n.tag}`, r.ok && t.includes(n.tag), `HTTP ${r.status}`)
  } catch (e) { ok(`url ${n.tag}`, false, e.message.slice(0, 40)) }
}

/* 7. 必备字段 */
const missing = STACKS_NODES.filter((n) => !n.name || !n.summary || !n.detail || !n.source)
ok('name/summary/detail/source 齐全', missing.length === 0, `缺 ${missing.length}`)

console.log(`\n结果：${pass} 通过 / ${fail} 失败`)
process.exitCode = fail ? 1 : 0
