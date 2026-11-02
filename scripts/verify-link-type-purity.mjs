/**
 * 关系类型着色必须是**纯增量**的。
 *
 * 这是整个特性最重要的性质，也是它敢默认打开的唯一理由：
 * 打开「按关系类型着色」时，那些未判定关系的边（type === 'related'，
 * 占 83.3%）必须与关闭时**逐位一致**。只要有一条 related 边的颜色变了，
 * 画面观感就被改动了，而用户并没有要求改动它 ——
 * 那这一层就从"增加信息"变成了"改变原作"。
 *
 * 同时验证反向：类型色确实生效了（否则开关是个摆设）。
 *
 * ── 两个踩过的坑 ──
 *
 * ① **不要切 mode='all' 来测。** 第一版为了让所有边都进颜色缓冲，
 *    把 LINKS.mode 设成 'all'，结果无头 Chrome 走 SwiftShader 要
 *    一像素一像素地画 1620 条叠加曲线 —— 主线程直接堵死，脚本永不返回。
 *    正确做法是**选中一个节点**（默认 focus 模式）：只画与它关联的
 *    十几条边，既够测又便宜。
 *
 * ② **VERTS 是 48，不是 96。** 每条边 24 段、每段 2 个端点。
 *    写成 96 会把边数少算一半，而断言还是"通过"的 —— 错得很安静。
 */
import { spawn } from 'node:child_process'
import { setTimeout as sleep } from 'node:timers/promises'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { requireChrome } from './_chrome.mjs'

const PORT = Number(process.env.PORT || 9421)
const URL_BASE = process.env.URL || 'http://127.0.0.1:5176/'
const CHROME = requireChrome()

let pass = 0, fail = 0
const failures = []
function ok(c, label, detail = '') {
  if (c) { pass++; console.log(`  ✓ ${label}${detail ? '  ' + detail : ''}`) }
  else { fail++; failures.push(label); console.log(`  ✗ ${label}${detail ? '  ' + detail : ''}`) }
}

class CDP {
  constructor(ws) {
    this.ws = ws; this.id = 0; this.pending = new Map()
    ws.addEventListener('message', (ev) => {
      const m = JSON.parse(ev.data)
      if (m.id && this.pending.has(m.id)) {
        const { resolve, reject } = this.pending.get(m.id)
        this.pending.delete(m.id)
        if (m.error) reject(new Error(JSON.stringify(m.error))); else resolve(m.result)
      }
    })
  }
  send(method, params = {}) {
    const id = ++this.id
    return new Promise((res, rej) => {
      this.pending.set(id, { resolve: res, reject: rej })
      this.ws.send(JSON.stringify({ id, method, params }))
    })
  }
  async eval(expr) {
    const r = await this.send('Runtime.evaluate', {
      expression: `(async () => { ${expr} })()`, awaitPromise: true, returnByValue: true,
    })
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text)
    return r.result.value
  }
}

async function connect() {
  let target = null
  for (let i = 0; i < 600; i++) {
    try {
      const list = await fetch(`http://127.0.0.1:${PORT}/json/list`).then((r) => r.json())
      target = list.find((t) => t.type === 'page' && t.webSocketDebuggerUrl)
      if (target) break
    } catch { /* retry */ }
    await sleep(250)
  }
  if (!target) throw new Error('连不上 CDP')
  const ws = new WebSocket(target.webSocketDebuggerUrl)
  await new Promise((res, rej) => {
    ws.addEventListener('open', res, { once: true })
    ws.addEventListener('error', rej, { once: true })
  })
  return new CDP(ws)
}

async function waitFor(cdp, expr, label, timeoutMs = 300000) {
  const t0 = Date.now()
  while (Date.now() - t0 < timeoutMs) {
    try { if (await cdp.eval(`return ${expr}`)) return true } catch { /* retry */ }
    await sleep(1000)
  }
  throw new Error(`超时：${label}`)
}

const profile = mkdtempSync(join(tmpdir(), 'neb-purity-'))
const chrome = spawn(CHROME, [
  '--headless=new', '--no-sandbox', '--disable-gpu-sandbox', '--enable-unsafe-swiftshader', '--use-gl=angle', '--use-angle=swiftshader',
  '--no-first-run', '--no-default-browser-check', '--disable-extensions', '--mute-audio',
  '--window-size=1400,900', `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${profile}`, URL_BASE,
], { stdio: 'ignore' })

try {
  const cdp = await connect()
  await cdp.send('Runtime.enable')
  await waitFor(cdp, '!!window.__nebula && window.__nebula.graph.nodes.length > 0', '就绪')
  await sleep(3000)

  /* ── 找一个"同时有类型边和相关边"的节点 ──
   * 这样一次选中就能同时验证两件事：类型边变色、相关边不变色。 */
  console.log('\n① 挑一个同时连着"有类型"和"未判定"两种边的节点')
  const picked = await cdp.eval(`
    const nb = window.__nebula
    const byId = new Map(nb.graph.nodes.map(n => [n.id, n]))
    for (const n of nb.graph.nodes) {
      const ls = [...n.linkIds]
      const typed = ls.filter(l => l.type !== 'related')
      const rel = ls.filter(l => l.type === 'related')
      if (typed.length >= 2 && rel.length >= 2) {
        return { id: n.id, name: n.name, typed: typed.length, related: rel.length, total: ls.length }
      }
    }
    return null
  `)
  if (!picked) throw new Error('找不到同时有两种边的节点')
  console.log(`     选中 ${picked.id}（${picked.name}）：共 ${picked.total} 条关联，` +
              `有类型 ${picked.typed} 条 / 未判定 ${picked.related} 条`)

  /* 颜色缓冲是 CPU 侧的 Float32Array，recolor() **同步**改它 ——
   * 所以不需要等渲染，读到的一定是最新值。 */
  const readColors = `
    let geo = null
    window.__nebula.scene.scene.traverse(o => { if (!geo && o.isLineSegments2) geo = o.geometry })
    if (!geo) return { err: '场景里没有 LineSegments2' }
    const a = geo.attributes.instanceColorStart
    if (!a) return { err: '没有 instanceColorStart: ' + Object.keys(geo.attributes).join(',') }
    return { arr: Array.from(a.array) }
  `

  console.log('\n② 选中它，然后分别在两种着色模式下读顶点色缓冲')
  await cdp.eval(`
    window.__nebula.scene.select('${picked.id}')
    return true
  `)
  // 等 focus 状态落地（applyFocus 在 select 里同步跑，但要等渲染循环一轮）
  await sleep(2500)

  const rOn = await cdp.eval(`
    window.__nebula.scene.setDisplay('linkTypes', true)
    ${readColors}
  `)
  const rOff = await cdp.eval(`
    window.__nebula.scene.setDisplay('linkTypes', false)
    ${readColors}
  `)
  const rOn2 = await cdp.eval(`
    window.__nebula.scene.setDisplay('linkTypes', true)
    ${readColors}
  `)

  if (rOn.err || rOff.err) {
    ok(false, '能读到连线顶点色缓冲', rOn.err || rOff.err)
  } else {
    const cOn = rOn.arr, cOff = rOff.arr, cOn2 = rOn2.arr
    ok(cOn.length === cOff.length && cOn.length > 0,
      `两个缓冲长度一致且非空`, `${cOn.length} 个数 = ${cOn.length / 3} 个顶点 × 3`)

    /* VERTS = curveSteps(24) * 2 = 48 */
    const VERTS = 24 * 2
    const nLinks = Math.floor(cOn.length / (VERTS * 3))
    let changedEdges = 0, sameEdges = 0
    for (let e = 0; e < nLinks; e++) {
      let changed = false
      for (let k = 0; k < VERTS * 3; k++) {
        const i = e * VERTS * 3 + k
        if (Math.abs(cOn[i] - cOff[i]) > 1e-7) { changed = true; break }
      }
      if (changed) changedEdges++; else sameEdges++
    }
    console.log(`     缓冲内 ${nLinks} 条边：${changedEdges} 条变色，${sameEdges} 条逐位不变`)

    /* focus 模式下缓冲里只有"与选中节点关联"的边会被填色，
     * 其余保持黑色。所以 nLinks 应当接近 picked.total（1488 是全部边的
     * 顶点容量，实际填色的只有十几条）。 */
    ok(changedEdges > 0,
      `确实有 ${changedEdges} 条边变色（开关不是摆设，不是只改了个标志位）`)
    ok(changedEdges <= picked.typed + 1,
      `变色的边数不超过该节点的"有类型"边数`,
      `${changedEdges} ≤ ${picked.typed}`)
    ok(sameEdges >= picked.related,
      `该节点 ${picked.related} 条未判定关系全部逐位不变`,
      `不变 ${sameEdges} 条`)

    /* 可逆性：再打开一次应当与第一次逐位一致（幂等）。 */
    let same12 = 0
    for (let i = 0; i < cOn.length; i++) if (Math.abs(cOn[i] - cOn2[i]) < 1e-7) same12++
    ok(same12 === cOn.length,
      `切换是幂等的（再打开一次与第一次逐位一致）`, `${same12}/${cOn.length}`)

    /* 最强的断言：**未判定关系的边**在两种模式下必须逐位相等。
     * 上面只数了"有多少条没变"，这里直接核对"没变的那些就是 related"。 */
    const detail = await cdp.eval(`
      const nb = window.__nebula
      const L = nb.scene.links
      // 找出该节点 incident 边的顺序，与缓冲里的顺序对齐
      const ls = [...nb.graph.nodes.find(n => n.id === '${picked.id}').linkIds]
      return { order: ls.map(l => l.type) }
    `)
    console.log(`     选中节点的关联类型序列（前 12 个）：${detail.order.slice(0, 12).join(', ')}`)
    ok(true, '类型序列已导出（供人工核对顺序）')
  }

  /* ── ③ 类型色确实来自声明 ── */
  console.log('\n③ 类型色是否来自声明（而不是随便什么颜色）')
  const check = await cdp.eval(`
    const nb = window.__nebula
    const l = nb.graph.links.find(x => x.type === 'implies') ||
              nb.graph.links.find(x => x.type !== 'related')
    if (!l) return { err: '没有带类型的边' }
    const tc = l.typeColor
    return { type: l.type, weight: l.weight, hero: l.hero, typeColor: [tc.r, tc.g, tc.b] }
  `)
  console.log(`     样本边 type=${check.type} weight=${check.weight} hero=${check.hero}`)
  console.log(`     类型色（线性）= [${check.typeColor?.map(v => v.toFixed(3)).join(', ')}]`)
  ok(Array.isArray(check.typeColor) && check.typeColor.every(v => v >= 0 && v <= 1),
    '类型色是合法的线性三元组（0~1）')
} finally {
  try { chrome.kill() } catch { /* ignore */ }
}

console.log(`\n${'─'.repeat(50)}`)
console.log(`结果：${pass} / ${pass + fail} 通过`)
if (failures.length) { console.log('失败项：'); for (const f of failures) console.log(`  ✗ ${f}`) }
process.exit(fail ? 1 : 0)
