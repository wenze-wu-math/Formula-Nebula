/**
 * DOM proof reader for Formula Nebula.
 *
 * The proof reader deliberately lives outside the three.js scene.  It owns a
 * fixed, scrollable overlay and only talks to the host through callbacks:
 * `onNavigate(id)` for proof dependencies, `onBack(id)` for the breadcrumb
 * back action, and `onGalaxy(id)` for the return-to-nebula action.  No URL or
 * history mutation is performed here; the host can choose its own router.
 *
 * The data object is intentionally permissive.  A node with no `proof` field
 * still gets a useful page containing its formula, summary/detail and graph
 * neighbours.  Adding proof data therefore only requires editing data files.
 */

import katex from 'katex'
import 'katex/dist/katex.min.css'

const STYLE_ID = 'formula-nebula-proof-view-style'
const ROOT_ID = 'proof-view'

const CSS = `
#${ROOT_ID}{
  --pv-bg:#080b14;--pv-ink:#f5f8ff;--pv-dim:#94a8c4;--pv-mute:#c5d2e6;
  --pv-line:rgba(148,178,220,.20);--pv-line-soft:rgba(148,178,220,.12);
  --pv-panel:rgba(12,17,29,.86);
  --pv-gold:#ffcf7a;--pv-cyan:#78d7ff;--pv-coral:#ff9b7f;--pv-violet:#c9aeff;
  --pv-accent:#ffcf7a;--pv-blue:#78d7ff;
  position:fixed;inset:0;z-index:80;display:none;color:var(--pv-ink);
  background:
    radial-gradient(1100px 520px at 50% -10%,rgba(120,215,255,.07),transparent 68%),
    radial-gradient(880px 600px at 96% 104%,rgba(201,174,255,.05),transparent 70%),
    var(--pv-bg);
  font-family:"Inter","PingFang SC","Microsoft YaHei",system-ui,sans-serif;
  -webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility;
}
#${ROOT_ID}.is-open{display:block}
#${ROOT_ID} ::selection{background:rgba(255,207,122,.26);color:#fff}
#${ROOT_ID} .pv-shell{height:100%;display:flex;flex-direction:column;min-width:0}
#${ROOT_ID} .pv-head{flex:none;display:flex;align-items:center;gap:10px;padding:14px max(24px,calc((100% - 880px)/2));border-bottom:1px solid var(--pv-line);background:var(--pv-panel);backdrop-filter:blur(20px) saturate(120%);position:sticky;top:0;z-index:2}
#${ROOT_ID} .pv-head .pv-title{min-width:0;flex:1;padding-right:4px}
#${ROOT_ID} .pv-title h1,#${ROOT_ID} .pv-head-name{margin:0;font-size:17px;line-height:1.35;font-weight:600;letter-spacing:.03em;color:var(--pv-ink);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
#${ROOT_ID} .pv-title p,#${ROOT_ID} .pv-head-en{margin:3px 0 0;color:var(--pv-dim);font-size:10.5px;font-weight:400;letter-spacing:.08em;line-height:1.5;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
#${ROOT_ID} button,#${ROOT_ID} a{font:inherit}
#${ROOT_ID} .pv-btn{appearance:none;border:1px solid var(--pv-line);border-radius:6px;padding:7px 11px;background:rgba(18,25,40,.72);color:var(--pv-mute);cursor:pointer;font-size:11px;font-weight:500;letter-spacing:.05em;line-height:1.25;white-space:nowrap;transition:color .16s ease,border-color .16s ease,background .16s ease}
#${ROOT_ID} .pv-btn:hover{color:var(--pv-ink);border-color:rgba(120,215,255,.5);background:rgba(30,45,72,.72)}
#${ROOT_ID} .pv-btn.pv-primary{color:#ffe6b8;border-color:rgba(255,207,122,.42);background:rgba(255,207,122,.08)}
#${ROOT_ID} .pv-btn.pv-primary:hover{color:#fff4dd;border-color:rgba(255,207,122,.72);background:rgba(255,207,122,.14)}
#${ROOT_ID} .pv-btn:focus-visible,#${ROOT_ID} .pv-link:focus-visible,#${ROOT_ID} .pv-crumb button:focus-visible,#${ROOT_ID} .pv-step summary:focus-visible{outline:2px solid var(--pv-cyan);outline-offset:2px}
#${ROOT_ID} .pv-scroll{flex:1;overflow:auto;overscroll-behavior:contain;scroll-behavior:smooth;scrollbar-width:thin;scrollbar-color:rgba(148,178,220,.32) transparent}
#${ROOT_ID} .pv-scroll::-webkit-scrollbar{width:9px;height:9px}
#${ROOT_ID} .pv-scroll::-webkit-scrollbar-track{background:transparent}
#${ROOT_ID} .pv-scroll::-webkit-scrollbar-thumb{background:rgba(148,178,220,.24);border:2px solid transparent;border-radius:6px;background-clip:content-box}
#${ROOT_ID} .pv-scroll::-webkit-scrollbar-thumb:hover{background:rgba(148,178,220,.42);border:2px solid transparent;background-clip:content-box}
#${ROOT_ID} .pv-page{width:min(880px,calc(100% - 56px));margin:0 auto;padding:34px 0 96px}
#${ROOT_ID} .pv-kicker{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin:0 0 18px;color:var(--pv-dim);font-size:10px;font-weight:500;letter-spacing:.16em;text-transform:uppercase}
#${ROOT_ID} .pv-chip{display:inline-flex;align-items:center;border:1px solid currentColor;border-radius:4px;padding:2px 7px;font-size:10px;line-height:1.5;letter-spacing:.1em}
#${ROOT_ID} .pv-card{margin:0;padding:30px 0 34px;border:0;border-top:1px solid var(--pv-line);border-radius:0;background:none;box-shadow:none}
#${ROOT_ID} .pv-card h2{display:flex;align-items:center;gap:12px;margin:0 0 18px;font-size:11.5px;font-weight:600;color:var(--pv-mute);letter-spacing:.18em;line-height:1.5;text-transform:uppercase}
#${ROOT_ID} .pv-card h2::after{content:'';flex:1 1 auto;height:1px;background:linear-gradient(90deg,var(--pv-line),rgba(148,178,220,0))}
#${ROOT_ID} .pv-formula{overflow-x:auto;overflow-y:hidden;margin:18px 0;padding:18px 20px;text-align:center;border:1px solid rgba(120,215,255,.16);border-left:2px solid rgba(120,215,255,.52);border-radius:6px;background:linear-gradient(180deg,rgba(120,215,255,.055),rgba(120,215,255,.018));scrollbar-width:thin}
#${ROOT_ID} .pv-formula .katex-display{margin:0}
#${ROOT_ID} .pv-formula .katex{color:#f4f8ff;font-size:1.15em}
#${ROOT_ID} .pv-text{font-size:14.5px;line-height:1.92;color:var(--pv-mute);white-space:pre-wrap;word-break:break-word;letter-spacing:.01em}
#${ROOT_ID} .pv-text .katex{color:#ffe9bd;font-size:1.02em}
#${ROOT_ID} .pv-text p{margin:0 0 12px}
#${ROOT_ID} .pv-text p:last-child{margin-bottom:0}
#${ROOT_ID} .pv-example{padding:20px 0 4px;border-top:1px solid var(--pv-line-soft)}
#${ROOT_ID} .pv-example:first-of-type{border-top:0;padding-top:0}
#${ROOT_ID} .pv-example h3{margin:0 0 8px;color:var(--pv-ink);font-size:13px;font-weight:600;letter-spacing:.03em;line-height:1.5}
#${ROOT_ID} .pv-remark-list{margin:0;padding-left:18px;color:var(--pv-mute)}
#${ROOT_ID} .pv-remark-list li{margin:10px 0;padding-left:2px;font-size:13.5px;line-height:1.8}
#${ROOT_ID} .pv-remark-list li::marker{color:rgba(255,207,122,.7)}
#${ROOT_ID} .pv-em{color:var(--pv-gold);font-weight:600}
#${ROOT_ID} .pv-step{margin:0;border:0;border-top:1px solid var(--pv-line-soft);border-radius:0;background:none;overflow:visible}
#${ROOT_ID} .pv-step summary{cursor:pointer;list-style:none;display:flex;align-items:center;gap:10px;padding:14px 2px;color:var(--pv-ink);font-size:14px;font-weight:600;letter-spacing:.02em;line-height:1.55;transition:color .16s ease}
#${ROOT_ID} .pv-step summary:hover{color:#fff}
#${ROOT_ID} .pv-step summary::-webkit-details-marker{display:none}
#${ROOT_ID} .pv-step summary::before{content:'›';flex:none;display:inline-block;color:var(--pv-cyan);font-size:17px;line-height:1;transform-origin:50% 55%;transition:transform .18s ease}
#${ROOT_ID} .pv-step[open] summary::before{transform:rotate(90deg)}
#${ROOT_ID} .pv-step .pv-step-id{flex:none;margin-left:auto;color:var(--pv-dim);font-size:10.5px;font-weight:500;letter-spacing:.12em;font-variant-numeric:tabular-nums}
#${ROOT_ID} .pv-step-body{padding:0 0 18px 20px;border-top:0}
#${ROOT_ID} .pv-note{margin:14px 0 0;padding:10px 14px;border-left:2px solid rgba(255,207,122,.5);border-radius:0 4px 4px 0;background:rgba(255,207,122,.045);color:var(--pv-mute);font-size:12.5px;line-height:1.8}
#${ROOT_ID} .pv-note b{color:var(--pv-gold);font-weight:600}
#${ROOT_ID} .pv-uses{display:flex;gap:6px;align-items:baseline;flex-wrap:wrap;margin-top:14px;color:var(--pv-dim);font-size:11.5px;letter-spacing:.04em;line-height:1.9}
#${ROOT_ID} .pv-link{appearance:none;border:0;padding:0;background:none;color:var(--pv-cyan);cursor:pointer;text-decoration:underline;text-decoration-color:rgba(120,215,255,.32);text-decoration-thickness:1px;text-underline-offset:3px;transition:color .16s ease,text-decoration-color .16s ease}
#${ROOT_ID} .pv-link:hover{color:var(--pv-gold);text-decoration-color:rgba(255,207,122,.55)}
#${ROOT_ID} .pv-plain{color:var(--pv-mute)}
#${ROOT_ID} .pv-conclusion{color:#ffe3a8;padding-left:16px;border-left:2px solid rgba(255,207,122,.35)}
#${ROOT_ID} .pv-ref-list,#${ROOT_ID} .pv-neighbour-list{display:flex;flex-direction:column;gap:0;margin:0;padding:0;list-style:none}
#${ROOT_ID} .pv-ref-list>li+li,#${ROOT_ID} .pv-neighbour-list>li+li{border-top:1px solid var(--pv-line-soft)}
#${ROOT_ID} .pv-ref{font-size:13px;line-height:1.8;color:var(--pv-mute);padding:9px 0}
#${ROOT_ID} .pv-ref:first-child{padding-top:0}
#${ROOT_ID} .pv-ref a{color:var(--pv-cyan);text-decoration:none;border-bottom:1px solid rgba(120,215,255,.28);transition:color .16s ease,border-color .16s ease}
#${ROOT_ID} .pv-ref a:hover{color:var(--pv-gold);border-bottom-color:rgba(255,207,122,.5)}
#${ROOT_ID} .pv-ref a:focus-visible{outline:2px solid var(--pv-cyan);outline-offset:2px}
#${ROOT_ID} .pv-neighbour{box-sizing:border-box;display:flex;align-items:center;gap:10px;width:100%;text-align:left;padding:10px 8px;border-radius:5px;color:var(--pv-mute);text-decoration:none;transition:color .16s ease,background .16s ease}
#${ROOT_ID} .pv-neighbour:hover{color:var(--pv-ink);background:rgba(120,215,255,.06);text-decoration:none}
#${ROOT_ID} .pv-neighbour .pv-neighbour-kind{margin-left:auto;color:var(--pv-dim);font-size:10.5px;letter-spacing:.08em;white-space:nowrap}
#${ROOT_ID} .pv-empty{color:var(--pv-dim);font-size:13px;line-height:1.8}
#${ROOT_ID} .pv-context-note{margin:0 0 14px;color:var(--pv-dim);font-size:12px;line-height:1.7}
#${ROOT_ID} .pv-crumb{display:flex;gap:8px;align-items:center;min-width:0;margin:0 0 22px;padding:0 0 12px;border-bottom:1px solid var(--pv-line-soft);color:var(--pv-dim);font-size:11.5px;letter-spacing:.03em;white-space:nowrap;overflow-x:auto;scrollbar-width:none}
#${ROOT_ID} .pv-crumb::-webkit-scrollbar{display:none}
#${ROOT_ID} .pv-crumb button{color:var(--pv-cyan);border:0;background:none;padding:2px 0;cursor:pointer;white-space:nowrap;font-size:inherit;letter-spacing:inherit;transition:color .16s ease}
#${ROOT_ID} .pv-crumb button:hover{color:var(--pv-gold)}
#${ROOT_ID} .pv-crumb span{color:var(--pv-mute);overflow:hidden;text-overflow:ellipsis}
#${ROOT_ID} .pv-card.pv-directed,#${ROOT_ID} .pv-card.pv-context-card{padding-bottom:30px}
@media (max-width:900px){
  #${ROOT_ID} .pv-head{padding:12px 24px}
  #${ROOT_ID} .pv-page{width:calc(100% - 44px);padding:28px 0 80px}
  #${ROOT_ID} .pv-card{padding:26px 0 30px}
}
@media (max-width:620px){
  #${ROOT_ID} .pv-head{gap:8px;padding:10px 14px}
  #${ROOT_ID} .pv-head .pv-btn{padding:6px 9px;font-size:10.5px}
  #${ROOT_ID} .pv-title h1,#${ROOT_ID} .pv-head-name{font-size:15px}
  #${ROOT_ID} .pv-title p,#${ROOT_ID} .pv-head-en{font-size:10px;letter-spacing:.06em}
  #${ROOT_ID} .pv-page{width:calc(100% - 32px);padding:22px 0 68px}
  #${ROOT_ID} .pv-card{padding:24px 0 26px}
  #${ROOT_ID} .pv-card h2{font-size:11px;letter-spacing:.14em;margin-bottom:14px}
  #${ROOT_ID} .pv-text{font-size:14px;line-height:1.86}
  #${ROOT_ID} .pv-remark-list li{font-size:13px;line-height:1.75}
  #${ROOT_ID} .pv-formula{padding:14px 12px;margin:14px 0}
  #${ROOT_ID} .pv-step summary{font-size:13.5px;padding:12px 0}
  #${ROOT_ID} .pv-step-body{padding:0 0 14px 18px}
  #${ROOT_ID} .pv-example{padding-top:16px}
  #${ROOT_ID} .pv-conclusion{padding-left:12px}
  #${ROOT_ID} .pv-crumb{margin-bottom:18px;font-size:11px}
  #${ROOT_ID} .pv-kicker{margin-bottom:14px;letter-spacing:.12em}
}
@media (max-width:520px){
  #${ROOT_ID} .pv-head{flex-wrap:wrap;row-gap:9px;padding:11px 14px}
  #${ROOT_ID} .pv-head .pv-title{order:-1;flex:1 0 100%;padding-right:0}
  #${ROOT_ID} .pv-head .pv-btn{flex:1 1 0;text-align:center;padding:8px 6px;font-size:11px}
}
@media (prefers-reduced-motion:reduce){
  #${ROOT_ID} .pv-scroll{scroll-behavior:auto}
  #${ROOT_ID} .pv-btn,#${ROOT_ID} .pv-link,#${ROOT_ID} .pv-step summary,#${ROOT_ID} .pv-step summary::before,#${ROOT_ID} .pv-neighbour,#${ROOT_ID} .pv-ref a,#${ROOT_ID} .pv-crumb button{transition:none}
}
`

function ensureStyle() {
  if (typeof document === 'undefined' || document.getElementById(STYLE_ID)) return
  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = CSS
  document.head.appendChild(style)
}

function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag)
  for (const [key, value] of Object.entries(attrs)) {
    if (value === null || value === undefined) continue
    if (key === 'class') node.className = value
    else if (key === 'text') node.textContent = value
    else if (key === 'dataset') Object.assign(node.dataset, value)
    else node.setAttribute(key, String(value))
  }
  for (const child of children) {
    if (child === null || child === undefined) continue
    node.append(child && typeof child.nodeType === 'number'
      ? child : document.createTextNode(String(child)))
  }
  return node
}

function asText(value) {
  return value === null || value === undefined ? '' : String(value)
}

function safeReferenceUrl(value) {
  if (typeof value !== 'string' || !value.trim()) return ''
  try {
    const url = new URL(value.trim())
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : ''
  } catch {
    return ''
  }
}

function renderLatex(value, display = false) {
  const source = asText(value).trim()
  if (!source) return null
  try {
    const html = katex.renderToString(source, {
      displayMode: display,
      throwOnError: false,
      trust: false,
      strict: false,
    })
    const box = el('span')
    box.innerHTML = html
    return box
  } catch {
    return el('span', { class: 'pv-plain' }, [source])
  }
}

/**
 * Append a small, safe markdown/math subset.  Plain text is always inserted
 * as text nodes; only KaTeX's generated markup is assigned to innerHTML.
 * Supported math delimiters are $$…$$, \[…\], \(…\) and $…$.
 */
function appendRichText(parent, value) {
  const source = asText(value)
  if (!source) return
  const re = /(\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\)|\$(?!\s)(?:\\.|[^$\\])+\$)/g
  let cursor = 0
  let match
  while ((match = re.exec(source))) {
    appendPlain(parent, source.slice(cursor, match.index))
    const token = match[0]
    const display = token.startsWith('$$') || token.startsWith('\\[')
    const body = display
      ? token.startsWith('$$') ? token.slice(2, -2) : token.slice(2, -2)
      : token.startsWith('\\(') ? token.slice(2, -2) : token.slice(1, -1)
    const rendered = renderLatex(body, display)
    if (rendered) {
      if (display) {
        const wrap = el('div', { class: 'pv-formula' })
        wrap.appendChild(rendered)
        parent.appendChild(wrap)
      } else parent.appendChild(rendered)
    }
    cursor = match.index + token.length
  }
  appendPlain(parent, source.slice(cursor))
}

function appendPlain(parent, text) {
  if (!text) return
  // Preserve line breaks while keeping all user/data content out of HTML.
  const parts = String(text).split(/(\r?\n)/)
  for (const part of parts) {
    if (part === '\n' || part === '\r\n') parent.appendChild(document.createElement('br'))
    else if (part) {
      const strongParts = part.split(/(\*\*[^*]+\*\*)/g)
      for (const s of strongParts) {
        if (/^\*\*[^*]+\*\*$/.test(s)) parent.appendChild(el('b', { class: 'pv-em' }, [s.slice(2, -2)]))
        else if (s) parent.appendChild(document.createTextNode(s))
      }
    }
  }
}

function appendTextBlock(parent, value, className = 'pv-text') {
  const block = el('div', { class: className })
  appendProofText(block, value)
  parent.appendChild(block)
  return block
}

/** Proof statement/body/conclusion fields support mixed prose and explicit
 * math delimiters. Legacy fields that contain only LaTeX commands still
 * render as a display formula. */
function appendProofText(parent, value) {
  const source = asText(value).trim()
  if (!source) return
  const hasDelimiters = /\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\)|\$(?!\s)(?:\\.|[^$\\])+\$/.test(source)
  const looksLikeLatex = /\\(?:text|boxed|mathfrak|mathbb|mathrm|operatorname|sqrt|frac|forall|exists|subset|supset|begin|end|bigcup|bigcap|cap|cup|ker|mapsto|Rightarrow|Longrightarrow|cdot|times|le|ge|neq)\b/.test(source)
  if (!hasDelimiters && looksLikeLatex) {
    const formula = renderLatex(source, true)
    if (formula) {
      const wrap = el('div', { class: 'pv-formula' })
      wrap.appendChild(formula)
      parent.appendChild(wrap)
      return
    }
  }
  appendRichText(parent, source)
}

function normaliseGraph(graph) {
  if (!graph) return null
  const byId = graph.byId instanceof Map
    ? graph.byId
    : new Map((graph.nodes || []).filter(Boolean).map((n) => [n.id, n]))
  return { ...graph, byId }
}

function createProofView(options = {}) {
  let graph = normaliseGraph(options.graph)
  let root = null
  let page = null
  let content = null
  let current = null
  let history = []
  let mounted = false
  let keyHandler = null

  const callbacks = {
    onNavigate: options.onNavigate,
    onBack: options.onBack,
    onGalaxy: options.onGalaxy,
    onHide: options.onHide,
    onShow: options.onShow,
    // 按需加载单条证明。证明数据不再在启动时全量附加到节点上
    // （245 条长篇证明 = 3.3 MB 源码，占主包 gzip 的绝大部分），
    // 改由宿主在首次打开证明页时提供。返回 Promise<proof|null>。
    loadProof: options.loadProof,
  }

  function resolve(value) {
    if (!value) return null
    if (typeof value === 'object' && value.id) return value
    const id = String(value)
    if (graph?.byId?.get(id)) return graph.byId.get(id)
    if (typeof options.resolve === 'function') return options.resolve(id) || null
    return null
  }

  function emit(name, detail = {}) {
    if (!root || typeof root.dispatchEvent !== 'function') return
    try { root.dispatchEvent(new CustomEvent(`proof:${name}`, { detail })) } catch { /* old DOM */ }
  }

  function setVisible(visible) {
    if (!root) return
    root.classList.toggle('is-open', visible)
    root.setAttribute('aria-hidden', visible ? 'false' : 'true')
    document.body.classList.toggle('proof-view-open', visible)
  }

  function clearPage() {
    if (content) content.replaceChildren()
  }

  function depButton(id, label, extraClass = '') {
    const target = resolve(id)
    if (!target) return el('span', { class: 'pv-plain' }, [label || id])
    const btn = el('button', { class: `pv-link ${extraClass}`.trim(), type: 'button' }, [label || target.name || id])
    btn.addEventListener('click', () => open(target.id, {
      pushHistory: true, notify: true, navigationType: 'dependency',
    }))
    return btn
  }

  function renderUses(container, uses, stepIds) {
    if (!Array.isArray(uses) || !uses.length) return
    const row = el('div', { class: 'pv-uses' }, [el('span', {}, ['使用：'])])
    uses.forEach((use, index) => {
      const id = typeof use === 'object' ? use.id : use
      const label = typeof use === 'object' ? (use.name || use.label || use.id) : use
      if (index) row.appendChild(document.createTextNode(' · '))
      if (stepIds.has(String(id))) {
        const anchor = el('button', { class: 'pv-link', type: 'button' }, [label || id])
        anchor.addEventListener('click', () => {
          const target = document.getElementById(`proof-step-${safeId(id)}`)
          target?.scrollIntoView({ behavior: 'smooth', block: 'center' })
          if (target instanceof HTMLDetailsElement) target.open = true
        })
        row.appendChild(anchor)
      } else row.appendChild(depButton(String(id), label || id))
    })
    container.appendChild(row)
  }

  function safeId(value) {
    return String(value).replace(/[^a-zA-Z0-9_-]/g, '_')
  }

  function renderBreadcrumb(node) {
    if (!history.length) return null
    const crumb = el('nav', { class: 'pv-crumb', 'aria-label': '证明路径' })
    history.forEach((entry, index) => {
      if (index) crumb.appendChild(document.createTextNode('›'))
      const n = resolve(entry)
      if (!n) return
      const b = el('button', { type: 'button' }, [n.name || n.id])
      b.addEventListener('click', () => open(n.id, {
        pushHistory: false, notify: true, navigationType: 'breadcrumb',
      }))
      crumb.appendChild(b)
    })
    crumb.appendChild(document.createTextNode('›'))
    crumb.appendChild(el('span', {}, [node.name || node.id]))
    return crumb
  }

  function renderNode(node, opts = {}) {
    clearPage()
    const proof = node.proof && typeof node.proof === 'object' ? node.proof : {}
    const crumb = renderBreadcrumb(node)
    if (crumb) content.appendChild(crumb)

    // 证明数据尚未到位时（首次打开需 fetch proofs.json），先给一行明确提示，
    // 而不是让用户以为这个定理没有证明。
    if (opts.loading) {
      content.appendChild(
        el('p', { class: 'pv-empty' }, ['证明内容加载中…'])
      )
      return
    }

    const kicker = el('div', { class: 'pv-kicker' })
    if (node.kind) kicker.appendChild(el('span', { class: 'pv-chip', style: 'color:#9fd0ff' }, [node.kind]))
    if (node.cluster && node.status) kicker.appendChild(el('span', { class: 'pv-chip', style: 'color:#ffb57a' }, [node.status]))
    kicker.appendChild(el('span', {}, [node.id]))
    content.appendChild(kicker)

    const statement = el('section', { class: 'pv-card' }, [el('h2', {}, ['命题陈述'])])
    const statementValue = proof.statement || node.latex
    if (statementValue) {
      appendProofText(statement, statementValue)
    } else statement.appendChild(el('p', { class: 'pv-empty' }, ['暂无公式陈述。']))
    if (node.summary) appendTextBlock(statement, node.summary)
    content.appendChild(statement)

    if (proof.explanation) {
      const explanation = el('section', { class: 'pv-card' }, [el('h2', {}, ['直观解释'])])
      appendTextBlock(explanation, proof.explanation)
      content.appendChild(explanation)
    }

    // 195 nodes carry a second, mechanism-focused paragraph that used to be
    // silently discarded: the data files declared `explanation:` twice in the
    // same object literal, so JavaScript kept only the last one. The first is
    // now stored as `deepExplanation` and rendered here as its own card.
    if (proof.deepExplanation) {
      const deep = el('section', { class: 'pv-card' }, [el('h2', {}, ['机制与定位'])])
      appendTextBlock(deep, proof.deepExplanation)
      content.appendChild(deep)
    }

    const steps = Array.isArray(proof.steps) ? proof.steps : []
    const proofCard = el('section', { class: 'pv-card' }, [el('h2', {}, ['证明'])])
    if (!steps.length) {
      if (proof.body || node.detail) appendTextBlock(proofCard, proof.body || node.detail)
      else proofCard.appendChild(el('p', { class: 'pv-empty' }, ['这条命题尚未登记分步证明。']))
    } else {
      const stepIds = new Set(steps.map((step, i) => String(step?.id || i + 1)))
      steps.forEach((step, index) => {
        const id = String(step?.id || index + 1)
        const details = el('details', { class: 'pv-step', id: `proof-step-${safeId(id)}`, open: true })
        const summary = el('summary', {}, [
          el('span', {}, [step?.title || `步骤 ${index + 1}`]),
          el('span', { class: 'pv-step-id' }, [`#${id}`]),
        ])
        details.appendChild(summary)
        const body = el('div', { class: 'pv-step-body' })
        if (step?.body) appendTextBlock(body, step.body)
        renderUses(body, step?.uses, stepIds)
        if (step?.note) {
          const note = el('div', { class: 'pv-note' }, [el('b', {}, ['直观解释：'])])
          const noteBody = el('span', { class: 'pv-note-body' })
          appendProofText(noteBody, step.note)
          note.append(document.createTextNode(' '), noteBody)
          body.appendChild(note)
        }
        details.appendChild(body)
        proofCard.appendChild(details)
      })
    }
    content.appendChild(proofCard)

    if (proof.conclusion) {
      const conclusion = el('section', { class: 'pv-card' }, [el('h2', {}, ['结论'])])
      appendTextBlock(conclusion, proof.conclusion, 'pv-text pv-conclusion')
      content.appendChild(conclusion)
    }

    if (proof.history) {
      const historyCard = el('section', { class: 'pv-card' }, [el('h2', {}, ['历史与动机'])])
      appendTextBlock(historyCard, proof.history)
      content.appendChild(historyCard)
    }

    const examples = Array.isArray(proof.examples) ? proof.examples : []
    if (examples.length) {
      const examplesCard = el('section', { class: 'pv-card' }, [el('h2', {}, ['例子与计算'])])
      for (const example of examples) {
        const block = el('div', { class: 'pv-example' }, [el('h3', {}, [example.title])])
        appendTextBlock(block, example.body)
        examplesCard.appendChild(block)
      }
      content.appendChild(examplesCard)
    }

    const remarks = Array.isArray(proof.remarks) ? proof.remarks : []
    if (remarks.length) {
      const remarksCard = el('section', { class: 'pv-card' }, [el('h2', {}, ['常见误区与备注'])])
      const list = el('ul', { class: 'pv-remark-list' })
      for (const remark of remarks) list.appendChild(el('li', { class: 'pv-text' }, [remark]))
      remarksCard.appendChild(list)
      content.appendChild(remarksCard)
    }

    const corollaries = Array.isArray(proof.corollaries) ? proof.corollaries : []
    if (corollaries.length) {
      const corollaryCard = el('section', { class: 'pv-card' }, [el('h2', {}, ['推论与后续'])])
      /* 推论同样可以引用**本证明内的步骤**（schema 允许，数据里也确实这么写）。
       * 早先这里传的是 new Set()，于是那些步骤 id 一律解析不到，被
       * depButton 退化成 .pv-plain 灰字 —— 页面上看起来像一段无法点击的
       * 依赖，实际是渲染器丢掉了跳转目标。传真的步骤集合即可。 */
      const corollaryStepIds = new Set(steps.map((step, index) => String(step?.id || index + 1)))
      for (const corollary of corollaries) {
        const block = el('div', { class: 'pv-example' }, [el('h3', {}, [corollary.title])])
        appendProofText(block, corollary.body)
        if (Array.isArray(corollary.uses)) renderUses(block, corollary.uses, corollaryStepIds)
        corollaryCard.appendChild(block)
      }
      content.appendChild(corollaryCard)
    }

    const references = Array.isArray(proof.references) ? proof.references : []
    if (references.length) {
      const refCard = el('section', { class: 'pv-card' }, [el('h2', {}, ['参考文献'])])
      const list = el('ul', { class: 'pv-ref-list' })
      references.forEach((ref) => {
        if (!ref) return
        const li = el('li', { class: 'pv-ref' })
        const title = asText(ref.title || ref.name || '未命名文献')
        const url = safeReferenceUrl(ref.url)
        if (url) {
          const a = el('a', { href: url, target: '_blank', rel: 'noopener noreferrer' }, [title])
          li.appendChild(a)
        } else li.appendChild(document.createTextNode(title))
        const meta = [ref.author, ref.year, ref.doi ? `doi:${ref.doi}` : ''].filter(Boolean).join(' · ')
        // A full-width space (U+3000) is used on purpose as the separator before
        // the reference metadata — it reads correctly in Chinese typesetting.
        // Spelled out as an escape so it is visible and lint-clean.
        if (meta) li.appendChild(document.createTextNode(`\u3000${meta}`))
        list.appendChild(li)
      })
      refCard.appendChild(list)
      content.appendChild(refCard)
    }

    renderDirectionalRelations(node, proof.dependencies, '证明依赖')
    renderDirectionalRelations(node, proof.consequences, '由此推出')
    renderNeighbours(node)
  }

  function renderDirectionalRelations(node, ids, heading) {
    if (!Array.isArray(ids) || !ids.length) return
    const card = el('section', { class: 'pv-card pv-directed' }, [
      el('h2', {}, [`${heading} · ${ids.length}`]),
    ])
    const list = el('ul', { class: 'pv-neighbour-list' })
    for (const id of ids) {
      const target = resolve(id)
      if (!target) continue
      const item = el('li')
      const button = el('button', { class: 'pv-link pv-neighbour', type: 'button' }, [
        el('span', {}, [target.name || target.id]),
        el('span', { class: 'pv-neighbour-kind' }, [heading === '证明依赖' ? '前置命题' : '后续结论']),
      ])
      button.addEventListener('click', () => open(target.id, {
        pushHistory: true, notify: true, navigationType: 'dependency',
      }))
      item.appendChild(button)
      list.appendChild(item)
    }
    if (list.childElementCount) {
      card.appendChild(list)
      content.appendChild(card)
    }
  }

  function renderNeighbours(node) {
    const links = Array.isArray(node.linkIds) ? node.linkIds : []
    const neighbours = []
    const seen = new Set()
    for (const link of links) {
      const id = link?.source === node.id ? link?.target : link?.source
      if (!id || seen.has(id)) continue
      const other = resolve(id)
      if (!other) continue
      seen.add(id)
      neighbours.push({ node: other, link })
    }
    const card = el('section', { class: 'pv-card pv-context-card' }, [
      el('h2', {}, ['星云关联 · 返回后高亮']),
      el('p', { class: 'pv-context-note' }, ['这些直接关联节点会在回到星云后一起高亮。']),
    ])
    if (!neighbours.length) card.appendChild(el('p', { class: 'pv-empty' }, ['暂无登记的关联节点。']))
    else {
      const list = el('ul', { class: 'pv-neighbour-list' })
      for (const { node: other, link } of neighbours.sort((a, b) => (b.link?.weight || 0) - (a.link?.weight || 0))) {
        const li = el('li')
        const button = el('button', { class: 'pv-link pv-neighbour', type: 'button' }, [
          el('span', {}, [other.name || other.id]),
          link?.label ? el('span', { class: 'pv-neighbour-kind' }, [link.label]) : null,
        ])
        button.addEventListener('click', () => open(other.id, { pushHistory: true, notify: true }))
        li.appendChild(button)
        list.appendChild(li)
      }
      card.appendChild(list)
    }
    content.appendChild(card)
  }

  function mount(target = document.body) {
    if (mounted && root) return api
    if (typeof document === 'undefined') throw new Error('proofView.mount() requires a browser DOM')
    ensureStyle()
    root = document.getElementById(ROOT_ID)
    if (!root) {
      root = el('section', { id: ROOT_ID, 'aria-hidden': 'true', role: 'dialog', 'aria-label': '证明页' })
      const shell = el('div', { class: 'pv-shell' })
      const head = el('header', { class: 'pv-head' })
      const back = el('button', { class: 'pv-btn', type: 'button', title: '返回上一个证明' }, ['← 返回'])
      const title = el('div', { class: 'pv-title' }, [el('h1', { class: 'pv-head-name' }, ['证明']) , el('p', { class: 'pv-head-en' })])
      const galaxy = el('button', { class: 'pv-btn pv-primary', type: 'button' }, ['✦ 回到星云'])
      const close = el('button', { class: 'pv-btn', type: 'button', title: '关闭证明页' }, ['关闭'])
      head.append(back, title, galaxy, close)
      page = el('main', { class: 'pv-scroll' })
      content = el('div', { class: 'pv-page' })
      page.appendChild(content)
      shell.append(head, page)
      root.appendChild(shell)
      ;(target || document.body).appendChild(root)
      root.__proofControls = { back, title, galaxy, close }

      back.addEventListener('click', () => {
        if (history.length) {
          const previous = history.pop()
          open(previous, { pushHistory: false, notify: true, navigationType: 'back' })
        } else {
          callbacks.onBack?.(current?.id || null)
          emit('back', { id: current?.id || null })
        }
      })
      galaxy.addEventListener('click', () => {
        const id = current?.id || null
        callbacks.onGalaxy?.(id)
        emit('galaxy', { id })
      })
      close.addEventListener('click', () => hide())
      keyHandler = (event) => {
        if (event.key === 'Escape' && root?.classList.contains('is-open')) hide()
      }
      window.addEventListener('keydown', keyHandler)
    } else if (!page) {
      page = root.querySelector('.pv-scroll')
      content = root.querySelector('.pv-page')
      if (page && !content) {
        content = el('div', { class: 'pv-page' })
        while (page.firstChild) content.appendChild(page.firstChild)
        page.appendChild(content)
      }
    }
    mounted = true
    return api
  }

  function open(value, options = {}) {
    if (!mounted) mount()
    const node = resolve(value)
    if (!node) {
      emit('error', { id: typeof value === 'string' ? value : null, reason: 'unknown-node' })
      return false
    }
    // 证明数据是按需加载的（见 dataLoader.js 的 loadProofs）。
    // 首次打开证明页时，先显示一个「加载中」而不是空白页，异步取回后重渲染。
    // 关键点：**不能**在这里同步等待 —— open() 是同步 API，被 URL 深链、
    // 面包屑、键盘导航等十几处调用，改成 async 会波及全部调用方。
    if (!node.proof && typeof callbacks.loadProof === 'function') {
      const pending = callbacks.loadProof(node.id)
      if (pending && typeof pending.then === 'function') {
        // 先渲染一次骨架（无 proof 内容），数据到位后原地重渲染同一节点。
        const previous = current
        if (options.pushHistory !== false && previous && previous.id !== node.id) history.push(previous.id)
        current = node
        const nameEl = root.querySelector('.pv-head-name')
        const enEl = root.querySelector('.pv-head-en')
        if (nameEl) nameEl.textContent = node.name || node.id
        if (enEl) enEl.textContent = node.en || node.id
        renderNode(node, { loading: true })
        setVisible(true)
        page.scrollTop = 0
        pending
          .then((proof) => {
            if (proof) node.proof = proof
            // 只有用户还停在这个节点时才重渲染，避免抢掉他已经跳去的页面
            if (current && current.id === node.id) renderNode(node)
          })
          .catch((e) => {
            console.warn('[proofView] 证明数据加载失败：', e.message)
            if (current && current.id === node.id) renderNode(node)
          })
        if (options.notify !== false) {
          const detail = {
            node,
            from: previous?.id || null,
            pushHistory: options.pushHistory !== false && !!previous && previous.id !== node.id,
            navigationType: options.navigationType || 'open',
          }
          callbacks.onNavigate?.(node.id, detail)
          emit('open', { id: node.id, ...detail })
        }
        callbacks.onShow?.(node.id, node)
        return true
      }
    }
    const previous = current
    if (options.pushHistory !== false && previous && previous.id !== node.id) history.push(previous.id)
    current = node
    const name = root.querySelector('.pv-head-name')
    const en = root.querySelector('.pv-head-en')
    if (name) name.textContent = node.name || node.id
    if (en) en.textContent = node.en || node.id
    renderNode(node)
    setVisible(true)
    page.scrollTop = 0
    if (options.notify !== false) {
      const detail = {
        node,
        from: previous?.id || null,
        pushHistory: options.pushHistory !== false && !!previous && previous.id !== node.id,
        navigationType: options.navigationType || 'open',
      }
      callbacks.onNavigate?.(node.id, detail)
      emit('open', { id: node.id, ...detail })
    }
    callbacks.onShow?.(node.id, node)
    return true
  }

  function show(value, options = {}) { return open(value, options) }

  function hide() {
    if (!root) return false
    setVisible(false)
    const old = current
    current = null
    history = []
    callbacks.onHide?.(old?.id || null)
    emit('hide', { id: old?.id || null })
    return true
  }

  function setGraph(next) { graph = normaliseGraph(next); return api }
  /** Replace the local breadcrumb stack from browser route history. */
  function setHistory(ids) {
    history = Array.isArray(ids) ? ids.filter((id) => typeof id === 'string' && id) : []
    return [...history]
  }
  function destroy() {
    if (keyHandler) window.removeEventListener('keydown', keyHandler)
    root?.remove()
    root = null; page = null; content = null; current = null; history = []; mounted = false
  }

  const api = {
    mount,
    show,
    open,
    hide,
    close: hide,
    destroy,
    setGraph,
    setHistory,
    get root() { return root },
    get current() { return current },
    get currentId() { return current?.id || null },
    get history() { return [...history] },
  }
  return api
}

export { createProofView }
export default createProofView
