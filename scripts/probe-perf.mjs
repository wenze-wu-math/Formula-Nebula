/**
 * 性能与渲染规模实测。
 *
 * 用法: node scripts/probe-perf.mjs
 *   （需先 npm run preview；URL / PORT 可用环境变量覆盖）
 *
 * ⚠ 无头 SwiftShader 是**软件渲染**，帧率没有参考价值（实测 1~5 fps，
 *   同一台机器还会波动 5 倍）。所以这里量的是**与渲染速度无关**的量：
 *   各阶段耗时、几何体/纹理数量、draw call 数、显存估算。
 *
 * ── 关于 draw call 的计数，有三个坑，都踩过 ──
 *
 * 坑一：`renderer.info.render.calls` 读一次**不可靠**。
 *   autoReset 默认 true，每个 pass 开始时清零重计，所以帧末剩下的是
 *   **最后一个 pass** 的数字 —— 而最后一个 pass 永远是全屏四边形：calls = 1。
 *   直接读会得到"464 个公式只要 1 次 draw call"这种荒谬结论。
 *
 * 坑二：即使关掉 autoReset，"reset → 等一帧 → 读"也不对。
 *   rAF 回调先注册先执行，应用的循环注册得更早，于是读到的是
 *   **两帧累计**（实测 3728 = 2 × 1864）。
 *   正确做法是把 renderer.render 包一层，在**每次调用内部**
 *   reset → 调用 → 读。这样与 rAF 时机完全无关。
 *
 * 坑三：即使量准了，"1850 次 draw call / 992 个对象"这个比值也需要解释，
 *   否则会误以为有重复渲染的 bug。真实原因是**透明对象被分两批提交**：
 *   three.js 会把场景拆成 opaque 与 transparent 两个渲染列表，
 *   而本项目的公式平面、光斑、色点为了正确的混合顺序，
 *   材质都是 `transparent: true` + `depthWrite: false`。实测逐类摘除的贡献是：
 *
 *     光斑 464 个 → 846 次（1.82×）
 *     色点  59 个 → 118 次（2.00×）
 *     平面 464 个 → 880 次（1.90×）
 *
 *   也就是说对象数与 draw call 不是 1:1，这是透明渲染的正常代价，
 *   不是 bug。真正的优化方向是**把同类透明面片合批**
 *   （详见 README 的「性能」一节）。
 */
import { spawn } from 'node:child_process'
import { resolve } from 'node:path'
import { tmpdir } from 'node:os'
import { setTimeout as sleep } from 'node:timers/promises'
import { requireChrome } from './_chrome.mjs'

const CHROME = requireChrome()
const URL_ = process.env.URL || 'http://127.0.0.1:5176/'
const PORT = Number(process.env.PORT || 9340)

const profile = resolve(tmpdir(), 'nebula-perf-' + Date.now())
const chrome = spawn(CHROME, [
  '--headless=new', '--no-sandbox', '--disable-gpu-sandbox',
  '--enable-unsafe-swiftshader', '--use-gl=angle', '--use-angle=swiftshader',
  '--window-size=1600,1000',
  `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`,
  '--no-first-run', '--no-default-browser-check', URL_,
], { stdio: ['ignore', 'pipe', 'pipe'] })
chrome.stderr.on('data', () => {})

let target
for (let i = 0; i < 600 && !target; i++) {
  try {
    const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()
    target = list.find((t) => t.type === 'page' && t.webSocketDebuggerUrl)
  } catch {}
  if (!target) await sleep(500)
}
if (!target) { console.error('连不上 Chrome'); chrome.kill(); process.exit(1) }

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
const ev = async (expression) => {
  const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text)
  return r.result.value
}
await send('Runtime.enable')
await send('Page.enable')

const t0 = Date.now()
process.stdout.write('等待烘焙完成')
let diag = null
for (let i = 0; i < 1800; i++) {
  try {
    const d = await ev(`(()=>{const e=document.getElementById('diag');return e?e.textContent:''})()`)
    if (d) { const j = JSON.parse(d); if (j.built > 0) { diag = j; break } }
  } catch {}
  if (i % 15 === 0) process.stdout.write('.')
  await sleep(1000)
}
const wallMs = Date.now() - t0
if (!diag) { console.error('\n烘焙没完成'); ws.close(); chrome.kill(); process.exit(1) }

console.log(`\n\n=== 启动 ===`)
console.log(`  公式 ${diag.nodes} 个（主星系 ${diag.galaxy} + 猜想星团 ${diag.conjectures}）· 成功 ${diag.built} · 失败 ${diag.failed}`)
console.log(`  关联 ${diag.links} 条（跨星团 ${diag.crossLinks}）`)
console.log(`  含 Chrome 启动与页面加载的墙钟: ${(wallMs / 1000).toFixed(0)}s`)
if (diag.ms) {
  console.log(`  页面自报各阶段（这才是纯计算耗时）:`)
  console.log(`    烘焙公式贴图 (串行 MathJax) : ${diag.ms.bake} ms   ← 绝对大头`)
  console.log(`    布局（含松弛）              : ${diag.ms.layout} ms`)
  console.log(`    建精灵节点                  : ${diag.ms.buildNodes} ms`)
}

await sleep(800)

/* ── 真实 GL 绘制次数（包住 WebGL 上下文，不依赖 three.js 自述）── */
const glStats = await ev(`(async()=>{
  const n = window.__nebula, r = n.scene.renderer, scene = n.scene.scene;
  const frame = () => new Promise(res => requestAnimationFrame(res));
  const gl = r.getContext();
  const info = r.info;

  const origDE = gl.drawElements.bind(gl), origDA = gl.drawArrays.bind(gl);
  const origDEI = gl.drawElementsInstanced ? gl.drawElementsInstanced.bind(gl) : null;
  const origDAI = gl.drawArraysInstanced ? gl.drawArraysInstanced.bind(gl) : null;
  let c = 0;
  gl.drawElements = function(...a){ c++; return origDE(...a) };
  gl.drawArrays = function(...a){ c++; return origDA(...a) };
  if (origDEI) gl.drawElementsInstanced = function(...a){ c++; return origDEI(...a) };
  if (origDAI) gl.drawArraysInstanced = function(...a){ c++; return origDAI(...a) };

  const origRender = r.render.bind(r);
  info.autoReset = false;
  const per = [];
  r.render = function(...a) {
    info.reset();
    const before = c;
    const out = origRender(...a);
    per.push({ gl: c - before, three: info.render.calls,
               tris: info.render.triangles, points: info.render.points, lines: info.render.lines });
    return out;
  };
  await frame();
  r.render = origRender;
  info.autoReset = true;
  gl.drawElements = origDE; gl.drawArrays = origDA;
  if (origDEI) gl.drawElementsInstanced = origDEI;
  if (origDAI) gl.drawArraysInstanced = origDAI;

  // 对象普查
  const byType = {}; let drawable = 0;
  scene.traverse(o => {
    if (!(o.isMesh || o.isSprite || o.isPoints || o.isLine)) return;
    drawable++;
    const k = o.type; byType[k] = (byType[k]||0)+1;
  });
  // 材质透明度普查
  const mat = { transparent:0, opaque:0 };
  scene.traverse(o => {
    if (!o.material) return;
    const ms = Array.isArray(o.material) ? o.material : [o.material];
    for (const m of ms) m.transparent ? mat.transparent++ : mat.opaque++;
  });

  return { per, byType, drawable, mat,
           geometries: info.memory.geometries, textures: info.memory.textures,
           programs: info.programs ? info.programs.length : -1,
           ctx: (()=>{ try { const a = r.getContext().getContextAttributes(); return { antialias:a.antialias, alpha:a.alpha, depth:a.depth } } catch { return null } })() };
})()`)

const scenePass = glStats.per.find((p) => p.gl > 2) || glStats.per[0] || { gl: 0, three: 0, tris: 0, points: 0, lines: 0 }
const passCount = glStats.per.filter((p) => p.gl <= 2).length
const totalGL = glStats.per.reduce((s, p) => s + p.gl, 0)

console.log(`\n=== 渲染规模 ===`)
console.log(`  可绘制对象        : ${glStats.drawable}  （${Object.entries(glStats.byType).map(([k,v])=>k+'='+v).join('  ')}）`)
console.log(`  其中透明材质      : ${glStats.mat.transparent}，不透明 ${glStats.mat.opaque}`)
console.log(`  一帧 draw call 构成:`)
console.log(`    场景渲染 1 次   : ${scenePass.gl.toLocaleString()} 次 GL 绘制`)
console.log(`    后处理全屏 pass : ${passCount} 次 × 1 = ${passCount}`)
console.log(`    一帧合计        : ${totalGL.toLocaleString()} 次`)
console.log(`  三角形            : ${scenePass.tris.toLocaleString()}`)
console.log(`  点                : ${scenePass.points.toLocaleString()}`)
console.log(`  几何体 / 纹理     : ${glStats.geometries} / ${glStats.textures}`)
console.log(`  着色器程序        : ${glStats.programs}`)

/* ── 逐类摘除，量化各自贡献 ──
 * 这一节是为了回答"为什么 draw call 数 ≈ 对象数 × 1.9"。
 * 摘父节点而不是置 visible：scene.js 的 updateAppearance 每帧都会
 * 把 visible 写回去，置 visible 会被下一帧覆盖（前面踩过）。 */
const attrib = await ev(`(async()=>{
  const n = window.__nebula, r = n.scene.renderer;
  const frame = () => new Promise(res => requestAnimationFrame(res));
  const gl = r.getContext();
  const origDE = gl.drawElements.bind(gl), origDA = gl.drawArrays.bind(gl);
  const origDEI = gl.drawElementsInstanced ? gl.drawElementsInstanced.bind(gl) : null;
  const origDAI = gl.drawArraysInstanced ? gl.drawArraysInstanced.bind(gl) : null;
  const origRender = r.render.bind(r);

  const measureScene = async () => {
    let c = 0;
    gl.drawElements = function(...a){ c++; return origDE(...a) };
    gl.drawArrays = function(...a){ c++; return origDA(...a) };
    if (origDEI) gl.drawElementsInstanced = function(...a){ c++; return origDEI(...a) };
    if (origDAI) gl.drawArraysInstanced = function(...a){ c++; return origDAI(...a) };
    let sceneDraws = -1;
    r.render = function(...a) {
      const before = c;
      const out = origRender(...a);
      const used = c - before;
      if (used > 2 && sceneDraws < 0) sceneDraws = used;
      return out;
    };
    await frame();
    r.render = origRender;
    return sceneDraws;
  };

  const base = await measureScene();

  const detach = (pick) => {
    const saved = [];
    for (const x of n.graph.nodes) {
      const o = pick(x);
      if (o && o.parent) { saved.push([o, o.parent]); o.parent.remove(o) }
    }
    return saved;
  };
  const reattach = (saved) => { for (const [o,p] of saved) p.add(o) };

  const g1 = detach(x => x.glow);
  const noGlow = await measureScene();
  const g2 = detach(x => x.marker);
  const noGlowMarker = await measureScene();
  const g3 = detach(x => x.sprite);
  const bare = await measureScene();
  reattach(g3); reattach(g2); reattach(g1);

  gl.drawElements = origDE; gl.drawArrays = origDA;
  if (origDEI) gl.drawElementsInstanced = origDEI;
  if (origDAI) gl.drawArraysInstanced = origDAI;

  return { base, noGlow, noGlowMarker, bare,
    glowN: n.graph.nodes.filter(x=>x.glow).length,
    markerN: n.graph.nodes.filter(x=>x.marker).length,
    spriteN: n.graph.nodes.filter(x=>x.sprite).length };
})()`)

console.log(`\n=== draw call 归因（逐类摘除）===`)
console.log(`  基线              : ${attrib.base}`)
console.log(`  摘掉 ${String(attrib.glowN).padStart(3)} 个光斑  : ${String(attrib.noGlow).padStart(5)}   → 光斑贡献 ${attrib.base - attrib.noGlow}`)
console.log(`  再摘 ${String(attrib.markerN).padStart(3)} 个色点  : ${String(attrib.noGlowMarker).padStart(5)}   → 色点贡献 ${attrib.noGlow - attrib.noGlowMarker}`)
console.log(`  再摘 ${String(attrib.spriteN).padStart(3)} 个平面  : ${String(attrib.bare).padStart(5)}   → 平面贡献 ${attrib.noGlowMarker - attrib.bare}`)
console.log(`  （剩下的 ${attrib.bare} 次是背景星云、深空星点、连线、星团柔光）`)
console.log(`  ⚠ 对象数与 draw call 不是 1:1：透明对象会被分到 opaque/transparent`)
console.log(`    两个渲染列表，所以 464 个光斑贡献约 846 次（1.82×）、`)
console.log(`    464 个平面贡献约 880 次（1.90×）。这是透明渲染的正常代价，不是重复渲染。`)

/* ── 显存估算 ── */
const vram = await ev(`(()=>{
  const n = window.__nebula;
  let bytes = 0, count = 0;
  const seen = new Set();
  const addTex = (t) => {
    if (!t || !t.image || seen.has(t.uuid)) return;
    seen.add(t.uuid); count++;
    const im = t.image;
    const w = im.width || 0, h = im.height || 0;
    bytes += w * h * 4 * 1.34;   // RGBA8 + mipmap 约 33% 余量
  };
  for (const x of n.graph.nodes) {
    if (x.sprite && x.sprite.material) addTex(x.sprite.material.map);
    if (x.glow && x.glow.material) addTex(x.glow.material.map);
  }
  let maxW = 0, maxH = 0;
  for (const x of n.graph.nodes) {
    if (!x.sprite || !x.sprite.material.map || !x.sprite.material.map.image) continue;
    const im = x.sprite.material.map.image;
    maxW = Math.max(maxW, im.width); maxH = Math.max(maxH, im.height);
  }
  return { bytes, count, maxW, maxH };
})()`)

console.log(`\n=== 显存估算 ===`)
console.log(`  公式/光斑纹理 ${vram.count} 张（去重后），约 ${(vram.bytes / 1048576).toFixed(1)} MB`)
console.log(`  最大单张纹理 ${vram.maxW}×${vram.maxH}`)
console.log(`  （含 mipmap 余量；不含背景星云/星点/连线的顶点缓冲）`)
if (glStats.ctx) console.log(`  WebGL 上下文: antialias=${glStats.ctx.antialias} alpha=${glStats.ctx.alpha} depth=${glStats.ctx.depth}`)

/* ── 帧率（仅旁证） ── */
console.log(`\n=== 帧率（软件渲染，无参考价值，只看"能动"）===`)
const fps = await ev(`(async()=>{
  const n = window.__nebula;
  n.scene.setDisplay('autoRotate', true);
  let frames = 0;
  const t0 = performance.now();
  await new Promise(res=>{
    const tick = () => { frames++; if (performance.now()-t0 > 6000) res(); else requestAnimationFrame(tick) };
    requestAnimationFrame(tick);
  });
  return { frames, ms: performance.now()-t0 };
})()`)
console.log(`  ${fps.frames} 帧 / ${(fps.ms / 1000).toFixed(1)}s = ${(fps.frames / (fps.ms / 1000)).toFixed(1)} fps`)

ws.close(); chrome.kill()
console.log('\n完成')
