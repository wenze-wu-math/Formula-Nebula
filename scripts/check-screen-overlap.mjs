/**
 * 屏幕空间重叠检测 —— 直接回答"看上去挤不挤"。
 *
 * 前面的"最近邻比"用的是半对角线，对矩形来说过于保守；
 * 这里把每个公式的四边形投影到屏幕，算真实的矩形交叠面积：
 *   · 覆盖率 = 至少被一个公式盖住的像素 / 视口像素
 *   · 重叠率 = Σ各公式面积之和 / 并集面积   (1.0 = 完全不重叠)
 *   · 每个公式被压住的面积占比（被别的公式盖了多少）
 * 用法: node scripts/check-screen-overlap.mjs
 */
import { spawn } from 'node:child_process'
import { resolve } from 'node:path'
import { tmpdir } from 'node:os'
import { setTimeout as sleep } from 'node:timers/promises'
import { requireChrome } from './_chrome.mjs'

const CHROME = requireChrome()
const URL = process.env.URL || 'http://localhost:5176/'
const PORT = 9232
const profile = resolve(tmpdir(), 'nebula-screen' + '-' + process.pid)

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
// 冻结，保证测量的是一次确定的画面
await evaluate(`(()=>{window.__nebula.scene.controls.autoRotate=false;window.__nebula.scene.stop();return 1})()`)
await sleep(300)

const rep = await evaluate(`(()=>{
  const s = window.__nebula.scene, cam = s.camera, grp = s.nodeGroup;
  const W = s.renderer.domElement.clientWidth, H = s.renderer.domElement.clientHeight;
  const nodes = window.__nebula.graph.nodes.filter(n=>n.sprite);

  // 把每个公式的矩形四角投到屏幕像素坐标
  const rects = [];
  for (const n of nodes) {
    const m = n.sprite;
    const p = m.geometry.parameters;
    const hw = p.width/2, hh = p.height/2;
    const wq = new (m.quaternion.constructor)();
    grp.getWorldQuaternion(wq); wq.multiply(m.quaternion);
    const c = m.position.clone().applyMatrix4(grp.matrixWorld);
    const right = new c.constructor(1,0,0).applyQuaternion(wq).multiplyScalar(hw);
    const up    = new c.constructor(0,1,0).applyQuaternion(wq).multiplyScalar(hh);
    const pts = [];
    for (const [sx,sy] of [[-1,-1],[1,-1],[1,1],[-1,1]]) {
      const v = c.clone().addScaledVector(right, sx).addScaledVector(up, sy);
      v.project(cam);
      pts.push([(v.x*0.5+0.5)*W, (-v.y*0.5+0.5)*H]);
    }
    const xs = pts.map(q=>q[0]), ys = pts.map(q=>q[1]);
    rects.push({ id:n.id, name:n.name, x0:Math.min(...xs), x1:Math.max(...xs), y0:Math.min(...ys), y1:Math.max(...ys) });
  }

  // 栅格化成格子（精度 2px，够用且快）
  const CELL = 2;
  const gw = Math.ceil(W/CELL), gh = Math.ceil(H/CELL);
  const cover = new Int32Array(gw*gh);      // 每格被几个矩形覆盖
  const sumArea = rects.reduce((s,r)=>s+Math.max(0,r.x1-r.x0)*Math.max(0,r.y1-r.y0),0);

  for (const r of rects) {
    const gx0 = Math.max(0, Math.floor(r.x0/CELL)), gx1 = Math.min(gw-1, Math.ceil(r.x1/CELL)-1);
    const gy0 = Math.max(0, Math.floor(r.y0/CELL)), gy1 = Math.min(gh-1, Math.ceil(r.y1/CELL)-1);
    for (let gy=gy0; gy<=gy1; gy++) for (let gx=gx0; gx<=gx1; gx++) cover[gy*gw+gx]++;
  }

  let coveredCells = 0, overlapCells = 0;
  for (let i=0;i<cover.length;i++) { if (cover[i]>0) coveredCells++; if (cover[i]>1) overlapCells++; }

  const cellArea = CELL*CELL;
  const unionArea = coveredCells*cellArea;
  const overlapArea = overlapCells*cellArea;

  // 每个公式的包围盒面积、以及"有多少比例落在被覆盖≥2 的格子里"
  const perNode = rects.map((r,i)=>{
    const gx0 = Math.max(0, Math.floor(r.x0/CELL)), gx1 = Math.min(gw-1, Math.ceil(r.x1/CELL)-1);
    const gy0 = Math.max(0, Math.floor(r.y0/CELL)), gy1 = Math.min(gh-1, Math.ceil(r.y1/CELL)-1);
    let tot=0, ov=0;
    for (let gy=gy0; gy<=gy1; gy++) for (let gx=gx0; gx<=gx1; gx++) {
      tot++; if (cover[gy*gw+gx] > 1) ov++;
    }
    return { name:r.name, area:+((r.x1-r.x0)*(r.y1-r.y0)).toFixed(0), ovFrac: tot? +(ov/tot).toFixed(3):0 };
  }).sort((a,b)=>b.ovFrac-a.ovFrac);

  const ovs = perNode.map(p=>p.ovFrac).sort((a,b)=>a-b);
  return {
    视口: W+'×'+H,
    公式数: rects.length,
    覆盖率: +(unionArea/(W*H)).toFixed(3),
    重叠率: +(overlapArea/unionArea).toFixed(3),
    被压占比: {
      中位: +ovs[Math.floor(ovs.length*0.5)].toFixed(3),
      p75: +ovs[Math.floor(ovs.length*0.75)].toFixed(3),
      p90: +ovs[Math.floor(ovs.length*0.90)].toFixed(3),
      最大: +ovs[ovs.length-1].toFixed(3),
    },
    最挤的8个: perNode.slice(0,8),
  };
})()`)

console.log('=== 屏幕空间重叠 ===')
console.log(`  视口 ${rep.视口} · 公式 ${rep.公式数}`)
console.log(`  屏幕覆盖率（公式盖住视口的比例）: ${(rep.覆盖率*100).toFixed(1)}%`)
console.log(`  重叠率（Σ面积/并集面积，1.0=完全不重叠）: ${rep.重叠率}`)
console.log(`  单个公式被别的公式压住的比例：中位 ${rep.被压占比.中位}  p75 ${rep.被压占比.p75}  p90 ${rep.被压占比.p90}  最大 ${rep.被压占比.最大}`)
console.log('  最挤的 8 个:')
for (const p of rep.最挤的8个) console.log(`    ${(p.ovFrac*100).toFixed(0).padStart(3)}% 被压   ${p.name}`)

ws.close(); cp.kill(); await sleep(200)
process.exit(0)
