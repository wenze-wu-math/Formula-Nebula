/**
 * ═══════════════════════════════════════════════════════════════
 *  代数几何知识库 · 扩展 F —— 奇点、消解与双有理几何
 * ═══════════════════════════════════════════════════════════════
 *
 *  这一批补的是极小模型纲领（MMP）周围的**技术地带**：
 *  它不像 cone theorem 或 flip 那样是纲领的"主定理"，但没有
 *  它们，纲领就落不了地。
 *
 *    · 奇点的精细测量：差异除子、log canonical 阈值、
 *      奇点谱、Du Bois 与 rational 奇点的层次；
 *    · 消解与分解：强消解、弱分解、altered 局部化 —— 特征零
 *      与正特征的分界线上的一组替代品；
 *    · 双有理不变量：Kodaira 维数在纤维化下的行为、Iitaka
 *      纤维化、典范环的有限生成、以及 Severi–Iitaka 型问题；
 *    · 收缩与纤维空间：Mori 纤维空间、极收缩、以及
 *      "收缩何时是代数的"这一族问题。
 *
 *  与 E 批（层论技术）的分工：E 批服务于上同调计算，F 批
 *  服务于**分类**。两者在 log canonical 阈值（需要消没定理）
 *  与谱（需要 Hodge 理论）处交汇。
 *
 *  字段说明见 knowledge.js 顶部。
 */

export const EXTRA_F_NODES = [
  /* ══════════ 一、奇点的测量 ══════════ */
  {
    id: 'f-discrepancy-divisor',
    latex: String.raw`K_{X'}=f^*K_X+\sum_i a_iE_i,\qquad a_i=a(E_i;X)\in\mathbb Q`,
    name: '差异除子与差异系数',
    en: 'Discrepancy Divisor',
    importance: 0.88,
    family: 'birational',
    summary: '用典范除子在消解下的改变量精确测量奇点 —— MMP 的度量衡。',
    detail:
      '取奇点 X 的一个消解 f: X′ → X，把典范除子写成 K_{X′} = f*K_X + Σa_iE_i，其中 E_i 是例外除子、a_i 是有理数（因为 K_X 只是 Q-Cartier，所以差是 Q-除子）。这些 a_i 就是**差异系数**，它们不依赖消解的选择（对所有消解取遍，定义域的不变量）。整套 MMP 的语言都建立在这个数上：a_i > 0 时 X 有 terminal 奇点；a_i ≥ 0 时 canonical；a_i > −1 时 log terminal（klt）；a_i ≥ −1 时 log canonical（lc）。这条尺度的好处是它把"奇点有多坏"变成一个可比较的数值，从而使"极小模型"（使 K 尽可能正）成为一个有内容的最优化问题。见 c-discrepancy、c-klt-base-point-free。',
  },
  {
    id: 'f-log-canonical-threshold',
    latex: String.raw`\operatorname{lct}(X;D)=\sup\{c:\ (X,cD)\ \text{is log canonical}\}`,
    name: 'Log canonical 阈值',
    en: 'Log Canonical Threshold',
    importance: 0.85,
    family: 'birational',
    summary: '一个代数不变量，同时刻画奇点的"坏程度"与乘子理想的临界指数。',
    detail:
      'lct(X; D) 定义为使 (X, cD) 仍为 log canonical 的最大 c。它有多重身份：在双有理几何里它测量奇点相对除子 D 的严重程度（越小越坏）；在复分析里它等于乘子理想 I(D) 的**临界指数**（使 |f|^{−2c} 局部可积的最大 c），这两个定义被 Ein–Lazarsfeld–Smith、Kollár 等人证明一致；在交换代数里它出现在"一致 Artin 性"与 Briançon–Skoda 型定理中。它能计算的情形非常有限：只有少数几类（如单纯环面簇、单项式理想）有公式，一般情形是困难的开放计算问题。近年它成为"极小模型纲领与正特征"研究的一个交叉点，因为 lct 在正特征的行为（如是否存在反例）直接反映 MMP 的可行性。见 c-lc-threshold。',
  },
  {
    id: 'f-rational-singularity',
    latex: String.raw`X\ \text{rational}\iff R^if_*\mathcal O_{X'}=0\ (i>0),\ K_{X'}=f^*K_X`,
    name: '有理奇点',
    en: 'Rational Singularities',
    importance: 0.84,
    family: 'birational',
    summary: '消解不产生上同调的奇点 —— 上同调意义下"看不见"的奇点。',
    detail:
      'X 有有理奇点，若存在一个消解 f: X′ → X 使 R^if_*O_{X′} = 0 对 i > 0 且 K 在双有理意义下不改变（等价地，X 是 Cohen–Macaulay 且 f_*ω_{X′} = ω_X）。这个名字的意思是"上同调与光滑情形一样"：只有 H⁰ 存活，所以从 H^i (i>0) 看不出奇点。它有几个等价刻画：X 是正规、Cohen–Macaulay 且 f_*ω = ω；H^i(X, O_X) 的行为像光滑簇；乘子理想是平凡的。典型例子是 Du Val 曲面奇点（ADE 奇点）、quotient 奇点、以及 toric 奇点。它比 klt 更强（klt 只要求 a_i > −1 而不要求消没），两者的关系是 MMP 中"能否用奇点理论替代消没定理"的核心。见 c-rational-singularities。',
  },
  {
    id: 'f-du-bois-singularity',
    latex: String.raw`\underline\Omega^p_X\ \text{with}\ \mathbb H^i(X,\underline\Omega^p)\to H^i(X\setminus\Sigma,\Omega^p)\ \text{iso}`,
    name: 'Du Bois 奇点',
    en: 'Du Bois Singularities',
    importance: 0.76,
    family: 'birational',
    summary: '用 de Rham 复形的有理性定义，在 Hodge 理论中代替光滑簇。',
    detail:
      'Du Bois 在 1981 年构造了任意簇 X 上的一个复形 Ω̲^p_X（推广光滑簇的 Kähler 微分复形），使得 H^i(X, Ω̲^p_X) 是 X 的"Du Bois 上同调"，它总映射到 Hodge 型上同调 H^i(X\\Σ, Ω^p)。若这些映射对一切 p 都是同构，X 就称为 Du Bois 的。光滑簇显然 Du Bois；有理奇点是 Du Bois 的（Kovács–Schwede–Smith）；log canonical 奇点也是（Kovács–Schwede，用消没定理）。它的意义在 Hodge 理论：Du Bois 奇点的空间满足 Hodge 分解的弱形式，所以在研究奇点簇的 Hodge 结构时，Du Bois 是可以安全假设的"最广"条件之一。它与 Steenbrink 的极限 Hodge 结构、以及"对数 canonical ⟹ Du Bois"这一链条紧密相关。',
  },
  {
    id: 'f-spectrum-singularity',
    latex: String.raw`\operatorname{Sp}(f)=\sum_{i}\sum_{p}a_{p,i}\,[p],\qquad a_{p,i}=\dim\operatorname{Gr}^p_F H^i`,
    name: '奇点谱',
    en: 'Spectrum of a Singularity',
    importance: 0.78,
    family: 'birational',
    summary: '把 Hodge 滤过在 Milnor 纤维上的跳跃编码成一个离散不变量。',
    detail:
      'Steenbrink 用 Milnor 纤维的混合 Hodge 结构定义了奇点的**谱**：把 Hodge 滤过的分次块的维数按 p 收集起来，得到一个以有理数为指标的离散测度。它同时携带了 Milnor 数（总质量）、几何亏格、以及奇点的对称性（谱对偶 p ↦ n − p，来自 Poincaré 对偶）。这套不变量在曲面奇点的分类中尤其有力：Arnold 的奇点分类（ADE 与抛物、双曲奇点）可以用谱来区分，且谱与奇点的**等单值性**（equisingularity）密切相关 —— Varchenko 与 Steenbrink 证明谱与 μ-常值形变相容。它是对"消没上同调"这一个对象取 Hodge 信息的结果，因此把奇点理论嵌进了 Hodge 理论的框架。',
  },
  {
    id: 'f-jet-scheme',
    latex: String.raw`\operatorname{Jet}_k(X)=\operatorname{Hom}_k(\operatorname{Spec}k[t]/(t^{k+1}),X)`,
    name: '射流概形',
    en: 'Jet Scheme',
    importance: 0.68,
    family: 'scheme',
    summary: '参数化"k 阶无穷小弧"的概形 —— 把微分几何的语言代数化。',
    detail:
      '射流概形 Jet_k(X) 表示 X 上的 k 阶无穷小弧，它由可表函子定义，因此自动是概形且对任意 X 存在。它的构造是纯代数的（把方程按 t 展开并取系数），所以可以处理任意特征。用途有三块：其一，弧空间（k → ∞ 的极限）与奇点消解的关系 —— Nash 猜想（已由 Fernandez de Bobadilla 与 Ishii 独立证明）断言弧空间里的"基本集合"与消解的例外除子一一对应；其二，Greenberg 定理：对有限型概形，弧的有限性条件可以截断到有限阶；其三，在正特征几何里射流概形是"微分算子"的替代品（特征 p 没有通常意义的微分），用于定义 Frobenius 邻域与紧性限制。',
  },
  {
    id: 'f-nash-transform',
    latex: String.raw`\text{Nash}\colon \operatorname{Sing}(X)\to \operatorname{Gr}(\dim X,\ \mathbb A^n)`,
    name: 'Nash 变换与弧空间',
    en: 'Nash Transform and Arc Spaces',
    importance: 0.66,
    family: 'birational',
    summary: '把每个奇点送到自己的切空间 —— Hironaka 证明的起点与正特征困难的根源。',
    detail:
      'Nash 的构造：对 X ⊂ Aⁿ 的奇异点 x，把 x 送到它在 Gr(dim X, Aⁿ) 里"最接近的切空间"，闭包得到一个双有理态射 X ← Nash(X)。若 X 光滑，这就是 blowup。Hironaka 的消解证明正是通过不断取 Nash 变换（以及它的变体）来控制奇点不变量并使其严格下降 —— 所以 Nash 变换不是花絮，而是消解证明的骨架。它在正特征失效的原因也在这里：Nash 变换的良定义依赖特征零的"形式函数定理型"可微性，特征 p 时切空间不能由射流概形正确重构，于是整条不变量下降的论证断掉。Nash 猜想（弧空间的基本集合与消解例外除子对应）是这条线索的现代形式。',
  },

  /* ══════════ 二、消解与分解 ══════════ */
  {
    id: 'f-strong-resolution',
    latex: String.raw`\pi\colon X'\to X\ \text{proj.},\ \pi^{-1}(\operatorname{Sing}X)\ \text{a divisor with SNC},\ \pi|_{X'\setminus E}\cong`,
    name: '强消解',
    en: 'Strong Resolution of Singularities',
    importance: 0.82,
    family: 'birational',
    summary: '比"消解成光滑"更强：例外除子要构成简单正规交叉除子，且同构于外部。',
    detail:
      'Hironaka 的原始定理已经给出"例外除子 SNC"这一条，但"强消解"还要求：π 在 X 的光滑部分上是同构（π|_{X′\\E} ≅），且 π 是射影的、嵌入在 X 光滑部分上的同构要严格成立。这些附加条件看似吹毛求疵，但没有它们很多归纳论证无法进行：例如"沿光滑子簇先消解再拼合"需要严格的控制，"在光滑部分上是同构"是其中最常被用到的一条。此外强消解还要求与已给的光滑子簇相容（embedded resolution，嵌入消解），这是把消解应用到"考察一个特定的奇点集合"时的必要条件。正特征的强消解未知，这也是正特征 MMP 无法照搬特征零论证的原因之一。',
  },
  {
    id: 'f-weak-factorization',
    latex: String.raw`\phi\colon X\dashrightarrow Y\ \Longrightarrow\ \phi=\pi^{-1}\circ\sigma,\ \pi,\sigma\ \text{are sequences of blowups/contractions}`,
    name: '弱分解定理',
    en: 'Weak Factorization Theorem',
    importance: 0.86,
    family: 'birational',
    summary: '任何双有理映射都能分解为光滑簇间的 blowup 与 blowdown 交替。',
    detail:
      'Weak factorization（Abramovich–Karu–Matsuki–Włodarczyk 2002，以及 Włodarczyk 独立给出）：特征零的代数簇之间的任何双有理映射 φ: X ⇢ Y（X、Y 光滑射影）都可以分解成一串 blowup 与 blowdown，且每一步的两端都光滑。它是**强分解猜想**（每次 blowup 的中心要光滑且在一个公共的光滑簇里）的弱化版本，后者仍开放（正特征更强）。它的价值在于把"双有理等价"这个抽象关系具体化成一串可以逐步验证的操作：于是任何双有理不变量只需验证在单次 blowup 下的行为，这就使大量问题变得可计算 —— 例如 motivic 积分、双有理不变量（如 Hodge 数在 blowup 下的变化）、以及 Cremona 群的生成元问题。见 c-weak-factorization。',
  },
  {
    id: 'f-embedded-resolution',
    latex: String.raw`X\subset Y,\ \pi\colon Y'\to Y\ \text{with}\ \pi^{-1}(X)\ \text{SNC and}\ \pi^{-1}(X)_{\mathrm{red}}\ \text{smooth}`,
    name: '嵌入消解',
    en: 'Embedded Resolution',
    importance: 0.80,
    family: 'birational',
    summary: '把 X 放进光滑环境里一起消解，使 X 的严格变换光滑且与例外除子横截。',
    detail:
      '嵌入消解加强普通消解：要求 π^{-1}(X) 的**既约**部分光滑，且与例外除子构成 SNC。这是 Hironaka 定理的完整形式，也是应用中最常需要的版本 —— 因为很多问题不是关于 X 本身，而是关于"X 嵌在 Y 里"这个配置（例如考察 X 与 Y 的交、或者 X 的奇点在 Y 的坐标下的形状）。用途包括：证明弱分解定理（用嵌入消解把双有理映射的提升逐步化开）、定义 log canonical 阈值（需要同时控制 X 与 D）、以及研究 monodromy 与周期（需要 X 的严格变换与边界的关系清晰）。它是那种"平时不提，一旦需要就无可替代"的技术版本。',
  },
  {
    id: 'f-alterations',
    latex: String.raw`\pi\colon X'\to X\ \text{proper surjective generically finite},\ X'\ \text{smooth}`,
    name: 'Alterations 与 Gabber 定理',
    en: 'Alterations and Gabber\'s Theorem',
    importance: 0.79,
    family: 'birational',
    summary: '正特征里"消解"的替代品：允许有限覆盖，从而绕开不可解的部分。',
    detail:
      '当消解不可得（正特征）时，de Jong 在 1996 年证明了一个更弱但足够用的结果：任何簇都有 **alteration** —— 一个真满的、一般有限的光滑簇映射。与消解的区别在于：alteration 不是双有理的（可以是有限覆盖），所以它改变了函数域。这个让步看似损失很大，但对许多应用足够：证明定理时往往只需要"能提升到某个光滑对象上计算"，有限覆盖不影响上同调的不变量（在适当的意义下）。Gabber 后来（2005，de Jong 的讲义）做了**绝对**版本：可以要求 alteration 是射影的、且对给定的闭子簇相容。这条定理是正特征几何最常用的工具之一，也是"正特征缺少消解时如何继续工作"这一问题的标准答案。见 c-alterations。',
  },
  {
    id: 'f-de-jong-modifications',
    latex: String.raw`\pi\colon X'\to X\ \text{proper},\ X'\ \text{regular},\ \pi^{-1}(D)\ \text{is a divisor with SNC}`,
    name: 'de Jong 的修改定理',
    en: 'de Jong\'s Modification Theorem',
    importance: 0.77,
    family: 'birational',
    summary: '带边界的簇可以有光滑模型，边界成为 SNC 除子 —— 相对与对数版本的替代品。',
    detail:
      '这是 alterations 的相对形式（"modifications"）：给定 X 与它上面的一个除子 D（或一个态射 X → S），存在真满射 π: X′ → X 使 X′ 光滑、π^{-1}(D) 是 SNC 除子、且 π 在某个开集上是同构。名称里的"modification"强调它可以被选得与给定的 S 相容（相对情形），这在研究族的时候是必需的。证明的关键是**半稳定约化**（semistable reduction）的想法：先把问题化到曲线上（用 de Jong 的纤维化定理），在曲线情形用一次好的约化，再归纳回来。它在 p 进 Hodge 理论（用半稳定模型定义周期）、以及 Berkovich 空间与凝聚态数学的"分支"论证中都是标准输入。',
  },
  {
    id: 'f-nash-conjecture',
    latex: String.raw`\text{essential set of}\ \mathcal L(X)\ \longleftrightarrow\ \text{exceptional divisors of a resolution}`,
    name: 'Nash 猜想',
    en: 'Nash Conjecture (Arc Spaces)',
    importance: 0.74,
    family: 'birational',
    summary: '弧空间的基本集合与消解的例外除子一一对应 —— 定理（已证明）。',
    detail:
      'Nash 在 1995 年提出：X 的弧空间 L(X) 里"基本集合"（由切空间方向限定的那部分）的不可约分支，应该与 X 的消解的例外除子的**赋值**一一对应。它把"奇点的双有理信息"编码在"无穷小弧的极限方向"里，因此给出一种纯函子式的定义方式 —— 不需要真的构造消解，也能谈论例外除子的赋值。证明由 Fernandez de Bobadilla（2012）与 Ishii–Kollár（2012 前后）独立给出，用到 Greenberg 定理、以及有理奇点与 log canonical 阈值的技术。它的意义在于给"消解"这个困难的操作一个不需要存在性定理的替代定义，也是弧空间几何（motivic integration 的邻居）的核心结果。',
  },

  /* ══════════ 三、双有理不变量与纤维化 ══════════ */
  {
    id: 'f-iitaka-fibration',
    latex: String.raw`X\dashrightarrow Y,\qquad \dim Y=\kappa(X),\qquad \kappa(X_y)=0\ \text{for general}\ y`,
    name: 'Iitaka 纤维化',
    en: 'Iitaka Fibration',
    importance: 0.83,
    family: 'birational',
    summary: 'Kodaira 维数的加法公式：基空间维数加纤维维数。',
    detail:
      '对 κ(X) ≥ 0 的簇，Iitaka 构造了典范纤维化 X ⇢ Y：Y 是把多重典范系统|mK_X| 的像取定后的基空间，维数恰为 κ(X)，且一般纤维的 Kodaira 维数为 0。这给出一个结构性分解：X 的复杂度 = κ(Y)（基的维数） + 纤维的 klt 类型。于是问题被化到"κ = 0 的纤维"这一最小情形上。核心猜想是 **C_{n,m} 猜想**（Iitaka 猜想）：Kodaira 维数在纤维化下满足 κ(X) ≥ κ(Y) + κ(F)（一般纤维 F），这对研究形变与模空间至关重要。已知情形：κ(Y) = dim Y 时由 Kawamata 与 Viehweg 的"丰饶性"结果给出；C_{n,1}（纤维是曲线）也已解决；一般情形仍开放。见 c-abundance-conjecture、c-iitaka-fibration。',
  },
  {
    id: 'f-canonical-ring-fg',
    latex: String.raw`R(X)=\bigoplus_{m\ge 0}H^0(X,\mathcal O_X(mK_X))\ \text{is finitely generated}`,
    name: '典范环的有限生成性',
    en: 'Finite Generation of the Canonical Ring',
    importance: 0.87,
    family: 'birational',
    summary: 'κ ≥ 0 的簇的典范环有限生成 —— 与典范模型存在性等价的核心定理。',
    detail:
      '若典范环 R(X) 有限生成，则 Proj R(X) 就是 X 的**典范模型**（K 丰饶的正规射影簇），这就给出了双有理几何的"终点"。有限生成性对一般型（κ = dim X）由 BCHM（Birkar–Cascini–Hacon–McKernan 2010）证明，它把问题化到"κ = 0 的极小模型"上，并用 MMP 与丰饶性（abundance）的结果处理。一般 κ 的情形仍开放，且与典范模型存在性猜想（cn-canonical-model）、丰饶性猜想等价。技术的核心是**有限生成性可以双有理不变地检验**，于是可以用 MMP 把 X 约化到更好的情形 —— 这一步本身依赖 MMP 的终止性（见 c-termination），形成互锁。',
  },
  {
    id: 'f-severi-iitaka',
    latex: String.raw`\#\{\text{fibrations}\ X\to C\ \text{of genus}\ g\}\ \overset{?}{<}\ \infty`,
    name: 'Severi–Iitaka 型问题',
    en: 'Severi–Iitaka Type Problems',
    importance: 0.70,
    family: 'birational',
    summary: '给定亏格的纤维化只有有限多个 —— 双有理刚性的一个量化版本。',
    detail:
      '在曲面上这个问题由 Severi 提出（后来成为"有限多个纤维化"的一般猜想）：固定基与一般纤维的亏格后，双有理等价类是否只有有限多个？答案在一大类情形是肯定的（用 moduli 的有界性与 de Franchis 型论证），但一般情形（尤其是基曲线亏格 0 或 1 时）需要更精细的论证，且已知会失败或需要修正。它属于"双有理刚性"这一族问题：给定一些离散不变量，双有理类型是否有界。相关的著名结果包括曲面的 de Franchis 定理、以及高维的 Maehara 型有界性。它与模空间的有界性（见 c-boundedness、c-moduli-fano）共享技术，也是"双有理几何能否做分类"这一问题的最基本形式之一。',
  },
  {
    id: 'f-kodaira-dimension-fibration',
    latex: String.raw`f\colon X\to Y,\qquad \kappa(X)\ge\kappa(Y)+\kappa(F)`,
    name: 'Kodaira 维数在纤维化下的行为',
    en: 'Kodaira Dimension under Fibrations',
    importance: 0.81,
    family: 'birational',
    summary: '加法公式猜想 —— 典范系统如何沿纤维化分解。',
    detail:
      '对纤维化 f: X → Y 与一般纤维 F，猜测 κ(X) ≥ κ(Y) + κ(F)（Iitaka 的 C_{n,m} 猜想）。等号一般**不**成立：已知有 κ(X) > κ(Y) + κ(F) 的例子（Mori、Kollár 等人构造），所以正确形式可能是"≥"，而"何时取等"是一个独立的问题。证明的路径是相对的：先证明 f_*O(mK_X) 是凝聚层并在 Y 上有好的正性（用 Kawamata 的"丰饶性"与相对消没），然后看它的秩增长。已知情形：κ(Y) = dim Y 且基是丰饶的（Kawamata、Viehweg 独立），以及纤维是曲线（C_{n,1}）。它控制着"整体复杂度能否由基与纤维的复杂度相加得到"这一基本直觉，是双有理几何最实用的猜想之一。见 f-iitaka-fibration。',
  },

  /* ══════════ 四、收缩、纤维空间与代数性 ══════════ */
  {
    id: 'f-mori-fiber-space',
    latex: String.raw`f\colon X\to Y,\qquad -K_X\ \text{is}\ f\text{-ample},\qquad \rho(X/Y)=1`,
    name: 'Mori 纤维空间',
    en: 'Mori Fiber Space',
    importance: 0.84,
    family: 'birational',
    summary: 'MMP 三种输出之一：相对反典范丰饶、相对 Picard 数 1 的收缩。',
    detail:
      'MMP 的每一步收缩一个极射线，最终停在三类对象上：极小模型（K 丰饶或 nef，见 flip 与 c-termination）、Mori 纤维空间（相对反典范丰饶且相对 Picard 数 1）、以及纤维型收缩（dim Y < dim X 且 −K_X 在纤维上丰饶）。Mori 纤维空间是"Fano 型"的那一类：纤维是 Fano 簇，基空间是低维的。它的重要性在于它把高维问题化到"Fano 纤维 + 低维基"上：例子包括 del Pezzo 曲面纤维化、以及 Mori–Mukai 对三维的完整分类。它也是"有理连通性"（见 cn-rationally-connected）与"Fano 簇有理性"问题的自然框架 —— 因为纤维的 Fano 性质是所有这些问题的前提。见 fano、c-mori-cone、mori-cone-theorem。',
  },
  {
    id: 'f-extremal-contraction',
    latex: String.raw`\operatorname{Cont}_R\colon X\to Y,\qquad \overline{NE}(X/Y)\cap R^\perp\ne\{0\}`,
    name: '极收缩',
    en: 'Extremal Contraction',
    importance: 0.82,
    family: 'birational',
    summary: '把一个极射线收缩成态射 —— 圆锥定理的存在性部分与收缩定理的内容。',
    detail:
      '在 K_X 为负的极射线上，圆锥定理（见 mori-cone-theorem）保证射线是"有理的"（由有理曲线生成）；**收缩定理**（Kawamata、Kollár–Mori、Shokurov 等人建立）进一步保证这条射线可以对应到一个射影态射 Cont_R: X → Y，使得被收缩的曲线恰好是那些与 R 的交为 0 的曲线。收缩的类型取决于射线的几何：若收缩是双有理的就是 flip/flop 的一端（见 flip、h-terminal-flop），若收缩低维的就是 Mori 纤维空间或纤维型收缩。整套 MMP 就是反复找极射线、收缩它、再在新簇上重复 —— 所以极射线的存在性与收缩的良定义性是纲领能运转的全部前提。',
  },
  {
    id: 'f-contraction-algebraicity',
    latex: String.raw`\text{when is}\ \operatorname{Proj}\bigoplus_{m\ge 0}H^0(X,\mathcal O_X(mD))\ \text{a variety}?`,
    name: '收缩的代数性',
    en: 'Algebraicity of Contractions',
    importance: 0.71,
    family: 'birational',
    summary: '把"收缩"实现为真正的射影态射需要什么条件 —— 从形式到几何的一步。',
    detail:
      '给定一个负的极射线，形式上总能构造相对典范模型（取相对典范环的 Proj），但问题是它是否是**有限型**的（即真的是个簇）、以及是否是射影的。这一步不是自动的：需要相对典范环的有限生成性（见 f-canonical-ring-fg），而后者正是最困难的技术核心。对光滑簇与 klt 情形，BCHM 的有限生成定理给出了答案；对小收缩与 flip 的存在性，Shokurov 与 Hacon–McKernan 用"特殊终止"与"pl flipping"处理。可以这样说：整个 MMP 的现代证明，技术上都归结为"某个相对典范环有限生成"的验证 —— 所以这条节点是纲领运转的隐性地基。',
  },
  {
    id: 'f-special-mmp',
    latex: String.raw`K_X+\Delta\equiv 0\ \text{or}\ K_X+\Delta\ \text{big}\ \Longrightarrow\ \text{termination of flips}`,
    name: '特殊终止与 flips 的终止性',
    en: 'Special Termination of Flips',
    importance: 0.75,
    family: 'birational',
    summary: '在 K 与边界反典范或大的情形下，flip 序列必停。',
    detail:
      'MMP 要跑得下去，需要两件事：每一步 flip 存在，且序列最终停。存在性由 BCHM 解决（它是 flips 存在定理的现代形式），终止性只在特殊情形已知：Shokurov 的"特殊终止"定理处理 K_X + Δ ≡ 0 或 K_X + Δ 大的情形（这两个条件保证边界上的 log canonical 中心逐步消失，从而不能无限下降）。一般的终止性（没有 K 的正性假设）仍然是**开放**问题，也是整个 MMP 最大的缺口之一。实践中通过引入"scaling"与"pl flipping"以及新的不变量（如 minimal model program with scaling）绕开它，这解释了为什么现代 MMP 的陈述总是带着"with scaling"或某个正性假设。见 c-termination、flip。',
  },
  {
    id: 'f-nonvanishing',
    latex: String.raw`K_X+\Delta\ \text{pseudo-effective}\ \Longrightarrow\ \exists\,m>0,\ H^0(X,\mathcal O_X(m(K_X+\Delta)))\ne 0`,
    name: 'Non-vanishing 猜想',
    en: 'Non-vanishing Conjecture',
    importance: 0.83,
    family: 'birational',
    summary: '伪有效的对数典范除子必有一个非零截面 —— MMP 转折的技术前提。',
    detail:
      'Non-vanishing：若 K_X + Δ 是伪有效的（即属于闭包 of 有效除子锥），则它的某个倍数有非零整体截面。这一条看似温和，实际是 MMP 的关键卡点：当 K_X + Δ 是 nef 但不确定是否丰饶时，需要它来启动下一步的收缩；没有它，MMP 会卡在"K 非负但不知道是否有效"的状态上。已知情形：对一般型（big）成立（用 BCHM 的有限生成性），对 κ = 0 与某些特殊情形也有结果；一般情形仍开放。它也是丰饶性猜想（见 abundance）的邻居 —— 两者常常一起出现，且在某些情形下互相蕴含。近年的进展把它与"广义对数典范环的有限生成性"绑在一起。',
  },
  {
    id: 'f-abundance-log',
    latex: String.raw`K_X+\Delta\ \text{nef}\ \Longrightarrow\ K_X+\Delta\ \text{semi-ample}`,
    name: '对数丰饶性猜想',
    en: 'Log Abundance Conjecture',
    importance: 0.85,
    family: 'birational',
    summary: 'nef 的对数典范除子是否半丰饶 —— 决定 MMP 是否有"终点"的那一步。',
    detail:
      '丰饶性（abundance）断言：klt 对 (X, Δ) 上 K_X + Δ nef 时它半丰饶（某个倍数无基点自由，因而给出到典范模型的收缩）。这是 MMP 的**终点**问题：圆锥定理保证能不断收缩，flip 保证能修正，但"何时停下来、停下来之后是什么"完全取决于丰饶性。已知情形：曲面上完整（Enriques–Kodaira 分类给出答案）；三维由宫冈–森与 Kawamata 等人解决；一般维数只有部分结果（κ = 0 情形由 BCHM 与 Lai 等人的进展覆盖了一部分，一般 κ 仍开放）。它与 non-vanishing、典范环有限生成、以及"K_X + Δ 的有效性"互相纠缠，构成 MMP 最深的技术核心。见 abundance、c-abundance-conjecture。',
  },
  {
    id: 'f-lc-center',
    latex: String.raw`\text{center}(E)=\overline{f(E)}\subset X,\qquad \text{for lc}\ E\ \text{with}\ a(E)=-\operatorname{ord}\Delta`,
    name: 'Log canonical 中心',
    en: 'Log Canonical Centers',
    importance: 0.73,
    family: 'birational',
    summary: '差异系数取最小值的那些除子在 X 上的像 —— 奇点结构的骨架。',
    detail:
      '对 log canonical 对 (X, Δ)，差异系数有下界 −1（这正是 lc 的定义），达到下界的那些除子称为 lc 除子，它们的中心（在 X 上的像）称为 lc 中心。这些中心是 X 奇点结构的骨架：它们构成一个有限集合，两两之间的交仍由 lc 中心描述（Kollár 的"lc 中心是正规的且交是有限的"），并且可以通过**单纯形分解**（dlt 模型）把它们整理成简单正规交叉的样子。几乎每个 MMP 的归纳论证都在 lc 中心上做归纳：flip 的存在性、终止性、以及 log canonical 阈值的计算都归结为对中心的处理。它是"奇点测量的数值"与"奇点的几何分层"之间唯一的桥梁。',
  },
  {
    id: 'f-dlt-model',
    latex: String.raw`(X,\Delta)\ \text{dlt}\iff \text{lc and every lc center is normal and SNC}`,
    name: 'DLT 模型',
    en: 'Divisorially Log Terminal Models',
    importance: 0.79,
    family: 'birational',
    summary: '把 lc 对改造成"边界在每处都像简单正规交叉"的模型 —— 让归纳法可行。',
    detail:
      'dlt（divisorially log terminal）是介于 klt 与 lc 之间的条件：要求 (X, Δ) 是 lc，且所有 lc 中心都是正规的、且边界在每个中心附近构成 SNC。这个条件看起来只是"技术上的整洁"，但它是 MMP 归纳论证的**唯一可用形式**：在 klt 情形边界不交，归纳无从着手；在 lc 情形边界可能交叉得很乱，无法局部化。dlt 恰好保证"可以在 lc 中心的链上做归纳"，于是 Hacon–McKernan、BCHM 的证明全部在 dlt 框架下进行。关键技术结果是 **dlt 修正定理**：任何 lc 对都有一个小修改（或 dlt 模型）使其变成 dlt，且不改变 K + Δ 的数值性质。这条定理使"假设 dlt"成为合法的一般性简化。',
  },
  {
    id: 'f-minimal-lc-center',
    latex: String.raw`(X,\Delta)\ \text{lc},\ C\ \text{minimal lc center}\ \Longrightarrow\ C\ \text{is normal and}\ K_C+\Delta_C\ \text{is klt}`,
    name: '极小 lc 中心',
    en: 'Minimal Log Canonical Centers',
    importance: 0.72,
    family: 'birational',
    summary: '归纳法的落点：lc 中心的极小元自身是一个 klt 对。',
    detail:
      '极小 lc 中心（不含更小的 lc 中心的那些）有一个关键性质：它们正规，且在其上诱导出一个 klt 对 (C, Δ_C)，其中 Δ_C 由 adjunction（见 c-adjunction-mmp）给出。这就把 lc 的困难情形**归约**到 klt：想证明关于 lc 对的陈述，可以先在极小 lc 中心上证明 klt 版本，再归纳回整体 —— 这就是 Kawamata 的"lc 到 klt"归约技术，也是 flips 存在性证明（Shokurov、Hacon–McKernan）的第一步。技术上需要 adjunction 的精确形式（不同版本给出 Δ_C 的不同构造）与"中心的法向行为"的控制。它是 MMP 里"降维归纳"这一范式的标准入口。',
  },
  {
    id: 'f-threefold-mmp',
    latex: String.raw`\dim X=3\ \Longrightarrow\ \text{flips exist and any sequence terminates}`,
    name: '三维 MMP 的完整定理',
    en: 'Minimal Model Program in Dimension Three',
    importance: 0.86,
    family: 'birational',
    summary: '三维情形 MMP 完整成立 —— 包括 flip 的存在性、终止性与丰饶性。',
    detail:
      '三维是 MMP 唯一完整解决的情形，由宫冈洋一与森重文在 1980 年代完成（加上 Kawamata、Kollár、Shokurov 等人的补充）。结论：三维 klt（更一般地 lc）对的 flip 存在、flip 序列终止、且终点满足丰饶性 —— 于是每个三维簇都有极小模型或 Mori 纤维空间。证明的路径是"分类终端奇点"：三维的 canonical 与 terminal 奇点可以完全分类（cDV 点、以及 cA_n 型），于是可以逐个验证 flip 与收缩；终止性用"差异系数的离散性 + 数值不变量"论证。这与高维形成鲜明对比：高维的 flips 存在性直到 2010 年（BCHM）才解决，而**终止性至今未知**（见 f-special-mmp）。三维的完整结果因此既是指南针也是特例。',
  },
  {
    id: 'f-surface-classification-algorithm',
    latex: String.raw`X\ \text{surface}\ \Longrightarrow\ X\to X_{\min}\ \text{by contracting}\ (-1)\text{-curves}`,
    name: '曲面分类的算法化',
    en: 'Algorithmic Classification of Surfaces',
    importance: 0.75,
    family: 'birational',
    summary: '曲面的极小模型可以通过反复收缩 −1 曲线实际算出来。',
    detail:
      '曲面的 MMP 不只是存在性定理，它是一条**算法**：不断找 −1 曲线（Castelnuovo 可收缩曲线，见 b-castelnuovo-criterion）并收缩，直到没有为止，就得到极小模型；极小模型不唯一时用−1 曲线的关系（或 Mori 圆锥）说明它们之间的差异是有理曲线纤维化。这条算法是代数几何里少见的"可实际执行"的构造，也是曲面理论（Enriques–Kodaira 分类，见 surface-classification）能如此完整的原因。对比高维：三维的 flips 已经很难显式构造，四维以上几乎无法手工执行。它也是"分类与算法"关系的一个范例 —— 分类定理的价值很大程度上取决于它是否给出可执行的过程。',
  },
]

/**
 * 连接。F 批的图结构有两个意图：
 *  ① 把"奇点测量"那一组（差异、lct、rational、Du Bois、谱、
 *     射流、Nash）连成一条尺度递进的链，而不是并列的清单；
 *  ② 把 MMP 的技术环节（收缩→flip→终止→丰饶）按实际依赖
 *     顺序画出来，使这一片在主星系里呈现为一条通路。
 */
export const EXTRA_F_LINKS = [
  /* ── 奇点测量链 ── */
  ['f-discrepancy-divisor', 'c-discrepancy', 0.96, '与主库差异除子条目是同一工具'],
  ['f-discrepancy-divisor', 'f-log-canonical-threshold', 0.90, 'lct 是差异系数下界的临界值'],
  ['f-discrepancy-divisor', 'f-rational-singularity', 0.86, '有理奇点用差异系数与消没同时刻画'],
  ['f-discrepancy-divisor', 'c-singularities-mmp', 0.92, '奇点分类全靠差异系数的符号与大小'],
  ['f-discrepancy-divisor', 'c-klt-base-point-free', 0.84, 'klt 条件的定义就是差异系数大于 −1'],
  ['f-discrepancy-divisor', 'f-lc-center', 0.83, 'lc 中心是差异系数达到下界的位置'],
  ['f-log-canonical-threshold', 'c-lc-threshold', 0.96, '与主库 log canonical 阈值条目互补'],
  ['f-log-canonical-threshold', 'f-rational-singularity', 0.74, '有理奇点的 lct 为 1'],
  ['f-log-canonical-threshold', 'f-dlt-model', 0.70, 'dlt 条件下 lct 的计算可以局部化'],
  ['f-rational-singularity', 'c-rational-singularities', 0.95, '同一概念的主库条目'],
  ['f-rational-singularity', 'f-du-bois-singularity', 0.88, '有理奇点必是 Du Bois 的'],
  ['f-rational-singularity', 'f-jet-scheme', 0.62, '弧空间的良行为与有理奇点相关'],
  ['f-du-bois-singularity', 'f-log-canonical-threshold', 0.72, 'lc 奇点是 Du Bois 的，证明用消没定理'],
  ['f-du-bois-singularity', 'e-hodge-to-de-rham', 0.76, 'Du Bois 复形是 de Rham 复形的推广'],
  ['f-du-bois-singularity', 'hodge-theory', 0.80, 'Du Bois 奇点上 Hodge 分解以弱形式成立'],
  ['f-du-bois-singularity', 'c-hodge-structure-vhs', 0.68, '极限 Hodge 结构与 Du Bois 条件互为补充'],
  ['f-spectrum-singularity', 'f-rational-singularity', 0.70, '谱把奇点的 Hodge 信息离散化'],
  ['f-spectrum-singularity', 'e-holonomic-d-module', 0.66, 'Milnor 纤维的 Hodge 结构由 D-模控制'],
  ['f-spectrum-singularity', 'hodge-theory', 0.78, '谱是 Hodge 滤过在奇点上 Milnor 纤维的痕迹'],
  ['f-spectrum-singularity', 'e-vanishing-cycle', 0.64, '消没上同调是谱的载体'],
  ['f-jet-scheme', 'f-nash-transform', 0.88, '射流概形是弧空间与 Nash 变换的舞台'],
  ['f-jet-scheme', 'c-perfectoid', 0.58, '正特征里射流替代微分算子'],
  ['f-nash-transform', 'f-nash-conjecture', 0.94, 'Nash 猜想是 Nash 变换的现代形式'],
  ['f-nash-transform', 'c-hironaka', 0.86, 'Nash 变换是 Hironaka 消解证明的骨架'],
  ['f-nash-transform', 'f-strong-resolution', 0.78, '消解的强形式需要 Nash 型不变量下降'],
  ['f-nash-conjecture', 'f-jet-scheme', 0.90, '猜想的陈述需要弧空间'],
  ['f-nash-conjecture', 'f-rational-singularity', 0.72, '证明用到有理奇点与 lct 技术'],

  /* ── 消解与分解 ── */
  ['f-strong-resolution', 'c-hironaka', 0.95, 'Hironaka 定理的加强形式'],
  ['f-strong-resolution', 'f-embedded-resolution', 0.90, '嵌入消解是强消解最常用的版本'],
  ['f-strong-resolution', 'cn-resolution-charp', 0.88, '正特征强消解正是那条开问题'],
  ['f-strong-resolution', 'resolution', 0.92, '主库消解条目讲基本定理，这里讲加强条件'],
  ['f-embedded-resolution', 'f-weak-factorization', 0.84, '弱分解的证明以嵌入消解为输入'],
  ['f-embedded-resolution', 'f-log-canonical-threshold', 0.70, '计算 lct 需要同时控制簇与边界'],
  ['f-weak-factorization', 'c-weak-factorization', 0.96, '与主库弱分解条目互补'],
  ['f-weak-factorization', 'blowup', 0.82, '分解成的每一步都是 blowup 或它的逆'],
  ['f-weak-factorization', 'c-wdvv', 0.74, '弱分解是 motivic 积分良定义的关键输入'],
  ['f-weak-factorization', 'f-alterations', 0.68, '两者都是"把双有理映射化开"的手段'],
  ['f-alterations', 'c-alterations', 0.96, '与主库 alterations 条目互补'],
  ['f-alterations', 'cn-resolution-charp', 0.87, 'alterations 是正特征缺消解时的替代品'],
  ['f-alterations', 'f-de-jong-modifications', 0.90, '修改定理是 alterations 的相对形式'],
  ['f-alterations', 'h-flat-descent', 0.62, '下降论证在构造 alteration 时反复出现'],
  ['f-de-jong-modifications', 'c-alterations', 0.86, '与主库条目分享同一套技术'],
  ['f-de-jong-modifications', 'c-padic-hodge', 0.76, '半稳定模型是 p 进 Hodge 理论的输入'],
  ['f-de-jong-modifications', 'f-embedded-resolution', 0.72, '相对版本需要与给定边界相容'],
  ['f-de-jong-modifications', 'c-berkovich', 0.60, 'Berkovich 空间的半稳定约化'],
  ['f-nash-conjecture', 'resolution', 0.70, '猜想给消解一个不依赖存在性的定义'],

  /* ── 双有理不变量与纤维化 ── */
  ['f-iitaka-fibration', 'h-kodaira-dimension-compute', 0.82, '纤维化给出 Kodaira 维数的实际计算路径'],
  ['f-iitaka-fibration', 'iitaka-fibration', 0.96, '与主库的 Iitaka 纤维化条目是同一构造'],
  ['f-iitaka-fibration', 'f-kodaira-dimension-fibration', 0.92, '加法公式是 Iitaka 纤维化的核心猜想'],
  ['f-iitaka-fibration', 'kodaira-dimension', 0.88, '纤维化的基维数就是 Kodaira 维数'],
  ['f-iitaka-fibration', 'c-abundance-conjecture', 0.82, '纤维化的存在依赖丰饶性的部分结果'],
  ['f-iitaka-fibration', 'f-canonical-ring-fg', 0.80, '典范环有限生成给出典范模型与纤维化'],
  ['f-kodaira-dimension-fibration', 'kodaira-dimension', 0.90, '加法公式正是关于 Kodaira 维数的'],
  ['f-kodaira-dimension-fibration', 'h-kodaira-dimension-compute', 0.74, '高维批的 Kodaira 维数计算条目'],
  ['f-kodaira-dimension-fibration', 'k3-surface', 0.55, 'κ = 0 的纤维是最难的一般纤维'],
  ['f-canonical-ring-fg', 'cn-canonical-model', 0.93, '有限生成性与典范模型存在性等价'],
  ['f-canonical-ring-fg', 'c-abundance-conjecture', 0.88, '两者一起给出 MMP 的终点'],
  ['f-canonical-ring-fg', 'canonical-model', 0.85, '主库典范模型条目'],
  ['f-canonical-ring-fg', 'c-termination', 0.78, '有限生成的论证依赖 MMP 终止性'],
  ['f-severi-iitaka', 'moduli-space', 0.74, '有界性论证依赖模空间理论'],
  ['f-severi-iitaka', 'f-iitaka-fibration', 0.80, '都是关于纤维化有多少个的问题'],
  ['f-severi-iitaka', 'c-boundedness', 0.78, '与有界性问题共享技术'],
  ['f-severi-iitaka', 'ruled-surface', 0.62, '直纹面是基亏格 0 的经典例子'],

  /* ── MMP 的技术环节 ── */
  ['f-mori-fiber-space', 'fano', 0.90, 'Mori 纤维空间的纤维是 Fano 簇'],
  ['f-mori-fiber-space', 'mori-cone-theorem', 0.88, '圆锥定理保证极射线存在，才谈得上纤维空间'],
  ['f-mori-fiber-space', 'b-mori-cone', 0.86, '主库 Mori 锥条目'],
  ['f-mori-fiber-space', 'cn-rationally-connected', 0.76, '纤维的 Fano 性正是那条猜想的场景'],
  ['f-mori-fiber-space', 'c-moduli-fano', 0.72, 'Fano 纤维的模空间是有界性问题'],
  ['f-extremal-contraction', 'mori-cone-theorem', 0.94, '收缩定理是圆锥定理的另一半'],
  ['f-extremal-contraction', 'f-mori-fiber-space', 0.88, '低维收缩的输出就是 Mori 纤维空间'],
  ['f-extremal-contraction', 'flip', 0.86, '双有理收缩的两端是 flip 或 flop'],
  ['f-extremal-contraction', 'b-mori-cone', 0.84, '极射线是 Mori 锥的面'],
  ['f-extremal-contraction', 'h-terminal-flop', 0.70, '三维 flop 是极收缩的显式例子'],
  ['f-contraction-algebraicity', 'f-canonical-ring-fg', 0.92, '代数性等价于相对典范环有限生成'],
  ['f-contraction-algebraicity', 'flip', 0.86, 'flip 的存在性就是收缩代数性的一个情形'],
  ['f-contraction-algebraicity', 'c-termination', 0.68, '收缩之后还要保证过程会停'],
  ['f-contraction-algebraicity', 'e-coherent-sheaf', 0.60, '相对典范环的有限性论证用凝聚性'],
  ['f-contraction-algebraicity', 'c-log-resolution', 0.64, '对数情形下代数性论证需要边界控制'],
  ['f-special-mmp', 'c-termination', 0.95, '与主库终止性条目互补'],
  ['f-special-mmp', 'flip', 0.88, '终止性是关于 flip 序列的性质'],
  ['f-special-mmp', 'f-threefold-mmp', 0.84, '三维的终止性已完整证明'],
  ['f-special-mmp', 'f-abundance-log', 0.70, '终止性与丰饶性共同决定 MMP 终点'],
  ['f-nonvanishing', 'c-abundance-conjecture', 0.90, 'non-vanishing 是丰饶性的前提'],
  ['f-nonvanishing', 'f-abundance-log', 0.93, '两者是 MMP 转折处的两个卡点'],
  ['f-nonvanishing', 'abundance', 0.86, '主库丰饶性条目'],
  ['f-nonvanishing', 'f-canonical-ring-fg', 0.80, '一般型情形由有限生成性给出'],
  ['f-abundance-log', 'abundance', 0.96, '对数版本是主库丰饶性条目的推广'],
  ['f-abundance-log', 'c-abundance-conjecture', 0.94, '与主库猜想条目互补'],
  ['f-abundance-log', 'kodaira-dimension', 0.78, '丰饶性决定 Kodaira 维数的取值'],
  ['f-lc-center', 'f-dlt-model', 0.92, 'dlt 条件正是对 lc 中心的要求'],
  ['f-lc-center', 'f-minimal-lc-center', 0.90, '极小 lc 中心是中心里的极小元'],
  ['f-lc-center', 'c-discrepancy', 0.86, '中心的定义用差异系数'],
  ['f-lc-center', 'f-log-canonical-threshold', 0.74, 'lct 的值由 lc 中心决定'],
  ['f-dlt-model', 'f-minimal-lc-center', 0.88, 'dlt 使中心的链上可以做归纳'],
  ['f-dlt-model', 'c-singularities-mmp', 0.84, 'dlt 是 MMP 归纳的标准框架'],
  ['f-dlt-model', 'c-adjunction-mmp', 0.80, '伴随公式在 dlt 框架下最好用'],
  ['f-minimal-lc-center', 'c-adjunction-mmp', 0.88, '极小中心上的 klt 对由伴随给出'],
  ['f-minimal-lc-center', 'c-klt-base-point-free', 0.76, '归约到 klt 之后可以用基点自由定理'],
  ['f-minimal-lc-center', 'flip', 0.78, 'flips 存在性证明的第一步就是这个归约'],
  ['f-threefold-mmp', 'flip', 0.94, '三维 flip 存在且序列终止'],
  ['f-threefold-mmp', 'mmp', 0.90, '三维是 MMP 唯一完整解决的情形'],
  ['f-threefold-mmp', 'c-termination', 0.88, '三维终止性已证'],
  ['f-threefold-mmp', 'abundance', 0.82, '三维丰饶性由宫冈–森解决'],
  ['f-threefold-mmp', 'c-singularities-mmp', 0.86, '三维奇点分类是证明的基础'],
  ['f-threefold-mmp', 'h-terminal-flop', 0.78, '三维终端奇点与 flop 的完整分类'],
  ['f-surface-classification-algorithm', 'surface-classification', 0.95, '曲面分类的算法化'],
  ['f-surface-classification-algorithm', 'b-castelnuovo-criterion', 0.92, '−1 曲线的收缩判据是算法的每一步'],
  ['f-surface-classification-algorithm', 'b-blowup-surface', 0.84, '收缩的逆操作就是 blowup'],
  ['f-surface-classification-algorithm', 'b-enriques-kodaira', 0.80, 'Enriques–Kodaira 分类是算法的输出'],
  ['f-surface-classification-algorithm', 'h-aut-minimal-surface', 0.66, '极小模型的自同构群依赖于算法结果'],
]

