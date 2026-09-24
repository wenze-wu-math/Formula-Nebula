/**
 * 用真实节点尺寸拟合 LAYOUT 参数。
 *
 * ── 问题的根源 ──
 * 原来的半径映射是 r = R_IN + (1-rank)^curve × (R_OUT - R_IN)。
 * 但知识库里 importance 普遍偏高（中位 0.76），归一化成 rank 后也偏高，
 * 于是 (1-rank) 普遍偏小 → **大量节点挤在盘心**。
 * 实测：r<50 里塞了 150 个，而 r>82 只有 38 个；盘面面积只填了 34%，
 * 但内圈"总宽度 / 周长"高达 12 倍 —— 再松弛也解不开，因为每个公式
 * 被钉在自己的半径圆环上，周长就那么点。
 *
 * ── 解法：按**分位数**而不是按 importance 的数值来定半径 ──
 * 把节点按 importance 降序排列，第 i 个节点取圆盘面积分布的 c_i = (i+0.5)/N 分位，
 * 令其半径满足指数盘的累积面积 A(r) = 1-(1+r/h)e^(-r/h)。
 * 这样"越重要越靠中心"依然严格单调（Spearman = −1），但不再堆在盘心。
 *
 * ── 本脚本要定的量 ──
 * 角向需求 = Σ 2·asin(minD/(2r))，而 minD ∝ 公式尺寸。
 * 把「盘半径」与「公式尺寸」同比例放大，需求完全不变 ——
 * 可行性只取决于**无量纲比值**：
 *      k = 尺寸/R_OUT,   h/R_OUT,   rInner/R_OUT
 * 而屏幕观感尺寸 ∝ 尺寸/相机距离，相机距离又必须 ∝ R_OUT，
 * 所以观感尺寸 ∝ k。于是问题变成：**求可行的最大 k**。
 *
 * 用法: node scripts/fit-layout.mjs [--fresh]
 */
import { spawn } from 'node:child_process'
import { resolve } from 'node:path'
import { tmpdir } from 'node:os'
import { setTimeout as sleep } from 'node:timers/promises'
import { writeFileSync, readFileSync, existsSync } from 'node:fs'

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const URL = process.env.URL || 'http://localhost:5176/'
const PORT = 9234
const CACHE = resolve('scripts', '.node-sizes.json')

/* ── 1. 真实节点尺寸 ── */
let nodes
if (existsSync(CACHE) && !process.argv.includes('--fresh')) {
  nodes = JSON.parse(readFileSync(CACHE, 'utf8'))
  console.log(`使用缓存尺寸（${nodes.length} 个节点）`)
} else {
  const profile = resolve(tmpdir(), 'nebula-fit' + '-' + process.pid)
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
  nodes = await evaluate(`(()=>window.__nebula.graph.nodes.filter(n=>n.sprite).map(n=>({
    id:n.id, imp:n.importance, rank:n.rank, aspect:+(n.width/n.height).toFixed(4),
  })))()`)
  ws.close(); cp.kill()
  writeFileSync(CACHE, JSON.stringify(nodes, null, 1))
  console.log(`取回并缓存 ${nodes.length} 个节点`)
}

const N = nodes.length
const GLYPH = { baseSize: 7.2, sizeMin: 0.60, sizeMax: 1.78, sizeCurve: 0.85, maxWidth: 54, maxHeight: 12 }

/* 与 config.js 的 LAYOUT 保持一致 —— 模型必须复刻真实的松弛几何 */
const SPACING = 1.16          // LAYOUT.spacing
const ALLOW = 0.80            // LAYOUT.relaxAllowOverlap

/** 按 importance 降序 → 指数盘累积面积分位 → 半径
 *
 *  盘是一个**环形**：从 rInner 到 R_OUT。这很关键 ——
 *  公式大小不随半径缩小，所以半径 r 处的角宽 ≈ 尺寸/r。
 *  若让最重要的公式落在 r→0，它需要的角位趋于 2π（甚至更多），
 *  无论盘多大都装不下。真实星系的核球也是有有限半径的。 */
function radiusByQuantile(h, R_OUT, rInner) {
  const A = (r) => 1 - (1 + r / h) * Math.exp(-r / h)
  const a0 = A(rInner), a1 = A(R_OUT)
  const sorted = [...nodes].sort((a, b) => b.rank - a.rank)   // rank 大 = 重要 = 靠内
  const out = new Map()
  const inv = (target) => {
    let lo = rInner, hi = R_OUT * 4
    for (let i = 0; i < 60; i++) {
      const mid = (lo + hi) / 2
      if (A(mid) < target) lo = mid; else hi = mid
    }
    return (lo + hi) / 2
  }
  sorted.forEach((n, i) => {
    const c = (i + 0.5) / N            // 0 = 最内
    out.set(n.id, inv(a0 + c * (a1 - a0)))
  })
  return out
}

/** 给定参数，算出每个节点的半径、显示尺寸，并评估角向容量 */
function evaluate_(p) {
  const radii = radiusByQuantile(p.h, p.radiusOuter, p.rInner)
  const ns = nodes.map((n) => {
    const sizeScale = p.sizeMin + Math.pow(n.rank, GLYPH.sizeCurve) * (p.sizeMax - p.sizeMin)
    const area = (GLYPH.baseSize * sizeScale) ** 2
    let W = Math.sqrt(area * n.aspect)
    let H = Math.sqrt(area / n.aspect)
    const k = Math.min(1, p.maxWidth / W, p.maxHeight / H)
    W *= k; H *= k
    const ra = (Math.max(W, H) / 2) * SPACING
    return { id: n.id, r: radii.get(n.id), W, H, ra }
  })

  // 角向容量：必须**完全复刻 relaxInPlane 的几何**，否则结论会过于乐观。
  //   relax 里两节点最小间距 minD = (ra+rb) × ALLOW；
  //   节点被钉在各自半径上只能沿环滑动，所以半径差 < minD 的节点
  //   必须靠角向分开，各自需要 θ = 2·asin(minD/(2r)) 的角位。
  //   判据：每个节点收到的角需求之和 ≤ 2π。
  let worst = 0, worstR = 0
  for (let i = 0; i < ns.length; i++) {
    const a = ns[i]
    if (a.r < 0.5) continue
    let demand = 0
    for (let j = 0; j < ns.length; j++) {
      if (i === j) continue
      const b = ns[j]
      const minD = (a.ra + b.ra) * ALLOW
      if (Math.abs(a.r - b.r) >= minD) continue       // 径向已错开，不占角位
      demand += 2 * Math.asin(Math.min(1, minD / (2 * a.r)))
    }
    const ratio = demand / (2 * Math.PI)
    if (ratio > worst) { worst = ratio; worstR = a.r }
  }

  const sumArea = ns.reduce((s, n) => s + n.W * n.H, 0)
  const maxR = Math.max(...ns.map((n) => n.r))
  return { worst, worstR, maxR, fill: sumArea / (Math.PI * maxR ** 2), ns }
}

/* ── 2. 搜索无量纲比值 ──
 *
 * 从角需求公式可以推出一个**尺度不变**的设计律：
 *   竞争带内节点数 N_band ≈ N · (该环带占盘面积的比例)
 *                        ≈ N · r·e^(-r/h)·W / h²      （带宽容度 δ ≈ 公式宽度 W）
 *   每个节点的角需求 ≈ 0.92·W/r
 *   合计 demand ≈ 0.92 · N · W² · e^(-r/h) / h²
 * 与 r 无关！所以：
 *   · 把整片盘连同公式一起放大 → demand 不变（**盘大没用**）
 *   · 决定性的是 N·W²/h² —— 公式相对"盘尺度 h"越小、盘越铺开，越装得下
 * 这就是为什么必须搜 h/R_OUT 很大、W/R_OUT 很小的角落。 */
console.log('\n搜索无量纲比值：k = 尺寸/R_OUT、h/R_OUT、rInner/R_OUT')
console.log('尺度不变律：demand ∝ N·W²/h²  → 关键是把 W/h 压下来\n')

const R_OUT_REF = 400                       // k 与具体 R_OUT 无关，取参考值即可
const results = []
for (const hFrac of [0.50, 0.70, 0.90, 1.20, 1.60, 2.20, 3.00]) {
  for (const innerFrac of [0.02, 0.05, 0.09, 0.14, 0.20, 0.28, 0.38]) {
    for (const k of [0.0026, 0.0022, 0.0018, 0.0015, 0.0012, 0.0010, 0.0008, 0.00065, 0.0005]) {
      const scale = k * R_OUT_REF
      const s = Math.sqrt(scale)
      const p = {
        rInner: R_OUT_REF * innerFrac,
        radiusOuter: R_OUT_REF, h: R_OUT_REF * hFrac, scale,
        sizeMin: GLYPH.sizeMin * s, sizeMax: GLYPH.sizeMax * s,
        maxWidth: GLYPH.maxWidth * s, maxHeight: GLYPH.maxHeight * s,
      }
      const ev = evaluate_(p)
      results.push({ hFrac, innerFrac, k, worst: ev.worst, worstRFrac: ev.worstR / R_OUT_REF })
    }
  }
}

// 留 15% 安全余量：离线模型没算盘面散射与径向抖动，实测会比模型更挤
const MARGIN = 0.85
const ok = results.filter((c) => c.worst < MARGIN)

if (ok.length) {
  const maxK = Math.max(...ok.map((c) => c.k))
  const bestK = ok.filter((c) => c.k === maxK).sort((a, b) => a.worst - b.worst)
  console.log(`可行解 ${ok.length} 组，最大可行 k = ${maxK}\n`)
  console.log('  达到该 k 的参数组合（按角需求从松到紧）：')
  console.log('   h/R    rInner/R   最坏角需求比   最挤处 r/R')
  for (const c of bestK.slice(0, 12)) {
    console.log(`   ${c.hFrac.toFixed(2)}    ${c.innerFrac.toFixed(2)}      ${c.worst.toFixed(2)}          ${c.worstRFrac.toFixed(2)}`)
  }

  const pick = bestK[0]
  console.log(`\n推荐：k = ${pick.k},  h/R = ${pick.hFrac},  rInner/R = ${pick.innerFrac}`)
  console.log(`      最挤处在 r = ${(pick.worstRFrac * 100).toFixed(0)}% R_OUT`)

  const R = 340
  const sc = pick.k * R
  console.log(`\n取 R_OUT = ${R} 换算成具体数值：`)
  console.log(`  radiusInner = ${(R * pick.innerFrac).toFixed(1)}`)
  console.log(`  radiusOuter = ${R}`)
  console.log(`  diskScale   = ${pick.hFrac}   → h = ${(R * pick.hFrac).toFixed(0)}`)
  console.log(`  尺寸缩放系数 = ${sc.toFixed(3)}`)
  console.log(`  baseSize = ${(7.2 * sc).toFixed(2)}, sizeMin = ${(0.60 * sc).toFixed(3)}, sizeMax = ${(1.78 * sc).toFixed(3)}, maxWidth = ${(54 * sc).toFixed(1)}`)

  // 同时给出"不缩小公式"时需要的 h，让用户可以权衡
  console.log('\n对照：若坚持用原始尺寸（scale = 1，公式不缩小），')
  console.log('      按 W²/h² 的规律，需要 h ≈ R_OUT × ' + (pick.hFrac / Math.sqrt(1 / sc)).toFixed(2) + '，')
  console.log('      也就是盘要铺得非常开，核心的"中心感"会明显变弱。')
} else {
  console.log('无可行解，最接近的：')
  for (const c of results.slice().sort((a, b) => a.worst - b.worst).slice(0, 10))
    console.log(`  k=${c.k}  h/R=${c.hFrac}  rInner/R=${c.innerFrac}  最坏=${c.worst.toFixed(2)} @ r/R=${c.worstRFrac.toFixed(2)}`)
}
