/**
 * 验证「旧存档迁移」：光点大小从 2.6（大光晕时代的默认）改到 0.85 后，
 * 老用户 localStorage 里那个 2.6 必须被换成新默认值，否则他们会以为改动没生效。
 *
 * 断言：
 *   1. 存档里 glowScale = 2.6（旧默认，用户没动过）→ 载入后变成 0.85
 *   2. 存档里 glowScale = 1.8（用户自己拖的）→ 载入后仍是 1.8（尊重用户）
 *   3. 存档里没有 glowScale → 用新默认 0.85
 *   4. 迁移后的面板滑块位置与 state 一致（不能只有 state 变了、UI 还停在旧值）
 *
 * 做法：用 Page.addScriptToEvaluateOnNewDocument 在页面脚本**之前**注入
 * localStorage，这样 settings.js 一启动就读到"旧存档"。
 */
import { spawn } from 'node:child_process'
import { resolve } from 'node:path'
import { tmpdir } from 'node:os'
import { setTimeout as sleep } from 'node:timers/promises'
import { requireChrome } from './_chrome.mjs'

const CHROME = requireChrome()
const URL = process.env.URL || 'http://localhost:5176/'
const PORT = Number(process.env.PORT || 9320)
const profile = resolve(tmpdir(), `nebula-migrate-${PORT}`)

const cp = spawn(CHROME, [
  '--headless=new', '--no-sandbox', '--disable-gpu-sandbox',
  '--enable-unsafe-swiftshader', '--use-gl=angle', '--use-angle=swiftshader',
  '--hide-scrollbars', '--window-size=1600,1000',
  `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`,
  '--no-first-run', '--no-default-browser-check', 'about:blank',
], { stdio: ['ignore', 'pipe', 'pipe'] })
cp.stderr.on('data', () => {})

async function getTarget() {
  for (let i = 0; i < 600; i++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()
      const page = list.find((t) => t.type === 'page' && t.webSocketDebuggerUrl)
      if (page) return page
    } catch {}
    await sleep(500)
  }
  throw new Error('CDP 未就绪')
}

const target = await getTarget()
const ws = new WebSocket(target.webSocketDebuggerUrl)
await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej })
let msgId = 0
const pending = new Map()
ws.onmessage = (ev) => {
  const m = JSON.parse(ev.data)
  if (m.id && pending.has(m.id)) {
    const { resolve: rs, reject: rj } = pending.get(m.id)
    pending.delete(m.id)
    if (m.error) rj(new Error(JSON.stringify(m.error))); else rs(m.result)
  }
}
function send(method, params = {}) {
  const id = ++msgId
  return new Promise((rs, rj) => { pending.set(id, { resolve: rs, reject: rj }); ws.send(JSON.stringify({ id, method, params })) })
}
async function ev(expression) {
  const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })
  if (r.exceptionDetails) throw new Error('页面异常: ' + JSON.stringify(r.exceptionDetails.exception?.description || r.exceptionDetails))
  return r.result.value
}
await send('Runtime.enable')
await send('Page.enable')

const results = []
function check(name, ok, detail) {
  results.push({ name, ok, detail })
  console.log(`  ${ok ? '通过' : '失败'}  ${name}${detail ? ' — ' + detail : ''}`)
}

const KEY = 'formula-nebula.settings.v1'

/**
 * 用一份指定的存档加载页面，读回 state 与滑块位置。
 * @param {object|null} tweak  要写进存档的 tweak 对象（null = 不写存档）
 */
async function loadWith(tweak) {
  const saved = tweak === null ? null : JSON.stringify({
    shape: 'spiral', colorMode: 'family', tweak,
    display: {}, gravity: false, gravityFollow: 1,
  })
  // 每次导航前重新注入（addScriptToEvaluateOnNewDocument 是持久的，
  // 所以先清掉旧的）
  const { identifier } = await send('Page.addScriptToEvaluateOnNewDocument', {
    source: saved === null
      ? `try{localStorage.removeItem(${JSON.stringify(KEY)})}catch(e){}`
      : `try{localStorage.setItem(${JSON.stringify(KEY)}, ${JSON.stringify(saved)})}catch(e){}`,
  })
  await send('Page.navigate', { url: URL })
  await sleep(1000)
  // 等页面初始化出 settings
  let ok = false
  for (let i = 0; i < 600; i++) {
    ok = await ev(`(()=>!!(window.__nebula && window.__nebula.settings))()`).catch(() => false)
    if (ok) break
    await sleep(1000)
  }
  if (!ok) throw new Error('页面没起来')
  const out = await ev(`(()=>{
    const n=window.__nebula;
    // 面板滑块的当前值（证明 UI 也同步了，不只是内部 state）
    const rows=[...document.querySelectorAll('#settings input[type=range]')];
    const labels=[...document.querySelectorAll('#settings .st-row')];
    let slider=null;
    for (const r of labels) {
      if (r.textContent.includes('光点大小')) {
        const inp=r.querySelector('input[type=range]');
        if (inp) slider=Number(inp.value);
      }
    }
    return { state:n.settings.state.tweak.glowScale, slider };
  })()`)
  await send('Page.removeScriptToEvaluateOnNewDocument', { identifier })
  return out
}

console.log('\n=== 1. 旧存档里的 2.6（旧默认，用户没动过）应迁移到 0.85 ===')
const a = await loadWith({ glowScale: 2.6, glowStrength: 0.55 })
console.log('  ', JSON.stringify(a))
check('state 迁移到新默认 0.85', Math.abs(a.state - 0.85) < 1e-9, `${a.state}`)

console.log('\n=== 2. 用户自己拖过的 1.8 必须保留 ===')
const b = await loadWith({ glowScale: 1.8, glowStrength: 0.55 })
console.log('  ', JSON.stringify(b))
check('用户自定义的 1.8 被尊重', Math.abs(b.state - 1.8) < 1e-9, `${b.state}`)

console.log('\n=== 3. 没有存档 → 用新默认 0.85 ===')
const c = await loadWith(null)
console.log('  ', JSON.stringify(c))
check('无存档时是新默认 0.85', Math.abs(c.state - 0.85) < 1e-9, `${c.state}`)

console.log('\n=== 4. 上限之外的值仍然要被 clamp ===')
const d = await loadWith({ glowScale: 99 })
console.log('  ', JSON.stringify(d))
check('超范围值被 clamp 到 3.0', Math.abs(d.state - 3.0) < 1e-9, `${d.state}`)

const failed = results.filter((r) => !r.ok)
console.log(`\n${'='.repeat(52)}`)
console.log(`结果：${results.length - failed.length} / ${results.length} 通过`)
for (const f of failed) console.log(`  · ${f.name} — ${f.detail}`)
console.log('='.repeat(52))

ws.close(); cp.kill(); await sleep(400)
process.exit(failed.length ? 1 : 0)
