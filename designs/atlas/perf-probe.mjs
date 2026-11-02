/**
 * designs/atlas/perf-probe.mjs — 首屏公式可读性时间线探针（机器证据，不靠肉眼）。
 *
 * 用法：
 *   node designs/atlas/perf-probe.mjs [--label before|after] [--json] [--out file.json]
 *
 * 它只做一件事：打开 /designs/atlas/，从 ready 起每 40ms 采样一次
 * `__design.stats()`，记录
 *   · 可读公式数（stats().formulas，= alpha≥0.5 且位图已就绪的公式标签数）
 *   · 烘焙完成数 / 总数 / 已用墙钟
 * 然后算出：
 *   t40    = ready 之后多少毫秒达到 40 条可读公式（本任务的核心指标）
 *   tFinal = ready 之后多少毫秒 464 条全部烘焙完
 *   t100   = ready 之后多少毫秒达到 100 条可读公式（参考）
 *
 * 与验收器一致性：verify.mjs 读的也是 stats().formulas / stats().bakes，
 * 这里只是把它按时间轴采样，不引入新的判定口径。
 */
import { openPage } from '../cdp.mjs'
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'

const argv = process.argv.slice(2)
const opt = (n, d) => { const i = argv.indexOf(`--${n}`); return i > 0 ? argv[i + 1] : d }
const label = opt('label', 'run')
const asJson = argv.includes('--json')
const outFile = opt('out', null)

const URL = 'http://localhost:5190/designs/atlas/'
const page = await openPage({ url: URL, wait: 'window.__design && window.__design.ready', waitMs: 60000, port: 9500 + Math.floor(Math.random() * 300) })
if (!page.ready) { console.error('页面 60s 内未 ready'); process.exit(3) }

/** 在页面里跑时间线采样：从当前时刻起每 40ms 采一次，直到全部烘完或超时 */
const timeline = await page.eval(`
  const t0 = performance.now()
  const readyAt = (window.__design && window.__design.readyMs) || t0
  const samples = []
  const deadline = t0 + 60000
  await new Promise((res) => {
    const tick = () => {
      let st
      try { st = __design.stats() } catch (e) { return res() }
      samples.push({
        t: Math.round(performance.now() - readyAt),
        formulas: st.formulas || 0,
        names: st.names || 0,
        done: (st.bakes && st.bakes.done) || 0,
        failed: (st.bakes && st.bakes.failed) || 0,
        total: (st.bakes && st.bakes.total) || 0,
        wall: (st.bakes && st.bakes.wallMs) || 0,
        typeMs: (st.bakes && st.bakes.ms) || 0,
        fps: st.fps || 0,
        pumpAvg: st.pumpMs || 0,
        updAvg: st.updateMsAvg || 0,
      })
      const last = samples[samples.length - 1]
      if (last.total > 0 && last.done + last.failed >= last.total) return res()
      if (performance.now() > deadline) return res()
      setTimeout(tick, 40)
    }
    tick()
  })
  return { readyAt, samples }
`)

const S = timeline.samples
const first = (pred) => { const s = S.find(pred); return s ? s.t : null }
const t40 = first((s) => s.formulas >= 40)
const t100 = first((s) => s.formulas >= 100)
const tFinal = first((s) => s.total > 0 && s.done + s.failed >= s.total)
const last = S[S.length - 1] || {}

const summary = {
  label,
  readyMs: await page.eval('return (window.__design && window.__design.readyMs) || null'),
  samples: S.length,
  probeStartT: S.length ? S[0].t : null,
  formulasAtProbeStart: S.length ? S[0].formulas : null,
  t40, t100, tFinal,
  final: {
    formulas: last.formulas, done: last.done, total: last.total, failed: last.failed,
    wallMs: last.wall, typeMs: last.typeMs, fps: last.fps,
    pumpAvgMs: last.pumpAvg, updateAvgMs: last.updAvg,
  },
  errors: page.errors.slice(0, 8),
  // 时间线压缩：每 250ms 取一条，便于贴进 perf.md
  curve: S.filter((_, i) => i % 6 === 0 || i === S.length - 1).map((s) => [s.t, s.formulas, s.done]),
}
await page.close()

if (outFile) { mkdirSync(dirname(outFile), { recursive: true }); writeFileSync(outFile, JSON.stringify({ summary, timeline: S }, null, 2)) }
if (asJson) console.log(JSON.stringify(summary, null, 2))
else {
  console.log(`\n=== atlas 首屏可读性 [${label}] ===`)
  console.log(`ready:              ${summary.readyMs} ms`)
  console.log(`探针起点:           ready+${summary.probeStartT} ms，此时可读公式 ${summary.formulasAtProbeStart} 条`)
  console.log(`t40  (≥40 条可读):  ${t40 == null ? '未达到' : t40 + ' ms'}`)
  console.log(`t100 (≥100 条可读): ${t100 == null ? '未达到' : t100 + ' ms'}`)
  console.log(`tFinal (全部烘完):  ${tFinal == null ? '未达到' : tFinal + ' ms'}   (done=${last.done}/${last.total} failed=${last.failed} wallMs=${last.wall})`)
  console.log(`排版累计耗时 ms:    ${last.typeMs}   pump 均 ${last.pumpAvg} ms/帧   标签均 ${last.updAvg} ms/帧   fps ${last.fps}`)
  if (summary.errors.length) console.log('页面错误:', summary.errors)
  console.log('曲线 (t_ms, 可读公式, 已烘):')
  console.log(summary.curve.map((c) => c.join('\t')).join('\n'))
}
