/**
 * 从抓到的维基正文里，抽出"可能让 status 过时"的句子。
 *
 * 为什么要这么筛：60 篇正文合起来上百万字符，逐篇读不现实。而
 * status 过时只可能由**近期进展**造成 —— 一条 1950 年的猜想不会因为
 * 1950 年的事改变状态。所以只挑两类句子：
 *   ① 提到 2024 / 2025 / 2026 的（新进展）
 *   ② 明确讲"仍未解决 / 已被证明"的（结论句）
 * 再人工（或交给子代理）判断这些句子是否与现有 status 冲突。
 *
 * 注意日期：本机当前是 2026-09，维基正文里已经出现 2026 年的事件，
 * 所以绝不能用训练记忆代替这个筛查。
 */
import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const ROOT = path.resolve(import.meta.dirname, '..')
const raw = JSON.parse(readFileSync(path.join(ROOT, '.research/raw.json'), 'utf8'))
const mod = await import(pathToFileURL(path.join(ROOT, 'src/data/conjectures.js')).href)
const nodes = mod.CONJECTURE_NODES
const byId = new Map(nodes.map((n) => [n.id, n]))

const RECENT = /\b(202[4-9])\b/
const SOLVED = /\b(proved|proof|proven|solved|settled|resolved|disproved|counterexample|established|confirmed)\b/i
const OPEN = /\b(remains? open|still open|open problem|unsolved|no known proof|unknown|not known|remains? unknown|conjectur)/i

function sentences(t) {
  return t
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?])\s+(?=[A-Z(])/)
    .map((s) => s.trim())
    .filter((s) => s.length > 30 && s.length < 700)
}

const report = []
for (const [id, v] of Object.entries(raw)) {
  if (!v.text) continue
  const n = byId.get(id)
  const ss = sentences(v.text)
  const recent = ss.filter((s) => RECENT.test(s) && (SOLVED.test(s) || OPEN.test(s)))
  const openish = ss.filter((s) => OPEN.test(s) && !RECENT.test(s))
  report.push({ id, status: n?.status, name: n?.name, resolved: v.resolved, recent, openish })
}

const lines = []
for (const r of report.sort((a, b) => (a.status || '').localeCompare(b.status || ''))) {
  lines.push(`\n${'='.repeat(76)}`)
  lines.push(`## ${r.id}  [现行 status = ${r.status}]  ${r.name}`)
  lines.push(`   维基条目: ${r.resolved}`)
  lines.push('='.repeat(76))
  if (r.recent.length) {
    lines.push('  --- 提到 2024+ 的结论句 ---')
    for (const s of r.recent.slice(0, 6)) lines.push('  * ' + s)
  } else {
    lines.push('  （正文里没有 2024+ 的结论句）')
  }
  if (r.openish.length) {
    lines.push('  --- 讲"开放/未解决"的句子（取前 2 条）---')
    for (const s of r.openish.slice(0, 2)) lines.push('  · ' + s)
  }
  lines.push('')
}
const out = lines.join('\n')
writeFileSync(path.join(ROOT, '.research/screen.txt'), out, 'utf8')

const withRecent = report.filter((r) => r.recent.length)
console.log(`有 2024+ 结论句的: ${withRecent.length} / ${report.length}\n`)
for (const r of withRecent) {
  console.log(`── ${r.id}  [${r.status}]`)
  for (const s of r.recent.slice(0, 3)) console.log('   * ' + s.slice(0, 300))
  console.log('')
}
console.log('完整报告 → .research/screen.txt')
