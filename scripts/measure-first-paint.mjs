/**
 * G6/G7 的尺子：测量「首帧可见」与「全部烘焙完成」的间隔。
 *
 * 为什么现在能测到了
 * ------------------
 * 前几轮全部失败，原因值得记下来：
 *
 *   · 用 `getComputedStyle(#splash).display` 轮询 —— 测不到。因为 `hide()`
 *     自身要经过 300ms 淡出 + 500ms 才把 display 设成 none，而探测脚本往往
 *     在 __nebula 出现（更早）时就 break 了。
 *   · 用 `first-contentful-paint` —— 数值稳定，但它量的是 **splash 本身**
 *     （index.html 里的静态元素），不是星云。拿它当首帧会凭空造出 52 秒的
 *     假改进。
 *
 * 现在改为**在应用内部打点**：main.js 在真正该记录的两个位置写入
 *   window.__bakeDoneAt    全部公式烘焙完成
 *   window.__firstUsableAt splash 开始淡出、画布亮出（= 用户第一次看到星云）
 * 进程内时间戳没有轮询粒度问题，也不依赖任何 DOM 状态推断。
 *
 * 输出 docs/perf-baseline.json，供 score.mjs 的 G6/G7 判定读取。
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
const CDPP = 9797
const prof = fs.mkdtempSync(path.join(os.tmpdir(), 'fpaint3-'))

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
  let localServer = null
  if (!target) {
    execFileSync('npm', ['run', 'build'], { cwd: ROOT, stdio: 'ignore', shell: true, timeout: 240000 })
    const port = 5797
    localServer = spawn(
      process.execPath,
      [path.join(ROOT, 'node_modules', 'vite', 'bin', 'vite.js'), 'preview', '--port', String(port), '--strictPort'],
      { cwd: ROOT, stdio: 'ignore' }
    )
    kids.push(localServer)
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

  // 等两个打点都出现。__bakeDoneAt 先写，__firstUsableAt 在 splash 开始淡出时写。
  let bakeDoneAt = null
  let firstUsableAt = null
  let nodeCount = null

  for (let i = 0; i < 600; i++) {
    await sleep(500)
    const st = await ev(`JSON.stringify({
      bake: window.__bakeDoneAt || null,
      usable: window.__firstUsableAt || null,
      nodes: (window.__nebula && window.__nebula.graph) ? window.__nebula.graph.nodes.length : null,
    })`)
    if (st) {
      const j = JSON.parse(st)
      if (j.bake) bakeDoneAt = j.bake
      if (j.usable) firstUsableAt = j.usable
      if (j.nodes) nodeCount = j.nodes
      if (bakeDoneAt !== null && firstUsableAt !== null) break
    }
    if (i % 30 === 0 && i > 0) process.stdout.write('.')
  }

  // 分段耗时：定位烘焙之后那段时间花在哪。
  // 第一次测量发现首帧比烘焙完成晚 47 秒，仅靠两个总数看不出原因。
  console.log('\n═══ 分段耗时 ═══')
  const marksRaw = await ev('JSON.stringify(window.__bootMarks || {})')
  try {
    const m = JSON.parse(marksRaw || '{}')
    const order = ['bake', 'layout', 'buildNodes', 'finishLoading', 'sceneStart']
    let prev = 0
    for (const k of order) {
      if (m[k] == null) continue
      console.log(`  ${k.padEnd(16)} ${(m[k] / 1000).toFixed(2)}s   (本段 ${((m[k] - prev) / 1000).toFixed(2)}s)`)
      prev = m[k]
    }
  } catch {
    /* ignore */
  }

  console.log('\n═══ 结果 ═══')
  note(`全部烘焙完成 (__bakeDoneAt)  : ${bakeDoneAt !== null ? (bakeDoneAt / 1000).toFixed(2) + ' s' : '未记录'}`)
  note(`首帧可见 (__firstUsableAt)   : ${firstUsableAt !== null ? (firstUsableAt / 1000).toFixed(2) + ' s' : '未记录'}`)
  note(`节点数                       : ${nodeCount ?? '—'}`)

  let gap = null
  if (bakeDoneAt !== null && firstUsableAt !== null) {
    gap = firstUsableAt - bakeDoneAt
    note(`首帧落后烘焙完成              : ${(gap / 1000).toFixed(2)} s`)
    if (Math.abs(gap) < 2000) {
      note('  ⚠ 首帧几乎与烘焙完成同时 —— 说明首屏仍在等全部烘焙（G6 要解决的问题）')
    } else if (gap < -2000) {
      note('  ✓ 首帧明显早于烘焙完成 —— 首屏已不再等待全部烘焙')
    }
  }

  if (bakeDoneAt === null || firstUsableAt === null) failures++

  try {
    fs.writeFileSync(
      path.join(ROOT, 'docs', 'perf-baseline.json'),
      JSON.stringify(
        {
          measuredAt: new Date().toISOString(),
          target,
          firstVisibleMs: firstUsableAt,
          fullBakeMs: bakeDoneAt,
          gapMs: gap,
          nodeCount,
          method: 'in-app timestamps: __bakeDoneAt (all formulas baked) / __firstUsableAt (splash starts fading)',
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
