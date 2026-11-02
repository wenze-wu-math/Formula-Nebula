/**
 * 扫掠相机俯仰角，找屏幕重叠最低的视角。
 *
 * 盘面是"一片"（扁平），相机俯仰角直接决定纵深方向被压缩多少：
 *   · 完全侧视（高度 0）→ 盘压成一条线，前后公式全部叠在一起
 *   · 完全俯视          → 没有立体感，但重叠最少
 * 折中点是观感与可读性的平衡，这里用实测数据挑。
 *
 * 用法: node scripts/sweep-camera-tilt.mjs
 */
import { spawn } from 'node:child_process'
import { resolve } from 'node:path'
import { tmpdir } from 'node:os'
import { setTimeout as sleep } from 'node:timers/promises'
import { requireChrome } from './_chrome.mjs'

const CHROME = requireChrome()
const URL = process.env.URL || 'http://localhost:5176/'
const PORT = 9236
const profile = resolve(tmpdir(), 'nebula-tilt' + '-' + process.pid)

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
// 关掉自转，保证每次测量视角一致
await evaluate(`(()=>{const s=window.__nebula.scene; if(s.controls) s.controls.autoRotate=false; if(s.stop) s.stop(); return 1})()`)
await sleep(400)

console.log('=== 相机俯仰角扫掠 ===')
console.log('  俯仰角   屏幕重叠率   覆盖率   被压中位   被压p90')
for (const deg of [8, 14, 20, 26, 32, 40, 50, 62, 75, 88]) {
  const rep = await evaluate(`(()=>{
    const cam = window.__nebula.scene.camera;
    const nodes = window.__nebula.graph.nodes.filter(n=>n.sprite);
    const grp = window.__nebula.scene.nodeGroup;
    const R = Math.max(...nodes.map(n=>Math.hypot(n.pos.x,n.pos.z)));
    // 保持距离使盘恰好framing：距离 ≈ R / tan(fov/2 × 宽高比修正)
    const vFov = cam.fov*Math.PI/180;
    const hFov = 2*Math.atan(Math.tan(vFov/2)*cam.aspect);
    const fov = Math.min(vFov,hFov);
    const dist = R*1.06 / Math.tan(fov/2);
    const rad = ${deg}*Math.PI/180;
    cam.position.set(0, dist*Math.sin(rad), dist*Math.cos(rad));
    cam.lookAt(0,0,0);
    cam.updateMatrixWorld(true);
    grp.updateMatrixWorld(true);

    const W = window.innerWidth, H = window.innerHeight;
    const quads = [];
    const v = new (window.__nebula.scene.camera.position.constructor)();
    for (const n of nodes){
      const m = n.sprite;
      m.updateMatrixWorld(true);
      const p = m.position.clone().applyMatrix4(grp.matrixWorld);
      p.project(cam);
      const sx = (p.x*0.5+0.5)*W, sy = (-p.y*0.5+0.5)*H;
      const g = m.geometry.parameters;
      const wHalf = (g.width/2)/dist * (H/2)/Math.tan(vFov/2);
      const hHalf = (g.height/2)/dist * (H/2)/Math.tan(vFov/2);
      quads.push({x:sx, y:sy, w:wHalf, h:hHalf, i:quads.length});
    }
    // 2px 网格光栅化
    const GW=Math.ceil(W/2), GH=Math.ceil(H/2);
    const cnt = new Int16Array(GW*GH);
    const tot = new Int16Array(GW*GH);
    for (const q of quads){
      const x0=Math.max(0,Math.floor((q.x-q.w)/2)), x1=Math.min(GW-1,Math.ceil((q.x+q.w)/2));
      const y0=Math.max(0,Math.floor((q.y-q.h)/2)), y1=Math.min(GH-1,Math.ceil((q.y+q.h)/2));
      const area=(x1-x0+1)*(y1-y0+1);
      q.cells=[];
      for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const k=y*GW+x;cnt[k]++;tot[k]++;q.cells.push(k)}
      q.area=area;
    }
    let covered=0, sum=0, union=0;
    for(let k=0;k<cnt.length;k++){ if(cnt[k]>0){covered++; union++; sum+=cnt[k];} }
    const perNode = quads.map(q=>{
      let c=0; for(const k of q.cells) if(cnt[k]>1) c++;
      return c/q.cells.length;
    }).sort((a,b)=>a-b);
    return {
      重叠率: +(sum/union).toFixed(3),
      覆盖率: +(covered/(GW*GH)*100).toFixed(1),
      中位: +perNode[Math.floor(perNode.length*0.5)].toFixed(3),
      p90: +perNode[Math.floor(perNode.length*0.9)].toFixed(3),
    };
  })()`)
  console.log(`  ${String(deg).padStart(4)}°     ${String(rep.重叠率).padStart(6)}     ${String(rep.覆盖率).padStart(5)}%    ${String(rep.中位).padStart(6)}    ${String(rep.p90).padStart(5)}`)
}

ws.close(); cp.kill(); await sleep(200)
process.exit(0)
