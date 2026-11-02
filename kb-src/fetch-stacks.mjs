/**
 * kb-src/fetch-stacks.mjs — 从 Stacks Project 官方 GitHub 仓库拉取 LaTeX 源。
 *
 * 为什么走 GitHub 而不是抓网页：
 *   · 网页是 MathJax 渲染后的 HTML，抽取要处理大量标记；
 *   · 仓库里的 .tex 是**唯一真源**，每个结果都带 \label{...}，
 *     与 tags/tags 索引里的 4 字符稳定标签一一对应；
 *   · 一次拉全，可离线反复解析，结果可复现（不受站点改版影响）。
 *
 * 用法：
 *   node kb-src/fetch-stacks.mjs            # 拉取默认章节集
 *   node kb-src/fetch-stacks.mjs --all      # 拉取全部 .tex
 *   node kb-src/fetch-stacks.mjs --list     # 只列出可用文件
 */
import { writeFileSync, mkdirSync, existsSync, statSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const BASE = 'https://raw.githubusercontent.com/stacks/stacks-project/master'
/* 用 fileURLToPath：new URL().pathname 在含空格的路径上会保留 %20，写盘会建出错误目录 */
const OUT = join(dirname(fileURLToPath(import.meta.url)), 'raw')
const UA = { 'User-Agent': 'kb-collector (formula-nebula knowledge base)' }

/* 优先章节：与知识库的 8 个族直接对应，先覆盖核心，再扩边 */
const CORE = [
  'sets', 'categories', 'algebra', 'more-algebra', 'fields', 'modules',
  'schemes', 'sheaves', 'sites', 'sites-modules', 'sites-cohomology',
  'cohomology', 'more-morphisms', 'morphisms', 'properties', 'constructions',
  'varieties', 'curves', 'divisors', 'intersection', 'chow',
  'derived', 'simplicial', 'homology', 'injectives', 'duality', 'dualizing',
  'etale', 'etale-cohomology', 'flat', 'descent', 'perfect',
  'stacks', 'stacks-morphisms', 'stacks-properties', 'stacks-sheaves',
  'spaces', 'spaces-morphisms', 'spaces-properties', 'spaces-cohomology',
  'formal-spaces', 'cotangent', 'deformation', 'defos',
  'moduli', 'moduli-curves', 'pic', 'groupoids', 'quot',
  'brauer', 'weil', 'crystalline', 'de-rham', 'derham', 'dga',
]

const args = process.argv.slice(2)
const wantAll = args.includes('--all')
const listOnly = args.includes('--list')

async function getText(url) {
  const r = await fetch(url, { headers: UA })
  if (!r.ok) throw new Error(`HTTP ${r.status} for ${url}`)
  return await r.text()
}

/* 1. 先拿文件清单 */
const listing = JSON.parse(await getText('https://api.github.com/repos/stacks/stacks-project/contents/'))
const texFiles = listing.filter((e) => e.type === 'file' && e.name.endsWith('.tex')).map((e) => e.name)
console.log(`仓库中共 ${texFiles.length} 个 .tex`)

if (listOnly) {
  console.log(texFiles.join('\n'))
  process.exit(0)
}

const targets = wantAll ? texFiles : CORE.map((n) => `${n}.tex`).filter((n) => texFiles.includes(n))
const missing = wantAll ? [] : CORE.filter((n) => !texFiles.includes(`${n}.tex`))
if (missing.length) console.log(`⚠ 未找到: ${missing.join(', ')}`)

mkdirSync(OUT, { recursive: true })
console.log(`准备拉取 ${targets.length} 个文件 → ${OUT}`)

let done = 0, bytes = 0, failed = []
for (const name of targets) {
  const dest = join(OUT, name)
  /* 已存在且非空则跳过（可增量重跑） */
  if (existsSync(dest) && statSync(dest).size > 0) { done++; continue }
  try {
    const text = await getText(`${BASE}/${name}`)
    mkdirSync(dirname(dest), { recursive: true })
    writeFileSync(dest, text, 'utf8')
    bytes += Buffer.byteLength(text)
    done++
    if (done % 10 === 0) console.log(`  ${done}/${targets.length} ...`)
  } catch (e) {
    failed.push(`${name}: ${e.message}`)
  }
}

console.log(`\n完成 ${done}/${targets.length}，新增 ${(bytes / 1048576).toFixed(1)} MB`)
if (failed.length) console.log(`失败 ${failed.length}:\n  ` + failed.join('\n  '))
