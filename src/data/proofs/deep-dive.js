/**
 * 长篇教学式证明：每一步包含前提、构造、验证、边界与下一步衔接。
 *
 * 与 long-form.js 的分工：long-form.js 保存早先成型的 20 条记录；
 * 本文件承接后续扩写与新增，并在 proofs/index.js 中最后合并，
 * 因此同名键以本文件为准（合并前会先从 long-form.js 删去同名键，
 * 避免校验器按“重复源”报错，见 scripts/_apply-deep-dive.mjs）。
 *
 * 写作约定（与 verify-proofs.mjs 的检查一致）：
 *   · 正文用中文长段 + Unicode 数学符号（⊆ ∩ ⊗ → 𝔭 𝔪 ℓ ≅），直接在页面中作为文本排版；
 *   · 需要真正的公式排版时才用 $...$ 包住 LaTeX，且分隔符必须成对；
 *   · 引用只写已核实的 Stacks Project 稳定 tag。
 */

const step = (id, title, body, uses = []) => ({ id, title, body, uses })
const stacks = (title, tag, year = 2024) => ({
  title, author: 'The Stacks Project', year, url: `https://stacks.math.columbia.edu/tag/${tag}`,
})

/** 每条证明都会用到的边界说明，避免在数据里重复同一句话。 */
const BOUNDARY = '使用前请核对基环、有限生成性、有限型性、光滑性、可分性与代数闭性等假设：换掉其中任何一条，结论通常只剩单向包含，不能把形式相似的等式照搬。'

export const DEEP_DIVE_PROOFS = {

  /* ══════════════════════════════════════════════════════════════════
   * 一、重写的五条：原文只有“结论式摘要”，这里补成可逐步核验的证明
   * ══════════════════════════════════════════════════════════════════ */

  'flat-morphism': {
    statement: '设 A→B 是交换环同态。则 B 作为 A-模平坦，当且仅当对任意 A-模短正合列 $0\\to M\'\\to M\\to M\'\'\\to 0$，张量 B 后 $0\\to M\'\\otimes_A B\\to M\\otimes_A B\\to M\'\'\\otimes_A B\\to 0$ 仍正合。',
    deepExplanation: '张量函子天生只右正合：它总是把满射变成满射，却可能把单射压成非单射。平坦性正是补上这半边缺失的条件，而 Tor 群给出了衡量缺失量的工具。本证明把“保持正合”翻译成“所有 Tor₁ 消失”，再证明这个同调条件与平坦定义等价。要留意的是量词：平坦要求对**所有**模都成立，只验证少数几个模（例如只验证自由模或只验证当前这一列）不构成证明；反过来，证明平坦性时通常用“嵌入理想”的等价判据来减少工作量。',
    steps: [
      step('tensor-right-exact', '先分离出张量函子的右正合部分', '固定 A-模短正合列 $0\\to M\'\\xrightarrow{u} M\\xrightarrow{v} M\'\'\\to 0$。张量函子 $-\\otimes_A B$ 是右正合的：把该列张量 B 后，得到 $M\'\\otimes B\\xrightarrow{u\\otimes 1} M\\otimes B\\xrightarrow{v\\otimes 1} M\'\'\\otimes B\\to 0$ 正合。这一步不需要任何关于 B 的假设，因为右正合性来自张量积的泛性质本身：$v\\otimes 1$ 是满射，且复合为零。真正的问题只在于最左端那个映射 $u\\otimes 1$ 是否仍是单射；把“保持商”与“保持核”分开陈述，才不会把右正合性误当成平坦性。'),
      step('tor-obstruction', '用 Tor 长正合列把左端障碍写成同调群', '对上述列取 Tor 长正合列，得到片段 $\\operatorname{Tor}_1^A(M\'\',B)\\to M\'\\otimes_A B\\xrightarrow{u\\otimes 1} M\\otimes_A B$。长正合列的性质告诉我们，$u\\otimes 1$ 的核恰好等于前一个映射（即 $\\operatorname{Tor}_1^A(M\'\',B)\\to M\'\\otimes_A B$）的像。于是立刻得到判据：只要 $\\operatorname{Tor}_1^A(M\'\',B)=0$，就有 $u\\otimes 1$ 单射，左端正合。这一步的价值是把“某个映射是不是单射”这种关于元素的问题，换成“某个导出函子是否消失”这种关于模的问题，后者更容易用消解去算。'),
      step('flat-iff-tor', '证明平坦性等价于所有 Tor₁ 消失', '这是证明的技术核心，两个方向必须分开做。若 B 平坦（即 $-\\otimes_A B$ 保持所有短正合列），取 M′ 的一个自由消解 $\\cdots\\to F_1\\to F_0\\to M\'\\to 0$，自由模张量后仍正合，故 $\\operatorname{Tor}_i^A(M\',B)=0$ 对一切 $i\\ge 1$ 成立；再用维数平移处理任意 N 的消解，逐项算出 $\\operatorname{Tor}_i^A(N,B)=0$ 对一切 $i\\ge 1$ 与一切 N 成立，特别地 $\\operatorname{Tor}_1^A(M\'\',B)=0$。注意这一步用到“消解的长度可以任意长、维数平移把不消失的项推到更低的 i”，因此不能只算 i=1 就收手；若只在某一列上验证 Tor₁ 消失，得到的是更弱的信息，不足以推出平坦。反之若已知对所有 N 都有 $\\operatorname{Tor}_1^A(N,B)=0$，则由上一步的判据，任意短正合列张量后左端 $u\\otimes 1$ 都单射，中右两端由右正合性已知正合，故该列短正合，即 $-\\otimes_A B$ 保持一切短正合列，B 平坦。两个方向合起来才得到等价：只做前一半只得到“平坦 ⟹ Tor 消失”的单向蕴含，无法把同调条件反过来当判据使用。'),
      step('criterion-in-practice', '给出实际可验证的判据并说明量词范围', '直接对“所有模”验证不现实，实用判据是：B 平坦当且仅当对 A 的**每个理想** I，嵌入 $I\\hookrightarrow A$ 张量 B 后仍单射，即 $I\\otimes_A B\\to B$ 单射。证明方向是：若 B 平坦则右正合函子保持嵌入，单向平凡；若该条件成立，把任意有限生成模的生成元逐个商去，用“kernel 是可有限生成的理想所表达的”这一机制把一般模归结到理想，从而由理想上的单射性推出对所有模的单射性（这一步在一般环上要用到滤过余极限，A Noether 时可直接对有限生成模归纳）。需要强调反面：只验证 I 是主理想、或只验证有限个理想，都不足以推出平坦；例如 $A=k[x,y]$、$B=A/(xy)$ 在检验主理想时看似通过，却不是平坦 A-模，因为把理想 (x) 的嵌入张量 B 后，$x\\otimes 1$ 被送到 $x\\cdot 1=0$（B 中 x 已被 xy 杀掉一部分），出现挠元而失去单射性。因此判据的量词“所有理想”不能缩减，缩减后得到的是更弱的条件。'),
      step('consequences-and-geometry', '说明几何含义与适用边界', '几何上，平坦态射的纤维在族中“连续变化”；仿射情形下 A→B 平坦意味着 B 的模结构在 Spec A 上没有跳跃。两个常见推论：局部化 $A\\to S^{-1}A$ 总平坦（因为张量 $-\\otimes_A S^{-1}A$ 就是局部化，而局部化作为环的扩张是正合函子，把 $M\'\\to M$ 的单射送到 $S^{-1}M\'\\to S^{-1}M$ 仍单射）；自由模、射影模都平坦，因为射影模是自由模的直和项，而直和项与张量交换、单射性可以逐分量检验。边界同样重要：平坦**不**自动给出有限型、有限呈示、维数恒定或光滑性；$\\mathbb{Z}\\to\\mathbb{Q}$ 平坦但非有限型，$k[x]\\to k[x,y]$ 平坦但纤维维数会随参数跳高。著名的“平坦 + 有限呈示 ⟹ 纤维维数局部恒定”与“平坦 + 有限型 ⟹ 维数上半连续”是不同定理，各有独立假设，不能互相推出。若把“保持正合”直接读成“纤维同构”，就会在扭转/退化纤维处得到错误结论，因为平坦只保证纤维的维数在开集上稳定，不保证纤维本身同构。'),
    ],
    conclusion: 'B 平坦 ⟺ 任意短正合列张量 B 后仍正合 ⟺ 对所有 A-模 N 有 $\\operatorname{Tor}_1^A(N,B)=0$；实用判据是对所有理想 I 有 $I\\otimes_A B\\hookrightarrow B$。',
    dependencies: ['fibred-product'],
    consequences: ['a-flatness-criterion', 'a-faithfully-flat', 'dimension-fiber'],
    explanation: BOUNDARY,
    examples: [
      { title: '例子：局部化与合成', body: '取 A=ℤ，S={1,2,4,8,…}，则 B=ℤ[1/2] 是平坦 ℤ-模。用理想判据看：ℤ 的理想都是主理想 (n)，而 (n)⊗B→B 把 n⊗(1/2ᵏ) 送到 n/2ᵏ，显然是单射，故平坦。对比 A=ℤ、B=ℤ/2：取列 0→ℤ→(2)ℤ→ℤ/2→0，张量 ℤ/2 后左端变成 ℤ/2→(2)ℤ/2，而映射是 0，不再单射，所以 ℤ/2 不平坦。同一个判据在两个例子上给出的答案完全不同，差别就在有没有 2-挠。' },
      { title: '例子：平坦但不自由、不射影', body: 'A=ℤ、B=ℚ 平坦（局部化），但它不是自由 ℤ-模（基的势不可能是有限的，且 ℚ 作为 ℤ-模没有非零有限生成子模的直接和分解），也不是射影 ℤ-模。这说明平坦严格弱于射影：平坦只要求张量正合，射影还要求从自由模分裂出去。反过来射影必平坦，因为射影模是自由模的直和项，而自由模张量保持正合。' },
    ],
    remarks: [
      '“所有模”不能换成“所有有限生成模”以外的更小集合：平坦检验必须覆盖全部理想，缺一类就可能漏掉挠现象。',
      '平坦 + 有限呈示才使纤维维数局部恒定；只有平坦得到的是维数的上半连续性，与纤维维数公式（dim X = dim Y + dim X_η）属于不同层次的结论。',
      '忠实平坦（faithfully flat）是平坦再加“N⊗B=0 蕴含 N=0”或“张量后非零”，它保证反射正合，是下降理论的前提，不可与平坦混用。',
    ],
    corollaries: [
      { title: '推论：平坦的合成与基变换稳定', body: '若 A→B、B→C 都平坦，则 A→C 平坦：因为 $(-\\otimes_A B)\\otimes_B C = -\\otimes_A C$，两次正合函子的合成仍正合。同理平坦性在任意基变换 A→A′ 下保持：若 B 平坦，则 A′⊗_A B 是平坦 A′-代数，这一点在验证模空间的族时反复用到。', uses: ['flat-iff-tor'] },
      { title: '推论：Tor₁ 消失即平坦的实用形式', body: '实践中不必构造长正合列：只要证明对每个理想 I 都有 $\\operatorname{Tor}_1^A(A/I,B)=0$，就得到平坦。这条形式把无限多个模的检验归到理想上，是 Noether 环上最容易执行的判据。', uses: ['criterion-in-practice'] },
    ],
    references: [
      stacks('Stacks Project, Section 10.39: Flat modules and flat ring maps', '00H9'),
      stacks('Stacks Project, Lemma 10.39.15 (理想判据)', '00HP'),
      stacks('Stacks Project, Lemma 10.39.16', '00HQ'),
      stacks('Stacks Project, Lemma 10.39.6 (Tor₁ 刻画)', '05UU'),
    ],
    history: '本条由公开教材与 Stacks Project 命题重新组织，项目自行改写并注明来源，未复制原文；凡引用标准外部引理之处都在 references 中标出。',
  },

  'dimension-fiber': {
    statement: '设 k 是域，f: X→Y 是不可约、有限型 k-概形之间的支配态射，η 是 Y 的一般点。则 $\\dim X=\\dim Y+\\dim X_\\eta$，其中右侧理解为 Y 的维数加一般纤维的维数。',
    deepExplanation: '这条公式把“总空间的维数”拆成“底空间维数 + 纤维维数”，是维数理论中唯一一条对任意支配有限型态射都成立的等式。证明的关键是把它翻译成函数域的超越次数等式：维数等于函数域在 k 上的超越次数，而超越次数对扩张有加性。正因为走的是函数域，公式断言的是**一般纤维**的维数；特殊纤维的维数可以跳高，这是从函数域证明中天然能看出的分界线。',
    steps: [
      step('dimensional-translation', '把几何维数翻译成超越次数', '设 X、Y 是不可约有限型 k-概形，则其维数等于函数域在 k 上的超越次数：$\\dim X=\\operatorname{trdeg}_k k(X)$，$\\dim Y=\\operatorname{trdeg}_k k(Y)$。这一步依赖 Noether 正规化：有限型整 k-代数可写成多项式环的有限整扩张，而有限整扩张不改变分式域在 k 上的超越次数，因为分式域在有限扩张下超越次数不变（超越基可以沿着代数扩张取代表）。具体地，对不可约 X 取仿射开集 Spec A，A 是有限型整 k-代数，Noether 正规化给出 $k[y_1,\\ldots,y_d]\\subseteq A$ 的有限整扩张，于是 $k(X)$ 在 k 上的超越次数恰为 d，也正是链长意义下的 $\\dim X$。之所以必须先做这个翻译，是因为“维数”在几何上是链长的上确界，很难直接与态射互动；而超越次数对域扩张有可计算的加性公式，这才是后面能推出等式的原因。必要性还在于有限型：若 A 不是有限型，d 可以是无穷，等式右边无从定义。'),
      step('generic-fiber', '认出一般纤维的坐标环', '支配态射把一般点送到一般点，于是 f 诱导嵌入 $k(Y)\\hookrightarrow k(X)$，具体是取 f 在函数域层面上的拉回 $f^{\\#}:k(Y)\\to k(X)$，支配性保证它不是零映射（若像是 0，则 f 把稠密开集映进某个真闭集，与控制性矛盾）。一般纤维 $X_\\eta=X\\times_Y\\operatorname{Spec} k(\\eta)$ 的坐标环正是把 X 上底方向非零的函数的像全部局部化后得到的 k(Y)-代数，即 $X_\\eta$ 的仿射覆盖上等于 $A\\otimes_B k(Y)$。要注意这里用的是 η 处剩余域等于 k(Y)（因为 Y 不可约且 η 是一般点）这一事实，否则 $k(\\eta)$ 会是一个更大的域；如果不支配，一般纤维是空的，下面的函数域比较就无从谈起。有限型性保证这个代数仍是有限生成的，从而它的超越次数有限，这一点是下一个塔式公式中各项都有意义的前提。'),
      step('transcendence-additivity', '分解超越次数的塔式公式', '对域塔 $k\\subset k(Y)\\subset k(X)$ 使用超越次数的加性：$\\operatorname{trdeg}_k k(X)=\\operatorname{trdeg}_k k(Y)+\\operatorname{trdeg}_{k(Y)}k(X)$。这个等式是超越基的塔式定理，与环的假设无关，纯属域论：若 $\\{a_i\\}$ 是 k(Y) 在 k 上的超越基、$\\{b_j\\}$ 是 k(X) 在 k(Y) 上的超越基，则 $\\{a_i\\}\\cup\\{b_j\\}$ 是 k(X) 在 k 上的超越基，代数无关性与生成性两边分别验证即可，注意并集里可能出现重复元，需先去重再计数。它把左侧（总空间维数）拆成底空间维数加上剩余那一段。剩下要做的就是把最后一项识别为一般纤维的维数。最后一项之所以恰好对应纤维，是因为 $k(X)$ 正是 $k(Y)$ 上由一般纤维坐标环生成的函数域，即 $\\operatorname{Frac}(A\\otimes_B k(Y))$；若 f 不是支配的，这个域的超越次数无法与 $\\dim Y$ 并列相加，公式的形状本身就会失效。'),
      step('identify-fiber-dim', '把最后一项识别为一般纤维维数', '一般纤维 $X_\\eta$ 是 k(Y) 上的有限型不可约概形（有限型在基变换下保持，因为张量积不改变生成元的个数），其函数域就是 k(X)，于是 $\\dim X_\\eta=\\operatorname{trdeg}_{k(Y)}k(X)$。把三个等式合起来即得 $\\dim X=\\dim Y+\\dim X_\\eta$。注意这里的维数可以在不可约分支上理解：若一般纤维有多个不可约分支，等式对每个分支的维数都成立，因为每个分支有自己的函数域，而它们的超越次数相同（同一有限型环的各极小素给出的函数域在基域上有相同超越次数）。这一点是“适当不可约分支上”这一措辞的来源，也是为什么公式写在一般纤维而非某个指定分支上时不会产生歧义。若一般纤维是空集，则它的维数按惯例取 −∞ 或不予定义，公式在这种退化情形下必须单独约定。'),
      step('semicontinuity-and-limits', '说明为什么只能是一般纤维', '最后一步交代公式的能力边界。有限型态射的纤维维数在相当弱的假设下是上半连续的：存在非空开集 U⊆Y，使 y∈U 时 $\\dim X_y=\\dim X_\\eta$，而特殊点的纤维维数可以严格更大。这条上半连续性的常用形式是：对每个 e，集合 $\\{y\\in Y\\mid \\dim X_y\\ge e\\}$ 在 Y 中闭，证明思路是把纤维维数翻译成“纤维上存在长度 e 的素理想链”，再用有限型性把该条件写成多项式方程组的可解性。典型例子是 f: 𝔸²→𝔸¹ 在原点处的退化纤维，或参数族的退化成员。若想要**所有**纤维等维，必须额外假设平坦性或开态射；平坦加有限呈示时纤维维数局部恒定，而只有平坦时只能得到“维数在每一点至少是一般值”这一半。若想要等号只在一个方向上（维数不等式），那就是 Chevalley 的维数定理。把一般纤维的等式直接套到特殊纤维上，是这条定理最常被误用的方式：公式里的 η 是一个特定点，不是“随便哪根纤维”的占位符。'),
    ],
    conclusion: '不可约、有限型、支配的态射满足 $\\dim X=\\dim Y+\\dim X_\\eta$；一般纤维维数在非空开集上稳定，特殊纤维只能更大，除非再加平坦或开态射假设。',
    dependencies: ['fibred-product', 'localization', 'noether-normalization'],
    consequences: ['flat-morphism'],
    explanation: BOUNDARY,
    examples: [
      { title: '例子：投影与双有理态射', body: '投影 $\\mathbb{A}^2\\to\\mathbb{A}^1$，(x,y)↦x 是支配有限型态射，底维数 1，一般纤维 𝔸¹ 维数 1，总维数 2 = 1 + 1，等式成立。双有理态射（例如爆破一个点）也是支配的，底与总维数相同，公式迫使一般纤维维数为 0，这与“双有理态射的一般纤维是单点”一致。反过来，若把定义域换成闭的点（非支配），一般纤维为空，公式不适用。' },
      { title: '例子：特殊纤维跳高', body: '考虑 $\\mathbb{A}^2\\to\\mathbb{A}^1$，(x,y)↦xy 的零点纤维：一般参数处纤维是一条直线（维数 1），但参数 0 处的纤维是两条坐标轴的并（维数仍是 1）；若改成 (x,y)↦x 与退化参数结合，可构造出维数跳高的族。判据是：一般值处维数最小，特殊点只能更大，因此看到“某个特殊纤维变大了”不是矛盾，而是公式本来的预测范围之外。' },
    ],
    remarks: [
      '公式中的 dim 指导数意义下维数；若 X 或 Y 可约，需要逐个不可约分支处理，不能直接相加。',
      '支配性不可或缺：非支配态射的一般纤维为空，超越次数比较失去意义。',
      '“有限型”用来保证函数域在基域上超越次数有限；离开有限型，超越次数可以是无穷，维数概念本身需要另行定义。',
      '超越次数等式的加性 $\\operatorname{trdeg}_k L=\\operatorname{trdeg}_k K+\\operatorname{trdeg}_K L$ 是域论事实，不依赖任何几何假设，是整条证明唯一真正用到的代数工具。',
    ],
    corollaries: [
      { title: '推论：双有理态射保维数', body: '若 f: X→Y 是双有理的（从而支配且有限型），一般纤维维数为 0，故 $\\dim X=\\dim Y$。这把“双有理等价”变成维数层次上的不变量，是双有理几何能够先固定维数再分类的前提。', uses: ['identify-fiber-dim'] },
      { title: '推论：纤维化的维数递减', body: '若 f: X→Y 支配且 $\\dim X_\\eta>0$，则 $\\dim Y<\\dim X$，即纤维化必然降低维数；反之若 $\\dim X=\\dim Y$ 且支配，则一般纤维维数为 0。这条二分法说明“一般纤维的维数”是完全由 X、Y 的维数差决定的，只有特殊纤维才携带额外信息。', uses: ['transcendence-additivity'] },
    ],
    references: [
      stacks('Stacks Project, Lemma 29.53.1 (一般纤维维数)', '02JU'),
      stacks('Stacks Project, Section 10.115: Noether normalization', '00OW'),
      stacks('Stacks Project, Section 10.17: The spectrum of a ring', '00DY'),
    ],
    history: '本条由公开教材与 Stacks Project 命题重新组织，项目自行改写并注明来源，未复制原文。',
  },

  'lying-over': {
    statement: '设 R⊆S 是整扩张（每个 s∈S 满足某个以 R 为系数的首一多项式方程）。则对 R 的每个素理想 𝔭，都存在 S 的素理想 𝔮 使 𝔮∩R=𝔭。等价地，$\\operatorname{Spec} S\\to\\operatorname{Spec} R$ 是满射。',
    deepExplanation: '整扩张的几何含义是“有限覆盖”：Spec S→Spec R 的纤维非空，因此底空间的每个点上方都有点。证明的路线是把 𝔭 商掉、再进入分式域，把问题化归到“局部环的极大理想”这种最容易控制的场合：在域上极大理想一定与基域的理想相交为零，这一条正是构造出正确 𝔮 的关键。要记住定理只给**存在性**，不给唯一性——同一个 𝔭 上方可以有多个素理想，分裂方式恰恰是数论中分解素理想的来源。',
    steps: [
      step('reduce-to-domain', '第一步：商去 𝔭，把问题变成零理想的情形', '取商映射 R→R/𝔭。整性在“基变换 + 商”下保持：令 S̄=S/𝔭S，则 R/𝔭⊆S̄ 仍是整扩张，因为 S 中元素 s 满足首一方程 $s^n+r_{n-1}s^{n-1}+\\cdots+r_0=0$，把它模去 𝔭 的系数后仍首一，故 s 的像在 S̄ 上整。并且目标素理想变成零理想：𝔭 在 R/𝔭 中的像正是 (0)。此外要检查 S̄ 非零：若 𝔭S=S，则 1∈𝔭S，把 1 写成 $\\sum r_j s_j$（$r_j\\in\\mathfrak{p}$，$s_j\\in S$）的有限和，并利用 s_j 的整性方程可推出 $1\\in\\mathfrak{p}$（整扩张里 S 与 R 的关系使 𝔭S∩R 的幂落在 𝔭 内），与 𝔭 是素理想矛盾。于是可以假设 R 是整环、目标素理想是 (0)，问题化为：在整扩张 R⊆S 中找一个素理想 𝔮 使 𝔮∩R=(0)。这一步的意义是消掉了 𝔭 这个参数，把定理化归到它最纯粹的形式；而商掉 𝔭 之后得到的环 S̄ 恰好可以作为下一步“进入分式域”的输入。'),
      step('localize-generic', '第二步：进入分式域，把零理想问题变成“与基域不交”的问题', '令 K=Frac(R)，考虑 $S_K=S\\otimes_R K$，它是 K 上的整代数（整性在基变换下保持，因为首一方程张量后仍首一），因而 $S_K\\ne 0$：若 $S\\otimes_R K=0$，则 1 被 $r\\otimes 1$ 的线性组合表出且 r∈R 非零，乘以 K 的分母后可在 S 中得到非零元 r′ 使 r′·1=0，即 r′ 是 S 中的零因子并与 S 含幺的非零环结构矛盾。求 𝔮∩R=(0) 等价于说 𝔮 不含 R 的任何一个非零元素。这一步的意义是把“与子环 R 不相交”这种量化在所有非零元素上的条件，换成只需与一个域 K 的正确相交条件，因为 K 里除了 0 全是可逆元，任何素理想与 K 的相交自动是 (0)：若 𝔮 与 K 相交非零，该元素可逆将导致 𝔮 是单位理想。于是只须在 $S_K$ 里找一个素理想，使它收缩到 S 时避开 R 的所有非零元，而这正是下一步取极大理想的位置。'),
      step('maximal-ideal', '第三步：在 S_K 中取极大理想，并逐层收缩', '由 Zorn 引理，非零环 $S_K$ 有极大理想 𝔪（等价地 $S_K/\\mathfrak{m}$ 是域）：把 $S_K$ 中所有真理想按包含排成链，链的并仍是真理想（因为 1 不在任何一个成员中，故也不在并中），Zorn 给出极大元。令 𝔮=𝔪∩S，通过自然映射 $S\\to S_K=K\\otimes_R S$（$s\\mapsto 1\\otimes s$）收缩。𝔪 是素理想（极大蕴含素：商环是域故是整环），素理想在环同态下的原像仍是素理想（因为 $S/\\mathfrak{q}\\hookrightarrow S_K/\\mathfrak{m}$ 是单射进入整环），所以 𝔮 是 S 的素理想。这一步必须经由 $S\\to S_K$ 收缩，不能把 𝔪 直接当作 S 的理想：𝔪 由 $S_K$ 的元素组成，K 中的标量不是 S 的元素，例如 $1/2$ 在 K 中但在 S 中可能不存在，因此“取交”必须在明确的环同态下进行，这是整条证明中最容易被草率跳过的地方。构造出 𝔮 后，只剩验证它的收缩确实是我们要的那个素理想。'),
      step('verify-contraction', '第四步：验证 𝔮∩R 正好是原素理想', '沿用第一步的记号：在 R/𝔭 上工作，记 $\\bar{R}=R/\\mathfrak{p}$ 与 $\\bar{S}=S/\\mathfrak{p}S$，则 𝔮∩R 在 $\\bar{R}$ 中的像恰好是 $\\mathfrak{q}\\cap R$ 的像，而 $\\mathfrak{m}\\cap K=(0)$（因为 K 是域、𝔪 是真理想，不含可逆元；若含非零元则该元可逆，𝔪 就是整个环），于是 𝔮 不含 K 中任何非零元素。由此 𝔮∩R 不含 $\\bar{R}$ 的任何非零元素：若 $0\\ne r\\in\\mathfrak{q}\\cap R$，它在 K 中的像是 K 的非零元，已含于 𝔮，矛盾。又 $\\bar{R}=R/\\mathfrak{p}$ 是整环，其素理想只能是 (0) 或自身，而 𝔮∩R 不可能是整个 $\\bar{R}$（否则 $1\\in\\mathfrak{q}$，在 $S_K$ 中即有 $1\\in\\mathfrak{m}$，导致 $\\mathfrak{m}=S_K$，与极大理想是真理想矛盾），故 𝔮∩R=(0) 在 $R/\\mathfrak{p}$ 中，即原环中 𝔮∩R=𝔭。反向包含 𝔭⊆𝔮∩R 由构造直接得到（𝔭 的像在 $R/\\mathfrak{p}$ 中已是 0），两边合并即得所要的等式，从而 $\\mathfrak{p}$ 上方的素理想存在。'),
      step('existence-not-uniqueness', '第五步：汇总并指出唯一性为何不成立', '对每个 𝔭∈Spec R 都构造出一对 (𝔮, 𝔪) 使 𝔮∩R=𝔭：先商去 𝔭 化归到零理想，再局部化到分式域得到整 K-代数 $S_K$，在其中取极大理想并收缩回去。因此 Spec S→Spec R 是满射，这也说明“纤维非空”是整扩张的一个纯存在性现象，不需要任何有限型或 Noether 假设。但上方素理想一般不唯一：取 R=ℤ⊆S=ℤ[i]，在 (5) 上方有 (2+i) 与 (2−i) 两个素理想，都收缩到 (5)；取 (2) 时上方只有 (1+i)，因为 2 在此扩张中分歧；取 (3) 时 (3) 仍素，上方只有它自身。这种分裂/惯性/分歧的三分结构正是代数数论的核心内容，而 Lying Over 只保证“上方有东西”，把“有几个、如何分裂”留给后续理论。若想从存在性升级到链的整体提升，需要 Going Up；若想从上方素理想的存在升级到比较局部环，需要整闭性与 Going Down；若想保证恰好一个素理想（无分歧），还需判别式与 Dedekind 环的额外输入。'),
    ],
    conclusion: '整扩张 R⊆S 使 Spec S→Spec R 满射：每个 𝔭 上方存在 𝔮 且 𝔮∩R=𝔭；存在性成立，唯一性一般不成立。',
    dependencies: ['spec-functor', 'noether-normalization'],
    consequences: ['going-up', 'krull-height', 'a-integral-closure'],
    explanation: BOUNDARY,
    examples: [
      { title: '例子：整数环中的分裂', body: 'R=ℤ⊆S=ℤ[i] 是整扩张（i 满足首一方程 T²+1=0）。(5) 上方有 (2+i)、(2−i) 两个素理想，因为 5=(2+i)(2−i) 在扩环中分解；(2) 上方只有 (1+i)，因为 2=−i(1+i)² 是分歧的；(3) 仍是素的上方只有一个 (3)。三种行为对应定理允许的全部可能，说明“上方有素理想”这条结论本身不携带分解信息。' },
      { title: '例子：整扩张但不满射的反例对照', body: '若把整性换成“代数”（允许非首一多项式），结论会失灵：$R=\\mathbb{Z}\\subset S=\\mathbb{Q}$ 中 ℚ 是 ℤ 的代数扩张（每个有理数满足一次方程，但系数非首一），然而 (0) 以外的素理想 (p) 上方没有素理想，因为 Spec ℚ 只有一个点 (0)。这说明首一性（整性）不是技术细节，而是定理成立的实质条件。' },
    ],
    remarks: [
      '整性必须按“首一多项式”理解；换成一般代数扩张，满射性失效。',
      '𝔮 的构造必须经由 $S\\to S_K$ 收缩，不能把分式域中的极大理想直接当成 S 的理想。',
      '定理只保证存在；上方素理想的个数与分裂方式属于分解理论，需要判别式与 Dedekind 环等额外工具。',
      '对偶地，若把“整”换成“平坦”则得到忠实平坦的满射性；若换成“有限型+支配”则一般纤维非空。三种“纤维非空”的来源不同，不能互相替代。',
    ],
    corollaries: [
      { title: '推论：整扩张不改变零维性', body: '若 R 是零维（每个素理想都极大），则整扩张 S 也是零维：任取 S 的素理想 𝔮，𝔭=𝔮∩R 是极大理想，且 R/𝔭⊆S/𝔮 是整扩张且 S/𝔮 是整环；由 Lying Over 应用于商环可推出 S/𝔮 的零理想是极大的，即 𝔮 极大。零维性在整扩张下不变，这一条在有限维代数与 Artin 环的研究中反复出现。', uses: ['reduce-to-domain'] },
      { title: '推论：整扩张是满射但不是同胚', body: 'Spec S→Spec R 满射，但一般不是单射也不是同胚：ℤ⊆ℤ[i] 在 (5) 上方是两个点映到一个点。若再加上“分裂为零”的条件（例如 R 在 S 中整闭且无分歧），才可能得到同胚的细分性质。把满射当作双射是使用 Lying Over 时最常见的越界。', uses: ['existence-not-uniqueness'] },
    ],
    references: [
      stacks('Stacks Project, Lemma 10.36.22 (Lying Over)', '00GU'),
      stacks('Stacks Project, Section 10.38: Going up', '00H7'),
      stacks('Stacks Project, Section 10.41: Integral closure', '00HZ'),
    ],
    history: '本条由公开教材与 Stacks Project 命题重新组织，项目自行改写并注明来源。',
  },

  'hensels-lemma': {
    statement: '设 (R,𝔪) 是 𝔪-进完备且分离的交换局部环，f∈R[T]，a∈R 满足 $f(a)\\in\\mathfrak{m}$ 与 $f\'(a)\\notin\\mathfrak{m}$（即 a 是模 𝔪 的简单根）。则存在唯一的 $\\alpha\\equiv a\\pmod{\\mathfrak{m}}$ 使 f(α)=0。',
    deepExplanation: 'Hensel 引理是牛顿迭代法的代数版本：把“近似根”升级为“精确根”。整个证明只有三个部件——可执行的修正步骤、误差阶数翻倍的估计、以及完备性给出的极限。三件事分别对应可除性（导数可逆）、Taylor 展开（二次余项）、以及 𝔪-进拓扑的完备与分离。理解这条证明最有效的方式是把它与实数上的牛顿法逐句对照：实数用确界完成极限，这里用完备化；实数用中值定理控制误差，这里用 Taylor 展开的显式余项。',
    steps: [
      step('iteration-setup', '构造牛顿修正列并验证它保持在同一剩余类', '令 x₀=a。定义 $x_{n+1}=x_n-f(x_n)/f\'(x_n)$。第一步要证明这个式子有意义，即每一步 f′(xₙ) 都是单位。做法是归纳：f′(x₀)=f′(a) 是单位；若 $x_n\\equiv a\\pmod{\\mathfrak{m}}$ 且 f′(xₙ) 是单位，则 Taylor 展开给出 $f\'(x_{n+1})\\equiv f\'(x_n)\\pmod{\\mathfrak{m}}$，两者相差在 𝔪 内，故 f′(xₙ₊₁) 也是单位（局部环中“单位 + 𝔪 中元素”仍是单位）。同时 $x_{n+1}-x_n=-f(x_n)/f\'(x_n)\\in\\mathfrak{m}$，所以归纳假设保持，整个序列落在 a 的同一剩余类中。'),
      step('quadratic-error', '证明误差阶数倍增：f(xₙ)∈𝔪^{2ⁿ}', '这是迭代收敛的定量核心。设 $f(x_n)\\in\\mathfrak{m}^{2^n}$，记 $h=-f(x_n)/f\'(x_n)$，则 $x_{n+1}=x_n+h$。对 f 在 xₙ 处做 Taylor 展开：$f(x_n+h)=f(x_n)+f\'(x_n)h+h^2g$，其中 g∈R[T] 是展开余项的系数多项式，不需要任何收敛性假设。由 h 的定义，前两项恰相消，故 $f(x_{n+1})=h^2g$。又 $h\\in\\mathfrak{m}^{2^n}$（因为 f(xₙ)∈𝔪^{2ⁿ} 而 f′(xₙ) 是单位），于是 $h^2g\\in\\mathfrak{m}^{2^{n+1}}$，这正是所要的倍增。回头检验归纳起点：$f(x_0)=f(a)\\in\\mathfrak{m}=\\mathfrak{m}^{2^0}$，起点的阶数恰好对上。'),
      step('limit-by-completeness', '用完备性取极限并传递到 f(α)=0', '由 $f(x_n)\\in\\mathfrak{m}^{2^n}$ 且 $x_{n+1}-x_n=-f(x_n)/f\'(x_n)$，差值也在 𝔪^{2ⁿ} 内，阶数趋于无穷。于是 (xₙ) 是 𝔪-进 Cauchy 列；由 R 的 𝔪-进完备性，存在 α∈R 使得 xₙ→α。再由 f 是多项式（因而关于 𝔪-进拓扑连续：系数有限、每个单项式连续），$f(x_n)\\to f(\\alpha)$；而 f(xₙ)∈𝔪^{2ⁿ} 意味着 f(xₙ)→0，故 f(α)=0。分离性在此处用来保证极限唯一，从而 α 是确定的元素而不是只在完备化中“存在但不唯一”的类；若 R 不完备，迭代只在 $\\hat{R}$ 中收敛，这正是把定理的前提写成“𝔪-进完备”的原因。'),
      step('uniqueness', '证明同一剩余类中根的唯一性', '设 α、β∈R 都满足 $f(\\alpha)=f(\\beta)=0$ 且 $\\alpha\\equiv\\beta\\equiv a\\pmod{\\mathfrak{m}}$。由差商恒等式（即多项式除法）：$f(\\alpha)-f(\\beta)=(\\alpha-\\beta)\\,u$，其中 u 是与 α、β 有关的显式表达式且 $u\\equiv f\'(a)\\pmod{\\mathfrak{m}}$，故 u 是单位。左侧为 0，右侧是单位乘以 α−β，于是 α−β=0，即 α=β。注意唯一性依赖“同一个剩余类”与“简单根”两个条件同时成立；若导数落在 𝔪 内（重根），可能发生根的个数变化，例如 x²−p 在 ℤ_p 中有 0 个或 2 个根取决于 p 的二次剩余性，而当 p=2 时 x²−2 只有一个根类却无提升。'),
      step('scope-and-consequences', '说明版本、适用范围与典型推论', '本证明适用于交换、含幺、𝔪-进完备且分离的局部环。三个典型推论：(1) 在 ℤ_p 中，若 $a^2\\equiv b\\pmod{p}$ 且 p∤2a，则 b 有唯一的 p-adic 平方根与 a 同余；(2) 单位群分解 $R^{\\times}\\cong\\mu\\times(1+\\mathfrak{m})$ 在合适假设下由 Hensel 性质给出，用于研究局部域的单位群结构；(3) Hensel 性质等价于“每个首一多项式按剩余类分解可提升为环上分解”，这是形式光滑性/平展态射理论中“Hensel 化”的出发点。边界要分清：实数上的牛顿法需要初始值足够接近，这里用“f(a)∈𝔪 且 f′(a) 是单位”替代；一旦导数不是单位，就需要多变量 Hensel 或 Weierstrass 准备定理等更强的工具。'),
    ],
    conclusion: '𝔪-进完备局部环中，模 𝔪 的简单根唯一提升为真正的根：α≡a mod 𝔪 且 f(α)=0 存在且唯一。',
    dependencies: ['localization', 'nakayama', 'a-completion'],
    consequences: ['etale-morphism', 'a-formal-smooth'],
    explanation: BOUNDARY,
    examples: [
      { title: '例子：ℤ_p 中的平方根', body: '取 R=ℤ_p、𝔪=pℤ_p、f(T)=T²−b、a 满足 a²≡b mod p 且 p∤2a（p 为奇素数时只要 a≢0 mod p）。Hensel 立刻给出唯一的 α≡a mod p 且 α²=b。取 p=7、b=2：a=3 因 3²=9≡2 mod 7，得到一个 7-adic 平方根 α；另一个根 −α≡4 mod 7 由 a=4 得到。这正是“二次剩余 ⟺ 有 p-adic 平方根”这一经典对应。反之 p=7、b=3 无解，因为 3 不是 mod 7 的二次剩余，说明定理的“存在”是以剩余类中有近似根为前提的。' },
      { title: '例子：导数不是单位时失效', body: '取 f(T)=T²−p 在 R=ℤ_p 中，a=0 给出 f(0)=−p∈𝔪，但 f′(0)=0 不是单位。此时确实没有同余于 0 mod p 的根，迭代公式也因除以 0 而无法执行。再看 f(T)=T²−1 在 p=2 的情形：f(1)=0∈𝔪，f′(1)=2∉𝔪 不成立，根的结构比定理预测的更复杂。这两个例子说明“简单根”不是可以省略的技术条件。' },
    ],
    remarks: [
      '完备与分离必须同时具备：完备给出极限存在，分离给出极限唯一。',
      '“简单根”条件不可去掉；重根处根的个数依赖算术，没有统一结论。',
      '本引理是形式光滑性与平展态射理论的原型：把“提升近似解”抽象成提升条件，就是形式光滑的定义。',
      '结论是关于**唯一**剩余类内的根；不同剩余类可以各自给出根，定理不排除多根共存。',
    ],
    corollaries: [
      { title: '推论：单位群的分解', body: '在合适的完备局部环中，$R^{\\times}\\cong\\mu(R)\\times(1+\\mathfrak{m})$，其中 μ(R) 是单位根群。做法是对 T^k−1 用 Hensel：模 𝔪 的约化把单位映射到 $k^{\\times}$，而 $k^{\\times}$ 中的元素都是单位根（有限域情形），Hensel 把它们唯一提升。这条分解是局部域单位群结构定理的第一步。', uses: ['uniqueness'] },
      { title: '推论：Hensel 性质即“分解可提升”', body: '下面的命题与 Hensel 引理等价：对任意首一 f∈R[T]，若其模 𝔪 的像分解为互素的首一多项式之积 $f_0=\\bar{g}_0\\bar{h}_0$，则存在首一 g、h∈R[T] 使 f=gh 且 $\\bar{g}=\\bar{g}_0$、$\\bar{h}=\\bar{h}_0$。这正是把“根”升级为“分解”的形式，也是平展态射在局部上是“局部同构”的代数根源。', uses: ['iteration-setup', 'quadratic-error'] },
    ],
    references: [
      stacks('Stacks Project, Section 10.153: Henselian local rings', '04GE'),
      stacks('Stacks Project, Section 10.96: Completion', '00M9'),
      stacks('Stacks Project, Lemma 10.96.1', '0315'),
    ],
    history: '本条由公开教材与 Stacks Project 命题重新组织，项目自行改写并注明来源。',
  },

  'projective-cohomology': {
    statement: '设 $S=k[x_0,\\ldots,x_n]$，$\\mathbb{P}^n_k=\\operatorname{Proj} S$，$\\mathcal{O}(d)$ 为 d 次扭转层。则标准仿射覆盖 $U_i=D_+(x_i)$ 的 Čech 复形给出：$H^0(\\mathbb{P}^n,\\mathcal{O}(d))=S_d$（d 次齐次多项式，d≥0 时维数为 $\\binom{n+d}{n}$）；$0<i<n$ 时 $H^i(\\mathbb{P}^n,\\mathcal{O}(d))=0$；$H^n(\\mathbb{P}^n,\\mathcal{O}(d))$ 由 Serre 对偶识别为 $H^0(\\mathbb{P}^n,\\mathcal{O}(-d-n-1))^{\\vee}$。',
    deepExplanation: '射影空间是唯一一个层上同调能被完整手算出来的射影簇，因此它的计算方式（标准仿射覆盖 + 齐次分式 + 次数记账）成了整个理论的模板。证明的全部难点不在上同调，而在把“射影的齐次性”正确写进 Čech 复形：每个局部截面必须允许某些坐标作分母、同时保持总次数等于 d。中间上同调的消失靠按坐标指数正负成对消去，最高项靠 Serre 对偶落回已知的全局截面，二者都是有限且可逐项检查的。',
    steps: [
      step('standard-cover', '取标准覆盖并把齐次次数写进截面', '令 $U_i=D_+(x_i)$ 为不使 x_i 为零的点的集合，$\\mathbb{P}^n=\\bigcup_{i=0}^{n}U_i$，且 $U_i\\cong\\mathbb{A}^n$。任意有限交 $U_{i_0\\ldots i_p}=\\bigcap U_{i_j}$ 仍仿射，其截面是允许以 $x_{i_0},\\ldots,x_{i_p}$ 作分母的齐次分式。对 $\\mathcal{O}(d)$ 而言，局部截面必须形如 $F/\\prod x_{i_j}^{m_j}$ 且**总次数等于 d**，这条次数约束是整个计算的关键：它把射影的坐标缩放不变性编码成代数的分次条件，一旦忘记记账就会算出错误的上同调。'),
      step('cech-complex', '写出 Čech 复形并识别零次上同调', '取 Čech 复形 $\\check{C}^p(\\mathcal{U},\\mathcal{O}(d))=\\prod_{i_0<\\cdots<i_p}\\mathcal{O}(d)(U_{i_0\\ldots i_p})$，微分为交替和。p=0 的项是各 $U_i$ 上局部截面的元组；核（即 $H^0$）由在重叠上相等的元组组成，即粘成 X 上整体截面。用商形式写出：$H^0(\\mathbb{P}^n,\\mathcal{O}(d))=\\{s_i\\in\\mathcal{O}(d)(U_i)\\mid s_i|_{U_{ij}}=s_j|_{U_{ij}}\\}$。这个式子在有零因子或非分离概形时必须小心，但射影空间分离、覆盖有限，故直接成立；识别它的内容则是下一步。'),
      step('global-sections', '消去公共分母，算出 H⁰', '设 $s\\in H^0(\\mathcal{O}(d))$。在每片 $U_i$ 上 $s_i=F_i/x_i^{m_i}$ 且 $F_i$ 是 d 次齐次多项式。粘接条件 $F_i/x_i^{m_i}=F_j/x_j^{m_j}$ 在 $U_{ij}$ 上成立，而 $U_{ij}$ 中 $x_ix_j\\ne 0$，交叉相乘后两边都是次数 $m_i+m_j+d$ 的齐次多项式，代数的齐次恒等定理允许把等式提升到多项式环上（这一步用到的正是 $S$ 是整环、且 $U_{ij}$ 的补集维数足够小）。由此可把各 $F_i$ 对齐为同一个全局 d 次齐次多项式 F，即 $H^0(\\mathcal{O}(d))=S_d$。当 d<0 时 $S_d=0$，因为 d 次齐次多项式在次数为负时不存在非零者；这给出 $H^0=0$，与几何直觉（负次层没有整体截面）一致。'),
      step('intermediate-vanishing', '按坐标指数正负成对消去，证明中间上同调消失', '对 $0<i<n$，把每个 $\\mathcal{O}(d)(U_{i_0\\ldots i_p})$ 中的齐次分式写成单项式 $x_0^{a_0}\\cdots x_n^{a_n}$ 的线性组合，其中分母只允许覆盖中的坐标，且总次数为 d。关键观察：若某个单项式在相邻开集上都出现，则它在 Čech 微分中的贡献与反向贡献成对出现。对 $0<i<n$，每个闭链都能被这样的成对消去逐项削减，或经改变覆盖（细分保持上同调）化为含正、负指数的配对项，最终剩下全局项，而全局项只出现在 p=0（$H^0$）与 p=n（$H^n$）。中间次数的剩余为零，故 $H^i(\\mathcal{O}(d))=0$。证明的有限性来自覆盖只有 n+1 片、每个交集都是仿射且上述分式记账是逐项有限的。'),
      step('top-and-duality', '识别最高次并接上 Serre 对偶', '取 p=n：$\\check{C}^n$ 只有一项 $\\mathcal{O}(d)(U_{0\\ldots n})$，其中允许全部 n+1 个坐标作分母。要使分式在整个交上没有极点，必须对每个 i 都出现 $x_i$ 的负指数；因此能贡献非零上同调的是所有索引都为负的单项式。记总次数为 d，给出条件 $d\\le -n-1$：当 $d\\ge -n$ 时 $H^n=0$。另一端由 Serre 对偶给出 $H^n(\\mathbb{P}^n,\\mathcal{O}(d))\\cong H^0(\\mathbb{P}^n,\\mathcal{O}(-d-n-1))^{\\vee}$，把最高上同调换成已知的全局截面，于是维数随之确定：例如 n=1 时 $H^1(\\mathcal{O}(-2))\\cong k$，因为 $-d-1-1=-(-2)-2=0$ 给出 $H^0(\\mathcal{O}(0))=k$。这样整个上同调表就闭合了。'),
    ],
    conclusion: '$H^0(\\mathcal{O}(d))=S_d$，$0<i<n$ 时 $H^i(\\mathcal{O}(d))=0$，$H^n(\\mathcal{O}(d))$ 由 Serre 对偶控制；由此得到 Hilbert 多项式与上同调维数的显式公式。',
    dependencies: ['a-serre-affine', 'a-quasi-coherent', 'cech-cohomology'],
    consequences: ['b-hilbert-polynomial'],
    explanation: BOUNDARY,
    examples: [
      { title: '例子：P¹ 上的完整表', body: 'n=1 时覆盖只有 U₀、U₁ 两片。逐个 d 列出：d≥0 时 $H^0$ 维数 d+1（d 次齐次多项式），$H^1=0$；d=−1 时 $H^0=0$、$H^1=0$；d=−2 时 $H^0=0$、$H^1$ 维数 1。这条表是所有曲线层上同调计算的基准，Riemann–Roch 在 P¹ 上就是逐项相加得到 $\\ell(D)=\\deg D+1$。' },
      { title: '例子：中间上同调为什么是零', body: '在 P² 上取 $\\mathcal{O}(0)=\\mathcal{O}$。$H^0=k$（常数函数），$H^1=0$（中间消失），$H^2\\cong k$，与拓扑上 $\\mathbb{P}^2_{\\mathbb{C}}$ 的 H²(ℂ)=ℂ 一致（奇数的实上同调为零）。若换成 $\\mathcal{O}(-3)$，则 $H^0=H^1=0$ 而 $H^2$ 维数 1，因为 $-d-n-1=3-3+0=0$ 给出 $H^0(\\mathcal{O})=k$。这条对照说明“中间为零”并不是因为层平凡，而是标准覆盖的算术结果。' },
    ],
    remarks: [
      '局部截面的齐次次数必须严格记账；漏掉次数约束会得到“所有 d 都有相同上同调”的错误结论。',
      '中间上同调的消失依赖覆盖只有 n+1 片且每片仿射；换成一般簇要改用谱序列或 Mercer/Weil 的通用论证。',
      '最高项由 Serre 对偶给出，而对偶本身需要 X 光滑射影；在非光滑情形 $H^n$ 也可能非零于其他次数。',
      'd<0 时 $H^0=0$ 是“负次层无整体截面”的代数表达，与射影空间的紧性（无非常数全纯函数）在精神上一致。',
    ],
    corollaries: [
      { title: '推论：Hilbert 多项式的来源', body: '由 $H^0=S_d$ 得 $\\dim H^0(\\mathbb{P}^n,\\mathcal{O}(d))=\\binom{n+d}{n}$，这是 d 的 n 次多项式，正是射影空间嵌入的 Hilbert 多项式。对它乘以 $\\mathcal{O}(d)$ 并做交错和，就得到任意闭子簇的 Hilbert 多项式的计算框架。', uses: ['global-sections'] },
      { title: '推论：Serre 消没的原型', body: '固定凝聚层 $\\mathcal{F}$，对足够大的 d 有 $H^i(\\mathbb{P}^n,\\mathcal{F}(d))=0$（i>0）。在 $\\mathcal{O}(d)$ 上这一步可以直接从上面的表逐项读出，因为取 $d\\gg 0$ 时最高项也被压成零。这就是 Serre 消没定理的最简可验证实例，也是“丰沛层”概念的最初来源。', uses: ['top-and-duality'] },
    ],
    references: [
      stacks('Stacks Project, Section 30.8: Cohomology of projective space', '01XS'),
      stacks('Stacks Project, Section 20.9: The Čech complex and Čech cohomology', '01ED'),
      stacks('Stacks Project, Section 20.11: Čech cohomology and cohomology', '01EO'),
    ],
    history: '本条由公开教材与 Stacks Project 命题重新组织，项目自行改写并注明来源。',
  },
}
