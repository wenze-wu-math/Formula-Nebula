/**
 * kb-src/verify-wikipedia.mjs — Wikipedia 猜想节点的验收脚本。
 *
 * Wikipedia 抽取的风险点与 UnsolvedMath 不同：
 *   · wikitext 清洗可能残留标记（[[...]]、{{...}}、<ref>）
 *   · 链接提取可能拿到非猜想条目
 *   所以重点校验"清洗是否干净"和"名字是否真是猜想"。
 */
import { WIKI_NODES, WIKI_LINKS } from '../src/data/wikipedia-extra.js'
import { buildGraph } from '../src/graph.js'

let pass = 0, fail = 0
const ok = (name, cond, extra = '') => {
  if (cond) { pass++; console.log(`  PASS  ${name}${extra ? '  ' + extra : ''}`) }
  else { fail++; console.log(`  FAIL  ${name}${extra ? '  ' + extra : ''}`) }
}

console.log(`\nWikipedia 猜想 ${WIKI_NODES.length}　关联 ${WIKI_LINKS.length}\n`)

/* 1. 基础 */
ok('id 唯一', new Set(WIKI_NODES.map((n) => n.id)).size === WIKI_NODES.length)
ok('id 格式 wk-*', WIKI_NODES.every((n) => /^wk-[a-z0-9-]+$/.test(n.id)))
ok('url 齐全', WIKI_NODES.every((n) => n.url))
ok('url 指向 wikipedia', WIKI_NODES.every((n) => /^https:\/\/en\.wikipedia\.org\/wiki\//.test(n.url || '')))

/* 2. wikitext 清洗干净 */
const dirty = WIKI_NODES.filter((n) => /\[\[|\]\]|\{\{|\}\}|<ref|<math/i.test(n.summary || ''))
ok('summary 无 wikitext 残留', dirty.length === 0, dirty.length ? dirty.slice(0, 2).map((n) => n.summary.slice(0, 50)).join(' / ') : '')

const dirtyDetail = WIKI_NODES.filter((n) => /\[\[|\{\{/.test(n.detail || ''))
ok('detail 无 wikitext 残留', dirtyDetail.length === 0, `${dirtyDetail.length}`)

/* 3. 名字像猜想 */
/* 「是不是猜想」不能只看名字 —— 列表页里有以**对象**命名的开放问题：
 *   · perfect cuboid → "Existence of perfect cuboids and associated cuboid conjectures"
 *   · SIC-POVM       → "Zauner's conjecture: do SIC-POVMs exist in all dimensions?"
 *   · Map folding    → "various problems in map folding and stamp folding."
 * 这些名字不含 conjecture 但确实是未解决的问题。
 *
 * 判据（任一成立即算猜想）：
 *   a) 名字含 conjecture/problem/question/hypothesis
 *   b) 陈述含猜想词（conjecture / problems / existence of / ...）
 *   c) 陈述含未解语气（is it / whether / does ... exist / not known）
 */
const CONJ_WORD = /conjecture|problem|question|hypothesis|program/i
const EXISTENCE = /\bexistence of\b|\bexist\b|\bopen\b/i
const OPEN_TONE = /\b(is it|whether|does there exist|are there|do all|can one|unknown|not known)\b/i

const notConj = WIKI_NODES.filter((n) => {
  const nameAndSum = `${n.name || ''} ${n.summary || ''}`
  if (CONJ_WORD.test(nameAndSum)) return false
  if (EXISTENCE.test(n.summary || '')) return false
  if (OPEN_TONE.test(`${n.summary || ''} ${n.detail || ''}`)) return false
  return true
})
ok('名字或陈述表明是开放问题', notConj.length === 0, notConj.length ? notConj.slice(0, 3).map((n) => n.name).join(', ') : '')

/* 4. latex 完整性 */
const D = String.fromCharCode(36)
const unbalanced = WIKI_NODES.filter((n) => ((n.latex || '').split(D).length - 1) % 2 !== 0)
ok('latex 美元符号成对', unbalanced.length === 0, `${unbalanced.length}`)
const tooLong = WIKI_NODES.filter((n) => (n.latex || '').length > 160)
ok('latex 长度 ≤160', tooLong.length === 0, `${tooLong.length}`)
const emptyLatex = WIKI_NODES.filter((n) => !n.latex || n.latex.length < 5)
ok('latex 非空', emptyLatex.length === 0, `${emptyLatex.length}`)

/* 5. field / status 合法 */
const FIELDS = ['ag', 'arith', 'topo', 'algebra', 'analysis', 'logic']
ok('field 全部合法', WIKI_NODES.every((n) => FIELDS.includes(n.field)),
  [...new Set(WIKI_NODES.map((n) => n.field))].filter((f) => !FIELDS.includes(f)).join(',') || '')
ok('status 全部合法', WIKI_NODES.every((n) => ['open', 'partial', 'proved', 'disproved', 'heuristic'].includes(n.status)))

/* 6. 关联 */
const g = buildGraph()
const allIds = new Set(g.nodes.map((n) => n.id))
const dangling = WIKI_LINKS.filter((l) => !allIds.has(l[0]) || !allIds.has(l[1]))
ok('关联端点存在', dangling.length === 0, `悬空 ${dangling.length}`)

const touched = new Set()
for (const l of WIKI_LINKS) { touched.add(l[0]); touched.add(l[1]) }
const orphans = WIKI_NODES.filter((n) => !touched.has(n.id))
ok('零孤立', orphans.length === 0, orphans.length ? orphans.slice(0, 3).map((o) => o.id).join(',') : '')

/* 7. 抽样 url */
console.log('\n抽样验证 Wikipedia url（3 条）')
for (let i = 0; i < 3; i++) {
  const n = WIKI_NODES[Math.floor(i * WIKI_NODES.length / 3)]
  if (!n) continue
  try {
    const r = await fetch(n.url, {
      method: 'HEAD',
      headers: { 'User-Agent': 'FormulaNebula/1.0 (knowledge base builder)' },
    })
    ok(`url ${n.name.slice(0, 30)}`, r.ok || r.status === 301, `HTTP ${r.status}`)
  } catch (e) {
    console.log(`  SKIP  ${n.name.slice(0, 30)}  网络不可达`)
  }
}

console.log(`\n按 field: ${JSON.stringify(WIKI_NODES.reduce((a, n) => (a[n.field] = (a[n.field] || 0) + 1, a), {}))}`)
console.log(`latex 含真公式: ${WIKI_NODES.filter((n) => /\$/.test(n.latex)).length} / ${WIKI_NODES.length}`)
console.log(`\n结果：${pass} 通过 / ${fail} 失败`)
process.exitCode = fail ? 1 : 0
