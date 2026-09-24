/**
 * ═══════════════════════════════════════════════════════════════
 *  verify-cluster.mjs —— 猜想星团的正确性验证
 * ═══════════════════════════════════════════════════════════════
 *
 *  这个脚本回答四个问题：
 *
 *   ① **结构**：星团真的存在、真的有 59 条猜想、且与主星系物理分离？
 *   ② **语义**：「越靠球心越重要」在星团里成立吗？（Spearman 秩相关）
 *   ③ **领域**：6 个领域真的在球面上各占一个方向、形成可辨认的"星座"吗？
 *   ④ **状态**：状态色点真的按 status 上色、且切换着色模式时确实变色？
 *
 *  为什么这些断言值得写：星团的价值全在"位置编码语义"上。
 *  如果重要的是随机分布的，那它就只是一团装饰性的噪声 ——
 *  看起来像星团，但读不出任何信息。所以必须**量化**地验证：
 *  位置与重要度的秩相关接近 ±1，领域质心两两夹角接近 109°。
 *
 *  用法：node scripts/verify-cluster.mjs
 *  需要 preview 服务器已在 5176 端口运行（npx vite preview --port 5176）。
 */

import { spawn } from 'node:child_process'
import { setTimeout as sleep } from 'node:timers/promises'

const PORT = Number(process.env.PORT || 9301)
const URL = process.env.URL || 'http://127.0.0.1:5176/'
const CHROME = process.env.CHROME ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'

let pass = 0
let fail = 0
const failures = []

function ok(cond, label, detail = '') {
  if (cond) { pass++; console.log(`  ✓ ${label}${detail ? '  ' + detail : ''}`) }
  else { fail++; failures.push(label); console.log(`  ✗ ${label}${detail ? '  ' + detail : ''}`) }
}

/* ───────────── CDP 极简客户端 ───────────── */
class CDP {
  constructor(ws) {
    this.ws = ws
    this.id = 0
    this.pending = new Map()
    ws.addEventListener('message', (ev) => {
      const msg = JSON.parse(ev.data)
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id)
        this.pending.delete(msg.id)
        if (msg.error) reject(new Error(JSON.stringify(msg.error)))
        else resolve(msg.result)
      }
    })
  }

  send(method, params = {}) {
    const id = ++this.id
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject })
      this.ws.send(JSON.stringify({ id, method, params }))
    })
  }

  /** 在页面里跑一段表达式，返回它的值（必须可 JSON 序列化） */
  async eval(expr) {
    const r = await this.send('Runtime.evaluate', {
      expression: `(async () => { ${expr} })()`,
      awaitPromise: true,
      returnByValue: true,
    })
    if (r.exceptionDetails) {
      throw new Error('page error: ' +
        (r.exceptionDetails.exception?.description || r.exceptionDetails.text))
    }
    return r.result.value
  }
}

async function connect() {
  // 等 Chrome 的调试端口起来
  let target = null
  for (let i = 0; i < 600; i++) {
    try {
      const list = await fetch(`http://127.0.0.1:${PORT}/json/list`).then((r) => r.json())
      target = list.find((t) => t.type === 'page' && t.webSocketDebuggerUrl)
      if (target) break
    } catch { /* 还没起来 */ }
    await sleep(250)
  }
  if (!target) throw new Error(`连不上 CDP（端口 ${PORT}）`)

  const ws = new WebSocket(target.webSocketDebuggerUrl)
  await new Promise((res, rej) => {
    ws.addEventListener('open', res, { once: true })
    ws.addEventListener('error', rej, { once: true })
  })
  return new CDP(ws)
}

/** 轮询等待页面里的条件成立。**不要**用固定 sleep —— 收敛时间取决于机器。 */
async function waitFor(cdp, expr, label, timeoutMs = 180000) {
  const t0 = Date.now()
  let last = null
  while (Date.now() - t0 < timeoutMs) {
    try {
      last = await cdp.eval(`return ${expr}`)
      if (last) return last
    } catch (e) { last = e.message }
    await sleep(400)
  }
  throw new Error(`等待超时（${label}）：${JSON.stringify(last)}`)
}

/* ───────────── Spearman 秩相关 ───────────── */
function spearman(xs, ys) {
  const rank = (a) => {
    const idx = a.map((v, i) => [v, i]).sort((p, q) => p[0] - q[0])
    const r = new Array(a.length)
    // 并列取平均秩，避免"所有 importance 相同时"得出伪相关
    let i = 0
    while (i < idx.length) {
      let j = i
      while (j + 1 < idx.length && idx[j + 1][0] === idx[i][0]) j++
      const avg = (i + j) / 2
      for (let k = i; k <= j; k++) r[idx[k][1]] = avg
      i = j + 1
    }
    return r
  }
  const rx = rank(xs), ry = rank(ys)
  const n = xs.length
  const mx = rx.reduce((a, b) => a + b, 0) / n
  const my = ry.reduce((a, b) => a + b, 0) / n
  let num = 0, dx = 0, dy = 0
  for (let i = 0; i < n; i++) {
    num += (rx[i] - mx) * (ry[i] - my)
    dx += (rx[i] - mx) ** 2
    dy += (ry[i] - my) ** 2
  }
  return num / Math.sqrt(dx * dy)
}

/* ───────────── 主流程 ───────────── */
const chrome = spawn(CHROME, [
  '--headless=new',
  '--enable-unsafe-swiftshader',
  '--use-gl=angle',
  '--use-angle=swiftshader',
  `--remote-debugging-port=${PORT}`,
  '--window-size=1600,1000',
  '--no-first-run',
  '--no-default-browser-check',
  '--user-data-dir=' + process.env.TMP + '\\cn-cluster-' + PORT,
  URL,
], { stdio: 'ignore' })

let cdp = null
try {
  cdp = await connect()
  await cdp.send('Runtime.enable')

  console.log('\n═══ 猜想星团验证 ═══\n')

  await waitFor(cdp, '!!window.__nebula && !!document.querySelector("#diag")',
    '页面就绪', 240000)

  const diag = JSON.parse(await cdp.eval(
    'return document.querySelector("#diag").textContent'))

  /* ───────── ① 结构 ───────── */
  console.log('① 结构')
  ok(diag.conjectures === 59, `猜想节点数 = 59`, `实际 ${diag.conjectures}`)
  ok(diag.galaxy === 405, `主星系节点数 = 405`, `实际 ${diag.galaxy}`)
  ok(diag.nodes === 464, `总节点数 = 464`, `实际 ${diag.nodes}`)
  ok(diag.crossLinks > 100, `跨星团关联充足`, `${diag.crossLinks} 条`)
  ok(diag.failed === 0, `无烘焙失败`, `failed=${diag.failed}`)
  ok((diag.errors || []).length === 0, `无烘焙错误`)

  const geo = await cdp.eval(`
    const N = window.__nebula.graph;
    const G = N.nodes.filter(n => !n.cluster);
    const C = N.nodes.filter(n => n.cluster);
    // 球心取自 config —— 测试脚本不该硬编码它，否则改布局时脚本会静默失效
    const cc = window.__nebula.scene.clusterCenter;

    // ① 分离度：星团最近的节点到主星系最远的节点，中间要有空隙
    let galMax = 0;
    for (const n of G) galMax = Math.max(galMax, Math.hypot(n.basePos.x, n.basePos.y, n.basePos.z));

    // ② 球对称性：到球心的距离分布应中心聚集（King 剖面）
    const radii = C.map(n => Math.hypot(
      n.basePos.x - cc[0], n.basePos.y - cc[1], n.basePos.z - cc[2]));
    const cMin = Math.min(...radii), cMax = Math.max(...radii);
    const sorted = [...radii].sort((a, b) => a - b);
    const q = (p) => sorted[Math.min(sorted.length - 1, Math.floor(p * sorted.length))];

    // ③ 领域质心方向
    const byField = {};
    for (const n of C) (byField[n.field] = byField[n.field] || []).push(n);
    const cent = {};
    for (const [f, arr] of Object.entries(byField)) {
      const v = [0, 0, 0];
      for (const n of arr) {
        v[0] += n.basePos.x - cc[0];
        v[1] += n.basePos.y - cc[1];
        v[2] += n.basePos.z - cc[2];
      }
      const l = Math.hypot(...v) || 1;
      cent[f] = [v[0]/l, v[1]/l, v[2]/l];
    }
    const fs = Object.keys(cent);
    const seps = [];
    for (let i = 0; i < fs.length; i++)
      for (let j = i + 1; j < fs.length; j++) {
        const a = cent[fs[i]], b = cent[fs[j]];
        let d = a[0]*b[0] + a[1]*b[1] + a[2]*b[2];
        d = Math.max(-1, Math.min(1, d));
        seps.push(Math.acos(d) * 180 / Math.PI);
      }

    // ④ 状态与领域分布
    const byStatus = {}, byFieldN = {};
    for (const n of C) {
      byStatus[n.status] = (byStatus[n.status] || 0) + 1;
      byFieldN[n.field] = (byFieldN[n.field] || 0) + 1;
    }

    return {
      cc, galMax, cMin, cMax,
      gap: Math.hypot(...cc) - galMax - cMax,
      radii: { min: cMin, p25: q(.25), med: q(.5), p75: q(.75), max: cMax },
      innerFrac: radii.filter(r => r < cMax * 0.5).length / radii.length,
      seps: { min: Math.min(...seps), mean: seps.reduce((a,b)=>a+b,0)/seps.length },
      nFields: fs.length,
      byStatus, byFieldN,
      importance: C.map(n => n.importance),
      rank: C.map(n => n.rank),
      // 注意符号：半径越大 = 越不重要，所以这里取**负的半径**，
      // 使"越重要 → 值越大"，秩相关应为**正**（接近 +1）。
      negRadius: C.map(n => -Math.hypot(
        n.basePos.x - cc[0], n.basePos.y - cc[1], n.basePos.z - cc[2])),
      markers: C.filter(n => !!n.marker).length,
      markerColors: C.slice(0, 5).map(n => n.marker ? [
        +n.marker.material.color.r.toFixed(3),
        +n.marker.material.color.g.toFixed(3),
        +n.marker.material.color.b.toFixed(3)] : null),
      clusterInOwnGroup: C.every(n => n.group && n.group.name === 'cluster'),
      galaxyInOwnGroup: G.every(n => n.group && n.group.name === 'nodes'),
    };
  `)

  ok(geo.clusterInOwnGroup, '猜想节点都在独立的 cluster 组里')
  ok(geo.galaxyInOwnGroup, '主星系节点都在 nodes 组里')
  ok(geo.cMax <= 56, `星团半径 ≤ 56`, `实际 ${geo.cMax.toFixed(1)}`)
  ok(geo.cMin >= 5, `星团内半径 ≥ 5（不塌成一点）`, `实际 ${geo.cMin.toFixed(1)}`)
  ok(geo.gap > 25, `星团与主星系之间有净空`, `空档 ${geo.gap.toFixed(0)} 世界单位`)
  ok(geo.nFields === 6, `6 个领域都有节点`, `实际 ${geo.nFields}`)

  /* ───────── ② 语义：越靠球心越重要 ───────── */
  console.log('\n② 语义（越靠球心越重要）')
  const rhoImp = spearman(geo.importance, geo.negRadius)
  const rhoRank = spearman(geo.rank, geo.negRadius)
  ok(rhoImp > 0.94, `Spearman(importance, −球心距) > +0.94（越重要越靠球心）`,
    `ρ = ${rhoImp.toFixed(4)}`)
  ok(rhoRank > 0.94, `Spearman(rank, −球心距) > +0.94`,
    `ρ = ${rhoRank.toFixed(4)}`)

  /* King 剖面：中心聚集 → 中位半径应显著小于外半径。
   * 面积加权后的理论值是 0.567（coreRadius=0.14），留一点余量断言 < 0.62。 */
  ok(geo.radii.med < geo.radii.max * 0.62,
    `King 剖面中心聚集（中位半径 < 0.62×外半径）`,
    `中位 ${geo.radii.med.toFixed(1)} / 外 ${geo.radii.max.toFixed(1)}` +
    ` = ${(geo.radii.med / geo.radii.max).toFixed(3)}`)
  ok(geo.innerFrac >= 0.30, `内半区（r < 0.5·R）占 ≥30%，明显强于均匀球（12.5%）`,
    `${(geo.innerFrac * 100).toFixed(1)}%`)

  /* ───────── ③ 领域：球面上的星座 ───────── */
  console.log('\n③ 领域分布')
  ok(geo.seps.min > 55, `任意两个领域质心夹角 > 55°`,
    `最小 ${geo.seps.min.toFixed(1)}° / 平均 ${geo.seps.mean.toFixed(1)}°`)
  ok(geo.seps.mean > 90, `领域质心平均夹角 > 90°（分散而非聚成一堆）`,
    `平均 ${geo.seps.mean.toFixed(1)}°`)

  const fields = Object.keys(geo.byFieldN)
  ok(fields.length === 6, `领域种类 = 6`, fields.join('/'))
  const minField = Math.min(...Object.values(geo.byFieldN))
  ok(minField >= 4, `每个领域至少 4 条猜想`, `最少 ${minField}`)

  /* ───────── ④ 状态 ───────── */
  console.log('\n④ 状态标记')
  const st = geo.byStatus
  ok(!!st.open && st.open >= 25, `未解决状态数量合理`, `open=${st.open}`)
  ok(!!st.proved && st.proved >= 8, `已证明状态数量合理`, `proved=${st.proved}`)
  ok(geo.markers === 59, `59 条猜想都有状态色点`, `实际 ${geo.markers}`)
  ok(geo.markerColors.every((c) => c && (c[0] + c[1] + c[2]) > 0.05),
    '状态色点颜色都是非黑的（确实上了色）')

  /* 色点颜色必须按 status 区分：同状态同色、不同状态不同色。
   *
   * ⚠ 必须读 n.markerColor（布局阶段算好的**基准色**），不能读
   *   n.marker.material.color —— 后者每帧被 updateAppearance 乘上一个
   *   亮度系数（随纵深衰减、悬停加成都不同），所以同一个状态的不同节点
   *   会得到 19 种不同的值。这个测试最初就是这么写错的。 */
  const colorByStatus = await cdp.eval(`
    const C = window.__nebula.graph.nodes.filter(n => n.cluster);
    const m = {};
    for (const n of C) {
      const c = n.markerColor;
      m[n.status] = m[n.status] || new Set();
      m[n.status].add(c.r.toFixed(4) + ',' + c.g.toFixed(4) + ',' + c.b.toFixed(4));
    }
    const out = {};
    for (const [k, v] of Object.entries(m)) out[k] = [...v];
    return out;
  `)
  const allSame = Object.values(colorByStatus).every((v) => v.length === 1)
  ok(allSame, '同一状态的色点基准色一致', JSON.stringify(
    Object.fromEntries(Object.entries(colorByStatus).map(([k, v]) => [k, v.length]))))
  const distinct = new Set(Object.values(colorByStatus).map((v) => v[0]))
  ok(distinct.size === Object.keys(colorByStatus).length,
    '不同状态的色点颜色互不相同',
    `${Object.keys(colorByStatus).length} 种状态 / ${distinct.size} 种颜色`)

  /* 色点的基准色必须与 CONJECTURE_STATUS 里声明的颜色一致 ——
   * 否则色点和图例/详情面板说的就不是同一件事。 */
  const statusMatch = await cdp.eval(`
    const N = window.__nebula;
    const C = N.graph.nodes.filter(n => n.cluster);
    // 把 hex 转成 linear（与 graph.js 的 hexToLinear 同一套）
    const s2l = (u) => u <= 0.04045 ? u/12.92 : Math.pow((u+0.055)/1.055, 2.4);
    const hex2lin = (h) => {
      const v = h.replace('#','');
      return [0,2,4].map(i => s2l(parseInt(v.slice(i,i+2),16)/255));
    };
    const bad = [];
    for (const n of C) {
      const want = N.graph.conjStatusColors[n.status];
      if (!want) { bad.push(n.id + ': no def'); continue; }
      const c = n.markerColor;
      if (Math.abs(c.r-want[0])>2e-3 || Math.abs(c.g-want[1])>2e-3 || Math.abs(c.b-want[2])>2e-3) {
        bad.push(n.id + ' ' + n.status + ' got ' + [c.r,c.g,c.b].map(x=>x.toFixed(4))
          + ' want ' + want.map(x=>x.toFixed(4)));
      }
    }
    return bad;
  `)
  ok(statusMatch.length === 0, '色点颜色与 CONJECTURE_STATUS 声明一致',
    statusMatch.length ? statusMatch.slice(0, 3).join(' | ') : '')

  /* ───────── ⑤ 着色模式 ───────── */
  console.log('\n⑤ 着色模式对星团生效')
  const beforeStatus = await cdp.eval(`
    const C = window.__nebula.graph.nodes.filter(n => n.cluster);
    return C.map(n => n.baseColor.r.toFixed(3) + ',' + n.baseColor.g.toFixed(3));
  `)
  await cdp.eval(`window.__nebula.settings.setColorMode('field'); return true;`)
  await sleep(600)
  const afterField = await cdp.eval(`
    const C = window.__nebula.graph.nodes.filter(n => n.cluster);
    return C.map(n => n.baseColor.r.toFixed(3) + ',' + n.baseColor.g.toFixed(3));
  `)
  const changed = beforeStatus.filter((v, i) => v !== afterField[i]).length
  ok(changed > 20, `切到「按领域」后星团底色改变`, `${changed}/59 条变色`)

  await cdp.eval(`window.__nebula.settings.setColorMode('status'); return true;`)
  await sleep(600)
  const backToStatus = await cdp.eval(`
    const C = window.__nebula.graph.nodes.filter(n => n.cluster);
    return C.map(n => n.baseColor.r.toFixed(3) + ',' + n.baseColor.g.toFixed(3));
  `)
  const restored = backToStatus.filter((v, i) => v === beforeStatus[i]).length
  ok(restored === 59, `切回「按状态」完全复原`, `${restored}/59`)

  /* 主星系在两个模式下都必须保持族色不变 */
  const galUnchanged = await cdp.eval(`
    const G = window.__nebula.graph.nodes.filter(n => !n.cluster);
    return G.map(n => n.baseColor.r.toFixed(3));
  `)
  await cdp.eval(`window.__nebula.settings.setColorMode('mono'); return true;`)
  await sleep(600)
  const galMono = await cdp.eval(`
    const G = window.__nebula.graph.nodes.filter(n => !n.cluster);
    return G.map(n => n.baseColor.r.toFixed(3));
  `)
  ok(galUnchanged.filter((v, i) => v !== galMono[i]).length > 300,
    '切到「统一橙黄」后主星系确实全部变色')
  await cdp.eval(`window.__nebula.settings.setColorMode('family'); return true;`)
  await sleep(400)

  /* ───────── ⑥ 自转与视图 ───────── */
  console.log('\n⑥ 自转与取景')
  const spin = await cdp.eval(`
    const s = window.__nebula.scene;
    const a0 = s.clusterAngle;
    await new Promise(r => setTimeout(r, 1200));
    const a1 = s.clusterAngle;
    return { a0, a1, moved: a1 !== a0 };
  `)
  ok(spin.moved, '星团在自转（角度随时间变化）',
    `${spin.a0.toFixed(4)} → ${spin.a1.toFixed(4)}`)

  /* 视图过滤 */
  const v1 = await cdp.eval(`
    const s = window.__nebula.scene;
    s.setView('galaxy');
    return { cluster: s.clusterVisible, node: s.nodeGroup.visible, view: s.view };
  `)
  ok(!v1.cluster && v1.node, '「只看主星系」时星团隐藏、盘可见',
    JSON.stringify(v1))

  const v2 = await cdp.eval(`
    const s = window.__nebula.scene;
    s.setView('cluster');
    return { cluster: s.clusterVisible, node: s.nodeGroup.visible, view: s.view };
  `)
  ok(v2.cluster && !v2.node, '「只看星团」时盘隐藏、星团可见',
    JSON.stringify(v2))

  const v3 = await cdp.eval(`
    const s = window.__nebula.scene;
    s.setView('overview');
    return { cluster: s.clusterVisible, node: s.nodeGroup.visible, view: s.view };
  `)
  ok(v3.cluster && v3.node, '「全景」时两者都可见', JSON.stringify(v3))

  /* ───────── ⑦ 跨星团连线 ───────── */
  console.log('\n⑦ 跨星团连线')
  const cross = await cdp.eval(`
    const g = window.__nebula.graph;
    const L = g.links;
    const cross = L.filter(l => l.cross);
    // 跨星团边必须一端在星团、一端在盘
    let good = 0;
    for (const l of cross) {
      const a = g.byId.get(l.source), b = g.byId.get(l.target);
      if (a && b && a.cluster !== b.cluster) good++;
    }
    // 非跨星团边的 clusterSide 标注必须正确
    let sideOk = 0;
    for (const l of L) {
      if (l.cross) continue;
      const a = g.byId.get(l.source);
      if (a && l.clusterSide === (a.cluster ? 'cluster' : 'galaxy')) sideOk++;
    }
    return {
      total: L.length, cross: cross.length, good,
      nonCross: L.length - cross.length, sideOk,
    };
  `)
  ok(cross.good === cross.cross, `跨星团边两端确实分属两个结构`,
    `${cross.good}/${cross.cross}`)
  ok(cross.sideOk === cross.nonCross, `非跨星团边的归属标注全部正确`,
    `${cross.sideOk}/${cross.nonCross}`)

  /* 每个猜想至少要有一条连回主星系的边 —— 否则它就是孤立的浮点，
     读者无法从它出发找到任何数学内容 */
  const reach = await cdp.eval(`
    const g = window.__nebula.graph;
    const C = g.nodes.filter(n => n.cluster);
    const out = [];
    for (const n of C) {
      const has = n.linkIds.some(l => {
        const o = g.byId.get(l.source === n.id ? l.target : l.source);
        return o && !o.cluster;
      });
      if (!has) out.push(n.id);
    }
    return out;
  `)
  ok(reach.length === 0, `每条猜想都至少连回主星系一个定理`,
    reach.length ? `孤立：${reach.slice(0, 5).join(', ')}` : '')

  /* ───────── ⑧ 详情面板 ───────── */
  console.log('\n⑧ 详情面板')
  const detail = await cdp.eval(`
    const N = window.__nebula;
    const C = N.graph.nodes.filter(n => n.cluster);
    const open = C.find(n => n.id === 'cn-hodge') || C[0];
    N.scene.select(open.id);
    await new Promise(r => setTimeout(r, 700));
    const p = document.querySelector('#panel');
    const txt = p.textContent || '';
    return {
      on: p.classList.contains('on'),
      hasStatus: !!p.querySelector('.status'),
      statusText: p.querySelector('.status')?.textContent || '',
      hasTag: !!p.querySelector('.tag'),
      tagText: p.querySelector('.tag')?.textContent || '',
      hasKatex: !!p.querySelector('.katex'),
      name: p.querySelector('.nm')?.textContent || '',
      relCount: p.querySelectorAll('.rel').length,
      xbadges: p.querySelectorAll('.rel .xbadge').length,
      txt: txt.slice(0, 400),
    };
  `)
  ok(detail.on, '点击猜想后面板打开')
  ok(detail.hasKatex, '公式用 KaTeX 渲染')
  ok(detail.hasStatus, '面板有状态横幅', `"${detail.statusText.slice(0, 40)}"`)
  ok(detail.hasTag, '面板有领域标签', detail.tagText)
  ok(detail.relCount > 3, `关联列表非空`, `${detail.relCount} 条`)
  ok(detail.xbadges > 0, `跨星团关联有角标`, `${detail.xbadges} 个`)

  /* 定理的面板不该出现猜想专属内容。
   * ⚠ 这里必须挑一个**确实**连着猜想的定理。大多数定理只连定理，
   *   随便挑一个（比如 riemann-roch）会得到 0 个角标而误判为失败 ——
   *   这个测试自己的 bug 被跑出来的结果抓到过。所以先动态找一个
   *   有跨星团邻居的定理。 */
  const theoremPanel = await cdp.eval(`
    const N = window.__nebula;
    const g = N.graph;
    // 找一个与猜想直接相连的定理
    const gal = g.nodes.filter(n => !n.cluster);
    const target = gal.find(n => n.linkIds.some(l => {
      const o = g.byId.get(l.source === n.id ? l.target : l.source);
      return o && o.cluster;
    }));
    if (!target) return { none: true };
    N.scene.select(target.id);
    await new Promise(r => setTimeout(r, 700));
    const p = document.querySelector('#panel');
    return {
      id: target.id,
      on: p.classList.contains('on'),
      hasStatus: !!p.querySelector('.status'),
      hasKatex: !!p.querySelector('.katex'),
      relCount: p.querySelectorAll('.rel').length,
      xbadges: p.querySelectorAll('.rel .xbadge').length,
    };
  `)
  ok(!theoremPanel.none, '存在与猜想相连的定理（否则跨星团关联无意义）')
  ok(theoremPanel.on && theoremPanel.hasKatex, '定理详情正常打开',
    theoremPanel.id || '')
  ok(!theoremPanel.hasStatus, '定理面板**没有**猜想的状态横幅')
  ok(theoremPanel.xbadges > 0,
    '定理的关联里标出了"↦ 猜想"', `${theoremPanel.xbadges} 个（${theoremPanel.id}）`)

  await cdp.eval(`window.__nebula.scene.select(null); return true;`)
  await sleep(500)

  /* ───────── ⑨ 图例 ───────── */
  console.log('\n⑨ 图例')
  const legend = await cdp.eval(`
    const N = window.__nebula;
    N.settings.setColorMode('status');
    await new Promise(r => setTimeout(r, 500));
    const fams = [...document.querySelectorAll('#legend .fam')]
      .map(e => e.textContent);
    N.settings.setColorMode('family');
    await new Promise(r => setTimeout(r, 500));
    const fams2 = [...document.querySelectorAll('#legend .fam')]
      .map(e => e.textContent);
    return { status: fams, family: fams2 };
  `)
  ok(legend.status.some((t) => t.includes('猜想星团')),
    '「按猜想状态」模式下图例有星团分组', legend.status.slice(0, 3).join(' | '))
  ok(legend.status.some((t) => /未解决|已获证明|部分解决/.test(t)),
    '图例列出了状态名', legend.status.filter((t) => /未解决|已证|部分/.test(t)).join(' | '))
  ok(legend.family.some((t) => t.includes('猜想星团')),
    '「按知识族」模式下图例也提示了星团', legend.family.slice(-1)[0] || '')
  ok(!legend.family.some((t) => t.includes('undefined')),
    '图例里没有 undefined（星团节点的 family 不在 8 族里，必须被过滤）')

  /* ───────── ⑩ 显示层开关 ───────── */
  console.log('\n⑩ 显示层开关')
  const toggles = await cdp.eval(`
    const N = window.__nebula;
    const s = N.scene;
    N.settings.toggleDisplay('cluster');
    const a = s.clusterVisible;
    N.settings.toggleDisplay('cluster');
    const b = s.clusterVisible;
    return { off: a, on: b, state: N.settings.state.display.cluster };
  `)
  ok(toggles.off === false && toggles.on === true,
    '「猜想星团」开关能隐藏/显示整团', JSON.stringify(toggles))

  const markerToggle = await cdp.eval(`
    const N = window.__nebula;
    const C = N.graph.nodes.filter(n => n.cluster);
    N.settings.toggleDisplay('markers');
    await new Promise(r => setTimeout(r, 400));
    const off = C.filter(n => n.marker.visible).length;
    N.settings.toggleDisplay('markers');
    await new Promise(r => setTimeout(r, 400));
    const on = C.filter(n => n.marker.visible).length;
    return { off, on };
  `)
  ok(markerToggle.off === 0 && markerToggle.on === 59,
    '「状态色点」开关能整体隐藏/显示', JSON.stringify(markerToggle))

  /* ───────── ⑪ 拾取：星团节点能被点到 ───────── */
  console.log('\n⑪ 拾取')
  const pick = await cdp.eval(`
    const N = window.__nebula;
    const s = N.scene;
    s.setView('cluster');
    await new Promise(r => setTimeout(r, 1500));

    // 在屏幕上找几个星团节点的位置，逐个试拾取。
    // 用 __pickAt 而不是派发鼠标事件 —— 后者要算像素与 NDC 的换算，
    // 1px 的偏差就可能滑进透明 padding（这个坑在本项目里踩过）。
    // 投影自己算，不依赖页面里的 THREE（它是模块内变量，不是全局）。
    const C = N.graph.nodes.filter(n => n.cluster && n.sprite);
    const cam = s.camera;
    cam.updateMatrixWorld();
    const m = cam.projectionMatrix.elements;
    const vw = cam.matrixWorldInverse.elements;

    let hit = 0, tried = 0, offscreen = 0;
    for (const n of C) {
      // 世界坐标 = 局部位置 × 组矩阵
      const e = n.group.matrixWorld.elements;
      const p = n.sprite.position;
      const wx = e[0]*p.x + e[4]*p.y + e[8]*p.z + e[12];
      const wy = e[1]*p.x + e[5]*p.y + e[9]*p.z + e[13];
      const wz = e[2]*p.x + e[6]*p.y + e[10]*p.z + e[14];
      // 视坐标
      const vx = vw[0]*wx + vw[4]*wy + vw[8]*wz + vw[12];
      const vy = vw[1]*wx + vw[5]*wy + vw[9]*wz + vw[13];
      const vz = vw[2]*wx + vw[6]*wy + vw[10]*wz + vw[14];
      // 裁剪坐标 → NDC
      const cw = m[3]*vx + m[7]*vy + m[11]*vz + m[15];
      if (Math.abs(cw) < 1e-6) continue;
      const nx = (m[0]*vx + m[4]*vy + m[8]*vz + m[12]) / cw;
      const ny = (m[1]*vx + m[5]*vy + m[9]*vz + m[13]) / cw;
      if (Math.abs(nx) > 0.85 || Math.abs(ny) > 0.85) { offscreen++; continue; }
      tried++;
      const r = s.__pickAt(nx, ny, 4);
      // 允许被别的公式挡住，只要射线确实穿过了这一条
      if (r.hits.some(h => h.id === n.id)) hit++;
      if (tried >= 18) break;
    }
    return { tried, hit, offscreen };
  `)
  ok(pick.tried >= 8, `能取到足够多的星团屏幕样本`,
    `${pick.tried} 个（画外 ${pick.offscreen}）`)
  ok(pick.hit / Math.max(1, pick.tried) > 0.6,
    '投影点上的射线命中率 > 60%',
    `${pick.hit}/${pick.tried} = ${(pick.hit / Math.max(1, pick.tried) * 100).toFixed(0)}%`)

  /* 反过来：星团应该只占屏幕的一部分，"只看星团"时盘上的公式必须落在画外 */
  const isolated = await cdp.eval(`
    const s = window.__nebula.scene;
    s.setView('galaxy');
    await new Promise(r => setTimeout(r, 1200));
    const f1 = s.fit;
    s.setView('cluster');
    await new Promise(r => setTimeout(r, 1200));
    const f2 = s.fit;
    return { gal: f1, cl: f2 };
  `)
  ok(isolated.cl.distance < isolated.gal.distance,
    '「只看星团」比「只看主星系」相机更近（星团更小 → 该凑近看）',
    `盘 ${isolated.gal.distance.toFixed(0)} → 团 ${isolated.cl.distance.toFixed(0)}`)
  ok(Math.hypot(...isolated.cl.target) > 200,
    '「只看星团」时瞄准点确实移到了星团',
    `target = [${isolated.cl.target.map((v) => v.toFixed(0)).join(', ')}]`)
  ok(Math.hypot(...isolated.gal.target) < 5,
    '「只看主星系」时瞄准点回到原点',
    `target = [${isolated.gal.target.map((v) => v.toFixed(0)).join(', ')}]`)

  await cdp.eval(`window.__nebula.scene.setView('overview'); return true;`)

  /* ───────── 结果 ───────── */
  console.log(`\n${'═'.repeat(46)}`)
  console.log(`结果：${pass} 通过 / ${fail} 失败`)
  if (fail) {
    console.log('失败项：')
    for (const f of failures) console.log('  · ' + f)
  }
  console.log('═'.repeat(46))

  process.exitCode = fail ? 1 : 0
} catch (err) {
  console.error('\n验证脚本出错：', err.message)
  process.exitCode = 1
} finally {
  try { cdp?.ws.close() } catch { /* ignore */ }
  chrome.kill()
}
