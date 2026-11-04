/**
 * Verify the designs gallery page: it must load, list every variant, and every
 * card link must resolve to a page that exists.
 *
 * The gallery is the entry point for the alternative front-end designs
 * (2D atlas, city map, book/manuscript, timeline, papers, AI demo,
 * collaboration, analytics). If it drifts out of sync with the directories on
 * disk, those prototypes become unreachable — which is exactly what had
 * happened: four variants existed but were not listed.
 *
 * Usage: node scripts/verify-gallery.mjs
 */

import { spawn } from 'node:child_process'
import fs from 'node:fs'
import net from 'node:net'
import os from 'node:os'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')

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

const PORT = 5900 + Math.floor(Math.random() * 80)
const CDP_PORT = 9900 + Math.floor(Math.random() * 80)
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'fn-gallery-'))

// Assigned once at the end from problems.length; no initial value needed.
let failures
const problems = []

try {
  // Serve through Vite so bare imports resolve.
  kids.push(
    spawn(
      process.execPath,
      [path.join(ROOT, 'node_modules', 'vite', 'bin', 'vite.js'), '--config', 'vite.designs.config.mjs', '--port', String(PORT), '--strictPort'],
      { cwd: ROOT, stdio: 'ignore' }
    )
  )
  if (!(await waitPort(PORT))) throw new Error('vite did not start')

  kids.push(
    spawn(
      browser,
      [
        '--headless=new',
        '--disable-gpu',
        '--no-first-run',
        '--disable-extensions',
        '--window-size=1440,1000',
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

  let id = 0
  const pending = new Map()
  const errors = []
  ws.addEventListener('message', (e) => {
    const m = JSON.parse(e.data)
    if (m.id && pending.has(m.id)) {
      pending.get(m.id)(m.result)
      pending.delete(m.id)
    } else if (m.method === 'Runtime.exceptionThrown') {
      errors.push((m.params.exceptionDetails?.exception?.description || '').split('\n')[0])
    }
  })
  const send = (method, params = {}) =>
    new Promise((res) => {
      const i = ++id
      pending.set(i, res)
      ws.send(JSON.stringify({ id: i, method, params }))
    })
  const ev = async (expr) => {
    const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true })
    return r.result ? r.result.value : undefined
  }

  await send('Runtime.enable')
  await send('Page.enable')
  await send('Page.navigate', { url: `http://localhost:${PORT}/designs/index.html` })
  await sleep(4000)

  // Collect rendered cards and their hrefs.
  const cards = await ev(`(() => [...document.querySelectorAll('a.card')].map(a => ({
    href: a.getAttribute('href'),
    title: (a.querySelector('h2') || {}).textContent || '',
  })))()`)

  console.log('\n═══ Designs gallery ═══\n')
  console.log(`  rendered cards: ${cards ? cards.length : 0}`)

  if (!cards || cards.length === 0) {
    problems.push('gallery rendered no cards')
  } else {
    for (const c of cards) console.log(`    ${c.title.padEnd(24)} -> ${c.href}`)
  }

  // Every directory under designs/ that has an index.html should be listed.
  const dirs = fs
    .readdirSync(path.join(ROOT, 'designs'), { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .filter((n) => fs.existsSync(path.join(ROOT, 'designs', n, 'index.html')))
    .filter((n) => n !== 'shared')

  const listed = new Set(
    (cards || [])
      .map((c) => (c.href || '').replace(/^\.\//, '').replace(/\/$/, ''))
      .filter(Boolean)
  )
  const missing = dirs.filter((d) => !listed.has(d))
  if (missing.length) {
    problems.push(`directory exists but is not listed in the gallery: ${missing.join(', ')}`)
  } else {
    console.log(`\n  ✓ all ${dirs.length} variant directories are listed`)
  }

  // Every card href must resolve.
  let bad = 0
  for (const c of cards || []) {
    const url = new URL(c.href, `http://localhost:${PORT}/designs/index.html`).href
    const res = await fetch(url, { method: 'GET' })
    if (!res.ok) {
      problems.push(`card "${c.title}" -> ${c.href} returns ${res.status}`)
      bad++
    }
  }
  if (!bad) console.log('  ✓ every card link resolves')

  if (errors.length) {
    problems.push(`page threw ${errors.length} exception(s): ${errors[0]}`)
  }

  ws.close()
} catch (err) {
  problems.push(`runner error: ${err.message}`)
} finally {
  killAll()
  await sleep(900)
  try {
    fs.rmSync(profile, { recursive: true, force: true })
  } catch {
    /* best effort */
  }
}

failures = problems.length
console.log('')
if (failures) {
  for (const p of problems) console.log(`  ✗ ${p}`)
  process.exit(1)
}
console.log('  ✓ gallery is complete and every link resolves')
process.exit(0)
