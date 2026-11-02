/**
 * kb-src/verify-mathlib.mjs — Lean 形式化节点的验收脚本。
 *
 * mathlib 与 Stacks/nLab 都不同：它的"正确性"由 Lean 内核保证，
 * 但**抽取**仍可能出错。所以校验的是抽取保真度：
 *   1. 定理名、类型签名、文件路径三项齐全
 *   2. `formal: true` 标记存在（前端据此区分显示）
 *   3. 类型签名不是空的、不含 Lean 语法碎片
 *   4. docstring（summary）确实是自然语言，不是代码
 *   5. 文件路径真实存在于 mathlib-tree.json
 *   6. 零孤立、关联端点存在
 *   7. 抽样：GitHub 上文件真可达
 */
import { readFileSync } from 'node:fs'
import { MATHLIB_NODES, MATHLIB_LINKS } from '../src/data/mathlib-extra.js'
import { buildGraph } from '../src/graph.js'

let pass = 0, fail = 0
const ok = (name, cond, extra = '') => {
  if (cond) { pass++; console.log(`  PASS  ${name}${extra ? '  ' + extra : ''}`) }
  else { fail++; console.log(`  FAIL  ${name}${extra ? '  ' + extra : ''}`) }
}

console.log(`\n形式化节点 ${MATHLIB_NODES.length}　关联 ${MATHLIB_LINKS.length}\n`)

/* 1. 三项齐全 */
ok('定理名齐全', MATHLIB_NODES.every((n) => n.lean?.full))
ok('类型签名齐全', MATHLIB_NODES.every((n) => n.lean?.signature))
ok('文件路径齐全', MATHLIB_NODES.every((n) => n.lean?.file))
ok('id 唯一', new Set(MATHLIB_NODES.map((n) => n.id)).size === MATHLIB_NODES.length)
ok('id 格式 ml-*', MATHLIB_NODES.every((n) => /^ml-[a-z0-9-]+$/.test(n.id)))

/* 2. formal 标记 */
ok('formal: true 标记齐全', MATHLIB_NODES.every((n) => n.formal === true))

/* 3. 签名质量 */
const emptySig = MATHLIB_NODES.filter((n) => (n.lean.signature || '').length < 6)
ok('签名非空', emptySig.length === 0, `过短 ${emptySig.length}`)
/* Lean 语法碎片：不应含 `:=` `by` `simp` 这类证明体 */
const proofLeak = MATHLIB_NODES.filter((n) => /:=\s*by\b|\bsimp\b|\bexact\b|\brw\b/.test(n.lean.signature))
ok('签名不含证明体', proofLeak.length === 0, `泄漏 ${proofLeak.length}`)

/* 4. docstring 是自然语言 */
/* 「纯代码」的判据（不能只看有没有冒号 —— 正常定义里也有 `p : E → B`）：
 *   · 以 `:=` 开头或整段含 `:=`
 *   · 或英文词占比过低（<40%），说明基本是符号/代码
 *   · 或长度 <20
 */
/* 「纯代码」判据 —— 本质是「人读不懂」。
 *
 * 演进过程（记下来避免再走弯路）：
 *   v1 看「英文词占比」→ 误伤 `A monomorphism must increase lengths`（正常）
 *   v2 看「有无常见虚词 the/is」→ 同样误伤
 *   v3 看「含 |」→ 误伤数学箭头 `⟶`
 *   v4 看「含 :=」→ 误伤 docstring 里的 `f₀ := i ≫ l₀`（这是数学定义写法，不是代码）
 *
 * 结论：`:=` 单独出现是正常的数学记法。真正的代码特征是
 * **整段以赋值/调用为主体**，而不是"出现过某个符号"。
 *
 * 最终判据（只用确定无误的）：
 *   · 长度 <20
 *   · 以 `:=` 开头（整段就是个赋值）
 *   · 含 Lean 结构体字面量 `⟨...⟩`
 *   · 含 `by` tactic 关键字在行首
 */
const codeLike = MATHLIB_NODES.filter((n) => {
  const s = (n.summary || '').trim()
  if (s.length < 20) return true
  if (/^:=/.test(s)) return true
  if (/^\s*by\s/.test(s)) return true
  /* Lean 结构体字面量 ⟨...⟩ 单独出现**不算代码**：
   *   "…π c₁ c₂ c₁₂ ⟨i₁, i₂⟩ = i₁₂ exists."     ← 正常的数学陈述
   *   "Two terms ⟨j, x⟩ and ⟨j', x'⟩ are related" ← 正常的数学陈述
   * 只有当**整段几乎全是符号**时才算代码。判据：去掉 ⟨...⟩ 后英文词仍 ≥ 6 个。 */
  const stripped = s.replace(/⟨[^⟩]*⟩/g, ' ')
  const words = stripped.split(/\s+/).filter((w) => /^[A-Za-z]{2,}/.test(w))
  if (words.length < 6) return true
  return false
})
ok('summary 是自然语言', codeLike.length === 0, codeLike.length ? codeLike.slice(0, 2).map((n) => n.summary.slice(0, 40)).join(' / ') : '')

/* 5. 文件路径真实性 */
const tree = JSON.parse(readFileSync(new URL('./out/mathlib-tree.json', import.meta.url), 'utf8'))
const realPaths = new Set(tree.paths.map((p) => p.path))
const fakePaths = MATHLIB_NODES.filter((n) => !realPaths.has(n.lean.file))
ok('文件路径真实存在', fakePaths.length === 0, fakePaths.length ? [...new Set(fakePaths.map((n) => n.lean.file))].slice(0, 2).join(', ') : '')

/* 6. 关联完整性 */
const g = buildGraph()
const allIds = new Set(g.nodes.map((n) => n.id))
const dangling = MATHLIB_LINKS.filter((l) => !allIds.has(l[0]) || !allIds.has(l[1]))
ok('关联端点全部存在', dangling.length === 0, `悬空 ${dangling.length}`)

const touched = new Set()
for (const l of MATHLIB_LINKS) { touched.add(l[0]); touched.add(l[1]) }
const orphans = MATHLIB_NODES.filter((n) => !touched.has(n.id))
ok('零孤立形式化节点', orphans.length === 0, orphans.length ? orphans.slice(0, 3).map((o) => o.id).join(',') : '')

/* 7. 抽样可达性 */
console.log('\n抽样验证 GitHub 文件（3 条）')
for (let i = 0; i < 3; i++) {
  const n = MATHLIB_NODES[Math.floor(i * MATHLIB_NODES.length / 3)]
  if (!n) continue
  try {
    const r = await fetch(n.url, { method: 'HEAD' })
    ok(`url ${n.lean.file.split('/').pop()}`, r.ok, `HTTP ${r.status}`)
  } catch (e) {
    /* 网络可能不稳，不算硬失败但如实报告 */
    console.log(`  SKIP  url ${n.lean.file.split('/').pop()}  网络不可达: ${e.message.slice(0, 30)}`)
  }
}

/* 8. 文件覆盖 */
const files = new Set(MATHLIB_NODES.map((n) => n.lean.file))
console.log(`\n覆盖 ${files.size} 个 Lean 文件`)
console.log('按族:', JSON.stringify(MATHLIB_NODES.reduce((a, n) => (a[n.family] = (a[n.family] || 0) + 1, a), {})))

console.log(`\n结果：${pass} 通过 / ${fail} 失败`)
process.exitCode = fail ? 1 : 0
