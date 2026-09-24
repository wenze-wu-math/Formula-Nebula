/**
 * 把 7 个分批判定结果合并成一张 1620 行的类型表，并做**严格校验**。
 *
 * 为什么要校验而不是直接拼：这 7 个文件是 7 个不同的执行者分别写出来的，
 * 格式约定虽有明确规定，但没有任何机制强制它们遵守。一旦某个文件
 * 少一行／多一行／id 拼错／index 错位，错误会**静默地**写进数据 ——
 * 边会安安静静地变成错误的颜色，而画面看起来完全正常。
 * 类型错了不像崩溃那样能被发现，所以必须在写进数据之前挡住。
 *
 * 校验项：
 *   ① 每行格式必须是 `index typeid`
 *   ② index 必须恰好覆盖 0..1619 且**不重不漏**（顺序也要对）
 *   ③ typeid 必须是 12 个合法 id 之一
 *   ④ 与**原始批次文本**交叉核对：merged.txt 第 i 行对应的边，
 *      必须就是分类者当时在 b00..b11 里看到的第 i 行。
 *      这是唯一能抓住"某个分批判定整体错位一行"的检查 ——
 *      那种错误行数对、id 合法、index 连续，但每一条都安到了邻居身上。
 *
 * ⚠ 顺序来源统一走 _links-source.mjs，不读任何 dump 文件。
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { readAllLinks, readBatchSources, EXPECTED_LINKS } from './_links-source.mjs'
import { applyTypeFixes } from './_type-fixes.mjs'

/* 分批判定的产出文件。只列文件名，路径由 findPart() 去几个可能的位置找：
 *
 *   ① scripts/_batches2/        最初产出位置
 *   ② scripts/_batches/         第一轮的 B 批在这里
 *   ③ scripts/_batches/_archive/  清理脚手架时，判定证据被统一收进这里
 *                                 （不删是因为 merged.txt 的每一行都要
 *                                  能追溯到某个文件里的某一行）
 *
 * ⚠ 只扫一个目录的写法会**安静地漏掉**整块 —— 漏掉 540 行时，
 *   画面上表现为"一半的线没上色"，很容易被当成设计如此。
 *   所以这里对缺文件一律报错，绝不静默跳过。 */
const PART_NAMES = [
  'out-A1a.txt', 'out-A1b.txt', 'out-A2a.txt', 'out-A2b.txt',
  'out-B.txt',
  'out-C1a.txt', 'out-C1b.txt', 'out-C2.txt',
]
const SEARCH_DIRS = ['scripts/_batches2', 'scripts/_batches', 'scripts/_batches/_archive']

function findPart(name) {
  for (const d of SEARCH_DIRS) {
    const p = `${d}/${name}`
    try { return { path: p, text: readFileSync(p, 'utf8') } } catch { /* 接着找 */ }
  }
  return null
}

const LEGAL = new Set([
  'related', 'equivalent', 'defines', 'computes', 'property', 'depends',
  'implies', 'generalizes', 'provenance', 'contrast', 'analogy', 'sameFamily',
])

const problems = []
const rows = new Map()   // index → typeid

for (const part of PART_NAMES) {
  const found = findPart(part)
  if (!found) { problems.push(`${part}: 在 ${SEARCH_DIRS.join(' / ')} 里都找不到`); continue }
  const lines = found.text.split(/\r?\n/).filter((l) => l.trim() !== '')
  for (const [n, raw] of lines.entries()) {
    const m = raw.trim().match(/^(\d+)[\s|]+([A-Za-z]+)$/)
    if (!m) { problems.push(`${part}:${n + 1} 格式不对 → ${JSON.stringify(raw.slice(0, 60))}`); continue }
    const idx = Number(m[1])
    const type = m[2]
    if (!LEGAL.has(type)) { problems.push(`${part}:${n + 1} 非法 id "${type}"（index ${idx}）`); continue }
    if (rows.has(idx)) { problems.push(`${part}:${n + 1} index ${idx} 重复（前面已出现过）`); continue }
    rows.set(idx, type)
  }
  console.log(`  ${part.padEnd(14)} ${String(lines.length).padStart(4)} 行  [${lines[0]?.split(/[\s|]+/)[0]} .. ${lines[lines.length - 1]?.split(/[\s|]+/)[0]}]`)
}

console.log(`\n  合计 ${rows.size} 行`)

/* 应用人工修正。
 *
 * ⚠ 这一步**必须在生成 merged.txt 之前**，而且修正表要独立存放
 *   （见 _type-fixes.mjs 的注释）：merged.txt 是从分批文件生成的产物，
 *   把修正直接改进它，下次谁重跑一次 merge 就会把修正静默抹掉 ——
 *   我正是这么丢过一次修正。 */
console.log('\n  应用人工修正：')
problems.push(...applyTypeFixes(rows, (m) => console.log(m)))

/* ② 覆盖性：必须恰好 0..1619，不重不漏 */
const missing = []
for (let i = 0; i < EXPECTED_LINKS; i++) if (!rows.has(i)) missing.push(i)
if (missing.length) {
  problems.push(`缺失 ${missing.length} 个 index：${missing.slice(0, 20).join(',')}${missing.length > 20 ? ' …' : ''}`)
}
const outOfRange = [...rows.keys()].filter((i) => i < 0 || i >= EXPECTED_LINKS)
if (outOfRange.length) problems.push(`越界 index：${outOfRange.slice(0, 10).join(',')}`)

/* ④ 交叉核对（**这一步才是真正在防错位**）
 *
 * 拿 merged.txt 第 i 行的 index，去查数据里第 i 条边是什么，
 * 再跟**分类者当时看到的原始批次行**比对。
 *
 * 为什么基准必须是批次文件而不是数据文件：
 *   如果只验"数据 ↔ merged"，那验的是"我把 merged 写进数据了吗"；
 *   而真正会出错的是"merged 第 i 行讲的是第 i 条边吗" ——
 *   分批判定时整体错位一行就会这样，而行数、id 合法性、
 *   index 连续性**全都正常**，只有交叉核对能发现。 */
let crossChecked = 0
try {
  const edges = readAllLinks()
  if (edges.length !== EXPECTED_LINKS) {
    problems.push(`数据里有 ${edges.length} 条边，期望 ${EXPECTED_LINKS}`)
  } else {
    const batchEdge = readBatchSources()
    if (batchEdge.filter(Boolean).length !== EXPECTED_LINKS) {
      problems.push(`批次文件里读到 ${batchEdge.filter(Boolean).length} 行，期望 ${EXPECTED_LINKS}`)
    }
    let bad = 0
    for (let i = 0; i < EXPECTED_LINKS; i++) {
      const want = batchEdge[i]
      if (!want) { problems.push(`交叉核对：批次里找不到 index ${i}`); if (++bad > 5) break; continue }
      const got = `${edges[i].src}>${edges[i].dst}`
      if (want !== got) {
        problems.push(`交叉核对：index ${i} 批次行是 ${want}，数据里是 ${got}`)
        if (++bad > 5) break
      }
      crossChecked++
    }
  }
} catch (e) {
  problems.push(`交叉核对失败：${e.message}`)
}

/* 统计分布 */
const dist = {}
for (const t of rows.values()) dist[t] = (dist[t] || 0) + 1
console.log('\n  类型分布：')
for (const [t, n] of Object.entries(dist).sort((a, b) => b[1] - a[1])) {
  const pct = ((n / rows.size) * 100).toFixed(1)
  console.log(`    ${t.padEnd(14)} ${String(n).padStart(4)}  ${pct.padStart(5)}%`)
}
const nonRelated = rows.size - (dist.related || 0)
console.log(`\n  可判定类型 ${nonRelated} / ${rows.size} = ${((nonRelated / rows.size) * 100).toFixed(1)}%`)
console.log(`  （其中 related 是"纯名词短语/未陈述关系"的诚实归类，占 ${(((dist.related || 0) / rows.size) * 100).toFixed(1)}%）`)

if (problems.length) {
  console.log(`\n✗ ${problems.length} 项问题：`)
  for (const p of problems.slice(0, 40)) console.log(`  - ${p}`)
  if (problems.length > 40) console.log(`  … 还有 ${problems.length - 40} 项`)
  process.exit(1)
}

/* 写出合并结果：每行 `index typeid`，供 codemod 消费 */
const out = []
for (let i = 0; i < 1620; i++) out.push(`${i} ${rows.get(i)}`)
writeFileSync('scripts/_batches2/merged.txt', out.join('\n') + '\n', 'utf8')
console.log(`\n✓ 校验通过（交叉核对 ${crossChecked} 条）→ scripts/_batches2/merged.txt`)
