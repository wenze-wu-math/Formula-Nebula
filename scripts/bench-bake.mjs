/**
 * 烘焙流水线深度的对照实验。
 *
 * 用法: node scripts/bench-bake.mjs      （需先 npm run preview）
 *
 * ── 背景：为什么要做这个优化 ──
 * `bakeAll()` 原本是纯串行循环：
 *
 *     for (...) { 排版(i); await 解码(i); 绘制(i) }
 *
 * 实测（做法：给 Image.prototype.src 打桩，记录每次从赋 src 到 onload
 * 的间隔）发现，464 个公式里：
 *
 *     烘焙总计        5296 ms   100%
 *     其中 img 解码   2869 ms    54.2%   ← 与排版无依赖
 *     排版 + 绘制     2427 ms    45.8%   ← 排版必须串行（MathJax 非线程安全）
 *
 * 解码占了一半以上，而它是浏览器在别的线程上做的 ——
 * 串行循环让主线程在那 54.2% 的时间里纯空等。
 *
 * 改成有界前瞻后（排版第 i 个就启动它的解码、不 await，
 * 转去 await 更早启动的那些），实测：
 *
 *     深度 1（原串行）  5091 ms     基准
 *     深度 8            3786 ms     提速约 25%
 *     深度 16 / 32      4044~4200   反而变差（同时在飞的位图太多，内存压力）
 *
 * ── 为什么这个脚本必须存在 ──
 * 因为无头软件渲染的计时噪声很大（同一配置两次能差 15%）。
 * 单次对照很容易得出错误结论，所以这里：
 *   · 用 ?lookahead=N 让同一份构建跑不同深度，不必换构建
 *   · 关键深度跑两次取平均
 *   · 每次都校验 built 与 failed —— 提速不能以少烘或烘错为代价，
 *     这是硬约束，不是参考项
 *
 * 换机器或改公式数后，请重跑这个脚本重新确认最优深度，
 * 不要照搬 8 —— 它取决于解码延迟与内存之间的平衡。
 */
import { spawn } from 'node:child_process'
import { resolve } from 'node:path'
import { tmpdir } from 'node:os'
import { setTimeout as sleep } from 'node:timers/promises'

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const BASE = 'http://127.0.0.1:5176/'

async function measure(lookahead, port) {
  const profile = resolve(tmpdir(), `nb-la${lookahead}-${process.pid}`)
  const cp = spawn(CHROME, ['--headless=new', '--no-sandbox', '--disable-gpu-sandbox',
    '--enable-unsafe-swiftshader', '--use-gl=angle', '--use-angle=swiftshader',
    '--window-size=1600,1000', `--remote-debugging-port=${port}`,
    `--user-data-dir=${profile}`, '--no-first-run', '--no-default-browser-check',
    `${BASE}?lookahead=${lookahead}`], { stdio: ['ignore', 'pipe', 'pipe'] })
  cp.stderr.on('data', () => {})

  let t
  for (let i = 0; i < 600 && !t; i++) {
    try { const l = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json(); t = l.find(x => x.type === 'page' && x.webSocketDebuggerUrl) } catch {}
    if (!t) await sleep(500)
  }
  if (!t) { cp.kill(); return null }
  const ws = new WebSocket(t.webSocketDebuggerUrl)
  await new Promise((r, j) => { ws.onopen = r; ws.onerror = j })
  let id = 0; const pend = new Map()
  ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) { const p = pend.get(m.id); pend.delete(m.id); m.error ? p.j(new Error(JSON.stringify(m.error))) : p.r(m.result) } }
  const send = (method, params = {}) => new Promise((r, j) => { const i = ++id; pend.set(i, { r, j }); ws.send(JSON.stringify({ id: i, method, params })) })
  const ev = async (expression) => {
    const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description)
    return r.result.value
  }
  await send('Runtime.enable')
  let diag = null
  for (let i = 0; i < 900; i++) {
    const d = await ev(`(()=>{const e=document.getElementById('diag');return e?e.textContent:''})()`).catch(() => '')
    if (d) { try { const j = JSON.parse(d); if (j.built > 0) { diag = j; break } } catch {} }
    await sleep(1000)
  }
  // 记录失败数，确认流水线没有改变结果
  const failed = diag ? diag.failed : -1
  ws.close(); cp.kill(); await sleep(500)
  return diag ? { bake: diag.ms.bake, built: diag.built, failed, layout: diag.ms.layout } : null
}

console.log('扫流水线深度：找最优 lookahead\n')
const runs = []
for (const la of [1, 2, 4, 8, 16, 32, 4, 8]) {
  process.stdout.write(`  lookahead=${String(la).padStart(2)} ... `)
  const r = await measure(la, 9370 + runs.length)
  console.log(r ? `bake ${String(r.bake).padStart(5)} ms  (built ${r.built}, failed ${r.failed})` : '失败')
  if (r) runs.push({ la, ...r })
}

const byDepth = new Map()
for (const r of runs) {
  if (!byDepth.has(r.la)) byDepth.set(r.la, [])
  byDepth.get(r.la).push(r.bake)
}
const avg = (a) => a.reduce((x, y) => x + y, 0) / a.length
console.log('')
console.log('深度   平均 bake   样本')
const rows = [...byDepth.entries()].sort((a, b) => a[0] - b[0])
for (const [la, arr] of rows) {
  console.log(`  ${String(la).padStart(2)}   ${avg(arr).toFixed(0).padStart(6)} ms   ${JSON.stringify(arr)}`)
}

const base = byDepth.get(1)
if (base) {
  const b = avg(base)
  console.log('')
  console.log(`基准（la=1 串行）= ${b.toFixed(0)} ms`)
  for (const [la, arr] of rows) {
    if (la === 1) continue
    const g = (1 - avg(arr) / b) * 100
    console.log(`  la=${String(la).padStart(2)}  提速 ${g >= 0 ? '+' : ''}${g.toFixed(1)}%`)
  }
  /* 硬约束：提速不能以少烘或烘错为代价。
   * 不硬编码 464 —— 公式数会变，改成"各次运行结果必须一致且无失败"。 */
  const builtValues = [...new Set(runs.map((r) => r.built))]
  const anyFailed = runs.some((r) => r.failed !== 0)
  const consistent = builtValues.length === 1
  console.log('')
  console.log(`  各深度都烘出 ${builtValues.join('/')} 个公式，且${consistent ? '完全一致' : '**不一致!**'}`)
  console.log(`  ${!anyFailed && consistent ? '✓ 流水线没有改变烘焙结果' : '✗ 有回归 —— 收益不可信'}`)
  if (anyFailed || !consistent) process.exitCode = 1
}
