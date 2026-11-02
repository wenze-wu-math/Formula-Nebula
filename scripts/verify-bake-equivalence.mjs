/**
 * 流水线改动的**正确性**验证：结果必须与串行版逐个一致。
 *
 * bench-bake.mjs 只验了"烘出 464 个、0 失败"，
 * 但那不能排除"纹理内容变了"（比如某个公式的贴图错位、尺寸不对）。
 * 这里做**逐字段比照**：同一份构建跑 la=1 与 la=8，
 * 把每个公式的 aspect / emWidth / emHeight / canvasW / canvasH / contentW / contentH
 * 全部导出来对比，并要求完全相等。
 *
 * 纹理像素本身没法直接读回来（CanvasTexture 在 GPU 里），
 * 但上面这些字段都是由 (widthPx,heightPx,scale,padding) 决定的 ——
 * 它们一致就说明绘制路径的参数完全一致。再额外校验
 * canvas 的像素数也相同。
 */
import { spawn } from 'node:child_process'
import { resolve } from 'node:path'
import { tmpdir } from 'node:os'
import { setTimeout as sleep } from 'node:timers/promises'
import { requireChrome } from './_chrome.mjs'

const CHROME = requireChrome()
const BASE = process.env.URL || 'http://127.0.0.1:5176/'
/* 需要**两个** CDP 端口（要各起一个浏览器分别跑串行与流水线）。
 * 从 PORT 起算，用 PORT 与 PORT+1 —— 这样 run-all.mjs 只要给一个基准端口，
 * 也不会跟别的脚本撞车。直接写死 9401/9402 会在并行跑时踩到别人。 */
const PORT_BASE = Number(process.env.PORT || 9401)

async function grab(lookahead, port) {
  const profile = resolve(tmpdir(), `nb-v${lookahead}-${process.pid}`)
  const cp = spawn(CHROME, ['--headless=new', '--no-sandbox', '--disable-gpu-sandbox',
    '--enable-unsafe-swiftshader', '--use-gl=angle', '--use-angle=swiftshader',
    '--window-size=1600,1000', `--remote-debugging-port=${port}`,
    `--user-data-dir=${profile}`, '--no-first-run', '--no-default-browser-check',
    `${BASE}?lookahead=${lookahead}`], { stdio: ['ignore', 'pipe', 'pipe'] })
  cp.stderr.on('data', () => {})
  let t
  for (let i = 0; i < 600 && !t; i++) {
    try { const l = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json(); t = l.find(x => x.type === 'page' && x.webSocketDebuggerUrl) } catch {}
    if (!t) await sleep(500)
  }
  const ws = new WebSocket(t.webSocketDebuggerUrl)
  await new Promise((r, j) => { ws.onopen = r; ws.onerror = j })
  let id = 0; const pend = new Map()
  ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) { const p = pend.get(m.id); pend.delete(m.id); m.error ? p.j(new Error(JSON.stringify(m.error))) : p.r(m.result) } }
  const send = (method, params = {}) => new Promise((r, j) => { const i = ++id; pend.set(i, { r, j }); ws.send(JSON.stringify({ id: i, method, params })) })
  const ev = async (expression) => {
    const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description)
    return r.result.value
  }
  await send('Runtime.enable')
  for (let i = 0; i < 900; i++) {
    const d = await ev(`(()=>{const e=document.getElementById('diag');return e?e.textContent:''})()`).catch(() => '')
    if (d) { try { if (JSON.parse(d).built > 0) break } catch {} }
    await sleep(1000)
  }
  // 导出每个节点的烘焙几何参数 + Map 的键顺序
  const out = await ev(`(()=>{
    const n = window.__nebula, b = n.baked;
    const keys = [...b.keys()];
    const rows = keys.map(k => {
      const v = b.get(k);
      if (!v) return { id: k, null: true };
      return { id: k, aspect: v.aspect, emW: v.emWidth, emH: v.emHeight,
               cw: v.canvasW, ch: v.canvasH, iw: v.contentW, ih: v.contentH };
    });
    return { keys, rows, errors: b.errors || [] };
  })()`)
  ws.close(); cp.kill(); await sleep(400)
  return out
}

console.log('对照：lookahead=1（串行） vs lookahead=8（流水线）—— 逐字段比对\n')
const a = await grab(1, PORT_BASE)
console.log(`  串行  : ${a.rows.length} 个，errors=${a.errors.length}`)
const b = await grab(8, PORT_BASE + 1)
console.log(`  流水线: ${b.rows.length} 个，errors=${b.errors.length}`)

console.log('\n=== 键顺序（Map 迭代顺序，下游布局依赖它）===')
const sameOrder = JSON.stringify(a.keys) === JSON.stringify(b.keys)
console.log(`  ${sameOrder ? '✓ 完全一致' : '✗ 不一致!'}`)
if (!sameOrder) {
  for (let i = 0; i < Math.max(a.keys.length, b.keys.length); i++) {
    if (a.keys[i] !== b.keys[i]) { console.log(`    首个不同在下标 ${i}: ${a.keys[i]} vs ${b.keys[i]}`); break }
  }
}

console.log('\n=== 逐字段比对 ===')
let diff = 0, checked = 0
const FIELDS = ['aspect', 'emW', 'emH', 'cw', 'ch', 'iw', 'ih']
for (let i = 0; i < a.rows.length; i++) {
  const x = a.rows[i], y = b.rows[i]
  if (!y || x.id !== y.id) { console.log(`  ✗ 第 ${i} 行 id 不匹配`); diff++; continue }
  if (x.null !== y.null) { console.log(`  ✗ ${x.id}: null 状态不同`); diff++; continue }
  if (x.null) continue
  for (const f of FIELDS) {
    checked++
    if (x[f] !== y[f]) {
      if (diff < 8) console.log(`  ✗ ${x.id}.${f}: ${x[f]} vs ${y[f]}`)
      diff++
    }
  }
}
console.log(`  比了 ${checked} 个字段值，不同 ${diff} 个`)
console.log('')
if (diff === 0 && sameOrder && a.errors.length === 0 && b.errors.length === 0) {
  console.log('✓ 流水线与串行版的烘焙结果逐字段完全一致 —— 优化只改速度，不改结果')
} else {
  console.log('✗ 有差异 —— 流水线改变了烘焙结果，不能接受')
  process.exitCode = 1
}
