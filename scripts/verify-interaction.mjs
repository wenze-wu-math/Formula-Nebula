// 交互验证：模拟点击公式，检查详情面板、关联列表是否正确打开
// 通过 Chrome DevTools Protocol 注入真实鼠标事件
import { spawn } from 'node:child_process'
import { resolve } from 'node:path'
import { mkdirSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { setTimeout as sleep } from 'node:timers/promises'
import { requireChrome } from './_chrome.mjs'

const CHROME = requireChrome()
const URL = process.env.URL || 'http://localhost:5176/'
const PORT = 9223
const OUT = resolve('shots')
mkdirSync(OUT, { recursive: true })

// Chrome 的 profile 必须放在系统临时目录：
// 放项目里会被 Vite 的文件监听扫到并因文件锁而崩溃。
const profile = resolve(tmpdir(), 'nebula-cdp-profile' + '-' + process.pid)

const cp = spawn(CHROME, [
  '--headless=new',
  '--no-sandbox',
  '--disable-gpu-sandbox',
  '--enable-unsafe-swiftshader',
  '--use-gl=angle',
  '--use-angle=swiftshader',
  '--hide-scrollbars',
  '--window-size=1600,1000',
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${profile}`,
  '--no-first-run',
  '--no-default-browser-check',
  URL,
], { stdio: ['ignore', 'pipe', 'pipe'] })

cp.stderr.on('data', () => {})

/** 等待 CDP 就绪并拿到页面 target */
async function getTarget() {
  for (let i = 0; i < 600; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${PORT}/json/list`)
      const list = await r.json()
      const page = list.find((t) => t.type === 'page' && t.webSocketDebuggerUrl)
      if (page) return page
    } catch {}
    await sleep(500)
  }
  throw new Error('CDP 未就绪')
}

const target = await getTarget()

/* ── 极简 CDP 客户端 ── */
const ws = new WebSocket(target.webSocketDebuggerUrl)
await new Promise((res, rej) => {
  ws.onopen = res
  ws.onerror = rej
})

let msgId = 0
const pending = new Map()
ws.onmessage = (ev) => {
  const m = JSON.parse(ev.data)
  if (m.id && pending.has(m.id)) {
    const { resolve: rs, reject: rj } = pending.get(m.id)
    pending.delete(m.id)
    if (m.error) rj(new Error(JSON.stringify(m.error)))
    else rs(m.result)
  }
}

function send(method, params = {}) {
  const id = ++msgId
  return new Promise((rs, rj) => {
    pending.set(id, { resolve: rs, reject: rj })
    ws.send(JSON.stringify({ id, method, params }))
  })
}

async function evaluate(expr) {
  const r = await send('Runtime.evaluate', {
    expression: expr,
    awaitPromise: true,
    returnByValue: true,
  })
  if (r.exceptionDetails) {
    throw new Error('页面异常: ' + JSON.stringify(r.exceptionDetails.exception?.description || r.exceptionDetails))
  }
  return r.result.value
}

await send('Runtime.enable')
await send('Page.enable')

// 等页面把公式全部烘焙完
console.log('等待公式烘焙完成…')
let built = 0
for (let i = 0; i < 600; i++) {
  try {
    const d = await evaluate(`(()=>{const e=document.getElementById('diag');return e?e.textContent:''})()`)
    if (d) {
      const j = JSON.parse(d)
      built = j.built
      console.log(`  built=${j.built} failed=${j.failed}`)
      if (j.built > 0) break
    }
  } catch {}
  await sleep(1000)
}

if (!built) {
  console.log('!! 没有公式渲染成功，终止')
  cp.kill()
  process.exit(1)
}

console.log('\n=== 1. Canvas 像素读取（影响拾取精度）===')
const taintTest = await evaluate(`(()=>{
  const n = window.__nebula;
  const node = n.graph.nodes.find(x=>x.sprite);
  const src = node.sprite.material.map.image;
  const c = document.createElement('canvas');
  c.width = c.height = 1;
  const ctx = c.getContext('2d', {willReadFrequently:true});
  try {
    ctx.drawImage(src, 0, 0, 1, 1, 0, 0, 1, 1);
    const d = ctx.getImageData(0,0,1,1).data;
    return {ok:true, alpha:d[3]};
  } catch(e){ return {ok:false, err:String(e)}; }
})()`)
console.log('  画布可读:', JSON.stringify(taintTest))

console.log('\n=== 2. 场景规模 ===')
const info = await evaluate(`(()=>{
  const n = window.__nebula;
  let sprites=0, withTex=0;
  for (const x of n.graph.nodes) {
    if (x.sprite) { sprites++; if (x.sprite.material.map) withTex++; }
  }
  const r = n.scene.renderer.info;
  return {sprites, withTex, calls:r.render.calls, tris:r.render.triangles,
          textures:r.memory.textures, geoms:r.memory.geometries};
})()`)
console.log(' ', JSON.stringify(info))

console.log('\n=== 3. 模拟点击画面中央 ===')
// 先冻结运动：否则从"算出坐标"到"派发点击"之间星云还在自转，
// 公式已经移开，点击必然落空（这不是代码 bug，是测试方法问题）。
await evaluate(`(()=>{const n=window.__nebula;
  n.scene.controls.autoRotate=false; n.scene.stop(); return 1})()`)
await sleep(300)

const box = await evaluate(`(()=>{
  const r=document.getElementById('scene').getBoundingClientRect();
  return {left:r.left, top:r.top, w:r.width, h:r.height,
          vw:window.innerWidth, vh:window.innerHeight};
})()`)
console.log(`  视口 ${box.vw}×${box.vh}，画布 ${box.w}×${box.h} @ (${box.left},${box.top})`)

// 目标选择：挑一个屏幕上靠近中心、且能算出一个"实心像素"落点的公式。
// 只按中心点投影会点在透明留白上，所以这里采样贴图 alpha 找实心 UV。
const spot = await evaluate(`(()=>{
  const n = window.__nebula, cam = n.scene.camera;
  const tmp = n.graph.nodes[0].sprite.position.clone();
  let best=null, bestD=1e9;
  for (const node of n.graph.nodes) {
    const m = node.sprite;
    if(!m) continue;
    const c = tmp.copy(m.position).project(cam);
    if (Math.abs(c.x)>0.70 || Math.abs(c.y)>0.70 || c.z>1) continue;
    const d = c.x*c.x + c.y*c.y;
    if (d >= bestD) continue;

    const img = m.material.map && m.material.map.image;
    if(!img) continue;
    const cv=document.createElement('canvas'); cv.width=cv.height=24;
    const ctx=cv.getContext('2d',{willReadFrequently:true});
    ctx.drawImage(img,0,0,24,24);
    const px=ctx.getImageData(0,0,24,24).data;
    let bu=-1,bv=-1,ba=0;
    for(let iy=0;iy<24;iy++)for(let ix=0;ix<24;ix++){
      const a=px[(iy*24+ix)*4+3];
      if(a>ba){ba=a;bu=(ix+0.5)/24;bv=1-(iy+0.5)/24;}
    }
    if(ba<80) continue;

    const gp=m.geometry.parameters;
    const lx=(bu-0.5)*gp.width, ly=(bv-0.5)*gp.height;
    const p=m.position.clone();
    const right=new p.constructor(1,0,0).applyQuaternion(m.quaternion).multiplyScalar(lx);
    const up=new p.constructor(0,1,0).applyQuaternion(m.quaternion).multiplyScalar(ly);
    p.add(right).add(up);
    const ndc=p.project(cam);
    if(Math.abs(ndc.x)>0.85||Math.abs(ndc.y)>0.85) continue;

    bestD = d;
    best = {id:node.id, x:ndc.x, y:ndc.y, name:node.name};
  }
  return best;
})()`)
console.log('  目标公式:', spot ? `${spot.name} (${spot.id})` : '(无)')

if (spot) {
  // NDC(-1..1) → 画布像素：画布左上角 + (ndc+1)/2 * 画布尺寸
  const cx = box.left + (spot.x + 1) / 2 * box.w
  const cy = box.top + (1 - spot.y) / 2 * box.h

  // 关键诊断：这个坐标上最顶层的元素是谁？
  // 如果命中的不是 canvas（例如 #load 加载遮罩还在、或 HUD 挡着），
  // 鼠标事件根本到不了画布，后面的断言就没有意义。
  const topEl = await evaluate(`(()=>{
    const e = document.elementFromPoint(${cx.toFixed(1)}, ${cy.toFixed(1)});
    return e ? (e.id || e.className || e.tagName) : 'null';
  })()`)
  console.log(`  点击坐标 (${cx.toFixed(0)}, ${cy.toFixed(0)}) 顶层元素: ${topEl}`)

  for (const type of ['mouseMoved', 'mousePressed', 'mouseReleased']) {
    await send('Input.dispatchMouseEvent', {
      type, x: cx, y: cy, button: 'left',
      clickCount: type === 'mouseMoved' ? 0 : 1,
      buttons: type === 'mousePressed' ? 1 : 0,
    })
    await sleep(140)
  }
  await sleep(900)

  const panel = await evaluate(`(()=>{
    const p=document.getElementById('panel');
    if(!p) return {found:false};
    return {
      found:true,
      open:p.classList.contains('on'),
      title:p.querySelector('.hd .nm')?.textContent||'',
      en:p.querySelector('.hd .en')?.textContent||'',
      hasKatex: !!p.querySelector('.formula .katex'),
      summary:(p.querySelector('.summary')?.textContent||'').slice(0,40),
      detailLen:(p.querySelector('.detail')?.textContent||'').length,
      relCount:p.querySelectorAll('.rel').length,
      relNames:[...p.querySelectorAll('.rel .nm')].slice(0,4).map(e=>e.textContent),
      relWhy:[...p.querySelectorAll('.rel .why')].slice(0,2).map(e=>e.textContent),
    };
  })()`)
  console.log('  面板状态:', JSON.stringify(panel, null, 2))
}

console.log('\n=== 4. 关联跳转（点击关联项）===')
const jump = await evaluate(`(()=>{
  const p=document.getElementById('panel');
  const btn=p.querySelector('.rel');
  if(!btn) return {ok:false, why:'没有关联项'};
  const before=p.querySelector('.hd .nm').textContent;
  btn.click();
  return {ok:true, before, after:p.querySelector('.hd .nm').textContent};
})()`)
console.log(' ', JSON.stringify(jump))

console.log('\n=== 5. 搜索功能 ===')
const searchRes = await evaluate(`(()=>{
  const inp=document.querySelector('#search input');
  inp.value='层';
  inp.dispatchEvent(new Event('input',{bubbles:true}));
  const rows=[...document.querySelectorAll('#results .row .nm')].map(e=>e.textContent);
  return {count:rows.length, first:rows.slice(0,5)};
})()`)
console.log(' ', JSON.stringify(searchRes))

console.log('\n=== 6. 控制台错误 ===')
const errs = await evaluate(`(()=>window.__errs||[])()`)
console.log(' ', JSON.stringify(errs))

// 截图留档
const shot = await send('Page.captureScreenshot', { format: 'png' })
writeFileSync(resolve(OUT, 'interaction.png'), Buffer.from(shot.data, 'base64'))
console.log('\n截图已保存 shots/interaction.png')

ws.close()
cp.kill()
await sleep(500)
process.exit(0)
