/**
 * designs/manuscript/formulas-build.mjs — 生成预排版缓存 formulas-cache.json（node 下运行）。
 *
 *   cd "/d/xiangmu/Formula Nebula" && node designs/manuscript/formulas-build.mjs
 *
 * 为什么要预排版：MathJax 冷启动排 464 条公式在浏览器里要 2–4 s（worker 池也要先各自解析一遍 MathJax），
 * 而首屏预算是 3 s。tex.js 用 liteAdaptor，node 与浏览器里的输出逐字节相同（bench 页会抽查），
 * 所以可以离线排好、随方案一起发。缓存只是加速：每条都带 latex 与墨色，key 对不上的条目运行时照常现排。
 * 知识库改了公式后重新运行本脚本即可（不跑也不会出错，只是首屏慢一些）。
 */
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { buildGraph } from '../shared/kb.js'
import { texSync } from '../shared/tex.js'
import { PALETTE, TEX_EM } from './constants.js'
import { CACHE_VER, CACHE_FILE, encodePaths } from './formulas-key.js'

// 与 formulas.js 的 inkFor 相同（不 import formulas.js：它依赖浏览器 API）
const inkFor = (n) => (n.cluster ? PALETTE.noteInk : PALETTE.ink)

const t0 = Date.now()
const graph = buildGraph()
const dict = [], index = new Map(), entries = []
let fails = 0
for (const n of graph.nodes) {
  if (n.researcher) continue
  const color = inkFor(n)
  try {
    const r = texSync(n.latex, color)
    entries.push([n.id, n.latex, color, encodePaths(r.svg, dict, index), +r.widthPx.toFixed(3), +r.heightPx.toFixed(3)])
  } catch { fails++ }   // 排不出来的留给运行时（它会走 \text{名称} 兜底）
}
const out = { v: CACHE_VER, em: TEX_EM, dict, entries }
const file = fileURLToPath(new URL('./' + CACHE_FILE, import.meta.url))
writeFileSync(file, JSON.stringify(out))
console.log(`${CACHE_FILE}: ${entries.length} 条，${fails} 条失败，字典 ${dict.length} 条路径，` +
  `${(JSON.stringify(out).length / 1e6).toFixed(2)} MB，${Date.now() - t0} ms`)
