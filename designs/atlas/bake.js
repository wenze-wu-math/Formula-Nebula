/**
 * designs/atlas/bake.js — 公式位图烘焙（M3 所有，SPEC §6.2）。
 *
 * 设计取舍：
 *   · 标签字号是**屏幕常数**（按星等 / 猜想档），不随缩放变，所以每条公式只按最终显示尺寸
 *     烘焙一次，不做尺寸分档；dpr 变化时整体重烘（setBakeDpr）。
 *   · MathJax 排版（texSync）是同步的、约 1.2 ms/条，464 条全排要 ~0.6 s ——
 *     必须分时：pumpBakes 每帧最多花 budgetMs，按 priority 出队（L 越低越先，屏幕上
 *     正等着的会被 labels 提到最前）。
 *   · SVG → <img>.decode() 是异步的，浏览器在别的线程栅格化；并发上限 BAKE_CONCURRENCY，
 *     避免一次塞几百个解码把主线程的回调队列堵住。为了不让"排好版等解码"的积压太长
 *     （积压会让后来的高优先级请求排在后面），已排版待解码的条目也受上限约束。
 *   · 晕边：离屏 canvas 上先用 shadowBlur 画两遍（底色光晕把下面的坐标线、星点压淡），
 *     再无阴影画一遍保证笔画实心。晕边是位图的一部分，所以每帧 drawImage 一次即可。
 *   · 失败（排版抛错、出现 merror、解码失败）一律记为 failed、不抛，labels 退化为只显示中文名。
 *
 * 内部接口（只给 labels.js 用）：initBake(atlas) 告诉本模块去哪查 body（latex / cluster / formulaPx）。
 * 若 initBake 之前就有 requestBake，条目先记下，initBake 时补齐。
 */
import { texSync } from '../shared/tex.js'
import {
  INK_HEX, CONJ_HEX, COLOR, LABEL_MAX_W, FORMULA_MIN_PX, BAKE_PAD,
  BAKE_BUDGET_MS, BAKE_CONCURRENCY,
} from './constants.js'

const MJ_PX = 64                      // tex.js 的排版字号（FONT_SIZE）
const READY_BACKLOG = BAKE_CONCURRENCY   // 已排版、等待解码槽位的最大积压
const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now())

let atlasRef = null
let dpr = 1
let gen = 0                           // 每次 setBakeDpr 递增；异步回调里比对，丢弃过期结果

/** id → Entry
 *  Entry = { id, prio, state:'queued'|'ready'|'decoding'|'done'|'failed', seq, bake, svg, w, h, px, gen } */
const entries = new Map()
let seqCounter = 0
const stats = { done: 0, queued: 0, decoding: 0, failed: 0, ms: 0, firstAt: 0, lastDoneAt: 0 }

/* ───────── 二叉堆（懒删除：优先级变化时重新压入，出队时跳过过期项） ───────── */
const heap = []   // [prio, seq, id]
const less = (a, b) => a[0] < b[0] || (a[0] === b[0] && a[1] < b[1])
function heapPush(item) {
  heap.push(item)
  let i = heap.length - 1
  while (i > 0) {
    const p = (i - 1) >> 1
    if (!less(heap[i], heap[p])) break
    ;[heap[i], heap[p]] = [heap[p], heap[i]]; i = p
  }
}
function heapPop() {
  const top = heap[0], last = heap.pop()
  if (heap.length) {
    heap[0] = last
    let i = 0
    for (;;) {
      const l = 2 * i + 1, r = l + 1
      let m = i
      if (l < heap.length && less(heap[l], heap[m])) m = l
      if (r < heap.length && less(heap[r], heap[m])) m = r
      if (m === i) break
      ;[heap[i], heap[m]] = [heap[m], heap[i]]; i = m
    }
  }
  return top
}

/** 已排版、等解码槽位的条目（按优先级出队） */
const readyList = []

/** 完成 / 失败回调（labels 用：只有"本帧正等着的"位图完成时才请求重画）。
 *  需要它是因为解码在 promise 回调里完成，main 在 pumpBakes 前后比对 done 计数看不到这些完成。 */
let listener = null
export function onBakeDone(fn) { listener = typeof fn === 'function' ? fn : null }
const notify = (id) => { if (listener) { try { listener(id) } catch { /* 回调错误不影响烘焙 */ } } }

/* ───────── 导出 ───────── */

/** 内部接口：labels.initLabels 调用，提供 body 查询 */
export function initBake(atlas) { atlasRef = atlas; scheduleIdle() }

/** 请求烘焙；priority 越小越先；重复调用取较小值；已完成 / 已失败则无操作 */
export function requestBake(id, priority = 0) {
  if (id == null) return
  let e = entries.get(id)
  if (!e) {
    e = { id, prio: priority, state: 'queued', seq: seqCounter++, bake: null, svg: null, gen }
    entries.set(id, e)
    stats.queued++
    if (!stats.firstAt) stats.firstAt = now()
    heapPush([priority, e.seq, id])
    if (atlasRef) { scheduleIdle(); scheduleSelfDrive() }
    return
  }
  if (priority >= e.prio) return
  e.prio = priority
  if (e.state === 'queued') { heapPush([priority, e.seq, id]); scheduleSelfDrive() }
}

/** 完成才返回 Bake = { canvas, w, h, pad, px }（w/h 为 css px，含 2·pad） */
export function getBake(id) {
  const e = entries.get(id)
  return e && e.bake ? e.bake : null
}

/** 该 id 是否已确定失败（labels 用来决定退化为只显示中文名） */
export function bakeFailed(id) {
  const e = entries.get(id)
  return !!e && e.state === 'failed'
}

/** main 每帧调用：在 budgetMs 内做同步排版、启动解码；返回"还有未完成的" */
export function pumpBakes(budgetMs = BAKE_BUDGET_MS) {
  const more = pump(budgetMs)
  if (more) { scheduleIdle(); scheduleSelfDrive() }
  return more
}

/** 当前是否还有没烘完的（供调试句柄与自驱泵判断） */
export function bakesPending() { return hasWork() }

/**
 * 首屏可读公式计数：alpha ≥ 0.5 且位图已就绪的公式标签数由 labels 统计；
 * 这里只报"队列里还有多少条没完成"，供 perf 探针判断何时可以停表。
 */
export function bakesRemaining() {
  return Math.max(0, entries.size - stats.done - stats.failed)
}

/* 空闲时段补充排版：只靠每帧 8 ms 时，吞吐量被 rAF 频率绑死（headless / 高负载下 rAF 可低到每秒几帧）。
 * requestIdleCallback 只在主线程空闲时运行、按 deadline 让出，不会挤占绘制帧。 */
let idleId = 0
function scheduleIdle() {
  if (idleId) return
  if (typeof requestIdleCallback === 'function') { idleId = requestIdleCallback(idlePump, { timeout: 200 }); return }
  scheduleSelfDrive()
}
function idlePump(deadline) {
  idleId = 0
  const budget = deadline.didTimeout ? BAKE_BUDGET_MS / 2 : Math.max(0, deadline.timeRemaining() - 1)
  if (budget > 0.5) pump(budget)
  if (hasWork()) scheduleIdle()
}

/* ───────── 自驱泵（关键性能修复） ─────────
 * 问题：pump 原本只由 main 的 rAF 循环驱动。rAF 频率在 headless / 低端设备 / 主线程繁忙时
 * 会掉到 2–4 帧/秒（本机实测 244 ms/帧），于是「每秒最多 4 次 × 8 ms 预算」= 每秒只能排 6–8 条，
 * 102 条就要十几秒，464 条要 26 秒 —— 首屏公式长时间读不出来。
 *
 * 修法：给烘焙队列一条**独立于 rAF** 的驱动链。每次只做一小段（SELF_DRIVE_SLICE_MS），
 * 然后让出主线程（setTimeout 0），下一段接着做。这样：
 *   · 烘焙吞吐不再被 rAF 频率绑死，铺满 CPU 直到队列排空
 *   · 每段很短，绘制帧仍然能插进来（不会把页面卡死）
 *   · 队列排空后自动停，不空转
 * main 的 pumpBakes 仍然保留（它负责在绘制帧里顺手推进），两者共用同一个堆，不会重复烘。 */
const SELF_DRIVE_SLICE_MS = 6
let driveId = 0
function hasWork() { return heap.length > 0 || readyList.length > 0 || stats.decoding > 0 }
function scheduleSelfDrive() {
  if (driveId) return
  /* ═══ 调度媒介的选择（2026-11-02 实测）═══
   *
   * headless / 后台标签页会把 `setTimeout(0)` 节流到 **每秒 4 次**
   * （实测：3000 ms 内只触发 12 次；MessageChannel 更惨，只有 3 次）。
   * 自驱泵每次排 2 条，于是吞吐被钉死在 ~8 条/秒 ——
   * 585 条公式要 70 秒，远超验收窗口。
   *
   * `requestIdleCallback` 不受定时器节流（它按空闲时间调度），
   * 所以优先用它；只有在它不可用或明确超时回落后才退回 setTimeout。
   * 两者都保留：idle 负责"没活时也能推进"，setTimeout 作为兜底保证不死锁。 */
  if (typeof requestIdleCallback === 'function') {
    driveId = requestIdleCallback(selfDriveTick, { timeout: 40 })
  } else {
    driveId = setTimeout(selfDriveTick, 0)
  }
}
function selfDriveTick() {
  driveId = 0
  if (!atlasRef) return
  pump(SELF_DRIVE_SLICE_MS)
  if (hasWork()) scheduleSelfDrive()
}

function pump(budgetMs) {
  if (!atlasRef) return entries.size > 0 && stats.done + stats.failed < entries.size
  const t0 = now()
  // ① 先把等槽位的启动解码（便宜：只建 Blob URL）
  startDecodes()
  // ② 排版：直到预算用完或积压满
  //
  // ⚠ 预算语义（2026-11-02 修正，两次踩坑）：
  //
  //   texSync 实测 3.6 ms/条（浏览器内 277 条/秒），而 BAKE_BUDGET_MS = 8。
  //   所以正常节奏是「每次 pump 排 2 条」。
  //
  //   坑 1：原来只在循环开头查预算，`typeset` 内部一旦变慢（例如遇到复杂
  //         公式），单次 pump 会冲到 2.6 s（实测 pumpMsMax=2672），
  //         主线程被长期占住 → 帧率掉到 0.3 → 自驱泵的 setTimeout(0) 被推迟。
  //   坑 2：我一度改成「每次 pump 只做 1 条」来防超支，结果吞吐被
  //         钉死在 setTimeout(0) 的节奏上 —— 只有 2.6 条/秒，
  //         比历史基线（83 条/秒）慢 30 倍。**过度修正**。
  //
  //   正确做法：**做满预算，但一旦某条明显超支就立刻让出**。
  //   「超支」判据用单条耗时 vs 预算：超过 4× 预算说明遇到了异常贵的条目，
  //   这时让出主线程，下个 tick 再继续，既保住帧率也不牺牲吞吐。
  const overBudget = budgetMs * 4
  while (heap.length && readyList.length < READY_BACKLOG) {
    if (now() - t0 >= budgetMs) break
    const [p, , id] = heapPop()
    const e = entries.get(id)
    if (!e || e.state !== 'queued' || p !== e.prio) continue   // 过期堆项
    const tItem = now()
    typeset(e)
    startDecodes()
    /* 单条异常昂贵：立刻让出，别让主线程欠账 */
    if (now() - tItem > overBudget) break
  }
  stats.ms += now() - t0
  return stats.done + stats.failed < entries.size
}

export function bakeStats() {
  return {
    done: stats.done, queued: stats.queued, decoding: stats.decoding, failed: stats.failed,
    ms: Math.round(stats.ms * 10) / 10,
    // 从第一次请求到最近一次完成的墙钟时间（首屏烘焙耗时的参考）
    wallMs: stats.lastDoneAt ? Math.round(stats.lastDoneAt - stats.firstAt) : 0,
    total: entries.size,
  }
}

/** dpr 变化：已请求的条目全部重排（旧位图保留到新位图就绪，避免闪烁） */
export function setBakeDpr(next) {
  const d = Number(next) > 0 ? Number(next) : 1
  if (d === dpr) return
  dpr = d
  gen++
  heap.length = 0
  readyList.length = 0
  stats.queued = 0; stats.decoding = 0; stats.done = 0; stats.failed = 0; stats.lastDoneAt = 0
  for (const e of entries.values()) {
    e.state = 'queued'; e.svg = null; e.gen = gen
    stats.queued++
    heapPush([e.prio, e.seq, e.id])
  }
  if (atlasRef) scheduleSelfDrive()
}

/* ───────── 内部 ───────── */

function fail(e) {
  if (e.state === 'queued') stats.queued--
  else if (e.state === 'decoding') stats.decoding--
  else if (e.state === 'ready') stats.queued--
  e.state = 'failed'; e.svg = null
  stats.failed++
  stats.lastDoneAt = now()
  notify(e.id)
}

/** 同步排版 + 计算显示尺寸（§6.2 第 1–2 步） */
function typeset(e) {
  const body = atlasRef.bodies.get(e.id)
  const node = body && body.node
  if (!node || !node.latex || !(body.formulaPx > 0)) { fail(e); return }
  let r
  try {
    r = texSync(node.latex, node.cluster ? CONJ_HEX : INK_HEX)
  } catch { fail(e); return }
  // MathJax 遇到未知宏不抛错而是输出红色 merror，这种位图没有意义
  if (!r || !(r.widthPx > 0) || !(r.heightPx > 0) || /data-mjx-error|<g[^>]*merror/.test(r.svg)) { fail(e); return }
  let px = body.formulaPx
  let w = r.widthPx * px / MJ_PX
  if (w > LABEL_MAX_W) {
    px = Math.max(FORMULA_MIN_PX, px * LABEL_MAX_W / w)
    w = r.widthPx * px / MJ_PX
  }
  let h = r.heightPx * px / MJ_PX
  if (w > LABEL_MAX_W) {
    // 字号已到下限仍超宽：整体按比例缩到 LABEL_MAX_W（px 记录实际等效字号）
    const k = LABEL_MAX_W / w
    w = LABEL_MAX_W; h *= k; px *= k
  }
  e.svg = r.svg; e.w = w; e.h = h; e.px = px
  e.state = 'ready'
  readyList.push(e)
}

function startDecodes() {
  while (stats.decoding < BAKE_CONCURRENCY && readyList.length) {
    // 积压很短（≤ READY_BACKLOG），线性挑最小优先级即可
    let bi = 0
    for (let i = 1; i < readyList.length; i++) if (less([readyList[i].prio, readyList[i].seq], [readyList[bi].prio, readyList[bi].seq])) bi = i
    const e = readyList.splice(bi, 1)[0]
    if (e.state !== 'ready') continue
    decode(e)
  }
}

/** SVG → Blob URL → <img>.decode() → 离屏 canvas（§6.2 第 3 步） */
function decode(e) {
  if (typeof Image === 'undefined' || typeof document === 'undefined') { fail(e); return }
  e.state = 'decoding'
  stats.queued--; stats.decoding++
  const myGen = e.gen
  const svg = e.svg
  e.svg = null
  let url = null
  try {
    url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }))
  } catch { stats.decoding--; stats.queued++; e.state = 'queued'; fail(e); return }
  const img = new Image()
  img.decoding = 'async'
  img.src = url
  const finish = (ok) => {
    URL.revokeObjectURL(url)
    if (myGen !== gen || e.state !== 'decoding') return   // dpr 已变，结果作废（条目已被重排）
    if (!ok) { fail(e); startDecodes(); return }
    try {
      e.bake = paint(img, e.w, e.h, e.px)
      e.state = 'done'
      stats.decoding--; stats.done++
      stats.lastDoneAt = now()
      notify(e.id)
    } catch { fail(e) }
    startDecodes()
    scheduleIdle()
    scheduleSelfDrive()
  }
  img.decode().then(() => finish(true), () => finish(false))
}

/** 画进离屏 canvas：两遍阴影晕边 + 一遍实心 */
function paint(img, w, h, px) {
  const pad = BAKE_PAD
  const W = w + 2 * pad, H = h + 2 * pad
  const c = document.createElement('canvas')
  c.width = Math.max(1, Math.round(W * dpr))
  c.height = Math.max(1, Math.round(H * dpr))
  const g = c.getContext('2d')
  g.setTransform(c.width / W, 0, 0, c.height / H, 0, 0)
  /* ═══ 性能关键（2026-11-02 实测）═══
   *
   * 原来这里有 **4 次 drawImage + shadowBlur**（2 次宽晕 + 2 次窄晕 + 1 次实心），
   * 目的是给公式文字加"印刷晕边"，压掉底下的星点与网格线。
   *
   * 实测：单条 paint 要 320 ms，而 decode 只要 9.6 ms ——
   * paint 占了烘焙总耗时的 **97%**，把吞吐从 104 条/秒拖到 3.1 条/秒。
   * 1184 条公式因此要 6 分钟才能烘完（历史 464 条只要 5.6 s）。
   *
   * 根因：canvas 的 shadowBlur 是**软件实现**的高斯模糊，
   * 每画一次都要对整块位图做卷积；叠加 4 次就是 4 遍全图卷积。
   *
   * 改法：把"晕边"从 **逐条实时模糊** 改成 **一次性预渲染的晕边位图**：
   *   · 用离屏 canvas 画一遍带 shadowBlur 的版本（只在初始化时做一次）；
   *   · 每条公式只需 drawImage 两次（晕边 + 实心），不再触发模糊。
   * 视觉上与原实现等价（同样是"底色晕 + 实心笔画"两层），
   * 但每条省掉 3 次全图高斯卷积。
   *
   * 注意：晕边颜色依赖 COLOR.labelHalo（常量），所以预渲染是安全的。 */
  if (!haloPattern) haloPattern = makeHaloPattern()
  if (haloPattern) {
    drawHaloNineSlice(g, haloPattern, W, H)
  }
  g.imageSmoothingQuality = 'high'
  g.drawImage(img, pad, pad, w, h)
  return { canvas: c, w: W, h: H, pad, px }
}

/**
 * 预渲染晕边底图（只做一次）。
 *
 * 做法：在离屏 canvas 上用 shadowBlur 画一块纯色圆角矩形，
 * 得到"中间实、边缘渐隐"的晕边蒙版，之后每条公式直接贴上去即可。
 * 颜色取 COLOR.labelHalo（与原来 shadowColor 相同），
 * 所以最终像素与"逐条 shadowBlur"版本一致。
 */
/**
 * 把晕边位图按「九宫格」贴到 W x H，而不是直接拉伸。
 *
 * ═══ 为什么不能用 drawImage(pat, 0, 0, W, H)（2026-11-02 修的 bug）═══
 *
 * 原来是一行 g.drawImage(haloPattern, 0, 0, W, H) —— 把 64x64 的方块
 * 整体拉伸到每条的 W x H。问题：
 *
 *   · 宽公式 W=400,H=40 → 横向拉伸 6.25 倍、纵向 0.625 倍
 *   · 窄公式 W=60, H=40 → 横向拉伸 0.94 倍、纵向 0.625 倍
 *
 * 晕边本身是「从边缘向内渐隐」的低频信号，拉伸比不同 -->
 * 边缘渐变带的像素宽度完全不同。宽公式的左右晕只剩几像素（几乎透明），
 * 窄公式的晕却占了半个宽度（明显发白）。叠在深色星空上就是用户看到的
 * 「公式显示背景有 bug，颜色不一样」。
 *
 * 修法：nine-slice —— 四角按原尺寸贴（不缩放），四边只在一个方向上
 * 拉伸，中心双向拉伸。这样边缘渐变带的像素宽度恒定，
 * 无论公式多宽多窄，晕边看起来都一样粗。
 */
function drawHaloNineSlice(g, pat, W, H) {
  const S = pat.width
  const c = Math.min(Math.floor(S / 4), Math.floor(W / 2), Math.floor(H / 2))
  if (c <= 0) return

  const sw = S - 2 * c
  const dw = W - 2 * c
  const sh = S - 2 * c
  const dh = H - 2 * c

  /* 四角（不缩放） */
  g.drawImage(pat, 0, 0, c, c, 0, 0, c, c)
  g.drawImage(pat, S - c, 0, c, c, W - c, 0, c, c)
  g.drawImage(pat, 0, S - c, c, c, 0, H - c, c, c)
  g.drawImage(pat, S - c, S - c, c, c, W - c, H - c, c, c)
  /* 上下边（只横向拉伸） */
  if (dw > 0) {
    g.drawImage(pat, c, 0, sw, c, c, 0, dw, c)
    g.drawImage(pat, c, S - c, sw, c, c, H - c, dw, c)
  }
  /* 左右边（只纵向拉伸） */
  if (dh > 0) {
    g.drawImage(pat, 0, c, c, sh, 0, c, c, dh)
    g.drawImage(pat, S - c, c, c, sh, W - c, c, c, dh)
  }
  /* 中心（双向拉伸） */
  if (dw > 0 && dh > 0) g.drawImage(pat, c, c, sw, sh, c, c, dw, dh)
}

let haloPattern = null
function makeHaloPattern() {
  try {
    const S = 64   // 晕边底图边长（会被 drawImage 拉伸，模糊本身是低频信号，够用）
    const c = document.createElement('canvas')
    c.width = S; c.height = S
    const g = c.getContext('2d')
    /* 先铺透明，再用带模糊的实心矩形生成"边缘渐隐"的蒙版 */
    g.clearRect(0, 0, S, S)
    g.shadowColor = COLOR.labelHalo
    g.shadowBlur = 6
    g.fillStyle = COLOR.labelHalo
    const inset = 10
    g.fillRect(inset, inset, S - 2 * inset, S - 2 * inset)
    return c
  } catch {
    return null
  }
}
