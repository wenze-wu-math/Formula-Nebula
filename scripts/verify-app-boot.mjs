/**
 * 验证应用是否**真正完成启动**，而不只是"画出了画布"。
 *
 * 为什么需要这个检查器：`verify:final` 只断言 canvas 存在且无异常，于是
 * 一个真实的致命 bug 从它眼皮下溜了过去 ——
 *
 *   src/mobileOptimization.js 调用了 settings.setState()，而 settings 上
 *   没有这个方法。在低性能设备（含所有无头浏览器）上，它在 main() 第 578 行
 *   同步抛 TypeError，直接中断启动，导致 window.__nebula / __formulaNebula
 *   永不暴露。生产构建开了 terser drop_console，把 main().catch 里的
 *   console.error 也删了，所以失败**完全静默**。
 *
 *   canvas 之所以还在，是因为渲染器在建场景时就已经挂上去了 —— "有画布"
 *   不等于"启动成功"。
 *
 * 正确的判据是：核心全局对象已暴露、图已装配、且没有启动期异常。
 *
 * 用法：node scripts/verify-app-boot.mjs [url]
 */

import { spawn, execFileSync } from 'node:child_process'
import fs from 'node:fs'
import net from 'node:net'
import os from 'node:os'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const TARGET = process.argv[2] || 'https://wenze-wu-math.github.io/Formula-Nebula/'
const BROWSERS = [
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  '/usr/bin/google-chrome',
].filter((p) => fs.existsSync(p))
const browser = BROWSERS[0]
if (!browser) {
  console.log('SKIP: 未找到浏览器')
  process.exit(0)
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const _PORT = 5783
const CDPP = 9783
const prof = fs.mkdtempSync(path.join(os.tmpdir(), 'bootchk-'))

const kids = []
const killAll = () => {
  for (const c of kids) {
    try {
      spawn('taskkill', ['/PID', String(c.pid), '/T', '/F'], { stdio: 'ignore' })
    } catch {
      /* ignore */
    }
  }
}
process.on('exit', killAll)

const LOCAL = TARGET.startsWith('http://localhost') || TARGET.startsWith('http://127.0.0.1')

async function waitPort(p, ms = 60000) {
  const end = Date.now() + ms
  while (Date.now() < end) {
    const ok = await new Promise((res) => {
      const s = net.connect({ port: p, host: '127.0.0.1' }, () => {
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
    await sleep(300)
  }
  return false
}

let failures = 0
const check = (name, ok, detail = '') => {
  if (ok) {
    console.log(`  ✓ ${name}${detail ? ' — ' + detail : ''}`)
  } else {
    failures++
    console.log(`  ✗ ${name}${detail ? ' — ' + detail : ''}`)
  }
}

try {
  // 本地目标需要先起 preview
  let localServer = null
  if (LOCAL) {
    const url = new URL(TARGET)
    const port = Number(url.port) || 4173
    localServer = spawn(
      process.execPath,
      [path.join(ROOT, 'node_modules', 'vite', 'bin', 'vite.js'), 'preview', '--port', String(port), '--strictPort'],
      { cwd: ROOT, stdio: 'ignore' }
    )
    kids.push(localServer)
    if (!(await waitPort(port))) throw new Error('preview 未启动')
  }

  kids.push(
    spawn(browser, ['--headless=new', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--no-sandbox', `--remote-debugging-port=${CDPP}`, `--user-data-dir=${prof}`, 'about:blank'], {
      stdio: 'ignore',
    })
  )
  for (let i = 0; i < 120; i++) {
    await sleep(300)
    try {
      if ((await fetch(`http://127.0.0.1:${CDPP}/json/version`)).ok) break
    } catch {
      /* retry */
    }
  }

  const t = await (await fetch(`http://127.0.0.1:${CDPP}/json/new?about:blank`, { method: 'PUT' })).json()
  const ws = new WebSocket(t.webSocketDebuggerUrl)
  await new Promise((r) => ws.addEventListener('open', r, { once: true }))

  let id = 0
  const pending = new Map()
  const exceptions = []
  const consoleErrors = []
  ws.addEventListener('message', (e) => {
    const m = JSON.parse(e.data)
    if (m.id && pending.has(m.id)) {
      pending.get(m.id)(m.result)
      pending.delete(m.id)
      return
    }
    if (m.method === 'Runtime.exceptionThrown') {
      const d = m.params.exceptionDetails || {}
      exceptions.push((d.exception?.description || d.text || '').split('\n')[0].slice(0, 200))
    } else if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') {
      consoleErrors.push((m.params.args || []).map((a) => a.value ?? a.description ?? '').join(' ').slice(0, 200))
    }
  })
  const send = (method, params = {}) =>
    new Promise((r) => {
      const i = ++id
      pending.set(i, r)
      ws.send(JSON.stringify({ id: i, method, params }))
    })
  const ev = async (x) => {
    const r = await send('Runtime.evaluate', { expression: x, returnByValue: true })
    if (r.exceptionDetails) return undefined
    return r.result ? r.result.value : undefined
  }

  await send('Runtime.enable')
  await send('Page.enable')
  await send('Page.navigate', { url: TARGET })

  console.log(`\n目标: ${TARGET}\n`)

  // 等启动完成：判据是 window.__nebula 暴露。
  //
  // 不把"splash 消失"当主要判据：它的消失依赖 hide() 里两级 setTimeout
  // （300ms 淡出 + 500ms 设 display:none），与启动是否成功并不等价 ——
  // 之前正是"只看画布/遮罩"漏掉了真正的启动中断。__nebula 只在 main()
  // 完整跑到底才存在，这才是可靠的完成信号。
  let booted = false
  let splashSeen = false
  for (let i = 0; i < 150; i++) {
    await sleep(2000)
    const st = await ev(`JSON.stringify({
      nebula: typeof window.__nebula,
      splash: (() => { const el = document.getElementById('splash'); return el ? getComputedStyle(el).display : 'gone' })(),
    })`)
    if (st) {
      const j = JSON.parse(st)
      if (j.splash !== 'gone') splashSeen = true
      if (j.nebula === 'object') {
        booted = true
        break
      }
    }
  }

  check('splash 曾经存在（说明页面结构完整）', splashSeen)
  check('window.__nebula 已暴露（main() 完整执行）', booted)
  check('window.__formulaNebula 已暴露', (await ev('typeof window.__formulaNebula')) === 'object')

  const graph = await ev(`(() => {
    const n = window.__nebula
    if (!n || !n.graph) return null
    return JSON.stringify({ nodes: n.graph.nodes.length, links: n.graph.links.length })
  })()`)
  check('图已装配（节点数与连线数 > 0）', !!graph && JSON.parse(graph).nodes > 0, graph || '')

  const canvas = await ev(`(() => {
    const c = document.querySelector('canvas')
    return c ? JSON.stringify({ w: c.width, gl: !!(c.getContext('webgl2') || c.getContext('webgl')) }) : null
  })()`)
  check('WebGL 画布存在且活跃', !!canvas && JSON.parse(canvas).gl, canvas || '')

  // 启动期异常是硬失败 —— 正是这个检查器要捕获的东西
  check('无启动期异常', exceptions.length === 0, exceptions.slice(0, 2).join(' | '))
  check('无 console.error', consoleErrors.length === 0, consoleErrors.slice(0, 2).join(' | '))

  ws.close()
} catch (err) {
  failures++
  console.error('ERR:', err.message)
} finally {
  killAll()
  await sleep(800)
  // 自己清理自己，并确认干净
  try {
    execFileSync(
      'powershell',
      [
        '-NoProfile',
        '-Command',
        "Get-CimInstance Win32_Process -Filter \"Name='msedge.exe'\" | Where-Object { $_.CommandLine -like '*--headless*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }",
      ],
      { stdio: 'ignore', timeout: 15000 }
    )
  } catch {
    /* best effort */
  }
  try {
    fs.rmSync(prof, { recursive: true, force: true })
  } catch {
    /* ignore */
  }
}

console.log(failures === 0 ? '\n启动检查通过' : `\n${failures} 项失败`)
process.exit(failures === 0 ? 0 : 1)
