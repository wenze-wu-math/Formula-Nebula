/**
 * 验证星系几何：盘面扁平度、旋臂结构、重要度映射、统一配色、连线无光点
 *
 * 用法：先起服务器，然后
 *   $env:URL="http://localhost:5176/"; node scripts/verify-galaxy.mjs
 */
import { spawn } from 'node:child_process'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { requireChrome } from './_chrome.mjs'

const URL_ = process.env.URL || 'http://localhost:5176/'
const CHROME = requireChrome()
if (!CHROME) { console.error('找不到 Chrome'); process.exit(1) }

const PORT = 9444 + (process.pid % 400)
const profile = mkdtempSync(join(tmpdir(), 'nebula-prof-'))

const chrome = spawn(CHROME, [
  '--headless=new', '--disable-gpu-sandbox', '--no-sandbox', '--no-first-run',
  '--enable-unsafe-swiftshader', '--use-gl=angle', '--use-angle=swiftshader',
  `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`,
  '--window-size=1600,1000', '--hide-scrollbars', 'about:blank',
], { stdio: 'ignore' })

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function getWs() {
  for (let i = 0; i < 600; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${PORT}/json/list`)
      const list = await r.json()
      const page = list.find((t) => t.type === 'page')
      if (page) return page.webSocketDebuggerUrl
    } catch {}
    await sleep(300)
  }
  throw new Error('Chrome 没起来')
}

const ws = new WebSocket(await getWs())
await new Promise((r) => (ws.onopen = r))

let id = 0
const pending = new Map()
const consoleErrors = []
ws.onmessage = (ev) => {
  const m = JSON.parse(ev.data)
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id) }
  if (m.method === 'Runtime.exceptionThrown') {
    consoleErrors.push(m.params?.exceptionDetails?.exception?.description || 'exception')
  }
}
function cmd(method, params = {}) {
  return new Promise((res) => {
    const i = ++id
    pending.set(i, res)
    ws.send(JSON.stringify({ id: i, method, params }))
  })
}
async function evaluate(expr) {
  const r = await cmd('Runtime.evaluate', {
    expression: expr, returnByValue: true, awaitPromise: true,
  })
  if (r.result?.exceptionDetails) {
    throw new Error(r.result.exceptionDetails.exception?.description || 'eval error')
  }
  return r.result?.result?.value
}

await cmd('Page.enable')
await cmd('Runtime.enable')
await cmd('Page.navigate', { url: URL_ })

// 等烘焙完成
let diag = null
for (let i = 0; i < 400; i++) {
  await sleep(500)
  diag = await evaluate(`(()=>{const d=document.getElementById('diag');return d?d.textContent:null})()`)
  if (diag) break
}
if (!diag) { console.error('超时：页面没写出 #diag'); ws.close(); chrome.kill(); process.exit(1) }

const info = JSON.parse(diag)
console.log('=== 0. 启动信息 ===')
console.log(`  公式 ${info.nodes} 个 · 关联 ${info.links} 条 · 成功渲染 ${info.built} · 失败 ${info.failed}`)
if (info.errors?.length) console.log('  烘焙错误:', info.errors.slice(0, 5))

const R = await evaluate(`(()=>{
  const n = window.__nebula, ns = n.graph.nodes;

  /* 只统计真的建出来的**主星系**公式。
   *
   * ⚠ 星团节点必须排除，而且理由不止"多算了一些点"：
   *   星团节点的 sprite.position 是**相对球心**的局部坐标
   *   （父组 clusterGroup 已经放在 CLUSTER.center 上了），
   *   所以在下面这套"到原点距离 = 盘面半径"的算法里，
   *   它们会被读成"一群挤在原点附近的公式" —— 扁平度、旋臂 CV、
   *   甚至 maxR 全都会被污染成无意义的数。
   *   本脚本验证的是**盘面形态**，星团有自己的 verify-cluster.mjs。
   *
   * ⚠⚠ 这个注释块在**模板字符串内部**，所以绝对不能出现反引号 ——
   *    一个反引号就会把模板字符串截断，报 "missing ) after argument list"。
   *    这个坑刚刚踩过一次（而且第一次"警告不要写反引号"的那句话里
   *    自己就带了一个反引号，于是警告本身成了第二个 bug）。 */
  const ok = ns.filter(x => x.sprite && !x.cluster && !x.researcher);
  const rOut = 175;   // LAYOUT.radiusOuter（改 config.js 时同步改这里）

  // ── 盘面半径（x-z 平面内到中心的距离）──
  const info = ok.map(x => {
    const p = x.sprite.position;
    const rp = Math.hypot(p.x, p.z);          // 盘面半径
    const y  = Math.abs(p.y);                 // 竖直偏移
    return { id:x.id, name:x.name, rank:x.rank, family:x.family,
             r:rp, y, threeD:Math.hypot(p.x,p.y,p.z),
             w:x.width, h:x.height, brightness:x.brightness,
             color:[x.sprite.material.color.r, x.sprite.material.color.g, x.sprite.material.color.b] };
  });

  // ── 扁平度：竖直偏移 / 盘面半径 ──
  const ratios = info.map(d => d.y / Math.max(1e-6, d.r)).sort((a,b)=>a-b);
  const medFlat = ratios[Math.floor(ratios.length/2)];
  const p95Flat = ratios[Math.floor(ratios.length*0.95)];
  const maxFlat = ratios[ratios.length-1];
  // 整体形态：盘的最大厚度 / 盘直径
  const maxY = Math.max(...info.map(d=>d.y));
  const maxR = Math.max(...info.map(d=>d.r));
  const minY = Math.min(...ok.map(x=>x.sprite.position.y));

  // ── 旋臂结构：θ 直方图 ──
  const BINS = 48;
  const hist = new Array(BINS).fill(0);
  for (const x of ok) {
    const p = x.sprite.position;
    let th = Math.atan2(p.z, p.x);
    if (th < 0) th += Math.PI*2;
    hist[Math.floor(th / (Math.PI*2) * BINS) % BINS]++;
  }
  const mean = ok.length / BINS;
  const varH = hist.reduce((s,v)=>s+(v-mean)**2,0)/BINS;
  const cv = Math.sqrt(varH)/mean;   // 变异系数：0=完全均匀(无臂)，越大越成团

  // ── 重要度 → 盘面半径 的 Spearman ──
  function spearman(xs, ys){
    const rank = a => { const idx=a.map((v,i)=>[v,i]).sort((p,q)=>p[0]-q[0]);
      const r=new Array(a.length); idx.forEach(([,i],k)=>r[i]=k); return r; };
    const rx=rank(xs), ry=rank(ys), n=xs.length;
    const mx=rx.reduce((a,b)=>a+b,0)/n, my=ry.reduce((a,b)=>a+b,0)/n;
    let num=0,dx=0,dy=0;
    for(let i=0;i<n;i++){const a=rx[i]-mx,b=ry[i]-my;num+=a*b;dx+=a*a;dy+=b*b;}
    return num/Math.sqrt(dx*dy);
  }

  const rank_ = info.map(d=>d.rank);
  const spR = spearman(rank_, info.map(d=>d.r));
  const spA = spearman(rank_, info.map(d=>d.w*d.h));
  const spB = spearman(rank_, info.map(d=>d.brightness));

/* ── 配色一致性（浏览器侧只负责把色相按族收集，判据在 Node 侧做）──
 *
 * 这里原来断言"所有公式色相都在 20°~50°（橙黄）"。
 * 现在默认改成**按知识族着色**，那条断言必然失败 —— 但它描述的旧需求
 * （"每个公式的字体都应该是橙黄色的"）并没有被取消，只是做成了可切换的
 * 模式之一（设置面板 → 着色 → 统一橙黄，GLYPH.colorMode === 'mono'）。
 *
 * 所以判据改成按**当前模式**分别验收（见下方第 4 节）：
 *   mono   → 色相必须统一在橙黄区间（原文断言）
 *   family → 每个族内部色相统一，且 8 个族彼此可分辨
 * 这样两种口径都被守住，而不是简单地把失败项删掉。 */
function hueOf([r, g, b]) {
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
  if (mx === mn) return null;
  let h; const dd = mx - mn;
  if (mx === r) h = ((g - b) / dd) % 6; else if (mx === g) h = (b - r) / dd + 2; else h = (r - g) / dd + 4;
  h *= 60; if (h < 0) h += 360; return h;
}
const hues = info.map(d => hueOf(d.color)).filter(v => v !== null);
const famHue = {};
for (const d of info) {
  const h = hueOf(d.color);
  if (h === null) continue;
  (famHue[d.family] = famHue[d.family] || []).push(h);
}

  /* 每个族的**纯色**在 OKLab 里的坐标（用于算族间 ΔE）。
   * 注意取的是 x.baseColor（未经亮度乘算的族色本身），
   * 而不是材质上当前的 color —— 后者叠了 brightness 与纵深衰减，
   * 拿它算 ΔE 会混入明暗差，反映不出"色相是否可分"。 */
  const famLab = {};
  for (const x of ok) {
    if (famLab[x.family]) continue;
    const c = x.baseColor || x.sprite.material.color;
    const f = (v) => Math.cbrt(Math.max(0, v));
    famLab[x.family] = [
      0.2104542553*f(0.4122214708*c.r + 0.5363325363*c.g + 0.0514459929*c.b)
      + 0.7936177850*f(0.2119034982*c.r + 0.6806995451*c.g + 0.1073969566*c.b)
      - 0.0040720468*f(0.0883024619*c.r + 0.2817188376*c.g + 0.6299787005*c.b),
      1.9779984951*f(0.4122214708*c.r + 0.5363325363*c.g + 0.0514459929*c.b)
      - 2.4285922050*f(0.2119034982*c.r + 0.6806995451*c.g + 0.1073969566*c.b)
      + 0.4505937099*f(0.0883024619*c.r + 0.2817188376*c.g + 0.6299787005*c.b),
      0.0259040371*f(0.4122214708*c.r + 0.5363325363*c.g + 0.0514459929*c.b)
      + 0.7827717662*f(0.2119034982*c.r + 0.6806995451*c.g + 0.1073969566*c.b)
      - 0.8086757660*f(0.0883024619*c.r + 0.2817188376*c.g + 0.6299787005*c.b),
    ];
  }

  // ── 连线：有没有流动光点？──
  const linkGroup = n.scene.scene.getObjectByName('links');
  let pointsInLinks = 0, lineSegs = 0;
  linkGroup.traverse(o=>{
    if(o.isPoints) pointsInLinks++;
    if(o.isLineSegments2 || o.type==='LineSegments2') lineSegs++;
  });

  // 盘面半径极值
  const byRank=[...info].sort((a,b)=>b.rank-a.rank);
  const core=byRank[0], edge=byRank[byRank.length-1];

  return { count: info.length, maxY, minY, maxR, medFlat, p95Flat, maxFlat,
           armCV: cv, hist,
           spR, spA, spB,
           hueMin: Math.min(...hues), hueMax: Math.max(...hues),
           pointsInLinks, lineSegs, famHue, famLab,
           colorMode: n.settings.state.colorMode,
           core:{name:core.name,r:core.r,y:core.y,area:core.w*core.h,br:core.brightness},
           edge:{name:edge.name,r:edge.r,y:edge.y,area:edge.w*edge.h,br:edge.brightness} };
})()`)

const colorMode = R.colorMode
const famHue = R.famHue

console.log('\n=== 1. 盘面扁平度（"大致在同一平面内"）===')
console.log(`  竖直偏移 / 盘面半径：中位数 ${R.medFlat.toFixed(3)}，95分位 ${R.p95Flat.toFixed(3)}，最大 ${R.maxFlat.toFixed(3)}`)
console.log(`  盘的最大厚度 ${(R.maxY - R.minY).toFixed(1)}，盘半径 ${R.maxR.toFixed(1)}`)
console.log(`  → 厚度/直径 = ${((R.maxY - R.minY) / (2 * R.maxR)).toFixed(3)}  (0.10 左右 = 薄盘)`)
const flatOK = R.medFlat < 0.16
console.log(`  ${flatOK ? '✓' : '✗'} ${flatOK ? '是薄盘，不是球壳' : '太厚了，接近球体'}`)

console.log('\n=== 2. 旋臂结构（τ 分布均匀度）===')
console.log(`  角向分布变异系数 CV = ${R.armCV.toFixed(3)}`)
const armOK = R.armCV > 0.25
console.log(`  ${armOK ? '✓' : '✗'} ${armOK ? '明显成团 → 有旋臂' : '太均匀 → 旋臂不明显'}`)
const mx = Math.max(...R.hist)
const bars = R.hist.map(v => '▁▂▃▄▅▆▇█'[Math.min(7, Math.floor(v / mx * 8))]).join('')
console.log(`  角向直方图(0→2π): ${bars}`)

console.log('\n=== 3. 重要度映射（Spearman 秩相关）===')
console.log(`  重要度 vs 盘面半径 : ${R.spR.toFixed(4)}  (应强负相关，越重要越靠盘心)`)
console.log(`  重要度 vs 面积     : ${R.spA.toFixed(4)}  (应强正相关，越重要越大)`)
console.log(`  重要度 vs 亮度     : ${R.spB.toFixed(4)}  (应强正相关，越重要越亮)`)
const mapOK = R.spR < -0.8 && R.spA > 0.8 && R.spB > 0.8
console.log(`  ${mapOK ? '✓' : '✗'} ${mapOK ? '三条映射都成立' : '有映射被破坏'}`)

console.log('\n=== 4. 配色一致性 ===')
console.log(`  当前着色模式: ${colorMode}`)
let hueOK

/* ⚠ 脚本必须显式确认自己测的是哪个模式。
 * localStorage 里可能残留上一次运行的选择（比如 mono），
 * 那样这个脚本会静默地只跑一半判据。所以两种模式都验一遍：
 * 先验当前模式，再切到另一个模式重取一次色相。 */
function judgeMono(hues) {
  const mn = Math.min(...hues), mx = Math.max(...hues)
  console.log(`  [mono] 色相范围 ${mn.toFixed(1)}° ~ ${mx.toFixed(1)}°  (橙黄约 20°~50°)`)
  const ok = mn >= 20 && mx <= 50
  console.log(`    ${ok ? '✓' : '✗'} ${ok ? '所有公式同一橙黄色相' : '色相不统一'}`)
  return ok
}
function judgeFamily(famHue, famLab) {
  const fams = Object.entries(famHue)
  let allTight = true
  const famMean = {}
  console.log('  [family] 族内色相一致性:')
  for (const [f, hs] of fams) {
    const mn = Math.min(...hs), mx = Math.max(...hs)
    let span = mx - mn
    if (span > 180) span = 360 - span     // 色相是圆的，跨 0° 要绕回来
    // 取圆均值，避免 350° 与 10° 平均成 180°
    let sx = 0, sy = 0
    for (const h of hs) { sx += Math.cos(h * Math.PI / 180); sy += Math.sin(h * Math.PI / 180) }
    famMean[f] = (Math.atan2(sy, sx) * 180 / Math.PI + 360) % 360
    if (span > 4) allTight = false
    console.log(`    ${f.padEnd(11)} n=${String(hs.length).padStart(3)}  ${mn.toFixed(1)}°~${mx.toFixed(1)}°  跨度 ${span.toFixed(1)}°`)
  }

  /* 族间可分辨性用 **OKLab 的 ΔE** 衡量，而不是 sRGB 色相角之差。
   *
   * 为什么不能用色相角：sRGB 色相是**感知不均匀**的。蓝紫区（240°~290°）
   * 在色相环上被严重压缩 —— 同样是 14° 的色相间隔，在蓝紫区看起来
   * 远不如在黄绿区明显。实测两个"色相角只差 13.9°"的族，其 OKLab
   * ΔE 是 0.075，而经验阈值是 ΔE > 0.05 即可稳定区分。
   * 用色相角设阈值会把一对本来能分辨的颜色误判为"太接近"。
   *
   * 所以这里换成人眼真正感知的度量，并且把两个数都打印出来对照。 */
  const keys = Object.keys(famMean)
  let minDE = Infinity, pair = ''
  let minHueGap = 360, huePair = ''
  for (let i = 0; i < keys.length; i++) {
    for (let j = i + 1; j < keys.length; j++) {
      // 用**真实**的代表色算 ΔE（由 HUE_PROBE 从材质上取回）
      const A = famLab[keys[i]], B = famLab[keys[j]]
      if (A && B) {
        const de = Math.hypot(A[0] - B[0], A[1] - B[1], A[2] - B[2])
        if (de < minDE) { minDE = de; pair = `${keys[i]} ↔ ${keys[j]}` }
      }
      let d = Math.abs(famMean[keys[i]] - famMean[keys[j]])
      if (d > 180) d = 360 - d
      if (d < minHueGap) { minHueGap = d; huePair = `${keys[i]} ↔ ${keys[j]}` }
    }
  }
  console.log(`  族间最接近的一对: ${pair}   ΔE(OKLab) = ${minDE.toFixed(4)}  (阈值 > 0.05)`)
  console.log(`    （同一对在 sRGB 色相环上差 ${minHueGap.toFixed(1)}°，${huePair}）`)
  console.log(`    ℹ sRGB 色相在蓝紫区被压缩，14° 的色相间隔在感知上 ≈ΔE 0.075，是可分辨的`)
  const ok = allTight && fams.length === 8 && minDE > 0.05
  console.log(`    ${ok ? '✓' : '✗'} ${allTight ? '每个族内部色相完全统一' : '有族内部色相不一致'}` +
    `，${minDE > 0.05 ? '族间可分辨' : '族间太接近'}（${fams.length} 个族）`)
  return ok
}

const HUE_PROBE = `(()=>{
  const n=window.__nebula, out={}, all=[], lab={};
  const f=v=>Math.cbrt(Math.max(0,v));
  const oklab=c=>[
    0.2104542553*f(0.4122214708*c.r+0.5363325363*c.g+0.0514459929*c.b)
   +0.7936177850*f(0.2119034982*c.r+0.6806995451*c.g+0.1073969566*c.b)
   -0.0040720468*f(0.0883024619*c.r+0.2817188376*c.g+0.6299787005*c.b),
    1.9779984951*f(0.4122214708*c.r+0.5363325363*c.g+0.0514459929*c.b)
   -2.4285922050*f(0.2119034982*c.r+0.6806995451*c.g+0.1073969566*c.b)
   +0.4505937099*f(0.0883024619*c.r+0.2817188376*c.g+0.6299787005*c.b),
    0.0259040371*f(0.4122214708*c.r+0.5363325363*c.g+0.0514459929*c.b)
   +0.7827717662*f(0.2119034982*c.r+0.6806995451*c.g+0.1073969566*c.b)
   -0.8086757660*f(0.0883024619*c.r+0.2817188376*c.g+0.6299787005*c.b)];
  for(const x of n.graph.nodes){
    // 星团节点的 family 是 'conjecture'（不在 8 个族里），而且它们的颜色
    // 按 status/field 走另一套逻辑 —— 混进来会多出一个假族，
    // 把"8 个族各一种色相"的判据搞乱。
    if(!x.sprite || x.cluster || x.researcher) continue;
    const bc=x.baseColor||x.sprite.material.color;
    if(!lab[x.family]) lab[x.family]=oklab(bc);
    const mx=Math.max(bc.r,bc.g,bc.b), mn=Math.min(bc.r,bc.g,bc.b);
    if(mx===mn) continue;
    let h; const dd=mx-mn;
    if(mx===bc.r) h=((bc.g-bc.b)/dd)%6; else if(mx===bc.g) h=(bc.b-bc.r)/dd+2; else h=(bc.r-bc.g)/dd+4;
    h*=60; if(h<0)h+=360;
    all.push(h); (out[x.family]=out[x.family]||[]).push(h); }
  return {all, byFam: out, famLab: lab};
})()`

if (colorMode === 'mono') {
  /* 当前是 mono：先验原文的"统一橙黄"，再切到 family 验族色可分。 */
  console.log('  ── 模式 mono（统一橙黄，原文需求）──')
  hueOK = judgeMono(R.hues)
  await evaluate(`(()=>{ window.__nebula.settings.setColorMode('family'); return 1 })()`)
  await sleep(1500)
  const P = await evaluate(HUE_PROBE)
  console.log('  ── 切换到 family（按知识族着色）──')
  hueOK = judgeFamily(P.byFam, P.famLab) && hueOK
  await evaluate(`(()=>{ window.__nebula.settings.setColorMode('mono'); return 1 })()`)
} else {
  /* 当前是 family（默认）：族色验完后切到 mono，把原文的橙黄断言也跑一遍，
   * 避免这条老需求因为"默认模式变了"而事实上失去覆盖。 */
  console.log('  ── 模式 family（按知识族着色，当前默认）──')
  hueOK = judgeFamily(famHue, R.famLab)
  await evaluate(`(()=>{ window.__nebula.settings.setColorMode('mono'); return 1 })()`)
  await sleep(1500)
  const P = await evaluate(HUE_PROBE)
  console.log('  ── 切换到 mono（统一橙黄，原文需求）──')
  hueOK = judgeMono(P.all) && hueOK
  await evaluate(`(()=>{ window.__nebula.settings.setColorMode('family'); return 1 })()`)
}
await sleep(800)

console.log('\n=== 5. 连线没有流动光点 ===')
console.log(`  连线组里的 Points 对象数 = ${R.pointsInLinks}  (应为 0)`)
console.log(`  连线组里的线段对象数     = ${R.lineSegs}`)
const glowOK = R.pointsInLinks === 0
console.log(`  ${glowOK ? '✓' : '✗'} ${glowOK ? '已无沿连线流动的光点' : '仍有光点'}`)

console.log('\n=== 6. 核心 vs 外缘 ===')
console.log(`  最核心「${R.core.name}」: 盘面半径 ${R.core.r.toFixed(1)} / 高度 ${R.core.y.toFixed(1)} / 面积 ${R.core.area.toFixed(1)} / 亮度 ${R.core.br.toFixed(2)}`)
console.log(`  最外缘「${R.edge.name}」: 盘面半径 ${R.edge.r.toFixed(1)} / 高度 ${R.edge.y.toFixed(1)} / 面积 ${R.edge.area.toFixed(1)} / 亮度 ${R.edge.br.toFixed(2)}`)
console.log(`  → 核心/外缘 倍数：半径 ${(R.edge.r / R.core.r).toFixed(1)}×，面积 ${(R.core.area / R.edge.area).toFixed(1)}×，亮度 ${(R.core.br / R.edge.br).toFixed(2)}×`)

console.log('\n=== 7. 控制台异常 ===')
console.log(' ', consoleErrors.length ? consoleErrors.slice(0, 3) : '无')

const allOK = flatOK && armOK && mapOK && hueOK && glowOK && consoleErrors.length === 0
console.log(`\n${allOK ? '✓ 全部通过' : '✗ 有项目未通过'}`)

ws.close()
chrome.kill()
process.exit(allOK ? 0 : 1)
