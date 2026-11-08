/**
 * ═══════════════════════════════════════════════════════════════
 *  主场景：相机 / 公式精灵 / 运动 / 拾取
 * ═══════════════════════════════════════════════════════════════
 *
 *  重要度同时驱动三件事（这就是"越中心越重要"的完整表达）：
 *    ① 半径  —— 越重要越贴近球心
 *    ② 字号  —— 越重要越大
 *    ③ 亮度  —— 越重要越亮（配合 bloom 自然晕开）
 *
 *  渲染器配置借鉴 poem-cloud 的实测结论：
 *    logarithmicDepthBuffer（近处公式与远处星云同框，避免 z-fighting）
 *    ACESFilmicToneMapping + outputColorSpace  （防止高亮公式过曝泛白）
 *    setPixelRatio(min(dpr, 2))               （高 DPI 屏性能与画质的平衡）
 */

import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'

import { CAMERA, GLYPH, MOTION, BLOOM, INTERACTION, LAYOUT, SHAPES, GRAVITY, LINKS, CLUSTER, RESEARCHERS, VIEWS } from './config.js'
import { settings } from './settings.js'
import { createNebula } from './nebula.js'
import { createLinks } from './links.js'
import { getGlowTexture, glowColor } from './glow.js'
import { createFormulaCard } from './formulaCard.js'
import { applyColor } from './graph.js'
import { neighbourhood } from '../../../src/graphQuery.js'

export function createScene(canvas, graph, ui) {
  /* 修正 4：选中公式的 2D 浮卡（KaTeX 矢量排版，不受 3D 透视影响）。
     在这里创建而不是模块级，保证同一页面只有一个实例（热更新/重建时不会累积）。 */
  const formulaCard = createFormulaCard()

  /* ───────────── 渲染器 ───────────── */
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance',
    logarithmicDepthBuffer: true,
  })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setClearColor(0x03050d, 1)
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.06

  const scene = new THREE.Scene()

  const camera = new THREE.PerspectiveCamera(
    CAMERA.fov,
    window.innerWidth / window.innerHeight,
    CAMERA.near,
    CAMERA.far,
  )

  /* 相机取景：由盘面实际大小**解析求出**，而不是写死坐标 ──
   *
   * 写死坐标的问题是它与 LAYOUT.radiusOuter 脱钩：
   * 盘半径一改（比如为了缓解拥挤而放大盘面），机位就必须重新手调，
   * 否则不是"画面偏空、公式小得看不清"，就是"盘超出画面"。
   * 实测就踩过这个坑：盘半径 365 时按 585 的取景距离摆机位，
   * 结果相机距离 742，公式中位只有 3.3px 高。
   *
   * 盘面是扁的，从仰角 φ 看下去投影成椭圆：横半轴 R，纵半轴 R·sinφ。
   * 16:9 视口下**竖直方向更吃紧**，所以取景距离由纵半轴决定：
   *     dist = R·sinφ / tan(vFov/2) × margin
   *
   * 注意 createScene() 跑在 layoutGraph() **之前**，那时节点还没有 pos。
   * 所以这里先按配置的 radiusOuter 摆一个合理机位，
   * 等布局算完由 main.js 调 fitCamera() 用真实盘半径校正。 */

  /* ── 聚焦状态（必须在 applyCameraFit 第一次被调用**之前**声明）──
   * applyCameraFit() 要清掉聚焦动画，而它在下面几行就会被调用；
   * 若把 let 声明留在后面的"相机聚焦"小节里，那里还在 TDZ，
   * 调用时会直接 ReferenceError。 */
  const focusState = {
    mode: null,                  // null | 'node'（聚焦某公式）| 'home'（回位中）
    node: null,
    converged: false,            // 聚焦是否已到位（到位后转入"只跟随"模式）
    t: 0,                        // 当前动画已播放时长（回位超时兜底用）
    lastPos: new THREE.Vector3(),   // 上一帧该公式的世界坐标（算位移量用）
    // Spring physics for smooth camera transitions
    velocity: new THREE.Vector3(),
    targetVelocity: new THREE.Vector3(),
  }

  /** 进入聚焦前的机位 —— 退出聚焦时回到这里。由 applyCameraFit 写入。 */
  let homeCam = null

  const tilt = Math.max(0.05, Math.min(1.45, CAMERA.startTilt))

  function cameraDistanceFor(radius) {
    const usable = radius * Math.sin(tilt)
    return (usable / Math.tan(camera.fov * Math.PI / 360)) * CAMERA.fitMargin
  }

  function applyCameraFit(radius, center = ZERO3) {
    const d = cameraDistanceFor(radius)
    camera.position.set(
      center.x,
      center.y + d * Math.sin(tilt),
      center.z + d * Math.cos(tilt),
    )
    camera.lookAt(center.x, center.y, center.z)
    controls.target.set(center.x, center.y, center.z)
    controls.update()

    // 「初始机位」在这里定义，也就是"退出聚焦后回到哪里"。
    // 放在 applyCameraFit 里是因为它同时被启动流程和形态切换（rebuildLayout）
    // 调用 —— 换了形态，回位目标自然也该跟着换成新机位。
    homeCam = {
      pos: camera.position.clone(),
      target: controls.target.clone(),
    }
    // 形态切换/重新取景会让正在播放的聚焦动画失效（目标位置已经变了），
    // 直接把它掐掉，否则相机会被拉向一个不再存在的坐标。
    focusState.mode = null
    focusState.node = null
    focusState.converged = false
    focusState.t = 0

    return d
  }

  /* 当前取景（全景 / 主星系 / 星团）。'galaxy' 时星团隐藏，
   * 'cluster' 时盘隐藏 —— 见下面的 setView()。 */
  let currentView = 'overview'
  const ZERO3 = new THREE.Vector3(0, 0, 0)
  const CLUSTER_CENTER3 = new THREE.Vector3(...CLUSTER.center)
  const RESEARCHER_CENTER3 = new THREE.Vector3(...RESEARCHERS.center)

  /**
   * 算出"要框住某组节点，相机该瞄哪里、该退多远"。
   *
   * ── 为什么不能像原来那样只传一个半径 ──
   *
   * 原来 `fitCamera(diskR)` 的做法是：把盘半径 R 折算成纵向半高
   * `R·sin(tilt)`，再由它反推相机距离。这对**单个薄盘**是对的
   * （盘倾斜 40° 看过去，纵向确实只占 R·sin t）。
   *
   * 但整幅画面现在由**两个分离的结构**组成：盘在原点，星团在 -z 方向。
   * 沿 -z 的位移在屏幕上恰好变成**向上**的位移（屏幕上方 ≈ -z 方向），
   * 所以整体在屏幕上的包围盒**不是**以原点为中心，纵向半高也**不是**
   * `R·sin t`。继续套老公式的后果是：星团被顶出画面上缘，或者相机
   * 退得太远让盘小得读不清。
   *
   * ── 做法：先投影到屏幕坐标，再精确反解 ──
   *
   * 本项目的相机永远在 `aim + d·(0, sin t, cos t)`，朝 `aim` 看，
   * 所以屏幕基向量是现成的：
   *   屏幕右 = (1, 0, 0)
   *   屏幕上 = (0, cos t, -sin t)
   * 于是任意点 p 相对瞄准点的屏幕偏移就是（正交近似，与 v1 同）：
   *   sx = p.x - aim.x
   *   sy = (p.y - aim.y)·cos t − (p.z - aim.z)·sin t
   *
   * 先取所有可见节点的屏幕包围盒，再让瞄准点去"对齐"这个盒子的中心，
   * 最后把所需的纵向半高换算成 `cameraDistanceFor` 认的那个半径
   * （`radiusEff = 纵向半高 / sin t`，正好是老公式的逆运算）。
   *
   * ⚠ 这个写法对**只看主星系**会退化回 v1 的行为：
   *   盘节点 sy 的极值就是 ±R·sin t，盒心在原点，于是
   *   radiusEff = R·sin t / sin t = R —— 与 v1 逐位相同，取景不变。
   *
   * @param {Array} nodes 参与取景的节点（必须已有 basePos）
   * @param {THREE.Vector3} [base] 瞄准点的起点（用于给分离结构定位）
   */
  function fitProjected(nodes, base = ZERO3) {
    const ct = Math.cos(tilt)
    const st = Math.sin(tilt)

    let sxMin = Infinity, sxMax = -Infinity
    let syMin = Infinity, syMax = -Infinity
    let n = 0
    for (const node of nodes) {
      const p = node.basePos || node.pos
      if (!p) continue
      const sx = p.x
      const sy = p.y * ct - p.z * st
      if (sx < sxMin) sxMin = sx
      if (sx > sxMax) sxMax = sx
      if (sy < syMin) syMin = sy
      if (sy > syMax) syMax = sy
      n++
    }
    if (!n) return { radius: LAYOUT.radiusOuter, center: base.clone() }

    const cx = (sxMin + sxMax) * 0.5
    const cy = (syMin + syMax) * 0.5
    const halfW = (sxMax - sxMin) * 0.5
    const halfH = (syMax - syMin) * 0.5

    /* 瞄准点：先取基准点，再把它"推"到屏幕盒心。
     *
     * 关键细节 —— 一个屏幕位置对应一条视线，不能直接由 (cx, cy) 反解
     * 出唯一的 3D 点。所以从基准点出发，沿屏幕右/上方向各补一个偏移量：
     * 这样得到的点**确实**投影到盒心（因为屏幕基向量是正交归一的），
     * 同时又留在内容附近（透视不会算歪）。 */
    const center = base.clone()
    const baseSy = center.y * ct - center.z * st
    center.x += cx - center.x
    // 沿屏幕上方向补 (cy − 当前 sy)。屏幕上向量是 (0, ct, −st)，
    // 而它作用在点上的效果恰好就是 sy 的增量，所以直接乘即可。
    const d = cy - baseSy
    center.y += d * ct
    center.z += d * (-st)

    // 纵向是主要约束；宽屏时横向更宽松，用 aspect 折回去
    const need = Math.max(halfH, halfW / Math.max(0.2, camera.aspect))
    return { radius: need / Math.max(1e-3, st), center }
  }

  /** 按取景挑出参与框选的节点，并交给 fitProjected */
  function viewFrame(v, showGalaxy, showCluster, showResearchers = false) {
    const gal = []
    const cl = []
    const rs = []
    for (const node of graph.nodes) {
      if (node.cluster) cl.push(node)
      else if (node.researcher) rs.push(node)
      else gal.push(node)
    }
    let list = []
    // 基准点：内容的重心。用它当起点，瞄准点就不会偏到内容之外。
    const base = new THREE.Vector3()
    if (showGalaxy) list = list.concat(gal)
    if (showCluster) list = list.concat(cl)
    if (showResearchers) list = list.concat(rs)
    if (!list.length) return { radius: LAYOUT.radiusOuter, center: base }

    for (const node of list) {
      const p = node.basePos || node.pos
      base.x += p.x; base.y += p.y; base.z += p.z
    }
    base.multiplyScalar(1 / list.length)
    // 星团是一个明确的球，重心会把它往里拖；用球心当基准更稳
    if (!showGalaxy && showCluster && !showResearchers) base.copy(CLUSTER_CENTER3)
    if (!showGalaxy && !showCluster && showResearchers) base.copy(RESEARCHER_CENTER3)

    return fitProjected(list, base)
  }

  const controls = new OrbitControls(camera, canvas)
  controls.enableDamping = true
  controls.dampingFactor = CAMERA.damping
  controls.rotateSpeed = 0.55
  controls.zoomSpeed = 0.85
  controls.enablePan = false
  controls.minDistance = CAMERA.minDistance
  controls.maxDistance = CAMERA.maxDistance
  // 相机环绕是**设置项**（默认关），不是 config 常量了
  let autoRotateWanted = settings.state.display.autoRotate
  controls.autoRotate = autoRotateWanted
  controls.autoRotateSpeed = CAMERA.autoRotateSpeed * 20

  // 摆初始机位（此处 controls 已就绪，applyCameraFit 里会用到它）
  applyCameraFit(LAYOUT.radiusOuter)

  /* ───────────── 背景星云 ───────────── */
  const nebula = createNebula()
  scene.add(nebula.group)

  /* ───────────── 关联连线 ───────────── */
  const links = createLinks(graph)
  scene.add(links.group)

  /* ───────────── 公式节点 ───────────── */
  const nodeGroup = new THREE.Group()
  nodeGroup.name = 'nodes'
  scene.add(nodeGroup)

  /* ───────────── 猜想星团 ─────────────
   *
   * 星团必须放在**独立的组**里，不能和主星系共用 nodeGroup。理由有二：
   *
   *  ① 转轴不同。主星系绕世界 Y 轴刚性平转；星团绕一根倾斜的轴翻滚
   *     （CLUSTER.spinAxis）。若共用一个组，就只能有一个 rotation，
   *     两者必须二选一。
   *  ② 位置语义不同。主星系节点的坐标是**相对原点**的盘面极坐标，
   *     而星团节点在布局时算的是**相对球心**的偏移。把组放在
   *     CLUSTER.center，子节点就只要存相对坐标，于是绕球心自转
   *     天然正确（绕组原点转 = 绕球心转）。
   *
   * ⚠ 组的 position 设成 CLUSTER.center，所以下面所有子节点的
   *   position 都要**减去 center**。worldPos 仍然是世界坐标
   *   （通过 matrixWorld 变换），所以连线、拾取、聚焦都不用改。 */
  const clusterGroup = new THREE.Group()
  clusterGroup.name = 'cluster'
  clusterGroup.position.set(...CLUSTER.center)
  scene.add(clusterGroup)

  /* ───────────── 研究者星团 ─────────────
   *
   * 与猜想星团同构：放在独立组里，绕 RESEARCHERS.spinAxis 翻滚。
   * 研究者不是定理也不是猜想，而是知识图谱上的活动主体，
   * 所以用第三颗伴星团表达，位置放在主星系左侧。 */
  const researcherGroup = new THREE.Group()
  researcherGroup.name = 'researchers'
  researcherGroup.position.set(...RESEARCHERS.center)
  scene.add(researcherGroup)

  const worldPos = new Map()   // id → {x,y,z} 每帧更新，供连线使用
  const sprites = []
  const glowSprites = []
  const markers = []           // 猜想的状态色点
  // 全公式共用一张光晕贴图（纯白），颜色由各自材质的 color 决定
  const glowTex = getGlowTexture({ falloff: GLYPH.glow.falloff })

  // 自转是否暂停。聚焦某个公式时暂停，否则相机会追着一个一直在动的目标。
  // 打开详情面板时也暂停，方便阅读。
  let spinPaused = false
  let spinAngle = 0
  let clusterAngle = 0
  let researcherAngle = 0

  /* 星团的整体柔光：加法混合的**朝向相机的圆面**，暗示球状星团那种
   * "糊成一团的光斑"。用**一个** mesh 换整体观感，比给 59 个公式各加
   * 一层光晕便宜得多 —— 而且真要给每个公式加球面辉光，视觉上反而会
   * 失去"团"的整体感。
   *
   * ⚠⚠ 这里原来是一个 SphereGeometry(hr, 24, 16) + BackSide。
   *    那是错的，而且看截图才发现：它渲染出来是一个**边缘清晰、内部
   *    几乎均匀的灰色圆盘**，像一轮月亮或一块盘子，完全不是"柔光"。
   *
   *    原因是**几何上的**：glowTex 是一张 UV 空间里的径向渐变
   *    （中心亮、r>=1 全透明），它假设贴图铺在一个**正对相机的平面**上。
   *    铺到球面上时：
   *      ① 球面 UV 把整张渐变压缩到一圈很窄的边界带里，球的正面
   *         （朝向相机的大片区域）落在渐变**接近中心**的位置 ——
   *         那里 alpha 几乎是常数 → 内部一片死平；
   *      ② 球的**轮廓**处 UV 骤变，渐变来不及衰减到 0，
   *         于是切出一条硬边 → 那个"盘子的边"。
   *    再叠上 AdditiveBlending（黑=不可见，灰=可见），
   *    那圈硬边就被清清楚楚地画了出来。
   *
   *    改成 PlaneGeometry 之后，贴图和几何假设一致：中心亮、
   *    向边缘平滑衰减到完全透明，没有轮廓线可言。
   *    它每帧朝向相机（跟公式光晕同一套 quaternion 处理）。
   *
   *    另外 falloff 要**单独放宽**：GLYPH.glow.falloff=3.8 是给
   *    "一个小光点"调的，直接用在这么大一片柔光上会衰减太快，
   *    中间亮一团、外面什么都没有。这里用较柔的指数，让光斑真正弥散开。 */
  let clusterHalo = null
  if (CLUSTER.enabled && CLUSTER.haloEnabled) {
    const hr = CLUSTER.radius * CLUSTER.haloScale
    // 单独取一张更"散"的光晕贴图（缓存按 falloff 区分，不会污染公式光晕）
    const haloTex = getGlowTexture({ falloff: CLUSTER.haloFalloff })
    clusterHalo = new THREE.Mesh(
      // 平面尺寸：半径 hr 的圆要装进边长 2hr 的正方形
      new THREE.PlaneGeometry(hr * 2, hr * 2),
      new THREE.MeshBasicMaterial({
        map: haloTex,
        color: new THREE.Color(0.55, 0.62, 0.95),
        transparent: true,
        opacity: CLUSTER.haloOpacity,
        depthWrite: false,
        // 不写深度，但仍要测深度：这样前方的公式依然能挡住它的一部分，
        // 保留"星星嵌在光晕里"的层次感。
        depthTest: true,
        blending: THREE.AdditiveBlending,
        toneMapped: false,
        side: THREE.DoubleSide,
      }),
    )
    clusterHalo.position.set(0, 0, 0)   // 组已放在 center，这里是相对坐标
    clusterHalo.renderOrder = 2         // 早于光点(5)与公式(10)
    clusterHalo.raycast = () => {}
    clusterGroup.add(clusterHalo)
  }

  /* 研究者星团的整体柔光：与猜想星团同一种做法，只是位置与色温分开。 */
  let researcherHalo = null
  if (RESEARCHERS.enabled && RESEARCHERS.haloEnabled) {
    const hr = RESEARCHERS.radius * RESEARCHERS.haloScale
    const haloTex = getGlowTexture({ falloff: RESEARCHERS.haloFalloff })
    researcherHalo = new THREE.Mesh(
      new THREE.PlaneGeometry(hr * 2, hr * 2),
      new THREE.MeshBasicMaterial({
        map: haloTex,
        color: new THREE.Color(0.48, 0.86, 0.82),
        transparent: true,
        opacity: RESEARCHERS.haloOpacity,
        depthWrite: false,
        depthTest: true,
        blending: THREE.AdditiveBlending,
        toneMapped: false,
        side: THREE.DoubleSide,
      }),
    )
    researcherHalo.position.set(0, 0, 0)
    researcherHalo.renderOrder = 2
    researcherHalo.raycast = () => {}
    researcherGroup.add(researcherHalo)
  }

  /**
   * 用烘焙好的贴图创建所有精灵。在 layoutGraph() 之后再调用，
   * 因为尺寸/位置都来自布局阶段算好的结果。
   * @param {Map<string, object>} baked  id → bakeFormulaTexture 的结果
   */
  function buildNodes(baked) {
    for (const n of graph.nodes) {
      const b = baked.get(n.id)
      if (!b) { n.sprite = null; continue }

      // 贴图里字形只占中间那块（四周有 padding 防止辉光被裁），
      // 所以平面的尺寸要按 canvas/字形 的比例放大回去。
      const planeW = n.width * (b.canvasW / b.contentW)
      const planeH = n.height * (b.canvasH / b.contentH)

      const mat = new THREE.MeshBasicMaterial({
        map: b.texture,
        transparent: true,
        depthWrite: false,          // 半透明公式之间不互相写深度
        depthTest: true,
        side: THREE.DoubleSide,
        toneMapped: true,
      })

      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(planeW, planeH), mat)
      // 星团/研究者节点的布局坐标是**世界坐标**（球心 + 偏移），
      // 而它的父组已经在球心上了，所以子节点要存相对坐标。
      const [ccx, ccy, ccz] = CLUSTER.center
      const [rcx, rcy, rcz] = RESEARCHERS.center
      if (n.cluster) mesh.position.set(n.pos.x - ccx, n.pos.y - ccy, n.pos.z - ccz)
      else if (n.researcher) mesh.position.set(n.pos.x - rcx, n.pos.y - rcy, n.pos.z - rcz)
      else mesh.position.set(n.pos.x, n.pos.y, n.pos.z)
      mesh.userData.node = n
      mesh.renderOrder = 10

      // 颜色 × 亮度：越重要越亮（"银河系"观感的关键）。
      // 注意：**不要钳制到 1**，超过 1 的部分会触发 bloom 晕开，
      // 正是"核心星体更耀眼"的来源。
      const c = n.baseColor
      mat.color.setRGB(c.r * n.brightness, c.g * n.brightness, c.b * n.brightness)

      n.sprite = mesh
      n.group = n.cluster ? clusterGroup : (n.researcher ? researcherGroup : nodeGroup)
      n.group.add(mesh)
      sprites.push(mesh)

      // ── 光晕：在公式背后叠一张加法混合的径向渐变 ──
      //
      // 它必须比公式**先画**（renderOrder 更小），否则半透明的光晕会盖在字上、
      // 把笔画糊掉。放在背后才是"字自己在发光"的观感。
      //
      // 尺寸用 planeH（含 padding 的完整平面高）× glow.scale：
      // 以字形高度为基准，光晕才不会被超长公式（如黎曼-罗赫）拉成横条。
      if (GLYPH.glow.enabled && n.glowBase > 0) {
        const gsize = planeH * GLYPH.glow.scale
        const gmat = new THREE.MeshBasicMaterial({
          map: glowTex,
          transparent: true,
          depthWrite: false,
          depthTest: true,
          side: THREE.DoubleSide,
          blending: THREE.AdditiveBlending,   // 加法混合 → 真正的"光"
          toneMapped: false,                  // 不参与 ACES，色相才保得住
        })
        // 初始颜色先按当前强度算一次，之后每帧由 updateAppearance 刷新
        const gc = glowColor(n.baseColor, n.glowBase * GLYPH.glow.strength, GLYPH.glow)
        gmat.color.setRGB(gc.r, gc.g, gc.b)

        const glow = new THREE.Mesh(new THREE.PlaneGeometry(gsize, gsize), gmat)
        glow.position.copy(mesh.position)
        glow.userData.node = n
        glow.userData.isGlow = true
        glow.renderOrder = 5     // 早于公式的 10 → 画在背后
        // 拾取时忽略光晕：它是虚的，点它不算点到公式
        glow.raycast = () => {}

        n.glow = glow
        n.group.add(glow)
        glowSprites.push(glow)
      }

      /* ── 状态色点：猜想星团专有（研究者节点不挂色点） ──
       *
       * 为什么必须有这个东西：一条猜想**是不是还悬着**，光看公式本身
       * 完全看不出来 —— "H^{2k}(X,Q) ∩ H^{k,k} = span[Z]" 这个陈述
       * 与一条已证明的定理在视觉上没有任何区别。色点把"认识论状态"
       * 这个维度变得可见，这也是星团值得单独存在的核心理由。
       *
       * 尺寸基准用 planeH（平面高度）而不是宽度：否则黎曼猜想那种
       * 超长公式会配一个巨大的点，反而盖住公式本身。
       * 位置在公式**左边缘外侧** markerGap 处，所以用 planeW。 */
      if (n.cluster && CLUSTER.markerEnabled) {
        const ms = planeH * CLUSTER.markerSize
        const mmat = new THREE.MeshBasicMaterial({
          color: new THREE.Color(n.markerColor.r, n.markerColor.g, n.markerColor.b),
          transparent: true,
          depthWrite: false,
          depthTest: true,
          blending: THREE.AdditiveBlending,   // 与光点同一套"发光"语言
          toneMapped: false,
          side: THREE.DoubleSide,
        })
        const marker = new THREE.Mesh(new THREE.CircleGeometry(ms * 0.5, 12), mmat)
        marker.position.set(
          mesh.position.x - planeW * 0.5 - planeH * CLUSTER.markerGap - ms * 0.5,
          mesh.position.y,
          mesh.position.z,
        )
        marker.userData.node = n
        marker.userData.isMarker = true
        marker.renderOrder = 8   // 光点之后、公式之前
        marker.raycast = () => {}
        n.marker = marker
        n.markerBaseW = planeW
        n.markerBaseH = planeH
        n.group.add(marker)
        markers.push(marker)
      }
    }
    return sprites.length
  }

  /* ───────────── 后处理 ───────────── */
  let composer = null
  let bloomPass = null
  if (BLOOM.enabled) {
    composer = new EffectComposer(renderer)
    composer.addPass(new RenderPass(scene, camera))
    bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      BLOOM.strength * 1.25,      // Enhanced bloom strength
      BLOOM.radius * 1.15,         // Slightly larger radius
      BLOOM.threshold * 0.92,      // Lower threshold for more glow
    )
    composer.addPass(bloomPass)
    composer.addPass(new OutputPass())
  }

  /* ───────────── 相机聚焦 ─────────────
   *
   *  行为：点击一个公式 → 视角中心移到它身上；在右侧面板里跳到另一个公式
   *  → 中心跟着换过去；关掉面板 → 回到最初的机位。
   *
   *  实现要点：
   *
   *  ① **每帧重算目标**，而不是动画开始时算一次就定死。
   *     公式一直在轻微浮动（bob，见 updateMotion），写死的话公式会在
   *     画面中心附近慢慢晃走。所以用"每帧朝理想机位指数逼近"代替
   *     "从 A 线性插值到 B"：飞入动画和后续跟随是同一套机制，不会在
   *     动画结束的瞬间突然开始跟、产生一次可见的跳变。
   *
   *  ② 必须**同时**动 camera.position 与 controls.target（和引力模式同一个理由）：
   *     只动 camera.position 的话相机是绕着原点平移，视角会歪掉。
   *
   *  ③ 面板占了右侧 432px。若把公式摆在视口正中，它正好被面板压住 ——
   *     所以瞄准点往右偏一点，让**公式落在"没被挡住那块"的正中**。
   *
   *  ④ 用户拖拽时先让开，松手后再柔和地回到公式上（不要跟用户的手指抢镜头）。
   */
  const PANEL_WIDTH = 432        // 与 ui.js 里 #panel 的 width 一致
  const PANEL_MAX_VW = 0.92      // 与 #panel 的 max-width:92vw 一致

  /* ── 面板避让：setViewOffset ──
   *
   * 把渲染视口**真实地**缩成一块，让"相机正对的公式"落在
   * **没被面板挡住那块区域的正中**。相机姿态完全不动 ——
   * 拖拽、缩放、引力全都照旧以公式为轨道中心。
   *
   * ── 偏移量的推导（我第一版在这里算错过，留档备查）──
   *
   * setViewOffset 的语义：全画幅的**子矩形** (ox, 0, vw, h) 会被拉伸铺满
   * 整个画布。于是全画幅坐标 X 处的点，落在画布 x = (X - ox)·w/vw。
   * 相机正对的点在全画幅正中 X = w/2。要求它落在"未被遮挡区 [0, w-pw]
   * 的正中"即 x = (w-pw)/2：
   *
   *     (w/2 - ox)·w/vw = (w-pw)/2,  其中 vw = w-pw
   *  ⇒  ox = w/2 - vw²/(2w) = pw·(1 - pw/(2w))
   *
   * ⚠ 我第一版想当然写成 ox = pw/2（理由是"左右各挖一半保持居中"），
   *   那是**错的**：把 pw=0（面板不存在）代进去会得到 ox=0 ✓，
   *   但那个式子只在 pw=w 的极端情况才对。实测 pw=432/w=1400 时
   *   正确值是 365.3 而不是 216 —— 用 216 的话公式会落在屏幕正中，
   *   而屏幕正中比"可见区正中"偏右，仍然会被面板压掉一截。
   *
   * 几何含义很直观：被渲染的区间是 [ox, ox+vw] ≈ [pw, w]，
   * 也就是**把左侧 pw 宽的内容整块丢掉**（它本来就被相机视锥边缘裁掉），
   * 右侧只丢 pw²/(2w)（1400/432 时约 67px，在面板底下，无损失）。
   *
   * ── 代价，说清楚 ──
   * 总可视宽度变成 w-pw。相比老做法（整屏渲染、只偏构图）确实少看一点，
   * 但换来"拖拽不再把公式甩出去"。对以点选阅读为主的界面，这个交换划算。
   *
   * ── 什么时候不启用 ──
   * 面板不在屏幕上、或窗口太窄（切分会把星系压成一条竖缝）→ 不避让。
   */
  const PANEL_MIN_VIEW = 0.35     // 子视口至少要占全宽的 35%

  /** 面板是否正在遮挡（决定要不要切视口） */
  let panelOpen = false

  /* ── 选中变化的订阅者 ──
   *
   * 存在的唯一理由是 URL 同步：main.js 需要在"选中了某个公式"时
   * 把地址栏改掉。为什么不在 main.js 里包一层 select() 就好了？
   * 因为选中**不只**从 main.js 的入口进来 —— scene 内部的点击拾取
   * （pointerup → select(node.id)）直接调的就是这个闭包，
   * 绕不过外层包装。所以必须有一个从内部发出的通知。
   *
   * 用数组而不是单个回调：将来加"浏览历史""学习路径记录"之类
   * 都可以挂上去，不必再改这里。 */
  const selectionCbs = new Set()
  function onSelection(fn) {
    selectionCbs.add(fn)
    return () => selectionCbs.delete(fn)
  }

  function applyViewOffset() {
    const w = window.innerWidth || 1
    const h = window.innerHeight || 1
    const pw = Math.min(PANEL_WIDTH, w * PANEL_MAX_VW)

    if (INTERACTION.panelAvoid !== 'offset' || !panelOpen || pw <= 0) {
      camera.clearViewOffset()
    } else {
      const vw = w - pw
      if (vw < w * PANEL_MIN_VIEW) {
        camera.clearViewOffset()    // 窗口太窄，避让得不偿失
      } else {
        // ox = pw·(1 - pw/(2w))，推导见上面
        const ox = pw * (1 - pw / (2 * w))
        camera.setViewOffset(w, h, ox, 0, vw, h)
      }
    }
    camera.updateProjectionMatrix()

    /* 拾取用的 NDC 不需要跟着改：setViewOffset 写的是 projectionMatrix，
     * 而 Raycaster.setFromCamera 走的是 projectionMatrixInverse，
     * 自动把偏移算进去了。画布仍铺满整个窗口，所以 setPointer 里
     * 用画布矩形换算出的 NDC 是正确的。这一点被
     * scripts/verify-view-offset.mjs 用"投影后反投影回原世界点"验证过。 */
  }

  /** 面板开合，由 select / deselectFromPanel 调用 */
  function setPanelOpen(on) {
    if (panelOpen === !!on) return
    panelOpen = !!on
    applyViewOffset()
  }

  /** 面板遮挡造成的横向补偿量（世界单位）—— 仅 'aim' 模式使用 */
  function panelShiftAt(dist) {
    if (INTERACTION.panelAvoid !== 'aim') return 0
    const w = window.innerWidth || 1
    const pw = Math.min(PANEL_WIDTH, w * PANEL_MAX_VW)
    // 该距离处的视口半宽；把公式从正中往左挪 frac 个屏宽，
    // 换算成 NDC 就是 -frac，于是瞄准点要往右偏 frac 个半宽。
    const halfW = dist * Math.tan(camera.fov * Math.PI / 360) * camera.aspect
    return (pw / w) * halfW
  }

  const _focusWorld = new THREE.Vector3()
  /* 修正 4：给 2D 浮卡取世界坐标用的临时向量（避免每帧 new） */
  const _cardWorld = new THREE.Vector3()
  const _focusDelta = new THREE.Vector3()
  const _focusDir = new THREE.Vector3()
  const _focusRight = new THREE.Vector3()
  const _focusGoalPos = new THREE.Vector3()
  const _focusGoalTarget = new THREE.Vector3()
  const _UP_Y = new THREE.Vector3(0, 1, 0)

  /** 聚焦到某个公式（点击 / 面板跳转 / 搜索命中都走这里） */
  function focusOn(id) {
    const n = graph.byId.get(id)
    if (!n || !n.sprite) return

    // 冻结自转：否则相机会追着一个一直在动的目标。
    // 用**世界坐标**——公式在会自转的组里，直接拿 n.pos 在星系转过之后就不准了。
    spinPaused = true
    focusState.node = n
    focusState.mode = 'node'
    focusState.converged = false
    focusState.t = 0
  }

  /** 退出聚焦：回到最初的机位（applyCameraFit 记下的那个） */
  function returnHome() {
    if (!homeCam) { focusState.mode = null; focusState.node = null; return }
    focusState.mode = 'home'
    focusState.node = null
    focusState.converged = false
    focusState.t = 0
  }

  /** 取某个公式此刻的**世界**坐标（写进 out） */
  function nodeWorldPos(n, out) {
    return out.set(n.sprite.position.x, n.sprite.position.y, n.sprite.position.z)
      .applyMatrix4(n.group.matrixWorld)
  }

  /**
   * 每帧推进相机动画。
   *
   * 分两段，这是让"飞过去"和"停在那儿"能共存的关键：
   *
   *  ① **飞入段**（converged=false）：target 与 position 都朝理想机位插值。
   *  ② **锁定段**（converged=true）：只把相机**平移**该公式自身的位移量，
   *     不再指定距离和角度。
   *
   * 为什么非要分两段：第一段里 position 被强行拉到固定距离，
   * 于是滚轮缩放每帧都被撤销 —— 用户聚焦后就没法放大看细节了。
   * 第二段让公式稳稳待在画面中心，同时又完全交出旋转/缩放的控制权。
   * 浮动（bob）也正靠这一段跟随，否则公式会在中心附近慢慢晃走。
   *
   * Enhanced with spring physics for smoother transitions.
   */
  function updateFocus(dt) {
    if (!focusState.mode) return

    // Spring physics constants
    const springStiffness = 0.015
    const springDamping = 0.88

    if (focusState.mode === 'node') {
      const n = focusState.node
      if (!n || !n.sprite) { focusState.mode = null; return }

      nodeWorldPos(n, _focusWorld)

      /* ── 锁定段：只跟随公式自身的位移 ── */
      if (focusState.converged) {
        _focusDelta.subVectors(_focusWorld, focusState.lastPos)
        camera.position.add(_focusDelta)
        controls.target.add(_focusDelta)
        focusState.lastPos.copy(_focusWorld)
        return
      }

      // 从当前相机方向靠近，保持观察角度不跳
      _focusDir.subVectors(camera.position, controls.target)
      if (_focusDir.lengthSq() < 1e-6) _focusDir.set(0, 0.2, 1)
      _focusDir.normalize()

      // 公式越大退得越远，保证完整入画
      const dist = INTERACTION.focusDistance * Math.max(1, n.height / 6)

      // 屏幕右方向 = up × 视线方向（视线方向 = -_focusDir）。
      // 瞄准点往右偏 → 公式在画面上就落在偏左的"可见区正中"。
      _focusRight.crossVectors(_UP_Y, _focusDir)
      if (_focusRight.lengthSq() < 1e-6) _focusRight.set(1, 0, 0)
      _focusRight.normalize()

      _focusGoalTarget.copy(_focusWorld).addScaledVector(_focusRight, panelShiftAt(dist))
      _focusGoalPos.copy(_focusGoalTarget).addScaledVector(_focusDir, dist)

      // 拖拽中不抢镜头；松手后指数逼近会自己把画面柔和地拉回来
      if (dragging) return

      // Spring physics for smoother motion
      _focusDelta.subVectors(_focusGoalPos, camera.position)
      focusState.velocity.addScaledVector(_focusDelta, springStiffness)
      focusState.velocity.multiplyScalar(springDamping)
      camera.position.add(focusState.velocity)

      _focusDelta.subVectors(_focusGoalTarget, controls.target)
      focusState.targetVelocity.addScaledVector(_focusDelta, springStiffness)
      focusState.targetVelocity.multiplyScalar(springDamping)
      controls.target.add(focusState.targetVelocity)

      // 到位了就切到锁定段，把镜头控制权还给用户
      if (camera.position.distanceTo(_focusGoalPos) < 0.5 &&
        controls.target.distanceTo(_focusGoalTarget) < 0.5) {
        camera.position.copy(_focusGoalPos)
        controls.target.copy(_focusGoalTarget)
        focusState.converged = true
        focusState.lastPos.copy(_focusWorld)
        focusState.velocity.set(0, 0, 0)
        focusState.targetVelocity.set(0, 0, 0)
      }
      return
    }

    /* ── home：回到初始机位 ── */
    focusState.t += dt

    // 足够接近就吸附到位并结束，不必无限逼近
    const done = camera.position.distanceTo(homeCam.pos) < 0.4 &&
      controls.target.distanceTo(homeCam.target) < 0.4
    // 超时兜底：引力模式下 applyGravity 每帧仍在转相机，指数逼近的收敛速度
    // 可能追不上它，于是 gap 永远差一点点、吸附判定永不成立，
    // focusState.mode 就卡在 'home' —— 那会让相机自转永久失效。
    // 超时后**不强吸**（硬吸会在画面上跳一下），直接放开控制权。
    if (done || focusState.t > 2.5) {
      if (done) {
        camera.position.copy(homeCam.pos)
        controls.target.copy(homeCam.target)
      }
      focusState.mode = null
      focusState.velocity.set(0, 0, 0)
      focusState.targetVelocity.set(0, 0, 0)
      return
    }

    // Spring physics for home transition
    _focusDelta.subVectors(homeCam.pos, camera.position)
    focusState.velocity.addScaledVector(_focusDelta, springStiffness)
    focusState.velocity.multiplyScalar(springDamping)
    camera.position.add(focusState.velocity)

    _focusDelta.subVectors(homeCam.target, controls.target)
    focusState.targetVelocity.addScaledVector(_focusDelta, springStiffness)
    focusState.targetVelocity.multiplyScalar(springDamping)
    controls.target.add(focusState.targetVelocity)
  }

  /* ───────────── 拾取 ───────────── */
  const raycaster = new THREE.Raycaster()
  raycaster.params.Mesh = { threshold: INTERACTION.raycasterThreshold }
  const pointer = new THREE.Vector2()
  let hovered = null
  let selected = null

  /* ── 焦点+上下文：选中时的"图跳数"表 ──
   *
   * nodeId → 从当前选中节点出发的跳数（0 = 自己）。
   * 在 select() 里算**一次**，而不是每帧 —— BFS 走 464 节点 / 1620 边
   * 大约零点几毫秒，但每帧算一次就是每秒 30 万次无用遍历。
   *
   * 为什么用图跳数而不是空间距离：空间位置在这个项目里表达的是
   * **重要度**（越靠盘心越基础），与"离当前这条有多相关"是两件事。
   * 盘心的一个核心定理离选中的边缘公式很远，却可能直接相连。
   * 用空间距离做高亮会把"重要的"和"相关的"混为一谈。
   *
   * 表为空 = 没有选中 → 不压暗任何东西（回到原观感）。 */
  let focusHops = null
  let proofContextFocusId = null

  function recomputeFocusHops() {
    if (!GLYPH.focusContext || !selected) {
      focusHops = null
      return
    }
    // 半径给 8：图的直径实测是 7（见 verify-graph-query.mjs），
    // 所以 8 跳足以覆盖所有节点 —— 更远的本来也就不该出现在表里。
    focusHops = neighbourhood(graph, selected, 8)
  }

  let dragging = false
  let moved = 0
  let lastX = 0, lastY = 0

  /* 当前悬停的**连线**下标（-1 = 没有）。
   *
   * 为什么要单独记一个状态：光标形状只在"变了"的时候才写 DOM，
   * 每次 pointermove 都写 canvas.style.cursor 会强制样式重算，
   * 而 pointermove 每帧能触发好几次。节点用 hovered 判，
   * 边就用这个。 */
  let hoveredEdge = -1

  function setPointer(e) {
    const r = renderer.domElement.getBoundingClientRect()
    pointer.x = ((e.clientX - r.left) / r.width) * 2 - 1
    pointer.y = -((e.clientY - r.top) / r.height) * 2 + 1
  }

  /* 世界坐标 → 屏幕坐标（CSS 像素，与鼠标事件同一坐标系）。
   *
   * 连线拾取必须在**屏幕空间**做，不能在三维里算距离：
   * 相机一直在自转，同一条线在屏幕上的粗细随距离变化很大，
   * 而用户判断"鼠标是不是在这根线上"用的是眼睛看到的那几个像素。
   *
   * ⚠ 坐标系必须和 setPointer 完全一致：两者都以 canvas 的
   *   getBoundingClientRect() 左上角为原点。画布不满屏（或页面滚动）时
   *   rect.left/top 不为 0，直接用 clientX 会让拾取整体偏移。
   *
   * ⚠ rect 必须在**每次拾取开始时**刷新一次（beginScreenProjection），
   *   不能每次 projectToScreen 都查：这个函数每条边要调 48 次，
   *   选中一个高度数的节点就是几万次布局查询，悬停会直接卡死。
   *   但也不能只在 pointermove 里存：探针（验证脚本）没有鼠标事件，
   *   那样算出来的永远是初值 (0,0)。
   *
   * 返回 null 表示该点在相机背后（w<=0），此时不能用它算距离 ——
   * 否则会把背后的点投影到屏幕的镜像位置，产生"线在你以为的地方"的假命中。
   * 裁剪空间 z 超出 [-1,1] 的点（太近/太远）同样丢弃。 */
  const _projV = new THREE.Vector3()
  const _projRect = { left: 0, top: 0, width: 1, height: 1 }
  function beginScreenProjection() {
    const r = renderer.domElement.getBoundingClientRect()
    _projRect.left = r.left
    _projRect.top = r.top
    _projRect.width = r.width || 1
    _projRect.height = r.height || 1
  }
  function projectToScreen(x, y, z) {
    _projV.set(x, y, z).applyMatrix4(camera.matrixWorldInverse)
    const w = -_projV.z                      // 相机朝向 -z，所以前方 w>0
    if (w <= 1e-6) return null
    _projV.applyMatrix4(camera.projectionMatrix)
    return {
      x: (_projV.x * 0.5 + 0.5) * _projRect.width + _projRect.left,
      y: (-_projV.y * 0.5 + 0.5) * _projRect.height + _projRect.top,
    }
  }

  function pick() {
    if (!sprites.length) return null
    raycaster.setFromCamera(pointer, camera)
    const hits = raycaster.intersectObjects(sprites, false)
    if (!hits.length) return null

    // 关键：平面有一大片是透明留白，射线打到留白不算点中公式。
    // 如果所有命中都落在留白上，必须返回 null——
    // 否则点空白处也会弹出面板（而且总会命中某个大平面的透明区）。
    for (const h of hits) {
      if (hitIsOpaque(h)) return h.object.userData.node
    }
    return null
  }

  /**
   * 判断射线在贴图上的落点是否是实心字形（而非透明留白）。
   * 用离屏 canvas 读回像素，代价很低且只在少数候选上做。
   */
  const probe = document.createElement('canvas')
  probe.width = probe.height = 1
  const probeCtx = probe.getContext('2d', { willReadFrequently: true })
  function hitIsOpaque(hit) {
    const n = hit.object.userData.node
    if (!n || !hit.uv) return true
    const tex = hit.object.material.map
    const src = tex && tex.image
    if (!src) return true

    try {
      const px = Math.min(src.width - 1, Math.max(0, Math.floor(hit.uv.x * src.width)))
      const py = Math.min(src.height - 1, Math.max(0, Math.floor((1 - hit.uv.y) * src.height)))
      probeCtx.clearRect(0, 0, 1, 1)
      probeCtx.drawImage(src, px, py, 1, 1, 0, 0, 1, 1)
      return probeCtx.getImageData(0, 0, 1, 1).data[3] > 24
    } catch {
      return true   // 读不到就当作命中，宁可宽容
    }
  }

  canvas.addEventListener('pointerdown', (e) => {
    dragging = true
    moved = 0
    lastX = e.clientX
    lastY = e.clientY
    controls.autoRotate = false        // 拖拽时暂停自转，松手恢复
  })

  canvas.addEventListener('pointermove', (e) => {
    if (dragging) {
      moved += Math.abs(e.clientX - lastX) + Math.abs(e.clientY - lastY)
      lastX = e.clientX
      lastY = e.clientY
    }

    setPointer(e)
    const node = pick()

    if (node !== hovered) {
      hovered = node
      // 节点优先：停在公式上时鼠标变手型。
      // 没停在公式上但在连线上时也用 pointer —— 两者都可点/可读，
      // 给同样的反馈比"必须精确分辨"更好用。
      canvas.style.cursor = node ? 'pointer' : 'grab'
    }
    if (node) {
      hoveredEdge = -1
      ui.showTip(node, e.clientX, e.clientY)
    } else {
      /* 没停在公式上 → 试试是不是停在某根**连线**上。
       *
       * 为什么放在节点之后、而不是并行判断：线是从公式身上长出来的，
       * 公式端点附近线和贴图会重叠，此时用户想的一定是那个公式，
       * 不是那根线。所以节点命中优先级更高。
       *
       * 只在"有边可见"时才做这次拾取：没选中任何节点时所有边都是黑的
       * （applyFocus(null) 把颜色压成 0），此时 pickEdge 也返回 -1，
       * 但省掉整趟循环 —— 464 个节点、1620 条边、每条 48 个点，
       * 这个循环不该在鼠标随便一晃时就跑。
       */
      beginScreenProjection()
      const edge = selected ? links.pickEdge(projectToScreen, e.clientX, e.clientY) : -1
      if (edge !== hoveredEdge) {
        hoveredEdge = edge
        canvas.style.cursor = edge >= 0 ? 'help' : (node ? 'pointer' : 'grab')
      }
      if (edge >= 0) {
        const ed = links.edgeAt(edge)
        if (ed) ui.showEdgeTip(ed, e.clientX, e.clientY)
        else ui.hideTip()
      } else {
        ui.hideTip()
      }
    }
  })

  canvas.addEventListener('pointerup', (e) => {
    const wasDrag = moved >= 8          // 8px 内视为点击，与 poem-cloud 的阈值一致
    dragging = false
    // 松手后 autoRotate 的恢复统一交给 loop() 裁决（它还要看聚焦状态）
    if (wasDrag) return

    setPointer(e)
    const node = pick()
    if (node) {
      // ★ 点中一个公式 → 视角中心移到它身上，并浮现它与**直接关联**公式
      //   之间的弧线。没点选时这些线是不画的（见 links.js 的 applyFocus），
      //   所以初始画面只有"位置关系"，没有连线。
      select(node.id)
    } else {
      select(null)             // 点空白 → 取消选中，相机回位，连线全部收起
    }
  })

  canvas.addEventListener('pointerleave', () => {
    dragging = false
    hovered = null
    hoveredEdge = -1
    ui.hideTip()
  })

  // 没有单独的 dblclick 处理：单击就会聚焦，双击不过是"同一处连点两次"，
  // 两次 pointerup 都走 select()，结果与单击完全相同（showDetail 对同一个
  // id 不会重复压历史栈）。再挂一个 dblclick 监听只会把飞入动画重置一次。

  /* ───────────── 选中 ───────────── */

  /**
   * 统一入口：选中一个公式（或传 null 取消）。
   *
   * 所有"选中"路径都必须走这里 —— 画布点击、详情面板里的关联跳转、
   * 搜索命中。否则会出现"面板打开了但关联弧线没出现"这种不一致
   * （之前 onFocus 就漏了 links.highlight）。
   *
   * 相机行为也在这里统一：选中 → 聚焦到它；取消 → 回到初始机位。
   * 所以在面板里点另一个公式时，中心会自动跟着换过去。
   *
   * @param {string|null} id
   * @param {{pushHistory?: boolean, silent?: boolean}} opts
   *   silent: 不触发 onSelectionChange 回调。
   *   用在"从 URL 恢复选中"这条路径上 —— 那时 URL 已经是目标状态，
   *   再回调一次写回 URL 只会多压一条重复的历史记录。
   */
  function select(id, opts = {}) {
    if (!id) {
      // 走 hideDetail() 让面板收起，它会回调 onClose → deselectFromPanel(),
      // 由那里统一收尾（清高亮、恢复自转、相机回位）。
      ui.hideDetail()
      // 面板本来就是关着的时候 onClose 也会触发，所以上面那步通常够了；
      // 这里再兜一次底，保证"取消选中"在任何路径下都彻底生效。
      deselectFromPanel({ silent: opts.silent })
      return null
    }

    const n = graph.byId.get(id)
    if (!n) return null

    if (proofContextFocusId && proofContextFocusId !== id) proofContextFocusId = null

    selected = id
    links.highlight(selected)
    recomputeFocusHops()        // 焦点+上下文：算一次跳数表（不是每帧）
    setPanelOpen(true)          // 面板避让：视口让出右侧面板的位置
    spinPaused = true           // 面板打开时冻结自转，方便阅读
    ui.showDetail(n, opts.pushHistory !== false)
    focusOn(selected)           // 视角中心移到这个公式
    if (!opts.silent) selectionCbs.forEach((fn) => fn(selected))
    return n
  }

  /**
   * 面板被收起（✕ / Esc / 点空白）后的收尾。
   *
   * ⚠ 为什么需要单独一个函数，而不是直接调 select(null)：
   *   select(null) 会调 ui.hideDetail() → onClose() → 又回到这里，无限递归。
   *   所以把"清状态"和"收面板"拆开：这个函数**只清状态**，不碰面板。
   *
   * 它顺带修掉一个老问题：以前关闭面板只清了连线高亮，
   * `selected` 与 `spinPaused` 都留着 —— 星系会**永远停转**。
   */
  function deselectFromPanel(opts = {}) {
    // ★ 只有"确实取消了一个选中"才回位。
    //
    // 因为 ui.hideDetail() 是**无条件**回调 onClose 的，所以这个函数也会在
    // "本来就没选中任何东西"时被调到（典型场景：用户自己拖拽/滚轮看了一会儿，
    // 随手点了一下空白处）。那种情况下把镜头猛地拉回初始机位是莫名其妙的 ——
    // 用户并没有"退出"什么。只有撤销一次**由程序施加的聚焦**时才该回位。
    const wasSelected = selected !== null

    selected = null
    proofContextFocusId = null
    links.highlight(null)
    recomputeFocusHops()        // 清空跳数表 → 亮度恢复正常（焦点+上下文撤销）
    setPanelOpen(false)         // 面板收起 → 撤回视口避让，画面恢复整屏
    spinPaused = false
    if (wasSelected) returnHome()
    /* 无条件通知（哪怕本来就没选中）：URL 同步需要知道"现在没有选中"，
     * 这样从深链进来后按 Esc 能把地址栏里的 n= 去掉。
     * silent 用于程序化的取消（重排前的清理）——
     * 那种场景下 URL 里本来就该保留用户看到的那个选中。 */
    if (!opts.silent) selectionCbs.forEach((fn) => fn(null))
  }

  /* ───────────── 每帧更新 ───────────── */
  const clock = new THREE.Clock()
  let elapsed = 0

  // 复用临时对象，避免每帧产生垃圾
  const tmpColor = new THREE.Color()
  const camPos = new THREE.Vector3()
  const worldV = new THREE.Vector3()
  const _qInv = new THREE.Quaternion()          // 抵消父级自转用
  const _qInvC = new THREE.Quaternion()         // 同上，星团专用的斜轴版
  const _AXIS_Y = new THREE.Vector3(0, 1, 0)
  /* 星团的倾斜转轴。归一化一次，之后每帧复用。 */
  const _CLUSTER_AXIS = new THREE.Vector3(...CLUSTER.spinAxis).normalize()
  const _RESEARCHER_AXIS = new THREE.Vector3(...RESEARCHERS.spinAxis).normalize()

  function updateMotion(dt) {
    elapsed += dt

    // ── 整层刚性自转 ──
    // 用一个共享角度旋转整个公式组，而不是每个公式各转各的。
    // 差异旋转会把旋臂图案逐渐搅碎（内圈越转越快，几秒后臂就散了），
    // 刚性旋转才能让对数旋臂结构一直保持完整。
    //
    // 暂停时只冻结角度、不重置角度 —— 这样面板关掉后从原地继续转，不会跳一下。
    //
    // ⚠ 星团**共用同一个 spinPaused**。两者都停是必需的：聚焦某个公式时
    //   相机在飞向它，若星团还在动，目标就会跑掉（与主星系当初的理由相同）。
    if (!spinPaused) {
      spinAngle = (spinAngle + dt * MOTION.spinRate) % (Math.PI * 2)
      nodeGroup.rotation.y = spinAngle
      // 星团绕倾斜轴翻滚。用 quaternion 而不是 rotation.x/y/z：
      // 欧拉角在斜轴上会露出万向节效应（转着转着轴会偏），
      // 而它是"球"、一旦轴漂移立刻看得出来。
      if (CLUSTER.enabled) {
        clusterAngle = (clusterAngle + dt * CLUSTER.spinRate) % (Math.PI * 2)
        clusterGroup.quaternion.setFromAxisAngle(_CLUSTER_AXIS, clusterAngle)
      }
      if (RESEARCHERS.enabled) {
        researcherAngle = (researcherAngle + dt * RESEARCHERS.spinRate) % (Math.PI * 2)
        researcherGroup.quaternion.setFromAxisAngle(_RESEARCHER_AXIS, researcherAngle)
      }
    }
    // 必须在读 matrixWorld 之前刷新：three 平时是在 render() 里才更新它的，
    // 而下面要拿它把局部坐标转成世界坐标，晚一步就会用到上一帧的旋转。
    nodeGroup.updateMatrixWorld(true)
    clusterGroup.updateMatrixWorld(true)
    researcherGroup.updateMatrixWorld(true)

    /* 星团柔光是一张正对相机的面片，所以每帧都要把它转过来。
     * 父组（clusterGroup）在绕斜轴翻滚，所以世界朝向 = q组 × q局部，
     * 要左乘组的逆把它抵消掉 —— 跟公式 billboard 是同一套做法，
     * 否则这片柔光会跟着星团一起翻，侧过去就成了一条线。 */
    if (clusterHalo) {
      clusterHalo.quaternion.copy(clusterGroup.quaternion).invert()
      clusterHalo.quaternion.multiply(camera.quaternion)
    }
    if (researcherHalo) {
      researcherHalo.quaternion.copy(researcherGroup.quaternion).invert()
      researcherHalo.quaternion.multiply(camera.quaternion)
    }

    for (const n of graph.nodes) {
      const s = n.sprite
      if (!s) continue

      // 每个公式只做很轻微的浮动（相对它自己的基准位置），
      // 幅度刻意压得很小，否则薄盘会被搅厚，"同一片平面"的观感就没了。
      // 可用设置面板里的「公式浮动」开关关掉。
      const amp = MOTION.bobEnabled === false ? 0 : n.bobAmp
      const bob = Math.sin(elapsed * n.bobSpeed + n.bobPhase) * amp
      const bobY = Math.cos(elapsed * n.bobSpeed * 0.77 + n.bobPhase * 1.31) *
        amp * MOTION.bobVerticalRatio

      const b = n.basePos
      // 星团/研究者节点的 basePos 是世界坐标，父组已在球心 → 要转成相对坐标
      if (n.cluster) {
        s.position.set(
          b.x - CLUSTER.center[0] + bob,
          b.y - CLUSTER.center[1] + bobY,
          b.z - CLUSTER.center[2] + bob,
        )
      } else if (n.researcher) {
        s.position.set(
          b.x - RESEARCHERS.center[0] + bob,
          b.y - RESEARCHERS.center[1] + bobY,
          b.z - RESEARCHERS.center[2] + bob,
        )
      } else {
        s.position.set(b.x + bob, b.y + bobY, b.z + bob)
      }

      // ③ 始终面向相机（billboard）
      // 公式是二维排版，一旦侧过来就变成一条线彻底看不见，所以必须对齐相机朝向。
      //
      // ⚠ 关键：公式的父级在自转，而 s.quaternion 是**局部**旋转，
      //   世界朝向 = q组 × q局部。若只写 camera.quaternion，公式会跟着星系一起转，
      //   转到侧面就消失。所以要把组的旋转**左乘其逆**抵消掉：
      //       局部 = q组⁻¹ × q相机 × 倾斜
      s.quaternion.copy(camera.quaternion)
      if (!isFinite(s.userData.tilt)) s.userData.tilt = 1
      const tiltY = Math.sin(elapsed * 0.20 + n.spinPhase) * 0.10
      const tiltX = Math.cos(elapsed * 0.15 + n.spinPhase) * 0.06
      s.rotateY(tiltY)
      s.rotateX(tiltX)
      // 抵消各自父组的旋转。星团用的是同一个原理，只是组的 rotation 由
      // quaternion 给出（斜轴），所以取反也要用 quaternion。
      if (n.cluster) {
        _qInv.copy(clusterGroup.quaternion).invert()
      } else if (n.researcher) {
        _qInv.copy(researcherGroup.quaternion).invert()
      } else {
        _qInv.setFromAxisAngle(_AXIS_Y, -nodeGroup.rotation.y)
      }
      s.quaternion.premultiply(_qInv)

      // 光晕跟着公式走：位置与朝向都完全同步。
      // 光晕是**等向**的圆形渐变，所以不需要跟那个倾斜（也不该跟，
      // 否则会看到光斑跟着字一起晃，很假），直接copy相机的朝向即可。
      const gl = n.glow
      if (gl) {
        gl.position.copy(s.position)
        gl.quaternion.copy(camera.quaternion)
        gl.quaternion.premultiply(_qInv)
      }

      // ── 状态色点：贴在公式左侧，跟着缩放一起变 ──
      const mk = n.marker
      if (mk) {
        // 位置用**当前**缩放后的半宽，否则悬停放大时色点会陷进公式里
        const halfW = n.markerBaseW * 0.5 * s.scale.x
        const gap = n.markerBaseH * CLUSTER.markerGap
        const ms = n.markerBaseH * CLUSTER.markerSize * s.scale.x
        mk.position.set(s.position.x - halfW - gap - ms * 0.5, s.position.y, s.position.z)
        mk.quaternion.copy(camera.quaternion)
        mk.quaternion.premultiply(_qInv)
        mk.scale.setScalar(s.scale.x)
      }

      // 连线的端点要用**世界坐标**：公式在旋转的组里，
      // 而连线在组外，所以必须把局部位置乘上组的旋转矩阵。
      worldV.copy(s.position).applyMatrix4(n.group.matrixWorld)
      worldPos.set(n.id, { x: worldV.x, y: worldV.y, z: worldV.z })
    }
  }

  /** 悬停/选中的视觉反馈 + 随距离的亮度衰减 */
  function updateAppearance(dt) {
    camera.getWorldPosition(camPos)
    const k = 1 - Math.pow(0.001, dt)   // 帧率无关的插值系数

    for (const n of graph.nodes) {
      const s = n.sprite
      if (!s) continue

      const isHover = hovered && hovered.id === n.id
      const isSel = selected === n.id

      // 目标缩放
      const inProofContext = proofContextFocusId === selected && focusHops?.get(n.id) === 1
      const targetScale = isSel ? INTERACTION.hoverScale * 1.12
        : isHover ? INTERACTION.hoverScale : inProofContext ? 1.08 : 1

      // 目标亮度系数
      let brightK = 1
      if (GLYPH.depthFade) {
        const d = camPos.distanceTo(s.position)
        const t = Math.min(1, Math.max(0, (d - CAMERA.minDistance) / 260))
        brightK = GLYPH.fadeNear + t * (GLYPH.fadeFar - GLYPH.fadeNear)
      }

      /* ── 焦点+上下文压暗 ──
       *
       * 选中时，按**图上跳数**把无关的节点压到背景里。
       * 注意是乘法叠加在纵深衰减之上（而不是取代它）——
       * 两个衰减表达的是不同的东西：纵深说"你在星系里的前后"，
       * 跳数说"你离我关心的那条有多远"。同时生效才对。
       *
       * 悬停/选中的节点本身永远不受压暗影响（下面 isSel/isHover 的加成
       * 会把它拉回来），否则会出现"我点中的那条自己很暗"的荒谬情况。 */
      if (focusHops) {
        const hops = focusHops.get(n.id)
        // 不在表里 = 超过 8 跳（实测不可能，图的直径是 7），
        // 但仍然给一个兜底：当作最远，而不是当作 0（那会全部点亮）
        const h = hops === undefined ? 9 : hops
        if (h > 0) {
          let f = Math.pow(GLYPH.focusDimPerHop, h)
          if (f < GLYPH.focusDimMin) f = GLYPH.focusDimMin
          brightK *= f
        }
      }

      /* ── 修正 3：焦点以外按**深度**淡出（2026-11-01） ──
       *
       * 原问题："拉近后公式互相叠压"。
       *
       * 与上面按跳数压暗是**两件不同的事**，所以单独一层：
       *   跳数说"你在图上离我关心的那条有多远"（拓扑距离）
       *   深度说"你在三维里离我眼睛有多远"（视觉距离）
       * 拉近时大量公式堆在同一片屏幕区域，它们的跳数可能都不远
       * （都在同一个族里），但深度差很多 —— 只按跳数压暗救不了叠字。
       *
       * 做法：以"当前选中节点（或相机焦点）的深度"为中心，
       * 前后都按距离衰减，让焦点附近那一层清晰地浮出来，其余退掉。
       * 没有选中时不启用（否则总览会变成只有一层薄片）。
       */
      if (GLYPH.depthFocusFade && (selected || hovered)) {
        const anchorNode = selected ? graph.byId.get(selected) : (hovered && graph.byId.get(hovered.id))
        if (anchorNode && anchorNode.sprite) {
          const dFront = camPos.distanceTo(anchorNode.sprite.position)
          const dNode = camPos.distanceTo(s.position)
          /* 相对深度差，按焦点距离的百分比衡量（缩放自适应）：
             差值超过 falloffRange × 焦点距离就压到最小。 */
          const rel = Math.abs(dNode - dFront) / Math.max(1e-3, dFront)
          const t = Math.min(1, Math.max(0, (rel - GLYPH.depthFadeStart) / GLYPH.depthFadeRange))
          const df = 1 - t * (1 - GLYPH.depthFadeMin)
          brightK *= df
        }
      }

      const targetBright = n.brightness * brightK * (isSel ? 1.45 : isHover ? 1.25 : inProofContext ? 1.55 : 1)

      // 平滑插值
      s.scale.x += (targetScale - s.scale.x) * k
      s.scale.y = s.scale.z = s.scale.x

      n.curBright = n.curBright === undefined ? targetBright : n.curBright
      n.curBright += (targetBright - n.curBright) * k

      const c = n.baseColor
      const br = n.curBright
      // 同样不钳制：>1 的部分交给 bloom 晕开
      s.material.color.setRGB(c.r * br, c.g * br, c.b * br)

      /* ── 修正 2：远处只显示光点，不画公式（2026-11-01） ──
       *
       * 原问题："总览时公式读不出来"——405 个公式缩成彩色细线，
       * 既看不清又互相糊成一片，还抢掉了星云的层次。
       *
       * 做法：按相机到该节点的距离算一个"文字可见度"，远处直接隐藏贴图，
       * 只留背后的光晕（光晕是低频的，远处看就是一颗星）。
       * 近处（用户能看清字的时候）完全恢复原样。
       *
       * 判据用**屏幕高度**而不是世界距离，这样缩放/透视变化时行为一致：
       * 贴图在该距离下的屏幕高度低于 textMinPx 时，字本来就不可读，
       * 画出来只是噪声，不如退回光点。
       */
      const distCam = camPos.distanceTo(s.position)
      const projY = camera.projectionMatrix.elements[5]        // = 1/tan(fov/2)
      const screenH = (s.scale.y * projY / Math.max(1e-4, distCam)) * renderer.domElement.height * 0.5
      const legible = screenH >= GLYPH.textMinPx

      /* 选中 / 悬停 / 证明上下文里的节点永远保文字，
         否则用户点了却看不到自己点的是什么。 */
      const forceText = isSel || isHover || inProofContext
      s.visible = forceText || legible

      /* ── 文字退成光点时的"光点尺度"（0→1）──
       * 0 = 文字清晰可见（光点用正常大小）
       * 1 = 文字完全退掉（光点放大到最大，承担全部视觉表达）
       *
       * 2026-11-01 用户反馈修正：**不能一点都不显示**。
       * 远处必须仍有东西代表这个公式 —— 用放大的光点。所以这里不是
       * "隐藏"，而是"把表达方式从文字换成光点"。
       *
       * 平滑过渡：屏幕高度在 [textMinPx, textFullPx] 之间时线性放大光点，
       * 避免缩放过程中光点尺寸跳变。 */
      const dotT = forceText ? 0
        : (screenH >= GLYPH.textFullPx ? 0
          : screenH <= GLYPH.textMinPx ? 1
            : (GLYPH.textFullPx - screenH) / (GLYPH.textFullPx - GLYPH.textMinPx))

      // 光晕跟着一起呼吸：
      //   ① 悬停/选中时光晕放大并变亮 —— 那是主要的"我点到了"的反馈，
      //      比只放大字更明显，因为光晕面积大得多；
      //   ② 用**同一个** brightK（纵深衰减）而不是另算一套，
      //      否则远处公式会出现"字很暗但光晕很亮"的鬼影。
      const gl = n.glow
      if (gl) {
        const gk = (isSel ? 1.9 : isHover ? 1.5 : inProofContext ? 1.55 : 1)
        /* 光点放大：文字退掉时乘 dotScale，让"这颗星"足够醒目。
           基础尺度仍跟 targetScale 走，保持"重要度 → 大小"的表达。 */
        const dotScale = 1 + dotT * (GLYPH.dotScale - 1)
        gl.scale.setScalar(targetScale * (1 + (gk - 1) * 0.55) * dotScale)
        // 目标强度 = 归一化权重 × 全局强度设置 × 悬停加成 × 纵深衰减。
        // 全局强度每帧现取，所以拖动面板滑块立刻见效。
        //
        // 2026-11-01：文字退成光点时亮度也要提，但**不能提太猛** ——
        // 背景粒子层去掉后，这层光点就是唯一的"星云质感"，
        // 提太猛会变成一片白雾，提不够又显得稀疏。用 dotT 平滑过渡。
        const dotBoost = 1 + dotT * (GLYPH.dotGlowBoost - 1)
        const gtarget = n.glowBase * GLYPH.glow.strength * gk * brightK * dotBoost
        n.curGlow = n.curGlow === undefined ? gtarget : n.curGlow
        n.curGlow += (gtarget - n.curGlow) * k
        const gc = glowColor(c, n.curGlow, GLYPH.glow)
        gl.material.color.setRGB(gc.r, gc.g, gc.b)
        gl.renderOrder = (isHover || isSel) ? 25 : 5
        gl.visible = GLYPH.glow.enabled
      }

      // 被选中的公式略微前移，避免被遮挡
      s.renderOrder = (isHover || isSel) ? 30 : 10

      // 状态色点跟着淡入淡出：用同一个 brightK，否则远处会出现
      // "字很暗但色点很亮"的鬼影（与上面光晕同理）。
      // 色点的颜色在 recolor() 里按模式设定，这里只调亮度。
      const mk = n.marker
      if (mk) {
        const mc = n.markerColor
        const mk2 = brightK * (isSel ? 1.5 : isHover ? 1.3 : 1)
        mk.material.color.setRGB(mc.r * mk2, mc.g * mk2, mc.b * mk2)
        mk.visible = CLUSTER.markerEnabled
      }
    }
  }

  function render() {
    if (composer) composer.render()
    else renderer.render(scene, camera)
  }

  /**
   * 修正 4：让 2D 浮卡跟着选中的公式跑。
   *
   * 每帧都要重算屏幕位置（相机在动、星系在自转），但**内容只在换节点时重排**
   * —— KaTeX 排版是 DOM + 字体测量，每帧重做会直接拖垮帧率。
   * 那部分由 formulaCard.show() 内部的 key 比较挡掉。
   */
  function updateFormulaCard() {
    /* 只在"选中且该节点确实存在 sprite"时显示。
       选中的是研究者/猜想时也走同一条路径（它们同样有 latex）。 */
    if (!selected) { formulaCard.hide(); return }
    const n = graph.byId.get(selected)
    if (!n || !n.sprite) { formulaCard.hide(); return }

    /* 取世界坐标再投影：节点的 position 是组内局部的，组在自转，
       直接用局部坐标会得到"卡片不跟转动"的错位置。 */
    nodeWorldPos(n, _cardWorld)
    /* ⚠ 必须先 beginScreenProjection()：projectToScreen 用的是 _projRect
       里的视口矩形，而那组值只有这里才会刷新（默认是 0,0,1,1）。
       少了这一步，所有投影坐标都会被压到 (0,0) 附近 —— 实测表现为
       卡片永远停在左上角 (18,16)。 */
    beginScreenProjection()
    const p = projectToScreen(_cardWorld.x, _cardWorld.y, _cardWorld.z)

    /* projectToScreen 在相机背后返回 null —— 此时不该显示卡片，
       否则会跑到屏幕另一侧（镜像位置）。 */
    if (!p) { formulaCard.hide(); return }

    formulaCard.show(n, { x: p.x, y: p.y })
  }

  let rafId = null
  function loop() {
    rafId = requestAnimationFrame(loop)
    const dt = Math.min(clock.getDelta(), 0.05)   // 卡顿时限制步长，避免跳变

    updateFocus(dt)

    // 相机自转必须与聚焦互斥：
    //   OrbitControls.update() 里的 autoRotate 会绕 target 再转一点，而
    //   updateFocus 正把相机往理想机位插值 —— 两者每帧互相拉扯，画面会
    //   绕着公式缓慢打转，回位时甚至永远差一点点而收敛不了（下面的吸附
    //   判定就永远不成立）。所以放在**同一处**统一裁决，而不是分散到
    //   拖拽/设置回调里各改各的。
    controls.autoRotate = autoRotateWanted && !dragging && !focusState.mode
    controls.update()

    if (MOTION.enabled) updateMotion(dt)
    else {
      // 静止模式也要填一次位置，供连线使用。
      // 这时组不转，但局部→世界仍要走一遍矩阵（组可能被别处置过旋转）。
      nodeGroup.updateMatrixWorld()
      clusterGroup.updateMatrixWorld()
      researcherGroup.updateMatrixWorld()
      // 光晕也要朝向相机，否则静止模式下光斑会侧过去变成一条线
      _qInv.setFromAxisAngle(_AXIS_Y, -nodeGroup.rotation.y)
      _qInvC.copy(clusterGroup.quaternion).invert()
      const _qInvR = new THREE.Quaternion().copy(researcherGroup.quaternion).invert()
      // 星团柔光同样要朝向相机（静止模式也要，否则停下来它就侧过去了）
      if (clusterHalo) {
        clusterHalo.quaternion.copy(clusterGroup.quaternion).invert()
        clusterHalo.quaternion.multiply(camera.quaternion)
      }
      if (researcherHalo) {
        researcherHalo.quaternion.copy(researcherGroup.quaternion).invert()
        researcherHalo.quaternion.multiply(camera.quaternion)
      }
      for (const n of graph.nodes) {
        if (!n.sprite) continue
        worldV.copy(n.sprite.position).applyMatrix4(n.group.matrixWorld)
        worldPos.set(n.id, { x: worldV.x, y: worldV.y, z: worldV.z })
        const q = n.cluster ? _qInvC : (n.researcher ? _qInvR : _qInv)
        if (n.glow) {
          n.glow.quaternion.copy(camera.quaternion)
          n.glow.quaternion.premultiply(q)
        }
        if (n.marker) {
          n.marker.quaternion.copy(camera.quaternion)
          n.marker.quaternion.premultiply(q)
        }
      }
    }

    applyGravity(dt)
    updateAppearance(dt)
    updateFormulaCard()
    nebula.update(elapsed)
    // 背景旋臂与公式层用同一个角度基准（乘一个略快的系数），
    // 所以两层旋臂始终对齐，只有极轻微的差异旋转带来"流动"感。
    if (MOTION.spinRate > 1e-9) {
      nebula.setSpin?.(spinAngle * (MOTION.decorSpinRate / MOTION.spinRate))
    }
    links.update(dt, worldPos)

    render()
  }

  /* ───────────── 引力模式 ─────────────
   *
   *  参考 shiyun 的 gravity 开关（FlyControls.tsx:664）：
   *  相机绕原点以**与星系相同的角速度**旋转，于是公式层在屏幕上
   *  看起来是**静止的** —— 好点选、好读；而背景星云因为用了
   *  decorSpinRate（略快）仍然在流动，制造"其实还在转"的错觉。
   *
   *  这解决的是本项目最实际的问题：整盘入画时公式字高只有个位数像素，
   *  还在自转的话既看不清也点不准。打开引力后"自转"与"可读性"解耦。
   *
   *  ⚠ 关键：必须**同时旋转相机位置与 controls.target**，让相机绕着
   *    target 公转。只转 camera.position 会让视角歪掉（相机绕着原点
   *    平移而不是环绕）。转轴是 Y 轴（与 nodeGroup.rotation.y 同轴）。
   *
   *  ⚠ 旋转方向必须与 nodeGroup.rotation.y **同向同速**：
   *    公式组转 +dθ 会把公式移到屏幕另一侧，相机也要转 +dθ，
   *    两者相消，公式在屏幕上的位置才不变。用同一个 makeRotationY(-dθ)？
   *    不是 —— 相机绕 Y 转 +dθ 与物体绕 Y 转 +dθ 是同一套右手系约定，
   *    所以这里直接转 +dθ 即可（实测由 verify-gravity.mjs 把关）。
   */
  const _spinAxis = new THREE.Vector3(0, 1, 0)
  const _gravQ = new THREE.Quaternion()
  function applyGravity(dt) {
    if (!GRAVITY.enabled || spinPaused) return
    if (MOTION.spinRate <= 1e-9) return

    const dA = MOTION.spinRate * dt * GRAVITY.followRate
    _gravQ.setFromAxisAngle(_spinAxis, dA)

    // 相机位置与注视点一起绕原点旋转 —— 两者必须同步，
    // 否则相机会绕着原点平移，视角会歪。
    camera.position.applyQuaternion(_gravQ)
    controls.target.applyQuaternion(_gravQ)
    camera.lookAt(controls.target)
  }

  /* ───────────── 尺寸自适应 ───────────── */
  function onResize() {
    const w = window.innerWidth
    const h = window.innerHeight
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    renderer.setSize(w, h)
    if (composer) composer.setSize(w, h)
    if (bloomPass) bloomPass.setSize(w, h)
    links.setResolution?.(w, h)
    /* 视口偏移量是按窗口宽高**算出来的**（ox = pw·(1-pw/2w)），
     * 所以窗口一变就必须重算 —— 否则面板避让会按旧尺寸偏移，
     * 表现为拖窗口后公式慢慢飘出可见区。 */
    applyViewOffset()
  }
  window.addEventListener('resize', onResize)

  return {
    renderer,
    scene,
    // camera / nodeGroup are exposed via getters further down in this object
    // (see `get camera()` and `get nodeGroup()`). Declaring them here as
    // shorthand too produced duplicate keys, where one silently shadowed the
    // other depending on evaluation order.
    controls,
    links,          // 关联连线：highlight(id) 只显示该公式的关联（main.js 的 onClose 要用）
    buildNodes,

    /**
     * 连线悬停的瞄准探针（只给验证脚本用）。
     *
     * 找当前选中节点的一条边，取它曲线中点，用场景**自己**的
     * projectToScreen 换算成屏幕坐标返回 —— 验证脚本把这个坐标
     * 喂给合成的 pointermove，就能走完真实的拾取路径。
     *
     * 为什么取中点而不是端点：端点就在公式精灵上，
     * 而 pointermove 的节点拾取优先于连线拾取，鼠标落在端点会被
     * 判成"停在公式上"，测不到连线提示。
     *
     * @returns {{x,y,edge,label,type,weight}|{err:string}}
     */
    probeEdgeAim() {
      if (!selected) return { err: '当前没有选中节点' }
      const cand = links.incidentEdgesOf ? links.incidentEdgesOf(selected) : []
      if (!cand.length) return { err: '选中节点没有可见连线' }
      beginScreenProjection()
      /* 在候选边里挑一条**中点离画面中心最近**的。
       *
       * 为什么不是"第一条落在视口内的"：选中一个高度数的节点之后，
       * 相机要飞一会儿才停稳，而探针和真正发鼠标事件之间隔着一次
       * CDP 往返。取"最靠近中心"的边是最稳的选择 —— 中心离四边都远，
       * 相机残余移动几十像素也不会把它推出视口。
       *
       * 之前用"第一条在视口内的"会稳定地挑中贴边的边（模空间那条
       * 就挑到了 x=-138），然后鼠标事件落在画布外被浏览器丢弃，
       * 测出来是"提示框没弹出" —— 看起来像功能坏了，其实只是瞄偏了。 */
      const W = canvas.clientWidth
      const H = canvas.clientHeight
      const cx = W / 2
      const cy = H / 2
      let best = null
      let bestD = Infinity
      let onScreen = 0
      for (const i of cand) {
        const e = links.edgeAt(i)
        if (!e) continue
        const mid = links.edgeMidpoint(i)
        if (!mid) continue
        const s = projectToScreen(mid.x, mid.y, mid.z)
        if (!s) continue
        if (s.x < 0 || s.x > W || s.y < 0 || s.y > H) continue
        onScreen++
        const d = (s.x - cx) * (s.x - cx) + (s.y - cy) * (s.y - cy)
        if (d < bestD) {
          bestD = d
          best = {
            edge: i, type: String(e.type || ''), weight: Number(e.weight) || 0,
            label: String(e.label || ''), source: String(e.source), target: String(e.target),
            x: s.x, y: s.y, onScreen, candidates: cand.length,
          }
        }
      }
      if (!best) {
        return { err: `关联的 ${cand.length} 条边没有一条中点落在视口内（相机可能还在飞）` }
      }
      return best
    },
    /** 光晕精灵（验证脚本要检查数量/颜色/朝向） */
    get glowSprites() { return glowSprites },

    /**
     * 就地重新着色（切换「按知识族 / 统一橙黄」用）。
     *
     * 不重建几何、不重新布局、不重烘贴图 —— 只是把每个节点的 baseColor
     * 重算一遍，再写进材质。比 rebuildNodes 轻得多（那条路会 dispose 掉
     * 257 个 geometry 再新建 257 个，还要重算世界坐标）。
     */
    recolor() {
      for (const n of graph.nodes) {
        applyColor(n)              // 按当前 GLYPH.colorMode 重取 baseColor
        n.curBright = undefined    // 让亮度插值从当前目标重新起步，避免闪一下
        if (!n.sprite) continue
        const c = n.baseColor
        const br = n.curBright = n.brightness
        n.sprite.material.color.setRGB(c.r * br, c.g * br, c.b * br)
        if (n.glow) {
          n.curGlow = undefined
          const gc = glowColor(c, n.glowBase * GLYPH.glow.strength, GLYPH.glow)
          n.glow.material.color.setRGB(gc.r, gc.g, gc.b)
        }
        // 状态色点也要跟着换：切到"按领域着色"时色点必须和公式同色，
        // 否则会出现"公式蓝、色点橙"这种自相矛盾的画面。
        if (n.marker) {
          const mc = n.markerColor
          n.marker.material.color.setRGB(mc.r, mc.g, mc.b)
        }
      }
      return graph.nodes.length
    },

    /**
     * 重排后重建全部精灵（形态切换用）。
     *
     * ⚠ 贴图**复用**：baked 里的 CanvasTexture 不重新烘焙，
     *   所以这里只销毁 geometry，**不能** dispose 贴图 ——
     *   否则重建出来的平面会引用已释放的纹理（黑块）。
     *   贴图的销毁统一由 dispose() 负责。
     */
    rebuildNodes(baked) {
      for (const s of sprites) {
        s.parent?.remove(s)
        s.geometry.dispose()
        // 注意：只释放材质本身，不动 material.map —— 贴图是共享的
        s.material.dispose()
      }
      sprites.length = 0
      // 光晕也要一并清掉：它的贴图由 glow.js 模块级缓存持有，
      // 所以这里同样**不能** dispose material.map，只释放材质与几何。
      for (const g of glowSprites) {
        g.parent?.remove(g)
        g.geometry.dispose()
        g.material.dispose()
      }
      glowSprites.length = 0
      // 状态色点同理：CircleGeometry 是每个节点各一个，必须释放
      for (const m of markers) {
        m.parent?.remove(m)
        m.geometry.dispose()
        m.material.dispose()
      }
      markers.length = 0
      worldPos.clear()
      hovered = null
      selected = null
      focusHops = null      // 重建节点后旧的跳数表已失效，必须清掉
      return buildNodes(baked)
    },

    focusOn,
    /** 统一选中入口（点击 / 面板关联跳转 / 搜索都要走这里） */
    select,
    /** 订阅"选中变化"（用于 URL 同步）。返回取消订阅函数。 */
    onSelection,
    /**
     * 面板收起后的收尾（清选中 + 恢复自转 + 相机回位）。
     * ⚠ 由 main.js 的 onClose 调用。**不要**在里面再调 select(null)（会递归）。
     */
    deselectFromPanel,
    /** 当前选中的公式 id（无则 null） */
    get selection() { return selected },
    /** 相机当前是否在聚焦某个公式 / 正在回位（验证脚本用） */
    get focusMode() { return focusState.mode },
    /** 聚焦是否已经"飞到位"（到位后转入只跟随，不再改距离/角度） */
    get focusSettled() {
      return focusState.mode === 'node' && focusState.converged
    },
    /** 星系自转是否被冻结（面板打开时冻结；验证脚本用） */
    get spinPaused() { return spinPaused },
    /** 初始机位（验证脚本用它断言"退出后确实回到了原处"） */
    get homeCamera() {
      return homeCam
        ? { pos: homeCam.pos.toArray(), target: homeCam.target.toArray() }
        : null
    },
    /**
     * 按盘面实际半径重新取景。
     * layoutGraph() 之后调用 —— createScene() 时尚不知道真实盘半径。
     * @returns {number} 采用的相机距离
     */
    fitCamera(radius) {
      return applyCameraFit(radius)
    },
    /**
     * 调试：直接按 NDC 坐标做一次拾取，返回详细中间信息。
     * limit 控制返回的命中序列长度（默认 6，测试脚本会要得更长）。
     */
    __pickAt(ndcX, ndcY, limit = 6) {
      pointer.set(ndcX, ndcY)
      raycaster.setFromCamera(pointer, camera)
      const hits = raycaster.intersectObjects(sprites, false)
      return {
        spriteCount: sprites.length,
        hitCount: hits.length,
        // 沿射线的完整命中序列（由近到远），用于判断遮挡下的拾取是否正确
        hits: hits.slice(0, limit).map((h) => ({
          id: h.object.userData.node?.id,
          dist: +h.distance.toFixed(2),
          opaque: hitIsOpaque(h),
          // uv 一并带出：测试脚本要拿它反查贴图上的落点，判断"瞄准处是否实心"
          uv: h.uv ? { x: +h.uv.x.toFixed(4), y: +h.uv.y.toFixed(4) } : null,
        })),
        resolved: pick()?.id || null,
      }
    },
    start() {
      if (rafId === null) { clock.getDelta(); loop() }
    },
    stop() {
      if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null }
    },

    /* ───────────── 设置面板接口 ───────────── */

    /**
     * 形态切换：背景星云的旋臂骨架要跟公式层一起换，
     * 否则会看到两层各转各的臂。
     *
     * ⚠ 这里的**公式层**重建不在这里做 —— 换形态要重跑 layoutGraph()
     *   并重建全部精灵，代价大，由 main.js 统一负责（见 rebuildLayout）。
     *   这里只处理不需要重排的部分。
     */
    setShape(shapeId) {
      const s = SHAPES[shapeId]
      if (s) nebula.setShape?.(s.nebula)
    },

    /** 显示层开关 */
    setDisplay(key, on) {
      switch (key) {
        case 'links':
          // 连线整体可用性：off 时连点选也不画
          LINKS.enabled = on
          links.group.visible = on
          if (!on) links.highlight(null)
          else links.highlight(selected)
          break
        case 'linkTypes':
          /* 按关系类型着色。只改一个 config 标志再让 links 重算颜色 ——
           * 不重建几何（详见 links.js 的 recolor 注释）。 */
          LINKS.colorByType = on
          links.recolor?.()
          break
        case 'nebula':
        case 'stars':
        case 'disc':
          nebula.setLayerVisible?.(key, on)
          break
        case 'bloom':
          if (bloomPass) bloomPass.enabled = on
          break
        /* ── 星团三项 ──
         * ⚠ 'cluster' 是**总开关**，它必须同时改写 group.visible 与连线的
         *   可见性。只改 config 里的 CLUSTER.enabled 是不够的 ——
         *   layoutGraph 早已按 CLUSTER.enabled=true 算完位置，
         *   渲染层不会因为它变了而自动隐藏任何东西。
         *   这个 bug 被 verify-cluster.mjs 的「显示层开关」一组抓到过。 */
        case 'cluster':
          CLUSTER.enabled = on
          clusterGroup.visible = on
          links.setClusterVisible?.(on && currentView !== 'galaxy')
          break
        case 'clusterHalo':
          // 柔光壳是**一个** mesh，不是每个节点一个 —— 所以直接置 visible
          CLUSTER.haloEnabled = on
          if (clusterHalo) clusterHalo.visible = on
          break
        case 'researchers':
          RESEARCHERS.enabled = on
          researcherGroup.visible = on && currentView === 'overview'
          links.setResearcherVisible?.(on && currentView === 'overview')
          break
        case 'researcherHalo':
          RESEARCHERS.haloEnabled = on
          if (researcherHalo) researcherHalo.visible = on
          break
        case 'markers':
          /* 色点开关。⚠ 必须**在这里**直接置 visible，不能只改 CLUSTER
           * 然后指望 updateAppearance 每帧去同步。
           *
           * updateAppearance 确实也写着 `mk.visible = CLUSTER.markerEnabled`，
           * 但那条路径依赖 rAF 真的在跑。无头浏览器里 rAF 会被强烈节流
           * （实测 1600×1000 + SwiftShader 下有时两秒才出一帧），
           * 于是"关掉色点"能立刻生效、"打开"却要等下一帧 —— 表现为
           * 开关只会单向工作。这个 bug 被 verify-cluster.mjs 抓到过。
           *
           * 两处都写是刻意的：这里保证**确定性**（调用即生效，与帧率无关），
           * 每帧那处保证**重建节点后**新色点的 visible 也是对的。 */
          CLUSTER.markerEnabled = on
          for (const m of markers) m.visible = on
          break
        case 'autoRotate':
          // 只记下用户的意愿；真正开关 controls.autoRotate 由 loop() 裁决
          // （它还要兼顾"拖拽中"和"正在聚焦"两种情况）。
          autoRotateWanted = on
          break
        default:
          break
      }
    },

    /* ───────────── 星团接口 ───────────── */

    /**
     * 实验开关：临时隐藏/显示猜想星团（不需要重排布局）。
     *
     * 为什么不做成重建：星团的位置在 layoutGraph 里已经算好，
     * 隐藏只是 visible 置位。把它做成重建会让用户每切一次开关都等几秒。
     *
     * @returns {boolean} 当前是否可见
     */
    setClusterVisible(on) {
      CLUSTER.enabled = !!on
      clusterGroup.visible = !!on
      // 跨星团的连线要跟着一起消失 —— 否则会看到一堆线连向空无一物的地方
      links.setClusterVisible?.(!!on)
      return clusterGroup.visible
    },

    /** 研究者星团整体开关（与 setView 独立，用于设置面板里的单选框） */
    setResearcherVisible(on) {
      RESEARCHERS.enabled = !!on
      researcherGroup.visible = !!on && currentView === 'overview'
      links.setResearcherVisible?.(!!on && currentView === 'overview')
      return researcherGroup.visible
    },

    /**
     * 取景切换：全景 / 只看主星系 / 只看星团。
     *
     * ⚠ 这里用 visible 过滤而不是移动相机到别处：三个视图共用同一个
     *   世界坐标（星团固定在 -z），所以只要隐藏另一侧、再按当前可见
     *   内容重新取景即可。移动会破坏"星团位置固定"这一前提（取景
     *   距离每帧都要重算），也让退出聚焦时的回位变得复杂。
     */
    setView(viewId) {
      const v = VIEWS[viewId] ? viewId : 'overview'

      const showGalaxy = v !== 'cluster'
      const showCluster = v !== 'galaxy' && CLUSTER.enabled
      const showResearchers = v === 'overview' && RESEARCHERS.enabled

      nodeGroup.visible = showGalaxy
      clusterGroup.visible = showCluster
      researcherGroup.visible = showResearchers
      links.setView?.(v, showGalaxy, showCluster, showResearchers)

      // 重新取景：按可见内容算包围范围与瞄准中心
      const f = viewFrame(v, showGalaxy, showCluster, showResearchers)
      applyCameraFit(f.radius, f.center)
      currentView = v
      return { view: v, radius: f.radius }
    },

    /** 当前取景 id */
    get view() { return currentView },

    /** 星团球心（世界坐标）。验证脚本用它算"到球心的距离"，
     *  不硬编码 —— 否则 config 里改了位置，脚本会静默测错东西。 */
    get clusterCenter() { return CLUSTER.center.slice() },

    /** 星团柔光 mesh（可能为 null，比如设置里关掉了）。
     *
     *  明确暴露出来，而不是让验证脚本靠"遍历场景 + 猜材质特征"去找：
     *  那种启发式找法一旦改了混合模式或 renderOrder 就会**静默找不到**，
     *  然后测试报一个看起来像"功能坏了"的失败 —— 我第一次写
     *  check-halo-geometry.mjs 就是这样，3/4 项失败，其实是没找到对象。 */
    get clusterHaloRef() { return clusterHalo },

    /** 研究者星团球心（世界坐标）。验证脚本用它算"到球心的距离"，
     *  不硬编码 —— 否则 config 里改了位置，脚本会静默测错东西。 */
    get researcherCenter() { return RESEARCHERS.center.slice() },

    /** 研究者星团柔光 mesh（可能为 null，比如设置里关掉了）。 */
    get researcherHaloRef() { return researcherHalo },

    /** 主星系 / 星团 / 研究者星团的对象组（验证脚本断言 visible 用） */
    get nodeGroup() { return nodeGroup },
    get clusterGroupRef() { return clusterGroup },
    get researcherGroupRef() { return researcherGroup },

    /** 相机对象 / 让验证脚本能自己把世界坐标投影到屏幕 */
    get camera() { return camera },
    /** 取景相关的内部量（验证脚本检查"整盘入画"用） */
    get fit() {
      return {
        tilt: tilt,
        distance: camera.position.distanceTo(controls.target),
        target: controls.target.toArray(),
        fov: camera.fov,
        aspect: camera.aspect,
      }
    },

    /** 星团是否可见（验证脚本用） */
    get clusterVisible() { return clusterGroup.visible },

    /** 研究者星团是否可见（验证脚本用） */
    get researcherVisible() { return researcherGroup.visible },

    /** 研究者星团的自转角度（验证脚本用） */
    get researcherAngle() { return researcherAngle },

    /* ── 焦点+上下文 / 面板避让：暴露给验证脚本 ──
     *
     * 这两个特性都改"亮度"和"投影矩阵"，肉眼很难在截图上判定对错，
     * 所以必须能把内部量读出来断言：
     *   focusHopsOf(id)  → 跳数（undefined = 没在聚焦或超出半径）
     *   viewOffset       → 当前 setViewOffset 的四元组（null = 没偏移）
     */
    focusHopsOf(id) {
      if (!focusHops) return undefined
      return focusHops.get(id)
    },
    /** Mark every direct graph neighbour of id as a proof-page context node. */
    setProofContextFocus(id) {
      proofContextFocusId = id && graph.byId.has(id) ? id : null
      return proofContextFocusId
    },
    proofContextOf(id) {
      return !!proofContextFocusId && proofContextFocusId === selected
        && focusHops?.get(id) === 1
    },
    get focusHopCount() { return focusHops ? focusHops.size : 0 },
    get viewOffset() {
      const v = camera.view && camera.view.enabled ? camera.view : null
      return v ? { x: v.offsetX, y: v.offsetY, w: v.width, h: v.height, fullW: v.fullWidth, fullH: v.fullHeight } : null
    },
    /** 当前某节点的实际亮度系数（验证脚本用它断言"远的确实被压暗了"） */
    brightnessOf(id) {
      const n = graph.byId.get(id)
      return n ? n.curBright : undefined
    },
    get panelOpen() { return panelOpen },

    /** 星团的自转角度（验证脚本用它断言"星团确实在翻"） */
    get clusterAngle() { return clusterAngle },

    /** 运行时参数：由 settings.js 写进 config，这里只处理需要"主动应用"的 */
    applySettings() {
      if (bloomPass) {
        bloomPass.strength = BLOOM.strength
        bloomPass.threshold = BLOOM.threshold
      }
      /* 光点亮度是"调了立刻生效"的语义，不该只在下一帧插值里才体现。
       *
       * 无头浏览器/低帧率环境里，updateAppearance 可能几十秒都不跑一帧，
       * 于是拖滑块（或测试脚本 setTweak）之后材质纹丝不动 —— 用户看到的是
       * "这个滑块坏了"。这里直接按当前强度重写一遍材质，帧循环只负责后续
       * 的悬停/纵深呼吸；两处口径一致，都是 glowColor(baseColor, glowBase × strength)。
       *
       * ⚠ 只改颜色、不动 n.curGlow 的呼吸曲线本身：curGlow 是逐帧目标，
       *   下次 updateAppearance 会自然接上。 */
      for (const n of graph.nodes) {
        if (!n.glow) continue
        const gc = glowColor(n.baseColor, n.glowBase * GLYPH.glow.strength, GLYPH.glow)
        n.curGlow = GLYPH.glow.strength <= 0 ? 0 : n.curGlow
        n.glow.material.color.setRGB(gc.r, gc.g, gc.b)
      }
    },

    dispose() {
      this.stop()
      window.removeEventListener('resize', onResize)
      for (const s of sprites) {
        s.geometry.dispose()
        s.material.map?.dispose()
        s.material.dispose()
      }
      // 光晕贴图是模块级共享缓存，由 glow.js 自己管，
      // 这里只释放每个光晕各自的几何与材质（不要 map.dispose，
      // 否则会把还在被其它精灵引用的那张共享贴图销毁掉）
      for (const g of glowSprites) {
        g.geometry.dispose()
        g.material.dispose()
      }
      glowSprites.length = 0
      // 状态色点：几何与材质都是每个节点独有的，可以放心释放
      for (const m of markers) {
        m.geometry.dispose()
        m.material.dispose()
      }
      markers.length = 0
      clusterHalo?.geometry.dispose()
      clusterHalo?.material.dispose()
      researcherHalo?.geometry.dispose()
      researcherHalo?.material.dispose()
      renderer.dispose()
    },
  }
}
