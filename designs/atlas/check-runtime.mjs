/**
 * designs/atlas/check-runtime.mjs — runtime.js 的尺度护栏（Node，可直接跑）。
 *
 * 断言三件事：
 *  A. k=1 时 runtime 的每个量与 constants.js 基准**逐位相同**（1× 行为不变）
 *  B. k 倍时每个量都恰好放大 k 倍（纯相似变换，角度与无量纲量不动）
 *  C. 非法输入（NaN / 0 / 负数）回落到 1，且**不会**把几何留成 NaN
 *
 * 用法：node designs/atlas/check-runtime.mjs
 */
import * as RT from './runtime.js'
import * as C from './constants.js'

let pass = 0, fail = 0
const ok = (name, cond, extra = '') => {
  if (cond) { pass++; console.log(`  PASS  ${name}${extra ? '  ' + extra : ''}`) }
  else { fail++; console.log(`  FAIL  ${name}${extra ? '  ' + extra : ''}`) }
}

const LENGTHS = ['R_DISK', 'BAND_W', 'R_SCALE_IN', 'R_SCALE_MID', 'R_SCALE_OUT',
  'R_HOUR_TEXT', 'R_RES_TICK', 'R_RES_TICK_END', 'R_RES', 'FIT_RADIUS']

console.log('\n── A. k=1 必须与 constants.js 逐位相同 ──')
RT.setWorldScale(1)
for (const k of LENGTHS) {
  let base
  if (k === 'BAND_W') base = C.R_DISK / C.REGION_BANDS
  else base = C[k]
  ok(`${k} === 基准`, RT[k] === base, `runtime=${RT[k]} base=${base}`)
}

console.log('\n── B. 放大 k 倍是纯相似变换 ──')
for (const k of [2, 2.5, 4, 7.25]) {
  RT.setWorldScale(k)
  const bad = LENGTHS.filter((n) => {
    const base = n === 'BAND_W' ? C.R_DISK / C.REGION_BANDS : C[n]
    return Math.abs(RT[n] - base * k) > 1e-9 * Math.max(1, Math.abs(base * k))
  })
  ok(`k=${k} 全部长度量线性放大`, bad.length === 0, bad.length ? `偏差: ${bad.join(',')}` : '')
  /* 网格仍覆盖整个盘面：BAND_W × REGION_BANDS === R_DISK（这是 geo.cellOf 正确的前提） */
  ok(`k=${k} BAND_W × REGION_BANDS === R_DISK`,
    Math.abs(RT.BAND_W * C.REGION_BANDS - RT.R_DISK) < 1e-9,
    `${RT.BAND_W * C.REGION_BANDS} vs ${RT.R_DISK}`)
}

console.log('\n── C. 非法输入回落，且不留 NaN ──')
for (const bad of [NaN, 0, -3, undefined, null, 'abc']) {
  const r = RT.setWorldScale(bad)
  const finite = LENGTHS.every((n) => Number.isFinite(RT[n]) && RT[n] > 0)
  ok(`setWorldScale(${String(bad)}) → 1 且全有限`, r === 1 && finite, `返回 ${r}`)
}

console.log('\n── D. 无量纲量不随尺度变 ──')
const REGION_BANDS_BEFORE = C.REGION_BANDS
RT.setWorldScale(4)
ok('REGION_BANDS 不受影响', C.REGION_BANDS === REGION_BANDS_BEFORE, `=${C.REGION_BANDS}`)
ok('MAG_CUTS 不受影响', C.MAG_CUTS.length === 6)
ok('STAR_R 不受影响（屏幕 px，不该被缩放）', C.STAR_R[0] === 5.2)

RT.setWorldScale(1)
console.log(`\n结果：${pass} 通过 / ${fail} 失败`)
process.exit(fail ? 1 : 0)
