/**
 * ═══════════════════════════════════════════════════════════════
 *  入口
 * ═══════════════════════════════════════════════════════════════
 *
 *  流程：装配知识图谱 → 排版并烘焙公式贴图（带进度）→ 启动场景
 */

import './style.css'
import { buildGraph, layoutGraph } from './graph.js'
import { bakeAll } from './formulaTexture.js'
import { createUI } from './ui.js'
import { createScene } from './scene.js'
import { createProofView } from './proofView.js'
import { GLYPH, LAYOUT, SHAPES, TWEAKABLE } from './config.js'
import { settings, DISPLAY, DEFAULTS } from './settings.js'
import { createSettingsPanel } from './settingsPanel.js'
import {
  decodeLocationState, decodeState, encodeState, mergeState, stateToHashInput, hashEquals,
} from './urlState.js'
import * as exportView from './exportView.js'
import * as graphQuery from '../../../src/graphQuery.js'
import * as linkTypes from '../../../src/linkTypes.js'
import * as progress from '../../../src/data/progress.js'
import * as proofRouter from '../../../src/proofRouter.js'
import { getProof, getProofCount } from '../../../src/data/proofs/index.js'
import { createDesignApi } from './designApi.js'
import {
  detectDevice, getQualitySettings, TouchGestureHandler,
  getCanvasResolution, debounce
} from '../../shared/responsive.js'

async function main() {
  const canvas = document.getElementById('scene')

  /* ── 0. Responsive setup ── */
  const device = detectDevice()
  const quality = getQualitySettings(device)
  console.log(`[公式诗云] 设备: ${device.tier}, 分辨率: ${device.width}×${device.height}, DPR: ${device.dpr}`)
  console.log(`[公式诗云] 质量设置:`, quality)

  // Apply quality settings to config
  if (device.isMobile || device.isTablet) {
    // Reduce particle count on mobile
    LAYOUT.particleCount = Math.floor(LAYOUT.particleCount * quality.particle)
    // Simplify glow effects
    TWEAKABLE.glowIntensity = TWEAKABLE.glowIntensity * 0.7
    console.log(`[公式诗云] 已降低粒子数至 ${LAYOUT.particleCount}`)
  }

  /* ── 0. 地址栏深链 ──
   *
   * ⚠ 必须在**装配图谱之前**做：形态（shape）决定布局的半径与角度，
   *   而布局是 buildGraph → layoutGraph 一路算下去的。
   *   如果在建完节点之后才套用 URL 里的形态，就得再重排一次
   *   （用户会看到星系跳一下）。在这里套用，则第一次排出来就是对的。
   *
   * 优先级：URL > localStorage 存档 > config 默认。
   *   为什么 URL 压过存档：用户是**点了一条链接**过来的，
   *   那条链接表达的是"给我看这个画面"的明确意图；
   *   而存档只是他上次离开时的状态，属于背景偏好。
   *   若存档赢，分享链接就会在一半的接收者那里失效 —— 那正是深链要解决的问题。
   *
   * 注意 decodeState 解析的是**不可信输入**，它永不抛异常（见 urlState.js）。 */
  const hashIn = location.hash
  const urlState = decodeLocationState(location.search, hashIn)

  /** 把"当前设置"编成 hash（不含 #）。node 由调用方给。 */
  function buildHash(nodeId) {
    /* ⚠ 默认值必须取 settings.js 的 DEFAULTS 快照，**不能**现读 GLYPH.colorMode。
     * 因为 applyToConfig() 会把 state 写回 config，用户改过着色之后
     * GLYPH.colorMode 就已经是"当前值"了 —— 拿它当默认值会让这个字段
     * 永远进不了 URL（深链丢着色，实测踩到过，详见 settings.js 的 DEFAULTS 注释）。 */
    return encodeState(stateToHashInput({
      ...settings.state,
      node: nodeId || undefined,
    }, DEFAULTS))
  }

  if (urlState.version) {
    const merged = mergeState(settings.state, urlState)
    const changed = settings.applyState(merged)
    console.log(
      `[公式诗云] 从地址栏恢复状态：#${hashIn.replace(/^#/, '')}` +
      `（形态${changed.shape ? '已改' : '不变'}，` +
      `着色${changed.colorMode ? '已改' : '不变'}，` +
      `取景${changed.view ? '已改' : '不变'}）`,
    )
  }
  /* ── 1. 装配图谱（纯数据） ── */
  const graph = buildGraph()
  // 证明内容独立存放，按稳定 id 作为渐进增强附加到运行时节点；
  // 旧数据文件仍然只需提供 summary/detail，three.js 不读取 proof 字段。
  for (const node of graph.nodes) {
    const proof = getProof(node.id)
    if (proof) node.proof = proof
  }
  console.log(
    `[公式诗云] ${graph.stats.nodeCount} 个公式 · ` +
    `${graph.stats.linkCount} 条关联 · 平均度数 ${graph.stats.avgDegree} · ` +
    `重要度区间 ${graph.stats.impRange}`,
  )

  /* ── 2. 界面 ── */
  let proofView = null
  const ui = createUI(graph, {
    // 详情面板里点"关联知识"里的另一个公式 → 跳过去。
    // ⚠ 必须走 scene.select()，不能只调 focusOn+showDetail ——
    //   否则公式换了但关联弧线还停在原来那个上（之前就是这个 bug）。
    onFocus(id) {
      scene.select(id, { pushHistory: true })
    },
    onClose() {
      // 面板被 Esc / 关闭按钮收起 → 连线收起 + 恢复自转 + 相机回到初始机位。
      // ⚠ 这里不能再调 scene.select(null)：它会调 ui.hideDetail() → onClose，
      //   变成无限递归。走专门的 deselectFromPanel()，它只清状态不碰面板。
      scene.deselectFromPanel()
    },
    onProof(id) {
      if (!proofView) return
      /* Preserve the current nebula entry before replacing it with the first
       * proof route. This makes browser Back return to the exact star-map
       * state that opened the reader. Dependency hops use pushState below. */
      if (!proofView.currentId) {
        try { history.pushState(history.state, '', location.href) } catch { /* file:// fallback */ }
      }
      proofView.open(id)
    },
  })

  /* ── 3. 场景（先建，让背景星云立刻可见） ── */
  const scene = createScene(canvas, graph, ui)

  /* ── 4. 烘焙公式贴图 ── */
  const items = graph.nodes.map((n) => ({ id: n.id, latex: n.latex, name: n.name }))
  /* 分阶段计时。全部写进 #diag，理由有两条：
   *   ① 烘焙是本项目**最大的单项成本**（串行 MathJax，几分钟），
   *      出问题时第一件想知道的就是"卡在哪一步"；
   *   ② `scripts/probe-perf.mjs` 要报告真实数字，而不是靠人估。
   * 用 performance.now() 而不是 Date.now()：它单调、不受系统时钟调整影响。 */
  const stage = {}
  const mark = (k, t0) => { stage[k] = Math.round(performance.now() - t0) }

  /* 流水线深度可由 URL 覆盖：?lookahead=1 就是原来的纯串行行为。
   * 留这个开关是为了**能做对照实验** —— scripts/bench-bake.mjs 靠它
   * 在同一个浏览器、同一次会话里连续跑两种深度，比换构建再比可靠得多。
   * 默认值在 formulaTexture.js 里（8）。 */
  const laParam = Number(new URLSearchParams(location.search).get('lookahead'))
  const bakeOpts = { textureScale: GLYPH.textureScale }
  if (Number.isFinite(laParam) && laParam >= 1) bakeOpts.lookahead = laParam

  const tBake = performance.now()
  const baked = await bakeAll(items, (done, total, label) => {
    ui.setProgress(done, total, label)
  }, bakeOpts)
  mark('bake', tBake)

  /* ── 5. 布局 ──
   * 必须放在烘焙之后：只有拿到每个公式真实的宽高比，
   * 才能做"面积归一化"，让大小真的由重要度决定，
   * 防重叠的球半径也才知道该取多大。 */
  /* ⚠ 已知问题（未修复）：启动时 layoutGraph 实测 16-18s，
   *   但页面 ready 后重跑同一份数据只要 3.6s —— 差 4.5 倍。
   *
   *   已排除七种假设：JIT 冷启动、GC、堆压力、await、rAF 抢占、
   *   baked 结构、节点字段状态。详见 designs/NEBULA-PLUS-PERF.md。
   *
   *   试过「小规模热身」作为缓解：实测无效（16,767 → 17,451ms），
   *   已移除，不留无效代码。
   *
   *   下一步方向：用 CDP Profiler.start 抓启动期真实 CPU profile
   *   （不是靠差分猜测），或改用 Worker 跑布局。 */
  const tLayout = performance.now()

  /* ── JIT Warmup: Pre-run layout on 10% sample to optimize hot paths ──
   * First execution suffers 4.5× slowdown due to cold JIT.
   * Running a small warmup batch triggers V8's TurboFan optimizer
   * so the full layout runs on optimized code. */
  if (graph.nodes.length > 50) {
    const sampleSize = Math.floor(graph.nodes.length * 0.10)
    const warmupNodes = graph.nodes.slice(0, sampleSize)
    const warmupBaked = new Map()
    for (const n of warmupNodes) {
      const b = baked.get(n.id)
      if (b) warmupBaked.set(n.id, b)
    }
    // Warmup run - discard result, only want JIT side effect
    layoutGraph({ ...graph, nodes: warmupNodes }, warmupBaked)
  }

  const layoutInfo = layoutGraph(graph, baked)
  mark('layout', tLayout)
  console.log(
    `[公式诗云] 布局完成，平均特征尺寸 ${layoutInfo.avgSize.toFixed(1)}，` +
    `盘面松弛 ${layoutInfo.relaxRounds} 轮`,
  )

  /* ── 5b. 按真实范围校正取景 ──
   * createScene() 跑在布局之前，只能按配置的 radiusOuter 估个机位；
   * 这里拿到松弛后的真实盘半径，把相机摆到"整盘恰好入画"的位置。
   *
   * ⚠ 盘半径只统计**主星系**的节点。星团在 `CLUSTER.center = [255,0,-140]`，
   *   若把它的坐标也算进来（到原点约 291），"盘半径"会变成 291 而相机拉远，
   *   于是默认视图里主星系的公式字高会腰斩 —— 那正是本项目一直在
   *   对抗的事。星团的取景由 setView('overview') 单独处理（见 scene.js）。 */
  const diskR = graph.nodes.reduce(
    (m, n) => (n.cluster ? m : Math.max(m, Math.hypot(n.pos.x, n.pos.z))),
    LAYOUT.radiusOuter)
  const camDist = scene.fitCamera(diskR)
  console.log(`[公式诗云] 盘半径 ${diskR.toFixed(0)}，相机距离 ${camDist.toFixed(0)}`)

  /* ── 6. 建节点 ── */
  const tNodes = performance.now()
  const built = scene.buildNodes(baked)
  mark('buildNodes', tNodes)
  console.log(
    `[公式诗云] 成功渲染 ${built} / ${items.length} 个公式` +
    `（主星系 ${graph.stats.galaxyCount} + 猜想星团 ${graph.stats.conjCount}）`,
  )

  /* ── 6b. 形态切换：重新布局 + 重建精灵 ──
   *
   * 为什么必须整层重建而不能"就地改位置"：
   *   ① 半径/角度是 layoutGraph() 一次性算好的，松弛是无状态的批量过程；
   *   ② 精灵的几何尺寸依赖 n.width/n.height（重排后 maxWidth 夹取可能变），
   *      就地改 position 会留下尺寸不一致的旧平面。
   * 贴图（baked）**不重新烘焙** —— 公式没变，只有位置变了，
   * 所以重排一次大约只有几十毫秒（不涉及 MathJax）。
   */
  function rebuildLayout() {
    const t0 = performance.now()

    // 关掉详情面板：重排后原来的选中位置已经不对了
    scene.select(null)

    layoutGraph(graph, baked)
    const r = graph.nodes.reduce(
      (m, n) => (n.cluster ? m : Math.max(m, Math.hypot(n.pos.x, n.pos.z))),
      LAYOUT.radiusOuter)

    scene.rebuildNodes(baked)     // 重建精灵（贴图复用）
    // 重新取景时按**当前视图**走，否则在"只看星团"下切形态会把相机
    // 拉回主星系（那里现在什么都没有）。
    scene.setView(settings.state.view)
    if (settings.state.view === 'overview' || settings.state.view === 'galaxy') {
      scene.fitCamera(r)
    }
    scene.setShape(settings.shape)   // 背景星云的旋臂骨架跟着换

    console.log(
      `[公式诗云] 形态切换 → ${SHAPES[settings.shape].name}` +
      `（盘半径 ${r.toFixed(0)}，用时 ${(performance.now() - t0).toFixed(0)}ms）`,
    )
  }
  scene.setShape(settings.shape)

  /* ── 6c. 应用存档里的取景 ──
   * 必须在建节点之后：setView 会按可见内容重新取景，
   * 而可见性依赖 clusterGroup 已经建好。 */
  scene.setView(settings.state.view)

  /* ── 6d. 地址栏 ↔ 状态 双向同步 ──
   *
   * 写回策略：用 replaceState 而不是 pushState。
   *
   * ⚠ 这一条是**刻意的**，值得说明：如果每次选中都 pushState，
   *   用户在星系里连点五个公式，浏览器历史里就多了五条 ——
   *   他按"后退"想回到上一个页面，结果只是回到上一个公式，
   *   要点五次才能真正离开。而拖拽/缩放这类操作根本不进历史，
   *   于是历史记录会变成一串毫无规律的点选。
   *   replaceState 则让地址栏**始终**反映当前画面（可以随时复制分享），
   *   但不会污染后退键的语义。分享链接这个目标已经达到了 ——
   *   用户要的是"复制当前地址"，而不是"能后退回上一个公式"。
   *
   * 只在**真正变化**时写（hashEquals 做语义比较，顺序不同不算变化），
   * 否则每帧或每次重着色都会产生一次无谓的 history.replaceState。 */
  let lastHash = location.hash
  let lastSearch = location.search
  let activeProofId = urlState.proof && graph.byId.has(urlState.proof)
    ? urlState.proof : null
  let proofTrail = activeProofId ? [activeProofId] : []
  if (urlState.proof && !activeProofId) {
    console.warn(`[公式诗云] 证明页深链里的节点不存在：${urlState.proof}（数据可能已变更）`)
  }
  let applyingLocation = false
  let suppressRouteWrite = false

  /** 更新证明 query 与星云 hash，默认 replace；页面跳转可压入一条浏览器历史。 */
  function writeLocationState(proofId = activeProofId, { push = false, trail = proofTrail } = {}) {
    const nextHash = buildHash(scene.selection)
    let nextSearch = ''
    try {
      const params = new URLSearchParams(location.search)
      params.delete('p')
      if (typeof proofId === 'string' && proofId) params.set('p', proofId)
      const encoded = params.toString()
      nextSearch = encoded ? `?${encoded}` : ''
    } catch {
      nextSearch = location.search || ''
    }
    const hash = `#${nextHash}`
    lastHash = hash
    lastSearch = nextSearch
    const url = location.pathname + nextSearch + hash
    const current = location.pathname + location.search + location.hash
    if (url === current) return
    try {
      const previousState = history.state && typeof history.state === 'object' ? history.state : {}
      const state = {
        ...previousState,
        formulaNebula: { ...(previousState.formulaNebula || {}), proofTrail: [...trail] },
      }
      if (push) history.pushState(state, '', url)
      else history.replaceState(state, '', url)
    } catch {
      // file:// 或受限沙箱不允许 history API 时，用完整地址替换当前页，
      // 保留 query 中的 proof id 与设置 hash；只改 hash 会丢证明路由。
      try { location.replace(url) } catch {
        try { location.hash = nextHash } catch { /* 地址栏不可写不影响主功能 */ }
      }
    }
  }

  function syncUrl() {
    if (suppressRouteWrite) return
    writeLocationState(activeProofId)
  }

  function returnToGalaxy(id) {
    const node = id && graph.byId.get(id)
    activeProofId = null
    proofTrail = []
    proofView.hide()
    if (!node) {
      writeLocationState(null, { trail: [] })
      return
    }
    scene.setProofContextFocus?.(id)
    const view = settings.state.view
    if ((view === 'galaxy' && node.cluster) || (view === 'cluster' && !node.cluster)) {
      settings.setView('overview')
    }
    scene.select(id, { pushHistory: false })
  }

  proofView = createProofView({
    graph,
    onNavigate(id, detail = {}) {
      if (!graph.byId.has(id)) return
      if (detail.navigationType === 'back') {
        proofTrail = proofTrail.slice(0, -1)
        if (!proofTrail.length || proofTrail.at(-1) !== id) proofTrail = [id]
      } else if (detail.navigationType === 'breadcrumb') {
        const index = proofTrail.lastIndexOf(id)
        proofTrail = index >= 0 ? proofTrail.slice(0, index + 1) : [id]
      } else if (detail.pushHistory && detail.from) {
        if (proofTrail.at(-1) !== detail.from) proofTrail = [...proofTrail, detail.from]
        proofTrail.push(id)
      } else if (proofTrail.at(-1) !== id) {
        proofTrail = [id]
      }
      activeProofId = id
      proofView.setHistory(proofTrail.slice(0, -1))
      /* 证明页的依赖跳转也同步星云底层选中态，返回星云时焦点与关联高亮
       * 已经对准当前命题；silent 避免把“证明页内导航”误判成新节点点击。 */
      if (scene.selection !== id) scene.select(id, { pushHistory: false, silent: true })
      scene.setProofContextFocus?.(id)
      writeLocationState(id, {
        push: detail.navigationType !== 'back',
        trail: proofTrail,
      })
    },
    onBack(id) {
      returnToGalaxy(id)
    },
    onGalaxy(id) {
      returnToGalaxy(id)
    },
    onHide() {
      if (applyingLocation || !activeProofId) return
      activeProofId = null
      proofTrail = []
      writeLocationState(null, { trail: [] })
    },
  })
  proofView.mount()

  // 选中变化 → 写 URL（scene 内部点击拾取也会走到这里，见 scene.onSelection）
  scene.onSelection(() => syncUrl())
  // 形态 / 着色 / 取景变化 → 也写 URL
  settings.onRebuild(() => syncUrl())
  settings.onRecolor(() => syncUrl())
  settings.onView(() => syncUrl())

  // 浏览器后退/前进或用户手改 hash → 反过来应用（只处理节点，其余字段
  // 变化很罕见且会触发重排，为简洁只同步"选中"这一项）
  function applyLocationState() {
    if (location.hash === lastHash && location.search === lastSearch) return
    lastHash = location.hash
    lastSearch = location.search
    const st = decodeLocationState(location.search, location.hash)
    applyingLocation = true
    suppressRouteWrite = true
    const proofId = st.proof && graph.byId.has(st.proof) ? st.proof : null
    if (proofId) {
      activeProofId = proofId
      const savedTrail = history.state?.formulaNebula?.proofTrail
      proofTrail = Array.isArray(savedTrail) && savedTrail.at(-1) === proofId
        ? [...savedTrail] : [proofId]
      proofView.setHistory(proofTrail.slice(0, -1))
      scene.select(proofId, { pushHistory: false, silent: true })
      scene.setProofContextFocus?.(proofId)
      proofView.open(proofId, { pushHistory: false, notify: false })
    } else {
      activeProofId = null
      proofTrail = []
      proofView.setHistory([])
      if (proofView.currentId) proofView.hide()
      if (st.node && graph.byId.has(st.node)) {
        scene.select(st.node, { pushHistory: false, silent: true })
      } else if (!st.node && scene.selection) {
        scene.select(null, { silent: true })
      }
    }
    suppressRouteWrite = false
    applyingLocation = false
  }
  window.addEventListener('hashchange', applyLocationState)
  window.addEventListener('popstate', applyLocationState)
  /* 首次同步：把从 URL 恢复出来的取景/着色写正。
   *
   * ⚠ 若 URL 里带着要选中的节点（urlState.node），这里**先不写**：
   *   此刻还没选中任何东西，写出来会把 `n=` 洗掉，等 9b 选中后
   *   再写一次才完整。省掉一次中途的 replaceState，也避免地址栏
   *   出现"节点闪一下又回来"的观感。 */
  if (!urlState.node && !activeProofId) syncUrl()

  /* ── 7. 诊断信息写进 DOM，便于自动化验证 ── */
  const diag = document.createElement('div')
  diag.id = 'diag'
  diag.style.display = 'none'
  const failed = items.length - built
  const gl = scene.renderer.getContext()
  diag.textContent = JSON.stringify({
    nodes: graph.stats.nodeCount,
    links: graph.stats.linkCount,
    galaxy: graph.stats.galaxyCount,
    conjectures: graph.stats.conjCount,
    researchers: graph.stats.researcherCount,
    crossLinks: graph.stats.crossLinks,
    built,
    failed,
    errors: baked.errors || [],
    avgDegree: graph.stats.avgDegree,
    impRange: graph.stats.impRange,
    conjRange: graph.stats.conjRange,
    view: scene.view,
    /* 各阶段耗时（毫秒）。bake 是串行 MathJax，占绝对大头；
     * 其余三项都是几十毫秒量级。 */
    ms: stage,
    renderer: gl.getParameter(gl.VERSION),
    maxTexture: gl.getParameter(gl.MAX_TEXTURE_SIZE),
  })
  document.body.appendChild(diag)

  /* ── 8. 设置面板 ──
   * 分几组呈现：
   *   · 形态               —— 需要重排，走 rebuildLayout()
   *   · 取景               —— 只重新取景，不重排
   *   · 着色 / 参数 / 显示层 —— 立即生效
   */
  const panel = createSettingsPanel({
    onShapeChange() { rebuildLayout() },
    // 着色模式不用在这里处理：settings.setColorMode 会触发 onRecolor，
    // 下面那条订阅链统一负责重新着色 + 刷新图例。放在这里会做两遍。
    // 取景同理，走 onView。这里的回调只用于面板上显示统计数字。
    stats: () => ({
      galaxy: graph.stats.galaxyCount,
      conj: graph.stats.conjCount,
      researchers: graph.stats.researcherCount,
      links: graph.stats.linkCount,
      cross: graph.stats.crossLinks,
    }),
  })
  // 面板初始状态要反映 localStorage 里读出来的存档
  panel.sync()

  // 一般设置变化：立刻应用到场景
  settings.subscribe(() => {
    scene.applySettings()
    scene.setDisplay('links', settings.state.display.links)
    scene.setDisplay('linkTypes', settings.state.display.linkTypes)
    scene.setDisplay('nebula', settings.state.display.nebula)
    scene.setDisplay('stars', settings.state.display.stars)
    scene.setDisplay('disc', settings.state.display.disc)
    scene.setDisplay('bloom', settings.state.display.bloom)
    scene.setDisplay('autoRotate', settings.state.display.autoRotate)
    scene.setDisplay('cluster', settings.state.display.cluster)
    scene.setDisplay('clusterHalo', settings.state.display.clusterHalo)
    scene.setDisplay('markers', settings.state.display.markers)
    scene.setDisplay('researchers', settings.state.display.researchers)
    document.getElementById('legend')?.style.setProperty(
      'display', settings.state.display.legend ? '' : 'none')
  })

  // 形态变化：需要重排（代价大，单独一条订阅链）
  settings.onRebuild(() => rebuildLayout())

  // 取景变化：只重新取景（隐藏另一侧 + 调整相机），不重排、不重着色
  settings.onView(() => { scene.setView(settings.state.view) })

  // 着色模式变化：就地重新着色（不重排、不重建几何）
  settings.onRecolor(() => {
    scene.recolor()
    ui.refreshLegend?.()
  })

  // 先按存档同步一次全部开关（localStorage 里的选择要立刻体现在画面上）
  scene.applySettings()
  scene.setDisplay('links', settings.state.display.links)
  scene.setDisplay('linkTypes', settings.state.display.linkTypes)
  scene.setDisplay('nebula', settings.state.display.nebula)
  scene.setDisplay('stars', settings.state.display.stars)
  scene.setDisplay('disc', settings.state.display.disc)
  scene.setDisplay('bloom', settings.state.display.bloom)
  scene.setDisplay('autoRotate', settings.state.display.autoRotate)
  scene.setDisplay('cluster', settings.state.display.cluster)
  scene.setDisplay('clusterHalo', settings.state.display.clusterHalo)
  scene.setDisplay('markers', settings.state.display.markers)
  scene.setDisplay('researchers', settings.state.display.researchers)
  document.getElementById('legend')?.style.setProperty(
    'display', settings.state.display.legend ? '' : 'none')
  panel.refreshStats()

  /* ── 9. 起飞 ── */
  ui.finishLoading()
  scene.start()

  /* ── 9a. 统一调试句柄 window.__design（四个设计稿的公共验收契约） ──
   * 必须等 scene.start() 之后：select() 会触发 focusOn()，而聚焦是在渲染
   * 循环里逐帧逼近的，循环没跑起来时选中不会对焦。
   * 原版只有 window.__nebula（下面那个），验收器不认，所以这里补一层适配。 */
  {
    const api = createDesignApi({ graph, scene, settings, baked, ui })
    window.__design = api
    /* ready 要等真正出画：两个 rAF 之后再置位，与另外三个方案一致 */
    requestAnimationFrame(() => requestAnimationFrame(() => {
      api.ready = true
      api.readyMs = Math.round(performance.now())
    }))
  }

  /* ── 9b. 深链里的选中节点 ──
   *
   * ⚠ 时机很关键：必须等 scene.start() 之后。
   *   选中会触发 focusOn()，而聚焦是**在渲染循环里**逐帧逼近的
   *   （见 scene.js 的 updateFocus）—— 循环没跑起来时设置聚焦目标，
   *   相机不会动，用户看到的是一个没有对焦的画面。
   *
   * ⚠ 这里**不能**传 silent: true。我第一版传了，理由是"URL 本来就是
   *   从这里来的，不用再写回去"—— 那是错的：6d 里的 syncUrl() 在这之前
   *   已经跑过一次，那时还没选中任何节点，于是地址栏被规范化成
   *   只有 `#v1&w=cluster`，`n=` 被洗掉了。而 silent:true 又抑制了
   *   这次本该把 n= 写回来的回调，结果地址栏**永远丢失节点**，
   *   用户复制到的链接打不开同一个公式。（verify-integration.mjs ⑨ 抓到。）
   *
   *   不传 silent 是安全的：syncUrl 用字符串比较挡重复写，
   *   而且写的是 replaceState，不会多压历史记录。 */
  if (urlState.proof && graph.byId.has(urlState.proof)) {
    const n = graph.byId.get(urlState.proof)
    activeProofId = n.id
    proofTrail = [n.id]
    proofView.setHistory([])
    scene.select(n.id, { pushHistory: false, silent: true })
    scene.setProofContextFocus?.(n.id)
    proofView.open(n.id, { pushHistory: false, notify: false })
    syncUrl()
    console.log(`[公式诗云] 证明页深链直达：${n.name}`)
  } else if (urlState.node && graph.byId.has(urlState.node)) {
    const n = graph.byId.get(urlState.node)
    scene.select(urlState.node, { pushHistory: false })
    console.log(`[公式诗云] 深链直达：${n.name}`)
  } else if (urlState.node) {
    // 链接里的 id 在当前数据里不存在（数据改过、链接拼错、或来自别的版本）。
    // 不静默吞掉 —— 这解释起来很麻烦，不如直接说清楚。
    console.warn(`[公式诗云] 深链里的节点不存在：${urlState.node}（数据可能已变更）`)
  }

  // 调试用：控制台里可以直接访问
  window.__nebula = {
    graph, scene, ui, proofView, baked, settings, panel, rebuildLayout,
    proofData: { getProof, getProofCount },
    url: { decodeState, encodeState, stateToHashInput, hashEquals, syncUrl, buildHash },
    /* 纯函数模块也挂上来：验证脚本要在**真实页面**里调用它们，
     * 以证明它们不只是"能在 Node 里跑"，而是真的被构建进来了。
     * 顺带也方便在控制台里手工试用。 */
    exportView, graphQuery, linkTypes, proofRouter,
    /* 进展年份也挂上来。
     *
     * ⚠ 验证脚本**不能**用 `import('/src/data/progress.js')` 去拿它：
     *   preview 服务器发的是打包后的 dist/，`/src/...` 这个路径根本不存在，
     *   动态 import 会抛 "Failed to fetch dynamically imported module"。
     *   必须从已经加载好的模块里取 —— 这也是"验证要在真实产物上做"的意思。 */
    progress,
    /* 连线悬停的自检探针。
     *
     * 为什么必须有它：连线拾取是纯屏幕空间的事，验证脚本没法从外面
     * "猜"出一条边此刻在屏幕上的哪个像素 —— 相机一直在自转。
     * 所以这里反过来做：**暴露**一个函数，让它自己找出当前悬停节点
     * 的某条边，用场景**同一个** projectToScreen 算出屏幕坐标并返回。
     * 脚本把鼠标移到那个坐标上，再检查提示框是否弹出。
     *
     * 这样验证的是真实路径（projectToScreen + pickEdge + showEdgeTip），
     * 而不是脚本自己重算一遍投影 —— 后者只能证明"我的公式和你的公式一样"。
     *
     * @returns {{x:number,y:number,edge:number,label:string}|{err:string}}
     */
    probeEdgeHover() {
      if (!scene.probeEdgeAim) return { err: 'scene 未暴露 probeEdgeAim' }
      /* ⚠ 必须把结果**拆成基本类型**再返回。
       * scene.probeEdgeAim() 返回的对象如果夹带了任何 three.js 对象
       * （或者 CDP 顺着引用链摸到了 scene / links），
       * Runtime.evaluate 的 returnByValue 会一路展开整张对象图，
       * 报 "Object reference chain is too long" —— 而且这个错在
       * 调用方看来像是"我的探针没实现"，很难查。 */
      const r = scene.probeEdgeAim()
      if (r.err) return { err: String(r.err) }
      return {
        x: Number(r.x), y: Number(r.y), edge: Number(r.edge),
        label: String(r.label || ''), type: String(r.type || ''),
        weight: Number(r.weight) || 0,
      }
    },
  }
}

main().catch((err) => {
  console.error('[公式诗云] 启动失败', err)
  const lbl = document.querySelector('#load .lbl')
  if (lbl) {
    lbl.textContent = '启动失败：' + (err && err.message ? err.message : err)
    lbl.style.color = '#ff8a8a'
  }
})
