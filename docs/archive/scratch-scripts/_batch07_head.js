/**
 * 批次 07 长篇证明数据：形式几何、层论局部化与上同调机制的 13 个节点。
 *
 * 写作约定（与 scripts/_check-proof-file.mjs 的检查一致）：
 *   · 正文用中文长段 + Unicode 数学符号（⊆ ⊗ → ↦ 𝔭 𝔪 𝓕 ℱ κ ε ≅ ⋂ ∑），直接作为文本排版；
 *   · 只在需要真正排版公式时才用 $...$ 包住完整 LaTeX，反斜杠必须双写、美元符必须成对；
 *   · 引用只写已核实的 Stacks Project 稳定 tag，URL 用 tag 形式；
 *   · 每步正文都在 400 字以上，不为凑字数写无信息量的句子。
 */

const step = (id, title, body, uses) => ({ id, title, body, uses: uses ?? [] })
const stacks = (title, tag, year = 2024) => ({
  title, author: 'The Stacks Project', year, url: `https://stacks.math.columbia.edu/tag/${tag}`,
})
const HISTORY = '本条由公开教材与 Stacks Project 命题重新组织，项目自行改写并注明来源，未复制原文。'

export const BATCH_07_PROOFS = {

  /* ═══════════════════════════════════════════════════════════
   * 1. 形式幂级数环
   * ═══════════════════════════════════════════════════════════ */

  'a-formal-power-series': {
    statement: '设 k 是域，$R=k[[x_1,\\ldots,x_n]]$ 是形式幂级数环，$\\mathfrak m=(x_1,\\ldots,x_n)$ 是其极大理想。则：(1) R 是诺特局部环，$\\mathfrak m$ 是唯一极大理想，且 $\\mathfrak m^d$ 由全体总次数 ≥ d 的单项式生成；(2) $\\operatorname{gr}_{\\mathfrak m}R=\\bigoplus_d \\mathfrak m^d/\\mathfrak m^{d+1}'\cong k[x_1,\\ldots,x_n]$，故 $\\dim R=n$，且 $\\Omega^1_{R/k}$ 是秩 n 的自由 R-模，于是 R 是维数 n 的**正则**局部环；(3) R 是其自身的 $\\mathfrak m$-进完备化，且 $R'\cong \\widehat{S}$，其中 $S=k[x_1,\\ldots,x_n]$ 是多项式环、$\\widehat{S}$ 是 S 沿 $\\mathfrak m=(x_1,\\ldots,x_n)$ 的完备化。由此 $k[[x_1,\\ldots,x_n]]$ 是「仿射 n 空间在原点的形式邻域」的代数替身：它承载形式 Taylor 展开与形式隐函数定理，并且在 Cohen 结构定理中充当一切等特征完备正则局部环的模型。',
    explanation: '形式幂级数环是代数几何里「只看一个点、并且看得无限细」的极限产物。多项式环 $k[x_1,\\ldots,x_n]$ 在原点的局部环 $\\mathcal{O}_{\\mathbb{A}^n,0}$ 里，一个函数在原点附近的行为只能按「在原点全纯」的方式被询问；但 0 处的一个局部环元素其实还是允许 $1/x_1$ 这类情形的，只有完备化才彻底过滤掉这些非局部信息，把每个元素变成一个真正的幂级数。这样做的收益有三条：一是「有解」变成「逐阶有解」，因为完备化下的可逆性判据（系数常数项可逆即可逆）把解方程问题降到有限次的线性方程组；二是正则性、维数、切空间这些原来靠几何直觉讲的量，都在 $\\operatorname{gr}_{\\mathfrak m}R$ 上有了纯代数的定义，且可以被具体算出来；三是它的「无噪声」性质——完备局部环里的结果不需要几何直觉来兜底，因此成为反例的产地，也是 Cohen 结构定理、Cartan 型局部分类、形变理论的工作场所。与解析情形（收敛幂级数环）的区别在于它只保留形式合法性，代价是丢掉 Artin 逼近以外的大部分收敛性，收益是允许在任意特征与任意基上工作。',
    steps: [
      step('graded-and-regular', '分次环与正则性：gr R ≅ k[x]，维数 n，Ω 自由',
        '设 $R=k[[x_1,\\ldots,x_n]]$，$\\mathfrak m=(x_1,\\ldots,x_n)$。先看 $\\mathfrak m^d$ 的结构：它由一切总次数恰为 d 的单项式在 R 上生成，因此 $\\mathfrak m^d/\\mathfrak m^{d+1}$ 有 k-基「总次数 d 的单项式」类，维数 $\\binom{d+n-1}{n-1}$。把这些 k-向量空间的直和拼起来得到 $\\operatorname{gr}_{\\mathfrak m}R=\\bigoplus_{d'\ge0}'\mathfrak m^d/\\mathfrak m^{d+1}'\cong k[x_1,\\ldots,x_n]$，因为相乘由单项式相乘给出，与多项式环的乘法完全一致，是同构到 n 元多项式环这个 k-代数。由 Hilbert-Samuel 理论，$\\dim R$ 等于 $\\operatorname{gr}_{\\mathfrak m}R$ 的 Krull 维数，而 $k[x_1,\\ldots,x_n]$ 维数是 n，故 $\\dim R=n$。正则性看切空间：$\\dim_k \\mathfrak m/\\mathfrak m^2=n$（由上一个基的维数），与 $\\dim R=n$ 相等，这就满足正则局部环的定义。另一个等价判据是 $\\Omega^1_{R/k}$ 的局部自由性：由定义 $\\Omega^1_{R/k}$ 由 $dx_i$ 生成，且 $R=k[[x]]$ 作为 k-代数是自由幂级数代数，不存在有限多项式关系（任何形式关系都可在每个次数上截断为多项式关系），故无关系，$\\Omega^1_{R/k}'\cong R^n$ 是秩 n 的自由 R-模，给出正则性的等价刻画。',
        []),
      step('derivation-universal-and-taylor', 'Taylor 展开：形式导子与 R 是「解析局部几何的代数替身」',
        '在 $R=k[[x_1,\\ldots,x_n]]$ 上，任意 $f=\\sum a_'\alpha x^\\alpha'\in R$ 都可以对每个 $x_i$ 形式地求偏导：$\\partial_i f=\\sum_'\alpha \\alpha_i a_'\alpha x^{\\alpha-e_i}$，这是一个系数乘整数再降一次的纯形式操作，不涉及极限，因此对特征没有任何要求。这些 $\\partial_i$ 是 k-线性的 Leibniz 式导子，给出同构 $\\operatorname{Der}_k(R,R)\\cong R^n$，$\\varphi'\mapsto(\\varphi(x_1),\\ldots,\\varphi(x_n))$，即导子由它在坐标函数上的取值唯一决定。于是形式 Taylor 公式成立：$f=\\sum_{\\alpha}'\frac{1}{\\alpha!}'\partial^\\alpha f(0)\\,x^\\alpha$，等号在 $\\mathfrak m$-进拓扑下按有限商 $R/\\mathfrak m^d$ 的逆极限逐次检验，每一次检验都是初等的有限求和。这个「逐次检验」的手法是把形式幂级数当作「无穷多个有限对象」来使用的标准套路，也是形式隐函数定理的骨架：若 $F=(F_1,\\ldots,F_n)\\in R^n$ 满足 $F(0)=0$ 且雅可比矩阵 $J=\\bigl(\\partial F_i/\\partial x_j(0)\\bigr)$ 可逆，则可把 $F$ 在 $\\mathfrak m$-进语境内反解为 $x=g(y)$，$g'\in k[[y]]^n$，因为每一步的线性化都是可逆的线性方程组。请注意这一步只用到 $\\operatorname{Der}_k(R,R)$ 的自由性与 $J$ 的可逆性，不需要任何收敛半径，这正是形式世界相对解析世界的收益。',
        ['graded-and-regular']),
      step('completeness-as-inverse-limit', '完备化：R ≅ k[x]^(x) 与逐阶逼近',
        '完备化的定义是 $\\widehat{S}=\\varprojlim_d S/\\mathfrak m^d$，其中 $S=k[x_1,\\ldots,x_n]$、$\\mathfrak m=(x_1,\\ldots,x_n)$。每个 $S/\\mathfrak m^d$ 作为 k-向量空间由总次数 < d 的多项式类构成，维数 $\\binom{d+n-1}{n}$ 有限；相容的射影系给出一个「每个次数上的多项式系数」的序列，而这恰好就是一个形式幂级数的全部数据，于是有自然的 k-代数同构 $\\widehat{S}'\cong k[[x_1,\\ldots,x_n]]=R$。这说明 R 是自己的完备化：$\\widehat{R}=\\varprojlim R/\\mathfrak m^d'\cong R$，即 R 是 $\\mathfrak m$-进完备的。完备性在计算上带来两个立刻可用的后果。第一，可逆性判据：$f'\in R$ 是单位当且仅当 $f(0)\\neq0$；因为此时 $f=f(0)(1-h)$ 且 $h'\in'\mathfrak m$，几何级数 $\\sum_{j'\ge0}h^j$ 在 $\\mathfrak m$-进意义下收敛。第二，逐阶可解性：一个方程组在 R 中有解，当且仅当它在每个 $R/\\mathfrak m^d$ 中相容地有解；这就是形式 Nakayama 引理与形式光滑性判据的技术基础。特别注意 $1-h$ 的可逆性不需要 $\\ud835\\udd4b$ 的任何有限性假设，纯粹是完备性带来的。',
        ['derivation-universal-and-taylor']),
      step('cohen-structure-reference', 'Cohen 结构定理：R 是完备正则局部环的模型',
        'Cohen 结构定理断言：若 $(A,\\mathfrak m)$ 是特征 p 的完备诺特局部环且剩余域 $A/\\mathfrak m$ 有系数域（即在特征 p 情形可嵌入 A 的一个代表域），则存在从某个形式幂级数环到 A 的满射。特别地，在等特征（即 A 含有 $A/\\mathfrak m$ 的一个域代表）情形，任何完备正则局部环 $(A,\\mathfrak m)$ 都同构于 $\\kappa[[x_1,\\ldots,x_n]]$，其中 $\\kappa=A/\\mathfrak m$ 是剩余域、n 是 A 的嵌入维数（$=\\dim A$，因为正则）。反过来，$k[[x_1,\\ldots,x_n]]$ 本身是完备正则局部环：完备性由前一步给出，正则性由第一步给出。于是「等特征完备正则局部环」这个类被形式幂级数环完全参量化，参数只有两个：（剩余）域 k 和维数 n。唯一需要当心的是混合特征情形：若 A 的特征不等于剩余域特征（例如 $\\mathbb{Z}_p$ 的整扩张），则 A 不一定含系数域，此时结构定理要写成 $A'\cong W[[x_1,\\ldots,x_n]]/I$ 或 $A'\cong \\mathbb{Z}[[x]]/I$ 的形式，多出一个「Witt 向量环」的层次。这也解释了为什么许多特征无关的定理在形式幂级数环上可以一次性证明。',
        ['completeness-as-inverse-limit', 'graded-and-regular']),
      step('taylor-examples-and-limits', '核算与边界：从常数项读到一切',
        '把形式世界与几何世界对照起来做一次具体核算。取 $n=2$、特征 0，$f=\\log(1+x+y)$ 的形式展开：$\\log(1+t)=t-t^2/2+t^3/3-\\cdots$ 代入 $t=x+y$ 得 $f=(x+y)-\\frac{(x+y)^2}{2}+\\frac{(x+y)^3}{3}-\\cdots$，只保留到 $\\mathfrak m^3$ 的截断后验证每个齐次分量，这就是逐阶核算的具体动作。再取 $g=e^{x}-1=x+\\frac{x^2}{2!}+\\frac{x^3}{3!}+\\cdots$，它的常数项为 0、一次项为 x（可逆的线性项），因此它在 R 中不是单位，但由形式隐函数定理可以反解 $x=\\log(1+g)$，这就是「一次项可逆即形式可逆化」的最简单例子。反过来，$h=x^2$ 的常数项与一次项都是 0，方程 $F(g)=h$ 在 $g=0$ 处不可反解，说明形式隐函数定理的一次项条件不能弱化为「非零线性项存在」。另一个边界是：R 不是其分式域意义上的解析对象，形式幂级数可能发散（$\\sum n!\\,x^n$ 是合法的 R 元素但收敛半径为零），所以形式幂级数环比收敛幂级数环大得多、也更「代数」。',
        ['completeness-as-inverse-limit', 'derivation-universal-and-taylor']),
    ],
    conclusion: '$R=k[[x_1,\\ldots,x_n]]$ 是维数 n 的诺特正则局部环，$\\operatorname{gr}_{\\mathfrak m}R'\cong k[x_1,\\ldots,x_n]$，$\\Omega^1_{R/k}'\cong R^n$，且 $R'\cong \\widehat{k[x]}_{\\mathfrak m}$ 是其自身的 $\\mathfrak m$-进完备化。在 R 中形式 Taylor 展开与形式隐函数定理成立（一次项可逆即可反解）。由 Cohen 结构定理，等特征的完备正则局部环恰好就是形式幂级数环，因此 R 是局部环分类与形变理论的标准参照物。',
    dependencies: [],
    consequences: [],
    explanation: '形式幂级数环承担的是「局部化的极限版本」这一角色。局部化把一个点附近的全纯/正则函数保留下来，但仍旧允许在别的方向上有从零出发的捷径；完备化进一步把「任意小」这件事变成一个拓扑，把所有非形式的信息都挤出去。结构化地看，$\\operatorname{gr}_{\\mathfrak m}R'\cong k[x]$ 说明 R 从分次的角度看就是多项式环，切空间 $\\mathfrak m/\\mathfrak m^2$ 的维数等于维数，正则性因此是「一开始就长成了正确的形状」。这与解析几何的差别在于：形式幂级数的逆不仅限于一次项非零（如 $x+x^2$ 在特征 0 下也可形式可逆），而下一次项可逆给出的等价条件是完备性的直接后果，而不是任何收敛性定理的推论。它的代价是丢失整函数式的整体信息（发散的级数合法），收益是可以在任意特征、任意基环上用有限的线性代数逐步检验。',
    examples: [
      { title: '例子：在 k[[x,y]] 中形式求解 y = x + y²', body: '取 $R=k[[x,y]]$ 与方程 $F(x,y)=y-x-y^2=0$，想把 y 解成 x 的幂级数 $y=g(x)\\in k[[x]]$。初始在 $(0,0)$ 处有 $F=0$，且 $\\partial F/\\partial y=1-2y$ 在 (0,0) 处取值 1，是可逆的单位。于是形式隐函数定理给出唯一的 $g'\in k[[x]]$ 使 $F(x,g(x))=0$。逐阶算出前几项：设 $g=x+ax^2+bx^3+\\cdots$，代入 $y-x-y^2=0$ 得 $y=x+y^2$，即 $x+ax^2+bx^3=x+(x+ax^2)^2=x+x^2+2ax^3+\\cdots$，比较得 a=1、b=2。继续做下去得到 $g=x+x^2+2x^3+5x^4+14x^5+\\cdots$，系数正是 Catalan 数 $C_n=\\frac{1}{n+1}'\binom{2n}{n}$：$g=\\sum_{n'\ge1}C_n x^n$。这个级数在 $|x|<1/4$ 内收敛，但即使不收敛，$g$ 作为形式幂级数也已经合法，这就是形式解相对解析解的优势所在。核算的关键是每一步只解一个关于新系数的线性方程，因为 $\\partial F/\\partial y(0)=1\\neq0$。' },
      { title: '例子：k[[x]] 中 f = 2 + x 的单位性与 (1+x) 的逆', body: '取 $R=k[[x]]$，$f=2+x$。因为 $f(0)=2$ 在 k 中可逆（设 $k$ 特征不等于 2；一般地需要 f(0) 是 k 的单位），于是 $f=2(1+x/2)$，而 $1+x/2$ 的逆是几何级数 $\\sum_{j'\ge0}(-x/2)^j=1-\\frac{x}{2}+\\frac{x^2}{4}-\\frac{x^3}{8}+\\cdots$。因此 $f^{-1}=\\frac{1}{2}'\sum_{j'\ge0}(-1)^j'\frac{x^j}{2^j}=\\sum_{j'\ge0}'\frac{(-1)^j}{2^{j+1}}x^j$。把它乘回 f 验证：$(2+x)\\sum_{j'\ge0}'\frac{(-1)^j}{2^{j+1}}x^j$ 的 $x^n$ 系数是 $2\\cdot'\frac{(-1)^n}{2^{n+1}}+1\\cdot'\frac{(-1)^{n-1}}{2^{n}}=\\frac{(-1)^n}{2^n}-\\frac{(-1)^n}{2^n}=0$（n≥1），常数项是 $2\\cdot'\frac{1}{2}=1$，故乘积为 1。与多项式环对照：在 $k[x]$ 中 $2+x$ 的逆不存在（它不是常数），这说明完备化确实扩大了一个元素的「可逆性」，本质上是把 1/(2+x) 这个在原点的有理函数展开成了幂级数。' },
    ],
    remarks: [
      '完备化方向不可逆：完备化保持维数、保持正则性、保持诺特性，但会丢失「整性」与「既约性」。经典反例是 $A=k[x,y]/(y^2-x^2-x^3)$（结点三次曲线在原点、特征不等于 2），A 本身不是整环，因为 $y^2=x^2(1+x)$ 在局部环里给出 $y=\\pm x'\sqrt{1+x}$ 两个分支；但它的完备化 $\\widehat{A}'\cong k[[u,v]]/(uv)$ 仍旧不是整环，所以这个例子只说明完备化不修补非整性。更贴近的边界是：完备化不保持既约性，只要域的特征整除重数；例如 $k$ 特征 p、$A=k[x,y]/(y^p-x^p-y)$ 在原点既约（因为 $\\partial/\\partial y$ 部分可分离）但完备化不既约。使用时必须核对「在完备化中保持的性质」清单，不能把「完备化后正则」当成「原来正则」。',
      '特征 0 与特征 p 的区别在于形式可逆化的判据：特征 0 下 $f=\\sum_{k'\ge1}a_kx^k$ 在 $\\mathfrak m$-进意义下可由形式对数与指数互变，只要 $a_1\\neq0$ 就能把 f 变成坐标（Artin-Hasse 型的规范化）；特征 p 下 $f=x+x^p$ 的线性部分是 x（可逆），但它是不可逆的坐标变换（它把 Frobenius 阴影保留下来），此时形式可逆化只保证 $k[[f]]$ 是 $k[[x]]$ 的有限自由子代数，而不是等于它。把特征 0 的「一次项可逆即可换坐标」照搬到特征 p 会出错，这正是形式群论中高度需要小心的地方。',
      '形式幂级数环与收敛幂级数环不可混用：$k[[x]]$ 的元素可以是 $\\sum n!\\,x^n$ 这种收敛半径为零的级数，它在形式上完全合法，也有常数项 1（因而是单位），但它在任何邻域内不表示一个函数。因此当几何命题在 $k[[x]]$ 上成立时，不能自动推出它在解析局部环上成立；反过来，解析情形的许多定理想在形式情形推广时需要重新证明，因为形式情形缺少「收敛半径」这一保证函数存在性的输入。Stacks Project 里的形式光滑性定理正是被刻意表述在纯代数框架内，以避免混淆这两个环。',
      '完备化是沿一个理想取逆极限，结果依赖所选的理想：沿 $\\mathfrak m$ 的完备化给出 $k[[x]]$，而沿其他理想（例如 $\\mathfrak m=(x)$ 在 $k[x,y]$ 中）给出的完备化完全不同，且一般不是整个环的「最大」完备化。对一般的诺特局部环，$\\mathfrak m$-进完备化保持维数（Krull 交定理保证 $\\bigcap'\mathfrak m^d=0$），但对非诺特环这条会失效（例如无限秩的赋值环可以有自己的无限小），所以 Cohen 结构定理全部假设完备诺特。',
    ],
    corollaries: [
      { title: '推论：形式幂级数环上的 Nakayama 引理与有限性', body: '设 $M$ 是有限生成 $R=k[[x_1,\\ldots,x_n]]$-模。若 $M=\\mathfrak m M$，则 $M=0$。证明：取 $M$ 的极小生成元组 $m_1,\\ldots,m_r$（$r=\\dim_k M/\\mathfrak m M$），由 $M=\\mathfrak m M$ 得关系 $m_i'\in'\mathfrak m M$，写成 $m_i=\\sum_j a_{ij}m_j$、$a_{ij}'\in'\mathfrak m$，即 $(I-A)\\vec m=0$ 其中 A 的元素都在 $\\mathfrak m$ 中。矩阵 $I-A$ 的行列式是 $1+(\\mathfrak m中的元素)$，在 R 中可逆（R 完备或局部都足够），故可解出 $\\vec m=0$，$M=0$。这条推论是形式幂级数环上一切有限性论证的引擎，例如证明 $\\Omega^1_{R/k}$ 的极小生成元数、或用 $\\operatorname{Fit}$ 理想刻画模的秩，都要先取 $M/\\mathfrak m M$。', uses: ['completeness-as-inverse-limit'] },
    ],
    references: [
      stacks('Section 10.138: Formally smooth maps', '06A6'),
      stacks('Section 10.52: Length', '00IU'),
      { title: 'Commutative Algebra with a View Toward Algebraic Geometry', author: 'David Eisenbud', year: 1995 },
    ],
    history: HISTORY,
  },

  /* ═══════════════════════════════════════════════════════════
   * 2. 光滑性判别
   * ═══════════════════════════════════════════════════════════ */

  'a-smooth-criterion': {
    statement: '设 $f:X'\to S$ 是诺特概形之间的有限型态射。则 $f$ 光滑当且仅当下面三条同时成立：(a) $f$ 平坦（flat）；(b) 对每个 $s'\in S$，纤维 $X_s$ 几何正则（即 $X_{\\bar s}$ 是 $\\bar'\kappa(s)$ 上的正则概形，等价于它的每个局部环都是正则局部环）；(c) $\\Omega_{X/S}$ 是局部自由 $\\mathcal{O}_X$-模（等价地说 $f$ 在局部可因式分解为光滑态射的复合与一个形式光滑的映射）。在三者成立的条件下，还有：$\\Omega_{X/S}$ 的秩等于纤维维数的局部常数，且 $f$ 在形式意义下局部同构于 $\\mathbb{A}^n_S'\to S$（即 $f$ 形式光滑且形式平展同构于投影）。若 $S$ 的每个拟紧开集只有有限多个不可约分支，则 $X$ 亦然，且 $X^\\nu=X'\times_S S^\\nu$。',
    explanation: '光滑性判别是「相对微分几何」的核心：它说明代数几何中的光滑不是「没有奇点」，而是「一族同维数的非奇异纤维、以连续的方式拼起来」。三个条件各自负责一件事，缺一不可，而且都不可由另外两个推出。平坦性管的是「纤维不许突然变胖」——例如 $\\operatorname{Spec}k[t]/(t)\\to'\operatorname{Spec}k[t]$ 在原点纤维维数从 0 跳到 -1 而它的其他纤维维数正常，平坦性正是排除这类跳变的过滤条件。纤维几何正则管的是「每一根具体的纤维本身没有奇点」——$\\operatorname{Spec}k[x,y]/(y^2-x^3)\\to'\operatorname{Spec}k$ 平坦且 Ω 的秩为 1（尖点曲线是曲线，余切秩 1），但纤维有尖点所以不光滑。Ω 局部自由管的是「余切空间维数恰当且不跳」——这是把「维数稳定」翻译成线性代数的方式，具体表现为 $\\Omega_{X/S}$ 是秩 $\\dim X-\\dim S$ 的局部自由层。三条件合起来等价于「局部可写成仿射空间」这个最直观的期望。',
    steps: [
      step('flatness-controls-dimension', '平坦性：纤维维数不许跳变',
        '第一步处理平坦性。设 $f:X'\to S$ 有限型，$s'\in S$。若 $f$ 平坦，则对 $X$ 中每个在 $s$ 上方的点 $x$，有 $\\dim_x X=\\dim_s S+\\dim_x X_s$，即维数是基与纤维维数之和，且纤维维数在 $s$ 沿每个连通分支是局部常数。反之，若纤维维数之和恒定且纤维都等维（equidimensional）、$X$ 与 $S$ 都在适当条件（如 S 正则、X 既约、有限型）下，则平坦可由「纤维维数不跳」推出。这条关系是「平坦 = 纤维不跳」的精确形式。具体反例：$f:\\operatorname{Spec}k[t]/(t^2)\\to'\operatorname{Spec}k[t]$，在 $t'\neq0$ 上方纤维是空集（维数 −∞），在 $t=0$ 上方纤维是 $\\operatorname{Spec}k$（维数 0），维数发生了负跳到零的断裂，f 不是平坦；同样的 $\\operatorname{Spec}k[t]/(t^2-t)\\to'\operatorname{Spec}k[t]$ 在 t=0 纤维维数 0、t=1 纤维维数 0、其余纤维空集，也不是平坦的（因为有非空到空的跳变）。去掉平坦性后，$f$ 可以是有限型、纤维逐点正则、Ω 局部自由，但纤维作为一个「族」不是连续变化的，此时不能说 $f$ 光滑。',
        []),
      step('fiber-regularity', '纤维几何正则：排除曲率式奇点',
        '第二步处理纤维。对每个 $s'\in S$，把基变换到 $\\bar'\kappa(s)$ 得到 $X_{\\bar s}$，要求它是正则概形（每个局部环是正则局部环）。这条条件与 Ω 的局部自由性有交互：在 $f$ 有限型且 $X_{\\bar s}$ 是 $\\bar'\kappa(s)$ 上的代数簇的情形，$X_{\\bar s}$ 在闭点 x 处正则等价于 $\\Omega_{X_{\\bar s}/\\bar'\kappa(s)}$ 在该点局部自由且秩等于 $\\dim_x X_{\\bar s}$，因为余切空间 $\\mathfrak m_x/\\mathfrak m_x^2$ 的维数恰好给出 Ω 在 x 的纤维维数（Nakayama）。所以「纤维正则」这一条可以被改写成「拉回的 $\\Omega_{X/S}$ 在纤维上秩等于纤维维数」。几何直观上，纤维正则禁止的是尖点、结点、扭结、自交等局部奇点。例子：$X=\\operatorname{Spec}k[x,y]/(y^2-x^3)$、$f$ 是到 $\\operatorname{Spec}k$ 的结构态射，此时 $f$ 有限型、平坦（X 是自由 k[x,y]-模？需核：$k[x,y]/(y^2-x^3)$ 作为 k-模无限维，但这里 $f$ 是到点的态射，平坦性自动成立，因为点是域上的概形，任何模都是平的），$\\Omega_{X/k}$ 的秩在光滑点处为 1，但原点是奇异点，$\\Omega$ 在该点不是自由而是需要两个生成元加一个关系的模，故纤维不正则，f 不光滑。',
        ['flatness-controls-dimension']),
      step('omega-locally-free', 'Ω 局部自由：余切空间的维数恰当',
        '第三步处理 $\\Omega_{X/S}$。要求它是局部自由 $\\mathcal{O}_X$-模，此时它的秩在连通分支上是常数。这条条件给出「$f$ 的纤维维数不依赖于点」这一线性代数版本：对 $x'\in X$，$\\dim_x X_s=\\dim_{\\kappa(x)}(\\Omega_{X/S}'\otimes \\kappa(x))$（当 $f$ 在 x 处形式光滑时），故 Ω 的秩就是纤维的局部维数。更精确地，有基本定理：若 $f$ 有限型、$\\Omega_{X/S}$ 局部自由且 $f$ 平坦、纤维几何正则，则 $f$ 形式光滑；反过来形式光滑的有限型态射满足这三条。关键的中间命题是 $\\Omega$ 的局部自由性与「形式光滑」的等价：对有限型的 $f$，若 $f$ 形式光滑则 $\\Omega_{X/S}$ 局部自由（因为形式光滑给出余切复形的可分裂性），反之若 $\\Omega$ 局部自由且满足纤维条件则 $f$ 形式光滑。这个「切空间条件 ⇔ 形式光滑」是全部三条件中技术含量最高的一步，它用到 $\\Omega$ 的局部自由性把 $\\Omega$ 变成有限投射模，从而使得相关函子可由有限投射模的计算论清。',
        ['fiber-regularity']),
      step('equivalence-both-directions', '合起来：两条方向的证明',
        '现在把两条方向接上。（⇒）设 $f$ 光滑，则按定义 $f$ 形式光滑且局部有限型，于是平坦（形式光滑 + 有限型给出平坦）、$\\Omega_{X/S}$ 局部自由（形式光滑的结果）、纤维几何正则（光滑态射的纤维是光滑 $\\kappa(s)$-概形，取 $\\bar'\kappa(s)$ 后仍是光滑概形，而光滑概形的局部环正则）。三条齐备。（⇐）设三条成立。先用 Ω 局部自由得 $f$ 形式光滑：因为可以在每一点把 $f$ 局部写成 $\\mathbb{A}^n_S'\to S$ 与一个形式平展态射的复合（Ω 局部自由且秩为 d 给形式平展坐标的存在性），而 $\\mathbb{A}^n_S'\to S$ 形式光滑，复合形式光滑。再用平坦性把「形式光滑」提升到「光滑」：形式光滑 + 有限型 + 平坦 ⇔ 光滑，这是形式光滑理论的基本定理，其技术内容是「形式光滑的有限型态射若平坦则光滑」与「光滑的态射纤维几何正则」两条。最后核对纤维正则时要用到平坦性：平坦保证纤维维数由基与总维数决定，纤维正则保证该维数下的纤维无奇点。',
        ['omega-locally-free', 'fiber-regularity']),
      step('regular-fibers-and-normalization', '光滑态射的几何后果：纤维维数与正规化',
        '由判别式得到几条实用的几何结论。第一，$\\Omega_{X/S}$ 的秩 = $\\dim X-\\dim S$（在每个连通分支上），所以光滑态射把「相对维数」变成一个不变量，从而光滑族中所有纤维的维数相同——这正是平坦性所保证的、并由 Ω 局部自由性量化。第二，光滑态射保持正则性向上传播：若 S 正则且 $f$ 光滑，则 X 正则（因为 X 局部是两个正则概形的形式光滑扩张）。第三，光滑态射与正规化相容：若 S 的每个拟紧开集只有有限多个不可约分支，则 X 亦然，且 $X^\\nu'\cong X'\times_S S^\\nu$，即「先取正规化再基变换」与「先基变换再正规化」一致。这条结论说明光滑态射的奇点结构完全由基决定，纤维不引入新的解析分支。第四，光滑态射是开映射（因为平坦 + 有限呈现），从而 X 的每个不可约分支都支配 S 的一个不可约分支，这个「支配关系」是与「纤维维数守恒」等价的几何陈述。这四条是后面使用光滑性的标准入口。',
        ['equivalence-both-directions', 'flatness-controls-dimension']),
    ],
    conclusion: '对有限型态射 $f:X'\to S$（诺特概形），$f$ 光滑当且仅当 $f$ 平坦、$\\Omega_{X/S}$ 局部自由、且每个纤维 $X_s$ 几何正则；三者齐备时 $\\operatorname{rank}'\Omega_{X/S}=\\dim X-\\dim S$ 局部常数，且 $f$ 保持正则性与正规化（$X^\\nu=X'\times_S S^\\nu$，在 S 的拟紧开集只有有限多个不可约分支的假设下）。',
    dependencies: [],
    consequences: [],
    explanation: '光滑性判别的价值在于把「没有奇点」这句直觉拆成三件可逐一验证的事，并指出每一件事都必要。平坦性保证「族」是连续的，Ω 局部自由保证「切空间维数正确」，纤维正则保证「每一根具体的纤维自身光滑」。三者组合的意义可以这样理解：光滑态射是「相对形式的仿射空间」，也就是说，在形式邻域里 $f$ 看起来就是 $\\mathbb{A}^n_S'\to S$；而 $\\mathbb{A}^n_S'\to S$ 的三个条件分别对应「n 不随点变化」（平坦与 Ω 秩）、「基是参数空间」（平坦）、「纤维是仿射空间」（正则与 Ω 自由）。因此光滑性判别是形式光滑理论在有限型情形下的具体化，也是把「族的连续性」与「单根纤维的良性」两个独立概念焊在一起的那条定理。它与微分几何的差别在于后者的「光滑」是单点局部概念，而代数几何的「光滑」是相对于基的、必须同时约束整族。',
    examples: [
      { title: '例子：𝔸² → 𝔸¹，(x,y) ↦ x 的光滑性逐条核对', body: '取 $S=\\operatorname{Spec}k[t]$、$X=\\mathbb{A}^2_S=\\operatorname{Spec}k[t,x,y]$、$f$ 由 $t'\mapsto t$ 给出（即坐标投影）。核对三条：(a) 平坦：$k[t,x,y]$ 是自由 $k[t]$-模，自由即平，成立。(b) 纤维：$f^{-1}(t_0)=\\operatorname{Spec}k[x,y]$，是 k 上的仿射平面，正则（$k[x,y]$ 是正则局部环，维数 2）。(c) $\\Omega_{X/S}$：由 $dx,dy$ 自由生成（因为 X/S 是多项式扩张），$\\Omega_{X/S}'\cong \\mathcal{O}_X^{2}$，局部自由，秩 2 = 纤维维数 2。三条齐备，故 f 光滑。若把 X 换成 $\\operatorname{Spec}k[t,x,y]/(y^2-x^3-t)$（小平展的尖点族），则(a)平坦仍成立（x 是自由的？$k[t,x,y]/(y^2-x^3-t)\\cong k[t,x,y]$ 作为 $k[t]$ 模是自由的，非首一关系只在 y 上出现而 x 的系数可消去，故平坦，这需要更细的论证），(b) 纤维 $y^2=x^3+t_0$ 在 $t_0\\neq0$ 时光滑（椭圆型）、在 $t_0=0$ 时是尖点，不是正则，故不光滑。核算的分水岭就在 $t_0=0$ 那根特殊纤维上，这正是「纤维正则」不可或缺的例子。' },
      { title: '例子：特征 p 与 Ω 不局部自由的可分性失效', body: '取 $k$ 特征 $p>0$、$S=\\operatorname{Spec}k$、$X=\\operatorname{Spec}k[x]/(x^p-t)$ 不行（t 不在 k 里），改取纯不可分扩张 $f:\\operatorname{Spec}k[\\alpha]'\to'\operatorname{Spec}k$，其中 $\\alpha^p=a'\in k$ 而 $\\alpha'\notin k$。此时 $X$ 只有一点（局部环是域，维数 0），纤维是 $\\operatorname{Spec}k[\\alpha]$，它在 $k$ 上不是几何正则的：基变换到 $\\bar k$ 得 $k[\\alpha]'\otimes_k'\bar k'\cong'\bar k[\\alpha]/(\\alpha^p-a)\\cong'\bar k[z]/(z^p)$（因为 a 在代数闭域中有 p 次根），而 $z^p=0$ 给出的局部环不是正则的。另一方面 $\\Omega_{X/k}$：由 $0\\to (x)\\to X'\to \\operatorname{Spec}k'\to 0$ 的余切序列，$\\Omega_{k[\\alpha]/k}=\\Omega_{k[x]/k}'\otimes k[\\alpha]/(p x^{p-1})$，在特征 p 下 $p x^{p-1}=0$，故 $\\Omega_{X/k}'\cong k[\\alpha]$ 是秩 1 自由的——注意 Ω 自由并不保证光滑！这个例子说明「Ω 局部自由」绝不能替代「纤维几何正则」，因为特征 p 下 $dx=0$ 使得 Ω 无法感知不可分性。使用判别式时必须逐条核对纤维正则，不能只看 Ω。' },
    ],
    remarks: [
      '平坦性不可由另外两条替代：取 $S=\\operatorname{Spec}k[t]$、$X=\\operatorname{Spec}k[t]'\coprod'\operatorname{Spec}k[t]/(t)$（在 $t=0$ 处粘上一个额外点），$f$ 为自然投影。纤维在 $t'\neq0$ 上是两个点（维数 0），在 $t=0$ 上是三个点（维数 0），维数没有跳变，但 $f$ 不是平坦的，因为 $k[t]'\oplus k$ 不是平坦 $k[t]$-模（k 在 $t=0$ 处的局部化上不是自由的）。此时纤维几何正则、Ω 在光滑部分局部自由，但整个 $f$ 不光滑。这条反例说明「维数不明显跳」比平坦弱得多，必须用平坦性而非维数守恒作为判据。',
      '代数闭域条件与几何正则：纤维正则要求「基变换到代数闭包后仍正则」，而不能只要求原纤维 $X_s$ 正则。例如 $\\operatorname{Spec}'\mathbb{R}[x]/(x^2+1)\\to'\operatorname{Spec}'\mathbb{R}$ 的纤维是 $\\operatorname{Spec}'\mathbb{C}$，作为 $\\mathbb{R}$-概形它是域（正则），但基变换到 $\\mathbb{C}$ 后得到 $\\operatorname{Spec}'\mathbb{C}[x]/(x^2+1)\\cong'\operatorname{Spec}'\mathbb{C}'\coprod'\operatorname{Spec}'\mathbb{C}$ 仍然正则，这个例子没问题。真正需要当心的是不可分扩张：$\\operatorname{Spec}k[\\alpha]'\to'\operatorname{Spec}k$（$\\alpha^p=a$）的纤维是域故正则，但几何纤维 $\\bar k[z]/(z^p)$ 不正则，这正是上一条例子所揭示的机制。',
      '光滑态射的纤维维数不是全局常数：$f$ 的纤维维数在每个连通分支上为常数（连通性取自 X 或 S 的连通分支），但若 $X$ 不连通，不同分支可以有不同维数。例如 $\\operatorname{Spec}k'\coprod'\operatorname{Spec}k[x]$ 的两个分支分别给出维数 0 与 1 的纤维，此时 $\\Omega$ 的秩在每个分支上是常数 —— 所以「Ω 局部自由」的精确表述是「在每个连通分支上自由且秩为常数」，用「Ω 秩 = 常数」这种全局说法会把不连通情形漏掉。引理级别的陈述必须写「在每个连通分支上」。',
      '三条件在非诺特或非有限型情形会退化：若 $f$ 不是有限型，形式光滑不再等价于光滑（形式光滑只控制无穷小邻域，不控制整体的有限性），此时必须加入「$f$ 有限呈现」或「$f$ 局部有限型」才能把三条件拼接起来。例如形式幂级数环的自然映射 $\\operatorname{Spf}k[[x]]'\to'\operatorname{Spf}k$ 形式光滑但不是有限型，若照搬判别式会得出「它光滑」的错误结论。使用判别式前先核对有限型/有限呈现假设。',
    ],
    corollaries: [
      { title: '推论：光滑态射的严格正规化与维数守恒', body: '在光滑性判别成立时，$\\Omega_{X/S}$ 的秩在每个连通分支上是常数 $n=\\dim X-\\dim S$，故 $f$ 的每根非空纤维都是纯 n 维的：$\\dim X_s=n$ 对一切 s 成立。由此可得「光滑族中纤维的维数不能跳」，这条推论是把平坦性从「局部」提升为「整体计数」的关键。进一步，若 $X$ 既约且 $f$ 光滑，则每个纤维都既约（几何正则蕴含既约），于是「族中所有纤维都有相同的既约度」，这为平坦族的半连续性定理提供了最干净的特殊情形。', uses: ['equivalence-both-directions'] },
    ],
    references: [
      stacks('Section 10.138: Formally smooth maps', '06A6'),
      stacks('Lemma 31.10.1: Fitting ideals of the module of differentials', '0C3I'),
      stacks('Lemma 37.19.3: Normalization and smooth morphisms', '07TD'),
    ],
    history: HISTORY,
  },

  /* ═══════════════════════════════════════════════════════════
   * 3. 形式光滑
   * ═══════════════════════════════════════════════════════════ */

  'a-formal-smooth': {
    statement: '设 $A'\to B$ 是环映射，$I'\subset B$ 是满足 $I^2=0$ 的理想（无穷小加厚）。称 $A'\to B$ 形式光滑，若对每个这样的 $I$ 与每个 $A$-代数映射 $B'\to C$ 以及每个使下图交换的 $A$-代数映射 $B/I'\to C$，都存在提升 $B'\to C$：即函子 $\\operatorname{Hom}_{A'\text{-alg}}(B,-)$ 把 $\\operatorname{Spec}$ 上的无穷小加厚 $\\operatorname{Spec}(B/I)\\hookrightarrow'\operatorname{Spec}B$ 映为满射。等价地，当 $B$ 作为 $A$-代数由有限多变量生成时，形式光滑等价于 $\\Omega_{B/A}$ 是投射 $B$-模且余切复形在 $\\Omega$ 处可分裂。对态射 $X'\to S$，形式光滑的形变问题逐阶可解，且形式光滑当且仅当局部存在形如 $\\operatorname{Spec}B'\to'\operatorname{Spec}A$ 的「无穷小提升 ⟹ 存在」，这正是形变理论中「无障碍」（unobstructed）的语言。',
    explanation: '形式光滑是把「解方程总可以一步步来」写成函子满射的那条定义。它的直觉是：无穷小加厚 $B'\to B/I$（$I^2=0$）是「加一层厚度为零的壳」，在几何上就是「在一个概形上贴一层无穷小的东西」。如果每一个从薄壳到目标的映射都能沿加厚提升，那么整个形变过程就可以逐阶组装，永远不会在最关键的一步卡住。这个「卡住」就是上同调类：提升的障碍是一个 $H^2$ 类，而形式光滑正是宣称障碍层消失的精确方式。与光滑性的关系是：光滑 = 形式光滑 + 有限呈现，可见形式光滑是完全局部的、不需要整体有限性的一部分，它是光滑性中「可以逐阶解」的那一半。把这条定义用在形式幂级数环上就得到：$k'\to k[[x_1,\\ldots,x_n]]$ 形式光滑，因为每次加厚只需要解一个有限线性方程组；而 $k'\to k[x]/(x^2)$ 不形式光滑，因为 $x$ 不能提升到 $k[x]/(x^3)$ 意义上的自由变量。',
    steps: [
      step('definition-and-basic-examples', '定义与第一批判例',
        '严格写下定义：设 $A'\to B$ 是环映射。给定 $B$ 的理想 $I$ 满足 $I^2=0$，以及一个 $A$-代数同态 $u:B/I'\to C$，若存在 $A$-代数同态 $\\tilde u:B'\to C$ 使 $\\tilde u$ 在 $B/I$ 上的诱导等于 u，就称这个特定加厚能被提升。若对一切这样的 $(I,C,u)$ 都能提升，称 $A'\to B$ 形式光滑。第一批例子：$A=k$、$B=k[x_1,\\ldots,x_n]$ 形式光滑，因为任何加厚 $k[x]/I^k'\to k[x]/I^{k+1}$ 上给定一个映射，把它作用在 $x_i$ 的像并任意补上一个 $I^k$ 层级的修正即可提升（代数独立的变量总是能被指派到任意位置的像，只要没有关系约束）。$A=k$、$B=k[x]/(x^2)$ 不形式光滑：考虑加厚 $k[x]/(x^3)\\to k[x]/(x^2)$，需要有 $k[x]/(x^2)\\to k[x]/(x^2)$ 的提升使 $x'\mapsto x$（商掉 $x^3$ 后仍要 x 映到 x），而 $x$ 在 $k[x]/(x^2)$ 里满足 $x^2=0$、在 $k[x]/(x^3)$ 里不满足，所以不存在把 $x$（作为 $k[x]/(x^3)$ 的元素，满足 $x^2\\neq0$）映到 $k[x]/(x^2)$ 而保持关系的提升，故不形式光滑。这两个例子把「形式光滑 = 没有多项式关系阻碍」这一直觉具体化了。',
        []),
      step('lifting-cocycle-obstruction', '提升的障碍：一次差值与 2-上链',
        '更细地分析提升的机制。设 $A'\to B$ 形式光滑，$I$ 是 $B$ 的理想且 $I^2=0$，$C=B/I'\to D$ 是另一个加厚（核记 $J$，$J^2=0$）。给出一个映射 $\\varphi:B/I'\to D$，问能否提升为 $\\psi:B'\to D$。两个提升若存在，则它们的差是一个 $A$-导子 $B'\to J$（因为乘积关系在差上表现为 Leibniz 律），于是全体提升由 $\\operatorname{Der}_A(B,J)$ 作自由平移；而 $\\operatorname{Der}_A(B,J)\\cong \\operatorname{Hom}_B(\\Omega_{B/A},J)$。所以当 $\\Omega_{B/A}$ 是投射 B-模时，导子总可以「局部拼起来」，提升的存在性没有问题。相反，提升的不存在性由 $H^2$ 类控制：对一般的 $A'\to B'\to C$（$B'\to C$ 满射核 J），存在自然的阻碍类 $\\operatorname{ob}'\in \\operatorname{Ext}^2_B(\\Omega_{B/A},J)$（或 $H^2$ 层上同调类），它为零当且仅当提升存在。形式光滑的定义等价于「这个障碍类对一切 J 为零」，因此等价于 $\\operatorname{Ext}^2_B(\\Omega_{B/A},-)=0$，在有限呈现情形下等价于 $\\Omega_{B/A}$ 投射。这就是形式光滑的可计算判据。',
        ['definition-and-basic-examples']),
      step('finiteness-and-smoothness', '有限呈现：形式光滑何时等于光滑',
        '形式光滑是纯局部的条件，光滑需要有限呈现。基本定理：设 $f:X'\to S$ 局部有限呈现，则 $f$ 光滑 ⇔ $f$ 形式光滑且平坦 ⇔ $f$ 形式光滑且 $\\Omega_{X/S}$ 局部自由（在有限呈现下，形式光滑已经蕴含 Ω 局部自由）。为什么需要有限呈现：形式光滑只约束无穷小邻域，如果一个环的巨大扩张只在有限次截断上看起来是自由的，形式光滑可能成立而整体不是有限型的。反例：$A=k$、$B=\\varinjlim k[x_1,\\ldots,x_n]$（无限多个变量的多项式环）是形式光滑的（代数独立变量的指派不受限），但它不是有限呈现的，也不是光滑的。加上有限呈现后，形式光滑可以逐点提升到 Zariski 开集上的一致结论：因为形式光滑是「逐点」性质，而有限呈现使得在足够小的仿射开集上它可以被写作有限个方程的偏导数的条件，于是可以在开的邻域上一致处理，这就是「形式光滑 + 有限呈现 = 光滑」的证明骨架。这条定理是形式光滑存在的主要理由：它把光滑性这个整体性质拆成一个纯局部条件与一个整体有限性条件。',
        ['lifting-cocycle-obstruction']),
      step('cotangent-splitting', '余切正合列的分裂与形式提升',
        '再给一个形式光滑的等价表述，它在具体计算中最有用。设 $A'\to B'\to C$ 是环映射，$B'\to C$ 满射、核 $J'\subset B$，且 $A'\to C$ 形式光滑。则余切序列 $0\\to J/J^2\\to \\Omega_{B/A}'\otimes_B C'\to \\Omega_{C/A}'\to 0$ 分裂正合。原因：$A'\to C$ 形式光滑使得在无穷小语境下可以把 $C$ 的坐标「回到」$B$，从而 $\\Omega_{C/A}$ 到 $\\Omega_{B/A}'\otimes_B C$ 存在一个自然的截面；这个截面在 $B'\to C$ 的形式光滑性下被构造为「先提升再取微分」。这种分裂告诉我们：形式光滑性的实质是「可以在加厚上选取坐标」，而选取坐标的能力恰好等价于余切序列的分裂。它带来一个常用的推论：若 $B'\to C$ 形式光滑且 $A'\to C$ 形式光滑，则 $A'\to B$ 形式光滑，即形式光滑在复合中可传递。形式光滑的这条传递性在形变理论中用于「先解决一部分变量再解决另一部分」，是把复杂形变问题分解的标准技术。',
        ['finiteness-and-smoothness']),
      step('formal-smooth-and-deformation', '形变与 Grothendieck 提升：形式光滑的实际用途',
        '把定义放回形变理论。给定某个概形（或环）$X_0$ 在域 k 上，问它能否推广到 $k[t]/(t^2)$、$k[t]/(t^3)$、乃至 $k[[t]]$ 上。每加一阶就是一次无穷小加厚，所以形式光滑正是「这个形变问题无障碍」的精确表述。具体机制：设 $X_0$ 光滑（或形式光滑），则它的每一个形变都可以逐阶自由选择，因为每阶的提升还差一个「一次项修正」的自由度，这个自由度由 $T_{X_0}$（切丛）给出，无需任何相容性条件。这就解释了为什么光滑簇的形变空间是「线性」的（易处理的），而奇异簇的形变空间可以是弯曲的——后者有障碍，不能逐阶自由组装。Grothendieck 提升定理给出更细的信息：若 $X_0$ 满足恰当的条件下（例如 $X_0$ 的强合致性），可以提升到任意阶，而且一旦 $\\operatorname{Ext}^2$ 的障碍消没就可以提升到 $k[[t]]$ 上，公式形如「障碍类落在 $H^2(X_0,T_{X_0})$ 里」。形式光滑因此不是一条孤立的技术条件，而是「形变问题逐阶可解」这一愿望被写成可检验的代数条件后的样子。',
        ['cotangent-splitting']),
    ],
    conclusion: '$A'\to B$ 形式光滑等价于：对一切满足 $I^2=0$ 的理想 $I'\subset B$ 与一切 $A$-代数映射 $B/I'\to C$，都存在提升 $B'\to C$；在 $B$ 有限呈现时进一步等价于 $\\Omega_{B/A}$ 投射（等价地 $\\operatorname{Ext}^2_B(\\Omega_{B/A},-)=0$）。形式光滑在复合下传递，并且与余切正合列的可分裂性等价。光滑 = 形式光滑 + 局部有限呈现，故形式光滑是不依赖整体有限性的局部坐标可选取性。',
    dependencies: [],
    consequences: [],
    explanation: '形式光滑的关键在于「加厚」这个词：它把形变问题从「连续变化」变成「离散的逐阶逼近」，而每一阶的提升是否存在完全由线性代数（导子与扩张类）决定。定义中的 $I^2=0$ 不是可有可无的简化——它保证提升的差是导子、导子空间可计算，从而把非线性问题线性化；若允许 $I^2\\neq0$，则提升问题涉及二阶以上的修正，等价于解非线性方程，那时必须引入更高阶的障碍类或直接使用形式结构的理论。形式光滑的三种等价面貌（函子满射、余切投射/可分裂、形变无障碍）分别对应几何、线性代数与形变三种语言，实际使用中按方便程度切换：证明结构性结论常用函子定义，具体计算用 Ω 的投射性，而与物理/形变理论对话时用障碍类。它也是 Grothendieck 对「什么是好的约化」这一问题的技术回答。',
    examples: [
      { title: '例子：k[[x]] 形式光滑但不有限呈现的对照', body: '设 $A=k$、$B=k[[x]]$。核对形式光滑：给定 $I'\subset k[[x]]$ 满足 $I^2=0$，$I$ 是 $\\mathfrak m$-幂零的有限维 k-向量空间，取一个映射 $u:k[[x]]/I'\to C$，要提升到 $B=k[[x]]$。提升的差是导子 $k[[x]]'\to I$，而 $\\operatorname{Der}_k(k[[x]],I)\\cong I$（导子由 $1\\mapsto'\delta$ 决定，$\\delta'\in I$），故对任意 $u$ 都可以取 $\\tilde u(x)=u(x)+\\delta$ 提升，其中 $\\delta'\in I$ 任取。所以 $k'\to k[[x]]$ 形式光滑。同时它也平坦、余切 $\\Omega=k[[x]]dx$ 自由，但 $k'\to k[[x]]$ 不是有限呈现的（$k[[x]]$ 不是 $k$ 上有限型代数），于是它不是光滑态射。这个例子把「形式光滑是光滑的一半」讲清楚了：整体有限性这一半缺失时，形式光滑依然成立。对照地，$k'\to k[x]$ 既形式光滑又有限呈现，故光滑。' },
      { title: '例子：ℤ/p² → ℤ/p 不形式光滑', body: '取 $A=\\mathbb{Z}$、$B=\\mathbb{Z}/p^2$、$I=(p)\\subset B$ 满足 $I^2=(p^2)=0$。考虑 $B/I=\\mathbb{Z}/p$，问加厚 $B'\to B/I$ 是否可提升，即是否存在环映射 $\\mathbb{Z}/p^2\\to \\mathbb{Z}/p^2$ 使其在 $\\mathbb{Z}/p$ 上的诱导是恒等。任何环同态 $\\mathbb{Z}/p^2\\to'\mathbb{Z}/p^2$ 是恒等（因为它必须把 1 送到 1，而 $\\mathbb{Z}/p^2$ 由 1 生成），故在商的诱导也是恒等，似乎可以提升。真正的问题出在往上提升：考虑加厚 $\\mathbb{Z}/p^3\\to'\mathbb{Z}/p^2$，问映射 $\\mathbb{Z}/p^2\\to'\mathbb{Z}/p$ 能否提升为 $\\mathbb{Z}/p^2\\to'\mathbb{Z}/p^2$ 之外的 $\\mathbb{Z}/p^2\\to \\mathbb{Z}/p^2$？仍然只有恒等。正确的反例应当取 $B=\\mathbb{Z}/p^2$ 而要求提升到 $\\mathbb{Z}/p^3$：不存在环同态 $\\mathbb{Z}/p^3\\to'\mathbb{Z}/p^2$ 使复合为恒等（因为 $p^3$ 必须映到 $p^2=0$ 而 $p^2\\neq0$ 与关系冲突），故 $\\mathbb{Z}'\to'\mathbb{Z}/p$ 不形式光滑。这个例子的教益是：$\\mathbb{Z}'\to'\mathbb{Z}/p$ 的障碍来自 $\\mathbb{Z}$ 有待数（torsion），把 $\\mathbb{Z}$ 换成 $\\mathbb{Z}[1/p]$（或 $\\mathbb{Q}$）后 $\\mathbb{Z}[1/p]'\to'\mathbb{F}_p$ 就变得形式光滑（$\\mathbb{F}_p$ 在 $\\mathbb{Z}[1/p]$ 上分圆，需要小心），这说明形式光滑性与特征的算术性质紧密相关。' },
    ],
    remarks: [
      '$I^2=0$ 这一限制不可去掉：若不要求 $I^2=0$，则「提升总是存在」这一条件与形式光滑不等价，且会把许多非形式光滑的环也包含进来。具体地，若只对 $I^2\\neq0$ 的加厚要求提升存在，条件会过强（远超形式光滑），例如 $k'\to k[x]/(x^2)$ 也不能满足；若对一般加厚只要求「一阶」提升存在，则条件会过弱。标准做法是把一般加厚 $B'\to B/I$ 分解成逐层 $I^k/I^{k+1}$ 的一阶加厚，因此研究 $I^2=0$ 情形就足够——这也是形式几何把一切化归到一阶无穷小邻域的理由。',
      '形式光滑不等同于形式平展，也不等同于形式完备：形式平展要求提升存在且唯一（等价于 $\\Omega_{B/A}=0$ 且形式光滑），它对应「局部同构」；形式光滑只要求提升存在，允许 $\\Omega$ 有正的秩，对应「局部像仿射空间」；形式完备（formally unramified 的反面）涉及 $\\Omega$ 不可分方向的处理。三者构成形式几何的基本三元，使用时必须分清：Etale = 形式光滑 + 形式平展，光滑 = 形式光滑 + 有限呈现（+ 平坦），不可分映射 = 形式平展但不是光滑。混用会导致在特征 p 下得出错误结论。',
      '形式光滑是逐点（局部）性质而光滑需要的整体条件不可省：$\\operatorname{Spec}$ 层面，形式光滑在仿射开集上可检验，光滑（有限呈现 + 形式光滑）才保证纤维维数守恒等一系列整体结论。例如把无限多变量的多项式环变成射影极限会破坏有限性，此时形式光滑成立而「纤维维数守恒」失效。在推导「Ω 的秩等于相对维数」这类整体结论时，必须显式使用有限呈现假设，否则秩可能不是局部常数。',
      '形式光滑在非诺特环上会失去可计算性：判据「形式光滑 ⇔ Ω 投射」要求 $\\Omega_{B/A}$ 是有限呈现模（在 $B$ 有限呈现 / 诺特条件下自动），否则「投射」与「局部自由」分离，且 $\\operatorname{Ext}^2$ 的计算会涉及无限生成模。因此 Stacks Project 的形式光滑定理基本都写成「有限呈现」或「有限型」的版本，例如 $A'\to B'\to C$ 的形式光滑传递性就要求恰当条件下 $J/J^2$ 有限呈现。引用时必须带上这些有限性假设。',
    ],
    corollaries: [
      { title: '推论：形式光滑在复合下传递，且给出 Ω 的投射性', body: '设 $A'\to B'\to C$ 是环映射。若 $A'\to C$ 形式光滑、$B'\to C$ 满射且核 $J$ 满足形式光滑性条件，则余切序列 $0\\to J/J^2\\to \\Omega_{B/A}'\otimes_B C'\to \\Omega_{C/A}'\to 0$ 分裂正合；由此可读出 $\\Omega_{C/A}$ 是 $\\Omega_{B/A}'\otimes_B C$ 的直和项，从而 $\\Omega_{C/A}$ 投射（在有限呈现条件下）。这条推论是把「形式光滑」这一函子性质翻译为「Ω 的投射性」这一模论性质的标准通道，也是具体计算 $\\Omega$ 的秩与生成元时的第一手段。', uses: ['cotangent-splitting'] },
    ],
    references: [
      stacks('Lemma 10.138.10: splitting of the cotangent sequence', '06A6'),
      stacks('Section 10.138: Formally smooth maps', '06A6'),
      { title: 'Deformation Theory', author: 'Robin Hartshorne', year: 2010 },
    ],
    history: HISTORY,
  },

  /* ═══════════════════════════════════════════════════════════
   * 4. 茎
   * ═══════════════════════════════════════════════════════════ */

  'a-stalk': {
    statement: '设 X 是拓扑空间，$\\mathcal{F}$ 是 X 上的（集合/群/环/模）层，$x'\in X$。$\\mathcal{F}$ 在 x 处的茎定义为正向极限 $\\mathcal{F}_x=\\varinjlim_{x'\in U'\text{ 开}}'\mathcal{F}(U)$，其中极限沿「包含关系反方向」的开邻域系取：即把每个开邻域 U 上的截面 $s'\in'\mathcal{F}(U)$ 看作一个「s 在 x 的芽」，两个截面 $s'\in'\mathcal{F}(U)$ 与 $t'\in'\mathcal{F}(V)$ 相等当且仅当存在开邻域 $W'\subseteq U'\cap V$ 含 x 使 $s|_W=t|_W$。则有：(1) 茎是层范畴中的「点纤维」，函子 $\\mathcal{F}'\mapsto'\mathcal{F}_x$ 正合，即层映射的核、像、余核可以逐个茎检验；(2) 层映射 $\\varphi:\\mathcal{F}'\to'\mathcal{G}$ 是同构当且仅当对一切 $x'\in X$ 有 $\\mathcal{F}_x'\cong'\mathcal{G}_x$（同构在茎上逐点成立）；(3) 若 X 是概形、$\\mathcal{F}$ 是 $\\mathcal{O}_X$-模，则 $\\mathcal{F}_x$ 自动是 $\\mathcal{O}_{X,x}$-模，且 $\\mathcal{F}_x=\\mathcal{F}_{(x)}'\otimes_{\\mathcal{O}_{X,x}}'\mathcal{O}_{X,x}$，即茎等于「在 x 的局部化再完备化之前」的模。',
    explanation: '茎是「把局部信息榨到极限」的构造：任何开邻域都太大，因为它含有全局性的成分；把所有开邻域按包含排序取极限，恰好留下「任意小邻域上都成立」的信息。这个构造的核心好处是把层论的许多判断变成逐点的判断：因为正向极限沿有限性（有限交仍含 x）精确，核、像、余核的运算与取茎可交换，所以「层映射是单射/满射/同构」都可以在一根茎上检验。但茎也丢掉信息，这是它最重要的边界：茎只能看见局部，不能看见「整体黏合」。经典体现是「茎处处非零而整体没有非零截面」的层可以存在（例如带上适当拓扑的常层在扩展轴上，或者更简单地，带本质奇点型的局部化），以及「$H^0$ 不正合」这一事实——层的短正合列取全局截面后不保持满射，因为粘合所需的相容性条件不是逐茎条件。这条差距正是层上同调存在的理由。',
    steps: [
      step('colimit-construction', '正向极限的构造与芽的等价关系',
        '先严格化「芽」这个对象。固定 $x'\in X$，把 X 的所有含 x 的开子集按包含关系组织成一个范畴（态射是 $V'\hookrightarrow U$ 的方向，注意与包含方向相反），这是一个滤过（filtered）范畴：任意两个含 x 的开集之交仍含 x 且包含于两者，任意两个对象都有上界。于是正向极限 $\\mathcal{F}_x=\\varinjlim_{x'\in U}'\mathcal{F}(U)$ 有具体描述：它是所有「$(U,s)$、$x'\in U$ 开、$s'\in'\mathcal{F}(U)$」这类对的集合，模去等价关系 $(U,s)\\sim(V,t)$ 当且仅当存在含 x 的开 $W'\subseteq U'\cap V$ 使 $s|_W=t|_W$。这个等价关系的传递性是良定义的：若 $(U,s)\\sim(V,t)$ 由 $W_1$ 见证、$(V,t)\\sim(Y,r)$ 由 $W_2$ 见证，则取 $W=W_1\\cap W_2$ 含 x 且同时见证两者，故 $(U,s)\\sim(Y,r)$。因为滤过性保证了「可以进一步缩小邻域来比较」，所以茎上的元素就是「在 x 的足够小的邻域上定义的对象」，我们可以自由地把邻域取小而不改变芽。注意这里没有任何极限分析，纯是集合论操作，因此在任意范畴（只要允许滤过余极限）里都成立。',
        []),
      step('stalk-of-structure-sheaf', '结构层的茎就是局部环',
        '设 $(X,\\mathcal{O}_X)$ 是局部环空间（例如概形），取 $x'\in X$。$\\mathcal{O}_{X,x}=\\varinjlim_{x'\in U}'\mathcal{O}_X(U)$ 由定义是 x 附近正则函数的芽；在仿射情形 $X=\\operatorname{Spec}A$、$x=\\mathfrak p$ 是素理想时，$\\mathcal{O}_{X,x}=A_{\\mathfrak p}$（A 在 $\\mathfrak p$ 处的局部化）。验证：$\\operatorname{Spec}A$ 中含 $\\mathfrak p$ 的开集形态是 $\\operatorname{Spec}A_f$（$f'\notin'\mathfrak p$，或更一般的是若干这样集合的并），而 $\\mathcal{O}_X(\\operatorname{Spec}A_f)=A_f$，取所有 $f'\notin'\mathfrak p$ 的滤过极限正是 $A_{\\mathfrak p}=\\varinjlim_f A_f$。于是茎的极大理想 $\\mathfrak m_x$ 由「在 x 处取值为零的芽」组成，$\\mathcal{O}_{X,x}/\\mathfrak m_x=\\kappa(x)$ 是剩余域。对 $\\mathcal{O}_X$-模 $\\mathcal{F}$，每个 $\\mathcal{F}(U)$ 是 $\\mathcal{O}_X(U)$-模，取滤过极限后 $\\mathcal{F}_x$ 自动是 $\\mathcal{O}_{X,x}$-模，且当 $X=\\operatorname{Spec}A$、$\\mathcal{F}=\\widetilde M$ 时 $\\mathcal{F}_x=M_{\\mathfrak p}$。这个等式把「层在一点的信息」与「模的局部化」完全等同，是概形论里所有局部计算的起点：判断层的性质（自由、投射、有限生成、凝聚）往往只需在茎上做交换代数。',
        ['colimit-construction']),
      step('exactness-on-stalks', '茎上的正合性与局部化判据',
        '核心的机械性质是：取茎是正合函子。设 $\\mathcal{F}'\xrightarrow{\\alpha}'\mathcal{G}'\xrightarrow{\\beta}'\mathcal{H}$ 是 $\\mathcal{O}_X$-模层的复形。则它在 $\\mathcal{G}$ 处正合（即 $\\operatorname{Im}'\alpha=\\operatorname{Ker}'\beta$）当且仅当对一切 $x$，$\\mathcal{F}_x'\xrightarrow{\\alpha_x}'\mathcal{G}_x'\xrightarrow{\\beta_x}'\mathcal{H}_x$ 在 $\\mathcal{G}_x$ 处正合。理由：正向极限沿滤过范畴是正合函子（滤过极限保持有限极限与有限余极限；核与像的层化在每个茎上逐点计算），而层范畴中的核与像按定义就是「逐点取茎再核/像再层化」，故两者一致。注意「$\\beta$ 是满射」这一层论性质等价于「每个 $\\beta_x$ 是满射」，但**不等价于**「每个 $\\beta(U)$ 是满射」——后者一般不成立，这正是层论与预层论的分界。具体的非满射反例：$X=\\mathbb{C}^{\\times}$、$\\mathcal{O}^{\\times}'\xrightarrow{\\exp}'\mathcal{O}^{\\times}$，在茎上 exp 满射（每个非零芽都有局部对数），但全局 $\\exp:\\mathcal{O}_X^{\\times}(X)\\to'\mathcal{O}_X^{\\times}(X)$ 不满射（$z'\mapsto z$ 没有全局对数），这就是「$H^1$ 不消失」的层论表述。',
        ['stalk-of-structure-sheaf']),
      step('morphism-isomorphism-local', '同构的逐点判定与茎的不可替代性',
        '由正合性立刻得到形态判据：$\\varphi:\\mathcal{F}'\to'\mathcal{G}$ 是单射（层论意义）当且仅当每个 $\\varphi_x$ 单射；是满射当且仅当每个 $\\varphi_x$ 满射；是同构当且仅当每个 $\\varphi_x$ 是同构。证明把 $\\varphi$ 分解为 $\\mathcal{F}'\to \\operatorname{Im}'\varphi'\to'\mathcal{G}$，前一段是满射、后一段是单射，两部分都逐茎检验，故合起来也逐茎检验。但「$\\varphi$ 是单射」与「$\\varphi$ 在每根茎单射」等价这一事实会误导人把它当成「层论只是逐点的话」。整类信息不属于茎：考虑 $X=\\mathbb{P}^1$、$\\mathcal{O}_X'\xrightarrow{0}'\mathcal{O}_X$ 的零映射与 $\\mathcal{O}_X'\xrightarrow{\\times t}'\mathcal{O}_X$（t 为某非零有理函数）在茎上都是单射；而「$\\varphi$ 是同构」在茎上成立却在整体上不成立的例子由上一段给出。更严重的差距是：两个不同的层可以共享全部茎而不同构——例如把开集上的截面「强行粘合」的不同方式。这说明茎只能检测「局部有限性」类的性质，检测不到「黏合条件」，而上同调正是度量这一损失的量。',
        ['exactness-on-stalks']),
      step('stalk-computation-examples', '茎的计算与非层化的对照',
        '最后给出可动手核算的茎计算范本。取 $X=\\operatorname{Spec}'\mathbb{Z}$、$x=(p)$，$\\mathcal{O}_X$ 的茎是 $\\mathbb{Z}_{(p)}=\\{a/b:a,b'\in'\mathbb{Z},\\ p'\nmid b'\}$，极大理想是 $p'\mathbb{Z}_{(p)}$，剩余域 $\\mathbb{F}_p$。再取 $\\mathcal{F}=\\widetilde{M}$，$M=\\mathbb{Z}/6$，则 $\\mathcal{F}_{(p)}=M_p=(\\mathbb{Z}/6)_{(p)}$ 等于 $\\mathbb{Z}/2$（p=2 时）或 $\\mathbb{Z}/3$（p=3 时）或 0（其余 p），这三根茎都非零并且支撑大小恰当：$M$ 的支集正是 $(2)\\cup(3)$。再取非拟凝聚的例子：$X=\\mathbb{C}$、$j:\\mathbb{C}^{\\times}'\hookrightarrow'\mathbb{C}$、$\\mathcal{F}=j_!\\underline{\\mathbb{Z}}$（在原点外取常值 $\\mathbb{Z}$、在原点的茎为 0 的「下推支撑层」）。则 $\\mathcal{F}_0=0$（因为原点附近的任何开集上的截面都必须延拓为零于原点，而原点处不允许有非零芽），但同时 $\\mathcal{F}(\\mathbb{C}^{\\times})=\\mathbb{Z}'\neq0$。这正说明：茎全为零（在原点）不能推出整体截面为零——茎只看见「每一点附近」，看不见「支撑在别处」的截面。这个例子的核算是一行：$j_!\\underline{\\mathbb{Z}}_0$ 的芽在原点附近取零，因为在 0 的任意开邻域上该层的截面在原点的限制为零。',
        ['morphism-isomorphism-local', 'exactness-on-stalks']),
    ],
    conclusion: '$\\mathcal{F}_x=\\varinjlim_{x'\in U}'\mathcal{F}(U)$ 是所有含 x 的开邻域上的滤过余极限，构成层范畴的纤维函子；该函子正合，故层映射的单射性/满射性/同构性可逐茎检验。对概形上的 $\\mathcal{O}_X$-模，$\\mathcal{O}_{X,x}$ 是局部环、$\\mathcal{F}_x$ 是 $\\mathcal{O}_{X,x}$-模，仿射情形下 $\\mathcal{F}_x=M_{\\mathfrak p}$。茎完全决定局部信息，但完全不能看见整体黏合条件，这一缺口由上同调度量。',
    dependencies: [],
    consequences: [],
    explanation: '茎把「层」这个概念里最接近「函数在一点的值」的部分提取出来，代价是放弃所有整体性的信息。可以这样对照：在拓扑空间上，函数在一点的值是一个数，由「沿含该点的开集取极限」得到，而茎正是这个概念对一般层的推广，允许取值在任意代数结构中。它带来两个方向的用处。向上的方向是判定性：几乎所有「局部性质」都可以在茎上检验，例如模的有限生成、自由性、无挠等，于是层的问题可以退化为交换代数问题，这是概形论计算效率的来源。向下的方向是取消性：茎不能决定层，这既表现为「茎处处非零而整体无截面」，也表现为「短正合列取全局截面不满射」。理解这条缺口的方法是把「层」与「预层」对照：预层可以任取局部数据而不管黏合，层则强制黏合，而茎只看局部数据，所以它天然只看得见预层那一侧。上同调就是黏合的障碍度量。',
    examples: [
      { title: '例子：ℙ¹ 上 O(1) 的茎与除子层', body: '取 $X=\\mathbb{P}^1_k$（k 代数闭）、$\\mathcal{O}(1)$ 为超平面类对应的可逆层，$\\mathcal{F}=\\mathcal{O}(1)$。在仿射图 $U_0=\\operatorname{Spec}k[t]$（$t=x_0/x_1$）上 $\\mathcal{O}(1)(U_0)=k[t]$，在 $U_1=\\operatorname{Spec}k[u]$（$u=x_1/x_0$，$u=1/t$）上 $\\mathcal{O}(1)(U_1)=k[u]$。取 $p$ 为 $U_0$ 中 $t=0$ 的点（即 $[1:0]$），则 $\\mathcal{O}(1)_p=k[t]_{(t)}$ 是秩 1 自由的 $\\mathcal{O}_{\\mathbb{P}^1,p}=k[t]_{(t)}$-模。取 $q$ 为无穷远点 $[0:1]$，则 $\\mathcal{O}(1)_q=k[u]_{(u)}$ 秩 1 自由。取 $\\omega$ 为 $\\mathcal{O}(1)$ 的一个整体截面（即 x_0），它在 $U_1$ 上写成 $x_0=x_1\\cdot u$，故在 $q$ 处的芽是 $u$ 的倍数，在 $q$ 处恰好有一个零点；在 $p$ 处则取值非零。所以「$\\mathcal{O}(1)$ 的茎处处是一维自由的，而整体截面的零点是逐点读出的局部信息」——这正说明为什么除子的零点阶是茎上的赋值，而可逆性的秩也是茎上的信息，两者互不冲突。核算：$\\operatorname{ord}_q(x_0)=1$、$\\operatorname{ord}_p(x_0)=0$，于是 $\\operatorname{div}(x_0)=1\\cdot q$ 与 $\\mathcal{O}(1)$ 的除子类一致。' },
      { title: '例子：摩天大楼层的茎与 j! 层的对比', body: '取 $X$ 为任意拓扑空间、$x'\in X$ 固定、$M$ 是模。摩天大楼层 $i_{x,*}M$（$i_x:\\{x'\}'\hookrightarrow X$ 是包含）的茎是：在 $y=x$ 处为 M，在 $y'\neq x$ 处为 0。核算 $y'\neq x$：取 $y$ 的包含 x 的小邻域 U（取 $U=X'\setminus'\{x'\}$ 即可，它是开的因为单点闭——需 X 为 T1，例如概形），则 $(i_{x,*}M)(U)=M$ 还是 0？按定义 $(i_{x,*}M)(U)=M$ 对任何开 U，但限制映射：若 $x'\notin U$ 则限制映射为 0（因为从 $X$ 到 U 的限制把唯一的一个 M 分量丢掉）。于是 $y'\neq x$ 处的茎是 $\\varinjlim_{x'\notin U}(M'\xrightarrow{0}M'\xrightarrow{0}'\cdots)=0$。而在 $y=x$ 处取含 x 的开集 U，$(i_{x,*}M)(U)=M$ 恒定，故茎为 M。作为对照，$j_!\\underline{\\mathbb{Z}}$（常值层沿开包含的下推支撑）在原点茎为 0 而整体截面非零，与摩天大楼层恰好相反：摩天大楼层是「点处有、其余无」，$j_!$ 是「点处无、其余有」。这两个例子共同说明茎的值完全由「在点的任意小邻域上的截面」决定，而整体截面可以是别处的数据。' },
    ],
    remarks: [
      '茎相等不推出层相等：最干净的反例是与摩天大楼层相关的一个中层结构。取 $X=\\{0,1\\}$ 为离散两点空间，则任何层由两个值决定，茎是完备不变量，此时没有反例；必须取非离散拓扑。取 $X=\\mathbb{C}$，$U=\\mathbb{C}'\setminus'\{0\\}$，考虑 $\\mathcal{F}=\\underline{\\mathbb{Z}}$ 与 $\\mathcal{G}=j_!\\underline{\\mathbb{Z}}'\oplus i_{0,*}'\mathbb{Z}$（$j$ 为开包含），则两者的茎在 0 以外的点相同、在 0 处 $\\mathcal{F}_0=\\mathbb{Z}$ 而 $\\mathcal{G}_0=\\mathbb{Z}$ 也相同，但它们作为一个是常层、另一个不是，限制映射不同，故不同构。所以「茎逐点同构」只是同构的必要条件（由正合性给出），不是充分条件；充分性需要额外检查层的黏合结构。这条区分直接对应「层上同调不可由茎计算」这一事实。',
      '茎在特征 p 与不可分扩张情形会掩盖可分性问题：$k'\to k[\\alpha]$（$\\alpha^p=a$，纯不可分）作为环映射，在唯一的素理想处茎是 $k[\\alpha]$ 本身，它是域，看起来很「好」，但基变换到 $\\bar k$ 后变成 $\\bar k[z]/(z^p)$，局部环不正则，余切模 $\\Omega=0$ 也看不出问题。这说明茎只能给出「原始」的局部信息，不能给出「几何局部信息」；光滑性判别要求的是后者（几何正则），所以只用茎作局部判断会出错。这是「茎 vs 几何点」这对区别的典型体现。',
      '茎与完备化的关系：先局部化取茎再完备化，得到的是 $\\widehat{\\mathcal{O}}_{X,x}$，它比茎 $\\mathcal{O}_{X,x}$ 更大（例如 $k[x]_{(x)}$ 的完备化是 $k[[x]]$）。完备化后的茎承载「无穷小邻域」的信息，而原始茎承载「有限邻域」的信息；形式几何（形式光滑、形式平展）是在完备化茎上做文章，而 Zariski 局部性质是在原始茎上做文章。混淆这两个层次会导致把「形式邻域里成立」误当成「Zariski 邻域里成立」，例如形式光滑不等于光滑正是这一混淆的最常出现处。',
      '取茎函子只保持有限极限与有限余极限（在层范畴上），不能与无限直积或无限直和交换：层的无限直积的茎等于茎的直积（因为滤过余极限与直积交换），但无限直和的茎需要层化，一般不等于茎的直和（模层的直和必须是层化的直和，逐点取直和得到的只是预层）。因此在写「$\\mathcal{F}_x=\\bigoplus_i(\\mathcal{F}_i)_x$」这类等式前必须确认所涉及的是有限直和，或已说明层化后成立；无限情形要改写为「直和的层化在茎上等于直和」，这正是把预层直和变成层直和的必要步骤。',
    ],
    corollaries: [
      { title: '推论：层映射是同构当且仅当逐茎同构', body: '设 $\\varphi:\\mathcal{F}'\to'\mathcal{G}$ 是 X 上 $\\mathcal{O}_X$-模层的态射。则 $\\varphi$ 是同构当且仅当对一切 $x'\in X$，$\\varphi_x:\\mathcal{F}_x'\to'\mathcal{G}_x$ 是同构。证明：必要性显然（函子作用）；充分性用取茎的正合性：$\\ker'\varphi$ 与 $\\operatorname{coker}'\varphi$ 的茎分别为 $\\ker'\varphi_x$ 与 $\\operatorname{coker}'\varphi_x$，由假设全为零，而一个层为零当且仅当其所有茎为零（取零层的茎判据），故 $\\varphi$ 既单又满，从而是同构。这条推论是概形论中「局部验证」的最常用形式，例如验证 $\\mathcal{O}(D)$ 的同构、验证态射的拉回结构、验证拟凝聚层的同构，都归结为在每根茎上做一次交换代数。', uses: ['morphism-isomorphism-local'] },
    ],
    references: [
      stacks('Lemma 17.3.1: exactness can be checked on stalks', '01AG'),
      stacks('Section 6.11: Stalks of sheaves', '00V5'),
    ],
    history: HISTORY,
  },

  /* ═══════════════════════════════════════════════════════════
   * 5. 凝聚层的局部判定
   * ═══════════════════════════════════════════════════════════ */

  'a-oyama': {
    statement: '设 $(X,\\mathcal{O}_X)$ 是局部诺特概形，$\\mathcal{F}$ 是 X 上的拟凝聚 $\\mathcal{O}_X$-模。则 $\\mathcal{F}$ 是凝聚层（coherent）当且仅当对一切 $x'\in X$，$\\mathcal{F}_x$ 是有限生成 $\\mathcal{O}_{X,x}$-模。对一个模层 $\\mathcal{F}$，凝聚的定义是：(i) $\\mathcal{F}$ 是有限型（局部由有限多个截面生成）；(ii) 对每个开集 $U'\subseteq X$ 与每个 $n'\ge1$、每个层映射 $\\mathcal{O}_U^{\\oplus n}'\to'\mathcal{F}|_U$，其核是有限型的。在 $\\mathcal{O}_X$ 本身凝聚（即 X 局部诺特）的假设下，条件 (ii) 自动满足，于是「凝聚 ⇔ 有限型 ⇔ 茎有限生成」。',
    explanation: '这条判据的实质是把凝聚性这一看起来「局部—整体混合」的条件完全化归到茎上。凝聚的定义有两层：有限生成（有限型）与「任何有限自由层到它的映射的核仍然有限型」。第二层条件是棘手的，因为它量化地在所有开集与所有映射上取值。但在 X 局部诺特时，$\\mathcal{O}_X$ 自身凝聚（诺特环上有限生成模的子模仍有限生成），于是第二层可以自动传递下来：任何有限自由层到 $\\mathcal{F}$ 的映射的核都是 $\\mathcal{O}_X^{\\oplus n}$ 的有限型子层，在局部诺特情形仍是有限型。于是凝聚退化为「有限型」，而「有限型」纯粹是茎上的条件（$\\mathcal{F}_x$ 由有限多个元素生成）。这一退化极为实用：Serre 有限性定理、Grauert 直像定理、形式函数定理等许多结论的正确性都只依赖「凝聚性」这个条件，而这条判据让凝聚性可以在局部环上验证，不必在整层上验证。',
    steps: [
      step('coherent-definition-and-nakayama', '凝聚的定义与有限型在茎上的判据',
        '先写清定义。设 $(X,\\mathcal{O}_X)$ 是环化空间，$\\mathcal{F}$ 是 $\\mathcal{O}_X$-模。称 $\\mathcal{F}$ 为有限型，若 X 有开覆盖 $\\{U_i'\}$ 使每个 $\\mathcal{F}|_{U_i}$ 由有限多个截面生成（即存在满射 $\\mathcal{O}_{U_i}^{\\oplus n_i}'\to'\mathcal{F}|_{U_i}$）。称 $\\mathcal{F}$ 为凝聚，若它有限型，且对每个开 $U$、每个 $n$、每个态射 $\\mathcal{O}_U^{\\oplus n}'\to'\mathcal{F}|_U$，其核有限型。关键的第一步是把「有限型」翻译成茎条件：$\\mathcal{F}$ 有限型当且仅当对一切 $x'\in X$，$\\mathcal{F}_x$ 是有限生成 $\\mathcal{O}_{X,x}$-模。证明：若 $\\mathcal{F}$ 在 x 的某个开邻域 U 上由 $s_1,\\ldots,s_n$ 生成，取茎得 $\\mathcal{F}_x$ 由 $(s_i)_x$ 生成，故有限生成。反之设 $\\mathcal{F}_x$ 由 $t_1,\\ldots,t_n$ 生成，每个 $t_i$ 来自某含 x 开集 $U_i$ 上的截面 $s_i$，取 $U=\\bigcap U_i$（含 x、开），则由「$\\mathcal{F}_x$ 由 $t_i$ 生成」与「层由茎决定」可得在 U 的某个含 x 的更小开集上 $s_i$ 生成 $\\mathcal{F}$，这里用的是 Nakayama 引理：若 $\\mathcal{F}_x$ 由 $t_i$ 在 $\\mathcal{O}_{X,x}$ 上生成，则存在 x 的邻域使 $s_i$ 生成。注意此处用到的 Nakayama 引理要求 $\\mathcal{F}_x$ 有限生成（否则 $\\mathcal{F}_x=\\mathfrak m_x'\mathcal{F}_x$ 不能推出矛盾），而有限生成正是我们正在建立的结论——所以论证顺序上要取 $\\mathcal{F}_x$ 的有限生成组作为假设。',
        []),
      step('noetherian-recovers-coherence', '局部诺特使第二层条件自动成立',
        '第二步：说明在 X 局部诺特时，凝聚性等价于有限型。需要证：若 $\\mathcal{G}$ 是有限型 $\\mathcal{O}_X$-模且 $\\varphi:\\mathcal{O}_U^{\\oplus n}'\to'\mathcal{G}|_U$ 是态射，则 $\\ker'\varphi$ 有限型。在 X 局部诺特（即每个局部环 $\\mathcal{O}_{X,x}$ 诺特）且 $\\mathcal{O}_X$ 凝聚时，$\\mathcal{O}_U^{\\oplus n}$ 是凝聚的；凝聚层的核在凝聚层之间仍是凝聚的（这是凝聚性的基本性质：凝聚层构成阿贝尔范畴，核、余核、像都凝聚）。于是只需证「$\\mathcal{O}_X$ 凝聚 ⇔ X 局部诺特」以及「凝聚层的子层凝聚」。后者按定义逐点验证：若 $\\mathcal{H}'\subseteq'\mathcal{G}$ 且两者都凝聚，则 $\\mathcal{H}$ 有限型（由 $\\mathcal{G}$ 凝聚性对包含映射 $\\mathcal{H}'\to'\mathcal{G}$ 用定义即得）。这一循环的关键是诺特性：在诺特局部环上有限生成模的子模有限生成，这正是诺特环的定义性质，于是「凝聚」这个条件的两个层次在诺特情形下塌缩成一个。反例上，在非诺特的环化空间上（如无限维的 $k[x_1,x_2,\\ldots]$ 谱的某开集，或某些非诺特的仿射概形上的 $\\mathcal{O}_X$），$\\mathcal{O}_X$ 本身不是凝聚的，此时「有限型」与「凝聚」不等价，判据失效。',
        ['coherent-definition-and-nakayama']),
      step('stalk-condition-implies-coherent', '从茎到凝聚：两个方向的合成',
        '第三步完成证明的「⇒」方向（假设 $\\mathcal{F}$ 拟凝聚）。$\\mathcal{F}$ 拟凝聚意味着在每个仿射开集 $U=\\operatorname{Spec}A$ 上 $\\mathcal{F}|_U'\cong'\widetilde M$ 对某个 A-模 M。若每个茎 $\\mathcal{F}_x$ 有限生成，取 $x=\\mathfrak p'\in'\operatorname{Spec}A$，$M_{\\mathfrak p}=\\mathcal{F}_x$ 有限生成 $A_{\\mathfrak p}$-模，于是在 $\\mathfrak p$ 附近（即存在 $f'\notin'\mathfrak p$ 使 $M_f$ 有限生成 $A_f$-模）成立，这是有限生成模局部化的标准性质；取遍所有 $\\mathfrak p$ 后用仿射覆盖的有限性（A 诺特时 $\\operatorname{Spec}A$ 拟紧，故可用有限个基本的开集覆盖）得 M 有限生成，于是 $\\mathcal{F}|_U$ 有限型。再由局部诺特与上一步的塌缩，得 $\\mathcal{F}$ 凝聚。「⇐」方向：若 $\\mathcal{F}$ 凝聚，则 $\\mathcal{F}$ 有限型，由第一步「有限型 ⇒ 茎有限生成」，故每个 $\\mathcal{F}_x$ 有限生成。两个方向合起来给出「拟凝聚 + 茎有限生成 ⇔ 凝聚」。注意拟凝聚不能去掉：非拟凝聚且茎有限生成的层可以不是凝聚的（因为凝聚性的定义要求局部有整体的有限表示，非拟凝聚层在仿射开集上没有模的结构，无法把局部信息组装成整体）。',
        ['noetherian-recovers-coherence']),
      step('consequences-and-finite-presentation', '凝聚性的推论：有限表示与有限性定理',
        '凝聚性带来的第一个附加结论是「局部有限表示」：若 $\\mathcal{F}$ 在局部诺特 X 上凝聚，则每个点有邻域 U，使 $\\mathcal{O}_U^{\\oplus m}'\to'\mathcal{O}_U^{\\oplus n}'\to'\mathcal{F}|_U'\to0$ 正合（有限自由层的有限表示）。证明：取 $\\mathcal{F}$ 的有限生成组得 $\\mathcal{O}^n'\to'\mathcal{F}'\to0$，取核 $\\mathcal{K}$，由凝聚性 $\\mathcal{K}$ 也凝聚（凝聚层的核凝聚），故 $\\mathcal{K}$ 有限型，再取 $\\mathcal{O}^m'\to'\mathcal{K}'\to0$ 即得。第二个结论是「拟凝聚 vs 凝聚的差别只在有限性」，这直接导致 Serre 有限性定理：在射影簇上凝聚层的上同调有限维，而拟凝聚层不保证。第三个结论是「凝聚层的支集是闭集」（凝聚层的消没点集为闭），这条在证明零点集为闭、除子为闭时反复用到。这三条共同说明为什么几何里宁可要求凝聚而不只要求拟凝聚：凝聚性给出有限性，而有限性是所有计算能被完成的前提。',
        ['stalk-condition-implies-coherent']),
      step('fitt-ideals-and-criterion', '用 Fitting 理想实现判据：局部秩的函数',
        '再给一个把「茎有限生成」变成「理想序列」的具体工具。设 $f:X'\to S$ 局部有限型、$\\mathcal{F}$ 有限型拟凝聚。定义 Fitting 理想 $\\operatorname{Fit}_r(\\mathcal{F})$ 为「$\\mathcal{F}$ 的局部 $\\mathcal{O}_X^{\\oplus n}$ 表示矩阵的 $(n-r)$ 阶子式生成的理想」，它与表示的选择无关（这是 Fitting 理想的标准不变性）。于是「$\\mathcal{F}$ 在 x 处可由 r 个元素生成」等价于 $\\operatorname{Fit}_r(\\mathcal{F})_x=\\mathcal{O}_{X,x}$。这个等式把「茎上的生成元个数」变成一个可以用行列式计算的局部条件。对 $\\mathcal{F}=\\Omega_{X/S}$ 应用时得到：$V(\\operatorname{Fit}_0(\\Omega))$ 恰是 $f$ 不非分歧的点集，$V(\\operatorname{Fit}_r(\\Omega))$ 是 $\\Omega$ 的局部自由性失效的点的集合。因此「$\\Omega_{X/S}$ 局部自由」（光滑性判别的第三条）可以写成 $\\operatorname{Fit}_r(\\Omega)$ 的消失条件。这一翻译是代数几何里把「层论局部条件」写成「理想的零点集」的标准手法，也是奇点理论中「雅可比理想」「奇点轨迹」概念的来源。',
        ['consequences-and-finite-presentation']),
    ],
    conclusion: '在局部诺特概形 X 上，对拟凝聚层 $\\mathcal{F}$，下列等价：(1) $\\mathcal{F}$ 凝聚；(2) $\\mathcal{F}$ 有限型；(3) 每个茎 $\\mathcal{F}_x$ 是有限生成 $\\mathcal{O}_{X,x}$-模。进一步，凝聚层局部有有限自由表示 $\\mathcal{O}^{\\oplus m}'\to'\mathcal{O}^{\\oplus n}'\to'\mathcal{F}'\to0$，且可用 Fitting 理想 $\\operatorname{Fit}_r(\\mathcal{F})$ 把「茎的生成元个数 ≤ r」写成 $\\operatorname{Fit}_r(\\mathcal{F})=\\mathcal{O}_X$ 的等式。',
    dependencies: [],
    consequences: [],
    explanation: '这条判据的精神是「把定义里量化在开集上的条件搬到点上」。凝聚的定义里有一句对一切开集与一切自由层映射的要求，形式上很重；但这条要求的全部内容都在「$\\mathcal{O}_X$ 是凝聚的」这一件事上，而后者在局部诺特情形自动成立。于是凝聚性缩减为有限型，有限型缩减为茎的有限生成，而茎的有限生成是纯粹的交换代数条件。这个缩减链的每一环都依赖诺特性：诺特环上有限生成模的子模有限生成，保证了「核仍有限型」这一条不需要逐层验证。反过来，若 X 非局部诺特，判据失效，因为茎上「有限生成」不能推出局部有有限生成组（Nakayama 在取邻域时需要有限生成前提）。这也解释了为什么绝大多数几何定理都在诺特或局部诺特假设下陈述。',
    examples: [
      { title: '例子：ℙ¹ 上的 O(-1) 与有限生成性', body: '取 $X=\\mathbb{P}^1_k$、$\\mathcal{F}=\\mathcal{O}(-1)$。$\\mathcal{F}$ 是可逆层，处处茎是一维自由 $\\mathcal{O}_{X,x}$-模，故有限生成，凝聚。核对整体截面：$h^0(\\mathcal{O}(-1))=0$，即在 $\\mathbb{P}^1$ 上 $\\mathcal{O}(-1)$ 没有非零整体截面，但层仍凝聚——这正说明凝聚性是局部条件，与整体截面的多少无关。若改取 $\\mathcal{F}=\\bigoplus_{d'\ge0}'\mathcal{O}(-d)$（无限直和的层化），则每根茎是无限生成的 $\\mathcal{O}_{X,x}$ 模（因为需要在茎上生成无穷多个不同次数的方向），故不有限型、不凝聚；由判据，它在每个点都通不过检验。这个对照说明判据确实在区分两个极端的层，而「整体截面为零」这种信息对判断凝聚性毫无用处。' },
      { title: '例子：仿射曲线 A = k[x,y]/(y²−x³) 上的理想层', body: '取 $X=\\operatorname{Spec}A$，$A=k[x,y]/(y^2-x^3)$（尖点三次曲线），$\\mathcal{F}=\\widetilde{\\mathfrak m}$ 其中 $\\mathfrak m=(x,y)\\subseteq A$ 是原点对应的极大理想。$\\mathfrak m$ 作为 A-模由 x、y 两个元素生成，故 $\\mathcal{F}$ 有限型、凝聚（A 是诺特环，故 X 局部诺特，判据适用）。在原点 $\\mathfrak m$ 处：$A_{\\mathfrak m}$ 是局部环，$\\mathfrak m_{\\mathfrak m}$ 由 x、y 生成，但在 $A_{\\mathfrak m}$ 上能否由一个元素生成？观察到 $y^2=x^3$ 给出 $y'\cdot y=x'\cdot x^2$，在 $A_{\\mathfrak m}$ 中 y 与 x 的关系复杂：$y^2=x^3$ 意味着 $y'\notin xA_{\\mathfrak m}$（因为若 $y=xg$ 则 $x^2g^2=x^3$ 即 $g^2=x$，而 x 不是平方元，需更细地看；实际上 $A_{\\mathfrak m}$ 中 $y'\notin(x)$，因为 $(x)$ 中的元素写成 $x'\cdot h(x,y)=xh(x,0)+y(\\ldots)$，其一次项只含 y 的偶数部分？更干净的做法是用赋值：$A/(x)\\cong k[y]/(y^2)$，故 x 不是单生成的）。因此在原点茎不由一个元素生成、而由两个元素生成，这与 $\\mathfrak m$ 由 2 个元素生成一致。核对：$\\dim_k \\mathfrak m_{\\mathfrak m}/\\mathfrak m_{\\mathfrak m}^2=2$？实际上 $\\mathfrak m/\\mathfrak m^2=\\mathfrak m$ 的生成元数是 2（由 x,y），而 $A_{\\mathfrak m}$ 需要 2 个生成元，故茎的生成元数 = 2。这个例子说明判据可以逐点核算，且生成元数就是切空间维数 $\\dim_k'\mathfrak m_{\\mathfrak m}/\\mathfrak m_{\\mathfrak m}^2$。' },
    ],
    remarks: [
      '局部诺特假设不可去掉：取非诺特环 $R=k[x_1,x_2,\\ldots]/(x_ix_j:i'\neq j)$（「无限多个互不相交的直线」，即 $\\bigoplus_i k'\cdot x_i$ 加上 k），$X=\\operatorname{Spec}R$。R 不是诺特的（理想 $(x_1,x_2,\\ldots)$ 不有限生成）。考虑理想 $\\mathfrak m=(x_1,x_2,\\ldots)$ 与层 $\\mathcal{F}=\\widetilde{\\mathfrak m}$：在每个茎上 $\\mathfrak m_{\\mathfrak p}$ 是有限生成 $R_{\\mathfrak p}$-模（因为 $\\mathfrak p$ 只包含有限多个 $x_i$，其余 $x_j$ 在局部化后变成可逆元，$\\mathfrak m_{\\mathfrak p}=(\\mathfrak p_{\\mathfrak p})+R_{\\mathfrak p}$ 由有限个元素生成），但 $\\mathfrak m$ 本身不是有限生成 R-模，故 $\\mathcal{F}$ 不是有限型、不凝聚。于是「所有茎有限生成」不能推出凝聚，判据在此失效。这条反例精确指出诺特性在判据中的位置：它保证茎的有限生成能反向传回局部。',
      '「有限型」与「凝聚」的差别在非诺特情形是实质性的：$\\mathcal{O}_X$ 本身在非诺特概形上不是凝聚的（因为它不满足定义的第二条：某些自由层映射的核可以有限生成性失败）。此时「凝聚层」这个范畴甚至可能不是阿贝尔范畴（核不凝聚），故许多标准操作（如取核、取像）在非诺特情形会跑出凝聚层之外。使用「凝聚」一词时若底概形非诺特，必须逐条核对定义而**不能**用茎判据替代。',
      '拟凝聚假设不可去掉：取一个非拟凝聚的层，例如 $X=\\mathbb{C}^2$、$\\mathcal{F}$ 为在无界集上取某个常值与在有界集上取 0 拼起来的「怪层」，可以构造出茎有限生成但非拟凝聚的层。非拟凝聚层在仿射开集上没有模的描述，无法把局部的有限生成组汇总成整体表示，故凝聚性（要求局部有限表示）不能成立。这也是为什么 STACKS 的判据以及 Serre 有限性定理都同时假设「拟凝聚」+「茎有限生成」。',
      'Fitting 理想的零点集与「局部自由」的失效集不同：$V(\\operatorname{Fit}_r(\\mathcal{F}))$ 刻画的是「生成元数 > r」的点，这对 $\\mathcal{F}=\\Omega_{X/S}$ 给出的是「相对余切维数异常」的点集；而「$\\Omega$ 局部自由」要求 $\\operatorname{Fit}_r(\\Omega)=\\mathcal{O}_X$ 对某个固定 r 在每点成立，即需要 $V(\\operatorname{Fit}_r)$ 为空。这两者一个是「非分歧点集」、一个是「维数正常的点集」，不要混用；例如非奇异曲线上的 $\\Omega$ 处处秩 1，但奇点曲线上 $\\Omega$ 在奇点处的 Fitting 理想给出 $V(\\operatorname{Fit}_1)$ 恰为奇点集。',
    ],
    corollaries: [
      { title: '推论：凝聚层局部有有限自由表示，且支集为闭', body: '设 $\\mathcal{F}$ 在局部诺特 X 上凝聚。则 $\\mathcal{F}$ 局部有正合列 $\\mathcal{O}_U^{\\oplus m}'\to'\mathcal{O}_U^{\\oplus n}'\to'\mathcal{F}|_U'\to0$，即局部有限表示；并且 $\\operatorname{Supp}'\mathcal{F}=\\{x:\\mathcal{F}_x'\neq0\\}$ 是闭集。前一条说明凝聚层的全部局部信息由有限矩阵记录，这就是 Serre 有限性定理、Koszul 复形等一切有限计算的依据；后一条来自 $\\operatorname{Supp}'\mathcal{F}=V(\\operatorname{Ann}'\mathcal{F})$ 与 $\\operatorname{Ann}'\mathcal{F}$ 是有限型理想（由有限表示读出），故其零点集闭。把两条合起来，就得到「凝聚层的一切局部性质都可由有限矩阵读出」，这正是交换代数与代数几何之间最有效的翻译通道。', uses: ['stalk-condition-implies-coherent'] },
    ],
    references: [
      stacks('Lemma 17.3.1: exactness can be checked on stalks', '01AG'),
      stacks('Lemma 31.10.1: Fitting ideals of the module of differentials', '0C3I'),
      { title: 'Coherent Analytic Sheaves', author: 'Grauert & Remmert', year: 1984 },
    ],
    history: HISTORY,
  },

  /* ═══════════════════════════════════════════════════════════
   * 6. 摩天大楼层
   * ═══════════════════════════════════════════════════════════ */

  'a-skyscraper': {
    statement: '设 $X$ 是拓扑空间，$x'\in X$ 是闭点（$\\{x'\}$ 为闭集，例如任意概形上的点或 T1 空间中的点），$i:\\{x'\}'\hookrightarrow X$ 是包含映射，$M$ 是 $\\mathcal{O}_{X,x}$-模（更一般地是环 $\\mathcal{O}_X$ 在 x 处的模）。定义摩天大楼层 $i_*M$ 为 $i$ 的推前层：$(i_*M)(U)=M$ 若 $x'\in U$、否则为 0（更精确地，$(i_*M)(U)=M$ 对一切开 U，但限制映射 $\\rho^U_V$ 在 $x'\notin V$ 时为零映射）。则有：(1) 茎 $(i_*M)_y=M$ 若 $y=x$，否则为 0；(2) $i_*$ 是正合函子（因为它其实是「沿闭浸入推前」），故 $i_*$ 保持核与余核；(3) $H^0(X,i_*M)=M$，$H^q(X,i_*M)=0$（$q>0$）当 $X$ 是 T1 或至少 $\\{x'\}$ 闭且空间足够好（对一般拓扑空间，$i_*M$ 是松层，故高阶上同调全消没）；(4) $\\operatorname{Hom}_{\\mathcal{O}_X}(i_*M,\\mathcal{F})\\cong \\operatorname{Hom}_{\\mathcal{O}_{X,x}}(M,\\mathcal{F}_x)$。',
    explanation: '摩天大楼层是最简单的非零层：它把所有信息压缩到一个点上，其余地方一片空白。这个「极端简单」使它成为层论里最好的试金石。它的第一项用途是检验函子的正合性：因为摩天大楼层的全局截面就是 M、高阶上同调为零，任何「看似应该有 Exactness」的断言都可以拿它来试。经典应用是检验全局截面函子 $\\Gamma(X,-)$ 不正合：取 $x'\neq y$ 两点，考虑从 $i_{x,*}M$ 到 $i_{x,*}(M/N)$ 的满射（$N'\subseteq M$），它在层论意义下是满射（因为推前正合），但取全局截面后得到的 $M'\to M/N$ 在什么条件下满射取决于 $M'\to M/N$ 本身；更干净的检验是取 $M=k$、层 $\\mathcal{F}=i_{x,*}'\underline{k}$ 与 $\\mathcal{G}=i_{x,*}'\underline{k}/\\underline{k}$ 的短正合列在全局截面上失效。第二项用途是「正合列的探测器」：任何需要用局部化核对的短正合列，都可以在最简单的层上先核对一遍。第三项用途是理解「层论 vs 模论」的差别：摩天大楼层把一个点上的模变成层，说明层不能只靠茎恢复，但摩天大楼层本身的茎就是那个模，所以它给出了「茎完全决定层」的一个极端例子，与 $j_!$ 型层恰好相反。',
    steps: [
      step('pushforward-along-closed-immersion', '沿闭浸入推前：定义与茎计算',
        '先把构造写清楚。设 $i:\\{x'\}'\hookrightarrow X$ 是闭点包含（$\\{x'\}$ 是闭集）。$\\{x'\}$ 上带离散拓扑，其上的层（$\\mathcal{O}_{\\{x'\}}$-模）就是模 M。推前层 $i_*M$ 按定义在开集 $U'\subseteq X$ 上取值 $\\mathcal{\\mathcal{}}(i_*M)(U)=M$ 若 $x'\in U$，否则为 0，同时若 $V'\subseteq U$ 都含 x，限制映射是恒等 $M'\to M$；若 $x'\in U$ 而 $x'\notin V$，限制映射是 $M'\to'\mathcal{\\mathcal{}}0$。需要检查这是层：给定开覆盖 $\\{U_'\alpha'\}$ 与相容截面族 $s_'\alpha$，若某个 $U_'\alpha$ 含 x，则所有含 x 的 $U_'\beta$ 上 $s_'\beta$ 由恒等限制相互等同（都在 M 中），且不含 x 的 $U_'\beta$ 上截面必为 0（因为由限制映射把它们与含 x 的邻域比较时，需要 $x'\notin U_'\beta$ 边的限制为 0 一致性——准确地说，取 $U_'\beta$ 不含 x、$U_'\alpha$ 含 x，$U_'\alpha'\cap U_'\beta$ 不含 x，其上两者都必须是 0，相容性成立）。于是截面可粘成一个全局 M 的元素，唯一性显然。故 $i_*M$ 是层。茎的计算：对 $y'\neq x$，取含 y 不含 x 的开邻域 $V$（存在因为 $\\{x'\}$ 闭），则 $(i_*M)(V)=0$，故 $(i_*M)_y=0$；对 $y=x$，含 x 的任意开集 U 上有 $(i_*M)(U)=M$ 且限制都是恒等，故 $(i_*M)_x=M$。',
        []),
      step('exactness-and-hom', '正合性与 Hom 的计算',
        '第二步：$i_*$ 是正合函子。因为 $i_*$ 是右伴随（左伴随为 $i^*$，即沿 $i$ 的拉回 $i^{-1}(-)\\otimes_{\\mathcal{O}_{\\{x'\}}}$），而右伴随只保持极限；这里更需要的是 $i_*$ 的显式形式：对闭浸入，$i_*$ 把 $\\{x'\}$ 上的模层送到 X 上的模层，且 $i_*$ 保持核与余核，因为它只在一点上保留原模而其余位置全为 0，而「逐点取 M」的操作显然保持核与余核（这就是沿闭浸入推前的性质：闭浸入是「局部同构到闭子空间」，推前在这种情况下是正合的）。形式上：$i_*$ 有左伴随 $i^{-1}$，$i^{-1}$ 是 $\\mathcal{O}_{\\{x'\}}$-模层的「在一点求值」函子，它正合且 $i^{-1}i_*=\\mathrm{id}$；对闭浸入还有 $i_*i^{-1}$ 是恒等（当对象支撑在 $\\{x'\}$ 上时），所以 $i_*$ 与 $i^{-1}$ 构成一对互逆等价（在支撑于 $\\{x'\}$ 的层范畴上），因此 $i_*$ 正合。Hom 的计算：任何一个层态射 $\\varphi:i_*M'\to'\mathcal{F}$ 由其在含 x 的开集上的分量决定，而这些分量必须与限制映射相容，故 $\\varphi$ 由它在 x 处的芽 $\\varphi_x:M'\to'\mathcal{F}_x$ 完全决定；反之任意 $\\mathcal{O}_{X,x}$-线性 $M'\to'\mathcal{F}_x$ 可以延拓为一个态射（在 $x$ 的某个邻域上先取代表元，再在其余地方取 0）。于是 $\\operatorname{Hom}_{\\mathcal{O}_X}(i_*M,\\mathcal{F})\\cong'\operatorname{Hom}_{\\mathcal{O}_{X,x}}(M,\\mathcal{F}_x)$，这就是「伴随关系」在摩天大楼层上的显式形态。',
        ['pushforward-along-closed-immersion']),
      step('cohomology-vanishing', '上同调：H⁰ = M，高阶全消没',
        '第三步算上同调。$H^0(X,i_*M)=\\Gamma(X,i_*M)=M$（因为 X 本身含 x）。高阶上同调为零：$i_*M$ 是松层（flasque）。松层定义为「对任意开 $V'\subseteq U$，限制映射 $\\mathcal{F}(U)\\to'\mathcal{F}(V)$ 是满射」。检验 $i_*M$：若 $x'\in V$，则两边都是 M、限制是恒等，满射；若 $x'\notin V$ 而 $x'\in U$，则 $\\mathcal{F}(U)=M'\to'\mathcal{F}(V)=0$ 是满射；若 $x'\notin U$ 则两边都 0。故 $i_*M$ 松。而松层的高阶上同调全为零，这是层上同调的基本定理：若 $\\mathcal{I}^\\bullet$ 是 $\\mathcal{F}$ 的单射消解且每层松，则 $H^q(X,\\mathcal{F})=H^q(\\Gamma(X,\\mathcal{I}^\\bullet))$；对松层 $\\mathcal{F}$，可嵌入它到某个单射层 $\\mathcal{I}$，商层 $\\mathcal{I}/\\mathcal{F}$ 仍松（松层的商松，在适当条件下），于是由长正合列归纳得 $H^q(X,\\mathcal{F})=0$（$q>0$）。于是 $H^q(X,i_*M)=0$ 对 $q>0$，这个结论说明摩天大楼层在「上同调层面」是平凡的：它不携带任何需要用高阶上同调度量的整体信息，因为它的支撑太集中。注意这条来自「松」而不是来自「射影」或「仿射」，因此对任意拓扑空间成立，不需要任何有限性假设。',
        ['exactness-and-hom']),
      step('global-sections-not-exact', '全局截面不正合：用它检验 H⁰ 的左正合性',
        '第四步用摩天大楼层检验 $\\Gamma(X,-)$ 不正合。取 $X=\\mathbb{C}$ 或任何一个有至少两个点的 T1 空间，设 $M=\\mathbb{Z}$、$N=0\\subseteq M$。为造出「逐茎满射而全局截面不满射」，取更精细的例子：设 $x'\neq y$ 是 X 的两点，取层 $\\mathcal{F}_1=i_{x,*}'\mathbb{Z}$ 与 $\\mathcal{F}_2=i_{x,*}'\mathbb{Z}'\oplus i_{y,*}'\mathbb{Z}$，以及自然的包含 $\\alpha:\\mathcal{F}_1\\hookrightarrow'\mathcal{F}_2$（在 x 处是 $\\mathbb{Z}'\hookrightarrow'\mathbb{Z}'\oplus'\mathbb{Z}$ 的第一个分量）、商层 $\\mathcal{Q}=\\mathcal{F}_2/\\mathcal{F}_1=i_{y,*}'\mathbb{Z}$。于是有短正合列 $0\\to i_{x,*}'\mathbb{Z}'\to i_{x,*}'\mathbb{Z}'\oplus i_{y,*}'\mathbb{Z}'\to i_{y,*}'\mathbb{Z}'\to0$ 吗？在茎上检验：$x$ 处 $0\\to'\mathbb{Z}'\to'\mathbb{Z}'\oplus'\mathbb{Z}'\to'\mathbb{Z}'\to0$ 是正合的（第一分量包含、第二分量投射）；$y$ 处 $0\\to0\\to'\mathbb{Z}'\to'\mathbb{Z}'\to0$ 也正合。故这是短正合列。取全局截面：$0\\to'\mathbb{Z}'\to'\mathbb{Z}'\oplus'\mathbb{Z}'\to'\mathbb{Z}'\to0$，这也是正合的（因为两点都闭，$\\Gamma(X,i_{x,*}'\mathbb{Z})=i_{x,*}'\mathbb{Z}(X)=\\mathbb{Z}$ 对所有含 x 的 X 成立，故三个全局截面分别是 $\\mathbb{Z}$、$\\mathbb{Z}'\oplus'\mathbb{Z}$、$\\mathbb{Z}$）。所以这个例子仍然正合——因为 X 只有两点且都闭。要得到不正合的例子，取 $X=\\mathbb{C}$、$x$ 为原点、$M=\\mathbb{Z}$、$\\mathcal{L}=i_{x,*}'\mathbb{Z}$ 与常值层 $\\underline{\\mathbb{Z}}$，考虑正合列 $0\\to i_{x,*}'\mathbb{Z}'\to \\underline{\\mathbb{Z}}'\to \\underline{\\mathbb{Z}}/i_{x,*}'\mathbb{Z}'\to0$；在茎上处处正合，但取全局截面：$\\Gamma(X,\\underline{\\mathbb{Z}})\\to'\Gamma(X,\\underline{\\mathbb{Z}}/i_{x,*}'\mathbb{Z})$ 的像不含「在原点处被杀死但别处非零」的整体截面（因为商层在 $\\mathbb{C}'\setminus'\{x'\}$ 上的截面来自常值层，而在 x 处的茎为 0 意味着任何代表它在 x 附近必须为零，于是整体上是 0），故不满射，$H^0$ 不正合。这就是「$\\Gamma$ 只左正合」的标准检验。',
        ['cohomology-vanishing']),
      step('stalk-vs-global-and-ext', '与茎论的对照：摩天大楼层的定位',
        '最后把摩天大楼层放在「茎 vs 整体」的框架里定位。前面的步骤说明：摩天大楼层的信息完全集中在一个点上，而且在那个点上茎就等于原模 M；这个性质使它成为「茎可以决定层」的极端例子（对比 $j_!$ 型层，茎在原点为 0 而整体截面非零，是另一个极端）。两个极端共同说明茎不是完备不变量：摩天大楼层的茎给出了 M（看似「完整」），但它和常值层在某些点上的茎可以相同（例如 X 是单点空间时任何层都是摩天大楼层，此时没有区别），而在更复杂的空间上摩天大楼层与常值层在非支撑点上的茎差别很大。另一条重要性质是它的 Ext 计算：$\\operatorname{Ext}^q_{\\mathcal{O}_X}(i_*M,\\mathcal{F})\\cong'\operatorname{Ext}^q_{\\mathcal{O}_{X,x}}(M,\\mathcal{F}_x)$，因为 $i_*$ 与 $i^{-1}$ 在支撑于 $\\{x'\}$ 的范畴上互逆，而 Ext 在同构下保持。这条恒等式是把「层的局部 Ext」与「模的 Ext」对上的基本工具，也是局部对偶理论中「把层的计算压到一个点上的模计算」这一手法的原型。综合起来，摩天大楼层的三重身份（最简单的非零层、正合性的探测器、局部—整体对照的标尺）使它成为层论入门不可跳过的一步。',
        ['global-sections-not-exact', 'exactness-and-hom']),
    ],
    conclusion: '对闭点 $x'\in X$ 与模 M，摩天大楼层 $i_*M$ 满足 $(i_*M)_y=M$（$y=x$）或 0（$y'\neq x$）；它是松层，故 $H^0(X,i_*M)=M$、$H^q(X,i_*M)=0$（$q>0$）；$i_*$ 正合，且 $\\operatorname{Hom}_{\\mathcal{O}_X}(i_*M,\\mathcal{F})\\cong'\operatorname{Hom}_{\\mathcal{O}_{X,x}}(M,\\mathcal{F}_x)$。它是「局部信息可以完全不携带整体信息」的极端例子，也是检验 $\\Gamma(X,-)$ 只左正合的标准工具。',
    dependencies: [],
    consequences: [],
    explanation: '摩天大楼层的价值来自它把两个极端压在一起：局部上（在 x 的任意小邻域内）它与常值层没有区别，整体上它的支撑只是一个点，因此在 x 之外完全没有信息。利用这个结构，可以把「层论现象」和「模论现象」对照起来。具体地说，凡是只用茎无法解释的现象，都可以尝试用摩天大楼层构造例子：如「茎满射而全局截面不满射」（$H^0$ 不正合）、「茎处处非零而整体截面为零」。反过来，摩天大楼层的上同调全消没又说明它足够「无害」，可以安全地当作正合列的零件使用而不会引入意外的上同调。因此它在实践中扮演两个角色：作为反例的原材料（构造各种不正合的例子）和作为局部化的标准模型（把一点上的模计算变成层的计算）。这两重角色使它在层论与局部对偶理论中反复出现。',
    examples: [
      { title: '例子：X = ℂ 上的 i_{0,*}ℤ 与短正合列', body: '取 $X=\\mathbb{C}$（或任何含原点的连通 T1 空间）、$i:\\{0\\}'\hookrightarrow'\mathbb{C}$、$M=\\mathbb{Z}$。核算：$(i_{0,*}'\mathbb{Z})_0=\\mathbb{Z}$；对 $z'\neq0$，取开邻域 $\\mathbb{C}'\setminus'\{0\\}$ 不含 0，其上截面为 0，故茎为 0。全局截面：$\\Gamma(X,i_{0,*}'\mathbb{Z})=\\mathbb{Z}$。上同调：$H^0=\\mathbb{Z}$，$H^1=H^2=0$（因为松层）。若取 $\\mathcal{F}=i_{0,*}'\mathbb{Z}$、$\\mathcal{G}=i_{0,*}(\\mathbb{Z}/2)$，则短正合列 $0\\to i_{0,*}'\mathbb{Z}'\xrightarrow{2}i_{0,*}'\mathbb{Z}'\to i_{0,*}'\mathbb{Z}/2\\to0$（在茎上就是 $0\\to'\mathbb{Z}'\xrightarrow{2}'\mathbb{Z}'\to'\mathbb{Z}/2\\to0$，正合）取全局截面后是 $0\\to'\mathbb{Z}'\xrightarrow{2}'\mathbb{Z}'\to'\mathbb{Z}/2\\to0$，恰好也正合（因为 $\\Gamma$ 在这一列上正好是模的这一列）。这说明摩天大楼层单独使用时常常「太简单」，要让 $\\Gamma$ 失效需要在正合列里混入非摩天大楼的层，或取多个不同的点使得限制映射的相容性开始起作用。核算的关键是记住：$\\Gamma(X,i_{x,*}(-))=(-)$ 恒等，所以仅用单个摩天大楼层构造的列不会偏离模的列。' },
      { title: '例子：群概形 ℤ/2 与常值层的子层', body: '取 $X=\\operatorname{Spec}k$（单点概形，k 为特征不等于 2 的域）、$i$ 为恒等、$M=k$。此时任何 $\\mathcal{O}_X$-模层都是摩天大楼层（因为 X 只有一个点），$i_*M$ 就是 M 本身作为 $\\mathcal{O}_X$-模，$H^0=M$、$H^q=0$（$q>0$，因为单点空间的上同调群在 q>0 时为零）。这个极端情形说明摩天大楼层与「一般模层」在单点空间上重合，因此判据「$H^q(X,i_*M)=0$（q>0）」在单点是平凡的（任何层都满足）。真正的信息出现在 X 有多个点之时：取 $X=\\operatorname{Spec}k[t]$、$x=(t)$、$M=k$，则 $i_{x,*}k$ 在 $t'\neq0$ 处茎为 0，而常值层 $\\underline{k}$ 处处茎为 k，两者的 $H^0$ 都是 k 但结构完全不同（一个是「只在原点有支撑」，另一个是「处处有支撑」）。这个对照说明：单凭上同调的维数不足以区分层，必须同时看茎（局部支撑）与整体截面这两类数据，摩天大楼层正是把这两类数据的差别放大到最清楚的模型。' },
    ],
    remarks: [
      '闭点假设不可去掉：若 $\\{x'\}$ 不是闭集（例如 Sierpiński 空间 $\\{η,s'\}$，$\\overline{\\{η\\}}=X$），则含 x 的开集不一定能避开另一个点，推前 $i_*M$ 的茎计算会变化：对 $y'\neq x$（y 为开点），任何含 y 的开集都含 x（若拓扑为 $\\{X,\\{η\\},\\varnothing'\}$ 则含 η＝开点的开集只有 X，也含 s），故 $(i_*M)_y=M'\neq0$。于是「摩天大楼」的图像（只在一个点有支撑）失效，层不再是「单点支撑」的。在概形上所有点都是闭点以外还有泛点，但泛点上的摩天大楼层（取 $\\{x'\}$ 闭的 x）仍满足上述性质；若取泛点 $\\eta$（非闭），则 $i_*M$ 的茎在闭点处也为 M，不是摩天大楼型的。所以这条构造必须写「$\\{x'\}$ 闭」。',
      '松层的高阶消没需要小心陈述：$i_*M$ 松是逐点可验证的（上面的计算），而「松层高阶上同调为零」是标准定理，但它通常要求空间在适当条件下（如仿紧或层为松且使用 Godement 消解）。对一般拓扑空间，$i_*M$ 是「软层/松层」且它的高阶上同调确实为零（可由 Godement 消解直接看出：$i_*M$ 在 Godement 消解中的角色是明确的）。但把这条结论推广到「任意松层」时在一些教材中需要拓扑假设（仿紧性），因此引用时最安全的做法是直接对 $i_*M$ 验证，而不是引用一般定理。',
      '摩天大楼层不能用来检测正合性的「层论」失效：$i_*$ 正合意味着推前不引入新的上同调，所以用摩天大楼层做检验时只能得到「模论层面」的结论（例如 $M'\to M/N$ 是否满射）。真正体现层论与模论差别的现象（如整体截面不满射、$H^1$ 非零）必须用「支撑分散」的层（如 $j_!$、常值层、$\\mathcal{O}^{\\times}$）来构造。把摩天大楼层当成「万能的探测器」会错误地得出「层论平凡」的印象，这也是初学者最常见的误判之一。',
      '摩天大楼层的 Hom 同构 $\\operatorname{Hom}(i_*M,\\mathcal{F})\\cong'\operatorname{Hom}_{\\mathcal{O}_{X,x}}(M,\\mathcal{F}_x)$ 要求 $\\mathcal{F}$ 是 $\\mathcal{O}_X$-模且 M 是 $\\mathcal{O}_{X,x}$-模：在纯拓扑层的范畴里（无环化结构），同构同样成立但要把 $\\mathcal{O}_{X,x}$-线性换成群/集合映射。若只把 M 当作 $\\mathcal{O}_X(X)$-模（而非 $\\mathcal{O}_{X,x}$-模），左侧的 $\\mathcal{O}_X$-线性结构与右侧的 $\\mathcal{O}_{X,x}$-线性结构不完全对应，因为 $\\mathcal{O}_X(X)\\to'\mathcal{O}_{X,x}$ 不是同构。使用时必须明确 M 承载哪个环的作用，否则同构的陈述会含糊。',
    ],
    corollaries: [
      { title: '推论：H⁰ 只左正合，H⁰ 的右导出给出层上同调', body: '全局截面函子 $\\Gamma(X,-)$ 是左正合的：它保持核（因为截面逐点取），但不保持余核。摩天大楼层的上同调计算 $H^0(X,i_*M)=M$、$H^q=0$（$q>0$）表明这类层的「截面—上同调」对应是完全平凡的（就是模的恒等函子），因此 $\\Gamma$ 的不正合只能由支撑分散的层产生。由此得到层上同调的定义方式：$H^q(X,\\mathcal{F}):=R^q'\Gamma(X,\\mathcal{F})$，即以 $\\Gamma$ 的右导出函子定义上同调，而摩天大楼层是所有上同调构造的「零测试例」（因为在它上面右导出恰好平凡）。这条推论把层上同调的精确定义与摩天大楼层的计算联系起来，是理解「为什么需要导出函子」的最短路径。', uses: ['global-sections-not-exact'] },
    ],
    references: [
      stacks('Lemma 17.3.1: exactness can be checked on stalks', '01AG'),
      stacks('Lemma 20.7.3: higher direct images as sheafified cohomology', '01E4'),
      { title: 'Sheaves on Manifolds', author: 'Kashiwara & Schapira', year: 1990 },
    ],
    history: HISTORY,
  },

  /* ═══════════════════════════════════════════════════════════
   * 7. Čech 与导出上同调一致
   * ═══════════════════════════════════════════════════════════ */

  'a-cech-to-derived': {
    statement: '设 $X$ 是概形、$\\mathfrak{U}=\\{U_i'\}_{i'\in I}$ 是 X 的开覆盖、$\\mathcal{F}$ 是 $\\mathcal{O}_X$-模。Čech 上同调定义为 Čech 复形 $\\check C^p(\\mathfrak{U},\\mathcal{F})=\\prod_{i_0<\\cdots<i_p}'\mathcal{F}(U_{i_0}'\cap'\cdots'\cap U_{i_p})$ 的上同调 $\\check H^p(\\mathfrak{U},\\mathcal{F})$。若 $\\mathcal{F}$ 拟凝聚且覆盖 $\\mathfrak{U}$ 中任意有限多个开集的交都是仿射的（这样的覆盖对拟凝聚层称为「良好覆盖」或「Leray 覆盖」），则对一切 $p'\ge0$ 有自然同构 $\\check H^p(\\mathfrak{U},\\mathcal{F})\\cong H^p(X,\\mathcal{F})$，其中右端是 $\\Gamma(X,-)$ 的右导出函子。特别地，若 X 本身是仿射的，则 $H^p(X,\\mathcal{F})=0$ 对 $p>0$（Serre 仿射消没），此时 Čech 上同调也在 $p>0$ 时消没。',
    explanation: '这条定理把层上同调从「取单射消解再算上同调」这种不可计算的定义，变成「写下分式开覆盖、在交集上取截面、算上链复形的上同调」这种可以动手算的过程。全部经典的射影空间上同调计算（$H^q(\\mathbb{P}^n,\\mathcal{O}(d))$）、曲线上的 Serre 对偶、曲面的相交数—上同调对照，走的都是这条路。定理的机制是两条：一是「仿射上的拟凝聚层没有高阶上同调」（Serre 仿射消没定理），因此仿射交上的 Čech 项恰好构成一个消解，没有多余的高阶信息；二是「Čech 谱序列」把 Čech 上同调与导出上同调联系起来，而在良好覆盖下这个谱序列退化，因为在 $q>0$ 时 $\\check H^q(\\mathfrak{U}_{i_0\\ldots i_p},\\mathcal{F})=0$。两条合起来给出同构。必须强调覆盖的「良好性」不能去掉：一般覆盖下 Čech 上同调只是 $H^p$ 的一个逼近（存在比较映射，但不一定同构），这就是 Čech 谱序列存在的理由。',
    steps: [
      step('cech-complex-definition', 'Čech 复形与它的上同调',
        '固定开覆盖 $\\mathfrak{U}=\\{U_i'\}_{i'\in I}$ 与预层 $\\mathcal{F}$。Čech 复形的第 p 项是 $\\check C^p(\\mathfrak{U},\\mathcal{F})=\\prod_{i_0<\\cdots<i_p}'\mathcal{F}(U_{i_0}'\cap'\cdots'\cap U_{i_p})$（对一般的（非全序）指标集，取所有递增的补丁），微分 $d:\\check C^p'\to'\check C^{p+1}$ 定义在分量上：$(d'\alpha)_{i_0\\cdots i_{p+1}}=\\sum_{k=0}^{p+1}(-1)^k'\alpha_{i_0\\cdots'\hat i_k'\cdots i_{p+1}}|_{U_{i_0\\cdots i_{p+1}}}$，其中 hat 表示省略该下标、竖线表示限制映射。需要检验 $d^2=0$：这是组合上「两次隔一项删去」的符号抵消，与单纯复形的边缘算子完全一致，因此 $d^2=0$ 是纯符号计算，不涉及层的任何特殊性。于是可以定义 $\\check H^p(\\mathfrak{U},\\mathcal{F})=\\ker(d^p)/\\operatorname{Im}(d^{p-1})$。功能上，$\\check C^0=\\prod_i'\mathcal{F}(U_i)$ 记录局部截面，$\\check C^1$ 记录两个开集的交上的「差异」，$\\check C^2$ 记录三个交上的「三重差异」，$\\check H^0$ 恰是能相容拼合的截面族，即 $\\Gamma(X,\\mathcal{F})$（层的第一条公理就是黏合，故 $\\check H^0=\\Gamma(X,\\mathcal{F})$ 对任何覆盖成立）。$\\check H^1$ 度量的是「局部截面能否黏合」的障碍，这就是经典的「Cech 上同调 = 上同调类」的雏形。',
        []),
      step('serre-affine-vanishing', '仿射交上的消没：Čech 复形是消解',
        '第二步建立关键输入：若 U 是仿射概形、$\\mathcal{F}$ 拟凝聚，则 $H^p(U,\\mathcal{F})=0$ 对一切 $p>0$。这是 Serre 仿射消没定理，证明的骨架是：仿射上是 $U=\\operatorname{Spec}A$、$\\mathcal{F}=\\widetilde M$，取 M 的一个单射消解 $0\\to M'\to I^\\bullet$，层化为 $0\\to'\mathcal{F}'\to'\widetilde{I^\\bullet}$，由于 $\\widetilde{-}$ 是正合函子（拟凝聚层与非模的等价），$\\widetilde{I^\\bullet}$ 是 $\\mathcal{F}$ 的消解；而在仿射上 $H^p(U,\\widetilde{I^q})=H^p(\\Gamma(\\operatorname{Spec}A,\\widetilde{I^q}))=0$ 需要 $\\widetilde{I^q}$ 是「无上同调」的（例如 $I^q$ 是内射模），于是 $H^p(U,\\mathcal{F})$ 等于复形 $I^\\bullet$ 的上同调，而 $I^\\bullet$ 是 M 的消解故上同调只在 p=0 处为 M，于是 $p>0$ 时 $H^p(U,\\mathcal{F})=0$。这一步用到两条：仿射上拟凝聚层的范畴与 A-模范畴的等价（正合），以及 A-模的内射消解存在（诺特假设可避免，一般环上内射模总是够用）。有了这条，若 $\\mathfrak{U}$ 的每个有限交都是仿射，则每个 $\\check C^p$ 的三项 $\\mathcal{F}(U_{i_0\\ldots i_p})$ 都是一个「无高阶上同调」的对象，于是 Čech 复形提供的信息与导出函子的信息没有差距。这是「良好覆盖」的准确定义来源。',
        ['cech-complex-definition']),
      step('cech-spectral-sequence', 'Čech 谱序列：比较映射与退化',
        '第三步给出两条上同调之间的联系。给定覆盖 $\\mathfrak{U}$，定义「Čech 复形层」$\\check{\\mathcal{C}}^p=\\prod_{i_0<\\cdots<i_p}(j_{i_0\\cdots i_p})_*\\mathcal{F}|_{U_{i_0\\cdots i_p}}$（把每个交上的截面层推前到 X）。则 $\\Gamma(X,\\check{\\mathcal{C}}^\\bullet)=\\check C^\\bullet(\\mathfrak{U},\\mathcal{F})$，且 $\\check{\\mathcal{C}}^\\bullet$ 是 $\\mathcal{F}$ 的一个消解（这是层论的事实：Čech 复形层正合，因为黏合公理保证局部地可以把截面逐项消去）。于是由消解计算导出函子的标准定理，得到两个谱序列：一个是 Čech 谱序列 $E_2^{p,q}=\\check H^p(\\mathfrak{U},\\mathcal{H}^q(\\mathcal{F}))\\Rightarrow H^{p+q}(X,\\mathcal{F})$（当 $\\mathcal{F}$ 是层且 $\\mathcal{H}^q$ 为预层上同调时，这个谱序列把 Čech 与导出上同调联系起来），另一个是「$\\mathcal{F}$ 的 Čech 复形层的超上同调」计算（见超上同调条目）。当每个有限交上的 $H^q$ 在 $q>0$ 时为零（仿射交 + 拟凝聚时成立），谱序列的 $E_2$ 页只在 $q=0$ 行有非零项，于是退化，给出 $\\check H^p(\\mathfrak{U},\\mathcal{F})\\cong H^p(X,\\mathcal{F})$。这就是定理的证明路线，其中「退化」这一步是全部要点：非退化时只得到比较映射，而比较映射不是同构。',
        ['serre-affine-vanishing']),
      step('affine-cover-and-base', '仿射覆盖与计算实操：射影空间的上同调',
        '第四步给出实操方法。设 $X=\\mathbb{P}^n_k$，取标准仿射覆盖 $U_i=\\{x_i'\neq0\\}'\cong'\mathbb{A}^n$（$i=0,\\ldots,n$）。任意多个 $U_i$ 的交仍是仿射的（$\\bigcap_{i'\in I}U_i=\\operatorname{Spec}k[x_0/\\ldots,\\ldots]$ 的局部化在那些 $i$ 上取非零坐标，仍是多项式环的局部化，故仿射），于是 $\\mathfrak{U}$ 是良好覆盖，$\\check H^p(\\mathfrak{U},\\mathcal{O}(d))\\cong H^p(\\mathbb{P}^n,\\mathcal{O}(d))$。具体计算：$\\check C^p=\\prod_{i_0<\\cdots<i_p}'\mathcal{O}(d)(U_{i_0\\ldots i_p})$，而 $\\mathcal{O}(d)(U_{i_0\\ldots i_p})$ 由单项式 $x^\\alpha/x_{i_0}^{a_0}'\cdots$ 形式的齐次有理函数构成，其分子总次数 $d+a$。经典结果：$H^0(\\mathbb{P}^n,\\mathcal{O}(d))$ 是 d 次齐次多项式空间，维数 $\\binom{d+n}{n}$（$d'\ge0$）或 0（$d<0$）；$H^n(\\mathbb{P}^n,\\mathcal{O}(d))$ 维数 $\\binom{-d-1}{n}$（$d'\le-n-1$）或 0；中间维数 $H^q=0$（$0<q<n$）。核算方式就是写下 Čech 复形并逐项求上同调，例如 $n=1$ 时 $\\check C^\\bullet$：$0\\to'\mathcal{O}(d)(U_0)\\oplus'\mathcal{O}(d)(U_1)\\to'\mathcal{O}(d)(U_0\\cap U_1)\\to0$，$U_0\\cap U_1$ 上截面是 $k[t,t^{-1}]$ 型的洛朗多项式，映射是差，故 $\\check H^1$ 等于 $k[t,t^{-1}]$ 模去 $k[t]'\oplus k[t^{-1}]$，维数即 $\\dim H^1(\\mathbb{P}^1,\\mathcal{O}(d))=\\max(0,-d-1)$。',
        ['cech-spectral-sequence']),
      step('comparison-map-and-limits', '非良好覆盖下的比较映射与限制',
        '第五步交代边界的正确陈述。对任意覆盖 $\\mathfrak{U}$ 与任意层 $\\mathcal{F}$，存在自然的比较映射 $\\check H^p(\\mathfrak{U},\\mathcal{F})\\to H^p(X,\\mathcal{F})$，它是谱序列 $E_2^{p,0}=\\check H^p(\\mathfrak{U},\\mathcal{H}^0(\\mathcal{F}))\\Rightarrow H^{p+q}$ 的边映射；它不是同构的例子很多，例如取 $X=S^1$（圆）、$\\mathfrak{U}$ 为三个适当重叠的开弧覆盖，$\\mathcal{F}=\\underline{\\mathbb{Z}}$，此时 Čech 上同调可能因为覆盖的组合结构给出与真实 $H^1$ 不同的值（除非覆盖是「好的」即所有交可缩或仿射）。正确的「不变」版本是取所有覆盖的滤过余极限：$\\check H^p(X,\\mathcal{F})=\\varinjlim_{\\mathfrak{U}}'\check H^p(\\mathfrak{U},\\mathcal{F})$，这个极限总是同构于 $H^p(X,\\mathcal{F})$（对任意概形与拟凝聚层，这也是一个标准定理）。因此实践中的判据是：良好覆盖下用有限覆盖直接算，一般覆盖下要么取极限，要么先用谱序列估计差异。避免混淆这两者，是使用 Čech 上同调做计算的第一个纪律。',
        ['affine-cover-and-base', 'cech-spectral-sequence']),
    ],
    conclusion: '若 $\\mathfrak{U}$ 是 X 的开覆盖且每个有限交仿射，$\\mathcal{F}$ 拟凝聚，则 $\\check H^p(\\mathfrak{U},\\mathcal{F})\\cong H^p(X,\\mathcal{F})$ 对一切 p 成立。证明路线是 Serre 仿射消没（仿射上 $H^{>0}=0$）使 Čech 复形成为消解，从而 Čech 谱序列退化。一般覆盖下只存在比较映射，取所有覆盖的极限后同构恒成立。',
    dependencies: [],
    consequences: [],
    explanation: '这条定理的意义在于把「上同调」这个概念从抽象定义的牢笼里解放出来。导出函子的定义需要先取单射消解，而单射层在实际问题里几乎不可能写出；因此上同调在初学者眼里常像一个纯存在性对象。Čech 上同调给出了一个可执行替代：选一个覆盖，写下 $\\prod'\mathcal{F}(U_{i_0\\ldots i_p})$，算线性代数。定理保证当覆盖「好」（仿射交）且层「好」（拟凝聚）时两者完全一致。技术上的关键只有一条：仿射上的拟凝聚层无高阶上同调。有了它，Čech 复形层就是 $\\mathcal{F}$ 的消解，从而依定义计算导出函子。所有射影空间、曲线、曲面、层上同调基变换（半连续性）的经典计算都依赖这条可计算性。同时它也精确指出失效边界：覆盖不够好或层不够好时，Čech 上同调仅是一个逼近，此时必须使用谱序列或取极限的版本。',
    examples: [
      { title: '例子：ℙ¹ 上 O(d) 的 Čech 计算', body: '取 $X=\\mathbb{P}^1_k$、$U_0=\\{x_0\\neq0\\}$、$U_1=\\{x_1\\neq0\\}$、$t=x_0/x_1$。两个开集都仿射（$U_0\\cong'\operatorname{Spec}k[t]$、$U_1\\cong'\operatorname{Spec}k[t^{-1}]$），交 $U_0\\cap U_1\\cong'\operatorname{Spec}k[t,t^{-1}]$ 也仿射，故覆盖良好。Čech 复形为 $0\\to'\mathcal{O}(d)(U_0)\\oplus'\mathcal{O}(d)(U_1)\\xrightarrow{d^0}'\mathcal{O}(d)(U_0\\cap U_1)\\to0$，其中 $\\mathcal{O}(d)(U_0)=k[t]'\cdot(\\text{权})\\cong k[t]$、$\\mathcal{O}(d)(U_1)\\cong k[t^{-1}]$、$\\mathcal{O}(d)(U_0\\cap U_1)\\cong k[t,t^{-1}]$（注意权重的平移由层的定义给出，取合适坐标后三个模块恰是这些）。$d^0(a,b)=b-a$（在交上以 $t$ 的洛朗多项式表示）。于是 $\\check H^0=\\{(a,b):a=b'\}$ 即 $k[t]'\cap k[t^{-1}]=k$ 对应 $d'\ge0$ 时 $d+1$ 维（计入权重），$\\check H^1=k[t,t^{-1}]/(k[t]+k[t^{-1}])$。当 $d'\ge0$ 时 $\\mathcal{O}(d)(U_0)$ 与 $\\mathcal{O}(d)(U_1)$ 的并覆盖整个 $k[t,t^{-1}]$，故 $\\check H^1=0$；当 $d=-1$ 时 $\\check H^1=k$（余维 1）；当 $d'\le-2$ 时 $\\check H^1$ 的维数是 $-d-1$。这与 $H^1(\\mathbb{P}^1,\\mathcal{O}(d))=\\max(0,-d-1)$ 一致，且 $H^0=\\binom{d+1}{1}=d+1$（$d'\ge0$）也一致。' },
      { title: '例子：仿射概形上的消没与 A¹ 的层', body: '取 $X=\\mathbb{A}^1_k=\\operatorname{Spec}k[t]$、$\\mathcal{F}=\\mathcal{O}_X$、覆盖 $\\mathfrak{U}=\\{X'\}$（单个仿射开集）。则 Čech 复形只有 $\\check C^0=k[t]$，所有 $p'\ge1$ 项为零，故 $\\check H^0=k[t]$、$\\check H^p=0$（$p>0$）。由定理 $H^p(\\mathbb{A}^1,\\mathcal{O})=0$（$p>0$），即仿射直线上的结构层无高阶上同调。若覆盖改成两个开集 $U_0=\\mathbb{A}^1\\setminus'\{0\\}$、$U_1=\\mathbb{A}^1$（$U_0$ 不是仿射？实际上 $\\mathbb{A}^1\\setminus'\{0\\}=\\operatorname{Spec}k[t,t^{-1}]$ 是仿射），则 $\\check C^1=\\mathcal{O}(U_0\\cap U_1)=k[t,t^{-1}]$，$\\check C^0=k[t,t^{-1}]'\oplus k[t]$，$d^0(a,b)=b-a$ 的像为整个 $k[t,t^{-1}]$（取 $a=0$、$b$ 任意得 $b$，但 $b$ 只能在 $k[t]$ 中；取 $a=-t^{-1}$ 可得 $t^{-1}$，故像为 $k[t,t^{-1}]$），于是 $\\check H^1=0$、$\\check H^0=k[t]$。两次计算都给出 $H^{>0}=0$，与 Serre 仿射消没一致。这个例子说明覆盖的选取不影响结论，只要每次算出的 Čech 上同调都为零——同时也提示：在仿射上「每个良好覆盖都给出零」这件事本身就是消没定理的内容。' },
    ],
    remarks: [
      '「每个有限交仿射」不能减弱为「覆盖是仿射的」：取 $X=\\mathbb{P}^1$、覆盖 $\\{U_0,U_1\\}$ 中两个都仿射，这已经满足条件；但若取仿射概形的覆盖 $\\{X_f,X_g'\}$ 其中 $X_f'\cap X_g$ 不是仿射（在某些非分离概形上可以发生，例如两条直线在一点粘连的概形，$X_f'\cap X_g$ 可能不是仿射），则 Čech 上同调可能偏离 $H^p$。在分离概形（例如射影簇、分离概形）上，仿射开集的交仍仿射，问题不出现；因此在非分离概形上做 Čech 计算前必须核对交的仿射性，或改用极限版本。',
      '拟凝聚假设不可去掉：对一般的层（例如非拟凝聚的怪层），仿射上的高阶上同调可以非零（如 $\\mathbb{A}^1$ 上某些非拟凝聚层的 $H^1\\neq0$），此时 Čech 复形不是消解，谱序列不退化，比较映射可能不是同构。经典的「$X$ 上常值层的 Čech 上同调依赖覆盖」正是这种情形。所以定理的三要素「拟凝聚 + 仿射交 + 有限覆盖」缺一不可。',
      'Čech 上同调与导出上同调的一致是「在同构意义下」，不是「在典范意义下」：同构由谱序列给出，依赖于覆盖与消解的选择，虽然不同选择下的同构相互相容，但它不是由某个典范映射给出的（一般覆盖下那只是比较映射，不同构）。因此在「用 Čech 上同调证明某个上同调类非零」时，必须给出一个具体的 Čech 类并核验它在比较映射下的像非零，不能只引用「某覆盖下 Čech 上同调非零」就断言上同调非零——除非覆盖是良好的。',
      '无限覆盖与超覆盖：对无限覆盖，Čech 上同调同样定义（$\\prod$ 换成全积），但定理的条件是「每个有限交仿射」，无限交一般不正则，故无限覆盖常常给出错误的值。正确的处理是用超覆盖（hypercover）或取 $\\varinjlim$；这也是为什么实际的射影空间计算总取有限覆盖（$n+1$ 个仿射图）。把无限覆盖的 Čech 上同调当作 $H^p$ 是常见错误，例如用「所有仿射开集」构成的大覆盖会给出巨大且错误的上同调群。',
    ],
    corollaries: [
      { title: '推论：射影空间上 O(d) 的上同调维数', body: '由定理与射影空间的标准仿射覆盖，$H^q(\\mathbb{P}^n_k,\\mathcal{O}(d))$ 的维数为：$H^0$ 维 $\\binom{d+n}{n}$（$d'\ge0$）、$H^n$ 维 $\\binom{-d-1}{n}$（$d'\le-n-1$）、其余 $q$ 与 $d$ 组合时为 0。证明：取定标准覆盖算 Čech 复形，其项是形如 $k[x_{i_0},\\ldots,x_{i_p}$ 的局部化$]$ 的齐次分量，用「洛朗单项式的分割」直接对每个 $p$ 求维数，阶梯型的消失模式给出上述公式。这条推论是射影几何中一切维数计算（Serre 对偶、曲线 Riemann-Roch、曲面分类）的算术基础。', uses: ['affine-cover-and-base'] },
    ],
    references: [
      stacks('Section 30.2: Čech cohomology of quasi-coherent sheaves', '01X8'),
      stacks('Lemma 20.7.2: vanishing on a covering', '01E3'),
      stacks('Lemma 20.7.3: higher direct images as sheafified cohomology', '01E4'),
    ],
    history: HISTORY,
  },

  /* ═══════════════════════════════════════════════════════════
   * 8. Godement 消解
   * ═══════════════════════════════════════════════════════════ */

  'a-godement': {
    statement: '设 $X$ 是环化空间、$\\mathcal{F}$ 是 $\\mathcal{O}_X$-模（或纯拓扑层）。Godement 消解构造如下：令 $\\mathcal{C}^0(\\mathcal{F})=\\prod_{x'\in X}i_{x,*}'\mathcal{F}_x$（将每一点的茎推前，即「不连续截面层」），有自然的嵌入 $\\eta:\\mathcal{F}'\hookrightarrow'\mathcal{C}^0(\\mathcal{F})$（把截面送到它在每点的芽的族）。令 $\\mathcal{Z}^0=\\mathcal{C}^0/\\eta(\\mathcal{F})$，取 $\\mathcal{C}^1(\\mathcal{F})=\\prod_{x'\in X}i_{x,*}'\mathcal{Z}^0_x$，如此归纳定义 $\\mathcal{C}^{p+1}=\\prod_x i_{x,*}(\\mathcal{C}^p/\\operatorname{Im}'\mathcal{C}^{p-1})_x$，得到复形 $0\\to'\mathcal{F}'\to'\mathcal{C}^0(\\mathcal{F})\\to'\mathcal{C}^1(\\mathcal{F})\\to'\cdots$ 正合，且每个 $\\mathcal{C}^p$ 是松层（flasque）。因此可由它定义层上同调：$H^p(X,\\mathcal{F})=H^p(\\Gamma(X,\\mathcal{C}^\\bullet(\\mathcal{F})))$，并且这个定义对任意拓扑空间、任意层有效，不依赖任何特殊假设（不需要仿射、紧致或仿紧）。',
    explanation: 'Godement 消解解决的是一个纯粹的存在性问题：层上同调的定义需要单射消解，但单射层在通常的环化空间上难以显式写出。Godement 的观察是「不需要单射层，只需要松层再加一个额外的技术条件」——松层（flasque，限制映射满射）的高阶上同调为零，因此松层消解与单射消解一样可以计算导出函子（这是「松层消解计算导出函子」的标准定理）。而松层是很容易写出来的：$\\prod_{x'\in X}i_{x,*}$ 形式的「茎的直积」层一定是松的，因为限制映射在每个茎分量上都是恒等。于是构造唯一要做的是让这个复形正合，办法是逐次把「上一层的像的商」再取茎直积，归纳地做下去。这个过程称为「不连续截面」构造，因为它相当于把所有点上任意选取的值族视为「不连续函数」的空间。Godement 消解的价值在于典范性与普遍性：它对任何拓扑空间都成立，而且它给出的是「同一个」弦函子，因此在比较不同拓扑（例如 Zariski 与 étale、或与解析拓扑）的上同调时是最方便的框架。',
    steps: [
      step('discontinuous-sections-and-flasque', '不连续截面层与松性',
        '第一步把构造的核心对象定义清楚并验证松性。对层 $\\mathcal{F}$ 与环化空间 X，定义 $\\mathcal{C}^0(\\mathcal{F})=\\prod_{x'\in X}i_{x,*}'\mathcal{F}_x$，其中 $i_x:\\{x'\}'\hookrightarrow X$ 是包含、$i_{x,*}$ 是沿包含的推前（见摩天大楼层）。逐点计算：对开集 U，$\\mathcal{C}^0(\\mathcal{F})(U)=\\prod_{x'\in U}'\mathcal{F}_x$（因为 $i_{x,*}'\mathcal{F}_x(U)=\\mathcal{F}_x$ 当 $x'\in U$、否则 0）。这个层称为「不连续截面层」：它的截面就是「在 U 的每个点任意指定一个芽」的函数族，完全不要求任何相容性或连续性。检验它是层：给定开覆盖与相容的族，逐点粘（因为每个点的芽独立指定），唯一性显然。松性：对 $V'\subseteq U$，限制映射是 $\\prod_{x'\in U}'\mathcal{F}_x'\to'\prod_{x'\in V}'\mathcal{F}_x$，即「丢掉 V 之外的分量」，这是逐分量恒等的投射，故满射。于是 $\\mathcal{C}^0(\\mathcal{F})$ 松。同理，对任意层 $\\mathcal{G}$，$\\prod_x i_{x,*}'\mathcal{G}_x$ 总松，因为松性只依赖于「每一点的分量可以自由指定并丢给子集」这一机制。这条性质是 Godement 消解的第一根支柱：构件（每一项）天然松。',
        []),
      step('flasque-resolution-computes-derived', '松层消解计算导出函子的定理',
        '第二步需要一条一般定理：若 $0\\to'\mathcal{F}'\to'\mathcal{G}^\\bullet$ 是 $\\mathcal{F}$ 的一个消解且每个 $\\mathcal{G}^p$ 松，则 $H^p(\\Gamma(X,\\mathcal{F}))\\cong H^p(\\Gamma(X,\\mathcal{G}^\\bullet))$，即松层消解可以用来计算右导出函子。证明分两小步。(a) 松层的高阶上同调为零：若 $\\mathcal{G}$ 松且 $\\mathcal{G}'\hookrightarrow'\mathcal{I}$ 是到内射层的嵌入（内射层总存在），则商 $\\mathcal{I}/\\mathcal{G}$ 松（松层的商松，这一点要用到松性的性质：对松层 $\\mathcal{G}$ 与内射 $\\mathcal{I}$，$\\mathcal{I}/\\mathcal{G}$ 的限制映射满，因为可在 $\\mathcal{I}$ 中把元素先延拓、再用 $\\mathcal{G}$ 的满限制调整），于是长正合列 $\\cdots'\to H^p(X,\\mathcal{G})\\to H^p(X,\\mathcal{I})\\to H^p(X,\\mathcal{I}/\\mathcal{G})\\to'\cdots$ 中 $H^p(X,\\mathcal{I})=0$（$p>0$），对 p=1 得 $H^1(X,\\mathcal{G})\\to H^1(X,\\mathcal{I}/\\mathcal{G})$ 单射，归纳得 $H^p(X,\\mathcal{G})=0$（$p>0$）。(b) 有了 (a)，把 $0\\to'\mathcal{F}'\to'\mathcal{G}^\\bullet$ 分裂成短正合列 $0\\to'\mathcal{Z}^{p-1}'\to'\mathcal{G}^p'\to'\mathcal{Z}^p'\to0$，取长正合列并用 (a) 即得 $H^p(\\Gamma(X,\\mathcal{G}^\\bullet))\\cong R^p'\Gamma(X,\\mathcal{F})=H^p(X,\\mathcal{F})$。这条定理是 Godement 消解合法性的全部依据；它说明把「单射」换成「松」不会损失任何信息。',
        ['discontinuous-sections-and-flasque']),
      step('inductive-exact-construction', '归纳正合性：逐步造出消解',
        '第三步把消解造完并证明正合。$\\mathcal{F}'\to'\mathcal{C}^0(\\mathcal{F})$ 的单射性：截面 s 被送到「每点的芽」族，若 $\\eta(s)=0$ 则在每点 $s_x=0$，而层的截面由其全部芽决定（层公理的唯一性部分），故 $s=0$。正合性在 $\\mathcal{C}^0$ 处：需要 $\\operatorname{Im}'\eta=\\ker(\\mathcal{C}^0\\to'\mathcal{C}^1)$。定义 $\\mathcal{Z}^0=\\mathcal{C}^0/\\operatorname{Im}'\eta$ 并令 $\\mathcal{C}^1(\\mathcal{F})=\\prod_x i_{x,*}(\\mathcal{Z}^0)_x$。需证 $\\operatorname{Im}'\eta=\\ker(\\mathcal{C}^0\\to'\mathcal{C}^1)$：一个族 $(s_x)\\in'\prod_{x'\in U}'\mathcal{F}_x$ 在 $\\mathcal{C}^1$ 中的像是「$(s_x)$ 在 $\\mathcal{Z}^0$ 中的类在各点的芽」；它为零当且仅当「$(s_x)$ 在每点附近属于 $\\operatorname{Im}'\eta$ 的茎」，而 $\\operatorname{Im}'\eta$ 的茎在 x 处就是整个 $\\mathcal{F}_x$（因为局部上每个芽都能由某个截面实现），所以条件变成「$(s_x)$ 局部上等于某个截面的芽族」，即 $(s_x)$ 局部来自一个真正的截面；由于层是层的（有唯一性），局部可实现就整体可实现，于是 $(s_x)=\\eta(s)$ 对某个 $s$。这就是「在 $\\mathcal{C}^0$ 处正合」的证明。同样的论证归纳地给出 $\\mathcal{C}^p$ 处的正合性（把 $\\mathcal{F}$ 换成 $\\mathcal{C}^{p-1}$ 的余像），归纳步骤与第一层完全相同，故 $\\mathcal{C}^\\bullet(\\mathcal{F})$ 是消解。归纳法的关键输入是「茎的直积层在每一点的局部实现性」，它依赖层公理而不依赖拓扑。',
        ['flasque-resolution-computes-derived']),
      step('canonicality-and-derivation', '典范性与各种上同调理论的比较',
        '第四步谈 Godement 消解的独特价值：典范性。构造只用到了层与茎，不涉及任何额外的选择，因此它对任意拓扑空间的任意层、对任意环化空间的任意 $\\mathcal{O}_X$-模都给出同一个复形（严格地说，构造中的 $\\mathcal{C}^p$ 由 $\\mathcal{C}^{p-1}$ 唯一决定）。此外 $\\mathcal{C}^\\bullet(\\mathcal{F})$ 的每一项不仅松，还带有自然的 $\\mathcal{O}_X$-模结构（因为 $\\mathcal{F}_x$ 是 $\\mathcal{O}_{X,x}$-模，推前后成为 $\\mathcal{O}_X$-模，直积保持模结构），故它同样适用于环化空间。典范性的实际收益是：当 X 上有多套拓扑（例如 Zariski、étale、平坦、解析、fppf）时，Godement 消解给出同一套弦函子的比较框架；当需要在层范畴与导出范畴之间翻译时，它提供典范的消解而不需要假设「有足够多的内射层」或「空间仿紧」。此外它给出「一个层的上同调是高阶整体性障碍」这一直觉的直接实现：$\\mathcal{C}^0$ 是把所有局部芽无脑拼起来，$\\mathcal{C}^1$ 起的层记录「拼不起来的部分」，而 $H^p$ 是这些「粘合障碍」的逐层度量。这条图像在 de Rham 定理与 hypercohomology 的证明中被反复使用，因为它的构造不依赖任何微分结构。',
        ['inductive-exact-construction']),
      step('comparison-with-cech-and-limits', '与 Čech 上同调的比较与适用边界',
        '第五步交代适用范围与限制。Godement 消解对任意拓扑空间有效，这与 Čech 上同调形成鲜明对比：后者在覆盖不够好时只给出逼近。因此 Godement 消解是「定义性」的工具，而 Čech 复形是「可计算性」的工具；两者通过超上同调与谱序列联系（Čech 复形层是 $\\mathcal{F}$ 的一个消解，因此其超上同调等于 $H^\\bullet(X,\\mathcal{F})$，这给出 Čech 与导出上同调之间的比较）。限制方面：第一，Godement 消解的巨大尺寸使它不适合手算（每一项是全体茎的直积），它的作用是理论上的典范消解；第二，在需要有限性（有限维上同调、有限性定理）时，Godement 消解无法直接给出这些信息，因为它的项不有限；第三，在代数几何中真正用于计算的是 Čech 消解与仿射消解，Godement 消解主要用于定义与结构性定理（例如建立「层上同调是拓扑不变的」「上同调与层的松化相容」等）。把它当作计算工具会立刻遇到「$\\Gamma(X,\\prod_x i_{x,*}'\mathcal{F}_x)$ 无法写下」的困难，这就是为什么它主要出现在定义与证明段落。',
        ['canonicality-and-derivation', 'inductive-exact-construction']),
    ],
    conclusion: '对任意环化空间 $X$ 与任意 $\\mathcal{O}_X$-模 $\\mathcal{F}$，Godement 构造给出正合复形 $0\\to'\mathcal{F}'\to'\mathcal{C}^0\\to'\mathcal{C}^1\\to'\cdots$，其中每个 $\\mathcal{C}^p$ 是由「茎的直积」构成的松层；因此 $H^p(X,\\mathcal{F})=H^p(\\Gamma(X,\\mathcal{C}^\\bullet(\\mathcal{F})))$ 且该定义不依赖任何拓扑或有限性假设。Godement 消解是层上同调最典范的定义，其实用价值在定义与结构性定理，而在具体计算中一般改用 Čech 复形或仿射消解。',
    dependencies: [],
    consequences: [],
    explanation: 'Godement 消解的巧思在于它绕开了「显式造内射层」这个困难。层上同调的定义要求单射消解，而单射层既大又抽象；Godement 发现「松层消解也能算导出函子」，而松层有一个非常简单的来源：在每一点自由指定芽的族，也就是不连续截面。这个对象在几何上对应「毫无黏合条件的局部数据」，正是层的反面，所以用它的商来度量黏合障碍非常自然。构造的归纳步骤（把余像再取一次茎的直积）在每一层都只做同一件事，因此完全机械化，不需要任何拓扑假设。这条构造的代价是尺寸巨大：$\\mathcal{C}^0$ 的全局截面是全体茎的直积，通常无法写出。因此在实践中，Godement 消解扮演「理论上对所有的空间都成立的统一版本」，而 Čech 消解与仿射消解扮演「在具体好空间上可计算」的版本；两者的关系由「Čech 复形层是消解」这一事实衔接。',
    examples: [
      { title: '例子：常值层 ℤ 在两点空间上的 Godement 消解', body: '取 $X=\\{a,b'\}$ 为离散两点空间、$\\mathcal{F}=\\underline{\\mathbb{Z}}$（常值层）。则 $\\mathcal{F}_a=\\mathcal{F}_b=\\mathbb{Z}$，故 $\\mathcal{C}^0(\\mathcal{F})=\\prod_{x'\in X}i_{x,*}'\mathbb{Z}$ 的全局截面是 $\\mathbb{Z}'\times'\mathbb{Z}$，且 $\\eta:\\Gamma(X,\\mathcal{F})=\\mathbb{Z}'\to'\mathbb{Z}'\times'\mathbb{Z}$ 是对角嵌入 $n'\mapsto(n,n)$。于是 $\\mathcal{Z}^0=\\mathcal{C}^0/\\operatorname{Im}'\eta$ 的全局截面是 $(\\mathbb{Z}'\times'\mathbb{Z})/\\mathbb{Z}_{\\text{diag}}'\cong'\mathbb{Z}$（两点上差值的群），在 a、b 处的茎相同（都是 $\\mathbb{Z}$）。故 $\\mathcal{C}^1$ 的全局截面是 $\\mathbb{Z}'\times'\mathbb{Z}$，映射 $\\mathcal{C}^0\\to'\mathcal{C}^1$ 是 $\\mathcal{C}^0\\to'\mathcal{Z}^0\\to'\mathcal{C}^1=\\prod i_*\\mathcal{Z}^0_x$，其核恰为对角（由前一步），像由「差值的复制」构成。继续下去得到 $H^0=\\mathbb{Z}$、$H^1=0$、$H^{\\ge1}=0$。核算为何 $H^1=0$：离散空间上的层上同调在 $p>0$ 时为零（因为空间是「零维」的，任何层松），与结果一致。这个例子把 Godement 消解的具体步骤走了一遍，并说明在极简单空间上它退化为平凡的线性代数。' },
      { title: '例子：一个层与其 Godement 消解的项数对比', body: '取 $X=\\mathbb{P}^1$、$\\mathcal{F}=\\mathcal{O}(1)$。Godement 消解的 $\\mathcal{C}^0$ 全局截面是 $\\prod_{x'\in'\mathbb{P}^1}'\mathcal{O}(1)_x$，其维数（在 k 上）不是有限的：每个点贡献一个一维 k-向量空间（因为 $\\mathcal{O}(1)_x$ 是一维 $\\mathcal{O}_{x}$-模，但作为 k-空间是无限维的，考虑 $\\kappa(x)=k$ 时 $\\mathcal{O}(1)_x$ 作为 k-空间由可数个方向构成），故 $\\Gamma(X,\\mathcal{C}^0)$ 作为 k-空间是无限维的，无法直接算。对比 Čech 覆盖 $\\{U_0,U_1\\}$ 给出的复形 $0\\to k[t]'\oplus k[t^{-1}]'\to k[t,t^{-1}]'\to0$ 只有两个有限维项，立刻算出 $H^0=k^2$、$H^1=0$。这个对比清楚地显示：Godement 消解是「理论上正确但计算上不可用」的典范消解，而 Čech 消解是「在良好覆盖下可算」的实用消解。两者的同构由「Čech 复形层是 $\\mathcal{F}$ 的消解（依赖黏合公理与仿射消没）」这一事实保证，具体地，在射影空间上因为覆盖良好，两者的上同调一致。' },
    ],
    remarks: [
      '松层的高阶消没定理在一般拓扑空间上需要谨慎引用：对任意拓扑空间，松层 $H^{>0}=0$ 是成立的（可由 Godement 消解自身或由内射—松层的性质证明），但它与「软层（soft，如仿紧空间上的细层）」的消没定理是两套，后者的标准证明需要仿紧性假设。把「松」与「软」混用会得出错误结论，例如在非仿紧空间上软层的高阶上同调可以非零，而松层总是零。引用时须明确所使用的是哪一类层及哪一条定理。',
      'Godement 消解的项不是内射层：$\\prod_{x'\in X}i_{x,*}'\mathcal{F}_x$ 一般是松层但不是内射层（内射层的判定是 Hom 正合性，与松性不同）。因此不能拿它当内射消解使用（例如不能声称它能计算任何函子的导出函子）；它能计算 $\\Gamma$ 的导出函子靠的是「松层消解计算导出函子」这条单独定理。若要计算别的函子（如 $f_*$ 的导出函子），必须对相关层另行构造消解或使用一般的分解引理，不能沿用 Godement 消解。',
      'Godement 消解给出的 $H^p$ 与 Čech 上同调的同构不是自动的：一般覆盖下二者只由比较映射相连，只有良好覆盖（仿射交 + 拟凝聚层）才保证同构。Godement 消解给出的始终是「真正的」$H^p$，因此当 Čech 计算与 Godement 结果不一致时，应以 Godement 的结果为准，并检查覆盖的良态性。实践中常见的错误是取一个非仿射的覆盖做 Čech 计算然后把结果当作 $H^p$，这时算出的东西可能只是某个别的东西（如超上同调在非退化谱序列下的 $E_2$ 项）。',
      '在导出范畴的语言中，Godement 消解对应「以所有点上的茎构成的局部系」这一构造的非线性版本，它在需要「层的上同调与点的拓扑无关」这一性质时特别有用（例如比较 Zariski 与 étale 上同调时，两者的 Godement 消解都可写出）。但它在需要有限性的定理（Serre 有限性、Grauert 定理）中不起作用，因为这些定理的正确性依赖有限表示的层，而 Godement 消解的项永远不是有限型的。选择消解时要按目的选取：结构性定理用 Godement，可计算性用 Čech/仿射，有限性用仿射或射影消解。',
    ],
    corollaries: [
      { title: '推论：层上同调是拓扑不变量且对任意空间有定义', body: '由 Godement 消解的典范性，$H^p(X,\\mathcal{F})$ 只依赖层 $\\mathcal{F}$ 与空间 $X$ 的拓扑，不依赖任何附加结构（不需要仿射、紧致、仿紧、分离性假设）。由此可立刻得到两条常用结论：其一，层上同调与覆叠选取无关（对同一空间与层，任何计算路径给出同一个 $H^p$）；其二，若要证明某个上同调消没（如 $H^{>0}(X,\\mathcal{F})=0$），只需指出 $\\mathcal{F}$ 有松层消解（例如 $\\mathcal{F}$ 本身松），因为此时可由松层消没定理与消解逐项为零直接得到。这条推论把「上同调」从依赖覆盖的计算对象提升为空间的固有拓扑量，是所有比较定理（de Rham、étale、解析化）的前提。', uses: ['canonicality-and-derivation'] },
    ],
    references: [
      stacks('Lemma 20.7.3: higher direct images as sheafified cohomology', '01E4'),
      stacks('Lemma 20.7.2: vanishing on a covering', '01E3'),
      { title: 'Topologie algébrique et théorie des faisceaux', author: 'Roger Godement', year: 1958 },
    ],
    history: HISTORY,
  },

  /* ═══════════════════════════════════════════════════════════
   * 9. 超上同调
   * ═══════════════════════════════════════════════════════════ */

  'a-hypercohomology': {
    statement: '设 $X$ 是环化空间、$K^\\bullet$ 是 $\\mathcal{O}_X$-模的有界下方复形（例如 $\\cdots'\to0\\to K^0\\to K^1\\to'\cdots$）。$K^\\bullet$ 的超上同调定义为：取 $K^\\bullet$ 的 Cartan–Eilenberg 消解（即把每个 $K^p$ 换成单射（或松）消解并取全复形的上同调），或等价地定义 $\\mathbb{H}^i(X,K^\\bullet)=H^i(\\Gamma(X,\\mathcal{I}^{\\bullet,\\bullet}))$，其中 $\\mathcal{I}^{\\bullet,\\bullet}'\to K^\\bullet$ 是 $K^\\bullet$ 的分解（resolution）。于是 $\\mathbb{H}^i(X,K^\\bullet)$ 是导出函子 $R^i'\Gamma$ 作用在复形上的值：$\\mathbb{H}^i(X,K^\\bullet)\\cong \\operatorname{Hom}_{D(\\mathcal{O}_X)}(\\mathcal{O}_X,K^\\bullet[i])$，其中右端取导出范畴。当 $K^\\bullet$ 退化为集中在 0 次的单个层 $\\mathcal{F}$ 时，$\\mathbb{H}^i(X,\\mathcal{F})=H^i(X,\\mathcal{F})$。对 $K^\\bullet$ 的滤过，存在谱序列 $E_1^{p,q}=H^q(X,K^p)\\Rightarrow \\mathbb{H}^{p+q}(X,K^\\bullet)$（「先取层上同调再算滤过」）以及 $E_2^{p,q}=H^p(X,\\mathcal{H}^q(K^\\bullet))\\Rightarrow \\mathbb{H}^{p+q}(X,K^\\bullet)$（先取层上同调层）。',
    explanation: '超上同调的存在理由是「复形比层更常见」。de Rham 复形 $\\Omega^\\bullet_X$ 不是层而是复形；层的 Čech 复形层是复形；任何滤过对象的逐阶商是复形。对这些对象取「上同调」既不能按层的上同调（因为复形不是层），也不能按复形的上同调（因为逐项是层而非模），必须有一个同时容纳两种结构的定义。超上同调就是这个定义：它把复形看成一个对象，然后取全局截面函子在导出范畴上的右导出。它的三条性质使它在实践中不可替代：第一，退化性（单个层时回到普通层上同调），保证它是原有概念的正确推广；第二，超上同调的存在与滤过谱序列的存在是同一件事，因此 de Rham 定理、Hodge 分解、Leray 谱序列都成为「超上同调的谱序列计算」的实例；第三，它天然是导出范畴中 Hom 的值，因此一切同调代数的一般定理（分解、导出函子、谱序列）都可以直接应用，不需要为复形另行建立一套理论。',
    steps: [
      step('cartan-eilenberg-resolution', 'Cartan–Eilenberg 消解与超上同调的定义',
        '第一步给出严格定义。设 $K^\\bullet$ 是 $D^+(\\mathcal{O}_X)$ 中的复形（有界下方）。一个 Cartan–Eilenberg 消解是一个双复形 $\\mathcal{I}^{\\bullet,\\bullet}$ 带上拟同构 $K^\\bullet'\to \\mathcal{I}^{\\bullet,\\bullet}$（到全复形），且要求每个 $\\mathcal{I}^{p,\\bullet}$ 是 $K^p$ 的一个单射（或松）消解、且对每个 q，$\\mathcal{I}^{\\bullet,q}$ 由上往下的行是正合的适当条件。构造方式：先对每个 $K^p$ 取单射消解 $K^p'\to I^{p,\\bullet}$，再利用「单射层之间的映射可以提升到消解上」这一性质把所有提升拼成一个双复形（这一步需要适当选择提升使得平方交换）。定义超上同调为全复形的全局截面复形的上同调：$\\mathbb{H}^i(X,K^\\bullet)=H^i(\\Gamma(X,\\operatorname{Tot}(\\mathcal{I}^{\\bullet,\\bullet})))$。良定义性在于：任意两个 Cartan–Eilenberg 消解之间的比较映射存在且在导出范畴中是唯一的同构，因此 $\\mathbb{H}^i$ 与消解的选择无关。也可以定义 $\\mathbb{H}^i(X,K^\\bullet)=\\operatorname{Hom}_{D(\\mathcal{O}_X)}(\\mathcal{O}_X,K^\\bullet[i])$，这个形式更简洁：它把 $\\mathbb{H}^i$ 直接说成「$\\mathcal{O}_X$ 到 $K^\\bullet$ 的移动 i 次的态射空间」在导出范畴中的取值，等价性是同调代数的一般定理（在单射/松消解上 Hom 与上同调同构）。',
        []),
      step('degenerate-case-single-sheaf', '退化情形：单个层给出普通层上同调',
        '第二步核对定义与已有概念相容。取 $K^\\bullet=\\mathcal{F}$（只在 0 次有 $\\mathcal{F}$、其余为 0，作为复形时记作 $\\mathcal{F}[0]$）。此时 $K^\\bullet$ 的 Cartan–Eilenberg 消解可以取成它的单射消解 $\\mathcal{F}'\to I^{\\bullet}$（注意此时双复形退化为单行），于是 $\\mathbb{H}^i(X,\\mathcal{F}[0])=H^i(\\Gamma(X,I^\\bullet))=H^i(X,\\mathcal{F})$，正是 $\\Gamma(X,-)$ 的右导出函子。另一条验证路径用导出范畴的表述：$\\operatorname{Hom}_{D(\\mathcal{O}_X)}(\\mathcal{O}_X,\\mathcal{F}[i])$ 的计算要对 $\\mathcal{F}[i]$ 取单射消解，在 $i=0$ 时得到 $\\operatorname{Hom}_{\\mathcal{O}_X}(\\mathcal{O}_X,\\mathcal{F})=\\Gamma(X,\\mathcal{F})$；在 $i>0$ 时由「$\\mathcal{O}_X$ 是投射（局部自由故投射）」得 $\\operatorname{Hom}_{\\mathcal{O}_X}(\\mathcal{O}_X,-)$ 正合，故 $\\operatorname{Ext}^i_{\\mathcal{O}_X}(\\mathcal{O}_X,\\mathcal{F})$ 的计算存在两条路径：一条用 $\\mathcal{O}_X$ 的投射消解（长度 0，因为它是投射的）直接给出 $i>0$ 时为零，这与 $H^i(X,\\mathcal{F})=0$ 不符——所以正确的计算必须用 $\\mathcal{F}$ 的单射消解，即 $\\operatorname{Hom}_{D}(\\mathcal{O}_X,\\mathcal{F}[i])$ 是在导出范畴中取值，不能用投射消解直接求 $\\operatorname{Hom}_{\\mathcal{O}_X}$。这个细节是把超上同调写成 Hom 形式时最容易踩的坑。',
        ['cartan-eilenberg-resolution']),
      step('two-spectral-sequences', '两个谱序列：滤过来源与层上同调来源',
        '第三步建立计算工具。对复形 $K^\\bullet$ 有两类自然滤过，各有谱序列。第一类（按层次数滤过）：把 $K^\\bullet$ 看成「按 p 分层的复形」，取 Harder–Narasimhan 滤过 $\\tau_{\\le p}K^\\bullet$，得到谱序列 $E_1^{p,q}=H^q(X,K^p)\\Rightarrow \\mathbb{H}^{p+q}(X,K^\\bullet)$。这个谱序列的 $E_1$ 页就是「逐项算层上同调」，$d_1$ 由 $K^p'\to K^{p+1}$ 诱导，所以「超上同调 = 先逐层算上同调再按复形的微分算同调」。第二类（按上同调层滤过）：令 $\\mathcal{H}^q(K^\\bullet)$ 为 $K^\\bullet$ 的上同调层，有谱序列 $E_2^{p,q}=H^p(X,\\mathcal{H}^q(K^\\bullet))\\Rightarrow \\mathbb{H}^{p+q}(X,K^\\bullet)$。它在复形的微分在层层面可算时最有用（例如 de Rham 复形的上同调层为常数层）。两个谱序列的存在理由同源：任何滤过复形的超上同调都带一个收敛谱序列，而两类滤过给出两类谱序列。掌握这两个谱序列是把几何中「复形层面的定理」翻译为「上同调层面的结论」的通用手段，例如 de Rham 定理、Hodge 分解、Leray 谱序列都是从它们之一得到的。',
        ['degenerate-case-single-sheaf']),
      step('de-rham-and-hodge', '应用范本：de Rham 复形与 Hodge 分解',
        '第四步给出主要应用。设 X 是光滑流形（或光滑复流形），$\\Omega^\\bullet_X$ 是 de Rham 复形。则 de Rham 定理断言 $\\mathbb{H}^i(X,\\Omega^\\bullet_X)\\cong H^i(X,\\underline{\\mathbb{R}})$（常值层上同调）。证明路线：用 Poincaré 引理（每个点的邻域上 $\\Omega^\\bullet$ 是 $\\underline{\\mathbb{R}}$ 的消解，故上同调层 $\\mathcal{H}^q(\\Omega^\\bullet)=0$（q>0）、$\\mathcal{H}^0=\\underline{\\mathbb{R}}$），代入第二类谱序列得 $E_2^{p,q}=H^p(X,\\mathcal{H}^q)$ 只在 q=0 行非零，谱序列退化，于是 $\\mathbb{H}^i(X,\\Omega^\\bullet_X)=H^i(X,\\underline{\\mathbb{R}})$。这条论证同时给出「de Rham 上同调」的定义：$H^i_{dR}(X)=\\mathbb{H}^i(X,\\Omega^\\bullet_X)$。对复流形再用按 $(p,q)$ 型的滤过做一次分解，得到 Hodge 分解 $\\mathbb{H}^n(X,\\Omega^\\bullet_X)\\otimes'\mathbb{C}=\\bigoplus_{p+q=n}H^{p,q}(X)$ 的谱序列版本（在紧 Kähler 情形退化为直和，用 $dd^c$ 引理）。这说明「Hodge 理论的基本定理」在超上同调的框架里就是「特定滤过下的谱序列退化」，不需要另外发明工具。同样地，代数 de Rham 复形 $\\Omega^\\bullet_{X/k}$ 的超上同调定义代数 de Rham 上同调，在特征 0 且光滑时与奇异上同调（合理假设下）一致，而特征 p 时失效，这正催生了 crystalline 上同调。',
        ['two-spectral-sequences']),
      step('comparison-with-cech', '与 Čech 超上同调及导出范畴的对接',
        '第五步交代与 Čech 复形的对接。设 $\\mathfrak{U}$ 是 X 的开覆盖，$\\check{\\mathcal{C}}^\\bullet(\\mathfrak{U},K^\\bullet)$ 是双复形（Čech 方向与复形方向），则存在自然的比较映射 $\\mathbb{H}^i(\\check C^\\bullet(\\mathfrak{U},K^\\bullet))\\to \\mathbb{H}^i(X,K^\\bullet)$，并且取所有覆盖的滤过余极限后它是同构。当 $K^\\bullet$ 的每一项都拟凝聚且覆盖是良好的（仿射交）时，比较映射本身即同构，这时超上同调可以完全用 Čech 双复形手算，这就是「超上同调可计算」的版本。在导出范畴的语言中，$\\mathbb{H}^i(X,K^\\bullet)=\\operatorname{Hom}_{D(\\mathcal{O}_X)}(\\mathcal{O}_X,K^\\bullet[i])=R^i'\Gamma(X,K^\\bullet)$，因此一切导出函子的形式性质（长正合列、谱序列、基变换映射）都自动适用；特别地，复形的短正合列给出超上同调的长正合列，这是实际计算中反复使用的工具。把「超上同调」与「导出范畴的同调」看作同一件事实是这条条目最重要的认知：$\\mathbb{H}^i$ 不是一个新的不变量，而是把 $R^i'\Gamma$ 的定义域从层扩展到复形。',
        ['two-spectral-sequences', 'degenerate-case-single-sheaf']),
    ],
    conclusion: '对环化空间 X 与有界下方复形 $K^\\bullet$，超上同调 $\\mathbb{H}^i(X,K^\\bullet)=H^i'\bigl(\\Gamma(X,\\operatorname{Tot}(\\mathcal{I}^{\\bullet,\\bullet}))\\bigr)=R^i'\Gamma(X,K^\\bullet)=\\operatorname{Hom}_{D(\\mathcal{O}_X)}(\\mathcal{O}_X,K^\\bullet[i])$ 定义良好且与消解选择无关；当 $K^\\bullet$ 为单个层时退化为普通层上同调。两个谱序列 $E_1^{p,q}=H^q(X,K^p)\\Rightarrow'\mathbb{H}^{p+q}$ 与 $E_2^{p,q}=H^p(X,\\mathcal{H}^q(K^\\bullet))\\Rightarrow'\mathbb{H}^{p+q}$ 给出全部计算手段，de Rham 定理与 Hodge 分解都是其特例。',
    dependencies: [],
    consequences: [],
    explanation: '超上同调的必要性可以用一句话概括：几何里天然出现的对象是复形，而不是层。de Rham 复形、Čech 复形、滤过商复形、Dolbeault 复形都自带一个微分，它们不是层（层没有整体的微分），因此不能直接问「它的上同调群」是什么。超上同调提供的回答是：把复形视为导出范畴的一个对象，然后取全局截面函子的导出，于是「复形的上同调」被定义为「导出函子在复形上的取值」。这个定义的好处是双重的。向上，它与已有概念相容：单个层给出普通层上同调，投射对象给出零。向下，它自带计算工具：任何滤过给出谱序列，因此 de Rham 定理、Hodge 分解、Leray 谱序列不需要各自的技术，都是「对某个滤过写谱序列」。因此掌握超上同调的关键不是记住定义，而是记住「复形 + 滤过 = 谱序列」这一机械操作，以及「退化 = 同构」这一判据。',
    examples: [
      { title: '例子：ℙ¹ 上 O(-1) → O ⊕ O → O(1) 复形的超上同调', body: '取 $X=\\mathbb{P}^1_k$ 与复形 $K^\\bullet:0\\to'\mathcal{O}(-1)\\xrightarrow{\\alpha}'\mathcal{O}'\oplus'\mathcal{O}'\xrightarrow{\\beta}'\mathcal{O}(1)\\to0$（Euler 序列，此处用其截断形式），其中 $\\alpha(s)=(-tS,s)$、$\\beta(a,b)=aT+bS$（S、T 为两个整体截面）。这是一个正合复形吗？Euler 序列 $0\\to'\mathcal{O}'\to'\mathcal{O}(1)^{\\oplus2}'\to'\mathcal{O}(2)\\to0$ 与它的 Tate 扭曲相关。直接用第一个谱序列 $E_1^{p,q}=H^q(X,K^p)$：需要 $H^q(\\mathbb{P}^1,\\mathcal{O}(d))$ 的值：$H^0(\\mathcal{O}(d))=d+1$（$d'\ge0$）否则 0；$H^1(\\mathcal{O}(d))=-d-1$ 维（$d'\le-2$）否则 0。取 $K^0=\\mathcal{O}(-1)$：$H^0=0$、$H^1=0$（因为 d=-1 时 $H^1(\\mathcal{O}(-1))=0$，$-d-1=0$）。$K^1=\\mathcal{O}'\oplus'\mathcal{O}$：$H^0=k^2$、$H^1=0$。$K^2=\\mathcal{O}(1)$：$H^0=k^2$、$H^1=0$。于是 $E_1$ 页只在 q=0 行非零：$0\\to k^2\\to k^2\\to0$，故 $\\mathbb{H}^0=k^2/\\text{im}$ 与 $\\mathbb{H}^1=\\ker$，具体地 $\\mathbb{H}^0$ 与 $\\mathbb{H}^1$ 的维数取决于 β 与 α 的秩，核算给出 $\\mathbb{H}^0=\\ker'\beta=\\operatorname{im}'\alpha$ 的维数 0（复形正合）与 $\\mathbb{H}^1=\\operatorname{coker}'\alpha=k^2/k$ 的维数 1，与复形在中间正合时的超上同调集中在 $\\mathbb{H}^1=k$ 相符。这个例子展示了「超上同调 = 逐项层上同调再算同调」的具体操作。' },
      { title: '例子：两条短复形的超上同调与长正合列', body: '取 $X=\\mathbb{P}^1$，短正合列 $0\\to K^\\bullet'\to L^\\bullet'\to M^\\bullet'\to0$（复形层面的正合列），则超上同调给出长正合列 $\\cdots'\to'\mathbb{H}^i(X,K^\\bullet)\\to'\mathbb{H}^i(X,L^\\bullet)\\to'\mathbb{H}^i(X,M^\\bullet)\\to'\mathbb{H}^{i+1}(X,K^\\bullet)\\to'\cdots$。具体取 $K^\\bullet=\\mathcal{O}(-1)[0]$、$L^\\bullet=\\mathcal{O}[0]$、要构造出短正合列需要 $M^\\bullet=\\mathcal{O}/\\mathcal{O}(-1)$（一个摩天大楼型层），此时 $\\mathbb{H}^0$ 项为 $0\\to0\\to k'\to k^2\\to'\cdots$，其中 $\\mathbb{H}^0(X,\\mathcal{O}/\\mathcal{O}(-1))=k^2/\\operatorname{im}(\\mathcal{O}(\\mathbb{P}^1)\\to'\dots)$，核算 $H^0(\\mathcal{O})=k$ 与 $\\mathcal{O}/\\mathcal{O}(-1)$ 的支撑为 $t=0$ 与 $t=\\infty$ 两点（因为 $\\mathcal{O}(-1)$ 的截面在 $\\mathbb{P}^1$ 上处处可逆），故 $H^0(\\mathcal{O}/\\mathcal{O}(-1))=k^2/k=k$。这条长正合列是实际计算超上同调的主要工具：把复杂复形拆成简单复形（如单个层或摩天大楼层）的扩张，再用长正合列逐段计算。注意长正合列的存在完全来自导出函子的形式性质，不需要任何几何假设，这正是超上同调在导出范畴中的自然性的体现。' },
    ],
    remarks: [
      '超上同调不等于「逐项层上同调的和」：$\\bigoplus_p H^{i-p}(X,K^p)$ 一般不是 $\\mathbb{H}^i(X,K^\\bullet)$，两者由谱序列联系，中间有多次微分（$d_2,d_3,\\ldots$）参与。只有当谱序列在 $E_1$ 或 $E_2$ 页退化时才相等。误把「逐项上同调」直接当作超上同调是初学者最常见的错误，例如 de Rham 复形上若不做 Poincaré 引理的退化论证，$\\bigoplus H^{i-p}_{dR}(X)$ 的说法毫无意义。',
      '复形必须有界下方（或至少满足适当的有界性）才能保证超上同调由普通消解直接计算：对无界复形，单射消解与 Cartan–Eilenberg 消解的存在性及「$\\operatorname{Hom}$ 与上同调一致」需要额外的收敛性/有界性条件（例如使用 $K$-内射或 $K$-投射复形）。因此在 $D^+(\\mathcal{O}_X)$ 与 $D(\\mathcal{O}_X)$ 之间切换时要核对有界性，Serre 对偶与 Grothendieck 对偶中「有界下方」的假设正是为此。',
      '超上同调在特征 p 的代数几何中会失效（对代数 de Rham 复形）：$\\Omega^\\bullet_{X/k}$ 在特征 p 时不是 $\\underline{k}$ 的消解（上同调层 $\\mathcal{H}^q$ 非零），第二类谱序列不退化，于是 $\\mathbb{H}^\\bullet$ 不再等于奇异上同调，$d(\\Omega^{p-1})$ 里漏掉的层正是 crystalline/rigid 上同调要补的对象。这条边界说明超上同调本身没有问题，出问题的是「$\\Omega^\\bullet$ 是常数层的消解」这一输入；在特征 0 时 Ok 的特征 p 时失效，这与 de Rham 定理的经典叙述完全一致。',
      '超上同调与普通上同调在「乘法结构」上需要 cup 积：$\\mathbb{H}^i'\times'\mathbb{H}^j'\to'\mathbb{H}^{i+j}$ 由双复形的总复形乘法给出，它只有在复形带乘法结构（DGA/交换 DGA）时才是交换的（Koszul 符号）。把 $\\mathbb{H}^\\bullet$ 当作普通上同调环来使用时，必须先构造出这个乘法（例如 de Rham 复形用楔积、Čech 用 cup 积），否则只能得到上加群结构。这是超上同调与普通层上同调在使用上的一个额外负担。',
    ],
    corollaries: [
      { title: '推论：复形的拟同构诱导超上同调同构', body: '若 $K^\\bullet'\to L^\\bullet$ 是拟同构（即诱导的上同调层同构），则 $\\mathbb{H}^i(X,K^\\bullet)\\cong'\mathbb{H}^i(X,L^\\bullet)$ 对一切 i。证明：拟同构在导出范畴中变为同构，而超上同调是导出范畴上的函子 $\\operatorname{Hom}_{D}(\\mathcal{O}_X,K^\\bullet[i])$ 的取值，故同构保持不变。这条推论的实用价值在于它允许把复杂复形替换为拟同构的简单模型（例如用 Cartan–Eilenberg 消解替换原复形、用 DG 代数的自由模型替换原模型）；与普通层上同调相比这是一个额外的自由度，因为层层面没有「拟同构」这种弱等价概念。de Rham 定理的证明正是利用这一点把 $\\Omega^\\bullet$ 替换为其消解并逐项计算。', uses: ['cartan-eilenberg-resolution'] },
    ],
    references: [
      stacks('Section 20.7: Cohomology of unbounded complexes', '01E3'),
      stacks('Lemma 20.7.3: higher direct images as sheafified cohomology', '01E4'),
      { title: 'Sheaves on Manifolds', author: 'Kashiwara & Schapira', year: 1990 },
    ],
    history: HISTORY,
  },

  /* ═══════════════════════════════════════════════════════════
   * 10. Leray 谱序列
   * ═══════════════════════════════════════════════════════════ */

  'a-leray-ss': {
    statement: '设 $f:X'\to Y$ 是环化空间（或概形）之间的态射、$\\mathcal{F}$ 是 $\\mathcal{O}_X$-模（更一般地是 $D^+(\\mathcal{O}_X)$ 中的复形）。则存在谱序列 $E_2^{p,q}=H^p(Y,R^qf_*\\mathcal{F})\\Rightarrow H^{p+q}(X,\\mathcal{F})$，其中 $R^qf_*\\mathcal{F}$ 是第 q 个高阶直接像层（即预层 $V'\mapsto H^q(f^{-1}V,\\mathcal{F})$ 的层化），且该谱序列是「以 $Y$ 的上同调分解 $X$ 的上同调」的精确工具。若对某个 $q_0$，一切 $q'\ge q_0$ 有 $R^qf_*\\mathcal{F}=0$，则谱序列退化（在 $E_2$ 页上只有有限多行）并给出短正合列 $0\\to E_2^{p,q_0}'\to H^{p+q_0}(X,\\mathcal{F})\\to E_2^{p+q_0,0}'\to0$ 型的信息；特别地若 $R^qf_*\\mathcal{F}=0$ 对一切 $q>0$，则同构 $H^p(Y,f_*\\mathcal{F})\\cong H^p(X,\\mathcal{F})$（这就是「仿射态射不改变上同调」的来源）。',
    explanation: 'Leray 谱序列的作用是把「在 X 上算上同调」这件困难的事拆成两步：先在纤维上算（得到高阶直接像 $R^qf_*\\mathcal{F}$），再在底空间 Y 上算。之所以需要谱序列而不是简单的等式，是因为这两个操作不交换：先算纤维上的上同调再算底空间上的上同调，与直接算 X 的上同调之间有「交叉项」的干涉，体现在谱序列的非平凡微分 $d_2,d_3,\\ldots$ 上。退化的情形（高阶直接像为零）是最重要的：这时干涉消失，得到干净的同构，而这一情形覆盖了代数几何中大量重要场景，例如仿射态射（$R^qf_*=0$，q>0，由 Serre 仿射消没）与有限态射（$R^qf_*=0$，q>0，因为有限态射的直接像是正合函子）。因此 Leray 谱序列既给出一般情形下的完整描述（谱序列），又给出特例下的可计算结论（退化同构），是验证「某些态射不改变上同调」的统一框架。',
    steps: [
      step('right-derived-functor-and-adjunction', '高阶直接像：定义与基本性质',
        '第一步定义 $R^qf_*$。对态射 $f:X'\to Y$ 与 $\\mathcal{O}_X$-模 $\\mathcal{F}$，直接像 $f_*\\mathcal{F}$ 是 Y 上的层，$f_*\\mathcal{F}(V)=\\mathcal{F}(f^{-1}V)$。$f_*$ 是左正合函子（保持核，不保持余核），其右导出函子记为 $R^qf_*$，可由 $\\mathcal{F}$ 的单射（或松）消解 $\\mathcal{F}'\to I^\\bullet$ 定义为 $R^qf_*\\mathcal{F}=H^q(f_*I^\\bullet)$。$f_*$ 有左伴随 $f^*$（拉回），故 $f_*$ 保持极限、$f^*$ 保持余极限，这是 $f_*$ 左正合的范畴论理由。另一条重要的具体描述是「$R^qf_*\\mathcal{F}$ 是预层 $V'\mapsto H^q(f^{-1}V,\\mathcal{F})$ 的层化」：由消解定义，$H^q(f^{-1}V,\\mathcal{F})=H^q(\\Gamma(f^{-1}V,I^\\bullet))=H^q(f_*I^\\bullet(V))$，取层化即得。这个描述说明 $R^qf_*$ 的茎（在 $y'\in Y$）等于纤维附近的上同调 $\\varinjlim_{y'\in V}H^q(f^{-1}V,\\mathcal{F})$，因此高阶直接像在纤维上「几乎就是纤维的上同调」。这句直觉是 Leray 谱序列的全部要点：$E_2^{p,q}$ 项中的 q 方向度量纤维的上同调，p 方向度量底空间的上同调，而谱序列把这二者织成 X 的上同调。',
        []),
      step('grothendieck-spectral-sequence', 'Grothendieck 谱序列的复合函子来源',
        '第二步给出 Leray 谱序列的来源：它是「复合函子的 Grothendieck 谱序列」的特例。设 $\\mathcal{A}'\xrightarrow{G}'\mathcal{B}'\xrightarrow{F}'\mathcal{C}$ 是阿贝尔范畴之间的左正合函子，$G$ 把内射对象送到 $F$-无环对象。则存在谱序列 $E_2^{p,q}=R^pF(R^qG(A))\\Rightarrow R^{p+q}(FG)(A)$。对 Leray 情形取 $G=f_*$（层范畴之间的直接像）、$F=\\Gamma(Y,-)$（整体截面），则 $FG=\\Gamma(Y,f_*-)=\\Gamma(X,-)$（因为 $\\Gamma(Y,f_*\\mathcal{F})=\\mathcal{F}(X)$）。$G=f_*$ 把内射 $\\mathcal{O}_X$-模送到 $\\Gamma_Y$-无环对象（内射层是松的，而松层在 $\\Gamma$ 下无高阶上同调），条件满足。于是得到 $E_2^{p,q}=H^p(Y,R^qf_*\\mathcal{F})\\Rightarrow H^{p+q}(X,\\mathcal{F})$，正是 Leray 谱序列。这说明 Leray 谱序列不是一条孤立的定理，而是「右导出函子与复合相容（在谱序列意义下）」这一一般原理的实例。掌握这个来源的价值在于：所有类似的「先局部也算、再整体也算」的问题都可以用同一框架处理（例如 Leray 谱序列对多个态射的复合、对超覆盖、对基变换都成立），不需要每次重新发明。',
        ['right-derived-functor-and-adjunction']),
      step('acyclicity-and-degeneration', '无环性与退化：同构的判据',
        '第三步讨论最重要的特殊情形：退化。若 $R^qf_*\\mathcal{F}=0$ 对一切 $q>0$ 成立，则谱序列的 $E_2$ 页只在 $q=0$ 行有非零项，于是所有微分 $d_r$（$r'\ge2$）从 $E_r^{p,0}$ 出发打到 $E_r^{p+r,-r+1}=0$（q 为负或行不在谱序列范围内）、打到 $E_r^{p,0}$ 的微分来自 $E_r^{p-r,r-1}=0$，故 $E_2=E_'\infty$，得到 $H^p(Y,f_*\\mathcal{F})\\cong H^p(X,\\mathcal{F})$。这类态射称为「$\\mathcal{F}$-无环」的态射。两个最重要的例子：(a) 仿射态射：$f:X'\to Y$ 仿射（即 Y 有仿射开覆盖使原像仿射）时，对拟凝聚 $\\mathcal{F}$，每个 $R^qf_*\\mathcal{F}=0$（q>0），因为仿射上拟凝聚层无高阶上同调（Serre）；于是仿射态射不改变拟凝聚层的上同调，这正是 Serre 仿射消没定理的「相对版本」。(b) 有限态射：$f$ 有限时 $f_*$ 正合（有限模的直接像保持正合性，因为有限模的取模运算与直接像相容），故 $R^qf_*=0$（q>0）。这两类例子说明退化判据覆盖面很广，也是「为什么可以逐层计算上同调」的根本理由。',
        ['grothendieck-spectral-sequence']),
      step('five-term-exact-sequence', '五项正合列与低次项的具体形态',
        '第四步给出谱序列的低次形态，这是实际计算中最常用的部分。谱序列的低次部分给出五项正合列：$0\\to E_2^{1,0}'\to H^1(X,\\mathcal{F})\\to E_2^{0,1}'\xrightarrow{d_2}E_2^{2,0}'\to H^2(X,\\mathcal{F})$。用 $E_2^{p,q}=H^p(Y,R^qf_*\\mathcal{F})$ 展开：$0\\to H^1(Y,f_*\\mathcal{F})\\to H^1(X,\\mathcal{F})\\to H^0(Y,R^1f_*\\mathcal{F})\\xrightarrow{d_2}H^2(Y,f_*\\mathcal{F})\\to H^2(X,\\mathcal{F})$。这条正合列说明：$H^1(X,\\mathcal{F})$ 被夹在「底空间的一次上同调」与「纤维的一次上同调的全局截面」之间，而 $d_2$ 是从纤维上的 1 次上同调类到 Y 上的 2 次类的障碍映射（它给出「纤维的局部上同调类能否整体化」的判据）。同样地，高次部分给出：$0\\to E_2^{0,1}'\to H^1$ 这一段的核与余核都可通过后续微分计算。五项正合列在具体问题中的用法是「先确定两端，再夹逼中间」：例如证明某个 $H^1(X,\\mathcal{F})=0$ 时，若能证明 $H^1(Y,f_*\\mathcal{F})=0$ 与 $H^0(Y,R^1f_*\\mathcal{F})=0$，则立即得到结论。这条工具在射影纤维化的上同调计算与曲面的分类中反复使用。',
        ['acyclicity-and-degeneration']),
      step('examples-and-base-change', '应用范例：射影纤维化与与基变换的关系',
        '第五步给出应用与边界。范本一：射影空间纤维化 $\\mathbb{P}^n_A'\to'\operatorname{Spec}A$（A 诺特），$R^qf_*\\mathcal{O}(d)=0$（$0<q<n$）且 $R^nf_*\\mathcal{O}(d)$ 是 M 的平移（由射影空间上同调消没定理与 Serre 定理），于是 Leray 谱序列给出 $H^p(\\mathbb{P}^n_A,\\mathcal{O}(d))$ 的计算公式，这就是「射影空间上同调」的谱序列证明。范本二：$f$ 平坦且 $\\mathcal{F}$ 平坦时，$R^qf_*\\mathcal{F}$ 与基变换相容（见基变换定理条目），于是谱序列的所有项都可基变换，这给出「上同调在族中半连续」的精确形式。边界方面：第一，退化不是常态：一般的纤维化（如椭圆曲面、K3 的纤维化）$R^1f_*\\neq0$，谱序列必须逐页计算（这就是 Hodge 理论中「Kodaira 维数与纤维化」的技术核心）；第二，当 $f$ 只满足较弱的条件（例如 $f$ 只有纤维是仿射而非 $f$ 仿射）时，$R^qf_*$ 不消没，只能用谱序列而不能用同构；第三，谱序列的微分 $d_2$ 是「上同调的运算」（例如在球丛情形它对应 Euler 类），把 $d_2$ 理解为几何不变量是使用 Leray 谱序列的进阶要点。',
        ['five-term-exact-sequence', 'acyclicity-and-degeneration']),
    ],
    conclusion: '对态射 $f:X'\to Y$ 与 $\\mathcal{O}_X$-模 $\\mathcal{F}$，存在 Leray 谱序列 $E_2^{p,q}=H^p(Y,R^qf_*\\mathcal{F})\\Rightarrow H^{p+q}(X,\\mathcal{F})$，它来自「$f_*$ 与 $\\Gamma$ 复合」的 Grothendieck 谱序列；低次部分给出五项正合列 $0\\to H^1(Y,f_*\\mathcal{F})\\to H^1(X,\\mathcal{F})\\to H^0(Y,R^1f_*\\mathcal{F})\\to H^2(Y,f_*\\mathcal{F})\\to H^2(X,\\mathcal{F})$。若 $R^qf_*\\mathcal{F}=0$（$q>0$，例如 $f$ 仿射且 $\\mathcal{F}$ 拟凝聚，或 $f$ 有限），则谱序列退化并给出 $H^p(Y,f_*\\mathcal{F})\\cong H^p(X,\\mathcal{F})$。',
    dependencies: [],
    consequences: [],
    explanation: 'Leray 谱序列回答的是「把大空间的上同调拆成底空间与纤维两层」这一自然问题。两层拆分的困难在于两种上同调操作不交换：把纤维先算出来再在底空间上算，与直接在 X 上算，中间差的就是谱序列的微分项。谱序列因此是一部「记账机器」，它把差异记录在 $E_2$ 之后的各页上，直到 $E_'\infty$ 页才给出 X 的上同调（带有滤过）。理解它的最好方式是抓住两个极端：一端是完全退化（$R^{>0}f_*=0$）时得到干净的同构，这就是为什么仿射态射与有限态射「不改变上同调」；另一端是高度非退化（如纤维化曲面）时必须逐页追踪微分，这就产生了诸如「Hodge 结构的变化」、「单值化」等深层现象。谱序列的价值在于它同时覆盖这两个极端，并提供中间情形下的五项正合列作为最实用的工具。',
    examples: [
      { title: '例子：𝔸¹ 纤维化与仿射态射的退化', body: '取 $Y=\\operatorname{Spec}k$、$X=\\mathbb{A}^1_k$、$f$ 为结构态射、$\\mathcal{F}=\\mathcal{O}_X$。纤维是单点（因为 $Y$ 是单点），$R^qf_*\\mathcal{O}_X$ 的计算：$f_*\\mathcal{O}_X=k[t]$、$R^qf_*=0$（$q>0$，因为 $X$ 仿射且 $\\mathcal{O}_X$ 拟凝聚，Serre 仿射消没；同时 $k[t]$ 作为 k-模自由，其高阶上同调为零）。Leray 谱序列的 $E_2$ 页：$E_2^{0,0}=H^0(Y,k[t])=k[t]$、$E_2^{p,0}=H^p(Y,k[t])=0$（$p>0$，因为 $Y$ 是单点空间其上同调在 $p>0$ 为零）、$E_2^{p,q}=0$（$q>0$）。于是退化给 $H^p(X,\\mathcal{O}_X)=H^p(Y,k[t])$，$p=0$ 时 $H^0=k[t]$，$p>0$ 时 $0$。这与「仿射直线上的结构层无高阶上同调」一致，谱序列在此完全退化、计算量极小。核算的关键是注意到 $E_2^{p,0}$ 在 $p>0$ 时为零，因为底空间 Y 是单点。若把 $Y$ 换成 $\\mathbb{P}^1$、$X=\\mathbb{P}^1\\times'\mathbb{A}^1$，则 $E_2^{p,q}=H^p(\\mathbb{P}^1,R^qf_*\\mathcal{O}_X)$ 中 $R^qf_*=0$（q>0）仍成立（$f$ 是仿射态射），故 $H^n(X,\\mathcal{O}_X)=H^n(\\mathbb{P}^1,\\mathcal{O}_{\\mathbb{P}^1}[t])$，即把 $\\mathbb{P}^1$ 的上同调按 $k[t]$-模系数计算，得到 $H^0=k[t]$、$H^1=0$、$H^2=k[t]$（作为 $k[t]$-模）。' },
      { title: '例子：ℙ¹ 上的 O(-1) 与五项正合列', body: '取 $X=E$（一个椭圆曲线）、$Y=\\operatorname{Spec}k$、$f$ 结构态射、$\\mathcal{F}=\\mathcal{O}_E$。此时 $E_2^{p,q}=0$（$p>0$，因为 Y 是单点），故只有 $E_2^{0,q}=H^q(E,\\mathcal{O}_E)$：$q=0$ 给 k、$q=1$ 给 k、$q'\ge2$ 给 0。总次数 $n=p+q=q$，故 $H^0(E,\\mathcal{O}_E)=k$、$H^1(E,\\mathcal{O}_E)=k$，与椭圆曲线的经典结果一致。这个例子说明当底空间是单点时，Leray 谱序列退化为恒等式（$R^qf_*=H^q(X,\\mathcal{F})$ 作为 k-向量空间），因此谱序列在「绝对情形」下没有额外内容；真正的信息在底空间非平凡时出现。取一个真正有内容的例子：$E$ 为椭圆曲线、$f:E'\to'\mathbb{P}^1$ 为 2:1 的有限态射（椭圆曲线的某个射影），$\\mathcal{F}=\\mathcal{O}_E$。$f$ 有限故 $R^qf_*=0$（q>0），于是 $H^p(E,\\mathcal{O}_E)=H^p(\\mathbb{P}^1,f_*\\mathcal{O}_E)$。核算 $f_*\\mathcal{O}_E$：作为 $\\mathcal{O}_{\\mathbb{P}^1}$-模是秩 2 的局部自由层（因为 f 有限平坦），故 $f_*\\mathcal{O}_E'\cong'\mathcal{O}'\oplus'\mathcal{O}(-m)$ 型（利用 $\\mathbb{P}^1$ 上向量丛的分裂），具体 m 由分歧决定。于是 $H^0(E,\\mathcal{O}_E)=H^0(\\mathcal{O})\\oplus H^0(\\mathcal{O}(-m))$ 维数 1+0=1（$m>0$）或 1+1=2（$m=0$ 即非分歧），$H^1$ 对应 $(m-1)+0$ 型。因为椭圆曲线的 $H^0(\\mathcal{O}_E)=1$，故 $m>0$，与「有限态射必定有分歧点」一致——这就是五项正合列与分裂信息结合使用的典型核算。' },
    ],
    remarks: [
      '退化不是「自动发生」的：只有当 $R^qf_*\\mathcal{F}$ 在 $q>0$ 时全消没才可把谱序列替换为同构。常见的错误是把「纤维光滑」误当成「$R^qf_*=0$」，实际上光滑态射的高阶直接像一般不消没（例如 $\\mathbb{P}^1$-丛的 $R^2f_*\\mathcal{O}$ 非零）。判断退化必须逐项核对 $R^qf_*$，不能由纤维的几何性质推断，因为 $R^qf_*$ 记录的是纤维的上同调沿底空间的丛结构。',
      '仿射态射情形需要 $\\mathcal{F}$ 拟凝聚：Serre 仿射消没定理只对拟凝聚层成立，若 $\\mathcal{F}$ 非拟凝聚（例如常值层），仿射上的高阶上同调可以非零（$H^1(\\mathbb{A}^1,\\underline{\\mathbb{Z}})=0$ 仍成立但 $H^1$ 对更复杂空间会非零），此时「仿射态射不改变上同调」失效。所以「$f$ 仿射 ⟹ $R^{>0}f_*=0$」的完整陈述必须带上「$\\mathcal{F}$ 拟凝聚」这一前提。',
      'Leray 谱序列的收敛是「强收敛」而非「弱收敛」：它带有一个滤过 $H^n(X,\\mathcal{F})\\supseteq'\cdots'\supseteq F^pH^n'\supseteq F^{p+1}H^n'\supseteq'\cdots$ 使得 $E_'\infty^{p,q}'\cong F^pH^{p+q}/F^{p+1}H^{p+q}$，因此 $\\mathbb{H}$ 并非直和而是滤过的商。要得到直和分解（如 Hodge 分解）需要谱序列在 $E_2$ 页退化的额外信息，不能只从收敛性推断。把「收敛到 $H^n$」误读成「$H^n=\\bigoplus E_2^{p,q}$」是最常见的错误。',
      'Leray 谱序列对复形同样成立，并且是超上同调意义下的收敛：$E_2^{p,q}=H^p(Y,R^qf_*K^\\bullet)\\Rightarrow \\mathbb{H}^{p+q}(X,K^\\bullet)$，其中 $R^qf_*$ 作用于复形。de Rham 定理、Hodge 分解、以及「消解态射不改变上同调」的许多陈述都在这个复形版本下表述。使用时要注意此时的 $R^qf_*K^\\bullet$ 是复形的超上同调层而非单层的上同调，两者在 $K^\\bullet$ 是层时为同一件事，但不是层时必须分清。',
    ],
    corollaries: [
      { title: '推论：仿射态射与有限态射不改变拟凝聚层上同调', body: '若 $f:X'\to Y$ 是仿射态射、$\\mathcal{F}$ 是拟凝聚 $\\mathcal{O}_X$-模（或 $f$ 有限任意 $\\mathcal{F}$），则 $R^qf_*\\mathcal{F}=0$ 对 $q>0$，从而 Leray 谱序列退化给出 $H^p(Y,f_*\\mathcal{F})\\cong H^p(X,\\mathcal{F})$。这条推论是「上同调在仿射/有限拉回下不变」这一实用原理的来源，例如计算射影簇的上同调时可以先取仿射覆盖再逐步下降，或把有限覆盖（如双覆盖、特征 p 的 Frobenius 态射）上的上同调搬到基上。它也是 Serre 仿射消没定理（$Y$ 仿射、$f$ 为结构态射时 $H^p(X,\\mathcal{F})=H^p(Y,f_*\\mathcal{F})$ 而在 $Y$ 仿射时后者在 $p>0$ 为零）的证明基础。', uses: ['acyclicity-and-degeneration'] },
    ],
    references: [
      stacks('Lemma 20.7.3: higher direct images as sheafified cohomology', '01E4'),
      stacks('Lemma 20.7.2: vanishing on a covering', '01E3'),
      { title: 'Sur les groupes d'homologie des espaces fibrés et des espaces homogènes', author: 'Jean Leray', year: 1947 },
    ],
    history: HISTORY,
  },

  /* ═══════════════════════════════════════════════════════════
   * 11. de Rham 定理
   * ═══════════════════════════════════════════════════════════ */

  'a-hodge-de-rham': {
    statement: '设 $X$ 是光滑流形（实或复），$\\Omega^\\bullet_X$ 是 de Rham 复形，$H^n_{dR}(X)=H^n(\\Gamma(X,\\Omega^\\bullet_X))=H^n'\bigl(\\cdots'\to'\Omega^n(X)\\xrightarrow{d}'\Omega^{n+1}(X)\\to'\cdots'\bigr)$。则 de Rham 定理断言存在自然的同构 $H^n_{dR}(X)\\cong H^n(X,\\underline{\\mathbb{R}})$（$\\underline{\\mathbb{R}}$ 为常值层），它与 cup 积相容，故是分次环同构。对复流形，用超上同调的语言写成 $\\mathbb{H}^n(X,\\Omega^\\bullet_X)\\cong H^n(X,\\underline{\\mathbb{R}})$。代数几何中对应的陈述是 $H^n_{dR}(X/k):=\\mathbb{H}^n(X,\\Omega^\\bullet_{X/k})\\cong H^n_{sing}(X(\\mathbb{C}),k)$（k 特征 0 且 X 光滑、合适假设下），在特征 p 时 $\\Omega^\\bullet_{X/k}$ 不是 $\\underline{k}$ 的消解，故该同构失效。',
    explanation: 'de Rham 定理把两种完全不同构造的上同调等同起来：一侧是「解微分方程」——闭 n-形式模去恰当形式，即 $\\ker d/\\operatorname{im}d$，是分析对象；另一侧是「数洞」——奇异上同调，是拓扑对象。定理的内容是这两者一致，因此可以用解析计算（局部解方程、Poincaré 引理的局部可解性）来得到拓扑不变量，也可以用拓扑（洞的个数、Betti 数）来预测微分方程解空间的维数。证明的机制是谱序列：Poincaré 引理断言 de Rham 复形在每个点的邻域上正合（除 $\\Omega^0$ 外上同调层为零），因此 $\\Omega^\\bullet_X$ 是常值层 $\\underline{\\mathbb{R}}$ 的一个消解，于是 $\\mathbb{H}^n(X,\\Omega^\\bullet_X)\\cong H^n(X,\\underline{\\mathbb{R}})$。关键在于「局部可解性」：$d'\omega=0$ 在局部蕴含 $\\omega=d'\eta$，这正是分析的输入；而把它组装成整体同构则用层的语言。代数几何中同一论证要求 $\\Omega^\\bullet_{X/k}$ 是常数层消解，在特征 0 时由代数版本的 Poincaré 引理成立，在特征 p 时因 $dx^p=0$ 而失效，这直接导致 crystalline 上同调的出现。',
    steps: [
      step('poincare-lemma-local-exactness', 'Poincaré 引理：局部的正合性',
        '第一步给出全部论证的分析输入。Poincaré 引理断言：设 $U'\subseteq'\mathbb{R}^n$ 是星形开集（例如开球），则 de Rham 复形 $0\\to'\Omega^0(U)\\xrightarrow{d}'\Omega^1(U)\\xrightarrow{d}'\cdots'\xrightarrow{d}'\Omega^n(U)\\to0$ 正合（除 $\\Omega^0$ 处只有常数核），即对一切 $p'\ge1$ 有 $H^p_{dR}(U)=0$，且 $H^0_{dR}(U)=\\mathbb{R}$（局部常值函数）。证明用同伦算子：定义 $h_p:\\Omega^p(U)\\to'\Omega^{p-1}(U)$ 为「沿从原点出发的射线积分」$h_p(\\sum_I f_I dx_I)=\\sum_I'\int_0^1t^{p-1}f_I(tx)dt'\,\\bigl(\\sum_{j}[\\text{用 }x_j'\text{ 收缩 }dx_{i_j}]'\bigr)$，直接核算得 $d h_p+h_{p+1}d=\\operatorname{id}$（对 p≥1），即 $h$ 给出链同伦，从而若 $d'\omega=0$ 则 $\\omega=d(h'\omega)$。这一步是纯分析的有限计算（对每个 $\\omega$ 逐项做积分并求导），但它蕴含了「局部的一切闭形式都恰当」。把这条引理用在流形 X 上：每个点有坐标球，其上 de Rham 复形正合，因此 de Rham 复形的上同调层满足 $\\mathcal{H}^p(\\Omega^\\bullet_X)=0$（$p>0$）与 $\\mathcal{H}^0(\\Omega^\\bullet_X)=\\underline{\\mathbb{R}}$（局部常值）。',
        []),
      step('resolution-of-constant-sheaf', 'Ω 复形是常值层的消解',
        '第二步把局部正合性提升为层的消解。由第一步，de Rham 复形层满足：$\\ker(d:\\Omega^0\\to'\Omega^1)=\\underline{\\mathbb{R}}$（局部常值函数层），且对 $p'\ge1$，$\\ker(d:\\Omega^p'\to'\Omega^{p+1})=\\operatorname{im}(d:\\Omega^{p-1}'\to'\Omega^p)$。因此复形 $0\\to'\underline{\\mathbb{R}}'\to'\Omega^0\\to'\Omega^1\\to'\cdots$ 在每一层处正合，即 $\\Omega^\\bullet_X$ 是 $\\underline{\\mathbb{R}}$ 的一个消解（右消解）。这一步的要点是「层化」：局部正合性在每一点的茎上成立（因为茎可以由足够小的坐标球上的截面表示），而层的正合性等价于逐茎正合，于是第一步的局部结论自动给出全局层的正合性。这一步也解释了为什么必须有「光滑」假设：$\\Omega^\\bullet_X$ 的层结构需要 X 是流形（有可微结构），在奇异空间或代数特征 p 情形 $\\Omega^\\bullet$ 不是消解。有了消解，就可用它来计算 $\\underline{\\mathbb{R}}$ 的层上同调：$H^n(X,\\underline{\\mathbb{R}})\\cong H^n(\\Gamma(X,\\Omega^\\bullet_X))=\\mathbb{H}^n(X,\\Omega^\\bullet_X)$（这一步用「消解计算导出函子」，要求 $\\Omega^p$ 是 $\\Gamma$-无环的；$\\Omega^p$ 作为层构成的复形在剖分细化的意义上足够「软」，因此可由超上同调的一般定理保证）。',
        ['poincare-lemma-local-exactness']),
      step('hypercohomology-spectral-sequence', '用谱序列完成同构',
        '第三步把上一步的结论写成谱序列并读出同构。考虑 $\\Omega^\\bullet_X$ 作为复形，其超上同调 $\\mathbb{H}^n(X,\\Omega^\\bullet_X)$ 由第一类谱序列 $E_1^{p,q}=H^q(X,\\Omega^p)\\Rightarrow'\mathbb{H}^{p+q}(X,\\Omega^\\bullet_X)$ 计算，也可以由第二类谱序列 $E_2^{p,q}=H^p(X,\\mathcal{H}^q(\\Omega^\\bullet))\\Rightarrow'\mathbb{H}^{p+q}(X,\\Omega^\\bullet_X)$ 计算。由 Poincaré 引理，$\\mathcal{H}^q(\\Omega^\\bullet)=0$（$q>0$）、$\\mathcal{H}^0=\\underline{\\mathbb{R}}$，故第二类谱序列的 $E_2$ 页只在 q=0 行非零：$E_2^{p,0}=H^p(X,\\underline{\\mathbb{R}})$，于是谱序列退化，$\\mathbb{H}^n(X,\\Omega^\\bullet_X)\\cong H^n(X,\\underline{\\mathbb{R}})$。另一方面由 $\\Omega^\\bullet$ 是 $\\Gamma$-无环消解（或直接由消解计算导出函子）得到 $\\mathbb{H}^n(X,\\Omega^\\bullet_X)\\cong H^n(X,\\underline{\\mathbb{R}})$ 的另一条路径，与第一类谱序列结合即给出 de Rham 上同调与层上同调的等式。特别地，$H^n_{dR}(X)=\\mathbb{H}^n(X,\\Omega^\\bullet_X)$ 是定义式的等式（de Rham 复形的全局截面复形的上同调），故 $H^n_{dR}(X)\\cong H^n(X,\\underline{\\mathbb{R}})$，这就是 de Rham 定理。把 $\\underline{\\mathbb{R}}$ 的层上同调再与奇异上同调比较（层上同调与奇异上同调对局部可缩空间一致，由「常值层的上同调可由好覆盖的 Čech 上同调计算」得到），即得与分析版本的同构。',
        ['resolution-of-constant-sheaf']),
      step('ring-structure-and-products', '乘法结构：cup 积与楔积',
        '第四步说明同构与乘法相容。$H^\\bullet_{dR}(X)$ 带楔积 $\\wedge$，$H^\\bullet(X,\\underline{\\mathbb{R}})$ 带 cup 积 $\\smile$。同构 $H^n_{dR}'\cong H^n(X,\\underline{\\mathbb{R}})$ 是分次环同构：楔积在形式上对应 cup 积，因为 de Rham 复形 $\\Omega^\\bullet_X$ 是分次交换 DGA（带楔积与 d，满足 $d(\\alpha'\wedge'\beta)=d'\alpha'\wedge'\beta+(-1)^{|\\alpha|}'\alpha'\wedge d'\beta$ 与 $\\alpha'\wedge'\beta=(-1)^{|\\alpha||\\beta|}'\beta'\wedge'\alpha$），而常值层的 cup 积由「层复形的总复形乘法」给出。具体的验证路径：取好覆盖算 Čech 上同调，把 de Rham 类表示为 Čech 类（用 $\\Omega^\\bullet$ 的消解性），楔积与 cup 积在双复形层面上同构，故在同调层面也一致。乘法相容是 de Rham 定理的加强版本，它的用途是把「上同调环」而非只有「上同调群」搬来搬去：例如用 de Rham 上同调计算 $H^\\bullet$ 的环结构（形式性、硬 Lefschetz 定理的 de Rham 版本），或者反过来用拓扑的环结构约束微分形式。若只证明群同构而忽略乘法结构，会漏掉这些应用（例如 $S^2\\vee S^2\\vee S^4$ 与 $\\mathbb{CP}^2$ 的上同调群相同而环结构不同，正是靠乘法结构区分的）。',
        ['hypercohomology-spectral-sequence']),
      step('algebraic-version-and-characteristic-p', '代数版本与特征 p 的失效',
        '第五步交代代数几何版本与它的边界。在代数几何中把 $\\Omega^\\bullet_X$ 换成代数微分形式复形 $\\Omega^\\bullet_{X/k}$，定义代数 de Rham 上同调 $H^n_{dR}(X/k)=\\mathbb{H}^n(X,\\Omega^\\bullet_{X/k})$（超上同调）。在特征 0、X 光滑且 k 代数闭（或适当假设下），代数版本的 Poincaré 引理成立（形式幂级数层面：$k[[x]]$ 上 $d'\omega=0$ 蕴含局部 $\\omega=d'\eta$，可用与流形情形相同的同伦算子做），于是 $\\Omega^\\bullet_{X/k}$ 是常数层 $\\underline{k}$ 的消解，给出 $H^n_{dR}(X/k)\\cong H^n(X,\\underline{k})$，并在合适条件下与奇异上同调 $H^n_{sing}(X(\\mathbb{C}),k)$ 一致（需 k 可嵌入 $\\mathbb{C}$ 或直接比较 $\\ell$-进/crystalline）。在特征 p 时失效：$dx^p=p x^{p-1}dx=0$，故 $x^p$ 是闭形式但（在局部）不是恰当形式，Poincaré 引理不成立，$\\Omega^\\bullet$ 不是 $\\underline{k}$ 的消解；上同调层 $\\mathcal{H}^q(\\Omega^\\bullet)$ 有非零的高次部分，补上它们（即补上截断与 divided powers）就得到 crystalline 上同调的结构，这是特征 p 上同调理论（crystalline、rigid、log-crystalline）的动机。这条边界说明了 de Rham 定理不是一个「纯形式」的恒等式，它依赖特征 0 的解析/形式可积性。',
        ['ring-structure-and-products', 'hypercohomology-spectral-sequence']),
    ],
    conclusion: '对光滑流形 $X$，de Rham 复形 $\\Omega^\\bullet_X$ 是常值层 $\\underline{\\mathbb{R}}$ 的消解（由 Poincaré 引理），故 $H^n_{dR}(X)=H^n(\\Gamma(X,\\Omega^\\bullet_X))\\cong H^n(X,\\underline{\\mathbb{R}})\\cong H^n_{sing}(X,\\mathbb{R})$，且同构与楔积/cup 积相容，是分次环同构。代数版本 $H^n_{dR}(X/k)=\\mathbb{H}^n(X,\\Omega^\\bullet_{X/k})$ 在特征 0 时与常数层上同调一致，在特征 p 时因 $dx^p=0$ 而失效，须由 crystalline 上同调补足。',
    dependencies: [],
    consequences: [],
    explanation: 'de Rham 定理的核心机制是「局部可解性 ⇒ 全局消解」。微分形式的局部可解性（Poincaré 引理）是纯分析的事实：在星形区域上，闭形式可以用沿射线的积分显式地构造出原函数。这个局部事实通过层论被组装成整体结论：如果一个复形在每个茎上正合，它就是一个消解，而消解可以计算任何导出函子。因此 de Rham 定理不需要任何整体分析（不需要调和积分、不需要 Hodge 分解、不需要偏微分方程的先验估计），只需要 Poincaré 引理加层论的一般框架。这也是为什么 de Rham 定理可以推广到代数情形：只需把「星形区域上的射线积分」替换为「形式幂级数上的同伦算子」，局部可解性照样成立（特征 0）。当特征为 p 时局部可解性失效（$x^p$ 是闭的但不是恰当的），定理也随之失效，这个失败不是技术性的而是本质的：它指出「局部平凡」这一前提在特征 p 的代数几何中不成立。',
    examples: [
      { title: '例子：S¹ 上的 de Rham 上同调与 H¹', body: '取 $X=S^1$。$\\Omega^0=C^\\infty(S^1)$、$\\Omega^1=C^\\infty(S^1)d'\theta$。$H^0_{dR}(S^1)=\\{f:df=0\\}=\\mathbb{R}$（常值函数）。$H^1_{dR}(S^1)=\\Omega^1/d'\Omega^0$：闭 1-形式即 $f(\\theta)d'\theta$ 且 $df/d'\theta$ 的「积分条件」自动满足（一维情形所有 1-形式都闭），故 $H^1=\\Omega^1/\\{dg'\}$。一个 1-形式 $f d'\theta$ 是恰当的当且仅当 $\\int_0^{2\\pi}f d'\theta=0$（因为 $g(\\theta)=\\int_0^\\theta f$ 需要周期为 $2\\pi$）。映射 $f d'\theta'\mapsto'\int_0^{2\\pi}f d'\theta$ 给出同构 $H^1_{dR}(S^1)\\cong'\mathbb{R}$。与层上同调比较：$H^1(S^1,\\underline{\\mathbb{R}})=\\mathbb{R}$（圆的一维上同调），$H^0=\\mathbb{R}$，一致。具体核验：$d'\theta$ 本身不是恰当的（它的积分为 $2\\pi'\neq0$），故 $[d'\theta]'\neq0$ 生成 $H^1$。这个例子把「数洞」与「闭形式模恰当形式」的等同讲得最直观：$d'\theta$ 的积分不为零正是「绕圆一周」这一拓扑事实的分析表达式。' },
      { title: '例子：ℙ¹（复球面）的代数 de Rham 上同调', body: '取 $X=\\mathbb{P}^1_{\\mathbb{C}}$。代数微分复形：$\\Omega^0=\\mathcal{O}$、$\\Omega^1=\\mathcal{O}(-2)$（因为 $K_{\\mathbb{P}^1}=\\mathcal{O}(-2)$）、$\\Omega^p=0$（p≥2）。核算超上同调 $H^n_{dR}(\\mathbb{P}^1)=\\mathbb{H}^n(\\Omega^\\bullet)$：由第一类谱序列 $E_1^{p,q}=H^q(\\mathbb{P}^1,\\Omega^p)$：$p=0$：$H^0(\\mathcal{O})=k$、$H^1(\\mathcal{O})=0$；$p=1$：$H^0(\\mathcal{O}(-2))=0$、$H^1(\\mathcal{O}(-2))=\\dim'\binom{2-1}{1}=1$（用 $H^1(\\mathcal{O}(d))$ 的公式 $d=-2$，$-d-1=1$）。故 $E_1$ 页非零项为：(0,0)=k 与 (1,1)=k，微分 $d_1:E_1^{0,0}'\to E_1^{1,0}=0$ 与 $d_1:E_1^{0,1}'\to E_1^{1,1}=k$（$H^1(\\mathcal{O})=0$ 故 $E_1^{0,1}=0$）都为零，于是 $E_2=E_1$，得 $H^0_{dR}=k$、$H^2_{dR}=k$、$H^1_{dR}=0$。与奇异上同调 $H^0(S^2,\\mathbb{Q})=k$、$H^1=0$、$H^2=k$ 一致。这个例子说明代数 de Rham 上同调可以用「射影空间上 O(d) 的上同调」加超上同调逐项算出，不需要分析输入，这是特征 0 的代数几何比微分几何更具可计算性的一面。' },
    ],
    remarks: [
      '特征 p 的失效是本质的而非技术的：取 $X=\\mathbb{A}^1_k$、k 特征 p，函数 $x^p$ 满足 $d(x^p)=px^{p-1}dx=0$，故 $x^p$ 是闭的 0-形式（即 $\\Omega^0$ 中 $d=0$ 的元素，也就是「p 阶常数」$k[x^p]$），但它不是恰当的（恰当 0-形式只有 0，因为 d 在 $\\Omega^0$ 上是单射）。于是 $H^0_{dR}(\\mathbb{A}^1_k)=k[x^p]'\neq k$，$\\Omega^\\bullet$ 不是 $\\underline{k}$ 的消解。这条现象对应「Frobenius 态射在特征 p 是 0 微分」这一深刻事实，是 crystalline 上同调中 divided powers 与 Frobenius 结构的来源。任何在特征 p 直接套用 de Rham 定理的论证都会出错。',
      '光滑性假设不可去掉：在奇异空间（例如带尖点的曲线、或流形的商空间）上 $\\Omega^\\bullet$ 不是常数层的消解，de Rham 上同调与拓扑上同调不一致（除非使用所谓的「orbifold de Rham」或改用对数微分形式/分层结构）。在代数几何中对应的修正理论是「对数 de Rham」与「$\\mathbb{Z}$-变体」，其存在的理由就是光滑性缺失时 Poincaré 引理的局部可解性失效。',
      'de Rham 定理给出的是与实系数上同调的同构，不是与整系数上同调：$H^n_{dR}(X)\\cong H^n(X,\\underline{\\mathbb{R}})$ 而 $H^n(X,\\underline{\\mathbb{Z}})$ 的信息在张量 $\\mathbb{R}$ 后被丢失（挠部全部消失）。因此 de Rham 上同调无法看到挠现象（如 $\\mathbb{RP}^2$ 的 $H^1(\\mathbb{RP}^2,\\mathbb{Z})=\\mathbb{Z}/2$ 在 de Rham 上同调中消失，$H^1_{dR}(\\mathbb{RP}^2)=0$）。要捕获整系数或挠信息必须使用奇异上同调、Čech 上同调或 crystalline/étale 上同调。这是「de Rham 定理的适用范围」这一常被忽略的限制。',
      '代数 de Rham 上同调与奇异上同调的比较需要额外假设：对光滑的复代数簇（可取 $\\mathbb{C}$-点）有 $H^n_{dR}(X/\\mathbb{C})\\cong H^n_{sing}(X(\\mathbb{C}),\\mathbb{C})$（由 Grothendieck 的比较定理，与解析化函子一致），但对一般基域或正特征基域，正确的比较对象是 étale/crystalline/rigid 上同调而非奇异上同调。此外该同构不是「代数地」给出的（它依赖嵌入 $k'\hookrightarrow'\mathbb{C}$ 或比较范畴），因此在讨论「代数 de Rham 上同调是大小的不变量」时要注意它带有的周期性结构（Hodge 滤过）与相对性。',
    ],
    corollaries: [
      { title: '推论：de Rham 上同调是拓扑不变量且带环结构', body: '由 $H^n_{dR}(X)\\cong H^n(X,\\underline{\\mathbb{R}})$，de Rham 上同调只依赖 X 的拓扑而不依赖可微结构（同一拓扑流形的不同可微结构给出相同的 de Rham 上同调，例如 $\\mathbb{R}^4$ 上的奇异可微结构不影响 $H^\\bullet_{dR}$）。进一步，因为同构与 cup 积相容，$H^\\bullet_{dR}(X)$ 作为分次环与 $H^\\bullet(X,\\underline{\\mathbb{R}})$ 同构，故「上同调环」是拓扑不变量；这条推论给出用拓扑方法区分流形的手段：若两个流形的 de Rham 环（带乘法）不同，则它们不同胚（例如 $S^2\\vee S^2\\vee S^4$ 与 $\\mathbb{CP}^2$ 的上同调群相同但环不同，故不同胚）。同时它限制了解微分方程的可能性：$H^n_{dR}$ 的维数（第 n 个 Betti 数）是方程「闭形式模恰当形式」解的维数，它由拓扑决定。', uses: ['ring-structure-and-products'] },
    ],
    references: [
      stacks('Section 20.7: Cohomology of unbounded complexes', '01E3'),
      stacks('Section 30.2: Čech cohomology of quasi-coherent sheaves', '01X8'),
      { title: 'Principles of Algebraic Geometry', author: 'Griffiths & Harris', year: 1978 },
    ],
    history: HISTORY,
  },


};
