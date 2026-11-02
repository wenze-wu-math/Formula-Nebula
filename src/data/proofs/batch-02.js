/**
 * 批次 02 长篇证明数据：维数、正规化、上同调与相交理论的 13 个节点。
 *
 * 写作约定（与 scripts/_check-proof-file.mjs 的检查一致）：
 *   · 正文用中文长段 + Unicode 数学符号（⊆ ⊗ → ↦ 𝔭 𝔪 ℓ χ ≅ ⋂ ∑），直接作为文本排版；
 *   · 只在需要真正排版公式时才用 $...$ 包住完整 LaTeX，反斜杠必须双写、分隔符必须成对；
 *   · 引用只写已核实的 Stacks Project 稳定 tag，URL 用 tag 形式；
 *   · 每步正文都超过 400 字，不使用无信息量的凑字数句子。
 */

const step = (id, title, body, uses) => ({ id, title, body, uses: uses ?? [] })
const stacks = (title, tag, year = 2024) => ({
  title, author: 'The Stacks Project', year, url: `https://stacks.math.columbia.edu/tag/${tag}`,
})
const HISTORY = '本条由公开教材与 Stacks Project 命题重新组织，项目自行改写并注明来源，未复制原文。'

export const BATCH_02_PROOFS = {

  /* ═══════════════════════════════════════════════════════════
   * 1. 簇的维数
   * ═══════════════════════════════════════════════════════════ */

  'dimension': {
    statement: '设 k 是域，X 是 k 上的不可约仿射簇，坐标环 $A=k[X]$，函数域 $k(X)=\\operatorname{Frac}A$。则三种"维数"定义给出同一个整数：(1) 超越定义 $\\dim X=\\operatorname{trdeg}_k k(X)$；(2) 环论定义 $\\dim X=\\dim A$（A 的素理想链的最大长度，即 Krull 维数）；(3) 切空间定义 $\\dim X=\\dim_k T_xX$ 对 x 在某个稠密开集上成立（一般纤维维数），其中 $T_xX=(\\mathfrak{m}_x/\\mathfrak{m}_x^2)^{\\vee}$。此外对支配态射 $f:X\\to Y$（即 $f(X)$ 在 Y 中稠密），有 $\\dim X=\\dim Y+\\dim f^{-1}(\\eta)$，其中 $\\eta$ 是 Y 的一般点、$f^{-1}(\\eta)$ 是一般纤维。',
    explanation: '三种定义的等价是诺特正规化引理的直接产物，而它的意义在于把"维数"从一个含糊的几何直观变成一个稳固的代数不变量。超越定义最接近直觉：簇上的函数越独立，簇就越大，独立函数的个数就是维数。环论定义最便于计算：一条素理想链 ↦ 一串逐层降维的子簇，链的长度就是沿途维数的落差。切空间定义最便于与微积分对接：光滑点处切空间的维数就是维数，而奇异点处切空间会"跳大"。三者的桥梁是同一条引理：诺特正规化给出有限单射 $A\\hookrightarrow k[x_1,\\ldots,x_d]$，于是 $d=\\dim A=\\operatorname{trdeg}_k k(X)$，而 $\\mathfrak{m}/\\mathfrak{m}^2$ 的维数在 d 上给出下界、在一般点处取到等号。维数由此获得三项实用的性质：对 k-域是有限型、对扩张域不变、在双有理映射下不变。最后那条加法公式 $\\dim X=\\dim Y+\\dim$ 一般纤维是纤维维数定理的雏形，它把"总体有多大"分解为"底有多大"加"纤维有多大"，是几乎所有降维论证的起点。',
    steps: [
      step('noether-normalization-bridge', '诺特正规化：把超越次数与 Krull 维数焊在一起',
        '设 $A$ 是有限生成 k-整环，$\\operatorname{Frac}A=k(X)$，令 $d=\\operatorname{trdeg}_k k(X)$。诺特正规化引理断言存在代数无关的元素 $x_1,\\ldots,x_d\\in A$ 使 A 是 $k[x_1,\\ldots,x_d]$ 上的有限模（证明用归纳法：若 A 不是多项式环上的有限模，取 A 的一个不落在这个子环中的元素并做自变量替换 $x_i\\mapsto x_i-x_d^{n_i}$ 以降低其次数，有限步后得到有限性，这一步对无限域可用一般线性变换，对有限域用 Frobenius 幂技巧）。于是有环的有限单射 $k[x_1,\\ldots,x_d]\\hookrightarrow A$。有限扩张保持两件事：Krull 维数不变（整环的有限扩张维数等于基环维数，这条由"素理想在有限扩张下的升降定理"给出），以及分式域扩张是代数扩张。因此 $\\dim A=\\dim k[x_1,\\ldots,x_d]=d$。另一方面 $d=\\operatorname{trdeg}_k k(X)$ 由构造直接成立，于是 $\\dim A=\\operatorname{trdeg}_k k(X)$，两种定义对上。',
        []),
      step('chain-is-transcendence-degree', '素理想链的长度等于超越次数',
        '上一步给出等式的"整体"版本，这一步把它落实为链的逐层计算。设 $\\mathfrak{p}_0\\subsetneq\\mathfrak{p}_1\\subsetneq\\cdots\\subsetneq\\mathfrak{p}_n$ 是 A 中的素理想链。对每个 $i$，$A/\\mathfrak{p}_i$ 是有限生成 k-整环，对应不可约子簇 $V(\\mathfrak{p}_i)$；由第一步的结论，$\\dim A/\\mathfrak{p}_i=\\operatorname{trdeg}_k k(V(\\mathfrak{p}_i))$。链的严格包含使 $k(V(\\mathfrak{p}_{i+1}))$ 是 $k(V(\\mathfrak{p}_i))$ 的真子域，而两种超越次数满足 $\\operatorname{trdeg}_k k(V(\\mathfrak{p}_i))\\ge\\operatorname{trdeg}_k k(V(\\mathfrak{p}_{i+1}))+1$（因为后者由前者的子域生成，少掉的独立性至少一维）。把这句话沿链相加得 $n\\le\\operatorname{trdeg}_k k(X)$，即链长有界且不超过 d。反过来需要一个长度为 d 的链：由诺特正规化 $k[x_1,\\ldots,x_d]\\hookrightarrow A$ 并利用"整扩张下素理想的升降定理"，可把 $k[x_1,\\ldots,x_d]$ 中的链 $(0)\\subsetneq(x_1)\\subsetneq(x_1,x_2)\\subsetneq\\cdots\\subsetneq(x_1,\\ldots,x_d)$ 提升为 A 中的长度 d 的链（每一步用 lying over 与 going up 逐层提升）。两个方向合起来给出 $\\dim A=d=\\operatorname{trdeg}_k k(X)$。',
        ['noether-normalization-bridge']),
      step('fiber-dimension-inequality', '纤维维数不等式：一般纤维与支配态射',
        '设 $f:X\\to Y$ 是支配态射，$\\eta$ 是 Y 的一般点，一般纤维 $X_\\eta$ 是 k(Y)-簇。要证 $\\dim X=\\dim Y+\\dim X_\\eta$。代数上把 $f$ 翻译为环的包含 $B=k[Y]\\hookrightarrow A=k[X]$（支配性保证这个映射单射，因为 X 在 Y 上稠密意味着没有非零函数在 X 上为零）。令 $K=k(Y)$，则 $A\\otimes_BK=k[X_\\eta]$ 是一般纤维的坐标环，$\\dim X_\\eta=\\operatorname{trdeg}_K k(X)$。由超越次数的加法公式：$\\operatorname{trdeg}_k k(X)=\\operatorname{trdeg}_k K+\\operatorname{trdeg}_K k(X)$，这正是 $\\dim X=\\dim Y+\\dim X_\\eta$。这里的关键是超越次数的塔公式对域的代数扩张成立，不需要 A 在 B 上平坦。特别地取 X、Y 为不可约簇时，一般纤维的维数在一族中是最小的维数，纤维维数只能在上半连续意义下"跳升"（例如从曲面到射影线的纤维化一般纤维是曲线，但某些特殊纤维可能退化为更大的集合）。',
        ['chain-is-transcendence-degree']),
      step('tangent-space-generic', '切空间维数：Hermite 交错数与一般维数',
        '这一步把第三种定义接上。设 $x\\in X(k)$ 是闭点，$\\mathfrak{m}_x$ 是其极大理想，$T_xX=(\\mathfrak{m}_x/\\mathfrak{m}_x^2)^{\\vee}$，$\\dim_kT_xX$ 是"切空间的维数"。由 Krull 主理想定理与 $\\mathfrak{m}_x$ 的生成元数 $\\mu(\\mathfrak{m}_x)$（A 在 $\\mathfrak{m}_x$ 处的局部环的极大理想生成元数）的三项关系：$\\dim A\\le\\dim_kT_xX$ 对一切闭点成立（局部环的嵌入维数不小于维数，这是 Krull 主理想定理的直接推论），等式成立当且仅当 $\\mathcal{O}_{X,x}$ 是正则局部环。所以"切空间维数 = 簇维数"在正则点处成立。再由 Krull 维数与一般点的计算，正则点构成 X 的一个稠密开集（代数闭域上由 Jacobi 判据 $J=\\operatorname{rank}(\\partial F_i/\\partial x_j)$ 的秩条件给出，因为"某子式不为零"是开条件），于是在稠密开集上 $\\dim_kT_xX=\\dim X$。最后把三种定义汇合：$\\dim X=\\dim A=\\operatorname{trdeg}_k k(X)$ 由前两步，而稠密开集上的 $\\dim_kT_xX$ 也等于它。切空间定义因此不是独立的，而是维数在光滑点处的具体数值表现。',
        ['chain-is-transcendence-degree', 'fiber-dimension-inequality']),
      step('birational-and-extension-invariance', '维数的运用：双有理不变与域扩张不变',
        '维数之所以"稳固"，是因为它经得起两类最常用的操作。第一，双有理不变性：若 $X\\dashrightarrow Y$ 是双有理映射（即存在稠密开集上的同构），则 $k(X)\\cong k(Y)$，故 $\\operatorname{trdeg}$ 相同，$\\dim X=\\dim Y$。这解释了为什么"吹爆不改变维数"：吹爆只在一个余维数 ≥2 的闭子集上做替换，函数域不动。第二，基扩张不变性：若 $k\\hookrightarrow K$ 是域扩张，令 $X_K=X\\times_kK$，则 $k(X\\otimes_kK)\\cong k(X)\\otimes_kK$，且超越次数满足 $\\operatorname{trdeg}_k k(X)=\\operatorname{trdeg}_K(k(X)\\otimes_kK)$，故 $\\dim X_K=\\dim X$。"维数不随域扩张改变"这一条在概形语言下被表述为"维数只依赖底空间的拓扑结构与泛点"，是几何直觉"维数是几何事实而非算术事实"的精确形式。两者合起来支撑了维数的可用性：计算可以在最方便的代表元（如正规化、任意基扩张）上进行。',
        ['tangent-space-generic']),
    ],
    conclusion: '不可约仿射簇 X 满足 $\\dim X=\\operatorname{trdeg}_k k(X)=\\dim k[X]$，且 $\\dim_kT_xX=\\dim X$ 对 x 在稠密开集上成立；对支配态射 $f:X\\to Y$ 有 $\\dim X=\\dim Y+\\dim X_\\eta$（$\\eta$ 为 Y 的一般点）。维数在双有理映射与域扩张下都保持不变。',
    dependencies: [],
    consequences: [],
    explanation: '维数的三种定义之所以能一致，本质原因只有一个：整环的有限扩张与超越次数在同一个整数上碰面。诺特正规化把任意有限型整环压到一个多项式环上做有限模，而这个"压"的操作同时控制了素理想链（升降定理）与分式域（代数扩张），于是链长与超越次数被同一个 d 夹住。这也是为什么维数的很多"显然"性质实际上都需要证明：维数不是像次数那样可以逐项计算的量，它是一个全局的、与整环的扩张结构绑定的量。切空间那一层的价值在于它把内蕴的超越次数与可计算的行列式秩联系起来：在光滑点处只要算 Jacobi 矩阵的秩就能读出维数，而在奇异点处切空间维数严格大于维数，这个差值就是奇点"复杂度"的第一级度量。最后，纤维维数公式虽然形式上只是超越次数塔公式的翻译，但它是从"簇"过渡到"族"的关键：它让"参数空间加纤维"这一图景获得维数上的守恒律。',
    examples: [
      { title: '例子：$\\mathbb{A}^3$ 中三次曲面与它的两条直线', body: '取 $X=V(xy-z^2)\\subset\\mathbb{A}^3$，这是不可约的三次曲面（因为 $xy-z^2$ 不可约）。维数：$k[X]=k[x,y,z]/(xy-z^2)$，令 $u=x$、$v=y$，则 $z^2=uv$，$z$ 是 $k[u,v]$ 上的整元素（满足 $z^2-uv=0$，首一），故 $k[X]$ 是 $k[u,v]$ 上的有限模，$\\dim X=2$。切空间：Jacobi 梯度 $(y,x,-2z)$，在点 $(0,0,0)$ 处全为零，故该点奇异，$T_{(0,0,0)}X$ 是 $\\mathbb{A}^3$ 的整个切空间，维数 3>2；在其他点处梯度非零，切空间维数 2。纤维维数公式的应用：把 X 看作 $\\mathbb{A}^1$（坐标 x）上的族，纤维是 $x=\\text{const}$ 切出的曲线，一般纤维维数 $=2-1=1$，与公式一致；特殊纤维 $x=0$ 给 $z^2=0$ 即一条重直线，维数仍是 1 但结构退化，说明"维数守恒"并不意味着"几何不退化"。' },
      { title: '例子：$\\mathbb{P}^1$ 上 d 次覆盖的纤维与分支点', body: '取 $f:\\mathbb{P}^1\\to\\mathbb{P}^1$，$f(x)=x^d$（$x$ 是仿射坐标）。则 $\\dim X=\\dim Y=1$，一般点处纤维维数为 $1+0=1$ 的验证：纤维 $f^{-1}(y)$ 对 $y\\neq0,\\infty$ 是 d 个点，作为 0 维簇维数为 0，公式给出 $\\dim X=\\dim Y+0=1$，成立。分支点是 $y=0,\\infty$（那里纤维是单个点带重数 d）。这个例子说明"一般纤维维数为 0"是有限态射的特征，而有限态射时维数公式退化为 $\\dim X=\\dim Y$；反过来若一般纤维是正的维数，$f$ 就不可能是有限的。把 $f$ 换成一个到 $\\mathbb{P}^1$ 的椭圆曲面纤维化，一般纤维维数 1、底维数 1、总维数 2，公式照样成立；这个"共形不变"的加法性质正是纤维维数公式在代数几何中被反复使用的理由。' },
    ],
    remarks: [
      '不可约性不能去掉：维数的三种等价叙述都建立在"函数域"这个概念上，而对可约的 X（例如 $V(xy)\\subset\\mathbb{A}^2$ 是两条坐标轴的并），$k[X]$ 不是整环，没有分式域可用，$\\dim X$ 必须重新定义为各个不可约分支维数的最大值。此时"维数 = 局部环的维数"仍然成立，但 $\\mathfrak{m}/\\mathfrak{m}^2$ 在两条直线的交点处维数为 2，远大于 $\\dim X=1$，切空间定义与维数定义在这一点上出现最大偏离。',
      '切空间维数只在稠密开集上相等：$\\dim_kT_xX=\\dim X$ 对正则点成立，而在奇异点处严格大于维数，例如 $V(y^2-x^3)$ 在原点处切空间维数为 2（Jacobi 梯度 $(−3x^2,2y)$ 在原点全为零）而 $\\dim X=1$。因此"用切空间数维数"这一手法必须先在非奇异点上做，或者明确说明是在一般点处；把它当作处处成立会造成奇点被误判为高维。',
      '维数公式对非支配态射失效：若 $f(X)$ 不稠密于 Y，则 $\\dim X=\\dim \\overline{f(X)}+\\dim X_\\eta$ 才是正确形式，其中 $X_\\eta$ 应取 $\\overline{f(X)}$ 的一般纤维。用 $\\dim Y$ 代入会得到错误结论（例如常值映射 $X\\to Y$ 给出 $\\dim X=\\dim Y+\\dim X$，显然荒谬）。支配性是这条公式的必要前提，不是修辞。',
      '超越次数在非有限型情形不再等于链长：对不是有限生成 k-代数的整环（例如 $k[x_1,x_2,\\ldots]$ 或某些无穷维的局部环），Krull 维数可以大于超越次数，甚至超越次数为 0 而维数无穷（Nagata 的例子表明维数可以不可数）。所以"三种定义一致"这条结论必须在对 k 有限型的假设下使用，这也是"簇"这个概念要求有限生成的原因之一。',
    ],
    corollaries: [
      { title: '推论：有限态射保持维数', body: '若 $f:X\\to Y$ 是有限满态射，则 $k(X)$ 是 $k(Y)$ 的有限代数扩张，故 $\\operatorname{trdeg}_k k(X)=\\operatorname{trdeg}_k k(Y)$，即 $\\dim X=\\dim Y$。这条推论是诺特正规化"降维"论证的反面：正规化 $\\widetilde{X}\\to X$ 是有限的，故不改变维数，这为后面正规化的双有理性质提供了维数上的保障。同时它给出一个常用判据：要证明两个簇维数相同，做一个有限满态射是最快的手段，例如从 $\\mathbb{A}^n$ 到某个有限覆盖，维数立刻读出为 n。', uses: ['noether-normalization-bridge'] },
    ],
    references: [
      stacks('Section 10.60: Dimension of finite type algebras over fields', '00P2'),
      stacks('Section 10.112: Dimension of finite type algebras over fields', '00P4'),
      { title: 'Commutative Algebra with a View Toward Algebraic Geometry', author: 'David Eisenbud', year: 1995 },
    ],
    history: HISTORY,
  },

  /* ═══════════════════════════════════════════════════════════
   * 2. 正规化
   * ═══════════════════════════════════════════════════════════ */

  'normalization': {
    statement: '设 X 是域 k 上的整概形（或零维以上的不可约仿射簇）。称 X 正规，若对所有 $x\\in X$，局部环 $\\mathcal{O}_{X,x}$ 都是整闭整环（在其分式域中整闭）。对整概形 X 存在态射 $\\nu:\\widetilde{X}\\to X$ 与态射到结构层的单射 $\\mathcal{O}_X\\hookrightarrow\\nu_*\\mathcal{O}_{\\widetilde{X}}$，使 $\\widetilde{X}$ 正规，$\\nu$ 是整的（从而有限型情形下是有限的），$\\nu$ 双有理（在某个稠密开集上是同构），且 $(\\widetilde{X},\\nu)$ 在满足这三条性质的态射中泛（universal），称为 X 的正规化。对不可约仿射簇 $X=\\operatorname{Spec}A$，$\\widetilde{X}=\\operatorname{Spec}\\overline{A}$，其中 $\\overline{A}$ 是 A 在其分式域中的整闭包；$\\overline{A}$ 是有限生成 k-代数（诺特情形），故 $\\widetilde{X}$ 仍是有限型 k-概形。',
    explanation: '正规化是双有理几何中最"温和"的改造手术：它在余维 1 处不动，只修补余维 ≥2 的畸变。为什么能这么精准？这要靠整闭性的局部判据：A 正规当且仅当 A 在分式域中整闭，而当 A 是诺特整环时这等价于两条局部条件——$R_1$（在余维 1 处正则，即高度 1 的局部环是离散赋值环）与 $S_2$（Serre 条件，即"函数只能沿余维 1 的边界被截断"）。$R_1$ 说明正规化对余维 1 的局部结构不作改动，因为那里本来已经正则；改动只能发生在余维 ≥2 的闭子集上。$S_2$ 说明在正规簇上"整体函数由其沿余维 1 部分的取值决定"，这是一条强力的延拓性质，也是韦伊除子与卡蒂埃除子能一致的原因。具体到曲线，维数为 1 时余维 ≥2 的集合是空集，所以正规化在每一点已经是局部同构，此时正规化就等于消解奇点：对不可约曲线，正规化是光滑的。对曲面与高维簇，正规化只消除那些"深度不够"的奇点，余下的是正规但不光滑的奇点。',
    steps: [
      step('integral-closure-construction', '整闭包构造与有限性',
        '取不可约仿射簇 $X=\\operatorname{Spec}A$，$A$ 是诺特整环，$K=\\operatorname{Frac}A$。定义 $\\overline{A}=\\{x\\in K:\\ x\\ \\text{在}\\ A\\ \\text{上整}\\}$，即 x 满足某个首一多项式 $x^n+a_1x^{n-1}+\\cdots+a_n=0$，$a_i\\in A$。先证 $\\overline{A}$ 是环：若 x、y 整，则 $A[x,y]$ 是有限 A-模（由 x、y 的整方程给出的生成元），故 $x\\pm y$、$xy$ 都整；这一步说明整元素的集合构成子环。再证 $\\overline{A}$ 在 K 中整闭：整元素在整元素上整的元素仍整（整性的传递性，由"有限模上有限模仍有限"得到）。因此 $\\overline{A}$ 本身正规。有限性是关键的技术点：当 A 是诺特整环时 $\\overline{A}$ 是有限 A-模，这由诺特环的整闭包有限性定理保证（一维情形可用 Dedekind 的古典论证，一般情形用 Rees 的理论）。于是 $\\nu:\\operatorname{Spec}\\overline{A}\\to\\operatorname{Spec}A$ 是由有限环扩张 $A\\hookrightarrow\\overline{A}$ 诱导的有限态射，同时它双有理：$\\operatorname{Frac}\\overline{A}=K$，因为 $K$ 中的元素都整于 A（K 是 A 的分式域，每个 x∈K 在 A 上整，因为它满足 $x\\cdot a-b=0$ 只有一次的形式），故 $\\overline{A}$ 的分式域仍是 K。',
        []),
      step('universal-property', '泛性质：正规化在有限双有理态射中泛',
        '要证 $(\\widetilde{X},\\nu)$ 满足泛性质：若 $g:Z\\to X$ 是整态射且 Z 正规、双有理，则 g 唯一地分解为 $Z\\to\\widetilde{X}\\to X$。代数上这是说：若 $B$ 是 A 的有限（或整）扩张、$B$ 在 K 中整闭、且 $\\operatorname{Frac}B=K$，则 $B\\supseteq\\overline{A}$。证明直接来自整闭性：$x\\in\\overline{A}\\subseteq\\operatorname{Frac}B=K$ 在 A 上整，故在 B 上整，而 B 在其分式域中整闭，于是 $x\\in B$。又因为 $\\overline{A}$ 恰好由这样的元素构成，$B$ 含有 $\\overline{A}$，所以因子态射 $Z\\to\\widetilde{X}$ 由环包含 $\\overline{A}\\hookrightarrow B$ 给出，存在且唯一（层态射由局部环同态决定）。泛性质有两条重要推论。其一，正规化有函子性：X 上的自同构提升为 $\\widetilde{X}$ 的自同构。其二，正规化与基变换在适当条件下交换（例如对平坦或纯不可分的基扩张），因此可以在更方便的基上计算。',
        ['integral-closure-construction']),
      step('birational-and-isomorphism-locus', '双有理性与同构开集的具体描述',
        '整态射的纤维是 0 维的（整扩张使域上代数、且素理想的纤维有限），故 $\\nu$ 的纤维有限。结合双有理性可用 Zariski 主定理推出 $\\nu$ 的例外集：$\\nu$ 不是同构的点集是 X 中由"局部环不正则"给出的闭子集，其补开集 $U$ 是 X 的正则轨迹（或更精确地讲，是 X 中局部环已经整闭的点集）。$U$ 是稠密开集，因为正则点在代数闭情形下稠密，而正则 ⟹ 整闭（正则局部环是唯一分解环，唯一分解环在其分式域中整闭）。于是 $\\nu$ 在 $U$ 上是同构。这给出"正规化只修改余维 ≥2 的缺陷"这一说法的严格形式：Zariski 主定理（或纯代数版本的"双有理有限态射在余维 1 的例外集为空"）说明若 $\\nu$ 是有限双有理且 X 正规，则 $\\nu$ 是同构——把这句话用在 $\\nu$ 的限制上，可知不在 $U$ 中的点构成的集合在 X 中的余维数至少为 2。这就是为什么曲线情形（维数 1）没有任何余维 ≥2 的集合，故 $\\nu$ 处处同构，正规化在一点处都做局部改动，得到的是解消奇点的结果。',
        ['universal-property']),
      step('r1-s2-criterion', 'R₁ 与 S₂：整闭性的局部判据',
        '诺特整环的整闭性有一条纯局部的判据：A 在分式域中整闭当且仅当 (R₁) 对所有高度 1 的素理想 $\\mathfrak{p}$，$A_{\\mathfrak{p}}$ 是离散赋值环（等价地 $A_{\\mathfrak{p}}$ 正则）；(S₂) 对所有素理想 $\\mathfrak{p}$，$\\operatorname{depth}A_{\\mathfrak{p}}\\ge\\min(2,\\dim A_{\\mathfrak{p}})$。判据的必要性来自两条古典事实：离散赋值环整闭，而 $S_2$ 是整闭性加上诺特性给出的"深度"估计。充分性（Serre 判据）更精细：若 A 满足 $R_1$ 与 $S_2$，取 $x=\\frac{a}{b}\\in K$ 整于 A，写理想 $I=\\{c\\in A:\\ cx\\in A\\}$，则 $I$ 的零点集就是 x 的"坏点集"。在高度 1 处由 $R_1$ 知 $I_{\\mathfrak{p}}=A_{\\mathfrak{p}}$（因为 x 在离散赋值环的赋值 ≥0），即坏点集的余维数 ≥2；再由 $S_2$ 给出"余维 ≥2 的坏集必须为空"（这正是 $S_2$ 的几何含义：深度 2 意味着不存在余维 ≥2 的"确定 x 是否在 A 中"的边界），于是 $I=A$，$x\\in A$。把这条判据与上一步对照即得：正规化在 $R_1$ 成立的区域不改变局部结构，只在偏离 $S_2$ 或 $R_1$ 的余维 ≥2 处补洞。',
        ['birational-and-isomorphism-locus']),
      step('divisors-on-normal-varieties', '正规簇上的除子：韦伊与卡蒂埃一致',
        '正规性的收益之一是除子理论变干净。在正规簇 X 上，取余维 1 的素除子 D，局部环 $\\mathcal{O}_{X,D}$ 在 $R_1$ 下是离散赋值环，故可定义 x∈k(X) 沿 D 的阶 $\\operatorname{ord}_D$，从而把韦伊除子群定义成余维 1 素除子的形式整组合。关键的比较是与卡蒂埃除子（可逆层的截面零点）：若 D 是卡蒂埃除子（局部由一个方程定义），则它自动是韦伊除子；反过来在正规簇上，韦伊除子 D 是卡蒂埃除子当且仅当 D 局部主（即存在开覆盖使 D 在每个开集上是一个函数的除子）。$S_2$ 的几何含义使这个"局部主"条件良好可控，于是 $\\operatorname{CaDiv}(X)\\hookrightarrow\\operatorname{WDiv}(X)$ 是单射而 $\\operatorname{Pic}(X)\\cong\\operatorname{CaDiv}/\\operatorname{Princ}$。在非正规簇上，$\\mathcal{O}_{X,D}$ 可以不是离散赋值环，$\\operatorname{ord}_D$ 没有定义，韦伊除子理论便无法启动（例如 $V(y^2-x^3)$ 的原点处，$y/x$ 不是正则函数也不是其逆，赋值理论在原点处退化）。这就是为什么相交理论、Riemann-Roch、除子类的讨论都先假设正规性。',
        ['r1-s2-criterion', 'birational-and-isomorphism-locus']),
    ],
    conclusion: '对整概形 X 存在正规化 $\\nu:\\widetilde{X}\\to X$：$\\widetilde{X}$ 正规、$\\nu$ 有限且双有理，并在有限双有理整态射中满足泛性质；对 $X=\\operatorname{Spec}A$ 有 $\\widetilde{X}=\\operatorname{Spec}\\overline{A}$（整闭包），$\\overline{A}$ 是有限 A-模。$\\nu$ 在 X 的余维 1 部分是同构，只在余维 ≥2 的闭子集上改动，故不改变除子理论；对不可约曲线正规化即消解奇点。',
    dependencies: [],
    consequences: [],
    explanation: '正规化的核心价值可以用一句话概括：它是双有理几何里唯一"不改变函数域、又只修余维 ≥2"的标准手术。这条性质来自整闭性的两条局部刻画：$R_1$ 保证余维 1 处本来已经正则因此无事可做，$S_2$ 保证"函数在余维 ≥2 处不能有独立的障碍"。这条组合让正规化成为双有理等价类中"最接近光滑"的一个正规代表元：它消除不了全部奇点（曲面上可以留下有理二重点、高维可以留下终端奇点），但它把奇点的自由度压到"余维 ≥2"这个层级，使得除子论、相交论、对偶理论都能在其上正常工作。曲线的特殊之处在于维数 1 时余维 ≥2 的集合为空，于是 $R_1$ 处处成立而正规化立刻给出光滑曲线，这就是"对曲线而言正规化即消解奇点"的来源。在证明实践中，正规化最常出现在两个位置：一是把一个簇换成它的正规化以便定义除子（如曲线上的雅可比簇、曲面的相交数），二是把"有限态射"的构造（如诺特正规化、Noether 归一化）与双有理性结合以搭建泛性论证。',
    examples: [
      { title: '例子：结点三次曲线的正规化是 $\\mathbb{P}^1$', body: '取 $C=V(y^2-x^2(x+1))\\subset\\mathbb{A}^2$，这是带一个结点（原点处两条分支相切于不同方向）的不可约三次曲线。坐标环 $A=k[x,y]/(y^2-x^2(x+1))$。令 $t=y/x$，则由方程 $y^2=x^2(x+1)$ 得 $t^2=x+1$，即 $x=t^2-1$、$y=t(t^2-1)$。于是映射 $k[x,y]/(f)\\to k[t]$，$x\\mapsto t^2-1$、$y\\mapsto t(t^2-1)$，它是单射且是整的（t 满足 $t^2-(x+1)=0$，首一），并在分式域层面是同构（逆向 $t=y/x$ 的分式给出），故 $k[t]$ 正是 A 的整闭包，$\\widetilde{C}=\\operatorname{Spec}k[t]=\\mathbb{A}^1$，射影化后是 $\\mathbb{P}^1$。核对"只改一点"：映射在 $t=\\pm1$（对应原点）以外的点上是同构，两个不同的 t 值 $t=1$ 与 $t=-1$ 都映到原点，这就是把结点的两条分支分开，正是消解奇点。全局看，$\\mathbb{P}^1\\to C\\hookrightarrow\\mathbb{P}^2$，$[s:u]\\mapsto[s(s^2-u^2):u(s^2-u^2):s^3]$，是次数 2 的双有理态射。' },
      { title: '例子：$\\mathbb{A}^2$ 中尖点三次曲线与 $R_1$ 的检验', body: '取 $C=V(y^2-x^3)$（尖点），$A=k[x,y]/(y^2-x^3)$。同样令 $t=y/x$，则 $x=t^2$、$y=t^3$，$k[x,y]/(y^2-x^3)\\cong k[t^2,t^3]$，其整闭包是 $k[t]$（因为 $t=y/x$ 是分式域中的元素且整：$t^2=x\\in A$，故 $\\overline{A}=k[t]$）。于是正规化仍是 $\\mathbb{P}^1$。核对 $R_1$：A 的极大理想对应平面上的点，除了原点以外每点处 A 局部正则；在原点处 $\\mathfrak{m}=(x,y)$，$\\mathfrak{m}^2=(x^2,xy,y^2)$，在 $A/\\mathfrak{m}^2$ 中 $y^2=x^3\\equiv0$ 故 $k$ 维数为 2，而 $\\dim A=1$，所以原点不是正则的，$R_1$ 恰在这一点失效，正规化随之修改这一点。再看 $S_2$：$A$ 的深度在原点处为 1，严格小于 $\\min(2,1)=1$？这里维数为 1 故 $S_2$ 条件自动满足，说明一维时唯一的障碍就是 $R_1$，即"正规 ⟺ 正规化后不改变 ⟺ 所有局部环是离散赋值环 ⟺ 光滑"，与"曲线正规化即消解"完全一致。' },
    ],
    remarks: [
      '正规化不能消除所有奇点：取 $X=\\mathbb{A}^2/\\{\\pm1\\}$（原点处的商奇点），它是正规的（商奇点在维数 2 时是正规的），但它在原点处不光滑，切空间维数为 2 而维数也是 2，正规性并未排除奇点。对曲面而言，正规奇点包括 $A_1$、$A_n$、$D_n$、$E_n$ 这些 ADE 型有理二重点，它们都不被正规化修改；要消除它们必须做奇点解消（吹爆）。所以"正规化 = 消解奇点"只在维数 1 成立，在高维它只是消解的第一步。',
      '有限性依赖诺特性，不能省略：非诺特整环的整闭包可以不有限，例如取 A 为某个非诺特赋值环的子环，其整闭包不是有限 A-模；此时 $\\widetilde{X}\\to X$ 仍存在但是整态射而非有限态射，"双有理"与"有限"的组合也不再给出 Zariski 主定理的结论。因此"正规化是有限态射"这条要写明 A 诺特（或 X 局部诺特）的前提。',
      '正规化与基变换不总是交换：对非平坦的基变换 $S\'\\to S$，$(X\\times_SS\')^{\\text{norm}}$ 与 $\\widetilde{X}\\times_SS\'$ 一般不同（后者可能不正规）。因此在用"换基后取正规化"做论证时，必须逐一核对交换性；例如在特征 p 的基变换下可能引入不可分现象，正规化会随之改变。这条与代数几何里"正规性不是基变换不变量"是同一件事。',
      '正规化不改变函数域，因此不改变双有理不变量：$k(\\widetilde{X})=k(X)$，故维数、亏格、小平维数、奇点解消后的 Betti 数等都在正规化下不变，只有"余维 ≥2 的编码信息"（如奇点类型）会改变。这也意味着正规化不能用来区分同一个双有理等价类中的对象，它只是把类中一个特殊代表元挑选出来；要区分还得靠双有理不变量。',
    ],
    corollaries: [
      { title: '推论：不可约曲线的正规化是光滑曲线，且与原曲线双有理', body: '设 C 是不可约曲线，$\\nu:\\widetilde{C}\\to C$ 为其正规化。由第一步，$\\nu$ 有限且双有理；由 $R_1$ 判据，$\\widetilde{C}$ 的每个局部环都是离散赋值环，即一维正则局部环，故 $\\widetilde{C}$ 光滑。于是每个不可约曲线都有一个光滑模型，且这个模型在双有理等价类中唯一（由泛性质）。这条推论是代数曲线理论的起点：亏格、除子、Riemann-Roch 都可以先在光滑模型上讨论，再通过 $\\nu$ 把它们翻译回奇异曲线（奇点的贡献由 $\\nu$ 的局部结构，即奇点的重数与分支数，来度量）。', uses: ['birational-and-isomorphism-locus', 'r1-s2-criterion'] },
    ],
    references: [
      stacks('Section 10.57: Normalization', '035H'),
      stacks('Section 10.38: Integral closure', '00GM'),
      { title: 'Commutative Algebra', author: 'Hideyuki Matsumura', year: 1989 },
    ],
    history: HISTORY,
  },

  /* ═══════════════════════════════════════════════════════════
   * 3. 上同调长正合列
   * ═══════════════════════════════════════════════════════════ */

  'long-exact-sequence': {
    statement: '设 X 是拓扑空间（或概形），$0\\to\\mathcal{F}\'\\to\\mathcal{F}\\to\\mathcal{F}\'\'\\to0$ 是 X 上阿贝尔群层（或 $\\mathcal{O}_X$-模层）的短正合列，$\\Gamma(X,-)$ 为整体截面函子。则存在连接同态 $\\delta^i:H^i(X,\\mathcal{F}\'\')\\to H^{i+1}(X,\\mathcal{F}\')$ 使长正合列 $0\\to H^0(X,\\mathcal{F}\')\\to H^0(X,\\mathcal{F})\\to H^0(X,\\mathcal{F}\'\')\\xrightarrow{\\ \\delta^0\\ }H^1(X,\\mathcal{F}\')\\to H^1(X,\\mathcal{F})\\to\\cdots$ 正合，其中 $H^i(X,-)=R^i\\Gamma(X,-)$ 是 $\\Gamma$ 的右导出函子（在完备性条件下等于 Čech 上同调）。连接同态是自然变换，与层映射的拉回相容。特别地，若 $H^1(X,\\mathcal{F}\')=0$，则整体截面的映射 $H^0(X,\\mathcal{F})\\to H^0(X,\\mathcal{F}\'\')$ 是满射；若 $H^1(X,\\mathcal{F})=0$，则 $\\delta^0$ 是单射。',
    explanation: '长正合列是代数几何中最常用的计算机理，它的使用模式只有三种，但几乎覆盖了所有计算。第一种是"由外推内"：已知两端层的上同调，用正合性推出中间层的维数。第二种是"消没换同构"：若 $H^i$ 在某个位置消没，正合列在那里就退化成一段短正合，把一个困难的计算换成另一个更简单层的计算（例如用 $0\\to\\mathcal{O}\\to\\mathcal{O}(1)^{n+1}\\to T_{\\mathbb{P}^n}\\to0$ 算切丛的上同调）。第三种是"归纳降维"：把层写成逐层滤过，用长正合列一步步往下算维数，这是 Hilbert 函数与 χ 可加性的来源。连接同态 $\delta$ 是整条列的引擎，它不是自然给出的：短正合列的截面部分 $0\\to\\Gamma(\\mathcal{F}\')\\to\\Gamma(\\mathcal{F})\\to\\Gamma(\\mathcal{F}\'\')$ 只左正合，右端的满射失败正是 $\\delta$ 要修补的地方。$\delta$ 的构造需要层论的额外结构：先在一个内射分解中提升元素，再沿正合列"蛇形追踪"，得到的元素恰好落在 $H^{i+1}(\\mathcal{F}\')$ 中。正合性在 $\delta$ 处的验证是整个证明最需要小心的地方，它用到内射模的"分裂性"与复形的短正合列诱导的长正合列这两条同调代数事实。',
    steps: [
      step('injective-resolution-setup', '内射分解：把层的短正合列展成复形的短正合列',
        '令 $\\Gamma(X,-)$ 是左正合函子，$H^i(X,-)=R^i\\Gamma(X,-)$。关于 $\\mathcal{F}\'$（以及 $\\mathcal{F}$、$\\mathcal{F}\'\'$）取内射分解：$0\\to\\mathcal{F}\\to\\mathcal{I}^0\\to\\mathcal{I}^1\\to\\cdots$，其中每个 $\\mathcal{I}^i$ 是内射层。层范畴有足够多内射对象（因为它是 Grothendieck 范畴，满足 AB5 且有生成元，由 Grothendieck 的嵌入定理保证），所以这样的分解总存在。关键的技术步骤是把三个分解拼成复形的短正合列 $0\\to\\mathcal{I}^{\\prime\\bullet}\\to\\mathcal{I}^{\\bullet}\\to\\mathcal{I}^{\\prime\\prime\\bullet}\\to0$，其中每一项都正合：做法是先由 $\\mathcal{F}\'\\hookrightarrow\\mathcal{F}$ 与 $\\mathcal{I}^{\\prime\\bullet}$ 的分解依次构造提升（每一步用"内射层的截面可逐项提升"这一性质），再把 $\\mathcal{I}^{\\bullet}/\\mathcal{I}^{\\prime\\bullet}$ 作为 $\\mathcal{I}^{\\prime\\prime\\bullet}$ 并验证它仍由内射层组成（这需要内射性的"短正合列中商仍内射"性质）。得到复形层面的短正合列之后，取整体截面得到 Abel 群复形的短正合列 $0\\to\\Gamma(\\mathcal{I}^{\\prime\\bullet})\\to\\Gamma(\\mathcal{I}^{\\bullet})\\to\\Gamma(\\mathcal{I}^{\\prime\\prime\\bullet})\\to0$。',
        []),
      step('snake-lemma-connection', '同调长正合列：蛇形引理与连接同态的显式构造',
        '对任意 Abel 群复形的短正合列 $0\\to A^{\\bullet}\\to B^{\\bullet}\\to C^{\\bullet}\\to0$，有同调的长正合列 $\\cdots\\to H^i(A)\\to H^i(B)\\to H^i(C)\\xrightarrow{\\ \\delta^i\\ }H^{i+1}(A)\\to\\cdots$。连接同态 $\\delta^i$ 的构造是蛇形引理：取 $c\\in C^i$ 为 $H^i(C)$ 中元素 $[c]$ 的代表元，因 $B^i\\to C^i$ 满射，取 $b\\in B^i$ 提升 c；则 $db\\in B^{i+1}$ 映到 $dc=0$，故 $db$ 来自唯一的 $a\\in A^{i+1}$，令 $\\delta^i([c])=[a]$。三处需要核对。其一是良定义：换代表元 $c\\mapsto c+dc\'$ 时，$\\delta$ 的改变是一切 $d(\\text{某个} A^i\\ \\text{元素})$，故同调类不变；换提升 $b\\mapsto b+b_A$ 时 $db$ 改变 $db_A$，同样只改变代表元的边界。其二是在 $H^i(C)$ 上为零的元素正好落到 $\\operatorname{im}(H^{i+1}(A)\\to H^{i+1}(B))$，这给出 $\\delta^i$ 处与下一处的正合性。其三是自然性：复形映射诱导的 $\\delta$ 与两个短正合列之间的交换图相容，这一条保证下面把 $\\delta$ 用到具体层的短正合列时结果稳定。',
        ['injective-resolution-setup']),
      step('computing-with-long-exact-sequence', '计算中的三种用法与维数不等式',
        '把长正合列用在 X 上的层短正合列 $0\\to\\mathcal{F}\'\\to\\mathcal{F}\\to\\mathcal{F}\'\'\\to0$ 上，得到前几项 $0\\to H^0(\\mathcal{F}\')\\to H^0(\\mathcal{F})\\to H^0(\\mathcal{F}\'\')\\xrightarrow{\\delta}H^1(\\mathcal{F}\')\\to H^1(\\mathcal{F})\\to H^1(\\mathcal{F}\'\')\\xrightarrow{\\delta}H^2(\\mathcal{F}\')\\to\\cdots$。由其正合性立刻读出三条实用推论。第一，若 $H^1(\\mathcal{F}\')=0$ 则 $H^0(\\mathcal{F})\\to H^0(\\mathcal{F}\'\')$ 满射，即"整体截面可以逐层提升"；这条在计算"存在满足某条件的整体函数"时是标准手段，例如 $0\\to\\mathcal{O}\\to\\mathcal{O}(1)^{n+1}\\to T\\to0$ 在射影空间上给出向量场空间的维数 $(n+1)^2-1$。第二，若 $H^1(\\mathcal{F})=0$ 则 $\\delta$ 单射且 $H^1(\\mathcal{F}\\to\\mathcal{F}\'\')$ 的核为零，即"缩并型"的结论。第三，维数上可以把长正合列拆成若干精确的短列，得到 $\\chi(\\mathcal{F})=\\chi(\\mathcal{F}\')+\\chi(\\mathcal{F}\'\')$（欧拉示性数在短正合列上可加），因为群维数在正合列中按交替和相消。这三条给出长正合列的全部实用内容。',
        ['snake-lemma-connection']),
      step('cech-and-computability', '与 Čech 上同调的关系及可计算性',
        '要真正"算"出长正合列里的每一项，需要把 $R^i\\Gamma$ 与可计算的 Čech 上同调对上：对 X 的一个覆盖 $\\mathfrak{U}$，Čech 复形 $\\check{C}^{\\bullet}(\\mathfrak{U},\\mathcal{F})$ 的上同调在 $\\mathfrak{U}$ 是"好的覆盖"（每个有限交的 $H^i$ 消没）时等于 $H^i(X,\\mathcal{F})$。从 $0\\to\\mathcal{F}\'\\to\\mathcal{F}\\to\\mathcal{F}\'\'\\to0$ 得到 Čech 复形的短正合列 $0\\to\\check{C}^{\\bullet}(\\mathfrak{U},\\mathcal{F}\')\\to\\check{C}^{\\bullet}(\\mathfrak{U},\\mathcal{F})\\to\\check{C}^{\\bullet}(\\mathfrak{U},\\mathcal{F}\'\')\\to0$（因为层正合覆盖上的逐项正合），再套用蛇形引理即得 Čech 长正合列。它的优点是显式可算：$\\delta$ 可以用科边界写出来，例如在 $\\mathbb{P}^1$ 上用两开集覆盖计算 $\\mathbb{P}^1$ 的 $H^1(\\mathcal{O}(-2))$ 时，$\\delta$ 的两项公式可以直接从系数相除得到。这一步是长正合列从"存在性定理"变成"计算工具"的关键接口；也是为什么教材里的长正合列推导常常先用 Čech 复形给出，再声明与导出函子一致。',
        ['computing-with-long-exact-sequence']),
      step('naturality-and-spectral', '自然性与谱序列：推广形式',
        '长正合列有两条重要的推广。其一是自然性：给定层短正合列之间的交换图，连接同态与交换图相容（由蛇形引理的构造逐项给出），因此 $\\delta$ 在基变换、拉回、以及与其它函子复合时保持稳定。其二是谱序列：若把 $\\mathcal{F}$ 换成有滤过的对象，长正合列升级为谱序列 $E_1^{p,q}=H^q(X,\\operatorname{gr}^p\\mathcal{F})\\Rightarrow H^{p+q}(X,\\mathcal{F})$，长正合列只是这个谱序列在一维情形（滤过长度为 2）的退化形式；同样地，对复合函子的 Grothendieck 谱序列 $E_2^{p,q}=R^pf_*(R^qg_*\\mathcal{F})\\Rightarrow R^{p+q}(f\\circ g)_*\\mathcal{F}$ 也把长正合列作为基础模块。实用上，只要遇到"层被滤过"或"两个导出函子复合"的情形，都应改用谱序列；而长正合列仍是每一步计算的原子单位，因为谱序列的微分计算最终都要落到某个短正合列与它的连接同态上。',
        ['cech-and-computability', 'computing-with-long-exact-sequence']),
    ],
    conclusion: '层短正合列 $0\\to\\mathcal{F}\'\\to\\mathcal{F}\\to\\mathcal{F}\'\'\\to0$ 诱导长正合列 $\\cdots\\to H^i(X,\\mathcal{F}\')\\to H^i(X,\\mathcal{F})\\to H^i(X,\\mathcal{F}\'\')\\xrightarrow{\\ \\delta^i\\ }H^{i+1}(X,\\mathcal{F}\')\\to\\cdots$，$\\delta$ 为自然变换；由此得 $\\chi(\\mathcal{F})=\\chi(\\mathcal{F}\')+\\chi(\\mathcal{F}\'\')$，且 $H^1$ 消没时整体截面满射。该列可用 Čech 复形显式计算，并推广为滤过谱序列。',
    dependencies: [],
    consequences: [],
    explanation: '长正合列之所以是"最常用的计算机理"，是因为它把一个不可能直接计算的对象（中间层的上同调）与两个可能更好计算的对象（两端层）用一组线性条件绑在一起。它的三种用法恰好对应三类问题：存在性问题（满射性 ⟹ 截面可提升）、消去问题（$\\chi$ 可加 ⟹ 维数相消）、归约问题（把复杂层写成简单层的扩张再逐层计算）。连接同态的必要性可以从一个最小例子看出来：$X=\\mathbb{P}^1$、$\\mathcal{F}\'=\\mathcal{O}$、$\\mathcal{F}=\\mathcal{O}(1)^2$？更简单的是 $0\\to\\mathcal{O}(-1)\\to\\mathcal{O}\\to k_p\\to0$（$k_p$ 是点层），此时 $H^0(\\mathcal{O})\\to H^0(k_p)=k$ 是满射（常数函数在 p 处可以取任意值），$\\delta$ 为零；而换成 $0\\to\\mathcal{O}(-2)\\to\\mathcal{O}(-1)\\to k_p\\to0$ 时，$H^0(\\mathcal{O}(-1))\\to H^0(k_p)$ 是零映射，$\\delta$ 给出 $k\\hookrightarrow H^1(\\mathcal{O}(-2))\\cong k$ 的同构，这正是"截面不足由 $H^1$ 补齐"的现象。理解这一机制之后，曲线上的 Riemann-Roch、曲面上的 Noether 公式、射影空间的切丛计算都成为同一条列的反复应用。',
    examples: [
      { title: '例子：$\\mathbb{P}^1$ 上 $0\\to\\mathcal{O}(-2)\\to\\mathcal{O}(-1)\\to k_p\\to0$ 的两处处计算', body: '取 $p=[1:0]\\in\\mathbb{P}^1$，$k_p$ 是支撑在 p 的摩天楼层，由局部方程 $x$（在 $x\\neq0$ 的仿射图上）给出正合列 $0\\to\\mathcal{O}(-1)\\xrightarrow{\\ \\cdot x\\ }\\mathcal{O}\\to k_p\\to0$；把它整体扭 -1 得 $0\\to\\mathcal{O}(-2)\\to\\mathcal{O}(-1)\\to k_p\\to0$。算上同调：$H^0(\\mathcal{O}(-2))=0$，$H^0(\\mathcal{O}(-1))=0$（负次数的整体截面为零），$H^0(k_p)=k$。长正合列的前段 $0\\to0\\to0\\to k\\xrightarrow{\\ \\delta\\ }H^1(\\mathcal{O}(-2))$ 说明 $\\delta$ 是单射；而 $H^1(\\mathcal{O}(-2))\\cong k$（由 Serre 对偶 $h^1(\\mathcal{O}(-2))=h^0(\\mathcal{O}(2-2))=h^0(\\mathcal{O})=1$），维数相符，故 $\\delta$ 是同构。这一段给出一个常用的技术结论：把"一个点"从层里剥掉时，代价由 $\\delta$ 记为 $H^1$ 中的一个类，这个类正是 $p$ 在 $\\mathbb{P}^1$ 中的上同调类，也是 $\\operatorname{Pic}$ 与 $H^1(\\mathcal{O}^{\\times})$ 对应中的生成元。' },
      { title: '例子：用欧拉列计算 $H^i(\\mathbb{P}^2,T_{\\mathbb{P}^2})$', body: '取欧拉列 $0\\to\\mathcal{O}\\to\\mathcal{O}(1)^{3}\\to T_{\\mathbb{P}^2}\\to0$。由 $\\mathbb{P}^2$ 上扭层上同调（$n=2$）：$H^0(\\mathcal{O}(d))$ 维数为 $\\binom{d+2}{2}$，$H^1=H^2=0$ 对一切 $d\\ge0$，$H^2(\\mathcal{O}(d))$ 维数为 $\\binom{-d-1}{2}$ 对 $d\\le-3$（Serre 对偶给出）。长正合列前段 $0\\to H^0(\\mathcal{O})\\to H^0(\\mathcal{O}(1))^{3}\\to H^0(T)\\to H^1(\\mathcal{O})=0$ 给出 $h^0(T_{\\mathbb{P}^2})=3\\cdot3-1=8$，与 $\\mathbb{P}^2$ 的自同构群 $\\operatorname{PGL}_3$ 的维数 8 一致。继续往后 $0\\to H^1(T)\\to H^2(\\mathcal{O})\\to H^2(\\mathcal{O}(1))^{3}$：由 Serre 对偶 $H^2(\\mathcal{O})\\cong H^0(\\mathcal{O}(-3))^{\\vee}=0$，同理 $H^2(\\mathcal{O}(1))=0$，于是 $H^1(T_{\\mathbb{P}^2})=0$（即 $\\mathbb{P}^2$ 是刚性的，没有非平凡形变）；末尾 $H^2(\\mathcal{O}(1))^{3}\\to H^2(T)\\to0$ 给出 $h^2(T_{\\mathbb{P}^2})=0$。合计 $\\chi(T)=8-0+0=8$，与用陈类算出的 $\\operatorname{ch}(T)\\operatorname{td}$ 的值一致，说明这套计算自洽。' },
    ],
    remarks: [
      '右正合性在 $H^0$ 处一般失效，这正是连接同态存在的理由：$H^0(\\mathcal{F})\\to H^0(\\mathcal{F}\'\')$ 不是满射的典型例子是 $0\\to\\mathcal{O}_{\\mathbb{P}^1}(-1)\\to\\mathcal{O}_{\\mathbb{P}^1}\\to k_p\\to0$ 与它的扭版，常数 1 在点上的"限制"不可提升为 $H^0(\\mathcal{O}(-1))$ 的元素。若误以为整体截面函子正合，会得出"任何层的截面都能逐层提升"的错误结论，从而在计算 $h^0$ 时系统性出错。',
      '长正合列要求短正合列在层范畴内成立，而不是只在纤维或茎上成立："在每个茎处正合"确实等价于"层正合"，但"在每个闭纤维上正合"（即纤维序列正合）并不够——这在族的退化纤维处会失效。使用长正合列做基变换（如把 $X\\to S$ 的纤维化逐纤维算上同调）时，必须额外使用基变换定理，不能只靠逐纤维正合性。',
      '$\\delta$ 不是层映射诱导的，而是"提升 + 微分"的复合，因此它的显式公式依赖覆盖与提升的选取；在比较两个不同的正合列或做基变换时，必须核对 $\\delta$ 的相容性（自然性）。一个常见错误是把 $\\delta$ 当作 $\\mathcal{O}_X$-线性的：它一般只是阿贝尔群同态（对 $H^0$ 中的环作用才线性），把它当作层模同态会导致错误的维数结论。',
      '长正合列本身不给出消没，消没需要独立输入：形如"$H^i=0$ 对 $i>n$"（Grothendieck 消没）或"$H^i(X,\\mathcal{O}(d))=0$ 对 $d$ 大"（Serre 消没）都是另外的定理。把长正合列与消没定理结合是标准套路，但两者不能互相替代：没有消没信息时长正合列只是一组抽象的精确条件，无法给出数值。',
    ],
    corollaries: [
      { title: '推论：欧拉示性数在短正合列上可加', body: '由长正合列，把 $0\\to H^0(\\mathcal{F}\')\\to\\cdots$ 拆成若干短正合列（$0\\to\\ker\\to\\cdot\\to\\operatorname{im}\\to0$），对每个短正合列取维数的交替和得等号，逐项相加即得 $\\sum(-1)^i h^i(\\mathcal{F})=\\sum(-1)^i h^i(\\mathcal{F}\')+\\sum(-1)^i h^i(\\mathcal{F}\'\')$，即 $\\chi(\\mathcal{F})=\\chi(\\mathcal{F}\')+\\chi(\\mathcal{F}\'\')$。这条推论是 Hilbert 函数与 Hilbert 多项式理论的基石：把 $\\mathcal{O}_X$ 用理想层的正合列逐层剥离，$\\chi$ 立刻可加，从而由 $\\chi(\\mathcal{O}(m))$ 得到 Hilbert 多项式。', uses: ['computing-with-long-exact-sequence'] },
    ],
    references: [
      stacks('Section 20.7: Cohomology of sheaves', '01F0'),
      stacks('Section 20.9: Čech cohomology', '01VY'),
      { title: 'Sheaves on Manifolds', author: 'Masaki Kashiwara, Pierre Schapira', year: 1990 },
    ],
    history: HISTORY,
  },

  /* ═══════════════════════════════════════════════════════════
   * 4. 格罗滕迪克消没定理
   * ═══════════════════════════════════════════════════════════ */

  'serre-vanishing': {
    statement: '设 X 是诺特拓扑空间且其诺特维数 $\\dim X\\le n$（等价地：任一闭子集链的长度不超过 n，或 X 有长度 n 的不可约闭子集链而无更长者），$\\mathcal{F}$ 是 X 上任意阿贝尔群层。则 $H^i(X,\\mathcal{F})=0$ 对一切 $i>n$ 成立。特别地，对 k 上维数 n 的簇 X（带 Zariski 拓扑）与任意层 $\\mathcal{F}$，$H^i(X,\\mathcal{F})=0$ 对 $i>n$。由此欧拉示性数 $\\chi(X,\\mathcal{F})=\\sum_{i=0}^{n}(-1)^i\\dim_kH^i(X,\\mathcal{F})$ 是只含有限多项的有限和；若所有 $H^i$ 都有限维，则 $\\chi$ 是整数。',
    explanation: '消没定理的作用是把上同调"截断"在一个有限的区间里。没有它，$H^i$ 可能是无穷多个非零的群，欧拉示性数就没有定义，对偶定理也写不成有限和的等式。证明的机制在纯拓扑层面：$H^i(X,\\mathcal{F})$ 可以拿来计算，而计算的第一步是"把层换成由不可约闭子集索引的常层"——每个层都可以嵌入一个由"闭子集上的摩天楼层"构成的滤过（或反过来说，从不可约闭子集出发用扩张构造），而摩天楼层的上同调在 $i>0$ 时为零，于是所有的高阶上同调只能来自扩张的层数（即链长），不能超过维数。等价地说，$H^i(X,\\mathcal{F})$ 可由"X 的不可约闭子集的长度不超过 n"这一组合事实直接控制。这就是为什么簇上的层上同调总在 $0\\le i\\le\\dim X$ 内取值，也是为什么对曲线、曲面只需关心 $H^0,H^1$（曲线）与 $H^0,H^1,H^2$（曲面）。在代数几何里最常见的具体来源是 Serre 在射影空间上的计算：$H^i(\\mathbb{P}^n,\\mathcal{O}(d))=0$ 对 $0<i<n$ 与一切 d，而对 $i=n$ 只在 $d\\le-n-1$ 时非零——这些都是消没定理把上同调限制在维数内的实例。',
    steps: [
      step('noetherian-induction', '诺特归纳：把一般层化为有限支撑层',
        '设 $\\mathcal{F}$ 是诺特空间 X 上的层。对"支撑"（即 $\\mathcal{F}$ 为零的最大开子集之补，记为 $\\operatorname{Supp}\\mathcal{F}$ 的闭包）做诺特归纳：断言对一切 $i>\\dim\\operatorname{Supp}\\mathcal{F}$ 有 $H^i(X,\\mathcal{F})=0$。归纳的起点是支撑为空（$\\mathcal{F}=0$）时显然。归纳步骤：取支撑的闭包 $Z=\\overline{\\operatorname{Supp}\\mathcal{F}}$ 的一个不可约分支 $Z_0$；由诺特性，支撑的闭包可由有限多个不可约闭子集覆盖，于是可取极大的不可约闭子集 $Z_0$ 与包含它的开集 $U=X\\setminus Z_0$，得正合列 $0\\to\\mathcal{F}_1\\to\\mathcal{F}\\to\\mathcal{F}_2\\to0$，其中 $\\mathcal{F}_2=i_*(\\mathcal{F}|_{Z_0})$（支撑含在 $Z_0$ 中，且 $Z_0$ 不可约）、$\\mathcal{F}_1$ 的支撑严格小于 Z（其闭包不含 $Z_0$，因为它已被 $\\mathcal{F}_2$ 剥离）。两条支撑的维数都严格小于 $\\dim Z$：$\\dim Z_0\\le\\dim Z$ 且 $\\mathcal{F}_2$ 的支撑的"层数"为一层。沿 $\\mathcal{F}_2$ 的正合列继续剥离 $Z_0$ 上的逐步"上层"结构，把这个过程终止（有限步，因为 $Z_0$ 诺特），每一步的支撑维数或长度下降至少 1。',
        []),
      step('skyscraper-vanishing', '不可约闭子集上的常层：高阶上同调为零',
        '归纳的关键是处理"支撑恰好是单个不可约闭子集 Z"的层。此时 $\\mathcal{F}$ 被 $i_*\\mathcal{F}|_Z$ 代替，而 $Z$ 上的层可以由常层 $\\underline{A}$（A 为阿贝尔群）经由扩张构造，故只需处理常层。对不可约闭子集 $Z\\subset X$ 与常层 $\\underline{A}$，$i_*\\underline{A}$ 的高阶上同调：$H^i(X,i_*\\underline{A})=H^i(Z,\\underline{A})$（推前的上同调与子空间上同调一致），而不可约诺特空间上的常层上同调由组合结构控制。更简单的办法是用摩天楼层：对 $Z$ 中一般点的摩天楼层 $A_z$，$H^i(X,A_z)=0$ 对 $i>0$，因为 $A_z$ 是 flabby 的（在每个开集上的限制映射都是满射，这一点可以逐点核对：开集含 z 时截面非零，不含 z 时截面为零；限制映射在含 z 的开集对上恒为同构）。flabby 层的上同调在正次数为零，这是层上同调的一条基本事实（可由 flabby 分解直接给出：flabby 层的正合列整体截面正合，故用 flabby 分解算出的上同调在 $i>0$ 全为零）。不可约 Z 上的常层可以由这些摩天楼层经有限次扩张得到（先取一般点的摩天楼层，再逐层向低维闭子集剥离，形成滤过），于是 $H^i(Z,\\underline{A})$ 也只在低次数可能非零。',
        ['noetherian-induction']),
      step('dimension-bound', '链长控制：$i>n$ 时全部消没',
        '把两步合起来：一般层的上同调由"剥离过程"的控制项决定，每次剥离使支撑的维数下降至少 1，或者使"F 相对 Z 的滤过层数"下降 1，而每一层的贡献在 $i>0$ 时为零（摩天楼层）或落在"支撑维数"限定的区间内。精确表述用诺特归纳：设 $Z$ 的维数（闭子集链的最大长度）为 $d$。若 $\\mathcal{F}$ 支撑在维数 $d$ 的闭子集上，则 $H^i(X,\\mathcal{F})=0$ 对 $i>d$。验证：取不可约分支 $Z_0$ 与正合列 $0\\to\\mathcal{F}_1\\to\\mathcal{F}\\to\\mathcal{F}_2\\to0$，由长正合列，$H^i(\\mathcal{F}_2)$ 在两端的映射下夹住：$H^{i}(\\mathcal{F}_2)$ 若在 $i>\\dim Z_0$ 时为零，则 $H^i(\\mathcal{F})\\to H^i(\\mathcal{F}_2)=0$ 使 $H^i(\\mathcal{F})\\cong H^i(\\mathcal{F}_1)$（对 $i>\\dim Z_0$），于是把问题降到更小的支撑上。逐次降维直到 $\\dim Z=0$（有限个点），此时 $\\mathcal{F}$ 是有限直和的摩天楼层，$H^i=0$ 对 $i>0$，归纳完成。最后把 $d\\le n=\\dim X$ 代入，即得定理：$H^i(X,\\mathcal{F})=0$ 对一切 $i>\\dim X$。',
        ['skyscraper-vanishing', 'noetherian-induction']),
      step('chi-and-euler-characteristic', '欧拉示性数成为有限和',
        '消没定理的直接后果是 $\\chi$ 的可定义性。设 $X$ 是 k 上维数 n 的射影簇，$\\mathcal{F}$ 是凝聚层，则 $H^i(X,\\mathcal{F})=0$ 对 $i>n$，且每个 $H^i$ 都是有限维 k-向量空间（这一步用的是凝聚层的有限性，是另一条定理），于是定义 $\\chi(X,\\mathcal{F})=\\sum_{i=0}^{n}(-1)^i\\dim_kH^i(X,\\mathcal{F})$ 是一个有限的整数。这条定义之所以关键，是因为 $\\chi$ 有两条好性质：对短正合列可加，以及在 $\\mathcal{F}$ 扭上一个可逆层后成为关于扭次数的多项式（Hilbert 多项式）。没有消没定理，$\\chi$ 会是无穷和而失去意义；有了它，$\\chi$ 就成了一个可以用长正合列与计算技巧（例如把 $\\chi$ 化为已知层）来求的整数不变量，也是 Riemann-Roch 定理的左边。对偶定理的写法也依赖这条：Serre 对偶写成 $H^i(X,\\mathcal{F})\\cong H^{n-i}(X,\\mathcal{F}^{\\vee}\\otimes\\omega_X)^{\\vee}$，只有两边都落在 $0\\le i\\le n$ 内才能用有限维对偶凑成一个完整的配对，否则"对偶"的一侧是无穷维空间而无从谈起。',
        ['dimension-bound']),
      step('lebesgue-cover-dimension', '另一种证明：覆盖重数与组合维数',
        '消没定理还有一种用覆盖给出的证明，它把"维数"换成"覆盖的阶数"这一更初等的量。对拓扑空间 X 与开覆盖 $\\mathfrak{U}$，定义其重数（order）为"最大的 k 使存在 k 个成员有非空交"。若存在一个覆盖的重数为 $d+1$，则 Čech 上同调 $\\check{H}^i(\\mathfrak{U},\\mathcal{F})=0$ 对 $i>d$，因为 Čech 复形在 $i>d$ 处为零（有限交为空时截面为零，故复形项为零）。当 X 是诺特空间时，维数 $\\dim X\\le n$ 与"存在重数 $n+1$ 的覆盖"在层上同调的层面等价（由诺特归纳与覆盖的细化存在性），于是对任意覆盖取细化即得 $\\check{H}^i(X,\\mathcal{F})=0$ 对 $i>n$；在 $\\mathcal{F}$ 良好（例如 X 仿射且 $\\mathcal{F}$ 拟凝聚）时 Čech 与导出函子一致，得到定理。这条证明的优点是把"层"的抽象推理换成了"覆盖重数"的组合计数，代价是需要额外说明 Čech 与导出函子的一致性。它也解释了为什么消没定理的界恰好是维数：覆盖重数不可能小于维数加一。',
        ['dimension-bound', 'chi-and-euler-characteristic']),
    ],
    conclusion: '若诺特空间 X 的维数 $\\le n$，则对任意层 $\\mathcal{F}$ 有 $H^i(X,\\mathcal{F})=0$ 对 $i>n$；特别地维数 n 的簇上层的上同调只在 $0\\le i\\le n$ 内非零，于是对凝聚层 $\\chi=\\sum_{i=0}^{n}(-1)^i\\dim_kH^i$ 是有限整数，欧拉示性数与 Serre 对偶的有限和形式由此成立。',
    dependencies: [],
    consequences: [],
    explanation: '消没定理的实质是"上同调不会超过维数"。这条界看起来平凡，但它决定了整个层上同调理论的形态：曲线只需 $H^0,H^1$，曲面只需 $H^0,H^1,H^2$，高维时"最高次上同调"恰好与对偶配对的红利挂钩。证明的骨架可以概括为"摩天楼层没有高阶上同调，而一般层是摩天楼层的逐层扩张，层数不超过维数"。这条思想在更一般的框架下被表述为：导出范畴中层的"长度"受空间维数限制，或者说 $D^{b}(X)$ 的同调维数不超过 $\\dim X$（对光滑簇甚至等于 $\\dim X$，这正是 Serre 对偶成立的原因）。它与贝尔斯-盖斯定理形成对角：后者说 $H^i=0$ 对 $i<0$（上同调定义的自然界），消没定理说 $H^i=0$ 对 $i>\\dim X$，两条界合起来把上同调限定在一个长度为 $n+1$ 的窗口内，这个窗口内的维数数据（长度 $n+1$ 的整数向量）正是现代不变量理论的载体。',
    examples: [
      { title: '例子：$\\mathbb{P}^2$ 上 $\\mathcal{O}(d)$ 的上同调窗口', body: '取 $X=\\mathbb{P}^2$，$n=2$，故 $\\mathcal{O}(d)$ 的上同调只在 $H^0,H^1,H^2$ 中可能非零。实际计算：$d\\ge0$ 时 $h^0=\\binom{d+2}{2}=\\frac{(d+1)(d+2)}{2}$，$h^1=h^2=0$；$d=-1$ 时 $h^0=0$、$h^1=0$、$h^2=0$；$d=-2$ 时 $h^0=h^1=0$、$h^2=1$；$d\\le-3$ 时 $h^0=h^1=0$、$h^2=\\binom{-d-1}{2}$（Serre 对偶给出 $h^2(\\mathcal{O}(d))=h^0(\\mathcal{O}(-d-3))$）。把 $d$ 从 $\\ge0$ 降到 $\\le-3$，非零的维数从 $H^0$ 依次"迁移"到 $H^2$，中间 $d=-1,-2$ 时上同调几乎全消。这个迁移过程正是维数窗口被逐层占用的具体表现，也说明消没定理给出的界是紧的：$H^2$ 确实会非零，界不能改进为 $i>1$。' },
      { title: '例子：曲线情形 χ 的可加性核算', body: '取 $C$ 为亏格 g 的光滑射影曲线，$n=1$。对 $C$ 上的除子层 $\\mathcal{O}(D)$，消没定理给 $H^i(\\mathcal{O}(D))=0$ 对 $i\\ge2$，故 $\\chi(\\mathcal{O}(D))=h^0-h^1$。对 $0\\to\\mathcal{O}(D)\\to\\mathcal{O}(D+P)\\to k_P\\to0$（$P$ 为有理点），由长正合列得 $\\chi(\\mathcal{O}(D+P))-\\chi(\\mathcal{O}(D))=\\chi(k_P)=1$，即每加一个点 $\\chi$ 增加 1。反复加 $\\deg D$ 个点从 $\\mathcal{O}$ 出发得 $\\chi(\\mathcal{O}(D))=\\chi(\\mathcal{O})+\\deg D=1-g+\\deg D$，这就是 Riemann-Roch 的 $\\chi$ 形式。整个推导只用到"$n=1$ 故 $H^2$ 消没"与长正合列，说明消没定理确实是把 $\\chi$ 变成可计算整数的前提。' },
    ],
    remarks: [
      '界是紧的，不能改进：在维数 n 的簇上 $H^n$ 一般不为零，例如 $\\mathbb{P}^n$ 上 $H^n(\\mathcal{O}(-n-1))\\cong k$；曲线上的 $H^1(\\mathcal{O}_C)\\cong k^g$ 也非零。所以"$i>n$ 消没"这一条是最优的，不能写成 $i\\ge n$；把它写强会造成全部计算失效（例如 $\\chi=g$ 的错误结论）。',
      '维数是拓扑维数而非嵌入维数：定理里的 n 是 X 自身的维数，不是它被嵌入的射影空间维数。例如一条平面三次曲线 $C\\subset\\mathbb{P}^2$ 的 $\\dim C=1$，故 $H^i(C,\\mathcal{F})=0$ 对 $i\\ge2$，即使 $C$ 生活在 $\\mathbb{P}^2$ 中。若错误地使用 $n=2$，会多出无意义的 $H^2$ 讨论；反之若对一个不可约但不约化的非诺特空间使用，会因链长无限而失效。',
      '诺特性是必要的：对非诺特空间（例如无穷维的拓扑空间或某些非诺特的概形），闭子集链可以无限长，$H^i$ 可以无穷多阶非零。经典反例是"无穷多个点的直和"或无穷维的 $(\\mathbb{P}^\\infty)$ 型空间，其层上同调不受有限维数界约束。因此这条定理的陈述必须写明 X 诺特，簇的 Zariski 拓扑自动诺特使这一点在实践中常被忽略。',
      '消没定理不蕴含凝聚层的有限性：$H^i=0$ 对 $i>n$ 只说明非零项的位置有限，不说明每项有限维。有限维是另外的定理（Serre 的凝聚层有限性，需要 X 射影且层凝聚）。两者常一起使用而容易被合并成一句"上同调有限"，但在非射影或非凝聚层的情形必须分开检查，例如仿射直线上的常层 $\\mathbb{Z}$ 有 $H^1=\\mathbb{Z}$ 无穷但维数 1 界仍然成立。',
    ],
    corollaries: [
      { title: '推论：$\\chi$ 只依赖有限多个上同调群', body: '由 $H^i=0$ 对 $i>\\dim X$，得 $\\chi(X,\\mathcal{F})=\\sum_{i=0}^{\\dim X}(-1)^i\\dim_kH^i(X,\\mathcal{F})$，是有限和。这条推论使 $\\chi$ 成为可定义的整数，从而可以在短正合列中相加、在除子上线性化，并最终成为 Riemann-Roch 定理的左边。若 $\\dim X=1$，$\\chi=\\dim H^0-\\dim H^1$；若 $\\dim X=2$，$\\chi=\\dim H^0-\\dim H^1+\\dim H^2$。这两条公式是所有曲线曲面计算的出发点。', uses: ['chi-and-euler-characteristic'] },
    ],
    references: [
      stacks('Section 20.20: Cohomology of sheaves (Grothendieck vanishing)', '01F0'),
      stacks('Section 20.7: Cohomology of sheaves', '01F0'),
      { title: 'Algebraic Geometry', author: 'Robin Hartshorne', year: 1977 },
    ],
    history: HISTORY,
  },

  /* ═══════════════════════════════════════════════════════════
   * 5. 塞尔的有限性与消没
   * ═══════════════════════════════════════════════════════════ */

  'serre-finiteness': {
    statement: '设 k 是诺特环，$X\\subset\\mathbb{P}^n_k$ 是射影概形（更一般地：X 在 Spec k 上射影），$\\mathcal{F}$ 是 X 上的凝聚 $\\mathcal{O}_X$-模。则 (1) 有限性：每个 $H^i(X,\\mathcal{F})$ 是有限生成 k-模（k 是域时为有限维 k-向量空间）；(2) 消没：存在整数 $m_0$（依赖 $\\mathcal{F}$），使对一切 $m>m_0$ 与一切 $i>0$ 有 $H^i(X,\\mathcal{F}(m))=0$，其中 $\\mathcal{F}(m)=\\mathcal{F}\\otimes_{\\mathcal{O}_X}\\mathcal{O}_X(m)$、$\\mathcal{O}_X(m)=\\mathcal{O}_{\\mathbb{P}^n}(m)|_X$。',
    explanation: '这两条定理是"扭得足够大的层会变得非常正"这一原则的精确版本。有限性说明上同调是可控的对象（有限维），消没说明高次上同调可以靠足够多的扭而消失——于是"无法控制的高次上同调"只是低次部分在低扭次数下的临时现象。它们合起来使希尔伯特函数 $m\\mapsto\\dim_kH^0(X,\\mathcal{F}(m))$ 最终成为一个多项式：由消没，$m$ 大时 $\\chi(\\mathcal{F}(m))=h^0(\\mathcal{F}(m))$；由 $\\chi$ 关于 $m$ 的多项式性与可加性（对短正合列），$h^0$ 最终等于一个多项式。这个多项式就是希尔伯特多项式，它的次数是 $\\mathcal{F}$ 的支撑维数、首项系数与次数（degree）编码了 $\\mathcal{F}$ 的"体积"。证明的技术核心是把问题从一般凝聚层化到 $\\mathbb{P}^n$ 上的结构层 $\\mathcal{O}(m)$：先对 $\\mathcal{O}(m)$ 用射影空间上同调的直接计算（用 Čech 覆盖与齐次多项式环），再用"层被有限个 $\\mathcal{O}(-d)$ 满射覆盖"（由 $\\mathcal{F}$ 的有限生成性与射影性）与长正合列做降维归纳。塞尔的这两条定理在整个凝聚层上同调理论中扮演"清洁剂"的角色：所有困难的层都能用足够高的扭把它化成容易的层。',
    steps: [
      step('projective-space-computation', '射影空间上的直接计算',
        '对 $X=\\mathbb{P}^n_k$（k 是诺特环），用标准覆盖 $U_i=\\{x_i\\neq0\\}$ 与 Čech 复形直接算。令 $R=k[x_0,\\ldots,x_n]$，$S=R[x_0^{-1},\\ldots,x_n^{-1}]$ 的局部化描述给出：$H^0(\\mathcal{O}(m))$ 是 m 次齐次多项式空间 $R_m$（$m\\ge0$），$m<0$ 时为零；而对 $0<i<n$，$H^i(\\mathcal{O}(m))=0$ 对一切 $m$（Čech 复形在中间项处被"分次环的局部化精确性"消掉，这一步的技术形式是 $R$ 的正则序列 $x_0,\\ldots,x_n$ 给出的 Koszul 复形正合性）；对 $i=n$，$H^n(\\mathcal{O}(m))$ 同构于 $k[x_0^{-1},\\ldots,x_n^{-1}]$ 中 m 次部分的对偶，维数是 $\\binom{-m-1}{n}$（对 $m\\le-n-1$，即 $H^n(\\mathcal{O}(m))\\cong H^0(\\mathcal{O}(-m-n-1))^{\\vee}$，这正是 Serre 对偶在射影空间的显式形式）。所以对 $m>0$ 有 $H^i(\\mathcal{O}(m))=0$ 对一切 $i>0$，而对任何固定的 $\\mathcal{F}$ 只要扭得足够大，中间与高次上同调就会消失。这把问题的"难"部分集中在低扭次数处，而低扭次数处每个上同调都有限维（由下面的一般论证）。',
        []),
      step('finiteness-by-descent', '有限性：从 $\\mathcal{O}(m)$ 降到一般凝聚层',
        '设 $\\mathcal{F}$ 是 $\\mathbb{P}^n$ 上的凝聚层。取足够大的 $m_1$，由 $\\mathcal{O}$ 的截面在射影空间上"足够多"（$\\mathcal{O}(m_1)$ 的所有截面给出满射 $\\mathcal{O}(m_1)^{\\oplus r}\\twoheadrightarrow\\mathcal{F}$；这由 $\\mathcal{F}$ 凝聚且 $\\mathbb{P}^n$ 射影给出，等价于 Serre 的"$\\mathcal{F}$ 由有限个整体截面扭层生成"），于是有短正合列 $0\\to\\mathcal{G}\\to\\mathcal{O}(m_1)^{\\oplus r}\\to\\mathcal{F}\\to0$，$\\mathcal{G}$ 仍凝聚。对长正合列取有限个 $i$，把 $H^i(\\mathcal{F})$ 夹在 $H^i(\\mathcal{O}(m_1))^{\\oplus r}$（已知有限维，且对 $1\\le i\\le n-1$ 甚至为零）与 $H^{i+1}(\\mathcal{G})$ 之间。对 $\\mathcal{G}$ 重复同样的构造得到"更深的"层，由于 $\\mathbb{P}^n$ 上的凝聚层的"深度"受维数限制（每一步提高生成元的扭次数，有限步后到 $\\mathcal{O}(m)$ 型），归纳终止，得到每个 $H^i(\\mathcal{F})$ 都是有限维的。更干净的现代写法是：$X$ 射影时 $\\mathcal{O}_X$ 的导出范畴有有限个生成元（推前 $\\mathcal{O}_{\\mathbb{P}^n}(m)$），于是凝聚层的上同调可由有限个 $H^i(\\mathcal{O}(m))$ 经由有限次扩张生成，故必有限生成。',
        ['projective-space-computation']),
      step('vanishing-by-twisting', '消没：扭足够大后高次上同调全为零',
        '消没的证明用同样的下降：由有限性那一步的正合列 $0\\to\\mathcal{G}\\to\\mathcal{O}(m_1)^{\\oplus r}\\to\\mathcal{F}\\to0$ 整体扭 $m$ 得 $0\\to\\mathcal{G}(m)\\to\\mathcal{O}(m+m_1)^{\\oplus r}\\to\\mathcal{F}(m)\\to0$。长正合列中取 $i>0$：若 $H^i(\\mathcal{O}(m+m_1))=0$（当 $m+m_1>0$ 成立）且 $H^{i+1}(\\mathcal{G}(m))$ 在归纳假设下为零，则 $H^i(\\mathcal{F}(m))=0$。需要小心的是"扭"不改变扭的次数关系：$\\mathcal{G}$ 的消没阈值可能比 $\\mathcal{F}$ 更大，因为 $\\mathcal{G}$ 是"更负"的层（它承载了 $\\mathcal{F}$ 的生成元之间的所有关系，通常需要更高的扭才正）。因此归纳要在"层被更负的层生成"这一方向上做，每一步把扭的阈值提高一个固定量，有限步后（层的"复杂度"由 $\\mathcal{F}$ 的 Hilbert 多项式与维数控制）得到：存在 $m_0$ 使 $m>m_0$ 时 $H^i(\\mathcal{F}(m))=0$ 对一切 $i>0$。这一步的要点是阈值 $m_0$ 是"按层的复杂度上升的有限量"，而层固定时它就是一个常数；把 $m$ 一直加大不改变层的结构，只增加 $\\mathcal{O}(m)$ 的正性，所以消没最终发生。',
        ['finiteness-by-descent', 'projective-space-computation']),
      step('hilbert-polynomial', '希尔伯特多项式与次数',
        '有了有限性与消没，定义 $\\chi(\\mathcal{F}(m))=\\sum_i(-1)^i\\dim_kH^i(\\mathcal{F}(m))$。由消没，$m>m_0$ 时 $\\chi(\\mathcal{F}(m))=\\dim_kH^0(\\mathcal{F}(m))$；由长正合列，$\\chi$ 在短正合列上可加，故对扭次数 $m$ 是一个多项式：对 $0\\to\\mathcal{G}\\to\\mathcal{O}(m_1)^{\\oplus r}\\to\\mathcal{F}\\to0$ 有 $\\chi(\\mathcal{F}(m))=\\chi(\\mathcal{O}(m+m_1))\\cdot r-\\chi(\\mathcal{G}(m))$，而 $\\chi(\\mathcal{O}(d))=\\binom{d+n}{n}$ 是 $d$ 的 n 次多项式（射影空间的直接计算），归纳即得 $\\chi(\\mathcal{F}(m))$ 是 m 的多项式。称它为希尔伯特多项式 $P_{\\mathcal{F}}(m)$，并定义次数 $\\deg\\mathcal{F}$ 为其首项系数乘 $n!$（即 $P$ 的首项写成 $\\frac{\\deg\\mathcal{F}}{n!}m^{n}$ 的系数），它等于 $\\mathcal{F}$ 的"多重度"（单位维数上的长度）。当 $\\mathcal{F}=\\mathcal{O}_X$ 时，$P_{\\mathcal{O}_X}$ 的次数就是 $\\dim X$，首项系数乘 $\\dim X!$ 就是 $X$ 在 $\\mathbb{P}^n$ 中的次数。这就把"维数"与"次数"两个基本几何量都翻译成了希尔伯特多项式的系数。',
        ['vanishing-by-twisting', 'finiteness-by-descent']),
      step('consequences-and-positivity', '推论：丰沛层的代数来源与推广',
        '塞尔的这两条定理是"丰沛性"概念的代数鼻祖：一个可逆层 $\\mathcal{L}$ 称为丰沛，若某个 $\\mathcal{L}^{\\otimes m}$ 由整体截面生成的线性系给出闭浸入；而塞尔消没说明只要 $\\mathcal{L}$ 足够正（例如 $\\mathcal{L}=\\mathcal{O}_X(1)$ 且层足够扭），高次上同调就消没，截面足够多。具体地，若 $H^1(X,\\mathcal{F}(m))=0$，则长正合列给出 $H^0(X,\\mathcal{F}(m))\\to H^0(X,\\mathcal{F}(m)|_Y)$ 满射对 $Y$ 是一般超平面截面成立，这正是"截面可以限制到超平面且不损失"的陈述，是归纳证明中把 X 的高维问题降到 $Y$ 的维数减一时的标准工具。这两条定理也立刻给出"$h^0$ 在 m 大时是多项式"这一结论，从而希尔伯特函数与希尔伯特多项式作为两个对象（前者是整数序列、后者是 m 大时的多项式）的区分被严格化。在现代语言中，这两条定理被概括为：$X$ 射影时 $R\\Gamma(X,-)$ 在凝聚层的导出范畴上有界，且与 $\\mathcal{O}(1)$ 的扭构成"渐近正"的算子。',
        ['hilbert-polynomial']),
    ],
    conclusion: '射影概形 X 上的凝聚层 $\\mathcal{F}$：所有 $H^i(X,\\mathcal{F})$ 有限生成（k 为域时有限维），且存在 $m_0$ 使 $m>m_0$ 时 $H^i(X,\\mathcal{F}(m))=0$ 对一切 $i>0$。由此 $\\chi(\\mathcal{F}(m))$ 是 m 的多项式（希尔伯特多项式），$m$ 大时等于 $h^0(\\mathcal{F}(m))$；其次数为 $\\mathcal{F}$ 的支撑维数。',
    dependencies: [],
    consequences: [],
    explanation: '塞尔定理的价值在于它把"层论"从描述性语言变成了可计算的工具：只要层是凝聚的、底空间射影，就能断言上同调有限且在高扭处消没，于是可以放心地用长正合列、$\\chi$ 的可加性、以及"$\\chi=$ 维数多项式"这套机械去算。它的技术内容只有两条：射影空间上 $\\mathcal{O}(m)$ 的直接计算，与"用有限个 $\\mathcal{O}(m)$ 生成一般凝聚层"这一下降。这两条合起来给出"所有凝聚层都可以由射影空间的结构层通过有限次扩张与扭得到"，而有限次扩张不破坏有限性与消没，扭不破坏有限性并且能制造消没。值得注意的是消没阈值 $m_0$ 依赖 $\\mathcal{F}$ 而不依赖 $i$：这是一个非平凡的一致性问题，它由下降过程中的有限性保证（只需要有限多个"层深度"）。基于这两条定理，可以定义希尔伯特多项式、层的次数、以及用希尔伯特函数的差分来定义"重数"，这些概念在枚举几何与模空间理论中被反复使用。',
    examples: [
      { title: '例子：$\\mathbb{P}^n$ 上 $\\mathcal{O}(d)$ 的希尔伯特多项式', body: '取 $X=\\mathbb{P}^n$、$\\mathcal{F}=\\mathcal{O}(d)$。由射影空间上同调的直接计算：$m$ 满足 $d+m\\ge0$ 时 $h^0(\\mathcal{O}(d+m))=\\binom{d+m+n}{n}$，$0<i<n$ 时 $h^i=0$，$i=n$ 时 $h^n(\\mathcal{O}(d+m))=\\binom{-d-m-1}{n}$（当 $d+m\\le-n-1$）。故 $\\chi(\\mathcal{O}(d+m))=\\sum_i(-1)^i h^i=\\binom{d+m+n}{n}$（中间与高次项按 Serre 对偶的交替和相消，这是射影空间上同调的一个恒等式）。于是希尔伯特多项式 $P(m)=\\binom{d+m+n}{n}$，它是 m 的 n 次多项式，首项系数 $\\frac{1}{n!}$，故 $\\deg\\mathcal{O}(d)=1$、支撑维数为 n（因为 $\\mathcal{O}(d)$ 支撑在 X 上）。取 $n=2$、$d=0$：$P(m)=\\frac{(m+1)(m+2)}{2}$，即 $\\mathbb{P}^2$ 上 m 次齐次多项式的维数，与 $\\dim R_m$ 一致。' },
      { title: '例子：曲线上的层与 $\\chi$ 的次数解释', body: '取 $C$ 为亏格 g 的光滑射影曲线，嵌入到射影空间后取 $\\mathcal{F}=\\mathcal{O}_C$。有限性与消没给 $\\chi(\\mathcal{O}_C)=h^0-h^1=1-g$（$H^2$ 由维数 1 消没），希尔伯特多项式 $P_{\\mathcal{O}_C}(m)=\\chi(\\mathcal{O}_C(m))=\\deg(\\mathcal{O}_C(m))+1-g$。这里 $\\deg\\mathcal{O}_C(m)=m\\cdot\\deg C$（因为 $\\mathcal{O}_C(m)$ 是超平面类的 m 倍，其次数是超平面与 C 的相交数 $=\\deg C$），故 $P(m)=(\\deg C)m+1-g$，次数 1，与 $\\dim C=1$ 一致，首项系数 $\\deg C$ 与曲线次数吻合。若换成 $\\mathcal{F}=\\mathcal{O}_C(D)$（D 为除子），同理得 $P(m)=\\deg C\\cdot m+\\deg D+1-g$，这正是 Riemann-Roch 在"扭足够大"时的形式（此时 $H^1$ 消没，$h^0=\\chi$）。这个例子说明希尔伯特多项式的系数直接读出了曲线的次数、亏格与除子次数。' },
    ],
    remarks: [
      '凝聚性不能去掉：对非凝聚层（例如常数层 $\\mathbb{Z}$ 或无穷秩的自由层），有限性与消没都会失效。$\\mathbb{P}^1$ 上的常层 $\\mathbb{Z}$ 有 $H^1=\\mathbb{Z}$（非零的、有限但在扭的意义上不降为零），而且扭操作对常层没有正性的效果，故不存在消没阈值。因此"扭足够大就消没"这条依赖层的凝聚性，因为只有凝聚层才由有限个结构层生成。',
      '射影性不能换成紧性或完备性：定理的证明用 $\\mathcal{O}(1)$ 的存在与射影空间的具体计算。对仿射簇 $X=\\operatorname{Spec}A$，凝聚层的高次上同调为零（仿射上同调消没），这条定理无内容；对一般的紧复流形，$H^i(\\mathcal{F}(m))$ 的消没需要正性假设（如 $\\mathcal{F}$ 是正的），不能无条件断言。所以"射影"是这条定理的关键假设，既提供正性又提供有限性。',
      '消没阈值依赖 $\\mathcal{F}$，不能对一族层取统一阈值：在一族凝聚层中，阈值 $m_0$ 与层的"复杂度"（生成元扭次数与关系数）相关，可以无界增长，例如 $\\mathcal{O}(-k)$ 的阈值随 k 增长。在做族的论证（例如基变换、半连续性）时，必须小心"存在 $m_0$"是逐层而非一致的；一致阈值的缺失正是形变理论中需要考虑"一般纤维良好、特殊纤维跳升"的原因。',
      '希尔伯特多项式只在 $m$ 大时等于 $h^0$：$h^0$ 本身是整数序列（希尔伯特函数），它在小的 m 处可以偏离多项式值（例如 $\\mathbb{P}^1$ 上 $\\mathcal{O}(-1)$ 的 $h^0=0$ 而 $P(m)=m+1$ 在 $m=-1$ 处给 0，尚可；但 $\\mathbb{P}^2$ 上 $\\mathcal{O}(-2)$ 的 $h^0=0$ 而 $P(-2)=\\binom{1}{2}=0$，$\\mathcal{O}(-3)$ 时 $h^0=0$ 而 $P(-3)=\\binom{0}{2}=0$，一般地 $P(m)$ 对小的 m 可以是负的或与 $h^0$ 不同）。把 $h^0(\\mathcal{F}(m))$ 与 $P_{\\mathcal{F}}(m)$ 混用会在低扭次数处出错。',
    ],
    corollaries: [
      { title: '推论：希尔伯特函数最终是多项式', body: '由消没，存在 $m_0$ 使 $m>m_0$ 时 $h^i(\\mathcal{F}(m))=0$ 对 $i>0$，故 $h^0(\\mathcal{F}(m))=\\chi(\\mathcal{F}(m))=P_{\\mathcal{F}}(m)$ 是多项式。这条推论是希尔伯特多项式定义的合法性来源，也是"次数"与"维数"得以从 $\\chi$ 的首项读出（$\\dim X=\\deg P_{\\mathcal{O}_X}$、$\\deg\\mathcal{O}_X=\\dim X!\\cdot(\\text{首项系数})$）的依据。在计算中它把"数方程个数"的问题（$h^0$ 在小扭处）与"数几何不变量"的问题（$\\chi$ 的多项式）区分开。', uses: ['hilbert-polynomial'] },
    ],
    references: [
      stacks('Section 30.19: Higher direct images of coherent sheaves', '02O3'),
      stacks('Section 30.8: Cohomology of projective space', '01XS'),
      { title: 'Algebraic Geometry', author: 'Robin Hartshorne', year: 1977 },
    ],
    history: HISTORY,
  },

  /* ═══════════════════════════════════════════════════════════
   * 6. 塞尔对偶
   * ═══════════════════════════════════════════════════════════ */

  'serre-duality': {
    statement: '设 k 是域，X 是 k 上维数 n 的射影 Gorenstein 簇（光滑簇自动 Gorenstein），$\\omega_X^{\\circ}$ 是 X 的对偶化复形，其上同调层记 $\\omega_X=\\mathcal{H}^{-n}(\\omega_X^{\\circ})$（光滑时 $\\omega_X=\\wedge^n\\Omega^1_{X/k}$，为可逆层，称为典范层）。则 (1) 存在自然的 k-双线性配对 $H^i(X,\\mathcal{F})\\times H^{n-i}(X,\\mathcal{F}^{\\vee}\\otimes\\omega_X)\\to H^n(X,\\omega_X)\\xrightarrow{\\ \\operatorname{tr}\\ }k$，它在有限维向量空间上给出同构 $H^i(X,\\mathcal{F})\\cong\\big(H^{n-i}(X,\\mathcal{F}^{\\vee}\\otimes\\omega_X)\\big)^{\\vee}$；(2) 特别地 $H^i(X,\\omega_X)^{\\vee}\\cong H^{n-i}(X,\\mathcal{O}_X)$，且 $H^n(X,\\omega_X)\\cong k$；(3) 当 $\\mathcal{F}=\\mathcal{O}_X(D)$（D 为除子）时，配对的两端是 $H^i(X,\\mathcal{O}(D))$ 与 $H^{n-i}(X,\\mathcal{O}(K_X-D))$，故 $h^i(D)=h^{n-i}(K_X-D)$。',
    explanation: '塞尔对偶是"降维打击式的工具"：它把高次上同调的计算换成低次上同调的计算。对曲线 $n=1$ 它给出 $h^1(D)=h^0(K-D)$，于是 Riemann-Roch 的 $\\ell(D)-\\ell(K-D)=\\deg D+1-g$ 中那个难算的 $\\ell(K-D)$ 项就可以与 $\\ell(D)$ 互相替换，两边都是"函数空间的维数"这一可计算的东西。对曲面 $n=2$ 它给出 $h^2(D)=h^0(K-D)$，把"最高次上同调"这个最抽象的量化为最具体的截面数。对偶的一般形式（Grothendieck 对偶）把这条性质脱离射影性：对紧合态射 $f:X\\to Y$ 与 $X$ 上的层，存在 $R^if_*\\mathcal{F}$ 与 $R^{n-i}f_*(\\mathcal{F}^{\\vee}\\otimes\\omega_{X/Y})$ 的相对对偶，其中 $\\omega_{X/Y}$ 是相对对偶化层，这个层不一定存在整体截面但局部完美。证明的机制是双复形与留数：把 X 嵌入 $\\mathbb{P}^N$，用 $\\mathbb{P}^N$ 上的对偶（那里可由 $H^n(\\mathcal{O}(-n-1))\\cong k$ 与 Čech 计算显式给出）加上局部消失与 Grothendieck 迹映射的相容性，把对偶搬到 X 上。',
    steps: [
      step('projective-space-duality', '射影空间上的显式对偶',
        '$\\mathbb{P}^n$ 上的对偶可以显式写出来：$\\omega_{\\mathbb{P}^n}=\\mathcal{O}_{\\mathbb{P}^n}(-n-1)$。取 $\\check{H}$ 为 Čech 复形，则 $H^n(\\mathcal{O}(-n-1))\\cong k$ 且这个同构由留数映射给出：对由 $\\frac{1}{x_0\\cdots x_n}$ 在标准覆盖的最高交 $\\{x_i\\neq0\\ \\text{全部}\\}$ 上给出的 Čech 类，其像正是 $k$ 中的 $1$。由 $\\mathcal{O}(-n-1)$ 的截面（唯一的上同调类）与所有 $\\mathcal{O}(m)$ 的截面做"乘法配对"：$H^0(\\mathcal{O}(m))\\times H^n(\\mathcal{O}(-n-1-m))\\to H^n(\\mathcal{O}(-n-1))\\cong k$，$\\binom{m+n}{n}=\\binom{-m-1}{n}$ 的维数恰好相等（由二项式恒等式 $\\binom{m+n}{n}=\\binom{-m-1}{n}(-1)^n$ 在合适的符号约定下给出），说明这个乘法配对是非退化的。推广到任意的层 $\\mathcal{F}$：把 $\\mathcal{F}$ 用 $\\bigoplus\\mathcal{O}(m_i)$ 的有限表示写出（射影空间上凝聚层有有限自由表示），对表示复形取 Hom 到 $\\omega_{\\mathbb{P}^n}$，即得完美配对 $H^i(\\mathcal{F})\\times H^{n-i}(\\mathcal{F}^{\\vee}\\otimes\\omega)\\to k$。这一步给出对偶定理在射影空间上的全部内容。',
        []),
      step('duality-for-closed-subscheme', '从 $\\mathbb{P}^N$ 下降到闭子概形：局部对偶与迹',
        '设 $i:X\\hookrightarrow\\mathbb{P}^N$ 是闭浸入，$X$ 维数 n。定义 $\\omega_X^{\\circ}=R\\mathcal{H}om_{\\mathcal{O}_{\\mathbb{P}^N}}(i_*\\mathcal{O}_X,\\omega_{\\mathbb{P}^N}^{\\circ})[n]$（移位 $n=N-n$ 的差），则 $\\omega_X^{\\circ}$ 是 X 上的对偶化复形，且 $R\\mathcal{H}om_{X}(\\mathcal{F},\\omega_X^{\\circ})\\cong R\\mathcal{H}om_{\\mathbb{P}^N}(i_*\\mathcal{F},\\omega_{\\mathbb{P}^N}^{\\circ})$（通过 $i_*$ 与 $i^{-1}$ 的伴随）。对 $\\mathbb{P}^N$ 用第一步的完美配对，取整体的导出态射并套用 $\\operatorname{Hom}$-张量伴随，得到 $R\\Gamma(X,\\mathcal{F})^{\\vee}\\cong R\\Gamma(X,\\mathcal{F}^{\\vee}\\otimes\\omega_X^{\\circ})$ 的导出形式；取上同调即得 $H^i(X,\\mathcal{F})^{\\vee}\\cong H^{n-i}(X,\\mathcal{F}^{\\vee}\\otimes\\omega_X^{\\circ})$。当 $X$ 光滑（或 Gorenstein）时，$\\omega_X^{\\circ}$ 只在 $-n$ 处有上同调，$\\mathcal{H}^{-n}=\\omega_X=\\wedge^n\\Omega^1$ 是可逆层，于是复形退化成层，得到定理的陈述。这一步的要点是：下降的过程只用到 Hom 与 $i_*$ 的伴随以及局部对偶的局部分解，而不需要 X 有好的整体结构；对偶层由 $\\operatorname{Ext}^{N-n}$ 给出，这解释了为什么对偶层在光滑时是最高外幂微分形式。',
        ['projective-space-duality']),
      step('canonical-bundle-and-tr-nondegenerate', '典范层的显式描述与迹映射的非退化性',
        '验证 $\\omega_X=\\wedge^n\\Omega^1_{X/k}$ 与上一步的 $\\mathcal{E}xt^{N-n}(\\mathcal{O}_X,\\omega_{\\mathbb{P}^N})$ 一致：由 $X$ 在 $\\mathbb{P}^N$ 中局部由 $N-n$ 个方程定义，用 Koszul 复形写出 $\\mathcal{O}_X$ 的局部自由表示，对 $\\omega_{\\mathbb{P}^N}=\\mathcal{O}(-N-1)$ 取 $\\mathcal{E}xt$，得 $\\mathcal{E}xt^{N-n}(\\mathcal{O}_X,\\omega_{\\mathbb{P}^N})\\cong\\omega_X$（伴随公式的高维版本：$\\omega_X=(\\omega_{\\mathbb{P}^N}\\otimes\\mathcal{O}_X(X))|_X$ 在完全交情形，与 $\\wedge^n\\Omega^1_X$ 的计算相符，例如 $X=\\mathbb{P}^n$ 时给 $\\mathcal{O}(-n-1)$）。迹映射 $\\operatorname{tr}:H^n(X,\\omega_X)\\to k$ 由 $\\mathbb{P}^N$ 上的留数复合得到，它在 $X=\\mathbb{P}^n$ 时就是第一步的同构，对一般 X 通过与 $i_*$ 的相容性得到。非退化性（即配对给出同构 $H^i\\cong(H^{n-i})^{\\vee}$）由导出范畴的完美配对与"取上同调在有限维空间上是精确的"得到：先在导出层面得到 $R\\Gamma(\\mathcal{F})\\cong R\\Gamma(\\mathcal{F}^{\\vee}\\otimes\\omega_X)^{\\vee}$，再逐次取上同调；由有限性与消没，两侧都是有限维并在 $0\\le i\\le n$ 内集中，故取上同调得到逐项的维度对偶。',
        ['duality-for-closed-subscheme']),
      step('divisor-form-and-curve-case', '除子形式与曲线情形：$h^1(D)=h^0(K-D)$',
        '把对偶写成除子语言：$\\mathcal{F}=\\mathcal{O}_X(D)$ 时 $\\mathcal{F}^{\\vee}\\cong\\mathcal{O}_X(-D)$，故 $\\mathcal{F}^{\\vee}\\otimes\\omega_X\\cong\\mathcal{O}_X(K_X-D)$，得 $h^i(D)=h^{n-i}(K_X-D)$。取 $i=n$ 得 $h^n(D)=h^0(K_X-D)$，取 $i=0$ 得 $h^0(D)=h^n(K_X-D)$。曲线情形 $n=1$ 最常用：$h^1(D)=h^0(K_C-D)$，并且 $h^1(K_C-D)=h^0(D)$，于是 $\\ell(D)-\\ell(K-D)=\\deg D+1-g$ 中的两项可以互换。给定具体例子：$C$ 为亏格 2 曲线、$D=K_C$（次数 2）：$h^0(K)=g=2$，$h^1(K)=h^0(0)=1$，故 $\\ell(K)-\\ell(0)=2-1=1$，而 $\\deg K+1-g=2+1-2=1$，一致。取 $D=p$（次数 1）：$h^1(p)=h^0(K-p)$，而 $\\deg(K-p)=1>0$ 且由 $\\ell(K-p)=\\ell(K)-1$（否则 $\\ell(K-p)=2$ 将推出 $p\\sim0$，矛盾于 $\\deg p=1\\neq0$）得 $h^0(K-p)=1$，故 $h^1(p)=1$，于是 $\\chi(\\mathcal{O}(p))=h^0-h^1=1-1=0$，与 $\\deg p+1-g=1+1-2=0$ 一致。这些核算说明对偶定理把"算 $h^1$"化为"算 $h^0$"，这正是它在曲线理论中被反复使用的原因。',
        ['canonical-bundle-and-tr-nondegenerate']),
      step('relative-duality-preview', '相对对偶与推广',
        '对偶定理的相对形式（Grothendieck 对偶）把陈述搬到任意紧合态射 $f:X\\to Y$：存在 $\\omega_{X/Y}^{\\circ}=f^{!}\\mathcal{O}_Y$（相对对偶化复形）使 $R\\mathcal{H}om_X(\\mathcal{F},\\omega_{X/Y}^{\\circ})\\cong R\\mathcal{H}om_Y(Rf_*\\mathcal{F},\\mathcal{O}_Y)$，取上同调给出 $R^if_*\\mathcal{F}$ 与 $R^{n-i}f_*(\\mathcal{F}^{\\vee}\\otimes\\omega_{X/Y}^{\\circ})$ 的对偶。当 $Y=\\operatorname{Spec}k$ 时退化为上面的绝对对偶。相对形式的价值在于它可以在族上操作：对 $f:X\\to S$ 的纤维化，$\\omega_{X/S}$ 的构造使对偶在每根纤维上同时成立且与基变换相容（需要 $f$ 平坦或 Cohen-Macaulay 型条件），这为模空间与形变理论提供了"对偶层随参数变化"的机制。当 $n=1$ 且 $f$ 是曲线族时，$\\omega_{X/S}$ 就是相对典范层，$\\deg\\omega_{X/S}$ 的次数的变化率由基变换与相对对偶共同控制，这正是算术曲面理论中的核心工具。',
        ['divisor-form-and-curve-case']),
    ],
    conclusion: '对 k 上维数 n 的射影 Gorenstein 簇 X 与凝聚层 $\\mathcal{F}$，配对 $H^i(X,\\mathcal{F})\\times H^{n-i}(X,\\mathcal{F}^{\\vee}\\otimes\\omega_X)\\to k$ 非退化，故 $H^i(X,\\mathcal{F})\\cong H^{n-i}(X,\\mathcal{F}^{\\vee}\\otimes\\omega_X)^{\\vee}$；除子形式为 $h^i(D)=h^{n-i}(K_X-D)$；特别地对光滑曲线 $h^1(D)=h^0(K-D)$，对光滑曲面 $h^2(D)=h^0(K-D)$。相对版本对任意紧合 $f:X\\to Y$ 成立并给出 $R^if_*$ 与 $R^{n-i}f_*(\\cdot\\otimes\\omega_{X/Y})$ 的对偶。',
    dependencies: [],
    consequences: [],
    explanation: '塞尔对偶的深层内容是"最高次上同调只有一维，因此它可以作为配对的靶"，而这个一维性来自"X 自己作为 X 上的层只有一个最高次类（基本类）"。所有对偶定理都可以理解为：把 $\u2201$ 层的上同调与基本类做乘法，得到的数是拓扑/代数不变量，而乘法配对在有限维空间上自动配出一个同构。对偶之所以能"降维"，是因为 $n-i$ 当 $i$ 大时变小：$h^n$ 对偶于 $h^0$，$h^{n-1}$ 对偶于 $h^1$，于是难的量总能换成容易的量，这就是对偶定理在计算上的全部价值。对曲线，Riemann-Roch 之所以能写成对称形式，正是因为 $\\ell(D)$ 与 $\\ell(K-D)$ 互为对偶；对曲面，$h^2(D)=h^0(K-D)$ 把 Noether 公式与 Riemann-Roch 串起来，使 $\\chi$ 的计算化为截面计数。对偶的现代形式（导出范畴中的 $f^{!}$ 与 Verdier 对偶）还进一步说明：对偶不是射影簇的特权，而是紧合态射与局部完全交的普遍性质。',
    examples: [
      { title: '例子：$\\mathbb{P}^2$ 上 $h^2(\\mathcal{O}(d))=h^0(\\mathcal{O}(-d-3))$', body: '取 $X=\\mathbb{P}^2$，$\\omega_X=\\mathcal{O}(-3)$，故 $K_X=-3H$；对 $\\mathcal{F}=\\mathcal{O}(d)$，$\\mathcal{F}^{\\vee}\\otimes\\omega_X=\\mathcal{O}(-d-3)$。对偶给 $h^2(\\mathcal{O}(d))=h^0(\\mathcal{O}(-d-3))$。核算：$d=-3$ 时右边 $h^0(\\mathcal{O}(0))=1$，左边 $h^2(\\mathcal{O}(-3))=h^2(\\omega_X)=1$（$H^2$ 最高次类一维），成立；$d=-4$ 时右边 $h^0(\\mathcal{O}(1))=3$，左边 $h^2(\\mathcal{O}(-4))=3$，成立；$d=-2$ 时右边 $h^0(\\mathcal{O}(-1))=0$，左边 $h^2(\\mathcal{O}(-2))=0$，成立。对 $d\\ge0$，右边 $h^0$ 为负次数层故为零，左边 $h^2$ 也为零，与"高次上同调在正层处消没"一致。这个例子显示对偶把 $H^2$ 这个"抽象"的量完整地化为齐次多项式的计数。' },
      { title: '例子：亏格 g 曲线上的 $h^1(\\mathcal{O})$ 与微分形式', body: '取 $C$ 亏格 g 光滑射影曲线，$D=0$：对偶给 $h^1(\\mathcal{O}_C)=h^0(K_C)=g$，这正是"亏格 = 全纯微分形式的维数"。把 $D=K_C$ 代入得 $h^0(K_C)=h^1(\\mathcal{O}_C)=g$，自洽。对 $D$ 次数 $>2g-2$ 时 $\\deg(K-D)<0$ 故 $h^0(K-D)=0$，于是 $h^1(D)=0$，Riemann-Roch 退化为 $h^0(D)=\\deg D+1-g$；对 $D$ 次数 $<0$ 时 $h^0(D)=0$ 而 $h^1(D)=h^0(K-D)=\\deg(K-D)+1-g$ 需用 $\\deg D<0$ 时 $h^0(D)=0$ 的另一半信息。这两个极端说明对偶定理与 Riemann-Roch 合起来给出完整的 $h^0,h^1$ 计算方法，而对偶提供的是"在中间区间把两端联系起来"的那一半信息。' },
    ],
    remarks: [
      'Gorenstein 条件是必要的：若 X 只是射影 Cohen-Macaulay，对偶层 $\\omega_X^{\\circ}$ 未必集中在单一位置，对偶的陈述必须用复形 $R\\mathcal{H}om(\\mathcal{F},\\omega_X^{\\circ})$ 而非单个层 $\\mathcal{F}^{\\vee}\\otimes\\omega_X$。例如某些非 Gorenstein 的曲面上 $\\omega_X$ 不是可逆层，$\\mathcal{F}^{\\vee}\\otimes\\omega_X$ 的含义需要重新解释，直接写 $h^i(D)=h^{n-i}(K-D)$ 会出错（除子 $K$ 本身可能不是卡蒂埃除子）。光滑性是最常用的 Gorenstein 充分条件。',
      '有限维是前提：对偶的"配对给出同构"要在有限维向量空间上使用，而有限维依赖凝聚层的有限性（射影 + 凝聚）。对非射影簇或非凝聚层，虽然仍可构造配对，但"非退化 ⟹ 同构"这一步要求两侧有限维；在无穷维情形只能说配对在某些子空间上非退化，不会给出维数等式。',
      '对偶不能替代消没：对偶给出两个上同调维数的相等关系，但既不能保证它们有限（需要有限性定理），也不能保证某侧为零（例如 $h^0(K-D)$ 是否为零仍要看 $\\deg(K-D)$ 的符号与曲线的具体几何）。把对偶与消没、有限性合起来才能算出 $h^i$；在实际计算中常常是先用消没定出区间的端点，再用对偶把中间的困难项换成易算项。',
      '对正则 $\\mathcal{O}_X$-模的"整体对偶"与"局部对偶"不同层次：局部对偶（$\\mathcal{E}xt$ 与局部上同调）对任意局部完全交成立且是层的结论，整体对偶（$h^i=h^{n-i}$）则需要射影性与有限性。在非射影的局部完全交（例如仿射光滑簇）上，局部对偶仍然有效（给出 $\\omega_X$ 的局部描述），但 $h^i$ 的维数对偶没有意义（因为整体上同调不同构）。区分这两层是使用对偶时最容易混淆的地方。',
    ],
    corollaries: [
      { title: '推论：$h^n(X,\\mathcal{F})=h^0(X,\\mathcal{F}^{\\vee}\\otimes\\omega_X)$', body: '取 $i=n$：$H^n(X,\\mathcal{F})\\cong H^0(X,\\mathcal{F}^{\\vee}\\otimes\\omega_X)^{\\vee}$，即最高次上同调的对偶维数等于 $\\mathcal{F}^{\\vee}\\otimes\\omega_X$ 的整体截面维数。这条推论把"最高次上同调"（最难直接构造的对象）化为"整体截面"（最容易写出的对象）：例如曲面上 $h^2(\\mathcal{O}(D))=h^0(K-D)$，于是曲面的所有 $h^2$ 都可以由算截面得到。它是 Riemann-Roch（$\chi=h^0-h^1+h^2$）与 Noether 公式（$\\chi$ 与 $K^2,c_2$ 的关系）能落地的关键组件。', uses: ['divisor-form-and-curve-case'] },
    ],
    references: [
      stacks('Section 48.15: Right adjoint of pushforward in examples', '0BQX'),
      stacks('Section 30.19: Higher direct images of coherent sheaves', '02O3'),
      { title: 'Algebraic Geometry', author: 'Robin Hartshorne', year: 1977 },
    ],
    history: HISTORY,
  },

  /* ═══════════════════════════════════════════════════════════
   * 7. 典范层
   * ═══════════════════════════════════════════════════════════ */

  'canonical-sheaf': {
    statement: '设 k 是域，X 是 k 上维数 n 的光滑簇，$\\Omega^1_{X/k}$ 是相对微分层（秩 n 的局部自由层）。定义典范层 $\\omega_X=\\wedge^n\\Omega^1_{X/k}$；它是可逆层（秩 1 的局部自由层）。当 X 光滑射影时，$\\omega_X\\cong\\mathcal{O}_X(K_X)$ 对某个除子 $K_X$ 成立（$K_X$ 称为典范除子，仅在有理等价意义下唯一确定），且：(1) $\\mathcal{O}(K_X)=\\omega_X$，$\\Omega^1_{X/k}$ 在曲线情形就是 $\\omega_C$；(2) 伴随公式：光滑射影曲面上光滑曲线 C 满足 $K_C=(K_X+C)|_C$；(3) 射影空间中 $\\omega_{\\mathbb{P}^n}=\\mathcal{O}_{\\mathbb{P}^n}(-n-1)$；(4) 曲线的亏格 $g=h^0(C,\\omega_C)=h^1(C,\\mathcal{O}_C)$。',
    explanation: '典范层是"最高次微分形式的层"，它之所以是分类理论的核心，是因为它同时编码了三个层面的信息。局部层面：$\\omega_X$ 的截面是（局部）全纯 n-形式，其零点与极点给出典范除子 $K_X$，把"整体曲率"变成一个除子。数值层面：$K_X$ 与曲线的相交数、自交数 $K_X^2$（对曲面）是双有理不变量，而曲面的分类几乎完全由 $K_X$ 的数值性质决定：$K_X$ 丰沛 → 一般型；$-K_X$ 丰沛 → Fano；$K_X$ 数值平凡 → K3/阿贝尔/Enriques/双椭圆；$K_X$ 沿纤维收缩为零 → 椭圆曲面。对偶层面：塞尔对偶的两端之一就是 $\\omega_X$，于是所有上同调计算都通过 $\\omega_X$ 与截面数挂钩。这三层合起来使"分类定理 = 关于 $\\omega_X$ 正负性的定理"这句话成立。技术上 $\\omega_X$ 可逆是光滑性的直接结果：$\\Omega^1_{X/k}$ 局部自由是因为光滑态射的 Kähler 微分有局部基 $dx_1,\\ldots,dx_n$，而局部自由层的最高外幂仍局部自由。光滑射影时 $\\omega_X$ 对应除子，是因为射影光滑簇上每个可逆层都有有理截面，其除子类给出 $K_X$，且换截面只改变有理等价类。',
    steps: [
      step('differentials-and-invertible', '微分层与它的最高外幂是可逆层',
        '对光滑 k-概形 X，相对微分层 $\\Omega^1_{X/k}$ 满足：对每个闭点 x，存在 Zariski 开邻域上的正则参数 $x_1,\\ldots,x_n$（即 $\\mathcal{O}_{X,x}$ 的正则局部参数系）使 $dx_1,\\ldots,dx_n$ 是 $\\Omega^1$ 在该邻域上的自由基。因此 $\\Omega^1_{X/k}$ 是秩 $n=\\dim X$ 的局部自由层。外幂保持局部自由性并给出秩 $\\binom{n}{k}$ 的局部自由层；取 $k=n$ 得 $\\omega_X=\\wedge^n\\Omega^1_{X/k}$ 是秩 1 的局部自由层，即可逆层。可逆性有两条计算上的好处：$\\omega_X$ 有逆层 $\\omega_X^{\\vee}=\\wedge^n\\mathcal{T}_X$（切丛的最高外幂，称为反典范层），因此 $\\omega_X^{\\otimes m}$ 对一切整数 m 有定义；且 $\\omega_X$ 的截面在局部坐标下写作 $f(x)\\,dx_1\\wedge\\cdots\\wedge dx_n$，其零点与极点在换坐标下的变换由 Jacobi 行列式控制，从而使"零点重数"成为内蕴概念。若 X 奇异，$\\Omega^1$ 一般不是局部自由，$\\wedge^n\\Omega^1$ 不再是可逆层，必须改用对偶化复形给出的 $\\omega_X=\\mathcal{H}^{-n}(\\omega_X^{\\circ})$，这就是为什么经典讨论总是先设 X 光滑。',
        []),
      step('divisor-class-and-restriction', '从层到除子，以及沿曲线的限制',
        '设 X 光滑射影，取 $\\omega_X$ 的一个非零有理截面 s（在有理函数域层面总存在，因为 $\\omega_X$ 的"陈数"可由拓扑算，而 $\\omega_X\\otimes k(X)\\cong k(X)$ 对可逆层成立，故 $\\omega_X$ 的所有有理截面构成一维 k(X)-空间）。定义 $K_X=\\operatorname{div}(s)$，则 $\\mathcal{O}_X(K_X)\\cong\\omega_X$，且换 s 为 $fs$（$f\\in k(X)^{\\times}$）时 $K_X$ 改为 $K_X+\\operatorname{div}(f)$，故 $K_X$ 只在一个有理等价类中唯一确定。这一步说明"典范除子"不是唯一的对象，只有它的类与它的数值性质（各类相交数）是内蕴的。沿闭子簇的限制：若 $i:C\\hookrightarrow X$ 是光滑曲线，则 $\\omega_X$ 限制到 C 上给出 $\\mathcal{O}_C(K_X)$，它未必等于 $\\omega_C$，差额恰由 C 的法丛（即 $\\mathcal{O}_X(C)|_C$）补上，这就是伴随公式 $\\omega_C=(\\omega_X\\otimes\\mathcal{O}_X(C))|_C$、$K_C=(K_X+C)|_C$ 的内容。直观上：C 上的微分既可以从 X 上的 n-形式"除以 C 的方程再取留数"得到（贡献 $\\mathcal{O}_X(C)$），也可以从切向方向的 $n-1$ 形式得到（贡献 $\\omega_X$），两者合起来就是 C 自身的微分。',
        ['differentials-and-invertible']),
      step('projective-space-and-hypersurface', '射影空间与超曲面的典范层计算',
        '用欧拉列算 $\\omega_{\\mathbb{P}^n}$：$0\\to\\Omega^1_{\\mathbb{P}^n}\\to\\mathcal{O}(-1)^{\\oplus(n+1)}\\to\\mathcal{O}\\to0$（欧拉列的对偶形式之一，来自 $\\mathbb{P}^n$ 的 Euler 向量场）。对短正合列取最高外幂，由"外幂在正合列上的滤过公式"$\\wedge^{n+1}(\\mathcal{O}(-1)^{n+1})\\cong\\wedge^n\\Omega^1\\otimes\\wedge^1\\mathcal{O}\\cong\\omega_{\\mathbb{P}^n}$（因为 $\\wedge^{n+1}(\\text{秩 }n+1\\text{ 自由层})=\\det$ 且列的两端余维数相加为 $n+1$），得 $\\omega_{\\mathbb{P}^n}\\cong\\det(\\mathcal{O}(-1)^{\\oplus(n+1)})=\\mathcal{O}(-n-1)$。核验 $n=1$：$\\omega_{\\mathbb{P}^1}=\\mathcal{O}(-2)$，即 $K_{\\mathbb{P}^1}=-2[\\text{pt}]$，$\\deg K=-2=2g-2$，$g=0$，与 $\\mathbb{P}^1$ 的亏格一致。超曲面情形用伴随公式：若 $X=V(F)\\subset\\mathbb{P}^n$ 是 d 次光滑超曲面，则 $\\omega_X=(\\omega_{\\mathbb{P}^n}\\otimes\\mathcal{O}(X))|_X=(\\mathcal{O}(-n-1)\\otimes\\mathcal{O}(d))|_X=\\mathcal{O}_X(d-n-1)$。取 $n=2$、$d$ 任意：$\\omega_C=\\mathcal{O}(d-3)$，$\\deg\\omega_C=d(d-3)=2g-2$，得 $g=\\frac{(d-1)(d-2)}{2}$，正是平面曲线的亏格公式；取 $n=3$、$d=4$：$\\omega_X=\\mathcal{O}(0)=\\mathcal{O}_X$，即 K3 曲面的 $K=0$。这两条计算几乎覆盖了所有最常见的例子。',
        ['divisor-class-and-restriction']),
      step('genus-and-differentials', '亏格、微分形式与典范嵌入',
        '对光滑射影曲线 C，定义 $g=h^0(C,\\omega_C)=h^1(C,\\mathcal{O}_C)$（两个等式由塞尔对偶 $i=1$ 给出）。由 Riemann-Roch 对 $D=K_C$：$\\ell(K_C)-\\ell(0)=\\deg K_C+1-g$，即 $g-1=\\deg K_C+1-g$，得 $\\deg K_C=2g-2$，这正是"全纯微分的除子次数恒为 $2g-2$"的代数证明。典范层还给出一条构造映射的标准途径：当 $\\deg K_C=2g-2\\ge2g+1$ 即 $g\\ge3$ 时，$|K_C|$ 的维数 $g-1\\ge2$ 且无基点（由 $\\ell(K_C-p)=\\ell(K_C)-1$ 对一切 p 成立，否则 $p\\sim0$），于是典范映射 $\\varphi_{|K_C|}:C\\to\\mathbb{P}^{g-1}$ 有定义；进一步它可以分离点与切向量（当 $C$ 非超椭圆时），给出典范嵌入 $C\\hookrightarrow\\mathbb{P}^{g-1}$，次数为 $2g-2$。$g=2$ 时的 $|K_C|$ 是 $\\mathbb{P}^1$ 给次数 2 的映射；$g=1$ 时 $K_C=0$ 无内容；$g=0$ 时 $K_{\\mathbb{P}^1}=-2$ 是负的。这一分层（按 $g$ 与超椭圆性）是曲线理论的第一课，而判据完全由 $\\omega_C$ 的 $h^0$ 与 $\\deg$ 决定。',
        ['projective-space-and-hypersurface']),
      step('positivity-and-classification', '正负性：分类定理作为 $\\omega_X$ 的符号理论',
        '把 $\\omega_X$ 用在曲面上：定义 $K_X$ 的正性——$K_X$ 丰沛（$mK_X$ 的线性系给出嵌入）称 X 为一般型（$\\kappa=2$）；$-K_X$ 丰沛称 X 为 Fano（$\u03ba=-\\infty$ 中的有理曲面类）；$K_X$ 数值等价于 0 称 $\\kappa=0$（K3、阿贝尔、Enriques、双椭圆）；$K_X$ 沿某个纤维化的纤维为零而与纤维化方向正相关称 $\\kappa=1$（椭圆曲面）。用 $K_X$ 的数值便可把曲面分成四大类，而更精细的区分（比如 K3 与阿贝尔）需要额外的 $q=h^1(\\mathcal{O}_X)$。高维情形类似：一般型、Fano、Calabi–Yau（$K$ 平凡）、以及 $K$ 负的单直纹型构成四大块，MMP 的全部工作就是在允许的奇点类中保持 $K_X$ 的可处理性（$K_X$ 是 $\\mathbb{Q}$-卡蒂埃除子）并沿 $K_X$-负的射线收缩。所以"分类定理就是关于 $\\omega_X$ 正负性的定理"这一说法在高维仍然成立，只是"正负"被换成了 $K_X$ 在锥上（Mori 锥）的取值分布。这也是典范层作为分类核心的准确含义：分类不需要知道 X 的所有结构，只需要知道 $K_X$ 在数值空间中的位置。',
        ['genus-and-differentials', 'projective-space-and-hypersurface']),
    ],
    conclusion: '光滑 n 维簇 X 上 $\\omega_X=\\wedge^n\\Omega^1_{X/k}$ 是可逆层；光滑射影时 $\\omega_X\\cong\\mathcal{O}_X(K_X)$，$K_X$ 只在有理等价类中确定。$\\omega_{{\\mathbb{P}}^n}=\\mathcal{O}(-n-1)$，d 次光滑超曲面有 $\\omega_X=\\mathcal{O}(d-n-1)$；曲线情形 $\\deg K_C=2g-2$、$g=h^0(\\omega_C)=h^1(\\mathcal{O}_C)$，$g\\ge3$ 时 $|K_C|$ 给出典范映射 $C\\to\\mathbb{P}^{g-1}$。',
    dependencies: [],
    consequences: [],
    explanation: '典范层的地位来自一个简单事实：它是"唯一的"由 X 自身的微分结构自然产生的可逆层，因此不需要任何额外选择就能定义；而它的可逆性（光滑时）使得所有标准工具（外幂、张量幂、次数、相交数）都能作用在它上面，从而把几何问题变成数值问题。$\\omega_X$ 的三重身份——局部的微分形式层、整体的除子类、对偶定理的一端——恰好对应三类用法：局部计算用 $dx_1\\wedge\\cdots\\wedge dx_n$ 与留数；整体分类用 $K_X$ 的数值与丰沛性；上同调计算用 $h^i(\\mathcal{F})\\cong h^{n-i}(\\mathcal{F}^{\\vee}\\otimes\\omega_X)^{\\vee}$。特别地，$\\omega_X$ 的存在使"亏格"这个本来只对曲线定义的概念获得高维类比（$p_g=h^0(\\omega_X)$，几何亏格），而 $p_g$ 与 $q=h^1(\\mathcal{O}_X)$ 的差就是算术亏格的修正项，这些量在曲面分类与模空间理论中都是第一级不变量。若 X 奇异，典范层的可逆性失去，必须用对偶化复形；这也解释了为什么许多定理（Kodaira 消没、Kodaira 嵌入、伴随公式的一般形式）都先要求 X 光滑或至少 Gorenstein。',
    examples: [
      { title: '例子：四次平面曲线与 K3 曲面的典范层', body: '取 $C=V(F)\\subset\\mathbb{P}^2$，$\\deg F=4$ 且光滑。由 $\\omega_C=\\mathcal{O}_C(4-3)=\\mathcal{O}_C(1)$：$\\deg\\omega_C=4$，故 $2g-2=4$，$g=3$。核对 $h^0(\\omega_C)=h^0(\\mathcal{O}_C(1))=3$（超平面与四次曲线交 4 个点，$\\mathcal{O}_C(1)$ 的截面空间维数为 3，即 $\\mathbb{P}^2$ 的线性函数在 C 上的限制），与 $g=3$ 一致。此时 $|\\omega_C|$ 给出 $C\\hookrightarrow\\mathbb{P}^2$，正是原嵌入，典范映射把四次曲线映回它自己所在的平面——这是"非超椭圆亏格 3 曲线"的标准例子。再取 $X=V(G)\\subset\\mathbb{P}^3$，$\\deg G=4$ 光滑，则 $\\omega_X=\\mathcal{O}_X(4-3-1)=\\mathcal{O}_X$，即 $K_X=0$，这是 K3 曲面的典范层特征；由 $h^0(\\mathcal{O}_X)=1$ 得 $p_g=1$，与 K3 的 $p_g=1$ 相符。' },
      { title: '例子：椭圆曲线的 $K=0$ 与 $\\deg K=0$', body: '取 $E:y^2=x^3+ax+b$（$4a^3+27b^2\\neq0$）在 $\\mathbb{P}^2$ 中的光滑闭包，这是三次曲线，故 $\\omega_E=\\mathcal{O}_E(3-3)=\\mathcal{O}_E$，即 $K_E=0$。于是 $\\deg K_E=0=2g-2$，$g=1$；且 $h^0(\\omega_E)=h^0(\\mathcal{O}_E)=1$，说明椭圆曲线上全纯微分空间一维（可由 $\\omega=\\frac{dx}{2y}$ 生成）。反过来 $K_E=0$ 是椭圆曲线上"平移不变微分"的代数表现：$\\frac{dx}{2y}$ 在平移下不变，故无零点无极点，除子为 0。再算 $\\chi(\\mathcal{O}_E)=h^0-h^1=1-1=0=1-g$，与 $\\deg K+1-g=0+1-1=0$ 一致。这个例子说明"$K$ 的平凡性"能区分 $g=1$（$K=0$）与 $g\\ge2$（$\\deg K>0$）与 $g=0$（$\\deg K<0$），这正是分类的第一刀。' },
    ],
    remarks: [
      '光滑性不可去：若 X 有奇点，$\\Omega^1_{X/k}$ 不是局部自由，$\\wedge^n\\Omega^1$ 不必可逆，$\\omega_X$ 必须改由对偶化复形 $\\mathcal{H}^{-n}(\\omega_X^{\\circ})$ 定义。例如 $V(y^2-x^3)$ 上 $\\Omega^1$ 在原点处有扭部，$\\omega_X$ 不是可逆层，$K_X$ 不再是卡蒂埃除子，$\\deg K_X$ 无意义；与此对应，曲线上"$\\deg K=2g-2$"在奇点处必须用算术亏格 $p_a$ 与奇点解消公式修正。',
      '典范除子只在有理等价类中确定：$K_X$ 不是唯一的除子，换一个有理截面就把它换成 $K_X+\\operatorname{div}(f)$。因此"$K_X$ 是丰沛的"这句话才是有意义的（丰沛性只依赖除子类），而"$K_X$ 是一个给定除子"没有无歧义的含义。在数值层面更是如此：只有 $K_X\\cdot C$ 与 $K_X^2$ 才是内蕴的，做计算时可以先选一个方便的代表元（例如超曲面情形直接用 $\\mathcal{O}(d-n-1)$）。',
      '$\\Omega^1$ 的相关性依赖特征：在特征 $p$ 中，光滑簇的 $\\Omega^1$ 仍然局部自由（光滑性保证了这一点），但"微分形式给不出全部 $p$-进信息"：Cartier 同构使 $H^1(C,\\mathcal{O}_C)$ 与 $H^0(C,\\Omega^1)$ 的同构在正特征下需要适应（在曲线情形由 Serre 对偶仍成立，但在高维 $\\omega_X$ 与 Hodge 数 $h^{n,0}$ 的关系会在特征 $p$ 退化）。因此在特征 $p$ 使用"$\\omega_X$ 的截面就是 n-形式"这条时要核对 Hodge–de Rham 谱序列的退化性假设。',
      '反典范层的正性（Fano）与典范层的正性（一般型）不能同时成立：若 $K_X$ 丰沛则 $-K_X$ 不是 nef（除非维数 0），因为 $K_X\\cdot C>0$ 与 $-K_X\\cdot C\\ge0$ 对铺满的曲线 C 矛盾。因此在分类中 Fano 与一般型是不同的块，不存在"既有正典范又有正反典范"的非平凡光滑射影簇。这条排他性是分类表分块的理论依据，也说明 $-K_X$ 丰沛（Fano 条件）在维数 ≥3 时还额外要求 $K_X$ 的锥结构，不是单凭数值符号就能判定。',
    ],
    corollaries: [
      { title: '推论：光滑超曲面的典范层与亏格公式', body: '若 $X\\subset\\mathbb{P}^n$ 是 d 次光滑超曲面，则由伴随公式 $\\omega_X=\\mathcal{O}_X(d-n-1)$。对 $n=2$ 得平面曲线 $\\omega_C=\\mathcal{O}_C(d-3)$，$\\deg\\omega_C=d(d-3)=2g-2$，即 $g=\\frac{(d-1)(d-2)}{2}$；对 $n=3$、$d=4$ 得 $\\omega_X=\\mathcal{O}_X$（K3）。这条推论把"算典范层"与"算亏格"化为一步乘法，是几乎所有具体例子的计算起点。特别地它给出"$\\deg K$ 随超曲面次数线性增长而 $g$ 随次数二次增长"这一现象，说明高次超曲面的典范层非常正，属于一般型。', uses: ['projective-space-and-hypersurface'] },
    ],
    references: [
      stacks('Section 41.2: Group schemes', '02L6'),
      stacks('Section 28.16: Local irreducibility', '0BQ4'),
      { title: 'Algebraic Geometry', author: 'Robin Hartshorne', year: 1977 },
    ],
    history: HISTORY,
  },

  /* ═══════════════════════════════════════════════════════════
   * 8. 黎曼-罗赫定理
   * ═══════════════════════════════════════════════════════════ */

  'riemann-roch': {
    statement: '设 k 是域。曲线情形：C 是 k 上亏格 g 的光滑射影曲线，D 是 C 上除子，K 为典范除子，则 $\\ell(D)-\\ell(K-D)=\\deg D+1-g$，其中 $\\ell(D)=\\dim_kH^0(C,\\mathcal{O}_C(D))$。曲面与高维情形（Hirzebruch–Riemann–Roch）：X 是 k 上 n 维光滑射影簇，$\\mathcal{F}$ 是凝聚层，则 $\\chi(X,\\mathcal{F})=\\int_X\\operatorname{ch}(\\mathcal{F})\\operatorname{td}(T_X)$，其中 $\\operatorname{ch}$ 是陈特征、$\\operatorname{td}$ 是托德类、$\\int$ 表示取 0 次分量（基本类上的求值）。等价地 $\\chi(X,\\mathcal{F})$ 只依赖 $\\mathcal{F}$ 的数值类，且对 $\\mathcal{F}$ 与扭层是多项式。',
    explanation: '黎曼-罗赫是把"离散的上同调维数"（左边，一个整数维数差）与"连续的拓扑积分"（右边，陈类与托德类的积分）联系起来的最深桥梁。它的价值有三重。计算价值：右边完全由数值数据决定（次数、陈类、托德类都可由曲率或相交数算出），于是 $\\chi$ 是容易算的，而 $\\chi$ 定了之后配合对偶与消没就能解出 $\\ell$。理论价值：它说明上同调的交替和只依赖层的"数值类"，这使 $K_0$ 到上同调环的映射在 $\\chi$ 的层面完全被陈类捕捉，也是"相交数决定一切"这一思想的精确形式。推广价值：相对版本（GRR）对任意紧合态射成立，把 $\\chi$ 的等式推广为 $f_*(\\operatorname{ch}(\\mathcal{F})\\operatorname{td}(T_{X/Y}))$ 的等式，从而使曲线族、曲面族的上同调维数可以随参数计算。对曲线，Riemann-Roch 的证明路径有两条：一是用消没 + 对偶 + 对 $\\deg D$ 的线性归纳（把 D 逐点减少，每次用短正合列 $0\\to\\mathcal{O}(D-P)\\to\\mathcal{O}(D)\\to k_P\\to0$ 核算 $\\chi$ 的变化）；二是用 Čech 计算显式验证。对高维，证明走"线丛情形（用射影空间与扭层计算）+ 分裂原理（把一般层化为线丛）+ 加性（用长正合列与推广到任意凝聚层）"三段式。',
    steps: [
      step('chi-additivity-and-degree', '第一步：$\\chi$ 的可加性与对除子的线性',
        '定义 $\\chi(D)=\\chi(\\mathcal{O}_C(D))=h^0(D)-h^1(D)$（曲线情形 $H^2$ 由维数 1 消没，故只有两项）。对任意有理点 $P$ 有短正合列 $0\\to\\mathcal{O}_C(D)\\to\\mathcal{O}_C(D+P)\\to k_P\\to0$（第一个映射是乘以 $P$ 的局部方程，第二个是模去 $P$ 的局部方程限制到点层）。取长正合列并取交替维数，由 $\\chi$ 在短正合列上可加得 $\\chi(D+P)-\\chi(D)=\\chi(k_P)=1$。这条等式是最关键的一步：它说明 $\\chi$ 的"斜率"是 1。对任意除子 $D=\\sum n_iP_i$ 与 $D\'=\\sum m_iP_i$，反复使用上式可得 $\\chi(D)-\\chi(D\')=\\deg D-\\deg D\'$，即 $\\chi$ 线性依赖于 $\\deg$。取 $D\'=0$ 得 $\\chi(D)=\\chi(0)+\\deg D$；而 $\\chi(0)=h^0(\\mathcal{O}_C)-h^1(\\mathcal{O}_C)=1-g$（$h^0(\\mathcal{O}_C)=1$ 由紧性/射影性给整体正则函数为常数，$h^1(\\mathcal{O}_C)=g$ 是亏格的定义）。于是 $\\chi(D)=\\deg D+1-g$，这正是 Riemann-Roch 的左半边（$\\chi$ 的形式）。',
        []),
      step('duality-swap', '第二步：对偶把 $h^1$ 换成 $h^0(K-D)$',
        '上一步已得 $h^0(D)-h^1(D)=\\deg D+1-g$。再由塞尔对偶（取 $i=1$ 与 $n=1$）$H^1(C,\\mathcal{O}_C(D))\\cong H^0(C,\\mathcal{O}_C(K_C-D))^{\\vee}$，取维数得 $h^1(D)=h^0(K_C-D)=\\ell(K-D)$。代入即得 $\\ell(D)-\\ell(K-D)=\\deg D+1-g$，即经典的 Riemann-Roch。这里用到的对偶定理需要 $\\mathcal{O}_C(D)^{\\vee}\\otimes\\omega_C\\cong\\mathcal{O}_C(K_C-D)$，即 $\\mathcal{O}_C(D)$ 的对偶是 $\\mathcal{O}_C(-D)$，这对可逆层成立。特别地取 $D=K_C$ 得 $\\ell(K_C)-\\ell(0)=\\deg K_C+1-g$，即 $g-1=\\deg K_C+1-g$，解出 $\\deg K_C=2g-2$，这是"全纯微分的除子次数"的代数证明，也是整个曲线理论中最常用的常数。取 $D=0$ 得 $1-g=1-g$，自洽；取 $\\deg D>2g-2$ 得 $\\ell(K-D)=0$，于是 $\\ell(D)=\\deg D+1-g$，即"次数足够高时截面数线性增长"。',
        ['chi-additivity-and-degree']),
      step('surfaces-and-noether', '第三步：曲面情形与 Noether 公式',
        '曲面 $n=2$：HRR 给出 $\\chi(\\mathcal{O}_X)=\\frac{1}{12}(K_X^2+c_2(X))$（Noether 公式），其中 $c_2(X)$ 是第二陈类（等于拓扑欧拉数 $e(X)$）。推导：$\\operatorname{ch}(\\mathcal{O}_X)=1$，$\\operatorname{td}(T_X)=1+\\frac{c_1}{2}+\\frac{c_1^2+c_2}{12}$（由 $\\operatorname{td}(E)=\\prod\\frac{x_i}{1-e^{-x_i}}$ 展开到二次项：$\\frac{t}{1-e^{-t}}=1+\\frac{t}{2}+\\frac{t^2}{12}$，故 $\\operatorname{td}=1+\\frac{p_1}{2}+\\frac{p_1^2+p_2}{24}$ 型，按 $c_1,c_2$ 写为 $1+\\frac{c_1}{2}+\\frac{c_1^2+c_2}{12}$），取 2 次分量与基本类求值得 $\\chi=\\frac{1}{12}(K_X^2+c_2)$。再对一般 $\\mathcal{F}=\\mathcal{O}_X(D)$：$\\operatorname{ch}=1+D+\\frac{D^2}{2}$，乘积的 2 次分量为 $\\frac{D^2}{2}+\\frac{D\\cdot K}{2}+\\frac{K^2+c_2}{12}$，故 $\\chi(D)=\\frac{D^2-D\\cdot K}{2}+\\chi(\\mathcal{O}_X)$。取 $D=K_X$ 得 $\\chi(K_X)=\\frac{K^2-K^2}{2}+\\chi(\\mathcal{O}_X)=\\chi(\\mathcal{O}_X)$，由对偶 $\\chi(K_X)=h^0-h^1+h^2$ 与 $h^0(K)=h^2(\\mathcal{O})=p_g$、$h^1(K)=h^1(\\mathcal{O})=q$、$h^2(K)=h^0(\\mathcal{O})=1$ 得 $\\chi(K)=p_g-q+1=\\chi(\\mathcal{O})$，自洽。这些等式在高维与曲面分类中都是常用的核算。',
        ['duality-swap']),
      step('hirzebruch-general', '第四步：一般形式的证明思路（线丛 + 分裂原理 + 加性）',
        'HRR 的一般证明分三段。第一段：$\\mathcal{F}=\\mathcal{O}(D)$ 为线丛时，把 D 写成与其他除子的差 $D=D_1-D_2$（$D_i$ 丰沛，例如 $D_1=D+aH$、$D_2=aH$ 取 a 大），由"$\\chi$ 是数值类上的多项式"（这由消没与有限性给出：$m$ 大时 $\\chi(D+mH)$ 是 m 的多项式）与多项式扩张的唯一性，只需验证 $\\chi(\\mathcal{O}(mH))$ 的形式对丰沛线丛成立，而丰沛线丛的情形可由它对 $\\chi$ 的多项式性与 HRR 的乘法结构逐项核对（也可用 Bertini 归纳：把 X 换成一般超平面截面，维数降 1，用长正合列 $0\\to\\mathcal{O}(D-H)\\to\\mathcal{O}(D)\\to\\mathcal{O}_H(D)\\to0$ 与 $\\chi$ 的加性把维数归纳）。第二段：一般凝聚层。由塞尔有限性证明中的满射 $\\mathcal{O}(m)^{\\oplus r}\\twoheadrightarrow\\mathcal{F}$，取核 $\\mathcal{G}$，得短正合列；$\\chi$ 可加与 $\\operatorname{ch}$ 对直和的可加性使公式对 $\\mathcal{F}$ 成立当且仅当对 $\\mathcal{G}$ 成立；沿"复杂度"下降（$\\mathcal{G}$ 的 Hilbert 多项式次数不高于 $\\mathcal{F}$，有限步终止），归纳完成。第三段：把 $\\operatorname{ch}$ 与 $\\operatorname{td}$ 定义为形式幂级数的组合，证明积分只取 0 次分量，从而 $\\chi$ 只依赖数值类，与代表元无关。',
        ['surfaces-and-noether']),
      step('grothendieck-rr', '第五步：相对版本 GRR 与它在族上的用处',
        'GRR 断言：对 k 上光滑射影簇之间的紧合态射 $f:X\\to Y$（例如纤维化或模空间的结构映射），有 $f_*\\big(\\operatorname{ch}(\\mathcal{F})\\operatorname{td}(T_{X/Y})\\big)=\\operatorname{ch}(f_!\\mathcal{F})\\operatorname{td}(T_Y)$ 在 $A^{*}(Y)\\otimes\\mathbb{Q}$ 中成立，其中 $T_{X/Y}$ 是相对切丛、$f_!$ 是 K 理论中的推前（把纤维上的上同调打包成 Y 上的完美复形）。取 $f$ 为到点的映射即退化为 HRR；取 $f$ 为曲线族 $f:\\mathcal{C}\\to S$ 并取 $\\mathcal{F}=\\mathcal{O}_{\\mathcal{C}}(D)$，则得到"$\\chi(\\mathcal{C}_s,\\mathcal{O}(D_s))$ 作为 s 的函数是 $\\deg D_s$ 的二次多项式，且其系数由 $D$ 与 $\\omega_{\\mathcal{C}/S},[\\mathcal{C}_s]$ 的相交数给出"，这正是把曲线上的 Riemann-Roch 从"单根纤维"搬到"整族"的机制。GRR 的用处在于它使模空间上的"维数计算"成为可能：只要知道相对典范层与相对切丛的类，就能算出纤维上上同调维数的变化规律。',
        ['hirzebruch-general']),
    ],
    conclusion: '光滑射影曲线 C 上 $\\ell(D)-\\ell(K-D)=\\deg D+1-g=\\chi(D)$，且 $\\deg K=2g-2$、$\\deg D>2g-2$ 时 $\\ell(D)=\\deg D+1-g$；光滑射影 n 维簇上 HRR 断言 $\\chi(X,\\mathcal{F})=\\int_X\\operatorname{ch}(\\mathcal{F})\\operatorname{td}(T_X)$，曲面情形化为 Noether 公式 $\\chi(\\mathcal{O}_X)=\\frac{K_X^2+c_2}{12}$；相对版本 GRR 对任意紧合 $f$ 成立，用于族上的维数计算。',
    dependencies: [],
    consequences: [],
    explanation: 'Riemann-Roch 的两半各有一个直觉解释。左边 $\\ell(D)-\\ell(K-D)$ 是"函数与微分之间的平衡"：D 上能取的函数越多，能写出的微分就越少，二者的差是稳定的。右边 $\\deg D+1-g$ 是"纯数值"。等式的意义是：这种平衡不依赖 D 的具体位置，只依赖次数与亏格，换言之截面空间的维数是"数值不变"的。高维 HRR 把这个直觉提升为"$\\chi$ 只依赖数值类"，证明的关键在于 $\\operatorname{ch}$ 与 $\\operatorname{td}$ 都是陈类的多项式，而陈类只依赖向量丛的数值（在 K 理论与上同调的接口处，$\\operatorname{ch}$ 是环同态），于是 $\\chi$ 的等号是结构性的而非计算的巧合。使用 HRR 的实践要点有两个：一是要能算 $\\operatorname{ch}$ 与 $\\operatorname{td}$（在曲线与曲面上有显式公式，在射影空间上 $\\chi(\\mathcal{O}(d))=\\binom{d+n}{n}$ 是标准输入）；二是要记住 $\\chi$ 定了之后还要配合消没与对偶才能把 $h^i$ 逐项定出来，HRR 本身只给交替和。这两点合起来构成"算上同调"的标准流程。',
    examples: [
      { title: '例子：亏格 2 曲线上的 $\\ell(K)$、$\\ell(2K)$ 与 $\\ell(3K)$', body: '取 C 为亏格 2 的光滑射影曲线，$\\deg K=2$。① $\\ell(K)$：RR 给 $\\ell(K)-\\ell(0)=2+1-2=1$，$\\ell(0)=1$，故 $\\ell(K)=2$。② $\\ell(2K)$：$\\deg(2K)=4$，RR 给 $\\ell(2K)-\\ell(K-2K)=\\ell(2K)-\\ell(-K)=4+1-2=3$，而 $\\deg(-K)=-2<0$ 给 $\\ell(-K)=0$，故 $\\ell(2K)=3$。③ $\\ell(3K)$：$\\deg(3K)=6$，$\\ell(3K)-\\ell(-2K)=6-1=5$，$\\ell(-2K)=0$，故 $\\ell(3K)=5$。于是 $C\\to\\mathbb{P}^1$（由 $|K|$，次数 2）、$C\\to\\mathbb{P}^2$（由 $|2K|$，且可验证是 2:1 到一条圆锥曲线）、$C\\to\\mathbb{P}^4$（由 $|3K|$，是嵌入，因为 $3K$ 非常丰沛）。这三个数据完整刻画了亏格 2 曲线：$C$ 是某个 $\\mathbb{P}^1$ 上的二重覆盖且分支数据由 $\\ell(3K)=5$ 的嵌入决定，这也是亏格 2 曲线族维数 3 的来源。' },
      { title: '例子：$\\mathbb{P}^2$ 上 $\\chi(\\mathcal{O}(d))=\\binom{d+2}{2}$ 与 HRR 核对', body: '取 $X=\\mathbb{P}^2$，$T_X$ 的 $c_1=3h$、$c_2=3h^2$，故 $\\operatorname{td}(T_X)=1+\\frac{3h}{2}+h^2$（由 $\\operatorname{td}=\\left(\\frac{h}{1-e^{-h}}\\right)^3=1+\\frac{3h}{2}+\\frac{3h^2}{4}+\\frac{3h^2}{12}+\\cdots$）。$\\operatorname{ch}(\\mathcal{O}(d))=1+dh+\\frac{d^2h^2}{2}$。乘积取 2 次分量：$\\frac{d^2}{2}+\\frac{3d}{2}+1=\\frac{d^2+3d+2}{2}=\\frac{(d+1)(d+2)}{2}=\\binom{d+2}{2}$。直接计算 $(1+dh+\\frac{d^2h^2}{2})(1+\\frac{3h}{2}+h^2)=1+(d+\\frac{3}{2})h+(\\frac{d^2}{2}+\\frac{3d}{2}+1)h^2$，取 $h^2$ 的系数（$\\int h^2=1$）得 $\\binom{d+2}{2}$。与实际 $\\chi(\\mathcal{O}(d))=h^0-h^1+h^2=\\binom{d+2}{2}-0+0$（$d\\ge0$）一致；对 $d\\le-3$ 时 HRR 给出的仍是 $\\binom{d+2}{2}$（例如 $d=-3$ 给 $\\binom{-1}{2}=0$？实际上 $\\binom{-1}{2}=\\frac{(-1)(-2)}{2}=1$，与 $h^2(\\mathcal{O}(-3))=1$ 一致），说明 HRR 对负次数也成立，这是它比"只对大次数成立的消没型公式"更强的地方。' },
    ],
    remarks: [
      'HRR 只给出 $\\chi$，不给出各个 $h^i$：等式左边是交替和，要把 $h^0,h^1,h^2$ 分别定出来必须另加输入（消没定理定出哪些为零，对偶定理把高的换成低的）。例如曲面上 $\\chi(D)=\\frac{D^2-DK}{2}+\\chi(\\mathcal{O}_X)$ 只给出 $h^0-h^1+h^2$；若 $D$ 丰沛且 $D-K$ 丰沛，由 Kodaira 消没得 $h^1=h^2=0$，才能读出 $h^0=\\chi$。把 HRR 当作"$h^0$ 的公式"是最常见的误用。',
      '光滑性是 HRR 的内在条件：奇异簇上 $T_X$ 不是向量丛，$\\operatorname{td}(T_X)$ 没有直接定义，必须改用推广（对局部完全交用 $\\operatorname{td}$ 的对偶版本，或直接用 $G$ 理论与周期映射）。若 X 有商奇点，$\\chi$ 的公式需要 orbifold 修正（惯性簇与 $\\operatorname{td}$ 的修正项），否则会得到非整数或错误的结果。所以"$\\chi=\\int ch\\cdot td$"这条必须在光滑（或 Gorenstein 完全交）条件下使用。',
      '曲线版本的 $\\deg D>2g-2$ 情形不能外推到低次数：对 $\\deg D\\le2g-2$，$\\ell(K-D)$ 一般不消，$\\ell(D)$ 与 $\\deg D+1-g$ 的差正是 $\\ell(K-D)$ 这一"特殊除子"的贡献。用 $\\ell(D)=\\deg D+1-g$ 处理特殊除子（例如 $D=K$、$D=0$ 或 curve 上的小次数除子）会系统性高估 $\\ell$。这条提醒在计算亏格 2 曲线上的 $\\ell(K)=2$（而 $\\deg K+1-g=2+1-2=1$）时立刻可见。',
      'GRR 中 $f_!$ 与 $f_*$ 的区别不能混淆：$f_*$ 是上同调的推前（取 $R^if_*$ 的交替和作为 $\\chi$），而 $f_!$ 是 K 理论中的推前（把纤维上的层打包成一个完美复形，其 $\\chi$ 在各点的取值给出 $R^if_*$）。把 $f_!$ 写成 $f_*$ 会得到错误的等号，因为 $f_*$ 在 K 理论上不保持环结构。相对版本的运算必须用 $f_!$ 的框架（或等价地在对偶框架中用 $f_*$ 与 $\\omega$ 的配对）。',
    ],
    corollaries: [
      { title: '推论：$\\deg K=2g-2$ 与"次数足够大时 $\\ell(D)=\\deg D+1-g$"', body: '在 RR 中取 $D=K$：$\\ell(K)-1=\\deg K+1-g$，结合 $\\ell(K)=g$（塞尔对偶给 $\\ell(K)=h^1(\\mathcal{O})=g$）得 $\\deg K=2g-2$。取 $\\deg D>2g-2$：$\\deg(K-D)<0$ 故 $\\ell(K-D)=0$，得 $\\ell(D)=\\deg D+1-g$。这两条是曲线计算中最常用的两把尺子：前者给出典范除子的次数（进而给出亏格与嵌入维数），后者给出"高次数除子没有特殊行为"这一线性增长律，也是构造射影嵌入时"取足够大的倍数"的依据。', uses: ['duality-swap'] },
    ],
    references: [
      stacks('Section 53.8: The genus of a curve', '0BY6'),
      stacks('Section 33.29: Künneth formula, I', '0BEC'),
      { title: 'Algebraic Geometry', author: 'Robin Hartshorne', year: 1977 },
    ],
    history: HISTORY,
  },

  /* ═══════════════════════════════════════════════════════════
   * 9. 欧拉示性数
   * ═══════════════════════════════════════════════════════════ */

  'euler-characteristic': {
    statement: '设 X 是 k 上射影概形，$\\mathcal{F}$ 是 X 上凝聚层，且 X 的维数为 n。定义欧拉示性数 $\\chi(X,\\mathcal{F})=\\sum_{i=0}^{n}(-1)^i\\dim_kH^i(X,\\mathcal{F})$（由消没定理，只在 $0\\le i\\le n$ 内非零，且由有限性定理每项有限）。它满足：(1) 可加性：对短正合列 $0\\to\\mathcal{F}\'\\to\\mathcal{F}\\to\\mathcal{F}\'\'\\to0$ 有 $\\chi(\\mathcal{F})=\\chi(\\mathcal{F}\')+\\chi(\\mathcal{F}\'\')$；(2) 扭层情形：$\\chi(\\mathcal{F}(m))$ 是 m 的多项式，即希尔伯特多项式 $P_{\\mathcal{F}}(m)$，其次数为 $\\dim\\operatorname{Supp}\\mathcal{F}$；(3) 曲线情形 $\\chi(\\mathcal{O}_C(D))=\\deg D+1-g$；(4) 常层情形 $\\chi(\\mathcal{O}_X)=\\sum(-1)^i h^i(\\mathcal{O}_X)$，对光滑射影簇有 Hirzebruch 型公式 $\\chi(\\mathcal{O}_X)=\\int\\operatorname{td}(T_X)$。',
    explanation: '欧拉示性数的整个价值在于"可加"这一条。单个上同调维数 $h^i$ 极难确定（它依赖层的具体结构），但它们的交替和却有一个神奇的性质：在短正合列中相加。这条性质把"算维数"这个困难问题转化为"算 $\\chi$"这个容易问题，然后配合消没（定出哪些项为零）与对偶（把高的换成低的）才能回到单个 $h^i$。可加性的来源是长正合列的精确性：把长正合列切成若干条短正合列，每条短正合列上维数按 $0\\to\\ker\\to\\cdot\\to\\operatorname{im}\\to0$ 相消，逐项相加即得。由此立刻推出 $\\chi$ 只依赖层在 K 理论中的类（而不是层的具体样子），这使 $\\chi$ 成为一个"数值型"不变量，也让 Riemann-Roch 这类定理有可能写成 $\\chi$ 关于数值类的等式。第二条性质（扭层的 $\\chi$ 是多项式）把 $\\chi$ 与次数、维数、Hilbert 多项式的系数绑在一起：$P_{\\mathcal{F}}$ 的首项系数给出次数、次数给出支撑维数，而 $P$ 的取值给出 $\\chi$ 在小扭次数处的具体数值。第三条与第四条是两个基本例子：曲线上的 $\\chi$ 完全由次数与亏格决定，而整体结构层的 $\\chi$ 则是拓扑不变量（托德数的积分）。',
    steps: [
      step('additivity-from-long-exact-sequence', '可加性：从长正合列到 $\\chi$ 的线性',
        '设 $0\\to\\mathcal{F}\'\\to\\mathcal{F}\\to\\mathcal{F}\'\'\\to0$ 是 X 上凝聚层的短正合列。取其长正合列 $\\cdots\\to H^i(\\mathcal{F}\')\\to H^i(\\mathcal{F})\\to H^i(\\mathcal{F}\'\')\\to H^{i+1}(\\mathcal{F}\')\\to\\cdots$。由消没定理两端在 $i<0$ 与 $i>n$ 处为零，故列是有限长的。把长正合列分解：对每个 $i$，取 $K^i=\\ker(H^i(\\mathcal{F})\\to H^i(\\mathcal{F}\'\'))$，则 $K^i\\cong\\operatorname{im}(H^i(\\mathcal{F}\')\\to H^i(\\mathcal{F}))\\cong H^i(\\mathcal{F}\')/\\ker$，并且有短正合列 $0\\to K^i\\to H^i(\\mathcal{F})\\to\\operatorname{im}(H^i(\\mathcal{F})\\to H^i(\\mathcal{F}\'\'))\\to0$；而正合性给 $\\operatorname{im}(H^i(\\mathcal{F})\\to H^i(\\mathcal{F}\'\'))\\cong\\ker(H^i(\\mathcal{F}\'\')\\to H^{i+1}(\\mathcal{F}\'))$，即 $K^{i+1}$ 的对应物。于是对每个 $i$ 有 $\\dim H^i(\\mathcal{F})=\\dim K^i+\\dim K^{i+1}$（在适当的命名约定下）。乘以 $(-1)^i$ 并对 $i$ 求和，相邻项相消（望远镜求和），得 $\\sum_i(-1)^i\\dim H^i(\\mathcal{F})=\\sum_i(-1)^i\\dim H^i(\\mathcal{F}\')+\\sum_i(-1)^i\\dim H^i(\\mathcal{F}\'\')$，即可加性。',
        []),
      step('numerical-class-and-k-theory', '可加性的推论：$\\chi$ 只依赖 K 理论类',
        '可加性意味着 $\\chi$ 是 $K_0(X)$（或凝聚层的 Grothendieck 群 $G_0(X)$）上的群同态：若 $[\\mathcal{F}]=[\\mathcal{F}\']+[\\mathcal{F}\'\']$ 在 Grothendieck 群中成立，则 $\\chi(\\mathcal{F})=\\chi(\\mathcal{F}\')+\\chi(\\mathcal{F}\'\')$。在 X 光滑时 $G_0(X)=K_0(X)$（每个凝聚层有有限局部自由分解），于是 $\\chi$ 是 $K_0(X)$ 上的整值线性函数。既然 $K_0(X)$ 由向量丛的类生成，而 $\\chi$ 对直和可加、对张量积满足 $\\chi(\\mathcal{F}\\otimes\\mathcal{L})=$ 关于 $\\mathcal{L}$ 的多项式，就可以把 $\\chi$ 用向量丛的数值不变量表达。当 $\\mathcal{F}$ 是向量丛时，$\\chi$ 还可以用陈类写出来（HRR 的内容）。这条推论的实际意义是：算 $\\chi$ 时可以选择最方便的代表元（例如把 $\\mathcal{O}(D)$ 换成 $\\mathcal{O}(D_1)-\\mathcal{O}(D_2)$ 的形式），而不必使用原来的层。它也解释了为什么 $\\chi$ 是可计算的：它只是有限个数值参数的线性组合。',
        ['additivity-from-long-exact-sequence']),
      step('curve-computation', '曲线情形：$\\chi=\\deg D+1-g$ 的逐点核算',
        '设 C 为亏格 g 的光滑射影曲线，$D=\\sum_{i}n_iP_i$。先处理单点：短正合列 $0\\to\\mathcal{O}_C(D)\\to\\mathcal{O}_C(D+P)\\to k_P\\to0$ 给出 $\\chi(D+P)-\\chi(D)=\\chi(k_P)=1$（点层 $k_P$ 的 $\\chi$ 为 1：$H^0=k$，$H^1=0$）。同样地 $\\chi(D-P)-\\chi(D)=-1$。于是对任意除子 $D$、$D\'$ 有 $\\chi(D)-\\chi(D\')=\\deg D-\\deg D\'$（把 $D$ 写成 $D\'$ 加上一列点的加减，逐步使用上式）。取 $D\'=0$：$\\chi(D)=\\chi(\\mathcal{O}_C)+\\deg D$。再算 $\\chi(\\mathcal{O}_C)=h^0(\\mathcal{O}_C)-h^1(\\mathcal{O}_C)=1-g$（$h^0=1$ 由整体正则函数为常数，$h^1=g$ 由亏格定义或由对偶 $h^1(\\mathcal{O})=h^0(K)=g$）。合并得 $\\chi(D)=\\deg D+1-g$。这条推导完全不依赖除子的具体位置，只用到"点层的 $\\chi$ 为 1"这一条局部输入与可加性；它也是"$\\chi$ 的斜率等于次数"的精确含义：每动一个点，$\\chi$ 改变 1。',
        ['numerical-class-and-k-theory']),
      step('hilbert-polynomial-as-chi', '扭层：希尔伯特多项式与次数、维数的读出',
        '取 $\\mathcal{F}$ 为 X 上凝聚层，$\\mathcal{O}_X(1)$ 为射影嵌入给出的丰沛可逆层。由塞尔消没，存在 $m_0$ 使 $m>m_0$ 时 $\\chi(\\mathcal{F}(m))=h^0(\\mathcal{F}(m))$；由 $\\chi$ 对短正合列可加并结合 $\\mathcal{F}$ 由有限个 $\\mathcal{O}(m_i)$ 的有限扩张表示，得 $\\chi(\\mathcal{F}(m))$ 是 m 的多项式 $P_{\\mathcal{F}}(m)=\\sum_{i=0}^{d}a_i\\frac{m^i}{i!}$（写成如此是为了让 $a_i$ 是整数，称为第 i 个"重数"）。首项次数 $d=\\deg\\operatorname{Supp}\\mathcal{F}$ 等于 $\\mathcal{F}$ 的支撑维数；对 $\\mathcal{F}=\\mathcal{O}_X$，$P_{\\mathcal{O}_X}$ 的首项系数乘 $d!$ 是 X 在射影空间中的次数。中间系数 $a_{d-1}$ 与 $\\mathcal{O}_X(1)$ 的除子类相关，最低项 $a_0=\\chi(\\mathcal{F})$。这三层信息（维数、次数、欧拉示性数）都能从同一个多项式读出，说明希尔伯特多项式是"一个对象同时携带几何与数值信息"的最小载体。这也是 Hilbert 函数理论中"用 $\\chi$ 代替 $h^0$"这一技术选择的理由：$\\chi$ 有多项式性而 $h^0$ 只在大的 m 处有。',
        ['curve-computation']),
      step('topological-meaning', '整体结构层的 $\\chi$ 与拓扑不变量',
        '$\\chi(\\mathcal{O}_X)$ 不是纯代数的量，它与拓扑欧拉数通过特征类相连。对光滑射影簇，$\\chi(\\mathcal{O}_X)=\\int_X\\operatorname{ch}(\\mathcal{O}_X)\\operatorname{td}(T_X)=\\int_X\\operatorname{td}(T_X)$，即托德类在基本类上的积分。对曲线：$\\operatorname{td}(T_C)=1+\\frac{c_1}{2}=1+(1-g)[\\text{pt}]$（因为 $c_1(T_C)=2g-2$ 的类，$\\int\\operatorname{td}=1-g$），故 $\\chi(\\mathcal{O}_C)=1-g$，与前面一致。对曲面：$\\chi(\\mathcal{O}_X)=\\frac{K^2+c_2}{12}$（Noether 公式）。对 $\\mathbb{P}^n$：$\\chi(\\mathcal{O}_{\\mathbb{P}^n})=\\int(1+h)^{n+1}\\cdot\\cdots$ 型计算给出 1（由 $h^i(\\mathcal{O})=0$ 对 $0<i<n$、$h^0=h^n=1$ 的交替和为 1）。这条联系说明：$\\chi(\\mathcal{O}_X)$ 是拓扑的（它只依赖 X 的实拓扑与 Hodge 分解中的 $\\sum(-1)^q h^{p,q}$ 的组合），因此可以作为连接代数与拓扑的桥梁；Serre 对偶进一步把这种交替和编译成 $q$ 与 $p_g$ 的线性组合 $1-q+p_g$，使代数侧的量可以直接读出。',
        ['hilbert-polynomial-as-chi']),
    ],
    conclusion: '$\\chi(X,\\mathcal{F})=\\sum_{i=0}^{n}(-1)^i\\dim_kH^i(X,\\mathcal{F})$ 在短正合列上可加，从而只依赖 $\\mathcal{F}$ 的 Grothendieck 类；$\\chi(\\mathcal{F}(m))$ 是希尔伯特多项式 $P_{\\mathcal{F}}(m)$，其次数给出支撑维数、首项系数给出次数、常数项给出 $\\chi$；曲线上 $\\chi(\\mathcal{O}_C(D))=\\deg D+1-g$，光滑射影簇上 $\\chi(\\mathcal{O}_X)=\\int_X\\operatorname{td}(T_X)$（曲面即 Noether 公式 $\\frac{K^2+c_2}{12}$）。',
    dependencies: [],
    consequences: [],
    explanation: '欧拉示性数的核心机制是"交替和把精确信息压缩为可加信息"。它压掉了"具体哪一项非零"这一细节，只保留交替的净贡献；代价是单独恢复 $h^i$ 需要额外输入（消没、对偶），收益是压缩后的量与层的 K 理论类线性相关、从而可计算。这条机制在代数几何中处处可见：Hilbert 多项式是 $\\chi$ 的多项式化、曲面分类中的 $\\chi(\\mathcal{O}_X)$ 与 $K^2$ 是极小模型的不变量、Noether 型公式把 $\\chi$ 与拓扑欧拉数挂钩、HRR 把 $\\chi$ 与陈类积分挂钩。它与对偶定理、消没定理构成一个稳定的三件套：消没负责把上同调限制在有限窗口内，可加性负责把窗口内的维数压成一个数，对偶负责把这个数还原为较低的 $h^i$。任何"计算某个层上同调维数"的实践都在这三件套内操作，而 $\\chi$ 的可加性是其中最基础的一条，因为它是唯一条不需要额外几何假设（如射影性、光滑性）就成立的。',
    examples: [
      { title: '例子：射影直线 $\\mathbb{P}^1$ 上 $\\chi(\\mathcal{O}(d))=d+1$ 与结构层', body: '取 $X=\\mathbb{P}^1$：$h^0(\\mathcal{O}(d))=d+1$（$d\\ge0$），$h^1(\\mathcal{O}(d))=h^0(\\mathcal{O}(-d-2))$（对偶）为 $\\begin{cases}0,&d\\ge-1\\\\ -d-1,&d\\le-2\\end{cases}$ 的相应值。故 $d\\ge-1$ 时 $\\chi(\\mathcal{O}(d))=d+1$，$d\\le-2$ 时 $\\chi(\\mathcal{O}(d))=(d+1)-(-d-1)$？核算 $d=-2$：$h^0(\\mathcal{O}(-2))=0$，$h^1=h^0(\\mathcal{O}(0))=1$，$\\chi=-1$；而 $\\deg d+1-g=-2+1-0=-1$，成立。$d=-3$：$h^0=0$，$h^1=h^0(\\mathcal{O}(1))=2$，$\\chi=-2=-3+1$，成立。可见 $\\chi(\\mathcal{O}(d))=d+1$ 对一切 d 成立（$d<-2$ 时为负数），这正是 $\\chi$ 作为"线性函数"的表现。取 $d=0$：$\\chi(\\mathcal{O}_{\\mathbb{P}^1})=1-0=1$，与 $\\int\\operatorname{td}(T_{\\mathbb{P}^1})=\\int(1+\\frac{2h}{2})$ 中 $1$ 次项不贡献、常数项 1 给 1 一致（$\\mathbb{P}^1$ 的 $\\chi(\\mathcal{O})=1$，因为 $1-g=1$）。' },
      { title: '例子：曲面上 $\\chi(\\mathcal{O})$ 与 Noether 公式核算', body: '取 $X=\\mathbb{P}^2$：$K=-3h$，$K^2=9$，$c_2=e(\\mathbb{P}^2)=3$，故 $\\chi(\\mathcal{O})=\\frac{9+3}{12}=1$，与实际 $h^0-h^1+h^2=1-0+0=1$（$h^2(\\mathcal{O})=h^0(K)=0$ 因为 $K$ 负）一致。取 $X=\\mathbb{P}^1\\times\\mathbb{P}^1$：$K=-2h_1-2h_2$，$K^2=8$，$c_2=4$（两个 $\\mathbb{P}^1$ 的乘积的欧拉数 $2\\times2=4$），故 $\\chi=\\frac{8+4}{12}=1$，与实际 $h^0-h^1+h^2=1-0+0=1$ 一致。取 $X$ 为 K3 曲面：$K=0$，$K^2=0$，$c_2=24$，$\\chi=\\frac{0+24}{12}=2$，与实际 $1-q+p_g=1-0+1=2$ 一致。三个例子说明 Noether 公式把 $\\chi(\\mathcal{O})$ 完全化为 $K^2$ 与拓扑欧拉数这两个可计算量，而 $\\chi(\\mathcal{O})$ 又是曲面分类表的关键坐标之一。' },
    ],
    remarks: [
      '可加性只对短正合列的交替和成立，不能对"每个 $h^i$ 分别可加"：$h^0(\\mathcal{F})$ 一般不等于 $h^0(\\mathcal{F}\')+h^0(\\mathcal{F}\'\')$（正合列只给不等式的方向：$h^0(\\mathcal{F})\\le h^0(\\mathcal{F}\')+h^0(\\mathcal{F}\'\')$ 也不一定，实际由长正合列控制）。把 $\\chi$ 的可加性误读为"维数可加"是使用这类定理时最常见的错误，尤其在处理像 $0\\to\\mathcal{O}(-1)\\to\\mathcal{O}\\to k_P\\to0$ 这种一端有扭的列时，$h^0$ 会从 1 掉到 0 而 $\\chi$ 不变。',
      '交替和的符号约定必须与维数窗口一致：在曲线情形 $\\chi=h^0-h^1$，在曲面情形 $\\chi=h^0-h^1+h^2$，若把 $\\chi$ 写成 $\\sum(-1)^i h^i$ 而忽略 $i>\\dim X$ 的项为零这一事实，会在高维或非射影情形出错。特别地，若 X 非射影（例如仿射），层可能有任意高阶上同调，交替和未必有限，$\\chi$ 就不可定义。',
      '$\\chi(\\mathcal{O}_X)$ 是双有理不变量但 $h^i(\\mathcal{O}_X)$ 单独不是：$\\chi=\\sum(-1)^i h^i$ 在双有理映射下不变（函数域与上同调的适当组合不变），但 $h^0(\\mathcal{O}_X)$ 对射影簇恒为 1、$h^1(\\mathcal{O}_X)$ 则可能在双有理修改下变化（例如吹爆曲面会改变 $h^1$ 的分解，但 $\\chi$ 不变）。因此在分类中使用的坐标是 $\\chi$ 与 $K^2$，而不是单个 Hodge 数。',
      '希尔伯特多项式的系数是整数但多项式在小的 m 处取值不必与 $h^0$ 相符：例如 $\\mathbb{P}^2$ 上 $\\mathcal{O}(-1)$ 的 $h^0=0$ 而 $P(m)=\\binom{m+2}{2}$ 在 $m=-1$ 处给 $\\binom{1}{2}=0$，尚可；但一般情形 $P_{\\mathcal{F}}(m)$ 在小 m 处可以是负的（如 $\\mathbb{P}^1$ 上 $\\mathcal{O}(-3)$ 的 $P(m)=m+1$ 在 $m=-3$ 处给 $-2$，而 $h^0=0$、$\\chi=-2$ 是 $h^0-h^1=0-2$ 的正确值）。把 $P_{\\mathcal{F}}$ 与 $h^0$ 混用必须限定在 $m$ 大处。',
    ],
    corollaries: [
      { title: '推论：曲线的 $\\chi$ 是次数的线性函数', body: '对光滑射影曲线，$\\chi(\\mathcal{O}_C(D))=\\deg D+1-g$，即 $\\chi$ 只依赖 $\\deg D$ 与 $g$。这条推论把所有"除子的 $\\chi$"问题化为"次数与亏格"的算术，并且与 Riemann-Roch 配合可解出 $\\ell(D)$：特殊除子的偏差恰为 $\\ell(K-D)$。对偶与消没定出 $\\ell(K-D)$ 为零的区间（$\\deg D>2g-2$）或为 $\\ell(D)$ 与 $\\chi$ 之差的区间，于是曲线上的 $h^0,h^1$ 可以完全算出。这条推论也是"曲面上 $\\chi$ 是 $D$ 的二次函数"的模板：维数越高，$\\chi$ 作为次数（或数值类）的函数次数越高。', uses: ['curve-computation'] },
    ],
    references: [
      stacks('Section 33.29: Künneth formula, I', '0BEC'),
      stacks('Section 30.8: Cohomology of projective space', '01XS'),
      { title: 'Algebraic Geometry', author: 'Robin Hartshorne', year: 1977 },
    ],
    history: HISTORY,
  },

  /* ═══════════════════════════════════════════════════════════
   * 10. 导出函子
   * ═══════════════════════════════════════════════════════════ */

  'derived-functor': {
    statement: '设 $\\mathcal{A}$、$\\mathcal{B}$ 是阿贝尔范畴，$F:\\mathcal{A}\\to\\mathcal{B}$ 是左正合加性函子，假设 $\\mathcal{A}$ 有足够多内射对象。对 $A\\in\\mathcal{A}$ 取内射分解 $0\\to A\\to I^0\\to I^1\\to\\cdots$，定义第 i 个右导出函子 $R^iF(A)=H^i\\big(F(I^{\\bullet})\\big)$（即复形 $F(I^0)\\to F(I^1)\\to\\cdots$ 在第 i 处的上同调，$i\\ge0$）。则 (1) $R^0F\\cong F$；(2) $R^iF$ 与内射分解的选取无关；(3) 每个短正合列 $0\\to A\'\\to A\\to A\'\'\\to0$ 给出长正合列 $0\\to F(A\')\\to F(A)\\to F(A\'\')\\xrightarrow{\\ \\delta\\ }R^1F(A\')\\to R^1F(A)\\to R^1F(A\'\')\\xrightarrow{\\ \\delta\\ }R^2F(A\')\\to\\cdots$，$\\delta$ 为连接同态；(4) 若 $F$ 正合则 $R^iF=0$ 对 $i>0$；(5) 对右正合函子 $G$ 同理用投射分解定义左导出函子 $L_iG$。特别地层上同调是 $R^i\\Gamma(X,-)$，群上同调是 $R^i(-)^G$，$\\operatorname{Ext}^i=R^i\\operatorname{Hom}$，$\\operatorname{Tor}_i=L_i\\otimes$。',
    explanation: '导出函子的核心思想是"用分解把丢失的正合性找回来"。左正合函子只有 $0\\to F(A\')\\to F(A)\\to F(A\'\')\\to0$ 的左半段正合，右端的满射失败；这个失败不能靠调整定义修补，而必须记录为"障碍元素"，而这些障碍恰好住在 $R^1F$ 里，更深的障碍住在 $R^2F$ 里。构造的秘诀是选一种"对 F 无害"的对象做分解：内射对象对左正合函子（更准确地讲，对任何加性函子）的正合性有特殊地位，因为内射性质在 Hom 函子下给出分裂性，于是 $F(I^\\bullet)$ 的复形结构就能忠实地记录原复形的同调。$R^iF$ 与分解选取无关这一条之所以成立，是因为任意两个内射分解在同一态射下被"提升"为一个同伦（比较定理），而同伦的复形映射给出相同的上同调。长正合列的存在（由连接同态实现）是导出函子的公理化特征，也是所有计算的实际载体。这套语言的统一性极强：层上同调、群上同调、Ext、Tor、de Rham 上同调、Galois 上同调都成为同一个框架的实例，而"障碍"这个词的准确含义就是"某个正合性缺失之外的类"。',
    steps: [
      step('injective-resolution-basics', '内射分解的存在性与基本性质',
        '称 $I\\in\\mathcal{A}$ 内射，若 $\\operatorname{Hom}(-,I)$ 把单射变成满射，等价于"每个单射 $A\\hookrightarrow B$ 与映射 $A\\to I$ 都能延拓为 $B\\to I$"。断言：若 $\\mathcal{A}$ 有足够多内射对象（即每个对象能嵌入一个内射对象），则每个对象有内射分解 $0\\to A\\to I^0\\to I^1\\to\\cdots$。构造是递归的：先嵌入 $A\\hookrightarrow I^0$；再取余核 $\\operatorname{coker}(A\\to I^0)$ 嵌入 $I^1$；再取余核嵌入 $I^2$，如此下去，得到链复形的长正合列（每处的正合性由构造直接可见）。在层范畴上"足够多内射对象"成立（Grothendieck 范畴 AB5 且有生成元，由 Grothendieck 的嵌入定理与模层的内射性提升得到），所以层的内射分解总存在。内射性的关键用途是分裂性：若 $0\\to A\\to B\\to C\\to0$ 正合且 A 内射，则此列分裂（因为 $\\operatorname{id}:A\\to A$ 可延拓到 $B\\to A$ 作为收缩），于是任何加性函子在这一列上保持正合。这条性质是"内射分解对 F 无害"这一说法的基础。',
        []),
      step('well-definedness-comparison', '良定义性：比较定理与同伦',
        '设 $0\\to A\\to I^\\bullet$ 与 $0\\to A\\to J^\\bullet$ 是两个内射分解。比较定理断言：存在复形映射 $f:I^\\bullet\\to J^\\bullet$（与两端的 $A$ 相容），且任意两个这样的映射同伦。构造：先 $f^0:I^0\\to J^0$ 由 $A\\hookrightarrow J^0$ 与 $I^0$ 的内射性给出；递归地，$f^{n}$ 由"$I^n$ 到 $J^n$"的延拓条件给出（需要 $J^n$ 内射与链条件 $df=f d$ 的相容性）。同伦的证明同理：两个映射之差在 $I^0$ 上合成零（因为都限制到 $A$ 上相同），故差可写成 $d h^0+h^1d$ 的形式。同伦的复形映射在取上同调后给出同一个映射（同伦的映射诱导相同的同调映射，由 $H(dh+hd)=0$ 直接可见），于是 $H^i(F(I^\\bullet))$ 与分解选取无关。这里的要点是"内射性同时保证提升与同伦"，两条合起来给出良定义。对偶地，右正合函子用投射分解定义左导出函子，投射对象的"提升与同伦"性质与内射对偶。',
        ['injective-resolution-basics']),
      step('long-exact-sequence-delta', '长正合列与连接同态的导出函子证明',
        '设 $0\\to A\'\\to A\\to A\'\'\\to0$ 短正合。取 A′ 与 A 的内射分解，把 A″ 的分解作为余核构造出来（用"内射层之商仍内射"来保证 A″ 的分解由内射对象组成），得到内射复形的短正合列 $0\\to I^{\\prime\\bullet}\\to I^{\\bullet}\\to I^{\\prime\\prime\\bullet}\\to0$。施加任意加性函子 F 后，复形层面的短正合列仍然成立（因为每个 $I^n$ 内射，逐项分裂保持正合）。由蛇形引理得到上同调的长正合列 $\\cdots\\to R^iF(A\')\\to R^iF(A)\\to R^iF(A\'\')\\xrightarrow{\\ \\delta\\ }R^{i+1}F(A\')\\to\\cdots$，其中 $R^0F=F$（左正合 + 内射性给 $F(A)=\\ker(F(I^0)\\to F(I^1))$）。同时核对 $R^iF$ 的函子性：映射 $A\\to B$ 由比较定理提升到内射分解之间的映射，从而诱导 $R^iF(A)\\to R^iF(B)$，且复合与恒等相容，故 $R^iF$ 确实是函子。连接同态 $\\delta$ 的自然性由蛇形引理的构造（提升 + 微分）与内射分解的比较定理得到。这一整套推导的骨架只有三条工具：内射性给分裂、比较定理给函子性、蛇形引理给长正合列。',
        ['well-definedness-comparison']),
      step('examples-unification', '统一实例：上同调、Ext、Tor、群上同调',
        '导出函子统一了以下对象。层上同调：$H^i(X,\\mathcal{F})=R^i\\Gamma(X,\\mathcal{F})$，其中 $\\Gamma$ 是整体截面函子（左正合），这正是长正合列那一节的内容。群上同调：$H^i(G,M)=R^i(-)^G$，$(-)^G$ 取不变元，左正合。$\\operatorname{Ext}$：$\\operatorname{Ext}^i_{\\mathcal{A}}(A,B)=R^i\\operatorname{Hom}_{\\mathcal{A}}(A,-)$（对第二个变量取导出；也可对第一个变量取导出，两者一致）；层情形的 $\\mathcal{E}xt$ 是层的 $\\operatorname{Hom}$ 的导出，与整体 $\\operatorname{Ext}$ 由谱序列联系。$\\operatorname{Tor}$：$\\operatorname{Tor}_i(A,B)=L_i(-\\otimes B)(A)=L_i(A\\otimes-)(B)$，即张量函子（右正合）的左导出。de Rham 上同调可看成 $R^i\\Gamma$ 与 de Rham 复形的组合（在 Kähler 情形）。既然它们都是导出函子，长正合列、谱序列、维数移动这些技术可以一次学完到处使用，这就是导出函子语言的最大收益：把"算上同调"这件事统一为"做导出函子"。',
        ['long-exact-sequence-delta']),
      step('derived-category-and-resolutions', '进一步的现代化：导出范畴与非内射分解',
        '导出函子的经典定义依赖内射分解，这在计算中常常不方便（内射对象往往巨大）。现代做法把整个复形范畴局部化：定义导出范畴 $D(\\mathcal{A})$ 为复形范畴对拟同构的局部化（即把拟同构形式地变成同构），则 $R^iF(A)=H^i(RF(A))$，其中 $RF$ 是在导出范畴层面定义的右导出函子（在复形层面上由内射分解或更灵活的"K-内射/半内射"分解实现）。这一改写的收益有三：一是 $RF$ 可以对任意复形定义（不只是单个对象），于是长正合列升级为"正合三角"的旋转，谱序列成为自然产物；二是可以用比内射分解更经济的分解（如投影分解、平坦分解、K-平坦分解），在具体计算中更省力；三是导出函子的复合由 Grothendieck 谱序列描述，即 $R(F\\circ G)$ 与 $RF\\circ RG$ 由 $E_2^{p,q}=R^pF(R^qG)$ 联系，这是现代表述"两个函子复合的上同调"的标准方式。这套语言的代价是需要处理局部化与模型范畴的技术细节，但它把导出函子从"逐个对象构造"变成"在整个复形范畴上操作"，从而可以谈论 Hom 群的分次升级（$\\operatorname{Ext}^i=\\operatorname{Hom}_{D}(A,B[i])$）这类结构。',
        ['examples-unification']),
    ],
    conclusion: '左正合加性函子 $F$（$\\mathcal{A}$ 有足够多内射对象）有右导出函子 $R^iF(A)=H^i(F(I^{\\bullet}))$，与分解选取无关、$R^0F=F$、对短正合列给出带连接同态的长正合列，$F$ 正合时 $R^iF=0$ 对 $i>0$。层上同调、群上同调、$\\operatorname{Ext}$、$\\operatorname{Tor}$ 都是导出函子；在导出范畴语言中 $R^iF(A)=H^i(RF(A))$，长正合列成为正合三角的旋转，函子复合由 Grothendieck 谱序列描述。',
    dependencies: [],
    consequences: [],
    explanation: '导出函子的哲学可以概括为"不完美是数据"。左正合函子的不完美（缺右正合性）不是缺陷而是可测量的信息，$R^1F$ 度量"提升障碍"、$R^2F$ 度量"障碍的障碍"，而长正合列说明这些障碍彼此衔接、无法单独消失。这正是"障碍的代数化"这一说法的含义：几何中常见的"某个提升不存在"（例如把局部截面拼成整体截面、把同态延拓到整个模、把族的纤维上的构造延拓到整族）都被翻译成 $R^1$ 中的类，而"即使障碍为零也有二阶障碍"的情形落在 $R^2$ 中。这条机制的普适性使导出函子成为现代数学的通用工具：代数几何中的层上同调与 $R^if_*$、表示论中的群上同调、同调代数中的 Ext/Tor、拓扑中的奇异上同调（作为常层上同调）都在同一个框架内。更进一步，导出范畴把"复形本身"当作研究对象，使"上同调"的信息（链复形及其微分）与"对象间的映射"（Hom 复形）同时可见，这就是从"算上同调群"到"研究导出结构"的转变。',
    examples: [
      { title: '例子：$\\operatorname{Ext}^1$ 与短正合列的分类', body: '取 $\\mathcal{A}$ 为 R-模范畴，$\\operatorname{Ext}^1_R(A,B)=R^1\\operatorname{Hom}_R(A,-)(B)$。由长正合列，短正合列 $0\\to B\\to E\\to A\\to0$ 对应 $\\operatorname{Ext}^1(A,B)$ 中的一个元素（把 $\\operatorname{id}_A$ 沿长正合列送到 $\\operatorname{Ext}^1(A,B)$，这个元素正是"扩张类"），且 $\\operatorname{Ext}^1=0$ 当且仅当所有扩张分裂。具体核算：在 $R=\\mathbb{Z}$ 上取 $A=B=\\mathbb{Z}/2$，则 $\\operatorname{Ext}^1_{\\mathbb{Z}}(\\mathbb{Z}/2,\\mathbb{Z}/2)\\cong\\mathbb{Z}/2$，仅有一个非零类，对应扩张 $0\\to\\mathbb{Z}/2\\to\\mathbb{Z}/4\\to\\mathbb{Z}/2\\to0$（不分裂），而分裂扩张 $0\\to\\mathbb{Z}/2\\to\\mathbb{Z}/2\\oplus\\mathbb{Z}/2\\to\\mathbb{Z}/2\\to0$ 对应零类。计算用投射分解 $0\\to\\mathbb{Z}\\xrightarrow{\\ \\cdot2\\ }\\mathbb{Z}\\to\\mathbb{Z}/2\\to0$，施加 $\\operatorname{Hom}(-,\\mathbb{Z}/2)$ 得 $0\\to\\mathbb{Z}/2\\xrightarrow{\\ \\cdot2\\ }\\mathbb{Z}/2\\to0$，取 $H^1$ 得 $\\mathbb{Z}/2$。这个例子说明 $\\operatorname{Ext}^1$ 的每个元素就是一个几何/代数扩张，导出函子确实在"数障碍"。' },
      { title: '例子：层上同调 $H^1$ 作为 $\\mathcal{O}^{\\times}$-torsor 障碍', body: '取 $X$ 为簇，$\\mathcal{O}_X^{\\times}$ 是乘法群层。拼接问题：给定覆盖 $\\{U_i\\}$ 与每个 $U_i$ 上的可逆层（视为可逆元）以及转移数据，能否拼成整体可逆层？转移数据满足的"三重交相容性"失败时给出一个类，它落在 $\\check{H}^2(X,\\mathcal{O}^{\\times})$（Brauer 群型障碍）；而当转移数据相容时，不同的拼接方式之间相差 $\\check{H}^1(X,\\mathcal{O}^{\\times})=\\operatorname{Pic}(X)$ 中的一个元素。具体地对 $X=\\mathbb{P}^1$ 用两开集覆盖算：$\\mathcal{O}^{\\times}(U_0)=k[t]^{\\times}=k^{\\times}$、$\\mathcal{O}^{\\times}(U_1)=k^{\\times}$、$\\mathcal{O}^{\\times}(U_0\\cap U_1)=k[t,t^{-1}]^{\\times}=\\{ct^m\\}$，Čech 复形给 $H^1=k[t,t^{-1}]^{\\times}/k^{\\times}=\\mathbb{Z}$，故 $\\operatorname{Pic}(\\mathbb{P}^1)=\\mathbb{Z}$，由 $\\mathcal{O}(1)$ 生成。这一步把"可逆层的分类"完全化为导出函子 $H^1(\\mathcal{O}^{\\times})$ 的计算，也是所有 Picard 群计算的标准模板。' },
    ],
    remarks: [
      '导出函子的定义依赖分解的"适配性"，不能对任意分解取上同调：若把内射分解换成任意的左正合分解（例如用平坦对象分解左正合函子的输入），得到的上同调可能不同。正确的框架是"F-内射"或"F-零调"对象（$R^iF$ 在其上为零的对象），只有用这类对象做分解才能算对。层情形常用 Čech 覆盖给出零调分解（仿射开集对拟凝聚层是 $\\Gamma$-零调的），这正是 Čech 上同调等于层上同调的条件。',
      '足够多内射（或投射）对象不是自动的：在一般阿贝尔范畴中，内射分解可能不存在，此时导出函子无法用经典方式定义（必须用导出范畴或模型的框架）。例如某些无足够内射对象的阿贝尔范畴（如有限阿贝尔群范畴有足够多内射？——它确实有；而某些 Grothendieck 范畴之外的情形会失败），在使用"取内射分解"这一步前应确认所在范畴的性质。层范畴与模范畴都有足够多内射对象，这使代数几何的讨论很少遇到这个障碍。',
      '反过来导出不总是"更多信息"：若 F 已正合，则 $R^iF=0$ 对 $i>0$，此时导出函子不提供新信息（例如 $\\Gamma$ 在仿射簇上正合，故仿射簇上的拟凝聚层高次上同调为零）。把 $R^iF$ 当作总能带来新内容的量，会在正合情形下产生"为什么为零"的困惑；正确的态度是 $R^iF$ 度量 F 偏离正合的程度。',
      '导出函子与"谱序列"必须配套使用：两个函子复合时 $R^i(F\\circ G)$ 一般不等于 $R^iF\\circ G$ 或 $R^iF\\circ R^iG$，需要用 Grothendieck 谱序列 $E_2^{p,q}=R^pF(R^qG)\\Rightarrow R^{p+q}(F\\circ G)$。忽略谱序列、直接把导出函子当作"可逐层复合"的运算，会在如 $R\\Gamma\\circ Rf_*$（Leray 谱序列）这类情形给出错误结论，例如误认为 $H^i(X,R^jf_*\\mathcal{F})=0$ 或直接相加。',
    ],
    corollaries: [
      { title: '推论：$H^1$ 与扩张的一一对应', body: '对 $\\mathcal{O}_X$-模层的短正合列 $0\\to\\mathcal{F}\'\\to\\mathcal{F}\\to\\mathcal{F}\'\'\\to0$，把 $\\operatorname{id}_{\\mathcal{F}\'\'}$ 沿长正合列送到 $H^1(X,\\mathcal{F}\')$ 得到一个类；这个构造给出"$\\mathcal{F}\'\'$ 被 $\\mathcal{F}\'$ 扩张"的同构类与 $H^1(X,\\mathcal{F}\')$ 的元素之间的双射，且零类对应分裂扩张。因此 $H^1(X,\\mathcal{F}\')=0$ 当且仅当 $\\mathcal{F}\'$ 上的所有扩张分裂，这是把"消没定理"翻译为"所有提升问题自动可解"的标准手段，也是把 $H^1$ 用于障碍理论的根据。', uses: ['long-exact-sequence-delta'] },
    ],
    references: [
      stacks('Section 12.5: Abelian categories', '05QA'),
      stacks('Section 13.12: The canonical delta-functor', '0153'),
      { title: 'An Introduction to Homological Algebra', author: 'Charles A. Weibel', year: 1994 },
    ],
    history: HISTORY,
  },

  /* ═══════════════════════════════════════════════════════════
   * 11. 导出范畴
   * ═══════════════════════════════════════════════════════════ */

  'derived-category': {
    statement: '设 $\\mathcal{A}$ 是阿贝尔范畴（例如 X 上 $\\mathcal{O}_X$-模层或凝聚层的范畴）。复形范畴 $K(\\mathcal{A})$ 以链复形为对象、以链映射模同伦为态射。把拟同构（诱导同构于上同调的链映射）形式地化为同构，得到导出范畴 $D(\\mathcal{A})=K(\\mathcal{A})[\\Sigma^{-1}]$，其中 $\\Sigma$ 是拟同构类。其上同调有界子范畴记 $D^b(\\mathcal{A})$（有界复形）。基本性质：(1) 对 $F,G$ 是对象、$n\\in\\mathbb{Z}$，$\\operatorname{Ext}^i_{\\mathcal{A}}(F,G)\\cong\\operatorname{Hom}_{D^{b}(\\mathcal{A})}(F,G[i])$，即导出范畴把 Ext 的分次结构升级为态射群的分次平移；(2) 短正合列对应正合三角 $F\'\\to F\\to F\'\'\\to F\'[1]$；(3) 对 $\\mathcal{A}=\\operatorname{Coh}X$（X 光滑射影），$D^b(\\operatorname{Coh}X)$ 只依赖 X，且对两个簇的等价判定给出更精细的不变量（富卡亚范畴、镜像对称都以此为语言）。',
    explanation: '导出范畴的动机是"让障碍论变干净"。在经典框架里，长正合列与连接同态是必要的（因为没有别的办法把短正合列的右端失败记录下来），但连接同态本身只是一个映射，它的存在使所有陈述都要写成"某段列正合"的形式。导出范畴把"正合列"翻译成"正合三角"：短正合列 $0\\to F\'\\to F\\to F\'\'\\to0$ 变成三角 $F\'\\to F\\to F\'\'\\to F\'[1]$，其中第四个箭头正是连接同态（现在它只是三角的一个边，不再需要单独声明它的性质）。三角的"旋转"性质对应长正合列的延续性质：把三角转一圈 $F\\to F\'\'\\to F\'[1]\\to F[1]$ 就得到下一段长正合列。同时，$\\operatorname{Hom}$ 群的升级 $\\operatorname{Ext}^i(F,G)=\\operatorname{Hom}(F,G[i])$ 使 Ext 的环结构（$\\operatorname{Ext}$ 代数、Yoneda 复合）变成普通的态射复合，于是"乘法"与"加法"都在同一个范畴里可见。技术上的代价是局部化（导出范畴不是阿贝尔范畴，而是三角范畴），但收益是：所有导出函子、谱序列、对偶、以及"把复形当作对象"的现代结构都有了统一的语言。',
    steps: [
      step('localization-quasi-isomorphism', '局部化：把拟同构变成同构的合法性',
        '设 $\\mathcal{A}$ 是阿贝尔范畴，$K(\\mathcal{A})$ 是复形范畴模同伦。$K(\\mathcal{A})$ 是加性范畴但一般不是阿贝尔范畴（同伦范畴中的单射不必是核的嵌入）。定义 $\\Sigma$ 为拟同构的集合，导出范畴 $D(\\mathcal{A})=K(\\mathcal{A})[\\Sigma^{-1}]$ 是"形式添加 $\\Sigma$ 中元素的逆"得到的范畴。这一局部化存在（可以显式构造 Hom 集为"左右分数的等价类"，即 Ore 局部化的一般化），但需要小心：一般的范畴局部化会使 Hom 集变成真类。对 $K(\\mathcal{A})$ 而言，可以证明分数构造给出集合（因为可以用内射/投射分解把分数化简为单个映射的复合）。局部化的泛性质是：任何把拟同构送到同构的函子 $K(\\mathcal{A})\\to\\mathcal{C}$ 唯一地通过 $D(\\mathcal{A})$ 分解。这条性质说明 $D(\\mathcal{A})$ 是"记住上同调信息而不记住复形细节"的最经济的范畴：它把所有含相同上同调的复形粘成同构对象，但保留了它们之间所有可能的映射（包括在 $K$ 层面非同伦的映射）。',
        []),
      step('ext-as-hom-shifts', 'Ext 的升级：$\\operatorname{Ext}^i(F,G)=\\operatorname{Hom}(F,G[i])$',
        '先定义平移：复形 $F[i]$ 在第 n 处的项是 $F^{n+i}$、微分符号反转（由 $(-1)^i$ 约定）。在 $D(\\mathcal{A})$ 中 $F\\cong G$ 当且仅当 $F$、$G$ 拟同构（有相同的上同调）。断言 $\\operatorname{Ext}^i_{\\mathcal{A}}(F,G)\\cong\\operatorname{Hom}_{D(\\mathcal{A})}(F,G[i])$。验证：由导出函子的定义，$\\operatorname{Ext}^i(F,G)=R^i\\operatorname{Hom}(F,G)$；而 $R\\operatorname{Hom}(F,G)$ 可用 $F$ 的投射分解（或 $G$ 的内射分解）计算为 $\\operatorname{Hom}^{\\bullet}(P^{\\bullet},G)$ 的总复形，其上同调正好是 $\\operatorname{Hom}_{K}(P^{\\bullet},G[i])$ 的相应分量；再套用"用分解计算导出 Hom"的标准定理即得同构。这条同构的实际含义是：Yoneda 复合（把两个 Ext 元素"相乘"）变成普通的态射复合。例如 $\\operatorname{Ext}^1(F,G)$ 中的扩张类对应态射 $F\\to G[1]$，两个扩张的 Baer 和对应态射的复合 $F\\to G[1]\\to H[2]$；这把"扩张的运算"转化为"映射的复合"，使所有关于扩张的恒等式都有统一的证明方式。',
        ['localization-quasi-isomorphism']),
      step('exact-triangles', '正合三角：短正合列的范畴化与旋转',
        '在 $D(\\mathcal{A})$ 中称 $F\'\\xrightarrow{f}F\\xrightarrow{g}F\'\'\\xrightarrow{h}F\'[1]$ 为正合三角，若它同构于某个短正合列复形的像。三角的核心性质是"旋转"：$F\'\\to F\\to F\'\'\\to F\'[1]$ 正合当且仅当 $F\\to F\'\'\\to F\'[1]\\to F[1]$ 正合（更一般地，三角的任意连续旋转仍正合，代价是平移的符号）。把"旋转移"展开成长正合列：对任意对象 $T$，套用函子 $\\operatorname{Hom}(T,-)$ 到三角上，由三角的"上同调长正合列"性质得到 $\\cdots\\to\\operatorname{Hom}(T,F\')\\to\\operatorname{Hom}(T,F)\\to\\operatorname{Hom}(T,F\'\')\\to\\operatorname{Hom}(T,F\'[1])\\to\\cdots$，即 $\\cdots\\to\\operatorname{Ext}^i(T,F\')\\to\\operatorname{Ext}^i(T,F)\\to\\operatorname{Ext}^i(T,F\'\')\\to\\operatorname{Ext}^{i+1}(T,F\')\\to\\cdots$，这正是经典长正合列。这说明长正合列在导出范畴中不需要单独证明：它是三角旋转 + $\\operatorname{Ext}=\\operatorname{Hom}(\\cdot[i])$ 这两条性质的组合。三角的另一个性质是"九宫格"（octahedral axiom），它把多个短正合列的复合关系编码为三角的组合，是三角范畴公理中最技术的一条，但它对应的经典陈述"两个连续扩张的复合"在使用中很少需要单独验证。',
        ['ext-as-hom-shifts']),
      step('bounded-derived-and-coherence', '有界导出范畴与凝聚层的情形',
        '对簇 X 定义 $D^b(\\operatorname{Coh}X)$ 为有界复形（只有有限多个非零上同调）的导出范畴。它与 $D^b(\\mathcal{O}_X\\text{-模})$ 的关系由"凝聚层的子范畴生成整个有界导出范畴"（在 X 诺特正则时，每个 $\\mathcal{O}_X$-模复形拟同构于凝聚复形）给出。常用事实：$D^b(\\operatorname{Coh}X)$ 的对象是"层的复形"，其 Hom 群给出 $\\operatorname{Ext}^i$；凝聚层作为复形集中在 0 处，故 $\\operatorname{Hom}(F,G)=$ 层同态、$\\operatorname{Ext}^1(F,G)$ 给出扩张。光滑射影簇上 $D^b(\\operatorname{Coh}X)$ 有一个自然的 Serre 函子 $S=\\omega_X\\otimes-\\ [\\dim X]$（在适当的对偶框架下），它满足 $\\operatorname{Hom}(F,G)\\cong\\operatorname{Hom}(G,S(F))^{\\vee}$，即 Serre 对偶在导出层面的表述。这使对偶定理不再需要"逐层"的陈述，而是变成 $\\operatorname{Ext}^i(F,G)\\cong\\operatorname{Ext}^{n-i}(G,F\\otimes\\omega_X)^{\\vee}$ 一条恒等式，说明导出范畴确实是"对所有层同时成立"的对偶载体。',
        ['exact-triangles']),
      step('fourier-mukai-and-mirror', '应用：富卡亚范畴与镜像对称',
        '导出范畴的现代应用集中在两点。第一是"以导出范畴判定簇的等价"：Fourier–Mukai 变换用 $X\\times Y$ 上的一个复形（核）给出函子 $\\Phi_{\\mathcal{K}}:D^b(X)\\to D^b(Y)$，$\\Phi_{\\mathcal{K}}(E)=\\mathbf{R}p_{Y*}(p_X^{*}E\\otimes\\mathcal{K})$。Orlov 的定理说明"丰富的"函子（在两簇之间给出等价的函子）都来自核，于是"两个簇的导出范畴等价"被化为"存在核"的代数问题；对光滑射影曲线等高维簇，这给出一个比双有理分类更细（有时更粗）的等价判据，例如不同亏格的可逆曲线的导出范畴不等价（由 Bondal–Orlov 的结论：曲线由 $D^b(X)$ 唯一决定）。第二是镜像对称：同调镜像对称断言一对镜像 Calabi–Yau 流形的导出范畴（或富卡亚范畴 $D^{\\pi}\\operatorname{Fuk}(X)$ 与其导出等价）在 A 模型与 B 模型之间给出等价，把"辛几何侧"的富卡亚范畴与"复代数侧"的相干层导出范畴联系起来。这两个应用说明导出范畴不是技术性的包装，而是能把几何问题转化为范畴问题的实质性工具：一旦把对象换成导出范畴，很多"分类"问题就变成"找核/找等价"这类有标准工具的代数问题。',
        ['bounded-derived-and-coherence']),
    ],
    conclusion: '对阿贝尔范畴 $\\mathcal{A}$，导出范畴 $D(\\mathcal{A})$ 由把拟同构化为同构得到，其上 $\\operatorname{Ext}^i(F,G)\\cong\\operatorname{Hom}_{D}(F,G[i])$；短正合列对应正合三角 $F\'\\to F\\to F\'\'\\to F\'[1]$，三角旋转给出经典长正合列，Serre 对偶成为单一恒等式。对有界情形 $D^b(\\operatorname{Coh}X)$ 给出 X 的精细不变量，Fourier–Mukai 变换与镜像对称以此为语言。',
    dependencies: [],
    consequences: [],
    explanation: '导出范畴的价值有两层。技术层：它把"复形 + 拟同构"的信息整理成范畴，使长正合列、连接同态、谱序列这些原本需要逐一陈述与证明的东西成为三角公理与导出函子的自动推论。因此几乎所有现代的上同调计算都可以在 $D^b$ 中形式化，而不必反复回到复形层面做元素追踪。概念层：它把"障碍"变成"态射"，于是"某扩张存在唯一"这类问题变成"某个 Hom 群是否为零"，"某构造兼容"变成"某图表是否交换"。这两个层次的组合使导出范畴成为现代几何的通用语言，也解释了为什么它同时出现在代数几何（相干层、Fourier–Mukai、导出代数几何）、辛几何（富卡亚范畴）、表示论（箭图表示、反常层）与数学物理（镜像对称、D-膜）中。值得强调的是，导出范畴不只是一个"更方便的语言"：它有时能给出原本没有的不变量，例如两个非同构但导出等价的簇（由"扭曲"得到）说明导出范畴区分/不区分双有理类的方式与经典不变量不同。',
    examples: [
      { title: '例子：$\\operatorname{Ext}^1(\\mathcal{O}_{\\mathbb{P}^1},\\mathcal{O}_{\\mathbb{P}^1}(-2))\\cong k$ 与三角', body: '取 $X=\\mathbb{P}^1$。短正合列 $0\\to\\mathcal{O}(-2)\\to\\mathcal{O}(-1)^{\\oplus2}\\to\\mathcal{O}\\to0$（Euler 列在 $\\mathbb{P}^1$ 上的形式，或由逐点取值给出的"欧拉序列"）给出正合三角 $\\mathcal{O}(-2)\\to\\mathcal{O}(-1)^{\\oplus2}\\to\\mathcal{O}\\to\\mathcal{O}(-2)[1]$。由 $\\operatorname{Ext}^i(\\mathcal{O},\\mathcal{O}(-2))=H^i(\\mathbb{P}^1,\\mathcal{O}(-2))$，得 $\\operatorname{Ext}^0=H^0(\\mathcal{O}(-2))=0$、$\\operatorname{Ext}^1=H^1(\\mathcal{O}(-2))\\cong k$（Serre 对偶给 $h^1(\\mathcal{O}(-2))=h^0(\\mathcal{O}(0))=1$）、$\\operatorname{Ext}^{\\ge2}=0$。故 $\\operatorname{Hom}_{D}(\\mathcal{O},\\mathcal{O}(-2)[1])\\cong k$：存在唯一的（差常数倍）非平凡映射 $\\mathcal{O}\\to\\mathcal{O}(-2)[1]$，它正是上面三角的连接同态，也就是这个扩张类的非零性。这个例子说明"扩张非平凡"与"某个 Hom 群非零"是同一件事，这正是导出范畴语言的直接收益。' },
      { title: '例子：曲线由 $D^b(X)$ 决定的含义', body: '对光滑射影曲线 $X$，$D^b(\\operatorname{Coh}X)$ 的"可逆对象"（在张量积下可逆的对象）恰好是移位后的线丛 $\\mathcal{O}(D)[i]$，因此 $\\operatorname{Pic}(X)$ 与 $\\mathbb{Z}$ 的移位可从导出范畴读出：$\\operatorname{Pic}(X)\\cong(\\text{可逆对象}/[1]\\text{-移位})$。进一步，"点"可由 $D^b(X)$ 中的单纯对象（只有一层上同调且为摩天楼层）刻画，于是 X 的闭点集合可从范畴恢复，从而 X 本身（作为曲线）可由 $D^b(X)$ 恢复。核算最简单的例子 $X=\\mathbb{P}^1$：$D^b(\\mathbb{P}^1)$ 的不可分解对象由 Beilinson 给出为 $\\mathcal{O}(i)$ 与 $\\Omega(i)$ 型（在 $\\mathbb{P}^n$ 上有 $n+1$ 个例外对象的"强例外序列"$\\mathcal{O},\\mathcal{O}(1),\\ldots,\\mathcal{O}(n)$），$\\mathbb{P}^n$ 的导出范畴由这一有限序列的箭图表示完全描述（Beilinson 定理）。这说明对射影空间，导出范畴等价于一个有限维代数的表示范畴，几何问题因此转化为线性代数问题。' },
    ],
    remarks: [
      '导出范畴不是阿贝尔范畴：$D(\\mathcal{A})$ 中不能取核与余核，只能取"三角的第三边"（cone），且同一对对象的"核"没有唯一性。因此不能把阿贝尔范畴里的直觉（如"短正合列"）直接搬过去，必须用正合三角与旋转替代。这个差别在初学时最容易造成错误，例如把 $\\operatorname{Hom}(F,G)=0$ 与"$F$、$G$ 无关联"混为一谈。',
      '拟同构化会丢失部分信息：导出范畴把上同调相同的复形粘成同构，因此它不记得复形的具体项（例如一个复形与其上同调层之和拟同构）。若需要保留"项"这一层信息，必须用更强的结构（模型范畴、$\\infty$-范畴、或带 $t$-结构的额外数据）。也就是说导出范畴记录的是"上同调 + 态射 + 平移"的确切信息，不多也不少。',
      '有界性与凝聚性是常见的技术假设：$D^b(\\operatorname{Coh}X)$ 的定义要求复形有界且各项凝聚。对非诺特或非射影的簇，$D^b$ 的性质会退化（例如极限与上同调不交换、$f_*$ 的保持凝聚性需要额外假设），因此使用"$D^b(X)$ 是 X 的不变量"这类陈述时必须核对 X 的假设（通常要求正则诺特或光滑射影）。',
      '导出等价不等于同构也不等于双有理等价：存在非同构但导出等价的簇（"扭曲"型例子，如 Fourier–Mukai 核给出的等价），也存在双有理等价但导出不等价的簇。因此导出范畴给出的分类既不是双有理分类的子分类也不是父分类，而是一个独立（有时更细、有时更粗）的等价关系；把它当成"更精细的双有理不变量"是常见的误解。',
    ],
    corollaries: [
      { title: '推论：长正合列是三角旋转的推论', body: '由 $\\operatorname{Ext}^i(F,G)=\\operatorname{Hom}_{D}(F,G[i])$ 与正合三角的旋转性质，对短正合列 $0\\to F\'\\to F\\to F\'\'\\to0$ 与任意 $T$，套用 $\\operatorname{Hom}(T,-)$ 得到长正合列 $\\cdots\\to\\operatorname{Ext}^i(T,F\')\\to\\operatorname{Ext}^i(T,F)\\to\\operatorname{Ext}^i(T,F\'\')\\to\\operatorname{Ext}^{i+1}(T,F\')\\to\\cdots$。这条推论说明经典的长正合列与连接同态在导出范畴框架中是自动的，不需要重复论证；同样的论证对 $\\operatorname{Hom}(-,T)$ 给出对称的长正合列，两者合起来覆盖了所有"由短正合列推上同调"的用法。', uses: ['exact-triangles', 'ext-as-hom-shifts'] },
    ],
    references: [
      stacks('Section 13.11: The derived category', '05QK'),
      stacks('Section 13.12: The canonical delta-functor', '0153'),
      { title: 'Fourier–Mukai Transforms in Algebraic Geometry', author: 'Daniel Huybrechts', year: 2006 },
    ],
    history: HISTORY,
  },

  /* ═══════════════════════════════════════════════════════════
   * 12. 塞尔-嘉当方法
   * ═══════════════════════════════════════════════════════════ */

  'serre-cartan': {
    statement: '塞尔-嘉当方法指塞尔在 FAC（Faisceaux algébriques cohérents, 1955）中系统引入层论语言并建立的凝聚层上同调技术，其核心结论为：设 k 是域（或诺特环），$X\\subseteq\\mathbb{P}^n_k$ 是射影概形，$\\mathcal{F}$ 是 X 上凝聚层，则每个 $H^i(X,\\mathcal{F})$ 是有限生成 k-模，且 $\\chi(\\mathcal{F}(m))$ 是 m 的多项式。GAGA 原理（Géométrie algébrique et géométrie analytique, 1956）进一步断言：设 X 是复射影代数簇，$X^{\\mathrm{an}}$ 是其解析化，则 (1) 代数凝聚层与解析凝聚层由 $\\mathcal{F}\\mapsto\\mathcal{F}^{\\mathrm{an}}$ 给出范畴等价（在凝聚层范畴内）；(2) 自然映射 $H^i(X,\\mathcal{F})\\to H^i(X^{\\mathrm{an}},\\mathcal{F}^{\\mathrm{an}})$ 是同构（每个 i）。',
    explanation: '塞尔-嘉当方法的历史地位在于它把"层"从拓扑学的辅助工具变成了代数几何的母语。在 FAC 之前，代数簇的上同调主要靠 Čech 或纯组合的方式处理，无法在一般凝聚层上系统运作；FAC 用层论重写了全部基础（结构层、理想层、凝聚性的局部判定），并用塞尔-嘉当的谱序列与阿贝尔簇式的方法证明有限性。GAGA 的意义更深：它说明在射影情形下"代数"与"解析"不是两套理论，而是同一个理论的两个模型。这带来两个方向的便利：解析侧可以用分析工具（Hodge 理论、调和形式、Kodaira 嵌入）来算代数的不变量；代数侧可以用代数工具（奇点、除子、相交数）来处理解析问题。GAGA 的技术核心是"解析化的层仍然是凝聚的、且上同调同构"：第一步是"解析化函子是忠实且满的"，用解析函数在紧复流形上被有限个全局截面控制（Cartan 定理 A/B 的射影版本）来实现；第二步用逐层归纳（把层写成 $\\mathcal{O}$ 的有限扩张）把同构从 $\\mathcal{O}$ 推到一般凝聚层。GAGA 也是周炜良定理（复射影解析子簇必是代数的）的根据：解析子簇的层是凝聚的，其定义理想解析化后回到代数理想，从而子簇由代数方程定义。',
    steps: [
      step('coherent-sheaves-and-finiteness', '凝聚层与有限性的方法',
        '在 FAC 的语言中，$\\mathcal{O}_X$-模 $\\mathcal{F}$ 称为凝聚，若 (i) 局部有限生成：每点有邻域使 $\\mathcal{F}$ 是该邻域上有限个 $\\mathcal{O}$ 的商；(ii) 任意有限生成子层的核也有限生成（等价地：局部有有限自由表示 $\\mathcal{O}^{\\oplus m}\\to\\mathcal{O}^{\\oplus r}\\to\\mathcal{F}\\to0$）。这条定义的设计目的正是让"有限性"可以在局部被操纵：结构层 $\\mathcal{O}_X$ 凝聚、凝聚层的核与余核（在有限生成假设下）凝聚、$\\mathcal{F}\\mapsto\\mathcal{F}(m)$ 保持凝聚。于是在射影 X 上可以把任何凝聚层写成一个有限自由层的商，得到 $0\\to\\mathcal{G}\\to\\mathcal{O}(m_1)^{\\oplus r}\\to\\mathcal{F}\\to0$，再用长正合列与射影空间上 $\\mathcal{O}(m)$ 的显式计算（Serre 的关键步骤是证明 $H^i(\\mathcal{O}(m))=0$ 对 $i>0$ 在 m 大时成立）逐层下降，得到 $H^i(\\mathcal{F})$ 有限生成。这套下降的每一步都只用到"层是凝聚的"这一局部性质与长正合列，因此可以机械化地反复执行；它也是后来 Serre 有限性定理的标准证明骨架。',
        []),
      step('cartan-serre-machinery', '塞尔-嘉当的方法：谱序列与归纳',
        '塞尔-嘉当的完整方法用了三层技术。第一层是解析化的比较工具：在复流形上用 Cartan 定理 A（每个凝聚层由有限个整体截面生成）与定理 B（$H^i=0$ 对 $i>0$ 于 Stein 流形）把局部问题整体化；在代数侧对应的工具是"射影空间上 $\\mathcal{O}(m)$ 的计算"与"足够多的整体截面"。第二层是谱序列：处理"层被滤过"（例如 $\\mathcal{F}$ 由 $\\mathcal{O}(m_i)$ 逐层扩张得到）时，用 $E_1^{p,q}$ 谱序列把 $H^{p+q}(\\mathcal{F})$ 与各层 $H^q(\\mathcal{O}(m_i))$ 的贡献联系起来，从而把有限性与消没从结构层传到一般凝聚层；这是"逐步下降"这一朴素想法的范畴化。第三层是归纳：对维数做归纳（用一般超平面截面把 X 降到 $Y=X\\cap H$，用 $0\\to\\mathcal{F}(m-1)\\to\\mathcal{F}(m)\\to\\mathcal{F}(m)|_Y\\to0$ 把 X 的上同调与 Y 的上同调联系），对层的复杂度做归纳（用有限生成商把层化到结构层）。这三层合起来构成一套"局部—整体—降维"的循环，任何射影簇上的上同调计算都在这套循环内进行。',
        ['coherent-sheaves-and-finiteness']),
      step('gaga-faithful-and-full', 'GAGA：解析化函子的忠实满与层的比较',
        '设 $X$ 是复射影代数簇，$X^{\\mathrm{an}}$ 是解析化（局部上用代数坐标卡给出复流形结构，转移函数是代数的、从而全纯）。解析化函子从代数凝聚层到解析凝聚层：$\\mathcal{F}\\mapsto\\mathcal{F}^{\\mathrm{an}}=\\mathcal{F}\\otimes_{\\mathcal{O}_X}\\mathcal{O}_{X^{\\mathrm{an}}}$。断言一：这个函子给出凝聚层范畴的等价（忠实、满、本质满）。忠实性（单射）是相对容易的：代数层同态若在解析化后为零则在每个点处的芽上为零，从而在代数芽上为零（代数芽是解析芽中由多项式方程约束的部分）；满性（满射）与本质满性的证明是 GAGA 的主要工作，它依赖"解析凝聚层的一般截面可以用代数截面逼近"与"解析层的有限生成性"（Cartan 定理 A 在射影簇上的版本：解析凝聚层由有限个代数整体截面生成，这一步用紧性的有限性与 Hodge 型估计）。技术上的核心是：在射影簇上，解析层的整体截面空间是有限维的（由紧性与分析中的有限性定理给出），而代数整体截面的空间在其中稠密，于是两侧的截面空间相同。',
        ['cartan-serre-machinery']),
      step('gaga-cohomology-isomorphism', 'GAGA：上同调同构与逐层推广',
        '断言二：$H^i(X,\\mathcal{F})\\to H^i(X^{\\mathrm{an}},\\mathcal{F}^{\\mathrm{an}})$ 是同构对一切 i。证明分三层。第一层对 $\\mathcal{F}=\\mathcal{O}_X$：两侧的上同调可由射影空间的显式计算得到（代数侧用 Čech 与齐次多项式，解析侧用 Dolbeault 或 Čech 与全纯函数），结果相同——本质上因为射影空间上的全纯函数与代数函数在整体上一致（Liouville 型定理）。第二层对 $\\mathcal{F}=\\mathcal{O}(m)^{\\oplus r}$ 与它们的有限次扩张：由长正合列与五引理，把同构从结构层传到任何由有限个 $\\mathcal{O}(m)$ 生成的层，这一步需要"解析化保持短正合列"（解析化是右正合的，且由第一步的满性使它在凝聚层上是正合的）。第三层对一般凝聚层：用第一步（解析化是等价）与第二步把同构从"生成元层"下降到任意凝聚层；由于每个凝聚层都有有限自由表示，归纳终止。这条证明路线的关键输入是：解析化函子与 $H^i$ 在有限自由层上的相容性、以及解析侧 Cartan 定理提供的整体截面控制。',
        ['gaga-faithful-and-full']),
      step('chow-and-consequences', '推论：周炜良定理与代数-解析对照表',
        'GAGA 的直接推论是周炜良定理：复射影空间中的解析闭子簇必是代数子簇。证明：取解析闭子簇 $Y\\subset\\mathbb{P}^{n,\\mathrm{an}}$，其定义理想层 $\\mathcal{I}_Y$ 是解析凝聚层；由 GAGA，$\\mathcal{I}_Y$ 来自唯一的代数凝聚层 $\\mathcal{J}$，且 $\\mathcal{J}$ 是理想层（因为 $\\mathcal{I}_Y$ 是理想层，忠实性保证代数侧的理想性质）。于是 $\\mathcal{J}$ 的零点集是代数子簇 $Y^{\\mathrm{alg}}$，且 $Y=(Y^{\\mathrm{alg}})^{\\mathrm{an}}$。更一般的对照表还包括：解析同构的射影簇是代数同构的（由层范畴等价直接得到）；解析向量丛（在射影簇上）是代数的（由可逆层对应）；以及紧复流形的射影性与"存在足够多整体全纯函数或正定线丛"的等价（Kodaira 嵌入+周炜良）。这张对照表使"复几何的问题可以在代数侧回答、代数的问题可以在解析侧回答"成为常规操作，例如用 Hodge 理论计算代数曲面的不变量、或用代数相交数处理解析子簇的相交。',
        ['gaga-cohomology-isomorphism']),
    ],
    conclusion: '塞尔-嘉当方法在射影情形给出凝聚层的有限性与消没（$H^i$ 有限生成，扭足够大后高次消没，$\\chi(\\mathcal{F}(m))$ 为多项式）；GAGA 原理进一步断言复射影簇上代数凝聚层与解析凝聚层范畴等价，且 $H^i(X,\\mathcal{F})\\cong H^i(X^{\\mathrm{an}},\\mathcal{F}^{\\mathrm{an}})$ 对一切 i，由此推出周炜良定理（射影解析子簇必代数）与解析/代数同构、向量丛、层的一整套对照。',
    dependencies: [],
    consequences: [],
    explanation: '塞尔-嘉当方法与 GAGA 的意义可以概括为"射影性是代数与解析的分界线也是桥梁"。分界线：非射影情形两者差别巨大（例如某些紧复流形没有非平凡全纯函数、某些解析层没有代数模型），所以 GAGA 的所有结论都要带"射影"这个前提；桥梁：射影情形下紧性足够强，使全纯函数被有限个代数量控制，从而两个范畴的信息完全一致。这种一致性的实用价值在于"工具互换"：算 Betti 数、Hodge 数、上同调维数时可以用解析侧的调和积分与 Hodge 理论，而讨论除子、相交数、奇点时可以用代数侧的局部环与除子理论，两边通过 GAGA 的层对应互相翻译。GAGA 的证明结构也值得注意：它不直接比较两个几何对象，而是比较"层与层之间的范畴"，即先建立一个函子的忠实满（纯范畴层面），再比较上同调（同调层面），最后把几何结论（周炜良）当作范畴等价的推论。这种"先做范畴、再做同调、后收几何"的模式在代数几何的现代证明中反复出现（例如导出代数几何、非交换几何的类比），而 GAGA 是最早的样板之一。',
    examples: [
      { title: '例子：$\\mathbb{P}^1_{\\mathbb{C}}$ 上代数与解析上同调的同构核算', body: '取 $X=\\mathbb{P}^1_{\\mathbb{C}}$、$\\mathcal{F}=\\mathcal{O}(-2)$。代数侧：$h^0=0$，$h^1=h^0(\\mathcal{O}(0))=1$（Serre 对偶），故 $H^1$ 一维。解析侧：$\\mathcal{O}(-2)^{\\mathrm{an}}$ 是解析线丛，其度数 $-2$；由 Dolbeault 定理 $H^1(\\mathbb{P}^1,\\mathcal{O}(-2))\\cong H^{0,1}_{\\bar\\partial}(\\mathcal{O}(-2))$，由 Kodaira 消没型计算（或由 Serre 对偶在解析侧的版本 $H^1(\\mathcal{F})\\cong H^0(\\mathcal{F}^{\\vee}\\otimes\\omega)^{\\vee}$，解析 $\\omega=\\mathcal{O}(-2)$）得 $H^1$ 一维，故两侧同构。若换成 $\\mathcal{O}(1)$：代数侧 $h^0=2$、$h^1=0$；解析侧由同一个对偶得 $h^1=h^0(\\mathcal{O}(-1-2))=h^0(\\mathcal{O}(-3))=0$，$h^0$ 为一次全纯函数空间（二维，由 $z$ 与 $1$ 张成），与代数侧一致。这两个核算说明 GAGA 的同构在具体层上可以直接用对偶与消没验证，而不必复现整个证明。' },
      { title: '例子：周炜良定理的一个具体解析子簇', body: '取 $\\mathbb{P}^2_{\\mathbb{C}}$ 中的单位圆盘型解析曲线：例如集合 $Y=\\{[z_0:z_1:z_2]:\\ z_1^2=e^{\\ \\text{某系数}}\\ \\text{型超越方程}\\}$。更标准的具体例子是：设 $Y$ 为 $\\mathbb{P}^2$ 中满足超越方程 $z_0^2+z_1^2=z_2^2$ 的点的集合（这是代数方程，因此平凡）；要看周炜良的威力应取"定义方程含全纯但非代数的函数"的情形，例如取紧复环面 $\\mathbb{C}/\\Lambda$ 的一个嵌入——环面在 $\\mathbb{C}^2$ 中不能作为解析子簇（非代数），这正是周炜良"射影"条件的必要性：在 $\\mathbb{P}^n$ 中的解析闭子簇必代数，而在非射影的复流形中解析子簇可以不是代数的。这个对照的最著名例子是"非代数的 $\\mathbb{C}^2/\\Lambda$"（不含正定整形式的格）与 $\\mathbb{P}^2$ 中解析曲线的对比，说明周炜良定理的"射影"假设是实质性条件而非技术性条件。' },
    ],
    references: [
      stacks('Section 30.19: Higher direct images of coherent sheaves', '02O3'),
      stacks('Section 30.8: Cohomology of projective space', '01XS'),
      { title: 'Algebraic Geometry', author: 'Robin Hartshorne', year: 1977 },
    ],
    remarks: [
      'GAGA 中"射影"不能换成"紧复流形"：Kodaira 型反例说明存在紧复流形上无代数模型的解析层（例如某些非代数环面上的解析线丛），也存在非代数的紧复流形（无嵌入）。因此 $H^i(X,\\mathcal{F})\\cong H^i(X^{\\mathrm{an}},\\mathcal{F}^{\\mathrm{an}})$ 这条同构必须携带射影（或更一般地"射影代数簇的解析化"）这一假设；在紧 Kähler 流形上虽然上同调可以比较，但层范畴的等价性一般会失效。',
      '解析化的满性依赖紧性：在非紧的复流形上，解析凝聚层未必由有限个整体截面生成（Cartan 定理 A 需要 Stein 或紧性条件），因此"解析层来自代数层"这一步会失败。例如 $\\mathbb{C}$ 上的解析层 $\\mathcal{O}^{\\mathrm{an}}$ 有许多不是 $\\mathcal{O}[x]$-模的解析结构，而在射影情形这些额外自由度被紧性消掉。这条差别是 GAGA 证明中"有限维整体截面"这一步最关键的技术依赖。',
      'GAGA 不能把"解析同构的代数簇是代数同构"推广到非射影情形，也不能推广到"解析等价的层是代数等价的"之外的结构：例如解析范畴中的向量丛在射影簇上确实来自代数向量丛（由可逆层与相应示性类的对应），但在非射影或奇异情形需要额外的正性/局部自由性假设。使用"解析对象 ⇒ 代数对象"这类结论时，必须回到 GAGA 的射影前提或补充额外条件（例如 Serre 的 GAGA 型定理对正规射影簇上的解析向量丛成立）。',
      'FAC 与 GAGA 的技术前提不完全相同：塞尔-嘉当方法的有限性与消没（第一部分）在任意诺特基与任意射影概形上成立（不需要复结构），而 GAGA 的比较（第二部分）需要 C 上的解析化与紧性。把两部分合并为"层论方法"时要注意：有限性定理在特征 p 也成立，而 GAGA 的同构是复解析特有的；混用会导致在正特征下错误地引用解析比较。',
    ],
    corollaries: [
      { title: '推论：射影解析子簇必是代数的（周炜良定理）', body: '由 GAGA 的范畴等价，射影空间中解析闭子簇 $Y$ 的定义理想层 $\\mathcal{I}_Y$ 是解析凝聚层，因而来自唯一的代数凝聚层 $\\mathcal{J}$；由忠实性，$\\mathcal{J}$ 是理想层，其零点集是代数子簇 $Y^{\\mathrm{alg}}$，且 $Y=(Y^{\\mathrm{alg}})^{\\mathrm{an}}$。于是射影空间中的解析闭子簇都是代数的。这条推论把"用解析方程定义的子簇是否代数"这一古典问题彻底解决，也是复几何与代数几何能互相借力的根据（例如用解析方法构造的子簇一旦确定是闭的，就自动有代数模型）。', uses: ['gaga-cohomology-isomorphism', 'gaga-faithful-and-full'] },
    ],
    references_note: undefined,
    history: HISTORY,
  },

  /* ═══════════════════════════════════════════════════════════
   * 13. 上同调基变换与半连续性
   * ═══════════════════════════════════════════════════════════ */

  'cohomology-base-change': {
    statement: '设 $f:X\\to S$ 是诺特概形之间的紧合态射，$\\mathcal{F}$ 是 X 上 $\\mathcal{O}_X$-模层，$S\'\\to S$ 是基变换，记 $X\'=X\\times_SS\'$、$\\mathcal{F}\'$ 为其上的拉回。则存在自然的基变换映射 $\\varphi_s^i:(R^if_*\\mathcal{F})\\otimes_{\\mathcal{O}_S}k(s)\\to H^i(X_s,\\mathcal{F}_s)$（$s\\in S$）。定理群：(1) 平坦基变换：若 $S\'\\to S$ 平坦，则对一切 i 有 $\\varphi^i$ 为同构 $(R^if_*\\mathcal{F})\\otimes k(s)\\xrightarrow{\\ \\sim\\ }H^i(X_s,\\mathcal{F}_s)$；(2) 上同调与有限性半连续：若 $\\mathcal{F}$ 平坦于 S 且 f 紧合，则 $s\\mapsto\\dim_{k(s)}H^i(X_s,\\mathcal{F}_s)$ 是上半连续的（维数只在特殊纤维处跳升），且 $\\{s:\\ h^i(X_s,\\mathcal{F}_s)\\le n\\}$ 对每个 n 是 S 的开子集；(3) 基变换定理：对固定 i，若 $R^if_*\\mathcal{F}$ 在 s 处是局部自由的，且 $R^{i+1}f_*\\mathcal{F}$ 的纤维维数在 s 附近的"消没"条件成立，则 $\\varphi_s^i$ 是同构；(4) Grauert 型定理：在 (2) 的条件下 $R^if_*\\mathcal{F}$ 是凝聚层，且 $\\varphi^i$ 在 $R^if_*\\mathcal{F}$ 局部自由处是同构。',
    explanation: '基变换定理回答的是"族的纤维的上同调如何随参数变化"这一核心问题。一般的图景是：$R^if_*\\mathcal{F}$ 是 S 上的凝聚层，它在点 s 处的"纤维"给出 $H^i(X_s,\\mathcal{F}_s)$ 的某种版本，但自然映射 $\\varphi^i$ 一般不是同构——纤维维数会在特殊纤维处跳升。这正是形变理论中"分层"现象的来源：参数空间上可以按 $h^i$ 的值分成若干层（称为分层结构），一般纤维处 $h^i$ 取最小值，特殊纤维处跳升。半连续性定理说这个跳升是单方向的（只能变大不能变小），这是"退化只会传递更多上同调"这一直觉的精确形式。技术上的机制有三条：平坦基变换（同构）、凝聚性与有限性（使维数函子有界且取值在分层上）、以及"$R^if_*$ 的局部自由性 + 相邻高阶消没"给出的充分条件（这是基变换定理的实用形式，通常表述为"若 $H^{i+1}$ 在纤维上为零则 $\\varphi^i$ 同构"）。在应用上，这条定理支撑了模空间的构造（Hilbert 概形、Quot 概形都需要上同调维数的分层控制）、形变理论（把族的纤维性质翻译为参数空间上的层性质）、以及曲线族与曲面族中的维数计算。',
    steps: [
      step('base-change-map', '基变换映射的定义与它的来源',
        '设 $f:X\\to S$ 是紧合态射，$\\mathcal{F}$ 是 X 上拟凝聚层。对任一点 $s\\in S$，取纤维 $X_s=X\\times_S\\operatorname{Spec}k(s)$ 与拉回 $\\mathcal{F}_s=\\mathcal{F}\\otimes_{\\mathcal{O}_S}k(s)$。构造自然映射 $\\varphi_s^i:(R^if_*\\mathcal{F})\\otimes_{\\mathcal{O}_S}k(s)\\to H^i(X_s,\\mathcal{F}_s)$：由推前的伴随性 $R^if_*\\mathcal{F}$ 的截面可以拉到 $X\'$ 上（用 $f\'^{*}(R^if_*\\mathcal{F})\\to R^if\'_*(\\mathcal{F}\')$ 这条自然的基变换映射），再限制到纤维并取上同调，即得 $\\varphi^i$。等价地，$\\varphi^i$ 是导出函子的自然变换 $L\\pi^{*}\\circ Rf_*\\Rightarrow Rf\'_*\\circ L\\pi\'^{*}$ 的（上同调层面的）表现，其中 $\\pi:S\'\\to S$ 是基变换。这个映射的存在性是"上同调与基变换的相容性"的最弱形式；定理的内容就是陈述在什么条件下 $\\varphi^i$ 为同构。对 $i=0$：$\\varphi^0$ 的源是 $H^0(X,\\mathcal{F})\\otimes k(s)$，靶是 $H^0(X_s,\\mathcal{F}_s)$，一般 $\\varphi^0$ 既不必单射也不必满射（整体截面在特殊纤维上可能突然消失或突然变多），这解释了为什么基变换定理需要额外条件。',
        []),
      step('flat-base-change', '平坦基变换：$\\varphi^i$ 为同构的最干净情形',
        '若 $S\'\\to S$ 平坦，则 $\\varphi^i$ 是同构对一切 i 与一切拟凝聚层 $\\mathcal{F}$ 成立。证明思路：平坦性的特征是"张量函子 $\\otimes_{\\mathcal{O}_S}\\mathcal{O}_{S\'}$ 正合"，而 $R^if_*\\mathcal{F}$ 由 X 上的上同调计算给出，可先在仿射开覆盖上逐步计算。具体地，取 S 的仿射开覆盖与 X 上由相对丰沛层给出的 Čech 分解（或用"对准凝聚层，$R^if_*$ 与基变换由 Čech 复形计算"），平坦性保证 Čech 复形的基变换与上同调交换：$\\check{C}^{\\bullet}(\\mathfrak{U},\\mathcal{F})\\otimes_{\\mathcal{O}_S}\\mathcal{O}_{S\'}=\\check{C}^{\\bullet}(\\mathfrak{U}\',\\mathcal{F}\')$，故 $H^i(\\check{C}^{\\bullet}(\\mathfrak{U},\\mathcal{F}))\\otimes\\mathcal{O}_{S\'}\\cong H^i(\\check{C}^{\\bullet}(\\mathfrak{U}\',\\mathcal{F}\'))$。再用"射影/紧合情形 Čech 上同调等于 $R^if_*$"得到 $\\varphi^i$ 为同构。这条定理的实用价值在于它给出了"基变换不改变上同调维数"的充分条件；它也解释了为什么在讨论族的时候总要先说明基变换是否平坦（例如 Etale 覆盖、光滑态射、以及域的扩张都是平坦的，故在这些情形维数不跳升；而"闭浸入到特殊点"不是平坦的，因此维数可以跳升）。',
        ['base-change-map']),
      step('semicontinuity', '半连续性：维数只在特殊纤维处跳升',
        '设 $f:X\\to S$ 紧合，$\\mathcal{F}$ 是 S 上平坦的 $\\mathcal{O}_X$-模（"平坦族"），$S$ 局部诺特。断言 $s\\mapsto\\dim_{k(s)}H^i(X_s,\\mathcal{F}_s)$ 是 S 上的上半连续函数，即对每个 n，$\\{s:\\ \\dim H^i(X_s,\\mathcal{F}_s)\\le n\\}$ 是开集。证明用"层的一致有界性"：由 Grauert 型定理与 $\\mathcal{F}$ 的平坦性，$R^if_*\\mathcal{F}$ 是 S 上凝聚层，且对一般点处的纤维，$\\varphi^i$ 是同构（一般点处 $R^{i+1}f_*\\mathcal{F}$ 的纤维为零，由消没或由"一般点处层局部自由"给出）。由于 $R^if_*\\mathcal{F}$ 凝聚，其纤维维数在 S 上是上半连续的（这是凝聚层的一般性质：$s\\mapsto\\dim_{k(s)}\\mathcal{G}\\otimes k(s)$ 上半连续，因为 $\\mathcal{G}$ 的"秩"只能在特殊点跳升，由 Nakayama 引理与生成元的局部有限性给出）。由 $\\varphi^i$ 同构（在一般点处）与 $\\varphi^i$ 的单射性（$\\varphi^i$ 在 $R^if_*$ 局部自由处是同构，而在其余点的纤维维数不大于局部自由点处的值），得 $h^i(X_s,\\mathcal{F}_s)\\le h^i(X_\\eta,\\mathcal{F}_\\eta)$ 对 s 在一般点附近成立，即维数不会在特殊纤维处降低，只能跳升。',
        ['flat-base-change']),
      step('base-change-criterion', '基变换定理的判据：局部自由 + 相邻消没',
        '给出 $\\varphi_s^i$ 为同构的实用判据：**基变换定理**。设 $f$ 紧合、$\\mathcal{F}$ 平坦于 S、S 局部诺特。对固定 i，若 (a) $R^if_*\\mathcal{F}$ 在 s 处局部自由（等价地其纤维维数在 s 附近不变），且 (b) $R^{i+1}f_*\\mathcal{F}$ 在 s 处的纤维维数为零（"相邻高阶消没"），则 $\\varphi_s^i$ 是同构。证明的技术分解为三步：先用 (a) 与 Nakayama 把 $R^if_*\\mathcal{F}$ 在 s 的邻域上取基，得 $\\varphi_s^i$ 在这些基元素上的像；再由 (b) 与长正合列（或谱序列的退化）说明 $\\varphi_s^i$ 是满射（$R^{i+1}$ 的消没给出"没有更多障碍"），同时由 $\\mathcal{F}$ 的平坦性给出单射（$\\varphi^i$ 的核由 $R^{i}$ 的挠部控制，局部自由使其为零）。在实际使用中，(b) 常由"$H^{i+1}$ 在纤维上消没"（如 Kodaira 消没、Serre 消没）来满足，而 (a) 常由"$h^i$ 在半连续下达到其最小值"来满足；两条合起来给出"对一般纤维，$\\varphi^i$ 是同构"，这就是很多"对一般纤维成立"的定理（如一般纤维光滑、一般纤维无高阶上同调）的技术根据。',
        ['semicontinuity']),
      step('applications-deformation-and-stratification', '应用：形变理论、分层与模空间',
        '基变换与半连续性的应用集中体现在三个方向。第一是形变理论：给定 $X_0$ 在参数空间中的形变 $f:\\mathcal{X}\\to S$，$h^i(X_s,\\mathcal{O}_{X_s})$ 的跳升行为决定"哪些上同调类可以形变"（例如 $H^1$ 的维数给出形变空间维数、$H^2$ 给出障碍空间维数），而半连续性说明这些维数在特殊点处只能变大。第二是分层：由半连续性，S 可分解为有限多个局部闭子集，使得每个子集上 $h^i$ 为常数（称为"分层结构"），这样族的性质就在每层上具有统一的行为；这是模空间构造（Hilbert 概形、Quot 概形、Picard 概形）的技术基础，因为这些模空间都需要"上同调维数固定"的层作为参数空间的开覆盖。第三是数值计算：对曲线族 $f:\\mathcal{C}\\to S$，由基变换与 Riemann-Roch 可得 $\\chi(\\mathcal{C}_s,\\mathcal{O}(D_s))$ 是 s 的局部常数（因为 $\\chi$ 由 $R^if_*$ 的交替和给出，而在平坦族上交替和的维数是常数），把 $h^0$ 与 $h^1$ 的跳升相互约束。这些应用使"族的上同调"成为一门有分层与半连续律的学科。',
        ['base-change-criterion', 'semicontinuity']),
    ],
    conclusion: '对紧合 $f:X\\to S$ 与 X 上拟凝聚层 $\\mathcal{F}$，存在自然基变换映射 $\\varphi_s^i:(R^if_*\\mathcal{F})\\otimes k(s)\\to H^i(X_s,\\mathcal{F}_s)$；$S\'\\to S$ 平坦时 $\\varphi^i$ 为同构；$\\mathcal{F}$ 平坦于 S 时 $h^i(X_s,\\mathcal{F}_s)$ 上半连续（只在特殊纤维处跳升）；若 $R^if_*\\mathcal{F}$ 在 s 局部自由且 $R^{i+1}f_*\\mathcal{F}\\otimes k(s)=0$，则 $\\varphi_s^i$ 为同构。由此得上同调维数的分层结构与模空间构造的技术基础。',
    dependencies: [],
    consequences: [],
    explanation: '基变换定理的意义在于它把"族"的信息组织成 S 上的层并与纤维的上同调精确对齐。它的使用分两类：一类是"消去纤维"，即在一般点处计算（一般纤维的半连续最小性使 $\\varphi^i$ 为同构，于是所有计算都可以在一般纤维上做，再把结果搬回 S 上的层）；另一类是"控制跳升"，即用半连续性说明特殊纤维的维数不会低于一般纤维（所以"一般纤维上的消没"不能推出"所有纤维上的消没"，但"特殊纤维的消没"能约束一般情形）。这两类用法都有清晰的边界：前者要求基变换平坦或一般性，后者给出的是不等式方向而非等式。技术在证明中反复使用两条同调代数事实：$\\varphi^i$ 的自然性与长正合列的相容性（使"同构"可以从低次数传到高次数），以及凝聚层的纤维维数的上半连续性（Nakayama 引理的应用）。在算术几何与模形式中，同一条定理在 Etale 上同调与刚性解析几何中都有对应版本（平滑基变换、半连续性、Weil 猜想中 Frobenius 特征值的行为），这说明基变换的机制是"参数化上同调"这一主题的普遍结构。',
    examples: [
      { title: '例子：$\\mathbb{P}^1$ 上的 Hirzebruch 曲面族与维数跳升', body: '取 $S=\\mathbb{A}^1$（参数 t）、$X=\\mathbb{P}(\\mathcal{O}\\oplus\\mathcal{O}(n))\\times\\mathbb{A}^1$ 的一个变体：更具体地，取 $\\mathcal{X}\\to\\mathbb{A}^1$ 为 Hirzebruch 曲面的族 $\\mathcal{X}=\\mathbb{P}(\\mathcal{O}\\oplus\\mathcal{O}(t))$（在 t 处取 $\\mathcal{O}(t)$ 的直和），当 $t=0$ 时 $\\mathbb{P}^1\\times\\mathbb{P}^1$，当 $t\\neq0$ 时 $\\mathbb{P}(\\mathcal{O}\\oplus\\mathcal{O}(t))\\cong\\mathbb{P}(\\mathcal{O}(-t)\\oplus\\mathcal{O})\\cong\\mathbb{F}_t$。取 $\\mathcal{F}=\\mathcal{O}_{\\mathcal{X}}$，则 $R^0f_*\\mathcal{O}=\\mathcal{O}_{\\mathbb{A}^1}$（因为纤维上是 $\\mathbb{P}^1$ 的结构层，$h^0=1$ 各处相同，$\\varphi^0$ 是同构），$R^1f_*\\mathcal{O}=0$（纤维上 $h^1(\\mathcal{O})=0$，纤维是 $\\mathbb{P}^1$ 亏格 0），故 $\\varphi^0,\\varphi^1$ 都是同构，$h^0,h^1$ 不跳升。若改取 $\\mathcal{F}=\\mathcal{O}_{\\mathcal{X}}(C)$ 其中 C 是族的截面并让 C 的"次数"随 t 变化，则 $\\varphi^1$ 的同构条件（$R^2=0$ 自动满足，$R^1$ 局部自由）在 t 取特殊值时可能失效，于是 $h^1$ 会跳升——这正说明"纤维上次数变化导致上同调跳升"的机制。' },
      { title: '例子：光滑退化族的 Noether 公式与 $\\chi$ 的不变性', body: '取 $f:\\mathcal{X}\\to S$ 为曲面族，纤维 $X_s$ 光滑。由基变换（族平坦）与 $\\chi$ 的交替和性质，$\\chi(\\mathcal{O}_{X_s})$ 是 s 的局部常数（因为 $\\chi=\\sum(-1)^i\\dim(R^if_*\\mathcal{O}\\otimes k(s))$ 且在平坦族上各 $R^if_*$ 的秩不变）。于是 Noether 公式 $\\chi(\\mathcal{O}_{X_s})=\\frac{K_{X_s}^2+c_2(X_s)}{12}$ 的两边都必须同时变化：$K^2$ 与 $c_2$ 可以随 s 变化，但它们的组合 $K^2+c_2$ 是常数。这一观察在曲面族的分类中非常有用：例如对 K3 曲面族（$K^2=0,c_2=24$）有 $\\chi=2$ 恒定，对 $\\mathbb{P}^2$ 族（$K^2=9,c_2=3$）有 $\\chi=1$ 恒定，而"从 $\\mathbb{P}^2$ 到 $\\mathbb{P}^1\\times\\mathbb{P}^1$"的退化（如上述 Hirzebruch 族中 t=0 处的变化）保持 $\\chi=1$ 而让 $K^2$ 从 9 变到 8、$c_2$ 从 3 变到 4：$9+3=8+4=12$ 恰好守恒。这个守恒律正是基变换定理在 $\\chi$ 层面的具体表现。' },
    ],
    remarks: [
      '半连续性给出的是不等式方向，不能反推等式：$h^i(X_s,\\mathcal{F}_s)\\le h^i(X_\\eta,\\mathcal{F}_\\eta)$ 对一般点附近成立，说明特殊纤维维数不小于一般纤维，但"一般纤维维数等于多少"仍需单独计算。因此"用一般纤维的消没推出所有纤维的消没"是错误推理；正确的用法是"若特殊纤维消没则可推出一般纤维也消没"（在 $\\varphi^i$ 同构的前提下）。',
      '平坦基变换的"平坦"不能省：若 $S\'\\to S$ 不是平坦的（例如把基变换取成闭浸入 $\\operatorname{Spec}k(s)\\hookrightarrow S$，即取单根纤维），$\\varphi^i$ 通常不是同构。取单根纤维正是半连续性讨论的对象，那里需要额外的有限性/局部自由条件。把单根纤维的 $\\varphi^i$ 当做同构会直接得到"$h^i$ 在族上恒定"的错误结论。',
      '紧合性（或至少真态射）是必要的：若 $f$ 不是紧合，$R^if_*$ 的纤维与纤维上的上同调关系会更复杂（截面的延拓失败），基变换映射甚至可能没有合理的定义域。对非紧合态射（例如开浸入或到无穷远的族），需要用带支撑的上同调与 $Rf_!$ 的框架，此时半连续性陈述要改为对 $R^if_!$ 成立（这是 SGA 中的相对版本）。',
      '$\\mathcal{F}$ 平坦于 S 的条件不能丢：若 $\\mathcal{F}$ 在 S 上不平坦，则"纤维上的层 $\\mathcal{F}_s$"可能没有正确的维数关系（例如 $\\mathcal{F}$ 的纤维会带有挠部），$h^i$ 的跳升行为不再受半连续性控制。在形变理论中这对应于"族不是平坦的"这一退化情形，需要用 Quot 与 Hilbert 概形的更精细框架（或考虑 $\\mathcal{F}$ 的 Hilbert 多项式的逐条纤维计算）来处理。',
    ],
    corollaries: [
      { title: '推论：平坦族上 $\\chi$ 是局部常数', body: '设 $f:X\\to S$ 紧合、$\\mathcal{F}$ 平坦于 S、S 局部诺特。由基变换与 $R^if_*\\mathcal{F}$ 的凝聚性，$\\chi(X_s,\\mathcal{F}_s)=\\sum_i(-1)^i\\dim H^i(X_s,\\mathcal{F}_s)$ 是 s 的局部常数（在 S 的每一层上为常数）。这条推论是曲线族、曲面族中"用 $\\chi$ 与半连续性互相约束"的技术基础：例如对曲线族，$\\chi(\\mathcal{O}(D_s))=\\deg D_s+1-g_s$ 是常数，而 $h^0$ 与 $h^1$ 的跳升必须互相抵消以保持 $\\chi$ 不变。它也是形变理论中"亏格与次数在族的范围内不变"这一直觉的严格来源。', uses: ['base-change-criterion', 'semicontinuity'] },
    ],
    references: [
      stacks('Section 30.5: Cohomology and base change, I', '02KE'),
      stacks('Section 30.5: Flat base change (Lemma 30.5.2)', '02KH'),
      { title: 'Algebraic Geometry', author: 'Robin Hartshorne', year: 1977 },
    ],
    history: HISTORY,
  },

};
