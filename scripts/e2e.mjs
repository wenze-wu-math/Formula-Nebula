/**
 * One-command browser E2E: builds nothing, but starts a preview server,
 * launches a headless browser, runs both suites, and always cleans up.
 *
 * Why this exists: the two _e2e-*.mjs suites need a preview server plus a
 * browser with a DevTools port, and that setup was previously done by hand
 * from the shell. Forgetting to kill the browser leaked processes across
 * runs. This runner owns the whole lifecycle in one process.
 *
 * Requires a browser binary. Set NEBULA_BROWSER to override; otherwise the
 * usual Chrome/Edge locations are probed. If none is found the runner exits 0
 * with a clear SKIP message, so it never fails a machine that cannot host a
 * browser.
 *
 * Usage: node scripts/e2e.mjs [--keep]
 */

import { spawn } from 'node:child_process'
import fs from 'node:fs'
import net from 'node:net'
import os from 'node:os'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const KEEP = process.argv.includes('--keep')

const BROWSER_CANDIDATES = [
  process.env.NEBULA_BROWSER,
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].filter(Boolean)

const findBrowser = () => BROWSER_CANDIDATES.find((p) => fs.existsSync(p))

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

/** Wait until a TCP port accepts connections. */
async function waitForPort(port, timeoutMs = 60000) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    const ok = await new Promise((resolve) => {
      const s = net.connect({ port, host: '127.0.0.1' }, () => {
        s.destroy()
        resolve(true)
      })
      s.on('error', () => resolve(false))
      s.setTimeout(1000, () => {
        s.destroy()
        resolve(false)
      })
    })
    if (ok) return true
    await sleep(400)
  }
  return false
}

/** Wait until the CDP /json/version endpoint answers. */
async function waitForCdp(port, timeoutMs = 60000) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    try {
      const r = await fetch(`http://127.0.0.1:${port}/json/version`)
      if (r.ok) return true
    } catch {
      /* not up yet */
    }
    await sleep(400)
  }
  return false
}

const children = []
function track(child) {
  children.push(child)
  return child
}

function killAll() {
  for (const c of children) {
    try {
      if (process.platform === 'win32') {
        // Kill the whole tree: chrome spawns many helper processes.
        spawn('taskkill', ['/PID', String(c.pid), '/T', '/F'], { stdio: 'ignore' })
      } else {
        process.kill(-c.pid, 'SIGKILL')
      }
    } catch {
      try {
        c.kill('SIGKILL')
      } catch {
        /* already gone */
      }
    }
  }
}

process.on('exit', killAll)
process.on('SIGINT', () => {
  killAll()
  process.exit(130)
})

const browser = findBrowser()
if (!browser) {
  console.log('SKIP: no Chrome/Edge binary found. Set NEBULA_BROWSER to its path.')
  process.exit(0)
}
console.log('browser:', browser)

const PORT = 5500 + Math.floor(Math.random() * 200)
const CDP_PORT = 9500 + Math.floor(Math.random() * 200)
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'fn-e2e-'))

let exitCode = 0
try {
  // 1. preview server
  console.log(`\n[1/4] starting preview on :${PORT}`)
  const viteBin = path.join(ROOT, 'node_modules', 'vite', 'bin', 'vite.js')
  track(
    spawn(process.execPath, [viteBin, 'preview', '--port', String(PORT), '--strictPort'], {
      cwd: ROOT,
      stdio: 'ignore',
    })
  )
  if (!(await waitForPort(PORT))) throw new Error('preview server did not come up')

  // 2. browser
  console.log(`[2/4] launching headless browser on CDP :${CDP_PORT}`)
  track(
    spawn(
      browser,
      [
        '--headless=new',
        '--disable-gpu',
        '--no-first-run',
        '--no-default-browser-check',
        '--disable-extensions',
        '--disable-component-extensions-with-background-pages',
        '--window-size=1280,900',
        '--no-sandbox',
        `--remote-debugging-port=${CDP_PORT}`,
        `--user-data-dir=${profile}`,
        'about:blank',
      ],
      { stdio: 'ignore', detached: process.platform !== 'win32' }
    )
  )
  if (!(await waitForCdp(CDP_PORT))) throw new Error('browser did not expose a CDP port')

  // 3. suites
  const base = `http://localhost:${PORT}`
  for (const [label, script] of [
    ['features', 'scripts/_e2e-features.mjs'],
    ['controls', 'scripts/_e2e-controls.mjs'],
  ]) {
    console.log(`\n[3/4] ${label}`)
    const code = await new Promise((resolve) => {
      const c = spawn(process.execPath, [path.join(ROOT, script), base, String(CDP_PORT)], {
        cwd: ROOT,
        stdio: 'inherit',
      })
      c.on('exit', (code2) => resolve(code2 ?? 1))
    })
    if (code !== 0) exitCode = code
  }
} catch (err) {
  console.error('\nE2E runner error:', err.message)
  exitCode = 1
} finally {
  console.log('\n[4/4] cleaning up')
  if (KEEP) {
    console.log('--keep given; leaving processes running on ports', PORT, CDP_PORT)
  } else {
    killAll()
    await sleep(1500)
    try {
      fs.rmSync(profile, { recursive: true, force: true })
    } catch {
      /* best effort */
    }
  }
}

console.log(exitCode === 0 ? '\nE2E: OK' : '\nE2E: FAILED')
process.exit(exitCode)
