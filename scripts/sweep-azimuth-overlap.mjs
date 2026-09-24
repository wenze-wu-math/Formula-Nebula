/**
 * 沿整圈方位角测量屏幕重叠 —— 这是"自转时会不会糊成一团"的诚实检验。
 *
 * ── 为什么必须在多个方位角测 ──
 * 公式是 billboard（永远正面朝向相机），所以它在屏幕上是**水平长条**。
 * 而盘面是水平的：相机方位角一转，盘面里某个方向就被映射到屏幕水平方向。
 * 于是"盘面上离得够不够开"和"屏幕上会不会压字"之间的关系**随自转变化**。
 * 只在单一视角测重叠会得出过于乐观（或过于悲观）的结论。
 *
 * 本脚本让相机绕盘一圈（模拟星系自转），在每个方位角光栅化所有公式矩形，
 * 报告重叠率的最坏值 / 中位值。
 *
 * 用法: node scripts/sweep-azimuth-overlap.mjs
 */
import { spawn } from 'node:child_process'
import { resolve } from 'node:path'
import { tmpdir } from 'node:os'
import { setTimeout as sleep } from 'node:timers/promises'

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const URL = process.env.URL || 'http://localhost:5176/'
const PORT = 9239
const profile = resolve(tmpdir(), 'nebula-azim' + '-' + process.pid)

const cp = spawn(CHROME, [
  '--headless=new', '--no-sandbox', '--disable-gpu-sandbox',
  '--enable-unsafe-swiftshader', '--use-gl=angle', '--use-angle=swiftshader',
  '--window-size=1584,849',
  `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`,
  '--no-first-run', '--no-default-browser-check', URL,
], { stdio: ['ignore', 'pipe', 'pipe'] })
cp.stderr.on('data', () => {})

let target
for (let i = 0; i < 40 && !target; i++) {
  try {
    const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()
    target = list.find((t) => t.type === 'page' && t.webSocketDebuggerUrl)
  } catch {}
  if (!target) await sleep(500)
}
const ws = new WebSocket(target.webSocketDebuggerUrl)
await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej })
let msgId = 0
const pending = new Map()
ws.onmessage = (ev) => {
  const m = JSON.parse(ev.data)
  if (m.id && pending.has(m.id)) {
    const { resolve: rs, reject: rj } = pending.get(m.id); pending.delete(m.id)
    m.error ? rj(new Error(JSON.stringify(m.error))) : rs(m.result)
  }
}
const send = (method, params = {}) => new Promise((rs, rj) => {
  const id = ++msgId; pending.set(id, { resolve: rs, reject: rj })
  ws.send(JSON.stringify({ id, method, params }))
})
const evaluate = async (e) => {
  const r = await send('Runtime.evaluate', { expression: e, awaitPromise: true, returnByValue: true })
  if (r.exceptionDetails) throw new Error('异常: ' + JSON.stringify(r.exceptionDetails.exception?.description))
  return r.result.value
}
await send('Runtime.enable')
for (let i = 0; i < 60; i++) {
  try {
    const d = await evaluate(`(()=>{const e=document.getElementById('diag');return e?e.textContent:''})()`)
    if (d && JSON.parse(d).built > 0) break
  } catch {}
  await sleep(1000)
}
await evaluate(`(()=>{const s=window.__nebula.scene; if(s.controls) s.controls.autoRotate=false; if(s.stop) s.stop(); return 1})()`)
await sleep(300)

/** 在指定方位角下，把相机摆到"整盘入画"并光栅化统计重叠 */
const measure = (azDeg) => evaluate(`(()=>{
  const cam = window.__nebula.scene.camera;
  const grp = window.__nebula.scene.nodeGroup;
  const nodes = window.__nebula.graph.nodes.filter(n=>n.sprite);
  const W = window.innerWidth, H = window.innerHeight;

  const maxR = Math.max(...nodes.map(n=>Math.hypot(n.pos.x,n.pos.z)));
  // 与 scene.js 的 fitCamera 一致：从俯仰角与盘半径解析求距离
  const tilt = ${40}*Math.PI/180;
  const margin = 1.10;
  const dist = maxR*Math.sin(tilt)/Math.tan(cam.fov*Math.PI/360)*margin;
  const az = ${azDeg}*Math.PI/180;
  const horiz = dist*Math.cos(tilt);
  cam.position.set(horiz*Math.sin(az), dist*Math.sin(tilt), horiz*Math.cos(az));
  cam.lookAt(0,0,0);
  cam.updateMatrixWorld(true);
  // 星系整体不转，改由相机绕行 —— 等价于自转，且能固定住盘面
  grp.rotation.y = 0;
  grp.updateMatrixWorld(true);

  const rects = [];
  const tanV = Math.tan(cam.fov*Math.PI/360);
  for (const n of nodes){
    const m = n.sprite;
    m.updateMatrixWorld(true);
    const c = m.position.clone().applyMatrix4(grp.matrixWorld);
    const p = c.clone().project(cam);
    const sx = (p.x*0.5+0.5)*W, sy = (-p.y*0.5+0.5)*H;
    const d = c.distanceTo(cam.position);
    const pxPerWorld = H/(2*d*tanV);
    const g = m.geometry.parameters;
    const hw = g.width*pxPerWorld/2, hh = g.height*pxPerWorld/2;
    rects.push({x0:sx-hw, x1:sx+hw, y0:sy-hh, y1:sy+hh, name:n.name, imp:n.importance});
  }

  const CELL = 2;
  const gw = Math.ceil(W/CELL), gh = Math.ceil(H/CELL);
  const cover = new Int32Array(gw*gh);
  let sumArea = 0;
  for (const r of rects){
    const x0=Math.max(0,Math.floor(r.x0/CELL)), x1=Math.min(gw-1,Math.ceil(r.x1/CELL)-1);
    const y0=Math.max(0,Math.floor(r.y0/CELL)), y1=Math.min(gh-1,Math.ceil(r.y1/CELL)-1);
    sumArea += Math.max(0,r.x1-r.x0)*Math.max(0,r.y1-r.y0);
    r.gx0=x0; r.gx1=x1; r.gy0=y0; r.gy1=y1;
    for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++) cover[y*gw+x]++;
  }
  let covered=0, overlapCells=0, sumLayers=0;
  for(let i=0;i<cover.length;i++){
    if(cover[i]>0){covered++; sumLayers+=cover[i]}
    if(cover[i]>1) overlapCells++;
  }

  // 每个公式被压比例
  const per = rects.map(r=>{
    let tot=0, ov=0;
    for(let y=r.gy0;y<=r.gy1;y++)for(let x=r.gx0;x<=r.gx1;x++){tot++; if(cover[y*gw+x]>1) ov++}
    return tot? ov/tot : 0;
  }).sort((a,b)=>a-b);
  const corePer = rects.map((r,i)=>({imp:r.imp,v:per[i]})).sort((a,b)=>b.imp-a.imp).slice(0,Math.floor(rects.length*0.2));
  return {
    重叠率: +(overlapCells/covered).toFixed(3),
    平均层数: +(sumLayers/covered).toFixed(3),
    覆盖率: +(covered/(gw*gh)).toFixed(3),
    被压中位: +per[Math.floor(per.length*0.5)].toFixed(3),
    被压p90: +per[Math.floor(per.length*0.9)].toFixed(3),
    核心被压最大: +Math.max(...corePer.map(c=>c.v)).toFixed(3),
  };
})()`)

console.log('=== 沿整圈方位角的屏幕重叠（模拟自转一圈）===')
console.log('  方位角   重叠率   平均层数   覆盖率   被压中位   被压p90   核心被压最大')
const rows = []
for (let az = 0; az < 360; az += 20) {
  const r = await measure(az)
  rows.push({ az, ...r })
  console.log(`  ${String(az).padStart(4)}°   ${String(r.重叠率).padStart(6)}   ${String(r.平均层数).padStart(7)}   ${String(r.覆盖率).padStart(6)}   ${String(r.被压中位).padStart(6)}   ${String(r.被压p90).padStart(6)}     ${String(r.核心被压最大).padStart(6)}`)
}

const ov = rows.map((r) => r.重叠率)
const lay = rows.map((r) => r.平均层数)
const core = rows.map((r) => r.核心被压最大)
const avg = (a) => a.reduce((s, v) => s + v, 0) / a.length
console.log(`\n  重叠率   最坏 ${Math.max(...ov).toFixed(3)} / 平均 ${avg(ov).toFixed(3)}`)
console.log(`  平均层数 最坏 ${Math.max(...lay).toFixed(3)} / 平均 ${avg(lay).toFixed(3)}   （1.0 = 完全不重叠）`)
console.log(`  核心被压 最坏 ${Math.max(...core).toFixed(3)} / 平均 ${avg(core).toFixed(3)}`)

ws.close(); cp.kill(); await sleep(200)
process.exit(0)
