/**
 * ═══════════════════════════════════════════════════════════════
 *  代数几何知识库 · 扩展 H
 * ═══════════════════════════════════════════════════════════════
 *
 *  这一批补的是三块在既有批次里相对稀疏的地带：
 *  其一是曲面与三维簇的分类与极小模型理论（Enriques 曲面、Kodaira 维数
 *  的计算与 −∞ 情形、三次曲面上的 27 条直线、极小自同构群、终端奇点
 *  与 flop、Noether 公式的推广）；
 *  其二是概形论基础的补齐（形式完备化、Nagata 紧化、Chevalley 定理、
 *  可构造层、Stein 分解、Zariski 主定理、分离态射、平坦下降、有限型
 *  与有限呈示之别）；
 *  其三是导出与谱方法（谱代数几何、E∞ 环、导出解析几何、凝聚态数学、
 *  完美胚空间与 tilting、导出叠、dg 增强、模型范畴与 ∞-范畴）。
 *
 *  字段说明见 knowledge.js 顶部。
 */

export const EXTRA_H_NODES = [
  /* ══════════ 一、曲面与三维簇 ══════════ */
  {
    id: 'h-enriques-surface',
    latex: String.raw`H^1(X,\mathcal O_X)=0,\qquad 2K_X\sim 0,\qquad q=0,\ p_g=0`,
    name: 'Enriques 曲面',
    en: 'Enriques Surface',
    importance: 0.76,
    family: 'curve',
    summary: 'Kodaira 维数 0 的非平凡极小曲面，典范除子是二阶挠元。',
    detail:
      'Enriques 曲面是极小曲面中 Kodaira 维数为 0 而非常特殊的一类：它满足 2K_X 线性等价于 0 但 K_X 本身不平凡，因而典范类在 Picard 群中是 2-挠元。由 Noether 公式与 q=0 可推出它的 Betti 数 b_1=0、b_2=10，Euler 数等于 12，算术亏格与不规则度同时为零。它不单有理，却被 Castelnuovo 判别法恰好卡在边界上：判别法要求 q=p_g=0 且第十二个伴随系统的双有理模型为点，Enriques 曲面只满足前半。它可由 K3 曲面按一个固定点自由的对合取商得到，这一构造在特征 2 中会退化为非经典的 Enriques 曲面，是研究 moduli 与形变时的重要反例来源。',
  },
  {
    id: 'h-kodaira-dimension-compute',
    latex: String.raw`\kappa(X)=\operatorname{trdeg}_k \bigoplus_{m\ge 0} H^0(X,\mathcal O_X(mK_X))-1`,
    name: 'Kodaira 维数的计算',
    en: 'Computation of Kodaira Dimension',
    importance: 0.82,
    family: 'birational',
    summary: '用多重典范截面的增长阶数计算 Kodaira 维数的实用判据与操作步骤。',
    detail:
      'Kodaira 维数刻画的是多重典范系统的渐进增长：若对所有 m 都有 H^0(mK_X)=0 则约定 κ=−∞，否则取 Plückner 序列 P_m=h^0(mK_X) 的增长阶数，等价于分次环的投射超越次数减一。计算上最有用的判据是对充分大的 m 检查 P_m 的多项式增长次数，在实际操作中往往只需检验 m=1,2,3 等少数几个值即可定出维数。这一数值是双有理不变量，在 Iitaka 纤维化中给出底空间的维数，并与一般型、Calabi–Yau、Fano 等分类层级一一对应，是极小模型纲领判定下一步操作的入口。需要注意 κ 在双有理形变下不变，但 h^0(mK_X) 本身并非双有理不变量，必须取渐进量。',
  },
  {
    id: 'h-kappa-negative',
    latex: String.raw`\kappa(X)=-\infty\iff X\ \text{is uniruled (BDPP, char }0)`,
    name: 'Kodaira 维数 −∞ 与有理连通性',
    en: 'Kodaira Dimension -inf and Uniruledness',
    importance: 0.84,
    family: 'birational',
    summary: 'κ 为 −∞ 等价于簇被有理曲线覆盖，即非单直纹的几何刻画。',
    detail:
      'BDPP 定理断言在特征 0 的射影簇上，Kodaira 维数为 −∞ 当且仅当簇是非单直纹的，也就是被一条有理曲线扫过：存在支配性态射 Y×P^1→X 使得切映射满。这一结论把纯数值的 κ=−∞ 变成几何的「有理性」陈述，其证明核心是极小模型纲领加奇点消解，用锥定理找到负性极端的收缩射线并归纳。它给出 Kodaira 维数为 −∞ 时典范类非伪有效的判别，也解释了为什么 Fano 簇、有理曲面与 del Pezzo 曲面全部落在这一层。作为对照，特征 p 中此等价性失效，存在非单直纹而 κ=−∞ 的曲面，是正特征几何的经典警示。',
  },
  {
    id: 'h-cubic-27-lines',
    latex: String.raw`\text{cubic surface}\subset \mathbb P^3\ \text{contains exactly }27\ \text{lines}`,
    name: '三次曲面上的 27 条直线',
    en: 'The 27 Lines on a Cubic Surface',
    importance: 0.86,
    family: 'curve',
    summary: '光滑三次曲面恰含 27 条直线，构形由 Weyl 群 E6 控制。',
    detail:
      '光滑三次曲面是 P^3 中的次数 3 曲面，它恰好包含 27 条直线，这些直线的交构形是经典几何最著名的组合结构之一。每条直线自交数为 −1，任意两条直线的相交关系由 E6 的 27 个权对应，Schläfli 图记录了全部相交对。这 27 条直线给出曲面到 P^2 的一个双有理收缩，说明三次曲面是 P^2 沿六点爆破的像，从而它是 del Pezzo 曲面；27 条直线的计数与配置也由 blowup 中六点的一般位置条件完全决定。在特征 2 或 3 中会出现直线重数合并与例外构形，这是此结论最需要留意的边界情形。',
  },
  {
    id: 'h-aut-minimal-surface',
    latex: String.raw`\operatorname{Aut}(X)\ \text{for minimal}\ X:\ \text{finite unless}\ \kappa\le 1`,
    name: '极小曲面的自同构群',
    en: 'Automorphism Group of a Minimal Surface',
    importance: 0.72,
    family: 'curve',
    summary: '极小曲面自同构群在 κ≥2 时有限，低维数时可为无限群或正维数代数群。',
    detail:
      '极小曲面的自同构群结构随 Kodaira 维数分层：当 κ 等于 2 即一般型时自同构群有限，可用多重典范系统线性化进而嵌入 GL；当 κ=0 时自同构群仍有限，但可能很大，例如 K3 曲面可有 80 阶的有限群作用；当 κ=1 时自同构群包含由椭圆纤维的平移给出的无限群；当 κ=−∞ 时自同构群可以是正维数的代数群，如 ruled 曲面上的 PGL 作用。这一分层说明自同构的复杂度与典范类的正负性直接相关，也是研究自同构群有限性定理、Moduli 的紧化以及 Enriques 分类中极性对合问题的出发点。经典证明依赖极小模型下自同构保持典范类这一事实。',
  },
  {
    id: 'h-birational-aut-representation',
    latex: String.raw`\operatorname{Bir}(X)\curvearrowright \operatorname{NS}(X),\quad \text{arithmetic image}`,
    name: '双有理自同构群与它的表示',
    en: 'Birational Automorphism Group and Its Representation',
    importance: 0.78,
    family: 'birational',
    summary: '双有理自同构群通过拉回作用在 Néron–Severi 群上，其像通常是算术群。',
    detail:
      '双有理自同构群 Bir(X) 通过拉回除子类作用在 Néron–Severi 群 NS(X) 上，这一表示把几何的自同构问题化为格上的算术问题。对 K3 曲面，此表示的像落在正交群的算术子群中，并可据正锥与 ample 锥的信息刻画出有效自同构的子群；对一般型曲面，像有限，与自同构群有限的结论相容。表示的核由保持极化的双有理自同构构成，通常有限。这一框架是分析双有理动力系统的基本工具：熵的正负、周期点的分布、以及有理自映射的度增长都可由该表示的谱性质读出，也是判定 Bir(X) 与 Aut(X) 差别的最直接手段。需要注意此表示并不总是忠实。',
  },
  {
    id: 'h-terminal-flop',
    latex: String.raw`K_Y=f^*K_X,\qquad \rho(Y/X)=1,\qquad Y\dashrightarrow Y^+\ \text{a flop}`,
    name: '三维簇的极小模型（终端奇点与 flop）',
    en: 'Minimal Models in Dimension 3: Terminal Singularities and Flops',
    importance: 0.88,
    family: 'birational',
    summary: '三维极小模型纲领用终端奇点、极端射线收缩与 flop 完成双有理化简。',
    detail:
      '三维簇的极小模型纲领由三步构成：取终端奇点化的部分消解，沿 K 负的极端射线收缩，当遇到 K 平凡的小收缩时执行 flop 使典范类恢复为正。终端奇点在三维被完全分类为商奇点，其重要性在于它们足够温和，允许对 K_X 使用相交理论而不失一般性。flop 是保持奇点类型、改变极小模型的双有理变换，在三维是 Atiyah 与 Reid 给出的具体构造。Mori 的存在性定理保证 K 负极端射线可收缩，而终止性在三维已被证明，因此三维极小模型的存在性是无条件成立的；在更高维，flop 的终止性仍属猜想，是极小模型纲领的核心障碍。',
  },
  {
    id: 'h-noether-formula-general',
    latex: String.raw`\chi(\mathcal O_X)=1-q+p_g,\qquad K^2\ge 2p_g-4\ (\text{Noether})`,
    name: '曲面的 Noether 公式的推广',
    en: 'Generalizations of the Noether Formula',
    importance: 0.74,
    family: 'birational',
    summary: 'Noether 公式的高维推广，一般型曲面的数值判据。',
    detail:
      '经典 Noether 公式 χ(O_X)=(K^2+χ_top)/12 把 Euler 数、典范自交数与算术不变量联系起来，它其实是 Riemann–Roch 在曲面上的展开式。推广分三个方向：一是到高维，用 Todd 类给出 χ(O_X) 作为 Chern 数与 Todd 数的积分，Hirzebruch 的公式即其一般形式；二是到带奇点情形，需加入局部贡献，log-terminal 奇点下的修正项由奇点的 discrepancies 给出；三是对数与相对版本，把 K 换成 K+B 并引入边界除子，成为对数极小模型纲领中的基本恒等式。这一推广使 Noether 不等式 K^2≥2p_g−4 与 Bogomolov–Miyaoka–Yau 不等式成为一般型曲面分类的数值判据。',
  },

  /* ══════════ 二、概形论基础补齐 ══════════ */
  {
    id: 'h-formal-completion',
    latex: String.raw`\widehat X=\varinjlim \operatorname{Spec}\,\widehat{\mathcal O}_{X,x}`,
    name: '形式完备化与形式概形',
    en: 'Formal Completion and Formal Schemes',
    importance: 0.8,
    family: 'scheme',
    summary: '沿闭子概形的完备化给出形式概形，是代数几何与形式几何之间的桥梁。',
    detail:
      '沿闭子概形 Y⊂X 的形式完备化是把 X 在 Y 的邻域内按 I-进拓扑取极限，得到的形式概形 X̂ 记录的是 Y 附近任意阶的无穷小信息，而非某点的局部环。局部上它由环的 I-进完备化 Spec 粘合而成，其结构层是拓扑环层。形式概形是形式函数定理与 Grothendieck 存在定理的天然舞台：它把代数簇上的凝聚层与其形式对应物联系起来，并为形式形变理论、刚性解析几何与 p 进 Hodge 理论提供框架。最重要的技术点是形式函数定理与代数化定理，它们保证在 proper 与适当的有限性假设下，形式数据可以由真对象恢复，否则会出现无法代数化的病态例子。',
  },
  {
    id: 'h-nagata-compactification',
    latex: String.raw`X\hookrightarrow \overline X,\quad \overline X\ \text{proper},\ \partial X\ \text{divisor}`,
    name: 'Nagata 紧化的构造',
    en: 'Nagata Compactification',
    importance: 0.85,
    family: 'scheme',
    summary: '任意有限型分离概形可嵌入真概形，且边界可取为除子。',
    detail:
      'Nagata 紧化定理断言：任何有限型的分离概形 X 都存在开浸入到真概形 X̄ 中，且（在正规化与适当修改后）使边界 X̄∖X 成为除子。它的价值在于把「真性」这一强大假设廉价地强加给任意对象：紧化后可用 proper 映射的赋值判别、相交理论、以及形式函数定理，再限制回开子集得到关于 X 的结论。原始证明用归纳法并对维数作复杂的降维处理，Conrad 与 Temkin 后来给出基于 valuative 判据与「块状」分解的现代证明。需要留意的是紧化并不唯一，边界的选择会影响相交数等量，因此多数应用须同时控制边界除子的奇点。',
  },
  {
    id: 'h-chevalley-constructible',
    latex: String.raw`f\ \text{finite type}\ \Rightarrow\ f(X)\ \text{constructible (Chevalley)}`,
    name: 'Chevalley 定理（可构造集与像）',
    en: 'Chevalley Theorem on Constructible Sets',
    importance: 0.79,
    family: 'scheme',
    summary: '有限型态射的像是可构造集，限制了代数簇投影可能出现的病态行为。',
    detail:
      'Chevalley 定理说有限型概形态射的集合论像不要求是闭的，但一定是可构造的：即像可写成有限个局部闭子集的并。它与代数基本定理的直觉不同之处在于，消去量词之后得到的只是一阶可定义集合，未必闭，例如 A^2→A^1 的像就是可构造而非闭。这条定理是很多结果的第一步：若再有真性或有限性假设，可构造性可提升为闭性（真态射的像是闭的），从而得到上同调与纤维维数的半连续性；在构造性结果如 Hilbert 方案与 Quot 方案的存在性中，可构造性正是逼近定理的入口。它也是 Chevalley 可构造性定理在层层面的对应版本的来源。',
  },
  {
    id: 'h-constructible-sheaf',
    latex: String.raw`\mathcal F\ \text{constructible}\iff \text{locally constant on finite stratification}`,
    name: '可构造层与它的性质',
    en: 'Constructible Sheaves and Their Properties',
    importance: 0.77,
    family: 'scheme',
    summary: '在有限分层上局部常数的层；有限型态射下保持，在导出范畴中性质稳健。',
    detail:
      '可构造层是指在某一有限分层上逐块局部常数的层，它把「分段常值」的直觉搬到代数几何中，避免了纯局部常数层过于刚性而无法描述有奇点对象的困难。它的基本性质包括：在有限型态射下的拉回与像仍可构造（后者需有限性条件），对偶与推前在导出范畴中保持可构造性，且可构造层的上同调在每个分层块上局部常数。可构造层是平展上同调、相交上同调与 perverse 层理论的基石，与 Verdier 对偶、decomposition theorem 密切相关。需要注意可构造性依赖分层与基变换，在非有限型的态射下会失效，这是使用该概念时最常见的隐含前提。',
  },
  {
    id: 'h-stein-factorization',
    latex: String.raw`f\ \text{factors}\ X\xrightarrow{g}Y\xrightarrow{h}S,\quad g_*\mathcal O_X=\mathcal O_Y`,
    name: 'Stein 分解',
    en: 'Stein Factorization',
    importance: 0.81,
    family: 'foundation',
    summary: '把态射分解为纤维连通部分与有限部分，中间对象由推前结构层构造。',
    detail:
      'Stein 分解把有限型分离态射 f:X→S 分解为 X→Y→S，其中第一步的推前结构层等于结构层，第二步是有限态射（在对 S 附加适当假设时）。中间的 Y 可直接构造为相对谱 Spec_S(f_*O_X)，因此它是被 f 唯一决定的。分解的意义是把「纤维连通的分量」与「纤维的有限离散部分」彻底分开：几何纤维的连通分支数正是有限态射的次数。这一工具在 Zariski 主定理的证明、代数簇的连通性定理、以及极小模型纲领中相对典范环的有限生成性讨论里反复出现；它也是相对代数几何中把整体问题化归为纤维连通与有限两层的基本手段。',
  },
  {
    id: 'h-zariski-main',
    latex: String.raw`f\ \text{quasi-finite}\ \Rightarrow\ X\hookrightarrow X'\xrightarrow{\mathrm{fin}}S`,
    name: 'Zariski 主定理与它的推论',
    en: 'Zariski Main Theorem and Consequences',
    importance: 0.83,
    family: 'foundation',
    summary: '拟有限分离态射可分解为开浸入与有限态射，双有理近似同构的严格版本。',
    detail:
      'Zariski 主定理（Grothendieck 版本）说：若 f:X→S 是拟有限且分离的有限型态射，且 S 局部诺特，则 f 可分解为开浸入 X→X′ 与有限态射 X′→S。等价的几何陈述是：双有理且拟有限的态射在其定义域的适当开集上是同构，因此「双有理且 proper 加上有限纤维」足以推出同构。它的推论遍布代数几何：正规化是有限的判据、消解中例外纤维的连通性与 Zariski 连通定理、以及极小模型纲领中收缩态射的结构分析都直接依赖它。常见的误用是忽略分离性假设，此时会出现把两个点粘到同一像点的病态态射。',
  },
  {
    id: 'h-separated-diagonal',
    latex: String.raw`\Delta_{X/S}:X\to X\times_S X\ \text{closed immersion}\iff X/S\ \text{separated}`,
    name: '分离态射与对角态射',
    en: 'Separated Morphisms and the Diagonal',
    importance: 0.8,
    family: 'foundation',
    summary: '分离性等价于对角态射是闭浸入，是 Hausdorff 条件的代数替代品。',
    detail:
      '分离性是拓扑 Hausdorff 条件的代数类比：态射 X→S 分离当且仅当对角态射 Δ:X→X×_S X 是闭浸入。直观上它要求 X 中不能出现「两个不同的点以相同方式趋于同一极限」的情形，而带双原点的直线正是非分离的标准例子。这一条件看似技术性，实则不可或缺：它保证赋值判别法有效、保证 proper 态射的像闭合、保证上同调基变换定理成立、保证极限的唯一性。相对版本还给出「universally closed 加分离等价于 proper」这一定义 proper 的路线，因此在证明 proper 性时对角态射的闭性往往是关键一步。',
  },
  {
    id: 'h-flat-descent',
    latex: String.raw`S'\to S\ \text{fpqc}\ \Rightarrow\ \text{descent data on}\ S'\ \text{descends to}\ S`,
    name: '平坦下降',
    en: 'Flat Descent',
    importance: 0.87,
    family: 'foundation',
    summary: 'fpqc 拓扑下拟凝聚层、态射与代数结构都可沿平坦覆盖有效下降。',
    detail:
      '平坦下降是把局部构造从覆盖拉回到底空间的技术：给定忠实平坦且拟紧的态射 S′→S，配上覆盖上的对象与满足余圈条件（即下降数据）的同构，就能在 S 上唯一地恢复对象并使其拉回等于原有对象。可下降的对象包括拟凝聚层、态射、代数结构，以及相当一般的纤维范畴，其有效性依赖层的忠实平坦性所保证的等化子性质。下降理论的价值在于它把构造问题化为局部验证问题，同时催生了 Grothendieck 拓扑与叠的概念：不能在 Zariski 拓扑下局部定义的对象，往往能在平坦或平展拓扑下定义。需注意有效下降通常要求覆盖是 fpqc（甚至 fppf）而非仅 faithful flat，这是最常见的细节陷阱。',
  },
  {
    id: 'h-finite-type-vs-presentation',
    latex: String.raw`\text{finite type}+\text{finitely generated relations}=\text{finite presentation}`,
    name: '有限型与有限呈示的差别',
    en: 'Finite Type versus Finite Presentation',
    importance: 0.71,
    family: 'scheme',
    summary: '有限型只要求局部有限生成，有限呈示还要求关系理想也有限生成。',
    detail:
      '代数结构的「有限型」（局部有限生成）与「有限呈示」（有限生成且关系也有限生成）差别看似琐碎，实则在非诺特基底下决定成败：有限型概形可以有无限生成的关系理想，从而在基变换下行为不合预期，而有限呈示概形可以被任意基变换并保持有限呈示。这一差别正是 Grothendieck 在 EGA 中大量使用有限呈示的原因，它保证极限与基变换的可交换性、保证模函子可表性论证中的逼近步骤、保证形式几何中的代数化定理成立。典型反例是无限多个变量生成的理想给出的有限型但非有限呈示的非诺特环。在诺特基上两者等价，因此初学者常忽略这一区分。',
  },

  /* ══════════ 三、导出与谱方法 ══════════ */
  {
    id: 'h-spectral-ag-motivation',
    latex: String.raw`\operatorname{Spec}:\ \mathbb E_\infty\text{-rings}^{\mathrm{op}}\to \text{sp. schemes}`,
    name: '谱代数几何的动机',
    en: 'Motivation for Spectral Algebraic Geometry',
    importance: 0.86,
    family: 'modern',
    summary: '以 E∞ 环取代交换环，让导出方法内建于几何基础之中。',
    detail:
      '谱代数几何的动机来自一个基本观察：很多几何构造（相交、模空间的切复形、形变障碍）天然是导出的，若停留在经典概形层面就必须反复补入导出修正。把底层的交换环换成谱 E∞ 环、把模层换成谱模层，几何的对象就从集合上升为空间，同伦论的信息被保留在结构层中。这样做的收益是：Spec 的函子性推广，平展、光滑、平坦等概念有稳定的谱版本，且经典的导出概形与谱概形在该框架下统一处理。代价是技术门槛陡增——需要在稳定同伦论的语境中重述凝聚性、有限性等概念，且谱代数几何中很多「经典直觉」的命题需要额外假设才成立。',
  },
  {
    id: 'h-einfinity-derived-rings',
    latex: String.raw`\pi_*A\ \text{graded-commutative},\quad A\ \text{an}\ \mathbb E_\infty\text{-ring}`,
    name: 'E∞ 环与导出环谱',
    en: 'E-infinity Rings and Derived Ring Spectra',
    importance: 0.84,
    family: 'modern',
    summary: 'E∞ 环是同伦交换的环谱，构成导出环论与导出代数几何的底层基础。',
    detail:
      'E∞ 环是环谱配上同伦意义下相容的乘法与交换性数据，它把交换环的公理由等式升级为同伦：交换性由同伦给出，且这些同伦自身满足高阶相容条件。它比单纯环谱（A∞）多出的正是「交换」这一层，从而可以定义张量积、模、乃至平坦与光滑等几何概念。E∞ 环的同伦群 π_*A 构成分次交换环，π_0A 是经典交换环，这解释了为什么经典代数在 π_0 层面被恢复。最重要的例子是球谱 S 与 Eilenberg–MacLane 谱 HA；后者的 E∞ 结构恰好对应经典交换环的乘法，而前者带来非平凡的 π_*，是导出环论区别于经典环论的根源。',
  },
  {
    id: 'h-derived-analytic-geometry',
    latex: String.raw`\text{derived analytic geometry}:\ \text{ringed}\ \infty\text{-topoi}`,
    name: '导出解析几何',
    en: 'Derived Analytic Geometry',
    importance: 0.73,
    family: 'modern',
    summary: '在解析空间上引入导出结构，研究形变与模空间的解析侧对应物。',
    detail:
      '导出解析几何把导出代数几何的框架移植到解析与刚性解析的语境：底层对象换成解析空间或 Berkovich、adic 空间，结构层换成解析函数的导出版本。它与代数侧的主要差别在于解析函数环缺乏有限生成性这一强约束，因而必须引入 Fréchet 或拓扑环的导出推广，技术难度显著上升。动机包括：解析模空间（如复结构形变、Hitchin 模空间、Fukaya 范畴的解析结构）天然带导出结构，以及 p 进 Hodge 理论中的导出方法需要与刚性解析几何兼容。目前它仍是活跃的构造性领域，主要推动者有 Porta、Yu 等人给出的导出解析空间与导出刚性空间的模型。',
  },
  {
    id: 'h-condensed-motivation',
    latex: String.raw`\operatorname{Cond}(\mathrm{Ab})\supset \text{profinite},\ \text{topological groups}`,
    name: '凝聚态数学的动机与它的对象',
    en: 'Condensed Mathematics: Motivation and Objects',
    importance: 0.85,
    family: 'modern',
    summary: '用紧 Hausdorff 空间上的层取代拓扑空间，得到性质良好的 Abel 范畴。',
    detail:
      '凝聚态数学的动机是修好拓扑 Abel 群范畴的缺陷：它既非 Abel 范畴也缺乏足够的内射与投射，导致同调代数无法顺利展开。解决办法是把拓扑群改述为紧 Hausdorff 空间范畴上的层，得到的凝聚态 Abel 群范畴是 Abel 的、有余极限与极限、并有好的张量积与内 Hom 的对称幺半结构。它同时容纳 profinite 集、拓扑群、完备拓扑向量空间与 Banach 空间，因而成为 p 进几何与分析的自然基底。这一框架与完美胚空间、pro-étale 上同调、以及固态模理论紧密结合，为 p 进 Hodge 理论提供了统一语言；代价是需要熟悉层范畴与拓扑基的抽象语言。',
  },
  {
    id: 'h-perfectoid-tilting',
    latex: String.raw`X\ \text{perfectoid}\iff X^\flat\ \text{perfectoid},\quad X^{\flat\flat}\cong X`,
    name: '完美胚空间与 tilting',
    en: 'Perfectoid Spaces and Tilting',
    importance: 0.9,
    family: 'modern',
    summary: '完美胚空间与其 tilting 在特征 p 的对应物等价，可跨特征搬运几何结论。',
    detail:
      '完美胚空间是 Scholze 引入的一类完备非阿基米德解析空间，其定义要求 Frobenius 在模 p 的意义下近似满射。其核心结构是 tilting 等价：每个特征 0 的完美胚空间 X 对应唯一的特征 p 完美胚空间 X^♭，两者在拓扑与 étale 拓扑层面几乎完全一致，且 tilting 是对合。这把特征 0 的问题搬到特征 p 中，在那里 Frobenius 可逆因而工具更强；反之亦可将特征 p 的构造提升回特征 0。这一技术直接产出 p 进 Hodge 理论的突破以及 pro-étale 上同调与几乎数学的新基础，是现代算术几何最重要的方法论进展之一。需要注意 tilting 保持拓扑与 étale 结构，但不保持结构层本身，故代数信息要通过 tilting 对象的相关结构恢复。',
  },
  {
    id: 'h-derived-stack',
    latex: String.raw`\mathfrak X:\ \text{derived stack},\qquad \text{fibers are}\ \infty\text{-groupoids}`,
    name: '导出叠',
    en: 'Derived Stacks',
    importance: 0.79,
    family: 'modern',
    summary: '以导出概形为图表的叠，纤维为 ∞-群胚，用来刻画模问题的导出结构。',
    detail:
      '导出叠是把叠的概念提升到导出世界：它的纤维不再是集合或群胚，而是 ∞-群胚，并允许图表为导出概形。动机来自模问题：当模空间在经典意义下有奇点（如向量丛模空间的非约化点、曲线的紧化边界）时，正确的对象往往带有高阶自同构与导出信息，取经典截断会丢失关键部分。导出叠提供了统一语言，使得虚拟基本类、perfect obstruction theory、Donaldson–Thomas 不变量与 Gromov–Witten 理论可以在同一框架下定义。其核心工具是切复形与形变障碍的长正合列，奇点结构被编码在复形的上同调中。技术难点在于 ∞-范畴语境下定义与验证代数性。',
  },
  {
    id: 'h-dg-enhancement',
    latex: String.raw`D^b(X)\ \rightsquigarrow\ \text{dg-category},\qquad H^0=\text{derived category}`,
    name: '导出范畴的 dg 增强',
    en: 'DG Enhancements of Derived Categories',
    importance: 0.82,
    family: 'modern',
    summary: '在导出范畴上补入链复形 Hom 的 dg 结构，恢复被截断的高阶信息。',
    detail:
      '导出范畴 D^b(X) 只保留 Hom 复形的第 0 上同调，因而丢失高阶信息：两个对象可以在导出范畴中同构但其 Hom 复形并不拟同构，甚至存在非零的 Ext 高阶群在范畴层面不可见。dg 增强的做法是构造一个 dg 范畴，其第 0 上同调范畴恰为原导出范畴，从而把 Hom 复形完整保留。增强的存在性与唯一性（Bondal–Kapranov 预三层猜想、Toën 的唯一性定理）是导出几何的基本结果，它使 Fourier–Mukai 函子、层的模空间与形变理论可在 dg 层面严谨处理。同一导出范畴可能有多余的增强，但唯一性定理保证在适当条件下增强本质唯一，这正是用它做不变量可靠的原因。',
  },
  {
    id: 'h-model-infty-categories',
    latex: String.raw`\text{model category}\to \text{localization}\to \infty\text{-category}`,
    name: '模型范畴与 ∞-范畴在同调代数里的用途',
    en: 'Model Categories and Infinity-Categories in Homological Algebra',
    importance: 0.86,
    family: 'foundation',
    summary: '模型范畴提供可计算框架，∞-范畴给出弱等价局部化的正确语言。',
    detail:
      '同调代数的现代基础由两套语言构成：模型范畴通过弱等价、纤维化与余纤维化给出可计算的结构，使导出函子、导出张量积与同伦极限可以具体构造；∞-范畴则把弱等价形式地取逆，得到定义良好且灵活的目标范畴，避免了在模型范畴间比较时的繁琐。两者的关系是：每个模型范畴都给出一个 ∞-范畴，而 ∞-范畴的陈述往往更难直接计算。实际工作中常用「用模型结构算、用 ∞-范畴说」的策略：例如在导出代数几何中，用模型范畴建立局部化与导出函子，用 ∞-范畴陈述下降与模空间性质。需注意 Quillen 伴随与 ∞-范畴伴随的相容性、以及不同模型结构给出同一 ∞-范畴的条件，这是最容易出错的环节。',
  },
]

export const EXTRA_H_LINKS = [
  /* ══════════ 一、曲面与三维簇 ══════════ */
  /* ── Enriques 曲面 ── */
  ['h-enriques-surface', 'b-enriques-kodaira', 0.94, 'Enriques–Kodaira 分类中的关键一类曲面'],
  ['h-enriques-surface', 'k3-surface', 0.88, '由 K3 曲面的自由对合取商构造得到'],
  ['h-enriques-surface', 'h-kodaira-dimension-compute', 0.74, '典范类的挠性使 Kodaira 维数降为零'],
  ['h-enriques-surface', 'h-aut-minimal-surface', 0.68, '极小曲面的自同构群在此为有限群'],

  /* ── Kodaira 维数 ── */
  ['h-kodaira-dimension-compute', 'kodaira-dimension', 0.93, '给出这一双有理不变量的可计算定义'],
  ['h-kodaira-dimension-compute', 'iitaka-fibration', 0.8, 'Kodaira 维数正是 Iitaka 底空间的维数'],
  ['h-kodaira-dimension-compute', 'h-kappa-negative', 0.78, '计算判据在截面对全为零时的取值约定'],

  /* ── 负维数与有理连通性 ── */
  ['h-kappa-negative', 'ruled-surface', 0.88, '直纹曲面是负无穷维数的最典型情形'],
  ['h-kappa-negative', 'cone-theorem', 0.84, '定理证明依赖锥定理寻找负性极端射线'],
  ['h-kappa-negative', 'h-terminal-flop', 0.8, '非单直纹性由极小模型纲领给出证明'],

  /* ── 三次曲面与自同构群 ── */
  ['h-cubic-27-lines', 'del-pezzo', 0.87, '三次曲面是次数三的 del Pezzo 曲面'],
  ['h-cubic-27-lines', 'blowup', 0.83, '等价于平面沿六个一般位置点作爆破'],
  ['h-cubic-27-lines', 'h-enriques-surface', 0.6, '同为经典曲面几何中的著名构形'],

  /* ── 自同构群与双有理表示 ── */
  ['h-aut-minimal-surface', 'mmp', 0.76, '极小模型下自同构保持典范类不变'],
  ['h-aut-minimal-surface', 'c-rational-singularities', 0.6, '奇点类型直接影响自同构群的结构'],
  ['h-aut-minimal-surface', 'h-birational-aut-representation', 0.72, '自同构群是双有理自同构群的特例'],

  ['h-birational-aut-representation', 'neron-severi', 0.85, '表示作用在 Néron–Severi 群的除子类上'],
  ['h-birational-aut-representation', 'k3-surface', 0.8, 'K3 曲面上像落在算术正交群之中'],
  ['h-birational-aut-representation', 'h-terminal-flop', 0.7, '双有理变换由极小模型间的 flop 生成'],

  /* ── 三维极小模型 ── */
  ['h-terminal-flop', 'flop', 0.92, 'flop 是极小模型之间的标准双有理变换'],
  ['h-terminal-flop', 'c-discrepancy', 0.83, '终端性由 discrepancies 的正性来定义'],
  ['h-terminal-flop', 'c-termination', 0.8, '三维情形终止性已被无条件证明'],
  ['h-terminal-flop', 'h-noether-formula-general', 0.66, '极小模型上的数值不变量需重新核算'],
  ['h-terminal-flop', 'h-zariski-main', 0.64, '收缩态射的结构分析依赖主定理'],

  /* ── Noether 公式的推广 ── */
  ['h-noether-formula-general', 'b-noether-formula', 0.9, '经典 Noether 公式是它的推广起点'],
  ['h-noether-formula-general', 'b-riemann-roch-surface', 0.84, '实为曲面 Riemann–Roch 定理的展开形式'],
  ['h-noether-formula-general', 'h-kodaira-dimension-compute', 0.68, '数值不变量用于判定典范类的增长阶'],
  ['h-noether-formula-general', 'h-formal-completion', 0.6, '奇点的局部贡献可由形式完备化计算'],

  /* ══════════ 二、概形论基础补齐 ══════════ */
  /* ── 形式完备化 ── */
  ['h-formal-completion', 'formal-scheme', 0.93, '形式概形正是该构造的直接产物'],
  ['h-formal-completion', 'formal-functions-theorem', 0.88, '形式函数定理在此框架下才有意义'],
  ['h-formal-completion', 'h-flat-descent', 0.72, '形式数据的粘合本质上是下降问题'],
  ['h-formal-completion', 'h-finite-type-vs-presentation', 0.66, '代数化定理要求有限呈示这一前提'],

  /* ── Nagata 紧化 ── */
  ['h-nagata-compactification', 'nagata-compactification', 0.94, 'Nagata 定理的既有条目与证明思路'],
  ['h-nagata-compactification', 'proper-morphism', 0.86, '真性正是紧化带来的核心收益'],
  ['h-nagata-compactification', 'h-separated-diagonal', 0.74, '紧化要求原态射分离作为前提条件'],
  ['h-nagata-compactification', 'h-zariski-main', 0.68, '紧化的现代证明使用主定理类工具'],

  /* ── Chevalley 定理与可构造层 ── */
  ['h-chevalley-constructible', 'b-semicontinuity', 0.82, '由可构造性进一步推出上半连续性'],
  ['h-chevalley-constructible', 'b-flattening', 0.75, '平坦化是可构造性论证的重要工具'],
  ['h-chevalley-constructible', 'h-constructible-sheaf', 0.8, '集合层面的可构造性提升到层层面'],
  ['h-chevalley-constructible', 'h-stein-factorization', 0.62, '纤维的连通性可由像的结构读出'],

  ['h-constructible-sheaf', 'etale-cohomology', 0.82, '平展上同调中的基本对象类之一'],
  ['h-constructible-sheaf', 'c-perverse', 0.78, 'perverse 层建立在可构造层的基础之上'],
  ['h-constructible-sheaf', 'h-stein-factorization', 0.64, '推前层的可构造性与 Stein 分解有关'],

  /* ── Stein 分解与 Zariski 主定理 ── */
  ['h-stein-factorization', 'a-stein-factorization', 0.9, '该分解在既有批次中的对应条目'],
  ['h-stein-factorization', 'a-pushforward-pullback', 0.7, '由推前结构层构造出中间概形'],
  ['h-stein-factorization', 'h-zariski-main', 0.76, '分解定理是主定理证明的核心步骤'],

  ['h-zariski-main', 'c-zariski-main', 0.93, 'Zariski 主定理的既有详细条目'],
  ['h-zariski-main', 'normalization', 0.8, '正规化的有限性由主定理直接推出'],
  ['h-zariski-main', 'h-separated-diagonal', 0.72, '主定理要求态射分离且拟有限'],
  ['h-zariski-main', 'h-formal-completion', 0.6, '形式函数定理是主定理的形式版本'],

  /* ── 分离性与下降 ── */
  ['h-separated-diagonal', 'separated-morphism', 0.94, '分离态射的基本定义与判别方法'],
  ['h-separated-diagonal', 'fibred-product', 0.76, '对角态射的靶恰为纤维积'],
  ['h-separated-diagonal', 'h-flat-descent', 0.68, '分离性保证下降数据的唯一性'],

  ['h-flat-descent', 'descent', 0.93, '下降理论的总览与一般框架'],
  ['h-flat-descent', 'a-faithfully-flat', 0.88, '忠实平坦是下降有效性的关键条件'],
  ['h-flat-descent', 'grothendieck-topology', 0.8, '下降理论直接催生了 Grothendieck 拓扑'],
  ['h-flat-descent', 'h-finite-type-vs-presentation', 0.7, '下降有效性与有限性假设密切相关'],
  ['h-flat-descent', 'h-derived-stack', 0.64, '下降理论最终发展为叠的语言'],

  /* ── 有限型与有限呈示 ── */
  ['h-finite-type-vs-presentation', 'noetherian', 0.72, '在诺特基上这两种有限性等价'],
  ['h-finite-type-vs-presentation', 'a-formal-smooth', 0.68, '形式光滑性需要有限呈示作前提'],
  ['h-finite-type-vs-presentation', 'h-chevalley-constructible', 0.64, '可构造性论证需要有限呈示条件'],

  /* ══════════ 三、导出与谱方法 ══════════ */
  /* ── 谱代数几何与 E∞ 环 ── */
  ['h-spectral-ag-motivation', 'derived-algebraic-geometry', 0.9, '谱代数几何是导出几何的自然延伸'],
  ['h-spectral-ag-motivation', 'c-derived-scheme', 0.84, '导出概形是其中的经典层面对象'],
  ['h-spectral-ag-motivation', 'h-einfinity-derived-rings', 0.88, '谱概形以 E∞ 环作为结构层'],
  ['h-spectral-ag-motivation', 'h-derived-stack', 0.66, '谱方法可用于构造导出叠的模型'],

  ['h-einfinity-derived-rings', 'derived-category', 0.68, '同伦群给出分次代数的结构信息'],
  ['h-einfinity-derived-rings', 'c-perfect-complex', 0.7, '完美复形提供所需的有限性条件'],
  ['h-einfinity-derived-rings', 'h-condensed-motivation', 0.72, '两种基底方案目标相近而手段不同'],

  /* ── 导出解析几何与凝聚态 ── */
  ['h-derived-analytic-geometry', 'c-berkovich', 0.78, '解析侧的底层空间理论来源之一'],
  ['h-derived-analytic-geometry', 'c-kodaira-spencer', 0.66, '复结构形变可由导出方法解释'],
  ['h-derived-analytic-geometry', 'h-condensed-motivation', 0.74, '凝聚态方法为解析侧提供新基底'],

  ['h-condensed-motivation', 'c-condensed', 0.94, '凝聚态数学的既有核心条目'],
  ['h-condensed-motivation', 'c-condensed-analytic', 0.86, '凝聚态解析几何是其主要应用方向'],
  ['h-condensed-motivation', 'h-perfectoid-tilting', 0.78, '凝聚态语言使 tilting 表述更自然'],
  ['h-condensed-motivation', 'h-derived-stack', 0.6, '凝聚态层可用来定义导出几何对象'],

  /* ── 完美胚空间与 tilting ── */
  ['h-perfectoid-tilting', 'c-perfectoid', 0.95, '完美胚空间正是 tilting 的载体对象'],
  ['h-perfectoid-tilting', 'c-padic-hodge', 0.9, 'tilting 技术直接推动了 p 进 Hodge 理论突破'],
  ['h-perfectoid-tilting', 'h-derived-analytic-geometry', 0.62, '完美胚空间是导出解析几何的特例'],

  /* ── 导出叠、dg 增强与 ∞-范畴 ── */
  ['h-derived-stack', 'c-virtual-fundamental', 0.88, '虚拟基本类在导出叠上得到定义'],
  ['h-derived-stack', 'c-obstruction', 0.76, '切复形编码了形变障碍的信息'],
  ['h-derived-stack', 'h-dg-enhancement', 0.8, '导出叠上的层需要对 dg 增强'],
  ['h-derived-stack', 'h-model-infty-categories', 0.7, '导出叠的定义依赖 ∞-范畴语言'],

  ['h-dg-enhancement', 'c-orlov', 0.8, 'Orlov 定理在 dg 层面获得更精确表述'],
  ['h-dg-enhancement', 'c-fourier-mukai', 0.84, 'Fourier–Mukai 函子在 dg 范畴中获得实现'],
  ['h-dg-enhancement', 'h-model-infty-categories', 0.76, '两种增强语言在适当条件下彼此等价'],

  ['h-model-infty-categories', 'derived-category', 0.86, '导出范畴由弱等价局部化得到'],
  ['h-model-infty-categories', 'derived-functor', 0.84, '导出函子在模型范畴中具体构造'],
  ['h-model-infty-categories', 'h-spectral-ag-motivation', 0.68, '模型范畴为谱几何提供计算框架'],
]
