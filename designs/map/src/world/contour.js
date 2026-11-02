/**
 * world/contour.js — 多标签 marching squares、链拼接、Chaikin 平滑、RDP 简化、环工具。
 *
 * 为什么是"多标签"而不是"每国各跑一遍二值等值线"：
 *   每国单独取 min(陆地场, 本国指示场) 的 0 等值线再各自平滑，会在"海岸 × 国界"的交汇格里
 *   各切掉一个小角，三国交汇处也一样 —— 放大后露出一小块海色三角（拼图缝）。
 *   这里把每个顶点标成 {海, 国家 0..7} 之一，一次性求出整张平面剖分：
 *   每条边界线段只生成一次、左右两侧各记一个标签；≥3 个标签相遇的格放一个"交汇点"。
 *   边界被切成"两个交汇点之间、左右标签不变"的链，每条链只平滑一次（端点固定），
 *   国家环、海岸线、国界都由同一批链拼出 —— 相邻国在国界上逐点重合，交汇处零缝隙。
 *
 * 朝向约定：线段 P→Q 的"左侧" = cross(Q-P, R-P) > 0 的一侧；规范化后左侧标签 < 右侧标签。
 *   按"本区域在左"拼出的外环鞋带面积为正，洞为负。
 */

/**
 * 追踪全部标签边界。
 * @param g     网格（fields.makeGrid）
 * @param label Int8Array 顶点标签（世界边缘一圈必须同一标签，保证闭合）
 * @param pv    (lo, hi, k) → 顶点 k 上"偏向 lo 一侧"的有符号量（lo 标签的顶点应为正）
 * @returns Array<{pts:number[], left, right, closed, v0, v1}>
 */
export function traceBoundaries(g, label, pv) {
  const { NX, NY, cell, x0, y0 } = g
  const H = NY * (NX - 1), V = (NY - 1) * NX
  const vmap = new Int32Array(H + V + (NX - 1) * (NY - 1)).fill(-1)
  const VX = [], VY = [], VDEG = []
  const SA = [], SB = [], SL = [], SR = []

  // 边上的交点：水平边 (i,j)-(i+1,j)、竖直边 (i,j)-(i,j+1)，t 总从规范起点量起（相邻两格算出同一点）
  function edgeVertex(horiz, i, j) {
    const id = horiz ? j * (NX - 1) + i : H + j * NX + i
    let c = vmap[id]
    if (c >= 0) return c
    const k1 = j * NX + i, k2 = horiz ? k1 + 1 : k1 + NX
    const a = label[k1], b = label[k2]
    const lo = a < b ? a : b, hi = a < b ? b : a
    const v1 = pv(lo, hi, k1), v2 = pv(lo, hi, k2)
    let t = 0.5
    if ((v1 > 0) !== (v2 > 0) && v1 !== v2) t = v1 / (v1 - v2)
    t = t < 0.03 ? 0.03 : t > 0.97 ? 0.97 : t
    const px = x0 + i * cell, py = y0 + j * cell
    c = VX.length
    VX.push(horiz ? px + t * cell : px); VY.push(horiz ? py : py + t * cell); VDEG.push(0)
    vmap[id] = c
    return c
  }
  function centerVertex(i, j, xs, ys) {
    const id = H + V + j * (NX - 1) + i
    let c = vmap[id]
    if (c >= 0) return c
    let sx = 0, sy = 0
    for (let q = 0; q < xs.length; q++) { sx += xs[q]; sy += ys[q] }
    c = VX.length
    VX.push(sx / xs.length); VY.push(sy / ys.length); VDEG.push(0)
    vmap[id] = c
    return c
  }
  // 发出一条线段：labA 是参考角点 (rx,ry) 的标签，labB 是另一侧
  function emit(p, q, labA, rx, ry, labB) {
    const cr = (VX[q] - VX[p]) * (ry - VY[p]) - (VY[q] - VY[p]) * (rx - VX[p])
    const aLeft = cr > 0
    const lo = labA < labB ? labA : labB
    // 规范：左侧 = lo
    const keep = (labA === lo) === aLeft
    if (keep) { SA.push(p); SB.push(q) } else { SA.push(q); SB.push(p) }
    SL.push(lo); SR.push(labA < labB ? labB : labA)
    VDEG[p]++; VDEG[q]++
  }

  const cl = [0, 0, 0, 0], cx = [0, 0, 0, 0], cy = [0, 0, 0, 0], ck = [0, 0, 0, 0]
  const ev = [-1, -1, -1, -1]
  for (let j = 0; j < NY - 1; j++) {
    for (let i = 0; i < NX - 1; i++) {
      const k0 = j * NX + i
      const l0 = label[k0], l1 = label[k0 + 1], l2 = label[k0 + NX + 1], l3 = label[k0 + NX]
      if (l0 === l1 && l1 === l2 && l2 === l3) continue
      // 角点顺时针（屏幕坐标）：0 左上、1 右上、2 右下、3 左下；边 e_m 连接角 m 与 m+1
      cl[0] = l0; cl[1] = l1; cl[2] = l2; cl[3] = l3
      ck[0] = k0; ck[1] = k0 + 1; ck[2] = k0 + NX + 1; ck[3] = k0 + NX
      const px = x0 + i * cell, py = y0 + j * cell
      cx[0] = px; cy[0] = py; cx[1] = px + cell; cy[1] = py; cx[2] = px + cell; cy[2] = py + cell; cx[3] = px; cy[3] = py + cell
      let nc = 0
      ev[0] = l0 !== l1 ? edgeVertex(true, i, j) : -1
      ev[1] = l1 !== l2 ? edgeVertex(false, i + 1, j) : -1
      ev[2] = l2 !== l3 ? edgeVertex(true, i, j + 1) : -1
      ev[3] = l3 !== l0 ? edgeVertex(false, i, j) : -1
      for (let m = 0; m < 4; m++) if (ev[m] >= 0) nc++
      // 不同标签数（不分配 Set）
      let distinct = 1
      if (l1 !== l0) distinct++
      if (l2 !== l0 && l2 !== l1) distinct++
      if (l3 !== l0 && l3 !== l1 && l3 !== l2) distinct++
      if (nc === 2) {
        let a = -1, b = -1
        for (let m = 0; m < 4; m++) if (ev[m] >= 0) { if (a < 0) a = m; else b = m }
        // 参考角：边 a 的终点角 (a+1)，它在 a 与 b 之间的弧上
        // （边 a 隔开角 a 与角 a+1，所以角 a 的标签就是另一侧）
        const r = (a + 1) % 4
        emit(ev[a], ev[b], cl[r], cx[r], cy[r], cl[a])
      } else if (nc === 4 && distinct === 2) {
        // 鞍点：用格心的 pv 均值决定哪条对角线连通
        const A = l0, B = l1, lo = A < B ? A : B
        let s = 0
        for (let m = 0; m < 4; m++) s += pv(lo, A < B ? B : A, ck[m])
        const aConnected = (s > 0) === (A === lo)
        if (aConnected) {
          // 切下 B 角（1 与 3）：e0–e1 包住角 1，e2–e3 包住角 3
          emit(ev[0], ev[1], B, cx[1], cy[1], A)
          emit(ev[2], ev[3], B, cx[3], cy[3], A)
        } else {
          emit(ev[3], ev[0], A, cx[0], cy[0], B)
          emit(ev[1], ev[2], A, cx[2], cy[2], B)
        }
      } else {
        // ≥3 个标签：放一个交汇点 J，向每个交点连一根辐条
        const xs = [], ys = []
        for (let m = 0; m < 4; m++) if (ev[m] >= 0) { xs.push(VX[ev[m]]); ys.push(VY[ev[m]]) }
        const J = centerVertex(i, j, xs, ys)
        for (let m = 0; m < 4; m++) {
          if (ev[m] < 0) continue
          const n1 = (m + 1) % 4
          emit(J, ev[m], cl[m], cx[m], cy[m], cl[n1])
        }
      }
    }
  }

  // 邻接：每个顶点的出边链表
  const nV = VX.length, nS = SA.length
  const headOut = new Int32Array(nV).fill(-1), nextOut = new Int32Array(nS).fill(-1)
  for (let s = 0; s < nS; s++) { nextOut[s] = headOut[SA[s]]; headOut[SA[s]] = s }
  const used = new Uint8Array(nS)
  const chains = []
  const walk = (s0) => {
    const pts = [VX[SA[s0]], VY[SA[s0]]]
    const v0 = SA[s0]
    let s = s0, v
    for (;;) {
      used[s] = 1
      v = SB[s]
      pts.push(VX[v], VY[v])
      if (VDEG[v] !== 2 || v === v0) break
      let nx = -1
      for (let t = headOut[v]; t >= 0; t = nextOut[t]) if (!used[t]) { nx = t; break }
      if (nx < 0) break
      s = nx
    }
    const closed = v === v0 && VDEG[v0] === 2
    if (closed) { pts.length -= 2 }
    chains.push({ pts, left: SL[s0], right: SR[s0], closed, v0, v1: v })
  }
  // 先从交汇点出发（开放链），剩下的都是闭合环
  for (let v = 0; v < nV; v++) {
    if (VDEG[v] === 2) continue
    for (let s = headOut[v]; s >= 0; s = nextOut[s]) if (!used[s]) walk(s)
  }
  for (let s = 0; s < nS; s++) if (!used[s]) walk(s)
  return chains
}

/** Chaikin 细分：开放链端点固定（交汇点不动，拼接处零缝隙），闭合链环绕 */
export function chaikin(p, iters, closed) {
  let a = p
  for (let it = 0; it < iters; it++) {
    const n = a.length >> 1
    if (n < 3) return a
    const out = []
    if (closed) {
      for (let s = 0; s < n; s++) {
        const t = (s + 1) % n
        const ax = a[2 * s], ay = a[2 * s + 1], bx = a[2 * t], by = a[2 * t + 1]
        out.push(0.75 * ax + 0.25 * bx, 0.75 * ay + 0.25 * by, 0.25 * ax + 0.75 * bx, 0.25 * ay + 0.75 * by)
      }
    } else {
      out.push(a[0], a[1])
      for (let s = 0; s < n - 1; s++) {
        const ax = a[2 * s], ay = a[2 * s + 1], bx = a[2 * s + 2], by = a[2 * s + 3]
        if (s > 0) out.push(0.75 * ax + 0.25 * bx, 0.75 * ay + 0.25 * by)
        if (s < n - 2) out.push(0.25 * ax + 0.75 * bx, 0.25 * ay + 0.75 * by)
      }
      out.push(a[2 * n - 2], a[2 * n - 1])
    }
    a = out
  }
  return a
}

/** Ramer–Douglas–Peucker（开放折线，端点保留） */
export function rdp(p, eps) {
  const n = p.length >> 1
  if (n <= 2) return p.slice()
  const keep = new Uint8Array(n)
  keep[0] = 1; keep[n - 1] = 1
  const stack = [0, n - 1]
  const e2 = eps * eps
  while (stack.length) {
    const b = stack.pop(), a = stack.pop()
    const ax = p[2 * a], ay = p[2 * a + 1], bx = p[2 * b], by = p[2 * b + 1]
    const dx = bx - ax, dy = by - ay, ll = dx * dx + dy * dy || 1e-12
    let best = -1, bd = e2
    for (let i = a + 1; i < b; i++) {
      const px = p[2 * i] - ax, py = p[2 * i + 1] - ay
      const cr = px * dy - py * dx
      const d = (cr * cr) / ll
      if (d > bd) { bd = d; best = i }
    }
    if (best >= 0) { keep[best] = 1; stack.push(a, best, best, b) }
  }
  const out = []
  for (let i = 0; i < n; i++) if (keep[i]) out.push(p[2 * i], p[2 * i + 1])
  return out
}

/** 闭合环的 RDP：以首点与离它最远的点切成两半分别简化 */
export function rdpClosed(p, eps) {
  const n = p.length >> 1
  if (n < 8) return p.slice()
  let far = 0, fd = -1
  for (let i = 1; i < n; i++) { const d = (p[2 * i] - p[0]) ** 2 + (p[2 * i + 1] - p[1]) ** 2; if (d > fd) { fd = d; far = i } }
  const h1 = rdp(p.slice(0, 2 * far + 2), eps)
  const h2 = rdp(p.slice(2 * far).concat([p[0], p[1]]), eps)
  return h1.slice(0, -2).concat(h2.slice(0, -2))
}

/** 平滑一条链：Chaikin ×iters + RDP(eps)。开放链端点不变。 */
export function smoothChain(ch, iters = 2, eps = 0.6) {
  const s = chaikin(ch.pts, iters, ch.closed)
  return ch.closed ? rdpClosed(s, eps) : rdp(s, eps)
}

/**
 * 把一组已定向的链（区域在左）拼成闭合环。
 * @param items Array<{pts:number[], closed, v0, v1}>（pts 已按需反向，v0/v1 同步交换）
 * @returns Float32Array[]
 */
export function assembleRings(items) {
  const rings = []
  const byStart = new Map()
  for (const it of items) {
    if (it.closed) { rings.push(new Float32Array(it.pts)); continue }
    if (!byStart.has(it.v0)) byStart.set(it.v0, [])
    byStart.get(it.v0).push(it)
  }
  const used = new Set()
  for (const it of items) {
    if (it.closed || used.has(it)) continue
    used.add(it)
    const ring = it.pts.slice()
    const start = it.v0
    let v = it.v1, guard = 0
    while (v !== start && guard++ < 100000) {
      const cand = byStart.get(v)
      let nx = null
      if (cand) for (const c of cand) if (!used.has(c)) { nx = c; break }
      if (!nx) break
      used.add(nx)
      for (let q = 2; q < nx.pts.length; q++) ring.push(nx.pts[q])
      v = nx.v1
    }
    // 首尾重复点去掉（闭合环约定首尾不重复）
    const n = ring.length
    if (n >= 4 && Math.abs(ring[0] - ring[n - 2]) < 1e-6 && Math.abs(ring[1] - ring[n - 1]) < 1e-6) ring.length = n - 2
    if (ring.length >= 6) rings.push(new Float32Array(ring))
  }
  return rings
}

/** 链定向：want 标签放到左侧（必要时反向） */
export function orient(ch, pts, wantLeft) {
  if (ch.left === wantLeft) return { pts, closed: ch.closed, v0: ch.v0, v1: ch.v1 }
  const r = new Array(pts.length)
  const n = pts.length >> 1
  for (let i = 0; i < n; i++) { r[2 * i] = pts[2 * (n - 1 - i)]; r[2 * i + 1] = pts[2 * (n - 1 - i) + 1] }
  return { pts: r, closed: ch.closed, v0: ch.v1, v1: ch.v0 }
}

/** 鞋带面积（区域在左 → 正） */
export function ringArea(r) {
  let s = 0
  const n = r.length >> 1
  for (let i = 0, j = n - 1; i < n; j = i++) s += r[2 * j] * r[2 * i + 1] - r[2 * i] * r[2 * j + 1]
  return s / 2
}

/** 点在环内（偶奇规则） */
export function pointInRing(r, x, y) {
  let inside = false
  const n = r.length >> 1
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = r[2 * i], yi = r[2 * i + 1], xj = r[2 * j], yj = r[2 * j + 1]
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside
  }
  return inside
}

/** 点到折线（closed 时含首尾段）的最近距离与最近点 */
export function nearestOnPoly(p, x, y, closed = true) {
  const n = p.length >> 1
  let bd = Infinity, bx = 0, by = 0, bs = 0, bu = 0
  const segN = closed ? n : n - 1
  for (let s = 0; s < segN; s++) {
    const t = (s + 1) % n
    const ax = p[2 * s], ay = p[2 * s + 1], ex = p[2 * t] - ax, ey = p[2 * t + 1] - ay
    const ll = ex * ex + ey * ey || 1e-12
    let u = ((x - ax) * ex + (y - ay) * ey) / ll
    u = u < 0 ? 0 : u > 1 ? 1 : u
    const qx = ax + u * ex, qy = ay + u * ey
    const d = (x - qx) ** 2 + (y - qy) ** 2
    if (d < bd) { bd = d; bx = qx; by = qy; bs = s; bu = u }
  }
  return { d: Math.sqrt(bd), x: bx, y: by, seg: bs, u: bu }
}

/** 二值等值线环（ripples 用）：inside(k) 为真的区域的边界，平滑后返回 Float32Array[] */
export function isoRings(g, field, level, iters = 2, eps = 0.5) {
  const { NX, NY, N } = g
  const lab = new Int8Array(N)
  for (let k = 0; k < N; k++) lab[k] = field[k] < level ? 1 : 0
  for (let i = 0; i < NX; i++) { lab[i] = 0; lab[(NY - 1) * NX + i] = 0 }
  for (let j = 0; j < NY; j++) { lab[j * NX] = 0; lab[j * NX + NX - 1] = 0 }
  // lo = 0 = 外侧：pv 在外侧为正
  const chains = traceBoundaries(g, lab, (lo, hi, k) => field[k] - level)
  const out = []
  for (const ch of chains) {
    const s = smoothChain(ch, iters, eps)
    if (s.length >= 8) out.push(new Float32Array(s))
  }
  return out
}
