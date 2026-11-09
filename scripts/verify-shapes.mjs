/**
 * 形态模式离线验证：对四种形态各跑一遍布局，检查
 *   1. 「越中心越重要」秩相关（半径 vs rank）保持强负相关
 *   2. 「大致在同一平面内」厚径比
 *   3. 半径范围没有异常（形态只改 θ，半径分布应与 spiral 完全一致）
 *   4. 方位角分布是否符合形态定义（旋臂/均匀/棒）
 *
 * 为什么能离线跑：graph.js 的布局是纯函数（不碰 DOM/WebGL），
 * 只需要给它一份 baked 贴图数据（宽高比）。这里从
 * scripts/.node-sizes.json 读真实宽高比，保证和浏览器一致。
 *
 * ⚠ 离线模型的绝对数字与浏览器有差异（这里没有旋臂抖动之外的因素），
 *   所以这里只看**四种形态之间的相对关系**与秩相关这类结构指标。
 */
import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

const sizesPath = resolve('scripts/.node-sizes.json')
if (!existsSync(sizesPath)) {
  console.log('缺少 scripts/.node-sizes.json，先跑 node scripts/check-readable-band.mjs 生成')
  process.exit(1)
}
const sizes = JSON.parse(readFileSync(sizesPath, 'utf8'))
console.log(`读入 ${sizes.length} 个节点的真实宽高比`)

// 动态 import：config.js 与 graph.js 都是 ESM
const { buildGraph, layoutGraph } = await import('../src/graph.js')
const { loadDataForNode } = await import('../src/dataLoaderNode.js')
await loadDataForNode()
const { SHAPES, SHAPE_IDS, LAYOUT } = await import('../src/config.js')

/* 数据集的全量节点列表 —— fakeBaked() 用它判断快照缺了哪些。
 * 只取**主星系**节点：本脚本验证的是盘面形态，
 * 而星团节点的位置与形态无关（球面布局，`layoutGalaxy` 根本不碰它们），
 * 把它们算进半径/厚径比只会污染指标 ——
 * 星团的节点在 x-z 平面上离原点 200 多，会直接把 maxR 从 194 拉到 400+，
 * 厚径比与秩相关都会得出错误的结论。 */
const _probe = buildGraph()
const graphNodes = _probe.nodes.filter((n) => !n.cluster && !n.researcher)
const _researchers = _probe.nodes.filter((n) => n.researcher).length
const _conjectures = _probe.nodes.filter((n) => n.cluster).length
console.log(`主星系 ${graphNodes.length} 个节点 / 星团 ${_conjectures} 个 / 研究者 ${_researchers} 个（本脚本只验证主星系盘面）`)

/** 造一份 baked Map（layoutGraph 只用到 emWidth/emHeight/aspect）
 *
 * ⚠ scripts/.node-sizes.json 是**某个时间点从浏览器里导出的快照**，
 *   里面只有当时存在的节点。数据集扩充后（v1 303 → v2 464）它必然缺项，
 *   而 layoutGraph 遇到缺 baked 的节点会退回 `aspect = 2` 的默认值 ——
 *   于是新节点的宽高全是错的，尺寸/半径分位跟着全变，
 *   脚本还会因为 `radiusTarget` 是 undefined 直接崩掉。
 *   所以这里对缺项**生成一个确定性的替代值**（由 id 哈希得到，
 *   落在真实宽高比的分布区间内），并把它数量打印出来 ——
 *   静默补默认值比报错更危险。 */
function fakeBaked() {
  const m = new Map()
  // 先用真实快照填
  for (const s of sizes) {
    m.set(s.id, {
      emWidth: Math.sqrt(s.aspect), emHeight: 1 / Math.sqrt(s.aspect),
      aspect: s.aspect, canvasW: 100, canvasH: 100,
      contentW: 100, contentH: 100, texture: null,
    })
  }
  // 缺项：从**真实快照的实证分布**里按 id 哈希确定性抽样。
  //
  // 为什么不用"对数均匀 [1.5, 34]"这种假分布：宽高比直接参与
  // layoutGraph 的宽度夹取（maxWidth = 54），而夹取会改变**占用面积**，
  // 进而改变面积分位、改变半径目标。用一条中位 7.1 的假分布去替真实
  // 中位 11.5 的分布，会让偏高的公式被多夹几次，半径分布整体偏移 ——
  // 实测这足以把 spiral 的去缠绕 χ² 从 20+ 压到 12（假失败）。
  // 从实证分布抽样则天然保持中位/尾部形状。
  const pool = sizes.map((s) => s.aspect).filter((a) => a > 0)
  let filled = 0
  for (const node of graphNodes) {
    if (m.has(node.id)) continue
    let h = 2166136261
    for (let i = 0; i < node.id.length; i++) {
      h ^= node.id.charCodeAt(i)
      h = Math.imul(h, 16777619)
    }
    const aspect = pool[(h >>> 0) % pool.length]
    m.set(node.id, {
      emWidth: Math.sqrt(aspect), emHeight: 1 / Math.sqrt(aspect),
      aspect, canvasW: 100, canvasH: 100,
      contentW: 100, contentH: 100, texture: null,
    })
    filled++
  }
  if (filled) {
    console.log(`  ⚠ 快照缺 ${filled} 个节点，已用 id 哈希生成替代宽高比` +
      `（结构性结论仍然可信，绝对像素数不可信）`)
  }
  return m
}

function spearman(xs, ys) {
  const n = xs.length
  const rank = (arr) => {
    const idx = arr.map((v, i) => [v, i]).sort((a, b) => a[0] - b[0])
    const r = new Array(n)
    let i = 0
    while (i < n) {
      let j = i
      while (j + 1 < n && idx[j + 1][0] === idx[i][0]) j++
      const avg = (i + j) / 2 + 1
      for (let k = i; k <= j; k++) r[idx[k][1]] = avg
      i = j + 1
    }
    return r
  }
  const rx = rank(xs), ry = rank(ys)
  const mx = rx.reduce((a, b) => a + b, 0) / n
  const my = ry.reduce((a, b) => a + b, 0) / n
  let num = 0, dx = 0, dy = 0
  for (let i = 0; i < n; i++) {
    const a = rx[i] - mx, b = ry[i] - my
    num += a * b; dx += a * a; dy += b * b
  }
  return num / Math.sqrt(dx * dy)
}

const results = []
for (const id of SHAPE_IDS) {
  // 每次重跑都要重置 LAYOUT 的形态字段（settings.js 在浏览器里做同样的事）
  const S = SHAPES[id]
  LAYOUT.shape = id
  LAYOUT.twist = S.twist
  LAYOUT.armSpread = S.armSpread
  LAYOUT.armTight = S.armTight
  LAYOUT.coreBlur = S.coreBlur

  const graph = buildGraph()
  const baked = fakeBaked()
  layoutGraph(graph, baked)

  // 只看主星系：星团/研究者是球、与形态无关，混进来会污染所有盘面指标
  const nodes = graph.nodes.filter((n) => n.pos && !n.cluster && !n.researcher)
  const radii = nodes.map((n) => Math.hypot(n.pos.x, n.pos.z))
  const ys = nodes.map((n) => Math.abs(n.pos.y))
  const ranks = nodes.map((n) => n.rank)

  const maxR = Math.max(...radii)
  const rho = spearman(radii, ranks)
  // 厚径比：用半高（中位 |y|）比盘直径更稳健（极少数核球点会拉高均值）
  const medY = [...ys].sort((a, b) => a - b)[Math.floor(ys.length / 2)]
  const thick = medY / (maxR * 2)

  // 方位角分布：无旋臂形态应该接近均匀
  const thetas = nodes.map((n) => n.theta)
  // 均匀性：把 0..2π 分成 12 个桶，看每桶占比
  const bins = new Array(12).fill(0)
  for (const t of thetas) {
    const a = ((t % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)
    bins[Math.floor((a / (Math.PI * 2)) * 12)]++
  }
  const exp = nodes.length / 12
  const chi = bins.reduce((s, v) => s + (v - exp) ** 2 / exp, 0)

  /* ── 旋臂结构的真正判据：r 与 θ 的**相关**，不是 θ 的边缘分布 ──
   *
   * 这一点我想错过一次。twist = 5.2 弧度，也就是从盘心到边缘
   * 方位角扫过约 298° —— 于是即使只有 4 条臂，
   * θ 的**边缘**分布也几乎是均匀的（实测 χ² 只有 6.8）。
   * 用边缘 χ² 判断"有没有旋臂"会得出"旋臂形态没有结构"的错误结论。
   *
   * 旋臂是 θ 随 r 单调漂移的结构，所以正确的判据是：
   * 把 θ 摊成 (θ − t·twist) 之后，剩余量的**集中度**。
   * 有旋臂时，这个"去缠绕后的角"会聚成 arms 个尖峰；无旋臂时仍是均匀的。
   */
  const arms = SHAPES[id].arms
  const _spiralChi = 0
  /* ── 旋臂结构的判据：逐臂圆集中度 R，不是分桶 χ²、也不是折叠后的 R₄ ──
   *
   * 这一段我错了三次，三次都记下来，因为每次的错法都很典型。
   *
   * 错误一：用**边缘**方位角分布判断"有没有旋臂"。
   *   twist = 5.2 意味着 θ 从盘心到边缘扫过约 298°，于是即使只有 4 条臂，
   *   θ 的边缘分布也几乎均匀（实测 χ² 只有 2.4）。必须去掉缠绕量再看。
   *
   * 错误二：去掉缠绕后，用 **24 桶 χ² > 19.7** 当判据。
   *   没有分辨力。原因不在统计量本身，而在**臂宽**：
   *   盘面内散射（布局第 ③ 步，`scat` 最大可达 0.20·r）让每条臂的
   *   角宽达到 σ ≈ 33° ≈ 2.2 个桶，4 条臂的信号被摊进 24 个桶里，
   *   χ² 的期望增量很小。v1 → v2 节点从 303 涨到 405、样本分布变化，
   *   χ² 就从 27 掉到 13 —— 而**逐臂圆 σ 两边都是 30° 上下**，
   *   臂的相干性根本没变。换个桶数（12/24/48）结论就翻转，
   *   所以它测的是"桶和样本怎么切"，不是"有没有臂"。
   *
   * 错误三：改成把相位折叠到 N 重对称上算 R_N。
   *   这次是想对了方向但选错了统计量：折叠会把**臂宽也乘 N 倍**
   *   （4 条臂 → 折叠后角宽 4×33° = 132°），于是
   *   R₄ = exp(−(Nσ)²/2) ≈ 0.07，而噪声底是 √(π/4N) ≈ 0.044 ——
   *   信噪比只有 1.3，什么都测不出来（实测 R₄ = 0.0554，几乎等于噪声）。
   *
   * 正解：**逐臂分别测**，不做任何折叠。
   *   对第 k 条臂，先减掉它自己的分支相位 branch_k = 2πk/arms，
   *   再算剩余相位的圆集中度：
   *
   *     R_k = | (1/n_k) Σ exp(i·(θ_j − t_j·twist − branch_k)) |
   *
   *   这是"该族的节点是否聚在自己那条臂上"的直接度量，且因为
   *   不折叠，臂宽保持 33° 不变 → R_k ≈ exp(−σ²/2) ≈ 0.84。
   *   噪声底（完全无结构时）是 √(π/4n_k) ≈ 0.088（n_k ≈ 100）。
   *   实测 0.82~0.92，是本底噪声的 **9~10 倍** —— 这才是有效检验。
   *
   * 断言写成 R_k > 3 × √(π/4n_k)，于是判据自动适应每条臂的样本量。 */
  let armStats = null
  if (arms > 0) {
    const branchOf = (k) => (k / SHAPES[id].arms) * Math.PI * 2
    const conc = (arr) => {
      let cx = 0, cy = 0
      for (const a of arr) { cx += Math.cos(a); cy += Math.sin(a) }
      cx /= arr.length; cy /= arr.length
      return Math.hypot(cx, cy)
    }
    // 每条臂的相位残差（去掉缠绕 + 去掉自己的分支角）
    const buckets = Array.from({ length: SHAPES[id].arms }, () => [])
    for (const n of nodes) {
      const t = Math.hypot(n.pos.x, n.pos.z) / maxR
      // 该节点属于哪条臂：由它的族决定（armIdx 在 buildGraph 里已算出）
      const k = (n.armIdx ?? 0) % SHAPES[id].arms
      buckets[k].push(n.theta - t * SHAPES[id].twist - branchOf(k))
    }
    armStats = buckets.map((arr, k) => {
      const Rn = arr.length ? conc(arr) : 0
      // 噪声底：完全均匀时 R 的期望量级 ~ √(π/4n)
      const floor = Math.sqrt(Math.PI / (4 * Math.max(1, arr.length)))
      return { k, n: arr.length, R: +Rn.toFixed(4), floor: +floor.toFixed(4),
        ratio: +(Rn / floor).toFixed(2) }
    })
  }

  // 半径分布指纹：**目标半径**（松弛前）才是"重要度 → 半径"这条映射的产物。
  // 松弛后半径会变（松弛只看谁压住谁、不看重要度），所以不能用它做断言。
  const sortedRT = [...nodes.map((n) => n.radiusTarget)].sort((a, b) => a - b)
  const fingerprint = sortedRT.slice(0, 5).map((v) => +v.toFixed(4)).join(',')
  const rtMin = sortedRT[0], rtMax = sortedRT[sortedRT.length - 1]

  // 同心环：目标半径应该只剩 16 个离散值（SHAPES.ring.rings）
  const ringVals = new Set([...nodes.map((n) => n.radiusTarget)].map((v) => v.toFixed(3)))

  results.push({
    id, name: S.name, n: nodes.length, maxR: +maxR.toFixed(1),
    rho: +rho.toFixed(4), thick: +thick.toFixed(4),
    chi: +chi.toFixed(1), armStats, fingerprint,
    rtMin: +rtMin.toFixed(4), rtMax: +rtMax.toFixed(4),
    ringVals: ringVals.size,
  })
}

console.log('\n形态     节点  maxR   秩相关    厚径比   边缘χ²   逐臂信噪比(最小)  逐臂 R')
for (const r of results) {
  const ar = r.armStats
  const minR = ar ? Math.min(...ar.map((a) => a.R)) : 0
  const minRatio = ar ? Math.min(...ar.map((a) => a.ratio)) : 0
  console.log(
    `${r.id.padEnd(8)} ${String(r.n).padStart(4)} ${String(r.maxR).padStart(6)} ` +
    `${String(r.rho).padStart(8)} ${String(r.thick).padStart(8)} ` +
    `${String(r.chi).padStart(8)} ${String(ar ? minRatio + '×' : '—').padStart(16)} ` +
    `${String(ar ? minR : '—').padStart(8)}`,
  )
}
for (const r of results.filter((x) => x.armStats)) {
  console.log(`  [${r.id}] 逐臂明细: ` + r.armStats.map((a) =>
    `臂${a.k}: n=${a.n} R=${a.R} (底 ${a.floor}, ${a.ratio}×)`).join('  '))
}

console.log('\n=== 断言 ===')
const fails = []
function check(name, ok, detail) {
  console.log(`  ${ok ? '通过' : '失败'}  ${name}${detail ? ' — ' + detail : ''}`)
  if (!ok) fails.push(name)
}

// 1) 所有形态都必须保持「越中心越重要」
for (const r of results) {
  check(`[${r.id}] 半径 vs 重要度强负相关`, r.rho < -0.95, `ρ=${r.rho}`)
}
// 2) 所有形态都必须保持「大致在同一平面内」
for (const r of results) {
  check(`[${r.id}] 薄盘（厚径比 < 0.15）`, r.thick < 0.15, `${r.thick}`)
}
/* 3) **目标半径**（= 重要度映射的直接产物）必须逐位一致。
 *    这才是我要断言的不变量："形态不碰半径映射"。
 *
 *    松弛**之后**的半径三者并不相同，这是对的、不是 bug：
 *    松弛不看重要度，只按"谁压住谁"推挤，而方位角变了（棒/均匀分布）
 *    邻居就变了，推挤结果自然不同。它由下面的秩相关把关 ——
 *    四者都保持 −0.99，说明松弛没有破坏次序。 */
const sameRadial = ['spiral', 'barred', 'diffuse']
const ref = results.find((r) => r.id === 'spiral')
for (const r of results.filter((x) => sameRadial.includes(x.id) && x.id !== 'spiral')) {
  check(`[${r.id}] 目标半径与 spiral 逐位一致`, r.fingerprint === ref.fingerprint,
    `${r.fingerprint} vs ${ref.fingerprint}`)
  check(`[${r.id}] 目标半径范围与 spiral 一致`,
    Math.abs(r.rtMin - ref.rtMin) < 1e-6 && Math.abs(r.rtMax - ref.rtMax) < 1e-6,
    `[${r.rtMin},${r.rtMax}] vs [${ref.rtMin},${ref.rtMax}]`)
}

/* 4) 同心环：目标半径必须塌缩成 16 个离散值 */
{
  const ringRes = results.find((r) => r.id === 'ring')
  check('[ring] 目标半径吸附成 16 个离散环', ringRes.ringVals === 16,
    `不同半径值 ${ringRes.ringVals} 个`)
  const sp = results.find((r) => r.id === 'spiral')
  check('[spiral] 目标半径是连续的（不是 16 档）', sp.ringVals > 100,
    `不同半径值 ${sp.ringVals} 个`)
}

/* 5) 无旋臂形态的方位角应接近均匀 */
for (const r of results.filter((x) => SHAPES[x.id].arms === 0)) {
  check(`[${r.id}] 方位角接近均匀（边缘χ²<19.7）`, r.chi < 19.7, `χ²=${r.chi}`)
}
/* 5b) 有旋臂形态：**逐臂**必须聚在自己的分支相位上（这才是真的旋臂）。
 *
 * 判据用 R > 3 × 噪声底，底 = √(π/4n)（完全均匀时的圆集中度量级）。
 * 逐臂测而不是折叠后测的理由见上面那段长注释 —— 折叠会把臂宽也乘 N 倍。 */
for (const r of results.filter((x) => SHAPES[x.id].arms > 0)) {
  const worst = r.armStats.reduce((a, b) => (a.ratio < b.ratio ? a : b))
  check(`[${r.id}] 每条臂都聚在自己的分支相位上（R > 3×噪声底）`,
    worst.ratio > 3, `最弱臂${worst.k}: R=${worst.R} / 底${worst.floor} = ${worst.ratio}×`)
  check(`[${r.id}] 边缘分布看不出臂（这正说明必须看去缠绕量）`, r.chi < 19.7, `边缘χ²=${r.chi}`)
}

console.log(`\n${'='.repeat(52)}`)
console.log(fails.length ? `失败 ${fails.length} 项：\n  · ` + fails.join('\n  · ') : '全部通过')
console.log('='.repeat(52))
process.exit(fails.length ? 1 : 0)
