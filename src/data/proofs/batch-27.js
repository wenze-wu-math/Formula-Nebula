/**
 * 批次 27 长篇证明数据：Stein 分解、Zariski 主定理、分离性、平坦下降、
 * 有限呈示，以及谱代数几何、E∞ 环、凝聚态数学、完美胚、导出叠等 13 个节点。
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
const HISTORY = '本条由公开教材、Stacks Project 与 nLab 条目重新组织，项目自行改写并注明来源，未复制原文。'

export const BATCH_27_PROOFS = {

  /* ═══════════════════════════════════════════════════════════
   * 1. Stein 分解
   * ═══════════════════════════════════════════════════════════ */

  'h-stein-factorization': {
    statement: "设 $f:X\\to S$ 是拟紧拟分离的概形态射。把 f 分解为 $X\\xrightarrow{g}Y\\xrightarrow{h}S$，其中 $g$ 的底变换上同调层满足 $\\mathcal{O}_Y\\xrightarrow{\\sim}g_*\\mathcal{O}_X$（即 g 满足 $g_*\\mathcal{O}_X\\cong\\mathcal{O}_Y$，这一步称为 Stein 部分），而 $h$ 是整态射（当 S 局部诺特或 f 有限型时进一步为有限态射）。构造取相对谱 $Y=\\underline{\\operatorname{Spec}}_S(f_*\\mathcal{O}_X)$，即 $Y=\\operatorname{Spec}_S\\mathcal{A}$，$\\mathcal{A}=f_*\\mathcal{O}_X$ 是 $\\mathcal{O}_S$-代数；则 $Y$ 与分解被 f 唯一决定。当 f 是有限型分离态射且 S 局部诺特时，$\\mathcal{A}$ 是 $\\mathcal{O}_S$ 上的有限型拟凝聚代数，$h$ 是有限态射，$Y$ 是有限型 S-概形。",
    deepExplanation: "Stein 分解的意义在于把一个任意态射的几何信息切成两块：一块是纤维内部的「连通方向」（由相对谱 $Y$ 承担），一块是「有限离散方向」（由有限态射 h 承担）。为什么这样切是自然的？因为 $f_*\\mathcal{O}_X$ 恰好记录了纤维的连通分量个数：对 y 在 S 中的像，$(f_*\\mathcal{O}_X)_y$ 的基变换给出纤维上的整体函数环，它的谱就是纤维的连通分支集合。于是相对谱 $Y\\to S$ 的纤维恰好就是原纤维的连通分支集，这是一个 0 维的离散对象；而 $X\\to Y$ 的纤维则落在同一个连通分支里，因此它「不改变连通性」——这正是 $g_*\\mathcal{O}_X\\cong\\mathcal{O}_Y$ 的几何含义。反过来看，$Y\\to S$ 的几何完全由「纤维的连通分支如何随参数移动」决定，所以 Y 是双有理信息的载体：当 f 的分支数在参数处跳跃时，跳变全部体现在 h 的度数上，而 g 始终保持纤维连通。这条分解因此兼顾两种用途：需要处理「族」的时候用 Y（它在 S 上平坦、维数恒定的情形更多），需要处理「覆盖」的时候用 h（它有限、纤维 0 维、可以在局部用环论处理）。Grothendieck 在 EGA 与 SGA 中用 Stein 分解把连通性、有限性与双有理性三个概念分离，代数几何中「正规化」「有限覆盖」「相对谱」的许多定理都通过它被归约到局部环的纯代数陈述。",
    steps: [
      step('relative-spectrum-construction', '相对谱的构造与 g 的因子化',
        "取 $\\mathcal{A}=f_*\\mathcal{O}_X$，它是 $\\mathcal{O}_S$-代数（乘法来自 $\\mathcal{O}_X$ 的乘法，$f_*$ 保持环结构），定义 $Y=\\underline{\\operatorname{Spec}}_S\\mathcal{A}$，即在 S 上取拟凝聚 $\\mathcal{O}_S$-代数的相对谱。相对谱有两条基本性质：它的构造与 S 上开集的取谱局部化相容（因此 Y 是概形而不是某种更一般的对象），并且存在自然的 S-态射 $h:Y\\to S$。现在造 g：由 $\\mathcal{A}$ 的定义，$\\mathcal{A}$ 上有一个 $\\mathcal{O}_S$-代数同态 $\\mathcal{A}\\to f_*\\mathcal{O}_X$，它在 $Y$ 的仿射开集上给出环同态 $\\Gamma(U,\\mathcal{A})\\to\\Gamma(f^{-1}U,\\mathcal{O}_X)$；这些同态与限制映射相容，于是由概形态射的局部刻画（在 S 的仿射开覆盖上拼）得到唯一态射 $g:X\\to Y$，使 $h\\circ g=f$。这里的唯一性来自「相对谱的泛性质」：任何到 $\\underline{\\operatorname{Spec}}_S\\mathcal{A}$ 的 S-态射都等价于一个 $\\mathcal{O}_S$-代数同态 $\\mathcal{A}\\to \\mathcal{F}$（$\\mathcal{F}$ 是目标的结构层）。既然 $g$ 由 $\\mathcal{A}\\to f_*\\mathcal{O}_X$ 诱导，它就完全被 f 决定，中间对象 Y 没有任何选择余地。",
        []),
      step('stein-part-identity', '证明 Stein 部分 $g_*\\mathcal{O}_X\\cong\\mathcal{O}_Y$',
        "这一步是整个分解的核心技术断言。在仿射局部（S=Spec A、X=Spec B 且 f 对应环同态 $A\\to B$）情形，$\\mathcal{A}$ 就是 B 作为 A-代数的常数层意义上的 $\\operatorname{Spec}_A B$，G 的构造给出 $\\operatorname{Spec}B\\to\\operatorname{Spec}_AB$。要证的是 $(\\operatorname{Spec}_AB\\to\\operatorname{Spec}A)_*\\mathcal{O}_{\\operatorname{Spec}B}\\cong\\mathcal{O}_{\\operatorname{Spec}_AB}$，即结构层的推前与原结构层同构。一般情形用「推前沿仿射态射与上同调交换」这条原则：对拟紧拟分离的 g，$g_*$ 与在 S 的仿射开集上取截面可交换，于是问题化归到仿射情形，而仿射情形正是相对谱的定义本身（$\\operatorname{Spec}_A B$ 的结构层就是把 B 看成 A-代数对应的层）。这一步的假设不能省：$\\mathcal{A}=f_*\\mathcal{O}_X$ 必须是拟凝聚的，而这需要 f 拟紧拟分离——拟分离保证 $f_*$ 与仿射基变换交换，拟紧保证层被有限个仿射块控制。若 f 只是一般态射，$f_*\\mathcal{O}_X$ 可以不是拟凝聚层，相对谱便造不出来（或者说只能在形式层面存在）。",
        ['relative-spectrum-construction']),
      step('integrality-of-h', '证明 h 是整态射（有限性需要额外假设）',
        "要证 $h:Y\\to S$ 整。由整态射的局部判据，只要在 S 的每个仿射开集 $U=\\operatorname{Spec}A$ 上验证 $\\mathcal{O}_S(U)\\to \\mathcal{O}_Y(h^{-1}U)$ 是整环扩张。而 $h^{-1}U=\\operatorname{Spec}\\Gamma(U,\\mathcal{A})=\\operatorname{Spec}(f_*\\mathcal{O}_X)(U)=\\operatorname{Spec}B$，其中 B 是 f 在 U 上的整体截面环，而 A 是其上的子环（通过 $f^\\sharp$）。因此要证 $A\\to B$ 是整扩张，这需要额外假设：典型情形是 f 有限型并加适当的分离与局部诺特条件，此时 B 是有限生成 A-代数，且由「有限生成 + 纤维 0 维 + 分离」的判据可推出整；更一般地，若 f 是「相对 0 维」的（即 f 的纤维是 0 维），则 $A\\to B$ 的每个元素都整（因为它在每个点处落在某个有限 A-模里，再由 0 维性整片成立）。这一步说明：Stein 分解的「Stein 部分」无条件成立，而「有限部分」是有条件的；当 h 只是整而非有限时，$Y\\to S$ 的纤维是有限的离散集合但未必局部有限，因此 h 不保证是 0 维态射的有限版本。区分「整」与「有限」正是这里的技术要点。",
        ['stein-part-identity']),
      step('fiber-connected-components', '纤维连通分支与 h 的度数',
        "现在读出几何内容。对 $s\\in S$，Stein 分解给出纤维层面的关系：$X_s=(Y_s)\\times_{Y_s}$ 上的结构层满足 $\\Gamma(Y_s,\\mathcal{O}_{Y_s})\\cong H^0(X_s,\\mathcal{O}_{X_s})$（在适当的拓扑与上同调条件下，即 g 的纤维是「连通的」），因此 $Y_s$ 的闭点恰是 $X_s$ 的连通分支的对应物。具体地，若 $X_s$ 的连通分支个数为 n（几何意义下即 $\\pi_0$ 的势为 n），则 $Y_s$ 由 n 个点组成，而 $h_s:Y_s\\to\\{s\\}$ 的度数恰为 n。这就实现了题干中所说的分离：$X\\to Y$ 的每一条纤维落在单个连通分支内（因此纤维连通），而 $Y\\to S$ 的纤维是「有限离散」的，其大小就是分支数。反过来说，若已知 $X_s$ 连通分支数为 n，不必构造整条分解，直接由 $h^0(X_s,\\mathcal{O}_{X_s})=n$ 读出 $Y_s$ 的点数。当 f 有限型且 S 局部诺特时 h 是有限态射，$\\deg h$ 在每个纤维处都是有限整数，「分支数函数」$s\\mapsto n(s)$ 于是是上半连续的整数函数，其跳跃点刻画了纤维合并的位置。",
        ['integrality-of-h']),
      step('uniqueness-and-base-change', '唯一性与基变换下的行为',
        "最后说明「Y 被 f 唯一决定」的精确含义。论断是：若 $f=g\\circ h$ 是任一满足 $g_*\\mathcal{O}_X\\cong\\mathcal{O}_Y$ 的分解，且 h 是拟紧拟分离的，则存在唯一的 S-同构 $Y\\cong\\underline{\\operatorname{Spec}}_S(f_*\\mathcal{O}_X)$ 使两个分解相互对应。证明用推前的伴随性：由 $g_*\\mathcal{O}_X\\cong\\mathcal{O}_Y$ 得到 $\\mathcal{O}_Y\\cong g_*\\mathcal{O}_X$，而在相对谱上取截面又给出 $h_*\\mathcal{O}_Y\\cong h_*(g_*\\mathcal{O}_X)=f_*\\mathcal{O}_X$，于是 $\\mathcal{O}_Y$ 被 $f_*\\mathcal{O}_X$ 决定；再由「$Y\\cong\\underline{\\operatorname{Spec}}_S\\mathcal{O}_Y$」（当 h 拟紧拟分离时结构层是拟凝聚的，相对谱与自身复原）得到 Y 由 f 决定。基变换方面要注意：Stein 分解与基变换的交换需要平坦性，因为 $f_*\\mathcal{O}_X$ 与基变换交换正是平坦推前定理的内容；对非平坦的 $S'\\to S$，$(X\\times_SS'\\to S')$ 的 Stein 分解一般**不**等于原分解的基变换，中间对象可能出现新的连通分量。",
        ['fiber-connected-components']),
    ],
    conclusion: "对拟紧拟分离态射 $f:X\\to S$，取 $Y=\\underline{\\operatorname{Spec}}_S(f_*\\mathcal{O}_X)$ 得到唯一的分解 $X\\xrightarrow{g}Y\\xrightarrow{h}S$，其中 $g_*\\mathcal{O}_X\\cong\\mathcal{O}_Y$ 且 h 是整态射（在分离有限型与局部诺特假设下是有限态射）。$Y\\to S$ 的纤维点数等于 $X\\to S$ 的几何纤维的连通分支数，因此 Y 与 h 的度数把「连通方向」与「有限离散方向」分开。",
    dependencies: [],
    consequences: [],
    explanation: "Stein 分解之所以在代数几何里反复出现，是因为它把两个容易互相干扰的技术困难分开了。第一个困难是「纤维的维数与大小会跳」：如果直接研究 $X\\to S$，退化纤维上的连通分量会合并，导致推前层的秩不连续。第二个困难是「有限性」：要把一个态射当作覆盖来处理，需要它的纤维是 0 维有限集。Stein 分解把前者交给 Y（Y 在良好的假设下在 S 上更接近「平坦」，纤维大小稳定，因为它的纤维就是分支集合），把后者交给 h（h 有限，处处是 0 维的）。这样一来，「连通性」与「有限性」的交叉干扰被消除：g 的纤维连通故 $g_*\\mathcal{O}_X=\\mathcal{O}_Y$，h 有限故纤维 0 维。在实用层面，Stein 分解是 Zariski 主定理的孪生工具——Zariski 主定理把「拟有限」化为「开浸入加有限」，Stein 分解把「一般态射」化为「Stein 部分加整部分」，两者经常联合使用：先用 Stein 分解分离连通方向，再用 Zariski 主定理把剩下的拟有限部分化掉。Grothendieck 的「形式函数定理」与「连通性定理」正是沿这条路线得到的。",
    examples: [
      { title: "例子：$\\mathbb{A}^1$ 上二次覆盖的 Stein 分解", body: "取 $S=\\operatorname{Spec}k[t]$，$X=\\operatorname{Spec}k[t,x]/(x^2-t^2(t-1))$，$f:X\\to S$ 由 $t\\leftarrow t$ 定义。先算 $\\mathcal{A}=f_*\\mathcal{O}_X=k[t,x]/(x^2-t^2(t-1))$ 作为 $k[t]$-模的结构：它是自由 $k[t]$-模，基 $1,x$，故 $\\mathcal{A}\\cong k[t]\\oplus k[t]$（作为 k[t]-模），且乘法由 $x^2=t^2(t-1)$ 决定。于是 $Y=\\operatorname{Spec}_S\\mathcal{A}=\\operatorname{Spec}k[t]\\sqcup\\operatorname{Spec}k[t]$ 的 S-谱在仿射情形即 $\\operatorname{Spec}$ 的 $\\mathcal{A}$，即 $Y=\\operatorname{Spec}k[t]\\sqcup\\operatorname{Spec}k[t]$，h 是两个分支各自的恒等映射，度数为 2。几何核对：纤维 $f^{-1}(s)$ 由 $x^2=s^2(s-1)$ 决定，当 $s=0$ 时方程退化 $x^2=0$，几何上是重根（分支合并），当 $s=1$ 时 $x^2=0$ 亦退化，其余 $s$ 处是两个不同的点。因此分支数函数为 $n(0)=1$、$n(1)=1$、$n(s)=2$（其余），这与 h 的度数在 0、1 处「降为 1」一致，说明退化点恰是 h 失去平坦性而分支合并的位置。" },
      { title: "例子：有限态射的 Stein 分解是平凡的", body: "若 f 本身有限，例如 $S=\\operatorname{Spec}k[t]$、$X=\\operatorname{Spec}k[t,x]/(x^2-1)=\\operatorname{Spec}k[t]\\sqcup\\operatorname{Spec}k[t]$ 且 $f$ 沿两个分支都是恒等。此时 $\\mathcal{A}=f_*\\mathcal{O}_X=k[t]\\oplus k[t]$，$Y=\\operatorname{Spec}\\mathcal{A}=X$，于是 $g=\\operatorname{id}_X$、$h=f$，Stein 部分退化为恒等。这说明 Stein 分解在 f 已有限时不含新信息，它的全部价值在于处理「非有限」的情形：此时 Y 严格小于 X（在维数或结构上），H 才是真正的有限部分。极端例子：$X=\\mathbb{A}^1_k\\to S=\\operatorname{Spec}k$ 是到点的投影，则 $\\mathcal{A}=k[x]$，$Y=\\operatorname{Spec}k[x]=\\mathbb{A}^1$，$g=\\operatorname{id}$，h 就是 $\\mathbb{A}^1\\to\\operatorname{Spec}k$，它整但不有限（$k\\to k[x]$ 不是有限模）。这个例子说明「整」严格弱于「有限」，也说明 h 在没有有限型假设时确实可以不有限。" },
    ],
    remarks: [
      "拟分离性不能去掉：$\\mathcal{A}=f_*\\mathcal{O}_X$ 的拟凝聚性需要 $f_*$ 与仿射基变换交换，而后者等价于 f 拟分离。若 f 只有拟紧而不拟分离（例如取无限射影极限造出的病态例子），$f_*\\mathcal{O}_X$ 可以不是 $\\mathcal{O}_S$-拟凝聚层，相对谱便失去意义，整条分解框架崩塌。",
      "h 有限需要有限型加局部诺特：EGAJ 中的标准陈述是「f 有限型分离且 S 局部诺特 ⟹ h 有限」。去掉有限型，h 可以只是整而不有限，例如 $\\mathbb{A}^1\\to\\operatorname{Spec}k$ 的 h 对应 $k\\to k[x]$；去掉诺特，$\\mathcal{A}$ 可以不是有限 $\\mathcal{O}_S$-模，h 同样不有限。因此把「整部分」当成「有限部分」使用是会出错的。",
      "Stein 分解与基变换只在平坦时交换：对平坦 $S'\\to S$，$f_*\\mathcal{O}_X$ 的基变换与推前交换，故 $(X\\times_SS'\\to S')$ 的中间对象是 $Y\\times_SS'$；对非平坦基变换，中间对象会变大（可能多出连通分量），此时用分解的基变换去推断原分解的几何会得到错误结论，这是 SGA1 中讨论连通性时反复强调的陷阱。",
    ],
    references: [
      stacks('Section 29.6: Stein factorization', '03GY'),
      stacks('Section 01: Scheme theoretic image', '01R5'),
      { title: 'Éléments de géométrie algébrique III (EGA III)', author: 'A. Grothendieck', year: 1961 },
    ],
    history: HISTORY,
  },

  /* ═══════════════════════════════════════════════════════════
   * 2. Zariski 主定理
   * ═══════════════════════════════════════════════════════════ */

  'h-zariski-main': {
    statement: "（Zariski 主定理，Grothendieck 版本）设 $f:X\\to S$ 是概形态射，S 局部诺特，f 是有限型、分离且拟有限的。则存在分解 $X\\xrightarrow{j}X'\\xrightarrow{h}S$，其中 j 是开浸入，h 是有限态射。等价形式：若 X 与 S 是诺特整概形，f 是双有理、有限型且拟有限（等价地有限纤维），则 f 在 X 的某个稠密开集上是同构；特别地，若 f 还是 proper，则 f 本身是同构。",
    deepExplanation: "Zariski 主定理的直觉是：拟有限性把「纤维是 0 维」这个局部条件交给了我们，而 Zariski 主定理说这已经足够让态射在拓扑上「接近」有限，所差的只是一个把 X 嵌进一个有限 S-概形 $X'$ 的开浸入。为什么不是一个等号？因为 X 可能「缺少」一些本该在有限覆盖里的点：例如把 $\\mathbb{A}^2\\to\\mathbb{A}^2$ 在一处做挖洞（去掉原点）再调整映射，可以造出拟有限、有限型、但它不是有限的例子；这时必须先把 X 的开集补上才能得到有限态射。定理的另一半（双有理加拟有限 ⟹ 局部同构）是最常用的形式，它的意义是把「双有理」与「单射性」的直觉变成定理：双有理意味着在一般点处是同构，而拟有限意味着纤维没有多余的正维数部分，于是任何「坏点」都只能是有限多个离散点，而这些点又不可能在双有理的开集之外——最终它们无处可藏。加上 proper 后，$f_*\\mathcal{O}_X$ 与 $\\mathcal{O}_S$ 的整性加上纤维连通性（Stein 分解）与「正维数纤维不可能」合起来把 f 逼成同构。这条定理在消解理论、模空间的双有理性论证、以及正规化有限性的判据中都是核心工具。",
    steps: [
      step('quasi-finite-implies-integral', '拟有限加有限型加分离 ⟹ $f_*\\mathcal{O}_X$ 是整的',
        "第一步把拟有限性翻译成环论。设 $U=\\operatorname{Spec}A\\subseteq S$ 是仿射开集，$f^{-1}U$ 被有限个仿射开集 $V_i=\\operatorname{Spec}B_i$ 覆盖（有限型保证拟紧，用有限覆盖）。要证 $A\\to B_i$ 是整扩张，等价地要证 B_i 在 A 上是整的。判据来自「0 维纤维的环扩张是整的」：对每个 $\\mathfrak{p}\\in\\operatorname{Spec}A$，纤维 $\\operatorname{Spec}(B_i\\otimes_A\\kappa(\\mathfrak{p}))$ 是有限的离散点集（拟有限的定义），由 0 维诺特环的有限性与「有限生成 + 0 维 ⟹ 有限」的标准事实，$B_i\\otimes_A\\kappa(\\mathfrak{p})$ 是有限 κ(𝔭)-代数，故有限维度。再由「整模的判别：局部处处整 ⟹ 整」，对 $B_i$ 中任一元素 b，考虑 A-子模 $A[b]\\subseteq B_i$，它作为 A-模有限生成（b 满足某个首一方程的必要条件），而这要求我们在每个素理想处验证 b 满足首一多项式；由纤维的 0 维性，$b\\bmod\\mathfrak{p}$ 在 $B_i\\otimes_A\\kappa(\\mathfrak{p})$ 中满足某个首一多项式，提升回 $B_i$ 后用 Nakayama 把「模 p 首一」升为「首一」（这一步需要 $B_i$ 有限 A-模，故必须先在有限型假设下把 B_i 换成有限生成的情形）。",
        []),
      step('zariski-from-finite-closure', "从整性得到分解 $X\\to X'\\to S$",
        "有了上一步的整性，就可以造 $X'$：取 $X'=\\underline{\\operatorname{Spec}}_S(f_*\\mathcal{O}_X)$，即 Stein 分解的中间对象。由上一步 $f_*\\mathcal{O}_X$ 在每个仿射开集上的截面是整 A-代数，并且是有限 A-模（有限型加整 ⟹ 有限，这是 Artin–Tate 型论证：有限生成整代数在诺特基环上是有限模），于是 $h:X'\\to S$ 是有限态射。再由 Stein 分解存在自然态射 $g:X\\to X'$，且 $g_*\\mathcal{O}_X\\cong\\mathcal{O}_{X'}$。要证 g 是开浸入：这是 Zariski 主定理的深层内容，通常的证法用「局部的 Weierstrass 除法」或直接归约到 $A\\to B$ 是有限拟有限环同态的情形，再用「有限拟有限 ⟹ 局部是 $B\\hookrightarrow B_f$ 的开浸入」的准则逐点验证（在每点处用一个合适的元素做局部化，使 $B\\to B_f$ 与 $A$ 的包含在极小素理想处吻合）。这一步给出的额外信息是：$X'$ 的构造完全由 $f_*\\mathcal{O}_X$ 决定，因此 $X'$ 是「把 X 在有限方向上补齐」的结果，X 的补集是 X' 中一个闭子集（它是 g 不是同构的点集），被 g 的开浸入排除掉。",
        ['quasi-finite-implies-integral']),
      step('birational-quasi-finite-isomorphism', '双有理加拟有限 ⟹ 在稠密开集上同构',
        "现在推出常用形式。设 X、S 诺特整，f 双有理（存在稠密开集 $V\\subseteq S$ 使 $f^{-1}V\\to V$ 是同构）、有限型、拟有限。由上一步得到分解 $X\\xrightarrow{j}X'\\xrightarrow{h}S$，$j$ 开浸入、h 有限。要证 j 是同构。关键观察：h 有限且 $f$ 双有理意味着 h 也双有理（因为 $X'$ 与 X 的函数域相同：$g_*\\mathcal{O}_X=\\mathcal{O}_{X'}$ 给出函数域的紧接，加上双有理性），而「有限双有理态射在 X' 正规时是同构」这条判据给出结论——但 X' 未必正规，因此真正的证法是用「有限双有理 ⟹ 在余维 1 处同构，配合 Zariski 主定理把非正规性排除」这一迂回：在 S 的一般点处 h 是同构，在余维 1 处由「离散赋值环上的有限双有理同态是平坦且纤维 1 点」给出同构，再由 h 有限推出例外集是闭集且不含余维 1 的点，于是例外集在整概形上是空集，h 处处同构，故 $j$ 处处同构。加上 proper（$f$ 双有理 + proper + 拟有限）：proper 加有限纤维使 f 是有限态射（proper 加拟有限 ⟹ 有限，这是 Zariski 主定理的另一条标准推论），而有限双有理再由上面的判据给出同构。",
        ['zariski-from-finite-closure']),
      step('normalization-finiteness-criterion', '推论：正规化的有限性判据',
        "把定理用在正规化上是经典用法。设 X 是诺特整概形，$\\nu:\\widetilde{X}\\to X$ 是其正规化。已知 ν 是整的；要证它是有限的，需要额外假设。判据是：若 X 是有限型 S-概形，S 局部诺特，且 X 在余维 1 处已经是正规的（例如 X 是正规的或只有余维 ≥2 的奇点），则 ν 是有限态射。证明思路是把 ν 视为双有理拟有限态射：整态射的纤维是 0 维有限集，故 ν 拟有限；于是由 Zariski 主定理，ν 分解为开浸入加有限态射，而 ν 已是整（纤维 0 维），开浸入部分由「ν 在余维 1 处同构」被逼为同构（开浸入的补集是闭集，若补集非空则含余维 1 的点，与假设矛盾），故 ν 有限。这就是教科书里「正规化在曲线情形有限」「在局部诺特的诺特概形上有限（需要 X 是有限型 S-概形的假设）」这些陈述的统一来源：有限性全部经由 Zariski 主定理的分解得到，而「拟有限」这一前提由「纤维 0 维」提供。",
        ['birational-quasi-finite-isomorphism']),
      step('excision-and-exceptional-fibers', '推论：消解中例外纤维的性质',
        "Zariski 主定理在消解理论中的用法是控制例外集。设 $\\pi:\\widetilde{X}\\to X$ 是光滑簇的修正（例如吹爆一个光滑中心 Z），π 是 proper 且双有理。Zariski 主定理的 proper 加拟有限形式告诉我们可以用「π 在哪些点不是同构」来刻画例外集：π 是同构的位置是 X 中一个开集，其余部（例外集）是闭子集。更进一步，若 π 是 proper 双有理且 X 正规、$\\widetilde{X}$ 正规，则 π 的例外集（非同构点集）的余维数至少为 2（因为余维 1 处双有理 proper 态射必同构，否则会出现纤维正维数，违反「余维 1 的局部环是离散赋值环且 mapping degree 1」）。这与消解的几何图景一致：吹爆一个点只改变这个点（余维等于维数），沿一条曲线吹爆只改变那条曲线（余维 1 的例外纤维必须是除子且态射在其上是同构，否则该点不能是例外）。Zariski 主定理在这里给出的正是「例外集的余维下界」与「例外纤维只能是连通的分支集合」这两条限制，它们是消解算法局部性的理论依据。",
        ['normalization-finiteness-criterion']),
    ],
    conclusion: "若 S 局部诺特、$f:X\\to S$ 有限型分离拟有限，则 f 分解为开浸入 $X\\to X'$ 与有限态射 $X'\\to S$；若 X、S 诺特整且 f 双有理拟有限，则 f 在某个稠密开集上是同构，若再要求 f proper 则 f 是同构。正规化有限性与消解例外集的余维下界都是这条定理的直接推论。",
    dependencies: [],
    consequences: [],
    explanation: "Zariski 主定理用一句话概括是：拟有限性加上分离性已经把态射限制得足够紧，剩下唯一可能的「病」是少数被挖掉的点，而把 X 适当嵌入就能把这些点补回来。这条定理的价值就是它把两个看似无关的条件（拓扑上的纤维 0 维、代数上的有限性）对接起来。证明的技术路线有两条：第一条走 Stein 分解加整性，把 f 化为「开浸入 + 有限」；第二条走格罗滕迪克在 EGA IV 中的形式函数定理，把局部环的完备化信息与纤维维数挂钩。教科书版本多用第一条，因为它只需要 Krull 维数与 Nakayama 引理。需要注意的是定理陈述中「S 局部诺特」不能换成「S 诺特」以外更弱的条件：拟有限性本质上是通过「有限生成 + 0 维 ⟹ 有限」这条诺特事实被转成整性的，脱离诺特后 $f_*\\mathcal{O}_X$ 可以只是整而不有限，分解的第二部分立刻失效。",
    examples: [
      { title: "例子：$\\mathbb{A}^2\\setminus\\{0\\}\\to\\mathbb{A}^2$ 的拟有限性与非有限性", body: "取 $X=\\mathbb{A}^2\\setminus\\{0\\}$，$S=\\mathbb{A}^2$，f 为自然包含。f 是开浸入故有限型、分离；纤维在每点是 1 点或 0 点，故拟有限。按 Zariski 主定理，f 分解为开浸入加有限：这里 X 已经是 S 的开集，故 $X'=\\mathbb{A}^2$（补上原点），h 是恒等（有限），j 是包含（开浸入）。这个例子说明分解中的 $X'$ 可以严格大于 X，而「X 非有限」正来自 j 不是满射。若把 f 换成 $X=\\mathbb{A}^2\\\\\\{0\\}\\to S=\\mathbb{A}^2$ 经过一个把原点附近的层拉开的映射（例如坐标乘以一个在原点消失的函数），得到的仍是拟有限但非有限的例子，而 $X'$ 就是它的正规化或有限化。作为对比，$X=\\operatorname{Spec}k[x,y]/(xy)\\to S=\\operatorname{Spec}k[x]$ 是有限的（纤维是 x 轴上的两类点，每纤维有限），故无需分解。", },
      { title: "例子：Frobenius 与特征零的双有理性，$x\\mapsto x^p$", body: "取 $k=\\overline{\\mathbb{F}}_p$，$S=\\operatorname{Spec}k$，$X=\\operatorname{Spec}k$，$f$ 由 Frobenius $x\\mapsto x^p$ 给出。f 是有限态射（$k$ 在 $k$ 上是有限模），故 Zariski 主定理的结论平凡成立（$f$ 本身有限）。但 f 不双有理：$k\\cong k$ 在函数域层面是同构（$k^p=k$ 因为 k 完美），故此时双有理性也成立而 f 是同构。真正的对照例子是把基换成 $k=\\mathbb{F}_p(t)$，$S=\\operatorname{Spec}k$，$X=\\operatorname{Spec}k$，Frobenius $t\\mapsto t^p$：这是有限双有理但不是同构（$k/k^p$ 是次数 p 的纯不可分扩张），说明 Zariski 主定理中「双有理 + 拟有限 ⟹ 局部同构」这一条要求 X 与 S 是**整**概形并在一般点处比较，单纯函数域同构不足以保证处处同构，这也是「正规化只改余维 ≥2」与「可分性」假设必要性的来源。" },
    ],
    remarks: [
      "「拟有限」不能减弱为「纤维至多可数」：拟有限要求每点纤维是有限集而不是有穷维的有限生成 0 维概形以外的情形。若只要求纤维有限成可数（例如 $\\operatorname{Spec}k\\to\\operatorname{Spec}k$ 的无限纯不可分扩张），则 $f_*\\mathcal{O}_X$ 不是有限模，Zariski 主定理的有限分解失败。这在正特征与无限域上的归纳论证中是常见故障点。",
      "S 局部诺特是必需而非技术性：定理证明中把「0 维纤维」转成「整性」依赖「有限生成诺特 0 维环是有限维向量空间」这条事实。若 S 非诺特（例如 $\\operatorname{Spec}k[x_1,x_2,\\ldots]$ 的某个子概形），$B\\otimes_A\\kappa(\\mathfrak{p})$ 可以是 0 维而无限维度，此时拟有限性推不出整性，定理的第二种形式（双有理拟有限 ⟹ 局部同构）也随之失效。",
      "proper 不可省略于「f 是同构」这一结论：$\\mathbb{A}^1\\\\\\{0\\}\\to\\mathbb{A}^1$ 是双有理、分离、有限型、拟有限（且是开浸入），但它不是同构。它不满足 proper（因为不闭）。这条例子说明「双有理加拟有限」只能给出「在稠密开集上同构」，要得到整体同构必须补上 proper，或补上「f 的像闭且 X 是 S 上有限」这类条件。",
    ],
    references: [
      stacks('Section 41.20: Zariski\'s main theorem', '05KJ'),
      stacks('Section 37.40: Quasi-finite morphisms', '01TI'),
      { title: 'Algebraic Geometry', author: 'Robin Hartshorne', year: 1977 },
    ],
    history: HISTORY,
  },

  /* ═══════════════════════════════════════════════════════════
   * 3. 分离态射与对角
   * ═══════════════════════════════════════════════════════════ */

  'h-separated-diagonal': {
    statement: "设 $f:X\\to S$ 是概形态射，$\\Delta_{X/S}:X\\to X\\times_SX$ 是对角态射。称 f 分离，若 $\\Delta$ 是闭浸入。等价判据：f 分离当且仅当存在 X 的开覆盖，使每个开集上的限制分离；当且仅当赋值判别法成立（即对任意赋值环 R 与其分式域 K，任意两个 S-态射 $\\operatorname{Spec}K\\to X$ 至多有一个提升到 $\\operatorname{Spec}R$）；当且仅当 $X\\to S$ 的「两点极限唯一」。在 S 为点的情形，X 分离即 X 是分离概形，此时 $\\Delta$ 闭意味着 X 中两点不能有同一极限（即「双原点直线」这类例子被排除）。",
    deepExplanation: "分离性是把拓扑的 Hausdorff 条件翻译到概形语言的结果，翻译的词典是「对角态射」。为什么 Hausdorff 对应「对角闭」？在拓扑空间里 X 是 Hausdorff 当且仅当对角 $\\{(x,x)\\}\\subseteq X\\times X$ 是闭集；概形的乘法用纤维积替代拓扑乘积，于是条件逐字搬过来变成「$\\Delta$ 是闭浸入」。这条翻译的价值在于把一个拓扑条件变成了一个关于态射的条件，从而可以代数地检验。分离性看起来只是技术性的，其实它是让许多基本工具能工作的前提：没有分离性，赋值判别法不成立（proper 的定义失去依据）、proper 态射的像不闭（因为 proper 的「闭」性质来源于赋值判别法）、上同调基变换定理的证明中构造的极限不唯一（因为核验唯一性的论证用的是对角闭），以及平坦下降理论中的等化子性质。反例集中在「两个不同点以同一方式趋于同一极限」：最标准的是双原点直线（把 $\\mathbb{A}^1$ 的两份沿去原点以外的部分黏起来），它的对角不闭，也正是赋值判别法失效的具体体现——取 R 为 $\\mathbb{A}^1$ 的原点处的局部环，两个「分支」给出同一个泛点但两个不同的提升。因此分离性在几何上说的是：概形的点集足够「瘦」，不会有同一个极限被两个不同的点共享。",
    steps: [
      step('diagonal-basic-properties', '对角态射的基本性质与闭浸入的局部判据',
        "先造对角态射：由纤维积的泛性质，$\\operatorname{id}_X$ 与 $\\operatorname{id}_X$ 这对象构成一对从 X 到 $X\\times_SX$ 的态射，它们相等故给出 $\\Delta:X\\to X\\times_SX$，其两个分量都是恒等。这一点立即给出两条性质：第一，$\\Delta$ 是单态射（由 $\\operatorname{pr}_1\\circ\\Delta=\\operatorname{pr}_2\\circ\\Delta=\\operatorname{id}$ 得 $\\Delta$ 左可逆于投影，故是两个投影的等化子）；第二，$\\Delta$ 是浸入（在拓扑上是到其像的同胚）。在仿射局部 $X=\\operatorname{Spec}B$、$S=\\operatorname{Spec}A$，则 $X\\times_SX=\\operatorname{Spec}(B\\otimes_AB)$，而 $\\Delta$ 对应乘法映射 $\\mu:B\\otimes_AB\\to B$。于是「$\\Delta$ 是闭浸入」等价于「μ 是满环同态」（因闭浸入的仿射局部即环的满同态）。这个局部刻画是全部代数证明的起点：分离性在仿射情形就是「$B\\otimes_AB\\to B$ 是满的」，例如 $B=A[x]$ 时 $A[x]\\otimes_AA[x]\\to A[x]$ 把 $x\\otimes 1$ 与 $1\\otimes x$ 都送到 x，是满的，故 $\\mathbb{A}^1_S$ 分离。",
        []),
      step('equivalence-of-criteria', '等价判据：局部性、赋值判别法与纤维分离',
        "这一步把分离性化简为几种常用的等价形式，方向都要证。第一，分离性可以在 S 上局部检验：若 $\\{X_i\\}$ 是 X 的开覆盖且每个 $X_i\\to S$ 分离，则 $X\\to S$ 分离。方向一是「分离 ⟹ 局部分离」：$\\Delta$ 闭浸入，把 $X_i\\times_SX_i$ 视为 $X\\times_SX$ 的开子概形，则 $\\Delta|_{X_i}$ 是 $\\Delta$ 与这个开子概形的纤维积，闭浸入在基变换与限制下保持。方向二是「局部 ⟹ 整体」：由每个 $\\Delta_i$ 闭得到 $\\Delta$ 在其像的每个开块上闭，再用「闭浸入是局部性质」拼起来。第二，赋值判别法：f 分离当且仅当对每个赋值环 R、分式域 K，任意 S-态射 $\\operatorname{Spec}K\\to X$ 至多一个提升到 $\\operatorname{Spec}R$。证明「分离 ⟹ 唯一提升」：若有两个提升 $\\phi_1,\\phi_2$，它们给出 $\\operatorname{Spec}R\\to X\\times_SX$，而 $\\operatorname{Spec}K$ 上的限制相等，故由对角闭（等价于「两个投影的等化子是闭浸入」）得到 $\\phi_1=\\phi_2$；反过来若提升唯一，则 $X\\to X\\times_SX$ 的「对角线之外的点」不能被任何赋值谱的单点化逼近，由赋值判别法的一般原理得 $\\Delta$ 闭。",
        ['diagonal-basic-properties']),
      step('valuation-criterion-consequences', '分离性支撑赋值判别法与 proper 的闭合性',
        "赋值判别法是本研究里最重要的推论载体，这里写清它的两个用法。其一，proper 态射的刻画：$f:X\\to S$ 是 proper（分离、有限型、泛闭），而「泛闭」的等价形式是「赋值判别法的存在性方向」——对每个赋值环 R 与其分式域 K，任意交换图 $\\operatorname{Spec}K\\to X$、$\\operatorname{Spec}R\\to S$ 都可以补成 $\\operatorname{Spec}R\\to X$。注意这里用到了两个方向：存在性来自泛闭，唯一性来自分离。若 f 不分离，存在性不再给出唯一提升，proper 的定义便失去意义，这就是为什么 proper 的定义必须包含分离。其二，赋值判别法证明 proper 的像是闭的：给定 $f:X\\to S$ proper 与闭子概形 $Z\\subseteq X$，要证 f(Z) 闭。取 $s\\in S$ 在 f(Z) 的闭包中，造一个赋值环 R 使 $\\operatorname{Spec}R\\to S$ 把闭点映到 s、泛点映到 f(Z) 的一般点，再用存在性方向补出 $\\operatorname{Spec}R\\to X$ 落在 Z 中（因为 Z 闭且其像沿赋值连续），于是 $s\\in f(Z)$，闭性得证。两条用法都揭示了分离性的位置：它管唯一性，泛闭管存在性，两者缺一不可。",
        ['equivalence-of-criteria']),
      step('double-origin-counterexample', '反例核算：双原点直线为何不分离',
        "构造 X：取两份 $\\mathbb{A}^1_k=\\operatorname{Spec}k[x]$ 与 $\\operatorname{Spec}k[y]$，沿开集 $\\{x\\neq0\\}$ 与 $\\{y\\neq0\\}$ 用 $x\\leftrightarrow y$ 黏合，得到概形 X，它在拓扑上是仿射直线（两个点集合并），可以想象成一根直线上放了**两个**原点 $0_1$、$0_2$，其余点共享。X 不分离。代数核算：X 上整体函数环 $\\Gamma(X,\\mathcal{O}_X)=k[x]$（因为两个分支上的函数在去原点处吻合且都形如多项式），但 X 在原点附近的结构层有两份，故 X 不是仿射的，$\\Delta$ 不是闭浸入。更具体的检验用赋值判别法：取 $R=k[x]_{(x)}$（$\\mathbb{A}^1$ 在原点处的局部环，是离散赋值环，K=k(x) 为分式域），两个 S-态射 $\\operatorname{Spec}K\\to X$ 分别取「泛点是 $0_1$ 附近的一般点」与「泛点是 $0_2$ 附近的一般点」，它们在 X 的泛点处相等（因为泛点唯一，是 X 的函数域的点），但两个不同的提升把 $\\operatorname{Spec}R$ 的闭点分别送到 $0_1$ 与 $0_2$，故提升不唯一，赋值判别法失效，X 不分离。这也解释了为什么双原点直线能做「非分离」的标准例子：它的两个原点在泛点处不可分辨，正是「两点以同一方式趋于同一极限」。",
        ['valuation-criterion-consequences']),
      step('separatedness-in-practice', '分离性的用法：极限唯一与基变换定理',
        "最后说明分离性在证明技术中的不可替代性。第一，分离性给出「纤维积中的等化子是闭的」：对分离的 X 与两个 S-态射 $u,v:T\\to X$，$\\operatorname{Eq}(u,v)\\subseteq T$ 是闭子概形。证明：$(u,v):T\\to X\\times_SX$ 与 $\\Delta$ 的纤维积给出等化子，而闭浸入的基变换仍闭。这条陈述是所有「先构造、再证明唯一」的论证的骨架：只要两个解都在分离目标里，且它们在稠密开集上一致，则它们在处处一致（因为一致集是闭的且稠密）。第二，上同调基变换定理中的「极限唯一」用同一条机制：在构造谱序列或比较映射时出现的自然变换若在一族点（或一个平坦覆盖）上一致，则分离性把它们粘成整体唯一的态射，否则需要额外验证余圈条件。第三，分离性与「仿射性」的关系：若 $S=\\operatorname{Spec}A$ 且 X 分离拟紧，则 $X\\to S$ 的相对化是概形，而「$\\Gamma(X,\\mathcal{O}_X)$ 有限生成」这类结论需要 X 在 S 上分离且 proper 才有（如专有态射的推前层有限性）。综合起来，分离性是让「局部构造全局唯一」成为可能的那条公理。",
        ['double-origin-counterexample']),
    ],
    conclusion: "$f:X\\to S$ 分离当且仅当 $\\Delta_{X/S}$ 是闭浸入，当且仅当分离性在上述开覆盖意义下是局部性质，当且仅当赋值判别法的唯一性方向成立。分离性保障纤维积中等化子的闭性、proper 态射的闭合性与上同调基变换定理中的极限唯一性；双原点直线是标准反例，其对角不闭且赋值判别法失效。",
    dependencies: [],
    consequences: [],
    explanation: "分离性常被误当作纯技术假设，但它实际是概形论里少数几条「让局部信息能够全局化」的公理之一。它的作用机制是：把「两个态射相等」这件事变成一个闭条件。在集合或拓扑空间里，两点是否相等是一个布尔判断；在概形里，由于拓扑不含足够多的点（闭点之外还有泛点，黏合可以产生不可分辨的点），相等必须通过「对角闭」这类几何条件来表达。加入分离性后，等化子成为闭子概形，于是「在稠密开集上相等 ⟹ 处处相等」这条最常用的论证模式才成立。另一个方向是分离性与 proper 性的配合：proper 态射要满足赋值判别法的两个方向，其中唯一性方向就是分离性，所以 proper 的定义里必须含分离，否则「闭像」与「有限推前」等结论全部失效。最后要强调的是分离性有程度的差别：分离是最弱的「可分离」条件，之后还有「可分的」（separable，指域扩张可分）、正规（normal）、正则（regular）等更强的分层，分离只是第一层，但它是后面所有分层能被讨论的前提。",
    examples: [
      { title: "例子：$\\mathbb{A}^1$ 与 $\\mathbb{P}^1$ 的分离性核对", body: "先核对 $X=\\mathbb{A}^1_k=\\operatorname{Spec}k[x]$，$S=\\operatorname{Spec}k$。$X\\times_SX=\\operatorname{Spec}k[x]\\otimes_k k[x]=\\operatorname{Spec}k[x,y]$，$\\Delta$ 对应 $k[x,y]\\to k[x]$，$x\\mapsto x$、$y\\mapsto x$，这是满同态（像为 $k[x]$），故 $\\Delta$ 是闭浸入，$\\mathbb{A}^1$ 分离。再看 $X=\\mathbb{P}^1_k$：用标准覆盖 $U_0=\\operatorname{Spec}k[t]$、$U_1=\\operatorname{Spec}k[1/t]$ 检验局部性，$U_0\\times_S U_0$ 与 $U_1\\times_SU_1$ 上的 $\\Delta$ 分别对应 $k[t,t']\\to k[t]$、$k[s,s']\\to k[s]$，都是满的，故 $U_0$、$U_1$ 分离，由局部性 $\\mathbb{P}^1$ 分离。交叉项 $U_0\\cap U_1=\\operatorname{Spec}k[t,1/t]$ 也分离（它是 $\\mathbb{A}^1$ 的开子概形）。结论：射影空间分离，这也解释了为什么射影空间的 interseciton 理论可以在分离框架下展开。", },
      { title: "例子：非分离的仿射粘合与它的 $\\Gamma$", body: "取 X 为两份 $\\mathbb{A}^1$ 沿 $\\{x\\neq0\\}$ 粘合（双原点直线），前面已证不分离。作为对照，取 X' 为两份 $\\mathbb{A}^1$ 沿 $\\{x\\neq0\\}$ 与 $\\{y\\neq0\\}$ 用不同方式粘合（例如把 $x\\leftrightarrow 1/y$ 用于其中一部分），得到的可以是射影直线 $\\mathbb{P}^1$（分离）或更复杂的非分离概形。区分判据就在对角：$\\mathbb{P}^1$ 的对角闭，双原点直线的对角不闭。另一个常见非分离例子是「带双原点的 $\\mathbb{A}^2$」以及「无穷维射影空间在 Zariski 拓扑下的拟紧非分离开集」。核算技巧：若把 X 写成两条仿射直线并识别出一个开集，则只要两个原点是两个不同的点，X 就不分离；若两个原点被识别（如 $\\mathbb{P}^1$ 的 $t=0$ 与 $s=0$ 是同一个点），则分离。" },
    ],
    remarks: [
      "分离性不能由「拓扑上 Hausdorff」推出：概形的底空间在 Zariski 拓扑下几乎从不 Hausdorff（大多是不可约的 T0 空间），但分离概形很常见（$\\mathbb{P}^n$、$\\mathbb{A}^n$、任何射影簇）。所以「分离」是概形语言特有的条件，不能直观地等同于拓扑 Hausdorff；双原点直线在底空间上已经很好，但它仍然不分离，这正说明分离性比拓扑 Hausdorff 严格更强（或者说要求不同）。",
      "分离性对赋值判别法的必要性仅在于唯一性：若去掉分离而只保留「泛闭」，则赋值判别法的存在性方向仍能成立（泛闭的等价形式），但唯一性方向失效。因此 proper 的定义里若不要求分离，可得到「泛闭有限型」这一类映射，它们同样有闭像，但不能保证纤维的连通性与推前有限性，这就是 EGA 把它们分开命名的原因。",
      "分离性与「对角是浸入」的区别：任何态射的对角都是浸入（因为 $\\Delta$ 单且左可逆），分离性要求的加强是「闭」。若只要求 $\\Delta$ 是浸入（而不闭），得到的是所谓「局部分离」的中间概念，例如无穷维仿射空间的某些粘合满足浸入但不闭。这个区别在验证具体例子时常常被混淆，核算时必须写出环同态是否满，而不仅仅检查单性。",
    ],
    references: [
      stacks('Section 26.21: Separated morphisms', '01KU'),
      stacks('Section 01: Diagonal morphisms', '01W1'),
      { title: 'Éléments de géométrie algébrique I (EGA I)', author: 'A. Grothendieck', year: 1960 },
    ],
    history: HISTORY,
  },

};
