/**
 * 对判定表的**人工修正**清单。
 *
 * ══ 为什么修正要单独存一份，而不是直接改 merged.txt ══
 *
 * merged.txt 是 `_merge-types.mjs` 从 8 个分批判定文件**生成**的产物，
 * 不是手写的源文件。直接改它有两个问题：
 *   ① 下次有人重跑 _merge-types（改了分批文件、或想把某个批重判一遍），
 *      修正会被**静默抹掉**，而且没有任何迹象表明发生过这件事 ——
 *      这正是我踩过的坑：改完两条、重跑一次 merge、修正就没了。
 *   ② 修正的**理由**（为什么把它从 related 改成 provenance）
 *      没地方放。半年后看到「这条边为什么不是 related」时无从查起。
 *
 * 所以修正单独成表，由 _merge-types.mjs 在生成之后**应用**上去。
 * 这样重跑多少次结果都一样，而且每条修正都带着理由。
 *
 * ══ 这些修正是怎么发现的 ══
 *
 * `verify-link-types.mjs` 的第 10 节会挑出"被判成 related、
 * 但理由里含强关系词"的边。第一轮报了 5 条，逐条读过之后：
 *   3 条是**检查太粗**（"反变等价"里的"等价"是术语、"正是…场景"
 *     讲的是适用范围、"范畴等价与刚性"是纯名词短语）→ 保留了 related，
 *     改的是检查脚本（把标记词分成强/弱两档）。
 *   2 条是**真的标错了** → 就是下面这两条。
 */
export const TYPE_FIXES = [
  {
    index: 1421,
    src: 'g-enumerative-invariant',
    dst: 'g-deformation-invariance',
    label: '定义成积分正是为了保证形变不变',
    from: 'related',
    to: 'property',
    why: '句子确实陈述了关系：定义方式**服务于**形变不变性。'
       + '「保证…成立」是 property 的判据，不是"没说出关系"。',
  },
  {
    index: 1455,
    src: 'g-schubert-variety',
    dst: 'cn-kazhdan-lusztig',
    label: 'Schubert 簇的相交上同调正是那条猜想的来源',
    from: 'related',
    to: 'provenance',
    why: '「来源」= 出处，正是 provenance 这一类的含义。'
       + '归成 related 等于丢掉了一条"这条猜想从哪来"的信息。',
  },
]

/**
 * 把修正应用到 `rows`（Map: index → typeid）。
 *
 * ⚠ 应用时要**校验前置条件**，不能闷头覆盖：
 *   如果某条修正声明的 `from` 与实际值不符，说明判定表已经变过
 *   （有人重判了那一批），这时必须报错让人重新判断 ——
 *   而不是照旧覆盖。否则一条已经修正过的边会被"改回"旧值，
 *   或者一条**性质已经变了**的边被套上过时的结论。
 *
 * @param {Map<number,string>} rows
 * @param {(msg:string)=>void} report
 * @returns {string[]} problems
 */
export function applyTypeFixes(rows, report = () => {}) {
  const problems = []
  for (const fix of TYPE_FIXES) {
    const cur = rows.get(fix.index)
    if (cur === undefined) {
      problems.push(`修正 #${fix.index}: 判定表里没有这一条`)
      continue
    }
    if (cur === fix.to) {
      // 已经是对的：可能判定文件本身被修正过。这不算错，报告一下即可。
      report(`  · #${fix.index} 已是 ${fix.to}（无需修正）`)
      continue
    }
    if (cur !== fix.from) {
      problems.push(`修正 #${fix.index}: 当前是 ${cur}，修正表假设是 ${fix.from}`
        + ` —— 判定表变了，请重新判断这条边`)
      continue
    }
    rows.set(fix.index, fix.to)
    report(`  · #${fix.index} ${fix.from} → ${fix.to}　${fix.src} > ${fix.dst}`)
  }
  return problems
}
