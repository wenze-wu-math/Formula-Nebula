/**
 * 批次 29 长篇证明数据：Fourier–Mukai 变换、Orlov 定理、
 * Bondal–Orlov 重构与 Mukai 格配对的 4 个节点。
 *
 * 写作约定与 scripts/_check-proof-file.mjs 一致：
 * 双引号字符串、LaTeX 反斜杠双写、$...$ 内用 ASCII 撇号、
 * 中文正文用 Unicode 数学符号。
 */

const step = (id, title, body, uses) => ({ id, title, body, uses: uses ?? [] })
const stacks = (title, tag, year = 2024) => ({
  title, author: 'The Stacks Project', year, url: `https://stacks.math.columbia.edu/tag/${tag}`,
})
const HISTORY = '本条由公开教材与论文结果重新组织，项目自行改写并注明来源，未复制原文。'

export const BATCH_29_PROOFS = {

  /* ═══════════════════════════════════════════════════════════
   * 1. Fourier–Mukai 变换
   * ═══════════════════════════════════════════════════════════ */

  'c-fourier-mukai': {
    statement: "设 k 是域，$X$、$Y$ 是 k 上的光滑射影簇，$p:X\\times Y\\to X$ 与 $q:X\\times Y\\to Y$ 是两条投影。对任意对象 $\\mathcal{P}\\in D^b(X\\times Y)$（称为核），定义函子 $\\Phi_{\\mathcal{P}}:D^b(X)\\to D^b(Y)$，$\\Phi_{\\mathcal{P}}(E)=\\mathbf{R}q_*(p^*E\\otimes^{\\mathbf{L}}\\mathcal{P})$。则 $\\Phi_{\\mathcal{P}}$ 是三角函子，与直和、平移交换；若 $\\mathcal{Q}\\in D^b(Y\\times Z)$ 是第二个核，则 $\\Phi_{\\mathcal{Q}}\\circ\\Phi_{\\mathcal{P}}\\cong\\Phi_{\\mathcal{Q}*\\mathcal{P}}$，其中卷积 $\\mathcal{Q}*\\mathcal{P}=\\mathbf{R}\\pi_{13*}(\\pi_{12}^*\\mathcal{P}\\otimes^{\\mathbf{L}}\\pi_{23}^*\\mathcal{Q})$。取 $\\mathcal{P}=\\mathcal{O}_{\\Delta}$ 得恒等函子；取 $A$ 为阿贝尔簇、$Y$ 为其对偶、核为 Poincaré 丛，则 $\\Phi_{\\mathcal{P}}$ 是导出范畴等价（Mukai 1981）。",
    explanation: "Fourier–Mukai 变换把「几何函子」标准化成「一个核复形」，这是导出范畴理论中最有用的构造原则。定义式里三个操作的次序很重要：先沿平坦投影拉回，再与核作导出张量积，最后沿射影投影推前。每一层都由已有的定理保证性质：拉回不改变有界性、导出张量不改变有界性、而推前保持有界靠的是射影态射的高阶直接像有限性。把函子变成核以后，两个函子的复合变成核的卷积，于是「找等价」这种范畴问题被翻译成「找核」这种上同调问题。Mukai 在阿贝尔簇上给出了第一个非平凡的等价，它的经典原型是 Fourier 变换，而其证明后成为所有镜像对称与 K3 曲面构造的模板。",
    steps: [
      step('fm-kernel-definition', '核、有界性与三角结构',
        "先确认定义式确实把 $D^b(X)$ 送到 $D^b(Y)$。取 $E\\in D^b(X)$：$p$ 是光滑态射因而平坦，$p^*E$ 就是普通拉回，它的上同调有界；$\\mathcal{P}$ 有界，而导出张量积是逐点 Tor 的拼接，因此 $p^*E\\otimes^{\\mathbf{L}}\\mathcal{P}$ 仍有界。真正需要论证的是 $\\mathbf{R}q_*$ 不把它推出有界范围：由 Serre 的有限性定理，射影态射的高阶直接像 $R^iq_*$ 把凝聚层送到凝聚层，且当 $i$ 超过相对维数时为零，于是把复形按 $q$ 的分次展开只得到有限多非零列，全复形仍然有界。函子性是三步各自的函子性与投影公式的直接推论；与平移、直和的交换同样逐项验证。三角结构也自动：$p^*$ 与 $\\otimes^{\\mathbf{L}}\\mathcal{P}$ 正合，$\\mathbf{R}q_*$ 作为三角函子正合，正合三角的复合像仍是正合三角。",
        []),
      step('fm-composition-convolution', '复合与卷积：FM 变换的封闭性',
        "第二个要点是两个 FM 变换复合仍是 FM 变换。把 $X\\times Y\\times Z$ 上的投影记为 $\\pi_i$ 与 $\\pi_{ij}$。对 $E\\in D^b(X)$ 写出 $\\Phi_{\\mathcal{Q}}\\Phi_{\\mathcal{P}}(E)=R\\pi_{3*}\\bigl(\\pi_2^*(R\\pi_{2*}(\\pi_1^*E\\otimes\\mathcal{P}))\\otimes\\mathcal{Q}\\bigr)$。三因子积恰好是两条投影方块 $X\\times Y\\times Z\\to X\\times Y\\to Y$ 与 $X\\times Y\\times Z\\to Y\\times Z\\to Y$ 的纤维积，而中间那条到 $Y$ 的映射光滑故平坦，于是平坦基变换允许把 $\\pi_2^*$ 越过 $R\\pi_{2*}$，代价是把 $\\mathcal{P}$ 沿 $\\pi_{12}$ 拉回。接着用投影公式把外侧的 $\\otimes\\mathcal{Q}$ 收进推前内部，这一步把 $\\mathcal{Q}$ 换成 $\\pi_{23}^*\\mathcal{Q}$；最后推前互相复合，$R\\pi_{3*}\\circ R\\pi_{23*}=R\\pi_{3*}$ 并重新解释为 $X\\times Z$ 上的推前，得到 $R\\pi_{13*}(\\pi_1^*E\\otimes\\pi_{12}^*\\mathcal{P}\\otimes\\pi_{23}^*\\mathcal{Q})$。按核的卷积定义，这正是 $\\Phi_{\\mathcal{Q}*\\mathcal{P}}(E)$。",
        ['fm-kernel-definition']),
      step('fm-identity-and-twist', '恒等、扭转与「常数」核',
        "三个可手算的核值得记住。第一，$\\mathcal{P}=\\mathcal{O}_{\\Delta}$：设 $i:X\\to X\\times X$ 是对角嵌入，则 $p^*E\\otimes^{\\mathbf{L}}i_*\\mathcal{O}_X=i_*(i^*p^*E)$，而对角上 $p\\circ i=q\\circ i=\\mathrm{id}_X$，故 $i^*p^*E=E$，推前又沿恒等映射，于是 $\\Phi_{\\mathcal{O}_{\\Delta}}(E)=E$，对角线核给出恒等函子。第二，把核扭成 $\\mathcal{O}_{\\Delta}\\otimes q^*L=i_*L$：同一计算给出 $\\Phi(E)=E\\otimes L$，即张量线丛函子，它总是自等价。第三，取 $\\mathcal{P}=\\mathcal{O}_{X\\times Y}$：此时 $\\Phi(E)=Rq_*p^*E$；由沿 $Y\\to\\operatorname{Spec}k$ 的平坦基变换（或投影公式）得到 $Rq_*p^*E\\cong\\mathbf{R}\\Gamma(X,E)\\otimes^{\\mathbf{L}}\\mathcal{O}_Y$，它把每个对象都塌成「常对象」，只有在 $X$ 是单点时才可能是等价。",
        ['fm-kernel-definition']),
      step('fm-poincare-abelian', 'Mukai 的原始情形：阿贝尔簇与其对偶',
        "设 $A$ 是阿贝尔簇，$\\widehat{A}=\\operatorname{Pic}^0(A)$ 是它的对偶，$\\mathcal{P}$ 是 $A\\times\\widehat{A}$ 上的 Poincaré 丛，即「按 $\\widehat{A}$ 参数化的 degree 0 线丛」的普遍族：对每点 $\\hat{y}\\in\\widehat{A}$，纤维限制 $\\mathcal{P}|_{A\\times\\{\\hat{y}\\}}$ 是按 $\\hat{y}$ 分类的 degree 0 线丛。Mukai 的定理断言 $\\Phi_{\\mathcal{P}}$ 是等价 $D^b(A)\\cong D^b(\\widehat{A})$。至少可以把点层算清楚：设 $k_a$ 是闭点 $a$ 上的摩天楼层，$p^*k_a$ 就是 $\\{a\\}\\times\\widehat{A}$ 上的结构层，与 $\\mathcal{P}$ 张量后被支撑在 $\\{a\\}\\times\\widehat{A}$ 上；$q$ 限制在这条纤维上是同构，故 $\\Phi_{\\mathcal{P}}(k_a)=\\mathcal{P}|_{\\{a\\}\\times\\widehat{A}}$，即 $\\widehat{A}$ 上按 $a$ 分类的 degree 0 线丛。点层与线丛在等价下互换，这正是经典 Fourier 变换把 delta 函数换成指数函数的几何版本。",
        ['fm-identity-and-twist']),
      step('fm-adjoints-and-invariants', '伴随、拟逆与最粗的不变量',
        "记 $\\mathcal{P}^{\\vee}=R\\mathcal{H}om(\\mathcal{P},\\mathcal{O}_{X\\times Y})$。对相邻转置后的核（即把对象理解为 $Y\\times X$ 上的核），两个伴随可由 $\\mathcal{P}^{\\vee}$ 与典范层显式给出：左伴随的核为 $\\mathcal{P}^{\\vee}\\otimes q^*\\omega_Y[\\dim Y]$，右伴随的核为 $\\mathcal{P}^{\\vee}\\otimes p^*\\omega_X[\\dim X]$。在一个退化算例上可以检查右伴随：取 $X$ 为光滑射影曲线、$Y$ 为单点、核为 $\\mathcal{O}_X$，此时 $\\Phi_{\\mathcal{P}}=R\\Gamma(X,-)$，而 $W\\mapsto W\\otimes\\omega_X[1]$ 满足 $\\operatorname{Hom}(R\\Gamma F,W)\\cong\\operatorname{Hom}(F,W\\otimes\\omega_X[1])$，正是 Serre 对偶。由此得到等价的第一个不变量：$\\Phi_{\\mathcal{P}}$ 为等价时右伴随即拟逆，而等价把 Serre 函子送到 Serre 函子，对点层 $k_x$ 应用 $S_X=(-)\\otimes\\omega_X[\\dim X]$ 得到 $k_x[\\dim X]$，故 $\\dim X=\\dim Y$。",
        ['fm-poincare-abelian']),
    ],
    conclusion: "核 $\\mathcal{P}\\in D^b(X\\times Y)$ 定义三角函子 $\\Phi_{\\mathcal{P}}=\\mathbf{R}q_*(p^*(-)\\otimes^{\\mathbf{L}}\\mathcal{P})$；复合对应卷积 $\\mathcal{Q}*\\mathcal{P}$，对角核给出恒等、$\\mathcal{O}_{\\Delta}\\otimes q^*L$ 给出张量线丛；阿贝尔簇与对偶之间以 Poincaré 丛为核得到导出范畴等价，点层与 degree 0 线丛在该等价下互换。",
    dependencies: [],
    consequences: [],
    explanation: "Fourier–Mukai 变换的重要性在于它把「函子」这种难以直接计算的对象压缩成一个复形。核的选取有明确的几何含义：对角线给出恒等，对角线加线丛给出张量，而两个投影的卷积给出复合，于是等价的验证往往化为核的代数计算。定义式里三层操作的可行性分别由平坦性、导出张量与射影有限性保证，这也解释了为什么必须在光滑射影的框架里做。Mukai 的 Poincaré 丛例子说明这类变换真的能给出非平凡等价，并且它在对象层面的行为与经典 Fourier 变换完全平行：局部化的对象（点层）与「波」型的对象（线丛）互换。后续的镜像对称、K3 曲面分类、以及导出范畴与稳定性的对应都以这套语言表述。",
    examples: [
      { title: "例子：单点目标上的核 $\\mathcal{O}_{\\mathbb{P}^1}$ 与上同调计算", body: "取 $X=\\mathbb{P}^1$、$Y=\\operatorname{Spec}k$，则 $X\\times Y=\\mathbb{P}^1$，$p$ 与 $q$ 都是结构映射。核 $\\mathcal{P}=\\mathcal{O}_{\\mathbb{P}^1}$ 给出 $\\Phi(E)=\\mathbf{R}\\Gamma(\\mathbb{P}^1,E)$，即把层换成它的上同调复形。逐项计算：$\\Phi(\\mathcal{O})=\\mathbf{R}\\Gamma(\\mathcal{O}_{\\mathbb{P}^1})=k\\oplus k[-1]$，因为 $h^0=h^1=1$，复形非分散在两个次数上；$\\Phi(\\mathcal{O}(-1))=0$，因为 $\\mathcal{O}(-1)$ 的两个上同调群都是零，这说明 FM 变换可以把非零对象送到零；$\\Phi(\\mathcal{O}(-2))=k[-1]$，因为此时只有 $h^1=1$。三个结果给出了核的「选择性」：抽掉正次数截面与抽掉整个对象都可以发生。同一核还说明 FM 变换不必是等价，此时它连忠实都不满足。",
      },
      { title: "例子：椭圆曲线上由 Poincaré 丛给出的点层像", body: "取 $A=\\widehat{A}=E$ 为椭圆曲线，$\\mathcal{P}$ 为 $E\\times E$ 上的 Poincaré 丛。对 $a\\in E$，计算 $\\Phi_{\\mathcal{P}}(k_a)$：$p^*k_a$ 支撑在 $\\{a\\}\\times E$ 上并与 $\\mathcal{P}$ 张量，得到支撑在 $\\{a\\}\\times E$ 上的层，而它与 $E$ 上按 $a$ 分类的 degree 0 线丛 $\\mathcal{L}_a$ 沿这条纤维同构；$q$ 把 $\\{a\\}\\times E$ 同构地送到 $E$，故 $\\Phi_{\\mathcal{P}}(k_a)=\\mathcal{L}_a$。特别地 $\\Phi_{\\mathcal{P}}(k_0)=\\mathcal{O}_E$，而 $\\Phi_{\\mathcal{P}}(k_a)$ 对 $a\\neq0$ 是零次非平凡线丛，满足 $h^0=h^1=1$。反过来由等价性，$\\mathcal{L}_a$ 的像是 $k_a$。这条对应关系使「$E$ 上的点」与「$E$ 上的 degree 0 线丛」这两组参数被等价互换，与 Fourier 变换交换位置与频率完全类似。",
      },
    ],
    remarks: [
      "若删去 $Y$ 的射影性或光滑性，$\\mathbf{R}q_*$ 可能把有界复形送成无界复形，定义式需要改用更大的导出范畴（例如拟凝聚层的有界下复形），此时 FM 变换仍可定义但不再自动保持 $D^b$。光滑性保障的是典范层与 Serre 对偶可用，从而伴随与拟逆的理论完整；射影性保障的是高阶直接像的有限性。",
      "核决定的函子并不唯一决定核：一个反例是核与它的平移给出同构的函子，因此「核唯一」必须说成「核在同构意义下唯一」（见 Orlov 定理）。另外，两个不同的核可以给出同构的函子正是核的忠实性问题的核心，它靠对点层取值把核的上同调逐点恢复出来，因此需要 $X$ 有足够多的闭点。",
      "FM 变换不保对象的「层性」：$\\mathcal{O}_{\\mathbb{P}^1}$ 作为核把 $\\mathcal{O}(-2)$ 送到 $k[-1]$，一个层的像可以是纯位移的复形。这说明导出范畴的等价不能在层范畴（Abel 范畴）层面实现，必须允许复形与位移；把 FM 等价误当作 Abel 范畴的等价是最常见的错误。",
      "卷积公式里的顺序不可交换：$\\mathcal{Q}*\\mathcal{P}$ 与 $\\mathcal{P}*\\mathcal{Q}$ 分别是两个方向的复合，一般不同构。只有在把核搬到对偶的乘积上（交换两个因子）并同时交换 $\\mathcal{P}$ 与 $\\mathcal{Q}$ 时，才得到同一个对象；这正是伴随公式里出现转置的原因。",
    ],
    corollaries: [
      { title: "推论：张量线丛与自同构拉回都是 FM 变换", body: "对 $X=Y$，核 $\\mathcal{O}_{\\Delta}\\otimes q^*L$ 给出 $E\\mapsto E\\otimes L$；对自同构 $\\sigma:X\\to X$，核 $\\mathcal{O}_{\\Gamma_\\sigma}$（$\\sigma$ 的图像）给出 $E\\mapsto\\sigma_*E$。两者复合对应核的卷积，于是 $\\operatorname{Aut}(X)$ 与 $\\operatorname{Pic}(X)$ 都嵌入自等价群；这个嵌入何时为满就是 Bondal–Orlov 的自等价群定理。", uses: ['fm-identity-and-twist'] },
    ],
    references: [
      stacks('Section 5.28: Cohomology of sheaves（高阶直接像的有限性）', '01XS'),
      { title: 'Fourier–Mukai Transforms in Algebraic Geometry', author: 'Daniel Huybrechts', year: 2006 },
      { title: 'Duality between D(X) and D(X̂) with its application to Picard sheaves', author: 'Shigeru Mukai', year: 1981 },
    ],
    history: HISTORY,
  },

  /* ═══════════════════════════════════════════════════════════
   * 2. Orlov 定理
   * ═══════════════════════════════════════════════════════════ */

  'c-orlov': {
    statement: "设 k 是域，$X$、$Y$ 是 k 上的光滑射影簇，$F:D^b(X)\\to D^b(Y)$ 是正合函子。若 $F$ 完全忠实且拥有右伴随，则存在 $\\mathcal{P}\\in D^b(X\\times Y)$ 使 $F\\cong\\Phi_{\\mathcal{P}}$（Orlov 1997）；特别地，两个光滑射影簇之间的任意导出范畴等价都来自一个 Fourier–Mukai 变换。核在同构意义下唯一：$\\Phi_{\\mathcal{P}}\\cong\\Phi_{\\mathcal{Q}}$ 当且仅当 $\\mathcal{P}\\cong\\mathcal{Q}$。对 K3 曲面，定理的精细版本把「$D^b(X)\\cong D^b(Y)$」译为「Mukai 格之间存在保持 Hodge 结构的等距」，于是范畴等价的存在性化为可计算的格论问题。",
    explanation: "Orlov 定理回答的是导出范畴理论的元问题：可用的函子到底有多少？答案是「非常多」——完全忠实函子已经全部可由核复形描述，而等价作为特殊的完全忠实函子自然也如此。这条结论把「构造范畴等价」的工作量从「定义函子并验证三条公理」降到「写出一个核复形并算卷积」，是 K3 曲面分类、镜像对称与导出代数几何中一切等价构造的起点。定理的证明把三个不同层次的技术拼在一起：外积生成给出核的候选，点层上的像给出唯一性，而振幅有界把无穷验证压成有限验证。理解三个层次的各自作用，也就理解了为什么光滑射影这一假设无法轻易放松。",
    steps: [
      step('orlov-strategy-and-kernel', '证明总策略与候选核的构造',
        "证明分三段：构造候选核、证明振幅有界、在生成元上验证。第一段：$D^b(X\\times X)$ 由外积 $E\\boxtimes G$ 生成，先在 $E\\boxtimes G$ 上规定 $F'(E\\boxtimes G)=E\\boxtimes F(G)$，再用 F 保持正合三角这一点把对应唯一延拓为函子 $F':D^b(X\\times X)\\to D^b(X\\times Y)$，并令 $\\mathcal{P}=F'(\\mathcal{O}_{\\Delta})$。直观地说，这就是「只把 F 作用在第二个因子上」所得到的核：把恒等函子的核送过去。第三段用生成元做验证：$D^b(X)$ 的点层与结构层足以检测函子之间的自然变换，先算出 $\\Phi_{\\mathcal{P}}$ 与 F 在这些对象上给出的结果，再沿三角剖分用三角范畴的五引理推移到全体对象。问题在于这一「推移」必须有限步完成，否则会陷入无穷多层的映射锥；把无穷压成有限正是振幅有界的作用。",
        []),
      step('orlov-amplitude-bounded', '振幅有界：把无穷验证压成有限验证',
        "振幅引理断言：若 F 完全忠实，则可选择核使它的上同调集中在一个有界区间内，即存在整数 $a\\le b$ 使 $\\mathcal{H}^i(\\mathcal{P})=0$ 对 $i\\notin[a,b]$ 成立，界可由 $\\dim X$ 与 $\\dim Y$ 控制。证明思路是反向估计：点层的像是 $\\mathcal{P}$ 沿纤维的导出限制，即对闭点 x 有 $\\Phi_{\\mathcal{P}}(k_x)\\cong\\mathcal{P}|_{\\{x\\}\\times Y}$；F 的完全忠实性给出这些像之间 Hom 群与 Ext 群的上界，把这些上界沿 x 一致化，再用射影态射上同调有限性定理，就能推出 $\\mathcal{P}$ 的振幅不能任意大。这里光滑性提供导出限制与典范层、从而给出 Serre 对偶式的对偶估计；射影性提供凝聚性与有限性。若 $\\mathcal{P}$ 无界，则「在有限多个生成元上一致」不能推出函子同构，定理的结论会失效。",
        ['orlov-strategy-and-kernel']),
      step('orlov-uniqueness-via-points', '核的唯一性：点层与 Nakayama 论证',
        "证明核由函子决定。设 $\\Phi_{\\mathcal{P}}$ 是零函子（即把每个对象送到零），要证 $\\mathcal{P}=0$。对闭点 x，$p^*k_x$ 是纤维 $\\{x\\}\\times Y$ 上的结构层，故 $\\Phi_{\\mathcal{P}}(k_x)=\\mathbf{R}q_*(p^*k_x\\otimes^{\\mathbf{L}}\\mathcal{P})$；q 限制在这条纤维上是同构，所以这个结果的第 i 个上同调恰是 $\\mathcal{P}$ 沿该纤维的导出限制的同调。于是零函子给出：对一切 x，导出限制 $\\mathcal{O}_{\\{x\\}\\times Y}\\otimes^{\\mathbf{L}}\\mathcal{P}$ 的每个上同调群在该纤维上处处为零。若 $\\mathcal{P}\\neq0$，取某个 $\\mathcal{H}^i(\\mathcal{P})\\neq0$ 与它支撑上的一个点 $(x_0,y_0)$；把 $\\mathcal{O}_{\\{x_0\\}\\times Y}\\otimes^{\\mathbf{L}}\\mathcal{P}$ 在 $(x_0,y_0)$ 处局部化，用 Koszul 表示与谱序列，其 0 次项是 $\\mathcal{H}^i(\\mathcal{P})$ 模去纤维理想后的张量，由 Nakayama 引理非零，而更高 Tor 项不能把它全部抵消，故至少一个上同调群非零，矛盾。由此 $\\Phi_{\\mathcal{P}}\\cong0$ 蕴含 $\\mathcal{P}=0$；对一般的同构 $\\Phi_{\\mathcal{P}}\\cong\\Phi_{\\mathcal{Q}}$ 取锥即得 $\\mathcal{P}\\cong\\mathcal{Q}$。",
        ['orlov-amplitude-bounded']),
      step('orlov-k3-hodge-isometry', 'K3 情形：格论判据',
        "K3 曲面是定理最有名的应用场景。K3 的偶上同调配上 Mukai 配对构成 Mukai 格，它作为格同构于 $U^3\\oplus E_8(-1)^2$，秩 24、符号差 $(4,20)$。Mukai 证明任何 FM 等价都诱导 Mukai 格之间保持 Hodge 结构与配对的等距（见本批次的 Mukai 配对条目）；Orlov 反过来证明，当存在这样的 Hodge 等距（并满足有效性条件）时，两个 K3 曲面导出等价。两句话合起来，K3 曲面之间的范畴等价问题被完全翻译成二次型与 Hodge 结构的计算：等距的存在性只依赖超越格与判别式群，而不要求曲面同构。这正是「导出等价弱于同构」的源头：格数据相同的两个 K3 曲面可以有很不相同的双有理几何，却共享同一个导出范畴，Mukai 与后续工作据此造出了互相不同构的 FM 伙伴。",
        ['orlov-uniqueness-via-points']),
      step('orlov-consequences-and-limits', '推论、维数不变量与失效边界',
        "直接推论有三条。第一，维数是导出范畴的粗不变量：等价把 Serre 函子 $S_X=(-)\\otimes\\omega_X[\\dim X]$ 送到 $S_Y$，而 $S_X$ 作用在点层上给出 $k_x[\\dim X]$，于是 $\\dim X=\\dim Y$；这立刻排除 $D^b(\\mathbb{P}^1)\\cong D^b(\\mathbb{P}^2)$，因为两者维数不同。第二，光滑射影曲线之间的任何等价都由核给出，核的支集有限地投影到两侧，结合曲线的 Serre 对偶可以逐案检查，这使得曲线情形成为可以完全手算的模型。第三，定理的假设不可轻易删减：去掉右伴随假设后结论失败，Rizzardo 与 Van den Bergh 造出过完全忠实却不与任何 FM 核同构的正合函子；而换成奇异簇或非射影簇时，点层与有限性论证都要重新设计。",
        ['orlov-k3-hodge-isometry']),
    ],
    conclusion: "光滑射影簇之间的完全忠实正合函子（带右伴随）必与某个 FM 变换同构，核在同构意义下唯一；对 K3 曲面，等价的存在性等价于 Mukai 格之间保持 Hodge 结构的等距；维数、Serre 函子与格结构构成可计算的等价不变量。",
    dependencies: [],
    consequences: [],
    explanation: "Orlov 定理是「几何函子的代数化」：它说明能想到的所有自然函子（拉回、推前、张量、形变、Fourier–Mukai 翻转）都在一个统一的核描述里，于是范畴之间的等价不再需要逐个构造，而只需要搜索核。这条定理的另一面是限制：等价必须来自几何对应，因此范畴的不变量（Serre 函子、格、Ext 配对）都能回溯到几何对象上，为「导出范畴到底记得多少几何」提供了框架。振幅有界是全部技术困难所在，它把「一致地」这种看似容易的要求变成了需要射影有限性支撑的实质条件，也解释了为什么拟射影或奇异情形的定理需要额外的紧支撑假设。",
    examples: [
      { title: "例子：点层不足以确定核：$\\mathcal{O}_{\\Delta}$ 与 $\\mathcal{O}_{\\Delta}\\otimes q^*\\mathcal{O}(1)$", body: "取 $X=Y=\\mathbb{P}^1$。核 $\\mathcal{O}_{\\Delta}$ 给出恒等函子；核 $\\mathcal{O}_{\\Delta}\\otimes q^*\\mathcal{O}(1)$ 给出 $E\\mapsto E\\otimes\\mathcal{O}(1)$。在点层上两者的差别消失：$k_x\\otimes\\mathcal{O}(1)$ 的纤维仍是 $k$，故两个函子都把 $k_x$ 送到 $k_x$，把 $\\mathcal{O}_{\\mathbb{P}^1}$ 送到 $\\mathcal{O}$ 与 $\\mathcal{O}(1)$（两个不同构的线丛）。若只用点层做检验，会错误地认为两个函子相同；正确做法是同时使用点层（给支撑信息）与整体对象上的 Hom 群（给扭转信息）。这个例子也说明唯一性证明的关键是「零函子蕴含零核」这种单向命题，而非「在点层上一致即同构」。",
      },
      { title: "例子：$\\mathbb{P}^1$ 上的 Beilinson 生成元与核数据", body: "$D^b(\\mathbb{P}^1)$ 由例外对 $(\\mathcal{O},\\mathcal{O}(1))$ 生成，互 Ext 完全可算：$R\\operatorname{Hom}(\\mathcal{O},\\mathcal{O}(1))=k^2$（集中于 0 次，因为 $h^0(\\mathcal{O}(1))=2$、$h^1=0$），$R\\operatorname{Hom}(\\mathcal{O}(1),\\mathcal{O})=0$（因为 $\\mathcal{O}(-1)$ 的两个上同调群都是零），$R\\operatorname{Hom}(\\mathcal{O},\\mathcal{O})=k\\oplus k[-1]$。于是从 $\\mathbb{P}^1$ 到自身的一个核可以由「把 $\\mathcal{O}$、$\\mathcal{O}(1)$ 送到哪两个对象」以及它们之间的 Hom 复形完全决定：这正是 Orlov 定理「核的唯一性」在具体曲面上的显式形态。把 $\\mathcal{O}(1)$ 换成另一个线丛，或把两个生成元按相反顺序排列，会得到不同的核与不同的自等价，这构成了 $\\mathbb{P}^1$ 自等价群最基本的离散部分。",
      },
    ],
    remarks: [
      "右伴随这一条假设不能省：Rizzardo 与 Van den Bergh 的例子表明存在完全忠实、保持三角结构的正合函子，它不与任何 $D^b(X\\times Y)$ 中的核同构。这类反例往往利用基本群或非单连通性构造，因此定理的正确读法是「带伴随的完全忠实函子是 FM 型」，而不是「一切正合函子都是 FM 型」。",
      "核的唯一性是「同构意义下」的唯一，并且核的位移会改变函子的悬挂：若把 $\\mathcal{P}$ 换成 $\\mathcal{P}[m]$，则函子整体平移 m 次。因此把定理叙述为「核唯一」时必须同时固定平移与张量扭曲的约定，否则会出现形式上不同但其实同构的表述，这在查阅文献时最容易产生符号混乱。",
      "K3 的格论判据要求等距保持 Hodge 结构，仅格同构不足够；此外一般叙述还要为「扭曲」（Brauer 类）留出余地，因为某些等价需要把一侧的范畴换成扭曲版本。忘记这两点会把「格同构即等价」当成定理，而这是错的：Hodge 结构的相容性正是把纯格论对象与几何对象区分开的条件。",
      "定理只对光滑射影簇给出结论。对奇异簇，点层不再是紧对象，导出范畴的生成元与有限性论证都需要替换（例如改用奇点范畴或带支撑的导出范畴）；对拟射影簇，射影态射的有限性定理失效，$Rq_*$ 可能不再保持有界，核的构造必须改用带紧支撑或有界的版本。",
    ],
    corollaries: [
      { title: "推论：维数是导出范畴的不变量", body: "等价 $F$ 把 Serre 函子送到 Serre 函子：$F\\circ S_X\\cong S_Y\\circ F$。对闭点 x，$S_X(k_x)=k_x\\otimes\\omega_X[\\dim X]=k_x[\\dim X]$ 是点层的平移，而 $S_Y$ 作用在 $F(k_x)$ 上也必须产生同一个对象；比较两边的平移次数得到 $\\dim X=\\dim Y$。因此曲线与曲面之间、曲面与三维簇之间都不可能有导出等价，$\\mathbb{P}^1$ 与 $\\mathbb{P}^2$ 的情形就是一个直接例子。", uses: ['orlov-consequences-and-limits'] },
    ],
    references: [
      { title: 'Equivalences of derived categories and K3 surfaces', author: 'Dmitri Orlov', year: 1997 },
      { title: 'An example of a non-Fourier–Mukai functor between derived categories of coherent sheaves', author: 'Alice Rizzardo, Michel Van den Bergh', year: 2019 },
      { title: 'Fourier–Mukai Transforms in Algebraic Geometry', author: 'Daniel Huybrechts', year: 2006 },
    ],
    history: HISTORY,
  },

  /* ═══════════════════════════════════════════════════════════
   * 3. Bondal–Orlov 重构
   * ═══════════════════════════════════════════════════════════ */

  'c-bondal-orlov': {
    statement: "设 $X$、$Y$ 是代数闭域上的光滑射影簇，$X$ 的典范层 $\\omega_X$ 丰沛、或反典范层 $\\omega_X^{-1}$ 丰沛（例如 $X$ 一般型或 Fano）。若 $D^b(X)\\cong D^b(Y)$，则 $X\\cong Y$（Bondal–Orlov 2001）。更强的结论是自等价群的形式：在这类簇上每个自等价都同构于「自动同构拉回、张量线丛、整体平移」的复合，因此 $\\operatorname{Aut}(D^b(X))$ 由 $\\operatorname{Aut}(X)$、$\\operatorname{Pic}(X)$ 与 $\\mathbb{Z}$ 拼成。反之，去掉丰沛性结论会失败：K3 曲面之间存在导出等价而互不同构的例子。",
    explanation: "这条定理说明导出范畴能把簇本身钉住，而不是只钉住某个粗糙的等价类。证明的骨架分两层：范畴层面先取回 Serre 函子与典范层的关系，并把典范环写成只依赖范畴、对象与 Serre 函子的表达式；几何层面再用丰沛性把簇实现为这个分次环的 Proj。两层合起来给出一个从范畴出发重建簇的路线：$X$ 与 $Y$ 都被同一个分次环的 Proj 表示，而同构随之而来。与 K3 情形的对比是理解这条定理边界的最好方式：那里的典范层是平凡的，既非丰沛也非反丰沛，重建的两条腿都站不住，于是出现大量的 FM 伙伴与球面扭转等非标准自等价。",
    steps: [
      step('bondal-serrefunctor-invariants', 'Serre 函子相容：维数与典范层的相对位置',
        "第一步把等价的范畴信息翻译为几何信息。设 $F:D^b(X)\\to D^b(Y)$ 是等价，两簇都光滑射影，则 Serre 函子是唯一的正合函子 $S$ 配上自然同构 $\\operatorname{Hom}(E,F)^\\vee\\cong\\operatorname{Hom}(F,S(E))$，于是 $F\\circ S_X\\cong S_Y\\circ F$，即 $S_Y\\cong F\\circ S_X\\circ F^{-1}$。代入 $S_X=(-)\\otimes\\omega_X[\\dim X]$ 与 $S_Y=(-)\\otimes\\omega_Y[\\dim Y]$，再作用在结构层上并比较：$F(\\omega_X)[\\dim X]\\cong F(\\mathcal{O}_X)\\otimes\\omega_Y[\\dim Y]$。把这条等式迭代 $k$ 次（等价地比较 $S_X^k$ 与 $S_Y^k$）得到对一切整数 k 成立的关系 $F(\\omega_X^k)\\cong F(\\mathcal{O}_X)\\otimes\\omega_Y^k$，其中平移自动抵消，这解释了为何维数两边必须相等。这条关系是后面一切的输入：典范层的所有幂次在等价下的位置都被结构层的像「锁定」。",
        []),
      step('bondal-canonical-ring', '典范环是范畴不变量',
        "第二步把典范环写成范畴表达式。对任意对象 $\\mathcal{G}\\in D^b(X)$，定义分次环 $A(\\mathcal{G})=\\bigoplus_{k\\ge0}\\operatorname{Hom}(\\mathcal{G},\\mathcal{G}\\otimes\\omega_X^k)$，乘法由「先作用右边的同态、再张量 $\\omega_X^l$ 并复合」给出。取 $\\mathcal{G}=\\mathcal{O}_X$ 得 $A(\\mathcal{O}_X)=\\bigoplus_k H^0(X,\\omega_X^k)$，正是 X 的典范环；这里用到线丛的整体截面与到结构层的同态一一对应这一基本事实。关键在于 $A$ 完全由范畴数据表出：Hom 群是范畴数据，张量 $\\omega_X^k$ 由 Serre 函子的迭代给出。于是在等价 $F$ 下，$A_X(\\mathcal{O}_X)\\cong A_Y(F(\\mathcal{O}_X))$，即 X 的典范环可以在 Y 的范畴里算出来，且计算只用到一个对象 $F(\\mathcal{O}_X)$ 与 Y 的 Serre 函子。",
        ['bondal-serrefunctor-invariants']),
      step('bondal-proj-reconstruction', '丰沛性：把簇实现为典范环的 Proj',
        "第三步是丰沛性发挥作用的地方。若 $\\omega_X$ 丰沛，则对某个 $m>0$，$\\omega_X^m$ 非常丰沛，给出嵌入 $X\\hookrightarrow\\mathbb{P}^N$，其齐次坐标环正是典范环的第 m 次 Veronese 子环 $\\bigoplus_k H^0(\\omega_X^{km})$。于是有 $X\\cong\\operatorname{Proj}\\bigoplus_k H^0(X,\\omega_X^k)$：一边用 Veronese 子环不改变 Proj，一边用非常丰沛次数给出的嵌入把 Proj 认回 X。反典范丰沛的情形完全平行，只需把 $\\omega_X$ 换成 $\\omega_X^{-1}$，并注意 $S_X^{-1}$ 的迭代同样由 Serre 函子的逆给出。这样「从范畴重建 X」就有了明确公式：X 是某个只依赖范畴数据的分次环的 Proj。再用 Zariski 的定理（丰沛线丛的截面环有限生成）可以保证这个分次环确实定义出一个射影簇。",
        ['bondal-canonical-ring']),
      step('bondal-kernel-and-conclusion', '核的支集分析与同构的落地',
        "最后一步把重建提升为「$X\\cong Y$」。由 Orlov 定理（本批次另有条目），等价由核 $\\mathcal{P}\\in D^b(X\\times Y)$ 给出，$F=\\Phi_{\\mathcal{P}}$。文献中的做法是对核的支集 $\\Sigma=\\bigcup_i\\operatorname{Supp}(\\mathcal{H}^i(\\mathcal{P}))\\subset X\\times Y$ 逐步剖析：先证明 $\\Sigma$ 在两侧的投影都是满射，否则等价会把某个非零对象送到零；再用丰沛性排除支集含有「多余方向」的可能，理由是若 $\\Sigma$ 在某点的纤维维数超出预期，则对应对象在 $\\omega$ 的幂次下会出现无法容忍的上同调跳跃；最后得到 $\\Sigma$ 是两个投影下的双有理对应，而两个方向的可逆性用它同时是双有理与有限型推出。结论是 $\\Sigma$ 是某个同构 $f:X\\to Y$ 的图像，且 $\\mathcal{P}$ 是图像结构层的位移与线丛扭转，于是 $X\\cong Y$，并且可以把等价标准化为「拉回、张量、平移」的复合。",
        ['bondal-proj-reconstruction']),
      step('bondal-autoequivalence-group', '自等价群与丰沛性的失效后果',
        "把同一条论证用于 $X=Y$ 得到自等价群的结构：当 $\\omega_X$ 或 $\\omega_X^{-1}$ 丰沛时，$\\operatorname{Aut}(D^b(X))$ 由 $\\operatorname{Aut}(X)$（拉回）、$\\operatorname{Pic}(X)$（张量与扭转到图像结构层上）以及平移 $\\mathbb{Z}$ 生成。作为检验，取光滑射影曲线 C 且亏格 $\\ge2$：此时 $\\omega_C$ 度数为正故丰沛，理论上自等价只有「拉回、张量、平移」三种，没有额外的离散族。反过来，若典范层不丰沛，群的规模可以暴涨：K3 曲面上一条 $(-2)$ 曲线 $C$ 上的球面扭转 $T_C$ 是自等价，它把 $\\mathcal{O}_C$ 送到 $\\mathcal{O}_C[1]$，显然不是「拉回加张量」，因为张量线丛不改变对象的上同调位置；阿贝尔簇上的 Poincaré 丛变换与平移复合也给出 $\\operatorname{Aut}(X)$ 之外的等价。",
        ['bondal-kernel-and-conclusion']),
    ],
    conclusion: "若光滑射影簇的典范层或反典范层丰沛，则 $D^b(X)\\cong D^b(Y)$ 蕴含 $X\\cong Y$，因为 X 可由只依赖范畴数据（Serre 函子、Hom 群）的典范环的 Proj 重建，而核的支集分析把等价标准化为同构的拉回、张量与平移；丰沛性一旦失效（K3 曲面），等价便不再决定同构，自等价群也出现球面扭转等非标准元素。",
    dependencies: [],
    consequences: [],
    explanation: "Bondal–Orlov 定理的价值有两面。正面：它给出「导出范畴是完备不变量」的一大类簇，且证明过程本身提供了一套重建手册——先取回 Serre 函子与典范层，再算典范环，最后取 Proj。反面：它精确划出了失效的边界，K3 曲面、阿贝尔簇、椭圆曲线都不满足丰沛假设，于是它们的自等价群远比「拉回加张量加平移」丰富，球面扭转与 Poincaré 变换成为几何上不可见却范畴上真实的对称。这种「丰沛时刚性、不丰沛时柔软」的分界是导出范畴几何的核心现象之一，也是镜像对称能在 Calabi–Yau 侧长出大量等价的原因。",
    examples: [
      { title: "例子：亏格 2 曲线的典范环与 Hilbert 函数的核算", body: "取光滑射影曲线 C，亏格 $g=2$，则 $\\deg\\omega_C=2g-2=2>0$，故 $\\omega_C$ 丰沛，定理适用。用 Riemann–Roch 算典范环各次分量：对 $k\\ge2$，$\\deg(k\\omega_C)=2k>2g-2=2$，故 $h^1(k\\omega_C)=0$，而 $h^0(k\\omega_C)=2k-1$；$k=1$ 时 $h^0=2$，$h^1=1$。于是分次环的 Hilbert 函数为 $1,2,3,5,7,9,\\ldots$，从 2 次起线性增长、斜率为 $\\deg\\omega_C=2$，与「典范环的维数增长由 $\\omega$ 的次数决定」这一预期吻合。再验证重建：$\\deg(3\\omega_C)=6\\ge2g+1=5$，故 $3\\omega_C$ 非常丰沛，给出嵌入，而齐次坐标环正是典范环的 3 次 Veronese，于是 $C\\cong\\operatorname{Proj}\\bigoplus_k H^0(k\\omega_C)$ 可以显式核对。",
      },
      { title: "例子：曲线自等价的标准形式与球面扭转的对照", body: "设 C 光滑射影曲线、亏格 $g\\ge2$。核 $\\mathcal{O}_{\\Gamma_\\sigma}$（自同构 $\\sigma$ 的图像）给出拉回 $\\sigma_*$，核 $\\mathcal{O}_{\\Delta}\\otimes q^*L$ 给出张量 $L$，平移由整体位移实现；三者复合给出 $\\operatorname{Aut}(C)\\ltimes(\\operatorname{Pic}(C)\\times\\mathbb{Z})$，而定理断言这就是全部。作为对照，取 K3 曲面 X 与 X 上一条 $(-2)$ 曲线 C：球面扭转 $T_C$ 满足 $T_C(\\mathcal{O}_C)=\\mathcal{O}_C[1]$，它把层送成位移一格的复形，而张量线丛与拉回都保持「层」的位置（最多整体平移同一格，不会把同一个对象内部的不同部分错开），因此在 K3 上存在不落在标准形式里的自等价。两者的差别恰好对应 $\\omega$ 丰沛与不丰沛。",
      },
    ],
    remarks: [
      "定理需要两侧都光滑射影：若 Y 只有正常性或带奇点，结论可以失败；反过来若 X 光滑射影、$\\omega_X$ 丰沛而 Y 只是紧合，则核的支集分析仍能给出 Y 的形状，但「Y 光滑射影」是使 Serre 函子具备简单形式的前提。忽略这一条会把定理误用为「任何两个簇的导出范畴等价都蕴含同构」。",
      "反典范丰沛（Fano）的情形在群结构上会出现额外的离散可能性：$\\omega_X^{-1}$ 丰沛时自等价群的叙述与典范丰沛对称，但如果 $\\omega_X$ 既非丰沛也非反丰沛，例如 Calabi–Yau 或一般型以外中间类型，则定理不给出任何结论，且确有反例。这是「丰沛或反丰沛」这一二分法不可替换的边界说明。",
      "证明里用到了丰沛线丛截面环的有限生成（Zariski 定理）。若放弃有限生成，Proj 仍可定义但可能不是有限型簇，「重建出的对象」就从射影簇退化为形式对象；这一步是代数侧唯一需要外部定理的地方，也是把结论限制在丰沛情形的原因之一。",
      "K3 曲面的反例不是「模型不够精细」造成的假象，而是真实的几何现象：Mukai 的 Poincaré 型变换与球面扭转给出与同构无关的等价，并且这些等价在 K 群、Hodge 结构等线性化不变量上都无法区分。因此对 K3，导出范畴是比加细不变量更粗的分类工具，这与一般型簇的刚性恰成对照。",
    ],
    corollaries: [
      { title: "推论：一般型簇与 Fano 簇的导出范畴是完备不变量", body: "取光滑射影簇 X，一般型（$\\omega_X$ 丰沛）或 Fano（$\\omega_X^{-1}$ 丰沛）。对任意光滑射影 Y，$D^b(X)\\cong D^b(Y)$ 蕴含 $X\\cong Y$；进一步地，若 $X\\cong Y$ 且等价来自核，则这个等价可以写成「拉回、张量线丛、平移」的复合。于是对这些簇，导出范畴的分类与簇的同构分类一致，任何范畴层面的操作都必须有几何来源。", uses: ['bondal-autoequivalence-group'] },
    ],
    references: [
      { title: 'Reconstruction of a variety from the derived category and groups of autoequivalences', author: 'Alexei Bondal, Dmitri Orlov', year: 2001 },
      { title: 'Fourier–Mukai Transforms in Algebraic Geometry', author: 'Daniel Huybrechts', year: 2006 },
      { title: 'Twisted sheaves and the Fourier–Mukai transform（K3 与球面扭转的出处）', author: 'Paul Seidel, Richard Thomas', year: 2001 },
    ],
    history: HISTORY,
  },

  /* ═══════════════════════════════════════════════════════════
   * 4. Mukai 格与配对
   * ═══════════════════════════════════════════════════════════ */

  'c-mukai-pair': {
    statement: "设 $X$ 是光滑射影簇，对 $E\\in D^b(X)$ 定义 Mukai 向量 $v(E)=\\operatorname{ch}(E)\\sqrt{\\operatorname{td}(X)}\\in H^{2*}(X,\\mathbb{Q})$。在偶次上同调上定义 Mukai 配对各分量之和：$\\bigl(a_0+a_2+a_4+\\cdots\\bigr)^{\\vee}=a_0-a_2+a_4-\\cdots$，再令 $\\langle x,y\\rangle=-\\int_X x^{\\vee}\\cdot y$。则对任意两个对象的 Ext 群有 $\\chi(E,F)=\\sum_i(-1)^i\\dim\\operatorname{Ext}^i(E,F)=\\int_X v(E)^{\\vee}v(F)=-\\langle v(E),v(F)\\rangle$。若核 $\\mathcal{P}$ 给出等价 $\\Phi_{\\mathcal{P}}$，则共轭的上同调变换 $\\Phi^{H}_{\\mathcal{P}}(x)=q_*\\bigl(p^*x\\cdot v(\\mathcal{P})\\bigr)$ 满足 $v(\\Phi_{\\mathcal{P}}(E))=\\Phi^{H}_{\\mathcal{P}}(v(E))$，它是保持 Hodge 结构与 Mukai 配对的同构，其中 $\\operatorname{ch}$、$\\operatorname{td}$ 与 $\\sqrt{\\phantom{x}}$ 都按形式幂级数理解。",
    explanation: "Mukai 配对的构造动机是让 Riemann–Roch 变得完全对称：把 Chern 特征乘上托德类的平方根，Ext 群的交错维数就被写成两个向量的配对，于是「范畴层面的 Hom 计算」与「上同调层面的二次型」用一条公式对接。这样做的收益是双重的。一方面它给出检验等价的工具：等价保持 Ext 维数，所以必须保持这个配对，任何候选核都可以先在配对层面筛选。另一方面它把格论引入导出范畴：在 K3 上配对是秩 24 的偶幺模格，两个曲面的等价问题于是变成 Hodge 等距的存在性问题。托德类的平方根是关键取舍：只有乘上它，$\\chi$ 才能写成配对，否则会出现与 $\\omega$ 相关的修正项。",
    steps: [
      step('mukai-vector-and-pairing', 'Mukai 向量与配对的定义',
        "对光滑射影簇 X 定义 Mukai 向量 $v(E)=\\operatorname{ch}(E)\\sqrt{\\operatorname{td}(X)}$。托德类按形式幂级数展开 $\\operatorname{td}(X)=\\prod_i\\frac{x_i}{1-e^{-x_i}}$（$x_i$ 为切丛的 Chern 根），它的平方根按同样的幂级数取，整体属于偶次上同调，因此与 $\\operatorname{ch}(E)$ 的乘积仍然是偶次上同调中的类。配对的符号规则是：对偶只需把每个 $a_{2i}$ 乘上 $(-1)^i$，即 $x^{\\vee}=\\sum_i(-1)^i x_{2i}$；然后令 $\\langle x,y\\rangle=-\\int_X x^{\\vee}y$。这个配对是双线性的、非退化的，理由是最顶次部分正是 Poincaré 对偶配上逐次的符号，而 Poincaré 对偶本身非退化。它的一个直接性质是对偶化：$v(E^{\\vee})=\\operatorname{ch}(E^{\\vee})\\sqrt{\\operatorname{td}(X)}$，而 $\\operatorname{ch}(E^{\\vee})=\\sum_i(-1)^i\\operatorname{ch}^i(E)$，因平方根只含偶次项，这与「把向量逐分量变号」完全一致。",
        []),
      step('mukai-pairing-computes-ext', '配对就是 Ext 的交错维数',
        "证明恒等式 $\\chi(E,F)=\\int_X v(E)^{\\vee}v(F)$。左边按定义展开为 $\\sum_i(-1)^i\\dim\\operatorname{Ext}^i(E,F)$，它等于 $E$ 与 $F$ 之间 RHom 的 Euler 特征。由 Grothendieck–Riemann–Roch 应用于 X 上的恒等态射与复形 $R\\mathcal{H}om(E,\\mathcal{O}_X)\\otimes^{\\mathbf{L}}F$，得到 $\\chi$ 等于 $\\operatorname{ch}\\bigl(R\\mathcal{H}om(E,F)\\bigr)\\operatorname{td}(X)$ 的最高次部分的积分。再用 $\\operatorname{ch}(R\\mathcal{H}om(E,F))=\\operatorname{ch}(E^{\\vee})\\operatorname{ch}(F)$（这来自逐项取对偶与张量积在 Chern 特征上的乘法性，以及对偶的符号规则），代入即得 $\\chi(E,F)=\\int_X\\operatorname{ch}(E^{\\vee})\\operatorname{ch}(F)\\operatorname{td}(X)$。最后把两个 $\\sqrt{\\operatorname{td}(X)}$ 分配给 $E$ 与 $F$：$v(E)^{\\vee}v(F)=\\operatorname{ch}(E^{\\vee})\\operatorname{ch}(F)\\bigl(\\sqrt{\\operatorname{td}}\\bigr)^2=\\operatorname{ch}(E^{\\vee})\\operatorname{ch}(F)\\operatorname{td}(X)$，比较即得结论。符号 $-\\int$ 与 $\\int$ 的差别只是配对定义中的约定。",
        ['mukai-vector-and-pairing']),
      step('mukai-cohomological-transform', '上同调层面的 FM 变换',
        "核给出函子以后，同一套 Riemann–Roch 计算把「对象的 Mukai 向量」与「核的 Mukai 向量」连起来。设 $\\Phi_{\\mathcal{P}}(E)=\\mathbf{R}q_*(p^*E\\otimes^{\\mathbf{L}}\\mathcal{P})$，对推前用 Grothendieck–Riemann–Roch 得到 $\\operatorname{ch}(\\Phi(E))\\sqrt{\\operatorname{td}(Y)}=q_*\\bigl(p^*(\\operatorname{ch}(E)\\sqrt{\\operatorname{td}(X)})\\cdot\\operatorname{ch}(\\mathcal{P})\\sqrt{\\operatorname{td}(X\\times Y)}\\bigr)$。推导要点有两处：其一，投影 $p$ 的相对托德类与 $\\operatorname{td}(X)$ 的平方根正好凑成 $v(E)$ 所需的因子，这解释了为何要在定义里引入平方根；其二，乘积簇的托德类是两侧托德类之积，故 $\\sqrt{\\operatorname{td}(X\\times Y)}=p^*\\sqrt{\\operatorname{td}(X)}\\,q^*\\sqrt{\\operatorname{td}(Y)}$，于是右侧可以按核的 Mukai 向量 $v(\\mathcal{P})=\\operatorname{ch}(\\mathcal{P})\\sqrt{\\operatorname{td}(X\\times Y)}$ 重写。结果是 $v(\\Phi_{\\mathcal{P}}(E))=q_*\\bigl(p^*v(E)\\cdot v(\\mathcal{P})\\bigr)=:\\Phi^{H}_{\\mathcal{P}}(v(E))$，一条线性映射给出的公式。",
        ['mukai-pairing-computes-ext']),
      step('mukai-equivariance-and-invariants', '等价的保持性：配对、Hodge 与格',
        "若 $\\Phi_{\\mathcal{P}}$ 是等价，则 $\\Phi^{H}_{\\mathcal{P}}$ 是同构并保持配对。保持 Ext 维数是等价的最基本性质：等价诱导 $\\operatorname{Hom}(E,F[i])\\cong\\operatorname{Hom}(\\Phi E,\\Phi F[i])$，两边取交错和得到 $\\chi(E,F)=\\chi(\\Phi E,\\Phi F)$。把它与上一步的恒等式合起来，$\\langle v(E),v(F)\\rangle=\\langle v(\\Phi E),v(\\Phi F)\\rangle$，即 $\\Phi^{H}$ 是配对的等距。同构性来自函子的复合：两个核的卷积对应两个上同调变换的复合，恒等函子的核 $\\mathcal{O}_{\\Delta}$ 的 Mukai 向量给出恒等映射，于是等价的拟逆给出逆映射。Hodge 结构的保持来自公式的形状：$v(\\mathcal{P})$ 的每一分量都有明确的 $(p,q)$ 型，$p^*$、$q_*$ 分别保持与平移 $(p,q)$ 型，故 $\\Phi^{H}$ 逐次地把 $H^{p,q}$ 送到 $H^{p+\\delta,q+\\delta}$，是一个带整体平移的 Hodge 同构。对 K3 曲面，这些性质合起来说明任何 FM 等价都诱导 Mukai 格上保持 Hodge 结构与二次型的等距。",
        ['mukai-cohomological-transform']),
      step('mukai-boundary-and-limits', '边界：构造性、积分性与已知反例',
        "三点边界必须说清。第一，这条定理只是必要条件链：等价蕴含配对等距，反之一般不成立，因为 $\\Phi^{H}$ 只记录了上同调层面的线性化信息，无法区分不同的核（例如核与它的平移给出同一个线性化映射但不同函子），也无法排除只在线性化层面成立的等距。第二，积分性需要额外验证：$\\sqrt{\\operatorname{td}(X)}$ 一般不是整系数类，$v(E)$ 只在有理系数下取值，因此「Mukai 格」这一说法在 K3 与阿贝尔簇上才有整齐的整形式，一般簇上要用带分母的形式。第三，等价的家族性也不能推广过头：把 $\\Phi^{H}$ 的等距性质反过来当作等价判据会出错，K3 上的正向定理需要额外假设（Hodge 等距的存在性，以及必要时改用扭曲等价）。",
        ['mukai-equivariance-and-invariants']),
    ],
    conclusion: "Mukai 向量 $v(E)=\\operatorname{ch}(E)\\sqrt{\\operatorname{td}(X)}$ 把 Ext 的交错维数写成配对 $\\chi(E,F)=\\int_X v(E)^{\\vee}v(F)=-\\langle v(E),v(F)\\rangle$；等价的上同调变换 $\\Phi^{H}_{\\mathcal{P}}=q_*(p^*(-)\\cdot v(\\mathcal{P}))$ 把 Mukai 向量逐级对应起来，并保持 Hodge 结构与 Mukai 配对，因此导出范畴等价给出带额外结构的格同构，而不只是向量空间的同构。",
    dependencies: [],
    consequences: [],
    explanation: "Mukai 配对的作用是给「范畴等价有多强」这个问题一个可计算的答案：它把 Ext 群的全部维数打包成一个二次型，等价必须保持这个二次型，于是范畴层面的等价在格层面留下指纹。这个指纹足够强，可以在 K3 上把范畴等价问题完全化为格与 Hodge 结构的组合问题；也足够弱，可以在 K3 上留下大量互不同构的伙伴，因为保配对的等距远多于同构。把托德类的平方根放进向量定义是整个构造的关键技巧：它让 $\\chi$ 变成纯配对而不带修正项，也让核的卷积与向量的乘积在同一公式里对齐。",
    examples: [
      { title: "例子：K3 曲面上三条向量与配对值的核算", body: "取 X 为 K3 曲面。此时 $\\operatorname{td}(X)=1+2[\\text{点}]$，故 $\\sqrt{\\operatorname{td}(X)}=1+[\\text{点}]$。对结构层：$v(\\mathcal{O}_X)=\\operatorname{ch}(\\mathcal{O}_X)(1+[\\text{pt}])=(1,0,1)$，其中中间分量是 $c_1=0$，末分量是 $\\operatorname{ch}_2=0$ 加重数 1。对闭点上的摩天楼层 $k_x$：$\\operatorname{ch}(k_x)=[\\text{pt}]$，故 $v(k_x)=(0,0,1)$。对线丛 L：$v(L)=(1,c_1(L),c_1(L)^2/2)$。配对规则为 $\\ell\\ell'-rs'-sr'$。核对：$\\langle v(\\mathcal{O}),v(\\mathcal{O})\\rangle=0-1-1=-2$，而 $-\\chi(\\mathcal{O},\\mathcal{O})=-(1-0+1)=-2$，一致；$\\langle v(k_x),v(\\mathcal{O})\\rangle=0-0-1=-1$，而 $-\\chi(k_x,\\mathcal{O})=-1$，因为只有 0 次 Ext 非零且维数 1。",
      },
      { title: "例子：格数据与 Hodge 结构：Mukai 格的计算", body: "仍取 K3 曲面 X。Mukai 格 $\\tilde{H}(X,\\mathbb{Z})=H^0\\oplus H^2\\oplus H^4$ 在配对下是秩 24 的偶幺模格，同构于 $U^3\\oplus E_8(-1)^2$，符号差 $(4,20)$，与 X 的选取无关。Hodge 结构则由 $H^{2,0}$ 那一维决定：$\\tilde{H}$ 上的 Hodge 分解由 $H^2(X,\\mathbb{Z})$ 的 Hodge 结构加上 $H^0$、$H^4$ 的纯型给出，因此等距的 Hodge 相容性等价于「把 $H^{2,0}(X)$ 送到 $H^{2,0}(Y)$」。作为可核算的推论，两个 K3 曲面若超越格的 Hodge 结构不匹配（例如超越格的判别式或符号差不同），就不可能导出等价；反之在满足有效性条件时 Orlov 的定理给出等价。",
      },
    ],
    remarks: [
      "符号约定因文献而异：$\\operatorname{ch}$ 是否带 $\\sqrt{-1}/2\\pi$ 因子、配对是否取 $-\\int$、以及 $v(E)$ 用 $\\operatorname{td}$ 还是 $\\operatorname{td}^{1/2}$ 都影响最终符号。可检验的不变量是恒等式 $\\chi(E,F)=\\int_X v(E)^{\\vee}v(F)$，只要它成立，其余符号都是约定；照搬不同来源的公式而混用约定会得到错误的正负号。",
      "配对只在偶次上同调上定义，奇次部分不参与；因此若把整个 $H^*$ 直接代入，必须先把奇次分量丢掉或按分量规则处理。这一限制在 K3 上不显眼（奇次上同调为零），但在奇维簇上会立刻出现：A 型与 B 型的混合分量必须分别处理，否则「配对保持」这句话就没有针对的对象。",
      "托德类平方根的有理性是说清适用范围的要点：对 K3 与阿贝尔簇，$\\sqrt{\\operatorname{td}}$ 在整系数下可写，Mukai 格才是整格；一般簇上 $v(E)$ 落在有理上同调，配对也在有理系数下取值，此时配对仍是双线性非退化形式但不构成整格，不能直接引用幺模格的分类定理。",
      "等距保持是必要条件而非充分条件：存在保持 Mukai 配对与 Hodge 结构的格等距却不来自任何 FM 等价的情形（需要额外的有效性或扭曲条件）。因此这条定理适合用作「排除等价」的工具，用作「构造等价」时必须补齐格以外的输入。",
    ],
    corollaries: [
      { title: "推论：K3 曲面等价的格判据", body: "对 K3 曲面 X 与 Y，任意 FM 等价给出 Mukai 格之间保持 Hodge 结构（即把 $H^{2,0}$ 对应起来）与二次型的等距；反过来，满足有效性条件的这类等距可由 FM 等价实现。因此两个 K3 曲面是否导出等价可以完全在格层面判定，格数据相同而几何不同构的情形正是 FM 伙伴的来源。", uses: ['mukai-equivariance-and-invariants'] },
    ],
    references: [
      { title: 'Duality between D(X) and D(X̂) with its application to Picard sheaves', author: 'Shigeru Mukai', year: 1981 },
      { title: 'Equivalences of derived categories and K3 surfaces', author: 'Dmitri Orlov', year: 1997 },
      { title: 'Fourier–Mukai Transforms in Algebraic Geometry', author: 'Daniel Huybrechts', year: 2006 },
    ],
    history: HISTORY,
  },

}
