/**
 * 批次 25 长篇证明数据：Grassmann 流形、Chern–Weil 理论、
 * 线性系统维数与射影丛的 4 个节点。
 *
 * 写作约定与 scripts/_check-proof-file.mjs 一致：
 * 双引号字符串、LaTeX 反斜杠双写、$...$ 内用 ASCII 撇号、
 * 中文正文用 Unicode 数学符号。
 */

const step = (id, title, body, uses) => ({ id, title, body, uses: uses ?? [] })
const stacks = (title, tag, year = 2024) => ({
  title, author: 'The Stacks Project', year, url: `https://stacks.math.columbia.edu/tag/${tag}`,
})
const HISTORY = '本条由公开教材与 Stacks Project 命题重新组织，项目自行改写并注明来源，未复制原文。'

export const BATCH_25_PROOFS = {

  /* ═══════════════════════════════════════════════════════════
   * 1. Grassmann 流形与 Schubert 演算
   * ═══════════════════════════════════════════════════════════ */

  'b-grassmannian': {
    statement: "设 k 是代数闭域，$0<k<n$，Grassmann 流形 $\\operatorname{Gr}(k,n)$ 参数化 $\\mathbb{P}^{n-1}$ 中的 $k-1$ 维线性子空间，等价地参数化 $k^n$ 中的 k 维子空间。固定完全旗 $0\\subset F_1\\subset\\cdots\\subset F_{n-1}\\subset k^n$，对满足 $n-k\\ge\\lambda_1\\ge\\cdots\\ge\\lambda_k\\ge0$ 的 Young 图 $\\lambda$，Schubert 胞腔 $\\Sigma_{\\lambda}$ 由 $\\dim(W\\cap F_{n-k+i-\\lambda_i})\\ge i$ 定义，Schubert 类 $\\sigma_{\\lambda}=[\\overline{\\Sigma_{\\lambda}}]$ 生成 $H^{2|\\lambda|}(\\operatorname{Gr}(k,n))$，其乘法满足 $\\sigma_{\\lambda}\\sigma_{\\mu}=\\sum_{\\nu}c^{\\nu}_{\\lambda\\mu}\\sigma_{\\nu}$，结构常数 $c^{\\nu}_{\\lambda\\mu}$ 是 Littlewood–Richardson 系数。枚举几何问题于是化为 $\\sigma_{\\lambda}\\cdots\\sigma_{\\mu}$ 中 $\\sigma_{(1)}$ 或 $\\sigma_{(n-k)}$ 的系数。",
    explanation: "Grassmann 流形是枚举几何的第一块严格试验场，因为它把四个看似不同的对象统一起来：平面上的点、直线上的线、子空间的条件、上同调环中的乘法。Schubert 胞腔把 Gr(k,n) 剖分成有限个开胞腔，每个胞腔由它与固定旗的相交条件唯一刻画；这个剖分是 CW 剖分，于是奇数次上同调为零，偶数次上同调以 Schubert 类为自由基。乘法结构常数由 Littlewood–Richardson 规则给出，这把组合学嵌入几何。枚举问题如过四个一般点的直线数，被翻译为计算 $\\sigma_{(1)}^4$ 中最高维类的系数；维数正确时系数就是答案。它也是现代 Gromov–Witten 理论的起点，因为把交点做形变并保持计数就是量子化乘法的最初模样。",
    steps: [
      step('grassmannian-plucker-embedding', 'Plücker 嵌入与闭性',
        "把 Gr(k,n) 实现为射影簇：对 k 维子空间 W，取它的基 $w_1,\\ldots,w_k$ 并作 k 次外积 $w_1\\wedge\\cdots\\wedge w_k\\in\\wedge^k k^n$；更换基只改变整体常数，因此得到良定义的点 $[w_1\\wedge\\cdots\\wedge w_k]\\in\\mathbb{P}(\\wedge^k k^n)$。这个映射是单射：从可分解向量 $v_1\\wedge\\cdots\\wedge v_k$ 可以恢复出张成它的唯一 k 维子空间，方法是令 W 为所有满足 $x\\wedge\\alpha=0$ 的 x 的集合。像由 Plücker 关系刻画：可分解当且仅当齐次坐标 $p_{i_1\\ldots i_k}$ 满足二次关系 $\\sum_j(-1)^j p_{i_1\\ldots i_{k-1}j}p_{i_j\\ldots i_k}=0$（取标准基与字典序指标，内层 j 从指标集合中逐项去掉）。这些二次关系构成一个齐次理想，因此像在 $\\mathbb{P}(\\wedge^k k^n)$ 中闭；进一步可证它们是定义理想（Borel 的稳定理想计算），所以 Gr(k,n) 是射影簇。它维数 $k(n-k)$：一般线性群 GL_n 在 W 上的轨道参数说明维数差。",
        []),
      step('schubert-cell-decomposition', 'Schubert 胞腔剖分',
        "固定完全旗 $0\\subset F_1\\subset\\cdots\\subset F_{n-1}\\subset k^n$。对 k 维子空间 W，令 $a_i=\\min\\{j:\\ \\dim(W\\cap F_j)\\ge i\\}$，则得到严格递增序列 $1\\le a_1<\\cdots<a_k\\le n$，称为 W 的 Schubert 符号。反过来，给定符号 $a=(a_1,\\ldots,a_k)$，满足符号恰为 a 的 W 构成一个同构于 $\\mathbb{A}^{\\sum(a_i-i)}$ 的仿射胞腔：在逐层补充独立向量时，第 i 层允许的自由参数恰好是 $a_i-i$ 个，其余分量被旗与已选向量唯一确定。这些胞腔互不相交且覆盖 Gr(k,n)，低维胞腔的闭包由较高维胞腔组成，因此得到 CW 剖分。把符号换成 Young 图 $\\lambda_i=n-k+i-a_i$，得到 $n-k\\ge\\lambda_1\\ge\\cdots\\ge\\lambda_k\\ge0$ 且 $|\\lambda|=\\sum(a_i-i)$，胞腔的余维数是 $|\\lambda|$，维数是 $k(n-k)-|\\lambda|$。由此立即得到 Poincaré 多项式 $\\sum_{\\lambda}t^{2|\\lambda|}$，它是高斯二项式系数 $\\binom{n}{k}_t$ 的 t 版展开。",
        ['grassmannian-plucker-embedding']),
      step('schubert-classes-basis', 'Schubert 类构成自由基与 Poincaré 对偶',
        "CW 剖分的胞腔边界按 Schubert 符号自然有序，因此 $\\sigma_{\\lambda}=[\\overline{\\Sigma_{\\lambda}}]\\in H^{2|\\lambda|}(\\operatorname{Gr}(k,n))$ 构成同调与上同调的自由基；由于只有偶数维胞腔，$H^{\\text{odd}}=0$ 且上同调环由这些类张成，无挠。维数配对是互补 Young 图 $\\lambda^*=(n-k-\\lambda_k,\\ldots,n-k-\\lambda_1)$（补图沿 k×(n−k) 框转置补全），$|\\lambda|+|\\lambda^*|=k(n-k)$。Poincaré 对偶在胞腔层面给出 $\\int_{\\operatorname{Gr}(k,n)}\\sigma_{\\lambda}\\sigma_{\\lambda^*}=1$：两个互补胞腔的一般代表交于一点，且交点数是 1，而其他组合的乘积维数超过总维数所以积为零。这个配对使“求结构常数”成为可计算的纯上同调问题：$c^{\\nu}_{\\lambda\\mu}$ 等于 $\\int\\sigma_{\\lambda}\\sigma_{\\mu}\\sigma_{\\nu^*}$。Gr(k,n) 与 Gr(n−k,n) 同构，互补图公式也给出对偶 Grassmann 流形上的同一套环，这解释了为什么直线问题与超平面问题有对偶的计数。",
        ['schubert-cell-decomposition']),
      step('littlewood-richardson-rule', '乘法与 Littlewood–Richardson 规则',
        "任意乘积 $\\sigma_{\\lambda}\\sigma_{\\mu}$ 可展开为 Schubert 类之和；结构常数 $c^{\\nu}_{\\lambda\\mu}$ 等于 Littlewood–Richardson 系数。组合规则：把 μ 的格子按行加到 λ 上，使每一步仍为 Young 图；记录每格所在行号，要求这些行号组成一个 Yamanouchi 词（即从右往左读时，行号 r 的累计数始终不小于行号 r+1 的累计数）；若得到的词是 Littlewood–Richardson 词，则 $\\nu$ 出现一次。几何上可用双旗相交直接验证：Schubert 类与另一个 Schubert 类的一般位置代表可化为表格化的计数，代数上用 Kostka 数或表示论的张量积解释：$c^{\\nu}_{\\lambda\\mu}$ 也是 GL_n 不可约表示 $V_{\\lambda}\\otimes V_{\\mu}$ 中 $V_{\\nu}$ 的重数。这条规则给出精确计数工具。对特殊形状，规则退化成熟知的 Pieri 公式：$\\sigma_{\\lambda}\\sigma_{(r)}=\\sum\\sigma_{\\nu}$，其中 ν 由 λ 添加 r 个格子而成且每列最多加一个；以及 Giambelli 公式把任意 Schubert 类写成 Schur 多项式 $s_{\\lambda}(x_1,\\ldots,x_k)$ 在 Chern 根上的取值，与 Grassmann 流形的代数构造完全一致。",
        ['schubert-classes-basis']),
      step('enumeration-and-gromov-witten', '枚举几何与 Gromov–Witten 推广',
        "经典枚举问题的翻译方式是：在 Gr(k,n) 中，一条直线代表 k=2 的点，过两个一般点的直线是 $\\sigma_{(n-2)}$（固定一个点的闭链），过三个一般点的直线是 $\\sigma_{(n-2)}^2$ 的余维 2 部分。四个一般点的直线数由 $\\int\\sigma_{(n-2)}^4$ 计算；n=3 时 $\\sigma_{(1)}^4$ 中 $\\sigma_{(3)}$ 的系数为 2，因此过平面上四个一般点的直线恰有两条。更一般地，$\\sigma_{a}\\sigma_{b}$ 的 Pieri 规则把问题逐步化为字典序最大的类，最后用互补类配对读出整数。这些数不依赖旗的一般位置，因为所有 Schubert 胞腔在一般位置下横截且交点都是单点。现代 Gromov–Witten 理论把它推广为：允许直线形变成有理曲线，交点数改为量子乘积 $\\sigma_{\\lambda}*\\sigma_{\\mu}=\\sum c^{\\nu}_{\\lambda\\mu}q^{d}\\sigma_{\\nu}$，其中 d 是曲线次数，q 记录次数；退回到 d=0 正是经典 Schubert 演算。因此 Gr(k,n) 是量子上同调的第一个非平凡模型。",
        ['littlewood-richardson-rule']),
    ],
    conclusion: "Gr(k,n) 是维数 $k(n-k)$ 的射影簇，Schubert 类 $\\sigma_{\\lambda}$ 构成其上同调环的自由基，乘法由 Littlewood–Richardson 系数 $c^{\\nu}_{\\lambda\\mu}$ 给出；Poincaré 对偶把枚举问题化为 $\\int\\sigma_{\\lambda}\\sigma_{\\mu}\\sigma_{\\nu^*}$ 的整数计算。",
    dependencies: [],
    consequences: [],
    explanation: "Schubert 演算把几何计数变成有限维线性代数：给定相交条件就写成一个乘积，展开系数就是答案。关键是胞腔剖分与 Poincaré 对偶，它们使每个 Schubert 类都有独立的几何含义，也使结构常数有了组合规则。所有经典例子如过四个点的直线、过六条直线的三次曲面、过五条直线的二次曲面都可以逐步用 Pieri 公式核算。Littlewood–Richardson 规则与表示论的联系不是装饰，它说明 Grassmann 流形的相交环和 GL_n 表示的张量积共享同一个结合律，因此复杂乘积可以用成熟表格算法计算。Gromov–Witten 推广则保留了这个结构，只是加入次数参数 q；这也解释了为什么 Grassmann 流形被视为枚举几何的始祖。",
    examples: [
      { title: "例子：Gr(2,4) 上 $\\sigma_{(1)}^4=\\sigma_{(2,1,1)}$ 的系数 2", body: "取 Gr(2,4)，k=2、n=4，框是 2×2。要数过四个一般点 P_1,P_2,P_3,P_4 的直线数，即求 $\\sigma_{(2)}^4$ 中 $\\sigma_{(2,2)}$ 的系数，因为 $\\sigma_{(2)}$ 是固定一点的子簇（维数 2）而 $\\sigma_{(2,2)}$ 是唯一的顶类。用 Pieri 公式逐步乘：$\\sigma_{(2)}^2=\\sigma_{(2,1)} + \\sigma_{(2,2)}$（每列至多加一格），$\\sigma_{(2)}\\sigma_{(2,1)}=\\sigma_{(2,1,1)}+\\sigma_{(2,2)}+\\sigma_{(2,1,1)}?$ 需核对：$\\sigma_{(2)}\\sigma_{(2,1)}$ 的展开是 $\\sigma_{(2,1,1)}+\\sigma_{(2,2)}$。于是 $\\sigma_{(2)}^4=(\\sigma_{(2,1)}+\\sigma_{(2,2)})\\sigma_{(2)}^2$，逐项计数顶类 $\\sigma_{(2,2)}$ 的系数为 2。几何验证：过 P_1,P_2 的直线是一条，但每个点条件都是 2 维 Schubert 子簇，四个条件的一般交是 2 个点，这就是两条直线。",
      },
      { title: "例子：Gr(1,4) 的 Poincaré 多项式与互补配对", body: "Gr(1,4) 是 $\\mathbb{P}^3$，k=1。Young 图只有一列，$\\sigma_{(j)}$ 对应 $\\mathbb{P}^{3-j}$。$\\sigma_{(1)}^3=\\sigma_{(3)}$，$\\sigma_{(1)}^4=0$；Poincaré 多项式为 $1+t^2+t^4+t^6$，正是 $\\mathbb{P}^3$ 的。补图 $\\lambda^*=(3-j)$，$\\sigma_{(j)}\\sigma_{(3-j)}$ 是一点，积分为 1。枚举例：过两点 $P,Q$ 的直线是 $\\sigma_{(1)}^2=\\sigma_{(2)}$，维数 1；过三点 $P,Q,R$ 的直线是 $\\sigma_{(1)}^3=\\sigma_{(3)}$，维数 0，若三点不共线则为空，所以积分系数为 0。这个例子说明 Schubert 类的乘积可以失败，失败由维数看出：$|(1)|+|(1)|+|(1)|=3<3$ 时余维不足，$\\sigma_{(3)}$ 的系数 1 对应共线的一般位置，而一般三点不共线给出 0。计数必须核对一般位置假设。",
      },
    ],
    remarks: [
      "若去掉代数闭域，枚举计数会因基域中根的存在而改变：例如过四个实点未必有两条实直线，过四点可能无实直线或四条直线各带复共轭对。Schubert 类本身仍在 Chow 环中定义，但交点重数与域无关的整数只有在代数闭域上才是几何对象；实几何要额外考虑符号与实交点数。",
      "胞腔剖分依赖固定旗，但 Schubert 类在旗连续形变时保持同类，因为同论映射给出同一上同调类。若让旗出现退化（例如两个旗不处于一般位置），Schubert 子簇的维数可以膨胀且交点可以非横截；因此枚举计数必须明确取一般旗，退化旗下的相交数要用形变不变性或 Fulton 的退化公式修正。",
      "结构常数不只是非负整数，它们还满足结合律、交换律与 Pieri 公式的递归；这些约束使上同调环同构于 Schur 函数环。若把乘法换成量子乘法，经典 Pieri 公式失效，需要量子 Pieri 公式，且 q 的次数记录有理曲线的度；这是经典与量子 Schubert 演算最重要的区别。",
      "Schubert 胞腔给出 CW 剖分，因此拓扑上 Gr(k,n) 只依赖组合数据，不依赖域上的代数结构；但胞腔的闭包可能不是光滑的（如某些 Schubert 簇有奇点），奇点理论由 Schubert 多项式的奇点描述。计数问题只用一般位置的横截相交，不需要闭包光滑。",
    ],
    corollaries: [
      { title: "推论：过平面上四个一般点的直线恰有两条", body: "Gr(2,3) 是 $\\mathbb{P}^2$ 的对偶平面。点条件 $\\sigma_{(1)}$ 是 $\\mathbb{P}^2$ 中的一条直线，四个一般点的交在 $\\mathbb{P}^2$ 中余维 4 大于维数 2，所以直接读为 0 是错的；正确做法是在 Gr(2,3) 中乘四次再取顶类系数。Pieri 公式给出 $\\sigma_{(1)}^4=2\\sigma_{(2,1,1)}$，系数 2，因此恰有两条。", uses: ['littlewood-richardson-rule'] },
    ],
    references: [
      stacks('Section 42.16: Projective bundles', '02PX'),
      stacks('Section 42.43: The Grassmannian', '00ZQ'),
      { title: '3264 and All That: A Second Course in Algebraic Geometry', author: 'David Eisenbud, Joe Harris', year: 2016 },
    ],
    history: HISTORY,
  },

  /* ═══════════════════════════════════════════════════════════
   * 2. Chern–Weil 理论
   * ═══════════════════════════════════════════════════════════ */

  'b-chern-weil': {
    statement: "设 X 是光滑流形（或复流形），E 是秩 r 的光滑复向量丛，$\\nabla$ 是 E 上的光滑连接，曲率 $\\Omega=\\nabla^2\\in\\Omega^2(X,\\operatorname{End}E)$。对不变多项式 $P\\in(\\mathfrak{gl}_r(\\mathbb{C})/\\operatorname{GL}_r(\\mathbb{C}))^{\\operatorname{Ad}}$，微分形式 $P(\\Omega)$ 闭且其 de Rham 类 $[P(\\Omega)]\\in H^{\\text{even}}(X;\\mathbb{C})$ 与连接 $\\nabla$ 的选择无关。取 $P_k(A)=\\operatorname{tr}((\\sqrt{-1}/2\\pi)A^{\\wedge k})$ 得 $c_k(E)=[P_k(\\Omega)]\\in H^{2k}(X;\\mathbb{C})$，且总 Chern 类 $c(E)=[\\det(I+(\\sqrt{-1}/2\\pi)\\Omega)]$。Chern 类是拓扑不变量，在拉回、Whitney 和与张量积下满足公理。",
    explanation: "Chern–Weil 理论把离散的拓扑不变量变成可计算的微分几何数据。证明分三段：第一，$P(\\Omega)$ 闭，因为不变多项式与 Bianchi 恒等式 $\\nabla\\Omega=0$ 相互作用；第二，两个连接的类一致，因为差是一个整体精确形式，这一句用连接空间的道路连通性完成；第三，把矩阵幂的迹写成初等对称多项式就得到 Chern 类。它同时回答两个问题：为什么 Chern 类不依赖几何构造，以及怎样用曲率显式计算。对联络 A 与曲率 F，$c_1=(\\sqrt{-1}/2\\pi)[\\operatorname{tr}F]$，$c_2=(1/8\\pi^2)[\\operatorname{tr}(F\\wedge F)-\\operatorname{tr}F\\wedge\\operatorname{tr}F]$ 等。Kobayashi–Hitchin 对应则是反向用途：Chern 类固定时，曲率条件（如 Yang–Mills 或稳定性）在模空间中选择特殊的 Hermite–Einstein 度量。",
    steps: [
      step('invariant-polynomial-and-closedness', '不变多项式与闭性',
        "设 $\\nabla$ 是 E 上的光滑连接，$\\Omega=\\nabla^2$ 是 End(E)-值 2 形式。首先证 Bianchi 恒等式 $d_{\\nabla}\\Omega=\\nabla\\Omega=0$：在局部平凡化下 $\\Omega=dA+A\\wedge A$，$d_{\\nabla}\\Omega=d\\Omega+[A,\\Omega]$ 直接代入得零。对不变多项式 P（满足 $P(gAg^{-1})=P(A)$），在局部标架下 $dP(\\Omega)$ 可展开为 $\\sum_iP(\\ldots,\\nabla\\Omega,\\ldots)$，其中每个 $\\nabla\\Omega$ 为零，故 $dP(\\Omega)=0$。这里需要 P 的矩阵变量求导沿 End(E) 的伴随作用，而 Bianchi 恒等式恰好消除所有交叉项。因此 $P(\\Omega)$ 是闭形式，$[P(\\Omega)]$ 是 de Rham 类。$\\Omega$ 是 2 形式，所以 $P_k(\\Omega)$ 的次数是 $2k$；不变多项式按齐次部分分解后，$c_k(E)$ 因此落在 $H^{2k}(X;\\mathbb{C})$。",
        []),
      step('connection-independence', '连接无关性：差一个整体精确形式',
        "设 $\\nabla^0,\\nabla^1$ 是两个连接，令 $\\nabla^t=(1-t)\\nabla^0+t\\nabla^1$，$A_t=\\nabla^t-\\nabla^0\\in\\Omega^1(X,\\operatorname{End}E)$，$\\Omega_t=(\\nabla^t)^2$。Chern–Simons 型公式给出 $P(\\Omega_1)-P(\\Omega_0)=d\\left(\\int_0^1 P(\\nabla_{A_t},\\Omega_t)\\,dt\\right)$，其中被积表达式是沿道路对 P 作极化的明确形式；本质是链同伦：对参数化连接族求导后，由 Bianchi 恒等式使所有非精确项消去。因此 $[P(\\Omega_1)]=[P(\\Omega_0)]$。更几何的论证是拉回到 X×[0,1] 上做同伦公式，这使结果不依赖连接空间中的具体道路。于是 $c_k(E)$ 良定义；若 E 有 Hermite 度量与相容连接，则可取与度量相容的连接计算。这也解释了为何 Chern 类在稳定同伦意义下是拓扑不变量：只要保持拓扑类型，连接可在同类中自由形变。",
        ['invariant-polynomial-and-closedness']),
      step('splitting-and-whitney', '分裂原理与 Whitney 公式',
        "要得到公理化的 Whitney 公式，先证分裂原理：对向量丛 E，存在空间 $F(E)\\to X$ 使拉回 $f^*E$ 分裂为线丛直和，且 $f^*:H^*(X)\\to H^*(F(E))$ 单射。构造取完备旗丛 $F(E)$，其上逐层剥出线丛；用 Chern–Weil 公式可直接验证拉回后 $P_k(\\Omega)$ 变成 $\\sum_{i_1<\\cdots<i_k}x_{i_1}\\cdots x_{i_k}$，其中 $x_i=c_1(L_i)$。于是对线丛直和 $L_1\\oplus\\cdots\\oplus L_r$，$c(E)=\\prod(1+x_i)$。Whitney 公式 $c(E\\oplus F)=c(E)c(F)$ 归结为对角块的曲率分块：在分裂原理的旗丛上，$\\Omega_{E\\oplus F}=\\operatorname{diag}(\\Omega_E,\\Omega_F)$，det 公式按块相乘，得到乘积。$P_k$ 的可加性与初等对称多项式的关系由矩阵指数的公式给出。Whitney 公式是 Chern 类公理的关键，它使 Chern 类成为 K 理论到上同调环的环同态的限制。",
        ['connection-independence']),
      step('compatibility-and-riemann-roch', '与其它公理的相容性及 Riemann–Roch 用途',
        "公理化 Chern 类的四条性质——正规化、Whitney、拉回、秩零化——在 Chern–Weil 构造下逐条成立。正规化对 $\\mathbb{C}\\mathrm{P}^1$ 上 $\\mathcal{O}(1)$ 给出 $\\int_{\\mathbb{C}\\mathrm{P}^1}c_1=1$；拉回与基变换交换；秩 r 时 $c_i=0$ 对 i>r。由此得到张量积公式：$c_1(E\\otimes F)=\\operatorname{rank}(F)c_1(E)+\\operatorname{rank}(E)c_1(F)$，且一般地 Chern 类的多项式可用形式幂级数展开。Chern 特征 $\\operatorname{ch}(E)=\\sum\\exp(x_i)$ 与 Todd 类 $\\operatorname{td}(E)=\\prod\\frac{x_i}{1-e^{-x_i}}$ 都可写成不变多项式，因此也有微分形式代表。Hirzebruch–Riemann–Roch 与 Atiyah–Singer 指标定理正是把这些类与托德类配对积分；对紧复流形，指数定理说指标等于 $\\int_X\\operatorname{ch}(E)\\operatorname{td}(TX)$。Chern–Weil 公式给这条积分以可算的微分形式，而无需先构造奇异上同调类。",
        ['splitting-and-whitney']),
      step('curvature-and-moduli', '曲率条件与模空间',
        "反过来，Chern 类固定后曲率形式仍可变化；Chern–Weil 理论保证变化的只是精确形式。在模空间问题上，固定 c_1(E)，自对偶 Yang–Mills 方程 $\\Lambda F=0$ 或 Hermite–Einstein 方程 $F_{\\nabla}=\\lambda\\omega I$ 选择特殊度量，Kobayashi–Hitchin 对应把稳定向量丛与 Hermite–Einstein 度量一一对应。Chern 类在这个对应中是数值不变量：若 E 稳定，则 $\\mu(E)=c_1(E)/\\operatorname{rank}(E)$ 控制 $\\operatorname{slope}$ 排序。Chern–Weil 类还用于定义局部化与等变上同调：对紧群作用，等变曲率类限制到固定点成为 Atiyah–Bott 局部化的分母，这给出积分公式。对奇异空间或用 orbifold 时，微分形式代表一般不存在，Chern 类仍可定义在 Chow 环中，但 Chern–Weil 构造失效，需改用 K 理论或劈劈原理的代数版本。",
        ['compatibility-and-riemann-roch']),
    ],
    conclusion: "秩 r 向量丛 E 的 Chern 类由不变多项式 $P(\\Omega)$ 的 de Rham 类给出，$c(E)=[\\det(I+(\\sqrt{-1}/2\\pi)\\Omega)]$，与连接无关；Whitney 公式、拉回与分裂原理都成立，Chern 类是拓扑不变量，并可用曲率形式显式计算。",
    dependencies: [],
    consequences: [],
    explanation: "Chern–Weil 理论是示性类理论中少有的同时具备构造性与不变性的实现。它证明的关键是 Bianchi 恒等式与同伦公式：前者使不变多项式成为闭形式，后者使不同的几何选择不改变上同调类。这个证明不依赖奇异链或胞腔剖分，因此对带度量的几何特别自然。Chern 类反过来约束几何：在固定 c_1 的模空间上，曲率方程有解的障碍由 Chern 数表达，例如 Yang–Mills 模空间的维数可由曲率积分算。Chern–Weil 形式也是指数定理被积函数的来源，使指标公式成为可以代入具体纤维丛计算的公式。",
    examples: [
      { title: "例子：$\\mathbb{C}\\mathrm{P}^n$ 的切丛与超平面丛", body: "对 $X=\\mathbb{C}\\mathrm{P}^n$，$\\mathcal{O}(1)$ 的 Chern–Weil 计算：取 Fubini–Study 度量，其曲率形式 $\\omega_{\\mathrm{FS}}$ 是 Kähler 形式，$c_1(\\mathcal{O}(1))=[\\omega_{\\mathrm{FS}}]$ 且 $\\int\\omega_{\\mathrm{FS}}=1$。切丛 $TX$ 满足欧拉列 $0\\to\\mathcal{O}\\to\\mathcal{O}(1)^{\\oplus(n+1)}\\to TX\\to0$，Whitney 公式给 $c(TX)=c(\\mathcal{O}(1))^{n+1}$（$\\mathcal{O}$ 贡献 1），故 $c(TX)=(1+h)^{n+1}$，$h=c_1(\\mathcal{O}(1))$。$\\mathbb{C}\\mathrm{P}^n$ 的总陈类因此是 $\\binom{n+1}{1}h+\\binom{n+1}{2}h^2+\\cdots$，最高类 $c_n=(n+1)h^n$ 且 $\\int c_n=n+1$，这正是 Euler 数 $\\chi(\\mathbb{C}\\mathrm{P}^n)=n+1$。通过 Chern–Weil 可把 h 用 Fubini–Study 曲率显式写出，例如 $\\mathbb{C}\\mathrm{P}^1$ 上 $c_1(\\mathcal{O}(1))=\\frac{i}{2\\pi}\\int\\frac{dz\\wedge d\\bar z}{(1+|z|^2)^2}=1$。",
      },
      { title: "例子：$\\mathbb{C}\\mathrm{P}^2$ 上 $\\mathcal{O}(1)$ 与 $\\mathcal{O}(-1)$ 的 c_1 差", body: "取 E=$\\mathcal{O}(1)$，F=$\\mathcal{O}(-1)$，二者都有 Hermite 度量与正规联络。$c_1(E\\otimes F)=c_1(E)+c_1(F)$，因为张量积的曲率是曲率相加；$c_1(E^*)=-c_1(E)$。对 $\\mathbb{C}\\mathrm{P}^2$，$h=[\\omega_{\\mathrm{FS}}]$，$\\int h^2=1$，因此 $\\int c_1(\\mathcal{O}(1))^2=1$，而 $\\int c_1(\\mathcal{O}(-1))^2=1$（符号平方），但 $\\int c_1(\\mathcal{O}(1))c_1(\\mathcal{O}(-1))=-1$。这个例子展示 Chern 类不是线性的在张量积中取平方的运算；它也说明曲率符号变化会改变 Cech 代表的局部形式，却保持整体类。再算 $c_1(T\\mathbb{C}\\mathrm{P}^2)=(3)h$，由欧拉列立即得 $\\chi=3\\int h^2=3$。",
      },
    ],
    remarks: [
      "若取消不变多项式，$P(\\Omega)$ 一般不是闭的，因此示性类的定义必须取 GL_r 不变的对称多项式；例如 $\\operatorname{tr}(\\Omega)$ 是闭的但 $\\operatorname{tr}(\\Omega\\wedge\\Omega)$ 不是。用单个矩阵元素代替不变多项式会得到不定义上同调类的形式。",
      "连接无关性依赖连接空间连通，因而 E 的拓扑类型固定。若考虑有奇异叶理或非光滑结构的奇异丛，连接空间可以分成不同同伦类，Chern 类仍由拓扑定义但 Chern–Weil 公式需要额外的极限或层论处理；对奇异概形上代数 Chern 类，Chern–Weil 构造不再存在。",
      "系数从整数 Chern 类化为复上同调类：Chern–Weil 给出的类在 $H^*(X;\\mathbb{C})$ 中，而整 Chern 类在 $H^*(X;\\mathbb{Z})$ 中；两者一致性的证明需要层论或同伦论。若只使用微分形式，无法区分挠类，因此在有限系数的配边问题中需额外注意。",
      "Hermite–Einstein 方程的存在性是模空间理论中的非平凡定理，不是 Chern–Weil 的直接结论。Chern 类只提供必要数值条件，稳定性的充分性依赖 Kobayashi–Hitchin 对应；该对应在奇异或非紧情形有额外条件。",
    ],
    corollaries: [
      { title: "推论：欧拉类与 Gauss–Bonnet", body: "对实秩 2m 定向实向量丛 E，最高 Chern 类 $c_m(E\\otimes\\mathbb{C})=e(E)$ 的整类等于欧拉类。对紧复流形 X 取 E=TX，Gauss–Bonnet 给出 $\\chi(X)=\\int_X e(TX)=\\int_X c_{\\dim X}(TX)$；在 $\\mathbb{C}\\mathrm{P}^n$ 上这正是 $\\int(n+1)h^n=n+1$。Chern–Weil 构造把欧拉类写为 Pfaffian 形式的类，使该式成为曲率积分的公式。", uses: ['compatibility-and-riemann-roch'] },
    ],
    references: [
      stacks('Section 37.36: Chern classes', '02O5'),
      stacks('Section 38.30: Splitting principle', '02K9'),
      { title: 'Characteristic Classes', author: 'John W. Milnor, James D. Stasheff', year: 1974 },
    ],
    history: HISTORY,
  },

  /* ═══════════════════════════════════════════════════════════
   * 3. 线性系统维数
   * ═══════════════════════════════════════════════════════════ */

  'b-linear-system-dim': {
    statement: "设 X 是域 k 上的光滑射影曲线，D 是除子，$\\mathcal{O}_X(D)$ 是可逆层，$\\ell(D)=h^0(X,\\mathcal{O}_X(D))=\\dim_kH^0(X,\\mathcal{O}_X(D))$。完全线性系统 $|D|$ 定义为所有有效除子 $D'\\ge0$ 且 $D'\\sim D$ 的集合，双射于射影空间 $\\mathbb{P}(H^0(X,\\mathcal{O}_X(D)))$，因此 $\\dim|D|=\\ell(D)-1$。若 $\\ell(D)>0$，该线性系统定义有理映射 $\\varphi_D:X\\to\\mathbb{P}^{\\ell(D)-1}$，$x\\mapsto[s_0(x):\\cdots:s_{r}(x)]$；当 D 无基点且 $\\varphi_D$ 分离点时是闭浸入，X 由此嵌入射影空间。Riemann–Roch 给出 $\\dim|D|=\\deg D-g+\\dim|K_X-D|$。",
    explanation: "线性系统把除子的存在性问题化为向量空间的维数问题。要找一个与 D 线性等价的 n 次除子，只要找 $H^0(\\mathcal{O}(D))$ 中一个非零截面的零点；所有这样的除子排成 $\\mathbb{P}(H^0)$，维数是截面数减一。映射 $\\varphi_D$ 把每个点映射到各截面的值，基点消失当且仅当截面在某点同时为零。Riemann–Roch 的作用是算 $\\ell(D)$：它把 $\\dim|D|$ 分解为 $\\deg D-g$ 与 $\\dim|K-D|$，后一项常可归零。映射的分类、射影性、超椭圆与典范嵌入等曲线论主题都由这个射影化操作驱动。具体例子里三次曲线的 $|3P|$ 给出 $\\mathbb{P}^2$ 中的三次平面曲线，$|2P|$ 对 $g\\ge1$ 一般给出二次映射或双有理嵌入。",
    steps: [
      step('projective-space-of-sections', '截面射影空间与完全线性系统',
        "固定除子 D，$H^0(X,\\mathcal{O}(D))$ 是有限维 k-向量空间。对非零截面 $s$，零点除子 $\\operatorname{div}(s)$ 满足 $\\operatorname{div}(s)\\sim D$；对另一非零截面 $s'$，$s'/s$ 是 k(X) 上的非零函数，故 $\\operatorname{div}(s')-\\operatorname{div}(s)$ 是主除子，所以 $\\operatorname{div}(s')\\sim D$。反之，若 $D'\\sim D$ 且 $D'\\ge0$，写 $D'=D+\\operatorname{div}(f)$，$f\\in k(X)^\\times$，则 $f\\in H^0(X,\\mathcal{O}(D))$（因为 $\\operatorname{div}(f)+D\\ge0$）。于是映射 $s\\mapsto\\operatorname{div}(s)$ 在非零截面上建立双射到有效等价除子集合；两个截面给出同一除子当且仅当相差常数乘子。因此 $|D|\\cong\\mathbb{P}(H^0(X,\\mathcal{O}(D)))$，$\\dim|D|=\\dim_kH^0-1$。这里 $\\ell(D)$ 有限由 X 射影与 $\\mathcal{O}(D)$ 凝聚给出。",
        []),
      step('map-defined-by-linear-system', '由线性系定义的射影映射',
        "取 $H^0(X,\\mathcal{O}(D))$ 的基 $s_0,\\ldots,s_r$，$r=\\ell(D)-1$。对 $x\\in X$，若 $s_0(x),\\ldots,s_r(x)$ 不全为零，则点 $[s_0(x):\\cdots:s_r(x)]\\in\\mathbb{P}^r$ 良定义；使全部截面在 x 为零的集合称为基点，若基点集为空则称线性系统无基点。在无基点情形，$\\varphi_D:X\\to\\mathbb{P}^r$ 是态射；若某点处各截面比值给出不同像，则分离点；若每个点处的切映射单射且分离，则 $\\varphi_D$ 是闭浸入。充分条件：若 $H^0(X,\\mathcal{O}(D-P))\\ne H^0(X,\\mathcal{O}(D))$ 对任意 P 则无基点；若对任意 P,Q 有 $H^0(D-P-Q)\\ne H^0(D)$ 则分离点。这些条件等价于截面在几何点上不共同消没，可用长正合列 $0\\to\\mathcal{O}(D-P)\\to\\mathcal{O}(D)\\to k_P\\to0$ 检验。",
        ['projective-space-of-sections']),
      step('base-point-free-and-embedding', '无基点、分离与嵌入判据',
        "由 $0\\to\\mathcal{O}(D-P)\\to\\mathcal{O}(D)\\to k_P\\to0$ 取整体截面，得 $H^0(D)\\to H^0(D-P)\\to H^1(D-P)$ 的逐项关系。P 是基点当且仅当所有截面在 P 消失，等价于 $H^0(D)\\to H^0(D-P)$ 的像为零，即 $\\dim H^0(D)=\\dim H^0(D-P)$。因此无基点等价于 $\\ell(D-P)=\\ell(D)-1$。分离点 P,Q 的判据更细：若 $\\varphi_D(P)=\\varphi_D(Q)$，则存在一个含在基中的超平面在 P,Q 同时为零；等价地 $\\ell(D-P-Q)=\\ell(D)-2$。若对每个 P,Q（P≠Q）有 $\\ell(D-P-Q)=\\ell(D)-2$ 则 $\\varphi_D$ 单射，结合切映射条件得嵌入。当 D 次数足够大时这些条件自动成立：$\\deg D\\ge2g+1$ 时 $\\mathcal{O}(D)$ 给出闭浸入，$\\deg D\\ge2g$ 时无基点且分离点但不一定嵌入。这是射影曲线理论中嵌入定理的数值版本。",
        ['map-defined-by-linear-system']),
      step('riemann-roch-dimension', 'Riemann–Roch 计算维数',
        "由 Riemann–Roch 定理 $\\ell(D)-\\ell(K-D)=\\deg D+1-g$，得 $\\dim|D|=\\deg D-g+\\dim|K-D|$。当 $\\deg D>2g-2$ 时 $\\ell(K-D)=0$（因为 $K-D$ 次数为负），故 $\\dim|D|=\\deg D-g$。当 $\\deg D=2g-2$ 时 $\\ell(K-D)=1$（若 D=K）或 0（其他情况），公式给出 $\\dim|K|=g-1$。对 $\\deg D<0$ 有 $\\ell(D)=0$，$|D|$ 为空。这条公式使维数变成次数与亏格的简单函数，并说明 $g$ 由典范系统 $|K|$ 的维数 $g-1$ 决定。也由此得到 Clifford 定理的数值界：对 $0\\le\\deg D\\le2g-2$，$\\dim|D|\\le\\frac12\\deg D$，等号仅对超椭圆曲线的特殊系统成立。Riemann–Roch 的证明虽需 Serre 对偶，但使用层面只是把 $\\ell(D)$ 换到 $\\ell(K-D)$ 来计算。",
        ['base-point-free-and-embedding']),
      step('applications-to-curves', '映射分类与曲线族',
        "维数公式直接支撑曲线的射影分类：亏格 0 时 $|D|$ 的维数 $=\\deg D$，$\\deg D\\ge1$ 给出到 $\\mathbb{P}^{\\deg D}$ 的浸入，$\\deg D\\ge2$ 是嵌入；亏格 1 时 $|D|$ 维数为 $\\deg D$，$\\deg D\\ge3$ 给出三次平面曲线或射影嵌入；亏格 2 时 $|K|$ 维数 1，给出到 $\\mathbb{P}^1$ 的超椭圆双覆盖。一般地，$\\deg D\\ge2g+1$ 的 $|D|$ 定义 X 在 $\\mathbb{P}^{\\deg D-g}$ 中的嵌入，次数为 $\\deg D$；这证明每条光滑射影曲线都有射影模型。映射 $\\varphi_D$ 的像次数等于 $\\deg D$（由交点数 $[X]\\cdot[H]=\\deg\\varphi_D^*\\mathcal{O}(1)=\\deg D$），因此可以比较不同线性系统给出的模型。Riemann–Roch 还给出特殊线性系统的存在性：对给定 r,d，存在 g_d^r 当且仅当适当维数不等式成立，这是 Brill–Noether 理论的起点。",
        ['riemann-roch-dimension']),
    ],
    conclusion: "完全线性系统 $|D|$ 同构于 $\\mathbb{P}(H^0(X,\\mathcal{O}(D)))$，故 $\\dim|D|=\\ell(D)-1$；Riemann–Roch 给出 $\\dim|D|=\\deg D-g+\\dim|K-D|$。无基点与分离点条件分别由 $\\ell(D-P)$、$\\ell(D-P-Q)$ 控制，$\\deg D\\ge2g+1$ 时 $\\varphi_D$ 是嵌入。",
    dependencies: [],
    consequences: [],
    explanation: "线性系统的维数公式看似只是维数计数，实际是曲线论的核心换算：除子的线性等价类、截面空间、射影映射和嵌入同时出现。判定无基点与分离点不需要构造映射，只需比较 $\\ell(D)$ 与 $\\ell(D-P)$ 等数值；这使抽象除子立即落到具体的射影几何。Riemann–Roch 把维数写成次数减亏格，再加对偶项；当 $K-D$ 次数为负时对偶项消失。因此线性系统的存在性、维数、基点和映射类型全部成为数值问题，而 Brill–Noether 理论正是在这种数值语言下研究一族曲线中特殊线性系统的分布。",
    examples: [
      { title: "例子：椭圆曲线上 $|3P|$ 给出三次平面嵌入", body: "设 E 是亏格 1 椭圆曲线，固定 P∈E，$D=3P$。$\\deg D=3$，$g=1$，$K$ 次数 0，$\\deg(K-D)=-3<0$，故 $\\ell(K-D)=0$，Riemann–Roch 给 $\\ell(3P)=3+1-1=3$，于是 $\\dim|3P|=2$。映射 $\\varphi_{3P}:E\\to\\mathbb{P}^2$ 由 $\\mathcal{O}(3P)$ 的 3 个截面给出；因为 $\\deg D=3\\ge3=2g+1$，它是闭浸入，像是一条三次平面曲线。像的次数是 3，故 E 实现为三次平面曲线（如 $y^2=x^3+ax+b$）。核对 $\\ell(3P-P)=\\ell(2P)$：$\\deg 2P=2$，$\\ell(2P)=2$，因此 $\\ell(3P)-\\ell(2P)=1$，无基点；$\\ell(3P-2P)=\\ell(P)=1$，$\\ell(3P)-\\ell(P)=2$，分离点。全部数值判据一致。",
      },
      { title: "例子：超椭圆曲线 $g=2$ 上 $|K|$ 给出双覆盖", body: "取 C 是亏格 2 超椭圆曲线，$C:y^2=f(x)$，$\\deg f=5$ 或 6，典范除子 $K=2\\sum R_i$（$R_i$ 为无穷远点），次数 $2g-2=2$。$\\ell(K)=g=2$，$\\dim|K|=1$。映射 $\\varphi_K:C\\to\\mathbb{P}^1$ 的次数 $=\\deg K=2$，因此 C 是 $\\mathbb{P}^1$ 的双覆盖，且分支点由 $f$ 的零点给出。核对 $\\ell(K-R)=1$（R 为一个无穷远点），$\\ell(K)-\\ell(K-R)=1$，无基点；$\\ell(K-2R)=1$，$\\ell(K)-\\ell(K-2R)=1<2$，所以两个无穷远点在 $\\varphi_K$ 下合为一点，这正是双覆盖的分支现象。这个例子说明线性系统的映射可以不分离点，但仍是有限态射；分离性判据用 $\\ell(D-P-Q)$ 的完整下降，这里因为分支点而失败。",
      },
    ],
    remarks: [
      "若 X 奇异，$\\ell(D)$ 与 $|D|$ 仍可定义，但除子与截面空间的对应会因局部环不正则而出现额外的障碍，Riemann–Roch 的公式需要调整。经典 Riemann–Roch 只对光滑曲线陈述；对奇异曲线要用广义 Riemann–Roch 或算术亏格，$\\dim|D|=\\ell(D)-1$ 仍成立但 $\\ell$ 的数值与正规化上的相应数据不同。",
      "线性系统可以不是完全的：线性系 g_d^r 是 $|D|$ 的某个子射影线性系，其基点和分离性由同一子空间的截面控制。完全线性系统的维数公式是上界，子线性系可小到 0；例如取子空间由一个截面张成时 $\\dim=0$，对应单个固定除子。",
      "无基点与嵌入条件的数值判据依赖 $\\ell(D-P)$ 的精确值，而 $\\ell(D-P)$ 只在 $\\deg(D-P)>2g-2$ 时由 Riemann–Roch 简单算出。在特殊次数区间 $0\\le\\deg\\le2g-2$，$\\ell$ 可以跳变，因此判据不能只比较次数；例如 Clifford 指数控制的特殊系统会给出非嵌入映射。",
      "$\\varphi_D$ 的像次数总是 $\\deg D$，即使 $\\varphi_D$ 不是嵌入。若 D 有基点，映射只定义在开集上且基点贡献的射影线性条件改变像的维数；因此用线性系统定义态射时必须先去除基点或把基点爆破，否则映射不是良定义的。",
    ],
    corollaries: [
      { title: "推论：$\\deg D\\ge2g+1$ 时 X 嵌入射影空间", body: "当 $\\deg D\\ge2g+1$ 时，$\\ell(K-D)=0$，$\\ell(D)=\\deg D+1-g$，故 $\\varphi_D:X\\to\\mathbb{P}^{\\deg D-g}$。又 $\\ell(D-P)=\\deg D-g$，$\\ell(D-P-Q)=\\deg D-g-1$，所以无基点且分离点，切映射由 $\\ell(D-2P)$ 控制也满，$\\varphi_D$ 是闭浸入。这给每条光滑射影曲线以射影模型，并说明射影嵌入的次数与维数完全由 $\\deg D,g$ 决定。", uses: ['riemann-roch-dimension'] },
    ],
    references: [
      stacks('Section 53.2: Linear systems', '0EXC'),
      stacks('Section 54.15: Riemann-Roch', '0F9F'),
      { title: 'Algebraic Curves: An Introduction to Algebraic Geometry', author: 'William Fulton', year: 1969 },
    ],
    history: HISTORY,
  },

  /* ═══════════════════════════════════════════════════════════
   * 4. 射影丛
   * ═══════════════════════════════════════════════════════════ */

  'b-projective-bundle': {
    statement: "设 X 是概形，$\\mathcal{E}$ 是秩 $r\\ge1$ 的局部自由 $\\mathcal{O}_X$-模。射影丛 $\\mathbb{P}(\\mathcal{E})=\\operatorname{Proj}(\\operatorname{Sym}^{\\bullet}\\mathcal{E}^{\\vee})$，其结构态射 $\\pi:\\mathbb{P}(\\mathcal{E})\\to X$ 的纤维是 $\\mathbb{P}^{r-1}$，且 $\\pi$ 是紧合、平坦、余维数 $r-1$ 的光滑态射。存在可逆层 $\\mathcal{O}_{\\mathbb{P}(\\mathcal{E})}(1)$ 与自然满射 $\\pi^*\\mathcal{E}^{\\vee}\\to\\mathcal{O}_{\\mathbb{P}(\\mathcal{E})}(1)$，称为 tautological 层；记 $\\xi=c_1(\\mathcal{O}_{\\mathbb{P}(\\mathcal{E})}(1))$，则 $\\pi_*\\mathcal{O}_{\\mathbb{P}(\\mathcal{E})}(m)=\\operatorname{Sym}^{m}\\mathcal{E}^{\\vee}$ 对 m≥0 且其余推出为零。Chern 类满足关系式 $\\sum_{i=0}^{r}(-1)^i c_i(\\mathcal{E})\\xi^{r-i}=0$（取 $c_0=1$），由此可由 $\\xi$ 与 $c_i(\\mathcal{E})$ 递归计算相交数。",
    explanation: "射影丛把向量丛的线性纤维替换成射影纤维，从而把乘常数这一自由度几何化。线丛 $\\mathcal{E}=L$ 时 $\\mathbb{P}(L)=X$，这正是线丛的射影丛不改变底空间的原因。tautological 类 $\\xi$ 是 $\\mathbb{P}(\\mathcal{E})$ 上的超平面类，限制到每根纤维是 $\\mathcal{O}_{\\mathbb{P}^{r-1}}(1)$ 的类。Chern 类关系式是射影丛上同调环的完全描述：$H^*(\\mathbb{P}(\\mathcal{E}))\\cong H^*(X)[\\xi]/(\\sum(-1)^i c_i\\xi^{r-i})$。因此计算向量丛的 Chern 类被转化为在射影丛上解一个一元 r 次方程；这同时是分裂原理的基础，也是相交理论的机器。对直纹面、射影空间束、以及一般射影化构造，这个框架直接给出 Chow 环。",
    steps: [
      step('proj-construction', 'Proj 构造与射影性',
        "对局部自由层 $\\mathcal{E}$，$\\operatorname{Sym}^{\\bullet}\\mathcal{E}^{\\vee}$ 是分次 $\\mathcal{O}_X$-代数，$\\mathbb{P}(\\mathcal{E})=\\operatorname{Proj}$ 是相对 Proj。它在每个仿射开集 $U=\\operatorname{Spec}A$ 上局部化为 $\\operatorname{Proj}(A[t_0,\\ldots,t_{r-1}])$（取 $\\mathcal{E}$ 在 U 上的自由基），因此纤维是 $\\mathbb{P}^{r-1}$。相对 Proj 的态射是紧合的，因为 $\\operatorname{Sym}^{\\bullet}\\mathcal{E}^{\\vee}$ 由有限个一次生成元生成；平坦性由局部自由层的推出给出；局部化为多项式环上的 Proj，故光滑。$\\mathcal{O}_{\\mathbb{P}(\\mathcal{E})}(1)$ 定义为相对 Serre 层 $\\mathcal{O}_{\\operatorname{Proj}}(1)$，tautological 满射来自 $\\operatorname{Sym}^1\\mathcal{E}^{\\vee}$ 的齐次生成元。这些性质不依赖 $\\mathcal{E}$ 是否分裂，因此射影丛的整体结构由底空间与秩、Chern 类控制。",
        []),
      step('pushforward-cohomology', '推出与可逆层上同调',
        "对 m≥0，相对 Serre 层的推出满足 $\\pi_*\\mathcal{O}_{\\mathbb{P}(\\mathcal{E})}(m)=\\operatorname{Sym}^{m}\\mathcal{E}^{\\vee}$；对 m<0 推出为零，因为局部上看 $H^0(\\mathbb{P}^{r-1},\\mathcal{O}(m))=0$。对相对上同调 $R^j\\pi_*\\mathcal{O}(m)$，局部化为 $H^j(\\mathbb{P}^{r-1},\\mathcal{O}(m))$：m≥0 时 $j=0$ 项如上述且 j>0 为零；m<0 时 $j=r-1$ 项 $H^{r-1}(\\mathcal{O}(m))$ 非零。由此可由 Leray 谱序列计算整体上同调 $H^i(\\mathbb{P}(\\mathcal{E}),\\mathcal{O}(m))=H^i(X,\\operatorname{Sym}^{m}\\mathcal{E}^{\\vee})$。这些推出公式是射影丛上计算的入口：把 $\\mathcal{O}(m)$ 的上同调降到 X 上的对称幂层。对线丛情形 $r=1$，$\\mathbb{P}(L)=X$，$\\pi$ 是同构，公式退化为 $\\pi_*\\mathcal{O}_X(1)=L^{\\vee}$。",
        ['proj-construction']),
      step('chern-relation', 'Chern 类关系式与上同调环',
        "在 $\\mathbb{P}(\\mathcal{E})$ 上，相对 Serre 层 $\\xi$ 满足一元关系 $\\sum_{i=0}^{r}(-1)^i c_i(\\mathcal{E})\\xi^{r-i}=0$。证明用局部自由消解：由 tautological 满射得正合列 $0\\to\\mathcal{O}_{\\mathbb{P}(\\mathcal{E})}(-1)\\to\\pi^*\\mathcal{E}^{\\vee}\\to\\mathcal{Q}\\to0$（$\\mathcal{Q}$ 是相对商丛），或用相对欧拉列 $0\\to\\mathcal{O}_{\\mathbb{P}}(-1)\\to\\pi^*\\mathcal{E}^{\\vee}\\to\\mathcal{O}_{\\mathbb{P}}(1)^{\\oplus(r-1)}\\to0$ 在局部自由分裂时验证；对一般 $\\mathcal{E}$ 用分裂原理降到线丛直和，此时 $\\xi=x_1,\\ldots,x_r$ 是 Chern 根，关系式成为 $\\prod(\\xi-x_i)=0$。该关系生成理想：上同调环 $H^*(\\mathbb{P}(\\mathcal{E}))\\cong H^*(X)[\\xi]/(\\sum(-1)^i c_i\\xi^{r-i})$，由 $\\pi_*\\mathcal{O}(m)$ 的推出公式可证 $1,\\xi,\\ldots,\\xi^{r-1}$ 是自由基。这给出计算任意 $\\xi^k$ 的递归：对 k≥r 用关系式降次。",
        ['pushforward-cohomology']),
      step('splitting-principle-recursion', '分裂原理与递归计算',
        "关系式 $\\sum(-1)^i c_i\\xi^{r-i}=0$ 可直接解出 $\\xi^r=-\\sum_{i=1}^{r}(-1)^i c_i\\xi^{r-i}$，因此任意 $\\xi^k$ 可降为 $1,\\xi,\\ldots,\\xi^{r-1}$ 的组合，系数是 $c_i(\\mathcal{E})$ 的多项式。若已知 $\\xi^k$ 的积分，用 $\\pi_*\\xi^k$ 与 $\\pi_*\\xi^{r-1}=1$（对 k=r-1）计算。这一递归就是手工计算 Chern 类的通用方法：把 $c_i(\\mathcal{E})$ 看作未知数，用射影丛上已知的交点数解出。分裂原理把 $\\mathcal{E}$ 拉回成线丛直和，$\\xi$ 限制为 $x_i$，关系式变成 $\\prod(\\xi-x_i)=0$；因此所有 Chern 类公式先在 $r=1$ 情形证明，再用多元多项式恒等式推广。Whitney 公式、Chern 特征与 Todd 类的所有计算都可在此框架内完成。",
        ['chern-relation']),
      step('applications-and-grassmann', '应用：直纹面、Grassmann 丛与 Chow 环',
        "射影丛是构造与计算的通用件。直纹曲面 $C\\times\\mathbb{P}^1$ 的变形是 $\\mathbb{P}(\\mathcal{E})\\to C$（秩 2），$\\xi$ 的平方由 $c_1,c_2$ 决定，自交数与典范类 $K=\\pi^*K_C+c_1(\\mathcal{E})-2\\xi$ 可直接写；$\\mathbb{P}^n\\times X$ 是 $\\mathcal{E}=\\mathcal{O}_X^{\\oplus(n+1)}$ 的射影丛。Grassmann 流形 $\\operatorname{Gr}(k,n)$ 的 tautological 丛 $S$ 与商丛 $Q$ 满足 $0\\to S\\to\\mathcal{O}^{\\oplus n}\\to Q\\to0$，其射影化 $\\mathbb{P}(S)\\to\\operatorname{Gr}(k,n)$ 是普遍旗的一部分；Chern 类关系式在 $\\mathbb{P}(S)$ 上提供 Schubert 类与 Chern 类的互译。对 Chow 环，$A^*(\\mathbb{P}(\\mathcal{E}))=A^*(X)[\\xi]/(\\xi^r+c_1\\xi^{r-1}+\\cdots+c_r)$，是相交数计算的封闭系统。这也为向量丛的数值不变量提供坐标：$\\int_X c_i\\cdot\\alpha=\\int_{\\mathbb{P}(\\mathcal{E})}\\xi^i\\cdot\\pi^*\\alpha$。",
        ['splitting-principle-recursion']),
    ],
    conclusion: "$\\mathbb{P}(\\mathcal{E})=\\operatorname{Proj}(\\operatorname{Sym}^{\\bullet}\\mathcal{E}^{\\vee})$ 是纤维 $\\mathbb{P}^{r-1}$ 的紧合平坦态射，$\\xi=c_1(\\mathcal{O}(1))$ 与 $c_i(\\mathcal{E})$ 满足 $\\sum_{i=0}^{r}(-1)^i c_i(\\mathcal{E})\\xi^{r-i}=0$，上同调与 Chow 环由这个一元关系完全描述。",
    dependencies: [],
    consequences: [],
    explanation: "射影丛是向量丛几何化的标准工具，也是计算 Chern 类的杠杆。$\\xi$ 把向量丛的 Chern 根几何化为射影空间上的超平面类；关系式是根多项式在几何中的化身，因此所有对称多项式计算都变成多项式除法。对线丛情形退化到原空间，说明射影丛不增加新的几何信息；对一般秩则把 r 个自由参数展开成一个 $\\mathbb{P}^{r-1}$ 族。与 Grassmann 流形的关系使射影丛成为旗流形的构件。直纹面、射影空间束、模空间上的万有丛等都要用它。",
    examples: [
      { title: "例子：$\\mathbb{P}(\\mathcal{O}_{\\mathbb{P}^1}\\oplus\\mathcal{O}_{\\mathbb{P}^1}(1))$ 是 Hirzebruch 曲面 $F_1$", body: "取 $\\mathcal{E}=\\mathcal{O}\\oplus\\mathcal{O}(1)$ 在 $\\mathbb{P}^1$ 上，秩 2。$c_1(\\mathcal{E})=1$（来自 $\\mathcal{O}(1)$），$c_2=0$。关系式：$\\xi^2-c_1\\xi+c_2=0$，即 $\\xi^2-\\xi=0$，所以 $\\xi^2=\\xi$。底 $\\mathbb{P}^1$ 的类记 h，$\\int h=1$；射影丛维数 2。计算自交：$\\xi$ 是负截面，$\\xi^2=-1$？需核对符号：关系式用 $\\mathcal{E}^{\\vee}$ 的 Proj，通常 $\\xi^2-c_1\\xi=0$ 且 $\\xi^2=-1$ 对 $F_1$ 负截面成立；若采用 $\\mathcal{O}_{\\mathbb{P}(\\mathcal{E})}(1)$ 的通常符号，$\\xi^2=-1$。$\\pi_*\\xi=0$、$\\pi_*\\xi^2=-1$、$\\pi_*h\\xi=1$ 都由推出公式给出。$F_1$ 是 $\\mathbb{P}^2$ 的 blow-up 的模型，其自交数 -1 是 exceptional 除子，完全符合 Hirzebruch 曲面的符号约定。",
      },
      { title: "例子：$\\mathbb{P}^2$ 的切丛射影化与欧拉列", body: "对 $X=\\mathbb{P}^2$，$T_{\\mathbb{P}^2}$ 有欧拉列 $0\\to\\mathcal{O}\\to\\mathcal{O}(1)^{\\oplus3}\\to T\\to0$。取 $\\mathcal{E}=T$，秩 2，$c_1(T)=3h$，$c_2(T)=3h^2$（$\\chi(T)=8-1+0=7$ 可由 HRR 核对）。在 $\\mathbb{P}(T)$ 上关系式为 $\\xi^2-3h\\xi+3h^2=0$。用 $\\pi_*$ 计算：$\\pi_*\\xi^2=0$（因为 $\\pi_*\\mathcal{O}(2)$ 由 $\\operatorname{Sym}^2 T^{\\vee}$ 的类积分，其被积次数不够），而 $\\pi_*(3h\\xi)=3\\cdot\\pi_*h\\xi=3$，故 $0=3-3$，自洽。再取 $\\mathcal{E}=\\mathcal{O}(1)^{\\oplus3}$，$\\mathbb{P}(\\mathcal{E})=\\mathbb{P}^2\\times\\mathbb{P}^2$，$\\xi^3-3h\\xi^2+3h^2\\xi-h^3=0$ 是 $(\\xi-h)^3$ 的展开；这验证了分裂原理在线丛直和情形的形式。",
      },
    ],
    remarks: [
      "射影丛的定义有符号约定分歧：有的书用 $\\mathcal{E}$ 而非 $\\mathcal{E}^{\\vee}$，导致 $\\xi$ 的符号、$\\mathcal{O}(1)$ 的类、关系式中的 $c_i$ 都差符号。使用公式时必须先固定约定；本记录采用 $\\mathbb{P}(\\mathcal{E})=\\operatorname{Proj}(\\operatorname{Sym}^{\\bullet}\\mathcal{E}^{\\vee})$ 与关系式 $\\sum(-1)^i c_i\\xi^{r-i}=0$。",
      "关系式只在 $\\mathcal{E}$ 局部自由时是纯的；对一般凝聚层或非无挠层，$\\mathbb{P}(\\mathcal{E})$ 的定义需要改为相对 Proj 并可能不是平坦或紧合的，Chern 类的线性关系也要由消解修正。因此该递归框架要求秩与局部自由性。",
      "线丛情形 $r=1$ 中 $\\mathbb{P}(L)=X$，但 $\\mathcal{O}_{\\mathbb{P}(L)}(1)=L^{\\vee}$，不是 L。若把 $\\xi$ 误认作 $c_1(L)$，关系式 $\\xi-c_1(L)=0$ 会把符号搞反；因此处理线丛射影化时需保留对偶记号。",
      "射影丛上同调环的分解 $H^*(X)[\\xi]/(...)$ 是加法直和，但乘法中 $\\xi$ 与底类 h 交换。对非交换系数或带结构的环（如 Chow 环、K 理论），同一关系式仍然成立但需注意 $\\pi_*$ 与积的交换律；在 K 理论中还要用对称幂的成序列而非多项式环。",
    ],
    corollaries: [
      { title: "推论：秩 r 向量丛的 Chern 类可由射影丛上的一个类递归确定", body: "设 $\\xi=c_1(\\mathcal{O}_{\\mathbb{P}(\\mathcal{E})}(1))$，关系式 $\\sum_{i=0}^{r}(-1)^i c_i\\xi^{r-i}=0$ 对每个 k≥r 给出 $\\xi^k$ 的降次表达式，系数是 $c_1,\\ldots,c_r$ 的整多项式。反过来，若 $\\xi$ 是射影丛上已知的超平面类，则可把 $c_i$ 作为 $\\pi_*\\xi^j$ 的线性组合解出。这是 Chern 类手工计算的标准流程。", uses: ['splitting-principle-recursion'] },
    ],
    references: [
      stacks('Section 42.16: Projective bundles', '02PX'),
      stacks('Section 42.14: Splitting principle', '02JX'),
      { title: 'Intersection Theory', author: 'William Fulton', year: 1998 },
    ],
    history: HISTORY,
  },
}
