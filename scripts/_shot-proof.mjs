/**
 * 给一条证明页截图（视觉 QA 用）。只读，不修改任何东西。
 * 用法：CHROME=<edge> NODE_ID=<节点id> node scripts/_shot-proof.mjs
 */
import { spawn } from 'node:child_process'
import { mkdtempSync, writeFileSync, mkdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { setTimeout as sleep } from 'node:timers/promises'
import { requireChrome } from './_chrome.mjs'

const PORT = Number(process.env.PORT || 9661)
const NODE_ID = process.env.NODE_ID || 'yoneda-lemma'
const profile = mkdtempSync(join(tmpdir(), 'shot-proof-'))
const chrome = spawn(requireChrome(), [
  '--headless=new', '--no-sandbox', '--disable-gpu-sandbox',
  '--enable-unsafe-swiftshader', '--use-gl=angle', '--use-angle=swiftshader',
  `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`,
  '--window-size=1440,1000', '--no-first-run', '--hide-scrollbars', 'about:blank',
], { stdio: 'ignore' })
async function wsUrl() {
  for (let i = 0; i < 600; i++) {
    try { const l = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json(); const p = l.find(t => t.type === 'page'); if (p) return p.webSocketDebuggerUrl } catch { /* 未就绪 */ }
    await sleep(300)
  }
  throw new Error('no cdp')
}
const ws = new WebSocket(await wsUrl())
await new Promise((r, j) => { ws.onopen = r; ws.onerror = j })
let id = 0; const pend = new Map()
ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) { const { resolve: rs, reject: rj } = pend.get(m.id); pend.delete(m.id); m.error ? rj(new Error(JSON.stringify(m.error))) : rs(m.result) } }
const send = (method, params = {}) => { const i = ++id; return new Promise((rs, rj) => { pend.set(i, { resolve: rs, reject: rj }); ws.send(JSON.stringify({ id: i, method, params })) }) }
const ev = async (expr) => { const r = await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true }); if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text); return r.result.value }
await send('Runtime.enable'); await send('Page.enable')
await send('Page.navigate', { url: `http://127.0.0.1:5176/?p=${NODE_ID}` })
for (let i = 0; i < 900; i++) { try { if (await ev('!!window.__nebula?.proofView')) break } catch { /* 等待 */ } await sleep(400) }
await ev(`(()=>{ window.__nebula.proofView.open(${JSON.stringify(NODE_ID)}); return 1 })()`)
await sleep(1500)
mkdirSync('shots/proof-qa', { recursive: true })
const shot = await send('Page.captureScreenshot', { format: 'png' })
writeFileSync(`shots/proof-qa/${NODE_ID}.png`, Buffer.from(shot.data, 'base64'))
const stats = await ev(`(()=>{
  const pv = document.getElementById('proof-view');
  return { plain: pv.querySelectorAll('.pv-plain').length, katex: pv.querySelectorAll('.katex').length,
           steps: pv.querySelectorAll('details.pv-step').length, cards: pv.querySelectorAll('.pv-card').length };
})()`)
console.log(NODE_ID, JSON.stringify(stats))
ws.close(); try { chrome.kill() } catch { /* 已退出 */ }
