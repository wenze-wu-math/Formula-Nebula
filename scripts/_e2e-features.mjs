/**
 * Feature smoke test for the built app.
 *
 * Each scenario runs in a FRESH browser target so a previous scenario's DOM or
 * route state cannot leak into the next one. An earlier version reused a single
 * page and produced false failures on features that actually worked.
 *
 * Usage: node scripts/_e2e-features.mjs <baseUrl> <cdpPort>
 */

const BASE = (process.argv[2] || 'http://localhost:5412/').replace(/\/$/, '')
const PORT = process.argv[3] || '9351'

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const results = []
const record = (name, ok, detail = '') => {
  results.push({ name, ok, detail })
  const tag = ok === true ? 'PASS' : ok === false ? 'FAIL' : 'SKIP'
  console.log(`  [${tag}] ${name}${detail ? ' — ' + detail : ''}`)
}

class CDP {
  constructor(ws) {
    this.ws = ws
    this.id = 0
    this.pending = new Map()
    ws.addEventListener('message', (e) => {
      const m = JSON.parse(e.data)
      if (m.id && this.pending.has(m.id)) {
        const { resolve, reject } = this.pending.get(m.id)
        this.pending.delete(m.id)
        m.error ? reject(new Error(JSON.stringify(m.error))) : resolve(m.result)
      }
    })
  }
  send(method, params = {}) {
    const id = ++this.id
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject })
      this.ws.send(JSON.stringify({ id, method, params }))
    })
  }
}

async function newPage() {
  const r = await fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, { method: 'PUT' })
  if (!r.ok) throw new Error('cannot create target: ' + r.status)
  const t = await r.json()
  const ws = new WebSocket(t.webSocketDebuggerUrl)
  await new Promise((res, rej) => {
    ws.addEventListener('open', res, { once: true })
    ws.addEventListener('error', rej, { once: true })
  })
  const cdp = new CDP(ws)
  await cdp.send('Runtime.enable')
  await cdp.send('Page.enable')
  return { cdp, ws, targetId: t.id }
}

const ev = async (cdp, expression, awaitPromise = false) => {
  const r = await cdp.send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise })
  if (r.exceptionDetails) return { __err: r.exceptionDetails.text }
  return r.result ? r.result.value : undefined
}

async function open(url, { timeoutMs = 150000 } = {}) {
  const page = await newPage()
  await page.cdp.send('Page.navigate', { url })
  const deadline = Date.now() + timeoutMs
  let ready = false
  while (Date.now() < deadline) {
    await sleep(1000)
    const st = await ev(page.cdp, `(() => { const s = document.getElementById('splash'); return s ? getComputedStyle(s).display : 'gone' })()`)
    if (st === 'none' || st === 'gone') {
      ready = true
      break
    }
  }
  return { ...page, ready }
}

const close = async (page) => {
  try {
    page.ws.close()
  } catch {
    /* ignore */
  }
  try {
    await fetch(`http://127.0.0.1:${PORT}/json/close/${page.targetId}`)
  } catch {
    /* ignore */
  }
}

// ── Scenario 1: galaxy view, data, search, shortcuts, settings, export ─────
{
  const p = await open(`${BASE}/`)
  record('app boots and splash clears', p.ready)

  if (p.ready) {
    const scene = await ev(p.cdp, `(() => {
      const c = document.querySelector('canvas')
      return c ? { w: c.width, h: c.height, gl: !!(c.getContext('webgl2') || c.getContext('webgl')) } : null
    })()`)
    record('WebGL canvas present and sized', !!scene && scene.w > 0 && scene.gl, JSON.stringify(scene))

    const counts = await ev(p.cdp, `(() => {
      const d = document.getElementById('diag')
      if (!d) return { nodes: 0, links: 0 }
      try { const j = JSON.parse(d.textContent); return { nodes: j.nodes, links: j.links } } catch { return { nodes: 0, links: 0 } }
    })()`)
    record('graph data loaded', counts && counts.nodes > 400 && counts.links > 1000, JSON.stringify(counts))

    const search = await ev(p.cdp, `(async () => {
      const input = document.querySelector('input[type="search"], #search-input, input[placeholder*="搜索"]')
      if (!input) return { found: false }
      input.focus()
      input.value = '霍奇'
      input.dispatchEvent(new Event('input', { bubbles: true }))
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
      await new Promise(r => setTimeout(r, 1500))
      return { found: true, hasResults: /霍奇|Hodge/i.test(document.body.innerText) }
    })()`, true)
    record('search accepts a query and shows matches', !!search?.found && !!search?.hasResults, JSON.stringify(search))

    const kb = await ev(p.cdp, `(async () => {
      document.body.focus()
      window.dispatchEvent(new KeyboardEvent('keydown', { key: '/', bubbles: true }))
      document.dispatchEvent(new KeyboardEvent('keydown', { key: '/', bubbles: true }))
      await new Promise(r => setTimeout(r, 500))
      return { tag: document.activeElement ? document.activeElement.tagName : null }
    })()`, true)
    record('"/" shortcut focuses search input', kb?.tag === 'INPUT', JSON.stringify(kb))

    const settings = await ev(p.cdp, `(async () => {
      const btn = document.getElementById('st-open')
      if (!btn) return { found: false }
      btn.click()
      await new Promise(r => setTimeout(r, 700))
      const panel = document.getElementById('settings')
      return { found: true, opened: panel ? getComputedStyle(panel).display !== 'none' : false }
    })()`, true)
    record('settings panel opens', !!settings?.found && !!settings?.opened, JSON.stringify(settings))

    const exp = await ev(p.cdp, `(async () => {
      const btn = [...document.querySelectorAll('button, a')].find(b => /导出|export/i.test(b.textContent || ''))
      if (!btn) return { found: false }
      let blob = false
      const orig = URL.createObjectURL
      URL.createObjectURL = function(){ blob = true; return 'blob:x' }
      try { btn.click() } finally { URL.createObjectURL = orig }
      await new Promise(r => setTimeout(r, 600))
      return { found: true, blob }
    })()`, true)
    record('export control produces a blob', !!exp?.found && !!exp?.blob, JSON.stringify(exp))
  }
  await close(p)
}

// ── Scenario 2: proof deep link ────────────────────────────────────────────
{
  const p = await open(`${BASE}/?p=flat-morphism`)
  let cards = []
  if (p.ready) {
    for (let i = 0; i < 30; i++) {
      await sleep(700)
      cards = (await ev(p.cdp, `[...document.querySelectorAll('.pv-card h2')].map(h=>h.textContent.trim())`)) || []
      if (Array.isArray(cards) && cards.length) break
    }
  }
  const list = Array.isArray(cards) ? cards : []
  record('?p= deep link opens the proof page', list.length > 0, `${list.length} cards`)
  record('rescued 机制与定位 card renders', list.includes('机制与定位'), '')
  await close(p)
}

// ── Scenario 3: node deep link survives a reload ───────────────────────────
{
  const p = await open(`${BASE}/?n=flat-morphism`)
  const url = p.ready ? String(await ev(p.cdp, `location.href`)) : ''
  record('?n= node deep link reflected in URL', url.includes('flat-morphism'), url.slice(0, 90))
  await close(p)
}

// ── summary ────────────────────────────────────────────────────────────────
const pass = results.filter((r) => r.ok === true).length
const fail = results.filter((r) => r.ok === false).length
console.log(`\n=== SUMMARY ===\nPASS ${pass}   FAIL ${fail}`)
if (fail) {
  console.log('\nfailures:')
  for (const r of results.filter((x) => x.ok === false)) console.log(`  - ${r.name}: ${r.detail}`)
}
process.exit(fail === 0 ? 0 : 2)
