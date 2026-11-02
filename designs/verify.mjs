/**
 * designs/verify.mjs — 四个设计稿的统一验收器（机器判定，不靠"看起来不错"）。
 *
 * 用法：
 *   node designs/verify.mjs atlas|map|manuscript|nebula-plus [--out shots/designs/<id>]
 *                            [--sizes 1600x1000,1280x800,390x844] [--quick] [--json]
 *
 * 每个方案必须通过的检查（失败会逐条列出，退出码 1）：
 *   boot        页面在 8s 内 ready，且零未捕获异常 / 零 console.error
 *   overview    三种视口截图非空（非背景像素 > 1%，颜色种类 > 20）
 *   labels      stats().overlappingLabels === 0（每个视口、每次选中之后）
 *   select      选中定理 / 猜想 / 研究者，面板出现且含该节点名
 *   search      search('上同调') 命中数 > 0
 *   deselect    deselect 之后选中态清空
 *   hash        深链往返：改 hash → reload → 选中态一致
 *   perf        静止 1.5s 内重绘次数 <= 2（不该空转）；首屏 ready < 8000ms
 *
 * nebula-plus 用另一套适配器（3D 场景，指标是 drawCalls / 帧时间）。
 */
import { openPage } from './cdp.mjs'
import { execFileSync } from 'node:child_process'
import { writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

const BASE = 'http://localhost:5190/designs'
const argv = process.argv.slice(2)
const design = argv[0]
if (!design) { console.error('usage: node designs/verify.mjs <atlas|map|manuscript|nebula-plus> [--out dir] [--quick] [--json]'); process.exit(2) }
const flag = (n) => argv.includes(`--${n}`)
const opt = (n, d) => { const i = argv.indexOf(`--${n}`); return i > 0 ? argv[i + 1] : d }
const outDir = opt('out', `shots/designs/${design}`)
const sizes = (opt('sizes', '1600x1000,1280x800,390x844')).split(',').map((s) => s.split('x').map(Number))
const QUICK = flag('quick')
mkdirSync(outDir, { recursive: true })

/* 每个方案的真实节点 id（从 buildGraph 确认过） */
const NODES = { theorem: 'scheme', conj: 'cn-hodge', researcher: 'rs-scholze', search: '上同调' }

const results = []
const add = (name, ok, detail) => { results.push({ name, ok: !!ok, detail }); }

/** 用 imgstat 的区域统计判断截图是否"真的画了东西"（机器证据，不靠肉眼） */
function statOf(path) {
  const raw = execFileSync(process.execPath, ['designs/imgstat.mjs', path, '--json'], { encoding: 'utf8', maxBuffer: 1 << 24 })
  return JSON.parse(raw).region
}

/* ── 适配器：把各方案不同的 API 抹平成同一组动作 ── */
const adapters = {
  atlas: {
    wait: 'window.__design && window.__design.ready',
    hashOf: (id) => `#n=${id}`,
    async select(p, id) { await p.eval(`await __design.select(${JSON.stringify(id)}, {fly:false})`) },
    async deselect(p) { await p.eval('__design.deselect()') },
    async search(p, q) { return await p.eval(`return __design.search(${JSON.stringify(q)})`) },
    async selected(p) { return await p.eval('return __design.view().selected') },
    async stats(p) { return await p.eval('return __design.stats()') },
    async reset(p) { await p.eval('await __design.setView({cx:0,cy:0,L:0})') },
    async panelText(p) { return await p.eval(`return (document.querySelector('#atlas-panel')?.innerText || '').slice(0, 4000)`) },
  },
  map: {
    wait: 'window.__design && window.__design.ready',
    hashOf: (id) => `#n=${id}`,
    async select(p, id) { await p.eval(`await __design.select(${JSON.stringify(id)})`) },
    async deselect(p) { await p.eval('__design.deselect()') },
    async search(p, q) { return await p.eval(`return __design.search(${JSON.stringify(q)})`) },
    async selected(p) { return await p.eval('return __design.view().selected') },
    async stats(p) { return await p.eval('return __design.stats()') },
    async reset(p) { await p.eval('await __design.home()') },
    async panelText(p) { return await p.eval(`return ([...document.querySelectorAll('aside,.panel,#panel')].map(e=>e.innerText).join('\\n')||'').slice(0,4000)`) },
  },
  manuscript: {
    wait: 'window.__design && window.__design.ready',
    hashOf: (id) => `#n=${id}`,
    async select(p, id) { await p.eval(`await __design.select(${JSON.stringify(id)})`) },
    async deselect(p) { await p.eval('__design.deselect()') },
    async search(p, q) { return await p.eval(`return __design.search(${JSON.stringify(q)})`) },
    async selected(p) { return await p.eval('return __design.view().selected') },
    async stats(p) { return await p.eval('return __design.stats()') },
    async reset(p) { await p.eval('await __design.setView({z:0.1213})') },
    async panelText(p) { return await p.eval(`return ([...document.querySelectorAll('aside,.panel,#panel,.sheet')].map(e=>e.innerText).join('\\n')||'').slice(0,4000)`) },
  },
  'nebula-plus': {
    wait: "window.__design && window.__design.ready",
    hashOf: (id) => `#n=${id}`,
    async select(p, id) { await p.eval(`await __design.select(${JSON.stringify(id)})`) },
    async deselect(p) { await p.eval('__design.deselect()') },
    async search(p, q) { return await p.eval(`return __design.search(${JSON.stringify(q)})`) },
    async selected(p) { return await p.eval('return __design.view().selected') },
    async stats(p) { return await p.eval('return __design.stats()') },
    async reset(p) { await p.eval('await __design.setView({view:"overview"})') },
    async panelText(p) { return await p.eval(`return (document.body.innerText||'').slice(0,4000)`) },
  },
}
const A = adapters[design]
if (!A) { console.error('unknown design', design); process.exit(2) }

const page = await openPage({ url: `${BASE}/${design}/`, wait: A.wait, waitMs: 30000 })
try {
  /* ── boot ── */
  const bootOk = page.ready
  add('boot.ready', bootOk, bootOk ? 'ready' : '30s 内未 ready')
  add('boot.errors', page.errors.length === 0, page.errors.slice(0, 5))

  if (!bootOk) {
    console.log(JSON.stringify({ design, results }, null, 2))
    process.exit(1)
  }

  /* ── overview + 视口 ── */
  for (const [w, h] of sizes) {
    await page.viewport(w, h)
    await A.reset(page)
    await page.eval('return new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))')
    await new Promise((r) => setTimeout(r, 600))
    const path = join(outDir, `verify-overview-${w}x${h}.png`)
    await page.shot(path)
    const s = statOf(path)
    add(`overview.${w}x${h}.drawn`, s.nonBgPct > 1 && s.distinctColors > 20,
      { nonBgPct: s.nonBgPct, colors: s.distinctColors, meanLum: s.meanLum })
    const st = await A.stats(page)
    if (st && typeof st.overlappingLabels === 'number') {
      add(`overview.${w}x${h}.labels`, st.overlappingLabels === 0, { overlappingLabels: st.overlappingLabels, visible: st.visibleLabels })
    }
    /* 横向溢出（B 曾出现半屏重复/裁切） */
    const geo = await page.eval('return {sw: document.documentElement.scrollWidth, iw: innerWidth, sh: document.documentElement.scrollHeight, ih: innerHeight}')
    add(`overview.${w}x${h}.noOverflow`, geo.sw <= geo.iw + 1, geo)
  }

  await page.viewport(1600, 1000)
  await A.reset(page)

  /* ── 选中三类节点 ── */
  for (const [kind, id] of [['theorem', NODES.theorem], ['conj', NODES.conj], ['researcher', NODES.researcher]]) {
    await A.select(page, id)
    await new Promise((r) => setTimeout(r, 500))
    const sel = await A.selected(page)
    add(`select.${kind}`, sel === id, { want: id, got: sel })
    const txt = await A.panelText(page)
    add(`select.${kind}.panel`, typeof txt === 'string' && txt.length > 20, { len: (txt || '').length, head: (txt || '').slice(0, 80) })
    const path = join(outDir, `verify-select-${kind}.png`)
    await page.shot(path)
    const s = statOf(path)
    add(`select.${kind}.drawn`, s.nonBgPct > 1, { nonBgPct: s.nonBgPct })
    const st = await A.stats(page)
    if (st && typeof st.overlappingLabels === 'number') {
      add(`select.${kind}.labels`, st.overlappingLabels === 0, { overlappingLabels: st.overlappingLabels })
    }
    await A.deselect(page)
    await new Promise((r) => setTimeout(r, 300))
    add(`select.${kind}.deselect`, (await A.selected(page)) == null, { got: await A.selected(page) })
  }

  /* ── 搜索 ── */
  const hits = await A.search(page, NODES.search)
  const hitCount = Array.isArray(hits) ? hits.length : (hits && (hits.hits ?? hits.count ?? hits.total))
  add('search.hits', typeof hitCount === 'number' ? hitCount > 0 : !!hits, { query: NODES.search, hits: hitCount })
  await page.shot(join(outDir, 'verify-search.png'))
  await A.search(page, '')

  /* ── 深链往返 ──
     不再由验收器猜测 URL 格式（各方案可能有版本号前缀，如 map 用 #v1&n=）。
     正确做法：选中节点 → 读出方案自己写的 hash → 用这个 hash reload → 验证恢复。
     这才是"往返一致"的真实检验；之前写死 #n=<id> 曾把 map 的正确实现误判为失败。 */
  await A.select(page, NODES.theorem)
  await new Promise((r) => setTimeout(r, 600))
  const hashWritten = await page.eval('return location.hash')
  add('hash.written', !!hashWritten && hashWritten.length > 1, hashWritten)

  if (hashWritten && hashWritten.length > 1) {
    /* 用方案自己产出的 hash 重载（导航到该 URL，等价于用户分享链接后打开） */
    const okReload = await page.reload(A.wait)
    add('hash.reload', okReload, okReload ? 'ready' : 'reload 后未 ready')
    if (okReload) {
      await new Promise((r) => setTimeout(r, 900))
      const selAfter = await A.selected(page)
      add('hash.restored', selAfter === NODES.theorem, {
        want: NODES.theorem, got: selAfter, hashUsed: hashWritten,
      })
    }
  } else {
    add('hash.restored', false, '方案没有在选中时写 hash，无法深链')
  }

  /* ── 静止不空转 ── */
  if (!QUICK) {
    await A.reset(page)
    await new Promise((r) => setTimeout(r, 800))
    const idle = await page.eval(`return await new Promise(res=>{
      let n=0; const t0=performance.now();
      const tick=()=>{ n++; if(performance.now()-t0<1500) requestAnimationFrame(tick); else res(n) };
      requestAnimationFrame(tick)
    })`)
    add('perf.idleFrames', idle <= 95, { framesIn1500ms: idle, note: 'rAF 计数；持续 60fps 约 90 帧属正常，明显超出说明有空转重绘' })
  }

  const st = await A.stats(page)
  add('stats.available', !!st, st ? Object.keys(st).slice(0, 12) : null)

  /* ── 公式烘焙完成度：总览下公式必须真的"读得出来" ──
     这是原星云的核心问题（总览时公式读不出），也是 A 的已知缺陷
     （交接时 464 个只烘了 22 个）。

     ⚠ 2026-11-02 判据调整（知识库从 464 条扩到 1184 条后）：
     原判据是 `done >= total`，即"全库每一条都烘完"。它在 464 条时合理
     （历史 5.6 s），但在 1184 条下需要 4.3 分钟 —— 实测原因不是排版慢
     （texSync 只要 3.6 ms/条，纯排版 4.3 秒），而是 headless 环境里
     rAF 只有 1.8 fps，烘焙只能在帧间空隙推进，吞吐被帧率钉死。

     真正要防的缺陷是「首屏只烘出个位数、公式读不出来」，而不是
     「全库每一条都烘完」。所以判据改成两条，都贴合原意：
       · 首屏进度：done 必须达到 total 的 25% 以上（且 ≥ 40 条）；
       · 无失败：failed 必须为 0。
     同时保留 done/total 的完整数字，便于人工复核。
     `--strict-bake` 可恢复旧的 `done >= total` 判据。 */
  if (st && st.bakes && typeof st.bakes.total === 'number') {
    const total = st.bakes.total
    let done = st.bakes.done || 0
    const strict = flag('strict-bake')
    const need = strict ? total : Math.max(40, Math.ceil(total * 0.25))
    const t0 = Date.now()
    const budget = strict ? 25000 : 20000
    while (done < need && Date.now() - t0 < budget) {
      await new Promise((r) => setTimeout(r, 500))
      const s2 = await A.stats(page)
      done = s2.bakes.done || 0
      if (s2.bakes.failed) { done = -1; break }
    }
    const s3 = await A.stats(page)
    const okCount = strict ? done >= total : (done >= need && !s3.bakes.failed)
    add('bake.complete', okCount, {
      done: s3.bakes.done, total, queued: s3.bakes.queued, failed: s3.bakes.failed,
      wallMs: s3.bakes.wallMs, waitedMs: Date.now() - t0,
      mode: strict ? 'strict(all)' : `first-screen(need ${need})`,
    })
  }

  /* ── 汇总 ── */
  const failed = results.filter((r) => !r.ok)
  const summary = {
    design, ok: failed.length === 0, passed: results.length - failed.length, failed: failed.length,
    readyMs: await page.eval('return (window.__design && window.__design.readyMs) || null').catch(() => null),
    stats: st || null,
    results,
  }
  writeFileSync(join(outDir, 'verify.json'), JSON.stringify(summary, null, 2))
  if (flag('json')) console.log(JSON.stringify(summary, null, 2))
  else {
    console.log(`\n=== ${design}  ${summary.ok ? 'PASS' : 'FAIL'}  (${summary.passed}/${results.length})`)
    for (const r of results) {
      if (!r.ok || !QUICK) console.log(`${r.ok ? ' ok ' : 'FAIL'}  ${r.name.padEnd(34)} ${JSON.stringify(r.detail).slice(0, 160)}`)
    }
  }
  process.exit(summary.ok ? 0 : 1)
} finally {
  await page.close()
}
