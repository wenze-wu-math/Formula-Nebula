/**
 * 放大某个屏幕区域拍图，用来检查小字/粗体/行距这类细节。
 *
 * 用法：node scripts/zoom.mjs <x> <y> <w> <h> <输出名> [scale]
 */
import { spawn } from 'node:child_process'
import { setTimeout as sleep } from 'node:timers/promises'
import { mkdtempSync, writeFileSync, mkdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { requireChrome } from './_chrome.mjs'

const [x, y, w, h, name, scale] = process.argv.slice(2)
if (!name) { console.error('用法：node scripts/zoom.mjs <x> <y> <w> <h> <输出名> [scale]'); process.exit(1) }

const PORT = Number(process.env.PORT || 9434)
const URL_BASE = process.env.URL || 'http://127.0.0.1:5176/'
const CHROME = requireChrome()
const SELECT = process.env.SELECT || ''
mkdirSync('shots/zoom', { recursive: true })

class CDP {
  constructor(ws) {
    this.ws = ws; this.id = 0; this.pending = new Map()
    ws.addEventListener('message', (ev) => {
      const m = JSON.parse(ev.data)
      if (m.id && this.pending.has(m.id)) {
        const { resolve, reject } = this.pending.get(m.id)
        this.pending.delete(m.id)
        if (m.error) reject(new Error(JSON.stringify(m.error))); else resolve(m.result)
      }
    })
  }
  send(method, params = {}) {
    const id = ++this.id
    return new Promise((res, rej) => {
      this.pending.set(id, { resolve: res, reject: rej })
      this.ws.send(JSON.stringify({ id, method, params }))
    })
  }
  async eval(expr) {
    const r = await this.send('Runtime.evaluate', {
      expression: `(async () => { ${expr} })()`, awaitPromise: true, returnByValue: true,
    })
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text)
    return r.result.value
  }
}

async function connect() {
  let t = null
  for (let i = 0; i < 600; i++) {
    try {
      const l = await fetch(`http://127.0.0.1:${PORT}/json/list`).then((r) => r.json())
      t = l.find((x) => x.type === 'page' && x.webSocketDebuggerUrl)
      if (t) break
    } catch { /* retry */ }
    await sleep(250)
  }
  const ws = new WebSocket(t.webSocketDebuggerUrl)
  await new Promise((res, rej) => {
    ws.addEventListener('open', res, { once: true })
    ws.addEventListener('error', rej, { once: true })
  })
  return new CDP(ws)
}

async function waitFor(cdp, expr, label, ms = 300000) {
  const t0 = Date.now()
  while (Date.now() - t0 < ms) {
    try { if (await cdp.eval(`return ${expr}`)) return } catch { /* retry */ }
    await sleep(1000)
  }
  throw new Error(`超时：${label}`)
}

const profile = mkdtempSync(join(tmpdir(), 'neb-zoom-'))
const chrome = spawn(CHROME, [
  '--headless=new', '--no-sandbox', '--disable-gpu-sandbox',
  '--enable-unsafe-swiftshader', '--use-gl=angle', '--use-angle=swiftshader',
  '--no-first-run', '--no-default-browser-check', '--disable-extensions', '--mute-audio',
  '--window-size=1600,1000', `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${profile}`, URL_BASE,
], { stdio: 'ignore' })

try {
  const cdp = await connect()
  await cdp.send('Runtime.enable')
  await waitFor(cdp, '!!window.__nebula && window.__nebula.graph.nodes.length > 0', '就绪')
  await sleep(3000)
  if (SELECT) {
    await cdp.eval(`window.__nebula.scene.select('${SELECT}'); return true`)
    await sleep(9000)
  }
  const r = await cdp.send('Page.captureScreenshot', {
    format: 'png',
    clip: { x: +x, y: +y, width: +w, height: +h, scale: +(scale || 3) },
  })
  const p = `shots/zoom/${name}`
  writeFileSync(p, Buffer.from(r.data, 'base64'))
  console.log(`📷 ${p}  (clip ${x},${y} ${w}×${h} @${scale || 3}x)`)
} finally {
  try { chrome.kill() } catch { /* ignore */ }
}
