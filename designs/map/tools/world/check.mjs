/**
 * tools/world/check.mjs — world 模块自测：断言 SPEC §6.3 的 8 条不变量，打印耗时、国土面积、相邻国界。
 * 用法：node designs/map/tools/world/check.mjs [--mod build]（默认测 src/world/index.js）
 */
import { pathToFileURL } from 'node:url'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, '../../../..')
const modName = process.argv.includes('--mod') ? process.argv[process.argv.indexOf('--mod') + 1] : 'index'
const { getGraph } = await import(pathToFileURL(resolve(root, 'designs/shared/kb.js')).href)
const { buildWorld } = await import(pathToFileURL(resolve(root, `designs/map/src/world/${modName}.js`)).href)
const C = await import(pathToFileURL(resolve(root, 'designs/map/src/constants.js')).href)
const { hexAdjacentPairs } = await import(pathToFileURL(resolve(root, 'designs/map/src/world/layout.js')).href)
const { nearestOnPoly, ringArea, pointInRing } = await import(pathToFileURL(resolve(root, 'designs/map/src/world/contour.js')).href)

const graph = getGraph()
buildWorld(graph, { raster: false })                 // 预热（JIT），第二次计时
const t0 = performance.now()
const W = buildWorld(graph, { raster: false })
const wall = performance.now() - t0
const W2 = buildWorld(graph, { raster: false })

let fails = 0
const ok = (cond, name, detail = '') => { console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`); if (!cond) fails++ }
const distToRings = (rings, x, y) => { let d = Infinity; for (const r of rings) d = Math.min(d, nearestOnPoly(r, x, y, true).d); return d }

console.log('meta.ms', JSON.stringify(W.meta.ms), ` wall ${wall.toFixed(1)} ms`)

/* 1. 城市在本国内、离本国边界 ≥ 10 */
{
  let bad = [], minD = Infinity
  for (const p of W.places) {
    if (p.kind !== 'city') continue
    const c = W.countryById.get(p.family)
    const d = distToRings(c.rings, p.x, p.y)
    minD = Math.min(minD, d)
    if (W.countryAt(p.x, p.y) !== p.family || d < 10) bad.push(`${p.id}(${W.countryAt(p.x, p.y)},${d.toFixed(1)})`)
  }
  ok(!bad.length, '1 城市在本国且离边界 ≥ 10 wu', `最小 ${minD.toFixed(1)} wu; 违例 ${bad.length} ${bad.slice(0, 5).join(' ')}`)
}
/* 2. 每国主体一块连通，离岸小岛 < 1%，国家互不包含 */
{
  const msgs = []
  let good = true
  for (const c of W.countries) {
    const areas = c.rings.map((r) => ringArea(r)).sort((a, b) => b - a)
    const pos = areas.filter((a) => a > 0).reduce((s, a) => s + a, 0)
    const share = areas[0] / pos
    const smallOk = areas.slice(1).every((a) => Math.abs(a) < 0.01 * areas[0])
    if (share < 0.99 || !smallOk) good = false
    msgs.push(`${c.id}:${c.rings.length}环/${(share * 100).toFixed(1)}%`)
  }
  for (const a of W.countries) for (const b of W.countries) {
    if (a === b) continue
    const main = b.rings.reduce((m, r) => (ringArea(r) > ringArea(m) ? r : m), b.rings[0])
    if (a.rings.every((r) => pointInRing(main, r[0], r[1]) && ringArea(r) > 0) && ringArea(a.rings[0]) > 0 && a.rings.length && main) {
      // a 的所有环的起点都在 b 主环内 → 被包含
      const allIn = a.rings.every((r) => { for (let i = 0; i < r.length; i += 2) if (!pointInRing(main, r[i], r[i + 1])) return false; return true })
      if (allIn) { good = false; msgs.push(`${a.id} ⊂ ${b.id}`) }
    }
  }
  ok(good, '2 国土连通、互不包含', msgs.join(' '))
}
/* 3. 六角相邻对 ≥ 11 对共享国界 */
{
  const have = new Set(W.borders.map((b) => b.a + '|' + b.b))
  const pairs = hexAdjacentPairs()
  const hit = pairs.filter(([a, b]) => have.has(a + '|' + b))
  const miss = pairs.filter(([a, b]) => !have.has(a + '|' + b))
  ok(hit.length >= 11, '3 六角相邻对共享国界', `${hit.length}/${pairs.length}；缺 ${miss.map((p) => p.join('-')).join(',') || '无'}；非六角相邻却接壤 ${[...have].filter((k) => !pairs.some(([a, b]) => a + '|' + b === k)).join(',') || '无'}`)
  console.log('      共享国界的相邻对：', [...have].sort().join('  '))
}
/* 4. 城市最小间距 */
{
  const cs = W.places.filter((p) => p.kind === 'city')
  let mAll = Infinity, mTop = Infinity
  for (let i = 0; i < cs.length; i++) for (let j = i + 1; j < cs.length; j++) {
    const d = Math.hypot(cs[i].x - cs[j].x, cs[i].y - cs[j].y)
    mAll = Math.min(mAll, d)
    if (cs[i].tier <= 1 && cs[j].tier <= 1) mTop = Math.min(mTop, d)
  }
  ok(mAll >= 9 && mTop >= 30, '4 城市间距', `任意 ≥ ${mAll.toFixed(1)}，tier≤1 ≥ ${mTop.toFixed(1)}`)
}
/* 5. 岛屿 */
{
  const isl = W.places.filter((p) => p.kind === 'island')
  const B = W.bounds, bad = []
  const byStatus = {}
  for (const p of isl) {
    let minCoast = Infinity, onLand = false
    for (let i = 0; i < p.ring.length; i += 2) {
      const x = p.ring[i], y = p.ring[i + 1]
      if (W.countryAt(x, y)) onLand = true
      minCoast = Math.min(minCoast, distToRings(W.coast, x, y))
      if (x < B.x0 + 40 || x > B.x1 - 40 || y < B.y0 + 40 || y > B.y1 - 40) bad.push(p.id + ':出界')
    }
    if (W.countryAt(p.x, p.y)) onLand = true
    if (onLand) bad.push(p.id + ':在陆上')
    const need = C.ISLAND_OFFSHORE[p.status] * 0.6
    if (minCoast < need) bad.push(`${p.id}:离岸${minCoast.toFixed(0)}<${need}`)
    ;(byStatus[p.status] ||= []).push(minCoast)
  }
  let minGap = Infinity
  for (let i = 0; i < isl.length; i++) for (let j = i + 1; j < isl.length; j++) {
    const g = Math.hypot(isl[i].x - isl[j].x, isl[i].y - isl[j].y) - isl[i].r - isl[j].r
    minGap = Math.min(minGap, g)
  }
  if (minGap < 8) bad.push('岛间隙 ' + minGap.toFixed(1))
  const pts = isl.map((p) => p.ring.length / 2)
  ok(!bad.length, '5 岛屿在海上/离岸/间隙/界内', `最小岛间隙 ${minGap.toFixed(1)}；岛形点数 ${Math.min(...pts)}–${Math.max(...pts)}；${bad.slice(0, 6).join(' ')}`)
  console.log('      各状态离岸距离（岛岸→海岸，中位数）：', Object.entries(byStatus).map(([s, a]) => `${s} ${a.sort((x, y) => x - y)[a.length >> 1].toFixed(0)}（n=${a.length}）`).join('  '))
}
/* 6. 港口 */
{
  const ps = W.places.filter((p) => p.kind === 'port')
  const bad = []
  let minGap = Infinity, sym = [Infinity, -Infinity], pier = 0
  for (const p of ps) {
    const dp = distToRings(W.coast, p.pier.x, p.pier.y)
    const ds = distToRings(W.coast, p.x, p.y)
    pier = Math.max(pier, dp); sym = [Math.min(sym[0], ds), Math.max(sym[1], ds)]
    if (dp >= 2) bad.push(p.id + ':pier ' + dp.toFixed(1))
    if (ds < 8 || ds > 14 || W.countryAt(p.x, p.y)) bad.push(p.id + ':离岸 ' + ds.toFixed(1))
  }
  for (let i = 0; i < ps.length; i++) for (let j = i + 1; j < ps.length; j++) minGap = Math.min(minGap, Math.hypot(ps[i].x - ps[j].x, ps[i].y - ps[j].y))
  if (minGap < 22) bad.push('港口间距 ' + minGap.toFixed(1))
  ok(!bad.length && ps.length === 24, '6 港口', `${ps.length} 处；pier 离岸最大 ${pier.toFixed(2)}；符号离岸 ${sym[0].toFixed(1)}–${sym[1].toFixed(1)}；最小间距 ${minGap.toFixed(1)} ${bad.slice(0, 5).join(' ')}`)
}
/* 7. 数量与 fitBounds */
{
  const f = W.fitBounds
  const outside = W.places.filter((p) => p.x < f.x0 || p.x > f.x1 || p.y < f.y0 || p.y > f.y1)
  const order = W.places.map((p) => p.kind)
  const sorted = order.every((k, i) => i === 0 || ['city', 'island', 'port'].indexOf(order[i - 1]) <= ['city', 'island', 'port'].indexOf(k))
  ok(W.roads.length === 1670 && W.places.length === 488 && !outside.length && W.roadByKey.size === 1670 && W.placeById.size === 488 && sorted,
    '7 数量与 fitBounds', `roads ${W.roads.length} places ${W.places.length} fit ${JSON.stringify(Object.fromEntries(Object.entries(f).map(([k, v]) => [k, Math.round(v)])))} 越界 ${outside.length}`)
}
/* 8. 耗时 */
ok(wall < 900, '8 Node 构建耗时 < 900 ms', `${wall.toFixed(0)} ms（raster:false）`)

/* 附加：确定性、结构字段 */
{
  const sig = (w) => JSON.stringify(w.places.map((p) => [p.id, +p.x.toFixed(4), +p.y.toFixed(4)])) + w.coast.map((r) => r.length).join(',')
  ok(sig(W) === sig(W2), '+ 确定性（两次构建逐点一致）')
  const c0 = W.countries[0]
  const fields = ['id', 'zh', 'latin', 'colors', 'rings', 'center', 'labelPath', 'labelAngle', 'area', 'bbox', 'capitalId', 'placeIds']
  const labelsIn = W.countries.every((c) => { for (let i = 0; i < c.labelPath.length; i += 2) if (W.countryAt(c.labelPath[i], c.labelPath[i + 1]) !== c.id) return false; return c.labelPath[0] <= c.labelPath[c.labelPath.length - 2] })
  ok(fields.every((k) => k in c0) && labelsIn && W.countries.every((c) => Math.abs(c.labelAngle) <= 35 * Math.PI / 180 + 1e-9),
    '+ Country 字段齐全、国名基线在国内且自西向东、角度 ≤ 35°')
  ok(W.ripples.length === C.RIPPLES.length && W.ripples.every((r) => r.rings.length > 0), '+ ripples 与 RIPPLES 对应', W.ripples.map((r) => `${r.d}:${r.rings.length}`).join(' '))
  ok(W.seaLabels.length === 4 && W.seaLabels.filter((s) => s.small).length === 1, '+ 海名 4 条（含 1 条 small）', W.seaLabels.map((s) => `${s.zh}(${Math.round(s.x)},${Math.round(s.y)})`).join(' '))
  const kinds = {}
  for (const r of W.roads) kinds[r.kind] = (kinds[r.kind] || 0) + 1
  console.log('      道路类型：', JSON.stringify(kinds))
}
console.log('      国土面积（wu²）：', W.countries.map((c) => `${c.id} ${Math.round(c.area)}`).join('  '))
console.log(fails ? `\n${fails} 项失败` : '\n全部通过')
process.exit(fails ? 1 : 0)
