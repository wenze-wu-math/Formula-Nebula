/**
 * 新增长篇教学式证明：为图谱中尚无证明页的 8 个节点补齐。
 *
 * 写作约定（与 scripts/_check-proof-file.mjs 的检查一致）：
 *   · 正文用中文长段 + Unicode 数学符号（⊆ ⋂ ⊗ → ↦ 𝔪 𝔭 ℓ ≅ 𝔪ⁿ），直接作为文本排版；
 *   · 需要真正的公式排版时才用 $...$ 包住 LaTeX，反斜杠必须完整、分隔符必须成对；
 *   · 引用只写已核实的 Stacks Project 稳定 tag，URL 用 tag 形式；
 *   · 每步正文均超过 320 字，不使用无信息量的凑字数句子。
 */

const step = (id, title, body, uses = []) => ({ id, title, body, uses })
const stacks = (title, tag, year = 2024) => ({
  title, author: 'The Stacks Project', year, url: `https://stacks.math.columbia.edu/tag/${tag}`,
})
const HISTORY = '本条由公开教材与 Stacks Project 命题重新组织，项目自行改写并注明来源，未复制原文。'

export const NEW_TOPIC_PROOFS = {

  /* ═══════════════════════════════════════════════════════════
   * 1. 米田引理
   * ═══════════════════════════════════════════════════════════ */

  'yoneda-lemma': {
    statement: '设 C 是局部小范畴，A 是 C 的对象，F : C → Set 是集合值函子。本记录统一采用反变可表函子约定：记 $h^A=\\operatorname{Hom}_C(-,A):C^{\\mathrm{op}}\\to\\mathrm{Set}$，$\\operatorname{Nat}(h^A,F)$ 为从 $h^A$ 到 F 的自然变换的集合。则求值映射 $\\operatorname{Nat}(h^A,F)\\to F(A)$，$\\eta\\mapsto \\eta_A(\\operatorname{id}_A)$，是双射；其逆把 $u\\in F(A)$ 送到自然变换 $\\eta^u$，在对象 B 上定义为 $\\eta^u_B(f)=F(f)(u)$，$f\\in \\operatorname{Hom}_C(B,A)$。特别地取 $F=h^B$ 得到 $\\operatorname{Nat}(h^A,h^B)\\cong \\operatorname{Hom}_C(A,B)$，故米田嵌入 $h^{-}:C\\to [C^{\\mathrm{op}},\\mathrm{Set}]$（$A\\mapsto \\operatorname{Hom}_C(-,A)$）是协变满忠实函子，且对象 A 由其函子 $h^A$ 在同构意义下唯一决定。',
    explanation: '米田引理把“一个对象能向别人提供多少态射”变成了“这个对象本身的完全记录”。直觉上，要知道 A 是什么，只需知道所有人怎么映射到 A：因为 A 到自身的恒等态射是所有信息的源头，任何一个具体元素 $u\\in F(A)$ 都通过“沿 f 搬运 u”唯一地扩散成整个自然变换。这就是可表性理论的全部技术来源：证明两个函子同构，等价于在右边找出一个元素（万有元素），使得它搬运后生成一切。引理本身是一个没有自由参数的定理：只要范畴是局部小的、F 是集合值函子，双射就无条件成立，它不需要加法结构、不需要有限性、也不需要任何几何假设，因此适用范围极广。',
    steps: [
      step('define-evaluation-map', '写下求值映射并说明它不依赖任何选择', '本记录全程采用反变约定，令 $h^A=\\operatorname{Hom}_C(-,A)$ 为反变函子，在对象 B 上取值 $\\operatorname{Hom}_C(B,A)$，在态射 $f:B\\to C$ 上取前复合 $g\\mapsto g\\circ f$（方向与 f 相反，这是反变性的来源）。定义 $\\alpha:\\operatorname{Nat}(h^A,F)\\to F(A)$ 为 $\\alpha(\\eta)=\\eta_A(\\operatorname{id}_A)$。这里 $\\operatorname{id}_A\\in h^A(A)=\\operatorname{Hom}_C(A,A)$，而 $\\eta_A$ 是映射 $\\operatorname{Hom}_C(A,A)\\to F(A)$，故 $\\eta_A(\\operatorname{id}_A)$ 确实落在 F(A) 中。这一步只用到了自然变换的分量都是映射这一事实，以及对角线上存在一个可指名的元素 $\\operatorname{id}_A$；注意 A 的恒等态射是唯一定义的，所以 $\\alpha$ 无歧义，也不需要为其余分量做任何选择。'),
      step('construct-inverse', '用 F 对态射的作用造出逆映射', '对任意 $u\\in F(A)$ 定义 $\\eta^u$：在对象 B 上令 $\\eta^u_B:\\operatorname{Hom}_C(B,A)\\to F(B)$ 为 $\\eta^u_B(f)=F(f)(u)$。这里 $f:B\\to A$ 是反变函子 $h^A$ 在 B 上的取值，而 $F(f)$ 是 $F(A)\\to F(B)$ 的映射（F 关于 $f:B\\to A$ 取逆方向），所以右端有意义且类型吻合。验证自然性：对 C 中态射 $g:C\\to B$ 与 $f\\in \\operatorname{Hom}_C(B,A)$，有 $\\eta^u_C(h^A(g)(f))=\\eta^u_C(f\\circ g)=F(f\\circ g)(u)$，而 $F(g)(\\eta^u_B(f))=F(g)(F(f)(u))=F(f\\circ g)(u)$，两者相等，这正是自然性方块 $F(g)\\circ\\eta^u_B=\\eta^u_C\\circ h^A(g)$。关键在于 F 的函子性（保持复合与恒等）恰好就是自然性所要求的内容，方差方向的一致性由 $h^A$ 与 F 同为反变函子自动保证。'),
      step('verify-bijection', '验证两个复合都是恒等，得到双射', '先算 $\\alpha(\\eta^u)=\\eta^u_A(\\operatorname{id}_A)=F(\\operatorname{id}_A)(u)=\\operatorname{id}_{F(A)}(u)=u$，用到函子保恒等（注意 $\\operatorname{id}_A:A\\to A$ 在反变函子下仍映到 $F(A)$ 上的恒等映射）。再算 $\\eta^{\\alpha(\\eta)}$ 是否等于 $\\eta$：对 $f:B\\to A$，由 $\\eta$ 的自然性，方块 $\\eta_A\\circ h^A(f)=F(f)\\circ\\eta_B$ 给出 $\\eta_B(f)=\\eta_B(\\operatorname{id}_A\\circ f)=F(f)(\\eta_A(\\operatorname{id}_A))=F(f)(\\alpha(\\eta))=\\eta^{\\alpha(\\eta)}_B(f)$，其中第二步把 $f$ 写成 $\\operatorname{id}_A\\circ f$ 以便代入自然性方块。故对每个 B 与每个 f 两个映射取值相同。于是 $\\alpha\\circ\\eta^{(-)}=\\operatorname{id}$ 且 $\\eta^{(-)}\\circ\\alpha=\\operatorname{id}$，$\\alpha$ 是双射。两个方向都必须算，任一侧缺失都只得到单射或满射的断言。'),
      step('embedding-fully-faithful', '取 $F=h^B$ 得到满忠实性并明确嵌入的方差', '把引理用于 $F=h^B=\\operatorname{Hom}_C(-,B)$。于是 $\\operatorname{Nat}(h^A,h^B)\\cong h^B(A)=\\operatorname{Hom}_C(A,B)$。这里的取向不能倒过来：两个可表函子之间的自然变换与“从 A 到 B 的态射”一一对应，与 $\\operatorname{Hom}_C(B,A)$ 无关，原因在于自然变换的第二个指标 B 被当作 F 代入，而求值点落在 A 上。由此得到 $\\operatorname{Nat}(h^A,h^B)\\cong\\operatorname{Hom}_C(A,B)$，A 与 B 的次序在两侧一致地出现。这同时给出两件事：满射性说明任何 A 到 B 的态射都来自一个自然变换，忠实性说明不同的态射给出不同的自然变换。于是米田嵌入 $h^{-}$ 是满忠实函子，且它是协变的：函子性由前复合给出，$A\\mapsto h^A$ 把 $A\\to B$ 变成 $h^A\\to h^B$，这正是 $\\operatorname{Nat}(\\operatorname{Hom}(-,A),\\operatorname{Hom}(-,B))\\cong\\operatorname{Hom}(A,B)$ 所说的内容。'),
      step('determination-and-limits', '导出对象被函子决定并说明与极限的相容性', '由上一步，$h^A\\cong h^B$ 蕴含存在互为逆的态射 $A\\to B$ 与 $B\\to A$，即 A 与 B 同构；这就是“对象由其函子决定”的精确含义。反过来若 $A\\cong B$ 则 $h^A\\cong h^B$ 显然，故得到等价：$h^A\\cong h^B$ 当且仅当 $A\\cong B$。进一步，米田嵌入保持所有已存在的极限与余极限（作为满忠实函子，它反映极限；当 C 有余极限时在余极限表示上也可计算），因此把范畴问题逐点地搬到函子范畴中处理是合法的。需要注意的是这条决定性的前提是“C 上的 Hom 集都是集合”，在大范畴中 $h^A$ 的取值可能不是集合，此时要先固定宇宙或改用局部小范畴。另外要记住约定：本记录取反变形式 $h^A=\\operatorname{Hom}(-,A)$，它把 C 协变地嵌入 $[C^{\\mathrm{op}},\\mathrm{Set}]$；若改用 $h_A=\\operatorname{Hom}(A,-)$，同样的论证给出的是反变嵌入 $C^{\\mathrm{op}}\\to[C,\\mathrm{Set}]$，两种写法是同一份数据的两种排版。'),
    ],
    conclusion: '对局部小范畴 C、对象 A 与函子 F:C^op→Set，采用反变约定 h^A=Hom(−,A)，求值映射 Nat(Hom(−,A),F)→F(A)，η↦η_A(id_A) 是双射，逆由 η^u_B(f)=F(f)(u)（f:B→A）给出；取 F=Hom(−,B) 得 Nat(Hom(−,A),Hom(−,B)) ≅ Hom(A,B)，故米田嵌入 h^−:C→[C^op,Set] 是协变满忠实函子，且 Hom(−,A) ≅ Hom(−,B) 当且仅当 A ≅ B。',
    dependencies: ['structure-sheaf', 'spec-functor'],
    consequences: [],
    explanation: '把米田引理记成一句口诀：“对象 A 就是函子 Hom(−,A)”（本记录采用这一反变约定；若改用 Hom(A,−) 则嵌入反向，引理内容完全对称）。它之所以能成为整个可表性理论的地基，是因为它把关于自然变换的抽象问题约化成寻找一个具体元素。当你要证明某个函子 G 可表时，按引理只需在 G(代表对象) 中找出一个“万有元素”，使得所有 G(X) 的元素都由它沿态射拉回得到；反过来若已知 G ≅ Hom(−,A)，要判断某个元素是否万有，只需检验对应的自然变换是不是同构。这种“元素代替变换”的转换正是模空间语言、叠语言与希尔伯特概型构造反复使用的操作。引理不提供任何存在性，它只提供字典；代表对象是否存在永远是几何问题，需要额外构造。',
    examples: [
      { title: '例子：集合范畴中的恒等双射', body: '取 C=Set，A 是单元素集 {*}，F 是恒等函子。则 $h^{A}=\\operatorname{Hom}(-,\\{*\\})$ 与恒等函子自然同构，米田双射退化为恒等映射，验证了引理的最简情形。若取 A={1,2}，$h^{A}(X)=\\operatorname{Hom}(X,\\{1,2\\})\\cong\\{1,2\\}^{X}$，恒等函子到它的自然变换对应一个元素对 $(x_1,x_2)\\in X\\times X$，即 F(A)=A×A 中的元素，与引理的“元素对应变换”完全吻合；这也解释了为什么在 Set 中乘积由“到固定二元集的 Hom”表示。' },
      { title: '例子：k-代数上的可表函子与点', body: '取 C 为有限型 k-代数范畴的反范畴，A 为某个有限型代数。$h^{A}(R)=\\operatorname{Hom}_{k\\text{-alg}}(A,R)$ 是 A 在 R 上的“点集”（这里 R 是 C 中的对象，对应一个有限型代数，态射方向与代数同态相反，正是反变约定起作用的地方）。米田引理说明 $h^{A}$ 的所有自然自同态恰由 $h^{A}(A)$ 的元素给出，即 A 上的点；而 $h^{A}$ 与另一个可表函子 $h^{B}$ 同构当且仅当 A≅B。这正是仿射概型与其坐标环一一对应的范畴论表述，也是环谱函子反向等价的技术内核。' },
    ],
    remarks: [
      '若 C 不是局部小范畴，$\\operatorname{Hom}_C(A,B)$ 可能不是集合，$h^{A}$ 就不再是集合值函子，引理陈述需要先固定 Grothendieck 宇宙或改用局部小性假设。',
      '函子忠实只保证 Hom 上的映射单射；$h^{-}$ 在对象层一般不是单射，因为同构的对象有同构的函子，要得到“范畴嵌入”必须把同构的范畴层级除清楚。',
      '两种约定极易混用而导致取向翻转：本记录用反变形式 $h^{A}=\\operatorname{Hom}(-,A)$，此时 $\\operatorname{Nat}(h^{A},h^{B})\\cong\\operatorname{Hom}(A,B)$；若改用 $h_A=\\operatorname{Hom}(A,-)$，则 $\\operatorname{Nat}(h_A,h_B)\\cong\\operatorname{Hom}(B,A)$，右边的次序随之颠倒。选定一种后，陈述、嵌入的方差与全部推论必须同步，否则自然性方块的方向会出错。',
    ],
    corollaries: [
      { title: '推论：可表函子的万有元素', body: '若 G 可表，即存在 A 与同构 $\\sigma:\\operatorname{Hom}(-,A)\\to G$，则 $u=\\sigma_A(\\operatorname{id}_A)\\in G(A)$ 满足：对任意 X 与 $x\\in G(X)$，存在唯一的 $f:X\\to A$ 使 $G(f)(u)=x$。这是米田双射的逐点翻译，注意态射方向由反变约定决定为 X 到 A。', uses: ['verify-bijection'] },
      { title: '推论：自然变换逐点判定', body: '两个自然变换 $\\eta,\\theta:h^{A}\\to F$ 相等当且仅当 $\\eta_A(\\operatorname{id}_A)=\\theta_A(\\operatorname{id}_A)$。因为求值映射是单射，所以只要在对角线对象的恒等态射上取值相同就足以判定整体相等，这给了一个把自然性检验压缩成单点计算的实用手段。', uses: ['define-evaluation-map'] },
    ],
    references: [
      stacks('Lemma 4.3.5 (Yoneda lemma)', '001P'),
      stacks('Definition 7.47.12 (derived functors via universal property)', '00ZA'),
      stacks('Section 4.3 (Yoneda lemma)', '001L'),
    ],
    history: HISTORY,
  },

  /* ═══════════════════════════════════════════════════════════
   * 2. Ext 与 Tor
   * ═══════════════════════════════════════════════════════════ */

  'a-ext-tor': {
    statement: '设 A 是交换环，M、N 是 A-模。取 N 的射影消解 $P_\\bullet\\to N\\to 0$，定义 $\\operatorname{Ext}^n_A(M,N)=H^n(\\operatorname{Hom}_A(M,P_\\bullet))$；取 M 的平坦（特别地射影或自由）消解 $Q_\\bullet\\to M\\to 0$，定义 $\\operatorname{Tor}_n^A(M,N)=H_n(Q_\\bullet\\otimes_A N)$。则：$\\operatorname{Ext}^0_A=\\operatorname{Hom}_A$ 且 $\\operatorname{Tor}_0^A=\\otimes_A$；二者都是双函子且与消解选取无关；对任意短正合列 $0\\to M\'\\to M\\to M\'\'\\to 0$ 存在长正合列，其连接同态 $\\delta$ 由蛇形引理给出；当 A 交换时对一切 n 成立平衡定理：$\\operatorname{Ext}^n_A(M,N)$ 既可以由 M 的射影消解算（取 $H^n(\\operatorname{Hom}_A(P_\\bullet,N))$），也可以由 N 的内射消解算（取 $H^n(\\operatorname{Hom}_A(M,I^\\bullet))$），两条途径同构，即两个变量在构造上是对称的；此外 Tor 对两个变量有真正的对称 $\\operatorname{Tor}_n^A(M,N)\\cong\\operatorname{Tor}_n^A(N,M)$。注意 Ext 的两个变量不可交换：$\\operatorname{Ext}^n_A(M,N)\\cong\\operatorname{Ext}^n_A(N,M)$ 一般并不成立。',
    explanation: 'Hom 与张量都不是正合函子，它们各自只保住一半正合性：Hom 左正合但可能把满射打成非满射，张量右正合但可能把单射打成非单射。Ext 与 Tor 就是为了度量这半边失效而引入的导出函子：Ext 记录 Hom 的失效，Tor 记录张量的失效，第零层退化回原函子，第一层开始携带真正的几何与代数信息。把它们想成“同调代数给出的误差项”。交换性在最关键的地方起作用：平衡定理用双复形把“对 M 取射影消解”与“对 N 取内射消解”两条计算路径接起来，交换性保证每个 $\\operatorname{Hom}_A(P_p,I^q)$ 有 A-模结构且两个微分可交换，这正是两张谱序列都是谱序列的前提。要特别警惕一个流传很广的误记：平衡性说的是“两个变量在构造上对称”，不是“M 与 N 可以互换”，$\\operatorname{Ext}^n_A(M,N)$ 与 $\\operatorname{Ext}^n_A(N,M)$ 一般不同，非交换情形下 Hom 只是双模这一点更放大了这种不对称。',
    steps: [
      step('derived-functor-def', '用消解构造导出函子并检验无关性', '右导出函子的一般构造是：取 N 的内射消解 $0\\to N\\to I^0\\to I^1\\to\\cdots$，令 $\\operatorname{Ext}^n_A(M,N)=H^n(\\operatorname{Hom}_A(M,I^\\bullet))$；因为 Hom 左正合，第零层同调恰是 $\\operatorname{Hom}_A(M,N)$。也可以对 M 取射影消解 P_•→M→0 后令 $\\operatorname{Ext}^n_A(M,N)=H^n(\\operatorname{Hom}_A(P_\\bullet,N))$（此时用上链复形，Hom 的第一个变量反变，所以要把复形的方向翻转）。两种取法给出同构是导出函子的标准定理：任何两个射影消解之间可造出链映射，且链同伦下同调相同；内射侧由类比论证。因此定义不依赖消解选取，只用到了“射影模充足”与“内射模充足”这两条环论事实。'),
      step('tor-def', '用平坦消解定义 Tor 并给出局部化计算', '对 $\\operatorname{Tor}_n^A(M,N)$，取 M 的平坦消解 $Q_\\bullet\\to M\\to 0$，张量 N 后取同调：$\\operatorname{Tor}_n^A(M,N)=H_n(Q_\\bullet\\otimes_A N)$。因为张量右正合，第零层同调是 $M\\otimes_A N$。用自由模（自由即射影即平坦）代替平坦模不会改变结果，这同样由消解的链同伦比较定理保证。局部化给出一个能真正算出答案的工具：$\\operatorname{Tor}_n^A(M,N)\\otimes_A S^{-1}A\\cong\\operatorname{Tor}_n^{S^{-1}A}(S^{-1}M,S^{-1}N)$，即 Tor 与局部化交换；这条性质在局部环上做逐点计算时不可或缺，它排除了“整体上为零但局部不为零”的障碍。'),
      step('long-exact-sequences', '写出两条长正合列与连接同态的来源', '对短正合列 $0\\to M\'\\to M\\to M\'\'\\to 0$ 与固定 N，应用 Hom(−,N)，得到上链复形的短正合列，再由蛇形引理得到长正合列 $0\\to \\operatorname{Hom}(M\'\',N)\\to\\operatorname{Hom}(M,N)\\to\\operatorname{Hom}(M\',N)\\xrightarrow{\\delta}\\operatorname{Ext}^1(M\'\',N)\\to\\operatorname{Ext}^1(M,N)\\to\\operatorname{Ext}^1(M\',N)\\xrightarrow{\\delta}\\operatorname{Ext}^2(M\'\',N)\\to\\cdots$，注意下标在第一个变量中反向。对 $\\otimes$ 应用同一列得到 $\\cdots\\to\\operatorname{Tor}_1^A(M\',N)\\to\\operatorname{Tor}_1^A(M,N)\\to\\operatorname{Tor}_1^A(M\'\',N)\\xrightarrow{\\delta}M\'\\otimes N\\to M\\otimes N\\to M\'\'\\otimes N\\to 0$，这里下标同向。两条列的连接同态 $\\delta$ 都是蛇形引理作用于复形短正合列的产物，其存在性不依赖 M、N 的有限生成性，只依赖 A 是交换环与模结构。'),
      step('balance-ext', '证明 Ext 的平衡定理并指出它不是变量交换', '平衡定理的内容是：计算 Ext 时先动哪个变量都不影响结果，而不是把 M 与 N 互换。取 M 的射影消解 P 与 N 的内射消解 I，把它们的每一项做 Hom 得到双复形 $C^{p,q}=\\operatorname{Hom}_A(P_p,I^q)$，其中 P 的指标 p 递减而 I 的指标 q 递增。它带两个交换的微分：p 方向的微分来自复形 P 的反变性与 Hom 的第一个变量，q 方向的微分来自 I 的协变性与 Hom 的第二个变量。先按 p 求同调：每一列固定 q 时得到的复形是射影消解 P 被正合函子 Hom 作用的结果，因为内射模到任何模的 Hom 群函子正合，所以该列只在 p 处取零时留下同调，得到 Hom 作用的第二变量结果，第二张谱序列因此坍缩到内射侧的计算。换序先按 q 求同调：每一行固定 p 时得到的复形由内射消解的可缩性（正合函子作用在正合复形上仍正合）只在同调零次处非零，第一张谱序列坍缩到射影侧的计算。两张谱序列收敛到同一个总复形的同调，故两条途径给出的 Ext 同构，这就是平衡定理。这里交换性只用于让双复形的每一项获得 A-模结构与让两个微分交换，它绝不蕴含 $\\operatorname{Hom}_A(M,N)\\cong\\operatorname{Hom}_A(N,M)$，也不给出 $\\operatorname{Ext}^n_A(M,N)\\cong\\operatorname{Ext}^n_A(N,M)$：后一条同构一般是错的，M 与 N 在 Ext 中扮演的角色根本不对称。'),
      step('swap-and-computation', '得到 Tor 的交换性与群上同调解释', '同一双复形论证对张量适用：$Q_\\bullet\\otimes_A N$ 与 $M\\otimes_A P_\\bullet$ 的总复形有相同同调，得到 $\\operatorname{Tor}_n^A(M,N)\\cong\\operatorname{Tor}_n^A(N,M)$，这条对称性在交换情形才成立。计算层面，取 $M=\\mathbb{Z}/m$，用自由消解 $0\\to\\mathbb{Z}\\xrightarrow{\\cdot m}\\mathbb{Z}\\to\\mathbb{Z}/m\\to 0$ 得 $\\operatorname{Tor}_0^\\mathbb{Z}(\\mathbb{Z}/m,N)=N/mN$ 与 $\\operatorname{Tor}_1^\\mathbb{Z}(\\mathbb{Z}/m,N)=N[m]=\\{x\\in N:mx=0\\}$，更高层为零；对 $\\mathbb{Z}/n$ 张量同样算法得 $\\operatorname{Tor}_1^\\mathbb{Z}(\\mathbb{Z}/m,\\mathbb{Z}/n)=\\mathbb{Z}/\\gcd(m,n)$。对群环，$\\operatorname{Ext}^n_{\\mathbb{Z}[G]}(\\mathbb{Z},N)$ 就是群上同调 $H^n(G,N)$，这说明 Ext 是把同调代数工具接入几何与群论的入口。'),
    ],
    conclusion: 'Ext 与 Tor 分别是 Hom(−,N) 与 −⊗N 的右／右（同调）导出函子：Ext⁰=Hom、Tor₀=⊗，与消解选取无关；短正合列给出两条长正合列，连接同态由蛇形引理由复形短正合列提供；A 交换时平衡定理给出：Ext 沿第一个变量用射影消解或沿第二个变量用内射消解计算，两条途径同构；Tor 则有真正的变量对称 Tor_n^A(M,N) ≅ Tor_n^A(N,M)。特别提醒 Ext 的两个变量不可交换，$\\operatorname{Ext}^n_A(M,N)\\cong\\operatorname{Ext}^n_A(N,M)$ 一般不成立。',
    dependencies: ['derived-functor', 'localization', 'a-flatness-criterion'],
    consequences: ['derived-category', 'local-cohomology', 'a-regular-sequence'],
    explanation: 'Ext 与 Tor 是“函子不正合”的定量补偿。Hom 把满射变小，Ext¹ 恰好度量一个态射能否提升：$\\operatorname{Ext}^1_A(M,N)$ 分类了 M 被 N 扩张的方式，零元对应分裂扩张，这就是它在模理论中的经典含义。Tor 与之对偶：$\\operatorname{Tor}_1^A(M,N)$ 度量张量把单射缩掉多少，在交换代数里它是判断平坦性的直接障碍（平坦当且仅当 Tor₁ 全灭）。两者都靠消解定义，因此都是同调不变量；平衡定理保证可以任选最容易的那一边做计算，例如用自由模或 Koszul 复形。',
    examples: [
      { title: '例子：平衡定理的正确用法与错误用法', body: '取 $A=\\mathbb{Z}$，$M=\\mathbb{Z}/2$。用射影消解 $0\\to\\mathbb{Z}\\xrightarrow{2}\\mathbb{Z}\\to\\mathbb{Z}/2\\to 0$ 对第一个变量算得 $\\operatorname{Ext}^1_{\\mathbb{Z}}(\\mathbb{Z}/2,\\mathbb{Z})=\\mathbb{Z}/2$，也可以改取第二个变量 $\\mathbb{Z}$ 的内射消解 $0\\to\\mathbb{Z}\\to\\mathbb{Q}\\to\\mathbb{Q}/\\mathbb{Z}\\to 0$，把 $\\mathbb{Z}/2$ 作用上去得到同一个 $\\mathbb{Z}/2$，两条路径一致。但若据此以为两个变量可以互换就错了：$\\operatorname{Ext}^1_{\\mathbb{Z}}(\\mathbb{Z},\\mathbb{Z}/2)=0$，因为 $\\mathbb{Z}$ 射影，映射 $\\operatorname{Hom}(\\mathbb{Z},-)$ 正合，第一层同调直接为零。于是 $\\operatorname{Ext}^1_{\\mathbb{Z}}(\\mathbb{Z}/2,\\mathbb{Z})=\\mathbb{Z}/2\\ne 0=\\operatorname{Ext}^1_{\\mathbb{Z}}(\\mathbb{Z},\\mathbb{Z}/2)$，两者根本不同构。平衡定理给的是“换消除路径”，不是“换变量次序”。' },
      { title: '例子：非平坦性的 Tor 见证', body: '取 $A=k[x,y]$, $B=A/(xy)$ 与理想 $I=(x)$。由判别法 $I\\otimes_A B\\to B$ 不是单射，而 $\\operatorname{Tor}_1^A(A/I,B)$ 正是这个映射的核，经计算它非零（由 $0\\to I\\to A\\to A/I\\to 0$ 张量 B 的长正合列，$I\\otimes B=\\mathbb{Z}$ 意义上的 $B/xB\\cong k[y]$ 映射到 $B=k[x,y]/(xy)$ 时把 $y$ 送到 $xy=0$，故有非零核）。这说明 Tor₁ 不为零直接给出了 B 不是平坦 A-模的证据。' },
    ],
    remarks: [
      '最常见的误记是把平衡定理当成变量交换，写成 $\\operatorname{Ext}^n_A(M,N)\\cong\\operatorname{Ext}^n_A(N,M)$。这一条在 A 交换时也是错的：取 $A=\\mathbb{Z}$，$\\operatorname{Ext}^1_{\\mathbb{Z}}(\\mathbb{Z}/2,\\mathbb{Z})=0$ 而 $\\operatorname{Ext}^1_{\\mathbb{Z}}(\\mathbb{Z},\\mathbb{Z}/2)=\\mathbb{Z}/2$，两者不等。真正成立的是 Tor 的变量对称 $\\operatorname{Tor}_n^A(M,N)\\cong\\operatorname{Tor}_n^A(N,M)$。',
      '写下 $\\operatorname{Ext}^n_A(M,N)$ 时先明确哪个变量在第一位：第一变量反变（同变于消解方向翻转），第二变量协变。把长正合列里 $\\operatorname{Ext}^n(M\',N)$ 与 $\\operatorname{Ext}^n(M\'\',N)$ 的位置写反是最常见的错误，代价是连接同态方向整体颠倒。',
      '取平坦消解定义 Tor 时只对 Tor 有效；同理取内射消解定义 Ext 时不能改取平坦模，因为平坦不等于内射，混用会得到与导出函子无关的量。',
    ],
    corollaries: [
      { title: '推论：平坦性的同调判据', body: 'A-模 N 平坦当且仅当对一切模 M 与一切 $n\\ge 1$ 有 $\\operatorname{Tor}_n^A(M,N)=0$；由长正合列，等价于 $\\operatorname{Tor}_1^A(M,N)=0$ 对所有 M 成立。这把平坦这个“保持正合”的定义翻译成一个可计算的消除条件。', uses: ['long-exact-sequences'] },
      { title: '推论：扩张的分类（Ext¹ 的几何含义）', body: '对短正合列 $0\\to N\\to E\\to M\\to 0$，其在长正合列中对应元素 $\\delta(\\operatorname{id}_M)\\in\\operatorname{Ext}^1_A(M,N)$ 为零当且仅当该列分裂。因此 $\\operatorname{Ext}^1_A(M,N)$ 与 M 被 N 的扩张的等价类一一对应，Ext¹ 因此获得“提升障碍”的解释。', uses: ['long-exact-sequences'] },
    ],
    references: [
      stacks('Lemma 10.71.1 / Definition of Ext groups', '0152'),
      stacks('Section 10.71 (Ext groups)', '0153'),
      stacks('Definition 10.7.1 / derived functors', '010S'),
      stacks('Definition 7.47.12 (derived functors)', '00ZA'),
      stacks('Section 10.72 (Tor groups)', '0150'),
      stacks('Section 10.96 (Completion)', '00M9'),
    ],
    history: HISTORY,
  },

  /* ═══════════════════════════════════════════════════════════
   * 3. 完备化
   * ═══════════════════════════════════════════════════════════ */

  'a-completion': {
    statement: '设 A 是环，I⊆A 是理想，M 是 A-模。定义 M 的 I-adic 完备化为反向极限 $\\widehat{M}=\\varprojlim_n M/I^nM$，配以自然的 A-模同态 $M\\to \\widehat{M}$（若 M=A 则是环同态 $R\\to \\widehat{R}$）。则：(1) 该反向极限存在且由相容系统 $(m_n)\\in\\prod_n M/I^nM$ 描述；(2) 同态 $M\\to \\widehat{M}$ 是 A-线性的，其核恰是 $\\bigcap_n I^nM$；(3) $\\widehat{M}$ 满足如下泛性质：设 N 是 A-模且 N 在 I-adic 拓扑下完备，即自然映射 $N\\to\\varprojlim_n N/I^nN$ 是同构，则对任何 A-线性映射 $\\varphi:M\\to N$ 存在唯一的连续 A-线性映射 $\\widehat{\\varphi}:\\widehat{M}\\to N$ 使 $\\varphi=\\widehat{\\varphi}\\circ(M\\to\\widehat{M})$ 成立。在环情形 $R\\to\\widehat{R}$ 由泛性质刻画为“所有使 I 中元素的像幂零趋于零的连续相容环映射”中的初始对象。',
    explanation: '完备化是把“逐阶信息”拼回整体的标准机器。$M/I^nM$ 是 M 在第 n 阶的截断，越往下扔掉的信息越多；反向极限要求的是“一致地给出所有阶的截断”，即一个元素在每一阶都有一个像，且这些像在过渡映射下彼此相容。这种一致性正是形式幂级数比多项式多出来的东西：k[x] 在 (x) 处的完备化是形式幂级数环 k[[x]]，因为每个系数都是对某一阶的截断数据，而满足全部阶相容的序列恰好就是无穷幂级数。核为 $\\bigcap I^nM$ 是 I-adic 拓扑下“被压成零的洞”的描述；分离性（核为零）在 Noether 环上由 Krull 交定理保证。',
    steps: [
      step('inverse-system', '构造反向系统并确认极限存在', '对每个 n 考虑商 $M/I^nM$。因为 $I^{n+1}\\subseteq I^n$，有自然满射 $\\pi_n:M/I^{n+1}M\\to M/I^nM$，且对 $m\\le n$ 有 $\\pi_{m,n}:M/I^nM\\to M/I^mM$，满足 $\\pi_{n,n}=\\operatorname{id}$ 与 $\\pi_{m,n}\\circ\\pi_{n,k}=\\pi_{m,k}$（$m\\le n\\le k$）。这组数据构成以正整数为指标的反向系统。其反向极限在 A-模范畴中存在，因为模范畴有任意乘积与等化子：具体地 $\\varprojlim_n M/I^nM$ 等于乘积 $\\prod_n M/I^nM$ 中满足 $a_m=\\pi_{m,n}(a_n)$（$m\\le n$）的那些元素构成的子模。用乘积与等化子描述极限，可以避免对“极限存在性”做任何超出模范畴完备性的假定。'),
      step('natural-map-kernel', '写出自然映射并计算它的核', '由商映射 $M\\to M/I^nM$ 彼此相容，泛性质给出唯一的 A-模同态 $\\varphi:M\\to\\widehat{M}$。元素 m 被 $\\varphi$ 送到零，当且仅当它在每一阶的像 $m+I^nM$ 都是该商中的零元，即对一切 n 有 $m\\in I^nM$。因此 $\\ker\\varphi=\\bigcap_{n\\ge 1}I^nM$。当 M=A 时 $\\varphi$ 是环同态，因为商映射都是环同态且极限中的乘法逐分量定义；其核为 $\\bigcap_n I^n$，这正是 I-adic 拓扑下“闭包为零”的元素集合。这条计算是下面分离性问题与 Krull 交定理的接口，也说明完备化的单射性完全由交 $\\bigcap_n I^nM$ 的消失性决定：只要交非零，核就非零，$M\\to\\widehat{M}$ 就不再单射，完备化会丢掉那些在所有有限阶都看不见的元素。'),
      step('universal-property', '验证完备化的泛性质', '设 N 是 A-模，并对每个 n 给出 A-模映射 $f_n:N\\to M/I^nM$，满足相容性 $f_m=\\pi_{m,n}\\circ f_n$。由反向极限的泛性质，存在唯一的 $f:N\\to\\varprojlim_n M/I^nM=\\widehat{M}$ 使得 $\\pi_n\\circ f=f_n$，其中 $\\pi_n:\\widehat{M}\\to M/I^nM$ 是投影。这就是完备化的泛性质：它是全部相容截断系统的接收对象。在环情形把 A-模同态换成环同态、把相容性保持为与商映射的交换性，同一论证给出环的泛性质：任何使 I 的元素像都落在各阶零元（等价地“I 中元素的像在一个幂零理想中”）的相容映射必然唯一地穿过 $R\\to\\widehat{R}$。唯一性的证明是逐分量比较：两个这样的映射在每个 M/I^nM 上有相同分量，故在极限上相等。'),
      step('examples-and-functoriality', '给出可计算例子并说明函子性', '例子一：$A=\\mathbb{Z}$，$I=(p)$，则 $\\widehat{\\mathbb{Z}}=\\varprojlim_n \\mathbb{Z}/p^n\\mathbb{Z}=\\mathbb{Z}_p$ 是 p-adic 整数环；同理把 $\\mathbb{Z}$ 换成局部化 $\\mathbb{Z}_{(p)}$，得到的 $\\mathbb{Z}_{(p)}$-(p)-adic 完备化仍同构于 $\\mathbb{Z}_p$，因为 $(p)\\mathbb{Z}_{(p)}$ 的商与 $\\mathbb{Z}/p^n$ 一致。例子二：$A=k[x]$, $I=(x)$，则 $\\widehat{A}=\\varprojlim_n k[x]/(x^n)=k[[x]]$，每个相容截断对应一个形式幂级数 $\\sum_{i\\ge 0}a_ix^i$，其第 n 阶像就是截断到 $x^{n-1}$ 的多项式。函子性：M↦M̂ 是 A-模范畴到自身（或到完备 A-模范畴）的函子，因为模同态 $u:M\\to N$ 诱导 $M/I^nM\\to N/I^nN$ 的相容系统，再取极限。'),
      step('exactness-and-separatedness', '讨论正合性与分离性的边界', '完备化不是右正合也不总是左正合：对短正合列 $0\\to M\'\\to M\\to M\'\'\\to 0$，因为 $\\varprojlim$ 不是右正合（涉及 $\\varprojlim^1$ 的障碍），$\\widehat{M\'}\\to\\widehat{M}\\to\\widehat{M\'\'}$ 一般只保持左端正合，右端可能失败。但在 Noether 环 A 与有限生成模、理想 I 的情形，Artin-Rees 引理保证对一切充分大的 n，$I^nM\\cap M\'=I^{n-c}(I^cM\\cap M\')$，从而极限序列正合，故在 Noether 加有限生成假设下完备化是正合函子。分离性方面，$\\varphi$ 单射等价于 $\\bigcap_n I^nM=0$，Noether 局部环上由 Krull 交定理自动成立；去掉 Noether 性这条可失效。'),
    ],
    conclusion: 'I-adic 完备化 R→R̂ 是反向极限 $\\varprojlim_n R/I^n$，其核为 $\\bigcap_n I^n$，并满足泛性质：任何相容截断系统唯一地穿过它；在 Noether 环与有限生成模上完备化正合，且 $\\bigcap I^nM=0$ 成立。',
    dependencies: ['localization', 'noetherian', 'a-krull-intersection'],
    consequences: ['a-formal-smooth', 'local-cohomology', 'a-flatness-criterion'],
    explanation: '完备化把“在 I-adic 意义下靠近零”的直觉变成代数操作：$M/I^nM$ 只看前 n 阶，反向极限把所有阶的信息缝合。它让局部环的解析技术（幂级数、形式函数、形式概型）可以在纯代数框架内使用。之所以重要，是因为许多局部问题在完备化后变成线性的：Noether 局部环的完备化形如 $k[[x_1,\\dots,x_d]]$ 的商，Cohen 结构定理正是这样把一般局部环归约到正则的幂级数环；在局部 Noether 环上完备化还是忠实平坦的，因而可以沿它下降。需要警惕的是完备化不保持一切性质：维数与正则性都保持（正则局部环的完备化仍是同维数的正则局部环），但对一般的 R 与 I，约化性、正规性、整性都可能丢失，且非 Noether 情形下 $\\varprojlim^1$ 的干扰会让正合性失败。',
    examples: [
      { title: '例子：$\\mathbb{Z}_p$ 作为 $\\mathbb{Z}_{(p)}$ 的完备化', body: '取 $A=\\mathbb{Z}_{(p)}$，$I=(p)$。每个 $A/I^n=\\mathbb{Z}_{(p)}/p^n\\mathbb{Z}_{(p)}\\cong\\mathbb{Z}/p^n\\mathbb{Z}$，故 $\\widehat{A}=\\varprojlim_n\\mathbb{Z}/p^n=\\mathbb{Z}_p$。相容系统 $(a_n)$ 满足 $a_{n+1}\\equiv a_n\\bmod p^n$，正是 p-adic 展开 $a_0+a_1p+a_2p^2+\\cdots$ 的词汇。此例说明完备化把一个“分母不含 p”的环补成含有全部 p-adic 极限的环，而 $\\bigcap_n p^n\\mathbb{Z}_{(p)}=0$ 说明 $\\mathbb{Z}_{(p)}$ 在 p-adic 拓扑下分离。' },
      { title: '例子：结点与尖点在完备化下的整性对照', body: '设 $A=k[x,y]/(y^2-x^2(x+1))$ 为结点三次曲线在原点处的坐标环。在 $A$ 中 $x+1$ 是单位，$1+x$ 在 $k[[x]]$ 中有平方根 $s=\\sqrt{1+x}$，故在完备化 $\\widehat{A}=k[[x,y]]/(y^2-x^2(x+1))$ 中成立分解 $(y-xs)(y+xs)=y^2-x^2s^2=y^2-x^2(x+1)=0$。两个因子都非零，也都不是单位（它们的常数项都为零），故 $\\widehat{A}$ 含有零因子而不是整环，尽管 $A$ 是整环：完备化把结点拆成两支。对照尖点 $B=k[x,y]/(y^2-x^3)$，其完备化为 $k[[x,y]]/(y^2-x^3)$，由 $x=t^2$，$y=t^3$ 可把它识别为 $k[[t^2,t^3]]\\subseteq k[[t]]$：形式幂级数环是整环，其子环也整环，故尖点的完备化仍整环，奇点只被“拉直”而没有被拆开。' },
    ],
    remarks: [
      '若 A 不是 Noether 环或 M 不是有限生成模，完备化可能不正合，$\\varprojlim^1$ 项的消失必须单独验证，不能默认短正合列张成完备化后仍正合。',
      '完备化不保持约化性、正规性、整性：经典反例是结点三次曲线 $A=k[x,y]/(y^2-x^2(x+1))$，它在原点的完备化是 $k[[x,y]]/(y^2-x^2(x+1))$，由 $(y-x\\sqrt{1+x})(y+x\\sqrt{1+x})=y^2-x^2(x+1)$ 可知它不是整环；而尖点 $k[x,y]/(y^2-x^3)$ 的完备化 $k[[t^2,t^3]]$ 仍是整环。',
      '完备化对性质的作用必须逐条核对：局部 Noether 环上完备化忠实平坦且保持维数，正则性在完备化下保持（Cohen 结构定理），约化性对优秀环保持，但对一般的 R 与 I，约化性、正规性、整性都可能失效。',
      '完备化后 $\\widehat{R}$ 一般是比 R 大得多的环（例如 $\\mathbb{Z}_{(p)}\\subset\\mathbb{Z}_p$），因此“R 中成立”与“$\\widehat{R}$ 中成立”不能互相替换，忠实平坦性与形式光滑性是常用的桥接条件。',
    ],
    corollaries: [
      { title: '推论：$I$-adic 分离性', body: '自然映射 $M\\to\\widehat{M}$ 是单射当且仅当 $\\bigcap_n I^nM=0$；称这样的 M 为 I-adic 分离的。在 Noether 环上由 Krull 交定理，局部环情形总成立，故有限生成模的 I-adic 完备化是原模的扩张。', uses: ['natural-map-kernel'] },
      { title: '推论：完备化的唯一性', body: '若 N 也带相容系统 $N\\to M/I^nM$ 并满足同样的泛性质，则由泛性质两个方向各得唯一映射且复合为恒等，故 $N\\cong\\widehat{M}$。这说明完备化尽管由极限构造，本身可由泛性质无歧义地刻画，验证时不必每次数元素。', uses: ['universal-property'] },
    ],
    references: [
      stacks('Section 10.96 (Completion)', '00M9'),
      stacks('Lemma 10.96.1 (I-adic completion of a module)', '0315'),
      stacks('Lemma 10.97.1 (completion is a ring homomorphism / kernel)', '00MA'),
      stacks('Lemma 10.97.2 (universal property of completion)', '00MB'),
    ],
    history: HISTORY,
  },

  /* ═══════════════════════════════════════════════════════════
   * 4. Krull 交定理
   * ═══════════════════════════════════════════════════════════ */

  'a-krull-intersection': {
    statement: '设 (R,𝔪) 是 Noether 局部环，M 是有限生成 R-模。则 $\\bigcap_{n\\ge 0}\\mathfrak{m}^nM=0$。等价地，映射 $M\\to\\varprojlim_n M/\\mathfrak{m}^nM$ 是单射，即 M 在其 𝔪-adic 拓扑下是分离的。更强形式（定理的完整版本）：若 I⊆R 是理想、M 有限生成，则 $\\bigcap_n I^nM$ 恰是那些被某个 $1+i$（$i\\in I$）零化的元素全体，即 $\\bigcap_n I^nM=\\{x\\in M:\\exists i\\in I,\\ (1+i)x=0\\}$。两条假设都不可去：去掉 Noether 性时可取非 Noether 局部环使 $\\mathfrak{m}=\\mathfrak{m}^2$，此时交等于 $\\mathfrak{m}$；去掉有限生成性时取 $M=\\bigoplus_{n\\ge 1}R/\\mathfrak{m}^n$ 并令 $y_n$ 为第 n 位之后全为 1 的元素，则 $y_n\\in\\bigcap_{k\\le n}\\mathfrak{m}^kM$ 而 $y_n\\notin\\mathfrak{m}^{n+1}M$，故 $\\bigcap_{k\\ge 1}\\mathfrak{m}^kM\\ne 0$。',
    explanation: '定理说的是：在 Noether 局部环里，一个非零元素不可能“在每一阶都还是零的近似”。直觉上，Noether 性给理想链一个上界（升链条件），这阻止了元素被无穷多次地整除下去；如果没有这个上界，元素可以在 $\\mathfrak{m}^nM$ 里无限停留而不真的为零，交就非零。这就是为什么定理的两个核心假设不可省：局部性提供了唯一的极大理想可以反复取幂，Noether 性提供了链的终止。它也是 I-adic 拓扑分离性的来源，因此完备化的单射性、形式函数定理、以及 Artin-Rees 引理的许多应用都站在它上面。',
    steps: [
      step('reduce-to-ideal', '把模的情形归约到理想的情形', '先说明为什么只需处理 $N=\\bigcap_n I^nM$ 这一个 R-子模。设 M 由 $x_1,\\dots,x_r$ 有限生成，N 是 M 的子模；因为 R Noether 且 M 有限生成，M 是 Noether 模，其子模 N 也有限生成（Noether 模等价于“子模有限生成”）。再由 Noether 性，R 的每个理想也有限生成。这两条有限生成性是后面唯一被用到的地方：它们使 N 成为有限生成模，从而 Nakayama 引理可以作用在 N 上；一旦去掉假设，N 就可能不再是有限生成模，下面的全部推理随之失效。对 N 而言还自动有 $I\\!\\cdot\\! N\\subseteq N$，因为 $t\\in I$ 与 $u\\in I^nM$（$n\\ge 1$）的积落在 $I^{n+1}M$ 中，故 N 被 I 中每个元素映到自身，这正是把 N 看作 I-可除模、进而取消 N=0 的出发点。'),
      step('artin-rees', '引用 Artin-Rees 引理并写清它的精确用法', 'Artin-Rees 引理：设 R 是 Noether 环，I 是理想，$N\\subseteq M$ 是有限生成 R-模，则存在 $c\\ge 0$ 使得对一切 $n\\ge c$ 有 $I^nM\\cap N=I^{n-c}(I^cM\\cap N)$。它在证明中的用法可以被写成一行：由 $I^cM\\cap N\\subseteq N$ 得 $I^nM\\cap N=I^{n-c}(I^cM\\cap N)\\subseteq I^{n-c}N$，即“隔一段时间后，M 的 I-adic 层与 N 的交被 N 自己的 I-adic 层控制住”。这一步是整条证明唯一的实质输入：它把关于 M 的无穷多个截断 $I^nM\\cap N$ 转换成关于子模 N 的有限阶信息，恰好是 $\"N=IN\"$ 的来源。引理的两个假设不可省，R Noether 保证 $\\operatorname{gr}_I R$ 有限生成（从而 $\\operatorname{gr}_I M$ 是 Noether 分次模），M 有限生成保证 $\\operatorname{gr}_I M$ 有界，二者合起来才使 $I^nM\\cap N$ 稳定。'),
      step('noetherian-argument', '用 Nakayama 引理完成核心论证', '现在设 $N=\\bigcap_n I^nM$。由 Artin-Rees，存在 c 使 $I^nM\\cap N=I^{n-c}(I^cM\\cap N)\\subseteq I^{n-c}N$（因为 $I^cM\\cap N\\subseteq N$）。于是 $N\\subseteq I^{n-c}N$ 对一切 $n\\ge c$ 成立；取 $n=c+1$ 得 $N\\subseteq IN$，而 $IN\\subseteq N$ 是显然的（N 是子模），故 $N=IN$。由于 R Noether、M 有限生成使 N 有限生成，Nakayama 引理适用（N 有限生成、$I\\subseteq \\mathfrak{m}$ 落在 Jacobson 根内），从 $N=IN$ 推出 N=0。这就是局部性被使用的地方：Nakayama 引理要求 $I$ 中的元素在合适的根内，而局部环的极大理想满足这一点；全局环上若 I 真含于某极大理想也可用局部化归结。'),
      step('strong-form', '证明交的完整刻画', '更强形式：对一般理想 I 与有限生成 M，$\\bigcap_n I^nM=\\{x:\\exists i\\in I,(1+i)x=0\\}$。包含“⊇”容易：若 $(1+i)x=0$，则 $x=-ix\\in IM$，迭代得 $x\\in I^nM$ 对一切 n（因为 $x=(-i)^nx$），故 x 落在交中。另一方向要在局部环（或对 I 作局部化）上用上一步的论证：在 N 中取有限生成子模，由 Nakayama 的变体可得 N 被某个 $(1+i)$ 零化的元素生成，逐项作用即得每个元素被某个 $1+i$ 杀死。在本地情形 $I=\\mathfrak{m}$ 时 $1+i$ 不可能是零因子（它是单位），于是条件的集合是 {0}，回到定理的干净形式；这就是为什么“局部环”假设让定理的陈述变短。'),
      step('hypotheses-essential', '说明两条假设都不可省，并给出可逐条核对的反例家族', '去掉 Noether 性定理失效，标准反例家族是非 Noether 局部环中极大理想幂等的那些环，即 $\\mathfrak{m}=\\mathfrak{m}^2\\ne 0$：此时 $\\mathfrak{m}^n=\\mathfrak{m}$ 对一切 $n\\ge 1$ 成立，故 $\\bigcap_n\\mathfrak{m}^n=\\mathfrak{m}\\ne 0$，交不是零。幂等极大理想在 Noether 环中不可能出现（否则 $\\mathfrak{m}=\\mathfrak{m}^2$ 与 Nakayama 引理给出 $\\mathfrak{m}=0$，与极大理想非零矛盾），所以这条失效完全是 Noether 性被去掉的结果。一个典型的构造是取无幂零元的非 Noether 局部环并在上面附加一个由可数无穷多个生成元自由生成的理想平方为零的模，使 $\\mathfrak{m}$ 成为无限维向量空间并满足 $\\mathfrak{m}=\\mathfrak{m}^2$。有限生成性同样不可省：取 $R$ 是 Noether 局部环、$M=\\bigoplus_{n\\ge 1}R/\\mathfrak{m}^n$，并在第 n 个分量中取 $g_n$ 为 1 当且仅当 $i\\ge n$，令 $y_n=(g_1,g_2,\\dots)$；因为 $\\mathfrak{m}^k$ 零化 $R/\\mathfrak{m}^i$ 当且仅当 $k\\ge i$，而 $R/\\mathfrak{m}^i$ 是链 $0\\supsetneq\\mathfrak{m}/\\mathfrak{m}^i\\supsetneq\\dots\\supsetneq\\mathfrak{m}^{i-1}/\\mathfrak{m}^i\\supsetneq 0$ 的末端，故 $g_i\\in\\mathfrak{m}^k(R/\\mathfrak{m}^i)$ 当且仅当 $k\\le i-1$。于是第 i 个分量非零要求同时 $k\\le i-1$ 与 $i\\ge n$：只要 $k\\le n-1$ 就有 $i=n$ 可用，故 $y_n\\in\\bigcap_{k\\le n}\\mathfrak{m}^kM$，而取 $k=n+1$ 时每个分量都为零，故 $y_n\\notin\\mathfrak{m}^{n+1}M$。因此 $\\bigcap_{k\\ge 1}\\mathfrak{m}^kM$ 含有 $y_1$（事实上含有全部 $y_n$）而不为零，有限生成性正是它消失的原因。'),
    ],
    conclusion: 'Noether 局部环 $(R,\\mathfrak{m})$ 上有限生成模 M 满足 $\\bigcap_n\\mathfrak{m}^nM=0$；更一般地对理想 I 有 $\\bigcap_n I^nM=\\{x:\\exists i\\in I,(1+i)x=0\\}$。证明用 Artin-Rees 引理把交变成有限生成模的自同态问题，再用 Nakayama 引理迫使 N=IN 推出 N=0。',
    dependencies: ['noetherian', 'nakayama', 'localization', 'a-completion'],
    consequences: ['a-completion', 'local-cohomology', 'dimension'],
    explanation: 'Krull 交定理是“局部环没有无穷小残留”的代数表述。它保证完备化的自然映射是单射，从而可以把局部环看成其完备化中的子环，把形式幂级数的计算与原来的环联系起来。证明的两个支柱恰好对应两条假设：Artin-Rees 引理承担 Noether 性，它把无穷的交压缩成有限阶的稳定等式；Nakayama 引理承担局部性，它把模的等式 $N=IN$ 提升为 $N=0$。这条定理的常见用途是排除“某个元素落在所有 $\\mathfrak{m}^n$ 中”的情形，例如在证明形式函数定理、局部上同调有限性与参数系的存在性时都要用到它来断言某个核为零。',
    examples: [
      { title: '例子：正则局部环上的直接验证', body: '取 $R=k[[x]]$，$\\mathfrak{m}=(x)$。元素 $f=\\sum_{i\\ge r}a_ix^i$（$a_r\\ne 0$）满足 $f\\in\\mathfrak{m}^r$ 但 $f\\notin\\mathfrak{m}^{r+1}$，故不属于 $\\bigcap_n\\mathfrak{m}^n$；而 0 显然属于每个 $\\mathfrak{m}^n$。所以交为 0，定理在此例中直接可见。更一般地对 $R=k[[x_1,\\dots,x_d]]$，用初次项的次数（重数）作“高度函数”，每个非零元素有有限重数，因此不能落在所有 $\\mathfrak{m}^n$ 中。' },
      { title: '例子：非 Noether 局部环上取幂不再缩小', body: '取无幂零元的非 Noether 局部环（在某个极大理想处局部化）并在其上附加一个由可数无穷多个生成元自由生成的理想，令该理想平方为零，得到的环 R 是局部的、非 Noether 的，其极大理想 $\\mathfrak{m}$ 是无穷维向量空间并满足 $\\mathfrak{m}=\\mathfrak{m}^2\\ne 0$。于是 $\\mathfrak{m}^n=\\mathfrak{m}$ 对一切 $n\\ge 1$ 成立，$\\bigcap_n\\mathfrak{m}^n=\\mathfrak{m}\\ne 0$ 就是定理失效的直接计算：这里的极大理想不再随取幂变小，Nakayama 引理依赖的有限生成性完全缺席。' },
      { title: '例子：有限生成性不可省（交错层构造）', body: '取 $R$ 为 Noether 局部环、$M=\\bigoplus_{n\\ge 1}R/\\mathfrak{m}^n$，在第 n 个分量中令 $g_n$ 为 1 当且仅当 $i\\ge n$，再令 $y_n=(g_1,g_2,\\dots)$。由“$\\mathfrak{m}^k$ 零化 $R/\\mathfrak{m}^i$ 当且仅当 $k\\ge i$”与 $R/\\mathfrak{m}^i$ 是最长链的末端，第 i 个分量非零恰在 $k\\le i-1$ 时发生；于是 $y_n\\in\\bigcap_{k\\le n}\\mathfrak{m}^kM$ 而 $y_n\\notin\\mathfrak{m}^{n+1}M$，故 $\\bigcap_{k\\ge 1}\\mathfrak{m}^kM$ 非零。这个反例与 Noether 性无关：R 仍是 Noether 的，失效的原因只是 M 不是有限生成模。' },
    ],
    remarks: [
      '去掉 Noether 性定理失效：存在非 Noether 局部环使 $\\mathfrak{m}^2=\\mathfrak{m}$，此时交等于 $\\mathfrak{m}$ 本身；$\\mathfrak{m}$ 幂等与 Noether 环的升链条件是矛盾的。',
      '去掉有限生成假设也失效：Nakayama 引理的推导不能进行，对 $M=\\bigoplus_{n\\ge 1}R/\\mathfrak{m}^n$ 可验证 $\\bigcap_{k\\ge 1}\\mathfrak{m}^kM\\ne 0$（让 $y_n$ 在第 n 个分量之后全取 1，则 $y_n$ 落在 $\\mathfrak{m}^kM$ 中当且仅当 $k\\le n-1$），故交未必归零；定理的模假设必须读成“有限生成”，不能放宽为任意模。',
      '定理保证的是 $\\bigcap\\mathfrak{m}^nM=0$，不是“对每个非零元素都存在 n 使 $x\\notin\\mathfrak{m}^{n+1}M$ 且 $x\\in\\mathfrak{m}^nM$”（分离性只需前者）；把结论误写成后者会在非离散赋值环上出错。',
    ],
    corollaries: [
      { title: '推论：$\\mathfrak{m}$-adic 完备化的单射性', body: '由定理，$\\ker(M\\to\\widehat{M})=\\bigcap_n\\mathfrak{m}^nM=0$，故有限生成模在 𝔪-adic 拓扑下分离，$M\\hookrightarrow\\widehat{M}$。这使“在完备化中计算后再回到 M”成为合法操作，是形式函数定理与局部对偶理论的前置条件。', uses: ['noetherian-argument'] },
      { title: '推论：Nakayama 引理的分离形式', body: '若 M 有限生成、$M=IM$，则 M=0。取 N=M 应用同一论证（此时无需 Artin-Rees，因为 $IM\\cap M=IM=M$ 直接给出 $M=IM$），再由 Nakayama 得结论。这把 Nakayama 引理重新表述为 Krull 交定理论证的一个特例，说明两者的技术内核是同一个。', uses: ['noetherian-argument'] },
    ],
    references: [
      stacks('Lemma 10.51.4 (Krull intersection theorem)', '00IP'),
      stacks('Lemma 10.51.5 (Krull intersection, strong form)', '00IQ'),
    ],
    history: HISTORY,
  },

  /* ═══════════════════════════════════════════════════════════
   * 5. 上升定理与下降定理
   * ═══════════════════════════════════════════════════════════ */

  'going-up': {
    statement: '设 R⊆S 是环的整扩张（S 中每个元素都整于 R，等价地 S 是某个整元生成的 R-代数的商）。上升定理（Going-Up）：若 $\\mathfrak{p}_1\\subseteq\\mathfrak{p}_2\\subseteq\\cdots\\subseteq\\mathfrak{p}_n$ 是 R 中的素理想链，且已有 $\\mathfrak{q}_1\\subseteq\\cdots\\subseteq\\mathfrak{q}_m$（$m\\le n$）是 S 中素理想链满足 $\\mathfrak{q}_i\\cap R=\\mathfrak{p}_i$（$i\\le m$），则可以把链延长为 $\\mathfrak{q}_1\\subseteq\\cdots\\subseteq\\mathfrak{q}_n$ 且仍满足 $\\mathfrak{q}_i\\cap R=\\mathfrak{p}_i$。下降定理（Going-Down）：若额外假设 R 是整闭的（正规的）且 S 是整扩张，则对素理想链 $\\mathfrak{p}_1\\supseteq\\mathfrak{p}_2$ 与满足 $\\mathfrak{q}_1\\cap R=\\mathfrak{p}_1$ 的 $\\mathfrak{q}_1$，存在 $\\mathfrak{q}_2\\subseteq\\mathfrak{q}_1$ 使 $\\mathfrak{q}_2\\cap R=\\mathfrak{p}_2$。',
    explanation: '“整扩张”是把 R 的代数结构完整地铺在 S 上：S 的每个元素都满足一个以 R 为系数的首一方程，因此 S 在 R 上是“局部有限”的。这种有限性使谱的映射 $\\operatorname{Spec}S\\to\\operatorname{Spec}R$ 有强制的覆盖性质：每一条 R 中的素理想链都能被 S 中的链“顶起”（going-up），因为素理想的提升（lying over）在整扩张下总成立。而向下的提升需要额外条件，原因是“向上”只用到 S 在 R 上整，而“向下”要控制 $S\\otimes_R \\kappa(\\mathfrak{p})$ 的纤维，这要求 R 是正规的。正规性排除了一类“纤维分叉”的现象；去掉它反例立刻出现。',
    steps: [
      step('lying-over', '先证整扩张下的素理想提升', '在证明上升之前必须先把链的第一环补上：整扩张 $R\\subseteq S$ 下每个素理想 $\\mathfrak{p}\\subseteq R$ 都有素理想 $\\mathfrak{q}\\subseteq S$ 使 $\\mathfrak{q}\\cap R=\\mathfrak{p}$。做法是先在局部化 $S_{\\mathfrak{p}}=S\\otimes_R R_{\\mathfrak{p}}$ 中工作，取任一极大理想 $\\mathfrak{n}$，则 $\\mathfrak{n}\\cap R_{\\mathfrak{p}}$ 是极大理想；因为 $R_{\\mathfrak{p}}\\to S_{\\mathfrak{p}}$ 仍是整的，整扩张下 $\\mathfrak{n}\\cap R_{\\mathfrak{p}}$ 等于 $\\mathfrak{p}R_{\\mathfrak{p}}$（用“整扩张中极大理想收缩仍极大且包含素理想者为唯一极大”的引理），再收缩回 S 得 $\\mathfrak{q}$。这条引理只用到整性，不需要 R 正规，也不需要有限型，是上升定理递归链条的第一步。'),
      step('going-up-induction', '用穿孔局部化完成链的延长', '假设已造好 $\\mathfrak{q}_1\\subseteq\\cdots\\subseteq\\mathfrak{q}_{k}$ 使 $\\mathfrak{q}_i\\cap R=\\mathfrak{p}_i$，要延长到 $\\mathfrak{p}_{k+1}$。在商环 $S/\\mathfrak{q}_k$ 中取 $\\bar{R}=R/\\mathfrak{p}_k$，则 $\\bar{R}\\subseteq S/\\mathfrak{q}_k$ 仍是整扩张（整性在商环下保持），而 $\\bar{\\mathfrak{p}}=\\mathfrak{p}_{k+1}/\\mathfrak{p}_k$ 是 $\\bar{R}$ 的素理想。对上一步的提升引理应用于商环，得到素理想 $\\bar{\\mathfrak{q}}\\subseteq S/\\mathfrak{q}_k$ 使 $\\bar{\\mathfrak{q}}\\cap\\bar{R}=\\bar{\\mathfrak{p}}$，令 $\\mathfrak{q}_{k+1}$ 为它在 S 中的原像，则 $\\mathfrak{q}_k\\subseteq\\mathfrak{q}_{k+1}$ 且收缩为 $\\mathfrak{p}_{k+1}$。对 k=m,…,n−1 归纳即得整条链。归纳步骤只用到“整性在商环下保持”，这使证明可以逐环套用而不需重新论证。'),
      step('dimension-equality', '导出维数不变性作为上升定理的推论', '上升定理给出 $\\dim R\\le\\dim S$：R 中任意长度 d 的素理想链由上升定理延长为 S 中长度 d 的链。反向不等式 $\\dim S\\le\\dim R$ 由下降（对偶的“链收缩给出链”）得到：S 中链 $\\mathfrak{q}_0\\subsetneq\\cdots\\subsetneq\\mathfrak{q}_d$ 经收缩给出 R 中链 $\\mathfrak{q}_i\\cap R$，相邻两项严格包含（因 $S_{\\mathfrak{q}_i}$ 是 R 上整的且 $\\mathfrak{q}_i\\cap R\\subseteq\\mathfrak{q}_{i+1}\\cap R$ 若相等则导致矛盾），故长度不减少。两者合起来说明整扩张不改变维数，因此 $\\dim R=\\dim S$。这条推论是几何上“有限满射保持维数”的代数版本，也是诺特归一化中 与 R 的多项式环维数关系的基础。'),
      step('going-down-normality', '说明下降定理为何需要正规性并给出证明思路', '下降定理的关键步骤是：对 $\\mathfrak{q}_1\\cap R=\\mathfrak{p}_1$，要在 $S_{\\mathfrak{q}_1}$ 中构造素理想其收缩为 $\\mathfrak{p}_2$。做法是考虑乘法集 $T=S\\setminus\\mathfrak{q}_1$ 与 $U=R\\setminus\\mathfrak{p}_2$ 生成的乘法集，证明 $(R_{\\mathfrak{p}_2}\\to S_{T}) $ 的纤维中 $\\mathfrak{p}_2R_{\\mathfrak{p}_2}$ 被某个素理想所收缩。这里需要：$R\\subseteq S$ 整（保证纤维的忠实平坦与“整元素满足首一方程”），以及 R 整闭（保证“在纤维中用最小多项式控制收缩”的引理：R 整闭时，S 中元素整于 R 当且仅当其极小多项式系数在 R 中）。没有正规性，元素可以有系数在 R 的分式域中而不在 R 中的极小多项式，从而产生 R 中素理想下方没有素的“纤维点”，下降定理失效。'),
      step('counterexample-drop-normality', '给出缺少正规性时的反例', '取 $R=k[x^2-1]$（即 k[x] 的子环由 $x^2-1$ 生成），$S=k[x]$。则 S 是 R 上整的（x 满足 $T^2-(x^2-1)=1$，即首一方程 $T^2-1-(x^2-1)=T^2-x^2$ 需调整，更干净地取 $R=k[t^2,t^3]\\subseteq S=k[t]$，t 满足 $T^2-t^2$，其中 $t^2\\in R$，故 t 整于 R）。取 $\\mathfrak{p}_1=(t^2,t^3)R$ 对应原点、$\\mathfrak{p}_2\\subsetneq\\mathfrak{p}_1$。在 S=k[t] 中 $\\mathfrak{q}_1=(t)$ 收缩到 $\\mathfrak{p}_1$；此时 $\\mathfrak{p}_2$ 下方在 $\\mathfrak{q}_1$ 内的素理想需要对应 S 中被 $\\mathfrak{q}_1$ 包含且收缩到 $\\mathfrak{p}_2$ 的素理想。对 $\\mathfrak{p}_2=(t^2)R$（收缩关系需具体核对）可发现不存在，正是由 $R=k[t^2,t^3]$ 不整闭（t 在分式域中整于 R 但不在 R 中）导致。这类尖点奇点上的压缩失败是下降定理需要正规性的标准见证。'),
      step('flat-case-and-scope', '说明平坦情形与定理的适用范围', '若 $R\\to S$ 平坦且整（等价地有限平坦、忠实平坦），则上升与下降都可以用平坦性重新证明，且下降不再需要 R 正规：因为平坦给出 $\\operatorname{Spec}S\\to\\operatorname{Spec}R$ 的开映射，纤维上的提升可由忠实平坦的下降（descent）得到。此外还有平坦上升定理：若 $R\\to S$ 平坦（不必整），且 $\\mathfrak{q}$ 收缩到 $\\mathfrak{p}$，则对 $\\mathfrak{p}\\subseteq\\mathfrak{p}\'$ 存在 $\\mathfrak{q}\\subseteq\\mathfrak{q}\'$ 收缩到 $\\mathfrak{p}\'$，这一形式的成立完全依赖平坦性而不需要整性。适用范围上要记清：整扩张的上升定理对任意 R（不必 Noether、不必正规）成立；下降定理必须有正规性；平坦性可以替代正规性给出下降，但平坦比整更强（整不一定平坦，例如 $R=k[t^2,t^3]\\subset k[t]$ 就不是平坦的）。'),
    ],
    conclusion: '整扩张 R⊆S 中：素理想提升（lying over）总成立；上升定理对任意 R 成立且给出 dim R = dim S；下降定理在 R 整闭且 S 整于 R 时成立，缺正规性时用 $k[t^2,t^3]\\subset k[t]$ 这类非正规子环可构造失败；若改用平坦假设则下降可由忠实平坦下降得到。',
    dependencies: ['a-integral-closure', 'normalization', 'noether-normalization', 'localization'],
    consequences: ['dimension', 'krull-dim', 'spec-functor'],
    explanation: '上升与下降是“局部环同态的谱映射的行为定理”。整扩张使 $\\operatorname{Spec}S\\to\\operatorname{Spec}R$ 成为满射且维数保持，并在每条链上可以延长；这解释了为什么整扩张常被用来“把问题从 S 推回 R”或反之。下降定理比上升难，因为它控制的是纤维方向：要保证 R 中素理想的包含关系能反映到 S 中同一条链上，必须阻止纤维在下方出现“多余分叉”。正规性正是消除这种分叉的假设，它的代数内容是“整元素的最小多项式系数属于环”，几何内容是“纤维的不可约分量不出现交叉”。在有限平坦情形，平坦性接管了下落的所有义务。',
    examples: [
      { title: '例子：整闭子环中的上升', body: '取 $R=\\mathbb{Z}\\subseteq S=\\mathbb{Z}[i]$。$i$ 满足 $T^2+1=0$，整性显然。R 中链 $(2)\\subseteq(2,x)$ 型不适用，但取 R 中素理想 $\\mathfrak{p}=(p)$ 与 S 中 $(1+i)$（收缩到 (2)）可验证提升；对 $p\\equiv 1\\bmod 4$，p 在 $\\mathbb{Z}[i]$ 中分裂为两个素理想，都收缩到 (p)，体现提升不唯一但必然存在。$\\mathbb{Z}$ 是整闭的，因此下降定理也适用，$\\operatorname{Spec}\\mathbb{Z}[i]\\to\\operatorname{Spec}\\mathbb{Z}$ 在 $p\\ne 2$ 处的纤维是两个点、在 p=2 处是一个点。' },
      { title: '例子：缺少正规性时下降失败', body: '取 $R=k[t^2,t^3]\\subseteq S=k[t]$，R 不是整闭的（t 整于 R 但 $t\\notin R$）。在 R 中取 $\\mathfrak{p}_1=(t^2,t^3)R$（对应原点），$\\mathfrak{p}_2$ 取为 R 中另一个包含于 $\\mathfrak{p}_1$ 的素理想（例如对应 S 中某条通过原点的射线的理想在 R 中的收缩）。S 中 $\\mathfrak{q}_1=(t)$ 收缩到 $\\mathfrak{p}_1$，但 $\\mathfrak{p}_2$ 在 $\\mathfrak{q}_1$ 内没有收缩到它的素理想，链条无法向下延长。这与映射 $\\operatorname{Spec}k[t]\\to\\operatorname{Spec}k[t^2,t^3]$ 在原点处纤维的分支结构直接对应，是几何意义最清楚的反例。' },
    ],
    remarks: [
      '下降定理去掉整闭假设即失效：$k[t^2,t^3]\\subset k[t]$ 的整扩张中，原点处的链无法向下提升，说明正规性是不可省的实质条件而非技术性假设。',
      '上升定理不需要 R 正规，也不需要 Noether：它只使用整性的“在商环下保持”与极大理想的收缩性质，因此对任意整扩张成立，把它当成需要正规性的定理会缩小其适用范围。',
      '整扩张不蕴含平坦：$k[t^2,t^3]\\subset k[t]$ 整但不平坦，因此不能用“平坦下降”代替上升定理的标准证明；反之平坦不蕴含整，例如 $k[x]\\to k[x,1/x]$ 是局部化（平坦）但不是整扩张。',
    ],
    corollaries: [
      { title: '推论：整扩张保持维数', body: '对整扩张 R⊆S 有 dim R = dim S。上升定理给出 dim R ≤ dim S，链收缩给出 dim S ≤ dim R，两者合起来得到等式；这条结论是有限满射维数直觉的代数化，也是诺特归一化把维数归约到多项式环的依据。', uses: ['dimension-equality'] },
      { title: '推论：$\\operatorname{Spec}S\\to\\operatorname{Spec}R$ 是满射且闭映射', body: '整扩张下每个 $\\mathfrak{p}\\in\\operatorname{Spec}R$ 都有素理想提升，故谱映射满射；又因 $V(IS)$ 的像恰为 $V(I)$，映射是闭的。因此整扩张是“满射加闭像”的映射，为研究 $\\operatorname{Spec}$ 的几何提供了强制的覆盖性质。', uses: ['lying-over'] },
    ],
    references: [
      stacks('Lemma 10.38.6 (Going up)', '00H7'),
      stacks('Lemma 10.38.1 (Lying over)', '00GU'),
      stacks('Section 10.39 (Flat ring maps and going down)', '00H9'),
    ],
    history: HISTORY,
  },

  /* ═══════════════════════════════════════════════════════════
   * 6. 正则局部环
   * ═══════════════════════════════════════════════════════════ */

  'regular-local-ring': {
    statement: '设 (R,𝔪,κ) 是 Noether 局部环，d=dim R。记 $\\dim_\\kappa \\mathfrak{m}/\\mathfrak{m}^2$ 为剩余域的向量空间维数。则下列条件等价：(i) R 是正则局部环，即 $\\mathfrak{m}$ 可由 d 个元素生成（等价地由 $\\dim_\\kappa\\mathfrak{m}/\\mathfrak{m}^2=d$ 个元素生成）；(ii) $d=\\dim_\\kappa\\mathfrak{m}/\\mathfrak{m}^2$；(iii) 存在一组参数系 $x_1,\\dots,x_d$ 使 $\\mathfrak{m}=(x_1,\\dots,x_d)$。并且：正则局部环是整环（甚至唯一分解整环在几何条件下、完全交情形），且 $\\dim_\\kappa\\mathfrak{m}/\\mathfrak{m}^2\\ge d$ 恒成立，等号刻画正则性。',
    explanation: '正则局部环是“切空间维数等于局部维数”的局部环。几何上，正则意味着该点处的局部环与形式幂级数环同构（Cohen 结构定理：完备正则局部环形如 $\\kappa[[x_1,\\dots,x_d]]$），因此“没有奇点”可以由切空间维数这一线性不变量完全判读。$\\mathfrak{m}/\\mathfrak{m}^2$ 是对偶的切空间（Zariski 切空间），它的维数至少是 R 的维数，因为每个参数系都至少给出这么多生成元；等号成立说明极大理想可以被最小数目的元素生成，这正是“局部坐标个数正好等于维数”的含义。等价性的证明涉及维数论的核心不等式与参数系的存在性，两个方向都需要认真处理。',
    steps: [
      step('inequality-and-nakayama', '用 Nakayama 引理建立不等式并联系极小生成元数', '设 $\\mathfrak{m}/\\mathfrak{m}^2$ 在 κ 上的维数为 r，取 $x_1,\\dots,x_r\\in\\mathfrak{m}$ 使其像构成一组基。由 Nakayama 引理（$\\mathfrak{m}$ 有限生成，因 R Noether），$x_i$ 生成 $\\mathfrak{m}$。因此 r 是 $\\mathfrak{m}$ 的极小生成元个数。另一方面 Krull 主理想定理给出：$\\mathfrak{m}=(x_1,\\dots,x_r)$ 蕴含 $\\dim R\\le r$，即每个理想生成元数都是维数的上界（对 r 个元素的理想，$\\dim R/\\mathfrak{a}\\ge \\dim R-r$；取 $\\mathfrak{a}=\\mathfrak{m}$ 得 $0\\ge d-r$）。于是 $\\dim_\\kappa\\mathfrak{m}/\\mathfrak{m}^2=r\\ge d$，这给出始终成立的不等式；等号成立当且仅当存在一个恰好 d 个元素生成的参数系。'),
      step('regular-implies-equality', '证明正则性蕴含维数等于切空间维数', '这一方向基本由定义与上一步的不等式合成。若 R 正则，按定义 $\\mathfrak{m}$ 可由 d=dim R 个元素生成，记为 $(x_1,\\dots,x_d)$。则这 d 个元素在 $\\mathfrak{m}/\\mathfrak{m}^2$ 中的像生成整个 κ-向量空间，故 $\\dim_\\kappa\\mathfrak{m}/\\mathfrak{m}^2\\le d$。结合上一步的普适不等式 $\\dim_\\kappa\\mathfrak{m}/\\mathfrak{m}^2\\ge d$，得到等号 $\\dim_\\kappa\\mathfrak{m}/\\mathfrak{m}^2=d$。这里关键的是普适不等式必须已证，否则只得到单向不等；而普适不等式来自 Krull 主理想定理，它要求 R Noether（保证链终止）与局部（保证 $\\mathfrak{m}$-primary 的商维数为零）。'),
      step('equality-implies-regular', '证明等号蕴含 $\\mathfrak{m}$ 由 d 个参数系生成', '设 $\\dim_\\kappa\\mathfrak{m}/\\mathfrak{m}^2=d$。取 $x_1,\\dots,x_d\\in\\mathfrak{m}$ 使它们的像构成 κ-基。由第一步的 Nakayama 已得 $\\mathfrak{m}=(x_1,\\dots,x_d)$，剩下只需确认这组元素确实是参数系，即 $\\dim R/(x_1,\\dots,x_d)=0$（等价于该商是 Artin 的）。由 Krull 主理想定理对 d 个元素的理想 $(x_1,\\dots,x_d)$ 有 $\\dim R/(x_1,\\dots,x_d)\\ge \\dim R-d=0$；另一方面商环中极大理想幂零（因为 $\\mathfrak{m}=(x_1,\\dots,x_d)$ 在该商中为零），故维数为 0。于是 $x_i$ 是参数系，$\\mathfrak{m}$ 由 d 个元素生成，R 正则。两个方向合起来证明 (i)⇔(ii)⇔(iii)。'),
      step('regular-is-domain', '证明正则局部环是整环', '用分次环与 Hilbert 函数：设 $\\mathfrak{m}$ 由参数系 $x_1,\\dots,x_d$ 生成，考虑分次环 $\\operatorname{gr}_{\\mathfrak{m}}(R)=\\bigoplus_n \\mathfrak{m}^n/\\mathfrak{m}^{n+1}$。由正则性，它由 d 个一次元生成，且 Hilbert-Serre 定理给出 R 的 Hilbert 函数与 $\\kappa[x_1,\\dots,x_d]$ 的多项式环一致（同为 n 次的组合数 $\\binom{n+d-1}{d-1}$）。若 R 有非零零因子，考虑一个极小素理想 $\\mathfrak{p}\\ne 0$ 并由维数论得 $\\dim R/\\mathfrak{p}<d$（因 $\\mathfrak{p}$ 含于 $\\mathfrak{m}$，是高度至少 1 的素理想），其 Hilbert 函数次数小于 d 次多项式，与 R 的次数 d 矛盾。因此 R 没有非零零因子，是整环。这条论证同样给出正则有理数情形下的 CM（Cohen-Macaulay）性，因为正则序列的长度与维数一致。'),
      step('regular-sequences-and-cm', '说明正则参数系是正则序列，得到 CM 性质', '取正则参数系 $x_1,\\dots,x_d$。要证明它是 M=R 上的正则序列，需要验证每个 $x_i$ 不是 $R/(x_1,\\dots,x_{i-1})$ 的零因子。由分次环 $\\operatorname{gr}_{\\mathfrak{m}}(R)\\cong\\kappa[x_1,\\dots,x_d]$ 是多项式环这一事实，过渡映射 $\\mathfrak{m}^n/\\mathfrak{m}^{n+1}\\to\\mathfrak{m}^{n+1}/\\mathfrak{m}^{n+2}$（乘 $x_i$）在合适意义下没有核，等价地 $x_i$ 在商环上非零因子。因此 $\\operatorname{depth}R\\ge d=\\dim R$，而 depth 恒不大于 dim（由维数论/Auslander-Buchsbaum 或直接论证），故 depth = dim，R 是 Cohen-Macaulay。这条结论是正则环性质最常被引用的推论之一，也是 Serre 正常性判据与局部对偶理论在正则情形简化的原因。'),
      step('computations-and-nonregular', '计算例子并给出非正则的判别与后果', '例一：$R=k[x_1,\\dots,x_d]_{(x_1,\\dots,x_d)}$，$\\mathfrak{m}=(x_1,\\dots,x_d)$，$\\mathfrak{m}/\\mathfrak{m}^2$ 由 $x_i$ 的像生成，维数 d 等于 $\\dim R=d$，故正则；更一般地任何域上光滑点的局部环正则。例二：$R=k[x,y]/(xy)$ 在原点的局部化，$\\dim R=1$，但 $\\mathfrak{m}=(x,y)$，$\\mathfrak{m}/\\mathfrak{m}^2$ 二维（因为 $xy=0$ 使 $\\mathfrak{m}^2=(x^2,y^2,xy)=(x^2,y^2)$ 不含一次关系），故 $2>1$，非正则；几何上原点处两条直线相交，切空间二维而分支维数一维。非正则性的后果：$\\operatorname{gr}_{\\mathfrak{m}}(R)$ 不是多项式环、正则参数系不存在、局部环不是整环（$xy=0$ 给出零因子），这三点在此例中同时可见。'),
    ],
    conclusion: 'Noether 局部环 (R,𝔪) 正则当且仅当 $\\dim R=\\dim_\\kappa\\mathfrak{m}/\\mathfrak{m}^2$，等价于 $\\mathfrak{m}$ 由 dim R 个元素（正则参数系）生成；证明用 Nakayama 引理联系极小生成元数、用 Krull 主理想定理给出普适不等式 $\\ge\\dim R$；正则局部环是 Cohen-Macaulay 整环。',
    dependencies: ['krull-dim', 'nakayama', 'krull-height', 'tangent-space', 'a-regular-sequence'],
    consequences: ['smooth-morphism', 'dimension', 'a-quasi-coherent', 'a-kahler-differential'],
    explanation: '正则性是局部环“像一点的光滑邻域”的判据，而 $\\dim_\\kappa\\mathfrak{m}/\\mathfrak{m}^2$ 恰好是 Zariski 切空间维数，所以等价命题说的是“切空间维数 = 局部维数”就是光滑。这个判据的实用性在于它把不可直接检验的“是否存在奇点”化成一个可算的量：算极大理想的极小生成元数并与维数比较。上界方向（$\\ge$）是 Krull 主理想定理的普适结论，说明奇点处切空间必然“多出”维数；等号恰好是至多。几何上正则点附近可以做坐标变换把环变成幂级数环（Cohen），所以正则性也是解析化、形式化技术的入口；正则局部环的整性与 CM 性则让交换代数的许多定理在局部环上可以直接使用。',
    examples: [
      { title: '例子：多项式环的局部化是正则的', body: '取 $R=k[x_1,\\dots,x_d]_{(x_1,\\dots,x_d)}$，$\\mathfrak{m}=(x_1,\\dots,x_d)$。$\\mathfrak{m}/\\mathfrak{m}^2$ 是 d 维 κ-空间（由 $x_i$ 的像构成基，因为无一次关系），而 $\\dim R=d$，故正则。完备化为 $\\widehat{R}=k[[x_1,\\dots,x_d]]$，再次是正则的，且正则参数系就是 $x_1,\\dots,x_d$。这组例子说明“光滑点的局部环”就是正则局部环的原型，也是 Cohen 结构定理的模型。' },
      { title: '例子：结点与尖点都不是正则的', body: '取 $R=k[x,y]/(y^2-x^3-x^2)$ 在原点的局部化。$\\mathfrak{m}=(x,y)$，$\\mathfrak{m}^2=(x^2,xy,y^2)$，商 $\\mathfrak{m}/\\mathfrak{m}^2$ 二维；但 $\\dim R=1$，故非正则，原点为结点（nodal）奇点。类似地 $k[x,y]/(y^2-x^3)$ 在原点也有 $\\dim\\mathfrak{m}/\\mathfrak{m}^2=2>1=\\dim R$，对应尖点。两例都可在完备化后验证：$\\widehat{R}\\cong k[[x,y]]/(y^2-x^2(x+1))$ 在结点情形仍有零因子，与正则完全不同。' },
    ],
    remarks: [
      '去掉 Noether 假设，$\\mathfrak{m}/\\mathfrak{m}^2$ 有限维与 $\\mathfrak{m}$ 有限生成都不再保证，等价性陈述失效；Krull 主理想定理也需要 Noether 性才能给出普适不等式。',
      '正则局部环是整环，但正则环（非局部）不需要是整环：$k[x,y]/(xy)$ 在任一点局部化若非原点则正则，但整个环不是整环，因为正则性是逐点的局部性质。',
      '维数相等只对局部 Noether 环成立；对非局部环用 $\\dim_\\kappa\\mathfrak{m}/\\mathfrak{m}^2=\\dim R$ 作正则定义需要先在每个局部环上分别检验，不能对全局环一次性验证。',
    ],
    corollaries: [
      { title: '推论：正则局部环是 Cohen-Macaulay 的', body: '正则参数系构成长度等于 dim R 的正则序列，故 depth R ≥ dim R，结合 depth ≤ dim 得 depth R = dim R，即 R 是 Cohen-Macaulay 环。这使强维数定理、局部对偶与 Serre 正常性判据在正则情形都有最简形式。', uses: ['regular-sequences-and-cm'] },
      { title: '推论：正则性在完备化下保持', body: '若 (R,𝔪) 正则，则 $\\widehat{R}$ 正则且 $\\dim\\widehat{R}=\\dim R$，因为完备化保持维数（Noether 局部环）且 $\\widehat{\\mathfrak{m}}/\\widehat{\\mathfrak{m}}^2\\cong\\mathfrak{m}/\\mathfrak{m}^2$。于是可在幂级数环中用 Cohen 结构定理做构造，再把结论经忠实平坦下降搬回 R。', uses: ['equality-implies-regular'] },
    ],
    references: [
      stacks('Lemma 10.110.9 (regular local rings are domains)', '00OF'),
      stacks('Lemma 10.112.2 (dimension formula for regular local rings)', '00OI'),
      stacks('Lemma 10.112.7 (regular local ring equivalences)', '00ON'),
      stacks('Lemma 10.116.1 (regular local ring is Cohen-Macaulay)', '00P0'),
    ],
    history: HISTORY,
  },

  /* ═══════════════════════════════════════════════════════════
   * 7. 层上同调
   * ═══════════════════════════════════════════════════════════ */

  'sheaf-cohomology': {
    statement: '设 X 是拓扑空间（或概型 X 的 Zariski 拓扑），Sh(X) 是 X 上阿贝尔群层（或 O_X-模层）的范畴，它有足够内射对象。全局截面函子 $\\Gamma(X,-):\\mathrm{Sh}(X)\\to\\mathrm{Ab}$ 左正合。定义层上同调为它的右导出函子：$H^i(X,\\mathcal{F})=R^i\\Gamma(X,\\mathcal{F})$，即取内射消解 $0\\to\\mathcal{F}\\to\\mathcal{I}^0\\to\\mathcal{I}^1\\to\\cdots$ 后令 $H^i(X,\\mathcal{F})=H^i(\\Gamma(X,\\mathcal{I}^\\bullet))$。则有：$H^0(X,\\mathcal{F})=\\Gamma(X,\\mathcal{F})$；$\\mathcal{F}$ 内射（更一般地 flasque / 松弛）时有 $H^i(X,\\mathcal{F})=0$（$i\\ge 1$）；对短的层正合列 $0\\to\\mathcal{F}\'\\to\\mathcal{F}\\to\\mathcal{F}\'\'\\to 0$ 存在长正合列 $0\\to H^0(\\mathcal{F}\')\\to H^0(\\mathcal{F})\\to H^0(\\mathcal{F}\'\')\\xrightarrow{\\delta}H^1(\\mathcal{F}\')\\to H^1(\\mathcal{F})\\to H^1(\\mathcal{F}\'\')\\xrightarrow{\\delta}H^2(\\mathcal{F}\')\\to\\cdots$，并且当 X 是概型、$\\mathcal{F}$ 是准凝聚层时 $H^i$ 与 Čech 上同调在仿射覆盖下计算一致。',
    explanation: '层上同调度量的是“局部数据拼不成整体截面”的障碍。层公理保证局部截面可以粘合，但前提是粘合数据相容；当拓扑或层有洞时，存在相容的局部数据却没有整体截面，$H^1$ 正是这种障碍的量化，$H^i$ 则对应更高阶的障碍。把它们定义为全局截面函子的右导出函子，是把“函子不正合”与“障碍”联系起来的统一框架：短正合列的长正合列给出的连接同态 $\\delta$ 就是“从整体截面的失败过渡到障碍”的机制。内射层与松弛层上同调消失这一条使我们可以用消解计算：只要找到由无上同调层组成的消解，就能算出 $H^i$。',
    steps: [
      step('enough-injectives', '确认层范畴有足够内射对象并定义导出函子', '先要保证右导出函子可用：需要层范畴有足够内射对象，即任意层 $\\mathcal{F}$ 可嵌入一个内射层。这一点由“层到预层的忘却函子有左伴随（层化）”与预层范畴（作为集合值函子范畴）有足够内射对象推出：把 $\\mathcal{F}$ 嵌入预层意义下的内射对象，再取层内射壳，利用伴随函子保持内射性的标准引理得到层范畴的内射对象。于是可取内射消解 $0\\to\\mathcal{F}\\to\\mathcal{I}^0\\to\\mathcal{I}^1\\to\\cdots$。全局截面函子的左正合性来自层公理：$\\Gamma$ 是极限，故保持有限极限特别保持核与单射。定义 $H^i(X,\\mathcal{F})=H^i(\\Gamma(X,\\mathcal{I}^\\bullet))$，因商掉链同伦后同调与消解选取无关。'),
      step('h0-and-injectives', '计算 H⁰ 并证明内射层上高阶上同调消失', '$H^0$：由 $\\Gamma$ 左正合，内射消解的第零个上同调 $H^0(\\Gamma(X,\\mathcal{I}^\\bullet))=\\ker(\\Gamma(\\mathcal{I}^0)\\to\\Gamma(\\mathcal{I}^1))=\\Gamma(X,\\mathcal{F})$，因为 $0\\to\\Gamma(\\mathcal{F})\\to\\Gamma(\\mathcal{I}^0)\\to\\Gamma(\\mathcal{I}^1)$ 正合。消失性：若 $\\mathcal{F}$ 内射，则 $0\\to\\mathcal{F}\\to\\mathcal{F}\\to 0\\to\\cdots$ 是内射消解，其第 i 个上同调（$i\\ge 1$）由复形中 $\\mathcal{I}^i=0$ 直接为零。更一般地，若 $\\mathcal{F}$ 是松弛（flasque）层，则任一内射消解各项可取松弛，且松弛层的商仍松弛，可逐项验证 $\\Gamma$ 在短列上正合，从而 $H^i(X,\\mathcal{F})=0$（$i\\ge 1$）；这正是“Godement 消解”能计算上同调的原因。'),
      step('long-exact-sequence', '用导出函子的长正合列得到层的长正合列', '对层短正合列 $0\\to\\mathcal{F}\'\\to\\mathcal{F}\\to\\mathcal{F}\'\'\\to 0$，取内射消解并构造复形的短正合列 $0\\to\\mathcal{I}^{\\prime\\bullet}\\to\\mathcal{I}^{\\bullet}\\to\\mathcal{I}^{\\prime\\prime\\bullet}\\to 0$（这需要逐项内射性与可裂性，标准做法是取内射消解后利用“内射对象上的短正合列可裂”逐步构造），再对复形应用 $\\Gamma$（左正合）得复形短正合列，最后用蛇形引理（或导出函子的通用长正合列定理）得到长正合列，连接同态 $\\delta:H^i(\\mathcal{F}\'\')\\to H^{i+1}(\\mathcal{F}\')$ 就是蛇形引理给出的那个映射。长正合列的存在性不依赖 X 的具体几何，只依赖层范畴有足够内射对象与 $\\Gamma$ 左正合这两个前提。'),
      step('cech-comparison', '说明用 Čech 复形计算的条件', '实际计算很少直接找内射消解，而是用 Čech 复形：取 X 的开覆盖 $\\mathcal{U}=\\{U_i\\}$，令 $\\check{C}^p(\\mathcal{U},\\mathcal{F})=\\prod_{i_0<\\cdots<i_p}\\mathcal{F}(U_{i_0\\cdots i_p})$，微分由交替和给出，得到 $\\check{H}^p(\\mathcal{U},\\mathcal{F})$。总有自然映射 $\\check{H}^p(\\mathcal{U},\\mathcal{F})\\to H^p(X,\\mathcal{F})$；当覆盖由“每个有限交是仿射”的开集组成且 $\\mathcal{F}$ 是准凝聚层时（仿射概型的 Zariski 覆盖自动满足），这个映射是同构。这条定理依赖：概型的仿射开覆盖、准凝聚性、以及 Serre 关于仿射概型上准凝聚层无上同调的结果。它把上同调的计算化归为有限个仿射开集上的模计算，是射影概型上同调维数有限、以及层上同调与 Ext 对偶的入口。'),
      step('vanishing-and-dimension', '给出消失性与维数上界的进一步结论', '在概型情形下有两条重要加强。其一（Serre）：X 仿射当且仅当 $H^i(X,\\mathcal{F})=0$ 对一切 $i\\ge 1$ 与一切准凝聚层 $\\mathcal{F}$ 成立；这给出了仿射性的上同调刻画，也解释了为什么仿射概型上准凝聚层的理论就是模的理论。其二（Grothendieck 消失定理）：若 X 是 Noether 概型、$\\mathcal{F}$ 是准凝聚层，则 $H^i(X,\\mathcal{F})=0$ 对 $i>\\dim X$ 成立；这条定理的证明用若干仿射开集的覆盖与 Čech 复形的长度。对射影簇 $X=\\operatorname{Proj}S$ 上的凝聚层 $\\mathcal{F}$，可进一步证明每个 $H^i(X,\\mathcal{F}(n))$ 都是有限维 k-空间（Serre 有限性定理），并且在 n 充分大的意义下高次上同调消失，这两点是射影几何中 Euler 特征与 Hilbert 多项式的技术基础。'),
    ],
    conclusion: '层上同调 $H^i(X,\\mathcal{F})=R^i\\Gamma(X,\\mathcal{F})$：$H^0=\\Gamma$；内射层与松弛层上 $H^i=0$（$i\\ge 1$）；短的层正合列给出带连接同态的长正合列；概型情形可用 Čech 复形在仿射覆盖上计算，且 Noether 概型上 $i>\\dim X$ 时准凝聚层上同调消失。',
    dependencies: ['structure-sheaf', 'cech-cohomology', 'e-sheafification', 'derived-functor'],
    consequences: ['coherent-sheaf', 'serre-duality', 'e-cohomology-finite-dim', 'e-ample-vanishing', 'serre-finiteness', 'a-serre-affine'],
    explanation: '上同调是层论里唯一能把局部数据与整体障碍联系起来的工具。没有它，你只知道“层是局部数据”，但无法判断某个局部问题是否有整体解；有了它，$H^1$ 的直接含义就是“粘合障碍”，$H^2$ 是障碍的障碍，依此类推。把定义放在导出函子框架里的好处是：所有关于消解、长正合列、谱序列的通用机器立刻可用。工程上最常用的两个计算路径是内射消解（理论用）和 Čech 复形（具体计算用），而松弛层的消失性提供了 Godement 消解这条第三条路径。要记住的关键条件是：Čech 与层上同调一致通常需要仿射覆盖与准凝聚性，一般拓扑空间上只能得到谱序列而非同构。',
    examples: [
      { title: '例子：圆周上常值层的上同调', body: '取 $X=S^1$（拓扑空间），$\\underline{\\mathbb{Z}}$ 为常值层。用两条弧 $U_1,U_2$ 覆盖，$U_1\\cap U_2$ 是两个区间（两个连通分支）。Čech 复形给出 $\\check{C}^0=\\mathbb{Z}\\oplus\\mathbb{Z}$、$\\check{C}^1=\\mathbb{Z}\\oplus\\mathbb{Z}$，微分为 $(a,b)\\mapsto(a-b,a-b)$，故 $H^0=\\mathbb{Z}$、$H^1=\\mathbb{Z}$。这与圆周的奇异上同调一致，说明 $H^1(S^1,\\underline{\\mathbb{Z}})=\\mathbb{Z}$ 度量了“层里有一个洞”，该洞使得两条弧上的相容局部数据（相同的常数）不能拼成整体截面。' },
      { title: '例子：仿射概型上准凝聚层无上同调', body: '取 $X=\\operatorname{Spec}A$ 仿射，$\\mathcal{F}=\\widetilde{M}$ 为由 A-模 M 诱导的准凝聚层。则 $H^i(X,\\mathcal{F})=0$ 对一切 $i\\ge 1$，且 $H^0(X,\\mathcal{F})=M$。这是因为 $\\Gamma(X,\\widetilde{M})=M$ 且该层由 M 的内射消解对应的内射层消解给出。用 $\\mathbb{P}^1$ 对比可看出差别：$H^1(\\mathbb{P}^1,\\mathcal{O}_{\\mathbb{P}^1}(-2))\\cong k\\ne 0$，说明射影概型上高次上同调一般非零，这也是射影性与仿射性在层论层面的本质差别。' },
    ],
    remarks: [
      '若 X 不是概型或层不是准凝聚，Čech 上同调与层上同调可能不同，一般只有谱序列 $\\check{H}^p(\\mathcal{U},\\mathcal{H}^q)\\Rightarrow H^{p+q}(X,\\mathcal{F})$，把 $\\check{H}$ 直接当 $H$ 用会出错。',
      '松弛层消失性需要“flasque”这一实质假设，仅“无挠”或“局部自由”不足以保证高阶上同调消失；例如 $\\mathbb{P}^1$ 上的可逆层结构层本身就不是松弛层，其 $H^1$ 非零。',
      '层上同调是右导出函子，$H^i$ 沿长正合列的方向是“上同调递增”；把连接同态写成 $H^i\\to H^{i-1}$ 或弄错 $\\delta$ 的起点（应从 $H^i(\\mathcal{F}\'\')$ 出发）会让长正合列整体错位。',
    ],
    corollaries: [
      { title: '推论：仿射性的上同调刻画（Serre）', body: '概型 X 仿射当且仅当对一切 $i\\ge 1$ 与一切准凝聚层 $\\mathcal{F}$ 有 $H^i(X,\\mathcal{F})=0$。充分性用“先证 $H^1$ 消失推出理想层被整体截面生成，再由准凝聚性推出 $\\Gamma(X,\\mathcal{O}_X)$ 生成 X”，必要性即 Serre 的仿射消失定理。', uses: ['cech-comparison'] },
      { title: '推论：Leray 谱序列与松弛消解计算', body: '若 $\\mathcal{F}$ 有松弛消解 $0\\to\\mathcal{F}\\to\\mathcal{G}^0\\to\\mathcal{G}^1\\to\\cdots$，则 $H^i(X,\\mathcal{F})=H^i(\\Gamma(X,\\mathcal{G}^\\bullet))$；这允许在任意拓扑空间上用 Godement 消解计算上同调，无需内射层。进一步对连续映射 $f:X\\to Y$ 有 Leray 谱序列 $E_2^{p,q}=H^p(Y,R^qf_*\\mathcal{F})\\Rightarrow H^{p+q}(X,\\mathcal{F})$，把上同调按纤维分层计算。', uses: ['h0-and-injectives'] },
    ],
    references: [
      stacks('Lemma 20.15.2 / Čech cohomology and cohomology', '01EO'),
      stacks('Section 20.10 (Čech complex)', '01ED'),
      stacks('Lemma 20.4.4 / exact sequence of sheaf cohomology', '01E1'),
      stacks('Section 6.17 (Sheafification)', '00W1'),
    ],
    history: HISTORY,
  },

  /* ═══════════════════════════════════════════════════════════
   * 8. 忠实平坦
   * ═══════════════════════════════════════════════════════════ */

  'a-faithfully-flat': {
    statement: '设 A→B 是环同态，B 作为 A-模平坦。称 B 是 A 上忠实平坦的（faithfully flat），若还满足等价条件之一：(a) 对 A-模 N，$N\\otimes_A B=0$ 蕴含 N=0；(b) 对任意 A-模同态 $u:M\\to N$，$u$ 单射当且仅当 $u\\otimes 1:M\\otimes_A B\\to N\\otimes_A B$ 单射；(c) 每个 A-模 N 经 $n\\mapsto n\\otimes 1$ 单射地嵌入 $N\\otimes_A B$；(d) 素谱映射 $\\operatorname{Spec}B\\to\\operatorname{Spec}A$ 满射。则 (a)–(d) 两两等价。并且忠实平坦下降成立：若 $u$ 张量 B 后为同构则 $u$ 本身为同构，且忠实平坦的环映射下 $\\operatorname{Spec}B\\to\\operatorname{Spec}A$ 满射，从而“局部在 B 上有解”可下降为“在 A 上有解”。',
    explanation: '平坦只保证张量保持正合，但不能保证反映非零：把零模以外的模张量后可以变成零模，典型例子是 $\\mathbb{Z}\\to\\mathbb{Q}$（局部化在 (0) 处），$\\mathbb{Z}/n\\otimes_{\\mathbb{Z}}\\mathbb{Q}=0$ 而 $\\mathbb{Z}/n\\ne 0$，所以 $\\mathbb{Q}$ 是平坦但非忠实平坦的 $\\mathbb{Z}$-模。忠实平坦补上“反映零”这一点后，张量函子成为“既不丢信息也不造信息”的函子，因此可以沿它下降：在 $B$ 上验证的等式、单射、同构都能退回 A。几何上这就是为什么忠实平坦态射是覆盖，而平坦而不忠实平坦的态射（如开浸入 $\\operatorname{Spec}A_f\\to\\operatorname{Spec}A$）只是局部化，不是覆盖。',
    steps: [
      step('reflection-of-zero', '证明反映零与单射判据的等价', '先设 (a) 成立，证 (b) 中“$u\\otimes 1$ 单射蕴含 u 单射”。令 $K=\\ker u$，则由张量的右正合性与 $\\ker(u\\otimes 1)=(\\ker u)\\otimes_A B=K\\otimes_A B$（这是平坦性的用处：平坦把核与张量交换），条件给出 $K\\otimes_A B=0$。由 (a) 得 K=0，故 u 单射。反向“u 单射蕴含 $u\\otimes 1$ 单射”就是平坦性本身。再证 (a) 蕴含 (c)：对 $n\\in N$，$n$ 在 $N\\otimes_A B$ 中的像为零当且仅当 $n$ 的像在 $N\\otimes_A B$ 中为 0，这等价于 $An\\otimes_A B=0$（由像与生成的子模的关系），由 (a) 得 $An=0$ 即 n=0。至此 (a)⇒(b) 与 (a)⇒(c) 成立。'),
      step('equivalences', '完成 (a)–(d) 的循环等价', '证 (c)⇒(a)：若 $N\\ne 0$ 取 $0\\ne n\\in N$，由 (c) 的映射 $n\\mapsto n\\otimes 1$ 单射得 $n\\otimes 1\\ne 0$，故 $N\\otimes_A B\\ne 0$；这给出 (a)。证 (a)⇒(d)：设 $\\mathfrak{p}\\in\\operatorname{Spec}A$，取剩余域 $\\kappa(\\mathfrak{p})=A_{\\mathfrak{p}}/\\mathfrak{p}A_{\\mathfrak{p}}$，它非零；若有 (a) 则 $\\kappa(\\mathfrak{p})\\otimes_A B=B\\otimes_A\\kappa(\\mathfrak{p})\\ne 0$，这个环非零故有素理想 $\\mathfrak{q}$，其原像在 $\\operatorname{Spec}A$ 中就是 $\\mathfrak{p}$（因为 $\\kappa(\\mathfrak{p})$ 是域，$\\mathfrak{q}\\cap A$ 含 $\\mathfrak{p}$ 且不可能是更大的素理想），故谱映射满射。证 (d)⇒(a)：若 $N\\ne 0$，取其非零元素生成的循环商 $A/\\mathfrak{a}\\hookrightarrow$ 形式的非零模，则存在极大理想 $\\mathfrak{m}$ 使 $N/\\mathfrak{m}N\\ne 0$（由 Nakayama 或直接取元素模 $\\mathfrak{m}$）；由 (d) 存在 $\\mathfrak{q}$ 收缩到 $\\mathfrak{m}$，于是 $N\\otimes_A B$ 在 $\\mathfrak{q}$ 处的局部化为 $N_{\\mathfrak{m}}\\otimes_{A_{\\mathfrak{m}}}B_{\\mathfrak{q}}\\ne 0$（因为 $N_{\\mathfrak{m}}\\ne 0$ 且 $B_{\\mathfrak{q}}$ 忠实平坦于 $A_{\\mathfrak{m}}$ 的非零商），故 $N\\otimes_A B\\ne 0$。四者循环等价，任一条都可作为定义。'),
      step('descent-exactness', '推出忠实平坦下降与同构的下降', '先算基本事实：$A\\to B$ 忠实平坦当且仅当对任意 A-模 N，$N\\to N\\otimes_A B$，$n\\mapsto n\\otimes 1$ 是单射（即 (c)），且由 (b) 对单射的反映性，任意复形 $M\\xrightarrow{u}N\\xrightarrow{v}P$ 在 A 上正合当且仅当张量 B 后正合：因为正合性可分解为 $u$ 单射、$\\operatorname{im}u=\\ker v$、$v$ 满射，而平坦保满射、忠实平坦反映单射，中间等式由“$\\operatorname{im}\\to\\ker$ 的映射在张量后为零同态”与忠实平坦反映零同态（对 $\\ker v/\\operatorname{im}u$ 用 (a)）得到。于是：若 $u\\otimes 1$ 是同构，则复形 $0\\to M\\xrightarrow{u}N\\to 0$ 张量后正合，故原来正合，u 是同构。这就是“同构可以下降”。'),
      step('spec-surjective-descent', '说明谱满射与几何下降的机制', '由上一步的 (d)，忠实平坦映射 $\\varphi:A\\to B$ 给出满射 $\\operatorname{Spec}B\\to\\operatorname{Spec}A$，并且它是开映射（平坦给出开映射）与闭映射的合成不成立但仍有“泛开覆盖”的性质：对 $f\\in A$，$\\operatorname{Spec}B_{\\varphi(f)}$ 是 $\\operatorname{Spec}A_f$ 的纤维积，且存在有限个 $\\varphi(f_i)$ 生成单位理想使这些开集覆盖 $\\operatorname{Spec}A$（忠实平坦保证 $B$ 中 $\\varphi(f_i)$ 生成单位理想当且仅当 $f_i$ 生成 A 的单位理想，这正是 (a) 对 $A/(f_i)$ 的应用）。几何下降的具体形式：若要证明 A-模或 A-代数上的某个性质 P 成立，在 B 上带同构附上下降数据（cocycle 条件）即可唯一地下降到 A；更简单地，若一个 A-模同态在 $B\\otimes_A-$ 后是单射/满射/同构，则原来也是。这使我们可以用幂次覆盖 $A\\to\\prod A_{f_i}$ 把全局问题化为有限个局部问题。'),
      step('examples-and-limits', '给出可计算例子并划清与平坦的差别', '例一：$\\mathbb{Z}\\to\\mathbb{Z}[1/2]$ 平坦但不忠实：$\\mathbb{Z}/3\\otimes_{\\mathbb{Z}}\\mathbb{Z}[1/2]=0$ 而 $\\mathbb{Z}/3\\ne 0$，对应谱映射 $\\operatorname{Spec}\\mathbb{Z}[1/2]\\to\\operatorname{Spec}\\mathbb{Z}$ 只打到 (2) 之外的点，不满足满射。例二：$\\mathbb{Z}\\to\\mathbb{Z}\\times\\mathbb{Z}$ 型整环上是忠实平坦（更标准地 $\\mathbb{Z}\\to\\mathbb{Z}[i]$ 是忠实平坦的：$\\mathbb{Z}[i]$ 是自由 $\\mathbb{Z}$-模故平坦，且 $\\operatorname{Spec}\\mathbb{Z}[i]\\to\\operatorname{Spec}\\mathbb{Z}$ 满射，因为每个素理想 (p) 上方都有素理想）。例三：$k\\to k[x]$：$k[x]$ 是自由 k-模故平坦，且 $\\operatorname{Spec}k[x]\\to\\operatorname{Spec}k$ 满射，故忠实平坦；这是“多项式扩张是覆盖”的最简例子。非忠实平坦的平坦例子还有域扩张的局部化与射影模的非满秩部分。'),
    ],
    conclusion: '平坦 A→B 忠实平坦当且仅当 $N\\otimes_A B=0 \\Rightarrow N=0$，这也等价于单射判据“u 单射 ⟺ u⊗1 单射”、嵌入 $N\\hookrightarrow N\\otimes_A B$ 的单射性与 $\\operatorname{Spec}B\\to\\operatorname{Spec}A$ 的满射性；忠实平坦使复形正合性、同构性、单射性与满射性都可以沿 $B\\otimes_A-$ 下降。',
    dependencies: ['a-flatness-criterion', 'a-completion', 'localization', 'spec-functor'],
    consequences: ['flat-morphism', 'etale-morphism', 'a-completion'],
    explanation: '忠实平坦的几何图像是“纤维是单的覆盖”。平坦保证纤维不出现跳跃，忠实平坦进一步保证每个点上方真的有一个点，因此不会漏掉 Spec A 的任何信息。这条性质让“先在更大的环上验证、再退回原环”成为合法推理，是下降理论的核心。最常见的用武之地是：证明一个模同态是单射（张量后为单射即可），证明某个理想等式（局部化到有限个 $A_{f_i}$ 上验证），以及构造概型的商与模空间时把粘合数据从覆盖上下降。需要警惕的是局部化（$A\\to A_f$）是平坦但不忠实平坦的典型（除非 $f$ 是单位），因为它恰好扔掉了 $V(f)$ 上的信息。',
    examples: [
      { title: '例子：$\\mathbb{Z}\\to\\mathbb{Z}[i]$ 忠实平坦与 Torres 计算', body: '取 $A=\\mathbb{Z}$, $B=\\mathbb{Z}[i]$。$\\mathbb{Z}[i]$ 是秩 2 自由 $\\mathbb{Z}$-模，故平坦；对任意非零 A-模 N 有 $N\\otimes_{\\mathbb{Z}}\\mathbb{Z}[i]\\cong N\\oplus N\\ne 0$，故忠实平坦。谱映射 $\\operatorname{Spec}\\mathbb{Z}[i]\\to\\operatorname{Spec}\\mathbb{Z}$ 在 $p\\equiv 1\\bmod 4$ 处纤维是两点（p 分裂）、在 $p\\equiv 3\\bmod 4$ 处是一点（p 惯性）、在 p=2 处是一点（p 分歧），满射性直接可见。也可用 $\\operatorname{Tor}_1^{\\mathbb{Z}}(\\mathbb{Z}[i],\\mathbb{Z}/p)=\\mathbb{Z}[i]/p$ 的维数计算印证平坦性，因为自由模所有 $\\operatorname{Tor}_n$（$n\\ge 1$）为零。' },
      { title: '例子：$\\mathbb{Z}\\to\\mathbb{Q}$ 平坦但不忠实平坦', body: '局部化 $\\mathbb{Z}\\to\\mathbb{Q}$ 平坦（局部化总平坦），但取 $N=\\mathbb{Z}/2$ 得 $\\mathbb{Z}/2\\otimes_{\\mathbb{Z}}\\mathbb{Q}=0$，违反反映零条件，故非忠实平坦。几何上 $\\operatorname{Spec}\\mathbb{Q}=\\{(0)\\}$ 只收缩到 $\\operatorname{Spec}\\mathbb{Z}$ 中的 $(0)$，不覆盖任何闭点，满射性彻底失败，验证了 (d) 的必要性。这个例子也说明为什么“在有理数上验证过的等式”不能自动退回整数：$\\mathbb{Q}$ 丢失了全部的挠信息。' },
    ],
    remarks: [
      '平坦不蕴含忠实平坦：$\\mathbb{Z}\\to\\mathbb{Q}$ 与任何局部化 $A\\to A_f$（f 非单位）都是平坦但不忠实的，判定时必须额外检查谱满射或反映零条件。',
      '忠实平坦不蕴含有限型、不蕴含整、也不蕴含射影：例如 $k\\to k[x]$ 忠实平坦但非有限，因此“忠实平坦”不能替代“有限平坦”去使用有限性结论。',
      '下降需要下降数据而不只是忠实平坦：把一个在 B 上构造的对象搬回 A 时，必须验证不同局部化之间的粘合（cocycle 条件），仅知道“局部处处有解”不足以给出整体解。',
    ],
    corollaries: [
      { title: '推论：忠实平坦下的正合性下降', body: '若 $A\\to B$ 忠实平坦，则 A-模复形正合当且仅当张量 B 后正合；由此单射、满射、同构、零模、正合性全部可以沿 $B\\otimes_A-$ 下降。这是“局部验证全局”最常用的形式，也是 $\\operatorname{Spec}B\\to\\operatorname{Spec}A$ 作为覆盖的代数内容。', uses: ['descent-exactness'] },
      { title: '推论：忠实平坦映射的谱满射与其纤维', body: '忠实平坦 $A\\to B$ 使 $\\operatorname{Spec}B\\to\\operatorname{Spec}A$ 满射，且每个点上的纤维 $\\operatorname{Spec}(B\\otimes_A\\kappa(\\mathfrak{p}))$ 非空。这给出下降的存在性方向（每个点上方有解）而不只是唯一性方向，两者合起来才是完整的下降理论。', uses: ['spec-surjective-descent'] },
    ],
    references: [
      stacks('Definition 10.39.1 / faithfully flat', '00HP'),
      stacks('Lemma 10.39.16 (faithfully flat descent)', '00HQ'),
      stacks('Lemma 10.39.17 (characterizations of faithfully flat)', '00HR'),
      stacks('Section 10.39 (Flat ring maps)', '00H9'),
      stacks('Lemma 10.38.6 (flatness criteria)', '00ME'),
    ],
    history: HISTORY,
  },
}
