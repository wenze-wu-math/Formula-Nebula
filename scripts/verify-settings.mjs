/**
 * 设置系统验证：
 *   1. 面板存在、能打开、四个形态按钮都在
 *   2. 切换形态 → 布局真的重排（节点位置变了）、背景星云跟着换
 *   3. 参数滑块 → 立刻生效（自转速度、辉光等）
 *   4. 显示层开关 → 真的隐藏了对应对象
 *   5. 引力模式 → 相机与星系共转，公式在屏幕上保持静止
 *   6. localStorage 持久化 → 刷新后设置还在
 *   7. 全部恢复默认
 *
 * 引力那一条是本脚本的重点：它是本次改动里唯一"看起来对但可能方向反了"的地方，
 * 所以要真的用投影坐标验证"公式在屏幕上没动"。
 */
import { spawn } from 'node:child_process'
import { resolve } from 'node:path'
import { mkdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { setTimeout as sleep } from 'node:timers/promises'
import { requireChrome } from './_chrome.mjs'

const CHROME = requireChrome()
const URL = process.env.URL || 'http://localhost:5176/'
const PORT = Number(process.env.PORT || 9244)
const OUT = resolve('shots')
mkdirSync(OUT, { recursive: true })
// 每次运行都用**全新**的 profile：复用同一个目录会把上一次的
// localStorage 带进来（存档型 bug 会让"初始布局"就不是默认形态，
// 断言随之漂移）。用时间戳后缀保证干净。
const runId = Date.now().toString(36)
const profile = resolve(tmpdir(), `nebula-settings-${PORT}-${runId}`)

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

async function waitReady() {
  // ⚠ 刷新后要**等到烘焙完**。257 个 MathJax 公式在 headless SwiftShader 下
  //   要重新解析一遍，实测约需 2 分钟（首次加载之所以快，是因为页面在
  //   CDP 连上之前就已经加载完了）。所以超时给到 200 秒，
  //   并且顺便把烘焙进度打出来，卡住时一眼能看出是在跑还是挂了。
  let lastLbl = ''
  for (let i = 0; i < 200; i++) {
    try {
      const st = await evaluate(`(()=>{
        const d=document.getElementById('diag');
        return { hasNebula: typeof window.__nebula,
                 diag: d?d.textContent:'',
                 lbl: document.querySelector('#load .lbl')?.textContent||'' };
      })()`)
      if (st) {
        // 启动失败会写进 #load .lbl
        if (st.lbl.includes('失败')) {
          console.log('  !! 页面报启动失败:', st.lbl)
          return null
        }
        if (st.hasNebula === 'object' && st.diag) {
          const j = JSON.parse(st.diag)
          if (j.built > 0) return j
        }
        if (st.lbl && st.lbl !== lastLbl) {
          lastLbl = st.lbl
          if (i % 10 === 0) console.log(`    烘焙中… ${st.lbl}`)
        }
      }
    } catch {}
    await sleep(1000)
  }
  return null
}
console.log('等待烘焙…')
const diag = await waitReady()
if (!diag) { console.log('!! 未就绪'); cp.kill(); process.exit(1) }
console.log(`  built=${diag.built}`)

await evaluate(`(()=>{ window.__errs=[]; const o=console.error;
  console.error=function(...a){window.__errs.push(a.map(String).join(' ')); o.apply(console,a)};
  window.addEventListener('error',e=>window.__errs.push('error: '+e.message)); return 1 })()`)

/* ── 让脚本**可重复运行** ──
 * 必须在最开头清存档并回到默认形态，否则上一次运行留下的
 * localStorage 会改变**初始**布局：比如上次结束时是 diffuse，
 * 这次页面一启动就是 diffuse，而脚本记录的"基线位置"就是 diffuse 的，
 * 后面切到 ring 再切回 spiral 自然对不上（实测表现为
 * "切回 spiral 恢复原布局 0/40"，看起来像 bug，其实是测试不干净）。
 * 同理，display.stars 若上次留成 false，这次 toggle 会把它打开，
 * "存档含显示开关 === false" 的断言就会失败。 */
const bootState = await evaluate(`(()=>{
  const n=window.__nebula;
  n.settings.clearStorage();
  n.settings.resetAll();
  return { shape:n.settings.shape, isDefault:n.settings.isDefault };
})()`)
console.log('  已重置为默认:', JSON.stringify(bootState))
if (bootState.shape !== 'spiral' || !bootState.isDefault) {
  console.log('!! 无法回到默认状态，后续断言不可靠，终止')
  ws.close(); cp.kill(); process.exit(1)
}
await sleep(2500)   // 等重排完成

const results = []
function check(name, ok, detail) {
  results.push({ name, ok, detail })
  console.log(`  ${ok ? '通过' : '失败'}  ${name}${detail ? ' — ' + detail : ''}`)
}

/* ═══════ 1. 面板存在 ═══════ */
console.log('\n=== 1. 设置面板 ===')
const panelInfo = await evaluate(`(()=>{
  const p=document.getElementById('settings');
  const b=document.getElementById('st-open');
  if(!p) return {found:false};
  return {
    found:true, hasButton:!!b,
    open:p.classList.contains('on'),
    shapeBtns:[...p.querySelectorAll('.st-seg[data-seg=shape] button')].map(x=>x.textContent),
    colorBtns:[...p.querySelectorAll('.st-seg[data-seg=color] button')].map(x=>x.textContent),
    sliders:p.querySelectorAll('input[type=range]').length,
    checks:p.querySelectorAll('input[type=checkbox]').length,
    groups:[...p.querySelectorAll('.st-label')].map(x=>x.textContent),
  };
})()`)
console.log('  ', JSON.stringify(panelInfo))
check('面板已创建', panelInfo.found)
check('右上角有设置按钮', panelInfo.hasButton)
check('初始是收起的（首屏干净）', panelInfo.open === false)
check('四个形态按钮', panelInfo.shapeBtns.length === 4, panelInfo.shapeBtns.join('/'))
check('滑块数 >= 7', panelInfo.sliders >= 7, `${panelInfo.sliders} 个`)
/* 分组：形态 → 取景 → 着色 → 参数 → 显示层 → 引力
 * v2 多了「取景」一组（全景/主星系/猜想星团）——
 * 因为画面现在由两个分离的结构组成，需要显式的机位切换。 */
check('分组：形态/取景/着色/参数/显示层/引力',
  panelInfo.groups.length === 6, panelInfo.groups.join('/'))
/* 着色模式：v1 只有 family / mono 两种，v2 增加了猜想星团的
 * status（按状态）与 field（按领域）—— 星团需要一个表达
 * "这条猜想定了没" 的着色维度，那正是它存在的意义。 */
check('着色分组有四个按钮（知识族/猜想状态/猜想领域/统一橙黄）',
  panelInfo.colorBtns.length === 4, panelInfo.colorBtns.join('/'))

const opened = await evaluate(`(()=>{ document.getElementById('st-open').click();
  return document.getElementById('settings').classList.contains('on') })()`)
check('点按钮能打开', opened === true)

/* ═══════ 2. 切换形态 ═══════ */
console.log('\n=== 2. 形态切换 → 布局重排 ===')

/** 取一份"位置指纹"：前 40 个节点的 (id, x, z) */
const FINGERPRINT = `(()=>{
  const n=window.__nebula;
  return n.graph.nodes.slice(0,40).map(x=>[x.id,
    +(x.pos?.x??0).toFixed(2), +(x.pos?.z??0).toFixed(2)]);
})()`

const posBefore = await evaluate(FINGERPRINT)
const radiusBefore = await evaluate(`(()=>{const n=window.__nebula;
  return n.graph.nodes.slice(0,40).map(x=>+Math.hypot(x.pos.x,x.pos.z).toFixed(2))})()`)

// 切到「同心环」
await evaluate(`(()=>{ window.__nebula.settings.setShape('ring'); return 1 })()`)
await sleep(2500)   // 重排 + 重建精灵

const posAfterRing = await evaluate(FINGERPRINT)
const radiusAfterRing = await evaluate(`(()=>{const n=window.__nebula;
  return n.graph.nodes.slice(0,40).map(x=>+Math.hypot(x.pos.x,x.pos.z).toFixed(2))})()`)

const moved = posBefore.filter((p, i) => p[1] !== posAfterRing[i][1] || p[2] !== posAfterRing[i][2]).length
console.log(`  位置变化的节点: ${moved}/40`)
check('切形态后节点位置真的变了', moved > 30, `${moved}/40 个移动`)

const sameRadius = radiusBefore.filter((r, i) => Math.abs(r - radiusAfterRing[i]) < 0.01).length
console.log(`  半径不变的节点: ${sameRadius}/40（ring 会吸附到离散环，所以半径**应该**变）`)
check('ring 形态改变了半径（吸附到环）', sameRadius < 10, `${sameRadius}/40 半径未变`)

// 形态真的写进了 config 与场景
const shapeState = await evaluate(`(()=>{
  const n=window.__nebula;
  return { shape:n.settings.shape, lbl: document.querySelector('.st-desc').textContent };
})()`)
console.log('  ', JSON.stringify(shapeState))
check('settings.shape = ring', shapeState.shape === 'ring', shapeState.shape)
check('面板描述已更新', shapeState.lbl.includes('环'), shapeState.lbl.slice(0, 24))

// 背景星云跟着换（arms: 0 → 均匀分布，用方位角 χ² 判断）
// 星云这个 χ² 用 24 桶才有区分度（12 桶太粗，均匀与非均匀都能落在阈值下）
const nebChi = await evaluate(`(()=>{
  const n=window.__nebula;
  const g=n.scene.scene.getObjectByName('nebula').children[0].children[0].geometry;
  const a=g.attributes.position.array;
  const B=24, bins=new Array(B).fill(0); let tot=0;
  for(let i=0;i<a.length;i+=3){
    const x=a[i], z=a[i+2];
    if (!isFinite(x)||!isFinite(z)) continue;
    const ang=((Math.atan2(z,x)%(Math.PI*2))+Math.PI*2)%(Math.PI*2);
    bins[Math.floor(ang/(Math.PI*2)*B)]++; tot++;
  }
  const e=tot/B;
  return +bins.reduce((s,v)=>s+(v-e)**2/e,0).toFixed(1);
})()`)
console.log(`  星云方位角 χ² = ${nebChi}（24 桶、自由度 23，理想 ≈ 23；<40 即均匀）`)
check('背景星云骨架跟着换了（χ² 低 = 均匀）', nebChi < 40, `χ²=${nebChi}`)

// 切回旋涡
await evaluate(`(()=>{ window.__nebula.settings.setShape('spiral'); return 1 })()`)
await sleep(2500)
const backPos = await evaluate(FINGERPRINT)
const backSame = posBefore.filter((p, i) => p[1] === backPos[i][1] && p[2] === backPos[i][2]).length
check('切回 spiral 恢复原布局（可逆）', backSame > 35, `${backSame}/40 位置还原`)

/* ═══════ 3. 运行时参数 ═══════ */
console.log('\n=== 3. 运行时参数立刻生效 ===')
const spinTest = await evaluate(`(()=>{
  const n=window.__nebula;
  const before = n.scene.nodeGroup.rotation.y;
  n.settings.setTweak('spinRate', 0);        // 先停转
  return { set: n.settings.state.tweak.spinRate };
})()`)
check('自转速度可设为 0', spinTest.set === 0)

const bloomTest = await evaluate(`(()=>{
  const n=window.__nebula;
  n.settings.setTweak('bloomStrength', 1.2);
  return { state:n.settings.state.tweak.bloomStrength };
})()`)
check('辉光强度写入 state', bloomTest.state === 1.2)

// clamp 必须生效（防手改 localStorage 灌入非法值）
const clampTest = await evaluate(`(()=>{
  const n=window.__nebula;
  n.settings.setTweak('bloomStrength', 999);
  const hi = n.settings.state.tweak.bloomStrength;
  n.settings.setTweak('bloomStrength', -999);
  const lo = n.settings.state.tweak.bloomStrength;
  n.settings.setTweak('bloomStrength', 'abc');
  const nan = n.settings.state.tweak.bloomStrength;
  n.settings.setTweak('bloomStrength', 0.58);
  return { hi, lo, nan };
})()`)
console.log('  ', JSON.stringify(clampTest))
check('超上限被夹到 max', clampTest.hi === 1.6, String(clampTest.hi))
check('超下限被夹到 min', clampTest.lo === 0, String(clampTest.lo))
check('非法字符串回落到默认值', clampTest.nan === 0.58, String(clampTest.nan))

await evaluate(`(()=>{ window.__nebula.settings.setTweak('spinRate', 0.011); return 1 })()`)

/* ═══════ 4. 显示层开关 ═══════ */
console.log('\n=== 4. 显示层开关真的隐藏了对象 ===')
const layerTest = await evaluate(`(()=>{
  const n=window.__nebula;
  const neb = n.scene.scene.getObjectByName('nebula');
  const armGroup = neb.children[0];
  const links = n.scene.scene.getObjectByName('links');
  const out = {};
  out.nebulaBefore = armGroup.visible;
  n.settings.toggleDisplay('nebula');
  out.nebulaAfter = armGroup.visible;
  n.settings.toggleDisplay('nebula');
  out.nebulaRestored = armGroup.visible;

  out.linksBefore = links.visible;
  n.settings.toggleDisplay('links');
  out.linksAfter = links.visible;
  n.settings.toggleDisplay('links');
  out.linksRestored = links.visible;

  // 图例
  const lg = document.getElementById('legend');
  out.legendBefore = lg ? getComputedStyle(lg).display : 'missing';
  n.settings.toggleDisplay('legend');
  out.legendAfter = lg ? getComputedStyle(lg).display : 'missing';
  n.settings.toggleDisplay('legend');
  out.legendRestored = lg ? getComputedStyle(lg).display : 'missing';
  return out;
})()`)
console.log('  ', JSON.stringify(layerTest))
check('关背景星云 → 隐藏', layerTest.nebulaBefore === true && layerTest.nebulaAfter === false)
check('再开回来', layerTest.nebulaRestored === true)
check('关联连线组可隐藏', layerTest.linksAfter === false && layerTest.linksRestored === true)
check('图例可隐藏/恢复',
  layerTest.legendBefore !== 'none' && layerTest.legendAfter === 'none' && layerTest.legendRestored !== 'none',
  `${layerTest.legendBefore} → ${layerTest.legendAfter} → ${layerTest.legendRestored}`)

/* ═══════ 5. 引力模式 ═══════ */
console.log('\n=== 5. 引力模式：公式在屏幕上静止 ===')

/// 取**全部**节点投影到 NDC 的坐标（屏幕位置）。
// 只取前 30 个会踩坑：节点顺序大致按重要度排，前 30 个都在盘心附近，
// 那里离屏幕中心近、同样的转角下屏幕位移本来就小，会把对照组的信号淹掉。
const PROJ = `(()=>{
  const n=window.__nebula, cam=n.scene.camera, g=n.scene.nodeGroup;
  g.updateMatrixWorld(true);
  const out=[];
  const v=new (cam.position.constructor)();
  for (const x of n.graph.nodes) {
    if(!x.sprite) continue;
    v.copy(x.sprite.position).applyMatrix4(g.matrixWorld).project(cam);
    out.push([x.id, +v.x.toFixed(5), +v.y.toFixed(5)]);
  }
  return out;
})()`

/* 关掉"公式浮动"再测。
 *
 * 为什么必须关：每个公式还有一个**独立于星系自转**的漂浮动画
 * （n.bobAmp，见 scene.js 的 updateMotion）。引力抵消的是**整组自转**，
 * 抵消不了这个漂浮 —— 所以开着浮动时引力模式仍会有约 0.003 NDC 的
 * 残余位移。那不是引力失效，是另一个（可关闭的）显示效果。
 * 关掉它，测的就纯粹是"自转有没有被抵消"。 */
await evaluate(`(()=>{
  const n=window.__nebula;
  if (n.settings.state.display.bob) n.settings.toggleDisplay('bob');
  return n.settings.state.display.bob })()`)
await sleep(400)

// 先确保在自转（引力关闭），并且**没有暂停**（面板打开/选中公式都会暂停自转）
await evaluate(`(()=>{
  const n=window.__nebula;
  n.settings.setGravity(false);
  n.settings.setTweak('spinRate', 0.011);
  n.scene.select(null);        // 取消选中：选中会 spinPaused=true 冻住自转
  n.scene.start();
  return { paused: n.scene.__spinPaused };
})()`)
await sleep(800)

/** 自转角的当前值（用来确认"真的转了"，而不是靠 sleep 猜） */
const SPIN = `+window.__nebula.scene.nodeGroup.rotation.y.toFixed(5)`

const p0 = await evaluate(PROJ)
const s0 = await evaluate(SPIN)
// ⚠ 不能用固定 sleep 来保证"转够了"：主循环里 dt 被 clamp 到 0.05s
//   （防卡顿跳变），而 headless SwiftShader 只有约 5 FPS —— 也就是每帧
//   真实间隔 200ms 却只按 50ms 计算，模拟时间约为墙钟时间的 1/4。
//   所以改成**轮询自转角**，等到真的转过阈值再测量。
let s1 = s0
for (let i = 0; i < 600 && Math.abs(s1 - s0) < 0.02; i++) {
  await sleep(250)
  s1 = await evaluate(SPIN)
}
const p1 = await evaluate(PROJ)
console.log(`  自转 ${s0} → ${s1}（Δ=${(s1 - s0).toFixed(4)} rad）`)
// 自转时公式在屏幕上应该明显移动。
// 阈值取 0.005 NDC：实测转角 Δ≈0.02 时会有数十个节点超过它。
const movedNoGrav = p0.filter((p, i) => {
  const dx = Math.abs(p[1] - p1[i][1]), dy = Math.abs(p[2] - p1[i][2])
  return Math.max(dx, dy) > 0.005
}).length
console.log(`  引力关：${movedNoGrav}/${p0.length} 个公式在屏幕上明显移动（>0.005 NDC）`)

// 打开引力
await evaluate(`(()=>{ window.__nebula.settings.setGravity(true); return 1 })()`)
await sleep(800)
const p2 = await evaluate(PROJ)
const s2 = await evaluate(SPIN)
// 同样等自转转过同样的角度，这样两边对比才是公平的
let s3 = s2
for (let i = 0; i < 600 && Math.abs(s3 - s2) < 0.02; i++) {
  await sleep(250)
  s3 = await evaluate(SPIN)
}
const p3 = await evaluate(PROJ)
console.log(`  自转 ${s2} → ${s3}（Δ=${(s3 - s2).toFixed(4)} rad，星系**仍在转**）`)

// 引力开：公式在屏幕上应该基本不动
let maxShift = 0
const movedWithGrav = p2.filter((p, i) => {
  const dx = Math.abs(p[1] - p3[i][1]), dy = Math.abs(p[2] - p3[i][2])
  maxShift = Math.max(maxShift, dx, dy)
  return Math.max(dx, dy) > 0.005
}).length
console.log(`  引力开：${movedWithGrav}/${p2.length} 个公式移动；最大位移 ${maxShift.toFixed(5)} NDC`)

check('自转时公式确实在屏幕上移动（对照组）', movedNoGrav > 20, `${movedNoGrav}/${p0.length}`)
check('引力开启后公式在屏幕上基本静止', movedWithGrav <= 3, `${movedWithGrav}/${p2.length}，最大位移 ${maxShift.toFixed(5)}`)
check('引力后位移远小于引力前', maxShift < 0.005,
  `max=${maxShift.toFixed(5)} vs 对照组阈值 0.005`)

// 相机确实绕原点公转了（不是靠停转星系蒙混过关）
const orbitTest = await evaluate(`(()=>{
  const n=window.__nebula;
  const d = Math.hypot(n.scene.camera.position.x, n.scene.camera.position.z);
  const spin = n.scene.nodeGroup.rotation.y;
  return { camDistXZ:+d.toFixed(2), spin:+spin.toFixed(3) };
})()`)
console.log('  ', JSON.stringify(orbitTest))
check('星系仍在自转（引力不是靠停转实现的）', Math.abs(orbitTest.spin) > 0.001, `spin=${orbitTest.spin}`)

/* ═══════ 6. localStorage 持久化 ═══════ */
console.log('\n=== 6. localStorage 持久化 ===')
const persisted = await evaluate(`(()=>{
  const n=window.__nebula;
  n.settings.setShape('diffuse');
  n.settings.setTweak('brightness', 1.30);
  n.settings.toggleDisplay('stars');      // 关星点
  n.settings.setGravity(true);
  const raw = localStorage.getItem('formula-nebula.settings.v1');
  return { raw: raw ? JSON.parse(raw) : null };
})()`)
console.log('  存档:', JSON.stringify(persisted.raw))
check('存档已写入 localStorage', persisted.raw !== null)
check('存档含 shape', persisted.raw?.shape === 'diffuse', String(persisted.raw?.shape))
check('存档含参数', Math.abs(persisted.raw?.tweak?.brightness - 1.30) < 1e-9)
check('存档含显示开关', persisted.raw?.display?.stars === false)
check('存档含引力', persisted.raw?.gravity === true)

// 刷新页面 → 设置应该还在
console.log('  刷新页面验证…（要等重新烘焙，约 7 秒）')
await send('Page.reload', { ignoreCache: false })
await sleep(2000)
const d2 = await waitReady()
check('刷新后仍能正常启动', !!d2 && d2.built > 0, d2 ? `built=${d2.built}` : 'null（超时）')

// 刷新是**新页面**：错误收集器与 __nebula 都是全新的，要重装一遍
await evaluate(`(()=>{ window.__errs=[]; const o=console.error;
  console.error=function(...a){window.__errs.push(a.map(String).join(' ')); o.apply(console,a)};
  window.addEventListener('error',e=>window.__errs.push('error: '+e.message)); return 1 })()`)

const afterReload = await evaluate(`(()=>{
  const n=window.__nebula;
  return {
    shape: n.settings.shape,
    brightness: n.settings.state.tweak.brightness,
    stars: n.settings.state.display.stars,
    gravity: n.settings.state.gravity,
    starsVisible: n.scene.scene.getObjectByName('nebula').children[1].visible,
    lbl: document.querySelector('.st-desc')?.textContent || '',
    // 面板上哪个形态按钮是高亮的（这才是"UI 同步了存档"的直接证据）
    // 只看 shape 组：着色组也有一个高亮按钮，混在一起会数出两个
    activeBtn: [...document.querySelectorAll('.st-seg[data-seg=shape] button')]
      .filter(b=>b.classList.contains('on')).map(b=>b.textContent),
    activeColorBtn: [...document.querySelectorAll('.st-seg[data-seg=color] button')]
      .filter(b=>b.classList.contains('on')).map(b=>b.textContent),
    sliderVal: document.querySelector('#settings input[type=range]')?.value,
  };
})()`)
console.log('  ', JSON.stringify(afterReload))
check('刷新后形态保持 diffuse', afterReload.shape === 'diffuse', afterReload.shape)
check('刷新后参数保持 1.30', Math.abs(afterReload.brightness - 1.30) < 1e-9, String(afterReload.brightness))
check('刷新后显示开关保持（星点仍关）', afterReload.stars === false && afterReload.starsVisible === false)
check('刷新后引力保持开启', afterReload.gravity === true)
// 用形态按钮高亮来判断 UI 同步（描述文案里不一定含形态名，别去猜文案）
check('刷新后面板 UI 同步了存档（弥散盘高亮）',
  afterReload.activeBtn.length === 1 && afterReload.activeBtn[0] === '弥散盘',
  afterReload.activeBtn.join('/') || '(无高亮)')
check('刷新后着色分组也有唯一高亮（按知识族）',
  afterReload.activeColorBtn.length === 1 && afterReload.activeColorBtn[0] === '按知识族',
  afterReload.activeColorBtn.join('/') || '(无高亮)')

/* ═══════ 7. 恢复默认 ═══════ */
console.log('\n=== 7. 全部恢复默认 ===')
const reset = await evaluate(`(()=>{
  const n=window.__nebula;
  return { before: n.settings.isDefault };
})()`)
check('恢复前 isDefault = false', reset.before === false)

await evaluate(`(()=>{ window.__nebula.settings.resetAll(); return 1 })()`)
await sleep(2500)
const afterReset = await evaluate(`(()=>{
  const n=window.__nebula;
  const raw = JSON.parse(localStorage.getItem('formula-nebula.settings.v1')||'{}');
  return {
    isDefault: n.settings.isDefault,
    shape: n.settings.shape,
    brightness: n.settings.state.tweak.brightness,
    spinRate: n.settings.state.tweak.spinRate,
    gravity: n.settings.state.gravity,
    stars: n.settings.state.display.stars,
    savedShape: raw.shape,
    colorMode: n.settings.state.colorMode,
    savedColorMode: raw.colorMode,
    btnOn:[...document.querySelectorAll('.st-seg[data-seg=shape] button')].filter(b=>b.classList.contains('on')).map(b=>b.textContent),
    colorBtnOn:[...document.querySelectorAll('.st-seg[data-seg=color] button')].filter(b=>b.classList.contains('on')).map(b=>b.textContent),
  };
})()`)
console.log('  ', JSON.stringify(afterReset))
check('恢复后 isDefault = true', afterReset.isDefault === true)
check('形态回到 spiral', afterReset.shape === 'spiral')
// 注意默认值是 TWEAKABLE.brightness.def = 1.0（不是 0.58 —— 那是 bloomStrength）
check('参数回到默认 1.0', Math.abs(afterReset.brightness - 1.0) < 1e-9, String(afterReset.brightness))
check('自转速度回到默认 0.011', Math.abs(afterReset.spinRate - 0.011) < 1e-9, String(afterReset.spinRate))
check('引力回到关闭', afterReset.gravity === false)
check('存档也被同步更新', afterReset.savedShape === 'spiral', String(afterReset.savedShape))
check('面板按钮高亮回到第一个', afterReset.btnOn.length === 1, afterReset.btnOn.join('/'))
// 着色模式也要跟随重置（默认 family）
check('着色模式回到默认 family', afterReset.colorMode === 'family', String(afterReset.colorMode))
check('存档里的着色模式也被重置', afterReset.savedColorMode === 'family', String(afterReset.savedColorMode))
check('着色按钮高亮回到「按知识族」', afterReset.colorBtnOn.length === 1 && afterReset.colorBtnOn[0] === '按知识族',
  afterReset.colorBtnOn.join('/') || '(无高亮)')

/* ═══════ 8. 清场（不要给下次运行留脏存档） ═══════ */
await evaluate(`(()=>{ const n=window.__nebula;
  n.settings.clearStorage(); n.settings.resetAll(); return 1 })()`)

console.log('\n=== 9. 控制台错误 ===')
const errs = await evaluate(`(()=>window.__errs||[])()`)
console.log('  ', JSON.stringify(errs))
check('无控制台错误', errs.length === 0, `${errs.length} 条`)

const failed = results.filter((r) => !r.ok)
console.log(`\n${'='.repeat(56)}`)
console.log(`结果：${results.length - failed.length} / ${results.length} 通过`)
if (failed.length) {
  console.log('失败项:')
  for (const f of failed) console.log(`  · ${f.name} — ${f.detail}`)
}
console.log('='.repeat(56))

ws.close()
cp.kill()
await sleep(500)
process.exit(failed.length ? 1 : 0)
