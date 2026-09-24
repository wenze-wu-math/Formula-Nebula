/**
 * ═══════════════════════════════════════════════════════════════
 *  关联连线的**关系类型**（语义层）
 * ═══════════════════════════════════════════════════════════════
 *
 *  ── 问题 ──
 *
 *  1620 条连线，每条都带一句人写的中文理由（link.label），
 *  但**没有任何机器可读的类型**。于是渲染器只能一视同仁：
 *  「标准猜想蕴含 Hodge 猜想」和「同属层论一族」在画面上长得一模一样，
 *  都是一根蓝线 —— 而这两件事的认识论地位完全不同：
 *  前者是一条推理链，后者只是一次归类。
 *
 *  权重（weight）**不能**代替类型：实测各类型的权重均值落在 0.66–0.85，
 *  区间几乎完全重叠（总体均值 0.776），所以权重里读不出"这是哪种关系"。
 *  类型是真正新增的一维信息。
 *
 *  ── 诚实的前提：这是个**高精度、低召回**的分类器 ──
 *
 *  我实测过：1620 条理由里只有约 21% 含有可判定的关系标记词
 *  （蕴含/等价/推广/依赖/同属/类比…），剩下的 79% 是**陈述句**：
 *  「局部化保持诺特性」「结构层是最基本的层」「正则 ⇒ 正规」。
 *  这些句子在讲一件事实，没有把"这条边是什么关系"写出来。
 *
 *  面对这个事实有两条路：
 *  ① 硬凑 —— 用宽松规则把 79% 也塞进某个类型。结果是大量错标，
 *     而且错标是**看不出来**的（用户无从判断一根线该是什么颜色）。
 *  ② 如实保留 —— 认不出的就是 `'related'`，它**沿用原来的权重蓝色**，
 *     不参与类型着色。
 *
 *  选 ②。理由：这一层的价值在于"把已经写明的强关系显出来"，
 *  而不是给每条边都发一个可能是错的标签。错标的代价比不标更高 ——
 *  它会让人以为自己在读一个可靠的知识图谱。
 *
 *  所以视觉上的效果是**增量**的：约 21% 的边获得类型色，
 *  其余保持原样。画面上是"原来那片蓝网里浮现出几缕有颜色的线"，
 *  而不是"整张网被重新上了一遍色"。
 *
 *  ── 为什么把"强调预算"也放在这里 ──
 *
 *  类型一旦可读，就会想让它更显眼（更粗、更亮、常显标签）。
 *  但这些手段都是**有预算的**：3240 个端点全加粗，画面立刻糊成一团。
 *  所以这里提供一个统一的阈值（heroThreshold），
 *  让"哪些边值得花预算"只有一个判据，而不是每个视觉通道各定一套。
 *  这是从 lean-graph 的"重要性预算"思路借来的。
 *
 *  ⚠ 本模块**必须保持纯净**：不 import three.js、不碰 DOM、不读 fs。
 *    它在 Node 里被 scripts/verify-link-types.mjs 直接 import 做验证。
 *    颜色以 {r,g,b} 线性三元组返回，调用方自己包成 THREE.Color。
 */

/* ───────────── 6 个关系类型 ─────────────
 *
 * 顺序 = 优先级：**先匹配到的胜出**。
 * 顺序不是随意的，它按"语义强度"排：
 * 等价（最强，双向必然）→ 蕴含（单向必然）→ 推广（集合包含）
 * → 依赖（认识论上的先后）→ 同族（只是归类）→ 类比（最弱，只是像）。
 *
 * 同一条理由同时命中多个时（实测 5.8%），取更强的那一个 ——
 * 「标准猜想蕴含 Hodge 猜想，二者等价」这种句子，
 * 画成"等价"比画成"蕴含"更准确，所以等价排在前面。
 *
 * 颜色选择：全部落在**冷色到品红**的区间，且饱和度压低。
 * 原因是主星系的公式本身是橙黄色系（8 个族色铺满整个色轮），
 * 连线若也用暖色高饱和，就会被误读成"公式"。
 * 现有设计已经用冷蓝（盘内）+ 紫罗兰（跨星团）表达层级，
 * 这里只是在同一层里再分细，所以明度保持一致、只变色相。
 */
export const LINK_TYPES = [
  {
    id: 'equivalent',
    zh: '等价',
    en: 'equivalent',
    color: '#4dd4c4',   // 青绿：双向、平稳 —— 语义上最对称的关系用最"平"的色
    patterns: [
      /等价/, /一一对应/, /同构/, /充要/, /当且仅当/, /⟺/, /⇔/, /互推/,
      /* ⚠ 这两个是**后来补的**：原规则只认"等价/同构"这类**词**，
       *   于是「环维数**即**簇维数」「概形 **=** 拓扑空间 + 结构层」
       *   这种**用符号写出来的**等价全被判成了相关。
       *
       *   但符号规则必须收紧，否则会大量误判 —— 我第一版写的是裸的
       *   `/即/` 和 `/=/`，实测误判很多：
       *     · 「即上同调基变换定理」是在**指认**这条边就是那个定理（复述），
       *       不是"A 等价于 B"；
       *     · 「恒有 depth ≤ dim」里的 ≤ 与等价无关。
       *   所以：
       *     - `即` 只在其**前后都有实质内容**时才算等价（A 即 B）；
       *     - `=` 要求两侧不是不等式的一部分。 */
      /≅/, /≃/, /(?<![≤≥<>≠])=(?!=)/,
      /^[^，,。；;]{2,24}即[^，,。；;]{2,24}$/,
      /* 补："正是/等于/互通"也是等价的白话写法。
       * 「Kodaira 维数**正是** Iitaka 底空间的维数」
       * 「证明 Čech 上同调**等于**层上同调」 */
      /正是/, /等于/, /互通/, /互为/, /同一(原理|概念|工具|对象)/,
    ],
  },
  {
    /* ── 新增类型：定义与刻画 ──
     *
     * 实测 130 条（未判定项里最多的一类）。这类边在说"B 是 A 的定义/判据"，
     * 例如「切空间由极大理想给出」「整闭性用赋值环刻画」「平展拓扑由此定义」。
     *
     * 它**不是**依赖：依赖是"要证 B 得先有 A"（认识论先后），
     * 而定义是"B 就是 A 的内容"（语义同一）。两者混在一起会误导 ——
     * 看到橙色线以为是推理前提，其实是在讲定义。
     *
     * 颜色取**天蓝**：填在青绿(172°)与靛蓝(226°)之间，
     * 与 existing 六色在色相环上等距，不会和谁撞。 */
    id: 'defines',
    zh: '定义与刻画',
    en: 'defines',
    color: '#5fc8e8',
    patterns: [
      /定义/, /刻画/, /判据/, /由.{0,10}给出/, /由.{0,10}决定/, /由.{0,10}描述/,
      /用.{0,10}(定义|刻画|判定|检验)/, /给出.{0,8}定义/,
    ],
  },
  {
    id: 'implies',
    zh: '蕴含',
    en: 'implies',
    color: '#ff6b81',   // 玫红：最"有方向感"的暖色，对应最强的单向推理
    patterns: [
      /蕴含/, /推出/, /推论/, /意味着/, /导致/, /⇒/, /⟹/, /=>/, /所以/,
    ],
  },
  {
    id: 'generalizes',
    zh: '推广与特例',
    en: 'generalizes',
    color: '#8fd35f',   // 绿：向外生长 —— 推广/特例是集合大小的伸缩
    patterns: [
      /推广/, /特例/, /特殊情形/, /特殊化/, /一般化/, /更一般/, /弱化/, /加强/,
      /* 补：数据的实际用词是"原型/典型/版本/情形"，而不是"特例"。
       * 例如「雅可比簇是阿贝尔簇的**典型**」「三维是 MMP 唯一完整解决的**情形**」。
       *
       * ⚠ 必须要求"是…的典型"这种**判断句结构**，不能裸匹配 `典型`/`情形`：
       *   第一版裸匹配，把「相对版本的背景」「Fano 情形与 DT 理论的联系」
       *   这类只是**提到**情形/版本的句子也收了进来。
       *   要求前面有"是/为"、后面有"的"，才是在断言从属关系。 */
      /是[^，,。；;]{0,20}的(典型|原型|特例|推广|版本|情形|例子)/,
      /为[^，,。；;]{0,20}的(典型|原型|特例|推广|版本|情形|例子)/,
    ],
  },
  {
    /* ── 新增类型：计算与构造 ──
     *
     * 实测 76 条。这类边在说"用 A 可以算出/造出 B"，
     * 例如「RR 计算欧拉示性数」「射影空间上同调用 Čech 计算」「内射消解用来定义右导出函子」。
     *
     * 它和 defines 的区别：defines 是"定义成什么"，computes 是"怎么算出来"。
     * 二者在数学实践中确实是两件事（定义不需要算法，计算需要）。
     *
     * 颜色取**黄绿**：填在琥珀(30°)与绿(95°)之间。
     * ⚠ 刻意压暗、降饱和 —— 这个色相区间最接近公式本身的橙黄，
     *   太亮会被误读成"一个公式"。 */
    id: 'computes',
    zh: '计算与构造',
    en: 'computes',
    color: '#b9c95f',
    patterns: [
      /计算/, /算出/, /求.{0,6}(值|数)/, /构造/, /造出/, /实现/,
      /用来(算|构造|造|给)/,
    ],
  },
  {
    /* ── 新增类型：性质与保持 ──
     *
     * 实测最多的一类"被漏掉的陈述句"。这类边在说"A 保持/满足某个性质 B"，
     * 例如「局部化**保持**诺特性」「整扩张**保持**维数」「平坦时基变换**成立**」。
     *
     * 它**不是**依赖，方向恰好相反：不是说"要证局部化得先有诺特性"，
     * 而是在断言"局部化这个操作**不会破坏**诺特性"。数学上这是一条定理。
     *
     * 颜色取**暖灰**（低饱和的米棕）。刻意做成灰调：它表达的是
     * "某个操作与某个性质相容"，是一种中性的结构性事实，
     * 不该像蕴含/等价那样抢眼。
     * ⚠ 上一版这里有 10 个类型全是高饱和色，加上星系的橙黄公式，
     *   画面会变成调色盘。中性关系用中性色，视觉预算留给强关系。 */
    id: 'property',
    zh: '性质与保持',
    en: 'property',
    color: '#b8ab9c',
    patterns: [
      /保持/, /满足/, /成立/, /具有/, /性质/, /恒有/, /保证/,
    ],
  },
  {
    id: 'depends',
    zh: '依赖',
    en: 'depends',
    color: '#f5a65b',   // 琥珀：需要支撑 —— 认识论上的先后依赖
    patterns: [
      /依赖/, /需要/, /前提/, /基于/, /来自/, /用到/, /借助/, /依靠/, /出发点/,
    ],
  },
  {
    id: 'sameFamily',
    zh: '同族',
    en: 'same family',
    color: '#6b8ff5',   // 靛蓝：与既有连线主色同族，因为这类边最多、最"背景"
    patterns: [
      /同属/, /都属/, /都是/, /属于/, /一族/, /同族/, /同类/, /归类/, /家族/,
    ],
  },
  {
    /* ── 新增类型：对比 ──
     *
     * 实测 23 条。虽然少，但语义上与"类比"**正好相反**：
     * 类比是"两者相似"，对比是"两者不同/相反"。
     * 把它混进类比会直接把意思说反 —— 这是最不能容忍的一类错标。
     * 例如「同一作者的两个定理，**内容相反**」「亏格 1 与亏格 ≥ 2 的**对比**」。
     *
     * 颜色取**去饱和的石板灰紫**：视觉上刻意"不鲜艳"，
     * 因为它表达的是一种否定性的关系（不像、不同）。 */
    id: 'contrast',
    zh: '对比',
    en: 'contrast',
    color: '#9a93b8',
    patterns: [
      /对比/, /相反/, /反之/, /不同(于|之处)/, /相对立/,
      /* ⚠⚠ 这里**故意没有** `差异`，这是本轮最容易出错的一条规则。
       *
       * 我第一版把它写成裸的 `/差异/`，12 条里**有 7 条是错的**：
       *   「与主库**差异**除子条目是同一工具」
       *   「lct 是**差异**系数下界的临界值」
       *   「奇点分类全靠**差异**系数的符号与大小」
       *   「用**差异**的上升证明终止」「用**差异**对奇点分级」
       * 这里的"差异"是**数学术语 different（差异除子/差异系数，
       * discrepancy 的中译）**，和"contrast（对比）"毫无关系 ——
       * 其中好几条讲的是"同一工具""全靠它分类"，语义恰好**相反**。
       *
       * 我试过用 `(?!除子|系数)` 排掉技术组合，但"用差异的上升""用差异对奇点分级"
       * 仍是术语，说明**这个排除法本身不可靠**（术语的搭配是开放的）。
       * 所以整条规则删掉：漏判只是少一条彩色线，
       * 而错标是让颜色**说反话** —— 后者在这个模块里不可接受。
       *
       * 代价：contrast 从 12 条降到 6 条。这个类型本来就最少，
       * 宁可少而准。 */
    ],
  },
  {
    /* ── 新增类型：同条与出处 ──
     *
     * 实测 54 条，全部是**跨星团**边（所以权重都很高，0.88–0.96），
     * 例如「主库已有条目，此处是同一猜想的陈述与讨论」「与主库的凝聚层条目是同一概念的不同侧面」。
     *
     * 这类边**不是数学关系**，而是**编纂关系**：它在说"这两条其实是同一件事，
     * 只是分别写在主星系和猜想星团里"。把它留在 related 是最误导的 ——
     * 用户看到一条又粗又亮的线连到星团，会以为"这条猜想依赖那个定理"，
     * 而真相是"这两条是同一个东西的两份记录"。
     *
     * 颜色取**暗灰蓝**（比 related 更暗、更灰）。它是全表最"没有内容"的
     * 一种关系，理应最不显眼 —— 但必须**看得出与 related 不同**，
     * 否则等于没标。 */
    id: 'provenance',
    zh: '同条与出处',
    en: 'provenance',
    color: '#7f8b9e',
    patterns: [
      /主库/, /已有条目/, /同一猜想/, /同一条目/, /此处是/, /条目讲/, /条目与/,
    ],
  },
  {
    id: 'analogy',
    zh: '类比',
    en: 'analogy',
    color: '#d98fe8',   // 兰紫：最弱的关系，用最"飘"的颜色
    patterns: [
      /类比/, /类似/, /相似/, /如同一/, /平行/, /呼应/,
      /* 「对应」单独用太钝：它是**数学术语的构词成分** ——
       * 「反变对应」「一一对应」「伴随对应」「Galois 对应」都是名词短语，
       * 里面并没有"把两者作类比"的意思。
       * 实测「理想与闭集的反变对应」会被裸 /对应/ 判成 analogy，
       * 而那条理由只是给这个对应关系起了个名字。
       * 所以要求它出现在"像…对应/对应关系"这类**判断结构**里。
       * （这条正则现在只是兜底 —— 1620 条数据都写了显式类型；
       *   但兜底也不该说谎。） */
      /如同[^，,。；;]{0,12}对应/, /对应关系/, /如出一辙/, /异曲同工/,
    ],
  },
]

/** 兜底类型：没能判定关系的陈述句都归这里。
 *
 *  ⚠ 它**不在** LINK_TYPES 里，这是有意的：
 *    LINK_TYPES 是"可判定的强关系"清单，related 是"没判定出来"的垃圾桶。
 *    把它混进列表会让 typeStats 的覆盖率统计失去意义，
 *    也会诱使后来的人给它配一个鲜艳的颜色 —— 那等于把 79% 的边
 *    重新上色，正是上面说的"错标比不标更坏"。
 *
 *  颜色刻意取**接近现有连线的暗蓝**：这些边在画面上应该几乎看不出变化。 */
export const RELATED = {
  id: 'related',
  zh: '陈述与相关',
  en: 'related',
  color: '#5a7ba8',
}

const ALL_IDS = new Set([...LINK_TYPES.map((t) => t.id), RELATED.id])
const BY_ID = new Map([...LINK_TYPES, RELATED].map((t) => [t.id, t]))

/* ───────────── sRGB → 线性 ─────────────
 *
 * 项目全程工作在线性色彩空间（见 palette.js 的 hexToLinear）。
 * 这里**自己实现一份**而不是 import palette.js：palette.js 会连带
 * 引入整套 OKLab 机械，而本模块要保持零依赖可测。
 * 二十行的代价换一个能在 Node 里直接跑的模块，划算。
 */
function srgbToLinear(u) {
  return u <= 0.04045 ? u / 12.92 : Math.pow((u + 0.055) / 1.055, 2.4)
}

const _linCache = new Map()

/** '#rrggbb' → {r,g,b} 线性三元组。带缓存：每帧都可能被问到。 */
export function hexToLinear(hex) {
  const hit = _linCache.get(hex)
  if (hit) return hit
  const h = String(hex).replace('#', '')
  const r = parseInt(h.slice(0, 2), 16) / 255
  const g = parseInt(h.slice(2, 4), 16) / 255
  const b = parseInt(h.slice(4, 6), 16) / 255
  const out = {
    r: srgbToLinear(r),
    g: srgbToLinear(g),
    b: srgbToLinear(b),
  }
  _linCache.set(hex, out)
  return out
}

/** 类型 id → 线性颜色三元组。未知 id 一律给 related 的颜色，绝不返回 undefined。 */
export function typeColor(typeId) {
  const t = BY_ID.get(typeId) || RELATED
  return hexToLinear(t.color)
}

/** 类型 id → 显示名（中文）。未知 id 给 related 的名。 */
export function typeLabel(typeId) {
  const t = BY_ID.get(typeId) || RELATED
  return t.zh
}

/** 供 UI 遍历：6 个强类型 + 兜底，全部带 label 与颜色（给图例用） */
export function allTypeDefs() {
  return [...LINK_TYPES, RELATED].map((t) => ({
    id: t.id, zh: t.zh, en: t.en, color: t.color,
  }))
}

/* ───────────── 判定 ───────────── */

/**
 * 一条理由同时命中了哪些类型（按 LINK_TYPES 顺序）。
 *
 * 单独导出是为了能**度量歧义**：同时命中多个说明这个分类器在这条上
 * 不确定，也说明人写理由时把两件事写在了一起。
 * 实测歧义率 5.8% —— 不高，但足以值得盯住。
 */
export function matchesOf(reason) {
  if (typeof reason !== 'string' || !reason) return []
  const hits = []
  for (const t of LINK_TYPES) {
    for (const p of t.patterns) {
      if (p.test(reason)) { hits.push(t.id); break }   // 同一类型内命中一次即可
    }
  }
  return hits
}

/**
 * 从理由文本推断类型。
 *
 * 返回的 id 只会是 LINK_TYPES 里的某个 id 或 `'related'`；
 * **永不返回 undefined**（这是本模块的核心契约，验证脚本第 2 条盯着它）。
 *
 * @param {string} reason 人写的关联理由
 * @returns {string} 类型 id
 */
export function inferLinkType(reason) {
  const hits = matchesOf(reason)
  // 取第一个 = 优先级最高的。顺序即强度，理由见 LINK_TYPES 注释。
  return hits.length ? hits[0] : RELATED.id
}

/**
 * 解析一条连线最终该用什么类型。
 *
 * 规则：**显式 type 优先，但必须合法**。
 * 一个拼错的 type（'implise'）不能被静默当成某个默认值 ——
 * 那会让人以为数据写对了。所以非法值退回**推断**，
 * 推断结果至少是从理由文本里读出来的真东西。
 *
 * @param {{source?:string,target?:string,weight?:number,label?:string,type?:string}} link
 * @returns {string} 类型 id，永不为 undefined
 */
export function resolveLinkType(link) {
  if (!link || typeof link !== 'object') return RELATED.id
  const t = link.type
  if (typeof t === 'string' && ALL_IDS.has(t)) return t
  return inferLinkType(link.label)
}

/* ───────────── 强调预算 ─────────────
 *
 * 目的：给所有"值得花视觉预算"的判定提供**唯一**阈值。
 * 否则粗细、亮度、标签常显各自定一套标准，调起来必然打架 ——
 * 想让线粗一点就要重调三个数，而且它们会互相矛盾。
 *
 * ── ⚠ 实测：权重是**量化**的，"取前 10%"根本做不到 ──
 *
 *  1620 条边的权重只有 46 个不同取值（步长基本是 0.02），
 *  而且在 0.9 处有一个大平台：**102 条边挤在 0.9 这一个值上**。
 *  p90 算出来正好落在 0.9，于是 `>= 0.9` 会把整个平台一起收进来 ——
 *  实际选中 263 条 = 16.2%，而不是名义上的 10%。
 *  要么 9.9%（用 `> 0.9`）要么 16.2%（用 `>= 0.9`），中间没有档位。
 *
 *  这不是 bug，是数据的真实形状。处理方式是**如实接受**：
 *  阈值仍然是分位数（它随数据连续变化，换数据集能自适应），
 *  但调用方应当用 heroBudget() 去问"这次实际放行了几条"，
 *  而不是假设它一定是 10%。UI 上若要显示"重点关联 N 条"，
 *  N 必须来自实际计数。
 *
 *  分位数用**线性插值**而不是直接取下标：1620 × 0.9 = 1458 正好是整数，
 *  但换个数据集就可能落在两个元素之间，直接取下标会得到"要么全要要么全不要"
 *  的跳变。
 */
export function heroThreshold(links, pct = 0.9) {
  if (!Array.isArray(links) || !links.length) return 1
  const ws = links
    .map((l) => (l ? l.weight : undefined))
    /* ⚠ 必须显式挡掉 null / '' / true 这类值，**不能**只靠 Number.isFinite。
     * 因为 Number(null) === 0、Number('') === 0、Number(true) === 1，
     * 三者都是有限数 —— 直接喂进 Number.isFinite 会被当成"权重为 0 的边"
     * 混进排序，把阈值整体拽低。这是个真实的静默错误：
     * 数据里一个缺失的 weight 字段，会让"强调预算"悄悄多放行一批弱边。
     * 只有 number 类型（或能完整解析成数字的字符串）才算数。 */
    .filter((w) => typeof w === 'number' || (typeof w === 'string' && w.trim() !== ''))
    .map((w) => Number(w))
    .filter((w) => Number.isFinite(w))
    .sort((a, b) => a - b)
  if (!ws.length) return 1

  const p = Math.min(1, Math.max(0, Number(pct)))
  const idx = (ws.length - 1) * p
  const lo = Math.floor(idx)
  const hi = Math.ceil(idx)
  if (lo === hi) return ws[lo]
  return ws[lo] + (ws[hi] - ws[lo]) * (idx - lo)
}

/** 这条边是否值得花预算。weight 恰好等于阈值时算"值得"（含端点，用 > 会漏掉整批）。 */
export function isHero(link, cutoff) {
  if (!link) return false
  const w = typeof link.weight === 'number' ? link.weight : NaN
  if (!Number.isFinite(w)) return false
  return w >= cutoff
}

/**
 * 实际放行了多少预算。
 *
 * 存在的理由见上面那段"权重是量化的"：`pct: 0.9` 名义上要 10%，
 * 实际会因为 0.9 处的平台变成 16.2%。**任何要显示"重点关联 N 条"
 * 的地方都必须用这个函数**去数，而不是自己算 total × pct。
 *
 * @returns {{count:number, total:number, ratio:number, cutoff:number}}
 */
export function heroBudget(links, pct = 0.9) {
  const list = Array.isArray(links) ? links : []
  const cutoff = heroThreshold(list, pct)
  let count = 0
  for (const l of list) if (isHero(l, cutoff)) count++
  return {
    count,
    total: list.length,
    ratio: list.length ? count / list.length : 0,
    cutoff,
  }
}

/* ───────────── 统计 ───────────── */

/**
 * 分类质量报告。
 *
 * `coverage` 是**唯一**该被拿来宣传的数：它如实说明"多少比例的边
 * 获得了可读的类型"。当前约 0.21 —— 这个数字不好看，但它是真的。
 * 想提高它只有一条正路：去把理由文本写得更明确（见 README），
 * 而不是把这里的选择标准放宽。
 */
export function typeStats(links) {
  const byType = {}
  for (const t of LINK_TYPES) byType[t.id] = 0
  byType[RELATED.id] = 0

  let total = 0
  let matched = 0
  let ambiguous = 0
  let explicit = 0

  for (const l of Array.isArray(links) ? links : []) {
    if (!l) continue
    total++
    /* matched/ambiguous 量的是**正则**的命中情况，保留它是因为
     * 它还能反映"理由文本写得够不够明确" —— 这是个独立的、
     * 值得看的指标（文本越明确，未来的自动分类越可靠）。
     * 但它**不再**是类型覆盖率：类型现在是数据里写死的事实。 */
    const hits = matchesOf(l.label)
    if (hits.length) matched++
    if (hits.length > 1) ambiguous++
    if (typeof l.type === 'string' && ALL_IDS.has(l.type)) explicit++
    byType[resolveLinkType(l)]++
  }

  return {
    byType,
    total,
    matched,
    ambiguous,
    explicit,
    /** 正则命中率 —— 只反映"理由文本的措辞明确程度"，**不是**类型覆盖率 */
    regexMatchRate: total ? matched / total : 0,
    regexAmbiguousRate: total ? ambiguous / total : 0,
    /** 真正该被宣传的：有多少条边的类型是**写在数据里的**（人工判定过） */
    explicitRate: total ? explicit / total : 0,
    explicit,
    /** 判定为 related 的条数：这些理由没有陈述出具体关系
     *  （纯名词短语），是**诚实的归类**而不是"判定失败"。 */
    relatedCount: byType[RELATED.id] || 0,
    /** 判出了具体关系的比例（排除 related）。这才是"这张图上
     *  有多少条线真的说出了两个公式之间是什么关系"。 */
    typedRate: total ? (total - (byType[RELATED.id] || 0)) / total : 0,
  }
}
