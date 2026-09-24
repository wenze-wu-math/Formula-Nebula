/**
 * 把维基「List of unsolved problems in mathematics」里
 * "Problems solved since 2015" 一节抽出来，与本项目的 58 条未解决猜想对表。
 *
 * 为什么先看这一页：它是维基上唯一一处**按时间汇总"哪些猜想被解决了"**
 * 的地方，一次就能筛出候选，比逐条查 59 个条目省得多。
 * 而且它顺带给出了解决者与年份，便于二次核对。
 *
 * 注意：抓下来的正文是整页，包含大量无关列表，所以单独存成一个文件，
 * 不直接灌进上下文。
 */
import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const ROOT = path.resolve(import.meta.dirname, '..')
const raw = JSON.parse(readFileSync(path.join(ROOT, '.research/raw.json'), 'utf8'))
const mod = await import(pathToFileURL(path.join(ROOT, 'src/data/conjectures.js')).href)
const nodes = mod.CONJECTURE_NODES

/* 找那一页（它是在抓 cn-hartshorne-ample 时被搜出来的） */
let page = null
for (const v of Object.values(raw)) {
  if (/^List of unsolved problems in mathematics$/.test(v.resolved || '')) { page = v.text; break }
}
if (!page) { console.error('没抓到该页'); process.exit(1) }

const i = page.indexOf('Problems solved since 2015')
const j = page.indexOf('See also', i)
const seg = page.slice(i, j > i ? j : i + 40000)
writeFileSync(path.join(ROOT, '.research/solved-since-2015.txt'), seg, 'utf8')
console.log(`抽出 ${seg.length} 字符 → .research/solved-since-2015.txt\n`)

/* 与我们的节点名做交叉：拿每条猜想的中英文关键词去这一节里找 */
const NAMES = nodes.map((n) => ({ id: n.id, status: n.status, name: n.name, en: n.en }))
const hits = []
const low = seg.toLowerCase()
for (const n of NAMES) {
  const keys = []
  if (n.en) {
    // 英文名去掉 conjecture/hypothesis/theorem 之类的后缀做主干
    const k = n.en.replace(/\s*(conjecture|hypothesis|problem|theorem)s?\s*$/i, '').trim()
    if (k.length >= 4) keys.push(k)
  }
  const found = keys.filter((k) => low.includes(k.toLowerCase()))
  if (found.length) hits.push({ ...n, key: found[0] })
}
console.log(`名字出现在"2015 年以来已解决"一节的猜想（${hits.length} 条）：\n`)
for (const h of hits) console.log(`  [${h.status.padEnd(9)}] ${h.id.padEnd(24)} ${h.name}   ← 匹配 "${h.key}"`)
if (!hits.length) console.log('  （无）—— 说明这一节里没有直接点名我们的猜想，需要逐条核')
