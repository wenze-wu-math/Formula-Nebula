// 手写 PNG 解码 + 像素统计，用来验证渲染结果不是黑屏/空白
// 用法: node scripts/analyze-png.mjs shots/nebula.png
import { readFileSync } from 'node:fs'
import { inflateSync } from 'node:zlib'

const file = process.argv[2] || 'shots/nebula.png'
const buf = readFileSync(file)

if (buf.readUInt32BE(0) !== 0x89504e47) throw new Error('不是 PNG')

let pos = 8
let width = 0, height = 0, bitDepth = 0, colorType = 0
const idat = []

while (pos < buf.length) {
  const len = buf.readUInt32BE(pos)
  const type = buf.toString('ascii', pos + 4, pos + 8)
  const data = buf.subarray(pos + 8, pos + 8 + len)

  if (type === 'IHDR') {
    width = data.readUInt32BE(0)
    height = data.readUInt32BE(4)
    bitDepth = data[8]
    colorType = data[9]
  } else if (type === 'IDAT') {
    idat.push(data)
  } else if (type === 'IEND') break

  pos += 12 + len
}

if (bitDepth !== 8) throw new Error('仅支持 8 位深度，实际 ' + bitDepth)
const channels = { 0: 1, 2: 3, 4: 2, 6: 4 }[colorType]
if (!channels) throw new Error('不支持的颜色类型 ' + colorType)

const raw = inflateSync(Buffer.concat(idat))
const stride = width * channels
const px = Buffer.alloc(height * stride)

// 反滤波
for (let y = 0; y < height; y++) {
  const ft = raw[y * (stride + 1)]
  const line = raw.subarray(y * (stride + 1) + 1, y * (stride + 1) + 1 + stride)
  const cur = px.subarray(y * stride, (y + 1) * stride)
  const prev = y > 0 ? px.subarray((y - 1) * stride, y * stride) : null

  for (let x = 0; x < stride; x++) {
    const a = x >= channels ? cur[x - channels] : 0
    const b = prev ? prev[x] : 0
    const c = (prev && x >= channels) ? prev[x - channels] : 0
    let v = line[x]
    switch (ft) {
      case 1: v += a; break
      case 2: v += b; break
      case 3: v += (a + b) >> 1; break
      case 4: {
        const p = a + b - c
        const pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c)
        v += (pa <= pb && pa <= pc) ? a : (pb <= pc ? b : c)
        break
      }
    }
    cur[x] = v & 0xff
  }
}

// ── 统计 ──
let nonBlack = 0, bright = 0, veryBright = 0
let sumL = 0
const hist = new Array(16).fill(0)
const hues = new Map()

// 把画面分成 4x4 网格，看亮度分布是否均匀（判断是否只有局部有东西）
const G = 4
const grid = Array.from({ length: G }, () => new Array(G).fill(0))
const gridN = Array.from({ length: G }, () => new Array(G).fill(0))

for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const o = y * stride + x * channels
    const r = px[o], g = px[o + 1], b = px[o + 2]
    const L = 0.2126 * r + 0.7152 * g + 0.0722 * b

    sumL += L
    if (L > 12) nonBlack++
    if (L > 80) bright++
    if (L > 170) veryBright++
    hist[Math.min(15, Math.floor(L / 16))]++

    // 只对明显亮的像素做色相统计
    if (L > 60) {
      const key = `${r >> 5},${g >> 5},${b >> 5}`
      hues.set(key, (hues.get(key) || 0) + 1)
    }

    const gx = Math.min(G - 1, Math.floor(x / width * G))
    const gy = Math.min(G - 1, Math.floor(y / height * G))
    grid[gy][gx] += L
    gridN[gy][gx]++
  }
}

const total = width * height
console.log('图像尺寸      :', width + '×' + height)
console.log('颜色类型      :', colorType, '(通道数 ' + channels + ')')
console.log('平均亮度      :', (sumL / total).toFixed(2))
console.log('非黑像素占比  :', (nonBlack / total * 100).toFixed(2) + '%')
console.log('较亮像素占比  :', (bright / total * 100).toFixed(3) + '%')
console.log('高亮像素占比  :', (veryBright / total * 100).toFixed(3) + '%')

console.log('\n亮度直方图 (0-15 档):')
const maxH = Math.max(...hist)
hist.forEach((v, i) => {
  const bar = '█'.repeat(Math.round(v / maxH * 46))
  console.log(String(i * 16).padStart(4) + ' |' + bar + ' ' + (v / total * 100).toFixed(2) + '%')
})

console.log('\n画面 4×4 网格平均亮度 (判断内容是否铺开):')
for (let gy = 0; gy < G; gy++) {
  console.log('  ' + grid[gy].map((s, gx) => (s / gridN[gy][gx]).toFixed(1).padStart(7)).join(''))
}

console.log('\n最亮的 8 种颜色 (量化到 32 级):')
const top = [...hues.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8)
for (const [k, v] of top) {
  const [r, g, b] = k.split(',').map(Number)
  console.log(`  rgb(${r * 32},${g * 32},${b * 32})  ×${v}`)
}
if (!top.length) console.log('  (没有明显亮像素)')
