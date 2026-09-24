/**
 * ═══════════════════════════════════════════════════════════════
 *  查询语言 + 图算法 ·「向星云提一个问题」
 * ═══════════════════════════════════════════════════════════════
 *
 *  原先的搜索只有一行（src/ui.js 的 runSearch）：
 *
 *      n.name.toLowerCase().includes(q)
 *
 *  它能用，但只能回答一个问题：「名字里有没有这串字」。而这份知识库有
 *  464 个节点、1620 条关联，节点上还挂着 family / status / field /
 *  importance / degree 这些**结构化**维度。「未解决、且重要度超过 0.9 的
 *  猜想有哪些」「概形族或上同调族里还没被证明的东西」—— 这类问题子串搜索
 *  一个都答不了，而它们恰恰是读这张图时最想问的。
 *
 *  所以这个文件做两件事：
 *    ① parseQuery()  —— 一门真正的小查询语言（词法分析 + 递归下降）
 *    ② findPath() / neighbourhood() / queryStats()
 *                    —— 在关联图上走：两个公式之间是怎么连起来的、
 *                       谁离某个节点足够近（聚焦+淡出要靠它）
 *
 *  ── 为什么老老实实写词法器，而不是一个正则糊过去 ──
 *
 *  因为用正则「假装」解析，代价不是写得丑，而是**错得无声**：
 *    · `(family:scheme OR family:topo) -status:proved` 需要真正的括号嵌套，
 *      正则没有栈，遇到嵌套就只能取最外层，或者靠贪婪匹配碰运气；
 *    · `-name:"Hodge 猜想"` 里的引号要吃掉空格，而 `-` 要吃到引号外面 ——
 *      两者的优先级正是词法层该管的事，混在正则里必然互相咬；
 *    · 报错。用户少打一个右括号时，正则版本只能"没匹配上"，用户看到
 *      0 个结果，会以为是自己记错了名字，而不是自己少打了个括号。
 *      真正的解析器知道自己在第几个字符、期待什么，能直接说清楚。
 *  三十行的词法器换这三件事，很划算。
 *
 *  ── 语法（完整，就是这么多）──
 *
 *      query   := orExpr EOF
 *      orExpr  := andExpr ( 'OR' andExpr )*      ← 只有大写 OR 是运算符
 *      andExpr := term+                          ← 空格分隔即「且」（AND）
 *      term    := '-'? primary                   ← 前缀 '-' 即「非」（NOT）
 *      primary := '(' orExpr ')' | atom
 *      atom    := WORD
 *
 *      WORD 的形态：
 *        *                    通配，恒真（用来数「一共多少个」）
 *        裸词                  对 name / en / id / latex 做不区分大小写的子串匹配
 *        字符串字段:值          family:scheme   field:ag      status:open
 *                              id:cn-          name:定理     en:hodge
 *                              latex:det       proposer:格罗滕迪克
 *        数值字段:比较          importance:>0.9   importance:<=0.2
 *                              degree:>10        rank:>0.5      year:>1950
 *        布尔字段:值            cluster:true / cluster:false
 *        语法糖                is:conjecture = cluster:true
 *                              is:theorem    = cluster:false
 *
 *      含空格的值用引号：name:"Hodge 猜想"；引号内 \" 转义。
 *      多个 '-' 连写是双重否定（`--x` = x），沿用一般查询语言的惯例。
 *
 *  ── 大小写的两处不一致，都是有意的 ──
 *    · 字段名不区分大小写（`Family:` 与 `family:` 等价）——
 *      没道理要求用户记住 key 是小写。
 *    · `OR` **必须大写**：小写 `or` 太常出现在英文名里了
 *      （Morphism、Category、Tensor…），把它当运算符会让
 *      「搜 or 这三个字母」变成不可能。所以小写 or 老老实实是裸词。
 *      代价是字面量「OR」搜不了 —— 认了，这个损失比上面那个小得多。
 *    · 值不区分大小写（比较前统一转小写）。
 *
 *  ── parseQuery 唯一不可协商的性质：绝不抛 ──
 *
 *  它接的是搜索框的输入，**每敲一个键都要跑一遍**。输入框里出现半截
 *  查询是常态，不是异常：`importance:>` 是用户还没打完，不是用户错了。
 *  所以任何语法错误都收敛成 { test: 匹配不到任何东西, error: 中文说明 }，
 *  由调用方决定要不要把 error 显示成红字提示。抛异常的版本会让
 *  一个手滑的字符把整个 render loop 打断 —— 那是不可接受的失败模式。
 *
 *  ── 已知边界（诚实说明）──
 *    · 没有 AND 关键字，空格即「且」；写 `a AND b` 会把 AND 当裸词搜。
 *    · 不支持通配符 `*`（除了单独的 `*` 本身），只能子串匹配。
 *    · 不支持正则、不支持数值区间语法 `importance:[0.5,0.9]`
 *      （要写就写两条：importance:>=0.5 importance:<=0.9）。
 *    · 裸词只搜 name / en / id / latex 四个字段。summary / detail 里
 *      的中文正文**故意不搜** —— 那两个字段是长篇散文，一旦纳入，
 *      「猜想」这种词会命中三百多个节点，搜索结果反而不如没有。
 *
 *  纯函数：不碰 three.js、不碰 DOM、不碰 fs，可以直接在 Node 里跑。
 */

const EPS = 1e-9

/* 字段白名单。分成四类是因为它们**比较方式不同**：
 * 字符串是子串匹配（用户永远只想得到「含」），数值是大小比较，
 * 布尔只能 true/false，is 是纯语法糖。混成一锅的话，
 * `importance:定理` 这种输入就只能报一句含糊的错。 */
const STRING_KEYS = ['family', 'field', 'status', 'id', 'name', 'en', 'latex', 'proposer']
const NUM_KEYS = ['importance', 'degree', 'rank', 'year']
const BOOL_KEYS = ['cluster']

/** 给 UI 用的中文标签，报错信息与 describe() 共用一份，免得两处写岔 */
const KEY_LABEL = {
  family: '所属族',
  field: '领域',
  status: '状态',
  id: 'id',
  name: '名称',
  en: '英文名',
  latex: '公式',
  proposer: '提出者',
  importance: '重要度',
  degree: '关联数',
  rank: '族内排名',
  year: '年份',
  cluster: '是否属于猜想星团',
}

/** 给 UI 用：字段清单与示例查询（搜索框的 placeholder / 帮助面板可直接读它） */
export const QUERY_KEYS = {
  string: STRING_KEYS,
  number: NUM_KEYS,
  bool: BOOL_KEYS,
  sugar: ['is:conjecture', 'is:theorem'],
  examples: [
    'status:open importance:>0.8',
    '(family:scheme OR family:topo) -status:proved',
    'name:"Hodge 猜想"',
    'is:conjecture -field:ag',
    'degree:>20 猜想',
  ],
}

/* ───────────── ① 词法分析 ─────────────
 *
 * 产出三种记号：'('、')'、word。
 * word 内部的引号**在这里就被吃掉**（连同转义），但冒号原样保留 ——
 * 因为 ':' 的切分（字段名 / 值）属于语法层，词法层不该替它做决定。
 *
 * 一个 word 里可以夹引号：`name:"Hodge 猜想"` 整段是一个 word，
 * 引号段落里的空格不吃掉分词。这正是「带空格的值」唯一的实现方式。 */

class QueryError extends Error {}

function fail(msg) {
  throw new QueryError(msg)
}

function tokenize(src) {
  const toks = []
  let i = 0

  while (i < src.length) {
    const c = src[i]

    if (c === ' ' || c === '\t' || c === '\n' || c === '\r') { i++; continue }
    if (c === '(') { toks.push({ t: '(' }); i++; continue }
    if (c === ')') { toks.push({ t: ')' }); i++; continue }

    // 一个 word：一直吃到空白或括号；中途遇到引号则整段引号内容并入本 word
    let text = ''
    while (i < src.length) {
      const ch = src[i]
      if (ch === ' ' || ch === '\t' || ch === '\n' || ch === '\r' || ch === '(' || ch === ')') break

      if (ch === '"') {
        i++
        let closed = false
        while (i < src.length) {
          if (src[i] === '\\' && i + 1 < src.length) { text += src[i + 1]; i += 2; continue }
          if (src[i] === '"') { closed = true; i++; break }
          text += src[i]
          i++
        }
        // 没闭合的引号必须报错。若在这里宽容处理（当成到行尾），
        // 用户会拿到一个「匹配 0 个」的结果，永远猜不到是少了引号。
        if (!closed) fail('引号没有闭合：缺少一个 "')
        continue
      }

      text += ch
      i++
    }
    toks.push({ t: 'word', text })
  }

  return toks
}

/* ───────────── ② 语法分析（递归下降） ─────────────
 *
 * 文法见文件头。这里同时产出**两样东西**：
 *   · test(node) —— 谓词闭包
 *   · desc       —— 中文描述，供 UI 回显「你问的是这个吗」
 * 两者在同一处生成，是为了避免「改了解析忘了改描述」这类漂移。
 *
 * 解析出来的表达式对象形如 { test, desc }，组合子也只是拼这两个字段。 */

class Parser {
  constructor(toks) {
    this.toks = toks
    this.i = 0
  }

  peek() { return this.toks[this.i] }

  eof() { return this.i >= this.toks.length }

  isWord(text) {
    const t = this.peek()
    return !!t && t.t === 'word' && t.text === text
  }

  parse() {
    const e = this.parseOr()
    if (!this.eof()) {
      const t = this.peek()
      if (t.t === ')') fail('多余的右括号「)」')
      fail(`看不懂的内容：「${t.text}」`)
    }
    return e
  }

  /* orExpr := andExpr ( 'OR' andExpr )* */
  parseOr() {
    const groups = [this.parseAnd()]
    while (this.isWord('OR')) {
      this.i++
      groups.push(this.parseAnd())
    }
    if (groups.length === 1) return groups[0]
    return {
      test: (n) => groups.some((g) => g.test(n)),
      // OR 组一律带括号，这样嵌在 AND 里读起来不会有歧义
      desc: groups.map((g) => `（${g.desc}）`).join(' 或 '),
    }
  }

  /* andExpr := term+ —— 空格分隔即「且」。
   * 遇到 OR 或 ')' 就收手：它们是上层（parseOr / parsePrimary）的记号。 */
  parseAnd() {
    const terms = []
    while (!this.eof()) {
      const t = this.peek()
      if (t.t === ')' || (t.t === 'word' && t.text === 'OR')) break
      terms.push(this.parseTerm())
    }
    if (!terms.length) {
      const t = this.peek()
      if (t && t.t === ')') fail('括号里没有任何条件')
      fail('「OR」两侧都必须有条件（不能以 OR 开头，也不能连着写两个 OR）')
    }
    if (terms.length === 1) return terms[0]
    return {
      test: (n) => terms.every((t) => t.test(n)),
      desc: terms.map((t) => t.desc).join(' 且 '),
    }
  }

  /* term := '-'? primary
   *
   * '-' 在词法层是粘在 word 上的（`-family:x` 是一个 word），
   * 但单独一个 '-'（后面跟括号或空格）也是合法的前缀 —— 所以这里
   * 先剥掉全部前导 '-'，剥完若为空就说明负号后面跟的是 primary。 */
  parseTerm() {
    const t = this.peek()
    if (t && t.t === 'word' && t.text.startsWith('-')) {
      let rest = t.text
      let neg = false
      while (rest.startsWith('-')) { neg = !neg; rest = rest.slice(1) }
      this.i++

      if (!rest) {
        if (this.eof()) fail('负号「-」后面没有条件')
        const p = this.parsePrimary()
        return neg ? { test: (n) => !p.test(n), desc: `非 ${p.desc}` } : p
      }

      const atom = compileAtom(rest)
      return neg ? { test: (n) => !atom.test(n), desc: `非 ${atom.desc}` } : atom
    }
    return this.parsePrimary()
  }

  /* primary := '(' orExpr ')' | atom */
  parsePrimary() {
    const t = this.peek()
    if (!t) fail('查询在条件还没写完的地方结束了')
    if (t.t === '(') {
      this.i++
      const e = this.parseOr()
      const close = this.peek()
      if (!close || close.t !== ')') fail('缺少右括号「)」')
      this.i++
      return e
    }
    if (t.t === ')') fail('多余的右括号「)」')
    this.i++
    return compileAtom(t.text)
  }
}

/* ───────────── ③ 原子的编译 ─────────────
 *
 * 一个小优化值得说明：裸词搜索要在 464 个节点的 4 个字符串字段上做
 * 子串匹配，而**每次按键**都会整个重跑一遍。所以小写副本用 WeakMap
 * 缓存起来（key 是节点对象本身，节点被回收时缓存跟着走）。
 *
 * ⚠ 不往节点对象上写 `n.__lower` 这类字段：graph 的节点会被序列化、
 *   会被别的模块遍历，塞私有字段进去迟早咬到人。WeakMap 不改变
 *   任何可观测状态，这才是「纯」的做法。 */
const LOWER_CACHE = new WeakMap()

function lowerFields(n) {
  let f = LOWER_CACHE.get(n)
  if (f) return f
  f = {
    name: String(n.name || '').toLowerCase(),
    en: String(n.en || '').toLowerCase(),
    id: String(n.id || '').toLowerCase(),
    latex: String(n.latex || '').toLowerCase(),
  }
  LOWER_CACHE.set(n, f)
  return f
}

function compileAtom(text) {
  if (text === '*') return { test: () => true, desc: '全部节点' }

  const colon = text.indexOf(':')

  /* 裸词：对 name / en / id / latex 做子串匹配 */
  if (colon < 0) {
    const q = text.toLowerCase()
    if (!q) fail('空的条件')
    return {
      test: (n) => {
        const f = lowerFields(n)
        return f.name.includes(q) || f.en.includes(q) ||
               f.id.includes(q) || f.latex.includes(q)
      },
      desc: `名称/英文/id/公式含「${text}」`,
    }
  }

  const key = text.slice(0, colon).trim().toLowerCase()
  const value = text.slice(colon + 1).trim()

  if (!key) fail(`「${text}」缺少字段名（例如 name:定理）`)
  if (!value) fail(`字段「${key}」后面没有值`)

  /* ── 布尔：cluster ── */
  if (BOOL_KEYS.includes(key)) {
    const v = value.toLowerCase()
    if (v !== 'true' && v !== 'false') {
      fail(`cluster 只能是 true 或 false（收到「${value}」）`)
    }
    const want = v === 'true'
    return {
      test: (n) => !!n.cluster === want,
      desc: want ? '属于猜想星团' : '属于主星系',
    }
  }

  /* ── 语法糖：is:conjecture / is:theorem ──
   * 「这条定论了吗」是读这张图时会问的第一个问题，值得一个短写法。
   * 语义上它们与 cluster:true/false 完全等价（cluster 就是「在不在星团里」）。 */
  if (key === 'is') {
    const v = value.toLowerCase()
    if (v === 'conjecture') return { test: (n) => !!n.cluster, desc: '属于猜想星团' }
    if (v === 'theorem') return { test: (n) => !n.cluster, desc: '属于主星系（已定论）' }
    fail(`is: 只支持 conjecture / theorem（收到「${value}」）`)
  }

  /* ── 数值比较 ──
   * 裸数值（importance:0.9）按「epsilon 内相等」处理。
   * 浮点相等必须带 epsilon：0.9 在二进制里不精确，若写 ===，
   * 用户看到数据里明明写着 0.9 却匹配不到，只会以为是程序坏了。 */
  if (NUM_KEYS.includes(key)) {
    const m = /^(>=|<=|>|<|=)?\s*(-?\d+(?:\.\d+)?)$/.exec(value)
    if (!m) fail(`${key} 需要数值比较，例如 ${key}:>0.9（收到「${value}」）`)
    const op = m[1] || '='
    const num = Number(m[2])
    return {
      test: (n) => {
        const v = n[key]
        // 节点没有这个字段就当不匹配。不能拿 undefined 去比较：
        // undefined > 0.9 是 false，看似没事，但 undefined <= 0.2 也是 false，
        // 于是 `-degree:>5` 会把「根本没有 degree 的节点」也算进来 —— 假阳性。
        if (typeof v !== 'number' || !isFinite(v)) return false
        switch (op) {
          case '>': return v > num
          case '<': return v < num
          case '>=': return v >= num
          case '<=': return v <= num
          default: return Math.abs(v - num) <= EPS
        }
      },
      desc: `${KEY_LABEL[key] || key} ${op === '=' ? '=' : op} ${num}`,
    }
  }

  /* ── 字符串子串 ── */
  if (STRING_KEYS.includes(key)) {
    const q = value.toLowerCase()
    return {
      test: (n) => {
        const v = n[key]
        return typeof v === 'string' && v.toLowerCase().includes(q)
      },
      desc: `${KEY_LABEL[key] || key}含「${value}」`,
    }
  }

  fail(`不认识的字段「${key}」。可用：` +
    [...STRING_KEYS, ...NUM_KEYS, 'cluster', 'is'].join(' / '))
}

/**
 * 解析一段查询文本。
 *
 * @param {string} text 搜索框里的原始输入
 * @returns {{test:(node:object)=>boolean, describe:()=>string, error?:string}}
 *   · test     谓词。**任何**输入都会返回一个可安全调用的函数
 *   · describe 中文回显，例如「（所属族含「scheme」 或 所属族含「topo」） 且 非 状态含「proved」」
 *   · error    仅当输入有语法错误时存在，内容是给人看的中文说明
 *
 * 绝不抛异常 —— 理由见文件头「parseQuery 唯一不可协商的性质」。
 * 出错时 test 恒为 false（匹配不到东西），而不是恒为 true：
 * 半截查询把整张图点亮，比什么都不选更让人困惑。
 */
export function parseQuery(text) {
  const src = typeof text === 'string' ? text : ''

  // 空输入不是错误：搜索框清空是正常操作，UI 自己会退回到「没有搜索」。
  if (!src.trim()) {
    return { test: () => false, describe: () => '（空查询：不匹配任何节点）' }
  }

  try {
    const expr = new Parser(tokenize(src)).parse()
    return {
      test: (n) => !!n && typeof n === 'object' && expr.test(n),
      describe: () => expr.desc,
    }
  } catch (e) {
    const msg = e instanceof QueryError
      ? e.message
      : `查询解析失败：${(e && e.message) || e}`
    return {
      test: () => false,
      describe: () => `（查询无效：${msg}）`,
      error: msg,
    }
  }
}

/* ═══════════════════════════════════════════════════════════════
 *  ④ 图算法
 * ═══════════════════════════════════════════════════════════════
 *
 *  关联是**无向**的：知识库里的连线（A 与 B 相关）没有方向语义，
 *  所以下面两张邻接表都按双向建。这跟 links.js 的画法一致 ——
 *  线从一个公式拉到另一个公式，没有箭头。
 *
 *  ⚠ 关于缓存：这里**每次调用都重建邻接表**（464 节点 / 1620 边，
 *    实测不到 0.1ms）。不做缓存是刻意的：图数据在开发期会被热更新，
 *    按对象身份缓存邻接表的话，改一条连线之后路径会继续按旧表算，
 *    而且没有任何症状 —— 这种 bug 查起来比省下的 0.1ms 贵得多。
 */

/** 线段端点可能是字符串 id，也可能是节点对象（three.js 的惯例），两种都认 */
function endId(v) {
  if (typeof v === 'string') return v
  if (v && typeof v === 'object' && typeof v.id === 'string') return v.id
  return null
}

/** 关联的代价：权重越高越**便宜**。见 findPath 的注释。 */
function linkCost(link) {
  const w = typeof link.weight === 'number' && isFinite(link.weight) ? link.weight : 0.5
  return 1 - Math.min(1, Math.max(0, w))
}

function adjacencyOf(graph) {
  const byId = graph && graph.byId
  const adj = new Map()
  if (!byId || typeof byId.get !== 'function') return adj

  for (const id of byId.keys()) adj.set(id, [])

  const links = (graph && graph.links) || []
  for (const l of links) {
    if (!l) continue
    const a = endId(l.source)
    const b = endId(l.target)
    // 悬空引用与自环直接跳过 —— buildGraph 已经过滤过一遍，
    // 但 findPath 也可能被喂进别的来源拼的图（验证脚本就是），
    // 与其在下游崩，不如在这里静默跳过。
    if (!a || !b || a === b) continue
    if (!adj.has(a) || !adj.has(b)) continue
    adj.get(a).push({ to: b, link: l })
    adj.get(b).push({ to: a, link: l })
  }

  return adj
}

/* ── 二叉最小堆 ──
 *
 * 为什么必须自己写一个：Dijkstra 的朴素实现是「每轮线性扫描找最小」，
 * 复杂度 O(V²)。464 个节点就是 21 万次比较 —— 一次性跑当然无所谓，
 * 但这个函数会被接进 UI 的热路径（选中两个公式就看它们怎么连，
 * 换焦点就重算），而且以后维数/节点只会涨。二叉堆把它压到
 * O((V+E) log V)，代价是四十行代码。
 *
 * 用两条平行数组（cost / key）而不是 [cost, key] 元组：每次 push
 * 都新建元组的话，一次路径查询要分配上千个小数组，堆压力白白上去。
 * 平行数组让 swap 退化成两次赋值，V8 也更容易把 cost 数组留成
 * 紧凑的 double 数组。 */
class MinHeap {
  constructor() {
    this.costs = []
    this.keys = []
  }

  get size() { return this.costs.length }

  push(cost, key) {
    const c = this.costs
    const k = this.keys
    c.push(cost)
    k.push(key)
    let i = c.length - 1
    while (i > 0) {
      const p = (i - 1) >> 1
      if (c[p] <= c[i]) break
      const tc = c[p]; c[p] = c[i]; c[i] = tc
      const tk = k[p]; k[p] = k[i]; k[i] = tk
      i = p
    }
  }

  pop() {
    const c = this.costs
    const k = this.keys
    const topCost = c[0]
    const topKey = k[0]
    const lastC = c.pop()
    const lastK = k.pop()
    if (c.length) {
      c[0] = lastC
      k[0] = lastK
      let i = 0
      for (;;) {
        const l = i * 2 + 1
        const r = l + 1
        let m = i
        if (l < c.length && c[l] < c[m]) m = l
        if (r < c.length && c[r] < c[m]) m = r
        if (m === i) break
        const tc = c[m]; c[m] = c[i]; c[i] = tc
        const tk = k[m]; k[m] = k[i]; k[i] = tk
        i = m
      }
    }
    return { cost: topCost, key: topKey }
  }
}

/** 由 prev 链回溯出路径与沿途的连线对象。
 *
 *  这里刻意按 **key** 而不是按节点 id 走，因为两种搜索用的 key 不同：
 *  BFS 的 key 就是 id，加权模式的 key 是 `id#跳数`（见 dijkstraPath）。
 *  统一成「key → 父 key」之后回溯只有一份实现，不会出现「BFS 对了、
 *  加权模式路径少一节」这种只在一半情况下发作的 bug。
 *
 *  @param {Map} prev      key → 父 key（起点为 null）
 *  @param {(key:string)=>string|undefined} idOf key → 节点 id
 *  @param {Map} prevLink  key → 连到父节点的连线对象 */
function backtrace(prev, idOf, prevLink, startKey, endKey) {
  const path = []
  const links = []
  let cur = endKey
  let guard = 0
  // prev 里起点的值是 null；万一 prev 缺项会拿到 undefined，两个都要挡。
  // guard 是防死循环的保险 —— 正常情况下 prev 链一定终止（松弛只会把
  // 距离改小，不可能成环），但真成环时这里会转成无限循环卡死 UI，
  // 代价不对等，所以宁可多加一个计数器。
  while (cur !== null && cur !== undefined) {
    path.push(idOf(cur))
    if (cur !== startKey) {
      const l = prevLink.get(cur)
      if (l) links.push(l)
    }
    cur = prev.get(cur)
    if (++guard > 1e6) break
  }
  path.reverse()
  links.reverse()
  return { path, links }
}

/* ── 无权 BFS：最少跳数 ──
 *
 * ⚠ 必须显式队列迭代，不能递归。这条要求不是洁癖：知识库是一条长链
 *   串起来的，从「扎里斯基闭集」走到「投影公式」实测要 6 跳，而
 *   递归版本在每个节点上压一层栈帧 —— 一旦数据长成一条几百节点的
 *   链（这种事在这份数据里发生过），递归就是栈溢出，而栈溢出会
 *   把整个渲染循环一起带走。队列是个数组，深度无关。 */
function bfsPath(adj, fromId, toId, maxHops) {
  const prev = new Map([[fromId, null]])
  const prevLink = new Map()
  const hop = new Map([[fromId, 0]])
  const queue = [fromId]
  let head = 0

  while (head < queue.length) {
    const u = queue[head++]
    if (u === toId) break          // BFS 出队顺序 = 距离非降，第一次出队即最短
    const du = hop.get(u)
    if (du >= maxHops) continue

    for (const e of adj.get(u)) {
      if (prev.has(e.to)) continue // 已访问过（BFS 里首次访问即最短路）
      prev.set(e.to, u)
      prevLink.set(e.to, e.link)
      hop.set(e.to, du + 1)
      queue.push(e.to)
    }
  }

  if (!prev.has(toId)) return null
  // BFS 的 key 就是节点 id，所以 idOf 是恒等函数
  const r = backtrace(prev, (k) => k, prevLink, fromId, toId)
  return { ...r, cost: null }
}

/* ── 加权 Dijkstra：最省代价（= 最强的一条链）──
 *
 * opts.weighted 为真时启用。语义差别是这个模块最要紧的一件事：
 *
 *   BFS      「最少几步」    —— 每跳代价都是 1，两跳弱关联胜过一跳强关联
 *   Dijkstra 「最强的一条链」—— 代价 = 1 − weight，强关联便宜、弱关联贵，
 *                              于是宁可多绕两跳走权重 0.95 的强关联，
 *                              也不走一条权重 0.35 的勉强关联
 *
 * 两种答案都对，只是问题不同：前者回答「它们隔多远」，后者回答
 * 「它们之间的知识是怎么真正串起来的」。后者才是读这张图时想问的。
 *
 * ⚠ maxHops 在加权模式下的处理：代价是 1−weight，**不是跳数**，
 *   所以不能拿代价去剪跳数。做法是把状态扩成 (节点, 已用跳数)，
 *   在同一跳数层里比代价 —— 等价于在一张分层图上跑 Dijkstra，
 *   得到的仍然是「跳数预算内代价最小的路径」，不会因为剪枝而变成
 *   次优解。不设上限时退化成普通 Dijkstra（状态就是节点本身），
 *   免得白白把状态空间乘上 464 倍。 */
function dijkstraPath(adj, fromId, toId, hopLimit) {
  const layered = Number.isFinite(hopLimit)
  const keyOf = (id, h) => (layered ? id + '#' + h : id)

  const startKey = keyOf(fromId, 0)
  const dist = new Map([[startKey, 0]])
  const prev = new Map([[startKey, null]])
  const prevLink = new Map()
  const hopOf = new Map([[startKey, 0]])
  const idOf = new Map([[startKey, fromId]])
  const settled = new Set()

  const heap = new MinHeap()
  heap.push(0, startKey)

  let best = Infinity
  let bestKey = null

  while (heap.size) {
    const top = heap.pop()

    // 堆顶代价已经不低于当前最优解 → 后面不可能更便宜，收工。
    // （分层模式下终点可能有多层，所以不能「第一次弹出终点就 break」，
    //   要靠这条比较来收敛。）
    if (top.cost >= best) break
    if (settled.has(top.key)) continue
    settled.add(top.key)

    const u = idOf.get(top.key)
    const h = hopOf.get(top.key)

    if (u === toId) {
      best = top.cost
      bestKey = top.key
      continue                      // 终点不再往外扩，扩了也没意义
    }
    if (h >= hopLimit) continue

    for (const e of adj.get(u)) {
      const nk = keyOf(e.to, h + 1)
      const nc = top.cost + linkCost(e.link)
      const old = dist.has(nk) ? dist.get(nk) : Infinity
      if (nc >= old - EPS) continue
      dist.set(nk, nc)
      prev.set(nk, top.key)
      prevLink.set(nk, e.link)
      hopOf.set(nk, h + 1)
      idOf.set(nk, e.to)
      heap.push(nc, nk)
    }
  }

  if (bestKey === null) return null
  return { ...backtrace(prev, (k) => idOf.get(k), prevLink, startKey, bestKey), cost: best }
}

/**
 * 在关联图上找一条从 fromId 到 toId 的路。
 *
 * @param {object} graph  { nodes, links, byId }（buildGraph() 的产物，
 *                        或任何同形状的对象）
 * @param {string} fromId
 * @param {string} toId
 * @param {{maxHops?:number, weighted?:boolean}} [opts]
 *   maxHops   最多允许几跳，默认不限。给个小的值可以只找「近邻之间」的
 *             联系（UI 上表现成「只看三跳以内的关系」）
 *   weighted  true → Dijkstra，代价 1−weight（强关联更便宜）
 *             false/省略 → BFS，只看跳数
 * @returns {{found:true, path:string[], links:object[], hops:number, cost:number, weighted:boolean}
 *         | {found:false, reason:string}}
 *   cost 是这条路的 Σ(1−weight)。BFS 模式下也照样返回 —— 跳数少
 *   不代表关联强，两个数并排看才有意义（「3 跳，代价 0.80」比
 *   「3 跳」信息多得多）。
 *
 * 参数不合法（起点/终点不存在、graph 不成形）时**返回 found:false**，
 * 不抛异常：这个函数由 UI 直接调用，节点 id 可能来自过期的高亮状态，
 * 让一个过期 id 打穿事件处理链是不值得的。
 */
export function findPath(graph, fromId, toId, opts = {}) {
  const byId = graph && graph.byId
  if (!byId || typeof byId.get !== 'function' || !Array.isArray(graph.links)) {
    return { found: false, reason: 'graph 结构不完整：需要 { nodes, links, byId }' }
  }

  if (typeof fromId !== 'string' || !byId.has(fromId)) {
    return { found: false, reason: `找不到起点「${fromId}」` }
  }
  if (typeof toId !== 'string' || !byId.has(toId)) {
    return { found: false, reason: `找不到终点「${toId}」` }
  }

  const weighted = opts.weighted === true
  const raw = opts.maxHops
  // 非法/缺省的 maxHops 一律当成「不限」。把它当成 0 会让调用方
  // 传错一个 undefined 就永远只得到「同一点」这一个答案。
  const maxHops = typeof raw === 'number' && raw >= 0 && !Number.isNaN(raw) ? raw : Infinity

  // 同一点：0 跳，路径就是它自己。这条要在邻接表之前挡掉 ——
  // 它跟「图里有没有连边」无关，任何节点对得上自己。
  if (fromId === toId) {
    return { found: true, path: [fromId], links: [], hops: 0, cost: 0, weighted }
  }

  const adj = adjacencyOf(graph)
  const r = weighted
    ? dijkstraPath(adj, fromId, toId, maxHops)
    : bfsPath(adj, fromId, toId, maxHops)

  if (!r) {
    const limit = Number.isFinite(maxHops)
      ? `${maxHops} 跳以内找不到`
      : '整张图里都找不到'
    // 说明里点出两种可能：要么是 maxHops 给得比真实距离小，要么是确实不连通。
    // 只说"找不到"，用户没法判断该放宽跳数还是该换一对节点。
    const hint = Number.isFinite(maxHops) ? '（要么两者离得更远，要么确实不连通）' : '（两者不连通）'
    return {
      found: false,
      reason: `${limit}「${byId.get(fromId).name}」到「${byId.get(toId).name}」的通路${hint}`,
    }
  }

  return {
    found: true,
    path: r.path,
    links: r.links,
    hops: r.path.length - 1,
    cost: r.cost === null
      ? r.links.reduce((s, l) => s + linkCost(l), 0)
      : r.cost,
    weighted,
  }
}

/* ── 邻域：聚焦 + 淡出要用它 ──
 *
 * 返回「距离 ≤ radius 跳的所有节点」以及它们各自的距离。
 * UI 拿这张表就能把画面分成三层：距离 0 高亮、距离 1 正常、
 * 更远的按距离插值压暗 —— 这就是 focus+context。
 * 距离是**图距离**而不是空间距离，这一点很关键：两个公式在盘面上
 * 可能挨得很近却毫无关系，按欧氏距离淡出会把无关的东西留在视野里。 */
function bfsNeighbourhood(adj, id, radius) {
  const dist = new Map([[id, 0]])
  const queue = [id]
  let head = 0

  while (head < queue.length) {
    const u = queue[head++]
    const du = dist.get(u)
    if (du >= radius) continue
    for (const e of adj.get(u)) {
      if (dist.has(e.to)) continue
      dist.set(e.to, du + 1)
      queue.push(e.to)
    }
  }

  return dist
}

/**
 * 某个节点在 radius 跳以内能摸到的所有节点。
 *
 * @returns {Map<string, number>} id → 距离（含起点自己，距离 0）
 *   radius 不是有限数时视为「全图」（可以拿来问「这个节点能不能摸到整张图」）
 *   起点不存在时返回空 Map（而不是抛）
 */
export function neighbourhood(graph, id, radius = 1) {
  const byId = graph && graph.byId
  if (!byId || typeof byId.get !== 'function' || !byId.has(id)) return new Map()
  const r = typeof radius === 'number' && radius >= 0 && !Number.isNaN(radius) ? radius : 1
  return bfsNeighbourhood(adjacencyOf(graph), id, r)
}

/**
 * 上述邻域**内部**的连线（两端都在集合里的那些）。
 *
 * 为什么需要它：只画节点不画线的话，聚焦视图会变成一堆孤立公式，
 * 看不出它们之间是什么关系。而全图的 1620 条线又不能都画 ——
 * 那正是要淡掉的东西。所以取交集。
 *
 * @returns {object[]} 连线对象数组（graph.links 的原对象，顺序同 links）
 */
export function neighbourhoodEdges(graph, id, radius = 1) {
  const inside = neighbourhood(graph, id, radius)
  if (inside.size === 0) return []
  const out = []
  for (const l of (graph && graph.links) || []) {
    if (!l) continue
    const a = endId(l.source)
    const b = endId(l.target)
    if (a && b && inside.has(a) && inside.has(b)) out.push(l)
  }
  return out
}

/**
 * 统计一个谓词命中了多少节点，以及命中的节点分布在哪些族/状态上。
 * 给 UI 显示「464 个里命中 12 个」，顺便让用户看见
 * 「原来我这一问全落在上同调族」这类事实。
 *
 * @param {object} graph
 * @param {(node:object)=>boolean} test parseQuery() 产出的谓词（不传则全中）
 * @returns {{matched:number, total:number, byFamily:object, byStatus:object}}
 *   byStatus 里定理（主星系节点）没有 status 字段，统一记在「（无状态）」下 ——
 *   直接写 undefined 当 key 会变成字符串 'undefined'，看起来像数据坏了。
 */
export function queryStats(graph, test) {
  const nodes = (graph && graph.nodes) || []
  const fn = typeof test === 'function' ? test : () => true

  const byFamily = {}
  const byStatus = {}
  let matched = 0

  for (const n of nodes) {
    if (!n || !fn(n)) continue
    matched++
    const f = n.family || '（未知族）'
    byFamily[f] = (byFamily[f] || 0) + 1
    const s = n.status || '（无状态）'
    byStatus[s] = (byStatus[s] || 0) + 1
  }

  return { matched, total: nodes.length, byFamily, byStatus }
}
