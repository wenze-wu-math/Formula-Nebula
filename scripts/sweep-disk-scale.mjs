/**
 * 在真实浏览器里扫「指数盘尺度 diskScale」，找屏幕可读性的最优点。
 *
 * ── 为什么要用浏览器而不是离线模型 ──
 * 离线模型只复刻了半径分配 + 松弛，没有复刻旋臂的角向分布、
 * billboard 朝向、以及渲染时的真实投影，所以它给出的绝对数值
 * 与浏览器有偏差（趋势对、数值偏乐观）。
 * 盘半径定下后，diskScale 决定半径分布的"疏密梯度"：
 * 它同时决定相邻重要度节点的**目标半径间距**，而那个间距就是
 * relaxInPlane 里半径带的宽度上限（带被夹在邻居中线之间）。
 * 梯度太陡 → 带太窄、推不开 → 重叠；太缓 → 核心层次不明显。
 *
 * 做法：依次改写 config.js 里的 radiusOuter → 构建 → 用
 * check-readable-band.mjs 的同一套度量在浏览器里量一次 → 恢复原值。
 *
 * 用法: node scripts/sweep-disk-radius.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { execFileSync, spawn } from 'node:child_process'
import { resolve } from 'node:path'
import { tmpdir } from 'node:os'
import { setTimeout as sleep } from 'node:timers/promises'

const CONFIG = resolve('src', 'config.js')
const original = readFileSync(CONFIG, 'utf8')
const m = original.match(/diskScale:\s*([\d.]+)/)
if (!m) throw new Error('找不到 diskScale')
const ORIG = Number(m[1])
console.log(`当前 diskScale = ${ORIG}（结束时恢复）\n`)

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const URL = process.env.URL || 'http://localhost:5176/'
const PORT = 9241

function setRadius(R) {
  const next = original.replace(/diskScale:\s*[\d.]+/, `diskScale: ${R}`)
  writeFileSync(CONFIG, next)
}
function restore() {
  writeFileSync(CONFIG, original)
}

async function build() {
  execFileSync('npx', ['vite', 'build'], { stdio: 'pipe', shell: true })
}

/** 启动无头 Chrome，量 6 个方位角下的可读竖带 */
async function measure() {
  const profile = resolve(tmpdir(), 'nebula-sweepR-' + Math.random().toString(36).slice(2))
  const cp = spawn(CHROME, [
    '--headless=new', '--no-sandbox', '--disable-gpu-sandbox',
    '--enable-unsafe-swiftshader', '--use-gl=angle', '--use-angle=swiftshader',
    '--window-size=1584,849',
    `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`,
    '--no-first-run', '--no-default-browser-check', URL,
  ], { stdio: ['ignore', 'pipe', 'pipe'] })
  cp.stderr.on('data', () => {})

  try {
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
      const msg = JSON.parse(ev.data)
      if (msg.id && pending.has(msg.id)) {
        const { resolve: rs, reject: rj } = pending.get(msg.id); pending.delete(msg.id)
        msg.error ? rj(new Error(JSON.stringify(msg.error))) : rs(msg.result)
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
    for (let i = 0; i < 70; i++) {
      try {
        const d = await evaluate(`(()=>{const e=document.getElementById('diag');return e?e.textContent:''})()`)
        if (d && JSON.parse(d).built > 0) break
      } catch {}
      await sleep(1000)
    }
    await evaluate(`(()=>{const s=window.__nebula.scene; if(s.controls) s.controls.autoRotate=false; if(s.stop) s.stop(); return 1})()`)
    await sleep(300)

    const one = (azDeg) => evaluate(`(()=>{
      const cam = window.__nebula.scene.camera;
      const grp = window.__nebula.scene.nodeGroup;
      const nodes = window.__nebula.graph.nodes.filter(n=>n.sprite);
      const W = window.innerWidth, H = window.innerHeight;
      const maxR = Math.max(...nodes.map(n=>Math.hypot(n.pos.x,n.pos.z)));
      const tilt = 40*Math.PI/180, margin = 1.10;
      const dist = maxR*Math.sin(tilt)/Math.tan(cam.fov*Math.PI/360)*margin;
      const az = ${azDeg}*Math.PI/180, horiz = dist*Math.cos(tilt);
      cam.position.set(horiz*Math.sin(az), dist*Math.sin(tilt), horiz*Math.cos(az));
      cam.lookAt(0,0,0); cam.updateMatrixWorld(true);
      grp.rotation.y = 0; grp.updateMatrixWorld(true);

      const tanV = Math.tan(cam.fov*Math.PI/360);
      const q = [];
      for (const n of nodes){
        const mm = n.sprite; mm.updateMatrixWorld(true);
        const c = mm.position.clone().applyMatrix4(grp.matrixWorld);
        const p = c.clone().project(cam);
        const sx=(p.x*0.5+0.5)*W, sy=(-p.y*0.5+0.5)*H;
        const d = c.distanceTo(cam.position);
        const ppw = H/(2*d*tanV);
        const g = mm.geometry.parameters;
        const hw=g.width*ppw/2, hh=g.height*ppw/2;
        q.push({x0:sx-hw,x1:sx+hw,y0:sy-hh,y1:sy+hh,W:g.width*ppw,H:g.height*ppw,imp:n.importance});
      }
      const bands=[];
      let buried=0;
      for (const a of q){
        const y0=Math.max(0,Math.floor(a.y0)), y1=Math.min(H-1,Math.ceil(a.y1));
        const hgt=Math.max(1,y1-y0+1);
        const blk=new Uint8Array(hgt);
        for (const b of q){
          if (b===a) continue;
          if (b.x1<=a.x0 || b.x0>=a.x1) continue;
          const by0=Math.max(y0,Math.floor(b.y0)), by1=Math.min(y1,Math.ceil(b.y1));
          for(let y=by0;y<=by1;y++) if(y-y0>=0 && y-y0<hgt) blk[y-y0]=1;
        }
        let best=0,cur=0;
        for(let i=0;i<hgt;i++){ if(!blk[i]){cur++; if(cur>best)best=cur} else cur=0 }
        bands.push({imp:a.imp,band:best,H:a.H});
        if(best===0)buried++;
      }
      const sb=bands.map(b=>b.band).sort((x,y)=>x-y);
      const core=bands.slice().sort((x,y)=>y.imp-x.imp).slice(0,Math.floor(bands.length*0.2));
      const allH=q.map(x=>x.H).sort((x,y)=>x-y);
      return { maxR, dist,
        bandMed: sb[Math.floor(sb.length/2)], bandP25: sb[Math.floor(sb.length*0.25)],
        buried, buriedPct: buried/bands.length,
        coreMed: core.reduce((s,c)=>s+c.band,0)/core.length,
        coreOk: core.filter(c=>c.band>=8).length, coreN: core.length,
        medH: allH[Math.floor(allH.length/2)] };
    })()`)

    const rs = []
    for (const az of [0, 30, 60, 90, 120, 150]) rs.push(await one(az))
    ws.close()
    return {
      maxR: rs[0].maxR, dist: rs[0].dist,
      bandMed: Math.min(...rs.map((r) => r.bandMed)),
      bandP25: Math.min(...rs.map((r) => r.bandP25)),
      buried: Math.max(...rs.map((r) => r.buried)),
      buriedPct: Math.max(...rs.map((r) => r.buriedPct)),
      coreMed: Math.min(...rs.map((r) => r.coreMed)),
      coreOk: Math.min(...rs.map((r) => r.coreOk)),
      coreN: rs[0].coreN,
      medH: Math.min(...rs.map((r) => r.medH)),
      n: 257,
    }
  } finally {
    cp.kill()
    await sleep(300)
  }
}

console.log('  diskScale  盘半径  相机距  中位px  中位带  p25带  完全被遮  核心均值带  核心达标')
const results = []
try {
  for (const R of [1.0, 1.4, 2.0, 2.8, 3.8]) {
    setRadius(R)
    await build()
    const r = await measure()
    results.push({ R, ...r })
    console.log(`  ${String(R).padStart(9)}  ${r.maxR.toFixed(0).padStart(5)}  ${r.dist.toFixed(0).padStart(6)}  ${r.medH.toFixed(1).padStart(6)}  ${String(r.bandMed).padStart(6)}  ${String(r.bandP25).padStart(5)}  ${String(r.buried).padStart(8)}   ${r.coreMed.toFixed(1).padStart(9)}  ${String(r.coreOk + '/' + r.coreN).padStart(8)}`)
  }
} finally {
  restore()
  await build()
  console.log('\n已恢复原配置并重新构建。')
}

console.log('\n综合评分（核心均值带 + 0.7×中位带 − 0.06×被遮数 + 0.15×中位px）：')
for (const r of results) r.score = r.coreMed + r.bandMed * 0.7 - r.buried * 0.06 + r.medH * 0.15
results.sort((a, b) => b.score - a.score)
for (const r of results)
  console.log(`  diskScale=${r.R} → 分 ${r.score.toFixed(2)} | 核心带 ${r.coreMed.toFixed(1)}px 达标 ${r.coreOk}/${r.coreN} | 中位带 ${r.bandMed}px | 被遮 ${r.buried} | 中位px ${r.medH.toFixed(1)} | 盘 ${r.maxR.toFixed(0)}`)
console.log(`\n推荐 diskScale = ${results[0].R}`)
