/**
 * 证明：改 status 不会移动任何节点。（第二版 —— 第一版测错了）
 *
 * ── 第一版错在哪 ──
 * 我在页面里改了 status 然后调 `rebuildLayout()`，比对 `sprite.position`，
 * 结果**464 个节点全部"移动"了** —— 包括 zariski-topology 这种与猜想
 * 毫无关系的星系节点。差点得出"status 影响布局"的结论。
 *
 * 真正的原因是：`rebuildLayout()` → `scene.rebuildNodes(baked)` 会
 * **销毁并重建全部精灵对象**。于是：
 *   · 我快照的是**旧对象**的位置
 *   · 比对的是**新对象**的位置
 *   · 两者的差异来自"重建"，不是来自 status
 * 而且新精灵刚建出来时读到的位置，可能与旧精灵经过若干帧运动后的位置
 * 不同（自转/浮动），这也混进了差异。
 *
 * 有意思的是同一份快照里 `radius / rank / theta` 是**完全没变**的 ——
 * 那才是布局的确定性输出。所以正确做法是：
 *
 *   ① 只比 `layoutGraph()` 的**纯输出**（radius / rank / theta / pos.x/y/z），
 *      这些不经过精灵、不受重建影响
 *   ② 用**同一个页面**连续跑两次 layoutGraph 作为对照（基线噪声）
 *   ③ 再改 status 跑第三次 —— 若与第二次逐位相同，就证明 status 无关
 *
 * 这样把"布局本身的重建噪声"与"status 的影响"彻底分开：
 * 如果 ② 与 ③ 完全一致，而 ② 与 ① 可能不同，说明噪声来自别处、与 status 无关。
 */
import { spawn } from 'node:child_process'
import { resolve } from 'node:path'
import { tmpdir } from 'node:os'
import { setTimeout as sleep } from 'node:timers/promises'

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const URL_ = process.env.URL || 'http://127.0.0.1:5176/'
const PORT = Number(process.env.PORT || 9381)
const profile = resolve(tmpdir(), 'nb-status2-' + process.pid)
const cp = spawn(CHROME, ['--headless=new', '--no-sandbox', '--disable-gpu-sandbox',
  '--enable-unsafe-swiftshader', '--use-gl=angle', '--use-angle=swiftshader',
  '--window-size=1600,1000', `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${profile}`, '--no-first-run', '--no-default-browser-check', URL_],
  { stdio: ['ignore', 'pipe', 'pipe'] })
cp.stderr.on('data', () => {})

let t
for (let i = 0; i < 600 && !t; i++) {
  try { const l = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json(); t = l.find(x => x.type === 'page' && x.webSocketDebuggerUrl) } catch {}
  if (!t) await sleep(500)
}
if (!t) { console.error('连不上 Chrome'); cp.kill(); process.exit(1) }
const ws = new WebSocket(t.webSocketDebuggerUrl)
await new Promise((r, j) => { ws.onopen = r; ws.onerror = j })
let id = 0; const pend = new Map()
ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) { const p = pend.get(m.id); pend.delete(m.id); m.error ? p.j(new Error(JSON.stringify(m.error))) : p.r(m.result) } }
const send = (method, params = {}) => new Promise((r, j) => { const i = ++id; pend.set(i, { r, j }); ws.send(JSON.stringify({ id: i, method, params })) })
const ev = async (expression) => {
  const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description)
  return r.result.value
}
await send('Runtime.enable')
for (let i = 0; i < 900; i++) {
  const d = await ev(`(()=>{const e=document.getElementById('diag');return e?e.textContent:''})()`).catch(() => '')
  if (d) { try { if (JSON.parse(d).built > 0) break } catch {} }
  await sleep(1000)
}
console.log('烘焙完成\n')

/* 直接跑 layoutGraph 取纯输出。它不碰精灵，所以快照是"布局的真值"。
 * 用 node.pos（世界坐标）与 radius/rank/theta 作为指纹。 */
const SNAP = `(()=>{
  const g = window.__nebula.graph;
  const out = {};
  for (const x of g.nodes) {
    out[x.id] = [
      x.pos ? [x.pos.x, x.pos.y, x.pos.z] : null,
      x.radius ?? null, x.rank ?? null, x.theta ?? null,
      x.brightness ?? null, x.sizeScale ?? null,
    ];
  }
  return out;
})()`

/* 用页面导出的 rebuildLayout 之前，先手动调 layoutGraph —— 但它不在 window 上。
 * 所以改用 rebuildLayout，但**只快照布局输出**（pos/radius/rank/theta），
 * 不看精灵。pos 是 layoutGraph 写进节点对象的，与精灵重建无关。 */
async function runLayout() {
  return await ev(`(async()=>{
    await window.__nebula.rebuildLayout();
    return true;
  })()`)
}

// ① 基线
await runLayout()
const s1 = await ev(SNAP)
// ② 原样再跑一次（对照：证明布局本身是确定性的）
await runLayout()
const s2 = await ev(SNAP)
// ③ 改掉所有猜想的状态，再跑
const changed = await ev(`(()=>{
  const ORDER = ['open','partial','proved','disproved','heuristic'];
  let c = 0;
  for (const x of window.__nebula.graph.nodes) {
    if (!x.cluster) continue;
    x.status = ORDER[(ORDER.indexOf(x.status) + 1) % ORDER.length];
    c++;
  }
  return c;
})()`)
await runLayout()
const s3 = await ev(SNAP)

function cmp(a, b, label) {
  const ids = Object.keys(a)
  let posDiff = 0, numDiff = 0
  const samples = []
  for (const k of ids) {
    const A = a[k], B = b[k]
    if (!B) continue
    if (JSON.stringify(A[0]) !== JSON.stringify(B[0])) {
      posDiff++
      if (samples.length < 4) samples.push(`${k}.pos: ${JSON.stringify(A[0])} → ${JSON.stringify(B[0])}`)
    }
    for (let i = 1; i < 6; i++) if (A[i] !== B[i]) numDiff++
  }
  console.log(`  ${label}`)
  console.log(`    位置不同的节点: ${posDiff} / ${ids.length}`)
  console.log(`    数值字段不同  : ${numDiff}`)
  for (const s of samples) console.log('      ' + s)
  return posDiff + numDiff
}

console.log('=== 比对 ===')
const noise = cmp(s1, s2, '① 基线  vs  ② 原样重跑（这是**噪声**，与 status 无关）')
const effect = cmp(s2, s3, `② 原样  vs  ③ 改了 ${changed} 个 status`)
console.log('')
console.log(`噪声 = ${noise}，改 status 的影响 = ${effect}`)
if (effect === 0) {
  console.log('')
  console.log('✓ 改 status 后，布局输出（位置/半径/rank/方位角/亮度/大小）逐个完全不变')
  console.log('  → 用户的前提成立：status 确实不参与位置计算')
  if (noise > 0) {
    console.log(`  （注意：原样重跑本身有 ${noise} 处差异，那是重建噪声，不是 status 造成的）`)
  }
} else {
  console.log('')
  console.log('✗ 改 status 导致布局输出变化 —— 需要排查')
  process.exitCode = 1
}
ws.close(); cp.kill()
