/**
 * tools/orch/check-repeat.mjs — 直接检验"截图在某个 y 以下重复了画面上部"这个断言。
 *
 * 为什么不用 imgstat --repeat：它把图切成 8 条带两两比较，而一张连续的地图里**相邻条带本来就相似**
 * （陆地、海洋、文字在各处都有），于是"最相似的一对"永远落在相邻带上，数值大小无法区分
 * "正常连续画面"与"真的重复了半屏"。这个检验换个问法：
 *
 *   对每个纵向偏移 d，算 D(d) = 全图平均 |lum(x, y) − lum(x, y − d)|
 *   · 若画面在 y ≈ Y 以下重复了顶部，则 D(Y) 会显著低于其邻域（一个尖谷）；
 *   · 若没有重复，D(d) 随 d 单调缓升，不存在孤立低谷。
 *
 * 判据：若 D 在 [0.7Y, 1.3Y] 邻域内没有比邻域中位数低 25% 以上的孤立低谷 → 不存在重复。
 *
 * 用法：node designs/map/tools/orch/check-repeat.mjs <a.png> [b.png ...]
 * 退出码：0 无重复；1 疑似重复；3 解码失败。
 */
import { readFileSync } from 'node:fs'
import { inflateSync } from 'node:zlib'

/** PNG 解码（8-bit，color type 0/2/4/6，非隔行）——与 designs/imgstat.mjs 同源 */
function decodePng(buf) {
  if (buf.readUInt32BE(0) !== 0x89504e47) throw new Error('not a PNG')
  let off = 8, w = 0, h = 0, depth = 0, ctype = 0, interlace = 0
  const idat = []
  while (off < buf.length) {
    const len = buf.readUInt32BE(off)
    const type = buf.toString('ascii', off + 4, off + 8)
    const data = buf.subarray(off + 8, off + 8 + len)
    if (type === 'IHDR') { w = data.readUInt32BE(0); h = data.readUInt32BE(4); depth = data[8]; ctype = data[9]; interlace = data[12] }
    else if (type === 'IDAT') idat.push(data)
    else if (type === 'IEND') break
    off += 12 + len
  }
  if (depth !== 8) throw new Error(`unsupported bit depth ${depth}`)
  if (interlace) throw new Error('interlaced PNG unsupported')
  const ch = { 0: 1, 2: 3, 4: 2, 6: 4 }[ctype]
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
    }
    cur.copy(prev)
  }
  return { w, h, data: out }
}

const lum = (r, g, b) => 0.2126 * r + 0.7152 * g + 0.0722 * b

/** 亮度平面（每 2 像素取样，够快也够灵敏） */
function lumaPlane(img) {
  const { w, h, data } = img
  const W = Math.floor(w / 2), H = h
  const p = new Float32Array(W * H)
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const o = (y * w + x * 2) * 4
    p[y * W + x] = lum(data[o], data[o + 1], data[o + 2])
  }
  return { p, W, H }
}

/** D(d)：y 与 y−d 的平均绝对亮度差 */
function profile(pl, d) {
  const { p, W, H } = pl
  let s = 0, n = 0
  for (let y = d; y < H; y++) {
    const a = y * W, b = (y - d) * W
    for (let x = 0; x < W; x++) { s += Math.abs(p[a + x] - p[b + x]); n++ }
  }
  return n ? s / n : 0
}

const files = process.argv.slice(2)
if (!files.length) { console.error('usage: node designs/map/tools/orch/check-repeat.mjs <a.png> [...]'); process.exit(2) }

let suspect = 0
for (const f of files) {
  let img
  try { img = decodePng(readFileSync(f)) } catch (e) { console.error(`[check-repeat] ${f} 解码失败: ${e.message}`); process.exit(3) }
  const pl = lumaPlane(img)
  const H = pl.H
  const half = Math.round(H / 2)
  // 候选重复量 d：从 40% 到 95% 画面高（"下半屏重复上半屏"落在这个区间）
  const d0 = Math.max(8, Math.round(H * 0.40)), d1 = Math.min(H - 1, Math.round(H * 0.95))
  const prof = []
  for (let d = d0; d <= d1; d++) prof.push({ d, v: profile(pl, d) })
  // 找"孤立低谷"：某点的值比左右各 6% 画面高的邻域中位数低 25% 以上
  const win = Math.max(6, Math.round(H * 0.06))
  const sorted = prof.map((q) => q.v).slice().sort((a, b) => a - b)
  const med = sorted[sorted.length >> 1]
  let worst = null
  for (let i = 0; i < prof.length; i++) {
    const near = prof.filter((_, j) => Math.abs(j - i) > win && Math.abs(j - i) <= 2 * win).map((q) => q.v)
    if (near.length < 5) continue
    near.sort((a, b) => a - b)
    const local = near[near.length >> 1]
    const drop = local > 1e-6 ? 1 - prof[i].v / local : 0
    if (!worst || drop > worst.drop) worst = { ...prof[i], drop, local }
  }
  const dHalf = profile(pl, half)
  const repeatFound = !!(worst && worst.drop > 0.25)
  if (repeatFound) suspect++
  console.log(`\n${f}  ${img.w}x${img.h}`)
  console.log(`  候选重复量 d ∈ [${d0}, ${d1}]，全区间中位距离 ${med.toFixed(2)}`)
  console.log(`  最像的一对：d=${worst.d}（y 与 y−${worst.d}）距离 ${worst.v.toFixed(2)}，邻域中位 ${worst.local.toFixed(2)}，低 ${(worst.drop * 100).toFixed(1)}%`)
  console.log(`  半屏对照：d=${half} 距离 ${dHalf.toFixed(2)}（${(dHalf / med).toFixed(2)}× 中位）`)
  console.log(`  结论：${repeatFound ? '⚠ 存在孤立低谷，疑似纵向重复' : '未发现纵向重复（无孤立低谷，d 剖面随 d 平缓变化）'}`)
}
process.exit(suspect ? 1 : 0)
