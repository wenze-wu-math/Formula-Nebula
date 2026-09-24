/**
 * 量"可读竖带"—— 真正决定能不能看清公式的指标。
 *
 * ── 为什么"被压面积比例"会误导 ──
 * 公式是 11.5:1 的扁长条（例如屏幕上是 128×14 px）。
 * 如果另一条公式压住它下面 8px，被压**面积**比例 = 8/14 = 57%，
 * 看起来"一半以上被遮住了"；但实际上顶部还有 6px 完整可见，
 * 字形本身并没有被切碎（公式的笔画高度只有几 px）。
 * 所以按面积算会严重高估拥挤程度。
 *
 * 真正该问的是：**每个公式还有多少 px 的完整竖直空间**，
 * 也就是它的包围盒里"没有被任何其它公式覆盖"的连续行高。
 * 这个值 ≥ 字号高度就还能读。
 *
 * 用法: node scripts/check-readable-band.mjs
 */
import { spawn } from 'node:child_process'
import { resolve } from 'node:path'
import { tmpdir } from 'node:os'
import { setTimeout as sleep } from 'node:timers/promises'

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const URL = process.env.URL || 'http://localhost:5176/'
const PORT = 9240
const profile = resolve(tmpdir(), 'nebula-band' + '-' + process.pid)

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
await evaluate(`(()=>{const s=window.__nebula.scene; if(s.controls) s.controls.autoRotate=false; if(s.stop) s.stop(); return 1})()`)
await sleep(300)

const measure = (azDeg) => evaluate(`(()=>{
  const cam = window.__nebula.scene.camera;
  const grp = window.__nebula.scene.nodeGroup;
  const nodes = window.__nebula.graph.nodes.filter(n=>n.sprite);
  const W = window.innerWidth, H = window.innerHeight;
  const maxR = Math.max(...nodes.map(n=>Math.hypot(n.pos.x,n.pos.z)));
  const tilt = 40*Math.PI/180, margin = 1.10;
  const dist = maxR*Math.sin(tilt)/Math.tan(cam.fov*Math.PI/360)*margin;
  const az = ${azDeg}*Math.PI/180;
  const horiz = dist*Math.cos(tilt);
  cam.position.set(horiz*Math.sin(az), dist*Math.sin(tilt), horiz*Math.cos(az));
  cam.lookAt(0,0,0); cam.updateMatrixWorld(true);
  grp.rotation.y = 0; grp.updateMatrixWorld(true);

  const tanV = Math.tan(cam.fov*Math.PI/360);
  const quads = [];
  for (const n of nodes){
    const m = n.sprite; m.updateMatrixWorld(true);
    const c = m.position.clone().applyMatrix4(grp.matrixWorld);
    const p = c.clone().project(cam);
    const sx=(p.x*0.5+0.5)*W, sy=(-p.y*0.5+0.5)*H;
    const d = c.distanceTo(cam.position);
    const ppw = H/(2*d*tanV);
    const g = m.geometry.parameters;
    const hw=g.width*ppw/2, hh=g.height*ppw/2;
    quads.push({x0:sx-hw,x1:sx+hw,y0:sy-hh,y1:sy+hh, h:g.height*ppw, w:g.width*ppw,
                name:n.name, imp:n.importance, r:Math.hypot(n.pos.x,n.pos.z)});
  }

  // 每个 quad 用自己的像素行做"是否被别的 quad 覆盖"的判定（1px 精度）
  //
  // 两个指标一起看，因为单独看任何一个都会失真：
  //   · 可读竖带 = 完全没有任何遮挡的连续行数。
  //     它偏**严格**：某一行只要被别人压住**一个像素**就算这行不可用，
  //     所以"竖带 0"并不等于"完全看不见"（可能只被压了左边一角）。
  //   · 可见面积比 = 自己的像素里没被任何人覆盖的比例。
  //     它偏**宽松**：一条 11.5:1 的长条被压掉中间一段，
  //     两头还在，但整行是断的，读起来其实很难。
  //   两个一起看：竖带小 + 可见比高 = 被零星压住；
  //               竖带小 + 可见比也低 = 真的糊住了。
  let bandSum=0, bandN=0;
  const bands = [];
  // 先把所有 quad 光栅化到一张覆盖计数图上（2px 网格，够用且快）
  const CELL = 2;
  const gw = Math.ceil(W/CELL), gh = Math.ceil(H/CELL);
  const cover = new Int32Array(gw*gh);
  for (const a of quads){
    a.gx0=Math.max(0,Math.floor(a.x0/CELL)); a.gx1=Math.min(gw-1,Math.ceil(a.x1/CELL)-1);
    a.gy0=Math.max(0,Math.floor(a.y0/CELL)); a.gy1=Math.min(gh-1,Math.ceil(a.y1/CELL)-1);
    for(let y=a.gy0;y<=a.gy1;y++)for(let x=a.gx0;x<=a.gx1;x++) cover[y*gw+x]++;
  }
  for (const a of quads){
    // ① 可读竖带：逐像素行判"这行有没有被任何人碰到"
    const y0=Math.max(0,Math.floor(a.y0)), y1=Math.min(H-1,Math.ceil(a.y1));
    const hgt = Math.max(1, y1-y0+1);
    const rowBlocked = new Uint8Array(hgt);
    for (const b of quads){
      if (b===a) continue;
      if (b.x1 <= a.x0 || b.x0 >= a.x1) continue;
      const by0=Math.max(0,Math.floor(b.y0)), by1=Math.min(H-1,Math.ceil(b.y1));
      for(let y=Math.max(y0,by0); y<=Math.min(y1,by1); y++) rowBlocked[y-y0]=1;
    }
    let best=0, cur=0;
    for(let i=0;i<hgt;i++){ if(rowBlocked[i]===0){cur++; if(cur>best)best=cur} else cur=0 }

    // ② 可见面积比：在覆盖图上数"只被自己覆盖"的格子
    let tot=0, vis=0;
    for(let y=a.gy0;y<=a.gy1;y++)for(let x=a.gx0;x<=a.gx1;x++){ tot++; if(cover[y*gw+x]<=1) vis++ }

    bands.push({name:a.name, imp:a.imp, r:+a.r.toFixed(1), h:+a.h.toFixed(1),
                band:best, frac:+(best/hgt).toFixed(2),
                vis: tot? +(vis/tot).toFixed(3) : 1});
  }
  bands.sort((x,y)=>y.imp-x.imp);
  const core = bands.slice(0, Math.floor(bands.length*0.2));
  const all = bands.map(b=>b.band).sort((a,b)=>a-b);
  const allVis = bands.map(b=>b.vis).sort((a,b)=>a-b);
  const q=(p)=>all[Math.min(all.length-1,Math.floor(all.length*p))];
  const qv=(p)=>allVis[Math.min(allVis.length-1,Math.floor(allVis.length*p))];
  return {
    coreWorst: Math.min(...core.map(c=>c.band)),
    coreMed: +(core.reduce((s,c)=>s+c.band,0) / core.length).toFixed(1),
    core: core.slice(0,10),
    band: { 最小:all[0], p25:q(0.25), 中位:q(0.5), p75:q(0.75), 最大:all[all.length-1] },
    vis: { p25:qv(0.25), 中位:qv(0.5), p75:qv(0.75) },
    完全被遮: bands.filter(b=>b.band===0).length,
    几乎全遮: bands.filter(b=>b.vis<0.5).length,
  };
})()`)

console.log('=== 可读竖带宽度（未被遮挡的最长连续行数，px）===')
console.log('（这是"还能不能看清"的真实指标；比"被压面积比例"更贴近肉眼感受）\n')

const rows = []
for (const az of [0, 30, 60, 90, 120, 150]) {
  const r = await measure(az)
  rows.push({ az, ...r })
  console.log(`  方位角 ${String(az).padStart(3)}°  →  核心最小竖带 ${String(r.coreWorst).padStart(2)}px   全体: 最小 ${r.band.最小} / p25 ${r.band.p25} / 中位 ${r.band.中位} / p75 ${r.band.p75} / 最大 ${r.band.最大}   完全被遮 ${r.完全被遮} 个`)
  console.log(`              可见面积比: p25 ${r.vis.p25} / 中位 ${r.vis.中位} / p75 ${r.vis.p75}   可见比<50% 的有 ${r.几乎全遮} 个`)
}

const worstCore = Math.min(...rows.map((r) => r.coreWorst))
console.log(`\n  核心公式竖带（6 个方位角里最差）= ${worstCore}px`)
const last = rows[rows.length - 1]
console.log(`\n  最核心 10 个的详情（方位角 ${last.az}°）:`)
console.log('      重要度   屏幕高  可读竖带  占比   盘面半径  名称')
for (const c of last.core) {
  console.log(`      ${c.imp.toFixed(2)}   ${String(c.h).padStart(6)}  ${String(c.band).padStart(6)}   ${c.frac.toFixed(2)}   ${String(c.r).padStart(6)}   ${c.name}`)
}
console.log(`\n  参考：公式笔画本身约 5~9px；竖带 ≥ 该高度即笔画完整可见。`)

ws.close(); cp.kill(); await sleep(200)
process.exit(0)
