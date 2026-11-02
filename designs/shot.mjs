/**
 * 设计稿通用截图工具（headless Chrome/Edge + CDP，无第三方依赖）。
 *
 * 用法：
 *   node designs/shot.mjs <url> <out.png> [--w 1600] [--h 1000] [--wait <js 表达式>]
 *                         [--eval <js 语句>] [--delay ms] [--port 9500] [--console]
 *
 *   --wait   轮询直到该表达式为真（默认 document.readyState==='complete'）
 *   --eval   就绪后执行的 JS（可 await；可多次给出，按顺序执行，每段之后等 --delay）
 *   --delay  每段 eval 后、截图前等待的毫秒数（默认 1200）
 *   --port   CDP 端口；并行运行时每个调用方用不同端口（默认随机 9500-9899）
 *   --console 把页面的 console 输出与异常打印到 stdout（排错用）
 *
 * 并发：整个浏览器生命周期都在 `_browser-lock.mjs` 的全局锁内 ——
 * 同一时刻只有一个 headless 实例，避免多代理并发截图把整机拖到卡顿。
 * 调用方不需要自己排队，锁会自动串行化（代价是并发截图会排队，而非并行）。
 *
 * 退出码非 0 表示页面有未捕获异常或超时。
 */
import { spawn } from 'node:child_process'
import { setTimeout as sleep } from 'node:timers/promises'
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, dirname } from 'node:path'
import { requireChrome } from '../scripts/_chrome.mjs'
import { withBrowserLock } from './_browser-lock.mjs'

const argv = process.argv.slice(2)
const url = argv[0]
const out = argv[1]
if (!url || !out) {
  console.error('usage: node designs/shot.mjs <url> <out.png> [--w W] [--h H] [--wait expr] [--eval js]... [--delay ms] [--port p] [--console]')
  process.exit(2)
}
const opt = { w: 1600, h: 1000, wait: "document.readyState==='complete'", evals: [], delay: 1200, port: 9500 + Math.floor(Math.random() * 400), console: false }
for (let i = 2; i < argv.length; i++) {
  const k = argv[i]
  if (k === '--w') opt.w = Number(argv[++i])
  else if (k === '--h') opt.h = Number(argv[++i])
  else if (k === '--wait') opt.wait = argv[++i]
  else if (k === '--eval') opt.evals.push(argv[++i])
  else if (k === '--delay') opt.delay = Number(argv[++i])
  else if (k === '--port') opt.port = Number(argv[++i])
  else if (k === '--console') opt.console = true
}

const exitCode = await withBrowserLock(`shot ${out}`, async () => {
  const profile = mkdtempSync(join(tmpdir(), 'design-shot-'))
  const chrome = spawn(requireChrome(), [
    '--headless=new', '--no-sandbox', '--enable-unsafe-swiftshader', '--use-gl=angle', '--use-angle=swiftshader',
    '--no-first-run', '--no-default-browser-check', '--disable-extensions', '--mute-audio', '--hide-scrollbars',
    `--window-size=${opt.w},${opt.h}`, `--remote-debugging-port=${opt.port}`, `--user-data-dir=${profile}`, 'about:blank',
  ], { stdio: 'ignore' })

  let errors = 0
  let code = 0
  try {
    let target = null
    for (let i = 0; i < 200 && !target; i++) {
      try {
        const list = await fetch(`http://127.0.0.1:${opt.port}/json/list`).then((r) => r.json())
        target = list.find((t) => t.type === 'page' && t.webSocketDebuggerUrl)
      } catch { /* retry */ }
      if (!target) await sleep(150)
    }
    if (!target) throw new Error('CDP connect failed')
    const ws = new WebSocket(target.webSocketDebuggerUrl)
    await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej })
    let id = 0
    const pending = new Map()
    ws.onmessage = (ev) => {
      const m = JSON.parse(ev.data)
      if (m.id && pending.has(m.id)) {
        const p = pending.get(m.id); pending.delete(m.id)
        m.error ? p.rej(new Error(JSON.stringify(m.error))) : p.res(m.result)
      } else if (m.method === 'Runtime.exceptionThrown') {
        errors++
        const d = m.params.exceptionDetails
        console.log('[page exception]', d.exception?.description || d.text)
      } else if (m.method === 'Runtime.consoleAPICalled' && opt.console) {
        console.log(`[console.${m.params.type}]`, m.params.args.map((a) => a.value ?? a.description ?? '').join(' '))
      } else if (m.method === 'Log.entryAdded' && m.params.entry.level === 'error') {
        const u = m.params.entry.url || ''
        if (!/favicon/i.test(u) && !/favicon/i.test(m.params.entry.text || '')) {
          console.log('[log error]', m.params.entry.text, u)
        }
      }
    }
    const send = (method, params = {}) => new Promise((res, rej) => {
      const i = ++id; pending.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method, params }))
    })
    const evaluate = async (expr) => {
      const r = await send('Runtime.evaluate', { expression: `(async () => { ${expr} })()`, awaitPromise: true, returnByValue: true })
      if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text)
      return r.result.value
    }
    await send('Runtime.enable'); await send('Page.enable'); await send('Log.enable')
    await send('Emulation.setDeviceMetricsOverride', { width: opt.w, height: opt.h, deviceScaleFactor: 1, mobile: false })
    await send('Page.navigate', { url })
    const t0 = Date.now()
    let ok = false
    while (Date.now() - t0 < 90000) {
      try { if (await evaluate(`return !!(${opt.wait})`)) { ok = true; break } } catch { /* retry */ }
      await sleep(400)
    }
    if (!ok) { console.log('[timeout] wait condition never became true:', opt.wait); code = 3 }
    await sleep(opt.delay)
    for (const e of opt.evals) {
      try { const v = await evaluate(e); if (v !== undefined) console.log('[eval]', JSON.stringify(v)) } catch (err) { console.log('[eval error]', err.message); code = 4 }
      await sleep(opt.delay)
    }
    const r = await send('Page.captureScreenshot', { format: 'png' })
    mkdirSync(dirname(out), { recursive: true })
    writeFileSync(out, Buffer.from(r.data, 'base64'))
    console.log('saved', out, `${opt.w}x${opt.h}`, errors ? `(${errors} page exceptions)` : '')
    ws.close()
  } catch (e) {
    console.log('[shot error]', e.message); code = 1
  } finally {
    chrome.kill()
    await sleep(300)
    try { rmSync(profile, { recursive: true, force: true }) } catch { /* locked; ignore */ }
  }
  return code || (errors ? 5 : 0)
})
process.exit(exitCode)
