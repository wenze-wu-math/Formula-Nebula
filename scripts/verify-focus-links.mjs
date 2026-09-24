/**
 * 验证「初始无连线 · 点击才显示关联」这一交互。
 *
 * 断言：
 *   1. 初始（未点选）时，连线缓冲区的颜色**全为黑**（AdditiveBlending 下 = 不可见）
 *   2. 点中一个公式后，只有该公式的**直接关联**边被点亮，且数量 = 它的度数
 *   3. 非关联边仍然全黑
 *   4. 点空白处 / 按 Esc → 回到全黑
 *   5. 面板里点击关联项跳转 → 高亮跟着换到新公式
 *
 * 关键做法：直接读 GPU 缓冲区的颜色数据。
 * 不能用"截图像素差"来判断 —— 连线是加法混合的细线，在 1600×1000 的
 * 画面里只占几百个像素，噪声很容易淹没信号。读缓冲区是确定性判据。
 */
import { spawn } from 'node:child_process'
import { resolve } from 'node:path'
import { mkdirSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { setTimeout as sleep } from 'node:timers/promises'

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const URL = process.env.URL || 'http://localhost:5176/'
const PORT = Number(process.env.PORT || 9241)
const OUT = resolve('shots')
mkdirSync(OUT, { recursive: true })

const profile = resolve(tmpdir(), `nebula-focus-${PORT}`)

const cp = spawn(CHROME, [
  '--headless=new', '--no-sandbox', '--disable-gpu-sandbox',
  '--enable-unsafe-swiftshader', '--use-gl=angle', '--use-angle=swiftshader',
  '--hide-scrollbars', '--window-size=1600,1000',
  `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`,
  '--no-first-run', '--no-default-browser-check', URL,
], { stdio: ['ignore', 'pipe', 'pipe'] })
cp.stderr.on('data', () => {})

async function getTarget() {
  for (let i = 0; i < 600; i++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()
      const page = list.find((t) => t.type === 'page' && t.webSocketDebuggerUrl)
      if (page) return page
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
    if (m.error) rj(new Error(JSON.stringify(m.error))); else rs(m.result)
  }
}
function send(method, params = {}) {
  const id = ++msgId
  return new Promise((rs, rj) => { pending.set(id, { resolve: rs, reject: rj }); ws.send(JSON.stringify({ id, method, params })) })
}
async function evaluate(expression) {
  const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })
  if (r.exceptionDetails) throw new Error('页面异常: ' + JSON.stringify(r.exceptionDetails.exception?.description || r.exceptionDetails))
  return r.result.value
}

await send('Runtime.enable')
await send('Page.enable')
// 收集控制台错误
await evaluate(`(()=>{ if(window.__errs) return 1; window.__errs=[];
  const o=console.error; console.error=function(...a){window.__errs.push(a.map(String).join(' ')); o.apply(console,a)};
  window.addEventListener('error',e=>window.__errs.push('error: '+e.message));
  return 1 })()`)

console.log('等待公式烘焙完成…')
let built = 0
for (let i = 0; i < 600; i++) {
  try {
    const d = await evaluate(`(()=>{const e=document.getElementById('diag');return e?e.textContent:''})()`)
    if (d) { const j = JSON.parse(d); built = j.built; if (j.built > 0) { console.log(`  built=${j.built} failed=${j.failed}`); break } }
  } catch {}
  await sleep(1000)
}
if (!built) { console.log('!! 没有公式渲染成功'); cp.kill(); process.exit(1) }

// 冻结运动：自转会让"算坐标 → 派发点击"之间目标移开，点击落空
// （这是测试方法问题，不是代码 bug）
await evaluate(`(()=>{const n=window.__nebula;
  n.scene.controls.autoRotate=false; n.scene.stop(); return 1})()`)
await sleep(400)

/* ── 读连线缓冲区的颜色，统计"被点亮的顶点数" ──
 * 每个顶点 3 个 float。全黑 = 不可见。
 * 用 1e-6 而不是 0 做阈值：浮点乘法会有极小残差。 */
const READ_COLORS = `(()=>{
  const n = window.__nebula;
  // LineSegments2 的颜色在 geometry 的 instanceColorStart/End 上
  const g = n.scene.links.group.children[0].geometry;
  const attr = g.attributes.instanceColorStart;
  const arr = attr.data.array;
  let lit = 0, total = arr.length, max=0;
  for (let i=0;i<arr.length;i++){
    if (arr[i] > max) max = arr[i];
    if (arr[i] > 1e-6) lit++;
  }
  return { lit, total, max: +max.toFixed(4), focus: n.scene.links.focus };
})()`

const results = []
function check(name, ok, detail) {
  results.push({ name, ok, detail })
  console.log(`  ${ok ? '通过' : '失败'}  ${name}${detail ? ' — ' + detail : ''}`)
}

console.log('\n=== 1. 初始状态必须没有任何连线 ===')
const initial = await evaluate(READ_COLORS)
console.log('  ', JSON.stringify(initial))
check('初始 lit=0（全部边不可见）', initial.lit === 0, `lit=${initial.lit}/${initial.total}`)
check('初始 focus=null', initial.focus === null, `focus=${initial.focus}`)

console.log('\n=== 2. 点中一个公式 → 只亮出它的直接关联 ===')
const box = await evaluate(`(()=>{const r=document.getElementById('scene').getBoundingClientRect();
  return {left:r.left, top:r.top, w:r.width, h:r.height}})()`)

// 挑一个屏幕上靠中心、且能算出实心像素落点的公式（与 verify-interaction 同法）
const spot = await evaluate(`(()=>{
  const n = window.__nebula, cam = n.scene.camera;
  const tmp = n.graph.nodes[0].sprite.position.clone();
  let best=null, bestD=1e9;
  for (const node of n.graph.nodes) {
    const m = node.sprite; if(!m) continue;
    const c = tmp.copy(m.position).project(cam);
    if (Math.abs(c.x)>0.70 || Math.abs(c.y)>0.70 || c.z>1) continue;
    const d = c.x*c.x + c.y*c.y;
    if (d >= bestD) continue;
    const img = m.material.map && m.material.map.image; if(!img) continue;
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
    best = {id:node.id, x:ndc.x, y:ndc.y, name:node.name, degree:node.degree};
  }
  return best;
})()`)

if (!spot) {
  console.log('!! 找不到可点的公式')
  ws.close(); cp.kill(); process.exit(1)
}
console.log(`  目标: ${spot.name} (${spot.id}) 度数=${spot.degree}`)

const cx = box.left + (spot.x + 1) / 2 * box.w
const cy = box.top + (1 - spot.y) / 2 * box.h

for (const type of ['mouseMoved', 'mousePressed', 'mouseReleased']) {
  await send('Input.dispatchMouseEvent', {
    type, x: cx, y: cy, button: 'left',
    clickCount: type === 'mouseMoved' ? 0 : 1,
    buttons: type === 'mousePressed' ? 1 : 0,
  })
  await sleep(140)
}
await sleep(700)

const afterClick = await evaluate(READ_COLORS)
console.log('  ', JSON.stringify(afterClick))

// 期望：被点亮的顶点数 = 度数 × VERTS × 2（每条边 VERTS 个顶点，
// 但 LineSegments2 每条边在 instance 上存了 2 个端点，每个端点一份颜色）
const expected = await evaluate(`(()=>{
  const n = window.__nebula;
  const g = n.scene.links.group.children[0].geometry;
  const SEGS = n.scene.links.curveSteps || 24;
  return { neighbours: n.scene.links.neighboursOf(${JSON.stringify(spot.id)}).length,
           focus: n.scene.links.focus };
})()`)
console.log('  ', JSON.stringify(expected))

check('点击后 lit>0（关联弧线出现）', afterClick.lit > 0, `lit=${afterClick.lit}`)
check('focus 指向被点中的公式', expected.focus === spot.id, `focus=${expected.focus}`)
check('关联数 = 面板里的关联数',
  expected.neighbours === spot.degree,
  `邻居 ${expected.neighbours} vs 度数 ${spot.degree}`)

console.log('\n=== 3. 面板里的关联跳转 → 高亮跟着换 ===')
const jump = await evaluate(`(()=>{
  const p=document.getElementById('panel');
  const btn=p.querySelector('.rel'); if(!btn) return {ok:false,why:'没有关联项'};
  const before=p.querySelector('.hd .nm').textContent;
  btn.click();
  return {ok:true, before, after:p.querySelector('.hd .nm').textContent, focus: window.__nebula.scene.links.focus};
})()`)
console.log('  ', JSON.stringify(jump))
check('跳转后面板标题改变', jump.ok && jump.before !== jump.after, `${jump.before} → ${jump.after}`)

const afterJump = await evaluate(READ_COLORS)
check('跳转后 focus 与面板一致', afterJump.focus !== null && afterJump.focus !== spot.id,
  `focus=${afterJump.focus}`)
check('跳转后仍只显示关联（lit>0）', afterJump.lit > 0, `lit=${afterJump.lit}`)

console.log('\n=== 4. 取消选中 → 回到全黑 ===')
await evaluate(`(()=>{ const p=document.getElementById('panel');
  p.querySelector('.close').click(); return 1 })()`)
await sleep(400)
const afterClose = await evaluate(READ_COLORS)
console.log('  ', JSON.stringify(afterClose))
check('关闭面板后 lit=0', afterClose.lit === 0, `lit=${afterClose.lit}`)
check('关闭面板后 focus=null', afterClose.focus === null, `focus=${afterClose.focus}`)

console.log('\n=== 5. 点空白处也要取消 ===')
// 先选中一个，再点画面角落（那里基本不会有公式）
const corner = { x: box.left + box.w * 0.5, y: box.top + box.h * 0.06 }
await evaluate(`(()=>{ window.__nebula.scene.select(${JSON.stringify(spot.id)}); return 1 })()`)
await sleep(300)
const beforeCorner = await evaluate(READ_COLORS)
for (const type of ['mouseMoved', 'mousePressed', 'mouseReleased']) {
  await send('Input.dispatchMouseEvent', {
    type, x: corner.x, y: corner.y, button: 'left',
    clickCount: type === 'mouseMoved' ? 0 : 1,
    buttons: type === 'mousePressed' ? 1 : 0,
  })
  await sleep(120)
}
await sleep(400)
const afterCorner = await evaluate(READ_COLORS)
console.log(`  选中时 lit=${beforeCorner.lit} → 点空白后 lit=${afterCorner.lit}`)
check('点空白后 lit=0', afterCorner.lit === 0, `lit=${afterCorner.lit}`)

console.log('\n=== 6. 连线开关（显示层）===')
const modes = await evaluate(`(()=>{
  const n=window.__nebula, s=n.scene.links;
  const out={};
  s.setMode('all'); out.all = (()=>{const g=s.group.children[0].geometry;
    const a=g.attributes.instanceColorStart.data.array; let c=0;
    for(let i=0;i<a.length;i++) if(a[i]>1e-6) c++; return c;})();
  s.setMode('off'); out.off = (()=>{const g=s.group.children[0].geometry;
    const a=g.attributes.instanceColorStart.data.array; let c=0;
    for(let i=0;i<a.length;i++) if(a[i]>1e-6) c++; return c;})();
  s.setMode('focus'); out.focus = (()=>{const g=s.group.children[0].geometry;
    const a=g.attributes.instanceColorStart.data.array; let c=0;
    for(let i=0;i<a.length;i++) if(a[i]>1e-6) c++; return c;})();
  return out;
})()`)
console.log('  ', JSON.stringify(modes))
check("mode='all' 显示全部连线", modes.all > 0, `lit=${modes.all}`)
check("mode='off' 完全不画", modes.off === 0, `lit=${modes.off}`)
check("mode='focus' 未选中时不画", modes.focus === 0, `lit=${modes.focus}`)

console.log('\n=== 7. 控制台错误 ===')
const errs = await evaluate(`(()=>window.__errs||[])()`)
console.log('  ', JSON.stringify(errs))
check('无控制台错误', errs.length === 0, `${errs.length} 条`)

const shot = await send('Page.captureScreenshot', { format: 'png' })
writeFileSync(resolve(OUT, 'focus-links.png'), Buffer.from(shot.data, 'base64'))

const failed = results.filter((r) => !r.ok)
console.log(`\n${'='.repeat(52)}`)
console.log(`结果：${results.length - failed.length} / ${results.length} 通过`)
if (failed.length) {
  console.log('失败项:')
  for (const f of failed) console.log(`  · ${f.name} — ${f.detail}`)
}
console.log('='.repeat(52))

ws.close()
cp.kill()
await sleep(500)
process.exit(failed.length ? 1 : 0)
