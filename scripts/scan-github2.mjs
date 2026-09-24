/**
 * 第二轮：针对"本项目确实没有"的几件事，去找做得最好的例子。
 *
 * 已经从第一轮确认本项目的空白（用 grep 查过 src/）：
 *   · 没有任何 URL 状态（location.hash / pushState / permalink 全为 0）
 *   · 没有小地图 / 层级细节(LOD) / 社区发现
 *   · 有 search、有 filter（配色/显示层），但没有"按族隔离显示"
 *
 * 所以第二轮围绕这些具体问题搜：
 *   G 深链接/可分享状态：图可视化怎么把"当前视图"编码进 URL
 *   H 路径查找：两个节点之间"怎么联系上的"
 *   I 语义缩放 / LOD：几百个节点怎么随缩放换细节层级
 *   J 焦点+上下文：选中一个节点时，如何既不丢全局又不被淹没
 *   K 中文本体/知识图谱的可视化惯例
 */
import fs from 'node:fs'

const TOKEN = (process.env.GH_TOKEN || '').trim()
const H = {
  Authorization: `Bearer ${TOKEN}`,
  Accept: 'application/vnd.github+json',
  'User-Agent': 'formula-nebula-research',
  'X-GitHub-Api-Version': '2022-11-28',
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const Q = [
  ['G 深链接/分享状态', 'graph visualization url state share'],
  ['G 深链接/分享状态', 'three.js scene state url params'],
  ['G 深链接/分享状态', 'permalink shareable view state react'],
  ['H 路径查找', 'knowledge graph shortest path finder'],
  ['H 路径查找', 'graph path between nodes visualization'],
  ['I 语义缩放/LOD', 'semantic zoom graph'],
  ['I 语义缩放/LOD', 'level of detail labels three.js'],
  ['I 语义缩放/LOD', 'label culling overlap screen space'],
  ['J 焦点+上下文', 'focus context graph visualization'],
  ['J 焦点+上下文', 'graph local neighborhood view obsidian'],
  ['J 焦点+上下文', 'graph exploration breadcrumb'],
  ['K 中文知识图谱', '中文 知识图谱 可视化'],
  ['K 中文知识图谱', '数学 知识图谱'],
  ['K 中文知识图谱', '公式 关系 可视化'],
]

const seen = new Map()
const log = []
for (const [cat, q] of Q) {
  try {
    const r = await fetch('https://api.github.com/search/repositories?per_page=10&sort=stars&order=desc&q=' +
      encodeURIComponent(q), { headers: H })
    if (!r.ok) { console.log(`  [HTTP ${r.status}] ${q}`); await sleep(2000); continue }
    const j = await r.json()
    console.log(`${cat.padEnd(16)} ${String(j.total_count).padStart(6)}  ${q}`)
    for (const it of j.items || []) {
      if (!seen.has(it.full_name)) {
        seen.set(it.full_name, {
          full: it.full_name, stars: it.stargazers_count,
          desc: (it.description || '').slice(0, 190), lang: it.language,
          push: (it.pushed_at || '').slice(0, 10), cats: new Set([cat]),
          license: it.license?.spdx_id || null,
        })
      } else seen.get(it.full_name).cats.add(cat)
    }
    log.push(`${cat}\t${q}\t${j.total_count}`)
  } catch (e) { console.log(`  [err] ${q}: ${e.message}`) }
  await sleep(2400)
}

const all = [...seen.values()].sort((a, b) => b.stars - a.stars)
const NOISE = /propaganda|政治|dictatorship|书籍|book list|x86|bare.metal|leetcode|interview|crypto|trading|game|shooter|portfolio website/i
const keep = all.filter((r) => !NOISE.test(r.desc || ''))

const lines = []
const P = (s) => { console.log(s); lines.push(s) }
P(`\n去重 ${all.length}，初筛后 ${keep.length}\n`)
for (const r of keep) {
  P(`${String(r.stars).padStart(6)}★  ${r.full}   [${[...r.cats].join(',')}]`)
  P(`         ${r.desc}`)
  P(`         ${r.lang || '?'} · ${r.push} · ${r.license || '无许可'}`)
}
fs.writeFileSync('.research/github-round2.txt', lines.join('\n'), 'utf8')
P('\n[已存 .research/github-round2.txt]')
