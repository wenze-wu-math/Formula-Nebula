// 判定"瞄准 A 却选中 B"是否为正确的遮挡行为：
// 沿射线看，B 若确实比 A 更近且命中像素不透明，选中 B 就是对的。
import { spawn } from 'node:child_process'
import { resolve } from 'node:path'
import { tmpdir } from 'node:os'
import { setTimeout as sleep } from 'node:timers/promises'
import { requireChrome } from './_chrome.mjs'

const CHROME = requireChrome()
const URL = process.env.URL || 'http://localhost:5176/'
const PORT = 9228
const profile = resolve(tmpdir(), 'nebula-cdp-p6' + '-' + process.pid)

const cp = spawn(CHROME, [
  '--headless=new', '--no-sandbox', '--disable-gpu-sandbox',
  '--enable-unsafe-swiftshader', '--use-gl=angle', '--use-angle=swiftshader',
  '--window-size=1600,1000',
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
const send = (method, params = {}) => {
  const id = ++msgId
  return new Promise((rs, rj) => {
    pending.set(id, { resolve: rs, reject: rj })
    ws.send(JSON.stringify({ id, method, params }))
  })
}
async function evaluate(expression) {
  const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })
  if (r.exceptionDetails) throw new Error('异常: ' + JSON.stringify(r.exceptionDetails.exception?.description))
  return r.result.value
}

await send('Runtime.enable')
await send('Log.enable')

/* 收集控制台错误。加这个是因为"退出码恒为 0"那件事的教训：
 * 一个检查器必须能区分"检查通过"和"页面根本没跑起来"。
 * 页面里的异常往往不影响拾取结果（比如某个可选模块挂了），
 * 但那就说明这次检查测的不是正常状态的页面。 */
const consoleErrors = []
ws.addEventListener('message', (ev) => {
  let m
  try { m = JSON.parse(ev.data) } catch { return }
  if (m.method === 'Runtime.exceptionThrown') {
    const d = m.params?.exceptionDetails
    consoleErrors.push('未捕获异常: ' + (d?.exception?.description || d?.text || '?'))
  }
  if (m.method === 'Runtime.consoleAPICalled' && m.params?.type === 'error') {
    consoleErrors.push('console.error: ' +
      (m.params.args || []).map((a) => a.value ?? a.description ?? '').join(' '))
  }
})

for (let i = 0; i < 600; i++) {
  try {
    const d = await evaluate(`(()=>{const e=document.getElementById('diag');return e?e.textContent:''})()`)
    if (d && JSON.parse(d).built > 0) break
  } catch {}
  await sleep(1000)
}
await evaluate(`(()=>{window.__nebula.scene.controls.autoRotate=false;window.__nebula.scene.stop();return 1})()`)
await sleep(400)

// 对每个公式采样一个实心像素，做拾取，并判定结果是否合法：
//   合法 = resolved 就是自己，或者 resolved 在射线序列里比自己更近且不透明
//
// ⚠ 注意：公式在会自转的 nodeGroup 里，sprite.position 是**局部**坐标。
//   投影到屏幕前必须先乘上组的 matrixWorld，否则整个测试的瞄准点全是错的。
const report = await evaluate(`(()=>{
  const n = window.__nebula, s = n.scene, cam = s.camera;
  const grp = s.nodeGroup;
  const out = {测试数:0, 直接命中:0, 合法遮挡:0, 非法:0, 非法明细:[]};

  const worldOf = (m) => m.position.clone().applyMatrix4(grp.matrixWorld);
  const worldQuatOf = (m) => {
    const q = new (m.quaternion.constructor)();
    grp.getWorldQuaternion(q);
    return q.multiply(m.quaternion);
  };

  for (const node of n.graph.nodes) {
    const m = node.sprite;
    if (!m) continue;
    /* ⚠ 跳过猜想星团节点。
     *   本脚本假定所有公式都挂在 nodeGroup 下、sprite.position 是
     *   **相对 nodeGroup 原点**的局部坐标。星团节点挂在 clusterGroup 下，
     *   它的 position 是相对**球心**的 —— 用 grp.matrixWorld 去变换它，
     *   等于把球心当成了星系原点，算出的屏幕坐标全是错的，
     *   于是"瞄准点"落在空处、射线打不到东西，报一堆假失败。
     *   星团的拾取由 verify-cluster.mjs 单独覆盖。
     *
     * ⚠⚠ 这段注释在**模板字符串内部**，不能出现反引号（会截断字符串，
     *     报 "missing ) after argument list"）。我刚踩过一次。 */
    if (node.cluster) continue;
    const c = worldOf(m).project(cam);
    if (Math.abs(c.x)>0.72 || Math.abs(c.y)>0.72 || c.z>1) continue;

    const img = m.material.map && m.material.map.image;
    if (!img) continue;

    // 取一个"确实实心"的纹素作为瞄准点。
    //
    // ⚠ 两个坑：
    //  ① 不能用降采样后取最大 alpha 再反推 UV —— 24×24 的量化误差有 1/24，
    //     落在笔画之间的空隙里，于是"瞄准点其实是透明的"，测出一堆假失败。
    //  ② 也不能分别取 x 中位数和 y 中位数拼成一个点 —— 字形的实心纹素集合
    //     不是矩形，两个中位数凑出来的坐标通常落在字缝里（alpha=0）。
    //     必须直接从实心纹素里**挑一个真实的点**。
    //   挑最接近实心区域质心的那个，能稳定落在笔画实体内部。
    const iw = img.width, ih = img.height;
    if (!iw || !ih) continue;
    const cv = document.createElement('canvas');
    cv.width = iw; cv.height = ih;
    const ctx = cv.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(img, 0, 0);
    const d = ctx.getImageData(0, 0, iw, ih).data;

    // 收集实心纹素，同时求质心
    let solidCount = 0, sx = 0, sy = 0;
    let bestX = -1, bestY = -1, bestD = Infinity;
    for (let iy = 0; iy < ih; iy++) {
      for (let ix = 0; ix < iw; ix++) {
        if (d[(iy * iw + ix) * 4 + 3] < 200) continue;
        solidCount++; sx += ix; sy += iy;
      }
    }
    if (solidCount < 4) continue;            // 几乎全透明的纹理，跳过
    const cx0 = sx / solidCount, cy0 = sy / solidCount;
    for (let iy = 0; iy < ih; iy++) {
      for (let ix = 0; ix < iw; ix++) {
        if (d[(iy * iw + ix) * 4 + 3] < 200) continue;
        const dd = (ix - cx0) ** 2 + (iy - cy0) ** 2;
        if (dd < bestD) { bestD = dd; bestX = ix; bestY = iy; }
      }
    }
    // 该纹素本身就是实心的（上面只从 alpha≥200 的纹素里挑），
    // 而产品读的也正是这一个纹素，所以无需再做邻域检查。

    // 纹素中心 → UV（注意纹理 v 轴与画布 y 轴相反）
    const bu = (bestX + 0.5) / iw, bv = 1 - (bestY + 0.5) / ih;

    const gp = m.geometry.parameters;
    const lx=(bu-0.5)*gp.width, ly=(bv-0.5)*gp.height;
    const p=worldOf(m);
    const wq=worldQuatOf(m);
    const right=new p.constructor(1,0,0).applyQuaternion(wq).multiplyScalar(lx);
    const up=new p.constructor(0,1,0).applyQuaternion(wq).multiplyScalar(ly);
    p.add(right).add(up);
    const ndc=p.clone().project(cam);
    if(Math.abs(ndc.x)>0.92||Math.abs(ndc.y)>0.92) continue;

    out.测试数++;
    // 命中序列要取够长：257 个公式堆在同一张盘上，一条射线可能穿过十几张平面，
    // 只取前 6 个会把 resolved 截断在列表外，导致合法遮挡被误判成非法。
    const r = s.__pickAt(ndc.x, ndc.y, 64);
    if (!r.resolved) { out.非法++; out.非法明细.push({目标:node.name, 结果:'(无命中)', hits:r.hits}); continue; }
    if (r.resolved === node.id) { out.直接命中++; continue; }

    // 判定遮挡合法性
    const hits = r.hits || [];
    const myIdx = hits.findIndex(h=>h.id===node.id);
    const resIdx = hits.findIndex(h=>h.id===r.resolved);
    const resHit = hits[resIdx];
    if (resHit && resHit.opaque && (myIdx === -1 || resIdx < myIdx)) {
      out.合法遮挡++;
    } else {
      out.非法++;
      out.非法明细.push({目标:node.name, 结果:r.resolved, hits});
    }
  }
  return out;
})()`)

console.log('=== 拾取合法性判定（含遮挡）===')
/* ⚠ "测试公式数"不是公式总数，别拿它跟 464 / 405 比。
 *   循环里有两道过滤（见上面 for 内的 continue）：
 *     ① 跳过猜想星团节点（它们挂在 clusterGroup 下，坐标系不同；
 *        星团拾取由 verify-cluster.mjs 覆盖）
 *     ② 跳过投影后落在屏幕中央 72% 区域**之外**的节点
 *        （边缘的瞄准点在无头窗口外，派发鼠标事件也点不到）
 *   实测分解（1600×1000 默认取景）：
 *       总节点 464 − 星团 59 = 主星系 405
 *       405 − 屏幕外 102 = 303  ← 就是这个数
 *
 *   ⚠⚠ 303 恰好等于 **v1 的公式总数**（v1 是 303 个公式、没有星团），
 *      这是个纯粹的巧合，但极易误导：看到 303 会以为脚本还在测 v1 的数据、
 *      或者以为新加的 102 个公式没被覆盖。
 *      实际是 405 − 102 = 303，而 v1 是 303 − 0 = 303，两条路径撞在同一个数上。
 *      所以这里刻意把分解过程打印出来，让"303 从哪来"一眼可见。 */
console.log(`  测试公式数   : ${report.测试数}   ← 屏幕中央可测的主星系公式（= 405 − 屏幕外，非公式总数）`)
console.log(`  直接命中     : ${report.直接命中}`)
console.log(`  合法遮挡命中 : ${report.合法遮挡}`)
console.log(`  非法         : ${report.非法}`)
if (report.非法明细.length) {
  console.log('\n非法明细:')
  for (const d of report.非法明细.slice(0, 10)) {
    console.log(`  瞄准「${d.目标}」→ ${d.结果}`)
    if (d.hits) for (const h of d.hits) console.log(`      ${h.dist}  ${h.id}  opaque=${h.opaque}`)
  }
} else {
  console.log('\n✓ 全部拾取结果合法')
}

/* ── 退出码必须反映结论 ──
 *
 * ⚠ 这里原来**无条件 process.exit(0)**。后果是：即使真的测出非法拾取，
 *   脚本也会打印"✗ 非法 N"然后**返回成功** —— run-all 汇总里显示 ✓。
 *   一个永远不会失败的检查器比没有更糟：它给出的是"已验证"的假象。
 *   （同理，它原本也没检查控制台错误与测试数是否为 0。）
 *
 * 三种情况都算失败：
 *   1. 有非法拾取
 *   2. 一个公式都没测到（说明页面没准备好 —— 空集上"0 非法"毫无意义）
 *   3. 页面报过控制台错误
 */
let bad = 0
if (report.非法 > 0) {
  console.log(`\n✗ 发现 ${report.非法} 个非法拾取`)
  bad++
}
if (report.测试数 === 0) {
  console.log('\n✗ 测试数为 0：页面可能没准备好，这次检查没有意义')
  bad++
}
const errs = consoleErrors
if (errs.length) {
  console.log(`\n✗ 控制台有 ${errs.length} 条错误：`)
  for (const e of errs.slice(0, 5)) console.log(`   ${e}`)
  bad++
}
if (!bad) console.log('\n✓ 检查通过：拾取全部合法，且真的测到了公式')

ws.close(); cp.kill(); await sleep(300); process.exit(bad ? 1 : 0)
