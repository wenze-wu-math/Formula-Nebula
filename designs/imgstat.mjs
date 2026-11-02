/**
 * designs/imgstat.mjs — 纯 Node 的 PNG 像素分析（零依赖，自带 zlib）。
 *
 * 为什么需要它：截图必须被**机器检查**，而不是只靠人眼说"看起来不错"。
 * 本工具给出可复现的数字证据，用来判断：
 *   - 画面是否真的画出来了（非空、颜色分布、亮度）
 *   - 是否出现"下半屏重复上半屏"这类渲染 bug
 *   - 两个版本之间改了多少（diff）
 *
 * 用法：
 *   node designs/imgstat.mjs <a.png>                       概览统计
 *   node designs/imgstat.mjs <a.png> --rows                 每 10% 高度带的统计
 *   node designs/imgstat.mjs <a.png> --repeat               检测纵向重复（半屏镜像/重复）
 *   node designs/imgstat.mjs <a.png> --crop x,y,w,h         只看某块区域
 *   node designs/imgstat.mjs <a.png> --diff <b.png>         两张图的差异
 *   node designs/imgstat.mjs <a.png> --json                 机器可读输出
 *
 * 退出码：0 正常；2 参数错误；3 解码失败。
 */
import { readFileSync } from 'node:fs'
import { inflateSync } from 'node:zlib'

/* ── PNG 解码（8-bit，color type 0/2/4/6，非隔行） ── */
function decodePng(buf) {
  if (buf.readUInt32BE(0) !== 0x89504e47) throw new Error('not a PNG')
  let off = 8
  let w = 0, h = 0, depth = 0, ctype = 0, interlace = 0
  const idat = []
  let plte = null, trns = null
  while (off < buf.length) {
    const len = buf.readUInt32BE(off)
    const type = buf.toString('ascii', off + 4, off + 8)
    const data = buf.subarray(off + 8, off + 8 + len)
    if (type === 'IHDR') {
      w = data.readUInt32BE(0); h = data.readUInt32BE(4)
      depth = data[8]; ctype = data[9]; interlace = data[12]
    } else if (type === 'PLTE') plte = data
    else if (type === 'tRNS') trns = data
    else if (type === 'IDAT') idat.push(data)
    else if (type === 'IEND') break
    off += 12 + len
  }
  if (depth !== 8) throw new Error(`unsupported bit depth ${depth}`)
  if (interlace) throw new Error('interlaced PNG unsupported')
  const ch = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 }[ctype]
  if (!ch) throw new Error(`unsupported color type ${ctype}`)
  const raw = inflateSync(Buffer.concat(idat))
  const stride = w * ch
  const out = Buffer.alloc(w * h * 4)
  const prev = Buffer.alloc(stride)
  let pos = 0
  for (let y = 0; y < h; y++) {
    const f = raw[pos++]
    const line = raw.subarray(pos, pos + stride); pos += stride
    const cur = Buffer.from(line)
    for (let i = 0; i < stride; i++) {
      const a = i >= ch ? cur[i - ch] : 0
      const b = prev[i]
      const c = i >= ch ? prev[i - ch] : 0
      let v = cur[i]
      if (f === 1) v += a
      else if (f === 2) v += b
      else if (f === 3) v += (a + b) >> 1
      else if (f === 4) {
        const p = a + b - c
        const pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c)
        v += (pa <= pb && pa <= pc) ? a : (pb <= pc ? b : c)
      }
      cur[i] = v & 0xff
    }
    for (let x = 0; x < w; x++) {
      const o = (y * w + x) * 4
      if (ctype === 6) { out[o] = cur[x * 4]; out[o + 1] = cur[x * 4 + 1]; out[o + 2] = cur[x * 4 + 2]; out[o + 3] = cur[x * 4 + 3] }
      else if (ctype === 2) { out[o] = cur[x * 3]; out[o + 1] = cur[x * 3 + 1]; out[o + 2] = cur[x * 3 + 2]; out[o + 3] = 255 }
      else if (ctype === 0) { out[o] = out[o + 1] = out[o + 2] = cur[x]; out[o + 3] = 255 }
      else if (ctype === 4) { out[o] = out[o + 1] = out[o + 2] = cur[x * 2]; out[o + 3] = cur[x * 2 + 1] }
      else if (ctype === 3) {
        const i3 = cur[x] * 3
        out[o] = plte[i3]; out[o + 1] = plte[i3 + 1]; out[o + 2] = plte[i3 + 2]
        out[o + 3] = trns && cur[x] < trns.length ? trns[cur[x]] : 255
      }
    }
    cur.copy(prev)
  }
  return { w, h, data: out }
}

/* ── 统计 ── */
const lum = (r, g, b) => 0.2126 * r + 0.7152 * g + 0.0722 * b

function region(img, x0, y0, x1, y1) {
  const { w, data } = img
  let sum = 0, n = 0, nonBg = 0, sat = 0
  const hist = new Array(16).fill(0)
  const colors = new Map()
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const o = (y * w + x) * 4
      const r = data[o], g = data[o + 1], b = data[o + 2]
      const L = lum(r, g, b)
      sum += L; n++
      hist[Math.min(15, L >> 4)]++
      const mx = Math.max(r, g, b), mn = Math.min(r, g, b)
      sat += mx === 0 ? 0 : (mx - mn) / mx
      if (L > 26) nonBg++
      const key = ((r >> 3) << 10) | ((g >> 3) << 5) | (b >> 3)
      colors.set(key, (colors.get(key) || 0) + 1)
    }
  }
  const top = [...colors.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8)
    .map(([k, c]) => ({
      hex: '#' + [((k >> 10) & 31) << 3, ((k >> 5) & 31) << 3, (k & 31) << 3].map((v) => v.toString(16).padStart(2, '0')).join(''),
      pct: +(100 * c / n).toFixed(2),
    }))
  return {
    px: n,
    meanLum: +(sum / n).toFixed(2),
    nonBgPct: +(100 * nonBg / n).toFixed(2),
    meanSat: +(sat / n).toFixed(4),
    hist,
    topColors: top,
    distinctColors: colors.size,
  }
}

/** 纵向重复检测：把图切成 k 条带，两两比较同一 x 范围的像素差 */
function repeatScore(img, bands = 8) {
  const { w, h, data } = img
  const bh = Math.floor(h / bands)
  const sig = []
  for (let i = 0; i < bands; i++) {
    const row = []
    for (let x = 0; x < w; x += 4) {
      let s = 0
      for (let y = i * bh; y < (i + 1) * bh; y += 4) {
        const o = (y * w + x) * 4
        s += lum(data[o], data[o + 1], data[o + 2])
      }
      row.push(s / Math.ceil(bh / 4))
    }
    sig.push(row)
  }
  const dist = (a, b) => {
    let s = 0
    for (let i = 0; i < a.length; i++) s += Math.abs(a[i] - b[i])
    return s / a.length
  }
  const pairs = []
  for (let i = 0; i < bands; i++) {
    for (let j = i + 1; j < bands; j++) {
      pairs.push({ a: i, b: j, d: +dist(sig[i], sig[j]).toFixed(2) })
    }
  }
  pairs.sort((x, y) => x.d - y.d)
  return { bands, bh, closest: pairs.slice(0, 5) }
}

function diff(a, b) {
  if (a.w !== b.w || a.h !== b.h) return { error: `size mismatch ${a.w}x${a.h} vs ${b.w}x${b.h}` }
  let changed = 0, sum = 0
  const n = a.w * a.h
  for (let i = 0; i < n; i++) {
    const o = i * 4
    const d = Math.abs(a.data[o] - b.data[o]) + Math.abs(a.data[o + 1] - b.data[o + 1]) + Math.abs(a.data[o + 2] - b.data[o + 2])
    if (d > 12) changed++
    sum += d
  }
  return { changedPct: +(100 * changed / n).toFixed(2), meanAbsDiff: +(sum / n / 3).toFixed(3) }
}

/* ── CLI ── */
const argv = process.argv.slice(2)
if (!argv[0]) {
  console.error('usage: node designs/imgstat.mjs <a.png> [--rows] [--repeat] [--crop x,y,w,h] [--diff b.png] [--json]')
  process.exit(2)
}
let A
try { A = decodePng(readFileSync(argv[0])) } catch (e) { console.error('[imgstat] decode failed:', e.message); process.exit(3) }

const flags = new Set()
const kv = {}
for (let i = 1; i < argv.length; i++) {
  if (argv[i].startsWith('--')) {
    const k = argv[i].slice(2)
    flags.add(k)
    if (k === 'crop' || k === 'diff') kv[k] = argv[++i]
  }
}
const out = { file: argv[0], w: A.w, h: A.h }
let box = [0, 0, A.w, A.h]
if (kv.crop) {
  const [x, y, w, h] = kv.crop.split(',').map(Number)
  box = [x, y, Math.min(A.w, x + w), Math.min(A.h, y + h)]
  out.crop = box
}
out.region = region(A, ...box)
if (flags.has('rows')) {
  out.rows = []
  for (let i = 0; i < 10; i++) {
    const y0 = Math.floor(A.h * i / 10), y1 = Math.floor(A.h * (i + 1) / 10)
    const r = region(A, 0, y0, A.w, y1)
    out.rows.push({ y0, y1, meanLum: r.meanLum, nonBgPct: r.nonBgPct, distinctColors: r.distinctColors })
  }
}
if (flags.has('repeat')) out.repeat = repeatScore(A)
if (kv.diff) {
  try { out.diff = diff(A, decodePng(readFileSync(kv.diff))) } catch (e) { out.diff = { error: e.message } }
}

if (flags.has('json')) {
  console.log(JSON.stringify(out, null, 2))
} else {
  const r = out.region
  console.log(`${out.file}  ${out.w}x${out.h}${out.crop ? `  crop=${out.crop.join(',')}` : ''}`)
  console.log(`  平均亮度 ${r.meanLum} / 255    非背景像素 ${r.nonBgPct}%    平均饱和 ${r.meanSat}    颜色种类 ${r.distinctColors}`)
  console.log(`  主要颜色: ${r.topColors.map((c) => `${c.hex} ${c.pct}%`).join('  ')}`)
  console.log(`  亮度直方图(16档): ${r.hist.join(' ')}`)
  if (out.rows) {
    console.log('  每 10% 高度带:')
    for (const row of out.rows) console.log(`    y ${String(row.y0).padStart(4)}-${String(row.y1).padStart(4)}  亮度 ${String(row.meanLum).padStart(6)}  非背景 ${String(row.nonBgPct).padStart(5)}%  颜色 ${row.distinctColors}`)
  }
  if (out.repeat) {
    console.log(`  纵向重复检测（${out.repeat.bands} 条带，取最相似的 5 对，值越小越像）:`)
    for (const p of out.repeat.closest) console.log(`    带${p.a} vs 带${p.b}  距离 ${p.d}`)
  }
  if (out.diff) {
    if (out.diff.error) console.log('  diff:', out.diff.error)
    else console.log(`  diff: ${out.diff.changedPct}% 像素改变，平均绝对差 ${out.diff.meanAbsDiff}`)
  }
}
