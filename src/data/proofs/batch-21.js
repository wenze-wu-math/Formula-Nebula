/**
 * 批次 21 长篇证明数据：层化、单值表示、消没轮与 D-模理论。
 *
 * 本批次全部正文使用双引号字符串，内嵌 LaTeX 一律双写反斜杠；
 * 数学段内不使用 Unicode 质数撇号，用 ASCII 撇号（在双引号中安全）。
 */

const step = (id, title, body, uses) => ({ id, title, body, uses: uses ?? [] })

export const BATCH_21_PROOFS = {

  /* ═══════════════════════════════════════════════════════════
   * 1. e-sheafification 层化
   * ═══════════════════════════════════════════════════════════ */

  'e-sheafification': {
    statement: "设 X 是带 Grothendieck 拓扑的范畴 $C$，$\\mathrm{PSh}(C)$ 是预层范畴，$\\mathrm{Sh}(C)$ 是层范畴。层化函子 $(-)^+$（或记作 $\\check{}$）是层范畴嵌入 $\\mathrm{Sh}(C)\\hookrightarrow\\mathrm{PSh}(C)$ 的左伴随；对预层 $\\mathcal{F}$，其层化 $\\mathcal{F}^+$ 是使每个映射 $\\mathcal{F}\\to\\mathcal{G}$（$\\mathcal{G}$ 为层）唯一透过 $\\mathcal{F}\\to\\mathcal{F}^+$ 分解的层。关键性质是茎不变：对每个点（或筛对应的几何点）$x$，有 $(\\mathcal{F}^+)_x=\\mathcal{F}_x$。",
    explanation: "层化像是对预层做一次整体化修补：预层允许局部截面各说各话，层要求局部数据满足相容性后一定拼成整体截面。直接用覆盖的相容族定义层，往往要先做一次掀开再按下，于是标准做法是两次加号构造：第一次把局部相容性压成截面，第二次保证这种截面本身的相容性仍成立。茎不变性保证几何信息（每点的“层芽”）在修补前后完全相同，变的只是开集上的整体截面。左伴随的代数含义是层化保持余极限但不保持极限，这一不对称正是层范畴里纤维积、核等极限要“先取预层版本再层化”的原因。",
    steps: [
      step('plus-construction', "加号构造：沿筛的截面",
        "对预层 $\\mathcal{F}$ 和对象 U，定义 $\\mathcal{F}^+(U)$ 为所有覆盖族 $(U_i)$ 连同相容截面族 $s_i\\in\\mathcal{F}(U_i)$ 的集合，按“加细等价”取商：两个族若有一个公共加细约束到相同值就等同。这一步已经把所有可拼合的局部截面提升为 U 上的元素。对层 $\\mathcal{G}$，任何 $f\\colon\\mathcal{F}\\to\\mathcal{G}$ 沿覆盖逐块作用后由层的粘合公理得到唯一全体映射，这给出自然映射 $\\mathcal{F}\\to\\mathcal{F}^+$ 的同构性证明所需的泛性质，即 $\\mathrm{Hom}(\\mathcal{F}^+,\\mathcal{G})\\cong\\mathrm{Hom}(\\mathcal{F},\\mathcal{G})$。",
        []),
      step('plus-twice-is-sheaf', "两次加号才得到层",
        "一次加号后的 $\\mathcal{F}^+$ 一般还不是层，因为层公理的相容性要求对任意覆盖（不是单个覆盖族）的“族之族”做再整理。重复加号构造 $\\mathcal{F}^{++}=(\\mathcal{F}^+)^+$，利用覆盖的传递性可验证 $\\mathcal{F}^{++}$ 是层：对 $\\mathcal{F}^{++}$ 的任意覆盖相容族，先把它们在 $\\mathcal{F}^+$ 中的代表逐覆盖压成截面，再用 $\\mathcal{F}^+$ 经第二次加号压成整体截面。于是取 $\\mathcal{F}^\\sim=\\mathcal{F}^{++}$ 即为层化。关键点在于加细关系是过滤的，所以两次加号得到的对象稳定于加法。",
        ['plus-construction']),
      step('stalk-invariance', "茎在层化下不变",
        "固定点 $x$，茎 $\\mathcal{F}_x=\\varinjlim_{U\\ni x}\\mathcal{F}(U)$。覆盖族中的每个截面 $s_i$ 在 $x$ 处给出 $\\mathcal{F}_x$ 的元素，且加细等价不改变该元素：因为“在某邻域相等”正是获取茎的滤关系。于是有自然映射 $\\mathcal{F}^+_x\\to\\mathcal{F}_x$，其逆由把茎的任意代表元换成任意覆盖上的值给出（用开集自己作覆盖）。两层加号分别保持这一互逆，最终 $(\\mathcal{F}^\\sim)_x=\\mathcal{F}_x$。这条性质解释了为什么层化不影响局部计算（正则性、光滑性、可构造性的判断都在茎上做）。",
        ['plus-twice-is-sheaf']),
      step('adjunction-and-limits', "左伴随：保持余极限",
        "由加号构造的泛性质，$(-)^+$ 是 $\\iota\\colon\\mathrm{Sh}(C)\\hookrightarrow\\mathrm{PSh}(C)$ 的左伴随，即 $\\mathrm{Hom}_{\\mathrm{Sh}}(\\mathcal{F}^\\sim,\\mathcal{G})=\\mathrm{Hom}_{\\mathrm{PSh}}(\\mathcal{F},\\iota\\mathcal{G})$。左伴随保持范畴论中的全部余极限：直和、商、推出、归纳极限在“先算预层层次再层化”后等价于对每个项先层化再取余极限。例如两个预层的纤维积需要层化，其结果为预层纤维积的层化，这正与代数几何里拟凝聚层族的纤维积必须做层化的现象一致。",
        ['stalk-invariance']),
      step('limit-not-preserved', "不保持极限及其后果",
        "左伴随一般不保持极限。对预层 $\\mathcal{F},\\mathcal{G}$，预层极限 $\\lim_{\\leftarrow}$ 之后不必是层，因为逐对象相等的条件可能被局部拼合破坏；必须补一层化：$\\lim_{\\leftarrow}\\mathcal{F}_i$ 在层范畴中的正确对象是 $\\left(\\lim_{\\leftarrow}\\mathcal{F}_i\\right)^+$。这个不对称正是读出“层范畴里的纤维积不逐点计算”的机制：在层范畴中纤维积要先把两层的值逐对象做纤维积得到预层，再层化。对等化子和核同样成立。代数几何里最常碰到的情形是两个拟凝聚层的纤维积：预层纤维积在开集上逐点取环的纤维积，其层化才是整体的纤维积，因此截面不一定是逐点彭原，而可能带了来自覆盖的粘合信息。若省略层化而只取预层版本，得到的对象往往不再满足层公理，映射也不能作为层态射使用；这正是把“先在预层范畴算极限、再回填到层范畴”列为标准工序的原因。",
        ['adjunction-and-limits']),
    ],
    conclusion: "层化 $(-)^+$ 是层范畴嵌入预层范畴的左伴随，且保持茎：$(\\mathcal{F}^+)_x=\\mathcal{F}_x$。层化保持余极限，不保持极限；层范畴中的极限须由预层极限再层化得到。",
    dependencies: [],
    consequences: [],
    explanation: "读层化最有用的画面是“修补预层的粘合缺陷”：预层像分散的公告牌，层像被公理约束的粘贴画。加号构造一次把公告牌内容的相容部分收拢，两次则保证收拢本身不破坏任意覆盖。茎不变性是几何直觉的锚点，它说明层化的全部作用在整体层面而非局部层面。左伴随性质把这一操作纳入范畴框架，于是所有余极限运算在层范畴中自然可用，而极限要先降级再升级，这正是许多“别扭”层论公式的讲法。",
    examples: [
      { title: "例子：$\\mathbb{R}$ 上常值预层的层化", body: "取 X 为 $\\mathbb{R}$，$\\mathcal{F}(U)=k$（常值预层，所有限制为恒等）。$\\mathcal{F}^+(U)$ 对连通开集 U 仍是 k：单连通的有界覆盖只有 U 本身。对不连通 U=U_1∪U_2，覆盖族可以分别取 $U_1$ 与 $U_2$，得到两个值 $a_1,a_2\\in k$，等价类 (a_1,a_2) 与函数 (U 上逐分量常数) 一一对应。于是层化后的层对开集 U 给出“U 的每个连通分量的常值函数”，这正是通常的常值层 $\\underline{k}$。子例：U=(-1,0)∪(0,1) 时 $\\underline{k}(U)=k^2$ 而预层只为 k。",
        },
      { title: "例子：Zariski 拓扑的结构预层层化", body: "取 X=Spec A（A 整环），预层 $\\mathcal{F}(D(f))=A_f$。它已经是层吗？对主开集 D(f) 的覆盖 $D(f)=D(fg_1)∪D(fg_2)$，需要 $a_1/ f^{n_1}$ 与 $a_2/ f^{n_2}$ 在 $A_{fg_1g_2}$ 中一致才可推出在 $A_f$ 中一致。由于 $A_f$ 是整环，可把问题化成两个分数在 $A_{fg_1}$ 和 $A_{fg_2}$ 分别相等后，利用 $D(f)=D(fg_1)∪D(fg_2)$ 推出 $a_1f^{n_2}=a_2f^{n_1}$ 的对应关系，从而预层已是层。层化在此例中不改变任何值，说明它是真正把预层变层的工具而非内容置换器。",
        },
    ],
    remarks: [
      "若覆盖不满足传递性（即拓扑缺少 Grothendieck 公理），两次加号可能不足以保证层公理；此时层化必须由超滤或筛的更强处理定义，结论形式上仍成立但证明中的传递性一步缺失。",
      "若预层取值到非 Abel 群或不满足双函子的范畴，加号构造的等价类定义依赖具体幺半结构，层化公式需改为在导出范畴中对带接差的筛取极限，普通加号构造不直接适用。",
      "若拓扑的点（几何点）不存在，茎不变性要换成射的等价断言：$\\mathcal{F}^+$ 与 $\\mathcal{F}$ 有同构的加细茎；没有点时可把“茎”定义为沿所有筛的直极限，结论依然成立但表述不同。",
      "若去掉左伴随（例如只要求唯一的层近似而不要求它保持余极限），则层化的存在性仍可证明，但纤维积逐点计算等推论失效，层范畴与预层层范畴的关系退化为单纯的嵌入而非反射子范畴。",
    ],
    references: [
      { title: "Sheaves in Geometry and Logic", author: "Mac Lane, Moerdijk", year: 1992 },
      { title: "SGA 4 I: Théorie des topos", author: "Grothendieck, Verdier", year: 1972 },
    ],
    history: "本条由公开教材重新组织，项目自行改写并注明来源，未复制原文。",
  },

  /* ═══════════════════════════════════════════════════════════
   * 2. e-local-system 局部系与单值表示
   * ═══════════════════════════════════════════════════════════ */

  'e-local-system': {
    statement: "设 X 连通、局部弧连通且局部单连通，$x_0\\in X$ 是基点，$k$ 是域。秩 r 的局部系 $\\mathcal{L}$（局部常值 $k$-空间层）与表示 $\\rho\\colon\\pi_1(X,x_0)\\to\\mathrm{GL}_r(k)$ 一一对应：沿回路的平行移动给出 $\\rho$，而任意 $\\rho$ 由万有覆盖上等变构造恢复 $\\mathcal{L}$。在导出范畴层面，$H^i(X,\\mathcal{L})\\cong H^i(\\pi_1(X,x_0),V)$，其中 $V=\\mathcal{L}_{x_0}$ 带 $\\rho$ 作用。",
    explanation: "局部系是最接近“常值”的层，但它允许沿空间扭转，扭转由基本群的单值表示完整记录。牵连的关键对象是茎：固定基点后，茎上的 $\\pi_1$ 作用（平行移动）是局部系的全部信息。反过来给表示，利用万有覆盖是局部系分层化的平坦空间，把表示翻译成覆盖上的等变截面构造即得层。上同调层面的字典把“拓扑空间上的层上同调”变成“群的群上同调”，这是把拓扑问题代数化的标准入口：Galois 表示、模形式的系数、正则奇点微分方程都由此进出。",
    steps: [
      step("path-lift-and-monodromy", "沿路径的平行移动",
        "局部系 $\\mathcal{L}$ 在每点有可平凡化开邻域。给定路径 $\\gamma\\colon[0,1]\\to X$，用有限子覆盖链 $\\{\\gamma([t_i,t_{i+1}])\\}$ 上的平凡化把 $\\mathcal{L}_{\\gamma(0)}$ 的向量逐段搬至 $\\mathcal{L}_{\\gamma(1)}$。结果是拓扑的平移幺半群作用：复合路径对应复合线性映射。对同伦的路径，由局部常值性可把同伦在每处不动点附近的平凡化拉开，得到相同搬运结果，于是只依赖同伦类。由此对每条闭路 $\\gamma$ 得 $\\rho(\\gamma)\\in\\mathrm{Aut}(\\mathcal{L}_{x_0})$，且同伦类乘法给出群同态。",
        []),
      step("covering-space-construction", "由表示构造局部系",
        "设 $p\\colon\\tilde X\\to X$ 是万有覆盖，$\\pi_1(X,x_0)$ 以覆盖变换作用。给表示 $\\rho$，定义预层 $\\mathcal{L}_\\rho(U)=\\{$截面 $s\\colon p^{-1}(U)\\to V$：$s(\\sigma\\tilde x)=\\rho(\\sigma)s(\\tilde x)\\}$。该预层是层：覆盖上逐点等变性可逐纤维验证。局部常值性来自 $p$ 在小邻域上是同胚的限制（X 局部单连通），故某个邻域上所有纤维同构，截面空间同构于 V。茎在 $x$ 处是 $\\varinjlim$ 的等变截面集，恰是 $\\mathcal{L}_{x_0}\\cong V$。闭合路 $\\gamma$ 对应的平行移动正是左乘 $\\rho(\\gamma)$。",
        ['path-lift-and-monodromy']),
      step("bijection-on-isomorphism-classes", "一一对应的核实",
        "局部系给出表示，表示给出局部系，需要证明两个方向互逆。给定 $\\mathcal{L}$，其单值表示 $\\rho$ 构造的 $\\mathcal{L}_\\rho$ 的各茎 $\\cong V$，且局部平凡化与 $\\rho$ 的等变条件一致，故 $\\mathcal{L}_\\rho\\cong\\mathcal{L}$（把茎恒等映射展开成覆盖上的等变同构）。反方向：$\\mathcal{L}_{\\rho'}$ 的单值沿回路是 $\\rho'$ 的定义式直接读出。两个方向的自然性保证同构是范畴等价而不是集合级双射：层态射对应 $\\pi_1$-等变线性映射，复合与恒等同构也逐纤维成立。特别地，当表示落在 $\\mathrm{GL}_r(k)$ 的共轭类下时，局部系也由相应平凡化的同构类所识别，所以秩、核、像等表示论概念都可在层论中重写。",
        ['covering-space-construction']),
      step("cohomology-translation", "上同调翻成群上同调",
        "对局部系 $\\mathcal{L}$，取万有覆盖上的等变链复形：$C^i(\\pi_1,V)$ 由连续 $i$-上链 $\\pi_1^i\\to V$ 组成，微分为 $df(g_1,\\ldots,g_i)=g_1 f(g_2,\\ldots)-\\ldots+(-1)^i f(g_1,\\ldots,g_{i-1})$。比较 $H^i(X,\\mathcal{L})$ 与群上同调 $H^i(\\pi_1,V)$ 的标准路由是利用万有覆盖上的常值层：$p^*\\mathcal{L}$ 是常值层，且 $\\pi_1$ 在切片 $\\Gamma(\\tilde X,p^*\\mathcal{L})$ 上等变地作用。该等变链复形与 $\\pi_1$-模的炮正合解析出的同构给出 $H^i(X,\\mathcal{L})\\cong H^i(\\pi_1,V)$。在 $X$ 有 CW 复形结构时还可把链复形换成胞腔链，计算更为直接；$V$ 上的 $\\pi_1$ 作用既出现在边界算子中，也出现在群上同调微分中，因此维数不是逐项相等，而是同调类层面的同构。",
        ['bijection-on-isomorphism-classes']),
      step("sheaf-category-equivalence", "范畴等价与函数性",
        "局部系范畴到 $\\pi_1$-表示范畴的函子 $\\mathcal{L}\\mapsto(\\mathcal{L}_{x_0},\\rho)$ 是范畴等价：层态射是 $R$-线性同时逐纤维与平行移动交换，恰好对应等变线性映射。张量、对偶、拉回在该对应下都转成表示的相应操作：$\\mathcal{L}\\otimes\\mathcal{M}$ 对应 $\\rho_\\mathcal{L}\\otimes\\rho_\\mathcal{M}$，$\\mathcal{L}^\\vee$ 对应 $\\rho^\\vee$（转置逆），拉回对应表示沿群同态的复合。这一结构使表示论的张量操作全部在层论中可执行；反过来，若仅给出每个点的茎同构而不管单值作用，则同构只能局部成立。范畴等价还保持正合列，因为逐纤维的核与像仍满足层公理，故局部系子层、商层与扩张的表示论含义都与普通模论一致。",
        ['cohomology-translation']),
    ],
    conclusion: "在连通、局部弧连通且局部单连通的空间上，秩 r 局部系与 $\\pi_1(X,x_0)\\to\\mathrm{GL}_r(k)$ 的表示范畴等价，且 $H^i(X,\\mathcal{L})\\cong H^i(\\pi_1,V)$。该字典保持张量、对偶与拉回。",
    dependencies: [],
    consequences: [],
    explanation: "局部系的精髓是“局部恒定、整体扭转”。扭转信息的仓库是茎与基本群：任何两个茎由路径连接，而路径间差一个回路，因此茎上的基本群作用（单值矩阵族）决定整个层。万有覆盖视角把局部系看成覆盖上的常值层被覆盖变换等变性约束，直观上像把向量束在等变坐标下粘合。群上同调的搬运让基数由拓扑空间换成基本群，于是覆盖上同调、Galois 上同调、群上同调获得统一处理。",
    examples: [
      { title: "例子：圆上的秩一局部系", body: "取 $X=S^1$，$\\pi_1=\\mathbb{Z}$，基点任意。表示 $\\rho\\colon n\\mapsto q^n$（$q\\in k^{\\times}$）对应的局部系在万有覆盖 $\\mathbb{R}$ 上是常值层，等变条件 $s(t+1)=qs(t)$。茎 $\\mathcal{L}_{x}$ 是 k，单值沿环路乘以 q。$H^0(S^1,\\mathcal{L})=\\ker(q-\\mathrm{id})=\\{v: qv=v\\}$，$H^1(S^1,\\mathcal{L})=\\mathrm{coker}(q-\\mathrm{id})$；q=1 时两维为 k，q≠1 时 $H^0=0,H^1=k$，这正是 $H^i(\\mathbb{Z},k^{(q)})$。",
        },
      { title: "例子：亏格 g 曲面上的秩一表示", body: "取闭曲面 $\\Sigma_g$，$\\pi_1$ 由 $a_1,b_1,\\ldots,a_g,b_g$ 与单关系生成。给 $\\rho\\colon a_i\\mapsto x_i, b_i\\mapsto y_i$（$x_i,y_i\\in k^{\\times}$），关系自动成立因为 $k^{\\times}$ 交换。相应局部系的具体空间同构类由字符 $\\chi=(x_i,y_i)$ 决定。计算 $H^1$ 维数：$H^1(\\Sigma_g,\\mathcal{L}_{\\chi})$ 对非平凡字符是 $2g-2$，对平凡字符是 $2g$，可从群上同调直接验算：$H^1(\\mathbb{Z}^{2g},k)=\\ker$ 的余维在特征值非 1 时给出消失。",
        },
    ],
    remarks: [
      "若 X 不局部单连通（如“夏威夷耳环”空间的万有覆盖不存在），等变构造失去覆盖，单值表示仍可定义但失去一对一；对应的正确表述须用轨道空间或泛覆盖族。",
      "若去掉连通性，表示只能逐连通分支定义，整体对应是分支直积；把整体衔接的词（基点、万有覆盖）换成分支版本后字典仍成立。",
      "若 k 不是域或局部系取值不在有限维向量空间（如取值 Abel 群），$\\mathrm{GL}_r(k)$ 换成相应自同构群，单值定理的形式不变但群上同调的系数结构改变。",
      "若空间不满足豪斯多夫或路径同伦泛的宿主条件，单值映射可能不连续；此时要把平行移动改成沿同伦类映射并检查遍历性，否则 $\\rho$ 无法良定义。",
    ],
    references: [
      { title: "Algebraic Topology", author: "Hatcher", year: 2002 },
      { title: "Introduction to the Arithmetic Theory of Automorphic Functions", author: "Shimura", year: 1971 },
    ],
    history: "本条由公开教材重新组织，项目自行改写并注明来源，未复制原文。",
  },

  /* ═══════════════════════════════════════════════════════════
   * 3. e-monodromy-weight 单值分解与权滤过
   * ═══════════════════════════════════════════════════════════ */

  'e-monodromy-weight': {
    statement: "设 $f\\colon X\\to\\Delta$ 是半稳定退化：$f$ 光滑、合且一般纤维是紧 Kähler 流形，$X\\to\\Delta$ 相对维数 n。单值变换 $T\\in\\mathrm{Aut}(H^n(X_t))$ 有 Jordan 分解 $T=T_{ss}T_u$，$T_{ss}$ 半单、$T_u$ 幂单且交换。取 $N=\\log T_u$，则 $N^{k+1}=0$ 对 $k\\le n$（单值定理：$N^{n+1}=0$）。权滤过 $W_\\bullet$ 使 $N(W_i)\\subseteq W_{i-2}$，且在分次对象上 $N^i\\colon\\mathrm{gr}^W_{n+i}\\to\\mathrm{gr}^W_{n-i}$ 是同构（对 $i\\ge0$）。",
    explanation: "沿退化环路的单值常常不是半单的，这一非半单性正是退化独有的信息：Jordan 分解把 T 拆成可部分（半单）与不可逆的“退化部分”（幂单）。对数把幂单性变成幂零算子 N，退化的整体数据由 N 的幂零指数刻划。权滤过是按 N 的核、像与幂级数搭建的子空间塔：它让 N 成为权滤过的阶 1 算子，并把每个权的分次对象用 N 配对。对 Hodge 结构，权滤过与 Hodge 滤过兼容给出极限混合 Hodge 结构（MHS）。单值定理（Landman–Grothendieck 的经典形式）给出 $N^{n+1}=0$。",
    steps: [
      step('jordan-decomposition', "Jordan 分解与对数",
        "有限维自同态 T 的 Jordan 分解 $T=D+U$ 中存在唯一的半单部分 D 与幂单部分 U，互相交换。$U$ 幂单，故 $N=\\log U=\\sum_{j\\ge1}(-1)^{j+1}(U-\\mathrm{id})^j/j$ 是有限和且为幂零算子；$T=D\\exp N$。分支的意义：$\\exp$ 把幂零算子拉回到单位元附近的幂单，因而 $N$ 编码 T 在可微方向的行为。对退化族，T 的特征值全是单位根（准单值），$D$ 的对角化版本几乎半单，$N$ 成为“绕圈的代数变分”。若 U 的最小多项式的根恰为 1，则 U-id 幂零，log 的级数自动终止，故无需解析多值问题；这也说明 $N$ 是定义在有理结构上的整系数多项式，不依赖度量选择。",
        []),
      step('nilpotent-monodromy-theorem', "幂单性：$N^{n+1}=0$",
        "单值定理的算术内容：对紧 Kähler 纤维化，$N^{n+1}=0$。几何直觉是单元幂矩阵的幂零指数被 fiber 的缠绕次数控制：第 $n$ 个幂单在上同调里已经洗干净。证明用 de Rham 切映射：$T$ 在 $H^n$ 上的作用来自沿环路的纤维基变更，而 $\\log T$ 沿退化方向可看作纤维径向上的“整体角动”。对半稳定退化，$N$ 的对偶者 $H^n$ 中的精确签名被 $\\exp(N)$ 送到退化纤维的谱序列项。定理所用的外部工具是 Schmid 的 nilpotent orbit 定理（要求 $X\\to\\Delta$ 半稳定、相对维数 n、一般纤维紧 Kähler，并取 $N$ 的斜率滤波），它保证权滤过存在且 $N$ 在权分次上按格拉斯曼型平移。其幂零指数可用稳定部分的余维数表达：若 $N^r\\neq0$，则 $r$ 至多等于相对维数 n，且等号仅在含极端消没圈时才达到。失效模式是去掉半稳定性：非半稳定退化的单值可不再是准单值，$N$ 甚至不是幂零的，定理失效。",
        ['jordan-decomposition']),
      step('weight-filtration', "由 N 定义的权滤过",
        "构造权滤过 $W_\\bullet$ 的标准路子是“以 N 的核与像为砖”：考虑 N 提升到的环 $N(\\cdot)$，取 $W_i=\\sum_{j\\ge\\max(0,i-n)}\\ker(N^{j+1})\\cap\\mathrm{im}(N^{i-j})$ 的合适做法是取其间接递推：先定 $W_0=\\ker N^n$，再逐段加层。该滤过满足 $N(W_i)\\subseteq W_{i-2}$：因为 N 把核、像层的索引都降 2。且在 $\\mathrm{gr}^W$ 上，N 诱导同构 $N^i\\colon\\mathrm{gr}^W_{n+i}\\to\\mathrm{gr}^W_{n-i}$，这是“N 在第 n 维处对称”的代数表达。权滤过径由此与 N 绑定，不受选择 Hodge 滤过的影响。",
        ['nilpotent-monodromy-theorem']),
      step('mixed-hodge-structure-limit', "极限混合 Hodge 结构",
        "沿退化方向取 $t\\to0$，纤维上同调 $H^n(X_t)$ 的 Hodge 滤过 $F^\\bullet_t$ 沿 G 的格洛各方向平移到极限滤过 $F_0$。极限 MHS 由三件套 $(H^n(X_t),W_\\bullet,N,F_0)$ 组成，其中 $W$ 是权滤过（控制 N 的阶）、$F_0$ 是极限 Hodge 滤过（控制 Hodge 次数）。正则性质（$\\mathrm{gr}^W$ 上的 Hodge 结构纯）由 Schmid 的 nilpotent orbit 定理保证。N 的作用是 $(-1)$ 平移乘以 Hodge 型，使得权滤过的分次对象的 Hodge 次数错位 1。该构造不依赖退化纤维本身，而只依赖一般纤维与沿回路的单值，故极限 MHS 是退化族的“边界纤维”的内蕴不变量。",
        ['weight-filtration']),
      step('polarization-and-splitting', "极化与权滤过的作用",
        "半稳定结构的极化形式 $S$ 使 $S(Nx,y)+S(x,Ny)=0$（对应“转置”共轭），且 $S$ 在权滤过分次对象上降格成纯 Hodge 结构配对。权分解 $H^n=\\bigoplus \\mathrm{gr}^W_i$ 不是 $\\pi_1$ 稳定分解，但 $N$ 与 $W$ 的关系弥补：$N^i$ 给出 $\\mathrm{gr}^W_{n+i}\\cong\\mathrm{gr}^W_{n-i}$ 的配对。这个“对称权”在退化谱序列退化时给出 Hodge 数平衡，也是 Deligne 证明退化定理的关键。极化还保证每个分次对象上的 Lefschetz 分解成立，使权滤过的同构对可以进一步分解为不可约权结构，最终把 Hodge 数纳入稳定的整数表中。",
        ['mixed-hodge-structure-limit']),
    ],
    conclusion: "$T=T_{ss}T_u$，$N=\\log T_u$ 幂零且 $N^{n+1}=0$；权滤过 $W_\\bullet$ 使 $N(W_i)\\subseteq W_{i-2}$ 且在分次对象上 $N^i\\colon\\mathrm{gr}^W_{n+i}\\cong\\mathrm{gr}^W_{n-i}$。极限 MHS 由 $(H^n,W_\\bullet,N,F_0)$ 给出且带正交的极化条件。",
    dependencies: [],
    consequences: [],
    explanation: "退化族的单值矩阵不是半单的，这看起来是坏消息，实际正是退化本身的全部编码。Jordan 分解给出两个互不干扰的频道：半单部分记“旋转变”，幂单部分记“退化阻尼”。对数 N 把后者线性化，幂零指数则回答“退化到底损失多少层”。权滤过把 N 的作用组织成对称配对的层塔，于是退化谱序列的项被 N 对称配对，这正是极限 MHS 以及退化触发 Hodge 分解出现的原因。",
    examples: [
      { title: "例子：椭圆曲线族的结点退化", body: "取 $X_t\\colon y^2=x^3+tx$，一般纤维 $E$ 是椭圆曲线，$X_0$ 是结点。$H^1(E)$ 的秩 2，单值 T 的特征多项式 $(x-1)^2$，$T_u$ 是单个 2×2 Jordan 块，$N^2=0$。权滤过：$W_0=W_1=\\ker N=V$（rank 1）、$W_2=H$。分次对象 $\\mathrm{gr}^W_2=H/V$ 一维、$\\mathrm{gr}^W_0=V$ 一维、$\\mathrm{gr}^W_1=0$；$N$ 把 $\\mathrm{gr}^W_2$ 同构地送到 $\\mathrm{gr}^W_0$。这正与平面曲线退化的经典计算吻合。",
        },
      { title: "例子：K3 曲面族的 j-不变退化", body: "取 $X_t\\colon S\\to\\Delta$ 是 K3 曲面族，$X_0$ 是半稳定的（如含若干个 $\\mathbb{P}^1$-束的奇点）。$H^2$ 的秩 22，$T$ 可具幂单 Jordan 块：若退化含一条 $\\mathbb{P}^1$，$N^3=0$ 故 $N^2\\neq0$ 是可能的，权滤过 $W_2\\subset W_4=H^2$ 深度 2。$N^2\\colon\\mathrm{gr}^W_6\\cong\\mathrm{gr}^W_2$ 并非平凡（$\\mathrm{gr}^W_6=0$ 时要求 $N^2=0$），可见含 toric 奇点的退化使 $N^2\\neq0$，权滤过不对称出现实际内容。",
        },
    ],
    remarks: [
      "若去掉半稳定假设（纤维可以含非正规奇点），$T$ 可失去准单值性，$N$ 的幂零指数可超过 n，单值定理的 $N^{n+1}=0$ 失效。",
      "若去掉紧 Kähler 条件，nilpotent orbit 定理的负穿越引理不适用，$N$ 的权配对与极化可能失败，极限 MHS 也难以由周期映射良定义。",
      "若 T 已经半单（软退化），$T_u=\\mathrm{id}$，$N=0$，权滤过退化为平凡滤过，极限 MHS 变成纯 Hodge 结构；此时权滤过不提供任何新信息。",
      "若相对维数 n 不固定（纤维维数跳变），$H^n$ 的秩依赖纤维，单值定理只能逐不可约分支陈述，$N^{k+1}=0$ 的 k 要按最大维数取。",
    ],
    references: [
      { title: "Mixed Hodge Structures", author: "Peters, Steenbrink", year: 2008 },
      { title: "Degeneration of abelian varieties", author: "Faltings, Chai", year: 1990 },
    ],
    history: "本条由公开教材重新组织，项目自行改写并注明来源，未复制原文。",
  },

  /* ═══════════════════════════════════════════════════════════
   * 4. e-vanishing-cycle 消没轮
   * ═══════════════════════════════════════════════════════════ */

  'e-vanishing-cycle': {
    statement: "设 $f\\colon X\\to C$ 是紧合、光滑的相对维数 n 的态射，$C$ 是曲线，$0\\in C$。令 $j\\colon X^*=f^{-1}(C\\setminus\\{0\\})\\hookrightarrow X$，$i\\colon X_0=f^{-1}(0)\\hookrightarrow X$。邻近轮 $R\\Psi_f\\mathcal{F}=i^*Rj_*\\mathcal{F}$，消没轮 $R\\Phi_f\\mathcal{F}$ 由三角 $\\mathcal{F}\\to R\\Psi_f\\mathcal{F}\\to R\\Phi_f\\mathcal{F}\\to$ 定义（在某些引文中 $R\\Phi_f=\\mathrm{Cone}(\\mathcal{F}\\to R\\Psi_f)(-1)$）。核心性质 $R\\Psi_f\\mathcal{F}$ 是 $X_0$ 上的可构造复形，带自然单值作用 $T$，且对 $\\mathcal{F}$ 的拉回的维数有消没维数公式（Picard–Lefschetz 的消没圈）。",
    explanation: "邻近轮回答“退化纤维's 邻近”的上同调：把一般纤维拉回退化时刻，沿环路的搬运由单值作用捕获。消没轮则是“之差”：特殊纤维与邻近上同调的差，正是退化解消前的那部分（消没圈的来源）。两个轮在同一对象上耦合，单值作用 $T$ 作用在 $R\\Psi_f$ 上。消没轮公式说明它的支撑落在奇异轨迹，且其逐纤维上同调可由对称形式（消没圈）配对。这些对象在 $l$-进与 Hodge 设置下都可定义，构成局部上同调与单值的标准桥梁。",
    steps: [
      step('nearby-cycle-functor', "邻近轮与特殊化",
        "由独立三角构造函子 $R\\Psi_f=i^*Rj_*$ 作用于 $D^b_c(X)$ 的对象。几何含义：$Rj_*\\mathcal{F}$ 的纤维在 x 处取自 $\\mathcal{F}$ 沿 $f^{-1}(\\text{小圆盘})$ 的全局截面，再沿 $i^*$ 拉回退化纤维；其结果可构造复形的茎由 $\\mathcal{F}$ 在一般纤维的“邻近”部分重定义。茎计算：$(R\\Psi_f\\mathcal{F})_x=\\varinjlim H^*(U_x\\cap X^*, \\mathcal{F})$，其中 $U_x$ 取包含 x 的任意小邻域。因极限沿退化方向推进，$R\\Psi_f$ 的每个茎同构于恰当一般纤维上的同伦极限，故它在奇异点上“看穿”一般纤维而保留退化前的同伦型；这正是单值信息得以安放的地方。",
        []),
      step('vanishing-cycle-triangle', "消没轮三角",
        "局部化沿 $0$ 的正合性给三角 $R\\Psi_f\\mathcal{F}\\to R\\Phi_f\\mathcal{F}\\to R\\Psi_f\\mathcal{F}(-1)$ 的引理，但正确封装是 $\\mathcal{F}\\to R\\Psi_f\\mathcal{F}\\to R\\Phi_f\\mathcal{F}\\to\\mathcal{F}[1]$（某些文献取 Cone 的 $-1$ 平移使首项处平凡）。消没轮携带 $R\\Psi_f$ 的“亏格”，即退化时刻相对一般纤维多出的上同调。三角的长正合列逐次给出 $H^q(X_0)\\to H^q(X_t)\\to H^q(R\\Phi_f)\\to H^{q+1}(X_0)$，因此三方的维数彼此牵制；若 $R\\Phi_f$ 平凡则 $H^*(X_0)\\cong H^*(X_t)$，退化不损失任何类。",
        ['nearby-cycle-functor']),
      step('monodromy-on-nearby', "单值作用与 Jordan 分解",
        "$R\\Psi_f\\mathcal{F}$ 带自然单值 $T$：沿 $C\\setminus\\{0\\}$ 的圈 $c\\mapsto e^{2\\pi ic}$ 的搬运。$T$ 可逆且其 Jordan 分解给出可交换分解 $T_{ss}T_u$；$N=\\log T_u$。对 $\\mathcal{F}=\\mathbb{Z}$ 或 $\\ell$-adic 常数层，由单值定理 $N^{n+1}=0$。消没轮上的单值作用由三角传递，故消没轮的上同调也带 $N$ 作用且其幂零指数 ≤ n。因此消没轮的谱结构分成两部分：半单部分对应环绕奇点的可逆置换，幂单部分对应把某个类逐阶压进退化奇异层的消没过程；两部分可通过对数分离计算。",
        ['vanishing-cycle-triangle']),
      step('picard-lefschetz-class', "消没圈与 Picard–Lefschetz 公式",
        "当 $X_0$ 含孤立奇点时，$R\\Phi_f\\mathbb{Z}_\\ell$ 在上同调维数 n 的茎中给出自由模，生成元称为消没圈 $\\delta$。Picard–Lefschetz 公式写为：$T(v)=v\\pm\\langle v,\\delta\\rangle\\delta$（对称双线性形 $\\langle\\rangle$ 由相交配对给出），符号取决于局部定向。该公式是消没轮计算退化的核心表达，也说明消没轮的上同调由这样配对完全刻划。它的假设是奇点孤立且非退化（Morse 型，即 $X_0=f^{-1}(0)$ 在该点有非退化临界点）；若临界点退化（例如 $f=x^2y^2$），消没圈模维数大于 1，单个 $\\delta$ 的公式不再够用，须换成消没格的联合表示。对奇点个数多于 1 的情形，$R\\Phi_f$ 的茎分解为各孤立奇点处消没圈模的直和，公式逐奇点叠加；消没圈之间的正交性则由局部化配对给出，故不同奇点的贡献互不干扰。",
        ['monodromy-on-nearby']),
      step('vanishing-cycle-cohomology', "消没上同调与不变量",
        "取长正合列于三角可得退化谱序列：$H^*(X_t)\\to H^*(X_0)\\to H^*(R\\Phi_f)\\to$ 连接所有退化信息。消没上同调 $H^*(R\\Phi_f)$ 带权滤过与单值，其秩在孤立奇点情形等于消没圈数。不变量性质：$H^q(X_0)$ 与 $H^q(X_t)$ 的差由 $R\\Phi_f$ 读出，这是满秩比较的出发点。上述三角的长正合列把上一步的消没圈配对信息翻译成维数关系：$R\\Phi_f$ 的秩等于临界点处消没圈模的总秩，而两侧一般纤维与特殊纤维的维数差正好由这一秩补足。在光滑退化（$X_0$ 光滑）时 $R\\Phi_f=0$，三角退化为同构，消没上同调的直接算法在此退化到通常的位型计算；消没圈的支撑情形则给出奇点轨迹上的逐点维数，可供解消后的例外除子核对。",
        ['picard-lefschetz-class']),
    ],
    conclusion: "邻近轮 $R\\Psi_f=i^*Rj_*$ 与消没轮 $R\\Phi_f$ 由三角 $\\mathcal{F}\\to R\\Psi_f\\mathcal{F}\\to R\\Phi_f\\mathcal{F}\\to$ 关联；两者都是 $X_0$ 上的可构造复形且带同构的单值作用 $T$，$N=\\log T_u$ 幂零指数 ≤ n，消没圈的相交公式给出 Picard–Lefschetz 公式。",
    dependencies: [],
    consequences: [],
    explanation: "走过临界值时，一般纤维的拓扑在退化纤维的“蒸发”中遗失，邻近轮保管一般纤维的本征数据，消没轮则盯住被脱离的类。二者夹住三角，使退化族的上同调完全由 (特殊纤维,邻近轮,消没轮) 三件套确定。单值作用的 Jordan 部分正是消没轮净化后的残余，Picard–Lefschetz 则把这残余用几何配对显式写出。在代数几何应用中，$R\\Phi_f$ 的支撑与维数是奇点的指纹。",
    examples: [
      { title: "例子：$\\mathbb{A}^2$ 上的 $f(x,y)=xy$", body: "取 $X=\\mathbb{A}^2$，$f(x,y)=xy$，$X_0$ 是两直线并。邻近轮 $R\\Psi_f\\mathbb{Z}$ 在上同调维数 0 处给出秩 2（对应两分支绕圈），单值 $T$ 置换两分支。消没轮：$R\\Phi_f\\mathbb{Z}$ 在维数 -1 处茎是 $\\mathbb{Z}$（消没圈），其相关配对 $\\langle\\delta,\\delta\\rangle=2$。验证：$H^1(X_t=X^*)\\to H^1(X_0)$ 差出 rank 1，恰由消没上同调维数 -1 的平凡化读出。",
        },
      { title: "例子：y^2=x^3+t 家族的消没圈", body: "取 $X_t\\colon y^2=x^3+t$，$t=0$ 时结点。一般纤维是椭圆曲线上挖点（亏格 1 减 1），$H^1$ 秩 1。$R\\Phi_f\\mathbb{Z}$ 在维数 1 处茎 $\\mathbb{Z}/2$，单值 T 的 $N^2=0$。消没圈 $\\delta$ 的平方 $\\langle\\delta,\\delta\\rangle=2$，Picard–Lefschetz $T(v)=v+\\langle v,\\delta\\rangle\\delta$ 与原椭圆退化的已知单值（阶 2 的绕圈）一致。",
        },
    ],
    remarks: [
      "若去掉角点（$f$ 在 0 处不光滑），$X_0$ 可以整体奇异，邻近轮仍定义但消没轮的茎可能在非孤立奇的轨迹上不平凡，必须用整体可构造复形而非法线性项。",
      "若 $n=0$（相对维数零），$R\\Phi_f$ 平凡：退化是几何意义上的“有限覆盖”，消没轮不提供超额上同调，Picard–Lefschetz 公式退化为平凡恒等式。",
      "若在 $\\ell$-adic 设置下取 $\\ell$ 除 $q$ 被除，单值特征值的 Adams 操作不与 $T$ 交换，权滤过与 N 的协调需额外验证，消没轮的秩公式可能依赖 $\\ell$。",
      "若去掉紧合性，$Rj_*$ 不再保持有界可构造性，$R\\Psi_f\\mathcal{F}$ 可能落在无界导出范畴，消没轮的有限秩与谱序列退化结论不再成立。",
    ],
    references: [
      { title: "SGA 7 II: exposé XIII, Picard–Lefschetz", author: "Deligne, Katz", year: 1973 },
      { title: "Étale cohomology and the Weil conjecture", author: "Freitag, Kiehl", year: 1988 },
    ],
    history: "本条由公开教材重新组织，项目自行改写并注明来源，未复制原文。",
  },

  /* ═══════════════════════════════════════════════════════════
   * 5. e-nearby-cycle-functor 邻近轮与特殊化映射
   * ═══════════════════════════════════════════════════════════ */

  'e-nearby-cycle-functor': {
    statement: "设 $f\\colon X\\to C$ 使 $X^*=f^{-1}(C\\setminus\\{0\\})$，$j\\colon X^*\\hookrightarrow X$，$i\\colon X_0\\hookrightarrow X$。特殊化映射 $sp\\colon i^*\\mathcal{F}\\to R\\Psi_f\\mathcal{F}$ 对每个可构造复形 $\\mathcal{F}$ 定义，其锥 $\\mathrm{Cone}(sp)$ 称为邻近轮锥（或有文献称其为 $R\\Phi_f\\mathcal{F}(-1)$）。由此得到三角 $i^*\\mathcal{F}\\to R\\Psi_f\\mathcal{F}\\to R\\Phi_f\\mathcal{F}\\to i^*\\mathcal{F}[1]$，把特殊纤维、邻近纤维与消没部分组织成一个正合连接。",
    explanation: "特殊化映射是“把一般纤维的截面送到特殊纤维”的自然通道，但它的像在奇异点处往往亏格不全；锥则补全这一差距。把三者并进一个三角，等于用一条短正合的信息条控制在退化族上的全部上同调流动。邻近轮上面的单值作用限制在锥上，使消没部分携带独立的单值。这个框架统一了 Picard–Lefschetz 公式、消没圈配对与极限 Hodge 结构三方向的应用。",
    steps: [
      step('specialization-map', "特殊化映射的构造",
        "预层层面有自然变换 $\\mathcal{F}\\to j_*j^*\\mathcal{F}$（把截面看成限制）。在导出范畴中取 $Rj_*$，得 $\\mathcal{F}\\to Rj_*\\mathcal{F}$；沿 $i^*$ 得 $sp\\colon i^*\\mathcal{F}\\to i^*Rj_*\\mathcal{F}=R\\Psi_f\\mathcal{F}$。几何意义：特殊纤维 $X_0$ 上的截面先被看成 $X^*$ 上截面的延拓（通过 j），再取邻近部分。其茎层面即“$U_x\\cap X^*$ 上的整体截面”的归纳取极限。因该极限沿绕零点的圈也有定义，特殊化映射自然带上单值作用的来源；对截面只在特殊纤维上定义的情形，sp 的像记录它在一般纤维方向能够延拓的程度。",
        []),
      step('cone-and-triangle', "锥与双消没三角",
        "对 $sp$ 取锥 $R\\Phi_f\\mathcal{F}=\\mathrm{Cone}(sp)$，得三角 $i^*\\mathcal{F}\\xrightarrow{sp}R\\Psi_f\\mathcal{F}\\to R\\Phi_f\\mathcal{F}\\to i^*\\mathcal{F}[1]$。当 $f$ 是半稳定退化时，$R\\Phi_f\\mathcal{F}$ 的支撑落于奇异轨迹，且其逐纤维上同调是消没圈模。该三角对所有 $\\mathcal{F}$ 自然，且与单值作用兼容：$T$ 作用在 $R\\Psi_f$ 上，经由三角传递到 $R\\Phi_f$。锥的构造不依赖特殊纤维上的选择，因此特殊化三角在分离、有限型态射上都是基底可变的，拉回与基变更在该三角下相容。",
        ['specialization-map']),
      step('monodromy-compatibility', "单值兼容与 $N$ 的作用",
        "因 $R\\Psi_f\\mathcal{F}$ 带单值 $T$，三角的锥也带（同构意义下）单值 $\\tilde T$，其限制在 $\\mathrm{im}\\,sp$ 上是恒等，在消没部分由 $T_{ss}T_u$ 作用。$N=\\log\\tilde T_u$ 在锥的上同调上幂零指数 ≤ n，从而消没上同调被权滤过控制。这里用的外部定理就是上一节的单值定理：对相对维数 n 的半稳定退化，单值作用的幂单部分幂零指数不超过 n，而 $N$ 由 $\\log$ 构造，故其幂零阶同样受 n 约束。这使“单值分解与权滤过”节的结果在消没轮的语境下原样移植：权滤过 $W_\\bullet$ 使 $N(W_i)\\subseteq W_{i-2}$，故消没上同调的各权分次块被 N 配对。若换用 $j_!$ 构造紧支版本，则 $T$ 与 $N$ 的作用法则不变，但锥的平移与定向符号发生变化，因而使用前必须固定正合三角的方向。",
        ['cone-and-triangle']),
      step('fiberwise-cohomology-bounding', "消没轮的纤维上同调界定",
        "对中心纤维 x，$H^q(R\\Phi_f\\mathcal{F})_x$ 非零仅当某些维数范围，且维数由 n 界定：$q\\in[n-1,n]$ 附近可有非零项。证明来自 $sp$ 在正合三角中的长正合列的连接同态由消没圈的相交形式表示：把三角的长正合列在 $H^{q}$ 处打开，$R\\Phi_f$ 的上同调被夹在 $H^q(X_0)$ 与 $H^q(X_t)$ 之间，而两侧在 $q<n-1$ 与 $q>n$ 处由一般纤维的紧性与相对维数给出零。纤维上的这一界定使消没轮的“秩”成为可计算不变量，即奇点索引量的第一部分。边界情形要分开处理：若奇点是分裂的孤立奇点，则各点的秩独立相加；若奇点在曲线上连续分布，则需对支撑上的逐点维数取上确界，得到的是逐分支恒定而可能跨分支跳变的整数函数。",
        ['monodromy-compatibility']),
      step('nearby-as-limit', "邻近轮作为直接极限",
        "茎层面的定义 $(R\\Psi_f\\mathcal{F})_x=\\varinjlim_{U_x}\\Gamma(U_x\\cap X^*, \\mathcal{F})$ 显示邻近轮是“沿退化方向的拓扑极限”。用这个公式可在具体例子中计算：取 $\\mathcal{F}$ 常值层，则 $R\\Psi_f\\mathbb{Z}_x$ 的每个茎与光滑纤维的同伦型一致。特殊化映射于是可以显式地看成同一同伦型的退化协调，消没轮测出绕圈行进；这一点正是上一步界定消没轮秩时所依赖的输入，因为只有先知道邻近型的维数分布才能定出 $R\\Phi_f$ 的非零范围。若把一般纤维换成一般点上的几何纤维，则该极限还带有 Galois 群作用，邻近轮成为 l 进表示的内蕴载体，这正是算术退化研究中邻近轮的定义方式。使用该极限公式的前提是 $X^*$ 在 x 附近沿纤维方向有局部收缩，偏离该分离性假设时归纳极限不再与同伦型一致。",
        ['specialization-map']),
    ],
    conclusion: "特殊化 $sp\\colon i^*\\mathcal{F}\\to R\\Psi_f\\mathcal{F}$ 的锥 $R\\Phi_f\\mathcal{F}$ 使三角 $i^*\\mathcal{F}\\to R\\Psi_f\\mathcal{F}\\to R\\Phi_f\\mathcal{F}\\to[1]$ 成立，兼容单值，且消没上同调由权滤过界定。邻近轮是沿退化方向的直接极限。",
    dependencies: [],
    consequences: [],
    explanation: "特殊化映射把退化族的三类数据：特殊纤维（i^*）、邻近纤维（RΨ）与消没部分（锥）串接为一个三角。锥的正合性确保信息不丢：退化族的任何全局性质都可由三角读出。单值兼容性使消没轮的幂零指数可测，几何上对应“退回奇点又绕出”的缠绕数。作为极限的翻译则让邻近轮在具体例子里可直接取自一般纤维的同伦型。",
    examples: [
      { title: "例子：同锥系数 $xy$", body: "续上节 $f(x,y)=xy$。$i^*\\mathbb{Z}$ 是两线并上的常值层，$R\\Psi_f\\mathbb{Z}$ 沿 0 外的圆柱保持秩 2，$sp$ 把两片截面并映为对角以保系数。锥 $R\\Phi_f\\mathbb{Z}$ 的秩 1 上同调茎：由 $0\\to\\mathbb{Z}\\to\\mathbb{Z}^2\\to\\mathbb{Z}\\to0$ 在扩张中保留。三角的 $H^{-1}$ 项对应的消没圈 $\\delta$ 配对 $\\langle\\delta,\\delta\\rangle=2$。",
        },
      { title: "例子：A 型奇点的消没轮秩", body: "对 $f(x,y)=x^2+y^2$（A1），消没圈配对 2；对 A_2 型 $f=x^3+y^2$，消没轮上同调秩 1 仍为 $\\mathbb{Z}$，但单值 $T$ 的特征值含 6 次单位根的幂单打?。正确说法：$N^2=0$，$T$ 的圈阶 6。这演示不同消没圈配对的本征差异而秩一致。",
        },
    ],
    remarks: [
      "若 $X_0$ 整体奇异，特殊化映射的核与锥可能更大，消没轮不再是孤立点奇支撑的简单配对；必须有分层的整体可构造处理。",
      "若 $f$ 非紧合，$i^*Rj_*$ 的定义需要交替使用 $j_!$（紧支）或用有界性补偿，锥的有限维性可能破裂。",
      "若 $\\mathcal{F}$ 不是可构造复形（而是无界或未有限型），$R\\Psi_f$ 的纤维上同调的维数界定不再成立，谱序列可能不收敛。",
      "若单值作用的权不纯（权滤过没有纯性），$N$ 在锥上的作用不再控制 Hodge 数，消没圈配对可能带高次幂零修正。",
    ],
    references: [
      { title: "SGA 7 II: exposé XIII", author: "Deligne, Katz", year: 1973 },
      { title: "Singularities of Plane Curves", author: "Wall", year: 2004 },
    ],
    history: "本条由公开教材重新组织，项目自行改写并注明来源，未复制原文。",
  },

  /* ═══════════════════════════════════════════════════════════
   * 6. e-perverse-t-structure 反常 t-结构
   * ═══════════════════════════════════════════════════════════ */

  'e-perverse-t-structure': {
    statement: "设 X 是复代数簇（或可分层的拓扑空间），$D^b_c(X)$ 是可构造复形的有界导出范畴。反常 t-结构（或作 perverse t-结构）由 $D^{p\\le0}=\\{F\\in D^b_c: H^j(F)_{\\text{perv}}=0\\ \\forall j>0\\}$ 与 $D^{p\\ge0}=\\{F: H^j(F)_{\\text{perv}}=0\\ \\forall j<0\\}$ 生成，其中滤过按支撑维数：$H^j(F)$ 的支撑维数 ≤ -j。对自对偶版本要求同时成立反滤过条件。其心 $\\mathrm{Perv}(X)$ 的对象称为反常层，包括 $\\mathrm{IC}_L[\\dim X]$。",
    explanation: "标准 t-结构按上同调次数切分导出范畴，但它在奇异簇上破坏对偶的对称性（上同调次数与支撑维数混在一起）。反常 t-结构改用支撑维数来定“次数”：一个复形的第 j 个可构造上同调层的支撑维数不超过 -j。这样 Verdier 对偶自动把次数与支撑一起对调，反常心自对偶。初中直觉：奇点处冒出高阶上同调被这条支撑条件压下去，留下的正是交上同调。",
    steps: [
      step('stratified-support-condition', "分层支撑条件",
        "对可构造复形 F，可构造性是指存在有限分层 $X=\\coprod S_\\alpha$（每片是光滑的、闭包是有限并）使 F|S_α 是局部常值且为有限型。定义上同调层 $H^j(F)$ 在 S_α 上的支撑：$\\mathrm{supp}(H^j(F))\\cap S_\\alpha$ 的维数 ≤ -j 时称 F 满足 $D^{p\\le0}$。这条条件逐层检验，与“同调次数”平行，但对高阶奇异层剪枝。它把奇异轨迹上的高阶上同调按余维数压下：余维数越高的层允许出现在越晚的次数中，从而在 Verdier 对偶下一次对称。它的用途是给 t-结构设边界，而下一步要验的公理（尤其截断的存在性）正建立在这一支撑约束之上。边界情形不能含糊：若分层不是有限多个光滑片，或 F|S_α 不是局部常值，则“支撑维数”无定义，该条件退化为空；若把 ≤ 放宽为等号，则自对偶性会随偶奇次数断裂。",
        []),
      step('t-structure-axioms', "t-结构的公理验证",
        "要确认 {D^{p≤0}, D^{p≥0}} 满足 t-结构三公理：其一，$D^{p\\le0}\\cap D^{p\\ge0}$ 是反常心；其二，三角 $F'\\to F\\to F''\\to$ 使 $F'\\in D^{p\\le0}$、$F''\\in D^{p\\ge0}$ 存在（构造用中间扩张型截断 $\\tau^p_{\\le k}$）；其三，平移轴性 $D^{p\\le0}[1]\\subseteq D^{p\\le0}$、$D^{p\\ge0}[1]\\supseteq D^{p\\ge0}$ 由支撑维数对平移的单调性直接成立。截断函子 $\\tau^p_{\\le k}$ 与普通 $\\tau_{\\le k}$ 不同，它按“支撑维数≤负次数”而非仅按次数截断，因此反常上同调 $^pH^k$ 才是心的元素。",
        ['stratified-support-condition']),
      step('perverse-heart', "反常心与反常层的性质",
        "反常心 $\\mathrm{Perv}(X)$ 是 Abel 范畴：对反常层之间的映射，核与余核仍在心内（这是 t-结构的公理保证）；心是稳定扩张的 Abel 范畴。有限长度性质：可构造性使每个反常层有 Jordan–Hölder 列，其合成因子是单反常层。单反常层的分类由 Deligne：$\\mathrm{IC}_L[\\dim X]$（L 是局部系）或其平移。这使得反常层成为“交上同调层的拼接”。每个单对象的支撑 Z 是闭子簇，L 是 Z 的正则轨迹上的局部系；因此反常层的组合数据归结为“支撑子簇 + 局部系 + 中间扩张次数”的三元组。这里的边界情形是支撑维数严格小于 $\\dim X$ 的单对象：它们由更低维层上的局部系取中间扩张得到，正因为 IC 是“最小扩张”，同一 $(Z,L)$ 只能给出唯一的单对象，不会出现两个不可比的中间扩张同时单。",
        ['t-structure-axioms']),
      step('duality-and-IC', "自对偶与 IC 复形",
        "Verdier 对偶 $\\mathbb{D}$ 把 $D^{p\\le0}$ 送到 $D^{p\\ge0}$（反次数），故反常心自对偶：$\\mathbb{D}(\\mathrm{Perv}(X))=\\mathrm{Perv}(X)$。对光滑流形 X，$\\mathrm{Perv}(X)$ 与带平移的局部系统范畴等价且单反常层就是 $L[\\dim X]$。对奇异 X，$\\mathrm{IC}_X=\\iota_{!*}L_X[\\dim X]$ 是自对偶奇段层的代表，其逐纤维上同调由奇点轨迹的分层读出。自对偶条件 $\\mathbb{D}\\mathrm{IC}_X\\cong\\mathrm{IC}_X$ 等价于局部系上的配对非退化，因此交上同调的 Poincaré 对偶在层层面已经编入 IC 的定义。",
        ['perverse-heart']),
      step('t-exactness-applications', "t-正合性与应用",
        "关键函子在此 t-结构下的行为：沿闭嵌入 $i$ 的 $Ri_*$ 与 $Ri_!$ 是 t-正合（把反常层送反常层）；开嵌入 $j$ 的 $Rj_*$、$Rj_!$ 需要中间扩张 $j_{!*}$ 修正，$j_{!*}$ 同时修剪 $j_*$ 的像与 $j_!$ 的核。前推 $Rf_*$ 把反常层送到“以反常层为系数的复形”，分解定理保证对紧合、半单纯 f 它是逐次结构的直和。这一结构是 BBD 证明分解定理的落点，也是后续用黎曼-希尔伯特对应把其翻译到 D-模侧的门户。边界情形是：$Rf_*$ 一般不是 t-正合的，只有紧合且系数半单时才逐项为反常层，否则必须在反常心外取复杂的复形，此时分解断言失效。",
        ['duality-and-IC']),
    ],
    conclusion: "反常 t-结构由支撑维数 ≤ -j 定义并有稳定自对偶心 $\\mathrm{Perv}(X)$；单反常层为 $\\mathrm{IC}_L[\\dim X]$，且 $\\mathbb{D}$ 保持反常心。紧合前推在反常心上的行为由分解定理刻划。",
    dependencies: [],
    consequences: [],
    explanation: "标准 t-结构把复形“当普通对象”按次数切片，奇异簇的痛点在于次数会撞上支撑维数。反常 t-结构反其道而行：把支撑维数作为次数，于是奇点的贡献不但不破坏对称性反而被压扁到恰当区间。交上同调层由此自然出现：$\\mathrm{IC}[\\dim X]$ 就是那个既带上同调又对偶安稳的“最经济”对象。反常心自对偶与分解定理使它成为可构造复形理论的主角。",
    examples: [
      { title: "例子：曲线上的反常层", body: "取 X=C 是一维复曲线。反常条件：$H^j(F)$ 维数 ≤ -j，故 j=0 时支撑维数 ≤0，j=1 时 ≤-1（即消失），j<0 无限制。于是 $\\mathrm{Perv}(C)$ 的对象是：一个在光滑点处的子束式整个层恰好落到 $\\mathrm{IC}_L[1]$，加上有限多个点上的阶数自由模（构成离散反常层）。单反常层恰为 $L[1]$（L 沿 C 的局部系）或 $\\mathbb{Q}_{\\{x\\}}$。这直接对应“中层全纯 D-模”在曲线上的分类。",
        },
      { title: "例子：一奇异点的 $\\mathbb{A}^1$ 锥面", body: "取 X 是 $\\mathbb{P}^1$ 上一点 blow-up 的锥面，原点 o 是孤立奇点。对 $\\mathcal{L}=\\mathbb{Q}_{X\\setminus\\{o\\}}$，$\\mathrm{IC}_L[2]$ 在 o 处的逐纤维上同调用普通上同调计算：$H^1(\\mathbb{P}^1)=\\mathbb{Q}$ 出现在维数 1，故 $\\mathrm{IC}_L[2]$ 非单项式层。$\\mathbb{D}$ 保持其反常性：对偶层仍是 $\\mathrm{IC}_L[2]$（自对偶）。这与“奇点的消没信息存在反常层的高阶上同调中”一致。",
        },
    ],
    remarks: [
      "若去掉可构造性（在普通拓扑空间或无界导出范畴），支撑维数条件不足以定义 t-结构，反常心退化为平凡或依赖选择。",
      "若删掉可构造分层（奇点不是有限个光滑分层），IC 复形与 Jordan–Hölder 列无法整体构造，只能退化到光滑开集。",
      "若不自对偶（只用单边支撑条件），反常心仍 Abel 但不保持 Verdier 对偶，单反常层的分类可能失序。",
      "若用相变簇（可构造但 lifting），反常 t-结构的诱导可能非本征定长，需另行补充。",
    ],
    references: [
      { title: "Faisceaux Pervers, Astérisque 100", author: "Beilinson, Bernstein, Deligne", year: 1982 },
      { title: "Perverse sheaves and applications to representation theory", author: "Juteau, Mautner, Williamson", year: 2011 },
    ],
    history: "本条由公开教材重新组织，项目自行改写并注明来源，未复制原文。",
  },

  /* ═══════════════════════════════════════════════════════════
   * 7. e-decomposition-theorem 分解定理
   * ═══════════════════════════════════════════════════════════ */

  'e-decomposition-theorem': {
    statement: "设 $f\\colon X\\to Y$ 是紧合态射，X、Y 是复代数簇，X 光滑。则对每个半单纯可构造成分 $\\mathcal{K}$（如 $\\mathbb{Q}_X[l]$），有分解 $Rf_*\\mathcal{K}\\cong\\bigoplus_{p}\\left({}^p\\mathcal{H}^p(Rf_*\\mathcal{K})\\right)[-p]$，其中每项 ${}^p\\mathcal{H}^p$ 是反常层。特别地若 $\\mathcal{K}$ 是下列之一：常数层、交上同调复形，则 $Rf_*$ 分解为反常层的直和，每一项都是半单的（即若干 $\\mathrm{IC}_{Y_\\beta}[L_\\beta]$ 的直和）。",
    explanation: "分解定理断言一个紧合推前在导出范畴中分裂，即使源与目标都奇异；分裂项是反常层。这在几何上表示退化或奇异的信息被按“消没轮+中间扩张”重新分配。其半单性来源于单值的半单纯定理与 Hodge 结构的纯性，因此对一般系数并不成立。对光滑 X，$Rf_*\\mathbb{Q}_X$ 分解为 $\\mathrm{IC}$ 的平移直和，是重言之最深刻的形式：$Rf_*$ 的图像信息全部落在交上同调层的定量展开里。",
    steps: [
      step('semisimplicity-input', "输入：单值半单性与 Hodge 纯性",
        "单值半单性定理（Grothendieck、Deligne）断言：对紧合 f、光滑 X 与可构造成分 $\\mathcal{K}$，$Rf_*\\mathcal{K}$ 带权滤过且其单值表示半单。Hodge 结构的纯性提供权滤过的光滑性：$\\mathrm{gr}^W_m(Rf_*\\mathcal{K})$ 是纯权 m 的 Hodge 结构，故其上的单值表示由 Hodge 理论约化为半单的。这两条在分解定理的证明中提供“扩展=0”的基础，是把任意推前压成直和的纯化工具。使用它们要核对两条假设：f 紧合（否则 $Rf_*$ 不保持纯性）、$\\mathcal{K}$ 半单纯（成分是常系数）。若把系数换成非半单的可构造复形，则扩展项可能非零，分解定理的整体断言立刻失效；半单性是前提而不是结论。",
        []),
      step('hard-lefschetz-reduction', "Hard Lefschetz 与逐项识别",
        "对 X 光滑、含 ample 线丛 $\\eta$，Lefschetz 算子 $\\eta^r\\cup(-)$ 在 $Rf_*\\mathbb{Q}_X$ 上诱导同构 $\\mathrm{gr}$ 的对称性。由此可得每个 ${}^p\\mathcal{H}^p(Rf_*\\mathbb{Q}_X)$ 是反常层，且硬 Lefschetz 把 $\\mathrm{gr}^W$ 配对。这一步实际给出“哪些反常层出现”：它们正是 Deligne 切段法的产物。对每个 p 验证同构时需要逐次的 Lefschetz 定理，而逐次定理本身由半单性的递归保证；因此 Hard Lefschetz 同时给出分解的项数与权配对的两重信息。",
        ['semisimplicity-input']),
      step('vanishing-cycle-recursion', "消没轮递归与分解归纳",
        "沿 Y 的分层，用消没轮在奇异轨迹上逐层切割：$R\\Psi_f$ 在奇异片的约束使差异集中在锥中。归纳假设中间步骤保持半单分解，顶点处用单值半单性收口。递推的每一段输出都是反常层，最终合并为 $Rf_*\\mathcal{K}$ 的平移直和。这就是 BBD 的“顶点消没轮”论证。归纳的关键是每层切出的锥仍是半单反常层的直和，故可继续下一层而不产生不可分扩展；锥的半单性正是上一步单值半单性输入的逐层应用，这两步的接口必须写清才能避免循环论证。该论证的失效模式也很明确：若某一奇异片上的局部系非半单（例如来自非半单的局部单值表示），锥中就会出现不可分的扩展类，直和分解在那一层立即断裂，归纳无法继续向更高维的片推进。这也解释了为什么奇异轨迹必须在消没轮定义前预先分层：只有分层确定，逐层切割的锥才有确定的支撑，递推才对每一层给出可核对的输入与输出。",
        ['hard-lefschetz-reduction']),
      step('ic-terms-classifying', "IC 项的分类",
        "分解中第 p 项 ${}^p\\mathcal{H}^p$ 是半单反常层，故是 $\\oplus\\mathrm{IC}_{Z}(L)$ 的形式，其中 Z 是 Y 的可构造闭子簇、L 是其上的局部系。对 $\\mathcal{K}=\\mathbb{Q}_X$，出现项由“奇异轨迹上的权重展开”决定：支撑 Z 与权 $p$ 的配对受上一步消没轮递推的输出约束，故分类是可核对的而非猜测。权滤过侧由权滤过唯一指定各项，故分解唯一。识别具体 IC 项时，只需比较各 Z 上的限制上同调：中间扩张在 Z 的正则部分等于 L 的平移，在奇异部分由局部系统上的数值决定，因而逐 Z 可核对。边界情形是 Z 取全空间 Y 本身：此时 IC 项对应 $Rf_*\\mathcal{K}$ 的最高权部分，其余项落在更小的闭子簇上。",
        ['vanishing-cycle-recursion']),
      step('consequences', "推论与应用",
        "直接推论包括：$Rf_*\\mathbb{Q}_X$ 在 Hodge 结构下带纯权；奇异轨迹上的 Betti 数公式；$f$ 是态射时谱序列退化；对 $f$ 是半单线的情形退化到 Hard Lefschetz。表示论中，分解定理是旗簇上 $D_\\mathbb{C}$-模理论与标准猜想的公共地面。用逐点 Poincaré 多项式读出各 IC 项后，还可以把 Betti 数逐奇异分支写成局部系统秩与交上同调维数的乘积和，从而将退化族的同调分解为可独立计算的块。这里的输入是上一步逐 Z 分类出的 IC 项清单：只有先知道每项支撑与局部系，才能把 Poincaré 多项式按分支求和；若跳过分类直接对 $Rf_*$ 取维数，则退化处的跳变无法解释。",
        ['ic-terms-classifying']),
    ],
    conclusion: "对紧合 f、光滑 X，$Rf_*\\mathbb{Q}_X\\cong\\bigoplus_p {}^p\\mathcal{H}^p(Rf_*\\mathbb{Q}_X)[-p]$ 且每项是半单反常层（$\\mathrm{IC}$ 直和）。分解由权滤过唯一确定，随 Hartshorne 如上形式的原始例子延伸。",
    dependencies: [],
    consequences: [],
    explanation: "分解定理的惊人处在于“分裂”不需要任何横截或解消条件：紧合性与半单性就足够。它把 $Rf_*$ 的像强行整理成反常层的直和，其中每个反常态层的支撑正是奇异轨迹。由 IC 分类，分解变成“沿闭集展开的谱分解”，这在研究退化、奇点与表示论中是万能读数。",
    examples: [
      { title: "例子：$\\mathbb{P}^1\\to\\mathrm{pt}$", body: "取 $f\\colon\\mathbb{P}^1\\to\\mathrm{pt}$。$Rf_*\\mathbb{Q}[0]=\\mathbb{Q}[0]\\oplus\\mathbb{Q}[-2]$，每个常数反常层即 $\\mathrm{IC}_{\\mathrm{pt}}(\\mathbb{Q})\\cong\\mathbb{Q}[\\dim\\mathrm{pt}]$ 的平移。分解正好读出 $H^0(\\mathbb{P}^1)=\\mathbb{Q},H^2(\\mathbb{P}^1)=\\mathbb{Q}$。这示范 IC 项“回光返照”光滑情形。",
        },
      { title: "例子：结点三次曲线的正规化解消", body: "设 $\\pi\\colon\\tilde C\\to C$ 是结点三次曲线的正规化（P^1→E 的 1:2）。$R\\pi_*\\mathbb{Q}_{\\tilde C}=\\mathbb{Q}_C\\oplus\\mathrm{IC}_C(\\mathbb{Q})[-1]$？实际分解：$\\pi$ 后 $H^0\\to\\mathbb{Q}$、消没项 $\\mathcal{H}^{-1}$ 是反常层支撑在结点处，$H^1(\\tilde C)\\to\\mathrm{IC}_C(\\mathbb{Q})$ 部分插入。正确写出：$R\\pi_*\\mathbb{Q}_{\\tilde C}=\\mathbb{Q}_C[0]\\oplus\\mathbb{Q}_{\\mathrm{pt}}[-1]\\oplus\\mathbb{Q}_{\\mathrm{pt}}[-2]\\oplus\\mathrm{IC}_C(\\mathbb{Q})[-1]\\otimes$ 修正。逐项与 H^*(C) 差异均由 IC 项捕获。",
        },
    ],
    remarks: [
      "若 f 不紧合，$Rf_*$ 可能失去分解性质，反例在仿射情形（如 $\\mathbb{A}^1\\to\\mathrm{pt}$ 的推前无有限维分解）。",
      "若 X 奇异，$\\mathbb{Q}_X$ 不纯，分解只对善良系数（如 $\\mathrm{IC}_X$ 自身）成立；一般可构造复形的推前不必分解。",
      "若 C 特有的 Hodge 纯性缺失，权滤过无法唯一指派项，分解的逐项识别停止；等权失效对奇点族尤其危险。",
      "若 f 非紧合但只要求形变等价，需把 C_D 的替代（如承担紧化）纳入，否则分解定理的条款不齐。",
    ],
    references: [
      { title: "Faisceaux Pervers, Astérisque 100", author: "Beilinson, Bernstein, Deligne", year: 1982 },
      { title: "The decomposition theorem, perverse sheaves and the topology of algebraic maps", author: "de Cataldo, Migliorini", year: 2009 },
    ],
    history: "本条由公开教材重新组织，项目自行改写并注明来源，未复制原文。",
  },

  /* ═══════════════════════════════════════════════════════════
   * 8. e-intersection-cohomology 相交上同调
   * ═══════════════════════════════════════════════════════════ */

  'e-intersection-cohomology': {
    statement: "设 X 是可分层的奇异复簇（PL 空间），配备分层 S。Goresky–MacPherson 定义允许链条件：对 PL 链 c，$|c|\\cap S_\\alpha$ 的维数 ≤ $\\mathrm{codim}\\,S_\\alpha - k + c$（下界）且 $\\partial c$ 也满足，其中 $c$ 是余代数参数（常用 $IH$ 的中间值）。由此构造相交链复形，其上同调 $IH^k(X)$ 满足 Poincaré 对偶、Künneth 与硬 Lefschetz，且在正则开子集处与普通上同调一致。BBD 重述：$IH^k(X)=H^k(X,\\mathrm{IC}_X)$。",
    explanation: "对奇异簇，普通链可以“贴”在奇点上导致对偶失败。Goresky–MacPherson 的想法是只允许与每片奇异层相交得“足够低维”的链，从而把奇点造成的多余链排除。Análisis：允许链条件本质上是一个维数预算，它让链在中维穿过奇异轨迹时不被算作完整的同调类。得到的 $IH$ 自动满足对偶，且在光滑部分与 H 一致。现代观点把 $IH^k$ 重新解释为交上同调复形 $\\mathrm{IC}_X$ 的超上同调，后者是反常层范畴的简单对象。",
    steps: [
      step('pl-chains-and-strata', "PL 链与分层",
        "取 X 的子复形分解成 PL 覆盖，给每个奇异层 S_α 指定余维数 $d_\\alpha=\\dim X-\\dim S_\\alpha$。对 k-链 c，令 $c_\\alpha=c\\cap S_\\alpha$（链与片的交），要求 $\\dim c_\\alpha \\le d_\\alpha - k + c$（$c$ 为允许码）。同时要求边界 $\\partial c$ 的每层交满足 $\\dim\\partial c_\\alpha\\le d_\\alpha - k + c -1$ 等对应条件。这样的 c 组成允许链子复形，其在每片上的受控维数保证整体对偶：允许码 c 的取法正是“垂直于奇异层方向”的余维数限制，它使得边界运算在允许链内封闭。这一步的输出（允许链复形及其分层数据）直接决定下一步的 IC 复形：上同调层在每个 S_α 上的秩由允许链的局部模型算出。若允许码取得过小（逼近中间值以下），链复形退化为普通链复形，$IH$ 与 $H^*$ 重合而失去对奇点的分辨力。",
        []),
      step('ic-complex-via-ic', "IC 复形与超上同调",
        "中间扩张 $\\mathrm{IC}_X=\\iota_{!*}\\mathbb{Q}_{X_{\\text{reg}}}[\\dim X]$ 或用 BBD 的截断定义。$IH^k(X)=H^k(X,\\mathrm{IC}_X)$ 在可构造范畴中良定义。IC 复形满足：限制在光滑开集是 $\\mathbb{Q}[\\dim X]$；沿奇异轨迹的上同调层由允许链条件决定。这套计算的价值在于把几何上的允许链翻译成层论的单对象。$\\mathrm{IC}_X$ 由开集上的局部系与中间扩张的唯一性完全确定，因此同一个 $IH$ 可同时由链几何与层论两种方式计算，结果一致。这里的输入正是上一步的允许链复形：允许码 c 决定中间扩张在每层的“修剪程度”，而上同调层的秩由该修剪唯一确定，故链侧的二重性与层侧的单对象是同一条信息。",
        ['pl-chains-and-strata']),
      step('poincare-duality', "Poincaré 对偶",
        "用可构造复形的 Verdier 对偶，$\\mathrm{IC}_X$ 自对偶：$\\mathbb{D}\\mathrm{IC}_X\\cong\\mathrm{IC}_X$。由此 $H^k(X,\\mathrm{IC}_X)$ 与 $H^{2n-k}_c(X,\\mathrm{IC}_X)$ 配对非退化，紧情况给出 Poincaré 对偶 $IH^k(X)\\cong IH_{2n-k}(X)$。其几何来源正是允许链条件让 $c$ 与 $d$ 在 Poincaré 对偶意义下互补而不触摸奇异层。光滑情形 $IH^k=H^k$。对奇异点上的对偶配对，中间扩张保证两个链复形的限制在同一点有自然的相交配对，而无需先取解消，这是链几何版本最不容易看清的一步。",
        ['ic-complex-via-ic']),
      step('kunneth-and-hard-lefschetz', "Künneth 与硬 Lefschetz",
        "$\\mathrm{IC}_{X\\times Y}$ 与外部张量 $\\mathrm{IC}_X\\boxtimes\\mathrm{IC}_Y$ 同构（中间扩张的函数性），故 $IH^k(X\\times Y)=\\oplus IH^a(X)\\otimes IH^{k-a}(Y)$。对紧 X 且带 ample 类 $\\omega$（Kähler 流形上的类），乘 $\\omega^r$ 在 $IH$ 上满足硬 Lefschetz：$\\omega^r\\colon IH^{n-r}(X)\\to IH^{n+r}(X)$ 是同构。这使 $IH$ 携带有理混合 Hodge 结构且是提炼的。若把 Kähler 类换成一般实流形上的类，硬 Lefschetz 不一定成立；因此该定理必须在可极化或代数框架下陈述。",
        ['poincare-duality']),
      step('purity-and-applications', "纯性与应用",
        "IC 复形是纯的（权 = 相应次数），由 Deligne 纯性定理保证。应用方向：(a) 奇点解消 $\\pi\\colon\\tilde X\\to X$ 时 $R\\pi_*\\mathbb{Q}_{\\tilde X}$ 的 IC 项分解输入；(b) $IH$ 满足“光滑猜测”：奇异轨迹的消没全部在 IC 项；(c) 表示论/组合学中 Schubert 簇的 $IH$ 给出 Kazhdan–Lusztig 多项式。纯性还使逐纤维维数沿每个奇异分支是常数函数，因此 $IH$ 的 Poincaré 多项式可逐闭子簇求和，这正是许多组合恒等式背后的几何原因。需要点名的外部定理是 Beilinson–Bernstein–Deligne 的纯性结果（权与上同调次数一致）与 Kazhdan–Lusztig 关于 Schubert 簇 $IH$ 基的猜想（后被证明），两者都要求在代数簇的可构造范畴内陈述，脱离代数框架纯性不成立。",
        ['kunneth-and-hard-lefschetz']),
    ],
    conclusion: "$IH^k(X)=H^k(X,\\mathrm{IC}_X)$ 满足 Poincaré 对偶、Künneth 与硬 Lefschetz，对光滑 X 回到 $H^k$，且在奇异轨迹处反映 IC 的支撑上同调。IC 是纯反常层，支撑奇异结构的全部拓扑不变量。",
    dependencies: [],
    consequences: [],
    explanation: "相交上同调是对奇异空间“修好 Poincaré 对偶”的正统产物：通过允许链的维数预算剔除贴在奇点亮层的链，各阶上同调仍完整且对偶自足。其现代层论形态 IC 是纯的反常简单对象，这一视角把允许链的烦琐细节藏进中间扩张。硬 Lefschetz 与纯性使 IH 像光滑流形的 H 一样好用，数学生物由此扩展到单奇异点、正常层、表示论的组合子。",
    examples: [
      { title: "例子：结点三次曲线的 $IH$", body: "取 C 是带一个结点的三次曲线，$\\tilde C\\to C$ 是正规化（p^1→E 之 2:1 有分支）。$IH^0(C)=\\mathbb{Q}$，$IH^1(C)=H^1(\\tilde C)\\oplus\\mathbb{Q}$（多出的 $\\mathbb{Q}$ 来自结点处的消没），$IH^2(C)=\\mathbb{Q}$。对偶检查：$IH^1\\times IH^1\\to\\mathbb{Q}$ 由消没圈配对给出，秩 2。与之对照 $H^1(C)$ 秩 1，不够对偶，故 IH 是修正项。",
        },
      { title: "例子：维 2 隔离奇点", body: "取 X 是 $\\mathbb{P}^2$ 中带一个孤立奇点 p（如锥面 $\\mathbb{C}^2/G$）。$IH^k(X)=H^k(X)$ 对所有 k≠2，$IH^2(X)$ 含“交点”部分使对偶成对。Künneth：$IH^2(X\\times X)=(( ))$ 由四部分构成含 $IH^2\\otimes IH^0$ 等。若 p 是真奇点（ADE 型），$IH^2$ 的额外维数 = 例外除子的有效循环排名。",
        },
    ],
    remarks: [
      "若去掉分层（不可 підрахувати 余维数），允许链条件无定义，IH 退化为普通上同调，对偶可能失败。",
      "若使用非中间参数 c 的允许链（首末参数），得到的上同调仍对偶但硬 Lefschetz 可能失效；参数必须取中值。",
      "若 X 非紧，Poincaré 对偶需紧支版本 $IH_c$；普通 IH 与 $IH_c$ 的对偶配对是 Harris–Maclean 意义下完成的。",
      "若 X 奇异集非分层可构造，$\\mathrm{IC}_X$ 不存在，IH 只能定义在光滑开集上而失去整体结构。",
    ],
    references: [
      { title: "Intersection homology theory", author: "Goresky, MacPherson", year: 1983 },
      { title: "Faisceaux Pervers, Astérisque 100", author: "Beilinson, Bernstein, Deligne", year: 1982 },
    ],
    history: "本条由公开教材重新组织，项目自行改写并注明来源，未复制原文。",
  },

  /* ═══════════════════════════════════════════════════════════
   * 9. e-d-module-direct-image D-模的推前与积分
   * ═══════════════════════════════════════════════════════════ */

  'e-d-module-direct-image': {
    statement: "设 $f\\colon X\\to Y$ 是复代数流形间态射。D-模的直接像（积分）$\\int_f\\mathcal{M}=Rf_*(\\mathcal{D}_{Y\\leftarrow X}\\otimes^L_{\\mathcal{D}_X}\\mathcal{M})$，其中 $\\mathcal{D}_{Y\\leftarrow X}=\\mathcal{O}_X\\otimes_{f^{-1}\\mathcal{O}_Y}f^{-1}\\mathcal{D}_Y$ 是转移模。若定义在适当的导出范畴中，这给出 $D^b(\\mathcal{D}_X)\\to D^b(\\mathcal{D}_Y)$ 的函子，且与 de Rham 函子 $\\mathrm{DR}$ 交换：$\\mathrm{DR}_Y(\\int_f\\mathcal{M})\\cong Rf_*\\mathrm{DR}_X(\\mathcal{M})$（在 $\\mathcal{M}$ 拟凝聚及 f 有限型条件下）。",
    explanation: "D-模的积分是把“沿纤维取积分”代数化：转移模把 Y 上的算子搬上 X，张量后再沿 $f$ 推前，得到 Y 上新的方程组。分析上这对应“施瓦茨核”式的积分算子，而 de Rham 兼容性把这层翻译精确化：解析解层的积分就是代数张量的推前。右模公式 $\\int_f\\mathcal{N}=Rf_!(\\mathcal{N}$ 的对偶者)给出对偶分支。对非交换环，张量必须取导出版本以免丢失环结构。",
    steps: [
      step('transfer-module', "转移模与张量",
        "$\\mathcal{D}_{Y\\leftarrow X}$ 是 $(f^{-1}\\mathcal{D}_Y,\\mathcal{D}_X)$-双模：左作用来自 $\\mathcal{O}_X\\otimes f^{-1}\\mathcal{D}_Y$，右作用来自 $\\mathcal{D}_X$。对 $\\mathcal{D}_X$-模 $\\mathcal{M}$，$\\mathcal{D}_{Y\\leftarrow X}\\otimes_{\\mathcal{D}_X}\\mathcal{M}$ 是 $f^{-1}\\mathcal{D}_Y$-模（从而 $\\mathcal{D}_Y$-预层沿 Y 的图层）。必须取 $\\otimes^L$：$\\mathcal{D}_X$ 非交换且 $\\mathcal{D}_{Y\\leftarrow X}$ 不右平坦（X→Y 非光滑时）。导出张量保留 Tor 项，是积分的正确术语。",
        []),
      step('direct-image-functor', "直接像函子与结合性",
        "$\\int_f\\mathcal{M}=Rf_*(\\mathcal{D}_{Y\\leftarrow X}\\otimes^L_{\\mathcal{D}_X}\\mathcal{M})$。函子性由张量与推前导出；复合公式 $\\int_{g\\circ f}\\cong\\int_g\\circ\\int_f$ 由转移模的结合性 $\\mathcal{D}_{Z\\leftarrow Y}\\otimes f_*\\mathcal{D}_{Y\\leftarrow X}\\cong\\mathcal{D}_{Z\\leftarrow X}$ 与 $f$ 的推前-张量交换得到。这使直积与合成在 D-模侧保持。紧合条件替换成使用 $f_!$、“proper direct image”。",
        ['transfer-module']),
      step('de-rham-commutation', "与 de Rham 函子的交换",
        "$\\mathrm{DR}_Y\\circ\\int_f\\cong Rf_*\\circ\\mathrm{DR}_X$ 的验证：$\\mathrm{DR}_X(\\mathcal{M})=\\Omega_X\\otimes_{\\mathcal{O}_X}\\mathcal{M}[\\dim X]$，而转移模的张量把 $\\Omega_Y$ 提升为 $\\Omega_X\\otimes\\mathcal{D}_{Y\\leftarrow X}\\cong\\Omega_X\\otimes f^{-1}\\Omega_Y\\otimes\\mathcal{D}$，投影公式滑出 $Rf_*$。对相对微分形式 $\\Omega_{X/Y}$ 的预算用相对 de Rham 的 morphism 完成。非光滑时的 Tor 项给出校正，称为“推到非流形的广义积分”。",
        ['direct-image-functor']),
      step('gauss-manin-connection', "Gauss–Manin 连接",
        "对 $f$ 光滑且 $\\mathcal{M}=\\mathcal{O}_X$，$\\int_f\\mathcal{O}_X=Rf_*\\Omega_{X/Y}^{\\bullet}$ 携带 Gauss–Manin 连接 $\\nabla_{\\partial/\\partial y_j}$。其构造：(DR_X 与积分的交换) 中导数方向沿 Y 的切向量提升为 $\\Omega_{X/Y}$ 上的平坦连接，水平截面是“沿纤维的平坦”类。对 $\\mathcal{M}$ 为局部系统对应的模，$\\int_f$ 给出正则奇点的平展扩展的参数化。连接在 Y 上满足正则奇点条件，其单值由纤维族在临界轨迹附近的拓扑决定；因此 Gauss–Manin 连接是 D-模积分与单值理论交会的最直接场所。",
        ['de-rham-commutation']),
      step('proper-and-coherent-results', "紧合性与凝聚性",
        "若 f 紧合且 $\\mathcal{M}$ 是凝聚 D_X-模，则 $\\int_f\\mathcal{M}$ 的像的每个同调是凝聚 D_Y-模（紧合直接像定理的 D-模版本）。对一般的非紧合 f，用 $\\int_f^{!}$ 与对偶组合保持边界：非紧合时 $\\int_f$ 不再保持凝聚，须换成带 $!$ 的版本或先做紧化再取对偶。推前还保持全纯性与可构造性：DR 兼容性把 $Rf_*\\mathrm{DR}$ 的可构造性拉回。这里用的外部输入是 Kashiwara 关于 D-模直接像的有限性定理，它要求 f 是真态射（或至少是有限型的紧合态射）与 $\\mathcal{M}$ 全纯；缺少紧合性时 $\\int_f\\mathcal{M}$ 的高阶同调可以是无穷生成的，凝聚性失效。特别地，若 $\\mathcal{M}$ 全纯，则 $\\int_f\\mathcal{M}$ 的每个反常上同调仍全纯，因而微分方程沿纤维积分后仍是良定的方程系统。",
        ['gauss-manin-connection']),
    ],
    conclusion: "$\\int_f\\mathcal{M}=Rf_*(\\mathcal{D}_{Y\\leftarrow X}\\otimes^L\\mathcal{M})$ 是导出函子，复合公式与 de Rham 交换 $\\mathrm{DR}_Y\\circ\\int_f\\cong Rf_*\\circ\\mathrm{DR}_X$ 成立；紧合下保持凝聚性，光滑情形恢复 Gauss–Manin 连接。",
    dependencies: [],
    consequences: [],
    explanation: "德莱因抽象：积分是“沿纤维的方向求和”。转移模是这套求和的代数实现，它把积分算子本身码成一个双模；张量运算做积分核，推前做求和。de Rham 兼容性是它的正确性证明：分析上怎么说积分就怎么得到解层，代数式子不会改换含义。非交换与奇异带来的 Tor 修正是它比朴素积分更精确的地方。",
    examples: [
      { title: "例子：$f\\colon\\mathbb{A}^1\\to\\mathrm{pt}$, $\\mathcal{M}=\\mathcal{O}_{\\mathbb{A}^1}$", body: "访 $\\int_f\\mathcal{O}_{\\mathbb{A}^1}=R\\Gamma(\\mathbb{A}^1,\\mathcal{D}_{\\mathrm{pt}\\leftarrow X}\\otimes\\mathcal{O})$。$\\mathcal{D}_{Y\\leftarrow X}\\otimes\\mathcal{O}$ 是 $\\mathbb{C}[x]$-模 $\\mathbb{C}[x,\\partial_x]$ 模 $\\mathbb{C}[x]\\to\\mathbb{C}$ 的模，即 $\\mathbb{C}[x]$ 沿 $\\partial_x$-作用。$R\\Gamma(\\mathbb{A}^1,\\cdot)$ 给出 $\\mathbb{C}[\\partial_x]/\\mathbb{C}[x]\\partial_x$ 之高阶=0，$H^0$ 是“常数函数”空间 $\\mathbb{C}$。DR 侧：$\\mathrm{DR}_{\\mathbb{A}^1}(\\mathcal{O})=\\Omega^{\\bullet}$，RΓ 得 $H^0(\\mathbb{A}^1,\\mathcal{O})/\\partial H^0=\\mathbb{C}$，一致：积分确实给常数。",
        },
      { title: "例子：纤维族与相对 de Rham", body: "取 $f\\colon X\\to Y$ 光滑纤维化，$\\mathcal{M}=\\mathcal{O}_X$。$\\int_f\\mathcal{O}_X=Rf_*\\Omega_{X/Y}^{\\bullet}$ 的 $H^0$ 是 $\\mathcal{O}_Y$ 上带 Gauss–Manin 连接的向量丛（若 f 投影式）。对椭圆曲线族 $y^2=x^3+t$，$Rf_*\\Omega^\\bullet$ 是秩 2 带连接的丛，monodromy 矩阵 u 对角。验证 $\\nabla(dt)$ 与周期积分同构。",
        },
    ],
    remarks: [
      "若 f 非紧合，$Rf_*$ 可能失去有限性，直接像须用 $f_!$（带紧支）或对偶版本，否则'积分'未定义。",
      "若 $\\mathcal{M}$ 非拟凝聚（如非有限型 D-模），$\\int_f$ 的 Tor 高阶项可能无限，导出范畴预算被破坏。",
      "若去掉 de Rham 兼容所依赖的系数恒等（如特征 p 或解析非光滑情形），$\\mathrm{DR}_Y\\circ\\int_f\\cong Rf_*\\circ\\mathrm{DR}_X$ 不再成立，须用完备化版本。",
      "若 X 奇异，$\\Omega_{X/Y}$ 不局部自由，张量的 Tor 项给积分加校正；不校正则 DR 兼容性丢失。",
    ],
    references: [
      { title: "D-modules, perverse sheaves, and representation theory", author: "Hotta, Takeuchi, Tanisaki", year: 2008 },
      { title: "Algebraic D-modules", author: "Coutinho", year: 1995 },
    ],
    history: "本条由公开教材重新组织，项目自行改写并注明来源，未复制原文。",
  },

  /* ═══════════════════════════════════════════════════════════
   * 10. e-riemann-hilbert Riemann–Hilbert 对应
   * ═══════════════════════════════════════════════════════════ */

  'e-riemann-hilbert': {
    statement: "经典（Riemann–Hilbert）：$\\mathbb{P}^1$（或光滑曲线）上带正则奇点的线性常微分方程对应局部系（即 $\\pi_1$ 的表示），其解空间给出单值表示。高维（Kashiwara–Mebkhout）：对复光滑代数簇 X，$\\mathrm{DR}\\colon D^b_{\\text{rh}}(\\mathcal{D}_X)\\to D^b_c(X)$ 是范畴等价，其拟逆 $\\mathrm{Sol}$ 把可构造复形送到解模。",
    explanation: "一维时，方程的解沿回路变化给出单值矩阵，方程由这些矩阵决定（黎曼问题）。高维版本把“方程”换成“正则全纯 D-模”，把“解”换成“解层复形 DR”。Kashiwara 与 Mebkhout 独立证明该对应是等价。它统一微分方程（分析）与可构造拓扑（几何）：单值、消没、反常层都在对应下保持。正则性假设不可或缺：非正则方程的解在远离奇点处增长过快，不能成局部系。",
    steps: [
      step('classical-1d', "一维经典：方程与局部系",
        "对 $\\mathbb{P}^1$ 上 $y^{(n)}+a_1y^{(n-1)}+\\ldots+a_ny=0$，正则奇点在集合 S 处有充分条件：$a_i$ 在 S 外解析且在 S 处 $a_i$ 有 $\\le i$ 阶极点（Fuchs 条件）。解空间在 $\\mathbb{C}\\setminus S$ 上是局部系（$\\pi_1$ 表示），单值矩阵是正则例行计算的输出。Riemann 存在性问题：给定单值表示构造方程；Deligne 用 holonomic 起算证明可解。方程沿 S 的回路逐圈搬运解，单值矩阵与奇点处的指数之差对应；两个方程同构当且仅当它们的单值表示共轭，这正是“解空间决定方程”在经典层面的含义。失效模式要写清：非正则奇点（如 $x^2y'+y=0$ 在 $0$ 处）的解有本质奇性，单值矩阵不再是全部不变量，Stokes 矩阵成为必要补充，故“方程 ⇔ 局部系”只在正则情形成立。",
        []),
      step('regular-holonomic-full-subcat', "正则全纯子范畴",
        "全纯 D-模的 DR 是可构造的；反过来可构造与全纯构成等价需“正则”筛选。$\\mathcal{D}_X$-模 M 正则全纯当且仅当 M 沿每条曲线的限制在奇异点附近有界（正则奇点条件，即紧 Riemann 面上延拓后无本质奇点）。$D^b_{\\text{rh}}$ 是由正则全纯模组成的生成子范畴，它是 $\\int_f$ 与 $\\mathrm{DR}$ 之间的桥梁。该子范畴关于直接像、拉回与对偶都封闭，因此不需要在等式两边分别检查封闭性，这是把整个理论限制在其中的重要理由。不取正则筛选会出问题：非正则模（如 $\\mathcal{D}_{\\mathbb{P}^1}/\\mathcal{D}_{\\mathbb{P}^1}(\\partial_z+1/z^2)$）的 DR 仍是可构造复形，但它与局部系的对应断裂，Stokes 数据无法由 $\\mathrm{DR}$ 恢复，因此范畴等价必须限定在 $D^b_{\\text{rh}}$ 上而非全部 $D^b(\\mathcal{D}_X)$。",
        ['classical-1d']),
      step('kashiwara-mebkhout-equivalence', "Kashiwara–Mebkhout 等价",
        "定理：$\\mathrm{DR}\\colon D^b_{\\text{rh}}(\\mathcal{D}_X)\\to D^b_c(X)$ 是等价。证明要两步：全（DR 本质满）与忠实（DR 本质单射）。Kashiwara 用对偶与消没轮在层上逐层构造拟逆；Mebkhout 用解层 Sol 与局部化给出同构。对一维情形该定理退化为经典 Riemann–Hilbert。本质满的一步利用中间扩张：闭嵌入与开嵌入分别对应 $i_+$ 与 $j_+$，因此任意可构造复形可由其逐层的局部系按中间扩张逐级组装，D-模侧亦如此。所用的关键外部结果是 Kashiwara 的构造性定理（可构造层的解复形全纯）与 Mebkhout 的局部对偶定理，两者合起来给出拟逆函子，而拟逆的显式构造正是“中间扩张 ↔ 正则全纯模的 $j_{!*}$ 版本”这一逐层字典。",
        ['regular-holonomic-full-subcat']),
      step('functoriality', "函子性与六函子",
        "等价保持六个操作：$f_*$、$f^*$、$f_!$、$f^!$、$\\otimes$、$\\mathrm{Hom}$ 在 D-模侧与可构造侧对应。特别地 $\\mathrm{DR}\\circ\\int_f\\cong Rf_*\\circ\\mathrm{DR}$、$\\mathrm{DR}\\circ f^*\\cong f^*\\circ\\mathrm{DR}$（拟等价的 shift 无关）。这使得奇点理论（消没轮、临界值）在两侧对译。使用这些公式时要注意两边的平移约定：$\\mathrm{DR}_X(\\mathcal{M})=\\Omega_X\\otimes\\mathcal{M}[\\dim X]$ 中的 $\\dim X$ 会进入每个对应公式，落掉它便可能在推算次数时相差一个平移。",
        ['kashiwara-mebkhout-equivalence']),
      step('perverse-and-applications', "反常层与全纯模的对偶",
        "等价限制在反常心上：$\\mathrm{DR}$ 把正则全纯模送到反常层（可构造、逐层常值），从而 $\\mathrm{Perv}(X)\\cong$ 正则全纯 D-模范畴。$\\mathrm{IC}_X\\mapsto \\mathcal{O}_X$（结构模）。应用：模形式、超几何函数、融合、量子群都走这条路；奇点解消的局部模型两侧都比对。在这样的对应下，交上同调、Hard Lefschetz 与 Poincaré 对偶都变成 D-模侧的对偶与消没轮语句，从而两套语言可自由切换而不重写证明。这里的关键输入是上一节的“全纯 ⇔ DR 可构造”双方向等价，它保证反常层对应的模确实全纯；若跨出正则全纯类，$\\mathrm{IC}_X$ 的对应就会失效，$\\mathcal{O}_X$ 也只是 $\\mathrm{DR}$ 下反常层之一而非全部反常层。",
        ['functoriality']),
    ],
    conclusion: "Kashiwara–Mebkhout：$\\mathrm{DR}\\colon D^b_{\\text{rh}}(\\mathcal{D}_X)\\xrightarrow{\\sim}D^b_c(X)$，拟逆 $\\mathrm{Sol}$。经典一维是它的特例；等价兼容六函子并使反常层与正则全纯模同构。",
    dependencies: [],
    consequences: [],
    explanation: "Riemann–Hilbert 对应把“解方程”升格为“理解局部系统”：方程的解空间正是它沿奇点外区域的单值表示。高维版本把这股思想做成范畴等价，微分方程侧的一切（积分、张量、正则奇点）与拓扑侧的一切（可构造、消没、反常层）互翻。理解它的关键是正则性：只有正则奇点方程的解才有多项式界的增长，才谈得上可构造。",
    examples: [
      { title: "例子：$\\mathbb{P}^1\\setminus\\{0,1,\\infty\\}$ 上的超几何方程", body: "取 $y''+\\frac{c-1-a-b}{z(z-1)}y'+\\frac{ab}{z(z-1)}y=0$。其单值表示 $\\rho\\colon\\pi_1(\\mathbb{P}^1\\setminus\\{0,1,\\infty\\})\\to\\mathrm{GL}_2$ 由参数 a,b,c 决定。Riemann–Hilbert 保证给定 $\\rho$ 可恢复方程：局部系统与带正则奇点的 F 型方程一一对应。DR 侧全纯模 $\\mathcal{O}$ 沿球面扩张的秩 2 模给出该方程；解层即该局部系。验证：在 $z=0$ 附近解 $(\\sim z^0,z^{1-c})$ 两条，单值由指数差 $e^{2\\pi i(1-c)}$ 读出。",
        },
      { title: "例子：$\\mathbb{C}^2/\\mathbb{Z}_2$ 锥", body: "取 $X=\\mathbb{C}^2/\\mathbb{Z}_2$（A1 奇点），$U=X\\setminus\\{0\\}$。$\\mathrm{IC}_X$ 对应全纯模 $\\mathcal{M}=\\mathcal{O}_X^*$（斜对称层）。DR 把 $\\mathcal{M}$ 送到 $\\mathrm{IC}_X[\\dim X]=\\mathrm{IC}_X[2]$。其解层 Sol 在 $U$ 上是局部系（秩 1），在 0 处给非平凡 m-layer。这个例子显示奇点附近的拓扑在 D-模侧同样驻留。",
        },
    ],
    remarks: [
      "若去掉正则性，DR 可能把全纯模送到不可构造的“超可构造”复形，等价破坏（反例：$e^{1/z}$ 型方程的 DR 不可构造）。",
      "若 X 非光滑或非复结构，$\\mathcal{D}_X$ 的定义需代数的 C^∞ 或代数化版本，环结构与 DR 的配方沿特征不同。",
      "若 X 不可约分层，$\\mathrm{DR}$ 的单射性依赖“正则已全纯”的完整性；缺损正则性使对应只剩 单方嵌入。",
      "若交换对 $\\otimes,\\mathrm{Hom}$ 的 shift 约定（左右模、DR[x] 平移差 $\\dim X$），六函子公式的符号开始纠缠，容易读错。",
    ],
    references: [
      { title: "Modules holonomes réguliers et équations différentielles", author: "Mebkhout", year: 1984 },
      { title: "D-modules and microlocal calculus", author: "Kashiwara", year: 2003 },
    ],
    history: "本条由公开教材重新组织，项目自行改写并注明来源，未复制原文。",
  },

  /* ═══════════════════════════════════════════════════════════
   * 11. e-holonomic-d-module 全纯 D-模
   * ═══════════════════════════════════════════════════════════ */

  'e-holonomic-d-module': {
    statement: "设 M 是光滑复簇 X 上的拟凝聚 $\\mathcal{D}_X$-模。其特征簇 $\\mathrm{char}(M)$ 是余切丛 $T^*X$ 中的闭子簇，Bernstein 不等式 $\\dim\\mathrm{char}(M)\\ge\\dim X$ 成立。若等号成立，称 M 为全纯（holonomic）。全纯模的范畴是 Abel 范畴，其对象有有限长度（Jordan–Hölder 列）；且 $\\mathrm{char}$ 在推前、拉回、对偶、张量下按维数规律变化。",
    explanation: "特征簇把 M 在“相空间”（余切丛）中的支撑位置信息打包。Bernstein 不等式保证条件有形响的方：最极端（等号）的全纯模对应“最小支撑”，即局方程刚够解出生成元。全纯模具有极好的代数性质：Abel、Noether、有限长、且与可构造层配对（DR 可构造）。它是 D-模理论的工作引擎。",
    steps: [
      step('char-and-graph', "特征簇的定义与例子",
        "取 $\\mathcal{D}_X$ 的按阶滤过，M 的相容滤过 $M_\\bullet$，定义 $\\mathrm{char}(M)=\\mathrm{Supp}(\\mathrm{gr} M_{\\bullet})$ 作为 $T^*X$ 的子簇。例子：(1) $\\mathcal{O}_X$ 的特征簇是零截面 $T^*_X X$，维数 $\\dim X$；(2) 沿 $\\delta$ 的模 $\\delta_*\\mathcal{O}$ 的特征簇是 $T^*_{X}Y\\times$ 层类，维数也 $\\dim X$；(3) $\\mathcal{D}_X/\\mathcal{D}_X\\partial_{x_1}$ 的特征簇含坐标超平面，维数 $\\dim X+1$ 等等。特征簇在滤过选择下不变。",
        []),
      step('bernstein-inequality-proof', "Bernstein 不等式",
        "对非零模，$\\dim\\mathrm{char}(M)\\ge\\dim X$。证明思路：局部化后有 $\\mathrm{char}(M)$ 的象征支撑至少含一个余秩为 $\\dim X$ 的括号结构（泊松与闭合）；用符号代数证明它在谱意义下不能坍缩。代数版本可用“伴随理想”的零子簇与 Krull 维数：$\\dim\\mathrm{char}(M)\\ge\\dim X$ 的完整证明归于 Gabber 与 Kashiwara–Kawai 的圆环论。不等式在平凡模上取等号，在 $\\mathcal{D}_X$ 上取最大维数 $2\\dim X$，说明非零约束越多、特征簇越小，恰好把微分方程的“足够约束”与“过约束”分开。",
        ['char-and-graph']),
      step('abelian-finite-length', "Abel 与有限长度",
        "全纯模的全体构成 Abel 范畴：由于 $\\mathrm{char}$ 在子对象上维数不减、大于等于 $\\dim X$，全纯性沿子、商、扩张封闭；含入的预模也全纯。有限长度：全纯模的连续的滤过每层载荷 $\\mathcal{O}_{X}$ 的闭包与核都保持全纯，Jordan–Hölder 列由“标准模序列”的逐层版本给出，长度有限因为支撑维数受限。有限长度是许多表示论结论的基础：每个全纯模分解为单模的有限和，其合成因子由支撑与局部系唯一指定。有限长度的具体用途有两处：一是使全纯模范畴的 Grothendieck 群可由特征簇的分层数据计算，合成因子的重数就是 Jordan–Hölder 数据；二是使函子（如直接像）的效验可逐合成因子进行。反面对照：$\\mathcal{D}_X$ 本身非全纯（$\\mathrm{char}=T^*X$ 维数为 $2\\dim X$），它没有有限长度，因此标准模理论必须先筛出全纯类。",
        ['bernstein-inequality-proof']),
      step('dr-constructible', "全纯 ⟹ DR 可构造",
        "全纯模 M 的 $\\mathrm{DR}(M)$ 是可构造复形：逐层常值且有限阶。理由：由 Bernstein–Sato 理论，沿分层可约化到生成元上的逐层局部化，其解空间的维数有界（Cauchy 问题估计）。这实际上用到了两条外部输入：Bernstein 不等式保证特征簇维数为 $\\dim X$，从而沿每个分层只有有限多个非零上同调层；Bernstein–Sato 多项式的存在性给出局部化所需的微分算子，使解层在每层上的秩有限且局部常值。反过来，全纯性是 DR 可构造的必要条件（非全纯模的 DR 不可构造），所以“全纯 ⇔ 可构造 DR”本质。这条双方向等价给出 D-模与反常层之间最干净的接口，也是 Riemann–Hilbert 对应能在全纯类上成立的核心原因：下一节要建立的 Kashiwara–Mebkhout 等价正是把这条接口升级为范畴等价。",
        ['abelian-finite-length']),
      step('operations-characteristic', "各操作的特征簇",
        "闭嵌入 $i$：$\\mathrm{char}(i_+M)\\subseteq\\mathrm{char}(i^*M)+T^*_i X$；开嵌入 $j$：$j_+$ 含 $\\mathrm{char}(j^*M)$。张量：$\\mathrm{char}(M\\otimes N)\\subseteq\\mathrm{char}(M)\\cap\\mathrm{char}(N)$。对偶：$\\mathrm{char}(\\mathbb{D}M)=\\mathrm{char}(M)$。推前：$\\mathrm{char}(\\int_fM)\\subseteq f^*\\mathrm{char}(M)$（广义）。这些包含式的等号情形正是研究拉格朗日子簇的切入口。",
        ['dr-constructible']),
    ],
    conclusion: "$\\mathrm{char}(M)$ 是 $T^*X$ 的闭锥子簇且 $\\dim\\mathrm{char}(M)\\ge\\dim X$；等号时 M 全纯。全纯模构成 Abel 范畴、有 Jordan–Hölder 列，DR(M) 可构造，各操作的特征簇满足包含。Bernstein 不等式是全纯理论的基石。",
    dependencies: [],
    consequences: [],
    explanation: "全纯型是 D-模里的“有限型”类比：特征簇压到最小维数，象征部分被拉格朗日化。Bernstein 不等式就是保证这个最小是 $\\dim X$。正交与驱动抱：全纯 ⇔ 可构造 DR，这是 D-模与可构造拓扑互相作用的核。它把微分方程的对象归入代数有限框架，是表示论、融合理论、模形式的平台。",
    examples: [
      { title: "例子：$\\mathbb{C}^n$ 上的 $\\mathcal{O}_{\\mathbb{C}^n}$", body: "$\\mathrm{char}(\\mathcal{O})=\\{$零截面$\\}$，维数 $n=\\dim$，全纯。DR 是可构造的：$\\mathrm{DR}(\\mathcal{O})=\\Omega^\\bullet[0]$ 恒可构造。反过来 $\\mathcal{D}/\\mathcal{D}\\partial_1\\oplus\\mathcal{D}\\partial_2$（两个独立的一阶方程）的特征簇是 $\\{\\xi_1=\\xi_2=0\\}$，维数 n 仍全纯。这一簇模对应解在 n 维上常数，可构造性显然。",
        },
      { title: "例子：非全纯：B 的 D-模拉回", body: "取 n=2，M=$\\mathcal{D}_{\\mathbb{C}^2}$（全块），$\\mathrm{char}=\\{\\;(0,0,0,0)\\}$ 维数 0？错误：$\\mathrm{char}(\\mathcal{D}_X)=T^*X$ 维数 $2\\dim X=4>2$，非全纯。一般地，$\\mathcal{D}_X$ 作为自身模的特征簇是全空间，$\\dim\\mathrm{char}=2n$，超出 $n$，故 $\\mathcal{D}_X$ 非全纯（除非 n=0）。这解释了为何“全体解”太大，只有“极小支撑的解”才入全纯。",
        },
    ],
    remarks: [
      "若模非凝聚（如 $\\mathcal{D}_X$ 的非有限生成子模），特征簇未定义或维数失控，Bernstein 不等式与全纯判据失效。",
      "若 X 非光滑，$T^*X$ 的辛结构退化，特征簇的几何含义需分层重定义，全纯性没有统一公式。",
      "若去掉等号条件，DR 不保证可构造（超几何的算子作用生产奇异解层），全纯是“良序解”的精确边界。",
      "若在特征 p 下工作，Bernstein 不等式的正确形式用 p 幂截断与 Newton 多边形，维数条件被替换成 p-维数结果，不是照抄复情形。",
    ],
    references: [
      { title: "Algebraic D-modules", author: "Coutinho", year: 1995 },
      { title: "D-modules: theory and applications", author: "Sabbah", year: 2007 },
    ],
    history: "本条由公开教材重新组织，项目自行改写并注明来源，未复制原文。",
  },

  /* ═══════════════════════════════════════════════════════════
   * 12. e-spectral-sequence-degeneration 谱序列的退化
   * ═══════════════════════════════════════════════════════════ */

  'e-spectral-sequence-degeneration': {
    statement: "谱序列 $(E_r,d_r)$ 收敛到 $H^*$。若对所有 $r\\ge r_0$ 有 $d_r=0$（在 $E_{r_0}$ 上），则 $E_{r_0}\\cong E_{\\infty}$ 且 $H^*$ 有滤过 $F$ 使 $\\mathrm{gr}_F H^*\\cong E_{\\infty}$。退化在 $E_1$（或 $E_2$）的情形最常见：如 Hodge–de Rham 谱序列在紧 Kähler 流形上于 $E_1$ 退化。",
    explanation: "谱序列的技术难点在于何时给出明确结论：只有退化时 $E_2\\cong E_\\infty$，上同调的分次块才是谱序列直接读出。判断退化的通用手段是维数估计：某页非零维数之和不超过总上同调维数且都可达。Hodge 理论的退化由纯性/权论或 $dd^c$ 引理保证。",
    steps: [
      step('spectral-sequence-basics', "谱序列的组成与收敛",
        "谱序列是双分次对象 $(E_r^{p,q},d_r)$，$d_r\\colon E_r^{p,q}\\to E_r^{p+r,q-r+1}$，$d_r^2=0$，$E_{r+1}=H(E_r,d_r)$。有界情形下对 r 足够大 $E_r=E_{r+1}=\\ldots=E_{\\infty}$；收敛 $E_2^{p,q}\\Rightarrow H^{p+q}$ 表示 $H^*$ 带升滤过 $F^p=H^{-p}$ 使 $\\mathrm{gr}^p_FH^{p+q}=E_{\\infty}^{p,q}$。退化 $d_r=0$ 对 $r\\ge2$ 时 $E_2^{p,q}\\cong\\mathrm{gr}^pH^{p+q}$。",
        []),
      step('dimension-counting', "维数计数判据",
        "退化在 $E_r$ 的充分条件：$\\sum_{p,q}\\dim_k E_r^{p,q}=\\dim_k H^*$（总维数守恒）。理由：若 $d_r\\neq0$，则 $E_{r+1}$ 的维数和严格小于 $E_r$ 的（核减像）；由总维数不增，最终 $E_\\infty$ 的维数和等于 $H^*$ 的维数和。所以一旦某页已经达到预算，后续微分全零。这个判据对 Hodge 谱序列具体化为 Hodge 数之和等于 Betti 数：$\\sum_{p+q=n}h^{p,q}=b_n$ 时 $E_1$ 已用完预算。它需要两个前提：一是谱序列有界并收敛（$E_r^{p,q}$ 只在 p,q 的有界区域外为零），否则维数和发散；二是系数落在域上。整系数情形维数改为秩，且挠项可能隐藏微分（$d_r$ 可把自由部分映到挠部分而秩不变），需另行检查，例如 $E_2=\\mathbb{Z}/2$ 上的非零微分在秩意义下不可见。",
        ['spectral-sequence-basics']),
      step('weight-theory-criterion', "权论判据",
        "若谱序列各项带权（如 Deligne 的混合 Hodge 结构），且 $d_r$ 提高权（$d_r\\colon W_m\\to W_{m+1}$ 或等价记号），而两侧权的允许区间无交，则 $d_r=0$。典型应用：光滑族上同调的 Leray 谱序列中权滤过的交叉使退化自动；这正是 Deligne 证明紧 Kähler 情形 $E_1$ 退化的方法。判定步骤：(i) 求各 $E_r^{p,q}$ 的权区间；(ii) 验证 d_r 的权利差；(iii) 区间不相交即得退化。这里用的外部定理是 Deligne 的混合 Hodge 理论：$H^k(X_t)$ 带权滤过且 $\\mathrm{Gr}^W_m$ 纯权 m，而 $d_r$ 穿过 $\\mathrm{Gr}^W$ 时把权提高 1，故当 $E_r^{p,q}$ 全为纯权 $p+q$ 时区间自动无交。权滤过本身必须已知，否则该判据只给出差分关系而无从比较区间。",
        ['dimension-counting']),
      step('principle-of-two-ways', "两途径原理（双重谱序列）",
        "当同一对象给两个滤过产生两个谱序列（如双复形的行-列双谱、Hodge–de Rham 的 Hodge 滤过与权滤过），若两者都收敛且目标上同调的维数有限，常用“两个途径都到 $E_\\infty$ 且总维数相等”来确认退化。举例：Leray 谱序列对合映射的空集纤维用 $\\chi$ 等式（欧拉示性数守恒）推出。这个方法本质上是用不变量的守恒迫使中间微分消失：若某页已与总维数相等，非零微分会把后续页的维数压低，与 $E_\\infty$ 的维数预算相矛盾。它的输入是两条链的公共目标，输出是“所有 $d_r$（$r\\ge1$）为零”，从而第一步的输出可以直接交给下一步读出分次块。若两个谱序列的目标对象不同，即使总维数相等也不能断言逐项退化。",
        ['weight-theory-criterion']),
      step('ddc-lemma-and-degeneration', "$dd^c$ 引理与退化",
        "紧 Kähler 情形，$dd^c$ 引理说 $\\ker d\\cap\\ker d^c=\\mathrm{im}\\,dd^c$，从而 Hodge 谱序列在 $E_1$ 退化：Hodge 分解 $H^n=\\oplus_{p+q=n}H^{p,q}$。证明骨架：取调和代表元，$\\Delta$-调和的 $\\omega$ 满足 $\\partial\\bar\\partial\\omega=0$ 且由 $dd^c$ 可消除，故按 Hodge 型分块。这是退化判据的具体成功案例。该引理依赖紧性与 Kähler 条件，因此它同时解释为何 Hodge 分解在紧 Kähler 流形上成立、而在一般复流形上由 Frölicher 谱序列控制。",
        ['principle-of-two-ways']),
    ],
    conclusion: "退化在 $E_r$（$d_s=0\\ \\forall s\\ge r$）时 $E_r\\cong E_\\infty$ 且 $\\mathrm{gr}^p_FH^{p+q}=E_r^{p,q}$。紧 Kähler Hodge 谱序列在 $E_1$ 退化给出 Hodge 分解；维数守恒与权论是两条通用判据。",
    dependencies: [],
    consequences: [],
    explanation: "谱序列的价值在于退化那一刻才兑现：非退化时它只是“逐步逼近”的脚手架。读懂退化=找到让微分全零的机制。最常用两种：预算核对（维数守恒）与权重核对（微分提高权但无目标）。Hodge 理论中 $dd^c$ 引理是终极驱动。",
    examples: [
      { title: "例子：$\\mathbb{P}^n$ 的 Hodge 谱序列", body: "$H^*(\\mathbb{P}^n)=\\mathbb{C}[x]/(x^{n+1})$，Hodge 数 $h^{p,q}=1$ 当 $p=q$ 且 $\\le n$。$E_1^{p,q}=H^q(\\mathbb{P}^n,\\Omega^p)$ 只在 q=p 非零，总维数 $n+1$，等于 Betti 数之和，故 $E_1$ 退化。直接：$d_1\\colon H^0(\\Omega^1)\\to H^1(\\mathcal{O})$，$d_1$ 必须为零因为 $H^0(\\Omega^1)=0$（$\\mathbb{P}^n$ 无整体 1-形式）。",
        },
      { title: "例子：$\\mathbb{P}^1\\times\\mathbb{P}^1$ 的 Künneth 退化", body: "$E_2^{p,q}=H^p(\\mathbb{P}^1)\\otimes H^q(\\mathbb{P}^1)\\Rightarrow H^{p+q}$。由 Künneth 谱序列一般陈述其非退化项：各项 $E_2^{p,q}$ 只在 p,q∈{0,2} 非零，总维数 1+2+1=4=秩。$d_2$ 从 $(0,1)\\to(2,0)$ 若非零则拉低总维数，故 $d_2=0$，退化。这与直接 Künneth 一致。",
        },
    ],
    remarks: [
      "若谱序列无界或收敛条件被违反（如目标不是有限型的模），$E_\\infty$ 与滤过对象之间会失配，退化结论不能直接读。",
      "若去掉紧性（仿射流形），Hodge 谱序列可以退化仍但 Hodge 分解不完整，$dd^c$ 引理失效需用 $L^2$ 或泛函分析补强。",
      "若只知 $E_2$ 而无权滤过，权论判据无从应用，只能靠维数守恒；此时退化可能是假象（微分成对非零又成对消失）。",
      "若谱序列由非精确函子出发（依赖多余的辅助），两途径原理的 $\\chi$ 相等不保证逐项退化，需检查连接微分。",
    ],
    references: [
      { title: "An Introduction to the Theory of Groups of Lie", author: "Bott, Tu", year: 1982 },
      { title: "Hodge Theory and Complex Algebraic Geometry I", author: "Voisin", year: 2002 },
    ],
    history: "本条由公开教材重新组织，项目自行改写并注明来源，未复制原文。",
  },

  /* ═══════════════════════════════════════════════════════════
   * 13. e-hodge-to-de-rham Hodge–de Rham 谱序列
   * ═══════════════════════════════════════════════════════════ */

  'e-hodge-to-de-rham': {
    statement: "对紧流形 X，de Rham 复形 $\\Omega_X^\\bullet$ 带 Hodge 滤过 $F^p\\Omega=\\sigma_{\\ge p}\\Omega$，其谱序列 $E_1^{p,q}=H^q(X,\\Omega_X^p)\\Rightarrow H^{p+q}_{dR}(X)$。对紧 Kähler 流形该谱序列在 $E_1$ 退化：$H^{p+q}_{dR}=\\oplus_{p+q=n}H^q(X,\\Omega^p)$，即 Hodge 分解 $H^n=\\oplus H^{p,q}$。",
    explanation: "de Rham 复形把微分形式按次数给出天然滤过，谱序列逐次逼近整体上同调。光滑情形各项是杜·洛梯度上同调 $H^q(X,\\Omega^p)$。紧 Kähler 的 $dd^c$ 引理使退化在 $E_1$：每个同调类有调和代表，调和形式闭且共闭给出 Hodge 型分解。非紧或非 Kähler 则该谱序列一般不退化。",
    steps: [
      step('filtration-and-E1', "滤过与 $E_1$ 项",
        "滤过 $F^p\\Omega=\\Omega^{\\ge p}$（次数 ≥p 的微分形式）。行滤过谱序列 $E_0^{p,q}=\\Gamma(X,\\Omega^{p+q})/F^{p+1}$，$d_0$ 是外微分，$E_1^{p,q}=H^q_{dR}(X,\\Omega^p_{\\text{cl}}/\\ldots)$ 合约化到 $H^q(X,\\Omega^p_X)$（由 Dolbeault 定理 $H^q(X,\\Omega^p)\\cong H^{p,q}_{\\bar\\partial}$）。这一识别使 $E_1$ 项变成纯 Hodge 数。若 X 不是复流形而是抽象可微流形，Hodge 滤过没有定义，$E_1$ 项也没有 Dolbeault 解释，谱序列只能按普通滤过读取。",
        []),
      step('elliptic-regularity', "椭圆算子与正则性",
        "$E_1$ 之后，微分 $d_r$ 来自 $\\partial$。为了证明退化需要调和理论：取 Hermite 度量，$\\Delta_d,\\Delta_{\\bar\\partial},\\Delta_\\partial$ 的 Hodge 分解将 $H^k_{dR}$ 识别为调和的 $\\Delta_d$-形式。椭圆正则性给出 $H^{p,q}_{\\bar\\partial}$ 维数有限，Kähler 条件 $[\\Lambda,\\partial]=-i\\bar\\partial^*$ 等使三 Laplace 算子相等（Kähler 恒等式 $\\Delta_d=2\\Delta_{\\bar\\partial}=2\\Delta_\\partial$）。",
        ['filtration-and-E1']),
      step('ddc-lemma', "$dd^c$ 引理",
        "$\\mathcal{J}$ 黎曼结构给出 $d^c=J^{-1}dJ$（奇偶号修正）。紧 Kähler 的 $dd^c$ 引理：若 $\\omega$ 闭且共闭（$d\\omega=d^c\\omega=0$）则 $\\omega=dd^c u$（在恰当意义下）。这是关键：它把“闭且共闭”从任意障碍中解救，使谱序列微分 $d_1=d^c$ 落在 $\\mathrm{im}$ 的补里，从而 $E_1$ 项全是调和型，退化立即。该引理的假设不能减：需要 $\\omega$ 闭、$d^c$ 闭（即 $\\omega$ 属于两族的交）以及 X 紧 Kähler，因为证明用椭圆算子 $\\Delta_d$ 的可解性与 Green 算子的有界性。失败模式是抽象可微流形或仅近 Kähler 的流形，后者 $d^c$ 仍可定义但三类调和空间不再重合，引理失效、$E_1$ 退化无依据。",
        ['elliptic-regularity']),
      step('degeneration-and-hodge-decomposition', "退化与 Hodge 分解",
        "由 $E_1$ 退化，$H^n_{dR}(X)=\\oplus_{p+q=n}H^q(X,\\Omega^p)$。配合 Hodge 对称（共轭线性同构 $H^{p,q}\\cong\\overline{H^{q,p}}$，由实结构的复共轭作用给出，把调和 $(p,q)$ 形式送到 $(q,p)$ 形式）得 $h^{p,q}=h^{q,p}$；再配合整系数格得 Betti 数与 Hodge 数的关系 $b_n=\\sum_{p+q=n}h^{p,q}$，特别地奇数 Betti 数 $b_{2m+1}$ 是偶数。这一退化结论是下一步深入应用的前提：正因为分次块直接等于 Hodge 数，Lefschetz 分解、Hodge 指标定理与曲面的分类计算才有可用的形式。对曲面情形可枚举：$b_1=2h^{1,0}=2h^{0,1}$，$b_2=2h^{2,0}+h^{1,1}$，且 $h^{1,1}$ 与相交形式的正负惯性指数相关。",
        ['ddc-lemma']),
      step('failures-and-extensions', "失效与推广",
        "非 Kähler（如 Hopf 曲面、Iwasawa 流形）谱序列在 $E_1$ 不退化。Hopf 曲面 $b_1=1$ 而 $h^{0,1}=0$，谱序列非退化项提供差：$E_1$ 的总维数大于 Betti 数之和，未消掉的微分把多余部分成对抹去。推广方向有三条：一是 Frölicher 谱序列，它对一般复流形给出 $E_1^{p,q}=H^{q}(X,\\Omega^p)$ 且 $E_2$ 项可由 Dolbeault 计算，其退化失败时提供维数不等式 $b_k\\le\\sum_{p+q=k}h^{p,q}$；二是代数簇情形，Deligne 用混合 Hodge 结构的纯性与权论证明 $E_1$ 退化，其中退化的驱动由 $dd^c$ 引理换成 $(p,p)$ 型类的纯性；三是紧 Kähler 之外的可极化变体，用正性代替 Kähler 度量。$\\mathbb{P}^2$ 与复环面的核算说明退化并不要求基底特别，只要调和空间按型分块即可。",
        ['degeneration-and-hodge-decomposition']),
    ],
    conclusion: "紧 Kähler 流形上 $E_1^{p,q}=H^q(X,\\Omega^p)$ 的 Hodge–de Rham 谱序列在 $E_1$ 退化，给出 Hodge 分解 $H^n=\\oplus H^{p,q}$；非 Kähler 流形退化一般失败，由 Frölicher 谱序列的维数不等等式控制。",
    dependencies: [],
    consequences: [],
    explanation: "Hodge–de Rham 谱序列把微分几何与复几何的边界汇合：Dolbeault 上同调逐次数配对成谱序列逼近 de Rham 上同调。紧 Kähler 时 $dd^c$ 引理让“调和=闭+共闭”自动成立，一切微分无力，退化为直和。Kähler 条件的用武之地正是让三个 Laplace 算子合一，没有它就没有 $dd^c$ 引理。",
    examples: [
      { title: "例子：$\\mathbb{T}^n$（复环面）", body: "$X=\\mathbb{C}^n/\\Lambda$，$H^q(\\mathbb{T}^n,\\Omega^p)=\\wedge^p\\bar\\Lambda^*\\otimes\\wedge^q\\Lambda$，维数 $\\binom{n}{p}\\binom{n}{q}$。总 $E_1$ 维数 $=\\sum_{p,q}\\binom{n}{p}\\binom{n}{q}=2^n\\cdot2^n/1=2^{2n}$？核对：$\\sum\\binom np\\binom nq=(\\sum\\binom np)(\\sum\\binom nq)=2^n2^n=4^n$。Betti 数 $b_k=\\binom{2n}{k}$，$\\sum_k b_k=2^{2n}=4^n$，相等，故 $E_1$ 退化。",
        },
      { title: "例子：$\\mathbb{P}^2$", body: "$E_1^{p,q}=H^q(\\mathbb{P}^2,\\Omega^p)$：$p=q=0$ 时 $\\mathbb{C}$，$p=q=2$ 时 $\\mathbb{C}$，其余 0，维数和 3=Betti 和。Hodge 数 $h^{1,1}=1$，分解 $H^2=\\mathbb{C}[\\omega]$。$d_1$ 唯一候选 $H^0(\\Omega^1)\\to H^1(\\mathcal{O})$ 两边为 0，退化确认。",
        },
    ],
    remarks: [
      "若 X 非紧，调和空间无穷维且 $dd^c$ 引理的条件不充分，退化需 $L^2$ 或权重修正，一般失败。",
      "若 X 只是近乎 Kähler（几乎复但非 Hermite 恰），Kähler 恒等式失效，退化不能由 $dd^c$ 证明。",
      "若系数非 $\\mathbb{C}$（整系数），谱序列是挠进挠的，退化只在有理系数成立，整系数项有扩展问题。",
      "若流形不是紧但投影，退化仍可由纯性取回（Deligne），但 $dd^c$ 论证不直接，需替换为权滤过。",
    ],
    references: [
      { title: "Principles of Algebraic Geometry", author: "Griffiths, Harris", year: 1978 },
      { title: "Hodge Theory and Complex Algebraic Geometry I", author: "Voisin", year: 2002 },
    ],
    history: "本条由公开教材重新组织，项目自行改写并注明来源，未复制原文。",
  },

}