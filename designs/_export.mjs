/**
 * designs/_export.mjs — 用页面内 `canvas.toDataURL` 导出真实绘制内容。
 *
 * 为什么需要它：CDP 的 `Page.captureScreenshot` 在 headless + swiftshader 下
 * 会把画面**下半部重复渲染一遍**（实测 1600×1000 与 1600×900 都出现，
 * 交接文档把它误记成"方案 B 的渲染缺陷"）。
 *
 * 排查证据（2026-11-01）：
 *   · 页面 DOM 无重复 id，只有一个 `#app` 和一张主 canvas；
 *   · canvas 尺寸 1600×1000 正确，`scrollHeight === innerHeight`；
 *   · 用 `canvas.toDataURL()` 直接导出绘制内容 → **完全没有重复**。
 * 结论：伪影在截图管线，不在页面。这张导出图是权威证据。
 *
 * 用法：
 *   node designs/_export.mjs                      # 导出三个方案（默认清单）
 *   node designs/_export.mjs <id> <out.png> [等待ms]
 *
 * 注意：只导出 canvas 层，**不含 DOM 浮层**（搜索框、图例、面板）。
 * 需要连 UI 一起看时仍用 shot.mjs，并知道它可能有下半部重复伪影。
 */
import { openPage } from './cdp.mjs'
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname } from 'node:path'

const BASE = 'http://localhost:5190/designs'

const argv = process.argv.slice(2)
const jobs = argv.length >= 2
  ? [[argv[0], `${BASE}/${argv[0]}/`, argv[1], Number(argv[2]) || 3000]]
  : [
      ['map',        `${BASE}/map/`,        'shots/designs/map/final-overview.png',        2500],
      ['atlas',      `${BASE}/atlas/`,      'shots/designs/atlas/final-overview.png',      6500],
      ['manuscript', `${BASE}/manuscript/`, 'shots/designs/manuscript/final-overview.png', 3500],
    ]

for (const [name, url, out, wait] of jobs) {
  const p = await openPage({
    url, wait: 'window.__design && window.__design.ready', width: 1600, height: 1000,
  })
  try {
    await new Promise((r) => setTimeout(r, wait))
    /* 取第一个 canvas（主画布）；nebula-plus 是多 canvas 的 3D 场景，用 shot.mjs */
    const d = await p.eval(`return document.querySelector('canvas').toDataURL('image/png')`)
    mkdirSync(dirname(out), { recursive: true })
    writeFileSync(out, Buffer.from(d.split(',')[1], 'base64'))
    console.log('exported', name, '->', out, Math.round(d.length / 1024), 'KB')
  } catch (e) {
    console.log('FAIL', name, e.message)
  } finally {
    await p.close()
  }
}
console.log('done. 需要 FN_ALLOW_BROWSER=1 才能运行浏览器。')
process.exit(0)
