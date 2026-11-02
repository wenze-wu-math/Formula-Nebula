/**
 * designs/atlas/star-cover.mjs — 缺陷 2 的机器证据：有多少公式标签压在星点上。
 *
 *   node designs/atlas/star-cover.mjs
 *
 * 判定口径（与 labels.js 的碰撞规则一致，独立重算，不信任 labels 自己的统计）：
 *   对每个已放置的公式标签盒（alpha ≥ 0.5），逐个星点算"圆心到矩形的最短距离"，
 *   若 < 星点半径 r，则记一次覆盖，惩罚量 = r − d（px）。
 * 分档报告：mag≤2 / mag3 / mag4 / mag5 / mag6（r 从 5.2px 递减到 1.5px）。
 * 输出同时给出"改前 / 改后"两次快照的对比（用 --json 存盘再比对）。
 */
import { openPage } from '../cdp.mjs'
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname } from 'node:path'

const argv = process.argv.slice(2)
const outFile = (() => { const i = argv.indexOf('--out'); return i > 0 ? argv[i + 1] : null })()
const page = await openPage({
  url: 'http://localhost:5190/designs/atlas/',
  wait: 'window.__design && window.__design.ready', waitMs: 60000,
  port: 9500 + Math.floor(Math.random() * 300),
})
if (!page.ready) { console.error('未 ready'); process.exit(3) }

/* 等首屏烘焙稳定（不是等 464 条，而是等本帧参选者的 pending 归零） */
for (let i = 0; i < 120; i++) {
  const p = await page.eval('return __design.stats().pendingBakes')
  if (p === 0) break
  await new Promise((r) => setTimeout(r, 250))
}
await new Promise((r) => setTimeout(r, 1500))

const res = await page.eval(`
  const a = __design.atlas
  const labels = __design.labels().filter(l => l.kind === 'formula' && l.alpha > 0.5 && l.placed)
  const all = [...a.stars, ...a.dsos]
  const byMag = {}
  let covered = 0, totalPen = 0
  const worst = []
  for (const l of labels) {
    for (const o of all) {
      if (o.id === l.id) continue
      const q = __design.screenOf(o.id)
      if (!q.visible) continue
      const nx = Math.max(l.x, Math.min(q.x, l.x + l.w))
      const ny = Math.max(l.y, Math.min(q.y, l.y + l.h))
      const d = Math.hypot(q.x - nx, q.y - ny)
      if (d >= q.r) continue
      const pen = q.r - d
      covered++; totalPen += pen
      const k = o.kind === 'dso' ? 'dso' + o.tier : 'mag' + o.mag
      byMag[k] = (byMag[k] || 0) + 1
      worst.push({ label: l.id, other: o.id, kind: o.kind, r: Math.round(q.r * 100) / 100, pen: Math.round(pen * 100) / 100 })
    }
  }
  const st = __design.stats()
  return {
    formulaLabels: labels.length,
    coveredPairs: covered,
    totalPenPx: Math.round(totalPen * 100) / 100,
    byMag,
    worst: worst.sort((x, y) => y.pen - x.pen).slice(0, 15),
    stats: { formulas: st.formulas, visible: st.visibleLabels, overlapping: st.overlappingLabels, L: st.L },
  }
`)

console.log('--- 缺陷 2：公式标签压星点 ---')
console.log(JSON.stringify(res, null, 2))
if (outFile) { mkdirSync(dirname(outFile), { recursive: true }); writeFileSync(outFile, JSON.stringify(res, null, 2)); console.log('saved', outFile) }
await page.close()
