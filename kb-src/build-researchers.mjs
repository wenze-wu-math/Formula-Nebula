/**
 * kb-src/build-researchers.mjs — 把 zbMATH 数据转成研究者节点。
 *
 * ═══ 数据来源与边界 ═══
 *
 * zbMATH API 给的是**硬事实**：稳定 code、获奖、MSC 分布、外部 ID。
 * 它**不给**：合作者网络、逐篇文献、当前机构、研究方向的自然语言描述。
 *
 * 所以本脚本的产出分两部分：
 *   · `zbmath` 字段：全部来自 API，可逐条复核（附 zbmath_url）
 *   · `summary`/`focus`：由 MSC 分布 + 奖项**机械派生**，不编造内容
 *     （例如 "MSC 14 为主（48 篇），Fields Medal 2018"）
 *
 * 手写的 24 条叙述性条目保持不变，本脚本只补**新的人**。
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = join(HERE, '..')
const src = JSON.parse(readFileSync(join(HERE, 'out', 'zbmath-authors.json'), 'utf8'))

/* MSC 一级分类 → 中文名（只列与知识库相关的） */
const MSC_NAME = {
  '00': '一般性与综合', '01': '历史与传记', '03': '数理逻辑与基础',
  '05': '组合数学', '11': '数论', '12': '域论与多项式', '13': '交换环与代数',
  '14': '代数几何', '15': '线性与多重线性代数', '16': '结合环与代数',
  '17': '非结合环与代数', '18': '范畴论与同调代数', '19': 'K 理论',
  '20': '群论与推广', '22': '拓扑群与李群', '26': '实分析', '30': '单复变',
  '32': '多复变与解析空间', '35': '偏微分方程', '37': '动力系统与遍历论',
  '40': '序列与级数', '41': '逼近与展开', '42': '调和分析', '43': '抽象调和分析',
  '46': '泛函分析', '47': '算子理论', '49': '变分法与最优控制',
  '51': '几何学', '52': '凸几何与离散几何', '53': '微分几何', '54': '一般拓扑',
  '55': '代数拓扑', '57': '流形与胞腔复形', '58': '整体分析、流形上的分析',
  '60': '概率论', '62': '统计学', '65': '数值分析', '68': '计算机科学',
  '70': '力学', '76': '流体力学', '78': '光学与电磁理论', '81': '量子理论',
  '82': '统计力学', '83': '相对论与引力', '85': '天文与天体物理',
  '90': '运筹学与数学规划', '91': '博弈论与经济学', '92': '生物学',
  '93': '系统论与控制论', '94': '信息与通讯', '97': '数学教育',
}

/* 领域映射：主 MSC → 知识库的 researcher field */
function fieldOf(mainFields) {
  const top = (mainFields || [])[0]?.field
  if (!top) return 'ag'
  const n = Number(top)
  if (n === 14 || n === 13 || n === 12 || n === 18) return 'ag'
  if (n === 11 || n === 19) return 'arith'
  if (n === 53 || n === 55 || n === 57 || n === 58 || n === 51) return 'topo'
  if (n === 20 || n === 22 || n === 16 || n === 17) return 'algebra'
  if (n === 35 || n === 42 || n === 46 || n === 47 || n === 49) return 'analysis'
  if (n === 3 || n === 68) return 'logic'
  return 'ag'
}

/** 从 zbMATH 记录派生一个 id（用 code，稳定且唯一） */
function makeId(code) {
  return 'rz-' + String(code).replace(/[^a-z0-9]+/gi, '-').toLowerCase()
}

/** 机械派生 summary：只用 API 给的事实，不编造 */
function deriveSummary(rec) {
  const parts = []
  const mf = rec.main_fields || []
  if (mf.length) {
    const top = mf.slice(0, 2).map((f) => `${MSC_NAME[String(f.field)] || 'MSC ' + f.field}（${f.count} 篇）`)
    parts.push(`主要方向：${top.join('、')}`)
  }
  const awards = (rec.awards || []).map((a) => `${a.title}${a.year ? ' ' + a.year : ''}`)
  if (awards.length) parts.push(`获奖：${awards.join('、')}`)
  return parts.join('；') || '（zbMATH 无足够元数据）'
}

/** detail：把 MSC 全分布 + 外部 ID 摊开，供面板展示 */
function deriveDetail(rec) {
  const lines = []
  const mf = rec.main_fields || []
  if (mf.length) {
    lines.push('MSC 分类分布（zbMATH 统计）：')
    for (const f of mf.slice(0, 6)) {
      lines.push(`  · ${f.field} ${MSC_NAME[String(f.field)] || ''} — ${f.count} 篇（${Number(f.percent).toFixed(1)}%）`)
    }
  }
  const ext = (rec.external_ids || []).filter((e) => ['mgp', 'wikidata', 'mactutor', 'homepage'].includes(e.type))
  if (ext.length) {
    lines.push('')
    lines.push('外部标识：')
    for (const e of ext) {
      lines.push(`  · ${e.type}: ${e.external_id}`)
    }
  }
  return lines.join('\n')
}

const nodes = []
const skipped = []
for (const [query, rec] of Object.entries(src)) {
  if (rec._miss || !rec.code) { skipped.push(query); continue }
  const id = makeId(rec.code)
  const awards = (rec.awards || []).map((a) => ({ title: a.title, year: a.year ?? null }))
  const mf = rec.main_fields || []
  /* importance：主 MSC 是 14（代数几何）且发表量大的更重要 */
  const agCount = mf.filter((f) => f.field === '14').reduce((a, f) => a + f.count, 0)
  const total = mf.reduce((a, f) => a + f.count, 0) || 1
  const agShare = agCount / total
  let imp = 0.55 + 0.25 * Math.min(1, agCount / 80) + 0.12 * agShare
  if (awards.some((a) => /Fields/.test(a.title))) imp += 0.06
  imp = Math.round(Math.min(0.97, imp) * 100) / 100

  nodes.push({
    id,
    latex: `\\text{${rec.name}}`,
    name: rec.name,
    en: rec.name,
    importance: imp,
    field: fieldOf(mf),
    institution: '',
    focus: mf.slice(0, 3).map((f) => MSC_NAME[String(f.field)] || 'MSC ' + f.field).join('、'),
    summary: deriveSummary(rec),
    detail: deriveDetail(rec),
    representativeWorks: [],
    zbmath: {
      code: rec.code,
      url: rec.zbmath_url,
      awards,
      mscTop: mf.slice(0, 5).map((f) => ({ field: f.field, name: MSC_NAME[String(f.field)] || '', count: f.count })),
      externalIds: (rec.external_ids || []).map((e) => ({ type: e.type, id: e.external_id })),
    },
  })
}

/* 去重（同一 code 可能被多个查询命中） */
const byId = new Map()
for (const n of nodes) if (!byId.has(n.id)) byId.set(n.id, n)
const uniq = [...byId.values()]

console.log(`zbMATH 记录 ${Object.keys(src).length} 条 → 去重后 ${uniq.length} 人`)
console.log(`跳过（无精确匹配）: ${skipped.length ? skipped.join(', ') : '无'}`)
const byField = {}
for (const n of uniq) byField[n.field] = (byField[n.field] || 0) + 1
console.log('按领域:', JSON.stringify(byField))
console.log('importance:', Math.min(...uniq.map((n) => n.importance)), '~', Math.max(...uniq.map((n) => n.importance)))

/* 与现有 24 条比对，避免 id 冲突 */
const existing = await import(new URL('../src/data/researchers.js', import.meta.url).href)
const existIds = new Set(existing.RESEARCHER_NODES.map((n) => n.id))
const existNames = new Set(existing.RESEARCHER_NODES.map((n) => String(n.name).toLowerCase()))
const clash = uniq.filter((n) => existIds.has(n.id))
const dup = uniq.filter((n) => existNames.has(String(n.name).toLowerCase()))
console.log(`与现有 id 冲突: ${clash.length}；姓名重复: ${dup.length}（${dup.map((n) => n.name).join(', ') || '无'}）`)

const finalNodes = uniq.filter((n) => !dup.some((d) => d.id === n.id))

const dest = join(ROOT, 'src', 'data', 'researchers-extra.js')
mkdirSync(dirname(dest), { recursive: true })
const body = `/**
 * src/data/researchers-extra.js — 由 zbMATH Open API 自动抽取的数学家档案。
 *
 * ⚠ 生成物，不要手改。重新生成：
 *     node kb-src/fetch-zbmath.mjs && node kb-src/build-researchers.mjs
 *
 * 来源：https://api.zbmath.org/v1/author/_search（公开 API，实测可用；
 *       HTML 页面 zbmath.org/authors 返回 403，不走那条路）
 *
 * 每条都有 \`zbmath.code\` 与 \`zbmath.url\`，可逐条复核。
 * 注意：zbMATH 不提供合作者网络与逐篇文献，所以本文件不含这两项；
 *       summary/detail 由 MSC 分布与获奖记录**机械派生**，未编造内容。
 *       手写的 24 条叙述性档案在 researchers.js，两者互补。
 *
 * 生成时间：${new Date().toISOString()}
 * 人数：${finalNodes.length}
 */

export const RESEARCHER_EXTRA_NODES = ${JSON.stringify(finalNodes, null, 1)}
`
writeFileSync(dest, body, 'utf8')
console.log(`\n写入 ${dest}（${(Buffer.byteLength(body) / 1024).toFixed(1)} KB）`)
