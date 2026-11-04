/**
 * Browser-level smoke check for the DOM proof reader, routing, and galaxy return.
 * Requires the production preview at 5176 (same contract as the other browser checks).
 */
import { spawn } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { setTimeout as sleep } from 'node:timers/promises'
import { requireChrome } from './_chrome.mjs'

const PORT = Number(process.env.PORT || 9470)
const base = new URL(process.env.URL || 'http://127.0.0.1:5176/')
base.searchParams.set('p', 'nullstellensatz')
const CHROME = requireChrome()
const profile = mkdtempSync(join(tmpdir(), 'neb-proof-view-'))
const chrome = spawn(CHROME, [
  '--headless=new', '--no-sandbox', '--disable-gpu-sandbox',
  '--enable-unsafe-swiftshader', '--use-gl=angle', '--use-angle=swiftshader',
  '--window-size=1500,950', `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${profile}`, '--no-first-run', '--no-default-browser-check', base.href,
], { stdio: 'ignore' })

let pass = 0
let fail = 0
function ok(condition, label, detail = '') {
  if (condition) { pass++; console.log(`  ✓ ${label}${detail ? `　${detail}` : ''}`) }
  else { fail++; console.log(`  ✗ ${label}${detail ? `　${detail}` : ''}`) }
}

class CDP {
  constructor(ws) {
    this.ws = ws
    this.id = 0
    this.pending = new Map()
    ws.addEventListener('message', (event) => {
      const msg = JSON.parse(event.data)
      if (!msg.id || !this.pending.has(msg.id)) return
      const { resolve, reject } = this.pending.get(msg.id)
      this.pending.delete(msg.id)
      msg.error ? reject(new Error(JSON.stringify(msg.error))) : resolve(msg.result)
    })
  }
  send(method, params = {}) {
    const id = ++this.id
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject })
      this.ws.send(JSON.stringify({ id, method, params }))
    })
  }
  async eval(source) {
    const response = await this.send('Runtime.evaluate', {
      expression: `(async()=>{${source}})()`, awaitPromise: true, returnByValue: true,
    })
    if (response.exceptionDetails) {
      throw new Error(response.exceptionDetails.exception?.description || response.exceptionDetails.text)
    }
    return response.result.value
  }
}

async function connect() {
  let target
  for (let i = 0; i < 600 && !target; i++) {
    try {
      const pages = await fetch(`http://127.0.0.1:${PORT}/json/list`).then((r) => r.json())
      target = pages.find((page) => page.type === 'page' && page.webSocketDebuggerUrl)
    } catch { /* Chrome remote debugging endpoint is starting */ }
    if (!target) await sleep(250)
  }
  if (!target) throw new Error(`Cannot connect to Chrome CDP on ${PORT}`)
  const ws = new WebSocket(target.webSocketDebuggerUrl)
  await new Promise((resolve, reject) => {
    ws.addEventListener('open', resolve, { once: true })
    ws.addEventListener('error', reject, { once: true })
  })
  return new CDP(ws)
}

let cdp
try {
  cdp = await connect()
  await cdp.send('Runtime.enable')
  await cdp.send('Page.enable')
  const until = Date.now() + 300000
  let ready = false
  while (Date.now() < until) {
    try {
      ready = await cdp.eval(`return !!window.__nebula?.proofView?.currentId && !!document.querySelector('#diag')`)
    } catch { ready = false }
    if (ready) break
    await sleep(500)
  }
  if (!ready) throw new Error('Timed out waiting for the deep-linked proof page')

  const screenshot = await cdp.send('Page.captureScreenshot', { format: 'png' })
  mkdirSync('shots/proof-qa', { recursive: true })
  writeFileSync('shots/proof-qa/deep-link.png', Buffer.from(screenshot.data, 'base64'))
  ok(true, '已生成证明页视觉 QA 截图', 'shots/proof-qa/deep-link.png')

  const state = await cdp.eval(`
    const n = window.__nebula
    return {
      proof: n.proofView.currentId,
      query: new URLSearchParams(location.search).get('p'),
      visible: document.querySelector('#proof-view')?.classList.contains('is-open'),
      steps: document.querySelectorAll('#proof-view details.pv-step').length,
      math: document.querySelectorAll('#proof-view .katex').length,
      calls: n.scene.renderer.info.render.calls,
    }
  `)
  ok(state.proof === 'nullstellensatz' && state.query === 'nullstellensatz',
    'query 深链直达证明页', JSON.stringify({ proof: state.proof, query: state.query }))
  ok(state.visible && state.steps >= 4, 'DOM 覆盖层显示完整命题步骤', `steps=${state.steps}`)
  /* ⚠ 判据不能是 "math > steps"。
   *
   * 这条是从早期数据继承来的：那时每条证明的**正文**都用 $...$ 或
   * String.raw 数学段写作，于是每步至少贡献一个 .katex，"katex 数 >
   * 步骤数"才成立。后来的长证明改成"中文长段 + Unicode 数学符号"
   * （见 src/data/proofs/new-*.js 的写作约定），只在真正需要排版公式时
   * 才用分隔符 —— 这正是 scripts/_check-proof-file.mjs 认可的写法。
   * nullstellensatz 因此只剩 conclusion 一处 $...$，得到 math=1 / steps=5，
   * 断言报红，而页面渲染完全正常（每步都在，见截图
   * shots/proof-qa/deep-link.png）。把它当成缺陷会逼着作者往正文里灌
   * 无意义的 $...$，那正是反样板检查在防的事。
   *
   * .pv-plain 有**两个**来源，这条断言同时守两件事：
   *   ① proofView.renderLatex 的 catch 分支 —— 数学段没能渲染
   *   ② proofView.depButton 在目标解析失败时的兜底 —— 依赖链接成了灰字
   * ② 抓到过一个真 bug：推论里的 uses 引用本证明的步骤 id 时，
   * renderUses 收到的是空集合，于是每个引用都退化成灰字。页面上看不出
   * 报错，只是那些依赖不再可点 —— 纯数值脚本全绿，只有查 DOM 才看得见。 */
  const plain = await cdp.eval(`return document.querySelectorAll('#proof-view .pv-plain').length`)
  ok(state.math >= 1 && plain === 0,
    '命题、证明步骤与结论的 LaTeX 都经 KaTeX 渲染（且无退化文本）',
    `math=${state.math} / steps=${state.steps} / 退化=${plain}`)

  await cdp.eval(`window.__nebula.proofView.open('ideal-variety')`)
  const directed = await cdp.eval(`return {
    prerequisite: [...document.querySelectorAll('#proof-view .pv-directed')]
      .some((card) => card.textContent.includes('证明依赖') && card.textContent.includes('希尔伯特零点定理')),
  }`)
  ok(directed.prerequisite, '节点级方向依赖与普通星云关联分开列出')
  const depFound = await cdp.eval(`return (
    [...document.querySelectorAll('#proof-view button.pv-link')]
      .some((button) => button.textContent.includes('希尔伯特零点定理'))
  )`)
  ok(depFound, '证明步骤把 uses 节点渲染成可点击链接')
  await cdp.eval(`
    [...document.querySelectorAll('#proof-view button.pv-link')]
      .find((button) => button.textContent.includes('希尔伯特零点定理'))?.click()
  `)
  let target = await cdp.eval(`return window.__nebula.proofView.currentId`)
  ok(target === 'nullstellensatz', '点击 uses 链接下潜到被依赖命题', String(target))

  await cdp.eval(`document.querySelector('#proof-view .pv-head .pv-btn')?.click()`)
  target = await cdp.eval(`return window.__nebula.proofView.currentId`)
  ok(target === 'ideal-variety', '面包屑历史可返回上一条命题', String(target))

  await cdp.eval(`document.querySelector('#proof-view .pv-primary')?.click()`)
  const returned = await cdp.eval(`
    const n = window.__nebula
    return {
      hidden: !document.querySelector('#proof-view')?.classList.contains('is-open'),
      query: new URLSearchParams(location.search).get('p'),
      selection: n.scene.selection,
      calls: n.scene.renderer.info.render.calls,
      cta: !!document.querySelector('#panel .proof-open'),
      contextCount: n.graph.nodes.filter((node) => n.scene.proofContextOf?.(node.id)).length,
    }
  `)
  ok(returned.hidden && returned.query === null && returned.selection === 'ideal-variety',
    '回到星云清除证明路由并聚焦当前命题', JSON.stringify(returned))
  ok(returned.contextCount > 0, '回到星云后直接关联节点进入证明上下文高亮',
    `context=${returned.contextCount}`)
  ok(returned.calls === state.calls, '打开/关闭 DOM 阅读页不增加 three.js draw call',
    `${state.calls} → ${returned.calls}`)

  await cdp.eval(`document.querySelector('#panel .proof-open')?.click()`)
  const reopened = await cdp.eval(`return {
    id: window.__nebula.proofView.currentId,
    query: new URLSearchParams(location.search).get('p'),
  }`)
  ok(reopened.id === 'ideal-variety' && reopened.query === 'ideal-variety',
    '详情面板入口可再次打开证明页', JSON.stringify(reopened))

  await cdp.eval(`history.back()`)
  let popped = false
  for (let i = 0; i < 30; i++) {
    popped = await cdp.eval(`return !document.querySelector('#proof-view')?.classList.contains('is-open') && new URLSearchParams(location.search).get('p') === null`)
    if (popped) break
    await sleep(100)
  }
  ok(popped, '浏览器后退回到星云视图并移除 proof query')
  await cdp.eval(`history.forward()`)
  let forwarded = false
  for (let i = 0; i < 30; i++) {
    forwarded = await cdp.eval(`return document.querySelector('#proof-view')?.classList.contains('is-open') && window.__nebula.proofView.currentId === 'ideal-variety'`)
    if (forwarded) break
    await sleep(100)
  }
  ok(forwarded, '浏览器前进恢复对应证明页')

  await cdp.eval(`
    window.__nebula.settings.setView('cluster')
    window.__nebula.proofView.open('noetherian')
  `)
  await cdp.eval(`document.querySelector('#proof-view .pv-primary')?.click()`)
  const visibleTarget = await cdp.eval(`return {
    view: window.__nebula.settings.state.view,
    selection: window.__nebula.scene.selection,
    nodeCluster: window.__nebula.graph.byId.get('noetherian')?.cluster,
  }`)
  ok(visibleTarget.view === 'overview' && visibleTarget.selection === 'noetherian',
    '从受限星团取景返回主星系命题时自动切到可见视图', JSON.stringify(visibleTarget))

  // Simulate a clean no-proof route, then exercise the first proof entry. The
  // host must push the nebula state before replacing it with ?p=… so Back and
  // Forward have the expected page semantics.
  await cdp.eval(`history.pushState({}, '', location.pathname + location.hash); dispatchEvent(new PopStateEvent('popstate'))`)
  await sleep(300)
  await cdp.eval(`document.querySelector('#panel .proof-open')?.click()`)
  let firstEntryProof = false
  for (let i = 0; i < 30; i++) {
    firstEntryProof = await cdp.eval(`return window.__nebula.proofView.currentId === 'noetherian'`)
    if (firstEntryProof) break
    await sleep(100)
  }
  ok(firstEntryProof, '无证明路由下首次点击节点入口可进入证明页')
  await cdp.eval(`history.back()`)
  let firstBack = false
  for (let i = 0; i < 30; i++) {
    firstBack = await cdp.eval(`return !document.querySelector('#proof-view')?.classList.contains('is-open') && new URLSearchParams(location.search).get('p') === null`)
    if (firstBack) break
    await sleep(100)
  }
  ok(firstBack, '首次证明入口的浏览器后退回到原星云状态')
  await cdp.eval(`history.forward()`)
  let firstForward = false
  for (let i = 0; i < 30; i++) {
    firstForward = await cdp.eval(`return document.querySelector('#proof-view')?.classList.contains('is-open') && window.__nebula.proofView.currentId === 'noetherian'`)
    if (firstForward) break
    await sleep(100)
  }
  ok(firstForward, '首次证明入口的浏览器前进恢复证明页')
} catch (error) {
  fail++
  console.error(`  ✗ browser proof check failed: ${error.message}`)
} finally {
  try { cdp?.ws.close() } catch {}
  try { chrome.kill() } catch {}
}

console.log(`\n结果：${pass} / ${pass + fail} 通过`)
process.exit(fail ? 1 : 0)
