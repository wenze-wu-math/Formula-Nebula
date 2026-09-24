/* 自检：progress.js 里声称的每个年份，**必须**真的出现在该条猜想的正文里。
 * 这是防"我编了一个年份"的机械保险。 */
import { CONJECTURE_NODES } from '../src/data/conjectures.js'
import { PROGRESS_EVIDENCE, DATA_AS_OF } from '../src/data/progress.js'

const byId = new Map(CONJECTURE_NODES.map((n) => [n.id, n]))
let ok = 0
const bad = []

for (const [id, [year, ev]] of Object.entries(PROGRESS_EVIDENCE)) {
  const n = byId.get(id)
  if (!n) { bad.push([id, '节点不存在']); continue }
  const text = `${n.summary || ''} ${n.detail || ''}`
  if (!text.includes(String(year))) { bad.push([id, `正文里没有 ${year}`]); continue }
  // 证据片段的**关键词**应在正文里。不要求逐字匹配（片段里可能有全角括号、
  // 省略、markdown 标记等排版差异），只要求"至少一个够长的特征词"能对上。
  //
  // ⚠ 两个坑，都踩过：
  //  ① 正文含 markdown 强调标记（「证明了**有理连通性**」），证据片段不含
  //     —— 所以要先剥掉 `**` 与空白再比。
  //  ② **汉字与拉丁字母必须分开取词**。第一版用 `[\u4e00-\u9fa5A-Za-z]{4,}`
  //     把两者当成一个字符类，于是「一般型由 BCHM（2010）证明」被抽成
  //     一个整体词 "一般型由BCHM" —— 而正文里这句中间夹着「（κ = dim X）」，
  //     永远不可能连续匹配上。分开取词后 "一般型"、"BCHM" 各自都能对上。
  //  ③ 还要**去掉引号**：正文里写「（Tao 2019 证明"几乎所有轨道…"）」，
  //     引号会把一段连续的汉字切成两半，导致证据片段永远接不上。
  //     引号是排版噪声，不是语义内容，比对时一律剔除。
  const norm = (s) => String(s)
    .replace(/\*\*/g, '')
    .replace(/["'“”‘’「」『』]/g, '')
    .replace(/[\s\u3000]/g, '')
  const ntext = norm(text)
  const nev = norm(ev)
  const keys = [
    ...(nev.match(/[\u4e00-\u9fa5]{4,}/g) || []),   // 连续汉字 ≥4
    ...(nev.match(/[A-Za-z]{4,}/g) || []),          // 连续拉丁字母 ≥4
  ]
  const hit = keys.length === 0 || keys.some((k) => ntext.includes(k))
  if (!hit) bad.push([id, `证据片段对不上: "${ev.slice(0, 24)}"`])
  else ok++
}

console.log(`progress 条目: ${Object.keys(PROGRESS_EVIDENCE).length}`)
console.log(`年份在正文中可核实: ${ok}`)
console.log(`问题: ${bad.length}`)
for (const [id, why] of bad) console.log(`   ✗ ${id}: ${why}`)

// 反向检查：有没有节点被漏掉（59 - 36 = 23 条无证据）
const missing = CONJECTURE_NODES.filter((n) => !PROGRESS_EVIDENCE[n.id]).map((n) => n.id)
console.log(`\n无正文年份证据（保持为空，绝不编）：${missing.length} 条`)
console.log('  ' + missing.join(', '))

// 检查所有年份都不超过 DATA_AS_OF
const asOfYear = Number(DATA_AS_OF.slice(0, 4))
const future = Object.entries(PROGRESS_EVIDENCE).filter(([, [y]]) => y > asOfYear)
console.log(`\n超过数据截至年 ${asOfYear} 的: ${future.length}`)
for (const [id, [y]] of future) console.log(`   ✗ ${id}: ${y}`)

// 检查 progress 是否都 ≥ 提出年
const backwards = []
for (const [id, [y]] of Object.entries(PROGRESS_EVIDENCE)) {
  const n = byId.get(id)
  if (n?.year && y < n.year) backwards.push([id, n.year, y])
}
console.log(`\nprogress < 提出年（可疑）: ${backwards.length}`)
for (const [id, py, gy] of backwards) console.log(`   ? ${id}: 提出 ${py} → progress ${gy}`)
