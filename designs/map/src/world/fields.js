/**
 * world/fields.js — 标量场：网格、高斯泼溅、陆地/领土标签、到折线的精确距离场。
 *
 * 网格约定：顶点 (i,j) 位于 (x0 + i·cell, y0 + j·cell)，共 NX×NY 个顶点（覆盖 WORLD_BOUNDS，含两端）。
 * 所有场都存在顶点上（Float32Array，下标 j·NX + i），marching squares 在格内线性插值。
 *
 * 关键取舍：
 * - 高斯泼溅用"可分离"写法：先算一行 gx、一列 gy 的 1D 权重，二维权重 = gx·gy，
 *   每个城市只做 O(窗口格数) 次乘加，不做 exp —— 405 个城市 × 两套 σ 在 Node 下 ~10 ms。
 * - 距离场不用 Felzenszwalb 的"格点源"EDT，而用"向量传播（dead reckoning）"：
 *   种子 = 折线附近顶点到**真实平滑折线**的最近点，再用 8 邻域前后两遍传播最近点。
 *   这样等深线是"离平滑海岸线 d wu"，而不是"离阶梯状陆地格 d wu"，放大后也不会出现格子感。
 *   （SPEC §6.4 第 8 步建议 Felzenszwalb；这里换成精度更高、同样 O(N) 的做法。）
 */

export function makeGrid(bounds, cell) {
  const NX = Math.round((bounds.x1 - bounds.x0) / cell) + 1
  const NY = Math.round((bounds.y1 - bounds.y0) / cell) + 1
  return { NX, NY, N: NX * NY, cell, x0: bounds.x0, y0: bounds.y0 }
}

/** 世界点 → 最近顶点下标（越界夹紧） */
export function nearestVertex(g, x, y) {
  const i = Math.max(0, Math.min(g.NX - 1, Math.round((x - g.x0) / g.cell)))
  const j = Math.max(0, Math.min(g.NY - 1, Math.round((y - g.y0) / g.cell)))
  return j * g.NX + i
}

/** 双线性采样（越界夹紧） */
export function sample(g, f, x, y) {
  let fx = (x - g.x0) / g.cell, fy = (y - g.y0) / g.cell
  fx = Math.max(0, Math.min(g.NX - 1.0001, fx)); fy = Math.max(0, Math.min(g.NY - 1.0001, fy))
  const i = Math.floor(fx), j = Math.floor(fy), u = fx - i, v = fy - j
  const k = j * g.NX + i
  const a = f[k], b = f[k + 1], c = f[k + g.NX], d = f[k + g.NX + 1]
  return (a + (b - a) * u) * (1 - v) + (c + (d - c) * u) * v
}

/** 中心差分梯度（世界单位） */
export function gradient(g, f, x, y, h = 2) {
  return [(sample(g, f, x + h, y) - sample(g, f, x - h, y)) / (2 * h), (sample(g, f, x, y + h) - sample(g, f, x, y - h)) / (2 * h)]
}

/**
 * 顶点上的 fbm 场：先在 step 倍粗的格上求值，再双线性插值到全分辨率。
 * 噪声特征尺度 ≥ 90 wu，粗格 16 wu 采样肉眼无差，计算量降到 1/16（fbm 是构建里最贵的纯函数）。
 */
export function noiseGrid(g, fbmFn, scale, seed, step = 4, oct = 4) {
  const cw = Math.ceil((g.NX - 1) / step) + 1, ch = Math.ceil((g.NY - 1) / step) + 1
  const coarse = new Float32Array(cw * ch)
  for (let j = 0; j < ch; j++) for (let i = 0; i < cw; i++)
    coarse[j * cw + i] = fbmFn((g.x0 + i * step * g.cell) / scale, (g.y0 + j * step * g.cell) / scale, seed, oct)
  const out = new Float32Array(g.N)
  for (let j = 0; j < g.NY; j++) {
    const fy = j / step, cj = Math.min(ch - 2, Math.floor(fy)), v = fy - cj
    for (let i = 0; i < g.NX; i++) {
      const fx = i / step, ci = Math.min(cw - 2, Math.floor(fx)), u = fx - ci
      const k = cj * cw + ci
      const a = coarse[k], b = coarse[k + 1], c = coarse[k + cw], d = coarse[k + cw + 1]
      out[j * g.NX + i] = (a + (b - a) * u) * (1 - v) + (c + (d - c) * u) * v
    }
  }
  return out
}

/** 往场 f 上累加一个高斯 w·exp(-r²/2σ²)，3.5σ 方窗截断（截断处 < 0.2%，等值线上看不出台阶） */
export function splat(g, f, cx, cy, sigma, w = 1) {
  const R = 3.5 * sigma, c = g.cell
  const i0 = Math.max(0, Math.ceil((cx - R - g.x0) / c)), i1 = Math.min(g.NX - 1, Math.floor((cx + R - g.x0) / c))
  const j0 = Math.max(0, Math.ceil((cy - R - g.y0) / c)), j1 = Math.min(g.NY - 1, Math.floor((cy + R - g.y0) / c))
  if (i1 < i0 || j1 < j0) return
  const k2 = 1 / (2 * sigma * sigma)
  const gx = new Float32Array(i1 - i0 + 1)
  for (let i = i0; i <= i1; i++) { const d = g.x0 + i * c - cx; gx[i - i0] = Math.exp(-d * d * k2) }
  for (let j = j0; j <= j1; j++) {
    const d = g.y0 + j * c - cy
    const wy = w * Math.exp(-d * d * k2)
    const row = j * g.NX
    for (let i = i0; i <= i1; i++) f[row + i] += wy * gx[i - i0]
  }
}

/**
 * 4 连通分量标注。pred(k) → 真/假；返回 { comp: Int32Array（-1 = 不属于）, count, sizes }
 */
export function components(g, pred) {
  const { NX, NY, N } = g
  const comp = new Int32Array(N).fill(-1)
  const queue = new Int32Array(N)
  const sizes = []
  let count = 0
  for (let s = 0; s < N; s++) {
    if (comp[s] !== -1 || !pred(s)) continue
    let qh = 0, qt = 0
    queue[qt++] = s; comp[s] = count
    while (qh < qt) {
      const k = queue[qh++]
      const i = k % NX, j = (k - i) / NX
      if (i > 0 && comp[k - 1] === -1 && pred(k - 1)) { comp[k - 1] = count; queue[qt++] = k - 1 }
      if (i < NX - 1 && comp[k + 1] === -1 && pred(k + 1)) { comp[k + 1] = count; queue[qt++] = k + 1 }
      if (j > 0 && comp[k - NX] === -1 && pred(k - NX)) { comp[k - NX] = count; queue[qt++] = k - NX }
      if (j < NY - 1 && comp[k + NX] === -1 && pred(k + NX)) { comp[k + NX] = count; queue[qt++] = k + NX }
    }
    sizes.push(qt)
    count++
  }
  return { comp, count, sizes }
}

/**
 * 到一组折线的精确欧氏距离场（向量传播）。
 * @param polys Array<{pts: Float32Array|number[], closed: boolean}>
 * @returns Float32Array 距离（wu）
 */
export function polylineDistance(g, polys) {
  const { NX, NY, N, cell, x0, y0 } = g
  const d2 = new Float32Array(N).fill(Infinity)
  const px = new Float32Array(N), py = new Float32Array(N)
  const band = cell * 1.5
  // 1) 种子：每段线段附近的顶点直接算到线段的最近点
  for (const poly of polys) {
    const p = poly.pts, n = p.length >> 1
    const segN = poly.closed ? n : n - 1
    for (let s = 0; s < segN; s++) {
      const ax = p[2 * s], ay = p[2 * s + 1]
      const t = (s + 1) % n
      const bx = p[2 * t], by = p[2 * t + 1]
      const ex = bx - ax, ey = by - ay, ll = ex * ex + ey * ey || 1e-9
      const i0 = Math.max(0, Math.floor((Math.min(ax, bx) - band - x0) / cell))
      const i1 = Math.min(NX - 1, Math.ceil((Math.max(ax, bx) + band - x0) / cell))
      const j0 = Math.max(0, Math.floor((Math.min(ay, by) - band - y0) / cell))
      const j1 = Math.min(NY - 1, Math.ceil((Math.max(ay, by) + band - y0) / cell))
      for (let j = j0; j <= j1; j++) {
        const vy = y0 + j * cell
        for (let i = i0; i <= i1; i++) {
          const vx = x0 + i * cell
          let u = ((vx - ax) * ex + (vy - ay) * ey) / ll
          u = u < 0 ? 0 : u > 1 ? 1 : u
          const qx = ax + u * ex, qy = ay + u * ey
          const dd = (vx - qx) * (vx - qx) + (vy - qy) * (vy - qy)
          const k = j * NX + i
          if (dd < d2[k]) { d2[k] = dd; px[k] = qx; py[k] = qy }
        }
      }
    }
  }
  // 2) 前后两遍 8 邻域传播"最近点"
  const tryN = (k, m, vx, vy) => {
    if (d2[m] === Infinity) return
    const dx = vx - px[m], dy = vy - py[m]
    const dd = dx * dx + dy * dy
    if (dd < d2[k]) { d2[k] = dd; px[k] = px[m]; py[k] = py[m] }
  }
  for (let rep = 0; rep < 1; rep++) {  // 种子带宽 1.5 格，一遍前后扫描已足够（实测与两遍差 < 0.05 wu）
    for (let j = 0; j < NY; j++) {
      const vy = y0 + j * cell
      for (let i = 0; i < NX; i++) {
        const k = j * NX + i, vx = x0 + i * cell
        if (i > 0) tryN(k, k - 1, vx, vy)
        if (j > 0) {
          tryN(k, k - NX, vx, vy)
          if (i > 0) tryN(k, k - NX - 1, vx, vy)
          if (i < NX - 1) tryN(k, k - NX + 1, vx, vy)
        }
      }
      for (let i = NX - 2; i >= 0; i--) tryN(j * NX + i, j * NX + i + 1, x0 + i * cell, vy)
    }
    for (let j = NY - 1; j >= 0; j--) {
      const vy = y0 + j * cell
      for (let i = NX - 1; i >= 0; i--) {
        const k = j * NX + i, vx = x0 + i * cell
        if (i < NX - 1) tryN(k, k + 1, vx, vy)
        if (j < NY - 1) {
          tryN(k, k + NX, vx, vy)
          if (i < NX - 1) tryN(k, k + NX + 1, vx, vy)
          if (i > 0) tryN(k, k + NX - 1, vx, vy)
        }
      }
      for (let i = 1; i < NX; i++) tryN(j * NX + i, j * NX + i - 1, x0 + i * cell, vy)
    }
  }
  const out = new Float32Array(N)
  for (let k = 0; k < N; k++) out[k] = Math.sqrt(d2[k])
  return out
}

/**
 * 陆地与领土标签（SPEC §6.4 第 3–4 步）。
 * @param cities Array<{x, y, fi}>  fi = 族在 FAMILY_ORDER 中的下标
 * @param noise  {n, wx, wy}：顶点上的 fbm（[-1,1]），n 扰动阈值，wx/wy 是域扭曲位移方向
 * @returns { label: Int8Array（-1 海，0..7 国家）, L: Float32Array（陆地场 - 阈值，>0 为陆）, own: Float32Array[] }
 */
export function buildTerritory(g, cities, nFam, noise, P) {
  const { NX, NY, N } = g
  const Lsum = new Float32Array(N)
  let own = Array.from({ length: nFam }, () => new Float32Array(N))
  for (const c of cities) {
    splat(g, Lsum, c.x, c.y, P.sigmaLand, 1)
    splat(g, own[c.fi], c.x, c.y, P.sigmaOwn, 1)
  }
  // 域扭曲（domain warp）：在被噪声位移过的坐标上读密度场。
  // 只给阈值加噪声时，海岸处密度梯度很陡，海岸线几乎还是凸包；位移坐标才能长出半岛与海湾。
  // 国界用一份更小的扭曲（P.warpOwn），让国界线不至于是两国城市间的直中线。
  const { wx, wy } = noise
  const L = new Float32Array(N)
  const ownW = Array.from({ length: nFam }, () => new Float32Array(N))
  for (let j = 0; j < NY; j++) for (let i = 0; i < NX; i++) {
    const k = j * NX + i
    const x = g.x0 + i * g.cell, y = g.y0 + j * g.cell
    // 强扭曲长出半岛/海湾；再与"未扭曲、更高阈值"的核心场取 max：每个城市周围 ≥ ~30 wu 必是陆地，
    // 扭曲只能在城市圈之外雕刻海岸，不会把城市切到海里（不变量 1 的前提）
    const Lw = sample(g, Lsum, x + P.warpLand * wx[k], y + P.warpLand * wy[k]) - P.tau - P.noiseAmp * noise.n[k]
    const Lc = Lsum[k] - P.tauCore
    L[k] = Lw > Lc ? Lw : Lc
    if (L[k] > -0.25) {
      // 8 个国家场共用同一组双线性权重（只算一次）
      let fx = (x + P.warpOwn * wy[k] - g.x0) / g.cell, fy = (y - P.warpOwn * wx[k] - g.y0) / g.cell
      fx = fx < 0 ? 0 : fx > NX - 1.0001 ? NX - 1.0001 : fx; fy = fy < 0 ? 0 : fy > NY - 1.0001 ? NY - 1.0001 : fy
      const ii = Math.floor(fx), jj = Math.floor(fy), u = fx - ii, v = fy - jj
      const q = jj * NX + ii
      const w00 = (1 - u) * (1 - v), w10 = u * (1 - v), w01 = (1 - u) * v, w11 = u * v
      for (let f = 0; f < nFam; f++) {
        const o = own[f]
        ownW[f][k] = o[q] * w00 + o[q + 1] * w10 + o[q + NX] * w01 + o[q + NX + 1] * w11
      }
    }
  }
  own = ownW
  // 世界边缘一圈强制为海：保证所有等值线闭合
  const isEdge = (k) => { const i = k % NX, j = (k - i) / NX; return i === 0 || j === 0 || i === NX - 1 || j === NY - 1 }
  const land = new Uint8Array(N)
  for (let k = 0; k < N; k++) land[k] = L[k] > 0 && !isEdge(k) ? 1 : 0

  // 去掉没有城市的碎岛（只要分量里没有任何城市就删；比"面积 < 1500"更干净：领土永远跟着城市走）
  const cityV = cities.map((c) => nearestVertex(g, c.x, c.y))
  let lc = components(g, (k) => land[k] === 1)
  const hasCity = new Uint8Array(lc.count)
  for (const v of cityV) if (lc.comp[v] >= 0) hasCity[lc.comp[v]] = 1
  for (let k = 0; k < N; k++) if (land[k] && !hasCity[lc.comp[k]]) { land[k] = 0; if (L[k] > -0.01) L[k] = -0.01 }

  // 填内湖：不与世界边缘连通的海一律并入陆地（国家环约定不做洞；大陆内部的封闭小海在政区图上只会显得破碎）
  const sc = components(g, (k) => land[k] === 0)
  const outer = new Uint8Array(sc.count)
  for (let i = 0; i < NX; i++) { outer[sc.comp[i]] = 1; outer[sc.comp[(NY - 1) * NX + i]] = 1 }
  for (let j = 0; j < NY; j++) { outer[sc.comp[j * NX]] = 1; outer[sc.comp[j * NX + NX - 1]] = 1 }
  for (let k = 0; k < N; k++) if (!land[k] && !outer[sc.comp[k]]) { land[k] = 1; if (L[k] < 0.01) L[k] = 0.01 }

  // 领土 = argmax own_f；远离所有城市（own 全 0）的陆地格用多源 BFS 继承最近的已定格
  const label = new Int8Array(N).fill(-1)
  const queue = new Int32Array(N)
  let qt = 0
  for (let k = 0; k < N; k++) {
    if (!land[k]) continue
    let best = -2, bv = 1e-6
    for (let f = 0; f < nFam; f++) if (own[f][k] > bv) { bv = own[f][k]; best = f }
    label[k] = best
    if (best >= 0) queue[qt++] = k
  }
  bfsFill(g, label, queue, qt)

  // 清理"飞地碎片"：同标签 4 连通分量里没有本族城市的，改给它边界上最多的邻国（迭代到稳定）
  for (let pass = 0; pass < 4; pass++) {
    const comp = labelComponents(g, label)
    const ok = new Uint8Array(comp.count)
    cities.forEach((c, ci) => { const v = cityV[ci]; if (label[v] === c.fi) ok[comp.comp[v]] = 1 })
    const votes = new Map()
    for (let k = 0; k < N; k++) {
      const ck = comp.comp[k]
      if (ck < 0 || ok[ck]) continue
      const i = k % NX, j = (k - i) / NX
      const nb = [i > 0 ? k - 1 : -1, i < NX - 1 ? k + 1 : -1, j > 0 ? k - NX : -1, j < NY - 1 ? k + NX : -1]
      for (const m of nb) {
        if (m < 0 || label[m] < 0 || label[m] === label[k]) continue
        let v = votes.get(ck); if (!v) votes.set(ck, (v = new Float64Array(nFam)))
        v[label[m]]++
      }
    }
    if (!votes.size) break
    const target = new Int8Array(comp.count).fill(-1)
    for (const [ck, v] of votes) { let b = -1, bv = 0; for (let f = 0; f < nFam; f++) if (v[f] > bv) { bv = v[f]; b = f } target[ck] = b }
    let changed = 0
    for (let k = 0; k < N; k++) { const ck = comp.comp[k]; if (ck >= 0 && target[ck] >= 0) { label[k] = target[ck]; changed++ } }
    if (!changed) break
  }
  return { label, L, own, land }
}

/** 同标签（≥0）4 连通分量 */
function labelComponents(g, label) {
  const { NX, NY, N } = g
  const comp = new Int32Array(N).fill(-1)
  const queue = new Int32Array(N)
  let count = 0
  for (let s = 0; s < N; s++) {
    if (comp[s] !== -1 || label[s] < 0) continue
    const lab = label[s]
    let qh = 0, qt = 0
    queue[qt++] = s; comp[s] = count
    while (qh < qt) {
      const k = queue[qh++]
      const i = k % NX, j = (k - i) / NX
      if (i > 0 && comp[k - 1] === -1 && label[k - 1] === lab) { comp[k - 1] = count; queue[qt++] = k - 1 }
      if (i < NX - 1 && comp[k + 1] === -1 && label[k + 1] === lab) { comp[k + 1] = count; queue[qt++] = k + 1 }
      if (j > 0 && comp[k - NX] === -1 && label[k - NX] === lab) { comp[k - NX] = count; queue[qt++] = k - NX }
      if (j < NY - 1 && comp[k + NX] === -1 && label[k + NX] === lab) { comp[k + NX] = count; queue[qt++] = k + NX }
    }
    count++
  }
  return { comp, count }
}

/** 多源 BFS：label = -2 的格继承相邻已定格的标签 */
function bfsFill(g, label, queue, qt) {
  const { NX, NY } = g
  let qh = 0
  while (qh < qt) {
    const k = queue[qh++]
    const i = k % NX, j = (k - i) / NX
    const lab = label[k]
    if (i > 0 && label[k - 1] === -2) { label[k - 1] = lab; queue[qt++] = k - 1 }
    if (i < NX - 1 && label[k + 1] === -2) { label[k + 1] = lab; queue[qt++] = k + 1 }
    if (j > 0 && label[k - NX] === -2) { label[k - NX] = lab; queue[qt++] = k - NX }
    if (j < NY - 1 && label[k + NX] === -2) { label[k + NX] = lab; queue[qt++] = k + NX }
  }
}
