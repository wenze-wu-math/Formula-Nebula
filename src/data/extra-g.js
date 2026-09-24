/**
 * ═══════════════════════════════════════════════════════════════
 *  代数几何知识库 · 扩展 G —— 计数几何、相交理论与映射的技术
 * ═══════════════════════════════════════════════════════════════
 *
 *  选取理由：主库的 family 分布很不均衡 —— intersect 有 45 个、
 *  cohomology 有 49 个，而 **map 只有 17 个**。但"怎么造一个映射、
 *  怎么判断一个映射好不好、映射的空间长什么样"恰恰是代数几何
 *  每天在做的三件事。这一批补的就是这个洼地：
 *
 *    · 计数：Schubert 演算、枚举不变量的定义与计算、量子化技术
 *      （量子上同调、Gromov–Witten 的动机）、以及不变量在形变下
 *      的不变性（deformation invariance）；
 *    · 相交：局部化（Atiyah–Bott、虚拟局部化）、K-理论类、以及
 *      "虚拟基本类"这一让奇异模空间可积分的工具；
 *    · 映射：双有理态射的分解、纤维化的构造与判别、以及
 *      "映射的模空间"（Hom 概形、Quot、Hilbert）这一族。
 *
 *  与 D 批（modern）的分工：D 批是"纲领与理论"，G 批是"技术
 *  与算法"。G 批的节点大多可以回答"具体怎么算"。
 *
 *  字段说明见 knowledge.js 顶部。
 */

export const EXTRA_G_NODES = [
  /* ══════════ 一、计数几何 ══════════ */
  {
    id: 'g-schubert-calculus',
    latex: String.raw`\sigma_\lambda\cdot\sigma_\mu=\sum_{\nu}c_{\lambda\mu}^{\nu}\sigma_\nu`,
    name: 'Schubert 演算',
    en: 'Schubert Calculus',
    importance: 0.86,
    family: 'intersect',
    summary: 'Grassmann 簇上把"计数问题"翻译成对称函数的乘法 —— 枚举几何的起点。',
    detail:
      'Schubert 在 1879 年解决的问题是：Gr(k, n) 里满足一系列位置条件的子空间有多少个？他引入 Schubert 胞腔 σ_λ（由分区 λ 编号）作为上同调的一组基，把"满足条件的个数"变成"σ_λ 的乘积展开后某个系数"。这个展开的系数 **Littlewood–Richardson 系数** c^ν_{λμ} 有纯组合的算法（Giambelli 公式、Pieri 规则、以及后来的 Horn 猜想与 Knutson–Tao 的饱和猜想）。它的现代地位：Grassmann 簇的上同调环等于对称函数的一个商（Borel 表示），所以几何计数等价于对称函数计算 —— 这是"枚举问题 = 代数组合"这一范式的原型。经典应用包括：三维空间中四条直线能交出多少条直线（2 条）、以及二十世纪前的全部枚举几何结果。',
  },
  {
    id: 'g-schubert-variety',
    latex: String.raw`\Omega_\lambda(w)=\overline{\{V_\bullet:\ \dim(V_{p_i}\cap F_{q_j})\ge r_{ij}\}}`,
    name: 'Schubert 簇与它的奇点',
    en: 'Schubert Varieties',
    importance: 0.82,
    family: 'intersect',
    summary: '用维数条件定义的闭子簇 —— 它的奇点结构决定了计数结果。',
    detail:
      '固定一个完全旗 F_•，Schubert 簇 Ω_λ 由"与 F_• 的相交维数至少是 r_ij"这类条件定义。它们是旗簇的胞腔闭包，因此给出旗簇的一个代数胞腔分解（Bruhat 分解的几何形式）。它们的奇点并不坏，但也不光滑：奇点集合由"更大的 Schubert 簇"组成，这一结构使它们成为奇点理论的天然试验场 —— Kazhdan–Lusztig 猜想的原始动机正是"Schubert 簇的相交上同调如何计算"（见 cn-kazhdan-lusztig），而 Richardson 簇（两个 Schubert 簇的交）的奇点与表示论的重数有深刻联系。Knutson–Miller–Shimozono 与 Knutson–Vakil 等人近年用**退化技巧**把许多 Schubert 演算问题化为组合问题，得到 Littlewood–Richardson 与 K-理论的组合公式。',
  },
  {
    id: 'g-enumerative-invariant',
    latex: String.raw`N_d=\int_{[\overline M_{0,n}(X,\beta)]^{\mathrm{vir}}}\prod\operatorname{ev}_i^*\gamma_i`,
    name: '枚举不变量的定义',
    en: 'Definition of Enumerative Invariants',
    importance: 0.84,
    family: 'intersect',
    summary: '把"满足条件的曲线有多少条"写成模空间上的积分 —— 计数几何的合法化。',
    detail:
      '经典的枚举几何（"有多少条曲线经过这些点"）长期缺少严格基础：曲线族可能退化、参数空间可能奇异，所以"个数"没有定义。Kontsevich 与 Manin 的方案是：把计数写成模空间 M̄_{g,n}(X, β)（稳定映射的模空间）上的积分，被积函数是求值映射拉回的上同调类。这样"个数"变成了一个**相交数**，其存在性由虚拟基本类（见 g-virtual-fundamental-class）保证。这一步是从"技巧"到"理论"的转折：正因为有了这个定义，才有 Gromov–Witten 不变量的公理、WDVV 方程、以及镜像对称的精确预言。副作用是"个数"的含义被改变了 —— 得到的是虚拟计数（virtual count），它可能不是真正的整数个数，但它是唯一具有良好形变性质的量。',
  },
  {
    id: 'g-deformation-invariance',
    latex: String.raw`\int_{[\overline M]^{\mathrm{vir}}}\alpha\ \text{is invariant under deformations of}\ J`,
    name: '形变不变性',
    en: 'Deformation Invariance of GW Invariants',
    importance: 0.83,
    family: 'intersect',
    summary: '不动点计数在参数形变下不变 —— 这正是虚拟计数存在的理由。',
    detail:
      'Gromov–Witten 不变量（以及 Donaldson–Thomas、Gopakumar–Vafa 等）的定义之所以要用虚拟基本类，就是为了让它们**在形变下不变**：只要族的全空间与相关模空间的行为足够好，不变量就只依赖同调类而不依赖代表元。这条性质是全部枚举几何计算的基础 —— 我们可以把一般的枚举问题形变到一个特别好的情形（例如 toric 或齐性空间）再计算，结果与原来一致。经典原型是局部化：在环面作用的不动点集上积分，结果与一般位置一致（Atiyah–Bott，见 g-localization）。技术上的保证来自虚拟基本类的构造与"族上的模空间"的相容性（Behrend–Fantechi、Li–Tian）。',
  },
  {
    id: 'g-quantum-cohomology-ring',
    latex: String.raw`\sigma_a\star\sigma_b=\sum_{d}\sum_{c}N_{ab}^{c,d}\,q^d\,\sigma_c`,
    name: '量子上同调环',
    en: 'Quantum Cohomology Ring',
    importance: 0.87,
    family: 'intersect',
    summary: '把 GW 不变量当成结构常数，得到一个上同调环的形变 —— 几何计数变成代数结构。',
    detail:
      '普通上同调环的乘法由"两个类的交的三次相交数"给出（即 ∫ α∪β∪γ）。量子上同调把这项替换成**带曲线类 d 的三点 GW 不变量**，于是乘法依赖于 d，整体成为一个形式幂级数环（在 q 上）。这个环有三个惊人性质：其一，它满足结合律（WDVV 方程，见 c-wdvv），因为 GW 不变量满足相应的递归关系；其二，对小量子环，它与**量子上同调 D-模**（Dubrovin 联络、Givental 的框架）联系在一起，成为一个可积系统；其三，它是镜像对称的代数载体：镜像映射把 A 模型的量子环与 B 模型的变形理论等同起来（见 c-mirror-map、c-hms）。它把一个计数问题彻底变成了环论问题，这是 1990 年代几何学最大的观念转变之一。',
  },
  {
    id: 'g-gromov-witten-motivation',
    latex: String.raw`\overline M_{g,n}(X,\beta)\ \text{is a Deligne–Mumford stack of expected dim}\ (\dim X-3)(1-g)+\int_\beta c_1`,
    name: 'Gromov–Witten 不变量的动机',
    en: 'Motivation for Gromov–Witten Invariants',
    importance: 0.85,
    family: 'intersect',
    summary: '从"数有理曲线"到稳定映射模空间 —— 一个计数问题如何变成一门理论。',
    detail:
      '起点是具体问题：三维五次超曲面（the quintic）上有多少条有理曲线？Candelas 等人 1991 年用镜像对称给出了 d = 1,2,3 的预测（分别是 2875、609250、317206375），而数学家当时只能算出 d = 1。危机在于：曲线族会退化（曲线可能变形成带奇点的像），所以"计数"没有严格定义。Kontsevich 的想法是用**稳定映射**（stable maps）：允许定义域是带标记点的 nodal 曲线，用一个稳定性条件让模空间仍是紧的、且由有限多个点组成。于是计数问题化为模空间上的积分。这套框架的副产品极多：Gromov–Witten 势、量子上同调、Frobenius 流形、以及 Kontsevich 的 Witten 猜想证明（见 c-kontsevich-formula）。',
  },
  {
    id: 'g-virtual-localization',
    latex: String.raw`\int_{[M]^{\mathrm{vir}}}\alpha=\sum_{F\subset M^T}\int_{[F]^{\mathrm{vir}}}\frac{\alpha|_F}{e(N_F^{\mathrm{vir}})}`,
    name: '虚拟局部化',
    en: 'Virtual Localization',
    importance: 0.84,
    family: 'intersect',
    summary: '在奇异模空间上做局部化 —— 让高亏格与高维 GW 计算成为可能。',
    detail:
      '经典局部化（Atiyah–Bott，见 g-localization）要求模空间光滑。但对 GW 不变量，M̄_{g,n}(X,β) 一般是奇异栈，虚拟基本类不是普通的基本类，所以经典公式不适用。Graber–Pandharipande（以及 Behrend–Fantechi 的虚拟基本类理论）给出了修正形式：把积分展成不动点分支上的积分除以虚拟欧拉类 e(N_F^vir)。这一步是**计算上的解放**：高维射影空间、高亏格的 GW 不变量由此才能算出，也是"用环面作用把几何化为组合"这一技术的完整实现。它后来的发展包括：K-theoretic 局部化、以及应用到 DT 理论与 Vafa–Witten 理论。见 g-localization。',
  },
  {
    id: 'g-localization',
    latex: String.raw`\int_M\alpha=\sum_{p\in M^T}\frac{\alpha|_p}{e_T(T_pM)}`,
    name: 'Atiyah–Bott 局部化',
    en: 'Atiyah–Bott Localization',
    importance: 0.85,
    family: 'intersect',
    summary: '等变积分只依赖不动点 —— 把连续积分变成有限和。',
    detail:
      '若紧流形（或光滑栈）M 带上环面 T 的作用，则等变上同调类的积分可以写成不动点集 M^T 上的有限和，每一项是被积类在不动点处的值除以该点切空间上的等变欧拉类。M^T 是有限集（T 为环面时），所以"积分"变成了"求和" —— 这是几何计算中最有效的技术之一。它成立的原因是等变上同调的局部化定理（Borel、Atiyah–Bott、Berline–Vergne）：等变上同调环的局部化在不动点集之外为零。应用范围极广：Grassmann 簇的 Schubert 计数、Hilbert 概形的积分（与 Gromov–Witten 的 Donaldson–Thomas 对应）、以及超对称指标的计算。见 c-atiyah-bott-fixed。',
  },

  /* ══════════ 二、相交理论的深化 ══════════ */
  {
    id: 'g-virtual-fundamental-class',
    latex: String.raw`[M]^{\mathrm{vir}}\in A_*(M),\qquad \text{of degree}=\operatorname{vdim}`,
    name: '虚拟基本类',
    en: 'Virtual Fundamental Class',
    importance: 0.89,
    family: 'intersect',
    summary: '给奇异模空间一个人造的基本类 —— 让"计数"在奇异情形下也有定义。',
    detail:
      '模空间 M 常常比期望维数更大且奇异（因为形变有障碍），所以它没有普通的基本类，也就无法积分。虚拟基本类的构造（Li–Tian、Behrend–Fantechi、以及 Kresch 的一般化）用模空间的**障碍理论**（一个完美的双项复形，见 c-perfect-complex、c-obstruction）造出一个类 [M]^vir，它的次数是期望维数（vdim = 切空间维数 − 障碍空间维数），并且在 M 光滑时退化为基本类。这是整个现代枚举几何的地基：没有它，GW 不变量、DT 不变量、以及 Gopakumar–Vafa 不变量都无从定义。技术上它与"形变–障碍理论"是同一件事的两面，所以也把模空间理论（见 c-deformation-theory）与计数几何绑在一起。见 c-virtual-fundamental。',
  },
  {
    id: 'g-chow-ring-relations',
    latex: String.raw`A^*(X)\ \text{generated by}\ [Z],\qquad [Z\cap W]=[Z]\cdot[W]\ \text{when transversal}`,
    name: 'Chow 环的关系与计算',
    en: 'Computing in the Chow Ring',
    importance: 0.78,
    family: 'intersect',
    summary: '相交积的实际计算规则 —— 有理等价、横截、以及过分夸大问题的处理。',
    detail:
      'Chow 环（见 chow-ring、b-chow-variety）里两个类的乘积只在**横截**时有明确的几何意义：此时乘积就是交集的类。一般情形需要先把两个闭链移动成横截的，而移动的存在性正是"有理等价"的内容。实际计算中常用的手段有三种：其一，用**过分夸大**（excess intersection）公式处理维数意外变大的交；其二，用局部化把乘积化为不动点上的和；其三，把问题化到已知环上（如射影空间、Grassmann 簇、toric 簇）再拉回。这些技术在现代计数几何里无处不在 —— 每当文献说"由横截性可假设一般位置"，背后用的就是这条。它与 intersection-number、b-intersection-number 是同一主题的不同层次。',
  },
  {
    id: 'g-chern-class-integral',
    latex: String.raw`\int_X c_1(L)^n=\deg L,\qquad \int_X c_n(T_X)=\chi_{\mathrm{top}}(X)`,
    name: 'Chern 类的积分公式',
    en: 'Integrals of Chern Classes',
    importance: 0.80,
    family: 'intersect',
    summary: '把拓扑不变量写成 Chern 类的积分，统一多个经典定理。',
    detail:
      '几个基本恒等式：∫ c₁(L)^n = deg L（线丛的次数就是它的"体积"）；∫ c_n(T_X) = χ_top(X)（Gauss–Bonnet）；∫ ch(F)·td(T_X) = χ(F)（Hirzebruch–Riemann–Roch，见 b-hirzebruch-rr）；∫ Td(T_X) = Todd 亏格（见 b-todd-genus）。这些公式的共同结构是：把**拓扑/全纯不变量**写成**示性类的积分**。它们之所以重要，是因为示性类可以从局部数据计算（联络、曲率、分解成线丛之和），而拓扑不变量一般不能。这条线索贯穿整个相交理论，也是陈类在枚举几何中反复出现的原因：任何一个"计数"最终都会化成一个 Chern 类的积分（Grassmann 簇上的计数就是 c(S)^* 的积分，Hilbert 概形上的计数是 c(T) 的积分）。',
  },
  {
    id: 'g-intersection-toric',
    latex: String.raw`A^*(X_\Sigma)\cong\mathbb Z[x_1,\dots,x_d]/(I_{\mathrm{SR}})`,
    name: 'Toric 簇上的相交理论',
    en: 'Intersection Theory on Toric Varieties',
    importance: 0.76,
    family: 'intersect',
    summary: 'toric 簇的 Chow 环是纯组合的 —— 几何问题化为扇形上的组合学。',
    detail:
      '对 toric 簇 X_Σ（由扇形 Σ 给出），Chow 环有一个显式描述：A^*(X_Σ) ≅ Z[x_1,…,x_d] / (Stanley–Reisner 理想 + 线性关系)，其中 x_i 对应 Σ 的射线。于是相交积变成多项式计算，而且可以用**Brion 定理**或**局部化**把结果表示为扇形上的组合和。更精确的结论由 Danilov–Jurkiewicz 与 Brion 给出，K-理论版本由 Morelli、以及后来的 Payne 与 Katz–Payne 完成。它的意义在于提供了一个"完全可计算"的模型：任何关于相交数的普遍猜想都可以先在 toric 情形检验 —— 这也是为什么 toric 几何在镜像对称、以及 DT/GW 对应的验证中被反复使用。见 c-tropical。',
  },
  {
    id: 'g-k-theoretic-integral',
    latex: String.raw`\chi(X,\mathcal F)=\int_X\operatorname{ch}(\mathcal F)\operatorname{td}(X),\qquad K^0(X)\to A^*(X)\otimes\mathbb Q`,
    name: 'K-理论与相交理论之间的桥',
    en: 'K-Theoretic Integrals',
    importance: 0.79,
    family: 'intersect',
    summary: 'Chern 特征把 K-理论送到 Chow 环 —— K-理论版的不变量由此可言。',
    detail:
      'Chern 特征 ch: K⁰(X) → A^*(X) ⊗ Q 是一个环同态（把张量积变成乘法），于是"层的 Euler 特征"可以写成相交数：χ(F) = ∫ ch(F)·td(X)。这座桥是双向的：一方面它让 K-理论的运算可以用 Chow 环计算（Hirzebruch–Riemann–Roch 正是这个陈述），另一方面它让"K-理论版的不变量"（如 K-theoretic Gromov–Witten、以及 DT 理论的 K-理论提升）有了定义 —— 把 GW 不变量里的 Chow 类换成 K-理论类，得到的量具有更强的结构（例如满足量子 K-理论的结合律）。K-理论局部化（Atiyah–Segal、以及 K-theoretic localization）让这些量同样可以用不动点求和计算。见 c-equivariant-k。',
  },
  {
    id: 'g-multiplicative-genus',
    latex: String.raw`\chi_y(X)=\sum_{p}(-1)^p\chi(X,\Omega^p)\,y^p,\qquad \varphi(x)=\frac{x(1+y)}{1-e^{-x(1+y)}}-xy`,
    name: '乘性亏格与 Hirzebruch 形式',
    en: 'Multiplicative Genera',
    importance: 0.77,
    family: 'intersect',
    summary: 'Hirzebruch 的想法：把"亏格"系统化成一族由幂级数给出的不变量。',
    detail:
      'Hirzebruch 观察到 Todd 亏格、L-亏格、Â-亏格都可以统一写成"把切丛分解成线丛、对每个线丛作用某个幂级数 φ(x)、再取积分"的形式，这类不变量叫**乘性亏格**，φ 是它的特征幂级数（Todd 对应 φ(x) = x/(1−e^{−x})，L 对应 x/tanh x，Â 对应 2x/(1−e^{−2x})…）。这套框架的价值在于：它把"椭圆形亏格"（Ochanine、Witten）与椭圆曲线、模形式联系起来（Witten 猜想，由 Hopkins–Mahowald 与 Bott–Taubes 证明），也把 χ_y-亏格（Hodge 数的多项式）与 Hodge 理论联系起来。它是"用形式幂级数组织不变量"这一思想的完整实现，也是 index theory 与代数几何的交汇点。',
  },

  /* ══════════ 三、映射与纤维化 ══════════ */
  {
    id: 'g-hom-scheme',
    latex: String.raw`\operatorname{Hom}_S(X,Y)(T)=\operatorname{Hom}_T(X\times_S T,\ Y\times_S T)`,
    name: 'Hom 概形',
    en: 'Hom Scheme',
    importance: 0.83,
    family: 'map',
    summary: '态射的空间本身是一个概形 —— "映射的模空间"最朴素的例子。',
    detail:
      'Hom_S(X, Y) 表示从 X 到 Y 的 S-态射构成的函子，在 X 射影、Y 拟射影时它可表（由 Grothendieck 的存在性定理，用 Hilbert 概形与图嵌入实现）。它给"研究映射"这件事一个几何框架：一个映射的形变就是 Hom 概形上的切向量（切空间是 H⁰(X, f*T_Y)，障碍在 H¹），所以映射的局部理论完全由上同调给出。它也是人们谈论"一般映射长什么样"的地方：维数估计、满射性、以及分支轨迹的维数都由 Hom 概形的几何给出。它的粗糙之处在于没有把"同样的映射"（差一个源或靶的自同构）粘起来，于是有了 stacks（见 stack）与 Quot/Hilbert 概形这些改进。',
  },
  {
    id: 'g-birational-morphism-decomposition',
    latex: String.raw`f\colon X\to Y\ \text{birational}\ \Longrightarrow\ f\ \text{factors into blowups of smooth centers}`,
    name: '双有理态射的分解',
    en: 'Factorization of Birational Morphisms',
    importance: 0.81,
    family: 'map',
    summary: '一个双有理态射可以被拆成一串 blowup —— 弱分解定理的原始形式。',
    detail:
      'Zariski 的原始问题：给定两个光滑簇之间的双有理态射 f: X → Y，它能否分解成有限多个"沿光滑中心做 blowup 或 blowdown"的复合？这在曲面由 Zariski 与 Abhyankar 解决（用典范除子的线性系统方法），高维长期开放。答案是**是**（Abramovich–Karu–Matsuki–Włodarczyk 2002，见 f-weak-factorization），且证明的核心思想是把问题化到曲面的情形：用纤维化把它降到相对维数 1，在曲线情形用古典结果，再逐步抬回。它的意义是把"双有理"这个抽象关系具体化，从而让任何双有理不变量只需在单次 blowup 下验证。这条思路在 motivic 积分与 Cremona 群的研究中被反复使用。',
  },
  {
    id: 'g-fibration-construction',
    latex: String.raw`f\colon X\to B\ \text{with}\ f_*\mathcal O_X=\mathcal O_B,\ \text{general fiber connected}`,
    name: '纤维化的构造与判别',
    en: 'Constructing and Detecting Fibrations',
    importance: 0.74,
    family: 'map',
    summary: '怎么造一个纤维化、怎么判断一个态射是纤维化 —— 分类里最常用的两项操作。',
    detail:
      '构造纤维化的标准手段：取一个线丛的线性系统（或一般多重典范系统）诱导的有理映射，然后取它的 Stein 分解与正规化，得到态射 X → B。判别一个态射是否是纤维化（即一般纤维连通、基维数等于 dim X − dim F）：只需检查 f_*O_X = O_B（连通性）与 dim B 正确。这些操作在实践中决定了分类的路径 —— 例如 Iitaka 纤维化（见 f-iitaka-fibration）是把 κ 归约的关键、而 Mori 纤维空间（见 f-mori-fiber-space）是把 Fano 结构提取出来的手段。与之配套的是"相对极小模型"与"相对丰饶性"，它们保证纤维化的构造不会半途退化。',
  },
  {
    id: 'g-separated-proper-diagonal',
    latex: String.raw`\Delta\colon X\to X\times_SX\ \text{closed}\ (\text{separated}),\qquad \text{universally closed}\equiv\text{proper}`,
    name: '分离与真性作为对角态射的条件',
    en: 'Separatedness and Properness via the Diagonal',
    importance: 0.72,
    family: 'map',
    summary: '把几何性质化为对角态射的闭性与紧性 —— 概形论最漂亮的重述之一。',
    detail:
      '两条经典的重述：X → S **分离** 当且仅当对角态射 Δ: X → X ×_S X 是闭浸入（直觉：极限点是唯一的）；X → S **真**（proper）当且仅当它是分离的、有限型的、且泛闭的（universally closed，直觉：纤维紧致且极限点存在）。这类"把性质化为对角/泛性质"的做法是概形论的特征风格：它把一个关于"点、序列、收敛"的陈述换成一个纯范畴的陈述，因此可以脱离拓扑空间的语言工作。它的实用价值在于验证：证明一个映射是真态射时，用赋值判别法（valuative criterion，见 valuative-criterion）比直接验证更省力，而赋值判别法本身正是"泛闭性"的具体化。见 separated-morphism、proper-morphism。',
  },
  {
    id: 'g-stein-factorization-technique',
    latex: String.raw`X\xrightarrow{f}Y,\qquad f=\ \text{Stein}\circ(\text{quasi-finite})`,
    name: 'Stein 分解的应用',
    en: 'Applications of Stein Factorization',
    importance: 0.71,
    family: 'map',
    summary: '把任意真态射拆成"纤维连通 + 有限"两步 —— 分类与形变中的标准手法。',
    detail:
      'Stein 分解（见 a-stein-factorization、h-stein-factorization）把真态射 f 写成 X → Y′ → Y，其中第一步的纤维连通、第二步有限。它的用途在于**分离两种不同的困难**：纤维连通的态射（几何困难）与有限态射（代数困难，可以用正规化与域扩张处理）。实践中的三个常见应用：其一，证明某个映射的纤维连通（只需检查 O_Y → f_*O_X 是同构）；其二，构造纤维化（先得连通纤维，再用分解取基）；其三，控制退化（有限部分携带的是整扩张信息，与分支轨迹相关）。它是那种"不显眼但每次遇到都省一半力气"的技术。',
  },
  {
    id: 'g-quot-scheme',
    latex: String.raw`\operatorname{Quot}_{\mathcal F/X/S}\colon T\mapsto\{\text{quotients of}\ \mathcal F_T\ \text{flat over}\ T\}`,
    name: 'Quot 概形',
    en: 'Quot Scheme',
    importance: 0.82,
    family: 'map',
    summary: '层商的模空间 —— Hilbert 概形、以及一切"子对象模空间"的来源。',
    detail:
      'Grothendieck 的 Quot 概形参数化一个凝聚层 F 的所有平坦商（带固定的 Hilbert 多项式）。取 F = O_X 并限制到"由理想层给出的商"，就得到 Hilbert 概形（见 hilbert-scheme、c-hilbert-scheme-points）；取不同的 F 与不同的多项式的限制，得到旗概形、以及各种子簇的参数空间。它是"用可表函子造模空间"这一范式的第一个伟大胜利：把"几何对象的族"变成"函子的可表性"，从而由抽象的存在性定理自动得到概形结构。后来的一切模空间构造（GIT 商、稳定映射的模空间、以及 stacks）都沿着这条路线，区别只在于是否需要额外数据（标记点、稳定性条件）来排除退化。',
  },
  {
    id: 'g-blowup-along-ideal',
    latex: String.raw`\operatorname{Bl}_I X=\operatorname{Proj}_X\bigoplus_{d\ge 0}I^d`,
    name: '沿理想层的 blowup',
    en: 'Blowup along an Ideal Sheaf',
    importance: 0.79,
    family: 'map',
    summary: '把 blowup 从沿子簇推广到沿任意理想层。',
    detail:
      '经典 blowup 沿一个闭子簇 Z ⊂ X（即沿它的理想层 I_Z），构造是取 Rees 代数 ⊕I^d 的 Proj。推广到任意理想层 I 之后，就有了几个必需的自由度：其一，可以把 I 取成"接近奇点"的理想，从而沿比子簇更精细的对象爆开（Hironaka 的消解证明需要沿"允许的理想"逐步爆，而不仅是闭子簇）；其二，可以对**对数**情形处理（边界也要被允许爆开）；其三，可以处理非既约的或非约化的中心。它的性质与经典情形一致：Bl_I X → X 是双有理的、在 I 局部主生成处是同构、且例外除子与 I 的"零点"相关。这条推广是消解与 MMP 的技术基础。',
  },
  {
    id: 'g-normalization-technique',
    latex: String.raw`\nu\colon X^\nu\to X\ \text{finite, birational},\ \mathcal O_{X^\nu}=\text{integral closure}`,
    name: '正规化作为工具',
    en: 'Normalization as a Tool',
    importance: 0.73,
    family: 'map',
    summary: '取整闭包消去非正规性 —— 造纤维化、控制边界、以及定义对数结构的常用步。',
    detail:
      '正规化把 X 换成它的整闭包 X^ν，得到有限双有理映射 ν: X^ν → X，且 X^ν 正规。它在实践中扮演两个角色：其一是**清理构造**的产物 —— 用线性系统造出的纤维化最初只有有理映射，取图、正规化、再取 Stein 分解才得到一个干净的态射（这条流水线在 Iitaka 纤维化与典范模型的构造中反复出现）；其二是**定义对数结构** —— log canonical 与 dlt 的定义要求边界是既约的、且中心正规，这些都要靠正规化与"取既约结构"来达成（dlt 修正定理，见 f-dlt-model）。它的技术配套是"有限态射的上同调控制"（ν_* 精确）与"整扩张下维数不变"。见 normalization。',
  },
  {
    id: 'g-relative-ample',
    latex: String.raw`L\ \text{is}\ f\text{-ample}\iff \exists\,m>0:\ f^*f_*L^m\to L^m\ \text{surjective}`,
    name: '相对丰饶性与相对射影态射',
    en: 'Relative Ampleness',
    importance: 0.80,
    family: 'map',
    summary: '"相对于基空间足够正"的定义与判别 —— 一切族与模空间讨论的前提。',
    detail:
      '相对丰饶（f-ample）的定义是：某个正倍数 L^m 由 f 的推前拉回满射给出（等价地，X 能嵌入到 P(f_*L^m) 里）。它是"绝对丰饶"的相对化，也是**相对射影**的判据：f 是射影态射当且仅当存在 f-丰饶线丛。为什么必须要有相对版本？因为在族里面"正"是相对于基说的：同一个线丛在不同的纤维上可以很不一样，只有相对丰饶才保证它在整个族上一致地给出嵌入。它的技术配套包括 Nakai–Moishezon 的相对判据（见 b-nakai-surface、nakai-moishezon）、以及"丰饶性在拉回下保持"这类函子性。整个 MMP 与模空间理论都在相对框架下工作。',
  },
  {
    id: 'g-rational-map-resolution',
    latex: String.raw`\phi\colon X\dashrightarrow Y\ \Longrightarrow\ \exists\,\pi\colon X'\to X\ \text{with}\ \phi\circ\pi\ \text{a morphism}`,
    name: '有理映射的消解',
    en: 'Resolution of Rational Maps',
    importance: 0.78,
    family: 'map',
    summary: '把"在某处没定义"的映射补成真正的态射 —— 消解定理最常用的推论。',
    detail:
      '有理映射不定义的点（indeterminacy locus）的清除有两种方案：一是取**图** Γ_φ ⊂ X × Y 的闭包再投到 X（得到双有理态射 X′ → X），二是用 blowup 沿不定义点爆开（Hironaka 消解保证可以得到光滑的 X′）。两种做法给出"消解有理映射"的标准定理：存在一串 blowup（中心光滑、与已给的子簇相容）使复合成为态射。它的用途遍布：把有理映射的度、分支、以及拉回定义清楚（不然只能谈一般点处的行为）；构造纤维化（先造有理映射再消解，见 g-fibration-construction）；以及证明"双有理映射在光滑情形总可以分解"。它也是"不定义点有多大"这一问题（如 Cremona 变换的不定义点）的技术前提。',
  },
]

/**
 * 连接。G 批的图结构围绕三条"可计算性"线索组织：
 *  ① 计数链：枚举不变量 → 虚拟基本类 → 局部化 → 形变不变性；
 *  ② 相交计算的工具箱：Chow 关系、Chern 积分、toric、K-理论桥；
 *  ③ 映射的构造与判别：Hom/Quot、纤维化、blowup、正规化、相对丰饶。
 * 三条线索之间用少量高权重边相连（虚拟基本类 ↔ 形变–障碍、
 * 局部化 ↔ K-理论局部化），使整片在主星系里成为一个连通核心。
 */
export const EXTRA_G_LINKS = [
  /* ── 计数链 ── */
  ['g-enumerative-invariant', 'g-virtual-fundamental-class', 0.95, '枚举不变量的定义依赖虚拟基本类', 'depends'],
  ['g-enumerative-invariant', 'g-gromov-witten-motivation', 0.92, '两者的动机与框架完全一致', 'sameFamily'],
  ['g-enumerative-invariant', 'g-deformation-invariance', 0.90, '定义成积分正是为了保证形变不变', 'property'],
  ['g-enumerative-invariant', 'intersection-number', 0.88, '"个数"最终被定义为相交数', 'defines'],
  ['g-enumerative-invariant', 'c-gw-invariants', 0.94, '主库 GW 不变量条目', 'provenance'],
  ['g-gromov-witten-motivation', 'c-gw-invariants', 0.93, '与主库条目讲同一套框架的来历', 'provenance'],
  ['g-gromov-witten-motivation', 'c-deligne-mumford', 0.85, '稳定映射的靶空间是 DM 栈', 'related'],
  ['g-gromov-witten-motivation', 'c-quantum-cohomology', 0.88, '动机的直接产物是量子上同调', 'computes'],
  ['g-gromov-witten-motivation', 'c-mirror-map', 0.82, '五次超曲面的计数是镜像对称的起点', 'related'],
  ['g-virtual-fundamental-class', 'c-virtual-fundamental', 0.96, '与主库虚拟基本类条目互补', 'provenance'],
  ['g-virtual-fundamental-class', 'c-perfect-complex', 0.90, '虚拟基本类由完美复形（障碍理论）造出', 'computes'],
  ['g-virtual-fundamental-class', 'c-obstruction', 0.88, '障碍空间决定虚拟维数', 'defines'],
  ['g-virtual-fundamental-class', 'c-deformation-theory', 0.86, '形变–障碍理论是构造的输入', 'depends'],
  ['g-virtual-fundamental-class', 'g-localization', 0.78, '有了虚拟类才能谈在奇异模空间上积分', 'depends'],
  ['g-deformation-invariance', 'g-localization', 0.84, '局部化是形变不变性的计算实现', 'computes'],
  ['g-deformation-invariance', 'g-virtual-localization', 0.86, '虚拟局部化保证奇异情形也不变', 'property'],
  ['g-deformation-invariance', 'c-dt-theory', 0.74, 'DT 不变量同样依赖形变不变性', 'depends'],
  ['g-localization', 'c-atiyah-bott-fixed', 0.96, '与主库 Atiyah–Bott 条目是同一技术', 'provenance'],
  ['g-localization', 'g-virtual-localization', 0.93, '虚拟局部化是经典局部化的奇异推广', 'generalizes'],
  ['g-localization', 'b-localization', 0.90, '主库局部化条目', 'provenance'],
  ['g-localization', 'c-equivariant-k', 0.82, '等变 K-理论的局部化是同一原理', 'equivalent'],
  ['g-localization', 'g-intersection-toric', 0.76, 'toric 簇上的积分正是用不动点求和', 'computes'],
  ['g-virtual-localization', 'c-virtual-fundamental', 0.88, '虚拟局部化必须在虚拟基本类上做', 'depends'],
  ['g-virtual-localization', 'g-k-theoretic-integral', 0.70, 'K-理论局部化是平行技术', 'analogy'],
  ['g-quantum-cohomology-ring', 'c-quantum-cohomology', 0.95, '与主库量子上同调条目互补', 'provenance'],
  ['g-quantum-cohomology-ring', 'c-wdvv', 0.92, '结合律正是 WDVV 方程', 'equivalent'],
  ['g-quantum-cohomology-ring', 'c-gw-invariants', 0.90, '结构常数就是三点 GW 不变量', 'equivalent'],
  ['g-quantum-cohomology-ring', 'c-mirror-map', 0.88, '镜像映射在量子环上有显式形式', 'related'],
  ['g-quantum-cohomology-ring', 'g-enumerative-invariant', 0.84, '环的乘法由计数给出', 'computes'],
  ['g-quantum-cohomology-ring', 'c-hms', 0.80, '同调镜像对称在量子环层面化为同构', 'equivalent'],
  ['g-schubert-calculus', 'g-schubert-variety', 0.92, '演算的基正是 Schubert 簇的类', 'equivalent'],
  ['g-schubert-calculus', 'b-grassmannian', 0.90, 'Grassmann 簇是演算的舞台', 'related'],
  ['g-schubert-calculus', 'b-splitting-principle', 0.80, '演算的推导常用分裂原理', 'depends'],
  ['g-schubert-calculus', 'g-localization', 0.82, 'Schubert 计数可用局部化重算', 'computes'],
  ['g-schubert-calculus', 'g-chow-ring-relations', 0.78, '演算就是 Chow 环里的一种计算', 'computes'],
  ['g-schubert-variety', 'g-localization', 0.74, '不动点集给出 Schubert 胞腔分解', 'computes'],
  ['g-schubert-variety', 'cn-kazhdan-lusztig', 0.85, 'Schubert 簇的相交上同调正是那条猜想的来源', 'provenance'],
  ['g-schubert-variety', 'c-perverse', 0.78, 'Schubert 簇上的反常层是表示论的几何载体', 'related'],
  ['g-schubert-variety', 'b-grassmannian', 0.88, '旗簇与 Grassmann 簇上的 Schubert 簇', 'related'],
  /* ── 相交理论的工具箱 ── */
  ['g-chow-ring-relations', 'chow-ring', 0.94, '主库 Chow 环条目讲定义，这里讲计算', 'provenance'],
  ['g-chow-ring-relations', 'b-chow-variety', 0.90, 'Chow 簇是 Chow 环的几何载体', 'related'],
  ['g-chow-ring-relations', 'intersection-number', 0.88, '乘积的几何意义就是相交数', 'equivalent'],
  ['g-chow-ring-relations', 'g-chern-class-integral', 0.82, 'Chern 类的积分是相交积的常见形式', 'related'],
  ['g-chow-ring-relations', 'g-virtual-fundamental-class', 0.76, '奇异空间需要虚拟类才能做相交积', 'depends'],
  ['g-chern-class-integral', 'chern-class', 0.92, '主库 Chern 类条目', 'provenance'],
  ['g-chern-class-integral', 'b-hirzebruch-rr', 0.90, 'Hirzebruch–Riemann–Roch 是核心恒等式', 'related'],
  ['g-chern-class-integral', 'b-todd-genus', 0.86, 'Todd 亏格是 Td 类的积分', 'defines'],
  ['g-chern-class-integral', 'b-chern-weil', 0.84, 'Chern–Weil 理论给出用曲率计算的方法', 'computes'],
  ['g-chern-class-integral', 'euler-characteristic', 0.82, 'Gauss–Bonnet 把 Euler 数写成积分', 'computes'],
  ['g-chern-class-integral', 'g-multiplicative-genus', 0.86, '乘性亏格就是 Chern 类积分的系统化', 'equivalent'],
  ['g-intersection-toric', 'c-tropical', 0.82, 'toric 几何的现代延伸是热带几何', 'generalizes'],
  ['g-intersection-toric', 'b-projective-bundle', 0.66, '射影丛上的相交计算是 toric 之外的样板', 'related'],
  ['g-intersection-toric', 'g-virtual-fundamental-class', 0.62, 'toric 情形是检验虚拟类猜想的试验场', 'related'],
  ['g-intersection-toric', 'cone-theorem', 0.58, '扇形与锥的对应是 toric 理论的核心', 'analogy'],
  ['g-intersection-toric', 'b-mori-cone', 0.60, 'toric 情形下 Mori 锥可以完全算出', 'computes'],
  ['g-k-theoretic-integral', 'k-theory', 0.94, '主库 K-理论条目', 'provenance'],
  ['g-k-theoretic-integral', 'riemann-roch', 0.92, 'Riemann–Roch 正是这座桥的原始形式', 'equivalent'],
  ['g-k-theoretic-integral', 'b-chern-class-axioms', 0.84, 'Chern 特征的构造依赖 Chern 类的公理', 'depends'],
  ['g-k-theoretic-integral', 'c-equivariant-k', 0.82, '等变 K-理论的积分同样由局部化计算', 'computes'],
  ['g-k-theoretic-integral', 'c-dt-theory', 0.76, 'DT 理论的 K-理论提升（K-theoretic DT）', 'related'],
  ['g-k-theoretic-integral', 'g-quantum-cohomology-ring', 0.74, '量子 K-理论是量子上同调的 K-理论版', 'generalizes'],
  ['g-multiplicative-genus', 'b-todd-genus', 0.90, 'Todd 亏格是乘性亏格的原型', 'generalizes'],
  ['g-multiplicative-genus', 'todd-class', 0.86, '特征幂级数由 Todd 类给出', 'computes'],
  ['g-multiplicative-genus', 'c-hirzebruch-signature', 0.84, 'Hirzebruch 签名定理是 L-亏格的陈述', 'related'],
  ['g-multiplicative-genus', 'c-cobordism', 0.80, '乘性亏格与协边环的环同态一一对应', 'equivalent'],
  ['g-multiplicative-genus', 'c-atiyah-singer', 0.74, '指标定理是乘性亏格的分析解释', 'related'],
  ['g-multiplicative-genus', 'hodge-theory', 0.76, 'χ_y-亏格把 Hodge 数打包成多项式', 'computes'],
  /* ── 映射的构造与判别 ── */
  ['g-hom-scheme', 'g-quot-scheme', 0.88, '两者都是可表函子造模空间的范例', 'sameFamily'],
  ['g-hom-scheme', 'hilbert-scheme', 0.86, 'Hom 概形的存在性由 Hilbert 概形推出', 'implies'],
  ['g-hom-scheme', 'representable-functor', 0.90, 'Hom 概形是可表函子理论的样板', 'related'],
  ['g-hom-scheme', 'c-deformation-theory', 0.78, '映射的形变由 H⁰(X, f*T_Y) 控制', 'defines'],
  ['g-hom-scheme', 'stack', 0.72, '粘掉自同构之后就得到映射栈', 'computes'],
  ['g-quot-scheme', 'hilbert-scheme', 0.94, 'Hilbert 概形是 Quot 的特例', 'generalizes'],
  ['g-quot-scheme', 'representable-functor', 0.88, 'Quot 函子的可表性是存在性定理的内容', 'related'],
  ['g-quot-scheme', 'c-hilbert-scheme-points', 0.84, '点 Hilbert 概形是 Quot 的具体情形', 'generalizes'],
  ['g-quot-scheme', 'b-grothendieck-quot', 0.92, '主库 Grothendieck Quot 条目', 'provenance'],
  ['g-quot-scheme', 'c-stack-quotient', 0.74, '商栈是 Quot 构造在群作用下的版本', 'generalizes'],
  ['g-blowup-along-ideal', 'blowup', 0.94, '主库 blowup 条目讲沿子簇，这里讲沿理想', 'provenance'],
  ['g-blowup-along-ideal', 'b-blowup-local', 0.86, '局部 blowup 的显式描述', 'related'],
  ['g-blowup-along-ideal', 'b-blowup-surface', 0.84, '曲面上的 blowup 是最经典的情形', 'generalizes'],
  ['g-blowup-along-ideal', 'f-strong-resolution', 0.82, '消解证明需要沿允许的理想爆开', 'depends'],
  ['g-blowup-along-ideal', 'rees-algebra', 0.78, 'Rees 代数是 blowup 的代数核心', 'related'],
  ['g-normalization-technique', 'normalization', 0.95, '主库正规化条目', 'provenance'],
  ['g-normalization-technique', 'f-dlt-model', 0.80, 'dlt 修正定理需要正规化与取既约结构', 'depends'],
  ['g-normalization-technique', 'g-fibration-construction', 0.84, '纤维化的构造流水线以正规化收尾', 'related'],
  ['g-normalization-technique', 'a-integral-closure', 0.86, '整闭包是正规化的代数内容', 'equivalent'],
  ['g-normalization-technique', 'a-stein-factorization', 0.70, '正规化与 Stein 分解配合使用', 'related'],
  ['g-stein-factorization-technique', 'a-stein-factorization', 0.96, '主库 Stein 分解条目', 'provenance'],
  ['g-stein-factorization-technique', 'h-stein-factorization', 0.94, '高维批的 Stein 分解条目', 'provenance'],
  ['g-stein-factorization-technique', 'g-fibration-construction', 0.88, '纤维化的构造以 Stein 分解为一步', 'related'],
  ['g-stein-factorization-technique', 'proper-morphism', 0.76, '分解定理要求态射是真态射', 'depends'],
  ['g-separated-proper-diagonal', 'separated-morphism', 0.95, '主库分离态射条目', 'provenance'],
  ['g-separated-proper-diagonal', 'proper-morphism', 0.93, '主库真态射条目', 'provenance'],
  ['g-separated-proper-diagonal', 'valuative-criterion', 0.90, '赋值判别法是验证真性的常用手段', 'related'],
  ['g-separated-proper-diagonal', 'h-separated-diagonal', 0.92, '高维批的对角态射条目', 'provenance'],
  ['g-separated-proper-diagonal', 'fibred-product', 0.78, '对角态射的定义用纤维积', 'defines'],
  ['g-relative-ample', 'a-ample', 0.94, '主库丰饶性条目讲绝对情形', 'provenance'],
  ['g-relative-ample', 'nakai-moishezon', 0.86, 'Nakai–Moishezon 的相对判据', 'related'],
  ['g-relative-ample', 'b-nakai-surface', 0.82, '曲面上的丰饶性判据', 'related'],
  ['g-relative-ample', 'ample-line-bundle', 0.88, '相对丰饶与绝对丰饶的关系', 'related'],
  ['g-relative-ample', 'g-fibration-construction', 0.78, '相对射影性使纤维化的构造可行', 'related'],
  ['g-birational-morphism-decomposition', 'f-weak-factorization', 0.95, '这就是弱分解定理的原始形式', 'equivalent'],
  ['g-birational-morphism-decomposition', 'c-weak-factorization', 0.92, '主库弱分解条目', 'provenance'],
  ['g-birational-morphism-decomposition', 'g-rational-map-resolution', 0.84, '把一个有理映射化开是分解的第一步', 'related'],
  ['g-birational-morphism-decomposition', 'resolution', 0.82, '分解的每一步都需要消解', 'depends'],
  ['g-fibration-construction', 'f-iitaka-fibration', 0.90, 'Iitaka 纤维化是最重要的纤维化构造', 'related'],
  ['g-fibration-construction', 'iitaka-fibration', 0.74, '与主库纤维化条目的构造部分对应', 'provenance'],
  ['g-fibration-construction', 'h-kodaira-dimension-compute', 0.72, 'Kodaira 维数的计算依赖纤维化的构造', 'depends'],
  ['g-rational-map-resolution', 'resolution', 0.90, '消解定理的直接推论', 'implies'],
  ['g-rational-map-resolution', 'g-blowup-along-ideal', 0.86, '消解有理映射用的就是沿理想 blowup', 'equivalent'],
  ['g-rational-map-resolution', 'rational-map', 0.94, '主库有理映射条目', 'provenance'],
  ['g-rational-map-resolution', 'c-hironaka', 0.88, 'Hironaka 消解保证可以取光滑的 X′', 'property'],
  ['g-rational-map-resolution', 'c-alterations', 0.70, '正特征里只能取 alteration 代替', 'related'],
]

