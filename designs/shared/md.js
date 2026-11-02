/**
 * designs/shared/md.js — 把数据里的 `**粗体**` 渲染出来。
 *
 * 规则取自 src/ui.js 的 inlineMd()：
 *   · 只认 `**…**`，不做其它 markdown
 *   · 没有配对的闭合标记 → 剩余部分按普通文本（宁可少加粗，不可吃掉内容）
 *   · 空内容 `****` 不算粗体
 *   · 粗体元素是 <b class="em">，与正式应用的样式钩子一致
 *
 * 与原版的一处差异：原版遇到 `****` 时会把它**之前**那段普通文本丢掉
 * （`i` 被直接跳到 `****` 之后）。这里改成把 `****` 连同前文一起保留为普通文本。
 * 当前数据里没有 `****`，所以两者输出完全相同。
 */

/**
 * 解析成片段数组：[{ text, bold }]
 * @param {string} text
 * @returns {Array<{text: string, bold: boolean}>}
 */
export function parseInlineMd(text) {
  const s = String(text ?? '')
  const out = []
  let i = 0       // 下一段普通文本的起点
  let from = i    // 下一次查找 ** 的起点
  for (;;) {
    const open = s.indexOf('**', from)
    if (open < 0) break
    const close = s.indexOf('**', open + 2)
    if (close < 0) break
    if (close === open + 2) { from = close + 2; continue }   // `****`：保留为普通文本
    if (open > i) out.push({ text: s.slice(i, open), bold: false })
    out.push({ text: s.slice(open + 2, close), bold: true })
    i = from = close + 2
  }
  if (i < s.length) out.push({ text: s.slice(i), bold: false })
  return out
}

/**
 * DOM 版本：返回节点数组，可直接 `el.append(...inlineMd(text))`。
 * 全部用 createTextNode，文本里的 `<` `&` 和公式源码不会被当成 HTML。
 * @returns {Node[]}
 */
export function inlineMd(text) {
  return parseInlineMd(text).map(({ text: t, bold }) => {
    if (!bold) return document.createTextNode(t)
    const b = document.createElement('b')
    b.className = 'em'
    b.textContent = t
    return b
  })
}

/** DocumentFragment 版本，方便一次性 appendChild */
export function inlineMdFragment(text) {
  const frag = document.createDocumentFragment()
  frag.append(...inlineMd(text))
  return frag
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ))
}

/** HTML 字符串版本（已转义），用于模板字符串拼接 */
export function inlineMdHtml(text) {
  return parseInlineMd(text)
    .map(({ text: t, bold }) => (bold ? `<b class="em">${escapeHtml(t)}</b>` : escapeHtml(t)))
    .join('')
}

/** 去掉标记的纯文本（做 title 属性、搜索索引时用） */
export function stripMd(text) {
  return parseInlineMd(text).map((p) => p.text).join('')
}
