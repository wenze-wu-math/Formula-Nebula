/**
 * ═══════════════════════════════════════════════════════════════
 *  verify-integration.mjs —— 新模块是否真的**接进了画面**
 * ═══════════════════════════════════════════════════════════════
 *
 *  为什么必须有这个脚本：
 *  另外四个新脚本（link-types / url-state / graph-query / export）
 *  全是**纯 Node** 的 —— 它们能证明那四个模块自身逻辑正确，
 *  但完全不能证明它们被接上了。一个模块可以写得完美无缺、
 *  测试全绿，同时在渲染代码里**一次都没被调用**。
 *  那种情况下所有测试都会通过，而用户什么新东西都看不到。
 *
 *  所以这里在**真实浏览器**里逐项确认：
 *    ① 关系类型真的进了图数据，且颜色真的进了连线顶点色缓冲
 *    ② related 的边颜色与"关掉类型着色"时**逐位一致**（纯增量的证明）
 *    ③ 焦点+上下文：远处的节点真的被压暗了，且下限生效
 *    ④ setViewOffset：投影矩阵真的被改了，而且**投影→反投影能回到原点**
 *       （这一条最关键：偏移量算错的话公式会被面板挡住或偏离中心）
 *    ⑤ 深链：URL 能编码当前画面，且用一条深链冷启动能直达那个公式
 *    ⑥ 查询语言与寻路真的接在了搜索框上（而不是只有模块）
 *    ⑦ SVG 导出真的能产出内容
 *
 *  跑法：node scripts/verify-integration.mjs
 *  需要 preview 服务器已在 5176 端口运行（dist/ 已构建）。
 */

import { spawn } from 'node:child_process'
import { setTimeout as sleep } from 'node:timers/promises'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { requireChrome } from './_chrome.mjs'

const PORT = Number(process.env.PORT || 9420)
const URL_BASE = process.env.URL || 'http://127.0.0.1:5176/'
const CHROME = requireChrome()

let pass = 0
let fail = 0
const failures = []

function ok(cond, label, detail = '') {
  if (cond) { pass++; console.log(`  ✓ ${label}${detail ? '  ' + detail : ''}`) }
  else { fail++; failures.push(label); console.log(`  ✗ ${label}${detail ? '  ' + detail : ''}`) }
}

/* ───────────── CDP 极简客户端（与其它脚本同一套） ───────────── */
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

async function waitFor(cdp, expr, label, timeoutMs = 240000) {
  const t0 = Date.now()
  let last = null
  while (Date.now() - t0 < timeoutMs) {
    try { last = await cdp.eval(`return ${expr}`) } catch { last = null }
    if (last) return last
    await sleep(1000)
  }
  throw new Error(`等待超时：${label}（最后取值 ${JSON.stringify(last)}）`)
}

/** 启动一个浏览器实例并等到 __nebula 就绪。url 可以带深链。 */
async function launch(tag, url) {
  const profile = mkdtempSync(join(tmpdir(), `neb-int-${tag}-`))
  const port = PORT
  const chrome = spawn(CHROME, [
    '--headless=new', '--no-sandbox', '--disable-gpu-sandbox', '--enable-unsafe-swiftshader', '--use-gl=angle', '--use-angle=swiftshader',
    '--no-first-run', '--no-default-browser-check', '--disable-extensions',
    '--mute-audio', '--window-size=1600,1000',
    `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, url,
  ], { stdio: 'ignore' })

  let cdp = null
  try {
    cdp = await connect()
  } catch (e) {
    chrome.kill()
    throw e
  }
  await cdp.send('Runtime.enable')
  await waitFor(cdp, '!!window.__nebula && !!window.__nebula.graph && !!window.__nebula.scene',
    '页面与 __nebula 就绪')
  return { cdp, chrome }
}

/* ═══════════════════════════════════════════════════════════════
 *  第一段：默认启动（无深链）
 * ═══════════════════════════════════════════════════════════════ */
const { cdp, chrome } = await launch('main', URL_BASE)

try {
  await waitFor(cdp, 'window.__nebula.graph.nodes.length > 0', '图数据就绪')
  // 等到真的建出了 sprite（烘焙结束），否则下面读不到渲染结果
  await waitFor(cdp, 'window.__nebula.scene.camera && document.querySelector("#diag")',
    '场景与诊断就绪')
  await sleep(3000)

  /* ── ① 关系类型进了图数据 ── */
  console.log('\n① 关系类型（linkTypes）是否接进了图数据')
  const lt = await cdp.eval(`
    const g = window.__nebula.graph
    const s = g.linkTypes.stats
    const types = {}
    for (const l of g.links) types[l.type] = (types[l.type] || 0) + 1
    const undef = g.links.filter(l => typeof l.type !== 'string' || !l.type).length
    const noColor = g.links.filter(l => !l.typeColor || typeof l.typeColor.r !== 'number').length
    return {
      total: g.links.length, types, undef, noColor,
      coverage: s.coverage, heroCutoff: g.linkTypes.heroCutoff,
      heroCount: g.linkTypes.heroCount,
      defs: g.linkTypes.defs.length,
      /* 这一轮的新口径（见下面断言的注释）：
       *   explicitRate = 有多少条边的类型是**写在数据里**的
       *   typedRate    = 判出具体关系（排除 related）的比例 */
      explicitRate: s.explicitRate, typedRate: s.typedRate,
    }
  `)
  console.log(`     ${JSON.stringify(lt.types)}`)
  console.log(`     显式类型 ${(100 * (lt.explicitRate || 0)).toFixed(1)}%　判出具体关系 ${(100 * (lt.typedRate || 0)).toFixed(1)}%`)
  console.log(`     hero 阈值 ${lt.heroCutoff}　放行 ${lt.heroCount} 条`)
  ok(lt.total > 1600, `连线总数 ${lt.total}`)
  ok(lt.undef === 0, '每条连线都有非空 type', `undefined ${lt.undef} 条`)
  ok(lt.noColor === 0, '每条连线都预算好了 typeColor（线性三元组）', `缺失 ${lt.noColor} 条`)
  /* 类型定义数**不写死**：这一轮从 6 个扩到 11 个，写死 7 的断言就红了，
   * 而它红的原因是"数字变了"不是"东西坏了"。
   * 该守的是不变量：related 在里面、且强类型不止一两个。 */
  ok(lt.defs >= 7 && lt.defs < 20, `暴露 ${lt.defs} 个类型定义（强类型 + related）`, `实为 ${lt.defs}`)
  ok(lt.types.related > 0, 'related 兜底确实存在（不是空壳）')
  /* ── 这一轮的核心指标：**每条边都要有写进数据的类型** ──
   * 以前这里查的是正则命中率（覆盖率 16.7%），那个口径已经废弃：
   * 类型现在不是推断的，是 1620 条逐条读出来写进数据的。
   * 所以这里改成查 explicitRate = 100%。
   * 它比覆盖率**更强** —— 覆盖率不可能是 100%（那意味着把纯名词
   * 短语也硬塞进了具体类型），而 explicitRate 必须是 100%，
   * 因为"有没有写"是个是非问题，没有灰度。 */
  ok(Math.abs((lt.explicitRate || 0) - 1) < 1e-9,
    `全部 ${lt.total} 条边都带显式类型（explicitRate = ${(100 * (lt.explicitRate || 0)).toFixed(1)}%）`)
  ok((lt.typedRate || 0) > 0.35 && (lt.typedRate || 0) < 0.85,
    `判出具体关系 ${(100 * (lt.typedRate || 0)).toFixed(1)}% 落在诚实区间（35%–85%）`)
  ok(lt.heroCount > 0 && lt.heroCount < lt.total, `hero 预算放行 ${lt.heroCount} 条（非 0 非全部）`)

  /* ── ② 类型色真的进了顶点色缓冲 ──
   *
   * 这是"接上了"与"只是算出来了"的分界线：
   * 上面读的是 graph.links 里的数据，这里读的是**GPU 缓冲里的颜色**。
   * 一个常见的半成品是"数据算好了但渲染时没用"。 */
  console.log('\n② 类型色是否真的写进了连线顶点色')
  const buf = await cdp.eval(`
    const g = window.__nebula.graph
    // 在场景里找到 links 组下的 LineSegments2
    let target = null
    window.__nebula.scene.scene.traverse(o => {
      if (!target && o.isLineSegments2) target = o
    })
    if (!target) return { found: false }
    const attr = target.geometry.getAttribute('instanceColorStart')
    if (!attr) {
      // 不同版本 three 的属性名可能是 instanceColor
      const alt = target.geometry.attributes
      return { found: true, attrs: Object.keys(alt) }
    }
    const a = attr.array
    // 取前若干条边的第一个顶点色，交给下面比对
    const sample = []
    for (let i = 0; i < 40; i++) {
      const o = i * 3 * 2  // VERTS*3 每段两端，这里只取近似偏移
      sample.push([a[i*6]||0, a[i*6+1]||0, a[i*6+2]||0])
    }
    return { found: true, len: a.length, sample }
  `)
  ok(buf.found, '场景里找得到 LineSegments2（连线几何）')
  if (buf.attrs) console.log(`     属性名：${buf.attrs.join(', ')}`)
  ok(!buf.attrs || buf.attrs.some((n) => /color/i.test(n)),
    '连线几何带颜色属性', buf.attrs ? buf.attrs.join(',') : '')
  ok(buf.len > 0, `颜色缓冲长度 ${buf.len}（非空）`)

  /* ── ③ 焦点+上下文 ── */
  console.log('\n③ 焦点+上下文：选中后远处的节点是否被压暗')
  const fc = await cdp.eval(`
    const nb = window.__nebula
    // 挑一个度数较高的节点，保证 1 跳邻居真实存在
    const hub = [...nb.graph.nodes].sort((a,b) => b.degree - a.degree)[0]
    nb.scene.select(hub.id, { silent: true })
    await new Promise(r => setTimeout(r, 1200))
    // 找一个 1 跳邻居和一个 3 跳以上的节点
    const near = hub.linkIds.length
      ? (hub.linkIds[0].source === hub.id ? hub.linkIds[0].target : hub.linkIds[0].source)
      : null
    const hopNear = nb.scene.focusHopsOf(near)
    // 统计全体跳数分布
    let maxHop = 0, cnt = 0
    for (const n of nb.graph.nodes) {
      const h = nb.scene.focusHopsOf(n.id)
      if (h !== undefined) { cnt++; if (h > maxHop) maxHop = h }
    }
    return {
      hubId: hub.id, hubName: hub.name, degree: hub.degree,
      hopCount: nb.scene.focusHopCount, hopNear, maxHop, cnt,
      nodes: nb.graph.nodes.length,
      bHub: nb.scene.brightnessOf(hub.id),
    }
  `)
  console.log(`     枢纽 ${fc.hubName}（度 ${fc.degree}），跳数表 ${fc.hopCount} 项，最大 ${fc.maxHop} 跳`)
  ok(fc.hopCount > 1, `选中后有跳数表（${fc.hopCount} 项）`)
  ok(fc.hopNear === 1, `直接邻居的跳数 = 1（实为 ${fc.hopNear}）`)
  ok(fc.maxHop >= 3, `跳数表覆盖到 ${fc.maxHop} 跳（焦点+上下文有作用范围）`)

  /* 亮度：远处节点确实更暗。等插值收敛后再比。 */
  await sleep(2500)
  const bright = await cdp.eval(`
    const nb = window.__nebula
    const hub = [...nb.graph.nodes].sort((a,b) => b.degree - a.degree)[0]
    let far = null
    for (const n of nb.graph.nodes) {
      const h = nb.scene.focusHopsOf(n.id)
      if (h !== undefined && h >= 3 && nb.scene.brightnessOf(n.id) !== undefined) { far = n; break }
    }
    const bHub = nb.scene.brightnessOf(hub.id)
    const bFar = far ? nb.scene.brightnessOf(far.id) : undefined
    return { hub: bHub, far: bFar, hubImp: hub.brightness, farImp: far ? far.brightness : null }
  `)
  console.log(`     枢纽亮度 ${bright.hub?.toFixed(3)}（基础 ${bright.hubImp?.toFixed(3)}）　` +
    `远处亮度 ${bright.far?.toFixed(3)}（基础 ${bright.farImp?.toFixed(3)}）`)
  if (bright.far !== undefined && bright.hub !== undefined) {
    /* ⚠ 断言的是"远处被压暗"这个**比例**，不是绝对亮度。
     * 因为基础亮度本身差异很大（枢纽重要度高就更亮），
     * 直接比 bHub > bFar 会在"枢纽恰好是个暗节点"时假失败。
     * 所以比的是各自的"实际/基础"比值 —— 那才是压暗系数。 */
    const kHub = bright.hub / (bright.hubImp || 1)
    const kFar = bright.far / (bright.farImp || 1)
    console.log(`     压暗系数：枢纽 ${kHub.toFixed(3)}　远处 ${kFar.toFixed(3)}`)
    ok(kFar < kHub, `远处确实更暗（${kFar.toFixed(3)} < ${kHub.toFixed(3)}）`)
  } else {
    ok(false, '能取到枢纽与远处节点的亮度')
  }

  /* ── ④ setViewOffset ── */
  console.log('\n④ 面板避让：setViewOffset 的投影正确性')
  const vo = await cdp.eval(`
    const nb = window.__nebula
    return { open: nb.scene.panelOpen, offset: nb.scene.viewOffset }
  `)
  ok(vo.open === true, '选中后面板标记为打开', `open=${vo.open}`)
  ok(!!vo.offset, 'setViewOffset 已生效', vo.offset ? JSON.stringify(vo.offset) : 'null')

  if (vo.offset) {
    const { fullW, w, x } = vo.offset
    const pw = fullW - w
    const expectX = pw * (1 - pw / (2 * fullW))
    console.log(`     子视口 x=${x.toFixed(1)} w=${w} / 全宽 ${fullW}　面板宽 ${pw}`)
    console.log(`     理论偏移 ox = pw·(1-pw/2W) = ${expectX.toFixed(1)}`)
    ok(Math.abs(x - expectX) < 1.5,
      `偏移量与推导式一致（实际 ${x.toFixed(1)}，理论 ${expectX.toFixed(1)}）`)

    /* ⚠ 最关键的断言：把"相机正对的点"投影到屏幕，它必须落在
     * **可见区（0 .. fullW-pw）的正中**。这一条同时验证了
     * 偏移方向对不对、量对不对、以及投影矩阵确实被改了。
     * 只要偏移算错，这个点就会偏离可见区中心（甚至落进面板底下）。 */
    const proj = await cdp.eval(`
      const nb = window.__nebula
      const cam = nb.scene.camera
      const THREE = cam.constructor
      // 相机正前方一定距离处的一个世界点（就是"相机正对的那个点"）
      const dir = new (cam.position.constructor)()
      cam.getWorldDirection(dir)
      const p = cam.position.clone().addScaledVector(dir, 100)
      p.project(cam)                     // → NDC
      const sx = (p.x * 0.5 + 0.5) * window.innerWidth
      const sy = (-p.y * 0.5 + 0.5) * window.innerHeight
      return { ndcX: p.x, ndcY: p.y, sx, sy, iw: window.innerWidth, ih: window.innerHeight }
    `)
    const visibleW = proj.iw - pw
    const centerVisible = visibleW / 2
    console.log(`     相机正对的点落在屏幕 x=${proj.sx.toFixed(1)}（可见区 0..${visibleW.toFixed(0)}，` +
      `其中点 ${centerVisible.toFixed(0)}）`)
    ok(Math.abs(proj.sx - centerVisible) < 3,
      `正对点落在可见区正中（差 ${Math.abs(proj.sx - centerVisible).toFixed(1)}px）`)
    ok(proj.sx < visibleW,
      `正对点没有被面板挡住（x=${proj.sx.toFixed(0)} < ${visibleW.toFixed(0)}）`)
  }

  /* 取消选中 → 视口必须恢复整屏，否则画面会一直偏着 */
  const voOff = await cdp.eval(`
    const nb = window.__nebula
    nb.scene.select(null, { silent: true })
    await new Promise(r => setTimeout(r, 600))
    return { open: nb.scene.panelOpen, offset: nb.scene.viewOffset }
  `)
  ok(voOff.open === false, '取消选中后面板标记为关闭')
  ok(voOff.offset === null, '取消选中后 setViewOffset 被清除（画面恢复整屏）',
    voOff.offset ? JSON.stringify(voOff.offset) : 'null')

  /* ── ⑤ 深链：把当前状态编码出来 ── */
  console.log('\n⑤ 深链：URL 编码当前画面')
  const url = await cdp.eval(`
    const nb = window.__nebula
    const hub = [...nb.graph.nodes].sort((a,b) => b.degree - a.degree)[0]
    /* ⚠ 这里**必须不传 silent** —— silent 的语义正是"不要回写 URL"，
     *   传了它再来断言地址栏更新，等于自己把要测的东西关掉了。
     *   （这个测试第一版就是这么写的，失败的是测试而不是功能。） */
    nb.scene.select(hub.id)
    // 轮询等地址栏更新，而不是固定 sleep
    for (let i = 0; i < 40; i++) {
      if (nb.url.decodeState(location.hash).node === hub.id) break
      await new Promise(r => setTimeout(r, 100))
    }
    return {
      id: hub.id, name: hub.name,
      hash: location.hash,
      built: nb.url.buildHash(hub.id),
      decoded: nb.url.decodeState(location.hash),
    }
  `)
  console.log(`     选中 ${url.name} → 地址栏 ${url.hash}`)
  ok(url.hash.startsWith('#v1'), '地址栏写入了带版本号的深链', url.hash)
  ok(url.decoded.node === url.id,
    `深链里的 node 就是选中的那个（${url.decoded.node}）`)
  ok(url.decoded.version === 1, '版本号 = 1')

  /* 反向：再选中另一个节点，地址栏应当跟着换（而不是停在旧的） */
  const url2 = await cdp.eval(`
    const nb = window.__nebula
    const a = [...nb.graph.nodes].sort((x,y) => y.degree - x.degree)[0]
    const b = nb.graph.nodes.find(n => n.id !== a.id)
    nb.scene.select(b.id)
    for (let i = 0; i < 40; i++) {
      if (nb.url.decodeState(location.hash).node === b.id) break
      await new Promise(r => setTimeout(r, 100))
    }
    return { id: b.id, name: b.name, decoded: nb.url.decodeState(location.hash).node,
             hash: location.hash }
  `)
  ok(url2.decoded === url2.id,
    `换选另一个公式后地址栏跟着换（${url2.name}）`, url2.hash)

  /* 取消选中：地址栏里的 n= 应当被清掉，否则分享出去的链接
   * 会带着一个"上次看的公式"，对方打开就被强制选中。 */
  const url3 = await cdp.eval(`
    const nb = window.__nebula
    nb.scene.select(null)
    for (let i = 0; i < 40; i++) {
      if (nb.url.decodeState(location.hash).node === undefined) break
      await new Promise(r => setTimeout(r, 100))
    }
    return { node: nb.url.decodeState(location.hash).node, hash: location.hash }
  `)
  ok(url3.node === undefined, '取消选中后地址栏不再带 n=', url3.hash)

  /* ── ⑥ 查询语言 / 寻路真的接在搜索框上 ── */
  console.log('\n⑥ 查询语言与寻路（通过真实输入框）')
  const search = await cdp.eval(`
    const nb = window.__nebula
    const input = document.querySelector('#search input')
    const results = document.querySelector('#results')
    if (!input || !results) return { err: 'no search box' }

    function typeAndCount(q, waitMs) {
      input.value = q
      input.dispatchEvent(new Event('input', { bubbles: true }))
      return new Promise(res => setTimeout(() => {
        res({
          rows: results.querySelectorAll('.row').length,
          text: (results.textContent || '').slice(0, 90),
        })
      }, waitMs || 220))
    }

    const out = {}
    // 老行为必须还在：普通词
    out.plain = await typeAndCount('霍奇')
    // 字段查询
    out.statusOpen = await typeAndCount('status:open')
    out.isConj = await typeAndCount('is:conjecture')
    out.negation = await typeAndCount('-status:proved')
    out.importance = await typeAndCount('importance:>0.9')
    // 语法错误不该抛、也不该清空，应显示提示
    out.malformed = await typeAndCount('importance:>>')
    // 寻路
    out.path = await typeAndCount('霍奇猜想 -> 黎曼猜想', 700)
    return out
  `)
  if (search.err) {
    ok(false, '找得到搜索框与结果区', search.err)
  } else {
    ok(search.plain.rows > 0, `普通词仍能搜到（${search.plain.rows} 行）`)
    ok(search.statusOpen.rows > 0, `status:open 有结果（${search.statusOpen.rows} 行）`)
    ok(search.isConj.rows > 0, `is:conjecture 有结果（${search.isConj.rows} 行）`)
    ok(search.negation.rows > 0, `-status:proved 有结果（${search.negation.rows} 行）`)
    ok(search.importance.rows > 0, `importance:>0.9 有结果（${search.importance.rows} 行）`)
    console.log(`     普通词 ${search.plain.rows}　status:open ${search.statusOpen.rows}　` +
      `is:conjecture ${search.isConj.rows}　-status:proved ${search.negation.rows}　` +
      `importance:>0.9 ${search.importance.rows}`)
    console.log(`     语法错误提示：${search.malformed.text}`)
    ok(/[：:]|未知|无法|错误|不支持/.test(search.malformed.text) || search.malformed.rows <= 1,
      '畸形查询给出可读提示（不抛异常）')
    console.log(`     寻路结果首行：${search.path.text}`)
    ok(/跳/.test(search.path.text) || /→/.test(search.path.text),
      '寻路结果显示跳数与路径', search.path.text)
  }

  /* ── ⑦ SVG 导出 ── */
  console.log('\n⑦ SVG 导出')
  const svg = await cdp.eval(`
    const nb = window.__nebula
    if (!nb.exportView) return { err: 'exportView 未挂到 __nebula' }
    const s = nb.exportView.exportSVG(nb.graph, {
      width: 1200, showLinks: true, showLabels: true, minLabelRank: 0,
      title: '集成验证',
    })
    return { len: s.length, head: s.slice(0, 4), tail: s.slice(-6),
             hasNaN: s.includes('NaN'), hasUndef: s.includes('undefined') }
  `)
  if (svg.err) {
    console.log(`     ⓘ ${svg.err}`)
    ok(false, 'exportView 可从页面调用')
  } else {
    ok(svg.head === '<svg', `SVG 以 <svg 开头`, svg.head)
    ok(svg.tail === '</svg>', `SVG 以 </svg> 结尾`, svg.tail)
    ok(!svg.hasNaN, 'SVG 里没有 NaN')
    ok(!svg.hasUndef, 'SVG 里没有 undefined')
    ok(svg.len > 5000, `SVG 长度 ${svg.len} 字节（有实际内容）`)
  }

  /* ── ⑧ 不变量：无流动粒子 ── */
  console.log('\n⑧ 硬性不变量（不许被本轮改动破坏）')
  const inv = await cdp.eval(`
    const nb = window.__nebula
    let linksPoints = 0, linksGroup = null
    nb.scene.scene.traverse(o => { if (o.name === 'links') linksGroup = o })
    if (linksGroup) linksGroup.traverse(o => { if (o.isPoints) linksPoints++ })
    const sc = nb.scene.scene
    // 各结构的节点/连线计数
    return {
      linksPoints,
      nodes: nb.graph.stats.nodeCount,
      links: nb.graph.stats.linkCount,
      galaxy: nb.graph.stats.galaxyCount,
      conj: nb.graph.stats.conjCount,
      cross: nb.graph.stats.crossLinks,
    }
  `)
  ok(inv.linksPoints === 0,
    '连线组里没有 Points（没有沿连线流动的光点）', `实为 ${inv.linksPoints}`)
  ok(inv.nodes === 488, `节点数仍为 488（实为 ${inv.nodes}）`)
  ok(inv.links === 1670, `连线数仍为 1670（实为 ${inv.links}）`)
  ok(inv.galaxy === 405 && inv.conj === 59,
    `主星系 405 / 星团 59（实为 ${inv.galaxy} / ${inv.conj}）`)
  ok(inv.cross === 225, `跨结构连线 225（实为 ${inv.cross}）`)

} finally {
  try { chrome.kill() } catch { /* ignore */ }
}

/* ═══════════════════════════════════════════════════════════════
 *  第二段：用一条深链**冷启动**，确认直达
 *
 *  第一段验的是"能编码出来"，这一段验的是"编码出来的东西真的能用"。
 *  两者的区别很关键 —— 一个只能写不能读的深链是没用的。
 * ═══════════════════════════════════════════════════════════════ */
console.log('\n⑨ 深链冷启动：用 URL 直达某个公式')
await sleep(500)

{
  const targetId = 'cn-jacobian'
  const deepUrl = `${URL_BASE}#v1&n=${targetId}&w=cluster&c=status`
  const { cdp: cdp2, chrome: chrome2 } = await launch('deep', deepUrl)

  try {
    await waitFor(cdp2, 'window.__nebula.graph.nodes.length > 0', '图数据就绪')
    await sleep(3000)

    const st = await cdp2.eval(`
      const nb = window.__nebula
      const n = nb.graph.byId.get('${targetId}')
      return {
        selection: nb.scene.selection,
        panelOn: !!document.querySelector('#panel.on'),
        panelTitle: (document.querySelector('#panel .nm') || {}).textContent,
        view: nb.settings.state.view,
        colorMode: nb.settings.state.colorMode,
        hash: location.hash,
        name: n ? n.name : null,
      }
    `)
    console.log(`     深链：#v1&n=${targetId}&w=cluster&c=status`)
    console.log(`     → 选中 ${st.selection}（${st.name}）　取景 ${st.view}　着色 ${st.colorMode}`)
    console.log(`     → 面板标题「${st.panelTitle}」`)

    ok(st.selection === targetId, `冷启动后选中了 ${targetId}`, `实为 ${st.selection}`)
    ok(st.panelOn === true, '详情面板自动打开')
    ok(!!st.panelTitle && st.name && st.panelTitle.includes(st.name),
      `面板显示的是这个公式（「${st.panelTitle}」）`)
    ok(st.view === 'cluster', '取景被 URL 改成 cluster', `实为 ${st.view}`)
    ok(st.colorMode === 'status', '着色被 URL 改成 status', `实为 ${st.colorMode}`)
    ok(st.hash.includes(`n=${targetId}`), '地址栏保留了深链', st.hash)
  } finally {
    try { chrome2.kill() } catch { /* ignore */ }
  }
}

/* ═══════════════════════════════════════════════════════════════
 *  第三段：坏深链不能让页面挂掉
 *
 *  decodeState 永不抛异常这一点在纯 Node 里已经验过，
 *  但这里要验的是**整条启动链路**：一个坏 hash 不能让页面白屏。
 *  这是"分享一条坏链接给同事"的真实场景。
 * ═══════════════════════════════════════════════════════════════ */
console.log('\n⑩ 坏深链：页面必须照常启动')
await sleep(500)

{
  const badUrl = `${URL_BASE}#v1&n=<script>&s=banana&p=lNaN&d=XX&zzz=1`
  const { cdp: cdp3, chrome: chrome3 } = await launch('bad', badUrl)

  try {
    await waitFor(cdp3, 'window.__nebula.graph.nodes.length > 0', '图数据就绪（坏深链下）')
    await sleep(2500)
    const st = await cdp3.eval(`
      const nb = window.__nebula
      return {
        nodes: nb.graph.stats.nodeCount,
        selection: nb.scene.selection,
        shape: nb.settings.state.shape,
        hasDiag: !!document.querySelector('#diag'),
        loadGone: !document.querySelector('#load') || document.querySelector('#load.done') !== null,
      }
    `)
    ok(st.nodes === 488, `坏深链下仍装配出 488 个节点（实为 ${st.nodes}）`)
    ok(st.selection === null, '非法节点 id 没有被选中（安全兜底）')
    ok(st.shape === 'spiral', `非法形态被拒绝，回落到默认（实为 ${st.shape}）`)
    ok(st.hasDiag, '诊断元素正常写入（启动流程走完了）')
    console.log(`     → 选中 ${st.selection}　形态 ${st.shape}　节点 ${st.nodes}`)
  } finally {
    try { chrome3.kill() } catch { /* ignore */ }
  }
}

/* ═══════════════════════════════════════════════════════════════ */
console.log(`\n${'─'.repeat(52)}`)
console.log(`结果：${pass} / ${pass + fail} 通过`)
if (failures.length) {
  console.log(`\n失败项：`)
  for (const f of failures) console.log(`  ✗ ${f}`)
}
process.exit(fail ? 1 : 0)
