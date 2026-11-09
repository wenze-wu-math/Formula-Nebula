/**
 * Capture README screenshots at views that actually look good.
 *
 * The first attempt just shot whatever the default camera showed: all 4306
 * formulas at once, which reads as a dense smear rather than a structure.
 * A nebula is only legible when you either back off far enough to see the
 * spiral, or move in close enough that individual formulas resolve.
 *
 * This drives the exported scene API (window.__formulaNebula.scene) to pick
 * those views deliberately.
 *
 * Usage: node scripts/capture-screenshots.mjs
 */

import { spawn } from 'node:child_process'
import fs from 'node:fs'
import net from 'node:net'
import os from 'node:os'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const OUT_DIR = path.join(ROOT, 'docs', 'screenshots')

const BROWSERS = [
  process.env.NEBULA_BROWSER,
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].filter(Boolean)

const browser = BROWSERS.find((p) => fs.existsSync(p))
if (!browser) {
  console.log('SKIP: no Chrome/Edge found. Set NEBULA_BROWSER to its path.')
  process.exit(0)
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function waitPort(port, ms = 60000) {
  const end = Date.now() + ms
  while (Date.now() < end) {
    const ok = await new Promise((res) => {
      const s = net.connect({ port, host: '127.0.0.1' }, () => {
        s.destroy()
        res(true)
      })
      s.on('error', () => res(false))
      s.setTimeout(800, () => {
        s.destroy()
        res(false)
      })
    })
    if (ok) return true
    await sleep(300)
  }
  return false
}

async function waitCdp(port, ms = 60000) {
  const end = Date.now() + ms
  while (Date.now() < end) {
    try {
      if ((await fetch(`http://127.0.0.1:${port}/json/version`)).ok) return true
    } catch {
      /* retry */
    }
    await sleep(300)
  }
  return false
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

const kids = []
const killAll = () => {
  for (const c of kids) {
    try {
      if (process.platform === 'win32') spawn('taskkill', ['/PID', String(c.pid), '/T', '/F'], { stdio: 'ignore' })
      else process.kill(-c.pid, 'SIGKILL')
    } catch {
      try {
        c.kill('SIGKILL')
      } catch {
        /* gone */
      }
    }
  }
}
process.on('exit', killAll)
process.on('SIGINT', () => {
  killAll()
  process.exit(130)
})

const PORT = 5700 + Math.floor(Math.random() * 90)
const CDP_PORT = 9700 + Math.floor(Math.random() * 90)
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'fn-shot-'))

let code = 0
try {
  fs.mkdirSync(OUT_DIR, { recursive: true })

  console.log(`[1/3] preview on :${PORT}`)
  kids.push(
    spawn(process.execPath, [path.join(ROOT, 'node_modules', 'vite', 'bin', 'vite.js'), 'preview', '--port', String(PORT), '--strictPort'], {
      cwd: ROOT,
      stdio: 'ignore',
    })
  )
  if (!(await waitPort(PORT))) throw new Error('preview did not start')

  console.log(`[2/3] browser on :${CDP_PORT}`)
  kids.push(
    spawn(
      browser,
      [
        '--headless=new',
        '--use-gl=swiftshader', '--enable-unsafe-swiftshader',
        '--no-first-run',
        '--no-default-browser-check',
        '--disable-extensions',
        '--hide-scrollbars',
        '--force-device-scale-factor=1',
        '--window-size=1600,900',
        '--no-sandbox',
        `--remote-debugging-port=${CDP_PORT}`,
        `--user-data-dir=${profile}`,
        'about:blank',
      ],
      { stdio: 'ignore', detached: process.platform !== 'win32' }
    )
  )
  if (!(await waitCdp(CDP_PORT))) throw new Error('browser did not expose CDP')

  const target = await (await fetch(`http://127.0.0.1:${CDP_PORT}/json/new?about:blank`, { method: 'PUT' })).json()
  const ws = new WebSocket(target.webSocketDebuggerUrl)
  await new Promise((res, rej) => {
    ws.addEventListener('open', res, { once: true })
    ws.addEventListener('error', rej, { once: true })
  })
  const cdp = new CDP(ws)
  await cdp.send('Runtime.enable')
  await cdp.send('Page.enable')
  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width: 1600,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  })

  const ev = async (expr, awaitPromise = false) => {
    const r = await cdp.send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise })
    if (r.exceptionDetails) return { __err: r.exceptionDetails.text }
    return r.result ? r.result.value : undefined
  }

  const shoot = async (name) => {
    const { data } = await cdp.send('Page.captureScreenshot', { format: 'png' })
    const file = path.join(OUT_DIR, name)
    fs.writeFileSync(file, Buffer.from(data, 'base64'))
    console.log(`    docs/screenshots/${name}  (${Math.round(fs.statSync(file).size / 1024)} KB)`)
  }

  const boot = async (url) => {
    await cdp.send('Page.navigate', { url })
    let ready = false
    for (let i = 0; i < 180; i++) {
      await sleep(1000)
      const st = await ev(`(() => { const s = document.getElementById('splash'); return s ? getComputedStyle(s).display : 'gone' })()`)
      if (st === 'none' || st === 'gone') {
        ready = true
        break
      }
    }
    if (!ready) throw new Error('app never finished loading')
    // Dismiss the first-run tutorial: it dims everything behind a scrim.
    await ev(`(() => {
      const skip = [...document.querySelectorAll('button, a, span')]
        .find(el => /跳过教程|跳过|skip/i.test((el.textContent || '').trim()))
      if (skip) skip.click()
      for (const sel of ['.tutorial-overlay', '.tutorial-tooltip', '[class*="tutorial"]']) {
        for (const el of document.querySelectorAll(sel)) el.remove()
      }
      return true
    })()`)
    await sleep(1200)
  }

  /** Aim the camera: distance multiplier and optional target height. */
  const aim = async (distanceMul, height = 0) =>
    ev(`(() => {
      const s = window.__formulaNebula && window.__formulaNebula.scene
      if (!s || !s.camera) return 'no-scene'
      const cam = s.camera
      // Pull the camera along its current direction, scaled.
      const dir = cam.position.clone().normalize()
      const len = cam.position.length() * ${distanceMul}
      cam.position.copy(dir.multiplyScalar(len))
      cam.position.y += ${height}
      cam.lookAt(0, 0, 0)
      return 'ok'
    })()`)

  console.log('[3/3] capturing')

  // ── 1. overview: far enough back for the spiral to read as a shape ────
  await boot(`http://localhost:${PORT}/`)
  console.log('    aim(overview):', await aim(1.45))
  await sleep(2500)
  await shoot('01-overview.png')

  // ── 2. close-in: individual formulas become legible ───────────────────
  console.log('    aim(close):', await aim(0.42, 20))
  await sleep(2500)
  await shoot('02-closeup.png')

  // ── 3. ring shape, framed wide ────────────────────────────────────────
  await boot(`http://localhost:${PORT}/#v1&s=ring`)
  console.log('    aim(ring):', await aim(1.35))
  await sleep(2500)
  await shoot('03-ring.png')

  // ── 4. proof page ─────────────────────────────────────────────────────
  await boot(`http://localhost:${PORT}/?p=flat-morphism`)
  for (let i = 0; i < 120; i++) {
    await sleep(800)
    if ((await ev(`document.querySelectorAll('.pv-card').length`)) > 3) break
  }
  await sleep(1200)
  await shoot('04-proof-page.png')

  // ── 5. search in action ───────────────────────────────────────────────
  await boot(`http://localhost:${PORT}/`)
  await aim(1.3)
  await ev(`(async () => {
    const input = document.querySelector('#search input, input[type="search"]')
    if (!input) return false
    input.focus()
    input.value = 'status:open'
    input.dispatchEvent(new Event('input', { bubbles: true }))
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
    await new Promise(r => setTimeout(r, 1800))
    return true
  })()`, true)
  await sleep(1500)
  await shoot('05-search.png')

  ws.close()
} catch (err) {
  console.error('\nERROR:', err.message)
  code = 1
} finally {
  killAll()
  await sleep(1200)
  try {
    fs.rmSync(profile, { recursive: true, force: true })
  } catch {
    /* best effort */
  }
}

console.log(code === 0 ? '\nscreenshots captured' : '\nfailed')
process.exit(code)
