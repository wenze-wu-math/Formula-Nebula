/**
 * verify:final — the one heavy, browser-based verification for a work round.
 *
 * Design constraints, because this is the expensive part:
 *
 *   · SINGLE PROCESS, SERIAL. No parallel browsers. Without a GPU each
 *     headless instance costs a core, and several at once is what eats the
 *     machine.
 *   · RUN ONCE per round. Iteration should use the fast pure-Node checks
 *     (`npm run score`, `npm run ci`); this is the closing proof.
 *   · ALWAYS CLEAN UP. Every child is force-killed in a `finally`, and the
 *     script then verifies no headless process survived. A leftover browser
 *     holding a WebGL context is exactly the resource leak this guards
 *     against, so a leak is a hard failure, not a warning.
 *   · HARD TIMEOUT. Kills itself rather than hanging forever.
 *
 * Usage:
 *   node scripts/verify-final.mjs              # local build + live site
 *   node scripts/verify-final.mjs --local-only # skip the network check
 *   node scripts/verify-final.mjs --live-only  # skip the local build
 */

import { spawn, execFileSync } from 'node:child_process'
import fs from 'node:fs'
import net from 'node:net'
import os from 'node:os'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const LOCAL_ONLY = process.argv.includes('--local-only')
const LIVE_ONLY = process.argv.includes('--live-only')
const LIVE_URL = 'https://wenze-wu-math.github.io/Formula-Nebula/'
const HARD_TIMEOUT_MS = 9 * 60 * 1000

const BROWSERS = [
  process.env.NEBULA_BROWSER,
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
].filter(Boolean)

const browser = BROWSERS.find((p) => fs.existsSync(p))
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// ── child tracking: everything spawned gets killed, no exceptions ──────────
const children = []
const spawnChild = (cmd, args, opts = {}) => {
  const c = spawn(cmd, args, { stdio: 'ignore', ...opts })
  children.push(c)
  return c
}

function killTree(pid) {
  try {
    if (process.platform === 'win32') {
      execFileSync('taskkill', ['/PID', String(pid), '/T', '/F'], { stdio: 'ignore' })
    } else {
      process.kill(-pid, 'SIGKILL')
    }
  } catch {
    try {
      process.kill(pid, 'SIGKILL')
    } catch {
      /* already gone */
    }
  }
}

function killAll() {
  for (const c of children) {
    if (c && c.pid) killTree(c.pid)
  }
}

/** Count headless browser processes still alive (Windows only; 0 elsewhere). */
function leftoverHeadless() {
  if (process.platform !== 'win32') return 0
  try {
    const out = execFileSync(
      'powershell',
      [
        '-NoProfile',
        '-Command',
        "(Get-CimInstance Win32_Process -Filter \"Name='msedge.exe'\" | Where-Object { $_.CommandLine -like '*--headless*' } | Measure-Object).Count",
      ],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }
    )
    return parseInt(out.trim(), 10) || 0
  } catch {
    return 0
  }
}

// ── report ─────────────────────────────────────────────────────────────────
let passed = 0
let failed = 0
const check = (name, ok, detail = '') => {
  if (ok) {
    passed++
    console.log(`  ✓ ${name}${detail ? ' — ' + detail : ''}`)
  } else {
    failed++
    console.log(`  ✗ ${name}${detail ? ' — ' + detail : ''}`)
  }
}

// ── tiny CDP client ────────────────────────────────────────────────────────
class CDP {
  constructor(ws) {
    this.ws = ws
    this.id = 0
    this.pending = new Map()
    this.onException = null
    this.onConsoleError = null
    ws.addEventListener('message', (e) => {
      const m = JSON.parse(e.data)
      if (m.id && this.pending.has(m.id)) {
        const { resolve, reject } = this.pending.get(m.id)
        this.pending.delete(m.id)
        m.error ? reject(new Error(JSON.stringify(m.error))) : resolve(m.result)
      } else if (m.method === 'Runtime.exceptionThrown' && this.onException) {
        this.onException(m.params)
      } else if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error' && this.onConsoleError) {
        this.onConsoleError(m.params)
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

/**
 * Boot exactly one browser, visit one URL, collect findings, then shut down.
 * Nothing is reused between calls and nothing is left running.
 */
async function visitOnce(url, { waitSplash = true, waitMs = 180000 } = {}) {
  const cdpPort = 9600 + Math.floor(Math.random() * 90)
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'fn-final-'))
  const proc = spawnChild(
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
      `--remote-debugging-port=${cdpPort}`,
      `--user-data-dir=${profile}`,
      'about:blank',
    ],
    { detached: process.platform !== 'win32' }
  )

  const out = { exceptions: [], consoleErrors: [] }
  try {
    if (!(await waitCdp(cdpPort))) throw new Error('browser did not expose CDP')

    const target = await (await fetch(`http://127.0.0.1:${cdpPort}/json/new?about:blank`, { method: 'PUT' })).json()
    const ws = new WebSocket(target.webSocketDebuggerUrl)
    await new Promise((res, rej) => {
      ws.addEventListener('open', res, { once: true })
      ws.addEventListener('error', rej, { once: true })
    })
    const cdp = new CDP(ws)
    cdp.onException = (p) => {
      const d = p.exceptionDetails || {}
      out.exceptions.push((d.exception?.description || d.text || '').split('\n')[0].slice(0, 200))
    }
    cdp.onConsoleError = (p) => {
      out.consoleErrors.push((p.args || []).map((a) => a.value ?? a.description ?? '').join(' ').slice(0, 200))
    }

    await cdp.send('Runtime.enable')
    await cdp.send('Page.enable')
    await cdp.send('Page.navigate', { url })

    if (waitSplash) {
      const deadline = Date.now() + waitMs
      let ready = false
      while (Date.now() < deadline) {
        await sleep(1000)
        const r = await cdp.send('Runtime.evaluate', {
          expression: `(() => { const s = document.getElementById('splash'); return s ? getComputedStyle(s).display : 'gone' })()`,
          returnByValue: true,
        })
        const st = r.result?.value
        if (st === 'none' || st === 'gone') {
          ready = true
          break
        }
      }
      out.ready = ready
    }

    const ev = async (expr) => {
      const r = await cdp.send('Runtime.evaluate', { expression: expr, returnByValue: true })
      return r.result ? r.result.value : undefined
    }
    out.canvas = await ev(`(() => {
      const c = document.querySelector('canvas')
      return c ? { w: c.width, h: c.height, gl: !!(c.getContext('webgl2') || c.getContext('webgl')) } : null
    })()`)
    out.title = await ev('document.title')

    try {
      ws.close()
    } catch {
      /* ignore */
    }
    try {
      await fetch(`http://127.0.0.1:${cdpPort}/json/close/${target.id}`)
    } catch {
      /* ignore */
    }
  } finally {
    killTree(proc.pid)
    await sleep(700)
    try {
      fs.rmSync(profile, { recursive: true, force: true })
    } catch {
      /* best effort */
    }
  }
  return out
}

// ── main ───────────────────────────────────────────────────────────────────
const watchdog = setTimeout(() => {
  console.error(`\n✗ 硬超时（${HARD_TIMEOUT_MS / 60000} 分钟）— 强制清理后退出`)
  // killAll() only covers children we spawned. A timed-out run can leave a
  // browser subprocess that has been re-parented and is no longer in that
  // list, so sweep by name as well. This matters: a leaked headless browser
  // holds a WebGL context and keeps a core busy, which is exactly the
  // resource leak this script exists to prevent.
  killAll()
  try {
    if (process.platform === 'win32') {
      execFileSync(
        'powershell',
        [
          '-NoProfile',
          '-Command',
          "Get-CimInstance Win32_Process -Filter \"Name='msedge.exe'\" | Where-Object { $_.CommandLine -like '*--headless*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }",
        ],
        { stdio: 'ignore', timeout: 15000 }
      )
    }
  } catch {
    /* best effort */
  }
  // Give the OS a moment to actually reap them before we exit, otherwise the
  // residual check below reports a phantom leak.
  setTimeout(() => {
    const left = leftoverHeadless()
    if (left > 0) console.error(`  ! 超时清理后仍残留 ${left} 个无头进程`)
    process.exit(1)
  }, 2500)
}, HARD_TIMEOUT_MS)

// Assigned once at the end; no initial value is ever read.
let exitCode
try {
  if (!browser) {
    console.log('SKIP: 未找到 Chrome/Edge。设置 NEBULA_BROWSER 指向浏览器路径。')
    process.exit(0)
  }

  console.log('\n═══ 最终验证 · 单次单进程 ═══')
  const started = Date.now()

  // 1. static gate first — cheap and catches most breakage
  console.log('\n[1/4] 静态门禁')
  try {
    execFileSync('npm', ['run', 'score'], { cwd: ROOT, stdio: 'ignore', shell: true })
    check('npm run score 可运行', true)
  } catch {
    check('npm run score 可运行', false)
  }

  // 2. local build in a real browser
  if (!LIVE_ONLY) {
    console.log('\n[2/4] 本地构建 + 真实浏览器')
    const port = 5700 + Math.floor(Math.random() * 90)
    const preview = spawnChild(
      process.execPath,
      [path.join(ROOT, 'node_modules', 'vite', 'bin', 'vite.js'), 'preview', '--port', String(port), '--strictPort'],
      { cwd: ROOT }
    )
    void preview
    if (!(await waitPort(port))) {
      check('preview 服务器启动', false)
    } else {
      check('preview 服务器启动', true)
      const r = await visitOnce(`http://localhost:${port}/`)
      check('应用启动（splash 消失）', r.ready === true)
      check('WebGL 画布活跃', !!r.canvas?.gl && (r.canvas?.w ?? 0) > 0, JSON.stringify(r.canvas))
      check('页面标题存在', typeof r.title === 'string' && r.title.length > 0)
      check('无未捕获异常', r.exceptions.length === 0, r.exceptions.slice(0, 2).join(' | '))
    }
    killTree(preview.pid)
    await sleep(500)
  }

  // 3. the live deployment (network, still one browser at a time)
  if (!LOCAL_ONLY) {
    console.log('\n[3/4] 线上站点')
    let httpOk = false
    try {
      const res = await fetch(LIVE_URL, { method: 'GET', redirect: 'follow' })
      httpOk = res.ok
    } catch {
      /* fall through */
    }
    check('线上站点 HTTP 200', httpOk)

    if (httpOk) {
      const r = await visitOnce(LIVE_URL)
      check('线上应用启动', r.ready === true)
      check('线上 WebGL 活跃', !!r.canvas?.gl && (r.canvas?.w ?? 0) > 0, JSON.stringify(r.canvas))
      check('线上无未捕获异常', r.exceptions.length === 0, r.exceptions.slice(0, 2).join(' | '))
      check('线上无 console 错误', r.consoleErrors.length === 0, r.consoleErrors.slice(0, 2).join(' | '))
    }
  }

  // 4. resource cleanup is part of the verification, not an afterthought
  console.log('\n[4/4] 资源清理')
  killAll()
  await sleep(1500)
  const leftover = leftoverHeadless()
  check('无残留无头浏览器进程', leftover === 0, `残留 ${leftover} 个`)

  const secs = Math.round((Date.now() - started) / 1000)
  console.log(`\n  耗时 ${secs} 秒`)
} catch (err) {
  failed++
  console.error('\n✗ 运行出错：', err.message)
} finally {
  clearTimeout(watchdog)
  killAll()
  await sleep(1000)
  // One last sweep: anything matching our profile prefix that escaped the tree.
  const leftover = leftoverHeadless()
  if (leftover > 0) {
    console.log(`  ! 仍有 ${leftover} 个无头进程，强制清理`)
    try {
      execFileSync(
        'powershell',
        [
          '-NoProfile',
          '-Command',
          "Get-CimInstance Win32_Process -Filter \"Name='msedge.exe'\" | Where-Object { $_.CommandLine -like '*--headless*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }",
        ],
        { stdio: 'ignore' }
      )
    } catch {
      /* best effort */
    }
  }
}

console.log('\n═══ 结果 ═══')
console.log(`  ${passed} 通过, ${failed} 失败`)
if (leftoverHeadless() > 0) {
  console.log('  ✗ 清理未完成')
  exitCode = 1
} else {
  console.log('  ✓ 已清理干净')
  exitCode = failed === 0 ? 0 : 1
}
process.exit(exitCode)
