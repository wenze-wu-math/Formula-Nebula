/**
 * 在 GitHub 上搜"和本项目同类的设计"，找还没吸收过的思路。
 *
 * 已知已吸收：Cohenjikan/shiyun（旋涡骨架、指数盘半径、共用自转）、
 * VictorChenLi/poem-cloud。所以下面每个查询都要能答一个问题：
 * "这里有 shiyun / poem-cloud 没给过的东西吗？"
 *
 * 分六类问，因为"极佳的设计"在不同类别里含义不同：
 *   A 诗云/诗词星系  —— 同题材，看别人怎么处理"文字成云"
 *   B three.js 星系/星云 —— 视觉层：辉光、粒子、后期
 *   C 3D 知识图谱    —— 交互层：怎么让人在几百个节点里不迷路
 *   D 数学可视化     —— 公式渲染与 LaTeX 纹理
 *   E 图布局算法     —— 力导向/球面布局的更好做法
 *   F 文字云/3D 文字 —— "字"本身的排版与动画
 *
 * 输出按 star 排序并去重，附一句话说明它能补什么。
 */
import fs from 'node:fs'

const TOKEN = (process.env.GH_TOKEN || '').trim()
if (!TOKEN) { console.error('缺 GH_TOKEN'); process.exit(1) }
const H = {
  Authorization: `Bearer ${TOKEN}`,
  Accept: 'application/vnd.github+json',
  'User-Agent': 'formula-nebula-research',
  'X-GitHub-Api-Version': '2022-11-28',
}

const QUERIES = [
  /* A 诗云 / 诗词星系 */
  ['A 诗云/诗词星系', '诗云'],
  ['A 诗云/诗词星系', '诗词 可视化 星系'],
  ['A 诗云/诗词星系', 'poem galaxy visualization'],
  ['A 诗云/诗词星系', 'chinese poetry visualization'],
  ['A 诗云/诗词星系', '文字 粒子 星空'],
  ['A 诗云/诗词星系', 'text galaxy three.js'],

  /* B three.js 星系 / 星云 / 后期 */
  ['B 星系视觉', 'three.js galaxy'],
  ['B 星系视觉', 'three.js nebula'],
  ['B 星系视觉', 'galaxy simulation webgl'],
  ['B 星系视觉', 'three.js bloom postprocessing'],
  ['B 星系视觉', 'webgl particle system million'],

  /* C 3D 知识图谱 */
  ['C 3D 知识图谱', '3d knowledge graph visualization'],
  ['C 3D 知识图谱', 'knowledge graph three.js'],
  ['C 3D 知识图谱', 'concept map 3d explorer'],
  ['C 3D 知识图谱', 'graph view obsidian'],
  ['C 3D 知识图谱', 'graphology sigma.js'],
  ['C 3D 知识图谱', '3d force directed graph webgl'],

  /* D 数学可视化 / 公式 */
  ['D 数学/公式', 'math visualization three.js'],
  ['D 数学/公式', 'latex mathjax rendering canvas'],
  ['D 数学/公式', 'manim math animation'],
  ['D 数学/公式', 'theorem dependency graph'],
  ['D 数学/公式', 'mathlib graph visualization'],

  /* E 图布局算法 */
  ['E 布局算法', 'force directed graph layout 3d'],
  ['E 布局算法', 'graph layout spherical'],
  ['E 布局算法', 'graphviz layout algorithm library'],
  ['E 布局算法', 'large graph layout webgl gpu'],

  /* F 文字云 / 3D 文字 */
  ['F 文字云/3D 文字', 'word cloud 3d'],
  ['F 文字云/3D 文字', 'troika text sdf'],
  ['F 文字云/3D 文字', 'text sphere layout'],
]

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const seen = new Map()
const log = []

for (const [cat, q] of QUERIES) {
  const url = 'https://api.github.com/search/repositories?per_page=12&sort=stars&order=desc&q=' +
    encodeURIComponent(q)
  try {
    const r = await fetch(url, { headers: H })
    if (r.status === 403 || r.status === 429) {
      const ra = r.headers.get('x-ratelimit-reset')
      console.log(`  [限流] ${q} — 等 20s`)
      await sleep(20000)
      continue
    }
    if (!r.ok) { console.log(`  [HTTP ${r.status}] ${q}`); await sleep(1200); continue }
    const j = await r.json()
    console.log(`${cat.padEnd(18)} ${String(j.total_count).padStart(7)}  ${q}`)
    for (const it of j.items || []) {
      const full = it.full_name
      if (!seen.has(full)) {
        seen.set(full, {
          full, stars: it.stargazers_count, desc: (it.description || '').slice(0, 200),
          lang: it.language, push: (it.pushed_at || '').slice(0, 10),
          topics: it.topics || [], cats: new Set([cat]), url: it.html_url,
          arch: it.archived, license: it.license?.spdx_id || null,
        })
      } else {
        seen.get(full).cats.add(cat)
      }
    }
    log.push(`${cat}\t${q}\t${j.total_count}`)
  } catch (e) { console.log(`  [err] ${q}: ${e.message}`) }
  await sleep(2200)
}

const all = [...seen.values()].sort((a, b) => b.stars - a.stars)
console.log(`\n去重后共 ${all.length} 个仓库\n`)
for (const r of all) {
  console.log(`${String(r.stars).padStart(7)} ★  ${r.full}`)
  console.log(`          ${[...r.cats].join(' / ')}  |  ${r.lang || '?'}  |  更新 ${r.push}${r.arch ? '  [已归档]' : ''}`)
  console.log(`          ${r.desc || '（无描述）'}`)
}

 
fs.writeFileSync('.research/github-scan.json', JSON.stringify(all.map((r) => ({ ...r, cats: [...r.cats] })), null, 2), 'utf8')
fs.writeFileSync('.research/github-scan.txt', all.map((r) =>
  `${r.stars}\t${r.full}\t${[...r.cats].join('/')}\t${r.lang}\t${r.push}\t${r.desc}`).join('\n'), 'utf8')
console.log('\n[已存 .research/github-scan.txt / .json]')
