/** 抓取页面控制台错误与异常 —— 用于快速定位启动期崩溃。 */
import { spawn } from 'node:child_process'
import { resolve } from 'node:path'
import { tmpdir } from 'node:os'
import { setTimeout as sleep } from 'node:timers/promises'

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const URL = process.env.URL || 'http://localhost:5176/'
const PORT = 9238
const profile = resolve(tmpdir(), 'nebula-err' + '-' + process.pid)

const cp = spawn(CHROME, [
  '--headless=new', '--no-sandbox', '--disable-gpu-sandbox',
  '--enable-unsafe-swiftshader', '--use-gl=angle', '--use-angle=swiftshader',
  '--window-size=1400,900',
  `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`,
  '--no-first-run', '--no-default-browser-check', URL,
], { stdio: ['ignore', 'pipe', 'pipe'] })
cp.stderr.on('data', () => {})

let target
for (let i = 0; i < 40 && !target; i++) {
  try {
    const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()
    target = list.find((t) => t.type === 'page' && t.webSocketDebuggerUrl)
  } catch {}
  if (!target) await sleep(500)
}
const ws = new WebSocket(target.webSocketDebuggerUrl)
await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej })
let msgId = 0
const pending = new Map()
const logs = []
ws.onmessage = (ev) => {
  const m = JSON.parse(ev.data)
  if (m.method === 'Runtime.consoleAPICalled') {
    logs.push('[console.' + m.params.type + '] ' + m.params.args.map((a) => a.value ?? a.description ?? '').join(' '))
  }
  if (m.method === 'Runtime.exceptionThrown') {
    const d = m.params.exceptionDetails
    logs.push('[EXCEPTION] ' + (d.exception?.description || d.text))
  }
  if (m.method === 'Log.entryAdded') {
    logs.push('[log.' + m.params.entry.level + '] ' + m.params.entry.text)
  }
  if (m.id && pending.has(m.id)) {
    const { resolve: rs, reject: rj } = pending.get(m.id); pending.delete(m.id)
    m.error ? rj(new Error(JSON.stringify(m.error))) : rs(m.result)
  }
}
const send = (method, params = {}) => new Promise((rs, rj) => {
  const id = ++msgId; pending.set(id, { resolve: rs, reject: rj })
  ws.send(JSON.stringify({ id, method, params }))
})
const evaluate = async (e) => {
  const r = await send('Runtime.evaluate', { expression: e, awaitPromise: true, returnByValue: true })
  return r.result?.value
}
await send('Runtime.enable')
await send('Log.enable')
await send('Page.enable')
await send('Page.reload', { ignoreCache: true })
await sleep(8000)

const diag = await evaluate(`(()=>{const e=document.getElementById('diag');return e?e.textContent:'(no diag)'})()`)
const hasApi = await evaluate(`typeof window.__nebula`)
console.log('__nebula:', hasApi)
console.log('diag:', diag)
console.log('\n--- 控制台输出 ---')
for (const l of logs) console.log(l)

ws.close(); cp.kill(); await sleep(200)
process.exit(0)
