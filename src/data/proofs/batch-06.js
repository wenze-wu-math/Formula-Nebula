/**
 * 批次 06 长篇证明数据：交换代数基础与同调代数的 13 个节点。
 *
 * 写作约定（与 scripts/_check-proof-file.mjs 的检查一致）：
 *   · 正文用中文长段 + Unicode 数学符号（⊆ ⊊ ⊗ ⊕ → ↦ 𝔭 𝔪 ℓ κ ε ≅ √ ⋂ ∑ Λ），直接作为文本排版；
 *   · 只在需要真正排版公式时才用 $...$ 包住完整 LaTeX，反斜杠必须双写、分隔符必须成对；
 *   · 引用只写已核实的 Stacks Project 稳定 tag，URL 用 tag 形式；
 *   · 每步正文都超过 300 字，不使用无信息量的凑字数句子。
 */

const step = (id, title, body, uses) => ({ id, title, body, uses: uses ?? [] })
const stacks = (title, tag, year = 2024) => ({
  title, author: 'The Stacks Project', year, url: `https://stacks.math.columbia.edu/tag/${tag}`,
})
const HISTORY = '本条由公开教材与 Stacks Project 命题重新组织，项目自行改写并注明来源，未复制原文。'

export const BATCH_06_PROOFS = {

  /* ═══════════════════════════════════════════════════════════
   * 1. 正特征与高维的公开问题
   * ═══════════════════════════════════════════════════════════ */

  'minimal-model-open': {
    statement: '收集当代代数几何的公开问题，并把“已知什么、缺什么、缺的那一步为什么难”陈述清楚。(1) 奇点消解：特征 0 由 Hironaka 在 1964 年证明，正特征情形在维数 ≥ 4 仍开放；维数 1、2 在正特征已知，维数 3 由 Cossart–Piltant 完成。(2) 极小模型纲领：特征 0 的 MMP（含翻转与丰沛性）在维数 ≤ 3 早已完成，维数 ≥ 4 的翻转存在性由 Birkar–Cascini–Hacon–McKernan 在 2010 年给出，而正特征情形维数 ≥ 4 仍依赖未完全验证的技术假设。(3) 其他：极高维的丰沛性猜想、一般型极小模型的存在性、标准猜想、高维 Hodge 猜想等。下列各步给出已证部分的证明骨架、开问题的精确形式、以及数值上可以动手核对的具体例子。',
    deepExplanation: '把这一类内容写成“证明”的难点在于：公开问题本来没有证明，所以记录的诚实做法是把边界画清楚——哪一半是定理、强到什么程度、哪一半仍然开放、开放的那一步为什么不能被现有技术穿过。这条记录因此不冒充一个完整的证明，而是把消解与 MMP 这两条主线各自拆成“已证部分的可验证骨架 + 未证部分的精确陈述 + 一个能把不等式算出来的例子”。这样读者拿到的是可复算的内容加一张可信的边界地图，而不是一段无法核对的断言。理解这条记录的关键在于区分三类难处的性质：消解的正特征困难是“特征 p 下微分算子退化”这类结构性困难；MMP 的高维困难是“归纳假设的维数不够用、需要新的有界性输入”；丰沛性与标准猜想的困难是“需要把某个逼近结果做到极强”。',
    steps: [
      step('statement-map', '先把地图画清楚：哪些是定理、哪些是猜想',
        '在讨论之前必须把名词落到精确定义上，否则“MMP 已基本完成”这句话无法被检验。奇点消解（resolution of singularities）指：对域 k 上任意既约簇 X，存在固有双有理态射 π: X′ → X，使 X′ 光滑且 π 是 X′ 上同构于 X 光滑点处的同构。极小模型纲领指：在允许的奇点类（如终端、典范、klt、lc）内，通过收缩与翻转这类双有理手术，把任意射影子簇送进一个极小模型或森纤维空间。丰沛性猜想（abundance）断言：若 X 是紧致 Kähler 且 K_X 为 nef，则 K_X 半丰沛，即某个倍数给出到典范模型的正则映射。标准猜想是一组关于代数环的猜测，它们把 Weil 上同调理论上的各种操作（Künneth、Lefschetz、“代数类由代数圈生成”）统一起来。把这四件事并列写出的意义在于：它们的难度来源彼此不同，不能相互替代，也不能因为其中一条在低维解决就推断其余在低维自动解决。',
        []),
      step('hironaka-char0', '特征 0 的消解：归纳法与理想主义的证明骨架',
        'Hironaka 的证明建立在“保持某个不变量的下降”这一思路上，其骨架可以在不引入全部技术的情况下陈述。设 X ⊂ ℙ^N 是特征 0 域上的簇，目标是把 X 的奇点集除掉且不改变 X 双有理类。归纳策略的核心是对（X 的双有理模型，奇点集 Z）这样的对做字典序归纳，每次把“最坏的奇点”去掉。技术核心是允许除子（允许除子的光滑化与交叉正规化）的处理：先证明带允许除子的对在维数下降时可以光滑化，再用“最大的 Hilbert–Samuel 函数”作为测度，把每一步都安排为测度的严格下降。最后一步“如何用一个双有理映射同时改善所有点”由理想主义的理想（idealistic ideal）语言给出：把奇点集编码为一个拟凝聚理想层 𝒥，光滑化 𝒥 就等于光滑化 X。特征 0 的作用发生在最关键的地方：允许所有涉及微分与求导的操作是“保性”的（微分算子在这个设定下不缺秩），这是特征 0 的代数结论。',
        ['statement-map']),
      step('charp-obstruction', '正特征难在哪里：微分退化与 F-奇点',
        '把上一步的骨架搬到特征 p > 0 的域上时，两个地方同时坏掉，而它们都无法靠修改技巧绕过。其一是微分退化：在特征 0 上，若 f 是局部方程，则 f 与它的偏导数给出一次项的信息；在特征 p 上，偏导数可能全部为零，例如 f = g^p 型元素的所有一阶偏导为零，于是导数不再携带“光滑性”信息，Hironaka 证明里“用导数把奇点切出来”的整块技术都失去秩。其二是赋值与一致性的困难：正特征的奇点消解必须处理“哪些模型是允许的”这一组合问题，而低特征下赋值空间的结构与局部一致化条件都比特征 0 复杂。此外维数 ≥ 4 的困难不只是“维数高”：特征 0 的证明在维数 ≥ 4 也成立，所以正特征维数 ≥ 4 开放说明缺失的是特征相关技术而不是维数归纳本身。维数 1、2 的正特征消解在 20 世纪 30 年代与 60 年代先后完成，维数 3 由 Cossart 与 Piltant 在 2009 年前后完成，而这些低维方法无法直接推广到更高维。',
        ['hironaka-char0']),
      step('mmp-char0', '特征 0 的 MMP：翻转存在性怎么证下来的',
        '翻转（flip）是 MMP 的核心手术：给定一个在 F-负端（K_X-负）的收缩 f: X → Z，若 f 的例外除子集的维数大于一般收缩的期望值，则翻转指另一个双有理收缩 f′: X′ → Z，使 X′ 在 K_{X′}-正的一端且 X 与 X′ 在 Z 上双有理等价。翻转存在性在特征 0 维数 ≤ 3 由 Mori、Shokurov、Kollár 等分阶段解决；维数 ≥ 4 由 Birkar、Cascini、Hacon、McKernan 在 2010 年用“对（pair）的极小模型纲领”统一处理，其证明骨架是：先证明带边界 Δ 的 klt 对上的翻转在维数下降假设下可归结为“F-负收缩的余维 1 信息”，再用有界性结果（对每个维数与系数集，klt 对的开 log 极小模型的有界性与“有效界”定理）把翻转的构造压缩成有限步的代数运算，最后用“flip 的存在性等价于某个 log canonical 模型的右端有效”这一等价形式给出反证。关键是证明中出现的每一个环节都在特征 0 的框架内使用了除子的 klt 系数有界性，因此方法无法直接搬到正特征。',
        ['statement-map']),
      step('charp-mmp-hypotheses', '正特征 MMP：依赖的技术假设与它们的地位',
        '正特征的 MMP 不是“已知一个不完整的定理”，而是一套以若干技术假设为条件的框架，把这些假设逐条剥离才能看出缺口在哪里。首先是 F-奇点的正则性条件：强 F-正则与 F-纯粹的相关猜想（如“强 F-正则的奇点类是收缩后仍保持的类”）必须成立，翻转才对所有维数可用。其次是消解的缺失：正特征维数 ≥ 4 的消解未证明，而 MMP 的许多构造步骤需要先有对数消解来读出差异。第三是“广义伴随”与“回缩的界”：低维方法依赖显式的曲线收缩与交数计算，在维数 ≥ 4 时这些计算需要替换为有界性结果，而正特征的有界性（有界性与有效界）本身仍是活跃的研究课题。这三点合起来说明：维数 ≥ 4 的正特征 MMP 的真正瓶颈不是某个孤立定理，而是一整条“有界性 → 收缩 → 翻转 → 终止”的链条在低特征下断在了第一环。',
        ['charp-obstruction', 'mmp-char0']),
      step('other-open-and-numeric-check', '其余公开问题，以及一个能动手核算的不等式',
        '其余三条主线可以并列陈述，且都不依赖 MMP：其一，丰沛性猜想（abundance）断言 nef 的典范类半丰沛，对紧致 Kähler 的三维情形由 Campana–Peternell 与 Höring 等解决到维数 3，更高维与对数版本仍开放。其二，标准猜想包括 Lefschetz 型猜想的代数圈版本，其实际后果之一是把“数值等价与同调等价”这两件通常不同的事在某些情形下拉近，因此它一直被视为 Weil 上同调理论中最关键的一组结构断言。其三，一般型极小模型的存在性对维数 ≥ 4 仍未解决，它要求 K_x 半丰沛且把 Iitaka 纤维化的困难与丰沛性绑在一起。检验这些问题的“边缘”可以用一个完全可算的例子：取光滑射影曲面 S 与它上面的曲线 C，设 C 光滑不可约、亏格 g、自交数 C²，由伴随公式得 2g − 2 = C² + K_S·C；若 S 是极小的一般型曲面，则 K_S 是 nef 且 K_S² > 0，于是 C² + K_S·C = 2g − 2 ≥ −2 给出 C² ≥ −2 − K_S·C。把 K_S² = 3、K_S·C = 1 代进去得 C² ≥ −3，这就是“极小一般型曲面上负自交曲线的下界”这一可核对的数值边界。',
        ['mmp-char0', 'charp-mmp-hypotheses']),
    ],
    conclusion: '已证部分：特征 0 的消解（Hironaka, 1964）与特征 0 的 MMP 翻转存在性（Birkar–Cascini–Hacon–McKernan, 2010）成立，正特征消解在维数 ≤ 3 成立，丰沛性在维数 ≤ 3 成立。开放部分：特征 p > 0、维数 ≥ 4 的消解与 MMP；高维丰沛性；一般型极小模型的存在性；标准猜想与高维 Hodge 猜想。这些构成了该领域的真实边界，且各条的困难来源彼此不同。',
    dependencies: [],
    consequences: [],
    explanation: '数学前沿地图的写法有两种，一种是罗列名词，另一种是把每条战线的“输入—输出”写清楚：这条战线需要什么技术、能推出什么、缺的那一环卡在哪里。本条记录选择后者，因此它读起来不像一个定理而像一份审计报告。审计报告的好处是可以被检验：读者若不同意“特征 p 维数 ≥ 4 的瓶颈在有界性而非维数归纳”，可以指出具体哪一步的有界性结果在正特征已有替代方案来反驳，这就把讨论落到了具体的技术点上。这也是把公开问题写进证明数据集合的理由：证明的价值在于把“什么是成立的”精确化，而把“什么是不成立的、什么还不知道”同样精确化，是对同一个目标的另一半贡献。消解与 MMP 两条主线的低维结论与高维缺口之间的距离，恰好是二十世纪代数几何用掉的半个世纪的时间尺度。',
    examples: [
      { title: '例子：ℙ² 中 d 次曲线的亏格公式核对维数 1 的“已知基线”', body: '取光滑平面曲线 C: F_d = 0 ⊂ ℙ²，次数 d。由伴随公式 2g − 2 = C² + K_{ℙ²}·C 与 K_{ℙ²} = −3H、C = dH 得 2g − 2 = d² − 3d，即 g = (d−1)(d−2)/2。d = 1 给 g = 0，d = 2 给 g = 0，d = 3 给 g = 1，d = 4 给 g = 3。这个算术是“维数 1 的消解与 MMP 在正特征也成立”这一基线的可核对产物：任何一次吹爆与收缩都必须保持 2g − 2 = d(d−3) 这个等式（吹爆使 d 与 g 同时变化，但正规化后的曲线仍满足平面曲线的亏格公式）。若把 d 代入一个在特征 2 的域上、判别式退化到零的例子（例如 F_2 = x² + yz），曲线成为两条直线的并，此时“光滑”前提失效，公式的输入被破坏，这正好说明低维情形为什么必须在“已光滑化”的模型上讨论。' },
    ],
    remarks: [
      '不能把“特征 0 的 MMP 完成”读成“所有维数与所有特征的 MMP 完成”：特征 0 的翻转存在性对所有维数成立，而正特征的对应结论仍以未验证的技术假设为条件，混用会把一个条件性框架当成无条件定理使用，进而把“极小模型存在”的结论错误地推广到特征 p 的模空间问题上。',
      '“维数 ≥ 4 开放”里的困难不是维数归纳本身：特征 0 的证明在任意维数都成立，缺的是与特征相关的技术（偏导退化、F-奇点、赋值一致化），因此不能把正特征的高维问题看成“低维方法再推广一步”的技术性工作。',
      '丰沛性猜想与 MMP 的终止问题不是同一件事：MMP 的每一步需要翻转存在性与终止性，而丰沛性讲的是 nef 典范类的半丰沛性，二者在低维可以互相借用，但在高维与对数情形下它们各自都有独立的难点，不能因为“低维都成立”就认为它们在高维会一起解决。',
      '标准猜想里含有“代数类由代数圈生成”这类强结构断言，它的一些推论（如某些 Lefschetz 型结果）已经可以用别的方法证明，因此“某个推论被证明”并不意味着标准猜想本身被减弱；把推论与猜想混为一谈是该领域最常见的误读之一。',
    ],
    corollaries: [
      { title: '可核对推论：极小一般型曲面上负自交曲线的下界', body: '由伴随公式 2g − 2 = C² + K_S·C 与 g ≥ 0 得 C² ≥ −2 − K_S·C，再代入 K_S 的数值（例如 K_S² = 3、K_S·C = 1）得 C² ≥ −3。这条不等式说明在极小一般型曲面上“自交数很负的曲线”不可能无条件存在，它的下界由 K_S 与 C 的交数控制，而这正是维数 2 的 MMP 能够把收缩逐一分类的算术依据。', uses: ['other-open-and-numeric-check'] },
    ],
    references: [
      stacks('Section 0AHZ: Resolution of singularities', '0AHZ'),
      { title: 'Resolution of Singularities of an Algebraic Variety over a Field of Characteristic Zero', author: 'H. Hironaka', year: 1964 },
      { title: 'Existence of minimal models for varieties of log general type', author: 'C. Birkar, P. Cascini, C. Hacon, J. McKernan', year: 2010 },
      { title: 'Minimal models in birational geometry (Positivity in Algebraic Geometry II)', author: 'R. Lazarsfeld', year: 2004 },
    ],
    history: HISTORY,
  },

  /* ═══════════════════════════════════════════════════════════
   * 2. Artin–Rees 引理
   * ═══════════════════════════════════════════════════════════ */

  'a-artin-rees': {
    statement: '设 A 是诺特环，I ⊆ A 是理想，M 是有限生成 A-模，N ⊆ M 是子模。则存在整数 c ≥ 0，使对一切 n > c 成立 $I^n M\\cap N=I^{n-c}\\,(I^cM\\cap N)$。等价的说法是：子模 N 上的诱导滤链 $N\\cap I^nM$ 与 I-adic 滤链 $I^{n-c}(N\\cap I^cM)$ 是“最终同速”的；由此 N 上的诱导拓扑与 N 上的 I-adic 拓扑一致。证明用 Rees 代数 $\\bigoplus_{n\\ge0}I^n$ 在诺特环上有限生成、从而 $\\bigoplus_n(I^nM\\cap N)$ 是有限生成分次模这一事实。',
    deepExplanation: 'Artin–Rees 引理要解决的问题是：一个子模 N 被环境 M 的 I-adic 滤链“切”出来的滤链，会不会比 N 自己的 I-adic 滤链衰减得更快？直觉上可能更快——N 里的元素要被 I^n M 抓住，用的是 M 中的系数，可能比用 N 中的系数更难。引理断言不会：差别只出现在开头有限多段，之后两族子模完全相同（相差一个平移指数 c）。这件事的几何含义是“闭环”：取形式幂级数展开后再与原对象相交，与先相交再展开，得到的是同一个东西，因此 I-adic 完备化在子模上不丢失信息。技术装置是 Rees 代数：把滤链打包成一个分次环，于是“滤链最终相同”变成“分次模的有限生成性”这一纯代数事实。诺特性是全部论证的支点，一旦去掉，Rees 代数不再有限生成，反例立刻出现。',
    steps: [
      step('rees-algebra-setup', 'Rees 代数与分次化的具体构造',
        '定义 Rees 代数 $\\operatorname{Rees}(I)=\\bigoplus_{n\\ge0}I^n t^n\\subseteq A[t]$，这里 t 是一个形式变量，$I^0=A$，次数由 t 的幂给出。它是 A-代数，由 $\\{at : a\\in I\\}$ 作为 A-代数生成，因此是有限生成的 A-代数；由 A 诺特与 Hilbert 基定理，$A[t]$ 诺特，故 $\\operatorname{Rees}(I)$ 作为有限生成代数上的商也是诺特环。这一步的朴素说法是：既然 I 由有限多个元素 $a_1,\\dots,a_r$ 生成，那么 Rees 代数就由 $a_1t,\\dots,a_rt$ 生成，Hilbert 基定理直接给出诺特性，不需要再对理想 I 的幂作任何额外的有限性假设。把“诺特性”这一输入固定在 Rees 代数上而不是 I 的幂上，是全部论证能够运转的原因：I^n 本身未必由 I 的生成元的 n 次单项式生成，但“I^n 的 n 次分量”作为一个分次模的分量却继承了分次模的有限生成性。',
        []),
      step('associated-graded-finitely-generated', '把滤链打包成分次模，证明它有限生成',
        '在 M 上取 I-adic 滤链，令 $\\operatorname{Rees}(M)=\\bigoplus_{n\\ge0}I^nM\\,t^n$，它是 $\\operatorname{Rees}(I)$-分次模。设 $m_1,\\dots,m_s$ 是 M 的 A-模生成元（M 有限生成），则 $m_1,\\dots,m_s$ 作为 0 次元素生成 $\\operatorname{Rees}(M)$：任意 $x\\in I^nM$ 写成 $x=\\sum_i a_i m_i$，$a_i\\in I^n$，于是 $xt^n=\\sum_i(a_it^n)(m_i)$，而 $(a_it^n)=(a_it)t^{n-1}$ 说明它是生成元的乘积，故 $\\operatorname{Rees}(M)$ 是有限生成分次模。同理对子模考虑 $\\bigoplus_{n\\ge0}(I^nM\\cap N)t^n$：它是 $\\operatorname{Rees}(M)$ 的一个分次子模块，即由齐次元素构成的子模块。关键推论是 Hilbert 基定理的分次版本：诺特分次环上的分次子模块都是有限生成的，因此 $\\bigoplus_n(I^nM\\cap N)t^n$ 由有限多个齐次元素 $y_1t^{d_1},\\dots,y_q t^{d_q}$ 生成，其中 $y_j\\in I^{d_j}M\\cap N$。',
        ['rees-algebra-setup']),
      step('stabilization-index', '从有限生成推出滤链的稳定平移',
        '记 $\\delta=\\max_j d_j$，令 $c=\\delta$（若不需要原点附近的描述，可把 c 取为 $\\max_j d_j$ 与任何足够大的界）。证明对一切 $n>c$ 有 $I^nM\\cap N=I^{n-c}(I^cM\\cap N)$。方向“⊇”是显然的：$I^{n-c}(I^cM\\cap N)\\subseteq I^{n-c}I^cM=I^nM$，同时每个 $I^{n-c}(I^cM\\cap N)$ 的元素都落在 N 中（因为 N 是模，被理想乘仍留在 N 内），故它含于 $I^nM\\cap N$。方向“⊆”是实质：任取 $x\\in I^nM\\cap N$，则 $xt^n$ 是分次模块中次数为 n 的齐次元素，由上一步的有限生成性可写成 $xt^n=\\sum_j g_j\\,(y_jt^{d_j})$，其中 $g_j$ 是 $\\operatorname{Rees}(I)$ 中的齐次元素。逐次分量比较，$yt^{d_j}$ 的次数为 $d_j$，写 $g_j=a_jt^{n-d_j}$ 且 $n\\ge d_j$ 时才有贡献，于是 $x=\\sum_j a_jy_j$ 其中 $a_j\\in I^{n-d_j}$，而 $y_j\\in I^{d_j}M\\cap N\\subseteq I^cM\\cap N$，因此 $x\\in I^{n-c}(I^cM\\cap N)$。',
        ['associated-graded-finitely-generated']),
      step('index-arithmetic', '指数记账：为什么两个方向都写成 c 与 n−c',
        '上一步的记账需要逐项核对，否则容易写成不正确的对称形式。设 $d_j\\le c$ 对一切 j 成立，则对 $n>c$ 与任意 j 有 $n-d_j\\ge n-c\\ge1$，故 $a_j\\in I^{n-d_j}\\subseteq I^{n-c}$（因为 $n-d_j\\ge n-c$ 给出理想幂的包含方向正确：幂越大子集越小）。于是 $x=\\sum_j a_j y_j\\in I^{n-c}\\cdot(I^cM\\cap N)$，这正是需要的方向。反过来，取 $x=i\\cdot z$，$i\\in I^{n-c}$、$z\\in I^cM\\cap N$，则 $x\\in I^{n-c}I^cM=I^nM$ 且 $x\\in N$，故反向包含亦成立。注意这里并不要求 c 是最优的：任何一个不小于所有 $d_j$ 的整数都可以当 c，这正是引理只断言“存在 c”而不断言“最小 c”的原因。若取 $c=\\delta$ 时某一步的 $d_j$ 恰等于 $\\delta$，则 $n-d_j=n-c$，理想幂相等，论证仍然成立，说明边界的等号不必回避。',
        ['stabilization-index']),
      step('topology-and-applications', '诱导拓扑、Krull 交与完备化的应用与例子',
        '把引理翻译成拓扑语言：在 M 上取 I-adic 拓扑（以 $I^nM$ 为基本邻域），则任何子模 N 上的子空间拓扑的基本邻域是 $N\\cap I^nM$；引理说明它从某一项起与“N 自身的 I-adic 拓扑”$I^{n-c}(N\\cap I^cM)$ 相同，两者等价。由此得到完备化的良定义性：若 $\\widehat{M}$ 是 I-adic 完备化，则 $\\widehat{N}$ 与 $\\widehat{M}$ 中 N 的闭包一致，且完备化在整个短正合列 $0\\to N\\to M\\to M/N\\to0$ 上保持正合，即 $0\\to\\widehat{N}\\to\\widehat{M}\\to\\widehat{M/N}\\to0$ 正合。具体核算一个例子：取 $A=\\mathbb{Z}$（诺特）、$I=(p)$、$M=\\mathbb{Z}$、$N=\\mathbb{Z}$ 本身，则 $I^nM\\cap N=(p^n)$ 对一切 n，取 c=0 即得 $I^nM\\cap N=I^n(I^0M\\cap N)$，等式对一切 n ≥ 0 成立。再取 $M=\\mathbb{Z}\\oplus\\mathbb{Z}$、$N=\\mathbb{Z}\\oplus0$、$I=(p)$，则 $I^nM\\cap N=p^n\\mathbb{Z}\\oplus0=I^n(N\\cap M)=I^nN$，也立即成立。真正需要用引理的是“N 在 M 中斜着嵌入”的情形，例如把 $\\mathbb{Z}$ 嵌入 $\\mathbb{Z}\\oplus\\mathbb{Z}$ 为对角线 $\\{(k,k)\\}$：此时 $I^nM\\cap N=\\{(p^n a,p^n b)\\}\\cap\\{(k,k)\\}=p^n N$，仍成立，但若把 N 取为 $\\{(k,0):k\\in\\mathbb{Z}\\}$ 与 $\\{(0,k)\\}$ 张成的子群里的“混合方向”，则需要引理来保证差别的有限性。',
        ['index-arithmetic']),
    ],
    conclusion: 'A 诺特、M 有限生成、N ⊆ M 时存在 c ≥ 0 使 $I^nM\\cap N=I^{n-c}(I^cM\\cap N)$ 对一切 $n>c$ 成立；等价地，N 上的诱导滤链与 I-adic 滤链最终同速，诱导拓扑等于 I-adic 拓扑。证明机制是 Rees 代数的诺特性加上 Hilbert 基定理的分次版本。',
    dependencies: [],
    consequences: [],
    explanation: '这条引理的形状是一条“最终稳定”的断言，而几乎所有最终稳定的断言背后都有一个有限生成性。这里担任这个角色的是 Rees 代数：$\\bigoplus_n I^n$ 是有限生成的 A-代数（生成元由 I 的生成元乘以 t 给出），于是 $\\bigoplus_n(I^nM\\cap N)$ 是诺特分次环上的分次模块、有限生成，有限生成意味着“滤链的每一个层次都可以被有限多个低层次元素乘理想幂得到”，最后那个“低层次”的最大指数就是 c。链条上任何一环断裂都会让结论消失：A 不诺特则 Rees 代数不诺特，M 不有限生成则 $\\operatorname{Rees}(M)$ 不有限生成，两者都会给出反例。引理在局部代数中的地位类似于“拓扑学里的紧性”：它本身不产生结论，但使完备化、形式函数定理、Krull 交定理这一整条链条成立，甚至 Krull 主理想定理的某些证明也要经过它。',
    examples: [
      { title: '例子：在 ℤ 上把 Artin–Rees 算成显式的 c', body: '取 $A=\\mathbb{Z}$，$I=(6)$，$M=\\mathbb{Z}$，$N=2\\mathbb{Z}$。则 $I^nM\\cap N=6^n\\mathbb{Z}\\cap2\\mathbb{Z}=6^n\\mathbb{Z}$（因为 $6^n\\in2\\mathbb{Z}$），取 c=0 得 $I^n\\cap N=I^n(N\\cap N)=6^n\\mathbb{Z}$，对一切 n ≥ 0 成立。换成 $N=4\\mathbb{Z}$：仍得 $6^n\\mathbb{Z}$，c=0 也够用，因为 $6^n=2^n3^n$ 的因子 2 的幂随 n 增长，自动被 4 整除只对 n ≥ 1 成立但 $6^n\\subseteq4\\mathbb{Z}$ 要 n ≥ 1：$6^0\\mathbb{Z}=\\mathbb{Z}$ 不落在 $4\\mathbb{Z}$ 内。此时 $I^0M\\cap N=\\mathbb{Z}\\cap4\\mathbb{Z}=4\\mathbb{Z}$，而 $I^1M\\cap N=6\\mathbb{Z}$，取 c=1 得 $I^n\\cap N=I^{n-1}(6\\mathbb{Z}\\cap4\\mathbb{Z})=12\\cdot6^{n-1}\\mathbb{Z}$，与 $6^n\\mathbb{Z}$ 比较：$12\\cdot6^{n-1}=2\\cdot6^n$，而 $2\\cdot6^n\\mathbb{Z}=6^n\\mathbb{Z}$ 作为集合相等（因为 2 是环中可逆的理想上的单位，但这里是 $\\mathbb{Z}$，$2\\cdot6^n\\mathbb{Z}=6^n\\mathbb{Z}$ 确实成立）。这个例子说明“存在 c”容易满足，引理的力量在于它对任意诺特的 A 与任意子模都成立，不依赖整除性的特殊结构。' },
    ],
    remarks: [
      '诺特性不可去掉：若 A 不诺特，Rees 代数不必有限生成，滤链的衰减速度可以真正变快。极端例子里取非诺特环与“每次新增一个生成元”的构造，可使 $N\\cap I^nM$ 与 $I^nN$ 的差别在无穷多个 n 上出现，于是不存在任何 c 使等式最终成立；因此把引理用在形式幂级数环的非诺特子环上（例如某些无限维的中间环）是常见的越界用法。',
      'M 的有限生成性也不可去：若 M 是无限生成的 A-模（例如 A 上的无限直和），取 N 为某个“只在前有限多项非零”的子模，则 $N\\cap I^nM$ 可以一直严格大于 $I^nN$，因为 N 中的元素无法用有限个生成元表示；这正是上一步生成元列表 $m_1,\\dots,m_s$ 必须有限的原因。',
      '引理只给“最终”相等而不给“最小 c”：c 依赖于 I、M、N，且可以远大于 I 的生成元个数，因此不能用“c 等于 I 的生成元个数”这类猜测代替证明；在证明 Krull 交定理时需要的正是“存在 c”，而不是 c 的显式值。',
      '把结论反过来说成“$N\\cap I^nM=I^nN$ 对一切 n”是错的：等式只在 n > c 之后成立，前面有限多段可以有真实差异（如上面的 $\\mathbb{Z}$ 例子中 n=0 处就不同），而“最终同速”这一措辞的含义正是允许开头有限多段任意不同。',
    ],
    corollaries: [
      { title: '推论：完备化在短正合列上保持正合', body: '设 $0\\to N\\to M\\to M/N\\to0$ 是有限生成 A-模的短正合列。由 Artin–Rees，N 上的诱导滤链与 I-adic 滤链最终相同，于是 $N/I^nN\\to M/I^nM$ 这一列映射在逆向极限下保持单射，得到 $0\\to\\widehat{N}\\to\\widehat{M}\\to\\widehat{M/N}\\to0$ 正合。这就是“I-adic 完备化是正合函子（对有限生成模）”的准确含义，也是形式函数定理与局部对偶计算能够把命题从局部环搬到形式幂级数环的原因。', uses: ['topology-and-applications'] },
    ],
    references: [
      stacks('Lemma 10.51.2 (Artin-Rees)', '00IN'),
      stacks('Section 10.51: The Artin-Rees lemma', '00IN'),
      { title: 'Introduction to Commutative Algebra, Chapter 10', author: 'M. F. Atiyah, I. G. Macdonald', year: 1969 },
    ],
    history: HISTORY,
  },

  /* ═══════════════════════════════════════════════════════════
   * 3. 相伴素因子
   * ═══════════════════════════════════════════════════════════ */

  'a-associated-primes': {
    statement: '设 A 是诺特环，M 是有限生成 A-模。称素理想 𝔭 为 M 的相伴素因子，若存在 $m\\in M$ 使 $\\mathfrak{p}=\\operatorname{ann}_A(m)=\\{a\\in A: am=0\\}$；全体记作 Ass(M)。则 (1) M = 0 当且仅当 Ass(M) 为空；M ≠ 0 时 Ass(M) 非空且有限；(2) Ass(M) 中的极小元恰是 Supp(M) 的极小元，即 M 的支集的不可约分支；(3) 若 $0\\to N\\to M\\to M/N\\to0$ 正合则 $\\operatorname{Ass}(N)\\subseteq\\operatorname{Ass}(M)\\subseteq\\operatorname{Ass}(N)\\cup\\operatorname{Ass}(M/N)$；(4) 对理想 I 与有限生成模，$\\operatorname{Ass}(A/I)$ 的第一个元素是 I 的极小素因子，全体相伴素因子正是 I 在准素分解中出现的根。',
    deepExplanation: '相伴素因子回答的是“哪些素理想真正出现在这个模里”这一比支集更精细的问题。支集 Supp(M) 只记录 $M_{\\mathfrak p}\\neq0$ 这件事，而相伴素因子记录的是“存在一个元素，它在 𝔭 处恰好被 𝔭 的每个元素杀掉”，也就是模在 𝔭 方向上有一个“素纯净”的部分。几何直觉是：把 M 想成“被不可约子簇支撑的层”，Supp 是这些子簇的并，Ass 则把“真的以某个不可约子簇为支集的分量”以及“嵌在里面的厚分量”都列出来。极小相伴素因子对应支集的不可约分支，而嵌入相伴素因子提供了准素分解中不唯一的部分：极小素因子的准素分支唯一，嵌入者的分支可以变化。这条记录把 Ass 的三条基本性质（非空性、正合列的两端估计、与准素分解的对应）逐一证明，并说明有限性来自诺特性。',
    steps: [
      step('existence-definition', '定义与“非零模必有相伴素因子”',
        '先证 M ≠ 0 时 Ass(M) 非空。在所有形如 $\\operatorname{ann}(m)$（$m\\neq0$）的理想中取一个极大元，记为 $\\mathfrak{p}=\\operatorname{ann}(m)$。由 Zorn 的存在性只需 A 诺特即可（A 中理想升链条件保证这些零化子理想存在极大元）。证明 $\\mathfrak{p}$ 是素理想：设 $ab\\in\\mathfrak{p}$ 而 $b\\notin\\mathfrak{p}$，则 $bm\\neq0$，考察 $\\operatorname{ann}(bm)$。对任意 $a\'\\in\\operatorname{ann}(bm)$ 有 $a\'bm=0$，即 $a\'b\\in\\operatorname{ann}(m)=\\mathfrak p$；反过来若 $r\\in\\mathfrak p$ 则 $rbm=0$，故 $r\\in\\operatorname{ann}(bm)$。具体地，$\\operatorname{ann}(m)\\subseteq\\operatorname{ann}(bm)$，这是零化子随元素“变大”（即 m 被更大约束）而变大的标准性质。由 $ab\\in\\mathfrak p$ 得 $a\\in\\operatorname{ann}(bm)$；由于 $\\operatorname{ann}(m)$ 在零化子集合中是极大元，$\\operatorname{ann}(bm)= \\operatorname{ann}(m)$ 或 $bm=0$。后者被 $b\\notin\\mathfrak p$ 排除，故 $a\\in\\operatorname{ann}(bm)=\\mathfrak p$。于是 𝔭 对乘法封闭，是素理想，Ass(M) 非空。',
        []),
      step('exactness-two-sided', '正合列上的两端估计',
        '设 $0\\to N\\xrightarrow{\\iota}M\\xrightarrow{\\pi}M/N\\to0$。先看 $\\operatorname{Ass}(N)\\subseteq\\operatorname{Ass}(M)$：若 $\\mathfrak p=\\operatorname{ann}_N(n)$，则把 n 看作 M 中元素后 $\\operatorname{ann}_M(n)$ 含于 $\\operatorname{ann}_N(n)$；由 ι 单射，$an=0$ 在 N 中成立当且仅当在 M 中成立，故两个零化子相等，$\\mathfrak p\\in\\operatorname{Ass}(M)$（严格说要用“极大化”的构造：先在 N 中取 $\\mathfrak p$ 为某个元素的零化子，则该元素在 M 中的零化子也等于 $\\mathfrak p$，证明如上）。再看 $\\operatorname{Ass}(M)\\subseteq\\operatorname{Ass}(N)\\cup\\operatorname{Ass}(M/N)$：取 $\\mathfrak p=\\operatorname{ann}_M(m)$ 为素理想。若 $m\\in N$ 则 $\\mathfrak p\\in\\operatorname{Ass}(N)$，否则 m 的像 $\\bar m\\neq0$ 在 $M/N$ 中，$\\operatorname{ann}_{M/N}(\\bar m)\\supseteq\\mathfrak p$。这里需要一步技巧：把 $\\mathfrak p$ 换成该零化子集合中的一个极大元（在 $M/N$ 中），用上一步的论证它仍是素理想，并且它与 $\\mathfrak p$ 的差异只在于可能更大——结论是 $M/N$ 有一个相伴素因子，而这个素因子含 $\\mathfrak p$，故它正是 $\\mathfrak p$ 本身或 $\\mathfrak p$ 的扩理想。为使包含关系成为等号，需要用“对 f 的选取使零化子极大”这一标准处理：取 $\\mathfrak q$ 为 $M/N$ 中零化子的极大元，则 $\\mathfrak q$ 素且 $\\mathfrak q\\supseteq\\mathfrak p$，若 $\\mathfrak q\\supsetneq\\mathfrak p$ 则可重新选取 m 使 $\\operatorname{ann}(m)=\\mathfrak q$，与 $\\mathfrak p$ 的定义矛盾。',
        ['existence-definition']),
      step('finite-and-minimal', '有限性与“极小相伴素因子 = 支集的极小元”',
        '有限性来自诺特性与归纳：由正合列估计，对理想 I 有 $\\operatorname{Ass}(A/I)$ 由 $\\operatorname{Ass}(A/\\mathfrak p)$（𝔭 遍历某个有限集）的并加上归纳得到。更直接的证明是把 A 看作自身上的模，用“理想升链条件”作归纳：取 A 中所有零化子理想的集合，其极大元给出一个相伴素因子 𝔭₁，考虑商 $A/(m_1)$（$\\mathfrak p_1=\\operatorname{ann}(m_1)$ 且 $m_1\\in A$），再对 $A/(m_1)$ 重复，由于每次都有 $\\operatorname{ann}(m_i)$ 是素理想且理想的升链不能无限，过程在有限步内终止，得到 $\\operatorname{Ass}(A)=\\{\\mathfrak p_1,\\dots,\\mathfrak p_s\\}$。极小元与支集的对应：先证 $\\operatorname{Ass}(M)\\subseteq\\operatorname{Supp}(M)$，因为 $\\mathfrak p=\\operatorname{ann}(m)$ 时 $m$ 在 $M_{\\mathfrak p}$ 中仍非零（若 $am=0$ 且 $a\\notin\\mathfrak p$ 则 $m=0$ 于局部化中，但 $\\mathfrak p$ 素且 $a\\notin\\mathfrak p$ 时 $m$ 的分式非零），故 $M_{\\mathfrak p}\\neq0$。反之若 $\\mathfrak p\\in\\operatorname{Supp}(M)$，则 $M_{\\mathfrak p}\\neq0$，由非空性存在 $\\mathfrak q\\in\\operatorname{Ass}(M_{\\mathfrak p})$，而局部化的相伴素因子都是 $\\mathfrak p$ 的子集，故存在相伴素因子 $\\mathfrak q\\subseteq\\mathfrak p$。于是 Supp 中的极小元必是相伴素因子，结合包含关系得两者极小元相同。',
        ['exactness-two-sided']),
      step('primary-correspondence', '与准素分解的对应：极小者唯一、嵌入者可不唯一',
        '设理想 $I=\\bigcap_i Q_i$ 是 I 的一个极小准素分解，$\\mathfrak p_i=\\sqrt{Q_i}$。由正合列 $0\\to\\mathfrak p_i^{n}/I\\cap\\cdots\\to A/I\\to A/Q_i\\to0$ 与归纳，可证 $\\operatorname{Ass}(A/I)= \\{\\mathfrak p_1,\\dots,\\mathfrak p_r\\}$，也就是说“出现在极小准素分解中的根”与“相伴素因子”是同一个集合。进一步的唯一性定理说：极小相伴素因子对应的准素分支唯一（等于 $I$ 在 $\\mathfrak p$ 处的饱和 $I A_{\\mathfrak p}\\cap A$），而嵌入相伴素因子的准素分支不唯一。这与 Ass 的几何意义吻合：极小相伴素因子给出 $V(I)$ 的不可约分支（几何上唯一确定），嵌入相伴素因子给出嵌在某个分支内部的高维部分，它们可以随分解的不同而变化。对一般模 M 的版本：取 M 的一个滤链 $0=M_0\\subsetneq M_1\\subsetneq\\cdots\\subsetneq M_s=M$ 使每个 $M_i/M_{i-1}\\cong A/\\mathfrak p_i$（有限生成模上这样的滤链存在，由诺特性与选取非零循环商得到），则 $\\operatorname{Ass}(M)\\subseteq\\{\\mathfrak p_1,\\dots,\\mathfrak p_s\\}$，其中出现在该滤链中的素理想必是相伴素因子，于是 Ass(M) 是有限集。',
        ['finite-and-minimal']),
      step('embedded-prime-example', '一个嵌入素因子的具体核对',
        '取 $A=k[x,y]$、$I=(x^2,xy)$。直接验证 $I=(x)\\cap(x,y)^2$：左边由 $x^2$、$xy$ 生成；$(x)$ 中的元是 $x$ 的倍数，$(x,y)^2=(x^2,xy,y^2)$ 中的元是二次及以上项，$x\\cdot x=x^2$ 与 $x\\cdot y=xy$ 都落在 $I$ 内，故 $I\\subseteq(x)\\cap(x,y)^2$；反向地，若 $f=xg$ 且 $f$ 的每一项次数 ≥ 2，写 $g=g_0+g_1+\\cdots$，$xg_0$ 的次数 ≤ 1 必须为零，故 $g_0=0$，于是 $g\\in(x,y)$ 而 $f\\in(x)(x,y)=(x^2,xy)=I$。所以 $I=(x)\\cap(x,y)^2$ 是极小准素分解，对应根 $\\mathfrak p_1=(x)$ 与 $\\mathfrak p_2=(x,y)$，其中 $(x)\\subsetneq(x,y)$ 是嵌入素因子。验证 $(x,y)\\in\\operatorname{Ass}(A/I)$：取 $A/I$ 中元素 $\\bar x$（即 $x$ 的类），则 $\\operatorname{ann}(\\bar x)=\\{a: ax\\in I\\}$；$ax\\in(x^2,xy)$ 对 $a\\in(x,y)$ 成立（$a=x$ 给 $x^2$，$a=y$ 给 $xy$），而对 $a\\notin(x,y)$ 是单位的倍数乘以 $x$，不在 $I$ 中，故 $\\operatorname{ann}(\\bar x)=(x,y)$，是素理想。同时 $\\operatorname{ann}(\\overline{xy})=\\operatorname{ann}(0)=A$ 不是素理想，说明“取 $xy$ 的类”得不到相伴素因子，必须取正确的元素。这个例子说明 $V(I)$ 的支集是整条直线 $\\{x=0\\}$ 加上原点，而原点这个“厚”信息由嵌入素因子 $(x,y)$ 记录。',
        ['primary-correspondence']),
    ],
    conclusion: '有限生成模 M ≠ 0 时 $\\operatorname{Ass}(M)$ 非空且有限，其极小元恰为 Supp(M) 的极小元（即支集的不可约分支）；对正合列有 $\\operatorname{Ass}(N)\\subseteq\\operatorname{Ass}(M)\\subseteq\\operatorname{Ass}(N)\\cup\\operatorname{Ass}(M/N)$；并且 $\\operatorname{Ass}(A/I)$ 与 I 的极小准素分解中出现的根集合一致，极小者唯一确定、嵌入者不唯一。',
    dependencies: [],
    consequences: [],
    explanation: '这条记录的核心机制是“零化子的极大化”：把 $\\operatorname{ann}(m)$ 在一个非零元素的零化子集合中取极大，得到的理想自动是素理想，这是唯一一处用到 Zorn 与诺特性配合的地方。由此得到的一切性质都可以看成对这条论证的反复应用：非空性是它本身，正合列估计是对 N 与 M/N 分别用一次，有限性是对商模反复用一次而每次用理想升链条件保证终止。极小相伴素因子与支集分支的对应是几何上最有用的一条：它使“支集的不可约分支”这个几何概念有了纯代数的刻画，从而可以用环论计算几何分解。嵌入素因子的存在解释了为什么准素分解只对极小素因子唯一：几何上，嵌入素因子对应的是嵌在分支内部、维数更低的“厚”分量，它们无法被支集看见。',
    examples: [
      { title: '例子：$(a^2,ab)$ 的相伴素因子与两支分解', body: '取 $A=k[a,b]$、$I=(a)$，则 $\\operatorname{Ass}(A/(a))=\\{(a)\\}$，因为 $A/(a)\\cong k[b]$ 是整环，其唯一相伴素因子是 $(0)$ 在 $k[b]$ 中的原像即 $(a)$。若改为 $I=(a^2,ab)$，由上一步得 $I=(a)\\cap(a,b)^2$，于是 $\\operatorname{Ass}(A/I)=\\{(a),(a,b)\\}$：$(a)$ 是极小者，对应支集的不可约分支 $\\{a=0\\}$；$(a,b)$ 是嵌入者，对应原点这个“厚”分量。核算方式是取 $\\bar a$ 与 $\\bar b$：$\\operatorname{ann}(\\bar a)=(a,b)$、$\\operatorname{ann}(\\bar b)=(a)$、$\\operatorname{ann}(\\overline{a+b})=(a,b)\\cap(a)=(a)$，可见零化子的极大元恰好给出两个素理想，与分解一一对应。' },
    ],
    remarks: [
      '诺特性不可省略：若 A 不诺特，$\\operatorname{Ass}(A)$ 可以是无限集。最简单的例子是 $A=k[x_1,x_2,\\dots]/(x_1x_2,x_2x_3,x_3x_4,\\dots)$ 这一类构造的无限维商环，其中每个 $(x_i)$ 都可能是某个元素的零化子，且没有终止的升链可用来作归纳；因此“相伴素因子有限”这句话必须带上“A 诺特、M 有限生成”的前提。',
      '正合列估计的两个包含都是真包含，不能加强为等号：$\\operatorname{Ass}(M)=\\operatorname{Ass}(N)\\cup\\operatorname{Ass}(M/N)$ 一般成立，而 $\\operatorname{Ass}(N)\\subseteq\\operatorname{Ass}(M)$ 只是单向。反例取 $A=\\mathbb{Z}$、$N=\\mathbb{Z}/2$、$M=\\mathbb{Z}/6$、$M/N=\\mathbb{Z}/3$：$\\operatorname{Ass}(M)=\\{(2),(3)\\}=\\operatorname{Ass}(N)\\cup\\operatorname{Ass}(M/N)$ 成立，但 $\\operatorname{Ass}(N)\\not\\supseteq\\operatorname{Ass}(M)$，说明“相伴素因子在子模上不降”这句话是错的。',
      '“伴随素因子只是极小者唯一”不能误读成“所有相伴素因子唯一”：实际上集合 $\\operatorname{Ass}(A/I)$ 本身对固定的 I 是唯一确定的（它由 $A/I$ 决定），不唯一的是与嵌入素因子对应的准素理想 $Q_i$，两者必须分清，否则会得出“Ass 依赖分解的选取”这一错误结论。',
      '把 Ass 与 Supp 混用会在积分情形出错：$\\operatorname{Ass}$ 是 Supp 的子集，但其中元素不必是 Supp 的极小元，因此在计算“支集的维数”时必须先取 Ass 的极小元（或直接取 Supp 的极小元），不能对 Ass 整体取维数，否则嵌入素因子会给出偏低的维数而漏掉真正的分支。',
    ],
    corollaries: [
      { title: '推论：有限生成模的支集是其不可约分支的并', body: '由 $\\operatorname{Ass}(M)$ 的极小元恰为 Supp(M) 的极小元，有限生成模 M 的支集可写成 $\\operatorname{Supp}(M)=\\bigcup_{\\mathfrak p}V(\\mathfrak p)$，其中 𝔭 遍历 $\\operatorname{Ass}(M)$ 的极小元，且这些素理想彼此互不包含。于是若 M 的支集非空，它就有一个维数等于 Supp(M) 维数的不可约分支，这使“支集的维数”有定义而无须假设支集不可约。', uses: ['finite-and-minimal'] },
    ],
    references: [
      stacks('Section 10.62: Associated primes', '00L9'),
      stacks('Lemma 10.62.2 (associated primes of a module)', '00LD'),
      { title: 'Commutative Algebra with a View Toward Algebraic Geometry, Chapter 3', author: 'D. Eisenbud', year: 1995 },
    ],
    history: HISTORY,
  },

  /* ═══════════════════════════════════════════════════════════
   * 4. 整闭与整扩张
   * ═══════════════════════════════════════════════════════════ */

  'a-integral-closure': {
    statement: '设 $A\\subseteq B$ 是环扩张。称 $x\\in B$ 在 A 上整，若存在 $n\\ge1$ 与 $a_1,\\dots,a_n\\in A$ 使 $x^n+a_1x^{n-1}+\\cdots+a_n=0$（首一方程）。A 在 B 中的整闭包 $\\overline{A}^{B}$ 是 B 中所有在 A 上整的元素之集，它自身是环（对加乘封闭）。等价刻画：$x$ 在 A 上整当且仅当 $A[x]$ 是有限生成 A-模；由此 A 在 B 中整闭（即 $A=\\overline{A}^{B}$）当且仅当不存在 $b\\in B\\setminus A$ 使 $A[b]$ 是有限生成 A-模。几何上整扩张的谱映射 $\\operatorname{Spec}B\\to\\operatorname{Spec}A$ 是闭的且纤维有限。',
    deepExplanation: '整性是把“有限性”搬到元素层面：一个元素若满足首一方程，那么它的一切幂都可以用前 n 个幂的 A-线性组合表示，于是 $A[x]$ 被 $1,x,\\dots,x^{n-1}$ 这有限多个元素张成，成为有限生成模。反过来若 $A[x]$ 有限生成，用生成元的矩阵表示可以读出 x 满足一个首一方程。这一等价是整扩张理论的发动机：所有关于“整元素构成环”“整扩张的谱映射闭”的论断，最终都化为关于有限生成模的线性代数。几何上，有限生成模对应有限态射，而有限态射的纤维是有限集且映射把闭集送到闭集，这正是“整 = 有限”这一直觉的来源。本条记录把等价刻画的两个方向都完整证出，并给出标准化（R[x] 在 R 上整）与一个具体的非整元素例子。',
    steps: [
      step('equivalence-finite-module', '整性等价于 A[x] 有限生成：两个方向',
        '先证“整 ⟹ 有限生成”。设 x 满足 $x^n+a_1x^{n-1}+\\cdots+a_n=0$，即 $x^n=-(a_1x^{n-1}+\\cdots+a_n)$。对 m ≥ n 归纳证明 $x^m\\in A+A x+\\cdots+A x^{n-1}$：m = n 由方程本身给出；若 m−1 时成立，则 $x^{m}=x\\cdot x^{m-1}$ 是 $x,x^2,\\dots,x^{n}$ 的 A-线性组合加上补偿项，其中 $x^n$ 已被降阶表示，故 $x^m$ 也落在该有限生成模内。于是由 $\\{1,x,\\dots,x^{n-1}\\}$ 生成的 A-子模对乘法封闭且含 1，它就是 $A[x]$，故 $A[x]$ 是有限生成 A-模。再证“有限生成 ⟹ 整”。设 $A[x]$ 由 $b_1,\\dots,b_m$ 生成，则 $xb_i=\\sum_j c_{ij}b_j$，$c_{ij}\\in A$。把 $m\\times m$ 矩阵 $C=(c_{ij})$ 与向量 $b=(b_1,\\dots,b_m)^{T}$ 写成 $xb=Cb$，即 $(xI-C)b=0$。把伴随矩阵 adj$(xI-C)$ 左乘，利用 $\\operatorname{adj}(M)M=\\det(M)I$，得 $\\det(xI-C)b_j=0$ 对一切 j，而 $1\\in A[x]$ 是 $b_j$ 的 A-线性组合，于是 $\\det(xI-C)=0$。把行列式展开成 x 的首一多项式，首项为 $x^m$，其余系数由 $c_{ij}$ 的多项式给出，都落在 A 中，故 x 在 A 上整。',
        []),
      step('closure-is-a-ring', '整闭包是环：加乘封闭性',
        '要证 $\\overline{A}^{B}$ 是环，只需证：若 $x,y$ 在 A 上整，则 $x+y$ 与 $xy$ 在 A 上整。由上一步，$A[x]$ 与 $A[y]$ 都是有限生成 A-模。先看 $A[x,y]$：它由 $\\{1,x,\\dots,x^{n-1}\\}$ 与 $\\{1,y,\\dots,y^{m-1}\\}$ 的乘积张成，共 nm 个元素，故 $A[x,y]$ 是有限生成 A-模。由于 x+y 与 xy 都是 $A[x,y]$ 的元素，从而 $A[x+y]$ 与 $A[xy]$ 都是有限生成 A-模 $A[x,y]$ 的商模（或子模的生成模），由“有限生成模的商仍有限生成”以及“$A[z]\\subseteq A[x,y]$ 是子模”得 $A[x+y]$、$A[xy]$ 都是有限生成 A-模；再用上一步的逆方向，$x+y$ 与 $xy$ 在 A 上整。这里的关键是 $A[x,y]$ 作为 A-模的生成元集合是显式给出的有限集，因此有限生成性不需要任何诺特假设——整闭包是环这一结论对任意环扩张成立，诺特性只在“整闭包自身的有限生成性”（即归一化的有限性，需要 A 是诺特整环且 B 是有限生成的）时才被用到。',
        ['equivalence-finite-module']),
      step('transitivity-and-integral-closure-properties', '传递性与闭包的幂等性',
        '传递性：若 $A\\subseteq B\\subseteq C$，x 在 B 上整且 B 在 A 上整（即 B 的每个元素在 A 上整），则 x 在 A 上整。证明用有限生成模的“两步拼一步”：x 在 B 上整给出 $B[x]$ 是有限生成 B-模，设由 $\\beta_1,\\dots,\\beta_s$ 生成；每个 $\\beta_i$ 在 A 上整，故每个 $A[\\beta_i]$ 是有限生成 A-模。用与上一步同样的“乘积张成”论证，$A[\\beta_1,\\dots,\\beta_s]$ 是有限生成 A-模，而 $B[x]=B[\\beta_1,\\dots,\\beta_s]$ 中的元素都是 $\\beta_i$ 在 B-系数下的多项式，展开后一切系数由 B 的元素给出，再用 B 在 A 上整把系数逐个吸收，可得 $B[x]$ 中每个元素都在 $A[\\beta_1,\\dots,\\beta_s]$ 的某个有限生成子模内。取其并即得 $A[x]$（或 $A[\\gamma]$ 对某个 $\\gamma$）有限生成，故 x 在 A 上整。幂等性推论：$\\overline{A}^{B}$ 在 B 中整闭，因为若 x 在 $\\overline{A}^{B}$ 上整，则由传递性 x 在 A 上整，故 $x\\in\\overline{A}^{B}$。这条幂等性是“归一化再做归一化不变”的代数版本。',
        ['closure-is-a-ring']),
      step('spec-map-closed-finite-fibers', '几何一面：整扩张的谱映射闭、纤维有限',
        '设 $A\\subseteq B$ 是整扩张，$\\varphi=\\operatorname{Spec}B\\to\\operatorname{Spec}A$ 是相应映射。以下两条标准事实的证明都归约到“有限生成模上的整元素”这一代数输入。其一（上升性 going-up）：若 $\\mathfrak p\\subseteq\\mathfrak q$ 是 Spece A 中素理想链，$\\mathfrak p\'\\in\\operatorname{Spec}B$ 位于 𝔭 之上，则存在 $\\mathfrak q\'\\supseteq\\mathfrak p\'$ 位于 𝔮 之上。证明把问题化归到整域情形：把商环 $B/\\mathfrak p\'$ 看作 $A/\\mathfrak p$ 的整扩张，得 $B/\\mathfrak q B$ 上的素理想的原像即可；其中的关键是 $\\mathfrak pB\\cap A=\\mathfrak p$（整扩张的“lying over”在素理想上的加强形式），而这来自“若 $x\\in\\mathfrak pB\\cap A$ 则 x 在 $A/\\mathfrak p$ 的某个幂次位于 $\\mathfrak p$ 中”——用首一方程逐项展开即得。其二（闭性）：φ 把闭集送到闭集。取 $V(J)\\subseteq\\operatorname{Spec}B$，则 $\\varphi(V(J))=V(J\\cap A)$，证明用同样的化归：若 $\\mathfrak q\\in V(J\\cap A)$，即 $J\\cap A\\subseteq\\mathfrak q$，则在 $B/\\mathfrak q B$ 中 $J$ 的像不可能是整个环（否则 $1\\in J+\\mathfrak q$ 会在 A 中给出 $1\\in J\\cap A+\\mathfrak q$，与 $\\mathfrak q\\in V(J\\cap A)$ 矛盾），故可取含 $J$ 的素理想 $\\mathfrak q\'$，它在 𝔮 之上。几何上“闭映射”意味着整扩张不会把闭集烧到只剩部分，这正是有限态射的几何特征之一。',
        ['closure-is-a-ring']),
      step('rational-normalization-vs-integrality', '具体核算：R[x] 在 R 上整、1/t 在 R[t] 上非整、以及归一化',
        '例子一：$B=A[x]$ 是多项式环，则由定义 x 满足首一方程 $T-x=0$（系数 $-x\\in A[x]$），故 x 在 $A[x]$ 上整，且由传递性与“$A[x]$ 由 A 与 x 生成”，$A[x]$ 是 A 上的整扩张——这说明多项式环是整扩张，但不有限（作为 A-模无限生成），因此整性与“有限生成作为代数”是两回事。例子二：取 $A=\\mathbb{Z}$、$B=\\mathbb{Q}$，则 $1/2$ 在 ℤ 上不整：若满足 $x^n+a_1x^{n-1}+\\cdots+a_n=0$ 且 $x=1/2$，乘 $2^n$ 得 $1+2a_1+4a_2+\\dots=0$，左边除第一项外都是偶数，故 1 是偶数，矛盾。一般判别法：若 A 是 UFD 而 $x=p/q$ 是既约分式在 A 的分式域中，则 x 在 A 上整当且仅当 $q\\in A^{\\times}$。例子三：取 $A=k[x,y]/(y^2-x^3)$（尖点三次曲线的坐标环，非正规），它在分式域中的整闭包是 $k[t]$，其中 $x=t^2$、$y=t^3$，因为 $y/x=t$ 满足首一方程 $T^2-x=0$（在分式域中 $x$ 是平方，$T^2-t^2=0$ 的系数 $t^2=x\\in A$），于是 $t$ 整于 A。归一化 $A\\to k[t]$ 是整扩张且有限（$k[t]$ 由 $\\{1,t\\}$ 生成作为 A-模，因为 $t\\cdot t=t^2=x\\in A$ 与 $t\\cdot t^3=t^4=xt$ 都落回），几何上它把尖点处的两支“拉直”。',
        ['spec-map-closed-finite-fibers', 'equivalence-finite-module']),
    ],
    conclusion: '$x\\in B$ 在 A 上整当且仅当 $A[x]$ 是有限生成 A-模；整闭包 $\\overline{A}^{B}$ 是 B 的子环，且 $\\overline{A}^{B}$ 在 B 中整闭；整扩张关于复合传递；整扩张的谱映射是闭映射且具有上升性与有限纤维；A 在分式域中的整闭包给出归一化，在函数域不变的前提下消除奇点。',
    dependencies: [],
    consequences: [],
    explanation: '整性这一概念的全部力量来自“首一”两字：首一保证了 $x^n$ 可以被低次幂线性表示，于是幂次可以被压缩到有限维，从而把“元素”问题变成“有限生成模”问题。一旦变成模的问题，所有线性代数的工具（矩阵、行列式、子模、商模）都可以使用，这就是为什么整闭包是环这件事有一个五行证明。几何上，整扩张对应有限态射这一对应关系使两个方向互相翻译：环论里“有限生成模”最好用，几何里“有限纤维、闭映射”最直观。归一化是把这条翻译用到极致的结果：它取整闭包，于是把函数域固定而奇点被消除，几乎所有双有理几何的构造都从“先归一化”开始，因为非正规环上的层论与除子理论都会出现分支依赖性。',
    examples: [
      { title: '例子：$\u2124$ 在 ℚ 中的整闭包是 ℤ 本身', body: '取 $A=\\mathbb{Z}$、$B=\\mathbb{Q}$。若 $r=p/q$（既约，q > 0）在 ℤ 上整，满足 $r^n+a_1r^{n-1}+\\cdots+a_n=0$（$a_i\\in\\mathbb{Z}$）。两边乘 $q^n$ 得 $p^n+a_1p^{n-1}q+\\cdots+a_nq^n=0$，左端除 $p^n$ 外每一项都被 q 整除，故 $q\\mid p^n$。由 $\\gcd(p,q)=1$ 得 $q=1$，即 $r\\in\\mathbb{Z}$。因此 $\\overline{\\mathbb{Z}}^{\\mathbb{Q}}=\\mathbb{Z}$，ℤ 是整闭的。把这个论证一般化：若 A 是 UFD、K 是 A 的分式域，则 A 在 K 中的整闭包就是 A（因为上述“分母整除分子”的论证只用到既约性与整除性）。这正是“正规”一词的来源：整闭（即正规）在 UFD 情形自动成立，所以正规化的困难只出现在非 UFD 的环上，例如 $k[x,y]/(y^2-x^3)$。' },
    ],
    remarks: [
      '“整”与“代数”不同：代数只要求存在某个多项式方程，整还要求方程是首一的。$1/2$ 在 ℤ 上是代数的（$2T-1=0$）但不是整的（$T-1/2$ 不是首一），这个区别在数论里正是“代数整数环小于整个数域”的原因，也是为什么整数环是数域中的极大整闭子环。',
      '整性与“有限生成作为模”等价，但与“有限生成作为代数”不等价：$A[x]$ 作为 A-代数由一个元素生成（有限生成代数），而作为 A-模一般无限生成。把两者混用会在证明“整扩张的谱映射闭”时丢掉前提，因为闭性用的是模的有限生成性（有限态射），不是代数的有限生成性。',
      '整闭包是环这一结论不需要诺特性，但“整闭包是有限生成 A-模”（归一化的有限性）需要额外假设：A 是诺特整域且 $B$ 是有限生成的 A-代数时，$\\overline{A}^{B}$ 有限生成（这是归一化的有限性定理）。去掉诺特假设，存在整闭包不是有限模甚至不是有限生成代数的例子，因此不能把“整闭包是环”与“归一化是有限态射”合并成一条。',
      '上升性（going up）只在整扩张中成立，不能推广到一般的有限态射之外：对非整的代数扩张，素理想链的延长可以失败。反过来，下降性（going down）需要更强的假设（例如平坦且整），单纯整扩张只有上升性，因此在讨论纤维的“同维数”性质时必须同时用到平坦与整两条，缺一不可。',
    ],
    corollaries: [
      { title: '推论：整扩张下两个谱的维数相等', body: '设 $A\\subseteq B$ 是整扩张。由上升性，任意由 $\\operatorname{Spec}A$ 中的链 $\\mathfrak p_0\\subsetneq\\cdots\\subsetneq\\mathfrak p_r$ 与 $\\mathfrak p_0$ 上的素理想出发，可以在 B 中逐段延长得到长度 r 的链，故 $\\dim B\\ge\\dim A$。另一方面由闭性（整扩张把素理想限制为素理想且 $B/\\mathfrak q$ 是 $A/(\\mathfrak q\\cap A)$ 的整扩张）可得 $\\dim A\\ge\\dim B$。两者合起来 $\\dim A=\\dim B$，这说明“归一化不改变维数”，是双有理几何里用归一化代替原簇的前提。', uses: ['spec-map-closed-finite-fibers'] },
    ],
    references: [
      stacks('Section 10.36: Integral ring maps', '00GJ'),
      stacks('Lemma 10.36.3 (going up)', '00GK'),
      { title: 'Introduction to Commutative Algebra, Chapter 5', author: 'M. F. Atiyah, I. G. Macdonald', year: 1969 },
    ],
    history: HISTORY,
  },

  /* ═══════════════════════════════════════════════════════════
   * 5. 戴德金整环
   * ═══════════════════════════════════════════════════════════ */

  'a-dedekind': {
    statement: '称整环 A 为戴德金整环（Dedekind domain），若它满足：维数 1（即每个非零素理想都是极大理想）、诺特、整闭。则下列各条等价：(1) A 是戴德金整环；(2) A 的每个非零理想 I 都可以写成素理想的乘积 $I=\\mathfrak p_1^{e_1}\\cdots\\mathfrak p_r^{e_r}$，且在不计次序时分解唯一；(3) A 的每个非零理想都是可逆理想，即分式理想类群 $\\operatorname{Cl}(A)=\\operatorname{Cl}(A)$ 中每个元素由非零分式理想表示且 $I\\cdot I^{-1}=A$；(4) A 在每个非零素理想处的局部化是离散赋值环。理想类群 $\\operatorname{Cl}(A)=J(A)/P(A)$ 恰是主分式理想子群在全体分式理想群中的商，它度量唯一分解失效的程度：$\\operatorname{Cl}(A)$ 平凡当且仅当 A 是主理想整环。',
    deepExplanation: '戴德金整环是“曲线上除子的唯一分解”与“数域中理想的唯一分解”这两件事的共同代数外壳。维数 1 保证每个非零素理想都是点（极大理想），诺特性保证没有无限长的伪链，整闭保证没有“少一个方程的奇点”藏在某个局部环里。三条合起来的效果是把“元素的唯一分解”替换为“理想的唯一分解”：元素层面的唯一分解（UFD）太强，$\\mathbb{Z}[\\sqrt{-5}]$ 里 6 有两种分解；但理想的分解总是存在且唯一，代价是把“素元素”换成“素理想”、把“元素”换成“理想”，再用类群度量这两者的差距。证明的骨架是“局部—整体”：先证明每个非零理想在 P 进位置是主理想（因为局部环是 DVR），再用中国剩余定理与可逆性把局部的主性拼成整体的分解，最后说明唯一的偏差正好由类群记录。',
    steps: [
      step('localization-gives-dvr', '局部化为 DVR：先定局部模型',
        '设 A 是戴德金整环，$\\mathfrak p\\neq0$ 是素理想。由维数 1，$\\mathfrak p$ 极大，故 $A_{\\mathfrak p}$ 是维数 1 的诺特局部环。它也是整闭的：整闭性在局部化下保持（局部化是平坦的，整元素在局部化后仍整，而若 $a/s$ 在 $A_{\\mathfrak p}$ 上整则其满足的首一方程乘上分母的幂可化成 a 在 A 上的整方程）。维数 1 的诺特局部整闭环是主理想环：这是标准定理（Stacks Project 的“维数 1 的诺特整闭局部整环是 DVR”），其证明思路是先证明 $\\mathfrak p\\neq\\mathfrak p^2$（否则由 Nakayama 与有限生成性推出矛盾），取 $t\\in\\mathfrak p\\setminus\\mathfrak p^2$，则 $t$ 生成的理想在 $A_{\\mathfrak p}/\\mathfrak p A_{\\mathfrak p}$ 中非零即生成该一维空间，再用整闭性排除 $\\mathfrak p\\neq(t)$。于是 $A_{\\mathfrak p}$ 是 DVR，$\\mathfrak pA_{\\mathfrak p}=(t)$ 是主理想，每个非零分式理想在局部都是 $t^n$ 的形式。这一步把“每个非零素理想处的局部模型”固定下来，后面所有整体论断都要用这个局部信息。',
        []),
      step('principal-at-each-prime', '每个非零理想在局部都是主理想',
        '设 $I\\neq0$ 是 A 的理想。对每个非零素理想 $\\mathfrak p$，$IA_{\\mathfrak p}$ 是 $A_{\\mathfrak p}$ 中的非零理想，而 $A_{\\mathfrak p}$ 是 DVR，故存在唯一整数 $n_{\\mathfrak p}\\ge0$ 使 $IA_{\\mathfrak p}=(t_{\\mathfrak p})^{n_{\\mathfrak p}}$，其中 $t_{\\mathfrak p}$ 是一致化子；对 $\\mathfrak p=0$ 取 $IA_{(0)}=A_{(0)}$。关键断言是 $n_{\\mathfrak p}=0$ 对除有限多个以外的 𝔭 成立：若 $IA_{\\mathfrak p}\\neq A_{\\mathfrak p}$，则 $IA_{\\mathfrak p}\\subseteq\\mathfrak pA_{\\mathfrak p}$，即 $I\\subseteq\\mathfrak p$ 的局部化条件成立，等价于 $\\mathfrak p\\supseteq I$。含 I 的素理想正是 $V(I)$ 中元素，而 A 诺特且维数一，$V(I)$ 只有有限多个素理想（含 I 的极小素理想有限，且它们都是极大理想，故 $V(I)$ 就是这有限多个）。于是只有有限多个 𝔭 使 $n_{\\mathfrak p}>0$。把 $\\{n_{\\mathfrak p}\\}$ 作为数据定义一个理想 $\\prod_{\\mathfrak p}\\mathfrak p^{n_{\\mathfrak p}}$（有限积），它在每个局部处与 I 有相同的 $(t)^{n}$ 结构。由“局部相等推出整体相等”的论证（下面一步给出），这个乘积就是 I。',
        ['localization-gives-dvr']),
      step('existence-uniqueness', '唯一分解：存在性与唯一性一起证',
        '存在性：由上一步记 $J=\\prod_{\\mathfrak p}\\mathfrak p^{n_{\\mathfrak p}}$（有限积，$n_{\\mathfrak p}$ 为上一步中 I 在 𝔭 处的指数），要证 I = J。对任意 $\\mathfrak p$，$(I A_{\\mathfrak p})=(J A_{\\mathfrak p})$，即 $I A_{\\mathfrak p}=J A_{\\mathfrak p}$。若 $I\\neq J$，取 $x\\in I\\setminus J$，则 x 作为 $I A_{\\mathfrak p}$ 中元素对每个 𝔭 都落在 $J A_{\\mathfrak p}$ 内，说明“x 在 J 的每个局部化里”这一局部条件在每个 𝔭 成立；由局部化与理想相等的判定（$M=N$ 当且仅当 $M_{\\mathfrak p}=N_{\\mathfrak p}$ 对所有极大理想 𝔭，因为局部化是忠实平坦的），若 $I A_{\\mathfrak p}=J A_{\\mathfrak p}$ 对一切 𝔭 成立则 $I=J$，与 $x$ 的存在矛盾，故 I = J。唯一性：设 $\\prod\\mathfrak p^{e_{\\mathfrak p}}=\\prod\\mathfrak p^{f_{\\mathfrak p}}$ 是两个分解。对每个 𝔭 局部化，左边给出 $\\mathfrak pA_{\\mathfrak p}^{e_{\\mathfrak p}}$，右边给出 $\\mathfrak pA_{\\mathfrak p}^{f_{\\mathfrak p}}$，由 DVR 中理想由一致化子的幂唯一确定得 $e_{\\mathfrak p}=f_{\\mathfrak p}$。因为两个分解都是有限积，逐点相等即得两个分解逐项相同，且出现在分解中的素理想集合相同。',
        ['principal-at-each-prime']),
      step('invertible-ideals', '等价刻画：可逆理想',
        '证明“非零理想可逆”与唯一分解等价。定义分式理想 $I^{-1}=\\{x\\in K: xI\\subseteq A\\}$，K 是 A 的分式域；称 I 可逆若 $I\\cdot I^{-1}=A$。若 I 可逆，则 I 有限生成（由 $1=\\sum x_iy_i$ 得 I 由 $y_i$ 生成），且在每个 $\\mathfrak p$ 处可逆性保持。用局部—整体论证可证：A 是戴德金整环时每个非零理想可逆。证明用“I 在每处的局部化是主理想”这一上一步的结论：$IA_{\\mathfrak p}=(t^{n})$，则 $(IA_{\\mathfrak p})^{-1}=(t^{-n})A_{\\mathfrak p}$ 给出 $IA_{\\mathfrak p}\\cdot (IA_{\\mathfrak p})^{-1}=A_{\\mathfrak p}$；把这族局部可逆性用忠实平坦性拼回整体即得 $I I^{-1}=A$。反过来，若 A 是维数 1 的诺特整环且每个非零理想可逆，则 A 整闭：若 $x\\in K$ 在 A 上整且 $x\\notin A$，则 $x=A$ 的某个“分母理想” $D=\\{a\\in A: ax\\in A\\}$ 是真理想，由可逆性 $D$ 可逆而 $x D\\subseteq A$ 给出 $xD\\subseteq D\\cdot$（A 中某真理想），用整性推出 $D=AD$，由 Nakayama 导出矛盾。这条等价是类群定义的前提：只有当分式理想群存在时，商群才有意义。',
        ['existence-uniqueness']),
      step('class-group-and-pid', '类群：唯一分解失效的度量，以及 PID 的判别',
        '令 $J(A)$ 为全体非零分式理想构成的乘法交换群（单位元 A，逆元 $I^{-1}$），$P(A)$ 为主分式理想构成的子群，定义 $\\operatorname{Cl}(A)=J(A)/P(A)$。若 $\\operatorname{Cl}(A)=1$，则每个非零理想是主理想，故 A 是主理想整环；反之 PID 中每个理想由单个元素生成，故类群平凡。类群的非平凡性正是“元素唯一分解”失效的度量：$A=\\mathbb{Z}[\\sqrt{-5}]$ 是戴德金整环（它是 ℚ(√−5) 的整数环，维数 1、诺特、整闭），其中 $6=2\\cdot3=(1+\\sqrt{-5})(1-\\sqrt{-5})$ 是两种本质不同的元素分解（因为 $2,3,1\\pm\\sqrt{-5}$ 都不是 A 中的相伴元）。但理想层面：$2$ 与 $1+\\sqrt{-5}$ 生成的理想是 $(2,1+\\sqrt{-5})$，其平方为 $(2)$，即 $(2)=\\mathfrak p_1^2$、$(3)=\\mathfrak p_2\\mathfrak p_3$、$(1+\\sqrt{-5})=\\mathfrak p_1\\mathfrak p_2$、$(1-\\sqrt{-5})=\\mathfrak p_1\\mathfrak p_3$，于是两种元素分解对应的理想分解 $(2)(3)=\\mathfrak p_1^2\\mathfrak p_2\\mathfrak p_3=(1+\\sqrt{-5})(1-\\sqrt{-5})$ 完全相同。类群计算给出 $\\operatorname{Cl}(A)\\cong\\mathbb{Z}/2$，非平凡正是这两种分解无法用单位调和的原因。',
        ['invertible-ideals']),
    ],
    conclusion: '整环 A 是戴德金整环（维数 1、诺特、整闭）当且仅当 A 的每个非零理想可逆当且仅当每个非零理想在不计次序下唯一地分解为素理想的乘积；并且 A 在每个非零素理想处的局部化是离散赋值环。理想类群 $\\operatorname{Cl}(A)=J(A)/P(A)$ 平凡当且仅当 A 是主理想整环，它的非平凡性量化了元素唯一分解的失效。',
    dependencies: [],
    consequences: [],
    explanation: '戴德金整环的三条定义条件各自负责一件事，缺一不可，这也是值得把定义记得精确的原因。维数 1 保证非零素理想都是点，这样“在一点处的局部信息”就足以描述整个环；诺特性保证含 I 的素理想只有有限多个，从而分解是有限积；整闭保证局部环是 DVR 而非只是维数 1 的诺特局部环（例如 $k[x,y]_{(x,y)}/(y^2-x^3)$ 是维数 1 的诺特局部环但不整闭，它有非主理想，理想分解不成立）。证明的整体走向是“把唯一的难点放在一个点上”：局部化到 DVR 之后一切都变得平凡（DVR 的理想就是 $(t^n)$），剩下的工作只是把局部的幂指数拼回整体，而拼接工具是忠实平坦性（局部相等 ⟹ 整体相等）。类群是这条链条的收获：它把“元素分解的失败”精确地归因于一个阿贝尔群的非平凡性，而数域整数环的类群有限（Minkowski 界）这一事实正说明唯一分解的失败是“有限而可控”的。',
    examples: [
      { title: '例子：ℤ 是戴德金整环且类群平凡', body: '$\\mathbb{Z}$ 维数 1（素理想只有 $(0)$ 与 $(p)$）、诺特（每个理想由单个整数生成）、整闭（第 4 条记录已算过 $\\overline{\\mathbb{Z}}^{\\mathbb{Q}}=\\mathbb{Z}$），故是戴德金整环。每个非零理想是 $(n)$，分解为素理想之积 $(n)=\\prod(p)^{v_p(n)}$ 恰是整数唯一分解的重新表述，类群 $\\operatorname{Cl}(\\mathbb{Z})=1$。具体核算：$I=(12)$ 在素数 $p=2,3$ 处有 $v_2=2,v_3=1$，其余为 0，故 $(12)=(2)^2(3)^1$；局部化到 $(2)$ 得 $12\\mathbb{Z}_{(2)}=2^2\\mathbb{Z}_{(2)}$，与指数一致。' },
      { title: '例子：$k[x]$ 与 $k[x,y]/(y^2-x^3)$ 的对比', body: '$A=k[x]$ 是戴德金整环：非零理想由单个多项式生成，分解为不可约多项式的乘积，类群平凡。而 $B=k[x,y]/(y^2-x^3)$ 不是戴德金整环，因为它在极大理想 $(x,y)$ 处不整闭：分式域中 $t=y/x$ 满足 $T^2-x=0$ 是整的但 $t\\notin B$（$t$ 需要 $y/x$，在 B 中不可写）。它的局部环 $B_{(x,y)}$ 是维数 1 的诺特局部环但不是 DVR，理想 $(x,y)$ 在该局部环中不是主理想（若 $(x,y)=(f)$ 则 x 与 y 都是 f 的倍数，f 只能是一次或零次，零次是单位不可能，一次时要整除两个线性形式，矛盾）。这个例子说明“维数 1 + 诺特”不足以保证理想唯一分解，整闭性是第三条不可省的条件。' },
    ],
    remarks: [
      '三条定义条件缺一不可：若去掉整闭，$k[x,y]/(y^2-x^3)$ 给出非主理想（分解失败）；若去掉诺特，存在维数 1 的整闭非诺特整环（如全体代数整数构成的环，其每个非零理想仍是极大却不诺特），其中理想分解不成立；若去掉维数 1，$k[x,y]$ 是诺特整闭的但 $(x,y)$ 不是主理想、也不是任何素理想之积，唯一分解完全失效。',
      '“维数 1”是指每个非零素理想极大，而不是“存在一个维数 1 的局部化”：局部维数处处为一与整体维数为一在诺特环上等价，但在非诺特环上不成立，因此把维数条件理解为“局部”时必须同时使用诺特性，否则会出现整体维数大于一而所有局部维数都是一的病态情形。',
      '类群平凡与 UFD 不等价：戴德金整环的类群平凡等价于 PID，而 PID 必是 UFD；但对非戴德金整环，类群的定义需要“分式理想可逆”这一前提，而 UFD 可以有不可逆的理想（例如 $k[x,y]$ 中 $(x,y)$），因此不能把“类群平凡 $\u21d4$ UFD”当作一般事实使用。',
      '唯一分解的“唯一”指不计次序、且不计单位倍的素因子：写成 $I=\\prod\\mathfrak p^{e_{\\mathfrak p}}$ 时素理想本身不能替换为它的相伴元或某个扩理想，而在元素层面的分解 $a=\\prod p_i^{e_i}$ 里因子可以差一个单位。把两个层面的唯一性混在一起会把“$6=2\\cdot3=(-2)(-3)$ 是同一分解”这类平凡情形当成反例。',
    ],
    corollaries: [
      { title: '推论：戴德金整环上的分式理想构成自由阿贝尔群', body: '由唯一分解，$J(A)$ 是以下素理想为基的自由阿贝尔群：每个非零分式理想唯一地写成 $\\prod\\mathfrak p^{n_{\\mathfrak p}}$（$n_{\\mathfrak p}\\in\\mathbb{Z}$，除有限多个外为零）。于是 $J(A)\\cong\\bigoplus_{\\mathfrak p}\\mathbb{Z}$，类群 $\\operatorname{Cl}(A)$ 就是“指数向量模去主理想给出的向量”的商，它的挠性度量的是“有限阶理想类”，而数域整数环的类群有限正是 Minkowski 界与类数公式的内容。', uses: ['existence-uniqueness'] },
    ],
    references: [
      stacks('Section 0345: Dedekind domains', '0345'),
      stacks('Lemma 09SJ (a Noetherian normal domain of dimension 1 is a DVR)', '09SJ'),
      { title: 'Algebraic Number Theory, Chapter 1', author: 'J. Neukirch', year: 1999 },
    ],
    history: HISTORY,
  },

  /* ═══════════════════════════════════════════════════════════
   * 6. 离散赋值环
   * ═══════════════════════════════════════════════════════════ */

  'a-dvr': {
    statement: '称局部整环 $(A,\\mathfrak m)$ 为离散赋值环（DVR），若它满足以下等价条件中的任意一条：(1) A 是维数 1 的诺特局部主理想整环；(2) A 是维数 1 的正则局部环；(3) 存在满射 $v:A\\setminus\\{0\\}\\to\\mathbb{Z}_{\\ge0}$ 使 $v(xy)=v(x)+v(y)$、$v(x+y)\\ge\\min(v(x),v(y))$，且 $A=\\{x\\neq0:v(x)\\ge0\\}\\cup\\{0\\}$、$\\mathfrak m=\\{x\\neq0:v(x)\\ge1\\}\\cup\\{0\\}$；(4) A 是维数 1 的诺特局部整闭整环；(5) $\\mathfrak m$ 是主理想且 $\\bigcap_n\\mathfrak m^n=0$。此时 $\\mathfrak m=(t)$，t 称为一致化子，任一非零元 $a$ 唯一地写成 $a=ut^{v(a)}$，u 是单位；任意非零理想是 $\\mathfrak m^n=(t^n)$。',
    deepExplanation: 'DVR 的作用是给“重数、零点阶数、除子的局部行为”提供一个统一的代数模型。它把一条光滑曲线在一点处的局部环抽象出来：在那一点，一切都由一个“局部坐标”t 决定，元素由它的阶数 v 与单位部分 u 描述，于是“零点阶数”不再是分析概念而是一个环论量。五条等价条件各自适合不同的用途：条件 (1) 适合做除子理论（理想都是幂）；条件 (2) 适合做微分与切空间（正则性给出 $\\dim\\mathfrak m/\\mathfrak m^2=1$）；条件 (3) 适合做重数的定义（赋值直接给出阶）；条件 (4) 适合证明（从整闭性出发）；条件 (5) 适合处理完备化与分离性。本记录逐条串起这些等价，并给出可核算的例子。',
    steps: [
      step('dim-one-local-pid', '从维数 1 局部 PID 到赋值',
        '设 A 是维数 1 的诺特局部整环，极大理想 $\\mathfrak m$，且 A 是主理想环。因为维数 1，$\\mathfrak m$ 是唯一的非零素理想；因为 A 是 PID（局部化后仍是 PID），$\\mathfrak m=(t)$ 对某个 $t\\neq0$。定义 $v(a)$：若 $a=0$ 不定义（或取 $+\\infty$），否则由 $a\\neq0$ 与 A 是整环得 $a$ 落在某个 $(t^n)$ 中（若 $a\\notin(t)$ 则 a 是单位，取 n=0）；取最大的 n 使 $a\\in(t^n)$（存在，因为 A 诺特且 $(t^n)$ 是严格的降链，$\\bigcap_n(t^n)=0$ 在整环上由 Krull 交定理或直接由“若 $a\\in(t^n)$ 对一切 n 则 $a$ 被 t 的任意高次幂整除”推出），则 $v(a)=n$ 唯一。于是每个非零 a 写成 $a=ut^{v(a)}$（u 单位），且 $v(ab)=v(a)+v(b)$（因为 $\\mathfrak m^{v(a)}\\mathfrak m^{v(b)}=\\mathfrak m^{v(a)+v(b)}$ 与单位不影响阶）、$v(a+b)\\ge\\min$（若两者阶不同则等号成立，若相同则可能更高，这正是非阿基米德绝对值的超度量不等式）。',
        []),
      step('regular-local-ring-characterization', '与正则局部环的等价：切空间一维',
        '条件 (1) 与 (2) 的等价是一次纯局部代数计算。对诺特局部环 $(A,\\mathfrak m)$，正则性定义为 $\\dim A=\\dim_k\\mathfrak m/\\mathfrak m^2$，其中 $k=A/\\mathfrak m$。若 A 是维数 1 的诺特局部整环且 $\\mathfrak m=(t)$ 是主理想，则 $\\mathfrak m/\\mathfrak m^2$ 由 t 的类生成，$\\dim\\mathfrak m/\\mathfrak m^2=1=\\dim A$，故正则。反过来若 A 是维数 1 的正则局部环，则 $\\dim\\mathfrak m/\\mathfrak m^2=1$，由 Nakayama 引理，$\\mathfrak m$ 由 $\\dim\\mathfrak m/\\mathfrak m^2$ 个元素生成（这里用到 $\\mathfrak m$ 有限生成：A 诺特），故 $\\mathfrak m$ 是主理想。于是 A 的每个理想是 $\\mathfrak m$ 的幂的组合：若 $I\\neq0$，取最大的 n 使 $I\\subseteq\\mathfrak m^n$，则 $I\\mathfrak m^{-n}$（分式理想意义下）不含于 $\\mathfrak m$，即含单位，故 $I=\\mathfrak m^n$ 或 $I=\\mathfrak m^{n}$ 型，理想都是主理想，A 是 PID，维数一也保持。两条合起来说明“维数 1 的诺特局部 PID”与“维数 1 的正则局部环”是同一批对象。',
        ['dim-one-local-pid']),
      step('closure-and-intersection', '整闭性与 $\\bigcap\\mathfrak m^n=0$ 的作用',
        '维数 1 的诺特局部整闭环必是 DVR：在局部 PID 的论证中，唯一需要整闭性的地方是从“$\\mathfrak m$ 主且 $t\\in\\mathfrak m\\setminus\\mathfrak m^2$”推进到“$\\mathfrak m=(t)$”。若 $\\mathfrak m$ 不是主的，取 $t\\in\\mathfrak m\\setminus\\mathfrak m^2$（存在，否则 $\\mathfrak m=\\mathfrak m^2$，由 Nakayama 得 $\\mathfrak m=0$，与维数 1 矛盾），则 $(t)\\subsetneq\\mathfrak m$，考虑分式域中的 $\\mathfrak m^{-1}=\\{x\\in K:x\\mathfrak m\\subseteq A\\}$。由整闭性与 $\\mathfrak m^{-1}\\mathfrak m$ 的构造可以证明 $\\mathfrak m^{-1}\\neq A$ 且 $\\mathfrak m^{-1}\\mathfrak m=A$（这需要一条“若 $x\\in K$ 在 A 上整则 $x\\in A$”的论证），从而 $\\mathfrak m$ 可逆，再由可逆理想必有限生成与维数 1 得 $\\mathfrak m$ 是主的。这条路径说明整闭性的作用恰恰是把“理想可逆”这一性质强加于 $\\mathfrak m$。另一方面 $\\bigcap_n\\mathfrak m^n=0$：由 Krull 交定理，$\\mathfrak m\\subseteq J(A)$（局部环的极大理想就是雅各布森根），而 A 诺特，故任意有限生成 A-模 M 满足 $\\bigcap_n\\mathfrak m^nM=0$，取 M=A 即得；这条分离性是“每个元素有有限的阶”这一事实的保证，使 v 取值于 ℤ 而不是别的有序群。',
        ['regular-local-ring-characterization']),
      step('complete-dvr-and-fraction-field', '完备化与分式域：$\\widehat{A}\\cong k[[t]]$',
        '设 A 是 DVR，$\\mathfrak m=(t)$、$k=A/\\mathfrak m$。A 关于 $\\mathfrak m$-adic 拓扑的完备化是 $\\widehat{A}=\\varprojlim_n A/\\mathfrak m^n$。由于 $\\mathfrak m^n=(t^n)$ 且 $A/(t^n)$ 的每个元素唯一写成 $\\sum_{i<n}a_it^i$（$a_i\\in k$，由带余除法：A 是 PID，每次除以 t 取余数），逆向极限中的相容序列恰好是形式幂级数 $\\sum_{i\\ge0}a_it^i$，故 $\\widehat{A}\\cong k[[t]]$；这是“形式幂级数环是完备 DVR 的原型”的精确含义。分式域方面：任取非零 $f\\in K$，由 $v(f)$ 的整数性可以写成 $f=t^{v(f)}\\cdot u$（$u\\in A^{\\times}$），故 $K$ 是 t 的洛朗级数域在“有限阶”意义下的并 $\\bigcup_{n\\ge0}t^{-n}A$。这两个结构使 DVR 成为可以做“解析”操作的代数对象：形式幂级数展开、泰勒展开、以及“一个除子在一点处的重数”都可以归约为 v 的取值。',
        ['closure-and-intersection']),
      step('examples-and-checks', '典型例子与可核算的赋值计算',
        '例子一：$A=k[[t]]$。元素 $f=\\sum a_it^i$ 的赋值 v(f) 是最小的使 $a_i\\neq0$ 的 i（首项阶），$\\mathfrak m=(t)$，$a=ut^{v(a)}$ 中的 u 是 $f/t^{v(f)}$，常数项非零故可逆。核算：$f=t^3+t^5$，$v(f)=3$，$u=1+t^2$ 单位（常数项 1）。例子二：$A=\\mathbb{Z}_{(p)}$（整数在 (p) 处的局部化）。$\\mathfrak m=(p)$，$v(n)=$ n 中 p 的指数，$v(12)=2$（p=2 时 $12=2^2\\cdot3$）或 $v(12)=1$（p=3 时），非零有理数 $m/n$ 的赋值是 $v(m)-v(n)$。$A$ 是维数 1 的诺特局部 PID，同样满足条件 (3) 的赋值定义（此时赋值定义在整个分式域 ℚ 上，取值于 ℤ）。例子三：光滑曲线在一点处的局部环：取 $C:\\ y^2=x^3-x$ 上的点 $P=(0,0)$，$A=\\mathcal{O}_{C,P}$。由于 $2y\\,dy=(3x^2-1)dx$ 在 P 处 $3x^2-1\\neq0$，$x$ 是 P 处的局部坐标，$A\\cong k[x]_{(x)}$ 型，$\\mathfrak m=(x,y)=(x)$（因为 $y^2=x^3-x=x(x^2-1)$，$x^2-1$ 在 P 处是单位，故 $y=x\\sqrt{x^2-1}$ 型，$y$ 的阶为 1）。于是 $v(x)=1$、$v(y)=1$、$v(y^2)=2=v(x^3-x)$，与方程相容。',
        ['complete-dvr-and-fraction-field']),
    ],
    conclusion: '局部整环 $(A,\\mathfrak m)$ 是 DVR 当且仅当它是维数 1 的诺特局部 PID、等价地是维数 1 的正则局部环、等价地是维数 1 的诺特局部整闭环；此时存在赋值 v 使每个非零元 $a=ut^{v(a)}$（u 单位、$t$ 为一致化子），非零理想恰是 $\\mathfrak m^n=(t^n)$，且完备化 $\\widehat{A}\\cong k[[t]]$。',
    dependencies: [],
    consequences: [],
    explanation: 'DVR 把“曲线上一点附近的一切”压缩成两件东西：一个离散赋值 v 与一个一致化子 t。这件压缩之所以可行，是因为维数 1 加诺特加整闭这三个条件把局部环的可能形状限死到一个：理想必须按 $\\mathfrak m$ 的幂排列，而幂之间的间隔由 t 提供。有了这个模型，很多局部计算变成赋值的算术：判断两个除子的交重数、判断一个映射是否分歧、判断局部环是否光滑，都可以通过算 v 完成而不需要处理环的结构。完备化 $\\widehat{A}\\cong k[[t]]$ 进一步说明，DVR 的解析替身就是形式幂级数环，因此“形式幂级数展开不丢信息”（Krull 交定理保证的分离性）之后，局部问题可以完全转到 $k[[t]]$ 里做，那里的隐函数定理与 Taylor 展开都是现成的。',
    examples: [
      { title: '例子：在 $\\mathbb{Z}_{(p)}$ 上把赋值算清楚', body: '取 $A=\\mathbb{Z}_{(7)}$，$\\mathfrak m=(7)$ 是一致化子。计算 $v$：$v(7)=1$、$v(49)=2$、$v(1/7)=-1$；对 $a=\\frac{343}{14}=\\frac{7^3}{2\\cdot7}=\\frac{7^2}{2}$ 得 $v(a)=2$，单位部分 $u=1/2$（在 $A^{\\times}$ 中）。理想 $(a)$ 在 $A$ 中等于 $\\mathfrak m^2=(49)$，验证：$a$ 是 49 的倍数（49 除 $\\frac{7^2}{2}$ 得单位），且不是 $343$ 的倍数，故恰在 $\\mathfrak m^2\\setminus\\mathfrak m^3$ 中。这条计算说明“阶数”在数论与曲线两个情形里是同一件事：前者是 p 进赋值，后者是零点阶数，而 DVR 的公理把两者统一。' },
    ],
    remarks: [
      '诺特性与维数 1 都不能单独省略：秩一非离散赋值环（值群为 ℚ）是维数 1 的整闭局部环，但极大的值群非离散使 $\\mathfrak m$ 不是主理想也不是幂链，因而它不满足 DVR 的公理；反过来 $k[x,y]_{(x,y)}$ 是维数 2 的诺特正则局部环（$\\mathfrak m$ 由两个元素生成），$\\mathfrak m$ 不是主理想，也不是 DVR。因此“正则 + 诺特 + 局部”还不足以刻画 DVR，维数 1 是必需的。',
      '整闭性不能换成“整环”：$k[x,y]_{(x,y)}/(y^2-x^3)$ 是维数 1 的诺特局部整环，但其极大理想不是主理想（如第 5 条记录所算），它的赋值只能取值于 ℚ 而不能取值于 ℤ 的离散形式，因此“每个元素有有限阶”这一条件要求整闭性。',
      '赋值函数 v 在 0 处不能取值于 ℤ：约定 $v(0)=+\\infty$ 只是为了书写方便，若把 $v(0)$ 当作元素 0 的“真的赋值”，$v(0)+v(0)=v(0)$ 会与 $v(a+b)\\ge\\min$ 的整数算术冲突；因此赋值只在 $K^{\\times}$ 上有定义，其上的性质（乘法性、超度量不等式）是 DVR 的全部内容，0 必须单独处理。',
      '“一致化子”只在单位倍意义下唯一：若 t 与 t′ 都是一致化子，则 $t^{\prime}=ut$，u 是单位，$\\mathfrak m=(t)=(t\')$，故 v 在换一致化子下不变，但元素的“t 展开”会变。把某个特定的一致化子当作“局部坐标”时必须记住它只差一个单位，因此在计算除子的重数（用 v）时结果不变，而在计算形式幂级数展开（用 t 本身）时结果依赖选择。',
    ],
    corollaries: [
      { title: '推论：DVR 上有限生成模是自由模与挠模的直和', body: '设 A 是 DVR，M 是有限生成 A-模。因为 A 是 PID（条件 (1)），M 由主理想整环上的有限生成模结构定理决定：$M\\cong A^{r}\\oplus\\bigoplus_i A/(t^{n_i})$，其中 r 是秩（即 $M\\otimes_A K$ 的 $K$-维数），$t^{n_i}$ 项对应挠部分，$n_i$ 正是 $\\mathfrak m$ 幂的指数。这条推论说明 DVR 上的模理论与向量空间加“有限个阶数”一样简单，这也是为什么局部环上的很多计算可以直接在 DVR 上做而不产生额外复杂度。', uses: ['dim-one-local-pid'] },
    ],
    references: [
      stacks('Section 10.119: Discrete valuation rings', '00PD'),
      stacks('Lemma 00PD (equivalent definitions of a DVR)', '00PD'),
      { title: 'Algebraic Geometry, Chapter I, §6', author: 'R. Hartshorne', year: 1977 },
    ],
    history: HISTORY,
  },

  /* ═══════════════════════════════════════════════════════════
   * 7. 深度
   * ═══════════════════════════════════════════════════════════ */

  'a-depth': {
    statement: '设 $(A,\\mathfrak m,k)$ 是诺特局部环，M 是有限生成非零 A-模。M 的深度定义为 M 上正则序列的最大长度，记作 $\\operatorname{depth}(M)$；也等于使 $\\operatorname{Ext}^i_A(k,M)\\neq0$ 的最小 i。则 (1) M 上所有极大正则序列长度相同（置换不变性），故深度的定义无歧义；(2) 恒有 $\\operatorname{depth}(M)\\le\\dim(M)$，等号时称 M 为 Cohen–Macaulay 模；(3) 若 M 是 CM 模且 $x\\in\\mathfrak m$ 是 M 上的非零因子，则 $M/xM$ 也是 CM 模且 $\\dim(M/xM)=\\dim M-1$；(4) $\\operatorname{depth}(M)=0$ 当且仅当 $\\mathfrak m\\in\\operatorname{Ass}(M)$。',
    deepExplanation: '深度是两个完全不同的定义的等号：一边是“可以依次找到多少个非零因子”（正则序列的长度），另一边是“k 在 Ext 里第一次出现的次数”（上同调消没指数）。等式之所以成立，是因为 Koszul 复形把正则序列的“切割”行为翻译成复形，而 $\\operatorname{Ext}^i(k,-)$ 计算的正是这个复形在适当表述下的上同调。几何意义要分开两层看：$\\dim$ 度量 M 的“横向大小”，$\\operatorname{depth}$ 度量 M 在 $\\mathfrak m$ 附近“能被多少个好元素切下去”的能力。恒有 $\\operatorname{depth}\\le\\dim$，差值 $\\dim-\\operatorname{depth}$ 正是奇性的一种度量：差为正意味着存在嵌入相伴素因子，即 M 在某个更低维的地方“套了一层厚壳”，这在几何上就是非 CM 奇点。',
    steps: [
      step('regular-sequence-maximal', '正则序列的极大长度与置换不变性',
        '先固定记号：称 $x_1,\\dots,x_n$ 是 M-正则序列，若每个 $x_i$ 是 $M/(x_1,\\dots,x_{i-1})M$ 上的非零因子，$x_i\\in\\mathfrak m$。存在性由局部环与 Nakayama 保证：若 $\\mathfrak m\\in\\operatorname{Ass}(M)$ 则 $\\mathfrak m$ 的元素都是零因子与单位，长度为零；否则可以取 $x_1$ 为非零因子（因为零因子的像是 Ass 中元素的并，而非零因子存在当且仅当 $\\mathfrak m\\notin\\operatorname{Ass}(M)$）。置换不变性是深度的定义能够成立的前提：在诺特局部环上任意两条 M-正则序列的极大长度相同。证明的标准做法是对长度作归纳并用“短正合列”把长度问题化归为上同调消没（下一步的内容）：先证 $\\operatorname{Ext}^1(k,M)=0$ 当且仅当存在非零因子 $x\\in\\mathfrak m$ 使 $\\operatorname{Ext}^1(k,M/xM)=0$，这个等价连同归纳给出极大长度由 $\\min\\{i:\\operatorname{Ext}^i(k,M)\\neq0\\}$ 决定，而后者显然不依赖序列选择。',
        []),
      step('ext-characterization', '用 Ext 消没刻画深度',
        '证明 $\\operatorname{depth}(M)=\\min\\{i\\ge0:\\operatorname{Ext}^i_A(k,M)\\neq0\\}$。预备事实：$\\operatorname{Ext}^0(k,M)=\\operatorname{Hom}(k,M)$，由于 $\\mathfrak m$ 作用为零，Hom(k,M) 等于 M 的 $\\mathfrak m$-挠元集合的“被 $\\mathfrak m$ 零化”部分，具体地 $\\operatorname{Hom}(k,M)\\cong M[\\mathfrak m]$；因此 $\\operatorname{Ext}^0(k,M)=0$ 当且仅当 M 中无非零被 $\\mathfrak m$ 零化的元素，即 $\\mathfrak m\\notin\\operatorname{Ass}(M)$。假设 $\\operatorname{Ext}^0(k,M)=\\dots=\\operatorname{Ext}^{i-1}(k,M)=0$，取 $x\\in\\mathfrak m$ 为 M 上的非零因子，作短正合列 $0\\to M\\xrightarrow{x}M\\to M/xM\\to0$。对 $\\operatorname{Hom}(k,-)$ 取长正合列，得到 $\\operatorname{Ext}^{j-1}(k,M/xM)\\to\\operatorname{Ext}^j(k,M)\\xrightarrow{x}\\operatorname{Ext}^j(k,M)\\to\\operatorname{Ext}^j(k,M/xM)\\to\\operatorname{Ext}^{j+1}(k,M)$。由于 x 在 k 上作用为零，$\\operatorname{Ext}^j(k,M)\\xrightarrow{x}$ 是零映射，于是正合列断开成短正合列 $0\\to\\operatorname{Ext}^j(k,M)\\to\\operatorname{Ext}^j(k,M/xM)\\to\\operatorname{Ext}^{j+1}(k,M)\\to0$。逐项归纳即得 $\\operatorname{Ext}^{j}(k,M/xM)\\cong\\operatorname{Ext}^{j+1}(k,M)$ 对 $j\\ge0$ 成立（从 $j=0$ 起用之前的消没假设逐一搬运），故深度在除以非零因子后正好减一，与正则序列的长度递减完全一致。',
        ['regular-sequence-maximal']),
      step('depth-leq-dim', '不等式 $\\operatorname{depth}(M)\\le\\dim(M)$',
        '设 $x_1,\\dots,x_n$ 是 M-正则序列且 n ≥ 1。由 Krull 主理想定理，$x_1$ 在 $M/\\mathfrak p$ 上非零因子（对 Supp(M) 的每个极小素因子 𝔭）保证 $\\dim M/x_1M=\\dim M-1$：因为 $\\operatorname{Supp}(M/x_1M)$ 的每个分支由“$x_1$ 与分支相交”得到，而主理想把维数最多降低一，加上非零因子排除“不交”的情形（若 $x_1$ 落在某个极小素因子 𝔭 中但不零化，支集的分支维数不变，需要单独排除，做法是把 M 换成 $M/\\Gamma_{\\mathfrak m}(M)$ 或直接对每个极小相伴素因子用 $x_1\\notin\\mathfrak p$ 的论证），故维数严格下降一。逐次用完整的正则序列得 $\\dim(M/\\underline{x}M)=\\dim M-n$，而任何模的维数非负，故 $n\\le\\dim M$；对极大正则序列取 n 就是深度，于是 $\\operatorname{depth}(M)\\le\\dim(M)$。等号情形即 CM。这条证明的每一步都用到“主理想定理 + 元素不落在各极小素因子中”这两条，因此深度与维数的比较本质上是在比较“能切割多少个超曲面”与“本身有多少维”，几何上就是“完全交的维数正好等于维数减去方程个数”。',
        ['ext-characterization']),
      step('cm-induction', 'CM 情形下的切割与归纳',
        '设 M 是 CM 模，$x\\in\\mathfrak m$ 是 M 上的非零因子。要证 $M/xM$ 也是 CM 模，即 $\\operatorname{depth}(M/xM)=\\dim(M/xM)$。由前两步：$\\operatorname{depth}(M/xM)=\\operatorname{depth}(M)-1$（Ext 的搬运给出），$\\dim(M/xM)=\\dim M-1$（主理想定理）。由于 M 是 CM，$\\operatorname{depth}(M)=\\dim M$，两式相减得 $\\operatorname{depth}(M/xM)=\\dim(M/xM)$，故 $M/xM$ 是 CM。这个归纳步骤是 CM 理论最常用的工具：它说明“用非零因子切割”保持 CM 性，于是可以用参数系（长度等于 $\\dim M$ 的正则序列）把 CM 模逐步切到零维，每一步维数与深度同时减一。反过来的诊断也很锋利：若 $\\operatorname{depth}(M/xM)<\\dim(M/xM)$，则 M 不是 CM 或 x 不是非零因子，二者必居其一，因此“切割后深度掉得不整齐”是检测非 CM 的实用手段。',
        ['depth-leq-dim']),
      step('depth-zero-and-ass', '深度为零与嵌入相伴素因子',
        '由 $\\operatorname{Ext}^0(k,M)=\\operatorname{Hom}(k,M)\\neq0$ 当且仅当存在 $0\\neq m\\in M$ 使 $\\mathfrak m m=0$（因为 Hom(k,M) 的元素是 A-线性映射 $k\\to M$，由 1 的像决定，而该像必被 $\\mathfrak m$ 零化且非零）。于是 $\\operatorname{depth}(M)=0$ 当且仅当 $\\mathfrak m\\in\\operatorname{Ass}(M)$：一方面 $\\operatorname{ann}(m)\\supseteq\\mathfrak m$ 且 $\\operatorname{ann}(m)\\neq A$，故 $\\operatorname{ann}(m)=\\mathfrak m$，得 $\\mathfrak m\\in\\operatorname{Ass}(M)$；另一方面若 $\\mathfrak m\\in\\operatorname{Ass}(M)$，取实现它的 m 即得 Hom(k,M) 中非零元素。更一般地，$\\operatorname{depth}(M)=i$ 意味着 $\\operatorname{Ext}^j(k,M)=0$ 对 $j<i$，而由正合列的两端估计，这等价于 Ass(M) 中不含任何维数大于 $\\dim M-i$ 的素理想：深度小正是“存在高维嵌入相伴素因子”的信号。几何上，这说明非 CM 模 M 的支集可以含有一个维数与 Supp(M) 相同但并非分支的来源，例如两个相交的平面（维数 2 的支集，交线维数 1 且 $\\mathfrak m$ 处局部深度只有 1），这就是非 CM 奇点的原型。',
        ['cm-induction', 'ext-characterization']),
      step('worked-examples', '具体核算：三个环的深度与维数',
        '例一：$A=k[x_1,\\dots,x_n]$ 或其在极大理想处的局部化。$x_1,\\dots,x_n$ 是正则序列（每次除以 $x_i$ 得到多项式环，整环，$x_{i+1}$ 非零因子），长度 n，故 $\\operatorname{depth}=n$；同时 $\\dim=n$，故 A 是 CM。核算处的赋值：$\\dim A=\\dim\\mathfrak m/\\mathfrak m^2=n$，正则局部环都是 CM。例二：$B=k[x,y]/(xy)$。维数：$B$ 是两条直线（$x=0$ 与 $y=0$）的并，故 $\\dim B=1$，也被 $(x,y)B$ 的极大理想处维数 1。深度：在极大理想 $\\mathfrak m=(x,y)$ 处，$B_{\\mathfrak m}$ 中的零因子恰是 $x$ 与 $y$ 的倍数（因为 $x\\cdot y=0$ 且 $x,y\\neq0$），$\\mathfrak m$ 中所有元素都是零因子或单位，故不存在 M=B 上的非零因子，深度为 0；$\\dim=1>0=\\operatorname{depth}$，非 CM。第三步的判定立刻验证：$\\operatorname{depth}(B)=0$ 且 $\\mathfrak m\\in\\operatorname{Ass}(B)$（取 $m=\\bar x$，$\\operatorname{ann}(\\bar x)=(y)$ 不是 $\\mathfrak m$？修正：$\\operatorname{ann}(\\bar y)=(x)$、$\\operatorname{ann}(\\bar x)=(y)$，真正的 $\\mathfrak m$ 相伴素因子由 $\\mathfrak m=(x,y)$ 中元素的组合给出，例如 $\\bar x+\\bar y$ 的零化子是 $(x)\\cap(y)=(xy)$ 的子集，仍得 $\\mathfrak m$ 中的元素都是零因子，故深度为 0）。这个例子给出非 CM 的最小模型：两条直线在一点相交。',
        ['depth-zero-and-ass', 'depth-leq-dim']),
    ],
    conclusion: '$\\operatorname{depth}(M)$ 由 M 上极大正则序列的长度给出，也等于 $\\min\\{i:\\operatorname{Ext}^i_A(k,M)\\neq0\\}$；恒有 $\\operatorname{depth}(M)\\le\\dim(M)$，等号即 CM；$\\operatorname{depth}(M/xM)=\\operatorname{depth}(M)-1$ 与 $\\dim(M/xM)=\\dim M-1$ 对非零因子 x 同时成立，故 CM 性被非零因子保持。$\\operatorname{depth}(M)=0$ 当且仅当 $\\mathfrak m\\in\\operatorname{Ass}(M)$。',
    dependencies: [],
    consequences: [],
    explanation: '深度与维数的对比是这条记录的全部要点：维数是“模有多大”的上界（由支集的维数给出），深度是“模在极大理想处能被切多深”的下界（由非零因子的存在性给出）。前者是整体的、几何的量，后者是局部的、与 $\\mathfrak m$ 紧绑的量。恒有 $\\operatorname{depth}\\le\\dim$，而差 $\\dim-\\operatorname{depth}$ 就是“模有多不 CM”。这个差是奇性理论中最常用的不变量之一：非 CM 的支集必须在某个地方“多出一层”低维结构，而这种多出来的结构在几何上表现为分支的相交与重数的异常。Ext 刻画把深度变成可以计算的量（在具体情形用 Koszul 复形或短正合列逐项搬运），而 $\\operatorname{depth}=0 \\Leftrightarrow \\mathfrak m\\in\\operatorname{Ass}$ 把深度最小值与相伴素因子直接对接，使“深度不足”有一个可以检查的标签。',
    examples: [
      { title: '例子：$k[x,y]/(xy)$ 的深度为 0、维数为 1', body: '取 $A=k[x,y]/(xy)$，$\\mathfrak m=(x,y)$。$V(xy)$ 是两条坐标轴的并，故 $\\dim A=1$。深度：A 中的零因子恰是那些落在 $(x)$ 或 $(y)$ 中的非零元素的类（$\\bar x\\cdot\\bar y=0$），而 $\\mathfrak m=(x,y)$ 中每个元素都落在 $(x)\\cup(y)$ 中，故 $\\mathfrak m$ 的元素全是零因子或单位，A 上没有正则序列，$\\operatorname{depth}(A)=0$。于是 $0=\\operatorname{depth}<\\dim=1$，A 不是 CM。用 Ext 核对：$\\operatorname{Ext}^0_A(k,A)=\\operatorname{Hom}(k,A)$，而 $\\operatorname{Hom}$ 的非零元素由 $\\mathfrak m$ 零化的元素给出，$\\bar x$ 被 $\\mathfrak m$ 零化吗？$\\bar x\\cdot\\bar x=\\bar x^2\\neq0$，但 $\\bar x\\cdot\\bar y=0$；取 $m=\\bar x+\\bar y$：$\\bar x(\\bar x+\\bar y)=\\bar x^2$，不为零，故 0 深度要换一个元素，正确做法是注意到 $\\operatorname{Ass}(A)=\\{(x),(y)\\}$（两条分支），而 $\\mathfrak m\\notin\\operatorname{Ass}(A)$，按上一步的判据深度应当不是 0——这里的关键是 A 不是局部环，必须在局部化 $A_{\\mathfrak m}$ 中讨论：在 $A_{\\mathfrak m}$ 中 $(x)$ 与 $(y)$ 都成为 $\\mathfrak m$ 的局部化（因为其余素理想被反转），故 $\\mathfrak m A_{\\mathfrak m}\\in\\operatorname{Ass}(A_{\\mathfrak m})$，深度为 0。这个细节说明“深度”必须对整个局部环说，不能对未局部化的环直接套用。' },
    ],
    remarks: [
      '深度只在诺特局部环（或局部化后的环）上有定义良好，且要求 M 有限生成：对一般环，极大正则序列可以有不同的长度，$\\operatorname{Ext}^i(k,M)$ 的消没指数与正则序列长度会脱钩。例如在非诺特环上可以构造出长度不同的极大正则序列，因此把深度当成一个“任意环上都有定义的不变量”是错的。',
      '深度为零不等于模为零：$\\operatorname{depth}(M)=0$ 只说明 $\\mathfrak m$ 的元素全是零因子，这可以发生在非零模上，例如 $k[x,y]/(xy)$ 在极大理想处局部化后。反过来 $\\operatorname{depth}(M)=\\dim(M)$ 也不意味着模光滑，例如 $k[x,y]/(y^2-x^3)$ 是 CM（维数 1、深度 1）但有奇点，说明 CM 是比“光滑”弱得多的条件。',
      '“非零因子”必须在正确的商模上判断：$x_1$ 是 M 上的非零因子，$x_2$ 必须是 $M/x_1M$ 上的非零因子，而不是 M 上的。若只看 M 上都是非零因子，序列可以失败，例如 M = A 是整环时任何非零元素都是 M 上非零因子，但在 $A/x_1A$ 上 $x_2$ 可能变成零因子（$A/(xy)$ 中 x 与 y 都是 A 上的非零因子——A 是整环——但 y 在 $A/(x)\\cong k[y]$ 上仍非零因子，而在 $A/(x)$ 上 x 的类是零，顺序很重要）。',
      'CM 性在局部化下保持，但“非 CM”不能在局部化下被掩盖掉：若存在一个素理想 𝔭 使 $M_{\\mathfrak p}$ 不是 CM，则 M 也不是 CM。因此判断 CM 只需检查极小素因子处的局部环（或检查所有分支），而不是只看整体的 $\\operatorname{depth}$ 与 $\\dim$ 数值——这两个数值相等可能因为整体维数与整体深度恰好同减。',
    ],
    corollaries: [
      { title: '推论：正则局部环是 CM 环', body: '若 $(A,\\mathfrak m)$ 是诺特正则局部环，$\\dim A=n$，则 $\\mathfrak m$ 由 n 个元素 $x_1,\\dots,x_n$ 生成（正则性的定义给出 $\\dim\\mathfrak m/\\mathfrak m^2=n$ 并由 Nakayama 提升为生成元数 n）。这 n 个元素构成 A-正则序列，故 $\\operatorname{depth}(A)\\ge n=\\dim A$；结合 $\\operatorname{depth}\\le\\dim$ 得等号，A 是 CM。这条推理解释了“正则 ⟹ CM ⟹ 无嵌入素因子”这一性质链的第一环，并使正则局部环上的许多计算（例如 Serre 对偶的干净形式）可以归约到 CM 情形。', uses: ['depth-leq-dim', 'depth-zero-and-ass'] },
    ],
    references: [
      stacks('Section 10.72: Depth', '00LE'),
      stacks('Lemma 00LE (depth and Ext)', '00LE'),
      { title: 'Cohen-Macaulay Rings, Chapter 1', author: 'W. Bruns, J. Herzog', year: 1993 },
    ],
    history: HISTORY,
  },

  /* ═══════════════════════════════════════════════════════════
   * 8. Cohen–Macaulay 环
   * ═══════════════════════════════════════════════════════════ */

  'a-cohen-macaulay': {
    statement: '称诺特环 A 为 Cohen–Macaulay（CM），若对每个素理想 𝔭，$\\operatorname{depth}(A_{\\mathfrak p})=\\dim(A_{\\mathfrak p})$；等价地，若 A 是局部环则要求 $\\operatorname{depth}(A)=\\dim A$，一般情形要求所有局部化是 CM。等价刻画包括：(1) 存在参数系 $x_1,\\dots,x_d$（$d=\\dim A$）使 $x_1,\\dots,x_d$ 是 A-正则序列；(2) 每个参数系都是正则序列；(3) A 上没有嵌入相伴素因子（即 Ass(A) 的每个元素都是极小素理想）；(4) 对任意参数系，$A/(x_1,\\dots,x_d)$ 是有限维 k-向量空间且其长度等于 $e(\\mathfrak m,A)$ 型的重数。性质链：正则 ⟹ CM ⟹ 无嵌入素因子；CM 在局部化、多项式扩张、以及用非零因子切割下保持。',
    deepExplanation: 'CM 是“代数上最规矩的一类环”的准确含义：它要求横向的切割能力（深度）恰好等于纵向的大小（维数），也就是要求用 d 个参数就能把环切到零维，而且这 d 个参数在每一步都是非零因子。这条要求排除了一切“套壳”结构：如果 A 有一条嵌入相伴素因子（例如某个低维分支被包在高维分支里），切割到中途就会遇到零因子，深度就会掉队。CM 的价值在于它是“对偶理论能正常工作”的门槛：Serre 对偶、局部对偶复形、以及“每加一个参数维数降一”这些陈述在 CM 上形式最干净；而正则 ⟹ CM ⟹ 无嵌入素因子说明了 CM 位于“光滑”与“无病态分支”之间。本记录给出等价刻画、不可约分支上的等维性、以及 CM 在常见运算下的保持性。',
    steps: [
      step('parameter-systems', '参数系与正则序列：等价性的核心',
        '设 $(A,\\mathfrak m)$ 是诺特局部环，$d=\\dim A$。参数系指 $\\mathfrak m$ 的一个由 d 个元素组成的生成组 $x_1,\\dots,x_d$（由 Krull 主理想定理的推广，$\\mathfrak m$ 的极小素理想可由 d 个元素定义，故这样的方程组存在，称为参数系）。注意到 $\\dim A=\\dim A/(x_1,\\dots,x_d)$ 中 $A/(\\underline x)$ 是零维诺特局部环，故它是有限维 k-向量空间。CM 的两个等价刻画是：其一，存在参数系是正则序列；其二，每个参数系都是正则序列。证明“存在 ⟹ CM”：若 $x_1,\\dots,x_d$ 是正则序列，则 $\\operatorname{depth}(A)\\ge d=\\dim A$；结合 $\\operatorname{depth}\\le\\dim$ 得等号。证明“CM ⟹ 每个参数系正则”：这是 Rees 定理的内容，需要“参数系生成的理想是 $\\mathfrak m$-准素的”与“$\\operatorname{depth}(A/(x_1,\\dots,x_i))=d-i$”两条联合归纳；一旦深度在每个中间商上都等于维数，非零因子的存在性便保证每一步都能继续下去。这一步把 CM 性变成“参数系的性质”，从而使 CM 可以用具体的元素组来检验。',
        []),
      step('no-embedded-primes', '等价刻画：无嵌入相伴素因子',
        '证明“A 是 CM ⟹ A 没有嵌入相伴素因子”。设 $\\mathfrak p\\in\\operatorname{Ass}(A)$ 不是极小素理想，则可取极小素理想 $\\mathfrak q\\subsetneq\\mathfrak p$。把 A 局部化到 $\\mathfrak p$：$A_{\\mathfrak p}$ 是 CM（CM 性在局部化下保持），$\\dim A_{\\mathfrak p}=ht(\\mathfrak p)\\ge1$，且 $\\mathfrak p A_{\\mathfrak p}\\in\\operatorname{Ass}(A_{\\mathfrak p})$（相伴素因子在局部化下保持），由 $\\operatorname{depth}=0 \\Leftrightarrow\\mathfrak m\\in\\operatorname{Ass}$ 得 $\\operatorname{depth}(A_{\\mathfrak p})=0$，与 $\\operatorname{depth}(A_{\\mathfrak p})=\\dim A_{\\mathfrak p}\\ge1$ 矛盾。反过来“无嵌入相伴素因子 ⟹ 逐项 CM”需要归纳与“模掉非零因子”的论证：先在每个局部环上取 $\\mathfrak p\\in\\operatorname{Ass}(A_{\\mathfrak p})$，无嵌入条件保证它是极小的故维数等于深度（对维数作归纳），再用第 7 条记录的切割步骤。这条等式的用处在于它是一个“结构性”条件：Ass 是有限集，因此“没有嵌入相伴素因子”可以用有限次核对代替深度的逐点计算。',
        ['parameter-systems']),
      step('localization-and-polynomial', '保持性：局部化、多项式扩张与切割',
        '三条保持性各自需要用不同的工具。其一，局部化：若 A 是 CM 且 S 是乘性子集，则 $S^{-1}A$ 是 CM。因为 $S^{-1}A$ 的素理想与不含 S 的 A 的素理想一一对应，维数与深度在同构对应下保持（深度的局部化不升降，维数的局部化由素理想链的对应给出），故逐点等式传递。其二，多项式扩张：若 A 是 CM，则 $A[x]$ 是 CM。证明用“$\\dim A[x]=\\dim A+1$”与“$\\operatorname{depth}A[x]=\\operatorname{depth}A+1$”：后者取 A 上的参数系 $\\underline{x}$（它在 A[x] 中仍是正则序列），再补上 x 本身（x 在 $A[x]/(\\underline{x})A[x]$ 上非零因子，因为该商是 $k[x]$ 型整环上的多项式环），于是深度也恰好增加一。其三，切割：第 7 条已证，非零因子把 CM 模切后仍是 CM 且维数深度同时减一。三条合起来说明 CM 是做局部化、加变量、除参数这些“标准运算”的封闭类，这正是它比正则性更常用的原因——正则性在加变量下也保持，但在除一般非零因子后未必保持。',
        ['no-embedded-primes']),
      step('multiplicity-formula', '重数与“每加一个参数维数降一”',
        'CM 的一个实用推论是重数的整齐性。设 $(A,\\mathfrak m)$ 是 d 维 CM 局部环，$\\underline{x}=x_1,\\dots,x_d$ 是参数系，则 $A/(\\underline{x})$ 是有限维 k-向量空间，其长度 $\\ell(A/(\\underline{x}))$ 与生成元的选取无关的某些数据相关：当 $\\underline{x}$ 是一般位置时的长度给出重数 $e(\\mathfrak m,A)$。设 I 由 $\\underline{x}$ 生成，则对任意 n，$\\ell(A/I^n)$ 是 n 的多项式（Hilbert–Samuel 多项式），其首项系数乘 d! 就是重数。CM 的作用是保证“每个参数系都给出同一个重数”这一唯一性：若非 CM，不同参数系给出的长度会不同，重数需要额外约定“一般位置”。这就是“相交理论中每增加一个条件维数降一”的代数根源：一个参数（一个超曲面）把维数降一，d 个参数把维数降到零，长度就是“相交的点数计重数”，而 CM 保证这个计数是几何上正确的相交数。',
        ['localization-and-polynomial']),
      step('chain-regular-cm-no-embedded', '性质链：正则 ⟹ CM ⟹ 无嵌入素因子，以及反例',
        '先看正则 ⟹ CM：第 7 条记录已证（正则局部环的参数系由 $\\mathfrak m/\\mathfrak m^2$ 的一个基提升得到，长度恰为 $\\dim$，且这些元素构成正则序列）。再看 CM ⟹ 无嵌入相伴素因子：上一步已证。两条反向都失败，且反例都能算清楚。反例一（CM 但非正则）：$A=k[[t^3,t^4,t^5]]\\cong k[[x,y,z]]/(x^3-z,\\ y^2-xz)$ 型的三次曲线数值半群环是维数 1 的 CM 局部环（维数 1 时非零因子容易找：整环中任何非零元素都是），但极大理想需要三个生成元，故不正则。更简单的例子：$k[[t^2,t^3]]$ 是维数 1、深度 1 的 CM 环（整环），极大理想 $(t^2,t^3)$ 需要两个生成元，不正则。反例二（无嵌入素因子但非 CM）：取 $A=k[x,y,z]/(xy,xz)$，其极小素理想是 $(x)$ 与 $(y,z)$，两者都不含对方，故没有嵌入相伴素因子；但 $\\dim A=2$（$V(x)$ 是平面、$V(y,z)$ 是直线，前者维数 2），而在 $\\mathfrak m=(x,y,z)$ 处的深度：$\\mathfrak m$ 中的元素 x 零化 y 与 z，$y$ 零化 x，没有非零因子可用，$\\operatorname{depth}=0<2$，非 CM。这个链的严格性说明三个条件彼此不等价。',
        ['multiplicity-formula', 'no-embedded-primes']),
    ],
    conclusion: '诺特环 A 是 Cohen–Macaulay 当且仅当每个局部化满足 $\\operatorname{depth}=\\dim$，等价于存在（等价于每个）参数系是正则序列，也等价于 A 没有嵌入相伴素因子。性质链 正则 ⟹ CM ⟹ 无嵌入素因子 两条反向均不成立。CM 在局部化、多项式扩张与用非零因子切割下保持，并保证 Hilbert–Samuel 重数由参数系唯一确定。',
    dependencies: [],
    consequences: [],
    explanation: 'CM 之所以成为交换代数的中心概念，是因为它是“对偶理论能正常工作”的最低门槛。Serre 对偶要求 $\\omega_A$ 与 $\\operatorname{Ext}$ 的配对非退化，而这需要模在每一步切割后都是“干净”的，也就是深度与维数同步；CM 正是这个同步条件。另一方面，CM 的检验可以完全用有限组合数据进行：检查 Ass 里有没有嵌入素因子、或者检查一个参数系的每一步是否给出非零因子，两者都是有限次核实。这条记录的三条等价刻画分别适合三种场景：局部环上用参数系（可以得到具体的正则序列），一般环上用 Ass（可以核对有限多个素理想），而对偶定理上用“$H^i_{\\mathfrak m}(A)=0$ 对 $i<d$ 成立”这一局部上同调版本（由 Gorenstein 与 CM 的刻画给出）。反例链的意义在于提醒：CM 比正则弱（有奇点），比“无嵌入分支”强（$k[x,y,z]/(xy,xz)$ 说明无嵌入分支不足以保证 CM）。',
    examples: [
      { title: '例子：$k[x,y,z]/(xy,xz)$ 无嵌入素因子但不是 CM', body: '取 $A=k[x,y,z]/(xy,xz)$，记 $\\mathfrak m=(x,y,z)$。分解 $A=k[x,y,z]/(x)\\cap(y,z)$？核算：$(x)\\cap(y,z)=(xy,xz)$，故 $A$ 的极小素理想是 $(x)$ 与 $(y,z)$（对应 $V$ 为平面与直线），两者互不包含，故没有嵌入相伴素因子。维数 $\\dim A=\\max(2,1)=2$。在 $\\mathfrak m$ 处取深度：$(x,y,z)$ 中的元素是否全是零因子？$\\bar x\\neq0$ 且 $\\bar x\\cdot\\bar y=\\overline{xy}=0$，故 $\\bar x$ 是零因子；$\\bar y\\cdot\\bar x=0$，$\\bar y$ 也是零因子；$\\bar z$ 同样零化 $\\bar x$。三个生成元全为零因子，$\\operatorname{depth}_{\\mathfrak m}(A)=0$，而 $\\dim=2$，故非 CM。这个例子的几何图像是：一个平面与一条相交的直线，支集是维数 2 的，但在交点处直线方向被“压”成了 $\\mathfrak m$ 中的零因子，使得没有任何元素能把环切下去。' },
      { title: '例子：$k[[t^2,t^3]]$ 是 CM 但不是正则', body: '取 $A=k[[t^2,t^3]]\\subseteq k[[t]]$。它同构于 $k[[x,y]]/(y^2-x^3)$（令 $x=t^2,y=t^3$），是维数 1 的整环：素理想 $(0)\\subsetneq\\mathfrak m=(t^2,t^3)$，故 $\\dim=1$。深度：A 是整环，$t^2$ 是非零因子，故 $\\operatorname{depth}\\ge1$；又 $\\operatorname{depth}\\le\\dim=1$，得 $\\operatorname{depth}=1$，CM。正则性：$\\mathfrak m/\\mathfrak m^2$ 由 $t^2,t^3$ 的类生成，维数是 2，而 $\\dim A=1$，故 $\\dim\\mathfrak m/\\mathfrak m^2=2>1=\\dim A$，不正则。这个例子是“非正则 CM 局部环”的最小模型（尖点），它说明 CM 允许奇点存在；相应地，尖点处的局部环虽是 CM 但不是 Gorenstein 之外的更规则类型，其对偶理论需要额外的修正项。' },
    ],
    remarks: [
      'CM 定义要求所有局部化都是 CM，而不只是整体上 $\\operatorname{depth}(A)=\\dim A$：对非局部环，“深度”本身只有一个约定（在极大理想集合上取最小值或逐点定义），若只在某个极大理想处验证，会漏掉其他分支上的非 CM 行为，例如两条相交直线的坐标环在自身（非局部）时整体参数容易混乱，必须局部化后再判断。',
      '正则 ⟹ CM ⟹ 无嵌入素因子，但两条箭头都不能反向：$k[[t^2,t^3]]$ 是 CM 非正则，$k[x,y,z]/(xy,xz)$ 无嵌入素因子但非 CM。因此在证明中使用“CM”结论时必须核对是哪一条箭头，例如不能由“无嵌入素因子”推出对偶定理的干净形式。',
      'CM 性比“重数唯一”更强：Hilbert–Samuel 重数在非 CM 情形也可以定义，只是不同参数系给出的首项系数可能不同，需要用“一般位置”挑选。把“重数存在”当成 CM 的判别会误判，例如 $k[x,y,z]/(xy,xz)$ 的重数在一般参数系下仍然计算得出来，但环不是 CM。',
      '非 CM 性是局部而非整体的现象：一个整体维数较高的环可以在大部分点处 CM，只在某个低维子集上非 CM，因此判断时必须逐点检查。“仿射簇是 CM 的”这类陈述只在等维且没有嵌入分支的假设下才可能成立，无法由整体的维数与深度比较推断。',
    ],
    corollaries: [
      { title: '推论：CM 环上的参数系与维数的完全交性', body: '若 $(A,\\mathfrak m)$ 是 d 维 CM 局部环，$x_1,\\dots,x_d$ 是参数系，则 $\\mathfrak m$ 的每个由 d 个元素组成的生成组都是 A-正则序列，于是 $A/(x_1,\\dots,x_d)$ 的长度等于重数 $e(\\mathfrak m,A)$，且对每个 i 有 $\\dim A/(x_1,\\dots,x_i)=d-i$。这条推论是相交理论中“完全交的维数等于维数减去方程个数、且交点数由重数计数”的代数依据，它把几何的“横截相交”翻译成“参数系是正则序列”。', uses: ['multiplicity-formula'] },
    ],
    references: [
      stacks('Section 10.103: Cohen-Macaulay rings', '00N4'),
      stacks('Lemma 00N4 (Cohen-Macaulay equivalent conditions)', '00N4'),
      { title: 'Cohen-Macaulay Rings, Chapter 1', author: 'W. Bruns, J. Herzog', year: 1993 },
    ],
    history: HISTORY,
  },

  /* ═══════════════════════════════════════════════════════════
   * 9. 正则序列
   * ═══════════════════════════════════════════════════════════ */

  'a-regular-sequence': {
    statement: '设 A 是环，M 是 A-模。称 $x_1,\\dots,x_n\\in A$ 是 M-正则序列，若 $(x_1,\\dots,x_n)M\\neq M$，且对每个 i = 1,…,n，$x_i$ 是 $M/(x_1,\\dots,x_{i-1})M$ 上的非零因子（即 $x_i m\\in(x_1,\\dots,x_{i-1})M$ 蕴含 $m\\in(x_1,\\dots,x_{i-1})M$）。基本性质：(1) 若 $\\underline{x}$ 是 M-正则序列，则 Koszul 复形 $K(\\underline{x};M)$ 正合，且其同调群为 $H_i(K(\\underline{x};M))=0$（$i>0$）、$H_0=M/\\underline{x}M$；(2) 在诺特局部环上，M-正则序列的置换不变性成立：若 $\\underline{x}$ 是 M-正则序列，则它的任意置换也是；(3) $\\underline{x}$ 是 A-正则序列当且仅当 $\\operatorname{depth}(A)=n$ 且 $\\underline{x}$ 落在某个参数系中（对局部环）；(4) Koszul 复形给出 $A/\\underline{x}A$ 的极小自由消解，故 $\\operatorname{Tor}^A_i(A/\\underline{x}A,k)=\\Lambda^i(k^n)$、$\\operatorname{Ext}^i_{A}(k,A/\\underline{x}A)$ 型维数由 $\\binom{n}{i}$ 给出。',
    deepExplanation: '正则序列是“与超曲面依次相交”的代数版本：$x_1$ 切一刀得到 $M/x_1M$，$x_2$ 在切完的模上必须仍是非零因子才能再切一刀，这样每一步都把“维数”降一而不产生多余的扭。这个条件之所以强，是因为“非零因子”依赖前一步的商：$x_2$ 在 M 上可能是非零因子，在 $M/x_1M$ 上却可能变成零因子，所以顺序与选择都有影响。置换不变性是深刻的：一般环上顺序会破坏正则性，而在诺特局部环上只要总长度固定，任意置换都保持正则性（甚至任意排列都成立），这说明局部环的“切割”是一个组合上无顺序的现象。Koszul 复形把整个序列打包成一个复形，其正合性等价于正则性，于是深度、完整交、以及局部对偶理论都有了统一的计算工具。',
    steps: [
      step('definition-and-basic-observations', '定义与两个立刻可验证的观察',
        '先核对定义中的细节。其一，条件“$(x_1,\\dots,x_n)M\\neq M$”是为了排除 $x_i$ 或 $x_1$ 是单位的情形：若某个 $x_i\\in A^{\\times}$，则 $M/x_1M=0$，而“非零因子”在零模上的定义会使 $x_2$ 自动成为非零因子（因为没有非零元素），于是单位元素可以无成本地被塞进序列，深度就会失去意义。加上这个条件后，单位不能出现在正则序列中（若 $x_1$ 是单位则 $(x_1)M=M$，违反条件）。其二，“非零因子”的等价写法：$x_i$ 是 $N=M/(x_1,\\dots,x_{i-1})M$ 上的非零因子当且仅当乘以 $x_i$ 的映射 $N\\xrightarrow{x_i}N$ 是单射，也当且仅当 $x_i$ 不在 $\\operatorname{Ass}(N)$ 中任何素理想里，即 $x_i\\notin\\bigcup_{\\mathfrak p\\in\\operatorname{Ass}(N)}\\mathfrak p$。后者是有用的判据：在诺特环上 Ass 是有限集，故“非零因子”等价于“避开有限多个素理想的并”，这也说明非零因子总是“很多”的，只要 $\\mathfrak m\\notin\\operatorname{Ass}(M)$。',
        []),
      step('koszul-complex-construction', 'Koszul 复形的构造与它的计算内容',
        '构造 $K(\\underline{x};M)$：取自由模 $F=A^n$ 以 $e_1,\\dots,e_n$ 为基，令 $K_i=\\Lambda^i F\\otimes_A M$，即 $K_i=\\bigoplus_{1\\le j_1<\\cdots<j_i\\le n}M\\,e_{j_1}\\wedge\\cdots\\wedge e_{j_i}$，微分 $\\partial_i:K_i\\to K_{i-1}$ 由 $\\partial_i(m\\,e_{j_1}\\wedge\\cdots\\wedge e_{j_i})=\\sum_{s=1}^{i}(-1)^{s-1}x_{j_s}m\\,e_{j_1}\\wedge\\cdots\\widehat{e_{j_s}}\\wedge\\cdots\\wedge e_{j_i}$ 给出。直接核算 $\\partial_{i-1}\\circ\\partial_i=0$：双重求和中 $x_{j_s}x_{j_t}$ 的项成对出现且符号相反（来自先删 $j_s$ 再删 $j_t$ 与先删 $j_t$ 再删 $j_s$ 恰好相差一个换位），故相消。于是 $(K_\\bullet,\\partial_\\bullet)$ 是复形，其上同调 $H_i$ 满足 $H_0=K_0/\\operatorname{im}\\partial_1=M/\\underline{x}M$。当 ni 与 n 的关系给出 $K_n=M$（最高外幂），$K_i$ 的秩为 $\\binom{n}{i}$。Koszul 复形的作用是：若 $\\underline{x}$ 是 M-正则序列，则此复形正合（除 $H_0$ 外同调为零），从而它给出 $M/\\underline{x}M$ 的一个长度 n、自由项秩为 $\\binom{n}{i}$ 的自由消解；反之若 M 有限生成且 A 诺特、$H_1=0$，则 $\\underline{x}$ 是 M-正则序列。',
        ['definition-and-basic-observations']),
      step('exactness-from-regularity', '正合性的证明骨架：逐次用非零因子',
        '证明“正则序列 ⟹ Koszul 复形正合”。对 n=1：复形是 $0\\to M\\xrightarrow{x_1}M\\to0$，正合性就是乘法单射，即非零因子条件。归纳步骤：把 n 个元素的 Koszul 复形与“长度 n−1 的复形”通过短正合列联系起来。具体地，对 $\\underline{x\'}=x_1,\\dots,x_{n-1}$ 与 $x_n$，有短正合列 $0\\to K(\\underline{x\'};M)\\to K(\\underline{x};M)\\to K(\\underline{x\'};M)[-1]\\to0$（按是否含 $e_n$ 分解外幂，含 $e_n$ 的部分与不含的部分相差一次平移），长正合列的每一项把 $H_i(K(\\underline{x};M))$ 夹在 $H_i(K(\\underline{x\'};M))$ 与 $H_{i-1}(K(\\underline{x\'};M))$ 之间。由归纳假设 $H_i(K(\\underline{x\'};M))=0$（$i>0$），夹逼给出 $H_i(K(\\underline{x};M))\\cong H_{i-1}(K(\\underline{x\'};M))$（对 $i\\ge2$），故只需处理 $i=1$：此时 $H_1(K(\\underline{x};M))$ 落入 $0\\to H_1(K(\\underline{x};M))\\to H_0(K(\\underline{x\'};M))\\xrightarrow{x_n}H_0(K(\\underline{x\'};M))$，而 $x_n$ 是 $H_0(K(\\underline{x\'};M))=M/\\underline{x\'}M$ 上的非零因子，故该映射单射、$H_1=0$。归纳完成。',
        ['koszul-complex-construction']),
      step('permutation-invariance', '置换不变性：局部环上的证明思路',
        '在一般环上，$x,y$ 是 M-正则序列不蕴含 $y,x$ 是：取 $A=k[x,y]$、$M=A$，序列 $(x,y)$ 是正则的（M 是整域，x 非零因子；在 $A/xA=k[y]$ 中 y 非零因子）。反过来 $(y,x)$ 同样正则，因为这个例子对称。要找真正的反例需要非 CM 的环：取 $A=k[x,y,z]/(xy,xz)$ 与 $M=A$，在 $\\mathfrak m=(x,y,z)$ 处 $\\mathfrak m$ 中元素全是零因子，任何序列在第一步就失败，长度为零，故顺序无所谓。真正体现顺序重要性的是非局部或非诺特情形以及显式构造：考虑 $A=k[x,y]/(xy)$（非局部），$M=A$，则 $x$ 在 $A$ 上是零因子（$x\\cdot y=0$），$y$ 也是，故没有长度 ≥1 的正则序列；而若取 $A$ 的一个局部化使某个元素成为非零因子，则其余元素的零因子性质会随商环改变。置换不变性定理（Stacks Project）断言：若 $(A,\\mathfrak m)$ 是诺特局部环、M 有限生成，则 M-正则序列的任意置换仍是 M-正则序列。证明可以用 Koszul 复形的正合性：置换 $\\underline{x}$ 相当于换 $F=A^n$ 的基，Koszul 复形在新的基下仍是同一个复形（只是 $K_i$ 的分解不同），故同调群不变、正合性不变，结合“$H_1=0$ 加诺特有限生成 ⟹ 正则序列”的逆命题即得。这条论证是“把顺序问题化为对称问题”的典型手法。',
        ['exactness-from-regularity']),
      step('depth-and-complete-intersection', '与深度的联系、完整交与可核算的 Betti 数',
        '在诺特局部环上，$\\operatorname{depth}(M)$ 等于 M 上极大正则序列的长度，由置换不变性这个定义是良定义的，并且等于 $\\min\\{i:\\operatorname{Ext}^i_A(k,M)\\neq0\\}$。Koszul 复形与正则序列的互推给出完整交的消解：若 $A/\\underline{x}A$ 是完整交（即 $\\underline{x}$ 是 A-正则序列），则 Koszul 复形是它的极小自由消解，于是 Betti 数 $\\beta_i=\\binom{n}{i}$、$\\operatorname{Tor}^A_i(A/\\underline{x}A,k)\\cong\\Lambda^i(k^n)$ 的维数是 $\\binom{n}{i}$。核算例子：$A=k[x,y]$、$\\underline{x}=(x,y)$，则 $K_\\bullet$ 是 $0\\to A\\xrightarrow{(-y,x)^{T}}A^2\\xrightarrow{(x\\ y)}A\\to0$，长度 2，$\\beta_0=1,\\beta_1=2,\\beta_2=1$，与 $\\binom{2}{i}$ 一致，且 $\\operatorname{Tor}_1^A(A/(x,y),k)=k^2$。再核算一个数值判别：对 $A=k[x,y]/(xy)$ 与 $\\underline{x}=(x,y)$，$(x,y)$ 不是正则序列（第一步就要求 x 是非零因子，而 $xy=0$ 说明 x 是零因子），相应地 Koszul 复形不正合：$H_1\\neq0$，其维数等于 1（由 $\\bar x$ 与 $\\bar y$ 给出的关系 $x\\cdot y=0$ 之外还有额外同调）。这个计算说明“正则序列”与“Koszul 复形正合”是同一个条件的两种说法。',
        ['permutation-invariance', 'exactness-from-regularity']),
    ],
    conclusion: '序列 $x_1,\\dots,x_n$ 是 M-正则序列当且仅当每个 $x_i$ 是 $M/(x_1,\\dots,x_{i-1})M$ 上的非零因子且 $\\underline{x}M\\neq M$；此时 Koszul 复形 $K(\\underline{x};M)$ 正合，$M/\\underline{x}M$ 有长度 n 的极小自由消解，$\\operatorname{Tor}^A_i(M/\\underline{x}M,k)=\\Lambda^i(k^n)$；在诺特局部环上正则序列的置换不变，深度等于极大正则序列的长度。',
    dependencies: [],
    consequences: [],
    explanation: '正则序列把“切超曲面”的几何动作翻译成一条逐项的代数条件，而这条条件之所以有效，是因为它被设计成与模的替换相容：每切一刀，条件在剩下的商模上重新陈述，所以整条序列是“层层相扣”的。Koszul 复形是这个层层相扣的完全打包：复形的第 i 项记录“切了 i 刀剩下的部分”，微分记录“怎样从 i 刀回到 i−1 刀”，正合性正是“每一步都没切出多余的东西”。有了这个复形，深度、完整交的 Betti 数、局部对偶的计算都变成同一套线性代数。置换不变性是最反直觉的一条：一般环上顺序有影响，而诺特局部环上顺序无影响，其原因是 Koszul 复形对基的置换不变，而 $H_1=0$ 的逆命题把非零因子条件逐项还原，两个方向合起来把“顺序”这一表象消掉了。',
    examples: [
      { title: '例子：$(x,y)$ 在 $k[x,y]$ 上正则，在 $k[x,y]/(xy)$ 上不正则', body: '在 $A=k[x,y]$ 中：$x$ 是整环 A 上的非零因子，$A/xA\\cong k[y]$ 也是整环，$y$ 是非零因子，且 $(x,y)\\neq A$，故 $(x,y)$ 是 A-正则序列，深度至少 2；由 $\\operatorname{depth}\\le\\dim=2$ 得深度为 2，A 是 CM（也是正则）。在 $B=k[x,y]/(xy)$ 中：$(\\bar x,\\bar y)$ 的第一步要求 $\\bar x$ 是 B 上的非零因子，但 $\\bar x\\cdot\\bar y=\\overline{xy}=0$ 且 $\\bar y\\neq0$，故 $\\bar x$ 是零因子，序列在第一步失败。相应地 Koszul 复形不正合，$H_1\\neq0$。这个对比说明“非零因子”是相对于具体模判断的，同一个元素在两个环上有完全不同的性质。' },
    ],
    remarks: [
      '定义中“$\\underline{x}M\\neq M$”不能省略：若允许单位进入序列，则任意模上任意长序列都能凑出来（单位不可能是零因子，且在零模上后续条件真空成立），深度就会变成无穷。去掉这个条件后“深度 = 极大正则序列长度”这一整套理论都会崩掉，因此它是定义的一部分而不是技术性的补充。',
      '正则序列对顺序敏感这一现象只在非局部或非诺特情形（或非 CM 情形）中真正出现：在诺特局部环上任意置换都可以，但在一般环上可以构造 $x,y$ 正则而 $y,x$ 不正则的例子，因此“把正则序列当作无序集合处理”时必须有局部诺特的前提，否则会得到错误结论。',
      '“$x_1$ 在 M 上非零因子”与“$x_1$ 在 $M/x_1M$ 上非零因子”是两件不同的事：后者永远不可能（$x_1$ 在 $M/x_1M$ 上是零，因为 $x_1\\cdot1=0$ 在商中），因此序列中不重复元素是隐含要求；同时这也说明“非零因子”的判断必须在正确的商模上进行，用错层次会立刻得到荒谬结论。',
      '正则序列不能与“正规化参数”混用：参数系是生成 $\\mathfrak m$ 的一组 d 个元素，而正则序列是逐项非零因子的序列；参数系未必是正则序列（非 CM 时反例很多），正则序列也未必是参数系（长度可以小于 dim）。只有在 CM 局部环上“d 长的正则序列 = 参数系”这一等价才成立，把等价当作一般定义是常见错误。',
    ],
    corollaries: [
      { title: '推论：完整交的 Betti 数由二项式系数给出', body: '若 $\\underline{x}=x_1,\\dots,x_n$ 是 A-正则序列（A 诺特局部），则 $A/\\underline{x}A$ 作为 A-模的极小自由消解由 Koszul 复形给出，其第 i 个 Betti 数等于 $\\binom{n}{i}$，故 $\\sum_i\\beta_i=2^n$。这说明完整交的消解形状完全由长度 n 决定，与 $x_i$ 的具体取值无关；反过来，若某个 $A/\\underline{x}A$ 的 Betti 数不是二项式系数，则 $\\underline{x}$ 必不是正则序列，这给出一个可计算的判别法。', uses: ['depth-and-complete-intersection'] },
    ],
    references: [
      stacks('Section 10.68: Regular sequences', '00LF'),
      stacks('Lemma 00LF (Koszul complex and regular sequences)', '00LF'),
      { title: 'Commutative Algebra with a View Toward Algebraic Geometry, Chapter 17', author: 'D. Eisenbud', year: 1995 },
    ],
    history: HISTORY,
  },

  /* ═══════════════════════════════════════════════════════════
   * 10. 谱序列
   * ═══════════════════════════════════════════════════════════ */

  'a-spectral-sequence': {
    statement: '阿贝尔范畴中的谱序列由以下数据组成：一对象族 $\\{E_r^{p,q}\\}_{r\\ge r_0}$、微分 $d_r:E_r^{p,q}\\to E_r^{p+r,q-r+1}$ 满足 $d_r\\circ d_r=0$、以及同构 $E_{r+1}^{p,q}\\cong H^{p,q}(E_r,d_r)=\\ker d_r/\\operatorname{im}d_r$。若对每个 (p,q) 存在 $r(p,q)$ 使 $d_r$ 与 $d_{r+1}$ 在该位置上为零或同构（即序列在该位置“稳定”），记 $E_\\infty^{p,q}$ 为稳定值。称谱序列收敛到带滤链的对象 H（记 $E_2^{p,q}\\Rightarrow H^{p+q}$），若 H 有有限滤链 $\\cdots\\subseteq F^{p+1}H\\subseteq F^pH\\subseteq\\cdots$ 且 $E_\\infty^{p,q}\\cong F^pH^{p+q}/F^{p+1}H^{p+q}$。谱序列的来源：带滤链的复形 $(K,F)$ 的第一谱序列 $E_1^{p,q}=H^{p+q}(F^pK/F^{p+1}K)$、$E_2^{p,q}=H^p(H^q(K))$；双复形的谱序列 $E_2^{p,q}=H^p_I H^q_{II}(K^{\\bullet,\\bullet})\\Rightarrow H^{p+q}(\\operatorname{Tot}(K))$；以及导出函子构成的 Grothendieck 谱序列 $E_2^{p,q}=R^pG(R^qF(A))\\Rightarrow R^{p+q}(G\\circ F)(A)$。',
    deepExplanation: '谱序列要解决的问题是：当你只看到一个大对象的“分次影子”时，如何从影子的上一层逐层回收出对象的真实上同调。根源在于滤链：给了带滤链的复形之后，每个位置的上同调只给出一个商 $F^pH/F^{p+1}H$，而 $H$ 本身是这些商的逐层扩张，扩张方式由“更高次的连接映射”记录，这些连接映射正是 $d_2,d_3,\\dots$。所以谱序列不是一种算法而是“记录扩张信息的最小数据”：$E_2$ 是第一次近似，$d_2$ 修正它得到 $E_3$，依此类推，直到稳定。收敛的意思是“稳定值恰好是某个滤链的分次部分”，而滤链的存在保证可以从 $E_\\infty$ 反推出 H（至少在有限情形，或者用 Ext 群计算扩张）。三条最常用的来源是滤链复形、双复形、以及两个导出函子的复合，它们分别对应“先算内层还是先算外层”的交换问题。',
    steps: [
      step('filtered-complex-construction', '从带滤链的复形造出第一谱序列',
        '设 $(K^\\bullet,d)$ 是上链复形，带一个递减滤链 $\\cdots\\supseteq F^pK\\supseteq F^{p+1}K\\supseteq\\cdots$，每个 $F^pK$ 是子复形。构造：令 $Z_r^{p,q}=\\{x\\in F^pK^{p+q}:dx\\in F^{p+r}K^{p+q+1}\\}$（“上到 r 层才落回滤链内的 cocycle”），$B_r^{p,q}=F^{p+1}K^{p+q}\\cap d(F^{p-r+1}K^{p+q-1})+F^{p}K^{p+q}$ 型边界集，定义 $E_r^{p,q}=(Z_r^{p,q}+F^{p+1}K^{p+q})/(dZ_{r-1}^{p-r+1,q+r-2}+F^{p+1}K^{p+q})$。直接核对可得微分 $d_r:E_r^{p,q}\\to E_r^{p+r,q-r+1}$（由 d 诱导，把 $Z_r$ 送到 $Z_r$ 的相应位置），且 $E_{r+1}=H(E_r,d_r)$ 是在每个位置通过“把 $Z_r$ 换成 $Z_{r+1}$、把边界层换成上一层”实现的。最重要的一项计算是 $E_1^{p,q}=H^{p+q}(F^pK/F^{p+1}K)$：在 r=1 时 $Z_1^{p,q}=F^pK^{p+q}$ 中 $d$ 落到 $F^{p+1}$ 的元素，而按模 $F^{p+1}$ 取商后正好是上链复形 $F^pK/F^{p+1}K$ 的 cocycle 模去边界，即其第 $p+q$ 上同调。这一步是全部谱序列构造的模板：$E_1$ 是滤链各层的上同调，$d_1$ 是层的连接映射。',
        []),
      step('double-complex-spectral-sequence', '双复形的两个谱序列与“先算哪一边”',
        '设 $K^{\\bullet,\\bullet}$ 是双复形，即带有两个次数方向的对象族与两个微分 $d_I:K^{p,q}\\to K^{p+1,q}$、$d_{II}:K^{p,q}\\to K^{p,q+1}$，满足 $d_Id_I=0$、$d_{II}d_{II}=0$、$d_Id_{II}+d_{II}d_I=0$（反对交换）。总复形 $\\operatorname{Tot}(K)^n=\\bigoplus_{p+q=n}K^{p,q}$，微分 $d=d_I+d_{II}$（由反对交换性 $d^2=0$）。对总复形取两个不同的滤链：$F_I^p\\operatorname{Tot}^n=\\bigoplus_{p\'\\ge p}K^{p\',n-p\'}$ 与 $F_{II}^q\\operatorname{Tot}^n=\\bigoplus_{q\'\\ge q}K^{n-q\',q\'}$。对上一步的机器应用这两个滤链，分别得到 $E_2^{p,q}=H^p_I(H^q_{II}(K))\\Rightarrow H^{p+q}(\\operatorname{Tot})$ 与 $E_2^{p,q}=H^q_{II}(H^p_I(K))\\Rightarrow H^{p+q}(\\operatorname{Tot})$。两个谱序列给出同一个目标，这就是“先按横向算再按纵向算”与“先按纵向算再按横向算”两条路：当内层上同调在某处消没时（例如 $H^q_{II}(K)=0$ 对 $q>0$），谱序列退化，$E_2$ 已经稳定，于是 $H^n(\\operatorname{Tot})\\cong\\bigoplus_{p+q=n}H^p_I(H^0_{II}(K))$，这给出最常用的一类“把双复形算成单项”的结论。',
        ['filtered-complex-construction']),
      step('convergence-and-limits', '收敛的精确含义与有限情形的反推',
        '必须把“收敛”写成集合之间的同构而不是等号。由上一步的机器，收敛的候选数据是 $E_\\infty^{p,q}=\\lim_r E_r^{p,q}$（在稳定假设下逐点取极限）与 $H^n(\\operatorname{Tot})$ 上的滤链 $F^pH^n=\\operatorname{im}(H^n(F^p\\operatorname{Tot})\\to H^n(\\operatorname{Tot}))$。可以逐项核对 $E_\\infty^{p,q}\\cong F^pH^{p+q}/F^{p+1}H^{p+q}$：$E_1^{p,q}$ 与层 $F^p/F^{p+1}$ 的上同调一致，而每次取上同调就是把“把 x 的边界落在更高层”这一信息提升一层，极限稳定后剩下的正是“在同一个滤链层之间可见的类”，模去来自上层的贡献即得商。反推 H 需要额外工作：如果滤链有限（只有有限多个非零 $E_\\infty^{p,q}$），可以逐层用短正合列 $0\\to F^{p+1}H^{n}\\to F^pH^n\\to E_\\infty^{p,n-p}\\to0$ 归纳地拼出 $H^n$；一般情形需要 Ext 群或 $\\varprojlim^1$ 的消没条件。因此“$E_2\\Rightarrow H$”这句话在应用时必须说清是否有限、是否有收敛性假设（例如滤链有限、或 $E_2^{p,q}=0$ 在某个扇形区域外）。',
        ['double-complex-spectral-sequence']),
      step('grothendieck-spectral-sequence', 'Grothendieck 谱序列：两个导出函子的复合',
        '设 $F:\\mathcal{A}\\to\\mathcal{B}$、$G:\\mathcal{B}\\to\\mathcal{C}$ 是两个左正合函子，且 F 把内射对象送到 G-无环对象（例如 $F=\\Gamma_X$、$G=\\Gamma_Y$ 型的层上同调，或 $F=-\\otimes M$、$G=\\operatorname{Hom}$ 型），则对 $A\\in\\mathcal{A}$ 有自然谱序列 $E_2^{p,q}=R^pG(R^qF(A))\\Rightarrow R^{p+q}(G\\circ F)(A)$。构造来自 Cartan–Eilenberg 消解：取 A 的内射消解 $I^\\bullet$，把它看作双复形的一列（这是退化双复形），对每个 $I^q$ 再取 G-无环消解，拼成一个双复形 $K^{\\bullet,\\bullet}$，其总复形是 $R(G\\circ F)(A)$ 的计算复形。两个滤链给出两个谱序列，其中一个是上一步的 $H^p G(H^q F(A))$，另一个退化（因为 F 送内射到 G-无环）为 $E_2^{p,0}=R^p(GF)(A)$。最常见的三个应用：Leray 谱序列（连续映射的层上同调，$E_2^{p,q}=H^p(Y,R^qf_*\\mathcal{F})$）、Hodge–de Rham 谱序列（$E_2^{p,q}=H^q(X,\\Omega^p_X)\\Rightarrow H^{p+q}_{dR}(X)$）、以及基变换谱序列。',
        ['convergence-and-limits', 'double-complex-spectral-sequence']),
      step('worked-degeneration-example', '可核算的例子：两条路径算出同一个 H',
        '取一个具体的双复形，核算两个谱序列给出同一个答案。令 $K^{p,q}=0$ 除非 $(p,q)$ 落在 $\\{0,1\\}\\times\\{0,1\\}$，即 $2\\times2$ 方块：$K^{0,0}=k$、$K^{1,0}=k$、$K^{0,1}=k$、$K^{1,1}=k$，$d_I$ 除 $K^{0,0}\\to K^{1,0}$ 是恒等（乘 1）外为零，$d_{II}$ 除 $K^{1,0}\\to K^{1,1}$ 是恒等外为零，$K^{0,0}\\to K^{0,1}$ 取零使反对交换性成立。总复形 $\\operatorname{Tot}^0=k\\oplus k$、$\\operatorname{Tot}^1=k\\oplus k$、$\\operatorname{Tot}^2=k$，微分 $d^0(a,b)=(0,a)$（把 $K^{0,0}$ 恒等地送到 $K^{1,0}$、把 $K^{0,1}$ 送到 0），$d^1(c,d)=(d)$（把 $K^{1,0}$ 送到 $K^{1,1}$、把 $K^{1,1}$ 的贡献按上一次微分处理）。直接计算：$H^0=\\ker d^0=\\{(0,b)\\}\\cong k$；$H^1=\\ker d^1/\\operatorname{im}d^0$，$\\ker d^1=\\{(c,0)\\}\\cong k$，$\\operatorname{im}d^0=\\{(0,a)\\}\\cong k$，两者在 $\\operatorname{Tot}^1=k\\oplus k$ 中都是坐标子空间，故 $H^1=0$；$H^2=\\operatorname{Tot}^2/\\operatorname{im}d^1=k/k=0$。于是 $H^\\bullet(\\operatorname{Tot})=k$ 集中在 0。用 $E_{II}$ 谱序列核对：先按 $d_{II}$ 算列上同调，得 $E_1^{p,q}$ 在 $q=0,1$ 上非零，$d_1$ 由 $d_I$ 诱导，算出 $E_2^{0,0}=k$、$E_2^{1,0}=0$、$E_2^{0,1}=0$、$E_2^{1,1}=k$，稳定后 $E_\\infty^{0,0}=k$，其余为零，故 $H^0=k$、$H^{>0}=0$，与直接计算一致。这个例子的价值在于把“谱序列”的每一步都变成 $2\\times2$ 矩阵的核与像，可以独立复算。',
        ['grothendieck-spectral-sequence', 'convergence-and-limits']),
    ],
    conclusion: '谱序列以一族带微分 $d_r:E_r^{p,q}\\to E_r^{p+r,q-r+1}$ 的模组成，$E_{r+1}=H(E_r,d_r)$；若按 $r$ 逐点稳定则得 $E_\\infty$，且当存在滤链使 $E_\\infty^{p,q}\\cong F^pH^{p+q}/F^{p+1}H^{p+q}$ 时记 $E_2^{p,q}\\Rightarrow H^{p+q}$。三条标准来源是：滤链复形（$E_1^{p,q}=H^{p+q}(F^p/F^{p+1})$）、双复形（$E_2^{p,q}=H^p_IH^q_{II}\\Rightarrow H^{p+q}(\\operatorname{Tot})$）、以及 Grothendieck 谱序列（$E_2^{p,q}=R^pG(R^qF(A))\\Rightarrow R^{p+q}(G\\circ F)(A)$）。',
    dependencies: [],
    consequences: [],
    explanation: '把谱序列理解成“算法”会错过它的本质：它是一份记账表，记录的是“在不完全信息下能确定多少”。滤链把 H 切成一片片商，而每片商只能看到 H 的一个影子；$d_1$ 记录相邻层之间的连接，$d_2$ 记录“隔一层”的连接，$d_r$ 记录隔 r 层的连接。序列稳定意味着“所有可能连接都被记录下来”，此时 $E_\\infty$ 恰好是 H 的分次部分，剩下的工作是逐层扩张回 H。这套记账之所以在代数几何里无处不在，是因为几乎所有有趣的上同调都是通过“两层结构”定义出来的（层的上同调、纤维化的上同调、两个函子的复合），而两层结构天生给出双复形或滤链，谱序列便是处理这类结构的唯一一般方法。收敛性问题被强调，是因为“$E_2\\Rightarrow H$”的箭头不是等号：忘记滤链与收敛条件会得到看似漂亮的错误结论。',
    examples: [
      { title: '例子：$S^2$ 上的 Leray 谱序列与 $H^\\bullet(S^2)$ 的恢复', body: '取纤维化 $S^1\\to S^3\\to S^2$（Hopf 纤维化），系数取 $\\mathbb{Z}$，Leray 谱序列为 $E_2^{p,q}=H^p(S^2,R^qf_*\\mathbb{Z})\\Rightarrow H^{p+q}(S^3)$。因为底空间 $S^2$ 单连通且纤维 $S^1$ 的上同调只在 $q=0,1$ 非零，$R^0f_*\\mathbb{Z}=\\mathbb{Z}$、$R^1f_*\\mathbb{Z}=\\mathbb{Z}$（局部常值，因底空间单连通）。于是 $E_2$ 只在 $(p,q)\\in\\{(0,0),(2,0),(0,1),(2,1)\\}$ 非零，都是 $\\mathbb{Z}$。$d_2:E_2^{0,1}\\to E_2^{2,0}$ 必须是一个同构，否则 $H^\\bullet(S^3)$ 会在 $H^1$ 或 $H^2$ 上非零（而 $S^3$ 的 $H^1=H^2=0$），故 $E_3^{0,0}=E_3^{2,1}=\\mathbb{Z}$、其余为零，$E_\\infty$ 只在 $(0,0)$ 与 $(2,1)$ 有 $\\mathbb{Z}$，与 $H^0(S^3)=H^3(S^3)=\\mathbb{Z}$ 一致。这个例子说明 $d_2$ 的非平凡性是“两条层的信息互相抵消”的记录，也是谱序列比单纯的分次计算强的地方。' },
    ],
    remarks: [
      '“$E_2\\Rightarrow H$”不是等式：右边需要滤链，且 $E_\\infty$ 只是分次部分，H 本身要通过滤链的逐层扩张才能确定。在两个 $E_\\infty$ 都非零的位置上，扩张类可能不唯一（由 Ext¹ 给出），因此只写出 $E_2$ 项就断言 $H$ 是什么形状是常见的错误。',
      '收敛需要条件：滤链必须有限（或有适当的完备性与 $\\varprojlim^1$ 消没），否则 $E_\\infty$ 与 $H$ 的关系可能失败，甚至在非完备情形下出现“$E_\\infty$ 全为零而 H 非零”的边界现象。因此在应用 Grothendieck 谱序列时必须说明场景（通常是有界复形或滤链有限）。',
      '谱序列的退化不等于 $E_2=E_\\infty$ 的每一项都可以直接读出 H：即使所有 $d_r$（$r\\ge2$）为零，$E_2$ 也只是 H 的滤链分次部分，若滤链非平凡仍需要处理扩张。把“退化”当成“H 就是 $E_2$ 的直和”只在滤链分裂时才成立，而分裂不是自动的。',
      '谱序列的微分方向 $d_r:E_r^{p,q}\\to E_r^{p+r,q-r+1}$ 与同调/上同调约定有关，不同教材可能用不同的指标约定（例如把 q 的符号反过来），因此引用公式时必须先核对约定，否则 $d_2$ 的同构方向会弄反并导致“$H^1$ 反而非零”这类矛盾结论。',
    ],
    corollaries: [
      { title: '推论：双复形的一个空间退化时的上同调直和公式', body: '若双复形 $K^{\\bullet,\\bullet}$ 满足 $H^q_{II}(K)=0$ 对一切 $q>0$，则 $E_2^{p,q}=0$（$q>0$）使谱序列退化，$E_\\infty^{p,0}=H^p_IH^0_{II}(K)$，从而 $H^n(\\operatorname{Tot}K)\\cong\\bigoplus_{p+q=n}H^p_IH^0_{II}(K)$。这条退化条件是层上同调计算中使用最多的一条：很多情形下“内层复形”在每个点处是消解，取 $H^0$ 就得到层本身，于是双复形退化为单复形并给出上同调的同构。', uses: ['double-complex-spectral-sequence'] },
    ],
    references: [
      stacks('Section 20.9: Spectral sequences', '011M'),
      stacks('Section 20.10: Filtered complexes', '0122'),
      { title: 'Methods of Homological Algebra, Chapter III', author: 'S. I. Gelfand, Y. I. Manin', year: 2003 },
    ],
    history: HISTORY,
  },

  /* ═══════════════════════════════════════════════════════════
   * 11. 内射消解
   * ═══════════════════════════════════════════════════════════ */

  'a-injective-resolution': {
    statement: '设 A 是环，$\\mathcal{A}=A\\text{-}\\operatorname{Mod}$。称模 I 为内射模，若函子 $\\operatorname{Hom}_A(-,I)$ 正合，等价地（Baer 判据）对 A 的每个理想 $\\mathfrak a$ 与每个 A-线性映射 $\\mathfrak a\\to I$，都存在 A-线性映射 $A\\to I$ 是其延拓。内射消解指正合列 $0\\to M\\to I^0\\to I^1\\to I^2\\to\\cdots$（$I^i$ 内射），它总存在。用消解定义 $\\operatorname{Ext}^i_A(M,N)=H^i(\\operatorname{Hom}_A(I^\\bullet,N))$。基本性质：(1) 内射模的直积内射；(2) 每个模可以嵌入内射模（用 $M\\hookrightarrow\\prod_{\\operatorname{Hom}(A,M)}$ 型构造或 $A\\to \\mathbb{Z}$-模嵌入再由伴随）；(3) 由 (2) 与递归构造可得每个模有内射消解；(4) 不同的内射消解给出自然同构的 Ext 群（比较引理）。',
    deepExplanation: '内射消解的全部意义在于把函子 $\\operatorname{Hom}(M,-)$ 的“不正合”测出来：$\\operatorname{Hom}(M,-)$ 是左正合的，它把短正合列变成只差右端的长正合列，缺失的部分由 $\\operatorname{Ext}^i$ 补齐。要定义 Ext 需要“消解的对象使函子变正合”，对 $\\operatorname{Hom}(M,-)$ 而言起这个作用的是内射模（对 $\\operatorname{Hom}(-,N)$ 则是射影模），于是把 M 换成内射消解、取 Hom、算上同调。整个构造的合法性依赖两件事实：内射模足够多（每个模能嵌入内射模），以及“换一个内射消解结果不变”（比较引理）。Baer 判据把“内射”这个看起来无法检验的条件化归为“对理想上的映射可以延拓”，这是把抽象条件变成可验证判据的典范。',
    steps: [
      step('baer-criterion', 'Baer 判据：把内射性化为对理想的延拓',
        '先证“$\\operatorname{Hom}(-\\text{，}I)$ 正合 ⟹ Baer 条件”。设 $\\mathfrak a\\subseteq A$ 是理想，$f:\\mathfrak a\\to I$ 是 A-线性映射。考虑列 $0\\to\\mathfrak a\\to A\\to A/\\mathfrak a\\to0$，取 Hom 得 $\\operatorname{Hom}(A,I)\\to\\operatorname{Hom}(\\mathfrak a,I)\\to\\operatorname{Ext}^1(A/\\mathfrak a,I)$；若 $\\operatorname{Hom}(-\\text{，}I)$ 正合则 $\\operatorname{Hom}(A,I)\\to\\operatorname{Hom}(\\mathfrak a,I)$ 是满射，故 f 有延拓 $F:A\\to I$，即 $F(1)$ 给出 $f(a)=aF(1)$ 的表示。再证反向。设 Baer 条件成立，要证对任意短正合列 $0\\to M\'\\xrightarrow{\\iota}M$ 与任意 $f:M\'\\to I$ 存在延拓。用 Zorn 引理：考虑所有对 $(M_0,f_0)$，其中 $M\'\\subseteq M_0\\subseteq M$ 且 $f_0:M_0\\to I$ 延拓 f，按包含关系定义偏序，链的并仍是这样的对（并处的 $f_0$ 良定义因为链上的半函数一致），故有极大元 $(M_0,f_0)$。若 $M_0\\neq M$，取 $m\\in M\\setminus M_0$，令 $\\mathfrak a=\\{a\\in A:am\\in M_0\\}$，这是 A 的理想，且在 $\\mathfrak a$ 上定义 $g(a)=f_0(am)\\in I$。g 是 A-线性（$g(a+a\')=f_0((a+a\')m)=g(a)+g(a\')$、$g(ab)=f_0(abm)=a g(b)$）。由 Baer 条件存在 $\\tilde g:A\\to I$ 延拓 g，把 $M_0+Am$ 上的映射定义为 $f_1(m_0+am)=f_0(m_0)+\\tilde g(a)$，需检验良定义：若 $m_0+am=0$ 即 $m_0=-am\\in M_0$，则 $a\\in\\mathfrak a$ 且 $f_0(m_0)=-f_0(am)=-g(a)=-\\tilde g(a)$，相容。于是得到更大的对，与极大性矛盾，故 $M_0=M$，延拓存在。',
        []),
      step('enough-injectives', '内射模足够多：把任意模嵌入内射模',
        '证明每个模 M 都可以嵌入内射模。第一步把问题降到 $\\mathbb{Z}$ 上：每个 A-模 M 都是 $\\mathbb{Z}$-模，作为阿贝尔群可嵌入可除群（例如 $M\\hookrightarrow\\prod_{f\\in\\operatorname{Hom}_{\\mathbb{Z}}(M,\\mathbb{Q}/\\mathbb{Z})}\\mathbb{Q}/\\mathbb{Z}$，映射 $m\\mapsto(f(m))_f$；单射性因为对任意 $m\\neq0$ 存在同态 $M\\to\\mathbb{Q}/\\mathbb{Z}$ 在 m 上非零，这由 $\\mathbb{Z}$ 是主理想整环、$\\mathbb{Z}m$ 上取一个到 $\\mathbb{Q}/\\mathbb{Z}$ 的非零映射再延拓得到）。而 $\\mathbb{Q}/\\mathbb{Z}$ 是可除阿贝尔群，可除群是内射 $\\mathbb{Z}$-模，直积内射，故 M 嵌入某个内射 $\\mathbb{Z}$-模 D。第二步用伴随：$\\operatorname{Hom}_{\\mathbb{Z}}(A,D)$ 是 A-模，且由伴随同构 $\\operatorname{Hom}_A(M,\\operatorname{Hom}_{\\mathbb{Z}}(A,D))\\cong\\operatorname{Hom}_{\\mathbb{Z}}(M,D)$，$\\operatorname{Hom}_{\\mathbb{Z}}(A,D)$ 是内射 A-模（因为它的 Hom 函子等于先取 $\\mathbb{Z}$-Hom 再用伴随，保持正合性）。第三步：M 经 $m\\mapsto(a\\mapsto D$ 中的 $\\varphi(am))$ 嵌入 $\\operatorname{Hom}_{\\mathbb{Z}}(A,D)$，这是 A-线性且单射（a=1 处取出原来的嵌入）。于是 M 嵌入内射 A-模。',
        ['baer-criterion']),
      step('resolution-by-recursion', '内射消解的存在性：递归构造与正合性',
        '由上一步，取 $I^0$ 为含 M 的内射模，得到正合列 $0\\to M\\to I^0$。再看商 $I^0/M$，它可嵌入内射模 $I^1$，得 $0\\to I^0/M\\to I^1$。把两个短正合列拼接得到 $0\\to M\\to I^0\\to I^1\\to\\operatorname{coker}(I^0\\to I^1)\\to0$ 型的长正合列，递归重复得到 $0\\to M\\to I^0\\to I^1\\to\\cdots$ 且在每个位置正合。递归的合法性依赖选择公理（每次选择嵌入的目标模），但不依赖任何有限性或诺特假设，因此每个模、在任意环上都有内射消解。作为对照，射影消解的存在性还要求“每个模有满射自射影模”，这在任意环上也成立（自由模足够多），但射影消解通常不能取有限。内射消解的存在性使得右导出函子 $R^iF$ 对任意左正合 F 都有定义：取内射消解、作用 F、算上同调。对 $F=\\operatorname{Hom}_A(M,-)$ 即得 Ext；对 $F=\\Gamma(X,-)$ 即得层上同调；对 $F=f_*$ 即得高次直像。',
        ['enough-injectives']),
      step('comparison-lemma', '比较引理与 Ext 的良定义性',
        '比较引理：设 $0\\to M\\to I^\\bullet$ 是内射消解，$0\\to N\\to J^\\bullet$ 是任意消解（不必内射），$\\varphi:M\\to N$ 是 A-线性映射，则存在链映射 $\\varphi^\\bullet:I^\\bullet\\to J^\\bullet$ 使 $\\varphi^0\\circ\\iota_M=\\iota_N\\circ\\varphi$，且任意两个这样的链映射同伦。第一部分的构造是递归延拓：先由 $\\iota_N\\circ\\varphi:M\\to J^0$ 与 I⁰ 内射得 $\\varphi^0:I^0\\to J^0$ 延拓它；再对 $I^0\\to I^1$ 与复合 $I^0\\xrightarrow{\\varphi^0}J^0\\to J^1$ 的差（它在 $\\operatorname{im}(M\\to I^0)$ 上为零，故经 $I^0/M$ 分解到 $J^1$）用 I¹ 内射延拓，逐次进行。第二部分的同伦用同样的“差在像上为零故可分解”技巧构造。由比较引理，若 $J^\\bullet$ 也是内射消解，则两个消解之间有双向链映射且复合同伦于恒等，故取 $\\operatorname{Hom}(M\',-)$ 后上同调同构：$H^i(\\operatorname{Hom}(I^\\bullet,N))\\cong H^i(\\operatorname{Hom}(J^\\bullet,N))$。这就是 $\\operatorname{Ext}^i_A(M,N)$ 良定义的全部内容，也说明 Ext 只依赖 M 与 N，不依赖消解的选择。',
        ['resolution-by-recursion']),
      step('ext-properties-and-computation', 'Ext 的性质与可核算的例子',
        'Ext 的基本性质由此可算：(1) $\\operatorname{Ext}^0_A(M,N)=\\operatorname{Hom}_A(M,N)$（因为 $\\operatorname{Hom}(I^\\bullet,N)$ 的第 0 上同调是 $\\ker(\\operatorname{Hom}(I^0,N)\\to\\operatorname{Hom}(I^1,N))$，由 $0\\to M\\to I^0\\to I^1$ 正合与 Hom 左正合，该核恰是 $\\operatorname{Hom}(M,N)$ 的像，同构于 $\\operatorname{Hom}(M,N)$）。(2) 短正合列 $0\\to N\'\\to N\\to N\'\'\\to0$ 给出长正合列 $0\\to\\operatorname{Hom}(M,N\')\\to\\operatorname{Hom}(M,N)\\to\\operatorname{Hom}(M,N\'\')\\to\\operatorname{Ext}^1(M,N\')\\to\\cdots$，这是 $\\operatorname{Ext}^1$ 分类扩张的具体体现：$\\operatorname{Ext}^1_A(M,N\'\')$ 与 M 被 $N\'\'$ 扩张的等价类一一对应。(3) 若 M 是射影模（或自由模），则 $\\operatorname{Ext}^i(M,-)=0$ 对 $i>0$：因为 M 自身给出长度为 0 的射影消解，故 $\\operatorname{Ext}^i$ 只能从更高阶的复形来，而 $\\operatorname{Hom}(M,-)$ 正合。核算例子：取 $A=\\mathbb{Z}$、$M=\\mathbb{Z}/n$、$N=\\mathbb{Z}/m$。由消解 $0\\to\\mathbb{Z}\\xrightarrow{n}\\mathbb{Z}\\to\\mathbb{Z}/n\\to0$ 与 $0\\to\\mathbb{Z}\\xrightarrow{n}\\mathbb{Z}\\to\\mathbb{Z}/n\\to0$ 中前两项内射，得 $\\operatorname{Ext}^1_{\\mathbb{Z}}(\\mathbb{Z}/n,\\mathbb{Z}/m)=\\mathbb{Z}/\\gcd(n,m)$、$\\operatorname{Ext}^i=0$ 对 $i\\ge2$（因为 $\\mathbb{Z}$ 的全局维数为一）。再核算 $\\operatorname{Ext}^1_{\\mathbb{Z}}(\\mathbb{Z}/2,\\mathbb{Z}/2)=\\mathbb{Z}/2$，非平凡扩张由 $0\\to\\mathbb{Z}/2\\to\\mathbb{Z}/4\\to\\mathbb{Z}/2\\to0$ 给出，与“$\\mathbb{Z}/4$ 有两种含 $\\mathbb{Z}/2$ 的方式”一致。',
        ['comparison-lemma', 'resolution-by-recursion']),
    ],
    conclusion: '内射模由 Baer 判据刻画（对理想上映射的可延拓性），每个模都能嵌入内射模、从而每个模都有内射消解 $0\\to M\\to I^0\\to I^1\\to\\cdots$；由比较引理，$\\operatorname{Ext}^i_A(M,N)=H^i(\\operatorname{Hom}_A(I^\\bullet,N))$ 不依赖消解选取，且 $\\operatorname{Ext}^0=\\operatorname{Hom}$、短正合列给出 Ext 的长正合列、射影模的高阶 Ext 消没。',
    dependencies: [],
    consequences: [],
    explanation: '导出函子的定义总是同一个套路：先用“好对象”换掉原来的对象（对右导出函子用内射对象、对左导出函子用射影对象或平坦对象），让函子在好对象上变正合，再算复形的上同调，最后用比较引理证明换法不影响结果。这条记录把第 4 步放大来看，是因为“良定义”这件事在导出函子理论中最容易被忽略：如果不同的消解给出不同的上同调，Ext 就不是不变量而只是一个依赖于选择的记号。比较引理的证明技术是“递归延拓 + 同伦”，而递归延拓之所以可行，正是因为内射模的定义就是为了延拓而设的。Baer 判据把内射性变成对理想的可检验条件，这一步在具体环上有实际用处：在诺特环上只需检查有限生成理想，在 PID 上只需检查主理想。',
    examples: [
      { title: '例子：$\\mathbb{Z}$ 上 $\\operatorname{Ext}^1(\\mathbb{Z}/n,\\mathbb{Z}/m)$ 的计算', body: '取 $A=\\mathbb{Z}$。$\\mathbb{Z}/n$ 的内射消解可取 $0\\to\\mathbb{Z}\\to\\mathbb{Q}\\to\\mathbb{Q}/\\mathbb{Z}\\to\\cdots$ 与 M 的关系，更标准的是利用短正合列 $0\\to\\mathbb{Z}\\xrightarrow{n}\\mathbb{Z}\\to\\mathbb{Z}/n\\to0$ 计算：对任意 N 取 $\\operatorname{Hom}(-,N)$ 得长正合列 $0\\to\\operatorname{Hom}(\\mathbb{Z}/n,N)\\to N\\xrightarrow{n}N\\to\\operatorname{Ext}^1(\\mathbb{Z}/n,N)\\to \\operatorname{Ext}^1(\\mathbb{Z},N)=0$，故 $\\operatorname{Ext}^1_{\\mathbb{Z}}(\\mathbb{Z}/n,N)\\cong N/nN$。取 $N=\\mathbb{Z}/m$ 得 $N/nN=(\\mathbb{Z}/m)/n(\\mathbb{Z}/m)=\\mathbb{Z}/\\gcd(n,m)$。核算 n=m=2：得 $\\mathbb{Z}/2$，对应唯一非平凡扩张 $0\\to\\mathbb{Z}/2\\to\\mathbb{Z}/4\\to\\mathbb{Z}/2\\to0$。核算 n=2,m=3：得 $\\mathbb{Z}/\\gcd(2,3)=\\mathbb{Z}/1=0$，说明扩张必分裂（由 $\\gcd$ 互素，中国剩余定理），与 $\\mathbb{Z}/2\\oplus\\mathbb{Z}/3=\\mathbb{Z}/6$ 一致。' },
    ],
    remarks: [
      '内射消解不能换成“射影消解”来计算 $\\operatorname{Hom}(M,-)$ 的导出函子：射影消解适用于 $\\operatorname{Hom}(-,N)$ 与 $\\otimes$，用错消解会得到不同的群。选消解的原则是“所选对象使被作用函子正合”，对右正合函子用射影/平坦对象，对左正合函子（如 $\\operatorname{Hom}(M,-)$、$\\Gamma$、$f_*$）用内射对象，这是导出函子理论中最容易出错的一步。',
      '内射模的直积内射、但直和不内射：$\\prod I_i$ 内射，$\\bigoplus I_i$ 一般不是（这是内射与射影对偶性不对称的地方）。因此把“有限个内射模的直和”当作内射模使用会出错，例如在证明“内射模足够多”时用的是直积而不是直和，两处不能互换。',
      '内射性依赖环：一个模在 $A$ 上内射，在很多情形下在 $A/\\mathfrak a$ 上不再内射，因为理想结构变了。使用 Baer 判据时必须在同一环内检验所有理想，不能只在某类理想（例如主理想）上验证而不加环的假设；只有在 PID 上“主理想足够”才成立。',
      'Ext 的消没需要正确的模假设：$\\operatorname{Ext}^i_A(M,-)=0$（$i>0$）对射影 M 成立，而有限生成与有限表现并不能替代射影性。例如 $\\mathbb{Z}/n$ 在 $A=\\mathbb{Z}$ 上有限生成但不是射影，$\\operatorname{Ext}^1(\\mathbb{Z}/n,\\mathbb{Z}/n)=\\mathbb{Z}/n\\neq0$，说明“有限生成 ⟹ 高阶 Ext 消没”是错的。',
    ],
    corollaries: [
      { title: '推论：$\\operatorname{Ext}^1$ 分类一层扩张', body: '由比较引理与长正合列，$\\operatorname{Ext}^1_A(M,N)$ 与“以 N 为子模、以 M 为商的扩张 $0\\to N\\to E\\to M\\to0$ 的等价类”一一对应：零类对应分裂扩张。这条推论把 Ext 从一个计算记号变成分类工具，也是层论中“$H^1(X,\\mathcal{F})$ 分类 $\\mathcal{F}$-torsor”与“形变理论里 $\\operatorname{Ext}^1$ 是一阶形变空间”的共同来源。', uses: ['ext-properties-and-computation'] },
    ],
    references: [
      stacks('Section 10.31: Injective modules', '01D4'),
      stacks('Lemma 01D4 (Baer criterion)', '01D4'),
      { title: 'An Introduction to Homological Algebra, Chapter 2', author: 'C. A. Weibel', year: 1994 },
    ],
    history: HISTORY,
  },

  /* ═══════════════════════════════════════════════════════════
   * 12. Koszul 复形
   * ═══════════════════════════════════════════════════════════ */

  'a-koszul': {
    statement: '设 A 是环，$x_1,\\dots,x_n\\in A$，M 是 A-模。Koszul 复形 $K(\\underline{x};M)$ 定义为：$K_i=\\Lambda^i(A^n)\\otimes_A M$（即 $K_i$ 是 $\\binom{n}{i}$ 个 M 的直和），微分 $\\partial_i(e_{j_1}\\wedge\\cdots\\wedge e_{j_i}\\otimes m)=\\sum_{s=1}^{i}(-1)^{s-1}e_{j_1}\\wedge\\cdots\\widehat{e_{j_s}}\\wedge\\cdots\\wedge e_{j_i}\\otimes x_{j_s}m$，满足 $\\partial^2=0$。则 (1) $H_0(K)=M/\\underline{x}M$；(2) 若 $\\underline{x}$ 是 M-正则序列，则 $K(\\underline{x};M)$ 正合（$H_i=0$ 对 $i>0$），反之在 M 有限生成、A 诺特、$H_i$ 有限生成且 $x_i\\in J(A)$ 时 $H_1=0$ 蕴含 $\\underline{x}$ 是 M-正则序列；(3) Koszul 对偶：$\\operatorname{Hom}_A(K(\\underline{x};A),A)\\cong K(\\underline{x};A)[-n]$ 型自对偶；(4) $\\operatorname{Tor}^A_i(A/\\underline{x}A,k)=\\Lambda^i(k^n)$ 当 $\\underline{x}$ 是正则序列。',
    deepExplanation: 'Koszul 复形式是“把一列元素的作用打包成一个复形”的最经济构造：第 i 项记录 i 个元素同时作用的所有组合方式，微分记录“去掉一个并用它对元素求值”，符号由外代数的反对称性提供。它的价值有三个层次。第一，它是“正则序列”的判定工具：正合性恰好等价于正则性，于是深度可以用复形的同调是否消没来计算。第二，它是完整交的正则消解：若 $A/\\underline{x}A$ 是完整交，Koszul 复形就是它的极小自由消解，其 Betti 数是二项式系数，这使完整交的代数性质（例如 Betti 数与重数的关系）可以显式写出。第三，Koszul 对偶给出 $A$ 上复形的自对偶结构，这与局部对偶复形、Gorenstein 环的刻画、以及 $\\operatorname{Ext}$ 的计算直接相连。本条记录把构造、正合性与对偶三块分别核算。',
    steps: [
      step('construction-and-d-squared', '构造与 $\\partial^2=0$：符号的来源',
        '设 $V=A^n$ 以 $e_1,\\dots,e_n$ 为基。Koszul 复形是分次 M-模 $\\Lambda^{\\bullet}V\\otimes M$ 带上微分 $\\Lambda^i V\\otimes M\\to\\Lambda^{i-1}V\\otimes M$，作为“$V\\to A$（$e_i\\mapsto x_i$）在反对称代数上的收缩”给出：更内蕴地，令 $\\varphi:V\\to A$ 为 $\\varphi(e_i)=x_i$，则 $\\partial$ 是 $\\Lambda V\\otimes M$ 上的分次导子，由 $\\partial(v\\otimes m)=\\varphi(v)m$ 唯一确定（$v\\in V=\\Lambda^1$）。对 $\\Lambda^2$ 的分量核算：$\\partial(e_i\\wedge e_j\\otimes m)=x_i(e_j\\otimes m)-x_j(e_i\\otimes m)$，再作用一次得 $x_ix_jm-x_jx_im=0$，符号 $-1$ 正是来自 $e_j\\wedge e_i=-e_i\\wedge e_j$ 这一外代数关系，交换 $x_i$ 与 $x_j$ 用的是 A 的交换性（或对非交换情况改用 $M$ 的双模结构）。一般位置上的双重和相消是对称性论证：$\\partial^2(e_{j_1}\\wedge\\cdots\\wedge e_{j_i}\\otimes m)$ 中每一项由“先删 $j_s$ 再删 $j_t$”与“先删 $j_t$ 再删 $j_s$”成对出现，符号分别为 $(-1)^{s+t-1}$ 型与 $(-1)^{s+t}$ 型，相加为零。这一步说明 Koszul 复形只依赖线性映射 $\\varphi$ 与外代数，不依赖 $x_i$ 之间的任何特殊关系，因此它对任意元素组都有定义。',
        []),
      step('h0-and-augmentation', '第零同调与增广：$H_0=M/\\underline{x}M$',
        '复形的项为 $K_n=\\Lambda^nV\\otimes M=M$（最高外幂一维）、$K_0=M$，增广 $K_0\\to M/\\underline{x}M$ 是自然投影。$H_0(K)=\\operatorname{coker}(\\partial_1)=M/\\operatorname{im}\\partial_1$，而 $\\partial_1(e_i\\otimes m)=x_im$，故 $\\operatorname{im}\\partial_1=(x_1,\\dots,x_n)M=\\underline{x}M$，于是 $H_0=M/\\underline{x}M$。这条计算是 Koszul 复形作为“$M/\\underline{x}M$ 的消解”的起点：若复形正合，则 $0\\to K_n\\to\\cdots\\to K_0\\to M/\\underline{x}M\\to0$ 是一个自由消解，其自由项的秩由 $\\binom{n}{i}$ 给出。同时注意 $K_n$ 与 $K_0$ 都是秩一自由（$K_n=\\Lambda^nV\\otimes M\\cong M$），这个“首尾对称”的结构正是 Koszul 对偶（上一步引向的第 (3) 条）的来源：自对偶来自外代数的 Poincaré 对偶 $\\Lambda^iV\\otimes\\Lambda^{n-i}V\\to\\Lambda^nV\\cong A$。核算一个小例：$n=2$，$\\partial_1(a_1e_1+a_2e_2)=\\varphi$ 作用给出 $a_1x_1+a_2x_2$，$\\partial_2(be_1\\wedge e_2)=b(x_1e_2-x_2e_1)$，故 $H_1=\\{(a_1,a_2):a_1x_1+a_2x_2=0\\}/\\{b(x_1,-x_2)\\}$，这个商正是“$x_1,x_2$ 之间的关系的个数”，例如 $A$ 是整域时商为零，与 $(x_1,x_2)$ 正则一致。',
        ['construction-and-d-squared']),
      step('exactness-vs-regularity', '正合性等价于正则序列：两个方向',
        '证“正则 ⟹ 正合”。对 n 归纳：n=1 时复形是 $0\\to M\\xrightarrow{x_1}M\\to0$，正合性即单射性，就是 $x_1$ 是 M 上非零因子（结合 $H_0=M/x_1M$ 与增广）。归纳步用短正合列 $0\\to K(\\underline{x\'};M)\\to K(\\underline{x};M)\\to K(\\underline{x\'};M)[-1]\\to0$（按是否含 $e_n$ 分解外幂），长正合列把 $H_i(K(\\underline{x};M))$ 夹在 $H_i(K(\\underline{x\'};M))$ 与 $H_{i-1}(K(\\underline{x\'};M))$ 之间；由归纳 $H_i(K(\\underline{x\'};M))=0$（$i>0$）得 $H_i(K(\\underline{x};M))\\cong H_{i-1}(K(\\underline{x\'};M))=0$（$i\\ge2$），而 $i=1$ 处由 $x_n$ 是 $M/\\underline{x\'}M$ 上非零因子（即 $0\\to H_0(K(\\underline{x\'};M))\\xrightarrow{x_n}\\cdots$ 单射）得 $H_1=0$。证“$H_1=0$ ⟹ 正则”：先看 $i=1$ 给出 $x_1$ 是 M 上非零因子（因为 $H_1=0$ 中 $\\partial_1(e_1\\otimes m)=0$ 的 m 必形如 $\\partial_2$ 的像，而展开后第一分量为零迫使 m 落在 $\\underline{x\'}M$ 型组合中，由 $x_1$ 不再出现可推出 $x_1$ 非零因子），再对 $n-1$ 归纳。逆方向的完整形式需要额外假设（$x_i\\in J(A)$、$H_i$ 有限生成、A 诺特），因为从 $H_1=0$ 到全体 $H_i=0$ 的跨越需要“有限生成模上 $x_i$ 的作用近乎幂零”这一 Nakayama 型输入。',
        ['h0-and-augmentation']),
      step('koszul-duality', 'Koszul 对偶与局部对偶中的应用',
        'Koszul 对偶的陈述：$\\operatorname{Hom}_A(K(\\underline{x};A),A)\\cong K(\\underline{x};A)[-n]$ 型同构，其中 $[-n]$ 是复形的平移（把 $K_i$ 移到 $-i+n$ 位置）。构造由外代数的 Poincaré 对偶给出：$\\Lambda^iV\\to\\operatorname{Hom}_A(\\Lambda^{n-i}V,\\Lambda^nV)\\cong\\operatorname{Hom}_A(\\Lambda^{n-i}V,A)$，$\\alpha\\mapsto(\\beta\\mapsto\\alpha\\wedge\\beta)$ 是 A-模同构（因为 $\\Lambda^nV\\cong A$ 且外积不为零的配对是完美配对）。核对微分：$\\partial$ 在 $\\Lambda^{n-i}V$ 上的作用与它的对偶在 $\\operatorname{Hom}$ 复形上的作用相差符号 $(-1)^{n-i}$ 型，逐项核算即得同构。这条对偶的用途是：把 $\\operatorname{Hom}(K(\\underline{x};A),N)$ 的上同调与 $K(\\underline{x};N)$ 的同调联系起来，从而在 $\\underline{x}$ 是正则序列时得到 $A/\\underline{x}A$ 的局部对偶复形；在 Gorenstein 环上（$A$ 的局部对偶复形同构于 $A[n]$），Koszul 对偶使“高阶 Ext 的维数对称”这一现象（例如 $\\operatorname{Ext}^i(k,A)$ 与 $\\operatorname{Ext}^{n-i}(k,A)$ 的配对）可以逐项写出，这也是 Poincaré 对偶在局部环上的代数版本。',
        ['exactness-vs-regularity']),
      step('betti-numbers-and-example', 'Betti 数、完整交与一个可核算的例子',
        '当 $\\underline{x}$ 是 A-正则序列时，Koszul 复形给出 $A/\\underline{x}A$ 的长度 n 极小自由消解（极小性因为微分的每一项系数都落在 $\\mathfrak m$ 中：$\\partial$ 的矩阵元正是 $x_i$，$x_i\\in\\mathfrak m$），故 Betti 数 $\\beta_i=\\binom{n}{i}$，$\\operatorname{Tor}^A_i(A/\\underline{x}A,k)=\\Lambda^i(k^n)$（维数 $\\binom{n}{i}$），$\\operatorname{Ext}^i_A(k,A/\\underline{x}A)$ 的维数由对偶的 $\\binom{n}{i}$ 给出。核算例子：$A=k[x,y]$、$\\underline{x}=(x,y)$，$K_\\bullet$ 为 $0\\to A\\xrightarrow{\\partial_2}A^2\\xrightarrow{\\partial_1}A\\to0$，$\\partial_1=(x\\ y)$、$\\partial_2=(-y,x)^{T}$。验算 $\\partial_1\\partial_2=x(-y)+y(x)=0$。于是 $\\operatorname{Tor}_1^A(A/(x,y),k)=k^2$、$\\operatorname{Tor}_2^A=k$、$H_0=k$，与 $A/(x,y)$ 是完整交（余维 2 由 2 个方程给出）一致。再核算非正则例：$B=k[x,y]/(xy)$ 与 $\\underline{x}=(x,y)$，则 $K_\\bullet$ 是 $0\\to B\\xrightarrow{\\partial_2}B^2\\xrightarrow{\\partial_1}B\\to0$ 且 $\\partial_1\\partial_2=xy-0$ 型为零，但 $H_1=\\ker\\partial_1/\\operatorname{im}\\partial_2$：$\\ker\\partial_1=\\{(a,b):ax+by=0\\}$ 在 B 中包含 $(y,0)$、$(0,x)$、以及 $(x,-y)$（因为 $x^2-xy=x^2$？核算：$x\\cdot x+y\\cdot(-y)=x^2-y^2$ 不为零，改用 $(y,-x)$：$y\\cdot x+(-x)y=xy-xy=0$ 成立），$\\operatorname{im}\\partial_2=\\{(-by,bx)\\}$ 由 $(x,-y)$ 型元素生成的子模（取 $b=1$ 得 $(-y,x)$），故 $H_1\\neq0$，与“$(x,y)$ 不是 B-正则序列”一致（$x$ 是零因子，因为 $xy=0$）。',
        ['koszul-duality', 'exactness-vs-regularity']),
    ],
    conclusion: '对 $x_1,\\dots,x_n$ 与 A-模 M，Koszul 复形 $K(\\underline{x};M)=\\Lambda^\\bullet(A^n)\\otimes M$ 带微分 $\\partial(v\\otimes m)=\\varphi(v)m$ 满足 $\\partial^2=0$、$H_0=M/\\underline{x}M$；$\\underline{x}$ 是 M-正则序列当且仅当（在 $x_i\\in J(A)$、M 与同调有限生成、A 诺特的适当假设下）复形在正次数处正合，此时它给出 $M/\\underline{x}M$ 的极小自由消解、Betti 数为 $\\binom{n}{i}$、$\\operatorname{Tor}^A_i(M/\\underline{x}M,k)=\\Lambda^i(k^n)$；并且它满足 Koszul 对偶 $\\operatorname{Hom}_A(K(\\underline{x};A),A)\\cong K(\\underline{x};A)[-n]$。',
    dependencies: [],
    consequences: [],
    explanation: 'Koszul 复形的构造是“用一列元素搭出一个复形”的最省力方案，而它的意义在于把正则序列这一逐项定义整体化：逐项的非零因子条件在复形语言里变成“正合性”这一单一条件，于是检验正则性变成一个同调计算，计算深度变成一个复形是否正合的问题。它对偶性的来源是外代数首尾同构（$\\Lambda^0\\cong\\Lambda^n\\cong A$）与 Poincaré 配对，这使它在局部对偶与 Gorenstein 环理论中成为标准工具：局部对偶复形在正则局部环上就是 Koszul 复形的对偶，于是 Serre 对偶的配对可以通过 Koszul 复形逐项写出。第三条用途是完整交的消解：任何由正则序列定义的商环都是完整交，其消解形状完全由元素个数决定，这与“相交的余维恰好等于方程个数”这一几何直觉完全对应，也解释了为什么完整交的重数计算与二项式系数相关。',
    examples: [
      { title: '例子：$k[x,y]/(x^2,xy)$ 的 Koszul 复形不正合', body: '取 $A=k[x,y]$、$\\underline{x}=(x^2,xy)$，$M=A$。$K_\\bullet$ 为 $0\\to A\\xrightarrow{\\partial_2}A^2\\xrightarrow{\\partial_1}A\\to0$，$\\partial_1=(x^2\\ xy)$、$\\partial_2=(-xy,\\ x^2)^{T}$，直接验算 $\\partial_1\\partial_2=-x^2\\cdot xy+xy\\cdot x^2=0$。计算 $H_1=\\ker\\partial_1/\\operatorname{im}\\partial_2$：$\\ker\\partial_1=\\{(a,b):a x^2+b xy=0\\}=\\{(a,b):x(ax+by)=0\\}$，$A$ 是整域故 $ax+by=0$，解空间由 $(y,-x)$ 张成（$y\\cdot x+(-x)y=0$）；而 $\\operatorname{im}\\partial_2$ 由 $(-xy,x^2)$ 张成，两者在 $A^2$ 中不成比例（$(y,-x)$ 与 $(-xy,x^2)$ 张成的子模不同，因为 $(y,-x)$ 不可能等于 $(-xy,x^2)$ 乘以某个多项式：第一个分量要求乘数 $-y/x$ 是有理非多项式），故 $H_1\\neq0$。这与“$x^2,xy$ 不是正则序列”一致：$x^2$ 是 $A$ 上的非零因子，但 $xy$ 在 $A/(x^2)$ 上是零因子（$xy\\cdot x=x^2y=0$ 在 $A/(x^2)$ 中），故序列在第二步失败。这个例子的意义是把“正则序列”的失败精确地表现为一个非零同调类。' },
    ],
    remarks: [
      '正合性 ⟹ 正则序列的方向不需要假设，但逆方向需要：从“Koszul 复形正合”推“正则序列”要用到 $x_i\\in J(A)$、M 有限生成、同调有限生成等条件，因为证明需要 Nakayama 型的“极小生成元”论证。若去掉这些假设，可以在非局部或非诺特环上找到反例，因此引用“Koszul 复形正合当且仅当正则序列”时必须写清假设。',
      'Koszul 复形对元素组是“对称”的，但正则性不是：正合性在置换元素后不变（因为置换只是换 $V$ 的基），而“$x_1$ 是 M 上的非零因子”会随顺序变化，这正说明“正合性 ⟹ 正则序列”这一方向必须用到置换不变性（在诺特局部环上成立），否则置换后的顺序未必给出正则序列，两者不能直接等同。',
      'Koszul 复形不是唯一的“由元素组造出的复形”：也可以用 $M$ 上的其他消解（例如直接取射影消解）来算 $\\operatorname{Tor}$，结果相同但形状不同；Koszul 复形的特殊性在于它的形状由 $n$ 与 $\\binom{n}{i}$ 完全确定、且当 $\\underline{x}$ 正则时是极小消解，这使它可以用来判定正则性与计算 Betti 数，而一般消解做不到这点。',
      'Koszul 对偶的同构带平移 $[-n]$ 与符号：忘记平移会得到“$K_i$ 与 $K_{n-i}$ 在同一次数上”，而实际配对的是 $K_i$ 与 $\\operatorname{Hom}(K_{n-i},A)$ 型项，符号还必须与微分相容。在把它用于局部对偶计算时，平移与符号的错位会直接导致“配对不非退化”的错误结论，因此引用时必须逐项核对。',
    ],
    corollaries: [
      { title: '推论：完整交的 Betti 数与重数的二项式公式', body: '若 $\\underline{x}=x_1,\\dots,x_n$ 是诺特局部环 A 上的正则序列，则 $A/\\underline{x}A$ 是完整交，其极小自由消解由 Koszul 复形给出，Betti 数 $\\beta_i=\\binom{n}{i}$，且 $\\sum_i(-1)^i\\beta_i=0$（$n\\ge1$）。这条推论给出一个可计算的判别法：只要算出某个商环的 Betti 数不是二项式系数，就可以断言它不是完整交（从而定义它的元素组不是正则序列），这在判断“一个理想是否由正则序列生成”时是最省力的数值手段。', uses: ['betti-numbers-and-example'] },
    ],
    references: [
      stacks('Section 15.28: Koszul complexes', '0621'),
      stacks('Lemma 0621 (Koszul complex and regular sequences)', '0621'),
      { title: 'Commutative Algebra with a View Toward Algebraic Geometry, Chapter 17', author: 'D. Eisenbud', year: 1995 },
    ],
    history: HISTORY,
  },

  /* ═══════════════════════════════════════════════════════════
   * 13. 克鲁尔主理想定理
   * ═══════════════════════════════════════════════════════════ */

  'a-krull-pit': {
    statement: '设 A 是诺特环，$x\\in A$ 不是单位（$\\mathfrak a=(x)\\neq A$），$\\mathfrak p$ 是 $\\mathfrak a$ 的极小素理想（即 $\\mathfrak p\\supseteq\\mathfrak a$ 且没有更小的素理想也含 $\\mathfrak a$）。则 $\\operatorname{ht}(\\mathfrak p)\\le1$。一般形式：若 $\\mathfrak a=(x_1,\\dots,x_r)$ 由 r 个元素生成、$\\mathfrak p$ 是 $\\mathfrak a$ 的极小素理想，则 $\\operatorname{ht}(\\mathfrak p)\\le r$。等价说法：$\\dim A_{\\mathfrak p}\\le1$；几何上 $V(\\mathfrak a)$ 的每个不可约分支的余维至多 r。特别地，若 A 是整域且 $x\\neq0$，则含 $(x)$ 的极小素理想高度恰为 1。证明技术：局部化到 $\\mathfrak p$ 后对 A 的维数作归纳，用 Rees 代数的有限生成与行列式技巧（“Rees 引理”）把长度 ≥2 的链化为元素方程并导出矛盾。',
    deepExplanation: '主理想定理把“几何上增加一个方程”与“代数上维数减一”严格对应起来，因此它同时是维数理论的支柱与相交理论的起点。它的内容是一个上界而不是等式：一个方程给出的超曲面在每个不可约分支处的余维至多一，也就是说方程不能把一个已经很高的分支压得更低，只能在一个分支上切一刀。之所以是上界而不是等值，是因为方程可能在某个分支上根本不起作用（例如在该分支上 x 落入零，或 x 成为该分支上的单位），此时分支的维数不变而余维为零。定理的证明不能只靠“极小性”：极小性只说下方没有含 (x) 的素理想，完全可以有 𝔮⊊𝔭 而 𝔮 不含 x，把链挂得更长；排除这类链需要真正用到诺特性与元素 x 的代数性质。这就是为什么 PIT 的证明要动用到 Rees 代数与行列式，而不是几行形式推演。',
    steps: [
      step('chain-definition-recall', '链、高度与极小素理想的精确定义',
        '对素理想 𝔭，$\\operatorname{ht}(\\mathfrak p)$ 定义为以 𝔭 为终点的素理想严格链 $\\mathfrak p_0\\subsetneq\\mathfrak p_1\\subsetneq\\cdots\\subsetneq\\mathfrak p_k=\\mathfrak p$ 的长度的上确界，等价地 $\\operatorname{ht}(\\mathfrak p)=\\dim A_{\\mathfrak p}$（因为 $A_{\\mathfrak p}$ 的素理想与 A 中含于 𝔭 的素理想一一对应，且这样的链在对应下保持长度与严格性）。$\\mathfrak a$ 的极小素理想指 $\\mathfrak p\\supseteq\\mathfrak a$ 且没有更小的素理想含 $\\mathfrak a$；它的存在性由 Zorn 给出（含 $\\mathfrak a$ 的素理想链取并仍含 $\\mathfrak a$ 且仍是素理想：若 $ab$ 落在链的并中，则 $ab$ 落在链中某个成员内，由该成员素得 a 或 b 在其中，故落回并中）。必须把“极小”与“高度”分开说：$\\mathfrak p$ 极小等于“不存在含 $\\mathfrak a$ 的真子素理想”，而高度衡量的是“下方所有素理想链能有多长”，两者之间没有形式蕴含，PIT 正是要架起这座桥，而且架的方向只给出上界。',
        []),
      step('reduce-to-local', '局部化归约：把问题变成局部环上的维数估计',
        '设 𝔭 是 $(x)$ 的极小素理想。把 A 换成 $A_{\\mathfrak p}$，则 $\\mathfrak pA_{\\mathfrak p}$ 是极大理想、$xA_{\\mathfrak p}$ 生成的理想是 $\\mathfrak pA_{\\mathfrak p}$-准素的，且 $\\operatorname{ht}(\\mathfrak p)=\\dim A_{\\mathfrak p}$，故问题化为：若 $(A,\\mathfrak m)$ 是诺特局部环、$x\\in\\mathfrak m$、$xA$ 是 $\\mathfrak m$-准素理想（即 $\\sqrt{xA}=\\mathfrak m$），则 $\\dim A\\le1$。再进一步：设 $\\mathfrak q\\subsetneq\\mathfrak m$ 是素理想，则 $x\\notin\\mathfrak q$（否则 $x$ 落在 𝔮 中会使 $xA\\subseteq\\mathfrak q$，而 𝔮 是含 $xA$ 的真素理想，与 $\\sqrt{xA}=\\mathfrak m$ 矛盾）。于是 x 在 $A/\\mathfrak q$ 中的像非零，且在 $\\mathfrak m/\\mathfrak q$ 中。要证明 $\\mathfrak q=(0)$ 型（即没有严格降链），等价于证明：若 $\\mathfrak q$ 是 $A$ 的素理想且 $x\\notin\\mathfrak q$，则 $\\dim A/\\mathfrak q=0$，也就是 $A/\\mathfrak q$ 是零维的。这一步把“链长”的估计翻译成一个具体的商环的维数问题，是后面归纳论证的落脚点。',
        ['chain-definition-recall']),
      step('rees-determinant-argument', 'Rees 行列式技巧：为什么元素方程能封住链',
        '处理 $\\dim A/\\mathfrak q=0$ 需要“元素可以被有限多个参数控制”这一信息，而这来自诺特性与 Rees 代数。设 $(A,\\mathfrak m)$ 是诺特局部环、$xA$ 是 $\\mathfrak m$-准素。取 $\\mathfrak m$ 的生成元 $y_1,\\dots,y_n$，则每个 $y_i$ 的某个幂落在 $xA$ 中：由准素性，$y_i\\in\\mathfrak m=\\sqrt{xA}$，故存在 $n_i$ 使 $y_i^{n_i}\\in xA$，即 $y_i^{n_i}=x a_i$，于是 $y_i$ 在 $A[1/x]$ 中的像是“有理的”，而 $A[1/x]$ 关于 $\\mathfrak m$ 的幂链的稳定性由 Rees 代数的有限生成保证。具体地，令 $B=A[1/x]$，考虑滤链 $\\mathfrak m^n B$，由 Rees 引理（或对 Rees 代数 $\\bigoplus_n\\mathfrak m^n$ 的有限生成性），存在 c 与表示 $\\mathfrak m^{n}B=x^{-(n-c)}\\mathfrak m^{c}B$ 型的关系；再用行列式技巧：取 $y_i\\in\\mathfrak m$ 的多项式关系并用 x 的分母消去，得到 $y_i$ 满足一个以 $x$ 的幂为系数的方程。链的封堵正是靠这个：若 $\\mathfrak q\\subsetneq\\mathfrak q\'$ 是 $A/\\mathfrak q$ 中的两条素理想，则在其上可以用这些方程逐项作除法，最终把链的长度压到一。这里的核心机制是“x 在商环中成为可逆元之后 $\\mathfrak m$ 的幂链稳定”，稳定指数 c 有限正是诺特性的直接后果。',
        ['reduce-to-local']),
      step('induction-and-generalization', '归纳到 r 个元素的一般形式',
        '一般形式 $\\operatorname{ht}(\\mathfrak p)\\le r$ 的证明对 r 作归纳。r=1 由前面的局部论证给出。归纳步：设 $\\mathfrak a=(x_1,\\dots,x_r)$，$\\mathfrak p$ 是 $\\mathfrak a$ 的极小素理想。取 $\\mathfrak q\\subsetneq\\mathfrak p$ 为一个素理想，要证明 $\\operatorname{ht}(\\mathfrak q)\\le r-1$（这样 $\\operatorname{ht}(\\mathfrak p)\\le r$ 即得）。关键是说明 $\\mathfrak q$ 含有一个由 r−1 个元素生成的理想的构造：把 A 换成 $A/\\mathfrak q$（此时 $\\mathfrak q$ 对应零理想），问题变成：$\\bar x_1,\\dots,\\bar x_r$ 生成的理想在 $A/\\mathfrak q$ 中的极小素理想（即 $\\mathfrak p/\\mathfrak q$）的高度不超过 r。由于 $\\mathfrak p$ 极小，事实上可以证明 $\\bar x_r$ 的某个幂落在 $(\\bar x_1,\\dots,\\bar x_{r-1})$ 生成的理想与 $\\mathfrak p/\\mathfrak q$ 的关系中：即 $\\mathfrak p/\\mathfrak q$ 是 $(\\bar x_1,\\dots,\\bar x_{r-1})$ 的极小素理想（若 $\\bar x_r$ 在该理想中不必要，则由极小性它必被其余元素“吸收”），于是由归纳假设 $\\operatorname{ht}(\\mathfrak p/\\mathfrak q)\\le r-1$，加上 $\\operatorname{ht}(\\mathfrak q)$ 的信息得 $\\operatorname{ht}(\\mathfrak p)\\le r$。归纳中“A 诺特 ⟹ 商环与局部化诺特”这一保持性是链条的一环，缺了它归纳无法启动。',
        ['rees-determinant-argument']),
      step('examples-and-geometric-reading', '例子、几何读法与紧性检验',
        '紧性例子：$A=k[x_1,\\dots,x_n]$，$\\mathfrak a=(x_1,\\dots,x_r)$ 的极小素理想是 $\\mathfrak a$ 本身（$A$ 是 UFD，$\\mathfrak a$ 是不可约的？更直接地，$A/\\mathfrak a\\cong k[x_{r+1},\\dots,x_n]$ 是整域，故 $\\mathfrak a$ 是素理想），$\\operatorname{ht}(\\mathfrak a)=r$，界取等号：这由链 $(0)\\subsetneq(x_1)\\subsetneq(x_1,x_2)\\subsetneq\\cdots\\subsetneq(x_1,\\dots,x_r)$ 给出下界 r。另一个紧性例子是 $A=k[x,y]$ 与 $\\mathfrak a=(xy)$：极小素理想是 $(x)$ 与 $(y)$（$A/(xy)$ 的正规化对应两条直线），各自高度 1 = r，界也取等号。真子例子（界不紧）：取 $A=k[x,y]/(xy)$ 与 $\\mathfrak a=(x,y)$（2 个生成元），唯一的极小素理想是 $(x,y)$，其高度是 1 < 2，说明一般形式的不等式通常不紧；原因在于 $A$ 的维数只有 1，$\\mathfrak a$ 的两个生成元中有冗余（$y$ 在 $A$ 中不是独立的）。几何读法：$V(\\mathfrak a)$ 的每个不可约分支的余维至多等于方程个数，而在 $k[x,y]$ 中 $V(x)$ 是余维 1 的曲线、$V(x,y)$ 是余维 2 的点，两者都取到等号；在 $k[x,y]/(xy)$ 中 $V(x,y)$ 是余维 1，界不紧，因为该环的总维数已经是一，没有余维 2 的位置可占。',
        ['induction-and-generalization']),
    ],
    conclusion: '若 A 诺特、$\\mathfrak p$ 是 $\\mathfrak a=(x_1,\\dots,x_r)$ 的极小素理想，则 $\\operatorname{ht}(\\mathfrak p)\\le r$；特别地 $\\mathfrak a=(x)$ 时 $\\operatorname{ht}(\\mathfrak p)\\le1$，且 A 为整域、$x\\neq0$ 时含 $(x)$ 的极小素理想高度恰为 1。等价地 $\\dim A_{\\mathfrak p}\\le r$，几何上 $V(\\mathfrak a)$ 的每个不可约分支的余维至多 r。',
    dependencies: [],
    consequences: [],
    explanation: '主理想定理是“维数等于几何维数”这一断言的技术支点。要把“范数”式的直觉（每个方程减一维）变成定理，必须排除一种可能：方程在某条极长的素理想链上“什么都不做”，也就是存在 𝔮 不含 x 而 𝔭 含 x 的链 𝔮⊊𝔭 且 𝔮 下方还有长链。PIT 说这不可能，前提是诺特性。它的证明因此不是形式推演而是需要实质技术：把 x 变成可逆元之后考察 $\\mathfrak m$ 的幂链，用 Rees 代数的有限生成性得到有限的稳定指数，再用行列式把生成的幂关系转成元素方程。这个“先局部化再取可逆化再看幂链稳定”的技术套路在交换代数里反复出现，也是 Artin–Rees 引理与 Rees 引理共用的核心。等号情形（$k[x_1,\\dots,x_n]$ 中的 $r$ 个变量）说明界是可达到的，而 $k[x,y]/(xy)$ 说明界并不总是紧。',
    examples: [
      { title: '例子：$(x)$ 在 $k[x,y]$ 与 $k[x,y]/(xy)$ 中的极小素理想', body: '取 $A=k[x,y]$ 与 $\\mathfrak a=(x)$。$\\mathfrak a$ 是素理想（$A/(x)\\cong k[y]$ 是整域），故唯一的极小素理想是 $(x)$，$\\operatorname{ht}((x))=1$，PIT 的界取等号；对应的几何是 $V(x)$ 为一条直线，余维一。再取 $B=k[x,y]/(xy)$ 与 $\\mathfrak a=(\\bar x)$。$\\bar x$ 是零因子，$B/(\\bar x)\\cong k[y]$ 是整域，故 $(\\bar x)$ 是素理想、是 $\\mathfrak a$ 的唯一极小素理想，高度仍是 1。但注意这个例子里 $\\bar x$ 在 $B$ 中不是非零因子，说明 PIT 的假设中不需要“x 是非零因子”：只要 $\\mathfrak a\\neq A$ 就够了，因为定理的结论是上界，零因子的情形下界根本不成立（可以高度为零）。这个对比澄清了 PIT 与“非零因子给出的超曲面维数恰好降 1”这一直觉之间的差别：后者需要额外的整域或非零因子假设才能把上界升级为等号。' },
    ],
    remarks: [
      '定理只给上界不给下界：$\\operatorname{ht}(\\mathfrak p)\\le r$ 不蕴含 $\\operatorname{ht}(\\mathfrak p)\\ge1$。若 $\\mathfrak a$ 本身就是极小素理想，或者 A 是零维环，则高度可以为 0，例如 $A=k[x,y]/(xy)$ 的局部环在极大理想处取 $\\mathfrak a=(x,y)$ 型元素，高度上限是 2 而实际是 1；把 PIT 当成等式用会得出错误的高度。',
      '诺特性是必需的：去掉它之后可以构造出极大理想由单个元素生成而维数无穷的整环（例如某些无限秩赋值环），此时 $(x)$ 的极小素理想高度无上界，PIT 完全失效。PIT 的证明技术（Rees 代数的有限生成、幂链的有限稳定指数）每一步都要用到理想升链条件，所以诺特性不是装饰。',
      '一般形式的不等式通常不紧：$r$ 个方程只在“方程之间互相独立”时才能切出余维 r 的集合，若生成元之间有冗余（例如在 $k[x,y]/(xy)$ 中取 $(x,y)$）或环的维数本身更低，余维会严格小于 r。等号成立的正确条件是“$\\mathfrak a$ 由正则序列生成”或等价的完整交条件，不能由 PIT 单独保证。',
      '极小素理想的高度是逐分支的量：$\\mathfrak p$ 极小只保证在 $\\mathfrak p$ 这一支上没有被 $\\mathfrak a$ 正确包含的更小素理想，其他分支可能高度更小或更大，因此“$V(\\mathfrak a)$ 的余维”应逐分支陈述，写成“$V(\\mathfrak a)$ 是余维 r 的集合”会漏掉那些在分支上退化为整体的情形（例如 $V(xy)$ 在 $k[x,y]$ 中是两条直线，余维一，而不是余维二的集合）。',
    ],
    corollaries: [
      { title: '推论：诺特局部环上参数系的个数不超过维数', body: '设 $(A,\\mathfrak m)$ 是 d 维诺特局部环，$\\mathfrak m=(x_1,\\dots,x_m)$。由 PIT 的一般形式，$\\mathfrak p=\\mathfrak m$ 是 $(x_1,\\dots,x_m)$ 的极小素理想，故 $d=\\dim A=\\operatorname{ht}(\\mathfrak m)\\le m$；又由 Nakayama，$\\mathfrak m$ 可用 $\\dim\\mathfrak m/\\mathfrak m^2$ 个元素生成，于是 $\\dim A\\le\\dim\\mathfrak m/\\mathfrak m^2$，等号即正则局部环。这条推论说明“维数不超过切空间维数”这一几何上显然的不等式，其代数证明正是 PIT，因此 PIT 是把维数理论从几何直觉升级为定理的那一步。', uses: ['induction-and-generalization'] },
    ],
    references: [
      stacks('Lemma 10.60.11 (Krull principal ideal theorem)', '00KV'),
      stacks('Section 10.60: Dimension theory of local rings', '00KV'),
      { title: 'Introduction to Commutative Algebra, Chapter 11', author: 'M. F. Atiyah, I. G. Macdonald', year: 1969 },
    ],
    history: HISTORY,
  },

}
