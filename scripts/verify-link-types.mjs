/**
 * ═══════════════════════════════════════════════════════════════
 *  验证 linkTypes.js —— 关系类型分类器
 * ═══════════════════════════════════════════════════════════════
 *
 *  这个脚本最重要的作用不是"证明分类器能跑"，
 *  而是**如实报告它的准确率有多低**。
 *
 *  一个分类器最危险的失败模式是"看起来在工作"：
 *  每条边都拿到了一个类型，图例上 7 种颜色都出现了，很像回事 ——
 *  但如果 79% 的类型是瞎猜的，那这张图就在骗人。
 *  所以下面第 8 节专门盯着"没匹配上的比例"，
 *  并且在覆盖率异常升高时**报警**（那通常意味着规则被放宽到失真了）。
 *
 *  跑法：node scripts/verify-link-types.mjs
 */

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

import {
  LINK_TYPES, RELATED,
  inferLinkType, resolveLinkType, typeColor, typeLabel,
  matchesOf, heroThreshold, isHero, heroBudget, typeStats, allTypeDefs, hexToLinear,
} from '../src/linkTypes.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

let pass = 0
let fail = 0
function ok(m) { pass++; console.log(`  ✓ ${m}`) }
function bad(m, extra) {
  fail++
  console.log(`  ✗ ${m}`)
  if (extra !== undefined) console.log(`      ${extra}`)
}
function assert(c, m, extra) { c ? ok(m) : bad(m, extra) }
function eq(a, b, m) {
  JSON.stringify(a) === JSON.stringify(b)
    ? ok(m)
    : bad(m, `期望 ${JSON.stringify(b)} / 实际 ${JSON.stringify(a)}`)
}
function section(t) { console.log(`\n── ${t} ──`) }

/* ═══════════════ 读真实数据 ═══════════════ */
const FILES = [
  'knowledge', 'extra-a', 'extra-b', 'extra-c', 'extra-d',
  'extra-e', 'extra-f', 'extra-g', 'extra-h', 'conjectures',
]

const links = []
for (const f of FILES) {
  let src
  try {
    src = readFileSync(join(ROOT, 'src', 'data', `${f}.js`), 'utf8')
  } catch {
    continue
  }
  /* 元组现在是 5 元：[源, 目标, 权重, 理由, 关系类型]。
   *
   * ⚠ 第 5 项必须匹配进来（`(?:,\s*'([a-zA-Z]+)')?`）。
   *   之前这里只有 4 项，加上第 5 项之后正则依然能匹配每一条 ——
   *   只是**悄悄丢掉**类型字段，于是所有断言都在拿"没有类型的数据"
   *   检验"类型判定"，结果全线报错而原因完全看不出来。
   *   这类"正则少一个可选组"的 bug 不会让脚本崩，只会让它说谎。 */
  const re = /\[\s*'([^']+)'\s*,\s*'([^']+)'\s*,\s*([0-9.]+)\s*,\s*'([^']*)'\s*(?:,\s*'([a-zA-Z]+)')?\s*\]/g
  let m
  while ((m = re.exec(src))) {
    links.push({ source: m[1], target: m[2], weight: Number(m[3]), label: m[4], type: m[5], file: f })
  }
}

console.log(`读取 ${FILES.length} 个数据文件，共 ${links.length} 条关联`)
const typed = links.filter((l) => l.type).length
console.log(`其中 ${typed} 条带显式关系类型（${((typed / links.length) * 100).toFixed(1)}%）`)

/* ═══════════════ 1. 数据规模 ═══════════════ */
section('1. 数据规模')
assert(links.length > 1600, `找到 ${links.length} 条关联（> 1600）`)
const emptyLabels = links.filter((l) => !l.label.trim()).length
assert(emptyLabels === 0, `没有空理由（${emptyLabels} 条为空）`)

/* ═══════════════ 2. 永不为 undefined ═══════════════ */
section('2. 每条关联都能拿到类型 id（核心契约）')
const resolved = links.map((l) => resolveLinkType(l))
const undef = resolved.filter((t) => typeof t !== 'string' || !t)
assert(undef.length === 0, `${links.length} 条关联全部解析出非空字符串类型`, `undefined 数量: ${undef.length}`)

const validIds = new Set([...LINK_TYPES.map((t) => t.id), RELATED.id])
const invalid = resolved.filter((t) => !validIds.has(t))
assert(invalid.length === 0, '解析结果全部落在合法 id 集合内', `非法: ${[...new Set(invalid)]}`)

/* ═══════════════ 3. 显式 type 的两种行为 ═══════════════ */
section('3. 显式 type 优先，但非法值退回推断')

// 3a. 合法 type 必须被尊重，不能再去重新推断
const withGood = { source: 'a', target: 'b', label: '同属层论一族', type: 'implies' }
eq(resolveLinkType(withGood), 'implies',
  '显式 type=implies 被尊重（即使理由文本指向同族）')
const withGood2 = { source: 'a', target: 'b', label: '标准猜想蕴含 Hodge', type: 'analogy' }
eq(resolveLinkType(withGood2), 'analogy', '显式 type=analogy 覆盖理由里的"蕴含"')

// 3b. 非法 type 必须退回推断，而不是默认值
const withBad = { source: 'a', target: 'b', label: '标准猜想蕴含 Hodge', type: 'garbage' }
eq(resolveLinkType(withBad), 'implies',
  'type=garbage → 退回推断，得到理由里真实的"蕴含"')
assert(resolveLinkType(withBad) !== RELATED.id,
  'type=garbage 不会把一条强关系降级成 related')

// 3c. 拼写错误的 type 也不该被当成合法
const typo = { label: '两个猜想等价', type: 'implise' }
eq(resolveLinkType(typo), 'equivalent', 'type 拼错 → 仍能推断出等价')

// 3d. 各种垃圾输入
for (const [desc, input] of [
  ['null', null],
  ['undefined', undefined],
  ['数字', 42],
  ['空对象', {}],
  ['空 label', { label: '' }],
  ['label 是数字', { label: 123 }],
  ['type 是 null', { label: '蕴含', type: null }],
]) {
  let t
  try { t = resolveLinkType(input) } catch (e) { bad(`${desc} 抛异常`, e.message); continue }
  assert(typeof t === 'string' && validIds.has(t), `${desc} → ${t}（合法且不抛异常）`)
}

/* ═══════════════ 4. 类型表结构 ═══════════════
 *
 * ⚠ 类型数**不写死**。
 *   这一轮把词汇表从 6 个扩到 11 个（加了 defines/computes/property/
 *   contrast/provenance），三处写着 `6` 的断言就一起红了 ——
 *   而它们红的原因是"数字变了"，不是"东西坏了"。
 *   断言该守的是**不变量**（互不重复、related 不在表里、id 合法），
 *   不是某个具体条数。所以下限用 ≥6，上限用 <20（防止误加一堆）。 */
section('4. 类型表')
assert(LINK_TYPES.length >= 6 && LINK_TYPES.length < 20,
  `LINK_TYPES 有 ${LINK_TYPES.length} 项（在 6..19 之间）`)
const colors = LINK_TYPES.map((t) => t.color)
eq(new Set(colors).size, LINK_TYPES.length, `${LINK_TYPES.length} 个颜色互不相同`)
assert(!validIds.has(RELATED.id) || !LINK_TYPES.some((t) => t.id === RELATED.id),
  'related 不在 LINK_TYPES 里（它是兜底，不是类型）')
assert(RELATED.color !== undefined, `related 有独立颜色 ${RELATED.color}`)
for (const t of LINK_TYPES) {
  assert(/^#[0-9a-f]{6}$/i.test(t.color), `${t.id} 颜色格式合法 (${t.color})`)
  assert(typeof t.zh === 'string' && t.zh.length > 0, `${t.id} 有中文名 (${t.zh})`)
  assert(Array.isArray(t.patterns) && t.patterns.length > 0, `${t.id} 有匹配规则 (${t.patterns.length} 条)`)
}

/* ═══════════════ 5. 颜色 ═══════════════ */
section('5. 颜色转换')
const cImp = typeColor('implies')
const cAna = typeColor('analogy')
assert(['r', 'g', 'b'].every((k) => cImp[k] >= 0 && cImp[k] <= 1),
  `implies 线性颜色在 [0,1] 内 (${cImp.r.toFixed(3)}, ${cImp.g.toFixed(3)}, ${cImp.b.toFixed(3)})`)
assert(Math.abs(cImp.r - cAna.r) > 1e-6 || Math.abs(cImp.b - cAna.b) > 1e-6,
  'implies 与 analogy 颜色不同')
eq(typeColor('nonexistent-type'), typeColor(RELATED.id),
  '未知类型 → 拿到 related 的颜色（不返回 undefined）')
eq(typeLabel('nonexistent-type'), RELATED.zh, '未知类型 → 拿到 related 的名字')
assert(typeColor('implies') === typeColor('implies'), '颜色结果被缓存（同一引用）')

// 转换函数的正确性：纯黑纯白必须有精确端点
const linBlack = hexToLinear('#000000')
const linWhite = hexToLinear('#ffffff')
assert(linBlack.r === 0 && linBlack.g === 0 && linBlack.b === 0, '#000000 → 线性 (0,0,0)')
assert(Math.abs(linWhite.r - 1) < 1e-9 && Math.abs(linWhite.b - 1) < 1e-9, '#ffffff → 线性 (1,1,1)')
// 线性值必然 <= sRGB 值（gamma 展开会压低中间调）
const linMid = hexToLinear('#808080')
assert(linMid.r < 128 / 255 && linMid.r > 0.2,
  `#808080 → 线性 ${linMid.r.toFixed(4)}（介于 0.2 与 sRGB 值之间，说明确实做了 gamma 展开）`)

/* allTypeDefs = 全部强类型 + related 兜底。
 * 同样不写死数字：断言的是"恰好比 LINK_TYPES 多一个（那个兜底）"。 */
eq(allTypeDefs().length, LINK_TYPES.length + 1,
  `allTypeDefs 返回 ${LINK_TYPES.length} 个强类型 + 1 个兜底`)
assert(allTypeDefs().some((d) => d.id === RELATED.id), 'allTypeDefs 里含 related 兜底')
assert(allTypeDefs().at(-1)?.id === RELATED.id, 'related 排在最后（图例里它该在最下面）')

/* ═══════════════ 6. 强调预算 ═══════════════ */
section('6. 强调预算（heroThreshold / heroBudget）')
const cutoff = heroThreshold(links, 0.9)
assert(cutoff >= 0 && cutoff <= 1, `p90 阈值 = ${cutoff}（落在 [0,1]）`)

/* ⚠ 这里**不能**断言"选中 5–15%"。实测权重是量化的：
 *  1620 条只有 46 个不同取值，且 102 条挤在 0.9 这一个值上，
 *  所以 p90 阈值正好等于 0.9，`>=` 会把整个平台收进来 → 16.2%。
 *  名义 10%、实际 16.2%，这个偏差是数据的真实形状，不是 bug。
 *  真正该断言的是"它被如实度量"：
 *  ① 实际比例与 heroBudget 报的一致；② 它落在 0.9 那个平台的两个档位之内
 *  （9.9% 或 16.2%），即确实是在平台边界上，而不是失控。 */
const budget = heroBudget(links, 0.9)
assert(budget.count === links.filter((l) => isHero(l, cutoff)).length,
  `heroBudget 计数与实际筛选一致（${budget.count} 条）`)
console.log(`  ⓘ 名义 p90=10% → 实际选中 ${budget.count}/${budget.total} = ${(100 * budget.ratio).toFixed(1)}%`)
console.log(`    原因：${links.filter((l) => l.weight === cutoff).length} 条边恰好等于阈值 ${cutoff}，被整批放行（权重量化平台）`)

// 量化平台：恰好等于阈值的边应当是一大批，而不是寥寥几条
const platform = links.filter((l) => l.weight === cutoff).length
assert(platform > 20,
  `阈值 ${cutoff} 处存在量化平台（${platform} 条边同值），解释了实际比例偏离名义值`)

// 比例必须落在一个合理区间：既不能失控（>35%），也不能几乎为空
assert(budget.ratio > 0.05 && budget.ratio < 0.35,
  `实际比例 ${(100 * budget.ratio).toFixed(1)}% 落在合理区间 (5%–35%)`)

// 用严格大于可以回到 10% 档位 —— 证明"两档之间没有中间值"这个说法
const strictRatio = links.filter((l) => l.weight > cutoff).length / links.length
console.log(`  ⓘ 若改用严格 >：${(100 * strictRatio).toFixed(1)}%（另一档）`)
assert(strictRatio < budget.ratio, '严格大于确实收得更紧（证明平台边界的存在）')

// 边界：空输入、全同值、非数组
eq(heroThreshold([], 0.9), 1, '空数组 → 阈值 1（不抛异常）')
eq(heroThreshold(null, 0.9), 1, 'null → 阈值 1')
eq(heroThreshold([{ weight: 0.5 }, { weight: 0.5 }], 0.9), 0.5, '全同值 → 该值')
eq(heroThreshold([{ weight: 'x' }, { weight: null }], 0.9), 1, '全非法权重 → 阈值 1')
/* 回归：Number(null)===0 / Number('')===0 / Number(true)===1 都是有限数，
 * 早期版本用 Number.isFinite 过滤会把这三种垃圾当成"权重 0"混进排序，
 * 把阈值整体拽低，于是强调预算悄悄多放行一批弱边。 */
eq(heroThreshold([{ weight: 0.9 }, { weight: null }], 0.5), 0.9,
  'null 权重不参与排序（否则会被当成 0 把阈值拽低）')
eq(heroThreshold([{ weight: 0.9 }, { weight: '' }], 0.5), 0.9, '空串权重不参与排序')
eq(heroThreshold([{ weight: 0.9 }, { weight: true }], 0.5), 0.9, '布尔权重不参与排序')
eq(heroThreshold([{ weight: '0.8' }], 0.5), 0.8, '数字字符串权重仍被接受')
assert(heroThreshold(links, 0) <= heroThreshold(links, 0.5), 'pct 越大阈值单调不减')
assert(heroThreshold(links, 0.5) <= heroThreshold(links, 1), 'pct 单调性（0.5 ≤ 1）')
assert(!isHero(null, cutoff), 'isHero(null) → false')
assert(!isHero({ weight: NaN }, cutoff), 'isHero(NaN) → false')
assert(!isHero({ weight: null }, cutoff), 'isHero(null 权重) → false（不是"权重 0 被拒"，是类型就不算数）')
assert(isHero({ weight: cutoff }, cutoff), '权重恰等于阈值 → 算作 hero（含端点）')
eq(heroBudget(null, 0.9), { count: 0, total: 0, ratio: 0, cutoff: 1 }, 'heroBudget(null) 安全')

/* ═══════════════ 7. 优先级与歧义 ═══════════════ */
section('7. 优先级（顺序即强度）')

// 等价排在蕴含前面：同时出现时取等价
eq(inferLinkType('标准猜想蕴含 Hodge 猜想，二者等价'), 'equivalent',
  '"蕴含 + 等价" → 取更强的等价')
eq(inferLinkType('A 蕴含 B'), 'implies', '仅蕴含 → implies')
eq(inferLinkType('A 是 B 的推广'), 'generalizes', '推广 → generalizes')
eq(inferLinkType('这条依赖那条'), 'depends', '依赖 → depends')
eq(inferLinkType('两者同属层论'), 'sameFamily', '同属 → sameFamily')
eq(inferLinkType('与椭圆曲线的情形类似'), 'analogy', '类似 → analogy')
/* ⚠ 这条期望**改过**，原因是类型表本身变了，不是为了让测试变绿：
 *   「保持」这一轮被加进了 property 的判据（"局部化保持诺特性"
 *   确实是在陈述一条性质），所以它现在判成 property 是**对的**。
 *   测试原来期望 related，那是旧词汇表下的行为。
 *   为了让"纯名词短语仍然回到 related"这件事继续被守住，
 *   这里补三条真正的名词短语做对照。 */
eq(inferLinkType('局部化保持诺特性'), 'property',
  '"保持" → property（这一轮新增的判据）')
eq(inferLinkType('局部化'), RELATED.id, '纯名词短语 → related（不硬凑）')
eq(inferLinkType('整环理论'), RELATED.id, '纯名词短语 → related')
eq(inferLinkType('理想与闭集的反变对应'), RELATED.id,
  '含术语"对应"的名词短语 → related（"对应"不再单独触发 analogy）')
eq(inferLinkType(''), RELATED.id, '空理由 → related')

const amb = matchesOf('标准猜想蕴含 Hodge 猜想，二者等价')
eq(amb, ['equivalent', 'implies'], 'matchesOf 按优先级返回全部命中')
eq(matchesOf(''), [], '空文本 → 无命中')
eq(matchesOf(null), [], 'null → 无命中（不抛异常）')

/* ═══════════════ 8. 类型覆盖 —— 本次验证最重要的部分 ═══════════════
 *
 * ⚠ 口径已经变了，别再按老口径读：
 *   类型**不再**是运行时从理由文本推断出来的，而是逐条读过理由、
 *   人工判定后写进数据的（1620 / 1620）。所以：
 *     - `explicit` 应该 = 总数（以前是 0）
 *     - 老口径的 `coverage`（正则命中率）**不再**等于类型覆盖率，
 *       它现在只反映"理由文本的措辞有多明确"，是个独立的观察指标
 *
 * 仍然要守的底线：每条边都要有类型，且 id 合法。
 * 拼错的 id 会被 resolveLinkType 静默退回正则推断 ——
 * 那条边的颜色就变成"猜的"，但统计上完全看不出来。 */
section('8. 类型覆盖（诚实性检查）')
const st = typeStats(links)

console.log(`  总关联          ${st.total}`)
console.log(`  显式类型        ${st.explicit}　占 ${(100 * st.explicitRate).toFixed(1)}%`)
console.log(`  正则命中(参考)  ${st.matched}　占 ${(100 * st.regexMatchRate).toFixed(1)}%`)
console.log(`  判出具体关系    ${st.total - st.relatedCount}　占 ${(100 * st.typedRate).toFixed(1)}%`)
console.log(`  归为 related    ${st.relatedCount}　占 ${(100 * (1 - st.typedRate)).toFixed(1)}%`)
console.log(`  多类型歧义(参考) ${st.ambiguous}　占 ${(100 * st.regexAmbiguousRate).toFixed(1)}%`)
console.log('  各类型条数:')
for (const t of LINK_TYPES) {
  const n = st.byType[t.id]
  console.log(`    ${t.zh.padEnd(6, '　')} ${String(n).padStart(4)}　${t.id}`)
}
console.log(`    ${RELATED.zh.padEnd(6, '　')} ${String(st.byType[RELATED.id]).padStart(4)}　${RELATED.id}`)

assert(st.total === links.length, 'typeStats 统计的总数与实际一致')
const sum = Object.values(st.byType).reduce((a, b) => a + b, 0)
eq(sum, links.length, `byType 各类型之和 = ${links.length}（无遗漏无重复）`)

/* ── 核心断言：每条边都有人工判定的类型 ──
 * 这是这一轮工作的**目的**。如果哪天有人加了新边却没写类型，
 * 这条会立刻失败 —— 而不是让那条边安安静静地退回 related。 */
eq(st.explicit, links.length,
  `全部 ${links.length} 条边都带显式类型（无一条退回正则推断）`)
const noType = links.filter((l) => !l.type)
for (const l of noType.slice(0, 5)) {
  console.log(`    ✗ 无类型: ${l.source}>${l.target} [${l.file}] ${l.label.slice(0, 30)}`)
}
/* 类型 id 必须全部合法 */
const badIds = links.filter((l) => l.type && !validIds.has(l.type))
for (const l of badIds.slice(0, 5)) console.log(`    ✗ 非法 id "${l.type}": ${l.source}>${l.target}`)
eq(badIds.length, 0, '所有显式类型 id 都合法')

/* 判出具体关系的比例要在合理区间内。
 * 太低 = 大量本来能判的边被偷懒归成 related；
 * 太高 = 把纯名词短语硬塞进具体类型（那是**编造**关系）。 */
assert(st.typedRate > 0.35,
  `判出具体关系 ${(100 * st.typedRate).toFixed(1)}% > 35%（没有大规模偷懒归 related）`)
assert(st.typedRate < 0.85,
  `判出具体关系 ${(100 * st.typedRate).toFixed(1)}% < 85%（没有把无关系的理由硬判成具体类型）`)
assert(st.regexMatchRate < 0.60,
  `正则命中率 ${(100 * st.regexMatchRate).toFixed(1)}% < 60%（说明人工判定**确实**超出了正则的能力，不是把正则结果抄了一遍）`)

/* ═══════════════ 9. 抽样人工复核 ═══════════════
 *
 * 自动断言只能证明"有类型"，不能证明"类型对"。
 * 所以把每类的样例打出来给人看 —— 这是唯一能发现语义错标的方式。 */
section('9. 抽样（每类 3 条，供人工复核）')
for (const t of LINK_TYPES) {
  const ex = links.filter((l) => resolveLinkType(l) === t.id).slice(0, 3)
  console.log(`\n  【${t.zh}】${t.id}`)
  if (!ex.length) {
    console.log('    （无）')
  } else {
    for (const l of ex) console.log(`    [${l.weight}] ${l.label}`)
  }
}

section('10. 归为 related 的样例（确认它们**确实**没陈述关系，而非漏判）')
const relatedEx = links.filter((l) => l.type === RELATED.id)
for (const l of relatedEx.slice(0, 14)) console.log(`    [${l.weight}] ${l.label}`)
/* 反向检查：related 里不应含**强**标记词。
 *
 * ⚠ 标记词必须分两档，混在一起会稳定产生假失败：
 *
 *   强（用于本检查）：蕴含/推出/一一对应/推广/特例/依赖/需要/前提/
 *                    来自/类比/同属/都属 —— 这些词**只能**是在陈述关系。
 *   弱（不能用于本检查）：等价/正是 —— 它们经常是**术语的一部分**
 *                     或"适用场景"的说法：
 *                       「反变等价的核心是坐标环」= 术语"反变等价"
 *                       「范畴等价与刚性」= 纯名词短语
 *                       「Fano 性正是那条猜想的场景」= 讲适用范围，不是 A=B
 *                     把弱词也算进来会报出三条**其实标对了**的边，
 *                     而假失败比不检查更糟 —— 它会训练人忽略这个检查。
 *
 * 弱词仍然要看，但只在人复核时看（上面 14 条样例就是给人看的）。
 * 真实被这两个弱词抓到的问题边（g-enumerative-invariant、
 * g-schubert-variety）已在 _fix-types.mjs 里改正。 */
const STRONG = ['蕴含', '推出', '一一对应', '推广', '特例', '依赖', '需要', '前提', '来自', '类比', '同属', '都属']
const leaked = relatedEx.filter((l) => STRONG.some((w) => l.label.includes(w)))
assert(leaked.length === 0,
  `归为 related 的 ${relatedEx.length} 条里没有一条含强标记词（无漏判）`,
  leaked.slice(0, 5).map((l) => l.label).join(' | '))

/* 弱词单独统计，只报告不断言 —— 供人判断，避免假失败。 */
const WEAK = ['等价', '正是']
const weakHits = relatedEx.filter((l) => WEAK.some((w) => l.label.includes(w)))
console.log(`  （参考，不断言）related 里含弱词「等价/正是」的 ${weakHits.length} 条：`)
for (const l of weakHits) console.log(`      ${l.source} → ${l.target}　「${l.label}」`)

/* ═══════════════ 11. 与真实图规模对照 ═══════════════ */
section('11. 数据一致性')
const perFile = {}
for (const l of links) perFile[l.file] = (perFile[l.file] || 0) + 1
for (const [f, n] of Object.entries(perFile).sort((a, b) => b[1] - a[1])) {
  console.log(`    ${f.padEnd(12)} ${String(n).padStart(4)}`)
}
eq(Object.values(perFile).reduce((a, b) => a + b, 0), links.length, '按文件统计与总数一致')

/* ═══════════════ 汇总 ═══════════════ */
console.log(`\n${'─'.repeat(52)}`)
console.log(`结果：${pass} / ${pass + fail} 通过`)
if (fail) console.log(`失败 ${fail} 项`)
process.exit(fail ? 1 : 0)
