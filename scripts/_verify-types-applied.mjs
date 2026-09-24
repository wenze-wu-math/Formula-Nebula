/**
 * 校验写入结果：数据文件里每条边的第 5 个元素必须与 merged.txt 一致。
 *
 * 为什么不能只看"codemod 说它写了 1620 条"：
 * 写入是**按顺序消费**匹配的（因为存在重复的 src>dst 对），
 * 如果数据文件里的边序与 dump 时的顺序不同，类型就会整体错位 ——
 * 而这种事在语法上完全看不出来，构建也会成功。
 * 所以这里反过来：**从改过的文件里读回第 5 元素**，跟类型表逐条比对。
 *
 * 做法：用 Node 直接 import 改过的数据模块（它们都是纯 ESM 导出），
 * 拿到解析后的元组数组 —— 这比正则再解析一遍更可信，
 * 因为它验证的是"JS 引擎真的能读出这个类型"。
 */
import { readFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'

const LEGAL = new Set([
  'related', 'equivalent', 'defines', 'computes', 'property', 'depends',
  'implies', 'generalizes', 'provenance', 'contrast', 'analogy', 'sameFamily',
])

/* index → type，来自合并表 */
const expect = []
for (const line of readFileSync('scripts/_batches2/merged.txt', 'utf8').split(/\r?\n/)) {
  if (!line.trim()) continue
  const [i, t] = line.trim().split(/\s+/)
  expect[Number(i)] = t
}

const FILES = [
  ['src/data/knowledge.js', ['LINKS']],
  ['src/data/conjectures.js', ['CONJECTURE_LINKS']],
  ['src/data/extra-a.js', ['EXTRA_A_LINKS']],
  ['src/data/extra-b.js', ['EXTRA_B_LINKS']],
  ['src/data/extra-c.js', ['EXTRA_C_LINKS']],
  ['src/data/extra-d.js', ['EXTRA_D_LINKS']],
  ['src/data/extra-e.js', ['EXTRA_E_LINKS']],
  ['src/data/extra-f.js', ['EXTRA_F_LINKS']],
  ['src/data/extra-g.js', ['EXTRA_G_LINKS']],
  ['src/data/extra-h.js', ['EXTRA_H_LINKS']],
]

const problems = []
const dist = {}
let seen = 0

for (const [path, names] of FILES) {
  let mod
  try { mod = await import(pathToFileURL(resolve(path)).href) }
  catch (e) { problems.push(`${path}: import 失败 → ${e.message}`); continue }

  for (const name of names) {
    const arr = mod[name]
    if (!Array.isArray(arr)) { problems.push(`${path}: 没有导出数组 ${name}`); continue }
    for (const [n, tup] of arr.entries()) {
      if (!Array.isArray(tup) || tup.length < 4) { problems.push(`${path} ${name}[${n}]: 元组不完整`); continue }
      const [src, dst, w, label, type] = tup
      void w; void label
      if (typeof type !== 'string' || !LEGAL.has(type)) {
        problems.push(`${path} ${name}[${n}] ${src}>${dst}: 类型非法或缺失 → ${JSON.stringify(type)}`)
        continue
      }
      if (expect[seen] !== type) {
        problems.push(`${path} ${name}[${n}] ${src}>${dst}: 类型是 ${type}，期望 ${expect[seen]}（全局 index ${seen}）`)
        if (problems.length > 30) break
      }
      dist[type] = (dist[type] || 0) + 1
      seen++
    }
  }
}

console.log(`\n  读回 ${seen} 条边`)
console.log('  类型分布：')
for (const [t, n] of Object.entries(dist).sort((a, b) => b[1] - a[1])) {
  console.log(`    ${t.padEnd(14)} ${String(n).padStart(4)}  ${((n / seen) * 100).toFixed(1)}%`)
}

if (seen !== 1620) problems.push(`只读回 ${seen} 条边，期望 1620`)

if (problems.length) {
  console.log(`\n✗ ${problems.length} 项问题：`)
  for (const p of problems.slice(0, 30)) console.log(`  - ${p}`)
  process.exit(1)
}
console.log(`\n✓ 全部 1620 条边的类型与判定表逐条一致`)
