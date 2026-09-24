/**
 * 把人工判定的关系类型写进数据文件（10 个文件，1620 条边）。
 *
 * ══ 为什么类型要写进**数据**而不是运行时算 ══
 *
 * 之前类型是 linkTypes.js 里的正则**猜**出来的（覆盖率 16.7%）。
 * 正则的问题不是"不够准"，而是它**只能看见措辞，看不见意思**：
 * 「整环理论」这种纯名词短语它认不出关系，而「差异系数」
 * （discrepancy，一个术语）它又会误判成"对比"。
 * 这 1620 条理由全部被逐条读过一遍，结论写进数据，
 * 类型从此是一个**事实**而不是一次推断。
 *
 * ══ 为什么要留正则 ══
 *
 * linkTypes.inferLinkType() 不删。数据里没写类型的边（将来新加的）
 * 仍然走正则兜底 —— 有猜测总好过没有，只要界面说明白它是猜的。
 *
 * ══ 幂等 ══
 *
 * 可重复运行：已经有第 5 个元素的元组会被**改写**成新值，不会叠加。
 * 用 --check 只报告不写入。
 *
 * ══ 依赖 ══
 *
 * 顺序来源是 _links-source.mjs（从数据文件现读），不是任何 dump 文件。
 * 早先这里读一个临时 dump（scripts/_links-dump.json），
 * 那个文件在清理脚手架时被删掉，脚本就直接挂了 ——
 * 坐标系必须由数据本身定义，不能由一个中间产物定义。
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { readAllLinks, LINK_FILES, EXPECTED_LINKS } from './_links-source.mjs'

const CHECK = process.argv.includes('--check')

/* 判定表：`index typeid`，index 与 readAllLinks() 的顺序一致 */
const TYPE_BY_INDEX = new Map()
for (const line of readFileSync('scripts/_batches2/merged.txt', 'utf8').split(/\r?\n/)) {
  if (!line.trim()) continue
  const [i, t] = line.trim().split(/\s+/)
  TYPE_BY_INDEX.set(Number(i), t)
}

/* 逐文件改写。
 *
 * 用**行级正则**替换而不是 AST：数据文件是手写的元组数组，
 * 每条边严格占一行（已用 _hazard 审计过 0 条含引号/反斜杠/换行）。
 * AST 改写要引入解析器、还要面对这些文件里大量的注释与模板字符串，
 * 风险远大于收益。
 *
 * ⚠ 正则锚定到行首与行尾的 `],`：不锚定会匹配到注释里的示例元组，
 *   那种错误会让某些边被改两次、另一些一次都没改。 */
const RE = /^(\s*)\[('([^']*)'),\s*('([^']*)'),\s*([\d.]+),\s*('([^']*)')\s*(?:,\s*'([a-zA-Z]+)')?\s*\],\s*$/gm

const all = readAllLinks()
if (all.length !== EXPECTED_LINKS) {
  console.error(`✗ 从数据文件读出 ${all.length} 条边，期望 ${EXPECTED_LINKS}`)
  process.exit(1)
}
const byArray = new Map()
for (const e of all) {
  if (!byArray.has(e.array)) byArray.set(e.array, [])
  byArray.get(e.array).push(e)
}

let total = 0
let written = 0
const perFile = {}
const problems = []

for (const [path, arrName] of LINK_FILES) {
  let text
  try { text = readFileSync(path, 'utf8') } catch { problems.push(`${path}: 读不到`); continue }
  const list = byArray.get(arrName) || []
  let used = 0

  const out = text.replace(RE, (m, indent, q1, src, q2, dst, w, _lq, label) => {
    total++
    /* 找出这条边在全局表里的 index。
     *
     * 按**顺序**在 list 里往后找第一个端点匹配的条目，而不是全局搜索：
     * 边表里存在重复的 (src,dst) 对（不同理由、不同权重），
     * 全局搜索会把它们全指向第一条，类型就整体错位了。
     * 顺序消费天然对得上 —— 数据文件里的边序就是 index 的顺序。 */
    let hit = -1
    for (let k = used; k < list.length; k++) {
      if (list[k].src === src && list[k].dst === dst) { hit = list[k].index; used = k + 1; break }
    }
    if (hit < 0) {
      problems.push(`${path}: 找不到边 ${src}>${dst} 的 index（label: ${label.slice(0, 30)}）`)
      return m
    }
    const type = TYPE_BY_INDEX.get(hit)
    if (!type) { problems.push(`${path}: index ${hit} 没有类型`); return m }

    perFile[path] = (perFile[path] || 0) + 1
    if (CHECK) return m

    written++
    return `${indent}[${q1}, ${q2}, ${w}, '${label}', '${type}'],`
  })

  /* 每个数组的边数必须与数据里的条数完全对得上。
   * 少了说明正则漏匹配，多了说明匹配到了别的地方（比如注释里的示例）。 */
  if (list.length !== (perFile[path] || 0)) {
    problems.push(`${path}: 处理 ${perFile[path] || 0} 条，但文件里 ${arrName} 有 ${list.length} 条`)
  }

  if (!CHECK) {
    /* ⚠ 不能拿"文件内容有没有变"当失败判据：这个脚本是**幂等**的 ——
     * 第二次运行时所有类型都已经是对的，写回去的内容与原文件完全相同。
     * 那是正常的，不是错误。（真正该担心的是"一条都没匹配到"，
     * 由下面的 total 与逐数组条数核对保证。） */
    writeFileSync(path, out, 'utf8')
  }
}

if (total !== EXPECTED_LINKS) problems.push(`只匹配到 ${total} 条边，期望 ${EXPECTED_LINKS}`)

console.log(`\n  ${CHECK ? '[检查模式] ' : ''}匹配 ${total} 条边`)
for (const [p, n] of Object.entries(perFile).sort()) console.log(`    ${p.padEnd(28)} ${String(n).padStart(4)}`)
if (!CHECK) console.log(`  写入 ${written} 条`)

if (problems.length) {
  console.log(`\n✗ ${problems.length} 项问题：`)
  for (const p of problems.slice(0, 20)) console.log(`  - ${p}`)
  process.exit(1)
}
console.log(`\n✓ ${CHECK ? '检查通过（未写入）' : '全部写入完成'}`)
