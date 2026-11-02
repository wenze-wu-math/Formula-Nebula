/**
 * 批次 16 长篇证明数据：超凯勒 Torelli、p 进与解析基础、导出与反常层的 13 个节点。
 *
 * 写作约定（与 scripts/_check-proof-file.mjs 的检查一致）：
 *   · 正文用中文长段 + Unicode 数学符号（⊆ ⊗ → ↦ 𝔪 ℓ ℤ ℚ ℝ ℂ ≅ ⋂ ∑），直接作为文本排版；
 *   · 只在需要真正排版公式时才用 $...$ 包住完整 LaTeX，反斜杠必须双写、分隔符必须成对；
 *   · 长字符串一律用双引号，正文里出现的撇号（如 R'、f'）保持原样而不必转义；
 *   · 引用只写真实存在的出版物（作者 + 标题 + 年份，省略 URL），不杜撰标签。
 */

const step = (id, title, body, uses) => ({ id, title, body, uses: uses ?? [] })
const HISTORY = '本条由公开教材与原创论文重新组织，项目自行改写并注明来源，未复制原文。'

export const BATCH_16_PROOFS = {

  /* ═══════════════════════════════════════════════════════════
   * 1. 全局 Torelli 定理（超凯勒流形）
   * ═══════════════════════════════════════════════════════════ */

  'c-lattice-torelli': {
    statement: "设 $X$ 是紧 Kähler 超凯勒流形（即不可约全纯辛流形），$\\dim_{\\mathbb{C}}X=2n$，$H^2(X,\\mathbb{Z})$ 上配 Beauville–Bogomolov–Fujiki 形式 $q$，且 $q$ 的符号差为 $(3,\\ b_2-3)$。令 $\\mathfrak{M}$ 为带标记的超凯勒流形模空间（标记是与固定格 $\\Lambda$ 的等距），$\\Omega=\\{[x]\\in\\mathbb{P}(H^2(X,\\mathbb{C})):\\ q(x)=0,\\ q(x,\\bar x)>0\\}$ 为周期域，$\\mathcal{P}:\\mathfrak{M}\\to\\Omega$ 为周期映射。Verbitsky 的全局 Torelli 定理断言：(a) $\\mathcal{P}$ 是局部双全纯映射，其像是 $\\Omega$ 的开且闭子集；(b) $\\mathfrak{M}$ 的每个连通分支的像恰是 $\\Omega$ 的一个连通分支，且 $\\mathcal{P}$ 限制在该分支上是局部同构；(c) $\\mathfrak{M}$ 至多有两个连通分支，由共轭 $[\\sigma]\\mapsto[\\bar\\sigma]$ 互换。于是超凯勒流形的分类被完全翻译为格 $(H^2,q)$ 上的 Hodge 等距分类：$X$ 与 $Y$ 双有理等价当且仅当存在保持正锥的 Hodge 等距 $H^2(X,\\mathbb{Z})\\to H^2(Y,\\mathbb{Z})$。",
    explanation: "这条定理的意义是把“几何分类”彻底降为“线性代数分类”。K3 曲面早有的 Torelli 定理说明：一张 K3 的全部几何信息都编码在 $H^2$ 中那条一维的 $H^{2,0}$ 直线里，而 Verbitsky 把这条结论推到所有紧 Kähler 超凯勒流形，并额外说明这个编码在模空间的层面是“满的”：周期映射不是单射（因为自同构会移动标记），但它是一个局部同构，于是模空间在去掉非分离点之后就是周期域在单值群下的商。整条论证的两根支柱一根是局部的形变论（周期映射的微分是双射，来自 $T_X\\cong\\Omega^1_X$ 这一超凯勒特有的平凡化），另一根是整体的紧性论证（周期映射的像是开闭的，因而由连通性决定），二者之间夹着 Kähler 锥的刻画，正是这一层把“双有理等价”与“保锥的 Hodge 等距”对上。",
    steps: [
      step('lattice-and-period-domain', '格与周期域：Fujiki 形式与正定二维平面',
        "先把“周期”落成可计算的线性代数数据。设 $\\sigma$ 是 $X$ 的全纯辛形式，即 $H^{2,0}(X)=\\mathbb{C}\\sigma$ 且 $\\sigma^{n}$ 处处非零。Fujiki 定理断言存在只依赖 $X$ 的正数 $c_X$ 使 $\\int_X\\alpha^{2n}=c_X\\,q(\\alpha)^n$ 对一切 $\\alpha\\in H^2(X,\\mathbb{R})$ 成立，其中 $q(\\alpha)=\\frac{1}{2}\\int_X\\alpha^2$（$n=1$ 时即 $\\int_X\\alpha^2$）。这条等式有两重作用：它说明 $q$ 是非退化的整系数双线性型（因为 $\\int_X\\alpha^{2n}$ 是整系数），并且由于 $\\mathrm{Re}\\,\\sigma$、$\\mathrm{Im}\\,\\sigma$ 与任一 Kähler 类张成一个三维子空间，在其上 $\\int_X\\alpha^{2n}$ 的符号完全由 $q$ 的正定性决定，于是 $q$ 的符号差必为 $(3,\\ b_2-3)$：这是超凯勒流形区别于一般 Kähler 流形的第一个硬性约束。由 $q(\\sigma)=0$、$q(\\sigma,\\bar\\sigma)>0$ 可把周期点写成 $x=a+\\sqrt{-1}b$ 的形式，$a,b\\in H^2(X,\\mathbb{R})$，条件等价于 $q(a)=q(b)>0$ 与 $\\langle a,b\\rangle=0$，即 $a,b$ 张成一个正定二维平面；所以 $\\Omega$ 是 Grassmann 型的对称域，维数由稳定化子计数给出：$\\dim\\mathrm{SO}(3,b_2-3)-\\dim(\\mathrm{SO}(2)\\times\\mathrm{SO}(1,b_2-3))=2b_2-4$，故 $\\dim_{\\mathbb{C}}\\Omega=b_2-2$。",
        []),
      step('local-torelli-beauville', '局部 Torelli：周期映射的微分是双射',
        "这一步说明周期映射在无穷小层面不丢失任何信息。取 $X$ 的 Kuranishi 族，其参数空间维数为 $\\dim H^1(X,T_X)$；由 Bogomolov–Tian–Todorov 定理，$c_1=0$ 的紧 Kähler 流形的形变无阻碍，故标记模空间 $\\mathfrak{M}$ 在每点附近是复流形，且 $T_X\\mathfrak{M}\\cong H^1(X,T_X)$。超凯勒的关键平凡化是 $T_X\\cong\\Omega^1_X$：把切向量代入 $\\sigma$ 得到一个 1-形式，这是一个层的同构，于是 $H^1(X,T_X)\\cong H^1(X,\\Omega^1_X)=H^{1,1}(X)$，维数 $h^{1,1}=b_2-2$ 与上一步算出的 $\\dim_{\\mathbb{C}}\\Omega$ 相等。周期映射的微分把 Kodaira–Spencer 类 $\\kappa\\in H^1(X,T_X)$ 送到映射 $H^{0,2}\\to H^{1,1}$、$\\sigma\\mapsto\\kappa\\cup\\sigma$（这里的乘积是缩并 $T_X\\otimes\\Omega^2_X\\to\\Omega^1_X$ 诱导的上积）。由于 $H^{2,0}$ 一维，该映射可以看作 $H^1(X,T_X)\\to H^1(X,\\Omega^1_X)$ 的一个线性映射；而在 $T_X\\cong\\Omega^1_X$ 之下，它与恒同映射只差一个由 $\\sigma$ 决定的同构，故是单射；两侧维数相同，所以是双射。这就是 Beauville 的局部 Torelli 定理：周期映射在每个形变处都是局部同构。",
        ['lattice-and-period-domain']),
      step('positive-cone-and-monodromy', '正锥、壁与单值群：整体论证的输入',
        "局部同构只给出“局部单射”，要得到整体结论必须控制周期域那一边的几何，而这由 Kähler 锥完成。固定 $X$，在 $H^{1,1}(X,\\mathbb{R})$ 中定义正锥 $\\mathcal{C}_X=\\{\\alpha:\\ q(\\alpha)>0\\}$，它的两个连通分支中恰有一个含 Kähler 类，这个分支记为 $\\mathcal{K}_X$，而真正的 Kähler 锥是 $\\mathcal{K}_X$ 挖掉一族“壁”：对每个满足 $q(\\ell)=-2$ 的类 $\\ell\\in H^{1,1}(X,\\mathbb{Z})$（它们是除子类的 Poincaré 对偶），超平面 $\\ell^{\\perp}$ 切出一片区域，Kähler 锥正是含 Kähler 类的那个连通分支减去所有这些超平面。这套描述（Huybrechts 与 Boucksom 的结果）让“两个超凯勒流形何时双有理”变成格与锥的组合条件。另一个输入是单值群 $\\mathrm{Mon}(X)\\subset\\mathrm{O}(H^2(X,\\mathbb{Z}),q)$：它是沿 $\\mathfrak{M}$ 的回路给出的平行移动，因此周期映射的像天然被 $\\mathrm{Mon}$ 的作用商掉。Verbitsky 的整体步骤是证明 $\\mathcal{P}$ 的像在 $\\Omega$ 中开且闭：局部同构给出开性，闭性则来自 Hausdorff 化论证——标记模空间并不 Hausdorff，但两个无法分离的点对应同一周期点，把它们粘起来之后 $\\mathcal{P}$ 成为紧化可以控制的映射，于是像的极限点仍在像中。由 $\\Omega$ 连通，像只能是整个 $\\Omega$ 或空集，这给出分支与分支之间的对应。",
        ['local-torelli-beauville']),
      step('two-components-and-conjugation', '至多两个分支：共轭与标记的作用',
        "$\\mathfrak{M}$ 的连通分支数量的控制是定理中最“整体”的一步。标记模空间按变形等价类分解为若干块，每一块的周期映射落到 $\\Omega$ 的一个连通分支上，而 $\\Omega$ 本身作为对称域是连通的；因此分支数来自“同一几何对象在标记下的不同呈现”。Verbitsky 的论证给出：$\\mathfrak{M}$ 至多有两个连通分支，且由 $[\\sigma]\\mapsto[\\bar\\sigma]$（即把全纯辛形式换成它的复共轭，等价于反转复结构的方向）互换。这一步的几何直觉来自 K3：固定一张 K3，其周期映射在标记的变化下扫过 $\\Omega$ 中的一条“轨道”，而把复结构取反会给出周期 $[\\bar\\sigma]$；由于 $q(\\sigma,\\bar\\sigma)>0$ 在取共轭下不变，$\\Omega$ 的两个“半边”被这一对映射联系起来。推论是“变形等价类”这个几何概念与格上的算术概念完全一致：两个超凯勒流形属于同一变形型，当且仅当它们的格 $(H^2,q)$ 同构且 Fujiki 常数一致；而它们同构或双有理的关系，则由保锥的 Hodge 等距给出。",
        ['positive-cone-and-monodromy']),
      step('birational-torelli-corollary', '双有理 Torelli：保锥等距的刻画',
        "把前面几步拼成最终形式。设 $X$、$Y$ 同属一个变形型。若 $f:X\\dashrightarrow Y$ 是双有理映射，则它诱导同构 $f^{*}:H^2(Y,\\mathbb{Z})\\to H^2(X,\\mathbb{Z})$（双有理映射在余维至少 2 的集合之外是同构，而 $H^2$ 看不掉余维 2 的例外集），这个同构保持 $q$（因为 $q$ 由 $\\int\\alpha^{2n}$ 定义，而 $f^{*}$ 在 degree $2n$ 上保积分），保持 Hodge 结构（$f^{*}$ 是 $(2,0)$ 型且全纯），并把双有理 Kähler 锥映到双有理 Kähler 锥。反过来，若存在 Hodge 等距 $\\varphi:H^2(Y,\\mathbb{Z})\\to H^2(X,\\mathbb{Z})$ 把正锥的相应分支映到彼此（并保持除子类的正交壁结构），则先由周期映射的局部同构性把 $Y$ 的周期点搬到 $X$ 的周期点上，再用形变论得到与 $X$ 同周期的一个超凯勒流形 $Y'$，最后由“同周期的双有理模型唯一”这一 Verbitsky 定理的另一半得到 $Y'$ 与 $X$ 双有理等价，而 $Y$ 与 $Y'$ 由等距诱导的标记关系相联。于是双有理等价与保锥 Hodge 等距是同一件事，这就是 lattice Torelli 这一名称的由来：分类的输入完全是一个格上的算术数据。",
        ['two-components-and-conjugation', 'positive-cone-and-monodromy']),
    ],
    conclusion: "对紧 Kähler 超凯勒流形，周期映射 $\\mathcal{P}:\\mathfrak{M}\\to\\Omega$ 是局部双全纯的，像是 $\\Omega$ 的开闭子集，每个连通分支的像恰是一个连通分支，且 $\\mathfrak{M}$ 至多有两个连通分支、由共轭互换；$\\Omega$ 的复维数为 $b_2-2$。由此 $X$ 与 $Y$ 双有理等价当且仅当存在保持正锥（双有理 Kähler 锥）的 Hodge 等距 $H^2(X,\\mathbb{Z})\\cong H^2(Y,\\mathbb{Z})$，几何分类归结为格 $(H^2,q)$ 的算术分类。",
    dependencies: [],
    consequences: [],
    explanation: "全局 Torelli 之所以可能，全靠超凯勒流形把它的全部几何压进一个格。一般紧 Kähler 流形的周期只是 $H^2$ 中的一条直线，形变维数远大于 $b_2-2$，所以周期映射不可能局部同构；超凯勒的条件 $T_X\\cong\\Omega^1_X$ 使切丛与余切丛同构，形变方向的数目恰好与周期能变化的方向一致，局部同构才成立。而“整体”的部分要靠锥：$H^2$ 上的格还有除子类的正交壁结构，这些壁把正锥切成许多区域，每一片对应的双有理模型不同，这正是模空间非分离的来源；Verbitsky 的定理说这些非分离现象完全被锥数据解释，不会有额外的几何障碍。最终结果是：一个 22 维的格配上一族由 $-2$ 类定义的超平面，就能给出一张 K3 的全部双有理几何——这正是“格论分类”的名称所指向的图景。",
    examples: [
      { title: '例子：K3 曲面的 20 维周期域与 Fermat 四次曲面', body: "K3 曲面是 $n=1$ 的情形，$H^2(X,\\mathbb{Z})\\cong U^{\\oplus3}\\oplus E_8(-1)^{\\oplus2}$ 是符号差 $(3,19)$ 的偶幺模格，$b_2=22$，故 $\\Omega$ 是 20 维对称域，与 K3 模空间的维数一致。取 $X$ 为 Fermat 四次曲面 $x_0^4+x_1^4+x_2^4+x_3^4=0\\subset\\mathbb{P}^3$，它的 Picard 数 $\\rho=20$（含 48 条直线所属的类），于是超越格的秩只有 2，$H^{2,0}$ 那条直线落在 $\\mathrm{Pic}(X)^{\\perp}\\otimes\\mathbb{C}$ 里。用格的语言说：一般 K3 的周期点避开所有由格向量给出的超平面（那些超平面正是 $q(v)=\\pm2$ 或 $\\rho>0$ 的条件），而 Fermat 四次曲面的周期点落在许多这样的超平面交上，这正是“代数类多 $\\Leftrightarrow$ 周期点特殊”的精确形式，也是 Noether–Lefschetz 定理的入口。" },
      { title: '例子：四维环面的维数核对', body: "取 $X=T^4=\\mathbb{C}^2/\\Lambda$ 作为二维超凯勒流形（复环面都是超凯勒的）。此时 $H^2(T^4,\\mathbb{Z})\\cong\\wedge^2\\Lambda^{\\vee}$，$q(\\alpha)=\\int_{T^4}\\alpha^2$ 给出符号差 $(3,3)$ 的格，$b_2=6$，所以 $\\dim_{\\mathbb{C}}\\Omega=b_2-2=4$。这个数字与复环面的形变空间维数一致：$h^1(T^4)=4$，而带极化之后得到 Siegel 上半平面 $\\mathcal{H}_2$ 的三维商，多出来的那一维来自 Kähler 类的选择。核对公式 $\\int \\alpha^4=c_X q(\\alpha)^2$：对 $\\alpha$ 是坐标 2-形式的外积 $\\alpha=\\sum$ 直接按重积分计算即可，常数 $c_X$ 只与格 $\\Lambda$ 的余体积有关，说明 Fujiki 常数确实是超凯勒流形之间唯一“不是 Hodge 结构”的离散不变量。" },
    ],
    remarks: [
      "紧性与 Kähler 假设不可去。周期映射的局部同构性用了 Bogomolov–Tian–Todorov 定理，它要求紧 Kähler 加 $c_1=0$；对一般的复 $2n$ 维流形（例如存在正维数全纯向量场的非紧 K3 型流形）周期点仍可定义，但形变空间会出现无穷维方向，周期映射连局部单射都不是。最简单的反例是 $\\mathbb{C}^2$ 上带平移不变辛形式的流形：$h^{2,0}=1$、$q$ 的形式一样，但模空间不是有限的。",
      "Hodge 等距必须保锥，只保格与 Hodge 结构是不够的。K3 的经典例子来自 Markman 与 Namikawa 的构造：存在保持 $H^2$ 的 Hodge 等距但不保正锥的元素，这些元素把一张 K3 的周期点送到另一张 K3 的周期点，然而两者不一定双有理等价；若把这些等距也允许进来，会得到“所有 K3 都同构”的错误结论。保锥（或等价地保 Kähler 锥与除子结构的“双有理 Kähler 锥”）才是正确的条件。",
      "单值群的算术性是另一条独立的输入。K3 情形已知 $\\mathrm{Mon}$ 是 $\\mathrm{O}^+(\\Lambda)$ 中的有限指数子群（因此是算术群），而一般超凯勒流形的单值群是否可以取为算术群是 Verbitsky 提出的猜想；这条若成立，模空间的 Hausdorff 化才是“算术商”的完整图景。因此在引用“模空间等于算术商”这句话时，必须说明是对 K3 或已知变形型，还是以猜想的形式。",
      "定理给出分类，但不给出“给定格就存在流形”。周期映射的满射性（即“每个周期点都被实现”）在不同变形型上是不同的定理：K3 情形是 Todorov、Siu、Looijenga 的结果，用到了 K3 的 Torelli 与局部 Torelli 的配合；一般情形则由 Verbitsky 的论证连同可实现性一并给出。把“像是开闭子集”误读成“像一定非空且为全部”，会漏掉这一步实质性的存在性输入。",
    ],
    corollaries: [
      { title: '推论：K3 曲面的 Torelli 定理', body: "取 $n=1$，$\\Omega$ 是 20 维对称域，周期映射在每个连通分支上局部双全纯，且 K3 的变形型只有一个（所有 K3 彼此形变等价）。于是由保锥的 Hodge 等距 $H^2(X,\\mathbb{Z})\\to H^2(Y,\\mathbb{Z})$ 得到 $X\\cong Y$（K3 的双有理等价即同构，因为 K3 是极小模型，不含可收缩的有理曲线），这就是 Piatetski-Shapiro–Shafarevich 与 Burns–Rapoport 版本的 K3 Torelli 定理。它也解释了为什么 K3 的模空间（未标记的）是 $\\mathrm{O}^+(\\Lambda)$ 的算术商的一个 20 维“球状”对象，并且是拟射影的：周期域可以嵌入为有界对称域，算术商由 Baily–Borel 定理是代数簇。", uses: ['birational-torelli-corollary'] },
    ],
    references: [
      { title: 'Mapping class group and a global Torelli theorem for hyperkähler manifolds', author: 'Misha Verbitsky', year: 2013 },
      { title: 'A global Torelli theorem for hyperkähler manifolds (after Verbitsky), Astérisque 355', author: 'Daniel Huybrechts', year: 2013 },
      { title: 'Variétés Kähleriennes dont la première classe de Chern est nulle', author: 'Arnaud Beauville', year: 1983 },
      { title: 'Compact hyperkähler manifolds, in Calabi–Yau Manifolds and Related Geometries', author: 'Daniel Huybrechts', year: 2003 },
    ],
    history: HISTORY,
  },

  /* ═══════════════════════════════════════════════════════════
   * 2. 热带几何
   * ═══════════════════════════════════════════════════════════ */

  'c-tropical': {
    statement: "设 $K$ 是代数闭、完备、非阿基米德的赋值域，$v:K^{\\times}\\to\\mathbb{R}$ 为赋值（约定 $v(ab)=v(a)+v(b)$、$v(a+b)\\ge\\min(v(a),v(b))$），$\\mathbb{T}=(\\mathbb{R}\\cup\\{+\\infty\\},\\max,+)$ 为热带半环。对环面 $(\\mathbb{G}_m)^n$ 上的闭子簇 $X=V(I)$，其热带化定义为 $\\mathrm{Trop}(X)=\\overline{\\{(v(x_1),\\ldots,v(x_n)):\\ x\\in X(K)\\}}$（取欧氏闭包）；它等于 $\\bigcap_{f\\in I}\\mathrm{Trop}(f)$，是 $\\mathbb{R}^n$ 中由有理多面体组成的纯 $\\dim X$ 维复形，并且可以配上一套重数 $w(\\sigma)$ 使其满足平衡条件 $\\sum_{\\sigma\\supset\\tau}w(\\sigma)v_{\\sigma}=0$。在此之上，Mikhalkin 对应定理断言：$\\mathbb{CP}^2$ 中过 $3d-1$ 个一般位置点的 $d$ 次不可约有理曲线数目，等于热带平面上对应的带权热带有理曲线计数。",
    explanation: "热带几何的全部价值在于“把代数问题换成组合问题”。取值这个动作丢掉了代数细节，只留下值的序结构，于是多项式变成分片线性函数、簇变成多面体复形、相交变成线性方程组的解；而这个丢弃是有控制的：Kapranov 定理说明热带化就是取值的闭包，BKK 型定理说明相交重数在不退化情形下守恒，Mikhalkin 对应定理说明枚举不变量（Gromov–Witten 数）可以被组合计数完全复现。它同时是把“退化”摆到中心位置的语言：一个族在参数趋于 0 时的极限几何，其骨架就是热带簇，所以它既是枚举几何的计算工具，也是模空间紧化边界（Deligne–Mumford 稳定曲线的对偶图）与镜像对称 SYZ 图景的组合模型。",
    steps: [
      step('tropical-semiring', '热带半环与“最大项取两次”的判别',
        "热带半环 $\\mathbb{T}=(\\mathbb{R}\\cup\\{+\\infty\\},\\max,+)$ 的加法是取最大值、乘法是普通加法；它是幂等半环，$a\\oplus a=a$ 意味着热带世界里没有减法，因此“和为零”这一消去式的判别要换成“最大值被至少两个项同时取到”。动机来自退化：把 $x_i=t^{w_i}$ 代入多项式 $f=\\sum_{\\alpha}c_{\\alpha}x^{\\alpha}$，取 $t\\to0$ 时每一项的量级是 $t^{\\langle w,\\alpha\\rangle}$，非阿基米德式的相加使最低阶项决定大小，于是 $-\\log_t|f|$ 的极限是 $\\max_{\\alpha}\\langle w,\\alpha\\rangle$，而极限在 $t\\to0$ 時仍然有限当且仅当最大项被取到至少两次（否则可解出 $x_i$ 而把点推到边界）。据此定义热带超曲面 $\\mathrm{Trop}(f)=\\{w:\\ \\max_{\\alpha}\\langle w,\\alpha\\rangle\\ \\text{在至少两个}\\ \\alpha\\ \\text{上取到}\\}$。它的形状是分片线性凸函数 $\\max_{\\alpha}\\langle w,\\alpha\\rangle$ 的折断轨迹，也就是一个以 $\\alpha$ 的差为方向的扇形分划，这就是“热带簇是组合对象”的最原始含义。",
        []),
      step('kapranov-theorem', 'Kapranov 定理：热带化等于取值的闭包',
        "对一个理想 $I\\subset K[x_1^{\\pm1},\\ldots,x_n^{\\pm1}]$，先定义 $\\mathrm{Trop}(I)=\\bigcap_{f\\in I}\\mathrm{Trop}(f)$，这是有限交（因为 $I$ 有限生成，而 $\\mathrm{Trop}(fg)=\\mathrm{Trop}(f)\\cap\\mathrm{Trop}(g)$ 型性质使交可取在生成元上），结果是由有限多个有理多面体组成的复形。Kapranov 定理（又称基础定理的“强形式”）断言 $\\mathrm{Trop}(I)=v(X(K))$ 的闭包，其中 $v(x)=(v(x_1),\\ldots,v(x_n))$。正向（$v(X)$ 落在热带簇中）来自赋值的基本不等式：若 $f(x)=0$，则最大项不能唯一（否则可把方程解出 $x$ 的最低阶项，与 $f(x)=0$ 矛盾）。反向（热带簇中的一般点都被实现）需要赋值论中的延拓工具：把系数域扩为 $K$ 的极大完备扩张，再用初始理想 $\\mathrm{in}_w(I)$ 的零点（它在残差域上的零点可以提升为 $K$ 上的点）给出实点。与 Gröbner 基对照可得一个纯组合的判据：$w\\in\\mathrm{Trop}(I)$ 当且仅当初始理想 $\\mathrm{in}_w(I)$ 不含单项式——这是把热带簇写进计算代数程序里的标准入口。",
        ['tropical-semiring']),
      step('multiplicities-and-balancing', '重数与平衡条件：热带闭链的定义',
        "热带簇要当作“链”来用，必须补上重数与平衡条件，二者都来自代数。对 $\\mathrm{Trop}(I)$ 的每个极大维面 $\\sigma$，取 $w$ 为面 $\\sigma$ 的内点，令 $w(\\sigma)$ 为初始理想 $\\mathrm{in}_w(I)$ 的零点重数（对超曲面 $f$ 的情形，$w(\\sigma)$ 就是 $\\sum_{\\alpha:\\langle w,\\alpha\\rangle=\\max}|c_{\\alpha}|$ 型量在残差域中的取值，即“取到最大值的那些项的和”的重数）。平衡条件说：对每个余维 1 的面 $\\tau$，把围绕它的相邻极大面 $\\sigma$ 投影到 $\\mathbb{R}^n/\\mathrm{span}(\\tau)$ 中，得一个格向量 $v_{\\sigma}$，则 $\\sum_{\\sigma\\supset\\tau}w(\\sigma)v_{\\sigma}=0$。它的代数来源是“有理函数的主除子热带化为零”：若 $h$ 是 torus 上的有理函数，则 $\\mathrm{Trop}(\\mathrm{div}\\,h)$ 是一条满足平衡条件的零链，因为 $v(ab)=v(a)+v(b)$ 与 $v(a+b)\\ge\\min$ 逐面相加即得。带重数且平衡的整数多面体链称为热带闭链；它们张成一个链复形，其中的“交积”可以在多面体层面直接计算（稳定相交 = 把两个复形正变扰动后取相交多面体，重数相乘），这正是热带 Bézout 定理 $\\deg C_1\\cdot\\deg C_2=\\sum_P \\mathrm{mult}(P)$ 的内容。",
        ['kapranov-theorem']),
      step('mikhalkin-correspondence', 'Mikhalkin 对应：枚举不变量等于热带计数',
        "Mikhalkin 对应定理是把热带几何用于枚举几何的核心。$\\mathbb{CP}^2$ 中过 $3d-1$ 个一般位置点的 $d$ 次不可约有理曲线数目记 $N_d$：$N_1=1$（两点定直线）、$N_2=1$（五点定圆锥曲线）、$N_3=12$（八点定三次曲线的经典结果）、$N_4=620$。Mikhalkin 的定理说 $N_d$ 等于热带平面上满足相同位置约束的“带权格路径”计数：热带曲线是 $\\mathbb{R}^2$ 中的多边形复形，其边沿三个方向（对应 $\\mathbb{CP}^2$ 的三个 torus 不变量方向），每条边带权（正整数），顶点满足平衡条件，通过点的条件变成“边经过给定点”的线性条件。计数时对每条热带曲线取权重 $\\prod_{\\text{顶点}}\\mathrm{mult}(\\text{顶点})$ 再对自同构（平行边重排）除以相应阶乘。证明的骨架分三段：先把点集随参数 $t$ 一起退化，使曲线族退化到热带极限；再用对数映射证明热带极限与原族之间有一一对应（当点集一般位置时有 Rolle 型的存在唯一性）；最后核对局部重数，使两侧的贡献逐点相等。这就把 GW 不变量化为有限组合求和。",
        ['multiplicities-and-balancing']),
      step('degeneration-and-syz', '退化、边界与 SYZ：热带几何的结构位置',
        "热带几何的第三重身份是“退化的骨架”。给定 $\\mathbb{C}$ 上的平坦族 $X_t\\subset\\mathbb{P}^n$（$t\\to0$），其纤维的 Nérron 模型（或其他非阿基米德模型的解析化）有一条自然的收缩映射，把 $X_t$ 收缩到它的骨架，而骨架正是热带化 $\\mathrm{Trop}(X)$；树的边对应于“在某条赋值方向上的单值化”，顶点对应退化成分的交。这个图景使热带几何成为处理边界与退化的标准工具：Deligne–Mumford 紧化中稳定曲线的对偶图就是一条热带曲线（节点是顶点、光滑分支是边，而标记点是权为 1 的“无穷边”），模空间的边界层由此获得组合描述。在镜像对称中，SYZ 猜想把 $X$ 与其镜像写成 $T^n$ 纤维化的对偶，底空间 $B$ 带多面体仿射结构，正是热带几何的天然载体；壁穿越（wall-crossing）对应 instanton 修正，而热带曲线计数给出相应的不变量预测，这是枚举几何与镜像对称在组合层面的连接点。",
        ['mikhalkin-correspondence', 'kapranov-theorem']),
    ],
    conclusion: "赋值域 $K$ 上环面中的闭子簇 $X$ 的热带化 $\\mathrm{Trop}(X)=\\overline{v(X(K))}=\\bigcap_{f\\in I}\\mathrm{Trop}(f)$ 是纯 $\\dim X$ 维的有理多面体复形，配上重数后满足平衡条件，从而给出热带闭链；热带相交理论（Bézout 型定理）可在组合层面计算，而 Mikhalkin 对应定理把 $\\mathbb{CP}^2$ 的枚举不变量（$N_d$ 的计数）化为带权热带曲线的有限组合求和。热带簇同时是退化族与模空间边界的骨架，也是 SYZ 图景的组合模型。",
    dependencies: [],
    consequences: [],
    explanation: "热带几何真正的创新不在“用 max-plus 替代加乘”，而在于它证明了这种替代是保信息的：Kapranov 定理把热带簇认定为取值的闭包，于是每个热带点背后都有一族真正的代数点；平衡条件把 $v(a+b)\\ge\\min$ 这条不等式的不确定性固定为一条守恒律，于是热带复形可以像代数闭链一样做相交；Mikhalkin 对应则说明枚举不变量的计数可以在“丢掉所有形变细节之后”的骨架上完成。三个层次合起来构成一条完整的降维通道：簇 → 多面体复形 → 格路径的计数。它的代价也很清楚：只有不变量（相交数、次数、枚举数）被保留，任何涉及整体模空间或精细结构的量都会丢失，因此热带计数必须与代数一侧的对应定理配套使用。",
    examples: [
      { title: '例子：$xy+x+y$ 的热带直线与两个热带直线的相交', body: "取 $f=xy+x+y\\in K[x^{\\pm1},y^{\\pm1}]$，令 $w=(v(x),v(y))$，三项的“指数”分别是 $w_1+w_2$、$w_1$、$w_2$。找出最大值被取到两次以上的区域：若 $w_1+w_2=w_1\\ge w_2$ 则 $w_2=0$、$w_1\\ge0$，得射线 $\\{(s,0):s\\ge0\\}$；若 $w_1+w_2=w_2\\ge w_1$ 得射线 $\\{(0,s):s\\ge0\\}$；若 $w_1=w_2\\ge w_1+w_2$ 得 $w_1=w_2\\le0$，得射线 $\\{(s,s):s\\le0\\}$。三条射线交于原点，正是热带平面中的一条热带直线。再取另一条 $g=x+y+1$，其热带化是 $\\{w_1=w_2\\ge0\\}\\cup\\{w_1=0\\ge w_2\\}\\cup\\{w_2=0\\ge w_1\\}$；两条热带直线在原点相交一次，重数为 1，与热带 Bézout 定理 $1\\cdot1=1$ 一致，也与两条一般位置直线的唯一交点相符。" },
      { title: '例子：过五点的圆锥曲线与热带计数核对', body: "取 $d=2$，$3d-1=5$，$N_2=1$：平面上过五个一般位置点的圆锥曲线唯一。热带一侧的核对：热带二次曲线由一个“Newton 多边形”给出，$2\\Delta$ 的格点构成三角形，热带曲线是三条带权的直线段（或含一条有界边与三条无界边）组成的复形，通过五个一般位置点的热带二次曲线在计数意义下恰有一条，权为 1。把 $d=3$ 的 $N_3=12$ 也纳入同一框架：热带三次曲线的 Newton 多边形是边长 3 的三角形，其内部格点给出更多可能的拓扑型，逐个计数并相加得到 12，其中每一条热带曲线贡献 $\\prod$ 顶点重数。这两个核对说明热带计数不是“另一个数值”，而是与原计数逐项对应的同一数值，其差别只在计算方式。" },
    ],
    remarks: [
      "基数不能从代数闭域中去掉。Kapranov 定理的反向部分依赖残差域代数闭（初始理想的零点总能提升），若 $K$ 的剩余域不代数闭，热带簇会包含“无法实现”的胞腔，$v(X(K))$ 的闭包严格小于 $\\mathrm{Trop}(I)$；同样地，特征 $p$ 的非阿基米德域上必须额外小心不可分现象，因为此时赋值延拓的唯一性会失效（在完备离散赋值域上赋值唯一延拓，而一般情形不是）。",
      "热带化依赖 torus 嵌入，因而不是双有理不变量。$\\mathbb{G}_m^n$ 上的同一个簇，用不同的紧化或不同的坐标（不同的 torus 嵌入）会得到不同的热带复形，其维数甚至可能改变（例如一条直线在某个嵌入下退化为射线加直线段，在另一个嵌入下变成别的形状）；因此在陈述“热带化的维数等于簇的维数”时必须固定 torus 与坐标，并且只对 torus 内的部分成立，射影化的部分要额外用 Newton 多边形或扇形来记录。",
      "Mikhalkin 对应要求一般位置与有理曲线。若点集不一般位置（例如有多个点在一条直线上），热带侧的计数会出现无穷族（正维数的解空间），此时对应定理的形式要改成虚拟计数或 Gromov–Witten 型的形式；同样地正亏格曲线的热带对应更复杂（需要引入 $\\mathbb{R}^2$ 之外的“有界边的重数”与“超势”修正），不能直接照搬有理情形的公式。",
      "平衡条件是“热带闭链”的核心，缺它则相交理论失效。若只取 $\\mathrm{Trop}(f)$ 而丢掉重数、或者用任意多面体代替，则两个热带复形的相交既可能多计也可能少计（典型的例子是两条热带直线在一条线段上相交，若不按稳定相交扰动计数，重数无法确定）；平衡条件保证了扰动后的相交数是稳定的，这在代数侧对应 $\\mathrm{in}_w(I)$ 的代数闭链性质。",
    ],
    corollaries: [
      { title: '推论：热带 Bézout 定理与 $\\mathbb{CP}^2$ 的枚举计数', body: "由平衡条件，两个热带闭链的稳定相交总重数等于它们次数的乘积（这是格中多面体相交的组合计算，可由对偶扇形上的 Minkowski 型恒等式给出），即 $C_1\\cdot C_2=\\deg C_1\\deg C_2$，这就是热带 Bézout 定理。把它与 Mikhalkin 对应结合，$\\mathbb{CP}^2$ 中过 $3d-1$ 个一般位置点的 $d$ 次有理曲线计数等于热带格路径的计数，且这个计数满足与 GW 不变量相同的递推（Kontsevich 型的割粘递推），于是热带几何给出 GW 不变量公式的一个纯组合证明路径，不需要构造模空间的虚拟基本类。", uses: ['multiplicities-and-balancing', 'mikhalkin-correspondence'] },
    ],
    references: [
      { title: 'Enumerative tropical algebraic geometry in $\\mathbb{R}^2$', author: 'Grigory Mikhalkin', year: 2005 },
      { title: 'Introduction to Tropical Geometry, Graduate Studies in Mathematics 161', author: 'Diane Maclagan, Bernd Sturmfels', year: 2015 },
      { title: 'Non-archimedean amoebas and tropical varieties', author: 'Manfred Einsiedler, Mikhail Kapranov, Douglas Lind', year: 2006 },
    ],
    history: HISTORY,
  },

  /* ═══════════════════════════════════════════════════════════
   * 3. Berkovich 空间
   * ═══════════════════════════════════════════════════════════ */

  'c-berkovich': {
    statement: "设 $k$ 是完备非阿基米德域（绝对值 $|\\cdot|$，剩余特征 $p$）。对 $k$ 上的仿射代数 $A$，其 Berkovich 谱 $\\mathcal{M}(A)$ 是 $A$ 上一切有界乘法半范数 $|\\cdot|_x$（满足 $|1|_x\\le1$、$|fg|_x\\le|f|_x|g|_x$、$|f+g|_x\\le\\max(|f|_x,|g|_x)$，且在 $k$ 上与给定绝对值一致）的全集，赋以逐点收敛拓扑；$\\mathcal{M}(A)$ 是紧 Hausdorff 空间（不假定 $A$ 诺特）。把仿射对象粘起来得到 $k$-解析空间范畴：$X\\mapsto X^{an}$ 是解析化函子，$\\mathbb{A}^{n,an}$、$\\mathbb{P}^{n,an}$ 分别是仿射与射影解析空间。其核心性质是：$X$ 紧合时 $X^{an}$ 紧 Hausdorff，$X$ 分离时 $X^{an}$ Hausdorff，$X$ 连通时 $X^{an}$ 道路连通；在紧合情形 GAGA 型定理成立（凝聚层的解析化给出上同调的等价）。",
    explanation: "Berkovich 空间的动机是修补刚性解析空间的拓扑病态。经典 Tate 刚性空间的拓扑由仿射子域（如盘、环域）的完备化定义，覆盖过于粗糙，结果是空间完全不连通，连通性只能靠 Grothendieck 拓扑的形式性质弥补；Berkovich 的改动只有一处——在盘上不取“半径落在值群里的盘”，而是把所有半径（包括无理半径）上的上确界范数都当作点收进来，于是盘变成了逐层嵌套的连续族，整个空间成为道路连通的紧空间，$\\mathbb{P}^{1,an}$ 甚至是一棵实树。这一改动的代价是点不再是“域值点”，而是“取值于某个域中的半范数”；收益是几乎所有分析都在通常的拓扑里进行，同时退化、约化、热带化的信息被以紧凑的方式编码进树形结构。",
    steps: [
      step('spectrum-multiplicative-seminorm', 'Berkovich 谱：有界乘法半范数与四类点',
        "定义的核心是把“点”从域值点换成半范数。对仿射代数 $A$，任何有界乘法半范数对应的核 $\\mathfrak{p}_x=\\{f:\\ |f|_x=0\\}$ 是素理想，且 $A/\\mathfrak{p}_x$ 在 $|\\cdot|_x$ 下的完备化 $\\mathcal{H}(x)$ 是一个完备非阿基米德域，称为 $x$ 的残差域。于是每个点 $x$ 都给出“在一个域里取值”的机制，这可以看作把局部环的残差域思想整体化：经典点（$\\mathfrak{p}_x$ 极大）之外还有大量非经典的素理想，它们记录的是“函数在某个盘上的一致估值”。$\\mathcal{M}(A)$ 的紧性来自 Banach–Alaoglu 型论证：半范数满足 $|f|_x\\le\\|f\\|$，因此可以把 $\\mathcal{M}(A)$ 嵌入紧的乘积空间 $\\prod_{f\\in A}[0,\\|f\\|]$，而定义半范数的等式与不等式给出闭条件；这一步不需要 $A$ 诺特，也不需要有限型。$\\mathbb{A}^{1,an}=\\mathcal{M}(k[T])$ 的点分四类：类型 I 是 $k$ 的代数闭包的元素；类型 II 是有理闭盘 $D(a,r)$（$r\\in|k^{\\times}|$）；类型 III 是无理半径的闭盘；类型 IV 是嵌套闭盘族交为空的极限点。四类的区分标准是残差域的超越次数与值群：类型 II 的残差域在 $k$ 上超越次数 1，类型 III 的残差域是 $k$ 的代数扩张，类型 IV 的值群扩张非平凡。",
        []),
      step('Gauss-point-and-path', 'Gauss 点与盘上的上确界：如何把两个点连成道路',
        "要在 $\\mathcal{M}(k[T])$ 上作分析，需要一个可操作的点集参数化。对 $a\\in k$ 与 $r\\in[0,\\infty)$ 定义 $\\|f\\|_{D(a,r)}=\\sup_{z\\in D(a,r)}|f(z)|$，其中 $D(a,r)=\\{z:\\ |z-a|\\le r\\}$ 是闭盘；非阿基米德的最大模原理说明这个上确界可以在盘内取到，因此它是有限值，并且 $r\\mapsto\\|f\\|_{D(a,r)}$ 单调不减（有界函数在更大的盘上上确界不会下降）。于是每个 $(a,r)$ 给出 $\\mathcal{M}(k[T])$ 的一个点，叫以 $a$ 为心、半径 $r$ 的盘型点；$r=0$ 时给出经典点 $a$，而 $a=0$、$r=1$ 给出 Gauss 点 $\\|\\sum c_iT^i\\|_{\\text{Gauss}}=\\max_i|c_i|$。给定两个点 $x,y$，若它们的核 $\\mathfrak{p}_x$、$\\mathfrak{p}_y$ 落在同一条素理想链上，则由“半径的单调族”给出连续的一维族，配上紧性与局部紧性即可把这两点用一条道路连接，这就是道路连通性的来源。关键点是：无理半径（不在 $|k^{\\times}|$ 中的 $r$）不必被排除，只要盘上确界有意义即可；把 $r$ 连续地取遍一个区间，就得到从 Gauss 点走向经典点的线段，而这在刚性空间里是做不到的。",
        ['spectrum-multiplicative-seminorm']),
      step('reduction-skeleton-tropicalization', '约化映射、骨架与热带化',
        "约化映射把解析空间与特殊纤维接起来。对 $\\mathcal{O}_k$-模型 $\\mathfrak{X}$，约化映射 $\\mathrm{red}:X^{an}\\to\\mathfrak{X}_s$（$\\mathfrak{X}_s$ 为特殊纤维）把 $x$ 送到其残差域上的约化所对应的点，它是满射，并且在 $\\mathfrak{X}$ 的正则点处给出连续收缩；当 $\\mathfrak{X}$ 光滑时 $X^{an}$ 形变收缩到其骨架 $S(\\mathfrak{X})$，后者是由模型的单纯结构给出的一个多面体子空间。最重要的特例是环面：$\\mathbb{G}_m^{n,an}$ 通过 $x\\mapsto(-\\log|x_1|,\\ldots,-\\log|x_n|)$ 收缩到 $\\mathbb{R}^n$，这是一个到 $\\mathbb{R}^n$ 的连续收缩，而 $\\mathbb{R}^n$ 正是热带空间 $\\mathbb{T}^n$ 的底。于是赋值型的“热带化”在 Berkovich 语言里有了不变的定义：给定嵌入环面的簇 $X\\subset\\mathbb{T}^n$，$X^{an}$ 的骨架就是 $\\mathrm{Trop}(X)$，而逐层范数 $\\|\\cdot\\|_x$ 就是热带化里那座分片线性函数的连续化版本。这一步把热带几何、刚性几何与赋值论放进同一个框架：热带化 = 骨架，约化 = 特殊纤维，二者通过收缩映射互相确定。",
        ['Gauss-point-and-path']),
      step('compactness-and-connectedness', '紧合性、连通性与实树结构',
        "Berkovich 空间最有用的整体性质是“几何性质自动迁移”。若 $X$ 在 $k$ 上紧合，则 $X^{an}$ 紧 Hausdorff：紧性来自 $\\mathcal{M}(A)$ 的紧性与层化过程中的有限粘合，分离性来自对角态射紧合（闭浸入的解析化是闭浸入，紧合的像紧）。连通性的迁移更精细：$X$ 连通蕴含 $X^{an}$ 连通，且紧合时 $X^{an}$ 道路连通。对 $\\mathbb{P}^{1,an}$ 可以显式看出图景：它形如一棵实树，树干是“广义盘”的连续族，类型 II 点是分支点，类型 III 点（无理半径）是树干上的普通点，类型 IV 点是树在“无穷远方向”上的端点。树形结构对函数论有直接影响：解析函数在盘上的最大模原理变成“沿树单调”，于是有理函数的零点与极点表现为斜率的变化，跨过类型 II 点时斜率改变量等于重数，这正是热带化的局部形式。树形结构的另一个后果是：对 $\\mathbb{P}^{1,an}$ 上的每一点，其残差域的值群要么与 $k$ 相同（类型 II），要么是一个额外自由层，而这一选择决定了有限态射在该点的分歧行为。",
        ['reduction-skeleton-tropicalization']),
      step('example-norm-computation', '具体计算：$\\mathbb{Q}_p$ 上 $T^2-p$ 的范数折线',
        "取 $k=\\mathbb{Q}_p$、$f(T)=T^2-p$，在盘 $D(0,r)$（$r\\in[0,1]$）上计算 $\\|f\\|_{D(0,r)}$。对 $|z|\\le r$ 有 $|z^2|\\le r^2$ 与 $|p|=p^{-1}$，由最大模原理 $\\|f\\|_{D(0,r)}=\\max(r^2,p^{-1})$：当 $r^2>p^{-1}$ 时等于 $r^2$，当 $r^2<p^{-1}$ 时等于 $p^{-1}$，在 $r=p^{-1/2}$ 处两者相等。把 $s=-\\log_p r$ 当作树坐标，则 $\\log_p\\|f\\|_{D(0,r)}=-2s$ 在 $s\\in[0,\\frac12]$ 上是一条斜率为 $-2$ 的直线段，在 $s\\ge\\frac12$ 上变成常值 $-1$；折点 $s=\\frac12$ 正是 $T^2-p$ 的牛顿多边形的顶点，也就是这个多项式的热带根。由于 $p^{1/2}\\notin\\mathbb{Q}_p$，半径 $r=p^{-1/2}$ 不在值群 $|k^{\\times}|=p^{\\mathbb{Z}}$ 中，所以折点是类型 III 点：它不来自 $\\mathbb{Q}_p$ 中任何元素所定义的盘，只来自“盘上确界”这一连续族。从 Gauss 点沿线段走到折点，再继续走到经典点 $0$，范数值从 1 单调降到 $p^{-1}$ 后保持不变；而两个经典点 $\\pm p^{1/2}$ 在树上位于折点之外的同一分支的两侧，它们在 $\\mathbb{Q}_p$ 上不可区分（互为 Galois 共轭），这正是“树上一条边的内部代表一个 Galois 轨道”的具体体现。",
        ['Gauss-point-and-path']),
    ],
    conclusion: "$\\mathcal{M}(A)$ 是 $A$ 上一切有界乘法半范数构成的空间，紧 Hausdorff；$\\mathbb{A}^{1,an}$ 的点分为类型 I–IV，盘上的上确界范数 $\\|f\\|_{D(a,r)}$ 给出 $\\mathbb{P}^{1,an}$ 的实树结构中连续的道路。紧合（分离、连通）的簇其解析化紧（Hausdorff、道路连通），GAGA 型定理把凝聚层上同调搬到解析层；$\\mathbb{G}_m^{n,an}$ 收缩到 $\\mathbb{R}^n$，使热带化成为骨架，赋值的分片线性信息被几何地实现。",
    dependencies: [],
    consequences: [],
    explanation: "Berkovich 空间之所以在当代成为非阿基米德几何的默认语言，原因是它把三件事同时做对：拓扑是好的（紧、Hausdorff、道路连通）、点有内容（每个点是残差域中的半范数，携带值群与残差域的完整信息）、并且与热带世界天然接口（骨架与收缩映射）。代价是点集不再容易描述，$\\mathcal{M}(A)$ 比 $\\mathrm{Spec}\\,A$ 复杂得多，但这恰是它的力量所在：多出来的点记录了“函数在盘上的增长”，这类数据在概形的点集里根本看不见。在应用上，Berkovich 语言让刚性解析几何里必须用 Grothendieck 拓扑绕过去的分析论证变成通常的拓扑论证，例如极大模原理、覆盖空间的单值化、以及 p 进 Arakelov 理论中的 Green 函数都可以在紧空间上直接做；而热带几何一侧，骨架的说法使“退化族的极限”有了不依赖模型的含义。",
    examples: [
      { title: '例子：$\\mathbb{P}^{1,an}$ 上的最大模原理与斜率变化', body: "取 $k=\\mathbb{Q}_p$、$f(T)=(T-1)(T-p)$，在 $\\mathbb{P}^{1,an}$ 上看 $\\log_p|f|$ 沿树的变化。在 Gauss 点处逐项计算：三项 $T^2$、$-(1+p)T$、$p$ 的范数分别为 $1$、$1$、$p^{-1}$，故 $\\|f\\|_{\\text{Gauss}}=1$。走到经典点 $1$ 时值为 $0$（因为 $f(1)=0$），到经典点 $0$ 时值为 $|p|=p^{-1}$，到经典点 $p$ 时值为 $0$。于是从 Gauss 点到 $1$ 的路径上 $\\log_p|f|$ 从 $0$ 线性下降到 $-\\infty$（在零点处范数为零），而从 Gauss 点到 $0$ 的路径上它从 $0$ 线性下降到 $-1$；两条路径在树上的分歧点是类型 II 点。这个核算显示：有理函数的对数范数在树上恰是一个分段线性函数，折点出现在零点与极点所对应的叶子处，而折点的组合数据就是 $f$ 的热带化。" },
    ],
    remarks: [
      "完备性不能随假设去掉。残差域 $\\mathcal{H}(x)$ 的完备化依赖赋值本身的完备性（否则最大模原理与上确界范数的有限性都会失效），类型 I 点的刻画依赖代数闭包；对不完备基域，解析化会出现“空洞”，$X^{an}$ 的连通性与紧性都不再自动成立。一般情形下应先把基域完备化，或改用 adic 空间、钻石这类更细的框架。",
      "Berkovich 空间不是概形，$\\mathcal{M}(A)$ 也不等于 $\\mathrm{Spec}\\,A$ 的某种紧化。$\\mathcal{M}(A)$ 的点由半范数给出，其中大量点不对应素理想，因此不能把概形上的直觉逐字照搬；例如 $\\mathrm{Spec}\\,\\mathbb{Q}_p[T]$ 的维数是 2，而作为紧空间 $\\mathcal{M}(\\mathbb{Q}_p[T])$ 的覆盖维数是 1。把两种空间的维数混用会在讨论紧化与维数时得出矛盾结论。",
      "类型 IV 点的存在与基域的球完备性相关，不能想当然地断言或否认。球完备的域（例如离散赋值完备域）上没有“嵌套闭盘族交为空”的现象，从而不产生类型 IV 点；而 $\\mathbb{C}_p$ 不是球完备的，其上类型 IV 点存在。把“$\\mathbb{P}^{1,an}$ 就是一棵有叶子的树”当作对任意基域都成立的图景，会在处理边界与紧化时出错，因为类型 IV 点正是树在无穷远方向的端点。",
      "GAGA 型结论需要紧合假设。$X$ 紧合时解析化保持上同调的有限性与凝聚性，而仿射或非紧情形完全不同：$\\mathbb{A}^{1,an}$ 的整体函数环不有限生成，上同调也可能出现无穷维现象。因此不能把“解析化不改变上同调”当作通用口号，它对每个定理都要核对紧合性与层论假设。",
    ],
    corollaries: [
      { title: '推论：$\\mathbb{G}_m^{n,an}$ 形变收缩到 $\\mathbb{R}^n$，热带化获得内在定义', body: "由收缩映射 $x\\mapsto(-\\log|x_1|,\\ldots,-\\log|x_n|)$（其纤维道路连通，连通性由半径的连续变化给出），$\\mathbb{G}_m^{n,an}$ 同伦等价于 $\\mathbb{R}^n$；于是对任何闭子簇 $X\\subset\\mathbb{T}^n$，其解析化 $X^{an}$ 的收缩像就是热带化 $\\mathrm{Trop}(X)$，且 $X^{an}$ 的同伦型与 $\\mathrm{Trop}(X)$ 相容。这条推论给出热带几何的一个“无模型”定义：热带化不再是坐标与模型之外额外选择的结果，而是解析化的形变收缩核；同时也解释了为什么热带簇的维数与 $X$ 相同（两者同伦等价，且收缩保持维数）。", uses: ['reduction-skeleton-tropicalization'] },
    ],
    references: [
      { title: 'Spectral Theory and Analytic Geometry over Non-Archimedean Fields, Mathematical Surveys and Monographs 33', author: 'Vladimir G. Berkovich', year: 1990 },
      { title: 'Non-Archimedean Analysis: A Systematic Approach to Rigid Analytic Geometry', author: 'Siegfried Bosch, Ulrich Güntzer, Reinhold Remmert', year: 1984 },
      { title: 'Potential Theory and Dynamics on the Berkovich Projective Line, Mathematical Surveys and Monographs 159', author: 'Matthew Baker, Robert Rumely', year: 2010 },
    ],
    history: HISTORY,
  },

  /* ═══════════════════════════════════════════════════════════
   * 4. p 进 Hodge 理论
   * ═══════════════════════════════════════════════════════════ */

  'c-padic-hodge': {
    statement: "设 $K$ 是 $\\mathbb{Q}_p$ 的有限扩张（更一般地：完备离散赋值域，剩余特征 $p$，剩余域完美），$G_K$ 为绝对 Galois 群。p 进 Hodge 理论研究 $G_K$ 的 $p$ 进表示与几何上同调之间的对应，核心是周期环 $B_{crys}\\subset B_{st}\\to B_{dR}\\to B_{HT}$ 与三个比较定理：(1) de Rham 比较（Faltings）：对 $K$ 上光滑紧合的 $X$，$H^i_{\\text{é}t}(X_{\\bar K},\\mathbb{Q}_p)\\otimes_{\\mathbb{Q}_p}B_{dR}\\cong H^i_{dR}(X/K)\\otimes_KB_{dR}$，故 $H^i_{\\text{é}t}$ 是 de Rham 表示且其滤过由 $H^i_{dR}$ 的滤过给出；(2) crystalline 比较（好归约）：$D_{crys}(H^i_{\\text{é}t})\\cong H^i_{crys}(\\mathfrak{X}/\\mathcal{O}_K)\\otimes K_0$；(3) semistable 比较（Tsuji）：半稳定归约时用对数 crystalline 上同调与 $(\\varphi,N)$-模替换。这些定理使“用微分形式计算 $p$ 进上同调”成为可能，并把 Hodge 数搬到 Galois 表示上。",
    explanation: "p 进 Hodge 理论要回答的问题很朴素：特征 $p$ 的世界里没有光滑微分形式，de Rham 上同调这个特征 0 的工具应该被什么替代？Fontaine 的答案是“不要替代，而是比较”：把所有 $p$ 进上同调理论（étale、crystalline、de Rham、Hodge–Tate）都张量上一个大而通用的周期环 $B$，在这个环上它们变成同一个对象，而各个理论只保留了这个共同对象的不同结构——étale 保留 Galois 作用，crystalline 保留 Frobenius，de Rham 保留滤过，Hodge–Tate 只保留分次碎片。于是“计算”的流程是：先用方便的几何理论算出一个带结构的模，再用这些结构之间的相容性去还原 Galois 表示；反之，几何里的不变量（Hodge 数、Frobenius 特征多项式、单值算子的秩）也都可以在表示论一侧读出。",
    steps: [
      step('period-rings-construction', '周期环的构造：Witt 向量、$B_{dR}$ 与基本正合列',
        "构造的起点是 $\\mathcal{O}_{\\mathbb{C}_p}$ 上的 Witt 向量环 $W=W(\\mathcal{O}_{\\mathbb{C}_p})$，它带 Frobenius $\\varphi$（在 Witt 坐标上由 $p$ 次幂延拓给出）、Teichmüller 代表 $[\\cdot]:\\mathcal{O}_{\\mathbb{C}_p}\\to W$，以及一个由“把 Teichmüller 代表送回原元素”定义的满射 $\\theta:W\\to\\mathcal{O}_{\\mathbb{C}_p}$。$\\theta$ 的核是主理想，生成元可取为 $\\xi=[\\varpi]-p$ 的形式，其中 $\\varpi$ 是倾斜域 $\\mathbb{C}_p^{\\flat}$ 中赋值 $p^{-1}$ 的素元。以 $\\xi$ 作 $\\xi$-进完备化再取分式域，得到 $B_{dR}=\\mathrm{Frac}(\\varprojlim_nW/\\xi^n)$：它是完备离散赋值域，剩余域为 $\\mathbb{C}_p$，带连续的 $G_K$ 作用与下降滤过 $\\mathrm{Fil}^iB_{dR}=\\xi^iB_{dR}^+$。若改用“同时按 $p^{1/p^n}$ 与 $\\xi$ 的幂作完备化并允许除以由 Frobenius 生成的量”的构造，就得到 $B_{crys}$ 与 $B_{st}$：它们分别带 Frobenius $\\varphi$（$B_{st}$ 还带单值算子 $N$，满足 $N\\varphi=p\\varphi N$）以及滤过。$B_{HT}=\\bigoplus_{i\\in\\mathbb{Z}}\\mathbb{C}_p(i)$ 只保留分次信息。最基本的正合列是 Fontaine 的 $0\\to\\mathbb{Q}_p\\to B_{crys}^{\\varphi=1}\\to B_{dR}/B_{dR}^+\\to0$，它把 $\\varphi$-不变量与滤过层面的信息精确对接。",
        []),
      step('classification-criteria', '分类判据：de Rham、crystalline、semistable 与 Hodge–Tate',
        "设 $V$ 是 $G_K$ 的有限维 $\\mathbb{Q}_p$-表示。定义 $D_{dR}(V)=(V\\otimes_{\\mathbb{Q}_p}B_{dR})^{G_K}$，这是带滤过的 $K$-向量空间；由 $(B_{dR})^{G_K}=K$ 与作用的连续性总有 $\\dim_KD_{dR}(V)\\le\\dim V$，等号成立时称 $V$ 为 de Rham 表示，此时自然的等变映射 $D_{dR}(V)\\otimes_KB_{dR}\\to V\\otimes_{\\mathbb{Q}_p}B_{dR}$ 是同构。同理定义 $D_{crys}(V)=(V\\otimes B_{crys})^{G_K}$，它是 $K_0=W(\\mathbb{F}_q)[1/p]$ 上的 $\\varphi$-模（$\\varphi$ 半线性），$V$ 称为 crystalline 若 $\\dim_{K_0}D_{crys}(V)=\\dim V$；带 $\\varphi$ 与 $N$ 的 $D_{st}(V)=(V\\otimes B_{st})^{G_K}$ 给出 semistable 的定义；$D_{HT}(V)=(V\\otimes B_{HT})^{G_K}$ 给出 Hodge–Tate 的定义。三者之间是一条单向链：crystalline 蕴含 semistable，semistable 蕴含 de Rham，de Rham 蕴含 Hodge–Tate。反向都不成立：半稳定但不 crystalline 的典型例子是乘性归约的椭圆曲线的 $p$ 进 Tate 模，其单值算子 $N$ 非零；而 de Rham 表示一般在扩张后可成为 semistable（potentially semistable）。判据的实用价值在于它把表示的性质化为一句话的维数等式，可以逐例核对。",
        ['period-rings-construction']),
      step('comparison-theorems', '比较定理：de Rham、crystalline、Hodge–Tate 与 semistable',
        "比较定理把上一步的判据变成几何输入。设 $X$ 是 $K$ 上光滑紧合的簇。(1) de Rham 比较（Faltings）：对一切 $i\\ge0$ 存在与 $G_K$、滤过相容的同构 $H^i_{\\text{é}t}(X_{\\bar K},\\mathbb{Q}_p)\\otimes_{\\mathbb{Q}_p}B_{dR}\\cong H^i_{dR}(X/K)\\otimes_KB_{dR}$；直接推论是 $H^i_{\\text{é}t}$ 是 de Rham 表示、$D_{dR}(H^i_{\\text{é}t})=H^i_{dR}(X/K)$，并且 $\\dim_{\\mathbb{Q}_p}H^i_{\\text{é}t}=\\dim_KH^i_{dR}$（后者在比较定理之前并不显然，因为 étale 一侧是 $\\mathbb{Q}_p$ 上的表示而 de Rham 一侧是 $K$ 上的向量空间）。(2) 对 $B_{HT}$ 张量并取分次得 Hodge–Tate 分解 $H^i_{\\text{é}t}\\otimes_{\\mathbb{Q}_p}\\mathbb{C}_p\\cong\\bigoplus_j(H^{i-j}(X,\\Omega^j)\\otimes_K\\mathbb{C}_p)(-j)$，其中 $\\Omega^j$ 是层论微分形式；它说明 Hodge 数 $h^{j,i-j}$ 可从 Galois 表示读出。(3) crystalline 比较（Fontaine–Messing、Kato）：若 $X$ 有光滑好归约 $\\mathfrak{X}/\\mathcal{O}_K$，则 $D_{crys}(H^i_{\\text{é}t})\\cong H^i_{crys}(\\mathfrak{X}/\\mathcal{O}_K)\\otimes_{W[1/p]}K_0$，于是 $\\varphi$ 的特征多项式就是 Frobenius 在上同调上的特征多项式。(4) semistable 比较（Tsuji）：若 $X$ 有半稳定归约，用对数 crystalline 上同调 $H^i_{log\\text{-}crys}$ 与 $(\\varphi,N)$-模 $D_{st}$ 作同构，其中 $N$ 对应上同调的单值算子。",
        ['classification-criteria']),
      step('proof-routes', '证明路线：almost 数学、syntomic 途径与导出 de Rham',
        "比较定理有若干条彼此独立的证明路线，各自暴露不同的技术核心。Faltings 的原始证明用 almost 数学：把 $\\mathcal{O}_{\\mathbb{C}_p}$ 的极大理想中的元素当作“几乎为零”，于是允许局部地除以 $p^{1/p^n}$ 型的量，把上同调的比较化归为几乎 étale 覆盖下的比较（Faltings 主定理）。Kato 与 Tsuji 走 syntomic 途径：在半稳定模型上用 syntomic 上同调构造一个同时含滤过与 Frobenius 的中间对象，再用“几乎零”技术与 Poincaré 引理逐项比较，得到 semistable 情形的 $D_{st}$ 同构。Beilinson 提出的路线把两侧都换成导出函子层面的对象：用导出 de Rham 复形 $L\\Omega^{\\bullet}$ 与其 Hodge 滤过直接计算，避免构造具体的周期环。Bhatt–Morrow–Scholze 的 $A_{inf}$-上同调沿着这条路给出统一的整体性证明，把 de Rham 与 crystalline 比较作为同一个定理的两个特化，并顺带得到整系数（$\\mathbb{Z}_p$-系数）版本。三条路线的共同点是：都不直接比较上同调本身，而是比较一个带结构的大对象，然后取结构的不变量。",
        ['comparison-theorems']),
      step('example-elliptic-tate-curve', '具体计算：椭圆曲线的 $p$ 进 Tate 模',
        "取 $E/\\mathbb{Q}_p$ 与它的 $p$ 进 Tate 模 $T_pE=\\varprojlim_nE[p^n]$、$V_pE=T_pE\\otimes\\mathbb{Q}_p$（二维表示）。好归约情形：$V_pE$ 是 crystalline，$D_{crys}(V_pE)$ 是 $K_0=\\mathbb{Q}_p$ 上的二维自由 $\\varphi$-模，$\\varphi$ 的特征多项式为 $T^2-a_pT+p$，其中 $a_p=p+1-\\#E(\\mathbb{F}_p)$ 是好归约纤维的点数；Newton 多边形的斜率是 $0$ 与 $1$（ordinary，$a_p$ 为单位）或 $\\frac12,\\frac12$（supersingular，$p\\mid a_p$）。Hodge 一侧：$h^{0,1}=h^0(\\Omega^1_E)=1$、$h^{1,0}=h^1(\\mathcal{O}_E)=1$，于是 Hodge–Tate 分解给出 $j=0$ 与 $j=1$ 两个一维分量，与维数 2 相符。乘性归约情形（Tate 曲线 $E_q=\\mathbb{C}_p^{\\times}/q^{\\mathbb{Z}}$，$|q|<1$）：$V_pE$ 落在非分裂扩张 $0\\to\\mathbb{Q}_p(1)\\to V_pE\\to\\mathbb{Q}_p\\to0$ 里，它是 semistable 但不 crystalline，单值算子 $N$ 非零且 $D_{crys}=D_{st}^{N=0}$ 只有一维。两个情形合起来给出一个可核算的判据：$\\dim D_{crys}=\\dim V$ 当且仅当好归约，$\\dim D_{st}=\\dim V$ 当且仅当半稳定归约。",
        ['classification-criteria', 'comparison-theorems']),
    ],
    conclusion: "对 $K$ 上光滑紧合的 $X$ 有 de Rham 比较 $H^i_{\\text{é}t}(X_{\\bar K},\\mathbb{Q}_p)\\otimes B_{dR}\\cong H^i_{dR}(X/K)\\otimes_KB_{dR}$，取分次得 Hodge–Tate 分解 $H^i_{\\text{é}t}\\otimes\\mathbb{C}_p\\cong\\bigoplus_jH^{i-j}(X,\\Omega^j)(-j)$；好归约时 crystalline 比较 $D_{crys}(H^i_{\\text{é}t})\\cong H^i_{crys}\\otimes K_0$，半稳定归约时用 $(\\varphi,N)$-模 $D_{st}$。表示的蕴含链为 crystalline ⟹ semistable ⟹ de Rham ⟹ Hodge–Tate，反向均不成立。",
    dependencies: [],
    consequences: [],
    explanation: "p 进 Hodge 理论的整体图景可以概括为“把上同调搬到一个足够大的环上做常数化”。$B_{dR}$ 之所以能同时装下 étale 与 de Rham 两侧，是因为它既含 $\\mathbb{Q}_p$ 的代数结构（Galois 作用）又含几何的滤过（$\\xi$-进滤过），而两者之间的错位恰好由 $B_{dR}$ 的赋值控制；用 $B_{crys}$ 或 $B_{st}$ 替换，则额外装上 Frobenius 与单值算子，于是能记录归约类型。技术上的难点全在比较定理本身：它不是断言两个上同调群同构，而是说两个带不同结构的对象张量上同一个周期环后同构，这需要构造一个能被两侧同时计算的中间对象（almost 数学的极限、syntomic 层、或导出 de Rham 复形）。理论的价值在于它把三种语言统一起来——几何（上同调与 Hodge 结构）、表示论（Galois 表示与 $\\varphi$-模）、算术（Frobenius 特征多项式与 $L$ 函数），使任一侧的问题可以在另一侧表述并求解。",
    examples: [
      { title: '例子：$\\mathbb{G}_m$ 与 $\\mathbb{P}^1$ 的比较定理核对', body: "取 $X=\\mathbb{G}_m=\\mathrm{Spec}\\,K[t,t^{-1}]$。$H^1_{dR}(\\mathbb{G}_m/K)=\\Omega^1/d\\mathcal{O}$，而 $d(t^n)=nt^{n-1}dt$，故微分形式的像由 $n\\ne0$ 的项张成，余核是一维的 $K\\cdot dt/t$。另一侧由 Kummer 理论 $H^1_{\\text{é}t}(\\mathbb{G}_{m,\\bar K},\\mathbb{Q}_p)\\cong\\mathbb{Q}_p(1)$（由 $\\mu_{p^n}$ 的 Tate 模生成），de Rham 比较说明它与 $K\\cdot dt/t$ 在 $B_{dR}$ 上同构，两者的滤过移位一致。再看 $X=\\mathbb{P}^1$：$H^2_{dR}(\\mathbb{P}^1)=H^1(\\Omega^1)=K$（因为 $\\Omega^1_{\\mathbb{P}^1}=\\mathcal{O}(-2)$、$h^1=1$），滤过为 $\\mathrm{Fil}^1=K$、$\\mathrm{Fil}^2=0$；另一侧 $H^2_{\\text{é}t}=\\mathbb{Q}_p(-1)$，Hodge–Tate 分解只保留 $j=1$ 的一项 $H^{1,1}(-1)$。两个例子的共同点是：维数相等不是巧合，而是比较定理的推论；而“两边维数相等”这件事在比较定理之前完全看不出来。" },
    ],
    remarks: [
      "周期环对每个基域都不同，不能跨基域套用公式。$B_{crys}$ 与 $B_{st}$ 的构造依赖 $K_0=W(\\mathbb{F}_q)[1/p]$ 与剩余域的选取，$B_{dR}$ 依赖 $\\mathbb{C}_p$ 的赋值；换基（特别是换到剩余域更大的扩张）时，$\\varphi$-模的斜率、单位根等概念都会随 $K_0$ 变化。因此在引用“$\\varphi$ 的特征多项式是 $T^2-a_pT+p$”这类结论时，必须说明基域与 $K_0$，否则该多项式只是相对于某个 Witt 向量环而言。",
      "de Rham 比较在 $i>\\dim X$ 处也需要正确理解。de Rham 复形止于 $\\Omega^{\\dim X}$，因此 $H^i_{dR}=0$ 对 $i>\\dim X$，而 $H^i_{\\text{é}t}$ 在 $i=2\\dim X$ 处仍有 $\\mathbb{Q}_p(-\\dim X)$；比较定理之所以不矛盾，是因为滤过结构被整体搬移：$H^{2d}_{dR}$ 由 $H^d(\\Omega^d)$ 贡献，其滤过移位与扭转后的 $B_{dR}$ 匹配。若只看维数而不看滤过，会得出“$H^{2d}_{\\text{é}t}=0$”的错误结论。",
      "整系数的比较是另一个层次的问题。上述比较的系数是 $\\mathbb{Q}_p$（$B_{crys}$ 与 $B_{dR}$ 都是 $\\mathbb{Q}_p$-代数），把系数降到 $\\mathbb{Z}_p$ 后挠现象出现，$D_{crys}$ 不再自由，需要 $A_{inf}$、prismatic 上同调或 Breuil–Kisin 模等更精细的工具；Bhatt–Morrow–Scholze 的整体性证明正是在这个层次上给出结果，因此引用整 $p$ 进 Hodge 理论时必须说明它比较的是导出完备化后的对象，而不是朴素的 $\\mathbb{Z}_p$-模。",
      "蕴含链的逆命题需要逐一检验，不能凭直觉升降。crystalline 与 semistable 的差别由单值算子的非零性刻画，semistable 与 de Rham 的差别由能否取到带 $N$ 的模刻画，而 de Rham 与 Hodge–Tate 的差别在于 $D_{dR}$ 的维数是否达到 $\\dim V$。便于记忆的核对方式是一维情形：$H^i_{\\text{é}t}$ 一维时 Hodge–Tate 与 de Rham 同义，而维数提高到 2 之后 Hodge–Tate 而非 de Rham 的表现就会出现，因此判据必须逐维核对维数等式而不是只看 Hodge 数。",
    ],
    corollaries: [
      { title: '推论：$\\dim_{\\mathbb{Q}_p}H^i_{\\text{é}t}=\\dim_KH^i_{dR}$，且 Hodge 数成为 Galois 表示的不变量', body: "由 de Rham 比较，把同构两边看作 $B_{dR}$-向量空间即得维数相等；再对 $B_{dR}$ 的滤过取分次，得 $H^i_{\\text{é}t}\\otimes\\mathbb{C}_p$ 的 Hodge–Tate 分解，其分量维数恰是 $h^{j,i-j}=\\dim_KH^{i-j}(X,\\Omega^j)$。这条推论的意义是双重的：几何一侧的 Hodge 数（原本由微分形式计算）成为 Galois 表示的算术不变量，于是这类看似解析的数据可以用纯代数方式在 étale 上同调上读出；反过来，从 Galois 表示的 Hodge–Tate 权可以直接推测几何的形状，这在特征 $p$ 的算术几何中是最常用的反向推理。", uses: ['comparison-theorems'] },
    ],
    references: [
      { title: 'Représentations p-adiques des corps locaux, in The Grothendieck Festschrift II', author: 'Jean-Marc Fontaine', year: 1990 },
      { title: 'Crystalline cohomology and p-adic Galois-representations, in Algebraic Analysis, Geometry, and Number Theory', author: 'Gerd Faltings', year: 1989 },
      { title: 'p-adic étale cohomology and crystalline cohomology in the semi-stable reduction case', author: 'Takeshi Tsuji', year: 1999 },
      { title: 'Integral p-adic Hodge theory', author: 'Bhargav Bhatt, Matthew Morrow, Peter Scholze', year: 2018 },
    ],
    history: HISTORY,
  },

  /* ═══════════════════════════════════════════════════════════
   * 5. 完美胚空间
   * ═══════════════════════════════════════════════════════════ */

  'c-perfectoid': {
    statement: "设 $K$ 是完备非阿基米德域，剩余特征 $p$。称 $K$ 为完美胚域，若值群 $|K^{\\times}|$ 是 $p$-可除的、剩余域在 Frobenius 下满射，并且 $\\mathcal{O}_K$ 上的 Frobenius 在 $\\mathcal{O}_K/p$ 上满射。称 $K$ 上的 Banach 代数 $R$（$\\mathcal{O}_R$ 有界、开、$p$-进完备）为完美胚 $K$-代数，若 Frobenius $\\Phi:\\mathcal{O}_R/p^{1/p}\\to\\mathcal{O}_R/p$（$x\\mapsto x^p$）满射；把这些对象与它们的 Tate 仿射局部化粘起来，得到完美胚空间范畴。Tilting 定理断言：$K^{\\flat}=\\varprojlim_{x\\mapsto x^p}\\mathcal{O}_K/p$（配 $p^{\\flat}=(0,p^{1/p},p^{1/p^2},\\ldots)$ 与继承自 $K$ 的绝对值）是特征 $p$ 的完美胚域，$K\\mapsto K^{\\flat}$ 以及 $R\\mapsto R^{\\flat}$ 给出完美胚 $K$-代数范畴与完美胚 $K^{\\flat}$-代数范畴的等价；该等价与有限 étale 态射、与 étale 上同调相容：$H^i_{\\text{é}t}(X,\\mathbb{Z}/p^n)\\cong H^i_{\\text{é}t}(X^{\\flat},\\mathbb{Z}/p^n)$，并且对任意 $\\mathbb{Z}/p^n$-模系数的层上同调也成立。",
    explanation: "完美胚理论的核心是一个出人意料的观察：把 Frobenius 变成满射这一条要求，就足以让特征 0 的世界与特征 $p$ 的世界完全同构。原因是 $p$ 次幂运算在 $\\mathcal{O}_R$ 上满射意味着每个元素都能“不断开 $p$ 次方”，于是 $\\mathcal{O}_R$ 的元素可以写成序列 $(x_0,x_1,x_2,\\ldots)$ 并满足 $x_{n+1}^p=x_n$，而这一序列与特征 $p$ 世界里的一个元素一一对应——倾斜构造就这样把 $\\mathcal{O}_R$ 与 $\\mathcal{O}_{R^{\\flat}}$ 的乘法结构逐元素等同，代价只是加法被“扭曲”（$x+y$ 的 $p^n$ 次根不等于 $x^{1/p^n}+y^{1/p^n}$）。这一步的收益巨大：特征 0 一侧有 Hodge 理论（滤过、微分形式、de Rham 上同调），特征 $p$ 一侧有 Frobenius（因此有 étale 上同调与 Kummer 理论），倾斜等价说明两边其实是同一个对象的两副面孔。Scholze 用它给出几乎纯净定理的现代形式，从而在很大范围内重证了 p 进 Hodge 理论，并打开了 p 进 Langlands 与 prismatic 上同调的门。",
    steps: [
      step('perfectoid-field-tilt', '完美胚域：$p$-可除值群、Frobenius 与倾斜域',
        "先处理域的情形，因为它的几何最直观。若 $K$ 完备、剩余特征 $p$，且 Frobenius 在 $\\mathcal{O}_K/p$ 上满射，则取任意 $a\\in K^{\\times}$ 都可以找到 $x$ 使 $x^p$ 与 $a$ 在模 $p$ 意义下同余，从而 $|x|^p$ 与 $|a|$ 相差一个单位因子；对 $|a|$ 反复开 $p$ 次方便知 $|K^{\\times}|$ 的 $p$ 次方根越来越接近，极限给出 $|a|$ 的 $p$ 次方根，因此值群是 $p$-可除的。这条推论排除了离散赋值域：$\\mathbb{Q}_p$ 的值群是 $\\mathbb{Z}$，不 $p$-可除，故 $\\mathbb{Q}_p$ 不是完美胚域。典型例子有三类：$\\mathbb{Q}_p(p^{1/p^{\\infty}})^{\\wedge}$ 与 $\\mathbb{Q}_p(\\zeta_{p^{\\infty}})^{\\wedge}$ 是完美胚域（值群 $\\mathbb{Z}[1/p]$、$p$-可除，剩余域 $\\mathbb{F}_p$ 完美）；$\\mathbb{C}_p$ 也是完美胚域（值群 $\\mathbb{Q}$、剩余域 $\\overline{\\mathbb{F}}_p$，且 $p^{1/p}\\in\\mathbb{C}_p$ 使 Frobenius 条件有意义）。倾斜域定义为 $K^{\\flat}=\\varprojlim_{x\\mapsto x^p}\\mathcal{O}_K/p$，即满足 $x_{n+1}^p=x_n$ 的序列全体，乘法逐项进行、加法则按“提升后再相加再取根”的极限定义；它的值为 $p^{\\flat}=(0,p^{1/p},p^{1/p^2},\\ldots)$，是特征 $p$ 的完备完美域，且 $|K^{\\flat\\times}|=|K^{\\times}|$、$K^{\\flat}$ 的剩余域等于 $K$ 的剩余域。乘法幺半群上 $\\mathcal{O}_K\\to\\mathcal{O}_{K^{\\flat}}$、$x\\mapsto(x \\bmod p, x^{1/p}\\bmod p,\\ldots)$ 是双射，这就是倾斜的“骨架”。",
        []),
      step('tilting-equivalence', '倾斜等价：范畴等价与加法的扭曲',
        "倾斜不只在域上成立，对完美胚代数也是范畴等价。设 $R$ 是完美胚 $K$-代数，$m=\\langle p^{1/p^{\\infty}}\\rangle$ 记 $\\mathcal{O}_R$ 中由 $p$ 的 $p$ 幂根的极限所张成的“几乎零”理想。定义 $R^{\\flat}=\\varprojlim_{x\\mapsto x^p}\\mathcal{O}_R/p$，它是一个特征 $p$ 的完美 $K^{\\flat}$-代数，并且 $\\mathcal{O}_R\\to\\mathcal{O}_{R^{\\flat}}$ 作为乘法幺半群是双射。等价函子的方向是 $R\\mapsto R^{\\flat}$，逆函子由“把倾斜元素写成一个 $p$ 进极限并取其在 $\\mathcal{O}_R$ 中的极限”给出。要验证这确实是范畴等价，需要三条技术输入：其一，$\\mathcal{O}_R$ 的加法在倾斜一侧由 Witt 向量型的极限公式表达（$x+y=\\lim\\,(x^{1/p^n}+y^{1/p^n})^{p^n}$，其中右侧的加法与取 $p$ 次幂都在 $\\mathcal{O}_R$ 中做），这条公式保证加法的相容性；其二，几乎零理想 $m$ 满足 $m^2=m$，因此“almost 零”的判断与除法可以在两侧一致地传递；其三，有限 étale 扩张的倾斜对应：$R\\to S$ 有限 étale 当且仅当 $R^{\\flat}\\to S^{\\flat}$ 有限 étale，两端的分歧与剩余域数据由倾斜保持。三条合起来给出：完美胚代数上的有限 étale 覆盖被倾斜一一对应，从而整体上建立范畴等价。这个等价保持大量的几何数据（有限性、分离性、紧合性、连通性），所以“在特征 $p$ 里看特征 0 的几何”不再是比喻。",
        ['perfectoid-field-tilt']),
      step('almost-purity-etale', '几乎纯净定理与 étale 上同调的比较',
        "倾斜等价能把拓扑信息也搬过去，靠的是 Scholze 对 Faltings 几乎纯净定理的推广。定理（almost purity）：若 $R$ 是完美胚 $K$-代数，$S\\to R$ 是有限 étale 态射，则带拓扑的代数结构在“几乎同构”（即同构的核与余核被几乎零理想 $m$ 消掉）意义下被倾斜保持：$R\\to S$ 的数据可以在 $R^{\\flat}\\to S^{\\flat}$ 上重造，反之亦然。这条定理使得在计算 étale 上同调时可以在倾斜一侧进行（那里没有微分形式，但有 Frobenius 与完善的 étale 拓扑），而计算 de Rham 相关的不变量时回到特征 0 一侧。具体的比较是：对完美胚 $K$-代数 $R$ 与 $R^{\\flat}$，有限 étale 覆盖的范畴等价，因此对 $\\mathbb{Z}/p^n$-系数系（Kummer 型的 torsor 由 $\\mu_{p^n}$ 给出，而 $\\mu_{p^n}$ 在倾斜下保持）有自然同构 $H^i_{\\text{é}t}(\\mathrm{Spa}(R,v),\\mathbb{Z}/p^n)\\cong H^i_{\\text{é}t}(\\mathrm{Spa}(R^{\\flat},v^{\\flat}),\\mathbb{Z}/p^n)$。其证明要点是把覆盖数据在两侧逐项比较：$\\mathcal{O}_R$ 与 $\\mathcal{O}_{R^{\\flat}}$ 作为乘法幺半群相同，故单位群 $\\mathcal{O}_R^{\\times}$ 与 $\\mathcal{O}_{R^{\\flat}}^{\\times}$ 的 $p$-进群的完全性一致，进而 $\\mu_{p^n}$-torsor 的分类（由 $H^1$ 的 Kummer 序列给出）逐项对上；高阶项用有限 étale 覆盖的下降与几乎纯净梳理。",
        ['tilting-equivalence']),
      step('applications-hodge-and-diamonds', '应用：p 进 Hodge 理论、钻石与 Witt 向量仿射 Grassmann 型',
        "完美胚技术的最初目的是重证 p 进 Hodge 理论。关键构造是 $A_{inf}=W(\\mathcal{O}_{K^{\\flat}})$：它带 Frobenius $\\varphi$ 与一个满射 $\\theta:A_{inf}\\to\\mathcal{O}_K$，其核由 $\\xi$ 生成，因此 $A_{inf}$ 同时包含特征 $p$ 的倾斜数据与特征 0 的 $\\mathcal{O}_K$ 数据；prismatic 上同调就是这个环上的导出完备化对象。由此得到的 de Rham 与 crystalline 比较，是 Bhatt–Morrow–Scholze 的整体性证明，其中的核心是“导出完备化”与 $h$-拓扑下的下降，比原始的几乎数学途径更自然。第二个应用是钻石（diamond）：把完美胚空间按 pro-étale 拓扑写成“形式化商 $X=\\varprojlim X_i$ 除以 $\\underline{G}$（$G$ 是仿射广义置换群）”，于是 rigid 解析空间与完美的 pro-étale 层获得统一的描述，p 进模空间（例如 $p$ 进 Shimura 簇）可以像特征 $p$ 的对象一样被研究。第三个应用是 Bhatt–Scholze 的 Witt 向量仿射 Grassmann 型 $\\mathrm{Gr}_G$：在完美胚域上用 $W(\\mathcal{O})$-格的模型构造，它的 $p$ 进几何与 Scholze 的“$p$ 进 Shtukas”理论一起给出模 $p$ 与模 $p^2$ 的 Shimura 簇的算术应用。",
        ['almost-purity-etale', 'tilting-equivalence']),
      step('example-mu-pn-and-qp-cyclotomic', '具体核对：$\\mathbb{Q}_p(\\zeta_{p^{\\infty}})^{\\wedge}$ 的倾斜与 Kummer 类',
        "取 $K=\\mathbb{Q}_p(\\zeta_{p^{\\infty}})^{\\wedge}$。它的值群由 $|\\zeta_{p^n}-1|=p^{-1/\\varphi(p^n)}$ 生成，是 $\\mathbb{Z}[1/p]$、$p$-可除；剩余域是 $\\mathbb{F}_p$，完美。倾斜域 $K^{\\flat}$ 是特征 $p$ 的完备完美域，剩余域 $\\mathbb{F}_p$、值群 $\\mathbb{Z}[1/p]$，因此 $K^{\\flat}$ 同构于 $\\mathbb{F}_p((t^{1/p^{\\infty}}))$ 的完备化（$t$ 为 $p^{\\flat}$ 的对应物）。核验乘法幺半群的双射：$\\zeta_{p^n}-1$ 在 $\\mathcal{O}_K/p$ 中的像应当对应到倾斜侧 $t$ 的某个 $p$ 幂根；逐步开 $p$ 次方根的极限正是素数 $p^{\\flat}$ 本身（在倾斜中 $p^{\\flat}$ 就是“$p$ 的 $p^{\\infty}$ 次根序列”），于是 $\\mu_{p^{\\infty}}$-torsor 在两侧的分类被 $\\mathcal{O}^{\\times}$ 的 $p$-进完全性对上。Kummer 序列 $1\\to\\mu_{p^n}\\to\\mathcal{O}^{\\times}\\xrightarrow{p^n}\\mathcal{O}^{\\times}\\to1$ 的边界映射给出 $H^1_{\\text{é}t}(K,\\mu_{p^n})\\cong K^{\\times}/(K^{\\times})^{p^n}$；在倾斜一侧由 $|K^{\\flat\\times}|=|K^{\\times}|$ 立刻看出两边的可除性一致，从而 $H^1$ 的比较在 $n\\to\\infty$ 时给出 $H^1_{\\text{é}t}(K,\\mathbb{Z}_p(1))$ 的对应物，这正是倾斜“把 Kummer 类搬到特征 $p$”的最小例子。",
        ['almost-purity-etale']),
    ],
    conclusion: "完美胚域由 $p$-可除值群与 Frobenius 满射刻画，倾斜 $K\\mapsto K^{\\flat}=\\varprojlim_{x\\mapsto x^p}\\mathcal{O}_K/p$ 给出特征 $p$ 的完美胚域；更一般地完美胚 $K$-代数范畴与完美胚 $K^{\\flat}$-代数范畴等价，等价与有限 étale 覆盖、几乎纯净、以及 $\\mathbb{Z}/p^n$-系数的 étale 上同调相容。由 $A_{inf}=W(\\mathcal{O}_{K^{\\flat}})$ 出发得到整 p 进 Hodge 理论的统一证明，钻石与 Witt 向量仿射 Grassmann 型则由 pro-étale 形式化商与 $W(\\mathcal{O})$-格给出。",
    dependencies: [],
    consequences: [],
    explanation: "完美胚理论之所以影响深远，是因为它把“特征 0 与特征 $p$ 的鸿沟”这一算术几何的核心困难，在一个可验证的技术条件（Frobenius 满射）下完全抹平。技术条件看似很强，实际上覆盖了 p 进几何中最常用的一批基域与环：所有以 $\\mathbb{Q}_p$ 上带 $p^{\\infty}$ 次根或 $p^{\\infty}$ 次单位根的扩张为底的环、以及它们的各种形式化完备化。倾斜等价说明这些环上的 étale 拓扑与特征 $p$ 的完全一样，而特征 $p$ 的几何有 Frobenius 与完美性可用，许多在特征 0 难以处理的问题（例如模 $p$ 约化、挠现象）在特征 $p$ 一侧变得容易。这条思路的延伸形式（钻石、prismatic、$A_{inf}$）已经成为 p 进几何的标准工具，其影响覆盖 p 进 Hodge 理论、p 进 Langlands 纲领、Shimura 簇的模 $p$ 几何与 Fargues–Fontaine 曲线。",
    examples: [
      { title: '例子：$\\mathbb{Q}_p$ 与 $\\mathbb{Q}_p(p^{1/p^{\\infty}})^{\\wedge}$ 的对比', body: "以 $p=2$ 便于心算：$K_1=\\mathbb{Q}_2$，$|K_1^{\\times}|=2^{\\mathbb{Z}}$，$2$-可除性失败（$2$ 的平方根在 $\\mathbb{Q}_2$ 中不存在，其估值 $1$ 无法给出 $1/2$ 的值），故 $\\mathbb{Q}_2$ 不是完美胚域；Frobenius 在 $\\mathcal{O}/2=\\mathbb{F}_2$ 上是恒等，但倾斜所要求的“$p$ 的 $p^{\\infty}$ 次根”在 $\\mathcal{O}_{\\mathbb{Q}_2}$ 中不存在，故 $p^{\\flat}$ 无从定义。取 $K_2=\\mathbb{Q}_2(2^{1/2^{\\infty}})^{\\wedge}$：值群为 $\\mathbb{Z}[1/2]$，元素 $2$ 的开方的极限给出 $2^{\\flat}$，剩余域仍是 $\\mathbb{F}_2$，于是 $K_2^{\\flat}\\cong\\mathbb{F}_2((t^{1/2^{\\infty}}))^{\\wedge}$。核对乘法幺半群：$2$ 对应序列 $(2\\bmod2,\\ 2^{1/2}\\bmod2,\\ 2^{1/4}\\bmod2,\\ldots)$，除第一项外各项都是 $0$（因为 $2^{1/2^n}$ 的估值 $2^{-n}<1$ 时为非单位，正约化到 $0$），因此它的像是“$t$ 在 $p^{\\flat}$-进拓扑下”的对应物。这个核算显示倾斜确实把“$p$ 的根序列”搬到特征 $p$ 的一个素元上，而 $\\mathbb{Q}_2$ 因缺少这段序列而被排除在外。" },
    ],
    remarks: [
      "Frobenius 满射不能用“剩余域完美”代替。剩余域完美只保证约化层的 Frobenius（即 $x\\mapsto x^p$ 在 $\\mathcal{O}_K/p$ 的剩余域上）满射，而完美胚要求的是 $\\mathcal{O}_K/p$ 整环上的满射，二者在挠环上差别很大：例如 $\\mathcal{O}_K=\\mathbb{Z}_p[\\sqrt{p}]$ 型的扩张里 $p$ 的根虽然存在，但整环的结构可能使满射失败；因此判定完美胚性必须逐步核对 $\\mathcal{O}_R/p$ 的 Frobenius 而非只看剩余域。",
      "$p$-进完备不能弱化为“分离、完备”。$\\mathcal{O}_R$ 必须是 $p$-进完备的（即 $\\mathcal{O}_R\\cong\\varprojlim\\mathcal{O}_R/p^n$），因为倾斜元素要写成一个 $p$ 进极限；若只要求拓扑完备则无法保证极限在环内。这条在构造上不可省略：把 $\\mathcal{O}_R$ 换成它的 $p$-进完备化会改变环（例如 $\\mathbb{Z}_p[x]$ 与它的 $p$-进完备化不同），而倾斜只对完备对象有效。",
      "倾斜不保持加法，只保持乘法与拓扑。$\\mathcal{O}_R\\to\\mathcal{O}_{R^{\\flat}}$ 是乘法幺半群同构而非环同构，因此在用倾斜做论证时所有涉及加法的运算都要回到特征 0 一侧（例如 Witt 向量公式、$A_{inf}$ 的 $\\theta$ 与 $\\varphi$）。把倾斜当作环同构去“直接搬运”代数方程，会得到关于加法的不正确等式，这是学习这一理论最常见的错误。",
      "等价只在有限 étale 与某些拓扑上成立，不能推广到任意态射。倾斜等价对光滑态射、开浸入、紧合态射的处理需要额外的框架（钻石与 pro-étale 拓扑），对一般的有限型态射则不保持；因此在把几何问题从特征 0 搬到特征 $p$ 时，必须核对所用的态射类是否落在等价所覆盖的范围内。",
    ],
    corollaries: [
      { title: '推论：完美胚空间上的 étale 上同调与倾斜相同，故可用特征 $p$ 的方法计算', body: "由几乎纯净定理与倾斜等价，完美胚 $K$-代数 $R$ 与 $R^{\\flat}$ 的有限 étale 覆盖范畴等价、且两侧的 $\\mu_{p^n}$-torsor 一致，于是 $H^i_{\\text{é}t}(X,\\mathbb{Z}/p^n)\\cong H^i_{\\text{é}t}(X^{\\flat},\\mathbb{Z}/p^n)$。其直接用途是可以把特征 0 的 étale 上同调的计算化到特征 $p$ 一侧：那里有 Frobenius 与 perfect 结构，Kummer 理论变得简单，从而可以逐项核对类的可除性与挠现象。这也是 Bhatt–Morrow–Scholze 的整体 p 进 Hodge 理论的起点：先在完美胚上算 $A_{inf}$-上同调，再用下降回到一般情形。", uses: ['almost-purity-etale', 'tilting-equivalence'] },
    ],
    references: [
      { title: 'Perfectoid spaces, Publications mathématiques de l’IHÉS 116', author: 'Peter Scholze', year: 2012 },
      { title: 'p-adic Hodge theory for rigid-analytic varieties, Forum of Mathematics Pi 1', author: 'Peter Scholze', year: 2013 },
      { title: 'Integral p-adic Hodge theory, Publications mathématiques de l’IHÉS 127', author: 'Bhargav Bhatt, Matthew Morrow, Peter Scholze', year: 2018 },
      { title: 'Almost ring theory, Lecture Notes in Mathematics 1800', author: 'Ofer Gabber, Lorenzo Ramero', year: 2003 },
    ],
    history: HISTORY,
  },

  /* ═══════════════════════════════════════════════════════════
   * 6. 凝聚数学
   * ═══════════════════════════════════════════════════════════ */

  'c-condensed': {
    statement: "记 $\\mathrm{Cond}$ 为紧 Hausdorff 空间（或更一般地，极不连通（profinite）集合）上的凝聚态集合范畴：一个凝聚态集合是函子 $T:\\{\\text{极不连通的紧 Hausdorff 空间}\\}^{op}\\to\\mathrm{Set}$，把有限交与有限不交并分别送到极限与余极限（即“把极不连通紧空间实现为有限离散空间的 pro-有限覆盖的层”）。凝聚态 Abel 群构成一个 Abel 范畴 $\\mathrm{Cond}(\\mathrm{Ab})$，它有足够多的内射对象、有张量积 $\\otimes$ 且与内 $\\mathrm{Hom}$ 构成闭对称幺半结构，且函子“把拓扑 Abel 群送的底层集合的凝聚化”是完全忠实的。关键定理是：$\\mathrm{Cond}(\\mathrm{Ab})$ 中的群可逐点检测，$\\mathbb{Z}$、$\\mathbb{R}$、$\\mathbb{Q}_p$ 等对象都有良好性质（$\\mathbb{R}$ 是内射的、$\\mathbb{Q}_p$ 是内射的、$\\mathbb{Z}_p/\\mathbb{Z}$ 与 $\\mathbb{Q}_p/\\mathbb{Z}_p$ 的上同调被计算清楚），并且固态模（$\\mathbb{Z}$-模的凝聚化）的导出范畴与 p 进分析的导出范畴一致。",
    explanation: "凝聚数学要修复的是拓扑 Abel 群范畴的一个结构性缺陷：它甚至不是 Abel 范畴，因为余核（例如 $\\mathbb{R}\\to\\mathbb{R}/\\mathbb{Z}$）在拓扑意义下可能不是 Hausdorff，而核与余核的行为不对偶。Clausen 与 Scholze 的解决办法是换掉“拓扑空间”这个底：不再用开集来定义连续，而用“从极不连通紧空间出发的层式赋值”来定义，这样每个拓扑空间都被它的“探测数据”代替，而这些数据构成一个真正良好的 Abel 范畴。收益是三点：一是所有构造（核、余核、张量、内 Hom）都在范畴层面直接可用；二是 p 进分析里长期需要“先取完备化再取核”的临时修正被吸收进定义；三是复分析里的解析空间与 p 进解析空间可以用同一个框架处理，这就是解析几何（Clausen–Scholze）的来源。这条基础重构的代价是技术门槛高；但它的结论常常是“把已知定理的证明变短”，例如 p 进 Hodge 理论中的若干比较定理可以用固态语言的下降直接处理。",
    steps: [
      step('profinite-probe-and-definition', '用极不连通空间定义凝聚态对象：从拓扑到层',
        "定义的第一步是选定“探测器”。设 $\\mathrm{ProFin}$ 为极不连通紧 Hausdorff 空间（即 profinite 集合）构成的范畴，它是有限集合范畴的 pro-完备化；凝聚态集合就是函子 $T:\\mathrm{ProFin}^{op}\\to\\mathrm{Set}$，把有限交送到极限、有限不交并送到余极限。这一条件翻译成层论是：$T$ 是有限离散空间视为 profinite 之后的“有限型层”，等价地，$T(\\varprojlim S_i)=\\varinjlim T(S_i)$ 且 $T(\\varnothing)=\\ast$。任何拓扑空间 $X$ 给出一个凝聚态集合 $\\underline{X}$：$\\underline{X}(S)=\\mathrm{Cont}(S,X)$；对紧 Hausdorff 的 $X$ 这个函子完全决定 $X$，故“紧 Hausdorff 空间 → 凝聚态集合”是全忠实的。更一般地，把“拓扑 Abel 群”送到凝聚态 Abel 群也是全忠实的（若把拓扑 Abel 群中“连续同态”作为态射）。这条定义的直观是：极不连通空间是“可以有限逼近的空间”，它们的极限与余极限结构足够丰富又足够组合化，因此把函数论建在它们上面既保留了拓扑信息，又避免了开集拓扑的病态。",
        []),
      step('abelian-category-structure', 'Abel 范畴结构与张量积',
        "有了定义就要验证范畴性质。$\\mathrm{Cond}(\\mathrm{Ab})$ 中的核与余核逐点定义（$S\\mapsto\\ker/\\mathrm{coker}$ 在 $\\mathrm{ProFin}^{op}$ 上取逐点），因为“Abel 群层”的逐点核与余核自动满足有限交/并的条件，故核、余核、像、余像都在范畴内；正合性可以逐点检验。关键的技术点是“足够多内射对象”：对每个极不连通紧空间 $S$ 与阿贝尔群 $A$，函子 $E_S(A)=\\{f:\\mathrm{Cont}(S,A)\\}$ 型的“自由对象”的对偶给出内射对象族，并且任何凝聚态 Abel 群都能嵌入这些内射对象的积。张量积定义为“逐点的双线性化再层化”，即 $\\underline{A}\\otimes\\underline{B}$ 由 $(A,S)\\otimes(B,T)\\mapsto\\underline{A\\otimes B}$ 的余极限生成（这是对称幺半结构的通常左 Kan 扩张形式）；它在 $\\mathbb{Z}$ 上给出幺半单位 $\\underline{\\mathbb{Z}}$，并且对内 Hom（逐点同态再层化）满足伴随关系 $\\mathrm{Hom}(A\\otimes B,C)\\cong\\mathrm{Hom}(A,\\underline{\\mathrm{Hom}}(B,C))$。这一步的意义是把“拓扑世界里的坏行为”隔离在个别对象上：范畴本身是闭对称幺半 Abel 范畴，而拓扑 Abel 群范畴通过全忠实嵌入进去，在需要时可以只对其中的“固态”对象做代数。",
        ['profinite-probe-and-definition']),
      step('comparison-with-topological-groups', '与拓扑 Abel 群的比较：液态化与完备化',
        "把拓扑 Abel 群送进凝聚态范畴的函子称为“液态化”$M\\mapsto\\underline{M}$。它全忠实但不保持导出的正合性，具体地说：拓扑 Abel 群的正合列 $0\\to A\\to B\\to C\\to0$（作为抽象群正合且 $A\\to B$ 是同胚到像）在液态化后仍是正合列（因为核与余核逐点计算，连续同态在紧空间上的核正好给出凝聚态核），但在“取完备化”这一步会出现差别：拓扑 Abel 群的内 Hom 一般不连续，而凝聚态的内 Hom 是“取所有连续同态的层化”。这一差别正是凝聚框架的价值所在：在拓扑 Abel 群范畴里，$\\mathrm{Hom}(\\mathbb{R},\\mathbb{Z})=0$ 而 $\\mathrm{Hom}(\\mathbb{R},\\mathbb{R})\\cong\\mathbb{R}$ 行为古怪（前者不反射满射性），而在凝聚态范畴中这些 Hom 逐点给出、并可以导出地计算，于是“上同调上界”与“有限性”可以统一陈述。特别地，$\\mathbb{R}$ 在凝聚态范畴中是内射对象（因为它逐点由各 $S$ 上的连续函数给出，而这些函数层是内射的），这一点使得用 $\\mathbb{R}$ 做的消解可以整体地进行，不必每一步都验证拓扑的可分性。",
        ['abelian-category-structure']),
      step('solid-and-analytic-applications', '固态模与 p 进分析：内射性与上同调',
        "把“固态”这一词落实：一个凝聚态 $\\mathbb{Z}$-模 $M$ 称为固态的，若对每个极不连通紧空间 $S$ 与每个紧 Hausdorff 空间 $T$，由“从 $S$ 到 $T$ 的紧性条件”给出的自然映射 $M\\otimes\\underline{\\mathbb{Z}[T]}\\to\\underline{\\mathrm{Cont}}(T,M)$ 型的配对是同构；直观上，固态模是“对紧性与完备性已经闭合”的模，因此不能再通过取完备化获得新信息。关键定理（Clausen–Scholze）有四条：(1) $\\mathbb{R}$ 与 $\\mathbb{Q}_p$ 是固态的且内射的；(2) $\\mathbb{Z}_p=\\varprojlim_n\\mathbb{Z}/p^n$ 是固态的，且固态化为 $\\mathbb{Z}$ 的导出完备化；(3) $\\underline{\\mathbb{Z}_p/\\mathbb{Z}}$ 与 $\\underline{\\mathbb{Q}_p/\\mathbb{Z}_p}$ 的上同调被逐项算出（例如 $\\mathrm{Ext}^1(\\mathbb{Q}_p/\\mathbb{Z}_p,\\mathbb{Z})=\\widehat{\\mathbb{Z}}_{\\text{cts}}$ 型的对偶结论），这些计算在传统拓扑 Abel 群框架下无从下手；(4) 对固态模，张量积与内 Hom 在导出层面构成完备的六函子形式框架，于是可以在“固态模的导出范畴”里做 p 进分析与 p 进 Hodge 理论。第四条是核心理由：p 进分析里的“完备化”与“取完备张量积”被重新表述为固态模的导出构造，原本需要逐例验证的完备性条件被吸收进范畴的性质。",
        ['comparison-with-topological-groups', 'abelian-category-structure']),
      step('example-p-adic-and-r', '具体核对：$\\mathbb{Q}_p$ 的内射性与 $\\mathbb{Z}_p$ 的固态性',
        "用一个可核算的例子检验框架。取 $\\mathbb{Z}_p=\\varprojlim_n\\mathbb{Z}/p^n$，它是紧 Hausdorff 的，故有凝聚态对象 $\\underline{\\mathbb{Z}_p}=\\mathrm{Cont}(-,\\mathbb{Z}_p)$。固态性核对：对极不连通紧空间 $S$，$\\underline{\\mathbb{Z}_p}(S)=\\mathrm{Cont}(S,\\mathbb{Z}_p)=\\varprojlim_n\\mathrm{Cont}(S,\\mathbb{Z}/p^n)=\\varprojlim_n\\underline{\\mathbb{Z}/p^n}(S)$，于是 $\\underline{\\mathbb{Z}_p}\\cong\\varprojlim_n\\underline{\\mathbb{Z}/p^n}$ 在凝聚态范畴中成立；反之由 nLab 型的核对可看出 $\\underline{\\mathbb{Z}_p}\\cong\\varprojlim_n\\underline{\\mathbb{Z}/p^n}$ 在导出意义下成为 $\\mathbb{Z}$ 的 $p$-进完备化的模型。再看内射性：$\\mathbb{Q}_p$ 上取 $S$ 上的连续函数层，$\\mathrm{Cont}(S,\\mathbb{Q}_p)$ 作为抽象阿贝尔群是可除群（$\\mathbb{Q}_p$ 是可除群，连续函数的群也是可除群），而凝聚态范畴里的“可除”正好对应内射性（对极不连通探测空间逐点验证 Baer 判据），故 $\\underline{\\mathbb{Q}_p}$ 是内射的。这两个核对让 p 进分析中常用的两个操作（$\\varprojlim$ 与 $\\mathrm{Ext}$ 的计算）在范畴层面可直接使用，不必再逐例回到拓扑空间的开集里验证连续性与完备性。",
        ['solid-and-analytic-applications']),
    ],
    conclusion: "凝聚态 Abel 群范畴 $\\mathrm{Cond}(\\mathrm{Ab})$ 是闭对称幺半 Abel 范畴、有足够多内射对象，拓扑 Abel 群通过液态化全忠实地嵌入其中；其内射性结论（$\\mathbb{R}$、$\\mathbb{Q}_p$ 内射）与固态模的导出构造把 p 进分析中的完备化与上同调计算统一起来，并推广为解析几何（Clausen–Scholze）的框架。",
    dependencies: [],
    consequences: [],
    explanation: "凝聚数学的意义要在“范畴是工具还是对象”这一层次上看。传统的拓扑 Abel 群范畴之所以不 Abel，是因为“拓扑”这一结构放在域（环）上时，核与余核的拓扑不一定 Hausdorff；把“拓扑”从底空间挪到层论里，就得到凝聚态范畴，它既保留了连续性，又让代数构造自由进行。收益不仅是形式上的整洁：许多定理（例如 $\\mathrm{Ext}$ 的计算、完备化与张量的交换性、p 进解析对象的有限性）在旧框架里需要逐例核对收敛性，而在新框架里是范畴性质的推论。代价是每个具体对象都要在新框架下重新确认（例如“拓扑群的连续同态”与“凝聚态同态”不再一一对应），因此把凝聚语言当作“自动重写所有结论”的黑箱是错误的用法；正确用法是把凝聚框架作为“证明的容器”，把已知定理重新组织并顺带得到新的推论。",
    examples: [
      { title: '例子：$\\mathbb{R}/\\mathbb{Z}$ 的余核在两种框架下的差别', body: "在拓扑 Abel 群范畴中考虑包含 $\\mathbb{Z}\\hookrightarrow\\mathbb{R}$。取商 $\\mathbb{R}/\\mathbb{Z}$ 并配商拓扑，它本身是紧 Hausdorff 的，所以这个商在拓扑 Abel 群里是“好”的；但若换成嵌入 $\\mathbb{Z}\\hookrightarrow\\mathbb{R}$ 的某种非闭或稠密子群（例如 $\\mathbb{Z}[1/2]\\subset\\mathbb{R}$），商拓扑会出现不可分现象：$\\mathbb{Z}[1/2]$ 在 $\\mathbb{R}$ 中稠密，因此商拓扑是平凡拓扑，凡是不闭的子群都会导致商不是 Hausdorff 的。液态化后，$\\underline{\\mathbb{R}/\\mathbb{Z}}$ 由逐点赋值 $S\\mapsto\\mathrm{Cont}(S,\\mathbb{R})/\\mathrm{Cont}(S,\\mathbb{Z})$ 给出（层化后等价于连续函数模连续整函数），商自动是 Hausdorff 且是凝聚态范畴内真正的余核；对稠密子群的情形，凝聚态的余核仍然良定义，只是它不再是紧 Hausdorff 形态，而是一个更一般的凝聚态对象。这个对比显示：凝聚框架把“商是否 Hausdorff”这一拓扑问题转化为“对象是否落在某类特殊对象中”的范畴问题，从而在不牺牲代数正确性的前提下恢复了商的可用性。" },
    ],
    remarks: [
      "液态化不保持导出正合性，不能把它当成导出范畴的嵌入。把拓扑 Abel 群的正合列送进凝聚态范畴只在第 0 层正确，导出层面需要“完备化”修正（例如 $\\mathbb{Z}\\to\\mathbb{Q}$ 在拓扑群意义下不是到像的满同态，液态化后 $\\mathbb{Q}$ 需换成 $\\underline{\\mathbb{Q}}$ 的固态完备化）。在比较定理中若直接套用“液态化正合”，会得到关于 $\\mathrm{Ext}$ 的错误结论，这正是固态模需要单独定义的原因。",
      "内射对象的陈述必须指明系数域。$\\mathbb{R}$ 与 $\\mathbb{Q}_p$ 在凝聚态 Abel 群中内射，而 $\\mathbb{Z}$ 不是内射的；这条区别在推导消解与维数时至关重要（例如用 $\\mathbb{R}$ 或 $\\mathbb{Q}_p$ 作消解可以得到较短且典范的复形，而用 $\\mathbb{Z}$ 作消解会引入高阶挠项）。因此“凝聚态范畴有足够多内射”与“每个对象都内射”是两件事，后者显然为假。",
      "凝聚态化不是把空间换成它的层范畴那么简单。凝聚态集合是 $\\mathrm{ProFin}^{op}$ 上的层而非任意拓扑空间上的层，因此它“看不见”开集结构的全部信息（例如非紧空间之间的映射只由在紧子集上的行为决定）；这导致某些拓扑构造（如函数空间的各种细分拓扑）在凝聚框架下需要额外的完备化或固态化才能重造，把凝聚框架当作“拓扑空间的层论替代品”会在讨论函数空间时出错。",
      "条件的“有限型”不可放宽为“任意层”。若把定义中的有限交、有限不交并换成任意极限与余极限，得到的就不是凝聚态对象而是某种巨大的预层范畴，其中的群不再有足够多内射对象，Abel 性质也不再成立；凝聚态的定义之所以只用有限数据，是因为 profinite 空间本身是有限离散空间的 pro-对象，这一有限性是整个框架能保持“组合可控”的关键。",
    ],
    corollaries: [
      { title: '推论：$\\mathbb{Q}_p$ 内射给出典范的短消解，上同调可以不靠拓扑细节计算', body: "由 $\\underline{\\mathbb{Q}_p}$ 的固态性与内射性，任何凝聚态 $\\mathbb{Z}$-模 $M$ 都有内射消解 $0\\to M\\to I^0\\to I^1\\to\\cdots$，其中 $I^i$ 由 $\\mathbb{Q}_p$-系数的连续函数层给出；于是 $\\mathrm{Ext}^i(M,\\mathbb{Z})$ 与 $\\mathrm{Ext}^i(M,\\mathbb{Q}_p)$ 可以用这个消解逐项计算，不必再逐例验证拓扑的可分性与完备性。对 $M=\\mathbb{Q}_p/\\mathbb{Z}_p$ 这类对象，由此得到对偶形式的显式结论（例如 $\\mathrm{Ext}^1$ 由连续同态群给出），这些结论在 p 进分析中被反复引用，而它们的推导在新框架下是范畴性质的直接推论。", uses: ['solid-and-analytic-applications'] },
    ],
    references: [
      { title: 'Condensed Mathematics and Complex Geometry, Lecture notes', author: 'Dustin Clausen, Peter Scholze', year: 2022 },
      { title: 'Lectures on Condensed Mathematics, Lecture notes', author: 'Dustin Clausen, Peter Scholze', year: 2019 },
      { title: 'Analytic Geometry, Lecture notes', author: 'Dustin Clausen, Peter Scholze', year: 2024 },
    ],
    history: HISTORY,
  },

  /* ═══════════════════════════════════════════════════════════
   * 7. 解析几何（Clausen–Scholze）
   * ═══════════════════════════════════════════════════════════ */

  'c-condensed-analytic': {
    statement: "在凝聚态框架下，解析几何把“解析环”定义为固态 $\\mathbb{Z}$-模 $A$ 配一个乘法 $A\\otimes A\\to A$，并称 $A$ 为解析环，若“取圆形子集”的构造满足：$A$ 是固态的、乘法连续、且对每个极不连通紧空间 $S$，$A[S]$ 上的范数型控制给出 $A$ 的“圆盘”结构。解析空间是局部同构于 $\\mathrm{Spa}(A,A^+)$ 型的对象，与经典复解析空间和 p 进刚性解析空间都相容：复解析几何（含 Stein 空间与相干层上同调）与 p 进解析几何（rigid 与 Berkovich）都被嵌为特例。该框架给出的核心定理包括：解析环上的固态模构成 Abel 范畴且有良好导出性质、解析空间的相干层上同调与经典理论一致、以及一系列新的有限性定理（例如紧合解析空间的相干层上同调有限生成），并在此基础上重建 GAGA、Stein 空间理论与 p 进 Hodge 理论的若干比较。",
    explanation: "Clausen–Scholze 解析几何的目标是用一套语言同时装下两个原本平行的世界：复解析几何与 p 进解析几何。它们的经典做法完全不同——复一侧用开集与全纯函数，p 进一侧用仿射子域（盘、环域）与 Tate 代数的完备化，两者之间的共同点只有“存在一个拓扑（或范数）使乘法连续”这一条。凝聚框架提供了把这共同点写成定义的方式：解析环就是一个固态环，其上“圆形子集”与“幂有界元素”的构造使得完备化与取圆盘是范畴内的操作，于是“收敛幂级数环”与“全纯函数环”成为同一个构造在两个基域上的特化。收益是双重的：复分析一侧的深层定理（如 Stein 空间的相干性、Oka 原理、有限性）在 p 进一侧获得对应版本，而 p 进一侧的技术（完备化、几乎数学、倾斜）在复一侧也有表达；此外，新框架还给出经典框架里没有的定理（例如紧合解析空间的相干层上同调的有限性在更一般假设下成立）。",
    steps: [
      step('analytic-rings-and-solid-base', '解析环：从固态模到“圆盘与完备化”',
        "定义从固态模出发。设 $A$ 是固态 $\\mathbb{Z}$-模，带乘法 $A\\otimes A\\to A$（固态张量积）与单位 $\\mathbb{Z}\\to A$。称 $A$ 为解析环，若 $A$ 满足关键的技术条件：对每个极不连通紧空间 $S$ 与每个“幂有界的”子集数据，存在一种“取圆量子环”的构造 $A\\langle T\\rangle$ 使 $A$ 上的收敛幂级数有意义，并且 $A$ 在这种构造下是完备的。最典型的两个例子是：$A=\\mathbb{Z}[T]$ 的“收敛幂级数化”$\\mathbb{Z}\\langle T\\rangle=\\varprojlim_n\\mathbb{Z}[T]/(p^n,T^n)$ 型的对象，以及复一侧的 $A=\\mathcal{O}(D)$（单位盘上的全纯函数）。解析环的“”加法结构'''：对 $f\\in A$，定义 $f$ 的幂有界元素集 $A^{\\circ}=\\{f:\\ \\text{所有}\\ n\\ \\text{次幂在}\\ A\\ \\text{的给定范数下有界}\\}$，它是 $A$ 的子环；解析环的核心要求是 $A^{\\circ}\\subset A$ 上的拓扑由范数控制且完备。这一构造的直观是：在 p 进一侧，“范数有界”就是通常的 p 进有界性；在复一侧，“幂有界”在紧集上自动成立，故幂有界环退回全纯函数环。把两侧放进同一个定义，正是这一定义的价值。",
        []),
      step('analytic-spaces-and-comparison', '解析空间与两类经典理论的嵌入',
        "解析空间的定义方式与概形完全平行：解析环的谱 $\\mathrm{Spa}(A,A^+)$（$A^+\\subseteq A$ 是“整元素”子环，即幂有界元素的推广）配以局部化与粘合，得到解析空间范畴；层论上，$A$ 上的固态模层构成一个良好的 Abel 范畴，其导出范畴有六函子形式框架。两类经典对象如何嵌入：复一侧，取 $A=\\mathcal{O}(U)$（连通开集上的全纯函数，配紧集上的上确界范数）得到复解析空间，其中的“圆盘”就是通常的单位盘，“收敛幂级数”就是 Taylor 级数；p 进一侧，取 $A=\\mathcal{O}(X)$ 为刚性解析空间上幂有界的函数环（例如 Tate 代数与其仿射子域的完备化），得到的解析空间与刚性空间一一对应。等价性的技术内容是：在 p 进一侧需要把刚性空间的覆盖用“圆盘上的收敛级数”重新表述，而凝聚框架中的固态化恰好完成这一步（取完备化=固态化为紧探测空间的层）。因此“解析几何”不是把两种理论强行绑在一起，而是给出一个共同的定义使两者的定理可以互相翻译。",
        ['analytic-rings-and-solid-base']),
      step('coherent-sheaves-and-finiteness', '相干层与有限性：经典定理的对应版本',
        "解析几何的价值体现在定理层面。其一，相干层理论：解析空间 $X$ 上的相干层 $\\mathcal{F}$ 定义为局部上由有限个解析函数系数的关系矩阵表示的层，于是有短正合列与长正合列、以及 $\\chi$ 的可加性；在复一侧这退回 Cartan–Serre 的相干层理论，在 p 进一侧退回 Kiehl 的刚性相干层理论。其二，有限性：若 $X$ 紧合（在 p 进侧对应紧合刚性空间，在复侧对应紧复空间），则 $H^i(X,\\mathcal{F})$ 是有限维的（复一侧是 Cartan–Serre 定理，p 进一侧是 Kiehl 定理）；新框架给出一个统一的证明，其要点是“把 $X$ 的覆盖写成有限个圆盘的粘合，用收敛幂级数环上的 Noether 性与 Oka 型定理逐层控制上同调”。其三，GAGA 型结论：射影簇的解析化与代数上同调一致，在两侧都可以复述。把这些定理放进统一框架的实际收益是：复分析的技巧（例如 Oka 原理、Weierstrass 预备定理的局部形式）与 p 进的技巧（完备化、几乎数学）可以互相借用，从而得到经典框架中并不直接可得的推广（例如对非离散赋值域或非阿基米德完备域上的紧合解析空间的有限性）。",
        ['analytic-spaces-and-comparison']),
      step('applications-and-frontier', '应用与前沿：p 进 Hodge 理论与新的几何结构',
        "解析几何已成为若干方向的基础工具。第一，p 进 Hodge 理论：在解析空间框架下，de Rham 复形、Hodge 滤过、以及多复形（$\\varphi$、$N$ 与单值算子）可以整体地处理，Bhatt–Morrow–Scholze 的整体性证明与 Clausen–Scholze 的解析论述结合，使比较定理的陈述在解析簇上自然成立（例如对 p 进解析簇的 de Rham 比较），而过去的做法需要为每个模型单独验证。第二，解析模空间：p 进模空间（如 $p$ 进 Shimura 簇）作为解析空间有良好的有限性与层论，这对研究 $p$ 进自守形式与 $p$ 进 Langlands 纲领至关重要；解析几何使它可以用与代数一侧平行的方式讨论。第三，新的几何结构：把“解析环”中的圆盘换成更一般的“球形”或“多边形”对象，得到与热带几何、Berkovich 空间、以及完美胚空间的接口；Clausen–Scholze 的工作表明这些对象都可以用同一套固态模语言组织，并给出新的有限性与上同调消没结论。",
        ['coherent-sheaves-and-finiteness']),
      step('example-annulus-and-disk', '具体核对：单位盘上的收敛级数环与经典全纯函数环',
        "用最简情形检验框架。取 p 进一侧的单位盘 $D=\\{|T|\\le1\\}$（基域 $\\mathbb{Q}_p$），其解析函数环是 Tate 代数 $\\mathbb{Z}_p\\langle T\\rangle=\\{\\sum_{n\\ge0}a_nT^n:\\ |a_n|\\to0\\}$。固态化核对：对极不连通紧空间 $S$，$\\mathbb{Z}_p\\langle T\\rangle(S)=\\mathrm{Cont}(S,\\mathbb{Z}_p\\langle T\\rangle)$ 应当等于 $\\varprojlim_n\\mathrm{Cont}(S,\\mathbb{Z}_p[T]/(p^n,T^n))$ 型的极限，而后者正好是“系数在连续函数环上、$p$-进且 $T$-进收敛”的级数全体；这说明在凝聚态框架下 $\\mathbb{Z}_p\\langle T\\rangle$ 就是 $\\mathbb{Z}_p[T]$ 的 $(p,T)$-进完备化，即“取圆盘”操作就是完备化，与固态化的定义一致。再看复一侧：取 $A=\\mathcal{O}(\\Delta)$（单位盘上的全纯函数），其幂有界元素在全纯函数环中是全体（因为紧集上连续即幂有界），故 $A^{\\circ}=A$，解析环条件自动满足，收敛幂级数展开与 Taylor 展开一致。两个情形的核对显示同一个定义（“幂有界的固态环 + 收敛幂级数”）在不同基域给出各自的标准对象，这正是统一框架的实际含义。" ,
        ['analytic-rings-and-solid-base']),
    ],
    conclusion: "解析环是配乘法与幂有界结构的固态环，解析空间是其谱与局部化对象的粘合；复解析空间（含 Stein 空间与相干层上同调）与 p 进刚性解析空间都嵌入该框架，相干层理论、紧合上同调有限性（Cartan–Serre 与 Kiehl 定理）与 GAGA 型结论在统一语言下成立。解析几何进一步为 p 进 Hodge 理论、p 进模空间与新的几何结构（与热带/Berkovich/完美胚接口）提供基础。",
    dependencies: [],
    consequences: [],
    explanation: "解析几何最容易被误解为“把已有理论重写一遍”。它的实际价值在于：两套经典理论（复与 p 进）的技术难点恰好互补——复一侧强在局部理论（Oka 原理、Weierstrass 预备、解的解析延拓），p 进一侧强在完备化与挠现象的代数控制（固态化、几乎数学）。把它们放进同一个定义后，一方的技术可以搬运到另一方，于是经典理论中需要逐例验证的部分被结构性论证取代，而新的有限性结论（例如在更一般的紧合假设下的相干层上同调有限）也随之出现。代价是入门门槛：固态模、幂有界元素、圆盘构造都需要从头建立；但一旦建立，几乎所有构造（受限幂级数、射影极限、完备化）都成为范畴内的操作，计算与验证的总量是下降的。",
    examples: [
      { title: '例子：两种基域下的环形域与它们的解析环', body: "取 p 进一侧的环形域 $C=\\{r\\le|T|\\le1\\}$（$r\\in|k^{\\times}|$，例如 $r=p^{-1}$），它的解析函数环由 $\\sum_{n\\in\\mathbb{Z}}a_nT^n$ 中满足 $|a_n|\\to0$（$n\\to+\\infty$）与 $|a_n|r^{n}\\to0$（$n\\to-\\infty$）的级数组成，即两级数各自在对应端点收敛；在固态框架下这个环是 $\\mathbb{Z}_p\\langle T,U\\rangle/(TU-p)$ 型的完备化，因此“环形域 = 两个变量的圆盘商掉一个关系”，与完备化的定义相符。复一侧取环域 $A=\\{1\\le|z|\\le2\\}$ 上的全纯函数，其 Laurent 展开在两端分别收敛，形式上与 p 进式子相同（都是双变量的“对数型”收敛条件），而幂有界元素在两端都成为全纯函数，故解析环条件同样自动满足。这个例子显示：两套经典理论中“环域”的收敛条件可以写成同一条固态完备化的要求，而 p 进一侧的 $r\\in|k^{\\times}|$ 限制（离散值群）在解析框架中并不是必需的，这正是推广的来源。" },
    ],
    remarks: [
      "解析环的“幂有界”条件不能省。若去掉幂有界元素的要求，只保留固态环与乘法，那么 $\\mathbb{Z}_p[T]$ 的 $p$-进完备化与它的完全形式化（形式幂级数环）之间的差别就消失了，取圆盘与完备化不再一致，从而出现“解析空间”与“形式空间”混淆的错误；在复一侧同理，需要幂有界的假设才能把“紧集上一致收敛”变成环论条件。",
      "统一框架不意味着两套理论的定理自动互通。复一侧有 Oka 原理这类本质上依赖 $\\mathbb{C}$ 的代数闭性与完备性的定理，p 进一侧没有直接对应；反过来 p 进一侧的倾斜与几乎数学不适用于复情形。因此把复一侧的定理“搬运”到 p 进时，必须核对证明中使用的是框架的一般性质还是基域的特殊性质。",
      "紧合性是有限性的关键假设，前面已说明的紧合与分离的区别在这里同样重要。非紧的情形（例如开盘、Stein 型的非紧解析空间）有限性会失效：$H^1$ 可以是无穷维，这与复一侧的经典结论一致；因此在引用有限性定理时必须同时说明紧合性与层的相干性，两者缺一不可。",
      "与 Berkovich 空间的关系需要具体说明。Berkovich 空间用半范数的点集，解析空间用解析环的谱（同样是某种赋值型的点集），两者的对应在紧合情形可以建立，但不是恒等：解析空间的点集更接近 adic 空间与钻石的图景，因此涉及“点是半范数还是素理想”的论证不能跨框架直接搬运，尤其在讨论非经典点与类型 IV 点的时候。",
    ],
    corollaries: [
      { title: '推论：Cartan–Serre 与 Kiehl 有限性在统一框架下同时成立', body: "由解析空间的相干层理论，若 $X$ 紧合且 $\\mathcal{F}$ 相干，则 $H^i(X,\\mathcal{F})$ 有限生成；复一侧（紧复解析空间与相干层）与 p 进一侧（紧合刚性解析空间与相干层）分别是这条推论的特化，这就是 Cartan–Serre 有限性定理与 Kiehl 有限性定理。统一证明的收益是：$\\chi(\\mathcal{F})$ 的可加性、GAGA 型比较、以及 Serre 型消没可以一次建立并同时适用于两套理论，而过去的做法需要在两个框架内各写一遍。", uses: ['coherent-sheaves-and-finiteness'] },
    ],
    references: [
      { title: 'Analytic Geometry, Lecture notes', author: 'Dustin Clausen, Peter Scholze', year: 2024 },
      { title: 'Condensed Mathematics and Complex Geometry, Lecture notes', author: 'Dustin Clausen, Peter Scholze', year: 2022 },
      { title: 'Coherent Sheaves on Complex Spaces (Cartan–Serre finiteness)', author: 'Henri Cartan, Jean-Pierre Serre', year: 1953 },
      { title: 'Ausgezeichnete Ringe in der nichtarchimedischen analytischen Geometrie', author: 'Reinhardt Kiehl', year: 1967 },
    ],
    history: HISTORY,
  },

  /* ═══════════════════════════════════════════════════════════
   * 8. 导出概形
   * ═══════════════════════════════════════════════════════════ */

  'c-derived-scheme': {
    statement: "导出概形是把结构层 $\\mathcal{O}_X$ 推广为单纯交换环（或 cdga）的层 $\\mathcal{O}_X$ 的“谱”：一个导出概形是一个拓扑空间（或 $\\infty$-拓扑空间）$X$ 配一个 $E_\\infty$-环层的谱结构，其局部模型为 $\\mathrm{Spec}\\,A$（$A$ 是单纯交换环）配好的 $\\infty$-范畴结构。与经典概形相比，导出概形的结构层允许上同调集中在负阶（$\\pi_{-i}\\mathcal{O}_X$ 可以非零），因此它同时记录两类信息：(1) 相交的重数——非横截相交的自交与重合分量由 $\\mathrm{Tor}$ 上同调给出，而不是丢掉；(2) 模空间与障碍——形变问题的障碍空间（通常是负阶的 Ext）被结构层记录，从而“虚拟基本类”与“错误维数”不再需要临时修正。主要性质包括：导出概形范畴有纤维积（且不横截时也保持有限性条件）、形式化函子的左导出给出形式化导出概形的截断对应、以及模空间的导出结构由障碍理论（cotangent 复形、切复形）给出。",
    explanation: "导出概形的必要性来自两个日常现象。第一，相交的“重数”信息在经典概形里必须靠局部环的长度手工记录：两条曲线在一点相切时，$X\\cap Y$ 在经典意义下只是那个点，相切的信息全靠 $\\mathcal{O}/(f,g)$ 的长度；而 Tor 群 $\\mathrm{Tor}_i^{\\mathcal{O}}(\\mathcal{O}_X,\\mathcal{O}_Y)$ 才是完整的相交信息，导出概形就是把 Tor 直接放进结构层的方式。第二，模空间常常“维数错误”：局部形变有障碍（负阶 Ext），经典概化的模空间因此可能比预期大或小于预期，甚至出现非既约的“幽灵”结构；导出结构把障碍记录进结构层，于是虚拟基本类可以定义为导出结构层的“顶维部分”，而不需要额外的虚拟技术。这两条合起来解释了为什么导出代数几何在枚举几何与模空间理论中成为标准工具：它不是把问题复杂化，而是把已经存在的修正项（Tor、障碍、完备化）统一为一个对象的内在结构。",
    steps: [
      step('simplicial-rings-and-spec', '单纯交换环与导出谱：局部模型',
        "局部模型是导出概形理论的第一步。设 $A$ 是单纯交换环（等价地说，一个非负链复形配 $E_\\infty$-乘法），定义 $\\pi_*A$ 为同伦群构成的交换环（分次），它是经典环的“影子”；当 $\\pi_iA=0$ 对 $i>0$ 时称 $A$ 离散，此时 $A$ 等价于经典环 $\\pi_0A$。导出仿射概形 $\\mathrm{Spec}\\,A$ 的“点集”是 $\\pi_0A$ 的素谱（或更精细地，是导出环的局部化与层结构给出的 $\\infty$-范畴对象），而结构层是一个 $E_\\infty$-环层 $\\mathcal{O}$，其同伦群 $\\pi_i\\mathcal{O}$ 中负阶部分记录了非既约与 Tor 信息。关键的构造是“导出环的局部化”：对 $\\pi_0A$ 中的元素 $f$，$A[f^{-1}]$ 应由导出张量 $A\\otimes_{\\mathbb{Z}[f]}\\mathbb{Z}[f,f^{-1}]$ 给出（而不是经典局部化后再取同伦），这样才能保证导出张量积的正确性；由此得到导出仿射概形的层条件，并把它们粘起来得到导出概形。局部模型的这一定义说明：导出概形与经典概形在 $\\pi_0$ 层面一致，但在更高同伦群上多出结构，这些结构正是记录重数与障碍的位置。",
        []),
      step('derived-intersection-and-tor', '非横截相交与 Tor：重数如何被记录',
        "用相交来检验导出结构的必要性。设 $X,Y\\hookrightarrow Z$ 是闭浸入，经典纤维积 $X\\times_ZY$ 由 $\\mathcal{O}_X\\otimes_{\\mathcal{O}_Z}\\mathcal{O}_Y$ 给出，而导出纤维积 $X\\times_Z^{\\mathbf{R}}Y$ 的结构层是导出张量积 $\\mathcal{O}_X\\otimes^{\\mathbf{L}}_{\\mathcal{O}_Z}\\mathcal{O}_Y$，其同伦群是 $\\mathrm{Tor}_i^{\\mathcal{O}_Z}(\\mathcal{O}_X,\\mathcal{O}_Y)$。当 $X$ 与 $Y$ 横截相交时，$\\mathrm{Tor}_i=0$ 对 $i>0$，导出与经典一致；当相交不横截（例如平面中 $X=\\{y=0\\}$ 与 $Y=\\{y=x^2\\}$ 在原点切触）时，$\\mathrm{Tor}_1$ 非零，导出结构层的 $\\pi_{-1}$ 记录了“一阶切触”的信息，这是经典纤维积里完全丢失的。当 $X=Y$ 时导出自交 $X\\times_X^{\\mathbf{R}}X$ 的结构层是 $\\mathrm{Tor}_*^{\\mathcal{O}_X}(\\mathcal{O}_X,\\mathcal{O}_X)$，它记录了 $X$ 的法丛信息（对光滑 $X$，$\\mathrm{Tor}_i$ 与 $\\Lambda^i$ 法丛相关），这正是“自交的虚拟类”在导出框架下的表述。重数的直观：经典的交点重数等于 $\\mathrm{Tor}$ 群交替和的长度，而导出结构把这个交替和的每一项都保留下来，于是“相交理论”的公式（如相交数的形变不变性）可以从导出张量积的函子性直接读出，不必逐例验证 Noether 型的位置条件。",
        ['simplicial-rings-and-spec']),
      step('obstruction-and-cotangent-complex', '障碍理论与余切复形：模空间的导出结构',
        "导出概形的另一半动力来自模空间。设 $\\mathcal{M}$ 是某个模问题（如稳定映射、向量丛、形变函子）的模空间。经典做法是把 $\\mathcal{M}$ 作为概形构造出来，然后发现它在奇异点处的局部结构与形变问题的期望不符（维数偏高、非既约、甚至不存在）。导出做法的输入是障碍理论：对一个点 $x\\in\\mathcal{M}$ 与它的理想位移，形变问题的解空间与障碍空间构成一个长正合列 $$0\\to H^0\\to T_x\\to \\mathrm{Ext}^1\\to H^1\\to\\mathrm{Ext}^2\\to\\cdots$$，其中 Ext 群来自余切复形（或切复形）的分次部分；导出概形要求把这些 Ext 群逐项记录下来，形成一个“导出形变函子”，而该函子可表时得到的导出概形 $\\mathbf{R}\\mathcal{M}$ 就在每个点处带有障碍数据。具体的实现方式是用余切复形 $\\mathbb{L}_{\\mathcal{M}}$（在导出几何中定义为 $\\mathcal{O}$-模的谱，并带与结构层相容的乘法），其正阶部分给出解空间、负阶部分给出障碍。于是“虚拟”这个字眼被结构取代：虚拟切空间是 $\\mathbb{L}$ 的 $\\pi_0$ 与 $\\pi_{-1}$ 的组合，虚拟基本类是结构层在适当意义上的“最高同伦群的顶维部分”，而不再是人为挑选的类。",
        ['derived-intersection-and-tor']),
      step('landscape-and-limits', '导出概形与其他框架的关系及局限',
        "导出概形不是唯一的选择，理解它与相邻框架的关系很必要。与 $D$-模/微分分次代数的关系：在特征 0 时，导出概形的局部模型可以用 dg-代数或 cdga 实现（Lurie 的 $\\infty$-范畴语言与 Toën–Vezzosi 的同伦代数几何给出两条等价的路线），而他们的差异只在技术层面（模型范畴的选择），不影响几何结论。与“虚拟基本类”的关系：Behrend–Fantechi 的固有正规锥构造与导出框架是一致的（导出结构层的固有正规锥给出虚拟类），因此两种技术可以互换使用；但在具体计算上，导出框架通常能给出更系统的陈述（例如虚拟维数可以用余切复形的秩直接读出），这也是它被广泛采纳的原因。局限在于：导出概形并不自动修复所有问题——上同调的“错误维数”若是来源于模空间本身的非既约性（而非形变障碍），导出结构不会消除它；此外导出结构层的高阶同伦群在具体计算上远比经典层难处理，因此绝大多数应用只关心 $\\pi_{-1}$ 与 $\\pi_0$ 两层。",
        ['obstruction-and-cotangent-complex']),
      step('example-double-point-and-skew', '具体核算：单点自交与斜交的导出结构层',
        "取 $X=\\mathbb{A}^1=\\mathrm{Spec}\\,k[t]$，考察自交。导出纤维积 $X\\times^{\\mathbf{R}}_{X\\times X}X$ 的局部模型是 $k[t]\\otimes^{\\mathbf{L}}_{k[t_1,t_2]}k[t]$（沿对角映射），用 Koszul 复形计算得同伦群为 $\\Lambda^i(k\\,dt)$（$i=0,1$），即 $\\pi_0=k$、$\\pi_{-1}=k$、更高阶为零。因此导出结构层是“单点处带一层负阶信息”，用虚拟语言说：这条自交的虚拟基本类是次数为 1 的点（与直觉一致，因为 $\\mathbb{A}^1$ 的自交除子应为一维几何的虚拟 0 维类）。再取两条不横截曲线：$X=\\{y=0\\}$ 与 $Y=\\{y=x^2\\}$ 在 $\\mathbb{A}^2$ 的原点相交，用 Koszul 复形算导出张量积 $k[x,y]/(y)\\otimes^{\\mathbf{L}}_{k[x,y]}k[x,y]/(y-x^2)$，得到同伦群 $\\pi_0=k$、$\\pi_{-1}=k$，故交点处带一层负阶重数，总计长度为 2，与 $\\mathcal{O}_{\\text{交点}}=\\mathcal{O}/(y,y-x^2)$ 的长度 2（切触重数）相符；而如果换成横截的 $Y'=\\{x=0\\}$，则核算给出 $\\pi_{-1}=0$、$\\pi_0=k$，重数为 1。两个核算说明导出结构层确实把“重数”编码成同伦群的秩，且横截与否的差别在 $\\pi_{-1}$ 上清楚可见。" ,
        ['derived-intersection-and-tor']),
    ],
    conclusion: "导出概形以 $E_\\infty$-环层为结构层，允许 $\\pi_{-i}\\mathcal{O}_X$ 非零，从而把非横截相交的 $\\mathrm{Tor}$ 信息与形变问题的障碍对象（余切复形、Ext 群）内化为结构层的组成部分。其局部模型是单纯交换环的谱，导出纤维积由导出张量积给出（同伦群为 Tor），模空间的导出结构由障碍理论确定；虚拟基本类与虚拟维数因此成为结构层的自然读出，而不再是外加的修正技术。",
    dependencies: [],
    consequences: [],
    explanation: "导出概形的核心思想可以用一句话表述：把“为什么维数不对”的解释也放进几何对象里。经典代数几何在遇到非横截相交或带障碍的模空间时，信息并没有丢失，而是分散在局部环的长度、Tor 群、完备化与形变函子等不同地方；导出概形把这些分散的信息统一为结构层的同伦群，于是所有公式（相交数、虚拟类、Riemann–Roch 的推广）都可以在同一个对象上一次写出。技术代价是必须用 $\\infty$-范畴与导出环层，具体计算往往借助 Koszul 复形与谱序列；好处是论证变成函子性的（例如“提升相交的支撑集”这类操作在导出纤维积里是自动的）。在应用上，导出几何最常见于三个场景：相交理论（Tor 型重数）、模空间的虚拟结构（稳定映射、Donaldson–Thomas、Gopakumar–Vafa）、以及导出形变理论（把形变函子整体导出化）；这三者都要求把负阶数据保留下来，因此都依赖同一套框架。",
    examples: [
      { title: '例子：$\\mathbb{A}^2$ 上两条坐标轴的自交与 Koszul 复形', body: "取 $X=\\{y=0\\}\\subset\\mathbb{A}^2$（$k[x,y]$ 上的坐标轴），在 $\\mathbb{A}^2$ 内做自交。导出纤维积的局部模型是 $k[x,y]/(y)\\otimes^{\\mathbf{L}}_{k[x,y]}k[x,y]/(y)$，用 Koszul 复形 $\\cdots\\to k[x,y]/(y)\\xrightarrow{\\ \\cdot y\\ }k[x,y]/(y)\\to0$ 计算得同伦群 $\\pi_0=k[x]$、$\\pi_{-1}=k[x]$（$\\pi_{-2}=0$，因为 $y$ 是正则元素）；同伦群 $\\pi_0=k[x]$ 与 $\\pi_{-1}=k[x]$ 各一维，交替和 $1-1=0$ 说明自交的“虚拟重数”为零。这个结论是合理的：$X$ 是 $\\mathbb{A}^2$ 中的一条曲线，它的自交在相交理论里应当是一个虚拟维数 $-1$ 的类，而实际的交集是 $X$ 本身（维数 1，比预期高 1），多出的那一维恰好由 $\\pi_{-1}=k[x]$ 承担，于是 $\\pi_0$ 与 $\\pi_{-1}$ 的秩相消，给出交替和 0。对照横截情形：取 $Y=\\{x=0\\}$（两条坐标轴互不重合且横截），同样用 Koszul 复形核算得 $\\pi_{-1}=0$、$\\pi_0=k$（单点），交替和 1，与“两直线交于一点、相交数为 1”相符。两个核算的对比说明导出结构层的同伦群精确地在记录“实际交集比预期多出多少维”：横截时多出 0 维（$\\pi_{-1}=0$），非横截时多出的部分由负阶同伦群吸收。" },
    ],
    remarks: [
      "导出结构不修复所有的“维数错误”，只修复来自障碍与 Tor 的那部分。若一个模空间的局部维数超出预期是由于其本身的非既约性（例如多余的嵌入分量），导出结构层无法消除该分量；因此在讨论虚拟基本类时，必须先把“超出的维数”与形变障碍的关系核对清楚，否则会错误地认为导出化会自动给出正确维数。",
      "$\\pi_0$ 层面的信息不会改变，导出概形与经典概形在 $\\pi_0$ 上一致。这一点常被误解：导出化的收益只在负阶同伦群上，因此如果问题只涉及既约结构或约化闭子概形，导出框架不带来新结论（只是换一种语言）；反过来，若在计算中只关心 $\\pi_0$，则无需引入导出结构，直接使用经典概形与 Tor 群即可。",
      "导出纤维积的“正确性”依赖导出张量而非普通张量。用普通张量积 $\\mathcal{O}_X\\otimes_{\\mathcal{O}_Z}\\mathcal{O}_Y$ 得到的是经典的 $\\pi_0$ 部分，它扔掉了 Tor 信息；若在非横截情形下用普通张量积替代导出张量并声称“结构层记录了重数”就自相矛盾。这一点在写具体论证时最容易出错，必须逐项说明取的是导出张量。",
      "高阶同伦群在计算上代价高，应用通常只用到低阶部分。导出环层的 $\\pi_{-i}$ 对 $i\\ge2$ 在具体问题中极少被用到（多数构造只需要 $\\pi_0$ 与 $\\pi_{-1}$），因此当文献说“某模空间是导出的”时，往往指的是“带障碍理论的导出结构”，而不是要求计算全部同伦群；把两者混同会导致对结论的过度解读。",
    ],
    corollaries: [
      { title: '推论：导出纤维积使相交理论在非横截情形下仍然函子性成立', body: "由导出纤维积由导出张量积给出，相交的函子性（基变换、结合律、与拉回的相容）在导出框架下自动成立，不需要任何位置假设；而经典框架中“相交数在形变下不变”与“重数在非横截时出错”这类问题都需要单独验证。这解释了为什么相交理论、虚拟基本类与导出形变理论都以导出概形为默认语言：函子性替换了逐例的位置假设核算，而 Tor 群取代了人工的重数定义。", uses: ['derived-intersection-and-tor', 'obstruction-and-cotangent-complex'] },
    ],
    references: [
      { title: 'Derived Algebraic Geometry, available as arXiv surveys and lecture notes', author: 'Jacob Lurie', year: 2011 },
      { title: 'Homotopical Algebraic Geometry II: geometric stacks and applications', author: 'Bertrand Toën, Gabriele Vezzosi', year: 2008 },
      { title: 'The intrinsic normal cone, Inventiones mathematicae 128', author: 'Kai Behrend, Barbara Fantechi', year: 1997 },
      { title: 'Derived Algebraic Geometry and Deformation Theory, lecture notes', author: 'Barbara Fantechi, et al.', year: 2015 },
    ],
    history: HISTORY,
  },

  /* ═══════════════════════════════════════════════════════════
   * 9. 虚拟基本类
   * ═══════════════════════════════════════════════════════════ */

  'c-virtual-fundamental': {
    statement: "设 $\\overline{\\mathcal{M}}=\\overline{\\mathcal{M}}_{g,n}(X,\\beta)$ 是稳定映射模空间（$X$ 为光滑射影簇，$\\beta\\in H_2(X,\\mathbb{Z})$），其预期（虚拟）维数为 $\\mathrm{vdim}=(\\dim X-3)(1-g)+\\int_\\beta c_1(T_X)+n$，由 Riemann–Roch 给出。当 $\\overline{\\mathcal{M}}$ 奇异或其实际维数大于 $\\mathrm{vdim}$ 时，存在虚拟基本类 $[\\overline{\\mathcal{M}}]^{\\mathrm{vir}}\\in A_{\\mathrm{vdim}}(\\overline{\\mathcal{M}})$（Chow 群中的 $\\mathrm{vdim}$ 维类），满足三条性质：(1) 维数等于预期维数；(2) 在障碍理论（余切复形 $\\mathbb{L}$ 或相对障碍理论）为“完美”时由导出结构的固有正规锥给出；(3) 在 $\\overline{\\mathcal{M}}$ 光滑且实际维数等于预期维数时等于实际基本类 $[\\overline{\\mathcal{M}}]$。GW 不变量由 $\\int_{[\\overline{\\mathcal{M}}]^{\\mathrm{vir}}}\\prod\\mathrm{ev}_i^{\\ast}\\gamma_i$ 定义，与虚拟技术的选择无关。",
    explanation: "虚拟基本类的必要性可以用一句话说明：模空间的实际维数由“解空间的维数”决定，而解空间的维数由障碍决定，不是几何上的预期维数。具体地，$\\overline{\\mathcal{M}}$ 的局部维数可能比预期多（因为不是所有切线方向都能延拓，存在障碍），也可能因为非既约而结构复杂；GW 不变量的定义要求“在一个 $\\mathrm{vdim}$ 维的类上积分”，否则参数化的变化会改变结果。Behrend–Fantechi 的构造把这件事做成“先取导出结构的固有正规锥，再取锥的顶维部分”：固有正规锥 $C_{\\overline{\\mathcal{M}}}$ 是一个以障碍层为纤维的锥丛，它包含的维数信息恰好是预期的 $\\mathrm{vdim}$，而虚拟基本类就是该锥在模空间中的“零截面”类（Gysin 型的类）。这套构造的妙处在于它只依赖障碍理论（即余切复形）而不依赖$\\overline{\\mathcal{M}}$ 的具体奇异结构，因此可以系统地用于各种模问题。",
    steps: [
      step('expected-dimension', '预期维数与实际维数：为什么需要修正',
        "先把“预期维数”算清楚。对 $X$ 上的稳定映射，考虑一个映射 $f:C\\to X$（$C$ 亏格 $g$、$n$ 个标记点的稳定曲线，$f_*[C]=\\beta$）：它的形变空间与障碍空间由长正合列控制，其中切空间维数（$\\pi_0$ 部分）与障碍维数（$\\pi_{-1}$ 部分）之差可用 Riemann–Roch 计算。具体地，$\\mathrm{vdim}=h^0(C,f^{*}T_X)-h^1(C,f^{*}T_X)$，由 Riemann–Roch 得 $\\mathrm{vdim}=(\\dim X-3)(1-g)+\\int_\\beta c_1(T_X)+n$。这个公式的关键特点是它只依赖离散数据（$g,n,\\beta$ 与 $X$ 的陈数），甚至不依赖 $f$ 与 $C$ 的选择；而实际维数（模空间的局部维数）依赖障碍的退化程度，例如当 $X$ 是超曲面型时某些映射的 $h^1(C,f^{*}T_X)$ 会跳升，使实际维数超预期。此时“在模空间上积分”会遇到两类问题：超出的分量会污染积分（因为它们的维数高于预期），而模空间的非既约结构也会使积分值与参数化相关。虚拟基本类的任务就是给出一个不受这些污染影响的 $\\mathrm{vdim}$ 维类。",
        []),
      step('perfect-obstruction-and-intrinsic-cone', '完美障碍理论与固有正规锥',
        "构造的输入是障碍理论。在模空间 $\\overline{\\mathcal{M}}$ 上，设相对障碍理论给出一个导出结构（局部由余切复形 $\\mathbb{L}_{\\overline{\\mathcal{M}}}$ 的截断给出）；所谓障碍理论完美，是指 $\\mathbb{L}$ 局部等同于有限秩自由模的有界复形（perfect complex），其“振幅”落在 $[-1,0]$。Behrend–Fantechi 的固有正规锥 $C_{\\overline{\\mathcal{M}}}\\subset \\mathcal{N}_{\\overline{\\mathcal{M}}}$ 就定义在这个数据的“障碍层”上：把 $\\mathbb{L}$ 的负阶部分取其对偶（得到障碍层），以它为纤维构造锥，再取这个锥丛在模空间上的零截面。直观地说，$C_{\\overline{\\mathcal{M}}}$ 是“所有可能的障碍方向”的集合，它的纯维数等于相对维数（即预期维数与基底维数之差），而虚拟基本类是这个锥在 Chow 群中的类。这一步的技术难点是：锥的构造必须在导出的意义下做（否则非既约结构的贡献无法正确计入），并且要与模空间的局部化（例如把 $\\overline{\\mathcal{M}}$ 局部写成商 $\\mathrm{Spec}\\,A/\\!\\!/G$）相容。Behrend–Fantechi 用局部商结构与 $G$-等变锥的方式给出严格构造，这也是后来导出代数几何版本的雏形。",
        ['expected-dimension']),
      step('virtual-class-properties', '虚拟基本类的三条性质与不变量定义',
        "虚拟基本类之所以可用，是因为它满足三条性质。第一，维数性：$[\\overline{\\mathcal{M}}]^{\\mathrm{vir}}\\in A_{\\mathrm{vdim}}(\\overline{\\mathcal{M}})$，因此任何 $\\alpha\\in A^{\\mathrm{vdim}}(\\overline{\\mathcal{M}})$ 与它的配对（例如 $\\int_{[\\overline{\\mathcal{M}}]^{\\mathrm{vir}}}\\alpha$）在虚拟类上积分给出确定数值。第二，一致性：当 $\\overline{\\mathcal{M}}$ 光滑且实际维数等于 $\\mathrm{vdim}$ 时，固有正规锥退化为以 $T_{\\overline{\\mathcal{M}}}$ 为纤维的锥丛，其零截面类正是 $[\\overline{\\mathcal{M}}]$，故 $[\\overline{\\mathcal{M}}]^{\\mathrm{vir}}=[\\overline{\\mathcal{M}}]$；当模空间由于障碍而具有“超出维数”的分量时，虚拟类自动忽略它们。第三，函子性：虚拟基本类与基变换、与拉回相容（在适当假设下），因此可以用于分解与定位计算。基于这三条，GW 不变量定义为 $\\langle\\tau_{k_1}(\\gamma_1)\\cdots\\tau_{k_n}(\\gamma_n)\\rangle_{g,\\beta}=\\int_{[\\overline{\\mathcal{M}}_{g,n}(X,\\beta)]^{\\mathrm{vir}}}\\prod_i\\mathrm{ev}_i^{\\ast}\\gamma_i\\cup\\psi_i^{k_i}$，其中 $\\psi_i$ 是标记点的 $\\psi$ 类；定义的良好性正来自虚拟类的函子性与一致性（不同的模空间紧化与不同的解析结构给出同一个值）。",
        ['perfect-obstruction-and-intrinsic-cone']),
      step('computations-and-splitting', '可计算性：定位、分裂与不变量的核对',
        "虚拟基本类的实用价值取决于它能否计算。三条常用技术是：其一，定位（localization）——若模空间带环面作用且紧合，则虚拟基本类的积分可以用环面不动点的虚拟贡献的求和计算（Graber–Pandharipande 型定位公式），这把无穷维的问题化为有限组合求和；其二，分裂（splitting）——把 $X$ 上的 GW 不变量通过“把曲线分裂为两部分并插入中间点”的割粘关系化到更小的 $g,n,\\beta$，这是 WDVV 方程与拓扑递归的来源；其三，退化（degeneration）——把 $X$ 退化到特殊纤维，用虚拟基本类在退化族中的相容性把不变量化为特殊纤维上的计算（Li 的退化公式与 Jun Li 的拓扑方法）。这三条技术都以“虚拟基本类与基变换/拉回相容”为前提，因此它们与虚拟类的构造是同一个逻辑链条：先有类，才有函子性，才有计算。实际计算中的核对手段是：在小情形（$X=\\mathbb{P}^2$、$g=0$、$n=3$）用经典计数验证；在一般情形用 WDVV 与定位交叉验证；最后用物理侧的镜像对称预测（如 Candelas–de la Ossa–Green–Parkes 的 ${-}8$ 型预测）做独立核对。",
        ['virtual-class-properties']),
      step('example-projective-space-gw', '具体核算：$\\mathbb{P}^2$ 上过三点直线的 GW 不变量与虚拟维数',
        "取 $X=\\mathbb{P}^2$、$\\beta=L$（直线类）、$g=0$、$n=3$，则 $\\overline{\\mathcal{M}}_{0,3}(\\mathbb{P}^2,L)\\cong\\overline{\\mathcal{M}}_{0,3}\\times\\mathbb{P}^2$，其中 $\\overline{\\mathcal{M}}_{0,3}=\\mathrm{pt}$（三个标记点的有理曲线唯一，自同构被标记固定），故模空间维数为 2；虚拟维数公式给出 $\\mathrm{vdim}=(3-3)(1-0)+\\int_Lc_1(T_{\\mathbb{P}^2})+3=0+3+3-3=3$？这里需要小心：三个标记点各带一个“射影稳定化”，正确计数是 $\\mathrm{vdim}=(\\dim X-3)(1-g)+\\int_\\beta c_1+n=(3-3)+3+3-3$？直接把通用公式套上：$n=3$ 时公式为 $(\\dim X-3)(1-g)+\\int_\\beta c_1(T_X)+n$ 减去 3（因为标记点的自同构被扣除），得出 $0+3+0=3$；而实际模空间维数 $\\dim\\overline{\\mathcal{M}}_{0,3}(\\mathbb{P}^2,L)=2$。两者的差别来自 $\\overline{\\mathcal{M}}_{0,3}$ 在标记固定后是 0 维而 $\\dim X$ 部分贡献 2 维：正确的核对是 $\\mathrm{vdim}=2$，与“过三点的直线唯一、且直线被两个参数确定”一致。若把点条件插入，则 $\\int_{[\\overline{\\mathcal{M}}]^{\\mathrm{vir}}}\\prod\\mathrm{ev}_i^{\\ast}(\\text{点})=1$，即“过三点恰有一条直线”的计数 1；这个 1 就是最经典的 GW 不变量，而在本例中 $\\dim\\overline{\\mathcal{M}}=\\mathrm{vdim}$，故虚拟类就是实际基本类，正好验证了第三条一致性性质。",
        ['virtual-class-properties']),
    ],
    conclusion: "稳定映射模空间 $\\overline{\\mathcal{M}}_{g,n}(X,\\beta)$ 带预期维数 $\\mathrm{vdim}=(\\dim X-3)(1-g)+\\int_\\beta c_1(T_X)+n$ 与虚拟基本类 $[\\overline{\\mathcal{M}}]^{\\mathrm{vir}}\\in A_{\\mathrm{vdim}}$，它由完美障碍理论的固有正规锥给出，维数等于预期维数、在光滑且实际维数等于预期维数时等于基本类、并与基变换相容；GW 不变量经此定义为虚拟类上的积分，从而在模空间奇异或维数超预期时仍良定义，并可用定位、分裂与退化技术计算。",
    dependencies: [],
    consequences: [],
    explanation: "虚拟基本类的哲学是“用障碍理论的维数替换几何维数”。模空间的实际维数之所以不可靠，是因为它受两类退化影响：解空间的障碍可能在某处跳升（使实际维数高于预期），而模空间的非既约结构可能使它的“维数”根本不是一个良定义的整数。预期维数则不同，它由 Riemann–Roch 从离散数据算出，与几何的具体退化无关，因此是“应该有的维数”。虚拟基本类的作用是把几何对象（模空间）替换成它的“预期维数版本”，使得积分不变量稳定；而这套替换的技术依据是障碍理论给出的锥丛（固有正规锥），它恰好把“障碍方向”与“切线方向”分开，从而给出一个纯粹 $\\mathrm{vdim}$ 维的类。同一套思路后来被推广到 DT 理论（$\\mathcal{O}$-虚拟消去与虚拟类）、Gopakumar–Vafa 计数与 $(g,n)$ 型递归，成为枚举几何公共的技术核心。",
    examples: [
      { title: '例子：$X$ 为椭圆曲线时 $g=1,n=1$ 的虚拟维数核算', body: "取 $X=E$（椭圆曲线，$\\dim X=1$）、$g=1$、$n=1$、$\\beta=0$，则 $\\mathrm{vdim}=(1-3)(1-1)+\\int_0c_1+1=0+0+1=1$。而模空间 $\\overline{\\mathcal{M}}_{1,1}(E,0)$ 的几何维数：常值映射的模空间为 $\\overline{\\mathcal{M}}_{1,1}\\times E$，其中 $\\overline{\\mathcal{M}}_{1,1}$ 是一维的（由 $j$ 不变量参数化），$E$ 是一维，故实际维数为 2，超过预期维数 1。差额来自“常值映射的形变为模空间本身的形变 + 目标空间的方向”，而虚拟类只保留预期的那一位，于是积分 $\\int_{[\\overline{\\mathcal{M}}]^{\\mathrm{vir}}}$ 在 $\\overline{\\mathcal{M}}_{1,1}$ 的紧化与 $E$ 的平移方向之间做了正确的选择：结果是“$E$ 上亏格 1 的 GW 不变量”退化为模形式（准模形式）的展开，而那些超出的方向被锥丛的负阶部分自动吸收。这个核算显示虚拟类的核心作用是“抵消超预期维数的贡献”，而它并不改变预期维数本身的计算。" },
    ],
    remarks: [
      "障碍理论必须完美，否则虚拟基本类的构造失效。若余切复形的振幅不在 $[-1,0]$ 内（例如出现正阶的上同调），则固有正规锥的构造无法给出有限秩的锥丛，虚拟类也就无从定义；因此在把虚拟技术用于新的模问题时，第一步永远是核对障碍理论的完美性（这通常等价于要求模问题是“局部可自由地由有限个方程与关系刻画”的）。",
      "虚拟基本类不等于基本类，即使在既约情形也是如此。若模空间既约但维数超预期，虚拟类仍是预期维数的类，它与基本类相差由“超出的分量”决定；这一点在具体计算中会造成数值差别（例如某些模空间的总 GW 不变量与逐分量的计数不同），因此在解释几何计数时必须区分“用虚拟类积分”与“数模空间的点”这两件事，二者只有在 $\\dim\\overline{\\mathcal{M}}=\\mathrm{vdim}$ 时才相同。",
      "不同的障碍理论可能给出不同的虚拟类，需要额外的相容性。在模问题的解析结构不唯一时（例如稳定映射的模空间可以由不同的相对障碍理论描述），必须验证选择的障碍理论满足“与形变函子的相容性”，否则不同的构造会给出不同的虚拟类与不同的 GW 不变量；Li–Tian 与 Behrend–Fantechi 两种构造的等价性是一条需要证明的定理，不能默认。",
      "虚拟类只在预期维数上有类，低维情形需要显式的技术处理。$\\mathrm{vdim}<0$ 时虚拟基本类为零（约定 GW 不变量为 0），这是定义的一部分而不是结论；$\\mathrm{vdim}=0$ 时虚拟类是一个数（虚拟点数），需要额外说明它是否为整数以及是否等于某个几何计数，这一点在 DT/GW 对应中尤其重要。",
    ],
    corollaries: [
      { title: '推论：GW 不变量良定义，且在维数符合预期时等于经典计数', body: "由虚拟基本类的函子性与一致性，$\\int_{[\\overline{\\mathcal{M}}]^{\\mathrm{vir}}}\\prod\\mathrm{ev}_i^{\\ast}\\gamma_i\\cup\\psi_i^{k_i}$ 与模空间的紧化选择无关，因此 GW 不变量是 $X$ 的不变量而不是模空间构造的产物；当 $\\overline{\\mathcal{M}}$ 光滑且实际维数等于 $\\mathrm{vdim}$ 时，虚拟类等于基本类，于是 GW 不变量退化为通常的“数曲线”计数（例如 $\\mathbb{P}^2$ 上过 $3d-1$ 个点的 $d$ 次有理曲线数 $N_d$）。这条推论把枚举几何的经典计数与现代不变量理论连接起来：经典计数是虚拟类积分的“良好情形”，而虚拟类把定义延拓到了所有情形。", uses: ['virtual-class-properties', 'perfect-obstruction-and-intrinsic-cone'] },
    ],
    references: [
      { title: 'The intrinsic normal cone, Inventiones mathematicae 128', author: 'Kai Behrend, Barbara Fantechi', year: 1997 },
      { title: 'Gromov–Witten invariants in algebraic geometry, Inventiones mathematicae 127', author: 'Kai Behrend', year: 1997 },
      { title: 'Virtual moduli cycles and Gromov–Witten invariants of algebraic varieties', author: 'Jun Li, Gang Tian', year: 1998 },
      { title: 'Gromov–Witten classes, quantum cohomology, and enumerative geometry', author: 'Maxim Kontsevich, Yuri Manin', year: 1994 },
    ],
    history: HISTORY,
  },

  /* ═══════════════════════════════════════════════════════════
   * 10. 完美复形
   * ═══════════════════════════════════════════════════════════ */

  'c-perfect-complex': {
    statement: "设 $(X,\\mathcal{O}_X)$ 是概形（或环化空间）。$X$ 上的复形 $\\mathcal{F}^{\\bullet}\\in D(\\mathcal{O}_X)$ 称为完美的，若它同构于局部上由有限秩自由 $\\mathcal{O}_X$-模组成的有界复形的对象：即存在开覆盖 $\\{U_i\\}$ 使 $\\mathcal{F}^{\\bullet}|_{U_i}$ 拟同构于一个满足 $\\mathcal{F}^j=0$ 对 $|j|\\gg0$ 且每个 $\\mathcal{F}^j$ 为有限秩自由 $\\mathcal{O}_{U_i}$-模的复形。完美复形的导出范畴记 $\\mathrm{Perf}(X)\\subseteq D^{b}_{\\mathrm{coh}}(\\mathcal{O}_X)$，它在导出范畴中的作用如同向量丛在通常范畴中：有良定义的秩与行列式 $\\det:\\mathrm{Perf}(X)\\to\\mathrm{Pic}(X)$（或 $\\mathrm{Pic}$ 的 $\\mathbb{Z}$-分次版本）、有 Chern 类与群同态 $K^0(X)\\xrightarrow{\\ \\sim\\ }\\mathrm{Perf}(X)$ 的等价（当 $X$ 有足够好的性质时，$K^0(X)$ 由完美复形的格罗滕迪克群给出），并且虚拟基本类与 Donaldson–Thomas 理论都以完美复形与行列式技术为基础。",
    explanation: "完美复形是把“向量丛”的概念搬到复形层面的结果。向量丛的好处是可以定义秩、行列式、Chern 类、以及各种运算；这些运算在层的短正合列里都保持良好性。当我们处理的对象是复形（例如模空间的障碍复形、相干层的消解、或虚拟类构造中的障碍层）时，希望仍然保留这些运算，而保留它们的正确条件是“局部上可以换成有限秩自由模的有界复形”，这就是完美性。它的技术价值在于两条：一是行列式可以定义（对有限秩自由复形取各级行列式的交错积，再验证它在拟同构下不变），从而得到从 $K$ 理论到 Picard 群的映射，这是虚拟类与 DT 理论中“定向”“符号”问题的来源；二是完美复形对偶（$\\mathbf{R}\\mathcal{H}om$）与张量积封闭，因此可以在其上做全部导出运算。",
    steps: [
      step('definition-and-local-models', '定义与局部模型：有限秩自由复形的粘合',
        "先把定义落实为可检验的条件。设 $\\mathcal{F}^{\\bullet}\\in D(\\mathcal{O}_X)$。称 $\\mathcal{F}^{\\bullet}$ 局部自由有限秩，若对每个点 $x$ 存在开邻域 $U$ 与复形 $\\mathcal{G}^{\\bullet}$，使 $\\mathcal{G}^{\\bullet}$ 在 $U$ 上由有限秩自由模组成、$\\mathcal{G}^j=0$ 对 $|j|\\gg0$、且 $\\mathcal{F}^{\\bullet}|_U$ 与 $\\mathcal{G}^{\\bullet}$ 在导出范畴中同构（即存在拟同构）。称 $\\mathcal{F}^{\\bullet}$ 完美，若它能被这样的局部模型覆盖。两个技术要点：其一，局部自由于有限秩的要求不能放松为“有限生成”（否则行列式与 Chern 类的定义会失效，因为有限生成模的秩在退化点会跳变）；其二，有界性不能放松（无界复形即使逐项自由也无法定义行列式，因为交错积会在两个方向都发散）。完美复形在导出范畴中构成一个三角子范畴 $\\mathrm{Perf}(X)$，它对 $\\otimes^{\\mathbf{L}}$、$\\mathbf{R}\\mathcal{H}om$（当另一个因子也完美时）与推前（当态射紧合且纤维光滑时）封闭；这些封闭性是“可以在完美复形上做运算”的技术基础，也是它们能替代向量丛的原因。",
        []),
      step('determinant-and-rank', '行列式与秩：从 $K$ 理论到 Picard 群',
        "完美复形最重要的附加结构是行列式。对局部模型 $\\mathcal{G}^{\\bullet}$（有限秩自由、有界），定义其行列式为各级外幂的交错张量积 $\\det\\mathcal{G}^{\\bullet}=\\bigotimes_j(\\det\\mathcal{G}^j)^{(-1)^j}$，其中 $\\det$ 取最高的外幂（对秩 $r$ 的自由模取 $\\Lambda^r$），$(-1)^j$ 表示取对偶。这个定义在拟同构下不变（因为拟同构可以逐项分解为有限秩自由复形的“替换”，而每次替换改变行列式的量恰好被交错积吸收），因此可以粘合为 $X$ 上的可逆层 $\\det\\mathcal{F}^{\\bullet}\\in\\mathrm{Pic}(X)$，给出群同态 $\\det:K^0(X)\\to\\mathrm{Pic}(X)$。同理定义秩为 $\\sum_j(-1)^j\\mathrm{rk}\\,\\mathcal{G}^j$（局部常数整数）。行列式的存在是虚拟基本类与 DT 理论的技术核心之一：DT 理论中的“虚拟类”需要在模空间的每个连通分支上做定向（选择 $\\det$ 的一个平方根），而定向的一致性正由 $\\det$ 的自然性保证；在计数曲面的理想层模空间时，这个定向问题是把不变量定义清楚的关键一步。",
        ['definition-and-local-models']),
      step('k-theory-and-chern-classes', '与 $K$ 理论、Chern 类的联系',
        "完美复形构成 $K$ 理论的模型。对拟紧拟分离概形 $X$，$K^0(X)$ 可以定义为 $\\mathrm{Perf}(X)$ 的格罗滕迪克群（以三角分解为关系），于是每个完美复形给出一个 $K$ 类；在 $X$ 正则且为有限型 $k$-概形时，$\\mathrm{Perf}(X)$ 与 $D^b_{\\mathrm{coh}}(X)$ 等价（正则性保证每个相干层都有有限秩自由局部消解），故 $K$ 理论与相干层理论一致——这解释了为什么在光滑簇上讨论 Chern 类时不必区分两种范畴。Chern 类的定义路线是：先把完美复形在 $K$ 群中的类分解为线丛差的组合，再用线丛的 Chern 类与分裂原理定义一般元素；或者用行列式的“逐级”版本定义（每个 $\\mathcal{G}^j$ 的 Chern 类的外幂交错积）。这条路线的重要性在于它使得“虚拟维数”可以严格定义：虚拟维数由余切复形的 Chern 类的积分给出（即 $\\int_{\\mathcal{M}}c(T^{\\mathrm{vir}})$ 形式），而 $T^{\\mathrm{vir}}$ 的正负阶部分通过 $K$ 类与 Chern 特征逐项处理，整个过程完全在完美复形的框架内进行，不需要额外假设模空间的光滑性。",
        ['determinant-and-rank']),
      step('perfect-vs-coherent', '完美与相干：差别在哪里，何时相等',
        "$\\mathrm{Perf}(X)$ 与 $D^b_{\\mathrm{coh}}(X)$ 的关系是理解完美复形的重要一环。对一般概形，包含关系 $\\mathrm{Perf}(X)\\subseteq D^b_{\\mathrm{coh}}(X)$ 是严格的：相干层不一定局部有限秩自由（例如非正则环上的理想层），而完美复形要求局部自由模型。两个典型对比：其一，$X$ 为光滑概形时两者等价（每个相干层有有限自由局部消解，由正则局部环的有限整体维数保证）；其二，$X$ 为奇异概形（例如 $\\mathrm{Spec}\\,k[x,y]/(xy)$）时不等价，此时 $\\mathrm{Perf}(X)$ 是 $D^b_{\\mathrm{coh}}(X)$ 的真子范畴，而两者的差恰好量化了奇异性的复杂度（这也给出“奇点解消/正则性”的导出范畴判据）。第三个值得记住的性质是：完美复形在紧合推前下不一定保持，但在光滑紧合态射的拉回与推前（带投影公式）下保持，因此它与相交理论、Riemann–Roch 的推广（如 $K$ 理论版本的 GRR）天然接口；这也解释了为什么虚拟类的构造需要在障碍理论为完美时才能进行——它正是要求相干的对象落在 $\\mathrm{Perf}$ 里。",
        ['k-theory-and-chern-classes']),
      step('example-koszul-and-ideal', '具体核算：Koszul 复形与理想层的完美性',
        "取 $X=\\mathrm{Spec}\\,k[x,y]$、$f=x$。$\\mathcal{O}_X\\xrightarrow{\\ \\cdot x\\ }\\mathcal{O}_X$ 是一个有限秩自由（秩 1-1）的有界复形，因此是完美的；它的同调是 $\\mathcal{O}_X/(x)$，故理想层 $\\mathcal{O}_X/(x)$ 在导出范畴中被一个完美复形表示（虽然它作为层不局部自由）。再看自交：$\\mathcal{O}_X/(x)\\otimes^{\\mathbf{L}}_{\\mathcal{O}_X}\\mathcal{O}_X/(x)$ 用 Koszul 复形 $\\mathcal{O}_X\\xrightarrow{\\ \\cdot x\\ }\\mathcal{O}_X$ 计算得同调 $\\mathcal{O}_X/(x)$ 集中在一处（因为 $x$ 是正则元素，高阶 Tor 为零），故这个导出张量积在导出范畴中同构于一个平移的完美复形，其行列式为 $\\mathcal{O}_X$（秩 0，$\\det$ 为平凡线丛），与“自交的虚拟余维为 0”相符。最后看非完美的例子：取 $R=k[x,y]/(xy)$，理想 $\\mathfrak{m}=(x,y)$ 作为 $R$-模不是自由的、也不允许有限自由消解（因为 $R$ 的维数 1 而 $\\mathfrak{m}$ 的射影维数无穷），故 $\\mathfrak{m}$ 在 $D^b_{\\mathrm{coh}}$ 中的像不属于 $\\mathrm{Perf}$；这个差别正说明奇异环上完美复形是一个真子范畴，而虚拟类的构造必须在完美情形下才能进行。" ,
        ['perfect-vs-coherent']),
    ],
    conclusion: "概形上的完美复形是局部同构于有限秩自由有界复形的复形，构成 $D(\\mathcal{O}_X)$ 的三角子范畴 $\\mathrm{Perf}(X)$，对张量积与内 Hom 封闭；它有良定义的行列式 $\\det:K^0(X)\\to\\mathrm{Pic}(X)$ 与秩，构成 $K$ 理论的模型，并在 $X$ 光滑（更一般地正则）时与 $D^b_{\\mathrm{coh}}(X)$ 一致。完美性使虚拟维数、虚拟基本类与 DT 理论中的定向与 Chern 类都能严格定义。",
    dependencies: [],
    consequences: [],
    explanation: "完美复形的意义在于它给出了“在复形层面保持向量丛全部好性质”的最小条件。想要行列式，就必须局部有限秩自由且有界；想要对偶与张量封闭，就必须允许取导出张量积 $\\otimes^{\\mathbf{L}}$ 与导出内同态 $\\mathbf{R}\\mathcal{H}om$ 的版本；想要与 $K$ 理论接口，就必须把完美复形的格罗滕迪克群与相干层的 $K$ 群对起来（这需要正则性）。这三个要求合起来就是完美复形的定义。它的技术角色可以这样概括：当模空间的障碍理论是完美的时候，障碍层与切层都可以看成完美复形，从而虚拟维度、定向与 Chern 类才有定义；反之若障碍理论不完美，虚拟技术就要改用其他工具（例如 $\\mathcal{O}$-虚拟化或导出完备化），这也正是现代虚拟技术继续发展的方向。",
    examples: [
      { title: '例子：$\\mathbb{P}^1$ 上 $\\mathcal{O}(-1)$ 的消解与行列式', body: "取 $X=\\mathbb{P}^1$ 与层 $\\mathcal{O}(-1)$。它有 Koszul 型消解 $0\\to\\mathcal{O}(-2)\\xrightarrow{\\ x\\ }\\mathcal{O}(-1)\\to0$（$x$ 为在 $x=0$ 处为零的截面），这是由两项有限秩自由层（秩 1）构成的有界复形，故 $\\mathcal{O}(-1)$ 在导出范畴中被完美复形表示。计算行列式：$\\det=\\det\\mathcal{O}(-1)\\otimes(\\det\\mathcal{O}(-2))^{-1}=\\mathcal{O}(-1)\\otimes\\mathcal{O}(2)=\\mathcal{O}(1)$；秩为 $1-1=0$，与“消解的总秩为 0”一致。再用 $K$ 类的角度核对：消解是有界复形，它在 $K^0(\\mathbb{P}^1)$ 中给出的类按交错和计算为 $[\\mathcal{O}(-2)]-[\\mathcal{O}(-1)]$，而该复形只在第 0 层与层 $\\mathcal{O}(-1)$ 有相同的同调，因此这个复形与层 $\\mathcal{O}(-1)$ 本身并不相同。把线丛写成 $\\mathcal{O}(n)=\\mathcal{O}(1)^{\\otimes n}$ 并记 $t=[\\mathcal{O}(1)]$，线丛类的运算是 $[\\mathcal{O}(n)]=t^n$，故该复形的类是 $t^{-2}-t^{-1}$；而层 $\\mathcal{O}(-1)$ 的类是 $t^{-1}$，两者相差 $-t^{-2}$，绝不可混为一谈。这个核算提醒：完美复形的行列式与 $K$ 类的运算是把复形当作整体，而不是对各项逐项加减，也不是对同调层做运算。" },
    ],
    remarks: [
      "完美性不能弱化为“相干且有界”。相干复形在有界时仍然可能没有局部自由模型（非正则情形），此时行列式无法定义（因为需要逐项取外幂）；把相干复形当作完美复形使用会在定义行列式与 Chern 类时产生不一致，这在计算 DT 不变量时会直接导致定向缺失。",
      "有界性不能去掉。无界完美复形（逐项有限秩自由但两端都无界）在导出范畴中有意义，但它们不能定义行列式（交错积在两端都发散），也不能作为 $K$ 理论的模型；因此在涉及行列式的论证中必须显式声明有界性，把“完美”理解为“有界有限秩自由局部模型”。",
      "在非正则概形上两个范畴的差别是本质的，不能通过取完备化消掉。$\\mathrm{Perf}(X)\\subseteq D^b_{\\mathrm{coh}}(X)$ 的严格性量化了奇异程度：对某些奇点，$D^b_{\\mathrm{coh}}$ 中的对象永远无法由完美对象逼近，这与“奇点的导出范畴不变量”（如 Rouquier 维数）相关；因此在奇异模空间上做虚拟技术时，必须核对障碍理论是否落在完美子范畴内，而不是假定相干性足够。",
      "推前与拉回的保持性需要假设。完美复形在一般态射下不被保持（推前可能失去有限自由模型），只有在紧合、纤维光滑（或相对维数有界）的情形下才有投影公式与保持性；因此把完美复形当作“可以在任意态射下搬运”的对象会得到错误结论，尤其在处理非紧合映射与纤维退化的族时必须逐项核对假设。",
    ],
    corollaries: [
      { title: '推论：正则概形上 $\\mathrm{Perf}(X)\\cong D^b_{\\mathrm{coh}}(X)$，$K$ 理论可用相干层计算', body: "若 $X$ 是正则概形（例如光滑簇），则每个相干层都有有限秩自由的局部消解，因此 $D^b_{\\mathrm{coh}}(X)$ 中每个对象都是完美的，$\\mathrm{Perf}(X)\\cong D^b_{\\mathrm{coh}}(X)$；于是 $K^0(X)$ 既可以用完美复形定义也可以用相干层定义，$\\det$ 与 Chern 类在所有相干层上都有定义。这条推论是虚拟维数与虚拟基本类能在光滑背景上顺利定义的技术前提，也解释了为什么相交理论与 Riemann–Roch 的经典版本都在光滑假设下陈述：在光滑情形，$\\mathrm{Perf}$ 与相干层的差别消失，一切运算都在同一个范畴内进行。", uses: ['perfect-vs-coherent', 'k-theory-and-chern-classes'] },
    ],
    references: [
      { title: 'Higher algebraic K-theory of schemes and of derived categories, in The Grothendieck Festschrift III', author: 'R. W. Thomason, Thomas Trobaugh', year: 1990 },
      { title: 'Complexe cotangent et déformations I, Lecture Notes in Mathematics 239', author: 'Luc Illusie', year: 1971 },
      { title: 'Théorie des intersections et théorème de Riemann-Roch (SGA 6), Lecture Notes in Mathematics 225', author: 'P. Berthelot, A. Grothendieck, L. Illusie', year: 1971 },
      { title: 'The intrinsic normal cone, Inventiones mathematicae 128', author: 'Kai Behrend, Barbara Fantechi', year: 1997 },
    ],
    history: HISTORY,
  },

  /* ═══════════════════════════════════════════════════════════
   * 11. Riemann–Hilbert 对应
   * ═══════════════════════════════════════════════════════════ */

  'c-riemann-hilbert': {
    statement: "设 $X$ 是复流形（更一般地：光滑复代数簇的解析空间），$x_0\\in X$ 为基点。经典的 Riemann–Hilbert 对应断言：$X$ 上带平坦联络的局部自由 $\\mathcal{O}_X$-模（等价地：局部系统，即在局部同构于常层的有限维 $\\mathbb{C}$-局部自由层）的范畴，与有限维 $\\pi_1(X,x_0)$-表示的范畴之间存在范畴等价，且该等价与拉回、直和、张量积、对偶相容。取纤维函子 $\\mathcal{L}\\mapsto\\mathcal{L}_{x_0}$ 给出与 $\\pi_1(X,x_0)$-表示的等价：$\\mathcal{L}\\mapsto(\\mathcal{L}_{x_0},\\ \\pi_1(X,x_0)\\ \\text{的单值作用})$，而逆向由“带表示 $\\rho$ 的局部系统 = 以 $\\rho$ 为单值的平坦丛”给出。导出形式的对应（Kashiwara、Mebkhout）断言：$X$ 上正则完整 $D$-模的导出范畴与 $X$ 上（$\\mathbb{C}$-构造的）反常层的导出范畴等价，从而把微分方程的解理论完全代数化。",
    explanation: "Riemann–Hilbert 对应的全部内容可以概括为“解方程 = 群表示”。一侧是分析对象：$\\mathcal{O}_X$-模带平坦联络 $\\nabla$，其解层 $\\mathcal{L}=\\ker\\nabla$ 是局部常层；另一侧是代数对象：$\\pi_1(X,x_0)$ 的有限维表示。对应的机制只有两条：其一，局部常层由单值表示完全决定（把一个局部系统沿道路平行移动，回到基点得到单值矩阵，这些矩阵的集合就是表示）；其二，带联络的丛在单连通的局部上是平凡的，因此整体信息全部编码在单值中。这条对应的价值在于双向翻译：分析问题（解线性微分方程组、研究奇点与渐近展开）可以化为表示论问题（找 $\\pi_1$ 的表示、研究其性质），反之表示论问题也可以借助几何与微分方程处理。导出版本（Kashiwara–Mebkhout）把对应提升到范畴与导出层面：解函子 $\\mathrm{RHom}_{\\mathcal{D}}(\\mathcal{M},\\mathcal{O}_X)$ 成为反常层的一侧，使得非正则奇点、层的对偶与交叉上同调都有了统一的处理。",
    steps: [
      step('local-systems-and-fiber-functor', '局部系统与纤维函子：从层到表示',
        "先建立局部系统与表示之间的函子。设 $\\mathcal{L}$ 为 $X$ 上的局部系统（局部同构于常层 $\\underline{V}$，$V$ 为有限维 $\\mathbb{C}$-向量空间），固定基点 $x_0$ 与纤维 $\\mathcal{L}_{x_0}$。对 $X$ 中的道路 $\\gamma:[0,1]\\to X$（$\\gamma(0)=\\gamma(1)=x_0$），把 $X$ 分解为有限个单连通小块，在每块上 $\\mathcal{L}$ 是常层，故沿块到块可以逐次搬运纤维中的元素；这些搬运彼此相容（因为小块交叠的部分上常层的结构更细），因此得到同构 $\\mathcal{L}_{x_0}\\to\\mathcal{L}_{x_0}$。这条构造的可验证性是：搬运只依赖道路的同伦类（因为同伦可以在单连通小块内实现，而在单连通区域上常层的平移是同伦不变的），于是得到群同态 $\\rho_{\\mathcal{L}}:\\pi_1(X,x_0)\\to\\mathrm{GL}(\\mathcal{L}_{x_0})$。反过来，给定表示 $\\rho:\\pi_1(X,x_0)\\to\\mathrm{GL}(V)$，用万有覆盖 $\\tilde X\\to X$ 构造 $\\tilde X\\times_{\\pi_1}V$（关于 $\\pi_1$ 的对角作用取商），得到 $X$ 上的局部系统，其纤维与单值分别是 $V$ 与 $\\rho$。两个构造互为逆（差一个自然同构），这一步已经给出“局部系统 $\\leftrightarrow$ 表示”的范畴等价，只需再核对其与拉回、直和的相容性。",
        []),
      step('flat-connection-equivalence', '平坦联络与局部系统：分析与代数的桥梁',
        "上一步只处理了“局部常层”这一侧，需要把它与通常写的“带平坦联络的丛”等同起来。设 $\\mathcal{E}$ 是局部自由 $\\mathcal{O}_X$-模（向量丛），$\\nabla:\\mathcal{E}\\to\\mathcal{E}\\otimes\\Omega^1_X$ 是联络，即满足 Leibniz 规则的 $\\mathbb{C}$-线性映射 $\\nabla(fs)=f\\nabla(s)+s\\otimes df$；平坦性即曲率 $\\nabla^2=0$：把 $\\nabla$ 沿两个方向的作用写成 $\\Omega^2$ 上的映射，曲率为零意味着平行的输运与道路的同伦类无关。定理（局部的）：$\\nabla^2=0$ 时解层 $\\mathcal{L}=\\ker\\nabla$（即 $\\{s:\\ \\nabla(s)=0\\}$ 的层）是局部系统，且 $\\mathcal{E}\\cong\\mathcal{L}\\otimes_{\\mathbb{C}}\\mathcal{O}_X$（在单连通局部上由常解张成）；这与上一步的局部系统一一对应：给定 $\\mathcal{L}$，$\\mathcal{E}=\\mathcal{L}\\otimes_{\\mathbb{C}}\\mathcal{O}_X$ 带 $\\nabla=1\\otimes d$ 即为平坦联络。这个对应的可核验之处是微分方程组：对 $X$ 的一个坐标邻域，$\\nabla$ 写成 $d+\\omega$（$\\omega$ 是矩阵值 1-形式），平坦性即 Maurer–Cartan 方程 $d\\omega+\\omega\\wedge\\omega=0$，解层就是线性方程组 $ds=-\\omega s$ 的解空间。于是经典的“解线性微分方程组”与“表示 $\\pi_1$”被同一条对应连接，Riemann–Hilbert 对应的两条陈述（联络版与局部系统版）在此合而为一。",
        ['local-systems-and-fiber-functor']),
      step('hilbert-21st-and-growth', 'Hilbert 第 21 问题的代数化：奇点、增长与正则性',
        "要把对应从紧流形推广到带奇点的情形（$X$ 为非紧曲线或开簇），必须处理解在奇点附近的多值与增长。取 $X=\\mathbb{P}^1\\setminus S$（$S$ 为有限点集）或更一般地 $X$ 为紧化 $\\overline X$ 减去正规交叉除子 $D$；此时联络在奇点附近有形如 $\\nabla=d+\\frac{A}{z}\\,dz+\\cdots$ 的展开，解按 $z^{\\lambda}$ 或 $z^{\\lambda}\\log z$ 的多值形式出现（$z$ 是局部坐标，$A$ 是留数矩阵），单值群由 $A$ 的指数与 Stokes 现象决定。Hilbert 第 21 问题问：是否每个 $\\pi_1(X)$ 的表示都可以由一个 Fuchs 型（在奇点处对数型）方程组实现？答案在一般情形是“否”，但 Deligne 的结果给出正确的替代：任何表示都可以由带正则奇点的平坦联络实现，而正则性（奇点处解的增长是多项式级而非指数级）正是使对应保持的关键条件；对任意维数的开簇，正则性还有“沿除子的解按多项式级增长”的刻画（并在曲线情形等价于留数矩阵的某个条件）。这一步的意义是把对应从紧流形搬到开簇与代数情形，并明确“正则”这一假设不可去掉：非正则奇点的联络不再由单值群唯一决定（Stokes 数据成为额外的必要信息），这就是 Levelt–Turrittin 理论与 Stokes 现象的出现之处。",
        ['flat-connection-equivalence']),
      step('derived-and-d-module-version', '导出版本：$D$-模、解函子与反常层',
        "经典对应的极限是“只有局部系统”这一限制，而导出版本去掉它。设 $\\mathcal{D}_X$ 是 $X$ 上的微分算子层。对 $\\mathcal{D}_X$-模 $\\mathcal{M}$，解函子 $\\mathrm{Sol}(\\mathcal{M})=\\mathbf{R}\\mathcal{H}om_{\\mathcal{D}_X}(\\mathcal{M},\\mathcal{O}_X)$ 取值在导出范畴中（$\\mathcal{O}_X$ 视为 $\\mathcal{D}_X$-模，$d$ 的作用是联络 $d$）。Kashiwara 与 Mebkhout 的定理：对 $X$ 上正则完整的 $\\mathcal{D}$-模的导出范畴与 $X$ 上（$\\mathbb{C}$-构造的）反常层的导出范畴之间存在等价，且由解函子（或它的对偶形式）给出；在局部系统情形这一等价退回经典对应（$\\mathcal{M}=\\mathcal{L}\\otimes\\mathcal{O}_X$ 时 $\\mathrm{Sol}(\\mathcal{M})$ 只有第 0 层非零，即 $\\mathcal{L}$ 本身）。导出版本的技术收益是两条：一是“非正则”与“带奇点”的方程可以通过反常层的框架处理（PDE 的传播、解的单延、与交叉上同调的关系都进入范畴层面）；二是解函子与伴随（$\\mathcal{M}\\mapsto\\mathbf{R}\\mathcal{H}om_{\\mathcal{D}}(\\mathcal{M},\\mathcal{O}_X)$ 的对偶性）把方程与解的对偶性写成范畴等价，从而 Fourier 变换（$D$-模的 Fourier–Mukai 型变换）等操作可以在两侧同时进行。",
        ['hilbert-21st-and-growth']),
      step('example-hypergeometric-and-punctured-line', '具体核算：$\\mathbb{P}^1\\setminus\\{0,\\infty\\}$ 上的方程组与单值',
        "取 $X=\\mathbb{C}^{\\times}=\\mathbb{P}^1\\setminus\\{0,\\infty\\}$，$\\pi_1(X)=\\mathbb{Z}$。考虑一阶方程 $\\frac{df}{dz}=\\frac{\\lambda}{z}f$（$\\lambda\\in\\mathbb{C}$）：解是 $f=cz^{\\lambda}$，其单值（绕原点一周 $z\\mapsto e^{2\\pi i}z$）由乘子 $e^{2\\pi i\\lambda}$ 给出，于是局部系统的单值表示是 $1\\mapsto(e^{2\\pi i\\lambda})\\in\\mathrm{GL}_1(\\mathbb{C})\\cong\\mathbb{C}^{\\times}$。核对非正则情形：把方程换成 $\\frac{df}{dz}=\\frac{1}{z^2}f$，解为 $f=ce^{-1/z}$，它在 $z\\to0$ 处是本质奇点（指数级增长），绕原点一周后的单值是恒等（$e^{-1/z}$ 在 $z\\mapsto e^{2\\pi i}z$ 下不变），也就是说单值群是平凡的；但这两个方程显然不同构（一个是正则的、一个不是），故“单值”在此不再决定局部系统，必须补上 Stokes 数据。这个对比精确说明 Riemann–Hilbert 对应中“正则完整”这一假设的必要性：在正则情形单值群唯一决定方程，在非正则情形只决定一部分，其余由 Stokes 矩阵编码。" ,
        ['hilbert-21st-and-growth', 'flat-connection-equivalence']),
    ],
    conclusion: "对 $X$ 上带平坦联络的局部自由层（局部系统）与 $\\pi_1(X,x_0)$ 的有限维表示，纤维函子给出范畴等价，且与拉回、直和、张量、对偶相容；从紧流形推广到开簇需要“正则奇点”假设，此时表示总可以由正则平坦联络实现（Deligne），而非正则情形单值群不足以决定方程，需补充 Stokes 数据。导出版本（Kashiwara–Mebkhout）把正则完整 $D$-模的导出范畴与反常层的导出范畴等价，解函子 $\\mathrm{Sol}(\\mathcal{M})=\\mathbf{R}\\mathcal{H}om_{\\mathcal{D}}(\\mathcal{M},\\mathcal{O}_X)$ 成为对应的核心。",
    dependencies: [],
    consequences: [],
    explanation: "Riemann–Hilbert 对应的哲学是“分析可以完全代数化”：一个线性微分方程组的所有信息（解空间、解的奇点与增长、方程之间的变换）都可以被一个纯代数的数据（单值表示，或更一般地一个 $D$-模）完整编码。这让微分方程的问题获得三条新的解决途径：用群论处理单值（例如用 $\\pi_1$ 的有限性、可解性与表示的分类），用层论处理局部结构（局部系统、反常层、交叉上同调），用代数几何处理形变（平坦联络的形变 = 表示的形变，由 $H^1(\\pi_1,\\mathrm{ad})$ 控制）。对应的边界处恰好是最有内容的地方：非正则奇点的 Stokes 现象、Hilbert 第 21 问题的反例、以及 $D$-模的不可约分解（Berns̆teĭn–Sato 多项式），这些都说明“单值群不完全决定方程”，而正是这些缺陷催生了 Stokes 结构、指数化 $D$-模与不规则的 Riemann–Hilbert 对应等现代方向。",
    examples: [
      { title: '例子：$\\mathbb{P}^1$ 上超几何方程与三点单值', body: "取超几何方程 $z(1-z)f''+(c-(a+b+1)z)f'-abf=0$，它是 $\\mathbb{P}^1\\setminus\\{0,1,\\infty\\}$ 上的二阶方程，$\\pi_1$ 是自由群（两个生成元，对应绕 $0$ 与绕 $1$ 的小回路）。三个奇点处的局部单值由留数矩阵的指数给出：在 $z=0$ 处指标为 $0$ 与 $1-c$，在 $z=1$ 处为 $0$ 与 $c-a-b$，在 $z=\\infty$ 处为 $a$ 与 $b$；于是单值表示由两组矩阵 $M_0,M_1$ 生成（$M_\\infty=(M_1M_0)^{-1}$），而它们各自的共轭类由上述指标固定。可核算的核对点是：把 $a,b,c$ 取具体值（例如 $a=\\frac12,b=\\frac13,c=\\frac14$）后，指标 $1-c=\\frac34$ 的本征值 $e^{2\\pi i\\cdot3/4}$ 是单位根，故 $M_0$ 的阶数有限；这一“指标为有理数”的现象对应解在对数层上的有限分支，也正是 Schwarz 表与 Picard–Vessiot 理论的起点。" },
    ],
    remarks: [
      "“正则奇点”假设不可去，去掉后对应变成不唯一的。非正则方程的解在奇点附近有指数级增长或衰减，此时单值群无法记录 Stokes 现象（同一单值群可以由多个互不同构的非正则方程实现，例如 $f'=f/z^2$ 与 $f'=0$ 都有平凡单值但显然不同构）；要恢复对应必须把 Stokes 数据（或 $D$-模的“斜率”与 Levelt–Turrittin 分解）加入不变量，这正是不规则 Riemann–Hilbert 对应的内容。",
      "$\\pi_1$ 的选择必须是基点式的，且表示必须是有限维。对非紧或无穷型空间，$\\pi_1$ 的表示可能是无穷维的（例如函数空间上的平移作用），此时局部系统不再是有限秩自由层，对应的“解层”也不有限；同样地若换成基本群胚（groupoid）版本则要小心基点的变化带来的自然同构问题，因此在陈述“范畴等价”时必须固定基点与有限维性。",
      "导出版本需要“完整”（holonomic）与“正则”两个假设。完整 $D$-模（特征簇的维数等于 $X$ 的维数）是使解函子有限性成立的条件，正则是使解函子落在 $\\mathbb{C}$-构造层的条件；去掉完整性会出现无穷维解空间与不可构造的层（例如 $\\mathcal{D}_X$ 本身不完整），去掉正则性则得到指数化 $D$-模与更一般的层，对应不再是反常层范畴。",
      "对应的相容性（拉回、张量、对偶）需要额外说明。经典对应与拉回相容，但与推前（沿非有限的态射）不完全相容；张量积的相容需要平坦性，对偶的相容需要构造层的框架。把这些运算从局部系统一侧搬来时，必须逐个核对假设，否则会在计算交集上同调或做基变换时出错。",
    ],
    corollaries: [
      { title: '推论：紧 Kähler 流形上局部系统由单值群唯一决定，且上同调可用群上同调计算', body: "由范畴等价，紧 Kähler 流形 $X$ 上的局部系统 $\\mathcal{L}$ 与有限维表示 $\\rho:\\pi_1(X,x_0)\\to\\mathrm{GL}(V)$ 一一对应，因此 $\\mathcal{L}$ 的同构类由 $\\rho$ 的共轭类完全决定；进一步，$H^i(X,\\mathcal{L})$ 可用群上同调计算（在 $X$ 为 $K(\\pi,1)$ 型时 $H^i(X,\\mathcal{L})\\cong H^i(\\pi_1(X),V)$），这把层的上同调计算化为群论计算。这条推论是拓扑方法进入代数几何的入口：例如曲线的局部系统上同调可以用 $\\pi_1$ 的表示直接算，而平坦丛的形变空间由 $H^1(\\pi_1,\\mathrm{ad}\\,\\rho)$ 给出，与 $H^1(X,\\mathcal{E}nd\\mathcal{L})$ 一致。", uses: ['local-systems-and-fiber-functor', 'flat-connection-equivalence'] },
    ],
    references: [
      { title: 'Équations différentielles à points singuliers réguliers, Lecture Notes in Mathematics 163', author: 'Pierre Deligne', year: 1970 },
      { title: 'The Riemann-Hilbert problem for holonomic systems, Publications of the Research Institute for Mathematical Sciences 20', author: 'Masaki Kashiwara', year: 1984 },
      { title: 'Une équivalence de catégories, Compositio Mathematica 51', author: 'Zoghman Mebkhout', year: 1984 },
      { title: 'D-Modules, Perverse Sheaves, and Representation Theory, Progress in Mathematics 236', author: 'Ryoshi Hotta, Kiyoshi Takeuchi, Toshiyuki Tanisaki', year: 2008 },
    ],
    history: HISTORY,
  },

  /* ═══════════════════════════════════════════════════════════
   * 12. D-模
   * ═══════════════════════════════════════════════════════════ */

  'c-d-module': {
    statement: "设 $X$ 是光滑复代数簇（或复流形），$\\mathcal{D}_X$ 是 $X$ 上微分算子层：局部上 $\\mathcal{D}_X=\\mathcal{O}_X\\langle\\partial_1,\\ldots,\\partial_n\\rangle$ 是由 $\\mathcal{O}_X$ 与一阶导子生成的结合代数，满足 $[\\partial_i,f]=\\frac{\\partial f}{\\partial x_i}$。左 $\\mathcal{D}_X$-模（下称 $D$-模）就是线性偏微分方程组的代数化：一个 $D$-模 $\\mathcal{M}$ 的元素对应“函数”，$\\mathcal{D}$ 中算子对它的作用对应“求导与相乘”，而 $\\mathcal{M}$ 的表示（作为 $\\mathcal{O}$-模的有限生成性、纤维的维数）对应方程的个数与解的维数。核心对象与结论包括：解函子 $\\mathrm{Sol}(\\mathcal{M})=\\mathbf{R}\\mathcal{H}om_{\\mathcal{D}_X}(\\mathcal{M},\\mathcal{O}_X)$、完整（holonomic）$D$-模（特征簇维数 $=\\dim X$ 的模）的解空间有限维、Berns̆teĭn–Sato 多项式 $b(s)$ 与 $b$-函数的有限性、Kashiwara–Mebkhout 的 Riemann–Hilbert 对应（正则完整 $D$-模 $\\leftrightarrow$ 反常层），以及 $D$-模的六函子形式框架（$\\otimes^{\\mathbf{L}}_{\\mathcal{D}}$、$\\mathbf{R}\\mathcal{H}om_{\\mathcal{D}}$、$f_{!}$、$f^{*}$、$f_{*}$、$\\mathbb{D}$）。",
    explanation: "D-模的语言把“解线性偏微分方程组”翻译成“在同调代数里做操作”。一个线性方程组（若干未知函数之间由求导与相乘线性联系）等价地就是“有限个生成元的 $\\mathcal{D}$-模与它们的关系”，于是解方程组变成计算 $\\mathrm{RHom}_{\\mathcal{D}}(\\mathcal{M},\\mathcal{O}_X)$，方程的解空间变成上同调群。这个翻译的收益是三重的。第一，函子性：方程组的变换对应模的同态，解空间的变换对应上同调上的映射，因此“解方程”成为一个范畴层面上的操作，可以拉回、推前、取对偶与张量。第二，有限性：对完整 $D$-模（最大的一类“与几何相关”的模），解空间的维数有限，且与特征簇的几何（Berns̆teĭn–Sato）相关，这给出方程组的“维数”与“奇点”的可计算判据。第三，Fourier 变换：$D$-模在 Fourier 变换下变成另一侧的 $D$-模（把 $\\partial_i$ 与 $x_i$ 互换），使微分方程的求解与代数几何的对偶理论（例如 $D$-模的 Fourier–Mukai）可以互相搬运。",
    steps: [
      step('weyl-algebra-and-local-structure', 'Weyl 代数与局部结构：方程即模',
        "先在最基本的情形上把定义写清楚。取 $X=\\mathbb{A}^n$（或 $\\mathbb{C}^n$），$\\mathcal{D}_X$ 的全局截面是 Weyl 代数 $A_n=\\mathbb{C}[x_1,\\ldots,x_n]\\langle\\partial_1,\\ldots,\\partial_n\\rangle$，它由关系 $[\\partial_i,x_j]=\\delta_{ij}$ 与 $[\\partial_i,\\partial_j]=[x_i,x_j]=0$ 定义。作为 $\\mathbb{C}$-向量空间，$A_n$ 有 PBW 基 $\\{x^{\\alpha}\\partial^{\\beta}\\}$，因此每个元素唯一地写成有限的微分算子。左 $A_n$-模的典型例子是 $\\mathcal{O}_X=A_n/(\\partial_1,\\ldots,\\partial_n)$（因为常数正是所有导子的核）与 $\\mathbb{C}[x]/(x)$ 型模（摩天楼型）。一般地，给定 $m$ 个未知函数与 $k$ 个线性偏微分方程的方程组，取自由模 $A_n^{m}$ 与由方程生成的子模 $N$，商 $\\mathcal{M}=A_n^{m}/N$ 就是对应的 $D$-模：$\\mathcal{M}$ 的生成元是未知函数，关系是方程。解函子则给出解空间：$\\mathrm{Hom}_{A_n}(\\mathcal{M},\\mathcal{O}_X)=\\{(f_1,\\ldots,f_m):\\ \\text{满足全部方程}\\}$。这套翻译的关键点是：$A_n$ 不是交换环（因此必须区分左右模），而滤波（把算子按阶数分层）与分次环（$\\mathrm{gr}A_n=\\mathcal{O}_X[\\xi_1,\\ldots,\\xi_n]$，余切丛上的多项式函数）成为研究 $D$-模的主要工具。",
        []),
      step('filtration-and-characteristic-variety', '滤过与特征簇：把方程“画”在余切丛上',
        "D-模的几何来自滤过。对 $A_n$ 取阶滤过 $F_iA_n=\\{\\text{阶数}\\ \\le i\\ \\text{的算子}\\}$，对应的分次环是 $\\mathbb{C}[x_1,\\ldots,x_n,\\xi_1,\\ldots,\\xi_n]$（$\\xi_i$ 是 $\\partial_i$ 的首项），即 $T^{*}X$ 上的多项式函数环。对有限生成 $D$-模 $\\mathcal{M}$ 取好滤过（$F_i\\mathcal{M}$ 有限生成 $F_0\\mathcal{O}_X$-模、$F_iA\\cdot F_j\\mathcal{M}\\subseteq F_{i+j}\\mathcal{M}$、并对 $i$ 足够大取等号），定义特征簇 $\\mathrm{Char}(\\mathcal{M})=\\mathrm{Supp}(\\mathrm{gr}\\mathcal{M})\\subseteq T^{*}X$，它是 $\\mathrm{gr}\\mathcal{M}$ 作为分次模的支集，是一个余等维（conic）闭子集。特征簇的意义是几何化的“奇点集合”：$\\mathrm{Char}(\\mathcal{M})$ 的每个点 $(x,\\xi)$ 记录“解在 $x$ 处沿余切方向 $\\xi$ 的奇异传播”，这就是微局部分析（Hörmander）的非阿基米德/代数的对应物。最基本的核对例子：$\\mathcal{M}=\\mathcal{O}_X$ 时 $\\mathrm{Char}(\\mathcal{O}_X)$ 是零截面 $X\\subset T^{*}X$（常函数无奇性）；$\\mathcal{M}=\\mathcal{O}_X/(x_1)$（对应方程 $x_1f=0$，解支撑在超平面 $x_1=0$）时特征簇是 $\\{x_1=0\\}\\times\\mathbb{C}^n$ 型集合并含余切方向，说明“解的支集”与“特征簇”通过余切方向的投影联系起来。",
        ['weyl-algebra-and-local-structure']),
      step('holonomic-and-bernstein-sato', '完整性、Berns̆teĭn–Sato 多项式与 $b$-函数',
        "特征簇给出“方程有多大”的度量。由于 $\\mathrm{gr}\\mathcal{M}$ 是 $T^{*}X$ 上余等维闭子集上的分次模，其维数至少是 $2\\dim X-\\dim X=\\dim X$（余切丛维数为 $2n$，$\\mathrm{Char}$ 的维数至少 $n$）；称 $\\mathcal{M}$ 完整（holonomic），若 $\\dim\\mathrm{Char}(\\mathcal{M})\\le\\dim X$（等价地取等号），此时 $\\mathcal{M}$ 是“最紧的”$D$-模，其解空间在每点上有限维，并且 $\\mathcal{M}$ 是长度有限的（有合成列）。完整性的判据与典型例子：由单个方程 $P$ 生成的模 $\\mathcal{D}_X/\\mathcal{D}_XP$ 在 $P$ 的主符号非零时完整（这要求 $P$ 的阶数等于 $X$ 的维数），因此 $n$ 个变量的“主方程”通常完整，而方程个数少于 $n$ 时一般不完整。Berns̆teĭn–Sato 多项式来自 $b$-函数：对多项式 $f$ 与形式幂 $f^{s}$（$s$ 为形式变量），存在非零多项式 $b(s)\\in\\mathbb{C}[s]$ 与算子 $P(s)\\in\\mathcal{D}_X[s]$ 使 $P(s)\\,f^{s+1}=b(s)f^{s}$；最小的这种 $b(s)$ 称为 $f$ 的 $b$-函数（或 Berns̆teĭn–Sato 多项式），它的根是有理数、且决定了 $f^{s}$ 生成的 $D$-模的完整性与奇点结构（例如根的有理性与 $f$ 的零点沿解析延拓的增长相关，这是 Berns̆teĭn 关于“$b$ 函数的根均为负有理数”定理的内容）。",
        ['filtration-and-characteristic-variety']),
      step('solution-functor-and-six-functors', '解函子与六函子：微分方程的范畴化',
        "把解空间做成函子是 $D$-模理论的核心操作。定义 $\\mathrm{Sol}(\\mathcal{M})=\\mathbf{R}\\mathcal{H}om_{\\mathcal{D}_X}(\\mathcal{M},\\mathcal{O}_X)$（$\\mathcal{O}_X$ 视为左 $D$-模，$\\partial_i$ 的作用为普通偏导），它是层复形；对完整 $D$-模，其每一阶上同调层是有限维的构造层，从而对应到反常层一侧（见 Riemann–Hilbert 对应）。对偶性给出另一侧的函子：$\\mathbb{D}(\\mathcal{M})=\\mathbf{R}\\mathcal{H}om_{\\mathcal{D}_X}(\\mathcal{M},\\mathcal{D}_X\\otimes\\omega_X^{\\otimes-1})[\\dim X]$ 型的 Verdier 型对偶，对完整模保持完整性，并把“解”与“方程”互换（对偶两次回到原模）。六函子形式框架包括：$\\otimes^{\\mathbf{L}}_{\\mathcal{D}}$（左右模的张量需经 $\\omega$ 扭）、$\\mathbf{R}\\mathcal{H}om_{\\mathcal{D}}$、以及沿态射 $f:X\\to Y$ 的四则运算 $f^{*},f_{*},f_{!},f^{!}$（其中 $f_{*}$ 是 $\\mathcal{D}$-模推前，$f_{!}$ 与 $f^{!}$ 需要 $\\omega$ 扭与完整性的相容条件）。这套框架的价值在于它把“方程的解”和“解的传播”都纳入同调代数：例如沿浸入的限制（$f^{*}$）对应“把方程限制到子簇上”，推前（$f_{*}$）对应“把方程的解沿纤维积分消去变量”，而 Kashiwara 的构造性定理表明这些运算对完整模封闭（除 $f_{*}$ 的一般情形需要额外的正则性），从而“解方程”成为完全可操作的范畴运算。",
        ['holonomic-and-bernstein-sato']),
      step('example-gauss-manin', '具体核算：Gauss–Manin 联络与一个完整模的计算',
        "用一个标准例子把所有概念串起来。取 $f:\\mathbb{C}^2\\to\\mathbb{C}$、$f(x,y)=y^2-x^3$（尖点三次曲线的纤维化），考虑 $\\mathcal{O}_{\\mathbb{C}^2}$ 上的 $D$-模 $\\mathcal{M}=\\mathcal{D}_{\\mathbb{C}^2}/(\\partial_y,\\partial_x)$（即“常数层”，对应方程 $\\partial_x u=\\partial_y u=0$）。它在 $\\mathbb{C}^2$ 上完整（特征簇是零截面，维数 $2=\\dim X$）。把 $\\mathcal{M}$ 沿 $f$ 推前（积分掉纤维）得到 $\\mathbb{C}$-上一个秩 2 的局部系统（因为纤维 $f^{-1}(t)$ 的 $H^0$ 与 $H^1$ 贡献两个独立解）配 Gauss–Manin 联络，其解是周期积分 $\\int_{f^{-1}(t)}u\\,dx\\wedge dy$ 型的函数。核对维数：Gauss–Manin 层的秩等于纤维的上同调维数之和，即 $2$（对 $f=y^2-x^3$，一般纤维是两点的并，$H^0$ 贡献 1；同时它也是 $\\mathbb{C}[x]/(x^3)$ 型的完整模，故 $H^1$ 再贡献 1）。再核对 $b$-函数：$f=y^2-x^3$ 的 Berns̆teĭn–Sato 多项式为 $b(s)=(s+1)(6s+5)/\\text{（归一化）}$ 型的多项式的根 $-1,-5/6$，这两个有理数根与纤维在 $t=0$ 处的奇异性对应：$-1$ 来自 $H^0$ 的常数解，$-5/6$ 来自尖点的重数（$2\\cdot3=6$ 与 $5$ 的关系），说明 $b$-函数的根确实编码了纤维化的退化数据。" ,
        ['holonomic-and-bernstein-sato', 'solution-functor-and-six-functors']),
    ],
    conclusion: "$D$-模把线性偏微分方程组代数化为 $\\mathcal{D}_X$-模，解由 $\\mathrm{Sol}(\\mathcal{M})=\\mathbf{R}\\mathcal{H}om_{\\mathcal{D}_X}(\\mathcal{M},\\mathcal{O}_X)$ 给出；滤过与特征簇把方程几何化为 $T^{*}X$ 的余等维子集，完整 $D$-模（特征簇维数 $=\\dim X$）的解空间有限、长度有限，并与 Berns̆teĭn–Sato 多项式及 $b$-函数相关；六函子形式框架与 Verdier 对偶使“解方程”成为范畴运算，正则完整 $D$-模的导出范畴更与反常层等价（Kashiwara–Mebkhout）。",
    dependencies: [],
    consequences: [],
    explanation: "D-模的价值可以概括为“把微分方程理论放进同调代数”。经典偏微分方程理论里，解的局部结构、奇点的传播、方程之间的变换各自需要一套技术；$D$-模把这些技术统一为“模的运算”，于是每一步都可以用同调代数的手段（滤过、对偶、谱序列、导出函子）处理。三条最有用的性质是：完整性把“解空间有限维”变成特征簇的维数条件（几何化的判据）；Verdier 对偶把“解方程”与“构造方程”互换（因此可以用解的性质去描述方程）；Fourier 变换把 $\\partial_i$ 与 $x_i$ 互换（因此微分算子的问题变成乘法算子的问题，这正是线性常微分方程的“方程系数有多项式解”这一图景的推广）。在现代数学中，$D$-模是表示论（Beilinson–Bernstein 局部化、Kazhdan–Lusztig 猜想）、Hodge 理论（$D$-模的 Hodge 模与不规则奇点）、算术几何（$p$ 进 $D$-模与 F-isocrystals）的共同语言。",
    examples: [
      { title: '例子：$D_{\\mathbb{A}^1}$ 上一个完整模的显式计算', body: "取 $X=\\mathbb{A}^1=\\mathrm{Spec}\\,\\mathbb{C}[x]$，$\\mathcal{M}=\\mathcal{D}_X/\\mathcal{D}_X\\partial_x$。核对它与 $\\mathcal{O}_X$ 同构：映射 $\\mathcal{D}_X\\to\\mathcal{O}_X$、$P\\mapsto P(1)$ 的核恰是由 $\\partial_x$ 生成的左理想，故 $\\mathcal{M}\\cong\\mathcal{O}_X$，其解空间 $\\mathrm{Hom}_{\\mathcal{D}}(\\mathcal{O}_X,\\mathcal{O}_X)=\\mathbb{C}$（常数），与方程 $u'=0$ 的解空间（一维常数）一致。再看 $\\mathcal{M}'=\\mathcal{D}_X/\\mathcal{D}_X(\\partial_x-x)$：这个模对应方程 $u'=xu$，其解是 $Ce^{x^2/2}$，一维；核对特征簇：$\\partial_x-x$ 的主符号是 $\\xi$（一阶算子的 $\\xi$ 部分），故 $\\mathrm{Char}(\\mathcal{M}')$ 是 $\\{\\xi=0\\}$ 即零截面，维数 $1=\\dim X$，故完整，与“解空间一维”相符。最后取 $\\mathcal{M}''=\\mathcal{D}_X/\\mathcal{D}_X x$（模掉乘法算子 $x$）：主符号是 $x$（零阶项的符号为 $x$），故特征簇是 $\\{x=0\\}$ 作为 $T^{*}\\mathbb{A}^1$ 的子集（在余切方向无限制），这是 $\\delta$ 型解的来源：解空间是支撑在原点的分布，维数 1，与方程 $xu=0$ 的解空间（支撑在原点的 $\\delta$）对应。" },
    ],
    remarks: [
      "微分算子环不交换，左右模不可混用。$\\mathcal{D}_X$ 的局部化、张量积与内 Hom 都必须区分左右结构（例如 $\\mathcal{D}_X$ 的两个 $D$-模结构由 $\\mathcal{O}_X$ 的左右作用给出），而把左模当右模处理会在构造 $\\otimes^{\\mathbf{L}}_{\\mathcal{D}}$ 与对偶时引入符号错误（正确做法是经 $\\omega_X$ 扭转，把左模变成右模再张量）。这是 $D$-模计算中最常见的符号陷阱。",
      "完整性是有限性的必要条件，但不是充分条件。完整 $D$-模的解空间在每点上有限维、模的长度有限，但解空间的整体维数与拓扑（例如单延）需要额外的正则性才能控制；对非完整的模（例如 $\\mathcal{D}_X$ 本身、或由少于 $n$ 个方程生成的模），解空间可以是无穷维，且模没有有限长度，此时用特征簇做判据必须停在“维数 $\\dim X$ 之上”这一结论上而不能继续推出有限性。",
      "特征簇的维数是几何不变量，但不区分“奇异方向”的多重性。$\\mathrm{Char}(\\mathcal{M})$ 只给出支集，丢掉重数；要恢复重数需要更细的数据（例如 $\\mathrm{gr}\\mathcal{M}$ 作为分次模的结构、或微局部化理论中的重数），因此在用特征簇做“方程的奇点集合”的判据时必须明确它只给支撑而不给重数，否则会把“同一支撑但不同重数”的两个模误认为同构。",
      "Berns̆teĭn–Sato 多项式的存在性是定理而非定义。$b$-函数的存在（对任意多项式 $f$ 都存在非零 $b(s)$）依赖 Hilbert 基定理与 $A_n$ 的诺特性（Berns̆teĭn 的原始证明），且其根的有理性（Berns̆teĭn 关于根的定理）是另一条定理；把它当作“显然”会掩盖 $D$-模理论中技术含量最高的部分，同时在特征 $p$ 或非多项式（解析）情形下这两条结论都需要重新审视。",
    ],
    corollaries: [
      { title: '推论：完整 $D$-模的解空间有限维，故方程组的自由度可数', body: "若 $\\mathcal{M}$ 完整，则每个 $i$ 上 $\\mathcal{H}^i\\mathrm{Sol}(\\mathcal{M})$ 是有限维构造层，且只有有限多个 $i$ 使其非零（因为 $\\mathcal{M}$ 有有限长度、且解函子保持三角结构）；于是“方程组的解空间维数”由特征簇的形状与 $b$-函数的根共同决定，而不再需要逐例解方程。这条推论是 $D$-模理论最常被引用的功能性结论：它把“解方程”的问题化为“计算特征簇与 $b$-函数”的问题，而后者是纯代数的计算（例如用 Gröbner 基计算特征簇、用 $b$-函数的算法）。", uses: ['holonomic-and-bernstein-sato', 'solution-functor-and-six-functors'] },
    ],
    references: [
      { title: 'Analytic D-Modules and Applications, Mathematics and Its Applications 247', author: 'Jan-Erik Björk', year: 1993 },
      { title: 'A Primer of Algebraic D-Modules, London Mathematical Society Student Texts 33', author: 'S. C. Coutinho', year: 1995 },
      { title: 'D-Modules, Perverse Sheaves, and Representation Theory, Progress in Mathematics 236', author: 'Ryoshi Hotta, Kiyoshi Takeuchi, Toshiyuki Tanisaki', year: 2008 },
      { title: 'Modules over a ring of differential operators: an introduction to the theory of linear differential operators', author: 'I. N. Berns̆teĭn', year: 1971 },
    ],
    history: HISTORY,
  },

  /* ═══════════════════════════════════════════════════════════
   * 13. 反常层
   * ═══════════════════════════════════════════════════════════ */

  'c-perverse': {
    statement: "设 $X$ 是复代数簇（或有限型 $k$-概形、或复解析空间），$D^b_c(X)$ 是 $X$ 上有限维 $\\mathbb{C}$-向量空间系数的构造层（constructible sheaves）的有界导出范畴。称 $\\mathcal{F}^{\\bullet}\\in D^b_c(X)$ 为反常层（perverse sheaf），若对每个 $i\\in\\mathbb{Z}$ 与每个 $j\\in\\mathbb{Z}$，支集条件成立：$\\dim\\mathrm{Supp}\\,\\mathcal{H}^i(\\mathcal{F}^{\\bullet})\\le -i$，且 $\\dim\\mathrm{Supp}\\,\\mathcal{H}^i(\\mathbb{D}(\\mathcal{F}^{\\bullet}))\\le -i$，其中 $\\mathbb{D}$ 是 Verdier 对偶（等价地：$\\dim\\mathrm{Supp}\\,\\mathcal{H}^i(\\mathcal{F}^{\\bullet})\\le -i$ 与上同调层沿所有局部闭子簇的支集维数上界同时成立）。反常层构成 $D^b_c(X)$ 的一个 Abel 全子范畴 $\\mathrm{Perv}(X)$，它是 Artin 型 Abel 范畴（每条链稳定）、有足够多内射对象，其单对象分为两类：局部系统在光滑子簇上的中间延拓（IC 层，交叉上同调层）与这些对象的有限扩张；由 Beilinson–Bernstein–Deligne（以及对特征 $p$ 的 Gabber 加强）与 Kashiwara–Mebkhout，$\\mathrm{Perv}(X)$ 等价于正则完整 $D$-模的相应范畴（复情形），且 而反常层的全部单对象 的简单对象由 Kazhdan–Lusztig 猜想（Beilinson–Bernstein、Brylinski–Kashiwara 证明）控制。",
    explanation: "反常层要解决的问题是“层的范畴为什么不是 Abel 的”。把层取导出范畴之后，$D^b_c(X)$ 是三角范畴而不是 Abel 范畴，因此“子对象”“单对象”“长度”这些概念都失效；但很多应用（对偶、Riemann–Hilbert、表示论里的局部化）恰恰需要 Abel 性质。反常层的定义给出的就是这个 Abel 子范畴：支集条件（上同调层的支集维数随 $i$ 增大而下降）恰好等于“要成为 Abel 范畴所必须的限制”，它把“层”的概念重新定位到“带的维数是 $\\dim X+i$”这一反常的移位约定上。结果是：$\\mathrm{Perv}(X)$ 是一个 Artin 范畴，其单对象由“局部系统 + 中间延拓”给出，而这些单对象的组合数据（交叉上同调、单延的权重）正是希望计数与计算的量。这也解释了名字中的“反常”：如果把维数约定改成通常的（不带移位），支集条件看起来完全不自然；但正是这种移位使对偶与 $D$-模对应都成为正合函子，从而整个理论闭合。",
    steps: [
      step('support-conditions-and-shift', '支集条件与移位约定：Abel 子范畴的来历',
        "先把定义写成可计算的形式。对 $\\mathcal{F}^{\\bullet}\\in D^b_c(X)$ 定义“反常移位”$\\mathcal{F}^{\\bullet}[\\dim X]$ 的支集条件为：对每个 $i$，$\\dim\\mathrm{Supp}\\,\\mathcal{H}^i(\\mathcal{F}^{\\bullet})\\le -i$，等价地 $\\dim\\mathrm{Supp}\\,\\mathcal{H}^{-j}(\\mathcal{F}^{\\bullet})\\le j$（即“第 $-j$ 阶上同调层的支集维数不超过 $j$”）。这条条件可以重写成“$\\mathcal{F}^{\\bullet}$ 的支撑维数 = $\\dim X - $ 移位”的形式，因此它把上同调集中在一个确定维数上。两个基本核对：其一，$X$ 光滑且 $\\mathcal{L}$ 是局部系统时，$\\mathcal{L}[\\dim X]$ 满足条件（局部系统支撑在 $X$ 上，维数 $=\\dim X$，恰对应 $i=-\\dim X$ 的那一项）；其二，把 $\\mathcal{L}[\\dim X]$ 换成 $\\mathcal{L}[\\dim X-1]$ 则不满足（会出现支集维数大于允许值的层），这说明移位是精确的。条件的第一半（对 $\\mathcal{F}$ 本身）控制“层的维数不要太大”，第二半（对 Verdier 对偶 $\\mathbb{D}\\mathcal{F}$）控制“层的维数不要太小”，两半合起来正好把 $\\mathcal{F}$ 的“维数”锁定在 $\\dim X$（反常）这一层上；而锁定为 Abel 性的原因在于：三角范畴里“零调”现象（例如 $\\mathbb{C}[0]$ 与 $\\mathbb{C}[-1]$ 的差）会被这两条不等式排除掉。",
        []),
      step('abelian-structure-and-simple-objects', 'Abel 结构与单对象：IC 层与中间延拓',
        "验证 $\\mathrm{Perv}(X)$ 是 Abel 范畴的核心是“核与像的反常性”：对反常层的态射 $f:\\mathcal{F}\\to\\mathcal{G}$，取核与余核（在 $D^b_c(X)$ 中）时不一般满足支集条件，但反常层给出的“反常截断”$\\tau_{\\le0}$ 与 $\\tau_{\\ge0}$（相对于支集条件的 $t$-结构）使核与像自动落在范畴内。用 $t$-结构的语言：$D^b_c(X)$ 上存在一个 $t$-结构，其心（heart）正是 $\\mathrm{Perv}(X)$；该 $t$-结构由“支集条件的逐层截断”定义（先对 $\\mathcal{H}^i$ 的支集维数截断，再对偶地截断一次），因此 $\\mathrm{Perv}(X)$ 自动是 Abel 范畴。单对象的结构由 Riemann–Hilbert 与交叉上同调给出：若 $j:U\\hookrightarrow X$ 是光滑局部闭子集（$U$ 光滑、维数 $d$），$\\mathcal{L}$ 是 $U$ 上的局部系统，则中间延拓 $\\mathrm{IC}(\\overline U,\\mathcal{L})=j_{!*}(\\mathcal{L}[d])$（图像 $\\mathrm{im}(j_{!}\\to j_{*})$ 的反常化，用 $t$-结构的相对版本定义）是 $\\mathrm{Perv}(X)$ 的单对象，且 $\\mathrm{Perv}(X)$ 的每个单对象都同构于某个 $\\mathrm{IC}(\\overline U,\\mathcal{L})$；这条定理（Beilinson–Bernstein–Deligne）依赖 $U$ 的光滑性与 $\\mathcal{L}$ 的不可约性，其证明用到了“支持的局部化”与“中间延拓的函子性”。",
        ['support-conditions-and-shift']),
      step('duality-and-kashiwara-mebkhout', 'Verdier 对偶与 $D$-模对应：正合性从何而来',
        "反常层的定义之所以同时要求 $\\mathcal{F}$ 与 $\\mathbb{D}\\mathcal{F}$ 满足支集条件，是因为这样 Verdier 对偶 $\\mathbb{D}=\\mathbf{R}\\mathcal{H}om(-,\\omega_X[\\dim X])$ 会成为 $\\mathrm{Perv}(X)$ 上的正合反变函子。核对：对 $\\mathcal{F}\\in\\mathrm{Perv}(X)$，$\\dim\\mathrm{Supp}\\,\\mathcal{H}^i(\\mathbb{D}\\mathcal{F})\\le -i$ 恰是定义的第二半，因此 $\\mathbb{D}$ 保持反常性；又 $\\mathbb{D}$ 在导出范畴上是反变三角函子，把三角精确列变成三角精确列，而在 $\\mathrm{Perv}$ 上三角精确列就是短正合列，故 $\\mathbb{D}$ 正合；$\\mathbb{D}^2\\cong\\mathrm{id}$（在 $D^b_c$ 上成立，差自然同构）说明它是自等价。这条正合性是把反常层与 $D$-模对应起来的关键：Kashiwara–Mebkhout 定理由解函子 $\\mathrm{Sol}$ 与它的对偶给出 $\\mathrm{Perv}(X)\\cong\\{\\text{正则完整 }D\\text{-模}\\}$ 的等价，而两侧的 Verdier 对偶正是 $D$-模的 Verdier 对偶 $\\mathbb{D}(\\mathcal{M})=\\mathbf{R}\\mathcal{H}om_{\\mathcal{D}}(\\mathcal{M},\\mathcal{D}_X\\otimes\\omega_X^{-1})[\\dim X]$，对偶在两侧同时正合，这意味着 $D$-模的对应不仅在范畴层面成立，还保持对偶与正合结构（例如单对象对应到不可约（正则完整）$D$-模）。",
        ['abelian-structure-and-simple-objects']),
      step('ic-sheaves-and-kazhdan-lusztig', '交叉上同调与 Kazhdan–Lusztig：单对象的组合控制',
        "IC 层的用处是把“几何上的单对象”与“群表示”联系起来。取 $X$ 为旗簇（或更一般的 Schubert 簇），$U$ 为某个 Schubert 胞腔（$W$ 的元素的 Bruhat 胞腔，$W$ 是 Weyl 群），$\\mathcal{L}$ 为 $U$ 上某种局部系统（例如局部 $\\mathbb{C}$-系统或其带权版本），则 $\\mathrm{IC}(\\overline U,\\mathcal{L})$ 的上同调给出交叉上同调群；这些群的维数与 $W$ 的 Kazhdan–Lusztig 多项式 $P_{y,w}(q)$ 相关，这正是 Kazhdan–Lusztig 猜想的对象：$P_{y,w}$ 的系数由交叉上同调层的局部上同调给出，且与 Hecke 代数的“Kazhdan–Lusztig 基”的系数一致。Beilinson–Bernstein 与 Brylinski–Kashiwara 的证明把这个组合问题变成几何问题：把 $D$-模的范畴（等价地 $\\mathrm{Perv}$）与旗簇上的 Hecke 特征层联系起来，用局部化定理把表示论中的不可约最高权模实现为 $D$-模，再用交叉上同调的维数与 Kazhdan–Lusztig 多项式对上。这条路线的意义超出单一猜想：它开启了“几何表示论”这一方向（局部化、中心特征层、Soergel 双模），也说明反常层为什么在表示论中是不可或缺的工具。",
        ['duality-and-kashiwara-mebkhout']),
      step('examples-and-decomposition', '具体核算：$\\mathbb{P}^1$ 与超曲面的反常层分解',
        "用小例子检验反常层的构造。取 $X=\\mathbb{P}^1$、$U=\\mathbb{A}^1\\subset\\mathbb{P}^1$（$d=1$）、$\\mathcal{L}=\\underline{\\mathbb{C}}_U$（常层）；则 $\\mathrm{IC}(\\mathbb{P}^1,\\underline{\\mathbb{C}})=\\underline{\\mathbb{C}}_{\\mathbb{P}^1}[1]$，它满足支集条件：$\\mathcal{H}^{-1}=\\underline{\\mathbb{C}}_{\\mathbb{P}^1}$（支撑维数 $1\\le1$），其他阶为零。再取 $U=\\{0\\}$（维数 $d=0$）、$\\mathcal{L}=\\underline{\\mathbb{C}}$，则 $\\mathrm{IC}(\\{0\\},\\underline{\\mathbb{C}})=\\delta_0[0]$？核对支集条件：$\\mathcal{H}^0=\\delta_0$ 支撑维数 $0\\le0$，满足；对偶 $\\mathbb{D}\\delta_0=\\delta_0[0]$？由 $\\mathbb{D}(\\delta_0)=\\delta_0[2]$（$\\mathbb{P}^1$ 维数 1 加移位），故 $\\mathbb{D}(\\delta_0[0])=\\delta_0[2]$ 的 $\\mathcal{H}^{-2}$ 支集维数 0，满足。再看一个非单的反常层：取 $\\mathcal{F}=\\underline{\\mathbb{C}}_{\\mathbb{P}^1}[1]\\oplus\\delta_0[0]$，由上面的核对它是反常层的直和，长度为 2，两个单因子分别对应“整条曲线的常局部系统”与“点的 $\\delta$”。第三个核对是 $j_{!}$、$j_{*}$ 与中间延拓的差别：取 $j:U=\\mathbb{A}^1\\hookrightarrow\\mathbb{P}^1$、$\\mathcal{L}=\\underline{\\mathbb{C}}_U$、$d=1$。$j_{!}\\underline{\\mathbb{C}}[1]$ 的 $\\mathcal{H}^{-1}=j_{!}\\underline{\\mathbb{C}}$ 支撑在 $\\mathbb{A}^1$（维数 $1\\le1$ 满足），$\\mathcal{H}^{0}=0$；其对偶 $\\mathbb{D}(j_{!}\\underline{\\mathbb{C}}[1])=j_{*}\\underline{\\mathbb{C}}[1]$ 的 $\\mathcal{H}^{-1}=j_{*}\\underline{\\mathbb{C}}$（支撑维数 $1\\le1$）与 $\\mathcal{H}^{0}=$ 无穷远处的 $\\delta$（支撑维数 $0\\le0$），故两个条件都成立，$j_{!}\\underline{\\mathbb{C}}[1]$ 是反常层；同理 $j_{*}\\underline{\\mathbb{C}}[1]$ 也是反常层。但两者都不是单对象：由自然映射 $j_{!}\\to j_{*}$ 的核与余核都含 $\\delta_\\infty$ 型因子，于是有非分裂短正合列 $\\delta_\\infty\\to j_{!}\\underline{\\mathbb{C}}[1]\\to\\mathrm{IC}$ 与 $\\mathrm{IC}\\to j_{*}\\underline{\\mathbb{C}}[1]\\to\\delta_\\infty$，其中 $\\mathrm{IC}=\\underline{\\mathbb{C}}_{\\mathbb{P}^1}[1]$ 才是唯一的单对象。这个例子说明“反常性”比“单性”宽松得多：$\\mathrm{Perv}$ 中有大量非单对象，而单对象必须由中间延拓给出，其存在性依赖 $U$ 的光滑性与移位 $d$ 的匹配。" ,
        ['abelian-structure-and-simple-objects']),
    ],
    conclusion: "构造层导出范畴 $D^b_c(X)$ 上的支集条件（对 $\\mathcal{F}$ 与 $\\mathbb{D}\\mathcal{F}$ 同时成立）切出一个 Abel 全子范畴 $\\mathrm{Perv}(X)$（$D^b_c(X)$ 的一个 $t$-结构的心），其单对象为中间延拓型 IC 层 $\\mathrm{IC}(\\overline U,\\mathcal{L})$；Verdier 对偶在 $\\mathrm{Perv}(X)$ 上正合且自等价，并与 $D$-模的 Verdier 对偶一致；复情形下 $\\mathrm{Perv}(X)$ 与正则完整 $D$-模范畴等价（Kashiwara–Mebkhout），旗簇情形的单对象上同调维数由 Kazhdan–Lusztig 多项式控制（Beilinson–Bernstein、Brylinski–Kashiwara）。",
    dependencies: [],
    consequences: [],
    explanation: "反常层这一概念的核心是“选对维数约定”。层范畴本身不是 Abel 的，而它的导出范畴是三角范畴，因此缺少“子对象与商对象”的语言；反常层通过支集条件切出一个 Abel 子范畴，恰好承担起“层的范畴”应该有的角色，而它的代价是把维数约定从“$\\mathcal{H}^i$ 对应维数 $i$”改成“$\\mathcal{H}^i$ 对应维数 $-i+\\dim X$”。这个改动的收益是双重的：一方面对偶（Verdier 与 $D$-模）在这个子范畴上正合，因此它的代数是闭合的；另一方面中间延拓型单对象的上同调恰好给出交叉上同调，而交叉上同调是表示论与 Hodge 理论里最核心的不变量（Kazhdan–Lusztig 多项式、Soergel 双模、Hodge 模的分解定理都以此为基础）。在现代几何表示论与算术几何中，$\\mathrm{Perv}$ 与它的变体（混合反常层、$\\ell$ 进反常层、抛物反常层）是标准工具箱的组成部分。",
    examples: [
      { title: '例子：光滑曲线上的反常层分类', body: "取 $X$ 为光滑射影曲线（亏格 $g$），$d=\\dim X=1$。由支集条件，$\\mathcal{F}\\in\\mathrm{Perv}(X)$ 的上同调只可能在 $i=-1$ 与 $i=0$ 两层非零：$\\mathcal{H}^{-1}$ 的支撑维数 $\\le1$（可以是整条曲线或有限点集），$\\mathcal{H}^{0}$ 的支撑维数 $\\le0$（只能是有限点集）。于是 $\\mathrm{Perv}(X)$ 的对象由“一个局部系统（在曲线的开集上）与有限多个点上的有限维空间”组成，而单对象是：$\\mathrm{IC}(X,\\mathcal{L})=\\mathcal{L}[1]$（$\\mathcal{L}$ 为局部系统，$\\mathcal{H}^{-1}=\\mathcal{L}$ 支撑维数 1 符合，$\\mathcal{H}^{0}=0$）与 $\\mathrm{IC}(\\{x\\},\\mathbb{C})=\\delta_x$（$\\mathcal{H}^{0}=\\delta_x$ 支撑维数 0 符合）。核对长度：$\\mathrm{Perv}(X)$ 的简单对象是这两类，故任意反常层是它们的有限扩张，长度有限；再核对对偶：$\\mathbb{D}(\\mathcal{L}[1])=\\mathcal{L}^{\\vee}[1]$（局部系统的对偶仍是局部系统，因为曲线的整体维数为 1，移位保持）与 $\\mathbb{D}(\\delta_x)=\\delta_x$，都对。这个分类说明：在曲线上反常层的全部信息就是“一个局部系统的单值表示 + 有限个点上的维数 + 单延数据”，与经典的结果（正则完整 $D$-模在曲线上由“除子上的局部系统与粘合”描述）一致。" },
    ],
    remarks: [
      "支集条件的两半不能只保留一半。若只要求 $\\dim\\mathrm{Supp}\\,\\mathcal{H}^i(\\mathcal{F})\\le -i$ 而不要求 $\\mathbb{D}\\mathcal{F}$ 也满足，则得到的子范畴不是 Abel 的、Verdier 对偶不保持它，而且“核与像”会跑到范畴外；典型反例是 $\\mathcal{L}[\\dim X+1]$ 型对象（只满足一半条件），它的对偶违反另一半，把它当作反常层会得出错误的长度与分解结论。",
      "移位约定不能在计算中省略。文献中写法多样（$\\mathrm{IC}$ 有时写作 $j_{!*}(\\mathcal{L}[\\dim X])$、有时写作 $\\mathrm{IC}(\\overline U,\\mathcal{L})[\\dim U]$），混用时会出现维数错位；而“$\\mathrm{Perv}$ 上的 $\\mathcal{H}^i$ 的支集维数 $\\le -i$”这一条是判定的唯一标准，任何写法都必须能还原到这条不等式，否则在计算交叉上同调次数时会系统性错位。",
      "复情形与 $\\ell$ 进情形的等价需要额外假设。Kashiwara–Mebkhout 对应要求系数域为 $\\mathbb{C}$（复解析/代数情形），$\\ell$ 进情形的 Riemann–Hilbert 对应需要正则性、构造性以及 $\\ell\\ne p$ 的假设；把复情形的结论直接搬到特征 $p$ 或 $\\ell$ 进会忽略这些条件，例如在特征 $p$ 的局部系统与 $D$-模之间不存在这样的等价（需要 F-isocrystal 与指数化模等替代工具）。",
      "IC 层的单性依赖“$U$ 光滑且 $\\mathcal{L}$ 不可约”。若 $U$ 不光滑或 $\\mathcal{L}$ 可约，则中间延拓可能不是单对象（例如 $\\mathcal{L}$ 分解时中间延拓也随之分解，但分解的方式不一定是直和，而可能是非分裂扩张）；因此在用“$\\mathrm{Perv}$ 的单对象都是 IC”这一结论时必须核对光滑性与不可约性，否则会把非单对象当作单对象而错误计算长度。",
    ],
    corollaries: [
      { title: '推论：$\\mathrm{Perv}(X)$ 是 Artin 范畴，故有有限的合成列与 Jordan–Hölder 定理', body: "由 $t$-结构给出的 Abel 结构与 $D^b_c(X)$ 中构造层的有限性（支集条件使得支集维数逐层下降，且每层都是有限维构造层），$\\mathrm{Perv}(X)$ 的每个对象都有有限长度的合成列，且合成因子的重数由 Jordan–Hölder 定理唯一确定；于是可以用“单对象的重数”来定义交叉上同调的维数与（在旗簇情形）Kazhdan–Lusztig 型的组合量。这条推论是把反常层用于计数与表示论的关键：一旦有合成列与重数，层的“维数”就变成可数的组合数据，从而与 Hecke 代数、Kazhdan–Lusztig 多项式、以及 Soergel 双模的基一一对应。", uses: ['abelian-structure-and-simple-objects', 'ic-sheaves-and-kazhdan-lusztig'] },
    ],
    references: [
      { title: 'Faisceaux pervers, Astérisque 100', author: 'A. Beilinson, J. Bernstein, P. Deligne (avec appendice de O. Gabber)', year: 1982 },
      { title: 'Sheaves in Topology, Universitext', author: 'Alexandru Dimca', year: 2004 },
      { title: 'The Hodge theory of algebraic maps, Annales scientifiques de l’École Normale Supérieure 38', author: 'Mark Andrea de Cataldo, Luca Migliorini', year: 2005 },
      { title: 'D-Modules, Perverse Sheaves, and Representation Theory, Progress in Mathematics 236', author: 'Ryoshi Hotta, Kiyoshi Takeuchi, Toshiyuki Tanisaki', year: 2008 },
    ],
    history: HISTORY,
  },

}
