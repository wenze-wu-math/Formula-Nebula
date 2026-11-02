/**
 * 在真实浏览器里扫「公式大小倍率 baseSize」，看能不能换取更好的可读性。
 *
 * ── 为什么值得单独扫 ──
 * 屏幕字高由填充率唯一决定：
 *     px ∝ √填充率，   填充率 = Σ(宽×高) / (π·R²)
 * 而面积 = (baseSize × sizeScale)²，所以 baseSize 放大 k 倍 → 填充率 ×k²。
 * 这是个**二次**放大：稍微调大一点，拥挤度就涨得很快。
 *
 * 但拥挤度只决定"压不压字"，字大本身又直接提升"看清的程度"。
 * 二者方向相反，拐点只能用真值扫出来。
 *
 * 用法: node scripts/sweep-base-size.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { execFileSync, spawn } from 'node:child_process'
import { resolve } from 'node:path'
import { tmpdir } from 'node:os'
import { setTimeout as sleep } from 'node:timers/promises'
import { requireChrome } from './_chrome.mjs'

const CONFIG = resolve('src', 'config.js')
const original = readFileSync(CONFIG, 'utf8')
const m = original.match(/baseSize:\s*([\d.]+)/)
if (!m) throw new Error('找不到 baseSize')
console.log(`当前 baseSize = ${m[1]}（结束时恢复）\n`)

const CHROME = requireChrome()
const URL = process.env.URL || 'http://localhost:5176/'
const PORT = 9242

const build = () => execFileSync('npx', ['vite', 'build'], { stdio: 'pipe', shell: true })

async function measure() {
  const profile = resolve(tmpdir(), 'nebula-bs-' + Math.random().toString(36).slice(2))
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
    let id = 0
    const pend = new Map()
    ws.onmessage = (ev) => {
      const msg = JSON.parse(ev.data)
      if (msg.id && pend.has(msg.id)) {
        const { resolve: rs, reject: rj } = pend.get(msg.id); pend.delete(msg.id)
        msg.error ? rj(new Error(JSON.stringify(msg.error))) : rs(msg.result)
      }
    }
    const send = (method, params = {}) => new Promise((rs, rj) => {
      const i = ++id; pend.set(i, { resolve: rs, reject: rj })
      ws.send(JSON.stringify({ id: i, method, params }))
    })
    const ev = async (e) => {
      const r = await send('Runtime.evaluate', { expression: e, awaitPromise: true, returnByValue: true })
      if (r.exceptionDetails) throw new Error('异常: ' + JSON.stringify(r.exceptionDetails.exception?.description))
      return r.result.value
    }
    await send('Runtime.enable')
    for (let i = 0; i < 70; i++) {
      try {
        const d = await ev(`(()=>{const e=document.getElementById('diag');return e?e.textContent:''})()`)
        if (d && JSON.parse(d).built > 0) break
      } catch {}
      await sleep(1000)
    }
    await ev(`(()=>{const s=window.__nebula.scene; if(s.controls) s.controls.autoRotate=false; if(s.stop) s.stop(); return 1})()`)
    await sleep(300)

    const one = (azDeg) => ev(`(()=>{
      const cam = window.__nebula.scene.camera, grp = window.__nebula.scene.nodeGroup;
      const nodes = window.__nebula.graph.nodes.filter(n=>n.sprite);
      const W = window.innerWidth, H = window.innerHeight;
      const maxR = Math.max(...nodes.map(n=>Math.hypot(n.pos.x,n.pos.z)));
      const tilt = 40*Math.PI/180, margin = 1.10;
      const dist = maxR*Math.sin(tilt)/Math.tan(cam.fov*Math.PI/360)*margin;
      const az = ${azDeg}*Math.PI/180, horiz = dist*Math.cos(tilt);
      cam.position.set(horiz*Math.sin(az), dist*Math.sin(tilt), horiz*Math.cos(az));
      cam.lookAt(0,0,0); cam.updateMatrixWorld(true);
      grp.rotation.y=0; grp.updateMatrixWorld(true);
      const tanV = Math.tan(cam.fov*Math.PI/360);
      const q=[];
      for (const n of nodes){
        const mm=n.sprite; mm.updateMatrixWorld(true);
        const c=mm.position.clone().applyMatrix4(grp.matrixWorld);
        const p=c.clone().project(cam);
        const sx=(p.x*0.5+0.5)*W, sy=(-p.y*0.5+0.5)*H;
        const d=c.distanceTo(cam.position), ppw=H/(2*d*tanV);
        const g=mm.geometry.parameters, hw=g.width*ppw/2, hh=g.height*ppw/2;
        q.push({x0:sx-hw,x1:sx+hw,y0:sy-hh,y1:sy+hh,W:g.width*ppw,H:g.height*ppw,imp:n.importance});
      }
      const CELL=2, gw=Math.ceil(W/CELL), gh=Math.ceil(H/CELL);
      const cover=new Int32Array(gw*gh);
      for(const a of q){
        a.gx0=Math.max(0,Math.floor(a.x0/CELL)); a.gx1=Math.min(gw-1,Math.ceil(a.x1/CELL)-1);
        a.gy0=Math.max(0,Math.floor(a.y0/CELL)); a.gy1=Math.min(gh-1,Math.ceil(a.y1/CELL)-1);
        for(let y=a.gy0;y<=a.gy1;y++)for(let x=a.gx0;x<=a.gx1;x++) cover[y*gw+x]++;
      }
      const bands=[];
      for(const a of q){
        const y0=Math.max(0,Math.floor(a.y0)), y1=Math.min(H-1,Math.ceil(a.y1));
        const hgt=Math.max(1,y1-y0+1); const blk=new Uint8Array(hgt);
        for(const b of q){
          if(b===a) continue;
          if(b.x1<=a.x0||b.x0>=a.x1) continue;
          const by0=Math.max(y0,Math.floor(b.y0)), by1=Math.min(y1,Math.ceil(b.y1));
          for(let y=by0;y<=by1;y++) if(y-y0>=0&&y-y0<hgt) blk[y-y0]=1;
        }
        let best=0,cur=0;
        for(let i=0;i<hgt;i++){ if(!blk[i]){cur++; if(cur>best)best=cur} else cur=0 }
        let tot=0,vis=0;
        for(let y=a.gy0;y<=a.gy1;y++)for(let x=a.gx0;x<=a.gx1;x++){tot++; if(cover[y*gw+x]<=1)vis++}
        bands.push({imp:a.imp,band:best,vis:tot?vis/tot:1,H:a.H});
      }
      const sb=bands.map(b=>b.band).sort((x,y)=>x-y);
      const sv=bands.map(b=>b.vis).sort((x,y)=>x-y);
      const core=bands.slice().sort((x,y)=>y.imp-x.imp).slice(0,Math.floor(bands.length*0.2));
      const allH=q.map(x=>x.H).sort((x,y)=>x-y);
      // "可读" = 竖带够高 或 可见面积 ≥ 60%（被零星压住但仍能读）
      const usable = bands.filter(b=>b.band>=0.65*b.H || b.vis>=0.75).length;
      const coreUsable = core.filter(b=>b.band>=0.65*b.H || b.vis>=0.75).length;
      return { maxR,
        bandMed: sb[Math.floor(sb.length/2)],
        visMed: sv[Math.floor(sv.length/2)],
        buried: bands.filter(b=>b.band===0).length,
        usable, coreUsable, coreN: core.length,
        medH: allH[Math.floor(allH.length/2)],
        coreH: core.reduce((s,c)=>s+c.H,0)/core.length };
    })()`)

    const rs = []
    for (const az of [0, 30, 60, 90, 120, 150]) rs.push(await one(az))
    ws.close()
    return {
      maxR: rs[0].maxR,
      bandMed: Math.min(...rs.map((r) => r.bandMed)),
      visMed: Math.min(...rs.map((r) => r.visMed)),
      buried: Math.max(...rs.map((r) => r.buried)),
      usable: Math.min(...rs.map((r) => r.usable)),
      coreUsable: Math.min(...rs.map((r) => r.coreUsable)),
      coreN: rs[0].coreN,
      medH: Math.min(...rs.map((r) => r.medH)),
      coreH: Math.min(...rs.map((r) => r.coreH)),
    }
  } finally {
    cp.kill()
    await sleep(300)
  }
}

console.log('  baseSize  盘半径  中位px  核心px  中位带  可见比  完全被遮  可用数  核心可用')
const out = []
try {
  for (const BS of [5.6, 6.0, 6.4, 7.2]) {
    writeFileSync(CONFIG, original.replace(/baseSize:\s*[\d.]+/, `baseSize: ${BS}`))
    await build()
    const r = await measure()
    out.push({ BS, ...r })
    console.log(`  ${String(BS).padStart(8)}  ${r.maxR.toFixed(0).padStart(5)}  ${r.medH.toFixed(1).padStart(6)}  ${r.coreH.toFixed(1).padStart(6)}  ${String(r.bandMed).padStart(6)}  ${r.visMed.toFixed(2).padStart(5)}  ${String(r.buried).padStart(8)}  ${String(r.usable).padStart(6)}  ${String(r.coreUsable + '/' + r.coreN).padStart(8)}`)
  }
} finally {
  writeFileSync(CONFIG, original)
  await build()
  console.log('\n已恢复原配置并重新构建。')
}

console.log('\n综合评分（可用数 + 3×核心可用，尺度无关判据）：')
for (const r of out) r.score = r.usable + r.coreUsable * 3
out.sort((a, b) => b.score - a.score)
for (const r of out)
  console.log(`  baseSize=${r.BS} → 分 ${r.score.toFixed(1)} | 可用 ${r.usable}/257 | 核心可用 ${r.coreUsable}/${r.coreN} | 中位 ${r.medH.toFixed(1)}px | 可见比 ${r.visMed.toFixed(2)} | 被遮 ${r.buried}`)
console.log(`\n推荐 baseSize = ${out[0].BS}`)
