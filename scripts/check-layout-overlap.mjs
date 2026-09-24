/**
 * 精确测量右上角几个元素的几何关系。
 *
 * 上一轮我只检查了 ['title','hint','legend','exportwrap','search','panel']，
 * **漏掉了 'st-open'（设置按钮）** —— 于是"没有元素重叠"这个结论是假的：
 * 截图里能明显看到设置按钮压在搜索框上面，把 placeholder 文字切断了。
 *
 * 教训：重叠检查的元素清单必须从 DOM 里**枚举**出来，
 * 而不是手写一个自以为完整的数组。手写清单漏掉的那一个，
 * 恰好就是唯一出问题的那个。
 */
import { spawn } from 'node:child_process'
import { setTimeout as sleep } from 'node:timers/promises'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const PORT = Number(process.env.PORT || 9433)
const URL_BASE = process.env.URL || 'http://127.0.0.1:5176/'
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'

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

const profile = mkdtempSync(join(tmpdir(), 'neb-geom-'))
const chrome = spawn(CHROME, [
  '--headless=new', '--enable-unsafe-swiftshader', '--use-gl=angle', '--use-angle=swiftshader',
  '--no-first-run', '--no-default-browser-check', '--disable-extensions', '--mute-audio',
  '--window-size=1600,1000', `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${profile}`, URL_BASE,
], { stdio: 'ignore' })

try {
  const cdp = await connect()
  await cdp.send('Runtime.enable')
  await waitFor(cdp, '!!window.__nebula && window.__nebula.graph.nodes.length > 0', '就绪')
  await sleep(3000)

  /* ── 从 DOM 枚举所有可见的定位元素 ──
   * 不用手写清单：那正是上次漏掉 st-open 的原因。 */
  const report = await cdp.eval(`
    const out = []
    for (const e of document.querySelectorAll('body *')) {
      const cs = getComputedStyle(e)
      if (cs.position !== 'absolute' && cs.position !== 'fixed') continue
      if (cs.display === 'none' || cs.visibility === 'hidden') continue
      if (parseFloat(cs.opacity) < 0.02) continue
      const r = e.getBoundingClientRect()
      if (r.width < 1 || r.height < 1) continue
      // 只关心"浮在画布上的面板"，排除画布内部的 WebGL 层
      if (e.tagName === 'CANVAS') continue
      out.push({
        sel: e.id ? '#' + e.id : (e.className && typeof e.className === 'string'
              ? '.' + e.className.trim().split(/\\s+/).join('.') : e.tagName.toLowerCase()),
        x: Math.round(r.x), y: Math.round(r.y),
        w: Math.round(r.width), h: Math.round(r.height),
        z: cs.zIndex, op: +(parseFloat(cs.opacity)).toFixed(2),
      })
    }
    return { items: out, vp: { w: innerWidth, h: innerHeight } }
  `)

  console.log(`视口 ${report.vp.w}×${report.vp.h}\n`)
  console.log('浮层元素（从 DOM 枚举）：')
  for (const it of report.items) {
    console.log(`  ${it.sel.padEnd(16)} x=${String(it.x).padStart(5)} y=${String(it.y).padStart(4)} ` +
                `${String(it.w).padStart(4)}×${String(it.h).padStart(3)}  z=${it.z.padStart(4)} op=${it.op}`)
  }

  console.log('\n两两重叠检测：')
  /* ── 哪些重叠是**合法的** ──
   * #app / #vignette / #hud 是容器（子元素天然在它们里面），
   * #panel × .close 是面板自己的关闭按钮。除此之外的浮层重叠
   * 都是真的排歪了 —— #search × #st-open 就是这么被抓住的。
   * 用**容器名单**而不是"忽略所有大元素"：后者会把真正的
   * "大面板压住小按钮"一起放过。 */
  const CONTAINERS = new Set(['#app', '#vignette', '#hud'])
  let n = 0
  const real = []
  for (let i = 0; i < report.items.length; i++) {
    for (let j = i + 1; j < report.items.length; j++) {
      const a = report.items[i], b = report.items[j]
      const ox = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x)
      const oy = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y)
      if (ox > 1 && oy > 1) {
        const nested = CONTAINERS.has(a.sel) || CONTAINERS.has(b.sel)
        const ownClose = (a.sel === '#panel' && b.sel === '.close') ||
                         (b.sel === '#panel' && a.sel === '.close')
        const tag = nested ? '（容器嵌套，正常）' : ownClose ? '（面板自带的关闭按钮，正常）' : '  ← 真的排歪了'
        console.log(`  ${nested || ownClose ? '·' : '⚠'} ${a.sel} × ${b.sel}  重叠 ${ox}×${oy}px ${tag}`)
        n++
        if (!nested && !ownClose) real.push(`${a.sel} × ${b.sel} ${ox}×${oy}px`)
      }
    }
  }
  console.log(n ? `\n共 ${n} 处重叠，其中**真问题 ${real.length} 处**` : '\n✓ 无重叠')

  /* ── 搜索框内的文字有没有被遮住 ── */
  const occl = await cdp.eval(`
    const inp = document.querySelector('#search input')
    if (!inp) return { err: '没有 #search input' }
    const r = inp.getBoundingClientRect()
    const mid = document.elementFromPoint(Math.round(r.right - 12), Math.round(r.y + r.height / 2))
    const probes = []
    for (const dx of [0.2, 0.5, 0.8, 0.95]) {
      const px = Math.round(r.x + r.width * dx)
      const py = Math.round(r.y + r.height / 2)
      const el = document.elementFromPoint(px, py)
      probes.push({ dx, hit: el ? (el.id ? '#' + el.id : el.tagName) : null })
    }
    return { rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }, mid: mid ? (mid.id || mid.tagName) : null, probes }
  `)
  console.log('\n搜索框内部横向探测（谁在最上层）：')
  console.log(`  输入框 rect: x=${occl.rect?.x} y=${occl.rect?.y} ${occl.rect?.w}×${occl.rect?.h}`)
  let stolen = 0
  for (const p of occl.probes || []) {
    const okHit = p.hit === 'INPUT'
    if (!okHit) stolen++
    console.log(`  ${okHit ? '✓' : '✗'} 宽度 ${(p.dx * 100).toFixed(0)}% 处命中: ${p.hit}`)
  }

  /* ── 结论 ──
   * 两条硬条件：没有"真重叠"，且搜索框整条宽度都能被点到。
   * 后者是前者的**行为级**验证：几何上不重叠但被透明层盖住，
   * 也会让输入框点不进去，而那种情况框选是看不出来的。 */
  const bad = real.length + stolen
  if (bad) {
    console.log(`\n✗ 发现 ${bad} 个问题` +
      (real.length ? `（重叠 ${real.length} 处：${real.join('；')}）` : '') +
      (stolen ? `（搜索框有 ${stolen} 个探测点被别的元素抢走）` : ''))
  } else {
    console.log('\n✓ 布局无问题：浮层不重叠，搜索框整条可点')
  }
  process.exitCode = bad ? 1 : 0
} finally {
  try { chrome.kill() } catch { /* ignore */ }
}
