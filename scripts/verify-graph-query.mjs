#!/usr/bin/env node
/**
 * ═══════════════════════════════════════════════════════════════
 *  验证 src/graphQuery.js —— 查询语言 / 路径 / 邻域 / 统计
 * ═══════════════════════════════════════════════════════════════
 *
 *  用法: node scripts/verify-graph-query.mjs
 *
 *  ── 为什么这个脚本自己装配图，而不 import buildGraph() ──
 *
 *  最省事的写法当然是 `import { buildGraph } from '../src/graph.js'`，
 *  但那条依赖链会拖进 three.js、config.js、palette.js —— 为了测一个
 *  **纯函数模块**，却要求整个渲染栈能在 Node 里被 import。
 *
 *  两个具体代价：
 *    ① 启动慢。three.js 是个大模块，一个本该毫秒级跑完的纯数据断言，
 *       要被几百毫秒的模块解析拖着。
 *    ② 更糟的是**将来**：只要 graph.js 或 config.js 哪天在模块顶层
 *       碰一下 window / document（这在渲染项目里太容易发生了），
 *       这个脚本就会在 import 阶段直接炸掉，而它要测的东西
 *       （查询语言、BFS、Dijkstra）跟浏览器一点关系都没有。
 *
 *  所以这里按 graph.js 的 buildGraph()（第 130~193 行）**逐条复刻**装配：
 *  规范化节点 → 过滤重复 id / 悬空引用 / 自环 / 重复边 → 建 linkIds 反向
 *  引用 → 算 degree → 按结构分别 min-max 归一化 rank。
 *
 *  ⚠ 复刻的**边界**要说清楚（不然以后有人会以为这里测的是全貌）：
 *    跳过了 brightness / sizeScale / baseColor / glowBase / conjStatusColors
 *    这几项。它们全部依赖 config.js 的 GLYPH 与 palette.js 的色彩空间转换，
 *    而且只服务渲染 —— 查询语言读不到它们，路径查找更读不到。
 *    换言之：**节点集合、连线集合、id→节点映射、degree、rank 这五样与
 *    buildGraph() 完全一致**，其余渲染字段不参与本脚本的任何断言。
 *
 *  ── 为什么断言写得这么"较真" ──
 *
 *  查询语言最容易出的不是崩溃，而是**静默答错**：`-status:proved` 少算几个
 *  节点、`importance:>0.9` 因为浮点比较漏掉边界值 —— 这些都不会报错，
 *  只会让人得到错误的搜索结果，而且没人会发现。所以下面凡是能用手写
 *  循环独立算一遍的（命中数、degree+1、取反的互补性、路径是不是真的走通），
 *  就用手写循环独立算一遍，再跟模块的输出对比。同一套代码自己证明自己
 *  是没有意义的。
 */
import {
  parseQuery, findPath, neighbourhood, neighbourhoodEdges, queryStats,
} from '../src/graphQuery.js'

import { NODES, LINKS, FAMILIES } from '../src/data/knowledge.js'
import { EXTRA_A_NODES, EXTRA_A_LINKS } from '../src/data/extra-a.js'
import { EXTRA_B_NODES, EXTRA_B_LINKS } from '../src/data/extra-b.js'
import { EXTRA_C_NODES, EXTRA_C_LINKS } from '../src/data/extra-c.js'
import { EXTRA_D_NODES, EXTRA_D_LINKS } from '../src/data/extra-d.js'
import { EXTRA_E_NODES, EXTRA_E_LINKS } from '../src/data/extra-e.js'
import { EXTRA_F_NODES, EXTRA_F_LINKS } from '../src/data/extra-f.js'
import { EXTRA_G_NODES, EXTRA_G_LINKS } from '../src/data/extra-g.js'
import { EXTRA_H_NODES, EXTRA_H_LINKS } from '../src/data/extra-h.js'
import {
  CONJECTURE_NODES, CONJECTURE_LINKS, CONJECTURE_STATUS,
} from '../src/data/conjectures.js'
import {
  RESEARCHER_NODES, RESEARCHER_LINKS,
} from '../src/data/researchers.js'

/* ═══════════════ 断言计数器 ═══════════════ */
let passed = 0
let failed = 0
const failures = []

function check(ok, label, detail = '') {
  if (ok) {
    passed++
    console.log(`  ✓ ${label}${detail ? '   ' + detail : ''}`)
  } else {
    failed++
    failures.push(label)
    console.log(`  ✗ ${label}${detail ? '   ' + detail : ''}`)
  }
  return ok
}

const hr = (t) => console.log(`\n${'─'.repeat(64)}\n${t}`)

/* ═══════════════ 图的装配（复刻 buildGraph，见文件头） ═══════════════ */

const GALAXY_NODES = [
  ...NODES,
  ...EXTRA_A_NODES, ...EXTRA_B_NODES, ...EXTRA_C_NODES, ...EXTRA_D_NODES,
  ...EXTRA_E_NODES, ...EXTRA_F_NODES, ...EXTRA_G_NODES, ...EXTRA_H_NODES,
]
const GALAXY_LINKS = [
  ...LINKS,
  ...EXTRA_A_LINKS, ...EXTRA_B_LINKS, ...EXTRA_C_LINKS, ...EXTRA_D_LINKS,
  ...EXTRA_E_LINKS, ...EXTRA_F_LINKS, ...EXTRA_G_LINKS, ...EXTRA_H_LINKS,
]
const ALL_NODES = [...GALAXY_NODES, ...CONJECTURE_NODES, ...RESEARCHER_NODES]
const ALL_LINKS = [...GALAXY_LINKS, ...CONJECTURE_LINKS, ...RESEARCHER_LINKS]

const CONJECTURE_IDS = new Set(CONJECTURE_NODES.map((n) => n.id))
const RESEARCHER_IDS = new Set(RESEARCHER_NODES.map((n) => n.id))

const clamp01 = (v) =>
  Math.min(1, Math.max(0, typeof v === 'number' && isFinite(v) ? v : 0))

function assemble() {
  const byId = new Map()
  const nodes = []
  let dupIds = 0

  for (const raw of ALL_NODES) {
    if (byId.has(raw.id)) { dupIds++; continue }
    const isConj = CONJECTURE_IDS.has(raw.id)
    const isResearcher = RESEARCHER_IDS.has(raw.id)

    const n = {
      ...raw,
      importance: clamp01(raw.importance ?? 0.5),
      family: FAMILIES[raw.family] ? raw.family : (isConj ? 'conjecture' : isResearcher ? 'researcher' : 'foundation'),
      cluster: isConj,
      researcher: isResearcher,
      degree: 0,
      linkIds: [],
    }
    if (isConj) {
      n.status = CONJECTURE_STATUS[raw.status] ? raw.status : 'open'
      n.field = raw.field || 'ag'
      n.year = typeof raw.year === 'number' ? raw.year : null
      n.proposer = raw.proposer || ''
    }
    if (isResearcher) {
      n.field = raw.field || 'arith'
      n.institution = raw.institution || ''
      n.focus = raw.focus || ''
    }
    byId.set(n.id, n)
    nodes.push(n)
  }

  const seen = new Set()
  const links = []
  let dangling = 0
  let selfLoop = 0
  let dupEdge = 0

  for (const [a, b, w = 0.5, label = ''] of ALL_LINKS) {
    if (!byId.has(a) || !byId.has(b)) { dangling++; continue }
    if (a === b) { selfLoop++; continue }
    const key = a < b ? `${a}|${b}` : `${b}|${a}`
    if (seen.has(key)) { dupEdge++; continue }
    seen.add(key)

    const link = { source: a, target: b, weight: clamp01(w), label, key }
    const ca = byId.get(a).cluster
    const cb = byId.get(b).cluster
    const ra = byId.get(a).researcher
    const rb = byId.get(b).researcher
    link.researcher = ra || rb
    link.cross = ca !== cb || ra !== rb
    link.clusterSide = ca ? 'cluster' : (ra ? 'researcher' : 'galaxy')
    links.push(link)
    byId.get(a).linkIds.push(link)
    byId.get(b).linkIds.push(link)
  }

  for (const n of nodes) n.degree = n.linkIds.length

  /* rank：**按结构分别**归一化（与 graph.js 同）。全局归一化会把 59 条猜想
   * 压进定理的分布里，星团内部的层次就没了 —— 理由见 graph.js 函数头。 */
  const norm = (group) => {
    if (!group.length) return null
    const imps = group.map((n) => n.importance)
    const lo = Math.min(...imps)
    const hi = Math.max(...imps)
    const span = Math.max(1e-6, hi - lo)
    for (const n of group) n.rank = (n.importance - lo) / span
    return [lo, hi]
  }
  const galaxy = nodes.filter((n) => !n.cluster && !n.researcher)
  const conj = nodes.filter((n) => n.cluster)
  const researchers = nodes.filter((n) => n.researcher)
  const impRange = norm(galaxy)
  const conjRange = norm(conj)
  const researchRange = norm(researchers)

  return {
    nodes, links, byId,
    impRange: impRange || [0, 1],
    conjRange: conjRange || [0, 1],
    researchRange: researchRange || [0, 1],
    raw: {
      dupIds, dangling, selfLoop, dupEdge,
      galaxyCount: galaxy.length,
      conjCount: conj.length,
      researcherCount: researchers.length,
    },
  }
}

const graph = assemble()
const { nodes, links, byId } = graph

const nameOf = (id) => (byId.get(id) ? byId.get(id).name : `(${id} 不存在)`)

/* ═══════════════ 1. 装配结果 ═══════════════ */
hr('1. 图装配')

const stats = graph.raw
console.log(`  原始节点 ${ALL_NODES.length} 条，原始连线 ${ALL_LINKS.length} 条`)
console.log(`  过滤：重复 id ${stats.dupIds} · 悬空引用 ${stats.dangling} · ` +
  `自环 ${stats.selfLoop} · 重复边 ${stats.dupEdge}`)

const EXPECT_NODES = 488
const EXPECT_LINKS = 1670
console.log(`  最终：节点 ${nodes.length} / 连线 ${links.length}` +
  `（主星系 ${stats.galaxyCount} + 猜想星团 ${stats.conjCount} + 研究者 ${stats.researcherCount}）`)

if (nodes.length !== EXPECT_NODES || links.length !== EXPECT_LINKS) {
  console.log(`  ⚠ 期望 ${EXPECT_NODES} 节点 / ${EXPECT_LINKS} 连线，实际 ` +
    `${nodes.length} / ${links.length}。数据可能已经合法地变过了，` +
    `本脚本继续跑，只断言下界。`)
} else {
  console.log(`  与预期完全一致（${EXPECT_NODES} / ${EXPECT_LINKS}）`)
}

check(nodes.length > 400, '节点数 > 400', `实际 ${nodes.length}`)
check(links.length > 1500, '连线数 > 1500', `实际 ${links.length}`)
check(byId.size === nodes.length, 'byId.size === nodes.length', `${byId.size}`)

const degreeSum = nodes.reduce((s, n) => s + n.degree, 0)
check(degreeSum === links.length * 2, 'Σdegree === 2×连线数',
  `${degreeSum} === ${links.length * 2}`)

const isolated = nodes.filter((n) => n.degree === 0)
check(isolated.length === 0, '没有孤立节点', `实际 ${isolated.length}`)

// linkIds 反查必须双向一致：随便抽几条，两端都得认领这条边
const backrefOk = links.every((l) =>
  byId.get(l.source).linkIds.includes(l) && byId.get(l.target).linkIds.includes(l))
check(backrefOk, 'linkIds 反向引用两端都挂上了')

const conjIds = new Set(CONJECTURE_NODES.map((n) => n.id))
check(conjIds.size === stats.conjCount,
  '猜想 id 集合大小 === cluster 节点数', `${conjIds.size}`)

/* ═══════════════ 2. 查询语言 ═══════════════ */
hr('2. 查询语言')

/** 跑一条查询，返回 { n, err, desc } */
function run(text) {
  const q = parseQuery(text)
  let n = 0
  let threw = false
  try {
    for (const node of nodes) if (q.test(node)) n++
  } catch { threw = true }
  return { n, err: q.error || '', desc: q.describe(), threw, q }
}

function countOf(text) { return run(text).n }

const QUERIES = [
  // 要求里点名的 11 条
  ['裸词 · 定理', '定理'],
  ['status:open', 'status:open'],
  ['cluster:true', 'cluster:true'],
  ['is:conjecture（cluster:true 的语法糖）', 'is:conjecture'],
  ['-status:proved', '-status:proved'],
  ['importance:>0.9', 'importance:>0.9'],
  ['importance:<0.3', 'importance:<0.3'],
  ['(family:scheme OR family:topo)', '(family:scheme OR family:topo)'],
  ['name:"Hodge 猜想"（带空格的值）', 'name:"Hodge 猜想"'],
  ['degree:>10', 'degree:>10'],
  ['匹配 0 个：不存在的名字', 'name:"这个名字在知识库里绝对不存在"'],
  // 上面之外，覆盖剩下的语法面
  ['*（恒真，用来数总数）', '*'],
  ['is:theorem', 'is:theorem'],
  ['cluster:false', 'cluster:false'],
  ['field:ag', 'field:ag'],
  ['id:cn-', 'id:cn-'],
  ['en:hodge', 'en:hodge'],
  ['latex:det', 'latex:det'],
  ['rank:>0.5', 'rank:>0.5'],
  ['importance:0.9（epsilon 相等）', 'importance:0.9'],
  ['importance:>=0.8', 'importance:>=0.8'],
  ['degree:>5 猜想（AND）', 'degree:>5 猜想'],
  ['(family:scheme OR family:topo) -status:proved', '(family:scheme OR family:topo) -status:proved'],
  ['is:conjecture -field:ag', 'is:conjecture -field:ag'],
  ['year:>2000', 'year:>2000'],
  ['proposer:格罗滕迪克', 'proposer:格罗滕迪克'],
  ['双重否定 --status:proved', '--status:proved'],
  ['-(status:open OR status:partial)', '-(status:open OR status:partial)'],
]

const queryCounts = new Map()
console.log('  查询                                        命中')
console.log('  ' + '─'.repeat(58))
for (const [label, text] of QUERIES) {
  const r = run(text)
  queryCounts.set(text, r.n)
  const mark = r.err ? '✗解析错' : String(r.n)
  console.log(`  ${label.padEnd(42)} ${mark.padStart(6)}`)
}
console.log(`  共 ${QUERIES.length} 条不同查询`)

check(QUERIES.length >= 12, '至少 12 条不同查询', `实际 ${QUERIES.length}`)
check([...queryCounts.values()].every((v) => Number.isFinite(v)),
  '所有查询都返回值（没有 NaN）')

/* weight 是**连线**的字段，不是节点的 —— 加进来只会得到恒为 0 的结果，
 * 用户却以为自己筛出了什么。所以它必须被当成「不认识的字段」报错。 */
const weightQ = parseQuery('weight:>0.5')
check(!!weightQ.error && weightQ.test(nodes[0]) === false,
  'weight: 被拒绝（它是连线的字段，不是节点的）', weightQ.error || '(竟然没报错)')

// 每条要求里点名的查询逐条确认「能用」（不是语法错误）
const REQUIRED = [
  '定理', 'status:open', 'cluster:true', 'is:conjecture', '-status:proved',
  'importance:>0.9', 'importance:<0.3', '(family:scheme OR family:topo)',
  'name:"Hodge 猜想"', 'degree:>10',
]
const badRequired = REQUIRED.filter((t) => parseQuery(t).error)
check(badRequired.length === 0, '要求里点名的查询全部解析成功',
  badRequired.length ? badRequired.join(' | ') : `${REQUIRED.length} 条全通过`)

check(queryCounts.get('status:open') === 33 || queryCounts.get('status:open') > 0,
  'status:open 有命中', `${queryCounts.get('status:open')} 个`)

// 带空格的引号值必须真的只命中那一个
const hodge = run('name:"Hodge 猜想"')
check(hodge.n === 1 && !hodge.err, 'name:"Hodge 猜想" 命中 1 个',
  `实际 ${hodge.n}`)
// 引号里的空格不能被当成 AND 的分隔：`name:"Alpha Beta"` 必须是**一个**原子。
//
// 这一条不能用真实数据测 —— 试过 `en:Hodge Conjecture`，但裸词本来就会搜
// en 字段，于是「拆成 AND」和「当一个原子」结果一模一样，断言恒真，测不出
// 任何东西（第一版就是这么写的，跑出来是假通过）。
// 所以用两个**构造出来的探针节点**，把字段挑成裸词搜不到的那一类：
//   proposer 只被 `proposer:` 搜，裸词不碰它。
// 于是 `proposer:Alpha Beta` 里的裸词 Beta 找不到任何东西 ——
// 带引号能命中、不带引号命不中，两者的差异才是引号真的在起作用的证据。
const PROBE = [
  { id: 'probe-1', name: 'N1', en: 'E1', latex: 'L1', proposer: 'Alpha Beta',
    importance: 0.5, degree: 0, cluster: false },
  { id: 'probe-2', name: 'N2', en: 'E2', latex: 'L2', proposer: 'Gamma',
    importance: 0.5, degree: 0, cluster: false },
]
const probeCount = (text) => {
  const q = parseQuery(text)
  return PROBE.filter((n) => q.test(n)).length
}
const qQuoted = probeCount('proposer:"Alpha Beta"')
const qSplit = probeCount('proposer:Alpha Beta')
check(!parseQuery('proposer:"Alpha Beta"').error && qQuoted === 1,
  '带引号的 proposer:"Alpha Beta" 命中 1 个（空格被吃进值里）',
  `实际 ${qQuoted}`)
check(qSplit === 0,
  '不带引号的 proposer:Alpha Beta 命中 0 个（拆成 AND，裸词 Beta 搜不到 proposer）',
  `实际 ${qSplit} —— 若这里是 1，说明引号根本没起作用`)

// 并且引号里的值必须真的只命中那一个真实节点，不是"数量碰巧对了"
const hodgeQ = parseQuery('name:"Hodge 猜想"')
const hodgeHits = nodes.filter((n) => hodgeQ.test(n)).map((n) => n.id)
check(hodgeHits.length === 1 && hodgeHits[0] === 'cn-hodge',
  'name:"Hodge 猜想" 命中的正是 cn-hodge', hodgeHits.join(', ') || '(无)')

/* ── 2b. 畸形查询：绝不抛、必须有中文 error、必须匹配 0 个 ── */
const MALFORMED = [
  '(family:scheme OR status:open',      // 少一个右括号
  'importance:>',                       // 值没写完
  'foo:bar',                            // 不认识的字段
  'cluster:maybe',                      // 布尔值非法
  'importance:big',                     // 数值字段给了字符串
  '()',                                 // 空括号
  'OR status:open',                     // OR 开头
  'status:open OR OR status:partial',   // 连着两个 OR
  'name:"没闭合的引号',                  // 引号没关
  'is:lemma',                           // is: 只认 conjecture/theorem
  '-',                                  // 光一个负号
  ')',                                  // 光一个右括号
]

console.log('\n  畸形查询（搜索框里每敲一个键都会跑，所以一条都不许抛）')
let malformedOk = 0
for (const text of MALFORMED) {
  const r = run(text)
  const ok = r.n === 0 && r.err.length > 0 && !r.threw
  if (ok) malformedOk++
  console.log(`    ${ok ? '✓' : '✗'} ${JSON.stringify(text).padEnd(36)} ` +
    `命中 ${r.n}  错误「${r.err || '(无)'}」`)
}
check(malformedOk === MALFORMED.length,
  `${MALFORMED.length} 条畸形查询全部：0 命中 + 有错误信息 + 不抛`,
  `实际通过 ${malformedOk}`)

// 半截输入逐字符扫一遍：从空到一条完整查询，中途任何前缀都不许抛
let prefixThrew = 0
const FULL = '(family:scheme OR family:topo) -status:proved name:"Hodge 猜想"'
for (let i = 0; i <= FULL.length; i++) {
  const r = run(FULL.slice(0, i))
  if (r.threw) prefixThrew++
}
check(prefixThrew === 0,
  '完整查询的每一个前缀都不抛（模拟逐字输入）',
  `扫描了 ${FULL.length + 1} 个前缀`)

// 空输入：不是错误，但不匹配任何东西
const empty = parseQuery('')
check(empty.error === undefined && empty.test(nodes[0]) === false,
  '空查询不是错误，且匹配 0 个')

/* ═══════════════ 3. cluster:true === 猜想数 ═══════════════ */
hr('3. cluster:true 与猜想节点数交叉核对')

const clusterTrue = countOf('cluster:true')
const conjectureNodes = nodes.filter((n) => conjIds.has(n.id)).length
check(clusterTrue === conjectureNodes,
  'count(cluster:true) === 猜想节点数',
  `${clusterTrue} === ${conjectureNodes}`)
check(countOf('is:conjecture') === clusterTrue,
  'is:conjecture 与 cluster:true 同值', `${countOf('is:conjecture')}`)
const theoremN = nodes.filter((n) => !n.cluster && !n.researcher).length
const researcherN = nodes.filter((n) => n.researcher).length
check(countOf('is:theorem') === theoremN,
  'is:theorem 只命中主星系定理', `${countOf('is:theorem')} === ${theoremN}`)
check(countOf('is:researcher') === researcherN,
  'is:researcher 命中研究者星团', `${countOf('is:researcher')} === ${researcherN}`)
check(countOf('is:theorem') + countOf('is:researcher') + clusterTrue === nodes.length,
  'is:theorem + is:researcher + is:conjecture 互补为全图',
  `${countOf('is:theorem')} + ${countOf('is:researcher')} + ${clusterTrue} = ${nodes.length}`)
check(countOf('cluster:false') === nodes.length - clusterTrue,
  'cluster:false 包含研究者（新结构不属于猜想星团）',
  `${countOf('cluster:false')} === ${nodes.length - clusterTrue}`)
check(countOf('id:cn-') === conjectureNodes,
  'id:cn- 命中的也是同一批（猜想 id 前缀）', `${countOf('id:cn-')}`)

/* ═══════════════ 4. importance:>0.9 手算核对 ═══════════════ */
hr('4. 数值比较与手算交叉核对')

const handImpGt = nodes.filter((n) => n.importance > 0.9).length
check(countOf('importance:>0.9') === handImpGt,
  'count(importance:>0.9) === nodes.filter(n => n.importance > 0.9).length',
  `${countOf('importance:>0.9')} === ${handImpGt}`)

const handImpLt = nodes.filter((n) => n.importance < 0.3).length
check(countOf('importance:<0.3') === handImpLt,
  'count(importance:<0.3) === 手算', `${countOf('importance:<0.3')} === ${handImpLt}`)
check(countOf('importance:>=0.8') === nodes.filter((n) => n.importance >= 0.8).length,
  'count(importance:>=0.8) === 手算',
  `${countOf('importance:>=0.8')}`)
check(countOf('importance:<=0.2') === nodes.filter((n) => n.importance <= 0.2).length,
  'count(importance:<=0.2) === 手算', `${countOf('importance:<=0.2')}`)

// 精确相等带 epsilon：数据里 importance 恰好等于 0.9 的那些
const exactImp = nodes.filter((n) => Math.abs(n.importance - 0.9) <= 1e-9).length
check(countOf('importance:0.9') === exactImp,
  'importance:0.9 命中「恰为 0.9」的节点', `${countOf('importance:0.9')} === ${exactImp}`)

const handDegGt10 = nodes.filter((n) => n.degree > 10).length
check(countOf('degree:>10') === handDegGt10,
  'count(degree:>10) === 手算', `${countOf('degree:>10')} === ${handDegGt10}`)

const handRankGt = nodes.filter((n) => n.rank > 0.5).length
check(countOf('rank:>0.5') === handRankGt,
  'count(rank:>0.5) === 手算', `${countOf('rank:>0.5')} === ${handRankGt}`)

// 比较运算符的单调性：> 的集合必须严格包含 >= 的集合再挖掉等于的那些
const gt = countOf('importance:>0.8')
const ge = countOf('importance:>=0.8')
const eq = countOf('importance:0.8')
check(ge === gt + eq, 'importance:>=0.8 === importance:>0.8 + importance:0.8',
  `${ge} === ${gt} + ${eq}`)

/* ═══════════════ 5. 取反的互补性 ═══════════════ */
hr('5. 取反正确性')

const total = countOf('*')
const proved = countOf('status:proved')
const notProved = countOf('-status:proved')
check(total === nodes.length, 'count(*) === 节点总数', `${total} === ${nodes.length}`)
check(notProved + proved === total,
  'count(-status:proved) + count(status:proved) === count(*)',
  `${notProved} + ${proved} = ${notProved + proved} (总数 ${total})`)

const open = countOf('status:open')
check(countOf('-status:open') + open === total, '-status:open 同样互补',
  `${countOf('-status:open')} + ${open} = ${total}`)

// 取反必须能把主星系（无 status 字段）算进来 ——
// 这正是「字段缺失时该匹配 false」那条规则的可观测后果
check(notProved >= nodes.length - clusterTrue,
  '-status:proved 把无 status 字段的主星系节点也算进来了',
  `${notProved} ≥ ${nodes.length - clusterTrue}`)

// 双重否定回到自身
check(countOf('--status:proved') === proved, '--status:proved 还原成 status:proved',
  `${countOf('--status:proved')} === ${proved}`)

// 括号里的取反
const grp = countOf('-(status:open OR status:partial)')
check(grp === total - countOf('status:open') - countOf('status:partial'),
  '-(A OR B) === 非A 且 非B',
  `${grp} === ${total} - ${countOf('status:open')} - ${countOf('status:partial')}`)

// 德摩根：-(A OR B) === -A -B
check(countOf('-status:open -status:partial') === grp,
  '-(A OR B) === (-A AND -B)（德摩根）', `${countOf('-status:open -status:partial')}`)

/* ═══════════════ 6. 邻接与手算结构（给后面的路径断言打底） ═══════════════ */
hr('6. 图的连通结构')

/** 脚本自己手搓一张邻接表 —— 与模块内部的实现无关，用来独立核对 */
const ADJ = new Map(nodes.map((n) => [n.id, []]))
const LINK_BY_KEY = new Map()
for (const l of links) {
  ADJ.get(l.source).push({ to: l.target, link: l })
  ADJ.get(l.target).push({ to: l.source, link: l })
  LINK_BY_KEY.set(l.key, l)
}
const linkBetween = (a, b) => LINK_BY_KEY.get(a < b ? `${a}|${b}` : `${b}|${a}`)
const costOfPath = (path) => {
  let s = 0
  for (let i = 1; i < path.length; i++) {
    const l = linkBetween(path[i - 1], path[i])
    if (!l) return NaN
    s += 1 - l.weight
  }
  return s
}

function bfsDist(src) {
  const d = new Map([[src, 0]])
  const q = [src]
  for (let i = 0; i < q.length; i++) {
    const u = q[i]
    const du = d.get(u)
    for (const e of ADJ.get(u)) {
      if (d.has(e.to)) continue
      d.set(e.to, du + 1)
      q.push(e.to)
    }
  }
  return d
}

const componentOf = new Map()
let components = 0
const componentSizes = []
for (const n of nodes) {
  if (componentOf.has(n.id)) continue
  components++
  const d = bfsDist(n.id)
  for (const id of d.keys()) componentOf.set(id, components)
  componentSizes.push(d.size)
}
componentSizes.sort((a, b) => b - a)
console.log(`  连通分量 ${components} 个，` +
  `最大分量 ${componentSizes[0]} / ${nodes.length} 个节点`)
check(components === 1,
  '整张图是连通的（路径查找不会遇到"确实不连通"的合法情形）',
  `${components} 个分量`)
check(componentSizes[0] === nodes.length, '最大分量覆盖全部节点',
  `${componentSizes[0]}`)

/* ═══════════════ 7. findPath：真实节点对 ═══════════════ */
hr('7. findPath —— 真实节点对')

const PAIRS = [
  ['nullstellensatz', 'cn-hodge'],
  ['zariski-topology', 'e-projection-formula'],
  ['moduli-space', 'cn-riemann'],
  ['f-strong-resolution', 'cn-tate'],
  ['lying-over', 'cn-hodge'],
  ['noetherian', 'chern-class'],
]

// id 必须先真实存在，否则下面测的是"id 打错"而不是路径
const missingPairIds = PAIRS.flat().filter((id) => !byId.has(id))
check(missingPairIds.length === 0, '测试用的节点 id 全部真实存在',
  missingPairIds.length ? missingPairIds.join(', ') : `${PAIRS.length} 对`)

let pairsFound = 0
let walkOk = 0
console.log('  起点 → 终点                                        跳数')
console.log('  ' + '─'.repeat(58))
for (const [a, b] of PAIRS) {
  const r = findPath(graph, a, b)
  const okFound = r.found === true
  if (okFound) pairsFound++

  // 路径必须是一条**真的走得通**的路：相邻两跳都得是图上真实存在的一条边
  let walk = okFound && r.path[0] === a && r.path[r.path.length - 1] === b
  if (walk) {
    for (let i = 1; i < r.path.length; i++) {
      if (!linkBetween(r.path[i - 1], r.path[i])) { walk = false; break }
    }
  }
  if (walk) walkOk++

  // links 数组也要对得上：长度是 hops，且每条都真的把两端连起来
  const linksOk = okFound && r.links.length === r.hops &&
    r.links.every((l, i) => l.key === linkBetween(r.path[i], r.path[i + 1])?.key)
  if (!linksOk && okFound) walk = false

  console.log(`  ${(nameOf(a) + ' → ' + nameOf(b)).padEnd(44)} ` +
    `${okFound ? r.hops : '未找到'}`)
  if (!okFound) console.log(`      原因：${r.reason}`)
}
check(pairsFound === PAIRS.length, `${PAIRS.length} 对真实节点全部找到路径`,
  `实际 ${pairsFound}`)
check(walkOk === PAIRS.length,
  '每条返回的路径都是合法走法（path[0]/path[-1] 正确、相邻必有边、links 与 path 对齐）',
  `${walkOk}/${PAIRS.length}`)

// 顺带：手搓 BFS 的距离必须与 findPath 的 hops 一致
let hopsAgree = 0
for (const [a, b] of PAIRS) {
  const d = bfsDist(a).get(b)
  if (findPath(graph, a, b).hops === d) hopsAgree++
}
check(hopsAgree === PAIRS.length, 'findPath 的跳数 === 手搓 BFS 的最短距离',
  `${hopsAgree}/${PAIRS.length}`)

// 最远的一对也必须能找到
const ecc = new Map()
for (const n of nodes) {
  const d = bfsDist(n.id)
  let m = 0
  for (const v of d.values()) if (v > m) m = v
  ecc.set(n.id, m)
}
const eccSorted = [...ecc].sort((a, b) => b[1] - a[1])
const farFrom = eccSorted[0][0]
const farDist = bfsDist(farFrom)
let farTo = farFrom
for (const [id, d] of farDist) if (d === eccSorted[0][1]) farTo = id
const farRes = findPath(graph, farFrom, farTo)
check(farRes.found === true && farRes.hops === eccSorted[0][1],
  `最远的一对也能找到（${nameOf(farFrom)} → ${nameOf(farTo)}）`,
  farRes.found ? `${farRes.hops} 跳` : farRes.reason)

/* ═══════════════ 8. findPath：非法输入 ═══════════════ */
hr('8. findPath —— 非法输入必须返回 found:false 而不是抛')

let badThrew = 0
const badCases = [
  ['不存在的起点', 'no-such-node-xyz', 'moduli-space'],
  ['不存在的终点', 'moduli-space', 'no-such-node-xyz'],
  ['两端都不存在', 'nope-a', 'nope-b'],
  ['空字符串', '', 'moduli-space'],
  ['undefined', undefined, 'moduli-space'],
  ['null', null, 'moduli-space'],
  ['数字（id 是字符串，数字不是）', 42, 'moduli-space'],
]
let badOk = 0
for (const [label, a, b] of badCases) {
  let r
  try { r = findPath(graph, a, b) } catch { badThrew++; continue }
  const ok = r && r.found === false && typeof r.reason === 'string' && r.reason.length > 0
  if (ok) badOk++
  console.log(`  ${ok ? '✓' : '✗'} ${label.padEnd(26)} ${ok ? `原因：${r.reason}` : JSON.stringify(r)}`)
}
check(badThrew === 0, '非法 id 一个都没抛异常', `${badCases.length} 个用例`)
check(badOk === badCases.length,
  '非法 id 全部返回 found:false 且带非空 reason', `${badOk}/${badCases.length}`)

// graph 本身不成形时也不许抛
let graphThrew = 0
for (const bad of [null, undefined, {}, { nodes: [], links: [] }, { links: [] }]) {
  try {
    const r = findPath(bad, 'a', 'b')
    if (!r || r.found !== false) graphThrew++
  } catch { graphThrew++ }
}
check(graphThrew === 0, 'graph 不成形时也返回 found:false（不抛）', '5 个畸形 graph')

/* ═══════════════ 9. findPath(a, a) ═══════════════ */
hr('9. findPath(a, a) —— 0 跳')

const selfIds = ['moduli-space', 'cn-hodge', nodes[nodes.length - 1].id]
let selfOk = 0
for (const id of selfIds) {
  const r = findPath(graph, id, id)
  const ok = r.found === true && r.hops === 0 && r.path.length === 1 &&
    r.path[0] === id && r.links.length === 0 && r.cost === 0
  if (ok) selfOk++
  console.log(`  ${ok ? '✓' : '✗'} ${nameOf(id).padEnd(20)} 跳数 ${r.hops}，路径长度 ${r.path.length}，代价 ${r.cost}`)
}
check(selfOk === selfIds.length, 'a → a 恒为 0 跳、路径为 [a]、无连线、代价 0',
  `${selfOk}/${selfIds.length}`)

/* ═══════════════ 10. 加权 vs 无权 ═══════════════ */
hr('10. 加权 Dijkstra vs 无权 BFS')

console.log('  Dijkstra 的代价是 Σ(1 − weight)：强关联更便宜。')
console.log('  所以它宁可多绕两跳走权重 0.95 的强关联，也不走一条权重 0.35 的勉强关联。\n')

const CMP_PAIRS = [
  ['nullstellensatz', 'cn-hodge'],
  ['zariski-topology', 'e-projection-formula'],
  ['lying-over', 'cn-hodge'],
  ['moduli-space', 'cn-riemann'],
  ['f-strong-resolution', 'cn-tate'],
  ['noetherian', 'chern-class'],
]

let differ = 0
let weightedBetter = 0
const shortest = (p) => (p.length > 4 ? p.slice(0, 3).join(' → ') + ' → … → ' + p[p.length - 1] : p.join(' → '))

for (const [a, b] of CMP_PAIRS) {
  const bfs = findPath(graph, a, b)
  const dij = findPath(graph, a, b, { weighted: true })
  if (!bfs.found || !dij.found) { console.log(`  ${nameOf(a)} → ${nameOf(b)} 找不到路，跳过`); continue }

  const bfsCost = costOfPath(bfs.path)          // 手算，独立于模块
  const dijCost = costOfPath(dij.path)
  const changed = bfs.hops !== dij.hops || Math.abs(bfsCost - dijCost) > 1e-9
  if (changed) differ++
  if (dijCost <= bfsCost + 1e-9) weightedBetter++

  console.log(`  ${nameOf(a)} → ${nameOf(b)}`)
  console.log(`      无权 BFS : ${String(bfs.hops).padStart(2)} 跳，代价 ${bfsCost.toFixed(3)}  ${shortest(bfs.path)}`)
  console.log(`      加权 Dijk: ${String(dij.hops).padStart(2)} 跳，代价 ${dijCost.toFixed(3)}  ${shortest(dij.path)}`)
  console.log(`      ${changed ? '两者不同（加权用更多跳换更强关联）' : '两者一致'}`)

  // 模块自报的 cost 必须与手算一致
  if (Math.abs(dij.cost - dijCost) > 1e-9 || Math.abs(bfs.cost - bfsCost) > 1e-9) {
    console.log(`      ✗ 模块自报的 cost 与手算不符：` +
      `module(${bfs.cost.toFixed(3)}, ${dij.cost.toFixed(3)}) vs hand(${bfsCost.toFixed(3)}, ${dijCost.toFixed(3)})`)
  }
}

check(differ > 0, '加权与无权至少在一对节点上给出不同路径',
  `实测 ${differ}/${CMP_PAIRS.length} 对不同`)
check(weightedBetter === CMP_PAIRS.length,
  '加权路径的代价 ≤ 同一条无权路径的代价（Dijkstra 最优性）',
  `${weightedBetter}/${CMP_PAIRS.length}`)

// 加权模式下 cost 字段必须存在且等于手算
const one = findPath(graph, 'nullstellensatz', 'cn-hodge', { weighted: true })
check(one.found && Math.abs(one.cost - costOfPath(one.path)) < 1e-9,
  'weighted 模式返回的 cost 与手算 Σ(1−weight) 一致',
  `${one.cost.toFixed(6)}`)

// 加权路径也必须是一条合法走法（最容易出的 bug：回溯用了错 key）
let weightedWalkOk = 0
for (const [a, b] of CMP_PAIRS) {
  const r = findPath(graph, a, b, { weighted: true })
  let ok = r.found && r.path[0] === a && r.path[r.path.length - 1] === b &&
    r.links.length === r.hops
  if (ok) {
    for (let i = 1; i < r.path.length; i++) {
      if (!linkBetween(r.path[i - 1], r.path[i])) { ok = false; break }
    }
  }
  if (ok) weightedWalkOk++
}
check(weightedWalkOk === CMP_PAIRS.length,
  '加权路径同样是合法走法（path 首尾正确、相邻必有边、links 与 path 对齐）',
  `${weightedWalkOk}/${CMP_PAIRS.length}`)

/* 加权路径必须**简单**（不重复经过同一个节点）。
 *
 * 这条不是形式主义：Dijkstra 的代价 1−weight ≥ 0，正常实现给出的最短路
 * 天然不会绕圈，但"分层 maxHops"那套写法很容易在回溯时把层号丢掉，
 * 于是路径里同一个节点出现两次、hops 比实际走的边还少 —— 画面上表现为
 * "这条路莫名其妙拐回去一趟"。随机抽 400 对来压这件事。 */
let rnd = 987654321
const nextR = () => { rnd = (rnd * 1103515245 + 12345) & 0x7fffffff; return rnd / 0x7fffffff }
const allIds = nodes.map((n) => n.id)
let simChecked = 0
let nonSimple = 0
let layeredChecked = 0
let layeredNonSimple = 0
for (let i = 0; i < 400; i++) {
  const a = allIds[Math.floor(nextR() * allIds.length)]
  const b = allIds[Math.floor(nextR() * allIds.length)]
  const r = findPath(graph, a, b, { weighted: true })
  if (r.found) {
    simChecked++
    if (new Set(r.path).size !== r.path.length) nonSimple++
  }
  const rl = findPath(graph, a, b, { weighted: true, maxHops: 6 })
  if (rl.found) {
    layeredChecked++
    if (new Set(rl.path).size !== rl.path.length) layeredNonSimple++
  }
}
check(nonSimple === 0, `加权路径都是简单路径（随抽 ${simChecked} 对，无重复节点）`,
  nonSimple ? `${nonSimple} 对绕圈了` : '')
check(layeredNonSimple === 0,
  `加权 + maxHops:6 的路径也都是简单路径（随抽 ${layeredChecked} 对）`,
  layeredNonSimple ? `${layeredNonSimple} 对绕圈了` : '')
check(simChecked === 400 && layeredChecked === 400,
  '随机抽样的 400 对全部连通（图是全连通的，抽样不会空转）',
  `${simChecked} / ${layeredChecked}`)

/* ═══════════════ 11. maxHops ═══════════════ */
hr('11. maxHops 提前收工')

const farPair = ['zariski-topology', 'e-projection-formula']
const farTrueHops = bfsDist(farPair[0]).get(farPair[1])
const r1 = findPath(graph, farPair[0], farPair[1], { maxHops: 1 })
console.log(`  ${nameOf(farPair[0])} → ${nameOf(farPair[1])} 真实距离 ${farTrueHops} 跳`)
check(r1.found === false, 'maxHops:1 对远距离节点返回 found:false',
  r1.found ? `竟然找到了（${r1.hops} 跳）` : `原因：${r1.reason}`)

const rExact = findPath(graph, farPair[0], farPair[1], { maxHops: farTrueHops })
check(rExact.found === true && rExact.hops === farTrueHops,
  `maxHops:${farTrueHops}（刚好够）能找到且跳数最优`,
  rExact.found ? `${rExact.hops} 跳` : rExact.reason)

const rJust = findPath(graph, farPair[0], farPair[1], { maxHops: farTrueHops - 1 })
check(rJust.found === false, `maxHops:${farTrueHops - 1}（差一跳）找不到`,
  rJust.found ? `${rJust.hops} 跳` : '符合预期')

const rZero = findPath(graph, farPair[0], farPair[1], { maxHops: 0 })
check(rZero.found === false, 'maxHops:0 找不到（除非起终点相同）', '')
const rZeroSelf = findPath(graph, farPair[0], farPair[0], { maxHops: 0 })
check(rZeroSelf.found === true && rZeroSelf.hops === 0, 'maxHops:0 下 a → a 仍然成立', '')

// 加权 + maxHops：跳数预算必须被真正遵守
const wLimited = findPath(graph, farPair[0], farPair[1], { weighted: true, maxHops: 3 })
check(wLimited.found === false, '加权模式同样遵守 maxHops:3',
  wLimited.found ? `${wLimited.hops} 跳` : '')
const wLimited6 = findPath(graph, farPair[0], farPair[1], { weighted: true, maxHops: farTrueHops })
check(wLimited6.found === true && wLimited6.hops <= farTrueHops,
  `加权 + maxHops:${farTrueHops} 找到且不超预算`,
  wLimited6.found ? `${wLimited6.hops} 跳，代价 ${wLimited6.cost.toFixed(3)}` : wLimited6.reason)
const wUnlimited = findPath(graph, farPair[0], farPair[1], { weighted: true })
check(wLimited6.found && wUnlimited.found && wLimited6.cost >= wUnlimited.cost - 1e-9,
  '限制跳数后的加权代价 ≥ 不限跳数的代价（预算只会让解变差）',
  wLimited6.found ? `${wLimited6.cost.toFixed(3)} ≥ ${wUnlimited.cost.toFixed(3)}` : '')

/* ═══════════════ 12. neighbourhood ═══════════════ */
hr('12. neighbourhood —— 邻居数 === degree + 1')

const NB_IDS = ['moduli-space', 'intersection-number', 'mmp', 'cn-hodge',
  'sheaf-cohomology', 'noetherian', nodes.reduce((a, b) => (a.degree <= b.degree ? a : b)).id]

let nbOk = 0
console.log('  节点                                     度   radius1  radius2  radius3')
console.log('  ' + '─'.repeat(58))
for (const id of NB_IDS) {
  const n = byId.get(id)
  const r1m = neighbourhood(graph, id, 1)
  const r2m = neighbourhood(graph, id, 2)
  const r3m = neighbourhood(graph, id, 3)
  const ok = r1m.size === n.degree + 1 && r1m.get(id) === 0
  if (ok) nbOk++
  console.log(`  ${nameOf(id).padEnd(36)} ${String(n.degree).padStart(4)} ` +
    `${String(r1m.size).padStart(7)} ${String(r2m.size).padStart(8)} ${String(r3m.size).padStart(8)}` +
    (ok ? '' : `   ✗ 期望 ${n.degree + 1}`))
}
check(nbOk === NB_IDS.length,
  'neighbourhood(g, id, 1).size === degree + 1（且自己距离为 0）',
  `${nbOk}/${NB_IDS.length}`)

// 半径 2 必须是半径 1 的超集，半径 3 又是半径 2 的超集
let supersetOk = 0
let distOk = 0
for (const id of NB_IDS) {
  const r1m = neighbourhood(graph, id, 1)
  const r2m = neighbourhood(graph, id, 2)
  const r3m = neighbourhood(graph, id, 3)
  const super12 = [...r1m].every(([k, v]) => r2m.has(k) && r2m.get(k) === v)
  const super23 = [...r2m].every(([k, v]) => r3m.has(k) && r3m.get(k) === v)
  if (super12 && super23) supersetOk++

  // 距离必须与手搓 BFS 一致（不能只是"包含"，还要距离对）
  const hand = bfsDist(id)
  let same = true
  for (const [k, v] of r3m) if (hand.get(k) !== v) { same = false; break }
  if (same) distOk++
}
check(supersetOk === NB_IDS.length,
  'radius 2 ⊇ radius 1，radius 3 ⊇ radius 2（且距离值不变）',
  `${supersetOk}/${NB_IDS.length}`)
check(distOk === NB_IDS.length,
  'neighbourhood 的距离 === 手搓 BFS 的距离',
  `${distOk}/${NB_IDS.length}`)

// radius 0 就是自己
const r0m = neighbourhood(graph, 'moduli-space', 0)
check(r0m.size === 1 && r0m.get('moduli-space') === 0, 'radius 0 只含自己', `${r0m.size}`)

// 不存在的 id → 空 Map，不抛
let nbBadThrew = 0
const nbEmpty = neighbourhood(graph, 'no-such-node-xyz', 1)
check(nbEmpty instanceof Map && nbEmpty.size === 0,
  '不存在的 id 返回空 Map（不抛）', `${nbEmpty.size}`)
for (const bad of [null, undefined, {}]) {
  try { neighbourhood(bad, 'x', 1) } catch { nbBadThrew++ }
}
check(nbBadThrew === 0, '畸形 graph 下的 neighbourhood 也不抛', '')

/* ── neighbourhoodEdges：两端都在集合里的线 ── */
const edges1 = neighbourhoodEdges(graph, 'moduli-space', 1)
const inside1 = neighbourhood(graph, 'moduli-space', 1)
const edgesHand = links.filter((l) => inside1.has(l.source) && inside1.has(l.target)).length
check(edges1.length === edgesHand,
  'neighbourhoodEdges 的条数 === 手算「两端都在邻域内」的条数',
  `${edges1.length} === ${edgesHand}`)
check(edges1.every((l) => inside1.has(l.source) && inside1.has(l.target)),
  'neighbourhoodEdges 返回的每条线两端确实都在邻域内')
check(neighbourhoodEdges(graph, 'no-such-node-xyz', 1).length === 0,
  '不存在的 id 的边集合为空')

// 半径 1 的邻域里，边的条数至少要够把 center 连出去
check(edges1.length >= byId.get('moduli-space').degree,
  'radius 1 的边集合 ≥ center 的度（它的每条边都落在邻域内）',
  `${edges1.length} ≥ ${byId.get('moduli-space').degree}`)

/* ═══════════════ 13. queryStats ═══════════════ */
hr('13. queryStats')

const qs = queryStats(graph, parseQuery('is:conjecture -field:ag').test)
check(qs.matched === countOf('is:conjecture -field:ag'),
  'queryStats.matched === 手工遍历的命中数', `${qs.matched}`)
check(qs.total === nodes.length, 'queryStats.total === 节点总数', `${qs.total}`)
const famSum = Object.values(qs.byFamily).reduce((a, b) => a + b, 0)
const statSum = Object.values(qs.byStatus).reduce((a, b) => a + b, 0)
check(famSum === qs.matched && statSum === qs.matched,
  'byFamily / byStatus 的分项之和 === matched',
  `族 ${famSum} · 状态 ${statSum} · 命中 ${qs.matched}`)
console.log(`  例：is:conjecture -field:ag → ${qs.matched}/${qs.total} 个`)
console.log(`      按族 ${JSON.stringify(qs.byFamily)}`)
console.log(`      按状态 ${JSON.stringify(qs.byStatus)}`)

const qsAll = queryStats(graph, parseQuery('*').test)
check(qsAll.matched === nodes.length, 'queryStats(*) 命中全部', `${qsAll.matched}`)

/* ═══════════════ 14. 跳数分布 ═══════════════ */
hr('14. 跳数分布（从枢纽节点 BFS）')

const HUB = 'moduli-space'
const hubDist = bfsDist(HUB)
const hubHist = new Map()
for (const d of hubDist.values()) hubHist.set(d, (hubHist.get(d) || 0) + 1)

console.log(`  枢纽「${nameOf(HUB)}」（度 ${byId.get(HUB).degree}）出发的跳数分布：\n`)
const maxHub = Math.max(...hubHist.keys())
for (let d = 0; d <= maxHub; d++) {
  const c = hubHist.get(d) || 0
  const bar = '█'.repeat(Math.max(0, Math.round(c / 4)))
  console.log(`    ${String(d).padStart(2)} 跳 │${String(c).padStart(4)} ${bar}`)
}
console.log(`    可达 ${hubDist.size} / ${nodes.length} 个节点`)

const hubEcc = Math.max(...hubDist.values())
check(hubDist.size === nodes.length, `枢纽出发可达全部 ${nodes.length} 个节点`,
  `${hubDist.size}`)

/* ── 全图：精确直径、半径、平均最短路径 ──
 * 464 次 BFS，每次 ~3700 条邻接项，总共不到 200 万次操作 —— 直接算精确值，
 * 不搞抽样近似。图这么小的时候，"估算"没有任何理由。 */
const allDist = new Map()
let diam = 0
let diamPair = null
let sumDist = 0
let pairsCount = 0
let radiusOfGraph = Infinity
let centerId = null

for (const n of nodes) {
  const d = bfsDist(n.id)
  let e = 0
  for (const [id, v] of d) {
    if (v > e) e = v
    sumDist += v
    pairsCount++
    if (v > diam) { diam = v; diamPair = [n.id, id] }
  }
  allDist.set(n.id, d)
  if (e < radiusOfGraph) { radiusOfGraph = e; centerId = n.id }
}

const avgDist = sumDist / pairsCount
console.log(`\n  全图（精确计算，${nodes.length} 次 BFS，无抽样）：`)
console.log(`    连通分量   : ${components}`)
console.log(`    直径       : ${diam} 跳   （${nameOf(diamPair[0])} ↔ ${nameOf(diamPair[1])}）`)
console.log(`    半径       : ${radiusOfGraph} 跳   （中心节点「${nameOf(centerId)}」）`)
console.log(`    平均距离   : ${avgDist.toFixed(3)} 跳（有序点对 ${pairsCount} 组）`)
console.log(`    离心率 ≤ 3 : ${[...ecc.values()].filter((v) => v <= 3).length} / ${nodes.length} 个节点`)

const eccHist = new Map()
for (const v of ecc.values()) eccHist.set(v, (eccHist.get(v) || 0) + 1)
console.log(`    离心率分布 : ${[...eccHist].sort((a, b) => a[0] - b[0])
  .map(([k, v]) => `${k}跳:${v}`).join('  ')}`)

check(diam <= 8,
  '直径 ≤ 8 跳（这是个"小世界"图，任意两个公式都离得很近）',
  `实际 ${diam} 跳`)
check(avgDist < 4, '平均距离 < 4 跳', `${avgDist.toFixed(3)}`)
check(components === 1 && hubDist.size === nodes.length,
  '图连通：从任意枢纽出发都能到达全部节点')

// findPath 的最坏情况也要能在有限跳内完成：拿直径那一对实测
const diamRes = findPath(graph, diamPair[0], diamPair[1])
check(diamRes.found === true && diamRes.hops === diam,
  'findPath 在直径那一对上给出的正是直径跳数',
  diamRes.found ? `${diamRes.hops} 跳` : diamRes.reason)

/* ═══════════════ 15. 纯函数性 ═══════════════ */
hr('15. 纯函数性（不修改输入、可重复调用）')

const beforeNodeKeys = JSON.stringify(Object.keys(nodes[0]).sort())
const beforeId = nodes[0].id
const beforeLinkKeys = JSON.stringify(Object.keys(links[0]).sort())
const beforeDegree = byId.get('moduli-space').degree

for (let i = 0; i < 3; i++) {
  parseQuery('family:scheme -status:proved name:"x"')
  findPath(graph, 'nullstellensatz', 'cn-hodge')
  findPath(graph, 'nullstellensatz', 'cn-hodge', { weighted: true, maxHops: 12 })
  neighbourhood(graph, 'moduli-space', 2)
  neighbourhoodEdges(graph, 'moduli-space', 2)
  queryStats(graph, parseQuery('degree:>10').test)
}

check(JSON.stringify(Object.keys(nodes[0]).sort()) === beforeNodeKeys,
  '重复调用没有往节点上塞新字段（小写缓存走 WeakMap，不污染数据）',
  Object.keys(nodes[0]).length + ' 个字段')
check(nodes[0].id === beforeId, '节点本身没被改写')
check(JSON.stringify(Object.keys(links[0]).sort()) === beforeLinkKeys,
  '连线对象没被加字段')
check(byId.get('moduli-space').degree === beforeDegree, 'degree 没被改动')

const rep1 = findPath(graph, 'zariski-topology', 'e-projection-formula', { weighted: true })
const rep2 = findPath(graph, 'zariski-topology', 'e-projection-formula', { weighted: true })
check(JSON.stringify(rep1.path) === JSON.stringify(rep2.path),
  '同一查询重复调用结果完全一致（无隐藏状态）')

/* 模块不依赖 three.js / DOM / fs：能 import 进来本身就是证据 ——
 * 这里再顺手确认一下全局环境里确实没有浏览器对象可供它偷用。 */
check(typeof globalThis.window === 'undefined' && typeof globalThis.document === 'undefined',
  '本进程里没有 window / document —— 上面的断言全在纯 Node 环境下跑通')

/* ═══════════════ 结论 ═══════════════ */
const totalChecks = passed + failed
console.log(`\n${'═'.repeat(64)}`)
if (failed) {
  console.log('失败项：')
  for (const f of failures) console.log(`  ✗ ${f}`)
  console.log('')
}
console.log(`图：${nodes.length} 个节点 / ${links.length} 条连线 · ` +
  `直径 ${diam} 跳 · 平均距离 ${avgDist.toFixed(2)} 跳`)
console.log(`结果：${passed} / ${totalChecks} 通过`)
process.exit(failed ? 1 : 0)
