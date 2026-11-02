/**
 * 多角度截图 + 局部放大，用来**用眼睛**检查这个项目。
 *
 * 为什么要局部裁剪（clip）：整屏 1584×905 缩到模型能看的尺寸后，
 * 图例、按钮上的小字就糊了。CDP 的 captureScreenshot 支持 clip + scale，
 * 可以对某个区域拍 2 倍图，字就清楚了。
 *
 * 为什么要先 dispatchMouseEvent：UI 有空闲淡出（body.idle 把
 * 标题/提示/图例/导出按钮压到 opacity .06）。不动鼠标拍出来的图
 * 上这些元素几乎看不见，会得出"按钮没渲染"的错误结论。
 */
import { spawn } from 'node:child_process'
import { setTimeout as sleep } from 'node:timers/promises'
import { mkdtempSync, writeFileSync, mkdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { requireChrome } from './_chrome.mjs'

const PORT = Number(process.env.PORT || 9432)
const URL_BASE = process.env.URL || 'http://127.0.0.1:5176/'
const CHROME = requireChrome()
const OUTDIR = process.env.OUTDIR || 'shots/v5'
mkdirSync(OUTDIR, { recursive: true })

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
  async shot(name, clip) {
    /* ⚠ 每张都要先唤醒。
     * 软件渲染下一张全屏截图要好几秒，UI 的空闲计时器会在这期间
     * 把界面淡到 6% —— 于是连拍的第 3、4 张里按钮就"看不见了"，
     * 很容易被误判成"没渲染"。这是脚本的时序问题，不是应用的问题。 */
    await wake(this)
    // 唤醒后要等淡入动画走完（opacity 的 transition 是 .7s）
    await sleep(900)
    const params = { format: 'png' }
    if (clip) params.clip = { ...clip, scale: clip.scale || 2 }
    const r = await this.send('Page.captureScreenshot', params)
    const p = join(OUTDIR, name)
    writeFileSync(p, Buffer.from(r.data, 'base64'))
    console.log(`  📷 ${p}`)
  }
}

async function connect() {
  let target = null
  for (let i = 0; i < 600; i++) {
    try {
      const list = await fetch(`http://127.0.0.1:${PORT}/json/list`).then((r) => r.json())
      target = list.find((t) => t.type === 'page' && t.webSocketDebuggerUrl)
      if (target) break
    } catch { /* retry */ }
    await sleep(250)
  }
  if (!target) throw new Error('连不上 CDP')
  const ws = new WebSocket(target.webSocketDebuggerUrl)
  await new Promise((res, rej) => {
    ws.addEventListener('open', res, { once: true })
    ws.addEventListener('error', rej, { once: true })
  })
  return new CDP(ws)
}

async function waitFor(cdp, expr, label, timeoutMs = 300000) {
  const t0 = Date.now()
  while (Date.now() - t0 < timeoutMs) {
    try { if (await cdp.eval(`return ${expr}`)) return true } catch { /* retry */ }
    await sleep(1000)
  }
  throw new Error(`超时：${label}`)
}

/** 在屏幕上划几下，把 UI 从 idle 状态唤醒 */
async function wake(cdp) {
  for (let i = 0; i < 12; i++) {
    await cdp.send('Input.dispatchMouseEvent', {
      type: 'mouseMoved', x: 600 + i * 12, y: 400 + (i % 5) * 9, buttons: 0,
    })
    await sleep(60)
  }
}

const profile = mkdtempSync(join(tmpdir(), 'neb-shots-'))
const chrome = spawn(CHROME, [
  '--headless=new', '--no-sandbox', '--disable-gpu-sandbox', '--enable-unsafe-swiftshader', '--use-gl=angle', '--use-angle=swiftshader',
  '--no-first-run', '--no-default-browser-check', '--disable-extensions', '--mute-audio',
  '--window-size=1600,1000', `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${profile}`, URL_BASE,
], { stdio: 'ignore' })

try {
  const cdp = await connect()
  await cdp.send('Runtime.enable')
  await cdp.send('Page.enable')
  await waitFor(cdp, '!!window.__nebula && window.__nebula.graph.nodes.length > 0', '就绪')
  await sleep(4000)

  const vp = await cdp.eval('return { w: innerWidth, h: innerHeight }')
  console.log(`视口 ${vp.w}×${vp.h}\n`)

  console.log('① 总览（唤醒 UI）')
  await wake(cdp)
  await sleep(1600)
  await cdp.shot('01-overview.png')
  // 局部：顶部搜索框 / 右下图例 / 左下导出按钮
  await cdp.shot('02-search.png', { x: vp.w - 300, y: 8, width: 292, height: 78 })
  await cdp.shot('03-legend.png', { x: vp.w - 250, y: 440, width: 242, height: vp.h - 450 })
  await cdp.shot('04-export.png', { x: 8, y: vp.h - 90, width: 240, height: 82 })

  console.log('\n② 选中一个公式（详情面板 + 焦点压暗）')
  await cdp.eval(`
    const nb = window.__nebula
    nb.scene.select('cn-jacobian')
    return true
  `)
  // 等相机推近收敛（无头软渲染很慢，必须轮询而不是拍一个秒数）
  await sleep(9000)
  await wake(cdp)
  await sleep(1200)
  await cdp.shot('05-selected.png')
  await cdp.shot('06-panel.png', { x: vp.w - 440, y: 0, width: 440, height: Math.min(vp.h, 700) })

  console.log('\n③ 星团视图（按状态着色）')
  await cdp.eval(`
    const nb = window.__nebula
    nb.scene.deselectFromPanel({ silent: true })
    nb.scene.setView('cluster')
    return true
  `)
  await sleep(7000)
  await wake(cdp)
  await sleep(1200)
  await cdp.shot('07-cluster.png')

  console.log('\n④ 关掉星团柔光壳（诊断右边那个灰盘）')
  await cdp.eval(`
    const nb = window.__nebula
    nb.scene.setView('overview')
    return true
  `)
  await sleep(6000)
  await cdp.eval(`window.__nebula.scene.setDisplay('clusterHalo', false); return true`)
  await sleep(2500)
  await wake(cdp)
  await sleep(1200)
  await cdp.shot('08-halo-off.png')

  console.log('\n⑤ 研究者星团 + 详情面板')
  await cdp.eval(`
    const nb = window.__nebula
    nb.scene.setDisplay('clusterHalo', true)
    nb.scene.setView('overview')
    nb.scene.select('rs-voisin')
    return true
  `)
  await sleep(9000)
  await wake(cdp)
  await sleep(1200)
  await cdp.shot('09-research-overview.png')
  await cdp.shot('10-research-panel.png', { x: vp.w - 440, y: 0, width: 440, height: Math.min(vp.h, 700) })

  console.log('\n完成')
} finally {
  try { chrome.kill() } catch { /* ignore */ }
}
