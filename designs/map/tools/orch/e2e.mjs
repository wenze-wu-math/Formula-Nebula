/**
 * tools/orch/e2e.mjs — 编排模块的端到端验收（headless Chrome + CDP，无第三方依赖）。
 *
 * 运行：cd "/d/xiangmu/Formula Nebula" && node designs/map/tools/orch/e2e.mjs [--base http://localhost:5190] [--port 9651] [--quick]
 * 截图：shots/designs/map/orch-*.png
 *
 * 覆盖：首屏 ready 时间、深链 #v1&n=cn-hodge、select→Esc 链、search('层') 多命中取景、
 *       setView 各级 overlappingLabels、真实鼠标点击/拖拽/滚轮/键盘、history.back、488 个 id 逐个 select、measureFps。
 */
import { spawn } from 'node:child_process'
import { setTimeout as sleep } from 'node:timers/promises'
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { requireChrome } from '../../../../scripts/_chrome.mjs'

const argv = process.argv.slice(2)
const arg = (k, d) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : d }
const BASE = arg('--base', 'http://localhost:5190')
const PORT = Number(arg('--port', 9651))
const QUICK = argv.includes('--quick')
const URL0 = `${BASE}/designs/map/`
const OUT = 'shots/designs/map'
const W = 1600, H = 1000
mkdirSync(OUT, { recursive: true })

let fails = 0
const results = []
const ok = (cond, msg, extra) => {
  results.push({ ok: !!cond, msg })
  if (!cond) { fails++; console.log('✗', msg, extra !== undefined ? JSON.stringify(extra) : '') } else console.log('✓', msg, extra !== undefined ? JSON.stringify(extra) : '')
}

const profile = mkdtempSync(join(tmpdir(), 'map-e2e-'))
const chrome = spawn(requireChrome(), [
  '--headless=new', '--no-sandbox', '--enable-unsafe-swiftshader', '--use-gl=angle', '--use-angle=swiftshader',
  '--no-first-run', '--no-default-browser-check', '--disable-extensions', '--mute-audio', '--hide-scrollbars',
  `--window-size=${W},${H}`, `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, 'about:blank',
], { stdio: 'ignore' })

const exceptions = []
let reloads = 0
let ws, send, evaluate
async function connect() {
  let target = null
  for (let i = 0; i < 200 && !target; i++) {
    try {
      const list = await fetch(`http://127.0.0.1:${PORT}/json/list`).then((r) => r.json())
      target = list.find((t) => t.type === 'page' && t.webSocketDebuggerUrl)
    } catch { /* retry */ }
    if (!target) await sleep(150)
  }
  if (!target) throw new Error('CDP connect failed')
  ws = new WebSocket(target.webSocketDebuggerUrl)
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej })
  let id = 0
  const pending = new Map()
  ws.onmessage = (ev) => {
    const m = JSON.parse(ev.data)
    if (m.id && pending.has(m.id)) {
      const p = pending.get(m.id); pending.delete(m.id)
      m.error ? p.rej(new Error(JSON.stringify(m.error))) : p.res(m.result)
    } else if (m.method === 'Runtime.exceptionThrown') {
      const d = m.params.exceptionDetails
      const t = d.exception?.description || d.text
      exceptions.push(t)
      console.log('[page exception]', t.split('\n').slice(0, 4).join(' | '))
    } else if (m.method === 'Runtime.consoleAPICalled' && (m.params.type === 'error')) {
      console.log('[console.error]', m.params.args.map((a) => a.value ?? a.description ?? '').join(' ').slice(0, 300))
    }
  }
  send = (method, params = {}) => new Promise((res, rej) => {
    const i = ++id; pending.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method, params }))
  })
  evaluate = async (expr, retry = 2) => {
    const r = await send('Runtime.evaluate', { expression: `(async () => { ${expr} })()`, awaitPromise: true, returnByValue: true })
    if (r.exceptionDetails) {
      const msg = r.exceptionDetails.exception?.description || r.exceptionDetails.text
      // 别的建造者改文件 → Vite 整页重载 → __design 暂时不存在：等重新 ready 后重试（状态会丢，记一次）
      if (retry > 0 && /__design is not defined|Cannot read properties of undefined|Execution context was destroyed|Inspected target navigated/.test(msg)) {
        reloads++
        console.log('  [页面被重载，等待 ready 后重试]')
        for (let i = 0; i < 300; i++) { await sleep(100); try { const q = await send('Runtime.evaluate', { expression: '!!(window.__design && window.__design.ready)', returnByValue: true }); if (q.result && q.result.value) break } catch { /* */ } }
        return evaluate(expr, retry - 1)
      }
      throw new Error(msg)
    }
    return r.result.value
  }
  await send('Runtime.enable'); await send('Page.enable')
  // 并行开发时别的建造者随时改文件 → Vite HMR 整页重载会打断测试。给 vite-hmr 的 WebSocket 换成一个永不连上的桩：
  // Vite 客户端的 connect() 永远等待，于是不会收到更新、也不会 reload（模块照常经 HTTP 加载）。只影响本测试页。
  await send('Page.addScriptToEvaluateOnNewDocument', { source: `(() => { const WS = window.WebSocket; window.WebSocket = function (url, proto) {
    if (proto === 'vite-hmr') { const t = new EventTarget(); t.readyState = 0; t.OPEN = 1; t.send = () => {}; t.close = () => {}; return t }
    return new WS(url, proto) }; window.WebSocket.prototype = WS.prototype; Object.assign(window.WebSocket, { OPEN: 1, CLOSED: 3, CONNECTING: 0, CLOSING: 2 }) })()` })
  await send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 1, mobile: false })
}

async function open(url) {
  await send('Page.navigate', { url: 'about:blank' })
  await sleep(200)
  const t0 = Date.now()
  await send('Page.navigate', { url })
  while (Date.now() - t0 < 60000) {
    try { if (await evaluate('return !!(window.__design && window.__design.ready)')) break } catch { /* 页面还在加载 */ }
    await sleep(50)
  }
  return Date.now() - t0
}
async function shot(name) {
  const r = await send('Page.captureScreenshot', { format: 'png' })
  writeFileSync(join(OUT, name), Buffer.from(r.data, 'base64'))
  console.log('  saved', join(OUT, name))
}
const mouse = (type, x, y, extra = {}) => send('Input.dispatchMouseEvent', { type, x, y, button: 'left', clickCount: 1, ...extra })
const key = async (k, code = k, kc = 0) => {
  await send('Input.dispatchKeyEvent', { type: 'keyDown', key: k, code, windowsVirtualKeyCode: kc })
  await send('Input.dispatchKeyEvent', { type: 'keyUp', key: k, code, windowsVirtualKeyCode: kc })
}
const frame = () => evaluate('await __design.frame(); await __design.frame(); return 1')
const waitIdle = () => evaluate(`for (let i = 0; i < 200 && __design.view().animating; i++) await __design.frame(); await __design.frame(); return __design.view()`)

try {
  await connect()

  /* 1) 首屏 */
  const tReady = await open(URL0)
  const st0 = await evaluate('return __design.stats()')
  ok(tReady < 3000, `首屏 ready ${tReady} ms（含导航；页面内 bootMs=${st0.bootMs}）< 3000`)
  ok(st0.overlappingLabels === 0, `首屏 overlappingLabels=${st0.overlappingLabels}（独立复核 ${st0.overlappingLabelsCheck}）`)
  ok((await evaluate('return location.hash')) === '', '干净 URL 打开后未被改写 hash')
  await shot('orch-home.png')

  /* 2) 深链 */
  await open(URL0 + '#v1&n=cn-hodge')
  await waitIdle()
  const dl = await evaluate(`const v = __design.view(); const p = __design.screenOf('cn-hodge');
    const i = v.inset; const cx = (i.left + v.w - i.right) / 2, cy = (i.top + v.h - i.bottom) / 2;
    return { v, p, dx: p[0] - cx, dy: p[1] - cy, hash: location.hash, st: __design.stats() }`)
  ok(dl.v.selected === 'cn-hodge', '深链 #v1&n=cn-hodge 打开即选中', dl.v.selected)
  ok(Math.abs(dl.dx) < 2 && Math.abs(dl.dy) < 2, `深链相机对准可见区中心（偏差 ${dl.dx.toFixed(1)}, ${dl.dy.toFixed(1)}；s=${dl.v.s.toFixed(2)}；inset.right=${dl.v.inset.right}）`)
  ok(dl.v.s >= 1.8 - 1e-6 && dl.v.s <= 5 + 1e-6, `深链 s=${dl.v.s.toFixed(2)} ∈ SELECT_FOCUS_S`)
  ok(dl.st.overlappingLabels === 0, `深链选中状态 overlappingLabels=${dl.st.overlappingLabels}（复核 ${dl.st.overlappingLabelsCheck}）`)
  await shot('orch-deeplink-hodge.png')

  // 带 c 的深链 + 畸形深链
  await open(URL0 + '#v1&n=cn-hodge&c=100,-50,3.00')
  const dc = await evaluate('return __design.view()')
  ok(dc.selected === 'cn-hodge' && Math.abs(dc.x - 100) < 1 && Math.abs(dc.y + 50) < 1 && Math.abs(dc.s - 3) < 0.01, `#v1&n&c 相机按 c 恢复`, { x: dc.x, y: dc.y, s: dc.s })
  for (const bad of ['#v2&n=x', '#v1&c=a,b', '#%E0%A4%A', '#v1&n=%E0%A4%A&c=1,2', '#v1&n=no-such']) {
    const n0 = exceptions.length
    const t = await open(URL0 + bad)
    const v = await evaluate('return __design.view()')
    ok(exceptions.length === n0 && t < 60000 && v.selected === null, `畸形深链 ${bad} 正常启动、无异常`)
  }

  /* 3) select → Esc 链 */
  await open(URL0)
  await evaluate(`__design.search('层'); return 1`)
  await waitIdle()
  const se = await evaluate(`const v = __design.view(); const s = __design.state.search;
    const pts = s.ids.map(id => __design.screenOf(id)); const inside = pts.filter(p => p[0] >= 0 && p[0] <= v.w && p[1] >= 0 && p[1] <= v.h).length;
    return { n: s.ids.length, s: v.s, inside, st: __design.stats() }`)
  ok(se.n > 1 && se.s <= 3.2 + 1e-6, `search('层') 命中 ${se.n}，取景 s=${se.s.toFixed(2)} ≤ 3.2`)
  ok(se.inside === se.n, `search('层') 全部命中在视口内（${se.inside}/${se.n}）`)
  ok(se.st.overlappingLabels === 0, `搜索状态 overlappingLabels=${se.st.overlappingLabels}（复核 ${se.st.overlappingLabelsCheck}）`)
  await shot('orch-search.png')
  const one = await evaluate(`const q = __design.graph.nodes.map(n => n.name).find(nm => __design.suggest(nm, 3).length === 1); const ids = __design.search(q); await __design.frame(); return { q, ids, sel: __design.view().selected }`)
  ok(one.ids.length === 1 && one.sel === one.ids[0], `search 单命中直接选中（'${one.q}' → ${one.ids.join(',')}）`)
  // 现在：有搜索 + 有选中 → Esc×3 依次 deselect / clearSearch / home（占位 UI 的 closeTransient 返回 false）
  await waitIdle()
  await key('Escape', 'Escape', 27); await frame()
  const e1 = await evaluate('return { sel: __design.view().selected, q: __design.state.search.query }')
  await key('Escape', 'Escape', 27); await frame()
  const e2 = await evaluate('return { sel: __design.view().selected, q: __design.state.search.query }')
  await evaluate('await __design.setView({ s: 4, x: 200, y: 100 }); return 1')
  await key('Escape', 'Escape', 27); await waitIdle()
  const e3 = await evaluate('return __design.view()')
  ok(e1.sel === null && e1.q !== '', 'Esc #1 取消选中、搜索保留', e1)
  ok(e2.sel === null && e2.q === '', 'Esc #2 清除搜索', e2)
  ok(Math.abs(e3.s - 1) < 0.02, `Esc #3 回全图（s=${e3.s.toFixed(3)}）`)

  /* 4) 真实指针：点击选中、拖拽、滚轮、键盘、history.back */
  await evaluate(`await __design.setView({ s: 2.2, x: 0, y: 0 }); return 1`)
  const target = await evaluate(`const pl = __design.world.places.filter(p => p.kind === 'city').sort((a, b) => a.tier - b.tier);
    const v = __design.view();
    for (const p of pl) { const s = __design.screenOf(p.id); if (s[0] > 450 && s[0] < v.w - 450 && s[1] > 200 && s[1] < v.h - 200 && __design.pick(s[0], s[1]) === p.id) return { id: p.id, s } }
    return null`)
  if (target) {
    await mouse('mouseMoved', target.s[0], target.s[1]); await frame()
    const hv = await evaluate('return __design.state.hover.id')
    ok(hv === target.id, `悬停判定 ${target.id}`, hv)
    await mouse('mousePressed', target.s[0], target.s[1]); await mouse('mouseReleased', target.s[0], target.s[1])
    await waitIdle()
    const cs = await evaluate('return { sel: __design.view().selected, hash: location.hash }')
    ok(cs.sel === target.id, `鼠标点击选中 ${target.id}`, cs.sel)
    ok(cs.hash.includes('n=' + encodeURIComponent(target.id)), `选中写 hash：${cs.hash}`)
    await shot('orch-click-select.png')
    // 第二次选中另一个，再 history.back 回到第一个
    const other = await evaluate(`const n = __design.state.selection.neighbours; return [...n].find(id => __design.placeOf(id) && __design.placeOf(id).kind === 'city') || null`)
    if (other) {
      await evaluate(`await __design.select(${JSON.stringify(other)}); return 1`)
      await waitIdle()
      await evaluate('history.back(); return 1'); await sleep(400); await waitIdle()
      const bk = await evaluate('return __design.view().selected')
      ok(bk === target.id, `history.back 恢复上一个选中（${other} → ${bk}）`)
      await evaluate('history.forward(); return 1'); await sleep(400); await waitIdle()
      ok((await evaluate('return __design.view().selected')) === other, 'history.forward 再恢复')
    }
  } else ok(false, '找不到可点击的城市（pick 不一致？）')
  // 点空白海面 → 取消选中
  await evaluate(`await __design.setView({ s: 1 }); return 1`)
  const sea = await evaluate(`for (let y = 30; y < 200; y += 10) for (let x = 900; x < 1500; x += 10) if (!__design.pick(x, y)) return [x, y]; return null`)
  if (sea) {
    await mouse('mousePressed', sea[0], sea[1]); await mouse('mouseReleased', sea[0], sea[1]); await frame()
    ok((await evaluate('return __design.view().selected')) === null, `点海面取消选中 @${sea}`)
  }
  // 拖拽
  const vd0 = await evaluate('return __design.view()')
  await mouse('mousePressed', 800, 500)
  for (let i = 1; i <= 10; i++) await mouse('mouseMoved', 800 - i * 20, 500 - i * 10, { buttons: 1 })
  await sleep(120)
  await mouse('mouseReleased', 600, 400); await waitIdle()
  const vd1 = await evaluate('return __design.view()')
  const dxpx = (vd1.x - vd0.x) * vd0.z
  ok(dxpx > 190 && (await evaluate('return __design.view().selected')) === null, `拖拽平移 ${dxpx.toFixed(0)}px 且未触发点击`)
  // 滚轮：以指针为锚
  const anchorW = await evaluate(`const v = __design.view(); return [(1200 - v.w/2)/v.z + v.x, (300 - v.h/2)/v.z + v.y]`)
  await send('Input.dispatchMouseEvent', { type: 'mouseWheel', x: 1200, y: 300, deltaX: 0, deltaY: -300 }); await frame()
  const wv = await evaluate(`const v = __design.view(); return { s: v.s, ax: (1200 - v.w/2)/v.z + v.x, ay: (300 - v.h/2)/v.z + v.y }`)
  ok(wv.s > vd1.s * 1.3 && Math.hypot(wv.ax - anchorW[0], wv.ay - anchorW[1]) < 0.5, `滚轮放大 s ${vd1.s.toFixed(2)}→${wv.s.toFixed(2)}，锚点不动`)
  // 键盘 + / - / 方向键 / 0
  const k0 = await evaluate('return __design.view()')
  await key('+', 'Equal', 187); await waitIdle()
  const k1 = await evaluate('return __design.view()')
  ok(Math.abs(k1.s / k0.s - 1.6) < 0.02 || k1.s >= 15.99, `+ 键放大 1.6 倍（${(k1.s / k0.s).toFixed(3)}）`)
  await key('ArrowRight', 'ArrowRight', 39); await waitIdle()
  const k2 = await evaluate('return __design.view()')
  ok(Math.abs((k2.x - k1.x) * k1.z - 80) < 1, `→ 键平移 80px（${((k2.x - k1.x) * k1.z).toFixed(1)}）`)
  await key('0', 'Digit0', 48); await waitIdle()
  ok(Math.abs((await evaluate('return __design.view().s')) - 1) < 0.02, '0 键回全图')
  // 双击放大
  const dp = (await evaluate(`for (let y = 60; y < 300; y += 10) for (let x = 200; x < 700; x += 10) if (!__design.pick(x, y)) return [x, y]; return [300, 120]`))
  await mouse('mousePressed', dp[0], dp[1], { clickCount: 1 }); await mouse('mouseReleased', dp[0], dp[1], { clickCount: 1 })
  await mouse('mousePressed', dp[0], dp[1], { clickCount: 2 }); await mouse('mouseReleased', dp[0], dp[1], { clickCount: 2 })
  await waitIdle()
  const dbl = await evaluate('return __design.view()')
  ok(Math.abs(dbl.s - 2) < 0.05, `双击以点为锚放大 2 倍（s=${dbl.s.toFixed(2)}）`)
  // 相机 hash 防抖写入
  await sleep(500)
  const ch = await evaluate('return location.hash')
  ok(/^#v1&c=-?\d+,-?\d+,\d+\.\d\d$/.test(ch), `相机变化防抖 replaceState：${ch}`)

  /* 5) 各级 overlappingLabels */
  const lv = []
  for (const s of [1, 2.2, 4.5, 9]) {
    for (const [x, y] of [[0, 0], [-300, -150], [300, 200]]) {
      const r = await evaluate(`await __design.setView({ s: ${s}, x: ${x}, y: ${y} }); await __design.frame(); return __design.stats()`)
      lv.push({ s, x, y, o: r.overlappingLabels, chk: r.overlappingLabelsCheck, n: r.visibleLabels, f: r.formulaLabels, level: r.level, placeMs: r.placeMs, drawMs: r.drawMs })
    }
    await evaluate(`await __design.setView({ s: ${s}, x: 0, y: 0 }); return 1`)
    await shot(`orch-s${String(s).replace('.', '_')}.png`)
  }
  ok(lv.every((r) => r.o === 0), `setView s=1/2.2/4.5/9 × 3 处 overlappingLabels 全 0`, lv.map((r) => `${r.s}@${r.x},${r.y}:L${r.level} o=${r.o} chk=${r.chk} n=${r.n} f=${r.f} place=${r.placeMs} draw=${r.drawMs}`))
  // 选中状态下各级
  const ls = []
  for (const s of [1, 2.2, 4.5, 9]) {
    const r = await evaluate(`await __design.select('cn-hodge', { fly: false }); await __design.setView({ s: ${s}, x: __design.placeOf('cn-hodge').x, y: __design.placeOf('cn-hodge').y }); await __design.frame(); return __design.stats()`)
    ls.push(`${s}:o=${r.overlappingLabels}/chk=${r.overlappingLabelsCheck}`)
    if (r.overlappingLabels !== 0) fails++
  }
  console.log(ls.every((x) => x.includes('o=0/')) ? '✓' : '✗', '选中 cn-hodge 各级 overlappingLabels', ls.join(' '))
  await evaluate('__design.deselect(); return 1')

  /* 6) 488 个 id 逐个 select({fly:false}) */
  const n0 = exceptions.length
  const all = await evaluate(`const ids = __design.graph.nodes.map(n => n.id); const errs = []; let maxOv = 0, bad = []; const t0 = performance.now();
    await __design.setView({ s: 2.2, x: 0, y: 0 });
    for (const id of ids) {
      try { await __design.select(id, { fly: false }); if (__design.view().selected !== id) errs.push(id);
        ${QUICK ? '' : `const o = __design.stats().overlappingLabels; if (o) { maxOv = Math.max(maxOv, o); bad.push(id) }`}
      } catch (e) { errs.push(id + ':' + e.message) }
    }
    return { n: ids.length, errs, maxOv, bad: bad.slice(0, 8), nBad: bad.length, ms: Math.round(performance.now() - t0) }`)
  ok(all.n === 488 && all.errs.length === 0 && exceptions.length === n0, `488 个 id 逐个 select({fly:false}) 无异常（${all.ms} ms）`, all.errs.slice(0, 5))
  if (!QUICK) ok(all.nBad === 0, `488 个选中状态（s=2.2 原位）overlappingLabels 全 0（坏 ${all.nBad}，最大 ${all.maxOv}）`, all.bad)
  // 488 个 id 逐个 select（带取景，瞬时）：选中点都在可见区中心
  const cen = await evaluate(`const ids = __design.graph.nodes.map(n => n.id); let off = [];
    for (const id of ids) { await __design.setView({ s: 1, x: 0, y: 0 });
      await __design.select(id, { instant: true, push: false });
      const v = __design.view(), p = __design.screenOf(id), i = v.inset;
      const dx = p[0] - (i.left + v.w - i.right) / 2, dy = p[1] - (i.top + v.h - i.bottom) / 2;
      if (Math.hypot(dx, dy) > 2 || v.s < 1.79 || v.s > 5.01) off.push(id + ' ' + dx.toFixed(0) + ',' + dy.toFixed(0) + ' s=' + v.s.toFixed(2)) }
    __design.deselect(); return off`)
  ok(cen.length === 0, `488 个 id 选中取景：都在可见区中心且 s ∈ [1.8, 5]（偏离 ${cen.length}）`, cen.slice(0, 6))

  /* 7) fps */
  await evaluate(`await __design.setView({ s: 2.2, x: 0, y: 0 }); return 1`)
  const fps = await evaluate('return await __design.measureFps(1500)')
  const pf = await evaluate('return __design.stats()')
  ok(fps >= 30, `L1 平移 measureFps = ${fps}（headless SwiftShader ≥ 30；frameMs=${pf.frameMs} place=${pf.placeMs} draw=${pf.drawMs}）`)
  await evaluate(`await __design.setView({ s: 1, x: 0, y: 0 }); return 1`)
  const fps0 = await evaluate('return await __design.measureFps(1200)')
  console.log(`  （参考）L0 measureFps = ${fps0}`)

  /* 8) 飞行 promise 与取消 */
  const fl = await evaluate(`const t0 = performance.now(); await __design.setView({ s: 6, x: 300, y: 200 }, { animate: true }); const v = __design.view();
    return { ms: Math.round(performance.now() - t0), x: v.x, y: v.y, s: v.s, anim: v.animating }`)
  ok(!fl.anim && Math.abs(fl.x - 300) < 0.5 && Math.abs(fl.s - 6) < 0.01 && fl.ms > 300, `setView animate 飞行结束后 resolve（${fl.ms} ms）`)
  const cancel = await evaluate(`const p = __design.home(); await new Promise(r => setTimeout(r, 120));
    __design.camera.cancel(); const t = performance.now(); await p; return { waited: Math.round(performance.now() - t), anim: __design.view().animating }`)
  ok(!cancel.anim && cancel.waited < 400, `取消飞行后 promise 照常 resolve（${cancel.waited} ms）`)

  ok(exceptions.length === 0, `全程页面异常 ${exceptions.length} 个`)
  if (reloads) console.log(`  ⚠ 期间页面被 Vite 重载 ${reloads} 次（并行开发），相关断言可能需重跑`)
} catch (e) {
  console.log('[e2e error]', e.stack || e.message); fails++
} finally {
  try { ws && ws.close() } catch { /* */ }
  chrome.kill()
  await sleep(300)
  try { rmSync(profile, { recursive: true, force: true }) } catch { /* locked */ }
}
console.log(fails ? `\n${fails} 项失败` : '\n全部通过')
process.exit(fails ? 1 : 0)
