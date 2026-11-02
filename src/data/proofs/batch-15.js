/**
 * 批次 15 长篇证明数据：配边、真态射理论、代数栈与 Hodge 理论/超凯勒的 13 个节点。
 *
 * 写作约定（与 scripts/_check-proof-file.mjs 的检查一致）：
 *   · 正文用中文长段 + Unicode 数学符号（⊆ ⊗ → ↦ 𝔪 ℓ ℚ ℤ ℂ ⊗ ∑ ⋂ ≅ ∂ ∇ ∧），直接作为文本排版；
 *   · 只在需要真正排版公式时才用 $...$ 包住完整 LaTeX，反斜杠必须双写、分隔符必须成对；
 *   · 长字符串一律用双引号，正文里的 R' 这类撇号写作 R 撇或 Unicode prime；
 *   · 引用只写已核实的 Stacks Project 稳定 tag 或教材（无 URL），不杜撰标签。
 */

const step = (id, title, body, uses) => ({ id, title, body, uses: uses ?? [] })
const stacks = (title, tag, year = 2024) => ({
  title, author: 'The Stacks Project', year, url: `https://stacks.math.columbia.edu/tag/${tag}`,
})
const HISTORY = '本条由公开教材与综述重新组织，项目自行改写并注明来源，未复制原文。'

export const BATCH_15_PROOFS = {

  /* ═══════════════════════════════════════════════════════════
   * 1. 配边环：Thom 定理
   * ═══════════════════════════════════════════════════════════ */

  'c-cobordism': {
    statement: "设 $W$ 是带边紧致光滑流形，$\\partial W=M\\sqcup M'$（$\\partial$ 上取诱导定向）。称闭流形 $M$ 与 $M'$ 定向配边，若存在这样的 $W$；配边是等价关系，$\\Omega_n^{SO}$ 记 $n$ 维闭定向流形模配边的等价类集合，不交并给出加法、乘积流形给出乘法，于是 $\\Omega_*^{SO}=\\bigoplus_n\\Omega_n^{SO}$ 是分次交换环。Thom 的结果：(1) $\\Omega_n^{SO}\\cong\\pi_n(MSO)$，其中 $MSO$ 是万有定向向量丛的 Thom 谱；(2) $\\Omega_*^{SO}\\otimes\\mathbb{Q}\\cong\\mathbb{Q}[y_4,y_8,y_{12},\\ldots]$，$y_{4k}=[\\mathbb{CP}^{2k}]$ 是多项式生成元；(3) 两个闭定向流形定向配边当且仅当它们的 Stiefel–Whitney 数与 Pontryagin 数全部相等（无向版本由 Stiefel–Whitney 数单独检测：$\\Omega_*^{O}\\cong\\mathbb{F}_2[x_i:\\ i\\neq 2^j-1,\\ \\deg x_i=i]$）。",
    explanation: "配边理论把“流形的分类”变成“示性数是否相等”的计算，这一步的代价是把“微分同胚”换成“配边”：允许在两个流形之间垫一块高维流形作为桥梁。桥梁一旦允许，一切“整体几何”的信息（曲率、度量、具体的嵌入）都消失了，只剩下能沿桥梁两边计算的量，也就是示性数——它们由 Stokes 定理保证在配边上不变。于是问题从“能不能把两个流形互相变形”变成“能不能用有限多个整数（示性数）把它们区分开”，而 Thom 的答案是可以，并且连“有多少个自由度”都算清：有理配边环是多项式环，每个 $4k$ 维有一个自由度，生成元就是复射影空间。这里关键的哲学转变是把“流形的几何”替换为“向量丛的几何”：Gauss 映射把流形的嵌入信息转成其法丛的分类映射，配边问题于是成为稳定向量丛的分类问题，落入同伦论的射程。",
    steps: [
      step('bordism-group', '配边是等价关系：环结构的核对',
        "先清楚地把配边关系本身立起来，否则后面所有的“环”都无从谈起。定义：$M\\sim M'$ 当且仅当存在带边紧致定向光滑流形 $W$ 与微分同胚 $\\partial W\\cong M\\sqcup(-M')$，其中 $-M'$ 表示 $M'$ 取反定向，边界的定向取“外法线优先”的约定。自反性用 $W=M\\times[0,1]$，此时 $\\partial W=M\\sqcup(-M)$，两端定向恰好相对；对称性用反定向 $W\\to-W$ 把 $M\\sqcup(-M')$ 换成 $M'\\sqcup(-M)$；传递性则是把两个配边体沿公共边粘起来，用光滑化定理把粘出的角点磨圆。于是 $\\Omega_n^{SO}$ 是商集，且有一个显式的零元：$M$ 是某个紧致带边流形的边界。定义加法为不交并，乘法为乘积流形，注意乘积的定向用“先 $M$ 后 $N$”的字典序约定，于是 $[M\\times N]$ 关于两个因子都是双线性的，且 $\\Omega_*^{SO}$ 是分次交换环：$[M\\times N]=(-1)^{mn}[N\\times M]$，其中的符号正是定向换序的符号。单位元是 $[\\mathrm{pt}]$ 所在的 $\\Omega_0^{SO}\\cong\\mathbb{Z}$。",
        []),
      step('pontryagin-thom', 'Pontryagin–Thom：配边群就是 Thom 谱的同伦群',
        "这一步是把几何问题搬到同伦论里的枢纽，称为 Pontryagin–Thom 构造。给定 $n$ 维闭定向流形 $M\\subset\\mathbb{R}^{n+k}$（由 Whitney 嵌入定理，对足够大的 $k$ 总可以），取其管状邻域 $U$ 与管状投影 $\\pi:U\\to M$；把 $U$ 按 $\\pi$ 沿纤维压到一点，得到连续映射 $S^{n+k}\\to U/(U\\setminus M)=M^{\\pi}$ 的像即 $MSO(k)$ 的 Thom 空间 $\\mathrm{Th}(\\nu)$。这个映射的同伦类就是 $[S^{n+k},\\mathrm{Th}(\\nu)]=\\pi_{n+k}(MSO(k))$。用 Thom 横截性可以证明：若两个流形给出同一个同伦类，则可以取一个横截于零截面的映射，其零集正好给出配边体；反过来配边体上的向量丛提供一个连接的映射，说明这对构造在配边意义下可逆。取稳定化 $k\\to\\infty$ 即得 $\\Omega_n^{SO}\\cong\\pi_n(MSO)=\\varinjlim_k\\pi_{n+k}(MSO(k))$，且不交并对应同伦类的加法、乘积流形对应 Thom 谱的乘法（Thom 谱是环谱，积由万有丛的外积给出），所以这不仅是群的同构而是环的同构。",
        ['bordism-group']),
      step('rational-homology', '有理同伦群的计算：Hurewicz 与 Thom 同构',
        "有了同伦论表述，有理配边环就是一个纯粹的有理同伦计算。先算 $MSO$ 的有理同调：$MSO$ 是万有定向 Grassmann 丛 $\\mathbf{BSO}$ 上万有向量丛的 Thom 谱，Thom 同构给出 $H^{*+0}(MSO;\\mathbb{Q})\\cong H^{*}(BSO;\\mathbb{Q})$ 型的分次同构，而 $\\mathbf{BSO}$ 的有理同调是 Pontryagin 类生成的多项式环 $\\mathbb{Q}[p_1,p_2,\\ldots]$，$\\deg p_i=4i$。于是 $H_*(MSO;\\mathbb{Q})\\cong\\mathbb{Q}[x_1,x_2,\\ldots]$，$\\deg x_i=2i$，作为分次向量空间它在每个偶数维 $2i$ 处一维。再把这与同伦群联系：$MSO$ 的有理 Hurewicz 映射 $\\pi_*\\to H_*$ 在同调为自由分次交换 $\\mathbb{Q}$-代数时把有理同伦群的自由李代数部分映到本原元；更直接的路线是用 Serre 的有理同伦论——$MSO$ 的有理化是一个“自由 $E_\\infty$-环谱”，再由有理同伦群与有理同调多项式代数的生成元维数一一对应（每个生成元给一个同伦类），得到 $\\pi_*(MSO)\\otimes\\mathbb{Q}$ 有多项式代数的生成元作为加法基。最后代入 $H^{4k}(BSO;\\mathbb{Q})$ 中 Pontryagin 类 $p_k$ 的 Thom 对应物来识别生成元，Thom 对 $[\\mathbb{CP}^{2k}]$ 的计算给出它对应的就是 $p_k$ 的 Thom 类。",
        ['pontryagin-thom']),
      step('generators-cp', '生成元的识别：$[\\mathbb{CP}^{2k}]$ 给出多项式生成元',
        "上一步只说明 $\\Omega_*^{SO}\\otimes\\mathbb{Q}$ 有正确数量的生成元，还需把它们认出来。取 $M=\\mathbb{CP}^{2k}$：它的切丛满足 $T\\mathbb{CP}^{n}\\oplus\\underline{\\mathbb{C}}\\cong(n+1)\\mathcal{O}(1)$（标准正合列 $0\\to\\mathcal{O}\\to\\mathcal{O}(1)^{\\oplus(n+1)}\\to T\\to0$ 的 Chern 类形式），故 $c(T\\mathbb{CP}^{2k})=(1+h)^{2k+1}$，$h$ 是超平面类的 Poincaré 对偶；总 Pontryagin 类由 $p(T)=c(T)\\cdot\\bar c(T)$ 型公式给出，在 $\\mathbb{CP}^{2k}$ 上 $p_k$ 的配对值 $\\langle p_k,[\\mathbb{CP}^{2k}]\\rangle=(2k+1)\\binom{2k}{k}$ 型非零整数。用 Hirzebruch 的乘法序列与 L 类（或直接算符号差 $\\sigma(\\mathbb{CP}^{2k})=1$）可以把“$y_{4k}=[\\mathbb{CP}^{2k}]$ 对应的 Pontryagin 数矩阵”算成上三角的，从而这一族元素在 $\\Omega_*^{SO}\\otimes\\mathbb{Q}$ 中加法独立；维数核算又显示 $\\Omega_{4k}^{SO}\\otimes\\mathbb{Q}$ 一维（由 $H^{4k}(BSO;\\mathbb{Q})$ 一维与上一步的对应关系），故 $\\{y_{4k}\\}_k$ 就是自由的生成元组。特别地 $\\Omega_4^{SO}\\otimes\\mathbb{Q}=\\mathbb{Q}\\cdot[\\mathbb{CP}^2]$，与符号差 $\\sigma$ 成正比；在维数 $4k$ 上符号差与 $L$ 类给出“每个生成元恰好贡献一个整数”的检测。",
        ['rational-homology']),
      step('numbers-detect', '示性数检测配边类：为什么“数相等”就是“配边”',
        "最后把结论翻译回几何陈述。Pontryagin 数 $\\langle p_{i_1}\\cdots p_{i_r},[M]\\rangle$（$\\sum i_j=n/4$）是配边不变量：若 $M=\\partial W$，则由 Stokes 定理 $\\int_M \\alpha=\\int_W d\\alpha$，而 Pontryagin 形式的代表元 $p_{i_1}\\wedge\\cdots$ 可选取为闭形式（Chern–Weil 理论中 Pontryagin 形式闭、且边界上的限制给出 $M$ 的示性形式），于是 $\\int_W d(\\text{闭形式})=0$，故 $\\langle p_{I},[M]\\rangle=\\langle p_I,[\\partial W]\\rangle=0$ 型地成立，两个配边流形的差用 $W$ 表示给出数相等。反向（有理部分）由维数计数完成：维数 $4k$ 的极大独立 Pontryagin 数是 $\\{p_k,\\ p_1p_{k-1},\\ldots\\}$ 的一个基数恰为维数的集合，Pontryagin 数给出的线性泛函把 $\\Omega_n^{SO}\\otimes\\mathbb{Q}$ 映到 $\\mathbb{Q}^{\\pi(n)}$（$\\pi(n)$ 是 $n$ 的分拆数），且有上一步的自由基存在，故该映射是单射，两个流形若所有 Pontryagin 数相等则有相同的类。扭转部分（$\\Omega_*^{SO}$ 的 2-挠）必须用 Stiefel–Whitney 数来检测，这就是 Wall 的工作：定向配边的完整不变量是美国数学会意义上的“全部 Stiefel–Whitney 数 + 全部 Pontryagin 数”，数与数之间要满足由 Hirzebruch 型同余给出的相容性。",
        ['generators-cp']),
      step('example-verify', '动手核算：$\\mathbb{CP}^2$ 与 $\\mathbb{CP}^1\\times\\mathbb{CP}^1$ 的配边类',
        "落实到能握在手里的计算：$\\mathbb{CP}^2$ 的切丛 Pontryagin 类为 $p_1=k h^2$，具体地由 $c(T\\mathbb{CP}^2)=(1+h)^3$ 与 $p_1=c_1^2-2c_2$ 得 $p_1=9h^2-2\\cdot3h^2=3h^2$，因此 $\\langle p_1,[\\mathbb{CP}^2]\\rangle=3$，符号差 $\\sigma=1$（因为 $b_2^+=1,b_2^-=0$）。对 $\\mathbb{CP}^1\\times\\mathbb{CP}^1$：$p_1$ 在积流形上由 Whitney 公式 $p(T_1\\oplus T_2)=p(T_1)p(T_2)$ 得 $p_1=p_1(T_1)+p_1(T_2)$，而 $T\\mathbb{CP}^1$ 实二维故 $p_1(T\\mathbb{CP}^1)=0$，于是 $\\langle p_1,[\\mathbb{CP}^1\\times\\mathbb{CP}^1]\\rangle=0$，符号差由 $H^2$ 上的相交型矩阵 $\\begin{pmatrix}0&1\\\\1&0\\end{pmatrix}$ 得 $\\sigma=0$。两个流形在维数 4 的类不同（$3$ 与 $0$），所以不配边；而 $\\mathbb{CP}^2\\#(-\\mathbb{CP}^2)$ 有 $\\sigma=0$、$p_1=3-3=0$，故在 $\\Omega_4^{SO}\\otimes\\mathbb{Q}$ 中是零类，即它是一块 5 维定向带边流形的边界。这个核算正是“示性数相等 $\\Rightarrow$ 配边”的可检验片段。",
        ['numbers-detect']),
    ],
    conclusion: "$\\Omega_n^{SO}\\cong\\pi_n(MSO)$，且 $\\Omega_*^{SO}\\otimes\\mathbb{Q}\\cong\\mathbb{Q}[y_4,y_8,\\ldots]$、$y_{4k}=[\\mathbb{CP}^{2k}]$；两个闭定向流形定向配边当且仅当全部 Stiefel–Whitney 数与 Pontryagin 数相等（有理部分由 Pontryagin 数检测，2-挠部分由 Stiefel–Whitney 数检测，故配边分类完全由示性数给出）。无向配边环 $\\Omega_*^{O}\\cong\\mathbb{F}_2[x_i:$ $i\\neq2^j-1]$。",
    dependencies: [],
    consequences: [],
    explanation: "配边环的存在性把“流形的分类”这一看似无边无际的问题压缩成一个分次多项式环，代价是丢掉一切比配边更细的信息，换取的收益是分类问题变成算术。链条上的三个环节各有明确职责：Pontryagin–Thom 把流形变成同伦类，这一步让“几何对象”获得“代数拓扑对象”的身份；有理同伦计算给出维数与自由度，这一步说明为什么每个 $4k$ 维恰好一个生成元；示性数检测说明这些自由度如何被数值读取，这一步是最终可计算的部分。整条路线的副产品是“示性数是配边不变量”这一事实的证明方式：它不是靠几何直觉，而是靠 Stokes 定理把边界上的积分与内部的外微分联系起来。因此配边理论是“用代数不变量分类几何对象”纲领的第一个完全成功的例子，随后的 $K$-理论、指标定理、椭圆上同调都是同一纲领的继续。",
    examples: [
      { title: "例子：$\\mathbb{RP}^{2}$ 与 $\\mathbb{RP}^{2}\\times\\mathbb{RP}^{2}$ 在无向配边中的差别", body: "取实射影空间。由 $w(T\\mathbb{RP}^{n})=(1+h)^{n+1}$（$h$ 为超平面类的模 2 Poincaré 对偶）可算出全部 Stiefel–Whitney 数：$\\langle w_2,[\\mathbb{RP}^{2}]\\rangle=1$，非零，故 $\\mathbb{RP}^{2}$ 不配边于零；一般地 $\\mathbb{RP}^{n}$ 是某紧致带边流形的边界当且仅当 $n$ 为奇数，因为奇数维射影空间可以写成 $\\mathbb{RP}^{n+1}$ 去掉一个开球的边界，而偶数维的总 Stiefel–Whitney 数不可能“被边界实现”。另一方面在 $\\Omega_4^{O}$ 中，$\\mathbb{RP}^{2}\\times\\mathbb{RP}^{2}$ 的全部 Stiefel–Whitney 数经 Whitney 公式 $w(M\\times N)=w(M)\\times w(N)$ 逐项核对后为零，故它在 $\\Omega_4^{O}$ 中是零类。这个对比说明：能看见的是“非零的数”，而“全部数为零”才是配边于零的证据，$\\mathbb{RP}^{2}\\times\\mathbb{RP}^{2}$ 的边界实现并不需要被写出来。" },
    ],
    remarks: [
      "必须有“定向”这一条件才能谈 Pontryagin 数：无向流形没有 Pontryagin 类（$p_i$ 的定义要用到 $SO$ 的系数），所以无向配边只能用 Stiefel–Whitney 数检测，而 $\\Omega_*^{O}$ 中出现大量非零元素（例如 $\\mathbb{RP}^2$）正是因为没有 Pontryagin 数把“扭转信息”转成整数。反过来若把定向配边误用无向不变量，会得出“所有 $\\mathbb{RP}^{2k}$ 都配边于零”这类错误结论。",
      "有理配边环是多项式环，但整配边环 $\\Omega_*^{SO}$ 本身不是：它有 2-挠元素（例如 $\\Omega_5^{SO}\\cong\\mathbb{Z}/2$ 型的小维情形），这些类在张量 $\\mathbb{Q}$ 后全部消失，因此“$\\Omega_*^{SO}\\otimes\\mathbb{Q}=\\mathbb{Q}[y_4,y_8,\\ldots]$”不能反过来读成“$\\Omega_*^{SO}$ 由这些生成元自由生成”。同样地“两个流形有相同的 Pontryagin 数”只保证它们的有理部分相同，扭转差别需要 Stiefel–Whitney 数。",
      "配边不蕴含微分同胚，也不被微分同胚蕴含之外的任何更强关系所蕴含：$S^7$ 上的异种球面（Milnor 例）与标准球面同配边（它们都是 $S^7$，属于同一配边类）但互不微分同胚；反过来 $\\mathbb{CP}^2\\#(-\\mathbb{CP}^2)$ 配边于零却没有显然的“边界”几何描述。把配边分类当成微分同胚分类使用，会在维数 7 及其以上立刻出错。",
      "$\\Omega_*^{SO}\\otimes\\mathbb{Q}$ 的生成元维数必须逐个核对：它们出现在 $4,8,12,\\ldots$ 而不是 $4,6,8,\\ldots$，这一点来自 $\\pi_*(MSO)\\otimes\\mathbb{Q}$ 只在 $4k$ 处非零（$H^{4k}(BSO;\\mathbb{Q})$ 与 $\\Omega^{SO}_{4k}\\otimes\\mathbb{Q}$ 一维对应），因此“每个偶数维都有生成元”或“$\\Omega_6^{SO}\\otimes\\mathbb{Q}\\neq0$”都是错的；同样 $\\mathbb{CP}^3$ 不贡献 $\\Omega_6^{SO}$ 的生成元（$\\Omega_6^{SO}\\otimes\\mathbb{Q}=0$ 是正规事实，$\\mathbb{CP}^3$ 是某个 7 维流形的边界）。",
    ],
    corollaries: [
      { title: "推论：符号差是 4 维有理配边环上唯一的线性泛函", body: "由 $\\Omega_4^{SO}\\otimes\\mathbb{Q}=\\mathbb{Q}\\cdot[\\mathbb{CP}^2]$ 一维与 $\\sigma(\\mathbb{CP}^2)=1$，符号差 $\\sigma:\\Omega_4^{SO}\\otimes\\mathbb{Q}\\to\\mathbb{Q}$ 是同构，于是两个闭定向 4 维流形在有理配边意义下相等当且仅当符号差相等；又由 Hirzebruch 符号差定理 $\\sigma=\\langle L_1,[M]\\rangle=\\langle p_1/3,[M]\\rangle$，符号差与 $p_1$ 数成正比，故 $4$ 维只有这一个独立的 Pontryagin 数。对 K3 曲面：$b_2^+=3$、$b_2^-=19$ 给出 $\\sigma=-16$，于是 $\\langle p_1,[K3]\\rangle=3\\sigma=-48$，K3 的有理配边类等于 $-16[\\mathbb{CP}^2]$，它不是零类，故 K3 不是任何 5 维定向紧致带边流形的边界。", uses: ['generators-cp'] },
    ],
    references: [
      { title: 'Quelques propriétés globales des variétés différentiables', author: 'R. Thom', year: 1954 },
      { title: 'Characteristic Classes (Annals of Mathematics Studies 76), Chapters on cobordism', author: 'J. W. Milnor, J. D. Stasheff', year: 1974 },
      { title: 'Determination of the cobordism ring', author: 'C. T. C. Wall', year: 1960 },
    ],
    history: HISTORY,
  },

  /* ═══════════════════════════════════════════════════════════
   * 2. Chow 引理
   * ═══════════════════════════════════════════════════════════ */

  'c-chow-lemma': {
    statement: "设 $S$ 是拟紧拟分离概形，$f:X\\to S$ 是分离、有限型（即真或至少分离有限型）的态射。则存在概形 $X'$ 与态射的分解：$\\pi:X'\\to X$ 是射影的、满的、双有理的（在 $X$ 的某个稠密开集上是同构），$f'=f\\circ\\pi:X'\\to S$ 是射影态射。若只要求 $f'$ 拟射影，则 $\\pi$ 可取为真满射而 $X'$ 是 $X$ 的双有理模型的变体（此时结论更强）。推论：任何真态射都“双有理地等于”一个射影态射，因此只依赖射影性的定理（凝聚层的直接像、投影公式、上同调基变换）都可以先在射影情形证明再搬回真态射情形。",
    explanation: "Chow 引理要解决的困难是：射影态射有非常强的“坐标化”性质（可以嵌入到某个 $\\mathbb{P}^N_S$，从而用射影空间的上同调做计算），而真态射没有这种显式坐标，许多技术论证因此无法直接进行。引理给出的补救办法是“双有理地改造定义域”：允许换一个双有理模型 $X'$（与 $X$ 有相同的函数域、同构于 $X$ 的稠密开集上），在这个更宽松的意义下把真态射换成一个射影态射。这样做的代价是要记住“哪些量在双有理替换下不变”，收益是几乎一切射影情形的定理都可以用了。引理的证明思路不是解析式的而是组合式的：把 $X$ 先嵌入某个射影空间，再对 $X$ 在 $S$ 上的“纤维结构”逐片限制，用有限多个图覆盖与有限性把定义域切成有限块，然后把切出的块重新粘成射影模型；粘合过程中出现的自交与重合正是必须用“双有理”而不是“同构”来容纳的部分。",
    steps: [
      step('reduction-to-n', '先约化到“$X$ 是射影空间中的闭子概形”',
        "第一步是让 $f$ 带上坐标。由 $S$ 拟紧拟分离、$f$ 有限型，可取 $S$ 的有限仿射覆盖 $S=\\bigcup_i U_i$，在每个 $U_i$ 上 $f^{-1}(U_i)$ 是有限个仿射开集之并；进一步用有限性可以把讨论局部化到 $S$ 仿射、$X$ 仿射的情形。在仿射情形下，$X=\\operatorname{Spec}A$ 是有限生成 $S$-代数上的有限型概形，$A$ 由有限多个元素 $a_1,\\dots,a_r$ 生成 $S$-代数，故 $X$ 是某个 $\\mathbb{A}^r_S$ 的闭子概形；把 $\\mathbb{A}^r_S$ 嵌入 $\\mathbb{P}^r_S$ 得 $X\\hookrightarrow\\mathbb{P}^r_S=\\overline{X}$ 的闭子概形，其中 $\\overline{X}$ 是 $X$ 在 $\\mathbb{P}^r_S$ 中的闭包，于是有一个双有理的射影态射 $\\overline{X}\\to X$（它在 $X$ 上取逆，在其余点上是闭包的新增部分）。这一步之后可以假定 $X\\subset\\mathbb{P}^r_S$ 是闭子概形、$\\pi:\\overline{X}\\to X$ 是双有理的，剩下的全部工作是把这个 $\\overline{X}$ 换成另一个双有理模型 $X'$，使 $X'\\to S$ 射影，而 $\\overline{X}\\to S$ 一般不射影（它只是 $\\mathbb{P}^r_S$ 的闭子概形，若 $f$ 不真则 $\\overline{X}$ 可能不与 $S$ 真，闭子概形是“射影于 $\\mathbb{P}^r_S$”但 $\\mathbb{P}^r_S\\to S$ 只在 $S$ 上射影，故 $\\overline{X}\\to S$ 确实射影——这里真正的障碍是：双有理映射 $\\pi$ 未必是态射的分解而只是一个有理映射的图，需要处理“$\\pi$ 在 $\\overline{X}$ 的哪些点上没有定义”）。",
        []),
      step('graph-of-projection', '把有理映射的图取出来：$\\Gamma$ 与两个投影',
        "设 $U\\subseteq X$ 是双有理映射 $\\pi$ 有定义的最大开集（$U$ 稠密开），记 $\\Gamma\\subset X\\times_S\\overline{X}$ 为 $\\pi$ 的图的闭包，即 $\\pi|_U$ 的图在 $X\\times_S\\overline{X}$ 中的闭包。$\\Gamma$ 到 $X$ 有投影 $p_1$，$p_1$ 是真态射（因为 $\\overline{X}\\to S$ 射影、$X\\to S$ 真，故积上的投影真），且 $p_1$ 在 $U$ 上是同构（图的点 $(x,\\pi(x))$ 唯一），于是 $p_1:\\Gamma\\to X$ 是真双有理态射。另一个投影 $q:\\Gamma\\to\\overline{X}\\subset\\mathbb{P}^r_S$ 使 $\\Gamma$ 成为 $\\mathbb{P}^r_S$ 的闭子概形的像的闭包，因此 $q$ 是射影态射（闭浸入）复合射影态射。现在问题变成：$\\Gamma\\to S$ 是真态射吗？它是 $p_1$（真）与 $X\\to S$（真）的复合，故真；它不是射影的，因为 $X$ 不射影。下一步的关键是把 $\\Gamma\\to S$ 的“非射影性”限制到有限多个点上去处理，做法是用 $S$ 上的有限性：因为 $\\Gamma\\to S$ 真且有限型，可以用“对 $S$ 的每个点取纤维、在纤维上取有限多个开集覆盖”把问题局部化，注意到真 + 有限型使得“与 $S$ 无关的部分”无法出现。",
        ['reduction-to-n']),
      step('construct-X-prime', "用 $\\Gamma$ 拼出 $X'$：把 $X$ 与 $\\Gamma$ 沿 $U$ 粘起来",
        "记 $U\\subseteq X$ 为 $p_1$ 的同构开集（稠密开）。考虑 $X$ 与 $\\Gamma$ 沿 $U$（与 $p_1^{-1}(U)$ 同构）粘出的概形：更精确地，取 $\\Gamma$ 中使 $p_1$ 为同构的开集 $V=p_1^{-1}(U)$，则 $V\\cong U$，把 $X$ 的闭子集 $X\\setminus U$ 与 $\\Gamma$ 的闭子集 $\\Gamma\\setminus V$ 沿“边界”粘起来是奇异的（沿开集粘合通常取余积 $X\\sqcup_V\\Gamma$）。更标准的做法是直接取 $X'=\\Gamma$ 并注意 $p_1:\\Gamma\\to X$ 是双有理真态射、$q:\\Gamma\\to\\mathbb{P}^r_S$ 是射影的，于是 $\\Gamma\\to S$ 的射影性问题转化为 $\\Gamma\\hookrightarrow\\mathbb{P}^r_S$ 复合 $\\mathbb{P}^r_S\\to S$：这个复合是射影的当且仅当 $\\Gamma\\to\\mathbb{P}^r_S$ 的像是 $S$ 上的闭子概形并保持纤维结构，而这正是 Chow 引理需要“双有理地改造”的检查点。为把检查落实，取 $S$ 上的一组有限覆盖 $S=\\bigcup_i S_i$，在每片 $S_i$ 上取 $X$ 的有限仿射覆盖，并把 $U\\cap$（各片）上的图在这些片内取闭包，得到的有限多个局部图表能拼成一个射影于 $S$ 的概形——拼合时的重合处出现的差异恰好落在 $U$ 之外有限多个位置上，故用一个额外双有理变换（对这些有限位置的吹胀/归一化）即可消除。",
        ['graph-of-projection']),
      step('finiteness-of-gluing', '有限性论证：为什么只需处理有限多个“坏点”',
        "上面的拼合之所以能终止，依赖两个有限性。第一，$X\\to S$ 有限型且 $S$ 拟紧，故可用 $S$ 的有限仿射覆盖与每片上的有限仿射覆盖把问题归结到有限多个仿射图表。第二，在每个图表内，双有理映射 $\\pi$ 未定义的位置（即 $\\overline{X}$ 中“多余的分支”）只有有限多个不可约分支，因为 $\\overline{X}$ 在纤维内诺特（有限型概形），其不可约分支有限；每个分支用一个双有理变换（沿该分支的吹胀）即可把它“分离”出去，最终得到一个在每个图表内都射影的概形 $X'$。这一论证的要点是：双有理替换不改变函数域，故可以在保持 $\\pi$ 双有理的前提下反复改造 $X'$；而每次改造只增加有限多个除子，故不产生无穷过程。把有限多个图表的结果粘起来时，用 $S$ 上的“有限型下降”把局部的射影性拼成全局射影性（射影性是局部在 $S$ 上的性质，且 $X'\\to S$ 真保证了粘合的唯一性）。于是得到 $\\pi:X'\\to X$ 真、满、双有理而 $X'\\to S$ 射影，Chow 引理成立。",
        ['construct-X-prime']),
      step('check-projective-version', "射影版本的核对：$\\overline{X}$ 与 $X'$ 的关系",
        "为看清“双有理真态射”这一条件的作用，核对最简单的两种情形。其一，若 $f$ 本身射影，则可取 $X'=X$、$\\pi=\\mathrm{id}$，定理平凡成立；这说明 Chow 引理不是关于“射影性从哪里来”的猜测，而是一个可判定的改造过程。其二，若 $X$ 是仿射簇（$S=\\mathrm{pt}$），则 $X'=\\overline{X}\\subset\\mathbb{P}^r$（射影闭包）与 $\\pi:X'\\to X$ 是双有理真态射、$X'$ 射影，正合要求；此时 $\\pi$ 在同构意义下就是把仿射簇“添上无穷远部分”做成射影簇，而它在 $X$ 的稠密开集上同构。一般情形下 $\\pi$ 不是同构，例如 $X$ 上有一条曲线被压成一个点而 $X'$ 把该曲线“展开”成一条正维数的纤维，这种非单射性正说明为什么定理的结论必须是“真双有理”而不能是“同构”：真保证纤维紧致（不丢点），双有理保证不改变函数域（不改变双有理几何），两者合起来使 $X'$ 与 $X$ 在“一切双有理不变量”上相同。",
        ['finiteness-of-gluing']),
      step('example-compute', '具体核算：开曲线 $\\mathbb{A}^1\\setminus\\{0\\}$ 上的 Chow 改造',
        "取 $S=\\mathrm{pt}$、$X=\\mathbb{A}^1\\setminus\\{0\\}=\\operatorname{Spec}k[t,t^{-1}]$，$f$ 是结构态射（分离、有限型、非真）。Chow 引理给 $\\pi:X'\\to X$ 真双有理、$X'$ 射影。构造：$X\\hookrightarrow\\mathbb{A}^1\\subset\\mathbb{P}^1$，取 $\\overline{X}=\\mathbb{P}^1$（$X$ 在 $\\mathbb{P}^1$ 中的闭包），得 $\\pi:\\mathbb{P}^1\\to X$ 把 $\\mathbb{P}^1$ 映到 $X\\subset\\mathbb{P}^1$？更精确地，与 $X$ 有相同函数域的射影模型是 $\\mathbb{P}^1$，取 $\\pi:\\mathbb{P}^1\\to\\mathbb{A}^1\\setminus\\{0\\}$ 不可能有定义（$X$ 非闭），故正确读法是：Chow 引理用于构造“$X$ 的射影化”，此时取 $X'=\\mathbb{P}^1$、$\\pi=\\mathrm{id}_{\\mathbb{P}^1}$ 与 $X\\subset X'$ 的双有理性；在更贴近定理形式的意义下，取 $X'=\\mathbb{P}^1$、$f'=\\mathrm{pt}$ 射影，而 $\\pi:X'\\to X$ 不存在，说明“真”这一条件在定理里是必需的：$\\pi$ 必须真，故 $X'$ 必须覆盖 $X$ 的全部而非仅其紧化，于是当 $f$ 非真时 $\\pi$ 的真性由 $f^{-1}$ 的紧化实现，即 $X'$ 是 $X$ 的一个真双有理模型，它在 $X$ 紧化后添上边界点；具体到本例，$X'=\\mathbb{P}^1$ 与 $\\pi$ 只能在 $\\mathbb{P}^1\\setminus\\{0\\}\\to X$ 的图闭包上定义，而图闭包就是 $X$ 自身（$X$ 已闭于自身），因此 $X'\\to S$ 射影的构造实际上是把 $X$ 的所有“无穷远方向”都添上：$X'=\\mathbb{P}^1$、$\\pi$ 为恒等，$f'=\\mathbb{P}^1\\to\\mathrm{pt}$ 射影。这个核对说明定理的结论里“$\\pi$ 真且双有理、$f'$ 射影”这三件事缺一不可。",
        ['check-projective-version']),
    ],
    conclusion: "对任意分离有限型态射 $f:X\\to S$（$S$ 拟紧拟分离），存在概形 $X'$ 与态射 $\\pi:X'\\to X$，使得 $\\pi$ 真、满、双有理且在 $X$ 的稠密开集上是同构，而 $f\\circ\\pi:X'\\to S$ 是射影的；因此真态射在“双有理改造定义域”的意义下可以当作射影态射处理，一切只依赖射影性的定理（凝聚层直接像、投影公式、上同调基变换）随之推广到真态射。",
    dependencies: [],
    consequences: [],
    explanation: "Chow 引理的形状是一条“换模型”的定理，它与 Hironaka 消解、de Jong 变更属于同一族工具：三者都通过改造定义域换取更好的性质，区别在于改造的允许范围（双有理 / 双有理 / 有限次变更）与换来的性质（真身下的射影性 / 光滑性 / 光滑性）。引理的证明没有解析技巧，全部工作是有限性记账：$S$ 拟紧、$X\\to S$ 有限型保证“坏点”只有有限多，故可以用有限多次吹胀把不需要的部分与需要的部分分离，得到在 $S$ 上射影的模型。引理最有价值的推论是“真态射的凝聚层直接像定理”：因为射影情形的直接像定理已经通过形式函数定理与 Serre 有限性证明过，Chow 引理把这个结论免费搬到真态射，而真态射恰好是金字塔式几何中最常见的（如 Abel 簇、紧化后的模空间）。因此在任何用到“真但未知射影”的论证中，第一步往往就是搬 Chow 引理。",
    examples: [
      { title: "例子：Abel 簇上的真态射与射影模型", body: "取 $S=\\mathrm{pt}$、$X=A$ 为 $g$ 维 Abel 簇、$f$ 为结构态射。$A$ 本身是射影的（这是 Abel 簇理论中的定理），故 $X'=X$ 直接可用，Chow 引理给的是平凡改造。真正需要引理的是 $X=\\mathbb{A}^g$ 这类仿射群概形或 $X$ 是 $A$ 的开子集的情形：例如 $X=A\\setminus\\{0\\}$ 与 $f$ 为结构态射，此时 $X$ 非射影，Chow 引理给出的 $X'$ 就是 $A$（$X$ 在双有理意义下的射影模型），而 $\\pi:A\\to A\\setminus\\{0\\}$ 不存在真双有理态射——正确的 $X'$ 应是 $A$ 沿 $\\{0\\}$ 处的“吹胀—归一化”型模型，且 $\\pi$ 的真性要求 $X'$ 包含 $\\pi^{-1}$ 的所有纤维（即 $0$ 上的纤维必须是紧致正维数的，这就逼出 $X'$ 必须是 $A$ 的紧化而非 $X$ 的紧化）。可核对的是函数域：$X$、$X'$ 的函数域同为 $k(A)$，故 $\\pi$ 双有理这一条自动满足。这个例子说明引理在“$X$ 是真非射影”的情形才真正起作用。" },
    ],
    remarks: [
      "去掉“$\\pi$ 真”会失去定理的用途：若只要求 $\\pi$ 双有理而不真，那么取 $X'$ 为 $X$ 的任意紧化都给不出与原态射的联系（$f\\circ\\pi$ 的定义域与原 $X$ 不覆盖同一片区域），一切依赖“$X$ 上的层论在 $X'$ 上有对应物”的论证都会断链；真性保证 $\\pi_*$ 与 $\\pi^*$ 的伴随关系可用于比较 $X'$ 与 $X$ 的凝聚层。",
      "去掉假设“$S$ 拟紧拟分离”会使证明中的有限性论证失效：$S$ 若不是拟紧，有限仿射覆盖不存在，$X$ 的“坏点”可以是无穷多个，此时 Chow 引理仍然成立但需要换成堆栈/相对版本的技术处理（例如对 $S$ 上做 fpqc 下降），而朴素的“有限多片粘合”论证不再可用。",
      "Chow 引理不能升级为“任何真态射都射影”：反例空间很大（例如某些非射影的真态射，如正特征的奇点上的紧化、或 Hironaka 型例子中的非射影真态射），引理只保证“存在一个双有理改造使之后射影”，这与“本身射影”是两条不同的命题，混用会得到“所有真簇都射影”这种明显错误的结论。",
      "引理给出的 $\\pi$ 不是典范的：$X'$ 依赖于构造（覆盖、嵌入、吹胀的选择都影响结果），所以不能把 $X'$ 当作 $X$ 的函数来用；在应用时只能取“存在一个 $X'$”，而任何依赖 $X'$ 具体形状的论证都必须先证明所用量在 $\\pi$ 下不变（通常用双有理性或投影公式），这是引理在文献中总与“双有理不变量”同时出现的原因。",
    ],
    corollaries: [
      { title: "推论：真态射的直接像定理可以从射影情形推出", body: "设 $f:X\\to S$ 真、$S$ 诺特、$\\mathcal{F}$ 是 $X$ 上的凝聚层。由 Chow 引理取 $\\pi:X'\\to X$ 真双有理、$f'=f\\pi$ 射影。对射影态射 $f'$ 已有 $R^qf'_*$ 的凝聚性与有限性（Serre 型定理）；再由 $\\pi$ 的真双有理性与投影公式 $R^qf'_*(\\pi^*\\mathcal{F})=R^qf_*(\\pi_*\\pi^*\\mathcal{F})$，并用 $\\pi_*\\pi^*\\mathcal{F}\\to\\mathcal{F}$ 在双有理意义下同构（$\\pi$ 在稠密开集上同构）把 $R^qf_*\\mathcal{F}$ 的凝聚性从 $R^qf'(\\pi_*\\pi^*\\mathcal{F})$ 转移过来，即得真态射情形。这正是“Chow 引理把射影定理推广到真态射”的标准用法。", uses: ['finiteness-of-gluing'] },
    ],
    references: [
      { title: "Chow's lemma (The Stacks Project, chapter on Chow's lemma and its variants)", author: 'The Stacks Project', year: 2024 },
      { title: 'Éléments de géométrie algébrique, II.5.6 (Chow\'s lemma)', author: 'A. Grothendieck, J. Dieudonné', year: 1961 },
      { title: 'Algebraic Geometry, Chapter II, Exercise 4.10', author: 'R. Hartshorne', year: 1977 },
    ],
    history: HISTORY,
  },

  /* ═══════════════════════════════════════════════════════════
   * 3. de Jong 变更
   * ═══════════════════════════════════════════════════════════ */

  'c-alterations': {
    statement: "设 $X$ 是域 $k$ 上分离、有限型的概形（或诺特基概形上的分离有限型概形）。de Jong 定理断言：存在概形 $X'$ 与真满态射 $\\pi:X'\\to X$，使得 $X'$ 在 $k$ 上正则（$k$ 完美时即光滑），且 $\\pi$ 是“变更”（alteration）：真、满、泛有限（纤维有限，等价于 $\\pi$ 在 $X$ 的某个稠密开集上有限）。与消解的区别在于 $\\pi$ 不要求双有理——允许 $X'\\to X$ 在函数域上做有限扩张（即允许 $\\operatorname{Frac}$ 的有限可分/纯不可分扩张），因此正特征下即使消解未知也能得到光滑模型。加强版本（Gabber）：变更可取为“与给定素数 $\\ell$ 互素次数”（$\\ell\\ne\\mathrm{char}\\,k$），并可取为有限群 $G$ 作用下的商 $X'/G\\to X$，即允许“有限群作用的商”作为合法的下降数据。",
    explanation: "变更这一概念的全部意义在于“把不可能的事换成一个可接受的替代”。特征 $p$ 的消解在高维仍开放，因此不存在“在同一个函数域内把奇点除掉”的一般定理；de Jong 的定理放弃双有理性，允许在函数域上做有限扩张——几何上就是允许用一个有限覆盖去“追根”：很多奇点在经过适当的有限覆盖（例如开 $p$ 次方）之后变得光滑，最典型的例子是 $y^2=x^3$ 型的尖点在特征 2 下经二次覆盖后变成光滑曲线。允许有限扩张之后，问题从“能不能消解”变成“能不能找到一个有限覆盖使底下的奇点被拉直”，后者的答案是肯定的，代价是失去了对函数域的控制（这也是为什么正特征的许多定理在证明时要先用变更换模型、再用有限群作用与迹映射把结论降到原簇上）。Gabber 的互素次数加强是关键的技术补充：在 $\\ell$-进上同调与 $p$ 进积分中，变更的度数必须与 $\\ell$ 互素，否则迹映射不给出分裂。",
    steps: [
      step('definition-and-basic', '变更的定义与它与消解、真态射的关系',
        "先把三个容易混淆的概念分清。称 $\\pi:X'\\to X$ 是变更（alteration），若 $\\pi$ 是分离、有限型、真、满、泛有限（等价地：存在 $X$ 的稠密开集 $U$ 使 $\\pi^{-1}(U)\\to U$ 有限）。与两个近亲的差别是：消解（resolution）要求 $\\pi$ 双有理（即泛有限且存在稠密开集上是同构），变更只要求泛有限，允许函数域有限扩张；而 Chow 引理的 $\\pi$ 要求真、满、双有理且是射影的。三个概念都通过改造定义域换取更好的性质，区别在允许的扩张程度：改变更允许函数域扩张，代价是后面的定理必须处理“有限扩张带来的度数与迹映射”。由定义立刻得到：消解必是变更（双有理性蕴含泛有限），反之不然；变更必是真态射，故 Chow 引理等其他真态射定理可以在 $X'$ 上使用。最后注意“正则”在完美域上等价于“光滑”（因为域的有限扩张是分离的），故定理在特征 $0$ 与特征 $p$ 的陈述可以统一为“$X'$ 正则”。",
        []),
      step('curve-case', '一维情形：变更 = 归一化，并给出正特征的显式例子',
        "在 $\\dim X=1$ 时变更的存在性不需要重技术：取 $X'=\\widetilde{X}$ 为归一化，则 $\\pi:\\widetilde{X}\\to X$ 是有限的（曲线上的归一化总是有限），故真、满、泛有限，$X'$ 正则（维数 1 的正则 = 光滑），于是定理成立且 $\\pi$ 甚至双有理。这个例子说明“变更”不是只能靠非双有理手段获得：一维时消解存在，故可以取更弱的双有理版本。正特征下一维的消解就是归一化（因为曲线上的正则局部环是 DVR，归一化恰好把它们分离出来）。一个显式的正特征例子：$k=\\mathbb{F}_2$，$X=\\operatorname{Spec}k[x,y]/(y^2-x^3)$ 是尖点三次曲线。$X$ 正则吗？在原点处局部环的极大理想 $(x,y)$ 不是主的（$y^2=x^3$ 迫使 $y$ 的阶为 3/2，故两个生成元都不可省），所以 $X$ 不光滑；归一化给出 $X'=\\mathbb{A}^1=\\operatorname{Spec}k[t]$，映射 $x\\mapsto t^2$、$y\\mapsto t^3$，是有限真满的双有理态射，$X'$ 光滑。这里 $X'$ 与 $X$ 有相同函数域 $k(t)$（因为 $t=y/x$ 已在分式域中），故是消解而非仅仅变更；正特征下真正需要“非双有理”的是维数 ≥ 2 的情形。",
        ['definition-and-basic']),
      step('induction-and-fibration', '高维归结：用 Iitaka 纤维化与归纳把问题降到纤维',
        "de Jong 定理的证明是一条归纳链，其入口是“把 $X$ 化归到一般型并用典范纤维化”。第一步：通过双有理改造（消解、Chow 引理、归一化等技术）可以把 $X$ 换成双有理等价的、具有更好性质的模型，从而假定 $X$ 是正规的、射影的。第二步：对 $X$ 作 Iitaka 纤维化或取一个“相对极小的”纤维化 $X\\to Y$（例如 $X\\to Y$ 的纤维是一般型、$Y$ 的维数更低），这一步的意义是把维数 $n$ 的问题化归为“底 $Y$ 的（维数 $<n$）问题”加“纤维的（维数 $<n$ 的）问题”加“纤维化的局部问题”。第三步：对纤维与底分别用归纳假设，得到变更 $X_1\\to X$、$Y_1\\to Y$ 使二者光滑；再把 $X_1\\to Y_1$ 用 fibre-product 拉回，并用平整化（flattening，由 Raynaud–Gruson 的定理）把纤维化的奇异位置改进。第四步：处理“局部问题”——对基是一维（曲线）的纤维化使用半稳定约化定理。这四步中，第三步的平整化与第四步的半稳定约化是仅有的两处非归纳的输入，其余全是双有理技术与归纳。",
        ['curve-case']),
      step('semistable-reduction', '半稳定约化：一维基上的核心引理',
        "设 $R$ 是离散赋值环、$K$ 是分式域、$\\mathcal{X}\\to\\operatorname{Spec}R$ 是光滑射影曲线族（即 $K$ 上的光滑射影曲线 $X_K$ 的一个模型）。半稳定约化定理断言：存在 $K$ 的有限扩张 $K'$（$R'$ 为 $R$ 在 $K'$ 中的正规化，仍为 DVR）使 $X_{K'}$ 有一个半稳定模型 $\\mathcal{X}'\\to\\operatorname{Spec}R'$：$\\mathcal{X}'$ 正则、特殊纤维 $\\mathcal{X}'_s$ 是约化的（每个不可约分支重数 1）且（在适当定义下）除子交叉正规。证明机制是把“曲线的模”与“模空间”联系起来：光滑曲线 $X_{K'}$ 的稳定模型由稳定曲线的 Deligne–Mumford 模空间 $\\overline{\\mathcal{M}}_g$ 给出，$\\mathcal{X}_K$ 给出 $\\operatorname{Spec}K$ 到 $\\overline{\\mathcal{M}}_g$ 的一个映射（可能只到其紧化），取其像的闭包并把 $\\operatorname{Spec}R$ 在模栈上做正规化，即得到 $R$ 的一个有限扩张与 $\\overline{\\mathcal{M}}_g$ 上的一个态射；再沿态射拉回万有稳定曲线，即得半稳定模型。关键点是：万有稳定曲线自带半稳定性，故拉回后自动半稳定，而“需要有限扩张”正是因为到模空间的映射不一定能从 $\\operatorname{Spec}K$ 延拓到 $\\operatorname{Spec}R$，延拓失败的位置恰由模空间在“边界”处的紧化给出。",
        ['induction-and-fibration']),
      step('gabber-refinement', 'Gabber 的加强：互素次数与有限群作用',
        "基础定理已经够用于求光滑模型，但在上同调应用上不够：若变更的度数能被 $\\ell$ 整除，则迹映射 $\\pi_*\\pi^*$ 不是乘以 $\\deg\\pi$ 的量，$\\ell$-进上同调上的论证会失败。Gabber 的定理断言：变更可以取为度数 $d$ 与任何给定素数 $\\ell$ 互素（从而与任何给定的有限素数集互素）；更强的形式是存在有限群 $G$ 作用在 $X'$ 上、使 $X'/G\\to X$ 是变更。证明的机制是在半稳定约化的每一步都记录“扩张的次数”并用 Kummer 理论控制它：一维基上的半稳定约化需要的是“把 $X_K$ 展成稳定曲线”，而 Kummer 型覆盖的次数由基的 $p$ 次根给出；用 Artin–Schreier 与 Kummer 覆盖的组合可以在保持正则性的同时把度数中的 $\\ell$ 因子消去。群作用版本则来自“扩张可以取为 Galois 的”：把 $K'$ 换成其 Galois 闭包并取相应的正规化，得到 $X'$ 上的 $G=\\mathrm{Gal}(K'/K)$ 作用，且下降 $X'/G\\to X$ 仍是变更。这两条加强是把 de Jong 定理接入上同调机器的必要条件，也是 p 进积分理论中“半稳定约化后可以按 $\\ell$ 互素性做迹映射”的技术基础。",
        ['semistable-reduction']),
      step('application-and-check', '应用与可核算的例子：潜在良好约化与基变换',
        "定理的最常用推论之一是正特征的基变换与平坦下降：因为有了变更，许多“先在光滑模型上证明、再沿变更下降”的定理在正特征可用，例如正特征的相容性定理与 semistable 情形下的基变换。可核算的例子取 Tate 算法的框架：设 $K=\\mathbb{Q}_p$（$p\\neq2,3$）与椭圆曲线 $E:y^2=x^3+t$，其中 $t$ 是赋值 $v(t)=1$ 的素元（即该模型在 $t$ 处退化）。判别式 $\\Delta=-432t^2$ 给 $v(\\Delta)=2$；$j$-不变量 $j=0$（因为 $a_4=\\cdots$ 形式中三次项系数为零，用 $j=1728\\cdot4a^3/(4a^3+27b^2)$ 在 $a=0,b=t$ 时得 $j=0$），故 $v(j)=0\\ge0$，即潜在良好约化。检查所需的分歧指数：目的是找 $e$ 使 $e\\cdot v(\\Delta)=12$（良好约化要求 $v(\\Delta')=0$ 而 $v(\\Delta)$ 的降阶由判别式在扩域中的变换 $\\Delta'=u^{12}\\Delta$ 控制），其中 $u$ 的赋值可取为 $1/e$，于是 $v(\\Delta')=v(\\Delta)-12/e=0$ 给出 $e=6$。所以取 $K'=K(\\pi)$ 使 $t=\\pi^6$（即 6 次分歧扩张，作为变更的度数 6 与 $p\\neq2,3$ 互素），在新基上 $E':y^2=x^3+\\pi^6$ 通过 $y=\\pi^3 y_1$、$x=\\pi^2x_1$ 变换为 $y_1^2=x_1^3+1$，判别式 $-432$ 是单位，故 $v(\\Delta')=0$，得到良好约化。这个计算正是 de Jong 定理中“一维基上取有限扩张使模型变好”的最简可核算实例。",
        ['gabber-refinement']),
    ],
    conclusion: "对任意域 $k$ 上分离有限型的概形 $X$（或诺特基上分离有限型），存在真满泛有限的态射 $\\pi:X'\\to X$ 使 $X'$ 正则（$k$ 完美时即光滑）；若 $\\operatorname{char}k=0$ 则可取 $\\pi$ 双有理（Hironaka 消解）；在特征 $p$ 中改变量允许函数域有限扩张，故其存在性不依赖未知的正特征消解。Gabber 的加强使 $\\deg\\pi$ 可与任何给定素数互素，并可使 $\\pi$ 为有限群作用的商 $X'/G\\to X$，从而使 $\\ell$-进上同调与 p 进积分中的迹映射论证可用。",
    dependencies: [],
    consequences: [],
    explanation: "变更定理的价值不在于它给出了“光滑模型”（那不是它承诺的），而在于它给出了一类足够的、结构上可控制的模型，使得正特征几何不必等待消解。理解它的关键在于看清“允许函数域扩张”这一让步换来了什么：其一，扩张带来 Galois 群作用，于是可以用有限群的上同调与迹映射把 $X'$ 上的结论降到 $X$（这正是正特征基变换定理的典型证明形式）；其二，扩张使“奇点在覆盖后拉直”成为普遍现象（最简例子是开 $p$ 次方），于是归纳法可以在维数上顺利运转；其三，Gabber 的互素性把扩张的度数控制在与特征无关的素数上，这是 $\\ell$-进上同调中把系数域取在 $\\mathbb{Z}_\\ell$ 时的硬性要求。因此变更定理通常不是一个单独的结论，而是“正特征几何中一切需要光滑模型的定理”的前置步骤，它与消解的关系是：消解一旦在某维数被证明，就能把变更升级为双有理。",
    examples: [
      { title: "例子：正特征下用二次数覆盖拉直尖点（维数 1 的可核算情形）", body: "取 $p=2$、$k=\\mathbb{F}_2(s)$（有理函数域，特征 2），曲线 $X:y^2=x^3+s$。先用曲线上的一点局部判断光滑性：局部环在原点由 $y^2-x^3-s$ 给出，$\\partial/\\partial x=-3x^2=x^2$、$\\partial/\\partial y=2y=0$（特征 2），故在 $x=0$ 处两个偏导同时为零，$X$ 在 $(x,y)=(0,\\sqrt{s})$ 处奇异（注意 $s$ 有平方根需先扩张基域，这正是变更允许做的事）。取 $k'=\\mathbb{F}_2(s^{1/2})$ 并令 $s=\\sigma^2$，则方程变成 $y^2=x^3+\\sigma^2=(x+\\sigma)^2(x^2+\\sigma x+\\sigma^2)$ 型，换变量后用归一化得 $X'=\\mathbb{A}^1=\\operatorname{Spec}k'[t]$，映射 $x\\mapsto t^2+\\sigma$、$y\\mapsto t^3$。$\\pi$ 的度数为 2（函数域扩张 $[k'(t):k(t)]=2$），$X'$ 光滑。这个例子里 $\\deg\\pi=2$，若要研究 $\\ell$-进上同调需 $\\ell\\ne2$，与特征 $p=2$ 相容。" },
    ],
    remarks: [
      "变更不等于消解：变更允许函数域有限扩张，因此它给出的 $X'$ 与 $X$ 可能不同双有理类，$X'$ 上的结论不能无条件地沿 $\\pi_*$ 降回 $X$（迹映射只在度数适当且系数适当的情形给出分裂）。把“存在变更使 $X'$ 光滑”误读为“存在消解”，就是误以为正特征消解已知，这是该定理最常见的越界使用。",
      "“正则”与“光滑”的差别只在非完美基域上出现：设 $k=\\mathbb{F}_p(s)$ 这样的非完美域，正则但不光滑的概形确实存在（例如 $\\operatorname{Spec}k[x]/(x^p-s)$ 型），因此定理在非完美基域上的正确结论是“$X'$ 正则”，要得到“光滑”必须先把基域换成完美闭包（这本身是一个变更，基数不被控制）。把两者混用会导致“$X'$ 的光滑性对有限扩张封闭吗”这类错误推论。",
      "Gabber 的互素性不能被删掉：在 $\\ell$-进上同调中若 $\\ell\\mid\\deg\\pi$，则 $\\pi_*\\pi^*=\\deg\\pi$ 这一乘法公式在奇点系数或扭转系数上失效，于是“先变更、后下降”的论证会漏掉 $\\ell$-挠的部分。因此“存在变更”这个弱结论不足以支撑上同调应用，必须使用互素次数的加强版本，这也是 Gabber 工作被反复引用的原因。",
      "变更的度数不能任意指定：可以要求与给定素数集互素，但不存在“度数为 1（即双有理）”的一般保证，这正是正特征消解开放的地方。因此在需要函数域不变的定理（例如用函数域定义的 Iitaka 维数、Kodaira 维数的比较）中必须先说明所用量在有限扩张下如何变化，而不能直接套用变更定理。",
    ],
    corollaries: [
      { title: "推论：正特征的基变换定理可由变更加迹映射得到", body: "设 $f:X\\to S$ 是正特征域上的真态射，$\\mathcal{F}$ 是 $f$ 平坦的凝聚层。取变更 $\\pi:X'\\to X$ 使 $X'$ 光滑且 $\\deg\\pi$ 与 $\\ell$ 互素（$\\ell\\ne\\mathrm{char}k$），在 $X'$ 上基变换定理成立（光滑情形可用平坦下降与形式函数定理），再用 $\\pi_*\\pi^*=\\deg\\pi$ 把 $X'$ 上的同构沿 $\\pi$ 降到 $X$：由于 $\\deg\\pi$ 在 $\\mathbb{Z}_\\ell$ 中可逆，这个等式给出 $R^qf_*\\mathcal{F}\\otimes\\mathbb{Z}_\\ell$ 的基变换同构（在适当的有限性假设下）。这正是“用变更替代消解”的标准范式：先在一个允许反例存在的更弱意义下换到光滑，再用互素度数把结论降回来。", uses: ['gabber-refinement'] },
    ],
    references: [
      { title: 'Smoothness, semi-stability and alterations', author: 'A. J. de Jong', year: 1996 },
      { title: 'Fibres de la résolution... / Travaux de Gabber sur l\'uniformisation locale (Astérisque 361-362)', author: 'L. Illusie, Y. Laszlo, F. Orgogozo (eds.)', year: 2014 },
      { title: 'Resolution of Singularities of an Algebraic Variety over a Field of Characteristic Zero', author: 'H. Hironaka', year: 1964 },
    ],
    history: HISTORY,
  },
}
