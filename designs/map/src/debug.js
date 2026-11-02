/**
 * designs/map/src/debug.js — window.__design 调试句柄（编排模块，SPEC §10.6）。
 *
 * 评审代理 / 截图工具靠它驱动交互，所以约定严格：
 *   · select / setView 的 promise 在**新画面画完**之后才 resolve（经 whenDrawn）；
 *   · stats().overlappingLabels 直接用 labeler.countOverlaps(lastPlacement)，即"屏幕上真的画出来的那一帧"；
 *     另给一个与 labels 模块无关的独立复核值 overlappingLabelsCheck（框两两相交面积 > 1px²），
 *     两者不一致说明 countOverlaps 自己有 bug。
 */
import { levelOf } from './rules.js'

/**
 * @param {object} d 依赖：{state, graph, world, labeler, renderer, actions, camera, interaction,
 *   getPlacement, getFrame, whenDrawn, clamp, perf: () => object, bake: () => {done,total}, pick}
 */
export function installDebug(d) {
  const { state, graph, world, labeler, actions, camera, whenDrawn, clamp } = d

  const sOf = () => state.view.z / state.zFit

  function view() {
    const s = sOf()
    return {
      x: state.view.x, y: state.view.y, z: state.view.z, s, level: levelOf(s),
      selected: state.selection.id, inset: { ...state.inset }, w: state.size.w, h: state.size.h,
      search: state.search.query, hits: state.search.ids.length, animating: camera.animating,
    }
  }

  function setView(v = {}, { animate = false, ms } = {}) {
    const cur = state.view
    const z = typeof v.s === 'number' && isFinite(v.s) ? v.s * state.zFit
      : typeof v.z === 'number' && isFinite(v.z) ? v.z : cur.z
    const target = clamp({
      x: typeof v.x === 'number' && isFinite(v.x) ? v.x : cur.x,
      y: typeof v.y === 'number' && isFinite(v.y) ? v.y : cur.y,
      z,
    })
    return animate ? camera.flyTo(target, { ms }) : camera.jump(target)
  }

  function boxesOverlap(a, b) {
    const ix = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x)
    const iy = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y)
    return ix > 0 && iy > 0 && ix * iy > 1
  }

  /** 独立复核：点标签框 + active 区域标签的每个字框，两两（不同标签之间）相交 */
  function independentOverlaps(pl) {
    const boxes = []
    for (const it of pl.items || []) if (it.box) boxes.push({ owner: 'p:' + it.id, b: it.box })
    for (const a of pl.areas || []) if (a.active) for (const b of a.boxes || []) boxes.push({ owner: `a:${a.kind}:${a.id}`, b })
    let n = 0
    for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
      if (boxes[i].owner !== boxes[j].owner && boxesOverlap(boxes[i].b, boxes[j].b)) n++
    }
    return n
  }

  function stats() {
    const pl = d.getPlacement() || { items: [], areas: [], stats: {} }
    const items = pl.items || []
    let overlapping = 0
    try { overlapping = labeler.countOverlaps(pl) } catch (e) { overlapping = -1; console.warn('[map] countOverlaps 出错', e) }
    const p = state.perf
    const s = sOf()
    return {
      visibleLabels: items.length + (pl.areas || []).filter((a) => a.active).length,
      pointLabels: items.length,
      overlappingLabels: overlapping,
      overlappingLabelsCheck: independentOverlaps(pl),
      formulaLabels: items.filter((i) => i.mode === 'formula').length,
      nameLabels: items.filter((i) => i.mode === 'name').length,
      areaLabels: (pl.areas || []).length,
      activeAreaLabels: (pl.areas || []).filter((a) => a.active).length,
      fps: p.fps, frameMs: round(p.frameMs), placeMs: round(p.placeMs), drawMs: round(p.drawMs),
      worldMs: world.meta && world.meta.ms ? (world.meta.ms.total ?? world.meta.ms) : null,
      bootMs: d.bootMs ? d.bootMs() : null,
      bake: { ...d.bake() },
      level: levelOf(s), s: round(s, 3),
      roadOptions: { ...(state.roadOptions || { showCross: false }) },
      /** 最近一帧实际画出的道路条数（按 kind 分组）+ 跨族道路条数。默认视图 crossCount 应为 0。 */
      roads: d.roadInfo ? d.roadInfo() : null,
      placementStats: pl.stats || {},
      frames: d.frames ? d.frames() : null,
      drawWhy: d.drawWhy ? d.drawWhy() : null,
    }
  }

  /** 期间以小幅正弦平移驱动连续重画，返回平均 fps（只统计真正 draw 了的帧） */
  function measureFps(ms = 1500) {
    camera.cancel()
    const v0 = { ...state.view }
    const amp = 120 / v0.z            // 屏幕上 ±120px 的往返平移
    const f0 = d.frames()
    const t0 = performance.now()
    return new Promise((resolve) => {
      function tick(now) {
        const t = now - t0
        if (t >= ms) {
          const frames = d.frames() - f0
          const fps = Math.round((frames * 1000 / (performance.now() - t0)) * 10) / 10
          camera.jump(v0).then(() => resolve(fps))
          return
        }
        state.view = clamp({ x: v0.x + amp * Math.sin(t / 300), y: v0.y + amp * 0.4 * Math.sin(t / 470), z: v0.z })
        state.dirty = true
        requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    })
  }

  function screenOf(id) {
    const p = world.placeById.get(id)
    if (!p) return null
    const { view, size } = state
    return [(p.x - view.x) * view.z + size.w / 2, (p.y - view.y) * view.z + size.h / 2]
  }

  const api = {
    ready: false,
    graph, world, state, actions, camera, labeler,
    renderer: d.renderer,
    select: (id, opt) => Promise.resolve(actions.select(id, opt)).then(() => whenDrawn()),
    deselect: (opt) => { actions.deselect(opt); return whenDrawn() },
    search: (q, opt) => actions.search(q, opt),
    suggest: (q, limit) => actions.suggest(q, limit),
    clearSearch: () => { actions.clearSearch(); return whenDrawn() },
    home: (opt) => actions.home(opt),
    zoomBy: (f, opt) => actions.zoomBy(f, opt),
    /** 跨族道路开关；__design.setRoads({showCross:true}) */
    setRoads: (opt) => { const r = actions.setRoads(opt); return whenDrawn().then(() => r) },
    view, setView, stats, measureFps, screenOf,
    placeOf: (id) => world.placeById.get(id) || null,
    hash: () => location.hash,
    /** 屏幕点 → 命中的 place id（与点击同一套判定） */
    pick: (sx, sy) => d.pick(sx, sy),
    /** 模拟按 Esc（走与键盘相同的链），返回执行了哪一步 */
    esc: () => { const r = d.interaction.escChain(); return whenDrawn().then(() => r) },
    /** 当前帧的标签放置（只读） */
    placement: () => d.getPlacement(),
    /** 最近一次画出的帧的相机（与 state.view 不一致说明最近的 draw 出错了） */
    drawnView: () => { const f = d.getFrame(); return f ? { ...f.view, s: f.s, level: f.level } : null },
    /** 渲染循环捕获的帧错误（最近 5 条） */
    frameErrors: () => (d.frameErrors ? d.frameErrors() : []),
    /** 等下一帧画完 */
    frame: () => whenDrawn(),
  }
  window.__design = api
  return api
}

function round(v, k = 2) { return typeof v === 'number' ? Math.round(v * 10 ** k) / 10 ** k : v }
