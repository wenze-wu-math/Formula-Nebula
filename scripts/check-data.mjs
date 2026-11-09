/**
 * 校验扩展知识库：id 唯一、latex 无重复、连线两端存在、权重合法。
 * 用法: node scripts/check-data.mjs
 */
import { readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dataDir = join(root, 'src', 'data')

/* 猜想字段的白名单直接取自数据模块，而不是在这里再抄一遍 ——
 * 抄一遍的话，将来往 conjectures.js 里加一个状态（比如 'refuted-partly'），
 * 校验脚本会开始报假错误，而人会去改脚本而不是改数据。 */
const cj = await import(pathToFileURL(join(dataDir, 'conjectures.js')).href)
const STATUSES = new Set(Object.keys(cj.CONJECTURE_STATUS))
const FIELDS = new Set(Object.keys(cj.CONJECTURE_FIELDS))

const files = readdirSync(dataDir).filter(f => f.endsWith('.js'))
const all = []
for (const f of files) {
  const mod = await import(pathToFileURL(join(dataDir, f)).href)
  for (const [k, v] of Object.entries(mod)) {
    if (!Array.isArray(v)) continue
    /* 约定：knowledge.js 导出 NODES / LINKS，扩展文件导出 EXTRA_*_NODES /
     * EXTRA_*_LINKS，猜想星团导出 CONJECTURE_NODES / CONJECTURE_LINKS。
     *
     * ⚠ 猜想那一组**必须**包含进来。最初的正则只认 `(EXTRA_[A-Z_]*)?`，
     *   于是 conjectures.js 的节点与连线被整个跳过 —— 后果不是"少检查一些
     *   东西"那么轻：extra-f / extra-g 里指向 `cn-*` 的 5 条跨星团连线
     *   会被报成"终点不存在"（**假阳性**），而猜想自己的悬空引用
     *   一个都查不出来（**假阴性**）。两头都错。 */
    if (/^((EXTRA|CONJECTURE)_[A-Z_]*)?NODES$/.test(k)) all.push({ file: f, kind: 'node', items: v })
    if (/^((EXTRA|CONJECTURE)_[A-Z_]*)?LINKS$/.test(k)) all.push({ file: f, kind: 'link', items: v })
  }
}

let errors = 0
const err = (m) => { console.log('  ✗ ' + m); errors++ }

const ids = new Map()
const latexes = new Map()
const nodes = []
const links = []

for (const g of all) {
  for (const it of g.items) {
    if (g.kind === 'node') {
      if (!it.id) { err(`${g.file}: 缺 id`); continue }
      if (ids.has(it.id)) err(`id 重复: ${it.id} (${g.file} 与 ${ids.get(it.id)})`)
      else ids.set(it.id, g.file)
      if (!it.latex) err(`${it.id}: 缺 latex`)
      else if (latexes.has(it.latex)) err(`latex 重复: ${it.id} 与 ${latexes.get(it.latex)}`)
      else latexes.set(it.latex, it.id)
      if (typeof it.importance !== 'number' || it.importance < 0 || it.importance > 1)
        err(`${it.id}: importance 非法 (${it.importance})`)
      /* 必填字段。
       * ⚠ 猜想节点**没有 `family`** —— 它们用的是 `field`（6 个数学领域）。
       *   这是刻意的设计，不是遗漏：`family` 决定挂在哪条旋臂上，
       *   而星团是球、没有旋臂，`graph.js` 会自动把猜想标成
       *   `family: 'conjecture'` 并走球面布局。所以这里用
       *   "有 field 就不要求 family"来表达这条规则。 */
      const required = it.field
        ? ['name', 'en', 'summary', 'detail']
        : ['name', 'en', 'family', 'summary', 'detail']
      for (const f of required)
        if (!it[f]) err(`${it.id}: 缺 ${f}`)
      // 面板里 summary 是自动换行的段落，约 28 字/行，超过 42 字就要占三行以上，读起来散
      if (it.summary && it.summary.length > 42) err(`${it.id}: summary 过长 (${it.summary.length})`)
      /* ── 猜想专属字段 ──
       * 这几项**必须**合法，因为它们是星团唯一的信息维度：
       *   status 决定色点颜色（也是"这条定了没"的唯一表达）
       *   field  决定球面方向（6 个领域各占一侧）
       * 写错一个值，graph.js 会静默退回默认（open / ag）——
       * 布局不会崩，但读者会得到**错误的知识**，这是最坏的一类 bug。
       * 所以这里用白名单硬校验。 */
      if (it.field !== undefined && !FIELDS.has(it.field))
        err(`${it.id}: field 非法 (${it.field})，应为 ${[...FIELDS].join('/')}`)
      if (it.status !== undefined && !STATUSES.has(it.status))
        err(`${it.id}: status 非法 (${it.status})，应为 ${[...STATUSES].join('/')}`)
      if (it.year !== undefined && (!Number.isInteger(it.year) || it.year < 1600 || it.year > 2100))
        err(`${it.id}: year 非法 (${it.year})`)
      nodes.push(it)
    } else {
      links.push({ ...{ file: g.file }, t: it })
    }
  }
}

const N = nodes.length
/* 连线元组现在是 5 元：[源, 目标, 权重, 理由, 关系类型]。
 *
 * ⚠ 第 5 项是**可选**的（新加的边允许先不写，走正则兜底），
 *   但一旦写了就必须是合法 id —— 拼错的 id 会被
 *   resolveLinkType 静默退回推断，那条边的颜色就成了"猜的"，
 *   而数据检查完全看不出来。所以这里要挡住。 */
const LEGAL_TYPES = new Set([
  'related', 'equivalent', 'defines', 'computes', 'property', 'depends',
  'implies', 'generalizes', 'provenance', 'contrast', 'analogy', 'sameFamily',
])
let typedCount = 0
for (const { file, t } of links) {
  if (!Array.isArray(t) || (t.length !== 4 && t.length !== 5)) {
    err(`${file}: 连线格式错（应为 4 或 5 元） ${JSON.stringify(t)}`)
    continue
  }
  const [a, b, w, why, type] = t
  if (!ids.has(a)) err(`${file}: 连线起点不存在 -> ${a}`)
  if (!ids.has(b)) err(`${file}: 连线终点不存在 -> ${b}`)
  if (a === b) err(`${file}: 自环 ${a}`)
  if (typeof w !== 'number' || w <= 0 || w > 1) err(`${file}: 权重非法 ${a}-${b} = ${w}`)
  if (!why) err(`${file}: 连线缺说明 ${a}-${b}`)
  if (type !== undefined) {
    if (!LEGAL_TYPES.has(type)) err(`${file}: 关系类型非法 ${a}-${b} = ${JSON.stringify(type)}`)
    else typedCount++
  }
}

// 连通性 / 孤立点
const deg = new Map(nodes.map(n => [n.id, 0]))
for (const { t } of links) {
  if (Array.isArray(t) && t.length >= 4) {
    if (deg.has(t[0])) deg.set(t[0], deg.get(t[0]) + 1)
    if (deg.has(t[1])) deg.set(t[1], deg.get(t[1]) + 1)
  }
}
const isolated = [...deg].filter(([, d]) => d === 0).map(([id]) => id)
if (isolated.length) err(`孤立节点 ${isolated.length} 个: ${isolated.slice(0, 8).join(', ')}`)

const dupEdge = new Map()
for (const { t } of links) {
  if (!Array.isArray(t)) continue
  const key = [t[0], t[1]].sort().join('|')
  dupEdge.set(key, (dupEdge.get(key) || 0) + 1)
}
const multi = [...dupEdge].filter(([, c]) => c > 1)
if (multi.length) err(`重复连线 ${multi.length} 条: ${multi.slice(0, 5).map(m => m[0]).join(', ')}`)

/* 族分布 / 领域分布 / 状态分布分开统计。
 * 猜想没有 family（有 field），所以不能把它们混进族分布里 ——
 * 那样会出现一行 `undefined: 59`，看起来像数据坏了。 */
const byFam = {}
const byField = {}
const byStatus = {}
let conjCount = 0
for (const n of nodes) {
  if (n.field) {
    conjCount++
    byField[n.field] = (byField[n.field] || 0) + 1
    byStatus[n.status] = (byStatus[n.status] || 0) + 1
  } else {
    byFam[n.family] = (byFam[n.family] || 0) + 1
  }
}
const imp = nodes.map(n => n.importance).sort((a, b) => a - b)
const conjImp = nodes.filter(n => n.field).map(n => n.importance)

console.log(`\n文件: ${files.join(', ')}`)
console.log(`节点 ${N} 个 / 连线 ${links.length} 条` +
  `（主星系 ${N - conjCount} + 猜想星团 ${conjCount}）`)
console.log(`族分布（主星系）: ${Object.entries(byFam).map(([k, v]) => `${k}:${v}`).join('  ')}`)
console.log(`领域分布（星团）: ${Object.entries(byField).map(([k, v]) => `${k}:${v}`).join('  ')}`)
console.log(`状态分布（星团）: ${Object.entries(byStatus).map(([k, v]) => `${k}:${v}`).join('  ')}`)
console.log(`重要性 中位 ${imp[Math.floor(N / 2)]}  区间 [${imp[0]}, ${imp[N - 1]}]` +
  (conjImp.length ? `  ｜ 星团区间 [${Math.min(...conjImp)}, ${Math.max(...conjImp)}]` : ''))
console.log(`平均度 ${(links.length * 2 / N).toFixed(2)}`)
/* 关系类型覆盖也要报出来。
 * 这是数据的**核心质量指标**之一：类型是逐条读出来的，不是正则猜的，
 * 所以"有多少条写了类型"直接反映这份数据被读过多少。
 * 不报的话，将来有人加了一批边却没写类型，这个数字会悄悄掉下去。 */
console.log(`关系类型 ${typedCount} / ${links.length} 条带类型` +
  `（${((typedCount / links.length) * 100).toFixed(1)}%）`)
console.log(errors ? `\n✗ 发现 ${errors} 个问题` : `\n✓ 数据校验通过`)
process.exit(errors ? 1 : 0)
