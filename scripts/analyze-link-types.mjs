/**
 * 量化一件事：本项目的 1620 条关联，能不能自动分出"关系类型"？
 *
 * 现状（已用 grep 确认）：每条 LINKS 是
 *     ['源id', '目标id', 权重, '一句中文理由']
 * 第四个字段是**自由文本**，没有机器可读的类型。于是渲染层只能一视同仁 ——
 * "标准猜想蕴含 Hodge 猜想"（真·蕴含）和"同属某一族"（弱关联）画出来
 * 是同一种线。用户要的是"他们之间有联系"，而**联系的种类**恰恰是信息量
 * 最大的那部分，现在被丢掉了。
 *
 * 对照：Jia-Yee/math-knowledge-graph 定义了 10 种边类型
 *   relates_to / prerequisite / follows / belongs_to / contains /
 *   contributes_to / depends_on / influences / related_to / proved_by
 * 它们的出现频率证明"关系类型学"在数学知识图谱里是标准做法。
 *
 * 这个脚本只做一个判断：**从现有中文理由里，能不能可靠地抽出类型？**
 * 做法：用一组模式去匹配，统计覆盖率与冲突率。
 * 覆盖率低就说明要人工补字段（成本高）；覆盖率高说明可以半自动迁移。
 */
import fs from 'node:fs'
import path from 'node:path'

const DIR = 'src/data'
const files = fs.readdirSync(DIR).filter((f) => f.endsWith('.js'))
const links = []

for (const f of files) {
  const src = fs.readFileSync(path.join(DIR, f), 'utf8')
  /* 匹配 ['a','b',0.9,'理由'] —— 只取四元组，且第一个是引号包着的 id */
  const re = /\[\s*'([a-zA-Z0-9_-]+)'\s*,\s*'([a-zA-Z0-9_-]+)'\s*,\s*([0-9.]+)\s*,\s*'((?:[^'\\]|\\.)*)'\s*\]/g
  let m
  while ((m = re.exec(src))) {
    links.push({ file: f, from: m[1], to: m[2], w: Number(m[3]), why: m[4] })
  }
}

console.log(`扫到 ${links.length} 条带理由的关联\n`)

/* 类型模式：按"信息强度"从强到弱排。
 * 顺序很重要 —— 一条理由可能同时命中多个（"蕴含"与"相关"），
 * 必须先匹配强的，否则"标准猜想蕴含 Hodge"会被"相关"抢走。 */
const TYPES = [
  ['implies',    /蕴含|推出|导出|等价于|当且仅当|充分条件|保证了|意味着/],
  ['equivalent', /等价|一一对应|同一件事|互为|对偶|是.*的另(一种|一个)说法|同构/],
  ['generalizes',/推广|一般化|特殊(情形|情况)|特例|弱化|强化|加强|变体/],
  ['proved_by',  /证明|定理|由.*得证|已证|解决了/],
  ['depends_on', /依赖|需要|基于|用到|前提|建立(在|于)|来自|源于|起点/],
  ['tool_for',   /工具|技术|方法|手段|框架|语言|机制/],
  ['analogy',    /类似|类比|如出一辙|如出一辙|平行|镜像|很像|对应/],
  ['same_field', /同属|都属于|同一族|同一领域|都是|共享|共同/],
  ['contrast',   /对比|反例|区别|不同|相反|矛盾|张力/],
]

const buckets = new Map(TYPES.map(([n]) => [n, []]))
const multi = []
const none = []

for (const L of links) {
  const hits = TYPES.filter(([, re]) => re.test(L.why)).map(([n]) => n)
  if (!hits.length) { none.push(L); continue }
  buckets.get(hits[0]).push(L)
  if (hits.length > 1) multi.push({ ...L, hits })
}

console.log('按"最强命中"归类：')
for (const [n, arr] of [...buckets].sort((a, b) => b[1].length - a[1].length)) {
  const pct = ((arr.length / links.length) * 100).toFixed(1)
  console.log(`  ${n.padEnd(12)} ${String(arr.length).padStart(5)}  ${pct.padStart(5)}%`)
}
const covered = links.length - none.length
console.log(`\n覆盖: ${covered} / ${links.length} = ${((covered / links.length) * 100).toFixed(1)}%`)
console.log(`多义（同时命中 ≥2 类）: ${multi.length}  (${((multi.length / links.length) * 100).toFixed(1)}%)`)
console.log(`未命中任何类型: ${none.length}  (${((none.length / links.length) * 100).toFixed(1)}%)`)

console.log('\n── 多义样例（说明纯正则不可靠，需人工定夺）──')
for (const m of multi.slice(0, 12)) {
  console.log(`  [${m.hits.join('+')}] ${m.why.slice(0, 74)}`)
}
console.log('\n── 未命中样例（可能是真的"仅相关"）──')
for (const m of none.slice(0, 14)) {
  console.log(`  ${m.why.slice(0, 78)}`)
}

/* 权重与类型的关系：蕴含类是否权重更高？若有相关性，说明类型学与已有
 * 权重是同一个潜在维度，那就没必要新增字段 —— 这个检验必须做，
 * 否则我可能在推荐一个"冗余字段"。 */
console.log('\n── 权重 vs 类型（检验"类型"是否只是权重的马甲）──')
for (const [n, arr] of [...buckets].sort((a, b) => b[1].length - a[1].length)) {
  if (!arr.length) continue
  const ws = arr.map((x) => x.w).sort((a, b) => a - b)
  const mean = ws.reduce((a, b) => a + b, 0) / ws.length
  const med = ws[Math.floor(ws.length / 2)]
  console.log(`  ${n.padEnd(12)} n=${String(arr.length).padStart(4)}  均值 ${mean.toFixed(3)}  中位 ${med.toFixed(2)}  区间 [${ws[0]}, ${ws[ws.length - 1]}]`)
}
const allW = links.map((x) => x.w).sort((a, b) => a - b)
console.log(`  ${'全部'.padEnd(12)} n=${String(allW.length).padStart(4)}  均值 ${(allW.reduce((a, b) => a + b, 0) / allW.length).toFixed(3)}  中位 ${allW[Math.floor(allW.length / 2)].toFixed(2)}`)

fs.writeFileSync('.research/link-types.txt',
  links.map((L) => `${L.from}\t${L.to}\t${L.w}\t${L.why}`).join('\n'), 'utf8')
console.log('\n[已存 .research/link-types.txt]')
