/**
 * 拍图例 / 面板的局部特写，并**用像素**确认它真的渲染出来了。
 *
 * ══ 这个脚本存在的理由（踩过的坑）══
 *
 * 图例底部有 11 行 10.5px 的类型小字 + 一行 9.5px 的「数据截至」。
 * 这类东西有三种坏法，而且**长得一模一样**：
 *   ① CSS 写错了（元素没渲染）
 *   ② 内容溢出被裁掉（浏览器不报错，只是切掉）
 *   ③ UI 正好处在"空闲淡出"的过渡中间（看起来暗，其实没问题）
 *
 * 我第一版脚本拍出来全是暗的，差点去改 CSS —— 实际上：
 *   - `getComputedStyle(#legend).opacity` 读到 **1**
 *   - 但同一时刻**像素**统计显示最亮只有 193 / ≥128 的像素占 0.06%
 * 两个数都在说真话，只是说的不是同一个时刻：
 * `poke()` 会**立刻**移除 body.idle，而 opacity 有 **0.7s 过渡**。
 * 在过渡中间截图就得到一张暗图；而 computed style 是查询那一刻的值。
 *
 * 所以这支脚本做三件事，缺一不可：
 *   ① 唤醒后**等到 opacity 真的到 1**（不是 sleep 一个猜的时长）
 *   ② 拍完**解码 PNG 数像素**，确认文字笔画与背景分离
 *   ③ 顺便量对比度，回答"够不够看清"而不是"能不能看清"
 *
 * 这也是为什么判据是"亮像素占比 > 0.5%"而不是"最亮像素 > 某值"：
 * 星空里有的是孤立亮点，最亮值很容易被一个星星拉高，
 * 而文字是**成片**的笔画 —— 占比才反映得出它。
 */
import { spawn } from 'node:child_process'
import { writeFileSync, readFileSync, mkdirSync } from 'node:fs'
import { inflateSync, deflateSync } from 'node:zlib'
import { setTimeout as sleep } from 'node:timers/promises'
import { requireChrome } from './_chrome.mjs'

const PORT = Number(process.env.PORT || 9462)
const URL_ = process.env.URL || 'http://127.0.0.1:5176/'
const OUT = 'shots/legend-types'
mkdirSync(OUT, { recursive: true })

const chrome = spawn(requireChrome(), [
  '--headless=new', '--no-sandbox', '--disable-gpu-sandbox', '--enable-unsafe-swiftshader', '--use-gl=angle', '--use-angle=swiftshader',
  `--remote-debugging-port=${PORT}`, `--user-data-dir=${process.env.TEMP}\\cdp-leg-${process.pid}`,
  '--window-size=1440,900', '--no-first-run', '--hide-scrollbars', 'about:blank',
], { stdio: 'ignore' })

class CDP {
  constructor(ws) { this.ws = ws; this.id = 0; this.waiting = new Map() }
  static async connect(url) {
    const ws = new WebSocket(url)
    await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej })
    const c = new CDP(ws)
    ws.onmessage = (m) => {
      const msg = JSON.parse(m.data)
      if (msg.id && c.waiting.has(msg.id)) {
        const { res, rej } = c.waiting.get(msg.id); c.waiting.delete(msg.id)
        msg.error ? rej(new Error(JSON.stringify(msg.error))) : res(msg.result)
      }
    }
    return c
  }
  send(method, params = {}) {
    const id = ++this.id
    return new Promise((res, rej) => { this.waiting.set(id, { res, rej }); this.ws.send(JSON.stringify({ id, method, params })) })
  }
}
async function ev(cdp, expr, tag = '') {
  const r = await cdp.send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true })
  if (r.exceptionDetails) throw new Error(`[${tag}] ${r.exceptionDetails.text}`)
  return r.result.value
}
async function waitFor(cdp, expr, label, ms = 120000) {
  const t0 = Date.now()
  for (;;) { if (await ev(cdp, expr)) return Date.now() - t0; if (Date.now() - t0 > ms) throw new Error(`超时: ${label}`); await sleep(300) }
}

/** 极简 PNG 解码（8 位 RGB / RGBA，全部 5 种 filter） */
function decodePng(file) {
  const buf = readFileSync(file)
  if (buf.readUInt32BE(0) !== 0x89504e47) throw new Error('不是 PNG')
  let pos = 8, w = 0, h = 0, colorType = 0
  const idat = []
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos)
    const type = buf.toString('ascii', pos + 4, pos + 8)
    const data = buf.subarray(pos + 8, pos + 8 + len)
    if (type === 'IHDR') { w = data.readUInt32BE(0); h = data.readUInt32BE(4); colorType = data[9] }
    else if (type === 'IDAT') idat.push(data)
    else if (type === 'IEND') break
    pos += 12 + len
  }
  const ch = colorType === 6 ? 4 : colorType === 2 ? 3 : 1
  const raw = inflateSync(Buffer.concat(idat))
  const stride = w * ch
  const px = Buffer.alloc(h * stride)
  let rp = 0
  for (let y = 0; y < h; y++) {
    const f = raw[rp++]
    const line = raw.subarray(rp, rp + stride); rp += stride
    const cur = px.subarray(y * stride, (y + 1) * stride)
    const prev = y > 0 ? px.subarray((y - 1) * stride, y * stride) : Buffer.alloc(stride)
    for (let i = 0; i < stride; i++) {
      const a = i >= ch ? cur[i - ch] : 0, b = prev[i], c = i >= ch ? prev[i - ch] : 0
      let v = line[i]
      if (f === 1) v += a; else if (f === 2) v += b
      else if (f === 3) v += (a + b) >> 1
      else if (f === 4) { const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c); v += (pa <= pb && pa <= pc) ? a : (pb <= pc ? b : c) }
      cur[i] = v & 0xff
    }
  }
  return { w, h, ch, px }
}
function pixelStats(file) {
  const { w, h, ch, px } = decodePng(file)
  const stride = w * ch
  let maxL = 0, sum = 0, above = 0
  const n = w * h
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const o = y * stride + x * ch
    const L = 0.2126 * px[o] + 0.7152 * px[o + 1] + 0.0722 * px[o + 2]
    if (L > maxL) maxL = L
    sum += L
    if (L >= 128) above++
  }
  return { w, h, maxL, avg: sum / n, brightPct: (above / n) * 100 }
}

/** PNG 编码（仅 8 位 RGB，filter 0 + zlib）。只为写出裁剪结果。 */
function encodePng(w, h, rgb) {
  const stride = w * 3
  const raw = Buffer.alloc(h * (stride + 1))
  for (let y = 0; y < h; y++) {
    raw[y * (stride + 1)] = 0
    rgb.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride)
  }
  const crcTable = []
  for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; crcTable[n] = c >>> 0 }
  const crc = (buf) => { let c = 0xffffffff; for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0 }
  const chunk = (type, data) => {
    const len = Buffer.alloc(4); len.writeUInt32BE(data.length)
    const td = Buffer.concat([Buffer.from(type, 'ascii'), data])
    const c = Buffer.alloc(4); c.writeUInt32BE(crc(td))
    return Buffer.concat([len, td, c])
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4)
  ihdr[8] = 8; ihdr[9] = 2; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

/** 从已解码的 PNG 里裁一块出来另存。
 *
 * 为什么不用 CDP 的 clip：面板是合成层，clip 截图会返回**纯黑**（见调用处注释）。
 * 整页截图是好的，所以走"整页 + 自己裁"这条路。 */
function cropPng(src, dst, x, y, w, h) {
  const { w: sw, h: sh, ch, px } = decodePng(src)
  const x0 = Math.max(0, Math.round(x)), y0 = Math.max(0, Math.round(y))
  const cw = Math.min(Math.round(w), sw - x0), chh = Math.min(Math.round(h), sh - y0)
  if (cw <= 0 || chh <= 0) throw new Error(`裁剪区域越界: ${x},${y},${w},${h}（图 ${sw}×${sh}）`)
  const out = Buffer.alloc(cw * chh * 3)
  for (let ry = 0; ry < chh; ry++) {
    for (let rx = 0; rx < cw; rx++) {
      const s = (y0 + ry) * sw * ch + (x0 + rx) * ch
      const d = (ry * cw + rx) * 3
      out[d] = px[s]; out[d + 1] = px[s + 1]; out[d + 2] = px[s + 2]
    }
  }
  writeFileSync(dst, encodePng(cw, chh, out))
  return { w: cw, h: chh }
}

let failures = 0
function ok(cond, label, detail = '') {
  console.log(`  ${cond ? '✓' : '✗'} ${label}${detail ? `　${detail}` : ''}`)
  if (!cond) failures++
}

try {
  let target = null
  for (let i = 0; i < 60 && !target; i++) {
    try { target = (await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()).find((t) => t.type === 'page') } catch { /* 还没起来 */ }
    if (!target) await sleep(300)
  }
  const cdp = await CDP.connect(target.webSocketDebuggerUrl)
  await cdp.send('Runtime.enable'); await cdp.send('Page.enable')
  await cdp.send('Page.navigate', { url: URL_ })
  await waitFor(cdp, '!!window.__nebula', '就绪')

  // Wake the HUD before polling its post-transition opacity. Waiting first
  // leaves body.idle=true forever, so the condition can never become true.
  for (let i = 0; i < 8; i++) {
    await cdp.send('Input.dispatchMouseEvent', {
      type: 'mouseMoved', x: 520 + i * 12, y: 300 + (i % 3) * 8, buttons: 0,
    })
    await sleep(60)
  }

  /* ── 唤醒 HUD 并**等到过渡结束** ──
   *
   * 轮询 opacity 而不是 sleep：过渡时长写在 CSS 里（0.7s），
   * 但实际值受节流与负载影响，而 headless 软件渲染下帧率只有几 FPS。
   * 查询真实值才靠得住。 */
  const tWake = await waitFor(cdp, `(() => {
    const l = document.querySelector('#legend')
    return l && parseFloat(getComputedStyle(l).opacity) > 0.99 && !document.body.classList.contains('idle')
  })()`, '图例完全显形')
  console.log(`  · HUD 完全显形（${(tWake / 1000).toFixed(1)}s）`)

  /* 截图前再戳一次：poke() 的 9 秒计时器可能刚好在这一刻到期 */
  await cdp.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 520, y: 300, buttons: 0 })

  const box = await ev(cdp, `(() => {
    const r = document.querySelector('#legend').getBoundingClientRect()
    return { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) }
  })()`, 'box')
  const vh = await ev(cdp, `window.innerHeight`, 'vh')

  // ① 溢出：浏览器不会为此报错，只会把内容切掉
  ok(box.y + box.h <= vh + 1, `图例完整落在视口内`,
    `下沿 ${box.y + box.h} / 视口 ${vh}`)

  // ② 全图（这就是用户看到的样子）+ 图例原尺寸特写
  const full = await cdp.send('Page.captureScreenshot', { format: 'png' })
  const fullPath = `${OUT}/full-1440.png`
  writeFileSync(fullPath, Buffer.from(full.data, 'base64'))
  /* ⚠ 截屏像素 ≠ CSS 视口坐标（实测 1440 的窗口给出 1424×805 的图）。
   * 不换算的话，靠近右边缘的元素（图例、面板）裁剪会越界。 */
  const vp = await ev(cdp, `({ iw: window.innerWidth, ih: window.innerHeight })`, 'vp')
  const sc0 = pixelStats(fullPath)
  const kx = sc0.w / vp.iw
  const ky = sc0.h / vp.ih
  const cropFile = `${OUT}/legend-native.png`
  cropPng(fullPath, cropFile,
    Math.round((box.x - 12) * kx), Math.round((box.y - 8) * ky),
    Math.round((box.w + 24) * kx), Math.round((box.h + 16) * ky))

  /* ③ 像素判据 —— 这才是"渲染出来了"的证据。
   * 阈值 0.5% 是实测选的：文字已渲染时约 4%，全暗时约 0.06%，
   * 中间空着一个数量级，取哪个值都不敏感。 */
  const s = pixelStats(cropFile)
  console.log(`  · 图例 ${s.w}×${s.h}  最亮 ${s.maxL.toFixed(0)}  平均 ${s.avg.toFixed(1)}  ≥128 的像素 ${s.brightPct.toFixed(2)}%`)
  ok(s.brightPct > 0.5, '图例文字笔画已渲染（不是暗图/空图）',
    `≥128 占 ${s.brightPct.toFixed(2)}%`)
  ok(s.maxL > 150, '图例里有足够亮的前景像素', `最亮 ${s.maxL.toFixed(0)}`)

  // ④ 内容完整性：11 个类型 + related + 数据截止标记，一个都不能少
  const legend = await ev(cdp, `(() => {
    const leg = document.querySelector('#legend')
    const rows = [...leg.querySelectorAll('.fam')].map(e => e.textContent.trim())
    const asof = leg.querySelector('.asof')
    const groups = [...leg.querySelectorAll('.fams')].map(g => (g.previousElementSibling?.textContent || '').trim())
    return { rows, asof: asof ? asof.textContent.trim() : null, groups }
  })()`, 'legend')
  console.log(`  · 图例分组: ${JSON.stringify(legend.groups)}`)
  console.log(`  · 数据截止: ${legend.asof}`)
  ok(!!legend.asof && /数据截至/.test(legend.asof), '图例里有「数据截至」标记', legend.asof || '(缺)')
  const typeRows = legend.rows.filter((r) => /·/.test(r))
  ok(typeRows.length >= 12, `类型行 ≥12（11 类 + related 兜底）`, `实为 ${typeRows.length}`)
  ok(legend.rows.some((r) => /陈述与相关/.test(r)), 'related 兜底以「陈述与相关」列出')
  ok(!legend.rows.some((r) => /undefined|NaN/.test(r)), '图例里没有 undefined / NaN')

  // ⑤ 面板：提出年 与 最新进展年 必须**分开显示**
  await ev(cdp, `window.__nebula.scene.select('cn-jacobian'); true`, 'select')
  await waitFor(cdp, `!!document.querySelector('#panel .meta')`, '面板 meta')
  /* ⚠ 必须等面板**滑进来**再量坐标。
   *
   * #panel 是 `transform: translateX(102%)` → `translateX(0)`，
   * 过渡 0.42s（ui.js 的 `#panel.on`）。元素一出现在 DOM 里
   * getBoundingClientRect 就有值了 —— 但那是**动画中**的值，
   * 面板还在屏幕外（实测 x=1450，视口只有 1424 宽）。
   * 拿它去裁剪会越界报错；如果当初没做越界检查，
   * 拍出来的就是一张右边被切掉的面板图。
   *
   * 判据用"面板右沿进了视口"而不是 sleep(500)：
   * 无头软件渲染下动画时长会被拉长，猜的时长不可靠。 */
  await waitFor(cdp, `(() => {
    const r = document.querySelector('#panel').getBoundingClientRect()
    return r.right <= window.innerWidth + 1 && r.left < window.innerWidth
  })()`, '面板滑入完成')
  const meta = await ev(cdp, `(() => {
    const e = document.querySelector('#panel .meta')
    return [...e.children].map(c => ({ t: c.textContent.trim(), color: getComputedStyle(c).color }))
  })()`, 'meta')
  console.log('  · 面板 meta: ' + meta.map((m) => `「${m.t}」`).join(' '))
  const progEl = meta.find((m) => /进展至/.test(m.t))
  const yearEl = meta.find((m) => /19\d\d|20\d\d/.test(m.t) && !/进展至/.test(m.t))
  ok(!!progEl, '面板显示「进展至 <年份>」', progEl ? progEl.t : '(缺)')
  ok(!!yearEl, '提出年份单独一格（没有被并进「进展至」）', yearEl ? yearEl.t : '(缺)')
  /* 颜色必须不同 —— 相同就说明两件事被渲染成了同一个东西，
   * 用户会把提出年误读成"最新进展"。 */
  ok(!!progEl && !!yearEl && progEl.color !== yearEl.color,
    '两个年份的颜色不同（不会看混）', progEl && yearEl ? `${progEl.color} vs ${yearEl.color}` : '')

  const metaBox = await ev(cdp, `(() => {
    const r = document.querySelector('#panel .meta').getBoundingClientRect()
    return { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) }
  })()`, 'metaBox')

  /* ⚠ 这里**不能**用 captureScreenshot 的 clip 参数拍面板。
   *
   * 实测：对 #panel .meta 做 clip 截图，返回的是一张 1197×156、
   * **960 字节纯黑**的 PNG —— 而同一时刻 DOM 里元素齐全、
   * getBoundingClientRect 尺寸正常、computed style 颜色也对。
   * 面板是 position:fixed 的合成层，clip 截图取不到它的内容。
   *
   * 这个失败特别阴：它**不报错**，只是产出一张黑图。
   * 如果我只检查"文件存在"，就会把一张黑图当成交付物发出去。
   *
   * 对策：先整页截图（那条路是好的），再自己按坐标裁像素。
   * 顺便也就有了像素判据 —— 裁完立刻数一遍亮度，
   * 空图/黑图当场就会被拦住。 */
  const fullAfter = await cdp.send('Page.captureScreenshot', { format: 'png' })
  const fullFile = `${OUT}/full-1440.png`
  writeFileSync(fullFile, Buffer.from(fullAfter.data, 'base64'))

  /* ⚠ 坐标要先换算：`--window-size=1440,900` 得到的截屏是 1424×805，
   * 而 getBoundingClientRect 用的是 CSS 视口坐标（innerWidth/innerHeight）。
   * 两者不是 1:1 —— 面板的 x 会是 1450，超出 1424 宽的图，
   * 裁剪当场越界报错。
   *
   * 直接拿比例缩放在这里也不对（差 16px 不是等比缩放，是窗口边框 + 滚动条）。
   * 正确做法是**分别归一化**：用 CSS 视口宽高把坐标映射到截屏像素。 */
  const dims = await ev(cdp, `({ iw: window.innerWidth, ih: window.innerHeight })`, 'dims')
  const shot0 = pixelStats(fullFile)
  const sx = shot0.w / dims.iw
  const sy = shot0.h / dims.ih
  const M = (v, k) => Math.round(v * k)
  console.log(`  · 视口 ${dims.iw}×${dims.ih} → 截屏 ${shot0.w}×${shot0.h}（缩放 ${sx.toFixed(3)}×${sy.toFixed(3)}）`)
  const pad = 8
  cropPng(fullFile, `${OUT}/panel-progress-year.png`,
    M(metaBox.x - pad, sx), M(metaBox.y - pad, sy),
    M(metaBox.w + pad * 2, sx), M(metaBox.h + pad * 2, sy))

  const ps = pixelStats(`${OUT}/panel-progress-year.png`)
  console.log(`  · 面板 meta 裁剪 ${ps.w}×${ps.h}  最亮 ${ps.maxL.toFixed(0)}  ≥128 占 ${ps.brightPct.toFixed(2)}%`)
  ok(ps.maxL > 120 && ps.brightPct > 1,
    '面板 meta 截图**不是黑图**（有真实文字像素）',
    `最亮 ${ps.maxL.toFixed(0)}，≥128 占 ${ps.brightPct.toFixed(2)}%`)

  const errs = await ev(cdp, `window.__nebula.errors ? window.__nebula.errors.length : 0`, 'errs')
  ok(errs === 0, '无控制台错误', `${errs} 条`)

  console.log(`\n  截图: ${OUT}/`)
  console.log(failures ? `\n✗ ${failures} 项未通过` : `\n✓ 全部通过`)
  process.exitCode = failures ? 1 : 0
} catch (e) {
  console.error('✗ ' + e.message)
  process.exitCode = 1
} finally { chrome.kill() }
