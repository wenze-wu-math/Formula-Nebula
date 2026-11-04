/**
 * ═══════════════════════════════════════════════════════════════
 *  验证 urlState.js —— 深链编码/解码
 * ═══════════════════════════════════════════════════════════════
 *
 *  这个脚本的重点不在"正常路径能跑通"，而在**不可信输入**：
 *  decodeState 解析的是地址栏，手改 / 截断 / 旧版本 / 恶意构造
 *  都会进来。它一旦抛异常就是整页白屏（见 urlState.js 文件头），
 *  所以下面有一整节专门做敌意输入。
 *
 *  跑法：node scripts/verify-url-state.mjs
 */

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

import {
  SCHEMA_VERSION, VIEWS, SHAPES, COLORINGS,
  encodeState, decodeState, decodeLocationState,
  mergeState, stateToHashInput, hashEquals,
} from '../src/urlState.js'
import {
  encodeProofLink, encodeProofHash, proofIdFromLocation,
  withoutProofQuery,
} from '../src/proofRouter.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

let pass = 0
let fail = 0
function ok(msg) { pass++; console.log(`  ✓ ${msg}`) }
function bad(msg, extra) {
  fail++
  console.log(`  ✗ ${msg}`)
  if (extra !== undefined) console.log(`      ${extra}`)
}
function assert(cond, msg, extra) { cond ? ok(msg) : bad(msg, extra) }
function eq(a, b, msg) {
  const same = JSON.stringify(a) === JSON.stringify(b)
  same ? ok(msg) : bad(msg, `期望 ${JSON.stringify(b)} / 实际 ${JSON.stringify(a)}`)
}
function section(t) { console.log(`\n── ${t} ──`) }

/* ═══════════════ 1. 与真实枚举保持同步 ═══════════════
 *
 * urlState.js 为了保持纯净（能在 Node 里直接 import，不被 three.js
 * 和 localStorage 拖累）而**复制**了三个枚举表。复制就有不同步的风险，
 * 所以这里直接读源文件把两边的字面量抠出来逐项比对 ——
 * 这是整个脚本里最有价值的一条断言：哪天有人往 config.js 加一个
 * 形态却忘了加到这里，分享出去的链接会静默地丢掉这个形态。 */
section('1. 枚举与 config.js / settings.js 同步')

function literalKeys(src, exportName) {
  const i = src.indexOf(`export const ${exportName} = {`)
  if (i < 0) return null
  // 从 { 开始做一次括号配对，取出对象字面量
  let depth = 0
  const start = src.indexOf('{', i)
  for (let j = start; j < src.length; j++) {
    if (src[j] === '{') depth++
    else if (src[j] === '}') {
      depth--
      if (depth === 0) {
        const body = src.slice(start + 1, j)
        // 顶层键：行首缩进两个空格、标识符、冒号
        return [...body.matchAll(/^\s{2}([A-Za-z_][\w]*)\s*:/gm)].map((m) => m[1])
      }
    }
  }
  return null
}

const configSrc = readFileSync(join(ROOT, 'src/config.js'), 'utf8')
const settingsSrc = readFileSync(join(ROOT, 'src/settings.js'), 'utf8')

const cfgShapes = literalKeys(configSrc, 'SHAPES')
const cfgViews = literalKeys(configSrc, 'VIEWS')
const cfgColorModes = literalKeys(settingsSrc, 'COLOR_MODES')

assert(cfgShapes && cfgShapes.length > 0, `从 config.js 读到 SHAPES（${(cfgShapes || []).length} 项）`, cfgShapes)
assert(cfgViews && cfgViews.length > 0, `从 config.js 读到 VIEWS（${(cfgViews || []).length} 项）`, cfgViews)
assert(cfgColorModes && cfgColorModes.length > 0, `从 settings.js 读到 COLOR_MODES（${(cfgColorModes || []).length} 项）`, cfgColorModes)

eq([...SHAPES].sort(), [...(cfgShapes || [])].sort(), 'SHAPES 与 config.js 逐项一致')
eq([...VIEWS].sort(), [...(cfgViews || [])].sort(), 'VIEWS 与 config.js 逐项一致')
eq([...COLORINGS].sort(), [...(cfgColorModes || [])].sort(), 'COLORINGS 与 settings.js 的 COLOR_MODES 逐项一致')

// TWEAKABLE / DISPLAY 的键名必须被 urlState 的短键表完整覆盖，
// 否则"改了某个滑块"这件事根本进不了链接。
const tweakKeys = literalKeys(configSrc, 'TWEAKABLE')
const displayKeys = literalKeys(settingsSrc, 'DISPLAY')
const encodableParams = new Set()
const encodableDisplay = new Set()
{
  // 通过 stateToHashInput 反查：给一个"全部偏离默认"的状态，看哪些键留了下来
  const st = { tweak: {}, display: {} }
  const dv = { tweak: {}, display: {} }
  for (const k of tweakKeys || []) { st.tweak[k] = 1; dv.tweak[k] = 0 }
  for (const k of displayKeys || []) { st.display[k] = true; dv.display[k] = false }
  const inp = stateToHashInput(st, dv)
  for (const k of Object.keys(inp.params || {})) encodableParams.add(k)
  for (const k of Object.keys(inp.display || {})) encodableDisplay.add(k)
}
const missingParams = (tweakKeys || []).filter((k) => !encodableParams.has(k))
const missingDisplay = (displayKeys || []).filter((k) => !encodableDisplay.has(k))
assert(missingParams.length === 0,
  `全部 ${(tweakKeys || []).length} 个 TWEAKABLE 参数都能进链接`, `缺失: ${missingParams}`)
assert(missingDisplay.length === 0,
  `全部 ${(displayKeys || []).length} 个 DISPLAY 开关都能进链接`, `缺失: ${missingDisplay}`)

/* ═══════════════ 2. 往返 ═══════════════ */
section('2. 编码 → 解码 往返')

const roundTrips = [
  ['空状态', {}],
  ['只有节点', { node: 'cn-hodge' }],
  ['只有视图', { view: 'cluster' }],
  ['只有形态', { shape: 'barred' }],
  ['只有着色', { coloring: 'status' }],
  ['节点+视图+着色', { node: 'cn-jacobian', view: 'cluster', coloring: 'status' }],
  ['全部标量字段', { node: 'moduli-space', view: 'galaxy', shape: 'ring', coloring: 'field' }],
  ['含数值参数', { node: 'a', params: { spinRate: 0.02, bloomThreshold: 1.1, hoverScale: 1.5 } }],
  ['含显示开关', { node: 'a', display: { links: true, cluster: false, bloom: true } }],
  ['应有尽有', {
    node: 'cn-riemann', view: 'cluster', shape: 'diffuse', coloring: 'mono',
    params: { spinRate: 0, decorRatio: 2, bloomStrength: 1.6, bloomThreshold: 0.2, brightness: 0.3, glowStrength: 1.5, glowScale: 3, linkOpacity: 0.8, hoverScale: 1 },
    display: { links: false, cluster: true, clusterHalo: false, markers: true, nebula: false, stars: false, disc: true, bloom: false, legend: true, bob: false, autoRotate: true },
  }],
]

for (const [label, st] of roundTrips) {
  const hash = encodeState(st)
  const dec = decodeState(hash)
  let good = dec.version === SCHEMA_VERSION
  if (st.node) good = good && dec.node === st.node
  if (st.view) good = good && dec.view === st.view
  if (st.shape) good = good && dec.shape === st.shape
  if (st.coloring) good = good && dec.coloring === st.coloring
  for (const [k, v] of Object.entries(st.params || {})) {
    good = good && Math.abs(dec.params[k] - v) < 1e-9
  }
  for (const [k, v] of Object.entries(st.display || {})) {
    good = good && dec.display[k] === v
  }
  assert(good, `${label}　→　${hash}`, JSON.stringify(dec))
}

/* ═══════════════ 3. 默认值不进链接 ═══════════════
 *
 * 这是"链接要短"的核心机制：只有偏离默认的东西才写进 URL。
 * 若这条挂了，任何一条分享链接都会拖上十几个参数。 */
section('3. 默认值被省略')

const defaults = {
  shape: 'spiral', colorMode: 'family', view: 'overview',
  tweak: { spinRate: 0.011, decorRatio: 1.27, bloomStrength: 0.58, bloomThreshold: 0.80, brightness: 1.0, glowStrength: 0.55, glowScale: 0.85, linkOpacity: 0.22, hoverScale: 1.22 },
  display: { links: true, cluster: true, clusterHalo: true, markers: true, nebula: true, stars: true, disc: true, bloom: true, legend: true, bob: true, autoRotate: false },
}

const nothingChanged = stateToHashInput({ ...defaults, node: undefined }, defaults)
eq(nothingChanged, {}, '全默认 → stateToHashInput 返回空对象')

const fullDefaultState = { ...defaults }
const hashDefault = encodeState(stateToHashInput(fullDefaultState, defaults))
eq(hashDefault, `v${SCHEMA_VERSION}`, `全默认 → 最简 hash（${hashDefault}）`)

// 浮点容差：把默认值原样抄一遍，不应该被判为"改动"
const nearlyDefault = { ...defaults, tweak: { ...defaults.tweak, glowScale: 0.85 + 1e-12 } }
eq(stateToHashInput(nearlyDefault, defaults), {}, '浮点噪声不被判为改动')

// 只改一个：hash 里只应多出这一个参数
const oneChange = { ...defaults, tweak: { ...defaults.tweak, brightness: 1.3 } }
const h1 = encodeState(stateToHashInput(oneChange, defaults))
assert(/p=l1\.3$/.test(h1) || h1.includes('p=l1.3'), `只改一个参数 → 只多一段（${h1}）`, h1)
eq(decodeState(h1).params.brightness, 1.3, '该参数能解回来')

/* ═══════════════ 4. 敌意 / 畸形输入 ═══════════════
 *
 * 这一节是本脚本存在的主要理由。每一条都必须在**不抛异常**的前提下
 * 返回一个安全的空壳，且不能把垃圾值塞进已知字段。 */
section('4. 敌意与畸形输入（全部不得抛异常）')

const hostile = [
  ['空串', ''],
  ['单个 #', '#'],
  ['纯垃圾', 'garbage'],
  ['空节点值', 'v1&n='],
  ['URL 编码中文', 'v1&n=%E4%B8%AD%E6%96%87'],
  ['未来版本', 'v9&n=x'],
  ['旧版本', 'v0&n=x'],
  ['无版本号的裸参数', 'n=cn-hodge&w=cluster'],
  ['非法形态', 'v1&s=banana'],
  ['非法视图', 'v1&w=nope'],
  ['非法着色', 'v1&c=rainbow'],
  ['NaN 参数', 'v1&p=lNaN'],
  ['Infinity 参数', 'v1&p=lInfinity'],
  ['空参数段', 'v1&p=,,,'],
  ['只有代码没有值', 'v1&p=l'],
  ['一串 &', 'v1&&&&&&'],
  ['重复键', 'v1&n=a&n=b'],
  ['超长垃圾', 'v1&n=' + 'x'.repeat(5000)],
  ['脚本注入', 'v1&n=<script>alert(1)</script>'],
  ['未知键', 'v1&zzz=1&yyy=2'],
  ['显示开关截断', 'v1&d=+l-c+h'],
  ['显示开关全非法', 'v1&d=XXYY'],
  ['只有版本', 'v1'],
  ['大小写版本', 'V1&n=x'],
  ['等号在值里', 'v1&n=a=b'],
  ['引号', 'v1&n="quoted"'],
]

for (const [label, input] of hostile) {
  let threw = null
  let dec = null
  try {
    dec = decodeState(input)
  } catch (e) {
    threw = e
  }
  if (threw) {
    bad(`${label}　抛异常了`, threw.message)
    continue
  }
  // 安全性的核心：known 字段只能是"合法值或 undefined"，永远不能是垃圾
  const badShape = dec.shape !== undefined && !SHAPES.includes(dec.shape)
  const badView = dec.view !== undefined && !VIEWS.includes(dec.view)
  const badColor = dec.coloring !== undefined && !COLORINGS.includes(dec.coloring)
  const badNum = Object.values(dec.params).some((v) => !Number.isFinite(v))
  const badNode = dec.node !== undefined && typeof dec.node !== 'string'
  const clean = !badShape && !badView && !badColor && !badNum && !badNode

  const shown = input.length > 34 ? input.slice(0, 31) + '...' : input
  const summary = [
    dec.node !== undefined ? `n=${JSON.stringify(dec.node).slice(0, 20)}` : null,
    dec.view !== undefined ? `w=${dec.view}` : null,
    dec.shape !== undefined ? `s=${dec.shape}` : null,
    dec.coloring !== undefined ? `c=${dec.coloring}` : null,
    Object.keys(dec.params).length ? `p=${Object.keys(dec.params).length}项` : null,
    Object.keys(dec.display).length ? `d=${Object.keys(dec.display).length}项` : null,
    Object.keys(dec.unknown).length ? `unknown=${Object.keys(dec.unknown).length}` : null,
  ].filter(Boolean).join(' ') || '(空)'

  assert(clean, `${label}　[${shown}] → ${summary}`,
    clean ? '' : JSON.stringify({ shape: dec.shape, view: dec.view, coloring: dec.coloring, params: dec.params }))
}

// 逐条落实几个关键行为
eq(decodeState('').version, 0, '空串 → version 0')
eq(decodeState('v1&n=').node, undefined, '`n=` 空值不被当成"选中空 id"')
eq(decodeState('v9&n=x').node, undefined, '未来版本整条忽略（node 为 undefined）')
eq(decodeState('v9&n=x').version, 9, '未来版本仍如实报告版本号')
eq(decodeState('n=cn-hodge&w=cluster').node, undefined, '无版本号 → 整条忽略')
eq(decodeState('n=cn-hodge&w=cluster').unknown.n, 'cn-hodge', '无版本号 → 内容进 unknown 而不是被丢弃')
eq(decodeState('v1&s=banana').shape, undefined, '非法形态被拒绝')
eq(decodeState('v1&s=barred').shape, 'barred', '合法形态被接受')
eq(decodeState('v1&w=cluster').view, 'cluster', '合法视图被接受')
eq(decodeState('v1&p=lNaN').params.brightness, undefined, 'NaN 参数被拒绝')
eq(decodeState('v1&p=lInfinity').params.brightness, undefined, 'Infinity 参数被拒绝')
eq(decodeState('v1&p=l').params.brightness, undefined, '空值参数被拒绝（Number("")===0 陷阱）')
eq(decodeState('v1&p=,l1.2,').params.brightness, 1.2, '夹在空段之间的合法参数仍能解出')
eq(decodeState('v1&n=a&n=b').node, 'b', '重复键取后者（URLSearchParams 语义）')
eq(decodeState('v1&zzz=1&yyy=2').unknown.zzz, '1', '未知键进 unknown，不被静默丢弃')
eq(decodeState('v1&d=XXYY').display, {}, '全非法的显示段不产生任何开关')

/* ── 回归：`+` 在 URLSearchParams 里代表空格，不能用作开关符号 ──
 *
 * 第一版用 `+l-c` 表示"连线开、星团关"，结果解出来是 `" l-c"`：
 * 开关全部失效，还会往 unknown 里塞垃圾。这条断言把那个坑钉死。
 * 若哪天有人把 1/0 改回 +/-，这里会立刻红。 */
assert(decodeState('v1&d=1l0c1b').display.links === true
  && decodeState('v1&d=1l0c1b').display.cluster === false
  && decodeState('v1&d=1l0c1b').display.bloom === true,
  '1/0 开关语义正确（1l0c1b → 连线开、星团关、辉光开）')
assert(Object.keys(decodeState('v1&d=+l-c').display).length === 0,
  '旧式 +/- 编码不再被接受（`+` 会被解成空格，必须走 unknown）')
assert(encodeState({ display: { links: true, cluster: false } }).includes('d=1l0c')
  || encodeState({ display: { links: true, cluster: false } }).includes('d=0c1l'),
  '编码端也只产出 1/0，不产出 +')

/* ═══════════════ 5. 注入安全 ═══════════════
 *
 * 节点 id 里若含 & = # 空格，说明编码不是"字符串拼接"而是真的转义过。
 * 这条挂了意味着任何特殊字符都能伪造出额外的参数。 */
section('5. 特殊字符不破坏结构')

const trickyIds = [
  'a&b', 'a=b', 'a#b', 'a b', 'a+b', 'a%b', 'a/b', 'a?b',
  '中文节点', 'a&w=cluster', 'x&p=l9.9', 'a=b&c=d', 'a b&c',
]
for (const id of trickyIds) {
  const h = encodeState({ node: id })
  const d = decodeState(h)
  const okNode = d.node === id
  // 结构必须没被污染：一个只是长得像参数的 id 不能真的改掉 view
  const noLeak = d.view === undefined && Object.keys(d.params).length === 0
  assert(okNode && noLeak, `节点 id ${JSON.stringify(id)} 往返且不泄漏参数　→　${h}`,
    JSON.stringify({ got: d.node, view: d.view, params: d.params }))
}

/* ═══════════════ 6. mergeState ═══════════════ */
section('6. mergeState 不修改入参')

const baseState = {
  shape: 'spiral', colorMode: 'family', view: 'overview',
  tweak: { spinRate: 0.011, brightness: 1.0 },
  display: { links: true, cluster: true },
  gravity: false,
}
const snapshot = JSON.stringify(baseState)

const decodedFull = decodeState(encodeState({
  node: 'cn-hodge', view: 'cluster', shape: 'barred', coloring: 'status',
  params: { brightness: 1.4 }, display: { links: false },
}))
const merged = mergeState(baseState, decodedFull)

eq(JSON.stringify(baseState), snapshot, 'mergeState 没有改动 base')
assert(merged !== baseState, 'mergeState 返回的是新对象')
eq(merged.shape, 'barred', 'mergeState 覆盖了 shape')
eq(merged.view, 'cluster', 'mergeState 覆盖了 view')
eq(merged.colorMode, 'status', 'mergeState 把 coloring 映射到 colorMode')
eq(merged.tweak.brightness, 1.4, 'mergeState 合并了 tweak')
eq(merged.tweak.spinRate, 0.011, 'mergeState 保留了未提及的 tweak')
eq(merged.display.links, false, 'mergeState 合并了 display')
eq(merged.display.cluster, true, 'mergeState 保留了未提及的 display')
eq(merged.gravity, false, 'mergeState 保留了顶层未知字段')

// 深层隔离：改 merged 的子对象不能碰到 base
merged.tweak.brightness = 99
merged.display.links = true
eq(baseState.tweak.brightness, 1.0, 'merged.tweak 与 base.tweak 不共享引用')
eq(baseState.display.links, true, 'merged.display 与 base.display 不共享引用')

// 空 decoded 不应改变任何东西
const mergedEmpty = mergeState(baseState, decodeState(''))
eq(mergedEmpty.shape, 'spiral', '空 decoded → shape 不变')
eq(mergedEmpty.colorMode, 'family', '空 decoded → colorMode 不变')
eq(mergedEmpty.view, 'overview', '空 decoded → view 不变')
eq(JSON.stringify(mergeState(baseState, null)), JSON.stringify(baseState), 'decoded=null 时结果等于 base')

/* ═══════════════ 7. hashEquals ═══════════════ */
section('7. hashEquals')

assert(hashEquals('v1&n=a&w=cluster', 'v1&w=cluster&n=a'), '顺序不同但语义相同 → 相等')
assert(hashEquals('v1&n=a', 'n=a&v1'), '版本标记位置不同 → 相等')
assert(!hashEquals('v1&n=a', 'v1&n=b'), '节点不同 → 不相等')
assert(!hashEquals('v1&w=cluster', 'v1&w=galaxy'), '视图不同 → 不相等')
assert(!hashEquals('v1&s=spiral', 'v1&s=ring'), '形态不同 → 不相等')
assert(!hashEquals('v1&d=1l', 'v1&d=0l'), '开关不同 → 不相等')
assert(!hashEquals('v1&p=l1.0', 'v1&p=l1.5'), '参数不同 → 不相等')
assert(hashEquals('', 'garbage'), '两条都无效 → 语义都为空，视为相等')
assert(hashEquals('v1&p=l1.0000001', 'v1&p=l1.0'), '参数差在容差内 → 相等')
assert(!hashEquals('v1&n=a', 'v9&n=a'), '版本不同 → 不相等')

/* ═══════════════ 8. 真实节点的链接 ═══════════════
 *
 * 用数据文件里真实存在的 id 走一遍，确保 id 里的连字符/前缀
 * 不会在 URL 里出问题。 */
section('8. 真实节点 id')

const conjSrc = readFileSync(join(ROOT, 'src/data/conjectures.js'), 'utf8')
const realIds = [...conjSrc.matchAll(/id:\s*'([^']+)'/g)].map((m) => m[1])
assert(realIds.length > 40, `从 conjectures.js 读到 ${realIds.length} 个真实 id`)

const realBad = []
for (const id of realIds) {
  const h = encodeState({ node: id, view: 'cluster', coloring: 'status' })
  const d = decodeState(h)
  if (d.node !== id || d.view !== 'cluster' || d.coloring !== 'status') realBad.push(id)
}
assert(realBad.length === 0, `${realIds.length} 个真实 id 全部往返正确`, realBad.join(', '))

const sampleHash = encodeState({ node: realIds[0], view: 'cluster', coloring: 'status', shape: 'spiral' })
console.log(`  例：${realIds[0]} → #${sampleHash}`)

/* ═══════════════ 9. 证明页路由（query + hash） ═══════════════
 *
 * 旧版 hash 已把 p= 留给数值参数。证明页使用 ?p=<id>，并提供
 * hash v1&k=<id> 的规范写法；两者叠加时必须同时保留星云设置。 */
section('9. 证明页深链（不破坏旧 p= 参数）')
const proofHash = encodeState({ proof: 'nullstellensatz', params: { brightness: 1.2 } })
assert(proofHash.includes('k=nullstellensatz'), `proof 编码使用 k=　→　${proofHash}`)
const proofDecoded = decodeState(proofHash)
assert(proofDecoded.proof === 'nullstellensatz' && proofDecoded.params.brightness === 1.2,
  'hash proof 与旧数值 p= 可同时解码', JSON.stringify(proofDecoded))
const queryDecoded = decodeLocationState('?p=zariski-topology', '#v1&p=l1.2')
assert(queryDecoded.proof === 'zariski-topology' && queryDecoded.params.brightness === 1.2,
  'query ?p= 与 hash p= 命名空间隔离', JSON.stringify(queryDecoded))
assert(decodeLocationState('?p=a%26b', '').proof === 'a&b',
  'query proof id 正确解码特殊字符')
assert(decodeLocationState('?p=', '#v1&k=fallback').proof === 'fallback',
  '空 query proof 不覆盖合法 hash proof')
let routeThrew = false
try { decodeLocationState({ search: null, hash: Symbol('bad') }) } catch { routeThrew = true }
assert(!routeThrew, 'decodeLocationState 对畸形 location-like 输入永不抛异常')
assert(encodeProofLink('foo') === '?p=foo', 'encodeProofLink 默认生成 query 短链')
assert(encodeProofLink('a&b').includes('p=a%26b'), 'encodeProofLink 转义特殊字符')
assert(encodeProofHash('foo', { view: 'cluster' }) === 'v1&k=foo&w=cluster',
  'encodeProofHash 生成规范 hash')
assert(proofIdFromLocation('?p=query', '#v1&k=hash') === 'query',
  'query proof 在冲突时优先')
assert(withoutProofQuery('?p=foo&a=1') === '?a=1', 'withoutProofQuery 保留其它参数')

/* ═══════════════ 汇总 ═══════════════ */
console.log(`\n${'─'.repeat(48)}`)
console.log(`结果：${pass} / ${pass + fail} 通过`)
if (fail) console.log(`失败 ${fail} 项`)
process.exit(fail ? 1 : 0)
