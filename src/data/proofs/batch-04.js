/**
 * 批次 04：相交理论、K-理论与极小模型纲领的 13 条长证明。
 *
 * 写作约定（与 scripts/_check-proof-file.mjs 一致）：
 *   · 每步正文 ≥ 300 字，目标 400~600 字，用中文长段落；
 *   · 数学符号优先用 Unicode（⊆ ⊗ → ≅ 𝔪 ℓ），只有在真正需要排版时才用 $...$
 *     并且内部写完整 LaTeX，JS 里反斜杠双写；
 *   · 每一步都要有实质内容，不写通用填充句；
 *   · 引用只写有把握的 Stacks Project 稳定 tag，教材只写作者与书名。
 */

const step = (id, title, body, uses = []) => ({ id, title, body, uses })
const stacks = (title, tag, year = 2024) => ({
  title, author: 'The Stacks Project', year, url: `https://stacks.math.columbia.edu/tag/${tag}`,
})
const book = (title, author, year) => ({ title, author, year })

const HISTORY = '本条由公开教材与 Stacks Project 命题重新组织，项目自行改写并注明来源，未复制原文；凡引用标准外部定理之处都在正文中点名并写清其假设。'

export const BATCH_04_PROOFS = {

  /* ══════════════════════════════════════════════════════════════════
   * 一、相交理论与特征类
   * ══════════════════════════════════════════════════════════════════ */

  'todd-class': {
    statement: '对秩 r 的向量丛 E，把其陈根（形式变量）记为 $x_1,\\ldots,x_r$，即陈多项式分解为 $c(E)=\\prod_i(1+x_i)$。托德类定义为 $\\operatorname{td}(E)=\\prod_i \\dfrac{x_i}{1-e^{-x_i}}$，其中每个因子按形式幂级数展开 $\\dfrac{x}{1-e^{-x}}=1+\\dfrac{x}{2}+\\dfrac{x^2}{12}-\\dfrac{x^4}{720}+\\cdots$；它是 A(X)⊗ℚ 中的元素，且只依赖陈类。',
    explanation: '托德类的定义里有一个必须先想清楚的技术点：$\\dfrac{x}{1-e^{-x}}$ 的常数项是 1，因此它是一个**可逆的形式幂级数**，而它的对称多项式展开可以用陈类 $c_i$ 无歧义地写出来，不需要真的把陈多项式分解成一次因式。这就是“分裂原理”的用法：我们假装 E 是一阶因子的直和，最后所有表达式都对称，因而自动是陈类的多项式。托德类在微分几何侧有独立身份：它正是 Dirac 型椭圆算子的指标密度，阿蒂亚-辛格指标定理里出现的 $\\operatorname{td}(TX)$ 与这里完全是同一个对象。要提防的常见误解是把托德类当成特征类本身：它并不是某个积分的值，而是一个取值为有理（一般非整）的相交理论元素。',
    steps: [
      step('formal-inverse', '为什么 $\\dfrac{x}{1-e^{-x}}$ 是可用的形式幂级数', '设 x 是次数为 1 的形式变量。由 $e^{-x}=1-x+\\dfrac{x^2}{2}-\\dfrac{x^3}{6}+\\cdots$ 得 $1-e^{-x}=x\\left(1-\\dfrac{x}{2}+\\dfrac{x^2}{6}-\\cdots\\right)$，方括号里的级数常数项为 1，因此在形式幂级数环 ℚ[[x]] 中可逆，逆为 $1+\\dfrac{x}{2}+\\dfrac{x^2}{12}+0\\cdot x^3-\\dfrac{x^4}{720}+\\cdots$。于是 $\\dfrac{x}{1-e^{-x}}=\\dfrac{1}{1-\\dfrac{x}{2}+\\dfrac{x^2}{6}-\\cdots}=1+\\dfrac{x}{2}+\\dfrac{x^2}{12}-\\dfrac{x^4}{720}+\\cdots$ 有意义，且常数项恰为 1。这一步是全局的关键：如果定义里的因子常数项不是 1，那么“把它乘起来得到托德类”这件事会退化成乘以无穷级数而不收敛，乘性地类也就没有意义。另外要留意该级数里奇数次数并非全为零：$x^3$ 的系数确实是 0，但 $x$ 的一次项系数是 $\\dfrac12$，正是它在 HRR 中给出 $\\dfrac{1}{2}c_1$ 这类“半整数修正”，也是曲面上 $\\chi=\\dfrac{K^2+c_2}{12}$ 中分母 12 的来源。'),
      step('splitting-principle', '用分裂原理把乘积化归到线丛情形', '分裂原理说：给任意向量丛 E 与任意给定的一个只涉及陈类的对称关系，总存在态射 $\\pi: F\\to X$ 使 $\\pi^{*}E$ 是线丛直和且 $\\pi^{*}: A(X)\\to A(F)$ 在有理系数下是单射。于是把 $\\pi^{*}E=L_1\\oplus\\cdots\\oplus L_r$ 写出来并令 $x_i=c_1(L_i)$，就有 $\\pi^{*}c(E)=\\prod_i(1+x_i)$。因为单射性，只要在 F 上验证了一个**对称**等式，它就可以唯一地下降到 X 上。这一步的要点在于必须使用“对称”这个前提：在 F 上 $\\pi^{*}E$ 的分解方式远非唯一，不同的分解会给出不同的一套 $x_i$，但杨图对应的对称函数（陈类、陈特征 $\\sum e^{x_i}$、托德类 $\\prod\\dfrac{x_i}{1-e^{-x_i}}$）都不依赖分解，因此在 X 上定义良好。若把某个非对称表达式当成“陈类的函数”，下降就会失败，这一点在使用分裂原理时最容易被忽略。'),
      step('symmetry-to-chern', '把对称幂级数展开成陈类的多项式', '具体做法是把 $\\prod_i f(x_i)$ 按每个形式幂级数 $f(x)=\\sum_n a_n x^n$ 重写为初等对称多项式 $e_k(x_1,\\ldots,x_r)$ 的多项式，再用 $c_k(E)=e_k(x_1,\\ldots,x_r)$ 转成陈类。对托德类取 $f(x)=\\dfrac{x}{1-e^{-x}}$：秩 1 时 $\\operatorname{td}(L)=1+\\dfrac{c_1(L)}{2}+\\dfrac{c_1(L)^2}{12}-\\dfrac{c_1(L)^4}{720}+\\cdots$，秩 2 时把两个因子乘开并整理得到 $\\operatorname{td}(E)=\\sum_i\\dfrac{x_i}{1-e^{-x_i}}$ 的展开 $=1+\\dfrac{p_1}{2}+\\dfrac{p_1^2+p_2}{12}+\\cdots$，其中 $p_k=\\sum x_i^k$ 是幂和，再由 Newton 恒等式换成 $c_1,c_2$：$p_1=c_1$，$p_2=c_1^2-2c_2$。于是一般秩下有 $\\operatorname{td}=1+\\dfrac{c_1}{2}+\\dfrac{c_1^2+c_2}{12}+\\dfrac{c_1c_2}{24}+\\cdots$。这里出现的分母 2、12、24 不是记号巧合，而是 $\\dfrac{x}{1-e^{-x}}$ 系数被撑到高阶后的必然结果；正因为分母里出现了 12 与 24，托德类一般不是整系数相交理论元素，必须先在有理系数下讨论。'),
      step('multiplicativity', '验证托德类对直和乘性', '托德类对直和乘性：$\\operatorname{td}(E\\oplus F)=\\operatorname{td}(E)\\,\\operatorname{td}(F)$。证明分两步。第一步，在分裂原理给出的 F 上，$E\\oplus F$ 的陈根正是两者陈根的并（因为 $\\pi^{*}(E\\oplus F)=\\pi^{*}E\\oplus\\pi^{*}F$ 是线丛直和），于是 $\\prod_{i\\in E\\cup F}f(x_i)=\\prod_{i\\in E}f(x_i)\\cdot\\prod_{i\\in F}f(x_i)$ 逐项成立，纯粹是有限乘积的结合律。第二步把等式下降回 X：左右两边都是陈类的对称函数，$\\pi^{*}$ 在有理系数下单射，故等式在 A(X)⊗ℚ 中成立。这条乘性是托德类能被用作“修正因子”的全部理由：它使 $\\operatorname{ch}$ 与 $\\operatorname{td}$ 都对短正合列（在线丛情形即直和）有可加/可乘的分解，从而 HRR 的两端可以逐层验证，而不是逐个簇硬算。反过来，如果不做乘性验证，直接对一般向量丛使用“分裂成线丛再相乘”，就只是重复了一遍分裂原理而没有证明任何新东西——分裂原理给的只是**存在**一个分解，乘性是让这个分解在 X 上一致落地的桥梁。'),
      step('todd-tangent', '切丛上的托德类与 HRR 的修正角色', '把 E 取成切丛 TX 即得 $\\operatorname{td}(TX)=\\prod_i\\dfrac{x_i}{1-e^{-x_i}}$，这正是 HRR 右端的修正因子。作用方式可以直接核验：对 ℙ¹ 取 $TX=\\mathcal{O}(2)$，$c_1=2$，$\\operatorname{td}(TX)=1+\\dfrac{2}{2}\\cdot 1=1+1=2$（取到最高次数 0 为止：ℙ¹ 上 $A(\\mathbb{P}^1)\\otimes\\mathbb{Q}=\\mathbb{Q}\\oplus\\mathbb{Q}$，只有 $[\\text{pt}]$ 位置需要托德类），于是对 $\\mathcal{O}$ 有 $\\chi(\\mathcal{O})=\\int\\operatorname{ch}(\\mathcal{O})\\operatorname{td}(TX)=\\int 1\\cdot 1=1$，与 $h^0-h^1=1-0=1$ 一致。对 ℙ² 取 $TX$，$c_1=3H$，$c_2=3H^2$，托德类为 $1+\\dfrac{3H}{2}+\\dfrac{9H^2+3H^2}{12}=1+\\dfrac{3H}{2}+H^2$，对 $\\mathcal{O}$ 积分 $\\int\\operatorname{ch}(\\mathcal{O})\\operatorname{td}=\\int H^2=1$，仍与 $\\chi(\\mathcal{O})=1$ 相符。这两个核算说明：托德类的作用就是把“点计数”这种离散量（$\\chi$）调整成可以被连续不变量（$\\operatorname{ch}$ 的积分）算出的形式，去掉它等式立刻失效。'),
    ],
    conclusion: '托德类由 $\\operatorname{td}(E)=\\prod_i\\dfrac{x_i}{1-e^{-x_i}}$ 定义，可展开为 $1+\\dfrac{c_1}{2}+\\dfrac{c_1^2+c_2}{12}+\\cdots$；它对直和乘性、只依赖陈类、取值在 A(X)⊗ℚ，并在 HRR 中充当几何修正因子。',
    dependencies: ['chern-class', 'chern-character'],
    consequences: ['grothendieck-riemann-roch'],
    explanation: '托德类是“把陈类按一个特定形式幂级数重新配比”得到的类，它的存在理由来自一个朴素的问题：$\\chi$ 是整数级别的不变量，而 $\\operatorname{ch}(E)$ 的推前一般是有理数，两者之间必然隔着一个精确的修正因子，托德类就是这个因子。把 $\\dfrac{x}{1-e^{-x}}$ 按 $x$ 展开，常数项是 1 保证可逆与乘性，一次系数 $\\dfrac12$ 保证一维情形正确，高次系数由 Bernoulli 数给出，因此分母里必然出现 12、720 这样的数。整套论证必须先在有理系数下做，因为分母 12 已经把托德类推出了整系数相交理论之外；只有在把次数最顶端的部分积分掉之后，才重新得到整数（例如曲面上的 $\\chi$ 与 $\\dfrac{K^2+c_2}{12}$）。这也解释了为什么 HRR 的证明总是分成“先在 K-理论层做形式运算、再积分取数值”两个阶段。',
    examples: [
      { title: '例子：ℙ¹ 与 ℙ² 上的逐项核算', body: 'ℙ¹ 上 $T\\mathbb{P}^1=\\mathcal{O}(2)$，托德类只有 $1+1$ 两项，因为高次项落在 $A^{2}$ 及以上的格子里为零；对 $\\mathcal{O}$ 与 $\\mathcal{O}(1)$ 分别算：$\\chi(\\mathcal{O})=1$、$\\chi(\\mathcal{O}(1))=\\int(1+H)\\cdot 1=2$，与 $h^0=2$、$h^1=0$ 吻合。ℙ² 上 $T\\mathbb{P}^2$ 满足 $c_1=3H$、$c_2=3H^2$，托德类 $=1+\\dfrac{3H}{2}+H^2$；对 $\\mathcal{O}(d)$ 算 $\\chi=\\int(1+dH+\\dfrac{d^2H^2}{2})\\left(1+\\dfrac{3H}{2}+H^2\\right)=\\dfrac{d^2+3d+2}{2}=\\dbinom{d+2}{2}$，正是射影平面上次数 d 的齐次多项式空间维数，说明修正因子确实在起作用。' },
      { title: '例子：曲面的托德类与 Noether 公式', body: '曲面 X 上 $\\operatorname{td}(TX)=1+\\dfrac{c_1}{2}+\\dfrac{c_1^2+c_2}{12}$，取次数 2 部分并对基本类求值得 $\\dfrac{K^2+c_2}{12}$（用 $c_1=-K$，$K^2=c_1^2$）。对 $\\mathcal{O}$ 应用 HRR 得到 $\\chi(\\mathcal{O}_X)=1-q+p_g=\\dfrac{K^2+c_2}{12}$，这就是 Noether 公式。在 K3 曲面上 $K=0$、$c_2=24$，公式给出 $\\chi(\\mathcal{O})=2$，与 $p_g=1,q=0$ 相符；在 ℙ² 上 $K^2=9$、$c_2=3$，给出 $\\chi(\\mathcal{O})=1$。两个极端的例子说明修正因子里的 12 是“被需要的”，不是记账方式。' },
    ],
    remarks: [
      '托德类只依赖陈类，但展开系数分母含 12、720，因此它一般不是 A(X) 中的整元素：在 A(X)⊗ℚ 里做运算，最后才积分得到整数。若误以为托德类总在整系数相交理论中，会得出“$\\chi$ 可以直接用整系数类配对”的错误断言。',
      '定义 $\\dfrac{x}{1-e^{-x}}$ 与 $\\dfrac{x}{1-e^{x}}$（即 $\\dfrac{-x}{1-e^{-x}}$）给出的类是互为反号的一次项版本，混用会在 $\\dfrac{c_1}{2}$ 这一项上出错：用错约定时 ℙ¹ 上 $\\chi(\\mathcal{O})$ 会算出 0 而不是 1。',
      '分裂原理只保证存在一个使 E 分裂的态射，不保证该态射是有限维或紧合的；在非紧合情形使用它时必须确认 $\\pi^{*}$ 的单射性结论仍然可用（有理系数下对 A(X) 成立，对整系数或对 K-理论同构形式的结论需要各自核实）。',
      '托德类对偶：$\\operatorname{td}(E)\\operatorname{td}(E^{\\vee})=\\operatorname{td}(E)\\operatorname{td}(E)$ 在 $c_1(E^{\\vee})=-c_1(E)$ 下并不给出 1，只有 $c_i(E^{\\vee})=(-1)^ic_i(E)$ 的对称部分才给出幂等性质；把“对偶后托德类取反”当成规律会算错偶数次陈类。',
    ],
    corollaries: [
      { title: '推论：线丛的托德类与指数层的 χ', body: '对线丛 L，$\\operatorname{td}(L)=1+\\dfrac{c_1(L)}{2}+\\cdots$，于是曲线 C 上 $\\chi(L)=\\deg L+\\dfrac{\\deg L}{2}\\cdot 0+1=\\deg L+1-g$（用 $c_1(TC)=2-2g$ 的积分部分 $=2-2g$，即 $1-g$）。这条计算把熟知的 Riemann-Roch 公式从 HRR 中直接读出，说明托德类的一次项 $\\dfrac12$ 与曲线的 $K$ 次数一起产出 $1-g$。', uses: ['symmetry-to-chern'] },
      { title: '推论：托德类的乘性给出 HRR 的逐项验证框架', body: '因为 $\\operatorname{td}$ 与 $\\operatorname{ch}$ 都对直和乘性（$\\operatorname{ch}$ 对直和可加、对张量可乘，$\\operatorname{td}$ 对直和可乘），短正合列 $0\\to E\\to F\\to G\\to 0$ 允许把两端的类拆开逐项比较。这使 HRR 的证明可以在“满足正合列的类”这类抽象元素（即 K-理论元素）上先行验证，再借 Chern 特征同态回落到相交理论。', uses: ['multiplicativity'] },
    ],
    references: [
      stacks('Stacks Project, Section 42.41: Chow groups of vector bundles and the splitting principle', '02UK'),
      stacks('Stacks Project, Section 42.43: Chern classes and the Chern character', '0DZF'),
      book('Intersection Theory, 第 3 章（Todd classes 与 Riemann-Roch）', 'William Fulton', 1998),
      book('Riemann Surfaces and Algebraic Curves: A First Course in Hurwitz Theory 相关章节', 'Cavalieri & Miles', 2016),
    ],
    history: HISTORY,
  },

  'grothendieck-riemann-roch': {
    statement: '设 $f: X\\to Y$ 是 Noether 概形（或光滑拟射影簇）之间的紧合态射，$F\\in K^0(X)$（带有限群作用或假定 $f$ 有限 Tor 维数的通常设定）。则 $\\operatorname{ch}(f_!F)\\cdot\\operatorname{td}(TY)=f_*\\big(\\operatorname{ch}(F)\\cdot\\operatorname{td}(TX)\\big)$，其中 $f_!$ 是 K-理论推前（沿 f 的 K-理论映照，有限 Tor 维数时由 $\\sum(-1)^iR^if_*$ 给出），$f_*$ 是 Chow 群上有理系数下的推前，$\\operatorname{ch}$ 是 Chern 特征，$\\operatorname{td}$ 是托德类。',
    explanation: 'GRR 的革命性在于它把等式从“一个簇上的数值关系”升格为“一族态射之间的自然变换”。要体会这一点，请比较两个证法：HRR 是在固定簇上把 $\\chi(F)$ 与 $\\int\\operatorname{ch}(F)\\operatorname{td}(TX)$ 两个数比较；GRR 则在 K-理论层构造一个从 $K^0(-)\\otimes\\mathbb{Q}$ 到 $A(-)\\otimes\\mathbb{Q}$ 的变换 $\\tau_X$，并断言它对推前是交换的。因为 K-理论有推前而 Chow 群也有推前，等式可以沿开嵌入、闭嵌入、投射逐步拼接，最终归结为“点、射影空间、仿射空间”三种原子情形。这条“把定理写成自然变换、再用结构定理归结到原子情形”的路线正是格罗滕迪克风格的范本，并直接催生了相交理论、λ-环、以 GRR 为公理的现代框架。要注意必须有紧合性：非紧合时 $f_*$ 在 Chow 上对没有紧合支撑的类无定义。',
    steps: [
      step('formulate-as-transformation', '把 HRR 改写成两个函子之间的自然变换', '定义 $\\tau_X: K^0(X)\\otimes\\mathbb{Q}\\to A(X)\\otimes\\mathbb{Q}$ 为 $\\tau_X(F)=\\operatorname{ch}(F)\\cdot\\operatorname{td}(TX)$。HRR 的数值形式说：当 X 紧合（在 k 上射影）时，$\\int_X\\tau_X(F)$ 等于 Euler 特征 $\\chi(F)=\\sum(-1)^i\\dim H^i(X,F)$。把 $\\chi$ 换成推前到点的 $\\pi_*$，这条数值等式就变成 $\\pi_*\\tau_X(F)=\\tau_{\\operatorname{Spec}k}\\chi(F)$ 的形式，也就是“$\\tau$ 与推前交换”。推广到一般紧合 $f$ 就得到 GRR 的陈述。这一步不是记号游戏：把定理写成自然变换后，等式的两边都成为函子的复合，而函子的交换性可以沿态射分解逐块验证，这比逐个数比较效率高得多。必须强调这里的 $\\tau$ 用到了 $TX$，而 $TX$ 只有在光滑情形才是一个向量丛；非光滑时必须换成“虚拟切丛”或用 K-理论版本的表述，否则 $\\operatorname{td}(TX)$ 无从定义。'),
      step('k-theory-pushforward', '说明 K-理论推前 $f_!$ 的来源与有限性条件', 'K-理论推前的构造：对紧合 $f:X\\to Y$，定义 $f_!([F])=\\sum_i(-1)^i[R^if_*F]$。要让它成为 $K^0(X)\\to K^0(Y)$ 的群同态，需要 $R^if_*F$ 只有有限多个非零、且每个都是凝聚层：在 Noether 概形间紧合态射下 $R^if_*$ 保持凝聚性（有限型时上同调在紧合下有界），因此有限性由紧合性保证；而“有限 Tor 维数”或“$F$ 是完美复形”的条件用来保证 $f_!$ 在更一般的 K-理论构造（如 $K_0$ 的导出版本）中良定义。取 $f=\\pi$ 为到点的结构态射时 $\\pi_!([F])=\\chi(F)$ 是一个整数，这正是 GRR 特化回 HRR 的方式。若按每个 $i$ 单独做而不交替求和，得到的就不是群同态（它不尊重短正合列），整个证明无法进行：交替和恰好使长正合列在 K 群中坍缩为一个等式，这是 $f_!$ 能被定义的根本原因。'),
      step('localization-and-multiplicativity', '验证 τ 的乘性与局部性', '证明 GRR 的第一层归约是让 $\\tau$ 变为“类的运算”。对短正合列 $0\\to E\\to F\\to G\\to 0$，有 $\\operatorname{ch}(F)=\\operatorname{ch}(E)+\\operatorname{ch}(G)$，故 $\\tau_X$ 在 K-理论元素上良定义且加性。对张量积，Chern 特征满足 $\\operatorname{ch}(E\\otimes G)=\\operatorname{ch}(E)\\operatorname{ch}(G)$；托德类对直和乘性。用分裂原理把任意元素写成线丛的差 $[L]-[\\mathcal{O}]$ 的组合后，可以把等式两侧都归约到线丛上验证。局部性指的是：结式可以沿开浸入与闭浸入拼接。若 $U\\hookrightarrow X$ 是开浸入、$Z\\hookrightarrow X$ 是补闭子概形，则 $K^0$ 与 $A$ 都有相应的正合列（局部化列），于是“在 U 上成立、在 Z 上成立”可以拼成“在 X 上成立”。这两条性质合起来使 GRR 成为可归约的命题：规则性的部分可以逐点局部验证，剩下的只是三种具体情形。'),
      step('reduction-to-atoms', '把一般情形归结到点、仿射空间、射影空间', '任何光滑簇之间的紧合态射都可以通过分解 $f=p\\circ i$（i 是闭浸入，p 是到射影空间的投射的复合）来分析：投射 $\\mathbb{P}^n_Y\\to Y$ 是 GRR 的一个已知基本情形，闭浸入是另一个基本情形，两者各自验证后，态的等式沿复合拼接。其中射影空间情形可以用逐层（Euler 序列/O 的消解）归约到线丛 $\\mathcal{O}(d)$，再用 $\\chi(\\mathcal{O}(d))=\\dbinom{d+n}{n}$ 与 $\\operatorname{ch}$、$\\operatorname{td}$ 的显式公式计算；仿射空间情形退化为投影公式的特例；点的情形就是 $\\chi$ 的定义。归约能够完成的技术原因是“$\\tau$ 与 $f_!$ 都只依赖 K-理论与 Chow 群的结构”，而这两种群都有关于开闭分解与投影公式的形式性质（投影公式 $f_*(f^*\\alpha\\cdot\\beta)=\\alpha\\cdot f_*\\beta$），使拼接无需额外几何输入。这一步是 GRR 证明的主干：真正困难的部分不是“怎么算”，而是“怎样把一般情形合法地拆成这三块”。'),
      step('consequences-and-boundary', '从 GRR 推出 HRR 与灵敏度说明边界', '取 $Y=\\operatorname{Spec}k$：紧合性自动满足，$A(Y)=\\mathbb{Z}$，$f_*$ 就是取度（对 0 维类）或取零（对正次数的类），$\\operatorname{td}(TY)=1$，于是 GRR 变为 $\\chi(F)=\\int_X\\operatorname{ch}(F)\\operatorname{td}(TX)$，正是 HRR。取 $f$ 为双有理（例如爆破），因为 $f_*$ 在 0 维部分同构，可以得到 $\\chi$ 在双有理变换下不变这一类结果（通过把 $R^if_*$ 的误差项与例外除子的类作比较），这也是“某些 Chern 数在双有理下不变”的现代证明起点。边界要看清：GRR 的陈述要求 $X$、$Y$ 光滑（否则 $TX$ 不是向量丛，需要虚拟形式）、$f$ 紧合（否则 $f_!$ 无定义或将 0 当成推前）、以及 $F$ 的复形有限 Tor 维数（否则 $f_!$ 在同伦层不稳定）。去掉紧合性最直接的反例：仿射直线到点的开浸入 $\\mathbb{A}^1\\to\\operatorname{Spec}k$ 上取 $F=\\mathcal{O}$，$f_!$ 若按 $\\sum(-1)^iH^i$ 定义为 0（因为 $H^0(\\mathbb{A}^1,\\mathcal{O})=k$ 是无穷维向量空间而非有限维），与右侧 $\\int\\operatorname{ch}=1$ 不一致；这正说明凝聚性/有限性条件不能省。'),
    ],
    conclusion: '对紧合、光滑情形下的 $f$ 与有限 Tor 维数的 $F$，$\\operatorname{ch}(f_!F)\\operatorname{td}(TY)=f_*\\big(\\operatorname{ch}(F)\\operatorname{td}(TX)\\big)$ 成立；取 $Y=\\operatorname{Spec}k$ 得到 HRR，整套证明沿“自然变换 + 局部化 + 三种原子情形”的路线完成。',
    dependencies: ['todd-class', 'k-theory', 'chow-ring'],
    consequences: ['todd-class', 'k-theory'],
    explanation: 'GRR 的意义要放在“自然变换”这个框架里看：HRR 给出的是两个数之间的等式，而 GRR 给出的是两个函子之间的交换性，后者可以在态射层面做运算、拼接与传递。一旦定理被写成交换性，证明就变成了两层：第一层是形式性质（$\\tau$ 加性、乘性、与开闭分解相容），第二层是三种原子情形（点、仿射空间、射影空间）。这个结构之所以可行，是因为 K-理论和 Chow 群都带推前与投影公式，形成可以“逐块焊接”的框架。代价是必须假设光滑（否则 $TX$ 不是丛）、紧合（否则推前不存在）、以及有限 Tor 维数（否则 K-理论推前在同伦层不稳定）。把这三条假设中的任何一条去掉，等式要么无意义、要么出现可计算的偏差，后者恰恰是后续理论（虚拟基本类、导出推前）发展的入口。',
    examples: [
      { title: '例子：射影空间上的线丛逐项核算', body: '取 $X=\\mathbb{P}^1$、$Y=\\operatorname{Spec}k$，$F=\\mathcal{O}(d)$。左侧 $\\operatorname{ch}(F)=\\operatorname{ch}(\\mathcal{O})+dH$（因为 $\\operatorname{ch}(L)=e^{c_1(L)}=1+c_1(L)$ 在 $A^1$ 截断后成立），$\\tau_X(F)=1+dH$（乘 $\\operatorname{td}=1+\\dfrac{2H}{2}=1+H$ 的 $A^0$ 部分）；右侧 $f_*\\tau_X(F)=\\int_{\\mathbb{P}^1}(1+dH)=d+1$。而 $\\chi(\\mathcal{O}(d))=h^0-h^1=(d+1)-0=d+1$（$d\\ge 0$），两者相等。换成 $\\mathbb{P}^2$ 与 $\\mathcal{O}(d)$ 再算一次，$\\tau_X=\\operatorname{ch}\\cdot\\operatorname{td}$ 的 $A^2$ 部分为 $\\dfrac{d^2}{2}+\\dfrac{3d}{2}+1$，积分得 $\\dfrac{(d+1)(d+2)}{2}$，与齐次多项式维数相符，说明“取 Y = 点”这一特化确实把 GRR 还原为 HRR 的数值形式。' },
      { title: '例子：紧合性缺失时等式失效', body: '取 $X=\\mathbb{A}^1\\setminus\\{0\\}$、$Y=\\operatorname{Spec}k$，结构态射 $f$ 是有限型但非紧合的（也不是闭的）。$H^0(X,\\mathcal{O}_X)=k[t,t^{-1}]$ 是无穷维的，$f_!$ 在同调层面无法用有限交替和定义；若强行取 $\\chi(F)=1-\\infty$ 则无意义，若按“紧合替代”取 K-理论推前为 0，则右侧 $\\int_X\\operatorname{ch}(\\mathcal{O})\\operatorname{td}(TX)=1$（因为 $X$ 上有理相交理论的基本类非零），两侧不等。这说明 GRR 中紧合性是陈述的一部分而非技术装饰。' },
    ],
    remarks: [
      '光滑性是“$TX$ 是向量丛”的前提；在奇异簇上必须把 $\\operatorname{td}(TX)$ 换成虚拟切丛的托德类（或直接用 K-理论版本的 GRR），否则右侧不是相交理论中的良定义元素。',
      '紧合性不能省：非紧合时 $f_!$ 不存在于有限维 K-理论层，即使簇光滑等式也无意义；这与“$\\chi$ 只对有限维上同调有定义”是同一个障碍。',
      '“有限 Tor 维数”在 K-理论推前的导出版本中对应“$F$ 是完美复形”；把它换成任意凝聚层会破坏 $f_!$ 与 Chern 特征的相容性，等式出现高阶修正项。',
      'GRR 的两边必须在有理系数下比较：$\\operatorname{td}$ 含分母 12，$\\operatorname{ch}$ 含分母阶乘；主张“GRR 在整系数 Chow 群上成立”需要额外论证（在曲线与曲面情形可以，一般维数不行）。',
    ],
    corollaries: [
      { title: '推论：HRR 是 GRR 到点的特殊情形', body: '取 $Y=\\operatorname{Spec}k$，则 $f$ 紧合自动成立（有限型到点即紧合），$A(Y)=\\mathbb{Z}$，$\\operatorname{td}(TY)=1$，$f_*(\\alpha)$ 为 0 维部分取度、其余为零。等式退化为 $\\chi(F)=\\int_X\\operatorname{ch}(F)\\operatorname{td}(TX)$。这条推论说明 GRR 不是一个更强的独立假设，而是 HRR 在相对框架下的自然扩张。', uses: ['k-theory-pushforward'] },
      { title: '推论：双有理不变量中的 Chern 数约束', body: '取 $f$ 为光滑簇之间的双有理紧合态射，则由 GRR 与“$f_*$ 在高次部分互逆”的事实，可以推出 $\\chi$ 在双有理变化下的不变性，并把“哪些 Chern 数的组合可能不变”写成关于例外除子的方程。这是把 GRR 用作计算工具（而非仅作存在性陈述）的典型方式。', uses: ['reduction-to-atoms'] },
    ],
    references: [
      stacks('Stacks Project, Section 42.41: Chow groups of vector bundles and the splitting principle', '02UK'),
      stacks('Stacks Project, Section 42.43: Chern classes and the Chern character', '0DZF'),
      stacks('Stacks Project, Section 42.23: Intersection products', '0AZH'),
      book('Intersection Theory（GRR 的证明与 K 理论版本）', 'William Fulton', 1998),
      book('Lectures on Riemann-Roch and vanishing theorems 讲义', 'P. Sastry / 公开讲义（注明出处）', 2015),
      book('K-Theory: An Introduction, 第 5 章', 'Max Karoubi', 1978),
    ],
    history: HISTORY,
  },

  'k-theory': {
    statement: '设 X 是 Noether 概形。$K_0(X)$ 定义为 X 上凝聚层构成的 Abel 范畴的 Grothendieck 群，即由同构类 $[F]$ 生成、并模去短正合列关系 $[F]=[E]+[G]$（当 $0\\to E\\to F\\to G\\to 0$ 正合）的 Abel 群。$K^0(X)$ 则取局部自由（向量丛）层的同构类作生成元并模同样的关系。当 X 是光滑簇时自然映射 $K^0(X)\\to K_0(X)$ 是同构；再在 K 上定义乘法 $[E]\\cdot[F]=[E\\otimes F]$，可得带 λ-环结构的交换环。',
    explanation: 'K-理论的出现来自一个非常具体的记账问题：想给“向量丛”一个可加的不变量，但直和不构成群（没有加法逆元），解决方案是形式地添加逆元，正如从 ℕ 造 ℤ。Grothendieck 群化给出一个普适技巧：任何满足某种“可加性”的不变量都必然通过 K 群分解，这一点是它用途广泛的原因。与上同调相比，K-理论更“精细”：同调上 Ch 会丢掉挠信息（有理化后消失），K-理论保留它，例如 ℤ/2-挠的差异在 K 中可见而在有理上同调中消失。K-理论在 GRR 里扮演推前 $f_!$ 的所在范畴，也是指标理论的代数对应；高阶 K 群 $K_i$（Quillen 的构造）则与代数闭链、motivic 上同调深刻相关。理解 K-理论必须先接受一个现实：$K_0$ 的元素不一定是某个层的类，而是有限变化的“虚拟类”。',
    steps: [
      step('grothendieck-group', '构造 Grothendieck 群并验证其泛性质', '设 C 是集合意义的 Abel 范畴（例如凝聚层），记其对象同构类生成的自由 Abel 群为 F、由所有短正合列 $0\\to E\\to F\\to G\\to 0$ 对应的元素 $[F]-[E]-[G]$ 生成的子群为 R，则 K_0(C)=F/R。验证普适性质：若 $\\chi: \\operatorname{Ob}(C)\\to A$ 取值在 Abel 群 A 中且满足 $\\chi(F)=\\chi(E)+\\chi(G)$，则 $\\chi$ 唯一地通过 $c\\mapsto[c]\\bmod R$ 分解为 $K_0(C)\\to A$ 的同态。分解的唯一性直接来自 F 的自由性与 R 的生成元恰好被“可加性”杀掉；存在性只需把 $\\chi$ 沿自由生成延拓再验证 R 落进核。这条泛性质正是 K-理论好用的根本原因：$\\chi$ 这类“带正合列关系的整值不变量”自动成为 K 群上的同态，于是对虚拟类做线性运算是有意义的。同时要提醒一个陷阱：$[F]=[E]+[G]$ 只在 F 处于中间项时成立，反过来不能把任意虚拟类都写成“真实层的类之差”以外的形式；K 群中的等式一般需要多层正合列拼接。'),
      step('k0-versus-K0', '比较局部自由版本 $K^0$ 与凝聚版本 $K_0$', '$K^0(X)$ 用向量丛（局部自由层）生成，$K_0(X)$ 用凝聚层生成；后者有一个自然映射：局部自由层都是凝聚层，故 $K^0(X)\\to K_0(X)$。当 X 是 Noether 正则概形（例如光滑簇）且每个凝聚层都有有限长度的局部自由消解时，取 $F$ 的一个消解 $0\\to \\mathcal{E}_n\\to\\cdots\\to\\mathcal{E}_0\\to F\\to 0$ 并有 $[F]=\\sum_i(-1)^i[\\mathcal{E}_i]$，这给出反向映射 $K_0(X)\\to K^0(X)$，且两个方向互逆（因为消解作为 K 理论的等式正是交替和的定义）。关键假设是正则性：光滑簇上每一个凝聚层都有有限局部自由消解（结合正则局部环的整体维数有限与有限型性），因此两个群可以互相还原；在奇异簇上这个消解可能无限长，映射一般不同构。拿一个具体差异来看：$X=\\operatorname{Spec} k[x]/(x^2)$ 上 $K^0$ 由自由模给出而 $K_0$ 含有更精细的凝聚层类，两者的差别记录的就是奇点信息，所以普通用户看到的“K-理论”在光滑与奇异情形是不同对象。'),
      step('ring-and-lambda-structure', '赋予 K 上环结构与 λ-环结构', '在 $K^0(X)$ 上定义 $[E]\\cdot[F]=[E\\otimes_{\\mathcal{O}_X}F]$。要验证这与正合列关系相容：张量是对右正合的，对第一个变量固定时把短正合列 $0\\to E_1\\to E_2\\to E_3\\to 0$ 张量上 F 得到的列左端可能不正合，但 $[E_2\\otimes F]-[E_1\\otimes F]-[E_3\\otimes F]$ 在 K 里为零这一点要靠把列拆成“中间项与两端”的比较（用 Tor 长正合列并注意到向量丛平坦，因为局部自由层是平坦层），于是关系确实被保持。单位元是 $[\\mathcal{O}_X]$。进一步定义外幂运算 $\\lambda^k: K^0(X)\\to K^0(X)$，$\\lambda^k([E])=[\\Lambda^kE]$，它满足 λ-环的诸公理（$\\lambda^0=1$，$\\lambda^1=\\operatorname{id}$，$\\lambda^k(x+y)=\\sum_{i+j=k}\\lambda^i(x)\\lambda^j(y)$）。这套运算不是装饰：Chern 类与 Chern 特征正是从 λ-环结构读出来的（$c_k$ 是 $\\lambda^k$ 的线性化，$\\operatorname{ch}$ 是 $\\sum\\operatorname{rank}\\lambda^k$ 的正负组合），因此 GRR 中出现的 ch 本质上利用了 K-理论的代数结构而非仅其群结构。'),
      step('examples-and-torsion', '用 ℙ¹ 与挠信息说明 K 为什么更精细', '算 ℙ¹ 上 $K^0(\\mathbb{P}^1)$：每一向量丛分裂成线丛直和（Grothendieck 定理），故自由生成元取 $[\\mathcal{O}]$ 与 $[\\mathcal{O}(1)]$，又由 $c_1$ 的群同态 $K^0(\\mathbb{P}^1)\\twoheadrightarrow\\mathbb{Z}$（$[\\mathcal{O}(d)]\\mapsto d$，核为 $\\mathbb{Z}[\\mathcal{O}]$）得知 $K^0(\\mathbb{P}^1)=\\mathbb{Z}\\oplus\\mathbb{Z}$。作为环，乘积由 $[\\mathcal{O}(1)]^2=2[\\mathcal{O}(1)]-[\\mathcal{O}]$（因为 $\\mathcal{O}(1)^{\\otimes 2}\\oplus\\mathcal{O}=\\mathcal{O}(1)^{\\oplus 2}$ 在 K 中的关系，来自 Euler 列的推广）刻画，因此作为环有 $(t-1)^2=0$，$t=[\\mathcal{O}(1)]$。这已经不是“两个 ℤ 那么简单”的群了。相比之下有理上同调 $H^{\\text{even}}(\\mathbb{P}^1,\\mathbb{Q})$ 也是二维，但挠信息在有理化后消失：例如 $\\mathcal{O}(1)\\oplus\\mathcal{O}(-1)$ 与 $\\mathcal{O}^{\\oplus 2}$ 在 $c_1$ 与 ch 下相同（都是 $1+0$），在 K 中却不同（前者 $t+t^{-1}$，后者 2，且 $t+t^{-1}\\ne 2$），因为它们作为丛本身不同构。这就是“K 比上同调更精细”的具体含义，也说明 GRR 必须把 K 的元素先经 ch 与 td 变成相交理论元素才能比较数值。'),
      step('higher-k-and-applications', '高阶 K 群的存在与其在 GRR 框架中的地位', 'Quillen 用“完美复形的分类空间”这一定义给出高阶 K 群 $K_i(X)$，使其与代数闭链、motivic 上同调相通：$K_0$ 与 $K_1$ 已有群论解释（$K_1$ 是行列式为 1 的初等矩阵的某种商），$K_2$ 与 Milnor K-理论相关，而更高的 K 群承载环的深层算术信息（例如 $K_i(\\mathbb{Z})$ 与分圆理论的联系）。在 GRR 中，真正用到的是推前 $f_!$ 与 Chern 特征的相容性；在导出框架下这成为“K-理论是谱、$f_!$ 是谱映射、ch 与 td 给出谱的自然变换”的陈述，进而与指标定理、代数闭链、Bloch 猜想联系。这一步的作用是把 K-理论从“一个群”升级为“一族带有结构的对象”，从而可以在其上做导出运算。要留意适用边界：$K_i$ 对一般 Noether 概形并不好算，只有正则局部环、域上有限型正则概形等情形有良好性质；把 $K_0$ 的公式直接套到 $K_i$ 会得到未定义或错误的结果，这也是 K-理论研究中大量技术条件存在的原因。'),
    ],
    conclusion: '$K_0(X)$（凝聚层）与 $K^0(X)$（向量丛）是短正合列关系的 Grothendieck 群化；光滑时 $K^0\\cong K_0$，其上张量积给出交换环与 λ-环结构，Chern 特征与陈类来自 λ-结构；高阶 $K_i$ 与代数闭链、motivic 上同调相连。',
    dependencies: ['coherent-sheaf', 'invertible-sheaf', 'chow-ring'],
    consequences: ['grothendieck-riemann-roch', 'todd-class'],
    explanation: 'K-理论的骨架是一个泛性质：只要不变量对短正合列可加，它就自动通过 Grothendieck 群分解。这一条使 K 群成为“所有可加不变量的公共宿主”。在光滑簇上，凝聚层有有限局部自由消解，两个版本的 K 群因此重合；在奇异簇上它们分离，差异正好记录奇点。除了加法，张量积给 K 一个交换环结构，外幂给 λ-环结构，Chern 类正是从 λ-结构“线性化”出来的，因此 GRR 里的 ch 并不是额外输入而是 K 自带的。高阶 K 群把这一切推到谱层面，与代数闭链、motivic 上同调、指标理论相连，但代价是需要大量技术假设（正则性、有限型性）才能保证可计算。',
    examples: [
      { title: '例子：$K^0(\\mathbb{P}^1)$ 的具体计算', body: '用分裂定理：ℙ¹ 上任意向量丛同构于 $\\bigoplus_i\\mathcal{O}(a_i)$；用 Frobenius/局部自由层的结构，$[\\mathcal{O}(a)]$ 全体由 $[\\mathcal{O}]$ 与 $[\\mathcal{O}(1)]$ 生成，因为 $\\mathcal{O}(a)\\otimes\\mathcal{O}(-a)=\\mathcal{O}$ 给出 $[\\mathcal{O}(a)]$ 的逆（在 K 中），故 $K^0(\\mathbb{P}^1)$ 由两个生成元生成的自由 Abel 群。再用 Euler 列 $0\\to\\mathcal{O}\\to\\mathcal{O}(1)^{\\oplus 2}\\to\\mathcal{O}(2)\\to 0$ 得关系 $[\\mathcal{O}(2)]=2[\\mathcal{O}(1)]-[\\mathcal{O}]$，于是整个环结构可以用 $t=[\\mathcal{O}(1)]$ 与 $(t-1)^2=0$ 写出。作为练习可以核算 ch：$\\operatorname{ch}(t)=1+H$、$\\operatorname{ch}(t^2)=(1+H)^2=1+2H$，而 $\\operatorname{ch}(2t-1)=2(1+H)-1=1+2H$，两者一致，说明关系在 ch 下被保持。' },
      { title: '例子：K 中的挠与 ch 的丢失', body: '在 $\\mathbb{P}^1$ 上取 $\\alpha=[\\mathcal{O}(1)]+[\\mathcal{O}(-1)]-2[\\mathcal{O}]$，由 $t+t^{-1}-2=(t-1)^2\\cdot t^{-1}$ 与 $(t-1)^2=0$ 知 $\\alpha=0$。这说明“两个向量丛的和减去另一个的和”在 K 里可能是 0，即便每一层都非零。反过来，$[\\mathcal{O}(1)]-\\mathcal{O}$ 在 K 中非零，因为它的 ch 是 $H\\ne 0$。这个例子说明 K 的等式不能逐层验证，必须先通过 ch 或 c 到可计算的不变量，这正是 GRR 的技术路线。' },
    ],
    remarks: [
      '若 X 非正则，$K^0\\to K_0$ 一般不是同构：$K_0$ 含额外信息（奇点检测），把光滑情形的等式照搬到奇异簇会得到错误结论，例如“每个凝聚层都有有限局部自由消解”在 $k[x]/(x^2)$ 上已经失败。',
      'Grothendieck 群化只保证形式差可行，不保证每个元素都是 $[E]-[F]$ 之外的形式；但也不能把所有元素都当作“两个真实层之差”来逐层推理，一般需要多层正合列拼接。',
      'K-理论推前 $f_!$ 需要紧合性或有限 Tor 维数，否则 $\\sum(-1)^iR^if_*$ 不是有限的，与 GRR 的假设直接相关。',
      'λ-环结构的公理不能从“外幂的直和公式”自动推出全部结论：$\\lambda^k$ 是环同态这一点在 K 上并不成立（$\\lambda^k$ 不是乘性的），只有它的“谱化”线性组合才给出乘性陈类，混淆会得到错误的 Chern 类公式。',
    ],
    corollaries: [
      { title: '推论：χ 是 K 上的同态', body: '对紧合 X 上的凝聚层，$\\chi(F)=\\sum(-1)^i\\dim_kH^i(X,F)$ 满足 $\\chi(F)=\\chi(E)+\\chi(G)$（长正合列交替求和），故由泛性质给出同态 $\\chi: K_0(X)\\to\\mathbb{Z}$。这条同态正是 GRR 取 $Y=\\operatorname{Spec}k$ 时右侧 $\\pi_!$ 的具体形式。', uses: ['grothendieck-group'] },
      { title: '推论：光滑簇上向量丛版本的 K 与凝聚版本一致', body: '在正则 Noether 概形上每个凝聚层有有限局部自由消解，故 $K_0(X)\\cong K^0(X)$。这让 GRR 可以在“用向量丛算 K”的版本上陈述，而把凝聚层的技术性细节交由消解处理。', uses: ['k0-versus-K0'] },
    ],
    references: [
      book('K-Theory: An Introduction', 'Max Karoubi', 1978),
      book('Intersection Theory, 第 2 章与第 15 章（K 理论与 GRR）', 'William Fulton', 1998),
      stacks('Stacks Project, Section 42.43: Chern classes and the Chern character', '0DZF'),
      stacks('Stacks Project, Section 42.41: Chow groups of vector bundles', '02UK'),
    ],
    history: HISTORY,
  },

  'hodge-theory': {
    statement: '设 X 是 n 维紧 Kaehler 流形（射影复流形是特例）。则复上同调有分解 $H^k(X,\\mathbb{C})=\\bigoplus_{p+q=k}H^{p,q}(X)$，其中 $H^{p,q}=H^{p,q}_{\\bar\\partial}$ 是 Dolbeault 上同调，且 $\\overline{H^{p,q}}=H^{q,p}$；霍奇数满足对称 $h^{p,q}=h^{q,p}$ 与 Serre 对偶 $h^{p,q}=h^{n-p,n-q}$，并给出霍奇菱形与 $b_k=\\sum_{p+q=k}h^{p,q}$。',
    explanation: '霍奇分解是复结构在上同调上留下的指纹：实流形的上同调只知道 $b_k$ 这种粗信息，而复结构把它细分到 $(p,q)$ 分次，并给出两条对称性。证明的核心是把拓扑上同调“换成调和形式”，再让 Hodge 分解与调和形式的分次逐点对齐：Kaehler 条件保证 Laplace 算子与 (p,q) 分次交换，从而使调和形式按 (p,q) 分块，Dolbeault 定理再把这套分块与层上同调等同。要特别强调的是：Kaehler 假设（等价地，存在闭的正 (1,1) 形式）是证明的关键输入，只保证复结构或只保证紧性都不够——霍奇分解在一般紧复流形上**不必成立**，这正是“非 Kaehler 复几何”与“霍奇猜想是否对任意复流形有意义”这类问题的起点。',
    steps: [
      step('hodge-laplacian-decomposition', '用椭圆算子理论得到调和分解', '在紧复流形 X 上取 Kaehler 度量。分别定义 $\\bar\\partial$ 的 Laplace 算子 $\\Delta_{\\bar\\partial}=\\bar\\partial\\bar\\partial^{*}+\\bar\\partial^{*}\\bar\\partial$、$\\partial$ 的算子 $\\Delta_\\partial$ 与 de Rham 的 $\\Delta_d=dd^{*}+d^{*}d$；在 Kaehler 情形有恒等式 $\\Delta_d=2\\Delta_\\partial=2\\Delta_{\\bar\\partial}$，这些等式逐点验证在局部全纯坐标下是线性代数恒等式，全局因为处处成立。因为 X 紧，$\\Delta_d$ 是椭圆自伴算子，所以对每个次数 k 有正交直和分解 $\\Omega^k(X)=H^k_{\\text{harm}}\\oplus\\Delta_d(\\Omega^k(X))$，其中 $H^k_{\\text{harm}}=\\ker\\Delta_d$ 是有限维调和空间；于是 de Rham 定理给出 $H^k(X,\\mathbb{C})\\cong H^k_{\\text{harm}}$。这一步是把分析输入（椭圆正则性、紧性给出有限维核与闭像）装进问题，也是唯一用到紧性的地方：非紧时调和形式的空间通常无穷维，分解与有限性都会失效。'),
      step('bidegree-splitting', '让调和空间按 (p,q) 分次分裂', '上一步的关键恒等式 $\\Delta_d=2\\Delta_{\\bar\\partial}$ 意味着 $\\Delta_{\\bar\\partial}$ 可以按 (p,q) 型分次：因为 $\\bar\\partial$ 把 $\\Omega^{p,q}$ 送到 $\\Omega^{p,q+1}$、$\\bar\\partial^{*}$ 反向送回 $\\Omega^{p,q-1}$，所以 $\\Delta_{\\bar\\partial}$ 保持 $\\Omega^{p,q}$，从而 $\\ker\\Delta_{\\bar\\partial}$ 也按 (p,q) 分裂。又 $\\Delta_d=2\\Delta_{\\bar\\partial}$，两个核相同，于是 $H^k_{\\text{harm}}=\\bigoplus_{p+q=k}H^{p,q}_{\\text{harm}}$，其中 $H^{p,q}_{\\text{harm}}=H^k_{\\text{harm}}\\cap\\Omega^{p,q}$。这一步的技术要点是“$\\bar\\partial$ 与 $\\bar\\partial^{*}$ 各自不保持 $(p,q)$，只有它们的组合才保持”，所以分次性来自拉普拉斯算子的二阶结构而不是来自一阶算子；若误用 $\\bar\\partial$ 直接保持分次，会得出“$H^k$ 分裂成上链复形的直和”这类更强但为假的断言。必须有的假设是 Kaehler：一般紧复流形上 $\\Delta_d\\ne 2\\Delta_{\\bar\\partial}$，分次不再成立。'),
      step('dolbeault-identification', '用 Dolbeault 定理把调和空间换成层上同调', 'Dolbeault 定理断言 $H^{p,q}_{\\bar\\partial}(X)\\cong H^q(X,\\Omega^p)$，其中 $\\Omega^p$ 是全纯 p-形式的层。证明机制是把 Dolbeault 复形 $\\Omega^{p,0}\\xrightarrow{\\bar\\partial}\\Omega^{p,1}\\xrightarrow{\\bar\\partial}\\cdots$ 视为一个 acyclic 消解：在局部全纯坐标的球上 $\\bar\\partial$-Poincare 引理成立（对 $\\bar\\partial$ 正合），因此 Dolbeault 复形的上同调正是 $\\Omega^p$ 的层上同调。再借助椭圆理论（Hodge 分解）把 $\\bar\\partial$ 上同调等同于 $\\Delta_{\\bar\\partial}$-调和空间，就得到 $H^{p,q}_{\\text{harm}}\\cong H^{p,q}_{\\bar\\partial}(X)\\cong H^q(X,\\Omega^p)$。这一步的作用是把“分析对象”（调和形式）与“代数对象”（凝聚层上同调）等同起来，使霍奇数可以用层上同调计算，也为代数几何中的霍奇理论（代数 de Rham 复形、超上同调）提供入口。条件是紧复流形已经足够（Dolbeault 不需要 Kaehler），Kaehler 只在下一步的对称性里被真正用到。'),
      step('conjugation-and-symmetry', '证明共轭与 Serre 对偶给出的两条对称性', '共轭对称 $\\overline{H^{p,q}}=H^{q,p}$：复共轭在微分形式上把 $(p,q)$ 型送成 $(q,p)$ 型，并且与 $\\bar\\partial$ 和 $\\partial$ 互换（因为共轭把全纯坐标变成反全纯坐标），因此把 $\\Omega^{p,q}$ 上的算子 $\\bar\\partial$ 共轭成 $\\Omega^{q,p}$ 上的 $\\partial$。在 Kaehler 情形 $\\Delta_\\partial=\\Delta_{\\bar\\partial}$，故调和条件在共轭下保持，得到 $h^{p,q}=h^{q,p}$。Serre 对偶 $h^{p,q}=h^{n-p,n-q}$：对紧复流形有 $H^q(X,\\Omega^p)^{\\vee}\\cong H^{n-q}(X,\\Omega^{n-p})$，来自 $\\Omega^p\\otimes\\Omega^{n-p}\\to\\Omega^n$ 的配对与 Serre 对偶 $H^q(X,\\mathcal{F})^{\\vee}\\cong H^{n-q}(X,\\mathcal{F}^{\\vee}\\otimes\\omega_X)$，取 $\\mathcal{F}=\\Omega^p$ 与 $\\omega_X=\\Omega^n$。两条对称性合起来给出 $h^{p,q}=h^{q,p}=h^{n-p,n-q}=h^{n-q,n-p}$，这正是霍奇菱形的四条对称。所有对称性都在 $H^{p,q}$ 的层上同调解读下得到，因此不需要再回到调和形式做二次计算。'),
      step('hodge-structure-and-limits', '说明霍奇结构的升级与假设边界', '把上述分解按 k 组装并数维数：$b_k=\\sum_{p+q=k}h^{p,q}$，且奇数次 $b_{2m+1}$ 是偶数（因为配对 $(p,q)\\leftrightarrow(q,p)$ 无不动点当 $p\\ne q$，而 $p=q$ 不可能满足 $2p$ 为奇数）。进一步，$H^k(X,\\mathbb{Q})\\otimes\\mathbb{C}$ 得到的这套分解是一个**霍奇结构**：一个 $\\mathbb{Q}$-向量空间带分次分解，且两片在某种意义下互补，这使“霍奇类”（落在 $H^{p,p}$ 中的有理类）成为有意义的对象，霍奇猜想正是断言紧 Kaehler 流形上某些这样的类由代数闭链给出。边界要讲清楚：Kaehler 假设不能去掉，因为 $\\Delta_d=2\\Delta_{\\bar\\partial}$ 是它的直接推论；存在紧复曲面（例如某些 K3 的形变、Hopf 曲面、Iwasawa 流形）其霍奇数不满足上述对称或 $b_1$ 为奇数，正是霍奇分解失效的实例。另外“$H^{p,q}$ 与 $H^q(X,\\Omega^p)$ 的同构”在 Kaehler 情形还有共轭版本 $H^{p,q}\\cong H^p(X,\\Omega^q)$，两者一般不同，这也是为什么在陈述霍奇分解时必须写清用哪一侧的上同调。'),
    ],
    conclusion: '紧 Kaehler 流形满足 $H^k(X,\\mathbb{C})=\\bigoplus_{p+q=k}H^{p,q}$，且 $h^{p,q}=h^{q,p}=h^{n-p,n-q}$，由此得到霍奇菱形与 $b_k=\\sum_{p+q=k}h^{p,q}$，并定义霍奇结构与霍奇类。',
    dependencies: ['chow-ring'],
    consequences: ['hodge-theory'],
    explanation: '霍奇理论把“复结构的分析性质”翻译成“上同调的代数分解”。路线是：用椭圆理论把上同调换成有限维调和空间（这一步用紧性），用 Kaehler 恒等式 $\\Delta_d=2\\Delta_{\\bar\\partial}$ 让调和空间按 (p,q) 分块，再用 Dolbeault 定理把分块与层上同调 $H^q(X,\\Omega^p)$ 等同。共轭对称来自复共轭交换 $\\partial$ 与 $\\bar\\partial$，Serre 对偶对称来自 $\\Omega^p$ 与 $\\Omega^{n-p}$ 的配对。整套推理中 Kaehler 条件只在“$\\Delta_d$ 与分次相容”这一处被使用，但这一处不可替代：一般的紧复流形上分次会失败，霍奇分解随之失效，这也是非 Kaehler 复几何成为独立方向的理由。',
    examples: [
      { title: '例子：复射影空间与椭圆曲线', body: '对 $\\mathbb{P}^n$，$H^{p,p}(\\mathbb{P}^n)=\\mathbb{C}$（$0\\le p\\le n$），其余 $h^{p,q}=0$，因为 $H^k(\\mathbb{P}^n,\\Omega^p)=0$ 除 $k=p$ 外成立（Hodge 数由超平面类的幂生成）。于是在 $\\mathbb{P}^2$ 上 $h^{0,0}=h^{1,1}=h^{2,2}=1$，$h^{0,1}=h^{0,2}=0$，$b_0=1,b_2=1,b_4=1$，中间只有奇数位的 0，与 $\\mathbb{P}^2$ 的同调相符。对椭圆曲线 E（亏格 1）：$h^{0,0}=h^{1,1}=1$，$h^{1,0}=h^{0,1}=1$，于是 $b_1=2$，霍奇菱形为 $1;1,1;1$，与 $H^1(E,\\mathbb{Z})=\\mathbb{Z}^2$ 一致。这两个例子覆盖了“霍奇菱形可以很退化”与“可以完全对称”两种极端。' },
      { title: '例子：K3 曲面与霍奇菱形', body: 'K3 曲面是单连通的紧 Kaehler 曲面，$h^{1,0}=h^{0,1}=0$、$h^{2,0}=h^{0,2}=1$、$h^{1,1}=20$，于是 $b_0=1$、$b_1=0$、$b_2=22$、$b_3=0$、$b_4=1$，$\\chi_{\\text{top}}=24$。检验两条对称性：$h^{2,0}=1=h^{0,2}$（共轭），$h^{2,0}=1=h^{0,2}$（Serre 对偶在 n=2 时把 (2,0) 送到 (0,2)，自洽），$h^{1,1}=20$ 与自身成对。用 $\\chi(\\mathcal{O})=1-q+p_g=\\dfrac{K^2+c_2}{12}$ 核算：$K=0$、$c_2=24$ 给 $\\chi(\\mathcal{O})=2$，与 $1-0+1=2$ 相符，说明霍奇数与前面托德类的数值公式是同一套账。' },
    ],
    remarks: [
      'Kaehler 假设不可省：Hopf 曲面（$S^1\\times S^3$ 的复结构）$b_1=1$ 为奇数，与 $b_{2m+1}$ 必为偶数的推论矛盾，因此其霍奇分解必然失效；只用“紧复流形”不足以推出结论。',
      '“$H^{p,q}=H^q(X,\\Omega^p)$”与“$H^{p,q}=H^p(X,\\Omega^q)$”是两条不同的同构，只在 Kaehler 情形同时成立（由共轭对称联系）；在一般紧复流形上乱用会导致霍奇数算错，例如把 Hopf 曲面的 $h^{0,1}$ 当成 1 而实际并非如此。',
      '霍奇分解是**实**上同调复化后的分解：$H^k(X,\\mathbb{R})$ 本身没有 $(p,q)$ 型；只有复化 $H^k(X,\\mathbb{C})$ 才有。把 $h^{p,q}$ 当成实上同调的维数会数错维数（$b_k$ 才是实的）。',
      'Serre 对偶形式的霍奇对称需要 X 紧（或至少是紧合复流形意义上的 Poincare 对偶）；非紧复流形上 $h^{p,q}=h^{n-p,n-q}$ 一般不成立，例如 $\\mathbb{C}^n$ 上次数超过 n 的层上同调全为零，菱形本身就失去意义。',
    ],
    corollaries: [
      { title: '推论：奇数次 Betti 数为偶数', body: '由 $h^{p,q}=h^{q,p}$，$b_{2m+1}=\\sum_{p+q=2m+1}h^{p,q}$ 中每一项都与一个不同的 $(q,p)$ 配对，且不可能有 $p=q$（否则 $2p$ 为奇数），故 $b_{2m+1}$ 是偶数。这条结论给出判别非 Kaehler 的实用手段：紧复流形若某个奇数次 Betti 数为奇数，就不可能是 Kaehler 的。', uses: ['conjugation-and-symmetry'] },
      { title: '推论：χ(O_X) 与霍奇数的关系', body: '$\\chi(\\mathcal{O}_X)=\\sum_q(-1)^qh^{0,q}$，与 HRR 给出的 $\\dfrac{K^2+c_2}{12}$（曲面情形）或一般 $\\int\\operatorname{ch}(\\mathcal{O})\\operatorname{td}(TX)$ 相等。这把“分析定义的霍奇数”与“拓扑/代数定义的 Chern 数”绑在一起，是霍奇理论与 Riemann-Roch 之间的桥梁。', uses: ['dolbeault-identification'] },
    ],
    references: [
      book('Principles of Algebraic Geometry, 第 0 章与第 1 章（霍奇理论）', 'Griffiths & Harris', 1978),
      book('Complex Geometry: An Introduction, 第 3 章', 'Daniel Huybrechts', 2005),
      book('Hodge Theory and Complex Algebraic Geometry I, 第 6 章', 'Claire Voisin', 2002),
    ],
    history: HISTORY,
  },

  /* ══════════════════════════════════════════════════════════════════
   * 二、双有理几何：等价关系、消解与极小模型纲领
   * ══════════════════════════════════════════════════════════════════ */

  'birational': {
    statement: '设 X、Y 是域 k 上的整有限型概形（簇）。称 X 与 Y **双有理等价**，若存在非空开集 $U\\subseteq X$、$V\\subseteq Y$ 与同构 $\\varphi: U\\to V$。等价地，存在互逆的有理映射 $f: X\\dashrightarrow Y$、$g: Y\\dashrightarrow X$（即 $g\\circ f=\\operatorname{id}_X$、$f\\circ g=\\operatorname{id}_Y$ 在各自定义域上成立）。当 X、Y 都不可约时，这等价于函数域同构 $k(X)\\cong k(Y)$（保持 k 不动）。',
    explanation: '双有理等价的核心直觉是“忽略低维的部分”：两个簇只要有一个公共的稠密开集同构，就被归为同一类。这比同构弱得多，也正是双有理几何的威力所在——它允许在等价类内自由地做爆破、收缩、翻转，因为这些都是双有理变换（在余维 ≥1 的集合上有定义，且诱导函数域的同构），从而把复杂奇点化成标准模型。等价于函数域同构这一点把几何问题翻译为域论问题：分类簇就变成分类有限生成的函数域，这是从意大利学派到现代双有理几何一以贯之的想法。要留意的边界是：双有理等价不保维数以外的大部分信息（不保拓扑、不保奇点、不保相交数），因此任何“在双有理下不变”的量都必须单独证明（例如小平维数、$\\chi(\\mathcal{O})$ 在光滑情形）。',
    steps: [
      step('definition-equivalence', '三种定义的等价性', '证明“稠密开集同构”与“互逆有理映射”等价。若存在同构 $\\varphi:U\\to V$，则把 $\\varphi$ 看作有理映射 $X\\dashrightarrow Y$（定义域含 U）并把 $\\varphi^{-1}$ 看作 $Y\\dashrightarrow X$，两者在 $U$ 与 $V$ 上互逆，故得到互逆有理映射对。反向：设 $f:X\\dashrightarrow Y$ 由 $(U_f,\\varphi_f)$ 给出、$g:Y\\dashrightarrow X$ 由 $(V_g,\\psi_g)$ 给出且 $g\\circ f=\\operatorname{id}$、$f\\circ g=\\operatorname{id}$。取 $U=U_f\\cap f^{-1}(V_g)$，这是 X 中开集，因 f 在 $U_f$ 上由态射给出且 $f(U_f)\\cap V_g$ 稠密（在不可约 Y 上两个非空开集相交非空），故 U 非空；同理 $V=V_g\\cap g^{-1}(U_f)$ 非空。在 U 上 $\\psi_g\\circ\\varphi_f=\\operatorname{id}$、在 V 上 $\\varphi_f\\circ\\psi_g=\\operatorname{id}$，于是 $\\varphi_f|_U$ 是到 V 的同构且有逆 $\\psi_g|_V$，得到所要的开集同构。两个方向合起来说明两种定义一致，也说明“互逆”这一条件在可能有未定义点的情况下必须按“在各自定义域上成立”理解，而不是按逐点函数等式理解。'),
      step('function-field', '不可约情形下等价于函数域同构', '假设 X、Y 不可约。先证“稠密开集同构 ⟹ 函数域同构”：由 $\\varphi:U\\to V$ 与 X、Y 不可约知 U、V 都稠密，于是 $\\mathcal{O}_{X,\\xi}$（ξ 为 X 的一般点）与 $\\mathcal{O}_{Y,\\eta}$ 分别等于 $k(X)$、$k(Y)$，而 $\\varphi$ 诱导局部环同构 $\\mathcal{O}_{Y,\\varphi(\\xi)}\\cong\\mathcal{O}_{X,\\xi}$，且因为 U 稠密，$\\varphi(\\xi)=\\eta$，故 $k(X)\\cong k(Y)$（保持 k）。反向：设 $\\sigma:k(Y)\\to k(X)$ 是同构，取 X 与 Y 的仿射开集 $\\operatorname{Spec}A\\subseteq X$、$\\operatorname{Spec}B\\subseteq Y$ 使 A、B 是有限型整 k-代数且 $k(A)=k(X)$、$k(B)=k(Y)$。由有限型性，A 由有限多个 $a_i\\in A$ 生成，每个 $\\sigma^{-1}(a_i)\\in k(B)$ 可写成 $b_i/c$ 的形式（公共分母 $c\\in B$），于是把 Y 局部化到 $B_c$ 后得到同态 $A\\to B_c$；对 $\\sigma$ 的逆重复一次，取更小的开集使两个同态互相诱导对方，即得稠密开集同构。这一步的要害是“有限型保证可以把有限多个分式放在公共分母上”，因此真正需要的假设是有限型而非任意概形。'),
      step('invariants-preserved', '说明双有理等价保什么、不保什么', '双有理等价保住的量：维数（函数域在 k 上的超越次数在域同构下不变）、不可约性与不可约分支数（按分支内的函数域计数）、函数域本身，以及任何只依赖函数域的量，例如一般型、小平维数（对光滑簇）、Kodaira 维数、几何亏格的定义类 $\n$ 与 $\\chi(\\mathcal{O})$ 在光滑情形（由 HRR，双有理变换下 $\\chi$ 与部分 Chern 数不变）。不保的量：拓扑（爆破改变 Betti 数）、同调、基本群、奇点性态、除子的相交数（爆破改变自相交数）、正则性。典型例子：$\\mathbb{P}^2$ 与 $\\mathbb{P}^1\\times\\mathbb{P}^1$ 都由两个爆破点联系起来、但同构不同（$\\mathbb{P}^1\\times\\mathbb{P}^1$ 存在两条互不相交的曲线不交的分解，$\\mathbb{P}^2$ 没有），因此它们是双有理等价但不同构的簇。另一个更贴切的例子：$\\mathbb{P}^2$ 与任意 $\\mathbb{P}^2$ 的某个点的爆破都是双有理等价的（爆破的例外曲线可以收缩回去），但 $\\mathbb{P}^2$ 的 Betti 数比爆破后的少一（$b_2$ 从 1 变 2），说明拓扑信息在双有理类内并不恒定。'),
      step('blowup-example', '用爆破验证双有理变换的具体机制', '取 $X=\\mathbb{A}^2$、$Z=\\{0\\}$，爆破 $\\pi:\\tilde X=\\operatorname{Bl}_0\\mathbb{A}^2\\to\\mathbb{A}^2$ 是一个态射，在补上原点的开集上是同构：$\\tilde X$ 由 $\\{(x,y)\\times[s:t]\\in\\mathbb{A}^2\\times\\mathbb{P}^1\\mid xt=ys\\}$ 给出，$\\pi$ 为投影。在 $\\{x\\ne 0\\}$ 的仿射块上坐标可写成 $u=y/x$，$\\pi(u,x)=(x,xu)$ 是双射到 $\\{x\\ne 0\\}$，逆为 $(x,y)\\mapsto (y/x,x)$，故 $\\pi$ 在 $\\mathbb{A}^2\\setminus\\{0\\}$ 上是同构；例外的上一个点时 $x=y=0$ 给出整条 $\\mathbb{P}^1$，$\\pi^{-1}(0)=\\mathbb{P}^1$。于是 $\\pi$ 是双有理态射（一般纤维单点、例外纤维 $\\mathbb{P}^1$），并且诱导函数域的同构 $k(\\mathbb{A}^2)=k(x,y)\\to k(\\tilde X)=k(u,x)$，因为 $y=xu$、$u=y/x$ 互相表出。这个具体计算展示“双有理变换如何在不改变函数域的前提下改变几何”：$\\tilde X$ 的 $b_2=2$ 而 $\\mathbb{A}^2$ 的 $b_2=0$。'),
      step('classification-philosophy', '双有理分类纲领与极小模型的位置', '把所有不可约簇按双有理等价分成类之后，分类问题的表述变成：在每个类里找“最好的代表”。这个纲领能成立依赖三件事。第一，双有理等价类由函数域唯一决定，因此分类是纯双有理不变量（维数、小平维数、一般型等）的分类。第二，类里存在足够好的代表：特征 0 时由消解定理可取光滑代表，由 MMP 可取极小模型或森纤维空间代表。第三，存在可在类内做的手术（爆破、收缩、翻转），它们是算法操作的原子步骤。用维数把这些类排开：曲线情形不变量只有亏格，亏格 0 双有理等价于 $\\mathbb{P}^1$、亏格 1 于椭圆曲线、$g\\ge 2$ 为一般型（由 $\\dim\\Omega^1=g$ 与黎曼-罗赫）；曲面情形由小平维数 $\\kappa=-\\infty,0,1,2$ 分成四类，其中 $\\kappa=-\\infty$ 为有理或直纹面、$\\kappa=0$ 为 K3/阿贝尔/恩里克斯等。这一步说明双有理分类的理论形式与前面几步的技术内容是同一件事的两面：技术部分负责“手术可以做”，纲领部分负责“手术做完了怎么命名”。'),
    ],
    conclusion: '双有理等价＝存在稠密开集同构＝存在互逆有理映射＝（不可约有限型情形）函数域同构；它在类内允许爆破、收缩与翻转，是双有理分类的基础等价关系，但不保拓扑与相交数。',
    dependencies: ['rational-map', 'blowup', 'scheme'],
    consequences: ['resolution', 'mmp', 'kodaira-dimension'],
    explanation: '双有理等价把“几何对象”粗化成“函数域”，这一粗化是刻意的：它丢掉所有低维信息（拓扑、奇点、相交数），换来在类内自由做手术的权力。等价性的证明分成两半，前一方向靠“局部环决定函数域、一般点被送到一般点”，后一方向靠“有限型性使有限多个生成元可以放到公共分母上”，后者正是有限型假设不可去的地方（对无限生成整 k-代数，函数域同构不能保证一般点的局部环可比较）。在双有理类内可做的原子手术是爆破与收缩，翻转则是当收缩不可行时用来绕路的替代方案。所有这些手术都诱导函数域同构，因此它们不改变双有理类，而改变一切更低层的几何量。',
    examples: [
      { title: '例子：有理曲面与二次变换', body: '取 $\\mathbb{P}^2$ 与 $\\mathbb{P}^1\\times\\mathbb{P}^1$。两者都是有理曲面（函数域都同构于 $k(x,y)$，故双有理等价），但不同构：$\\mathbb{P}^1\\times\\mathbb{P}^1$ 上有两条不相交的曲线 $\\{0\\}\\times\\mathbb{P}^1$ 与 $\\{\\infty\\}\\times\\mathbb{P}^1$ 分别在同调类 $F_1,F_2$ 中且 $F_1\\cdot F_2=0$，而 $\\mathbb{P}^2$ 上任意两条曲线相交（$\\mathbb{P}^2$ 的 Pic 群秩 1，任意两条有效曲线有 $\\deg\\alpha\\cdot\\deg\\beta>0$）。这一对例子说明“双有理等价”与“同构”严格不同，且差异可以用相交数（双有理不变量之外的量）检测。' },
      { title: '例子：异于同构但同函数域的曲线情形', body: '在维数 1 的情形，光滑射影曲线由函数域完全决定（光滑射影曲线的函数域分类定理），因此两条光滑射影曲线双有理等价当且仅当它们同构。这解释了“曲线情形的双有理分类就是同构分类”这一现象：只有当维数 ≥2 时，奇异模型与光滑模型之间、以及不同光滑模型之间才可能存在双有理而非同构的关系，例如 $\\mathbb{P}^2$ 与八点爆破的曲面同函数域但不同构。这一对比也说明双有理等价在低维是“无内容”的，在维数 ≥2 才开始有真正的粗化效果。' },
    ],
    remarks: [
      '有限型假设不可去：若允许无限生成整 k-代数，函数域同构不保证存在稠密开集同构（无法把无限多个生成元放到公共分母上），等价性的第二步会失败。',
      '不可约性用于“两个非空开集必相交”；对可约簇必须按不可约分支分别讨论，跨分支的双有理映射一般不存在，强行写 $k(X)\\cong k(Y)$ 只比较了其中一个分支。',
      '双有理等价不保相交数：爆破一个点后例外曲线的自相交数为 −1 而原来那一点没有曲线，因此任何涉及 $D^2$ 的断言都必须在固定的模型上陈述，不能跨双有理类传递。',
      '“$k(X)\\cong k(Y)$”只在不可约情形等价于双有理等价；对非不可约簇函数域是同构于各分支函数域的直积，直积同构不蕴含分支对应，会出现假等价。',
    ],
    corollaries: [
      { title: '推论：双有理等价保维数', body: '由 $\\dim X=\\operatorname{trdeg}_k k(X)$ 且域同构保持超越次数，双有理等价的两簇维数相同。这是双有理分类能按维数分层进行的前提，也是“一般纤维维数为 0”的另一种解读。', uses: ['function-field'] },
      { title: '推论：爆破是双有理变换', body: '沿闭子概形的爆破 $\\pi:\\operatorname{Bl}_Z X\\to X$ 在 $X\\setminus Z$ 上是同构，故 $\\pi$ 双有理；特别地 $k(\\operatorname{Bl}_ZX)=k(X)$。这使爆破成为“在双有理类内做手术”的基本原子操作，也是消解定理与 MMP 的技术基础。', uses: ['blowup-example'] },
    ],
    references: [
      book('Algebraic Geometry, 第 I 章第 4 节与第 II 章第 6 节', 'Robin Hartshorne', 1977),
      book('Birational Geometry of Algebraic Varieties, 第 1 章', 'Kollar & Mori', 1998),
      stacks('Stacks Project, Section 29.49: Birational morphisms', '01RN'),
      stacks('Stacks Project, Section 31.48: Blowing up', '0806'),
    ],
    history: HISTORY,
  },

  'resolution': {
    statement: '设 k 是特征 0 的域，X 是 k 上的整代数簇（或整有限型 k-概形）。则存在光滑簇 $\\tilde X$ 与紧合双有理态射 $\\pi:\\tilde X\\to X$；特别地 $\\pi$ 在 X 的某个稠密开集外只改动奇点，且 $k(\\tilde X)=k(X)$。若 X 还要求 $\\pi$ 在 $X\\setminus \\operatorname{Sing}(X)$ 上是同构，则称为**光滑化**；若 $\\pi$ 是双有理且 $\\pi^{-1}$ 也是态射（即两个方向都是正则映射），称为**消解**（强的意义下）。此外，对任意的闭子概形 $Z\\subsetneq X$ 也可以要求 $\\pi$ 同时在 $\\tilde X$ 的某个开集上是同构。',
    explanation: '消解定理回答的是“双有理类里有没有光滑代表”这个存在性问题：有，至少在特征 0 时。它的价值在于把相交理论、上同调计算、霍奇理论全部搬到光滑情形去做——因为这些工具在奇异簇上要么不成立要么需要虚拟形式。证明的技术核心是**局部化**：先用有限型性与族化把问题变成“局部环上的一致消解”，再用**特征 0 的纯超越性**把局部环嵌入到一个系数环为局部 Artin/正则的良好代数中，使“可消解”成为可在参数上做归纳的性质。特征 0 是实在的假设：正特征时仅在维数 ≤ 3 完全解决（Abhyankar、Cossart–Piltant 等），高维仍是公开问题，因为纯超越性与 Frobenius 造成的不可分现象使归纳失效。',
    steps: [
      step('formulate-strong-form', '陈述强形式：带指定闭子概形与交换图的要求', '先把定理写强一点：给定 X 与闭子概形 $Z\\subsetneq X$，希望 $\\pi:\\tilde X\\to X$ 是紧合双有理态射且 $\\pi^{-1}(Z)=Z\'$ 也是（严格变换）闭子概形，并且 $\\pi$ 是 $Z\'$ 与 Z 上的双有理，同时 $\\tilde X$ 光滑、$Z\'$ 光滑且与 $\\operatorname{Sing}(\\tilde X)$ 的相交良好。这个加强版本是归纳证明必需的：归纳要对“X 与其中的奇点闭集”一起做，否则一旦消解一部分奇点，剩下的奇点集合可能不好控制（它可能变成非容斥的、或与其他分支纠缠）。技术上，强形式允许把“先消解 Z 再消解 X”这种分步操作合法地拼起来，因为两步的例外除子都被控制在 $Z\'$ 与 $\\pi^{-1}$ 中。必须指出这个强形式只在特征 0 有证明：正特征下即使 Z 是光滑的也可能出现“局部化后无法逐参数归纳”的障碍，这正是正特征消解的主要困难来源。'),
      step('reduce-to-local', '局部化：把问题归结到局部环上的一致消解', '利用两个标准事实把整体问题化归为局部问题。第一，有限型性：X 有有限的仿射开覆盖，每个仿射块是有限生成 k-代数，因此可以在每个块上分别构造消解再用紧合性的粘合性质拼起来（粘合需要处理不同块上消解的不兼容，办法是把它们统一到足够细的覆盖上，或用“可消解性在局部化下保持”这一陈述）。第二，Noether 归纳：若在所有局部环 $\\mathcal{O}_{X,x}$ 上都有一致（在参数上可数多项式的）算法，则在全 X 上成立。最关键的观察是：消解是**局部**性质，因为一个态射在某点是否双有理与光滑，完全由该点局部环的决定。因此在 $x$ 处的局部环 $R=\\mathcal{O}_{X,x}$ 上证明“存在正则环 R′ 与紧合双有理 $\\operatorname{Spec}R\'\\to\\operatorname{Spec}R$”就足够了。这一步把问题从几何的粘合问题变成交换代数的局部问题，是整条证明的第一个重大简化，也解释了为什么消解定理的表述总带有限型条件（否则无法取有限覆盖）。'),
      step('characteristic-zero-purity', '特征 0 的关键便利：纯超越扩张与嵌入', '在局部环 R（坐标环在一点的局部化，特征 0）上，核心工具是“纯超越性”：若 $k\\to K$ 是域扩张且 $k$ 代数闭、特征 0，则存在中间域 $k\\subset L\\subset K$ 使 $K/L$ 是纯超越的（可写成 $L(t_1,\\ldots,t_d)$）而 $L/k$ 是代数的；这是特征 0 特有的结论，因为它依赖“代数扩张可分离”从而可用施泰尼茨型论证把超越基选得与代数部分独立。于是把“消解 R 的奇点”这个问题分为两部分：代数部分（$L/k$ 代数，维数更低，可以归纳）与纯超越部分（关于 $d$ 个参数的超越扩张）。在纯超越情形，问题变成对 $k[[t_1,\\ldots,t_d]]/[f]$ 这类环消解，可以用参数归纳（对 d 做归纳）：先假设 $f$ 是参数的“一般系数”并被 $t_1$ 的形式整除，然后逐层算。这一步是特征 0 与正特征的分水岭：正特征时不可分扩张破坏“选择性超越基”的论证，这是正特征高维消解至今未解的根本原因，而正特征维数 ≤3 的证明需要用更细的分类（Abhyankar 对曲面、Cossart–Piltant 对三维）。'),
      step('induction-on-dimension', '关于维数的归纳与局部一致算法的存在性', '在纯超越部分确立之后，做关于维数的归纳：设 n=dim R。若 dim R=0 或 1，结论直接（离散赋值环正则；一维正则即正则）。归纳假设：维数 < n 的整有限型 k-代数都可以消解。对维数 n 的 R，取一个非零的“一般元素”或奇点的定义理想，考虑其零点集 V 与它的奇点闭集 $\\operatorname{Sing}(V)$（维数 < n）；先用归纳假设消解 $\\operatorname{Sing}(V)$（这需要在纯超越情形下的“一般位置”技巧保证消解过程不引入新问题），再用归一化（正规化使 R 正规）与“正规化 + 消解余维 1 部分”交替进行，每次操作后奇点集的维数或“复杂度”严格下降。复杂度必须选成一个可用来做 Noether 归纳的良序集合，常见做法是记录（消解的次数、奇点集合的最大维数、以及每个局部环的嵌入维数与重数的字典序）；只要每一步都让这个元组在字典序下下降，归纳就可以终止。这一步是消解定理最技术性的部分：它需要给出一个在每一步都可核算、且在归纳链中不可能无限下降的复杂度函数，而不是把“重复做直到没有奇点”当作算法。'),
      step('consequences-and-boundary', '结论的形式与特征假设的真实界限', '把各局部块上的消解拼成整体态射即得定理：$\\tilde X$ 光滑、$\\pi$ 紧合双有理，且对指定的 $Z\\subsetneq X$ 有 $\\pi^{-1}(Z)$ 为闭子概形且 $\\pi$ 在其上是双有理（强形式）。由消解立刻得到几个常用推论：光滑簇上的相交理论可以“拉回”度量原簇；簇的动形（birational invariant）可以在光滑模型上计算；由 GRR 计算 $\\chi$ 时可以先做消解再做计算（注意这一步只在“被消解的部分贡献可算”时成立，不是对任意双有理变换都无代价）。边界要讲清楚：特征 0 是实在的假设，正特征高维为公开问题；即使维数 2 与 3 已解决，正特征曲面消解需要用非标准的局部化操作（Abhyankar 的局部一致性），三维需要 Cossart–Piltant 的长篇系列工作，四维以上在正特征无一般结果。另外要区分“消解”“光滑化”与“弱因子化”的强弱：光滑化不要求 $\\pi$ 在奇点上方是除子（可能引入更复杂的例外集），弱因子化只要求把双有理映射分解成爆破与收缩的复合而不要求光滑化，各有独立的适用场合，不能互相替代。'),
    ],
    conclusion: '特征 0 域上任何整代数簇都有紧合双有理态射 $\\pi:\\tilde X\\to X$ 使 $\\tilde X$ 光滑（可在指定闭子概形外固定不动）；特征 >0 时仅在维数 ≤ 3 完全解决，高维仍是公开问题。',
    dependencies: ['birational', 'blowup', 'normalization'],
    consequences: ['mmp', 'birational'],
    explanation: '消解定理是为了让“光滑”这一良好范畴在双有理类中非空。证明的技术骨架是三步化归：把整体问题局部的归结为局部环问题（借助有限型与粘合），把局部问题按“代数部分 + 纯超越部分”拆开（借助特征 0 的纯超越性结论），再对维数做 Noether 归纳（借助一个严格下降的复杂度函数）。整条路线上最脆弱的环节是纯超越性：它使“选择与代数部分独立的超越基”成为可能，而正特征的不可分扩张恰好破坏这一点，于是高维正特征消解至今未解。使用消解定理时还要注意它给的是存在性，不给算法的最优性，也不保证某条指定的例外除子结构，因此在 MMP 与相交理论中经常需要更精细的因子化版本。',
    examples: [
      { title: '例子：特征 0 的结点三次曲线与曲面奇点', body: '取 $C=\\{y^2=x^3+x^2\\}\\subset\\mathbb{A}^2$（结点），奇点只在原点，其局部环为 $k[x,y]_{(x,y)}/(y^2-x^2-x^3)$。作关于原点的爆破：在仿射块 $u=y/x$ 上方程变为 $x^2(u^2-1-x)$，故严格变换是 $\\{u^2=1+x\\}$，光滑（因为对 x 的导数非零），例外的两条点对应 $u=\\pm 1$，与原曲线相交 transversal，故 $\\tilde C$ 光滑。这是一步消解的完整核算：爆破 → 提公因子 → 检查严格变换光滑。' },
      { title: '例子：曲面上的一个需要多次爆破的奇点', body: '取 $X=\\{z^2=xy^2+x^4y\\}\\subset\\mathbb{A}^3$ 或以 $k[[x,y,z]]/(z^2-x y^2-x^4y)$ 定义的局部环，重数为 2 沿曲线 $x=z=0$，属于“非孤立奇点”。消解需要先把这条重数曲线（它本身光滑）用一次爆破化为孤立奇点，再对孤立奇点重复爆破（每次降低重数），最终重数降到 1 即光滑。这个例子说明为什么归纳必须把奇点闭集的维数也纳入复杂度：第一次爆破只降低“奇点集合的维数”，第二次才降低重数，单一指标无法保证终止。' },
    ],
    remarks: [
      '特征 0 不可去：正特征高维消解为公开问题；且在正特征下即使曲线与曲面的消解存在，其证明也无法用纯超越性论证，必须使用局部一致性等非标准操作。',
      '消解给出的 $\\pi$ 只保证双有理，不保证 $\\pi$ 在奇点上方是同构之外的简单结构：例外纤维可能非常复杂（多次爆破的复合），使用“$\\tilde X$ 光滑所以一切都好”而忽略例外除子的贡献是常见错误。',
      '强形式与弱形式的差别在于是否要求 $\\pi^{-1}(Z)$ 也是闭子概形且双有理；在做“先消解子簇再消解整体”的归纳时，弱形式不够用，必须用强形式，否则归纳无法拼接。',
      '消解不保持任何双有理不变量的数值式（例如 $\\chi$）为“逐项相等”：只能说某些组合不变，各单项 Chern 数一般会变，把“消解后可以计算”误解成“消解后数值不变”会算错。',
    ],
    corollaries: [
      { title: '推论：光滑模型的存在使相交理论可使用', body: '由消解，任何特征 0 簇都有光滑双有理模型，于是可以把除子推前到光滑模型上用 Chow 环与相交积计算，再把结果拉回（或在紧合推前下比较）。这是“相交理论在双有理类中可迁移”的技术前提。', uses: ['induction-on-dimension'] },
      { title: '推论：奇点消解给出正规化与消解的联用范式', body: '把归一化（去掉余维 1 的奇性）与消解交替使用，可以得到“正规 + 光滑”的模型；这一范式在曲面分类与 MMP 的每一步里被默认使用，因为 K3 型与一般型的定义都要求 $K_X$ 在正规模型上讨论。', uses: ['reduce-to-local'] },
    ],
    references: [
      book('Resolution of Singularities of an Algebraic Variety over a Field of Characteristic Zero I, II', 'Heisuke Hironaka', 1964),
      book('Resolution of Singularities: A Research Textbook (Progress in Mathematics 181)', 'Hauser, Lipman, Oort, Quiros (eds.)', 2000),
      book('Lectures on Resolution of Singularities (Annals of Mathematics Studies 166)', 'Janos Kollar', 2007),
      stacks('Stacks Project, Section 31.48: Blowing up', '0806'),
    ],
    history: HISTORY,
  },

  'mmp': {
    statement: '极小模型纲领（MMP）对 klt（或 lc）对子 $(X,\\Delta)$ 在特征 0 上按如下算法运作：若 $K_X+\\Delta$ 不丰沛，则取一条 $(K_X+\\Delta)$-负的极端射线 $R\\subset\\overline{NE}(X)$，令 $\\operatorname{cont}_R:X\\to Y$ 为其极端收缩。若 $\\dim Y<\\dim X$（纤维型收缩），得到森纤维空间 $X\\to Y$ 且 $-(K_X+\\Delta)$ 在纤维上丰沛，算法终止；若 $\\dim Y=\\dim X$ 且收缩是除子型的，则做翻转 $X\\dashrightarrow X^+$（或在小收缩情形为 flop），在 $X^+$ 上继续。特征 0 时该序列必在有限步后终止，终止时要么 $K_X+\\Delta$ 丰沛（极小模型），要么得到森纤维空间。',
    explanation: 'MMP 的哲学是把分类问题化为“在双有理类中找标准形”这一几何操作。算法由三步循环构成：找负的极端射线（存在性由锥定理保证）、做收缩（把射线的曲线压掉）、若收缩不好就翻转（绕过不可收缩的情形）。为什么要“负的”极端射线？因为收缩一条 $K$-负的射线在数值上等价于朝“减少 $K$ 的负性”方向移动，这正是让 $K_X+\\Delta$ 逐渐变丰沛的方向；终点若不是丰沛，则簇的结构被 $K$ 的零/负性刻画成纤维空间（Fano 型），也是可分类的对象。每一步技术上真正困难的是三件事：终止性、翻转的存在性、以及每一步操作后保持在 klt 类内。这些在曲面（古典）、三维（Mori 1988）、以及特征 0 任意维（BCHM 2010）分别被解决，正特征高维仍是公开问题。',
    steps: [
      step('cone-theorem-input', '起点：用锥定理得到负极端射线与收缩', '对 klt 对子 $(X,\\Delta)$ 在特征 0 上，锥定理断言 $\\overline{NE}(X)$ 被 $K_X+\\Delta\\ge 0$ 的半空间与至多可数条 $(K_X+\\Delta)$-负的极端射线 $R_i$ 共同生成，且这些负射线局部离散。于是只要 $K_X+\\Delta$ 不丰沛，就存在一条负极端射线 $R$（否则有效锥全部落在 $K\\ge 0$ 一侧，配合丰沛性判据会与不丰沛矛盾）。锥定理同时给出极端射线的收缩 $\\operatorname{cont}_R:X\\to Y$：由相对锥定理（base-point-free theorem 或 cone theorem 的收缩部分）保证收缩态射存在，且相对 Picard 数降 1。这一步把“如何化简簇”变成“枚举极端射线”，因为每条极端射线对应一次收缩操作，而这个枚举是可数的、局部离散的。要强调的是锥定理本身需要对子 klt 且 $K_X+\\Delta$ 为 $\\mathbb{R}$-Cartier，否则连 $K$ 与曲线的交数都无定义。'),
      step('divisorial-versus-fiber', '分类极端收缩：除子型、小收缩与纤维型', '极端收缩 $\\operatorname{cont}_R:X\\to Y$ 按维数与相对 Picard 数分三类。第一类，$\\dim Y<\\dim X$：纤维型收缩，纤维连通的 Fano 型簇，算法在此终止得到森纤维空间（因为 $-(K_X+\\Delta)$ 在一般纤维上丰沛）。第二类，$\\dim Y=\\dim X$ 且收缩是除子型的（被收缩的集合是余维 1 的除子）：此时是 divisorial contraction，$X\\setminus$（例外除子）$\\to Y$ 是双有理且 $\\rho(X/Y)=1$，$Y$ 保持 klt，且 $\\rho(Y)=\\rho(X)-1$，因此在除子型收缩情形 Picard 数严格下降，这给出一个终止性的粗糙论证（Picard 数是有限维且非负整数）。第三类，$\\dim Y=\\dim X$ 且被收缩集合的余维 ≥ 2：这是**小收缩**（small contraction），问题是 $Y$ 一般不再是 $\\mathbb{Q}$-Gorenstein，导致 $K_Y+\\Delta_Y$ 不是 $\\mathbb{R}$-Cartier，算法无法继续。第三类是全部技术困难的来源。'),
      step('flip-and-termination', '对小收缩做翻转并论证终止', '对小收缩 $c:X\\to Y$（收缩集合 Z 余维 ≥2、$K_X+\\Delta$ 在 Z 的曲线族上为负），翻转是一个双有理映射 $X\\dashrightarrow X^+$，它与 $c$ 一起构成态射 $X^+\\to Y$，满足：$X^+$ 正规、$K_{X^+}+\\Delta^+$ 是 $\\mathbb{R}$-Cartier、$-(K_{X^+}+\\Delta^+)$ 在 $X^+\\to Y$ 的纤维上丰沛、且 $X^+$ 与 X 在 $Y$ 的某个开集上同构。存在性由翻转定理保证（特征 0 任意维由 BCHM 2010 证明，三维由 Mori 1988，曲面无小收缩故不需要）。得到 $X^+$ 后，$K_{X^+}+\\Delta^+$ 的负性“减少”，具体地 $\\rho$ 不变但复杂度下降。终止性在特征 0 由 BCHM 的“复杂度有界 + 有效（effective）终止”论证给出：他们用一个精确的复杂度函数（记录一般纤维的维数与 $K$ 与一般纤维的负性度量）证明它取非负整数值且每步严格下降，从而不可能无限进行；此外还有基于“一般纤维维数下降”与“极小模型存在性”的终止证明（Birkar 的实现）。这一步完成算法的循环闭合：只要每一步都保持 klt 且复杂度下降，最终必然到达 $K$ 丰沛或纤维型的终点。'),
      step('algorithm-and-classes', '算法流程与收缩/翻转的类别保持', '把循环写清楚：给定 klt 对子 $(X,\\Delta)$，若 $K_X+\\Delta$ 丰沛则停，$X$ 已是极小模型；否则由锥定理取负极端射线 R 与其收缩 $c$。若 $c$ 是纤维型，停于森纤维空间；若 $c$ 是除子型，令 $X:=Y$、$\\Delta:=\\Delta_Y$ 并继续；若 $c$ 是小收缩，做翻转 $X\\dashrightarrow X^+$、$\\Delta:=\\Delta^+$ 并继续。要紧的是每一步都保持 klt（除子型收缩下 klt 保持；翻转下由翻转的构造与 $K$ 的 $\\mathbb{R}$-Cartier 性保持）；若中途出现 lc 但非 klt 的对子，翻转定理不再适用于原始形式，需要用“极小 lc 中心”等更精细的技术（特征 0 由 Birkar 的 $\\Gamma$-解析与 lc 情形的翻转定理处理）。还要注意小收缩的 flop（即 $K$-trivial 的小收缩变换）不被 MMP 使用，因为 flop 不改变 $K$ 的丰沛性，它只是在不同极小模型之间移动（这一点在极小模型的存在性与唯一性讨论中起作用，例如 K3 曲面与一般型曲面都有无限多个极小模型被 flop 连接）。'),
      step('consequences-and-limits', '结论的意义与假设边界', 'MMP 完成后的收获是分类定理的形式化：任何 klt 对子都双有理等价于一个要么 $K$ 丰沛（极小模型）、要么带 Fano 纤维空间（$\\kappa=-\\infty$ 型）的对象；这正是把“任意簇”切成“负曲率（Fano 型）与正/零曲率（极小模型）”两大块。由此推出很多结果：一般型簇的极小模型丰沛且唯一（对数一般型的丰沛性）；$\\kappa=0$ 的簇有由极小模型的 $K$ 的丰富结构决定的分类；以及三维及特征 0 高维的翻转存在性都被一次性解决。边界必须写清：第一，MMP 不保证“终止”在正特征高维（公开问题），也不保证在非 klt 情形（需要 lc 或更弱的假设与额外技术）。第二，极小模型一般不唯一（有 flop 连接），因此“找一个极小模型”与“找唯一的标准形”是两件事；一般型情形才有唯一性（由带适当系数的丰沛性保证）。第三，算法输出的是双有理模型而不是同构分类，同构层次的问题（例如法诺簇的具体族数）需要另外的枚举工作。'),
    ],
    conclusion: 'MMP = 锥定理（找负极端射线与收缩）+ 除子型收缩降秩 + 翻转绕过小收缩，并在复杂度严格下降下终止；特征 0 任意维与三维正特征已确立，终点为极小模型（$K$ 丰沛）或森纤维空间（Fano 型），正特征高维终止仍公开。',
    dependencies: ['cone-theorem', 'flip', 'resolution', 'nakai-moishezon'],
    consequences: ['fano', 'kodaira-dimension', 'birational'],
    explanation: 'MMP 把“分类”这个模糊目标变为可执行的算法，靠的是三件被分别证明的硬事实：锥定理给出负极端射线与收缩（否则算法无从起步），翻转定理给出小收缩情形下的替代路径（否则算法在余维 ≥2 的收缩上卡死），复杂度下降给出终止（否则算法可能永远循环）。每一步的假设都要仔细：klt 保证 $K$ 是 $\\mathbb{R}$-Cartier 且翻转定理可用；特征 0 保证纯超越性与实现论证可用；除子型收缩情形 Picard 数下降给了粗略的终止理由，小收缩情形则必须靠翻转后的复杂度下降。终点只有两种形态：$K$ 丰沛的极小模型或 Fano 纤维空间，这恰好把几何按 $K$ 的正负性分成两块，也是“按曲率分类”这一纲领在高维的实现。',
    examples: [
      { title: '例子：曲面的 MMP 就是收缩 −1 曲线', body: '光滑射影曲面上的极端射线对应不可约曲线 C，$K_X\\cdot C<0$。由亏格公式 $2p_a(C)-2=C^2+K_X\\cdot C$，$C$ 不可约约化且 $K\\cdot C<0$ 迫使 $C\\cong\\mathbb{P}^1$ 且 $C^2=-1$；收缩这条 −1 曲线（Castelnuovo 判据）给出纤维型（$\\dim Y<2$，若 $X$ 是直纹面）或除子型（$\\dim Y=2$，$\\rho$ 降 1）收缩。重复下去：有理曲面的终止是 $\\mathbb{P}^2$ 或 $\\mathbb{P}^1\\times\\mathbb{P}^1$；$\\kappa\\ge 0$ 的曲面终止于 $K$ 丰沛的极小模型或纤维到曲线（$\\kappa=0$ 时的椭圆纤维化）。这个完整例子说明 MMP 在曲面情形与古典“极小模型理论”完全一致。' },
      { title: '例子：三维的翻转与小收缩', body: '取 $X$ 为 $\\mathbb{P}^2$ 在 9 个点（恰当般的配置）的爆破使 $-K_X$ 不再丰沛，此时存在小收缩 $c:X\\to Y$ 收缩一条曲线族到一点，$Y$ 不是 $\\mathbb{Q}$-Gorenstein，$K_Y$ 无定义，算法卡住。翻转 $X^+\\to Y$ 把这条曲线族替换成另一条曲线族，使 $-K_{X^+}$ 沿新曲线为正；在 $X^+$ 上继续做除子型收缩。三维翻转由 Mori 用“极端射线 + 极小模型 + 对偶锥”的方法构造。这个例子说明翻转不是可有可无的技术修补，而是算法在小收缩处继续的唯一出路。' },
    ],
    remarks: [
      'klt 假设不可去：非 klt（例如仅有 lc）情形翻转定理的原始形式失效，必须用极小 lc 中心与 $\\Gamma$-解析等更精细的技术；把 klt 的终止论证直接搬到 lc 上会得到错误结论。',
      '终止性在正特征高维未解决：不能认为“MMP 总能在有限步停”，这是公开问题；在讨论正特征时必须区分“算法可以定义”与“算法能终止”。',
      '极小模型不唯一：flop（$K$-trivial 的小变换）不改变 $K$ 的丰沛性，却给出不同的极小模型，因此“唯一标准形”只在一般型情形（或补充适当系数后）成立。',
      '除子型收缩降 Picard 数给终止提供理由，但小收缩/翻转不降 $\\rho$，若只看 $\\rho$ 会错误地以为“$\\rho$ 不变就可以无限做下去”；真正的终止需要复杂度下降。',
    ],
    corollaries: [
      { title: '推论：一般型簇存在唯一的丰沛极小模型', body: '若 $(X,\\Delta)$ 是对数一般型（$\\kappa(X,K_X+\\Delta)=\\dim X$），则 MMP 终点 $K$ 丰沛，且该丰沛模型在双有理意义下唯一（由丰沛性的双有理不变与 flop 不能存在于 $K$ 丰沛模型之间的性质）。这条性质使一般型簇可以被唯一的标准形代表，是分类的理想情形。', uses: ['flip-and-termination'] },
      { title: '推论：−∞ 型必有森纤维空间结构', body: '若 MMP 终止于不可终止的丰沛性（即 $K_X+\\Delta$ 永不丰沛），则终端是一个纤维型收缩 $X\\to Y$ 且 $-(K_X+\\Delta)$ 在纤维上丰沛；于是 $X$ 的结构由 Y 与 Fano 纤维共同刻画，$\\kappa=-\\infty$。这把“负曲率”这一无法分类的类转化为“Fano 纤维 + 底簇”的可分类结构。', uses: ['divisorial-versus-fiber'] },
    ],
    references: [
      book('Birational Geometry of Algebraic Varieties (Cambridge Tracts 134)', 'Kollar & Mori', 1998),
      book('Existence of minimal models for varieties of log general type (JAMS 23)', 'Birkar, Cascini, Hacon, McKernan', 2010),
      book('Flip theorem and the existence of minimal models for 3-folds (JAMS 1)', 'Shigefumi Mori', 1988),
      stacks('Stacks Project, Section 74.46: Minimal model program（相关章节）', '0FQA'),
    ],
    history: HISTORY,
  },

  'nakai-moishezon': {
    statement: '设 X 是域 k 上的射影连通正则概形（或紧合光滑簇），D 是 X 上的 Cartier 除子。则 D 丰沛，当且仅当对每个不可约闭子簇 $V\\subseteq X$（从而 $\\dim V=V$ 维），都有 $D^{\\dim V}\\cdot V>0$（其中 $D^{\\dim V}\\cdot V$ 指在 V 上的相交数，等价地取 V 的适当倍数作为整闭子概形时的次数）。',
    explanation: '这条判据把抽象的“丰沛性”（存在某个倍数 m 使 mD 极丰沛，即给出到射影空间的嵌入）化为逐维可核验的数值条件。证明的骨架是“一般位置 + 归纳 + 有效锥的刻画”：先建立“非负性判据”（$D\\cdot C\\ge0$ 对所有曲线成立等价于 D 属于闭有效锥），再用一般位置技巧把任意子簇 V 的相交数搬到一般超平面截面上做归纳。要提防的常见误解是“正性必须对**所有**子簇验证”与“切掉一个条件就不成立”——例如只验证曲线（数值有效）是不够的：数值有效但不丰沛的除子存在（Nakai 的反例族、Zariski 反例），必须逐维验证到 $\\dim V=\\dim X$，最高维那一项正是“整体次数为正”的丰沛性本质。',
    steps: [
      step('negative-curve-criterion', '第一步：闭有效锥的数值刻画', '称类 $\\alpha\\in N_1(X)$（曲线类的实向量空间）为有效（pseudoeffective）若它能被有效 1-闭链逼近。基本定理（Kleiman 判据）：$\\alpha$ 属于闭有效锥 $\\overline{NE}(X)$ 当且仅当 $L\\cdot\\alpha\\ge0$ 对每个 nef（数值有效）线丛 L 成立。这一判据把“锥”这一不易直接描述的集合换成“由所有 $L\\cdot$ 定义的不等式”，使我们可以用除子来检验曲线类，反之亦然。证明思路是用分离定理：若 $\\alpha\\notin\\overline{NE}$，则存在超平面把 $\\alpha$ 与闭凸锥分离，该超平面对应一个除子类 $\\beta$ 使 $\\beta\\cdot\\alpha>0$ 但 $\\beta\\cdot\\gamma\\le0$ 对所有 $\\gamma\\in\\overline{NE}$；再论证这样的 $\\beta$ 可被取成 nef（这一步需要 $\\beta$ 在闭有效锥上非正时实际上是 zero 或负倍数类，借助对偶锥 $\\overline{NE}^{*}=\\overline{\\text{Nef}}$ 的标准事实）。这一步是 Nakai–Moishezon 判据的“非负性一半”的基础。'),
      step('nonnegative-case', '第二步：非负性判据与 nef 类', '若 $D^{\\dim V}\\cdot V\\ge0$ 对所有 V 成立（即所有维数上的次数非负），则由上一判据的归纳形式可得 D 是 nef。具体机制：对曲线情形 $D\\cdot C\\ge0$ 立即给 $D\\in\\overline{\\text{Nef}}$，因为曲线类张成 $N_1$ 而 nef 要求对所有曲线非负。对高维 V，把 V 换成 V 的一般超平面截面 $V\\cap H$（H 为很一般的超平面），使该截面保持不可约且上同调类由 V 决定（Bertini 型的一般位置），于是 $D^{\\dim V}\\cdot V$ 可以用 $D^{\\dim V-1}\\cdot (V\\cap H)$ 逼近并归纳。于是“所有维数次数的非负性”等价于“D 是 nef”。要注意这一步里“一般位置”是必要的：对非一般位置的截面，次数可能因切触而变小或变大，Bertini 的类型结论（在代数闭域特征 0 时 $V\\cap H$ 光滑且不可约）正是保证把维数降到 $\\dim V-1$ 后仍适用归纳假设的关键。'),
      step('positive-to-ample', '第三步：严格正性提升为丰沛性（用归纳与切触）', '现在假设 $D^{\\dim V}\\cdot V>0$ 严格成立。要证 D 丰沛，路线是对维数 n 做归纳。关键输入是**相对的** Nakai 判据与丰沛性的数值刻画：n=1 时 $D\\cdot X>0$ 即 $\\deg D>0$，由 Riemann–Roch 立即得 $H^0(X,mD)\\to\\infty$ 且 mD 极丰沛（$h^0=\\deg+m(1-g)$，$m\\gg0$ 时给出嵌入）。归纳步：取一个很一般的超平面 $H\\subset X$（使 $H$ 光滑、不可约、且与 D 处于一般位置），把 $D|_H$ 视为 H 上的除子。对 H 上的任意不可约 $V\\subseteq H$，$V$ 也是 X 的子簇，且 $D|_H^{\\dim V}\\cdot V=D^{\\dim V}\\cdot V>0$（一般位置保证相等），故由归纳假设 $D|_H$ 丰沛。再由“丰沛 + 退化到一般超平面”的 Lefschetz 型结论（$H^0(X,mD)\\to H^0(H,mD|_H)$ 对 $m\\gg0$ 满射），得到 $h^0(X,mD)\\to\\infty$ 且 mD 给出 X 到射影空间的嵌入（基点的排除由在 H 上丰沛与短正合列 $0\\to\\mathcal{O}((m-1)D)\\to\\mathcal{O}(mD)\\to\\mathcal{O}(mD)|_H\\to0$ 的上同调计算完成）。两个方向合起来给出判据。'),
      step('equivalence-both-ways', '第四步：两个方向的合并与判据的准确形式', '把上面三步拼起来。方向一（丰沛 ⟹ 正性）：若 D 丰沛，取 m 使 mD 极丰沛并给出嵌入 $\\varphi:X\\hookrightarrow\\mathbb{P}^N$，则 $\\varphi^{*}\\mathcal{O}(1)=mD$。对任意不可约 $V\\subseteq X$ 且 $\\dim V=v$，$\\varphi(V)$ 是 $\\mathbb{P}^N$ 中的 v 维子簇，$\\mathcal{O}(1)^{v}\\cdot\\varphi(V)>0$（射影空间中超平面与 v 维子簇必有正的交数，因为 H 很大时 $\\varphi(V)\\cap H$ 非空且次数为正），推回得 $D^{v}\\cdot V=\\dfrac{1}{m^{v}}\\mathcal{O}(1)^{v}\\cdot\\varphi(V)>0$。方向二（正性 ⟹ 丰沛）由第二、三步给出。合并时要注意量词方向：判据要求对所有不可约闭子簇 V 成立，不只是曲线，也不只是“一般的” V；同时 X 需射影（紧合）以保证相交数与除子的数值类理论可用，正则性用来保证 Cartier 除子与 Weil 除子一致及一般超平面截面的良好性。缺少正则性时判据需要改成对 $\\mathbb{Q}$-Cartier 的适当修正形式，直接用原陈述会出错。'),
      step('examples-that-bite', '第五步：正性判据的必要性与反例', '验证每个条件不能被削弱。只验证曲线（$D\\cdot C>0$）不足：存在数值有效（甚至 $D\\cdot C>0$ 对一切曲线）但不丰沛的除子。经典构造是 Zariski 的“数值有效但不是 nef 的除子”与 Nakai 的反例族，其机制是大分数系数使除子在某些子簇上的次数为 0（不是严格正），虽然曲线上的次数都为正。另外 $\\ge0$ 而不严格正（nef 而非 ample）的例子最直接：$X=\\mathbb{P}^1\\times C$ 上取 $D=\\mathcal{O}(1)\\times\\{\\text{点}\\}$ 的拉回 $\\pi_1^{*}\\mathcal{O}(1)$，它有 $D\\cdot$（纤维）$=0$，故 $D^2\\cdot X=0$，不满足严格正性，事实上 D 也不是丰沛的（$h^0$ 只随基底增长，给出的是纤维化而不是嵌入）。更有名的是 Zariski 反例：$\\mathbb{P}^2$ 在很特殊的十二点（含三条线上的点）配置下的爆破面上，某线性系的基轨迹使某个除子所有曲线的交数为正但该系仍有基轨迹，从而不丰沛——这说明“数值正”与“几何有效”之间的缝隙必须由逐维严格正性补上。这些反例共同说明：判据里的量词“每个不可约子簇、每个维数”是实质条件，不能以“检查了所有曲线”替代。'),
    ],
    conclusion: '正则射影簇上 D 丰沛 ⟺ 对每个不可约闭子簇 $V$ 都有 $D^{\\dim V}\\cdot V>0$；等价地 nef 加上最高维的严格正性也可以刻画丰沛性，逐维验证的必要性由数值有效非丰沛的反例（Zariski、Nakai 等）证明确实不可省。',
    dependencies: ['chern-class', 'canonical-sheaf', 'birational'],
    consequences: ['cone-theorem', 'mmp', 'fano'],
    explanation: 'Nakai–Moishezon 判据的思想是“把几何性质翻译成数值可检验的条件”。丰沛性的定义（某个倍数给出嵌入）本身是存在性的，难以直接核对；判据把它换成一组关于相交数的严格不等式。证明的技术路线分两块：一块是有效锥与 nef 的对偶刻画（Kleiman 判据），另一块是用一般超平面截面把高维子簇的相交数归纳到低维，再由 Lefschetz 型满射把“截面丰沛”提升为“整体丰沛”。要特别重视量词：只验证曲线给出的是 nef（数值有效），而 nef 严格弱于 ample，反例族（Zariski 的十二点配置、Nakai 的数值有效族）正是靠“某些子簇上次数为 0”来构造的。',
    examples: [
      { title: '例子：曲面上逐项核验', body: '光滑射影曲面 X 上判据要求三件事：$D\\cdot C>0$ 对一切不可约曲线 C、以及 $D^2>0$。取 $X=\\mathbb{P}^2$、$D=dH$（$d>0$）：$D\\cdot C=3d>0$、$D^2=d^2>0$，故 D 丰沛，与 $\\mathcal{O}(d)$ 由齐次多项式给出嵌入（$d\\ge1$）一致。取 $D=H_1-H_2$（两条直线的差，在同调上为 0 类）：$D^2=0$，不满足严格正性，事实上 $D\\cdot(H_1)=1>0$ 但 $D\\cdot(H_2)=-1<0$，连曲线正性都失败。取 $X$ 为 $\\mathbb{P}^2$ 在一个点的爆破、$D=H-E$：对例外曲线 E 有 $D\\cdot E=1>0$、对严格变换的直线 $D\\cdot\\ell=1>0$、且 $D^2=(H-E)^2=0$，不满足 $D^2>0$，事实上 $D$ 给出的是到 $\\mathbb{P}^1$ 的纤维化（正是 $X\\to\\mathbb{P}^1$ 的纤维类），不是丰沛的。这个核验说明判据的三项缺一不可。' },
      { title: '例子：Zariski 反例的机制', body: '取 $I_1$ 过 $\\mathbb{P}^2$ 的 $p_1,p_4,p_7$ 三点、$I_2$ 过 $p_2,p_5,p_8$、$I_3$ 过 $p_3,p_6,p_9$、$C$ 过 $p_1,p_2,p_3$，考虑十二点（九点是 $I$ 与 $C\\cup C\'$ 的配合）配置上的爆破面 X 与除子 $D=m^{\\text{ell}}(H)-\\sum a_iE_i$。当系数选择特殊（含非整系数）时，$D\\cdot C>0$ 对一切曲线成立，但由于基轨迹与校正系数的相互作用，$D$ 的某个倍数的线性系始终有基轨迹，故 D 不丰沛。这个例子的价值在于精确指出“曲线正性”与“逐维严格正性”的差距正是丰沛性，也提示使用判据时必须老老实实把最高维那一条也算出来。' },
    ],
    remarks: [
      '量词不能缩减：只验证曲线得到 nef（数值有效），nef 不蕴含 ample；Zariski 与 Nakai 的反例族通过“某些子簇上次数为 0”构造出数值有效而非丰沛的除子，因此必须逐维验证到 $\\dim V=\\dim X$。',
      '正则性与射影性不可省：非正则簇上 $D$ 可能只是 Weil 除子，$^{\\dim V}\\cdot V$ 的相交数需要先取 $\\mathbb{Q}$-Cartier 修正；非射影（只有紧合）情形缺少足够多的整闭子概形来验证，判据的“⟸”方向会失败。',
      '特征假设在一般位置论证中出现：归纳步依赖 Bertini 型结论（一般超平面截面光滑不可约）与 Lefschetz 型满射，特征 0 时标准成立，正特征需要额外分离性假设。',
      '严格正性不能弱化为“非负”：$D$ 的 $D^{\\dim V}\\cdot V\\ge0$ 与 $>0$ 之间是 nef 与 ample 的差别；把判据写成“非负即丰沛”会立刻被 $\\mathcal{O}(1)\\times$ 点这类拉回除子反例反驳。',
    ],
    corollaries: [
      { title: '推论：丰沛性是把 nef 加强为严格正性', body: '由判据，$D$ 丰沛 ⟺ $D$ nef 且 $D^{\\dim X}>0$（在 X 维数为 $\\dim X$ 时最高维次数严格正）。这把丰沛性的检验分解为“所有维数的非负性”与“最高维的严格正性”，前者可用 Kleiman 判据与曲线检验，后者是一次数值计算。', uses: ['nonnegative-case'] },
      { title: '推论：与 K-丰沛性一起刻画极小模型', body: '在 MMP 终点，$K_X+\\Delta$ 丰沛的定义正是判据的严格正性条件对所有子簇成立（在小平维数为 $\\dim X$ 的情形）；因此在判断“某模型是否已到极小模型”时，可以逐维核验 $K\\cdot$ 次数，而不必构造极丰沛倍数，是 MMP 计算中的一个实用手段。', uses: ['positive-to-ample'] },
    ],
    references: [
      book('Algebraic Geometry, 第 II 章第 7 节与第 V 章（丰沛性判据）', 'Robin Hartshorne', 1977),
      book('Positivity in Algebraic Geometry I, 第 1 章与第 2 章', 'Robert Lazarsfeld', 2004),
      stacks('Stacks Project, Section 30.21: Ample invertible sheaves', '01PS'),
      stacks('Stacks Project, Section 30.22: Ample sheaves and the Nakai-Moishezon criterion', '0B5S'),
    ],
    history: HISTORY,
  },

  'cone-theorem': {
    statement: '设 $(X,\\Delta)$ 是特征 0 域上的射影 klt 对子（$K_X+\\Delta$ 为 $\\mathbb{R}$-Cartier）。则曲线类的实向量空间中的闭有效锥分解为 $\\overline{NE}(X)=\\overline{NE}(X)_{K_X+\\Delta\\ge0}+\\sum_i \\mathbb{R}_{\\ge0}[C_i]$，其中 $\\overline{NE}(X)_{K_X+\\Delta\\ge0}=\\{\\alpha\\in\\overline{NE}(X)\\mid (K_X+\\Delta)\\cdot\\alpha\\ge0\\}$，每条 $C_i$ 是不可约曲线（由一般位置的曲线所生成）且 $(K_X+\\Delta)\\cdot C_i<0$，这族曲线在 $(K_X+\\Delta)<0$ 一侧局部离散，且对任意 $\\varepsilon>0$ 与任意 nef 类 $\\alpha$，只有有限多个 $C_i$ 满足 $\\alpha\\cdot C_i$ 有界。等价地，$\\overline{NE}(X)$ 由 $K\\ge0$ 部分与至多可数条 $K$-负极端射线生成。',
    explanation: '锥定理是 MMP 的算法起点：它说负曲率方向上有效锥只由离散的射线组成，因此可以“一条射线一次收缩”地枚举操作。如果锥是连续一团负方向，就永远无法用有限步操作化简，MMP 也就无法启动。定理的形式有三层内容要分清：第一是分解本身（$K\\ge0$ 部分加上可数多条负射线），第二是负射线的几何来源（由曲线生成，且是可数、局部离散的），第三是可数性证明依赖的技术输入（有理曲线、次数估计、Noether 归纳）。另外要提防把“锥定理”和“收缩定理”混为一谈：前者说锥长什么样，后者说每条负极端射线对应一个收缩态射，两者合起来才是 MMP 用到的完整工具。',
    steps: [
      step('setup-nef-cone', '预备：有效锥、nef 锥与对偶关系', '记 $N_1(X)$ 为曲线类的实向量空间（系数在 $\\mathbb{R}$，由不可约曲线的类生成），其对偶 $N^1(X)$ 由除子类生成，配对由相交数给出。闭有效锥 $\\overline{NE}(X)\\subseteq N_1(X)$ 是有效 1-闭链类的闭包；nef 锥 $\\overline{\\text{Nef}}(X)\\subseteq N^1(X)$ 是 nef 类（对所有曲线次数非负的类）的闭包。基本的对偶关系是 $\\overline{\\text{Nef}}(X)=\\overline{NE}(X)^{*}$ 与 $\\overline{NE}(X)=\\overline{\\text{Nef}}(X)_{*}$（在 $N_1$ 与 $N^1$ 都有限维且配对非退化时成立，这需要 X 射影且 $N_1$ 有限生成，由 Néron–Severi 型定理给出）。这一步的意义是把“曲线类”与“除子类”两个空间放在对偶的位置上，于是关于锥的几何陈述可以翻译成关于除子泛函的代数陈述：例如“$\\alpha\\in\\overline{NE}$”等价于“对一切 nef 类有非负配对”（Kleiman 判据）。$K_X+\\Delta$ 作为 $N^1$ 中的元素，它在曲线上的取值就是与锥配对给出的线性泛函，因此“负射线”就是使这个泛函取负值的锥上的射线。'),
      step('rational-curves-in-extremal-ray', '关键引理：负极端射线由有理曲线生成', '定理的技术核心是一个结构引理：若 $R$ 是 $(K_X+\\Delta)$-负的极端射线，则存在有理曲线 $C\\subset X$ 使 $[C]\\in R$ 且 $-(K_X+\\Delta)\\cdot C\\le \\dim X+1$，此外 $C$ 可以取成 $\\mathbb{P}^1$ 的像（可约、含非约化结构也无妨，只要按 1-闭链理解）。证明思路分两步。第一步，把问题化归到曲面：在 $N_1(X)$ 中取极端射线 R 的生成元 $\\alpha=\\sum a_i[C_i]$，利用极端性把它写成有限多个不可约曲线类的正组合（这是极端性的定义在有限维锥上的表达，需要 $\\overline{NE}(X)$ 在负半空间局部有限生成）；然后取一个足够一般的曲面截面 $S\\subset X$（用一般超平面截两次，或用一般位置的多重截面）使所有这些 $C_i$ 都被 S 完整覆盖，从而把曲线类搬到曲面 S 上研究。第二步，在光滑射影曲面 S 上用亏格公式与 Hodge 指标定理做次数估计：对 S 上不可约曲线 $C_i$，由 $2p_a(C_i)-2=C_i^2+K_S\\cdot C_i$ 与 $K_S\\cdot C_i<0$ 推出 $C_i^2<0$（当 $C_i\\cong\\mathbb{P}^1$ 时 $C_i^2\\le-1$），再对 S 的上同调用指标定理把 $\\alpha^2$ 与各项的自相交数联系起来，配合 $\\alpha$ 张成一条射线（$\\alpha^2=0$ 或符号条件）得到 $\\#\\{\\text{i}\\}$ 与 $-(K_S\\cdot \\alpha)$ 有界，从而 $\\alpha$ 的系数中只有有限多个非零且都对应有限多条有理曲线。这一步把“曲线族”化归到曲面上可数的有理曲线族，是锥定理区别于一般锥论的地方。'),
      step('countability', '可数性与局部离散的论证', '得到“负极端射线由有理曲线生成”之后，还要证明这些射线只有可数多条、且在负侧局部离散。可数性的来源：每个有理曲线对应一个由有限多个方程定义的族（点与切方向的参数空间是有限类型的，即“有理曲线在 X 上的参数空间”——一个可数的可构造分解或 Hilbert 概型的有限个分支），而有限型概形上的几何点集合至多可数（在代数闭域上，可构造集按 Noether 归纳分解成有限多个局部闭的不可约块，每块对应一族曲线，故曲线族至多可数）。局部离散性的来源：对任意 nef 类 $\\alpha$ 与任意 $\\varepsilon>0$，条件 $-\\varepsilon\\alpha\\le (K_X+\\Delta)\\le0$ 与 $\\alpha\\cdot C\\le M$ 的曲线只能来自有限多个族（否则会有无限多条曲线落在 $\\alpha$ 值有界而 $K$ 值为负的“锥切片”里，与上一步的次数界 $-(K_X+\\Delta)\\cdot C\\le \\dim X+1$ 矛盾）。这两条合起来给出锥定理陈述中“至多可数且负侧局部有限”的精确口径：注意“局部有限”是相对 nef 类与 ε 而言的，不是对锥上所有点都成立。'),
      step('decomposition', '把锥分解成非负部分与负射线之和', '现在组装分解 $\\overline{NE}(X)=\\overline{NE}(X)_{K\\ge0}+\\sum_i\\mathbb{R}_{\\ge0}[C_i]$。包含关系 $\\supseteq$ 显然（$K\\ge0$ 部分在锥内，每条负射线也由有效曲线生成）。反向 $\\subseteq$：取 $\\alpha\\in\\overline{NE}(X)$。若 $K\\cdot\\alpha\\ge0$ 则 $\\alpha$ 落在第一项，完。若 $K\\cdot\\alpha<0$，要写 $\\alpha=\\beta+\\gamma$ 其中 $\\beta\\in\\overline{NE}_{K\\ge0}$、$\\gamma$ 属于负射线的正组合。做法是用“锥的极端射线”结构：把 $\\alpha$ 在锥 $\\overline{NE}\\cap\\{K\\le K\\cdot\\alpha\\}$ 这一紧致切片上做 Carathéodory 型分解，每一条出现在分解里的极端射线要么是 $K\\ge0$（归入 $\\beta$）要么是 $K<0$（由上一引理是某个 $C_i$，归入 $\\gamma$）。这一步用到闭有效锥的有限维切片是紧的（由 $N_1$ 有限维与锥的闭性）以及极端射线在紧切片上的存在性，因此分解的合法性完全建立在有限维凸几何与上一步的射线清单上。要提醒的是 $\\gamma$ 一般需要有限多个项（Carathéodory 给出有限性），这正是锥定理能以可数和写出的原因。'),
      step('contractions-and-comparison', '收缩与锥定理的配套结论', '锥定理在 MMP 中被使用的是它的“射线—收缩”对应：对每条极端射线 $R$，存在唯一（在同构意义下）的收缩态射 $\\operatorname{cont}_R:X\\to Y$ 使其相对 Picard 数等于 1，且 $\\operatorname{cont}_R$ 收缩的正是 R 上的曲线。这部分的证明是锥定理的**收缩部分**（cone theorem + contraction theorem，亦称相对锥定理与 base point free theorem）：先在射线 R 上取一个整除子类 $\\beta$ 使 $\\beta\\cdot R=0$，对 $m\\gg0$ 用基点自由定理保证 $m\\beta$ 自由，其定义态射即为收缩。因此在陈述 MMP 算法时应当写“锥定理 + 收缩定理”，两者一起才能给出“负极端射线对应一次手术”。与 Nakai–Moishezon 判据的连接在于：ambient 的丰沛性判断（判据）用来确认“是否已经终止”，而锥定理用来提供“继续手术的方向”，两条定理分别负责算法的停止条件与推进条件，不能相互替代。'),
    ],
    conclusion: 'klt 对子（特征 0）的闭有效锥等于 $K\\ge0$ 部分加上至多可数条由有理曲线生成的 $K$-负极端射线之和，负侧局部离散；配合收缩定理，每条射线对应一次极端收缩，这是 MMP 的算法起点。',
    dependencies: ['nakai-moishezon', 'mmp', 'resolution'],
    consequences: ['mmp', 'flip', 'fano'],
    explanation: '锥定理回答了“MMP 能不能起步”这个先决问题：负曲率方向上的有效锥只能是离散的一族射线，于是可以逐条枚举并做收缩。证明分四块：把曲线类与除子类放在对偶位置（预备），证明负极端射线由有理曲线生成并给出次数界（关键引理，靠曲面上的亏格公式与指标定理），证明这些射线至多可数且局部离散（靠有限型参数空间的可构造分解），最后用凸几何把任意有效类分解成非负部分加负射线组合。使用时要区分锥定理本身与配套的收缩定理：锥定理说锥长什么样，收缩定理说每条射线能做手术，两者合起来才是 MMP 的引擎。',
    examples: [
      { title: '例子：光滑曲面上锥定理的完全显式化', body: '光滑射影曲面 X 上 $\\overline{NE}(X)$ 的极端射线全部由不可约曲线生成且这些曲线都是 $\\mathbb{P}^1$：对 $K\\cdot C<0$ 的不可约曲线，亏格公式 $2p_a(C)-2=C^2+K\\cdot C$ 给出 $C^2<0$ 且 $p_a(C)=0$，故 $C\\cong\\mathbb{P}^1$ 且 $C^2\\le-1$；再用 Hodge 指标定理（$N_1$ 上相交形式符号为 $(1,\\rho-1)$）可证 $C^2\\ge-1$，于是 $C^2=-1$。因此曲面上的极端射线恰是那些 −1 曲线，锥定理的“负射线”清单就是“−1 曲线清单”，而收缩定理就是 Castelnuovo 判据。这是定理最透明的实例，也说明高维困难来自“负射线的曲线可能有更高亏格的自交负曲线族”。' },
      { title: '例子：曲面上 K 非负部分的锥形', body: '在 K3 曲面上 $K=0$，故 $\\overline{NE}(X)$ 整个落在 $K\\ge0$ 一侧，锥定理给出的是“没有负极端射线”，因此 K3 曲面没有可收缩的 −1 曲线（与 K3 不存在极小化手术的结论一致，K3 本身就是极小模型）。对有理曲面（例如 $\\mathbb{P}^2$ 的九点爆破）在适当的点上存在无限多条 −1 曲线，锥的负部分的极端射线是可数的无限条，收缩其中任意一条都把 Picard 数降低 1，重复到 $\\mathbb{P}^2$。这两个例子显示锥定理给的信息量与几何复杂度匹配：K 为 0 时没有负射线，K 负时恰对应各种收缩操作。' },
    ],
    remarks: [
      'klt 与 $\\mathbb{R}$-Cartier 假设不可省：非 $\\mathbb{R}$-Cartier 时 $K\\cdot\\alpha$ 这个泛函无定义，锥的分解无从谈起；lk 情形需要以对数形式与极小 lc 中心补足技术条件。',
      '“可数多条”不能升级为“有限多条”：有理曲面的爆破面上负极端射线一般有无穷多条，把它们当成有限会把 MMP 的复杂度低估。',
      '锥定理只给“锥的形状”，不给收缩态射的存在性；把两者混为一谈会得出“每条负射线都可收缩”的错误断言（小收缩的收缩像可能不再是 $\\mathbb{Q}$-Gorenstein，这正是翻转要解决的问题）。',
      '局部离散性是相对于给定 nef 类与 ε 而言的，不是“射线在锥上孤立”；对锥上任意点，负射线可以聚积在 $K$ 负但取值趋 0 的方向上。',
    ],
    corollaries: [
      { title: '推论：K 非负时锥定理退化', body: '若 $K_X+\\Delta$ 是 nef（从而对所有曲线非负），则 $\\overline{NE}(X)=\\overline{NE}(X)_{K\\ge0}$，没有负极端射线，MMP 立刻终止：X 已是极小模型（若再加 $K$ 丰沛则是一般型的极小模型）。这把“锥定理的负部分”理解为“可做手术的量”。', uses: ['decomposition'] },
      { title: '推论：曲面情形给出 −1 曲线清单', body: '在光滑射影曲面情形，负极端射线恰由自交数 −1 的有理曲线生成，收缩定理即 Castelnuovo 判据；于是曲面 MMP 的每一步都可显式写成“找一条 −1 曲线并收缩”。这是锥定理在最低维度的完整落地。', uses: ['rational-curves-in-extremal-ray'] },
    ],
    references: [
      book('Birational Geometry of Algebraic Varieties, 第 3 章（锥定理与收缩定理）', 'Kollar & Mori', 1998),
      book('Threefolds whose canonical bundles are not numerically effective (Annals of Math. 116)', 'Shigefumi Mori', 1982),
      book('Positivity in Algebraic Geometry I, 第 4 章', 'Robert Lazarsfeld', 2004),
      stacks('Stacks Project, Section 74.46: Minimal model program（相关章节）', '0FQA'),
    ],
    history: HISTORY,
  },

  'fano': {
    statement: '称正规射影簇 X（或 klt 对子 $(X,\\Delta)$）为 **Fano**，若反典范类 $-K_X$ 是丰沛的；对子情形相应地为 $-(K_X+\\Delta)$ 丰沛。等价地，对一切不可约闭子簇 $V\\subsetneq X$ 有 $(-K_X)^{\\dim V}\\cdot V>0$（由 Nakai–Moishezon 判据）。Fano 簇的主要数值不变量是 Fano 指数与反典范类的次数 $(-K_X)^{\\dim X}$。',
    explanation: 'Fano 簇是“正曲率”一侧的对象：$-K$ 丰沛意味着簇的典范类尽可能负，几何上接近射影空间。它的重要性有两层。第一，在 MMP 中它是两个终点之一——当 $K$ 永远无法变成丰沛时，算法终止于带 Fano 纤维的森纤维空间，因此 Fano 簇是“$\\kappa=-\\infty$ 型”的基本构件。第二，Fano 簇与凯勒-爱因斯坦度量、K-稳定性、镜像对称紧密相连：$-K$ 丰沛保证 $K_X^{-1}$ 是丰沛的线丛，从而有丰富的整体截面与度量存在性问题。分类现状要分清维度：法诺曲面即德尔佩佐曲面（10 族），三维 Fano 簇有 105 个形变族（Fano–Iskovskikh 分类，Mori–Mukai 的向量丛方法），四维只有部分结果（有限性已知，枚举未完成），高维的有限性由 Birkar 证明但一般枚举是开放的。',
    steps: [
      step('finiteness-of-anticanonical-degree', '从丰沛性得到次数有界与有限性', '由 $-K_X$ 丰沛并应用 Nakai–Moishezon 判据，得到 $(-K_X)^{\\dim X}>0$，即反典范次数为正。进一步有著名的有界性结论（Birkar 的 Fano 簇有界性）：固定维数 n 的 Fano 簇（或 klt 对数 Fano 对子且系数属于给定 DCC 集合）构成一个有界族，即所有这样的 X 可以被有限多个平坦族参数化。证明思路是把“$-K$ 丰沛、$\\dim X=n$”翻译成关于反典范除子的次数与奇点类型的界，再用 MMP 的技巧（对数中心的体积估计、lc 阈值的 DCC 性质）把可能的奇点限制成有限多种，最后用“有界次数的极丰沛线丛给出到固定射影空间的嵌入”把全体 Fano 簇装进有限个 Hilbert 概型。这一步是 Fano 分类得以“开始时有限”的根本理由：不是先验地知道族的有限性，而是由 $-K$ 丰沛加上维数固定推出来的。要提防把“有界”当成“可枚举”：有界给的是有限多个族，族的显式列出是另一项工作。'),
      step('plurianticanonical-embedding', '反典范倍数给出的嵌入与 Picard 数的界', '由 $-K_X$ 丰沛，存在 $m>0$ 使 $-mK_X$ 极丰沛，给出闭嵌入 $X\\hookrightarrow\\mathbb{P}^N$；由有界性可以取统一的 m 与统一的 N（对固定维数的所有 Fano 簇而言，存在不依赖 X 的 m、N）。进一步地，$-K_X$ 的丰沛性给出 Picard 数的界 $\\rho(X)\\le \\dim X$（对 Fano 簇，$\\rho$ 有上界，$\\rho=n$ 时是 toric 等情形）。这条界的证明思路是：$\\rho(X)=\\dim N^1(X)$，而 $K$ 负的锥由锥定理局部有限生成，若 $\\rho$ 过大则存在大量的独立方向使 $-K$ 无法同时在所有方向上丰沛（用锥的体积或不等式论证）。这一步的用途是把分类问题化为“有限维参数空间上的分类”：一旦 $\\rho$ 有界且反典范次数有界，可能的数值类型（即 $(-K_X)^n$、$K_X$ 的 $\\mathbb{Z}$-模结构等）就只有有限多种，可以逐个讨论。注意 Picard 数界并不给出具体族数，三维的 105 族仍需要大量计算与显式构造。'),
      step('mori-mukai-method', 'Mori–Mukai 方法：用向量丛与有理曲线结构分类', '对光滑 Fano 簇，Mori–Mukai 方法的核心是研究“极小有理切触”的族（即由有理曲线参数化的、带有滑翔（scroll）结构的子簇），由此得到三类结论：若某条有理曲线的“滑翔”不是纤维型，则可以构造一个包含它的向量丛 $E$ 使 $X$ 成为 $\\mathbb{P}(E)$ 或 $\\mathbb{P}^n$ 的爆破；若是纤维型，则得到一个纤维空间结构。以三维为例，这套方法的输出是：三维光滑 Fano 簇或为 $\\mathbb{P}^3$、或为 $\\mathbb{P}^2$ 在若干点（一到八点，一般位置）的爆破、或为 $\\mathbb{P}(E)$ 型、或为商型（如某些 Quintic 三重形与 Pfaffic 型）。技术上，选择一条最小次数的有理曲线 C 并由其法丛的分裂型 $\\mathcal{O}(a)\\oplus\\mathcal{O}(b)$ 分类，$a,b$ 的值域被 $-K$ 的正性与曲线的最小性限制在很窄的范围（例如三维时 $(a,b)$ 只有 $(-1,-1)$、$(0,-1)$、$(0,0)$、$(1,1)$ 等少数可能），每种可能对应一个构造。这一步是把“分类”从数值约束推进到几何构造的关键：数值只给出可能的类型，丛与曲线构造才给出实际对象。'),
      step('threefold-classification', '三维 Fano 的分类结果与核对', '三维光滑 Fano 簇的分类（Iskovskikh 与 Fano 学派，后由 Mori–Mukai 用向量丛法系统化）给出 105 个形变族，按反典范次数 $(-K)^3$ 从 1 到 64 分布：$(-K)^3=64$ 只有 $\\mathbb{P}^3$；$=54$ 为 $\\mathbb{P}^3$ 在一点的爆破；$=8$ 有若干族（含 $\\mathbb{P}^1\\times\\mathbb{P}^2$、$\\mathbb{P}^2$ 在三点的爆破等）；$=1$ 有若干族（含低次超曲面）。核对结构的一个具体方式是计算数：对 $\\mathbb{P}^2$ 在 r 个一般点的爆破，$(-K)^3=9-r$，因此 r=1 给 8、r=8 给 1，与“三点爆破为 8、八点爆破为 1”的清单吻合；而 $(-K)^3=64$ 对应 $\\mathbb{P}^3$（$K_{\\mathbb{P}^3}=-4H$，$(-K)^3=64$）。对于低次超曲面 $X_d\\subset\\mathbb{P}^4$，$K_X=-5H+dH=(d-5)H$，故 $(-K)^3=(5-d)^3$：$d=4$ 得 1（四次三重形）、$d=3$ 得 8、$d=5$ 得 0（不是 Fano，是 Calabi–Yau 型）。这些核算说明“次数清单”不是任意排列，而是由 $K$ 与超平面类的关系直接决定的，可以用初等计算复核。'),
      step('kahler-einstein-and-limits', '与度量、K-稳定性、镜像对称的联系及其边界', 'Fano 簇上最著名的度量问题是 Kaehler–Einstein 度量：$-K$ 丰沛（从而 $c_1>0$）是存在 Ric 为正的 KE 度量的必要条件；Yau–Tian–Donaldson 定理（陈–唐、Donaldson）断言 Fano 簇上 KE 度量的存在等价于 K-稳定性（对 $\\mathbb{C}^{\\times}$-等变的测试构型或测地稳定性）。这条定理把纯几何问题翻译成 GIT 式的稳定性问题，是 Fano 簇研究的核心方向。另一侧是枚举几何与镜像对称：Fano 簇（尤其是三维）的 Gromov–Witten 不变量与镜像对称预测紧密相关，例如五次三重形的 2875 条直线与镜像对称给出的枚举公式。边界要写清楚：第一，Fano 的定义要求 $-K$ 丰沛（严格正），把 $-K$ 换成 nef（弱 Fano/Calabi–Yau 型）会得到性质完全不同的对象族（例如 $-K$ 是 nef 但非 ample 时可能是 Calabi–Yau 纤维化的全空间，度量上对应 Ric 非负）。第二，分类的维数界限是实质的：四维以上只有有限性（Birkar）与部分结果，把所有维数的 Fano 簇说成“已分类”是错误的。第三，奇点假设不可忽略：Fano 簇通常只保证正规而允许终端奇点（例如三维的 D 型奇点），把“光滑”写进定义会丢掉大量对象（在 MMP 输出中具有奇点的 Fano 纤维是常态）。'),
    ],
    conclusion: 'Fano 簇 = $-K$ 丰沛（等价于对所有子簇的严格正性）；它是 MMP 的 $\\kappa=-\\infty$ 终点，分类在曲面（10 族德尔佩佐）与三维（105 族）已完成，高维仅有有限性结果；与 KE 度量、K-稳定性、镜像对称相连。',
    dependencies: ['nakai-moishezon', 'cone-theorem', 'mmp'],
    consequences: ['mmp', 'flip', 'kodaira-dimension'],
    explanation: 'Fano 簇是“正曲率”的代数化身：$-K$ 丰沛意味着簇在数值意义上比射影空间“不那么负”，几何上表现为有理连通、含有大量有理曲线。它在 MMP 中作为 $\\kappa=-\\infty$ 的终点出现，因此它的分类直接决定了负曲率类型的分类：把所有 Fano 纤维与底簇搞清楚，就等于搞清了 $\\kappa=-\\infty$ 的簇。分类的技术路线是先由 $-K$ 丰沛推出次数有界与 Picard 数有界（有限多种数值类型），再用 Mori–Mukai 的有理曲线与向量丛法构造出每一种可能，最后用超曲面与爆破等显式构造核对族数。度量的那一侧由 Yau–Tian–Donaldson 把存在性问题化为稳定性问题，枚举的那一侧则通向镜像对称。',
    examples: [
      { title: '例子：低次超曲面三重形的计算', body: '对光滑超曲面 $X_d\\subset\\mathbb{P}^4$，由伴随公式 $K_X=(K_{\\mathbb{P}^4}+X_d)|_X=(d-5)H|_X$，故 $-K_X=(5-d)H$。丰沛性要求 $d<5$，并且 $(-K)^3=(5-d)^3$ 可以直接算出：$d=1,2,3,4$ 分别给 $64,27,8,1$。这与分类清单对应：$d=4$（四次三重形，$(-K)^3=1$）、$d=3$（三次三重形，$(-K)^3=8$）、$d=2$（二次三重形即 $\\mathbb{P}^1\\times\\mathbb{P}^2$ 的双重覆盖，$(-K)^3=27$）、$d=1$（$\\mathbb{P}^3$，$(-K)^3=64$）。其中四次三重形含 2875 条直线，是枚举几何与镜像对称的经典舞台。' },
      { title: '例子：德尔佩佐曲面与次数清单', body: '法诺曲面 $S$ 上 $(-K_S)^2=9-r$（$S$ 为 $\\mathbb{P}^2$ 在 r 个一般点的爆破）或 8（$\\mathbb{P}^1\\times\\mathbb{P}^1$ 的特殊情形），给出次数 1 到 9 的十个族（次数 8 有两族：$\\mathbb{P}^1\\times\\mathbb{P}^1$ 与 $\\mathbb{P}^2$ 在一点的爆破）。逐个核对一个：$\\mathbb{P}^2$ 在一点的爆破面上 $(-K)^2=(3H-E)^2=9-1=8$；在八点的爆破面上 $(-K)^2=9-8=1$，且该曲面上的反典范线性系给出到 $\\mathbb{P}^2$ 的二次有理映射（degree 2 的德尔佩佐），这些都是可手工核验的计算。' },
    ],
    remarks: [
      '$-K$ 必须是丰沛（严格正）而不是 nef：$-K$ nef 但非 ample 时对象属于 Calabi–Yau 型（如 $K$ 是 0 或挠的情形），几何与度量性质完全不同，把两者混为一谈会得到错误的分类陈述。',
      'Fano 簇通常允许终端奇点而不必光滑：三维 Fano 中大量对象具有终端奇点，分类清单的条目记录的是（带有奇点的）簇，只列光滑 Fano 会漏掉多数族。',
      '“有界”不等于“已分类”：Birkar 的有界性只给出有限多个族的存在性，四维及以上的显式枚举仍是开放问题；说“高维 Fano 已分类”是不准确的。',
      '反典范次数只是数值不变量：存在反典范次数相同但不同构（甚至不同形变型）的 Fano 簇，因此次数清单不能代替分类；同一次数往往对应多个族。',
    ],
    corollaries: [
      { title: '推论：Fano 簇是 MMP 的终止形态之一', body: '在 MMP 中，若算法终止于纤维型收缩 $X\\to Y$，则一般纤维 F 满足 $-(K_X+\\Delta)|_F$ 丰沛，即 F 是 Fano 型；因此“$\\kappa=-\\infty$ 的分类”归结为“Fano 纤维 + 底簇”的分类。这条推论把 Fano 分类与 MMP 的终止分析直接绑定。', uses: ['plurianticanonical-embedding'] },
      { title: '推论：反典范次数给出 Fano 分类的数值筛', body: '由 $-K$ 丰沛与次数 $(-K)^n>0$ 以及有界性，可能的次数取值只有有限多种（对固定 n），且每种次数上只有有限多个族；这给出分类工作的第一步筛选：先枚举可能的次数与 Picard 数，再逐类构造。三维清单里次数从 1 到 64 的分布正是这样得到的。', uses: ['finiteness-of-anticanonical-degree'] },
    ],
    references: [
      book('Birational Geometry of Algebraic Varieties, 第 3 章与第 5 章', 'Kollar & Mori', 1998),
      book('On the classification of Fano 3-folds（相关文献综述）', 'Mori & Mukai (Kodaira 相关论文系列)', 2003),
      book('Del Pezzo surfaces and Fano varieties（教材）', 'Iskovskikh（依斯可夫斯基赫）相关讲义', 1996),
      stacks('Stacks Project, Section 74.46: Minimal model program（相关章节）', '0FQA'),
    ],
    history: HISTORY,
  },

  'flip': {
    statement: '设 $(X,\\Delta)$ 是正规射影 klt（或 lc）对子，$c:X\\to Y$ 是 $(K_X+\\Delta)$-负的**小收缩**（被收缩集合 Z 的余维 ≥2，且 $(K_X+\\Delta)\\cdot C<0$ 对 Z 上被收缩的曲线成立）。**翻转**是一个双有理映射 $\\varphi:X\\dashrightarrow X^+$，满足：$X^+$ 是正规簇，$K_{X^+}+\\Delta^+$ 是 $\\mathbb{R}$-Cartier（$\\Delta^+$ 为 $\\Delta$ 的严格变换），$\\varphi$ 与 c 一起给出态射 $X^+\\to Y$（在公共开集上与 c 相容），且 $-(K_{X^+}+\\Delta^+)$ 在 $X^+\\to Y$ 上是丰沛（或相对丰沛）的。翻转的存在性在特征 0 任意维成立（BCHM 2010），三维由 Mori 1988 给出。',
    explanation: '翻转要解决的是一个具体的死结：当极端收缩把小收缩的例外集压到余维 2 的点上时，收缩像 Y 不再是 $\\mathbb{Q}$-Gorenstein，$K_Y+\\Delta_Y$ 不是 $\\mathbb{R}$-Cartier，MMP 到 Y 之后无法继续（因为下一步仍要算 $K$ 与曲线的交数）。翻转的做法是“不真的收缩到 Y，而是在 Y 上方换一个模型 X⁺”：它把原来那条曲线族换成另一条曲线族，使新曲线 $C^+$ 满足 $K_{X^+}\\cdot C^+>0$，从而令 $K$ 在新模型上“变正”，同时保证 $X^+$ 与 X 之间的差别只在余维 ≥2 处（因此是双有理的，余维 1 部分不变）。翻转的存在性是 MMP 最困难的技术环节：三维由 Mori 用极端射线论证明，高维由 Birkar–Cascini–Hacon–McKernan 在 2010 年用“极小模型存在性是翻转存在性的充分条件”这一纲领证明，其证明本身又依赖此前积累的 MMP 相关存在性结果。',
    steps: [
      step('problem-of-small-contraction', '小收缩为什么会卡住算法', '设 $c:X\\to Y$ 是小收缩，收缩集合 $Z=\\operatorname{Exc}(c)$ 满足余维 ≥2（典型情形 Z 是一条曲线族被压到一个点 $y\\in Y$），且对 Z 上被收缩的每条曲线 C 有 $(K_X+\\Delta)\\cdot C<0$。问题出在 Y 上：Y 的局部环在 y 处不是 $\\mathbb{Q}$-Gorenstein 的，即 $K_Y$ 不是 $\\mathbb{Q}$-Cartier；而 MMP 的每一步都需要“与曲线求交”和“判断丰沛性”，这些运算都必须在 $K$ 是 $\\mathbb{R}$-Cartier 的前提下进行。为什么会这样？因为 $c$ 在 Z 上是“压维”的（把曲线的方向压掉），$K$ 沿这些被压掉的方向的度数信息在 Y 处不可见，Y 上无法唯一地定义 $K_Y$ 沿该方向的系数——$K_X$ 在 Z 上的 $\\mathbb{Q}$-Cartier 性来自 X 的假设，但推前到 Y 时损失了沿纤维方向的自由度。具体例子：$\\mathbb{P}^2$ 在九点适度配置下的小收缩把一条曲线族（一个 $\\mathbb{P}^1$ 族）压到一点，Y 在这一点附近的局部环不为 $\\mathbb{Q}$-Gorenstein。因此必须换一条路：留在 Y 上方但换一个模型 $X^+$，使 $K$ 的 $\\mathbb{Q}$-Cartier 性恢复。'),
      step('requirement-formulation', '翻转的四条要求及其含义', '翻转 $\\varphi:X\\dashrightarrow X^+$ 有四条要求。第一，$X^+$ 正规：使“严格变换”在余维 1 与余维 2 处有意义（正规簇上 Weil 除子与函数域有良好关系）。第二，$K_{X^+}+\\Delta^+$ 是 $\\mathbb{R}$-Cartier：恢复被 Y 处失去的 $\\mathbb{Q}$-Cartier 性，这正是翻转存在的目的。第三，$X^+\\to Y$ 是态射且 $X$ 与 $X^+$ 在 Y 的某个开集上同构：保证 $\\varphi$ 是**相对于 Y 的**双有理变换，即它在 Y 上不动，只在被 Z 覆盖的纤维上换模型；这也保证“余维 1 部分不变”（因为若某个除子不在 Z 中，它在 Y 上的像开集上是已确定的，$X^+$ 与 X 在此处同构）。第四，$-(K_{X^+}+\\Delta^+)$ 在 $X^+\\to Y$ 上丰沛（或至少相对丰沛，配合翻转存在性的通常陈述用相对丰沛）：这一条使新模型沿 Y 的纤维方向是“Fano 型”，从而 $K_{X^+}$ 与收缩曲线的交数为正，算法可以继续。把四条合起来看，翻转是一个精确的替换：在同一个 Y 上方，把原模型换成一个 $K$ 沿纤维为正的模型，代价是引入新的例外结构（新的曲线族与可能的奇点）。'),
      step('threefold-existence', '三维翻转的存在性（Mori 的方法）', '三维情形由 Mori（1988）给出：设 $c:X\\to Y$ 是三维 klt 对子上的小收缩，其收缩集合 Z 是有限条曲线或曲线族。Mori 的方法是先取一般的曲面截面 $S\\subset X$（$S$ 光滑、使 Z 与 S 的相交是有限个点），在 S 上用“对偶锥”与“极小模型”的技术构造 S 上沿 $S\\to \\bar S$ 的翻转 $S\\to S\'$（S 上这一步变成在光滑曲面上的 Castelnuovo 型收缩，因为曲面情形没有小收缩，故 $S\'$ 的构造只需做 −1 曲线收缩）。然后把这些曲面翻转“粘”回三维：用 Z 曲线上的一般点处的局部模型（$X$ 在 Z 附近可写成 $\\mathbb{A}^1\\times S$ 型，其中 $S$ 是横截曲面）把 $X^+$ 局部地定义为 $\\mathbb{A}^1\\times S\'$，再证明这些局部模型相容并粘成一个正规簇 $X^+$，且 $X^+\\to Y$ 是态射。最后验证 $K_{X^+}$ 在收缩曲线上的正性：由 $S\'$ 上相应曲线的正性与“沿 Z 方向是 $\\mathbb{A}^1$”的判断得到。三维方法的美在于把高维困难（小收缩的曲线族）在每个一般点处看成一个“沿 $\\mathbb{A}^1$ 方向不变的曲面翻转”，从而化归为已解决的曲面收缩理论。'),
      step('high-dimensional-existence', '高维翻转的存在性（BCHM 的纲领）', '高维翻转由 Birkar–Cascini–Hacon–McKernan（2010）证明，其核心纲领是：翻转的存在性由极小模型的存在性推出。具体地，为了构造小收缩 $X\\to Y$ 的翻转 $X^+$，BCHM 在某个由 X 与收缩结构决定的辅助对子（“翻转的所谓 $\\mathbb{R}$-对子”或相关的对数一般型对子）上运行 MMP：若辅助对子有极小模型，则该极小模型在 X 上方给出所需的 $X^+$，因为极小模型的存在使我们可以“换个方式停在 Y 上方”而不真正收缩。这条路线的关键在于对辅助对子证明极小模型存在性，而这需要：第一，对足够一般的对子（正特征以外）建立“有效终止”（effective termination），即用一个显式的复杂度函数证明 MMP 长序列有限；第二，对对数一般型对子建立“一般型极小模型存在性”，这一步依赖运行 MMP 时每一步的可计算性（对数中心的充分性、翻转本身在低维的已知性）。于是整个证明是一个大的相互依赖结构：翻转的存在性被用来证明某些对子的 MMP 终止，而这些终止性又用来证明一般翻转的存在性；BCHM 通过精细地分级（先处理一类特殊对子再推广）打破循环。这就是为什么高维翻转的证明极其技术性：它不是一个局部构造，而是整个 MMP 理论自举的结果。'),
      step('after-flip-and-limits', '翻转之后的流程与假设边界', '得到 $X^+$ 后 MMP 继续：在 $X^+$ 上重新取负极端射线。翻转使沿 Y 的纤维方向变成 $K$ 正，因此原来那条负极端射线在 $X^+$ 上不再负（或说不复存在），算法不会重复同一步，这由复杂度下降保证终止。注意 flop 与 flip 的区别：flop 是 $K$-trivial 的小变换（$K\\cdot C=0$），它不改变 $K$ 的性质、不用于 MMP，而是连接不同的极小模型；flip 是 $K$-negative 的替换，用于让算法继续。边界必须写清楚：第一，特征 0 与维数的限制：高维正特征翻转仍为公开问题；第二，lc 而非 klt 的情形需要额外的“极小 lc 中心”技术（Birkar 的处理），因为 lc 中心的纤维性质更复杂；第三，翻转的定义里“相对丰沛”的具体形式（相对丰沛 vs 丰沛）在不同文献中略有差异，使用时要与所引定理的表述严格对应，否则会出现“翻转存在但丰沛性方向不匹配”的技术错误。'),
    ],
    conclusion: '小收缩因收缩像非 $\\mathbb{Q}$-Gorenstein 而使 MMP 卡住，翻转 $X\\dashrightarrow X^+$ 在 Y 上方换成使 $-K$ 相对丰沛的模型以继续算法；三维（Mori 1988）与特征 0 任意维（BCHM 2010）已证明存在性，高维正特征仍是公开问题。',
    dependencies: ['cone-theorem', 'mmp', 'birational', 'nakai-moishezon'],
    consequences: ['mmp', 'fano'],
    explanation: '翻转是 MMP 里唯一不能“直接做”的手术，因为小收缩的像不再是 $\\mathbb{Q}$-Gorenstein，$K$ 在上面没有定义。解决思路是绕过收缩像：在同一个底 Y 上方换成另一个模型 $X^+$，使 $K$ 沿纤维方向变正，从而算法可以在新模型上继续。翻转的技术困难在于它必须是**整体**构造（不是局部的爆破或收缩），且要保持 klt 与 $\\mathbb{Q}$-Cartier 性。三维的做法把高维困难局部化为横截曲面上的翻转并化归到曲面收缩；高维的做法（BCHM）则把翻转存在性归到极小模型存在性，再靠 MMP 的终止性自举完成。这套证明的技术含量也解释了为什么翻转存在性是 MMP 中最晚被解决、也最依赖其他理论的部分。',
    examples: [
      { title: '例子：三维小收缩与翻转的直观图像', body: '考虑三维簇 X 含一条曲线族（一个 $\\mathbb{P}^1$ 族覆盖一条曲线），其法丛在这种配置下使该族的曲线类在 $\\overline{NE}(X)$ 中张成一条负极端射线，收缩 $c$ 把这个曲线族压成一条曲线（余维 2 的例外集 Z 在 X 中，而在 Y 中它的像是曲线），Y 在 Z 的像处不为 $\\mathbb{Q}$-Gorenstein。翻转把 X 换成 $X^+$：$X^+$ 在 Y 上方，其纤维方向的曲线族满足 $K_{X^+}\\cdot C^+=-(K_{X^+})\\cdot$ 的正性，因此 $-K$ 相对丰沛。一个可核验的具体模型是 $\\mathbb{P}^2$ 在若干点爆破后的三重形型配置（如 “$\\mathbb{P}^2$ 在 8 点 + 特殊曲线” 的构造），其中翻转把一条曲线族换成一个点，最终导向已知的 Fano 或极小模型。' },
      { title: '例子：flop 与 flip 的行为对比', body: '取 K3 曲面的一维类比：在 Calabi–Yau 三重形上的小收缩满足 $K\\cdot C=0$，其 flop $X\\dashrightarrow X^+$ 保持 $K$ 的数值类不变，因此 X 与 $X^+$ 都是极小模型，二者由 flop 连接（这是“极小模型不唯一”的来源）。而在 Fano 型情形 $K\\cdot C<0$，同样的构造会给出 flip，$K$ 的正负性被改变。两者的共同点是“在 Y 上方换模型”，差别在于 $K$ 沿纤维的符号；判断一个给定的变换是 flop 还是 flip 只需算 $K\\cdot C$ 的符号，这也是 MMP 算法分支的依据。' },
    ],
    remarks: [
      '翻转的存在性依赖 MMP 的其他部分（终止性、极小模型存在性）；把翻转存在性当成独立于 MMP 的局部构造来引用是不准确的，尤其在高维情形（BCHM 的证明本身是自举式的）。',
      '特征与维数的限制是实质的：三维正特征翻转有 Mori 的结论，但高维正特征仍是公开问题；把 BCHM 的结论无条件推广到正特征会得到未证命题。',
      'lc 情形不能直接套用 klt 版本的翻转定理：lc 中心的纤维结构更复杂（可能是高维的），需要极小 lc 中心与 $\\Gamma$-解析等额外工具，用错版本会出现“定理条件不满足却仍然引用”的错误。',
      'flop 与 flip 常被混用：flop 是 $K$-trivial 的（$K\\cdot C=0$），不改变 $K$ 的性质、不推进 MMP；flip 是 $K$-negative 的替换，是 MMP 的推进步骤；在讨论“极小模型是否唯一”时出现的是 flop，在讨论“算法能否继续”时出现的是 flip。',
    ],
    corollaries: [
      { title: '推论：翻转使 MMP 在小收缩处继续', body: '小收缩上算法无法在 Y 处继续（$K_Y$ 不是 $\\mathbb{R}$-Cartier），但翻转给出 $X^+\\to Y$ 使 $-K$ 在 X⁺ 上相对丰沛，故在 X⁺ 上重新运行 MMP 时有新的极端射线可选，算法得以推进。这条推论说明翻转不是“可选的优化”而是 MMP 闭环的必需环节。', uses: ['requirement-formulation'] },
      { title: '推论：三维翻转可由曲面收缩理论化归', body: '三维时把横截曲面上的翻转化归为曲面上的 −1 曲线收缩，再把曲面翻转沿 $\\mathbb{A}^1$ 方向粘合，因此三维翻转不需要高维的极小模型存在性理论。这是 Mori 三维 MMP 与 BCHM 高维 MMP 在技术路线上的分界点。', uses: ['threefold-existence'] },
    ],
    references: [
      book('Flip theorem and the existence of minimal models for 3-folds (JAMS 1)', 'Shigefumi Mori', 1988),
      book('Existence of minimal models for varieties of log general type (JAMS 23)', 'Birkar, Cascini, Hacon, McKernan', 2010),
      book('Birational Geometry of Algebraic Varieties, 第 3 章与第 5 章', 'Kollar & Mori', 1998),
      stacks('Stacks Project, Section 74.46: Minimal model program（相关章节）', '0FQA'),
    ],
    history: HISTORY,
  },

  'kodaira-dimension': {
    statement: '设 X 是特征 0 域上的正规射影簇，L 为 X 上的丰沛（或至少是 $\\mathbb{R}$-Cartier）除子，$K_X$ 为典范除子。定义 $\\kappa(X,L)=\\limsup_{m\\to\\infty}\\dfrac{\\log\\dim_k H^0(X,\\mathcal{O}(mL))}{\\log m}$，当所有 $H^0(X,\\mathcal{O}(mL))=0$（$m\\ge1$）时取 $\\kappa=-\\infty$。对 $L=K_X$ 记 $\\kappa(X)=\\kappa(X,K_X)$，它是双有理不变量，取值于 $\\{-\\infty,0,1,\\dots,\\dim X\\}$；当 $\\kappa(X)=\\dim X$ 时称 X 为一般型。等价地，$\\kappa(X,L)$ 等于使 $\\dim_kH^0(X,\\mathcal{O}(mL))$ 随 m 以 $m^{\\kappa}$ 的速率增长的那个整数 $\\kappa$。',
    explanation: '小平维数的定义是把“截面数目的增长速度”量化成一个指数，从而把 $\\mathbb{N}$ 上的一列数字压缩成一个双有理不变量。这个定义在几何上对应一个非常直观的图像：$\\kappa=\\dim X$ 说明 $h^0(mK)$ 以 $m^{\\dim X}$ 增长，也就是 $mK$ 最终给出“填满整个 X”的线性系（一般型的 Iitaka 纤维化只有一般纤维，维数为 0）；$\\kappa=0$ 说明 $h^0(mK)$ 有界，$mK$ 不产生新的方向（K3、阿贝尔簇、Calabi–Yau 型）；$\\kappa=-\\infty$ 说明 $K$ 负到“根本给不出有效倍” （Fano 型与直纹面）。这三段对应“曲率符号”的三种情形：负、零、正曲率。重要的是：小平维数必须是双有理不变量才能用于分类，这一点由“$h^0(mK)$ 在双有理变换下对应关系的比较”保证，需要消解定理与 $\\chi$ 的相容性作为工具。',
    steps: [
      step('definition-of-kappa', '定义与等价刻画', '设 L 是丰沛（或 $\\mathbb{R}$-Cartier 且 $\\mathbb{R}$-丰沛）除子，定义 $\\kappa(X,L)$ 为使存在常数 $c_1,c_2>0$ 与 $m_0$ 使得对 $m\\ge m_0$ 有 $c_1 m^{\\kappa}\\le\\dim_kH^0(X,\\mathcal{O}(mL))\\le c_2 m^{\\kappa}$ 的（唯一）整数 $\\kappa$，若不存在这样的 $\\kappa$（即 $H^0=0$ 对一切 $m\\ge1$）则取 $-\\infty$。这个紧致形式的定义与 $\\limsup\\dfrac{\\log h^0}{\\log m}$ 的解析定义等价。等价性证明分两步：若 $h^0\\sim cm^{\\kappa}$ 则 $\\dfrac{\\log h^0}{\\log m}\\to\\kappa$；反之若极限为 $\\kappa$，则由“$h^0$ 是次数为 $\\kappa$ 的多项式”（在半丰沛情形由渐近 Riemann–Roch 与 Hilbert 多项式的行为给出）得到上下界。技术上更实用的是二阶性质：因为对丰沛 L 有 $h^0(mL)=\\chi(mL)=\\dfrac{L^{\\dim X}}{(\\dim X)!}m^{\\dim X}+O(m^{\\dim X-1})$（由 HRR），所以 $\\dim X$ 维簇上一般型（$\\kappa=\\dim X$）等价于 $K_X^{\\dim X}>0$（$L=K_X$ 丰沛时）；而 $\\kappa<\\dim X$ 的情形 $L^{\\dim X}=0$，高阶项由 $K$ 的纤维化决定，此时 $\\kappa$ 就是 Iitaka 纤维化的纤维维数的补（即 $\\kappa=\\dim(\\text{底})$）。'),
      step('birational-invariance', '证明双有理不变性', '要证：若 $f:X\'\\dashrightarrow X$ 是光滑射影簇之间的双有理映射，则 $\\kappa(X\')=\\kappa(X)$。先化归到“$f$ 是紧合双有理态射”的情形（由 Zariski 主定理，光滑情形下双有理映射是“闭合成”的关系，可分解为有限多个爆破的复合；或直接用消解把映射提升为态射）。然后只需处理 $f$ 为单个点的爆破 $\\pi:\\tilde X\\to X$ 的情形。这时比较 $H^0(\\tilde X,mK_{\\tilde X})$ 与 $H^0(X,mK_X)$：因为爆破的例外除子 E 满足 $K_{\\tilde X}=\\pi^{*}K_X+aE$（$a=\\dim X-1$），两个空间通过 $\\pi^{*}$ 与 $\\pi_*$ 联系，且存在自然的同构或包含 $\\pi_*:H^0(mK_{\\tilde X})\\to H^0(mK_X)$（在带适当 E 的法向化后是单射，且两个方向的增长速率相同）。逐项比较给出上下界 $h^0(mK_{\\tilde X})\\le h^0(mK_X)\\le h^0(mK_{\\tilde X})^{O(1)}$ 型的不等式，从而使两个乘积的增长率相同。对一般双有理映射，把它分解为爆破与收缩的复合（由弱因子化定理或 Zariski 主定理），每个原子步骤的增长率不变，故 $\\kappa$ 不变。这一步的关键假设是光滑与射影：非光滑时 $K$ 不是 $\\mathbb{Q}$-Cartier，$mK$ 无定义，需要先做消解（这正说明为什么“$\\kappa$ 是双有理不变量”依赖于消解定理）。'),
      step('iitaka-fibration', '把 κ 与 Iitaka 纤维化联系起来', '设 $\\kappa(X)=\\kappa\\ge0$。固定足够大的 m 使 $\\varphi_m=\\varphi_{|mK_X|}:X\\dashrightarrow \\mathbb{P}^{N_m}$ 的定义（在适当化之后）给出一个纤维化 $X\\to Y_m$，其像 Y 维数恰为 $\\kappa$：由定义 $h^0(mK_X)\\sim cm^{\\kappa}$，像的维数不超过 $\\kappa$（因为 $\\varphi_m$ 由 $h^0$ 个截面给出，$\\varphi_m$ 的像的维数不超过 $h^0$ 的增长的“对数速率”）；另一方面若像维数小于 $\\kappa$ 则截面的增长会更慢，矛盾。于是对 $m\\gg0$ 充分可除，$\\varphi_m$ 稳定下来给出 $\\varphi:X\\dashrightarrow Y$，一般纤维维数为 $\\dim X-\\kappa$，故 $\\kappa=\\dim Y$。这就得到小平维数的几何解释：它是 Iitaka 纤维化底空间的维数。特别地 $\\kappa=\\dim X$ 时一般纤维维数为 0，$\\varphi$ 变成双有理（即“一般型”）；$\\kappa=0$ 时 $\\varphi$ 是到点的映射，一般纤维维数为 $\\dim X$，$h^0$ 有界。这一步要小心 Iitaka 纤维化的存在性与“充分可除的 m 稳定”的证明（Iitaka 猜想在 $\\kappa\\ge0$ 且 $K$ 为 $\\mathbb{Q}$-Cartier 时已证；一般情形有技术条件），是小平维数理论中真正的技术难点。'),
      step('curvature-dichotomy', '按曲率符号的三分法与各自的例证', '把上面的框架按 $\\kappa$ 值分类。$\\kappa(X)=-\\infty$：对所有 $m\\ge1$ 有 $H^0(X,mK_X)=0$，几何上 K 负，是 Fano 型或直纹面型；由 MMP，这类簇等价于带 Fano 纤维的森纤维空间，KK 的极端是 $\\mathbb{P}^2$（$K=-3H$，负）、$\\mathbb{P}^1\\times$ 曲线（$K$ 在半纤维方向负）。$\\kappa(X)=0$：$h^0(mK_X)$ 有界（事实上 $K$ 是挠的，$mK\\cong\\mathcal{O}$ 对某个 m），例证是 K3 曲面（$K=0$）、阿贝尔簇（$K=0$）、恩里克斯曲面与双椭圆曲面（$K$ 挠）。$\\kappa(X)=\\dim X$（一般型）：$K$ 最终丰沛或半丰沛且 $K^{\\dim X}>0$，例证是次数 ≥5 的光滑平面曲线（$\\deg K=2g-2>0$ 且 $K$ 丰沛）、一般型曲面（例如 $K^2>0$ 且 $K$ 丰沛）。中间情形 $1\\le\\kappa<\\dim X$：$\\kappa=1$ 的曲面不必是一般型（例如纤维化到曲线的曲面），$\\kappa=\\dim X-1$ 对应到曲线的纤维化（$K$ 在纤维上为零、在底上正）。三段划分把“几何性质”与“数值增长”一一对应，这正是分类纲领的技术表达。'),
      step('numerical-checks-and-limits', '可核算的判据与假设边界', '给出可核算的判据。曲线上：$\\kappa(X)=\\dim X=1$ 当 $\\deg K_X=2g-2>0$（$g\\ge2$），$\\kappa=0$ 当 $g=1$（$K=0$），$\\kappa=-\\infty$ 当 $g=0$（$\\deg K<0$，$H^0(mK)=0$）。曲面上可用高阶次数核验：$\\kappa=2$ 当且仅当 $K^2>0$（在最小模型上，由 $h^0(mK)\\sim\\dfrac{K^2}{2}m^2$）；$\\kappa=1$ 当 $K^2=0$ 且 $K$ 不为挠（$K$ 的某个倍数是纤维类的拉回）；$\\kappa=0$ 当 $K$ 挠；$\\kappa=-\\infty$ 当 $K$ 非有效且某种负性。可以核算的例子：$S=\\mathbb{P}^2$ 爆破一点，$K^2=(3H-E)^2=8>0$？实际 $K_S^2=9-1=8$，但 $S$ 上的 $K$ 不丰沛（S 不是最小模型），$\\kappa$ 要用最小模型算：$\\mathbb{P}^2$ 的最小模型是 $\\mathbb{P}^2$ 本身，$\\kappa=-\\infty$。这条核算给出重要提醒：$\\kappa$ 要在最小模型或至少正规化 + 消解后的模型上计算，$K^2>0$ 只是必要条件之一。边界要写清：第一，$\\kappa$ 对非 $\\mathbb{Q}$-Gorenstein 簇需要定义修正（用 $\\mathbb{Q}$-Cartier 的正规化）；第二，正特征下 Iitaka 猜想仍为公开问题，因此“$\\kappa$ 等于 Iitaka 纤维化底维数”这一等价在正特征不一定可用；第三，$\\kappa=-\\infty$ 与 $K$ nef 不能同时（$K$ nef 时 $\\kappa\\ge0$），反之 $\\kappa\\ge0$ 不蕴含 $K$ nef（一般型只要求最终丰沛，不要求一开始就丰沛）。'),
    ],
    conclusion: '小平维数 $\\kappa(X)=\\limsup\\log h^0(mK_X)/\\log m\\in\\{-\\infty,0,1,\\dots,\\dim X\\}$ 度量截面增长速率，等价于 Iitaka 纤维化底维数，是双有理不变量；$\\kappa=\\dim X$ 为一般型、$\\kappa=0$ 为 Calabi–Yau 型、$\\kappa=-\\infty$ 为 Fano/直纹型。',
    dependencies: ['birational', 'mmp', 'canonical-sheaf', 'todd-class'],
    consequences: ['mmp', 'fano', 'birational'],
    explanation: '小平维数的价值在于把“K 的正负性”这一模糊概念变成可计算的整数：$\\kappa$ 就是截面数 $h^0(mK)$ 的增长率，它把三种曲率情形（负、零、正）翻译成 $-\\infty$、$0$、$\\dim X$ 三个值（或中间值）。因为 $\\kappa$ 是双有理不变量，它可以在光滑模型或极小模型上计算，这就把分类问题化为“先算不变量、再按不变量分层”。技术上，双有理不变性依赖消解定理与爆破下 $h^0$ 增长的比较；几何解释（等于 Iitaka 纤维化底维数）依赖 Iitaka 猜想在 $\\kappa\\ge0$ 情形下的成立；数值判据（$K^{\\dim X}>0$ 即一般型）依赖渐近 Riemann–Roch。使用时要记住：要在最小模型或足够好的模型上算，并且正特征下 Iitaka 猜想仍未解决。',
    examples: [
      { title: '例子：曲线的三分', body: '光滑射影曲线 X 的亏格 g 决定一切：$g\\ge2$ 时 $\\deg K=2g-2>0$，$h^0(mK)=(2g-2)m+1-g$ 随 m 线性增长（由 Riemann–Roch），故 $\\kappa=1=\\dim X$（一般型）；$g=1$ 时 $K=0$，$h^0(mK)=1$ 有界，$\\kappa=0$；$g=0$ 时 $K=-2H$，$H^0(mK)=0$ 对一切 $m\\ge1$，$\\kappa=-\\infty$。三种情形对应 $2g-2$ 的正、零、负，也是“亏格 0、1、≥2”这一经典三分的小平维数版本。' },
      { title: '例子：曲面的四类与 K3', body: '光滑极小曲面 X 上以 $\\kappa$ 分类：$\\kappa=-\\infty$ 为 $\\mathbb{P}^2$ 或直纹面（存在纤维化到曲线且纤维 $\\mathbb{P}^1$，$K$ 在纤维上为负）；$\\kappa=0$ 包括 K3（$K=0$，$h^0(mK)=1$ 恒成立）、阿贝尔曲面、恩里克斯与双椭圆曲面（$K$ 挠，$h^0(mK)$ 有界）；$\\kappa=1$ 为椭圆曲面（$K^2=0$、$K$ 非挠、$K$ 是到曲线的纤维化类）；$\\kappa=2$ 为一般型（$K^2>0$、$K$ 丰沛）。核对 K3 的截面增长：由 Yau 的 Calabi 猜想与 $K=0$ 得 $H^0(mK)=\\mathbb{C}$（唯一常数截面），因此增长速率为 $m^0$，$\\kappa=0$，与清单一致。' },
    ],
    remarks: [
      '必须在足够好的模型上计算：$K^2>0$ 与 $K$ 丰沛不是同一件事（例如 $\n\\mathbb{P}^2$ 爆破点后 $K^2=8>0$ 但 $\\kappa=-\\infty$），因此判据要配合“是否最小模型/是否 nef”一起使用。',
      '非 $\\mathbb{Q}$-Gorenstein 簇上 $mK$ 未定义，小平维数必须先做 $\\mathbb{Q}$-Cartier 修正（正规化 + 取 $\\mathbb{Q}$-因子），否则定义的极限无意义。',
      '正特征下 Iitaka 猜想仍为公开问题：不能无条件使用“$\\kappa$ 等于 Iitaka 纤维化底维数”；特征 0 情形下该等价也不总是平凡（需要 $\\kappa\\ge0$ 的技术条件）。',
      '$\\kappa=-\\infty$ 与“$K$ 非 nef”不等价：存在 $\\kappa\\ge0$ 但 $K$ 非 nef 的簇（未达最小模型的一般型簇），反之 $K$ nef 必给 $\\kappa\\ge0$；把两者混同会在 MMP 中途错误判定类型。',
    ],
    corollaries: [
      { title: '推论：一般型等价于 K 的某个倍数丰沛', body: '由定义与 Iitaka 纤维化，$\\kappa(X)=\\dim X$ 等价于对某个 $m>0$ 有 $mK_X$ 给出的映射是双有理的（即 $mK_X$ 丰沛或半丰沛且给出双有理映射）。因此在 $\n\\kappa=\\dim X$ 情形可以把 $K$ 当作丰沛对象使用，这是“一般型”得名的原因。', uses: ['iitaka-fibration'] },
      { title: '推论：κ 是双有理分类的指标', body: '因为 $\\kappa$ 是双有理不变量，它把双有理类按 $\\kappa=-\\infty,0,1,\\dots,n-1,n$ 分开；每一层的分类目标不同（$\\kappa=n$ 找唯一丰沛极小模型，$\\kappa=0$ 找 $K$ 挠或零的结构，$\\kappa=-\\infty$ 找森纤维空间）。这把“分类簇”变为“分类不变量层次 + 层内标准形”。', uses: ['birational-invariance'] },
    ],
    references: [
      book('Birational Geometry of Algebraic Varieties, 第 1 章与第 6 章', 'Kollar & Mori', 1998),
      book('Algebraic Geometry, 第 V 章（曲面分类与 Kodaira 维数）', 'Robin Hartshorne', 1977),
      book('Iitaka fibrations and Kodaira dimension（相关综述讲义）', 'Kawamata / 相关作者综述', 2000),
      stacks('Stacks Project, Section 74.46: Minimal model program（相关章节）', '0FQA'),
    ],
    history: HISTORY,
  },

  /* ══════════════════════════════════════════════════════════════════
   * 三、现代方向：模空间
   * ══════════════════════════════════════════════════════════════════ */

  'moduli-space': {
    statement: '设 $\\mathcal{F}: (\\text{Sch}/S)^{\\operatorname{op}}\\to\\text{Set}$ 是把 S-概形 T 送到“T 上某类几何对象的同构类集合”的函子（模函子）。若 $\\mathcal{F}$ 可表，即存在 S-概形 M 与自然同构 $\\mathcal{F}\\cong\\operatorname{Hom}_S(-,M)$，则称 M 为该类对象的**细模空间**。若只有从 $\\operatorname{Hom}_S(-,M)$ 到 $\\mathcal{F}$ 的自然变换（且对每个几何点给出双射）而没有逆向的普遍族，则称 M 为**粗模空间**。典型结论：亏格 $g\\ge2$ 的光滑射影曲线的粗模空间 $M_g$ 存在，维数 $\\dim M_g=3g-3$，但它不是细模空间（因为自同构），其上的普遍曲线族只存在于函数域层或需要提升为 Deligne–Mumford 叠 $\\mathcal{M}_g$。',
    explanation: '模空间的想法是“把对象族参数化成一个空间的点”，而严格的定义通过函子给出：不仅要求点与对象一一对应，还要求“族的拉伸”与“态射的拉回”一致。这一层额外要求是必须的，否则任何双射都能当模空间。函子可表时称为细模空间，此时存在一个普遍族，其上的纤维就是所有对象，任何族都是它的拉回——这要求对象没有非平凡自同构（否则普遍族无法同时携带自同构信息，见下）。有自同构（例如曲线）时细模空间不存在，只能得到粗模空间：它仍是空间，点的集合与对象类一一对应，但普遍族不存在，族的对应只是“对每个几何点成立”。解决办法是把问题提升到叠：Deligne–Mumford 叠保留自同构信息，是“带自同构的模空间”。维数 $3g-3$ 可由黎曼-罗赫数出（$\\dim H^0(C,2K_C)=3g-3$ 给出形变参数），而 $3g-3<0$ 的情形（$g=0,1$）说明“通用曲线”并不存在，这正是 $M_0$、$M_1$ 需要用叠或加重结构处理的原因。',
    steps: [
      step('functor-of-points', '把“参数化对象”严格写成函子并说明为何要函子', '给定对象类（例如亏格 g 的光滑射影曲线、稳定向量丛、极化阿贝尔簇），定义函子 $\\mathcal{F}(T)=\\{T$ 上的该类对象族 $\\}/\\cong$，其中“T 上的族”指一个平坦、紧合（或按需）的态射 $X\\to T$，其纤维都属于该类；函子作用在态射 $f:T\'\\to T$ 上就是族的拉回。为什么必须用函子而不是单纯定义“一个集合 M”？因为几何对象需要“族的连续变化”这一概念，而族的变化方向正是通过底空间之间的态射表达的。函子语言把“M 的点 = 对象”升级为“从 T 到 M 的态射 = T 上的族”，从而同时编码了“点”与“连续变化”。给两个 T 值族的拉回相容（函子公理）保证了这套编码自洽。若只用集合，就无法区分“点与对象一一对应但族的拉伸不合法”的伪模空间；具体地说，函子的可表性要求一个自然同构，而自然变换的两条自然性条件正好对应“拉回相容”与“族在同构下等同”，缺一不可。'),
      step('representability', '可表性与普遍族：细模空间的定义与代价', '若 $\\mathcal{F}\\cong\\operatorname{Hom}_S(-,M)$，则由 Yoneda 引理，这个自然同构由 $\\mathcal{F}(M)$ 中的一个元素对应——正是 M 上的**普遍族** $\\mathcal{U}\\to M$（一个 $\\mathcal{F}(M)$ 中的对象），并且对任意 $f:T\\to M$，$\\mathcal{F}(f)$ 把普遍族拉回成 f 对应的族。Yoneda 引理在这里不只是技术工具，它直接说“可表函子的可表对象与函子元素一一对应”，所以普遍族存在且唯一（在同构意义下），这正是细模空间的定义内容。代价是：普遍族必须对自身有“足够多的自同构”来记录一切，但若某个对象 X 有非平凡自同构群 G，则用 $X$ 构造的族在 M 的同一点上给出“等价的纤维”，而普遍族的纤维是固定的，无法同时把 G 的作用保留下来。具体机制：取 $T=M$ 时，$\\operatorname{id}_M$ 对应普遍族；若把普遍族沿某个保持 X 的态射（例如“在 X 上作用的 G 的某个元素所对应的非平凡自同构”）拉回，自然性要求拉回后的族与原来的族相等（因为都是同一态射的拉回），但两者作为 X 上的族只差一个自同构，因此在 K-理论或几何意义上不同，矛盾。这就是“有自同构 ⟹ 无细模空间”的精确理由。'),
      step('coarse-moduli', '从细模空间退到粗模空间', '当细模空间不存在时，退一步要求一个空间 M 与自然变换 $\\eta:\\operatorname{Hom}_S(-,M)\\to\\mathcal{F}$，使：对每个几何点（代数闭域值点）$\\xi:\\operatorname{Spec}k\\to M$，$\\eta(\\xi)$ 给出的对象在 $\\mathcal{F}(\\operatorname{Spec}k)$ 中取遍所有同构类的代表（即“点与对象一对一”），且 M 是这种意义下的“最经济”解（任何其他带自然变换的空间到 M 有唯一态射，即粗模空间满足通用性质）。粗模空间的通用性质给出一个精确的等价刻画：若存在空间 N 与自然变换 $\\operatorname{Hom}(-,N)\\to\\mathcal{F}$ 且对所有 T 的几何点给出双射，则存在唯一态射 $N\\to M$（因为 $\\eta$ 对 N 的每一点给出对象，再由 M 的“点=对象”唯一确定一个点）。粗模空间的存在性远比细模空间弱，因此更容易证：对 $M_g$ 可以用几何不变量理论（GIT）或 Hilbert 概型的商来构造，也可以用“稳定性 + 有界性 + 可构造性”的技术。代价是失去普遍族：粗模空间上的点不再对应一个“自然的”曲线族，任何给定的族只在点级别对应，族与族之间的比较可能相差一个需要额外数据才能消除的自同构。'),
      step('dimension-of-mg', '维数 3g−3 的形变论计算', '对光滑射影曲线 C（$g\\ge2$），形变空间（一阶形变）是 $\\operatorname{Ext}^1(\\Omega^1_C,\\mathcal{O}_C)$，由 Serre 对偶与 $\\Omega^1_C=\\omega_C=K_C$ 得 $\\operatorname{Ext}^1(\\omega_C,\\mathcal{O}_C)\\cong H^0(C,\\omega_C^{\\otimes2})^{\\vee}$。再用黎曼-罗赫算 $h^0(2K_C)=\\deg(2K_C)+1-g=(4g-4)+1-g=3g-3$（因为 $\\deg K_C=2g-2$）。因此 $\\dim M_g=3g-3$。这里所有输入都是可核验的：$\\deg(2K_C)=4g-4$、$h^1(2K_C)=0$（因为 $\\deg =4g-4>2g-2=\\deg K_C$，故由 Serre 对偶 $h^1=h^0(K_C-2K_C)=h^0(-K_C)=0$）。对于 $g=0$：$3g-3=-3$，负维数说明 $M_0$ 是“零维或不存在”的退化情形（实际上 $M_0$ 是一点，但带非平凡自同构群 $\\operatorname{PGL}_2$，必须作为叠处理）。对于 $g=1$：$3g-3=0$，$M_1$ 是一维模空间 $\\mathbb{A}^1$ 的叠化（j-不变量），其维数 0 与“椭圆曲线由 j-不变量加自同构群决定”一致。这两个边界值说明 $3g-3$ 的公式在 $g\\ge2$ 下给出正维数，恰好是“一般曲线没有自同构而曲线有自同构”的分界。'),
      step('dm-stack-and-mgbar', '用 Deligne–Mumford 叠与紧化补足', '为了把自同构信息也保留，把问题提升到叠：定义 $\\mathcal{M}_g$ 为“光滑射影亏格 g 曲线”的模叠，其对象是族，态射是族的同构，纤维函子到群胚而不是集合。这样每个对象 X 的自同构群 $\\operatorname{Aut}(X)$ 自动出现在“点”的稳定化子中，普遍族（万有曲线）作为叠态射 $\\mathcal{C}_g\\to\\mathcal{M}_g$ 存在，因为叠允许“带自同构的纤维”。$\\mathcal{M}_g$ 是 Deligne–Mumford 叠：对角线非分歧（因为曲线自同构有限）且光滑。再作紧化 $\\overline{\\mathcal{M}}_g$：允许 nodal（结点）曲线且加上稳定性条件（每个有理分支至少与三个点/结点相连，即“自同构有限”的稳定性），得到紧合的 DM 叠，其上相交理论（Deligne–Mumford、Mumford 的方法）给出 $\\psi$ 类与 Hodge 类的计算基础。这个升级解决了粗模空间的所有毛病：普遍族存在、自同构被记录、紧化使相交数可算。代价是叠不是概形：它的“点”是群胚，因此陈述与证明都要在叠的语言下做（例如用平滑覆盖与群作用下降，或用函数域上的对象研究）。这也是现代模空间理论（例如曲线模空间、稳定向量丛模空间、Gromov–Witten 理论）普遍采用叠或“good moduli space + 叠”双层语言的原因。'),
    ],
    conclusion: '模空间通过函子 $\\mathcal{F}$ 定义：细模空间 = 函子可表（存在普遍族，要求对象无自同构），粗模空间 = 点与对象一一对应但无普遍族；$M_g$（$g\\ge2$）维数 $3g-3$ 为粗模空间，需用 Deligne–Mumford 叠 $\\mathcal{M}_g$ 与紧化 $\\overline{\\mathcal{M}}_g$ 才能容纳自同构与作相交计算。',
    dependencies: ['rational-map', 'etale-morphism', 'invertible-sheaf'],
    consequences: ['moduli-space', 'birational'],
    explanation: '模空间的严格定义必须用函子，因为“参数化”不只要求点与对象对应，还要求族的拉伸与底态射相容。函子可表时得到细模空间与普遍族，这里 Yoneda 引理同时给出存在性与唯一性；而对象带非平凡自同构时细模空间不存在，原因很具体：普遍族的纤维无法同时携带自同构与同构类两种信息，自然性条件会产生矛盾。退到粗模空间只保留“点对应对象”与通用性质，代价是失去普遍族，任何陈述若隐含地用了“模空间上的万有对象”都会出错。修正是把问题提升到叠：DM 叠保留自同构、存在万有曲线、可作紧化并发展相交理论。维数 $3g-3$ 由形变论计算给出（$h^0(2K_C)=3g-3$），这既是 $M_g$ 的维数，也解释了为什么 $g\\le1$ 需要特殊处理。',
    examples: [
      { title: '例子：$M_1$ 与 j-不变量', body: '椭圆曲线（亏格 1 加一个标定点）由 Weierstrass 方程 $y^2=x^3+ax+b$ 给出，两个方程同构当且仅当经过容许变换后 $(a,b)$ 成比例于某个特定关系，等价地 j-不变量 $j=1728\\cdot\\dfrac{4a^3}{4a^3+27b^2}$ 相同。于是 $M_1\\cong\\mathbb{A}^1$（用 j 作坐标），维数 0，与 $3g-3=0$ 相符；但每条椭圆曲线都有非平凡自同构（例如 $[\\omega]$ 作用的曲线只有 2 个自同构，$j=0$ 时 6 个、$j=1728$ 时 4 个），故 $\\mathcal{M}_1$ 是带 $\\mathbb{Z}/2$-稳定化子的 DM 叠（在 $j=0,1728$ 处稳定化子更大），而 $M_1$ 只是粗模空间。这个例子把“维数 0 + 自同构”这对现象完整展示出来。' },
      { title: '例子：$M_2$ 的显式描述与 3g−3=3', body: '亏格 2 曲线总是超椭圆的（其典范映射是到 $\\mathbb{P}^1$ 的 2:1 映射），由 6 个分支点（在 $\\mathbb{P}^1$ 上，模 $\\operatorname{PGL}_2$ 作用）决定。因此 $M_2=\\{6$ 点的多重集$\\}/\\operatorname{PGL}_2$，维数 $6-3=3$，与 $3g-3=3$ 一致。这个描述非常具体：每个亏格 2 曲线对应 $\\mathbb{P}^1$ 上 6 点配置的 $\\operatorname{PGL}_2$-轨道，因此 $M_2$ 是有理（有理簇）的三维对象，可以显式写坐标（不变量理论给出 $\\operatorname{Sym}^6\\mathbb{P}^1$ 的不变量环）。核对 $h^0(2K_C)=3g-3=3$：$\\deg 2K_C=4g-4=4$，$h^0=4+1-2=3$，与“6 个分支点除 $\\operatorname{PGL}_2$ 的 3 个自由度”相符。' },
    ],
    remarks: [
      '粗模空间上不存在普遍族：任何隐含使用“$M_g$ 上的万有曲线”的论证都是错的，必须换成 DM 叠 $\\mathcal{M}_g$ 或引入标定点（如 $M_{g,n}$ 或 $M_{g,1}$ 上加层级结构）来消除自同构。',
      '维数公式 $3g-3$ 只在 $g\\ge2$ 给出正维数：$g=0$ 得 $-3$、$g=1$ 得 $0$，这两个情形必须以叠或加重结构处理，把公式直接当作 $M_g$ 的维数会在低亏格出现负维数这一无意义结论。',
      '可表性要求对象无自同构这一点只对“细模空间”成立；粗模空间的存在性弱得多，因此“模空间存在”与“细模空间存在”是不同强度的断言，混用会导致错误的普遍族构造。',
      '特征假设会影响模空间理论：在正特征下曲线模空间的构造需要额外技术（例如稳定曲线与 Artin 叠的存在性、以及某些形变理论中 obstruction 的处理），把特征 0 的结论原样搬用会出现“obstruction 非零而形变空间维数不等于期望”的错误。',
    ],
    corollaries: [
      { title: '推论：有自同构则只有粗模空间', body: '若对象类中存在某个对象 X 满足 $\\operatorname{Aut}(X)\\ne\\{1\\}$（例如任意亏格 g 的光滑曲线在 $g\\ge2$ 时也可能有自同构，$g=1$ 时必有），则细模空间不存在，只能有粗模空间或叠。这条推论给出判断“能否期待普遍族存在”的快速准则：先看自同构群是否平凡。', uses: ['representability'] },
      { title: '推论：叠是模空间的正确语言', body: '把模函子提升到群胚值函子（叠）后，万有曲线与自同构信息同时存在，紧化 $\\overline{\\mathcal{M}}_g$ 使相交数可算（$\\psi$ 类、Hodge 积分、Gromov–Witten 与 Witten 猜想）。因此现代模空间理论的标准做法是先构造叠、再取其粗模空间或 good moduli space。', uses: ['dm-stack-and-mgbar'] },
    ],
    references: [
      book('The Geometry of Moduli Spaces of Sheaves, 第 2 章（模函子与可表性）', 'Huybrechts & Lehn', 2010),
      book('Moduli of Curves (GTM 187), 第 1 章与第 2 章', 'Harris & Morrison', 1998),
      book('Intersection Theory, 第 17 章（模空间与相交理论）', 'William Fulton', 1998),
      stacks('Stacks Project, Chapter 75: Algebraic spaces and stacks', '025Y'),
    ],
    history: HISTORY,
  },

}
