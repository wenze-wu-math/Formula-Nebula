/**
 * 检查上一步抓到的维基条目**是不是我们真正想查的那一条**。
 *
 * 为什么必须查：`generator=search` 是让维基自己挑最相关的页面，它会跑偏。
 * 已知跑偏的例子：
 *   · cn-lusztig         → "Kazhdan–Lusztig polynomial"（这是**另一个**猜想）
 *   · cn-hartshorne-ample→ "List of unsolved problems in mathematics"
 *   · cn-connes-rigidity → "List of conjectures"
 * 如果拿这些页面的正文去判断 status，就会得出错误结论 ——
 * "这一页没提它被证明了" 并不等于 "它没被证明"。
 *
 * 判据：把条目标题与节点的 en 名做词重叠，重叠太低就标为可疑，人工重抓。
 */
import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const ROOT = path.resolve(import.meta.dirname, '..')
const raw = JSON.parse(readFileSync(path.join(ROOT, '.research/raw.json'), 'utf8'))
const mod = await import(pathToFileURL(path.join(ROOT, 'src/data/conjectures.js')).href)
const nodes = mod.CONJECTURE_NODES

const stop = new Set(['the', 'of', 'a', 'an', 'and', 'in', 'on', 'for', 'to', 's', 'conjecture', 'hypothesis', 'problem', 'theorem', 'conjectures', 'problems', 'theorems'])
const words = (s) => (s || '').toLowerCase().replace(/[^a-z0-9\s–-]/g, ' ').split(/[\s–-]+/).filter((w) => w && !stop.has(w))

const bad = []
const ok = []
for (const n of nodes) {
  const v = raw[n.id]
  if (!v?.text) { bad.push({ id: n.id, why: '没抓到', resolved: '-' }); continue }
  const q = words(v.query)
  const r = words(v.resolved)
  const overlap = q.filter((w) => r.includes(w)).length
  const score = q.length ? overlap / q.length : 0
  const isList = /^List of/i.test(v.resolved || '')
  if (score < 0.34 || isList) bad.push({ id: n.id, why: isList ? '列表页' : `词重叠 ${(score * 100).toFixed(0)}%`, resolved: v.resolved, query: v.query })
  else ok.push(n.id)
}

console.log(`条目匹配良好: ${ok.length}`)
console.log(`可疑（需要重抓）: ${bad.length}\n`)
for (const b of bad) console.log(`  ${b.id.padEnd(24)} ${String(b.why).padEnd(12)} 查询"${b.query}" → 实际"${b.resolved}"`)

writeFileSync(path.join(ROOT, '.research/suspect.json'), JSON.stringify(bad, null, 1), 'utf8')

/* 顺手检查：正文长度过短（< 800 字符）的也基本没有信息量 */
const thin = nodes.filter((n) => raw[n.id]?.text && raw[n.id].text.length < 800)
if (thin.length) {
  console.log(`\n正文过短（信息量不足）:`)
  for (const n of thin) console.log(`  ${n.id.padEnd(24)} ${raw[n.id].text.length} 字符  "${raw[n.id].resolved}"`)
}
