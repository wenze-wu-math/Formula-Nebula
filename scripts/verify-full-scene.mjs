/**
 * 验证两阶段烘焙之后，场景里的公式**最终**全部到位。
 *
 * 为什么需要这个检查器
 * --------------------
 * 为 G6 改成「先烘 240 个核心公式出图、其余后台补」之后，引入了一条新的
 * 失败路径：如果后台补全没跑、或 `rebuildNodes` 没把新贴图接上，用户会
 * 永远只看到 240 个公式，而**首帧测量仍然显示"改进成功"**。
 *
 * 也就是说，G6 的判据（首帧早于烘焙完成）可以被"根本没补全"这种缺陷满足。
 * 这个检查器专门堵这个洞：等后台烘焙结束后，断言可见精灵数 == 节点数。
 *
 * 用法：node scripts/verify-full-scene.mjs [url]
 */

import { spawn, execFileSync } from 'node:child_process'
import fs from 'node:fs'
import net from 'node:net'
import os from 'node:os'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const TARGET = process.argv[2] || 'http://localhost:5783/'

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
const PORT = 5801
const CDPP = 9801
const prof = fs.mkdtempSync(path.join(os.tmpdir(), 'fullscene-'))
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
  let target = TARGET
  if (LOCAL) {
    kids.push(
      spawn(process.execPath, [path.join(ROOT, 'node_modules', 'vite', 'bin', 'vite.js'), 'preview', '--port', String(PORT), '--strictPort'], {
        cwd: ROOT,
        stdio: 'ignore',
      })
    )
    if (!(await waitPort(PORT))) throw new Error('preview 未启动')
    target = `http://localhost:${PORT}/`
  }

  kids.push(
    spawn(browser, ['--headless=new', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--no-sandbox', `--remote-debugging-port=${CDPP}`, `--user-data-dir=${prof}`, 'about:blank'], {
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

  console.log(`\n目标: ${target}\n`)

  // 等首帧（__firstUsableAt 出现）
  let firstUsable = null
  for (let i = 0; i < 300; i++) {
    await sleep(500)
    const v = await ev('window.__firstUsableAt || null')
    if (v) {
      firstUsable = v
      break
    }
  }
  check('首帧已出现', firstUsable !== null, firstUsable ? `${(firstUsable / 1000).toFixed(1)}s` : '')

  // 首帧出现时，精灵数应远少于节点数（这正是 G6 的意义）
  const atFirst = await ev(`(() => {
    const n = window.__nebula
    if (!n || !n.graph) return null
    const withSprite = n.graph.nodes.filter(x => x.sprite).length
    return JSON.stringify({ total: n.graph.nodes.length, withSprite })
  })()`)
  let a = null
  try {
    a = JSON.parse(atFirst || 'null')
  } catch {
    /* ignore */
  }
  check(
    '首帧时只渲染了部分公式（两阶段生效）',
    !!a && a.withSprite > 0 && a.withSprite < a.total,
    a ? `${a.withSprite}/${a.total}` : '未取到'
  )

  // 等后台烘焙完成（__bakeDoneAt）
  let bakeDone = null
  for (let i = 0; i < 1200; i++) {
    await sleep(500)
    const v = await ev('window.__bakeDoneAt || null')
    if (v) {
      bakeDone = v
      break
    }
    if (i % 60 === 0 && i > 0) process.stdout.write('.')
  }
  check('后台烘焙已完成', bakeDone !== null, bakeDone ? `${(bakeDone / 1000).toFixed(1)}s` : '超时')
  if (firstUsable !== null && bakeDone !== null) {
    check('首帧显著早于烘焙完成（G6 判据）', bakeDone - firstUsable > 5000, `差 ${((bakeDone - firstUsable) / 1000).toFixed(1)}s`)
  }

  // 关键断言：补全之后，**所有**节点都应有精灵
  await sleep(3000)
  const final = await ev(`(() => {
    const n = window.__nebula
    if (!n || !n.graph) return null
    const withSprite = n.graph.nodes.filter(x => x.sprite).length
    return JSON.stringify({ total: n.graph.nodes.length, withSprite })
  })()`)
  let f = null
  try {
    f = JSON.parse(final || 'null')
  } catch {
    /* ignore */
  }
  check(
    '补全后所有节点都有精灵',
    !!f && f.withSprite === f.total,
    f ? `${f.withSprite}/${f.total}` : '未取到'
  )

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

console.log(failures === 0 ? '\n完整场景检查通过' : `\n${failures} 项失败`)
process.exit(failures === 0 ? 0 : 1)
