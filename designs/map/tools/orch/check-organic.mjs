/**
 * tools/orch/check-organic.mjs — 量化"国家边界是否有机"，不靠肉眼。
 *
 * 对每个国家的**主环**（面积最大的外环）算四个形状指标，并与理想圆对比：
 *
 *   circularity  = 4π·A / P²         正圆恒为 1；越偏离 1 越不圆（海湾/半岛/锯齿都会拉低它）
 *   radialCv     = std(到质心的距离) / mean(...)   正圆恒为 0；越大说明轮廓起伏越大
 *   inflections  = 极角排序后，径向半径符号变化的次数（每 100 个顶点）  正圆恒为 0
 *   turningP90   = 相邻边转角绝对值分布的 90 分位（度）  正圆 = 顶点数决定的常数，锯齿会抬高它
 *
 * 判据（本项目的验收线，写在 designs/map/README.md 里）：
 *   8 个国家的 circularity 全部 ≤ 0.90、radialCv 全部 ≥ 0.06、inflections > 0 —— 即轮廓确实不是圆。
 *
 * 用法：node designs/map/tools/orch/check-organic.mjs [stub|build]
 *   不带参数 = 两个都跑并给对比表（README 的"改前 / 改后"数字就取自这里）。
 */
import { pathToFileURL } from 'node:url'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, '../../../..')
const { getGraph } = await import(pathToFileURL(resolve(root, 'designs/shared/kb.js')).href)

/** 鞋带面积（绝对值） */
function area(r) {
  let s = 0
  const n = r.length >> 1
  for (let i = 0, j = n - 1; i < n; j = i++) s += r[2 * j] * r[2 * i + 1] - r[2 * i] * r[2 * j + 1]
  return Math.abs(s) / 2
}
/** 周长 */
function perim(r) {
  const n = r.length >> 1
  let s = 0
  for (let i = 0; i < n; i++) { const j = (i + 1) % n; s += Math.hypot(r[2 * j] - r[2 * i], r[2 * j + 1] - r[2 * i + 1]) }
  return s
}
/** 质心（面积加权） */
function centroid(r) {
  let a = 0, cx = 0, cy = 0
  const n = r.length >> 1
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const f = r[2 * j] * r[2 * i + 1] - r[2 * i] * r[2 * j + 1]
    a += f; cx += (r[2 * j] + r[2 * i]) * f; cy += (r[2 * j + 1] + r[2 * i + 1]) * f
  }
  a /= 2
  if (Math.abs(a) < 1e-9) return { x: r[0], y: r[1] }
  return { x: cx / (6 * a), y: cy / (6 * a) }
}

/** 轮廓形状指标 */
function shapeMetrics(ring) {
  const A = area(ring), P = perim(ring)
  const circularity = P > 0 ? (4 * Math.PI * A) / (P * P) : 0
  const c = centroid(ring)
  const n = ring.length >> 1
  const rr = new Float64Array(n), ang = new Float64Array(n)
  for (let i = 0; i < n; i++) {
    const dx = ring[2 * i] - c.x, dy = ring[2 * i + 1] - c.y
    rr[i] = Math.hypot(dx, dy)
    ang[i] = Math.atan2(dy, dx)
  }
  // 按极角排序后再看径向起伏（保证"相邻"在角度上相邻）
  const idx = Array.from({ length: n }, (_, i) => i).sort((a, b) => ang[a] - ang[b])
  let mean = 0
  for (const i of idx) mean += rr[i]
  mean /= n
  let vr = 0
  for (const i of idx) vr += (rr[i] - mean) ** 2
  const radialCv = mean > 0 ? Math.sqrt(vr / n) / mean : 0
  // 径向符号变化（相对中位数），每 100 顶点
  const sorted = Array.from(rr).sort((a, b) => a - b)
  const medR = sorted[n >> 1]
  let flips = 0
  for (let k = 1; k < n; k++) {
    const a = rr[idx[k - 1]] - medR, b = rr[idx[k]] - medR
    if (a * b < 0) flips++
  }
  const inflections = (flips * 100) / n
  // 相邻边转角
  const turns = []
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n, k = (i + 2) % n
    const ax = ring[2 * j] - ring[2 * i], ay = ring[2 * j + 1] - ring[2 * i + 1]
    const bx = ring[2 * k] - ring[2 * j], by = ring[2 * k + 1] - ring[2 * j + 1]
    const la = Math.hypot(ax, ay), lb = Math.hypot(bx, by)
    if (la < 1e-9 || lb < 1e-9) continue
    const cosv = Math.max(-1, Math.min(1, (ax * bx + ay * by) / (la * lb)))
    turns.push((Math.acos(cosv) * 180) / Math.PI)
  }
  turns.sort((a, b) => a - b)
  const turningP90 = turns.length ? turns[Math.floor(turns.length * 0.9)] : 0
  return { A, P, circularity, radialCv, inflections, turningP90, vertices: n }
}

async function run(mod) {
  const { buildWorld } = await import(pathToFileURL(resolve(root, `designs/map/src/world/${mod}.js`)).href)
  const graph = getGraph()
  const t0 = performance.now()
  const W = buildWorld(graph, { raster: false })
  const ms = performance.now() - t0
  const rows = []
  for (const c of W.countries) {
    // 主环 = 面积最大的正面积环
    let main = null, bestA = -1
    for (const r of c.rings) {
      const a = area(r)
      const signed = (() => {
        let s = 0
        const n = r.length >> 1
        for (let i = 0, j = n - 1; i < n; j = i++) s += r[2 * j] * r[2 * i + 1] - r[2 * i] * r[2 * j + 1]
        return s / 2
      })()
      if (signed > 0 && a > bestA) { bestA = a; main = r }
    }
    if (!main) continue
    rows.push({ id: c.id, zh: c.zh, ...shapeMetrics(main) })
  }
  return { rows, ms, coastRings: W.coast.length, borderChains: W.borders.length }
}

const arg = process.argv[2]
const mods = arg ? [arg] : ['stub', 'build']
const res = {}
for (const m of mods) res[m] = await run(m)

const fmt = (v, k = 3) => (typeof v === 'number' ? v.toFixed(k) : String(v))
for (const m of mods) {
  const { rows, ms, coastRings, borderChains } = res[m]
  console.log(`\n=== ${m}.js   构建 ${ms.toFixed(0)} ms   海岸环 ${coastRings}   国界链 ${borderChains}`)
  console.log('  国家            顶点   circularity  radialCv  inflections  turningP90°')
  for (const r of rows) {
    console.log(`  ${r.zh.padEnd(8, '　')} ${String(r.vertices).padStart(6)}  ${fmt(r.circularity).padStart(11)}  ${fmt(r.radialCv).padStart(8)}  ${fmt(r.inflections, 1).padStart(11)}  ${fmt(r.turningP90, 1).padStart(10)}`)
  }
  const circ = rows.map((r) => r.circularity)
  const cv = rows.map((r) => r.radialCv)
  console.log(`  合计：circularity ${fmt(Math.min(...circ))}–${fmt(Math.max(...circ))}；radialCv ${fmt(Math.min(...cv))}–${fmt(Math.max(...cv))}`)
}

if (mods.length === 2) {
  const a = res.stub.rows, b = res.build.rows
  console.log('\n=== 判据（README 写明的验收线）：8 国 circularity 全部 ≤ 0.90 且 radialCv 全部 ≥ 0.06 且 inflections > 0')
  const bad = b.filter((r) => !(r.circularity <= 0.9 && r.radialCv >= 0.06 && r.inflections > 0))
  const stubCirc = a.map((r) => r.circularity)
  console.log(`  stub（改前）：circularity ${fmt(Math.min(...stubCirc))}–${fmt(Math.max(...stubCirc))}  → 全部≈1，就是圆`)
  console.log(`  build（改后）：${bad.length === 0 ? '全部通过判据' : '未通过 ' + bad.map((r) => r.zh).join('、')}`)
  process.exit(bad.length ? 1 : 0)
}
