/**
 * designs/manuscript/main.js — 入口与编排：启动流程、actions、帧循环、深链、window.__design（SPEC §8）。
 *
 * 启动顺序（SPEC §8.1）：
 *   graph → mountUI → 等系统字体（≤800ms）→ computeDims（进度）→ buildLayout → checkLayout
 *   → initRenderer + resize → attachInput → setCam(fitAll()) → 解析 hash → rAF 循环
 *   → 等首帧且视口内公式都已烘焙（≤2500ms）→ hideLoading / ready → 空闲 prewarm
 *
 * 取舍：
 *   · actions 是唯一改交互状态（选中 / 悬停 / 检索 / 面板 / 开关）的入口；ui、input、hash、__design 全走它，
 *     所以键盘、深链、评审脚本改了状态，界面同样跟上（ui 只听 bus）。
 *   · 帧循环"按需重画"：state.dirty、相机在动、或视口内公式还没烘焙到目标精度时才画；静止时不耗 CPU。
 *   · 深链用 replaceState（不污染浏览历史），防抖 400ms，相机飞行中不写（否则地址栏每帧闪）。
 */
import { getGraph, parseQuery } from '../shared/kb.js'
import { state, bus, requestDraw, visibleRect, w2s } from './state.js'
import { CHROME, FONTS, lodLevel } from './constants.js'
import { computeDims, prewarm } from './formulas.js'
import { buildLayout, checkLayout } from './layout.js'
import { initRenderer, resizeRenderer, draw, renderStats, isLegible } from './render.js'
import { mountUI } from './ui.js'
import {
  fitAll, fitRect, flyTo, setCam, stepCamera, isMoving, readingZoom, refreshFit,
  shiftView, targetView, minZoom,
} from './camera.js'
import { attachInput } from './input.js'
import { parseHash, encodeHash } from './hash.js'

const canvas = document.getElementById('page')
let ui = null
const phases = {}   // 启动各阶段耗时（ms），挂在 __design.bootPhases 方便诊断首屏

/* ───────── 文字量宽：layout 与 render 共用同一套 font 字符串（constants.fontCss） ───────── */
const measureCtx = document.createElement('canvas').getContext('2d')
const measureCache = new Map()
const measureStat = { calls: 0, misses: 0, ms: 0 }
let measureFont = ''
/* 取舍：layout 的填充系数二分会用很多不同字号量同一段文字；canvas 的字宽与字号成正比（无 hinting），
 * 所以统一在参考字号 MEASURE_REF 下量、再按比例缩放 —— 同一文字只量一次。实测把 ~3900 次 measureText
 * （每次约 0.9ms：字体串解析 + 汉字回退字体查找）降到每个不同文字一次。render 画字时本来就按 size·z 缩放，
 * 与这里的线性假设一致。 */
const MEASURE_REF = 100
const FONT_RE = /^(\S+) (\S+) ([\d.]+)px (.*)$/
function measure(font, text) {
  measureStat.calls++
  const s = String(text)
  const m = FONT_RE.exec(font)
  const size = m ? Number(m[3]) : 0
  const refFont = m && size > 0 ? `${m[1]} ${m[2]} ${MEASURE_REF}px ${m[4]}` : font
  const k = refFont + '|' + s
  let w = measureCache.get(k)
  if (w === undefined) {
    const t = performance.now()
    if (refFont !== measureFont) { measureCtx.font = refFont; measureFont = refFont }   // 设 font 很贵（要解析字体串）
    w = measureCtx.measureText(s).width
    measureCache.set(k, w)
    measureStat.misses++
    measureStat.ms += performance.now() - t
  }
  return m && size > 0 ? (w * size) / MEASURE_REF : w
}

/* ───────── 检索排序 ─────────
 * parseQuery 只给谓词。排序：名称完全相同 > 名称前缀 > importance 降序（同分按 id，确定性）。
 * "名称"只看裸词（不带 field: 的词）；纯字段查询（status:open）就只按 importance 排。 */
function bareTerms(q) {
  const out = []
  const re = /"((?:[^"\\]|\\.)*)"|(\S+)/g
  let m
  while ((m = re.exec(q))) {
    if (m[1] !== undefined) { if (m.index > 0 && q[m.index - 1] === ':') continue; out.push(m[1]); continue }
    let t = m[2]
    if (t === 'OR' || t.startsWith('-')) continue
    t = t.replace(/^\(+|\)+$/g, '')
    if (!t || t.includes(':') || t === '*') continue
    out.push(t)
  }
  return out.map((t) => t.toLowerCase())
}
function nameScore(n, terms) {
  if (!terms.length) return 0
  const names = [n.name, n.en, n.id].filter(Boolean).map((s) => String(s).toLowerCase())
  let best = 0
  for (const t of terms) {
    for (const s of names) {
      if (s === t) return 2
      if (s.startsWith(t)) best = 1
    }
  }
  return best
}

/* ───────── 条目取景 ───────── */
function boxCenter(it) { return { x: it.box.x + it.box.w / 2, y: it.box.y + it.box.h / 2 } }

/** 条目屏幕框是否完整落在可见区内（四周留 inset） */
function onScreen(it, inset = 24) {
  const r = visibleRect()
  const z = state.cam.z
  const [x, y] = w2s(it.box.x, it.box.y)
  return x >= r.x + inset && y >= r.y + inset && x + it.box.w * z <= r.x + r.w - inset && y + it.box.h * z <= r.y + r.h - inset
}

/** 该条目的阅读 zoom：readingZoom，但条目本身比可见区还大时缩到装得下 */
function itemZoom(it) {
  const r = visibleRect()
  let z = readingZoom(it)
  z = Math.min(z, (r.w - 96) / Math.max(1, it.box.w), (r.h - 96) / Math.max(1, it.box.h))
  return Math.max(minZoom(), z)
}

/**
 * 把条目带进视野。
 *   mode 'item'：居中到阅读字号；force=false 时尽量少动——已在屏内且字号够就不动，字号合适只平移。
 *   mode 'neighbourhood'：框住它与全部一跳关联项（zoom 不超过阅读字号）。
 */
function frameItem(id, { mode = 'item', animate = true, force = false } = {}) {
  const L = state.layout
  const it = L.byId.get(id)
  if (!it) return Promise.resolve()
  let v
  if (mode === 'neighbourhood') {
    const node = state.graph.byId.get(id)
    let x0 = it.box.x, y0 = it.box.y, x1 = it.box.x + it.box.w, y1 = it.box.y + it.box.h
    for (const l of node.linkIds || []) {
      const o = L.byId.get(l.source === id ? l.target : l.source)
      if (!o) continue
      x0 = Math.min(x0, o.box.x); y0 = Math.min(y0, o.box.y)
      x1 = Math.max(x1, o.box.x + o.box.w); y1 = Math.max(y1, o.box.y + o.box.h)
    }
    v = fitRect({ x: x0, y: y0, w: x1 - x0, h: y1 - y0 }, 60)
    v.z = Math.min(v.z, itemZoom(it))
  } else {
    const zr = itemZoom(it)
    let z = zr
    if (!force) {
      const zc = state.cam.z
      const okZoom = zc >= zr * 0.85 && zc <= Math.max(zr * 2.5, zr + 0.01)
      if (okZoom && onScreen(it)) return Promise.resolve()
      if (okZoom) z = zc
    }
    v = { ...boxCenter(it), z }
  }
  if (animate) return flyTo(v)
  setCam(v)
  return Promise.resolve()
}

/** 只平移（保持 zoom），让条目完整可见——单击选中后注释页滑出，若条目被盖住就挪出来 */
function ensureVisible(id) {
  const it = state.layout.byId.get(id)
  if (!it || onScreen(it, 12)) return
  const r = visibleRect()
  const z = state.cam.z
  const [x, y] = w2s(it.box.x, it.box.y)
  const w = it.box.w * z, h = it.box.h * z
  let dx = 0, dy = 0
  if (w > r.w - 24) dx = x + w / 2 - (r.x + r.w / 2)
  else if (x + w > r.x + r.w - 12) dx = x + w - (r.x + r.w - 24)
  else if (x < r.x + 12) dx = x - (r.x + 24)
  if (h > r.h - 24) dy = y + h / 2 - (r.y + r.h / 2)
  else if (y + h > r.y + r.h - 12) dy = y + h - (r.y + r.h - 24)
  else if (y < r.y + 12) dy = y - (r.y + 24)
  const c = targetView()
  flyTo({ x: c.x + dx / z, y: c.y + dy / z, z: c.z }, 280)
}

/** 当前视图中心所在页（不在任何页上时取最近的一页） */
function currentPageIndex() {
  const pages = state.layout.pages
  const { x, y } = targetView()
  let best = 0, bd = Infinity
  for (const p of pages) {
    const dx = Math.max(p.x - x, 0, x - (p.x + p.w)), dy = Math.max(p.y - y, 0, y - (p.y + p.h))
    const d = dx * dx + dy * dy
    if (d < bd) { bd = d; best = p.index }
  }
  return best
}

function resolvePage(k) {
  const pages = state.layout.pages
  if (k === null || k === undefined) return null
  if (typeof k === 'object' && k && 'key' in k) k = k.key
  if (typeof k === 'number' || (typeof k === 'string' && /^\d+$/.test(k))) {
    const i = Number(k)
    return pages.find((p) => p.chapter === i) || null
  }
  return pages.find((p) => p.key === k) || null
}

/* ───────── actions：唯一允许改 selection / hover / search / panel / 开关的地方（SPEC §8.2） ───────── */
export const actions = {
  /** 选中。opts：fly（默认 true，把它带进视野）、frame 'item'|'neighbourhood'、animate（默认 true）、force（强制居中到阅读字号） */
  select(id, opts = {}) {
    const { fly = true, frame = 'item', animate = true, force = false } = opts || {}
    if (typeof id !== 'string' || !state.graph || !state.layout) return false
    if (!state.graph.byId.has(id) || !state.layout.byId.has(id)) return false
    const prev = state.selectedId
    state.selectedId = id
    setPanelOpen(true)   // 先开面板：之后的取景按"扣掉面板"的可见区算
    if (prev !== id) bus.emit('select', { id, prev })
    if (fly) frameItem(id, { mode: frame, animate, force })
    else ensureVisible(id)
    scheduleHash(); requestDraw()
    return true
  },
  deselect() {
    if (!state.selectedId) return
    const prev = state.selectedId
    state.selectedId = null
    setPanelOpen(false)
    bus.emit('select', { id: null, prev })
    scheduleHash(); requestDraw()
  },
  /** 检索（parseQuery 语法；裸词匹配 name/en/id/latex）。空查询返回 []。 */
  search(q) {
    const query = typeof q === 'string' ? q : String(q ?? '')
    let hits = [], error = null
    if (query.trim() && state.graph) {
      const pq = parseQuery(query)
      error = pq.error || null
      if (!error) {
        const terms = bareTerms(query)
        const L = state.layout
        hits = state.graph.nodes
          .filter((n) => (!L || L.byId.has(n.id)) && pq.test(n))
          .map((n) => ({ n, s: nameScore(n, terms) }))
          .sort((a, b) => b.s - a.s || b.n.importance - a.n.importance || (a.n.id < b.n.id ? -1 : a.n.id > b.n.id ? 1 : 0))
          .map((o) => o.n.id)
      }
    }
    state.query = query.trim() ? query : ''
    state.hits = hits
    state.hitSet = new Set(hits)
    bus.emit('search', { query: state.query, hits, error })
    scheduleHash(); requestDraw()
    return hits
  },
  /** 选中 + 飞过去 + 一次朱墨涟漪（检索回车、目录、注释页关联项、双击用） */
  locate(id, opts = {}) {
    const ok = actions.select(id, { fly: true, animate: opts.animate !== false, force: !!opts.force })
    if (ok) {
      const t0 = performance.now()
      state.flash = { id, t0 }
      requestDraw()
      setTimeout(() => { if (state.flash && state.flash.t0 === t0) { state.flash = null; requestDraw() } }, 1000)
    }
    return ok
  },
  setView(v, { animate = false } = {}) {
    const to = { ...state.cam, ...(v || {}) }
    if (animate) return flyTo(to)
    setCam(to)
    return Promise.resolve()
  },
  fit(animate = true) {
    const v = fitAll()
    if (animate) return flyTo(v)
    setCam(v)
    return Promise.resolve()
  },
  /** 飞到某页的适配视图：章 key | 章下标（0–7）| 'front' | 'colophon' */
  gotoChapter(k, { animate = true } = {}) {
    if (!state.layout) return Promise.resolve()
    const page = resolvePage(k)
    if (!page) return Promise.resolve()
    const v = fitRect(page)
    if (animate) return flyTo(v)
    setCam(v)
    return Promise.resolve()
  },
  hover(id, sx = 0, sy = 0, source = 'canvas') {
    const nid = id && state.layout && state.layout.byId.has(id) ? id : null
    // 画布发来的"离开"不清掉注释页正在悬停的关联项（两个来源各管各的）
    const ignore = !nid && state.hoverSource && state.hoverSource !== source
    if (!ignore && (nid !== state.hoverId || (nid ? source : null) !== state.hoverSource)) {
      state.hoverId = nid
      state.hoverSource = nid ? source : null
      requestDraw()
    }
    bus.emit('hover', { id: nid, sx, sy, legible: nid ? isLegible(nid) : false, source })
  },
  /** Esc 三段式：有选中 → 取消选中；否则有查询 → 清空查询；否则 → 全卷 */
  escape() {
    if (state.selectedId) actions.deselect()
    else if (state.query) { actions.search(''); ui?.setSearchBox('') }
    else return actions.fit()
    return Promise.resolve()
  },
  focusSearch() { ui?.focusSearch() },
  toggleAmbient(on) {
    state.showAmbient = typeof on === 'boolean' ? on : !state.showAmbient
    bus.emit('chrome', { panelOpen: state.panelOpen })
    requestDraw()
  },
  toggleLegend(on) {
    state.showLegend = typeof on === 'boolean' ? on : !state.showLegend
    bus.emit('chrome', { panelOpen: state.panelOpen })
    requestDraw()
  },
  /** 按 layout.order 选中上 / 下一句并飞过去。未选中时从当前页的第一句（delta>0）或最后一句开始。 */
  step(delta = 1) {
    const order = state.layout?.order
    if (!order || !order.length) return false
    const d = delta < 0 ? -1 : 1
    let j
    const i = state.selectedId ? order.indexOf(state.selectedId) : -1
    if (i >= 0) j = (i + d + order.length) % order.length
    else {
      const pi = currentPageIndex()
      const onPage = order.filter((id) => state.layout.byId.get(id)?.page === pi)
      const pool = onPage.length ? onPage : order
      j = order.indexOf(d > 0 ? pool[0] : pool[pool.length - 1])
    }
    return actions.select(order[j], { fly: true })
  },
  /** 上 / 下一页（以当前视图中心所在页为基准；到卷首 / 卷末就停） */
  stepChapter(delta = 1) {
    if (!state.layout) return Promise.resolve()
    const pages = state.layout.pages
    const i = currentPageIndex()
    const j = Math.max(0, Math.min(pages.length - 1, i + (delta < 0 ? -1 : 1)))
    const p = pages[j]
    const v = fitRect(p)
    // 已经在这一页的适配视图了（卷首 / 卷末再按）就不动
    if (j === i && Math.abs(v.z - state.cam.z) / v.z < 0.02 && Math.hypot(v.x - state.cam.x, v.y - state.cam.y) * v.z < 4) return Promise.resolve()
    return flyTo(v)
  },
  /** 以可见区中心缩放（短动画；连按在飞行目标上累乘） */
  zoomBy(factor) {
    if (!(factor > 0)) return Promise.resolve()
    const c = targetView()
    return flyTo({ x: c.x, y: c.y, z: c.z * factor }, 180)
  },
  async copyLink() {
    flushHash()
    const url = location.href
    // Assigned on every path below; the `= false` initialiser was dead.
    let ok
    try { await navigator.clipboard.writeText(url); ok = true } catch {
      try {
        const ta = document.createElement('textarea')
        ta.value = url; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0'
        document.body.append(ta); ta.select(); ok = document.execCommand('copy'); ta.remove()
      } catch { ok = false }
    }
    ui?.toast(ok ? '已复制链接' : '复制失败，请手动复制地址栏')
    return ok
  },
}

/**
 * 打开 / 关闭注释页。可见区中心随之左移 / 右移 PANEL/2 屏幕 px，所以相机中心反向补偿 PANEL/2/z，
 * 画面内容在屏幕上不跳（打开：cam.x −= PANEL/2/z；关闭：+=）。正在飞行时起止点一起补偿。
 */
export function setPanelOpen(open) {
  open = !!open
  if (state.panelOpen === open) return
  const dx = CHROME.PANEL / 2 / state.cam.z
  shiftView(open ? -dx : dx)
  state.panelOpen = open
  refreshFit()
  bus.emit('chrome', { panelOpen: open })
  requestDraw()
}

/* ───────── 深链 ───────── */
let hashTimer = 0
let lastWritten = null
function currentHash() {
  return encodeHash({ id: state.selectedId, query: state.query, view: state.selectedId ? null : state.cam })
}
function writeHash() {
  const h = currentHash()
  const cur = location.hash.replace(/^#/, '')
  lastWritten = h
  if (h === cur) return
  try { history.replaceState(history.state, '', h ? `#${h}` : location.pathname + location.search) } catch { /* 沙箱里可能不允许 */ }
}
function scheduleHash() {
  if (!state.ready) return
  clearTimeout(hashTimer)
  hashTimer = setTimeout(function tick() {
    if (isMoving()) { hashTimer = setTimeout(tick, 120); return }   // 飞行中不写
    writeHash()
  }, 400)
}
function flushHash() { clearTimeout(hashTimer); if (state.ready) writeHash() }

const hashOpts = () => ({ has: (id) => !!state.layout?.byId.has(id) })

/** 应用一条深链。initial=true 用于载入：有 n 直接放到阅读视图；有 v 无 n 直接 setCam；都没有 fitAll。 */
function applyHash(raw, { animate = false, initial = false } = {}) {
  const h = parseHash(raw, hashOpts())
  if (h.query !== state.query) { actions.search(h.query); ui?.setSearchBox(h.query) }
  if (h.id) {
    if (h.id !== state.selectedId || initial) actions.select(h.id, { fly: true, animate, force: true })
  } else {
    if (state.selectedId) actions.deselect()
    if (h.view) { if (animate) flyTo(h.view); else setCam(h.view) }
    else if (initial) setCam(fitAll())
  }
  return h
}
function onHashChange() {
  const raw = location.hash.replace(/^#/, '')
  if (raw === lastWritten) return     // 自己写的（replaceState 不触发 hashchange，这里是保险）
  lastWritten = raw
  applyHash(raw, { animate: true })
}

/* ───────── 帧循环 ───────── */
let lastViewKey = ''
const frameTimes = []          // 最近绘制帧的时间戳（算 fps）
let pendingSince = 0         // 因"视口内公式未烘焙完"而持续重画的起点；超过 4s 不再为此空转
let drawErrors = 0
let lastFrameMs = 0

function frame(now = performance.now()) {
  state.dirty = false
  try { draw() } catch (e) {
    if (drawErrors++ < 3) console.error('[render] draw() 抛出异常', e)
  }
  lastFrameMs = now
  frameTimes.push(now)
  if (frameTimes.length > 90) frameTimes.shift()
  const c = state.cam
  const key = `${c.x},${c.y},${c.z},${state.vw},${state.vh},${state.panelOpen}`
  if (key !== lastViewKey) {
    lastViewKey = key
    bus.emit('view', { x: c.x, y: c.y, z: c.z, level: lodLevel(c.z).id })
    if (!isMoving()) scheduleHash()
  }
}

function loop(now) {
  requestAnimationFrame(loop)   // 先排下一帧：本帧任何异常都不会让循环停掉
  const moving = stepCamera(now)
  const s = renderStats() || {}
  const bm = s.bitmaps || {}
  const waiting = (bm.pending > 0) || (s.pendingVisible > 0)
  if (waiting) { if (!pendingSince) pendingSince = now } else pendingSince = 0
  const stillWaiting = waiting && now - pendingSince < 4000
  if (state.dirty || moving || stillWaiting) {
    if (state.dirty || moving) pendingSince = waiting ? now : 0
    frame(now)
  }
}

/** 交互帧率：最近 1s 内绘制帧的平均间隔。静止（1s 没画）时保留上一次的读数。 */
function measureFps() {
  const now = performance.now()
  const ts = frameTimes.filter((t) => now - t < 1000)
  if (ts.length >= 2) state.fps = Math.round(((ts.length - 1) * 1000) / (ts[ts.length - 1] - ts[0]))
  return state.fps
}
setInterval(measureFps, 250)

function resize() {
  const oldFit = state.fitZoom
  const wasFit = state.layout && Math.abs(state.cam.z - oldFit) / oldFit < 0.02
  state.vw = Math.max(1, window.innerWidth)
  state.vh = Math.max(1, window.innerHeight)
  state.dpr = Math.min(2, window.devicePixelRatio || 1)
  resizeRenderer(state.vw, state.vh, state.dpr)
  if (state.layout) {
    if (wasFit) setCam(fitAll())
    else { refreshFit(); setCam(state.cam) }
  }
  requestDraw()
}

/* ───────── 启动 ───────── */
async function boot() {
  const t0 = performance.now()
  const mark = (k) => { phases[k] = Math.round(performance.now() - t0) }
  state.graph = getGraph()
  mark('graph')
  ui = mountUI(document.getElementById('ui'), actions)
  ui.setProgress('展卷', 0.02)

  /* ── 版面容量上限 ──
   *
   * 这本"手稿"的设计是**一册可读的书**：8 章对应 8 个知识族。它最初的基线
   * 是 488 个条目（README: "items 488 ... missing 0, overlaps 0, outOfPage 0"）。
   *
   * 后来知识库长到 4306 个节点，而 buildLayout 没有任何容量上限，于是它
   * 试图把全部 4306 个条目塞进固定页数。实测：
   *     outOfPage 2133   一半条目被排到纸面之外
   *     overlaps    50   文字互相压住
   * 页面上一堆文字糊在页边外。
   *
   * 一本书本来也不该收录整个数据库，它收的是**重要的那些**。这里按
   * importance 取前 N 个，并保证每个族至少留若干代表，避免小族被整体挤掉。
   * 未入选的节点仍可通过搜索定位。
   */
  const MANUSCRIPT_MAX_ENTRIES = 300

  function fitGraphToBook(graph) {
    const all = graph.nodes || []
    if (all.length <= MANUSCRIPT_MAX_ENTRIES) return graph

    const byImp = [...all].sort((a, b) => (b.importance ?? 0) - (a.importance ?? 0))
    const keep = new Set(byImp.slice(0, MANUSCRIPT_MAX_ENTRIES).map((n) => n.id))

    const perFamily = new Map()
    for (const n of all) {
      const f = n.family ?? 'unknown'
      if (!perFamily.has(f)) perFamily.set(f, [])
      perFamily.get(f).push(n)
    }
    for (const [, members] of perFamily) {
      const already = members.filter((n) => keep.has(n.id)).length
      const want = Math.min(members.length, Math.max(already, 12))
      if (already >= want) continue
      const extra = members
        .filter((n) => !keep.has(n.id))
        .sort((a, b) => (b.importance ?? 0) - (a.importance ?? 0))
        .slice(0, want - already)
      for (const n of extra) keep.add(n.id)
    }

    const nodes = all.filter((n) => keep.has(n.id))
    const links = (graph.links || []).filter((l) => {
      const s = l.source?.id ?? l.source
      const t = l.target?.id ?? l.target
      return keep.has(s) && keep.has(t)
    })
    return { ...graph, nodes, links }
  }

  const bookGraph = fitGraphToBook(state.graph)
  mark('fit')

  // 系统字体也要等：canvas 量宽时若字体未就绪，会按回退字体量，排版就错了
  try {
    await Promise.race([
      Promise.all(['serif', 'hand', 'italic'].map((k) => document.fonts.load(`16px ${FONTS[k]}`, '公式诗稿Aa?½✓'))),
      new Promise((r) => setTimeout(r, 800)),
    ])
  } catch { /* 字体加载失败就用回退字体 */ }
  mark('fonts')

  /* ?nocache：跳过 formulas-cache.json，全部由 worker 现排。
   * 这是 README「缓存去留」一节的复现开关（有缓存 vs 无缓存的 bootMs 对比），
   * 也是缓存过期时的应急手段：加这个参数页面照常可用，只是首屏慢。 */
  const noCache = new URLSearchParams(location.search).has('nocache')
  state.dims = await computeDims(bookGraph.nodes, (done, total) => {
    ui.setProgress('量取公式', 0.05 + 0.75 * (done / Math.max(1, total)))
    bus.emit('progress', { phase: 'dims', done, total })
  }, noCache ? { shipped: false } : {})
  mark('dims')
  ui.setProgress('排版', 0.82)
  bus.emit('progress', { phase: 'layout', done: 0, total: 1 })
  state.layout = buildLayout(bookGraph, state.dims, measure)
  mark('layout')
  phases.measure = { ...measureStat, ms: Math.round(measureStat.ms) }
  let check
  // The self-check must be given the SAME graph the layout was built from.
  // Passing state.graph (all 4306 nodes) made it report every node that is
  // legitimately not in the book as "missing" — 3758 false positives that
  // buried the real signal.
  try { check = checkLayout(state.layout, bookGraph) } catch (e) { check = { missing: [], overlaps: [], outOfPage: [], error: String(e) } }
  window.__design.layoutCheck = check
  if (check.missing?.length || check.overlaps?.length || check.outOfPage?.length || check.error) {
    console.warn('[layout] 自检未通过', { missing: check.missing?.length, overlaps: check.overlaps?.length, outOfPage: check.outOfPage?.length, error: check.error })
  }
  mark('check')
  bus.emit('progress', { phase: 'layout', done: 1, total: 1 })

  initRenderer(canvas)
  resize()
  window.addEventListener('resize', resize)
  attachInput(canvas, actions)

  setCam(fitAll())
  applyHash(location.hash, { initial: true })
  lastWritten = location.hash.replace(/^#/, '')
  window.addEventListener('hashchange', onHashChange)
  mark('init')

  ui.setProgress('上墨', 0.9)
  requestAnimationFrame(loop)
  await waitFirstPaint(Math.min(2500, Math.max(400, 2850 - (performance.now() - t0))))
  mark('firstPaint')
  ui.hideLoading()
  state.ready = true
  window.__design.ready = true
  window.__design.bootMs = Math.round(performance.now() - t0)
  window.__design.bootFromNav = Math.round(performance.now())   // 从导航开始（含模块加载）
  bus.emit('ready', {})
  requestDraw()
  scheduleHash()
  // 首屏之后空闲预烘焙其余公式的最小 mip，平移时不再出现灰条闪烁
  const idle = window.requestIdleCallback || ((f) => setTimeout(f, 200))
  idle(() => { try { prewarm(state.layout.order) } catch (e) { console.warn('[prewarm]', e) } })
}

/** 等首帧画出，且视口内需要可读的公式都已烘焙（或超时）。 */
function waitFirstPaint(timeoutMs) {
  const t0 = performance.now()
  const f0 = frameTimes.length ? frameTimes[frameTimes.length - 1] : -1
  return new Promise((resolve) => {
    const tick = () => {
      const s = renderStats() || {}
      const painted = lastFrameMs > f0 && lastFrameMs > t0 - 1
      if ((painted && !(s.pendingVisible > 0)) || performance.now() - t0 > timeoutMs) resolve()
      else { requestDraw(); setTimeout(tick, 30) }
    }
    tick()
  })
}

/* ───────── 调试 / 评审句柄（SPEC §8.6） ───────── */
function viewSnapshot() {
  const c = state.cam
  return {
    x: c.x, y: c.y, z: c.z,
    level: lodLevel(c.z).id, fitZoom: state.fitZoom,
    selected: state.selectedId, query: state.query, hits: state.hits.length,
    panelOpen: state.panelOpen, visibleRect: visibleRect(),
  }
}

/* moduleEvalNav：本模块求值到这一行为止的 performance.now()（相对导航开始）。
 * 为什么记它：深链 reload 后，验收器在 reload 返回 + 800ms 就要读 __design；
 * 这个数给出"__design 最早何时存在"，用来判断 __design is not defined 是不是加载竞态。 */
phases.moduleEvalNav = Math.round(performance.now())

window.__design = {
  ready: false,
  get graph() { return state.graph },
  get layout() { return state.layout },
  state,
  actions,
  bootMs: null,
  bootPhases: phases,
  layoutCheck: null,
  /** 无动画：选中并放到阅读视图（居中，公式屏幕 em ≈ READ_EM_PX）。返回是否成功。 */
  select: (id) => actions.select(id, { fly: true, animate: false, force: true }),
  deselect: () => actions.deselect(),
  search: (q) => actions.search(q),
  view: viewSnapshot,
  /** v = {x,y,z}（部分字段可省）| {id} | {chapter: key|index} | {fit:true}；默认无动画，{animate:true} 时 await 动画结束 */
  setView: async (v = {}) => {
    if (!state.layout) return viewSnapshot()
    const animate = !!(v && v.animate)
    if (v && typeof v.id === 'string') {
      const ok = actions.select(v.id, { fly: false })
      if (ok) await frameItem(v.id, { animate, force: true })
    } else if (v && v.chapter !== undefined && v.chapter !== null) {
      await actions.gotoChapter(v.chapter, { animate })
    } else if (v && v.fit) {
      await actions.fit(animate)
    } else {
      const p = {}
      for (const k of ['x', 'y', 'z']) if (typeof v[k] === 'number' && Number.isFinite(v[k])) p[k] = v[k]
      await actions.setView(p, { animate })
    }
    if (state.dirty) frame()
    return viewSnapshot()
  },
  /** 最近一帧的统计；若状态已变但还没画，先同步画一帧，保证读数对应当前视图 */
  stats: () => {
    if (state.layout && state.dirty) frame()
    const s = renderStats() || {}
    return {
      visibleLabels: s.visibleLabels, overlappingLabels: s.overlappingLabels,
      fps: measureFps(), z: state.cam.z, level: lodLevel(state.cam.z).id,
      drawMs: s.drawMs, pendingVisible: s.pendingVisible, drawnItems: s.drawnItems,
      threads: s.threads, arcs: s.arcs, links: s.links, bitmaps: s.bitmaps,
      legibleFormulas: s.legibleFormulas, overlapPairs: s.overlapPairs,
    }
  },
}

boot().catch((e) => {
  console.error('[boot] 启动失败', e)
  ui?.setProgress('启动失败：' + (e && e.message), 0)
})

