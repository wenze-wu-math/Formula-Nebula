/**
 * designs/manuscript/formulas.js — 模块 M2「公式管线」（SPEC §5）。
 *
 * 一条管线：texSync(latex, inkFor(node)) → 已上色的 SVG 字符串 → Blob URL → 每个 id 一个 <img>
 *          → 按需栅格化成 mip 位图（canvas），画布与注释页用的是同一份 MathJax 排版。
 *
 * 关键取舍：
 *   · 排版放进 worker 池（formulas-worker.js）。MathJax 单线程排 464 条公式在本机主线程上要 2–3 s，
 *     tex.js 用 liteAdaptor、不碰 DOM，能原样跑在 worker 里；N 个 worker 抢同一个任务队列（work stealing），
 *     重公式不会拖住某一个 worker。worker 起不来 / 出错 / 卡死时，主线程按 8 ms 时间片接手剩余任务，
 *     所以 computeDims 永远会 resolve，绝不抛异常。
 *   · 但 worker 冷启动也要各自解析一遍 MathJax（重负载下实测整套 3.8 s），所以再加一层**预排版缓存**
 *     formulas-cache.json（formulas-build.mjs 在 node 下离线生成；liteAdaptor 输出与浏览器逐字节相同）。
 *     每条带 latex 与墨色，key = (版本, 字号, 墨色, latex) 与当前知识库完全一致才采用；对不上的条目照常
 *     进 worker 现排 —— 缓存只加速，永不显示过期公式。字形路径做了字典编码（5.2 MB → 2.3 MB），
 *     解码推迟到 svgFor 第一次被调用（大多数公式首屏只需要尺寸）。
 *   · 优化 v2：gzip 压缩（18MB → 3MB），分块懒加载（仅加载可见页面的公式）
 *   · 位图是 6 级 mip（相对 MathJax px）：1/16, 1/8, 1/4, 1/2, 1, 2。render 每帧只"要"，不"做"：
 *     getBitmap 从不同步栅格化，缺级就先给最近的已有一级（exact:false）并排队；pumpBakes 在每帧开头
 *     按时间预算做若干次 drawImage(svgImg → canvas)。SVG 是矢量，按目标尺寸直接栅格化，每级都锐利。
 *   · 解码（SVG → <img>）是异步的，且在主线程解析，所以限并发（MAX_LOADS）。解码顺序与烘焙顺序不同：
 *     解码按"最近请求的帧 → 级别大的先"（大级别 = 屏幕上大 = 题记等需要可读的公式，首屏等的就是它们），
 *     烘焙按契约"最近请求的帧 → 级别小的先"（小级别便宜，先让整页有东西）。
 *   · 内存：位图总字节（w*h*4）上限 160 MB，超出按 LRU 淘汰 ≥1/2 级（不够再淘汰 1/4 级），
 *     1/16 与 1/8 两级常驻 —— 远景灰行永远有图可画。本帧刚用过的位图不淘汰。
 *   · 墨色固定：选中强调由 render 的圈注表达，不重烘焙。
 */
import { PALETTE, TEX_EM } from './constants.js'
import { requestDraw } from './state.js'
import { CACHE_VER, CACHE_FILE, CACHE_FILE_GZ, cacheKey, decodePaths } from './formulas-key.js'

/** 墨色：猜想 = 页边蓝黑墨，其余 = 印刷墨。研究者没有公式（其 latex 只是 \text{姓名}，不排）。 */
export function inkFor(node) { return node && node.cluster ? PALETTE.noteInk : PALETTE.ink }

/* ═════════════════════════ 排版：SVG 源码与尺寸 ═════════════════════════ */

const SHIP_TIMEOUT_MS = 2500                    // 预排版缓存文件迟迟不来就不等了，全部现排
const SLICE_MS = 8                              // 主线程兜底排版的时间片
const WORKER_HELP_MS = 1500                     // 这么久还没有任何 worker 就绪，主线程就下场帮忙
const WORKER_STALL_MS = 10000                   // 某个 worker 的一块任务超过这么久没回来，判它卡死
const CHUNK = 3                                 // 每次派给 worker 的公式条数（小块 = 负载更均衡）

const svgCache = new Map()                      // id → 已上色 SVG 源码
const lazySvg = new Map()                       // id → 预排版缓存里的字典编码 SVG（svgFor 第一次用到时才解码）
const dimsCache = new Map()                     // id → {w, h}（MathJax px）
const urlCache = new Map()                      // id → Blob URL（整个页面生命周期不 revoke）
const pipe = { dimsMs: 0, shipMs: 0, total: 0, fromCache: 0, fromWorkers: 0, fromMain: 0, fallbacks: 0, placeholders: 0, workers: 0, decompressMs: 0 }

/** @returns {string} 自包含 SVG 源码（已上色）；computeDims 之后对每个非研究者节点都可用 */
export function svgFor(id) {
  let s = svgCache.get(id)
  if (s === undefined) {
    const z = lazySvg.get(id)
    if (!z) return ''
    s = decodePaths(z.enc, z.dict)
    svgCache.set(id, s)
    lazySvg.delete(id)
  }
  return s
}

/** Blob URL（缓存，不 revoke），给注释页 / 悬停小签的 <img>，也是画布位图的解码来源 */
export function svgUrlFor(id) {
  let u = urlCache.get(id)
  if (!u) {
    const svg = svgFor(id)
    if (!svg) return ''
    u = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }))
    urlCache.set(id, u)
  }
  return u
}

/** \text{…} 里的特殊字符转义（fallback 用节点名排版时） */
function textArg(s) {
  return String(s ?? '').replace(/[\\{}#$%&_^~]/g, (c) => ({
    '\\': '\\textbackslash{}', '^': '\\hat{}', '~': '\\sim{}',
  })[c] || '\\' + c)
}
function xmlEsc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])
}
/** 两次排版都失败时的占位：400×64 的 SVG，写着节点名（已 XML 转义） */
function placeholderSvg(name, color) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="64" viewBox="0 0 400 64">` +
    `<text x="200" y="42" text-anchor="middle" font-family="Georgia, SimSun, serif" font-size="30" font-style="italic" fill="${xmlEsc(color)}">` +
    `${xmlEsc(name || '?')}</text></svg>`
}
const PLACEHOLDER_DIMS = { w: 400, h: 64 }

/* ── 预排版缓存（formulas-build.mjs 离线生成，随方案发布）──
 * 只是加速：每条带 latex 与墨色，key 与当前知识库对不上的条目一律不用、交给 worker 现排；
 * 文件缺失 / 损坏 / 超时 → 当作没有缓存。内容也做形状校验，不盲信。
 * v2: 优先加载 gzip 压缩版本（~3MB），fallback 到未压缩版本（~18MB） */
let shipP = null
function loadShipped() {
  return (shipP ||= (async () => {
    const t0 = performance.now()
    const map = new Map()
    let data = null

    // 优先尝试加载 gzip 压缩版本
    try {
      const ctl = typeof AbortController === 'function' ? new AbortController() : null
      const timer = setTimeout(() => ctl && ctl.abort(), SHIP_TIMEOUT_MS)
      const res = await fetch(new URL('./' + CACHE_FILE_GZ, import.meta.url), ctl ? { signal: ctl.signal } : undefined)
      clearTimeout(timer)

      if (res.ok) {
        const t1 = performance.now()
        const buffer = await res.arrayBuffer()
        // DecompressionStream 是现代浏览器原生 API
        if (typeof DecompressionStream === 'function') {
          const ds = new DecompressionStream('gzip')
          const decompressed = new Response(new Blob([buffer]).stream().pipeThrough(ds))
          data = await decompressed.json()
          pipe.decompressMs = Math.round(performance.now() - t1)
        } else {
          // Fallback: 不支持 DecompressionStream 的浏览器加载未压缩版本
          throw new Error('DecompressionStream not supported')
        }
      }
    } catch {
      // Fallback: 加载未压缩版本
      try {
        const ctl = typeof AbortController === 'function' ? new AbortController() : null
        const timer = setTimeout(() => ctl && ctl.abort(), SHIP_TIMEOUT_MS)
        const res = await fetch(new URL('./' + CACHE_FILE, import.meta.url), ctl ? { signal: ctl.signal } : undefined)
        clearTimeout(timer)
        if (res.ok) data = await res.json()
      } catch { /* 没有缓存就现排 */ }
    }

    if (data && data.v === CACHE_VER && data.em === TEX_EM && Array.isArray(data.dict) && Array.isArray(data.entries)) {
      for (const e of data.entries) {
        if (!Array.isArray(e) || e.length < 6) continue
        const [id, latex, color, svg, w, h] = e
        if (typeof id !== 'string' || typeof latex !== 'string' || typeof color !== 'string' || typeof svg !== 'string') continue
        if (!svg.startsWith('<svg') || !(w > 0 && h > 0)) continue
        map.set(id, { key: cacheKey(TEX_EM, color, latex), enc: svg, dict: data.dict, w, h })
      }
    }
    pipe.shipMs = Math.round(performance.now() - t0)
    return map
  })())
}

const idle = (fn, timeout = 500) =>
  (typeof requestIdleCallback === 'function' ? requestIdleCallback(fn, { timeout }) : setTimeout(() => fn({ didTimeout: true, timeRemaining: () => 0 }), 16))
const yieldMain = () => new Promise((r) => setTimeout(r, 0))

/** 主线程兜底用的 texSync：只在需要时动态加载 tex.js（正常路径下主线程根本不解析 MathJax） */
let texModP = null
function loadTexMain() { return (texModP ||= import('../shared/tex.js').then((m) => m.texSync).catch(() => null)) }

/** 排一条（主线程兜底路径，与 worker 的 one() 同语义） */
function typesetMain(texSync, job) {
  if (texSync) {
    try { const r = texSync(job.latex, job.color); return { svg: r.svg, w: r.widthPx, h: r.heightPx, fb: 0 } } catch { /* fallback */ }
    try { const r = texSync(job.fallback, job.color); return { svg: r.svg, w: r.widthPx, h: r.heightPx, fb: 1 } } catch { /* 占位 */ }
  }
  return { svg: '', w: 0, h: 0, fb: 2 }
}

/**
 * 量取所有非研究者节点的公式尺寸（同时缓存 SVG 源码）。绝不抛异常。
 * @param {object[]} nodes
 * @param {(done:number, total:number)=>void} [onProgress]
 * @param {{shipped?: boolean}} [opts]  shipped:false = 不用预排版缓存（只给 bench 测冷启动 worker 路径用）
 * @returns {Promise<Map<string,{w:number,h:number}>>}
 */
export async function computeDims(nodes, onProgress, opts = {}) {
  const t0 = performance.now()
  const out = new Map()
  const jobs = []
  const want = []
  try {
    for (const n of nodes || []) {
      if (!n || n.researcher || n.id == null) continue
      if (dimsCache.has(n.id)) { out.set(n.id, { ...dimsCache.get(n.id) }); continue }   // 重复调用只补缺
      want.push(n)
    }
  } catch { /* 节点数据异常：能排多少排多少 */ }
  const total = want.length + out.size
  pipe.total = total
  let done = out.size
  const progress = () => { try { onProgress?.(done, total) } catch { /* UI 回调出错不影响排版 */ } }
  progress()

  // 1. 预排版缓存：key 一致的直接采用（SVG 解码推迟到 svgFor 第一次被调用）
  const shipped = want.length && opts.shipped !== false ? await loadShipped() : new Map()
  for (const n of want) {
    const name = n.name || n.en || String(n.id)
    nameById.set(n.id, name)
    const color = inkFor(n)
    const latex = String(n.latex ?? '')
    const hit = shipped.get(n.id)
    if (hit && hit.key === cacheKey(TEX_EM, color, latex)) {
      lazySvg.set(n.id, hit)
      setDims(n.id, hit.w, hit.h, out)
      pipe.fromCache++
      done++
      continue
    }
    jobs.push({ i: jobs.length, id: n.id, name, latex, color, fallback: `\\text{${textArg(name)}}` })
  }
  progress()

  // 2. 缓存没覆盖的：worker 池现排（主线程兜底）
  if (jobs.length) {
    const results = new Array(jobs.length)
    const accept = (i, r, source) => {
      if (results[i]) return
      const job = jobs[i]
      if (!r || r.fb === 2 || !r.svg || !(r.w > 0 && r.h > 0)) {
        r = { svg: placeholderSvg(job.name, job.color), w: PLACEHOLDER_DIMS.w, h: PLACEHOLDER_DIMS.h, fb: 2 }
        pipe.placeholders++
      } else if (r.fb === 1) pipe.fallbacks++
      results[i] = r
      svgCache.set(job.id, r.svg)
      setDims(job.id, r.w, r.h, out)
      if (source === 'main') pipe.fromMain++; else pipe.fromWorkers++
      done++
    }
    try { await typesetAll(jobs, results, accept, progress) } catch { /* 下面统一补占位 */ }
    for (let i = 0; i < jobs.length; i++) if (!results[i]) accept(i, null, 'main')
  }
  progress()
  pipe.dimsMs = Math.round(performance.now() - t0)
  return out
}
function setDims(id, w, h, out) {
  dimsCache.set(id, { w, h })
  out.set(id, { w, h })   // 给调用方独立的对象：layout 改了它也不影响位图尺寸
}

/** 任务调度：worker 池与主线程兜底抢同一个队列（work stealing）。 */
async function typesetAll(jobs, results, accept, progress) {
  let finished = false
  let resolveAll
  const allDone = new Promise((r) => { resolveAll = r })
  const remaining = () => { for (let i = 0; i < jobs.length; i++) if (!results[i]) return true; return false }
  let cursor = 0
  const inflight = new Set()
  /** 取下一块未完成、未派出的任务 */
  const take = (k) => {
    const chunk = []
    while (cursor < jobs.length && chunk.length < k) {
      const i = cursor++
      if (!results[i] && !inflight.has(i)) chunk.push(i)
    }
    // 游标已到底：再扫一遍，捡回被杀掉的 worker 退回队列的任务
    if (!chunk.length) for (let i = 0; i < jobs.length && chunk.length < k; i++) if (!results[i] && !inflight.has(i)) chunk.push(i)
    return chunk
  }
  const check = () => {
    if (!finished && !remaining()) { finished = true; resolveAll() }
  }

  /* ── worker 池（池大小随任务量：缓存只漏了几条时只开 1 个，不白白解析 6 份 MathJax） ── */
  const workers = []
  const hc = (typeof navigator !== 'undefined' && navigator.hardwareConcurrency) || 4
  const poolSize = Math.max(1, Math.min(6, hc - 1, Math.ceil(jobs.length / 24)))
  let anyReady = false
  const kill = (rec) => {
    if (rec.dead) return
    rec.dead = true
    if (rec.chunk) rec.chunk.forEach((i) => inflight.delete(i))
    rec.chunk = null
    try { rec.w.terminate() } catch { /* */ }
    if (workers.every((r) => r.dead)) helpMain()   // 全军覆没：主线程接手
  }
  if (typeof Worker !== 'undefined') {
    for (let k = 0; k < poolSize; k++) {
      let w
      try { w = new Worker(new URL('./formulas-worker.js', import.meta.url), { type: 'module' }) } catch { break }
      const rec = { w, dead: false, ready: false, chunk: null, t: 0, feed: null }
      rec.feed = () => {
        if (finished || rec.dead || rec.chunk) return
        const chunk = take(CHUNK)
        if (!chunk.length) return
        rec.chunk = chunk; rec.t = performance.now()
        chunk.forEach((i) => inflight.add(i))
        try {
          w.postMessage({ jobs: chunk.map((i) => ({ i, latex: jobs[i].latex, color: jobs[i].color, fallback: jobs[i].fallback })) })
        } catch { kill(rec) }
      }
      w.onmessage = (e) => {
        const d = e.data || {}
        if (d.ready) { anyReady = rec.ready = true; rec.feed(); return }
        if (Array.isArray(d.results)) {
          // worker 的回包也校验下标，不盲信
          for (const r of d.results) if (r && Number.isInteger(r.i) && r.i >= 0 && r.i < jobs.length) accept(r.i, r, 'worker')
          if (rec.chunk) rec.chunk.forEach((i) => inflight.delete(i))
          rec.chunk = null
          progress(); check(); rec.feed()
        }
      }
      w.onerror = () => kill(rec)
      w.onmessageerror = () => kill(rec)
      workers.push(rec)
    }
  }
  pipe.workers = workers.length

  /* ── 主线程兜底：worker 不可用、迟迟不就绪或全部死掉时，按 8 ms 时间片做 ── */
  let helping = false
  const freeJob = () => { for (let i = 0; i < jobs.length; i++) if (!results[i] && !inflight.has(i)) return true; return false }
  async function helpMain() {
    if (helping || finished) return
    helping = true
    const texSync = await loadTexMain()
    while (!finished) {
      const t = performance.now()
      while (!finished && performance.now() - t < SLICE_MS) {
        const [i] = take(1)
        if (i === undefined) break
        accept(i, typesetMain(texSync, jobs[i]), 'main')
      }
      progress(); check()
      if (!finished && !freeJob()) break   // 剩下的都在 worker 手上，等它们
      await yieldMain()
    }
    helping = false
  }
  if (!workers.length) helpMain()

  // 看门狗：worker 迟迟不就绪 → 主线程帮忙；某块任务卡死 → 杀掉该 worker，任务回队列；空闲 worker 重新派活
  const t0 = performance.now()
  const watchdog = setInterval(() => {
    if (finished) return
    const now = performance.now()
    if (!anyReady && now - t0 > WORKER_HELP_MS) helpMain()
    for (const rec of workers) if (!rec.dead && rec.chunk && now - rec.t > WORKER_STALL_MS) kill(rec)
    for (const rec of workers) if (rec.ready && !rec.dead) rec.feed()
  }, 250)

  check()
  await allDone
  clearInterval(watchdog)
  for (const rec of workers) { rec.dead = true; try { rec.w.terminate() } catch { /* */ } }
}


/** 排版管线自身的统计（bench / 调试用，不属于 SPEC 契约） */
export function pipelineStats() { return { ...pipe } }

/* ═════════════════════════ 位图：mip 缓存与烘焙队列 ═════════════════════════ */
/**
 * mip 级（相对 MathJax px）。getBitmap 取 ≥ pxPerUnit 的最小一级，超过最高一级就钳在最高一级。
 *
 * 为什么有 4×（原契约只有到 2）：位图被画到屏幕上的放大倍数 ≈ ppu / MIP[li]，
 * ppu = formula.scale × cam.z × dpr。题记的 scale 是 1.375（SIZE.epiEm 88 / TEX_EM 64），
 * 而 ZOOM.MAX = 3.2 —— 所以 ppu 的理论上限是 1.375 × 3.2 × dpr = 4.4 × dpr，
 * 只到 2× 一级时大字号公式在深缩放会被拉伸：dpr=1 时最坏 2.2×，dpr=2 时最坏 4.4×。
 * 加一级 4× 后，ppu ≤ 4.08 的请求都能拿到不过采样的位图，拉伸只剩 ZOOM.MAX 边缘的一点点。
 *
 * 代价（纯 Node 估算，见 shots/designs/manuscript/_d_mip_cost2.mjs）：
 *   · 内存：4× 不属于常驻级（RESIDENT 只保 1/16、1/8），受 MAX_BYTES 的 LRU 约束；
 *     dpr=2、z=3.2 时"最坏一屏"需要新级的公式最多 7 条 / 合计 20.7 MB。
 *   · 单张最大 4× 画布 531 万像素（Chrome 上限 2.68 亿，安全）。
 *   · 栅格化耗时**未实测**：耗时模型在 0.8ms（msPerPx=3.9e-7）到 550ms（msPerPx=1.79e-4）之间跨三个数量级，
 *     必须在真实设备上量。pumpBakes 的"至少烘一张"会放行第一张，所以首次深缩放可能出现一次长帧。
 */
export const MIP_LEVELS = [1 / 16, 1 / 8, 1 / 4, 1 / 2, 1, 2, 4]
const RESIDENT = 2                       // 下标 < 2（1/16、1/8）常驻，不淘汰
const MAX_BYTES = 160 * 1024 * 1024      // 位图总字节上限
const MAX_LOADS = 12                     // 同时在解码的 <img> 数（SVG 解析在主线程，限并发防卡顿）
const WARM_RESERVE = 4                   // prewarm 至少给 pumpBakes 留这么多解码槽
const STALE_FRAMES = 90                  // ≥1/2 级的请求这么多帧没再被要过（已移出视野）就丢掉
const LEVEL_SLACK = 1.02                 // 只差 2% 不升级（缩放抖动时不在两级之间来回烘焙）

const imgs = new Map()      // id → { img, state: 'loading'|'ready'|'dead', retried }
const bms = new Map()       // id → Array(MIP_LEVELS.length)：每级一个 entry | undefined
const queue = new Map()     // id → { li, frame }：同 id 只保留最新请求的级
const nameById = new Map()  // id → 节点名（占位 SVG 用）
let frame = 0               // pumpBakes 每调用一次 +1，作为"最近请求 / 最近使用"的时钟
let loading = 0
let bytes = 0
let cachedCount = 0
// 烘焙耗时模型（指数平均）：ms ≈ BAKE_FIXED + px * msPerPx，用来在预算内挑活；开头给一个保守值
const BAKE_FIXED = 0.15
let msPerPx = 2e-5

function levelFor(p) {
  if (!(p > 0)) return 0
  const q = p / LEVEL_SLACK
  for (let i = 0; i < MIP_LEVELS.length; i++) if (MIP_LEVELS[i] >= q) return i
  return MIP_LEVELS.length - 1
}
function levelSize(id, li) {
  const d = dimsCache.get(id)
  const L = MIP_LEVELS[li]
  return [Math.max(1, Math.ceil(d.w * L)), Math.max(1, Math.ceil(d.h * L))]
}
const hasLevel = (id, li) => { const a = bms.get(id); return !!(a && a[li]) }

/**
 * 取 id 的位图。pxPerUnit = 每个 MathJax px 对应的设备像素（formula.scale * z * dpr）。
 * 有目标级 → {canvas, exact:true}；没有 → 最近的已有一级（同距离优先更高的）{exact:false} 并排队；都没有 → null 并排队。
 * 从不同步栅格化。返回对象按 entry 复用（render 每帧调几百次，不制造垃圾）。
 */
export function getBitmap(id, pxPerUnit) {
  if (!dimsCache.has(id)) return null
  const li = levelFor(pxPerUnit)
  const arr = bms.get(id)
  const hit = arr && arr[li]
  if (hit) { hit.used = frame; return hit.exactRef }
  const rec = imgs.get(id)
  if (!rec || rec.state !== 'dead') enqueue(id, li)
  if (!arr) return null
  for (let k = 1; k < MIP_LEVELS.length; k++) {
    const up = arr[li + k]
    if (up) { up.used = frame; return up.approxRef }
    const dn = li - k >= 0 ? arr[li - k] : null
    if (dn) { dn.used = frame; return dn.approxRef }
  }
  return null
}

function enqueue(id, li) {
  const q = queue.get(id)
  if (q) {
    if (q.li !== li) { q.li = li; requestDraw() }   // 改了级：需要一次 pump
    q.frame = frame
    return
  }
  queue.set(id, { li, frame })
  requestDraw()   // 新请求：保证下一帧有 pumpBakes 来启动解码 / 烘焙
}

/** 为 id 解码唯一的一个 <img>（复用 svgUrlFor 的 Blob URL）。onload / onerror 时 requestDraw。 */
function startLoad(id) {
  const url = svgUrlFor(id)
  if (!url) { imgs.set(id, { img: null, state: 'dead', retried: true }); return }
  const img = new Image()
  const rec = { img, state: 'loading', retried: false }
  imgs.set(id, rec)
  loading++
  img.decoding = 'async'
  img.onload = () => {
    loading--
    rec.state = img.naturalWidth > 0 && img.naturalHeight > 0 ? 'ready' : 'dead'
    requestDraw()
    if (warm) scheduleWarm()
  }
  img.onerror = () => {
    loading--
    if (!rec.retried) {
      // SVG 本身坏了（极少见）：换成占位 SVG 再解码一次；注释页的 URL 也换成占位（旧 URL 不 revoke，契约如此）
      rec.retried = true
      const svg = placeholderSvg(nameById.get(id) || id, PALETTE.ink)
      svgCache.set(id, svg)
      const u = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }))
      urlCache.set(id, u)
      loading++
      img.src = u
      return
    }
    rec.state = 'dead'
    queue.delete(id)
    requestDraw()
    if (warm) scheduleWarm()
  }
  img.src = url
}

/** 把 id 的 li 级栅格化（同步 drawImage；只在 pumpBakes / prewarm 里调用） */
function bake(id, li) {
  const rec = imgs.get(id)
  if (!rec || rec.state !== 'ready') return false
  let arr = bms.get(id)
  if (!arr) { arr = new Array(MIP_LEVELS.length); bms.set(id, arr) }
  if (arr[li]) return true
  const [w, h] = levelSize(id, li)
  const c = document.createElement('canvas')
  c.width = w; c.height = h
  const ctx = c.getContext('2d')
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  const t = performance.now()
  try { ctx.drawImage(rec.img, 0, 0, w, h) } catch { rec.state = 'dead'; return false }
  const dt = performance.now() - t
  const px = w * h
  if (px > 2000) msPerPx = msPerPx * 0.8 + Math.max(0, dt - BAKE_FIXED) / px * 0.2   // 小图噪声大，不参与估计
  const e = { id, li, canvas: c, bytes: px * 4, used: frame, exactRef: { canvas: c, exact: true }, approxRef: { canvas: c, exact: false } }
  arr[li] = e
  bytes += e.bytes
  cachedCount++
  return true
}
function drop(e) {
  const arr = bms.get(e.id)
  if (!arr || arr[e.li] !== e) return
  arr[e.li] = undefined
  bytes -= e.bytes
  cachedCount--
  e.canvas.width = 0; e.canvas.height = 0   // 立刻释放像素内存，不等 GC
}
/** LRU 淘汰：先 ≥1/2 级，不够再 1/4 级；本帧与上一帧用过的不动；1/16、1/8 常驻 */
function evict() {
  const target = MAX_BYTES * 0.85
  for (const minLi of [3, RESIDENT]) {
    if (bytes <= target) return
    const cands = []
    for (const arr of bms.values()) for (let li = minLi; li < MIP_LEVELS.length; li++) {
      const e = arr[li]
      if (e && e.used < frame - 1) cands.push(e)
    }
    cands.sort((a, b) => a.used - b.used)
    for (const e of cands) { if (bytes <= target) return; drop(e) }
  }
}

/**
 * render 每帧开头调用：在 budgetMs 内推进解码与烘焙，返回队列剩余数。
 * 解码顺序：最近请求的帧优先，同帧级别大的先（屏幕上大的公式先可读）。
 * 烘焙顺序：最近请求的帧优先，同帧级别小的先（便宜，先让整页有东西）。
 * 按耗时模型挑活，预算不够就跳过大图先做小图；每次调用至少烘焙一张，保证一定有进展。
 */
export function pumpBakes(budgetMs = 6) {
  frame++
  const t0 = performance.now()
  if (bytes > MAX_BYTES) evict()
  if (!queue.size) return 0

  const loadList = [], bakeList = []
  for (const [id, q] of queue) {
    const rec = imgs.get(id)
    if (hasLevel(id, q.li)) { queue.delete(id); continue }                     // 别处（prewarm）已经做了
    if (q.li > RESIDENT && frame - q.frame > STALE_FRAMES) { queue.delete(id); continue }
    if (!rec) loadList.push([id, q])
    else if (rec.state === 'ready') bakeList.push([id, q])
    else if (rec.state === 'dead') queue.delete(id)
    // 'loading'：跳过，onload 会 requestDraw
  }
  if (loadList.length && loading < MAX_LOADS) {
    loadList.sort((a, b) => b[1].frame - a[1].frame || b[1].li - a[1].li)
    for (const [id] of loadList) { if (loading >= MAX_LOADS) break; startLoad(id) }
  }
  if (!bakeList.length) return queue.size

  bakeList.sort((a, b) => b[1].frame - a[1].frame || a[1].li - b[1].li)
  let baked = 0, skipped = 0
  for (const [id, q] of bakeList) {
    const el = performance.now() - t0
    if (baked && el >= budgetMs) { skipped++; continue }
    const [w, h] = levelSize(id, q.li)
    const est = BAKE_FIXED + w * h * msPerPx
    if (baked && el + est > budgetMs) { skipped++; continue }
    bake(id, q.li)
    queue.delete(id)
    baked++
  }
  if (skipped) requestDraw()       // 还有能做的活：下一帧接着做
  return queue.size
}

/* ── prewarm：空闲时为一批 id 依次烘焙 1/8 与 1/16 两级（远景灰行用） ── */
let warm = null            // { list, pos, scheduled }
let lastWarmDraw = 0
export function prewarm(ids) {
  const list = []
  for (const id of ids || []) if (dimsCache.has(id) && !(hasLevel(id, 0) && hasLevel(id, 1))) list.push(id)
  warm = list.length ? { list, pos: 0, scheduled: false } : null
  scheduleWarm()
}
function scheduleWarm() {
  if (!warm || warm.scheduled) return
  warm.scheduled = true
  idle(warmStep, 1000)
}
function warmStep(deadline) {
  if (!warm) return
  warm.scheduled = false
  const t0 = performance.now()
  // 真正空闲时用满空闲时间；超时被迫执行（didTimeout）时只做 4 ms，避免和交互抢帧
  const more = () => (deadline && !deadline.didTimeout && deadline.timeRemaining) ? deadline.timeRemaining() > 1.5 : performance.now() - t0 < 4
  // 往前多解码一段，让烘焙不必等解码；给 pumpBakes 留 WARM_RESERVE 个解码槽
  for (let k = warm.pos, n = 0; k < warm.list.length && n < 32; k++, n++) {
    if (loading >= MAX_LOADS - WARM_RESERVE) break
    const id = warm.list[k]
    if (!imgs.has(id)) startLoad(id)
  }
  let progressed = false, waiting = false
  while (warm.pos < warm.list.length && more()) {
    const id = warm.list[warm.pos]
    const rec = imgs.get(id)
    if (!rec || rec.state === 'loading') { waiting = true; break }   // 等 onload 再叫醒
    if (rec.state === 'ready') {
      if (!hasLevel(id, 1)) bake(id, 1)
      if (!hasLevel(id, 0)) bake(id, 0)
      progressed = true
    }
    warm.pos++
  }
  // 远景灰行逐步从墨条换成缩略图：限频重画，不要每片都画
  if (progressed && performance.now() - lastWarmDraw > 200) { lastWarmDraw = performance.now(); requestDraw() }
  if (warm.pos >= warm.list.length) { warm = null; requestDraw(); return }
  if (!waiting || loading === 0) scheduleWarm()
}

/** { pending: 正在解码的 <img> 数, queued: 烘焙队列长度, cached: 位图张数, bytes: 位图总字节 } + 调试字段 */
export function bitmapStats() {
  return {
    pending: loading, queued: queue.size, cached: cachedCount, bytes,
    images: imgs.size, warmLeft: warm ? warm.list.length - warm.pos : 0, msPerMpx: +(msPerPx * 1e6).toFixed(2),
  }
}
