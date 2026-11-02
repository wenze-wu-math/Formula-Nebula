/**
 * 诊断脚本（只读）：找出证明数据里**无法解析**的 uses / dependencies /
 * consequences / corollaries.uses 引用。
 *
 * 为什么需要：proofView.depButton 在 resolve(id) 失败时会退化成一个
 * <span class="pv-plain">，页面上看起来像一段灰字，而不是可点击的依赖链接。
 * verify-proof-view.mjs 正是靠 .pv-plain 计数发现这件事的。
 *
 * 判据必须和 proofView.resolve 一致：既能命中**图谱节点 id**，也能命中
 * **同一条证明内的步骤 id**；但 corollaries.uses 只允许步骤 id 或节点 id，
 * 且不能引用自己之后的步骤。
 *
 * 用法：node scripts/_find-unresolved-uses.mjs
 */
const nodeModules = [
  '../src/data/knowledge.js', '../src/data/extra-a.js', '../src/data/extra-b.js',
  '../src/data/extra-c.js', '../src/data/extra-d.js', '../src/data/extra-e.js',
  '../src/data/extra-f.js', '../src/data/extra-g.js', '../src/data/extra-h.js',
  '../src/data/conjectures.js',
]
const nodeIds = new Set()
for (const modulePath of nodeModules) {
  const mod = await import(modulePath)
  for (const value of Object.values(mod)) {
    if (!Array.isArray(value)) continue
    for (const node of value) if (node?.id) nodeIds.add(node.id)
  }
}

const { PROOFS } = await import('../src/data/proofs/index.js')

let bad = 0
for (const [id, proof] of Object.entries(PROOFS)) {
  const stepIds = new Set((proof.steps ?? []).map((s) => s?.id).filter(Boolean))
  const check = (kind, ref, where) => {
    if (typeof ref !== 'string' || !ref) return
    if (nodeIds.has(ref) || stepIds.has(ref)) return
    bad++
    console.log(`${id.padEnd(24)} ${kind.padEnd(16)} ${where.padEnd(22)} → 无法解析: ${JSON.stringify(ref)}`)
  }
  for (const [index, step] of (proof.steps ?? []).entries()) {
    for (const use of step?.uses ?? []) check('step.uses', use, step?.id ?? `steps[${index}]`)
  }
  for (const dep of proof.dependencies ?? []) check('dependencies', dep, '-')
  for (const con of proof.consequences ?? []) check('consequences', con, '-')
  for (const cor of proof.corollaries ?? []) {
    for (const use of cor?.uses ?? []) check('corollary.uses', use, cor?.title ?? '-')
  }
}
console.log(bad
  ? `\n共 ${bad} 处引用无法解析，会在证明页退化成 .pv-plain 灰字`
  : '\n所有 uses / dependencies / consequences / corollary.uses 均可解析')
