/**
 * ═══════════════════════════════════════════════════════════════
 *  入口
 * ═══════════════════════════════════════════════════════════════
 *
 *  流程：装配知识图谱 → 排版并烘焙公式贴图（带进度）→ 启动场景
 */

import './style.css'
import { buildGraph, layoutGraph } from './graph.js'
import { loadGraphData, loadProofs, getLoadedProof, getLoadedProofCount } from './dataLoader.js'
import { bakeAll } from './formulaTexture.js'
import { createUI } from './ui.js'
import { createScene } from './scene.js'
import { createProofView } from './proofView.js'
import { GLYPH, LAYOUT, SHAPES } from './config.js'
import { settings, DEFAULTS } from './settings.js'
import { createSettingsPanel } from './settingsPanel.js'
import {
  decodeLocationState, decodeState, encodeState, mergeState, stateToHashInput, hashEquals,
} from './urlState.js'
import * as exportView from './exportView.js'
import * as graphQuery from './graphQuery.js'
import * as linkTypes from './linkTypes.js'
import * as progress from './data/progress.js'
import * as proofRouter from './proofRouter.js'
import { perfMonitor } from './performance.js'
import { initAccessibility } from './accessibility.js'
import { createTutorial } from './tutorial.js'
import { initMobileOptimizations, showPerformanceWarning, isMobile } from './mobileOptimization.js'
import { initAnalytics, showUsageInsights } from './analytics.js'

async function main() {
  const canvas = document.getElementById('scene')

  // ── 启动性能监控 ──
  perfMonitor.startPhase('total')
  perfMonitor.startMeasuring()

  // ── 集成 splash screen（如果存在） ──
  const splash = window.__splashControl
  if (splash) {
    splash.update(10, '加载配置...')
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
  // 数据现在放在 public/data/*.json，先加载再构建。
  //
  // 之前是 `const graph = buildGraph()` 一句话 —— 因为数据被静态 import 进了
  // 主 chunk，不加载完脚本就没有数据。改成 fetch 之后多了一次显式等待，
  // 但换来的是：那 ~6 MB 不再阻塞脚本本身的下载与执行。
  //
  // buildGraph() 仍然是同步的（20 多个调用点不受影响），只是必须先注入数据。
  if (splash) splash.update(12, '加载知识数据...')
  await loadGraphData((done, total, id) => {
    if (splash) splash.update(12 + Math.floor((done / total) * 8), `加载知识数据 ${done}/${total}（${id}）`)
  })

  if (splash) splash.update(15, '构建知识图谱...')
  perfMonitor.startPhase('buildGraph')

  const graph = buildGraph()
  // 证明内容**不再在启动时附加**。
  //
  // 原来这里对所有 4306 个节点调 getProof()，把 245 条长篇证明一次性挂到
  // 节点上 —— 这要求 main.js 静态 import 整个 proofs 目录（3.3 MB 源码），
  // 于是首屏无条件下载并解析它们，而绝大多数访客根本不会打开证明页。
  //
  // 现在证明数据改为首次打开证明页时 fetch（见 dataLoader.js 的 loadProofs），
  // 节点上的 proof 字段由 proofView 在渲染前按需填充。见 proofView.js 的
  // renderNode / openWithProof。

  perfMonitor.endPhase('buildGraph')

  console.log(
    `[公式诗云] ${graph.stats.nodeCount} 个公式 · ` +
    `${graph.stats.linkCount} 条关联 · 平均度数 ${graph.stats.avgDegree} · ` +
    `重要度区间 ${graph.stats.impRange}`,
  )

  /* ── 2. 界面 ── */
  if (splash) splash.update(20, '初始化界面...')
  perfMonitor.startPhase('createUI')

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

  perfMonitor.endPhase('createUI')

  /* ── 3. 场景（先建，让背景星云立刻可见） ── */
  if (splash) splash.update(25, '创建 3D 场景...')
  perfMonitor.startPhase('createScene')

  const scene = createScene(canvas, graph, ui)

  perfMonitor.endPhase('createScene')

  /* ── 4. 烘焙公式贴图 ── */
  if (splash) splash.update(30, '渲染数学公式...')
  perfMonitor.startPhase('bakeFormulas')

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

  /* ═══════════════ G6：两阶段烘焙 ═══════════════
   *
   * 问题：4306 个公式全量烘焙实测 81 秒，且 `await` 阻塞首屏 ——
   * 用户在这段时间里只看到一个进度条。
   *
   * 但「首屏可读」并不需要全部 4306 个。先烘一批**最重要的**，布局出图，
   * 用户马上就能开始看；剩下的在后台继续补。
   *
   * 为什么必须先烘一批再布局（而不能先布局）：
   *   `runRelax` 按 `n.width` 把节点推开 —— 位置直接依赖真实宽高比。
   *   用估算宽高比布局，等真实贴图到了位置就全错了。所以布局必须等到
   *   有一批真实尺寸可用。这也解释了为什么不能"先出图后布局"。
   *
   * 为什么这批是「按 importance 排序的前 N 个」而不是「视野内的」：
   *   布局之前还没有任何屏幕坐标，"视野内"无从判断。importance 高的节点
   *   分布在盘心与主旋臂，正是首屏最容易看到的部分，也符合这个项目
   *   「越中心越重要」的核心语义。
   *
   * 剩余的节点会在首帧之后继续烘焙，然后**就地替换**已成为真实尺寸的
   * 贴图（见后面的 scheduleRestBake）。
   */
  const FIRST_BATCH = (() => {
    // 可由 URL 覆盖，便于做对照实验；默认 160（约占总数的 3.7%）。
    const q = Number(new URLSearchParams(location.search).get('firstBatch'))
    return Number.isFinite(q) && q >= 1 ? q : 160
  })()

  /* 首阶段取哪些公式 —— **按族分层抽样**，不是简单取 importance 前 N。
   *
   * 为什么不能只按 importance 排：实测前 120 名里有 98 个是猜想、只有 9 个
   * 定理，首帧会只看到猜想星团，主星系几乎是空的。而 `verify:full-scene`
   * 抓不到这个 —— 它只数精灵数量，看不出"族是偏的"。
   *
   * 分层抽样保证每个族都有代表，且族内仍按 importance 降序（先拿重要的）。
   * 实测 160 个即可覆盖全部 10 个族（每族 3–29 个）。
   */
  const firstItems = (() => {
    const keyOf = (n) => (n.cluster ? 'conj' : n.researcher ? 'researcher' : n.family || 'other')
    const buckets = new Map()
    // 先按 importance 降序，保证每族内部也是重要的优先
    const sorted = [...items].sort((a, b) => {
      const na = graph.byId.get(a.id)
      const nb = graph.byId.get(b.id)
      return (nb?.importance ?? 0) - (na?.importance ?? 0)
    })
    for (const it of sorted) {
      const n = graph.byId.get(it.id)
      const k = keyOf(n || {})
      if (!buckets.has(k)) buckets.set(k, [])
      buckets.get(k).push(it)
    }

    const total = Math.min(FIRST_BATCH, items.length)
    const keys = [...buckets.keys()]
    const totalNodes = items.length
    // 按族规模比例分配，但每族至少 3 个（否则小族一张图都看不到）
    const alloc = new Map()
    let assigned = 0
    for (const k of keys) {
      const n = Math.max(3, Math.round((total * buckets.get(k).length) / totalNodes))
      alloc.set(k, n)
      assigned += n
    }
    // 分配总和可能与 total 有偏差，等比缩放回去
    const scale = assigned > 0 ? total / assigned : 1
    const picked = []
    for (const k of keys) {
      const want = Math.max(3, Math.round(alloc.get(k) * scale))
      picked.push(...buckets.get(k).slice(0, want))
    }
    return picked
  })()

  const firstIds = new Set(firstItems.map((it) => it.id))
  const restItems = items.filter((it) => !firstIds.has(it.id))

  if (splash) splash.update(30, `渲染核心公式 1/${Math.max(1, Math.ceil(items.length / Math.max(1, firstItems.length)))}...`)

  const bakedFirst = await bakeAll(firstItems, (done, total) => {
    ui.setProgress(done, total, '核心公式')
    if (splash) {
      const percent = 30 + Math.floor((done / total) * 20)
      splash.update(percent, `渲染核心公式 ${done}/${total}`)
    }
  }, bakeOpts)

  // 首阶段产物并入总表。之后后台补的会按 id 覆盖进来。
  const baked = bakedFirst
  mark('bakeFirst', tBake)

  try {
    window.__bootMarks = window.__bootMarks || {}
    window.__bootMarks.bakeFirst = Math.round(performance.now())
    window.__bakeFirstDoneAt = Math.round(performance.now())
  } catch {
    /* ignore */
  }

  /* 剩余公式在首帧之后继续烘焙。
   *
   * 刻意**不**用 await：它必须让出主线程，先让布局/建节点/出图跑完。
   * 每完成一个就替换对应节点的贴图尺寸，并触发一次增量重建。
   */
  function scheduleRestBake() {
    if (!restItems.length) {
      try {
        window.__bakeDoneAt = Math.round(performance.now())
        window.__bootMarks.bake = window.__bakeDoneAt
      } catch {
        /* ignore */
      }
      return
    }
    bakeAll(restItems, (done, total) => {
      // 后台烘焙用底部状态条提示，不挡视野
      ui.setProgress(done, total, '后台渲染')
    }, bakeOpts)
      .then((rest) => {
        // 合并：首阶段 + 剩余，构成完整的 id -> 贴图映射
        for (const [id, v] of rest) baked.set(id, v)
        try {
          window.__bakeDoneAt = Math.round(performance.now())
          window.__bootMarks = window.__bootMarks || {}
          window.__bootMarks.bake = window.__bakeDoneAt
        } catch {
          /* ignore */
        }
        // 用完整贴图重新布局并重建精灵，让后补的节点尺寸与位置正确
        try {
          layoutGraph(graph, baked)
          scene.rebuildNodes(baked)
        } catch (e) {
          console.warn('[公式诗云] 后台补全后重建失败（不影响已出图的场景）', e)
        }
      })
      .catch((e) => {
        console.warn('[公式诗云] 后台烘焙失败，场景停留在核心公式版本', e)
      })
  }

  /* ── 5. 布局 ──
   * 必须放在烘焙之后：只有拿到每个公式真实的宽高比，
   * 才能做"面积归一化"，让大小真的由重要度决定，
   * 防重叠的球半径也才知道该取多大。 */
  if (splash) splash.update(75, '布局知识图谱...')

  const tLayout = performance.now()
  // 首帧用 fast 模式：跳过松弛，只做解析布局。
  //
  // 松弛是 O(n² × iters)，在无头软件渲染下实测占首帧路径 30 秒；
  // 解析布局本身只要 22ms。代价是重叠变多、半径次序略松
  // （rank/radius Spearman 从 −0.967 降到 −0.907）—— 对首帧可以接受。
  //
  // 后台补全完成后会用**完整模式**重排一次（见 scheduleRestBake），
  // 所以用户最终看到的是经过松弛的正确布局，只是先看到了一个粗糙版本。
  const layoutInfo = layoutGraph(graph, baked, { fast: true })
  try { window.__bootMarks = window.__bootMarks || {}; window.__bootMarks.layout = Math.round(performance.now()) } catch { /* ignore */ }
  mark('layout', tLayout)

  perfMonitor.endPhase('bakeFormulas')

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
  if (splash) splash.update(85, '构建星云节点...')
  perfMonitor.startPhase('buildNodes')

  const tNodes = performance.now()
  const built = scene.buildNodes(baked)
  try { window.__bootMarks = window.__bootMarks || {}; window.__bootMarks.buildNodes = Math.round(performance.now()) } catch { /* ignore */ }
  mark('buildNodes', tNodes)

  perfMonitor.endPhase('buildNodes')

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
    // Assigned in both branches below; the initial value was dead.
    let nextSearch
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
    /* 证明数据按需加载：首次打开证明页时才 fetch proofs.json，
     * 之后从缓存取。返回 Promise<proof|null>，proofView 会在数据到位后
     * 自动重渲染同一节点。 */
    async loadProof(id) {
      const proofs = await loadProofs()
      return proofs[id] ?? null
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
  //
  // `force` 供首帧使用：lastHash/lastSearch 在本函数定义之前（初始化早期）
  // 就被设成了当前地址，所以首帧调用必然命中下面的"没变化"短路，深链
  // `?p=<id>` 于是永远打不开。
  function applyLocationState({ force = false } = {}) {
    if (!force && location.hash === lastHash && location.search === lastSearch) return
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
  // Listeners must not pass the Event object through: applyLocationState now
  // destructures an options bag, and an Event has no `force` property — which
  // happens to be fine, but wrapping keeps the intent explicit.
  window.addEventListener('hashchange', () => applyLocationState())
  window.addEventListener('popstate', () => applyLocationState())

  /* 首帧路由：URL 里若带 ?p=<id>（或 #k=<id>），启动时就该直接打开证明页。
   *
   * 之前 applyLocationState 只挂在 hashchange/popstate 上，启动时从不调用，
   * 于是 `/?p=flat-morphism` 打开后停在星云界面——深链只有用户手动改地址栏
   * （触发事件）才会生效。
   *
   * 必须传 force：lastHash/lastSearch 在初始化早期就已是当前地址，
   * 不绕过"没变化"短路的话首帧调用会在第一行直接 return。
   * suppressRouteWrite 由函数内部自己开关，不会把首帧状态写回地址栏。 */
  if (urlState.proof || urlState.node) applyLocationState({ force: true })

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
  try { window.__bootMarks = window.__bootMarks || {}; window.__bootMarks.finishLoading = Math.round(performance.now()) } catch { /* ignore */ }
  scene.start()
  try {
    window.__bootMarks = window.__bootMarks || {}
    window.__bootMarks.sceneStart = Math.round(performance.now())
  } catch {
    /* ignore */
  }

  perfMonitor.endPhase('total')

  // 隐藏 splash screen
  if (splash) {
    splash.update(95, '完成！')
    setTimeout(() => {
      splash.hide()
      // ── G6 的测量点 ──
      //
      // 这是"用户第一次真正看到星云"的时刻：splash 开始淡出、背后的画布
      // 亮出来。必须在这里记，不能靠外部探测 —— 前几轮用 CDP 轮询
      // getComputedStyle(#splash).display，反复测不到，因为 hide() 自身还有
      // 300ms + 500ms 两层 setTimeout 才把 display 设为 none，而探测脚本
      // 往往在更早的 __nebula 出现时就 break 了。
      //
      // 在应用内部记录则没有这个时序问题：这一行执行时就是首帧可见的时刻。
      try {
        window.__firstUsableAt = Math.round(performance.now())
      } catch {
        /* 无 window 时忽略（Node 侧不会走到这里） */
      }
      // 首帧已经出来了 —— 现在才启动剩余公式的后台烘焙。
      // 放在这里而不是更早，是为了确保后台任务不跟首帧抢主线程。
      scheduleRestBake()
    }, 200)
  } else {
    // 没有 splash（例如被外部禁用）时也要启动后台补全，否则永远只有核心公式
    scheduleRestBake()
  }

  // Log performance report to console
  console.group('🚀 Formula Nebula 启动完成')
  perfMonitor.logReport()
  console.groupEnd()

  // Initialize accessibility enhancements
  initAccessibility()

  // Initialize mobile optimizations if on mobile
  const mobileGestures = initMobileOptimizations(scene, settings)
  if (mobileGestures || isMobile()) {
    showPerformanceWarning()
  }

  // Initialize privacy-friendly analytics
  const analytics = initAnalytics(scene, ui, settings)

  // Show usage insights for returning users (after 3+ visits)
  if (analytics.data.visits >= 3) {
    setTimeout(() => showUsageInsights(analytics), 3000)
  }

  // Start interactive tutorial for first-time users.
  // Pass live stats so the intro text quotes what is actually on screen.
  createTutorial(scene, ui, true, graph.stats)

  // Expose performance API to window for debugging
  window.__formulaNebula = window.__formulaNebula || {}
  Object.assign(window.__formulaNebula, {
    perfMonitor,
    getSummary: () => perfMonitor.getSummary(),
    getMemory: () => perfMonitor.getMemoryInfo(),
    graph,
    scene,
    settings,
    mobileGestures,
  })

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
    proofData: {
      // 证明数据现在是按需加载的：这两个函数在数据加载前返回空，加载后
      // 才给出真实值。验证脚本若需要完整证明，应先 await loadProofs()。
      getProof: (id) => getLoadedProof(id),
      getProofCount: () => getLoadedProofCount(),
      loadProofs,
    },
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
