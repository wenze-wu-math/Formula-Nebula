/**
 * kb-src/verify-nlab.mjs — nLab 概念节点的验收脚本。
 *
 * 检查重点与 Stacks 不同：nLab 是散文，没有稳定 tag，
 * 所以校验的是「抽取是否正确」而不是「标签是否对齐」：
 *   1. id 唯一、无冲突
 *   2. 每条有 url 且指向 ncatlab.org
 *   3. summary 是页面首段定义（长度合理、不是导航碎片）
 *   4. 公式是 LaTeX（不含 MathML 残留）
 *   5. 非概念页已被过滤（history/contents/philosophy 等）
 *   6. 零孤立、关联端点存在
 *   7. 抽样 url 真可达
 */
import { NLAB_NODES, NLAB_LINKS } from '../src/data/nlab-extra.js'
import { buildGraph } from '../src/graph.js'

let pass = 0, fail = 0
const ok = (name, cond, extra = '') => {
  if (cond) { pass++; console.log(`  PASS  ${name}${extra ? '  ' + extra : ''}`) }
  else { fail++; console.log(`  FAIL  ${name}${extra ? '  ' + extra : ''}`) }
}

console.log(`\n概念节点 ${NLAB_NODES.length}　关联 ${NLAB_LINKS.length}\n`)

/* 1. id */
const ids = new Set(NLAB_NODES.map((n) => n.id))
ok('id 唯一', ids.size === NLAB_NODES.length, `${ids.size}/${NLAB_NODES.length}`)
ok('id 格式 nlb-*', NLAB_NODES.every((n) => /^nlb-[a-z0-9-]+$/.test(n.id)))

/* 2. url */
ok('url 齐全', NLAB_NODES.every((n) => n.url))
ok('url 指向 ncatlab.org', NLAB_NODES.every((n) => /^https:\/\/ncatlab\.org\/nlab\/show\//.test(n.url || '')))

/* 3. summary 质量 */
const shortSum = NLAB_NODES.filter((n) => !n.summary || n.summary.length < 25)
ok('summary 长度合理（≥25 字）', shortSum.length === 0, `过短 ${shortSum.length}`)
/* 导航碎片特征：纯逗号分隔的短词列表 */
/* 「导航碎片」的真实特征：短（<60 字）+ 逗号分隔 + 无句末标点。
 * ⚠ 不能只判「有逗号且无句号」——`Despite the impression one may have, ...`
 *   这类正常定义也会命中。 */
const navLike = NLAB_NODES.filter((n) => {
  const s = (n.summary || '').trim()
  const words = s.split(/\s+/).filter(Boolean).length
  return words < 10 && (s.match(/,/g) || []).length >= 2 && !/[.!?]/.test(s)
})
ok('summary 不是导航碎片', navLike.length === 0, navLike.length ? navLike.slice(0, 2).map((n) => n.summary.slice(0, 30)).join(' / ') : '')

/* 4. latex 质量 */
const withLatex = NLAB_NODES.filter((n) => n.latex)
const mathmlLeak = withLatex.filter((n) => /<math|<mrow|<mi>|<annotation|&lt;/.test(n.latex))
ok('latex 无 MathML 残留', mathmlLeak.length === 0, `${mathmlLeak.length}`)
console.log(`       latex 覆盖 ${withLatex.length}/${NLAB_NODES.length} = ${(100 * withLatex.length / NLAB_NODES.length).toFixed(0)}%`)

/* 5. 非概念页已过滤 */
const badNames = NLAB_NODES.filter((n) => />\s*history$|- contents$|- exposition$|philosoph|modality|affine logic/i.test(n.nlab?.name || ''))
ok('非概念页已过滤', badNames.length === 0, badNames.length ? badNames.slice(0, 3).map((n) => n.nlab.name).join(', ') : '')

/* 6. 关联完整性 */
const g = buildGraph()
const allIds = new Set(g.nodes.map((n) => n.id))
const dangling = NLAB_LINKS.filter((l) => !allIds.has(l[0]) || !allIds.has(l[1]))
ok('关联端点全部存在', dangling.length === 0, `悬空 ${dangling.length}`)

const touched = new Set()
for (const l of NLAB_LINKS) { touched.add(l[0]); touched.add(l[1]) }
const orphans = NLAB_NODES.filter((n) => !touched.has(n.id))
ok('零孤立概念', orphans.length === 0, orphans.length ? orphans.slice(0, 3).map((o) => o.id).join(',') : '')

/* 7. 抽样 url */
console.log('\n抽样验证 nLab url（3 条）')
for (let i = 0; i < 3; i++) {
  const n = NLAB_NODES[Math.floor(i * NLAB_NODES.length / 3)]
  if (!n) continue
  try {
    const r = await fetch(n.url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0.0.0 Safari/537.36' },
    })
    const t = await r.text()
    ok(`url ${n.nlab.name}`, r.ok && t.includes('nLab'), `HTTP ${r.status}`)
  } catch (e) {
    ok(`url ${n.nlab.name}`, false, e.message.slice(0, 40))
  }
}

console.log(`\n结果：${pass} 通过 / ${fail} 失败`)
process.exitCode = fail ? 1 : 0
