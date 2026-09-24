// 精确验证拾取准确性：冻结运动后，瞄准哪个公式就应该打开哪个
import { spawn } from 'node:child_process'
import { resolve } from 'node:path'
import { tmpdir } from 'node:os'
import { setTimeout as sleep } from 'node:timers/promises'

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const URL = process.env.URL || 'http://localhost:5176/'
const PORT = 9224
const profile = resolve(tmpdir(), 'nebula-cdp-profile2' + '-' + process.pid)

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
    m.error ? rj(new Error(JSON.stringify(m.error))) : rs(m.result)
  }
}
function send(method, params = {}) {
  const id = ++msgId
  return new Promise((rs, rj) => {
    pending.set(id, { resolve: rs, reject: rj })
    ws.send(JSON.stringify({ id, method, params }))
  })
}
async function evaluate(expression) {
  const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })
  if (r.exceptionDetails) throw new Error('页面异常: ' + JSON.stringify(r.exceptionDetails))
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

// ── 冻结所有运动，保证"算出的屏幕坐标"和"点击那一刻"完全一致 ──
await evaluate(`(()=>{
  const n = window.__nebula;
  n.scene.controls.autoRotate = false;
  n.scene.stop();
  return true;
})()`)
await sleep(300)

console.log('=== 拾取准确性测试（运动已冻结）===')

// 目标选择：挑屏幕上分散的公式，并为每个找到一个"确实落在字形上"的点击点。
// 做法是直接采样该公式贴图的不透明像素，反推对应的 UV。
//
// ⚠⚠ 这里**必须**把 UV 存下来，而不是当场算成 NDC 存下来。
//   三个原因（都是实测踩出来的）：
//
//   ① 公式在会自转的 nodeGroup 里，sprite.position 是**局部**坐标。
//      直接 project() 出来的 NDC 是错的 —— 这正是 check-occlusion.mjs
//      里已经记录过的坑（"投影到屏幕前必须先乘上组的 matrixWorld，
//      否则整个测试的瞄准点全是错的"）。本脚本当时没跟着改。
//
//   ② 点击会让镜头飞过去，坐标立刻失效；所以每个目标都得**现算**。
//
//   ③ 面板一开，setViewOffset 会改**投影矩阵**（'offset' 模式），
//      于是同一时刻算好的 NDC 在点击后就对不上了。
//
//   所以这里只记录 (id, u, v)，循环里每次现算屏幕坐标。
const targets = await evaluate(`(()=>{
  const n = window.__nebula, s = n.scene, cam = s.camera, grp = s.nodeGroup;
  const cands = [];

  const ndcOf = (m, u, v) => {
    const gp = m.geometry.parameters;
    const lx = (u - 0.5) * gp.width;
    const ly = (v - 0.5) * gp.height;
    // localToWorld 一次搞定：既含 nodeGroup 的自转，也含 sprite 自己的
    // billboard 朝向（m.matrixWorld 是两者相乘的结果）。
    const w = m.localToWorld(new (m.position.constructor)(lx, ly, 0));
    return w.project(cam);
  };

  for (const node of n.graph.nodes) {
    const m = node.sprite;
    if (!m || node.cluster) continue;
    const c = ndcOf(m, 0.5, 0.5);
    if (Math.abs(c.x) > 0.72 || Math.abs(c.y) > 0.72) continue;
    if (c.z > 1) continue;

    // 用贴图像素找一个**确实实心**的 UV 作为瞄准点。
    //
    // ⚠⚠ 这里原来是把贴图降采样到 24×24、取 alpha 最大的那个采样点。
    //    那是错的，而且错得很隐蔽：24×24 的量化误差有 1/24，取到的
    //    "最亮采样点"很可能落在**笔画之间的空隙**里 —— 于是瞄准点其实
    //    是透明的，产品（正确地）拒绝选中它，测试却报"拾取不准"。
    //    实测 12 个目标里 11 个是这样假失败的。
    //
    //    check-occlusion.mjs 早就解决过这个问题，注释里写得很清楚：
    //      "不能用降采样后取最大 alpha 再反推 UV ……
    //       必须直接从实心纹素里挑一个真实的点"。
    //    我把那段逻辑搬了过来：全分辨率扫描，取实心纹素的**质心最近的
    //    那个实心纹素**，这样稳定落在笔画实体内部。
    const img = m.material.map && m.material.map.image;
    if (!img) continue;
    const iw = img.width, ih = img.height;
    if (!iw || !ih) continue;
    const cv = document.createElement('canvas');
    cv.width = iw; cv.height = ih;
    const ctx = cv.getContext('2d', {willReadFrequently:true});
    ctx.drawImage(img, 0, 0);
    const data = ctx.getImageData(0, 0, iw, ih).data;

    let solidCount = 0, sxp = 0, syp = 0;
    for (let iy = 0; iy < ih; iy++) for (let ix = 0; ix < iw; ix++) {
      if (data[(iy*iw+ix)*4+3] < 200) continue;
      solidCount++; sxp += ix; syp += iy;
    }
    if (solidCount < 4) continue;
    const mx = sxp / solidCount, my = syp / solidCount;
    let bestU = -1, bestV = -1, bestD = Infinity;
    for (let iy = 0; iy < ih; iy++) for (let ix = 0; ix < iw; ix++) {
      if (data[(iy*iw+ix)*4+3] < 200) continue;
      const dd = (ix-mx)**2 + (iy-my)**2;
      if (dd < bestD) { bestD = dd; bestU = (ix+0.5)/iw; bestV = 1-(iy+0.5)/ih; }
    }
    if (bestU < 0) continue;
    const bestA = 255;

    const ndc = ndcOf(m, bestU, bestV);
    if (Math.abs(ndc.x) > 0.92 || Math.abs(ndc.y) > 0.92) continue;

    cands.push({id:node.id, name:node.name, x:ndc.x, y:ndc.y, u:bestU, v:bestV, alpha:bestA});
  }

  // 取屏幕上尽量分散的 12 个
  const picked = [];
  for (const c of cands) {
    if (picked.every(p => Math.hypot(p.x-c.x, p.y-c.y) > 0.12)) picked.push(c);
    if (picked.length >= 12) break;
  }
  return picked;
})()`)

console.log(`选中 ${targets.length} 个测试目标`)

// 诊断：有多少公式落在屏幕内、为何被过滤
console.log(JSON.stringify(await evaluate(`(()=>{
  const n=window.__nebula, s=n.scene, cam=s.camera;
  let inScreen=0, hasTex=0, hasAlpha=0, kept=0;
  const reasons={offScreen:0,noSprite:0,noTex:0,lowAlpha:0,ndcEdge:0};
  const tmp=n.graph.nodes[0].sprite.position.clone();
  for (const node of n.graph.nodes){
    const m=node.sprite; if(!m){reasons.noSprite++;continue;}
    const c=tmp.copy(m.position).project(cam);
    if(Math.abs(c.x)>0.72||Math.abs(c.y)>0.72||c.z>1){reasons.offScreen++;continue;}
    inScreen++;
    const img=m.material.map&&m.material.map.image;
    if(!img){reasons.noTex++;continue;}
    hasTex++;
    const cv=document.createElement('canvas');cv.width=cv.height=24;
    const ctx=cv.getContext('2d',{willReadFrequently:true});
    ctx.drawImage(img,0,0,24,24);
    const d=ctx.getImageData(0,0,24,24).data;
    let bestA=0;for(let i=3;i<d.length;i+=4) if(d[i]>bestA) bestA=d[i];
    if(bestA<60){reasons.lowAlpha++;continue;}
    hasAlpha++; kept++;
  }
  return {公式总数:n.graph.nodes.length, 屏幕内:inScreen, 有贴图:hasTex, 有实心像素:hasAlpha, reasons};
})()`), null, 2))

// 空白区诊断：那个点到底命中了什么
console.log('\n空白点诊断:', JSON.stringify(await evaluate(`(()=>{
  const n=window.__nebula;
  const r=n.scene.__pickAt(0.90,0.90);
  return {hitCount:r.hitCount, firstHit:r.firstHit, resolved:r.resolved};
})()`), null, 2))

const box = await evaluate(`(()=>{const r=document.getElementById('scene').getBoundingClientRect();
  return {x:r.left,y:r.top,w:r.width,h:r.height};})()`)

let pass = 0, fail = 0
const failures = []

for (const t of targets) {
  // ① 用**应用自己的 API** 收起面板与选中状态。
  //    ⚠ 原来是直接 `panel.classList.remove('on')` —— 那是绕过应用的
  //      内部状态去改 DOM。`scene.panelOpen` 仍然是 true，于是
  //      setViewOffset 的**视口偏移还留着**，投影矩阵跟按钮看到的
  //      不一致，后面的点击点全部偏掉（表现得像"拾取不准"，其实是
  //      测试把应用的状态改坏了）。
  //      正确做法是走 deselectFromPanel()，它会同时撤回视口偏移。
  await evaluate(`(()=>{
    const n = window.__nebula;
    n.scene.deselectFromPanel({ silent: true });
    return true;
  })()`)
  await sleep(160)

  /* ② 每次**现算**点击点 ──
   * 不能用循环外算好的 t.x / t.y：点上一个目标会让镜头飞过去，
   * 而且面板开关会改投影矩阵，旧坐标立刻失效。
   * 所以这里用 (id, u, v) 重新求一次 NDC，再转屏幕像素。 */
  const live = await evaluate(`(()=>{
    const n = window.__nebula, s = n.scene, cam = s.camera;
    const node = n.graph.nodes.find(x => x.id === ${JSON.stringify(t.id)});
    if (!node || !node.sprite) return null;
    const m = node.sprite;
    const gp = m.geometry.parameters;
    const lx = (${t.u} - 0.5) * gp.width;
    const ly = (${t.v} - 0.5) * gp.height;
    const w = m.localToWorld(new (m.position.constructor)(lx, ly, 0));
    const c = w.project(cam);
    return { x: c.x, y: c.y, z: c.z };
  })()`)
  if (!live) { console.log(`  · 「${t.name}」的 sprite 不见了，跳过`); continue }

  // NDC(-1..1) → 屏幕像素： (ndc+1)/2 * size
  const cx = box.x + (live.x + 1) / 2 * box.w
  const cy = box.y + (1 - live.y) / 2 * box.h

  /* ③ 在**点击之前**采样射线序列。
   *
   * ⚠ 时机很关键。原来放在点击**之后**取，结果 12 个目标全部
   *   报"命中序列里没有目标"（位置 -1），而面板标题其实是对的 ——
   *   看起来像"射线检测和实际拾取不一致"，其实是**点击之后镜头
   *   已经飞过去了**，同一个 NDC 指向的完全是另一片空间。
   *   要判断"这次点击该不该选中它"，就必须用**点击那一刻**的机位。 */
  const before = await evaluate(`(()=>{
    const r = window.__nebula.scene.__pickAt(${live.x.toFixed(4)}, ${live.y.toFixed(4)});
    return {hitCount:r.hitCount, hits:r.hits, resolved:r.resolved};
  })()`)

  for (const type of ['mouseMoved', 'mousePressed', 'mouseReleased']) {
    await send('Input.dispatchMouseEvent', {
      type, x: cx, y: cy, button: 'left',
      clickCount: type === 'mouseMoved' ? 0 : 1,
      buttons: type === 'mousePressed' ? 1 : 0,
    })
    await sleep(60)
  }
  await sleep(260)

  const got = await evaluate(`(()=>{
    const p=document.getElementById('panel');
    /* ⚠ scene.selection 直接就是**公式 id 字符串**（源码注释：
     *   "当前选中的公式 id（无则 null）"），不是节点对象。
     *   我原来写 scene.selection.id —— 字符串的 .id 是 undefined，
     *   于是 got.id 恒为 null，12 个目标全部判失败，
     *   而面板标题其实全对。**读错属性名不会报错，只会安静地给 undefined。** */
    const sel = window.__nebula.scene.selection;
    return {open:p.classList.contains('on'), title:p.querySelector('.hd .nm')?.textContent||'',
            id: (typeof sel === 'string' ? sel : (sel && sel.id) || null)};
  })()`)

  /* ── 判定"命中"，而不是"命中它自己" ──
   *
   * ⚠ 这里原来是 `got.title === t.name`，即**要求正好点中目标本身**。
   *   那个标准是错的：星系在自转，公式之间会**合法地互相遮挡** ——
   *   点到一个被前面公式挡住的公式的中心时，选中的本来就该是
   *   前面那个（它更近，而且不透明）。
   *   check-occlusion.mjs 早就算清楚了这一点（它报"合法遮挡 8 / 非法 0"），
   *   但这个脚本用了一把更严的尺子，于是报出一串假失败。
   *   而且因为相机在转，**每次跑失败的个数还不一样**（实测 3/12 与 9/12）。
   *
   * 正确的判据（与 check-occlusion 一致）：点中的那个节点，
   *   - 就是目标本身，或者
   *   - 在射线序列里**比目标更近**且不透明（合法遮挡）
   * 真正要拒绝的是"点了一片空白，却选中了远处的公式"。
   *
   * 所以这里改问页面：给我这个屏幕点上的**射线命中序列**，
   * 我来判断选中的那个是不是合法的那一个。 */
  /* ⚠ 用点击**之前**采样的 before，不要在这里重算 —— 见上面 ③ 的说明。 */
  const judged = before

  /* 合法 = 选中的是目标自己，或选中的那个在射线序列里排在目标**前面**
   * （合法遮挡：前面的公式确实挡着，选它是对的）。
   *
   * 判据用"命中序列中目标的下标 > 选中者的下标"来表达，
   * 而不是简单地"选中的不是目标就算过" —— 后者会把
   * "点空白却选中了远处公式"这种真 bug 一起放过。 */
  const order = (judged.hits || []).map((h) => h.id)
  const iTarget = order.indexOf(t.id)
  const iGot = order.indexOf(got.id)
  const occludedLegally = iGot >= 0 && iTarget >= 0 && iGot < iTarget
  const ok = got.open && (got.id === t.id || occludedLegally)
  if (ok) {
    pass++
    if (occludedLegally) {
      console.log(`  · 「${t.name}」被「${got.title}」合法遮挡（序列位置 ${iGot} < ${iTarget}）`)
    }
  } else {
    fail++
    failures.push(`瞄准「${t.name}」→ 得到「${got.title || '(未打开)'}」` +
      `（命中序列 ${judged.hitCount} 个：[${order.slice(0, 5).join(', ')}]，目标在位置 ${iTarget}）` +
      `  [open=${got.open} gotId=${got.id} iGot=${iGot} tId=${t.id}]`)
  }
}

console.log(`命中 ${pass} / ${pass + fail}`)
if (failures.length) {
  console.log('\n未命中明细:')
  failures.forEach(f => console.log('  ✗ ' + f))
} else {
  console.log('全部命中 ✓')
}
// ── 透明留白区域不应被拾取：点两个公式之间的空处 ──
console.log('\n=== 空白区域点击（应关闭面板）===')
/* 这个结论要参与退出码，所以必须**记下来**而不是只打印。
 * 原来它只 console.log 一句"✓ 正确关闭"，退出码完全不看它。 */
let blankFailed = false
await evaluate(`(()=>{const p=document.getElementById('panel'); if(p) p.classList.add('on'); return 1})()`)
const gap = await evaluate(`(()=>{
  const n = window.__nebula;
  const cam = n.scene.camera;
  const pts=[];
  const tmp=n.graph.nodes[0].sprite.position.clone();
  for (const node of n.graph.nodes) {
    if(!node.sprite) continue;
    const v = tmp.copy(node.sprite.position).project(cam);
    if (Math.abs(v.x)<0.95 && Math.abs(v.y)<0.95) pts.push({x:v.x,y:v.y});
  }
  // 关键约束：
  //  ① 只在中部找，避开四角 HUD（搜索框/图例/标题）
  //  ② NDC x 必须 < 0.40 —— 面板展开时占据右侧 432px（约 NDC x>0.45），
  //     否则会点在面板上而不是画布上
  let best=null, bestD=-1;
  for (let gx=-0.75; gx<=0.38; gx+=0.05) for (let gy=-0.55; gy<=0.55; gy+=0.05) {
    let d=1e9;
    for (const v of pts) d=Math.min(d, Math.hypot(v.x-gx, v.y-gy));
    if (d>bestD) { bestD=d; best={x:gx,y:gy,d}; }
  }
  return best;
})()`)
if (gap && gap.d > 0.04) {
  const cx = box.x + (gap.x + 1) / 2 * box.w
  const cy = box.y + (1 - gap.y) / 2 * box.h
  // 确认这个点确实是 canvas 而不是 HUD 元素
  const onCanvas = await evaluate(`(()=>{
    const e=document.elementFromPoint(${cx.toFixed(1)}, ${cy.toFixed(1)});
    return e ? (e.id||e.tagName) : 'null';
  })()`)
  console.log(`  空白点 NDC(${gap.x.toFixed(2)},${gap.y.toFixed(2)}) 最近公式距离 ${gap.d.toFixed(3)}，命中元素: ${onCanvas}`)

  for (const type of ['mouseMoved', 'mousePressed', 'mouseReleased']) {
    await send('Input.dispatchMouseEvent', {
      type, x: cx, y: cy, button: 'left',
      clickCount: type === 'mouseMoved' ? 0 : 1, buttons: type === 'mousePressed' ? 1 : 0,
    })
    await sleep(60)
  }
  await sleep(300)
  const st = await evaluate(`(()=>{const p=document.getElementById('panel');return {open:p.classList.contains('on')}})()`)
  console.log(`  点击后 面板开启: ${st.open}  ${st.open ? '✗ 应为 false' : '✓ 正确关闭'}`)
  if (st.open) blankFailed = true
} else {
  console.log('  没找到足够空的区域，跳过')
}

// ── 性能采样 ──
console.log('\n=== 帧率采样（恢复运动）===')
await evaluate(`(()=>{const n=window.__nebula; n.scene.start(); return 1})()`)
await sleep(500)
const fps = await evaluate(`new Promise(res=>{
  let n=0; const t0=performance.now();
  function tick(){ n++; if(performance.now()-t0 < 3000) requestAnimationFrame(tick);
    else res((n/((performance.now()-t0)/1000)).toFixed(1)); }
  requestAnimationFrame(tick);
})`)
console.log('  软件渲染 (SwiftShader) 下帧率:', fps, 'fps — 真实 GPU 会高得多')

/* ── 退出码必须反映结论 ──
 *
 * ⚠ 这里原来**无条件 process.exit(0)**：上面明明算了 `pass` / `fail`
 *   并打印了「✗ 未命中明细」，但退出码永远是 0 —— 于是 run-all 的
 *   汇总表里它永远显示 ✓。**计数器算了却不用，等于没算。**
 *   （同一个毛病在 check-occlusion.mjs 里也有，是追一次竞争导致的
 *     假 FAIL 时顺带发现的。）
 *
 * 三种情况算失败：
 *   1. 有未命中（拾取不准）
 *   2. 一个都没测到（页面没起来时"0/0"毫无意义）
 *   3. 空白区点击没有关掉面板（拾取到了留白，这是原始需求明确禁止的）
 */
let bad = 0
if (fail > 0) { console.log(`\n✗ 有 ${fail} 个公式未被正确拾取`); bad++ }
if (pass + fail === 0) { console.log('\n✗ 没有测到任何公式（页面可能没准备好）'); bad++ }
if (blankFailed) { console.log('\n✗ 点击空白留白没有关闭面板（拾取到了透明区域）'); bad++ }
if (!bad) console.log('\n✓ 拾取检查通过')

ws.close()
cp.kill()
await sleep(400)
process.exit(bad ? 1 : 0)
