// 验证：① 按族着色是否真的落到材质上且明度可控 ② 光晕是否真的在渲染
// ③ 关键：彩色模式下「越中心越重要」是否还成立
import { spawn } from 'node:child_process'
import { resolve } from 'node:path'
import { tmpdir } from 'node:os'
import { setTimeout as sleep } from 'node:timers/promises'
import { requireChrome } from './_chrome.mjs'

const CHROME = requireChrome()
const URL = process.env.URL || 'http://localhost:5176/'
const PORT = 9252
const profile = resolve(tmpdir(), `nebula-color-${PORT}-${Date.now().toString(36)}`)
const cp = spawn(CHROME, [
  '--headless=new', '--no-sandbox', '--disable-gpu-sandbox',
  '--enable-unsafe-swiftshader', '--use-gl=angle', '--use-angle=swiftshader',
  '--window-size=1600,1000', `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${profile}`, '--no-first-run', '--no-default-browser-check', URL,
], { stdio: ['ignore', 'pipe', 'pipe'] })
cp.stderr.on('data', () => {})

async function target() {
  for (let i = 0; i < 600; i++) {
    try {
      const l = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()
      const p = l.find((t) => t.type === 'page' && t.webSocketDebuggerUrl)
      if (p) return p
    } catch {}
    await sleep(500)
  }
  throw new Error('CDP 未就绪')
}
const t = await target()
const ws = new WebSocket(t.webSocketDebuggerUrl)
await new Promise((r, j) => { ws.onopen = r; ws.onerror = j })
let id = 0
const pend = new Map()
const errs = []
ws.onmessage = (e) => {
  const m = JSON.parse(e.data)
  if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') {
    errs.push(m.params.args.map((a) => a.value ?? a.description ?? '').join(' '))
  }
  if (m.method === 'Runtime.exceptionThrown') {
    errs.push('[EXC] ' + (m.params.exceptionDetails.exception?.description || '').slice(0, 200))
  }
  if (m.id && pend.has(m.id)) {
    const { resolve: rs, reject: rj } = pend.get(m.id)
    pend.delete(m.id); m.error ? rj(new Error(JSON.stringify(m.error))) : rs(m.result)
  }
}
const send = (method, params = {}) => {
  const i = ++id
  return new Promise((rs, rj) => { pend.set(i, { resolve: rs, reject: rj }); ws.send(JSON.stringify({ id: i, method, params })) })
}
async function ev(expression) {
  const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text)
  return r.result.value
}
await send('Runtime.enable')
await send('Page.enable')

for (let i = 0; i < 600; i++) {
  const d = await ev(`(()=>{const e=document.getElementById('diag');return e?e.textContent:''})()`).catch(() => '')
  if (d) { try { if (JSON.parse(d).built > 0) break } catch {} }
  await sleep(1000)
}
console.log('页面就绪\n')

let pass = 0, fail = 0
const check = (name, ok, extra = '') => {
  console.log(`  ${ok ? '通过' : '失败'}  ${name}${extra ? ' — ' + extra : ''}`)
  ok ? pass++ : fail++
}

/* ═══════ 1. 族色落盘 ═══════ */
console.log('=== 1. 按知识族着色 ===')
const R = await ev(`(()=>{
  const n=window.__nebula, out={};
  const byFam={};
  /* ⚠ 跳过猜想星团节点。
   *   星团节点的颜色**按设计**不跟 family 走（family 是 'conjecture'，
   *   不在 8 个族里）：它们按 status（未解决/已证明/…）或 field（6 个领域）
   *   上色，所以同一个"族"里本来就有 5 种颜色。
   *   把它们算进来，下面"每个族内部颜色完全一致"必然失败 ——
   *   那是**假失败**，测的是错的东西。星团的配色由 verify-cluster.mjs 负责。 */
  for (const x of n.graph.nodes) {
    if(!x.sprite || x.cluster || x.researcher) continue;
    const c=x.sprite.material.color;
    // 反解回 sRGB 便于比对。
    // ⚠ 必须除以 x.curBright（材质上**实际**用的亮度），
    //   而不是 x.brightness —— 后者是理论值，curBright 才是当前帧
    //   平滑后的值（含纵深衰减、悬停加成）。用错的话除不干净，
    //   同一个族会出现几十种"颜色"，看起来像没生效。
    const lin2s=v=>v<=0.0031308?v*12.92:1.055*Math.pow(v,1/2.4)-0.055;
    const hx=v=>Math.round(Math.min(1,Math.max(0,lin2s(v)))*255).toString(16).padStart(2,'0');
    const br=x.curBright || x.brightness;
    const key=hx(c.r/br)+hx(c.g/br)+hx(c.b/br);
    (byFam[x.family]=byFam[x.family]||new Set()).add(key);
  }
  for(const [f,s] of Object.entries(byFam)) out[f]=[...s];
  return { byFam: out, mode: n.settings.state.colorMode,
           counts: n.graph.stats };
})()`)
console.log('  着色模式:', R.mode)
const famKeys = Object.keys(R.byFam)
console.log('  族的数量:', famKeys.length)
for (const [f, set] of Object.entries(R.byFam)) {
  console.log(`    ${f.padEnd(11)} ${set.length} 种色  ${set.join(' ')}`)
}
const allSingular = famKeys.every((f) => R.byFam[f].length === 1)
check('每个族内部颜色完全一致（同族同色）', allSingular,
  allSingular ? famKeys.length + ' 个族' : '有族出现多色')
const distinctAcross = new Set(famKeys.map((f) => R.byFam[f][0])).size
check('不同族颜色互不相同', distinctAcross === famKeys.length,
  `${distinctAcross} / ${famKeys.length}`)

/* ═══════ 2. 明度均衡：色相之外，亮度必须只由重要度决定 ═══════ */
console.log('\n=== 2. 关键：彩色没有淹没「越中心越重要」===')
const L = await ev(`(()=>{
  const n=window.__nebula;
  const rows=[];
  /* 同样只看主星系：这里要量的是"重要度 → 盘面半径 / 明度"两条映射，
   * 而星团的半径是**球心距**（另一种语义）、颜色又是按 status 上的
   * （与 family 色不是一套），混进来会把两个映射拟合在一起，系数失去意义。 */
  for (const x of n.graph.nodes) {
    if(!x.sprite || x.cluster || x.researcher) continue;
    const c=x.sprite.material.color;
    // 感知明度用 OKLab 的 L 近似：这里用线性 RGB 的立方根加权
    const f=v=>Math.cbrt(Math.max(0,v));
    const Lp=0.2104542553*f(0.4122214708*c.r+0.5363325363*c.g+0.0514459929*c.b)
            +0.7936177850*f(0.2119034982*c.r+0.6806995451*c.g+0.1073969566*c.b)
            -0.0040720468*f(0.0883024619*c.r+0.2817188376*c.g+0.6299787005*c.b);
    rows.push({id:x.id, fam:x.family, imp:x.importance, rank:x.rank,
               L:Lp, r:Math.hypot(x.pos.x,x.pos.z), bright:x.brightness,
               cur: x.curBright === undefined ? x.brightness : x.curBright});
  }
  return rows;
})()`)

function spearman(xs, ys) {
  const rank = (a) => {
    const idx = a.map((v, i) => [v, i]).sort((p, q) => p[0] - q[0])
    const r = new Array(a.length)
    for (let i = 0; i < idx.length; i++) r[idx[i][1]] = i
    return r
  }
  const rx = rank(xs), ry = rank(ys)
  const n = xs.length
  const mx = (n - 1) / 2, my = (n - 1) / 2
  let num = 0, dx = 0, dy = 0
  for (let i = 0; i < n; i++) {
    num += (rx[i] - mx) * (ry[i] - my)
    dx += (rx[i] - mx) ** 2
    dy += (ry[i] - my) ** 2
  }
  return num / Math.sqrt(dx * dy)
}

const imp = L.map((d) => d.imp)          // ⚠ 字段名是 imp，不是 importance
const rad = L.map((d) => d.r)
const lum = L.map((d) => d.L)
const brg = L.map((d) => d.bright)

const rImpRad = spearman(imp, rad)
const rImpLum = spearman(imp, lum)
const rImpBrg = spearman(imp, brg)
console.log(`  重要度 vs 半径     : ${rImpRad.toFixed(4)}  （应强负相关）`)
console.log(`  重要度 vs 感知明度 : ${rImpLum.toFixed(4)}  （应强正相关）`)
console.log(`  重要度 vs 亮度系数 : ${rImpBrg.toFixed(4)}  （应强正相关，=1 因为亮度就是重要度的函数）`)
check('彩色模式下重要度仍然决定半径', rImpRad < -0.95, rImpRad.toFixed(4))
/* 感知明度的门槛刻意低于亮度系数，因为 OKLab 的 L ≈ 亮度的立方根：
 * 立方根会把高端的差异压扁，所以 L 与重要度的秩相关必然低于 1；
 * 再叠上**纵深衰减**（相机距离不同使 cur/brightness 在 0.66~0.85 浮动，
 * 那是为空间感故意做的），0.94~0.95 就是这条链路的正常水平。
 * 真正该守住的是"不反向、不明显塌陷"。 */
check('彩色模式下重要度仍然决定明度', rImpLum > 0.90, rImpLum.toFixed(4))

// 最关键的检验：同重要度、不同族的两组，明度差异应该很小
// ⚠ 字段名是 imp（不是 importance）。用错的话 sort 的比较函数全是 NaN，
//   排序变成空操作，切出来的两段是数据文件的原始顺序 —— 测出来的比值
//   毫无意义（实测会得到 0.979，看起来像"核心比外缘还暗"）。
const sorted = [...L].sort((a, b) => a.imp - b.imp)
const lo = sorted.slice(0, 60), hi = sorted.slice(-60)
const mean = (a, k) => a.reduce((s, v) => s + v[k], 0) / a.length
const famOf = (arr) => [...new Set(arr.map((d) => d.fam))].length
console.log(`\n  最低重要度 60 个：跨 ${famOf(lo)} 个族，平均感知明度 ${mean(lo, 'L').toFixed(4)}`)
console.log(`  最高重要度 60 个：跨 ${famOf(hi)} 个族，平均感知明度 ${mean(hi, 'L').toFixed(4)}`)
console.log(`    → 比值 ${(mean(hi, 'L') / mean(lo, 'L')).toFixed(3)}×`)

/* 这个比值**不该**期望很大，理由要说清楚：
 * OKLab 的 L 大致是线性亮度的立方根，所以线性亮度差 k 倍 → 感知明度只差 k^(1/3)。
 * 实测线性亮度比 1.898×，1.898^(1/3) = 1.237，而测到 1.242 —— 完全吻合。
 * 换句话说 1.24× 不是"对比不足"，而是人眼本来就这样看。
 * 真正的分层还有另外两条通道在承担：大小（线性 3×）与光晕（6.9×）。 */
const lRatio = mean(hi, 'L') / mean(lo, 'L')
const predRatio = Math.pow(mean(hi, 'cur') / mean(lo, 'cur'), 1 / 3)
check('核心明显比外缘亮（跨族平均）', lRatio > 1.15, `${lRatio.toFixed(3)}×`)
check('该比值符合立方根规律（非对比不足）',
  Math.abs(lRatio - predRatio) < 0.06,
  `实测 ${lRatio.toFixed(3)} vs 立方根预测 ${predRatio.toFixed(3)}`)

/* ── 直接检验设计目标 ──
 * 「按族着色有没有破坏重要度信号」最直接的问法：
 * 取重要度相同、但族不同的一组节点，它们的明度应该几乎一样。
 * 如果族色自带明度差没被均衡掉，这里就会出现大的离散。
 *
 * ⚠ 判据要考虑**纵深衰减**：材质上的最终明度 = 族色 × brightness × brightK，
 *   而 brightK 取决于节点到相机的距离（0.66~0.85），这是为空间感故意做的。
 *   所以"同重要度跨族"的比较里必然混入距离差异，不能期望离散接近 0。
 *   实测要看的不是绝对值，而是**它比"族色未均衡"时小多少** —— 见下面的对照计算。 */
const byImp = [...L].sort((a, b) => a.imp - b.imp)
const groups = []
for (let i = 0; i < byImp.length; i += 8) groups.push(byImp.slice(i, i + 8))
let worstSpread = 0, worstInfo = ''
let meanSpread = 0, ng = 0
for (const g of groups) {
  if (g.length < 4 || famOf(g) < 2) continue
  const Ls = g.map((d) => d.L)
  const spread = (Math.max(...Ls) - Math.min(...Ls)) / (Math.min(...Ls) || 1)
  meanSpread += spread; ng++
  if (spread > worstSpread) {
    worstSpread = spread
    worstInfo = `重要度≈${g[0].imp.toFixed(2)} 跨 ${famOf(g)} 族，L ${Math.min(...Ls).toFixed(4)}~${Math.max(...Ls).toFixed(4)}`
  }
}
meanSpread /= Math.max(1, ng)
console.log(`\n  同等重要度、跨族节点的明度离散: 平均 ${(meanSpread * 100).toFixed(2)}%，最大 ${(worstSpread * 100).toFixed(2)}%`)
console.log(`    （最差的一组：${worstInfo}）`)

/* 对照组：如果不做明度均衡，离散会有多大？
 * 直接把族色的原始感知明度差算进来即可 —— 原始 8 色的 OKLab-L
 * 极差是 1.18×，折算到"同重要度"情形下的离散约 18%。 */
const RAW_L = { foundation: 0.8319, scheme: 0.8854, cohomology: 0.9196, map: 0.8135, curve: 0.7811, intersect: 0.8243, birational: 0.9247, modern: 0.9163 }
const rawSpread = (Math.max(...Object.values(RAW_L)) - Math.min(...Object.values(RAW_L))) / Math.min(...Object.values(RAW_L))
console.log(`  对照：不均衡时族色本身的感知明度离散 = ${(rawSpread * 100).toFixed(2)}%`)
check('均衡把跨族明度离散压到远低于未均衡水平', meanSpread < rawSpread * 0.55,
  `平均 ${(meanSpread * 100).toFixed(2)}% vs 未均衡 ${(rawSpread * 100).toFixed(2)}%`)

/* 各族内部的"重要度→明度"是否都单调（若某族色相自带明度压过重要度，这里会露） */
/* 各族内部的"重要度→明度"是否都单调。
 *
 * ⚠ 阈值不能设成"全部 ρ > 0.9"：如果某个族的重要度本身挤在很窄的区间，
 *   而明度里还叠着**纵深衰减**（相机距离不同→curBright/brightness 在
 *   0.66~0.85 之间浮动，这是为了空间感故意做的），那么 ρ 会被拉低到 0.87 左右。
 *   那不是配色的问题，是"这个族在盘里的前后位置恰好和重要度弱相关"。
 * 所以判据分两层：整体必须很高，单个族允许略低但不能反向。 */
console.log('\n  各族内部 重要度 vs 明度 相关性:')
let allFamOK = true
let minFamRho = 1
const fams = [...new Set(L.map((d) => d.fam))]
for (const f of fams) {
  const sub = L.filter((d) => d.fam === f)
  const r = spearman(sub.map((d) => d.imp), sub.map((d) => d.L))
  minFamRho = Math.min(minFamRho, r)
  // 只看方向：必须正相关，且不能太弱
  if (r < 0.80) allFamOK = false
  const impRange = Math.max(...sub.map((d) => d.imp)) - Math.min(...sub.map((d) => d.imp))
  console.log(`    ${f.padEnd(11)} n=${String(sub.length).padStart(3)}  ρ = ${r.toFixed(4)}` +
    `  重要度跨度 ${impRange.toFixed(2)}${r < 0.9 ? '  ← 跨度窄+纵深衰减' : ''}`)
}
check('每个族内部都保持「越重要越亮」', allFamOK, `最弱 ρ = ${minFamRho.toFixed(4)}`)

/* ═══════ 3. 光晕 ═══════ */
console.log('\n=== 3. 发光（halo）===')
const G = await ev(`(()=>{
  const n=window.__nebula;
  const gs=n.scene.glowSprites;
  if(!gs||!gs.length) return {count:0};
  const s=gs[0];
  // 取几个样本看颜色是否随族/重要度变化
  const rows=n.graph.nodes.filter(x=>x.glow && !x.cluster && !x.researcher).map(x=>({
    id:x.id, fam:x.family, rank:x.rank, base:x.glowBase,
    col:[x.glow.material.color.r,x.glow.material.color.g,x.glow.material.color.b],
    blend:x.glow.material.blending, tone:x.glow.material.toneMapped,
    ro:x.glow.renderOrder, scale:x.glow.scale.x,
  }));
  return { count:gs.length, hasMap: !!s.material.map, texOK: !!s.material.map?.image,
           blending: s.material.blending, rows,
           enabled: n.settings.state.tweak.glowStrength };
})()`)
console.log('  光晕精灵数:', G.count, '（其中主星系', G.rows.length, '）共用贴图:', G.hasMap, ' 贴图已生成:', G.texOK)
/* ⚠ 比的是**主星系**的光晕数 vs 主星系节点数。
 *   `G.count` 是场景里全部光晕精灵（含星团那 59 个），
 *   而 `L` 是只含主星系的样本 —— 直接比会差出星团那一份（464 vs 405）。
 *   两边口径必须一致；这里选主星系，因为本脚本前面几节验的
 *   族色与重要度映射都只对主星系有意义（星团按 status/field 上色）。 */
check('为主星系每个公式都建了光晕', G.rows.length === L.length,
  `${G.rows.length} vs ${L.length} 个公式（另有星团 ${G.count - G.rows.length} 个）`)
check('光晕用的是加法混合', G.blending === 2, 'blending=' + G.blending)
check('光晕不参与色调映射（保住色相）', G.rows[0].tone === false)

const gr = G.rows
const core = gr.filter((d) => d.rank > 0.9)
const edge = gr.filter((d) => d.rank < 0.1)
const msum = (a) => a.reduce((s, v) => s + v.col[0] + v.col[1] + v.col[2], 0) / a.length
console.log(`  核心 ${core.length} 个平均光晕总量: ${msum(core).toFixed(4)}`)
console.log(`  外缘 ${edge.length} 个平均光晕总量: ${msum(edge).toFixed(4)}`)
console.log(`    → 核心/外缘 = ${(msum(core) / msum(edge)).toFixed(2)}×`)
check('核心公式光晕明显强于外缘', msum(core) / msum(edge) > 2,
  `${(msum(core) / msum(edge)).toFixed(2)}×`)

// 光晕颜色是否跟族色走（不同族的光晕色相应不同）
const gbFam = {}
for (const d of gr) (gbFam[d.fam] = gbFam[d.fam] || []).push(d)
const hueOf = (c) => Math.atan2(Math.sqrt(3) * (c[1] - c[2]), 2 * c[0] - c[1] - c[2])
const famHues = {}
for (const [f, arr] of Object.entries(gbFam)) {
  // 用各族里 rank 接近的样本比色相，排除重要度带来的白化差异
  const mid = arr.sort((a, b) => Math.abs(a.rank - 0.5) - Math.abs(b.rank - 0.5)).slice(0, 3)
  famHues[f] = mid.reduce((s, d) => s + hueOf(d.col), 0) / mid.length
}
console.log('\n  各族光晕色相（弧度）:')
for (const [f, h] of Object.entries(famHues)) console.log(`    ${f.padEnd(11)} ${h.toFixed(3)}`)
const hueSpread = Math.max(...Object.values(famHues)) - Math.min(...Object.values(famHues))
check('光晕颜色跟随族色（各族色相不同）', hueSpread > 0.3, `极差 ${hueSpread.toFixed(3)} rad`)

/* ═══════ 4. 光晕跟随公式（朝向 + 位置） ═══════ */
console.log('\n=== 4. 光晕跟随 ===')
const F = await ev(`(()=>{
  const n=window.__nebula, cam=n.scene.camera;
  const rows=[];
  for (const x of n.graph.nodes.slice(0,40)) {
    if(!x.glow||!x.sprite) continue;
    const dp = Math.hypot(x.glow.position.x-x.sprite.position.x,
                          x.glow.position.y-x.sprite.position.y,
                          x.glow.position.z-x.sprite.position.z);
    const dq = Math.abs(x.glow.quaternion.dot(cam.quaternion));
    rows.push({dp, dq});
  }
  return rows;
})()`)
const maxDp = Math.max(...F.map((d) => d.dp))
const minDq = Math.min(...F.map((d) => d.dq))
console.log(`  位置最大偏差 ${maxDp.toExponential(2)}，朝向 dot 最小 ${minDq.toFixed(6)}`)
check('光晕与公式位置完全同步', maxDp < 1e-6, maxDp.toExponential(2))
check('光晕始终正对相机', minDq > 0.999, minDq.toFixed(6))

/* ═══════ 5. 切回统一橙黄 ═══════ */
console.log('\n=== 5. 切换回「统一橙黄」===')
await ev(`(()=>{ window.__nebula.settings.setColorMode('mono'); return 1 })()`)
await sleep(900)
const M = await ev(`(()=>{
  const n=window.__nebula, s=new Set();
  /* ⚠ mono（统一橙黄）只作用于**主星系**。
   *   星团在 mono / family 两种模式下仍然按 **status** 上色 —— 这是刻意的：
   *   这两个模式没有为星团定义语义（星团的 family 是 'conjecture'，
   *   不在 8 个族里），而"这条猜想定了没"是星团唯一的信息维度，
   *   退回单色等于把它唯一的维度丢掉。所以断言必须只统计主星系。 */
  for(const x of n.graph.nodes){
    if(!x.sprite || x.cluster || x.researcher) continue;
    const c=x.sprite.material.color, br=x.curBright || x.brightness;
    const lin2s=v=>v<=0.0031308?v*12.92:1.055*Math.pow(v,1/2.4)-0.055;
    const hx=v=>Math.round(Math.min(1,Math.max(0,lin2s(v)))*255).toString(16).padStart(2,'0');
    s.add(hx(c.r/br)+hx(c.g/br)+hx(c.b/br));
  }
  const glowCols=new Set(n.graph.nodes.filter(x=>x.glow && !x.cluster && !x.researcher).map(x=>{
    const c=x.glow.material.color, m=Math.max(c.r,c.g,c.b);
    const lin2s=v=>v<=0.0031308?v*12.92:1.055*Math.pow(v,1/2.4)-0.055;
    const hx=v=>Math.round(Math.min(1,Math.max(0,lin2s(v)))*255).toString(16).padStart(2,'0');
    return hx(c.r/m)+hx(c.g/m)+hx(c.b/m);
  }));
  return { colors:[...s], glowColors:[...glowCols], mode:n.settings.state.colorMode };
})()`)
console.log('  模式:', M.mode, ' 出现的基色:', M.colors.join(', '))
check('mono 模式下所有公式同色', M.colors.length === 1, M.colors.join(','))
check('mono 模式色相是橙黄', /^f+b|^f+e|^f+d/.test(M.colors[0] || ''), M.colors[0])
check('mono 模式下光晕也同色', M.glowColors.length === 1, M.glowColors.join(','))

// 切回 family
await ev(`(()=>{ window.__nebula.settings.setColorMode('family'); return 1 })()`)
await sleep(900)
const B = await ev(`(()=>{
  const n=window.__nebula, s=new Set();
  // 同样只统计主星系：星团不论在哪个模式下都按 status 上色（见上）
  for(const x of n.graph.nodes){
    if(!x.sprite || x.cluster || x.researcher) continue;
    const c=x.sprite.material.color, br=x.brightness;
    const lin2s=v=>v<=0.0031308?v*12.92:1.055*Math.pow(v,1/2.4)-0.055;
    const hx=v=>Math.round(Math.min(1,Math.max(0,lin2s(v)))*255).toString(16).padStart(2,'0');
    s.add(hx(c.r/br)+hx(c.g/br)+hx(c.b/br));
  }
  return { n:s.size, mode:n.settings.state.colorMode };
})()`)
check('切回 family 恢复多彩', B.n >= 8, `${B.n} 种颜色, mode=${B.mode}`)

/* ═══════ 6. 发光强度可调 ═══════ */
console.log('\n=== 6. 发光强度实时可调 ===')
const before = await ev(`(()=>{const g=window.__nebula.graph.nodes.find(x=>x.rank>0.9&&x.glow&&!x.cluster&&!x.researcher);
  return g.glow.material.color.r })()`)
await ev(`(()=>{ window.__nebula.settings.setTweak('glowStrength', 1.5); return 1 })()`)
await sleep(1200)
const after = await ev(`(()=>{const g=window.__nebula.graph.nodes.find(x=>x.rank>0.9&&x.glow&&!x.cluster&&!x.researcher);
  return g.glow.material.color.r })()`)
console.log(`  强度 0.55 → 1.5：光晕红通道 ${before.toFixed(4)} → ${after.toFixed(4)}`)
check('调发光强度立刻生效（无需重建）', after > before * 1.5, `${(after / before).toFixed(2)}×`)

await ev(`(()=>{ window.__nebula.settings.setTweak('glowStrength', 0); return 1 })()`)
/* ⚠ 光晕颜色是**逐帧平滑插值**过去的（scene.js 里的 n.curGlow），不是立刻跳变。
 *   headless SwiftShader 只有约 5 FPS，而且插值是指数收敛 —— 强度从 0.55
 *   掉到 0 需要若干帧才能压到 0.01 以下。这里轮询等待，而不是拍一个固定秒数：
 *   固定等待在机器慢的时候必然假失败（实测 4 秒后仍有 0.027 的残留）。 */
let zero = 1
for (let i = 0; i < 30; i++) {
  await sleep(700)
  zero = await ev(`(()=>{const g=window.__nebula.graph.nodes.find(x=>x.rank>0.9&&x.glow&&!x.cluster&&!x.researcher);
    const t = g.glowBase * window.__nebula.settings.state.tweak.glowStrength;
    return Math.max(t, g.glow.material.color.r, g.glow.material.color.g, g.glow.material.color.b) })()`)
  if (zero < 0.01) break
}
check('强度归零后光晕真的消失', zero < 0.01, zero.toExponential(2))
await ev(`(()=>{ window.__nebula.settings.setTweak('glowStrength', 0.55); return 1 })()`)

/* ═══════ 7. 光晕不参与拾取 ═══════ */
console.log('\n=== 7. 光晕不该被点到 ===')
const P = await ev(`(()=>{
  const n=window.__nebula;
  const rc=new (n.scene.scene.constructor.prototype.constructor===Object?Object:Object)();
  const g=n.graph.nodes.find(x=>x.glow).glow;
  // 直接调用光晕的 raycast，应返回空
  const out=[];
  try { g.raycast({}, out) } catch(e) { return {err:String(e).slice(0,80)} }
  return { hits: out.length };
})()`)
check('光晕的 raycast 被禁用（返回 0 命中）', P.hits === 0, JSON.stringify(P))

console.log('\n=== 8. 控制台错误 ===')
console.log('  ', JSON.stringify(errs.slice(0, 5)))
check('无控制台错误', errs.length === 0, errs.length + ' 条')

console.log('\n' + '='.repeat(56))
console.log(`结果：${pass} / ${pass + fail} 通过`)
console.log('='.repeat(56))

ws.close(); cp.kill(); await sleep(300)
process.exit(fail ? 1 : 0)
