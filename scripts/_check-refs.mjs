/**
 * 查证脚本：抓取 Stacks Project 条目的真实标题与陈述。
 * 只读网络，不改任何文件。用来确保数据文件里引用的 tag 与内容对得上。
 * 用法：node scripts/_check-refs.mjs [tag ...]
 */
const DEFAULT_TAGS = ['001P', '00W1', '00WG', '01ED', '01EO', '00IP', '00H7', '00OF', '00OI', '035E', '035I', '01W4', '01W5', '01KY', '00HP', '00HQ', '00MB', '00ME', '0BE0', '0BY6', '0AZQ', '01VI', '01WQ', '01WS', '0BXY', '02NG', '00M9', '0315', '00K1', '01KF']

const tags = process.argv.slice(2).length ? process.argv.slice(2) : DEFAULT_TAGS

function toText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&mdash;/g, '-')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\\\(/g, ' ')
    .replace(/\\\)/g, ' ')
    .replace(/\\[a-zA-Z]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

for (const tag of tags) {
  try {
    const res = await fetch(`https://stacks.math.columbia.edu/tag/${tag}`)
    const html = await res.text()
    const title = toText((html.match(/<title>([^<]*)<\/title>/) || [])[1] || '')
    console.log(`### ${tag} | ${title}`)
    const blocks = html.matchAll(/<(?:div|section)[^>]*class="[^"]*(?:lemma|theorem|proposition|definition|example|remark|equation|section)[^"]*"[^>]*>([\s\S]{0,1200}?)<\/(?:div|section)>/g)
    let shown = 0
    for (const block of blocks) {
      const body = toText(block[1]).slice(0, 260)
      if (body.length < 40) continue
      console.log(`    ${body}`)
      if (++shown >= 2) break
    }
  } catch (error) {
    console.log(`${tag} ERR ${error.message}`)
  }
}
