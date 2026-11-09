/**
 * G6 的尺子：测量「首帧可见」与「全部烘焙完成」的时间差。
 *
 * 为什么改成这样测
 * ----------------
 * 前几版用 `getComputedStyle(#splash).display !== 'none'` 当首帧判据，结果
 * 反复测不到 —— 因为 splash 的隐藏发生在 `await bakeAll()` **之后**
 * （main.js: L167 await → L566 splash.hide()），所以两个事件本来就几乎同时，
 * 而且隐藏还叠了两层 setTimeout（300ms 淡出 + 500ms 设 display）。
 *
 * 更可靠的判据是浏览器自己的绘制记录：`PerformancePaintTiming` 的
 * `first-contentful-paint`。它是浏览器在真的画出第一块内容时写入的，
 * 不依赖任何应用侧约定。
 *
 * 同时读 `window.__nebula` 出现的时间，代表"全部烘焙结束"。
 * 两者之差就是「首帧只烘焙可见内容」理论上能省下的时间。
 *
 * 输出 docs/perf-baseline.json，供 scripts/score.mjs 的 G6 判定读取。
 *
 * 用法：node scripts/measure-first-paint.mjs [url]
 */

import { spawn, execFileSync } from 'node:child_process'
import fs from 'node:fs'
import net from 'node:net'
import os from 'node:os'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const ARG_URL = process.argv[2] || null

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
const CDPP = 9793
const prof = fs.mkdtempSync(path.join(os.tmpdir(), 'fpaint2-'))

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
const note = (m) => console.log('  ' + m)

try {
  let target = ARG_URL
  if (!target) {
    execFileSync('npm', ['run', 'build'], { cwd: ROOT, stdio: 'ignore', shell: true, timeout: 240000 })
    const port = 5793
    kids.push(
      spawn(process.execPath, [path.join(ROOT, 'node_modules', 'vite', 'bin', 'vite.js'), 'preview', '--port', String(port), '--strictPort'], {
        cwd: ROOT,
        stdio: 'ignore',
      })
    )
    if (!(await waitPort(port))) throw new Error('preview 未启动')
    target = `http://localhost:${port}/`
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
  ws.addEventListener('message', (e) => {
    const m = JSON.parse(e.data)
    if (m.id && pending.has(m.id)) {
      pending.get(m.id)(m.result)
      pending.delete(m.id)
    }
  })
  const send = (method, params = {}) =>
    new Promise((r) => {
      const i = ++id
      pending.set(i, r)
      ws.send(JSON.stringify({ id: i, method, params }))
    })
  const ev = async (x) => {
    const r = await send('Runtime.evaluate', { expression: x, returnByValue: true })
    if (r.exceptionDetails) return undefined
    return r.result ? r.result.value : undefined
  }

  await send('Runtime.enable')
  await send('Page.enable')
  await send('Page.navigate', { url: target })

  console.log(`\n目标: ${target}`)
  console.log('测量中（烘焙可能需要数分钟）…')

  // 轮询直到 __nebula 出现（= 全部烘焙完成、main() 跑到底）
  let fullBake = null
  let nodeCount = null
  for (let i = 0; i < 600; i++) {
    await sleep(500)
    const n = await ev('typeof window.__nebula')
    if (n === 'object') {
      const nodes = await ev('window.__nebula && window.__nebula.graph ? window.__nebula.graph.nodes.length : 0')
      fullBake = (i + 1) * 500
      nodeCount = nodes
      break
    }
    if (i % 30 === 0 && i > 0) process.stdout.write('.')
  }

  // __nebula 出现时 splash 往往**还在淡出**：main() 里 hide() 叠了
  // setTimeout(300) + setTimeout(500)，而 __nebula 是紧接着同步赋值的。
  // 前几版在这里直接 break，于是永远抓不到 splash 变成 none 的那一刻 ——
  // 这正是 firstVisible 反复为 null 的真正原因。
  // 现在继续观察到 splash 真正隐藏（最多再等 4 秒）。
  let splashHidden = null
  for (let k = 0; k < 13; k++) {
    const d = await ev(`(() => { const el = document.getElementById('splash'); return el ? getComputedStyle(el).display : 'gone' })()`)
    if (d === 'none' || d === 'gone') {
      splashHidden = (fullBake || 0) + k * 300
      break
    }
    await sleep(300)
  }

  // 读浏览器自己的绘制记录（与应用的 setTimeout 无关）。
  // 注意：first-contentful-paint 在这里代表的是 **splash 本身**被画出来的
  // 时刻（splash 是 HTML 里的静态元素），所以它 ≈ 页面开始加载，
  // 不能当作"用户看到星云"。真正可用于 G6 的判据是 splashHidden。
  const paints = await ev(`JSON.stringify(
    performance.getEntriesByType('paint').map(p => ({ name: p.name, startTime: Math.round(p.startTime) }))
  )`)

  const fcp = (() => {
    try {
      const arr = JSON.parse(paints || '[]')
      const hit = arr.find((p) => p.name === 'first-contentful-paint')
      return hit ? hit.startTime : null
    } catch {
      return null
    }
  })()

  console.log('\n═══ 结果 ═══')
  note(`first-contentful-paint : ${fcp !== null ? (fcp / 1000).toFixed(2) + ' s   （= splash 本身画出来，非星云）' : '未记录'}`)
  note(`全部烘焙完成 (__nebula) : ${fullBake !== null ? (fullBake / 1000).toFixed(2) + ' s' : '未测得'}`)
  note(`splash 真正隐藏          : ${splashHidden !== null ? (splashHidden / 1000).toFixed(2) + ' s   （= 用户第一次看到星云）' : '未测得'}`)
  note(`节点数                  : ${nodeCount ?? '—'}`)

  // G6 的差值用 splashHidden - fullBake：
  // 两者若几乎相等（差 < 1s），说明首帧**完全在等全部烘焙** —— 这就是
  // 需要被优化的现状。若将来改成"先画可见内容"，splashHidden 会显著早于
  // fullBake，差值变大，G6 才可能达标。
  let gap = null
  if (splashHidden !== null && fullBake !== null) {
    gap = fullBake - splashHidden
    note(`首帧到烘焙完成          : ${(gap / 1000).toFixed(2)} s`)
    if (Math.abs(gap) < 1000) {
      note('  ⚠ 差值 < 1s：首帧仍在等全部烘焙（这正是 G6 要解决的问题）')
    }
  }

  if (fullBake === null) failures++

  // 落盘供 score.mjs 的 G6 判定
  try {
    fs.writeFileSync(
      path.join(ROOT, 'docs', 'perf-baseline.json'),
      JSON.stringify(
        {
          measuredAt: new Date().toISOString(),
          target,
          firstVisibleMs: splashHidden,
          fullBakeMs: fullBake,
          gapMs: gap,
          nodeCount,
          method: 'firstVisible = PerformancePaintTiming.first-contentful-paint; fullBake = window.__nebula 出现',
        },
        null,
        2
      ) + '\n',
      'utf8'
    )
    note('（已写入 docs/perf-baseline.json）')
  } catch (e) {
    console.warn('  写入基线失败:', e.message)
  }

  ws.close()
} catch (e) {
  failures++
  console.error('ERR:', e.message)
} finally {
  killAll()
  await sleep(900)
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

process.exit(failures === 0 ? 0 : 1)
