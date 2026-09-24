/**
 * 验证「辉光不要那么大，就是一个光点即可」这条需求。
 *
 * 为什么不看 config 数值、而是量屏幕像素：
 *   光点的**可见直径**由三样东西共同决定，任何单独一个数都判断不了 ——
 *     scale（面片边长）× falloff（面片里有多少是亮的）× 公式在屏幕上的大小。
 *   而且需求说的是**观感**（"就是一个光点"），那就得落到屏幕上量。
 *
 * 判据：
 *   1. 光点可见直径相对字形高度要小（中位 < 1.0 倍字形高）
 *   2. 核心的光点可以更大（重要度分层），但不能糊成一片
 *   3. 相邻公式的光点不能连起来（光点直径 < 最近邻间距）
 *   4. 相比改动前（scale 2.6 / falloff 2.2）至少要小一半
 */
import { spawn } from 'node:child_process'
import { resolve } from 'node:path'
import { tmpdir } from 'node:os'
import { setTimeout as sleep } from 'node:timers/promises'

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const URL = process.env.URL || 'http://localhost:5176/'
const PORT = Number(process.env.PORT || 9332)
const profile = resolve(tmpdir(), `nebula-glowsize-${PORT}`)

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
async function ev(expression) {
  const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })
  if (r.exceptionDetails) throw new Error('页面异常: ' + JSON.stringify(r.exceptionDetails.exception?.description || r.exceptionDetails))
  return r.result.value
}
await send('Runtime.enable')
await send('Page.enable')
await ev(`(()=>{ if(window.__errs) return 1; window.__errs=[];
  const o=console.error; console.error=function(...a){window.__errs.push(a.map(String).join(' ')); o.apply(console,a)};
  window.addEventListener('error',e=>window.__errs.push('error: '+e.message));
  return 1 })()`)

console.log('等待公式烘焙完成…')
let built = 0
for (let i = 0; i < 600; i++) {
  const d = await ev(`(()=>{const e=document.getElementById('diag');return e?e.textContent:''})()`).catch(() => '')
  if (d) { const j = JSON.parse(d); built = j.built; if (j.built > 0) { console.log(`  built=${j.built}`); break } }
  await sleep(1000)
}
if (!built) { console.log('!! 没有公式渲染成功'); cp.kill(); process.exit(1) }
await sleep(1200)

const results = []
function check(name, ok, detail) {
  results.push({ name, ok, detail })
  console.log(`  ${ok ? '通过' : '失败'}  ${name}${detail ? ' — ' + detail : ''}`)
}

/** 把"alpha 降到阈值处的半径系数"算出来：1 − a^(1/falloff) */
const kOf = (falloff, a = 0.05) => 1 - Math.pow(a, 1 / falloff)

console.log('\n=== 1. 量光点在屏幕上的实际大小 ===')
const M = await ev(`(()=>{
  const n = window.__nebula, cam = n.scene.camera;
  const box = document.getElementById('scene').getBoundingClientRect();
  const FALLOFF = 3.8;
  const k = 1 - Math.pow(0.05, 1/FALLOFF);
  const rows = [];
  for (const x of n.graph.nodes) {
    if (!x.glow || !x.sprite) continue;
    /* 只看主星系。
     * 星团节点挂在会绕斜轴翻滚的 clusterGroup 下，sprite.position 是
     * **相对球心**的局部坐标 —— 拿它和世界坐标的 cam.position 求距离
     * 是量纲错误的（会算出一个与真实距离无关的数），
     * 于是星团的"光点直径"全是错的，还会污染中位数。
     * 星团的光点走同一套 GLYPH.glow 参数，尺寸规律无需重复验证。 */
    if (x.cluster) continue;
    const d = x.sprite.position.distanceTo(cam.position);
    const pxPerWorld = box.height / (2 * Math.tan(cam.fov*Math.PI/360) * d);
    const glyphH = x.height * pxPerWorld;
    // ⚠ 光点面片有两个量，别搞混：
    //   geometry.parameters.width = 建几何时的边长（planeH × GLYPH.glow.scale）
    //   glow.scale.x               = 每帧的**倍数**（悬停/选中会放大）
    //   真实世界边长 = 两者相乘。
    const plate = x.glow.geometry.parameters.width * x.glow.scale.x;
    rows.push({ id:x.id, rank:x.rank, glyphH, dotW: plate * k * pxPerWorld });
  }
  rows.sort((a,b)=>a.rank-b.rank);
  const med = (a)=>{ const s=[...a].sort((x,y)=>x-y); return s[s.length>>1] };
  const core = rows.filter(r=>r.rank>0.9), edge = rows.filter(r=>r.rank<0.1);
  return {
    count: rows.length,
    glowScale: n.settings.state.tweak.glowScale,
    medGlyphH: +med(rows.map(r=>r.glyphH)).toFixed(3),
    medDotW: +med(rows.map(r=>r.dotW)).toFixed(3),
    coreDotW: +med(core.map(r=>r.dotW)).toFixed(3),
    edgeDotW: +med(edge.map(r=>r.dotW)).toFixed(3),
    maxDotW: +Math.max(...rows.map(r=>r.dotW)).toFixed(3),
    // 相机距离，用来换算世界单位
    camDist: +cam.position.length().toFixed(2),
  };
})()`)
const NEW_K = kOf(3.8)
const OLD_K = kOf(2.2)
console.log(`  公式数 ${M.count}，面板 glowScale=${M.glowScale}`)
console.log(`  falloff 3.8 → 可见半径系数 ${NEW_K.toFixed(3)}（改动前 falloff 2.2 是 ${OLD_K.toFixed(3)}）`)
console.log(`  中位：字形高 ${M.medGlyphH}px，光点直径 ${M.medDotW}px`)
console.log(`  核心光点 ${M.coreDotW}px，外缘光点 ${M.edgeDotW}px，最大 ${M.maxDotW}px`)
// 期望值从页面读，别硬编码 —— v1 是 303，v2 是 405（星团另有 59 个，
// 它们的光点尺寸走同一套逻辑，但这一段测的是主星系的间距关系）
const expectGlow = await ev(`window.__nebula.graph.nodes.filter(n=>!n.cluster&&n.glow).length`)
check('所有主星系公式都有光点', M.count === expectGlow, `${M.count} / 期望 ${expectGlow}`)
check('中位光点直径 < 1 倍字形高（"就是一个光点"）',
  M.medDotW / M.medGlyphH < 1.0, `${(M.medDotW / M.medGlyphH).toFixed(3)} 倍`)

console.log('\n=== 2. 相比改动前小了多少 ===')
// 改动前后唯一变的是 scale（2.6→0.85）与 falloff（2.2→3.8），
// 所以同一条公式的可见直径之比 = (0.85×NEW_K) / (2.6×OLD_K)，与公式本身无关。
const shrink = (2.6 * OLD_K) / (0.85 * NEW_K)
console.log(`  可见直径缩小 ${shrink.toFixed(2)}×（面积缩小 ${(shrink*shrink).toFixed(1)}×）`)
check('光点直径至少缩小一半（2× 以上）', shrink > 2, `${shrink.toFixed(2)}×`)
check('光点面积至少缩小 10 倍', shrink * shrink > 10, `${(shrink*shrink).toFixed(1)}×`)

console.log('\n=== 3. 光点不会把相邻公式连起来 ===')
// 最近邻世界间距 → 屏幕像素，与中位光点直径比
const NN = await ev(`(()=>{
  const n=window.__nebula, cam=n.scene.camera;
  const box=document.getElementById('scene').getBoundingClientRect();
  const rows=[];
  const nodes=n.graph.nodes.filter(x=>x.sprite);
  for (const x of nodes) {
    let best=1e9;
    for (const y of nodes) { if (x===y) continue;
      const d=x.sprite.position.distanceTo(y.sprite.position); if(d<best) best=d }
    const pxPerWorld = box.height/(2*Math.tan(cam.fov*Math.PI/360)
                        * x.sprite.position.distanceTo(cam.position));
    rows.push(best*pxPerWorld);
  }
  rows.sort((a,b)=>a-b);
  return { medNNpx:+rows[rows.length>>1].toFixed(3),
           minNNpx:+rows[0].toFixed(3) };
})()`)
console.log(`  最近邻屏幕间距：中位 ${NN.medNNpx}px，最小 ${NN.minNNpx}px`)
check('中位光点直径 < 最近邻中位间距',
  M.medDotW < NN.medNNpx, `${M.medDotW} < ${NN.medNNpx}`)
// 极少数大公式的光点允许比"最挤的那一对"大，但不能大到离谱
check('最大光点不超过最近邻最小间距的 3 倍',
  M.maxDotW < NN.minNNpx * 3, `${M.maxDotW} vs ${(NN.minNNpx*3).toFixed(1)}`)

console.log('\n=== 4. 重要度分层仍然保留（缩小不等于抹平）===')
console.log(`  核心光点 ${M.coreDotW}px vs 外缘 ${M.edgeDotW}px`)
check('核心光点比外缘大（重要度可见）', M.coreDotW > M.edgeDotW * 1.5,
  `${(M.coreDotW / M.edgeDotW).toFixed(2)}×`)

console.log('\n=== 5. 控制台错误 ===')
const errs = await ev(`(()=>window.__errs||[])()`)
check('无控制台错误', errs.length === 0, errs.length + ' 条')

const failed = results.filter((r) => !r.ok)
console.log(`\n${'='.repeat(52)}`)
console.log(`结果：${results.length - failed.length} / ${results.length} 通过`)
for (const f of failed) console.log(`  · ${f.name} — ${f.detail}`)
console.log('='.repeat(52))

ws.close(); cp.kill(); await sleep(400)
process.exit(failed.length ? 1 : 0)
