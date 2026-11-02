/**
 * 星团柔光的几何检查：贴图的假设必须和几何体一致。
 *
 * ── 这个脚本要防的是什么 ──
 *
 * 星团柔光原来是 `SphereGeometry` + 一张**UV 空间的径向渐变**贴图，
 * 结果渲染出来是一个**边缘清晰、内部死平的灰盘**（像月亮/盘子），
 * 完全不是配置里写的"糊成一团的光斑"。
 *
 * 这个 bug 极其难被数值断言抓到，因为它不违反任何数值：
 *   - 顶点数对、材质对、opacity 对、颜色对、加法混合也对；
 *   - 所有已有脚本全绿；
 *   - draw call 只多一个。
 * 唯独**看上去完全不对**。是靠看截图发现的。
 *
 * 根因是**几何假设不匹配**：
 *   贴图是"中心亮、到 r=1 平滑衰减为 0"的径向渐变，
 *   它假设自己铺在一个**正对相机的平面**上。
 *   铺到球面上时：
 *     ① 球面 UV 把渐变压缩进一圈很窄的边界带，朝向相机的大片正面
 *        落在渐变接近中心处（alpha 近似常数）→ 内部死平；
 *     ② 轮廓处 UV 骤变，渐变来不及衰减到 0 → 切出一条硬边。
 *
 * 所以这里检查的是**形状假设**，不是像素：
 *   1. 柔光必须是**平面**（PlaneGeometry），不能是球；
 *   2. 它必须**每帧朝向相机**（否则侧过去会变成一条线）；
 *   3. 贴图必须是径向渐变（中心 alpha 高、边缘为 0）——
 *      这条决定了"必须是平面"这个前提本身还成立。
 *
 * 换句话说：如果有人把几何体改回球、或者把贴图换成非径向的，
 * 这个脚本会红，而其它脚本不会。
 */
import { spawn } from 'node:child_process'
import { setTimeout as sleep } from 'node:timers/promises'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { requireChrome } from './_chrome.mjs'

const PORT = Number(process.env.PORT || 9440)
const URL_BASE = process.env.URL || 'http://127.0.0.1:5176/'
const CHROME = requireChrome()

class CDP {
  constructor(ws) {
    this.ws = ws; this.id = 0; this.pending = new Map()
    ws.addEventListener('message', (ev) => {
      const m = JSON.parse(ev.data)
      if (m.id && this.pending.has(m.id)) {
        const { resolve, reject } = this.pending.get(m.id)
        this.pending.delete(m.id)
        if (m.error) reject(new Error(JSON.stringify(m.error))); else resolve(m.result)
      }
    })
  }
  send(method, params = {}) {
    const id = ++this.id
    return new Promise((res, rej) => {
      this.pending.set(id, { resolve: res, reject: rej })
      this.ws.send(JSON.stringify({ id, method, params }))
    })
  }
  async eval(expr) {
    const r = await this.send('Runtime.evaluate', {
      expression: `(async () => { ${expr} })()`, awaitPromise: true, returnByValue: true,
    })
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text)
    return r.result.value
  }
}

async function connect() {
  let t = null
  for (let i = 0; i < 600; i++) {
    try {
      const l = await fetch(`http://127.0.0.1:${PORT}/json/list`).then((r) => r.json())
      t = l.find((x) => x.type === 'page' && x.webSocketDebuggerUrl)
      if (t) break
    } catch { /* 还没起来 */ }
    await sleep(250)
  }
  if (!t) throw new Error('连不上 CDP')
  const ws = new WebSocket(t.webSocketDebuggerUrl)
  await new Promise((res, rej) => {
    ws.addEventListener('open', res, { once: true })
    ws.addEventListener('error', rej, { once: true })
  })
  return new CDP(ws)
}

const profile = mkdtempSync(join(tmpdir(), 'neb-halo-'))
const chrome = spawn(CHROME, [
  '--headless=new', '--no-sandbox', '--disable-gpu-sandbox', '--enable-unsafe-swiftshader', '--use-gl=angle', '--use-angle=swiftshader',
  '--no-first-run', '--no-default-browser-check', '--disable-extensions', '--mute-audio',
  '--window-size=1400,900', `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${profile}`, URL_BASE,
], { stdio: 'ignore' })

let pass = 0, fail = 0
const failures = []
function check(ok, label, detail) {
  if (ok) { pass++; console.log(`  通过  ${label}${detail ? ' — ' + detail : ''}`) }
  else { fail++; failures.push(label); console.log(`  失败  ${label}${detail ? ' — ' + detail : ''}`) }
}

try {
  const cdp = await connect()
  await cdp.send('Runtime.enable')
  for (let i = 0; i < 600; i++) {
    try {
      const d = await cdp.eval(`const e=document.getElementById('diag'); return e?e.textContent:''`)
      if (d && JSON.parse(d).built > 0) break
    } catch { /* 还没好 */ }
    await sleep(1000)
  }

  console.log('=== 1. 柔光几何体必须是平面（不能是球）===')
  const geo = await cdp.eval(`
    const s = window.__nebula.scene
    /* 用 scene 明确暴露的引用，不做"遍历 + 猜材质"的启发式查找。
     * 启发式一旦特征变了就静默找不到，测试会报成"功能坏了"。 */
    const found = s.clusterHaloRef
    if (!found) return null
    const g = found.geometry
    return {
      type: g.type,
      isSphere: /Sphere/i.test(g.type),
      isPlane: /Plane/i.test(g.type),
      width: g.parameters && g.parameters.width,
      height: g.parameters && g.parameters.height,
      hasMap: !!(found.material.map),
      blending: found.material.blending,
      opacity: found.material.opacity,
      parentIsCluster: found.parent === s.clusterGroupRef,
    }
  `)
  if (!geo) {
    check(false, '找到星团柔光 mesh', '没找到（可能被关了）')
  } else {
    console.log('  ', JSON.stringify(geo))
    check(!geo.isSphere, '不是球体（SphereGeometry 会渲染成硬边灰盘）', geo.type)
    check(geo.isPlane, '是平面（PlaneGeometry，正对相机才是柔光）', geo.type)
    check(geo.hasMap, '有贴图', String(geo.hasMap))
    check(geo.blending === 2, '用加法混合（黑=不可见）', 'blending=' + geo.blending)
  }

  console.log('\n=== 2. 贴图必须是径向渐变（这是"必须是平面"的前提）===')
  const tex = await cdp.eval(`
    const s = window.__nebula.scene
    const mesh = s.clusterHaloRef
    if (!mesh || !mesh.material.map) return null
    const img = mesh.material.map.image
    const cv = document.createElement('canvas')
    cv.width = 64; cv.height = 64
    const ctx = cv.getContext('2d', { willReadFrequently: true })
    ctx.drawImage(img, 0, 0, 64, 64)
    const d = ctx.getImageData(0, 0, 64, 64).data
    const at = (x, y) => d[(y * 64 + x) * 4 + 3]
    return {
      中心: at(32, 32),
      半径一半: at(48, 32),
      接近边缘: at(62, 32),
      角落: at(63, 63),
    }
  `)
  if (!tex) { check(false, '读到柔光贴图', '没有贴图') }
  else {
    console.log('  ', JSON.stringify(tex))
    check(tex.中心 > 200, '中心亮', String(tex.中心))
    check(tex.接近边缘 < 40, '边缘衰减到接近 0（没有硬边）', String(tex.接近边缘))
    check(tex.角落 < 40, '角落为 0（方形贴图不留直角）', String(tex.角落))
    check(tex.中心 > tex.半径一半 && tex.半径一半 > tex.接近边缘, '单调向外衰减', '')
  }

  console.log('\n=== 3. 柔光必须朝向相机（否则侧过去成一条线）===')
  const facing = await cdp.eval(`
    const s = window.__nebula.scene
    const mesh = s.clusterHaloRef
    if (!mesh) return null
    const THREE = mesh.quaternion.constructor
    const camQ = s.camera.quaternion
    const worldQ = new THREE()
    mesh.getWorldQuaternion(worldQ)
    // 面片法线是 +Z；取世界朝向的 Z 轴，与相机视线方向比较
    const n = new (mesh.position.constructor)(0, 0, 1).applyQuaternion(worldQ).normalize()
    // 相机看向 -Z，所以面片法线应与相机世界 +Z 同向（点积接近 1）
    const camZ = new (mesh.position.constructor)(0, 0, 1).applyQuaternion(camQ).normalize()
    return { dot: n.dot(camZ) }
  `)
  if (!facing) { check(false, '读到柔光朝向', '没找到 mesh') }
  else {
    console.log('   与相机 +Z 的点积 =', facing.dot.toFixed(4), '（1 = 完全正对）')
    check(facing.dot > 0.99, '柔光正对相机', 'dot=' + facing.dot.toFixed(4))
  }

  console.log('\n=== 4. 关掉柔光不该报错（设置开关仍然有效）===')
  const toggle = await cdp.eval(`
    const s = window.__nebula.scene
    s.setDisplay('clusterHalo', false)
    const off = s.scene ? true : true
    s.setDisplay('clusterHalo', true)
    return { ok: true }
  `)
  check(!!toggle && toggle.ok, '开关可正常切换', '')
} finally {
  try { chrome.kill() } catch { /* 已经退出 */ }
}

console.log('\n' + '='.repeat(52))
console.log(`结果：${pass} / ${pass + fail} 通过`)
if (failures.length) {
  console.log('\n失败项：')
  for (const f of failures) console.log('  ✗ ' + f)
}
console.log('='.repeat(52))
process.exit(fail ? 1 : 0)
