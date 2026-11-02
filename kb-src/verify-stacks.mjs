/**
 * kb-src/verify-stacks.mjs — 解析结果的完整性与可复核性校验。
 *
 * 抽查每条断言，避免"解析看起来成功但内容错位"：
 *   1. tag 唯一且格式为 4 位 [0-9A-Z]
 *   2. tag 与 label 的对应关系能被独立复核（重新查 tags 索引）
 *   3. statement 非空、不含残留环境标记
 *   4. url 可达性抽样（真发 HTTP 请求）
 *   5. 交叉引用 refs 里有多少能解析回本库的 tag（衡量关联图可用性）
 */
import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const results = JSON.parse(readFileSync(join(HERE, 'out', 'stacks-results.json'), 'utf8'))

let pass = 0, fail = 0
const ok = (name, cond, extra = '') => {
  if (cond) { pass++; console.log(`  PASS  ${name}${extra ? '  ' + extra : ''}`) }
  else { fail++; console.log(`  FAIL  ${name}${extra ? '  ' + extra : ''}`) }
}

console.log(`\n样本数 ${results.length}\n`)

/* 1. tag 唯一 + 格式
 *
 * 允许极少数"源码里有、tags 索引里没有"的条目：上游偶尔会在两次 tags
 * 重新生成之间新增/改名结果。这类条目**没有稳定 URL**，不能作为交付节点，
 * 所以策略是：报告数量、要求占比极低（<0.1%），由下游过滤掉。 */
const tags = results.map((r) => r.tag).filter(Boolean)
const untagged = results.filter((r) => !r.tag)
const uniq = new Set(tags)
ok('tag 覆盖率 > 99.9%', tags.length / results.length > 0.999,
  `${tags.length}/${results.length}（无 tag ${untagged.length} 条）`)
if (untagged.length) console.log(`       无 tag 的条目（上游索引缺项，下游需过滤）: ${untagged.map((r) => `${r.file}:${r.label}`).join(', ')}`)
ok('tag 格式合规', tags.every((t) => /^[0-9A-Z]{4}$/.test(t)))
ok('tag 唯一', uniq.size === tags.length, `${uniq.size} 唯一 / ${tags.length} 总数`)

/* 2. 独立复核 tag↔label：重新读索引（只核对有 tag 的） */
const tagByLabel = new Map()
for (const line of readFileSync(join(HERE, 'stacks-tags.txt'), 'utf8').split('\n')) {
  const m = /^([0-9A-Z]{4}),(.+)$/.exec(line.trim())
  if (m) tagByLabel.set(m[2].trim(), m[1])
}
const mismatched = results.filter((r) => r.tag && tagByLabel.get(`${r.file}-${r.label}`) !== r.tag)
ok('tag↔label 与官方索引一致', mismatched.length === 0, `不一致 ${mismatched.length} 条`)

/* 3. statement 质量 */
const empty = results.filter((r) => !r.statement || r.statement.length < 20)
ok('statement 非空且 ≥20 字符', empty.length === 0, `过短/空 ${empty.length} 条`)
/* 注意：数学排版环境（align / matrix / xymatrix / cases 等）**应当保留** ——
 * 它们是公式本身的一部分，前端 KaTeX 能渲染。只有结构性包裹
 * （slogan / reference / label / enumerate）才是泄漏。 */
const STRUCTURAL = /\\(begin|end)\{(slogan|reference|label|enumerate|itemize)\}|\\label\{/
const dirty = results.filter((r) => STRUCTURAL.test(r.statement))
ok('statement 无结构性标记泄漏', dirty.length === 0, `残留 ${dirty.length} 条`)
const mathEnv = results.filter((r) => /\\begin\{(align|matrix|xymatrix|cases|array|split|gathered)/.test(r.statement))
console.log(`       （其中含数学排版环境 ${mathEnv.length} 条，属正常内容，前端 KaTeX 可渲染）`)

/* 4. 交叉引用可解析率 */
const known = new Set(results.map((r) => `${r.file}-${r.label}`))
let totalRefs = 0, resolved = 0
for (const r of results) {
  for (const ref of r.refs) {
    totalRefs++
    /* ref 形如 `sheaves-lemma-xxx`（跨文件）或 `lemma-xxx`（本文件） */
    if (known.has(ref) || known.has(`${r.file}-${ref}`)) resolved++
  }
}
ok('交叉引用可解析率 > 60%', resolved / totalRefs > 0.6,
  `${resolved}/${totalRefs} = ${(100 * resolved / totalRefs).toFixed(1)}%`)

/* 5. 抽样 URL 可达性 */
console.log('\n抽样验证 url 可达性（5 条）')
const sample = results.filter((_, i) => i % Math.floor(results.length / 5) === 0).slice(0, 5)
for (const r of sample) {
  try {
    const resp = await fetch(r.url, { headers: { 'User-Agent': 'kb-collector' } })
    const text = await resp.text()
    const titleOk = text.includes(r.label.replace(/-/g, ' ') ) || text.includes(r.tag)
    ok(`url ${r.tag}`, resp.ok && titleOk, `HTTP ${resp.status} len=${text.length}`)
  } catch (e) {
    ok(`url ${r.tag}`, false, e.message.slice(0, 50))
  }
}

console.log(`\n结果：${pass} 通过 / ${fail} 失败`)
process.exitCode = fail ? 1 : 0
