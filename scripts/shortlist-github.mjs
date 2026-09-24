/**
 * 从 github-scan.json 里筛出真正值得看的，并按"能补什么"归类。
 *
 * 排除规则（都是噪声来源）：
 *   · 描述含政治/书籍列表/无关学科的词
 *   · 与本项目无关的类别命中（比如 "x86" 命中了"文字"）
 *   · star 太低且无明确新意
 *
 * 重点看四类信号：
 *   ① 同题材（诗云/文字星系）—— 看别人怎么做"文字成云"
 *   ② 数学定理依赖图 —— 和"公式之间的联系"最贴近
 *   ③ 3D 知识图谱的**交互**做法 —— 几百节点里不迷路
 *   ④ 图布局算法 —— 有没有比手写松弛更好的
 */
import fs from 'node:fs'

const all = JSON.parse(fs.readFileSync('.research/github-scan.json', 'utf8'))
const NOISE = /propaganda|政治|dictatorship|书籍|book list|x86|bare.metal|kernel|hackintosh|interview|leetcode|roadmap|awesome|cheatsheet|covid|blockchain|crypto|trading|stock|game|shooter|pet|portfolio website|blog platform|ecommerce/i
const DROP_LANG = /^(MATLAB|Jupyter Notebook|C\+\+|Rust|Python|Haskell|Go|Java|C#)$/

const keep = all.filter((r) => {
  if (NOISE.test(r.desc || '')) return false
  if (r.stars < 30 && !/诗云|poem|poetry|知识图谱|knowledge graph|force|galaxy|word cloud|theorem|math/i.test(r.desc || '')) return false
  return true
})

/* 手工归类：按"能补什么"而不是按我搜它的关键词 */
const BUCKETS = [
  ['① 同题材：文字/诗歌星系', /poem|poetry|诗|文字.*(星系|云|星)|word cloud|tag cloud|text.*(sphere|galaxy|cloud)/i],
  ['② 数学定理依赖图', /theorem|mathlib|lean|proof|dependency.*(graph|map)|latex.*(graph|depend)/i],
  ['③ 3D 知识图谱与交互', /knowledge graph|concept map|mind ?map|second brain|obsidian|graph view|graph explor|note/i],
  ['④ 图布局与力导向', /force[- ]directed|graph layout|octree|barnes[- ]hut|n-?body|layout algorithm/i],
  ['⑤ 星系/星云视觉', /galaxy|nebula|starfield|solar system|particle|bloom|post-?process/i],
  ['⑥ 数学可视化', /math|geometr|function.*plot|manim|visualiz/i],
]
const used = new Set()
const out = []
for (const [name, re] of BUCKETS) {
  const hits = keep.filter((r) => !used.has(r.full) && re.test((r.desc || '') + ' ' + r.full))
    .sort((a, b) => b.stars - a.stars)
  hits.forEach((r) => used.add(r.full))
  out.push({ name, hits: hits.slice(0, 14) })
}

const lines = []
const P = (s) => { console.log(s); lines.push(s) }
for (const { name, hits } of out) {
  P('\n' + '='.repeat(78))
  P(`${name}   （${hits.length} 个）`)
  P('='.repeat(78))
  for (const r of hits) {
    P(`${String(r.stars).padStart(6)}★  ${r.full}`)
    P(`         ${(r.desc || '').slice(0, 150)}`)
    P(`         ${r.lang || '?'} · 更新 ${r.push} · ${r.license || '无许可'}${r.arch ? ' · 已归档' : ''}`)
  }
}
fs.writeFileSync('.research/github-shortlist.txt', lines.join('\n'), 'utf8')
P(`\n[共 ${keep.length} 个通过初筛，已存 .research/github-shortlist.txt]`)
