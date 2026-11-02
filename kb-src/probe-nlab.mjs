/**
 * kb-src/probe-nlab.mjs — 探查 nLab 的页面结构与可解析性（临时探针）。
 *
 * 要确认：
 *   1. 单页 HTML 里有哪些结构化信息（标题、正文、链接）
 *   2. 有没有「所有页面」的索引（比逐个抓取可靠）
 *   3. 页面之间的链接是否构成依赖关系
 *   4. 有没有机器可读格式（XML/RSS/API）
 */

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'

async function getText(url) {
  const r = await fetch(url, { headers: { 'User-Agent': UA } })
  return { status: r.status, text: await r.text(), headers: r.headers }
}

/* 1. 单页结构 */
const page = await getText('https://ncatlab.org/nlab/show/algebraic+geometry')
console.log('=== 1. 单页 ===')
console.log('HTTP', page.status, 'len', page.text.length)

/* 标题 */
const title = /<title>([^<]*)<\/title>/.exec(page.text)
console.log('title:', title?.[1])

/* 是否含 LaTeX（nLab 用 iTeX/MathJax） */
console.log('含 $...$ 公式:', /\$[^$]{2,80}\$/.test(page.text))
console.log('含 \\\\( \\\\) :', /\\\(.*?\\\)/s.test(page.text))

/* 主内容区 */
const bodyMatch = /<div[^>]*id="content"[^>]*>([\s\S]{0,3000})/.exec(page.text)
if (bodyMatch) {
  console.log('\n--- content 区开头 ---')
  console.log(bodyMatch[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').slice(0, 400))
}

/* 内部链接（依赖关系） */
const links = [...page.text.matchAll(/href="\/nlab\/show\/([^"#?]+)"/g)].map((m) => decodeURIComponent(m[1]))
const uniqLinks = [...new Set(links)]
console.log('\n内部链接数:', uniqLinks.length)
console.log('前 10 个:', uniqLinks.slice(0, 10).join(' | '))

/* 2. 索引 / API */
console.log('\n=== 2. 索引与 API 探测 ===')
for (const u of [
  'https://ncatlab.org/nlab/show/HomePage',
  'https://ncatlab.org/nlab/all_pages',
  'https://ncatlab.org/nlab/atom.xml',
  'https://ncatlab.org/nlab/rss.xml',
  'https://ncatlab.org/nlab/feeds/recent.xml',
]) {
  try {
    const r = await getText(u)
    console.log(`  ${u.slice(24).padEnd(28)} HTTP ${r.status} len=${r.text.length} type=${r.headers.get('content-type')}`)
  } catch (e) {
    console.log(`  ${u.slice(24).padEnd(28)} FAIL ${e.message.slice(0, 40)}`)
  }
}
