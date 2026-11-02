/**
 * 判定盘面拥挤是"松弛没推够"还是"装不下"。
 *
 * 每个公式被松弛钉在自己的半径圆环上，只能沿环滑动。
 * 半径为 r 的环周长 2πr；落在该环附近的公式总宽度若超过周长，
 * 无论怎么松弛都不可能不重叠 —— 这就是容量上限。
 *
 * 输出：按半径分环，每环的"总宽度 / 周长"，>1 即该环必然重叠。
 * 用法: node scripts/check-ring-capacity.mjs
 */
import { spawn } from 'node:child_process'
import { resolve } from 'node:path'
import { tmpdir } from 'node:os'
import { setTimeout as sleep } from 'node:timers/promises'
import { requireChrome } from './_chrome.mjs'

const CHROME = requireChrome()
const URL = process.env.URL || 'http://localhost:5176/'
const PORT = 9233
const profile = resolve(tmpdir(), 'nebula-ring' + '-' + process.pid)

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
  return new Promise((rs, rj) => { pending.set(id, { resolve: rs, reject: rj }); ws.send(JSON.stringify({ id, method, params })) })
}
async function evaluate(expression) {
  const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })
  if (r.exceptionDetails) throw new Error('异常: ' + JSON.stringify(r.exceptionDetails.exception?.description))
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

const rep = await evaluate(`(()=>{
  const nodes = window.__nebula.graph.nodes.filter(n=>n.sprite);
  const maxR = Math.max(...nodes.map(n=>n.radius));

  // 分 12 个同心环，统计每环里节点宽度之和与环周长
  const BANDS = 12;
  const bands = Array.from({length:BANDS}, ()=>({n:0, w:0, r0:0, r1:0}));
  for (let b=0;b<BANDS;b++){
    bands[b].r0 = maxR*b/BANDS;
    bands[b].r1 = maxR*(b+1)/BANDS;
  }
  for (const nd of nodes) {
    let b = Math.min(BANDS-1, Math.floor(nd.radius/maxR*BANDS));
    if (b<0) b=0;
    bands[b].n++;
    bands[b].w += nd.width;      // 公式在环上占的弧长 ~ 宽度
  }
  const rows = bands.map((b,i)=>{
    const rMid = (b.r0+b.r1)/2;
    // 环带面积 = π(r1²-r0²)，用它和公式面积之和比较更公平
    const ringArea = Math.PI*(b.r1*b.r1 - b.r0*b.r0);
    return {
      区间: rMid.toFixed(0),
      节点数: b.n,
      周长: +(2*Math.PI*rMid).toFixed(0),
      总宽度: +b.w.toFixed(0),
      宽度比周长: rMid>1 ? +(b.w/(2*Math.PI*rMid)).toFixed(2) : null,
    };
  });

  // 全局：所有公式面积之和 vs 盘面积
  const sumArea = nodes.reduce((s,n)=>s+n.width*n.height,0);
  const diskArea = Math.PI*maxR*maxR;
  // 全局"宽度容量"：把每个节点放在自己的环上，Σw/(2πr) 的平均值
  const cap = nodes.map(n=>n.width/(2*Math.PI*n.radius));
  cap.sort((a,b)=>b-a);

  return {
    盘半径: +maxR.toFixed(1),
    公式数: nodes.length,
    面积填充率: +(sumArea/diskArea).toFixed(3),
    每环: rows,
    单节点环占用: {
      中位: +cap[Math.floor(cap.length*0.5)].toFixed(4),
      p90: +cap[Math.floor(cap.length*0.9)].toFixed(4),
      最大: +cap[0].toFixed(4),
    },
  };
})()`)

console.log('=== 环容量分析 ===')
console.log(`  盘半径 ${rep.盘半径} · 公式 ${rep.公式数} · 面积填充率 ${rep.面积填充率}`)
console.log(`\n  半径区间   节点数   环周长   总宽度   宽度/周长`)
for (const r of rep.每环) {
  const flag = r.宽度比周长 != null && r.宽度比周长 > 1 ? '  ← 装不下' : ''
  console.log(`  ${String(r.区间).padStart(6)}   ${String(r.节点数).padStart(5)}   ${String(r.周长).padStart(6)}   ${String(r.总宽度).padStart(6)}   ${r.宽度比周长 == null ? '  -  ' : String(r.宽度比周长).padStart(6)}${flag}`)
}
console.log(`\n  单节点占环比例（宽/2πr）：中位 ${rep.单节点环占用.中位}  p90 ${rep.单节点环占用.p90}  最大 ${rep.单节点环占用.最大}`)

ws.close(); cp.kill(); await sleep(200)
process.exit(0)
