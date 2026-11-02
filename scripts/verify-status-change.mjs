/**
 * ═══════════════════════════════════════════════════════════════
 *  verify-status-change.mjs —— 状态改动是否真的落到了渲染层
 * ═══════════════════════════════════════════════════════════════
 *
 *  这一轮只改了 `src/data/conjectures.js` 里的 status 字段（雅可比猜想
 *  open → disproved）。`verify-status-layout-independent.mjs` 已经从
 *  **机制上**证明"改 status 不会移动任何节点"，但那是拿人为构造的
 *  数据在跑。这个脚本补的是另一件事：在**真实页面**上确认
 *
 *   ① 改动真的传导到了图数据（不是只改了文件里的字）
 *   ② 四条 status 的计数与 README 表格逐一对上
 *   ③ 规模没变（464 节点 / 1620 关联）—— 改 status 不该增删任何东西
 *
 *  为什么值得单独写：改的是"一个字符串"，很容易以为无关紧要。
 *  但 status 会走进 `nodeUiColor`，若某处把 status 当索引去查表，
 *  一个拼错的值会静默退化成默认色 —— 那才是真 bug。所以要读**颜色**，
 *  不能只读字段。
 *
 *  用法：node scripts/verify-status-change.mjs
 *  需要 preview 服务器已在 5176 端口运行。
 */

import { spawn } from 'node:child_process'
import { setTimeout as sleep } from 'node:timers/promises'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { requireChrome } from './_chrome.mjs'

const PORT = Number(process.env.PORT || 9410)
const URL = process.env.URL || 'http://127.0.0.1:5176/'
const CHROME = requireChrome()

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

/** 轮询等待条件成立 —— 不用固定 sleep，收敛时间取决于机器 */
async function waitFor(cdp, expr, label, timeoutMs = 240000) {
  const t0 = Date.now()
  let last = null
  while (Date.now() - t0 < timeoutMs) {
    try { last = await cdp.eval(`return ${expr}`) } catch (e) { last = null }
    if (last) return last
    await sleep(1000)
  }
  throw new Error(`等待超时：${label}（最后取值 ${JSON.stringify(last)}）`)
}

const profile = mkdtempSync(join(tmpdir(), 'neb-status-'))
let chrome = null

try {
  chrome = spawn(CHROME, [
    '--headless=new', '--no-sandbox', '--disable-gpu-sandbox', '--enable-unsafe-swiftshader', '--use-gl=angle', '--use-angle=swiftshader',
    '--no-first-run', '--no-default-browser-check', '--disable-extensions',
    '--mute-audio', '--window-size=1600,1000',
    `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}-${process.pid}`, URL,
  ], { stdio: 'ignore' })

  const cdp = await connect()
  await cdp.send('Runtime.enable')
  await waitFor(cdp, '!!window.__nebula && !!window.__nebula.graph && !!window.__nebula.scene',
    '页面与 __nebula 就绪')

  /* 等烘焙真的结束（节点 sprite 建出来）而不是干等 */
  await waitFor(cdp, 'window.__nebula.graph.nodes.length > 0', '图数据就绪')
  await sleep(2500)

  /* ── ① 图数据：改动的节点 ── */
  console.log('\n① cn-jacobian 是否真的变成 disproved')
  const jac = await cdp.eval(`
    const n = window.__nebula.graph.nodes.find(x => x.id === 'cn-jacobian')
    return n ? { id: n.id, status: n.status, family: n.family, cluster: n.cluster,
                 color: n.color, importance: n.importance } : null
  `)
  if (!jac) {
    ok(false, '找得到 cn-jacobian 节点')
  } else {
    ok(jac.status === 'disproved', 'status === "disproved"', `实为 ${jac.status}`)
    ok(jac.family === 'conjecture', 'family === "conjecture"', `实为 ${jac.family}`)
    console.log(`     颜色 = ${jac.color}   重要度 = ${jac.importance}`)
  }

  /* ── ② 四条 status 的计数 ── */
  console.log('\n② status 分布（与 README 表格对照）')
  const hist = await cdp.eval(`
    const c = {}
    for (const n of window.__nebula.graph.nodes) {
      if (n.family === 'conjecture') c[n.status] = (c[n.status] || 0) + 1
    }
    return c
  `)
  console.log('     ' + JSON.stringify(hist))
  ok(hist.open === 33, '仍未解决 = 33', `实为 ${hist.open}`)
  ok(hist.partial === 9, '部分解决 = 9', `实为 ${hist.partial}`)
  ok(hist.proved === 15, '已获证明 = 15', `实为 ${hist.proved}`)
  ok(hist.disproved === 2, '已被推翻 = 2', `实为 ${hist.disproved}`)
  const tot = Object.values(hist).reduce((a, b) => a + b, 0)
  ok(tot === 59, '合计 = 59', `实为 ${tot}`)
  ok(!hist.heuristic, 'heuristic 仍为空（保留未用）', `实为 ${hist.heuristic}`)

  /* ── ③ 规模不变 ── */
  console.log('\n③ 规模（改 status 不该增删任何东西）')
  const scale = await cdp.eval(`
    const g = window.__nebula.graph
    return { nodes: g.nodes.length, links: g.links.length,
             conj: g.nodes.filter(n => n.family === 'conjecture').length,
             researchers: g.nodes.filter(n => n.researcher).length,
             gal: g.nodes.filter(n => n.family !== 'conjecture' && !n.researcher).length }
  `)
  console.log('     ' + JSON.stringify(scale))
  ok(scale.nodes === 488, '节点 488', `实为 ${scale.nodes}`)
  ok(scale.links === 1670, '关联 1670', `实为 ${scale.links}`)
  ok(scale.conj === 59, '星团 59', `实为 ${scale.conj}`)
  ok(scale.researchers === 24, '研究者 24', `实为 ${scale.researchers}`)
  ok(scale.gal === 405, '主星系 405', `实为 ${scale.gal}`)

  /* ── ④ cn-jacobian 的色点确实换成了"已被推翻"的颜色 ── */
  console.log('\n④ cn-jacobian 的色点颜色（防止 status 拼错后静默退化）')
  /* ⚠ 必须读 markerColor（布局阶段算好的基准色），不能读
   *   marker.material.color —— 后者每帧被 updateAppearance 乘上亮度系数，
   *   同一状态的不同节点会得到不同值。这个坑 verify-cluster.mjs 里记过。 */
  const color = await cdp.eval(`
    const N = window.__nebula;
    const n = N.graph.nodes.find(x => x.id === 'cn-jacobian');
    if (!n || !n.markerColor) return null;
    const want = N.graph.conjStatusColors['disproved'];
    const old  = N.graph.conjStatusColors['open'];
    const c = n.markerColor;
    const near = (w) => Math.abs(c.r-w[0])<2e-3 && Math.abs(c.g-w[1])<2e-3 && Math.abs(c.b-w[2])<2e-3;
    return { got: [c.r, c.g, c.b].map(x => +x.toFixed(4)),
             want: want.map(x => +x.toFixed(4)),
             old:  old.map(x => +x.toFixed(4)),
             isNew: near(want), isOld: near(old) }
  `)
  if (!color) {
    ok(false, 'cn-jacobian 有 markerColor')
  } else {
    console.log(`     实际 = [${color.got}]`)
    console.log(`     应为(disproved) = [${color.want}]`)
    console.log(`     旧色(open)     = [${color.old}]`)
    ok(color.isNew, '色点已是"已被推翻"的颜色')
    ok(!color.isOld, '色点不再是"仍未解决"的旧颜色')
  }

  /* ── ⑤ 全部 59 条：色点颜色与状态表逐一对应 ── */
  console.log('\n⑤ 全星团色点 vs conjStatusColors（59 条逐一对撞）')
  const mismatch = await cdp.eval(`
    const N = window.__nebula;
    const bad = [];
    for (const n of N.graph.nodes.filter(x => x.cluster)) {
      const want = N.graph.conjStatusColors[n.status];
      if (!want) { bad.push(n.id + ': 无 ' + n.status + ' 定义'); continue }
      const c = n.markerColor;
      if (!c) { bad.push(n.id + ': 无 markerColor'); continue }
      if (Math.abs(c.r-want[0])>2e-3 || Math.abs(c.g-want[1])>2e-3 || Math.abs(c.b-want[2])>2e-3) {
        bad.push(n.id + ' ' + n.status)
      }
    }
    return bad
  `)
  ok(mismatch.length === 0, '59 条色点全部匹配自身 status', mismatch.slice(0, 5).join('; '))

  console.log(`\n${'='.repeat(60)}`)
  console.log(fail ? `✗ ${fail} 项失败` : '✓ 全部通过')
  console.log(`${'='.repeat(60)}`)
  console.log(`结果：${pass} / ${pass + fail} 通过`)
  if (fail) { console.log('失败项：\n  - ' + failures.join('\n  - ')); process.exitCode = 1 }
} catch (e) {
  console.error('\n错误: ' + e.message)
  process.exitCode = 1
} finally {
  if (chrome) chrome.kill()
  await sleep(600)
  try { rmSync(profile, { recursive: true, force: true }) } catch { /* ignore */ }
}
