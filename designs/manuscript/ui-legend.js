/**
 * designs/manuscript/ui-legend.js — 凡例弹层（SPEC §7.2，模块 M4 的辅助文件）。
 *
 * 像书前的"凡例"：先讲符号（页边批注的手写状态符号、铅笔笔法），再讲版式（字号阶梯、朱 / 铅 / 荧光的含义、朱印），
 * 最后讲读法（语义缩放三层、键盘与鼠标、检索语法）。
 * 符号与笔法用 pencil.js 的 statusMark / strokeSample 画进小 canvas —— 与画布上的是同一套笔触，不另画一套图标。
 */
import { STATUS_GLYPH, LINK_STROKE, FIELD_SEAL, LOD_LEVELS } from './constants.js'
import { typeLabel, RESEARCHER_AREAS } from '../shared/kb.js'
import { statusMark } from './pencil.js'
import { strokeCanvas, sealCanvas, hiDpiCanvas } from './panel.js'

/** 笔法 → 中文说明（类型名由 typeLabel 生成，保证与注释页的分组名一致） */
const STROKE_ORDER = ['double', 'arrow', 'solid', 'dashed', 'wavy', 'dotted']
const STROKE_NAME = { double: '双线', arrow: '箭头', solid: '单线', dashed: '虚线', wavy: '波浪线', dotted: '点线' }

const KEYS = [
  ['拖动', '平移书桌'],
  ['滚轮 / 双指', '以指针为中心缩放'],
  ['双击', '放大；双击诗句则选中并读到阅读字号'],
  ['单击', '选中条目，右侧打开注释页'],
  ['← / →', '上一句 / 下一句（按阅读顺序）'],
  ['[ / ]', '上一页 / 下一页'],
  ['0 / Home', '全卷视图'],
  ['+ / −', '放大 / 缩小'],
  ['/ 或 Ctrl K', '聚焦检索框'],
  ['A', '显示 / 隐藏栏内铅笔弧'],
  ['?', '打开 / 关闭凡例'],
  ['Esc', '依次：收起下拉 → 取消选中 → 清空检索 → 全卷'],
]

const EXAMPLES = ['hodge', '黎曼', 'status:open', 'is:researcher', 'family:scheme importance:>0.8', 'latex:det']

/**
 * @param {{graph:object, actions:object, onExample:(q:string)=>void}} deps
 * @returns {{el:HTMLElement, show():void, hide():void, scrollToKeys():void, atKeys():boolean}}
 */
export function buildLegend({ graph, actions, onExample }) {
  const box = el('section', 'mx-legend')
  box.setAttribute('role', 'dialog')
  box.setAttribute('aria-label', '凡例')
  box.hidden = true

  const head = el('header', 'mx-legend-head')
  head.append(text('h2', 'mx-legend-title', '凡例'), text('span', 'mx-legend-la', 'Notae · How to read'))
  const close = el('button', 'mx-icon mx-close'); close.type = 'button'; close.textContent = '✕'
  close.setAttribute('aria-label', '关闭凡例（Esc）'); close.title = '关闭凡例（Esc）'
  close.addEventListener('click', () => actions.toggleLegend(false))
  head.append(close)
  box.append(head)

  const body = el('div', 'mx-legend-body')
  box.append(body)

  /* 一、页边的未解之问 */
  const counts = {}
  for (const n of graph?.nodes || []) if (n.cluster) counts[n.status] = (counts[n.status] || 0) + 1
  const st = el('ul', 'mx-lg-list')
  for (const [k, g] of Object.entries(STATUS_GLYPH)) {
    const li = el('li', 'mx-lg-row')
    const c = hiDpiCanvas(28, 28, 'mx-lg-glyph')
    try { statusMark(c.getContext('2d'), 14, 22, 24, k, { align: 'center' }) } catch { /* 笔触模块未就绪 */ }
    c.setAttribute('aria-hidden', 'true')
    const t = el('span', 'mx-lg-text')
    const name = text('b', 'mx-lg-name', g.name); name.style.color = g.color
    t.append(name, text('span', 'mx-lg-hint', g.hint || ''))
    li.append(c, t, text('span', 'mx-lg-num', counts[k] ? `${counts[k]} 则` : '—'))
    st.append(li)
  }
  body.append(sec('一', '页边的未解之问', '猜想写在章页外侧页边，蓝黑墨手书；前面的手写符号是它的现状，字母是引用记号，被批注的诗句名后有同一字母的朱色上标。', st))

  /* 二、铅笔笔法 = 关系类型 */
  const byStroke = new Map()
  for (const [type, style] of Object.entries(LINK_STROKE)) {
    if (!byStroke.has(style)) byStroke.set(style, [])
    byStroke.get(style).push(type)
  }
  const sl = el('ul', 'mx-lg-list')
  for (const style of STROKE_ORDER) {
    const types = byStroke.get(style)
    if (!types) continue
    const li = el('li', 'mx-lg-row')
    li.append(strokeCanvas(style, `legend-${style}`, 56, 16))
    const t = el('span', 'mx-lg-text')
    t.append(text('b', 'mx-lg-name', STROKE_NAME[style] || style), text('span', 'mx-lg-hint', types.map(typeLabel).filter(uniq).join('、')))
    li.append(t)
    sl.append(li)
  }
  body.append(sec('二', '铅笔笔法', '关系类型不靠颜色区分，靠笔法；箭头从前提指向结论（蕴含、推广、依赖）。', sl))

  /* 三、版式 */
  const tiers = el('div', 'mx-lg-tiers')
  tiers.append(
    tierRow('题记', '每章最重要的一条，大字居中，全卷视图下也读得出', 'is-epi'),
    tierRow('核心', '每节的第一句，带英文副名', 'is-core'),
    tierRow('诗句', '其余定理，字号随重要度', 'is-verse'),
    tierRow('页边', '猜想批注，手书小字', 'is-note'),
  )
  const marks = el('ul', 'mx-lg-list mx-lg-marks')
  marks.append(
    swatchRow('mx-sw-sel', '朱墨双圈', '当前选中的条目'),
    swatchRow('mx-sw-rel', '铅笔圈', '与它直接相关的条目（铅笔线拉过去）'),
    swatchRow('mx-sw-hit', '荧光笔', '检索命中'),
  )
  const seals = el('ul', 'mx-lg-list mx-lg-seals')
  const fields = [...new Set((graph?.nodes || []).filter((n) => n.researcher).map((n) => n.field))]
  for (const f of fields) {
    const li = el('li', 'mx-lg-seal')
    li.append(sealCanvas(FIELD_SEAL[f] || '学', 26, `legend-${f}`), text('span', 'mx-lg-hint', (RESEARCHER_AREAS[f] || {}).name || f))
    seals.append(li)
  }
  body.append(sec('三', '版式', '字号阶梯：题记 > 核心 > 诗句 > 页边。朱色只用于版式与当前选中，不用来给数据分类。', tiers, marks,
    text('p', 'mx-lg-note', '卷末题跋录当代作者署名，朱印印文为其所治之学：'), seals))

  /* 四、读法 */
  const lv = el('ul', 'mx-lg-list mx-lg-levels')
  const lvDesc = { volume: '十张纸、章题、题记公式；章与章之间是标了关联数的铅笔丝线', chapter: '导言、诗节、核心诗句与页边批注读得清；栏内铅笔弧淡入', verse: '每一行公式、名称、行号与页边公式都读得清' }
  for (const l of LOD_LEVELS) {
    const li = el('li', 'mx-lg-row')
    li.append(text('b', 'mx-lg-name mx-lg-lv', l.name), text('span', 'mx-lg-hint', lvDesc[l.id] || ''))
    lv.append(li)
  }
  const keys = el('dl', 'mx-lg-keys')
  for (const [k, v] of KEYS) { keys.append(text('dt', '', k), text('dd', '', v)) }
  const ex = el('div', 'mx-lg-examples')
  for (const q of EXAMPLES) {
    const b = el('button', 'mx-lg-ex'); b.type = 'button'; b.textContent = q
    b.setAttribute('aria-label', `检索 ${q}`)
    b.addEventListener('click', () => { actions.toggleLegend(false); onExample(q) })
    ex.append(b)
  }
  const keysSec = sec('四', '读法', '语义缩放：离得越近，读到的越细。', lv, text('h4', 'mx-lg-sub', '操作'), keys,
    text('h4', 'mx-lg-sub', '检索语法'),
    text('p', 'mx-lg-note', '裸词匹配名称 / 英文 / 公式源码；字段写作 key:value，空格为"且"，大写 OR 为"或"，前缀 - 为"非"。点一下示例即可检索：'), ex)
  keysSec.id = 'mx-legend-keys'
  body.append(keysSec)

  return {
    el: box,
    show() { box.hidden = false; box.classList.add('is-on') },
    hide() { box.hidden = true; box.classList.remove('is-on') },
    scrollToKeys() { requestAnimationFrame(() => { body.scrollTop = keysSec.offsetTop - 12 }) },
    atKeys() { return body.scrollTop > 40 && Math.abs(body.scrollTop - (keysSec.offsetTop - 12)) < 60 },
  }
}

function sec(num, title, lead, ...children) {
  const s = el('section', 'mx-lg-sec')
  const h = el('h3', 'mx-lg-h')
  h.append(text('span', 'mx-lg-num-h', num), text('span', '', title))
  s.append(h)
  if (lead) s.append(text('p', 'mx-lg-lead', lead))
  s.append(...children)
  return s
}
function tierRow(label, desc, cls) {
  const d = el('div', `mx-lg-tier ${cls}`)
  d.append(text('span', 'mx-lg-tier-sample', label), text('span', 'mx-lg-hint', desc))
  return d
}
function swatchRow(cls, name, desc) {
  const li = el('li', 'mx-lg-row')
  const sw = el('span', `mx-sw ${cls}`); sw.setAttribute('aria-hidden', 'true'); sw.textContent = '诗'
  const t = el('span', 'mx-lg-text')
  t.append(text('b', 'mx-lg-name', name), text('span', 'mx-lg-hint', desc))
  li.append(sw, t)
  return li
}
function uniq(v, i, a) { return a.indexOf(v) === i }
function el(tag, cls) { const e = document.createElement(tag); if (cls) e.className = cls; return e }
function text(tag, cls, t) { const e = el(tag, cls); e.textContent = t; return e }

