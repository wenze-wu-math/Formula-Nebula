/**
 * ═══════════════════════════════════════════════════════════════
 *  关联连线
 * ═══════════════════════════════════════════════════════════════
 *
 *  形状：三次贝塞尔曲线，两个控制点**朝盘心拉**，让一堆边收成优雅的
 *  束线（穷人的层次边捆绑），而不是散乱的直线网。
 *  做法参考 Cohenjikan/shiyun 的 GiftLines（BUNDLE = 0.30）。
 *
 *  颜色：冷蓝。公式本身全是橙黄色，连线必须用冷色才能读成"另一层结构"，
 *  否则整片糊成一团橙色。
 *
 *  ⚠ 这里**没有**沿连线流动的光点。
 *    那是上一版的 glowAlongLink 效果，会让画面看起来像两个公式之间在
 *    "互相传递信号"，已按需求整体删除。连线只是静态的关联，不表示流动。
 *
 *  ⚠⚠ 关键交互：**初始不画任何连线**。
 *    没点选时公式之间"只有位置关系"，画面是干净的星海；
 *    点中一个公式后，才浮现出与它**直接关联**的那些弧线。
 *    实现见 update() 的 focusId 参数 —— 只绘制与该节点相邻的边，
 *    其余边在缓冲区里被压成一个零长度段（不占屏幕像素）。
 *
 *  性能要点：LineSegmentsGeometry.setPositions() 每次调用都会新建
 *  GPU buffer，所以只在初始化时调一次；之后每帧原地改 Float32Array
 *  并置 needsUpdate，避免每帧重新分配显存。
 */

import * as THREE from 'three'
import { LineSegments2 } from 'three/examples/jsm/lines/LineSegments2.js'
import { LineSegmentsGeometry } from 'three/examples/jsm/lines/LineSegmentsGeometry.js'
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js'
import { LINKS } from './config.js'

/** 点到线段的最短距离的**平方**（避免开方，比较时用平方即可）。
 *  拾取用：判断鼠标是否落在某一段折线附近。 */
function distToSegmentSq(px, py, ax, ay, bx, by) {
  const vx = bx - ax
  const vy = by - ay
  const wx = px - ax
  const wy = py - ay
  const len2 = vx * vx + vy * vy
  // 退化成一个点（两个端点重合）：直接算到该点的距离
  const t = len2 > 1e-9 ? Math.max(0, Math.min(1, (wx * vx + wy * vy) / len2)) : 0
  const dx = px - (ax + t * vx)
  const dy = py - (ay + t * vy)
  return dx * dx + dy * dy
}

export function createLinks(graph) {
  const group = new THREE.Group()
  group.name = 'links'

  const usable = graph.links.filter((l) => l.weight >= LINKS.minWeight)
  if (!LINKS.enabled || usable.length === 0) {
    return {
      group, update() {}, setResolution() {}, highlight() {}, degreeOf: () => 0, neighboursOf: () => [],
      // 拾取接口也要给空实现：调用方（scene.js 的 pointermove）不检查存在性，
      // 缺了这三个方法会在关掉连线时直接抛异常。
      pickEdge: () => -1, edgeAt: () => null,
    }
  }

  const STEPS = Math.max(2, LINKS.curveSteps | 0)
  const SEGS = STEPS          // 每条边分成 STEPS 段
  const VERTS = SEGS * 2      // LineSegments 每段两个端点
  const count = usable.length

  /* ── 邻接表：节点 id → 它的边在 usable 里的下标 ──
   * 点选时只画这些边。预先建好，避免每次点击都全表扫描。 */
  const incident = new Map()
  for (let i = 0; i < count; i++) {
    const l = usable[i]
    for (const end of [l.source, l.target]) {
      let arr = incident.get(end)
      if (!arr) { arr = []; incident.set(end, arr) }
      arr.push(i)
    }
  }

  // 每条边的采样点缓存（局部坐标 = 世界坐标，因为整层靠 group 旋转）
  const curves = usable.map(() => new Float32Array(VERTS * 3))
  const colors = new Float32Array(count * VERTS * 3)

  const cLow = new THREE.Color(LINKS.colorWeak)
  const cStrong = new THREE.Color(LINKS.colorStrong)
  /* 跨星团边用**第三套**颜色（紫罗兰）。
   *
   * 为什么必须区分：跨星团边的语义完全不同 —— 它表示"这条猜想依赖那个定理"，
   * 是两种认识论状态之间的桥，而不是同一层知识内部的相邻关系。
   * 用同一个蓝色会让人以为星团只是盘的延伸部分；
   * 用紫罗兰（暖色的猜想 ↔ 冷色的定理之间的中间色）一眼就能读出"这是桥"。
   * 亮度也刻意压暗一档：跨星团的边很长，太亮会喧宾夺主。 */
  const xLow = new THREE.Color(LINKS.colorCrossWeak)
  const xStrong = new THREE.Color(LINKS.colorCrossStrong)
  const tmp = new THREE.Color()

  /* ── 按关系类型着色（增量式，见 linkTypes.js） ──
   *
   * ⚠ 关键设计：**只有判定出类型的边才换色，related 的边保持原样**。
   *
   * 实测 1620 条里只有 16.7% 能判定出类型，其余 83.3% 是陈述句，
   * 归为 related。如果给 related 也配一个专属颜色，那等于把 83.3% 的边
   * 重新上了一遍色 —— 而那些边的类型我们**并不知道**，
   * 用颜色暗示某种分类就是骗人。
   *
   * 所以这里的做法是：related 走原来的权重蓝/紫插值（与旧版逐位一致），
   * 只有那 16.7% 换成类型色。画面上呈现为
   * 「原来那片蓝色网里浮现出几缕有颜色的线」，
   * 关掉这个开关就**完全**回到旧渲染。
   *
   * 类型的明度随权重变化（同色相下 weight 越高越亮），
   * 这样"重要度"这条既有语义不会被类型色淹没 ——
   * 类型只决定**色相**，权重仍然决定**明暗**，两个通道互不干扰。 */
  const typeLin = new Map()
  for (const d of (graph.linkTypes ? graph.linkTypes.defs : [])) {
    typeLin.set(d.id, new THREE.Color(d.linear.r, d.linear.g, d.linear.b))
  }

  function colorFor(l) {
    if (l.cross) {
      tmp.copy(xLow).lerp(xStrong, Math.pow(l.weight, 0.8))
      return tmp
    }
    const t = LINKS.colorByType ? typeLin.get(l.type) : null
    if (t && l.type !== 'related') {
      /* 类型色 × 权重明度。
       * 用 0.55 + 0.45·w 而不是纯 w：类型色本身已经是**低饱和**的，
       * 再按权重压到很暗就会丢掉色相（暗到看不出青绿和玫红的区别），
       * 那样类型这一层就白做了。0.55 的地板保证弱边也读得出色相，
       * 0.45 的动态范围保证强边仍然更亮。 */
      const k = 0.55 + 0.45 * Math.pow(l.weight, 0.8)
      // hero（权重前 10%）额外再提亮 22%：这是「强调预算」的落点。
      const boost = l.hero ? 1.22 : 1.0
      tmp.copy(t).multiplyScalar(k * boost)
    } else {
      tmp.copy(cLow).lerp(cStrong, Math.pow(l.weight, 0.8))
    }
    return tmp
  }

  /* ── 构建颜色缓冲 ──
   *
   * 抽成函数是为了能**重新着色**（设置面板里切换"按关系类型着色"）。
   * 颜色只依赖 LINKS.colorByType / useWeightColor 与每条边的 type/weight，
   * 都是常量，所以重算一次是纯 CPU 的几毫秒，不需要重建几何。 */
  function buildColors() {
    for (let i = 0; i < count; i++) {
      const l = usable[i]
      // 颜色按权重插值：弱关联偏暗蓝，强关联偏亮蓝
      tmp.copy(colorFor(l))
      if (!LINKS.useWeightColor) tmp.copy(l.cross ? xStrong : cStrong)
      for (let k = 0; k < VERTS; k++) {
        colors[i * VERTS * 3 + k * 3 + 0] = tmp.r
        colors[i * VERTS * 3 + k * 3 + 1] = tmp.g
        colors[i * VERTS * 3 + k * 3 + 2] = tmp.b
      }
    }
  }
  buildColors()

  const positions = new Float32Array(count * VERTS * 3)

  const geo = new LineSegmentsGeometry()
  geo.setPositions(positions)          // 只调这一次
  geo.setColors(colors)

  const mat = new LineMaterial({
    linewidth: LINKS.width,
    transparent: true,
    opacity: LINKS.opacity,
    vertexColors: true,
    dashed: false,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  })
  mat.resolution.set(window.innerWidth, window.innerHeight)

  const mesh = new LineSegments2(geo, mat)
  mesh.frustumCulled = false
  group.add(mesh)

  // 每帧原地更新的那个属性
  const instanceBuf = geo.attributes.instanceStart.data

  /** 求一条边的三次贝塞尔采样点（写进 curves[i]） */
  function sampleCurve(i, ax, ay, az, bx, by, bz, cross) {
    const out = curves[i]
    // 控制点：取弦上的 1/3、2/3 处，再朝盘心拉 BUNDLE
    //
    // ⚠ 跨星团边**不能**用同一套控制点。
    //   "朝盘心拉"对盘内的短线是有效的束线技巧，但跨星团边长达 260+，
    //   把它拉向原点会让弧线穿过整个星系盘（视觉上像是盘里冒出一堆紫线），
    //   而且拉到原点附近后所有跨星团边会挤成一条粗带，完全失去"哪条连哪条"的信息。
    //   所以跨星团边改成**朝自己的中点**微收（bundle 更小），
    //   得到一条平缓的外拱弧 —— 从盘的外缘绕出去接上星团，不穿过盘面。
    const k = cross ? LINKS.bundleCross : LINKS.bundle
    const c1x = (ax + (bx - ax) * 0.33) * (1 - k)
    const c1y = (ay + (by - ay) * 0.33) * (1 - k)
    const c1z = (az + (bz - az) * 0.33) * (1 - k)
    const c2x = (ax + (bx - ax) * 0.67) * (1 - k)
    const c2y = (ay + (by - ay) * 0.67) * (1 - k)
    const c2z = (az + (bz - az) * 0.67) * (1 - k)

    let prevX = ax, prevY = ay, prevZ = az
    let o = 0
    for (let s = 1; s <= SEGS; s++) {
      const t = s / SEGS
      const u = 1 - t
      const w0 = u * u * u
      const w1 = 3 * u * u * t
      const w2 = 3 * u * t * t
      const w3 = t * t * t

      const px = w0 * ax + w1 * c1x + w2 * c2x + w3 * bx
      const py = w0 * ay + w1 * c1y + w2 * c2y + w3 * by
      const pz = w0 * az + w1 * c1z + w2 * c2z + w3 * bz

      // 这一段：prev → p
      out[o++] = prevX; out[o++] = prevY; out[o++] = prevZ
      out[o++] = px;    out[o++] = py;    out[o++] = pz

      prevX = px; prevY = py; prevZ = pz
    }
  }

  /** 端点淡出系数（0 在两端 → 1 在中段），让线从公式里"生长"出来 */
  const END_FADE = 0.18
  function fadeAt(s) {
    const t = (s + 0.5) / SEGS
    if (!LINKS.endpointFade) return 1
    if (t < END_FADE) return t / END_FADE
    if (t > 1 - END_FADE) return (1 - t) / END_FADE
    return 1
  }

  /* 颜色里的淡出只算一次（几何不变） */
  function applyEndpointFade() {
    if (!LINKS.endpointFade) return
    for (let i = 0; i < count; i++) {
      const base = colors.subarray(i * VERTS * 3, (i + 1) * VERTS * 3)
      for (let s = 0; s < SEGS; s++) {
        const f = fadeAt(s)
        for (const v of [s * 2, s * 2 + 1]) {
          base[v * 3 + 0] *= f
          base[v * 3 + 1] *= f
          base[v * 3 + 2] *= f
        }
      }
    }
  }
  applyEndpointFade()

  /* ── 焦点着色 ──
   * AdditiveBlending 下颜色 (0,0,0) 等于"完全不贡献"，
   * 所以把非关联边的颜色涂黑就能让它们彻底消失，
   * 不需要动几何、也不会有零长度段的渲染毛刺。
   *
   * colorsBase 是"全部显示"时的颜色（**必须**在上面那段端点淡出之后取，
   * 否则拿到的是没淡出的原始色，两端会硬切）。
   * 点选是低频操作（只在点击时发生），所以这里重建 buffer 不影响帧率。
   *
   * ⚠ 因为"按关系类型着色"可以在设置面板里切换，所以这个基准 buffer
   *   **必须能重建**（下面 recolor 会重新走一遍 buildColors + fade）。 */
  let colorsBase = colors.slice()
  function rebuildColorsBase() {
    buildColors()
    applyEndpointFade()
    colorsBase = colors.slice()
  }

  /* focusId 的初值**必须**是 undefined 而不是 null。
   * applyFocus 的第一行是"没变化就直接返回"的短路，
   * 若初值取 null，那么启动时的 applyFocus(null) 会被这条短路吃掉 ——
   * 构造函数里 geo.setColors(colors) 写进去的"全部连线"就留在屏幕上，
   * 表现为"初始就有满屏连线"。（这个 bug 被 verify-focus-links.mjs 抓到过。） */
  let focusId

  /* 可见性过滤：切到"只看主星系"时，跨星团边必须消失 ——
   * 否则会看到一堆紫线连向空无一物的 -z 方向，比不画还糟。
   * 'overview' 两者都可见；'galaxy' 只留主星系内部的边；
   * 'cluster' 只留星团内部的边（跨星团边也隐藏：另一端不在画面里）。 */
  let showGalaxy = true
  let showCluster = true

  /** 一条边在当前取景下是否可见 */
  function visibleEdge(i) {
    const l = usable[i]
    if (l.cross) return showGalaxy && showCluster
    // 非跨星团边：看它属于哪一侧。判定用 id 前缀不严谨，
    // 但 graph 在装配时已把 cluster 标记写进 link，这里直接用。
    return l.clusterSide === 'cluster' ? showCluster : showGalaxy
  }

  function applyFocus(id) {
    if (id === focusId && id !== undefined) { /* fallthrough：可见性可能已变 */ }
    focusId = id

    const out = new Float32Array(colorsBase.length)
    const incidentEdges = id ? incident.get(id) : null

    if (LINKS.mode === 'all') {
      // "始终显示"模式：所有可见边都在，只把焦点边提亮
      for (let i = 0; i < count; i++) {
        if (!visibleEdge(i)) continue
        out.set(colorsBase.subarray(i * VERTS * 3, (i + 1) * VERTS * 3), i * VERTS * 3)
      }
    }
    // mode === 'focus'（默认）→ 非关联边保持全黑，不画
    // mode === 'off'              → 同上，什么都不画

    if (incidentEdges) {
      const boost = LINKS.focusBoost
      for (const i of incidentEdges) {
        if (!visibleEdge(i)) continue
        for (let k = 0; k < VERTS; k++) {
          const o = i * VERTS * 3 + k * 3
          out[o] = colorsBase[o] * boost
          out[o + 1] = colorsBase[o + 1] * boost
          out[o + 2] = colorsBase[o + 2] * boost
        }
      }
    }

    geo.setColors(out)
  }

  // 初始状态：没有任何选中 → 不画任何连线（"只有位置关系"）
  applyFocus(null)

  return {
    group,
    update(dt, nodePos) {
      for (let i = 0; i < count; i++) {
        const l = usable[i]
        const a = nodePos.get(l.source)
        const b = nodePos.get(l.target)
        if (!a || !b) continue
        sampleCurve(i, a.x, a.y, a.z, b.x, b.y, b.z, l.cross)
        positions.set(curves[i], i * VERTS * 3)
      }
      instanceBuf.needsUpdate = true
    },
    setResolution(w, h) { mat.resolution.set(w, h) },
    /**
     * 选中/取消选中某个节点 → 只显示与它直接关联的边。
     * 传 null 表示取消选中：所有连线消失，回到"只有位置关系"的初始态。
     */
    highlight(nodeId) {
      applyFocus(nodeId || null)
    },
    /**
     * 取景切换时更新边的可见性。
     * @param {string} view        'overview' | 'galaxy' | 'cluster'
     * @param {boolean} gal        主星系是否可见
     * @param {boolean} cl         星团是否可见
     */
    setView(view, gal, cl) {
      showGalaxy = gal !== false
      showCluster = cl !== false
      // 强制重算：把 focusId 置 undefined 绕过"没变化就返回"的短路
      const prev = focusId
      focusId = undefined
      applyFocus(prev === undefined ? null : prev)
    },
    /** 星团整体开关（与 setView 独立，用于设置面板里的单选框） */
    setClusterVisible(on) {
      showCluster = !!on
      if (showGalaxy && !showCluster) {
        // 星团关掉但盘还在：跨星团边与星团内部边都要隐藏
      }
      const prev = focusId
      focusId = undefined
      applyFocus(prev === undefined ? null : prev)
    },

    /* ── 悬停拾取 ──
     *
     * 目的：鼠标移到一条**连线**上时，显示这句话的理由
     * （"线性化猜想蕴含雅可比猜想"）。
     *
     * 为什么值得做：整个项目的数据里，每条边都带一句人写的理由（100%），
     * 但画面上只有一根彩色弧线 —— 用户看不到"为什么这两个公式相连"。
     * 而这恰恰是这个项目最核心的信息（"他们之间有联系"）。
     * 面板里虽然也列了理由，但那要点开节点才看得到，
     * 而"盯着某根线想知道它是什么"是很自然的动作。
     *
     * 实现方式：**线段距离**判定，不用 GPU 拾取。
     * 每条边是 48 个顶点的折线（curveSteps=24 → 24 段），
     * 逐段算"点到线段的最短距离"。只算**可见**的边，
     * 所以没选中节点时（此时所有边都不可见）不会误命中。
     *
     * @param {(x:number,y:number)=>boolean} project   世界坐标 → 屏幕坐标的投影函数
     * @param {number} px,py      鼠标屏幕坐标
     * @param {number} maxDist    命中阈值（像素）
     * @returns {number} 边的下标，没命中返回 -1
     */
    pickEdge(project, px, py, maxDist = 7) {
      let best = -1
      let bestD = maxDist * maxDist
      /* 焦点模式下只有**关联边**是亮的，其余边被涂成黑色（AdditiveBlending
       * 下黑色 = 不贡献像素）。所以必须把它们排除，否则鼠标划过一片
       * 看起来空白的区域也会弹出提示 —— 而那里根本没有线。
       *
       * ⚠ incident 存的是**数组**不是 Set（见上面装配那段），
       *   所以这里用 includes / 遍历，不能写 .has(i)。 */
      const focusSet = (LINKS.mode !== 'all' && focusId) ? (incident.get(focusId) || []) : null
      for (let i = 0; i < count; i++) {
        if (!visibleEdge(i)) continue
        if (focusSet && !focusSet.includes(i)) continue
        const base = i * VERTS * 3
        let prevX = 0, prevY = 0, has = false
        for (let k = 0; k < VERTS; k++) {
          const o = base + k * 3
          const s = project(positions[o], positions[o + 1], positions[o + 2])
          if (!s) { has = false; continue }
          if (has) {
            const d = distToSegmentSq(px, py, prevX, prevY, s.x, s.y)
            if (d < bestD) { bestD = d; best = i }
          }
          prevX = s.x; prevY = s.y; has = true
        }
      }
      return best
    },

    /** 边的下标 → 那条边的数据（含 label / type / weight / 两端 id） */
    edgeAt(i) {
      return (i >= 0 && i < count) ? usable[i] : null
    },

    /** 边的下标 → 曲线**采样中点**的世界坐标（验证脚本瞄准悬停点用）。
     *
     * ⚠ 必须取采样点，不能用两端点的直线中点：曲线被朝盘心拉过
     *   （BUNDLE = 0.30），弧线中点跟直线中点能差出几十像素，
     *   拿直线中点去瞄会稳定地落在曲线外面，测试就永远是假失败。 */
    edgeMidpoint(i) {
      if (!(i >= 0 && i < count)) return null
      const k = VERTS >> 1
      const o = i * VERTS * 3 + k * 3
      return { x: positions[o], y: positions[o + 1], z: positions[o + 2] }
    },

    /**
     * 重新着色（切换"按关系类型着色"时调用）。
     *
     * 为什么需要：颜色在构造时一次性写进 `colors` 缓冲，
     * 之后只靠 applyFocus 在它上面做增删。切了着色模式就必须
     * **重算基准色**，否则画面纹丝不动（开关看起来没生效）。
     *
     * 代价很小：1620 条边 × 48 个顶点 = 约 7.8 万个浮点三元组，
     * 纯 CPU 几毫秒，不碰几何、不重建材质。
     * 不这样做的话就得重建整个 LineSegments2 —— 那要重新上传
     * 几十万个顶点，代价高两个数量级。
     */
    recolor() {
      rebuildColorsBase()
      // 强制重算当前焦点态：把 focusId 置 undefined 绕过"没变化就返回"的短路
      const prev = focusId
      focusId = undefined
      applyFocus(prev === undefined ? null : prev)
    },
    /** 该节点的直接关联数（UI 显示用） */
    degreeOf(nodeId) {
      return (incident.get(nodeId) || []).length
    },
    /** 与该节点关联的**边下标**列表（验证脚本瞄一条边来测悬停用）。
     *  只返回当前取景下真的可见的那些 —— 否则脚本会瞄准一条屏幕外的边。 */
    incidentEdgesOf(nodeId) {
      return (incident.get(nodeId) || []).filter((i) => visibleEdge(i))
    },
    /** 与该节点直接关联的邻居 id 列表（验证脚本用） */
    neighboursOf(nodeId) {
      const edges = incident.get(nodeId) || []
      return edges.map((i) => {
        const l = usable[i]
        return l.source === nodeId ? l.target : l.source
      })
    },
    /** 当前是否正在显示某个节点的关联（null = 什么都没显示） */
    get focus() { return focusId === undefined ? null : focusId },
    /** 跨星团边的条数（验证脚本用） */
    get crossCount() { return usable.filter((l) => l.cross).length },
    /** 便捷开关：focus（默认，点选才显示）/ all（始终显示）/ off（不画） */
    setMode(mode) {
      LINKS.mode = mode
      // 这里**不能**写 focusId = null 再 applyFocus(prev)：
      // 若当前本来就没选中（prev === null），applyFocus 会被
      // "没变化就返回"的短路吃掉，切到 'all' 时画面不会重绘。
      // 置成 undefined 强制下一次 applyFocus 一定重算。
      const prev = focusId
      focusId = undefined
      applyFocus(prev === undefined ? null : prev)
    },
  }
}
