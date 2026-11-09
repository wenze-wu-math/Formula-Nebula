/**
 * designs/atlas/panel.js — 右侧详情面板（M4，SPEC §9.1）。
 *
 * 设计取舍：
 *   · 只订阅 'select'，内容全部从 state.atlas.bodies / state.focus 现取；不缓存"当前节点"之外的状态，
 *     这样 hash 回退、搜索跳转、关联项跳转走的都是同一条路径（main 的 actions.select → emit）。
 *   · occluder 必须在 select 处理函数里**同步**登记：main 在 emit('select') 之后立刻按 occluder
 *     计算飞行目标的可视区中心。滑入动画期间 getBoundingClientRect 还在半路，所以直接用最终位置的
 *     矩形（由 PANEL_W / SHEET_* 常数算出），不读 DOM。
 *   · 桌面 / 抽屉的切换由 JS 按 SHEET_BREAKPOINT 加 class，而不是 CSS 媒体查询：
 *     occluder 的形状与面板的实际形状必须由同一个判断给出，避免两边阈值漂移。
 *   · 所有数据文本走 textContent / md.js（inlineMd），绝不拼 innerHTML。KaTeX 的输出是它自己
 *     生成的 DOM（throwOnError:false，非法输入显示为红色源码），不经过我们的字符串拼接。
 *   · 关闭时内容保留到滑出动画结束（视觉上不"先清空再滑走"），但立刻 aria-hidden + inert，
 *     读屏和 Tab 都不会再进入。
 */
import katex from 'katex'
import 'katex/dist/katex.min.css'
import { state, on, actions } from './state.js'
import {
  PANEL_W, SHEET_BREAKPOINT, SHEET_VH, MAG_CUTS, FAMILY_LATIN, FONT_SERIF, FONT_SANS, nebulaLink,
} from './constants.js'
import { glyphCanvas } from './glyphs.js'
import { FAMILIES, CONJECTURE_STATUS, CONJECTURE_FIELDS, RESEARCHER_AREAS, typeLabel } from '../shared/kb.js'
import { inlineMd } from '../shared/md.js'

/** 关联列表每组默认显示的条数；超出折叠为"显示全部" */
const GROUP_LIMIT = 12
/** detail 超过这么多行时折叠 */
const DETAIL_LINES = 6

/* ───────── 小工具 ───────── */
function h(tag, cls, text) {
  const e = document.createElement(tag)
  if (cls) e.className = cls
  if (text != null) e.textContent = String(text)
  return e
}
/** 含 **粗体** 的数据文本 → 元素（md.js 只生成 text node 与 <b class="em">） */
function md(tag, cls, text) {
  const e = h(tag, cls)
  e.append(...inlineMd(text ?? ''))
  return e
}
const _familyName = (f) => (FAMILIES[f] ? FAMILIES[f].name : '')
/** "上同调座"：族名 + 座（星座命名法） */
const constellationName = (f) => (FAMILIES[f] ? FAMILIES[f].name + '座' : '')
/** 只接受 http / https 链接；其他协议（javascript: 等）一律视为无链接 */
function safeUrl(u) {
  try {
    const url = new URL(String(u ?? ''), location.href)
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : null
  } catch { return null }
}
function glyphSpec(b) {
  if (!b) return { kind: 'star', mag: 6 }
  if (b.kind === 'dso') return { kind: 'dso', status: b.status }
  if (b.kind === 'researcher') return { kind: 'researcher' }
  return { kind: 'star', mag: b.mag }
}

/** 面板在视口中的最终矩形（css px）。桌面 = 右侧全高条；窄屏 = 底部抽屉。 */
export function panelRect() {
  const W = innerWidth, H = innerHeight
  if (W < SHEET_BREAKPOINT) {
    const sh = Math.round(H * SHEET_VH)
    return { x: 0, y: H - sh, w: W, h: sh }
  }
  const pw = Math.min(PANEL_W, W)
  return { x: W - pw, y: 0, w: pw, h: H }
}
const isSheet = () => innerWidth < SHEET_BREAKPOINT

/* ───────── KaTeX（按 id 缓存渲染结果） ─────────
 * 同一时刻只有一个面板，缓存的 DOM 节点可以直接搬进新容器（appendChild 会自动从旧父节点摘下）。 */
const texCache = new Map()
function renderTex(id, latex) {
  let el = texCache.get(id)
  if (!el) {
    el = h('div', 'ap-katex')
    try {
      katex.render(String(latex ?? ''), el, { displayMode: true, throwOnError: false, strict: 'ignore' })
    } catch {
      el.textContent = String(latex ?? '')   // throwOnError:false 下理论上不会到这里，兜底显示源码
    }
    texCache.set(id, el)
  }
  return el
}

/* ───────── 面板 ───────── */
export function initPanel(el) {
  el.classList.add('ap')
  el.style.setProperty('--ap-w', PANEL_W + 'px')
  el.style.setProperty('--ap-sheet-h', SHEET_VH * 100 + 'vh')
  // 字体串只在 constants.js 定义一次，经 CSS 变量传给 panel.css
  el.style.setProperty('--ap-serif', FONT_SERIF)
  el.style.setProperty('--ap-sans', FONT_SANS)
  el.setAttribute('aria-hidden', 'true')
  el.inert = true

  // 固定骨架：抓手条（仅抽屉显示）+ 可滚动内容区。关闭按钮在内容区的头部里，随内容替换。
  const grip = h('div', 'ap-grip')
  grip.setAttribute('aria-hidden', 'true')
  const scroller = h('div', 'ap-scroll')
  el.replaceChildren(grip, scroller)

  let openId = null
  let previewing = false   // 当前是否由面板发起了 hoverPreview（重建内容时要撤销，否则地图上悬停圈会残留）

  const setPreview = (id) => {
    previewing = !!id
    actions.hoverPreview(id)
  }
  const clearPreview = () => { if (previewing) setPreview(null) }

  function applyMode() {
    el.classList.toggle('is-sheet', isSheet())
  }
  function syncOccluder() {
    actions.setOccluder('panel', openId ? panelRect() : null)
  }

  function open(id) {
    const b = state.atlas && state.atlas.bodies.get(id)
    if (!b) { close(); return }
    clearPreview()
    applyMode()
    openId = id
    // 同步登记最终矩形（见文件头），再构造内容
    syncOccluder()
    document.body.classList.add('atlas-panel-open')
    scroller.replaceChildren(...build(b))
    scroller.scrollTop = 0
    el.classList.remove('is-dragging')
    el.style.removeProperty('--ap-drag')
    el.classList.add('open')
    el.setAttribute('aria-hidden', 'false')
    el.inert = false
    el.dataset.kind = b.kind
    // detail 是否需要折叠只能在布局后量；面板一直在布局里（只是平移出屏），这里同步量即可
    measureDetail()
  }

  function close() {
    clearPreview()
    // 焦点若在面板内，移回 body（inert 后焦点留在不可交互元素上会让键盘用户迷路）
    if (el.contains(document.activeElement)) document.activeElement.blur()
    openId = null
    syncOccluder()
    document.body.classList.remove('atlas-panel-open')
    el.classList.remove('open', 'is-dragging')
    el.style.removeProperty('--ap-drag')
    el.setAttribute('aria-hidden', 'true')
    el.inert = true
  }

  on('select', (id) => { if (id) open(id); else close() })

  // 尺寸变化：模式可能在桌面 / 抽屉之间切换，occluder 要跟着变
  const onResize = () => { applyMode(); if (openId) syncOccluder() }
  on('resize', onResize)
  addEventListener('resize', onResize)
  applyMode()

  /* ── 抽屉：拖动抓手条向下滑动关闭 ── */
  let drag = null
  grip.addEventListener('pointerdown', (e) => {
    if (!isSheet() || !openId) return
    grip.setPointerCapture(e.pointerId)
    drag = { y0: e.clientY, dy: 0 }
    el.classList.add('is-dragging')
  })
  grip.addEventListener('pointermove', (e) => {
    if (!drag) return
    drag.dy = Math.max(0, e.clientY - drag.y0)
    el.style.setProperty('--ap-drag', drag.dy + 'px')
  })
  const endDrag = () => {
    if (!drag) return
    const far = drag.dy > panelRect().h * 0.25
    drag = null
    el.classList.remove('is-dragging')
    el.style.removeProperty('--ap-drag')
    if (far) actions.deselect()
  }
  grip.addEventListener('pointerup', endDrag)
  grip.addEventListener('pointercancel', endDrag)

  /* ── detail 折叠 ── */
  function measureDetail() {
    const wrap = scroller.querySelector('.ap-detail-wrap')
    if (!wrap) return
    const body = wrap.querySelector('.ap-detail')
    const btn = wrap.querySelector('.ap-more')
    const lh = parseFloat(getComputedStyle(body).lineHeight) || 23.8
    // 只多出一两行时不折叠：为了藏一行而让用户多点一次不划算
    const over = body.scrollHeight > lh * (DETAIL_LINES + 2) + 4
    wrap.classList.toggle('is-clamped', over)
    btn.hidden = !over
  }

  /* ───────── 内容构造（§9.1 的 8 个区块） ───────── */
  function build(b) {
    const n = b.node
    const out = []

    // 1–2. 眉题 + 标题 + 关闭
    const head = h('header', 'ap-head')
    const eyebrow = h('div', 'ap-eyebrow')
    eyebrow.append(glyphCanvas(glyphSpec(b), 16))
    const eyeText = h('span')
    if (b.kind === 'star') {
      eyeText.append(h('span', null, '恒星'), sep(), h('span', 'ap-mono', 'mag ' + b.mag), sep(),
        h('span', null, constellationName(b.family)))
    } else if (b.kind === 'dso') {
      const st = CONJECTURE_STATUS[b.status]
      eyeText.append(h('span', null, '深空天体'), sep(), h('span', 'ap-status', st ? st.name : (b.status || '猜想')))
    } else {
      eyeText.append(h('span', null, '研究者'))
      if (n.institution) eyeText.append(sep(), h('span', 'ap-inst', n.institution))
    }
    eyebrow.append(eyeText)

    const titleRow = h('div', 'ap-title-row')
    const titles = h('div', 'ap-titles')
    const title = h('h2', 'ap-title', n.name || n.id)
    title.id = 'ap-title'
    titles.append(title)
    if (n.en && n.en !== n.name) titles.append(h('div', 'ap-en', n.en))
    const x = h('button', 'ap-close', '×')
    x.type = 'button'
    x.setAttribute('aria-label', '关闭')
    x.title = '关闭（Esc）'
    x.addEventListener('click', () => actions.deselect())
    titleRow.append(titles, x)
    head.append(eyebrow, titleRow)
    out.push(head)
    el.setAttribute('aria-labelledby', 'ap-title')

    // 3. 公式 / 研究方向
    if (b.kind === 'researcher') {
      if (n.focus) {
        const f = h('section', 'ap-focus')
        f.append(h('div', 'ap-label', '研究方向 · Focus'), h('p', 'ap-focus-text', n.focus))
        out.push(f)
      }
    } else if (n.latex) {
      const f = h('div', 'ap-formula')
      f.tabIndex = 0   // 可横向滚动的区域要能用键盘滚动
      f.setAttribute('aria-label', '公式')
      f.append(renderTex(b.id, n.latex))
      out.push(f)
    }

    // 4. 元数据
    out.push(buildMeta(b))

    // 5. 简介 + 正文
    if (n.summary) out.push(md('p', 'ap-summary', n.summary))
    if (n.detail) {
      const wrap = h('div', 'ap-detail-wrap')
      const body = md('p', 'ap-detail', n.detail)
      body.id = 'ap-detail-' + cssSafe(b.id)
      const more = h('button', 'ap-more', '展开全文')
      more.type = 'button'
      more.hidden = true
      more.setAttribute('aria-controls', body.id)
      more.setAttribute('aria-expanded', 'false')
      more.addEventListener('click', () => {
        const opened = wrap.classList.toggle('is-open')
        more.textContent = opened ? '收起' : '展开全文'
        more.setAttribute('aria-expanded', String(opened))
      })
      wrap.append(body, more)
      out.push(wrap)
    }

    // 6. 研究者代表作
    if (b.kind === 'researcher' && Array.isArray(n.representativeWorks) && n.representativeWorks.length) {
      const sec = h('section', 'ap-works')
      sec.append(h('h3', 'ap-section', '代表作 · Opera'))
      const ol = h('ol', 'ap-work-list')
      for (const w of n.representativeWorks) {
        const li = h('li', 'ap-work')
        const href = safeUrl(w.url)
        const t = href ? h('a', 'ap-work-title', w.title || href) : h('span', 'ap-work-title', w.title || '')
        if (href) { t.href = href; t.target = '_blank'; t.rel = 'noopener noreferrer' }
        const line = h('div', 'ap-work-line')
        line.append(t)
        if (w.year) line.append(h('span', 'ap-work-year', w.year))
        li.append(line)
        if (w.note) li.append(md('div', 'ap-work-note', w.note))
        ol.append(li)
      }
      sec.append(ol)
      out.push(sec)
    }

    // 7. 关联列表
    const rel = buildRelations(b)
    if (rel) out.push(rel)

    // 8. 页脚
    out.push(buildFooter(b))
    return out
  }

  function buildMeta(b) {
    const n = b.node
    const dl = h('dl', 'ap-meta')
    const row = (k, ...v) => {
      const dd = h('dd')
      dd.append(...v.map((x) => (typeof x === 'string' ? document.createTextNode(x) : x)))
      dl.append(h('dt', null, k), dd)
    }
    const latin = (f) => h('span', 'ap-latin', FAMILY_LATIN[f] || '')
    if (b.kind === 'star') {
      row('星座', constellationName(b.family) + ' ', latin(b.family))
      // 星等对应的重要度排位段：mag 1 = 前 5%，mag k = 前 MAG_CUTS[k-2]–MAG_CUTS[k-1]
      const hi = MAG_CUTS[b.mag - 1], lo = b.mag > 1 ? MAG_CUTS[b.mag - 2] : 0
      const pct = (v) => Math.round(v * 100)
      const band = hi == null ? '' : lo === 0 ? `　重要度前 ${pct(hi)}%` : `　重要度排位 ${pct(lo)}–${pct(hi)}%`
      row('星等', h('span', 'ap-mono', 'mag ' + b.mag), h('span', 'ap-dim', band))
      row('重要度', h('span', 'ap-mono', Number(n.importance ?? b.importance ?? 0).toFixed(2)))
      row('关联', h('span', 'ap-mono', String(n.degree ?? (state.focus ? state.focus.edges.length : 0))), ' 条')
    } else if (b.kind === 'dso') {
      const st = CONJECTURE_STATUS[b.status]
      const sv = h('span', 'ap-status-cell')
      sv.append(glyphCanvas({ kind: 'dso', status: b.status }, 14), h('span', 'ap-status', st ? st.name : (b.status || '')))
      if (st && st.hint) sv.append(h('span', 'ap-dim', ' · ' + st.hint))
      row('状态', sv)
      if (n.field) row('领域', CONJECTURE_FIELDS[n.field] ? CONJECTURE_FIELDS[n.field].name : String(n.field))
      if (n.proposer) row('提出者', n.proposer)
      if (n.year) row('年份', h('span', 'ap-mono', String(n.year)))
      if (b.family && FAMILIES[b.family]) row('所在星座', constellationName(b.family) + ' ', latin(b.family))
    } else {
      if (n.institution) row('机构', n.institution)
      if (n.field) row('领域', RESEARCHER_AREAS[n.field] ? RESEARCHER_AREAS[n.field].name : String(n.field))
      const nb = state.atlas.neighbours.get(b.id)
      if (nb && nb.length) row('关联', h('span', 'ap-mono', String(nb.length)), ' 个节点')
    }
    return dl
  }

  function buildRelations(b) {
    // 优先用 main 算好的 focus（与地图上的弧完全一致）；兜底从 atlas.neighbours 现算
    let edges = state.focus && state.focus.id === b.id ? state.focus.edges : null
    if (!edges) {
      edges = (state.atlas.neighbours.get(b.id) || []).map((nb) => ({
        other: nb.id, weight: nb.weight, type: nb.type, label: nb.label,
      }))
    }
    if (!edges.length) return null
    const groups = { star: [], dso: [], researcher: [] }
    for (const e of edges) {
      const o = state.atlas.bodies.get(e.other)
      if (o && groups[o.kind]) groups[o.kind].push({ e, o })
    }
    for (const k in groups) groups[k].sort((a, b2) => b2.e.weight - a.e.weight || (a.o.id < b2.o.id ? -1 : 1))

    const sec = h('section', 'ap-rel')
    sec.append(h('h3', 'ap-section', '关联 · Nexus'))
    const titles = { star: '定理', dso: '猜想', researcher: '研究者' }
    for (const k of ['star', 'dso', 'researcher']) {
      const list = groups[k]
      if (!list.length) continue
      const g = h('div', 'ap-group')
      const gh = h('h4', 'ap-group-title')
      gh.append(h('span', null, titles[k]), h('span', 'ap-count', String(list.length)))
      const ul = h('ul', 'ap-rel-list')
      list.forEach(({ e, o }, i) => {
        const li = h('li')
        if (i >= GROUP_LIMIT) li.hidden = true
        li.append(relItem(e, o))
        ul.append(li)
      })
      g.append(gh, ul)
      if (list.length > GROUP_LIMIT) {
        const more = h('button', 'ap-more ap-more-rel', `显示全部 ${list.length} 条`)
        more.type = 'button'
        more.addEventListener('click', () => {
          for (const li of ul.children) li.hidden = false
          more.remove()
        })
        g.append(more)
      }
      sec.append(g)
    }
    return sec
  }

  function relItem(e, o) {
    const btn = h('button', 'ap-rel-item')
    btn.type = 'button'
    btn.dataset.id = o.id
    btn.dataset.kind = o.kind
    const name = o.node.name || o.id
    const tl = typeLabel(e.type)
    btn.setAttribute('aria-label', `${name}，${tl}${e.label ? '：' + e.label : ''}`)
    const top = h('span', 'ap-rel-top')
    top.append(glyphCanvas(glyphSpec(o), 16), h('span', 'ap-rel-name', name), h('span', 'ap-tag', tl))
    btn.append(top)
    if (e.label) {
      const lab = md('span', 'ap-rel-label', e.label)
      btn.title = e.label
      btn.append(lab)
    }
    btn.addEventListener('pointerenter', () => setPreview(o.id))
    btn.addEventListener('pointerleave', clearPreview)
    btn.addEventListener('focus', () => setPreview(o.id))
    btn.addEventListener('blur', clearPreview)
    // <button> 的 click 同时覆盖鼠标、触屏与键盘 Enter / Space
    btn.addEventListener('click', () => { clearPreview(); actions.select(o.id) })
    return btn
  }

  function buildFooter(b) {
    const f = h('footer', 'ap-foot')
    const a = h('a', 'ap-link', '在原星云中打开 ↗')
    a.href = nebulaLink(b.id)
    a.target = '_blank'
    a.rel = 'noopener noreferrer'
    const copy = h('button', 'ap-link ap-copy', '复制此视图链接')
    copy.type = 'button'
    const note = h('span', 'ap-copied')
    note.setAttribute('role', 'status')
    let timer = 0
    copy.addEventListener('click', async () => {
      const ok = await copyText(location.href)
      note.textContent = ok ? '已复制' : '复制失败，请从地址栏复制'
      clearTimeout(timer)
      timer = setTimeout(() => { note.textContent = '' }, 1800)
    })
    f.append(a, copy, note, h('div', 'ap-id', b.id))
    return f
  }
}

function sep() { return h('span', 'ap-sep', '·') }
const cssSafe = (s) => String(s).replace(/[^\w-]/g, '_')

async function copyText(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) { await navigator.clipboard.writeText(text); return true }
  } catch { /* 落到下面的兜底 */ }
  try {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.setAttribute('readonly', '')
    ta.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0'
    document.body.append(ta)
    ta.select()
    const ok = document.execCommand('copy')
    ta.remove()
    return ok
  } catch { return false }
}
