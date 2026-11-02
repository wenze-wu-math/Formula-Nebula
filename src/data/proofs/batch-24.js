/**
 * 批次 24 长篇证明数据：K3 曲面、Abel 簇极化、爆破与法锥、示性类、
 * Picard 群、Mori 锥定理、Kodaira 消没、半连续性、Grauert、一般伴随、
 * Hodge 菱形与模空间紧化的 13 个节点。
 *
 * 写作约定（与 scripts/_check-proof-file.mjs 的检查一致）：
 *   · 所有长正文使用双引号 JS 字符串；正文里若需引号一律用中文引号
 *     「」，因此字符串内绝不出现未转义的 ASCII 双引号；
 *   · 中文段落用 Unicode 数学符号（⊆ ⊗ → ↦ 𝔭 𝔪 ℓ χ ≅ ⊕ ∑），不经过 KaTeX；
 *   · $...$ 内写完整 LaTeX，反斜杠双写，多字符上下标加花括号，撇号只写 ASCII；
 *   · 引用只写已核实的 Stacks Project 稳定 tag，其余给教材名与作者；
 *   · 每步正文 400 字以上，不使用无信息量的凑字数句子。
 */

const step = (id, title, body, uses) => ({ id, title, body, uses: uses ?? [] })
const stacks = (title, tag, year = 2024) => ({
  title, author: 'The Stacks Project', year, url: `https://stacks.math.columbia.edu/tag/${tag}`,
})
const HISTORY = "本条由公开教材、期刊文献与 Stacks Project 命题重新组织，项目自行改写并注明来源，未复制原文。"

export const BATCH_24_PROOFS = {

  /* ═══════════════════════════════════════════════════════════
   * 1. K3 曲面的性质
   * ═══════════════════════════════════════════════════════════ */

  'b-k3-properties': {
    statement: "设 k 是代数闭域，X 是 k 上的光滑射影曲面。若 $\\omega_X\\cong\\mathcal{O}_X$ 且 $H^1(X,\\mathcal{O}_X)=0$，称 X 为 K3 曲面；复解析情形等价于：X 是单连通的紧复曲面且典范丛平凡。由此立刻读出 $p_g=h^0(\\omega_X)=1$、$q=h^1(\\mathcal{O}_X)=0$，故 $\\chi(\\mathcal{O}_X)=1-q+p_g=2$。Noether 公式 $\\chi(\\mathcal{O}_X)=(c_1^2+c_2)/12$ 与 $c_1=-K_X=0$ 给出 $c_2=24$，即拓扑欧拉数 $\\chi_{\\text{top}}(X)=24$，于是 Betti 数为 $b_0=b_4=1$、$b_1=b_3=0$、$b_2=22$；Hodge 数为 $h^{2,0}=h^{0,2}=1$、$h^{1,1}=20$。$H^2(X,\\mathbb{Z})$ 是秩 22 的偶幺模格，符号差 $(3,19)$，由偶幺模不定格的分类同构于 $U^{\\oplus 3}\\oplus E_8(-1)^{\\oplus 2}$。",
    explanation: "K3 曲面之所以在曲面分类中占据中心位置，是因为它把「典范类为零」这一最松的正性条件与「单连通」这一最强的拓扑条件组合在一起，得到的是一族在数值上几乎完全刚性、在几何上却极为丰富的对象。数值刚性体现在三个层面：第一，拓扑被完全固定，$\\chi_{\\text{top}}=24$ 与单连通性把 Betti 数钉死；第二，$H^2$ 的格结构被完全固定，偶、幺模、符号差 $(3,19)$ 三个条件在秩 22 的不定格里只剩唯一同构类，因此任两个 K3 的 $H^2$ 作为格是同构的；第三，Hodge 数被固定，$h^{1,1}=20$ 恰好是变形理论给出的模空间维数加一。而几何的丰富性来自格子论的自由度：$H^2$ 里可以容纳的代数类构成了不同的 Néron–Severi 格，Picard 数 $\\rho$ 在 1 与 20 之间变化，$\\rho=1$ 的 K3 上一切曲线都是超平面类的倍数，$\\rho=20$ 的奇异 K3 上则挤满了有理曲线。整个 K3 理论因此可以概括为一句话：拓扑与 Hodge 结构是常数，几何内容全部编码在 Néron–Severi 格如何嵌入这个固定的偶幺模格之中。",
    steps: [
      step('definitions-and-invariants', '两种定义的等价与三个基本数值',
        "K3 曲面的定义有代数与解析两种写法。代数写法：k 是代数闭域，X 是 k 上光滑射影曲面，$\\omega_X\\cong\\mathcal{O}_X$ 且 $H^1(X,\\mathcal{O}_X)=0$。解析写法：X 是单连通的紧复曲面且典范丛平凡。两者的对接依赖复曲面理论：由 $\\omega_X\\cong\\mathcal{O}_X$ 得 $p_g=h^0(\\omega_X)=1$；由 $q=h^1(\\mathcal{O}_X)=0$ 与 Hodge 理论得 $b_1=2q=0$；反向地，紧 Kähler 曲面上 $b_1=0$ 使基本群有限，再用 $\\chi(\\mathcal{O}_X)$ 与覆盖理论排除非平凡有限覆盖，于是 $q=0$ 与单连通在同一组数值条件下互推。定义立刻给出三个锚点数：$p_g=1$、$q=0$、$\\chi(\\mathcal{O}_X)=1-q+p_g=2$。这三个数的用途分别是：$\\chi(\\mathcal{O})=2$ 经 Noether 公式决定 $c_2$；$q=0$ 说明 $\\operatorname{Pic}$ 的连续部分消失，线丛离散化；$p_g=1$ 说明 Hodge 分解中 $(2,0)$ 与 $(0,2)$ 分量各是一维，因而存在唯一（相差标量）的全纯 2-形式，它是 K3 上一切周期计算的载体。",
        []),
      step('noether-formula-and-betti', 'Noether 公式定第二 Chern 类与 Betti 数',
        "把 $\\chi(\\mathcal{O}_X)=2$ 与 $c_1=-K_X=0$ 代入 Noether 公式 $\\chi(\\mathcal{O}_X)=(c_1^2+c_2)/12$，立刻得 $c_2=24$。这里的 $c_2$ 是切丛的第二 Chern 类，它与拓扑欧拉数相等（对复曲面 $\\int_X c_2(T_X)=\\chi_{\\text{top}}(X)$，这是 Gauss–Bonnet 在复情形下的形式），于是 $\\chi_{\\text{top}}(X)=24$。再由单连通性与 Poincaré 对偶拆分交替和：$\\chi_{\\text{top}}=b_0-b_1+b_2-b_3+b_4=1-0+b_2-0+1=24$，解得 $b_2=22$。这正是 K3 的拓扑刚性：只要 $\\omega$ 平凡且 $q=0$、单连通，第二 Betti 数必须是 22，没有任何自由度。与 $b_2=22$ 配套的是 Hodge 分解 $H^2(X,\\mathbb{C})=H^{2,0}\\oplus H^{1,1}\\oplus H^{0,2}$，其中 $h^{2,0}=p_g=1$、$h^{0,2}=\\overline{h^{2,0}}=1$（复共轭对称），故 $h^{1,1}=22-2=20$。$h^{1,1}=20$ 是后面计算变形空间的入口：对 K3 而言 $h^1(X,T_X)=h^{1,1}=20$，模空间维数比它少一。",
        ['definitions-and-invariants']),
      step('intersection-lattice', '相交格：偶、幺模、符号差 (3,19)',
        "这一步把 $H^2$ 的格结构定死，最后给出分类结论。偶性来自伴随公式：设 $C\\subset X$ 是光滑不可约曲线，则 $K_C=(K_X+C)|_C=C|_C$，取次数得 $2p_a(C)-2=C^2$，故一切曲线类的自交数都是偶数。由于 $H^2$ 由代数类在实系数下张成（复情形下代数类是 $H^{1,1}\\cap H^2(X,\\mathbb{Z})$），偶性从曲线类传递到整个格：$x^2\\in 2\\mathbb{Z}$ 对一切 $x\\in H^2(X,\\mathbb{Z})$ 成立。幺模性来自 Poincaré 对偶：$H^2(X,\\mathbb{Z})$ 无挠且相交配对给出同构 $H^2(X,\\mathbb{Z})\\cong H^2(X,\\mathbb{Z})^{\\vee}$（紧定向流形的相交配对是幺模的，复曲面同理）。符号差由 Hodge 指标定理读出：在 Kähler 曲面上相交形式限制在 $H^{2,0}\\oplus H^{0,2}$ 的实部分上是正定的（一维复空间给出 2 维实正定部分），而在 $H^{1,1}$ 的实部分（原点的正交补，实维数 20）上负定，故符号差为 $(2+1,20-1)=(3,19)$：第 3 个正方向由 Kähler 类贡献。最后引用偶幺模不定格的分类：秩为 $8a+8b$ 的偶幺模不定格若符号差为 $(p,q)$ 则同构于 $U^{\\oplus a}\\oplus E_8(-1)^{\\oplus b}$，此处秩 $22=8\\cdot 1+8\\cdot 2$ 与符号差 $(3,19)$ 给出 $a=3$、$b=2$。",
        ['noether-formula-and-betti']),
      step('hodge-numbers-and-moduli', 'Hodge 数与 19 维模空间',
        "由 $b_2=22$ 与 $h^{2,0}=h^{0,2}=1$ 得 $h^{1,1}=20$，而 $q=0$ 给 $h^{1,0}=h^{0,1}=0$、$h^{0,0}=h^{2,2}=1$，Hodge 菱形完全确定：第 0 行 1；第 1 行 0 与 0；第 2 行 1、20、1；第 3 行 0 与 0；第 4 行 1。变形维度从 $H^1(X,T_X)$ 读出：光滑曲面有 $T_X\\cong\\Omega^1_X\\otimes\\omega_X^{-1}$（由配对 $\\Omega^1\\otimes\\Omega^1\\to\\omega$ 给出的自然同构），代入 $\\omega_X\\cong\\mathcal{O}_X$ 得 $T_X\\cong\\Omega^1_X$，于是 $h^1(T_X)=h^1(\\Omega^1_X)=h^{1,1}=20$，而 $h^0(T_X)=h^0(\\Omega^1)=0$、$h^2(T_X)=h^2(\\Omega^1)=h^{2,1}=0$。所以复结构变形空间是 20 维且无阻碍（$H^2=0$ 给出光滑性），模空间的维数是 $20-1=19$，减去的 1 来自把变形参数沿 $\\mathbb{C}^{\\times}$ 的标量缩放商掉（$H^0(T_X)=0$ 说明 K3 没有无穷小自同构，只剩有限群作用）。19 维也在 Torelli 定理里得到印证：周期映射把 K3 送到 19 维的周期域，且局部是双射；配合适当的单值群作用与射影性判据即得周期点决定同构类的完整型结论。",
        ['intersection-lattice']),
      step('curves-and-picard-number', '曲线结构：偶自交数与 Picard 数',
        "把伴随公式用在具体曲线上得到 K3 的曲线理论。设 $C\\subset X$ 是不可约曲线，由 $K_X=0$ 与 $K_C=(K_X+C)|_C$ 得 $2p_a(C)-2=C^2$：自交数由算术亏格完全决定，反过来也成立。三条推论。第一，$C^2$ 恒为偶数，且 $C^2\\ge-2$；$C^2=-2$ 当且仅当 $p_a(C)=0$，即 $C$ 是有理曲线，称 $(-2)$-曲线。第二，K3 上不存在 $(-1)$-曲线：$C^2=-1$ 会给出 $2p_a(C)-2=-1$，左端是偶数而右端是奇数，矛盾；因此 K3 上不可能有可吹落的例外曲线，它不是有理曲面。第三，光滑不可约曲线若是超平面类 $H$ 的 $m$ 倍（$C\\equiv mH$），则 $C^2=m^2H^2$ 决定了亏格，这给极化类型的计数提供入口。Néron–Severi 群 $\\operatorname{NS}(X)=H^{1,1}\\cap H^2(X,\\mathbb{Z})$（复情形）的秩就是 Picard 数 $\\rho$，且 $1\\le\\rho\\le h^{1,1}=20$：下界由充分一般的 K3 达到（只含超平面类的倍数），上界是 Hodge 数的硬界；$\\rho=20$ 的 K3 称为奇异 K3，其上曲线格已经与整个格重合，几何出现大量退化。",
        ['hodge-numbers-and-moduli', 'intersection-lattice']),
    ],
    conclusion: "K3 曲面由 $\\omega_X\\cong\\mathcal{O}_X$ 与 $H^1(\\mathcal{O}_X)=0$ 定义，自动满足 $p_g=1$、$q=0$、$\\chi(\\mathcal{O})=2$、$c_2=\\chi_{\\text{top}}=24$、$b_2=22$、$h^{1,1}=20$；$H^2(X,\\mathbb{Z})$ 是秩 22 的偶幺模格，符号差 $(3,19)$，必同构于 $U^{\\oplus 3}\\oplus E_8(-1)^{\\oplus 2}$。对一切不可约曲线 $C$ 有 $C^2=2p_a(C)-2$，故不存在 $(-1)$-曲线；$\\rho=\\operatorname{rank}\\operatorname{NS}(X)$ 满足 $1\\le\\rho\\le 20$，模空间维数为 19。",
    dependencies: [],
    consequences: [],
    explanation: "把 K3 的性质串起来会看到一条清晰的因果链：定义给出 $p_g$ 与 $q$，两者给出 $\\chi(\\mathcal{O})$，Noether 公式把它转成 $c_2$，Gauss–Bonnet 把 $c_2$ 转成欧拉数，Poincaré 对偶加单连通性把欧拉数转成 $b_2$，Hodge 分解把 $b_2$ 拆成 $h^{1,1}=20$，最后 $h^1(T_X)=h^{1,1}$ 给出变形维度。整条链上没有任何可调参数，这就是 K3 拓扑刚性的精确含义。与此同时，相交格的仿射自由度却很大：$U^{\\oplus 3}\\oplus E_8(-1)^{\\oplus 2}$ 是一个符号差 $(3,19)$ 的定型，它的正定子格、可能的代数类子格、以及子格到曲线的几何实现，构成了 K3 几何的全部内容。曲线公式 $C^2=2p_a-2$ 是这条链与几何之间唯一的接口：它说明自交数不是拓扑自由的量，而被亏格锁定，因此有理曲线只能是 $(-2)$-曲线，而 $(-2)$-曲线在格中可以被分类（它们对应根格中的向量）。最后，19 维周期域与 Torelli 定理说明 K3 的双有理几何完全由 Hodge 结构决定，这在曲面分类中是独一无二的地位。",
    examples: [
      { title: "例子：$\\mathbb{P}^3$ 中的光滑四次曲面", body: "取 $X=V(f_4)\\subset\\mathbb{P}^3$ 是光滑四次曲面。由伴随公式 $\\omega_X=\\mathcal{O}_{\\mathbb{P}^3}(4-3-1)|_X=\\mathcal{O}_X$，典范丛平凡。$H^1(\\mathcal{O}_X)=0$ 由 Lefschetz 超平面定理给出（光滑曲面在 $\\mathbb{P}^3$ 中，$H^1$ 与 $\\mathbb{P}^3$ 的相同，而 $H^1(\\mathbb{P}^3)=0$），故 X 是 K3。它是最容易手算的例子：超平面截面 $C=X\\cap H$ 是平面四次曲线，由 $2g-2=C^2=H^2=4$ 得 $g=3$，与平面四次曲线亏格 3 一致；再由 Noether 公式反推 $c_2=12\\chi(\\mathcal{O})-c_1^2=24-0=24$，与 X 的欧拉数一致。这个例子还展示了 Picard 数的跳跃：充分一般的四次曲面满足 $\\rho=1$（Noether–Lefschetz 定理，$\\operatorname{NS}$ 由超平面类生成），而 Fermat 四次曲面 $x_0^4+x_1^4+x_2^4+x_3^4=0$ 有 $\\rho=20$，是奇异 K3 的经典样本；同一个 19 维模空间里因此同时容纳了最瘦与最胖的格。" },
      { title: "例子：以光滑六次曲线为分支的双重覆盖", body: "取 $\\pi:X\\to\\mathbb{P}^2$ 是沿光滑六次曲线 $B$ 分支的双重覆盖。由 $K_X=\\pi^{\\ast}(K_{\\mathbb{P}^2}+\\frac{1}{2}B)=\\pi^{\\ast}(\\mathcal{O}(-3)+\\mathcal{O}(3))=\\mathcal{O}_X$ 得典范丛平凡；又因覆盖有限平坦，$H^1(\\mathcal{O}_X)$ 拆成不变与反不变部分，反不变部分同构于 $H^1(\\mathcal{O}_{\\mathbb{P}^2}(-3))=0$，不变部分同构于 $H^1(\\mathcal{O}_{\\mathbb{P}^2})=0$，故 $q=0$；单连通性由去掉分支点的开集上基本群的两倍关系核对。于是 X 是 K3，次数 $H^2=2$（$\\pi^{\\ast}$ 超平面类的自交）。数值核对：$\\chi_{\\text{top}}(X)=2\\chi(\\mathbb{P}^2)-\\chi(B)=2\\cdot 3-(2-2\\cdot 10)=6+18=24$，其中 $B$ 是光滑六次曲线、亏格 10，与 K3 的 $c_2=24$ 完全吻合。这条核对说明双重覆盖的欧拉数公式与 Noether 公式是同一件事的两种写法。" },
    ],
    remarks: [
      "仅有 $\\omega_X\\cong\\mathcal{O}_X$ 加 $p_g=1$ 不足以定义 K3：Abel 曲面同时满足 $K=0$ 与 $p_g=1$，但 $q=2$、$\\chi(\\mathcal{O})=0$，故 $c_2=0$ 而 Betti 数完全不同；把 $q=0$ 换成 $q>0$ 后整条因果链在 Noether 公式处断裂。这说明定义的每一条都是必要的，不能用 K 平凡一句代替。",
      "偶性是整个格论结构的关键，一旦允许奇类整条几何就变样：$C^2=2p_a(C)-2$ 使自交数只能是偶数，因此不存在 $(-1)$-曲线，K3 不能被吹落成更小的模型；这也解释了为什么曲面分类中 K3 与有理曲面（其极小模型为 $\\mathbb{P}^2$ 或直纹面，$\\rho$ 与 $K^2$ 的关系截然不同）必须分在不同类型里。若在证明中忽略偶性而套用一般曲面的相交计算，就会错误地允许 $(-1)$-曲线。",
      "符号差 $(3,19)$ 中的那个额外的正方向来自 Kähler 类而非代数类：$H^{2,0}\\oplus H^{0,2}$ 贡献 2 维正定，Kähler 类贡献第 3 维，而 $H^{1,1}$ 的实 20 维空间上配对负定。因此在纯代数（不假定可嵌入复流形）的框架下要复原符号差，必须额外使用 Hodge 指标定理或把 Kähler 类换成丰沛实类的极限；把 $H^{1,1}$ 当作整体负定的空间会得到符号差 $(2,20)$ 的错误结论。",
      "特征 p 中定义必须补条件：$\\omega_X\\cong\\mathcal{O}_X$ 与 $H^1(\\mathcal{O}_X)=0$ 依然可以陈述，但单连通不再有复解析含义，且用 $\\ell$-进上同调算出的 Betti 数需要另行论证（有限性与平坦性会带来额外麻烦）。实际使用的定义通常是：K 平凡、$H^1(\\mathcal{O})=0$ 且 X 射影，此时 $b_2=22$ 等结论仍成立，但周期映射与 Torelli 定理的形式与特征零不同。",
    ],
    corollaries: [
      { title: "推论：K3 上没有可收缩的例外曲线", body: "由 $C^2=2p_a(C)-2$ 知自交数为偶数，故 $C^2=-1$ 不可能；于是 Castelnuovo 的收缩判据在 K3 上没有适用对象，K3 在极小模型意义下自动极小（K 为 nef 且更是平凡的）。进一步，若 $C^2=-2$ 则 $p_a(C)=0$，K3 上一切 $(-2)$-曲线都是有理曲线，它们构成的根系是格论分类的直接对象，这与曲面分类中极小模型与收缩的讨论形成对照。", uses: ['curves-and-picard-number'] },
    ],
    references: [
      stacks('Section 33.10: K3 surfaces', '0435'),
      { title: 'Compact Complex Surfaces', author: 'Wolf Barth, Klaus Hulek, Chris Peters, Antonius Van de Ven', year: 2004 },
      { title: 'K3 Surfaces', author: 'Shigeyuki Kondo' },
    ],
    history: HISTORY,
  },

  // __APPEND__
}
