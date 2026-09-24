// 定量验证「越中心越重要 = 越大 + 越亮」三条映射是否真的成立
import { spawn } from 'node:child_process'
import { resolve } from 'node:path'
import { tmpdir } from 'node:os'
import { setTimeout as sleep } from 'node:timers/promises'

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const URL = process.env.URL || 'http://localhost:5176/'
const PORT = 9226
const profile = resolve(tmpdir(), 'nebula-cdp-p4' + '-' + process.pid)

const cp = spawn(CHROME, [
  '--headless=new', '--no-sandbox', '--disable-gpu-sandbox',
  '--enable-unsafe-swiftshader', '--use-gl=angle', '--use-angle=swiftshader',
  '--hide-scrollbars', '--window-size=1600,1000',
  `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`,
  '--no-first-run', '--no-default-browser-check', URL,
], { stdio: ['ignore', 'pipe', 'pipe'] })
cp.stderr.on('data', () => {})

async function getTarget() {
  for (let i = 0; i < 600; i++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()
      const p = list.find((t) => t.type === 'page' && t.webSocketDebuggerUrl)
      if (p) return p
    } catch {}
    await sleep(500)
  }
  throw new Error('CDP 未就绪')
}

const target = await getTarget()
const ws = new WebSocket(target.webSocketDebuggerUrl)
await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej })

let msgId = 0
const pending = new Map()
ws.onmessage = (ev) => {
  const m = JSON.parse(ev.data)
  if (m.id && pending.has(m.id)) {
    const { resolve: rs, reject: rj } = pending.get(m.id)
    pending.delete(m.id)
    m.error ? rj(new Error(JSON.stringify(m.error))) : rs(m.result)
  }
}
function send(method, params = {}) {
  const id = ++msgId
  return new Promise((rs, rj) => {
    pending.set(id, { resolve: rs, reject: rj })
    ws.send(JSON.stringify({ id, method, params }))
  })
}
async function evaluate(expression) {
  const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })
  if (r.exceptionDetails) throw new Error('异常: ' + JSON.stringify(r.exceptionDetails.exception?.description))
  return r.result.value
}

await send('Runtime.enable')
for (let i = 0; i < 600; i++) {
  try {
    const d = await evaluate(`(()=>{const e=document.getElementById('diag');return e?e.textContent:''})()`)
    if (d && JSON.parse(d).built > 0) break
  } catch {}
  await sleep(1000)
}
await evaluate(`(()=>{window.__nebula.scene.controls.autoRotate=false;window.__nebula.scene.stop();return 1})()`)
await sleep(400)

const data = await evaluate(`(()=>{
  const n = window.__nebula;
  /* 只取主星系节点。
   * ⚠ 星团的 「radius」 是**球心距**（另一个语义），而且 rank 是按星团
   *   自己的 importance 区间归一化的。两类节点混在一起做秩相关，
   *   等于把两个不同的映射叠在一张图上拟合 —— 系数会落在两者之间，
   *   什么也证明不了。星团的对应断言在 verify-cluster.mjs 里。 */
  return n.graph.nodes.filter(x=>x.sprite && !x.cluster).map(x=>({
    name:x.name, id:x.id, imp:+x.importance.toFixed(2),
    radius:+x.radius.toFixed(1),
    w:+x.width.toFixed(2), h:+x.height.toFixed(2),
    area:+(x.width*x.height).toFixed(2),
    aspect:+x.aspect.toFixed(2),
    target:+x.radiusTarget.toFixed(1),
    bright:+x.brightness.toFixed(3),
    color:[+x.baseColor.r.toFixed(3),+x.baseColor.g.toFixed(3),+x.baseColor.b.toFixed(3)],
  }));
})()`)

console.log(`共 ${data.length} 个公式\n`)

// 按重要度排序
data.sort((a, b) => b.imp - a.imp)

const row = (d) =>
  `${d.imp.toFixed(2)}   ${String(d.radius).padStart(6)} ${String(d.target).padStart(8)}  ` +
  `${String(d.w).padStart(5)}×${String(d.h).padEnd(5)} ${String(d.area).padStart(6)}  ` +
  `${String(d.aspect).padStart(5)}  ${d.bright.toFixed(3)}  ${d.name}`

console.log('=== 最核心的 8 个 ===')
console.log('重要度  半径   目标半径   宽×高        面积   宽高比  亮度    名称')
for (const d of data.slice(0, 8)) console.log(row(d))

console.log('\n=== 最边缘的 8 个 ===')
for (const d of data.slice(-8)) console.log(row(d))

// ── 单调性检验：重要度越高，半径应越小、亮度应越大 ──
function spearman(xs, ys) {
  const rank = (arr) => {
    const idx = arr.map((v, i) => [v, i]).sort((a, b) => a[0] - b[0])
    const r = new Array(arr.length)
    idx.forEach(([, i], k) => { r[i] = k })
    return r
  }
  const rx = rank(xs), ry = rank(ys)
  const n = xs.length
  const mx = rx.reduce((a, b) => a + b, 0) / n
  const my = ry.reduce((a, b) => a + b, 0) / n
  let num = 0, dx = 0, dy = 0
  for (let i = 0; i < n; i++) {
    num += (rx[i] - mx) * (ry[i] - my)
    dx += (rx[i] - mx) ** 2
    dy += (ry[i] - my) ** 2
  }
  return num / Math.sqrt(dx * dy)
}

const imp = data.map((d) => d.imp)
const rad = data.map((d) => d.radius)
const area = data.map((d) => d.area)
const bri = data.map((d) => d.bright)

console.log('\n=== 相关性检验 (Spearman 秩相关) ===')
console.log('  重要度 vs 半径   :', spearman(imp, rad).toFixed(4), '  (应为强负相关，越重要越靠中心)')
console.log('  重要度 vs 面积   :', spearman(imp, area).toFixed(4), '  (应为强正相关，越重要越大)')
console.log('  重要度 vs 亮度   :', spearman(imp, bri).toFixed(4), '  (应为强正相关，越重要越亮)')

// ── 极端值对比 ──
const core = data[0], outer = data[data.length - 1]
console.log('\n=== 极值对比 ===')
console.log(`  最核心「${core.name}」: 半径 ${core.radius} / 面积 ${core.area} / 亮度 ${core.bright}`)
console.log(`  最边缘「${outer.name}」: 半径 ${outer.radius} / 面积 ${outer.area} / 亮度 ${outer.bright}`)
console.log(`  → 半径比 ${(outer.radius / core.radius).toFixed(1)}×，面积比 ${(core.area / outer.area).toFixed(1)}×，亮度比 ${(core.bright / outer.bright).toFixed(2)}×`)

// ── 渲染统计 ──
const info = await evaluate(`(()=>{const r=window.__nebula.scene.renderer.info;
  return {calls:r.render.calls,tris:r.render.triangles,textures:r.memory.textures,geoms:r.memory.geometries};})()`)
console.log('\n=== 渲染统计 ===')
console.log(' ', JSON.stringify(info))

// ── 连线统计 ──
const linkInfo = await evaluate(`(()=>{
  const n=window.__nebula;
  const ws=n.graph.links.map(l=>l.weight);
  ws.sort((a,b)=>a-b);
  const hist={};
  for(const w of ws){const b=Math.floor(w*5)/5; hist[b.toFixed(1)]=(hist[b.toFixed(1)]||0)+1;}
  return {条数:ws.length, 平均权重:+(ws.reduce((a,b)=>a+b,0)/ws.length).toFixed(3),
          最小:ws[0], 最大:ws[ws.length-1], 权重分布:hist};
})()`)
console.log('\n=== 关联连线 ===')
console.log(' ', JSON.stringify(linkInfo, null, 2))

ws.close(); cp.kill(); await sleep(400); process.exit(0)
