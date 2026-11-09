/**
 * designs/manuscript/ui.js — DOM 界面外壳（SPEC §7，模块 M4）。
 *
 * 组成：顶栏（题名 · 检索 · 层级读数 · 工具）、检索下拉、左侧书签栏、右侧注释页、悬停小签、
 * 凡例弹层（ui-legend.js）、载入幕、toast。
 *
 * 取舍：
 *   · 单向数据流：ui **只**调用 actions.* 改交互状态，再从 bus 事件得知结果并重画自己。
 *     这样键盘（input.js）、深链（hash.js）、评审句柄（__design）改了状态，界面也同样跟上。
 *   · 外壳全部是"印在纸上的字"：与画布同一套纸色、墨色与字体（值从 constants.js 写进 CSS 变量，
 *     不在 CSS 里再抄一遍，避免两处漂移）；纸纹是启动时程序生成的一小块纤维位图（不引入图片资源）。
 *   · #ui 整层 pointer-events:none，只有控件自己接收指针 —— 画布的拖动 / 滚轮不受外壳遮挡。
 *   · 数据文本一律 textContent / inlineMd，绝不拼 innerHTML。
 */
import { state, bus, visibleRect } from './state.js'
import { PALETTE, FONTS, CHROME, CHAPTERS, CHAPTER_BY_KEY, FRONT, COLOPHON, lodLevel, statusGlyph, FIELD_SEAL, TEX_EM } from './constants.js'
import { inlineMd } from '../shared/md.js'
import { itemScreenRect } from './render.js'
import { svgUrlFor } from './formulas.js'
import { buildPanelContent, locatorOf } from './panel.js'
import { buildLegend } from './ui-legend.js'
import { rng } from './pencil.js'

const DROPDOWN_MAX = 40     // 下拉最多列出的命中数
const TIP_DELAY = 120       // 悬停小签的出现延迟（ms）：扫过时不闪
const TIP_FORMULA_H = 48    // 小签里公式图的最大高度
const TOAST_MS = 2400

/** 书签：卷首、八章、题跋。front / colophon 的竖排小字另取，免得「首 / 卷首」重复 */
const MARKS = [
  { key: FRONT.key, num: FRONT.roman, short: '扉页', label: FRONT.name, latin: FRONT.latin },
  ...CHAPTERS.map((c) => ({ key: c.key, num: c.roman, short: c.short, label: `卷 ${c.roman} · ${c.name}`, latin: c.latin })),
  { key: COLOPHON.key, num: COLOPHON.roman, short: '署名', label: COLOPHON.name, latin: COLOPHON.latin },
]

/**
 * @param {HTMLElement} root  #ui
 * @param {object} actions    SPEC §8.2 的 actions
 * @returns {{setProgress(text:string, frac:number):void, hideLoading():void, focusSearch():void,
 *            setSearchBox(q:string):void, toast(text:string):void}}
 */
export function mountUI(root, actions) {
  root.replaceChildren()
  root.classList.add('mx-ui')
  installCssVars()

  /* ───────── 顶栏 ───────── */
  const top = el('header', 'mx-top')
  const brand = el('button', 'mx-brand')
  brand.type = 'button'
  brand.setAttribute('aria-label', '公式诗稿 · 回到全卷视图')
  brand.append(text('span', 'mx-brand-seal', '稿'), text('span', 'mx-brand-zh', '公式诗稿'), text('span', 'mx-brand-la', 'Formula Manuscript'))
  brand.addEventListener('click', () => actions.fit())

  const searchWrap = el('div', 'mx-searchwrap')
  searchWrap.setAttribute('role', 'search')
  const input = el('input', 'mx-search')
  input.type = 'search'
  input.placeholder = '检索：名称 / 英文 / 公式 / status:open family:scheme …'
  input.autocomplete = 'off'
  input.spellcheck = false
  input.setAttribute('aria-label', '检索公式、猜想与研究者（快捷键 /）')
  input.setAttribute('role', 'combobox')
  input.setAttribute('aria-autocomplete', 'list')
  input.setAttribute('aria-controls', 'mx-results')
  input.setAttribute('aria-expanded', 'false')
  const kbd = text('kbd', 'mx-search-kbd', '/')
  kbd.setAttribute('aria-hidden', 'true')
  const count = el('span', 'mx-count')
  count.setAttribute('aria-live', 'polite')
  const results = el('div', 'mx-results')
  results.id = 'mx-results'
  results.setAttribute('role', 'listbox')
  results.setAttribute('aria-label', '检索结果')
  results.hidden = true
  const field = el('div', 'mx-searchfield')
  field.append(input, kbd, results)
  searchWrap.append(field, count)

  const tools = el('div', 'mx-tools')
  const readout = el('span', 'mx-readout')
  readout.title = '当前层级 · 缩放'
  const bFit = toolBtn('全卷', '回到全卷视图（0）', () => actions.fit())
  const bArc = toolBtn('铅笔弧', '显示 / 隐藏栏内铅笔弧（A）', () => { actions.toggleAmbient(); syncToggles() })
  const bLegend = toolBtn('凡例', '凡例：符号、笔法与操作（?）', () => actions.toggleLegend())
  const bHelp = toolBtn('?', '快捷键说明', () => {
    if (state.showLegend && legend?.atKeys()) actions.toggleLegend(false)
    else { actions.toggleLegend(true); legend?.scrollToKeys() }
  }, 'mx-tool-help')
  tools.append(readout, sep(), bFit, bArc, bLegend, sep(), bHelp)
  top.append(brand, searchWrap, tools)

  /* ───────── 书签栏 ───────── */
  const rail = el('nav', 'mx-rail')
  rail.setAttribute('aria-label', '书签：跳到各页')
  const markEls = new Map()
  for (const m of MARKS) {
    const b = el('button', 'mx-mark')
    b.type = 'button'
    b.dataset.key = m.key
    if (m.key === 'front' || m.key === 'colophon') b.classList.add('is-end')
    const badge = el('span', 'mx-badge'); badge.hidden = true
    b.append(text('span', 'mx-mark-num', m.num), text('span', 'mx-mark-short', m.short), badge)
    b.setAttribute('aria-label', `跳到${m.label}`)
    b.title = `${m.label}　${m.latin}`
    b.addEventListener('click', () => actions.gotoChapter(m.key))
    rail.append(b)
    markEls.set(m.key, { b, badge })
  }

  /* ───────── 注释页 ───────── */
  const panel = el('aside', 'mx-panel')
  panel.setAttribute('aria-label', '注释页')
  panel.inert = true
  const scroller = el('div', 'mx-panel-scroll')
  panel.append(scroller)

  /* ───────── 悬停小签 / toast / 载入幕 ───────── */
  const tip = el('div', 'mx-tip')
  tip.setAttribute('role', 'tooltip')
  tip.hidden = true
  const toastEl = el('div', 'mx-toast')
  toastEl.setAttribute('role', 'status')
  toastEl.setAttribute('aria-live', 'polite')

  const veil = el('div', 'mx-veil')
  veil.setAttribute('role', 'progressbar')
  veil.setAttribute('aria-label', '正在排版')
  veil.setAttribute('aria-valuemin', '0')
  veil.setAttribute('aria-valuemax', '100')
  const veilTrack = el('div', 'mx-veil-track')
  const veilFill = el('div', 'mx-veil-fill')
  veilTrack.append(veilFill)
  const veilPhase = text('p', 'mx-veil-phase', '研墨')
  veil.append(text('h1', 'mx-veil-title', '公式诗稿'), text('p', 'mx-veil-la', 'Formula Manuscript'), veilTrack, veilPhase)

  root.append(rail, top, panel, tip, toastEl, veil)

  /* 凡例：首次打开时才构建（要画铅笔笔法小样） */
  let legend = null
  function ensureLegend() {
    if (legend) return legend
    legend = buildLegend({
      graph: state.graph, actions,
      onExample(q) { input.value = q; actions.search(q); input.focus() },
    })
    root.insertBefore(legend.el, toastEl)
    return legend
  }

  /* ═════════ 检索 ═════════ */
  let lastHits = []
  let lastError = null
  let active = -1

  input.addEventListener('input', () => actions.search(input.value))
  input.addEventListener('focus', () => { renderResults() })
  input.addEventListener('blur', () => closeResults())
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      if (results.hidden) renderResults()
      moveActive(e.key === 'ArrowDown' ? 1 : -1)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (lastHits.length) choose(Math.max(0, active))
      else if (input.value.trim()) toast(lastError ? shortError(lastError) : '没有命中。试试英文名、公式片段，或 status:open')
    } else if (e.key === 'Escape') {
      // 下拉开着：第一下 Esc 只收起下拉，不往下传给全局 Esc（那会取消选中 / 清空查询）
      if (!results.hidden) { e.preventDefault(); e.stopPropagation(); closeResults(); return }
      // 下拉已收：阻止 type=search 的原生清空，交给 actions.escape 的分级逻辑（取消选中 → 清空查询 → 全卷）
      e.preventDefault()
      setTimeout(() => { if (!state.query) input.blur() }, 0)
    }
  })

  function renderResults() {
    const q = input.value.trim()
    if (document.activeElement !== input || !q) { closeResults(); return }
    results.replaceChildren()
    if (lastError) {
      results.append(text('div', 'mx-res-empty is-error', shortError(lastError)))
    } else if (!lastHits.length) {
      const d = el('div', 'mx-res-empty')
      d.append(text('span', '', '没有命中。'), text('span', 'mx-res-hint', '试试英文名、公式片段（latex:det）或 status:open、is:researcher'))
      results.append(d)
    } else {
      const terms = bareTerms(q)
      lastHits.slice(0, DROPDOWN_MAX).forEach((id, i) => {
        const opt = resultRow(id, i, terms)
        if (opt) results.append(opt)
      })
      const foot = el('div', 'mx-res-foot')
      foot.textContent = lastHits.length > DROPDOWN_MAX
        ? `共 ${lastHits.length} 处，列出前 ${DROPDOWN_MAX} 处 · ↑↓ 选择 · Enter 定位`
        : `共 ${lastHits.length} 处 · ↑↓ 选择 · Enter 定位`
      results.append(foot)
    }
    results.hidden = false
    input.setAttribute('aria-expanded', 'true')
    setActive(lastHits.length ? Math.min(Math.max(active, 0), Math.min(lastHits.length, DROPDOWN_MAX) - 1) : -1, false)
  }

  function resultRow(id, i, terms) {
    const node = state.graph?.byId.get(id)
    if (!node) return null
    const it = state.layout?.byId.get(id)
    const opt = el('div', 'mx-res')
    opt.id = `mx-res-${i}`
    opt.setAttribute('role', 'option')
    opt.dataset.index = String(i)
    const mark = el('span', 'mx-res-mark')
    if (node.cluster) { const g = statusGlyph(node.status); mark.textContent = g.glyph; mark.style.color = g.color; mark.classList.add('is-note') }
    else if (node.researcher) { mark.textContent = FIELD_SEAL[node.field] || '学'; mark.classList.add('is-seal') }
    else { mark.textContent = CHAPTER_BY_KEY[node.family]?.roman || '·' ; mark.classList.add('is-verse') }
    mark.setAttribute('aria-hidden', 'true')
    const body = el('span', 'mx-res-body')
    const name = el('span', 'mx-res-name'); name.append(...highlight(node.name, terms))
    body.append(name)
    if (node.en && node.en !== node.name) { const en = el('span', 'mx-res-en'); en.append(...highlight(node.en, terms)); body.append(en) }
    const loc = text('span', 'mx-res-loc', locatorOf(node, it))
    opt.append(mark, body, loc)
    opt.addEventListener('mousedown', (e) => e.preventDefault())   // 不让输入框失焦（失焦会先收起下拉）
    opt.addEventListener('pointerenter', () => setActive(i, false))
    opt.addEventListener('click', () => choose(i))
    return opt
  }

  function setActive(i, scroll = true) {
    active = i
    let cur = null
    for (const o of results.querySelectorAll('.mx-res')) {
      const on = Number(o.dataset.index) === i
      o.setAttribute('aria-selected', on ? 'true' : 'false')
      o.classList.toggle('is-active', on)
      if (on) cur = o
    }
    if (cur) { input.setAttribute('aria-activedescendant', cur.id); if (scroll) cur.scrollIntoView({ block: 'nearest' }) }
    else input.removeAttribute('aria-activedescendant')
  }
  function moveActive(d) {
    const n = Math.min(lastHits.length, DROPDOWN_MAX)
    if (!n) return
    setActive(((active < 0 ? (d > 0 ? -1 : 0) : active) + d + n) % n)
  }
  function choose(i) {
    const id = lastHits[i]
    if (!id) return
    closeResults()
    actions.locate(id)
    input.blur()   // 交还键盘：之后 ←/→ 逐句阅读、Esc 分级退出都由全局键盘处理
  }
  function closeResults() {
    results.hidden = true
    input.setAttribute('aria-expanded', 'false')
    input.removeAttribute('aria-activedescendant')
  }

  function renderCount() {
    count.classList.toggle('is-error', !!lastError)
    count.title = lastError || ''
    if (lastError) count.textContent = shortError(lastError)
    else if (!state.query.trim()) count.textContent = ''
    else count.textContent = lastHits.length ? `${lastHits.length} 处` : '无命中'
  }

  /* ═════════ 书签栏：当前页 + 检索计数 ═════════ */
  function pageKeyAtCenter() {
    const L = state.layout
    if (!L) return null
    const r = visibleRect()
    // 全卷视图下视口能装下好几页，此时不认"当前页"（否则总是亮中间那页，反而误导）
    if (r.w / state.cam.z > L.pages[0].w * 2.6) return null
    const { x, y } = state.cam
    let best = null, bd = Infinity
    for (const p of L.pages) {
      const dx = Math.max(p.x - x, 0, x - (p.x + p.w)), dy = Math.max(p.y - y, 0, y - (p.y + p.h))
      const d = dx * dx + dy * dy
      if (d < bd) { bd = d; best = p }
    }
    return best ? best.key : null
  }
  let currentKey = undefined
  function renderRailCurrent() {
    const k = pageKeyAtCenter()
    if (k === currentKey) return
    currentKey = k
    for (const [key, { b }] of markEls) {
      const on = key === k
      b.classList.toggle('is-current', on)
      if (on) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current')
    }
  }
  function renderRailBadges() {
    const L = state.layout
    const counts = new Map()
    if (L) for (const id of lastHits) {
      const it = L.byId.get(id)
      const p = it && L.pages[it.page]
      if (p) counts.set(p.key, (counts.get(p.key) || 0) + 1)
    }
    for (const [key, { b, badge }] of markEls) {
      const n = counts.get(key) || 0
      badge.hidden = !n
      badge.textContent = n > 99 ? '99+' : String(n)
      b.classList.toggle('has-hits', !!n)
      const m = MARKS.find((x) => x.key === key)
      b.setAttribute('aria-label', n ? `跳到${m.label}（${n} 处命中）` : `跳到${m.label}`)
    }
  }

  /* ═════════ 顶栏读数与开关 ═════════ */
  function renderReadout() {
    const z = state.cam.z
    readout.textContent = `${lodLevel(z).name} · ${Math.round(z * 100)}%`
    bFit.classList.toggle('is-on', !!state.fitZoom && Math.abs(z / state.fitZoom - 1) < 0.04)
  }
  function syncToggles() {
    bArc.setAttribute('aria-pressed', state.showAmbient ? 'true' : 'false')
    bArc.classList.toggle('is-on', !!state.showAmbient)
    bLegend.setAttribute('aria-pressed', state.showLegend ? 'true' : 'false')
    bLegend.classList.toggle('is-on', !!state.showLegend)
  }

  /* ═════════ 注释页 ═════════ */
  function renderPanel(id) {
    const node = id && state.graph?.byId.get(id)
    if (!node) return
    scroller.replaceChildren(buildPanelContent(node, { graph: state.graph, layout: state.layout, actions, state }))
    scroller.scrollTop = 0
  }
  function syncPanel() {
    const open = !!state.panelOpen
    panel.classList.toggle('is-open', open)
    panel.inert = !open
    root.classList.toggle('panel-open', open)
  }

  /* ═════════ 悬停小签 ═════════ */
  let tipTimer = 0
  let tipId = null
  let tipPt = [0, 0]
  function hideTip() { clearTimeout(tipTimer); tipId = null; tip.hidden = true }
  function showTip(id, legible) {
    const node = state.graph?.byId.get(id)
    if (!node) return
    tip.replaceChildren()
    const head = el('div', 'mx-tip-head')
    if (node.cluster) {
      const g = statusGlyph(node.status)
      const s = text('span', 'mx-tip-glyph', g.glyph); s.style.color = g.color; head.append(s)
    } else if (node.researcher) head.append(text('span', 'mx-tip-seal', FIELD_SEAL[node.field] || '学'))
    head.append(text('span', 'mx-tip-name', node.name))
    tip.append(head)
    if (node.en && node.en !== node.name) tip.append(text('div', 'mx-tip-en', node.en))
    const it = state.layout?.byId.get(id)
    const meta = [locatorOf(node, it)]
    if (node.cluster) meta.push(statusGlyph(node.status).name)
    if (node.researcher && node.institution) meta.push(node.institution)
    tip.append(text('div', 'mx-tip-loc', meta.filter(Boolean).join(' · ')))
    // 画布上读不清时，附一张同源的 MathJax 公式小图
    if (legible === false && !node.researcher) {
      const url = svgUrlFor(id)
      if (url) {
        const img = new Image(); img.className = 'mx-tip-formula'; img.alt = ''; img.src = url
        const d = state.dims?.get(id)
        if (d) {
          const s = Math.min(22 / TEX_EM, TIP_FORMULA_H / d.h, 300 / d.w)
          img.style.width = `${Math.round(d.w * s)}px`
        }
        tip.append(img)
      }
    }
    if (node.summary) { const p = el('p', 'mx-tip-sum'); p.append(...inlineMd(node.summary)); tip.append(p) }
    tip.hidden = false
    placeTip()
  }
  /** 放在条目屏幕矩形旁：优先右侧，不够放左侧，再不行放上 / 下；整体夹在可见区（扣掉顶栏、书签栏、注释页）里 */
  function placeTip() {
    if (tip.hidden || !tipId) return
    const vr = visibleRect()
    const W = tip.offsetWidth, H = tip.offsetHeight
    let r = itemScreenRect(tipId)
    // 条目在屏幕上太大（近看题记）或拿不到矩形：就跟着指针
    if (!r || r.w > vr.w * 0.5) r = { x: tipPt[0] - 2, y: tipPt[1] - 2, w: 4, h: 4 }
    const gap = 12
    let x = r.x + r.w + gap, y = r.y + r.h / 2 - Math.min(H / 2, 40)
    if (x + W > vr.x + vr.w - 8) x = r.x - gap - W
    if (x < vr.x + 8) {
      x = Math.min(Math.max(r.x, vr.x + 8), vr.x + vr.w - W - 8)
      y = r.y + r.h + gap
      if (y + H > vr.y + vr.h - 8) y = r.y - gap - H
    }
    x = Math.min(Math.max(x, vr.x + 8), vr.x + vr.w - W - 8)
    y = Math.min(Math.max(y, vr.y + 8), vr.y + vr.h - H - 8)
    tip.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`
  }

  /* ═════════ bus ═════════ */
  bus.on('search', ({ query, hits, error }) => {
    if (input.value !== query) input.value = query
    lastHits = hits || []
    lastError = error || null
    active = lastHits.length ? 0 : -1
    renderCount()
    renderRailBadges()
    if (document.activeElement === input) renderResults()
  })
  bus.on('view', () => {
    renderReadout()
    renderRailCurrent()
    placeTip()
  })
  bus.on('select', ({ id }) => {
    hideTip()
    if (state.hoverSource === 'panel') actions.hover(null, 0, 0, 'panel')   // 旧行被替换，不会再收到 mouseleave
    if (id) renderPanel(id)
    syncPanel()
  })
  bus.on('chrome', () => {
    syncPanel()
    syncToggles()
    if (state.showLegend) ensureLegend().show(); else legend?.hide()
    placeTip()
  })
  bus.on('hover', ({ id, sx, sy, legible, source }) => {
    if (source !== 'canvas' || !id || id === state.selectedId) { hideTip(); return }
    tipPt = [sx, sy]
    if (id === tipId) { if (!tip.hidden) placeTip(); return }
    clearTimeout(tipTimer)
    tip.hidden = true
    tipId = id
    tipTimer = setTimeout(() => { if (tipId === id) showTip(id, legible) }, TIP_DELAY)
  })
  bus.on('ready', () => { renderReadout(); currentKey = undefined; renderRailCurrent(); renderRailBadges(); syncToggles() })

  // 凡例开着时 Esc 先关凡例（捕获阶段，先于 input.js 的全局 Esc）
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && state.showLegend && !(e.target instanceof HTMLInputElement)) {
      e.stopImmediatePropagation(); e.preventDefault(); actions.toggleLegend(false)
    }
  }, true)
  // 键盘快捷键（a / ?）由 input.js 处理，这里只把按钮的按下态同步过来
  window.addEventListener('keyup', () => syncToggles())

  /* ═════════ 载入幕 / toast ═════════ */
  let toastTimer = 0
  function toast(msg) {
    toastEl.textContent = String(msg ?? '')
    toastEl.classList.add('is-on')
    clearTimeout(toastTimer)
    toastTimer = setTimeout(() => toastEl.classList.remove('is-on'), TOAST_MS)
  }

  syncToggles()
  renderReadout()

  return {
    setProgress(textMsg, frac) {
      const f = Math.max(0, Math.min(1, Number(frac) || 0))
      const msg = String(textMsg ?? '')
      const failed = msg.startsWith('启动失败')
      veilPhase.textContent = failed ? msg : `${msg} · ${Math.round(f * 100)}%`
      veil.classList.toggle('is-error', failed)
      veilFill.style.width = `${(f * 100).toFixed(1)}%`
      veil.setAttribute('aria-valuenow', String(Math.round(f * 100)))
    },
    hideLoading() {
      if (!veil.isConnected || veil.classList.contains('is-gone')) return
      veilFill.style.width = '100%'
      veil.classList.add('is-gone')
      setTimeout(() => veil.remove(), 320)
    },
    focusSearch() { input.focus(); input.select() },
    setSearchBox(q) { input.value = String(q ?? '') },
    toast,
  }
}

/* ───────── 小工具 ───────── */

/** 查询里的裸词（去掉 field:value、运算符、括号与引号），用来在下拉里高亮 */
function bareTerms(q) {
  return (q.match(/"[^"]*"|\S+/g) || [])
    .map((w) => w.replace(/^-+/, ''))
    .filter((w) => w && w !== 'OR' && !w.includes(':') && w !== '*')
    .map((w) => w.replace(/[()"]/g, '').toLowerCase())
    .filter(Boolean)
}
/** 把 s 里第一个命中的裸词包成 <mark>（文本节点，安全） */
function highlight(s, terms) {
  const str = String(s ?? '')
  const low = str.toLowerCase()
  for (const t of terms) {
    const i = low.indexOf(t)
    if (i < 0) continue
    const m = document.createElement('mark'); m.textContent = str.slice(i, i + t.length)
    return [document.createTextNode(str.slice(0, i)), m, document.createTextNode(str.slice(i + t.length))]
  }
  return [document.createTextNode(str)]
}
function shortError(err) { const s = String(err); return s.length > 34 ? s.slice(0, 33) + '…' : s }

/** 把 constants.js 的配色、字体、框架尺寸写进 CSS 变量（单一来源），并生成纸纹 */
function installCssVars() {
  const s = document.documentElement.style
  for (const [k, v] of Object.entries(PALETTE)) s.setProperty(`--mx-${k}`, v)
  for (const [k, v] of Object.entries(FONTS)) s.setProperty(`--mx-f-${k}`, v)
  s.setProperty('--mx-top', `${CHROME.TOP}px`)
  s.setProperty('--mx-rail', `${CHROME.RAIL}px`)
  s.setProperty('--mx-panel', `${CHROME.PANEL}px`)
  try { s.setProperty('--mx-grain', `url("${grainTile()}")`) } catch { /* 无 canvas 时没有纸纹也能用 */ }
}

/** 256² 的纸纤维小块：极淡的颗粒 + 短纤维线，确定性种子。只给外壳用（画布纸纹由 paper.js 自己生成） */
function grainTile() {
  const N = 256
  const c = document.createElement('canvas'); c.width = c.height = N
  const g = c.getContext('2d')
  const r = rng(20261031)
  const img = g.createImageData(N, N)
  for (let i = 0; i < N * N; i++) {
    const v = r()
    img.data[i * 4] = 92; img.data[i * 4 + 1] = 70; img.data[i * 4 + 2] = 40
    img.data[i * 4 + 3] = v < 0.5 ? Math.round(v * 22) : 0
  }
  g.putImageData(img, 0, 0)
  g.lineCap = 'round'
  for (let k = 0; k < 28; k++) {
    const x = r() * N, y = r() * N, a = r() * Math.PI, len = 4 + r() * 12
    g.strokeStyle = `rgba(110,86,50,${(0.03 + r() * 0.05).toFixed(3)})`
    g.lineWidth = 0.5 + r() * 0.6
    g.beginPath(); g.moveTo(x, y)
    g.quadraticCurveTo(x + Math.cos(a) * len * 0.5 + (r() - 0.5) * 3, y + Math.sin(a) * len * 0.5 + (r() - 0.5) * 3, x + Math.cos(a) * len, y + Math.sin(a) * len)
    g.stroke()
  }
  return c.toDataURL('image/png')
}

function el(tag, cls) { const e = document.createElement(tag); if (cls) e.className = cls; return e }
function text(tag, cls, t) { const e = el(tag, cls); e.textContent = t; return e }
function sep() { const s = el('span', 'mx-sep'); s.setAttribute('aria-hidden', 'true'); return s }
function toolBtn(label, aria, fn, cls = '') {
  const b = el('button', `mx-tool ${cls}`.trim())
  b.type = 'button'; b.textContent = label
  b.setAttribute('aria-label', aria); b.title = aria
  b.addEventListener('click', fn)
  return b
}
