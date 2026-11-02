/**
 * designs/manuscript/formulas-worker.js — M2 的 MathJax 排版 worker（formulas.js 私有）。
 *
 * 为什么要 worker：本机实测 MathJax 在主线程上排完 464 条公式要 2.3–3.2 s（单线程），
 * 远超首屏预算。tex.js 用的是 liteAdaptor（不依赖 DOM），可以原样在 worker 里运行；
 * 开 N 个 worker 并行排版，主线程只收字符串，既快又不卡。
 *
 * 协议（主线程 → worker）：{ jobs: Array<{ i, latex, color, fallback }> }
 *   fallback：排版失败时重试用的 LaTeX（\text{名称}）
 * worker → 主线程：{ ready: true }（模块加载完毕），
 *                  { results: Array<{ i, svg, w, h, fb }> }（fb = 0 原式 / 1 用了 fallback / 2 两次都失败，svg 为空）
 */
import { texSync } from '../shared/tex.js'

function one(job) {
  try {
    const r = texSync(job.latex, job.color)
    return { i: job.i, svg: r.svg, w: r.widthPx, h: r.heightPx, fb: 0 }
  } catch { /* 走 fallback */ }
  try {
    const r = texSync(job.fallback, job.color)
    return { i: job.i, svg: r.svg, w: r.widthPx, h: r.heightPx, fb: 1 }
  } catch { /* 两次都失败，交给主线程画占位 */ }
  return { i: job.i, svg: '', w: 0, h: 0, fb: 2 }
}

self.onmessage = (e) => {
  const jobs = (e.data && e.data.jobs) || []
  self.postMessage({ results: jobs.map(one) })
}
self.postMessage({ ready: true })
