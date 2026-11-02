/**
 * designs/map/src/ui/register.js — 探险者名录（24 位研究者，SPEC §9.6）。
 *
 * 研究者在地图上是海岸港口，散在大陆一圈，单靠找港口很难"把 24 人都看一遍"；
 * 名录给出按领域分组的完整清单，点一下就飞过去。名录在选中后保持打开，方便连续浏览。
 */
import { actions } from '../state.js'
import { RESEARCHER_AREAS } from '../../../shared/kb.js'
import { h, portGlyph } from './glyphs.js'

export function createRegister(root, { graph, onChange, onClose }) {
  root.textContent = ''
  root.classList.add('ui-card', 'ui-register')

  const head = h('header', 'ui-reg-head')
  const tt = h('div', 'ui-reg-title')
  tt.append(h('h2', 'ui-reg-h', '探险者名录'), h('div', 'ui-reg-latin', 'Register of Explorers'))
  const close = h('button', 'ui-iconbtn', '×')
  close.type = 'button'
  close.setAttribute('aria-label', '关闭探险者名录')
  close.addEventListener('click', () => onClose())
  head.append(tt, close)

  const body = h('div', 'ui-reg-body')
  const researchers = graph.nodes.filter((n) => n.researcher)
  const byField = new Map()
  for (const n of researchers) {
    const k = RESEARCHER_AREAS[n.field] ? n.field : '_other'
    if (!byField.has(k)) byField.set(k, [])
    byField.get(k).push(n)
  }
  const rows = new Map()
  const order = [...Object.keys(RESEARCHER_AREAS), '_other'].filter((k) => byField.has(k))
  for (const k of order) {
    const list = byField.get(k).sort((a, b) => (b.importance - a.importance) || a.name.localeCompare(b.name))
    const sec = h('section', 'ui-reg-group')
    const gh = h('h3', 'ui-reg-gh')
    gh.append(h('span', null, RESEARCHER_AREAS[k]?.name || '其他'), h('span', 'ui-reg-count', list.length))
    sec.append(gh)
    const ul = h('ul', 'ui-reg-list')
    for (const n of list) {
      const li = h('li')
      const b = h('button', 'ui-reg-row')
      b.type = 'button'
      const g = h('span', 'ui-reg-glyph'); g.append(portGlyph(16))
      const txt = h('span', 'ui-reg-txt')
      const nm = h('span', 'ui-reg-name', n.name)
      // 中文名不套西文斜体（宋/楷没有真斜体，浏览器会合成难看的倾斜）
      if (/[㐀-鿿]/.test(n.name)) nm.classList.add('is-cjk')   // 汉字区间 U+3400–U+9FFF
      txt.append(nm, h('span', 'ui-reg-inst', n.institution || ''))
      b.title = n.institution ? `${n.name} · ${n.institution}` : n.name
      b.append(g, txt)
      b.addEventListener('click', () => {
        try { const r = actions.select(n.id); if (r && r.catch) r.catch(() => {}) } catch (e) { console.warn('[map/ui] select 失败', e) }
      })
      li.append(b)
      ul.append(li)
      rows.set(n.id, b)
    }
    sec.append(ul)
    body.append(sec)
  }
  root.append(head, body)
  root.hidden = true

  let current = null
  function highlight(id) {
    if (current && rows.get(current)) { rows.get(current).classList.remove('is-selected'); rows.get(current).removeAttribute('aria-current') }
    current = id
    const b = id && rows.get(id)
    if (b) { b.classList.add('is-selected'); b.setAttribute('aria-current', 'true'); if (!root.hidden) b.scrollIntoView({ block: 'nearest' }) }
  }

  return {
    isOpen: () => !root.hidden,
    setOpen(v) {
      const was = !root.hidden
      root.hidden = !v
      if (v && !was) { const b = current && rows.get(current); if (b) b.scrollIntoView({ block: 'nearest' }) }
      if (was !== !!v) onChange()
      return was !== !!v
    },
    highlight,
    count: researchers.length,
  }
}
