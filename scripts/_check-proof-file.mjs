/**
 * 单文件证明数据自检：给作者在合并前用，也用于 CI 式的批量审计。
 *
 * 用法：
 *   node scripts/_check-proof-file.mjs                            （检查全部数据文件）
 *   node scripts/_check-proof-file.mjs src/data/proofs/deep-dive.js
 *   node scripts/_check-proof-file.mjs src/data/proofs/*.js      （shell 展开）
 *
 * 不带参数时自行扫描 src/data/proofs/*.js（除 index.js / schema.js），
 * 这就是 run-all.mjs 里那条 [file, 0] 条目的调用方式：verify 因此会**默认**
 * 强制执行这里的严格检查。all-or-nothing 的批次入口不做改动。
 * 不论给了几个文件，都先把所有记录读进来再统一统计，所以反样板检查是
 * **跨文件**的：同一句话出现在三个不同文件里正是"批量注入填充文字"的特征。
 * 只要有一个文件不合格，退出码就是非零。
 *
 * 检查项比 verify-proofs.mjs 更严，因为它面向“正在写”的文件：
 *   · schema 形状（复用 src/data/proofs/schema.js）
 *   · key 必须是图谱里真实存在的节点 id
 *   · uses 只能引用**更早**的步骤或已存在的节点
 *   · 每步正文长度下限（防止用一句话充数）
 *   · 数学分隔符成对、数学段内不出现丢掉反斜杠的裸命令
 *   · 反样板：同一句话不得在多个步骤中反复出现（这是“凑字数”的典型特征）
 *   · 必需的叙事字段（explanation / examples / remarks）必须齐备
 */
import { readdirSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { validateProofShape } from '../src/data/proofs/schema.js'

const MIN_STEP_BODY = Number(process.env.MIN_STEP_BODY || 300)
const MIN_STEPS = Number(process.env.MIN_STEPS || 3)

const nodeModules = [
  '../src/data/knowledge.js', '../src/data/extra-a.js', '../src/data/extra-b.js',
  '../src/data/extra-c.js', '../src/data/extra-d.js', '../src/data/extra-e.js',
  '../src/data/extra-f.js', '../src/data/extra-g.js', '../src/data/extra-h.js',
  '../src/data/conjectures.js',
]
const nodeIds = new Set()
for (const modulePath of nodeModules) {
  const mod = await import(modulePath)
  for (const value of Object.values(mod)) {
    if (!Array.isArray(value)) continue
    for (const node of value) if (node?.id) nodeIds.add(node.id)
  }
}

/** 裸命令名：出现在数学段里说明反斜杠被吞掉了。 */
const BARE_COMMANDS = [
  'operatorname', 'mathcal', 'mathfrak', 'mathbb', 'mathrm', 'boxed', 'text', 'frac', 'sqrt',
  'otimes', 'oplus', 'mapsto', 'subseteq', 'subset', 'cup', 'cap', 'deg', 'ell', 'dim',
  'eta', 'alpha', 'beta', 'gamma', 'varphi', 'neq', 'cong', 'simeq', 'Longrightarrow',
  'Rightarrow', 'cdot', 'ldots', 'sum', 'prod', 'bigcap', 'bigcup', 'bar', 'hat', 'tilde',
  'ker', 'coker', 'Gamma', 'Delta', 'Omega', 'Spec', 'Proj', 'colon', 'pmod', 'equiv',
]

function mathSegments(value) {
  const out = []
  const re = /\$\$([\s\S]*?)\$\$|\\\[([\s\S]*?)\\\]|\\\(([\s\S]*?)\\\)|\$([^$\n]+)\$/g
  let match
  while ((match = re.exec(value))) out.push(match[1] ?? match[2] ?? match[3] ?? match[4] ?? '')
  return out
}

function delimiterIssues(value) {
  const issues = []
  const dollars = (value.match(/(?<!\\)\$/g) || []).length
  if (dollars % 2 !== 0) issues.push('美元分隔符数量为奇数（有未闭合的 $）')
  for (const pair of [['\\[', '\\]'], ['\\(', '\\)']]) {
    const open = (value.match(new RegExp(pair[0].replace(/[\\[\]()]/g, '\\$&'), 'g')) || []).length
    const close = (value.match(new RegExp(pair[1].replace(/[\\[\]()]/g, '\\$&'), 'g')) || []).length
    if (open !== close) issues.push(`${pair[0]} 与 ${pair[1]} 数量不匹配（${open} vs ${close}）`)
  }
  return issues
}

/**
 * 不带参数时检查的默认集合：src/data/proofs 下全部数据文件。
 * 排除 index.js（合并入口，内容全是别的文件）与 schema.js（校验器本体），
 * 它们自己不做任何断言，读进来只会重复统计。
 */
function defaultProofFiles() {
  const dir = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'data', 'proofs')
  return readdirSync(dir)
    .filter((name) => name.endsWith('.js') && name !== 'index.js' && name !== 'schema.js')
    .sort()
    .map((name) => join(dir, name))
}

const requested = process.argv.slice(2)
const REQUESTED = requested.length ? requested : defaultProofFiles()

let errors = 0
const err = (message) => { console.error(`  ✗ ${message}`); errors++ }

// 反样板检测是跨记录的，因此先把所有文件读进来再统一统计。
const allRecords = []
const perFile = []
for (const target of REQUESTED) {
  const absolute = resolve(target)
  let mod
  try {
    mod = await import(pathToFileURL(absolute).href)
  } catch (error) {
    err(`${target}: 无法导入：${error.message}`)
    continue
  }
  const exports = Object.entries(mod).filter(([name]) => /PROOFS$/.test(name))
  if (!exports.length) { err(`${target}: 必须导出名为 *PROOFS 的对象`); continue }
  for (const [name, value] of exports) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      err(`${target}.${name} 必须是按节点 id 索引的普通对象`)
      continue
    }
    perFile.push({ target, name, value })
    for (const [id, proof] of Object.entries(value)) allRecords.push({ file: target, id, proof })
  }
}

const sentenceCount = new Map()
for (const { file, id, proof } of allRecords) {
  for (const issue of validateProofShape(proof)) err(`${id}: ${issue}`)
  if (!nodeIds.has(id)) err(`${id}: 不是图谱中已存在的节点 id（${file}）`)

  const steps = proof.steps ?? []
  if (steps.length < MIN_STEPS) err(`${id}: 只有 ${steps.length} 步，要求至少 ${MIN_STEPS} 步`)
  const stepIds = new Set(steps.map((s) => s.id))

  for (const [index, step] of steps.entries()) {
    const body = String(step.body ?? '')
    if (body.length < MIN_STEP_BODY) {
      err(`${id}.steps[${index}] (${step.id}): 正文仅 ${body.length} 字，要求 ≥ ${MIN_STEP_BODY}`)
    }
    for (const used of step.uses ?? []) {
      if (stepIds.has(used)) {
        if (steps.findIndex((s) => s.id === used) >= index) {
          err(`${id}.steps[${index}].uses 引用了不早于自身的步骤：${used}`)
        }
      } else if (!nodeIds.has(used)) {
        err(`${id}.steps[${index}].uses 引用了不存在的节点或步骤：${used}`)
      }
    }
  }

  const fields = [
    ['statement', proof.statement], ['conclusion', proof.conclusion],
    ['explanation', proof.explanation],
    ...steps.map((s) => [`steps.${s.id}`, s.body]),
    ...(proof.examples ?? []).map((e) => [`example.${e.title}`, e.body]),
    ...(proof.corollaries ?? []).map((c) => [`corollary.${c.title}`, c.body]),
  ]
  for (const [field, value] of fields) {
    if (typeof value !== 'string' || !value) continue
    for (const issue of delimiterIssues(value)) err(`${id}.${field}: ${issue}`)
    for (const segment of mathSegments(value)) {
      // 前面是 `{` 说明这是 \operatorname{Spec} / \mathrm{trdeg} 这类命令的参数，
      // 不是丢掉反斜杠的裸命令；前面是 `\` 或字母同理。
      const bare = BARE_COMMANDS.find((c) => new RegExp(`(^|[^\\\\a-zA-Z{])${c}\\b`).test(segment))
      if (bare) err(`${id}.${field}: 数学段内出现裸命令 ${bare}（反斜杠丢失？）：${JSON.stringify(segment.slice(0, 70))}`)
    }
    // 反样板：统计长句出现次数
    for (const sentence of value.split(/(?<=[。；！？])/)) {
      const trimmed = sentence.trim()
      if (trimmed.length >= 25) sentenceCount.set(trimmed, (sentenceCount.get(trimmed) ?? 0) + 1)
    }
  }

  if (!proof.explanation) err(`${id}: 缺少 explanation（直观解释）`)
  if (!(proof.examples ?? []).length) err(`${id}: 缺少 examples（例子）`)
  if (!(proof.remarks ?? []).length) err(`${id}: 缺少 remarks（误区/边界）`)
}

/** 反复出现的“边界声明”不算刻意凑字数：它出现在每条的 remarks 里是有意的提醒。 */
const ALLOWED_REPEAT = /^使用前请核对|^每一步都依赖前面明确写出的定义或假设/

const repeated = [...sentenceCount.entries()].filter(([sentence, n]) => n > 2 && !ALLOWED_REPEAT.test(sentence))
if (repeated.length) {
  console.log(`\n反样板检测：${repeated.length} 个句子在证明间重复超过 2 次`)
  for (const [sentence, n] of repeated.slice(0, 10)) {
    err(`重复 ${n} 次：${JSON.stringify(sentence.slice(0, 70))}`)
  }
}

for (const { target, name, value } of perFile) {
  const ids = Object.keys(value)
  const chars = ids.reduce((sum, id) => sum + (value[id].steps ?? []).reduce((n, s) => n + String(s.body ?? '').length, 0), 0)
  const minStep = Math.min(...ids.flatMap((id) => (value[id].steps ?? []).map((s) => String(s.body ?? '').length)))
  console.log(`${target} [${name}] 记录 ${ids.length} 条，步骤正文合计 ${chars} 字，最短步骤 ${minStep} 字`)
}

console.log(errors ? `\n✗ 发现 ${errors} 个问题` : '\n✓ 单文件证明数据自检通过')
process.exit(errors ? 1 : 0)
