/**
 * ═══════════════════════════════════════════════════════════════
 *  背景：旋涡星系 + 深空星点 + 盘面辉光
 * ═══════════════════════════════════════════════════════════════
 *
 *  ⚠ 关键：这里的旋臂参数（arms / spin / armSpread / thickness）
 *    必须与 config.js 的 LAYOUT 保持一致，否则背景星云和公式会
 *    各转各的臂，看起来像两套旋涡叠在一起。
 *    公式那一层用的是同一套「对数旋臂 + 高斯臂偏差」骨架。
 *
 *  盘面是**薄**的：y 正比于 r × thickness，中心按 bulge 隆起成核球。
 *  这就是"大致在同一平面内"的观感来源。
 */

import * as THREE from 'three'
import { NEBULA } from './config.js'

export function createNebula() {
  const group = new THREE.Group()
  group.name = 'nebula'
  if (!NEBULA.enabled) return { group, update() {}, setSpin() {} }

  /* ─────────── 1. 旋臂粒子 ───────────
   * ⚠ 旋臂骨架必须**与公式层同步**。切换形态时公式换了臂数/缠绕度，
   *   背景若不跟着换，就会看到"两层各转各的臂"叠加在一起。
   *   所以这里把粒子的生成抽成 buildArms()，由 setShape() 重新调用。
   *
   * 粒子数固定为 NEBULA.particleCount，所以重新生成只是**原地改写**
   * 已有的 Float32Array，不需要重建 geometry / material ——
   * 切形态是低频操作，但这样连一次显存分配都省了。 */
  const N = NEBULA.particleCount
  const pos = new Float32Array(N * 3)
  const col = new Float32Array(N * 3)
  const phase = new Float32Array(N)
  const size = new Float32Array(N)

  const cA = new THREE.Color(NEBULA.particleColorA)
  const cB = new THREE.Color(NEBULA.particleColorB)
  const tmp = new THREE.Color()

  /* ─────────── 随机源 ───────────
   * ⚠ 这里原本用的是一阶线性同余（LCG，`seed*1103515245+12345 & 0x7fffffff`）。
   *   它在本文件这种"连续多次取值、每轮固定调用十几次"的用法下**质量不够**：
   *   低维格点结构明显，实测
   *     · 单个数均匀性 χ² = 201.7（24 桶、期望 23）
   *     · 连续两数组成的二维格点 χ² = 1911（期望 255）—— 经典的 LCG 串行相关缺陷
   *   后果是即使形态设成"方位角完全均匀"（arms=0），星云的角度分布也残留
   *   明显结构：位置方位角 χ² = 123.5，而理想应 ≈ 23。
   *
   *   换成 mulberry32（graph.js 用的同一个，32 位雪崩混合）后：
   *     · 单个数均匀性 χ² = 16.7
   *     · 二维格点 χ² = 268（期望 255）
   *     · arms=0 的位置方位角 χ² = 16.7 ← 真正均匀了
   *   代价可以忽略（每帧不重算，只在建/切形态时跑一次）。
   *
   *   这个 bug 是 scripts/_prng-test.mjs 定位出来的：一开始我以为是
   *   "切形态没生效"，离线复现后 χ² 与浏览器**逐位相同**（182.1），
   *   才确认接线没问题、是随机源本身。 */
  function makeRng(seed0) {
    let a = seed0 >>> 0
    return function rng() {
      a = (a + 0x6D2B79F5) >>> 0
      let t = a
      t = Math.imul(t ^ (t >>> 15), t | 1)
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
  }
  const rnd = makeRng(987654321)
  // 近似高斯（Irwin–Hall），与 graph.js 的臂偏差用同一种分布
  const _gauss = () => rnd() + rnd() + rnd() - 1.5

  const R = NEBULA.particleRadius

  /**
   * 按给定的旋臂骨架重新生成粒子位置与颜色。
   * @param {{arms:number, spin:number, armSpread:number}} spec
   *        来自 SHAPES[mode].nebula —— 必须与公式层用同一组值
   */
  function buildArms(spec) {
    // 每次重建都从**独立**的随机源开始，且不动外面的 rnd：
    //   ① 同一个形态每次得到完全一样的星云（否则来回切形态会看到
    //      星云重新掷骰子）；
    //   ② 更重要的：星点层在后面用 rnd() 生成，若这里把共享的 rnd
    //      推进了 N 次，切一次形态星点就会重排一次 —— 那是很显眼的跳变。
    const r = makeRng(987654321)
    const rg = () => r() + r() + r() - 1.5   // 局部高斯，同样不碰外面的 rnd

    const arms = spec.arms
    for (let i = 0; i < N; i++) {
      // 半径：指数盘分布（中心密、外缘稀），无环带
      // 用 -h·ln(1-u) 的逆变换采样，比 pow(u, 0.5) 更接近真实星系
      const rr = Math.min(R, -R * 0.30 * Math.log(1 - r() * 0.9999)) + R * 0.015
      const t = rr / R

      let ang
      if (arms > 0) {
        // 旋臂：与公式同一套骨架
        const branch = (Math.floor(r() * arms) / arms) * Math.PI * 2
        const twist = t * spec.spin
        const armDev = rg() * spec.armSpread
        // 中心角向弥散：把多条臂的交叉糊成圆的盘心
        const cb = Math.max(0, 0.45 - t) / 0.45
        ang = branch + twist + armDev + (r() - 0.5) * Math.PI * 2 * cb * cb
      } else {
        // 无旋臂形态（同心环 / 弥散盘）：方位角完全均匀
        // ⚠ 这里能真正做到均匀，前提是 r 是 mulberry32。
        //   换成旧的 LCG 时实测 χ² = 123.5（理想 23），会看到残余角度结构。
        ang = r() * Math.PI * 2
      }

      // 盘面内散射：给旋臂真实宽度
      const scatter = (v) => Math.pow(r(), 2.6) * (r() < 0.5 ? -1 : 1) * v * rr

      // 盘面厚度：y 正比于 r，中心按 bulge 隆起 —— 与外层公式完全一致
      const bulge = 1 + Math.max(0, 0.45 - t) * 2.4
      const h = rg() * rr * (NEBULA.thickness / R) * 1.05 * bulge

      pos[i * 3 + 0] = Math.cos(ang) * rr + scatter(0.16)
      pos[i * 3 + 1] = h
      pos[i * 3 + 2] = Math.sin(ang) * rr + scatter(0.16)

      // 颜色：中心暖白偏橙 → 外缘冷蓝
      tmp.copy(cA).lerp(cB, Math.pow(t, 1.15) * (0.6 + r() * 0.4))
      col[i * 3 + 0] = tmp.r
      col[i * 3 + 1] = tmp.g
      col[i * 3 + 2] = tmp.b

      phase[i] = r() * Math.PI * 2
      size[i] = NEBULA.particleSize * (0.35 + r() * 1.5)
    }
  }

  // 初始按 config 里的默认骨架生成（= spiral 形态）
  buildArms({ arms: NEBULA.arms, spin: NEBULA.spin, armSpread: NEBULA.armSpread })

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  geo.setAttribute('aColor', new THREE.BufferAttribute(col, 3))
  geo.setAttribute('aPhase', new THREE.BufferAttribute(phase, 1))
  geo.setAttribute('aSize', new THREE.BufferAttribute(size, 1))

  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uPixelRatio: { value: Math.min(window.devicePixelRatio || 1, 2) },
    },
    vertexShader: /* glsl */`
      attribute vec3 aColor;
      attribute float aPhase;
      attribute float aSize;

      uniform float uTime;
      uniform float uPixelRatio;

      varying vec3 vColor;
      varying float vAlpha;

      void main() {
        vColor = aColor;

        vec3 p = position;

        // 逐点闪烁：像粼粼光斑
        float twinkle = 0.55 + 0.45 * sin(uTime * 1.7 + aPhase * 6.2831);

        // 径向密度波：一圈一圈向外涌动的光雾
        // 波长调到与盘半径同量级，避免大片同心环显得机械
        float len = length(p.xz);
        float band = 0.62 + 0.42 * sin(len * 0.010 - uTime * 0.40 + aPhase * 0.35);

        vAlpha = twinkle * band;

        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;

        // 距离衰减的点尺寸
        gl_PointSize = aSize * uPixelRatio * (260.0 / max(1.0, -mv.z));
      }
    `,
    fragmentShader: /* glsl */`
      varying vec3 vColor;
      varying float vAlpha;

      void main() {
        // 圆形柔边点
        vec2 d = gl_PointCoord - 0.5;
        float r2 = dot(d, d);
        if (r2 > 0.25) discard;

        float falloff = 1.0 - r2 * 4.0;
        falloff *= falloff;

        gl_FragColor = vec4(vColor, vAlpha * falloff * 0.85);
      }
    `,
  })

  const points = new THREE.Points(geo, mat)
  points.frustumCulled = false
  // 背景星云的旋臂整体旋转，由外部每帧写 rotation.y（见 setSpin）。
  // 转得比公式层略快 → 轻微差异旋转，但两层旋臂骨架仍然对齐。
  const armGroup = new THREE.Group()
  armGroup.add(points)
  group.add(armGroup)

  /* ─────────── 2. 深空星点 ─────────── */
  const S = NEBULA.starCount
  const spos = new Float32Array(S * 3)
  const sphase = new Float32Array(S)
  const ssize = new Float32Array(S)

  for (let i = 0; i < S; i++) {
    // 球面均匀采样
    const u = rnd() * 2 - 1
    const th = rnd() * Math.PI * 2
    const sp = Math.sqrt(1 - u * u)
    const R = NEBULA.starRadius * (0.75 + rnd() * 0.5)

    spos[i * 3 + 0] = R * sp * Math.cos(th)
    spos[i * 3 + 1] = R * u
    spos[i * 3 + 2] = R * sp * Math.sin(th)

    sphase[i] = rnd() * Math.PI * 2
    ssize[i] = NEBULA.starSize * (0.4 + rnd() * 1.4)
  }

  const sgeo = new THREE.BufferGeometry()
  sgeo.setAttribute('position', new THREE.BufferAttribute(spos, 3))
  sgeo.setAttribute('aPhase', new THREE.BufferAttribute(sphase, 1))
  sgeo.setAttribute('aSize', new THREE.BufferAttribute(ssize, 1))

  const smat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uPixelRatio: { value: Math.min(window.devicePixelRatio || 1, 2) },
    },
    vertexShader: /* glsl */`
      attribute float aPhase;
      attribute float aSize;
      uniform float uTime;
      uniform float uPixelRatio;
      varying float vAlpha;
      void main() {
        vAlpha = 0.35 + 0.65 * abs(sin(uTime * 0.5 + aPhase));
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = aSize * uPixelRatio;
      }
    `,
    fragmentShader: /* glsl */`
      varying float vAlpha;
      void main() {
        vec2 d = gl_PointCoord - 0.5;
        float r2 = dot(d, d);
        if (r2 > 0.25) discard;
        float f = 1.0 - r2 * 4.0;
        gl_FragColor = vec4(vec3(1.0, 0.98, 0.94), vAlpha * f * 0.9);
      }
    `,
  })

  const stars = new THREE.Points(sgeo, smat)
  stars.frustumCulled = false
  group.add(stars)

  /* ─────────── 3. 盘面辉光（加法混合的柔光圆盘） ─────────── */
  const discCanvas = document.createElement('canvas')
  discCanvas.width = discCanvas.height = 512
  {
    const g = discCanvas.getContext('2d')
    const grd = g.createRadialGradient(256, 256, 0, 256, 256, 256)
    grd.addColorStop(0.0, 'rgba(255,255,255,0.75)')
    grd.addColorStop(0.25, 'rgba(255,255,255,0.32)')
    grd.addColorStop(0.55, 'rgba(255,255,255,0.10)')
    grd.addColorStop(1.0, 'rgba(255,255,255,0)')
    g.fillStyle = grd
    g.fillRect(0, 0, 512, 512)
  }

  const discTex = new THREE.CanvasTexture(discCanvas)
  discTex.colorSpace = THREE.SRGBColorSpace

  const disc = new THREE.Mesh(
    new THREE.PlaneGeometry(NEBULA.discSize, NEBULA.discSize),
    new THREE.MeshBasicMaterial({
      map: discTex,
      color: new THREE.Color(NEBULA.discColor),
      transparent: true,
      opacity: NEBULA.discOpacity,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    }),
  )
  disc.rotation.x = -Math.PI / 2
  group.add(disc)

  return {
    group,
    update(t) {
      mat.uniforms.uTime.value = t
      smat.uniforms.uTime.value = t
    },
    /** 外部每帧写自转角（弧度）。只有旋臂粒子转，星点与辉光盘不转。 */
    setSpin(angle) {
      armGroup.rotation.y = angle
    },
    /**
     * 切换形态：按新的旋臂骨架重新生成粒子。
     * 骨架值必须来自 SHAPES[mode].nebula，与公式层用同一组。
     */
    setShape(spec) {
      if (!spec) return
      buildArms(spec)
      geo.attributes.position.needsUpdate = true
      geo.attributes.aColor.needsUpdate = true
      geo.attributes.aPhase.needsUpdate = true
      geo.attributes.aSize.needsUpdate = true
    },
    /** 显示层开关：背景星云 / 深空星点 / 盘面辉光 */
    setLayerVisible(layer, on) {
      if (layer === 'nebula') armGroup.visible = on
      else if (layer === 'stars') stars.visible = on
      else if (layer === 'disc') disc.visible = on
    },
  }
}
