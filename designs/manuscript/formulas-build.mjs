/**
 * designs/manuscript/formulas-build.mjs — 生成预排版缓存 formulas-cache.json（node 下运行）。
 *
 *   cd "/d/xiangmu/Formula Nebula" && node designs/manuscript/formulas-build.mjs
 *
 * 为什么要预排版：MathJax 冷启动排 464 条公式在浏览器里要 2–4 s（worker 池也要先各自解析一遍 MathJax），
 * 而首屏预算是 3 s。tex.js 用 liteAdaptor，node 与浏览器里的输出逐字节相同（bench 页会抽查），
 * 所以可以离线排好、随方案一起发。缓存只是加速：每条都带 latex 与墨色，key 对不上的条目运行时照常现排。
 * 知识库改了公式后重新运行本脚本即可（不跑也不会出错，只是首屏慢一些）。
 *
 * 优化（v2）：
 *   1. gzip 压缩（.json.gz）—— 18MB → ~3MB
 *   2. 增量构建（只重建改变的公式）—— 4.5s → < 1s（二次构建）
 *   3. 哈希指纹（内容变化时自动失效缓存）
 */
import { writeFileSync, readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'
import { gzipSync } from 'node:zlib'
import { buildGraph } from '../shared/kb.js'
import { texSync } from '../shared/tex.js'
import { PALETTE, TEX_EM } from './constants.js'
import { CACHE_VER, CACHE_FILE, CACHE_FILE_GZ, encodePaths } from './formulas-key.js'

// 与 formulas.js 的 inkFor 相同（不 import formulas.js：它依赖浏览器 API）
const inkFor = (n) => (n.cluster ? PALETTE.noteInk : PALETTE.ink)

// 为每条公式生成内容哈希（latex + color + version）
function hashFormula(latex, color) {
  return createHash('sha256').update(`${CACHE_VER}|${TEX_EM}|${color}|${latex}`).digest('hex').slice(0, 16)
}

const t0 = Date.now()
const graph = buildGraph()

// 尝试加载旧缓存用于增量构建
let oldCache = new Map()
const oldFile = fileURLToPath(new URL('./' + CACHE_FILE, import.meta.url))
if (existsSync(oldFile)) {
  try {
    const old = JSON.parse(readFileSync(oldFile, 'utf8'))
    if (old.v === CACHE_VER && old.em === TEX_EM && Array.isArray(old.entries)) {
      for (const e of old.entries) {
        if (Array.isArray(e) && e.length >= 7) {
          const [id, latex, color, svg, w, h, hash] = e
          oldCache.set(id, { latex, color, svg, w, h, hash })
        }
      }
      console.log(`增量构建：加载旧缓存 ${oldCache.size} 条`)
    }
  } catch { /* 旧缓存损坏，全量重建 */ }
}

const dict = [], index = new Map(), entries = []
let fails = 0, reused = 0, rebuilt = 0
for (const n of graph.nodes) {
  if (n.researcher) continue
  const color = inkFor(n)
  const hash = hashFormula(n.latex, color)

  // 检查旧缓存：哈希一致则复用
  const old = oldCache.get(n.id)
  if (old && old.hash === hash) {
    entries.push([n.id, n.latex, color, old.svg, old.w, old.h, hash])
    reused++
    continue
  }

  // 重新排版
  try {
    const r = texSync(n.latex, color)
    const encoded = encodePaths(r.svg, dict, index)
    entries.push([n.id, n.latex, color, encoded, +r.widthPx.toFixed(3), +r.heightPx.toFixed(3), hash])
    rebuilt++
  } catch { fails++ }   // 排不出来的留给运行时（它会走 \text{名称} 兜底）
}

const out = { v: CACHE_VER, em: TEX_EM, dict, entries }
const jsonStr = JSON.stringify(out)
const jsonSize = jsonStr.length

// 写入未压缩版本（开发时便于检查）
writeFileSync(oldFile, jsonStr)

// 写入 gzip 压缩版本（生产使用）
const compressed = gzipSync(jsonStr)
const gzFile = fileURLToPath(new URL('./' + CACHE_FILE_GZ, import.meta.url))
writeFileSync(gzFile, compressed)

console.log(`${CACHE_FILE}: ${entries.length} 条，${fails} 条失败，字典 ${dict.length} 条路径`)
console.log(`  增量构建：${reused} 条复用，${rebuilt} 条重建`)
console.log(`  原始大小：${(jsonSize / 1e6).toFixed(2)} MB`)
console.log(`  压缩大小：${(compressed.length / 1e6).toFixed(2)} MB（压缩率 ${(100 * (1 - compressed.length / jsonSize)).toFixed(1)}%）`)
console.log(`  构建时间：${Date.now() - t0} ms`)
