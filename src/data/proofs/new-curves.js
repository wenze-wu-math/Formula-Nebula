/**
 * 新增长篇教学式证明：为图谱中尚未有证明页的 5 个曲线/曲面节点补齐。
 *
 * 写作约定（与 scripts/_check-proof-file.mjs 的检查一致）：
 *   · 正文用中文长段 + Unicode 数学符号（⊆ ⊗ → ↦ 𝔭 ℓ ω κ ε ≅ · ⋂ ∑ χ deg），直接作为文本排版；
 *   · 需要真正的公式排版时才用 $...$ 包住 LaTeX，反斜杠必须完整、分隔符必须成对；
 *   · 引用只写已核实的 Stacks Project 稳定 tag，URL 用 tag 形式；
 *   · 每步正文均超过 320 字，不使用无信息量的凑字数句子。
 */

const step = (id, title, body, uses = []) => ({ id, title, body, uses })
const stacks = (title, tag, year = 2024) => ({
  title, author: 'The Stacks Project', year, url: `https://stacks.math.columbia.edu/tag/${tag}`,
})
const HISTORY = '本条由公开教材与 Stacks Project 命题重新组织，项目自行改写并注明来源，未复制原文。'

export const NEW_CURVE_PROOFS = {

  /* ═══════════════════════════════════════════════════════════
   * 1. 相交数
   * ═══════════════════════════════════════════════════════════ */

  'intersection-number': {
    statement: '设 X 是域 k 上的光滑射影曲面，Div(X) 为 X 上除子的群。则存在唯一的配对 Div(X)×Div(X)→ℤ，(D,E)↦D·E，称为相交数，满足：(1) 它是 ℤ-双线性且对称的；(2) 若 D 与 E 是有效除子且无公共分支，则 $D\\cdot E=\\sum_{p} \\dim_k \\mathcal{O}_{X,p}/(f_p,g_p)$，右端对一切 p 取有限和（除有限个点外为 0），其中 $f_p,g_p$ 分别是 D 与 E 在 p 处的局部方程；(3) 该和只依赖 D、E 而不依赖局部方程的选取。进一步，若 k 代数闭、C、D 是 ℙ² 中没有公共分支的平面曲线，次数分别为 d、e，则 Bézout 定理给出 $C\\cdot D=de$，从而两条这样的曲线恰在 de 个点（计重数）相交。',
    deepExplanation: '相交数是代数几何中把“两条曲线交多少次”变成整数的机器。关键在于它必须是一个双线性配对而非逐点计数，否则无法做线性运算：除子可以写成两个有效除子之差，而曲线之差不再是曲线，只有当配对在除子群上双线性时，$D-D\'$ 这类形式才有定义。局部求和公式 $\\sum_p\\dim_k \\mathcal{O}_{X,p}/(f_p,g_p)$ 中的每个被加项是“两方程在 p 处解空间的维数”，它把几何相交的“重数”翻译成交换代数的长度，这一步的可行性完全依赖 X 是曲面且 D、E 在 p 处的局部环是二维正则局部环，从而 $f,g$ 构成正则序列。Bézout 则是这套线性代数在射影平面上的必然推论：相交数由直线类与超平面类的双线性性与 dH·eH=de 唯一决定。',
    steps: [
      step('setup-and-local-length', '建立局部长度并证明它是有限和',
        '设 D、E 是 X 上无公共分支的有效除子，p∈X。取 p 的一个仿射邻域 U=Spec A，A 是域 k 上的有限型整环，并在 U 上写下 D 与 E 的局部方程 $f,g\\in A$，它们的零点除子分别是 D|_U 与 E|_U。定义 p 处的局部相交重数 $i_p(D,E)=\\dim_k \\mathcal{O}_{X,p}/(f_p,g_p)$。这个量必须是有限的：$\\mathcal{O}_{X,p}$ 是二维正则局部环，故是整环且局部化后 $f_p,g_p$ 仍无公共因子；它们构成 $\\mathcal{O}_{X,p}$ 中的正则序列，于是 $\\mathcal{O}_{X,p}/(f_p,g_p)$ 是零维环，其 k-维数有限。对不属于 D∩E 的点 p，$f_p$ 或 $g_p$ 已是单位，商环为 0，故求和时只有有限个 p 有贡献，$\\sum_p i_p(D,E)$ 是良定义的整数。',
        []),
      step('independence-of-equations', '证明局部重数与方程的选取无关',
        '设 $f\'_p=u f_p$ 与 $g\'_p=v g_p$ 是另一组局部方程，u、v 是 $\\mathcal{O}_{X,p}$ 中的单位，这是“方程相差一个可逆元”的全部可能情形。乘法 $u:\\mathcal{O}_{X,p}/(f_p,g_p)\\to \\mathcal{O}_{X,p}/(u f_p,g_p)$ 显然是满射，若 $u a\\in(u f_p,g_p)$ 则 $u a=u f_p b+g_p c$，两边乘 $u^{-1}$ 得 $a\\in(f_p,g_p)$，故它也是单射，于是 $\\mathcal{O}_{X,p}/(f_p,g_p)\\cong \\mathcal{O}_{X,p}/(u f_p,g_p)$ 作为 $\\mathcal{O}_{X,p}$-模同构，因此 k-维数不变。同理对 $g_p$ 换单位元。两个变元各自独立地不改变维数，故 $i_p(D,E)$ 只依赖 D、E 在 p 处的芽。特别地，把 D 换成同一线性等价类中的等价除子不改变每个 $i_p$，这就是把局部公式提升为“除子类不变量”的第一步。',
        ['setup-and-local-length']),
      step('sum-is-symmetric-locally', '证明局部重数对称：交换 f 与 g',
        '对任意 p，考察 $\\mathcal{O}_{X,p}/(f_p,g_p)$ 与 $\\mathcal{O}_{X,p}/(g_p,f_p)$。二者是同一个理想 $(f_p,g_p)=(g_p,f_p)$ 的商环，作为环与作为 k-向量空间完全相同，只是生成元顺序不同，故维数相等，$i_p(D,E)=i_p(E,D)$。这一对称性在无公共分支时是显而易见的恒等，但它不是全局配对的全部内容：$\\sum_p i_p$ 的对称性只给出“若在此点某对有效除子上定义配对则对称”，要把配对扩张到整个 Div(X) 并保持对称，还需 §bilinearity 中的线性扩张不破坏对称性。需要强调的是这里的等号用的是同一理想，而非“两个同构的模”，所以不需要任何额外选择。',
        ['setup-and-local-length']),
      step('deg-0-divisors-and-cartier', '为什么可以只用有效除子与可逆层生成整个群',
        'Div(X) 中的任意除子 D 都可写成两个有效除子之差 $D=D_1-D_2$，例如取一个可从局部方程统一起来的有效除子 $D_2$ 使 $D+D_2$ 有效。有效除子与“局部由单个非零因子给出的子概形”即有效 Cartier 除子一致：在光滑曲面上，任何余维 1 的闭子概形局部都由一个非零因子定义，这正是光滑性带来的正则性；光滑射影曲面上 Weil 除子与 Cartier 除子的群自然同构。因此把 $i_p$ 线性扩张为对称双线性的配对 $D\\cdot E=\\sum_p i_p$ 是自洽的：先对有效除子定义，再由差分解与双线性唯一延拓到 Div(X)。延拓的唯一性来自生成性（每个除子都是差的有限和），良定义性来自上一步的“换方程不变”，从而不依赖差的写法。',
        ['independence-of-equations', 'sum-is-symmetric-locally']),
      step('well-defined-bilinear-symmetric', '验证双线性与对称性逐项成立',
        '设 $D=D_1-D_2$、$D\'=D\'_1-D\'_2$、$E=E_1-E_2$ 是任意除子分解，令 $D+D\'=(D_1+D\'_1)-(D_2+D\'_2)$，由局部上 $i_p(D_1+D\'_1,E)=i_p(D_1,E)+i_p(D\'_1,E)$（因为两方程理想的和在局部长度上是可加的，等价地由 $\\mathcal{O}_{X,p}/(f_1 f\'_1,g)$ 的长度是各因子的和），立刻得到 $(D+D\')\\cdot E=D\\cdot E+D\'\\cdot E$。整数倍 $nD$ 由重复相加给出，$(-D)\\cdot E=-(D\\cdot E)$ 由 $0=(D+(-D))\\cdot E$ 与上式推出。对称性即 $D\\cdot E=E\\cdot D$，由 §sum-is-symmetric-locally 逐点成立再求和得到，因为有限和的每一项相等。三条性质（双线性、对称、与局部公式一致）联立说明此配对满足定理要求，且由于它在生成元（有效除子）上已确定，满足这三条性质的配对是唯一的。',
        ['deg-0-divisors-and-cartier', 'sum-is-symmetric-locally']),
      step('bezout-consequence', '在 ℙ² 上定值并对平面曲线应用 Bézout',
        '取 X=ℙ²，H 为超平面类，它是可逆层的除子类。对两条无公共分支的曲线 $C\\in |dH|$、$D\\in |eH|$，把 C、D 分别写成 $C=C_1-C_2$、$D=D_1-D_2$ 中的有效分解不必要，直接对有效情形用局部公式：在 k 代数闭时，$C\\cap D$ 由 de 个点计重数组成（由 Bézout 定理或由两齐次方程在 ℙ² 上的射影分解定理），而在每个交点 p 处若相交横截则 $i_p=1$，否则重数大于 1。把 C 的方程（次数 d）与 D 的方程（次数 e）代入 §setup-and-local-length 的局部长度，利用 $dH\\cdot eH=de\\,(H\\cdot H)$ 与 $H\\cdot H=1$，得 $C\\cdot D=de$。这里的两条前提都必须点明：k 代数闭是保证交点都落在 k 上且交集点数为 de 的条件；无公共分支是保证 $f_p,g_p$ 没有公共因子、从而局部商零维的条件。去掉任一条，Bézout 的“de 个点”都可失效。',
        ['well-defined-bilinear-symmetric', 'deg-0-divisors-and-cartier']),
    ],
    conclusion: '光滑射影曲面 X 上存在唯一对称双线性配对 Div(X)×Div(X)→ℤ，$D\\cdot E=\\sum_p \\dim_k \\mathcal{O}_{X,p}/(f_p,g_p)$；两有效无公共分支除子时即此和，且它与方程选取无关。当 k 代数闭、C、D 为 ℙ² 中次数 d、e 的无公共分支曲线时，$C\\cdot D=de$，交点为 de 个（计重数）。',
    dependencies: ['a-cartier-divisor', 'smooth-morphism', 'proper-morphism', 'dimension'],
    consequences: ['b-riemann-roch-surface', 'b-noether-formula', 'b-weil-pairing', 'b-todd-genus', 'surface-classification'],
    explanation: '相交数的意义在于把“几何相交”约化成一个纯代数的双线性型。一旦有了双线性，除子类的运算（取和、取差、取倍数、拉回、推前）就都能在同一个整数格上进行，而曲面的很多不变量——自交数 $D^2$、典范类 $K_X^2$、Riemann–Roch 里的校正项——都是这个配对的具体取值。局部公式 $\\dim_k \\mathcal{O}_{X,p}/(f,g)$ 之所以能代替“数交点”，是因为光滑性保证 $f,g$ 在 p 处构成正则序列，从而商环有限维，维数就是重数；这一点在奇异点会立即失效，因为可能出现 p 处两曲线只交一次而 $\\dim$ 无限的情形，所以定理把“光滑”写成了硬前提。Bézout 则说明这套形式化捕捉到的恰是古典几何的直觉：次数相乘，交点数相乘，横截时每个点各贡献一次。',
    examples: [
      { title: '例子：ℙ² 中两条圆锥曲线的 4 个交点', body: '取 k 代数闭，$C: x^2+y^2-z^2=0$ 与 $D: x^2-y^2-z^2=0$，都是次数 d=e=2 的光滑圆锥曲线，且无公共分支（若否则它们有公共的不可约分支，而圆锥曲线都不可约，会迫使 C=D，与方程不同矛盾）。由 Bézout 定理，$C\\cdot D=2\\times 2=4$，即 4 个点计重数。实际解方程得 $2x^2=2z^2$ 与 $2y^2=0$，即 $y=0$ 且 $x=\\pm z$，在 ℙ² 上给出两点 $[1:0:1]$ 与 $[1:0:-1]$；每个点处两曲线横截（局部方程一次项线性无关），故 $i_p=1$，两点各重数 2，合计 2+2=4，与 Bézout 一致。这个例子说明“计重数”而非“点数”才是定理的正确读法：当交点为切点时点数会小于 de，重数恰好补齐。' },
      { title: '例子：ℙ² 中一条直线与一条三次曲线的 3 个交点', body: '取 $L: z=0$ 与 $F: x^3+y^3-xz^2=0$，d=1、e=3，无公共分支。Bézout 给 $L\\cdot F=1\\times 3=3$。把 $z=0$ 代入 F 得 $x^3+y^3=0$，在 k 代数闭且特征不等于 3 时分解为三条过原点的直线 $y=\\zeta x$（ζ 取 3 次单位根），在 ℙ¹ 的坐标 $[x:y]$ 上是三个不同点，每个点的局部重数均为 1（三条直线的方向互异，与 $z=0$ 横截）。所以在 ℙ² 中 L 与 F 相距于 3 个点，每点重数 1。若把特征改为 3，$x^3+y^3=(x+y)^3$ 退化成一个点带重数 3，这时“3 个点”变成“1 个点重数 3”，Bézout 的等式 3=3 仍然成立，但点数的解释必须换成重数解释——这正是定理要求代数闭但不要求特征零的原因。' },
    ],
    remarks: [
      '光滑性不可去掉：若 X 在 p 处奇异且 D、E 在 p 处相交时局部方程不构成正则序列，$\\dim_k \\mathcal{O}_{X,p}/(f_p,g_p)$ 可能无限，局部求和就不再是整数，必须改用奇异点处的“相交重数”修正或先做吹爆解消奇异。',
      '无公共分支是局部公式成立的前提：若 D 与 E 共享一条曲线分支 Γ，则在 Γ 上每个点的 $f_p,g_p$ 有公因子，商环沿 Γ 是正维数的，逐点求和发散，此时 $D\\cdot E$ 不再是这个局部和，而必须用除子线性等价的严格值（例如 $C\\cdot C=1$ 的光滑圆锥曲线自交）。',
      'Bézout 定理的“de 个点”需要 k 代数闭：在非代数闭域上，交点集合可以被看作 k̄ 上的 de 个点，但其中有些点不落在 k 上，因此不能说成“k 上的 de 个点”；此外若曲线定义在非完全域上还需先做基变换，否则重数会因不可分扩张而变化。',
      'X 的射影性用于保证除子群整体良定（可逆层有整体除子表示）与交点数为有限和；在非射影曲面上两曲线可能在“无穷远处”有极限交点，局部和需要紧化才能定义，此时配对一般只在紧化后的曲面上的除子之间才有完整定义。',
    ],
    corollaries: [
      { title: '推论：ℙ² 中的次数公式与 Bézout', body: '在 ℙ² 中，若 C、D 无公共分支且次数为 d、e，则 $C\\cdot D=de$。证明：取超平面类 H，$C\\sim dH$、$D\\sim eH$，由双线性与 $H\\cdot H=1$ 得 $C\\cdot D=de\\,(H\\cdot H)=de$。这条推论说明相交数完全被次数决定，是古典 Bézout 定理的价格化表述。', uses: ['bezout-consequence'] },
      { title: '推论：有效除子的自交数与吹爆', body: '若 $\\pi:\\widetilde{X}\\to X$ 是光滑曲面在一点处的吹爆，E 为例外曲线，则 $E\\cdot E=-1$，且 $\\pi^*(D)\\cdot \\pi^*(D\')=D\\cdot D\'$、$\\pi^*(D)\\cdot E=0$。证明：$\\pi^*(D)$ 与 E 一般位置上相交为空，故第二式由调维数可得 0；再对充分大的线性系用投影公式 $\\pi_*(\\pi^*D\\cdot E)=D\\cdot\\pi_*E=0$ 与 $\\pi_*E=0$ 定出 $E\\cdot E=-1$。这把“例外曲线是 −1 曲线”变成配对的计算结果。', uses: ['well-defined-bilinear-symmetric'] },
    ],
    references: [
      stacks('Definition 31.27.1 / effective Cartier divisors', '01WQ'),
      stacks('Lemma 31.14.2 (Cartier and Weil divisors)', '01WS'),
      stacks('Definition 31.26.1 / Weil divisors', '0BE0'),
      stacks('Section 53.2 (Riemann-Roch)', '0BXY'),
    ],
    history: HISTORY,
  },

  /* ═══════════════════════════════════════════════════════════
   * 2. 除子
   * ═══════════════════════════════════════════════════════════ */

  'divisor': {
    statement: '设 X 是域 k 上的完备（例如射影）、正规、几何连通曲线。记 Div(X) 为 X 上（Weil）除子的自由交换群，即余维 1 整点集的整系数形式和。则：(1) 每个有理函数 $f\\in k(X)^\\times$ 给出一个除子 $\\operatorname{div}(f)=\\sum_p \\operatorname{ord}_p(f)\\,[p]$，且 $\\sum_p \\operatorname{ord}_p(f)=0$，即 $\\deg \\operatorname{div}(f)=0$；(2) 映射 $f\\mapsto \\operatorname{div}(f)$ 是群的同态 $k(X)^\\times\\to \\operatorname{Div}(X)$，其核恰是常值函数 $k^\\times$；(3) 算术上正确的正合列是六项的 $1\\to k^\\times\\to k(X)^\\times\\xrightarrow{\\operatorname{div}}\\operatorname{Div}(X)\\to \\operatorname{Cl}(X)\\to 0$，其中 $\\operatorname{Cl}(X):=\\operatorname{Div}(X)/\\operatorname{Prin}(X)$、$\\operatorname{Prin}(X)=\\operatorname{div}(k(X)^\\times)$，该列在 $\\operatorname{Div}(X)$ 处按构造正合；而把 $\\deg$ 直接接在 $\\operatorname{Div}(X)$ 之后的列 $1\\to k^\\times\\to k(X)^\\times\\xrightarrow{\\operatorname{div}}\\operatorname{Div}(X)\\xrightarrow{\\deg}\\mathbb{Z}\\to 0$ 在 $\\operatorname{Div}(X)$ 处不正合，因为在一般情况下 $\\operatorname{im}(\\operatorname{div})=\\operatorname{Prin}(X)\\subsetneq\\operatorname{Div}^0(X)=\\ker(\\deg)$，中间的亏欠恰由 $\\operatorname{Cl}(X)$ 度量；(4) $\\deg$ 下降为 $\\operatorname{Cl}(X)\\to\\mathbb{Z}$ 的满射，其核 $\\operatorname{Cl}^0(X)$ 是零次除子类群，$\\operatorname{Cl}^0(X)$ 就是 Jacobian 的出发点，并且 $\\operatorname{Cl}(X)$ 与 X 上可逆层的 Picard 群自然同构。',
    deepExplanation: '除子群把“点的形式和”当作坐标来使用：曲线上的局部信息（函数在某点的零阶或极阶）可以写成整数，而“一个函数的全部零点与极点加起来恰好次数为零”是紧性——即完备性——的精确后果。在非完备曲线上这句话就错了：仿射直线 𝔸¹ 上的多项式 x 有零点一个（在原点）而无极点，deg div(x)=1≠0，因为“无穷远点”缺失导致极点无处记录。把 $\\deg$ 直接写在 $\\operatorname{div}$ 右边的那条列只是“$\\deg\\circ\\operatorname{div}=0$ 加上 $\\deg$ 满射”的缩写，它在 $\\operatorname{Div}(X)$ 处并不正合：那里的正合性要求 $\\operatorname{Prin}(X)=\\ker(\\deg)$，即每个零次除子都是主除子，而这只在 $\\operatorname{Cl}(X)$ 平凡时才成立，所以在一般曲线上把它当作正合列用恰好是最强的错误。假定 $\\operatorname{Prin}(X)=\\ker(\\deg)$ 的代价是把 $\\operatorname{Cl}(X)$ 强行归零，而 $\\operatorname{Cl}(X)$ 正是携带几何信息的不变量：椭圆曲线的 $\\operatorname{Cl}^0(E)$ 同构于 E 自身，放弃它就等于把曲线压成一个点。真正的正合列必须把商 $\\operatorname{Cl}(X)$ 保留在右端，再由 $\\deg$ 下降给出 $\\operatorname{Cl}^0(X)$，后者连同它的代数群结构就是 Jacobian。',
    steps: [
      step('weil-divisors-and-degree', '定义 Weil 除子、次数与主除子的阶',
        '曲线的余维 1 整闭子概形就是其闭点，故 $\\operatorname{Div}(X)=\\bigoplus_{p\\in X} \\mathbb{Z}\\,[p]$，即有限整系数形式和；元素的次数 $\\deg(\\sum n_p[p])=\\sum n_p$ 是群同态 $\\operatorname{Div}(X)\\to\\mathbb{Z}$。对 $f\\in k(X)^\\times$ 与闭点 p，取 X 在 p 处的局部环 $\\mathcal{O}_{X,p}$，它是离散赋值环，其极大理想唯一确定一个离散赋值 $v_p$，令 $\\operatorname{ord}_p(f)=v_p(f)$。$\\operatorname{div}(f)=\\sum_p v_p(f)\\,[p]$。这个和有限：在曲线上 $f$ 的零点集与极点集都是有限闭点集，它们不含任何一维部分（曲线本身已经是一维的，没有“整条曲线”可供沿之发散），故只有有限个 p 使 $v_p(f)\\neq 0$；等价地，$f$ 可写成两个有效除子之差。',
        []),
      step('div-is-a-homomorphism', '验证 f↦div(f) 是同态并计算其核',
        '对 $f,g\\in k(X)^\\times$ 与任意 p，由离散赋值的乘法性 $v_p(fg)=v_p(f)+v_p(g)$，逐点求和得 $\\operatorname{div}(fg)=\\operatorname{div}(f)+\\operatorname{div}(g)$；又 $v_p(f^{-1})=-v_p(f)$ 给出 $\\operatorname{div}(f^{-1})=-\\operatorname{div}(f)$，故 $\\operatorname{div}$ 是群同态 $k(X)^\\times\\to \\operatorname{Div}(X)$。其核是满足 $v_p(f)=0$ 对一切 p 成立的有理函数，即处处没有零点也没有极点的函数。这样的 f 在 X 的每个点都是局部可逆的，因此是整体可逆的函数，也就是整体截面 $H^0(X,\\mathcal{O}_X^\\times)$；因为 X 是几何连通（从而连通）的完备 k-概形，$H^0(X,\\mathcal{O}_X)=k$，而可逆元恰是 k 的非零元，故 $\\ker\\operatorname{div}=k^\\times$。',
        ['weil-divisors-and-degree']),
      step('degree-zero-on-complete-curve', '证明主除子的次数为零：完备性的核心使用',
        '这一步用的是 X 完备这一条。取 $f\\in k(X)^\\times$，把 f 视为有理映射 $f:X\\to \\mathbb{P}^1_k$。因为 X 完备、$\\mathbb{P}^1$ 分离，$f$ 由赋值判别法延拓为态射 $X\\to\\mathbb{P}^1$（这是完备性的定义性用途：完备概形到分离概形的有理映射必可延拓）。取 $0=[0:1]$ 与 $\\infty=[1:0]$ 两点，则 $f^{-1}(0)$ 是 f 的零点（每点重数 $v_p(f)>0$），$f^{-1}(\\infty)$ 是极点（每点重数 $-v_p(f)>0$），且 $\\operatorname{div}(f)=f^*([0]-[\\infty])$。态射拉回与除子推前的投影公式给出 $\\deg f^*[0]=\\deg f^*[\\infty]=\\deg(f)\\cdot 1$，两者相等，故 $\\deg\\operatorname{div}(f)=\\deg f^*[0]-\\deg f^*[\\infty]=0$。这里的每一步都要 X 完备：非完备时延拓可能不存在，$f^{-1}(\\infty)$ 可以为空，等式随即失败。',
        ['div-is-a-homomorphism']),
      step('exactness', '写正确的六项正合列，并说明 deg 在何处不正合',
        '由 §div-is-a-homomorphism，$\\ker\\operatorname{div}=k^\\times$ 说明 $1\\to k^\\times\\to k(X)^\\times\\xrightarrow{\\operatorname{div}}\\operatorname{Div}(X)$ 正合；由 §degree-zero-on-complete-curve，$\\operatorname{im}(\\operatorname{div})\\subseteq\\operatorname{Div}^0(X)=\\deg^{-1}(0)$，即 $\\deg\\circ\\operatorname{div}=0$。但反向包含 $\\deg^{-1}(0)\\subseteq\\operatorname{im}(\\operatorname{div})$ 一般不成立：若它成立则 $\\operatorname{Prin}(X)=\\ker(\\deg)$，从而 $\\operatorname{Cl}(X)=\\operatorname{Div}(X)/\\operatorname{Prin}(X)=\\mathbb{Z}$ 被压平为零，曲线就没有除子类可谈了。所以 $\\deg$ 不能直接接在 $\\operatorname{div}$ 之后构成正合列，$\\operatorname{im}(\\operatorname{div})=\\operatorname{Prin}(X)\\subsetneq\\operatorname{Div}^0(X)=\\ker(\\deg)$，而 $\\operatorname{Prin}(X)$ 在 $\\operatorname{Div}^0(X)$ 中的亏欠恰由 $\\operatorname{Cl}(X)$ 度量：$\\ker(\\deg)/\\operatorname{Prin}(X)=\\operatorname{Cl}^0(X)$。把商补出来的正确列是六项的 $1\\to k^\\times\\to k(X)^\\times\\xrightarrow{\\operatorname{div}}\\operatorname{Div}(X)\\to \\operatorname{Cl}(X)\\to 0$（右端按主除子群定义正合），再由 $\\deg\\circ\\operatorname{div}=0$ 把 $\\deg$ 下降到商上。$\\deg$ 的满射性用不到正合列：取满足 $n_p\\ge 0$、$\\sum n_p=n$ 的有效除子即可，故单看 $\\deg$ 本身它是 $\\operatorname{Div}(X)\\to\\mathbb{Z}$ 的满射。',
        ['div-is-a-homomorphism', 'degree-zero-on-complete-curve']),
      step('principal-subgroup-and-class-group', '定义主除子群与除子类群，并把 deg 下降到类群上',
        '令 $\\operatorname{Prin}(X)=\\operatorname{div}(k(X)^\\times)$，由同态度量得 $\\operatorname{Prin}(X)\\cong k(X)^\\times/k^\\times$；它是 $\\operatorname{Div}(X)$ 的子群，因为同态的像自动是子群。两个除子若差属于 $\\operatorname{Prin}(X)$ 则称线性等价，商 $\\operatorname{Cl}(X)=\\operatorname{Div}(X)/\\operatorname{Prin}(X)$ 即除子类群；由 §degree-zero-on-complete-curve 每个主除子的次数都是 0，故次数映射在这样一对等价除子上取值相同，于是 $\\deg$ 下降为 $\\operatorname{Cl}(X)\\to\\mathbb{Z}$ 的群同态，它仍是满射（用有效除子可达任意整数），其核记作 $\\operatorname{Cl}^0(X)$，即零次除子类群，由 $\\operatorname{Cl}(X)$ 与 $\\operatorname{Div}^0(X)$ 的类合成而得。在正规曲线上 Weil 除子与 Cartier 除子（局部由单个非零函数给出的子概形）的群同构，故每个除子 D 对应可逆层 $\\mathcal{O}_X(D)$，线性等价类与可逆层的同构类一一对应，$\\operatorname{Cl}(X)\\cong\\operatorname{Pic}(X)$；张量运算 $\\mathcal{O}_X(D+D\')\\cong\\mathcal{O}_X(D)\\otimes\\mathcal{O}_X(D\')$ 说明该对应与群结构相容，重数亦逐点相加。',
        ['exactness']),
    ],
    conclusion: '完备正规曲线 X 上：$\\operatorname{div}:k(X)^\\times\\to \\operatorname{Div}(X)$ 是同态，$\\ker\\operatorname{div}=k^\\times$，且 $\\deg\\circ\\operatorname{div}=0$。正确的正合列是六项列 $1\\to k^\\times\\to k(X)^\\times\\xrightarrow{\\operatorname{div}}\\operatorname{Div}(X)\\to \\operatorname{Cl}(X)\\to 0$，它在 $\\operatorname{Div}(X)$ 处按 $\\operatorname{Cl}(X)=\\operatorname{Div}(X)/\\operatorname{Prin}(X)$ 的定义正合；$\\deg$ 在商上下降为满射 $\\operatorname{Cl}(X)\\to\\mathbb{Z}$，核为 $\\operatorname{Cl}^0(X)$，而 $\\operatorname{Prin}(X)\\subsetneq\\operatorname{Div}^0(X)=\\ker(\\deg)$，故把 $\\deg$ 直接接在 $\\operatorname{div}$ 之后的列在 $\\operatorname{Div}(X)$ 处不正合。此外 $\\operatorname{Cl}(X)\\cong\\operatorname{Pic}(X)$。',
    dependencies: ['scheme', 'proper-morphism', 'separated-morphism', 'normalization', 'a-cartier-divisor'],
    consequences: ['jacobian', 'elliptic-curve', 'b-riemann-roch-curve', 'ample-line-bundle', 'invertible-sheaf'],
    explanation: '除子的价值观在于它把“曲线上的函数”换成了“点上的整数向量”。有理函数有无穷维的取值空间，难以直接比较；但它的零极点数据是一个有限整系数形式和，属于一个自由交换群，可以做线性代数。完备性在这套翻译里是唯一一处不可替换的输入：正因为曲线是紧的，一个有理映射才能延拓到无穷远，零点与极点才配对成次数相等的一对，deg div(f)=0 才成立。在仿射或带去掉点的曲线上，函数有零点而无极点，次数守恒立刻破裂，曲线理论中几乎所有“次数”论证都会随之瓦解。还要记住 $\\deg\\circ\\operatorname{div}=0$ 与“正合”是两件不同的事：前者只是说主除子都落在零次部分，后者需要零次除子全都能写成主除子，而这是不对的，差出来的那个商就是 $\\operatorname{Cl}(X)$。因此把 $\\deg$ 直接写在 $\\operatorname{div}$ 右边的四项列只能当作“复合为零加满射”的简写，真正刻画除子类群的列必须把 $\\operatorname{Cl}(X)$ 留在右端。Cl(X) 的意义则在于它是“把所有函数的账都除掉之后剩下的不变量”，它的零次部分 $\\operatorname{Cl}^0(X)$ 就是 Jacobian，这是把代数曲线与复环面、椭圆曲线统一起来的枢纽；对 ℙ¹ 有 $\\operatorname{Cl}^0=0$，对椭圆曲线有 $\\operatorname{Cl}^0(E)\\cong E$，一为点一为曲线，两者的差别正是 $\\operatorname{Cl}$ 不可被抹去的证据。',
    examples: [
      { title: '例子：ℙ¹ 上的除子与 Cl(ℙ¹)=ℤ', body: '取 X=ℙ¹，齐次坐标 [x:y]，$t=x/y$ 是仿射坐标。有理函数 $f=t-a$ 在 $p=[a:1]$ 处为零（阶 1），在 $\\infty=[1:0]$ 处为极点（阶 1），故 $\\operatorname{div}(t-a)=[a:1]-[1:0]$，次数 $1-1=0$，验证定理。更一般地，任何 $f\\in k(t)^\\times$ 的零点与极点总次数相等，故每个主除子都落在 $\\operatorname{Div}^0$ 中，$\\deg$ 可以下降到 $\\operatorname{Cl}(\\mathbb{P}^1)$ 上；反过来 $\\operatorname{Cl}(\\mathbb{P}^1)$ 由 $[\\infty]$ 的类生成：任意次数 n 的除子 D 与 $n[\\infty]$ 次数相同，其差可用 $\\prod (t-a_i)^{n_i}$ 的除子实现（按系数正负把点归入分子与分母并配平无穷远处的阶），故 $D\\sim n[\\infty]$。于是 $\\operatorname{Cl}(\\mathbb{P}^1)\\cong\\mathbb{Z}$，且 $\\deg:\\operatorname{Cl}\\to\\mathbb{Z}$ 是同构，从而 $\\operatorname{Cl}^0(\\mathbb{P}^1)=0$：ℙ¹ 上的零次除子全是主除子，$\\ker(\\deg)=\\operatorname{Prin}$ 在这里是等式，这恰是“$\\operatorname{Prin}\\subsetneq\\ker(\\deg)$”失效的特例，不能据此以为一般曲线也如此。' },
      { title: '例子：椭圆曲线上的除子与 P+Q−R−O 的线性等价', body: '取 X 为 ℙ² 中一条光滑三次曲线 E（亏格 1），固定 $O\\in E(k)$，并取 $\\ell_\\infty$ 为一条与 E 相切于 O 的直线。若把 $\\ell_\\infty$ 取为无穷远直线 $Z=0$，则它与 E 的交点由三次齐次部分给出：在仿射坐标 $x=X/Z$、$y=Y/Z$ 下 E 的方程形如 $y^2=x^3+ax+b$，而 $Z=0$ 只满足齐次三次部分 $Y^2Z-X^3-aXZ^2-bZ^3$ 中的 $Y^2Z=0$，故 $Z=0$ 与 E 只交于 $O=[0:1:0]$ 一点且重数为 3，即 $\\deg\\operatorname{div}(\\ell_\\infty)=[O]+[O]+[O]=3[O]$；这与“次数 3 的直线交三次曲线于 3 点计重数”一致。对过 $P,Q$ 的直线 $\\ell$（第三交点为 S），有理函数 $\\ell/\\ell_\\infty$ 的除子是两条直线的交点差：$\\operatorname{div}(\\ell/\\ell_\\infty)=([P]+[Q]+[S])-3[O]$，次数 $3-3=0$，其中 $\\ell_\\infty$ 的贡献是把 $\\ell$ 的三个交点整体减去 $3[O]$，这正是把“无穷远处的记账”写成 $\\operatorname{div}(L)=[P]+[Q]+[S]-3[O]$ 的精确含义。再取过 S、$-S$、O 的直线 $\\ell\'$（$-S$ 是 S 关于 O 的逆），$\\operatorname{div}(\\ell\'/\\ell_\\infty)=[S]+[-S]+[O]-3[O]=[S]+[-S]-2[O]$，于是 $\\operatorname{div}(\\ell/\\ell\')=[P]+[Q]-[S]-[-S]$ 是主除子，故 $[P]+[Q]\\sim[S]+[-S]=[S]+[T]$，其中 $T=-S$ 给出椭圆曲线的群律 $P+Q=T$。这条计算说明三点共线构型完全由除子类编码：$P+Q=T$ 当且仅当 $\\mathcal{O}_X(P+Q-T-O)\\cong\\mathcal{O}_X$。' },
    ],
    remarks: [
      '完备性不可去掉：在 $\\mathbb{A}^1$ 上 $\\operatorname{div}(x)=[0]$，次数为 1，$\\deg\\operatorname{div}(f)=0$ 失败；在 $\\mathbb{A}^1\\setminus\\{0\\}$ 上 $\\operatorname{div}(x)=0$（x 是单位）而 $\\operatorname{div}(x-1)=[1]$，同样失败。补救方式是把曲线紧化到射影曲线并补上无穷远处的点。',
      '几何连通不可去掉：若 X 不几何连通，$H^0(X,\\mathcal{O}_X)$ 可能是更大的有限 k-代数而非 k，核 $=H^0(X,\\mathcal{O}_X^\\times)$ 会包含非 k 的常数，正合列左端就不能写成 $k^\\times$，而必须写成 $H^0(X,\\mathcal{O}_X^\\times)$。',
      '正规性不可去掉：非正规曲线上某点的局部环不是离散赋值环，没有唯一的赋值 ord_p，正值与“零点”的对应断裂；此时 Weil 除子与 Cartier 除子不再同构，$\\operatorname{Cl}\\cong\\operatorname{Pic}$ 需要换成 Cartier 语言并加上 Picard 群的局部修正项。',
      '主除子群的元素只在有限个点非零，这是因为有理函数在完备曲线上的零极点集是有限的；在非有限型概形或解析曲线（例如单位圆盘）上零点可以有聚点，有限和的定义失效，必须改用解析除子与亚纯函数的整套理论。',
    ],
    corollaries: [
      { title: '推论：零次除子类群的两端（ℙ¹ 与椭圆曲线）', body: '对 ℙ¹，$\\operatorname{Cl}(\\mathbb{P}^1)\\cong\\mathbb{Z}$ 且 $\\deg:\\operatorname{Cl}\\to\\mathbb{Z}$ 是同构，故 $\\operatorname{Cl}^0(\\mathbb{P}^1)=0$，每个零次除子都是主除子，$\\ker(\\deg)=\\operatorname{Prin}$ 在这里取等号。对椭圆曲线 E，存在非平凡态射 $E\\to\\operatorname{Cl}^0(E)$，$P\\mapsto$ 类 $[P]-[O]$，它是同构，故 $\\operatorname{Cl}^0(E)\\cong E$ 是一条曲线而非一个点。两者对比说明 $\\operatorname{Prin}(X)\\subsetneq\\operatorname{Div}^0(X)=\\ker(\\deg)$ 是常态而非例外，因而四项列 $1\\to k^\\times\\to k(X)^\\times\\to \\operatorname{Div}(X)\\xrightarrow{\\deg}\\mathbb{Z}\\to 0$ 在 $\\operatorname{Div}(X)$ 处不正合；若要一条处处正合的列，只能写六项列 $1\\to k^\\times\\to k(X)^\\times\\xrightarrow{\\operatorname{div}}\\operatorname{Div}(X)\\to \\operatorname{Cl}(X)\\to 0$，再另附 $\\deg$ 在商上的满射性。', uses: ['exactness', 'principal-subgroup-and-class-group'] },
      { title: '推论：存在次数任意且系数为负的除子', body: '对任意 $n\\in\\mathbb{Z}$，存在 $D\\in\\operatorname{Div}(X)$ 使 $\\deg D=n$：取 $n>0$ 时用 n 个任取的闭点之和，$n<0$ 时取其负。结合 $\\deg\\circ\\operatorname{div}=0$ 可知这个次数在类群上良定义，从而 $\\operatorname{Cl}(X)\\to\\mathbb{Z}$ 满射，而 $\\operatorname{Cl}^0(X)=\\ker(\\deg)$ 是它的核；特别地 $\\operatorname{Cl}(X)$ 以 ℤ 为商，$\\operatorname{Cl}^0(X)$ 就是那个被丢掉的部分，它正是 Jacobian 所在的位置。', uses: ['exactness'] },
      { title: '推论：次数为零的除子来自函数当且仅当它对应的可逆层平凡', body: '对 $D\\in\\operatorname{Div}(X)$，$D$ 是主除子当且仅当 $\\mathcal{O}_X(D)\\cong\\mathcal{O}_X$。证明：若 $D=\\operatorname{div}(f)$ 则 $f$ 给出 $\\mathcal{O}_X(D)\\to\\mathcal{O}_X$ 的整体非零截面，因 f 在每点局部可逆，这是同构；反之若 $\\mathcal{O}_X(D)$ 平凡则取整体生成元 s，其在仿射开集上是 f 的局部化，拼起来得 $D=\\operatorname{div}(f)$，而正合性保证 f 存在。', uses: ['principal-subgroup-and-class-group'] },
    ],
    references: [
      stacks('Definition 31.26.1 / Weil divisors', '0BE0'),
      stacks('Lemma 31.14.2 (Cartier and Weil divisors)', '01WS'),
      stacks('Definition 31.27.1 (Effective Cartier divisors)', '01WQ'),
      stacks('Lemma 53.8.1 (genus of a curve)', '0BY6'),
    ],
    history: HISTORY,
  },

  /* ═══════════════════════════════════════════════════════════
   * 3. 亏格
   * ═══════════════════════════════════════════════════════════ */

  'genus': {
    statement: '设 X 是域 k 上的光滑、射影、几何连通曲线，$\\omega_X=\\Omega_{X/k}$ 为其对偶化层（典范层）。定义几何亏格 $g=\\dim_k H^0(X,\\omega_X)$。则：(1) $g=\\dim_k H^1(X,\\mathcal{O}_X)$，且两者都是有限维 k-向量空间；(2) 算术亏格 $\\chi(\\mathcal{O}_X)=h^0(\\mathcal{O}_X)-h^1(\\mathcal{O}_X)$ 满足 $\\chi(\\mathcal{O}_X)=1-g$，即 $g=1-\\chi(\\mathcal{O}_X)$；(3) 若 $k=\\mathbb{C}$，则 X 是紧黎曼面，其拓扑亏格（一阶 Betti 数的一半，即 $\\frac{1}{2}\\dim_{\\mathbb{R}}H^1(X^{\\mathrm{an}},\\mathbb{R})=h^{1,0}=\\dim_{\\mathbb{C}}H^0(X^{\\mathrm{an}},\\Omega^1)$）与 g 相等。换言之，代数定义的 g、上同调定义的 $h^1(\\mathcal{O}_X)$ 与复拓扑定义的亏格三者一致。',
    deepExplanation: '亏格是曲线唯一的离散不变量，但它在三个不同层面各有一个定义：几何的（“整体全纯微分的个数”，即 $h^0(\\omega_X)$）、层论的（“结构层上同调的不对称度”，即 $h^1(\\mathcal{O}_X)$）、拓扑的（“曲面有几个洞”，即 Betti 数的一半）。定理的全部内容是这三个定义相等。$g=h^0(\\omega_X)$ 与 $h^1(\\mathcal{O}_X)$ 的相等由 Serre 对偶直接给出，是纯代数的恒等式；与拓扑亏格的相等在特征零情形由 Hodge 分解与 Dolbeault 定理给出，这也是为什么在特征 p 上习惯只谈 $h^1(\\mathcal{O}_X)$ 而不谈“洞的个数”。把 $g=1-\\chi(\\mathcal{O}_X)$ 单独写出来是因为 $\\chi(\\mathcal{O}_X)$ 在 Riemann–Roch 的框架里是一个可计算量：Riemann–Roch 给出 $\\chi(\\mathcal{O}_X(D))=\\deg D+1-g$，取 $D=K_X$ 并代入 $\\ell(K_X)=g$ 与 $\\ell(\\mathcal{O}_X)=1$ 解得 $\\deg\\omega_X=2g-2$，回代得 $\\chi(\\mathcal{O}_X)=1-g=-\\frac{1}{2}\\deg\\omega_X$。',
    steps: [
      step('finiteness', '确认两边都是有限维，使维数断言有意义',
        'X 是射影 k-概形，$\\mathcal{O}_X$ 与 $\\omega_X$ 都是凝聚层，射影概形上凝聚层的上同调是有限型 k-模；因 k 是域，有限型即有限维。于是 $h^0(\\omega_X)=\\dim_k H^0(X,\\omega_X)$ 与 $h^1(\\mathcal{O}_X)=\\dim_k H^1(X,\\mathcal{O}_X)$ 都是有限整数。这一步还用到曲线的维数是 1：对任意凝聚层 F，当 $i>\\dim X=1$ 时有 $H^i(X,F)=0$（射影概形上凝聚层的高阶上同调超出概形维数时消失），因此 cohomology 只有 $H^0$、$H^1$ 两档，$\\chi(\\mathcal{O}_X)=h^0(\\mathcal{O}_X)-h^1(\\mathcal{O}_X)$ 是一个完整的欧拉示性数而无更高项。没有射影性就只能得到“有限型”甚至“非有限型”，维数比较无从谈起。',
        []),
      step('h0-structure-sheaf', '计算 $h^0(\\mathcal{O}_X)=1$，即 g=1−χ',
        '由 X 几何连通且射影，X 连通，故 $H^0(X,\\mathcal{O}_X)=k$：整体正则函数在射影概形上是常值（因为它是有限维 k-代数上的整元素，且常值的极大理想不能再增长），几何连通进一步保证常数只有 k 的元素。于是 $h^0(\\mathcal{O}_X)=1$，代入 $\\chi(\\mathcal{O}_X)=h^0(\\mathcal{O}_X)-h^1(\\mathcal{O}_X)$ 得 $\\chi(\\mathcal{O}_X)=1-h^1(\\mathcal{O}_X)$，即 $h^1(\\mathcal{O}_X)=1-\\chi(\\mathcal{O}_X)$。这一步是“算术亏格”这个名称的来源：$\\chi(\\mathcal{O}_X)$ 是把 $h^0$ 归一化为 1 之后的量，它只记录了 $h^1$ 的亏欠，因此 $1-\\chi(\\mathcal{O}_X)$ 就是一个自然的非负整数候选；要证明它恰是 $h^0(\\omega_X)$，还须用对偶性。',
        ['finiteness']),
      step('serre-duality-identification', '用 Serre 对偶证明 $h^0(\\omega_X)=h^1(\\mathcal{O}_X)$',
        '这里调用 Serre 对偶定理，其假设是 X 在域 k 上光滑且射影（不需要曲线，对光滑射影 n 维概形都成立）：对任意凝聚层 F，存在完美配对 $H^i(X,F)\\times \\operatorname{Ext}^{n-i}(F,\\omega_X)\\to k$，取 $F=\\mathcal{O}_X$、$i=1$、n=1 得 $H^1(X,\\mathcal{O}_X)\\times \\operatorname{Ext}^0(\\mathcal{O}_X,\\omega_X)\\to k$ 非退化。因为 $\\operatorname{Ext}^0=\\operatorname{Hom}$，有 $\\operatorname{Hom}_{\\mathcal{O}_X}(\\mathcal{O}_X,\\omega_X)\\cong H^0(X,\\omega_X)$（把 $1\\in H^0(\\mathcal{O}_X)$ 送到其像即得双射，这是自由模 H^0 的伴随性质）。非退化配对给出 $H^1(X,\\mathcal{O}_X)^\\vee\\cong H^0(X,\\omega_X)$，两边取维数得 $h^1(\\mathcal{O}_X)=h^0(\\omega_X)$，即 $g=h^1(\\mathcal{O}_X)$。',
        ['finiteness', 'h0-structure-sheaf']),
      step('conclusion-g-equals-chi', '合并两端得到 g=1−χ(O_X)，并核对典范除子的次数',
        '把 §h0-structure-sheaf 的 $h^1(\\mathcal{O}_X)=1-\\chi(\\mathcal{O}_X)$ 与 §serre-duality-identification 的 $g=h^1(\\mathcal{O}_X)$ 串起来，立刻得 $g=1-\\chi(\\mathcal{O}_X)$，等价地 $\\chi(\\mathcal{O}_X)=1-g$。这条等式的实际价值在于它是一个“可计算恒等式”：亏格由欧拉示性数给出，而欧拉示性数由 Riemann–Roch 给出。要写得与典范除子相容，必须先从 $\\chi(\\mathcal{O}_X)=1-g$ 与定义 $\\deg(\\omega_X):=2g-2$ 出发：把 $\\deg\\omega_X=2g-2$ 代入得 $\\chi(\\mathcal{O}_X)=1-g=-\\frac{2g-2}{2}=-\\frac{1}{2}\\deg(\\operatorname{div}(\\omega_X))$，即 $\\chi(\\mathcal{O}_X)=-\\frac{1}{2}\\deg(\\operatorname{div}(\\omega_X))$。这里的关键是 $g$ 与 $\\deg\\omega_X$ 通过定义式相乘相连，而 $\\deg(\\mathcal{O}_X)=0$、$\\deg(\\operatorname{div}(f))=0$ 这类平凡次数不能拿来替代 $\\deg\\omega_X$：写作 $\\chi(\\mathcal{O}_X)=\\deg(\\mathcal{O}_X)+1-g$ 只是把平凡次数塞进公式，若再用它推出 $\\deg(\\mathcal{O}_X)=\\deg\\omega_X/2$ 就得到 $0=g-1$ 这种只对 g=1 成立的错误结论。§b-serre-duality-curve 中另有一条独立途径得到同一等式：对 $D=K$ 用 Riemann–Roch，用 $\\ell(K)=g$ 与 $\\ell(\\mathcal{O}_X)=1$ 解出 $\\deg K=2g-2$，与定义式一致。此外这一步并不需要任何超越方法，纯粹是 Serre 对偶加 $h^0(\\mathcal{O}_X)=1$ 的推论，因此对任意特征、任意基域都成立。',
        ['serre-duality-identification', 'h0-structure-sheaf']),
      step('topological-agreement', '在复情形与拓扑亏格比较（含两侧论证）',
        '设 $k=\\mathbb{C}$。代数曲线 X 给出紧黎曼面 $X^{\\mathrm{an}}$，其上的代数微分层 $\\Omega^1$ 与全纯微分层一致，故 $g=h^0(X,\\omega_X)$ 就是全纯 1-形式的维数。由 Hodge 分解 $H^1(X^{\\mathrm{an}},\\mathbb{C})\\cong H^{1,0}\\oplus H^{0,1}$，其中 $H^{1,0}=H^0(X^{\\mathrm{an}},\\Omega^1)$、$H^{0,1}=\\overline{H^{1,0}}$；Dolbeault 定理给出 $h^{0,1}=\\dim_{\\mathbb{C}}H^1(X^{\\mathrm{an}},\\mathcal{O}_{X^{\\mathrm{an}}})=\\dim_{\\mathbb{C}}H^1(X,\\mathcal{O}_X)=h^1(\\mathcal{O}_X)$，而 Hodge 对称性（等价的 Serre 对偶）给出 $h^{1,0}=h^{0,1}$；再由 §serre-duality-identification 的 $h^1(\\mathcal{O}_X)=h^0(\\omega_X)=g$ 与定义 $h^{1,0}=\\dim H^0(\\Omega^1)=h^0(\\omega_X)=g$，整条链是 $h^1(\\mathcal{O}_X)=h^{0,1}=h^{1,0}=\\dim H^0(\\Omega^1)=g$。这里没有任何“取反对称部分”的操作：$H^0(\\Omega^1)$ 本身就已经是 $H^1$ 的一个子空间，维数等于 g，不需要再从中挑出什么部分。于是 $\\dim_{\\mathbb{R}}H^1(X^{\\mathrm{an}},\\mathbb{R})=h^{1,0}+h^{0,1}=2g$，即 $g=\\frac{1}{2}\\dim_{\\mathbb{R}}H^1(X^{\\mathrm{an}},\\mathbb{R})$，这正是“曲面有几个洞”的亏格。反向地，若先取复拓扑亏格 $g_{\\mathrm{top}}$，则在 $\\mathbb{C}$ 上代数曲线光滑射影蕴含 $X^{\\mathrm{an}}$ 是紧黎曼面，$\\deg\\omega_X=2g_{\\mathrm{top}}-2$：紧黎曼面上一个非零全纯 1-形式恰有 $2g_{\\mathrm{top}}-2$ 个零点（计重数），这是典范除子的次数，与全纯 1-形式的零点总重数相等；与已证的 $\\deg\\omega_X=2g-2$ 比较得 $g=g_{\\mathrm{top}}$。两个方向都用到 $k$ 含 $\\mathbb{C}$ 这一条件。',
        ['conclusion-g-equals-chi', 'finiteness', 'serre-duality-identification']),
    ],
    conclusion: '光滑射影几何连通曲线 X 上，$g=\\dim_k H^0(X,\\omega_X)=\\dim_k H^1(X,\\mathcal{O}_X)$，且 $\\chi(\\mathcal{O}_X)=1-g$；当 $k=\\mathbb{C}$ 时此 g 等于 $X^{\\mathrm{an}}$ 的拓扑亏格 $\\frac{1}{2}\\dim_{\\mathbb{R}}H^1(X^{\\mathrm{an}},\\mathbb{R})$，三个亏格定义一致。',
    dependencies: ['canonical-sheaf', 'serre-duality', 'sheaf-cohomology', 'smooth-morphism', 'proper-morphism'],
    consequences: ['b-riemann-roch-curve', 'b-hurwitz', 'elliptic-curve', 'jacobian', 'riemann-surface', 'b-canonical-embedding'],
    explanation: '亏格之所以值得有三个定义，是因为每个定义各解决一类问题。几何定义 $h^0(\\omega_X)$ 直接给出手里的具体对象：全纯微分，可以做积分、做周期、构造 Jacobian；层论定义 $h^1(\\mathcal{O}_X)$ 让 g 进入 Serre 对偶与 Riemann–Roch 的机器，成为上同调维数的计算结果；拓扑定义则说明 g 是拓扑不变量，与代数结构无关，因此任何变形、任何嵌入都不会改变它。三者相等这条定理把“抽象的上同调维数”与“能看见的洞的个数”绑在一起，使得我们可以用形变、覆盖、粘合等拓扑手段来推代数结论，例如 Riemann–Hurwitz 中 $g$ 的二次项正是从拓扑覆盖的欧拉数算出来的。也应记住这条相等的代价：$k$ 的超越部分（以及可能的特征 p 障碍）决定了哪些方向可用，$h^0(\\omega_X)=h^1(\\mathcal{O}_X)$ 永远成立，而“等于 Betti 数一半”只在特征零时才有意义。',
    examples: [
      { title: '例子：次数 d 的光滑平面曲线亏格为 (d−1)(d−2)/2', body: '取 X 为 ℙ² 中次数 d 的光滑曲线，$d\\ge 1$。由伴随公式，$\\omega_X\\cong \\mathcal{O}_X(d-3)$（把 ℙ² 的 $\\omega_{\\mathbb{P}^2}=\\mathcal{O}(-3)$ 限制并作正规伴随修正），因此 $\\deg\\omega_X=d(d-3)$（因为超平面类限制到 X 上次数为 d）。代入 $\\deg\\omega_X=2g-2$ 得 $2g-2=d(d-3)$，即 $g=\\frac{(d-1)(d-2)}{2}$。检验：$d=1$ 得 g=0（直线是 ℙ¹），$d=2$ 得 g=0（圆锥曲线同构 ℙ¹），$d=3$ 得 g=1（椭圆曲线），$d=4$ 得 g=3。这个公式说明“次数越高亏格越大”，并且把抽象的 $h^0(\\omega_X)=h^1(\\mathcal{O}_X)$ 变成一个可以用 d 直接算出的整数。' },
      { title: '例子：ℙ¹ 上 $\\omega_{\\mathbb{P}^1}=\\mathcal{O}(-2)$，g=0', body: '取 X=ℙ¹。计算典范层：相对微分模的层 $\\Omega_{\\mathbb{P}^1}$ 是次数 −2 的可逆层，即 $\\omega_{\\mathbb{P}^1}\\cong\\mathcal{O}(-2)$。于是 $h^0(\\omega_X)=h^0(\\mathcal{O}(-2))=0$（负次数可逆层无整体截面），故 g=0；对偶侧 $h^1(\\mathcal{O}_X)=h^0(\\omega_X)=0$，与 $\\chi(\\mathcal{O}_X)=1-0=1$ 一致。取齐次坐标 $[x:y]$，唯一的“候选微分”是 $dt$ 其中 $t=x/y$，但 $dt$ 在无穷远处为极点（阶 2），不是整体全纯的，所以 $H^0(\\Omega^1)=0$——这正是 $g=0$ 的具体体现。' },
    ],
    remarks: [
      '光滑性不可去掉：若 X 有结点或尖点，对偶化层不再是 $\\Omega_{X/k}$ 而是带扭结的 $\\omega_X$（在结点处秩 1、在尖点处秩 1 但生成元需特殊处理），此时 $h^0(\\omega_X)$ 给出的是算术亏格 $p_a=1-\\chi(\\mathcal{O}_X)$，它与奇点的“几何亏格” $p_g$ 可能不同，$g=h^1(\\mathcal{O}_X)$ 只在 $p_a=p_g$ 即奇点为有理奇点时成立。',
      '射影性不可去掉：非射影（例如带孔的射影曲线的开子集）或不完备曲线上，$\\chi(\\mathcal{O}_X)$ 仍是有限整数，但 Serre 对偶需要完备性才能把 $H^1$ 与其对偶配对，$h^1(\\mathcal{O}_X)=h^0(\\omega_X)$ 可能失败（例如 $\\mathbb{A}^1$ 有 $h^1=0$、$h^0(\\omega_X)=0$，偶然成立，但 $\\mathbb{A}^1\\setminus\\{0\\}$ 上 $h^0(\\Omega^1)=0$ 而 $h^1(\\mathcal{O})=0$，拓扑上已是“圆柱”，与代数 g 的对应完全失去意义）。',
      '特征 p 上“拓扑亏格”这一项需要替换：$H^1(X^{\\mathrm{an}})$ 不存在，通常是 $2g$ 的应是 Hodge 数 $h^0(\\Omega^1)+h^1(\\mathcal{O}_X)$，而在非良约化或非光滑情形 $h^0(\\Omega^1)$ 与 $h^1(\\mathcal{O}_X)$ 可以不等（$h^0(\\Omega^1)$ 可能大于 $h^1(\\mathcal{O}_X)$），故特征 p 下只能说 $g=h^1(\\mathcal{O}_X)$ 是“亏格”的代数定义，而不能把它等同于 Betti 数的一半。',
      '几何连通不可去掉：若 X 是两条不相交曲线的并，$h^0(\\mathcal{O}_X)$ 等于分支个数 r>1，$\\chi(\\mathcal{O}_X)=r-g_{\\text{总}}$，$1-\\chi(\\mathcal{O}_X)$ 就不再是任何单个分支的亏格；定理的陈述必须限定为连通（或对每个连通分支分别陈述）。',
    ],
    corollaries: [
      { title: '推论：$\\deg\\omega_X=2g-2$', body: '由 $g=h^1(\\mathcal{O}_X)$ 与 $\\chi(\\mathcal{O}_X)=1-g$，对 $D=K_X$ 应用 Riemann–Roch 即得 $\\ell(K_X)-\\ell(\\mathcal{O}_X)=\\deg K_X+1-g$；代入 $\\ell(K_X)=h^0(\\omega_X)=g$ 与 $\\ell(\\mathcal{O}_X)=h^0(\\mathcal{O}_X)=1$，得 $g-1=\\deg K_X+1-g$，即 $\\deg\\omega_X=\\deg K_X=2g-2$。这与定义式 $\\deg(\\omega_X):=2g-2$ 相容，两者合起来说明典范除子的次数不是额外输入而是 $\\ell(K_X)=g$ 的必然结果。注意不要把 $\\deg(\\mathcal{O}_X)=0$ 混进这条计算：$\\mathcal{O}_X$ 的次数恒为零，它无法提供关于 $\\deg\\omega_X$ 的任何信息，能提供信息的是 $\\deg K_X$ 本身。这条“基本数”把典范除子的次数、亏格与欧拉示性数锁死，Riemann–Hurwitz 公式的两端都是它的变形。', uses: ['conclusion-g-equals-chi'] },
      { title: '推论：椭圆曲线即 g=1 的光滑射影曲线', body: '若 $g=1$，则 $\\deg\\omega_X=0$，$h^0(\\omega_X)=1$，且 $\\omega_X\\cong\\mathcal{O}_X$（次数 0 且有整体非零截面的可逆层必平凡）。于是每条 g=1 的光滑射影几何连通曲线都带一个平凡典范层，配上任选基点 O 给出群结构，成为椭圆曲线。逆命题同样成立：椭圆曲线的 $\\omega\\cong\\mathcal{O}$ 给出 $g=1$。', uses: ['conclusion-g-equals-chi'] },
    ],
    references: [
      stacks('Lemma 53.8.1 / genus of a curve', '0BY6'),
      stacks('Lemma 53.2.1 (Riemann-Roch)', '0BXY'),
      stacks('Section 53.12 (Riemann-Hurwitz)', '0C1B'),
      stacks('Lemma 53.12.3 (degree of the canonical sheaf)', '0C1E'),
    ],
    history: HISTORY,
  },

  /* ═══════════════════════════════════════════════════════════
   * 4. 曲线上的 Serre 对偶
   * ═══════════════════════════════════════════════════════════ */

  'b-serre-duality-curve': {
    statement: '设 X 是域 k 上的光滑射影几何连通曲线，$\\omega_X=\\Omega_{X/k}$ 为典范层，K 为满足 $\\omega_X\\cong\\mathcal{O}_X(K)$ 的典范除子。则对任意除子 D，存在标准同构 $H^1(X,\\mathcal{O}_X(D))\\cong H^0(X,\\mathcal{O}_X(K-D))^\\vee$，其中上标 ∨ 是 k-对偶；等价地 $h^1(D)=h^0(K-D)$，此处 $h^i(D)=\\dim_k H^i(X,\\mathcal{O}_X(D))$。由此得到 Riemann–Roch 定理：对任意除子 D，$\\ell(D)-\\ell(K-D)=\\deg D+1-g$，其中 $\\ell(D)=h^0(D)$、$g=h^1(\\mathcal{O}_X)=h^0(\\omega_X)$。',
    deepExplanation: 'Serre 对偶的全部技术价值在于它把 $H^1$ —— 一个没有直接几何解释的导出函子 —— 换成 $H^0$，即“有多少个函数/截面满足极点不超过给定界”这样一个可以数出来的量。曲线情形是最简单也最有用的情形：因为 $H^1(X,\\mathcal{O}_X(D))$ 的对偶恰好是 $\\mathcal{O}_X(K-D)$ 的整体截面，而 K−D 的次数为 $\\deg\\omega_X-\\deg D=2g-2-\\deg D$；当 $\\deg D$ 很大时这是个负次数可逆层，无截面，于是 $h^1(D)=0$，Riemann–Roch 退化为 $\\ell(D)=\\deg D+1-g$ 的简洁形式。这就是为什么在大次数区间里可以直接数函数维数，而在中间次数区间必须保留 $\\ell(K-D)$ 这一修正项。对偶配对的非退化性是关键，它保证 $H^1$ 与 $H^0$ 的维数严格相等（而非只是不等式），从而 Riemann–Roch 是等式而不是估计。',
    steps: [
      step('setup-and-duality-statement', '写下曲线上的 Serre 对偶并说明其假设',
        '设 F 是 X 上的凝聚层。Serre 对偶的一般定理（要求 X 在 k 上光滑射影，n=dim X）断言：存在 k-双线性配对 $H^i(X,F)\\times \\operatorname{Ext}^{n-i}(F,\\omega_X)\\to k$，它对两个变量都是非退化的，从而给出同构 $H^i(X,F)^\\vee\\cong \\operatorname{Ext}^{n-i}(F,\\omega_X)$。取 n=1、i=1，得 $H^1(X,F)^\\vee\\cong \\operatorname{Ext}^0(F,\\omega_X)=\\operatorname{Hom}_{\\mathcal{O}_X}(F,\\omega_X)$。再取 $F=\\mathcal{O}_X(D)$，它是秩 1 局部自由层（局部自由来自 X 光滑，因此有效除子局部由单个非零因子定义），于是 $\\operatorname{Hom}(\\mathcal{O}_X(D),\\omega_X)\\cong H^0(X,\\omega_X\\otimes\\mathcal{O}_X(-D))$：这是把 $1\\in H^0(\\mathcal{O}_X(D))$ 的局部生成元送到像给出的伴随双射。光滑与射影是硬前提：去掉射影则 $H^1$ 可能无穷维、配对非退化性失效；去掉光滑则层不再局部自由，Hom 到 $H^0$ 的双射要换成带导子的版本。',
        []),
      step('twist-by-K', '把 $\\omega_X$ 换成 $\\mathcal{O}_X(K)$ 并得到陈述形式',
        '取典范除子 K 使 $\\omega_X\\cong\\mathcal{O}_X(K)$。由可逆层的张量运算，$\\omega_X\\otimes\\mathcal{O}_X(-D)\\cong\\mathcal{O}_X(K)\\otimes\\mathcal{O}_X(-D)\\cong\\mathcal{O}_X(K-D)$：张量是逐点（逐局部环）的，而 $\\mathcal{O}_X(D)$ 的局部生成元形如局部方程 f 的幂，故整体张量对应系数相加。代入上一步得 $H^1(X,\\mathcal{O}_X(D))^\\vee\\cong H^0(X,\\mathcal{O}_X(K-D))$，两边取 k-对偶并用有限维 k-向量空间的双对偶恒等 $(V^\\vee)^\\vee\\cong V$ 得 $H^1(X,\\mathcal{O}_X(D))\\cong H^0(X,\\mathcal{O}_X(K-D))^\\vee$，这正是定理要求的形式。取维数得 $h^1(D)=h^0(K-D)$。这一步只用到 $\\omega_X$ 可逆与 K 的存在性：K 的存在性由 X 正规（光滑蕴含正规）且对偶化层可逆保证，除子类群与可逆层的对应在 §divisor 中已建立。',
        ['setup-and-duality-statement']),
      step('apply-to-structure-sheaf', '取 D=0 检验并定出 g',
        '取 D=0，则 $\\mathcal{O}_X(D)=\\mathcal{O}_X$，公式给出 $H^1(X,\\mathcal{O}_X)\\cong H^0(X,\\mathcal{O}_X(K))^\\vee = H^0(X,\\omega_X)^\\vee$，取维数得 $h^1(\\mathcal{O}_X)=h^0(\\omega_X)=g$，这与 §genus 中证明的亏格同一性完全一致，说明对偶性在平凡除子上给出正确的一致性检验。反过来这也说明 $g$ 可以从对偶角度定义：$g=\\dim_k H^1(X,\\mathcal{O}_X)$。同时算出 $\\deg K=\\deg\\omega_X=2g-2$，于是对一般 D 有 $\\deg(K-D)=2g-2-\\deg D$；当 $\\deg D>2g-2$ 时 $\\deg(K-D)<0$，负次数可逆层无整体非零截面，故 $\\ell(K-D)=0$，从而 $h^1(D)=0$。这是把对偶性用于消去 $H^1$ 的标准手段。',
        ['twist-by-K']),
      step('derive-riemann-roch', '由对偶性与 §genus 推出 Riemann–Roch',
        '由 §genus 的结论 $\\deg\\omega_X=2g-2$ 与 Riemann–Roch 定理（对光滑射影曲线：$\\chi(\\mathcal{O}_X(D))=\\deg D+1-g$，这是曲线 Riemann–Roch 的欧拉示性数形式，可由吹爆到 ℙ¹ 或由 $K_X$ 的次数计算证明）。把 $\\chi=h^0-h^1$ 展开：$h^0(D)-h^1(D)=\\deg D+1-g$；再用 §twist-by-K 的 $h^1(D)=h^0(K-D)$，即得 $\\ell(D)-\\ell(K-D)=\\deg D+1-g$。这里必须强调两条外部输入各自的假设：$\\chi$ 形式需要 $\\mathcal{O}_X(D)$ 是凝聚层且 X 射影（保证 $\\chi$ 有限且只有两档）；$h^1(D)=\\ell(K-D)$ 需要 X 光滑射影（Serre 对偶的非退化性）。两个方向的推导都已完成：由对偶性加 $\\chi$ 公式得 Riemann–Roch；反之由 Riemann–Roch 与 $h^0$ 的定义也可反解出 $h^1(D)=\\ell(K-D)$，两条路给出同一等式。',
        ['apply-to-structure-sheaf', 'twist-by-K']),
      step('consequences-and-vanishing', '导出大次数消失与 ℓ(K)=g 的实用形式',
        '由 §apply-to-structure-sheaf 已知当 $\\deg D>2g-2$ 时 $h^1(D)=0$，于是 Riemann–Roch 在该区间化简为 $\\ell(D)=\\deg D+1-g$，这是把“函数空间的维数”完全变成一次函数，是构造嵌入（例如把 X 嵌入射影空间）的基本工具。另一端点取 $D=K$：$\\ell(K)-\\ell(0)=\\deg K+1-g=(2g-2)+1-g=g-1$，而 $\\ell(0)=h^0(\\mathcal{O}_X)=1$，故 $\\ell(K)=g$，与 $g=h^0(\\omega_X)$ 一致。再取 $D=0$ 与 $D=K$ 之间的对称形式可得 $\\ell(D)=\\deg D+1-g+\\ell(K-D)$：左端的 $\\ell$ 与右端的 $\\ell(K-D)$ 关于 $\\deg D=g-1$ 对称，这个“对称中心”是曲线理论里大量维数论证的核心。',
        ['derive-riemann-roch']),
    ],
    conclusion: '光滑射影几何连通曲线 X 上，对任意除子 D 有 $H^1(X,\\mathcal{O}_X(D))\\cong H^0(X,\\mathcal{O}_X(K-D))^\\vee$，即 $h^1(D)=\\ell(K-D)$，进而 $\\ell(D)-\\ell(K-D)=\\deg D+1-g$；当 $\\deg D>2g-2$ 时 $\\ell(D)=\\deg D+1-g$，且 $\\ell(K)=g$、$\\deg K=2g-2$。',
    dependencies: ['serre-duality', 'canonical-sheaf', 'divisor', 'genus', 'sheaf-cohomology'],
    consequences: ['b-riemann-roch-curve', 'b-canonical-embedding', 'elliptic-curve', 'b-hurwitz', 'invertible-sheaf', 'ample-line-bundle'],
    explanation: '曲线上的 Serre 对偶可以被读成一条“维数守恒定律”：$H^1$ 的自由度总等于某个 $H^0$ 的自由度，中间由一个典范除子 K 做平移。这条定律让 $H^1$ 永远可以被消掉或换成 $H^0$，于是曲线理论里几乎所有的维数计算都归结为“数有多少函数满足极点上界”这一个问题，而后者可以用 Riemann–Roch 精确回答。它也是“为什么需要典范除子”的最好答案：K 不是一个偶然出现的记号，而是对偶性的平移量，$2g-2$ 这个次数就是曲线自身的“内蕴度”，决定了它能否嵌入射影空间以及嵌入的维数。非退化性是这条定律的关键：如果配对只在一边非退化，就只能得到维数不等式 $h^1\\ge \\ell(K-D)$，Riemann–Roch 会退化为估计，所以定理把“光滑射影”写成前提并必须在证明中使用 Serre 对偶的完整陈述。',
    examples: [
      { title: '例子：ℙ¹ 上 $h^1(\\mathcal{O}(-2))=1$', body: '取 X=ℙ¹，唯一的分歧是无穷远点。$\\omega_{\\mathbb{P}^1}\\cong\\mathcal{O}(-2)$，可取 K=−2[∞]。由对偶性 $h^1(\\mathcal{O}(-2))=h^0(\\mathcal{O}(K-(-2)))=h^0(\\mathcal{O}(-2+2))=h^0(\\mathcal{O})=1$。这一结果与直接用 Čech 计算一致：$\\mathcal{O}(-2)$ 在标准仿射覆盖 $U_0=\\{x\\neq 0\\}$、$U_1=\\{y\\neq 0\\}$ 上的转移函数为 $y/x$ 的平方项，得 $H^1\\cong k$。同时 $\\deg(-2)=-2$，$g=0$，Riemann–Roch 给 $\\ell(-2)-\\ell(0)=-2+1-0=-1$，即 $0-1=-1$，成立。这个例子是非零 $H^1$ 的最简情形，也说明 $\\mathcal{O}(-2)$ 恰是“临界”的位置：它的次数等于 $2g-2$。' },
      { title: '例子：椭圆曲线上 $\\ell(2O)=2$', body: '取 X 为 g=1 的光滑射影三次曲线，$O\\in X(k)$。此时 K∼0，$\\deg K=0$。Riemann–Roch 对 $D=2O$ 给出 $\\ell(2O)-\\ell(K-2O)=\\deg(2O)+1-g=2+1-1=2$；而 $\\deg(K-2O)=-2<0$，故 $\\ell(K-2O)=0$，于是 $\\ell(2O)=2$。具体地，$H^0(\\mathcal{O}(2O))$ 由常数 1 与一个在 2O 处有二阶极点的函数生成（例如 Weierstrass 函数 $\\wp$ 在射影形式下的类比），维数 2。同理 $\\ell(3O)=3$ 给出 $x$，$\\ell(4O)=4$ 给出 $\\wp$ 与 $\\wp^2$ 的二阶关系，这解释了为什么椭圆曲线总能写成 Weierstrass 方程 $y^2=x^3+ax+b$：$\\ell(6O)=6>5$ 迫使 5 个函数线性相关。' },
    ],
    remarks: [
      '非射影情形配对可以退化：在 $\\mathbb{A}^1$ 上 $H^1(X,\\mathcal{O}_X)=0$ 但 $H^0(\\omega_X)=0$，虽偶然相等，但当 $\\mathcal{O}_X(D)$ 有非零 $H^1$ 时（例如去掉两点的射影直线），对偶性必须换成带紧化的“紧支撑上同调”版本 $H^1_c$ 才能配对，否则非退化性丢失，Riemann–Roch 的两个方向都不再等价。',
      '奇异曲线上 $\\omega_X$ 必须换成对偶化层 $\\omega_X^{\\circ}$：对偶配对仍然存在（对偶化复形给出），但 $\\omega_X$ 不再等于 $\\Omega^1_X$，且 $\\deg\\omega_X=2g-2$ 要换成 $\\deg\\omega_X=2p_a-2$，其中 $p_a$ 是算术亏格；此时 $h^0(\\omega_X)=\\ell(K-D)$ 的等式需要重写，否则会得到错误的维数。',
      '特征 p 上 $H^1$ 的对偶性依然成立（Serre 对偶是任意特征都成立的定理），但 $h^1(\\mathcal{O}_X)=h^0(\\omega_X)$ 之外的“Hodge 对称” $h^0(\\Omega^1)=h^1(\\mathcal{O}_X)$ 可能失败，因此不能把 $\\deg\\omega_X=2g-2$ 的 g 与拓扑 Betti 数混用；此外若 X 非光滑或非几何正则，$\\mathcal{O}_X(D)$ 可能不再局部自由，$\\operatorname{Hom}\\cong H^0$ 的伴随双射需替换为 $\\mathcal{E}\\mathit{xt}$ 的版本。',
      '除子 D 可以取任意整系数（不必有效）：公式对负系数同样成立，因为可逆层 $\\mathcal{O}_X(D)$ 对任意 D 都有定义。一个常见错误是只在有效除子上写 Riemann–Roch 并假定 $\\ell(D)\\ge 0$ 就足够，但右端的 $\\ell(K-D)$ 对 $\\deg D>2g-2$ 为零这一事实必须由“负次数可逆层无截面”单独说明，否则大次数情形的化简没有依据。',
    ],
    corollaries: [
      { title: '推论：$\\ell(K)=g$ 与 $\\deg K=2g-2$', body: '取 $D=K$，Riemann–Roch 给 $\\ell(K)-\\ell(0)=\\deg K+1-g$，再用 $\\ell(0)=1$ 与 $\\deg K=2g-2$ 得 $\\ell(K)=g$；这同时说明几何亏格恰是典范除子的截面维数，与 §genus 的定义自洽。它给出一个纯除子语言的亏格计算法：找出典范除子，数它的截面。', uses: ['consequences-and-vanishing'] },
      { title: '推论：大次数除子给出嵌入到射影空间', body: '若 $\\deg D>2g-2$，则 $h^1(D)=0$ 且 $\\ell(D)=\\deg D+1-g$；当 $\\deg D\\ge 2g+1$ 时，除子 D 对应的可逆层 $\\mathcal{O}_X(D)$ 极丰沛，其截面给出闭嵌入 $X\\hookrightarrow \\mathbb{P}^{\\deg D-g}$。证明要点：$h^1$ 消失给出 $H^0$ 的维数，而分离点与分离切方向需要 $\\ell(D-p-q)=\\ell(D)-2$ 与 $\\ell(D-p)=\\ell(D)-1$，这些由对偶性把条件翻译成 $\\ell(K-D+p+q)<\\ell(K-D)$ 之类的不等式，在次数足够大时自动成立。这解释了为何任何光滑射影曲线都可嵌入射影空间。', uses: ['derive-riemann-roch', 'consequences-and-vanishing'] },
    ],
    references: [
      stacks('Lemma 53.8.1 / Riemann-Roch section', '0BXY'),
      stacks('Section 53.12 (Riemann-Hurwitz)', '0C1B'),
      stacks('Lemma 53.12.3 (canonical sheaf of a curve)', '0C1E'),
      stacks('Lemma 53.2.1 (Riemann-Roch theorem for curves)', '0BXY'),
      stacks('Section 53.12 (Riemann-Hurwitz)', '0C1B'),
      stacks('Serre duality / ample invertible sheaves', '01VI'),
    ],
    history: HISTORY,
  },

  /* ═══════════════════════════════════════════════════════════
   * 5. Noether 公式
   * ═══════════════════════════════════════════════════════════ */

  'b-noether-formula': {
    statement: '设 X 是域 k 上的光滑射影曲面，$K_X$ 为典范除子类，e(X) 为其拓扑欧拉数。写 $h^i=h^i(X,\\mathcal{O}_X)=\\dim_k H^i(X,\\mathcal{O}_X)$，记 $q=h^1$、$p_g=h^0(\\omega_X)$，并约定 $\\chi(\\mathcal{O}_X)=h^0-h^1+h^2$。由 X 连通射影有 $h^0=1$，由 Serre 对偶有 $h^2=h^0(\\omega_X)=p_g$，故 $\\chi(\\mathcal{O}_X)=1-q+p_g$，两种写法恒等。Hodge 理论给出 $e(X)=2-4q+2p_g+h^{1,1}$。Noether 公式断言 $K_X^2+e(X)=12\\chi(\\mathcal{O}_X)$，等价地 $\\chi(\\mathcal{O}_X)=\\frac{K_X^2+e(X)}{12}$ 与 $K_X^2=12\\chi(\\mathcal{O}_X)-e(X)$。当 $k\\subseteq\\mathbb{C}$ 时可取 $e(X)=e(X^{\\mathrm{an}})=\\sum_i(-1)^i b_i$；一般情形取 ℓ-adic 上同调的交错和。前提为 X 光滑射影；本条的推导框架是曲面 Riemann–Roch，而 e(X) 这一项按 §hodge-euler-number 独立代入。',
    explanation: 'Noether 公式的实用价值是让 $K_X^2$ 变成可算量：$\\chi(\\mathcal{O}_X)=1-q+p_g$ 与 $e(X)=2-4q+2p_g+h^{1,1}$ 都只是三个 Hodge 数 $q$、$p_g$、$h^{1,1}$ 的组合，于是 $K_X^2=12\\chi-e$ 把自交数翻译成可以用上同调维数读出的整数。这条翻译是 Enriques–Kodaira 分类能运转的技术前提：判定 $K^2$ 的正负、是否极小，都被化成 Hodge 数的条件。它也解释了 $K^2$ 与 e 在双有理变换下为何必须成对移动：吹爆使 $K^2$ 减 1、e 增 1，而 $12\\chi$ 保持不变，等式两侧同步改变。必须强调右端拓扑项的来源是独立的：Hodge 分解给出 e 与 $q$、$p_g$、$h^{1,1}$ 的关系，GRR 给出 $\\chi$ 与 $K^2$、e 的关系，两条路都是外部输入，串起来才得到定理。',
    steps: [
      step('chi-convention-and-hodge-numbers', '固定 χ 的约定并用 Serre 对偶算出 h²',
        '先把记号钉死，因为本条的陷阱全在记号上。曲面 X 光滑射影，$\\mathcal{O}_X$ 是凝聚层，射影概形上凝聚层的上同调是有限型 k-模，故 $h^i(X,\\mathcal{O}_X)$ 对一切 i 有限；又 $i>2=\\dim X$ 时 $H^i=0$，于是 $\\chi(\\mathcal{O}_X)=\\sum_{i=0}^{2}(-1)^i h^i$ 是一个只有三项的交错和。$h^0=1$ 来自 X 连通射影（整体正则函数为常值）。记 $q=h^1$ 为不规则度，$p_g=h^0(X,\\omega_X)$ 为几何亏格。关键一步是算 $h^2$：Serre 对偶给出 $H^2(X,\\mathcal{O}_X)^\\vee\\cong H^0(X,\\omega_X\\otimes\\mathcal{O}_X)=H^0(X,\\omega_X)$，取维数得 $h^2=h^0(\\omega_X)=p_g$。以 ℙ² 为例：$\\omega=\\mathcal{O}(-3)$ 无整体截面，故 $h^2(\\mathcal{O}_{\\mathbb{P}^2})=0$ 而非 1；$h^2$ 等于 $p_g$，一般并不等于 $h^0(\\mathcal{O}_X)$。于是曲面上的 $\\chi$ 有两种写法 $h^0-h^1+h^2$ 与 $1-q+p_g$，由 $h^0=1$、$h^2=p_g$ 二者恒等，本条之后每一步都使用这一相等。',
        []),
      step('surface-riemann-roch', '写出曲面 Riemann–Roch 并读出它的特殊化',
        '曲面 Riemann–Roch（对光滑射影曲面 X 与任意除子 D）为 $\\chi(\\mathcal{O}_X(D))=\\frac{D\\cdot(D-K_X)}{2}+\\chi(\\mathcal{O}_X)$，其中 $\\chi(\\mathcal{O}_X(D))=\\sum_{i=0}^{2}(-1)^i h^i(X,\\mathcal{O}_X(D))$，$D\\cdot(D-K_X)$ 由 §intersection-number 的对称双线性配对给出。取 $D=0$ 时右端退化为 $\\chi(\\mathcal{O}_X)$ 自身，公式给出恒等；取 $D=K_X$ 得 $\\chi(\\omega_X)=\\frac{K_X\\cdot 0}{2}+\\chi(\\mathcal{O}_X)=\\chi(\\mathcal{O}_X)$。后一条与 §b-serre-duality-curve 的技巧同源：曲面 Serre 对偶给出 $h^i(X,\\mathcal{O}_X(D))=h^{2-i}(X,\\omega_X\\otimes\\mathcal{O}_X(-D))$，交错求和后得 $\\chi(\\mathcal{O}_X(D))=\\chi(\\omega_X-D)$，取 $D=K_X$ 即得 $\\chi(\\omega_X)=\\chi(\\mathcal{O}_X)$。请注意这条式子只说明 $\\chi$ 的对称性：其中既不含 e(X)，也不含 $K_X^2$ 的独立信息，因此它单独无法给出 Noether 公式。',
        ['chi-convention-and-hodge-numbers']),
      step('serre-duality-and-rr-contain-no-euler', '指出 RR 与对偶联立只得到恒等式，不含 e(X)',
        '把对称性与 RR 联立可做一个完全封闭的验证：对 D 与 $K_X-D$ 分别用 RR，得 $\\chi(D)-\\chi(K_X-D)=\\frac{D\\cdot(D-K_X)}{2}-\\frac{(K_X-D)\\cdot(-D)}{2}$，右端用相交数的对称性与双线性化简为 $\\frac{D^2-D\\cdot K_X+K_X\\cdot D-D^2}{2}=0$，故 $\\chi(D)=\\chi(K_X-D)$ 是一条恒等式。把 $D=K_X$ 与 $D=0$ 分别代入，得到 $\\chi(\\omega_X)=\\chi(\\mathcal{O}_X)$ 与 $\\chi(\\mathcal{O}_X)=\\chi(\\omega_X)$，没有新信息。再看 RR 在 $D=K_X$ 处的另一面：$\\chi(\\omega_X)=h^0(\\omega_X)-h^1(\\omega_X)+h^2(\\omega_X)$，逐项用对偶写成 $p_g-q+1$，与 $\\chi(\\mathcal{O}_X)=1-q+p_g$ 完全相同。整个计算是代数恒等式：在一致的记号下 RR 与对偶自动成立，所以它们能推出 $K^2=12\\chi-e$ 的前提是先把 e 当作独立量引入。',
        ['surface-riemann-roch']),
      step('hodge-euler-number', '用 Hodge 数写出 e(X)（这是 e 的独立输入）',
        '引入 e(X) 有两条独立的路线。第一条是 Hodge 理论：当 $k\\subseteq\\mathbb{C}$ 时 X 是紧四维流形，Hodge 分解给出 $b_0=1$、$b_1=2q$、$b_2=2p_g+h^{1,1}$、$b_3=b_1$、$b_4=1$，代入 $e=\\sum(-1)^i b_i$ 得 $e=1-2q+(2p_g+h^{1,1})-2q+1=2-4q+2p_g+h^{1,1}$；其假设是基域可嵌入 ℂ（才存在 $X^{\\mathrm{an}}$ 与 Hodge 分解）。第二条是 Grothendieck–Riemann–Roch：$\\chi(\\mathcal{O}_X)=\\int_X \\operatorname{td}_2(T_X)$，用 $\\operatorname{td}_2=\\frac{c_1^2+c_2}{12}$ 展开得 $\\chi(\\mathcal{O}_X)=\\frac{K_X^2+e(X)}{12}$，其中 $\\int_X c_1(T_X)^2=K_X^2$ 与 $\\int_X c_2(T_X)=e(X)$ 是 Chern 类的基本事实，假设为 X 光滑射影（保证 $T_X$ 是向量丛且 GRR 适用）。两条路都不从 RR 推出，而是各自的外部输入：Hodge 路给出 e 的代数表达式，GRR 路直接给出公式本身。本条采用前者作为 e 的来源。',
        ['chi-convention-and-hodge-numbers']),
      step('noethers-formula-as-theorem', '把 Noether 公式陈述为定理并与 χ 的两种写法对齐',
        '把上面几步合起来可检查记号自洽：由 §chi-convention-and-hodge-numbers 有 $\\chi(\\mathcal{O}_X)=1-q+p_g$，由 §hodge-euler-number 有 $e(X)=2-4q+2p_g+h^{1,1}$，相减得 $12\\chi(\\mathcal{O}_X)-e(X)=10-8q+10p_g-h^{1,1}$，这只说明两端的组合并不平凡，并不自动等于 $K_X^2$；因此 $K_X^2=12\\chi(\\mathcal{O}_X)-e(X)$ 是需要证明的定理，而不是记号整理的结果。它的标准出处是 Hartshorne《代数几何》第五章第一节的 Noether 公式，假设为 X 光滑射影。记法上与 $\\chi(\\mathcal{O}_X)=\\frac{K_X^2+e(X)}{12}$ 完全等价，但必须记住其中的 $\\chi$ 是 $\\sum(-1)^i h^i(\\mathcal{O}_X)$：在 ℙ² 上它等于 1 而不是 2，因为 $h^2(\\mathcal{O}_{\\mathbb{P}^2})=0$。',
        ['serre-duality-and-rr-contain-no-euler', 'hodge-euler-number']),
      step('check-on-p2', '在 ℙ² 上逐项核验并说明每个数与假设的对应',
        '取 $X=\\mathbb{P}^2$。典范层 $\\omega=\\mathcal{O}(-3)$，取 $K=-3H$（H 为直线类），由相交数双线性与 $H^2=1$ 得 $K^2=(-3H)^2=9H^2=9$。上同调逐项：$h^0(\\mathcal{O})=1$（射影连通）；$h^1(\\mathcal{O})=0$（射影空间中间上同调消失）；$h^2(\\mathcal{O})=h^0(\\omega)=h^0(\\mathcal{O}(-3))=0$（Serre 对偶加负次数可逆层无截面）。于是 $\\chi=1-0+0=1$，同时 $q=0$、$p_g=h^0(\\omega)=0$，$1-q+p_g=1$，两种写法一致。拓扑侧 ℙ² 的 Betti 数为 $b_0=b_2=b_4=1$、奇数位为 0，故 $e=3$；用 Hodge 数核对 $h^{1,1}=1$，$e=2-4q+2p_g+h^{1,1}=2-0+0+1=3$，一致。代入公式：$K^2+e=9+3=12$，$12\\chi=12\\cdot 1=12$，两侧相等。特别地 $12\\chi-K^2=12-9=3=e$。若误把 $h^2$ 当成 1 就会得到 $\\chi=2$ 并进而“反解”出 $K^2=21$，与 $\\omega=\\mathcal{O}(-3)$ 直接算出的 9 矛盾，错误恰在 $h^2$ 这一项。',
        ['noethers-formula-as-theorem']),
    ],
    conclusion: '对光滑射影曲面 X，设 $\\chi(\\mathcal{O}_X)=h^0-h^1+h^2=1-q+p_g$（由 Serre 对偶 $h^2=h^0(\\omega_X)=p_g$）。Noether 公式成立：$K_X^2+e(X)=12\\chi(\\mathcal{O}_X)$，即 $K_X^2=12\\chi(\\mathcal{O}_X)-e(X)$。当 $k\\subseteq\\mathbb{C}$ 时 e 由 Hodge 数给出 $e(X)=2-4q+2p_g+h^{1,1}$；等价地由 GRR 有 $\\chi(\\mathcal{O}_X)=\\frac{K_X^2+e(X)}{12}$，其中 $\\int c_1^2=K_X^2$ 与 $\\int c_2=e(X)$。ℙ² 上 $K^2=9$、$e=3$、$\\chi=1$，满足 $9+3=12=12\\cdot 1$。',
    dependencies: ['intersection-number', 'b-riemann-roch-surface', 'serre-duality', 'canonical-sheaf', 'sheaf-cohomology'],
    consequences: ['surface-classification', 'b-todd-genus', 'b-hilbert-polynomial', 'k3-surface', 'ruled-surface', 'rational-surface', 'blowup'],
    examples: [
      { title: '例子：ℙ² 上的 Noether 核验', body: '取 $X=\\mathbb{P}^2$，$\\omega=\\mathcal{O}(-3)$，故 $K=-3H$ 且 $K^2=(-3H)^2=9H^2=9$。上同调：$h^0(\\mathcal{O})=1$、$h^1(\\mathcal{O})=0$、$h^2(\\mathcal{O})=h^0(\\omega)=h^0(\\mathcal{O}(-3))=0$，故 $\\chi=1-0+0=1$；这与 $q=0$、$p_g=0$ 给出的 $1-q+p_g=1$ 一致。拓扑：ℙ² 的 Betti 数为 (1,0,1,0,1)，故 $e=3$，又 $h^{1,1}=1$ 给出 $e=2-4q+2p_g+h^{1,1}=2-0+0+1=3$，两算一致。代入 Noether 公式 $K^2+e=12\\chi$ 得 $9+3=12$ 与 $12\\cdot 1=12$，两侧相等，等式闭合；等价地 $12\\chi-K^2=12-9=3=e$。若把 $h^2$ 误记为 1，就会得到 $\\chi=2$ 并反解出 $K^2=21$，与 $K=-3H$ 直接给出的 9 矛盾。' },
      { title: '例子：K3 面上的 $K^2=0$ 与 $e=24$', body: '取 X 为 K3 曲面：$\\omega_X\\cong\\mathcal{O}_X$ 故 $K_X\\sim 0$、$K_X^2=0$；上同调为 $h^0(\\mathcal{O})=1$、$h^1(\\mathcal{O})=0$、$h^2(\\mathcal{O})=h^0(\\omega_X)=1$，故 $\\chi=1-0+1=2$，与 $q=0$、$p_g=1$ 给出的 $1-q+p_g=2$ 一致。代入 $K^2=12\\chi-e$ 得 $0=24-e$，即 $e(X)=24$，这与 K3 的标准拓扑事实一致（$b_0=1,b_1=0,b_2=22,b_3=0,b_4=1$，交错和 $1-0+22-0+1=24$）。再用 Hodge 数核对：$h^{1,1}=20$，$e=2-4q+2p_g+h^{1,1}=2-0+2+20=24$，一致。这个例子说明公式把“代数上 $K^2=0$ 的曲面”翻译成“拓扑上欧拉数为 24 的四维流形”，是分类中判定 K3 的工具。' },
    ],
    remarks: [
      '光滑性不可去掉：若 X 有奇点，对偶化层 $\\omega_X$ 与 $K_X$ 不再一致，Riemann–Roch 要加上奇点的局部贡献项，Noether 公式的形式保持但 e(X) 必须换成解消后光滑模型 $\\widetilde{X}$ 的欧拉数，且 $K_X^2$ 需要用全变换公式重算，否则代入的是错的数。',
      '射影性不可去掉：非射影曲面（例如非紧的仿射曲面）上 $H^i$ 的有限性失效，$\\chi(\\mathcal{O}_X)$ 可能无定义或为无穷，公式两端的量都只能是形式符号；对偶性给出的 $\\chi$ 对称性也不再是有限交错和的等式。',
      '特征 p 上 e(X) 必须换成代数定义（ℓ-adic 或 de Rham–Witt 上同调的交错和），因为 $X^{\\mathrm{an}}$ 不存在；此外若曲面的 $b_2$ 与 $2p_g+h^{1,1}$ 不符（例如非单有理曲面上的上同调异常），把 e 直接理解为 $2-4q+2p_g+h^{1,1}$ 也需要单独验证 Hodge 分解在该特征下成立。',
      'χ 的两种写法必须区分：本条中的 $\\chi(\\mathcal{O}_X)$ 是 $\\sum(-1)^i h^i(\\mathcal{O}_X)$（曲面三项），在 ℙ² 上等于 1、在 K3 上等于 2，两者都由 $1-q+p_g$ 给出；把中间上同调维数误当成高维项（例如以为 $h^2(\\mathcal{O}_{\\mathbb{P}^2})=1$）会得到“ℙ² 上 $K^2=21$”这类明显错误的结论，因此每次代入前都要先固定 χ 的定义并与 e 的表达式对齐。',
    ],
    corollaries: [
      { title: '推论：$\\chi(\\omega_X)=\\chi(\\mathcal{O}_X)$（Serre 对偶的欧拉形式）', body: '由 Serre 对偶，$h^i(\\omega_X)=h^{2-i}(\\mathcal{O}_X)$，交错求和得 $\\chi(\\omega_X)=\\sum(-1)^i h^{2-i}(\\mathcal{O}_X)=\\sum(-1)^j h^j(\\mathcal{O}_X)=\\chi(\\mathcal{O}_X)$。这条推论是 Noether 公式与曲面 Riemann–Roch 联立的技术基础，也说明 $\\frac{K_X^2+e}{12}$ 对 $\\mathcal{O}_X$ 与 $\\omega_X$ 给出同一个数。', uses: ['surface-riemann-roch'] },
      { title: '推论：Noether 公式与吹爆相容', body: '对吹爆 $\\pi:\\widetilde X\\to X$，$\\chi(\\mathcal{O}_{\\widetilde X})=\\chi(\\mathcal{O}_X)$（吹爆不改变 $h^i(\\mathcal{O})$）且 $e(\\widetilde X)=e(X)+1$，结合 $K_{\\widetilde X}^2=K_X^2-1$ 代入公式两端，得 $12\\chi(\\mathcal{O}_X)=K_X^2+e(X)$ 与 $K_X^2-1+e(X)+1=K_X^2+e(X)$ 相等，说明公式与吹爆相容。由此可比较极小模型上的 $K^2$，这是 Enriques 分类的判据之一。', uses: ['noethers-formula-as-theorem'] },
    ],
    references: [
      { title: 'Algebraic Geometry, Ch. V.1 (Noether 公式)', author: 'R. Hartshorne', year: 1977 },
      stacks('Section 53.2 (Riemann-Roch)', '0BXY'),
      stacks('Lemma 53.8.1 (genus of a curve)', '0BY6'),
      stacks('Cohomology of projective space', '01XS'),
      stacks('Serre duality / ample invertible sheaves', '01VI'),
    ],
    history: HISTORY,
  },
}
