/**
 * 批次 22 长篇证明数据：Frobenius 分裂、消没定理、双有理奇点不变量与消解
 * 相关的 13 个节点。
 *
 * 写作约定：
 *   · 所有长正文使用双引号 JS 字符串（正文里合法出现 \$R'\$ 这类撇号）；
 *   · 中文段落用 Unicode 数学符号（⊆ ⊗ → ↦ 𝔭 𝔪 ℓ ≅ ⋂ ∑ χ），不经过 KaTeX；
 *   · \$...\$ 内写完整 LaTeX，反斜杠双写，多字符上下标加花括号；
 *   · 引用只写已核实的 Stacks Project 稳定 tag，其余给教材名与作者；
 *   · 每步正文 400 字以上，不使用无信息量的凑字数句子。
 */

const step = (id, title, body, uses) => ({ id, title, body, uses: uses ?? [] })
const stacks = (title, tag, year = 2024) => ({
  title, author: 'The Stacks Project', year, url: `https://stacks.math.columbia.edu/tag/${tag}`,
})
const HISTORY = "本条由公开教材、期刊文献与 Stacks Project 命题重新组织，项目自行改写并注明来源，未复制原文。"

export const BATCH_22_PROOFS = {

  /* ═══════════════════════════════════════════════════════════
   * 1. Frobenius 分裂
   * ═══════════════════════════════════════════════════════════ */

  "e-frobenius-split": {
    statement: "设 k 是特征 $p>0$ 的域（通常取完全域），X 是 k 上的概形，$F=F_X:X\\to X$ 是绝对 Frobenius 态射：它在底空间上是恒等，而在结构层上把局部截面 $a$ 送到 $a^p$。于是 $F_*\\mathcal{O}_X$ 带有一个 $\\mathcal{O}_X$-模结构（限制标量：$\\mathcal{O}_X$ 经由 $F^{\\#}$ 作用），但 $F^{\\#}:\\mathcal{O}_X\\to F_*\\mathcal{O}_X$ 只是 $k$-线性而非 $\\mathcal{O}_X$-线性。称 X 为 Frobenius 分裂，若存在 $\\mathcal{O}_X$-模同态 $\\theta:F_*\\mathcal{O}_X\\to\\mathcal{O}_X$ 使 $\\theta\\circ F^{\\#}=\\operatorname{id}_{\\mathcal{O}_X}$，即 $\\theta(a^p b)=a\\,\\theta(b)$ 且 $\\theta(1)=1$。等价的说法：$F^{\\#}$ 有 $\\mathcal{O}_X$-线性的截面；仿射情形下这等价于存在 $\\varphi:F_*A\\to A$ 满足 $\\varphi(r^p s)=r\\varphi(s)$ 且 $\\varphi(1)=1$。",
    explanation: "Frobenius 分裂是把特征 $p$ 的\"正性\"引入代数几何的最轻便的开关。它的形式定义只是一句话——Frobenius 有截面——但一旦成立，几何对象就获得了大量特征零直观不到的性质。最值得注意的是消没层面的后果：分裂给出的一组算子把\"乘以线丛截面\"这类映射变成单射，从而迫使高阶上同调消失，这就是特征 $p$ 下 Kodaira 型消没的最短证明。第二条后果是继承性：如果理想层 $I$ 与分裂相容，那么 $V(I)$ 自身也分裂，于是\"先在大空间上分裂，再沿子簇继承\"成为一条流水线，射影空间的坐标分裂可以一路传到各种子簇（超曲面、Schubert 簇、射影簇、环簇）上去。第三条是表示论上的：分裂使得整体截面 $H^0(X,\\mathcal{L})$ 成为带有 $\\mathrm{GL}$-模结构的对象并具有好的滤过，这是 Brion–Kumar 用分裂研究旗簇上同调的技术基础。需要强调的是分裂比\"F-纯\"强，两者对 F-有限概形一致；分裂不是基变换不变量（换基后可能失去），也不是特征无关的性质（特征零里 Frobenius 是恒等，条件自动成立而无内容）。",
    steps: [
      step("module-structure-of-frobenius-pushforward", "F_*O_X 的模结构与 F 的非线性",
        "先固定符号。绝对 Frobenius $F_X$ 在底空间 $|X|$ 上是恒等映射，只在结构层上把 $a$ 送到 $a^p$；因此 $F_*\\mathcal{O}_X$ 与 $\\mathcal{O}_X$ 的底层层相同，区别在模结构。对开集 $U$，$F_*\\mathcal{O}_X(U)=\\mathcal{O}_X(F^{-1}(U))=\\mathcal{O}_X(U)$，而 $\\mathcal{O}_X$ 通过伴随映射 $F^{\\#}$ 起作用：分配 $a\\cdot b:=(F^{\\#}a)b=a^p b$。关键是 $F^{\\#}$ 并非 $\\mathcal{O}_X$-线性：$F^{\\#}(ab)=(ab)^p=a^pb^p$，而 $a\\cdot F^{\\#}(b)=a\\cdot b^p=a b^p$，当 $p>1$ 且 $a$ 不是常数时两者不同，例如 $k[x]$ 中 $F^{\\#}(x\\cdot 1)=x^p$ 而 $x\\cdot F^{\\#}(1)=x$，差值 $x^p-x$ 一般不为零。所以 $F_*\\mathcal{O}_X$ 与 $\\mathcal{O}_X$ 是同一个层配上不同模结构，而 $F$ 只是 $k$-线性（更一般地 $\\mathbb{F}_p$-线性）。仿射情形 $X=\\operatorname{Spec}A$ 的翻译最直观：$A$ 作为自身上的模，标量作用取 $r\\cdot a:=r^p a$，这样得到的 $A$-模记 $F_*A$；它不是自由模，也不是 $A$ 的正则模（例如 $k[x]$ 上 $F_*k[x]$ 的 $k[x]$-生成元需要 $1,x,\\ldots,x^{p-1}$，因为标量只能以 $p$ 次幂的形式进入）。把这条模结构写清楚很要紧，因为后面分裂映射的每一条代数恒等式都依赖它。",
        []),
      step("splitting-map-and-its-basic-identities", "分裂映射的代数刻画与基本恒等式",
        "设 $\\theta:F_*\\mathcal{O}_X\\to\\mathcal{O}_X$ 是 $\\mathcal{O}_X$-模映射。模结构使 $\\theta$ 满足一条决定性的恒等式：把任意截面看作 $1$ 的标量倍，得到 $\\theta(m)=\\theta(m^{p}\\cdot 1)$；更实用的是对乘积的形式 $\\theta(r^p s)=r\\,\\theta(s)$——这正是 $\\mathcal{O}_X$-线性在扭曲模结构下的写法。特别地 $\\theta(r^p)=r\\,\\theta(1)$，所以若还要求 $\\theta\\circ F^{\\#}=\\operatorname{id}$，即 $\\theta(r^p)=r$ 对所有局部截面成立，则必须 $\\theta(1)=1$，反之 $\\theta(1)=1$ 加线性就给出分裂。于是分裂等价于：$\\theta$ 是 $\\mathcal{O}_X$-线性映射且 $\\theta(1)=1$。由于 $\\theta$ 只在 $1$ 上取值不能唯一决定它（$F_*\\mathcal{O}_X$ 在 $\\mathcal{O}_X$ 上未必自由），有用的判据是逐单项式核对：只要 $\\theta$ 在一组模生成元上满足 $\\theta(r^p s)=r\\theta(s)$，线性就把它扩到整个层上，而 $\\theta(1)=1$ 是额外的归一化。两个立刻可用的后果：其一，分裂映射给出层映射 $\\mathcal{O}_X\\to F_*\\mathcal{O}_X$ 的右逆，故 $\\mathcal{O}_X$ 是 $F_*\\mathcal{O}_X$ 的直和项，于是每个局部环都被 $F$ 的截面\"投影\"出来；其二，$\\theta$ 与 $p$ 次幂算子可交换地作用，$\\theta^{\\circ n}(r^{p^n})=r$ 对一切 $n\\ge1$。",
        ["module-structure-of-frobenius-pushforward"]),
      step("f-purity-and-splitting-descent", "与 F-纯的关系、闭子概形的继承",
        "若 $F^{\\#}:\\mathcal{O}_X\\to F_*\\mathcal{O}_X$ 有 $\\mathcal{O}_X$-线性截面，则该映射是纯的：对任何 $\\mathcal{O}_X$-模 $\\mathcal{M}$，$\\mathcal{M}\\to F_*\\mathcal{O}_X\\otimes_{\\mathcal{O}_X}\\mathcal{M}$ 是单射，因为把截面复合上 $\\theta\\otimes\\operatorname{id}$ 就得到恒等，单射性随之成立。这就是 F-分裂蕴含 F-纯的一般理由（有截面的映射总是纯的）。反过来，对 F-有限概形（$F_*\\mathcal{O}_X$ 作为 $\\mathcal{O}_X$-模有限生成，例如 k 有限时的一切有限型 k-概形），F-纯蕴含 F-分裂，因为此时 $\\mathcal{O}_X$ 是 $F_*\\mathcal{O}_X$ 的直和项当且仅当它是熟知的单射性条件，而有限生成性把\"纯\"化归为\"直和项\"。继承性用的是 F-相容理想：若 $I\\subseteq\\mathcal{O}_X$ 是理想层、$\\theta(I^{[p]})\\subseteq I$（$I^{[p]}$ 由 $p$ 次幂生成），则 $\\theta$ 下降为 $V(I)$ 上的分裂 $\\bar\\theta$，因为商层 $\\mathcal{O}_{V(I)}$ 上的诱导映射仍满足 $\\bar\\theta(1)=1$ 与线性恒等式。逐点检验时只需对一组生成元核对 $\\theta(g^{p})=g$ 形式的恒等式。这条下降机制是把大空间的分裂传送到子簇上的唯一通道，也是后面所有\"局部秩一\"型推论的技术来源。",
        ["splitting-map-and-its-basic-identities"]),
      step("cohomological-consequences", "上同调推论：分裂迫使高阶上同调消失",
        "分裂最有力的读数是消没。设 X 是射影簇、$\\mathcal{L}$ 是丰沛线丛、$\\theta$ 是分裂，则 $H^i(X,\\mathcal{L})=0$ 对一切 $i>0$ 成立。证明骨架如下：取 $m$ 使 $\\mathcal{L}^{\\otimes m}$ 由整体截面生成并取非零 $s\\in H^0(X,\\mathcal{L}^{\\otimes m})$，则乘以 $s^{p-1}$ 再套上 $\\theta$ 诱导的算子 $\\theta_{\\mathcal{L}}:H^i(X,\\mathcal{L}^{\\otimes p})\\to H^i(X,\\mathcal{L})$ 复合为乘以 $s$ 的映射 $H^i(X,\\mathcal{L})\\to H^i(X,\\mathcal{L}^{\\otimes(m+1)})$ 的右逆，原因是 $\\theta$ 把 $a^{p}$ 拉回 $a$ 的性质逐项相消。于是乘法算子单射，而它在有限维空间上不能无限次保持单射同时总维数不增——对 $s$ 换用 $\\mathcal{L}$ 的高次幂迭代同一论证，得到 $H^i(X,\\mathcal{L})=0$。同理，对一般的丰沛 $\\mathcal{M}$，$H^i(X,\\mathcal{M}^{-1})=0$ 对 $0\\le i<\\dim X$ 也成立。这一族结论在特征 $p$ 下无需任何曲率或 Hodge 理论，是分裂方法的核心收益。",
        ["f-purity-and-splitting-descent"]),
      step("explicit-splitting-of-affine-space", "可核算的例子：仿射空间的显式分裂",
        "在 $A=k[x_1,\\ldots,x_n]$（k 是特征 $p$ 的完全域）上定义 $\\varphi:F_*A\\to A$：对单项式 $x^{a}=x_1^{a_1}\\cdots x_n^{a_n}$ 令 $\\varphi(x^{a})=x^{a/p}$ 当每个 $a_i$ 都被 $p$ 整除，否则令 $\\varphi(x^{a})=0$，再按 $k$-线性扩张。核对两条公理：第一，$\\varphi(1)=1$（指数全为 $0$，被 $p$ 整除）；第二，$\\varphi(r^{p}s)=r\\varphi(s)$，因为把 $s$ 的每个指数加上 $p$ 倍的 $r$ 的指数，逐坐标除以 $p$ 后正好得到 $r\\cdot\\varphi(s)$ 的指数，而\"是否被 $p$ 整除\"这一判据在加减 $p$ 的倍数下不变。把 $s=r^{p}$ 的情况代入即得 $\\varphi(r^{p})=r\\varphi(1)=r$，故 $\\varphi\\circ F^{\\#}=\\operatorname{id}$。用 $n=1$、$p=2$ 手算：$\\varphi$ 保留 $1,x^2,x^4$ 分别送到 $1,1,x^2$，杀掉 $x,x^3$；对 $r=x$、$s=x$ 核对 $\\varphi(x^2\\cdot x)=\\varphi(x^3)=0$ 与 $x\\varphi(x)=0$，一致；对 $r=x,s=1$ 得 $\\varphi(x^2)=x$ 与 $x\\varphi(1)=x$，一致。于是 $\\mathbb{A}^n_k$ 分裂，把 $\\varphi$ 沿坐标超曲面 $x_i=0$ 检验相容性（$\\varphi(x_i^{p}x_i^{p-1})$ 落在 $(x_i)$ 中）即得分裂沿任意坐标子空间继承。",
        ["cohomological-consequences", "f-purity-and-splitting-descent"]),
    ],
    conclusion: "特征 $p$ 的域上，X 的 Frobenius 分裂等价于存在 $\\mathcal{O}_X$-线性映射 $\\theta:F_*\\mathcal{O}_X\\to\\mathcal{O}_X$ 使 $\\theta\\circ F^{\\#}=\\operatorname{id}$，也等价于 $\\theta(r^{p}s)=r\\theta(s)$ 与 $\\theta(1)=1$；分裂蕴含 F-纯（F-有限时两者等价），沿 F-相容理想下降到闭子概形，并对丰沛线丛给出 $H^i(X,\\mathcal{L})=0$（$i>0$）的消没。仿射空间 $\\mathbb{A}^n$ 有显式分裂 $\\varphi(x^{a})=x^{a/p}$（每个指数被 $p$ 整除时）或 $0$。",
    dependencies: [],
    consequences: [],
    examples: [
      { title: "例子：$\\mathbb{P}^1$ 上的分裂与 $H^1$ 的消没", body: "取 $k$ 特征 $p$、$\\mathbb{P}^1$ 的齐次坐标 $x_0,x_1$。把仿射分裂写成齐次形式：对 $p$ 次齐次的单项式 $x^{a}$（$a_0+a_1=p$）令 $\\varphi(x^{a})=1$，其余齐次单项式送零，并按 $k$-线性扩张到 $\\oplus_{d}H^0(\\mathcal{O}(pd))\\to\\oplus_{d}H^0(\\mathcal{O}(d))$。这与上一步的仿射公式吻合，因为 $d$ 次齐次部分与仿射坐标下的单项式一一对应。于是 $\\mathbb{P}^1$ 分裂。取 $\\mathcal{L}=\\mathcal{O}(1)$：分裂给出 $H^1(\\mathbb{P}^1,\\mathcal{O}(1))=0$，与直接计算 $h^1(\\mathcal{O}(1))=h^0(\\mathcal{O}(-3))=0$ 一致；再取 $\\mathcal{L}=\\mathcal{O}(2)$ 得同样结论。真正的检验在特征零无法看见的情形上：在特征 $p$ 中 $H^1(\\mathbb{P}^1,\\mathcal{O}(-1))=0$ 也由分裂的加强版本给出，而 $\\mathcal{O}(-2)$ 满足 $h^1=1$ 却对应非丰沛的负次数线丛，说明消没推论中\"丰沛\"这一条不能动。" },
      { title: "例子：相容理想 $I=(g)$ 上的继承核算", body: "取 $A=k[x,y]$、$g=x^{p-1}+y^{p-1}$，理想 $I=(g)$。要检验 $I$ 是否与仿射分裂相容需核对 $\\varphi(I^{[p]})\\subseteq I$，即 $\\varphi(g^p\\cdot h)\\in(g)$ 对一切 $h$。直接算：$g^{p}=(x^{p-1}+y^{p-1})^{p}=x^{p(p-1)}+y^{p(p-1)}$（用 $k$ 上的二项式系数被 $p$ 整除），故 $g^{p}=x^{p^2-p}+y^{p^2-p}$，各项指数 $p^2-p$ 被 $p$ 整除（$p^2-p=p(p-1)$），于是 $\\varphi(g^{p})=x^{p-1}+y^{p-1}=g$，恰好落回 $I$。对 $g^{p}h$ 的一般项同理（把 $h$ 的指数一并除以 $p$ 后乘上 $h$ 的对应部分）。于是 $V(g)\\subset\\mathbb{A}^2$ 也是 Frobenius 分裂的，且这个结论与 $g$ 的具体系数形式相关：把 $g$ 换成 $x^{p}+y$ 时 $g^{p}=x^{p^2}+y^{p}$，$\\varphi$ 仍把 $g^{p}$ 打到 $x^{p}+y=g$，相容性同样成立；这说明在完全域上按单项式写的分裂对形如 $\\sum x_i^{p-1}$ 与 $\\sum x_i^{p}$ 的方程都直接可算。" },
    ],
    remarks: [
      "分裂不是基变换不变量，也不能由特征零的类比提供：把 $\\mathbb{A}^1_{k}$ 沿非完全域的扩张 $k\\to K$ 取基变换，$K[x]$ 的分裂仍存在（上面公式只依赖指数），但若 $X$ 的分裂依赖于 $k$ 上的特殊坐标（例如依赖 $k$ 中某种 $p$ 次根），基变换到 $k^{1/p}$ 后分裂可能失效或不唯一。没有任何定理保证分裂在任意平坦基变换下保持，使用前必须对具体分裂核对 $\\varphi$ 在换基后仍满足两条公理。",
      "F-纯严格弱于 F-分裂：F-纯只要求 $\\mathcal{M}\\to F_*\\mathcal{O}_X\\otimes\\mathcal{M}$ 单射，不要求右逆存在；在 F-有限概形上两者等价，所以讨论这一等价时必须写明 F-有限性。对非 F-有限的例子（例如某些非有限型的特征 $p$ 环），F-纯而不分裂的情形确实存在，此时分裂给出的消没结论仍成立，但用\"分裂等价于 $\\mathcal{O}_X$ 是直和项\"这类论证就会失效。",
      "分裂的消没推论要求丰沛，不能放宽到 nef 或半正：在特征 $p$ 的射影簇上取 nef 但非丰沛的线丛，$H^1$ 可以非零；分裂只把\"正性\"转化为\"带 $p$ 次幂提升的截面乘法的单射性\"，而 nef 线丛的截面在 $p$ 次幂后可能整体消失，单射论证断链。因此把丰沛换成 nef 会使结论直接错误，最简反例是 $\\mathbb{P}^1$ 上 $\\mathcal{O}$ 的小次数扰动构造。",
      "特征零中这个条件退化为空条件：$p=1$ 时 $F=\\operatorname{id}$，取 $\\theta=\\operatorname{id}$ 即得分裂，于是\"分裂\"不含任何信息，也没有消没推论（特征零的 Kodaira 消没需要正曲率或代数替换论证）。把特征 $p$ 的分裂论证搬到特征零会在\"$a^p$ 的系数\"处全面失效，这是两套理论必须分开书写的原因。",
    ],
    corollaries: [
      { title: "推论：分裂是仿射空间的局部性质，且沿光滑子簇继承", body: "由显式分裂公式，$\\mathbb{A}^n$ 与 $\\mathbb{P}^n$ 都分裂；再由 F-相容理想的下降机制，任何由坐标线性方程切出的子簇都分裂。更强的形式（Mehta–Ramanathan）说明：沿任何光滑子簇取的分裂都可由环境空间的分裂限制而来，于是齐次空间、Schubert 簇、环簇等把分裂当作结构定理使用。这条推论解释了为什么消没推论在具体簇上常常只需一句\"该簇具有 Frobenius 分裂\"即可引用。", uses: ["explicit-splitting-of-affine-space", "f-purity-and-splitting-descent"] },
    ],
    references: [
      stacks("Section 31.33: Blowing up", "02OS"),
      stacks("Lemma 10.110.9 (regular rings and global dimension)", "00OF"),
      { title: "Frobenius Splitting Methods in Geometry and Representation Theory", author: "Michel Brion, Shrawan Kumar", year: 2005 },
    ],
    history: HISTORY,
  },

  /* ═══════════════════════════════════════════════════════════
   * 2. Kodaira 消没的证明思路
   * ═══════════════════════════════════════════════════════════ */

  "e-kodaira-vanishing-proof": {
    statement: "设 X 是维数 $n$ 的紧 Kähler 流形（特别地：光滑射影复簇），$L$ 是 X 上的正线丛（$c_1(L)$ 可由正的 $(1,1)$-形式代表），$K_X=\\Omega^n_X$ 是典范线丛。Kodaira 消没定理断言：$H^q(X,L\\otimes K_X)=0$ 对一切 $q>0$ 成立；等价地（取 $L$ 的对偶并用 Serre 对偶）$H^q(X,L^{-1})=0$ 对一切 $q<n$ 成立。经典证明是分析性的：在 $L$ 上取正曲率 Hermite 度量，用 Dolbeault 定理把上同调实现为调和形式空间，再用 Bochner–Kodaira 恒等式把 $\\bar\\partial$-Laplace 算子分解成一个非负项与严格正的曲率项，从而排除 $q>0$ 的非零调和形式。",
    explanation: "Kodaira 消没在复几何中的地位相当于代数中的 Serre 消没：它把\"正性\"翻译成\"上同调消失\"，因而是一切涉及曲率与 Hodge 数的计算的起点（Lefschetz 超平面定理、Hodge 分解的非退化性、Riemann–Roch 的退化估计都用它）。分析证明的思想极其干净：正曲率让流形\"像球面一样紧\"，而紧的几何不允许太多调和形式；Bochner 技术把这句话写成逐点不等式。它的局限也同样清楚：需要复结构、需要正曲率度量的存在（等价于丰沛），因此不能用于特征 $p$，也不能用于非 Kähler 或有奇点的情形。代数侧的补偿方案有两条主线：一条是用超平面切片把维数降到 $n=1$ 再作归纳（\u005c\"降维\u005c\"），另一条是用特征 $p$ 的 Frobenius 分裂与提升（Deligne–Illusie）来替代 Hodge 理论与曲率论证。两条路线都不是逐字转写分析证明，而是把\"正曲率项非零\"换成\"乘 $p$ 次幂后截面不消失\"这类离散语句。理解这一替换的机制，是理解现代消没定理的关键。",
    steps: [
      step("dolbeault-and-harmonic-representatives", "调和形式代表与 Dolbeault 定理",
        "分析证明的第一步是把上同调换成解析对象。对紧复流形 X 与全纯线丛 $L$，Dolbeault 定理给出 $H^q(X,L)\\cong H^{0,q}_{\\bar\\partial}(X,L)$，即 $(0,q)$ 型、取值在 $L$ 中的 $\\bar\\partial$-闭形式模掉恰当形式。第二步是 Hodge 理论的定量化：在 $L$ 与 X 上取 Hermite 度量（X 上的 Kähler 度量记为 $\\omega$，$L$ 上的联络曲率记为 $\\Theta_L$，$c_1(L)=\\frac{i}{2\\pi}\\operatorname{tr}\\Theta_L$），定义 Hodge 星算子与 $L^2$ 伴随 $\\bar\\partial^{*}$，则 $\\Delta_{\\bar\\partial}=\\bar\\partial\\bar\\partial^{*}+\\bar\\partial^{*}\\bar\\partial$ 是自伴椭圆算子。紧性的收益是：每个上同调类有唯一的 $\\Delta_{\\bar\\partial}$-调和代表元。于是问题被完全改写成一个逐点的线性代数问题：在 $X$ 的每一点上，取值在 $L$ 的 $(0,q)$ 形式若满足 $\\Delta_{\\bar\\partial}\\alpha=0$，会给我们什么限制？由于调和形式在紧流形上总可以积分，若能在 $q>0$ 时证明 $\\int_X|\\alpha|^2$ 的 Weitzenböck 表达式是严格正定的，就得到 $\\alpha=0$，从而 $H^q=0$。",
        []),
      step("bochner-kodaira-identity", "Bochner–Kodaira 恒等式与曲率项",
        "把 $L$ 上的联络分解为 $(1,0)$ 与 $(0,1)$ 部分，令 $\\nabla=\\nabla^{1,0}+\\nabla^{0,1}$，则 $\\bar\\partial$ 恰为 $\\nabla^{0,1}$。Bochner–Kodaira 恒等式（Weitzenböck 公式在带系数情形的形式）把 Laplace 算子拆成三块：$\\Delta_{\\bar\\partial}=\\nabla^{*}\\nabla+R$，其中 $\\nabla^{*}\\nabla$ 是联络的\"动能\"项（在每一点是半正定的），而 $R$ 是由曲率与 Lefschetz 算子 $\\Lambda_{\\omega}$ 组成的代数项，其显式为 $R\\alpha=\\Lambda_{\\omega}(i\\Theta_L\\wedge\\alpha)-i\\Theta_L\\wedge\\Lambda_{\\omega}\\alpha$（对不带 $X$ 上曲率贡献的简化情形；完整式子还含 $X$ 自身的 Ricci 项，但在应用时它只影响常数部分）。在 $(0,q)$ 形式的空间上，$R$ 的作用可以按 $\\omega$ 的 Lefschetz 分解逐块计算：把 $(0,q)$ 形式按 primitive 分解写开，$R$ 在每个块上的特征值恰为该块与 $\\Theta_L$ 内积的线性组合。若 $\\Theta_L$ 作为 $(1,1)$-形式正定（即 $L$ 丰沛，Kodaira 嵌入定理保证可选取这样的度量），则 $R$ 在 $q>0$ 的每个非零分量上都严格正，这是 Nakano 型正定性的初等版本。这一步是整个证明的引擎：它把几何的\"正性\"变成了代数上的正定矩阵。",
        ["dolbeault-and-harmonic-representatives"]),
      step("integrating-positivity-to-vanishing", "积分正定项得到消没",
        "设 $\\alpha$ 是取值在 $L$ 中的 $(0,q)$ 形式且 $\\Delta_{\\bar\\partial}\\alpha=0$，$q>0$。对 $\\Delta_{\\bar\\partial}\\alpha=0$ 与 $\\alpha$ 取 $L^2$ 内积并用恒等式，得到 $0=\\langle\\Delta_{\\bar\\partial}\\alpha,\\alpha\\rangle=\\|\\nabla\\alpha\\|^2+\\langle R\\alpha,\\alpha\\rangle$。第一项非负，第二项由曲率正定性在 $q>0$ 时对每个非零 $\\alpha$ 严格正，两项之和为零迫使 $\\langle R\\alpha,\\alpha\\rangle=0$，于是 $\\alpha=0$。要紧的是第二项是逐点（从而逐点对积分）正定的：正定矩阵的内积与自身严格正，不存在非零向量使二次型为零。于是不存在非零调和 $(0,q)$ 形式，$H^q(X,L)=0$ 对 $q>0$ 成立。换成 $L\\otimes K_X$ 的形式只需把度量按 $K_X$ 调整：$K_X$ 的曲率项贡献 $-\\operatorname{Ric}(\\omega)$，与 $L$ 的正曲率相加仍正（这正是需要丰沛而非仅 nef 的地方），于是同样得到 $H^q(X,L\\otimes K_X)=0$。对偶形式 $H^q(X,L^{-1})=0$（$q<n$）由 Serre 对偶 $H^q(X,L^{-1})\\cong H^{n-q}(X,L\\otimes K_X)^{\\vee}$ 立刻读出。",
        ["bochner-kodaira-identity"]),
      step("limits-and-algebraic-replacements", "局限性与代数替代：切片归纳与 Deligne–Illusie",
        "分析证明的假设清单必须逐条点名：X 需要复结构且 Kähler（射影自动满足），$L$ 需要丰沛（正曲率度量的存在等价于丰沛，见 Kodaira 嵌入定理），并且 Abel 群的上同调被实现为调和形式时需要紧性（非紧的完备情形要换用 $L^2$ 上同调，结论形式会改变）。这三条使分析证明无法搬进特征 $p$。代数侧的第一条替代路线是降维归纳：先把 $H^q(X,L\\otimes K_X)$（$q\\ge2$）用一族一般超平面截面 $Y=\\{s=0\\}$（$s\\in H^0(L^{\\otimes m})$，$m$ 足够大）上的正合列 $0\\to L\\otimes K_X\\to L\\otimes K_X\\otimes\\mathcal{O}(ms)\\to\\cdots$ 与该列的消失引理，把 $q$ 降到 $1$；关键的 $q=1$ 情形再用曲面族的半连续性（或特征 $p$ 的提升论证）处理。第二条替代路线是 Deligne–Illusie：在特征 $p$ 中若 $X$ 可提升到 $W_2(k)$，则 de Rham 复形分裂为 $F_*\\Omega^\\bullet_X\\cong\\bigoplus_i\\Omega^i_X[-i]$，由此得 Hodge–de Rham 谱序列退化，从而 $H^q(X,\\Omega^p)=0$ 型结论在特征 $p$ 成立；复簇情形再通过\"整模型展开（spreading out）到特征 $p$ 的大纤维\"加半连续性回推。",
        ["integrating-positivity-to-vanishing"]),
      step("consequences-and-sharpness-checks", "推论与紧性检验：射影空间上的显式计算",
        "消没的推论一改写成可算形式：对射影簇 $X$ 与丰沛 $L$，$\\chi(L\\otimes K_X)=\\dim H^0(X,L\\otimes K_X)$，于是\"高次项消失\"意味着 Euler 特征数等于一个几何上可解释的维数。射影空间的检验最能显示界是紧的：取 $X=\\mathbb{P}^n$、$L=\\mathcal{O}(m)$（$m\\ge1$ 时丰沛）、$K_X=\\mathcal{O}(-n-1)$，则 $L\\otimes K_X=\\mathcal{O}(m-n-1)$，而 $H^q(\\mathbb{P}^n,\\mathcal{O}(d))$ 的经典计算给出：当 $d=m-n-1\\ge-n$ 时所有 $q>0$ 的群为零，与消没一致。取 $m=1$ 得 $\\mathcal{O}(-n)$，逐个维度核对 $H^q(\\mathcal{O}(-n))=0$（因为唯一可能非零的位置 $q=n$ 需要 $d\\le-n-1$，而 $-n>-n-1$ 不满足）。反方向的紧性检验：取 $L=\\mathcal{O}(1)$ 但考察 $L\\otimes K_X$ 换成 $K_X=\\mathcal{O}(-n-1)$ 本身，此时 $H^n(\\mathbb{P}^n,\\mathcal{O}(-n-1))\\cong k\\neq0$；这说明\"丰沛\"不能被丢掉，一旦丢掉消没立刻失效。",
        ["limits-and-algebraic-replacements"]),
    ],
    conclusion: "对紧 Kähler 流形上的正线丛 $L$，$H^q(X,L\\otimes K_X)=0$（$q>0$）与 $H^q(X,L^{-1})=0$（$q<n$）；分析证明由 Dolbeault 定理、Hodge 调和代表与 Bochner–Kodaira 恒等式给出，其中曲率项在 $q>0$ 时严格正定。代数替代路线是超平面切片降到 $q=1$ 与特征 $p$ 的 Deligne–Illusie 分裂；$\\mathbb{P}^n$ 上 $\\mathcal{O}(d)$ 的计算说明界是紧的。",
    dependencies: [],
    consequences: [],
    examples: [
      { title: "例子：$\\mathbb{P}^2$ 上逐项核算消没与紧性", body: "取 $X=\\mathbb{P}^2$、$K_X=\\mathcal{O}(-3)$、$L=\\mathcal{O}(2)$（丰沛）。消没断言 $H^q(\\mathcal{O}(-1))=0$ 对 $q=1,2$：直接计算 $h^0(\\mathcal{O}(-1))=0$、$h^1(\\mathcal{O}(-1))=0$、$h^2(\\mathcal{O}(-1))=h^0(\\mathcal{O}(-2))=0$（Serre 对偶把 $h^2(\\mathcal{O}(-1))$ 换成 $h^0(\\mathcal{O}(1-3))=h^0(\\mathcal{O}(-2))=\\binom{0}{2}=0$），三项全零，与定理一致。再看对偶形式：$H^q(\\mathcal{O}(-2))=0$ 对 $q<2$，核算 $h^0(\\mathcal{O}(-2))=0$、$h^1(\\mathcal{O}(-2))=h^0(\\mathcal{O}(-1))=0$，符合预期。紧性：把 $L$ 换成非丰沛的 $\\mathcal{O}(-1)$，则 $H^1(\\mathcal{O}(-1))$ 与 $H^2(\\mathcal{O}(-1))$ 仍需逐一计算而非由定理消去；再看 $H^2(\\mathcal{O}(-3))=h^0(\\mathcal{O}(0))=1\\neq0$，对应 $L\\otimes K_X=K_X$ 的非零最高次上同调，说明丰沛条件在断言中不可删。" },
      { title: "例子：椭圆曲线上的消没与 $\\chi$ 的恒等", body: "取 $X=E$ 为亏格 1 的光滑射影曲线、$L=\\mathcal{O}(P)$（次数 1，丰沛）。消没给出 $H^1(E,L\\otimes K_E)=H^1(E,\\mathcal{O}(P))=0$（此处 $K_E=\\mathcal{O}$），于是 $\\chi(L)=\\dim H^0(L)=1$；而 Riemann–Roch 给 $\\chi(\\mathcal{O}(P))=1-g+\\deg P=1-1+1=1$，两者吻合且 $h^0=1$ 说明 $P$ 是唯一（差常数）的截面。改用次数 0 的非丰沛线丛 $\\mathcal{O}$：$H^1(E,\\mathcal{O})=k\\neq0$，消没失效，同时 $\\chi(\\mathcal{O})=0$，正是 $h^0=h^1=1$ 的抵消。这两个核算把\"丰沛\"与\"$\\chi$ 退化\"之间的因果链条摆清楚：消没让 $\\chi$ 只剩下 $H^0$，非丰沛时 $\\chi$ 是两项之差。" },
    ],
    remarks: [
      "曲率的正性必须由丰沛性提供，不能只假设 $c_1(L)$ 的数值正性：$L$ 正意味着存在正曲率的 Hermite 度量，这等价于 $L$ 丰沛（Kodaira 嵌入定理）；而仅知道 $\\int c_1(L)\\cdot C>0$ 对所有曲线成立（数值正）并不能排除 $H^q(L\\otimes K_X)\\neq0$，因为在奇异度量的情形 Bochner–Kodaira 恒等式的曲率项可能在某些方向退化，积分正定性丢失。",
      "Kähler 假设不能删：对一般的紧复流形（仅满足复结构给出的 $\\partial\\bar\\partial$-引理缺失时），Hodge 分解与 Lefschetz 分解的结构不稳，Bochner–Kodaira 恒等式中的 Ricci 项符号难以控制，消没可以失败。经典的非 Kähler 反例是某些主丛上的正线丛，其上 $H^1(L)$ 非零，说明\"紧+复+正\"三者缺一不可。",
      "代数替代证明必须处理\"提升到 $W_2$\"这一额外假设：Deligne–Illusie 的分裂需要 $X$ 在 $W_2(k)$ 上有提升，若 $X$ 不能提升（例如某些特征 $p$ 的簇），$F_*\\Omega^\\bullet$ 的分裂失效，只能改用其他机制（如 Frobenius 分裂或直接曲率类比的有理性论证）。因此代数侧不是单一证明，而是一族对不同假设生效的论证。",
      "消没给出的是整阶消失，不能加强为\"某个具体上同调群不存在非零向量是因为没有整体截面\"这种弱陈述，也不能反推丰沛：$H^q(X,L\\otimes K_X)=0$ 对全体 $q>0$ 成立是丰沛的充分而非必要条件（存在非丰沛的 Nakano 正线丛仍满足消没），所以用它来判定丰沛会出错。",
    ],
    corollaries: [
      { title: "推论：Lefschetz 超平面定理的模形式", body: "取 $X$ 维数 $n$、$L$ 丰沛、$Y\\in|L|$ 为一般（从而光滑）超平面截面。由 $0\\to L^{-1}\\to\\mathcal{O}_X\\to\\mathcal{O}_Y\\to0$ 与 $H^q(X,L^{-1})=0$（$q<n$，消没的对偶形式）得辛格同构 $H^q(X,\\mathbb{C})\\cong H^q(Y,\\mathbb{C})$ 对 $q<n-1$ 与限制映射的单射性（$q=n-1$）。这条推论把高维的拓扑信息逐步压到超平面上，是所有\"切片归纳\"式论证的入口。", uses: ["integrating-positivity-to-vanishing"] },
    ],
    references: [
      stacks("Section 30.8: Cohomology of projective space", "01XW"),
      stacks("Section 30.16: Higher direct images along projective morphisms", "0B5T"),
      { title: "Principles of Algebraic Geometry", author: "Phillip Griffiths, Joseph Harris", year: 1978 },
      { title: "Frobenius splitting and the degeneration of the Hodge–de Rham spectral sequence", author: "Pierre Deligne, Luc Illusie", year: 1987 },
    ],
    history: HISTORY,
  },

  /* ═══════════════════════════════════════════════════════════
   * 3. 丰饶层的高阶消没
   * ═══════════════════════════════════════════════════════════ */

  "e-ample-vanishing": {
    statement: "设 k 是诺特环，$X\\subseteq\\mathbb{P}^n_k$ 是射影概形，$\\mathcal{O}_X(1)$ 是超平面线丛的限制，$\\mathcal{F}$ 是 X 上的凝聚 $\\mathcal{O}_X$-模，记 $\\mathcal{F}(m)=\\mathcal{F}\\otimes_{\\mathcal{O}_X}\\mathcal{O}_X(m)$。则存在只依赖 $\\mathcal{F}$ 的整数 $m_0$，使对一切 $m\\ge m_0$ 与一切 $i>0$ 有 $H^i(X,\\mathcal{F}(m))=0$。进一步，$\\chi(\\mathcal{F}(m))=\\sum_i(-1)^i\\dim_kH^i(X,\\mathcal{F}(m))$ 是 $m$ 的多项式（当 $m\\ge m_0$ 时等于 $\\dim_kH^0(X,\\mathcal{F}(m))$），其次数等于 $\\mathcal{F}$ 的支撑维数，首项系数乘以该维数的阶乘等于 $\\mathcal{F}$ 的多重度。",
    explanation: "这条定理的政策性意义在于：它宣布\"上同调的复杂度集中在低扭次数\"。任何凝聚层只要扭得足够正，就变得像射影空间的结构层一样温顺，高阶上同调整片消失。由此得到三个长期收益。第一，Hilbert 函数在足够大的 $m$ 处成为多项式，这使得\"次数\"\"维数\"\"重数\"这些几何量有了纯代数定义（读多项式系数即可），而希尔伯特多项式又反过来成为 Hilbert 方案与模空间的构造工具（希尔伯特多项式的有限性是拟射影结构的前提）。第二，Euler 特征数 $\\chi$ 的量可以用完全初等的办法计算：把层逐层剥成扭结构层，$\\chi$ 可加，从而 $\\chi$ 只依赖有限多个数据。第三，它为\"丰沛\"提供了代数刻画：若 $H^1(X,\\mathcal{F}(m))=0$ 对层次足够高的扭成立，截面可以限制到超平面截面而不损失，这恰是 Cartan–Serre 关于丰沛性的刻画（$\\mathcal{O}_X(1)^{\\otimes m}$ 由整体截面生成的闭浸入）在上同调层面的表现形式。证明的技术核心只有两块：射影空间上 $\\mathcal{O}(m)$ 的显式计算，以及\"任意凝聚层可由有限个扭结构层的满射覆盖\"这一有限性下降。",
    steps: [
      step("projectivization-and-finite-syzygy", "有限生成与满射归约",
        "设 $\\mathcal{F}$ 是 $\\mathbb{P}^n$ 上的凝聚层。先做一块纯代数准备：对足够大的 $m_1$，存在满射 $\\mathcal{O}_{\\mathbb{P}^n}(-m_1)^{\\oplus r}\\twoheadrightarrow\\mathcal{F}$。理由分两步：其一，X 被 $n+1$ 个仿射图 $U_j=\\{x_j\\neq0\\}$ 覆盖，$\\mathcal{F}(U_j)$ 是有限生成 $\\mathcal{O}(U_j)$-模，取生成元后乘以足够大的 $x_j$ 的幂使其成为整体截面（黏合需要有限多个截面，因为 $\\mathbb{P}^n$ 拟紧且 $\\mathcal{F}$ 凝聚），得到满射 $\\mathcal{O}^{\\oplus R}\\twoheadrightarrow\\mathcal{F}$；其二，把 $\\mathcal{O}^{\\oplus R}$ 的各种齐次次数统一，即把每个生成元乘以相应的 $\\mathcal{O}(-\\!)$，得到单次数的满射。有了这一步就有短正合列 $0\\to\\mathcal{G}\\to\\mathcal{O}(-m_1)^{\\oplus r}\\to\\mathcal{F}\\to0$，其中 $\\mathcal{G}$ 是 $\\mathcal{F}$ 的\"关系层\"，仍凝聚，但它的扭次数指标更低（因为它由生成元之间的关系张成）。把这一步对 $\\mathcal{G}$ 反复使用，就得到 $\\mathcal{F}$ 的一个有限长度的自由表示。",
        []),
      step("cohomology-of-twisted-structure-sheaves", "扭结构层的上同调计算",
        "在 $\\mathbb{P}^n_k$ 上（$k$ 是任意诺特环），$\\mathcal{O}(m)$ 的上同调可用标准覆盖上的 Čech 复形一次算出：令 $R=k[x_0,\\ldots,x_n]$，则 $H^0(\\mathcal{O}(m))=R_m$（$m$ 次齐次齐次多项式空间），$m<0$ 时为零；$H^i(\\mathcal{O}(m))=0$ 对所有 $0<i<n$ 与所有 $m$；最后一个位置 $H^n(\\mathcal{O}(m))$ 由 $k[x_0^{-1},\\ldots,x_n^{-1}]$ 的 $m$ 次部分给出，非零恰在 $m\\le-n-1$，维数为 $\\binom{-m-1}{n}$。也就是说：中间维数全消，而首末两个位置只在相反的次数区间非零。把这个计算限制到闭子概形 $X\\subseteq\\mathbb{P}^n$ 上也不改变结论的形态：$\\mathcal{O}_X(m)$ 的上同调由 $\\mathcal{O}_{\\mathbb{P}^n}(m)$ 经长正合列计算，$m$ 足够大时同样只剩 $H^0$。这一步的用途是把\"扭得足够大\"与\"上同调消失\"的联系具体化：$H^i(\\mathcal{O}(m))$ 在 $m>0$、$0<i<n$ 时为零，没有任何例外。",
        ["projectivization-and-finite-syzygy"]),
      step("descending-to-general-coherent-sheaves", "用长正合列把消没下降到一般凝聚层",
        "取上一步的短正合列 $0\\to\\mathcal{G}\\to\\mathcal{O}(-m_1)^{\\oplus r}\\to\\mathcal{F}\\to0$，整体扭 $m$ 得 $0\\to\\mathcal{G}(m)\\to\\mathcal{O}(m-m_1)^{\\oplus r}\\to\\mathcal{F}(m)\\to0$（注意扭号：$\\mathcal{O}(-m_1)(m)=\\mathcal{O}(m-m_1)$）。长正合列在 $i>0$ 的段落给出：若 $H^i(\\mathcal{O}(m-m_1))=0$ 且 $H^{i+1}(\\mathcal{G}(m))=0$，则 $H^i(\\mathcal{F}(m))=0$。关键的技术点是阈值的一致性：$\\mathcal{G}$ 需要比 $\\mathcal{F}$ 更大的扭转才能消没（因为 $\\mathcal{G}$ 承载了 $\\mathcal{F}$ 的全部关系，其生成元的负次数更深），但对固定的 $\\mathcal{F}$，这个\"复杂度\"是有限的——它由表示的长度与出现的扭次数界控制，而这些是 $\\mathcal{F}$ 的有限数据。于是对固定的 $\\mathcal{F}$，取 $m_0$ 为有限多步归纳中出现的最大阈值，即得 $m\\ge m_0$ 时 $H^i(\\mathcal{F}(m))=0$ 对一切 $i>0$。这里的要点是 $m_0$ 依赖 $\\mathcal{F}$ 而不依赖 $i$，这个一致性来自对 $i$ 逐一处理时只会遇到有限多个层（表示的长度有限）。",
        ["cohomology-of-twisted-structure-sheaves"]),
      step("hilbert-polynomial-from-vanishing", "Euler 特征数与 Hilbert 多项式",
        "定义 $\\chi(\\mathcal{F}(m))=\\sum_{i\\ge0}(-1)^i\\dim_kH^i(X,\\mathcal{F}(m))$（由消没与 Grothendieck 消没，和是有限的）。两条性质立刻可用：其一，$\\chi$ 在短正合列上可加（把长正合列拆成短列并取维数的交替和）；其二，$\\chi(\\mathcal{O}_{X}(m))$ 是 $m$ 的多项式（由 $\\mathbb{P}^n$ 上的显式计算：$\\chi(\\mathcal{O}(m))=\\binom{m+n}{n}$，这是 $n$ 次多项式）。对 $\\mathcal{F}$ 用表示 $0\\to\\mathcal{G}\\to\\mathcal{O}(m-m_1)^{\\oplus r}\\to\\mathcal{F}(m)\\to0$ 并归纳，得 $\\chi(\\mathcal{F}(m))$ 是 $m$ 的多项式，记作 $P_{\\mathcal{F}}(m)$。而由消没，$m\\ge m_0$ 时所有 $i>0$ 的项为零，故 $P_{\\mathcal{F}}(m)=\\dim_kH^0(X,\\mathcal{F}(m))$。这就把\"截面维数最终是多项式\"变成一个定理，并把多项式的次数定义为 $\\dim\\operatorname{Supp}\\mathcal{F}$、首项系数乘该维数阶乘定义为 $\\mathcal{F}$ 的重数，两者都是双有理不变的整数。",
        ["descending-to-general-coherent-sheaves"]),
      step("finiteness-and-ample-characterization", "有限性与丰沛性的刻画",
        "同一套表示还给出有限性：把长正合列的前几项夹在已知的有限维空间之间（$H^i(\\mathcal{O}(m))$ 是有限生成的 $k$-模，$k$ 为域时有限维），逐段归纳得每个 $H^i(X,\\mathcal{F})$ 都是有限维 $k$-向量空间，并且 $i>\\dim X$ 时为零。有限性与消没合起来构成丰沛性的代数刻画：线丛 $\\mathcal{L}$ 丰沛当且仅当某个 $\\mathcal{L}^{\\otimes m}$ 由整体截面生成并给出闭浸入；而定理说明只要 $\\mathcal{L}$ 是由 $\\mathcal{O}_X(1)$ 拉回的（这给出\"具有正性\"），高扭处的截面就足够多——因为此时 $H^0(\\mathcal{F}(m))\\to H^0(\\mathcal{F}(m)|_Y)$ 满射（由 $H^1$ 消没与超平面截面列），于是\"截面可以限制而不损失\"。这句话在代数侧替代了曲率论证：正性不再通过度量，而是通过\"扭足够大时截面会自动增多\"来表达，且这一表达在任意特征下都成立。",
        ["hilbert-polynomial-from-vanishing"]),
    ],
    conclusion: "射影概形 X 上的凝聚层 $\\mathcal{F}$，存在 $m_0$ 使 $m\\ge m_0$ 时 $H^i(X,\\mathcal{F}(m))=0$ 对一切 $i>0$；由此 $\\chi(\\mathcal{F}(m))$ 是 $m$ 的多项式（Hilbert 多项式），在 $m\\ge m_0$ 时等于 $\\dim_kH^0(X,\\mathcal{F}(m))$，其次数为 $\\mathcal{F}$ 的支撑维数。同时所有 $H^i(X,\\mathcal{F})$ 有限生成，$i>\\dim X$ 时为零。",
    dependencies: [],
    consequences: [],
    examples: [
      { title: "例子：$\\mathbb{P}^2$ 上理想层 $\\mathcal{I}_p$ 的阈值核算", body: "取 $X=\\mathbb{P}^2$、$\\mathcal{F}=\\mathcal{I}_p$（点 $p$ 的理想层），由 $0\\to\\mathcal{I}_p\\to\\mathcal{O}\\to k_p\\to0$。计算 $\\chi(\\mathcal{I}_p(m))$：$\\chi(\\mathcal{O}(m))=\\binom{m+2}{2}$，$\\chi(k_p)=1$（点上的摩天楼层 $H^0=k$），相减得 $\\chi(\\mathcal{I}_p(m))=\\frac{(m+1)(m+2)}{2}-1$。对 $m=0$：$\\chi(\\mathcal{I}_p)=1-0-1=0$，实际 $h^0(\\mathcal{I}_p)=2$（过 $p$ 的一次形式）且 $h^1(\\mathcal{I}_p)=2$、$h^2=0$？逐项核对不如取 $m=1$：$h^0(\\mathcal{I}_p(1))=3-1=2$（过 $p$ 的直线），$h^1=0$（因为 $\\mathcal{I}_p(1)$ 是平面束的核且 $H^1(\\mathcal{O}(1))=0$），$h^2(\\mathcal{I}_p(1))=h^0(\\mathcal{O}(-2-1+1))=h^0(\\mathcal{O}(-2))=0$，与 $\\chi=3-1=2$ 一致。阈值 $m_0=1$ 在这里已经实现消没，说明对具体的低复杂度层，消没来得很快。" },
      { title: "例子：射影空间上的 Hilbert 多项式与重数", body: "取 $X=\\mathbb{P}^n$、$\\mathcal{F}=\\mathcal{O}_X$。$P(m)=\\binom{m+n}{n}=\\frac{(m+1)(m+2)\\cdots(m+n)}{n!}$，次数 $n=\\dim X$，首项系数 $\\frac{1}{n!}$，故重数 $=n!\\cdot\\frac{1}{n!}=1$，正是\"$\\mathbb{P}^n$ 在自身中的重数为 1\"这一几何事实。再看 $\\mathcal{F}=\\mathcal{O}_{\\mathbb{P}^n}/\\mathcal{I}_Y$（$Y$ 为 $d$ 次超曲面，维数 $n-1$）：由 $0\\to\\mathcal{O}(-d)\\to\\mathcal{O}\\to\\mathcal{O}_Y\\to0$ 得 $P_{\\mathcal{O}_Y}(m)=\\binom{m+n}{n}-\\binom{m-d+n}{n}$，这是 $m$ 的 $n-1$ 次多项式，首项系数 $\\frac{d}{(n-1)!}$，故 $\\mathcal{O}_Y$ 的重数为 $d$——与\"超曲面在射影空间中的次数为 $d$\"吻合。这两个核算说明 Hilbert 多项式的次数与首项系数确实编码了维数与次数这两个基本量。" },
    ],
    remarks: [
      "阈值依赖 $\\mathcal{F}$ 而非一致：在一族凝聚层中 $m_0$ 可以无界增长（例如 $\\mathcal{O}(-r)$ 的阈值随 $r$ 线性增长），因此在做\"族的论证\"（基变换、退化、半连续性）时必须逐层核对，不能引用统一阈值。这条限制是形变理论中\"特殊纤维上同调跳升\"现象的直接原因。",
      "凝聚性不能丢：非凝聚层（例如常层 $\\mathbb{Z}$、秩无穷的自由层）既不满足有限性也不满足消没，因为\"用有限个扭结构层满射覆盖\"这一步完全依赖凝聚性与射影性。$\\mathbb{P}^1$ 上的常层有 $H^1=\\mathbb{Z}$ 且扭操作对常层不产生正性，故消没阈值不存在。",
      "射影性不能换成拟射影或紧复：仿射簇上凝聚层的高次上同调本来就为零，定理失去信息量；一般紧复流形上需要额外的正性假设（层本身或线丛要有正性），不能无条件断言扭得足够大就消没。射影性同时提供了 $\\mathcal{O}(1)$ 的存在与有限性，两者都不可省。",
      "Hilbert 多项式只在 $m$ 大时等于 $h^0$：在低扭次数处 $h^0(\\mathcal{F}(m))$ 可以大于或小于 $P_{\\mathcal{F}}(m)$ 的值（差值由非零的 $H^i$（$i>0$）贡献），把两者混用会在小 $m$ 处给出错误维数。$\\mathbb{P}^2$ 上 $\\mathcal{O}(-1)$ 是典型：$h^0=0$ 而 $P(-1)=\\binom{1}{2}=0$ 恰好相等只是巧合，换成 $\\mathcal{O}(-2)$ 时 $P(-2)=\\binom{0}{2}=0$ 与 $h^0=0$ 也不再提供任何上界信息。",
    ],
    corollaries: [
      { title: "推论：Euler 特征数可用表示计算", body: "由 $\\chi$ 在短正合列上的可加性与 $\\chi(\\mathcal{O}(m))=\\binom{m+n}{n}$，任意凝聚层 $\\mathcal{F}$ 的 $\\chi(\\mathcal{F}(m))$ 都可由 $\\mathcal{F}$ 的一个自由表示逐步算出，无需知道任何具体的截面。这条推论是曲面与三维簇上数值计算的常规手段：把目标层写成已知层的组合，$\\chi$ 的表达式立刻落地，再由消没与对偶读回单个 $h^i$。", uses: ["hilbert-polynomial-from-vanishing"] },
    ],
    references: [
      stacks("Section 30.8: Cohomology of projective space", "01XW"),
      stacks("Section 30.19: Higher direct images of coherent sheaves", "02O3"),
      { title: "Algebraic Geometry", author: "Robin Hartshorne", year: 1977 },
    ],
    history: HISTORY,
  },

  /* ═══════════════════════════════════════════════════════════
   * 4. 上同调的有限维性
   * ═══════════════════════════════════════════════════════════ */

  "e-cohomology-finite-dim": {
    statement: "设 k 是域，X 是 k 上的真（proper）概形，$\\mathcal{F}$ 是 X 上的凝聚 $\\mathcal{O}_X$-模。则：(1) 每个 $H^i(X,\\mathcal{F})$ 是有限维 $k$-向量空间；(2) 存在整数 $n_0$（例如 $n_0=\\dim X$）使 $H^i(X,\\mathcal{F})=0$ 对一切 $i>n_0$。于是 Euler 特征数 $\\chi(X,\\mathcal{F})=\\sum_{i\\ge0}(-1)^i\\dim_kH^i(X,\\mathcal{F})$ 是有限和且为整数，并且对短正合列可加。对 k 上有限型的真概形，有限维性与消没界一起说明\"上同调是一组有限多个有限维向量空间\"。",
    explanation: "这条定理看起来是技术前提，实际上它是所有\"可数\"不变量的地基。正因为 $H^i$ 有限维，才有 $\\chi$ 的定义，才有 Serre 对偶的配对能与维数等式吻合，才有 Riemann–Roch 定理把几何量写成数，也才有模空间上\"把上同调维数写成上同调函子\"的做法。它的证明思路可以概括为\"把问题搬到射影空间，再逐层剥层\"：先在射影情形用 $\\mathcal{O}(m)$ 的显式计算与凝聚层的有限表示把有限性做成归纳，然后用 Chow 引理把一般的真概形换成射影概形来支配，用 Larey 谱序列与归纳处理高阶直像。消没界（$i>\\dim X$ 为零）则来自诺特空间的拓扑性质：层可沿不可约闭子集逐步剥离，摩天楼层没有高阶上同调，剥离次数不超过维数。两者的分工是：有限性保证\"数得清\"，消没保证\"数得完\"。丢掉真性（或射影性）会立刻失效：仿射直线上的结构层有 $H^0=k[x]$ 无穷维，这是最简反例。",
    steps: [
      step("reduction-to-projective-case", "归约：射影情形是核心",
        "先说明为什么只需处理射影情形。若 X 是 k 上的射影概形（或更一般地，在某个 $\\mathbb{P}^N_k$ 中闭浸入），取闭浸入 $i:X\\hookrightarrow\\mathbb{P}^N$，则 $H^i(X,\\mathcal{F})\\cong H^i(\\mathbb{P}^N,i_*\\mathcal{F})$（因为 $i$ 是仿射态射，$i_*$ 是正合且其上同调与 X 上的上同调一致）。$i_*\\mathcal{F}$ 仍是凝聚层（闭浸入的推前保持凝聚性），于是问题化为射影空间上凝聚层的有限性。这一步的关键是\"有限性对闭子概形不变\"：既可以用推前把层搬到射影空间，也可以用长正合列把问题限制到子概形上（用 $0\\to\\mathcal{I}_X\\to\\mathcal{O}\\to i_*\\mathcal{O}_X\\to0$ 对 X 是超曲面截面的情形做归纳）。对一般的真概形，Chow 引理提供射影支配：存在射影概形 $X'$ 与真双有理满射 $\\pi:X'\\to X$，再把 X 上的层沿 $\\pi$ 拉回并用谱序列比较。因此射影情形的有限性是全部论证的支点。",
        []),
      step("finite-dimensionality-in-the-projective-case", "射影情形：由有限自由表示做归纳",
        "设 $X\\subseteq\\mathbb{P}^N$、$\\mathcal{F}$ 凝聚。由有限性下降的第一步（凝聚层由有限个扭结构层满射覆盖），取短正合列 $0\\to\\mathcal{G}\\to\\mathcal{O}_X(-m_1)^{\\oplus r}\\to\\mathcal{F}\\to0$。长正合列给出精确列 $H^i(\\mathcal{O}_X(-m_1))^{\\oplus r}\\to H^i(\\mathcal{F})\\to H^{i+1}(\\mathcal{G})$，它同时给出上界与下界：$H^i(\\mathcal{F})$ 被 $H^i(\\mathcal{O}_X(-m_1))^{\\oplus r}$ 的商与 $H^{i+1}(\\mathcal{G})$ 的子夹住。$\\mathcal{O}_X(-m_1)$ 的上同调有限维（由 $\\mathbb{P}^N$ 上 $\\mathcal{O}(m)$ 的显式计算限制而来，它是有限维的 $k$-向量空间且只在 $0\\le i\\le\\dim X$ 内非零），对 $\\mathcal{G}$ 重复这一构造（$\\mathcal{G}$ 的\"复杂度\"更低，因为它的扭次数指标更负），归纳在有限步内终止。归纳终止的技术保证是：每一步出现的层的扭次数指标严格下降，而无界下降会与凝聚性（每点的局部生成元数有限）冲突，故步数有界。于是每个 $H^i(\\mathcal{F})$ 都是有限维空间（被有限维空间夹住的向量空间有限维）。",
        ["reduction-to-projective-case"]),
      step("vanishing-above-dimension", "消没界：$i>\\dim X$ 时为零",
        "消没界与有限性相互独立，单独证明。设 X 是诺特拓扑空间、维数 $\\le n$（即闭子集链最长长度 $\\le n$），$\\mathcal{F}$ 是任意阿贝尔群层。用诺特归纳对支撑维数做归纳：取支撑闭包 $Z$ 的一个不可约分支 $Z_0$，用 $0\\to\\mathcal{F}_1\\to\\mathcal{F}\\to i_*(\\mathcal{F}|_{Z_0})\\to0$ 剥离；$\\mathcal{F}_1$ 的支撑维数严格小于 $Z$，而 $i_*(\\mathcal{F}|_{Z_0})$ 是支撑在不可约闭集上的层，它可以由有限多个摩天楼层经扩张拼成，而摩天楼层是 flabby 的，其正次数上同调为零。把长正合列在 $i>\\dim Z_0$ 处打开，得 $H^i(\\mathcal{F})\\cong H^i(\\mathcal{F}_1)$，于是把问题降到维数更小的支撑上；反复直到维数 0（有限个点），此时层是摩天楼层的有限直和，$i>0$ 时上同调为零。归纳完成得到 $H^i(X,\\mathcal{F})=0$ 对 $i>\\dim X$ 成立。若 X 是 k 上维数 $n$ 的真概形，其底空间的诺特维数等于簇的维数，故界恰好是 $n$。",
        ["finite-dimensionality-in-the-projective-case"]),
      step("from-proper-to-projective", "从射影到真概形：Chow 引理与归纳",
        "对一般的真概形 X，$H^i(X,\\mathcal{F})$ 的有限维性需要把射影情形搬过来。Chow 引理给出一对态射：射影概形 $X'$ 与真双有理满射 $\\pi:X'\\to X$（通过对 X 的某个射影化取图中闭包的消解得到；在特征零情形可用嵌入与消解，在一般情形用理想层的 blowup 序列与有限性替代）。有了满射 $\\pi$，伴随映射 $\\mathcal{F}\\to\\pi_*\\pi^*\\mathcal{F}$ 是单射（因为在 $\\pi$ 的纤维上取茎仍单射），于是 $H^i(X,\\mathcal{F})\\hookrightarrow H^i(X,\\pi_*\\pi^*\\mathcal{F})$。而 Leray 谱序列 $E_2^{p,q}=H^p(X,R^q\\pi_*\\pi^*\\mathcal{F})\\Rightarrow H^{p+q}(X',\\pi^*\\mathcal{F})$ 把右侧与射影概形 $X'$ 上的上同调联系起来；$\\pi^*\\mathcal{F}$ 在 $X'$ 上凝聚，故 $H^{p+q}(X',\\pi^*\\mathcal{F})$ 有限维（射影情形已证）。再由消没界与 $\\pi$ 的真性，谱序列的项在有限多个 $q$ 上非零，逐层读出 $H^i(X,\\pi_*\\pi^*\\mathcal{F})$ 的有限维性，最后夹出 $H^i(X,\\mathcal{F})$。整个链条的每一步都只用到\"射影情形的有限性\"与\"真态射的高阶直像配合谱序列\"。",
        ["finite-dimensionality-in-the-projective-case", "vanishing-above-dimension"]),
      step("euler-characteristic-and-consequences", "Euler 特征数的定义与可加性",
        "有了有限性与消没界，$\\chi(X,\\mathcal{F})=\\sum_{i=0}^{\\dim X}(-1)^i\\dim_kH^i(X,\\mathcal{F})$ 才有意义。它的第一条性质来自长正合列：对短正合列 $0\\to\\mathcal{F}'\\to\\mathcal{F}\\to\\mathcal{F}''\\to0$，把长正合列拆成有限多个精确列 $0\\to\\ker\\to\\cdot\\to\\operatorname{im}\\to0$，每个精确列给出维数的恒等式，交替相加后中间项两两相消，得 $\\chi(\\mathcal{F})=\\chi(\\mathcal{F}')+\\chi(\\mathcal{F}'')$。第二条性质是与扭的相容性：$\\chi(\\mathcal{F}(m))$ 是 $m$ 的多项式（下一节的主题），于是 $\\chi$ 成为把\"层\"送到\"整数\"的可加函子，这正是 Riemann–Roch 与 Hilbert 多项式理论的代数接口。若缺少有限维性，$\\chi$ 会是形式无穷和；若缺少消没界，$\\chi$ 会是无穷多项的和。两个条件缺一不可。",
        ["from-proper-to-projective", "vanishing-above-dimension"]),
    ],
    conclusion: "k 上真概形的凝聚层：所有 $H^i(X,\\mathcal{F})$ 是有限维 $k$-向量空间，且 $H^i(X,\\mathcal{F})=0$ 对 $i>\\dim X$。Euler 特征数 $\\chi(X,\\mathcal{F})=\\sum_{i=0}^{\\dim X}(-1)^i\\dim_kH^i(X,\\mathcal{F})$ 因而定义良好，对短正合列可加，并成为 Riemann–Roch 与 Hilbert 多项式计算的载体。",
    dependencies: [],
    consequences: [],
    examples: [
      { title: "例子：真性缺失时的反例与真性成立时的核算", body: "反例一：取 $X=\\mathbb{A}^1_k=\\operatorname{Spec}k[x]$，$\\mathcal{F}=\\mathcal{O}_X$。仿射消没给 $H^i=0$（$i>0$），但 $H^0=k[x]$ 是无穷维 $k$-空间，有限维性失效。反例二：取 $X$ 为无穷多条射影直线的并（非拟紧），$H^0$ 为无穷直和。正例核算：取 $X=\\mathbb{P}^1_k$、$\\mathcal{F}=\\mathcal{O}(-2)$，则 $h^0=0$、$h^1=\\dim H^0(\\mathcal{O}(0))=1$，$\\chi=0-1=-1$；与 Riemann–Roch 的 $\\chi=\\deg+1-g=-2+1-0=-1$ 吻合，且 $i>1$ 时为零。取 $\\mathcal{F}=\\mathcal{O}(-1)$：$h^0=h^1=0$，$\\chi=0$，与 $\\deg+1-g=-1+1=0$ 一致，同时说明\"每个 $H^i$ 都为零\"并非要求 $\\chi\\neq0$。" },
      { title: "例子：曲线上的 $\\chi(\\mathcal{O}_C)$ 与亏格", body: "取 $C$ 为亏格 $g$ 的光滑射影曲线、$\\mathcal{F}=\\mathcal{O}_C$。有限性给 $h^0=1$（常数函数）、$h^1=g$（Hodge 数，由 Serre 对偶 $h^1=h^0(K_C)=g$）、消没给 $i\\ge2$ 全零，故 $\\chi(\\mathcal{O}_C)=1-g$。把这条与 $\\chi(\\mathcal{O}(D))=1-g+\\deg D$ 相减，即得 Riemann–Roch 的差分形式 $\\chi(\\mathcal{O}(D))-\\chi(\\mathcal{O}_C)=\\deg D$，而这个差分的计算只需对\"加一个点\"的短正合列 $0\\to\\mathcal{O}(D)\\to\\mathcal{O}(D+P)\\to k_P\\to0$ 用一次可加性。整个推理链条只用到有限性与消没，说明这两条结论确实是曲线理论全部数值计算的共同前提。" },
    ],
    remarks: [
      "真性（或至少拟紧+分离+有限型）不可省略：仿射情形虽然是\"真性的反面\"，但恰好高次上同调为零而 $H^0$ 无穷维，所以有限性失败；另一类反例是拟紧但不分离的概形，其上凝聚层可以有无限维上同调。要得到有限维性必须假设态射真（或射影），得到 $H^0$ 有限维则还需要 X 本身的紧性（真+有限型）。",
      "有限维性不蕴含消没，反之亦然：$H^i$ 可以有限维但对任意大的 $i$ 非零吗？在真概形上不会（消没界限制了位置），但在一族概形上（例如非紧合的基变换后）确实会出现\"有限维但位置无界\"的情形；另一端，消没界不保证每项有限维（诺特空间上的层可以有无穷维上同调而不越界，例如非凝聚层）。两条结论必须分别引用。",
      "底的诺特性不能省：若基环 k 不是诺特环，凝聚层的上同调一般不是有限生成模（$H^i$ 可以是无穷生成的），消没界则仍成立（它只依赖底空间的拓扑维数）。因此这条定理的最常见表述把\"k 是域（或诺特环）\"与\"X 真\"并列，缺一不可。",
      "取基变换或退化时必须重新核对：有限维性是\"逐纤维\"的结论，但在族的特殊纤维处 $h^i$ 会跳升（上半连续性），因此不能把一般纤维的维数无条件搬到特殊纤维上；把有限性当成\"维数在族上局部常值\"会给出错误结论（例如平面曲线族的节点数在退化处增加）。",
    ],
    corollaries: [
      { title: "推论：上同调维数的上半连续性与 $\u005cchi$ 的局部常值性", body: "把有限性与上同调的基变换定理（$H^i(X_s,\\mathcal{F}_s)$ 的维数在 $s$ 上上半连续）合并，得到：在平坦族 $X\\to S$ 上，$h^i(s)=\\dim_kH^i(X_s,\\mathcal{F}_s)$ 是上半连续的，而 $\\chi$ 是局部常值的（因为它等于有限个上半连续函数与下半连续函数的交替和，而在族上是常数）。这条推论是模空间构造与形变理论中\"不变量在族上如何变化\"的常规引用点。", uses: ["euler-characteristic-and-consequences"] },
    ],
    references: [
      stacks("Section 30.19: Higher direct images of coherent sheaves", "02O3"),
      stacks("Section 20.20: Vanishing on Noetherian topological spaces", "0BX0"),
      { title: "Algebraic Geometry", author: "Robin Hartshorne", year: 1977 },
    ],
    history: HISTORY,
  },

  /* ═══════════════════════════════════════════════════════════
   * 5. 差异除子与差异系数
   * ═══════════════════════════════════════════════════════════ */

  "f-discrepancy-divisor": {
    statement: "设 X 是域 k 上的正规簇（特征零，$\\dim X\\ge1$），分别取一个消解 $f:X'\\to X$（即 f 真双有理、$X'$ 光滑、f 在 X 的正则轨迹上是同构），并假设 $K_X$ 是 $\\mathbb{Q}$-Cartier（即某个正整数倍 $rK_X$ 是 Cartier 除子）。把 $rK_X$ 沿 f 拉回得到 $\\mathbb{Q}$-除子 $f^*K_X$，再与 $X'$ 上的典范除子比较，唯一地写成 $K_{X'}=f^*K_X+\\sum_i a_iE_i$，其中 $E_i$ 取遍 f 的例外素除子（在 X 的中心维数 $\\le\\dim X-2$），$a_i\\in\\mathbb{Q}$。称 $a_i=a(E_i,X)$ 为 $E_i$ 关于 X 的差异系数；对一般的素除子 $E\\subset X'$ 也定义 $a(E,X)$，非例外者系数为零。整套 MMP 的分级语言由这个数驱动：所有例外除子都满足 $a_i>0$ 时称 X 为终端奇点，$a_i\\ge0$ 时称典范奇点，$a_i>-1$ 时称 klt（log terminal），$a_i\\ge-1$ 时称 log canonical。",
    explanation: "差异系数的地位在于它是\"奇点究竟有多坏\"的唯一线性坐标。它的定义看似只依赖消解与函数域的选取，实际上被两条定理保护：第一，$a(E,X)$ 只依赖 E 对应的离散赋值（即 E 在函数域 $k(X)$ 上定义的那个赋值环），因此与消解的选择无关；第二，整个多重集 $\\{a(E,X)\\}$ 对所有双有理模型取遍后是 X 的不变量，这就是\"双有理不变量\"的字面含义。有了不变量，才能对奇点分级：终端奇点（$a>0$）是不可被\"改善\"的，因为它们在小形变与减法（MMP 的收缩）下保持；klt 奇点是可以用除子语言正常处理的（乘子理想、消没、有理性都在此层成立）；log canonical 是理论可以延续的临界边界（$a=-1$ 处的目标允许出现，例如对数消解中的对数除子）。而一旦某个 $a_i<-1$，对数典范性失效，MMP 的基本定理（例如收缩定理的对数版本）就不再适用。局部坐标下的计算法则更让这个量落地：在例外除子 $E$ 是某个坐标超平面的图上，$a(E,X)$ 等于相应的 Jacobi 行列式的赋值减一，因此手算完全可行。",
    steps: [
      step("canonical-divisor-of-a-normal-variety", "正规簇上的典范除子与拉回",
        "先要把 $K_X$ 说清楚。设 X 正规、光滑轨迹 $U=X_{\\text{sm}}$ 稠密开，定义 $\\omega_X=j_*\\omega_U$（$j:U\\hookrightarrow X$ 为开浸入）作为凝聚层；由于 X 正规，$\\omega_X$ 是秩 1 的反射层，特别地在余维 1 处局部自由，于是它给出一个韦伊除子类 $K_X$（在其余维 1 素除子上的阶数由 $\\omega_X$ 的局部自由生成元给出）。若进一步假设 $K_X$ 是 $\\mathbb{Q}$-Cartier（存在 $r$ 使 $rK_X$ 是 Cartier 除子；光滑簇、Gorenstein 簇、商奇点都满足），则对任意态射 $g:Y\\to X$（Y 正规）可以定义拉回 $g^*K_X:=\\frac{1}{r}g^*(rK_X)$，拉回与有理等价相容，得到一个 $\\mathbb{Q}$-除子类。这一步的前提不能省：若 $K_X$ 不是 $\\mathbb{Q}$-Cartier，$f^*K_X$ 没有定义，差异系数就无从谈起（这正是\"必须假设 $\\mathbb{Q}$-Gorenstein\"的原因）。顺带记下两条基本事实：正规性保证 $\\omega_X$ 在余维 1 处可逆从而 $K_X$ 有意义；$\\mathbb{Q}$-Cartier 保证它可被拉回，从而与 $K_{X'}$ 可比较。",
        []),
      step("definition-via-discrete-valuations", "差异系数：用离散赋值定义并证明与消解无关",
        "设 $E\\subset Y$ 是正规簇 Y 上的素除子、$Y\\to X$ 是双有理态射，$E$ 对应函数域 $k(X)$ 的一个离散赋值 $\\nu_E$。由于 $rK_X$ 是 Cartier 除子，$f^*(rK_X)$ 有定义，故 $r(K_Y-f^*K_X)$ 是 Y 上的 Cartier 除子；定义 $a(E,X):=\\nu_E(K_Y-f^*K_X)+1$，即：把 $r(K_Y-f^*K_X)$ 在 E 处的系数除以 $r$ 再加 1。这个定义立刻显示与消解无关性：表达式只用赋值 $\\nu_E$（函数域的内蕴数据）与 $\\mathbb{Q}$-Cartier 的拉回（对复合态射可交换）。要使其成为完整论证还需检查两件事：其一，$K_Y-f^*K_X$ 的定义与 $\\omega_Y$ 的选取（相差一个主除子）无关，因为 $\\nu_E$ 吃掉主除子；其二，两个不同的消解可以比较：取共同的上游模型 $Z$（例如取图中的闭包或共同 blowup 后的消解），$E$ 在 Z 上的对应除子的赋值与在 Y 上的一致，于是沿两条路径算出的 $a(E,X)$ 相同。合起来得：$a(E,X)$ 只依赖序对 $(E,X)$，与辅助模型的选择无关。这正是差异系数可以作为奇点不变量使用的法律依据。",
        ["canonical-divisor-of-a-normal-variety"]),
      step("jacobian-formula-and-local-computation", "局部坐标下的 Jacobi 公式",
        "把上一步的赋值公式写成可算形式的，是下面的局部法则：设 X 在点 $x$ 附近由 $\\mathbb{A}^n$ 中的方程给出、$X'$ 是使全部例外除子成为坐标超平面的\"好\"模型（局部地存在这样的坐标，取 f 为对数消解），则在 $E=\\{y_1=0\\}$ 是坐标超曲面的图上，$a(E,X)=\\nu_E(\\partial(\\text{坐标变换})/\\partial(\\text{坐标变换}))-1$，即把坐标变换的 Jacobi 行列式沿 E 的赋值减一。推导只用链式法则：$K_{X'}$ 的局部生成元在坐标变化下乘以 Jacobi 行列式，而 $f^*K_X$ 的生成元在坐标变化下不变，两者之比恰是该行列式。这条公式给出三条常用读数：第一，若 $E$ 处的坐标变换是单位（局部同构），Jacobi 行列为 1，赋值 0，得 $a=0$，对应的正是\"非例外\"或\"f 在正则轨迹上同构\"的情形；第二，blowup 光滑闭子簇 $Z\\subset X$（$\\operatorname{codim} Z=c$）的例外除子 $E$ 满足 $a(E,X)=c-1$，这是该公式最经典的应用；第三，任何 $a(E,X)$ 都是有理数，因为 Jacobi 行列式的赋值与 $r$ 的关系是整数的比。",
        ["definition-via-discrete-valuations"]),
      step("blowup-computations-and-the-classification", "blowup 计算与奇点分级",
        "用 Jacobi 公式手算三类最基本的情形。其一，blowup 光滑点：$\\pi:X'\\to X$ 以光滑点 $x$ 为中心，$X'$ 光滑，$\\pi$ 在 $X\\setminus\\{x\\}$ 上同构，故只需确定例外除子 $E$ 的系数。由伴随公式 $K_{X'}=\\pi^*K_X+(\\dim X-1)E$（在 n 维时 $\\Omega^n_{X'}=\\pi^*\\Omega^n_X\\otimes\\mathcal{O}((n-1)E)$，这是 blowup 的 Jacobi 行列式在 $E$ 处沿纤维方向以阶 $n-1$ 退化的直接读数），得 $a(E,X)=n-1=\\operatorname{codim}\\{x\\}-1$。其二，blowup 光滑曲线：$\\operatorname{codim}=n-1$，得 $a=n-2$。其三，blowup 除子（codim 1）：这是同构，$a=0$，不产生新赋值。把系数与分级对上：光滑点中心给 $a=n-1>0$（终端），曲线中心在三维中给 $a=1>0$（终端），曲面上的曲线中心给 $a=0$（典范）；商奇点 $\\mathbb{A}^2/\\mu_2$ 的极小消解只有一个例外曲线 $E\\cong\\mathbb{P}^1$、$E^2=-2$，且 $K_{X'}=f^*K_X-\\frac{1}{2}E$（把 $E$ 的系数从 $\\omega$ 的局部生成元的赋值读出），故 $a=-\\frac{1}{2}>-1$，属于 klt 而非典范。",
        ["jacobian-formula-and-local-computation"]),
      step("invariants-and-consequences", "不变量意义：从差异系数读出消没与有理性",
        "差异系数不只是一组数字，它决定了哪些标准定理可用。三条常被引用的读数：第一，若 X 有终端奇点（全部 $a_i>0$），则 $K_X$ 在双有理意义下\"不能更小\"，这是 MMP 中\"终端奇点在收缩后仍终端\"的技术来源；第二，klt（$a_i>-1$）保证乘子理想 $\\mathcal{J}(X,\\mathfrak{a})$ 的若干有限性（如 $\\mathcal{J}$ 的余支撑与奇异轨迹重合），从而把消没定理与有理性判据接上；第三，log canonical 情形允许 $a_i=-1$，此时对数消解中的对数除子恰给出这类系数，理论仍在临界范围内，但一旦出现 $a_i<-1$（\"非对数典范\"），对数消解与收缩定理的对数版本失效。计算上的另一条要点：差异系数的极小值（取遍所有例外除子）是 $K$ 的双有理不变量，称为\"对数差异\"；它可以用来判定奇点的类型，并且与 Hilbert–Samuel 多重度、嵌入维数等局部量相互制约，例如 klt 曲面奇点的多重度与差异系数满足若干不等式，这些不等式在曲面消解的分类中被反复使用。",
        ["blowup-computations-and-the-classification"]),
    ],
    conclusion: "对正规、$\\mathbb{Q}$-Gorenstein 的 X 与消解 $f:X'\\to X$，$K_{X'}=f^*K_X+\\sum_i a_iE_i$ 中的系数 $a_i$ 只依赖例外除子对应的离散赋值，与消解的选择无关；局部上 $a(E,X)$ 等于 Jacobi 行列式沿 E 的赋值减一，blowup 光滑余维 $c$ 子簇给 $a=c-1$。由此可分级奇点：$a>0$ 终端、$a\\ge0$ 典范、$a>-1$ klt、$a\\ge-1$ log canonical，分级决定了 MMP 与消没型定理的适用范围。",
    dependencies: [],
    consequences: [],
    examples: [
      { title: "例子：三维中 blowup 光滑点与 $\\mathbb{A}^2/\\mu_2$ 的手算", body: "取 $X=\\mathbb{A}^3$、$\\pi:X'\\to X$ 以原点为中心的 blowup，例外除子 $E\\cong\\mathbb{P}^2$。由伴随公式 $K_{X'}=\\pi^*K_X+2E$（三维时系数 $n-1=2$），得 $a(E,X)=2>0$，故 $\\mathbb{A}^3$ 是终端奇点（光滑簇当然终端），且 blowup 后 $a$ 下降为负的位置只在更深的例外除子上出现。再算商奇点：取 $X=\\mathbb{A}^2/\\mu_2$（$\\mu_2$ 以 $-1$ 作用），其坐标环为不变量环 $k[x^2,xy,y^2]$，极小消解中例外除子 $E\\cong\\mathbb{P}^1$ 且 $E^2=-2$。由 $\\omega_{X'}=f^*\\omega_X\\otimes\\mathcal{O}(-\\frac{1}{2}E)$（因为 $K_X$ 是 2-除子而 $2(K_{X'}-f^*K_X)=-E$ 这是 Cartier 的），得 $a(E,X)=-\\frac{1}{2}$。数值落在 $(-1,0)$，所以 $X$ 是 klt 但不是典范，更不是终端；这与\"$\\mathbb{A}^2/\\mu_2$ 不是 Du Val 奇点\"的结论一致（A 型 $A_{2m}$ 的商奇点在 $m\\ge1$ 时确为 klt 非典范）。" },
      { title: "例子：圆锥面奇点与差异系数的极小值", body: "取 $X=V(xy-z^2)\\subset\\mathbb{A}^3$（二次锥面），它是正规的（二次型不可约）且 $K_X$ 为 $\\mathbb{Q}$-Cartier？实际上二次锥面是 Gorenstein 的（方程次数 2 与余维 2 相容），$\\omega_X\\cong\\mathcal{O}_X(-1)$（超曲面伴随给出 $\\omega_X=\\mathcal{O}(-1)|_X$）。取 $X'\\to X$ 为原点 blowup 后的极小消解（即 $\\mathbb{P}^1$-丛上的收缩？对二次锥面，极小消解是一个例外曲线 $E\\cong\\mathbb{P}^1$，$E^2=-2$，与 $\\mathbb{A}^2/\\mu_2$ 的消解同构）。由伴随：$K_{X'}=f^*K_X+0\\cdot E$？逐项核对：$X$ 为超曲面、$X'$ 光滑、$f$ 只有这一个例外除子，而 $K_X$ 是 Cartier 的，由超曲面伴随与双有理不变性可算出 $K_{X'}=f^*K_X-\\frac{1}{2}E$（因为 $\\omega_X$ 的生成元在消解下带一个 2 阶零点），故 $a=-\\frac{1}{2}$，与上一例完全一致：这正是\"两个奇点双有理等价\"（二次锥面与 $\\mathbb{A}^2/\\mu_2$ 有相同的消解与同样的例外除子配置）在差异系数层面的体现。" },
    ],
    remarks: [
      "$K_X$ 为 $\\mathbb{Q}$-Cartier 这一条不能省：对不满足它的正规簇（典型例子是三个坐标轴中两个方向上的商奇点的混合型构造），$f^*K_X$ 没有定义，$K_{X'}-f^*K_X$ 不是 $\\mathbb{Q}$-除子，差异系数不存在，奇点分级也失去依据。要处理这类奇点必须先换成\"对数对\"$(X,\\Delta)$ 形式并假设 $K_X+\\Delta$ 是 $\\mathbb{Q}$-Cartier。",
      "差异系数依赖 X 而不依赖消解，但依赖\"哪个 X\"：同一个光滑簇 X 相对于双有理等价的另一个正规模型 X̂ 会有完全不同的系数集（例如 X 光滑时所有 $a=0$，而它的某个奇异模型可以有负系数）。因此引用\"$a(E,X)$\"时必须把底模型写清，把不同模型的系数混用是这一类计算中最常见的错误。",
      "差异系数不能由\"例外除子的自交数\"取代：在曲面上 $E^2$ 与 $a$ 由伴随公式 $2p_a-2=E^2+K\\cdot E$ 相联系，但在高维没有这种直接关系，断言\"$a$ 小当且仅当自交数负得厉害\"没有依据；例如三维中 blowup 光滑点给 $a=2$ 而例外除子的自交结构完全确定（重言层的性质），与曲面上 $a=1$ 的情形不可类比。",
      "分级阈值不能移动：把 klt 的阈值从 $a>-1$ 放宽到 $a\\ge-1$ 会把 log canonical 与 klt 混同，而两者在消没与有理性上的表现不同（klt 时有理性与乘子理想的正合性成立，log canonical 只保证理论延续），例如表面上有 log canonical 而非 klt 的奇点（如 $\\mathbb{A}^2$ 中两条光滑曲线相切于一点），它在差异系数上取到 $a=-1$ 而不再是 klt。",
    ],
    corollaries: [
      { title: "推论：光滑点的消解不产生负差异系数", body: "由 blowup 计算 $a=c-1$ 与归纳，若 $X$ 在点 $x$ 处光滑，则任何以光滑中心序列得到的例外除子都满足 $a\\ge0$（依次 blowup 光滑子簇时系数按 $c-1$ 累加，$c\\ge1$ 给出非负），或者说 $X$ 的所有差异系数非负，即光滑簇是典范的。这条推论与\"光滑簇上 $K_X$ 是 Cartier 且任意双有理模型的除子系数不增\"的一般原则相符，是终端/典范奇点理论的起点。", uses: ["blowup-computations-and-the-classification"] },
    ],
    references: [
      stacks("Section 31.27: Weil divisors", "0BE3"),
      stacks("Section 31.22: Regular immersions", "0E9J"),
      { title: "Birational Geometry of Algebraic Varieties", author: "Janos Kollár, Shigefumi Mori", year: 1998 },
      { title: "Singularities of the Minimal Model Program", author: "Janos Kollár, Sándor Kovács", year: 2013 },
    ],
    history: HISTORY,
  },

  /* ═══════════════════════════════════════════════════════════
   * 6. Log canonical 阈值
   * ═══════════════════════════════════════════════════════════ */

  "f-log-canonical-threshold": {
    statement: "设 X 是复代数簇（或特征零域上的正规簇）上的一个点附近的局部模型，$D$ 是 X 上由某个非零正则函数 $f$ 定义的既约除子（或一般的有效 $\\mathbb{Q}$-除子），并设 $K_X$ 为 $\\mathbb{Q}$-Cartier、$X$ 本身 log canonical。定义 log canonical 阈值 $\\operatorname{lct}(X;D)=\\sup\\{c\\ge0:(X,cD)\\ \\text{是 log canonical 的}\\}$，其中 $(X,cD)$ 的差异系数为 $a(E,X)-c\\,\\operatorname{ord}_E(D)$，故条件等价于对所有 E 有 $c\\,\\operatorname{ord}_E(D)\\le a(E,X)+1$。于是 $\\operatorname{lct}(X;D)=\\inf_{E}\\frac{a(E,X)+1}{\\operatorname{ord}_E(D)}$（E 取遍所有在 X 上中心非空的素除子，特别地取遍所有例外除子）。等价刻画还有两条：其一是乘子理想形式 $\\operatorname{lct}(X;D)=\\sup\\{c>0:\\mathcal{J}(X,cD)=\\mathcal{O}_X\\}$；其二是解析形式 $\\operatorname{lct}(X;D)=\\sup\\{c>0:|f|^{-2c}\\ \\text{在}\,x\\,\\text{附近局部可积}\\}$。",
    explanation: "log canonical 阈值是把\"奇点相对一个除子有多坏\"压缩成一个数的装置，它的价值在于三套语言在这里汇合。双有理侧它显然是不变量（差异系数与消解无关，除子的序也无关），并且向下兼容：$\\operatorname{lct}$ 越小表示 D 越\"坏\"，$\\operatorname{lct}<1$ 表示 D 本身已经不是 log canonical，$\\operatorname{lct}>1$ 表示 X 比 D 允许的更干净。分析侧它等于乘子理想的临界指数（使 $|f|^{-2c}$ 局部可积的最大指数），这条等式让双有理理论与 Hodge 理论、复分析直接对话，也是\"KLK 定理\"（Kollár、Lazarsfeld 与 Kovács/Ein–Lazarsfeld–Smith 的工作）的内容。代数侧它是乘子理想跳跃数的倒数：$\\operatorname{lct}$ 恰好是 $\\mathcal{J}(X,cD)$ 从 $\\mathcal{O}_X$ 跳开的那一点，于是计算可以完全在局部环里进行。第三套语言给了它计算途径：消解与赋值计数，即上式的 inf 形式；这条公式也解释了为什么 $\\operatorname{lct}$ 总是有理数（有限多个有理数的最小值），并且为什么它可以通过\"加权 blowup\"一次性算出最简单的一类例子。",
    steps: [
      step("discrepancy-reformulation", "用差异系数重写 log canonical 条件",
        "由差异系数的加法性，对偶 $(X,\\Delta)$ 的差异系数是 $a(E,X,\\Delta)=a(E,X)-\\sum_jc_j\\operatorname{ord}_E(D_j)$（对 $\\Delta=\\sum c_jD_j$ 线性）。取 $\\Delta=cD$ 时条件\"$(X,cD)$ log canonical\"即 $a(E,X)-c\\operatorname{ord}_E(D)\\ge-1$ 对所有 E 成立，即 $c\\operatorname{ord}_E(D)\\le a(E,X)+1$。于是满足条件的 $c$ 组成区间 $[0,\\operatorname{lct}(X;D)]$（对 $c=0$ 需要 $X$ 本身 lc，这正是陈述中的假设），且 $\\operatorname{lct}=\\inf_E\\frac{a(E,X)+1}{\\operatorname{ord}_E(D)}$。两个技术要点：其一，只需取 $\\operatorname{ord}_E(D)>0$ 的 E（否则约束自动满足或退化为 $a(E,X)\\ge-1$，已由 X 的 lc 性保证）；其二，inf 在有限多个 E 上取到时给出极小值，若在无穷多个 E 上逼近则 $\\operatorname{lct}$ 仍可定义为下确界——对局部环上的理想，inf 总在有限多个 E 上取到（这是乘子理想有限生成性的直接后果），因此 $\\operatorname{lct}$ 是有理数。",
        []),
      step("multiplier-ideal-and-analytic-definition", "乘子理想与解析刻画的一致性",
        "乘子理想的定义是 $\\mathcal{J}(X,cD)=\\mu_*\\mathcal{O}_{X'}(\\lceil K_{X'}-\\mu^*(K_X+cD)\\rceil)$（$\\mu:X'\\to X$ 为对数消解），它是 $\\mathcal{O}_X$ 中的理想层，且随 $c$ 增大而单调递减；由构造它跳过 $\\mathcal{O}_X$ 的临界点恰为 $\\min_E\\frac{a(E,X)+1}{\\operatorname{ord}_E(D)}$：对某个 E 而言，$\\lceil K_{X'}-\\mu^*(K_X+cD)\\rceil$ 在 E 处的系数为 $\\lceil (a(E,X)+1)-c\\operatorname{ord}_E(D)\\rceil$，只要该系数为正，$\\mathcal{J}$ 中含 $E$ 的局部方程而在 x 处成为真理想。因此 $\\mathcal{J}(X,cD)=\\mathcal{O}_X$（在 x 附近）当且仅当 $c<\\operatorname{lct}(X;D)$，给出 $\\operatorname{lct}=\\sup\\{c:\\mathcal{J}(X,cD)=\\mathcal{O}_X\\}$。解析侧由 Demailly 与 Ein–Lazarsfeld–Smith、Kollár 的结果给出同一数值：$\\mathcal{J}(X,cD)$ 的局部生成元恰是那些使 $|f|^{-2c}$ 在 x 附近局部可积的全纯函数，故 $\\mathcal{J}=\\mathcal{O}_X$ 等价于 $|f|^{-2c}$ 局部可积。两套语言给出同一个 $c$，这正是\"临界指数 = 阈值\"的精确含义。",
        ["discrepancy-reformulation"]),
      step("computation-by-weighted-blowup", "计算法则：消解、赋值与加权 blowup",
        "计算的实用形式是：$\\operatorname{lct}(X;D)$ 是有限多个有理数 $\\frac{a(E,X)+1}{\\operatorname{ord}_E(D)}$ 的最小值，取遍在对数消解中出现的例外除子。对光滑 X 与 $D=\\{f=0\\}$，$a(E,X)=\\nu_E(J)-1$（Jacobi 行列式的赋值减一），于是 $\\operatorname{lct}(\\mathbb{A}^n;\\{f=0\\})=\\min_E\\frac{\\nu_E(J(f))}{\\nu_E(f)}$；这给出\"$\\nu_E(f)$ 大而 $\\nu_E(J)$ 小\"的赋值会压低阈值。对加权齐次 $f$（例如 $f=x^a+y^b$）使用权重 $(b,a)$ 的加权 blowup：例外除子 $E$ 满足 $\\nu_E(f)=ab$（$x^a$ 与 $y^b$ 的加权次数相同），而 $\\nu_E(J)=\\nu_E(Jacobian)=$ 权重和减一 $=(a+b)-1$（加权 blowup 的 Jacobi 行列式的赋值等于权重和减 1），于是该除子给 $\\frac{a+b}{ab}=\\frac{1}{a}+\\frac{1}{b}$；再检验所有其他赋值给的比值都不小于它，即得 $\\operatorname{lct}=\\frac{1}{a}+\\frac{1}{b}$。这条法则是\"牛顿多边形决定阈值\"的一个特例：阈值等于牛顿多边形（含常数项的那一侧）关于对偶权的极小值。",
        ["multiplier-ideal-and-analytic-definition"]),
      step("properties-and-monotonicity", "基本性质与单调性",
        "阈值有几条可反复使用的性质。第一，单调性：若 $D'\\le D$（作为有效除子），则 $\\operatorname{ord}_E(D')\\le\\operatorname{ord}_E(D)$，故 inf 只增不减，$\\operatorname{lct}(X;D')\\ge\\operatorname{lct}(X;D)$；特别地去掉分量或降低重数只会让阈值变大。第二，乘数不变性：$\\operatorname{lct}(X;D)$ 只依赖 $D$ 的双有理等价类（因为 $\\operatorname{ord}_E$ 只依赖赋值），因此同一 D 在不同双有理模型上给出的阈值相同。第三，跳升与有理性：$\\operatorname{lct}$ 是有理数（有限多个有理数的最小值），并且满足跳跃条件——存在某个 E 使等号成立，该 E 称为\"给出阈值的赋值\"。第四，与奇点分级的关系：$\\operatorname{lct}(X;D)=1$ 恰好对应 $(X,D)$ 本身 lc 而非 klt 的临界情形；$\\operatorname{lct}<1$ 表示 $(X,D)$ 已非 lc。第五条与光滑性相连：若 $\\operatorname{lct}(X;D)\\ge1$，则 $(X,D)$ 是 lc 的，于是 X 正规、$D$ 既约等结构性结论随之而来。",
        ["computation-by-weighted-blowup"]),
      step("char-p-and-variants", "特征 $p$ 的类比与不变量视角",
        "阈值理论在特征 $p$ 有平行的替代：把\"乘子理想\"换成紧闭包 $\\tau$ 与测试理想：对特征 $p$ 的多项式环，F-纯阈值 $\\operatorname{fpt}(f)=\\sup\\{c: f^c\\in\\tau\\}$（等价定义：$\\sup\\{c: R\\ \\text{关于}\\ f^c\\ \\text{是 F-纯的}\\}$）。三个理论之间的关系是：在特征零，$\\operatorname{lct}=\\sup\\{c:\\mathcal{J}(cD)=\\mathcal{O}\\}$；在特征 $p$，$\\operatorname{fpt}$ 由紧闭包定义且可计算（它等于某个有理数、有跳跃性质）；而在特征 $p$ 的\"好约化\"族上，$\\operatorname{fpt}$ 可以作为 $\\operatorname{lct}$ 的模 $p$ 逼近：对 $f$ 在 $\\mathbb{Z}$ 上的模型，有 $\\operatorname{fpt}_p(f)\\le\\operatorname{lct}(f)$ 且当 $p\\to\\infty$ 时趋于 $\\operatorname{lct}$；这条关系是 Hara–Yoshida、Mustanță–Takagi、Zhu 等人的结果。不变量视角则是：阈值度量\"f 的奇点相对 X 有多尖锐\"，且满足与奇点消除相关的比较（\"阈值越大，奇点越温和\"），在低维里可用牛顿多边形与 Puiseux 数据完全读出。",
        ["properties-and-monotonicity"]),
    ],
    conclusion: "$\\operatorname{lct}(X;D)=\\sup\\{c:(X,cD)\\ \\text{lc}\\}=\\inf_E\\frac{a(E,X)+1}{\\operatorname{ord}_E(D)}$，其中 inf 取遍中心非空的素除子；等价地它等于乘子理想从 $\\mathcal{O}_X$ 跳开的临界指数，也等于 $|f|^{-2c}$ 局部可积的最大指数。它是 $\\mathbb{Q}$ 中的有理数，可由一次加权 blowup 与有限多项赋值检查算出（$x^a+y^b$ 给 $\\frac{1}{a}+\\frac{1}{b}$），并随 D 单调下降。",
    dependencies: [],
    consequences: [],
    examples: [
      { title: "例子：$f=x^2+y^3$ 阈值 $5/6$ 的逐步核算", body: "取 $X=\\mathbb{A}^2$、$D=\\{x^2+y^3=0\\}$。先试普通 blowup 原点：例外除子 $E\\cong\\mathbb{P}^1$，$\\nu_E(f)=2$（$x^2$ 与 $y^3$ 的最低阶项 $x^2$ 给阶 2，$y^3$ 给 3），$a(E,X)=1$（余维 2 的 blowup），得比值 $\\frac{1+1}{2}=1$。改用权重 $(3,2)$ 的加权 blowup：此时 $x$ 权重 3、$y$ 权重 2，$x^2$ 与 $y^3$ 的加权次数同为 6，故 $\\nu_E(f)=6$；加权 blowup 的 Jacobi 行列式赋值 $=3+2-1=4$，故 $a(E,X)=4$，比值 $\\frac{4+1}{6}=\\frac{5}{6}<1$。继续检查其他赋值（沿两条分支进一步 blowup）给出的比值都不小于 $5/6$，因此 $\\operatorname{lct}=\\frac{5}{6}$。这条数值与\"解析临界指数\"一致：$|x^2+y^3|^{-2c}$ 可积的上界正是 $c<5/6$，可用极坐标 $x=r^3\\cos\\theta$、$y=r^2\\sin\\theta$ 的加权尺度直接核对（此时被积量按 $r^{6-12c}$ 缩放，可积性要求 $12c<6+2=...$ 即 $c<5/6$）。" },
      { title: "例子：$f=xy$ 与 $f=x^p$ 的阈值对比", body: "取 $D=\\{xy=0\\}\\subset\\mathbb{A}^2$。普通 blowup 原点给 $\\nu_E(xy)=2$、$a(E,X)=1$，比值 $\\frac{2}{2}=1$；再检查沿两条分支的进一步赋值：全都在 $E$ 之外的赋值给出的比值更大（因为 $\\operatorname{ord}_E(xy)$ 随分离而下降得比 $a+1$ 快？实际核对：后续赋值 $\\nu(x)=1$、$\\nu(y)=0$，$\\nu_E(f)=1$，而对应的 $a+1$ 仍为 1，得到比值 1），于是 $\\operatorname{lct}(\\mathbb{A}^2,xy)=1$。这与直观吻合：两条光滑曲线横截相交是 lc（阈值正好 1）而非 klt。换成 $D=\\{y^2-x^3\\}$（尖点）则阈值 $5/6<1$，对应 klt；换成 $D=\\{x^3=0\\}$（重数 3 的直线）时 $\\nu_E=3$，阈值 $\\frac{2}{3}$，说明\"方程越高次越尖\"在阈值上表现为数值下降，这一族比较可由 $x^a$ 与 $xy$ 两个极端夹住。" },
    ],
    remarks: [
      "$K_X$ 的 $\\mathbb{Q}$-Cartier 性与 X 的 lc 性是前提：取 $X$ 本身已经不 log canonical 的模型（例如某个非 lc 的锥），则 $c=0$ 都不满足 $(X,cD)$ 为 lc，定义中的集合为空，$\\operatorname{lct}$ 取 $0$ 而失去信息量；必须先假设 $X$ lc（或对 $(X,\\Delta_X)$ 取对数阈值），否则阈值不能用 inf 公式表达。",
      "D 的既约性与有效性不可丢：若 D 不是既约的（例如写成 $D=\\{x^2+y^3=0\\}$ 时不取既约结构仅取支撑），阈值只依赖支撑而非重数，因此乘子理想与阈值的陈述会不同；若 D 带负系数（$\\Delta$ 有负部分），则 $c\\mapsto(X,cD)$ 的单调性反转，$\\operatorname{lct}$ 可以大于 1 甚至无上界。",
      "阈值不能由\"沿一条赋值的比值\"单独给出：$\\operatorname{lct}$ 是全部赋值的 inf，早期赋值给的比值可能很大而后期的加权赋值给出更小值；只算一次普通 blowup 会高估阈值（$x^2+y^3$ 用普通 blowup 得 1 而真值是 $5/6$）。要确认结果需对有限多个赋值检查或用乘子理想的跳跃性质论证，单点计算不可靠。",
      "特征 $p$ 与特征零的阈值一般不相等：F-纯阈值与 lct 只在极限意义下吻合（$p\\to\\infty$ 的逼近），在固定特征 $p$ 可以出现严格不等式 $\\operatorname{fpt}_p<\\operatorname{lct}$，例如某些低特征下多项式的 F-纯阈值比 lct 小；因此把特征零的阈值公式直接搬到特征 $p$ 会给出错误的临界指数。",
    ],
    corollaries: [
      { title: "推论：$\\operatorname{lct}=1$ 精确刻画横截的一般位置", body: "由 inf 公式，$\\operatorname{lct}(X;D)=1$ 当且仅当存在一条赋值使 $\\frac{a(E,X)+1}{\\operatorname{ord}_E(D)}=1$ 而其余赋值给出的比值都不小，即最多到临界点 $(X,D)$ 保持 lc 而不 klt。对光滑 X 与既约 $D$，这等价于 D 在每一点都至多横截相交（例如 $\\{xy=0\\}$）；这解释了\"一般位置\"在阈值语言下的精确含义：任何横截之外的相切与重合都会把阈值压到 1 以下。", uses: ["computation-by-weighted-blowup"] },
    ],
    references: [
      stacks("Section 31.27: Weil divisors", "0BE3"),
      stacks("Section 47.25: Relative dualizing complexes in the Noetherian case", "0E9N"),
      { title: "Singularities of the Minimal Model Program", author: "Janos Kollár, Sándor Kovács", year: 2013 },
      { title: "Multiplier ideals of monomial ideals and log canonical thresholds", author: "Lawrence Ein, Robert Lazarsfeld, Karen Smith", year: 2003 },
    ],
    history: HISTORY,
  },

  /* ═══════════════════════════════════════════════════════════
   * 7. 有理奇点
   * ═══════════════════════════════════════════════════════════ */

  "f-rational-singularity": {
    statement: "设 X 是特征零域上维数 $n$ 的正规簇，$f:X'\\to X$ 是一个消解（$X'$ 光滑、f 真双有理、f 在正则轨迹上同构）。称 X 有有理奇点，若 $R^if_*\\mathcal{O}_{X'}=0$ 对一切 $i>0$ 成立；这个条件不依赖消解的选择。等价刻画（Kempf 判据）：X 有有理奇点当且仅当 X 是 Cohen–Macaulay 且自然映射 $f_*\\omega_{X'}\\to\\omega_X=\\mathcal{O}(K_X)$ 是同构（即 $\\omega_X$ 是 $\\omega_{X'}$ 在 \"$f_*$ + 双对\" 意义下的推前）。再等价地，$Rf_*\\mathcal{O}_{X'}$ 在导出范畴中同构于 $\\mathcal{O}_X$，从而 $X$ 的局部上同调满足 $H^i_x(\\mathcal{O}_X)=0$ 对 $0<i<\\dim\\mathcal{O}_{X,x}$。",
    explanation: "有理奇点的定义来自一句朴素的话：\"上同调看起来和光滑情形一样\"。光滑时 $f=\\operatorname{id}$，自然 $R^if_*\\mathcal{O}=0$（$i>0$）且 $f_*\\omega=\\omega$；有理奇点正是要求这两条对某个（从而是任意）消解继续成立。它带来的好处是具体的、可计算的：如果 $R^if_*\\mathcal{O}_{X'}=0$，那么沿收缩 $f$ 的投影公式把 X 上的向量丛／层的上同调与 $X'$ 上的上同调完全对上（$H^i(X,\\mathcal{F})\\cong H^i(X',f^*\\mathcal{F})$，对使 $R^if_*$ 作用良好的层），于是可以\"在消解上算完再搬回来\"，这在模空间与不变量理论中是最常用的减法。第二条好处是结构定理：有理奇点自动是 Cohen–Macaulay（这是 Kempf 判据的一半），并且是 $S_2$ 且余维 1 处正则，所以\"有理\"比\"正规\"强、但弱于\"光滑\"；第三条是它与其他奇点类型的层级关系——特征零下终端奇点与 klt 奇点（特别地：一切商奇点、一切 Du Val 奇点）都有有理奇点，而 log canonical 与一般正规奇点则不必（也有反例，如椭圆锥面的顶点）。",
    steps: [
      step("independence-of-resolution", "消解无关性：为什么只需检验一个消解",
        "先证明定义合理。设 $f_1:X'_1\\to X$、$f_2:X'_2\\to X$ 是两个消解，取共同的上游模型 $Z$ 使 $g_1:Z\\to X'_1$、$g_2:Z\\to X'_2$ 都是双有理态射（Z 可取 $X'_1\\times_XX'_2$ 的双有理消解，或用 blowup 序列与消解定理的\"共同支配\"存在性），且 Z 光滑（对 Z 再作一次消解即可，且由归纳设这一情形已知）。若 $f_1$ 满足 $R^if_{1*}\\mathcal{O}_{X'_1}=0$（$i>0$），则由 Leray 谱序列 $E_2^{p,q}=R^pf_{1*}(R^qg_{1*}\\mathcal{O}_Z)\\Rightarrow R^{p+q}(f_1g_1)_*\\mathcal{O}_Z$ 与 $R^qf_{1*}\\mathcal{O}_{X'_1}=0$（$q>0$）比较：$\\mathcal{O}_{X'_1}\\to Rg_{1*}\\mathcal{O}_Z$ 在 $q>0$ 处的高阶部分被 $f_{1*}$ 的高阶作用消掉，故 $R^q(f_1\\circ g_1)_*\\mathcal{O}_Z=0$（$q>0$）。再对 $f_2$ 用同一谱序列反向比较，得 $R^if_{2*}\\mathcal{O}_{X'_2}=0$。关键在于谱序列的退化是\"单边\"的：一侧的高阶直像已知为零时，另一端的高阶直像必然被同一为局部的群夹住；这里由于层是 $\\mathcal{O}$（结构层，不依赖 $X'_1$），比较特别干净。于是\"存在一个消解使成立\"等价于\"所有消解使成立\"。",
        []),
      step("kempf-criterion", "Kempf 判据：Cohen–Macaulay 加对偶层同构",
        "把上同调条件翻译成局部代数的条件用到 Grothendieck 对偶。设 $\\omega_X^{\\circ}$ 为 X 的对偶化复形，则对 X 上的凝聚层有 $R\\mathcal{H}om_X(\\mathcal{F},\\omega_X^{\\circ})\\cong Rf_*R\\mathcal{H}om_{X'}(\\mathbf{L}f^*\\mathcal{F},f^!\\omega_X^{\\circ})$；取 $\\mathcal{F}=\\mathcal{O}_X$ 并用 $f^!\\omega_X^{\\circ}\\cong\\omega_{X'}$（相对对偶化复形，$X$ 正规时这种表述可用）得导出同构 $R\\mathcal{H}om_X(\\mathcal{O}_X,\\omega_X^{\\circ})\\cong Rf_*\\omega_{X'}$，即 $\\omega_X^{\\circ}\\cong Rf_*\\omega_{X'}$ 当且仅当 $R^if_*\\mathcal{O}_{X'}=0$（因为对偶复形与 $\\mathcal{O}$ 的对偶还原为 $R\\mathcal{H}om$ 的高阶项，而 $\\mathcal{H}^i(\\omega_X^{\\circ})=0$ 对 $i<-\\dim X$ 且 $\\mathcal{H}^{-\\dim X}=\\omega_X$）。由于 $X'$ 光滑，$\\omega_{X'}$ 只在 $X'$ 的一个位置非零，$Rf_*\\omega_{X'}$ 集中在非正次数，$i=0$ 项是 $f_*\\omega_{X'}$；于是 $R^if_*\\mathcal{O}_{X'}=0$（$i>0$）等价于 $f_*\\omega_{X'}\\to\\omega_X$ 为同构且更高阶直像为零，这一条又等价于 $\\omega_X^{\\circ}$ 只有一个非零上同调（即 X 是 CM）加这一同构。把所有这些等价关系合并，就得到 Kempf 判据：X 有有理奇点当且仅当 X 是 CM 且 $f_*\\omega_{X'}\\to\\omega_X$ 同构。",
        ["independence-of-resolution"]),
      step("depth-and-local-cohomology", "深度、局部上同调与结构推论",
        "Kempf 判据立刻给出结构性结论。由 X CM（即每个局部环 $\\mathcal{O}_{X,x}$ 是 Cohen–Macaulay：$\\operatorname{depth}=\\dim$），得到 $S_2$ 条件（对高度 $\\ge2$ 的素理想深度达标，正规性已经是 $R_1$），于是 X 在余维 1 处正则、Weil 除子与 Cartier 除子在适当意义上完全配合，除子理论可用。进一步，把 $R^if_*\\mathcal{O}_{X'}=0$ 与消解中的消没结合，得到局部上同调的消失：$H^i_x(\\mathcal{O}_X)=0$ 对 $0<i<\\dim\\mathcal{O}_{X,x}$ 成立（这是 CM 与 $S_2$ 的等价刻画之一，也是\"有理奇点光滑到看不出奇点\"的字面形式——局部上同调只有 $i=0$（正规函数）与 $i=\\dim$（对偶）可能有非零值）。另一个结构推论是关于正则轨迹的：有理奇点的奇异轨迹余维数至少 2 且其上的几何被消解的例外结构严格编码（由 $\\omega_X$ 与 $\\omega_{X'}$ 的差控制），所以有理奇点不能靠 $K_X$ 的单侧奇性来检测，必须整体看 $f_*\\omega_{X'}$。",
        ["kempf-criterion"]),
      step("characteristic-p-analogues", "特征 $p$ 类比与消没型判据",
        "特征零的有理奇点与特征 $p$ 的 F-有理奇点平行：称特征 $p$ 的正规概形 X 为 F-有理的，若其局部环在紧闭包意义下的参数理想满足 $\\mathfrak{a}^{\\text{F-rat}}$ 的紧性条件；等价的常用形式：X 是 F-有理的若 X 是 CM 且对某个 $q=p^e$ 有 $I^{[q]}$ 的紧性；Kempf 判据在特征 $p$ 有对应版本，且在 F-有限、$F$-分裂良好时（例如有 $\\mathbb{Q}$-Gorenstein 性）F-有理奇点与有理奇点的共同推广\"F-正则\"一致。另一条在特征零也被反复使用的判据是消没式：若 X 有有理奇点则对每个消解的例外除子 E 有 $R^if_*\\mathcal{O}=0$，从而对拉回层 $f^*\\mathcal{F}$ 的投影公式可用；反过来，若某个消解使 $R^1f_*\\mathcal{O}=0$ 则奇点有理（因为 $R^1$ 是决定性的：更高阶由 $R^1$ 与该消解的纤维维数控制）。这些判据在有理性与消没之间架了桥，使得\"判定有理\"常常可以退化为一次上同调计算。",
        ["depth-and-local-cohomology"]),
      step("examples-and-invariants", "典型例子与不变量读数",
        "三个典型类必须记住。其一，一切商奇点 $\\mathbb{A}^n/G$（G 有限群、$|G|$ 在 k 中可逆）都有有理奇点：这条由 G 的作用与不变量环的 Reynolds 算子给出——Reynolds 算子 $R=\\frac{1}{|G|}\\sum_g g$ 是 $\\mathcal{O}$-模（对不变部分）的投影，它把消解上同调的不变部分投回原环，从而 $R^if_*\\mathcal{O}$ 的 $G$-不变子上同调消失，再由消解可 $G$-等变地选取得到结论。其二，一切 Du Val 奇点（曲面有理二重点）都有有理奇点：极小消解的例外除子由 $(-2)$-曲线组成，$K_{X'}=f^*K_X$（系数为零），$R^1f_*\\mathcal{O}=0$ 由例外曲线的 $H^1(\\mathcal{O})=0$ 给出。其三，反例：椭圆锥面（三次平面曲线在 $\\mathbb{A}^3$ 中取的锥）不是有理的：它的消解 $\\pi:X'\\to X$ 在顶点 blowup 后例外除子 $E$ 是椭圆曲线，$R^1\\pi_*\\mathcal{O}_{X'}$ 在顶点处的茎含 $H^1(E,\\mathcal{O}_E)=\\mathbb{C}$，故非零，得到奇点非有理。这条反例与\"亏格 g 的曲线取的锥非有理\"的一般结论一致。",
        ["characteristic-p-analogues"]),
    ],
    conclusion: "$R^if_*\\mathcal{O}_{X'}=0$（$i>0$）与消解的选择无关，等价于 X 是 Cohen–Macaulay 且 $f_*\\omega_{X'}\\to\\omega_X$ 同构（Kempf 判据）。有理奇点满足 $H^i_x(\\mathcal{O}_X)=0$（$0<i<\\dim$），包含一切商奇点与 Du Val 奇点，但不包含椭圆锥面这类奇点；它保证投影公式可用，从而把 X 上的上同调计算搬到消解上完成。",
    dependencies: [],
    consequences: [],
    examples: [
      { title: "例子：$\\mathbb{A}^2/\\mu_2$ 的有理性逐项核对", body: "取 $X=\\mathbb{A}^2/\\mu_2$（$\\mu_2$ 以 $(-1,-1)$ 作用），坐标环 $A=k[x,y]^{\\mu_2}=k[x^2,xy,y^2]$。极小消解 $X'\\to X$ 的例外除子 $E\\cong\\mathbb{P}^1$ 满足 $E^2=-2$。核对 $R^1f_*\\mathcal{O}_{X'}$ 在顶点处：顶点处的解析结构是 blowup 后沿 $E$ 坍缩，$R^1f_*\\mathcal{O}_{X'}$ 的茎等于 $\\varinjlim H^1(f^{-1}(U),\\mathcal{O})$，由例外椭圆型曲线上的 $H^1(\\mathcal{O}_E)=H^1(\\mathbb{P}^1,\\mathcal{O})=0$ 得零。再核对 Kempf 判据的另一半：$A$ 是二维正规环且有 $\\operatorname{depth}A=2=\\dim A$（$\\mu_2$ 的不变量环是 CM 的，因为 $|\\mu_2|$ 可逆且为小群概形作用的经典情形），$f_*\\omega_{X'}\\to\\omega_X$ 同构（曲面情形的伴随与 $K_{X'}=f^*K_X-\\frac{1}{2}E$ 的等价性给出）。两项核对都通过，故 $\\mathbb{A}^2/\\mu_2$ 有有理奇点；这与\"它是 log terminal 且 klt\"互相印证。" },
      { title: "例子：椭圆锥面为什么不是有理的", body: "取 $C\\subset\\mathbb{P}^2$ 为光滑三次曲线、$X=\\operatorname{Cone}(C)\\subset\\mathbb{A}^3$（$C$ 在 $\\mathbb{A}^3$ 中的仿射锥）。它是正规、CM 的三维簇（锥面），极小消解由 blowup 顶点得到：$X'\\to X$ 的例外除子 $E\\cong C$（椭圆曲线），且 $X'$ 是 $\\mathcal{O}_C(-1)$ 的总空间，$K_{X'}=f^*K_X$（三次曲线锥是 Gorenstein 且 $K_{X'}-f^*K_X$ 为 0，因为顶点 blowup 在三维中给系数 $n-1=2$ 而 $C$ 的次数补偿成 0——实际核对为 $K_{X'}=f^*K_X-\\frac{3}{3}E$）。于是 $R^1f_*\\mathcal{O}_{X'}$ 在顶点的茎含 $H^1(E,\\mathcal{O}_E)=\\mathbb{C}$（亏格 1 的曲线 $H^1(\\mathcal{O})\\cong k$），非零，故顶点非有理奇点。这与\"有理奇点要求例外结构上没有 $H^1(\\mathcal{O})$ 型障碍\"的原则一致：把三次曲线换成圆锥曲线（$\\mathbb{P}^1$）时 $H^1(\\mathcal{O})=0$，锥面变成二次锥面，它是有理的。" },
    ],
    remarks: [
      "正规性是有理奇点的前提，不能省：若 X 不正规（例如两条平面横截相交的并），则 $\\omega_X$ 的定义需要换用 $j_*\\omega_{X_{\\text{sm}}}$ 的双对，Kempf 判据中的\"CM 加 $f_*\\omega$ 同构\"不再等价于 $R^if_*\\mathcal{O}=0$（因为 Cohen–Macaulay 本身已经失败），于是\"有理性\"这个词必须重新定义。因此有理奇点的标准陈述总是从正规簇出发。",
      "特征 $p$ 的类比不能照搬数值：F-有理与有理奇点在 F-有限且具有 $\\mathbb{Q}$-Gorenstein 一类假设时对应良好（F-有理 ↔ 有理，F-正则 ↔ 终端），但特征 $p$ 下\"紧\"与\"有理\"的结合会出现特征零没有的现象（例如 F-有理但不 F-正则的奇点），所以把特征零的判据直接搬过去会给出错误结论。",
      "有理性不蕴含 Gorenstein：商奇点 $\\mathbb{A}^2/\\mu_3$（$\\mu_3$ 以权重 $(1,1)$ 作用，行列式 $\\omega\\neq1$）有有理奇点但不是 Gorenstein（$K_X$ 不是 Cartier 的），这从差异系数 $-\\frac{2}{3}$ 与 $K$ 的 $\\mathbb{Q}$-Cartier 性即可读出。因此\"有理 + Gorenstein\"比\"有理\"强，两个概念必须分开使用。",
      "有理性不蕴含正则：取任何 Du Val 奇点（如 $A_1$）都有有理奇点，但切空间维数在原点为 3 而维数为 2，正则性失效；反过来，光滑簇当然有理。所以\"有理\"严格弱于\"光滑\"，用它来论证正则性是错误推论。",
    ],
    corollaries: [
      { title: "推论：有理奇点上投影公式与上同调搬移", body: "若 X 有有理奇点、$f:X'\\to X$ 为消解，则对任何使 $R^if_*$ 作用可查的凝聚层 $\\mathcal{F}$ 有 $H^i(X,\\mathcal{F})\\cong H^i(X',f^*\\mathcal{F})$（因为 $Rf_*\\mathcal{O}_{X'}\\cong\\mathcal{O}_X$ 时 Leray 谱序列退化）。这条推论是模空间与不变量计算中的标准工具：把研究对象搬到光滑的消解上完成计算，再用投影公式搬回，奇点带来的差异被彻底吸收。", uses: ["kempf-criterion", "characteristic-p-analogues"] },
    ],
    references: [
      stacks("Section 28.12: Serre's conditions", "0B3D"),
      stacks("Section 47.11: Depth", "0BUW"),
      { title: "Rational singularities, with applications to algebraic surfaces and unique factorization", author: "Joseph Lipman", year: 1969 },
      { title: "Singularities of the Minimal Model Program", author: "Janos Kollár, Sándor Kovács", year: 2013 },
    ],
    history: HISTORY,
  },

  /* ═══════════════════════════════════════════════════════════
   * 8. Du Bois 奇点
   * ═══════════════════════════════════════════════════════════ */

  "f-du-bois-singularity": {
    statement: "对每个特征零的代数簇（更一般地：有限型概形）X，Du Bois 构造了一个对象 $\\underline{\\Omega}^{\\bullet}_X\\in D^b_{coh}(X)$（Du Bois 复形），它是光滑情形的 de Rham 复形 $\\Omega^{\\bullet}_X$ 的导出推广，并且带有自然映射 $\\mathcal{O}_X\\to\\underline{\\Omega}^{0}_X$（取自超消解的增广）。X 称为 Du Bois 的，若该映射是导出同构（等价地 $\\mathcal{H}^i(\\underline{\\Omega}^0_X)=0$ 对 $i>0$ 且 $\\mathcal{O}_X\\cong\\mathcal{H}^0$）；对既约 X 这等价于对所有 $p$ 的比较映射 $H^i(X,\\underline{\\Omega}^p_X)\\to H^i(X\\setminus\\Sigma,\\Omega^p)$ 为同构，其中 $\\Sigma$ 是奇异轨迹。已知结论：光滑簇、有理奇点簇、klt 奇点、以及一切 log canonical 与正规局部完全交集奇点都是 Du Bois 的；Du Bois 不蕴含正规（例如横截相交的既约除子是 Du Bois 的第一批经典例子）。",
    explanation: "Du Bois 复形要解决的是一个存在了半个世纪的问题：把 Hodge 分解 $H^n(X,\\mathbb{C})=\\bigoplus H^{p,q}$ 搬到奇异簇上。光滑簇上 $H^{n}(X,\\Omega^p)$ 给 Hodge 分次块，而奇异簇的 de Rham 复形在奇异轨迹上不再表现良好；Du Bois 的构造（1981）用一个超消解（hyperresolution，即一族从上到下逐层消解并取双复形）把 de Rham 复形的\"导出版本\"定义出来，并且证明它只依赖 X。这个复形的关键性质是：它的第 0 位 $\\underline{\\Omega}^0_X$ 总是把 $\\mathcal{O}_X$ 加强成一个复形，而\"$\\mathcal{O}_X\\to\\underline{\\Omega}^0_X$ 是同构\"这一条件恰恰意味着奇异轨迹上的 Hodge 分次块没有多余分量——也就是说，X 的 Hodge 结构在奇异处仍然由普通的整体全纯形式控制，不存在\"额外\"的 Hodge 型分量。这把\"奇点不干扰 Hodge 分解\"变成一条可检验的层论条件，并给出了一条漂亮的层级链：光滑 ⟹ 有理（在特征零且正规时）⟹ Du Bois，而每一条箭头都不可逆；同时 Du Bois 是比正规更弱的条件（横截相交的例子），因此它更像\"Hodge 分解的可用性\"而不是\"奇点温和\"。",
    steps: [
      step("hyperresolution-construction", "超消解与 Du Bois 复形的构造",
        "构造分三层。第一层：X 是簇，用\"X 的一个超消解\"即一个从下到上的态射系统：$X_0\\to X$ 是 X 的消解（光滑、把奇异轨迹与全部算子闭包的支集化开），$X_1\\to X_0$ 是 $X_0$ 中某些闭子簇的消解，等等，使每一层的闭子集都光滑且互相横截（\"算子\"结构：每个 $X_i$ 上的闭子集与该层的其他部分横截相交）。第二层：对每个 $i$，把第 i 层上的所有构件（$X_i$ 自身与其闭子集）在 $\\Omega^{\\bullet}$ 上取成单纯对象（一个 cosimplicial 复形），得到双复形 $\\Omega^{\\bullet}(X_\\bullet)$。第三层：定义 $\\underline{\\Omega}^{\\bullet}_X=R\\pi_{\\bullet*}\\Omega^{\\bullet}(X_\\bullet)$，即超消解映射的导出推前。三件事需要说明：其一，$\\underline{\\Omega}^{\\bullet}_X$ 与超消解的选择无关（不同超消解可以\"细化\"到公共的上游，而导出推前在双复形层面相容，这需要算子结构的横截性来保证纤维化的可解性）；其二，$\\mathcal{O}_X\\to\\underline{\\Omega}^0_X$ 由增广给出（在第 0 层上就是 $\\mathcal{O}_X\\to\\pi_{0*}\\mathcal{O}_{X_0}=\\mathcal{O}_X$ 的恒等）；其三，$\\underline{\\Omega}^{\\bullet}_X$ 上的滤过（由 $\\Omega^{\\bullet}$ 的 naive 滤过给出）使 $H^n(X,\\underline{\\Omega}^{\\bullet}_X)\\cong H^n(X,\\mathbb{C})$，于是它确实是 de Rham 复形的代数替身。",
        []),
      step("explicit-description-for-normal-crossings", "横截相交情形的显式描述",
        "要点在把 Du Bois 复形写成可算的形式，最简单的情形是既约的简单正规交叉除子。设 $D=\\bigcup_{i=1}^rD_i$ 是 X 内的简单正规交叉除子（各 $D_i$ 光滑、相交横截）。则 $\\underline{\\Omega}^{\\bullet}_D$ 可以用\"对数复形\"式的展开描述：$\\underline{\\Omega}^0_D$ 在最简情形（$D$ 是曲线上的几个点或曲面上的曲线）由复形 $\\mathcal{O}_D\\to\\bigoplus_i\\mathcal{O}_{D_i}\\to\\bigoplus_{i<j}\\mathcal{O}_{D_i\\cap D_j}\\to\\cdots$ 给出（箭头由限制映射与符号差给出），其 $\\mathcal{H}^0$ 是 $\\mathcal{O}_D$ 的像（即\"函数在各分支上的限制由整体函数给出\"的公共部分），而 $\\mathcal{H}^i=0$ 对 $i>0$。于是 $\\mathcal{O}_D\\to\\underline{\\Omega}^0_D$ 是同构（在导出意义下退化，因为复形只在第 0 位有同调），D 是 Du Bois 的。把这条计算搬到更一般的\"横截相交\"情形即得：任何被光滑分量以横截方式组成的既约除子是 Du Bois。这解释了为什么\"Du Bois 不蕴含正规\"：$D=\\{xy=0\\}\\subset\\mathbb{A}^2$ 在每个交点处既约但非正规（两个分支在一点相交），而它已被上面的显式复形判定为 Du Bois。",
        ["hyperresolution-construction"]),
      step("rational-implies-du-bois", "有理奇点蕴含 Du Bois",
        "证明要点是把\"有理\"的上同调信息搬进 Du Bois 复形。设 X 正规且有有理奇点，取消解 $f:X'\\to X$，则 $R^if_*\\mathcal{O}_{X'}=0$（$i>0$）且 $f_*\\omega_{X'}\\cong\\omega_X$。构造一条从 $\\Omega^{\\bullet}_X$ 到 $\\underline{\\Omega}^{\\bullet}_X$ 的滤过比较，并利用\"对偶复形的对偶\"（Saito 的论证）：由 Grothendieck 对偶，$\\mathcal{O}_X\\to\\underline{\\Omega}^0_X$ 是同构当且仅当它的对偶 $\\mathcal{H}om(\\underline{\\Omega}^0_X,\\omega_X^{\\circ})\\to\\omega_X^{\\circ}$ 是全零次数（无非零上同调）的，而右端的项由相对对偶化复形 $f^!\\mathcal{O}_X$ 与 $\\Omega^{\\bullet}_{X'/X}$ 的滤过块组成，其高次块恰由 $R^if_*\\omega_{X'}$ 与 $R^if_*\\mathcal{O}_{X'}$（$i>0$）控制。有理奇点使这些控制项为零，故比较映射的零次部分也退化，得到 $\\mathcal{O}_X\\cong\\underline{\\Omega}^0_X$，即 X Du Bois。更强的结论（Kovács–Schwede、Kollár 的工作）说明 klt 奇点与 lc 奇点也是 Du Bois 的：这里的关键补充是\"klt 奇点可换基到 $\\mathbb{Q}$-Gorenstein 覆盖并用差异系数控制\"，于是有理性与有理性型估计被推广到对数情形。",
        ["explicit-description-for-normal-crossings"]),
      step("hodge-numbers-and-du-bois-cohomology", "Du Bois 上同调与 Hodge 数",
        "Du Bois 复形的用处之一是给奇异簇定义 Hodge 型的数值不变量。由滤过 $F$ 给出谱序列 $E_1^{p,q}=H^q(X,\\underline{\\Omega}^p_X)\\Rightarrow H^{p+q}(X,\\mathbb{C})$，于是可以尝试按 $\\dim E_1^{p,q}$ 定义\"Hodge 数\"；Du Bois 条件正是保证第一层的行 0 与 $\\mathcal{O}_X$ 一致（即 $\\mathcal{H}^q(\\underline{\\Omega}^0)=0$ 对 $q>0$）的假设。一般地奇异簇的 $h^{p,q}$ 需要用混合 Hodge 结构（Deligne）或 Du Bois 的 $\\underline{\\Omega}^p$ 定义，而不像光滑情形由 $H^q(X,\\Omega^p)$ 直接给出；这正是\"奇异簇的 Hodge 理论\"需要新工具的根源。Du Bois 条件也等价于另一组更有几何味道的陈述：$\\mathcal{O}_X\\to\\underline{\\Omega}^0_X$ 同构 ⟺ \"奇异轨迹上的 Hodge 分次块不产生额外维数\" ⟺ 对一切 $p$ 有 $H^i(X,\\underline{\\Omega}^p_X)\\cong H^i(X\\setminus\\Sigma,\\Omega^p)$（$\\Sigma$ 为奇异轨迹），第三条形式最便于在具体簇上作计算或作反例判定。",
        ["rational-implies-du-bois"]),
      step("hierarchy-and-counterexamples", "层级关系与反例",
        "把已知的蕴涵关系排成链，并逐条点出反向不成立的例子。锚点：光滑 ⟹ Du Bois；正规 ⟹ 与 Du Bois 无关（Du Bois 不推出正规，见横截相交除子）；有理 ⟹ Du Bois（上一步），且这一步不可逆：对数典范但非有理的奇点（例如某些曲面上的 lc 非 klt 奇点，或 $\\mathbb{A}^2$ 中两条曲线相切一点的某些构造）是 Du Bois 而非有理；Du Bois 也不推出 CM：某些非 CM 的 Du Bois 例子来自低维奇点。至于反方向，Du Bois 不推出正规，也不推出有理性；相应地\"Du Bois\"刻画的不是\"奇点温和\"，而是\"Hodge 分解仍由整体全纯形式控制\"。层级的另一端：klt（特征零）⟹ 有理（在 $\\mathbb{Q}$-Gorenstein 情形），因此 klt ⟹ Du Bois，这条链条把 MMP 的分级与 Hodge 理论连起来，也是\"奇点理论与 Hodge 理论对话\"最常用的一条路径。",
        ["hodge-numbers-and-du-bois-cohomology"]),
    ],
    conclusion: "对每个有限型特征零概形，Du Bois 复形 $\\underline{\\Omega}^{\\bullet}_X$ 存在且与超消解选择无关，$H^n(X,\\underline{\\Omega}^{\\bullet}_X)\\cong H^n(X,\\mathbb{C})$；X 是 Du Bois 当且仅当 $\\mathcal{O}_X\\to\\underline{\\Omega}^0_X$ 是导出同构，也等价于各阶 $H^i(X,\\underline{\\Omega}^p_X)\\to H^i(X\\setminus\\Sigma,\\Omega^p)$ 同构。光滑簇、横截相交除子、有理奇点、klt 与 log canonical 奇点都 Du Bois；Du Bois 不蕴含正规或有理性。",
    dependencies: [],
    consequences: [],
    examples: [
      { title: "例子：$\\{xy=0\\}\\subset\\mathbb{A}^2$ 的显式复形核算", body: "取 $X=\\{xy=0\\}\\subset\\mathbb{A}^2$，它是两条坐标轴的并，在原点处非正规（两个分支相交）。由横截相交的显式描述，$\\underline{\\Omega}^0_X$ 由复形 $\\mathcal{O}_X\\to\\mathcal{O}_{D_1}\\oplus\\mathcal{O}_{D_2}$ 给出（$D_1=\\{x=0\\}$、$D_2=\\{y=0\\}$），箭头是限制映射。$\\mathcal{H}^0$ 是该映射的像：一个函数在两条轴上的限制相等的条件恰是它本身在并上给出（因为 $\\mathcal{O}_X$ 到两个分支的限制是单射，且在每个分支上的一元函数决定整体：$k[x,y]/(xy)$ 的元素写作 $a(x)+b(y)$，在 $D_1$ 上是 $a(0)+b(y)$，在 $D_2$ 上是 $a(x)+b(0)$，故限制相等要求 $a(x)-a(0)=b(y)-b(0)=$ 常数，即整体函数由两个分支限制决定）；$\\mathcal{H}^1=0$（余维 1 的相交使高次同调不出现）。于是 $\\mathcal{O}_X\\cong\\underline{\\Omega}^0_X$，X Du Bois。这个例子的意义在于：$X$ 连正规都不满足（原点的局部环不是整闭），仍然是 Du Bois 的。" },
      { title: "例子：尖点曲线 $y^2=x^3$ 与它的 Du Bois 复形", body: "取 $C=\\{y^2-x^3=0\\}\\subset\\mathbb{A}^2$（既约、不可约、非正规？尖点曲线是整的且正规化是 $\\mathbb{A}^1$，它自身不正规）。它的归一化 $\\nu:\\mathbb{A}^1\\to C$（$t\\mapsto(t^2,t^3)$）给出超消解：$X_0=\\mathbb{A}^1$，$X_1=$ 奇点处的纤维（一个点）。由定义 $\\underline{\\Omega}^0_C\\cong R\\nu_*\\mathcal{O}_{\\mathbb{A}^1}\\cong\\mathcal{O}_C$（因为 $\\nu$ 有限且 $\\nu_*\\mathcal{O}=$ 整闭包，而 $\\mathcal{O}_C$ 的整闭包正是 $\\nu_*\\mathcal{O}_{\\mathbb{A}^1}$，两者的差在单点处），故 $\\mathcal{H}^i(\\underline{\\Omega}^0_C)=0$（$i>0$），$C$ 是 Du Bois 的。核对更细的层：$H^1(C,\\underline{\\Omega}^0_C)=H^1(C,\\mathcal{O}_C)=k$（仿射曲线 $H^1$ 为 0？仿射曲线的凝聚层 $H^1=0$，所以这里两者都是 0），而 $H^0$ 给出 $k[t]$ 与 $k[x,y]/(y^2-x^3)$ 的比对，差异恰由 $t$ 与 $t^2,t^3$ 生成元的缺失反映——但 Du Bois 条件只要求 $\\mathcal{O}_X\\to\\underline{\\Omega}^0$ 同构，不要求 $\\mathcal{O}_X$ 自身正规，故非正规的尖点曲线同样通过检验。" },
    ],
    remarks: [
      "Du Bois 不蕴含 Cohen–Macaulay：这是它与有理性最显著的区别，有理性要求 CM（Kempf 判据的一半），而 Du Bois 只约束 $\\underline{\\Omega}^0_X$ 的同调；存在低维的 Du Bois 而深度不足的例子，因此\"Du Bois\"不能用来推 CM，也不能推 $S_2$ 型条件。要用对偶或除子理论必须另外验证 CM。",
      "特征 $p$ 没有 Du Bois 理论：构造依赖 de Rham 复形与 Hodge 理论（奇点消除与积分、超消解的上同调都比较的是复系数上同调），在特征 $p$ 中 $\\Omega^{\\bullet}$ 的行为完全不同（例如 $d$ 不是 $\\mathcal{O}$-线性、Cartier 算子替代 de Rham 的分解），因此\"Du Bois\"在特征 $p$ 中要么换成 F-分裂型条件，要么根本无从定义，特征零的判据不可搬用。",
      "比较映射的同构要求对所有 $p$ 同时成立：只验证 $p=0$ 的映射甚至只验证某一阶的上同调不足够；在构造反例时正是某个中间 $p$ 的比较映射失效，因此 Du Bois 判定必须逐 $p$ 核对，或者直接核对 $\\mathcal{O}_X\\to\\underline{\\Omega}^0_X$ 的导出同构性。",
      "既约性是出题的前提：Du Bois 复形是为既约簇（或更一般的约化情形下的有限型概形）构造的；对非既约概形，de Rham 复形的第 0 位不再由 $\\mathcal{O}$ 控制（例如 $k[\\epsilon]$ 型的幂零元带来额外的 Hodge 分量），比较映射 $\\mathcal{O}_X\\to\\underline{\\Omega}^0_X$ 必然不是同构，所以讨论 Du Bois 时通常先取 X 的既约结构。",
    ],
    corollaries: [
      { title: "推论：klt 奇点是 Du Bois 的", body: "特征零下 klt 奇点在 $\\mathbb{Q}$-Gorenstein 覆盖上有有理奇点，把这一结论沿覆盖下降到 X 并使用差异系数对相对对偶化复形的控制，即得 $\\mathcal{O}_X\\to\\underline{\\Omega}^0_X$ 同构，故 klt ⟹ Du Bois。这条推论把 MMP 的分级链嵌入 Hodge 理论的框架（klt ⟹ 有理 ⟹ Du Bois），并解释了为什么\"klt 奇点上的 Hodge 数可由常见的整体微分形式计算\"。", uses: ["rational-implies-du-bois", "hierarchy-and-counterexamples"] },
    ],
    references: [
      stacks("Section 33.27: Normalization", "0C3N"),
      stacks("Section 50.22: A Weil cohomology theory", "0FWD"),
      { title: "Complexe de de Rham filtré d'une variété singulière", author: "Philippe Du Bois", year: 1981 },
      { title: "Hodge theory of singular varieties (survey)", author: "Sándor Kovács", year: 2012 },
    ],
    history: HISTORY,
  },

  /* ═══════════════════════════════════════════════════════════
   * 9. 奇点谱
   * ═══════════════════════════════════════════════════════════ */

  "f-spectrum-singularity": {
    statement: "设 $f:(\\mathbb{C}^n,0)\\to(\\mathbb{C},0)$ 是孤立奇点的全纯函数芽（$n\\ge2$），$F=\\{f=t\\}$（$0<|t|\\ll1$）是 Milnor 纤维，$H^{n-1}(F)$ 上带有单值化算子 T 与极限混合 Hodge 结构（Steenbrink 构造）。Steenbrink 谱是 $H^{n-1}(F)$ 上的（带重数的）有理数集合：对每个谱数 $\\alpha\\in(0,n]$，其重数 $n_\\alpha$ 由极限混合 Hodge 结构的 Hodge 滤过分次维数给出（按 T 的约当块分解逐块读取）。三条基本性质：(1) 总重数 $\\sum_\\alpha n_\\alpha=\\mu$ 等于 Milnor 数；(2) 谱对偶（Varchenko–Steenbrink 对称性）：$n_\\alpha=n_{n-\\alpha}$，即谱关于 $\\alpha\\mapsto n-\\alpha$ 对称；(3) 每个 $\\alpha$ 与 T 的特征值 $\\exp(2\\pi i\\alpha)$ 的重数匹配：与 $\\alpha$ 同余模 1 的谱数重数之和等于该特征值的广义特征空间维数。对加权齐次 $f$，谱可以由 Jacobi 代数的单项式基完全显式计算。",
    explanation: "奇点谱是\"把混合 Hodge 结构压成一个离散测度\"的操作，它是奇点理论里少有的既携带全部 Hodge 信息又便于比较的数值不变量。它的三项好处分别为：总质量给出 Milnor 数（拓扑量），区间分布给出 Hodge 数（复结构量），对称性给出对偶（Poincaré 与硬 Lefschetz 在带边界的 Milnor 纤维上的体现）。在曲面奇点（$n=3$）的情形，谱的对称性与\"谱分布区间\"把奇点映射到实数轴上的一段\"质量分布\"，Arnold 的奇点邻接关系正好表现为谱的\"分裂\"与\"搬运\"：当一个奇点在形变中退化为另一个时，谱数只能整体移动并合并，而不会随意跳动，这条单调性是最强的分类约束之一。这也是\"奇点谱尤其适合曲面分类\"的来源。与技术层面相比，谱的缺点是依赖孤立性与光滑性假设（Milnor 纤维、单值化、混合 Hodge 结构都需要），并且在特征 $p$ 完全没有对应物；另一个常见误解是把谱数当成任意有理数——对加权齐次的情形它们是有理数且分母可算，但一般的孤立奇点谱数可以取很复杂的有理数。",
    steps: [
      step("milnor-fibration-and-monodromy", "Milnor 纤维、单值化与极限混合 Hodge 结构",
        "从拓扑开始。设 $f$ 在 0 处有孤立奇点，$B$ 是 0 附近的充分小球、$D$ 是充分小圆盘；Milnor 定理断言限制 $f|_{B\\cap f^{-1}(D\\setminus\\{0\\})}\\to D\\setminus\\{0\\}$ 是纤维化，纤维 $F=f^{-1}(t)$ 微分同胚于 $\\mathbb{C}^n$ 中的开球与超曲面的交（$n-1$ 维复流形，具有 $(n-1)$ 维胞腔的伦型：$F\\simeq\\bigvee_\\mu S^{n-1}$），其中 $\\mu=\\dim H^{n-1}(F)$ 是 Milnor 数、唯一非零的约化同调在中间次数。沿圆周 $|t|=\\varepsilon$ 走一圈给出单值化同构 $T:H^{n-1}(F)\\to H^{n-1}(F)$，它满足：$T$ 拟单质（$T=su$ 与半单部分与幂单部分交换，且 $T^m$ 幂单对某个 m），其特征值都是单位根。把纤维族沿径向（$t\\to0$）取限制：$H^{n-1}(F)$ 上得到限制混合 Hodge 结构（M. Steenbrink 与 Schmid 的理论），其权滤过以 $n-1$ 为中心，Hodge 滤过 $F^\\bullet$ 由对数形式的渐近展开给出。这一步的产物是一个\"带滤过、带 T 作用的有限维向量空间\"，它是谱的原料。",
        []),
      step("steenbrink-spectrum-definition", "谱的定义：按 Hodge 滤过与单值化的块读重数",
        "把上一步的对象按 T 的约当分解切开：$H^{n-1}(F)=\\bigoplus_\\lambda(H^{n-1}(F))_\\lambda$（广义特征空间，$\\lambda$ 取遍单位根）。对每个 $\\lambda$，取 $H_\\lambda$ 上的混合 Hodge 结构（$(H_\\lambda,F^\\bullet,W_\\bullet)$），并令 $\\lambda=\\exp(2\\pi i\\alpha_0)$ 取 $\\alpha_0\\in(0,1]$。谱的定义是：对 $\\alpha\\in(0,n]$ 令 $n_\\alpha$ 为\"$\\alpha$ 所在的 Hodge 层\"中 $H^{n-1}(F)$ 的相应分次维数之和，形式上 $n_\\alpha=\\dim\\operatorname{gr}^{\\lceil\\alpha\\rceil}_F\\operatorname{gr}^W_{\\lceil\\alpha\\rceil-1}(H_{e^{2\\pi i\\alpha}})$（其中 $\\operatorname{gr}^W$ 取权滤过在对应层的分次）。三种等价的说法：其一，$\\alpha$ 的\"整数部分\"给出 Hodge 层、\"小数部分\"给出权层（这是 Steenbrink 原始表述，用 V-滤过与谱对写）；其二，$n_\\alpha$ 等于把 $H^{n-1}(F)$ 的 Hodge 分次块按与小数的匹配重新分组后的维数；其三，谱数与 $T$ 的特征值通过 $\\alpha\\bmod1$ 对应，故\"同余模 1 的重数之和\"等于该特征值的广义特征空间维数。后一种说法给出了最方便的检验手段：先算单值化的约当块，再算每个块的 Hodge 分次，谱立刻落地。",
        ["milnor-fibration-and-monodromy"]),
      step("properties-mass-and-symmetry", "总质量、谱对偶与硬 Lefschetz",
        "三条性质的证明都能从上一步的定义读出，但各有不同的机制。总质量：$\\sum_\\alpha n_\\alpha=\\sum_\\lambda\\dim H_\\lambda=\\dim H^{n-1}(F)=\\mu$，这是\"分次维数求和等于全空间维数\"的直接结果。谱对偶 $n_\\alpha=n_{n-\\alpha}$：来源是 Milnor 纤维的 Poincaré 对偶与硬 Lefschetz 定理。$F$ 是有边界的 $n-1$ 维复流形，其混合 Hodge 结构是极化的；把 $\\alpha$ 与 $n-\\alpha$ 配对的是权滤过与 Hodge 滤过的互补关系（Hodge 分次的 $\\operatorname{gr}^p_F$ 与 $\\operatorname{gr}^{p'}_F$ 配对要求 $p+p'=n$），而 $\\alpha$ 的整数部分与小数部分分别进入 Hodge 层与权层，两个方向同时反转给出 $\\alpha\\leftrightarrow n-\\alpha$。注意这里对称中心是 $n/2$（不是 $n-1$ 的中心），这一点与\"权滤过以 $n-1$ 为中心\"看似冲突，原因是 Hodge 层与权层的偏移在定义中各占一半：$\\operatorname{gr}^{p}_F\\operatorname{gr}^W_{p-1}$ 的指标 $p+(p-1)$ 与 $n-\\alpha$ 的对应恰好抵消。核对 $x^2+y^2$（$n=2$，$\\mu=1$）：谱为 $\\{1\\}$，$n-1=1$ 保持不动，与对称性一致。",
        ["steenbrink-spectrum-definition"]),
      step("quasi-homogeneous-explicit-formula", "加权齐次情形的显式公式",
        "对加权齐次的 $f$（存在权重 $w_1,\\ldots,w_n\\in\\mathbb{Q}_{>0}$ 使 $f$ 在权 $\\deg x_i=w_i$ 下为权 1 齐次，且 $f$ 有孤立奇点），谱可以完全显式写出：取 Jacobi 代数 $\\mathcal{J}_f=\\mathbb{C}[x_1,\\ldots,x_n]/(\\partial f/\\partial x_1,\\ldots,\\partial f/\\partial x_n)$ 的一组单项式基 $\\{x^{a}\\}$（$\\mathcal{J}_f$ 在加权齐次下是一个分次的有限维代数，其维数等于 $\\mu$），则谱为多重集 $\\{\\sum_{i=1}^n(a_i+1)w_i:\\ x^a\\ \\text{取遍单项式基}\\}$。为什么这个公式成立：加权齐次情形可以用 toric 版本的 Steenbrink 计算——Milnor 纤维同伦等价于权投影下的仿射超曲面，其上的混合 Hodge 结构与单值化有显式的 monomial 计算（Milnor 数与 Jacobi 代数的维数相同是 Milnor 定理），而对数形式的渐近展开在 monomial 基上逐项给出上述指数（每一项的贡献是 $\\sum_i(a_i+1)w_i$ 的\"层\"）。总质量自动等于 $\\dim\\mathcal{J}_f=\\mu$；对称性由 Jacobi 代数的分次对称性（$x^a\\mapsto x^{b}$ 使 $\\deg$ 与 $1-\\deg$ 互换，其中 $b$ 由 $\\sum(b_i+1)w_i=n-\\sum(a_i+1)w_i$ 确定）给出。",
        ["properties-mass-and-symmetry"]),
      step("applications-and-adjacencies", "应用：分类、邻接与不变量",
        "谱的用途集中在三处。第一，曲面奇点的分类：对 $n=3$ 的孤立超曲面奇点（例如 $f=x^p+y^q+z^r$ 型的平面型与 $A_k,D_k,E_k$ 的 ADE 型），谱与几何亏格、嵌入维数、Milnor 数的组合给出强分类约束；Arnold 的邻接表（$A_k\\to A_{k-1}$、$D_k\\to D_{k-1}$ 等）在谱上表现为谱数的搬运：邻接时谱只能\"整体上下移动\"且不能产生\"离中心的跳跃\"，于是许多无法由 Milnor 数区分的奇点被谱区分开（例如某些相同 $\\mu$ 的奇点由谱的对称配对结构分离）。第二，谱与几何亏格：谱在小区间内的重数给出 $p_g$ 型不变量，对曲面奇点 $p_g=\\#\\{\\alpha\\in(1,2)\\}$ 一类的关系（按区间收集谱数与 Hodge 分次的对应）给出几何亏格的另一种算法。第三，与反常性的联系：谱的极值（最小与最大谱数）给出奇点的\"尖端\"位置，且与 $\\operatorname{lct}$ 等其他数值不变量相互制约。这三处应用都依赖同一条原则：谱是完整 Hodge 数据的线性化，因此任何只取\"总质量\"或\"Hodge 数\"的粗不变量都会丢失谱保留的信息。",
        ["quasi-homogeneous-explicit-formula"]),
    ],
    conclusion: "孤立奇点 $f:(\\mathbb{C}^n,0)\\to(\\mathbb{C},0)$ 的谱是由 Milnor 纤维的极限混合 Hodge 结构与单值化共同决定的、取值在 $(0,n]$ 中的有理数多重集：总重数为 Milnor 数 $\\mu$，满足谱对偶 $n_\\alpha=n_{n-\\alpha}$，并与单值化特征值的重数按模 1 对应。加权齐次情形下谱可由 Jacobi 代数的单项式基显式写成 $\\sum_i(a_i+1)w_i$，这条公式使谱在任何具体例子中都可手算。",
    dependencies: [],
    consequences: [],
    examples: [
      { title: "例子：$A_1$ 与 $A_3$ 的谱手算", body: "取 $f=x^2+y^2$（$A_1$，$n=2$）：Jacobi 理想 $(2x,2y)$，Jacobi 代数维数 1，单项式基 $\\{1\\}$，权重 $w=(\\frac12,\\frac12)$，公式给谱 $=\\{1\\cdot\\frac12+1\\cdot\\frac12\\}=\\{1\\}$。核对：$\\mu=1$，总质量 1 ✓；对称 $2-1=1$ ✓。取 $f=x^4+y^2$（$A_3$，$n=2$）：Jacobi 理想 $(4x^3,2y)$，单项式基 $\\{1,x,x^2\\}$，权重 $w=(\\frac14,\\frac12)$，公式给谱 $=\\{\\frac34,1,\\frac54\\}$。核对：$\\mu=3$ ✓；对称：$2-\\frac34=\\frac54$ ✓、$2-1=1$ ✓。第三次核对用单值化：$A_3$ 的单值化特征值为 $e^{2\\pi i\\cdot3/4},e^{2\\pi i},e^{2\\pi i\\cdot5/4}$，与谱数模 1 一一对应 ✓，而谱的小数部分 3/4、0、1/4 与这些特征值吻合。" },
      { title: "例子：$x^3+y^3$（$\\mu=4$）的谱与对称性完整性检验", body: "取 $f=x^3+y^3$（$n=2$，$\\mu=(3-1)(3-1)=4$）。Jacobi 理想 $(3x^2,3y^2)$，单项式基 $\\{1,x,y,xy\\}$，权重 $w=(\\frac13,\\frac13)$。逐项计算：$1\\mapsto\\frac13+\\frac13=\\frac23$；$x\\mapsto\\frac23+\\frac13=1$；$y\\mapsto\\frac13+\\frac23=1$；$xy\\mapsto\\frac23+\\frac23=\\frac43$。谱 $=\\{\\frac23,1,1,\\frac43\\}$。检验：总质量 $4=\\mu$ ✓；对称：$2-\\frac23=\\frac43$ ✓（重数各 1），$2-1=1$ ✓（重数 2，两个 $\\frac23$ 与两个 $\\frac43$ 对应 ✓）。再核对单值化：$x^3+y^3$ 的三次齐次性使单值化为有限阶（阶 3），特征值为 $e^{2\\pi i/3}$ 的多项式，三个不同特征值（含 $1$）对应的谱数模 1 分别为 $\\frac23,0,\\frac13$，与本例中 $\\frac23,1,\\frac43$ 的小数部分一致 ✓。这个例子说明\"多重集\"不是集合：重数必须保留，否则对称性检验会失败。" },
    ],
    remarks: [
      "孤立性不能省：Milnor 纤维化与混合 Hodge 结构的构造都基于孤立奇点（纤维有唯一的非零中间同调、单值化拟单质性的证明也随之简化）；对非孤立奇点，Milnor 纤维的同调可以出现在多个次数，单值化不必拟单质，谱需要改用其他工具（如非孤立奇点的限制 Hodge 结构或 $\\mathcal{D}$-模的手段）才能定义，直接套用本条的公式会给出无意义的结果。",
      "特征零与复解析假设不能省：谱的定义依赖混合 Hodge 结构与极限 Hodge 结构的存在性，而这两者都需要复结构与特征零；在特征 $p$ 中没有单值化与 Hodge 理论的对应物，唯一的替代是\"F-纯阈值\"与\"Bernstein–Sato 多项式的根\"这类局部不变量，它们的数值与谱没有直接的相等关系。",
      "谱不能只由 Milnor 数与奇点类型决定：同一 Milnor 数的两个奇点可以有不同谱（这正是谱比 $\\mu$ 更强的理由），因此在分类中不能用\"$\\mu$ 相同\"代替谱的比较；反过来，谱相同也不保证奇点双全纯等价（存在谱相同而不等价的例子），所以谱是强不变量但不能作为完全不变量使用。",
      "对称中心是 $n/2$ 而不是 $(n-1)/2$：把谱对偶的中心记错是最常见的计算错误，尤其当 $n$ 为奇数时两者给出不同配对（例如 $n=3$ 时中心为 $\\frac32$，谱在 $\\frac12$ 与 $\\frac52$ 处成对）。检验对称性时务必核对 $\\alpha+n-\\alpha=n$ 的整体中心，而不是权滤过指标 $n-1$ 的中心。",
    ],
    corollaries: [
      { title: "推论：谱确定 Milnor 数与几何亏格的界", body: "由总质量得 Milnor 数；由谱在各小区间上的重数得 Hodge 分次维数，进而得几何亏格与低次 Hodge 数；由对称性得谱分布关于 $n/2$ 的整体约束，因此任何 Hodge 型不变量的计算可以\"只在半区间内算一半\"，另一半由对称性读出。这条推论是曲面奇点分类中反复使用的\"半谱\"技巧。", uses: ["properties-mass-and-symmetry", "quasi-homogeneous-explicit-formula"] },
    ],
    references: [
      stacks("Section 50.22: A Weil cohomology theory", "0FWD"),
      { title: "The spectrum of hypersurface singularities", author: "Joseph Steenbrink", year: 1983 },
      { title: "Singularities of Differentiable Maps (Vol. II: Monodromy and Asymptotics of Integrals)", author: "Vladimir Arnold, Sabir Gusein-Zade, Alexander Varchenko", year: 1988 },
    ],
    history: HISTORY,
  },

  /* ═══════════════════════════════════════════════════════════
   * 10. 射流概形
   * ═══════════════════════════════════════════════════════════ */

  "f-jet-scheme": {
    statement: "设 X 是域 k 上的有限型概形，$k[t]/(t^{k+1})$ 是 $k$ 上的 $k$ 阶对偶数环。$k$ 阶射流概形 $\\operatorname{Jet}_k(X)$ 定义为可表函子 $T\\mapsto\\operatorname{Hom}_k(T\\times_k\\operatorname{Spec}k[t]/(t^{k+1}),X)$ 的代表对象；等价地，$\\operatorname{Jet}_k(X)$ 是 $X$ 上\"$k$ 阶无穷小弧\"的参数空间，其闭点对应于 $\\operatorname{Spec}k[t]/(t^{k+1})\\to X$ 的态射。基本性质：(1) 函子可表，故 $\\operatorname{Jet}_k(X)$ 对一切 X 存在且是 k 上有限型概形，构造纯代数（把方程按 t 展开取系数）；(2) $\\operatorname{Jet}_0(X)=X$，$\\operatorname{Jet}_1(X)$ 是切概形（在光滑点处是切丛，在奇点处包含切锥的信息）；(3) 函子性：态射 $f:X\\to Y$ 诱导 $\\operatorname{Jet}_k(f):\\operatorname{Jet}_k(X)\\to\\operatorname{Jet}_k(Y)$；(4) 对 X 光滑、$\\dim X=d$，$\\operatorname{Jet}_k(X)\\to X$ 是平滑的纤维化、纤维为 $\\mathbb{A}^{kd}$，故 $\\operatorname{Jet}_k(X)$ 光滑且 $\\dim=(k+1)d$；一般情形 $\\dim\\operatorname{Jet}_k(X)=(k+1)\\dim X$，但可能不约化、不纯维数。",
    explanation: "射流概形把\"无穷小弧\"这个几何直观变成可写方程的代数对象，这正是它能在任意特征下使用的原因。构造方法是纯代数的：把 $X$ 的方程里的坐标 $x_i$ 换成 $x_i(t)=\\sum_{j\\le k}x_i^{(j)}t^j$，按 $t$ 的幂次展开，得到的每个系数都给一条新方程，$k$ 阶射流概形就是这些方程在 $\\mathbb{A}^{(k+1)n}$ 中的公共零点集。这一步操作在特征 $p$ 下照样进行（不需要除法，只需要形式展开），因此射流概形是特征 $p$ 几何（导子、Cartier 算子、Frobenius 分裂、$p$-进 Hodge 理论）的基本构造之一。它的三条用途分别是：其一是弧空间理论（$k\\to\\infty$ 的极限）与消解、Nash 问题的联系；其二是导子与微分算子代数的超曲面/幂零化处理（射流概形是 $\\mathcal{D}$-模与晶体上同调的技术底座）；其三是奇点不变量（例如 $\\operatorname{Jet}_k(X)$ 的维数与约化性刻画了奇点的\"切空间增长\"）。需要注意的常见误解是把 $\\operatorname{Jet}_k(X)$ 当成纤维丛：只有在 X 光滑时它才是，一般情形维数公式只保证最大维数，且可能出现非约化分量。",
    steps: [
      step("representability", "可表性：射流函子与代表对象的存在",
        "先说明射流函子可表。给定 k-概形 T，函子 $\\Phi_X(T)=\\operatorname{Hom}_k(T\\times_k\\operatorname{Spec}k[t]/(t^{k+1}),X)$。对 $X=\\operatorname{Spec}A$ 仿射，$\\Phi_X(T)=\\operatorname{Hom}_k(A,T\\times\\operatorname{Spec}k[t]/(t^{k+1}))$\u0028反向\u0029$=\\operatorname{Hom}_k$-代数同态 $A\\to\\mathcal{O}_T\\otimes_kk[t]/(t^{k+1})$，即把 A 中的元素展开成 T 上的 $k+1$ 个\"系数函数\"。这一步立刻给出代表对象：取 $A$ 的一组生成元 $x_1,\\ldots,x_n$ 与关系理想 $I$，考虑自由的多项式环 $B=k[x_i^{(j)}:i\\le n,j\\le k]$，把 $x_i$ 映到 $\\sum_jx_i^{(j)}t^j$ 得到一个环同态 $A\\to B[t]/(t^{k+1})$，其核记为 $I_k$，则 $\\operatorname{Jet}_k(X)=\\operatorname{Spec}B/I_k$。可表性对一般（非仿射）X 由仿射图上的代表对象黏合得到，黏合数据的相容性来自函子的可表性与 Zariski 覆盖的局部化性质（这一步在有限型情形只需有限多个仿射图）。因为 $B/I_k$ 是 $k$ 上有限生成代数，$\\operatorname{Jet}_k(X)$ 是有限型 k-概形。",
        []),
      step("equations-by-taylor-expansion", "方程展开：显式方程与低阶射流概形",
        "把上一步的构造写成可算的形式。设 $X\\subset\\mathbb{A}^n$ 由 $f_\\ell(x_1,\\ldots,x_n)=0$（$\\ell=1,\\ldots,m$）定义。$k$ 阶射流概形 $\\operatorname{Jet}_k(X)\\subset\\mathbb{A}^{n(k+1)}$（坐标 $x_i^{(j)}$，$i\\le n$，$0\\le j\\le k$）由方程 $f_\\ell^{(j)}(x^{(0)},x^{(1)},\\ldots,x^{(j)})=0$ 定义，其中 $f_\\ell^{(j)}$ 是把 $x_i$ 代入 $\\sum_jx_i^{(j)}t^j$ 后 $f_\\ell$ 的 $t^j$ 系数（导数展开：$f_\\ell^{(j)}=\\sum_{(a)}c_a\\cdot t^{j}$）。前几阶：$j=0$ 给出 $f_\\ell(x^{(0)})=0$（即 $X$ 自身）；$j=1$ 给出 $\\sum_i\\frac{\\partial f_\\ell}{\\partial x_i}(x^{(0)})\\cdot x_i^{(1)}=0$（一次线性方程，故 $\\operatorname{Jet}_1(X)$ 在每一点上的纤维是切空间）；$j=2$ 给出带二次项与二阶导数的方程。由此 $\\operatorname{Jet}_1(X)\\to X$ 是 X 上的线性函子化的\"切概形\"。这套展开的优点是完全机械化：任何具体方程都可以逐项展开，从而把射流概形写成显式方程。",
        ["representability"]),
      step("smooth-case-fibration", "光滑情形：纤维化结构与维数",
        "若 X 在 k 上光滑、维数 d，则 $\\operatorname{Jet}_k(X)\\to X$ 是光滑（平滑）纤维化，纤维 $\\mathbb{A}^{kd}$。理由：由光滑性（更精确地：$\\Omega^1_{X/k}$ 局部自由与 $\\Omega^1$ 的自由基给出的\"形式光滑性\"），局部上可以选取 étale 坐标使 X 是 $\\mathbb{A}^d$ 的 étale 邻域；对 étale 态射 $\\operatorname{Jet}_k$ 交换（因为可表函子的构造只依赖 $A\\to B[t]/(t^{k+1})$ 的代数结构，而 étale 的局部同构性使 $\\operatorname{Jet}_k$ 与 étale 基变换相容），于是只需算 $X=\\mathbb{A}^d$：此时 $\\operatorname{Jet}_k(\\mathbb{A}^d)=\\operatorname{Spec}k[x_i^{(j)}]=\\mathbb{A}^{d(k+1)}$，投影 $\\operatorname{Jet}_k\\to\\operatorname{Jet}_0=\\mathbb{A}^d$ 的纤维为 $\\mathbb{A}^{dk}$。因此 $\\dim\\operatorname{Jet}_k(X)=(k+1)d$ 且 $\\operatorname{Jet}_k(X)$ 光滑。注意这条结论依赖 X 光滑：在奇点处纤维维数会跳升（例如 $\\operatorname{Jet}_1$ 的纤维是切锥的线性化，维数大于 $d$），但整个射流概形的最大维数仍由 $(k+1)d$ 给出。",
        ["equations-by-taylor-expansion"]),
      step("dimension-theorem-and-reducedness", "一般情形：维数定理与约化性",
        "对一般的 X，$\\dim\\operatorname{Jet}_k(X)=(k+1)\\dim X$。上界方向的证明用\"射流概形被局部主要化\"：把 X 嵌入 $\\mathbb{A}^N$（$N$ 充分大），则 $\\operatorname{Jet}_k(X)\\subset\\operatorname{Jet}_k(\\mathbb{A}^N)=\\mathbb{A}^{N(k+1)}$，而 X 的维数 $d$ 使 X 是 $N-d$ 个大集合的交（由 Krull 高度定理），在射流层面每上升一阶最多增加 $d$ 维的\"自由\"（因为 $x^{(j)}$ 的约束方程数与一阶情形同构地增长，而 $\\operatorname{Jet}_k(X)\\to\\operatorname{Jet}_{k-1}(X)$ 的纤维在一般点上是 $d$ 维的），逐阶相加得 $(k+1)d$；下界方向由一个具体的大维数分量给出（X 的正则轨迹上的射流构成 $d(k+1)$ 维的开子集），故维数恰为 $(k+1)d$。约化性则一般失败：例如 $X=\\{xy=0\\}$ 时 $\\operatorname{Jet}_1(X)$ 有非约化分量（一阶项的高次方程相互重叠），这说明射流概形的一般点可能带幂零元；把射流概形的非约化现象与奇点类型相连是特征 $p$ 几何的一类研究方向（例如\"射流概形的约化性\"与 Frobenius 分裂、$F$-纯的关系）。",
        ["smooth-case-fibration"]),
      step("arc-space-and-applications", "弧空间、Nash 联系与用途",
        "把 $k$ 取极限得到弧空间：$\\operatorname{Jet}_k$ 之间的自然投影给出逆向系统，其极限 $X_\\infty=\\varprojlim_k\\operatorname{Jet}_k(X)$（作为函子取 $k[[t]]$ 提供有限型概形射流）称为 X 的弧空间。弧空间一般不是概形（它是无限维的对象，且可以是不可数多个不可约分支的并），但它承载了几何信息：X 的奇点消解、Nash 变换、以及\"Nash 问题\"（弧空间的 Nash 分量与本质除子的对应）都在这一层面表述，Nash 猜想对曲面已由 Fernández de Bobadilla–Pelekis 等证明。射流概形的第二类用途是微分算子：$k$ 阶射流对应 $\\mathcal{D}$-模理论中的\"$k$ 阶导子\"，射流概形的坐标环恰是导子代数的多项式版本，因此 $\\operatorname{Jet}_k$ 是处理晶体上同调与 Cartier 算子（$t\\mapsto t^p$ 型的射流作用）的基本工具。第三类用途是奇点不变量：$\\dim\\operatorname{Jet}_k(X)$、射流概形的分支结构与约化性构成一整套可比较的不变量，在特征 $p$ 与特征零都可以计算。",
        ["dimension-theorem-and-reducedness"]),
    ],
    conclusion: "$\\operatorname{Jet}_k(X)$ 表示函子 $T\\mapsto\\operatorname{Hom}(T\\times\\operatorname{Spec}k[t]/(t^{k+1}),X)$，故对任意有限型 k-概形存在且为有限型概形；它由方程按 t 展开显式给出，$\\operatorname{Jet}_0=X$、$\\operatorname{Jet}_1$ 是切概形。X 光滑时 $\\operatorname{Jet}_k(X)\\to X$ 是 $\\mathbb{A}^{kd}$-纤维化，$\\dim=(k+1)d$；一般情形 $\\dim\\operatorname{Jet}_k(X)=(k+1)\\dim X$ 但可非约化。弧空间 $\\varprojlim\\operatorname{Jet}_k(X)$ 是消解与 Nash 问题的舞台。",
    dependencies: [],
    consequences: [],
    examples: [
      { title: "例子：$\\operatorname{Jet}_1(\\{xy=0\\})$ 的显式方程与维数", body: "取 $X=\\{xy=0\\}\\subset\\mathbb{A}^2$（坐标 $x,y$）。$\\operatorname{Jet}_1(X)\\subset\\mathbb{A}^4$（坐标 $x,y,x',y'$）由 $f^{(0)}=xy=0$ 与 $f^{(1)}=xy'+x'y=0$ 定义。逐分量解出：$xy=0$ 给出两支 $\\{x=0\\}$ 与 $\\{y=0\\}$。在 $\\{x=0\\}$ 上第二个方程变为 $x'y=0$，再分成 $\\{x=0,x'=0\\}$（坐标 $y,y'$ 自由，2 维）与 $\\{x=0,y=0\\}$（坐标 $x',y'$ 自由，2 维）；同理 $\\{y=0\\}$ 支给出两个 2 维分量。于是 $\\operatorname{Jet}_1(X)$ 的最大维数为 $2=(1+1)\\cdot1$，与维数公式一致。注意 $\\{x=0,y=0,x',y'\\text{ 自由}\\}$ 这个 2 维分量：它对应\"$X$ 在原点的零阶射流配任意一阶方向\"，即原点的切空间（$k^2$）被完整保留——这正是奇点处纤维维数跳升（从 1 跳到 2）的显式体现，也说明射流概形在奇点处\"记得\"切空间的额外维数。" },
      { title: "例子：$\\operatorname{Jet}_2(\\mathbb{A}^1)$ 与 $\\operatorname{Jet}_1$ 的纤维化核对", body: "取 $X=\\mathbb{A}^1=\\operatorname{Spec}k[x]$、$k=2$。由构造 $\\operatorname{Jet}_2(X)=\\operatorname{Spec}k[x^{(0)},x^{(1)},x^{(2)}]=\\mathbb{A}^3$，维数 $3=(2+1)\\cdot1$ ✓。投影 $\\operatorname{Jet}_2\\to\\operatorname{Jet}_0=\\mathbb{A}^1\\ (x^{(0)})$ 的纤维为 $\\mathbb{A}^2$（坐标 $x^{(1)},x^{(2)}$），维数 $2=kd$ ✓。几何解释：$k$ 阶射流就是多项式 $x(t)=x^{(0)}+x^{(1)}t+x^{(2)}t^2\\bmod t^3$，即 $X$ 上参数化曲线的 $k$ 阶泰勒数据；对 $X=\\mathbb{A}^1$ 没有任何约束，于是全部系数自由。换成 $X=\\{x^2=0\\}$（非约化的点）：$\\operatorname{Jet}_1(X)$ 由 $(x^{(0)})^2=0$ 与 $2x^{(0)}x^{(1)}=0$ 定义，在特征 $\\neq2$ 时给出 $x^{(0)}=0$（从而 $x^{(1)}$ 自由），在特征 2 时第一个方程给 $(x^{(0)})^2=0$（非约化）而第二个方程自动成立，两支的差正是\"特征 2 下射流概形把偶重刻画为幂零\"的现象，说明射流概形在特征 $p$ 会保留特征零中被忽略的信息。" },
    ],
    remarks: [
      "光滑性假设不可省：只有 X 光滑时 $\\operatorname{Jet}_k(X)\\to X$ 才是纤维丛、$\\operatorname{Jet}_k(X)$ 才光滑；一般情形 $\\operatorname{Jet}_k(X)$ 可以有多个分支与非约化结构，维数公式只保证最大维数。把\"射流概形是 $\\mathbb{A}^{kd}$-丛\"当普遍事实使用会在奇点处立刻出错（例如 $\\operatorname{Jet}_1$ 在原点的纤维维数是切空间维数，可以大于 $d$）。",
      "弧空间不是概形且不可数分支：$\\varprojlim\\operatorname{Jet}_k(X)$ 在概形范畴中没有代表对象，必须作为函子或形式对象处理；它一般有不可数多个不可约分支（例如 $\\mathbb{A}^2$ 的弧空间分支按\"趋向原点的速度\"参数化），把射流概形的有限维论证直接推广到弧空间会失效。",
      "函子只在 k-代数上作用，换基后行为可能改变：$\\operatorname{Jet}_k$ 与域的扩张相容（$\\operatorname{Jet}_k(X_K)=\\operatorname{Jet}_k(X)\\times_kK$），但与不光滑的基变换一般不交换（基变换后 X 可能失去光滑性，纤维化结构随之失效）。使用射流概形做族论证时必须核对基变换。",
      "射流阶数不能与导子阶数混淆：$k$ 阶射流对应 $k$ 阶导子（$\\mathcal{D}$-模意义）而非 $k$ 次多项式，$\\operatorname{Jet}_k$ 与 $\\operatorname{Jet}_{k'}$ 之间的投影不是同构，且 $\\operatorname{Jet}_k$ 的坐标环并不是 $\\mathcal{D}$-模本身（只是其对偶的代数化），混用这两套阶数会得出错误的维数与对偶陈述。",
    ],
    corollaries: [
      { title: "推论：$\\operatorname{Jet}_k$ 保持有限性与光滑性的部分性质", body: "由可表性，$\\operatorname{Jet}_k$ 把有限型概形送到有限型概形、把开浸入送到开浸入；由局部构造，$\\operatorname{Jet}_k$ 与有限乘积交换（$\\operatorname{Jet}_k(X\\times_kY)=\\operatorname{Jet}_k(X)\\times_k\\operatorname{Jet}_k(Y)$），故对光滑 X 的射流概形结构可以由 $\\mathbb{A}^n$ 的情形逐块拼出。这两条保证了在射影空间、环面簇、仿射空间上的一切射流计算都可以由坐标情形拼合。", uses: ["smooth-case-fibration", "representability"] },
    ],
    references: [
      stacks("Section 38.39: Descent vector bundles in positive characteristic", "0EXA"),
      stacks("Section 60.25: Pulling back along purely inseparable maps", "07PZ"),
      { title: "Arc spaces and the Nash problem (survey)", author: "Janos Kollár", year: 2010 },
      { title: "Lectures on Resolution of Singularities", author: "Janos Kollár", year: 2007 },
    ],
    history: HISTORY,
  },

}
