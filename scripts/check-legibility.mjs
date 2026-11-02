/**
 * 量公式在屏幕上的真实像素尺寸 —— 可读性的地面真值。
 *
 * 前面的离线模型都是估算；这里直接在跑起来的页面里量
 * 每个公式矩形投影到屏幕后占多少像素。
 *
 * 同时报告"整盘入画"所需距离与实际相机距离，判断取景是否合适。
 *
 * 用法: node scripts/check-legibility.mjs
 */
import { spawn } from 'node:child_process'
import { resolve } from 'node:path'
import { tmpdir } from 'node:os'
import { setTimeout as sleep } from 'node:timers/promises'
import { requireChrome } from './_chrome.mjs'

const CHROME = requireChrome()
const URL = process.env.URL || 'http://localhost:5176/'
const PORT = 9237
const profile = resolve(tmpdir(), 'nebula-legib' + '-' + process.pid)

const cp = spawn(CHROME, [
  '--headless=new', '--no-sandbox', '--disable-gpu-sandbox',
  '--enable-unsafe-swiftshader', '--use-gl=angle', '--use-angle=swiftshader',
  '--window-size=1584,849',
  `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`,
  '--no-first-run', '--no-default-browser-check', URL,
], { stdio: ['ignore', 'pipe', 'pipe'] })
cp.stderr.on('data', () => {})

let target
for (let i = 0; i < 600 && !target; i++) {
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
for (let i = 0; i < 600; i++) {
  try {
    const d = await evaluate(`(()=>{const e=document.getElementById('diag');return e?e.textContent:''})()`)
    if (d && JSON.parse(d).built > 0) break
  } catch {}
  await sleep(1000)
}
await evaluate(`(()=>{const s=window.__nebula.scene; if(s.controls) s.controls.autoRotate=false; return 1})()`)
await sleep(300)

const rep = await evaluate(`(()=>{
  const cam = window.__nebula.scene.camera;
  const grp = window.__nebula.scene.nodeGroup;
  const nodes = window.__nebula.graph.nodes.filter(n=>n.sprite);
  const W = window.innerWidth, H = window.innerHeight;
  cam.updateMatrixWorld(true); grp.updateMatrixWorld(true);

  const hs = [], infos = [];
  for (const n of nodes){
    const m = n.sprite;
    m.updateMatrixWorld(true);
    const c = m.position.clone().applyMatrix4(grp.matrixWorld);
    const g = m.geometry.parameters;
    // 世界尺寸 -> 屏幕像素：用相机到该点的距离做透视换算
    const d = c.distanceTo(cam.position);
    const pxPerWorld = H / (2 * d * Math.tan(cam.fov/2*Math.PI/180));
    const hp = g.height * pxPerWorld;
    const wp = g.width * pxPerWorld;
    hs.push(hp);
    infos.push({ id:n.id, name:n.name, h:+hp.toFixed(1), w:+wp.toFixed(1),
      r:+Math.hypot(n.pos.x,n.pos.z).toFixed(1), imp:n.importance });
  }
  hs.sort((a,b)=>a-b);
  const q = (p)=>hs[Math.min(hs.length-1, Math.floor(hs.length*p))];

  // 盘面在屏幕上的投影半径（算取景是否合适）
  const maxR = Math.max(...nodes.map(n=>Math.hypot(n.pos.x,n.pos.z)));
  const dist = cam.position.length();
  const tilt = Math.asin(cam.position.y/dist);

  // 按重要度排序 —— 核心公式是否看得清才是关键
  const byImp = [...infos].sort((a,b)=>b.imp-a.imp);

  return {
    视口: W+'×'+H,
    相机距离: +dist.toFixed(0),
    俯仰角: +(tilt*180/Math.PI).toFixed(1),
    盘半径: +maxR.toFixed(0),
    整盘入画距离: +((maxR*Math.sin(tilt)/Math.tan(cam.fov/2*Math.PI/180))*1.06).toFixed(0),
    屏幕高度px: { 最小:+hs[0].toFixed(1), p25:+q(0.25).toFixed(1), 中位:+q(0.5).toFixed(1), p75:+q(0.75).toFixed(1), 最大:+hs[hs.length-1].toFixed(1) },
    最核心10个: byImp.slice(0,10).map(i=>({ name:i.name, w:i.w, h:i.h, r:i.r, imp:+i.imp.toFixed(2) })),
    最边缘5个: byImp.slice(-5).map(i=>({ name:i.name, w:i.w, h:i.h, r:i.r, imp:+i.imp.toFixed(2) })),
  };
})()`)

console.log('=== 屏幕可读性（地面真值）===')
console.log(`  视口 ${rep.视口} · 相机距离 ${rep.相机距离} · 俯仰角 ${rep.俯仰角}°`)
console.log(`  盘半径 ${rep.盘半径} · 整盘入画需要距离 ${rep.整盘入画距离}  → ${Math.abs(rep.相机距离 - rep.整盘入画距离) < rep.整盘入画距离 * 0.15 ? '取景合适' : (rep.相机距离 > rep.整盘入画距离 ? '画面偏空（可以拉近）' : '盘超出画面')}`)
console.log(`\n  公式屏幕高度(px): 最小 ${rep.屏幕高度px.最小}  p25 ${rep.屏幕高度px.p25}  中位 ${rep.屏幕高度px.中位}  p75 ${rep.屏幕高度px.p75}  最大 ${rep.屏幕高度px.最大}`)

console.log(`\n  最核心的 10 个（重要度最高，必须看得清）:`)
console.log('      重要度   屏幕宽×高(px)   盘面半径   名称')
for (const i of rep.最核心10个) {
  const ok = Math.min(i.w, i.h) >= 14 ? '✓' : (Math.min(i.w, i.h) >= 9 ? '~' : '✗')
  console.log(`   ${ok}  ${i.imp.toFixed(2)}   ${String(i.w).padStart(6)}×${String(i.h).padStart(5)}   ${String(i.r).padStart(6)}   ${i.name}`)
}
console.log(`\n  最边缘的 5 个（重要度最低，小是符合预期的）:`)
for (const i of rep.最边缘5个) {
  console.log(`      ${i.imp.toFixed(2)}   ${String(i.w).padStart(6)}×${String(i.h).padStart(5)}   ${String(i.r).padStart(6)}   ${i.name}`)
}
console.log(`\n  ✓ = 最小边 ≥14px（可读）  ~ = 9~14px（勉强）  ✗ = <9px（看不清）`)

ws.close(); cp.kill(); await sleep(200)
process.exit(0)
