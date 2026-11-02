/**
 * ═══════════════════════════════════════════════════════════════
 *  光晕贴图
 * ═══════════════════════════════════════════════════════════════
 *
 *  为什么要单独做光晕，而不是把公式调亮一点了事：
 *
 *  ① bloom（UnrealBloomPass）是**整屏后处理**，它只认"像素亮度超过阈值"。
 *     想让某个公式发光，就得把它调到阈值以上；但本项目的亮度上限压在
 *     1.42 —— 再高会被 ACES 色调映射推成白色，橙黄色就丢了（已踩过这个坑）。
 *     也就是说，靠 bloom 做"发光"和"保住颜色的色相"是直接冲突的。
 *
 *  ② 光晕贴图是一张**独立的加法混合几何**，贴在公式背后：
 *     · 颜色可以单独控制，不参与色调映射 → 色相保得住
 *     · 强度可以运行时改 → 调参不需要重新烘焙 257 张公式贴图
 *     · 它是"光源"的观感，而不是"字被照亮"，正好符合星云里恒星的样子
 *
 *  ③ 所有公式**共用同一张**光晕贴图（模块级只生成一次），
 *     每帧只是改材质颜色 —— 显存开销可以忽略。
 *
 *  贴图的颜色是纯白的，真实颜色由材质 tint 决定，所以换族色不用重烘。
 */

import * as THREE from 'three'

/** 光晕贴图的分辨率。256 已经足够：它是纯低频渐变，放大也不会有块状感。 */
const SIZE = 256

let cached = null

/**
 * 生成（或取用缓存）光晕贴图：一个中心亮、向外平滑衰减到 0 的径向渐变。
 *
 * @param {object} [opts]
 * @param {number} [opts.falloff=2.2] 衰减指数，越大越"紧"
 *   ⚠ 这里的 2.2 只是**兜底默认值**（本模块可独立复用）。
 *     实际运行时总是由 scene.js 传入 `GLYPH.glow.falloff`，现值 **3.8** ——
 *     那是"一个小光点"而不是大光晕（见 config.js 里 glow 一节的推导）。
 *     一个有用的近似：alpha 掉到 0.05 处的半径 ≈ (1 − 0.05^(1/falloff)) × 方形半宽，
 *     falloff=2.2 → 0.74（弥散），falloff=3.8 → 0.55（收拢）。
 * @returns {THREE.CanvasTexture}
 */
export function getGlowTexture(opts = {}) {
  const falloff = opts.falloff ?? 2.2
  // 缓存键带上 falloff，避免改了参数还拿到旧贴图
  if (cached && cached.falloff === falloff) return cached.texture

  const canvas = document.createElement('canvas')
  canvas.width = SIZE
  canvas.height = SIZE
  const ctx = canvas.getContext('2d')

  const img = ctx.createImageData(SIZE, SIZE)
  const data = img.data
  const c = (SIZE - 1) / 2

  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const dx = (x - c) / c
      const dy = (y - c) / c
      const r = Math.sqrt(dx * dx + dy * dy)

      // r=0 中心最亮，r>=1 完全透明。
      // 用 (1-r)^falloff 而不是高斯：尾部长得更干净，不会在方形贴图
      // 边界上留下可见的直角（高斯拖尾会碰到边缘被硬切）。
      //
      // ⚠ 2026-11-01 修「猜想星团柔光有一道硬圆弧边」：
      //   原式 a = max((1-r)^falloff, (1-r)^12) 在 r→1 时**不是平滑趋零**。
      //   实测 falloff=1.9 时 r=0.9 仍有 0.0126、r=0.95 有 0.0034，
      //   而 r>=1 立刻变成 0 —— 在 AdditiveBlending 下这 1.26% 的亮度
      //   乘上 opacity(0.10) 后仍然肉眼可见，于是贴图的圆形边界被画成
      //   一圈**硬边**。falloff 越小（大柔光斑用它）这条边越明显。
      //
      //   修法：乘一个内建的边缘窗口 (1-r²)²（约在 r=0.85 才开始明显压暗，
      //   到 r=1 处值为 0 且一阶导也为 0）。这样 alpha 与它的导数在贴图
      //   边界上同时归零，圆形轮廓不再有亮度阶跃。
      //   对公式光晕（falloff=3.8）影响可忽略：那条曲线在 r>0.8 处本来就接近 0。
      let a = 0
      if (r < 1) {
        const t = 1 - r
        a = Math.pow(t, falloff)
        // 中心再压一个小的实心核心，让它看起来像"有光源"而不是一团雾
        a = Math.max(a, Math.pow(t, 12) * 1.0)
        // 边缘窗口：保证 alpha 与其导数在 r→1 时平滑归零（消除硬圆弧边）
        const w = 1 - r * r
        a *= w * w
      }

      const i = (y * SIZE + x) * 4
      data[i] = 255
      data[i + 1] = 255
      data[i + 2] = 255
      data[i + 3] = Math.round(Math.min(1, a) * 255)
    }
  }
  ctx.putImageData(img, 0, 0)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.minFilter = THREE.LinearFilter
  texture.magFilter = THREE.LinearFilter
  texture.generateMipmaps = false   // 纯渐变，不需要 mipmap
  texture.needsUpdate = true

  cached = { texture, falloff }
  return texture
}

/**
 * 给一个 sprite/mesh 算光晕的颜色。
 *
 * @param {{r:number,g:number,b:number}} baseLinear 公式的线性空间基色
 * @param {number} glowScale  该节点的发光强度（graph.js 里算的）
 * @param {object} [opts]
 * @param {number} [opts.whiten=0.28] 掺白比例 —— 真实光源核心通常是过曝的白
 *   （同样只是兜底值，实际由 `GLYPH.glow.whiten` 传入，现值 **0.38**：
 *    光点面积变小后需要更"烫"一点才够显眼）
 * @param {boolean} [opts.tint=true]  false 时用纯白（不跟族色）
 * @returns {{r:number,g:number,b:number}}
 */
export function glowColor(baseLinear, glowScale, opts = {}) {
  const whiten = opts.whiten ?? 0.28
  const tint = opts.tint !== false

  // 不跟色时直接用白，但要按族的相对明度稍微压一下，
  // 否则所有族的光晕一样亮，"核心更亮"就只剩大小在表达
  const src = tint ? baseLinear : { r: 1, g: 1, b: 1 }

  // 把基色朝白色插值：core → 更白、更"过曝"
  const mix = (v) => v + (1 - v) * whiten
  return {
    r: mix(src.r) * glowScale,
    g: mix(src.g) * glowScale,
    b: mix(src.b) * glowScale,
  }
}

/** 释放缓存贴图（热更新/重建时用） */
export function disposeGlowTexture() {
  if (cached && cached.texture) cached.texture.dispose()
  cached = null
}
