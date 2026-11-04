/**
 * 加内容会不会把老公式挤走？—— v1 → v2 的实测。
 *
 * 用法: node scripts/check-radius-shift.mjs
 *   （纯 Node，不需要服务器；跨版本读两个目录的数据文件）
 *
 * ── 为什么值得单独写一个脚本 ──
 *
 * 因为这个问题我**先后答错了两次**，两次都是"推理听起来对、一测就塌"：
 *
 *   错法一：「半径按分位数映射，所以加数据不影响老公式。」
 *           → 机制就错了。rank 是按族做 **min-max** 归一化
 *             （(importance − lo) / span），新数据会改变 lo/span。
 *
 *   错法二：「半径对 rank 的敏感度在中段最低，所以位移可忽略。」
 *           → 算得没错，但问错了问题。半径根本不由 rank 的**数值**决定，
 *             而由 rank 排序后的**累计面积份额 c** 决定：
 *
 *               order = nodes.sort(by rank desc)
 *               c     = (累计面积 − 本节点面积/2) / 总面积
 *               radius = inv(a0 + c * (a1 − a0))
 *
 *             所以只要**排序不翻转**，rank 变了半径也一动不动；
 *             而**新节点占了面积**，就会把后面所有人的 c 推大。
 *             ——位移的主因是"盘里东西多了"，不是"rank 变了"。
 *
 * 这个脚本把三件事一起量出来：
 *   ① rank 变了多少（以及老节点之间的次序有没有被打乱）
 *   ② 排序翻转了多少对（这才是半径变化的**真正**判据）
 *   ③ 按真实映射算出的半径位移（用户能看到的量）
 */
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const V1 = process.env.V1 || 'D:/deepseek/formula-nebula-v1'
const V2 = process.env.V2 || path.resolve(import.meta.dirname, '..')

/* ── 从 config.js 读布局真值，不硬编码 ──
 * 硬编码的话，一旦调了 radiusOuter/diskScale，这里就**静默测错东西**。 */
const cfg = fs.readFileSync(path.join(V2, 'src/config.js'), 'utf8')
const num = (key, dflt) => {
  const m = cfg.match(new RegExp(key + '\\s*:\\s*([0-9.]+)'))
  return m ? Number(m[1]) : dflt
}
const R_OUT = num('radiusOuter', 175)
const rInner = num('radiusInner', 26)
const hFrac = num('diskScale', 1.40)

const h = R_OUT * hFrac
const A = (r) => 1 - (1 + r / h) * Math.exp(-r / h)
const a0 = A(rInner), a1 = A(R_OUT)
const inv = (t) => {
  let lo = rInner, hi = R_OUT * 4
  for (let i = 0; i < 60; i++) { const m = (lo + hi) / 2; if (A(m) < t) lo = m; else hi = m }
  return (lo + hi) / 2
}

const DATA_FILES = ['knowledge.js', 'extra-a.js', 'extra-b.js', 'extra-c.js',
  'extra-d.js', 'extra-e.js', 'extra-f.js', 'extra-g.js', 'extra-h.js']

async function load(dir) {
  const d = path.join(dir, 'src/data')
  const byId = new Map()
  for (const f of DATA_FILES) {
    let mod
    try { mod = await import(pathToFileURL(path.join(d, f)).href) } catch { continue }
    for (const v of Object.values(mod)) {
      if (!Array.isArray(v)) continue
      for (const n of v) {
        if (n && typeof n === 'object' && n.id && typeof n.importance === 'number' && !byId.has(n.id)) {
          byId.set(n.id, n)
        }
      }
    }
  }
  return byId
}

/* 复刻 graph.js 的「按族 min-max 归一化」 */
function computeRanks(map) {
  const fam = new Map()
  for (const n of map.values()) {
    const f = n.family || '?'
    if (!fam.has(f)) fam.set(f, [])
    fam.get(f).push(n)
  }
  const out = new Map()
  for (const [, g] of fam) {
    let lo = Infinity, hi = -Infinity
    for (const n of g) { lo = Math.min(lo, n.importance); hi = Math.max(hi, n.importance) }
    const span = hi - lo || 1
    for (const n of g) out.set(n.id, (n.importance - lo) / span)
  }
  return out
}

/* 复刻 exponentialDiskRadii：半径只由累计面积份额决定 */
function computeRadii(map, rankMap) {
  const nodes = [...map.values()].filter((n) => rankMap.has(n.id))
  for (const n of nodes) {
    n.__r = rankMap.get(n.id)
    n.__a = Math.max(1e-6, (n.width || 30) * (n.height || 12))
  }
  const order = [...nodes].sort((a, b) => b.__r - a.__r)
  const tot = order.reduce((s, n) => s + n.__a, 0)
  let cum = 0
  const out = new Map()
  for (const n of order) {
    cum += n.__a
    const c = (cum - n.__a * 0.5) / tot
    out.set(n.id, inv(a0 + c * (a1 - a0)))
  }
  return out
}

function spearman(a, b) {
  const n = a.length
  const rank = (arr) => {
    const idx = arr.map((v, i) => [v, i]).sort((x, y) => x[0] - y[0])
    const r = new Array(n)
    idx.forEach(([, i], k) => { r[i] = k })
    return r
  }
  const ra = rank(a), rb = rank(b)
  let s = 0
  for (let i = 0; i < n; i++) s += (ra[i] - rb[i]) ** 2
  return 1 - (6 * s) / (n * (n * n - 1))
}

/* This script compares the CURRENT data against an older checkout (v1) to see
 * whether adding formulas pushed the existing ones outward. The v1 baseline is
 * a local directory that is NOT part of this repository, so the script can only
 * run on a machine that still has it.
 *
 * Previously it just failed with "读不到数据" — which made it look like a real
 * data problem when the actual cause was "this machine has no v1 checkout".
 * Now it says so explicitly and exits 0 (skip), so it can sit in a CI-ish
 * pipeline without pretending the project is broken. */
if (!fs.existsSync(V1)) {
  console.log(`SKIP: v1 baseline not found at ${V1}`)
  console.log('      This check compares current data against an older checkout to')
  console.log('      confirm existing formulas were not displaced. Point V1 at one to run it:')
  console.log('        V1=/path/to/formula-nebula-v1 node scripts/check-radius-shift.mjs')
  process.exit(0)
}

const v1 = await load(V1)
const v2 = await load(V2)
if (v1.size === 0 || v2.size === 0) {
  // v1 exists but has no readable data — that IS worth failing on.
  console.error(`读不到数据。v1=${V1} v2=${V2}`)
  console.error('用 V1=... 指定 v1 版本目录。')
  process.exit(1)
}
const r1 = computeRanks(v1), r2 = computeRanks(v2)

console.log(`v1: ${v1.size} 个节点   v2: ${v2.size} 个节点   （v2 新增 ${v2.size - v1.size}）`)
console.log(`布局参数（读自 v2/config.js）: radiusOuter=${R_OUT} radiusInner=${rInner} diskScale=${hFrac}`)

const shared = [...r1.keys()].filter((id) => v2.has(id))

/* ── ① rank 变化 ── */
let maxRankD = 0, sumRankD = 0, rankMoved = 0
for (const id of shared) {
  const d = Math.abs(r2.get(id) - r1.get(id))
  sumRankD += d
  if (d > maxRankD) maxRankD = d
  if (d > 1e-9) rankMoved++
}
console.log(`\n=== ① rank 变化（${shared.length} 个共有节点）===`)
console.log(`  变了的节点      : ${rankMoved} / ${shared.length}  (${(rankMoved / shared.length * 100).toFixed(1)}%)`)
console.log(`  平均 / 最大变化 : ${(sumRankD / shared.length).toFixed(4)} / ${maxRankD.toFixed(4)}`)
console.log(`  老节点次序相关  : Spearman = ${spearman(shared.map((i) => r1.get(i)), shared.map((i) => r2.get(i))).toFixed(4)}`)

/* ── ② 次序翻转（半径变化的真正判据）── */
const posInV2 = new Map([...shared].sort((a, b) => r2.get(b) - r2.get(a)).map((id, i) => [id, i]))
const seq = [...shared].sort((a, b) => r1.get(b) - r1.get(a)).map((id) => posInV2.get(id))
let flips = 0
for (let i = 0; i < seq.length; i++) for (let j = i + 1; j < seq.length; j++) if (seq[i] > seq[j]) flips++
const totalPairs = seq.length * (seq.length - 1) / 2
console.log(`\n=== ② 次序翻转（半径变化的真正判据）===`)
console.log(`  翻转的两两组合 : ${flips} / ${totalPairs}  (${(flips / totalPairs * 100).toFixed(3)}%)`)

/* ── ③ 半径位移 ── */
const d1 = computeRadii(v1, r1)
const d2 = computeRadii(v2, r2)
let maxDr = 0, sumDr = 0, moved = 0, outward = 0, inward = 0, sumOut = 0
for (const id of shared) {
  if (!d1.has(id) || !d2.has(id)) continue
  const delta = d2.get(id) - d1.get(id)
  const d = Math.abs(delta)
  sumDr += d
  if (d > maxDr) maxDr = d
  if (d > 1e-6) { moved++; if (delta > 0) { outward++; sumOut += delta } else inward++ }
}
const meanDr = sumDr / shared.length
console.log(`\n=== ③ 半径位移（${shared.length} 个共有节点）===`)
console.log(`  半径变了的节点 : ${moved} / ${shared.length}  (${(moved / shared.length * 100).toFixed(1)}%)`)
console.log(`  方向           : 向外 ${outward} / 向内 ${inward}`)
console.log(`  平均位移       : ${meanDr.toFixed(2)} 世界单位  = R_OUT 的 ${(meanDr / R_OUT * 100).toFixed(2)}%`)
console.log(`  最大位移       : ${maxDr.toFixed(2)} 世界单位  = R_OUT 的 ${(maxDr / R_OUT * 100).toFixed(2)}%`)

/* ── 判定 ──
 * 阈值不是拍的：位移在 R_OUT 的 5% 以内、且次序翻转 < 2% 时，
 * 画面上表现为"整片盘稍微舒展开"，层次关系不变。 */
console.log(`\n=== 判定 ===`)
const okDr = meanDr / R_OUT < 0.05
const okFlip = flips / totalPairs < 0.02
console.log(`  ${okDr ? '✓' : '✗'} 平均半径位移在 R_OUT 的 5% 以内  (${(meanDr / R_OUT * 100).toFixed(2)}%)`)
console.log(`  ${okFlip ? '✓' : '✗'} 次序翻转在 2% 以内             (${(flips / totalPairs * 100).toFixed(3)}%)`)
console.log(`  ${outward > inward ? '✓' : '✗'} 位移方向以「向外让位」为主     (向外 ${outward} / 向内 ${inward})`)

if (!okDr || !okFlip) {
  console.error('\n✗ 加内容显著改变了已有布局 —— 需要检查是不是新增数据的量级失衡')
  process.exit(1)
}
console.log('\n✓ 加内容使盘整体向外舒展，但层次关系保持')
