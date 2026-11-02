/**
 * 诊断脚本（只读）：找出证明数据里两类"机器造出来的"问题
 *   1. 被追加到步骤正文里的样板填充句（抬高字数、不增加信息）
 *   2. LaTeX 数学段里丢失反斜杠的命令（例如 operatorname 应为 \operatorname）
 *
 * 为什么不再写死三个字面句：迁移期的三条填充句已随 long-form.js 退役，
 * 把它写死的结果是"永远报 0 处" —— 缺陷一旦被重新注入，检查也照样全绿。
 * 现在改成结构性判据：**同一句 ≥30 字的正文出现在超过 3 个不同步骤里**。
 * 门槛取 3 而不是 _check-proof-file.mjs 的 2，是因为那边把所有字段
 * （含 statement/explanation/标题/例子）一起统计，这边只统计**步骤正文**，
 * 而步骤正文恰好是当年机器拼接填充的落点。
 *
 * 为什么不直接删掉这脚本：它与 _check-proof-file.mjs 有两处真实差异 ——
 *   · 还会扫 history 与 steps[].title（checker 不扫这两个字段）；
 *   · 报的是"哪些字段/位置"，是给人看的**定位**工具，而不只是通过/不通过。
 * 但它不在 run-all 里，属于临时排查用，需要时手工运行。
 *
 * 用法：node scripts/_audit-proof-text.mjs
 */
import { PROOFS } from '../src/data/proofs/index.js'

/** 只在步骤正文里查重复：当年填充就是追加到这里。 */
const REPEAT_MIN_LEN = 30
/** 出现次数达到这个值才算样板：正常写作里同一句偶尔复用一次不算。 */
const REPEAT_THRESHOLD = 3

/** 数学段中不该出现的裸命令名（丢了反斜杠的特征）。
 *  注意这里必须排除前导 `{`：`\operatorname{Spec}` 的 `Spec` 前面就是 `{`，
 *  否则会把**合法**写法误判成丢反斜杠的裸命令（历史上曾误报 118 处）。 */
const BARE_COMMANDS = [
  'operatorname', 'mathcal', 'mathfrak', 'mathbb', 'mathrm', 'boxed', 'text', 'frac', 'sqrt',
  'otimes', 'oplus', 'mapsto', 'subseteq', 'subset', 'cup', 'cap', 'deg', 'ell', 'dim',
  'eta', 'alpha', 'beta', 'gamma', 'varphi', 'neq', 'cong', 'simeq', 'Longrightarrow',
  'Rightarrow', 'cdot', 'ldots', 'sum', 'prod', 'bigcap', 'bigcup', 'bar', 'hat', 'tilde',
  'ker', 'coker', 'Gamma', 'Delta', 'Omega', 'Spec', 'Proj', 'colon', 'pmod', 'equiv',
]

const mathSegments = (value) => {
  const out = []
  const re = /\$\$([\s\S]*?)\$\$|\\\[([\s\S]*?)\\\]|\\\(([\s\S]*?)\\\)|\$([^$\n]+)\$/g
  let m
  while ((m = re.exec(value))) out.push(m[1] ?? m[2] ?? m[3] ?? m[4] ?? '')
  return out
}

const fillerRows = []
const bareRows = []
/** 句子 -> 出现它的 (记录, 步骤) 集合，用于判定"跨多个步骤重复"。 */
const sentenceSteps = new Map()
for (const [id, proof] of Object.entries(PROOFS)) {
  const fields = [
    ['statement', proof.statement], ['conclusion', proof.conclusion],
    ['explanation', proof.explanation], ['history', proof.history],
  ]
  for (const s of proof.steps ?? []) {
    fields.push([`step:${s.id}`, s.body], [`title:${s.id}`, s.title])
  }
  for (const ex of proof.examples ?? []) fields.push([`example:${ex.title}`, ex.body])
  for (const c of proof.corollaries ?? []) fields.push([`corollary:${c.title}`, c.body])
  for (const [field, value] of fields) {
    if (typeof value !== 'string') continue
    for (const seg of mathSegments(value)) {
      const hit = BARE_COMMANDS.find((c) => new RegExp(`(^|[^\\\\a-zA-Z{])${c}\\b`).test(seg))
      if (hit) bareRows.push({ id, field, command: hit, segment: seg.slice(0, 100) })
    }
    // 只在步骤正文里累计重复句，模拟"把同一句拼到很多步末尾"的填充特征。
    if (!field.startsWith('step:')) continue
    for (const sentence of value.split(/(?<=[。；！？])/)) {
      const trimmed = sentence.trim()
      if (trimmed.length < REPEAT_MIN_LEN) continue
      if (!sentenceSteps.has(trimmed)) sentenceSteps.set(trimmed, new Set())
      sentenceSteps.get(trimmed).add(`${id} ${field}`)
    }
  }
}

/** 出现在 >REPEAT_THRESHOLD 个不同步骤里的长句：这就是填充候选。 */
const repeats = [...sentenceSteps.entries()]
  .filter(([, steps]) => steps.size > REPEAT_THRESHOLD)
  .sort((a, b) => b[1].size - a[1].size)
for (const [sentence, steps] of repeats) {
  fillerRows.push({ sentence, count: steps.size, where: [...steps] })
}

console.log('=== 1. 样板填充（同一句 ≥' + REPEAT_MIN_LEN + ' 字出现在 >' + REPEAT_THRESHOLD + ' 个步骤里） ===')
if (!fillerRows.length) console.log('  无')
for (const row of fillerRows.slice(0, 40)) {
  console.log(`  出现 ${row.count} 次：${JSON.stringify(row.sentence.slice(0, 72))}`)
  console.log(`      位置：${row.where.slice(0, 3).join('；')}${row.where.length > 3 ? ' …' : ''}`)
}
console.log(`  合计：${fillerRows.length} 个重复句，涉及 ${new Set(fillerRows.flatMap((r) => r.where)).size} 个步骤`)

console.log('\n=== 2. LaTeX 反斜杠丢失（数学段内的裸命令） ===')
if (!bareRows.length) console.log('  无')
for (const row of bareRows) {
  console.log(`  ${row.id.padEnd(26)} ${row.field.padEnd(20)} \\${row.command.padEnd(16)} ${JSON.stringify(row.segment)}`)
}
console.log(`  合计：${bareRows.length} 处，涉及 ${new Set(bareRows.map((r) => r.id)).size} 条记录`)

