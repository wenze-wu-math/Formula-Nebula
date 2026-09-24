/**
 * 诊断：为什么"瞄准某个实心纹素"却拾取到透明？
 * 对若干节点，比较三件事：
 *   ① 测试按"实心纹素→UV→世界坐标→NDC"算出的 UV
 *   ② 射线真正命中的 UV（three.js 给的 hit.uv）
 *   ③ 两处 UV 在贴图上读到的 alpha
 * 用法: node scripts/diag-uv.mjs
 */
import { spawn } from 'node:child_process'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { setTimeout as sleep } from 'node:timers/promises'

const URL_ = process.env.URL || 'http://localhost:5176/'
const PORT = 9231
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const profile = mkdtempSync(join(tmpdir(), 'nebula-diag-'))

const cp = spawn(CHROME, [
  '--headless=new', '--enable-unsafe-swiftshader', '--use-gl=angle', '--use-angle=swiftshader',
  `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`,
  '--no-first-run', '--no-default-browser-check', '--window-size=1440,900', URL_,
], { stdio: 'ignore' })

let ws, id = 0
const pending = new Map()
const send = (method, params = {}) => new Promise((res, rej) => {
  const i = ++id; pending.set(i, { res, rej })
  ws.send(JSON.stringify({ id: i, method, params }))
})
const evaluate = async (expr) => {
  const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true })
  if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails).slice(0, 400))
  return r.result.value
}

try {
  let target
  for (let i = 0; i < 600 && !target; i++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()
      target = list.find((t) => t.type === 'page' && t.url.startsWith('http'))
    } catch {}
    if (!target) await sleep(500)
  }
  ws = new WebSocket(target.webSocketDebuggerUrl)
  await new Promise((r) => (ws.onopen = r))
  ws.onmessage = (e) => {
    const m = JSON.parse(e.data)
    if (m.id && pending.has(m.id)) {
      const { res, rej } = pending.get(m.id); pending.delete(m.id)
      m.error ? rej(new Error(JSON.stringify(m.error))) : res(m.result)
    }
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

  const out = await evaluate(`(()=>{
    const n = window.__nebula, s = n.scene, cam = s.camera, grp = s.nodeGroup;
    const res = [];
    const worldOf = m => m.position.clone().applyMatrix4(grp.matrixWorld);
    const worldQuatOf = m => { const q = new (m.quaternion.constructor)(); grp.getWorldQuaternion(q); return q.multiply(m.quaternion); };

    for (const node of n.graph.nodes) {
      const m = node.sprite;
      if (!m || res.length >= 6) continue;
      const img = m.material.map && m.material.map.image;
      if (!img) continue;
      const iw = img.width, ih = img.height;

      // 建一个和产品同尺寸的画布，方便对比读 alpha
      const cv = document.createElement('canvas'); cv.width = iw; cv.height = ih;
      const cx = cv.getContext('2d', { willReadFrequently: true });
      cx.drawImage(img, 0, 0);
      const d = cx.getImageData(0, 0, iw, ih).data;
      const alphaAt = (u, v) => {
        const px = Math.min(iw-1, Math.max(0, Math.floor(u*iw)));
        const py = Math.min(ih-1, Math.max(0, Math.floor((1-v)*ih)));
        return d[(py*iw+px)*4+3];
      };

      // 找一个高不透明纹素当中位数点
      const xs=[], ys=[];
      for (let iy=0; iy<ih; iy++) for (let ix=0; ix<iw; ix++)
        if (d[(iy*iw+ix)*4+3] >= 200) { xs.push(ix); ys.push(iy); }
      if (xs.length < 4) continue;
      xs.sort((a,b)=>a-b); ys.sort((a,b)=>a-b);
      const px = xs[xs.length>>1], py = ys[ys.length>>1];
      const bu = (px+0.5)/iw, bv = 1-(py+0.5)/ih;

      const gp = m.geometry.parameters;
      const p = worldOf(m), wq = worldQuatOf(m);
      const right = new p.constructor(1,0,0).applyQuaternion(wq).multiplyScalar((bu-0.5)*gp.width);
      const up    = new p.constructor(0,1,0).applyQuaternion(wq).multiplyScalar((bv-0.5)*gp.height);
      p.add(right).add(up);
      const ndc = p.clone().project(cam);

      const r = s.__pickAt(ndc.x, ndc.y);
      const hit = (r.hits || []).find(h => h.id === node.id);

      res.push({
        节点: node.name,
        贴图: iw + '×' + ih,
        几何: gp.width.toFixed(2) + '×' + gp.height.toFixed(2),
        测试UV: bu.toFixed(4) + ',' + bv.toFixed(4),
        测试处alpha: alphaAt(bu, bv),
        命中UV: hit && hit.uv ? (hit.uv.x.toFixed(4) + ',' + hit.uv.y.toFixed(4)) : '(该节点不在序列里)',
        命中处alpha: hit && hit.uv ? alphaAt(hit.uv.x, hit.uv.y) : '-',
        resolved: r.resolved || '(无)',
        序列前4: (r.hits||[]).slice(0,4).map(h=>h.id+'@'+h.dist.toFixed(1)+(h.opaque?'✓':'✗')).join(' | '),
      });
    }
    return res;
  })()`)

  console.log('=== UV 诊断 ===')
  for (const r of out) {
    console.log(`\n【${r.节点}】贴图 ${r.贴图}  几何 ${r.几何}`)
    console.log(`  测试取点  UV=${r.测试UV}  alpha=${r.测试处alpha}`)
    console.log(`  射线命中  UV=${r.命中UV}  alpha=${r.命中处alpha}`)
    console.log(`  resolved=${r.resolved}`)
    console.log(`  序列: ${r.序列前4}`)
  }
} finally {
  try { ws && ws.close() } catch {}
  cp.kill()
}
