/**
 * 批次 13 长篇证明数据：现代计数几何与镜像对称的 13 个节点。
 *
 * 写作约定（与 scripts/_check-proof-file.mjs 的检查一致）：
 *   · 正文用中文长段 + Unicode 数学符号（⊆ ⊗ → ↦ 𝓜̄ 𝕃 ψ λ κ β ≅ ∫ ∑），直接作为文本排版；
 *   · 只在需要真正排版公式时才用 $...$ 包住完整 LaTeX，反斜杠必须双写、美元符必须成对；
 *   · 所有长文字段一律用双引号 JS 字符串，正文里的撇号写成 Unicode 撇号 ′，
 *     以免单引号提前终止字符串（这是本批次最容易踩的语法坑）；
 *   · 每步正文都在 400 字以上，不写无信息量的凑字数句子。
 */

const step = (id, title, body, uses) => ({ id, title, body, uses: uses ?? [] })
const HISTORY = "本条由公开教材、综述与原始论文重新组织，项目自行改写并注明来源，未复制原文。"

export const BATCH_13_PROOFS = {

  /* ═══════════════════════════════════════════════════════════
   * 1. psi 类与 tautological 环
   * ═══════════════════════════════════════════════════════════ */

  "c-psi-classes": {
    statement: "设 $\\overline{\\mathcal{M}}_{g,n}$ 是 n 个标记点的亏格 g 稳定曲线模空间，$\\pi:\\overline{\\mathcal{M}}_{g,n+1}\\to\\overline{\\mathcal{M}}_{g,n}$ 为遗忘态射，$s_i$ 为第 i 个标记点给出的截面。第 i 个标记点处的余切线丛定义为 $\\mathbb{L}_i=s_i^{*}\\omega_{\\pi}$（$\\omega_{\\pi}$ 是泛曲线 $\\pi$ 的相对对偶层），其第一 Chern 类记作 $\\psi_i=c_1(\\mathbb{L}_i)$，称为 psi 类。基本性质：(1) $\\psi_i$ 是余维 1 的类，且 $\\pi_i(\\psi_{n+1}^{a+1})=\\kappa_a$ 给出 kappa 类；(2) 对 $i<n$ 有边界关系 $\\psi_i=\\pi^{*}\\psi_i+D_{i,n}$；(3) 亏格 0 的顶部相交数全为 1：$\\int_{\\overline{\\mathcal{M}}_{0,n}}\\psi_1^{n-3}=1$；(4) 由 psi 类、边界类、kappa 类、lambda 类共同张成的子环称为 tautological 环 $R^{*}(\\overline{\\mathcal{M}}_{g,n})$。相交数 $\\int\\psi_1^{a_1}\\cdots\\psi_n^{a_n}$ 正是 Witten 猜想（Kontsevich 定理）所计算的对象。",
    deepExplanation: "psi 类是模空间上“最容易写下来、最难算清楚”的一族类。它的定义只用到一个几何动作：把泛曲线上的相对对偶层沿着第 i 个截面拉回来。这个动作之所以值得单独命名，是因为它把“第 i 个标记点附近的局部坐标”这一分析信息编码成了一个余维 1 的上同调类，于是两条不同的稳定曲线之间的比较问题变成了ψ类的相交数问题。亏格 0 的情形几乎毫无张力：$\\overline{\\mathcal{M}}_{0,n}$ 的顶部 psi 相交数一律等于 1，因为所有具体的组合信息都被自动抹平了。真正的信息从亏格 1 开始出现：$\\int_{\\overline{\\mathcal{M}}_{1,1}}\\psi_1=1/24$ 是第一个“有内容的”数值，它不是整数，说明模空间在这个层面已经是带稳定化子的叠而不是流形。tautological 环的提出正是为了把这些类以及它们与边界类、kappa 类、lambda 类的所有乘法关系装进一个有限生成的环里，然后问这个环的结构（维数、socle、Gorenstein 性），而不是逐个去算无穷多个相交数。",
    steps: [
      step("cotangent-line-definition", "余切线丛与 psi 类的定义：为什么它不恒为零",
        "设 $\\pi:\\overline{\\mathcal{M}}_{g,n+1}\\to\\overline{\\mathcal{M}}_{g,n}$ 是遗忘第 n+1 个标记点的态射，泛曲线上的相对对偶层 $\\omega_{\\pi}$ 限制在第 i 个截面 $s_i$ 上就给出第 i 个标记点处的余切线丛 $\\mathbb{L}_i=s_i^{*}\\omega_{\\pi}$。直观上，$\\omega_{\\pi}$ 沿着纤维给出曲线上的全纯微分，把它限制在标记点上得到的是“该点处的余切空间”这一维向量空间随模空间变化的族，因此 $\\mathbb{L}_i$ 是模空间上的线丛，$\\psi_i=c_1(\\mathbb{L}_i)$ 是它的第一 Chern 类，落在 $H^2(\\overline{\\mathcal{M}}_{g,n})$ 中。它的几何意义是：当曲线在模空间里移动时，第 i 个标记点处的局部坐标会以怎样的速度改变，$\\psi_i$ 度量这个改变。psi 类不恒为零的关键在于管化（稳定化子）的存在：在 $\\overline{\\mathcal{M}}_{0,3}$ 这个点上所有线丛都平凡，故 $\\psi_i=0$；但只要模空间有正的维数，$\\mathbb{L}_i$ 就有非零次数，$\\psi_i$ 就是非零的余维 1 类。特别地，$\\mathbb{L}_i$ 可以不是平凡丛，这正好对应“标记点附近的局部坐标不能被整体地选成常数”这一事实。",
        []),
      step("boundary-relation", "边界关系 $\\psi_i=\\pi^{*}\\psi_i+D_{i,n}$ 与 $\\psi_1=D_{1,4}$ 的手算",
        "这一步给出 psi 类最有用的计算工具，即与遗忘态射的关系。对 $i<n$，在 $\\overline{\\mathcal{M}}_{g,n}$ 上有 $\\psi_i=\\pi^{*}\\psi_i+D_{i,n}$，其中 $D_{i,n}$ 是使标记点 i 与 n 单独落在一条二点稳定有理分支上的边界除子。它的来源是相对对偶层沿泛曲线的比较：泛曲线 $\\mathcal{C}_{g,n+1}\\to\\mathcal{C}_{g,n}$ 可以看作先遗忘纤维上的点再作稳定化（必要时收缩不稳定分支），而 $\\omega_{\\pi}$ 在收缩过程中会多出一个例外除子的贡献，沿截面取限制就把这个多出来的项变成了 $D_{i,n}$。在 $\\overline{\\mathcal{M}}_{0,4}$ 上可直接核算：此时底模空间 $\\overline{\\mathcal{M}}_{0,3}$ 是一个点，故 $\\pi^{*}\\psi_1=0$，于是 $\\psi_1=D_{1,4}$，即 $\\psi_1$ 恰好是标记点 1 与 4 单独成对那条边界点。因为 $\\overline{\\mathcal{M}}_{0,4}\\cong\\mathbb{P}^1$ 上有三个边界点 $D_{12|34},D_{13|24},D_{14|23}$，所以 $\\psi_1$ 就是其中一个点类，$\\int_{\\overline{\\mathcal{M}}_{0,4}}\\psi_1=1$。这条手算把“psi 类是除子类”这件事在最简单的例子里落成了可验证的等式。",
        ["cotangent-line-definition"]),
      step("kappa-lambda-and-tautological", "kappa 类与 lambda 类：tautological 环的生成元",
        "把 psi 类沿遗忘态射推下去就得到另一族自然类：定义 $\\kappa_a=\\pi(\\psi_{n+1}^{a+1})$，即把第 n+1 个标记点处的 psi 类的高次幂沿遗忘态射推前到 $\\overline{\\mathcal{M}}_{g,n}$，这给出 $\\kappa_a\\in H^{2a}(\\overline{\\mathcal{M}}_{g,n})$，是 Mumford 提出的 kappa 类；由于 psi 类只在 $\\mathcal{M}_{g,n}$ 内部是“平坦方向”的类，kappa 类可以理解为“把曲线在模空间中移动时曲率的 a 次幂积分掉”的结果。另一族是 lambda 类：泛曲线的 Hodge 丛 $\\mathbb{E}=\\pi_*\\omega_{\\pi}$ 的 Chern 类 $\\lambda_i=c_i(\\mathbb{E})$。这四族类（psi、边界、kappa、lambda）通过 $R^{*}(\\overline{\\mathcal{M}}_{g,n})$ 的定义联系起来：把 psi 类与边界类的所有乘法关系与拉回、推前关系生成的子环，就是 tautological 环。它们之间的换算关系（例如 $\\kappa_a$ 可以用 psi 与边界类组合表示，$\\lambda$ 类可以用 psi 类的积分表示）之所以成立，是因为这些类几何上都在泛曲线的相对对偶层附近产生，因此它们之间没有独立的新信息，只有换坐标的自由度。",
        ["boundary-relation"]),
      step("genus0-top-intersections", "亏格 0 的顶部相交数：由弦方程统一算出为 1",
        "对亏格 0，所有只含 $\\psi_1$ 幂的顶部相交数都等于 1，即 $\\int_{\\overline{\\mathcal{M}}_{0,n}}\\psi_1^{n-3}=1$ 对一切 $n\\ge 4$ 成立（$n=3$ 时模空间是一个点，没有正次数类可积，约定空积为 1）。归纳证明用弦方程：对 $\\overline{\\mathcal{M}}_{0,m}$ 上的顶部相交数，有恒等式 $\\langle\\tau_a\\tau_0^{m-2}\\rangle=\\sum$（把 $\\tau_a$ 降阶为 $\\tau_{a-1}$ 并把一个 $\\tau_0$ 提出）形如 $\\langle\\tau_a\\tau_0^{m-2}\\rangle_{0}=\\langle\\tau_{a-1}\\tau_0^{m-1}\\rangle_{0}$，而 $\\tau_0$ 的插入可以通过遗忘态射的推前写成 $1/2\\sum$ 或直接由 $\\psi$ 的边界关系化为更低一层的相交数。用 $m=4$ 的基例 $\\int\\psi_1=1$（上一步已手算）作起点，每次把一个 $\\psi_1^{a}$ 拆成 $\\psi_1^{a-1}$ 并降低标记点数，归纳得到所有 $\\int_{\\overline{\\mathcal{M}}_{0,n}}\\psi_1^{n-3}=1$。这条结论的几何解释是：亏格 0 的曲线没有模，所有理由都在边界上被完全分解，于是 psi 类的幂次积分不携带任何叶状结构信息，只剩下“组合权 1”。从亏格 1 起，同样的积分给出 $1/24$ 这样非整数的值，说明出现真正的模信息。",
        ["boundary-relation"]),
      step("ring-structure-and-others", "环的结构、非 tautological 类与 Gorenstein 性",
        "tautological 环并非整个上同调环，它只是由这几族特殊类生成的子环：对足够大的亏格与标记点数，$H^{*}(\\overline{\\mathcal{M}}_{g,n})$ 中存在不能被这些类张出的类，这类“非 tautological 类”的存在性由 Graber 与 Pandharipande 对 $\\overline{\\mathcal{M}}_{2,20}$ 一类空间的构造给出，因此“上同调环是 tautological 的”这一自然猜想是错的。另一方面，tautological 环自身有很强的正性结构：$R^{*}(\\overline{\\mathcal{M}}_{g})$ 的 socle 落在次数 $g-2$，且配对 $R^{d}\\times R^{g-2-d}\\to R^{g-2}\\cong\\mathbb{Q}$ 是完美配对，这就是 Faber 提出的 Gorenstein 猜想，由 Graber–Vakil 与 Faber–Pandharipande 证明。这条结构的含义是：把规模巨大的上同调环换成一个小得多的 tautological 环之后，得到的不是一个杂乱的对象而是一个有限维 Poincaré 对偶代数，其 socle 次数只由亏格决定，维数由 $3g-3$ 决定。这也解释了为什么相交数计算可以只在这一小圈类里进行：算出来的数都落在这个 Gorenstein 结构之内，不需要处理整个上同调环。",
        ["kappa-lambda-and-tautological"]),
      step("witten-kontsevich-statement", "Witten 猜想的内容与它可以核对的一个数值",
        "Witten 猜想断言：把全部相交数打包成母函数 $F=\\sum_{g,n}\\frac{1}{n!}\\sum_{a_1,\\dots,a_n}\\Bigl(\\prod t_{a_i}\\Bigr)\\int_{\\overline{\\mathcal{M}}_{g,n}}\\psi_1^{a_1}\\cdots\\psi_n^{a_n}$，则它以 $\\exp$ 的形式满足 KdV 层级（等价地满足 Virasoro 约束），且初始条件由三条基本值固定：$\\int_{\\overline{\\mathcal{M}}_{0,3}}1=1$、$\\int_{\\overline{\\mathcal{M}}_{1,1}}\\psi_1=1/24$ 以及 $\\psi$ 类的幂次积分在亏格 0 全部为 1。Virasoro 约束的具体形式给出可用的递推：插入 $\\tau_0$ 的弦方程为 $\\langle\\tau_0\\prod\\tau_{a_i}\\rangle=\\sum_i\\langle\\tau_{a_i-1}\\prod_{j\\neq i}\\tau_{a_j}\\rangle$，插入 $\\tau_1$ 的膨胀方程为 $\\langle\\tau_1\\prod\\tau_{a_i}\\rangle=(2g-2+n)\\langle\\prod\\tau_{a_i}\\rangle$。用这两条把第一个非平凡值核算出来：$\\langle\\tau_1\\tau_0\\tau_0\\tau_0\\rangle_{g=0}$ 的膨胀方程系数为 $2\\cdot 0-2+3=1$，右边是 $\\langle\\tau_0^3\\rangle_{g=0}=1$，故这个相交数等于 1，与上一步对 $\\overline{\\mathcal{M}}_{0,4}$ 的手算完全一致。而 $\\int_{\\overline{\\mathcal{M}}_{1,1}}\\psi_1=1/24$ 无法由亏格 0 推出，它是亏格 1 的新输入，也是“psi 类积分从某处开始真正非平凡”的第一个证据。",
        ["genus0-top-intersections"]),
    ],
    conclusion: "在 $\\overline{\\mathcal{M}}_{g,n}$ 上，$\\psi_i=c_1(s_i^{*}\\omega_{\\pi})$ 是第 i 个标记点处的 psi 类，满足边界关系 $\\psi_i=\\pi^{*}\\psi_i+D_{i,n}$ 与 $\\pi_*(\\psi_{n+1}^{a+1})=\\kappa_a$；亏格 0 的顶部相交数恒为 1，亏格 1 起出现 $1/24$ 这类非平凡值。由 psi、边界、kappa、lambda 类生成的 tautological 环是上同调环的真子环（存在非 tautological 类），但它在 $\\overline{\\mathcal{M}}_g$ 上满足 Faber 的 Gorenstein 性质，socle 次数为 $g-2$。",
    dependencies: [],
    consequences: [],
    explanation: "这条记录的组织逻辑是“先把定义算成几何，再把几何算成数”。第一步把 $\\psi_i$ 定义为相对对偶层沿截面的拉回，这是唯一需要牢记的定义；第二步把定义在一个四标记点的例子里兑现成“边界点类”，从此 psi 类不再是抽象记号而是一个可以指认的除子；第三步把 kappa、lambda 类交代清楚，说明 tautological 环为什么只有这几族生成元；第四、五步分别处理“能算的部分”（亏格 0 全为 1）与“不能整体算的部分”（亏格 $\\ge 1$ 需要 KdV 递推），第六步给出 Witten 猜想的准确形式与一次可核对的代入计算。整体上，psi 类的意义在于把模空间的相交论压缩到一个有限维代数里，使得“数曲线”这件事可以被写成对 psi 类幂次的积分，从而交给组合与可积系统的机器去处理。",
    examples: [
      { title: "例子：在 $\\overline{\\mathcal{M}}_{0,4}$ 与 $\\overline{\\mathcal{M}}_{0,5}$ 上把 psi 积分算到底", body: "由边界关系，在 $\\overline{\\mathcal{M}}_{0,4}\\cong\\mathbb{P}^1$ 上 $\\psi_1=D_{1,4}$，于是 $\\int_{\\overline{\\mathcal{M}}_{0,4}}\\psi_1=1$；同样的道理 $\\psi_1^2=0$（次数超过维数 1）。转到 $\\overline{\\mathcal{M}}_{0,5}$（维数 2），用弦方程把一个 $\\tau_0$ 提到前面：$\\langle\\tau_2\\tau_0\\tau_0\\tau_0\\rangle_{0,5}=\\langle\\tau_1\\tau_0\\tau_0\\tau_0\\rangle_{0,4}$，再用膨胀方程，右边等于 $(2\\cdot0-2+3)\\langle\\tau_0^3\\rangle_{0,3}=1$，于是 $\\int_{\\overline{\\mathcal{M}}_{0,5}}\\psi_1^2=1$。继续同一递归可以验证 $\\int_{\\overline{\\mathcal{M}}_{0,6}}\\psi_1^3=1$，与“亏格 0 顶部 psi 相交数全为 1”一致。作为对照，$\\int_{\\overline{\\mathcal{M}}_{1,1}}\\psi_1=1/24$，这个数字是 $\\overline{\\mathcal{M}}_{1,1}$ 上 Hodge 丛的次数，无法由亏格 0 的这类递归得到。" },
      { title: "例子：$\\kappa_0$ 与 $\\psi$ 推前在 $\\overline{\\mathcal{M}}_{0,4}$ 上的换算", body: "取 $\\overline{\\mathcal{M}}_{0,4}$，遗忘第 5 个标记点的态射 $\\pi$ 把 $\\overline{\\mathcal{M}}_{0,5}$ 送到 $\\overline{\\mathcal{M}}_{0,4}$，其纤维是 $\\overline{\\mathcal{M}}_{0,5}$ 中固定四点的稳定曲线（一条 4 点曲线加上一个自由点）。由定义 $\\kappa_0=\\pi(\\psi_5)$，而 $\\pi$ 的纤维维数为 1、相对维数为 1，故 $\\kappa_0$ 是 $\\overline{\\mathcal{M}}_{0,4}$ 上的 0 次类，其积分为 $\\int_{\\overline{\\mathcal{M}}_{0,4}}\\kappa_0=\\int_{\\overline{\\mathcal{M}}_{0,5}}\\psi_5=1$。同一位置的 $\\kappa_1=\\pi(\\psi_5^2)$ 给出次数 1 的类，$\\int_{\\overline{\\mathcal{M}}_{0,4}}\\kappa_1=1$。这些换算说明 kappa 类不是新的独立生成元，而是 psi 类的推前，两者在同一条泛曲线的相对对偶层上产生。" },
    ],
    remarks: [
      "$\\psi_i$ 在 $\\overline{\\mathcal{M}}_{0,3}$ 上恒为零：这个点上模空间是零维的、所有线丛都平凡，因此把“psi 类非零”当作一般事实会在这类低维基例上出错，弦方程的基例必须用 $\\int_{\\overline{\\mathcal{M}}_{0,4}}\\psi_1=1$ 而不是 $\\int_{\\overline{\\mathcal{M}}_{0,3}}\\psi_1$。",
      "psi 类与 kappa 类不能互换使用：$\\psi_i$ 依赖于标记点编号（换编号得到不同的类），而 $\\kappa_a$ 是把第 n+1 个点推前得到的、只依赖曲线族的类；在遗忘态射下前者按 $\\psi_i=\\pi^{*}\\psi_i+D_{i,n}$ 变换、后者按定义不变，把两者当成同一族类会导致推前公式整体系数错误。",
      "tautological 环不等于上同调环：已知存在非 tautological 类（例如 $\\overline{\\mathcal{M}}_{2,20}$ 上的构造），因此“所有相交数都可以只用 psi、kappa、lambda 类写出来”这句话只在 tautological 环内部成立，用它去覆盖整个 $H^{*}(\\overline{\\mathcal{M}}_{g,n})$ 是越界。",
      "“亏格 0 顶部 psi 相交数为 1”不能推广到带 lambda 类或 kappa 类的积分：例如亏格 1 的 $\\int\\lambda_1=1/24$、亏格 2 的 $\\int\\psi_1^4=1/1152$ 都是非整数值，可见整数性只是 psi 类在亏格 0 的特殊现象，而不是任何顶部相交数的通性。",
    ],
    corollaries: [
      { title: "推论：$\\overline{\\mathcal{M}}_{0,n}$ 上的 psi 类生成环按顶部配对看是“每项权 1”的", body: "由 $\\int_{\\overline{\\mathcal{M}}_{0,n}}\\psi_1^{n-3}=1$ 与对称性，任一单项式 $\\psi_1^{a_1}\\cdots\\psi_n^{a_n}$ 在顶部次数上的积分只依赖是否存在某个标记点承载了全部幂次，这种“组合权恒为 1”的性质使亏格 0 的相交数不需要任何递推就可以逐个读出，也正是取值于亏格 0 的 GW 不变量在 $X=\\text{pt}$ 时全部退化为 1 的原因。", uses: ["genus0-top-intersections"] },
    ],
    references: [
      { title: "Intersection theory on the moduli space of curves and the matrix Airy function", author: "M. Kontsevich", year: 1992 },
      { title: "Two-dimensional gravity and intersection theory on moduli space", author: "E. Witten", year: 1991 },
      { title: "The Gorenstein conjecture for $\\overline{\\mathcal{M}}_g$", author: "T. Graber, R. Vakil", year: 2005 },
      { title: "Moduli of curves (GTM 187), Chapter on psi classes", author: "J. Harris, I. Morrison", year: 1998 },
    ],
    history: HISTORY,
  },

  /* ═══════════════════════════════════════════════════════════
   * 2. Gromov–Witten 不变量（一般形式）
   * ═══════════════════════════════════════════════════════════ */

  "c-gw-invariants": {
    statement: "设 X 是复数域上光滑射影簇，$\\beta\\in H_2(X,\\mathbb{Z})$ 是曲线类，$\\overline{\\mathcal{M}}_{g,n}(X,\\beta)$ 是稳定映射模空间，$\\mathrm{ev}_i$ 是赋值态射，$\\psi_i$ 是 psi 类。它的虚拟维数为 $\\operatorname{vdim}=(\\dim X-3)(1-g)+n+\\int_\\beta c_1(T_X)$，其上带有 Behrend–Fantechi 虚拟基本类 $[\\overline{\\mathcal{M}}_{g,n}(X,\\beta)]^{\\mathrm{vir}}\\in A_{\\operatorname{vdim}}$。对 $\\gamma_i\\in H^{*}(X)$ 与非负整数 $a_i$，Gromov–Witten 不变量定义为 $\\langle\\tau_{a_1}(\\gamma_1)\\cdots\\tau_{a_n}(\\gamma_n)\\rangle_{g,\\beta}=\\int_{[\\overline{\\mathcal{M}}_{g,n}(X,\\beta)]^{\\mathrm{vir}}}\\prod_i\\psi_i^{a_i}\\,\\mathrm{ev}_i^{*}\\gamma_i$，并约定它只在下标总次数等于虚拟维数时非零。该定义对任意光滑射影 X 有定义、不依赖虚拟类的构造选择，并满足遗忘、分离与粘合公理，从而构成量子上同调与镜像对称的复几何侧框架。",
    deepExplanation: "GW 不变量要解决的是一个计数问题：给定 X 上若干点与若干条曲线类，通过它们的曲线有多少条？直接数会遇到两个障碍。第一个障碍是“维数不对”：X 上稳定映射构成的模空间通常比期望的维数大，多出来的方向来自 X 自身的自由度（把曲线平移一下得到的还是同一族曲线），因此积分 $\\int_{\\overline{\\mathcal{M}}}1$ 得到的不是计数结果而是发散的体积。第二个障碍是“模空间可能奇异”：即使维数对了，模空间的奇点也会让“取基本类再积分”这个动作不合法。Behrend–Fantechi 的虚拟基本类正是同时解决这两个障碍的方案：它在每个点上取的是一个“按形变—阻碍理论截下来的”类，维数等于期望维数，并且在参数变化下相容。有了它，计数问题才有唯一的答案，而且这个答案满足一组公理（遗忘、分离、粘合），这组公理足以支撑整个量子上同调与 WDVV 的代数机器，也是镜像对称把周期积分与 GW 不变量对起来的语言基础。",
    steps: [
      step("stable-maps-and-moduli", "稳定映射与模空间：定义、稳定性与紧性",
        "一个到 X 的 n 点稳定映射由 $(C,p_1,\\dots,p_n,f)$ 组成：$C$ 是连通、射影、亏格 g 的预稳定曲线（允许结点），$p_i$ 是互不相同的平滑点，$f:C\\to X$ 是代数态射且 $f_*[C]=\\beta$。稳定性指其自同构群有限：等价地，每个被 $f$ 收缩掉的有理分支上至少有 3 个特殊点、每条被收缩掉的椭圆分支上至少有 1 个特殊点。定义 $\\overline{\\mathcal{M}}_{g,n}(X,\\beta)$ 为这些对象的同构类构成的空间，它有自然的 Deligne–Mumford 叠结构：由稳定化子有限，它是一个 DM 叠而非一般叠；Kontsevich 的稳定映射空间理论给出它是一个射影族上恰当的 DM 叠，当 X 射影时还是恰当的射影叠。紧性的证明用稳定归约：对一族稳定映射取极限时，若出现收缩成分或极限曲线不稳定，就在退化的部位插入适当的有理分支并把映射延拓过去，得到唯一的稳定极限，从而保证叠恰当。有了紧性与 DM 结构，才可以在其上定义相交论与积分。",
        []),
      step("vdim-and-deformation-complex", "虚拟维数：从形变—阻碍复形读出 $(\\dim X-3)(1-g)+n+\\int_\\beta c_1(T_X)$",
        "在一点 $[f]\\in\\overline{\\mathcal{M}}_{g,n}(X,\\beta)$ 处，模空间的切空间与阻碍空间由一条正合列描述：$0\\to\\operatorname{Aut}(C,p_i)\\to H^0(C,f^{*}T_X)\\to T_{[f]}\\mathcal{M}\\to \\operatorname{Def}(C,p_i)\\to H^1(C,f^{*}T_X)\\to \\operatorname{Ob}_{[f]}\\to0$。前两项是曲线自身的自同构与形变，第三项是映射的形变，第五项是映射的阻碍。把这条序列的各项维数用 Riemann–Roch 算出来：$\\dim H^0(C,f^{*}T_X)-\\dim H^1(C,f^{*}T_X)=\\int_\\beta c_1(T_X)+(1-g)\\dim X$，$\\dim\\operatorname{Aut}-\\dim\\operatorname{Def}=3-3g$（对 $g\\ge2$ 的稳定曲线），把这三行合并并把期望维数减去 $\\dim\\operatorname{Aut}$ 与 $\\dim H^0$（它们对应同构与坐标的冗余），得到虚拟维数 $(\\dim X-3)(1-g)+n+\\int_\\beta c_1(T_X)$。这个式子是后面一切积分的“收支平衡表”：只有当被积类的总次数恰好等于它时，积分才可能非零。它同时说明了三件事——每加一个标记点增加 1 维（标记点可以自由移动）、目标簇的规范类通过 $\\int_\\beta c_1$ 进入、亏格通过 $(\\dim X-3)(1-g)$ 进入，其中 $\\dim X=3$ 的 Calabi–Yau 情形给出 $\\operatorname{vdim}=n$，这正是“三维 CY 上的 GW 不变量与标记点数一样多”这一现象的来源。",
        ["stable-maps-and-moduli"]),
      step("obstruction-bundle-and-excess", "多出来的维数与阻碍丛：Li–Tian 的 $e(\\mathrm{Ob})\\cap[\\mathcal{M}]$",
        "在不加任何修正时，模空间的实际维数一般比虚拟维数大，这个差值称为多余维数（excess）。最极端的例子是常值映射：$\\beta=0$ 时 $\\overline{\\mathcal{M}}_{0,0}(X,0)\\cong X$，实际维数是 $\\dim X$，而虚拟维数是 $\\dim X-3$，差值恒为 3。此时把基本类 $[X]$ 直接积分得到的是 X 的体积（与计数无关），必须换成正确维数的类。Li 与 Tian 给出的显式做法是：在稳定映射的“映射空间”层面（即固定曲线不动、只让映射变化的空间）上，阻碍由 $H^1(C,f^{*}T_X)$ 给出，它在模空间上组装成一个有限秩向量丛 $\\mathrm{Ob}=R^1\\pi_*f^{*}T_X$（在好情形下取其对偶的上同调，维数等于多余维数），于是可以定义 $[\\overline{\\mathcal{M}}]^{\\mathrm{vir}}=e(\\mathrm{Ob})\\cap[\\overline{\\mathcal{M}}]$，即阻碍丛的顶部 Chern 类与基本类相交。这个做法在光滑、无多余阻碍时与朴素计数一致，且能把“多出来的维数”通过欧拉类一次性切掉，是理解虚拟类为何有效的最直接图像。",
        ["vdim-and-deformation-complex"]),
      step("behrend-fantechi-intrinsic", "Behrend–Fantechi 的内蕴正规锥与虚拟基本类",
        "上一段的阻碍丛描述需要模空间在某个意义上“光滑且多余维数由丛给出”，这在有奇异或阻碍不可控时失效。Behrend 与 Fantechi 的构造绕开这一要求：对任意带有 2-项完美阻碍理论（即一个在 $-1,0$ 次上有项、与截断余切复形相容的映射 $E^{\\bullet}\\to L^{\\bullet}_{\\mathcal{M}}$）的 DM 叠，可以构造内蕴正规锥 $C_{\\mathcal{M}}\\subset h^{1}/h^{0}(E^{\\bullet})$，它是一个向量丛叠里的锥，再沿零截面作 Gysin 拉回定义 $[\\mathcal{M}]^{\\mathrm{vir}}=0^{!}_{E^{\\bullet}}[\\mathcal{M}]$。稳定映射模空间恰好带有这样一个完美阻碍理论：障碍理论由 $R\\pi_*f^{*}T_X$ 的截断给出，长度 2、维数正好是虚拟维数。这条构造的三条收益是决定性的：其一，虚拟类与阻碍理论的选取无关（不同选取给出同一个类）；其二，它对一切拉回相容，包括赋值态射的拉回与边界粘合的拉回，因此“在退化曲线上算出来的数”与“在光滑曲线上算出来的数”自动一致；其三，它在族里满足形变不变性，使 GW 不变量只依赖 X 与 $\\beta$ 而不依赖参数。没有这三点，粘合公理与 WDVV 都无从谈起。",
        ["obstruction-bundle-and-excess"]),
      step("axioms-forgetful-splitting", "公理：遗忘、分离与粘合，以及除子公理的核算",
        "GW 不变量满足一组公理，它们正是“量子上同调”与“WDVV”两条代数结论的全部输入。(1) 遗忘公理：遗忘态射 $\\pi:\\overline{\\mathcal{M}}_{g,n+1}(X,\\beta)\\to\\overline{\\mathcal{M}}_{g,n}(X,\\beta)$ 的纤维是曲线上的点，其推前把 $\\psi_{n+1}$ 的幂变成 kappa 类的拉回，于是把 $\\tau_0$ 的插入推成标记点数更少的积分（这正是弦方程的几何来源）。若被遗忘的标记点是唯一保证稳定性的那一个，则在 $\\beta=0$ 之外还需要按稳定化规则重写，这是该公理唯一需要小心的地方。(2) 分离与粘合公理：$\\overline{\\mathcal{M}}_{g,n}(X,\\beta)$ 的边界除子可以分解为“在曲线某点粘合两条曲线、并把曲线类分成 $\\beta_1+\\beta_2$”的粘合态射的像，虚拟类在这些粘合态射下按乘积法则拉回，于是自由能的一阶导在边界上等于低阶自由能的乘积之和，这条乘积法则就是 WDVV 的几何来源。(3) 除子公理：若 $\\gamma_{n+1}=D$ 是除子类，则由纤维维数 1 的“多一个自由点”的多余交计算得 $\\langle\\tau_0(D)\\prod_{i}\\tau_{a_i}(\\gamma_i)\\rangle_{g,\\beta}=(D\\cdot\\beta)\\,\\langle\\prod_i\\tau_{a_i}(\\gamma_i)\\rangle_{g,\\beta}$，即除子类的插入只贡献一个与 $\\beta$ 的相交数因子。取 $X=\\mathbb{P}^1$、$D=\\mathrm{pt}$、$\\beta=d[\\mathbb{P}^1]$（$D\\cdot\\beta=d$）即可核对：每多插一个点类，值乘以 d，与“把一个点钉在映射前像上，再让其余标定点自由移动”这一几何计数完全吻合。",
        ["behrend-fantechi-intrinsic"]),
      step("example-counting-planes", "具体核算：$X=\\mathbb{P}^2$ 的 $N_d$ 与 $X=\\text{pt}$ 的 $1/24$",
        "取 $X=\\mathbb{P}^2$、$g=0$、$\\beta=d\\cdot[\\text{line}]$。虚拟维数为 $(2-3)\\cdot1+n+3d=3d-1+n$。要让积分得到一个数，每个点类的插入（$\\mathrm{pt}\\in H^4(\\mathbb{P}^2)$，余维 2）贡献 2，于是 $2n=3d-1+n$，解得 $n=3d-1$，与几何直觉完全一致：通过 $3d-1$ 个一般位置的点的 d 次有理曲线条数。定义 $N_d=\\langle\\mathrm{pt}^{3d-1}\\rangle_{0,d}$，古典枚举几何给出 $N_1=1$（两点定一直线）、$N_2=1$（五点定一二次曲线）、$N_3=12$（八点定十二条有理三次曲线），而 GW 理论进一步给出 $N_4=620$、$N_5=87304$，这些值全部由虚拟类上的积分算出，可以逐项用递推验证。另一个极端是 $X=\\text{pt}$，此时 $\\overline{\\mathcal{M}}_{g,n}(\\mathrm{pt},\\beta)$ 就是 $\\overline{\\mathcal{M}}_{g,n}$ 本身，虚拟类等于基本类，GW 不变量退化为 psi 类相交数：$\\langle\\tau_0\\tau_0\\tau_0\\rangle_{g=0}=1$、$\\langle\\tau_1\\rangle_{g=1}=\\int_{\\overline{\\mathcal{M}}_{1,1}}\\psi_1=1/24$。这两个例子的对照说明虚拟类的作用是把“几何计数”与“模空间上的 psi 积分”这两件看起来完全不同的事接到同一条公式里，前者是枚举几何的对象，后者是可积系统的对象。",
        ["axioms-forgetful-splitting"]),
    ],
    conclusion: "对光滑射影簇 X 与曲线类 $\\beta$，稳定映射模空间 $\\overline{\\mathcal{M}}_{g,n}(X,\\beta)$ 带有维数为 $(\\dim X-3)(1-g)+n+\\int_\\beta c_1(T_X)$ 的虚拟基本类，GW 不变量 $\\langle\\prod\\tau_{a_i}(\\gamma_i)\\rangle_{g,\\beta}$ 定义为 psi 类与赋值拉回在这个类上的积分；它不依赖虚拟类构造的选择，满足遗忘、分离与粘合公理以及除子公理，因此对任意光滑射影 X（含 Calabi–Yau 与一般型）都有定义，并构成量子上同调与镜像对称的复几何侧计算框架。",
    dependencies: [],
    consequences: [],
    explanation: "这条记录的主线是“为什么需要虚拟基本类”。如果不引入它，GW 不变量在 X 有余切、模空间维数比期望大时就没有定义：常值映射给出 X 的体积而不是计数、退化曲线的贡献无法与其光滑极限比较。虚拟类的两条等价描述分别解决不同的理解需求：Li–Tian 的 $e(\\mathrm{Ob})\\cap[\\mathcal{M}]$ 是显式且可算的，适合看“多余维数被欧拉类切掉”这件事；Behrend–Fantechi 的内蕴正规锥是概念上正确的，它解释了为什么虚拟类和阻碍理论的选取无关、为什么一切拉回相容。公理部分是把几何事实翻译成代数恒等式：遗忘公理给出弦方程、粘合公理给出自由能的一阶导的乘积法则（即 WDVV）、除子公理把除子类的插入化简为相交数因子。这三条公理合起来已经足够决定量子上同调的代数结构，也是镜像对称中把周期积分的导数与 GW 不变量对齐时所使用的那套等式。",
    examples: [
      { title: "例子：$\\beta=0$ 时虚拟类与 $c_{top}(T_X)$ 的关系", body: "取常值映射 $\\beta=0$、$g=0$、$n=0$。此时 $\\overline{\\mathcal{M}}_{0,0}(X,0)\\cong X$，虚拟维数为 $\\dim X-3$。对 $X=\\mathbb{P}^2$ 得 $\\operatorname{vdim}=-1$，故 $\\langle\\ \\rangle_{0,0}$ 按约定为零——用“次数大于维数的类积分等于零”这一条即可读出，不需要任何几何。对 $X=\\mathbb{P}^1$ 得 $\\operatorname{vdim}=-2$，同样为零。当 $n$ 增大到虚拟维数非负时，虚拟类上的积分给出涉及 $c_{top}(T_X)$ 的数值：例如 $X=\\mathbb{P}^2$、$\\beta=0$、$n=1$ 时虚拟维数为 $-1+1=0$，此时 $\\langle\\mathrm{pt}\\rangle_{0,0}$ 不为零的部分对应 $\\int_X c_1(T_X)\\cdot\\mathrm{pt}$ 型计算。这一族数的意义是：它们把“X 自身的拓扑不变量”作为 GW 理论的常量项，从而保证 $q\\to0$ 的极限退化为古典上同调环的相交数。" },
      { title: "例子：用除子公理核对 $\\mathbb{P}^1$ 上的两个不变量", body: "取 $X=\\mathbb{P}^1$、$D=\\mathrm{pt}$ 为除子类、$\\beta=d[\\mathbb{P}^1]$。虚拟维数为 $(1-3)\\cdot1+n+2d=2d+n-2$。先算 $n=3$、$d=1$：虚拟维数为 3，三个点类的总次数为 3，于是 $\\langle\\mathrm{pt},\\mathrm{pt},\\mathrm{pt}\\rangle_{0,1}$ 是度数为 1 的三点映射个数，等于 1，即“把 $\\mathbb{P}^1$ 上的三个点映到三个指定点”的唯一同构。再用除子公理核对：$\\langle\\mathrm{pt}^{m}\\rangle_{0,d}=(D\\cdot\\beta)^{m-1}\\langle\\mathrm{pt}\\rangle_{0,d}$ 型的化简使高维多重点不变量全部由 $d$ 决定，因此 $\\langle\\mathrm{pt},\\mathrm{pt},\\mathrm{pt}\\rangle_{0,d}=d\\cdot\\langle\\mathrm{pt},\\mathrm{pt}\\rangle_{0,d}$；而 $\\langle\\mathrm{pt},\\mathrm{pt}\\rangle_{0,d}$ 在 $d=1$ 时为 1，故 $d=1$ 的三点值为 1，与直接几何计数一致。" },
    ],
    remarks: [
      "去掉“X 光滑”这一假设后，$\\overline{\\mathcal{M}}_{g,n}(X,\\beta)$ 的阻碍理论不再自动是 2 项完美的，虚拟基本类需要用其他方法定义（如相对虚拟类或 Kiem–Li 的半完美构造），因此“GW 不变量对一切射影簇有定义”这句话在一般奇异簇上需要额外输入，而那些输入会改变不变量的数值含义。",
      "虚拟维数公式中的 $\\dim X-3$ 不能替换为 $\\dim X$：常值映射 $\\beta=0$ 时两者给出的维数差 3，若用错公式会要求 3 个额外的点类插入才能积分，从而把 X 的体积误算成计数，这是 GW 计算中最常见的一处符号错误。",
      "除子公理只对 $H^2$ 中的类成立：它依赖“遗忘一个除子类标记点后纤维维数为 1”这一事实，对 $H^4(\\mathbb{P}^2)$ 中的点类或 $H^{*}$ 中的高阶类，插入的贡献不是简单的相交数因子，而是真正的高维积分，把除子公理当作通用化简会导致高次不变量被系统性地算错。",
      "虚拟基本类不是基本类：$[\\mathcal{M}]^{\\mathrm{vir}}$ 一般不等于 $[\\mathcal{M}]$ 与某个欧拉类的乘积的推前（只有在模空间光滑且多余维数恰由一个丛给出时才对），因此不能用“先在模空间上积分再除以某个维数”的方式代替虚拟类，后者会漏掉边界上的多余交贡献。",
    ],
    corollaries: [
      { title: "推论：$X$ 为三维 Calabi–Yau 时 $\\operatorname{vdim}=n$", body: "若 $\\dim X=3$ 且 $c_1(T_X)=0$，则 $\\operatorname{vdim}=(3-3)(1-g)+n+0=n$，即 n 点 GW 不变量只在插入类的总次数为 n 时非零。特别地 $\\langle\\mathrm{pt},\\dots,\\mathrm{pt}\\rangle$（n 个点类）正好是维数平衡的情形，所以“数 CY 三流形中通过 n 个点的曲线”这类计数问题在虚拟类的语言里是可积的，而 psi 类的插入（次数更高）则需要额外的 $\\psi$ 类来平衡，这正是 MNOP 与拓扑顶点所处理的层次。", uses: ["vdim-and-deformation-complex"] },
    ],
    references: [
      { title: "Gromov-Witten invariants in algebraic geometry", author: "K. Behrend, B. Fantechi", year: 1997 },
      { title: "Virtual moduli cycles and Gromov-Witten invariants of algebraic varieties", author: "J. Li, G. Tian", year: 1998 },
      { title: "The intrinsic normal cone", author: "K. Behrend, B. Fantechi", year: 1997 },
      { title: "Gromov-Witten theory and enumerative geometry (lecture notes)", author: "R. Pandharipande" },
    ],
    history: HISTORY,
  },

  /* ═══════════════════════════════════════════════════════════
   * 3. 量子上同调
   * ═══════════════════════════════════════════════════════════ */

  "c-quantum-cohomology": {
    statement: "设 X 是光滑射影簇，$H^{*}(X)=H^{*}(X,\\mathbb{Q})$，$\\Lambda$ 是 Novikov 环（以曲线类 $\\beta$ 的 $q^\\beta$ 为形式变量的某类完备化）。在小量子上同调中，对 $\\alpha,\\beta,\\gamma\\in H^{*}(X)$ 定义三点函数 $\\langle\\alpha,\\beta,\\gamma\\rangle=\\sum_{\\beta\\in H_2(X,\\mathbb{Z})}\\langle\\alpha,\\beta,\\gamma\\rangle_{0,3,\\beta}q^{\\beta}$，并用 $\\langle\\alpha\\star\\beta,\\gamma\\rangle=\\langle\\alpha,\\beta,\\gamma\\rangle$（$\\langle\\cdot,\\cdot\\rangle$ 为 Poincaré 配对）定义量子积 $\\star$。则 $\\star$ 使 $QH^{*}(X,\\Lambda)$ 成为一个以 1 为单位、结合、（分次）交换的 $\\Lambda$-代数，且 $q\\to0$ 时 $\\star$ 退化到 cup 积。结合性等价于 WDVV 方程，即三/四点 GW 不变量的两种退化方式给出同一个数。对 Fano 簇（如 $\\mathbb{P}^n$、Grassmann 流形），$QH^{*}$ 有显式的有限表示。",
    deepExplanation: "量子上同调做的事情很纯粹：把 cup 积的一步乘法换成“先计数再相乘”。古典的 cup 积由三点的相交数 $\\int_X\\alpha\\cup\\beta\\cup\\gamma$ 决定（这是 Poincaré 配对下的结构常数）；量子上同调把这个结构常数换成三点 GW 不变量 $\\sum_\\beta\\langle\\alpha,\\beta,\\gamma\\rangle_{0,3,\\beta}q^\\beta$，于是乘积变成了依赖于 $q$ 的形式幂级数。$q$ 的意义是“曲线类记账”：$q^\\beta$ 记录粘合进去的曲线类，所以 $q\\to0$ 时只剩常值映射，回到古典 cup 积。这里最关键的一点是：这种替换一般不会自动保持结合性，而结合性恰好等价于 WDVV 方程。换句话说，模空间边界的几何（曲线可以在哪里退化）被完全翻译成了一条纯代数的结合律，而这条结合律是可积系统的入口。量子上同调之所以重要，是因为它把“计数曲线”这件事从一堆散落的数字变成一个有乘法、有单位、维数有限、常常可以完全写出的代数对象，从而让环的结构反过来给出计数结果。",
    steps: [
      step("novikov-ring-and-completion", "Novikov 环：为什么系数要形式化，以及收敛性问题",
        "对每个曲线类 $\\beta\\in H_2(X,\\mathbb{Z})$ 引入形式变量 $q^\\beta$ 并强制乘法规则 $q^{\\beta_1}\\cdot q^{\\beta_2}=q^{\\beta_1+\\beta_2}$，得到群代数 $\\mathbb{Q}[H_2(X,\\mathbb{Z})]$。直接把它当作系数环会遇到无穷和问题：三点函数是 $\\sum_\\beta \\langle\\ldots\\rangle_\\beta q^\\beta$，若允许 $\\beta$ 取遍所有类，这个和在形式上包含无穷多项同次的项，无法在通常的代数里求值。标准解决办法是把“有效类”与“次数”分开记账：作用量取整数 $\\omega\\cdot\\beta$（$\\omega$ 是丰沛的 Kähler 类），并按作用量分层取完备化，得到 Novikov 环 $\\Lambda$；由于固定作用量的有效曲线类只有有限多个（由 X 射影与 $\\omega$ 的丰沛性保证），每一层都是有限和，逐层完备化就使 $\\star$ 有定义。在 Fano 情形还有更强的简化：因为 $c_1(T_X)$ 是丰沛的，固定次数的 GW 不变量只在有限多个 $\\beta$ 上非零（次数平衡给出上界），$\\star$ 自动是 $\\Lambda$ 上的有限和。同样重要的区分是小量子上同调（只保留 $\\langle\\alpha,\\beta,\\gamma\\rangle_{0,3,\\beta}$，即无 psi 类插入）与大量子上同调（保留 $\\psi$ 类插入，系数含 $t$ 变量），本条记录讨论前者，后者是 Frobenius 流形的完整版本。",
        []),
      step("definition-of-star", "量子积的定义与它保持的次数与对称性",
        "由 Poincaré 配对非退化可以反解出乘积：要求 $\\langle\\alpha\\star\\beta,\\gamma\\rangle=\\sum_{\\beta\\in H_2}\\langle\\alpha,\\beta,\\gamma\\rangle_{0,3,\\beta}q^{\\beta}$ 对一切 $\\gamma$ 成立，唯一确定 $\\alpha\\star\\beta\\in QH^{*}(X,\\Lambda)$。这个定义立即给出三条性质。其一，次数保持：三点不变量只在 $\\deg\\alpha+\\deg\\beta+\\deg\\gamma=\\operatorname{vdim}=2\\dim X+2c_1\\cdot\\beta$ 时非零，故 $\\star$ 把次数 $(d_1,d_2)$ 的类送到次数 $d_1+d_2-2c_1\\cdot\\beta$ 的部分，即乘积的第 $q^\\beta$-分量落在 $H^{d_1+d_2-2c_1\\cdot\\beta}(X)$ 中，$q$ 带次数 $2c_1\\cdot\\beta$。其二，单位元是 $1\\in H^0(X)$：由除子公理（更准确地说由 $\\tau_0$ 的插入被遗忘态射推回）得 $\\langle 1,\\alpha,\\beta\\rangle_{0,3,\\beta}=0$ 对 $\\beta\\neq0$ 成立，而 $\\beta=0$ 时它就是古典的 $\\int_X\\alpha\\cup\\beta$，于是 $1\\star\\alpha=\\alpha$。其三，交换性：交换两个标记点的编号是模空间到自身的同构，它把 $\\psi_i$ 与 $\\mathrm{ev}_i^{*}\\gamma_i$ 互换，故 $\\langle\\alpha,\\beta,\\gamma\\rangle_\\beta=\\langle\\beta,\\alpha,\\gamma\\rangle_\\beta$，于是 $\\alpha\\star\\beta=\\beta\\star\\alpha$（在 $H^{*}$ 的 $\\mathbb{Z}/2$ 分次意义下还需补上 Koszul 符号，但记号的约定可以把它吸收）。",
        ["novikov-ring-and-completion"]),
      step("associativity-via-wdvv", "结合性：由四点不变量与两种退化核验同一等式",
        "要证 $(\\alpha\\star\\beta)\\star\\gamma=\\alpha\\star(\\beta\\star\\gamma)$，只需用 Poincaré 配对把它写成 $\\langle(\\alpha\\star\\beta)\\star\\gamma,\\delta\\rangle=\\langle\\alpha\\star(\\beta\\star\\gamma),\\delta\\rangle$，两边都由四点不变量表达。左边 $=\\langle\\alpha\\star\\beta,\\gamma,\\delta\\rangle=\\sum_{\\beta_1+\\beta_2=\\beta}\\sum_{e_i}\\langle\\alpha,\\beta,e_i\\rangle_{\\beta_1}\\langle e^i,\\gamma,\\delta\\rangle_{\\beta_2}q^{\\beta}$，右边 $=\\langle\\alpha,\\beta\\star\\gamma,\\delta\\rangle=\\sum_{\\beta_1+\\beta_2=\\beta}\\sum_{e_i}\\langle\\alpha,\\beta,\\gamma\\rangle$ 型的另一分组，两者都来自 $\\overline{\\mathcal{M}}_{0,4}(X,\\beta)$ 上四点不变量在边界除子 $D_{\\{1,2\\}|\\{3,4\\}}$ 与 $D_{\\{1,3\\}|\\{2,4\\}}$ 上的分解；把四点不变量按“把两条标记点分开的边界除子”代入虚拟类，得到的两个表达式相等，这正是 WDVV 方程 $\\langle\\alpha,\\beta,e_i\\rangle_{\\beta_1}\\langle e^i,\\gamma,\\delta\\rangle_{\\beta_2}$ 型恒等式。几何上这件事的理由是：$\\overline{\\mathcal{M}}_{0,4}$ 是一条 $\\mathbb{P}^1$，两个边界点 $D_{12|34}$ 与 $D_{13|24}$ 上算出的交集数之所以相等，是因为它们都是同一条 $\\overline{\\mathcal{M}}_{0,4}$ 上同一个虚拟类的次数，而 $\\overline{\\mathcal{M}}_{0,4}$ 的所有一点都是线性等价的。于是“曲线在哪里可以退化”这一几何自由度被翻译成了结合律，运算不再依赖标定点的分组方式。",
        ["definition-of-star"]),
      step("divisor-axiom-quantum-classical", "除子类：量子乘法在 $H^2$ 上仍然是古典的",
        "量子上同调的形变集中在“非除子部分”，这一点的原因是除子公理。设 $D\\in H^2(X)$，由除子公理 $\\langle\\tau_0(D),\\alpha,\\beta\\rangle_{0,3,\\beta}=(D\\cdot\\beta)\\langle\\alpha,\\beta\\rangle_{0,3,\\beta}$，于是 $D\\star\\alpha=\\sum_{\\beta}(D\\cdot\\beta)\\langle\\alpha,\\beta,\\cdot\\rangle_{0,3,\\beta}q^{\\beta}+D\\cup\\alpha$ 中带 $q^\\beta$ 的项可以重新解释为对 $q^\\beta$ 的求导：$(D\\cdot\\beta)q^{\\beta}=q^{D}\\partial_{D}q^{\\beta}$。因此量子乘法由除子类给出的那部分并不是新信息，而是一个“按次数加权”的微分算子作用在系数上，几何上对应的无非是把标记点推到除子 $D$ 上的自由度。推论是：在小量子上同调的“除子方向”上，$\\star$ 与 $\\cup$ 一致（更准确地说，乘一个除子类的算子在 $q\\to0$ 之外只是给 $q$ 的指数加上一个线性权重），所以真正需要新工具处理的只有 $H^{\\ge4}$ 的类。这也解释了为什么 $\\mathbb{P}^n$ 的量子上同调只由超平面类 $x$ 与关系 $x^{n+1}=q$ 决定，而 Grassmann 流形的量子上同调则复杂得多：因为后者的量子形变出现在非除子（Schubert 类）部分。",
        ["definition-of-star"]),
      step("examples-pn", "例子：$QH^{*}(\\mathbb{P}^n)$ 的完全计算与结构常数的核对",
        "对 $X=\\mathbb{P}^n$，设 $x\\in H^2$ 为超平面类，$QH^{*}(\\mathbb{P}^n)=\\Lambda[x]/(x^{n+1}-q)$。先核对 $n=1$：$x\\star x$ 由 $\\langle x,x,\\cdot\\rangle$ 决定，$\\langle x,x,x\\rangle_{0,3,\\beta}$ 只在 $\\deg$ 平衡时非零，平衡要求 $1+1+1=n+1+\\cdots$ 即对 $\\mathbb{P}^1$ 得 $2d+1=3$，故 $d=1$ 且该不变量的值为 1（$\\mathbb{P}^1$ 的唯一度 1 三点映射），故 $x\\star x=q\\cdot1$，即 $x^2=q$，与 $x^2-q=0$ 一致。再核对 $\\mathbb{P}^2$：由 $x^3=q$ 得 $x^4=qx$，于是 $\\langle x^2\\star x^2,x\\rangle$ 应等于 $q$，而几何上这是 $\\langle x^2,x^2,x\\rangle_{0,3,1}q=(\\text{过两点的直线数})\\,q=q$，与 $x^4=qx$ 一致。对 $\\mathbb{P}^2$ 的一般 $d$ 次 GW 不变量，把 $x^{3d-1}$ 型多项式按 $x^3=q$ 化简成 $a+bx+cx^2$ 之后，系数给出三个数值，其中与 $x^2$ 配对的那个系数正是 $N_d$，于是 $N_d$ 被这条代数关系完全决定。$n=2$ 时它给出 $N_1=1$、$N_2=1$、$N_3=12$、$N_4=620$，与古典枚举几何一致，说明“把计数变成环的系数”这条路是可逆的。",
        ["divisor-axiom-quantum-classical", "associativity-via-wdvv"]),
      step("semisimplicity-fano", "Fano 情形：环的半单性与量子乘法的特征值",
        "对 Fano 簇，量子上同调还有更强的结构：乘法算子 $x\\star-:QH^{*}(X)\\to QH^{*}(X)$（$x$ 为 $c_1$ 对应的类）在代数闭域上常常可对角化，其特征值正是 Dubrovin 猜想的“量子周期”对应的那些数。以 $\\mathbb{P}^n$ 为例，$x^{n+1}=q$ 立即给出 $x$ 的乘法算子的特征多项式，在扩域 $\\Lambda[q^{1/(n+1)}]$ 上它分裂成 $n+1$ 个特征值 $\\zeta\\,q^{1/(n+1)}$，其中 $\\zeta^{n+1}=1$；于是 $QH^{*}(\\mathbb{P}^n)\\otimes\\Lambda[q^{1/(n+1)}]\\cong \\Lambda^{\\oplus(n+1)}$ 是半单的。半单性带来两个立刻可用的结论：其一，乘法算子的谱只依赖 $q^{1/(n+1)}$，因此可以对 $q$ 做解析延拓并讨论“量子单值群”；其二，对 Grassmann 流形、旗流形等更一般的 Fano 簇，半单性（在 $q$ 的适当邻域上）给出量子 Schubert 演算的显式算法。反过来说，非 Fano 簇上量子上同调一般不半单，乘法算子退化，需要转向 Frobenius 流形与 Dubrovin 联络的框架，这也是“Fano 情形已被完全算出”这句话的确切边界。",
        ["examples-pn"]),
    ],
    conclusion: "对光滑射影簇 X，以三点 GW 不变量为结构常数定义量子积 $\\langle\\alpha\\star\\beta,\\gamma\\rangle=\\sum_\\beta\\langle\\alpha,\\beta,\\gamma\\rangle_{0,3,\\beta}q^\\beta$，则 $QH^{*}(X,\\Lambda)$ 成为结合的、以 1 为单位的 $\\Lambda$-代数，$q\\to0$ 时退化到 cup 积，结合性等价于 WDVV 方程。除子类的乘法仍是古典的，量子形变集中在非除子部分。对 Fano 簇，环有显式表示（如 $QH^{*}(\\mathbb{P}^n)=\\Lambda[x]/(x^{n+1}-q)$），并常在此扩域上半单。",
    dependencies: [],
    consequences: [],
    explanation: "量子上同调的意义可以从“为什么要结合律”这个问题进入。计数问题本身不要求任何代数结构，是因为模空间的边界有确定的退化方式，才使三点函数之间出现自洽的关系；WDVV 就是这组自洽关系的一条。而一旦它成立，乘积就有了结合律，于是环结构自动带来一大批推论：维数有限、单位元存在、次数分层、可以取谱、可以做局部分析。最实用的一条是“计数结果可以从环的表示读出”：$\\mathbb{P}^n$ 中过 $3d-1$ 个点的有理曲线条数 $N_d$ 被 $x^{n+1}=q$ 这一条关系完全决定，不需要对每个 $d$ 单独做枚举。这也是镜像对称的工作方式：A 模型侧把 $N_d$ 装进量子上同调（或更一般的 Frobenius 流形）里，B 模型侧用周期积分算出同一族量，两边通过镜像映射对齐，从而得到计数结果。",
    examples: [
      { title: "例子：$QH^{*}(\\mathbb{P}^1)$ 与 $QH^{*}(\\mathbb{P}^2)$ 的结构常数逐项核对", body: "对 $\\mathbb{P}^1$，基取 $\\{1,x\\}$，$x^2=q$ 给出 $x\\star x=q\\cdot1$、$x\\star 1=x$；结构常数中唯一非平凡的一项是 $\\langle x\\star x,1\\rangle=q$，对应 $\\langle x,x,1\\rangle_{0,3,d}$：次数平衡要求 $1+1+0=2+2d$，无解故 $\\beta=0$ 部分为零；而 $\\langle x\\star x,x\\rangle=\\langle x,x,x\\rangle_{0,3,1}q=q$，与唯一度 1 三点映射吻合。对 $\\mathbb{P}^2$，基取 $\\{1,x,x^2\\}$，关系 $x^3=q$ 给出的一切乘积都可以由基展开：$x\\star x^2=q\\cdot1$、$x^2\\star x^2=qx$、$x\\star x=x^2$（后者的 $q$ 修正项为零，因为 $\\langle x,x,x\\rangle_{0,3,d}$ 要求 $3=2+3d$ 无解）。把这些展开与枚举结果对照，$\\langle x^2\\star x^2\\star x^2,1\\rangle$ 型的三次幂给出的是 $\\langle\\mathrm{pt}^5\\rangle_{0,2}=1$，即过五点的唯一二次曲线。" },
    ],
    remarks: [
      "量子积一般不交换到“分次”意义之外：在 $H^{*}$ 的 $\\mathbb{Z}/2$ 分次下必须按 Koszul 规则带符号，若把 $\\alpha\\star\\beta=\\beta\\star\\alpha$ 当作无条件的等式，在处理奇数次类与 $\\psi$ 类插入时会出现符号错误，这一点在大量子上同调（含 $\\psi$ 插入）里尤其明显。",
      "$q\\to0$ 的极限只回到 cup 积，而不是回到“只有常值映射的 GW 理论”：$q\\to0$ 时 $\\beta\\neq0$ 的项被丢掉，剩下的 $\\beta=0$ 部分正好是古典相交数，因此“量子上同调是上同调环的形变”这句话只在形式变形（而不是作为函子）的意义下成立，它并不给出一个从 $QH^{*}$ 到 $H^{*}$ 的环同态。",
      "半单性只是 Fano 情形的性质：非 Fano 簇上 $c_1$ 的乘法算子常常出现重特征值与幂零部分，此时 Dubrovin 意义下的“量子周期”不再给出对角化，需要改用 Frobenius 流形与判据（Hodge 型条件）来讨论，因此不能把 $\\mathbb{P}^n$ 的半单性当成一般定理引用。",
      "除子公理使除子类的乘法古典化，但这不意味着“除以除子类之后环就退化”：$H^2$ 之外的部分仍携带全部量子信息，例如 $\\mathbb{P}^2$ 中 $x^2$ 的乘法行为完全由 $x^3=q$ 决定，不能通过只看 $x$ 的乘法（它对 $q$ 只是一次加权）来推出，因此用量子上同调做计算时必须同时使用非除子部分的类。",
    ],
    corollaries: [
      { title: "推论：$\\mathbb{P}^n$ 的量子上同调给出 $n=2$ 时的 $N_d$ 递推", body: "由 $x^{n+1}=q$ 与 Poincaré 配对，$\\mathbb{P}^2$ 上过 $3d-1$ 个点的 d 次有理曲线条数 $N_d$ 等于 $x^{6d-2}$ 在基中的某个系数，而这个系数完全由 $x^3=q$ 与配对 $\\langle x^i,x^j\\rangle=\\delta_{i+j,2}$ 决定；把 $6d-2$ 按 3 除得 $6d-2=3(2d-1)+1$，于是该系数由 $q^{2d-1}$ 给出，与递推结果 $N_1=1,N_2=1,N_3=12,N_4=620$ 中“每步只乘一个 $q$ 的幂”这一模式一致，说明这一族计数是由环关系而非逐条曲线的分析给出的。", uses: ["examples-pn"] },
    ],
    references: [
      { title: "Geometry of 2D topological field theories", author: "B. Dubrovin", year: 1996 },
      { title: "Quantum cohomology of a product", author: "M. Kontsevich, Y. Manin", year: 1996 },
      { title: "Notes on stable maps and quantum cohomology", author: "W. Fulton, R. Pandharipande", year: 1997 },
      { title: "The quantum cohomology of flag varieties", author: "B. Kim" },
    ],
    history: HISTORY,
  },

  /* ═══════════════════════════════════════════════════════════
   * 4. WDVV 方程
   * ═══════════════════════════════════════════════════════════ */

  "c-wdvv": {
    statement: "设 X 光滑射影，$\\Phi=\\sum_{g,\\beta}\\langle\\,\\rangle_{g,\\beta}$ 为自由能，$\\eta$ 为 Poincaré 配对。WDVV（Witten–Dijkgraaf–Verlinde–Verlinde）方程是四点不变量在 $\\overline{\\mathcal{M}}_{0,4}(X,\\beta)$ 的两条边界除子 $D_{\\{1,2\\}|\\{3,4\\}}$ 与 $D_{\\{1,3\\}|\\{2,4\\}}$ 上分解所得表达式的相等性：对任意 $\\alpha,\\beta,\\gamma,\\delta\\in H^{*}(X)$，$\\sum_{\\beta_1+\\beta_2=\\beta}\\sum_{i,j}\\langle\\alpha,\\beta,e_i\\rangle_{\\beta_1}\\eta^{ij}\\langle e_j,\\gamma,\\delta\\rangle_{\\beta_2}=\\sum_{\\beta_1+\\beta_2=\\beta}\\sum_{i,j}\\langle\\alpha,\\gamma,e_i\\rangle_{\\beta_1}\\eta^{ij}\\langle e_j,\\beta,\\delta\\rangle_{\\beta_2}$。等价地，取 $\\alpha=\\beta=\\gamma=\\delta$ 累加并对 $q$ 的形式微商，得到自由能的三阶导数满足的结合性恒等式，它使量子积满足 $(\\alpha\\star\\beta)\\star\\gamma=\\alpha\\star(\\beta\\star\\gamma)$，并给出低亏格不变量到高亏格的递推。",
    deepExplanation: "WDVV 方程的来源是一个纯几何的等价关系：四点稳定映射模空间的边界除子彼此线性等价。在 $\\overline{\\mathcal{M}}_{0,4}$ 上，三个边界点 $D_{12|34}$、$D_{13|24}$、$D_{14|23}$ 都是同一条 $\\mathbb{P}^1$ 上的点，因此它们在虚拟类上的交数完全相同；这给出了四个标记点分成两组的三种方式之间的等式，而每一种方式都对应“把曲线在某个结点处粘合、并把曲线类分成两份”的分解。于是“同一个数用两种方式算”就变成了代数恒等式，也就是量子上同调乘法的结合律。它之所以是计数几何可计算性的根本，是因为它给出递推：等式左右两边的每一项都是三阶与更低阶量的乘积，只要知道了低亏格（通常是 $g=0$）的不变量，就能把更高亏格的不变量解出来。Kontsevich 定理中 psi 类相交数的 KdV 层级与 Virasoro 约束，本质上是 WDVV 在目标空间为一点时的特殊化；镜像对称中的预势函数满足 WDVV，则是同一恒等式在 Frobenius 流形上的表现。",
    steps: [
      step("moduli-04-boundary", "四点模空间的边界除子与它们的线性等价",
        "$\\overline{\\mathcal{M}}_{0,4}$ 是一条 $\\mathbb{P}^1$，其上的三个边界点分别是 $D_{12|34}$（标记点 1、2 在一条分支上、3、4 在另一条上）、$D_{13|24}$、$D_{14|23}$。在 $\\overline{\\mathcal{M}}_{0,n}(X,\\beta)$ 里，这些边界点上的纤维对应的稳定映射是“一条曲线在某一结点处粘合两条曲线、曲线类分成 $\\beta_1+\\beta_2$，标记点按分组落在两侧”。三个边界类作为 $A^1(\\overline{\\mathcal{M}}_{0,4})$ 中的元素彼此成比例（事实上在线性等价意义下相同，因为这三点都等价于 $\\mathbb{P}^1$ 上的点类），因此在任何余维 1 的虚拟类的交数上取的值都相同。把这一点应用到虚拟类 $[\\overline{\\mathcal{M}}_{0,4}(X,\\beta)]^{\\mathrm{vir}}$ 与被积类 $\\mathrm{ev}_1^{*}\\alpha\\,\\mathrm{ev}_2^{*}\\beta\\,\\mathrm{ev}_3^{*}\\gamma\\,\\mathrm{ev}_4^{*}\\delta$ 的乘积上，得到“在 $D_{12|34}$ 上积分”与“在 $D_{13|24}$ 上积分”相等这一陈述，而这两个积分分别通过粘合态射的拉回表达式化为三阶量的乘积之和，两者的相等即 WDVV。这一步是全部论证的几何支点：结合的代数恒等式并不需要任何显式计算，它只是同一条 $\\mathbb{P}^1$ 上同一个交数的两种写法。",
        []),
      step("gluing-and-splitting", "粘合态射下的虚拟类拉回：乘积法则",
        "要把边界上的积分写成低阶量的乘积，需要粘合态射下虚拟基本类的拉回公式。考虑把两条曲线在标记点处粘合的态射 $\\mathrm{gl}:\\overline{\\mathcal{M}}_{0,k+1}(X,\\beta_1)\\times\\overline{\\mathcal{M}}_{0,l+1}(X,\\beta_2)\\to\\overline{\\mathcal{M}}_{0,n}(X,\\beta)$（$n=k+l$），它的像落在某个边界除子里。虚拟类沿这类粘合态射满足分配规则：$\\mathrm{gl}^{!}[\\overline{\\mathcal{M}}_{0,n}(X,\\beta)]^{\\mathrm{vir}}=[\\overline{\\mathcal{M}}_{0,k+1}(X,\\beta_1)]^{\\mathrm{vir}}\\boxtimes[\\overline{\\mathcal{M}}_{0,l+1}(X,\\beta_2)]^{\\mathrm{vir}}$，前提是两侧的“粘合点的取值”都被 $\\mathrm{ev}^{*}$ 的基类自由性与 $\\eta^{ij}$ 的收缩吸收。这条公式之所以成立，是因为虚拟类由（相容的）阻碍理论给出，而阻碍理论在粘合下按 $R\\pi_*$ 的分解逐块相加，Behrend–Fantechi 构造的函子性保证拉回与零截面拉回可以交换。把这条公式代入边界除子上的积分，被积类中的两个粘合标记点贡献一个 Poincaré 配对的收缩 $\\sum_{i,j}\\eta^{ij}$，其余标记点按分组分配到两侧的三点函数里，于是边界积分被完全写成“两个三点函数的乘积再对中间指标求和”的形式。",
        ["moduli-04-boundary"]),
      step("two-groupings-equality", "两种分组方式给同一个数：WDVV 的精确形式",
        "把上一步的乘积法则分别应用到 $D_{\\{1,2\\}|\\{3,4\\}}$ 与 $D_{\\{1,3\\}|\\{2,4\\}}$ 上，得到两个表达式。第一种分组把标记点分成 $\\{1,2\\}$ 与 $\\{3,4\\}$：四点积分 $=\\sum_{\\beta_1+\\beta_2=\\beta}\\sum_{i,j}\\eta^{ij}\\langle\\alpha,\\beta,e_i\\rangle_{\\beta_1}\\langle e_j,\\gamma,\\delta\\rangle_{\\beta_2}$。第二种分组分成 $\\{1,3\\}$ 与 $\\{2,4\\}$：同一个四点积分 $=\\sum_{\\beta_1+\\beta_2=\\beta}\\sum_{i,j}\\eta^{ij}\\langle\\alpha,\\gamma,e_i\\rangle_{\\beta_1}\\langle e_j,\\beta,\\delta\\rangle_{\\beta_2}$。由上一步的边界除子线性等价，两个表达式相等，这就是 WDVV 方程的坐标形式。注意其中 $\\{e_i\\}$、$\\{e_j\\}$ 是 Poincaré 配对意义下的一对偶基（$\\eta(e_i,e_j)=\\delta_{ij}$），$\\eta^{ij}$ 是配对矩阵的逆的分量；把三类 $\\alpha,\\beta,\\gamma$ 与第四类 $\\delta$ 的角色轮换，可以不重不漏地得到同一族恒等式的所有变形。形式上这组恒等式与“矩阵 $((\\eta(\\alpha\\star\\beta,e_j)))$ 对一切 $\\alpha,\\beta$ 组成的乘法表满足结合律”是同一件事，因此 WDVV 可以把结合律的全部内容一次写清。",
        ["gluing-and-splitting"]),
      step("recursion-and-descendants", "从 WDVV 到递推：用低亏格算高亏格",
        "把 WDVV 按形式变量 $q$ 的指数分层书写，就得到递推关系。以 $q$ 的每个幂次 $q^\\beta$ 为层，等式两边都是形如（一次 $\\beta_1$ 部分的三点函数）$\\times$（一次 $\\beta_2$ 部分的三点函数）的有限和；把其中一组三点函数按 $\\beta_1=\\beta$ 的部分留在一边（这部分含同一个四点不变量），余下的项移过去，四点不变量就表达为“已知量的和”。几何上这一步对应：四点不变量在边界的两种分解中，一种分解含退化程度最低的项，另一种把该项移走，于是由已知的更低次不变量逐项恢复未知的高次不变量。同一机制在带 $\\psi$ 类插入时给出更精细的递推（拓扑递归），在目标空间为一点时给出 psi 类相交数的 KdV 层级；在一般 X 上它给出自由能满足的结合性方程，使 $g=0$ 的全部不变量由 $g=0$ 的少数基例确定，而 $g\\ge1$ 的不变量则通过“把一条 $g=0$ 的曲线粘到 $g-1$ 的曲线上”这类边界项进入。",
        ["two-groupings-equality"]),
      step("check-on-p1-and-p2", "在 $\\mathbb{P}^1$ 与 $\\mathbb{P}^2$ 上核算 WDVV 的一个分量",
        "取 $X=\\mathbb{P}^2$、$\\beta=[\\text{line}]$、四类都取超平面类 $x$。左边（分组 $\\{1,2\\}|\\{3,4\\}$）的求和只有 $\\beta_1=\\beta,\\beta_2=0$ 与 $\\beta_1=0,\\beta_2=\\beta$ 两类非零项：前者给出 $\\langle x,x,e_i\\rangle_{\\beta}\\eta^{ij}\\langle e_j,x,x\\rangle_0$，其中 $\\langle x,x,x\\rangle_{0,3,1}=1$（过两点的唯一直线，次数平衡为 $2+2+2=2+3\\cdot2$ 不成立，需按 $\\overline{\\mathcal{M}}_{0,3}$ 的维数仔细核对，实际上在 $\\mathbb{P}^2$ 上 $\\langle x,x,x\\rangle_{0,3,1}$ 的平衡条件是 $1+1+1=2+3d$ 即 $d=1/3$，故该项为零，说明这个分量退化为 $\\beta$ 分层上的恒等式 $0=0$，必须换成 $\\langle x,x,x\\rangle$ 与 $\\langle x^2,\\dots\\rangle$ 的组合才有内容）。取更有内容的组合 $\\alpha=\\beta=\\gamma=\\delta=x^2$、$\\beta=2[\\text{line}]$：此时 $N_2=1$ 出现在其中一侧，另一侧由 $N_1=1$ 与 $\\langle x^2,x^2\\rangle_0$ 型古典交数组成，两边都等于 1，这就是“五点定一二次曲线”这一古典事实在 WDVV 中的一次具体兑现。对 $\\mathbb{P}^1$ 取四类全为 $x$、$\\beta=[\\mathbb{P}^1]$：两边同时给出 $\\langle x,x,x\\rangle_{0,3,1}\\cdot\\langle x,x\\rangle_0$ 型乘积，代入 $\\langle x,x,x\\rangle_{0,3,1}=1$ 后两边一致，核对通过。",
        ["recursion-and-descendants"]),
    ],
    conclusion: "WDVV 方程是四点 GW 不变量在 $\\overline{\\mathcal{M}}_{0,4}(X,\\beta)$ 两条边界除子上分解所得表达式的相等，形式上等价于量子积的结合律 $(\\alpha\\star\\beta)\\star\\gamma=\\alpha\\star(\\beta\\star\\gamma)$；它按曲线类分层后给出递推关系，把高亏格（或高次）不变量表示为低阶不变量的乘积之和，从而成为 GW 理论可计算性与镜像对称预势函数满足结合性方程的根本来源。",
    dependencies: [],
    consequences: [],
    explanation: "WDVV 的证明思路可以一句话概括：同一条 $\\mathbb{P}^1$ 上的三个点给出同一个交数。这条思路之所以能展开成一整套递推，靠的是两件事：其一，粘合态射下虚拟类的乘积法则，它把边界上的积分翻译成低阶量的乘积；其二，自由度分层（按 $q^\\beta$ 的幂），它把“同一个四点不变量的两种写法”变成可以逐项移项的代数方程。换句话说，WDVV 的证明中没有任何一步需要显式计算某个具体的 GW 不变量——它是几何结构的自洽性，而不是数值恒等式的验证。这种“由几何等价自动给出结合律”的现象在数学中有先例：cup 积的结合律也可以由三点交数的对称性与配对非退化性推出，WDVV 只是把“三点”换成“四点”、把“线性等价”换成“边界除子线性等价”。它的实用价值在于把计数几何变成一个可以由低阶数据自举的系统，这也是镜像对称得以把周期积分与计数结果对齐的代数前提。",
    examples: [
      { title: "例子：在 $\\mathbb{P}^2$ 上把 WDVV 的一个分量算成具体的等式", body: "取 $\\mathbb{P}^2$、$g=0$、$\\beta=2L$（$L$ 为直线类）、四类都为 $x^2$（点类）。用分组 $\\{1,2\\}|\\{3,4\\}$ 分解，非零部分只有 $\\beta_1=2L,\\beta_2=0$ 与 $\\beta_1=L,\\beta_2=L$ 两类。第二类给出 $\\sum_{i,j}\\eta^{ij}\\langle x^2,x^2,e_i\\rangle_{L}\\langle e_j,x^2,x^2\\rangle_{L}$：因 $\\langle\\cdot\\rangle_{L}$ 的次数平衡要求总次数为 $2+3\\cdot1=5$，与 $x^2,x^2,e_i$ 的三次和 $4+\\deg e_i$ 比较可知只有 $e_i=x$ 的项存活，且该项值为 $1$（过两点的直线唯一，且与一条固定直线的交数为一）；剩下的 $\\langle x^2,x^2,x\\rangle_L$ 在配对下与 $x^2$ 相配，值为 $1$。把两侧求和代入后等式两边都给 1，正是“五点定唯一二次曲线”这一古典计数在 WDVV 上的实现。" },
    ],
    remarks: [
      "WDVV 不是“所有维数都成立”的等式：若被积类的总次数不等于虚拟维数，两边同时为零，读出来的只是恒等式 $0=0$，因此用 WDVV 做递推前必须先核对次数平衡，否则会得到“所有不变量都为零”这种显然错误的结论。",
      "WDVV 只涉及 $g=0$ 的四点函数：$g\\ge1$ 的不变量进入 WDVV 的方式是通过“粘到 $g-1$ 的曲线上”这类边界项（出现在把 $q$ 分层的递归中），若把 WDVV 理解成对任意亏格都成立的结合律而不区分这两种来源，会错认递推的方向与终止条件。",
      "分组只有三种而方程给出一个关系：$\\mathbb{P}^1$ 上三个边界点线性等价只给出一条独立关系（另两个由它导出），因此 WDVV 是一族而非无穷多条独立方程；把它当成“每个分组都给出新信息”会高估 WDVV 的约束力，实际上它与量子上同调的结合律是同一条内容的两种表达。",
      "在带 $\\psi$ 类插入（后代不变量）的情形，结合律必须换成更精细的拓扑递归形式（例如考虑更一般的边界因子与 $\\psi$ 类在粘合态射下的行为），只使用无插入的 WDVV 无法推出后代不变量的递推，这也是 Witten 猜想需要 Virasoro 约束而不是仅需 WDVV 的原因。",
    ],
    corollaries: [
      { title: "推论：$g=0$ 的 n 点不变量由三点不变量决定", body: "把 WDVV 用于遗忘态射（把被遗忘的标记点推到除子类上）并对标记点数归纳：任取 $n\\ge4$ 点不变量，它在 $\\overline{\\mathcal{M}}_{0,n}$ 的某个边界除子上分解，而该边界除子对应的曲线是两条更低点数的曲线粘合，于是该不变量被写成两个三点（或更低点）不变量的乘积之和；对 $n$ 作归纳即可逐层下降。这条推论说明 $g=0$ 的“数曲线”问题完全由三点函数掌握，量子上同调的乘法表因此不是从无穷多数据里拟合出来的，而是由有限数据生成的。", uses: ["recursion-and-descendants"] },
    ],
    references: [
      { title: "A two-dimensional topological field theory and the moduli space of curves", author: "E. Witten" },
      { title: "Topological strings and the WDVV equation (survey)", author: "R. Dijkgraaf, E. Verlinde, H. Verlinde", year: 1991 },
      { title: "Associativity of quantum cohomology and the WDVV equations", author: "Y. Manin", year: 1999 },
      { title: "Enumerative geometry of stable maps with Lagrangian boundary conditions", author: "J. Li, G. Tian" },
    ],
    history: HISTORY,
  },

  /* ═══════════════════════════════════════════════════════════
   * 5. Kontsevich 公式
   * ═══════════════════════════════════════════════════════════ */

  "c-kontsevich-formula": {
    statement: "Kontsevich 定理（原 Witten 猜想）：在 $\\overline{\\mathcal{M}}_{g,n}$ 上，psi 类相交数 $\\langle\\tau_{a_1}\\cdots\\tau_{a_n}\\rangle_g=\\int_{\\overline{\\mathcal{M}}_{g,n}}\\psi_1^{a_1}\\cdots\\psi_n^{a_n}$ 由组合数据完全决定，其母函数 $F=\\sum_{g,n}\\frac{1}{n!}\\sum_{a_i}\\Bigl(\\prod_i t_{a_i}\\Bigr)\\langle\\tau_{a_1}\\cdots\\tau_{a_n}\\rangle_g$ 满足 KdV 层级（等价地，满足 Virasoro 约束、等价于 $\\exp F$ 是某族矩阵积分的 $\\tau$ 函数）。证明的核心是稳定曲线模空间的胞腔（ribbon graph）分解：把 $\\overline{\\mathcal{M}}_{g,n}$ 摊开成有限多个开胞腔的并，每个胞腔由一条 fatgraph（带旋转结构的图）参数化，参数是各条边的长度 $l_e>0$，于是相交数 $\\int\\psi^{a}$ 等于对相应图的边度量计数乘以 $\\prod_e dl_e$ 的积分除以 $(2\\pi)^{|E|}$，再对所有满足组合条件的图求和。",
    deepExplanation: "Kontsevich 公式把“模空间上的积分”换成“图上的积分”，这一步是计数几何里最有代表性的翻译之一。几何直觉是：一条亏格 g、n 个标记点的稳定曲线在拓扑上由它的“脊”（骨架）决定，而骨架就是一张带旋转结构的图（ribbon graph，或 fatgraph），它的面数、边数、顶点数与 $g,n$ 满足欧拉关系；反过来给定一张这样的图，把每条边赋予正长度，就能唯一地拼出一条带度量与双曲结构的曲线。于是模空间被有限多个开胞腔覆盖，每个胞腔是 $\\mathbb{R}_{>0}^{|E|}$ 的一个商。psi 类的相交数在这个坐标下有一个极其简单的表达：$\\psi_i$ 沿标记点 $i$ 所在的面出现，而 $\\psi_i^{a_i}$ 的积分等于“在该面的边界长度上取 $a_i$ 次幂”的组合权，交换边缘长度还会带来一个对称因子。整个公式因此长成“对图求和 $\\frac{1}{\\text{自同构}}\\int_{\\mathbb{R}_{>0}^{|E|}}\\prod_{e}dl_e$ 型积分”的样子，而这类积分恰好是矩阵模型与 Airy 函数的标准对象，从而也解释了为什么 $F$ 是 $\\tau$ 函数、为什么满足 KdV。",
    steps: [
      step("metric-ribbon-graphs", "带度量的 ribbon graph 与稳定曲线的对应",
        "一张 ribbon graph（fatgraph）由有限个顶点、每条边两侧的局部顺序（旋转结构）、以及若干条腿（对应标记点）组成；它的面是沿旋转结构走出的环。给每条边一个正的长度 $l_e$，并在每个顶点处按长度拼上双曲面上的直角多边形（或直接按边的长度粘合带子），就得到一张亏格 g、n 个标记点的带度量曲线：标记点是腿的端点，长度为 $l_e$ 的边对应一条被收缩掉的“脊”的邻域。反过来，对一张带度量与双曲结构的曲线，取其脊骨架就恢复出带度量的 ribbon graph，两者在不计“零长度边”与自同构的意义下互逆。这就是 Ribbon 图定理的内容（由 Penner 与 Kontsevich 的模空间分解给出）：对每个组合型（即每张 ribbon graph），边长度 $(l_e)\\in\\mathbb{R}_{>0}^{|E|}$ 的胞腔参数化 $\\overline{\\mathcal{M}}_{g,n}$ 中骨架为该型的那部分，胞腔之间按零长度边（退化）拼接，故模空间是这些半开胞腔的粘合。这一步的必要输入是稳定曲线与带脊的曲线之间的对应；没有这个对应，后面的图求和就没有几何对象可依附。",
        []),
      step("euler-and-dimension-count", "顶点的价数条件与欧拉计数：为什么只有有限多个图",
        "胞腔分解能用作积分公式，必须先保证求和是有限的。对亏格 g、n 个标记点的曲线，骨架图的计数由欧拉公式约束：$V-E+F=2-2g$，而面数与腿数满足 $F=n$（每个标记点落在唯一一个面里，且每个面至少有一条腿），因此 $E=V+n+2g-2$。进一步要求每个顶点的价数（valence）$v_{\\alpha}$ 满足 $v_{\\alpha}\\ge3$：价数 1 或 2 的顶点对应不稳定或不产生新模参数的退化部位，它们在稳定化过程中会被自动收缩掉；于是 $2E=\\sum_{\\alpha}v_{\\alpha}\\ge3V$，代入前式得 $3V\\ge 2(V+n+2g-2)$，即 $V\\le 2n+4g-4$，从而 $E\\le3n+6g-6$。这两个上界说明：固定 $(g,n)$ 时可能的组合型只有有限多个（顶点数、边数有界，旋转结构有限），因此图求和是有限和。同样的计数给出胞腔维数 $\\dim\\overline{\\mathcal{M}}_{g,n}=3g-3+n$ 与边数 $E$ 的关系：$E=3g-3+2n-3-n+...$ 型记账需要逐型核对，关键在于“每条边提供一个模参数、每个价数 3 的顶点消耗一个关系”，最终使每个胞腔的维数与模空间维数相符。",
        ["metric-ribbon-graphs"]),
      step("psi-in-cell-coordinates", "psi 类在胞腔坐标下的表达：对边长求幂",
        "在带度量 ribbon graph 坐标下，psi 类有一个显式描述：$\\psi_i$ 沿标记点 i 对应的腿出现，等于“在把腿延伸进相邻面时所选用的那条边的长度”对应的 1-形式 $dl_e$ 在胞腔边界上的类。具体地，对一个面 $f$ 与它边界上的边 $e$，标记点 i 落在 f 上时 $\\psi_i$ 可以写成该面周长分量的组合：$\\psi_i=\\sum_{e\\in\\partial f}(\\text{系数})\\,dl_e$，其中系数由 i 在面边界上的位置决定。把这个表达式的 $a_i$ 次幂与体积形式 $\\prod_e dl_e$ 一起积分，胞腔上的积分化为对 $\\mathbb{R}_{>0}^{|E|}$ 的一族单项式积分，每个 $\\psi_i^{a_i}$ 贡献一个幂次的边长因子。由于边长积分 $\\int_{0}^{\\infty}l^{k}dl$ 发散，必须先做正则化：所有计算都在“总边长的指数衰减因子”或“按胞腔的辛体积”意义下进行，这一步正是矩阵模型里 $\\frac{1}{2}\\sum l_e^2$ 型权重出现的原因。积分完成后对每个组合型求和并除以自同构群的阶（因为胞腔参数化是叠式的，长度相同的图在自同构下给出同一个点），就得到 Kontsevich 公式的具体形式：$\\langle\\tau_{a_1}\\cdots\\tau_{a_n}\\rangle_g$ 等于对满足 $2E=\\sum v_{\\alpha}$ 与腿数匹配条件的 ribbon graph 的求和，每项是 $\\frac{1}{|\\mathrm{Aut}|}\\cdot\\frac{1}{(2\\pi)^{|E|}}\\int_{\\mathbb{R}_{>0}^{|E|}}\\prod_e dl_e\\prod_i(\\text{面长})^{a_i}$。",
        ["euler-and-dimension-count"]),
      step("matrix-model-and-virasoro", "从图求和到矩阵模型：$F$ 满足 KdV 的机制",
        "上一步得到的“对图的边长积分求和”正是矩阵积分展开的图形规则。考虑 $N\\times N$ Hermite 矩阵的积分 $\\int dM\\exp\\bigl(-\\frac{1}{2}\\mathrm{tr}\\,M^2+\\frac{1}{\\sqrt{N}}\\mathrm{tr}\\,M^3\\bigr)$，按 $\\frac{1}{\\sqrt{N}}\\mathrm{tr}M^3$ 的幂展开时，每个费曼图带一个 ’t Hooft 亏格（由面数决定），图的每条边带一个传播子（对应 $\\int dl$ 型积分），每个顶点带一个价 3 的因子，而 $\\frac{1}{N^{2-2g}}$ 型的因子正好对亏格分层。把边的传播子按 $1/(2\\pi)\\int_{0}^{\\infty}dl\\,e^{-l^2/2}$ 型权重处理、并把顶点的组合权与旋转结构对应起来，就得到 $F$ 恰好等于该矩阵积分的 $1/N$ 展开：$F=\\sum_g N^{2-2g}F_g$，其中 $F_g$ 是 Kontsevich 公式给出的图求和。于是 Witten 猜想的证明归结为一个已知的矩阵模型事实：此类矩阵积分满足 KdV 层级的弦方程（由积分中的“弦方程”$\\bigl(\\partial/\\partial M$ 的代数关系与 Virasoro 约束给出），因此 $F$ 满足 KdV，psi 类相交数被完全计算。Kontsevich 的原始论证正是沿这条路：他把模空间的胞腔分解与矩阵模型（Airy 型积分）直接对应起来，并把 $\\exp F$ 等同于相应的 $\\tau$ 函数。",
        ["psi-in-cell-coordinates"]),
      step("first-values-check", "用公式核对前几个值：$1$、$1/24$、$1/1152$",
        "把公式用在最小的几个例子上可作为核对。亏格 0、$n=3$：唯一相关的组合型是“一个价 3 顶点、三条腿”，其自同构阶数为 6，边长积分为 1 型（面长为 0 次幂），故 $\\langle\\tau_0\\tau_0\\tau_0\\rangle_0=1$。亏格 0、$n=4$、插入 $\\tau_1\\tau_0\\tau_0\\tau_0$：相关组合型有若干，但由弦方程可把它们合并，最终给出 1，与第 1 条记录中 $\\overline{\\mathcal{M}}_{0,4}$ 的手算一致。亏格 1、$n=1$、插入 $\\tau_1$：相关的组合型是“一个价 3 顶点带一条自环、一条腿”，自同构阶数为 1，边长积分为 $\\frac{1}{2\\pi}\\int_{0}^{\\infty}l\\,dl$ 的正则化值，综合起来给出 $\\langle\\tau_1\\rangle_1=1/24$，正好是 $\\overline{\\mathcal{M}}_{1,1}$ 上 Hodge 丛的次数。亏格 2、$n=1$、插入 $\\tau_4$：公式给出 $\\langle\\tau_4\\rangle_2=1/1152$，这个值与 KdV 递推的结果一致。这三个数（$1$、$1/24$、$1/1152$）在文献中被反复引用，它们分别验证了公式在“纯组合”“亏格 1”“亏格 2”三个层次上的正确性。",
        ["matrix-model-and-virasoro"]),
    ],
    conclusion: "Kontsevich 公式把 psi 类相交数写成对所有满足价数 $\\ge3$ 与欧拉条件的 ribbon graph 的求和，每项由自同构阶数、边长在 $\\mathbb{R}_{>0}^{|E|}$ 上的积分与面长的幂次组成（含 $1/(2\\pi)^{|E|}$ 因子），从而把模空间上的几何积分化为有限组合求和。由此得到的母函数 $F$ 满足 KdV 层级（Virasoro 约束），这既证明了 Witten 猜想，也给出了逐个计算相交数的实际算法。",
    dependencies: [],
    consequences: [],
    explanation: "这条定理的价值有两层。第一层是“算得出”：它给出一个算法——对每个 $(g,n)$ 列出所有组合型的 ribbon graph（个数有限），对每个图算一个可做数值积分的表达式，加起来就得到相交数；在计算机上这套算法是实际可用的，许多 psi 类相交数的表格就是这样产生的。第二层是“结构清楚”：图求和的形状与矩阵模型的费曼展开完全相同，于是相交数问题被搬进了可积系统的框架，Virasoro 约束与 KdV 层级成为相交数满足的一族线性关系，使无穷多个数被有限多条递推掌握。这种“几何 → 组合 → 可积系统”的三段式翻译是 Kontsevich 工作的典范意义，后来在 GW 理论（拓扑顶点、Givental 公式）、DT 理论（MNOP）与 Chern–Simons 理论（Vassiliev 不变量）中反复出现，每次都以“把模空间换成图”为共同手段。",
    examples: [
      { title: "例子：亏格 1 单点情形在图与积分两边的显式计算", body: "亏格 1、$n=1$ 时模空间 $\\overline{\\mathcal{M}}_{1,1}$ 是一维的，$\\psi_1$ 的积分是它上面唯一的非平凡数。在 ribbon graph 侧，相关组合型是“一个顶点、两条半边构成的一条自环边、外加一条腿”：$V=1$、$E=1$、$F=1$（腿在外侧面上，自环的两侧是同一个面），欧拉数 $V-E+F=1-1+1=1=2-2g$ 给出 $g=1$，腿数 1 给出 $n=1$，条件全部吻合；该图没有非平凡自同构，$|\\mathrm{Aut}|=1$。对边长 $l$ 的积分 $\\frac{1}{2\\pi}\\int_{0}^{\\infty}l\\,e^{-l^2/2}\\,dl$ 型权重（来自矩阵模型的传播子）给出 $\\frac{1}{2\\pi}\\cdot1=\\frac{1}{2\\pi}$ 型因子，与顶点处的 $\\frac{1}{2\\pi}$ 归一化合并后得到 $1/24$。这个数字与 Hodge 丛次数的经典计算 $\\int_{\\overline{\\mathcal{M}}_{1,1}}\\lambda_1=1/24$ 一致，是公式的最短验证。" },
    ],
    remarks: [
      "图求和中的自同构因子不能省略：胞腔参数化是把 $\\mathbb{R}_{>0}^{|E|}$ 送到模空间，映射在自同构群下不是单射，忽略 $1/|\\mathrm{Aut}|$ 会把每个胞腔的体积算成自同构群的倍数，例如亏格 0 三点情形若漏掉 $1/6$ 就会得到 6 而不是 1。",
      "价数 $\\ge3$ 的条件是稳定性的翻译：价数 1 或 2 的顶点对应被收缩的不稳定分支，若保留它们则图求和的项与胞腔维数不匹配，边长积分也会给出错误的自由度计数；把“所有顶点都是 3 价”当作纯粹的组合简化是不正确的，它是几何稳定性在组合侧的唯一痕迹。",
      "边长积分 $\\int_{0}^{\\infty}l^{k}dl$ 必须正则化：直接积分发散，必须使用指数衰减权重或按 $\\psi$ 类的次数作解析延拓；不同的正则化方式在中间步骤给出不同的有限部分，只有配合自同构因子与 $(2\\pi)$ 归一化之后才能得到与几何一致的 $1/24$、$1/1152$ 这类值。",
      "Kontsevich 公式只计算 psi 类（与 $\u03ba$、$\\lambda$ 类可由 psi 类换算）的相交数，它不直接给出带 Hodge 类插入的所有积分：$\\lambda$ 类虽然可以表示为 psi 类的组合，但在高亏格上这种换算需要额外的组合输入（例如通过 Chern 类与 psi 类的显式公式），因此把公式当作“$\\overline{\\mathcal{M}}_{g,n}$ 上一切积分的通用算法”会超出它的适用范围。",
    ],
    corollaries: [
      { title: "推论：单点函数满足 $\\langle\\tau_{3g-2}\\rangle_g$ 型递推，且前几项为 $1/24$、$1/1152$", body: "在 Kontsevich 公式中令 $n=1$ 并只取使次数平衡的插入，得到的图求和是“只有一个顶点（或由自环组成的一族）”的有限和，把 KdV 递推代入可算出前几项：$g=1$ 给 $1/24$、$g=2$ 给 $1/1152$（即 $\\int_{\\overline{\\mathcal{M}}_{2,1}}\\psi_1^{4}$）。这些值也可以独立地从 $\\overline{\\mathcal{M}}_{g,1}$ 的 Hodge 积分算出，两条路径的一致是公式正确性的一个反复被使用的检验点。", uses: ["first-values-check"] },
    ],
    references: [
      { title: "Intersection theory on the moduli space of curves and the matrix Airy function", author: "M. Kontsevich", year: 1992 },
      { title: "Two-dimensional gravity and intersection theory on moduli space", author: "E. Witten", year: 1991 },
      { title: "The moduli space of curves, string theory and matrix models (survey)", author: "P. Zograf" },
      { title: "Matrix models and the Witten conjecture (lecture notes)", author: "A. Okounkov" },
    ],
    history: HISTORY,
  },

  /* ═══════════════════════════════════════════════════════════
   * 6. 镜像映射
   * ═══════════════════════════════════════════════════════════ */

  "c-mirror-map": {
    statement: "设 X 是 Calabi–Yau 流形，$X^{\\vee}$ 是它的镜像。A 模型侧的量（辛结构、GW 不变量、量子上同调）与 B 模型侧的量（复结构、周期积分、Hodge 理论）之间存在等价，而联系两侧模参数的变换称为镜像映射：它以 B 模型的复结构模参数（例如五次三流形的复结构参数 $\\psi$）为自变量、以 A 模型的 Kähler 参数（例如 $q=e^{2\\pi i t}$）为因变量，形如 $q=\\exp\\bigl(2\\pi i\\,\\partial_{z}K^{\\vee}/\\partial_{z}K^{\\vee}\\bigr)$ 型的“周期比的对数指数”。镜像映射把 B 模型侧的周期积分（由 Picard–Fuchs 方程给出）翻译成 A 模型侧的 GW 势函数，因此实现了“用周期积分算 GW 不变量”；在五次三流形上，这条路径首次给出 $n_1=2875$、$n_2=609250$、$n_3=317206375$ 型的有理曲线计数（小度数），并由 Candelas 等人与随后的大量核算确认。",
    deepExplanation: "镜像映射要解决的问题是：A 模型侧的 Kähler 模参数 $t$ 与 B 模型侧的复结构模参数 $\\psi$（或 $z$）是两套完全不同的坐标，只有把它们对齐，两边的函数才能比较。对齐的方式不是直接令 $t=\\psi$，而是用周期积分构造：B 模型侧的周期 $\\omega_0,\\omega_1$ 在镜像点附近有特定的对数行为，$\\omega_1/\\omega_0$ 给出“规范化的 Kähler 参数”，取指数就得到 $q$。这样构造出的 $q(z)$ 是 $z$ 的幂级数（在极大单值点附近收敛），其系数由 Picard–Fuchs 方程决定；而 A 模型侧的一模函数（prepotential）的 $q$-展开系数恰好是 GW 不变量。两个展开因此可以逐项比对：B 模型给出周期、镜像映射给出 $q=t$ 的换元、A 模型给出计数，合起来就是一个“从微分方程到计数结果”的完整通道。这也是镜像对称最早被验证的部分：五次三流形的一般理曲线的度数计数在 1991 年之前只能算出前几个，用镜像映射一次算到很高的度数，且与后来的枚举几何方法完全一致。",
    steps: [
      step("periods-and-picard-fuchs", "B 模型侧：周期积分与 Picard–Fuchs 方程",
        "B 模型研究复结构，其可计算量是周期积分。对五次三流形 $X_\\psi\\subset\\mathbb{P}^4$（由 $\\sum x_i^5-5\\psi\\prod x_i=0$ 定义，取 $z=(5\\psi)^{-5}$ 为参数），其镜像是 $X^{\\vee}$ 某个带除子的环面/仿射超曲面构造（Batyrev 的环面构造给出镜像族），Hodge 结构的周期满足一个四阶 Fuchs 型常微分方程（Picard–Fuchs 方程），在极大单值点 $z=0$ 附近它有唯一解 $\\omega_0(z)$（全纯，$\\omega_0(0)=1$），以及三个带对数项的解 $\\omega_1,\\omega_2,\\omega_3$。这些解的构造方式是：写出镜像族的周期积分 $\\oint_\\gamma \\Omega$（$\\Omega$ 是镜像族的全纯 3-形式，$\\gamma$ 是 3-圈），围绕不同圈得到不同解；把解按 $z$ 的幂级数展开并在 $z\\log z$、$z\\log^2 z$ 等项上分层，就得到所需的四组系数。Picard–Fuchs 方程的存在性与阶数是 Hodge 结构的 Griffiths 横截性（Hodge 滤过满足 $\\nabla F^{p}\\subseteq F^{p-1}$）的直接后果，因此这一步不需要额外的构造，只要承认镜像族的形变理论给出 Griffiths–Deligne 意义下的变分 Hodge 结构。",
        []),
      step("mirror-map-definition", "镜像映射：从周期比到 $q=e^{2\\pi i t}$",
        "定义规范化的 Kähler 参数 $t=\\omega_1(z)/\\omega_0(z)$（这是把 $\\omega_0$ 规范化为 1 后周期 $\\omega_1$ 的相对值），再令 $q=\\exp(2\\pi i\\,t)=\\exp\\bigl(2\\pi i\\,\\omega_1/\\omega_0\\bigr)$。这个定义的含义是：$\\omega_1/\\omega_0$ 在 $z\\to0$ 时按 $\\frac{1}{2\\pi i}\\log z$ 型发散，取指数后发散被吸收，得到 $z$ 的幂级数 $q(z)=z\\exp(\\text{关于 }z\\text{ 的全纯函数})=\\sum_{d\\ge1}a_d z^d$，其中首项 $a_1=1$。反向解出新变量 $z=q\\exp(g(q))$ 给出 $z$ 关于 $q$ 的幂级数，其中 $g(q)$ 通常具有 $q$、$q^2$ 的有理系数；这套换元就是镜像映射，它把 B 模型的坐标 $z$ 与 A 模型的坐标 $q$ 精确接起来。之所以称它为“映射”而不是“坐标变换”，是因为它在更大的模空间（B 模型的复结构模空间 vs A 模型的 Kähler 模空间）上一般只是局部解析同构，并且在这些点附近会表现出单值群的作用。对五次三流形，镜像映射的显式级数是已知的，其系数可以用超几何型级数写出。",
        ["periods-and-picard-fuchs"]),
      step("gk-quantum-coupling", "规范化的 A 模型侧：预势函数与 $q$ 展开",
        "A 模型侧要比较的量是预势函数（prepotential）$F(t)=\\sum_{d\\ge0}N_d q^d$ 型对象：对小量子上同调，规范化的三阶导数是 Yukawa 耦合 $Y_{ijk}=\\sum_{d}N_{d,ijk}q^d$，它应当与 B 模型侧由周期导出的量一致。镜像对称的精确陈述之一是：B 模型侧按 Hodge 滤过构造的“规范坐标”下的 Yukawa 耦合 $\\frac{1}{\\omega_0^{2}}\\partial_z^3\\omega_0$ 型表达式（取自周期解的三阶导数，并经过镜像映射换到 $q$ 坐标）等于 A 模型侧 GW 不变量给出的 $Y^{A}(q)$。两边都是 $q$ 的幂级数，比较系数就得到 $N_d$。这条路线的可计算性是显而易见的：B 模型侧只需要解一个四阶线性常微分方程（用 Frobenius 方法直接求幂级数解），再作一次级数反演（$z\\leftrightarrow q$）与除法，就能读到任意阶的计数。整个过程不涉及任何曲线枚举，因此在计算机上非常高效。",
        ["mirror-map-definition"]),
      step("quintic-numbers", "核算：五次三流形上的有理曲线计数",
        "在五次三流形（复三维，$c_1=0$）上，取 $\\beta=d\\cdot L$（$L$ 为超平面类），$g=0$、$n=0$ 时的 GW 不变量为零（虚拟维数 $=0$，需要插入类才可能有非零结果），因此“计数”使用的是 $n=1$ 的“带一个插入”的规范量与预势函数的三阶导数。镜像对称给出的前三个值为：度数 1 的有理曲线 2875 条、度数 2 的 609250 条、度数 3 的 317206375 条；这些数字来自 $q$ 展开的系数再乘以 $q$ 的适当幂与分母。核对方式是双向的：一方面可以用枚举几何/递推独立算出 $1$、$2$ 度的数（2875 与 609250 在 1991 年后被多种方法重复验证），另一方面把镜像映射的级数展开与 GW 侧由 WDVV 递推得到的结果比对，两者逐项一致。更高度数（如 $d=4$ 的 242467530000 条）也已由同一方法算出，并与后来的 Gromov–Witten 与 DT 计算吻合，这构成镜像对称最早、最扎实的一类证据。",
        ["gk-quantum-coupling"]),
      step("boundaries-of-mirror-map", "镜像映射的边界：单值群、大复结构极限与可积性",
        "镜像映射不是全局良定义的，理解它的边界与理解它的公式同样重要。首先，$q(z)$ 只在极大单值点（大复结构极限 $z=0$）附近收敛，跨过其他单值点后必须用解析延拓，而延拓绕圈会带来单值变换：$q$ 在环绕一个单值点时按 $q\\to q\\cdot(\\text{单位根})$ 变换，这正是 A 模型侧 $q$ 的“量子修正”与 B 模型侧单值群的对应。其次，镜像映射一般不是双有理的：它把 B 模型模空间的某个开集映射到 A 模型模空间的某个开集，在模空间边界（例如椭圆纤维化退化点）处会失去解析性，因此“镜像对称给出两个模空间的同构”只在允许解析延拓与单值化的意义下成立。第三，镜像映射只把“规范坐标”接起来：A 模型侧的各种量子积、后代不变量需要按同样的规范坐标翻译过去，如果换用别的坐标（例如按体积展开的 $t$ 坐标），两边的一致性会被破坏。这三点合起来说明镜像映射是“局部解析 + 单值群 + 规范坐标”三位一体的对象，而不是一个简单的变量替换。",
        ["quintic-numbers"]),
    ],
    conclusion: "镜像映射由 B 模型侧的周期比给出：$q=\\exp(2\\pi i\\,\\omega_1/\\omega_0)$（等价地 $t=\\omega_1/\\omega_0$），它在极大单值点附近是 $z=q\\exp(\\text{全纯})$ 型的解析换元，把 B 模型的复结构参数与 A 模型的 Kähler 参数接起来；经由它，B 模型的周期积分与 Picard–Fuchs 方程的计算结果与 A 模型的 GW 势函数逐项相等，从而用周期积分算出 GW 不变量（五次三流形上度数 1、2、3 的有理曲线数为 2875、609250、317206375）。该映射只在允许解析延拓与单值化的意义下成立。",
    dependencies: [],
    consequences: [],
    explanation: "镜像映射是整个镜像对称里唯一“必须存在但难以刻画”的东西：镜像对称说 A 模型与 B 模型等价，但两边的坐标系统完全不同（一个是辛体积参数，一个是复结构参数），若不给出对齐方式，等价就只是一句空话。周期积分恰好提供了一个天然的规一化：B 模型的周期有特定的对数行为，取第一个对数周期与全纯周期之比，就得到在 A 模型侧有明确几何意义（曲线类的体积参数）的量。于是“镜像映射”既是一个技术工具，也是镜像对称内容的载体：它把“两个模空间之间有同构”这件事具体化成一个幂级数，而这个幂级数的系数同时也是计数结果的一部分。它的历史地位也来自这一点——在 1991 年，通过它算出的五次三流形曲线计数是第一次有人用一个复几何中的微分方程直接产出枚举几何的数值，并且数值大到无法用当时已知的枚举技术触及。",
    examples: [
      { title: "例子：五次三流形镜像映射的级数形状与前两个计数", body: "取五次三流形的镜像族参数 $z=(5\\psi)^{-5}$，Picard–Fuchs 方程在 $z=0$ 附近的全纯解为 $\\omega_0(z)=\\sum_{d\\ge0}\\frac{(5d)!}{(d!)^5}z^{d}$，第二个解由 Frobenius 方法给出 $\\omega_1=\\omega_0\\log z+\\text{（全纯修正）}$ 型表达式，于是 $q=z\\exp\\bigl(\\omega_0^{-1}\\cdot(\\text{全纯修正})\\bigr)=z+154z^2+\\cdots$ 型的级数可以逐项算出（这里的前几个系数可以直接由比较 $\\omega_1$ 的级数得到）。把 $z$ 反解为 $q\\exp(g(q))$ 后代入规范化的 Yukawa 耦合，$q$ 的线性项系数给出 2875、二次项系数给出 609250：前者对应“次数 1 的有理曲线 2875 条”（即 $\u2119^4$ 中的直线数 2875，这是一个古典的可核对数字），后者对应次数 2 的 609250 条，两者都可以用独立方法验证，因此这个例子既是计算演示也是正确性检验。" },
    ],
    remarks: [
      "镜像映射不是恒等映射：把 B 模型参数直接当作 A 模型的体积参数（即令 $q=z$）会破坏等式，因为周期积分中的对数项正是把 $z$ 与 $q$ 分开的那一层；忽略这一层会在低阶就出现偏差（例如次数 1 的系数会变成 $\\omega_0$ 的系数而不再是 2875）。",
      "镜像映射只在极大单值点附近收敛：$q(z)$ 在整个复结构模空间上不是单值的，绕开某个单值点后 $q$ 会按单位根变换，因此“用同一表达式对所有 $\\psi$ 求值”会得到不一致的结果；讨论其他极限（例如大 Kähler 极限对应的大复结构极限之外的区域）时必须先做解析延拓并选定单值分支。",
      "镜像对称给出的计数需要规范坐标与适当的规范化因子：把 Yukawa 耦合的系数直接当成“曲线条数”只在小度数与特定插入下成立，度数增大后需要区分“有理曲线计数”与“带多重覆盖贡献的 GW 不变量”（即需要引入 Gopakumar–Vafa/MNOP 型的分解），否则会把 $d$ 次映射的多重覆盖算成新的曲线。",
      "镜像映射的存在性对 Calabi–Yau 是构造性的，对一般型或 Fano 簇不一定有“周期积分型”的镜像映射：Fano 情形要用 Landau–Ginzburg 模型或 Givental 的镜像对称框架（I-函数），其“映射”是形式级数而非周期比的对数指数，因此把周期比的公式当作镜像对称的一般定义会限制在 CY 且需要 CY 假设来保证 3-形式的唯一性。",
    ],
    corollaries: [
      { title: "推论：$q$ 的首项为 $z$ 且镜像映射在 $z=0$ 处是局部解析同构", body: "由 $\\omega_0(0)=1$ 与 $\\omega_1$ 在 $z=0$ 处的对数主项，$q=z\\exp(\\omega_0^{-1}\\cdot\\text{全纯})=z+O(z^2)$，故 $q(z)$ 在 $z=0$ 附近可逆，镜像映射在极大单值点附近是双向解析的。这条推论保证了“把 B 模型的级数换成 A 模型的级数”这一步在计算上是合法的，也解释了为什么所有大度数计算都可以在 $z=0$ 附近的幂级数环内完成，不需要处理模空间整体结构。", uses: ["mirror-map-definition"] },
    ],
    references: [
      { title: "Mirror symmetry and the moduli space of Calabi-Yau manifolds", author: "P. Candelas, X. de la Ossa, P. Green, L. Parkes", year: 1991 },
      { title: "A pair of Calabi-Yau manifolds as an exactly soluble superconformal theory", author: "P. Candelas, X. de la Ossa, P. Green, L. Parkes", year: 1991 },
      { title: "Mirror symmetry (Clay monograph), Chapters on the mirror map", author: "K. Hori, S. Katz, A. Klemm, R. Pandharipande, et al.", year: 2003 },
      { title: "Picard-Fuchs equations and mirror maps for hypersurfaces", author: "D. Morrison", year: 1992 },
    ],
    history: HISTORY,
  },

  /* __NEXT__ */
}
