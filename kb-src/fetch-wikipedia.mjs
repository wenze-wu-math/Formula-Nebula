/**
 * kb-src/fetch-wikipedia.mjs — 从 Wikipedia「未解决数学问题列表」采集猜想。
 *
 * ═══ 为什么选这条路（用户推荐 Wikipedia 作为"广度兜底源"）═══
 *
 * Wikipedia 的列表页 wikitext 是**结构化的**，每条形如：
 *   * [[Abundance conjecture]]: if the [[canonical bundle]] of a
 *     [[projective variety]] ... is [[Nef line bundle|nef]], then it is semiample.
 *
 * 也就是说：**猜想名 + 链接 + 一句话陈述 + 内嵌 <math> 公式**，一次拿全。
 * 这比 UnsolvedMath 里翻字段省事，且能覆盖它没有的条目
 * （例如 Abundance、Fujita、Dixmier 这些）。
 *
 * ═══ 与 UnsolvedMath 的分工 ═══
 *   UnsolvedMath: 有难度分级/分类/来源集，适合做主线
 *   Wikipedia:    有更完整的"别名 + 一句话陈述"，适合补漏
 *
 * 用法：
 *   node kb-src/fetch-wikipedia.mjs
 */
import { writeFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const OUT = join(HERE, 'out')
const UA = 'FormulaNebula/1.0 (knowledge base builder; local research)'

async function api(params) {
  const url = `https://en.wikipedia.org/w/api.php?${new URLSearchParams({ ...params, format: 'json', formatversion: '2' })}`
  for (const useProxy of [false, true]) {
    try {
      const r = await fetch(url, { headers: { 'User-Agent': UA } })
      if (r.ok) return await r.json()
      if (r.status === 404) return null
    } catch { /* 落下去试代理 —— 但 fetch 不支持代理，这里只重试一次 */ }
  }
  return null
}

/* 我们关心的数学领域章节（与现有 8 个知识族对应） */
const SECTION_MAP = {
  'Algebraic geometry': { field: 'ag', family: 'scheme' },
  'Algebra': { field: 'algebra', family: 'foundation' },
  'Number theory': { field: 'arith', family: 'foundation' },
  'Topology': { field: 'topo', family: 'cohomology' },
  'Geometry': { field: 'topo', family: 'curve' },
  'Combinatorics': { field: 'algebra', family: 'foundation' },
  'Group theory': { field: 'algebra', family: 'foundation' },
  'Analysis': { field: 'analysis', family: 'foundation' },
  'Partial differential equations': { field: 'analysis', family: 'foundation' },
  'Set theory': { field: 'logic', family: 'foundation' },
  'Computational complexity theory': { field: 'logic', family: 'foundation' },
  'Logic': { field: 'logic', family: 'foundation' },
}

/* ── 1. 拿整页 wikitext ── */
const PAGE = 'List_of_unsolved_problems_in_mathematics'
const full = await api({ action: 'parse', page: PAGE, prop: 'wikitext' })
if (!full?.parse?.wikitext) {
  console.error('拉取失败')
  process.exit(1)
}
const wt = typeof full.parse.wikitext === 'string' ? full.parse.wikitext : full.parse.wikitext['*']
console.log('页面 wikitext:', wt.length, '字符')

/* ── 2. 按 `==== 章节 ====` 切块 ── */
const blocks = []
const re = /^(={2,4})\s*(.+?)\s*\1\s*$/gm
const marks = []
let m
while ((m = re.exec(wt))) {
  marks.push({ level: m[1].length, title: m[2].trim(), at: m.index, end: m.index + m[0].length })
}
for (let i = 0; i < marks.length; i++) {
  const cur = marks[i]
  const next = marks[i + 1]
  blocks.push({
    title: cur.title,
    level: cur.level,
    body: wt.slice(cur.end, next ? next.at : wt.length),
  })
}
console.log('切出章节:', blocks.length)

/* ── 3. 解析每块里的 `* [[Name]]: statement` 条目 ── */
function cleanWikitext(s) {
  let out = String(s || '')

  /* ═══ 处理顺序很关键 ═══
   * 之前的顺序是「先 {{cite}} 再 <ref>」，但 wikitext 里常见
   *   <ref>{{citation|...}}</ref>
   * —— <ref> 里包着一个模板。先剥模板时，<ref> 的开标签还在，
   *    导致 `[` `]` 判断错乱、残留 `<ref>{{citation`。
   *
   * 正确顺序：先剥最外层的容器（<ref>），再处理里面的内容。
   */

  /* 1) 先剥 <ref>...</ref>（整体，含内部任何东西） */
  out = out.replace(/<ref[^>]*>[\s\S]*?<\/ref>/gi, '')
  out = out.replace(/<ref[^>]*\/>/gi, '')
  /* 处理没闭合的 <ref>（截到行尾） */
  out = out.replace(/<ref[^>]*>[^\n]*/gi, '')

  /* 2) HTML 注释 */
  out = out.replace(/<!--[\s\S]*?-->/g, '')

  /* 3) 剥 {{...}} 模板（迭代到稳定，处理嵌套） */
  for (let i = 0; i < 8; i++) {
    const before = out
    out = out.replace(/\{\{([^{}]*)\}\}/g, (m0, inner) => {
      /* 保留 math/mvar 这类的内容 */
      const mm = /^\s*(?:math|mvar|tmath|mathcal|nowrap)\s*\|([^{}]*)$/i.exec(inner)
      return mm ? mm[1] : ''
    })
    if (out === before) break
  }

  /* 4) 链接：[[A|B]] → B，[[A]] → A */
  out = out.replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, '$2')
  out = out.replace(/\[\[([^\]]+)\]\]/g, '$1')

  /* 5) 外部链接 */
  out = out.replace(/\[https?:\/\/[^\]\s]+\s+([^\]]*)\]/gi, '$1')
  out = out.replace(/\[https?:\/\/[^\]\s]+\]/gi, '')

  /* 6) <math>...</math> → $...$ */
  const D = String.fromCharCode(36)
  out = out.replace(/<math[^>]*>([\s\S]*?)<\/math>/gi, (m0, inner) => D + inner.trim() + D)

  /* 7) 加粗斜体 */
  out = out.replace(/'{2,}/g, '')

  /* 8) 保险：残留的模板参数碎片 */
  out = out.replace(/\|\s*(?:volume|issue|pages|year|doi|isbn|url|title|journal|author|first|last|date)\s*=[^|]*/gi, '')

  /* 9) 保险：残留的 [[ ]] 与 {{ }} 括号（成对剥掉内容标记） */
  out = out.replace(/\[\[|\]\]|\{\{|\}\}/g, '')

  return out.replace(/\s+/g, ' ').trim()
}

const items = []
for (const b of blocks) {
  const meta = SECTION_MAP[b.title]
  if (!meta) continue
  /* 逐行找以 * 开头的条目 */
  for (const line of b.body.split('\n')) {
    const lm = /^\*+\s*(.+)$/.exec(line.trim())
    if (!lm) continue
    const raw = lm[1]
    /* 提取第一个 [[链接]] 作为名字 */
    const nameMatch = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/.exec(raw)
    if (!nameMatch) continue
    const name = (nameMatch[2] || nameMatch[1]).trim()
    /* 陈述 = 冒号之后的部分；无冒号则整行 */
    const afterLink = raw.slice(nameMatch.index + nameMatch[0].length)

    /* 陈述提取：
     *   情况 A：`[[Name]]: statement`  → 取冒号后
     *   情况 B：`[[Name]] statement`   → 取链接后
     *   情况 C：链接名被拆开/跨行     → 取整行去标记（残片会在这里被检出）
     */
    let statement
    const colonMatch = /^\s*:\s*(.+)$/.exec(afterLink)
    if (colonMatch) {
      statement = cleanWikitext(colonMatch[1])
    } else {
      /* 没有冒号：整行去标记后，去掉开头的链接部分 */
      const whole = cleanWikitext(raw)
      const cleanedName = cleanWikitext(nameMatch[0])
      statement = whole.startsWith(cleanedName)
        ? whole.slice(cleanedName.length).replace(/^[\s:–-]+/, '')
        : whole
    }

    /* 质量闸门：残片/过短/不以合理字符开头 → 丢弃 */
    if (!name || statement.length < 25) continue
    /* 残片特征：以小写字母开头但前文缺失（例如 "s and associated ..."） */
    if (/^[a-z]{1,2}\s/.test(statement)) continue
    /* 以标点开头且极短 */
    if (/^[)–\-—,;:]/.test(statement) && statement.length < 50) {
      /* 允许以 "–" 开头但要有实质内容；这里若后面紧跟的动词短语正常则保留 */
      if (!/[a-z]{4,}/i.test(statement.slice(2))) continue
    }

    /* 去掉陈述开头残留的右括号/逗号（说明是在词中间切开的） */
    const st = statement.replace(/^[)\],;:]+\s*/, '').trim()
    if (st.length < 25) continue
    statement = st
    /* 排除指向人物页的条目（例如 [[W. Hugh Woodin|Woodin]] → 人物传记） */
    const wikiTitleRaw = nameMatch[1]
    if (/^[A-Z]\.\s/.test(wikiTitleRaw) || /^[A-Z][a-z]+\s+[A-Z]/.test(wikiTitleRaw.replace(/_/g, ' '))) {
      /* 形如 "W. Hugh Woodin" / "Hugh Woodin" —— 人名 */
      if (!/conjecture|problem|theorem|hypothesis/i.test(wikiTitleRaw)) continue
    }

    items.push({
      name,
      wikiTitle: nameMatch[1],
      url: `https://en.wikipedia.org/wiki/${encodeURIComponent(nameMatch[1].replace(/ /g, '_'))}`,
      statement,
      section: b.title,
      field: meta.field,
      family: meta.family,
      raw,
    })
  }
}

console.log(`解析出条目: ${items.length}`)
const bySec = {}
for (const it of items) bySec[it.section] = (bySec[it.section] || 0) + 1
console.log('按章节:', JSON.stringify(bySec))

/* 有 <math> 公式的 */
const withMath = items.filter((x) => /\$[^$]+\$/.test(x.statement))
console.log(`陈述含公式: ${withMath.length} / ${items.length} = ${(100 * withMath.length / items.length).toFixed(0)}%`)

mkdirSync(OUT, { recursive: true })
const dest = join(OUT, 'wikipedia-conjectures.json')
writeFileSync(dest, JSON.stringify(items, null, 1), 'utf8')
console.log(`\n写入 ${dest}（${(Buffer.byteLength(JSON.stringify(items)) / 1024).toFixed(1)} KB）`)

console.log('\n=== 样本 ===')
items.slice(0, 5).forEach((x) => {
  console.log(`【${x.name}】(${x.section})`)
  console.log(`  ${x.statement.slice(0, 120)}`)
})
