/**
 * kb-src/fetch-nlab.mjs — 从 nLab 抓取概念条目。
 *
 * ═══ nLab 与 Stacks 的根本区别（决定了采集方式）═══
 *
 * Stacks：规整 LaTeX，每个结果是 `\begin{theorem}...\end{theorem}` + 稳定 tag。
 *         → 可以精确抽取"定理"，有官方 URL 可复核。
 *
 * nLab：wiki 散文，一个页面 = 一个**概念**的解释（"scheme is a space that…"），
 *       没有定理编号、没有稳定 tag。
 *       → 只能抽"概念条目"，不是"定理"。
 *
 * 所以本脚本产出的是**概念节点**，与 Stacks 的定理节点互补：
 * nLab 补的是"这个术语是什么意思"，Stacks 补的是"这个结论成立吗"。
 *
 * 可抽取的结构（实测）：
 *   · 标题（概念名）           <title>xxx in nLab</title>
 *   · 首段定义                 id="Content" 里第一个 <p>
 *   · 公式                     $...$（iTeX/MathJax 语法）
 *   · 语义块                   div.num_defn / num_remark / property
 *   · 出链                     概念间关系（比 Stacks 的 \ref 更宽泛）
 *
 * 用法：
 *   node kb-src/fetch-nlab.mjs --limit 200
 *   node kb-src/fetch-nlab.mjs --pages scheme,sheaf,topos
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const OUT = join(HERE, 'out')
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'

const argv = process.argv.slice(2)
const li = argv.indexOf('--limit')
const limit = li >= 0 ? Number(argv[li + 1]) : 200
const pi = argv.indexOf('--pages')
const explicitPages = pi >= 0 ? argv[pi + 1].split(';').map((s) => s.trim()) : null

/* ── 1. 从 all_pages 索引里挑「与代数几何相关」的页面 ──
 * 索引有 20,780 页，不能全抓（对服务器不礼貌，也没必要）。
 * 用关键词筛出代数几何/范畴论相关的，再按优先级排序。 */
const AG_STRONG = /^(scheme|sheaf|coherent|quasi-coherent|etale|fppf|fpqc|zariski|affine|projective|morphism|stack|moduli|derived|spectral|topos|site|descent|galois|picard|divisor|blow-up|resolution|cohomology|chow|hodge|tannakian|monad|adjunction|limit|colimit|category|functor|natural\+transformation|yoneda|kan\+extension|operad|infinity|∞)/i
const AG_WEAK = /(algebraic|geometry|scheme|sheaf|topos|cohomolog|category|functor|morphism|stack|moduli|derived)/i

function loadIndex() {
  const p = join(HERE, 'nlab', 'all_pages.html')
  if (!existsSync(p)) throw new Error('缺少 nlab/all_pages.html，先运行下载步骤')
  const s = readFileSync(p, 'utf8')
  const links = [...s.matchAll(/href="\/nlab\/show\/([^"#?]+)"/g)].map((m) => decodeURIComponent(m[1]))
  return [...new Set(links)]
}

/* ── 2. 抓单页并抽取 ── */
function stripTags(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/g, ' ')
    .replace(/<style[\s\S]*?<\/style>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

async function fetchPage(name) {
  const url = `https://ncatlab.org/nlab/show/${encodeURIComponent(name).replace(/%20/g, '+')}`
  const r = await fetch(url, { headers: { 'User-Agent': UA } })
  if (!r.ok) return { _fail: `HTTP ${r.status}`, name }
  const html = await r.text()

  /* 标题 */
  const tm = /<title>([\s\S]*?)<\/title>/.exec(html)
  const title = tm ? tm[1].replace(/\s+/g, ' ').trim().replace(/\s+in nLab\s*$/i, '') : name

  /* 正文容器：id="Content" */
  const ci = html.indexOf('id="Content"')
  if (ci < 0) return { _fail: 'no Content div', name }
  /* 取到页脚为止 */
  let body = html.slice(ci)
  /* ⚠ 不能用 id="revision"：它在 <p> 正文**之前**，会把 body 截断成 100 多字符。
  *    只用真正的页脚标记。 */
  const endMarkers = ['class="revisedby"', 'class="navigation navfoot"']
  let end = body.length
  for (const mk of endMarkers) {
    const k = body.indexOf(mk)
    if (k > 0 && k < end) end = k
  }
  body = body.slice(0, end)

  /* 首段定义：nLab 页面开头有「相关概念」导航块（实测 coherent sheaf 页
   * 前 8 个 <p> 全是 "topos theory" "category theory" 这类单链接）。
   *
   * 真正的定义段特征：
   *   · 含句末标点（. ! ?）
   *   · 词数 ≥ 12
   *   · 不是「逗号分隔的概念列表」
   * 按这个判据找第一个合格段落。 */
  let lead = ''
  const paras = [...body.matchAll(/<p>([\s\S]*?)<\/p>/g)]
  for (const pm of paras) {
    const txt = stripTags(pm[1])
    const words = txt.split(/\s+/).filter(Boolean).length
    const hasStop = /[.!?](\s|$)/.test(txt)
    const commaHeavy = (txt.match(/,/g) || []).length >= 2 && !hasStop
    if (words >= 12 && hasStop && !commaHeavy) { lead = txt; break }
  }
  /* 退一步：词数够就算 */
  if (!lead) {
    for (const pm of paras) {
      const txt = stripTags(pm[1])
      if (txt.split(/\s+/).filter(Boolean).length >= 12) { lead = txt; break }
    }
  }

  /* 公式：nLab 用 MathML 渲染，LaTeX 源码在 <annotation encoding="application/x-tex"> 里。
   * ⚠ 不要从纯文本里找 $...$ —— 实测页面上 $ 几乎都被渲染掉了（只剩 1 个）。 */
  const texAnnotations = [...body.matchAll(/<annotation[^>]*encoding="application\/x-tex"[^>]*>([\s\S]*?)<\/annotation>/g)]
    .map((m) => m[1]
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .trim())
  /* 显示公式：maruku-equation 块里的 */
  const displayBlocks = [...body.matchAll(/<div class="maruku-equation">([\s\S]*?)<\/div>/g)]
  const displayTex = displayBlocks
    .map((blk) => {
      const a = /<annotation[^>]*encoding="application\/x-tex"[^>]*>([\s\S]*?)<\/annotation>/.exec(blk[1])
      return a ? a[1].replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').trim() : ''
    })
    .filter(Boolean)
  const inline = texAnnotations.filter((t) => t.length >= 3)
  const display = displayTex
  const plain = stripTags(body)

  /* 语义块计数 */
  const defns = (body.match(/class="num_defn"/g) || []).length
  const remarks = (body.match(/class="num_remark"/g) || []).length
  const props = (body.match(/class="property"/g) || []).length

  /* 出链（概念关系） */
  const outs = [...html.matchAll(/href="\/nlab\/show\/([^"#?]+)"/g)].map((m) => decodeURIComponent(m[1]))
  const outUniq = [...new Set(outs)].filter((x) => x !== name)

  return {
    name,
    url,
    title,
    lead,
    plainLen: plain.length,
    inlineFormulas: inline.slice(0, 12),
    displayFormulas: display.slice(0, 6),
    counts: { defns, remarks, props },
    outLinks: outUniq,
  }
}

/* ── 3. 主流程 ── */
mkdirSync(OUT, { recursive: true })
const dest = join(OUT, 'nlab-pages.json')
const store = existsSync(dest) ? JSON.parse(readFileSync(dest, 'utf8')) : {}

let candidates
if (explicitPages) {
  candidates = explicitPages
} else {
  const all = loadIndex()
  const strong = all.filter((p) => AG_STRONG.test(p))
  const weak = all.filter((p) => !AG_STRONG.test(p) && AG_WEAK.test(p))
  candidates = [...strong, ...weak]
  console.log(`索引 ${all.length} 页 → 强相关 ${strong.length}，弱相关 ${weak.length}`)
}

const todo = candidates.slice(0, limit).filter((p) => !store[p]?.title)
console.log(`待抓 ${todo.length} 页`)

let ok = 0, fail = 0
for (const name of todo) {
  try {
    const rec = await fetchPage(name)
    store[name] = rec
    if (rec._fail) { fail++; console.log(`  ✗ ${name} → ${rec._fail}`) }
    else {
      ok++
      if (ok % 25 === 0) console.log(`  ${ok}/${todo.length} …`)
    }
  } catch (e) {
    fail++
    store[name] = { _fail: e.message, name }
  }
  /* 对 nLab 友好一点：每页间隔 120ms */
  await new Promise((r) => setTimeout(r, 120))
}

writeFileSync(dest, JSON.stringify(store, null, 1), 'utf8')
const good = Object.values(store).filter((x) => !x._fail)
console.log(`\n完成：成功 ${ok}，失败 ${fail}，累计有效 ${good.length} 页 → ${dest}`)
console.log('样本：')
for (const x of good.slice(0, 3)) {
  console.log(`  ${x.title}`)
  console.log(`    lead: ${x.lead.slice(0, 100)}`)
  console.log(`    公式 ${x.inlineFormulas.length}，出链 ${x.outLinks.length}`)
}
