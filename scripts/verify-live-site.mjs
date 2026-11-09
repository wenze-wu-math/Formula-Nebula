/**
 * Verify the LIVE GitHub Pages deployment in a real browser.
 *
 * Everything up to now was verified against a local preview. This loads the
 * actual published URL and checks that the app boots, renders the WebGL scene,
 * and that the deep links work under the /Formula-Nebula/ sub-path — which is
 * the thing most likely to break on Pages and cannot be tested locally.
 *
 * Usage: node scripts/verify-live-site.mjs [url]
 */

import { spawn, execFileSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const URL_TO_TEST = process.argv[2] || 'https://wenze-wu-math.github.io/Formula-Nebula/'
const _ROOT = path.resolve(import.meta.dirname, '..')

const BROWSERS = [
  process.env.NEBULA_BROWSER,
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
].filter(Boolean)
const browser = BROWSERS.find((p) => fs.existsSync(p))
if (!browser) {
  console.log('SKIP: no Chrome/Edge found.')
  process.exit(0)
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function waitCdp(port, ms = 40000) {
  const end = Date.now() + ms
  while (Date.now() < end) {
    try {
      if ((await fetch(`http://127.0.0.1:${port}/json/version`)).ok) return true
    } catch {
      /* retry */
    }
    await sleep(250)
  }
  return false
}

class CDP {
  constructor(ws) {
    this.ws = ws
    this.id = 0
    this.pending = new Map()
    this.listeners = new Map()
    ws.addEventListener('message', (e) => {
      const m = JSON.parse(e.data)
      if (m.id && this.pending.has(m.id)) {
        const { resolve, reject } = this.pending.get(m.id)
        this.pending.delete(m.id)
        m.error ? reject(new Error(JSON.stringify(m.error))) : resolve(m.result)
      } else if (m.method && this.listeners.has(m.method)) {
        for (const fn of this.listeners.get(m.method)) fn(m.params)
      }
    })
  }
  on(method, fn) {
    if (!this.listeners.has(method)) this.listeners.set(method, [])
    this.listeners.get(method).push(fn)
  }
  send(method, params = {}) {
    const id = ++this.id
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject })
      this.ws.send(JSON.stringify({ id, method, params }))
    })
  }
}

const CDP_PORT = 9985
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'fn-live-'))
let child = null

/**
 * Kill the browser we started, and anything headless that escaped it.
 *
 * Two bugs were here before, both of which leaked a process:
 *   1. spawn('taskkill', ...) is ASYNC and we immediately process.exit(), so
 *      the taskkill child was killed before it could do its job.
 *   2. taskkill /T only follows the parent's process tree; a re-parented
 *      renderer subprocess is not in it.
 * Now: synchronous taskkill for the tree, then a name sweep for stragglers.
 */
const kill = () => {
  try {
    if (child && child.pid) {
      if (process.platform === 'win32') {
        execFileSync('taskkill', ['/PID', String(child.pid), '/T', '/F'], { stdio: 'ignore', timeout: 10000 })
      } else {
        process.kill(-child.pid, 'SIGKILL')
      }
    }
  } catch {
    /* gone */
  }
  try {
    if (process.platform === 'win32') {
      execFileSync(
        'powershell',
        [
          '-NoProfile',
          '-Command',
          "Get-CimInstance Win32_Process -Filter \"Name='msedge.exe'\" | Where-Object { $_.CommandLine -like '*--headless*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }",
        ],
        { stdio: 'ignore', timeout: 10000 }
      )
    }
  } catch {
    /* best effort */
  }
}
/** Number of headless browser processes still alive (Windows only). */
function countHeadless() {
  if (process.platform !== 'win32') return 0
  try {
    const out = execFileSync(
      'powershell',
      [
        '-NoProfile',
        '-Command',
        "(Get-CimInstance Win32_Process -Filter \"Name='msedge.exe'\" | Where-Object { $_.CommandLine -like '*--headless*' } | Measure-Object).Count",
      ],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: 10000 }
    )
    return parseInt(out.trim(), 10) || 0
  } catch {
    return 0
  }
}

process.on('exit', kill)

let failures = 0
const check = (name, ok, detail = '') => {
  if (ok) console.log(`  ✓ ${name}${detail ? ' — ' + detail : ''}`)
  else {
    failures++
    console.log(`  ✗ ${name}${detail ? ' — ' + detail : ''}`)
  }
}

try {
  console.log(`\ntarget: ${URL_TO_TEST}\n`)

  child = spawn(
    browser,
    [
      '--headless=new',
      '--use-gl=swiftshader', '--enable-unsafe-swiftshader',
      '--no-first-run',
      '--disable-extensions',
      '--hide-scrollbars',
      '--window-size=1440,900',
      '--no-sandbox',
      `--remote-debugging-port=${CDP_PORT}`,
      `--user-data-dir=${profile}`,
      'about:blank',
    ],
    { stdio: 'ignore', detached: process.platform !== 'win32' }
  )
  if (!(await waitCdp(CDP_PORT))) throw new Error('browser did not expose CDP')

  const target = await (await fetch(`http://127.0.0.1:${CDP_PORT}/json/new?about:blank`, { method: 'PUT' })).json()
  const ws = new WebSocket(target.webSocketDebuggerUrl)
  await new Promise((res, rej) => {
    ws.addEventListener('open', res, { once: true })
    ws.addEventListener('error', rej, { once: true })
  })
  const cdp = new CDP(ws)

  const consoleErrors = []
  const exceptions = []
  const failedRequests = []
  cdp.on('Runtime.consoleAPICalled', (p) => {
    if (p.type === 'error') {
      consoleErrors.push((p.args || []).map((a) => a.value ?? a.description ?? '').join(' ').slice(0, 200))
    }
  })
  cdp.on('Runtime.exceptionThrown', (p) => {
    exceptions.push((p.exceptionDetails?.exception?.description || p.exceptionDetails?.text || '').split('\n')[0])
  })
  cdp.on('Network.loadingFailed', (p) => {
    if (p.errorText !== 'net::ERR_ABORTED') failedRequests.push(`${p.type} ${p.errorText}`)
  })

  await cdp.send('Runtime.enable')
  await cdp.send('Page.enable')
  await cdp.send('Network.enable')

  const ev = async (expr, awaitPromise = false) => {
    const r = await cdp.send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise })
    if (r.exceptionDetails) return { __err: r.exceptionDetails.text }
    return r.result ? r.result.value : undefined
  }

  await cdp.send('Page.navigate', { url: URL_TO_TEST })

  // Wait for the splash to clear (the app bakes 4306 formulas).
  let ready = false
  for (let i = 0; i < 200; i++) {
    await sleep(1000)
    const st = await ev(`(() => { const s = document.getElementById('splash'); return s ? getComputedStyle(s).display : 'gone' })()`)
    if (st === 'none' || st === 'gone') {
      ready = true
      break
    }
  }
  check('app boots and splash clears', ready)

  if (ready) {
    const scene = await ev(`(() => {
      const c = document.querySelector('canvas')
      return c ? { w: c.width, h: c.height, gl: !!(c.getContext('webgl2') || c.getContext('webgl')) } : null
    })()`)
    check('WebGL canvas live', !!scene && scene.w > 0 && !!scene.gl, JSON.stringify(scene))

    const counts = await ev(`(() => {
      const d = document.getElementById('diag')
      if (!d) return null
      try { const j = JSON.parse(d.textContent); return { nodes: j.nodes, links: j.links, built: j.built } } catch { return null }
    })()`)
    check('graph fully built', !!counts && counts.nodes > 4000, JSON.stringify(counts))

    const title = await ev('document.title')
    check('page title present', typeof title === 'string' && title.length > 0, title)
  }

  // Proof deep link under the sub-path.
  await cdp.send('Page.navigate', { url: `${URL_TO_TEST}?p=flat-morphism` })
  let cards = []
  for (let i = 0; i < 90; i++) {
    await sleep(1000)
    cards = (await ev(`[...document.querySelectorAll('.pv-card h2')].map(h => h.textContent.trim())`)) || []
    if (Array.isArray(cards) && cards.length > 0) break
  }
  check('proof deep link works on the live site', Array.isArray(cards) && cards.length > 0, `${Array.isArray(cards) ? cards.length : 0} cards`)
  check('rescued 机制与定位 card renders live', Array.isArray(cards) && cards.includes('机制与定位'))

  check('no uncaught exceptions', exceptions.length === 0, exceptions.slice(0, 2).join(' | '))
  check('no failed requests', failedRequests.length === 0, failedRequests.slice(0, 2).join(' | '))
  check('no console errors', consoleErrors.length === 0, consoleErrors.slice(0, 2).join(' | '))

  ws.close()
} catch (e) {
  failures++
  console.error('ERR:', e.message)
} finally {
  kill()
  await sleep(900)
  // One more sweep after the sleep: a renderer subprocess can be spawned
  // during teardown, after the first kill already ran. Then VERIFY rather than
  // assume — this script's whole job is to check things, so it should not
  // claim a clean exit while leaving a browser holding a WebGL context.
  kill()
  await sleep(600)
  const leftover = countHeadless()
  if (leftover > 0) {
    console.log(`  ! ${leftover} headless process(es) still alive, sweeping again`)
    kill()
    await sleep(800)
  }
  if (countHeadless() > 0) {
    failures++
    console.log('  ✗ 清理未完成：仍有 headless 进程残留')
  }
  try {
    fs.rmSync(profile, { recursive: true, force: true })
  } catch {
    /* best effort */
  }
}

console.log(failures === 0 ? '\nLIVE SITE OK' : `\n${failures} check(s) failed`)
process.exit(failures === 0 ? 0 : 1)
