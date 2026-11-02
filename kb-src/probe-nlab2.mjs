/**
 * kb-src/probe-nlab2.mjs — 判断 nLab 页面能抽取到什么结构（临时探针）。
 *
 * nLab 与 Stacks 的根本区别：
 *   · Stacks 是规整 LaTeX，每个结果有 \begin{theorem}...\end{theorem}
 *   · nLab 是 wiki 散文，页面是"一个概念的解释"，没有定理编号
 *
 * 所以要确认：能否稳定抽取
 *   1. 页面标题（概念名）
 *   2. 一句话定义/摘要（第一段）
 *   3. LaTeX 公式（iTeX 语法）
 *   4. 出链（概念间关系）
 */

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'

async function get(url) {
  const r = await fetch(url, { headers: { 'User-Agent': UA } })
  return { status: r.status, text: await r.text() }
}

const SAMPLES = ['scheme', 'coherent+sheaf', 'derived+algebraic+geometry', 'monad', 'infinity-topos']

for (const name of SAMPLES) {
  const url = `https://ncatlab.org/nlab/show/${name}`
  const { status, text } = await get(url)
  console.log(`\n════ ${name} (HTTP ${status}, ${text.length} 字节) ════`)

  /* 标题 */
  const t = /<title>([\s\S]*?)<\/title>/.exec(text)
  console.log('title:', t ? t[1].replace(/\s+/g, ' ').trim() : '(无)')

  /* 正文：nLab 用 <div class="markdown"> 或 id="content" */
  let body = null
  let m = /<div[^>]*class="[^"]*markdown[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<div[^>]*class="[^"]*page[dD]iscussion/.exec(text)
  if (!m) m = /<div[^>]*id="content"[^>]*>([\s\S]*?)<\/div>\s*<div[^>]*class="[^"]*(?:footer|pageinfo)/.exec(text)
  if (!m) m = /<div[^>]*id="content"[^>]*>([\s\S]{100,20000})/.exec(text)
  if (m) body = m[1]
  if (!body) { console.log('  ✗ 未找到正文容器'); continue }

  /* 去标签取纯文本 */
  const plain = body
    .replace(/<script[\s\S]*?<\/script>/g, ' ')
    .replace(/<style[\s\S]*?<\/style>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim()

  console.log('正文长度:', plain.length)
  console.log('开头 220 字:', plain.slice(0, 220))

  /* LaTeX 公式：nLab 用 $...$ / \[...\] / iTeX */
  const inline = [...plain.matchAll(/\$([^$]{2,120})\$/g)].map((x) => x[1])
  const display = [...plain.matchAll(/\\\[([\s\S]{2,300}?)\\\]/g)].map((x) => x[1])
  console.log(`公式：行内 ${inline.length} 个，显示 ${display.length} 个`)
  if (inline.length) console.log('  行内样本:', inline.slice(0, 3).join(' | '))
  if (display.length) console.log('  显示样本:', display[0].slice(0, 80))

  /* 出链 */
  const out = [...text.matchAll(/href="\/nlab\/show\/([^"#?]+)"/g)].map((x) => decodeURIComponent(x[1]))
  console.log('出链数:', new Set(out).size)
}
