/**
 * kb-src/build-nodes.mjs — 把 Stacks Project 结果转成知识库节点与关联。
 *
 * ═══ 设计原则 ═══
 *
 * 1. **不覆盖手写内容**。现有 405 条定理是人工撰写的高质量中文条目，
 *    本脚本产出的是**补充节点**，写入独立文件 `src/data/stacks-extra.js`，
 *    由 knowledge.js 汇总（不修改原 NODES 数组）。
 *
 * 2. **只收可复核的**。每条节点都带 `tag` 与 `url`，指向 stacks.math.columbia.edu
 *    的稳定地址。没有 tag 的条目（上游索引缺项）一律丢弃。
 *
 * 3. **关联来自真实引用**。Stacks 源码里 `\ref{...}` 是作者显式建立的依赖，
 *    解析出的边比 LLM 猜测可靠得多。权重按"被引用次数"归一。
 *
 * 4. **重要性可解释**。用"被引用次数 + 是否 theorem/proposition"派生，
 *    不拍脑袋：被引 50 次以上的定理必然比被引 1 次的引理重要。
 *
 * 用法：
 *   node kb-src/build-nodes.mjs --stat          # 只统计
 *   node kb-src/build-nodes.mjs --limit 300     # 生成前 N 条
 *   node kb-src/build-nodes.mjs                 # 全量生成
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = join(HERE, '..')

const results = JSON.parse(readFileSync(join(HERE, 'out', 'stacks-results.json'), 'utf8'))
const argv = process.argv.slice(2)
const statOnly = argv.includes('--stat')
const limitArg = argv.indexOf('--limit')
const limit = limitArg >= 0 ? Number(argv[limitArg + 1]) : Infinity

/* ── 1. 过滤：必须有 tag ── */
const usable = results.filter((r) => r.tag && r.statement && r.statement.length >= 40)
console.log(`可用结果 ${usable.length} / ${results.length}`)

/* ── 2. 统计被引用次数（入度）→ 派生 importance ── */
const known = new Map(usable.map((r) => [`${r.file}-${r.label}`, r]))
const inDeg = new Map()
for (const r of usable) {
  for (const ref of r.refs) {
    const key = known.has(ref) ? ref : (known.has(`${r.file}-${ref}`) ? `${r.file}-${ref}` : null)
    if (!key) continue
    inDeg.set(key, (inDeg.get(key) || 0) + 1)
  }
}
const maxDeg = Math.max(1, ...inDeg.values())
console.log(`被引最多 ${maxDeg} 次；有入度的结果 ${inDeg.size} 条`)

/* ── 3. 环境 → importance 加成（theorem/proposition 比 remark 重要）── */
const ENV_WEIGHT = {
  theorem: 1.0, proposition: 0.95, corollary: 0.9, lemma: 0.85,
  definition: 0.9, example: 0.7, exercise: 0.5, remark: 0.5,
  situation: 0.55, construction: 0.7, conjecture: 1.0,
}

/* ── 4. 章节 → 知识族映射 ──
 * 用 Stacks 的文件名做粗粒度归类，落到现有 8 个族上。
 * 这不是"完美语义分类"，但可解释、可复核，且覆盖全部文件。 */
const FILE_FAMILY = {
  sets: 'foundation', categories: 'foundation', algebra: 'foundation',
  'more-algebra': 'foundation', fields: 'foundation', modules: 'foundation',
  schemes: 'scheme', sheaves: 'scheme', varieties: 'scheme',
  sites: 'cohomology', 'sites-modules': 'cohomology', 'sites-cohomology': 'cohomology',
  cohomology: 'cohomology', homology: 'cohomology', derived: 'cohomology',
  simplicial: 'cohomology', injectives: 'cohomology', duality: 'cohomology',
  dualizing: 'cohomology', 'etale-cohomology': 'cohomology', crystalline: 'cohomology',
  derham: 'cohomology', dga: 'cohomology',
  morphisms: 'map', 'more-morphisms': 'map', properties: 'map', constructions: 'map',
  cotangent: 'map', defos: 'map', formal: 'map', 'formal-spaces': 'map',
  curves: 'curve', divisors: 'curve', pic: 'curve',
  intersection: 'intersect', chow: 'intersect',
  etale: 'birational', flat: 'birational', descent: 'birational', smooth: 'birational',
  resolve: 'birational', perfect: 'birational',
  stacks: 'modern', 'stacks-morphisms': 'modern', 'stacks-properties': 'modern',
  'stacks-sheaves': 'modern', 'stacks-cohomology': 'modern',
  spaces: 'modern', 'spaces-morphisms': 'modern', 'spaces-properties': 'modern',
  'spaces-cohomology': 'modern', moduli: 'modern', 'moduli-curves': 'modern',
  groupoids: 'modern', quot: 'modern', brauer: 'modern', weil: 'modern',
}
const familyOf = (file) => FILE_FAMILY[file] || 'modern'

/* ── 5. 生成节点 ── */
/* Stacks 的 label 形如 `lemma-smooth-locally-finite-presentation`，
 * 去掉环境前缀后就是一段可读的英文描述，比 `situation · Setup` 有辨识度。 */
const ENV_PREFIX = /^(lemma|theorem|proposition|corollary|definition|example|exercise|remark|situation|construction|conjecture)-/
function humanName(r) {
  if (r.title) return r.title
  const bare = r.label.replace(ENV_PREFIX, '').replace(/-/g, ' ').trim()
  if (bare.length >= 4) return bare.charAt(0).toUpperCase() + bare.slice(1)
  return `${r.env} · ${r.section || r.chapter || r.file}`
}

function makeId(r) {
  /* id 用 tag：稳定、唯一、短，且与 Stacks 官方一致 */
  return `stx-${r.tag.toLowerCase()}`
}

/** 从 statement 里抽一个 LaTeX 公式作为星云上显示的文字。
 *
 * 取舍：星云上的公式文字是**视觉主体**，抽错了（例如抽到一句散文片段）
 * 会让整张图看起来像乱码。所以按"数学信息量"从高到低尝试：
 *   1. 最长的 $$...$$ 显示公式（通常是结果的核心等式）
 *   2. 最长的 $...$ 行内公式
 *   3. 都没有就返回空 —— 前端会退化成只显示名字，而不是显示散文
 */
function extractLatex(statement) {
  const candidates = []
  /* $$...$$ —— 允许跨行 */
  for (const m of statement.matchAll(/\$\$([\s\S]{6,400}?)\$\$/g)) {
    const s = m[1].replace(/\s+/g, ' ').trim()
    /* 排除 xymatrix：KaTeX 不支持，放上去只会渲染失败 */
    if (/\\xymatrix|\\ar\[|\\begin\{(align|array|matrix|cases)/.test(s)) continue
    if (s.length >= 8) candidates.push(s)
  }
  /* $...$ —— 行内，排除纯文本型（不含反斜杠/运算符的） */
  for (const m of statement.matchAll(/\$([^$]{6,200}?)\$/g)) {
    const s = m[1].replace(/\s+/g, ' ').trim()
    if (/\\xymatrix|\\ar\[/.test(s)) continue
    /* 必须含数学符号，否则可能是一句被 $ 包起来的自然语言 */
    if (!/[\\^_=<>+-]/.test(s)) continue
    /* 排除"散文片段"：这些是作者用 $...$ 包起来的正文强调，不是公式。
     * 判据（任一条命中即排除）：
     *   · 含 `\ref{` / `\cite{`（是引用，不是公式）
     *   · 含 `{\it` / `\emph{`（是排版强调）
     *   · 含 3 个连续英文单词，且数学符号少于 3 个
     * 已知会漏网的例子：`has {\it property` / `satisfies a set theoretic condition` */
    if (/\\ref\{|\\cite\{|\{\\it\b|\\emph\{/.test(s)) continue
    const mathChars = (s.match(/[\\^_{}=<>+-]/g) || []).length
    const wordRuns = (s.match(/[A-Za-z]{3,}\s+[A-Za-z]{3,}\s+[A-Za-z]{3,}/g) || []).length
    if (wordRuns > 0 && mathChars < 3) continue
    /* 纯英文单词拼成的（无任何反斜杠/运算符组合）也排除 */
    if (!/\\[A-Za-z]|[=^_<>]/.test(s)) continue
    candidates.push(s)
  }
  if (!candidates.length) return ''
  /* 取最长的：最长公式通常承载结果的核心断言 */
  candidates.sort((a, b) => b.length - a.length)
  return candidates[0].slice(0, 220)
}

/** 陈述太长时截断成"一句话"，尽量断在句号处 */
function oneLine(statement, maxLen = 220) {
  const s = statement.replace(/\s+/g, ' ').trim()
  if (s.length <= maxLen) return s
  const cut = s.slice(0, maxLen)
  const lastDot = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('; '))
  return (lastDot > maxLen * 0.5 ? cut.slice(0, lastDot + 1) : cut) + '…'
}

/* 按入度排序：先做被引最多的核心结果，保证第一批就是"该有的"。
 *
 * ⚠ 但"被引最多"不等于"最适合放进星云"：`situation` 是 Stacks 的
 * "全局设定"（例如"设 S 是诺特概形…"），被引次数极高，却**没有公式**，
 * 而且内容是一串前提假设，放进星云既占最显眼的位置、又显示不出东西。
 * 所以排序时先按"能否可视化"分层，再按入度。 */
const VIS_WEIGHT = { ...ENV_WEIGHT, situation: 0 }   // situation 排序权重归零
const ordered = [...usable].sort((a, b) => {
  /* 第一关键字：有可用 LaTeX 的优先（星云上才有东西可显示） */
  const la = extractLatex(a.statement) ? 1 : 0
  const lb = extractLatex(b.statement) ? 1 : 0
  if (lb !== la) return lb - la
  const da = inDeg.get(`${a.file}-${a.label}`) || 0
  const db = inDeg.get(`${b.file}-${b.label}`) || 0
  if (db !== da) return db - da
  return (VIS_WEIGHT[b.env] || 0.5) - (VIS_WEIGHT[a.env] || 0.5)
})

/* ── 5b. 按族配额挑选（`--balanced` 模式）──
 *
 * 问题：纯按入度排序会让"上同调"占 29%，而"概形与层"只有 5.5%
 * —— 这跟 Stacks 本身在上同调上的篇幅有关，但作为知识图谱，分布太偏。
 *
 * 修法：给每个族一个**目标占比**，按缺口从各族里挑。
 * 目标占比按"知识图谱应该长什么样"设定，而不是照抄源数据分布：
 *   · 概形与层、交换代数、上同调 是代数几何的三大支柱 → 各 ~18%
 *   · 曲线曲面、双有理、相交、态射 → 各 ~11-13%
 *   · 模空间与现代 → ~12%
 */
const TARGET_SHARE = {
  scheme: 0.18,
  foundation: 0.17,
  cohomology: 0.17,
  curve: 0.12,
  birational: 0.11,
  intersect: 0.11,
  map: 0.09,
  modern: 0.05,
}

const balanced = argv.includes('--balanced')

/** 在候选集里按族分组，各自按既有排序排好 */
function pickBalanced(cands, total) {
  const byFam = new Map()
  for (const r of cands) {
    const f = familyOf(r.file)
    if (!byFam.has(f)) byFam.set(f, [])
    byFam.get(f).push(r)
  }
  const picked = []
  const used = new Set()
  /* 按目标占比分配名额，逐个族取 */
  for (const [fam, share] of Object.entries(TARGET_SHARE)) {
    const quota = Math.round(total * share)
    const pool = byFam.get(fam) || []
    for (const r of pool.slice(0, quota)) {
      picked.push(r)
      used.add(`${r.file}-${r.label}`)
    }
  }
  /* 若某族不够，用剩余候选补满 */
  if (picked.length < total) {
    for (const r of cands) {
      if (picked.length >= total) break
      if (used.has(`${r.file}-${r.label}`)) continue
      picked.push(r)
      used.add(`${r.file}-${r.label}`)
    }
  }
  /* 保持原有排序（视觉优先 + 入度） */
  const rank = new Map(ordered.map((r, i) => [`${r.file}-${r.label}`, i]))
  picked.sort((a, b) => (rank.get(`${a.file}-${a.label}`) ?? 1e9) - (rank.get(`${b.file}-${b.label}`) ?? 1e9))
  return picked
}

const picked = balanced
  ? pickBalanced(ordered, limit === Infinity ? ordered.length : limit)
  : ordered.slice(0, limit === Infinity ? ordered.length : limit)

if (balanced) {
  const dist = {}
  for (const r of picked) {
    const f = familyOf(r.file)
    dist[f] = (dist[f] || 0) + 1
  }
  console.log('均衡模式，各族实际数量:', JSON.stringify(dist))
}

const nodes = picked.map((r) => {
  const deg = inDeg.get(`${r.file}-${r.label}`) || 0
  const hasLatex = !!extractLatex(r.statement)
  /* importance ∈ [0.35, 0.97]：
   *   · 入度用 log 压缩（避免一条被引 80 次的结果把其余全压到地板）；
   *   · 环境权重做乘性调整；
   *   · **没有公式的结果压一档** —— 星云上它的位置显示不出内容，
   *     重要性给高了会占据最显眼的中心位置却是个空壳。 */
  const degPart = Math.log1p(deg) / Math.log1p(maxDeg)
  const envPart = VIS_WEIGHT[r.env] ?? 0.5
  let imp = 0.35 + 0.62 * (0.75 * degPart + 0.25 * envPart)
  if (!hasLatex) imp *= 0.82
  return {
    id: makeId(r),
    tag: r.tag,
    url: r.url,
    env: r.env,
    latex: extractLatex(r.statement),
    name: r.title || `${r.env} · ${r.section || r.chapter || r.file}`,
    en: r.label,
    importance: Math.round(Math.min(0.97, Math.max(0.35, imp)) * 100) / 100,
    family: familyOf(r.file),
    summary: oneLine(r.slogan || r.statement, 160),
    detail: r.statement,
    source: `Stacks Project, ${r.env} ${r.tag}（${r.file}.tex${r.section ? ' · ' + r.section : ''}）`,
  }
})

/* ── 6. 生成关联（来自 \ref + 主题邻近）──
 *
 * 实测发现：**62% 的 Stacks 结果是完全孤立的**（既无出向 \ref 也无入向被引）。
 * 原因不是解析错误 —— 77% 的引理本身就不引用任何东西（它们是自足的陈述）。
 * 如果只连 \ref 边，星云里会出现大量漂浮的点，知识图谱的意义就没了。
 *
 * 所以补两类"结构性"边，都可解释、可复核：
 *   a) **同章节**：同一个小节里的结果天然主题相关（Stacks 的小节标题
 *      就是主题名，例如 "Tensor products" 下的所有结果）。
 *   b) **同文件邻近**：同一章节文件内、顺序相邻的结果（作者把它们放在一起
 *      就是在讲同一件事）。
 * 权重都低于 \ref 边（0.25 / 0.18），保证"真实引用"在视觉上更亮。 */
const idOf = new Map(picked.map((r) => [`${r.file}-${r.label}`, makeId(r)]))
const linkSeen = new Set()
const links = []

function addLink(from, to, w, label, type) {
  if (!from || !to || from === to) return false
  const pair = from < to ? `${from}|${to}` : `${to}|${from}`
  if (linkSeen.has(pair)) return false
  linkSeen.add(pair)
  links.push([from, to, w, label, type])
  return true
}

/* a) 真实 \ref 边（最强） */
for (const r of picked) {
  const from = idOf.get(`${r.file}-${r.label}`)
  if (!from) continue
  for (const ref of r.refs) {
    const key = known.has(ref) ? ref : (known.has(`${r.file}-${ref}`) ? `${r.file}-${ref}` : null)
    if (!key) continue
    const to = idOf.get(key)
    if (!to) continue
    const deg = inDeg.get(key) || 0
    const w = Math.round(Math.max(0.3, Math.min(1, 0.3 + 0.7 * Math.log1p(deg) / Math.log1p(maxDeg))) * 100) / 100
    addLink(from, to, w, 'ref', 'depends')
  }
}

/* b) 同章节边：把每个 (file, section) 分组，组内按重要性连成链 + 连到组内最重要的 */
const bySection = new Map()
for (const r of picked) {
  if (!r.section) continue
  const k = `${r.file}::${r.section}`
  if (!bySection.has(k)) bySection.set(k, [])
  bySection.get(k).push(r)
}
let secEdges = 0
for (const group of bySection.values()) {
  if (group.length < 2) continue
  /* 组内按入度降序，第一个当"锚点"，其余连到锚点；再补相邻链 */
  group.sort((a, b) => (inDeg.get(`${b.file}-${b.label}`) || 0) - (inDeg.get(`${a.file}-${a.label}`) || 0))
  const anchor = idOf.get(`${group[0].file}-${group[0].label}`)
  for (let i = 1; i < group.length; i++) {
    const id = idOf.get(`${group[i].file}-${group[i].label}`)
    if (addLink(anchor, id, 0.25, 'section', 'related')) secEdges++
    /* 相邻链：让同节结果不至于都只挂在锚点上（星云里会变成一根刺） */
    if (i > 1) {
      const prev = idOf.get(`${group[i - 1].file}-${group[i - 1].label}`)
      addLink(prev, id, 0.18, 'adjacent', 'related')
    }
  }
}

/* c) 跨文件同主题：同一章节标题（例如多个文件都有 "Cohomology" 小节）*/
const byTitle = new Map()
for (const r of picked) {
  if (!r.section) continue
  const k = r.section.toLowerCase()
  if (!byTitle.has(k)) byTitle.set(k, [])
  byTitle.get(k).push(r)
}
let titleEdges = 0
for (const group of byTitle.values()) {
  if (group.length < 2) continue
  /* 只连每组的 top-1 与 top-2，避免边数爆炸 */
  group.sort((a, b) => (inDeg.get(`${b.file}-${b.label}`) || 0) - (inDeg.get(`${a.file}-${a.label}`) || 0))
  const a = idOf.get(`${group[0].file}-${group[0].label}`)
  for (let i = 1; i < Math.min(3, group.length); i++) {
    const b = idOf.get(`${group[i].file}-${group[i].label}`)
    if (a !== b) { addLink(a, b, 0.15, 'topic', 'related'); titleEdges++ }
  }
}

console.log(`关联：ref ${links.filter((l) => l[3] === 'ref').length} / section ${secEdges} / topic ${titleEdges}，合计 ${links.length}`)

/* d) 兜底：仍然孤立的结果（同章节里只有它一个）挂到本族最重要的节点上。
 * 这类节点约占 3%，如果不处理，星云里会出现一批漂浮的孤点 ——
 * 视觉上像 bug，语义上也确实"没接上知识网络"。 */
const connected = new Set()
for (const l of links) { connected.add(l[0]); connected.add(l[1]) }
const orphans = picked.filter((r) => !connected.has(idOf.get(`${r.file}-${r.label}`)))
/* 每族选 importance 最高的作为锚点 */
const famAnchor = new Map()
for (const r of picked) {
  const id = idOf.get(`${r.file}-${r.label}`)
  if (!connected.has(id)) continue
  const f = familyOf(r.file)
  const cur = famAnchor.get(f)
  const imp = 0.35 + 0.62 * (Math.log1p(inDeg.get(`${r.file}-${r.label}`) || 0) / Math.log1p(maxDeg))
  if (!cur || imp > cur.imp) famAnchor.set(f, { id, imp })
}
let orphanEdges = 0
for (const r of orphans) {
  const a = famAnchor.get(familyOf(r.file))
  if (!a) continue
  if (addLink(a.id, idOf.get(`${r.file}-${r.label}`), 0.12, 'family', 'related')) orphanEdges++
}
console.log(`兜底：孤立 ${orphans.length} 条，连上 ${orphanEdges} 条到本族锚点`)

console.log(`生成节点 ${nodes.length}，关联 ${links.length}`)
const famCount = {}
for (const n of nodes) famCount[n.family] = (famCount[n.family] || 0) + 1
console.log('按族：', JSON.stringify(famCount, null, 1))
console.log('importance 范围:', Math.min(...nodes.map((n) => n.importance)), '~', Math.max(...nodes.map((n) => n.importance)))
console.log('有 latex 的:', nodes.filter((n) => n.latex).length)

if (statOnly) process.exit(0)

/* ── 7. 写出 ── */
const dest = join(ROOT, 'src', 'data', 'stacks-extra.js')
mkdirSync(dirname(dest), { recursive: true })
const body = `/**
 * src/data/stacks-extra.js — 由 Stacks Project 官方源码自动抽取的补充节点。
 *
 * ⚠ 本文件是**生成物**，不要手改。重新生成：
 *     node kb-src/fetch-stacks.mjs && node kb-src/parse-stacks.mjs && node kb-src/build-nodes.mjs
 *
 * 来源：https://github.com/stacks/stacks-project（官方 LaTeX 源码，master 分支）
 * 每条节点都有 \`tag\` 与 \`url\`，指向 stacks.math.columbia.edu 的稳定地址，可逐条复核。
 *
 * 字段说明见 knowledge.js 头注释；额外字段：
 *   tag    Stacks 的 4 字符稳定标签（官方唯一标识）
 *   url    官方页面
 *   env    lemma / theorem / definition / …
 *   source 出处（文件 + 章节）
 *
 * 生成时间：${new Date().toISOString()}
 * 节点数：${nodes.length}　关联数：${links.length}
 */

export const STACKS_NODES = ${JSON.stringify(nodes, null, 1)}

export const STACKS_LINKS = ${JSON.stringify(links, null, 0).replace(/\],\[/g, '],\n  [')}
`
writeFileSync(dest, body, 'utf8')
console.log(`\n写入 ${dest}（${(Buffer.byteLength(body) / 1048576).toFixed(2)} MB）`)
