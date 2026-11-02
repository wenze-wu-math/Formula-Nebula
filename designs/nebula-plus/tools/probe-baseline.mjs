/**
 * 方案 E · 改动前的基线证据采集（只读，不改页面）。
 *
 * 走 designs/cdp.mjs（因此自动获得全局浏览器锁），一次会话里完成：
 *   ① 总览截图
 *   ② 旋臂↔知识族的对齐度（从 window.__nebula.graph 直接读 theta/armIdx）
 *   ③ 拉近一个公式后的截图（记录"叠字"现状）
 *   ④ 猜想星团柔光的屏幕位置/半径 + 截图（给 imgstat --crop 用）
 *
 * 用法：node designs/nebula-plus/tools/probe-baseline.mjs
 * 输出：shots/designs/nebula-plus/before-*.png 与 stdout 上的 JSON
 */
import { openPage } from '../../cdp.mjs'
import { writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

const OUT = 'shots/designs/nebula-plus'
mkdirSync(OUT, { recursive: true })

const FAMILIES_ORDER = [
  'foundation', 'scheme', 'cohomology', 'map', 'curve', 'intersect', 'birational', 'modern',
]

const page = await openPage({
  url: 'http://localhost:5190/designs/nebula-plus/',
  wait: "window.__nebula && window.__nebula.graph && document.querySelector('#diag')",
  waitMs: 90000,
  width: 1600,
  height: 1000,
})
try {
  console.log('ready =', page.ready, ' errors =', page.errors.length)

  /* ── ① 总览 ── */
  await new Promise((r) => setTimeout(r, 1500))
  await page.shot(join(OUT, 'before-overview.png'))

  /* ── ② 旋臂 ↔ 族 的对齐度 ──
   * 判据：把每个节点的"臂相位" u = (theta − t·spin) / 2π 折回 8 个槽，
   * 看每个族的众数槽是否互不相同。4 条臂 → 8 个族两两共用槽 → 只有 4 个不同的众数槽。 */
  const arms = await page.eval(`
    const g = window.__nebula.graph
    const ORDER = ${JSON.stringify(FAMILIES_ORDER)}
    const R = 175, SPIN = 5.2, SLOTS = 8
    const TAU = Math.PI * 2
    const byFam = {}
    for (const n of g.nodes) {
      if (n.cluster || n.researcher) continue
      const t = n.radius / R
      let u = (n.theta - t * SPIN) / TAU
      u = u - Math.floor(u)
      const slot = Math.floor(u * SLOTS) % SLOTS
      const f = n.family || 'unknown'
      byFam[f] = byFam[f] || { n: 0, hist: new Array(SLOTS).fill(0) }
      byFam[f].n++
      byFam[f].hist[slot]++
    }
    const out = { slots: SLOTS, byFamily: {}, distinctModalSlots: 0, weightedPurity: 0 }
    let tot = 0, hit = 0
    const modal = new Set()
    for (const f of ORDER) {
      const b = byFam[f]
      if (!b) { out.byFamily[f] = null; continue }
      let best = 0, bi = 0
      b.hist.forEach((c, i) => { if (c > best) { best = c; bi = i } })
      out.byFamily[f] = { count: b.n, modalSlot: bi, modalShare: +(best / b.n).toFixed(3), hist: b.hist }
      modal.add(bi); tot += b.n; hit += best
    }
    out.distinctModalSlots = modal.size
    out.weightedPurity = +(hit / tot).toFixed(3)
    out.armIdxOfFamily = Object.fromEntries(ORDER.map((f) => [f, g.nodes.find((n) => n.family === f)?.armIdx ?? null]))
    return out
  `)
  console.log('ARMS_BEFORE =', JSON.stringify(arms))

  /* ── ③ 拉近后的叠字现状 ── */
  await page.eval(`window.__nebula.scene.select('scheme')`)
  await new Promise((r) => setTimeout(r, 2500))
  await page.shot(join(OUT, 'before-focus.png'))
  const focusInfo = await page.eval(`
    const s = window.__nebula.scene
    const cam = s.camera
    const V3 = cam.position.constructor
    const W = innerWidth, H = innerHeight
    const proj = (x, y, z) => { const v = new V3(x, y, z); v.project(cam); return { x: (v.x * 0.5 + 0.5) * W, y: (-v.y * 0.5 + 0.5) * H, z: v.z } }
    // 统计"屏幕 AABB 互相重叠且不透明度够高"的精灵对数 —— 这就是"叠字"的机器定义
    const boxes = []
    for (const n of window.__nebula.graph.nodes) {
      if (!n.sprite) continue
      const wp = new V3(); n.sprite.getWorldPosition(wp)
      const c = proj(wp.x, wp.y, wp.z)
      if (c.z < -1 || c.z > 1) continue
      // 屏幕尺寸：世界宽高按投影缩放（近似：取中心的透视缩放）
      const d = cam.position.distanceTo(wp)
      const k = H / (2 * Math.tan(cam.fov * Math.PI / 360) * d)
      const w = n.width * n.sprite.scale.x * k, h = n.height * n.sprite.scale.y * k
      if (w < 4 || h < 3) continue
      boxes.push({ id: n.id, x: c.x, y: c.y, w, h, br: n.curBright ?? n.brightness })
    }
    let pairs = 0
    for (let i = 0; i < boxes.length; i++) {
      for (let j = i + 1; j < boxes.length; j++) {
        const a = boxes[i], b = boxes[j]
        if (Math.abs(a.x - b.x) < (a.w + b.w) / 2 && Math.abs(a.y - b.y) < (a.h + b.h) / 2) pairs++
      }
    }
    return { projectedSprites: boxes.length, overlapPairs: pairs, selected: s.selection }
  `)
  console.log('FOCUS_BEFORE =', JSON.stringify(focusInfo))
  await page.eval(`window.__nebula.scene.select(null)`)
  await new Promise((r) => setTimeout(r, 1200))

  /* ── ④ 猜想星团柔光：屏幕位置与半径 ── */
  await page.eval(`window.__nebula.scene.setView('overview')`)
  await new Promise((r) => setTimeout(r, 1800))
  const halo = await page.eval(`
    const s = window.__nebula.scene
    const cam = s.camera
    const V3 = cam.position.constructor
    const W = innerWidth, H = innerHeight
    cam.updateMatrixWorld()
    const proj = (x, y, z) => { const v = new V3(x, y, z); v.project(cam); return { x: (v.x * 0.5 + 0.5) * W, y: (-v.y * 0.5 + 0.5) * H } }
    const c = s.clusterCenter
    const hr = 52 * 1.35   // CLUSTER.radius × haloScale
    const right = new V3().setFromMatrixColumn(cam.matrixWorld, 0).normalize()
    const p0 = proj(c[0], c[1], c[2])
    const p1 = proj(c[0] + right.x * hr, c[1] + right.y * hr, c[2] + right.z * hr)
    const px = Math.hypot(p1.x - p0.x, p1.y - p0.y)
    const haloObj = s.clusterHaloRef
    return {
      center: { x: +p0.x.toFixed(1), y: +p0.y.toFixed(1) },
      radiusPx: +px.toFixed(1),
      haloVisible: !!(haloObj && haloObj.visible),
      geomType: haloObj ? haloObj.geometry.type : null,
      opacity: haloObj ? haloObj.material.opacity : null,
    }
  `)
  console.log('HALO_BEFORE =', JSON.stringify(halo))
  await page.shot(join(OUT, 'before-cluster-halo.png'))

  writeFileSync(join(OUT, 'before-probe.json'), JSON.stringify({ arms, focusInfo, halo }, null, 2))
} finally {
  await page.close()
}
