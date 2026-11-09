/**
 * 把 src/data/*.js 里的知识数据导出成 JSON，供运行时按需 fetch。
 *
 * 为什么需要这一步
 * ----------------
 * 数据现在是 ES 模块（`export const EXTRA_A_NODES = [...]`）。`graph.js`
 * 静态 import 它们，于是约 6 MB 数据被并进主 chunk：任何访客为了看到第一帧，
 * 都要先下载并解析整个数据库（实测主包 9.3 MB，数据占 82%）。
 *
 * 改成 JSON + fetch 之后：
 *   · 数据不再进入主包，Vite 把它们作为独立静态资源发出；
 *   · 浏览器可以并行下载，并按自己的节奏缓存；
 *   · `buildGraph()` 仍是**同步**函数 —— 它只是改成从调用方传入的数据源
 *     构建（`buildGraph({nodes, links})`），20 多个既有调用点一个都不用改。
 *
 * 本脚本是**生成器**：源 .js 文件保持原样（它们仍是唯一事实来源），
 * 输出到 public/data/。这样 check-data、单测、构建期工具全部不受影响。
 *
 * 用法：
 *   node scripts/build-data-json.mjs          # 生成
 *   node scripts/build-data-json.mjs --check  # 只校验是否最新（CI 用）
 */

import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const ROOT = path.resolve(import.meta.dirname, '..')
const OUT_DIR = path.join(ROOT, 'public', 'data')
const CHECK_ONLY = process.argv.includes('--check')

/** 每个输出文件由哪些源模块的哪些导出组成。 */
const GROUPS = [
  {
    file: 'core.json',
    note: '手写核心：405 定理 + 59 猜想 + 研究者（首屏需要）',
    modules: [
      ['knowledge.js', ['NODES', 'LINKS']],
      ['conjectures.js', ['CONJECTURE_NODES', 'CONJECTURE_LINKS']],
      ['researchers.js', ['RESEARCHER_NODES', 'RESEARCHER_LINKS']],
    ],
  },
  {
    file: 'extra.json',
    note: '自动组装的 8 个批次（外围定理）',
    modules: [
      ['extra-a.js', ['EXTRA_A_NODES', 'EXTRA_A_LINKS']],
      ['extra-b.js', ['EXTRA_B_NODES', 'EXTRA_B_LINKS']],
      ['extra-c.js', ['EXTRA_C_NODES', 'EXTRA_C_LINKS']],
      ['extra-d.js', ['EXTRA_D_NODES', 'EXTRA_D_LINKS']],
      ['extra-e.js', ['EXTRA_E_NODES', 'EXTRA_E_LINKS']],
      ['extra-f.js', ['EXTRA_F_NODES', 'EXTRA_F_LINKS']],
      ['extra-g.js', ['EXTRA_G_NODES', 'EXTRA_G_LINKS']],
      ['extra-h.js', ['EXTRA_H_NODES', 'EXTRA_H_LINKS']],
    ],
  },
  {
    file: 'stacks.json',
    note: 'Stacks Project 批次',
    modules: [['stacks-extra.js', ['STACKS_NODES', 'STACKS_LINKS']]],
  },
  {
    file: 'nlab.json',
    note: 'nLab 批次',
    modules: [['nlab-extra.js', ['NLAB_NODES', 'NLAB_LINKS']]],
  },
  {
    file: 'mathlib.json',
    note: 'Mathlib 形式化批次',
    modules: [['mathlib-extra.js', ['MATHLIB_NODES', 'MATHLIB_LINKS']]],
  },
  {
    file: 'unsolved.json',
    note: 'UnsolvedMath 猜想批次',
    modules: [['unsolved-extra.js', ['UNSOLVED_NODES', 'UNSOLVED_LINKS']]],
  },
  {
    file: 'wikipedia.json',
    note: 'Wikipedia 猜想批次',
    modules: [['wikipedia-extra.js', ['WIKI_NODES', 'WIKI_LINKS']]],
  },
  {
    file: 'researchers.json',
    note: '研究者补充批次',
    modules: [
      ['researchers-extra.js', ['RESEARCHER_EXTRA_NODES']],
      ['researchers-extra-links.js', ['RESEARCHER_EXTRA_LINKS']],
    ],
  },
  {
    file: 'crosslinks.json',
    note: '跨源关联',
    modules: [['cross-source-links.js', ['CROSS_SOURCE_LINKS']]],
  },
]

const dataDir = path.join(ROOT, 'src', 'data')

async function buildGroup(group) {
  const nodes = []
  const links = []
  for (const [modFile, exportNames] of group.modules) {
    const url = pathToFileURL(path.join(dataDir, modFile)).href
    let mod
    try {
      mod = await import(url)
    } catch (e) {
      throw new Error(`导入 ${modFile} 失败：${e.message}`)
    }
    for (const name of exportNames) {
      const val = mod[name]
      if (!Array.isArray(val)) {
        if (val !== undefined) throw new Error(`${modFile} 的 ${name} 不是数组`)
        continue
      }
      // 约定：名字里含 LINKS 的是连线，其余是节点
      if (/LINKS?$/.test(name) || name === 'CROSS_SOURCE_LINKS') {
        links.push(...val)
      } else {
        // ── 给节点打上结构标记 ──
        //
        // graph.js 靠这两个标记把节点分到三个结构里（主星系 / 猜想星团 /
        // 研究者星团）。原始数据里**没有**这些字段 —— 过去是靠 graph.js
        // 静态 import 全部数据后建 CONJECTURE_IDS / RESEARCHER_IDS 两个
        // Set 来判定的。数据搬到 JSON 之后不再有那个全集，所以改为在生成
        // 阶段就把结论写进节点：谁来自猜想数组、谁来自研究者数组，一眼可见。
        //
        // 判定依据是「这个名字来自哪个导出」，比按字段猜（比如"有 status
        // 字段就是猜想"）可靠得多 —— 字段是数据的一部分，会变；导出名是
        // 本文件的契约，改它就得改这里。
        const isConjecture = /CONJECTURE_NODES|UNSOLVED_NODES|WIKI_NODES/.test(name)
        const isResearcher = /RESEARCHER/.test(name)
        if (isConjecture) nodes.push(...val.map((n) => ({ ...n, cluster: true })))
        else if (isResearcher) nodes.push(...val.map((n) => ({ ...n, researcher: true })))
        else nodes.push(...val)
      }
    }
  }
  return { nodes, links }
}

if (!CHECK_ONLY) fs.mkdirSync(OUT_DIR, { recursive: true })

let mismatches = 0
const summary = []

for (const g of GROUPS) {
  const data = await buildGroup(g)
  const payload = {
    _note: g.note,
    nodeCount: data.nodes.length,
    linkCount: data.links.length,
    nodes: data.nodes,
    links: data.links,
  }
  const json = JSON.stringify(payload)
  const outPath = path.join(OUT_DIR, g.file)

  if (CHECK_ONLY) {
    const existing = fs.existsSync(outPath) ? fs.readFileSync(outPath, 'utf8') : null
    if (existing !== json) {
      mismatches++
      console.log(`  ✗ ${g.file} 与源数据不一致（需运行 node scripts/build-data-json.mjs）`)
    } else {
      console.log(`  ✓ ${g.file}`)
    }
  } else {
    fs.writeFileSync(outPath, json, 'utf8')
    summary.push([g.file, data.nodes.length, data.links.length, json.length])
  }
}

if (CHECK_ONLY) {
  if (mismatches) {
    console.log(`\n✗ ${mismatches} 个文件过期`)
    process.exit(1)
  }
  console.log('\n✓ 全部数据 JSON 与源同步')
  process.exit(0)
}

console.log('\n═══ 已生成 public/data/ ═══')
let totalNodes = 0
let totalLinks = 0
let totalBytes = 0
for (const [f, n, l, b] of summary) {
  totalNodes += n
  totalLinks += l
  totalBytes += b
  console.log(`  ${f.padEnd(18)} ${String(n).padStart(5)} 节点  ${String(l).padStart(5)} 连线  ${(b / 1024).toFixed(0)} KB`)
}
console.log(`  ${'合计'.padEnd(16)} ${String(totalNodes).padStart(5)} 节点  ${String(totalLinks).padStart(5)} 连线  ${(totalBytes / 1024 / 1024).toFixed(2)} MB`)
