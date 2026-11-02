/**
 * 维护脚本：根据 src/data/proofs/ 下实际存在的批次文件，重写 index.js 的
 * 静态 import 清单。
 *
 * 为什么需要它：index.js 必须同时满足两个互相冲突的要求 ——
 *   · **Node 验证脚本**要能静态看出"哪些批次文件应当被合并"，
 *     才能发现"写了却没接进来"的遗漏；
 *   · **浏览器构建**不能 import `node:fs`（Vite 会把它 externalize 成空壳）。
 * 所以既不能用 readdir，也不能只靠 import.meta.glob（Node 下不解析）。
 * 折中方案：用**静态 import 清单**（两边都支持），并由本脚本按目录内容
 * 自动生成，避免手改遗漏。
 *
 * 新增批次后运行：node scripts/_sync-proof-index.mjs
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const proofDir = join(here, '..', 'src', 'data', 'proofs')

const batches = readdirSync(proofDir)
  .filter((name) => /^batch-\d+\.js$/.test(name))
  .sort()

// 导出名规则：batch-07.js → BATCH_07_PROOFS
const exportNameFor = (file) => `${file.replace('.js', '').replace(/-/g, '_').toUpperCase()}_PROOFS`

// 先确认每个批次文件确实导出了约定名字，避免生成一个引用不存在标识符的清单
const problems = []
for (const file of batches) {
  const source = readFileSync(join(proofDir, file), 'utf8')
  const expected = exportNameFor(file)
  if (!new RegExp(`export\\s+const\\s+${expected}\\b`).test(source)) {
    const found = [...source.matchAll(/export\s+const\s+(\w+)/g)].map((m) => m[1])
    problems.push(`${file}: 期望导出 ${expected}，实际为 ${found.join(', ') || '(无)'}`)
  }
}
if (problems.length) {
  console.error('批次文件导出名不符合约定：')
  for (const p of problems) console.error('  ✗ ' + p)
  process.exit(1)
}

const baseFamilies = [
  ['REWRITE_A1_PROOFS', 'rewrite-a1.js', 'Zariski 拓扑 / 素谱 / Spec 函子'],
  ['REWRITE_A2_PROOFS', 'rewrite-a2.js', '理想—簇对应 / 理想层 / 纤维积'],
  ['REWRITE_A3_PROOFS', 'rewrite-a3.js', '诺特性 / 切空间'],
  ['REWRITE_B_PROOFS', 'rewrite-b.js', '拟凝聚层 / Serre 仿射 / 曲线 RR / Hurwitz / Kähler'],
  ['DEEP_DIVE_PROOFS', 'deep-dive.js', '平坦 / 纤维维数 / Lying Over / Hensel / 射影上同调'],
  ['FOUNDATION_LONG_PROOFS', 'foundation-long.js', '零点定理 / Noether 正规化 / Hilbert 基定理 / 准素分解'],
  ['FOUNDATION_LONG_B_PROOFS', 'foundation-long-b.js', '局部化 / Nakayama / Krull 维数'],
  ['NEW_TOPIC_PROOFS', 'new-topics.js', '米田 / Ext-Tor / 完备化 / Krull 交 / 整扩张 / 正则局部环 / 层上同调 / 忠实平坦'],
  ['NEW_CURVE_PROOFS', 'new-curves.js', '相交数 / 除子 / 亏格 / 曲线 Serre 对偶 / Noether 公式'],
  ['NEW_SHEAF_PROOFS', 'new-sheaves.js', 'Čech 上同调 / 平坦判据 / 分离 / 紧合 / 光滑'],
]

const lines = []
lines.push('/* eslint-disable */')
lines.push('/*')
lines.push(' * 证明数据注册表。')
lines.push(' *')
lines.push(' * ⚠ 本文件的 import 清单由 `scripts/_sync-proof-index.mjs` 依据目录内容生成，')
lines.push(' *   新增 batch-NN.js 后请运行该脚本，不要手改。')
lines.push(' *')
lines.push(' * 为什么用静态清单而不是 readdir / import.meta.glob：')
lines.push(' *   · 浏览器构建不能 import `node:fs`（Vite 会 externalize 成空壳）；')
lines.push(' *   · Node 下的验证脚本不解析 import.meta.glob。')
lines.push(' *   静态 import 是唯一在两个环境里都可靠的形式。')
lines.push(' */')
for (const [exportName, file] of baseFamilies) {
  lines.push(`import { ${exportName} } from './${file}'`)
}
for (const file of batches) {
  lines.push(`import { ${exportNameFor(file)} } from './${file}'`)
}
lines.push('')
lines.push('/**')
lines.push(' * Merge order of the proof families.')
lines.push(' *')
lines.push(' * 顺序只影响可读性：`scripts/_check-proof-file.mjs` 保证**没有任何节点 id')
lines.push(' * 出现在两个文件里**（verify-proofs.mjs 也把重复键当作错误），所以这里没有')
lines.push(' * "谁覆盖谁"的隐含语义，改动顺序不会改变任何一条证明。')
lines.push(' */')
lines.push('export const PROOF_MERGE_ORDER = [')
for (const [, file] of baseFamilies) lines.push(`  '${file}',`)
for (const file of batches) lines.push(`  '${file}',`)
lines.push(']')
lines.push('')
lines.push('/** 目录里存在的全部批次文件（供验证脚本双向核对）。 */')
lines.push('export const PROOF_BATCH_FILES = [')
for (const file of batches) lines.push(`  '${file}',`)
lines.push(']')
lines.push('')
lines.push('/** All optional proof records, keyed by an existing graph node id. */')
lines.push('export const PROOFS = Object.freeze(Object.assign(')
lines.push('  {},')
for (const [exportName, , comment] of baseFamilies) lines.push(`  ${exportName},${' '.repeat(Math.max(1, 28 - exportName.length))}// ${comment}`)
for (const file of batches) lines.push(`  ${exportNameFor(file)},`)
lines.push('))')
lines.push('')
lines.push('export function getProof(nodeId) { return PROOFS[nodeId] ?? null }')
lines.push('export function getProofCount() { return Object.keys(PROOFS).length }')
lines.push("export { PROOF_SCHEMA_VERSION, validateProofShape } from './schema.js'")
lines.push('')

writeFileSync(join(proofDir, 'index.js'), lines.join('\n'), 'utf8')
console.log(`已同步 index.js：基础族 ${baseFamilies.length} 个 + 批次 ${batches.length} 个`)
console.log('批次：' + batches.join(' '))
