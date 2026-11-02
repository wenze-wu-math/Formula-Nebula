/**
 * tools/world/compare-distribution.mjs — 生成首都分布对比截图，叠加理论槽位。
 *
 * 用法：node designs/map/tools/world/compare-distribution.mjs
 *
 * 输出：
 *   shots/map-capitals-fixed.png — 当前世界在总览级别的截图，所有首都可见
 *   控制台输出理论槽位与实际首都的距离测量
 */
import { spawn } from 'node:child_process'
import { setTimeout as sleep } from 'node:timers/promises'
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, dirname, resolve } from 'node:path'
import { pathToFileURL, fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, '../../../..')

// Import project modules
const { requireChrome } = await import(pathToFileURL(resolve(root, 'scripts/_chrome.mjs')).href)
const { withBrowserLock } = await import(pathToFileURL(resolve(root, 'designs/_browser-lock.mjs')).href)
const { getGraph } = await import(pathToFileURL(resolve(root, 'designs/shared/kb.js')).href)
const { buildWorld } = await import(pathToFileURL(resolve(root, 'designs/map/src/world/index.js')).href)
const C = await import(pathToFileURL(resolve(root, 'designs/map/src/constants.js')).href)

const graph = getGraph()
const world = buildWorld(graph, { raster: false })

// Get capitals
const capitals = world.places.filter(p => p.kind === 'city' && p.tier === 0)

console.log('=== 首都分布分析 ===\n')
console.log(`找到 ${capitals.length} 个首都：`)
capitals.forEach(cap => {
  const country = world.countryById.get(cap.family)
  console.log(`  ${country.zh} (${cap.family}): ${cap.node.name} 位于 (${cap.x.toFixed(1)}, ${cap.y.toFixed(1)})`)
})

// Get theoretical positions from FAMILY_SLOTS
console.log('\n理论槽位 (FAMILY_SLOTS):')
const slots = C.FAMILY_SLOTS
const slotPositions = {}
for (const [fid, slot] of Object.entries(slots)) {
  console.log(`  ${fid}: 槽位 (${slot.q}, ${slot.r})`)
  slotPositions[fid] = slot
}

// Calculate distances
console.log('\n距离测量：')
const measurements = []
for (const cap of capitals) {
  const country = world.countryById.get(cap.family)
  const slot = slotPositions[cap.family]
  if (slot && country.center) {
    const dx = cap.x - country.center.x
    const dy = cap.y - country.center.y
    const dist = Math.hypot(dx, dy)
    measurements.push({
      name: country.zh,
      id: cap.family,
      dist,
      capPos: { x: cap.x, y: cap.y },
      centerPos: { x: country.center.x, y: country.center.y }
    })
    console.log(`  ${country.zh}: 首都距国家中心 ${dist.toFixed(1)} wu`)
  }
}

const url = 'http://localhost:5190/designs/map/'
const out = resolve(root, 'shots/map-capitals-fixed.png')
const port = 9601
const w = 1600
const h = 1000

console.log(`\n准备截图：${url}`)
console.log(`输出：${out}`)

const exitCode = await withBrowserLock('compare-distribution', async () => {
  const profile = mkdtempSync(join(tmpdir(), 'map-capitals-'))
  const chrome = spawn(requireChrome(), [
    '--headless=new', '--no-sandbox', '--enable-unsafe-swiftshader', '--use-gl=angle', '--use-angle=swiftshader',
    '--no-first-run', '--no-default-browser-check', '--disable-extensions', '--mute-audio', '--hide-scrollbars',
    `--window-size=${w},${h}`, `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, 'about:blank',
  ], { stdio: 'ignore' })

  let code = 0
  try {
    let target = null
    for (let i = 0; i < 200 && !target; i++) {
      try {
        const list = await fetch(`http://127.0.0.1:${port}/json/list`).then(r => r.json())
        target = list.find(t => t.type === 'page' && t.webSocketDebuggerUrl)
      } catch { /* retry */ }
      if (!target) await sleep(150)
    }
    if (!target) throw new Error('CDP connect failed')

    const ws = new WebSocket(target.webSocketDebuggerUrl)
    await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej })

    let id = 0
    const pending = new Map()
    ws.onmessage = (ev) => {
      const m = JSON.parse(ev.data)
      if (m.id && pending.has(m.id)) {
        const p = pending.get(m.id)
        pending.delete(m.id)
        m.error ? p.rej(new Error(JSON.stringify(m.error))) : p.res(m.result)
      }
    }

    const send = (method, params = {}) => new Promise((res, rej) => {
      const i = ++id
      pending.set(i, { res, rej })
      ws.send(JSON.stringify({ id: i, method, params }))
    })

    const evaluate = async (expr) => {
      const r = await send('Runtime.evaluate', {
        expression: `(async () => { ${expr} })()`,
        awaitPromise: true,
        returnByValue: true
      })
      if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text)
      return r.result.value
    }

    await send('Runtime.enable')
    await send('Page.enable')
    await send('Emulation.setDeviceMetricsOverride', {
      width: w,
      height: h,
      deviceScaleFactor: 1,
      mobile: false
    })

    await send('Page.navigate', { url })

    // Wait for design ready
    const t0 = Date.now()
    let ok = false
    while (Date.now() - t0 < 90000) {
      try {
        if (await evaluate('return !!(window.__design && window.__design.ready)')) {
          ok = true
          break
        }
      } catch { /* retry */ }
      await sleep(400)
    }

    if (!ok) {
      console.log('[timeout] Page never became ready')
      code = 3
    } else {
      console.log('页面已就绪')

      // Ensure we're at home/overview level
      await evaluate('window.__design.setView({ s: 0.8 }, { animate: false })')
      await sleep(1200)

      // Inject debug overlay
      const debugCode = `
        const canvas = document.getElementById('map');
        const ctx = canvas.getContext('2d');
        const world = window.__design.world;
        const state = window.__design.state;
        const view = state.view;
        const size = state.size;
        const z = view.z;
        const dpr = size.dpr;

        // Save state
        ctx.save();

        // World transform
        ctx.setTransform(dpr * z, 0, 0, dpr * z,
          dpr * (size.w / 2 - view.x * z),
          dpr * (size.h / 2 - view.y * z));

        // Draw theoretical FAMILY_SLOTS positions
        const slots = ${JSON.stringify(slotPositions)};

        for (const [fid, slot] of Object.entries(slots)) {
          const country = world.countryById.get(fid);
          if (!country) continue;

          const cx = country.center.x;
          const cy = country.center.y;

          // Draw theoretical position marker (cross)
          ctx.strokeStyle = '#ff0000';
          ctx.lineWidth = 2 / z;
          ctx.globalAlpha = 0.8;
          ctx.beginPath();
          ctx.moveTo(cx - 20, cy);
          ctx.lineTo(cx + 20, cy);
          ctx.moveTo(cx, cy - 20);
          ctx.lineTo(cx, cy + 20);
          ctx.stroke();

          // Draw circle around theoretical position
          ctx.strokeStyle = '#ff0000';
          ctx.lineWidth = 1.5 / z;
          ctx.setLineDash([8 / z, 4 / z]);
          ctx.beginPath();
          ctx.arc(cx, cy, 30, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);

          // Draw line from capital to center
          const capital = world.places.find(p => p.kind === 'city' && p.tier === 0 && p.family === fid);
          if (capital) {
            ctx.strokeStyle = '#0000ff';
            ctx.lineWidth = 1.5 / z;
            ctx.globalAlpha = 0.5;
            ctx.setLineDash([6 / z, 3 / z]);
            ctx.beginPath();
            ctx.moveTo(capital.x, capital.y);
            ctx.lineTo(cx, cy);
            ctx.stroke();
            ctx.setLineDash([]);

            // Calculate and show distance
            const dist = Math.hypot(capital.x - cx, capital.y - cy);

            // Switch to screen coordinates for text
            ctx.restore();
            ctx.save();
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

            const midX = (capital.x + cx) / 2;
            const midY = (capital.y + cy) / 2;
            const sx = (midX - view.x) * z + size.w / 2;
            const sy = (midY - view.y) * z + size.h / 2;

            ctx.font = 'bold 14px sans-serif';
            ctx.fillStyle = '#ffffff';
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 3;
            ctx.globalAlpha = 1;
            const text = dist.toFixed(0) + ' wu';
            ctx.strokeText(text, sx, sy);
            ctx.fillText(text, sx, sy);

            // Restore for next iteration
            ctx.restore();
            ctx.save();
            ctx.setTransform(dpr * z, 0, 0, dpr * z,
              dpr * (size.w / 2 - view.x * z),
              dpr * (size.h / 2 - view.y * z));
          }
        }

        ctx.restore();
        return true;
      `

      await evaluate(debugCode)
      await sleep(800)

      // Take screenshot
      const r = await send('Page.captureScreenshot', { format: 'png' })
      mkdirSync(dirname(out), { recursive: true })
      writeFileSync(out, Buffer.from(r.data, 'base64'))
      console.log(`已保存截图：${out}`)
    }

    ws.close()
  } catch (e) {
    console.log('[error]', e.message)
    code = 1
  } finally {
    chrome.kill()
    await sleep(300)
    try {
      rmSync(profile, { recursive: true, force: true })
    } catch { /* locked */ }
  }

  return code
})

console.log('\n=== 总结 ===')
console.log(`平均距离国家中心：${(measurements.reduce((s, m) => s + m.dist, 0) / measurements.length).toFixed(1)} wu`)
console.log(`最大距离：${Math.max(...measurements.map(m => m.dist)).toFixed(1)} wu`)
console.log(`最小距离：${Math.min(...measurements.map(m => m.dist)).toFixed(1)} wu`)

process.exit(exitCode)
