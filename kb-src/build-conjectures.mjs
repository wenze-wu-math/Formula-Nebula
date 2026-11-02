/**
 * kb-src/build-conjectures.mjs — 从 UnsolvedMath 数据集补充猜想节点。
 *
 * 来源：HuggingFace `cafsdf/UnsolvedMath` 的 problems.json（2084 条，机器可读 JSON）。
 * 聚合自 Millennium Prize、Hilbert、Erdős、Smale、Kirby 低维拓扑、Open Problem Garden 等。
 *
 * ═══ 这个源的实际情况（实测，别高估）═══
 *
 * · 全库 2084 条，去重后 2005 条未解决/部分解决；
 * · 但 `algebraic_geometry` 分类**只有 9 条**，而且其中 3 组是重复条目
 *   （AG-001 出现两次、Hodge 与 MPP-006 重复、Abundance 出现两次）；
 * · 与现有手写的 59 条猜想重叠 11 条。
 *
 * 所以本脚本**不试图用它补代数几何**（现有手写库质量更高），
 * 而是取它的**广度价值**：几何/拓扑/代数三个分类共 639 条，
 * 去重、去重叠加进来，作为星云外围的"未解决问题云"。
 *
 * 用法：
 *   node kb-src/build-conjectures.mjs --stat
 *   node kb-src/build-conjectures.mjs --limit 120
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = join(HERE, '..')
const argv = process.argv.slice(2)
const statOnly = argv.includes('--stat')
const li = argv.indexOf('--limit')
const limit = li >= 0 ? Number(argv[li + 1]) : Infinity

const raw = JSON.parse(readFileSync(join(HERE, 'unsolvedmath-problems.json'), 'utf8'))

/* 只保留未解决 / 部分解决 */
const open = raw.filter((x) => x.status === 'open' || x.status === 'partially_solved')

/* 取几何 / 拓扑 / 代数三类（与知识库的族能对上） */
/* 采集范围：**全部数学领域**（用户指示"一个领域收集完可以去收集其他领域"）。
 * 但按配额分配，避免 number_theory(546) 这种大分类独占。
 * 前提：必须有 LaTeX 陈述（星云上要显示公式）。 */
const WANT_CATS = /^(geometry|topology|algebra|algebraic_geometry|number_theory|graph_theory|combinatorics|group_theory|logic|set_theory|analysis|pde|computer_science|probability|dynamical_systems|physics|miscellaneous)$/

/* 每类配额：保证多样性，小类也给机会 */
const QUOTA = {
  algebraic_geometry: 9,      // 全量（数据集里就 9 题）
  geometry: 60,
  topology: 55,
  algebra: 50,
  number_theory: 55,
  graph_theory: 35,
  combinatorics: 30,
  group_theory: 25,
  logic: 10,
  set_theory: 12,
  analysis: 5,
  pde: 8,
  computer_science: 12,
  probability: 1,
  dynamical_systems: 2,
  physics: 6,
  miscellaneous: 1,
}

function pickByQuota(pool, totalLimit) {
  const byCat = new Map()
  for (const x of pool) {
    const c = x.category?.name || 'miscellaneous'
    if (!byCat.has(c)) byCat.set(c, [])
    byCat.get(c).push(x)
  }
  const out = []
  /* 先按配额取 */
  for (const [cat, quota] of Object.entries(QUOTA)) {
    const list = byCat.get(cat) || []
    out.push(...list.slice(0, quota))
  }
  /* 不够则按剩余填充 */
  if (out.length < totalLimit) {
    const got = new Set(out.map((x) => x.id))
    for (const x of pool) {
      if (out.length >= totalLimit) break
      if (got.has(x.id)) continue
      out.push(x)
      got.add(x.id)
    }
  }
  return out.slice(0, totalLimit)
}

const geo = open.filter((x) => WANT_CATS.test(x.category?.name || ''))

/* 规范化标题做去重键 */
const norm = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '')

/* 与现有手写猜想去重：动态读，避免硬编码名单过期。
 * ⚠ Windows 上不能用 join() 拼出的裸路径做 import —— 会被当成协议 `d:`。
 *   必须转成 file:// URL。 */
const { pathToFileURL } = await import('node:url')
const existing = await import(pathToFileURL(join(ROOT, 'src/data/conjectures.js')).href)
const existTitles = new Set(existing.CONJECTURE_NODES.map((n) => norm(n.en || n.name)))
const existIds = new Set(existing.CONJECTURE_NODES.map((n) => n.id))

const seen = new Set()
const dedup = []
for (const x of geo) {
  const k = norm(x.title)
  if (!k || seen.has(k) || existTitles.has(k)) continue
  seen.add(k)
  dedup.push(x)
}

/* 按领域配额挑选（用户指示"一个领域收集完可以收集其他领域"） */
const picked = limit === Infinity ? dedup : pickByQuota(dedup, limit)

console.log(`原始 ${raw.length} → 未解决 ${open.length} → 候选 ${geo.length}`)
console.log(`去重 + 排除现有 59 条后剩 ${dedup.length}，按配额取 ${picked.length}`)
const catCount = {}
for (const x of picked) {
  const c = x.category?.name || '?'
  catCount[c] = (catCount[c] || 0) + 1
}
console.log('按分类:', JSON.stringify(catCount))

/* ── 分类 → field 映射（复用现有 CONJECTURE_FIELDS 的六个值）── */
/* 分类 → field 映射。
 * ⚠ 之前的 `geometry: 'ag'` 是错的：Kakeya 猜想、Moving Sofa 问题不是代数几何。
 * 现在按数学实质分：
 *   ag      代数几何（含 exchange/commutative algebra 侧）
 *   arith   数论
 *   topo    拓扑 + 几何（微分几何、组合几何）
 *   algebra 代数（群论、环论、表示论）
 *   analysis 分析 + PDE + 概率
 *   logic   逻辑 + 集合论 + 计算机科学
 *   combinatorics → 归 algebra（离散结构）
 */
const FIELD_OF = {
  algebraic_geometry: 'ag',
  geometry: 'topo',            // 几何 → 拓扑与几何
  topology: 'topo',
  algebra: 'algebra',
  group_theory: 'algebra',
  combinatorics: 'algebra',
  graph_theory: 'algebra',
  number_theory: 'arith',
  logic: 'logic',
  set_theory: 'logic',
  computer_science: 'logic',
  analysis: 'analysis',
  pde: 'analysis',
  probability: 'analysis',
  dynamical_systems: 'analysis',
  physics: 'analysis',
  miscellaneous: 'ag',
}
/* status → 现有 CONJECTURE_STATUS 的五个值 */
const STATUS_OF = { open: 'open', partially_solved: 'partial', solved: 'proved', disproved: 'disproved' }

/** 从陈述里抽 LaTeX 公式。
 *
 * ═══ 演进（记下来避免重复踩坑）═══
 * v1：只取「长度 ≥12 的片段」→ 漏掉 `\zeta(s)`（8 字符），
 *     导致 Riemann Hypothesis 这种有公式的条目被判成"无公式"，
 *     退化成 `\text{The Riemann Hypothesis}` 占位。
 * v2：只取单个片段 → 丢掉了陈述的语义上下文
 *     （`$\frac{1}{2}$` 单独拿出来毫无意义）。
 *
 * v3（现在）：**保留完整陈述**。星云上显示一整句带公式的数学命题，
 * 比显示孤立的公式碎片有信息量得多。只有当陈述超长时才退回片段。
 *
 * 前提：数据集的 statement 本身就是混排 LaTeX 的自然语言
 * （如 "Do all non-trivial zeros of ... $\zeta(s)$ have real part equal to $\frac{1}{2}$?"），
 * 这正好是 KaTeX 能直接渲染的形式。
 */
function extractLatex(s) {
  if (!s) return ''
  const src = String(s).trim()

  /* 1) 有 $...$ 或 \(...\) 的，整句保留（这就是最好的显示形式） */
  const hasInline = /\$[^$]+\$/.test(src) || /\\\([\s\S]+?\\\)/.test(src)
  if (hasInline) {
    /* 去掉题型前缀（"Problem " / "Question " 等），它们不是陈述的一部分 */
    const one = src
      .replace(/^\s*(?:Problem|Question|Conjecture|Open Problem|Hypothesis)\s+/i, '')
      .replace(/\s+/g, ' ')
      .trim()
    /* ⚠ 星云上的公式标签盒有宽度上限，超长文字会被压成极小的字（截图可见）。
     * 所以压到 150 字符以内，并且**截在完整 $...$ 边界**上，不留半截公式。 */
    const LIMIT = 150
    if (one.length <= LIMIT) return one

    const D = String.fromCharCode(36)
    const cut = one.slice(0, LIMIT)
    /* 找最后一个成对的 $ 位置（偶数索引 = 闭合） */
    let lastClose = -1
    let dollars = 0
    for (let i = 0; i < cut.length; i++) {
      if (cut[i] === D) {
        dollars++
        if (dollars % 2 === 0) lastClose = i
      }
    }
    /* 截断后若有未闭合的 $，回退到最后一个闭合处；否则按词边界截 */
    let tail
    if (dollars % 2 === 1) {
      tail = lastClose > 40 ? cut.slice(0, lastClose + 1) : cut.slice(0, cut.lastIndexOf(' '))
    } else {
      tail = cut.slice(0, cut.lastIndexOf(' '))
    }
    if (!tail || tail.length < 40) tail = cut
    return (tail.trimEnd() + ' …').replace(/\s+/g, ' ')
  }

  /* 2) 无行内公式但有 LaTeX 命令的，截取含命令的句子 */
  if (/\\[a-zA-Z]{2,}/.test(src)) {
    const t = src.replace(/\s+/g, ' ').trim()
    return t.length > 150 ? t.slice(0, t.lastIndexOf(' ', 150)) + ' …' : t
  }

  /* 3) 纯自然语言 → 交回上层用 \text{} 兜底 */
  return ''
}

/** 难度 1..5 → importance。越难越"重要"（越靠近星云中心），但夹在合理区间 */
function importanceOf(x) {
  const d = Number(x.difficulty?.level ?? x.difficulty_level_id ?? 3)
  const base = 0.5 + 0.09 * Math.max(0, Math.min(5, d))   // 1→0.59 5→0.95
  /* 千年奖 / Hilbert 这类"名题"再加一点 */
  const set = (x.set?.name || '')
  const bonus = /millennium|hilbert|smale/.test(set) ? 0.05 : 0
  return Math.round(Math.min(0.97, base + bonus) * 100) / 100
}

function makeId(x) {
  /* ⚠ 不能用 problem_number 直接派生 id：它在不同 set 之间**不唯一**
   * （ALG-001 既属于 algebra 分类也属于另一个集合，实测撞了 10 条）。
   * 用数据集主键 `id`（整数，全库唯一）最稳，再带上分类前缀便于人读。 */
  const cat = String(x.category?.name || 'x').slice(0, 3)
  return `um-${cat}-${x.id}`
}

function latexFallback(title) {
  /* 数据集里有些标题带题型前缀（"Problem " / "Question " / "Conjecture "），
   * 那是标注用的，不该显示在星云上。 */
  const t = String(title || '')
    .replace(/^(?:Problem|Question|Conjecture|Open Problem|Hypothesis)\s+/i, '')
    .trim()
  if (!t) return ''
  /* \text{} 里不能直接放 _ ^ \ 等，做最小转义 */
  const esc = t.replace(/[\\{}]/g, '').replace(/[_^]/g, (m) => `\\${m}`)
  return `\\text{${esc.slice(0, 60)}}`
}

const nodes = picked.slice(0, limit === Infinity ? picked.length : limit).map((x) => {
  const latex = extractLatex(x.statement) || latexFallback(x.title)
  return {
    id: makeId(x),
    latex,
    name: x.title,
    en: x.title,
    importance: importanceOf(x),
    status: STATUS_OF[x.status] || 'open',
    field: FIELD_OF[x.category?.name] || 'ag',
    year: typeof x.proposed_year === 'number' ? x.proposed_year : null,
    proposer: x.proposed_by || '',
    summary: String(x.statement || '').replace(/\s+/g, ' ').slice(0, 180),
    detail: [x.statement, x.background].filter(Boolean).join('\n\n').replace(/\s+/g, ' ').trim(),
    source: `UnsolvedMath ${x.problem_number || x.id}（${x.set?.name || 'unknown set'} · ${x.category?.name}）`,
    url: 'https://unsolvedmath.com',
  }
})

console.log(`生成猜想 ${nodes.length}`)
const byField = {}
for (const n of nodes) byField[n.field] = (byField[n.field] || 0) + 1
console.log('按 field:', JSON.stringify(byField))
console.log('有 latex:', nodes.filter((n) => n.latex).length)
console.log('importance:', Math.min(...nodes.map((n) => n.importance)), '~', Math.max(...nodes.map((n) => n.importance)))
const idClash = nodes.filter((n) => existIds.has(n.id))
console.log('与现有猜想 id 冲突:', idClash.length)

/* ── 关联 ──
 * 新猜想若不连边，会在星云里变成漂浮孤点（实测 110 个）。
 * 用两个可解释的来源补边：
 *   a) **同 field 挂到现有手写猜想**：algebraic_geometry → cn-hodge，
 *      topology → cn-poincare，algebra → cn-langlands ……
 *      手写条目是人工精选的"领域锚点"，新条目挂上去语义上成立。
 *   b) **同 field 内部相邻**：同领域的新条目两两连成短链，
 *      避免 120 个点全挂在同一个锚点上（星云里会变成一根刺）。 */
const FIELD_ANCHOR = {
  ag: 'cn-hodge',
  arith: 'cn-riemann',
  topo: 'cn-poincare',
  algebra: 'cn-langlands',
  analysis: 'cn-navier-stokes',
  logic: 'cn-continuum',
}
const links = []
const linkSeen = new Set()
const addLink = (a, b, w, label, type) => {
  if (!a || !b || a === b) return false
  const k = a < b ? `${a}|${b}` : `${b}|${a}`
  if (linkSeen.has(k)) return false
  linkSeen.add(k)
  links.push([a, b, w, label, type])
  return true
}

/* a) 挂到领域锚点 */
const anchorIds = new Set(existing.CONJECTURE_NODES.map((n) => n.id))
let anchored = 0
for (const n of nodes) {
  const a = FIELD_ANCHOR[n.field]
  if (a && anchorIds.has(a) && addLink(a, n.id, 0.3, 'field', 'sameFamily')) anchored++
}
/* b) 同 field 内部相邻成链（按 importance 降序，相邻两条连起来） */
const byFieldGroup = new Map()
for (const n of nodes) {
  if (!byFieldGroup.has(n.field)) byFieldGroup.set(n.field, [])
  byFieldGroup.get(n.field).push(n)
}
let chained = 0
for (const g of byFieldGroup.values()) {
  g.sort((a, b) => b.importance - a.importance)
  for (let i = 1; i < g.length; i++) {
    if (addLink(g[i - 1].id, g[i].id, 0.22, 'adjacent', 'related')) chained++
  }
}
console.log(`关联：锚点 ${anchored} / 链 ${chained}，合计 ${links.length}`)

if (statOnly) process.exit(0)

const dest = join(ROOT, 'src', 'data', 'unsolved-extra.js')
mkdirSync(dirname(dest), { recursive: true })
const body = `/**
 * src/data/unsolved-extra.js — 由 UnsolvedMath 数据集自动抽取的补充猜想。
 *
 * ⚠ 生成物，不要手改。重新生成：
 *     node kb-src/build-conjectures.mjs --limit 120
 *
 * 来源：HuggingFace \`cafsdf/UnsolvedMath\` 的 problems.json
 *       （聚合 Millennium Prize / Hilbert / Erdős / Smale / Kirby / Open Problem Garden）
 * 已与手写的 conjectures.js 去重（按标题规范化），不会重复收录。
 *
 * 生成时间：${new Date().toISOString()}
 * 条数：${nodes.length}
 */

export const UNSOLVED_NODES = ${JSON.stringify(nodes, null, 1)}

export const UNSOLVED_LINKS = ${JSON.stringify(links, null, 0).replace(/\],\[/g, '],\n  [')}
`
writeFileSync(dest, body, 'utf8')
console.log(`\n写入 ${dest}（${(Buffer.byteLength(body) / 1048576).toFixed(2)} MB）`)
