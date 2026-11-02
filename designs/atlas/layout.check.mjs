/**
 * designs/atlas/layout.check.mjs — 布局自测（SPEC §3.7）。运行：node designs/atlas/layout.check.mjs
 *
 * 断言 ① 坐标全部有限 ② 每颗星在本族格内且距边界 ≥ REGION_INSET − 0.5 ③ 星间距 ≥ 10
 *      ④ 每族区域连通 ⑤ 两次运行结果逐位相同（第二次用重新 buildGraph() 的图）
 *      ⑥ 研究者名字相邻角距满足 §3.5 ⑦ 打印各族星数 / 格数 / 边界段数 / 连线数 / 耗时
 * 另附契约检查：数量、排序、字段、边界段格式、regionAt、邻居表。任一失败 → exit(1)。
 */
const here = (p) => new URL(p, import.meta.url).href
const kb = await import(here('../shared/kb.js'))
const { buildAtlas, regionAt, researcherMinGap, estimateWidth, RES_FONT_DEFAULT } = await import(here('./layout.js'))
const C = await import(here('./constants.js'))
const geo = await import(here('./geo.js'))

const TAU = Math.PI * 2
let fails = 0
const check = (ok, msg) => { if (!ok) { fails++; console.error('  ✗ ' + msg) } return ok }
const section = (t) => console.log('\n' + t)

const g1 = kb.getGraph()
const A = buildAtlas(g1)

/* ───────── ① 有限坐标 ───────── */
section('① 坐标有限')
let nonFinite = 0
for (const b of A.bodies.values()) {
  for (const k of ['x', 'y']) if (!Number.isFinite(b[k])) nonFinite++
  if (b.kind === 'researcher') for (const k of ['raLabel', 'raTarget', 'anchorX', 'anchorY']) if (!Number.isFinite(b[k])) nonFinite++
}
for (const r of Object.values(A.regions)) for (const v of [r.labelX, r.labelY, r.bbox.x0, r.bbox.y0, r.bbox.x1, r.bbox.y1]) if (!Number.isFinite(v)) nonFinite++
check(nonFinite === 0, `${nonFinite} 个非有限坐标`)
console.log(`  bodies ${A.bodies.size}，非有限 ${nonFinite}`)

/* ───────── ② 星在本族格内、距边界 ≥ INSET − 0.5 ───────── */
section('② 区域收纳')
const segDist = (x, y, s) => {
  const p = geo.worldToPolar(x, y)
  if (s.kind === 'arc') {
    if (geo.normRa(p.ra - s.ra0) <= s.ra1 - s.ra0) return Math.abs(p.r - s.r)
    const e0 = geo.polarToWorld(s.r, s.ra0), e1 = geo.polarToWorld(s.r, s.ra1)
    return Math.min(Math.hypot(x - e0.x, y - e0.y), Math.hypot(x - e1.x, y - e1.y))
  }
  const u = geo.polarToWorld(1, s.ra)
  const t = Math.max(s.r0, Math.min(s.r1, x * u.x + y * u.y))
  return Math.hypot(x - t * u.x, y - t * u.y)
}
let wrongCell = 0, tooClose = 0, minEdge = Infinity
for (const s of A.stars) {
  if (!check(regionAt(A, s.x, s.y) === s.family, `${s.id} 不在本族格内（在 ${regionAt(A, s.x, s.y)}，应为 ${s.family}）`)) { wrongCell++; continue }
  let d = C.R_DISK - Math.hypot(s.x, s.y)
  for (const seg of A.boundaries) if (seg.a === s.family || seg.b === s.family) d = Math.min(d, segDist(s.x, s.y, seg))
  minEdge = Math.min(minEdge, d)
  if (!check(d >= C.REGION_INSET - 0.5, `${s.id} 距边界 ${d.toFixed(2)} < ${C.REGION_INSET - 0.5}`)) tooClose++
}
console.log(`  不在本族格 ${wrongCell}，离边界过近 ${tooClose}，最小边界距离 ${minEdge.toFixed(2)}`)

/* ───────── ③ 星间距 ≥ 10 ───────── */
section('③ 星间距')
let minPair = Infinity, minPairIds = null, closePairs = 0
for (let i = 0; i < A.stars.length; i++) {
  for (let j = i + 1; j < A.stars.length; j++) {
    const a = A.stars[i], b = A.stars[j], d = Math.hypot(a.x - b.x, a.y - b.y)
    if (d < minPair) { minPair = d; minPairIds = [a.id, b.id] }
    if (d < 10) closePairs++
  }
}
check(closePairs === 0, `${closePairs} 对星间距 < 10`)
let minDso = Infinity
for (const d of A.dsos) for (const s of [...A.stars, ...A.dsos]) if (s !== d) minDso = Math.min(minDso, Math.hypot(s.x - d.x, s.y - d.y))
console.log(`  最小星间距 ${minPair.toFixed(2)}（${minPairIds}），深空天体到最近天体 ${minDso.toFixed(2)}`)

/* ───────── ④ 区域连通 ───────── */
section('④ 区域连通')
const cellsOfFam = C.FAMILY_ORDER.map(() => [])
for (let b = 0; b < C.REGION_BANDS; b++) {
  check(A.cells[b] instanceof Int8Array && A.cells[b].length === C.regionCols(b), `cells[${b}] 类型或长度错误`)
  for (let c = 0; c < A.cells[b].length; c++) cellsOfFam[A.cells[b][c]]?.push([b, c])
}
const neighboursOf = (b, c) => {
  const out = [], cols = C.regionCols(b)
  out.push([b, (c + 1) % cols], [b, (c + cols - 1) % cols])
  for (const ob of [b - 1, b + 1]) {
    if (ob < 0 || ob >= C.REGION_BANDS) continue
    const oc = C.regionCols(ob)
    for (let k = 0; k < oc; k++) if (k / oc < (c + 1) / cols && c / cols < (k + 1) / oc) out.push([ob, k])
  }
  return out
}
C.FAMILY_ORDER.forEach((f, fi) => {
  const list = cellsOfFam[fi]
  if (!check(list.length > 0, `${f} 没有格`)) return
  const seen = new Set([list[0].join(',')]), q = [list[0]]
  while (q.length) {
    const [b, c] = q.pop()
    for (const [ob, oc] of neighboursOf(b, c)) {
      const k = ob + ',' + oc
      if (!seen.has(k) && A.cells[ob][oc] === fi) { seen.add(k); q.push([ob, oc]) }
    }
  }
  check(seen.size === list.length, `${f} 区域不连通（${seen.size}/${list.length}）`)
  check(A.regions[f].cellCount === list.length, `${f} cellCount ${A.regions[f].cellCount} ≠ ${list.length}`)
})
console.log('  8 族各自连通性已检查')

/* ───────── ⑤ 确定性 ───────── */
section('⑤ 两次运行逐位相同')
const g2 = kb.buildGraph()
const B = buildAtlas(g2)
const snap = (X) => JSON.stringify({
  rCap: X.rCap, sectors: X.sectors,
  bodies: [...X.bodies.values()].map((b) => [b.id, b.kind, b.family, b.x, b.y, b.mag, b.tier, b.status, b.labelL, b.nameL, b.formulaPx, b.raLabel, b.raTarget, b.anchorX, b.anchorY]),
  order: [X.stars.map((s) => s.id), X.dsos.map((s) => s.id), X.researchers.map((s) => s.id)],
  cells: X.cells.map((r) => [...r]), boundaries: X.boundaries, figures: X.figures,
  regions: Object.values(X.regions).map((r) => [r.family, r.labelX, r.labelY, r.bbox, r.cellCount, r.starIds]),
  nb: [...X.neighbours].map(([k, v]) => [k, v.map((e) => [e.id, e.weight, e.type, e.cross])]),
})
const s1 = snap(A), s2 = snap(B)
check(s1 === s2, '两次 buildAtlas 结果不同')
console.log(`  快照 ${s1.length} 字节，${s1 === s2 ? '一致' : '不一致'}`)

/* ───────── ⑥ 研究者间距 ───────── */
section('⑥ 研究者名字间距')
const R = A.researchers, widths = R.map((r) => estimateWidth(r.node.name, RES_FONT_DEFAULT))
let need = 0
for (let i = 0; i < R.length; i++) need += researcherMinGap(widths[i], widths[(i + 1) % R.length])
const scale = need > TAU ? TAU / need * 0.999 : 1
let worst = Infinity
for (let i = 0; i < R.length; i++) {
  const a = R[i], b = R[(i + 1) % R.length]
  const gap = geo.normRa(b.raLabel - a.raLabel) || (R.length === 1 ? TAU : 0)
  const req = researcherMinGap(widths[i], widths[(i + 1) % R.length]) * scale
  worst = Math.min(worst, gap / req)
  check(gap >= req - 1e-5, `${a.id} → ${b.id} 角距 ${(gap * 180 / Math.PI).toFixed(2)}° < ${(req * 180 / Math.PI).toFixed(2)}°`)
}
for (let i = 1; i < R.length; i++) check(R[i - 1].raLabel <= R[i].raLabel, 'researchers 未按 raLabel 升序')
const drift = R.map((r) => Math.abs(geo.raDelta(r.raTarget, r.raLabel)) * 180 / Math.PI)
console.log(`  ${R.length} 位，最紧相邻 = ${worst.toFixed(3)}×最小角距，偏离目标角 平均 ${(drift.reduce((s, v) => s + v, 0) / drift.length).toFixed(1)}° / 最大 ${Math.max(...drift).toFixed(1)}°`)

/* ───────── 契约：数量 / 排序 / 字段 / 边界段 / regionAt / 邻居 ───────── */
section('契约检查')
const nT = g1.nodes.filter((n) => !n.cluster && !n.researcher).length
const nC = g1.nodes.filter((n) => n.cluster).length, nR = g1.nodes.filter((n) => n.researcher).length
check(A.stars.length === nT && A.dsos.length === nC && A.researchers.length === nR && A.bodies.size === g1.nodes.length,
  `数量不符：${A.stars.length}/${A.dsos.length}/${A.researchers.length}/${A.bodies.size}`)
const imp = (a, b) => b.importance - a.importance || (a.id < b.id ? -1 : 1)
for (let i = 1; i < A.stars.length; i++) {
  const a = A.stars[i - 1], b = A.stars[i]
  check(a.mag < b.mag || (a.mag === b.mag && imp(a, b) < 0), `stars 排序错误 @${i} ${a.id} / ${b.id}`)
}
for (let i = 1; i < A.dsos.length; i++) {
  const a = A.dsos[i - 1], b = A.dsos[i]
  check(a.tier < b.tier || (a.tier === b.tier && imp(a, b) < 0), `dsos 排序错误 @${i}`)
}
const magCount = [0, 0, 0, 0, 0, 0]
for (const s of A.stars) {
  magCount[s.mag - 1]++
  check(s.kind === 'star' && s.tier === 0 && s.status === null && s.labelL === C.MAG_LABEL_L[s.mag - 1]
    && Math.abs(s.nameL - (s.labelL + C.NAME_EXTRA_L)) < 1e-12 && s.formulaPx === C.FORMULA_PX[s.mag - 1] && s.node && s.id === s.node.id,
    `star 字段错误 ${s.id}`)
}
const statuses = new Set(Object.keys(kb.CONJECTURE_STATUS))
for (const d of A.dsos) {
  const tier = d.importance >= C.DSO_TIER_CUTS[0] ? 1 : d.importance >= C.DSO_TIER_CUTS[1] ? 2 : 3
  check(d.kind === 'dso' && d.tier === tier && d.mag === tier + 1 && statuses.has(d.status) && d.status === d.node.status
    && d.family === regionAt(A, d.x, d.y) && d.labelL === C.DSO_LABEL_L[tier - 1] && d.formulaPx === C.DSO_FORMULA_PX[tier - 1]
    && Math.hypot(d.x, d.y) <= C.R_DISK - 30 + 0.02 && Math.hypot(d.x, d.y) >= 20 - 0.02, `dso 字段错误 ${d.id}`)
}
for (const r of R) {
  const p = geo.polarToWorld(C.R_RES, r.raLabel), q = geo.polarToWorld(C.R_RES_TICK, r.raLabel)
  check(r.kind === 'researcher' && r.family === 'researcher' && r.mag === 3 && r.tier === 0 && r.labelL === C.RES_LABEL_L
    && r.nameL === C.RES_LABEL_L && r.formulaPx === 0 && Math.abs(r.x - p.x) < 0.01 && Math.abs(r.y - p.y) < 0.01
    && Math.abs(r.anchorX - q.x) < 0.01 && Math.abs(r.anchorY - q.y) < 0.01 && r.raLabel >= 0 && r.raLabel < TAU, `researcher 字段错误 ${r.id}`)
}
for (const s of A.boundaries) {
  if (s.kind === 'arc') check(s.ra0 < s.ra1 && s.ra1 - s.ra0 <= TAU && s.ra0 >= 0 && s.ra0 < TAU && s.r > 0 && s.r < C.R_DISK && s.a !== s.b, `arc 段非法 ${JSON.stringify(s)}`)
  else check(s.kind === 'radial' && s.r0 < s.r1 && s.r1 <= C.R_DISK && s.ra >= 0 && s.ra < TAU && s.a !== s.b, `radial 段非法 ${JSON.stringify(s)}`)
}
check(regionAt(A, 0, -1200) === null && regionAt(A, 2000, 0) === null && regionAt(A, NaN, 0) === null, 'regionAt 盘外应为 null')
check(regionAt(A, 0, 0) !== null, 'regionAt(0,0) 应有族')
let nbBad = 0, nbTotal = 0
for (const [id, arr] of A.neighbours) {
  nbTotal += arr.length
  for (let i = 1; i < arr.length; i++) if (arr[i - 1].weight < arr[i].weight || (arr[i - 1].weight === arr[i].weight && arr[i - 1].id > arr[i].id)) nbBad++
  for (const e of arr) if (!A.bodies.has(e.id) || typeof e.cross !== 'boolean' || !('label' in e) || !('type' in e)) nbBad++
}
check(A.neighbours.size === g1.nodes.length && nbTotal === 2 * g1.links.length && nbBad === 0, `neighbours 错误：${nbBad}，总 ${nbTotal}`)
for (const [f, list] of Object.entries(A.figures)) {
  for (const [a, b] of list) check(A.bodies.get(a)?.family === f && A.bodies.get(b)?.family === f && A.neighbours.get(a).some((e) => e.id === b), `figure 边非法 ${f} ${a}-${b}`)
}
for (const f of C.FAMILY_ORDER) {
  const r = A.regions[f]
  check(r && r.family === f && r.name === kb.FAMILIES[f].name && r.latin === C.FAMILY_LATIN[f] && regionAt(A, r.labelX, r.labelY) === f
    && r.bbox.x0 <= r.bbox.x1 && r.bbox.y0 <= r.bbox.y1 && r.starIds.length === A.stars.filter((s) => s.family === f).length, `region 错误 ${f}`)
}
console.log(`  星等分布 ${magCount.join(' / ')}；dso tier ${[1, 2, 3].map((t) => A.dsos.filter((d) => d.tier === t).length).join(' / ')}`)

/* ───────── ⑦ 统计 ───────── */
section('⑦ 统计')
const pad = (s, n) => String(s).padEnd(n)
console.log('  ' + pad('族', 12) + pad('星', 5) + pad('格', 5) + pad('边界段', 8) + pad('连线', 6) + '星座名位置')
for (const f of C.FAMILY_ORDER) {
  const r = A.regions[f]
  const nb = A.boundaries.filter((s) => s.a === f || s.b === f).length
  console.log('  ' + pad(f, 12) + pad(r.starIds.length, 5) + pad(r.cellCount, 5) + pad(nb, 8) + pad(A.figures[f].length, 6) + `(${r.labelX}, ${r.labelY})`)
}
const nArc = A.boundaries.filter((s) => s.kind === 'arc').length
console.log(`  边界段共 ${A.boundaries.length}（arc ${nArc} / radial ${A.boundaries.length - nArc}），rCap = ${A.rCap}`)
const times = []
for (let k = 0; k < 3; k++) times.push(buildAtlas(g1).ms)
console.log(`  耗时 ${A.ms} ms（首次），再跑 3 次 ${times.join(' / ')} ms`)

console.log(fails ? `\n失败 ${fails} 项` : '\n全部通过')
process.exit(fails ? 1 : 0)
