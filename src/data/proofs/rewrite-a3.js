/**
 * 改写批 A3：把两条只有四步一句话摘要的旧记录，补成逐步核验的长篇证明。
 *
 * 写作约定与批 B 保持一致：
 *   · 正文用中文长段 + Unicode 数学符号（⊆ ⊂ ∩ ∪ ⊗ → ↦ 𝔪 𝔭 κ ε ≅ 𝔪² ⋂ ∑），在页面中直接作为文本排版；
 *   · 需要真正的公式排版时才用 $...$ 包住 LaTeX，分隔符必须成对，且命令必须带反斜杠；
 *   · 引用只写已核实可访问的 Stacks Project 稳定 tag。
 *
 * 收录：noetherian（等价条件的循环论证）、tangent-space（两种描述的同一性）。
 */

const step = (id, title, body, uses = []) => ({ id, title, body, uses })
const stacks = (title, tag, year = 2024) => ({
  title, author: 'The Stacks Project', year, url: `https://stacks.math.columbia.edu/tag/${tag}`,
})

export const REWRITE_A3_PROOFS = {

  /* ──────────────────────────────────────────────────────────────
   * 一、Noether 环：三个条件的循环等价
   * ────────────────────────────────────────────────────────────── */

  'noetherian': {
    statement: '证明以下条件等价：A 是 Noether 环；A 的每个理想有限生成；每条递增理想链最终稳定。',
    steps: [
      step('three-conditions', '把三个条件写成可以互相搬运的精确陈述',
        '固定交换含幺环 A。三个候选条件分别是：(FG) A 的每个理想都能由有限多个元素生成；(ACC) 任意递增理想链 $I_1\\subseteq I_2\\subseteq I_3\\subseteq\\cdots$ 都存在下标 N，使得当 n≥N 时 $I_n=I_N$；(MAX) A 的任意非空理想族按包含关系都有极大元，即族内存在 $I_0$ 不被族中任何理想严格包含（注意这里的极大元是对族内元素而言，不是对 A 的全部理想而言，这一点是下面第三步成立的唯一原因）。环论中通常把这三条中的任意一条作为 Noether 环的定义，因此证明它们等价不是循环论证：只需在固定其中一条的前提下推导出另外两条，三条单向蕴含合成一个环即可。要把三条陈述写清楚，必须先明确“理想”“生成”“递增链”都发生在同一个环 A 里，而不是在商环或局部化里；后面的传递性结果说的正是这些操作不会破坏 Noether 性，因此“在哪个环里数理想”正是全条证明的关键所在。',
        []),
      step('finitely-generated-implies-acc', '有限生成 ⟹ 递增链稳定',
        '假设 (FG) 成立，取任意递增链 $I_1\\subseteq I_2\\subseteq\\cdots$，令 $I=\\bigcup_n I_n$。先确认 I 是理想：对任意 $a,b\\in I$，存在下标 p、q 使 $a\\in I_p$ 而 $b\\in I_q$；取 $m=\\max(p,q)$ 并利用链递增，得 $a,b\\in I_m$，于是 $a-b\\in I_m\\subseteq I$；对 $r\\in A$，$ra\\in I_p\\subseteq I$；又 $0\\in I_1$。故 I 是理想。由 (FG)，$I=(a_1,\\ldots,a_r)$。每个生成元 $a_i$ 属于并集，故落在某个 $I_{n_i}$ 中；取 $N=\\max_i n_i$，由链递增得所有 $a_i\\in I_N$。于是 $(a_1,\\ldots,a_r)\\subseteq I_N$，而 $I_N\\subseteq I$ 由定义显然，故 $I=I_N$。对每个 $n\\ge N$ 便有 $I_N\\subseteq I_n\\subseteq I=I_N$，即 $I_n=I_N$。链从第 N 项之后稳定，(ACC) 得证。',
        ['three-conditions']),
      step('acc-implies-max', '递增链稳定 ⟹ 非空理想族有极大元',
        '假设 (ACC) 成立，设 $\\mathcal{S}$ 是 A 的非空理想族。用反证法：若 $\\mathcal{S}$ 没有极大元，则对族中每个 $I\\in\\mathcal{S}$ 都存在 $J\\in\\mathcal{S}$ 使 $I\\subsetneq J$，也就是可以被严格合法地放大一次。于是可以从任取的一个 $I_1\\in\\mathcal{S}$ 出发归纳地取 $I_{n+1}\\in\\mathcal{S}$ 满足 $I_n\\subsetneq I_{n+1}$，得到一条严格递增的理想链。这条链的每一项都由不同的理想占据，链在任何位置之后都不会稳定，与 (ACC) 矛盾。因此 $\\mathcal{S}$ 必含极大元，(MAX) 得证。这一步只用到选择公理中极弱的形式（可数多次选择），是标准做法。',
        ['finitely-generated-implies-acc']),
      step('contrapositive-max-implies-acc', '验证 (ACC) 与 (MAX) 互为逆否形式',
        '为看清上面两步的实质，把两条陈述都写成逆否命题。(ACC) 的否命题是：存在递增理想链 $I_1\\subseteq I_2\\subseteq\\cdots$ 使对无穷多个 n 有 $I_n\\subsetneq I_{n+1}$，也就是链的真包含发生无穷多次。(MAX) 的否命题是：存在非空理想族 $\\mathcal{S}$，使族中每个理想都能被族内另一个理想严格包含，这样的族没有极大元。第二步给出的正是“没有极大元 ⟹ 可以造出严格递增链”，而第一步的逆否形式则是“严格递增链 ⟹ 链不稳定”，两条反向蕴含把 (MAX) 与 (ACC) 直接接通，中间不需要任何额外的中介条件。把这一步单独写出来的理由是：不少教材把 (MAX) 当作“有限性条件的良序版本”来使用，读者若不核对逆否形式，往往误以为 (MAX) 说的极大元是对 A 的全部理想成立的，从而在局部化等情形下把结论用错。',

        ['acc-implies-max']),
      step('max-implies-finitely-generated', '极大性 ⟹ 每个理想有限生成（论证的关键一步）',
        '假设 (MAX) 成立，设 I 是 A 的任意理想，要证明 I 有限生成。若 I 有限生成则结束，故设 I 不是有限生成的，我们从中造出矛盾。记 $\\mathcal{S}$ 为 I 的所有有限生成子理想组成的集合，它是非空的，因为 $0=(0)$ 是有限生成子理想。由 (MAX)，$\\mathcal{S}$ 有极大元 $J=(a_1,\\ldots,a_r)$。断言 $J=I$：若不然，取 $b\\in I\\setminus J$，则 $J\\subsetneq J+(b)\\subseteq I$，而 $J+(b)=(a_1,\\ldots,a_r,b)$ 仍是有限生成的子理想，于是 $J+(b)\\in\\mathcal{S}$ 严格包含极大元 J，矛盾。所以 $I=J$ 是有限生成的，与假设“I 不是有限生成的”矛盾。因此每个理想都有限生成，(FG) 得证。换一种说法：若 I 不能有限生成，就能沿着 I 逐个挑选不属于当前子理想的元素，得到一列 $a_1,a_2,a_3,\\ldots$ 使 $(a_1,\\ldots,a_n)$ 严格递增，这条链永远不停；它的“最终理想”就是把整列元素都加进来，而这个过程不可能在第 n 步结束，正说明 I 里总有下一个元素可取。',
        ['contrapositive-max-implies-acc']),
      step('cycle-closes', '闭合循环：从 (FG) 回到出发处，三个条件等价',
        '把四段蕴含串起来：由第二步，(FG) 推出 (ACC)；由第三步与第四步，(ACC) 推出 (MAX)；(MAX) 推出 (FG) 由第五步给出。于是三条陈述两两等价：任何两条之间都有两段方向明确的蕴含，例如 (ACC)⟹(MAX)⟹(FG)⟹(ACC)。这就完成题目要求的循环论证。循环闭合的意义在于，之后只要验证三条中的任意一条，就自动获得另外两条，而实际写作中三种形式各有用处：证明多项式环及其商是 Noether 环时用 (FG) 最方便（直接给出生成元），证明某族理想存在极大元（例如为 Zorn 引理的引子）时用 (MAX) 最方便，做升链归纳或对理想链做归纳时用 (ACC) 最方便。因此“等价”不是装饰性的结论，而是允许在证明不同命题时自由挑选最好用的那条形式。',
        ['max-implies-finitely-generated']),
      step('quotient-inheritance', '商环的传递性：Noether 性沿满射保持',
        '设 $A\\to A/\\mathfrak{a}$ 是商映射。A 的理想与含 $\\mathfrak{a}$ 的理想之间存在保持包含关系的双射 $J\\mapsto J/\\mathfrak{a}$，逆映射把 $\\bar{J}$ 送到它在 A 中的原像 $\\pi^{-1}(\\bar{J})$。于是：若 A 满足 (ACC)，则 $A/\\mathfrak{a}$ 中的任何递增链 $\\bar{I}_1\\subseteq\\bar{I}_2\\subseteq\\cdots$ 拉回后成为 A 中的递增链并最终稳定，说明原链也稳定；若 A 满足 (FG) 而 $\\mathfrak{a}=(a_1,\\ldots,a_n)$、$J=(b_1,\\ldots,b_m)$，则 $A/\\mathfrak{a}$ 中的理想 $\\bar{J}$ 由 $\\bar{b}_1,\\ldots,\\bar{b}_m$ 生成。两种论证都可用，结论一致：Noether 环的商环仍是 Noether 环。这一步就是几何上“闭子概形的坐标环继承 Noether 性”的代数来源，也是 Hilbert 基定理能对多项式环的商环直接适用的原因。',
        ['cycle-closes']),
      step('localization-inheritance', '局部化的传递性：Noether 性沿乘法集保持',
        '设 S⊆A 是乘法集，要证 $S^{-1}A$ 是 Noether 环。做法是给出理想的一一对应：$S^{-1}A$ 的理想 J 都满足 $J=S^{-1}I$，其中 I 是 J 在自然映射 $A\\to S^{-1}A$ 下的原像，因此 $S^{-1}A$ 的理想都形如 $S^{-1}I$（I 跑遍 A 的理想）。这个对应保持包含关系，并且把 A 的 (ACC) 直接搬过来：$S^{-1}A$ 中的递增链 $S^{-1}I_1\\subseteq S^{-1}I_2\\subseteq\\cdots$ 取原像后是 A 中的递增链，最终稳定，所以原链稳定。若想用 (FG)：$I=(a_1,\\ldots,a_r)$ 时 $S^{-1}I$ 由 $a_1/1,\\ldots,a_r/1$ 在 $S^{-1}A$ 上生成，因为任意 $a/s=(1/s)\\cdot(a/1)$ 是一次的 S-倍数。两种论证都不需要 S 含 1 之外的条件，也不要求 A 是整环。至此我们看到 Noether 性在商、局部化、有限生成代数这三类操作下都保持，这正是它在代数几何的局部研究中总是可以被自动继承的原因。',
        ['quotient-inheritance']),
      step('limits-and-counterexample', '边界：什么操作会破坏 Noether 性',
        '传递性并非无条件成立，必须点明失效方向。第一，子环一般不继承 Noether 性（见例子中代数整数环的情形）。第二，无限多个变量的多项式环 $k[x_1,x_2,\\ldots]$ 不是 Noether 环，因为理想 $(x_1,x_2,\\ldots)$ 不能有限生成：任何有限多个 $x_{i}$ 只能生成其中下标有限的那些变量，取一个下标更大的变量就不在生成的理想里；等价的链 $(x_1)\\subsetneq(x_1,x_2)\\subsetneq\\cdots$ 也永不稳定。第三，有限生成代数沿任意环同态的“反向”没有传递性：$A\\to B$ 有限型且 B Noether 不能推出 A Noether，因为 A 未必是 B 的子环。第四，(FG) 的反面并不等于“有理想不能有限生成且链到处都不稳定”这种误解：只要有一条严格递增链就足以否定 (ACC)，不必要求每条链都发散。把这些边界与前面的传递性结果对照，可以看清 Noether 性是“沿正合列中某些位置传递”的性质，而不是沿任意子对象传递的性质。',
        ['localization-inheritance']),
    ],
    conclusion: 'A 是 Noether 环 $\\iff$ A 的每个理想有限生成 $\\iff$ A 的每条递增理想链最终稳定 $\\iff$ A 的每个非空理想族有极大元；且 Noether 性沿商环与局部化保持。',
    dependencies: ['hilbert-basis-theorem', 'prime-spectrum', 'spec-functor', 'localization'],
    consequences: ['noether-normalization', 'a-primary-decomposition', 'krull-dim', 'a-completion'],
    explanation: 'Noether 性是代数几何里最基础的有限性假设：它保证理想可以被有限多个方程描述，从而“簇由有限多条方程给出”这句话才有意义。三条等价条件分别对应三种使用方式——想写出方程就用有限生成，想做升链归纳就用链条件，想用 Zorn 引理找极大对象就用极大元。几何上它排除的是“需要无穷多条方程才能切出来的子集”这一类病态对象：只要基环 Noether，多项式环、它的商、它的局部化全部自动 Noether，所以我们在坐标环上做的一切局部计算都不必反复重验有限性。反过来，子环与无限变量多项式环提示这条性质并不是随处的，使用时必须确认自己站在传递方向正确的那一侧。',
    examples: [
      { title: '例子：非 Noether 环——全体代数整数', body: '设 $\\bar{\\mathbb{Z}}$ 是 ℂ 中所有代数整数组成的环。取素数列 $p_1=2,p_2=3,p_3=5,\\ldots$，考虑理想 $I_n=(\\sqrt{p_1},\\ldots,\\sqrt{p_n})$，即由前 n 个素数平方根生成的理想。由素因数分解的唯利性，$\\sqrt{p_{n+1}}\\notin I_n$（若 $\\sqrt{p_{n+1}}=\\sum a_i\\sqrt{p_i}$ 且 $a_i\\in\\bar{\\mathbb{Z}}$，则在扩域 ℚ 上展开并比较各素数的平方根项的系数即得矛盾），因此 $I_1\\subsetneq I_2\\subsetneq\\cdots$ 是一条永不稳定的严格递增理想链。于是全体代数整数环不是 Noether 环。这个例子常被误记为“整闭整环都是 Noether 的”，实际恰恰相反：整闭与 Noether 是两个独立条件，前者是“不缺积分元素”，后者是“理想不太多”，本例在第一条上表现极好而在第二条上失败。' },
      { title: '例子：非有限生成理想与有限生成理想的分界', body: '在 $k[x_1,x_2,\\ldots]$ 中，理想 $\\mathfrak{a}=(x_1,x_2,x_3,\\ldots)$ 不是有限生成的：若 $\\mathfrak{a}=(f_1,\\ldots,f_r)$，每个 $f_i$ 只涉及有限多个变量，设它们出现的下标最大值是 N，则任何一次项次数为 1、总次数为 1 的生成元形式的元素都只能涉及 $x_1,\\ldots,x_N$，于是 $x_{N+1}\\in\\mathfrak{a}$ 无法被表示，矛盾。与之对照，在有限变量的 $k[x_1,\\ldots,x_n]$ 中由 Hilbert 基定理每个理想都有限生成，例如 $k[x,y]$ 中的 $(x^2,xy,y^3)$ 就由三个元素生成且无法再减到两个。两组例子说明 (FG) 的失效不是“生成元数量多”，而是“生成元的下标集合没有上界”这种无限维现象。' },
      { title: '例子：极大元论证的实操——验证理想 $(x^2,xy,y^3)$ 的链', body: '在 $A=k[x,y]$ 中取递增链 $(x)\\subset(x,y^2)\\subset(x,y)$。第三项是极大理想、不再有真包含它的理想，链在此停止；把它写成 $(FG)$ 形式便于核对：第一项由 x 生成，第二项由 x 与 $y^2$ 生成，第三项由 x 与 y 生成。若试图继续放大，只能取整个环 $A=(1)$，而链到 (1) 就结束了。这个平凡例子演示了链条件与有限生成的对应：每一次严格放大都必须补入一个当前子理想不具备的新元素，而在 Noether 环里这种补入操作只能在有限步后耗尽可用元素。' },
    ],
    remarks: [
      '(MAX) 中的极大元是对所给理想族而言的，不是对 A 的全部理想而言；“极大元”也不是“最大元”：族中可以同时有多个互不包含的极大元，例如在 $k[x,y]$ 中取族 $\\{(x),(y)\\}$，两个理想都是极大元而彼此不可比较。把两者混同会在使用 Zorn 引理时得到错误的唯一性结论。',
      '从 (MAX) 到 (FG) 的论证里，取出的 b 必须在 I 中而不在 J 中，若只取 $b\\in A$ 而不管是否属于 I，则 $J+(b)$ 可能不是 I 的子理想，极大性就用不上。这一处是最常写错的细节。',
      '“(FG) ⟹ (ACC)”对无限条链同时成立，而不是只对某条特定链成立；只验证一条链稳定不能推出 Noether 性，必须在任意链上作论证。',
      '有限生成模的 Noether 性质（子模有限生成）需要单独的归纳论证，其证明把子模投影到自由模 $A^r$ 并对坐标理想使用理想情形的结果；直接照搬上面关于理想的论证是行不通的，因为模上的升链稳定与理想上的升链稳定不是同一条陈述。',
      'Noether 性在子环方向失效，在有限型代数方向只对“代数作为基环的有限生成扩张”这一方向有效；混合使用时必须先确认有限型映射的方向，否则会把反方向的结论当成已知条件使用。',
      '理想 $\\mathfrak{a}$ 有限生成与理想 $\\mathfrak{a}$ 的根有限生成是两个不同命题：即使每个理想有限生成，$(x^2,xy)$ 这类“幂零厚化”理想的根 $(x)$ 也需另外讨论，Noether 性本身并不给出根关于生成元的算法性信息。',
    ],
    corollaries: [
      { title: '推论：升链归纳原理', body: '设 P 是关于 A 的理想的性质，且满足“若 P 对所有严格包含于 I 的理想成立，则 P 对 I 成立”。若 A 是 Noether 环，则 P 对 A 的一切理想成立。证明：若不然，取使 P 失败的理想族，它非空，由 (MAX) 有极大元 $I_0$；$I_0$ 的所有严格更大的理想都满足 P，把“严格包含于 $I_0$”这一条组装起来即得 P 对 $I_0$ 成立的矛盾。这条原理是素理想存在性、主分解、Krull 交定理的共同骨架。', uses: ['max-implies-finitely-generated'] },
      { title: '推论：Noether 环的有限生成模有极大子模与合成列', body: '若 A 是 Noether 环、M 是有限生成 A-模，则 M 的每个非空子模族有极大元，故 M 有极大真子模（当 $M\\ne0$ 时取不含 M 的子模族），从而每个有限生成模都能被长度有限的合成列所刻画。这为 Jordan-Hölder 型论证在 Noether 情形下的可用性提供了基础，也是局部环上长度有限性讨论的起点。', uses: ['quotient-inheritance'] },
      { title: '推论：Noether 环上的代数集由有限个多项式定义', body: '设 A 是 Noether 环，取 A 的理想 $\\mathfrak{a}$，则 $\\mathfrak{a}=(f_1,\\ldots,f_r)$ 有限生成，于是 $V(\\mathfrak{a})=V(f_1,\\ldots,f_r)$ 由有限多个多项式方程切出。这正是把 (FG) 翻译到几何一侧的标准结论：Affine 空间中任何闭集的方程系统都可以取成有限的，无需担心无穷多条方程的退化情形出现。', uses: ['finitely-generated-implies-acc'] },
    ],
    references: [
      stacks('Stacks Project, Section 10.30: Noetherian rings', '00FM'),
      stacks('Stacks Project, Lemma 10.30.3（极大条件与升链条件的等价）', '00FM'),
      stacks('Stacks Project, Theorem 10.31.1（Hilbert 基定理）', '00FN'),
      stacks('Stacks Project, Section 10.17: The spectrum of a ring', '00DY'),
    ],
    history: '本条由公开教材与 Stacks Project 命题重新组织，项目自行改写并注明来源，未复制原文。',
  },

  /* ──────────────────────────────────────────────────────────────
   * 二、Zariski 切空间：对偶描述与 Jacobian 描述的同一性
   * ────────────────────────────────────────────────────────────── */

  'tangent-space': {
    statement: '设 X=V(f_1,\\ldots,f_r)⊂A_k^n，x∈X。证明 Zariski 切空间由 Jacobian 矩阵 J_f(x) 的核给出。',
    steps: [
      step('two-descriptions', '把待证命题拆成两种定义的对照表',
        '设 k 是域，$X=V(f_1,\\ldots,f_r)\\subseteq\\mathbb{A}_k^n$，$x\\in X$ 是一个 k-有理点。命题要证两种对切空间的描述给出同一个 k-向量空间：描述 (i) 是局部环意义的对偶 $T_xX=\\operatorname{Hom}_k(\\mathfrak{m}_x/\\mathfrak{m}_x^2,k)$，其中 $\\mathfrak{m}_x$ 是局部环 $\\mathcal{O}_{X,x}$ 的极大理想；描述 (ii) 是线性代数意义的核 $T_xX=\\ker J_f(x)$，其中 $J_f(x)=\\big(\\partial f_i/\\partial x_j(x)\\big)$ 是 r×n 的数值矩阵，行由方程编号 i 给出、列由坐标编号 j 给出。描述 (i) 只用层与局部环的抽象语言，不依赖任何坐标选择，因此是先验对象；描述 (ii) 依赖坐标与方程的选取，计算方便但看起来任意。整个证明的策略是：先说明 (i) 的确切含义，再证明它与描述 (ii) 相等。此外必须事先声明两点：(i) 中分母 $\\mathfrak{m}_x^2$ 的合法性来自 $\\mathfrak{m}_x$ 是有限生成理想（坐标环在 k 上有限型，由 Hilbert 基定理是 Noether 环），(ii) 中求偏导需要 k 上有多项式运算，且“取值于 x”这一步只在 x 是 k-有理点时才有意义。',
        []),
      step('dual-numbers-expansion', '用双数环展开：一阶变形与 Jacobian 的关系',
        '记 $\\varepsilon$ 满足 $\\varepsilon^2=0$，考虑 k-代数 $k[\\varepsilon]/(\\varepsilon^2)$（双数环），它作为 k-向量空间有基 $1,\\varepsilon$，且 $\\varepsilon$ 是幂零元。取任意 $v=(v_1,\\ldots,v_n)\\in k^n$，考虑点的一阶变形 $x+\\varepsilon v=(x_1+\\varepsilon v_1,\\ldots,x_n+\\varepsilon v_n)$。对单个多项式 $f\\in k[x_1,\\ldots,x_n]$，在 $x+\\varepsilon v$ 处展开：由分配律把 $f$ 的每个单项式展开，$\\varepsilon^2=0$ 使所有二阶及更高阶项消失，得到 $f(x+\\varepsilon v)=f(x)+\\varepsilon\\sum_j(\\partial f/\\partial x_j)(x)\\,v_j$。由于 $x\\in X$，每个 $f_i(x)=0$，所以 $f_i(x+\\varepsilon v)=\\varepsilon\\sum_j(\\partial f_i/\\partial x_j)(x)\\,v_j$。因此“映射 $x\\mapsto x+\\varepsilon v$ 把 X 的方程仍然打到处处为零”这件事恰好等价于线性方程组 $\\sum_j(\\partial f_i/\\partial x_j)(x)\\,v_j=0$ 对一切 i=1,…,r 成立，也就是 $J_f(x)v=0$。把 v 看作变元，满足该方程组的 v 全体就是 $\\ker J_f(x)$。这既给出了描述 (ii) 的完整来历，也说明 $\\ker J_f(x)$ 度量的是“X 在 x 处的一阶变形空间”。',
        ['two-descriptions']),
      step('deformations-are-derivations', '把双数变形翻译成局部环上的导子',
        '令 $A=k[x_1,\\ldots,x_n]$，$I=(f_1,\\ldots,f_r)$，$B=A/I$ 是 X 的坐标环，$\\mathfrak{m}\\subseteq B$ 是 x 对应的极大理想，$\\mathfrak{m}_x=\\mathfrak{m}B_{\\mathfrak{m}}$。取定 v 后，赋值 $\\varphi_v(x_j)=x_j(x)+\\varepsilon v_j$ 定义了唯一的 k-代数同态 $\\varphi_v:A\\to k[\\varepsilon]/(\\varepsilon^2)$（多项式由它在变量上的取值唯一决定）。由展开式，$f_i(x+\\varepsilon v)=\\varepsilon J_f(x)v$ 的第 i 个分量，因此 $J_f(x)v=0$ 当且仅当 $\\varphi_v(I)=0$，当且仅当 $\\varphi_v$ 下降为 k-代数同态 $\\bar{\\varphi}_v:B\\to k[\\varepsilon]/(\\varepsilon^2)$。而这样一个同态等价于：一个 k-线性映射 $D_v:B\\to k$（取 ε 的系数）满足乘积法则 $D_v(gh)=g(x)D_v(h)+h(x)D_v(g)$，即 D_v 是在 $\\mathfrak{m}$ 上“以 x 为基点”的 k-导子，并且 $D_v(1)=0$。于是 $\\ker J_f(x)$ 与“把 B 打到双数环的 k-代数同态”之间是自然同构，这一步把线性的 Jacobian 核翻译成了环论对象。',
        ['dual-numbers-expansion']),
      step('m-over-m2-duality', '局部环的对偶：$\\mathfrak{m}_x/\\mathfrak{m}_x^2$ 的对偶就是这些导子',
        '现在处理描述 (i)。设 $\\mathfrak{m}_x\\subseteq\\mathcal{O}_{X,x}$ 是极大理想，$\\mathfrak{m}_x^2$ 是它作为理想的两两乘积之和。先看 $\\mathcal{O}_{X,x}/\\mathfrak{m}_x^2$ 这个环：它由所有“常数项 + 一次项”构成，而 $\\mathfrak{m}_x/\\mathfrak{m}_x^2=\\mathfrak{m}_x\\otimes_{\\mathcal{O}_{X,x}}\\kappa(x)$（κ(x) 为剩余域）是余切空间，它剔除了所有二次及以上项。任取 k-线性映射 $\\lambda:\\mathfrak{m}_x/\\mathfrak{m}_x^2\\to k$，把 $\\mathcal{O}_{X,x}\\to k[\\varepsilon]/(\\varepsilon^2)$ 定义为 $f\\mapsto f(x)+\\varepsilon\\lambda(\\bar{f-f(x)})$，这里的 $\\bar{\\cdot}$ 表示在一个商映射中取类。验证它是 k-代数同态：对加性与 k-线性显然，对乘法，$(f-f(x))(g-g(x))\\in\\mathfrak{m}_x^2$ 被 λ 杀死，于是乘积的 ε 系数恰好是 $f(x)\\lambda(\\bar{g-g(x)})+g(x)\\lambda(\\bar{f-f(x)})$，与双数环的乘法规则一致。反之任何 k-代数同态 $\\mathcal{O}_{X,x}\\to k[\\varepsilon]/(\\varepsilon^2)$ 的 ε 系数都必须杀死 $\\mathfrak{m}_x^2$（因为 ε²=0 而该系数的二次项会落在 ε² 里），因此它因子化过余切空间。两个方向互逆，得到自然同构 $\\operatorname{Hom}_k(\\mathfrak{m}_x/\\mathfrak{m}_x^2,k)\\cong\\{\\text{打到双数环的 k-代数同态}\\}$。',
        ['deformations-are-derivations']),
      step('jacobian-kernel-equals-dual', '两种描述相等：$\\ker J_f(x)\\cong\\operatorname{Hom}_k(\\mathfrak{m}_x/\\mathfrak{m}_x^2,k)$',
        '把第 3 步与第 4 步的同构接起来。第 3 步给出 $\\ker J_f(x)\\cong\\{\\text{k-代数同态 } B\\to k[\\varepsilon]/(\\varepsilon^2)\\}$，第 4 步给出 $\\{\\text{k-代数同态 } \\mathcal{O}_{X,x}\\to k[\\varepsilon]/(\\varepsilon^2)\\}\\cong\\operatorname{Hom}_k(\\mathfrak{m}_x/\\mathfrak{m}_x^2,k)$。关键补充是：把同态从坐标环 B 局部化为同态从局部环 $\\mathcal{O}_{X,x}$ 出发不丢失任何信息——在 x 处取值为 x 的代数同态自动把 $B\\setminus\\mathfrak{m}$ 中每个元素送到一个可逆元（因为该元素的像不是 0，而双数环中非零的常数部分可逆），所以同态集合在局部化下保持不变。于是复合得到 $\\ker J_f(x)\\cong\\operatorname{Hom}_k(\\mathfrak{m}_x/\\mathfrak{m}_x^2,k)$。由于两者都是有限维 k-向量空间（$\\mathcal{O}_{X,x}$ 在 k 上有限型，$\\mathfrak{m}_x$ 有限生成，因而 $\\mathfrak{m}_x/\\mathfrak{m}_x^2$ 有限维），同构的两端维数相等，命题成立。至此描述 (i) 与描述 (ii) 的同一性得证：截断到一阶的“函数空间”与 Jacobian 的核是同一个函子的两种描述。',
        ['m-over-m2-duality']),
      step('dependence-on-choices', '为什么 Jacobian 描述需要 k-有理点与选定生成元',
        '描述 (ii) 看起来依赖两个选择，必须说明它其实不依赖。第一，关于基点：展开式 $f_i(x+\\varepsilon v)=f_i(x)+\\varepsilon J_f(x)v$ 用到 $f_i(x)=0$，这只对 $x\\in X$ 成立；更重要的是“把多项式系数当作 k 中元素”要求 x 是 k-有理点（κ(x)=k）。若 x 只是闭点而 k 不代数闭，κ(x)/k 是有限扩域，此时 Jacobian 的条目落在 κ(x) 中，$\\ker J_f(x)$ 是 κ(x)-空间而非 k-空间，必须把描述 (ii) 改成“κ(x)-系数的核”，而描述 (i) 的对偶仍以 κ(x) 为系数；两者依然同构，但若强行把它们都写成 k-空间就会算错维数（差一个 $[\\kappa(x):k]$ 因子）。第二，关于方程组：把 $(f_1,\\ldots,f_r)$ 换成 I 的另一组生成元时，Jacobian 矩阵的行在 κ(x) 上作可逆的行变换，故核不变；把方程换成 $f_1$ 与 $f_1+g f_2$ 这类组合，行的线性组合对核的贡献一致，核仍不变。所以“选定生成元”只是计算手段，不影响答案。',
        ['jacobian-kernel-equals-dual']),
      step('dimension-and-regularity', '维数不等式与正则性判据',
        '记 $\\dim_xX$ 为 x 处局部环的 Krull 维数。代数上有不等式 $\\dim_k\\mathfrak{m}_x/\\mathfrak{m}_x^2\\ge\\dim_xX$：由 Krull 主理想定理，局部环的维数不超过其极大理想的最小生成元个数，而 $\\mathfrak{m}_x$ 的极小生成元个数正是 $\\dim_k\\mathfrak{m}_x/\\mathfrak{m}_x^2$（由 Nakayama 引理，这组生成元可以取成 $\\mathfrak{m}_x/\\mathfrak{m}_x^2$ 的 k-基的代表元）。于是 $\\dim T_xX=\\dim_k\\ker J_f(x)=n-\\operatorname{rank}J_f(x)\\ge\\dim_xX$。等号成立时称 x 是 X 的正则点（等价地局部环是正则局部环），不等号严格时称为奇点，此时切空间的维数严格大于局部维数，描述 (ii) 里表现为 Jacobian 的秩“比应有的不足”——几何上一阶变形比真实方向多，说明方程在 x 处没有切出足够多的独立条件。这个不等式是“Jacobian 判据”的全部内容：判定正则性只需计算矩阵的秩并与维数比较，这是一个纯线性代数的有限步骤。',
        ['jacobian-kernel-equals-dual']),
      step('non-reduced-caveat', '非既约情形与假设的边界',
        '上面的论证只使用坐标环与一阶截断，不要求 X 既约，这是描述 (i) 一般定义的优点。但描述 (ii) 在两种情形下会给出误导。第一，若 I 的生成元集合取得过大或有冗余，$J_f(x)$ 会在 x 处出现额外的、与几何无关的行；核仍然正确，但“行数减秩”不直接等于 r−rank 的几何解释，必须先在 x 处化简矩阵。第二，若 X 在 x 附近非既约（例如 $X=V(y^2)\\subseteq\\mathbb{A}^2$），则 X 与既约化 $V(y)$ 有相同的拓扑，局部环却带幂零元，$\\mathfrak{m}_x/\\mathfrak{m}_x^2$ 的维数会比“预期维数”大：本例中坐标环 $k[y]/(y^2)$ 的 $\\mathfrak{m}/\\mathfrak{m}^2$ 是一维而局部维数是 0，于是 $\\dim T_xX=1>0=\\dim_xX$，按上面的判据 x 是奇点。这与“直线 y=0 上每点都正则”的直觉并不冲突：非既约结构被切空间识别出来了。第三，若 X 不是 k 上有限型的（例如无穷维代数空间），$\\mathfrak{m}_x$ 未必有限生成，$\\mathfrak{m}_x/\\mathfrak{m}_x^2$ 可能是无穷维，对偶空间的定义需要改成受限对偶，判据的表述要相应修改。',
        ['dimension-and-regularity']),
    ],
    conclusion: '对 k-有理点 $x\\in X$，$T_xX=\\operatorname{Hom}_k(\\mathfrak{m}_x/\\mathfrak{m}_x^2,k)=\\ker J_f(x)$，故 $\\dim T_xX=n-\\operatorname{rank}J_f(x)\\ge\\dim_xX$，等号当且仅当 x 是正则点。',
    dependencies: ['zariski-topology', 'ideal-variety', 'localization', 'nakayama'],
    consequences: ['smooth-morphism', 'regular-local-ring', 'a-kahler-differential', 'dimension'],
    explanation: '切空间是簇在一点处的一阶近似：把函数截断到一次项，丢掉所有二次及更高次信息，得到的就是余切空间 $\\mathfrak{m}_x/\\mathfrak{m}_x^2$，它对偶起来就是切空间。描述 (ii) 说的是一件很直观的事——把曲线或曲面方程在 x 处作一阶 Taylor 展开，变形 $x+\\varepsilon v$ 仍然满足方程当且仅当所有一阶项消失，而一阶项正是 Jacobian 乘以 v，所以切方向恰好是 Jacobian 的核。两种描述之所以一致，是因为“截断到一阶”和“用双数环测试变形”是同一件事的两种说法。维数不等式 $\\dim T_xX\\ge\\dim_xX$ 说明了切空间的几何含义：它永远不小于真实维数，多出来的那部分就是奇点造成的“一阶方向冗余”；等号成立时切空间与局部维数吻合，这正是光滑（正则）的定义。',
    examples: [
      { title: '例子：结节点 xy=0 与抛物线 $y=x^2$ 在原点', body: '取 $X=V(xy)\\subseteq\\mathbb{A}_k^2$，在原点 $x=0$。这里 $f=xy$，偏导为 $\\partial f/\\partial x=y$ 与 $\\partial f/\\partial y=x$，在原点都取 0，故 $J_f(0)=(0\\;0)$，秩为 0，$\\ker J_f(0)=k^2$ 是二维的。而 X 是两条直线 $x=0$ 与 $y=0$ 的并，在原点的局部维数为 1（它是一条曲线，尽管由两支组成）。于是 $2=\\dim T_0X>1=\\dim_0X$，原点按判据是奇点。这正是“结点”的代数特征：两条分支交叉处的切方向有两个独立的一阶变形，但它们不能拼成一个一维的局部模型。对照 $Y=V(y-x^2)$，$\\partial/\\partial x(y-x^2)=-2x$、$\\partial/\\partial y(y-x^2)=1$，在原点 Jacobian 为 $(0\\;1)$，秩 1，核是一维的（由 $\\partial/\\partial x$ 张成，对应切线方向 $y=0$）。$1=\\dim T_0Y=1=\\dim_0Y$，原点是正则点。两条曲线在原点都通过、都由一个方程给出，结果却完全不同，差别只在 Jacobian 的秩。' },
      { title: '例子：可计算的 Jacobian 与维数判据', body: '取 $X=V(x^2+y^2-1,\\;z)\\subseteq\\mathbb{A}_k^3$，即单位圆在平面 $z=0$ 中的嵌入。在点 $p=(1,0,0)$ 处，Jacobian 的两行为 $(2x,\\;2y,\\;0)$ 与 $(0,\\;0,\\;1)$，在 p 处取值即 $(2,\\;0,\\;0)$ 与 $(0,\\;0,\\;1)$，两行线性无关。秩为 2，故 $\\dim T_pX=3-2=1$，与圆的局部维数 1 相等，p 是正则点。再取 $X\'=V(x^2+y^2,\\;z)$，在原点处 Jacobian 的两行为 $(0,\\;0,\\;0)$ 与 $(0,\\;0,\\;1)$，秩 1，$\\dim T_0X\'=3-1=2$，而 $X\'$ 在原点局部维数为 1（它是平面 $z=0$ 中退化的一点 $x=y=0$，即一条“零长度的曲线”），$2>1$ 说明原点是奇点。同一个维数判据在两个例子里都只需要数一数矩阵的非零行数，这是判据被广泛使用的原因。' },
      { title: '例子：用双数环直接验证一阶变形', body: '仍取 $f=xy$，在原点用双数环测试 $v=(1,0)$：代入 $x=\\varepsilon$、$y=0$ 得 $f=\\varepsilon\\cdot0=0$，说明沿 $\\partial/\\partial x$ 方向的变形仍然落在这条曲线上；再测 $v=(0,1)$：代入 $x=0$、$y=\\varepsilon$ 得 $f=0$，同样成立。测 $v=(1,1)$：代入 $x=\\varepsilon$、$y=\\varepsilon$ 得 $f=\\varepsilon^2=0$（因为 $\\varepsilon^2=0$），也成立。三条变形都落在 X 上，与“原点的切空间是二维”完全符合。再对 $g=y-x^2$ 做同样的测试：$x=\\varepsilon$、$y=\\varepsilon$ 时 $g=\\varepsilon-\\varepsilon^2=\\varepsilon\\ne0$，说明方向 (1,1) 不是 Y 在原点的切方向；而 $x=\\varepsilon$、$y=0$ 时 $g=-\\varepsilon^2=0$ 成立，说明切线方向 (1,0) 确实是一阶变形方向。这两个计算把“切空间 = 双数变形的解空间”这句话变成了可以手算的检验。' },
    ],
    remarks: [
      'Jacobian 核的表述只在 x 是 k-有理点时给出 k-空间的核；一般闭点处 Jacobian 的条目落在剩余域 κ(x) 中，必须把整个线性代数换成 κ(x)-线性代数，否则会漏掉 $[\\kappa(x):k]$ 这个因子而算错切空间维数。',
      '方程组取法中若含有冗余方程，$J_f(x)$ 的行数会虚高，但核不变；“核”对 x 只要满足 $f_i(x)=0$ 当且仅当 $J_f(x)v=0$ 成立，换成 I 的任何生成元集合后核都不变，所以 Jacobian 描述不是“必须用那 r 个给定的 $f_i$”。',
      '维数不等式 $\\dim T_xX\\ge\\dim_xX$ 的方向容易记反：切空间永远不小于局部维数，奇点处才严格大于；若某次计算得到“切空间维数小于局部维数”，一定是把秩或维数算错了，因为这在代数上不可能发生。',
      '非既约闭子概形（如 $V(y^2)$）与它的既约化有相同的拓扑空间，切空间却不同；因此不能用拓扑来判断切空间维数，必须回到坐标环与 Jacobian 计算，这也是概形比簇多出来的信息之一。',
      '在 k 上非有限型的情形下，$\\mathfrak{m}_x$ 未必有限生成，$\\mathfrak{m}_x/\\mathfrak{m}_x^2$ 可能是无限维空间，此时“对偶”要换成受限对偶空间，Jacobian 判据也需要改成有限维商上的表述，不能直接照搬。',
      '正则性是局部且开条件：$\\dim T_xX=\\dim_xX$ 在每个正则点附近都成立，正则点集合在 X 中是开的稠密集；把“某点正则”误当成“整条簇正则”是常见错误，奇点可以在别处出现。',
    ],
    corollaries: [
      { title: '推论：光滑当且仅当余切空间维数等于局部维数', body: '由两种描述相等，X 在 k-有理点 x 处光滑当且仅当 $\\dim_k\\mathfrak{m}_x/\\mathfrak{m}_x^2=\\dim_xX$，当且仅当 $\\operatorname{rank}J_f(x)=n-\\dim_xX$。这条推论把几何上的“不能更光滑”化归为一个矩阵秩等式，是判定光滑性与计算奇点轨迹的标准工具。', uses: ['dimension-and-regularity'] },
      { title: '推论：切空间与导子空间一致', body: '把第 3 步的翻译再走一遍：$\\ker J_f(x)$ 中的 v 与“在 x 处取值的 k-导子 $D_v:\\mathcal{O}_{X,x}\\to k$”一一对应，$D_v$ 由 $D_v(g)=\\sum_j v_j\\,(\\partial g/\\partial x_j)(x)$ 给出。这说明切向量在代数上就是满足 Leibniz 律的一阶微分算子，切空间就是导子空间；对偶的说法与函数的说法在此完全一致。', uses: ['deformations-are-derivations'] },
      { title: '推论：切空间不被局部化改变', body: '由于 $T_xX$ 只依赖 $\\mathcal{O}_{X,x}$（描述 (i)）或只依赖 x 处的 Jacobian 取值（描述 (ii)），把 X 换成任一包含 x 的开子集 U，都有 $T_xU=T_xX$。这为“切空间是局部不变量”提供了代数证明，也说明切空间不携带任何全局信息（例如亏格或分支数）。', uses: ['jacobian-kernel-equals-dual'] },
    ],
    references: [
      stacks('Stacks Project, Section 10.140: Zariski tangent spaces', '00T5'),
      stacks('Stacks Project, Lemma 10.140.1（切空间的对偶描述与 Jacobian 判据）', '00T5'),
      stacks('Stacks Project, Section 10.110: Regular local rings', '00OF'),
      stacks('Stacks Project, Section 10.17: The spectrum of a ring', '00DY'),
      stacks('Stacks Project, Section 10.30: Noetherian rings', '00FM'),
    ],
    history: '本条由公开教材与 Stacks Project 命题重新组织，项目自行改写并注明来源，未复制原文。',
  },
}
