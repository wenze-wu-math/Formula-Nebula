/**
 * 验证「点击公式 → 视角中心移过去；换一个 → 跟着换；退出 → 回到最初」。
 *
 * 断言：
 *   1. 初始时相机停在 applyCameraFit 记下的"初始机位"上（homeCam 有值且一致）
 *   2. 点中一个公式后，controls.target **移动到该公式的世界坐标附近**
 *      （不是只开面板不动相机 —— 那是改动前的行为）
 *   3. 相机与目标的距离收敛到 INTERACTION.focusDistance 量级（真的"飞过去"了）
 *   4. 面板里跳到另一个公式 → 中心跟着换到新公式（而不是停在旧的上）
 *   5. 关闭面板（✕）→ 相机回到初始机位
 *   6. 点空白处 → 同样回到初始机位
 *   7. 聚焦后仍然能缩放（滚轮不被每帧的插值撤销）
 *   8. 自转状态正确恢复（面板关掉后星系要继续转，不能永久停住）
 *   9. 无控制台错误
 *
 * 关键做法：全部用**数值断言**（camera.position / controls.target），
 * 不靠截图 —— 视角变化在截图上要靠人眼判断，而数值是确定性的。
 */
import { spawn } from 'node:child_process'
import { resolve } from 'node:path'
import { mkdirSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { setTimeout as sleep } from 'node:timers/promises'

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const URL = process.env.URL || 'http://localhost:5176/'
const PORT = Number(process.env.PORT || 9261)
const OUT = resolve('shots')
mkdirSync(OUT, { recursive: true })

const profile = resolve(tmpdir(), `nebula-camfocus-${PORT}`)

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

// 冻结星系自转：自转会让"算坐标 → 派发点击"之间目标自己移开，点击就落空了
// （这是测试方法问题，不是代码 bug —— 同样的坑 verify-focus-links.mjs 也踩过）。
//
// ⚠ 这里**不能**用 n.scene.stop() 来冻结：停掉 render loop 之后相机动画
//   也不再推进，本脚本要验证的东西就全测不到了。改自转速率即可 ——
//   它每帧现读 MOTION.spinRate（见 updateMotion），所以改完立刻生效，
//   而 render loop 继续跑。
const SPIN_BAK = await evaluate(`(()=>{const n=window.__nebula;
  n.scene.controls.autoRotate=false;
  const bak=n.settings.state.tweak.spinRate;
  n.settings.setTweak('spinRate', 0);
  return bak })()`)
console.log(`  自转已临时冻结（原值 ${SPIN_BAK}）`)
await sleep(1200)

const results = []
function check(name, ok, detail) {
  results.push({ name, ok, detail })
  console.log(`  ${ok ? '通过' : '失败'}  ${name}${detail ? ' — ' + detail : ''}`)
}

const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2])

/** 读相机状态 */
const CAM = `(()=>{
  const n=window.__nebula, c=n.scene.camera, ct=n.scene.controls;
  const p=c.position, t=ct.target;
  return {
    pos:[p.x,p.y,p.z], target:[t.x,t.y,t.z],
    dist: p.distanceTo(t),
    mode: n.scene.focusMode,
    settled: n.scene.focusSettled,
    home: n.scene.homeCamera,
    sel: n.scene.selection,
  };
})()`

/** 立刻算出某公式的当前世界坐标（不依赖相机动画） */
const worldOf = (id) => evaluate(`(()=>{
  const n=window.__nebula, node=n.graph.byId.get(${JSON.stringify(id)});
  const v=node.sprite.position.clone().applyMatrix4(n.scene.nodeGroup.matrixWorld);
  return [v.x,v.y,v.z];
})()`)

/** 轮询直到相机收敛（不睡眠固定时长 —— headless 只有 ~5FPS） */
async function waitSettled(checkFn, maxMs = 180000) {
  const t0 = Date.now()
  let last = null
  while (Date.now() - t0 < maxMs) {
    last = await evaluate(CAM)
    if (checkFn(last)) return last
    await sleep(400)
  }
  return last
}

/**
 * 等到相机**真的**停在某公式上。
 *
 * ⚠ 只等 `mode === 'node'` 是不够的：select() 会立刻把 mode 置成 'node'，
 *   那时飞入动画才刚开始，相机还在老位置。
 * ⚠ 也不能靠"中心距公式 < 某容差"来判断：盘面上公式之间本来就只隔几十个单位，
 *   相机停在原点时离目标可能才 24，宽松的容差会把"根本没动"误判成"已聚焦"。
 *   所以直接用场景自己的 focusSettled（飞入段结束的标志），
 *   再要求中心**确实贴着**这个公式。
 */
async function waitFocusedOn(id, maxMs = 25000) {
  const t0 = Date.now()
  let last = null
  while (Date.now() - t0 < maxMs) {
    last = await evaluate(CAM)
    if (last.mode === 'node' && last.sel === id && last.settled) {
      const w = await worldOf(id)
      const off = dist(last.target, w)
      // 偏移量应当约等于"面板横向补偿"，即 432/1600 × 半视宽。
      // 半视宽在 dist≈46 时约 24，所以补偿约 6.5 个单位 —— 给到 25 已经很宽松了。
      if (off < 25) return { cam: last, world: w, off }
    }
    await sleep(400)
  }
  return { cam: last, world: await worldOf(id), off: last ? dist(last.target, await worldOf(id)) : NaN }
}

console.log('\n=== 1. 初始机位已记录 ===')
const cam0 = await evaluate(CAM)
console.log('  ', JSON.stringify({ pos: cam0.pos.map(v => +v.toFixed(2)), mode: cam0.mode }))
check('启动后记录了初始机位', !!cam0.home, cam0.home ? `pos=${cam0.home.pos.map(v => +v.toFixed(1))}` : 'null')
check('未聚焦时 focusMode=null', cam0.mode === null, `mode=${cam0.mode}`)
const HOME = cam0.home

console.log('\n=== 2. 点一个公式 → 视角中心移过去 ===')

/**
 * 找一个**稳妥可点**的目标，并且用"真派发点击 + 看选中结果"来自证。
 *
 * ⚠ 这里踩过一个坑，值得写下来：最初是"挑最靠画面中心的公式，算出它某个
 *   实心像素的 NDC，再折算成屏幕坐标去派发点击"。结果 pointermove 能命中
 *   （tip 显示了 show:scheme），pointerup 却落空 → 选中被判成 null。
 *   原因：公式在屏幕上只有十几像素高（见 README「为什么字这么小」），
 *   而 Chrome 对同一个 `Input.dispatchMouseEvent(x=818.7)` 生成的
 *   pointer 事件报 819、mouse 事件报 818 —— **1px 之差**就足以让射线从
 *   字形滑到透明留白上。而 pointerup 处理器用的是 pointer 事件的坐标。
 *
 *   所以不再"算一个点就假定能点中"，而是：
 *     ① 按"屏幕上越大越稳"排序候选；
 *     ② 每个候选在 NDC 上试一小片偏移（字形笔画有粗细，总有落点实心）；
 *     ③ 真派发点击，**确认 scene.selection === 该公式**才算找到。
 *   这样脚本不会因为 1px 的舍入把产品行为误判成 bug。
 */
const box = await evaluate(`(()=>{const r=document.getElementById('scene').getBoundingClientRect();
  return {left:r.left, top:r.top, w:r.width, h:r.height}})()`)

const cands = await evaluate(`(()=>{
  const n = window.__nebula, cam = n.scene.camera;
  const box = document.getElementById('scene').getBoundingClientRect();
  const out = [];
  for (const node of n.graph.nodes) {
    const m = node.sprite; if(!m) continue;
    const c = m.position.clone().project(cam);
    // 靠画面中心一些、别贴边（贴边会被面板/边缘裁掉）
    if (Math.abs(c.x) > 0.55 || Math.abs(c.y) > 0.55 || c.z > 1) continue;
    const gp = m.geometry.parameters;
    const pxH = gp.height / (2*Math.tan(cam.fov*Math.PI/360)
                             * m.position.distanceTo(cam.position)) * box.height;
    out.push({ id:node.id, name:node.name, degree:node.degree,
               height:node.height, pxH:+pxH.toFixed(1),
               x:+c.x.toFixed(5), y:+c.y.toFixed(5),
               d: c.x*c.x + c.y*c.y });
  }
  out.sort((a,b)=> (b.pxH - a.pxH) || (a.d - b.d));
  return out.slice(0, 60);
})()`)

if (!cands.length) { console.log('!! 屏幕上没有候选公式'); ws.close(); cp.kill(); process.exit(1) }

/** 在 NDC 上试一小片偏移（先中心，再上下左右 ±1px 量级） */
const OFFS = [[0, 0], [0, 0.0018], [0, -0.0018], [0.0018, 0], [-0.0018, 0],
              [0, 0.0036], [0, -0.0036], [0.0036, 0.0018], [-0.0036, -0.0018]]

let spot = null
outer:
for (const c of cands) {
  for (const [dx, dy] of OFFS) {
    const nx = c.x + dx, ny = c.y + dy
    // 先用与拾取完全相同的代码反查一次，避免盲试
    const r = await evaluate(`(()=>window.__nebula.scene.__pickAt(${nx}, ${ny}, 3).resolved)()`)
    if (r !== c.id) continue

    const px = box.left + (nx + 1) / 2 * box.w
    const py = box.top + (1 - ny) / 2 * box.h
    for (const type of ['mouseMoved', 'mousePressed', 'mouseReleased']) {
      await send('Input.dispatchMouseEvent', {
        type, x: px, y: py, button: 'left',
        clickCount: type === 'mouseMoved' ? 0 : 1,
        buttons: type === 'mousePressed' ? 1 : 0,
      })
      await sleep(130)
    }
    await sleep(600)
    const sel = await evaluate(`(()=>window.__nebula.scene.selection)()`)
    if (sel === c.id) { spot = { ...c, x: nx, y: ny }; break outer }
    // 落空了：清掉状态再来下一个
    await evaluate(`(()=>{ window.__nebula.scene.select(null); return 1 })()`)
    await sleep(300)
  }
}

if (!spot) { console.log('!! 试过所有候选都点不中'); ws.close(); cp.kill(); process.exit(1) }
console.log(`  目标: ${spot.name} (${spot.id}) 度数=${spot.degree} 平面高=${spot.height.toFixed(1)} 屏幕高≈${spot.pxH}px`)

const camA0 = await waitFocusedOn(spot.id)
const camA = camA0.cam
const w1 = camA0.world
console.log('  ', JSON.stringify({
  pos: camA.pos.map(v => +v.toFixed(2)), target: camA.target.map(v => +v.toFixed(2)),
  dist: +camA.dist.toFixed(2), mode: camA.mode, settled: camA.settled, sel: camA.sel,
}))

const targetMoved = dist(camA.target, cam0.target)
console.log(`  视角中心位移 ${targetMoved.toFixed(1)}（初始 ${cam0.target.map(v => +v.toFixed(1))} → 现在 ${camA.target.map(v => +v.toFixed(1))}）`)
console.log(`  该公式世界坐标 [${w1.map(v => +v.toFixed(1))}]，中心偏差 ${camA0.off.toFixed(2)}`)

check('单击后面板选中了该公式', camA.sel === spot.id, `sel=${camA.sel}`)
check('单击后进入聚焦模式', camA.mode === 'node', `mode=${camA.mode}`)
check('单击后飞入动画已到位', camA.settled === true, `settled=${camA.settled}`)
check('视角中心确实移到了该公式附近', camA0.off < 25, `偏差 ${camA0.off.toFixed(2)}`)
// 中心必须**真的离开原点**，否则"移过去"这件事根本没发生
check('视角中心确实离开了原点', targetMoved > 5, `位移 ${targetMoved.toFixed(1)}`)

console.log('\n=== 3. 真的"飞过去"了（而不是原地转视角）===')
console.log(`  相机到中心距离 ${camA.dist.toFixed(1)}（聚焦前 ${cam0.dist.toFixed(1)}）`)
check('相机被拉近（聚焦距离 < 初始距离）', camA.dist < cam0.dist * 0.6,
  `${cam0.dist.toFixed(1)} → ${camA.dist.toFixed(1)}`)

console.log('\n=== 4. 面板里跳到另一个公式 → 中心跟着换 ===')
// ⚠ 必须在**同一段脚本里**先把标题读出来再点击：btn.click() 是同步的，
//   页面上的 .hd .nm 会在 click() 返回前就被换掉，分两次 evaluate 读到的
//   永远是同一个值（这正是上一版误报"没有关联项"的原因）。
const jump = await evaluate(`(()=>{
  const p=document.getElementById('panel');
  const btn=p.querySelector('.rel'); if(!btn) return {ok:false,why:'没有关联项'};
  const before=p.querySelector('.hd .nm').textContent;
  const beforeId=window.__nebula.scene.selection;
  btn.click();
  return {ok:true, before, after:p.querySelector('.hd .nm').textContent,
          beforeId, afterId:window.__nebula.scene.selection,
          relCount:p.querySelectorAll('.rel').length};
})()`)
console.log('  ', JSON.stringify(jump))
if (jump.ok && jump.afterId && jump.afterId !== jump.beforeId) {
  const camB0 = await waitFocusedOn(jump.afterId)
  const camB = camB0.cam
  const w2 = camB0.world
  console.log(`  新公式 ${camB.sel} 世界坐标 [${w2.map(v => +v.toFixed(1))}]`)
  console.log(`  视角中心 [${camB.target.map(v => +v.toFixed(1))}]，中心偏差 ${camB0.off.toFixed(2)}`)
  check('跳转后面板换了公式', jump.before !== jump.after, `${jump.before} → ${jump.after}`)
  check('跳转后中心换到了新公式', camB0.off < 25, `偏差 ${camB0.off.toFixed(2)}`)
  check('跳转后中心确实离开了上一个公式',
    dist(camB.target, camA.target) > 5, `位移 ${dist(camB.target, camA.target).toFixed(1)}`)
  check('跳转后仍在聚焦模式', camB.mode === 'node', `mode=${camB.mode}`)
} else {
  check('跳转后中心换到了新公式', false, JSON.stringify(jump))
}

console.log('\n=== 5. 关闭面板 → 回到最初 ===')
await evaluate(`(()=>{ document.getElementById('panel').querySelector('.close').click(); return 1 })()`)
/* 等到**真的**回到初始机位（不只是 mode 变 null）。
 *
 * ⚠ 这里的等待上限必须给得很宽，因为回位是**按帧**推进的：
 *   指数逼近每帧收掉 k = 1 − 0.002^dt ≈ 27% 的剩余距离（dt 被钳在 0.05），
 *   而 scene.js 里的"超时兜底"用的也是这个被钳过的 t（2.5 秒动画时间）。
 *   无头 SwiftShader 实测只有 0.6~5 FPS：0.6 FPS 下要走完约 20 帧才收敛，
 *   也就是 **33 秒墙钟**；而 2.5 秒的动画时间要 50 帧 ≈ 83 秒。
 *   原来给 25000ms，于是在最慢的那次运行里必然假失败
 *   （真实 GPU 上几百毫秒就好了）。
 *   宁可等久一点，也不要一个会随帧率翻转的断言。 */
const camC = await waitSettled((c) => c.mode === null && dist(c.pos, HOME.pos) < 1.0, 180000)
console.log('  ', JSON.stringify({
  pos: camC.pos.map(v => +v.toFixed(2)), target: camC.target.map(v => +v.toFixed(2)),
  mode: camC.mode, sel: camC.sel,
}))
const backPos = dist(camC.pos, HOME.pos)
const backTgt = dist(camC.target, HOME.target)
console.log(`  与初始机位差：位置 ${backPos.toFixed(3)}，中心 ${backTgt.toFixed(3)}`)
check('关闭面板后相机回到初始位置', backPos < 1.0, `差 ${backPos.toFixed(3)}`)
check('关闭面板后视角中心回到原点', backTgt < 1.0, `差 ${backTgt.toFixed(3)}`)
check('关闭面板后退出聚焦模式', camC.mode === null, `mode=${camC.mode}`)
check('关闭面板后取消选中', camC.sel === null, `sel=${camC.sel}`)

console.log('\n=== 6. 自转要恢复（不能永久停住）===')
const spin = await evaluate(`(()=>{
  const n=window.__nebula;
  return { spinPaused: n.scene.spinPaused, rot: n.scene.nodeGroup.rotation.y };
})()`)
console.log('  ', JSON.stringify(spin))
check('关闭面板后自转恢复（spinPaused=false）', spin.spinPaused === false, `spinPaused=${spin.spinPaused}`)
// ⚠ 本脚本为了能点中公式把 spinRate 调成 0 了（见文件开头），
//   所以这里必须先把速率还回去，才能验证"角度确实在推进"。
await evaluate(`(()=>{ window.__nebula.settings.setTweak('spinRate', ${SPIN_BAK}); return 1 })()`)
await sleep(2500)
const spin2 = await evaluate(`(()=>window.__nebula.scene.nodeGroup.rotation.y)()`)
check('自转确实在推进（角度变化）', Math.abs(spin2 - spin.rot) > 1e-4,
  `${spin.rot.toFixed(4)} → ${spin2.toFixed(4)}`)

// 自转恢复后点击会重新变得不可靠（目标会转走），后面几节又要派发点击，
// 所以再冻一次。
await evaluate(`(()=>{ window.__nebula.settings.setTweak('spinRate', 0); return 1 })()`)
await sleep(600)

console.log('\n=== 7. 点空白处也要回位 ===')
await evaluate(`(()=>{ window.__nebula.scene.select(${JSON.stringify(spot.id)}); return 1 })()`)
const camD0 = await waitFocusedOn(spot.id)
console.log(`  重新聚焦：中心 [${camD0.cam.target.map(v => +v.toFixed(1))}]`)
const corner = { x: box.left + box.w * 0.5, y: box.top + box.h * 0.06 }
for (const type of ['mouseMoved', 'mousePressed', 'mouseReleased']) {
  await send('Input.dispatchMouseEvent', {
    type, x: corner.x, y: corner.y, button: 'left',
    clickCount: type === 'mouseMoved' ? 0 : 1,
    buttons: type === 'mousePressed' ? 1 : 0,
  })
  await sleep(120)
}
const camE = await waitSettled((c) => c.mode === null && dist(c.pos, HOME.pos) < 1.0, 180000)
const backPos2 = dist(camE.pos, HOME.pos)
console.log(`  与初始机位差：位置 ${backPos2.toFixed(3)}`)
check('点空白后取消选中', camE.sel === null, `sel=${camE.sel}`)
check('点空白后相机也回到初始位置', backPos2 < 1.0, `差 ${backPos2.toFixed(3)}`)

console.log('\n=== 8. 聚焦后仍然能缩放（滚轮不被插值撤销）===')
await evaluate(`(()=>{ window.__nebula.scene.select(${JSON.stringify(spot.id)}); return 1 })()`)
const camF0 = await waitFocusedOn(spot.id)
const camF = camF0.cam
// 等飞入段结束、转入"只跟随"的锁定段
await sleep(1500)
const dBefore = camF.dist
// 直接改相机到中心的距离（等价于滚轮缩放），看下一帧会不会被撤销。
// ⚠ 必须先把距离算出来再改位置：写成
//     c.position.copy(ct.target).addScaledVector(dir, ct.target.distanceTo(c.position)*1.4)
//   的话，参数是在 copy() 之后求值的，那时 position 已经等于 target，
//   距离恒为 0（上一版就是这么把自己坑了的）。
const zoomed = await evaluate(`(()=>{
  const n=window.__nebula, c=n.scene.camera, ct=n.scene.controls;
  const d0=c.position.distanceTo(ct.target);
  const dir=c.position.clone().sub(ct.target).normalize();
  c.position.copy(ct.target).addScaledVector(dir, d0*1.4);   // 往外拉 40%
  return {d0, d1:c.position.distanceTo(ct.target)};
})()`)
await sleep(3000)
const dAfter = await evaluate(`(()=>{const n=window.__nebula;
  return n.scene.camera.position.distanceTo(n.scene.controls.target) })()`)
console.log(`  基准 ${dBefore.toFixed(1)} → 手动拉远到 ${zoomed.d1.toFixed(1)} → 3 秒后 ${dAfter.toFixed(1)}`)
check('聚焦后缩放不会被动画撤销', dAfter > zoomed.d0 * 1.2,
  `拉远后 ${zoomed.d1.toFixed(1)}，3s 后仍有 ${dAfter.toFixed(1)}`)
await evaluate(`(()=>{ document.getElementById('panel').querySelector('.close').click(); return 1 })()`)
await sleep(500)

console.log('\n=== 9. 没选中任何东西时点空白，不该把镜头拉走 ===')
// ui.hideDetail() 是**无条件**回调 onClose 的，所以"本来就没选中"时
// deselectFromPanel 也会被调到。那时用户只是自己拖拽/滚轮看了一会儿，
// 把镜头猛地拉回初始机位是莫名其妙的 —— 只有撤销一次**程序施加的聚焦**
// 才该回位。这条就是在守这个边界。
const stray = await evaluate(`(()=>{
  const n=window.__nebula;
  n.scene.select(null);       // 确保没有选中
  return n.scene.selection })()`)
console.log(`  前置检查：selection = ${JSON.stringify(stray)}`)
await waitSettled((c) => c.mode === null, 180000)
// 手动把相机挪到一个"用户自己逛到"的位置
const wander = await evaluate(`(()=>{
  const n=window.__nebula, c=n.scene.camera;
  c.position.set(120, 40, 60);
  n.scene.controls.target.set(30, 5, 10);
  return {pos:c.position.toArray(), tgt:n.scene.controls.target.toArray()};
})()`)
await sleep(800)
// 现在点空白（此时并没有选中任何公式）
for (const type of ['mouseMoved', 'mousePressed', 'mouseReleased']) {
  await send('Input.dispatchMouseEvent', {
    type, x: corner.x, y: corner.y, button: 'left',
    clickCount: type === 'mouseMoved' ? 0 : 1,
    buttons: type === 'mousePressed' ? 1 : 0,
  })
  await sleep(120)
}
await sleep(2500)
const camG = await evaluate(CAM)
const drift = dist(camG.pos, wander.pos)
console.log(`  用户自逛机位 [${wander.pos.map(v => +v.toFixed(1))}] → 点空白后 [${camG.pos.map(v => +v.toFixed(1))}]`)
check('没选中时点空白不会把镜头拉回初始机位', drift < 5, `被拉走 ${drift.toFixed(2)}`)
check('没选中时点空白也不该进入聚焦模式', camG.mode === null, `mode=${camG.mode}`)
// 收尾：把相机手动放回初始机位，别把后面的截图弄歪。
// ⚠ 不要用 fitCamera() 复原：它会**重写 homeCam**（那是"回位目标"的定义处），
//   用一个编造的半径调它会把初始机位改坏。直接设坐标即可，homeCam 不动。
await evaluate(`(()=>{ const n=window.__nebula, c=n.scene.camera;
  c.position.set(${HOME.pos.map((v) => v.toFixed(3)).join(',')});
  n.scene.controls.target.set(${HOME.target.map((v) => v.toFixed(3)).join(',')});
  return 1 })()`)
await sleep(800)

console.log('\n=== 10. 控制台错误 ===')
const errs = await evaluate(`(()=>window.__errs||[])()`)
console.log('  ', JSON.stringify(errs.slice(0, 5)))
check('无控制台错误', errs.length === 0, errs.length + ' 条')

// 还原被临时改掉的设置，截图才是正常状态的外观。
// ⚠ 不要用 fitCamera() 复原机位：它会**重写 homeCam**（那是"回位目标"的定义处），
//   用一个编造的半径调它会把初始机位改坏。
await evaluate(`(()=>{ const n=window.__nebula;
  n.settings.setTweak('spinRate', ${SPIN_BAK});
  n.scene.select(null);
  return 1 })()`)
await waitSettled((c) => c.mode === null && dist(c.pos, HOME.pos) < 1.0, 180000)
await sleep(800)

const shot = await send('Page.captureScreenshot', { format: 'png' })
writeFileSync(resolve(OUT, 'camera-focus.png'), Buffer.from(shot.data, 'base64'))

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
