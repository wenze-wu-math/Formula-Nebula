/**
 * Headless runtime probe: loads the built app via Chrome DevTools Protocol and
 * reports real console errors / uncaught exceptions / page state.
 *
 * Uses only Node built-ins (global fetch + global WebSocket, Node >= 22).
 * Writes nothing into the repo.
 *
 * Usage: node scripts/_probe-runtime.mjs http://localhost:5176/ 9222
 */

const URL_TO_LOAD = process.argv[2] || 'http://localhost:5176/'
const PORT = process.argv[3] || '9222'
const WAIT_MS = Number(process.argv[4] || 15000)

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function getTarget() {
  for (let i = 0; i < 40; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/list`)
      const list = await res.json()
      const page = list.find((t) => t.type === 'page' && t.webSocketDebuggerUrl)
      if (page) return page
    } catch {
      /* browser not up yet */
    }
    await sleep(250)
  }
  throw new Error(`no CDP page target on port ${PORT}`)
}

class CDP {
  constructor(ws) {
    this.ws = ws
    this.id = 0
    this.pending = new Map()
    this.handlers = new Map()
    ws.addEventListener('message', (ev) => {
      const msg = JSON.parse(ev.data)
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id)
        this.pending.delete(msg.id)
        msg.error ? reject(new Error(JSON.stringify(msg.error))) : resolve(msg.result)
      } else if (msg.method) {
        const hs = this.handlers.get(msg.method) || []
        for (const h of hs) h(msg.params)
      }
    })
  }
  on(method, fn) {
    if (!this.handlers.has(method)) this.handlers.set(method, [])
    this.handlers.get(method).push(fn)
  }
  send(method, params = {}) {
    const id = ++this.id
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject })
      this.ws.send(JSON.stringify({ id, method, params }))
    })
  }
}

const target = await getTarget()
const ws = new WebSocket(target.webSocketDebuggerUrl)
await new Promise((res, rej) => {
  ws.addEventListener('open', res, { once: true })
  ws.addEventListener('error', rej, { once: true })
})

const cdp = new CDP(ws)
const consoleErrors = []
const consoleWarnings = []
const exceptions = []
const failedRequests = []

cdp.on('Runtime.consoleAPICalled', (p) => {
  const text = (p.args || [])
    .map((a) => a.value ?? a.description ?? a.unserializableValue ?? '')
    .join(' ')
  if (p.type === 'error') consoleErrors.push(text)
  else if (p.type === 'warning') consoleWarnings.push(text)
})
cdp.on('Runtime.exceptionThrown', (p) => {
  const d = p.exceptionDetails || {}
  exceptions.push(d.exception?.description || d.text || JSON.stringify(d))
})
cdp.on('Network.loadingFailed', (p) => {
  failedRequests.push(`${p.type} ${p.errorText}`)
})

await cdp.send('Runtime.enable')
await cdp.send('Page.enable')
await cdp.send('Network.enable')
await cdp.send('Log.enable')

await cdp.send('Page.navigate', { url: URL_TO_LOAD })
await sleep(WAIT_MS)

// Probe observable page state.
const probe = await cdp.send('Runtime.evaluate', {
  expression: `(() => {
    const q = (s) => document.querySelector(s)
    const splash = q('#splash-screen, .splash, #splash')
    return {
      title: document.title,
      readyState: document.readyState,
      canvasCount: document.querySelectorAll('canvas').length,
      canvasSize: (() => { const c = q('canvas'); return c ? [c.width, c.height] : null })(),
      splashPresent: !!splash,
      splashDisplay: splash ? getComputedStyle(splash).display : null,
      splashOpacity: splash ? getComputedStyle(splash).opacity : null,
      bodyChildCount: document.body.children.length,
      hasWebGL: (() => { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')) } catch { return false } })(),
      globals: {
        formulaNebula: typeof window.__formulaNebula,
        splashControl: typeof window.__splashControl,
      },
      visibleTextSample: (document.body.innerText || '').slice(0, 160).replace(/\\s+/g, ' '),
    }
  })()`,
  returnByValue: true,
})

console.log('=== PAGE STATE ===')
console.log(JSON.stringify(probe.result.value, null, 2))

console.log(`\n=== UNCAUGHT EXCEPTIONS (${exceptions.length}) ===`)
exceptions.slice(0, 12).forEach((e) => console.log('  ! ' + String(e).split('\n')[0]))

console.log(`\n=== CONSOLE ERRORS (${consoleErrors.length}) ===`)
consoleErrors.slice(0, 15).forEach((e) => console.log('  x ' + e.slice(0, 200)))

console.log(`\n=== FAILED REQUESTS (${failedRequests.length}) ===`)
failedRequests.slice(0, 15).forEach((e) => console.log('  - ' + e))

console.log(`\n=== CONSOLE WARNINGS (${consoleWarnings.length}) ===`)
consoleWarnings.slice(0, 8).forEach((e) => console.log('  ~ ' + e.slice(0, 160)))

ws.close()
process.exit(0)
