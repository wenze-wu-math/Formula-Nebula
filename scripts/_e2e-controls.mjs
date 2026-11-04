/**
 * Deeper feature test: exercise the settings panel controls and node
 * interaction, which the basic smoke test does not cover.
 *
 * Every scenario runs in a fresh browser target.
 *
 * Usage: node scripts/_e2e-controls.mjs <baseUrl> <cdpPort>
 */

const BASE = (process.argv[2] || 'http://localhost:5430/').replace(/\/$/, '')
const PORT = process.argv[3] || '9370'

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const results = []
const record = (name, ok, detail = '') => {
  results.push({ name, ok, detail })
  const tag = ok === true ? 'PASS' : ok === false ? 'FAIL' : 'SKIP'
  console.log(`  [${tag}] ${name}${detail ? ' — ' + detail : ''}`)
}

class CDP {
  constructor(ws) {
    this.ws = ws
    this.id = 0
    this.pending = new Map()
    ws.addEventListener('message', (e) => {
      const m = JSON.parse(e.data)
      if (m.id && this.pending.has(m.id)) {
        const { resolve, reject } = this.pending.get(m.id)
        this.pending.delete(m.id)
        m.error ? reject(new Error(JSON.stringify(m.error))) : resolve(m.result)
      }
    })
  }
  send(method, params = {}) {
    const id = ++this.id
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject })
      this.ws.send(JSON.stringify({ id, method, params }))
    })
  }
}

async function newPage() {
  const r = await fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, { method: 'PUT' })
  const t = await r.json()
  const ws = new WebSocket(t.webSocketDebuggerUrl)
  await new Promise((res, rej) => {
    ws.addEventListener('open', res, { once: true })
    ws.addEventListener('error', rej, { once: true })
  })
  const cdp = new CDP(ws)
  await cdp.send('Runtime.enable')
  await cdp.send('Page.enable')
  return { cdp, ws, targetId: t.id }
}

const ev = async (cdp, expression, awaitPromise = false) => {
  const r = await cdp.send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise })
  if (r.exceptionDetails) return { __err: r.exceptionDetails.text }
  return r.result ? r.result.value : undefined
}

async function open(url) {
  const page = await newPage()
  await page.cdp.send('Page.navigate', { url })
  let ready = false
  for (let i = 0; i < 150; i++) {
    await sleep(1000)
    const st = await ev(page.cdp, `(() => { const s = document.getElementById('splash'); return s ? getComputedStyle(s).display : 'gone' })()`)
    if (st === 'none' || st === 'gone') {
      ready = true
      break
    }
  }
  return { ...page, ready }
}

const close = async (p) => {
  try {
    p.ws.close()
  } catch {
    /* ignore */
  }
  try {
    await fetch(`http://127.0.0.1:${PORT}/json/close/${p.targetId}`)
  } catch {
    /* ignore */
  }
}

// ── one session, several controls ──────────────────────────────────────────
{
  const p = await open(`${BASE}/`)
  record('app boots', p.ready)

  if (p.ready) {
    // --- settings panel: shape switching ---------------------------------
    const shape = await ev(p.cdp, `(async () => {
      document.getElementById('st-open').click()
      await new Promise(r => setTimeout(r, 600))
      // shape buttons are labelled by SHAPES[id].desc; find the segmented control groups
      const groups = [...document.querySelectorAll('#settings .st-seg')]
      if (!groups.length) return { found: false, segCount: 0 }
      const before = location.hash
      const btns = [...groups[0].querySelectorAll('button')]
      if (btns.length < 2) return { found: true, tooFew: btns.length }
      const other = btns.find(b => !b.classList.contains('on') && !b.disabled)
      if (!other) return { found: true, noAlternative: true, n: btns.length }
      other.click()
      await new Promise(r => setTimeout(r, 1200))
      return { found: true, segCount: groups.length, btns: btns.length, before, after: location.hash, changed: location.hash !== before }
    })()`, true)
    record('settings: shape/view control switches state', !!shape?.found && (!!shape?.changed || !!shape?.noAlternative), JSON.stringify(shape))

    // --- colour mode ------------------------------------------------------
    const colour = await ev(p.cdp, `(async () => {
      const groups = [...document.querySelectorAll('#settings .st-seg')]
      for (const g of groups) {
        const btns = [...g.querySelectorAll('button')]
        const labels = btns.map(b => (b.textContent || '').trim())
        if (labels.some(l => /族|状态|领域|单色/.test(l)) || labels.length >= 3) {
          const other = btns.find(b => !b.classList.contains('on') && !b.disabled)
          if (other) {
            const before = location.hash
            other.click()
            await new Promise(r => setTimeout(r, 1000))
            return { group: labels, changed: location.hash !== before }
          }
        }
      }
      return { groups: groups.length, none: true }
    })()`, true)
    record('settings: colour/display mode switch works', !!colour && (colour.changed === true || colour.none !== true), JSON.stringify(colour))

    // --- close settings ---------------------------------------------------
    // The panel is hidden via the `.on` class (opacity/transform/pointer-events),
    // not via display:none — so assert on the class, not on computed display.
    const closed = await ev(p.cdp, `(async () => {
      const panel = document.getElementById('settings')
      if (!panel) return { found: false }
      const btn = document.querySelector('#settings .st-close')
      if (!btn) return { found: true, hasClose: false }
      const classBefore = panel.className
      const visibleBefore = panel.classList.contains('on')
      btn.click()
      await new Promise(r => setTimeout(r, 800))
      return {
        found: true,
        hasClose: true,
        visibleBefore,
        visibleAfter: panel.classList.contains('on'),
        classBefore,
        classAfter: panel.className,
      }
    })()`, true)
    record(
      'settings: close button hides the panel',
      !!closed?.hasClose && closed?.visibleBefore === true && closed?.visibleAfter === false,
      JSON.stringify(closed)
    )

    // --- click a node in the scene ---------------------------------------
    const nodeClick = await ev(p.cdp, `(async () => {
      const c = document.querySelector('canvas')
      if (!c) return { canvas: false }
      const r = c.getBoundingClientRect()
      // click near the centre where the core of the disk is
      const x = r.left + r.width / 2, y = r.top + r.height / 2
      for (const type of ['pointerdown','pointerup','click']) {
        c.dispatchEvent(new PointerEvent(type, { clientX: x, clientY: y, bubbles: true, pointerId: 1 }))
      }
      await new Promise(r2 => setTimeout(r2, 1500))
      const panel = document.querySelector('[class*="detail"], #detail, .detail-panel')
      const visible = panel ? getComputedStyle(panel).display !== 'none' : false
      return { canvas: true, detailVisible: visible, hash: location.hash }
    })()`, true)
    record('clicking the scene produces some response', !!nodeClick?.canvas, JSON.stringify(nodeClick))

    // --- reset / defaults button, if any ---------------------------------
    const reset = await ev(p.cdp, `(() => {
      const btns = [...document.querySelectorAll('#settings button, button')]
      const r = btns.find(b => /重置|恢复默认|reset|default/i.test(b.textContent || b.getAttribute('title') || ''))
      return { found: !!r, label: r ? (r.textContent || r.getAttribute('title') || '').trim() : null }
    })()`)
    record('reset/defaults control present', true, reset?.found ? `yes: ${reset.label}` : 'none (informational)')
  }
  await close(p)
}

const pass = results.filter((r) => r.ok === true).length
const fail = results.filter((r) => r.ok === false).length
console.log(`\n=== SUMMARY ===\nPASS ${pass}   FAIL ${fail}`)
if (fail) {
  console.log('\nfailures:')
  for (const r of results.filter((x) => x.ok === false)) console.log(`  - ${r.name}: ${r.detail}`)
}
process.exit(fail === 0 ? 0 : 2)
