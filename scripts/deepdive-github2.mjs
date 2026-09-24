/**
 * 看两个"和本项目最像"的中文数学知识图谱，取它们的数据建模思路。
 *
 *   Jia-Yee/math-knowledge-graph
 *     "覆盖小学到大学、研究级别的结构化数学知识体系…建模数学概念、定理、
 *      公式、分支之间的依赖关系，支持个性化学习路径规划"
 *     —— 与本项目的"公式之间的关联 + 重要度"最接近，可能有可借鉴的
 *        **关系类型学**（依赖/推广/特例/等价…）而本项目现在只有单一
 *        `LINKS` 权重，没有区分"什么关系"。
 *
 *   InfinityUniverse0/Mathematical-Courses-Knowledge-Graph
 *     高等教育数学课程体系知识图谱。
 *
 * 另取两个交互设计的：
 *   cns-iu/map4sci            ZMLT 多层级语义缩放（图随缩放换拓扑）
 *   reppertj/philosophical-graphiti  两节点间最短路诱导子图（"他们怎么联系上的"）
 */
import fs from 'node:fs'

const TOKEN = (process.env.GH_TOKEN || '').trim()
const H = {
  Authorization: `Bearer ${TOKEN}`,
  Accept: 'application/vnd.github.raw',
  'User-Agent': 'formula-nebula-research',
}
const HJ = { ...H, Accept: 'application/vnd.github+json' }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const REPOS = [
  'Jia-Yee/math-knowledge-graph',
  'InfinityUniverse0/Mathematical-Courses-Knowledge-Graph',
  'cns-iu/map4sci',
  'reppertj/philosophical-graphiti',
]

const out = []
const P = (s) => { console.log(s); out.push(s) }

for (const repo of REPOS) {
  P('\n' + '='.repeat(80))
  P(`▶ ${repo}`)
  P('='.repeat(80))
  try {
    const r = await fetch(`https://api.github.com/repos/${repo}`, { headers: HJ })
    if (r.ok) {
      const j = await r.json()
      P(`★ ${j.stargazers_count}   ${j.language}   ${(j.pushed_at || '').slice(0, 10)}   ${j.license?.spdx_id || '无许可'}`)
      P(`  ${j.description || ''}`)
    } else P(`  [HTTP ${r.status}]`)
  } catch (e) { P('  meta: ' + e.message) }
  await sleep(600)

  try {
    const r = await fetch(`https://api.github.com/repos/${repo}/readme`, { headers: H })
    if (r.ok) {
      const t = await r.text()
      P(`\n── README（${t.length} 字符）──`)
      P(t.slice(0, 3800))
    } else P(`  README [HTTP ${r.status}]`)
  } catch (e) { P('  readme: ' + e.message) }
  await sleep(600)

  try {
    const r = await fetch(`https://api.github.com/repos/${repo}/git/trees/HEAD?recursive=1`, { headers: HJ })
    if (r.ok) {
      const j = await r.json()
      const paths = (j.tree || []).filter((x) => x.type === 'blob').map((x) => x.path)
      P(`\n── 文件树（${paths.length}）──`)
      for (const p of paths.slice(0, 70)) P('   ' + p)
      if (paths.length > 70) P(`   … 另有 ${paths.length - 70}`)
    }
  } catch (e) { P('  tree: ' + e.message) }
  await sleep(1100)
}

fs.writeFileSync('.research/github-mathkg.txt', out.join('\n'), 'utf8')
P('\n[已存 .research/github-mathkg.txt]')
