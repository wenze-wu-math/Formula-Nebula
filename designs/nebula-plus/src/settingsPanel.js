/**
 * ═══════════════════════════════════════════════════════════════
 *  设置面板
 * ═══════════════════════════════════════════════════════════════
 *
 *  结构参考 Cohenjikan/shiyun 的 ui/SettingsMenu.tsx：
 *    · 可拖拽的标题栏（拖动标题移动整个面板）
 *    · 分组（set-group）+ 组标题（set-label）
 *    · 分段按钮（seg / seg-btn，用于形态这种枚举）
 *    · 滑块（range）+ 右侧数值
 *    · 复选开关（set-toggle）
 *    · 每组一个"恢复默认"，底部一个"全部恢复默认"
 *
 *  ── 面板上的顺序按"改动代价"排 ──
 *    形态      → 需要重排（最慢，放最上面，因为它是最主要的功能）
 *    参数      → 立刻生效
 *    显示层    → 立刻生效
 *    引力      → 立刻生效
 *  这样用户从上往下调，代价递减，不会调到最后才发现要重排。
 */

import { SHAPES, SHAPE_IDS, TWEAKABLE, GLYPH } from './config.js'
import { settings, DISPLAY, COLOR_MODES, COLOR_MODE_IDS } from './settings.js'
import { VIEWS } from './config.js'

/** 取景 id 的顺序。config 里 VIEWS 是对象，顺序即声明顺序 —— 显式取一次
 *  键列表，免得将来有人调整 config 里的书写顺序时面板上的按钮跟着换位置。 */
const VIEW_IDS = ['overview', 'galaxy', 'cluster']
import { FAMILIES } from '../../../src/data/knowledge.js'
import { buildEqualizedPalette } from '../../../src/palette.js'

/* 面板里的族色样本必须用**均衡之后**的颜色，
 * 否则样本上的紫和画面里的紫不是同一个，用户会以为没生效。 */
const FAMILY_UI_COLOR = (() => {
  const raw = {}
  for (const [k, def] of Object.entries(FAMILIES)) raw[k] = def.color
  const eq = buildEqualizedPalette(raw, GLYPH.familyLightness)
  const out = {}
  for (const [k, v] of Object.entries(eq)) out[k] = v.hex
  return out
})()

/** 小工具：建元素（与 ui.js 的 el() 同一套写法） */
function el(tag, attrs = {}, children = []) {
  const e = document.createElement(tag)
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') e.className = v
    else if (k === 'text') e.textContent = v
    else if (k === 'html') e.innerHTML = v
    else if (k.startsWith('on') && typeof v === 'function') {
      e.addEventListener(k.slice(2).toLowerCase(), v)
    } else if (v !== null && v !== undefined && v !== false) {
      e.setAttribute(k, v === true ? '' : String(v))
    }
  }
  for (const c of [].concat(children)) {
    if (c === null || c === undefined || c === false) continue
    e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c)
  }
  return e
}

const CSS = `
#settings, #st-open{
  box-sizing:border-box;
  --panel:rgba(12,17,29,.86);
  --line:rgba(148,178,220,.20);
  --ink:#f5f8ff;
  --dim:#94a8c4;
  --mute:#c5d2e6;
  --accent:#ffcf7a;
  --cyan:#78d7ff;
  --coral:#ff9b7f;
  --violet:#c9aeff;
}

#settings{
  position:fixed; z-index:30; width:308px; max-height:calc(100vh - 96px);
  display:flex; flex-direction:column;
  background:var(--panel); border:1px solid var(--line); border-radius:8px;
  backdrop-filter:blur(16px); -webkit-backdrop-filter:blur(16px);
  box-shadow:0 16px 42px rgba(3,8,18,.46), inset 0 1px 0 rgba(245,248,255,.04);
  transform:translateX(-8px); opacity:0; pointer-events:none;
  transition:opacity .18s ease, transform .18s ease;
}
#settings.on{ opacity:1; transform:none; pointer-events:auto }

#settings *{ box-sizing:border-box }
#settings button{
  font-family:inherit; line-height:1.2; touch-action:manipulation;
}
#settings button:focus-visible,
#settings input:focus-visible{
  outline:none;
  box-shadow:0 0 0 2px rgba(120,215,255,.26), 0 0 0 4px rgba(120,215,255,.10);
}

#settings .st-head{
  display:flex; align-items:center; justify-content:space-between;
  min-height:42px; padding:8px 12px 8px 16px; border-bottom:1px solid var(--line);
  font-size:12px; letter-spacing:.10em; color:var(--ink);
  cursor:grab; user-select:none; flex:none;
}
#settings .st-head:active{ cursor:grabbing }
#settings .st-head .st-close{
  width:26px; height:26px; margin-left:8px; flex:none;
  display:flex; align-items:center; justify-content:center;
  background:rgba(148,178,220,.08); border:1px solid rgba(148,178,220,.16);
  color:var(--dim); font-size:15px; line-height:1; border-radius:6px;
  cursor:pointer; padding:0;
  transition:background .15s, color .15s, border-color .15s;
}
#settings .st-head .st-close:hover{
  color:var(--ink); background:rgba(148,178,220,.16); border-color:rgba(148,178,220,.30);
}

#settings .st-body{
  overflow-y:auto; overscroll-behavior:contain; padding:2px 0 10px;
  scrollbar-color:rgba(148,178,220,.28) transparent; scrollbar-width:thin;
}
#settings .st-body::-webkit-scrollbar{ width:8px }
#settings .st-body::-webkit-scrollbar-track{ background:transparent }
#settings .st-body::-webkit-scrollbar-thumb{
  background:rgba(148,178,220,.24); border-radius:999px;
  border:2px solid rgba(12,17,29,.35);
}
#settings .st-body::-webkit-scrollbar-thumb:hover{ background:rgba(148,178,220,.38) }

#settings .st-group{
  padding:13px 16px 15px; border-bottom:1px solid rgba(148,178,220,.12);
}
#settings .st-group:last-child{ border-bottom:none }
#settings .st-label{
  display:flex; align-items:center; gap:8px;
  font-size:11px; letter-spacing:.18em; color:var(--cyan);
  margin-bottom:10px; line-height:1.4;
}
#settings .st-label::before{
  content:""; width:3px; height:11px; border-radius:2px; flex:none;
  background:var(--accent); box-shadow:0 0 8px rgba(255,207,122,.5);
}
#settings .st-row{
  display:flex; align-items:center; gap:10px; margin:8px 0; min-height:28px;
}
#settings .st-sub{
  font-size:11px; color:var(--dim); flex:none; width:44px;
  overflow:hidden; text-overflow:ellipsis; white-space:nowrap;
}

#settings .st-seg{
  display:flex; gap:4px; flex:1; flex-wrap:wrap; padding:3px;
  background:rgba(6,10,19,.42); border:1px solid rgba(148,178,220,.16); border-radius:7px;
}
#settings .st-seg button{
  flex:1; min-width:54px; min-height:27px; padding:4px 7px; font-size:11px;
  background:transparent; border:1px solid transparent; border-radius:5px;
  color:var(--dim); cursor:pointer; white-space:nowrap;
  transition:background .15s, color .15s, border-color .15s, box-shadow .15s;
}
#settings .st-seg button:hover:not(:disabled){ color:var(--ink); background:rgba(148,178,220,.10) }
#settings .st-seg button.on{
  background:rgba(255,207,122,.15); border-color:rgba(255,207,122,.42); color:var(--ink);
  box-shadow:0 0 10px rgba(255,207,122,.08);
}
#settings .st-seg button:disabled{ opacity:.34; cursor:not-allowed }
#settings .st-seg button.on:disabled{
  opacity:.48; background:rgba(148,178,220,.10); border-color:rgba(148,178,220,.28);
  color:var(--mute); box-shadow:none;
}

#settings .st-fams{
  display:flex; flex-wrap:wrap; gap:4px 8px; margin-top:8px;
  transition:opacity .2s;
}
#settings .st-fam{
  display:flex; align-items:center; gap:6px; padding:4px 7px;
  background:rgba(148,178,220,.06); border:1px solid rgba(148,178,220,.14); border-radius:6px;
  font-size:10px; color:var(--dim); white-space:nowrap;
}
#settings .st-fam i{
  width:9px; height:9px; border-radius:50%; flex:none;
  border:1px solid rgba(245,248,255,.28);
  box-shadow:0 0 7px currentColor;
}

#settings input[type=range]{
  flex:1; min-width:0; height:16px; margin:0;
  -webkit-appearance:none; appearance:none; border-radius:8px;
  background:transparent; outline:none; cursor:pointer;
}
#settings input[type=range]::-webkit-slider-runnable-track{
  height:3px; border-radius:999px; background:rgba(148,178,220,.20);
}
#settings input[type=range]::-moz-range-track{
  height:3px; border-radius:999px; background:rgba(148,178,220,.20);
}
#settings input[type=range]::-moz-range-progress{
  height:3px; border-radius:999px; background:rgba(255,207,122,.46);
}
#settings input[type=range]::-webkit-slider-thumb{
  -webkit-appearance:none; width:12px; height:12px; margin-top:-4.5px; border-radius:50%;
  background:var(--accent); border:1px solid rgba(245,248,255,.24); cursor:pointer;
  box-shadow:0 0 8px rgba(255,207,122,.32), 0 1px 3px rgba(0,0,0,.4);
  transition:transform .12s, box-shadow .12s;
}
#settings input[type=range]::-moz-range-thumb{
  width:12px; height:12px; border-radius:50%;
  background:var(--accent); border:1px solid rgba(245,248,255,.24); cursor:pointer;
  box-shadow:0 0 8px rgba(255,207,122,.32), 0 1px 3px rgba(0,0,0,.4);
}
#settings input[type=range]:hover:not(:disabled)::-webkit-slider-thumb{ transform:scale(1.08) }
#settings input[type=range]:hover:not(:disabled)::-moz-range-thumb{ transform:scale(1.08) }
#settings input[type=range]:focus-visible::-webkit-slider-thumb{
  box-shadow:0 0 0 3px rgba(120,215,255,.22), 0 0 8px rgba(255,207,122,.32);
}
#settings input[type=range]:focus-visible::-moz-range-thumb{
  box-shadow:0 0 0 3px rgba(120,215,255,.22), 0 0 8px rgba(255,207,122,.32);
}
#settings input[type=range]:disabled{ opacity:.38; cursor:not-allowed }
#settings input[type=range]:disabled::-webkit-slider-thumb,
#settings input[type=range]:disabled::-moz-range-thumb{
  background:var(--mute); box-shadow:none;
}
#settings .st-val{
  width:54px; flex:none; text-align:right; white-space:nowrap;
  font-size:10.5px; color:var(--mute); font-variant-numeric:tabular-nums;
}

#settings .st-toggle{
  display:flex; align-items:flex-start; gap:9px; margin:9px 0;
  font-size:11.5px; color:var(--ink); cursor:pointer; line-height:1.45;
}
#settings .st-toggle input{
  flex:none; width:16px; height:16px; margin:2px 0 0;
  -webkit-appearance:none; appearance:none; border-radius:5px;
  background:rgba(148,178,220,.10); border:1px solid rgba(148,178,220,.34);
  background-position:center; background-repeat:no-repeat; background-size:10px 10px;
  accent-color:var(--accent); cursor:pointer;
  transition:background .18s, border-color .18s, box-shadow .18s;
}
#settings .st-toggle input:checked{
  background-color:rgba(255,207,122,.22);
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12'%3E%3Cpath d='M2.5 6.2 5 8.6 9.5 3.4' fill='none' stroke='%23ffcf7a' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  border-color:rgba(255,207,122,.62);
}
#settings .st-toggle input:disabled{ opacity:.35; cursor:not-allowed }
#settings .st-toggle small{ display:block; color:var(--dim); font-size:10px; margin-top:2px }

#settings .st-desc{
  font-size:10.5px; color:var(--dim); line-height:1.55; margin-top:8px;
  padding:7px 9px; background:rgba(148,178,220,.06); border-radius:6px;
  border-left:2px solid rgba(255,207,122,.44);
}
#settings .st-stats{
  margin-top:7px; font-size:10px; line-height:1.6; color:var(--dim);
  overflow-wrap:anywhere;
}

#settings .st-reset{
  width:100%; min-height:30px; margin-top:10px; padding:5px 8px; font-size:11px;
  background:rgba(148,178,220,.06); border:1px solid rgba(148,178,220,.18);
  color:var(--dim); border-radius:6px; cursor:pointer;
  transition:background .15s, color .15s, border-color .15s;
}
#settings .st-reset:hover:not(:disabled){
  color:var(--ink); background:rgba(148,178,220,.13); border-color:rgba(148,178,220,.30);
}
#settings .st-reset:disabled{ opacity:.30; cursor:not-allowed }
#settings .st-reset.wide{
  margin:12px 16px 2px; width:calc(100% - 32px); min-height:32px;
  background:rgba(255,159,127,.06); border-color:rgba(255,159,127,.20); color:var(--coral);
}
#settings .st-reset.wide:hover:not(:disabled){
  color:var(--ink); background:rgba(255,159,127,.14); border-color:rgba(255,159,127,.36);
}
#settings .st-reset.wide:disabled{
  color:var(--dim); background:rgba(148,178,220,.06); border-color:rgba(148,178,220,.18);
}

#st-open{
  position:fixed; z-index:20; top:29px; right:286px; width:84px; height:36px;
  box-sizing:border-box; display:flex; align-items:center; justify-content:center;
  padding:0 12px; font-family:inherit; font-size:11.5px; letter-spacing:.08em;
  background:rgba(12,17,29,.72); border:1px solid var(--line); color:var(--dim);
  border-radius:8px; cursor:pointer; white-space:nowrap;
  backdrop-filter:blur(12px); -webkit-backdrop-filter:blur(12px);
  box-shadow:0 8px 22px rgba(3,8,18,.28);
  transition:color .15s, border-color .15s, background .15s, box-shadow .15s;
}
#st-open:hover{
  color:var(--ink); background:rgba(148,178,220,.10); border-color:rgba(148,178,220,.34);
}
#st-open.on{
  color:var(--accent); background:rgba(255,207,122,.08); border-color:rgba(255,207,122,.46);
}
#st-open:focus-visible{
  outline:none;
  box-shadow:0 0 0 2px rgba(120,215,255,.28), 0 0 0 4px rgba(120,215,255,.10);
}

@media (max-width: 900px){
  #settings{ width:min(308px, calc(100vw - 20px)); max-height:calc(100vh - 96px) }
  #settings .st-group{ padding:12px 14px 14px }
  #settings .st-label{ margin-bottom:9px }
  #settings .st-reset.wide{ margin:11px 14px 2px; width:calc(100% - 28px) }
  #settings .st-seg button{ min-width:44px; padding:4px 6px }
  #settings .st-fams{ gap:4px 6px }
}
`

/**
 * 创建设置面板。
 * @param {{onShapeChange?: Function}} cb
 * @returns {{sync: Function, open: Function, close: Function, toggle: Function, el: HTMLElement}}
 */
export function createSettingsPanel(cb = {}) {
  const style = document.createElement('style')
  style.textContent = CSS
  document.head.appendChild(style)

  /* ─────────── 开关按钮 ─────────── */
  const openBtn = el('button', {
    id: 'st-open',
    title: '设置 · 形态 / 参数 / 显示',
    onclick: () => toggle(),
  }, ['设置'])

  /* ─────────── 面板骨架 ─────────── */
  const closeBtn = el('button', { class: 'st-close', title: '关闭', onclick: () => close() }, ['×'])
  const head = el('div', { class: 'st-head' }, [el('span', {}, ['设置']), closeBtn])
  const body = el('div', { class: 'st-body' })
  const panel = el('div', { id: 'settings' }, [head, body])

  document.body.append(openBtn, panel)

  /* ─────────── 拖动标题栏（仿 shiyun 的 drag） ─────────── */
  const initialX = Math.max(8, window.innerWidth - Math.min(308, window.innerWidth - 24) - 24)
  let pos = { x: initialX, y: 64 }
  let drag = null
  head.addEventListener('pointerdown', (e) => {
    drag = { ox: e.clientX - pos.x, oy: e.clientY - pos.y }
    head.setPointerCapture(e.pointerId)
  })
  head.addEventListener('pointermove', (e) => {
    if (!drag) return
    const edge = Math.max(4, window.innerWidth - panel.offsetWidth - 4)
    pos = {
      x: Math.max(4, Math.min(edge, e.clientX - drag.ox)),
      y: Math.max(4, Math.min(window.innerHeight - 40, e.clientY - drag.oy)),
    }
    place()
  })
  const endDrag = () => { drag = null }
  head.addEventListener('pointerup', endDrag)
  head.addEventListener('pointercancel', endDrag)

  function place() {
    panel.style.left = pos.x + 'px'
    panel.style.top = pos.y + 'px'
  }
  place()

  /* ═══════════ ① 形态 ═══════════ */
  const shapeButtons = new Map()
  const shapeDesc = el('div', { class: 'st-desc' })
  // data-seg 让测试能精确定位到"形态"这一组按钮，
  // 否则 panel 里 .st-seg button 会同时匹配到后面的着色按钮。
  const shapeSeg = el('div', { class: 'st-seg', 'data-seg': 'shape' })

  for (const id of SHAPE_IDS) {
    const b = el('button', {
      title: SHAPES[id].desc,
      onclick: () => {
        if (!settings.setShape(id)) return
        syncShape()
        cb.onShapeChange?.(id)
      },
    }, [SHAPES[id].name])
    shapeButtons.set(id, b)
    shapeSeg.appendChild(b)
  }

  body.appendChild(el('div', { class: 'st-group' }, [
    el('div', { class: 'st-label' }, ['星系形态']),
    el('div', { class: 'st-row' }, [shapeSeg]),
    shapeDesc,
  ]))

  function syncShape() {
    const cur = settings.shape
    for (const [id, b] of shapeButtons) b.classList.toggle('on', id === cur)
    shapeDesc.textContent = SHAPES[cur].desc
  }

  /* ═══════════ ② 取景 ═══════════
   *
   *  三个机位：全景 / 主星系 / 猜想星团。
   *
   *  为什么把它放在"形态"之后、"着色"之前：形态决定盘**长什么样**，
   *  取景决定**看哪一部分** —— 两者都属于"看什么"，而着色属于"怎么看"。
   *  按这个顺序排，用户的思路是连贯的。
   *
   *  它不重新布局（三个视图共用同一套世界坐标，切换只是隐藏另一侧并重新
   *  取景），所以点起来是瞬时的，不像切形态要等几秒。 */
  const viewButtons = new Map()
  const viewDesc = el('div', { class: 'st-desc' })
  const viewSeg = el('div', { class: 'st-seg', 'data-seg': 'view' })

  for (const id of VIEW_IDS) {
    const b = el('button', {
      title: VIEWS[id].hint,
      onclick: () => {
        if (!settings.setView(id)) return
        syncView()
      },
    }, [VIEWS[id].label])
    viewButtons.set(id, b)
    viewSeg.appendChild(b)
  }

  /* 节点/关联的统计。全景视图下用户会想知道"这些点各代表多少内容"，
   * 而这个数字从画面上看不出来（星团看起来比盘小得多，但节点密度更高）。 */
  const viewStats = el('div', { class: 'st-stats' })

  body.appendChild(el('div', { class: 'st-group' }, [
    el('div', { class: 'st-label' }, ['取景']),
    el('div', { class: 'st-row' }, [viewSeg]),
    viewDesc,
    viewStats,
  ]))

  function syncView() {
    const cur = settings.state.view
    for (const [id, b] of viewButtons) b.classList.toggle('on', id === cur)
    viewDesc.textContent = VIEWS[cur].hint
    const s = cb.stats?.() || null
    viewStats.textContent = s
      ? `主星系 ${s.galaxy} 条 · 猜想星团 ${s.conj} 条 · 关联 ${s.links} 条（跨星团 ${s.cross}）`
      : ''
  }

  /** 让 main.js 能在数据就绪后回填统计（buildGraph 之后才知道真实数量） */
  function refreshStats() { syncView() }

  /* ═══════════ ② 着色 ═══════════ */
  const colorButtons = new Map()
  const colorDesc = el('div', { class: 'st-desc' })
  const colorSeg = el('div', { class: 'st-seg', 'data-seg': 'color' })

  for (const id of COLOR_MODE_IDS) {
    const b = el('button', {
      title: COLOR_MODES[id].hint,
      onclick: () => {
        if (!settings.setColorMode(id)) return
        syncColor()
      },
    }, [COLOR_MODES[id].label])
    colorButtons.set(id, b)
    colorSeg.appendChild(b)
  }

  // 族色样本：让用户不用切过去就知道每种色对应哪个族
  const famSwatches = el('div', { class: 'st-fams' })
  for (const [key, def] of Object.entries(FAMILIES)) {
    famSwatches.appendChild(el('span', {
      class: 'st-fam',
      title: def.name,
    }, [
      el('i', { style: `background:${FAMILY_UI_COLOR[key] || def.color}` }),
      el('span', {}, [def.name]),
    ]))
  }

  body.appendChild(el('div', { class: 'st-group' }, [
    el('div', { class: 'st-label' }, ['着色']),
    el('div', { class: 'st-row' }, [colorSeg]),
    colorDesc,
    famSwatches,
  ]))

  function syncColor() {
    const cur = settings.state.colorMode
    for (const [id, b] of colorButtons) b.classList.toggle('on', id === cur)
    colorDesc.textContent = `${COLOR_MODES[cur].hint}。族色已统一到同一感知明度，所以明暗只反映重要度。`
    // mono 模式下族色不再出现在画面里，样本条淡掉避免误导
    famSwatches.style.opacity = cur === 'mono' ? '.28' : '1'
  }

  /* ═══════════ ③ 运行时参数 ═══════════ */
  const tweakRows = new Map()
  const tweakGroup = el('div', { class: 'st-group' }, [
    el('div', { class: 'st-label' }, ['参数']),
  ])

  for (const [key, spec] of Object.entries(TWEAKABLE)) {
    const val = el('span', { class: 'st-val' })
    const range = el('input', {
      type: 'range',
      min: spec.min, max: spec.max, step: spec.step,
      oninput: (e) => {
        settings.setTweak(key, e.target.value)
        syncTweak()
      },
    })
    tweakRows.set(key, { range, val })
    tweakGroup.appendChild(el('div', { class: 'st-row' }, [
      el('span', { class: 'st-sub', title: spec.label }, [spec.label]),
      range, val,
    ]))
  }

  const tweakReset = el('button', {
    class: 'st-reset',
    onclick: () => {
      for (const [k, spec] of Object.entries(TWEAKABLE)) settings.setTweak(k, spec.def)
      syncTweak()
    },
  }, ['参数恢复默认'])
  tweakGroup.appendChild(tweakReset)
  body.appendChild(tweakGroup)

  function fmt(v) {
    if (Math.abs(v) >= 10) return v.toFixed(1)
    if (Math.abs(v) >= 1) return v.toFixed(2)
    return v.toFixed(3).replace(/0+$/, '').replace(/\.$/, '')
  }

  function syncTweak() {
    let allDefault = true
    for (const [key, spec] of Object.entries(TWEAKABLE)) {
      const row = tweakRows.get(key)
      const v = settings.state.tweak[key]
      // 拖动中的滑块不要回写 value，否则会和用户的手指打架
      if (document.activeElement !== row.range) row.range.value = v
      row.val.textContent = fmt(v) + (spec.unit ? ' ' + spec.unit : '')
      if (Math.abs(v - spec.def) > 1e-9) allDefault = false
    }
    tweakReset.disabled = allDefault
  }

  /* ═══════════ ③ 显示层 ═══════════ */
  const toggleInputs = new Map()
  const displayGroup = el('div', { class: 'st-group' }, [
    el('div', { class: 'st-label' }, ['显示层']),
  ])

  for (const [key, spec] of Object.entries(DISPLAY)) {
    const input = el('input', {
      type: 'checkbox',
      onchange: () => {
        settings.toggleDisplay(key)
        syncDisplay()
      },
    })
    toggleInputs.set(key, input)
    displayGroup.appendChild(el('label', { class: 'st-toggle' }, [
      input,
      el('span', {}, [spec.label, el('small', {}, [spec.hint])]),
    ]))
  }

  const displayReset = el('button', {
    class: 'st-reset',
    onclick: () => {
      for (const [k, spec] of Object.entries(DISPLAY)) {
        if (settings.state.display[k] !== spec.def) settings.toggleDisplay(k)
      }
      syncDisplay()
    },
  }, ['显示恢复默认'])
  displayGroup.appendChild(displayReset)
  body.appendChild(displayGroup)

  function syncDisplay() {
    let allDefault = true
    for (const [key, spec] of Object.entries(DISPLAY)) {
      const on = !!settings.state.display[key]
      toggleInputs.get(key).checked = on
      if (on !== spec.def) allDefault = false
    }
    displayReset.disabled = allDefault
  }

  /* ═══════════ ④ 引力 ═══════════ */
  const gravInput = el('input', {
    type: 'checkbox',
    onchange: () => {
      settings.setGravity(gravInput.checked)
      syncGravity()
    },
  })
  const gravFollow = el('input', {
    type: 'range', min: 0, max: 2, step: 0.05,
    oninput: (e) => {
      settings.setGravityFollow(e.target.value)
      syncGravity()
    },
  })
  const gravVal = el('span', { class: 'st-val' })

  body.appendChild(el('div', { class: 'st-group' }, [
    el('div', { class: 'st-label' }, ['引力']),
    el('label', { class: 'st-toggle' }, [
      gravInput,
      el('span', {}, [
        '相机随星系共转',
        el('small', {}, [
          '打开后公式在屏幕上静止，好读好点；背景星云仍以略快的速率流过，' +
          '所以看起来"其实还在转"。',
        ]),
      ]),
    ]),
    el('div', { class: 'st-row' }, [
      el('span', { class: 'st-sub' }, ['跟随']),
      gravFollow, gravVal,
    ]),
  ]))

  function syncGravity() {
    gravInput.checked = settings.state.gravity
    gravFollow.disabled = !settings.state.gravity
    if (document.activeElement !== gravFollow) {
      gravFollow.value = settings.state.gravityFollow
    }
    gravVal.textContent = settings.state.gravity
      ? fmt(settings.state.gravityFollow) + ' ×'
      : '—'
  }

  /* ═══════════ 全部恢复默认 ═══════════ */
  const resetAll = el('button', {
    class: 'st-reset wide',
    onclick: () => {
      settings.resetAll()
      syncAll()
      cb.onShapeChange?.(settings.shape)
    },
  }, ['全部恢复默认'])
  body.appendChild(resetAll)

  /* ═══════════ 状态同步 ═══════════ */
  function syncAll() {
    syncShape()
    syncView()
    syncColor()
    syncTweak()
    syncDisplay()
    syncGravity()
    resetAll.disabled = settings.isDefault
  }

  /* 任何设置变化（包括别处调 settings）都同步 UI。
   * 放在 subscribe 里而不是每个 handler 里，是为了保证
   * "程序化改动"（如验证脚本调 settings.setTweak）也能反映到面板上。 */
  settings.subscribe(() => syncAll())

  /* ═══════════ 显隐 ═══════════ */
  let isOpen = false
  function open() {
    isOpen = true
    panel.classList.add('on')
    openBtn.classList.add('on')
    syncAll()
  }
  function close() {
    isOpen = false
    panel.classList.remove('on')
    openBtn.classList.remove('on')
  }
  function toggle() { isOpen ? close() : open() }

  // Esc 关面板（不要抢掉 ui.js 已有的 Esc 处理：那个先关搜索/详情，
  // 这里只在设置面板开着时响应）
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) close()
  })

  syncAll()
  // 默认收起，让首屏是干净的星海；按右上角"设置"或按 S 打开
  close()

  window.addEventListener('keydown', (e) => {
    if (e.key === 's' || e.key === 'S') {
      // 正在输入框里打字时不要触发
      const t = document.activeElement
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA')) return
      toggle()
    }
  })

  return { sync: syncAll, open, close, toggle, refreshStats, el: panel }
}
