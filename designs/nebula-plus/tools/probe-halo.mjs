/**
 * 星团柔光的**隔离测量**（方案 E · 第 5 项修正的证据工具）。
 *
 * 为什么要隔离：直接对整张截图做亮度剖面时，剖面会穿过星团里的公式字形，
 * 那些高对比笔画把梯度淹掉（实测 noise 达 ±13/255，远大于柔光本身的梯度）。
 * 所以这里先把「除柔光以外的一切」都关掉：
 *   背景星云 / 深空星点 / 盘面辉光 / 关联连线 / 状态色点 / 星团里的公式精灵
 * 只留柔光面片本身，背景变成纯色 → 剖面里任何跳变都只能来自柔光。
 *
 * 用法：node designs/nebula-plus/tools/probe-halo.mjs <out.png> [--label before|after]
 * 输出：截图 + JSON（柔光中心/半径/几何类型/材质参数 + 背景基线亮度）
 */
import { openPage } from '../../cdp.mjs'
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname } from 'node:path'

const out = process.argv[2] || 'shots/designs/nebula-plus/halo-isolated.png'
const label = process.argv.includes('--label') ? process.argv[process.argv.indexOf('--label') + 1] : 'probe'
mkdirSync(dirname(out), { recursive: true })

const page = await openPage({
  url: 'http://localhost:5190/designs/nebula-plus/',
  wait: "window.__nebula && window.__nebula.graph && document.querySelector('#diag')",
  waitMs: 90000, width: 1600, height: 1000,
})
try {
  const info = await page.eval(`
    const S = window.__nebula.scene
    const G = window.__nebula.graph
    const cam = S.camera
    const V3 = cam.position.constructor

    /* ① 只留柔光：关掉所有会干扰剖面的层 */
    S.setDisplay('nebula', false)
    S.setDisplay('stars', false)
    S.setDisplay('disc', false)
    S.setDisplay('links', false)
    S.setDisplay('markers', false)
    S.setDisplay('bloom', false)
    S.setDisplay('autoRotate', false)
    for (const n of G.nodes) if (n.sprite) n.sprite.visible = false
    for (const n of G.nodes) if (n.glow) n.glow.visible = false
    /* 关掉自转，让画面稳定（否则每次截图柔光中心都在变） */
    window.__nebula.settings.setTweak?.('spinRate', 0)

    /* ② 取景：只看星团 */
    S.setView('cluster')

    /* ③ 等两帧让矩阵更新 */
    cam.updateMatrixWorld()
    S.nodeGroup.updateMatrixWorld(true)
    S.clusterGroupRef.updateMatrixWorld(true)

    const W = innerWidth, H = innerHeight
    const proj = (x, y, z) => { const v = new V3(x, y, z); v.project(cam); return { x: (v.x * 0.5 + 0.5) * W, y: (-v.y * 0.5 + 0.5) * H } }
    const c = S.clusterCenter
    const haloObj = S.clusterHaloRef
    const hr = 52 * 1.35
    const right = new V3().setFromMatrixColumn(cam.matrixWorld, 0).normalize()
    const p0 = proj(c[0], c[1], c[2])
    const p1 = proj(c[0] + right.x * hr, c[1] + right.y * hr, c[2] + right.z * hr)
    return {
      centerPx: { x: +p0.x.toFixed(2), y: +p0.y.toFixed(2) },
      radiusPx: +Math.hypot(p1.x - p0.x, p1.y - p0.y).toFixed(2),
      geomType: haloObj ? haloObj.geometry.type : null,
      opacity: haloObj ? haloObj.material.opacity : null,
      falloff: 1.9,
      blending: haloObj ? haloObj.material.blending : null,
      // 柔光是否正对相机（点积 1 = 完全正对）
      facingDot: (() => {
        if (!haloObj) return null
        const q = haloObj.getWorldQuaternion(new (cam.quaternion.constructor)())
        const nrm = new V3(0, 0, 1).applyQuaternion(q)
        const toCam = new V3().subVectors(cam.position, new V3(c[0], c[1], c[2])).normalize()
        return +Math.abs(nrm.dot(toCam)).toFixed(4)
      })(),
    }
  `)
  await new Promise((r) => setTimeout(r, 1400))
  await page.shot(out)
  const payload = { label, out, ...info }
  console.log(JSON.stringify(payload, null, 2))
  writeFileSync(out.replace(/\.png$/, '.json'), JSON.stringify(payload, null, 2))
} finally {
  await page.close()
}
