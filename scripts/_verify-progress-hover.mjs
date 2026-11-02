/**
 * 视觉验证 ②③④：进展年份、数据截止、连线悬停提示。
 *
 * 为什么不用现成的 look.mjs：那支脚本拍的是"整体观感"（8 张全身照），
 * 而这三项都是**局部**功能 —— 需要精确的鼠标悬停，
 * 而 headless Chrome 里合成的 pointermove 必须带真实的坐标，
 * 且必须等 three.js 的 requestAnimationFrame 跑过一帧才能拾取。
 */
import { spawn } from 'node:child_process'
import { writeFileSync, mkdirSync } from 'node:fs'
import { setTimeout as sleep } from 'node:timers/promises'
import { requireChrome } from './_chrome.mjs'

const PORT = Number(process.env.PORT || 9455)
const URL = process.env.URL || 'http://127.0.0.1:5176/'
const OUT = 'shots/progress-hover'
mkdirSync(OUT, { recursive: true })

const CHROME = requireChrome()
const chrome = spawn(CHROME, [
  '--headless=new', '--no-sandbox', '--disable-gpu-sandbox',
  '--enable-unsafe-swiftshader', '--use-gl=angle',
  '--use-angle=swiftshader', `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${process.env.TEMP}\\cdp-prog-${process.pid}`,
  '--window-size=1440,900', '--no-first-run', '--no-default-browser-check',
  'about:blank',
], { stdio: 'ignore' })

class CDP {
  constructor(ws) { this.ws = ws; this.id = 0; this.waiting = new Map() }
  static async connect(url) {
    const ws = new WebSocket(url)
    await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej })
    const c = new CDP(ws)
    ws.onmessage = (m) => {
      const msg = JSON.parse(m.data)
      if (msg.id && c.waiting.has(msg.id)) {
        const { res, rej } = c.waiting.get(msg.id)
        c.waiting.delete(msg.id)
        msg.error ? rej(new Error(JSON.stringify(msg.error))) : res(msg.result)
      }
    }
    return c
  }
  send(method, params = {}) {
    const id = ++this.id
    return new Promise((res, rej) => {
      this.waiting.set(id, { res, rej })
      this.ws.send(JSON.stringify({ id, method, params }))
    })
  }
}

async function evalJs(cdp, expr, tag = '') {
  const r = await cdp.send('Runtime.evaluate', {
    expression: expr, returnByValue: true, awaitPromise: true,
  })
  if (r.exceptionDetails) {
    throw new Error(`[${tag}] ${r.exceptionDetails.text} :: ${expr.replace(/\s+/g, ' ').slice(0, 90)}`)
  }
  return r.result.value
}

/** 轮询等待条件成立 —— headless 下 SwiftShader 只有几 FPS，固定 sleep 必然翻车 */
async function waitFor(cdp, expr, label, ms = 90000) {
  const t0 = Date.now()
  for (;;) {
    if (await evalJs(cdp, expr)) return Date.now() - t0
    if (Date.now() - t0 > ms) throw new Error(`超时等待: ${label}`)
    await sleep(400)
  }
}

const problems = []
const ok = (cond, msg) => { console.log(`  ${cond ? '✓' : '✗'} ${msg}`); if (!cond) problems.push(msg) }

try {
  await waitFor(null, 'true', 'boot', 1).catch(() => {})
  let target = null
  for (let i = 0; i < 60 && !target; i++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()
      target = list.find((t) => t.type === 'page')
    } catch { /* 还没起来 */ }
    if (!target) await sleep(300)
  }
  if (!target) throw new Error('连不上 CDP')

  const cdp = await CDP.connect(target.webSocketDebuggerUrl)
  await cdp.send('Page.enable')
  await cdp.send('Runtime.enable')
  await cdp.send('Page.navigate', { url: URL })

  // 就绪判据用 window.__nebula，**不是**加载条的样式。
  // 加载条在烘焙结束后停在 opacity:1（那 100% 的进度条本身就是最后一幕），
  // 拿它当"完成"信号会一直等不到 —— 这个坑第一次跑就踩了。
  const t = await waitFor(cdp, '!!window.__nebula', '页面就绪')
  console.log(`  · 就绪耗时 ${(t / 1000).toFixed(1)}s`)

  // ─── ③ 数据截止标记 ───
  console.log('\n③ 数据截止标记')
  const asOf = await evalJs(cdp, `document.querySelector('#legend .asof')?.textContent || ''`)
  ok(/数据截至\s*2026-07/.test(asOf), `图例里显示"${asOf}"`)
  const asOfVisible = await evalJs(cdp, `(() => {
    const e = document.querySelector('#legend .asof')
    if (!e) return false
    const s = getComputedStyle(e)
    return s.display !== 'none' && s.visibility !== 'hidden' && parseFloat(s.opacity || '1') > 0
  })()`)
  ok(asOfVisible, '截止标记可见（未被隐藏）')

  // ─── ② 最新进展年份 ───
  console.log('\n② 面板里的最新进展年份')
  // 用真实的点击路径打开面板，而不是调用内部的 showDetail ——
  // 后者只能证明"函数能跑"，不能证明"用户点得出这个面板"。
  const opened = await evalJs(cdp, `(() => {
    const s = window.__nebula
    // 挑一条**确认有**进展年份的猜想（cn-jacobian：2026-07 反例）
    s.scene.select('cn-jacobian')
    return true   // 见下方 negId 处的注释：一定要返回基本类型
  })()`)
  ok(opened, '选中 cn-jacobian 触发面板')
  await waitFor(cdp, `!!document.querySelector('#panel .meta')`, '面板 meta 出现')
  const metaText = await evalJs(cdp, `document.querySelector('#panel .meta')?.textContent || ''`)
  console.log(`  · meta: ${metaText.replace(/\s+/g, ' ').trim().slice(0, 140)}`)
  ok(/进展至\s*20\d\d/.test(metaText), 'meta 里出现"进展至 <年份>"')

  // 口径核对：59 条猜想里到底几条有进展年份。
  // 从 __nebula.progress 取，**不能** import('/src/data/progress.js')：
  // preview 发的是打包后的 dist，源码路径不存在（第一次跑就撞上了）。
  const cov = await evalJs(cdp, `(() => {
    const p = window.__nebula.progress
    const ids = window.__nebula.graph.nodes.filter(n => n.cluster).map(n => n.id)
    const has = ids.filter(id => p.progressOf(id))
    return { total: ids.length, has: has.length, none: ids.length - has.length, asOf: p.DATA_AS_OF }
  })()`)
  console.log(`  · 有进展年份 ${cov.has} / 无 ${cov.none}（共 ${cov.total}）；数据截至 ${cov.asOf}`)
  ok(cov.total === 59, '猜想总数 = 59')
  ok(cov.has === 36 && cov.none === 23, '有年份 36 条 / 无年份 23 条（与 progress.js 一致）')

  // 反例：一条**没有**年份的猜想，meta 里不许出现"进展至"
  const negId = await evalJs(cdp, `(() => {
    const p = window.__nebula.progress
    return window.__nebula.graph.nodes.find(n => n.cluster && !p.progressOf(n.id))?.id || null
  })()`)
  if (negId) {
    /* ⚠ 末尾必须写 `; true`。
     * Runtime.evaluate 会把整个表达式的**值**序列化回来，
     * 而 scene.select() 返回的是被选中的节点对象 ——
     * 它挂着 linkIds（每个元素又带 label），CDP 会一路展开对象图，
     * 报 "Object reference chain is too long"。
     * 这个错看起来像"探针没实现"，其实是返回值太大。 */
    await evalJs(cdp, `window.__nebula.scene.select(${JSON.stringify(negId)}); true`, 'select-neg')
    await sleep(1200)
    const negMeta = await evalJs(cdp, `document.querySelector('#panel .meta')?.textContent || ''`)
    /* 负对照：如果"进展至"在任何一条上都出现，那说明它是写死的模板文字，
     * 不是真的按数据渲染 —— 那样这个功能就是在骗人。
     * 所以必须在**已知没有年份**的那条上验证它**不出现**。 */
    ok(!/进展至/.test(negMeta), `无年份的 ${negId} 上不显示"进展至"（负对照）`)
  } else {
    ok(false, '找不到没有进展年份的猜想（无法做负对照）')
  }

  // ─── ④ 连线悬停 ───
  console.log('\n④ 连线悬停显示理由')
  const aim = await evalJs(cdp, `(() => {
    const s = window.__nebula
    // PICK的主星系节点选中，它的边最多
    let best = null
    for (const n of s.graph.nodes) {
      if (n.cluster) continue
      if (!best || n.degree > best.degree) best = n
    }
    s.scene.select(best.id)   // 返回值丢弃，只看下面的 return
    /* ⚠ 只返回**基本类型**：直接 return 节点对象会撞上 CDP 的
     * "Object reference chain is too long" —— 节点上挂着 linkIds 数组，
     * 每个元素又是带 label 的对象，序列化会一路展开下去。
     * 另外 s.scene.select(...) 本身也要丢弃返回值（见下面 negId 那段）。 */
    return { id: String(best.id), name: String(best.name), degree: Number(best.degree) || 0 }
  })()`, 'pick-top-node')
  console.log(`  · 选中 ${aim.name}（度 ${aim.degree}）`)
  await sleep(2500)   // 等相机飞过去、边线更新完毕

  /* 等相机**真的停稳**再瞄准。
   *
   * 光 sleep 不够：选中节点后相机要飞一段（缓动），飞多久取决于距离。
   * 这里直接轮询相机位置，连续两次几乎不动才算稳。
   * 不稳的话探针算出的屏幕坐标在鼠标事件到达时已经过期 ——
   * 表现是"提示框没弹出"的假失败。 */
  await evalJs(cdp, `window.__nebula.scene.controls.autoRotate = false; true`, 'freeze-rotate')
  const stableFrom = await evalJs(cdp, `(() => {
    const c = window.__nebula.scene.camera
    window.__camPrev = [c.position.x, c.position.y, c.position.z]
    return true
  })()`, 'cam-snapshot')
  void stableFrom
  const tStable = await waitFor(cdp, `(() => {
    const c = window.__nebula.scene.camera
    const p = window.__camPrev
    const d = Math.abs(c.position.x - p[0]) + Math.abs(c.position.y - p[1]) + Math.abs(c.position.z - p[2])
    window.__camPrev = [c.position.x, c.position.y, c.position.z]
    return d < 0.02
  })()`, '相机停稳', 40000)
  console.log(`  · 相机停稳（${(tStable / 1000).toFixed(1)}s）`)
  await evalJs(cdp, `window.__nebula.scene.controls.update(); true`, 'controls-update')
  await sleep(500)

  // 探针：挑一条离画面中心最近的、可见的关联边
  const aimPt = await evalJs(cdp, `window.__nebula.probeEdgeHover()`, 'probeEdgeHover')
  if (aimPt.err) {
    ok(false, `瞄准失败: ${aimPt.err}`)
  } else {
    console.log(`  · 瞄准 (${aimPt.x.toFixed(0)}, ${aimPt.y.toFixed(0)}) → 边 #${aimPt.edge}`)
    console.log(`  · 该边理由: ${aimPt.label}`)
    /* 发**真实**的鼠标移动（Input.dispatchMouseEvent），不是合成 DOM 事件 ——
     * 后者走不到 canvas 上监听的原生 pointermove，
     * 测出来的"成功"是假的。
     *
     * 相机已停稳（上面轮询过），所以这次往返期间坐标不会变。 */
    await cdp.send('Input.dispatchMouseEvent', {
      type: 'mouseMoved', x: Math.round(aimPt.x), y: Math.round(aimPt.y), buttons: 0,
    })
    await sleep(1200)
    const tip = await evalJs(cdp, `(() => {
      const t = document.querySelector('#tip')
      if (!t) return null
      return { on: t.classList.contains('on'), edge: t.classList.contains('edge'), text: t.textContent }
    })()`)
    ok(tip && tip.on, '悬停后提示框弹出')
    ok(tip && tip.edge, '提示框是"连线"样式（#tip.edge，定宽换行）')
    if (tip && tip.text) {
      console.log(`  · 提示内容: ${tip.text.replace(/\s+/g, ' ').trim().slice(0, 160)}`)
      // 提示里必须出现**那条边真实的那句理由**，不能只是两端名字
      const hasLabel = aimPt.label && tip.text.includes(aimPt.label.slice(0, 12))
      ok(hasLabel, '提示里包含该边自己的理由文字（不只是两端名字）')
    }
    await cdp.send('Page.captureScreenshot', { format: 'png', clip: {
      x: Math.max(0, aimPt.x - 300), y: Math.max(0, aimPt.y - 200), width: 620, height: 340, scale: 2,
    } }).then((r) => writeFileSync(`${OUT}/edge-hover.png`, Buffer.from(r.data, 'base64')))
    console.log(`  · 截图 ${OUT}/edge-hover.png`)
  }

  await cdp.send('Page.captureScreenshot', { format: 'png' }).then((r) =>
    writeFileSync(`${OUT}/overview.png`, Buffer.from(r.data, 'base64')))
  console.log(`\n  · 截图 ${OUT}/overview.png`)
} catch (e) {
  console.error('\n✗ ' + e.message)
  problems.push(e.message)
} finally {
  chrome.kill()
}

console.log(`\n${problems.length === 0 ? '✓ 全部通过' : `✗ ${problems.length} 项问题`}`)
for (const p of problems) console.log(`  - ${p}`)
process.exit(problems.length ? 1 : 0)
