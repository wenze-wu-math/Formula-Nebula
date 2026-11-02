/**
 * designs/atlas/check-scale-browser.mjs — 浏览器端语义缩放护栏（需 vite + FN_ALLOW_BROWSER=1）。
 *
 * 为什么单独一份：`check-scale.mjs` 只到 Node 布局层。浏览器里还有
 * render/labels/input/camera 四个 runtime 消费方，它们若没跟上尺度，
 * 会出现"盘画在 A 处、星点在 B 处"的错位 —— 只有真在浏览器里量才能发现。
 *
 * 判据（与 2026-11-01 修好的语义缩放一致）：
 *   1. 缩小到 L ≤ -0.6 时公式数 = 0（不能"越缩越显示"）
 *   2. L = 0 → 0.6 → 1.2 严格递增
 *   3. 全档 overlappingLabels === 0
 *   4. 零页面异常
 *
 * 用法：FN_ALLOW_BROWSER=1 node designs/atlas/check-scale-browser.mjs
 */
import { openPage } from '../cdp.mjs'

const URL_ = process.env.ATLAS_URL || 'http://localhost:5190/designs/atlas/'
const page = await openPage({ url: URL_, wait: 'window.__design && window.__design.ready', port: 9742 })

let pass = 0, fail = 0
const ok = (name, cond, detail = '') => {
  if (cond) { pass++; console.log(`  PASS  ${name}${detail ? '  ' + detail : ''}`) }
  else { fail++; console.log(`  FAIL  ${name}${detail ? '  ' + detail : ''}`) }
}

try {
  console.log('\nL → 公式 / 中文名 / 星座名 / 可见 / 重叠')
  const rows = []
  for (const L of [-1.2, -0.6, 0, 0.6, 1.2, 1.8]) {
    const r = await page.eval(`
      await __design.setView({ L: ${L} })
      const s = __design.stats()
      return { f: s.formulas, n: s.names, c: s.constellations, v: s.visibleLabels, ov: s.overlappingLabels, L: __design.view().L }
    `)
    rows.push([L, r])
    console.log(`  ${String(L).padStart(5)}  ${String(r.f).padStart(4)}  ${String(r.n).padStart(3)}  ${String(r.c).padStart(2)}  ${String(r.v).padStart(4)}  ${r.ov}   gotL=${r.L?.toFixed?.(2)}`)
  }

  const f = rows.map(([, r]) => r.f)
  console.log('')
  ok('缩小到 L≤-0.6 时公式数为 0', f[0] === 0 && f[1] === 0, `(${f[0]}, ${f[1]})`)
  ok('L=0→0.6→1.2 严格递增', f[2] < f[3] && f[3] < f[4], `(${f[2]} → ${f[3]} → ${f[4]})`)
  ok('放大到底多于总览', f[5] > f[2], `(${f[5]} vs ${f[2]})`)
  ok('全档 overlappingLabels === 0', rows.every(([, r]) => r.ov === 0))
  ok('零页面异常', page.errors.length === 0, page.errors.length ? JSON.stringify(page.errors) : '')

  console.log(`\n结果：${pass} 通过 / ${fail} 失败`)
  process.exitCode = fail ? 1 : 0
} finally {
  await page.close()
}
