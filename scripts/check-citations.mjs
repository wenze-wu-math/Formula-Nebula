/**
 * 取关键条目的**维基源码**，把惊人说法附近的 <ref> 引用挖出来。
 *
 * ── 为什么换成查引用，而不是查其他语种 ──
 * 上一版想用"其他语种维基是否也写了这件事"来判断是否被破坏，但那个测试
 * **本身是坏的**：我把英文标题（"Riemann hypothesis"）直接丢给 de/zh/fr/ja
 * 维基，当然全部"无此条目" —— 连黎曼猜想那种必然存在的条目都报没有。
 * 同样的，5 条 arXiv 检索全部返回 0 条（连 au:Zahl 都是 0），说明
 * 那个检索式也没生效。**两个"阴性结果"都是工具坏了，不是证据。**
 *
 * 真正有判别力的是**引用**：一个 2026 年的惊人结果，如果为真，
 * 维基条目里必然带 <ref>（arXiv 编号 / 期刊 / DOI）；如果是破坏，
 * 通常只有一句光秃秃的断言。所以：
 *   ① 抓条目源码
 *   ② 找出含关键词的句子，连同**紧邻的 ref 标签**一起打印
 *   ③ 把 ref 里的 arXiv 编号抽出来，逐个去 arXiv 验证**是否真实存在**
 * 第 ③ 步是独立信源 —— arXiv 的编号是外部可核对的硬事实。
 */
import { writeFileSync, mkdirSync } from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

if (!process.env.HTTPS_PROXY && !process.env.https_proxy) {
  console.error('需要代理：HTTPS_PROXY=http://127.0.0.1:7890  NODE_USE_ENV_PROXY=1')
  process.exit(1)
}
const ROOT = path.resolve(import.meta.dirname, '..')
const OUT = path.join(ROOT, '.research')
mkdirSync(OUT, { recursive: true })
const UA = { 'User-Agent': 'formula-nebula-research/1.0 (local; citation audit)' }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function get(u, tries = 5) {
  let wait = 2500
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(u, { headers: UA })
      if (r.status === 429) { await sleep(wait); wait *= 1.9; continue }
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      return await r.text()
    } catch (e) {
      if (i === tries - 1) throw e
      await sleep(wait); wait *= 1.9
    }
  }
  throw new Error('重试耗尽')
}

const wikitext = async (title) => {
  const u = `https://en.wikipedia.org/w/api.php?action=parse&prop=wikitext&redirects=1&format=json&page=${encodeURIComponent(title)}`
  const j = JSON.parse(await get(u))
  return j.parse?.wikitext?.['*'] || ''
}

const PAGES = [
  ['cn-jacobian', 'Jacobian conjecture', /Alpöge|Alpoge|counterexample|disprov/i],
  ['cn-navier-stokes', 'Navier–Stokes existence and smoothness', /OpenAI|singularit|2026/i],
  ['cn-riemann', 'Riemann hypothesis', /two-thirds|Claude|Anthropic|66\.6|2026/i],
  ['cn-kakeya', 'Kakeya set', /Wang|Zahl|Fields Medal/i],
  ['cn-collatz', 'Collatz conjecture', /Lean|Nanoda|disproof|2026/i],
]

const summary = []
const allArxiv = new Set()

for (const [id, title, key] of PAGES) {
  console.log(`\n${'='.repeat(78)}\n### ${id}  ← ${title}\n${'='.repeat(78)}`)
  let wt = ''
  try { wt = await wikitext(title) } catch (e) { console.log('  抓取失败: ' + e.message); continue }
  writeFileSync(path.join(OUT, `wikitext-${id}.txt`), wt, 'utf8')

  /* 按段落切，保留每段末尾的 ref */
  const paras = wt.split(/\n\n+/)
  let shown = 0
  for (const p of paras) {
    if (!key.test(p)) continue
    const txt = p.replace(/\s+/g, ' ').trim()
    console.log(`\n  ── 段落（${txt.length} 字符）──`)
    console.log('  ' + (txt.length > 1100 ? txt.slice(0, 1100) + ' …' : txt))
    for (const m of p.matchAll(/arxiv\s*=\s*([0-9]{4}\.[0-9]{4,5})/gi)) allArxiv.add(m[1])
    for (const m of p.matchAll(/arXiv:([0-9]{4}\.[0-9]{4,5})/gi)) allArxiv.add(m[1])
    if (++shown >= 3) break
  }
  if (!shown) console.log('  （没有段落命中关键词）')
  await sleep(1800)
}

/* ── 独立信源：这些 arXiv 编号真的存在吗 ── */
console.log(`\n\n${'='.repeat(78)}\n### arXiv 编号真实性核对（独立信源）\n${'='.repeat(78)}`)
if (!allArxiv.size) console.log('条目里没有抽到 arXiv 编号')
for (const aid of [...allArxiv].sort()) {
  try {
    const xml = await get(`http://export.arxiv.org/api/query?id_list=${aid}&max_results=1`)
    const t = ((xml.match(/<entry>[\s\S]*?<title>([\s\S]*?)<\/title>/) || [])[1] || '').replace(/\s+/g, ' ').trim()
    const d = ((xml.match(/<published>([\s\S]*?)<\/published>/) || [])[1] || '').slice(0, 10)
    const au = [...xml.matchAll(/<name>([\s\S]*?)<\/name>/g)].map((x) => x[1].trim()).slice(0, 3).join(', ')
    if (t) { console.log(`  ✓ ${aid}  ${d}  ${t.slice(0, 95)}  (${au})`); summary.push({ aid, ok: true, t, d, au }) }
    else { console.log(`  ✗ ${aid}  arXiv 查无此文`); summary.push({ aid, ok: false }) }
  } catch (e) { console.log(`  ? ${aid}  查询失败 ${e.message}`); summary.push({ aid, ok: null }) }
  await sleep(3200)
}
writeFileSync(path.join(OUT, 'citations.json'), JSON.stringify(summary, null, 1), 'utf8')
console.log('\n→ .research/citations.json')
