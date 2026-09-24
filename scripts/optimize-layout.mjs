/**
 * 离线松弛优化器。
 *
 * 直接复刻 graph.js 的 relaxInPlane，在 Node 里跑参数扫掠 ——
 * 比"改 config → 重建 → 开浏览器测"快两个数量级。
 *
 * 用法:
 *   node scripts/optimize-layout.mjs --capture    # 从页面抓节点数据（含 family/rank）
 *   node scripts/optimize-layout.mjs              # 扫掠参数
 */
import { spawn } from 'node:child_process'
import { resolve } from 'node:path'
import { tmpdir } from 'node:os'
import { setTimeout as sleep } from 'node:timers/promises'
import { writeFileSync, readFileSync, existsSync } from 'node:fs'

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const URL = process.env.URL || 'http://localhost:5176/'
const PORT = 9235
const CACHE = resolve('scripts', '.node-layout.json')

/* ── 1. 抓数据 ── */
if (process.argv.includes('--capture') || !existsSync(CACHE)) {
  const profile = resolve(tmpdir(), 'nebula-opt' + '-' + process.pid)
  const cp = spawn(CHROME, [
    '--headless=new', '--no-sandbox', '--disable-gpu-sandbox',
    '--enable-unsafe-swiftshader', '--use-gl=angle', '--use-angle=swiftshader',
    '--window-size=1600,1000',
    `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`,
    '--no-first-run', '--no-default-browser-check', URL,
  ], { stdio: ['ignore', 'pipe', 'pipe'] })
  cp.stderr.on('data', () => {})
  let target
  for (let i = 0; i < 40 && !target; i++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()
      target = list.find((t) => t.type === 'page' && t.webSocketDebuggerUrl)
    } catch {}
    if (!target) await sleep(500)
  }
  const ws = new WebSocket(target.webSocketDebuggerUrl)
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej })
  let msgId = 0
  const pending = new Map()
  ws.onmessage = (ev) => {
    const m = JSON.parse(ev.data)
    if (m.id && pending.has(m.id)) {
      const { resolve: rs, reject: rj } = pending.get(m.id); pending.delete(m.id)
      m.error ? rj(new Error(JSON.stringify(m.error))) : rs(m.result)
    }
  }
  const send = (method, params = {}) => new Promise((rs, rj) => {
    const id = ++msgId; pending.set(id, { resolve: rs, reject: rj })
    ws.send(JSON.stringify({ id, method, params }))
  })
  const evaluate = async (e) => {
    const r = await send('Runtime.evaluate', { expression: e, awaitPromise: true, returnByValue: true })
    if (r.exceptionDetails) throw new Error('异常: ' + JSON.stringify(r.exceptionDetails.exception?.description))
    return r.result.value
  }
  await send('Runtime.enable')
  for (let i = 0; i < 60; i++) {
    try {
      const d = await evaluate(`(()=>{const e=document.getElementById('diag');return e?e.textContent:''})()`)
      if (d && JSON.parse(d).built > 0) break
    } catch {}
    await sleep(1000)
  }
  const data = await evaluate(`(()=>window.__nebula.graph.nodes.filter(n=>n.sprite).map(n=>({
    id:n.id, rank:n.rank, family:n.family, w:n.width, h:n.height,
    radiusTarget:n.radiusTarget, theta:n.theta,
    x:n.pos.x, y:n.pos.y, z:n.pos.z,
  })))()`)
  ws.close(); cp.kill()
  writeFileSync(CACHE, JSON.stringify(data))
  console.log(`抓取并缓存 ${data.length} 个节点`)
}

const raw = JSON.parse(readFileSync(CACHE, 'utf8'))

/* ── 2. 复刻 relaxInPlane ── */
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v))

function relax(nodes, { iters, spacing, allow, freedom, radiusInner }) {
  const ns = nodes.map((n) => ({
    x: n.x, z: n.z, radius: n.radiusTarget,
    w: n.w, h: n.h,
    radiusMin: 0, radiusMax: 0,
  }))
  for (const n of ns) {
    const f = freedom * n.radius
    n.radiusMin = Math.max(radiusInner * 0.35, n.radius - f)
    n.radiusMax = n.radius + f
  }

  for (let it = 0; it < iters; it++) {
    const strength = 0.5 * (1 - it / iters) + 0.12
    for (let i = 0; i < ns.length; i++) {
      const a = ns[i]
      const ra = Math.max(a.w, a.h) * 0.5 * spacing
      for (let j = i + 1; j < ns.length; j++) {
        const b = ns[j]
        const rb = Math.max(b.w, b.h) * 0.5 * spacing
        const minD = (ra + rb) * allow
        let dx = b.x - a.x, dz = b.z - a.z
        let d2 = dx * dx + dz * dz
        if (d2 >= minD * minD) continue
        let d = Math.sqrt(d2)
        if (d < 1e-6) {
          dx = (i % 7) - 3; dz = (j % 5) - 2
          d = Math.sqrt(dx * dx + dz * dz) || 1e-3
        }
        const push = ((minD - d) / d) * strength
        a.x -= dx * push; a.z -= dz * push
        b.x += dx * push; b.z += dz * push
      }
    }
    if (freedom > 0) {
      for (const n of ns) {
        const r = Math.sqrt(n.x * n.x + n.z * n.z)
        if (r < 1e-6) continue
        const rc = clamp(r, n.radiusMin, n.radiusMax)
        if (rc !== r) { const k = rc / r; n.x *= k; n.z *= k }
      }
    } else {
      for (const n of ns) {
        const r = Math.sqrt(n.x * n.x + n.z * n.z)
        if (r < 1e-6) continue
        const k = n.radius / r
        n.x *= k; n.z *= k
      }
    }
  }
  return ns
}

/** 评价：用"中心距 / 平均半宽"衡量重叠（与 check-density.mjs 一致） */
function score(ns) {
  let overlapPairs = 0, totalPairs = 0
  const ratios = []
  for (let i = 0; i < ns.length; i++) {
    const a = ns[i]
    const ha = Math.max(a.w, a.h) / 2
    let nearest = Infinity
    for (let j = 0; j < ns.length; j++) {
      if (i === j) continue
      const b = ns[j]
      const hb = Math.max(b.w, b.h) / 2
      const d = Math.hypot(a.x - b.x, a.z - b.z)
      const ratio = d / ((ha + hb) / 2)
      if (ratio < nearest) nearest = ratio
      if (j > i) {
        totalPairs++
        if (ratio < 0.85) overlapPairs++
      }
    }
    ratios.push(nearest)
  }
  ratios.sort((x, y) => x - y)
  const q = (p) => ratios[Math.min(ratios.length - 1, Math.floor(ratios.length * p))]
  return {
    overlapPct: (overlapPairs / totalPairs) * 100,
    min: ratios[0], p05: q(0.05), p25: q(0.25), median: q(0.5),
  }
}

/* 半径保持度：松弛后半径与目标半径的偏离（越小越说明层次没被打乱） */
function radiusDrift(ns) {
  const d = ns.map((n) => Math.abs(Math.hypot(n.x, n.z) - n.radius) / n.radius)
  d.sort((a, b) => a - b)
  return { median: d[Math.floor(d.length / 2)], max: d[d.length - 1] }
}

/* ── 3. 扫掠 ── */
const CFG = { radiusInner: 30, spacing: 1.16, allow: 0.86, iters: 60, freedom: 0.30 }

console.log(`基线（当前 config）: iters=${CFG.iters} spacing=${CFG.spacing} allow=${CFG.allow} freedom=${CFG.freedom}`)
{
  const ns = relax(raw, CFG)
  const s = score(ns), d = radiusDrift(ns)
  console.log(`  重叠 ${s.overlapPct.toFixed(1)}%  最近邻: 中位 ${s.median.toFixed(3)} p25 ${s.p25.toFixed(3)} p05 ${s.p05.toFixed(3)}  半径漂移 中位 ${(d.median * 100).toFixed(1)}% 最大 ${(d.max * 100).toFixed(1)}%\n`)
}

console.log('参数扫掠（目标：重叠率低 + 半径漂移小 = 层次不乱）')
console.log('  iters  间距   allow  freedom   重叠%   最近邻中位   半径漂移中位  漂移最大')
const rows = []
for (const iters of [120, 240, 400]) {
  for (const spacing of [1.16, 1.05]) {
    for (const allow of [0.86, 1.0]) {
      for (const freedom of [0.30, 0.45, 0.60]) {
        const ns = relax(raw, { ...CFG, iters, spacing, allow, freedom })
        const s = score(ns), d = radiusDrift(ns)
        rows.push({ iters, spacing, allow, freedom, ...s, ...d })
      }
    }
  }
}
rows.sort((a, b) => a.overlapPct - b.overlapPct || a.median - b.median ? 0 : 0)
for (const r of rows.slice(0, 14)) {
  console.log(`  ${String(r.iters).padStart(5)}  ${r.spacing.toFixed(2)}   ${r.allow.toFixed(2)}   ${r.freedom.toFixed(2)}    ${r.overlapPct.toFixed(1).padStart(5)}    ${r.median.toFixed(3)}        ${(r.median * 100).toFixed(1)}%       ${(r.max * 100).toFixed(1)}%`
    .replace(/(\d+\.\d)%\s+(\d+\.\d)%$/, (m, a, b) => `${a}%  ${b}%`))
}
