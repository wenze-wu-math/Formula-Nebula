/**
 * Check that every design variant actually loads without errors.
 *
 * These are standalone HTML prototypes under designs/, each with its own
 * entry point and (mostly) its own module graph. Nothing in CI covers them,
 * so they can rot silently — a broken import or a renamed file leaves a page
 * that renders an empty canvas and nobody notices.
 *
 * For each variant: load it in a headless browser, capture console errors,
 * uncaught exceptions and failed requests, and report a verdict.
 *
 * Usage: node scripts/verify-designs.mjs
 */

import { spawn } from 'node:child_process'
import fs from 'node:fs'
import net from 'node:net'
import os from 'node:os'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')

// Each entry: [directory under designs/, display name]
const VARIANTS = [
  ['nebula-plus', '星云修正版 Nebula+'],
  ['atlas', '星图 Atlas Coelestis'],
  ['manuscript', '书页版 Manuscript'],
  ['map', '大陆版 Terra Formularum'],
  ['timeline', '时间线 Timeline'],
  ['papers', '论文浏览器 Papers'],
  ['ai', 'AI 演示'],
  ['collaboration', '协作原型'],
  ['analytics', '分析面板'],
]

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

async function waitPort(port, ms = 45000) {
  const end = Date.now() + ms
  while (Date.now() < end) {
    const ok = await new Promise((res) => {
      const s = net.connect({ port, host: '127.0.0.1' }, () => {
        s.destroy()
        res(true)
      })
      s.on('error', () => res(false))
      s.setTimeout(700, () => {
        s.destroy()
        res(false)
      })
    })
    if (ok) return true
    await sleep(250)
  }
  return false
}

async function waitCdp(port, ms = 45000) {
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

// designs/ is not part of the vite build, so serve the repo root directly.
const PORT = 5800 + Math.floor(Math.random() * 90)
const CDP_PORT = 9800 + Math.floor(Math.random() * 90)
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'fn-designs-'))

let failures = 0
const rows = []

try {
  // The design variants import bare specifiers (`import * as THREE from 'three'`),
  // so they MUST be served by Vite, which rewrites them to real URLs. Serving
  // designs/ with a plain static file server leaves every module failing with
  // "Failed to resolve module specifier three".
  const server = spawn(
    process.execPath,
    [
      path.join(ROOT, 'node_modules', 'vite', 'bin', 'vite.js'),
      '--config', 'vite.designs.config.mjs',
      '--port', String(PORT), '--strictPort',
    ],
    { cwd: ROOT, stdio: 'ignore' }
  )
  kids.push(server)
  if (!(await waitPort(PORT))) throw new Error('vite designs server did not start')

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
        '--window-size=1440,900',
        '--no-sandbox',
        `--remote-debugging-port=${CDP_PORT}`,
        `--user-data-dir=${profile}`,
        'about:blank',
      ],
      { stdio: 'ignore', detached: process.platform !== 'win32' }
    )
  )
  if (!(await waitCdp(CDP_PORT))) throw new Error('browser did not expose CDP')

  for (const [dir, label] of VARIANTS) {
    const entry = path.join(ROOT, 'designs', dir, 'index.html')
    if (!fs.existsSync(entry)) {
      rows.push({ dir, label, status: 'MISSING', detail: 'no designs/' + dir + '/index.html' })
      failures++
      continue
    }

    const target = await (await fetch(`http://127.0.0.1:${CDP_PORT}/json/new?about:blank`, { method: 'PUT' })).json()
    const ws = new WebSocket(target.webSocketDebuggerUrl)
    await new Promise((res, rej) => {
      ws.addEventListener('open', res, { once: true })
      ws.addEventListener('error', rej, { once: true })
    })
    const cdp = new CDP(ws)

    const errors = []
    const exceptions = []
    const failed = []
    cdp.on('Runtime.consoleAPICalled', (p) => {
      if (p.type === 'error') {
        errors.push(
          (p.args || []).map((a) => a.value ?? a.description ?? '').join(' ').slice(0, 200)
        )
      }
    })
    cdp.on('Runtime.exceptionThrown', (p) => {
      const d = p.exceptionDetails || {}
      exceptions.push((d.exception?.description || d.text || '').split('\n')[0].slice(0, 200))
    })
    cdp.on('Network.loadingFailed', (p) => {
      if (p.errorText !== 'net::ERR_ABORTED') failed.push(`${p.type} ${p.errorText}`)
    })

    await cdp.send('Runtime.enable')
    await cdp.send('Page.enable')
    await cdp.send('Network.enable')

    const ev = async (expr) => {
      const r = await cdp.send('Runtime.evaluate', { expression: expr, returnByValue: true })
      return r.result ? r.result.value : undefined
    }

    await cdp.send('Page.navigate', { url: `http://localhost:${PORT}/designs/${dir}/index.html` })
    await sleep(6000)

    // Look for signs of life: a canvas, or substantial rendered text.
    const state = await ev(`(() => ({
      title: document.title,
      canvases: document.querySelectorAll('canvas').length,
      textLen: (document.body.innerText || '').trim().length,
      bodyChildren: document.body.children.length,
    }))()`)

    const alive = !!(state && (state.canvases > 0 || state.textLen > 80))
    const clean = errors.length === 0 && exceptions.length === 0 && failed.length === 0
    const status = !alive ? 'BLANK' : clean ? 'OK' : 'ERRORS'

    rows.push({
      dir,
      label,
      status,
      canvases: state?.canvases ?? 0,
      textLen: state?.textLen ?? 0,
      errors: errors.slice(0, 2),
      exceptions: exceptions.slice(0, 2),
      failed: failed.slice(0, 2),
    })
    if (status !== 'OK') failures++

    try {
      ws.close()
    } catch {
      /* ignore */
    }
    try {
      await fetch(`http://127.0.0.1:${CDP_PORT}/json/close/${target.id}`)
    } catch {
      /* ignore */
    }
  }
} catch (err) {
  console.error('runner error:', err.message)
  failures++
} finally {
  killAll()
  await sleep(1000)
  try {
    fs.rmSync(profile, { recursive: true, force: true })
  } catch {
    /* best effort */
  }
}

console.log('\n═══ Design variants ═══\n')
console.log(`  ${'name'.padEnd(22)} ${'status'.padEnd(8)} canvas  text`)
for (const r of rows) {
  console.log(
    `  ${(r.label || r.dir).padEnd(22)} ${r.status.padEnd(8)} ${String(r.canvases ?? '-').padEnd(7)} ${r.textLen ?? '-'}`
  )
}

const bad = rows.filter((r) => r.status !== 'OK')
if (bad.length) {
  console.log('\n  problems:')
  for (const r of bad) {
    console.log(`    ${r.dir}: ${r.status}${r.detail ? ' — ' + r.detail : ''}`)
    for (const e of r.exceptions || []) console.log(`      exception: ${e}`)
    for (const e of r.errors || []) console.log(`      console:   ${e}`)
    for (const e of r.failed || []) console.log(`      request:   ${e}`)
  }
}

console.log('')
console.log(failures === 0 ? '  ✓ all variants load cleanly' : `  ✗ ${failures} variant(s) need attention`)
process.exit(failures === 0 ? 0 : 1)
