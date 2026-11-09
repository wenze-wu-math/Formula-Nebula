/**
 * 报告：351 个待写命题里，哪些已经有证明、哪些还没有。
 *
 * 依据：shots/proof-targets/all.json（清单）+ src/data/proofs/index.js（注册表）。
 * 输出按批次分组，便于直接分派新批次。
 *
 * 用法：node scripts/_report-targets.mjs [--missing-only]
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { PROOFS } from '../src/data/proofs/index.js'

const missingOnly = process.argv.includes('--missing-only')

const all = JSON.parse(readFileSync('shots/proof-targets/all.json', 'utf8'))
const targets = []
for (const [src, arr] of Object.entries(all)) for (const n of arr) targets.push({ ...n, src })

const done = new Set(Object.keys(PROOFS))
const missing = targets.filter((t) => !done.has(t.id))
const covered = targets.filter((t) => done.has(t.id))

console.log(`清单总数      ${targets.length}`)
console.log(`已有证明      ${covered.length}`)
console.log(`仍缺证明      ${missing.length}`)
console.log(`注册表总数    ${done.size}`)
console.log(`命中率        ${(covered.length / targets.length * 100).toFixed(1)}%`)

if (missingOnly) {
  // 按来源文件分组，每组 13 条切成新批次，输出可派发的清单
  const bySrc = {}
  for (const t of missing) (bySrc[t.src] ||= []).push(t)
  const out = []
  let batchNo = 0
  const PER = 13
  for (const [src, arr] of Object.entries(bySrc)) {
    for (let i = 0; i < arr.length; i += PER) {
      const chunk = arr.slice(i, i + PER)
      batchNo++
      const lines = [`# 补充批次 ${String(batchNo).padStart(2, '0')}（来源 ${src}，${chunk.length} 条）`, '']
      for (const t of chunk) {
        lines.push(`## ${t.id}`)
        lines.push(`- 名称：${t.name}`)
        lines.push(`- 家族：${t.family}`)
        lines.push(`- 图谱解释：${t.detail}`)
        lines.push('')
      }
      writeFileSync(`shots/proof-targets/batches/gap-${String(batchNo).padStart(2, '0')}.md`, lines.join('\n'), 'utf8')
      out.push({ file: `gap-${String(batchNo).padStart(2, '0')}.md`, count: chunk.length, ids: chunk.map((c) => c.id) })
    }
  }
  console.log(`\n已生成 ${out.length} 个补充批次：`)
  for (const b of out) console.log(`  ${b.file}  ${b.count} 条  ${b.ids.join(' ')}`)
} else {
  const bySrc = {}
  for (const t of missing) bySrc[t.src] = (bySrc[t.src] || 0) + 1
  console.log('\n仍缺证明的分布：')
  for (const [src, n] of Object.entries(bySrc).sort((a, b) => b[1] - a[1])) console.log(`  ${src.padEnd(14)} ${n}`)
}
