/**
 * designs/atlas/diag10.mjs — 一次性诊断：导出**全部 464 个**公式在 L=0 的屏幕位置与真实位图尺寸。
 *
 *   node designs/atlas/diag10.mjs [outfile]
 *
 * 目的：验证"L=0 的 40 个候选是否挤在中心一小块"这个假设。
 * 如果确实挤在一起，那么"总览放 40 条可读公式"就不可能靠"提升烘焙速度"实现，
 * 只能靠"改候选集的选取方式"（按可放置性而不是纯 importance）。
 */
import { openPage } from '../cdp.mjs'
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname } from 'node:path'

const out = process.argv[2] || 'shots/designs/atlas/capacity-all.json'
const page = await openPage({
  url: 'http://localhost:5190/designs/atlas/',
  wait: 'window.__design && window.__design.ready', waitMs: 60000,
  port: 9500 + Math.floor(Math.random() * 300),
})
if (!page.ready) { console.error('未 ready'); process.exit(3) }

/* 分批算尺寸，避免一次 464 个 texSync 占满主线程（会被 HMR 重载打断） */
const data = await page.eval(`
  const { texSync } = await import('/designs/shared/tex.js')
  const C = await import('/designs/atlas/constants.js')
  const a = __design.atlas
  const v = __design.view()
  const MJ = 64
  const all = [...a.stars, ...a.dsos]
  const res = []
  for (const b of all) {
    const node = b.node
    if (!node || !node.latex) { res.push({ id: b.id, bad: true }); continue }
    let r
    try { r = texSync(node.latex, node.cluster ? C.CONJ_HEX : C.INK_HEX) } catch { res.push({ id: b.id, bad: true }); continue }
    let px = b.formulaPx
    let w = r.widthPx * px / MJ
    if (w > C.LABEL_MAX_W) { px = Math.max(C.FORMULA_MIN_PX, px * C.LABEL_MAX_W / w); w = r.widthPx * px / MJ }
    let h = r.heightPx * px / MJ
    if (w > C.LABEL_MAX_W) { const k = C.LABEL_MAX_W / w; w = C.LABEL_MAX_W; h *= k; px *= k }
    const p = __design.screenOf(b.id)
    res.push({ id: b.id, kind: b.kind, imp: b.importance, labelL: b.labelL, nameL: b.nameL,
               mag: b.mag || 0, tier: b.tier || 0,
               x: Math.round(p.x * 100) / 100, y: Math.round(p.y * 100) / 100, r: Math.round(p.r * 100) / 100,
               w: Math.round((w + 2 * C.BAKE_PAD) * 100) / 100, h: Math.round((h + 2 * C.BAKE_PAD) * 100) / 100,
               px: Math.round(px * 100) / 100 })
  }
  const obst = []
  for (const s of a.stars) { if (s.mag > 2) break; const p = __design.screenOf(s.id); obst.push({ id: s.id, x: Math.round(p.x*100)/100, y: Math.round(p.y*100)/100, r: Math.round(p.r*100)/100 }) }
  for (const d of a.dsos) { if (d.tier > 1) break; const p = __design.screenOf(d.id); obst.push({ id: d.id, x: Math.round(p.x*100)/100, y: Math.round(p.y*100)/100, r: Math.round(p.r*100)/100 }) }
  return { view: { w: v.w, h: v.h, L: v.L, zoom: v.zoom }, consts: {
    LABEL_MAX_W: C.LABEL_MAX_W, FORMULA_MIN_PX: C.FORMULA_MIN_PX, BAKE_PAD: C.BAKE_PAD,
    LABEL_PAD: C.LABEL_PAD, LABEL_GAP: C.LABEL_GAP, MAG_LABEL_L: C.MAG_LABEL_L, DSO_LABEL_L: C.DSO_LABEL_L,
  }, all: res, obst }
`)
mkdirSync(dirname(out), { recursive: true })
writeFileSync(out, JSON.stringify(data, null, 2))

const ok = data.all.filter((b) => !b.bad)
const cand = ok.filter((b) => b.labelL <= 0.15)
const xs = cand.map((b) => b.x), ys = cand.map((b) => b.y)
console.log(`saved ${out}`)
console.log(`全部 ${ok.length} 条；L=0 候选 ${cand.length} 条`)
console.log(`候选 x 范围 ${Math.min(...xs).toFixed(0)}..${Math.max(...xs).toFixed(0)}  y 范围 ${Math.min(...ys).toFixed(0)}..${Math.max(...ys).toFixed(0)}`)
console.log(`候选包围盒 ${(Math.max(...xs) - Math.min(...xs)).toFixed(0)}×${(Math.max(...ys) - Math.min(...ys)).toFixed(0)} px`)
const allXs = ok.map((b) => b.x), allYs = ok.map((b) => b.y)
console.log(`全部 x 范围 ${Math.min(...allXs).toFixed(0)}..${Math.max(...allXs).toFixed(0)}  y 范围 ${Math.min(...allYs).toFixed(0)}..${Math.max(...allYs).toFixed(0)}`)
await page.close()
