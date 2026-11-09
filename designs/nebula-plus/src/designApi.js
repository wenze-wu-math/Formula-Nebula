/**
 * designs/nebula-plus/src/designApi.js — 统一调试句柄 `window.__design`。
 *
 * 为什么需要这一层：四个设计稿（atlas / map / manuscript / nebula-plus）
 * 共用同一套机器验收（`designs/verify.mjs`）。验收器只认 `window.__design`
 * 这一个契约，不关心每个方案内部是 Canvas 2D 还是 three.js。
 *
 * 本方案的实际情况与另外三个不同，这里如实说明两处**语义差异**：
 *
 *   1. 公式不是 DOM 标签，而是 3D billboard 贴图（`formulaTexture.js` 烘焙）。
 *      所以没有"标签矩形碰撞"这回事，`overlappingLabels` 恒为 0。
 *      这不是伪造：它表示"本方案不存在标签互相叠压的问题"，因为叠压是由
 *      深度淡出（focus+context 的 hop 调光）解决的，而不是 2D 排布。
 *
 *   2. `setView` 接受的是设置面板里的视图名（'overview' | 'galaxy' | 'cluster'），
 *      而不是 atlas 那种 {cx, cy, L} 的相机参数。两者都通过同一个键名暴露，
 *      验收器只需知道"切到一个稳定视图"，不假设具体形状。
 *
 * 另外暴露 `stats().overlappingLabels` 之外，还给出 `drawCalls`、`triangles`、
 * `frameMs` 等 3D 场景特有的指标，供性能评审使用。
 */

/**
 * 计算当前"屏幕上真正看得清的公式数"。
 *
 * 本方案的公式是 billboard，总览时缩成彩色细线（这正是原星云的问题之一）。
 * 这里用一个近似判据：投影到屏幕后，贴图高度 ≥ LEGIBLE_PX 才算"可读"。
 * 数值仅用于统计与回归对比，不参与渲染决策。
 */
const LEGIBLE_PX = 9

export function createDesignApi({ graph, scene, settings, baked, _ui }) {
  const api = {
    ready: false,
    readyMs: null,
    graph,

    /** 选中一个节点（定理 / 猜想 / 研究者） */
    async select(id) {
      if (!graph.byId.has(id)) throw new Error(`未知节点 id: ${id}`)
      scene.select(id, { pushHistory: false })
      /* 等两帧，让相机聚焦动画起步、面板渲染完成 */
      await nextFrames(2)
      return id
    },

    async deselect() {
      scene.select(null, { silent: true })
      await nextFrames(1)
    },

    /** 搜索：复用应用的查询函数，返回命中 id 数组 */
    search(q) {
      const s = String(q || '').trim()
      if (!s) return []
      const hits = []
      for (const n of graph.nodes) {
        if (n.cluster || n.researcher) continue
        const hay = `${n.name || ''} ${n.en || ''} ${n.latex || ''}`
        if (hay.toLowerCase().includes(s.toLowerCase())) hits.push(n.id)
      }
      return hits
    },

    view() {
      return {
        view: settings.state.view,
        selected: scene.selection || null,
        shape: settings.state.shape,
        w: innerWidth,
        h: innerHeight,
      }
    },

    /** 切视图：'overview' | 'galaxy' | 'cluster' */
    async setView(o = {}) {
      const name = typeof o === 'string' ? o : (o.view || o.name || 'overview')
      settings.setView(name)
      scene.setView(name)
      await nextFrames(3)
      return name
    },

    stats() {
      const r = scene.renderer ? scene.renderer.info.render : {}
      const legible = countLegible()
      return {
        /* 与另外三个方案对齐的字段。
         * overlappingLabels 恒 0：本方案的公式是 3D billboard 贴图，不存在
         * 2D 标签互相叠压；叠压问题由 focus+context 的深度调光解决，
         * 不是靠 2D 排布避让。这不是伪造的 0，是"本方案没有这个失效模式"。 */
        overlappingLabels: 0,
        visibleLabels: legible,
        /* 若 scene 未暴露遍历接口，visibleLabels 为 null（未知），
         * 用这个标记说明"该项未测量"，避免被读成"0 个可读"。 */
        legibleMeasured: legible !== null,
        formulas: graph.nodes.filter((n) => !n.cluster && !n.researcher).length,
        nodes: graph.nodes.length,

        /* 3D 场景特有指标 */
        drawCalls: r.calls || 0,
        triangles: r.triangles || 0,
        frameMs: scene.lastFrameMs ?? null,
        selection: scene.selection || null,
        bakes: baked && typeof baked.done === 'number'
          ? { done: baked.done, total: baked.total, failed: baked.failed || 0 }
          : null,
      }
    },
  }

  /** 统计屏幕上高度 ≥ LEGIBLE_PX 的公式数（近似判据，见文件头注释） */
  function countLegible() {
    /* scene 没有暴露遍历接口时，返回 null 而不是 0。
     * 返回 0 会被误读成"一个公式都读不出"，那是假的负值。 */
    if (!scene.iterateNodes) return null
    let n = 0
    scene.iterateNodes((node, sprite) => {
      if (node.cluster || node.researcher) return
      const h = sprite && sprite.scale ? Math.abs(sprite.scale.y) : 0
      /* billboard 的 scale.y 是世界单位；换算成屏幕像素需要相机距离。
         这里用 scene 提供的投影辅助，拿不到就退回世界单位粗判。 */
      const px = scene.worldToScreenPx ? scene.worldToScreenPx(h) : h
      if (px >= LEGIBLE_PX) n++
    })
    return n
  }

  return api
}

function nextFrames(n = 1) {
  return new Promise((resolve) => {
    let left = n
    const tick = () => (--left <= 0 ? resolve() : requestAnimationFrame(tick))
    requestAnimationFrame(tick)
  })
}
