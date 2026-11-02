/**
 * designs/atlas/diag3.mjs — 一次性诊断：把 26 秒拆到"排版 / 解码 / 绘制"三段里。
 *
 *   node designs/atlas/diag3.mjs
 *
 * 只在 L=0 跑，不推视口（推 L=3.5 会让 464 个 SVG 同时解码把渲染进程打崩）。
 * 关键数字：
 *   · texSync 单条耗时（真实公式 vs 平凡公式）→ 决定 464 条的理论下界
 *   · img.decode() 单条耗时 → 决定并发上限是否够
 *   · pump 里到底有多少时间在排版
 */
import { openPage } from '../cdp.mjs'

const page = await openPage({
  url: 'http://localhost:5190/designs/atlas/',
  wait: 'window.__design && window.__design.ready', waitMs: 60000,
  port: 9500 + Math.floor(Math.random() * 300),
})
if (!page.ready) { console.error('未 ready'); process.exit(3) }

const guard = async (expr, fallback = null) => { try { return await page.eval(expr) } catch (e) { console.log('[eval error]', e.message.slice(0, 200)); return fallback } }

/* ① texSync 单条耗时（真实公式，取 L=0 的 40 个参选者） */
const texCost = await guard(`
  const { texSync } = await import('/designs/shared/tex.js')
  const a = __design.atlas
  const cand = [...a.stars, ...a.dsos].filter(b => b.labelL <= 0.15)
  const lats = cand.map(b => (a.bodies.get(b.id).node || {}).latex).filter(Boolean)
  const t0 = performance.now()
  const N = Math.min(24, lats.length)
  for (let i = 0; i < N; i++) texSync(lats[i], '#f1e7cf')
  const t1 = performance.now()
  // 第二轮（MathJax 已预热）
  for (let i = 0; i < N; i++) texSync(lats[i], '#f1e7cf')
  const t2 = performance.now()
  // 平凡公式基线
  for (let i = 0; i < N; i++) texSync('x^2 + y^2 = z^2', '#f1e7cf')
  const t3 = performance.now()
  return {
    n: N, latexCount: lats.length,
    coldMsPer: Math.round((t1 - t0) / N * 100) / 100,
    warmMsPer: Math.round((t2 - t1) / N * 100) / 100,
    trivialMsPer: Math.round((t3 - t2) / N * 100) / 100,
    sampleLatex: lats.slice(0, 3),
    avgSvgLen: Math.round(lats.slice(0, N).reduce((s, l) => s + texSync(l, '#f1e7cf').svg.length, 0) / N),
  }
`)
console.log('--- ① texSync 单条耗时 ---')
console.log(JSON.stringify(texCost, null, 2))

/* ② img.decode() 单条耗时 */
const decodeCost = await guard(`
  const { texSync } = await import('/designs/shared/tex.js')
  const a = __design.atlas
  const cand = [...a.stars, ...a.dsos].filter(b => b.labelL <= 0.15)
  const lats = cand.map(b => (a.bodies.get(b.id).node || {}).latex).filter(Boolean).slice(0, 12)
  const t0 = performance.now()
  const urls = lats.map(l => URL.createObjectURL(new Blob([texSync(l, '#f1e7cf').svg], { type: 'image/svg+xml' })))
  const t1 = performance.now()
  const imgs = urls.map(u => { const im = new Image(); im.decoding = 'async'; im.src = u; return im })
  await Promise.all(imgs.map(im => im.decode().catch(() => null)))
  const t2 = performance.now()
  urls.forEach(u => URL.revokeObjectURL(u))
  return { n: lats.length, blobMsPer: Math.round((t1 - t0) / lats.length * 100) / 100, decodeMsPer: Math.round((t2 - t1) / lats.length * 100) / 100 }
`)
console.log('\n--- ② Blob 创建 / img.decode 单条耗时（并发全部）---')
console.log(JSON.stringify(decodeCost, null, 2))

/* ③ 当前 L=0 的烘焙进度（此时已跑了一会儿） */
const prog = await guard(`
  const s = __design.stats()
  return { formulas: s.formulas, visible: s.visibleLabels, pending: s.pendingBakes,
           done: s.bakes.done, total: s.bakes.total, failed: s.bakes.failed,
           wallMs: s.bakes.wallMs, typeMs: s.bakes.ms, fps: s.fps,
           pumpAvg: s.pumpMs, pumpMax: s.pumpMsMax, updAvg: s.updateMsAvg }
`)
console.log('\n--- ③ L=0 烘焙进度 ---')
console.log(JSON.stringify(prog, null, 2))

/* ④ 等 20 秒再看一次：公式数是否还在涨 */
await new Promise((r) => setTimeout(r, 20000))
const prog2 = await guard(`
  const s = __design.stats()
  return { formulas: s.formulas, visible: s.visibleLabels, pending: s.pendingBakes,
           done: s.bakes.done, total: s.bakes.total, failed: s.bakes.failed,
           wallMs: s.bakes.wallMs, typeMs: s.bakes.ms, fps: s.fps }
`)
console.log('\n--- ④ 再过 20s ---')
console.log(JSON.stringify(prog2, null, 2))

await page.close()
