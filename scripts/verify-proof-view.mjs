/**
 * 验证证明页在「证明数据按需加载」之后仍然可用。
 *
 * 为什么需要这个检查器
 * --------------------
 * 245 条长篇证明原本在启动时全量附加到节点上（3.3 MB 源码并进主包）。
 * 改成首次打开证明页时 fetch proofs.json 之后，**主包从 1265 KB 降到 163 KB**，
 * 但也引入了一条全新的失败路径：如果 fetch 路径错、文件没部署、或重渲染
 * 时机不对，证明页就会永远停在"加载中"或者一片空白。
 *
 * 这类问题 `verify:boot` 看不出来 —— 它只检查知识图谱是否装配，
 * 而证明页是另一条独立的数据通道。
 *
 * 用法：node scripts/verify-proof-view.mjs [url]
 */

import { spawn, execFileSync } from 'node:child_process'
import fs from 'node:fs'
import net from 'node:net'
import os from 'node:os'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const TARGET = process.argv[2] || 'https://wenze-wu-math.github.io/Formula-Nebula/'
const PROOF_ID = 'flat-morphism'

const BROWSERS = [
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  '/usr/bin/google-chrome',
].filter((p) => fs.existsSync(p))
const browser = BROWSERS[0]
if (!browser) {
  console.log('SKIP: 未找到浏览器')
  process.exit(0)
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const PORT = 5795
const CDPP = 9795
const prof = fs.mkdtempSync(path.join(os.tmpdir(), 'pvchk-'))
const LOCAL = /localhost|127\.0\.0\.1/.test(TARGET)

const kids = []
const killAll = () => {
  for (const c of kids) {
    try {
      spawn('taskkill', ['/PID', String(c.pid), '/T', '/F'], { stdio: 'ignore' })
    } catch {
      /* ignore */
    }
  }
}
process.on('exit', killAll)

async function waitPort(p, ms = 60000) {
  const end = Date.now() + ms
  while (Date.now() < end) {
    const ok = await new Promise((res) => {
      const s = net.connect({ port: p, host: '127.0.0.1' }, () => {
        s.destroy()
        res(true)
      })
      s.on('error', () => res(false))
      s.setTimeout(700, () => {
        s.destroy()
        res(false)
      })
    })
    if (ok) return true
    await sleep(300)
  }
  return false
}

let failures = 0
const check = (name, ok, detail = '') => {
  if (ok) console.log(`  ✓ ${name}${detail ? ' — ' + detail : ''}`)
  else {
    failures++
    console.log(`  ✗ ${name}${detail ? ' — ' + detail : ''}`)
  }
}

try {
  if (LOCAL) {
    kids.push(
      spawn(process.execPath, [path.join(ROOT, 'node_modules', 'vite', 'bin', 'vite.js'), 'preview', '--port', String(PORT), '--strictPort'], {
        cwd: ROOT,
        stdio: 'ignore',
      })
    )
    if (!(await waitPort(PORT))) throw new Error('preview 未启动')
  }

  kids.push(
    spawn(browser, ['--headless=new', '--disable-gpu', '--no-sandbox', `--remote-debugging-port=${CDPP}`, `--user-data-dir=${prof}`, 'about:blank'], {
      stdio: 'ignore',
    })
  )
  for (let i = 0; i < 120; i++) {
    await sleep(300)
    try {
      if ((await fetch(`http://127.0.0.1:${CDPP}/json/version`)).ok) break
    } catch {
      /* retry */
    }
  }

  const t = await (await fetch(`http://127.0.0.1:${CDPP}/json/new?about:blank`, { method: 'PUT' })).json()
  const ws = new WebSocket(t.webSocketDebuggerUrl)
  await new Promise((r) => ws.addEventListener('open', r, { once: true }))

  let id = 0
  const pending = new Map()
  const consoleErrors = []
  ws.addEventListener('message', (e) => {
    const m = JSON.parse(e.data)
    if (m.id && pending.has(m.id)) {
      pending.get(m.id)(m.result)
      pending.delete(m.id)
      return
    }
    if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') {
      consoleErrors.push((m.params.args || []).map((a) => a.value ?? a.description ?? '').join(' ').slice(0, 160))
    }
  })
  const send = (method, params = {}) =>
    new Promise((r) => {
      const i = ++id
      pending.set(i, r)
      ws.send(JSON.stringify({ id: i, method, params }))
    })
  const ev = async (x) => {
    const r = await send('Runtime.evaluate', { expression: x, returnByValue: true, awaitPromise: true })
    if (r.exceptionDetails) return undefined
    return r.result ? r.result.value : undefined
  }

  await send('Runtime.enable')
  await send('Page.enable')

  console.log(`\n目标: ${TARGET}`)
  console.log(`深链: ?p=${PROOF_ID}\n`)

  await send('Page.navigate', { url: `${TARGET}?p=${PROOF_ID}` })

  // 等知识图谱就绪
  let booted = false
  for (let i = 0; i < 200; i++) {
    await sleep(500)
    if ((await ev('typeof window.__nebula')) === 'object') {
      booted = true
      break
    }
  }
  check('知识图谱就绪', booted)

  // 等证明内容出现：卡片是 .pv-card，标题含"命题陈述"
  let cards = 0
  let bodyText = ''
  for (let i = 0; i < 60; i++) {
    await sleep(500)
    const info = await ev(`(() => {
      const cs = document.querySelectorAll('.pv-card')
      const pv = document.querySelector('.pv-page') || document.querySelector('[class*="pv-"]')
      return JSON.stringify({
        cards: cs.length,
        textLen: (pv ? pv.innerText : (document.body ? document.body.innerText : '')).length,
        loading: /加载中/.test(document.body ? document.body.innerText : ''),
      })
    })()`)
    if (info) {
      const j = JSON.parse(info)
      cards = j.cards
      if (j.cards > 0 && !j.loading) {
        bodyText = await ev(`(() => { const pv = document.querySelector('[class*="pv-"]'); return pv ? pv.innerText.slice(0, 400) : '' })()`)
        break
      }
    }
  }

  check('证明页渲染出内容卡片', cards > 0, `${cards} 张 .pv-card`)
  check('不是停留在"加载中"', !/加载中/.test(bodyText || ''), '')

  // 证明数据真的加载了吗？（通过宿主句柄查）
  const proofInfo = await ev(`(async () => {
    const pd = window.__nebula && window.__nebula.proofData
    if (!pd) return JSON.stringify({ available: false })
    let count = pd.getProofCount ? pd.getProofCount() : 0
    if (!count && pd.loadProofs) { await pd.loadProofs(); count = pd.getProofCount() }
    return JSON.stringify({ available: true, count, has: !!pd.getProof('${PROOF_ID}') })
  })()`)
  let pi = { available: false }
  try {
    pi = JSON.parse(proofInfo || '{}')
  } catch {
    /* ignore */
  }
  check('证明数据可加载', pi.available && pi.count > 0, `${pi.count ?? 0} 条`)
  check('深链指向的证明存在', !!pi.has, PROOF_ID)

  check('无 console 错误', consoleErrors.length === 0, consoleErrors.slice(0, 2).join(' | '))

  ws.close()
} catch (e) {
  failures++
  console.error('ERR:', e.message)
} finally {
  killAll()
  await sleep(800)
  try {
    execFileSync(
      'powershell',
      [
        '-NoProfile',
        '-Command',
        "Get-CimInstance Win32_Process -Filter \"Name='msedge.exe'\" | Where-Object { $_.CommandLine -like '*--headless*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }",
      ],
      { stdio: 'ignore', timeout: 15000 }
    )
  } catch {
    /* best effort */
  }
  try {
    fs.rmSync(prof, { recursive: true, force: true })
  } catch {
    /* ignore */
  }
}

console.log(failures === 0 ? '\n证明页检查通过' : `\n${failures} 项失败`)
process.exit(failures === 0 ? 0 : 1)
