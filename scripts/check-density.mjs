/**
 * 拥挤度检查：257 个公式挤在原来 95 个的位置上，需要确认没有严重重叠。
 * 指标：
 *   ① 每对相邻公式的"中心距 / 两者平均半宽" —— <1 表示平面投影重叠
 *   ② 盘面填充率 —— 公式面积之和 / 盘面积
 * 用法: node scripts/check-density.mjs
 */
import { spawn } from 'node:child_process'
import { resolve } from 'node:path'
import { tmpdir } from 'node:os'
import { setTimeout as sleep } from 'node:timers/promises'
import { requireChrome } from './_chrome.mjs'

const CHROME = requireChrome()
const URL = process.env.URL || 'http://localhost:5176/'
const PORT = 9229
const profile = resolve(tmpdir(), 'nebula-density' + '-' + process.pid)

const cp = spawn(CHROME, [
  '--headless=new', '--no-sandbox', '--disable-gpu-sandbox',
  '--enable-unsafe-swiftshader', '--use-gl=angle', '--use-angle=swiftshader',
  '--window-size=1600,1000',
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
const send = (method, params = {}) => {
  const id = ++msgId
  return new Promise((rs, rj) => { pending.set(id, { resolve: rs, reject: rj }); ws.send(JSON.stringify({ id, method, params })) })
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
await sleep(300)

const rep = await evaluate(`(()=>{
  const nodes = window.__nebula.graph.nodes.filter(n=>n.sprite);
  const g = (m)=>m.geometry.parameters;
  // ⚠ 必须用 n.pos —— 那是松弛**之后**的最终位置。
  // n.planeX/planeZ 是松弛**之前**的初值，relaxInPlane 只写 n.pos，
  // 从不会把结果回写到 planeX/planeZ。早先这里读了 planeX/planeZ，
  // 于是量到的是未松弛的布局，重叠率被严重高估。
  const px = (n)=>n.pos.x, pz = (n)=>n.pos.z;
  const half = nodes.map(n=>{
    const p=g(n.sprite);
    return Math.sqrt((p.width/2)**2 + (p.height/2)**2);
  });
  const maxR = Math.max(...nodes.map(n=>Math.hypot(px(n), pz(n))));

  // 最近邻比：中心距 / 两者平均半宽
  const ratios = [];
  const overlaps = [];
  for (let i=0;i<nodes.length;i++){
    let best = Infinity, bi = -1;
    for (let j=0;j<nodes.length;j++){
      if (i===j) continue;
      const d = Math.hypot(px(nodes[i])-px(nodes[j]), pz(nodes[i])-pz(nodes[j]));
      if (d < best) { best = d; bi = j; }
    }
    const avgHalf = (half[i]+half[bi])/2;
    ratios.push(best/avgHalf);
    if (best < avgHalf*0.85) overlaps.push({a:nodes[i].name, b:nodes[bi].name, d:+best.toFixed(2), need:+avgHalf.toFixed(2)});
  }
  ratios.sort((a,b)=>a-b);

  // 盘面填充率：Σ(宽×高) / πR²
  const areaSum = nodes.reduce((s,n)=>{const p=g(n.sprite); return s + p.width*p.height;},0);
  const diskArea = Math.PI*maxR*maxR;

  return {
    节点数: nodes.length,
    盘半径: +maxR.toFixed(1),
    最近邻比: {
      最小: +ratios[0].toFixed(3),
      p05: +ratios[Math.floor(ratios.length * 0.05)].toFixed(3),
      p25: +ratios[Math.floor(ratios.length * 0.25)].toFixed(3),
      中位: +ratios[Math.floor(ratios.length * 0.5)].toFixed(3),
    },
    重叠对数: overlaps.length,
    重叠样例: overlaps.slice(0, 8),
    填充率: +(areaSum / diskArea).toFixed(3),
  };
})()`)

console.log('=== 拥挤度检查 ===')
console.log(`  节点数 ${rep.节点数} · 盘半径 ${rep.盘半径}`)
console.log(`  最近邻比（中心距/平均半宽，<1 即投影重叠）`)
console.log(`    最小 ${rep.最近邻比.最小}   p05 ${rep.最近邻比.p05}   p25 ${rep.最近邻比.p25}   中位 ${rep.最近邻比.中位}`)
console.log(`  明显重叠对数 (比 < 0.85): ${rep.重叠对数}  (${(rep.重叠对数/rep.节点数*100).toFixed(1)}%)`)
console.log(`  盘面填充率 (Σ公式面积/盘面积): ${rep.填充率}`)
if (rep.重叠样例.length) {
  console.log('  重叠样例:')
  for (const o of rep.重叠样例) console.log(`    ${o.a} ↔ ${o.b}   距离 ${o.d} < 需要 ${o.need}`)
}

ws.close(); cp.kill(); await sleep(200)
process.exit(0)
