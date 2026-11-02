/**
 * designs/cdp.mjs — 可复用的 headless 浏览器会话（零依赖，CDP over WebSocket）。
 *
 * shot.mjs 是"一次性截图"；本模块是"可编程会话"：一个页面里连续做
 * 点击/缩放/选中/改视口/多张截图，并把页面异常与 console 错误收集起来。
 * 验收器 verify.mjs 与所有修复代理都走这一层，保证判定标准一致。
 *
 *   import { openPage } from './cdp.mjs'
 *   const p = await openPage({ url: 'http://localhost:5190/designs/atlas/',
 *                              wait: 'window.__design && window.__design.ready' })
 *   await p.eval('await __design.select("scheme")')
 *   await p.shot('shots/designs/atlas/x.png')
 *   await p.viewport(390, 844)
 *   console.log(p.errors)      // [{type, text}]
 *   await p.close()
 */
import { spawn } from 'node:child_process'
import { setTimeout as sleep } from 'node:timers/promises'
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, dirname } from 'node:path'
import { requireChrome } from '../scripts/_chrome.mjs'
import { acquireBrowserLock, releaseBrowserLock } from './_browser-lock.mjs'

let portSeq = 9600

/**
 * 打开一个可编程页面会话。
 *
 * 注意：本函数**在返回前就已取得全局浏览器锁**，并在 page.close() 时释放。
 * 也就是说一个会话会独占唯一的并发槽位直到关闭 —— 这是刻意的：
 * 同时多个 headless 实例会让整机卡顿（用户已明确反馈）。
 * 因此调用方必须保证 `await page.close()`，否则后续截图会一直排队。
 */
export async function openPage(opts = {}) {
  const {
    url, width = 1600, height = 1000, wait = "document.readyState==='complete'",
    waitMs = 45000, port = portSeq++ , keepConsole = true,
  } = opts
  /* 全局串行：整机只允许一个 headless 实例，会话关闭时才释放 */
  const lock = await acquireBrowserLock(`cdp ${url}`)
  const profile = mkdtempSync(join(tmpdir(), 'design-cdp-'))
  let chrome = null
  try {
  chrome = spawn(requireChrome(), [
    '--headless=new', '--no-sandbox', '--enable-unsafe-swiftshader', '--use-gl=angle', '--use-angle=swiftshader',
    '--no-first-run', '--no-default-browser-check', '--disable-extensions', '--mute-audio', '--hide-scrollbars',
    `--window-size=${width},${height}`, `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, 'about:blank',
  ], { stdio: 'ignore' })

  const errors = []
  const logs = []
  let target = null
  for (let i = 0; i < 240 && !target; i++) {
    try {
      const list = await fetch(`http://127.0.0.1:${port}/json/list`).then((r) => r.json())
      target = list.find((t) => t.type === 'page' && t.webSocketDebuggerUrl)
    } catch { /* retry */ }
    if (!target) await sleep(120)
  }
  if (!target) { chrome.kill(); throw new Error('CDP connect failed') }

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
      const d = m.params.exceptionDetails
      errors.push({ type: 'exception', text: d.exception?.description || d.text })
    } else if (m.method === 'Runtime.consoleAPICalled') {
      const text = m.params.args.map((a) => a.value ?? a.description ?? '').join(' ')
      if (m.params.type === 'error') errors.push({ type: 'console.error', text })
      if (keepConsole) logs.push({ type: m.params.type, text })
    } else if (m.method === 'Log.entryAdded' && m.params.entry.level === 'error') {
      const t = m.params.entry.text || ''
      const u = m.params.entry.url || ''
      /* favicon 缺失是浏览器行为，不算页面缺陷 */
      if (!/favicon/i.test(t) && !/favicon/i.test(u)) errors.push({ type: 'log.error', text: t, url: u })
    }
  }
  const send = (method, params = {}) => new Promise((res, rej) => {
    const i = ++id; pending.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method, params }))
  })

  const evaluate = async (expr) => {
    const r = await send('Runtime.evaluate', {
      expression: `(async () => { ${expr} })()`, awaitPromise: true, returnByValue: true,
    })
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text)
    return r.result.value
  }

  await send('Runtime.enable'); await send('Page.enable'); await send('Log.enable')
  await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false })
  await send('Page.navigate', { url })

  const t0 = Date.now()
  let ready = false
  while (Date.now() - t0 < waitMs) {
    try { if (await evaluate(`return !!(${wait})`)) { ready = true; break } } catch { /* retry */ }
    await sleep(200)
  }

  const page = {
    ready, errors, logs, evaluate: evaluate, eval: evaluate,
    async shot(path) {
      const r = await send('Page.captureScreenshot', { format: 'png' })
      mkdirSync(dirname(path), { recursive: true })
      writeFileSync(path, Buffer.from(r.data, 'base64'))
      return path
    },
    async viewport(w, h) {
      await send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: false })
      await sleep(250)
    },
    async reload(waitExpr) {
      await send('Page.reload', { ignoreCache: false })
      const t = Date.now()
      while (Date.now() - t < waitMs) {
        try { if (await evaluate(`return !!(${waitExpr || wait})`)) return true } catch { /* retry */ }
        await sleep(200)
      }
      return false
    },
    async close() {
      try { ws.close() } catch { /* ignore */ }
      if (chrome) chrome.kill()
      await sleep(250)
      try { rmSync(profile, { recursive: true, force: true }) } catch { /* locked */ }
      releaseBrowserLock(lock)
    },
  }
  return page
  } catch (e) {
    /* 启动失败也必须释放锁，否则整条流水线会一直排队 */
    if (chrome) chrome.kill()
    try { rmSync(profile, { recursive: true, force: true }) } catch { /* ignore */ }
    releaseBrowserLock(lock)
    throw e
  }
}
