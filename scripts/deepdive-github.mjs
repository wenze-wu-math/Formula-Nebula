/**
 * 取几个仓库的 README 与文件树，找"还没吸收"的设计点。
 *
 * 重点不是"有哪些功能"，而是**每个功能解决什么问题** ——
 * 本项目已经自己踩过很多坑（README 里"布局算法：六个踩过的坑"），
 * 所以只有能答出"它解决了我哪个具体问题"的才值得记。
 *
 * 特别关注 beltoforion/Galaxy-Renderer-Typescript 的**密度波理论**：
 * 本项目现在是手写的"四条旋臂"（对数螺线 + 角度扰动），
 * 而密度波是解释旋臂为何存在的**物理机制** —— 若它能给出更自然的
 * 旋臂且不破坏"半径 ← 重要度"映射，就是升级而不是装饰。
 */
import fs from 'node:fs'

const TOKEN = (process.env.GH_TOKEN || '').trim()
const H = {
  Authorization: `Bearer ${TOKEN}`,
  Accept: 'application/vnd.github.raw',
  'User-Agent': 'formula-nebula-research',
}
const HJ = { ...H, Accept: 'application/vnd.github+json' }

const REPOS = [
  'Cohenjikan/shiyun',
  'beltoforion/Galaxy-Renderer-Typescript',
  'patrik-cihal/lean-graph',
  'lyon-industries/graphrag-workbench',
]

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const out = []
const P = (s) => { console.log(s); out.push(s) }

for (const repo of REPOS) {
  P('\n' + '='.repeat(80))
  P(`▶ ${repo}`)
  P('='.repeat(80))

  /* 元信息 */
  try {
    const r = await fetch(`https://api.github.com/repos/${repo}`, { headers: HJ })
    if (r.ok) {
      const j = await r.json()
      P(`★ ${j.stargazers_count}   ${j.language}   更新 ${(j.pushed_at || '').slice(0, 10)}   ${j.license?.spdx_id || '无许可'}`)
      P(`  ${j.description || ''}`)
      P(`  homepage: ${j.homepage || '—'}   topics: ${(j.topics || []).join(', ') || '—'}`)
    } else P(`  [HTTP ${r.status}]`)
  } catch (e) { P('  meta fail: ' + e.message) }
  await sleep(700)

  /* README */
  try {
    const r = await fetch(`https://api.github.com/repos/${repo}/readme`, { headers: H })
    if (r.ok) {
      const t = await r.text()
      P(`\n── README（${t.length} 字符，取前 4500）──`)
      P(t.slice(0, 4500))
    } else P(`\n  README [HTTP ${r.status}]`)
  } catch (e) { P('  readme fail: ' + e.message) }
  await sleep(700)

  /* 文件树：只看源码目录，判断实现思路 */
  try {
    const r = await fetch(`https://api.github.com/repos/${repo}/git/trees/HEAD?recursive=1`, { headers: HJ })
    if (r.ok) {
      const j = await r.json()
      const paths = (j.tree || []).filter((x) => x.type === 'blob').map((x) => x.path)
      P(`\n── 文件树（${paths.length} 个文件）──`)
      /* 只打印可能是核心逻辑的，且按目录聚合 */
      const interesting = paths.filter((p) => /\.(ts|tsx|js|mjs|glsl|frag|vert|md)$/i.test(p) && !/node_modules|dist\/|\.min\./i.test(p))
      for (const p of interesting.slice(0, 90)) P('   ' + p)
      if (interesting.length > 90) P(`   … 另有 ${interesting.length - 90} 个`)
    } else P(`\n  树 [HTTP ${r.status}]`)
  } catch (e) { P('  tree fail: ' + e.message) }
  await sleep(1200)
}

fs.writeFileSync('.research/github-deepdive.txt', out.join('\n'), 'utf8')
P('\n[已存 .research/github-deepdive.txt]')
