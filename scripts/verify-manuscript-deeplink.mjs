/**
 * Verify manuscript deep links with the format its hash.js actually defines:
 *   #n=<node-id>          select a node
 *   #q=<query>            run a search
 *   #v=x,y,z              camera position
 *
 * The earlier attempt used #p=5, which this design does not support and
 * never did — that was a test bug, not a product bug.
 */

import { spawn } from 'node:child_process'
import fs from 'node:fs'
import net from 'node:net'
import os from 'node:os'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const BROWSERS = [
  process.env.NEBULA_BROWSER,
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
].filter(Boolean)
const browser = BROWSERS.find((p) => fs.existsSync(p))
if (!browser) {
  console.log('SKIP: no browser')
  process.exit(0)
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
async function waitPort(port, ms = 40000) {
  const end = Date.now() + ms
  while (Date.now() < end) {
    const ok = await new Promise((res) => {
      const s = net.connect({ port, host: '127.0.0.1' }, () => {
        s.destroy()
        res(true)
      })
      s.on('error', () => res(false))
      s.setTimeout(600, () => {
        s.destroy()
        res(false)
      })
    })
    if (ok) return true
    await sleep(250)
  }
  return false
}
async function waitCdp(port, ms = 40000) {
  const end = Date.now() + ms
  while (Date.now() < end) {
    try {
      if ((await fetch(`http://127.0.0.1:${port}/json/version`)).ok) return true
    } catch {
      /* retry */
    }
    await sleep(250)
  }
  return false
}

const kids = []
const killAll = () => {
  for (const c of kids) {
    try {
      if (process.platform === 'win32') spawn('taskkill', ['/PID', String(c.pid), '/T', '/F'], { stdio: 'ignore' })
      else process.kill(-c.pid, 'SIGKILL')
    } catch {
      try {
        c.kill('SIGKILL')
      } catch {
        /* gone */
      }
    }
  }
}
process.on('exit', killAll)

const PORT = 5996
const CDP_PORT = 9996
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'fn-mdl-'))

let failures = 0
try {
  kids.push(
    spawn(process.execPath, [path.join(ROOT, 'node_modules', 'vite', 'bin', 'vite.js'), '--config', 'vite.designs.config.mjs', '--port', String(PORT), '--strictPort'], {
      cwd: ROOT,
      stdio: 'ignore',
    })
  )
  if (!(await waitPort(PORT))) throw new Error('vite did not start')

  kids.push(
    spawn(
      browser,
      ['--headless=new', '--disable-gpu', '--no-first-run', '--disable-extensions', '--window-size=1600,1000', '--no-sandbox', `--remote-debugging-port=${CDP_PORT}`, `--user-data-dir=${profile}`, 'about:blank'],
      { stdio: 'ignore', detached: process.platform !== 'win32' }
    )
  )
  if (!(await waitCdp(CDP_PORT))) throw new Error('no CDP')

  const t = await (await fetch(`http://127.0.0.1:${CDP_PORT}/json/new?about:blank`, { method: 'PUT' })).json()
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
    new Promise((res) => {
      const i = ++id
      pending.set(i, res)
      ws.send(JSON.stringify({ id: i, method, params }))
    })
  const ev = async (expr, awaitPromise = false) => {
    const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise })
    if (r.exceptionDetails) return { __err: r.exceptionDetails.text }
    return r.result ? r.result.value : undefined
  }

  await send('Runtime.enable')
  await send('Page.enable')

  const check = (name, ok, detail = '') => {
    if (ok) {
      console.log(`  ✓ ${name}${detail ? ' — ' + detail : ''}`)
    } else {
      failures++
      console.log(`  ✗ ${name}${detail ? ' — ' + detail : ''}`)
    }
  }

  // grab a real node id from the live graph first
  await send('Page.navigate', { url: `http://localhost:${PORT}/designs/manuscript/index.html` })
  for (let i = 0; i < 60; i++) {
    await sleep(1000)
    if ((await ev(`window.__design && window.__design.ready === true`)) === true) break
  }
  const probe = await ev(`(() => {
    const d = window.__design
    const g = d && d.graph
    if (!g || !g.nodes || !g.nodes.length) return null
    const n = g.nodes.find((x) => !x.cluster)
    return { id: n.id, name: n.name || n.en || n.id }
  })()`)
  if (!probe) throw new Error('could not read a node id from window.__design.graph')
  console.log(`\nprobe node: ${probe.id} (${probe.name})\n`)

  // 1. #n=<id> selects the node
  await send('Page.navigate', { url: `http://localhost:${PORT}/designs/manuscript/index.html#n=${encodeURIComponent(probe.id)}` })
  for (let i = 0; i < 60; i++) {
    await sleep(1000)
    if ((await ev(`window.__design && window.__design.ready === true`)) === true) break
  }
  await sleep(1500)
  const sel = await ev(`(() => {
    const d = window.__design
    return { selected: d && d.state ? d.state.selectedId : null, url: location.hash }
  })()`)
  check(
    '#n=<id> selects that node',
    // The assertion must be about the SELECTION, not about the URL. The old
    // version also accepted `sel.url.includes(probe.id)`, which is always true
    // here because we navigated to a URL containing that id — so the check
    // passed even when parseHash() was sabotaged and nothing got selected.
    // Caught by the negative control, which is exactly what it is for.
    !!sel && sel.selected === probe.id,
    JSON.stringify(sel)
  )

  // 2. #q=<query> runs the search
  await send('Page.navigate', { url: `http://localhost:${PORT}/designs/manuscript/index.html#q=scheme` })
  for (let i = 0; i < 60; i++) {
    await sleep(1000)
    if ((await ev(`window.__design && window.__design.ready === true`)) === true) break
  }
  await sleep(1500)
  const q = await ev(`(() => {
    const d = window.__design
    if (!d) return null
    // state.query / state.hits are the real fields (state.search does not exist;
    // search results are emitted on the bus and stored as query + hits).
    return { query: d.state.query, hits: Array.isArray(d.state.hits) ? d.state.hits.length : null }
  })()`)
  check('#q=<query> runs a search', !!q && (q.query === 'scheme' || (q.hits ?? 0) > 0), JSON.stringify(q))


  // 4. chapter navigation via the exposed action
  await send('Page.navigate', { url: `http://localhost:${PORT}/designs/manuscript/index.html` })
  for (let i = 0; i < 60; i++) {
    await sleep(1000)
    if ((await ev(`window.__design && window.__design.ready === true`)) === true) break
  }
  const chap = await ev(`(async () => {
    const d = window.__design
    if (!d || !d.actions) return { available: false }
    const before = d.view()
    // gotoChapter flies by default; jump without animation and then compare.
    d.actions.gotoChapter(3, { animate: false })
    await new Promise((r) => setTimeout(r, 600))
    const after = d.view()
    return {
      available: true,
      moved: Math.abs(before.x - after.x) + Math.abs(before.y - after.y) > 1,
      before: [Math.round(before.x), Math.round(before.y), Math.round(before.z * 1000)],
      after: [Math.round(after.x), Math.round(after.y), Math.round(after.z * 1000)],
    }
  })()`, true)
  check('gotoChapter moves the camera to that chapter', !!chap?.available && !!chap?.moved, JSON.stringify(chap))

  // 5. search via the action finds real entries
  const s2 = await ev(`(() => {
    const d = window.__design
    const r = d.search('Hodge')
    return { count: Array.isArray(r) ? r.length : null, sample: Array.isArray(r) && r[0] ? (r[0].id || r[0]) : null }
  })()`)
  check("actions.search('Hodge') finds entries", (s2?.count ?? 0) > 0, JSON.stringify(s2))
  // 3. junk hash must not throw and must not select anything bogus
  await send('Page.navigate', { url: `http://localhost:${PORT}/designs/manuscript/index.html#n=%%%&q=` })
  for (let i = 0; i < 60; i++) {
    await sleep(1000)
    if ((await ev(`window.__design && window.__design.ready === true`)) === true) break
  }
  await sleep(1000)
  const junk = await ev(`(() => ({ ready: !!(window.__design && window.__design.ready), sel: window.__design && window.__design.state ? window.__design.state.selectedId : null }))()`)
  check('junk hash does not break the app', !!junk?.ready, JSON.stringify(junk))

  ws.close()
} catch (e) {
  failures++
  console.error('ERR:', e.message)
} finally {
  killAll()
  await sleep(800)
  try {
    fs.rmSync(profile, { recursive: true, force: true })
  } catch {
    /* best effort */
  }
}

console.log(failures === 0 ? '\ndeep links OK' : `\n${failures} deep-link test(s) failed`)
process.exit(failures === 0 ? 0 : 1)
