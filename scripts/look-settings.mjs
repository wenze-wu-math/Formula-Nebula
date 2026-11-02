/**
 * 打开设置面板并截图，检查"按关系类型着色"这个新开关的排版。
 * 顺带读回它的 label / hint 文本，确认提示里写明了覆盖率。
 */
import { spawn } from 'node:child_process'
import { setTimeout as sleep } from 'node:timers/promises'
import { mkdtempSync, writeFileSync, mkdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { requireChrome } from './_chrome.mjs'

const PORT = Number(process.env.PORT || 9435)
const URL_BASE = 'http://127.0.0.1:5176/'
const CHROME = requireChrome()
mkdirSync('shots/final', { recursive: true })

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

const profile = mkdtempSync(join(tmpdir(), 'neb-set-'))
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

  // 打开设置面板
  await cdp.eval(`document.getElementById('st-open').click(); return true`)
  await sleep(1200)

  const info = await cdp.eval(`
    const rows = [...document.querySelectorAll('#settings .st-toggle')].map(l => ({
      text: l.textContent.replace(/\\s+/g, ' ').trim(),
      title: l.getAttribute('title') || '',
      on: !!l.querySelector('input')?.checked,
    }))
    const panel = document.getElementById('settings')
    const r = panel.getBoundingClientRect()
    return { rows, rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) } }
  `)
  console.log(`设置面板 rect: x=${info.rect.x} y=${info.rect.y} ${info.rect.w}×${info.rect.h}`)
  console.log('\n显示层开关：')
  for (const row of info.rows) {
    const hasPct = /16\.7%|未判定/.test(row.text + row.title)
    console.log(`  ${row.on ? '[x]' : '[ ]'} ${row.text}${hasPct ? '   ← 写明了覆盖率' : ''}`)
  }

  const shot = await cdp.send('Page.captureScreenshot', { format: 'png' })
  writeFileSync('shots/final/09-settings.png', Buffer.from(shot.data, 'base64'))
  console.log('\n📷 shots/final/09-settings.png')

  // 找"按关系类型着色"那一行的纵坐标，裁一条出来放大。
  // ⚠ 必须先 scrollIntoView：这个开关在显示层列表的**第二项**，
  //   但列表本身在可以滚动的 .st-body 里，不滚的话它可能落在
  //   面板可视区之外（实测 y=942 > 视口 905），裁出来是全黑。
  const y = await cdp.eval(`
    for (const l of document.querySelectorAll('#settings .st-toggle')) {
      if (l.textContent.includes('关系类型')) {
        l.scrollIntoView({ block: 'center' })
        await new Promise(r => setTimeout(r, 400))
        const r2 = l.getBoundingClientRect()
        return Math.round(r2.y - 6)
      }
    }
    return -1
  `)
  if (y > 0 && y < 880) {
    const r2 = await cdp.send('Page.captureScreenshot', {
      format: 'png', clip: { x: info.rect.x, y, width: info.rect.w, height: 52, scale: 4 },
    })
    writeFileSync('shots/final/10-linktypes-row.png', Buffer.from(r2.data, 'base64'))
    console.log(`📷 shots/final/10-linktypes-row.png  (y=${y})`)
  } else {
    console.log(`⚠ 那一行的 y=${y} 不在可视范围内，跳过裁剪`)
  }
} finally {
  try { chrome.kill() } catch { /* ignore */ }
}
