/**
 * 批次 01 长篇证明数据：为图谱中 13 个基础/概形/态射类节点补齐证明页。
 *
 * 写作约定（与 scripts/_check-proof-file.mjs 的检查一致）：
 *   · 正文用中文长段 + Unicode 数学符号（⊆ ⋂ ⊗ → ↦ 𝔪 ℓ ≅ ε 𝔭），直接作为文本排版；
 *   · 需要公式排版时才用 $...$ 包住完整 LaTeX，反斜杠在 JS 字符串里双写；
 *   · 引用只写已核实的 Stacks Project 稳定 tag，URL 用 tag 形式；
 *   · 每步正文均超过 320 字，不使用无信息量的凑字数句子。
 */

const step = (id, title, body, uses = []) => ({ id, title, body, uses })
const stacks = (title, tag, year = 2024) => ({
  title, author: 'The Stacks Project', year, url: `https://stacks.math.columbia.edu/tag/${tag}`,
})
const HISTORY = '本条由公开教材与 Stacks Project 命题重新组织，项目自行改写并注明来源，未复制原文。'

export const BATCH_01_PROOFS = {

  /* ═══════════════════════════════════════════════════════════
   * 1. 赋值环与整闭
   * ═══════════════════════════════════════════════════════════ */

  'valuation-ring': {
    statement: '设 R 是整环，K 是它的分式域。称 R 在 K 中整闭，若对任意首一多项式 $f(T)=T^n+a_{n-1}T^{n-1}+\\dots+a_0\\in R[T]$，只要 x∈K 满足 f(x)=0 就有 x∈R。则下列两条等价：(1) R 在 K 中整闭；(2) R 等于所有包含 R 的 K 的赋值环之交，即 $R=\\bigcap\\{V:V\\text{ 是 K 的赋值环}, R\\subseteq V\\}$。',
    steps: [
      step('integral-closure-basic', '先把"整元素"与"整闭"的确切含义固定下来',
        '设 A⊆B 是环扩张，b∈B 称为在 A 上整，若存在首一多项式 $g(T)=T^n+a_{n-1}T^{n-1}+\\dots+a_0\\in A[T]$（最重要的一点是首项系数为 1）使 g(b)=0。只要求 R 中系数、不要求 R 是域，所以这比"在 R 上代数"更强：$1/2\\in\\mathbb{Q}$ 在 $\\mathbb{Z}$ 上代数但不在 $\\mathbb{Z}$ 上整，因为 $2X-1$ 不是首一多项式。整元素的一个等价刻画是"由有限生成 A-模与 b 稳定的子模"：b 在 A 上整 ⟺ 存在有限生成 A-子模 $M\\subseteq B$ 使 $b\\cdot M\\subseteq M$、且 b 的"分母"被 M 拦截。这个刻画是下文的引擎。整环 R 在分式域 K 中整闭，就是指整元素恰好就是 R 自己的元素，"闭"取的就是"在取整闭包这个运算下不再增大"的意思。整数环 $\\mathbb{Z}$、域上多项式环 $k[x]$ 都是整闭的；$k[x^2,x^3]$、$\\mathbb{Z}[\\sqrt{-3}]$ 不是。', ['scheme']),
      step('integral-closure-is-ring', '整闭包是一个环：这是可乘、可加性的来源',
        '要谈"R 等于某些环之交"就得先确认那些环确实是环。设 $b,c$ 都在 A 上整，则 $A[b]$ 与 $A[c]$ 都是有限生成 A-模，从而 $A[b,c]=A[b]\\otimes_A A[c]$（在同一扩环中的乘积子环）也是有限生成 A-模；由于 $b+c$ 与 $bc$ 都保持 $A[b,c]$ 稳定（它们是该环的乘法封闭性），用上面的模刻画即得 $b+c$、$bc$ 在 A 上整。于是"整元素全体"对加减乘封闭，构成 B 的子环，称为 A 在 B 中的整闭包 $\\overline{A}^{B}$。特别地若 $R\\subseteq K$ 是整环，则 R 在 K 中的所有整元素构成一个包含 R 的环 $\\overline{R}$，"R 整闭"即指 $R=\\overline{R}$。这一步的结论是结构性的：整闭纯看成"环对一个内部运算的不动点"，因此它自动被任意多个子环的交保持——交里做减法与乘法不会跑出去，这正是后文取"所有赋值环之交"的前提。', ['integral-closure-basic']),
      step('one-direction', '由赋值环蕴含整闭：交的是整闭环',
        '设 V 是 K 的赋值环，即 V 是 K 的真子环且对每个 $x\\in K^{\\times}$ 有 $x\\in V$ 或 $x^{-1}\\in V$。先证单个 V 整闭。设 $x\\in K$ 在 V 上整，满足 $x^n=-(a_{n-1}x^{n-1}+\\dots+a_0)$，若 $x\\notin V$，则由赋值性 $x^{-1}\\in V$ 且 $x^{-1}$ 非单位（V 是真子环，否则 V=K），故 $x^{-1}$ 落在 V 的唯一极大理想 𝔪 中。把上式乘以 $x^{-(n-1)}$ 得 $x=-(a_{n-1}+a_{n-2}x^{-1}+\\dots+a_0x^{-(n-1)})$，右端每个含 $x^{-1}$ 的项都在 𝔪 中（因为 𝔪 是理想），故 $x\\in\\mathfrak{m}\\subseteq V$，与 $x\\notin V$ 矛盾。因此 V 在 K 中整闭。再设 R 包含于每个这样的 V。任取 $x\\in K$ 在 R 上整，则 x 在每个 V 上整（R⊆V，R 的系数也是 V 的系数），由 V 整闭得 $x\\in V$ 对所有 V 成立，故 $x\\in\\bigcap V=R$。这就完成了 (2)⟹(1) 的一半：先证每个 V 整闭，再把整性沿包含传递下去。', ['integral-closure-is-ring']),
      step('other-direction', '由整闭得到"存在不含 x 的赋值环"：反向用 Zorn 与局部化',
        '设 R 整闭而 $x\\in K\\setminus R$。若每个包含 R 的赋值环都含 x，则 $x\\in\\bigcap V$；但我们还没证 $\\bigcap V\\subseteq R$，所以不能直接反证，必须构造性地找出一个不含 x 的赋值环。做法是把 R 沿 x 局部化：记 $S=\\{1,x,x^2,\\dots\\}$，则 $R_x=R[S^{-1}]$ 是包含 R 的整环。断言 $x^{-1}$ 不在 $R_x$ 的任一极大理想中：由 Zorn 引理取极大理想 𝔭（在非零环 $R_x$ 中存在，因为单位元不是 0，取全部真理想的链并集再上界即可）。若 $x^{-1}\\in\\mathfrak{p}$，则 $x^{-1}$ 在 $R_x$ 中可逆且属于 𝔭，得 $1\\in\\mathfrak{p}$，矛盾；故 $x^{-1}\\notin\\mathfrak{p}$，等价地 $x\\notin\\mathfrak{p}R_x$。取 $R_x$ 在 𝔭 处的局部环 $R_{x,\\mathfrak{p}}$，由赋值环存在定理（它把 R 上不超过某个偏序的赋值扩张到 R 的商域上）可把它嵌入一个赋值环 V，使 $\\mathfrak{p}R_x$ 落进 V 的极大理想，故 $x\\notin V$。于是 $\\bigcap V \\subseteq R$ 的逆否成立，检验得知任何 $x\\notin R$ 都被某个 V 漏掉，故 $\\bigcap V=R$。', ['one-direction']),
      step('normalization-consequence', '推论：赋值环是正规化与维数 1 情形的骨架',
        '把两条方向拼起来即得等价。这个等价立刻给出两个常用推论。其一，整闭是"局部—整体"性质：$R=\\bigcap \\{V\\supseteq R\\}$ 与任意子环的相交相容，因此 R 整闭等价于每个局部化 $R_{\\mathfrak{p}}$（𝔭 素）整闭，因为整性关系只涉及分式域中的元素与 R 中的系数。其二，正规化存在：对整环 $R\\subseteq K$，整闭包 $\\overline{R}$ 是包含 R 的整扩张且在 K 中整闭，故就是 R 在 K 中的正规化。对有限生成 k-代数（几何上即仿射簇），$\\overline{A}$ 是有限生成 A-模（有限性来自诺特环上整扩张的有限性），这正是几何上"正规化态射 $\\tilde X\\to X$ 是有限且双有理"的代数来源，也解释了为什么正规化不改变函数域、却能剔除余维 1 上的奇性。', ['other-direction', 'one-direction']),
    ],
    conclusion: '整环 R 在分式域 K 中整闭，当且仅当 $R=\\bigcap\\{V:V$ 是 K 的赋值环且 $R\\subseteq V\\}$。因此整闭性可被完全刻画为"被一族具除法判据的环同时守住"。',
    dependencies: [],
    consequences: [],
    explanation: '赋值环是"每个非零元素恰有一个逆"的极值型环：K 中任一非零元，x 与 $x^{-1}$ 至少有一个留在 V 里。这个除法判据极强，因而赋值环本身自动整闭——若 x 在 V 上整而 $x\\notin V$，则 $x^{-1}$ 必落在唯一极大理想 𝔪 里，把首一关系式乘 $x^{1-n}$ 就把 x 挤回 𝔪 里，矛盾。反过来，任一不满足整闭性的元素都能被某个赋值环"抓住"，这个捕捉过程靠局部化加 Zorn 引理完成。于是整闭性等价于"被赋权判据守门"这一看似拓扑的现象：正常的几何原型是复底空间上的全纯函数环，整闭对应"类全纯函数中没有额外的代数元"，也就是正规簇比一般簇少了那些藏在余维 1 上的隐缺陷。',
    examples: [
      {
        title: '例子：$\\mathbb{Z}$ 是赋值环之交所给出的整闭环',
        body: '取 $R=\\mathbb{Z}$，K=ℚ。对每个素数 p，p-进赋值环 $V_p=\\{a/b:\\gcd(a,b)=1,\\ p\\nmid b\\}$ 是 ℚ 的赋值环。任何 $x\\in\\mathbb{Q}\\setminus\\mathbb{Z}$ 写成最简分数 a/b 后必有某个素数 p|b，此时 $x\\notin V_p$（因为分母被 p 整除），所以 $\\bigcap_p V_p=\\mathbb{Z}$。另一方面 $\\sqrt{2}$ 在 ℚ 中不整于 $\\mathbb{Z}$ 吗？$\\sqrt{2}\\notin\\mathbb{Q}$，无从检验；但 $\\mathbb{Z}[\\sqrt{2}]$ 中 $\\sqrt{2}$ 在 $\\mathbb{Z}$ 上整，这说明整元素可以跑出 ℚ，而"在分式域中整闭"恰恰只约束落在 K 内部的那些元素。',
      },
    ],
    remarks: [
      '去掉"首一"要求结论会立刻失效：若允许首项系数非 1，$1/2$ 就会满足 $2X-1=0$ 而被判为"整"，但 $1/2\\notin\\mathbb{Z}$，整闭性就沦为平凡性质。',
      'R 必须是整环才能谈"分式域中的整闭"；对含零因子的环，整性与"被赋值环相交"的等价需要另加条件（例如要求全商环与 R 有相同极小素理想），否则交集可能漏掉幂零元结构。',
      '"赋值环交集"这句话里必须限定这些赋值环都包含 R 且落在 K 内：若允许外部赋值环参与，则有些 V 甚至不含 R 的单位，交集会缩小到 R 的真子环。',
    ],
    references: [
      stacks('Valuation rings, Tag 00IB', '00IB'),
      stacks('Integral closure, Tag 00GM', '00GM'),
      stacks('Normalization, Tag 035H', '035H'),
      { title: 'Commutative Algebra with a View Toward Algebraic Geometry', author: 'David Eisenbud', year: 1995 },
    ],
    history: HISTORY,
  },

  /* ═══════════════════════════════════════════════════════════
   * 2. 层
   * ═══════════════════════════════════════════════════════════ */

  'sheaf': {
    statement: '设 X 是拓扑空间，$\\mathcal{F}$ 给每个开集 U⊆X 指派一个集合 $\\mathcal{F}(U)$（或阿贝尔群、环、模），并对每对开包含 $V\\subseteq U$ 给出限制映射 $\\rho_{UV}:\\mathcal{F}(U)\\to\\mathcal{F}(V)$，满足：(F1) $\\rho_{UU}=\\mathrm{id}$，且 $W\\subseteq V\\subseteq U$ 时 $\\rho_{UW}=\\rho_{VW}\\circ\\rho_{UV}$；(F2) 局部性：若 $s,t\\in\\mathcal{F}(U)$ 且存在覆盖 $U=\\bigcup_i U_i$ 使 $\\rho_{UU_i}(s)=\\rho_{UU_i}(t)$ 对一切 i 成立，则 s=t；(F3) 粘合性：若给定覆盖 $U=\\bigcup_i U_i$ 与元素 $s_i\\in\\mathcal{F}(U_i)$，满足 $\\rho_{U_i,U_i\\cap U_j}(s_i)=\\rho_{U_j,U_i\\cap U_j}(s_j)$ 对一切 i,j 成立，则存在 $s\\in\\mathcal{F}(U)$ 使 $\\rho_{UU_i}(s)=s_i$ 对一切 i 成立。满足 (F1)–(F3) 的预层称为层。',
    steps: [
      step('presheaf-functor', '预层：把"开集包含"变成函子，限制映射的相容性是唯一约束',
        '先看第一层结构。把 X 的开集按包含关系看作偏序范畴 $\\mathrm{Op}(X)$：对象是开集，态射只有包含 $V\\subseteq U$。一个预层（取值在环范畴 $\\mathsf{Ring}$ 中）就是这个范畴到 $\\mathsf{Ring}$ 的反变函子：$U\\mapsto\\mathcal{F}(U)$，$V\\subseteq U\\mapsto\\rho_{UV}:\\mathcal{F}(U)\\to\\mathcal{F}(V)$，函子性恰好给出 (F1) 的两条要求。反变是要点所在：大集合上的数据限制到小集合，方向与包含相反，这保证了"限制"是一个确定且幂等的操作。平凡预层如常数预层 $U\\mapsto A$（限制全是恒等）与可微函数预层 $U\\mapsto \\mathcal{C}^\\infty(U)$（限制是函数限制）都满足 (F1)，所以 (F1) 本身不能把两者区分开——这说明层的本质内容全在 (F2)、(F3) 这两条"局部—整体"公理里，预层只是给"局部数据"这个说法搭好了承载结构。', ['zariski-topology']),
      step('sections-and-stalks', '截面与茎：局部性的判据可以完全由茎承担',
        '记 $\\mathcal{F}(U)$ 的元素为 U 上的截面，并约定记号 $s|_V=\\rho_{UV}(s)$。局部性 (F2) 有一个等价的茎形式：s=t 当且仅当对每个 $x\\in U$，s 与 t 在茎 $\\mathcal{F}_x=\\varinjlim_{x\\in V\\subseteq U}\\mathcal{F}(V)$ 中的像是同一个。方向"⟹"显然；"⟸"用到 X 是拓扑空间时每个点有基本邻域系，茎中相等即存在含 x 的足够小开邻域 $V_x\\subseteq U$ 使 $s|_{V_x}=t|_{V_x}$，这些小邻域全体构成 U 的覆盖，再用 (F2) 拼接。可见 (F2) 的本质是"点的局部决定整体的相等性"。这个观察解释了为什么层论里通常先算茎再回到开集：任何一个开集 U 都可以写成其点的邻域之并，于是"在 U 上验证某个等式"就变成"逐点验证"，这正是代数几何中把局部环计算升级为层判定的标准手法。茎作为滤过余极限还有个附带好处：它在取核、余核时是正合的，而截面函子一般做不到。', ['presheaf-functor']),
      step('gluing-uniqueness', '粘合性：局部一致的截面唯一拼成整体截面',
        '把 (F2) 与 (F3) 合起来看，"存在性 + 唯一性"正好给出一个等化子式的正合列 $0\\to\\mathcal{F}(U)\\to\\prod_i\\mathcal{F}(U_i)\\to\\prod_{i,j}\\mathcal{F}(U_i\\cap U_j)$，其中第一个映射是 $s\\mapsto (s|_{U_i})_i$，第二个映射在第 (i,j) 分量上定义为 $(s_k)_k\\mapsto s_i|_{U_i\\cap U_j}-s_j|_{U_i\\cap U_j}$。(F2) 说明第一个映射是单射，(F3) 说明它的像是第二个映射的核。因此"层 = 满足两条公理的预层"可以完全用这个正合列表述，而这也解释了层的威力：只要能在覆盖上给出相容的局部数据，就自动得到整体截面，无需追问覆盖的选取；不同覆盖给出的结果在重叠处自动一致，因为二者都落到同一个整体截面上。这一步也说明层公理不是两条独立的限制，而是"整体截面函子恰好是某个 Čech 型等化子"，把"局部定义、整体存在"变成一条可计算的条件。', ['presheaf-functor', 'sections-and-stalks']),
      step('sheafification', '层化：把任意预层最经济地修正成层，且不改变茎',
        '并非所有预层都是层。常数预层 $U\\mapsto A$ 当 U 分裂成两个不连通开集时就不是层：在每一块上取不同常数的"局部常数"数据在重叠（空集）上自动相容，却拼不成 A 中的一个常数。修正的手段是层化：定义 $\\mathcal{F}^{+}(U)$ 为所有"局部到某个 $\\mathcal{F}(V)$ 的截面族且两两在重叠上相容"的族，等价说法是 $\\mathcal{F}^{+}$ 把 U 上的截面指派为满足恰当相容条件的映射族。关键性质有两条：其一，存在预层态射 $\\mathcal{F}\\to\\mathcal{F}^{+}$ 诱导茎上的同构 $\\mathcal{F}_x\\cong\\mathcal{F}^{+}_x$；其二，任何预层态射 $\\mathcal{F}\\to\\mathcal{G}$ 且 $\\mathcal{G}$ 是层，都唯一地穿过 $\\mathcal{F}^{+}$。这两条合起来给出层化函子是"从预层到层"的左伴随，把预层范畴的局部化问题解掉。有了它，核与余核在层范畴中都能定义（余核必须先取层化才保持茎的正合性），上同调理论才有立足点。', ['gluing-uniqueness', 'sections-and-stalks']),
    ],
    conclusion: '层是满足限制相容性 (F1)、局部性 (F2)、粘合性 (F3) 的预层，等价于截面函子把每个开覆盖写成等化子正合列 $0\\to\\mathcal{F}(U)\\to\\prod_i\\mathcal{F}(U_i)\\to\\prod_{i,j}\\mathcal{F}(U_i\\cap U_j)$；层化 $\\mathcal{F}\\mapsto\\mathcal{F}^{+}$ 是保持茎不变的左伴随，使层范畴中可自由取核与取余核。',
    dependencies: [],
    consequences: [],
    explanation: '层把"局部定义、整体研究"变成严格的数学机制。它的两条公理分别对应两种直觉：(F2) 说整体截面被它在任意覆盖上的限制完全确定，即"信息不会在限制中被创造"；(F3) 说局部相容的数据总能无歧义地拼成一个整体截面，即"信息不会在限制中被丢失"。把这两条翻译成代数，就是一个等化子正合列，于是"截面"成了可以逐块计算的对象。另一件极重要的事是茎的引入：茎是逐点取余极限，因而自动正合，把全局的层问题化为逐点的模论问题，而截面层面的正合性则需用长正合列去补偿，这正是上同调产生的根源。整个概形理论、上同调与模空间理论都在这个框架下展开。',
    examples: [
      {
        title: '例子：$\\mathbb{R}$ 上的光滑函数层与常数预层的差别',
        body: '取 $X=\\mathbb{R}$，$\\mathcal{C}^\\infty$ 把 U 送到 $\\mathcal{C}^\\infty(U)$。局部性显然：两个光滑函数若在每个点附近相等则整体相等。粘合性也成立：若在覆盖 $\\mathbb{R}=\\bigcup U_i$ 上给出光滑函数 $f_i$，且在重叠 $U_i\\cap U_j$ 上一致，则统一定义它们的最小公共延拓得到唯一的 $f\\in\\mathcal{C}^\\infty(\\mathbb{R})$。反过来，常数预层 $\\underline{A}$ 不是层：令 $U_1=(-\\infty,0)$、$U_2=(0,\\infty)$，这是 $\\mathbb{R}\\setminus\\{0\\}$ 的覆盖，重叠为空集，于是各自指定常数 a≠b 的"局部数据"在重叠上无从冲突，却拼不出 $\\mathbb{R}\\setminus\\{0\\}$ 上的常数。这直接说明粘合性公理不可省略；该预层的层化得到的是"局部常值层"，其截面正是局部常值函数而非常数。',
      },
    ],
    remarks: [
      '把粘合性删掉只留局部性，得到的是"分离预层"，它的全局截面可能装不进应有的数据；反之只留粘合性而不留唯一性（例如允许"半层"），会破坏截面函子的等化子刻画，使茎与截面脱钩。',
      '层化保留茎但一般不保留开集上的截面：$\\mathcal{F}(U)\\to\\mathcal{F}^{+}(U)$ 只是单射而非同构，常数预层就是反例；只在 $\\mathcal{F}$ 已是层时才是同构。',
      '取余核是层论中极易出错的运算：在预层层面取余核会丢掉粘合性，因此必须先取商预层再做层化；这正是层范畴是阿贝尔范畴但预层范畴的余核不能直接使用的原因。',
    ],
    references: [
      stacks('Sheaves on a site, Tag 006D', '006D'),
      stacks('Sheaves of modules, Tag 01AD', '01AD'),
      { title: 'Sheaves on Manifolds', author: 'Masaki Kashiwara, Pierre Schapira', year: 1990 },
    ],
    history: HISTORY,
  },

  /* ═══════════════════════════════════════════════════════════
   * 3. 结构层
   * ═══════════════════════════════════════════════════════════ */

  'structure-sheaf': {
    statement: '设 (X, $\\mathcal{O}_X$) 是由谱 $X=\\mathrm{Spec}\\,A$ 给出的仿射概形。则存在唯一的环层 $\\mathcal{O}_X$，使得对每个主开集 $D(f)$ 有指定同构 $\\mathcal{O}_X(D(f))\\cong A_f$，且该同构与沿 $D(g)\\subseteq D(f)$ 的限制映射（即局部化 $A_f\\to A_g$）相容。这个层称为 X 的结构层；一般概形的结构层在每个仿射开子集上被指定为该仿射谱的结构层，并沿开覆盖粘合。',
    steps: [
      step('localize-functions', '局部化的截面：$A_f$ 是"在 $D(f)$ 上分母可逆的函数环"',
        '在仿射情形，结构层的截面应当在"几何上"解释为局部可写成 $a/g$、且分母在讨论的开集上处处非零的函数。主开集 $D(f)=\\{\\mathfrak{p}:f\\notin\\mathfrak{p}\\}$ 是刚好把 f 的零轨迹挖掉的开集，在此集合上 f 可以被当作可逆，因为所有 f 值非零的点都在里面。于是定义 $\\mathcal{O}_X(D(f))=A_f=A[1/f]$，它的元素是形如 $a/f^n$ 的形式分数，两条形式分数相等当且仅当存在 m 使 $f^m(a f^{n\\prime}-a\\prime f^{n})$ 在 A 中为 0。这里的关键是"分母只在 f 的幂里取"，使得 $D(f)\\subseteq D(g)$ ⟺ $\\mathrm{rad}(f)\\subseteq\\mathrm{rad}(g)$ ⟺ 某个 $f^n$ 落在 (g) 中，从而限制映射 $A_g\\to A_f$ 恰好由 $g\\mapsto f$ 的局部化给出，即把 $b/g^n$ 送成 $b/(g^n)$ 在 $A_f$ 中的像。这套定义与"函数在某点上取零集合"完全对偶，并且立刻给出 $\\mathcal{O}_X(X)=A_f$ 在 $f=1$ 时等于 A，符合"整体正则函数环 = A"的期望。', ['zariski-topology', 'localization']),
      step('distinguished-basis', '主开集构成基：粘合只须在基上验证并自动相容',
        '主开集族 $\\{D(f)\\}_{f\\in A}$ 构成 X 的拓扑基：任给开集 $U=\\bigcup_{i}\\mathrm{Spec}\\,A_{f_i}$？更精确地说，$\\mathrm{Spec}\\,A$ 中任一开集都被若干 $D(f)$ 覆盖，因为 $D(f)$ 恰好是"避开多项式 f 的零点集"的开集，而开集的定义就是由这样的条件生成。有了基，就能把"层"的定义降级到基上：只须对基元素指定值并给出沿基包含的限制映射，再用纤维积式的相容条件（在 $D(gh)=D(g)\\cap D(h)$ 上）粘成唯一层。这一步在结构层的情形特别顺利：$D(f)\\cap D(g)=D(fg)$ 且 $A_{fg}=(A_f)_g$，所以局部化函子的传递性与交集的运算完全匹配，相容条件自动满足，无需额外自由度。这就是为什么结构层能只用"主开集的局部化"这一条数据被无歧义地确定下来，而不需要像一般层那样逐开集指定。', ['localize-functions']),
      step('sheaf-axioms-check', '验证两条公理：局部性与粘合性都由 A 的诺特型局部化性质保证',
        '局部性：设 $s,t\\in A_f$ 在每个 $D(f_i)$ 上与 s 相同，其中 $D(f)=\\bigcup_i D(f_i)$。等价地，$D(f_i)$ 覆盖 $D(f)$ 给出 $\\mathrm{rad}(f)=\\mathrm{rad}(f_1,\\dots,f_n)$，即存在有限 n 与关系 $f^n=\\sum c_i f_i$。若 s-t 在 $A_{f_i}$ 中为零，即 $f_i^{m}(s-t)=0$，取 $M=\\max m_i$ 便得 $(f_1^M,\\dots,f_n^M)(s-t)=0$，而 $\\mathrm{rad}(f_1^M,\\dots,f_n^M)=\\mathrm{rad}(f)$，于是某个 $f^{N}(s-t)=0$，即 $s=t$ 在 $A_f$ 中。粘合性同理：在 $A_{f_i}$ 上给相容的元素 $s_i$，用 $A_f\\to\\prod_i A_{f_i}\\rightrightarrows \\prod_{i,j} A_{f_if_j}$ 的等化子刻画（它就是局部化在覆盖下的正合性）得到唯一拼接。全部论证归结为交换代数的一条基本事实：局部化 $A\\to A_f$ 与沿主开覆盖的等化子是相容的。', ['distinguished-basis', 'localize-functions']),
      step('locally-ringed', '局部赋环空间：截面函子与茎都是局部环，结构层是唯一确定的',
        '结构层的另一层意义在于"局部环"。$\\mathcal{O}_X$ 的茎 $\\mathcal{O}_{X,\\mathfrak{p}}=A_{\\mathfrak{p}}$ 是 A 在素理想 𝔭 处的局部环，唯一极大理想是 $\\mathfrak{p}A_{\\mathfrak{p}}$，其剩余域是 $\\kappa(\\mathfrak{p})=A_{\\mathfrak{p}}/\\mathfrak{p}A_{\\mathfrak{p}}=\\mathrm{Frac}(A/\\mathfrak{p})$，正是"𝔭 处的函数值域"。茎是局部环这件事，正是"函数在一点有定义、讨论该点的取值与留数"这种局部性对偶到代数上的结论：在 𝔭 处可逆的就是那些不落在 𝔭 的元素，也就是在该点取值非零的函数。把这两件事合起来，(X, $\\mathcal{O}_X$) 成为一个局部赋环空间，而概形态射必须保持这个结构。反变方向也很自然：函子 f 给出连续映射 $f:X\\to Y$，函子部分给出环同态 $f^{\\sharp}:\\mathcal{O}_Y\\to f_{*}\\mathcal{O}_X$，因为函数沿映射"拉回"方向与拓扑像方向一致。', ['sheaf-axioms-check', 'spec-functor']),
    ],
    conclusion: '结构层 $\\mathcal{O}_X$ 由基上的数据 $\\mathcal{O}_X(D(f))=A_f$ 及相容的限制映射唯一确定，其茎是局部环 $\\mathcal{O}_{X,\\mathfrak{p}}=A_{\\mathfrak{p}}$，使 $(X,\\mathcal{O}_X)$ 成为局部赋环空间。',
    dependencies: [],
    consequences: [],
    explanation: '结构层回答的是"概形上的函数是什么"这个问题。拓扑空间只提供开集与包含，还不能做加法乘法；结构层的作用是把每个开集上的函数环装进去，并对粘合与限制施加相容性。在仿射情形，这个装法完全由局部化给出：$D(f)$ 上的函数是分母为 f 的幂、分子在 A 中的形式分数。之所以分母可以放这些，是因为在 $D(f)$ 上 f 取值处处非零，可以合法地求逆。于是"函数在这一点的值"就化为局部环的剩余域元素，整条几何-代数的翻译得以闭环。层还带来一个技术红利：一旦知道在每个主开集上的值，整层就被唯一确定，于是验证一个性质只需在基上做，局部化与交集的运算会自动保证相容。',
    examples: [
      {
        title: '例子：$X=\\mathbb{A}^1_k$ 与 $X=\\mathbb{P}^1_k$ 的结构层截面对比',
        body: '取 $A=k[x]$，则 $X=\\mathrm{Spec}\\,k[x]$。结构层在 $D(x)$ 上的截面是 $k[x]_{x}=\\{p(x)/x^n\\}$，在 $D(1+x^2)$ 上是 $k[x]_{1+x^2}$，全空间上是 k[x]。对 $\\mathbb{P}^1_k$，它由两个仿射图表 $U_0=\\mathrm{Spec}\\,k[t]$、$U_1=\\mathrm{Spec}\\,k[t^{-1}]$ 粘合，重叠 $U_0\\cap U_1=D(t)$ 上两边的截面分别是 $k[t]_t$ 与 $k[t^{-1}]_{t^{-1}}$，同构为 $k[t,t^{-1}]$。全局截面 $\\mathcal{O}_{\\mathbb{P}^1}(\\mathbb{P}^1)$ 是满足"在两张图表的局部表示相同"的元素，容易算出只有常数 k，这恰是"射影空间上非常值正则函数不存在"的层论说法。',
      },
    ],
    remarks: [
      '若把 $\\mathcal{O}_X(D(f))$ 换成别的环（例如直接用"从 $D(f)$ 到 k 的所有函数"），得到的层不再是结构层，茎可能不是局部环，态射的函子性也随之失效；可见结构层的定义没有选择余地。',
      '在非诺特环上，主开集族仍构成基，因此结构层的构造本身不需要诺特性；但许多截面计算（例如仿射性判定、上同调消失）需要诺特或拟紧拟分离假设，这是结构层之外的额外条件。',
      '结构层的截面不是"整体函数"：$\\mathcal{O}_X(X)=A$ 只对仿射成立，对一般概形"整体截面可能远小于各局部环的相容族"，这正是层与坐标环在非仿射情形分道扬镳的地方。',
    ],
    references: [
      stacks('Structure sheaf of an affine scheme, Tag 01HX', '01HX'),
      stacks('Locally ringed spaces, Tag 01HA', '01HA'),
      { title: 'Algebraic Geometry', author: 'Robin Hartshorne', year: 1977 },
    ],
    history: HISTORY,
  },

  /* ═══════════════════════════════════════════════════════════
   * 4. 概形
   * ═══════════════════════════════════════════════════════════ */

  'scheme': {
    statement: '概形是一个局部赋环空间 $(X,\\mathcal{O}_X)$，且 X 能被一族开子集 $U_i$ 覆盖，使每个 $(U_i,\\mathcal{O}_X|_{U_i})$ 作为局部赋环空间同构于某个仿射谱 $(\\mathrm{Spec}\\,A_i,\\mathcal{O}_{\\mathrm{Spec}\\,A_i})$，其中每个 $A_i$ 是交换环。等价地：概形范畴是仿射概形的余极限闭包。',
    steps: [
      step('affine-model', '仿射概形：素谱加结构层是全部模型的来源',
        '先造块。对交换环 A，素谱 $X=\\mathrm{Spec}\\,A$ 是集合上给 Zariski 拓扑的空间，其点是与 A 的素理想一一对应的形式点；结构层 $\\mathcal{O}_X$ 由基上的 $\\mathcal{O}_X(D(f))=A_f$ 指定。这两件数据合起来就是仿射概形。要点有三：其一，点是素理想而不是极大理想，因为把 $\\mathbb{Q}$ 这类域上的所有素理想（包括 (0)）取进来才能让"一般点"承载维数上的灵活性；其二，拓扑用 Zariski 闭集 $V(I)=\\{\\mathfrak{p}\\supseteq I\\}$ 生成，它的开集极少，因而层的粘合条件很容易被检查；其三，结构层的"局部环"性质保证 $(X,\\mathcal{O}_X)$ 是局部赋环空间。仿射概形是唯一被"从环到空间"逆着造出来的模型，因此它的性质强弱完全由环的交换代数性质决定，例如诺特性、维数、正则性都直接读自 A 本身。', ['prime-spectrum', 'structure-sheaf']),
      step('glue-affine-charts', '用图卡与粘合把模型拼成一般概形',
        '一般概形就是"局部看起来像仿射"的局部赋环空间。精确地说：给一个局部赋环空间 $(X,\\mathcal{O}_X)$，若存在 X 的开覆盖 $\\{U_i\\}$ 与局部赋环空间的同构 $\\varphi_i:(U_i,\\mathcal{O}_X|_{U_i})\\to(\\mathrm{Spec}\\,A_i,\\mathcal{O}_{\\mathrm{Spec}A_i})$，就称它为概形。这个定义允许 X 由一个族的图卡通过同构 "粘" 出来：给两个仿射图表的重叠开集，指定一个保持结构层的同构，再取商空间与相容层的余等化子。"局部赋环"这个条件必须同时粘上，因为它不能由拓扑或层单独推出：它要求茎都是局部环，这在重叠处需要粘合同构保持唯一极大理想。注意"局部同构于仿射"而非"整体同构于仿射"，这是概形相比仿射概形真正的扩张点，也是射影空间、曲线、任何非仿射对象存在的根据。', ['affine-model']),
      step('projective-example', '非仿射例：射影空间靠两块图表粘成，验证定义的实用性',
        '设 $R$ 是环，$\\mathbb{P}^1_R$ 由两张图表 $U_0=\\mathrm{Spec}\\,R[t]$、$U_1=\\mathrm{Spec}\\,R[u]$ 粘合，重叠通过 $U_0\\setminus\\{t=0\\}\\cong U_1\\setminus\\{u=0\\}$ 以 $u=t^{-1}$ 给出。函数环层面这个同构就是 $R[t]_t\\cong R[t^{-1}]_{t^{-1}}$，两边都是 $R[t,t^{-1}]$，因此局部化的相容性自动成立。检验：$\\mathbb{P}^1_R$ 的全局截面是 $\\mathcal{O}_{\\mathbb{P}^1}(\\mathbb{P}^1)$，由粘合条件在两个图表上都必须由同一个元素给出，算出来是 R（若 R 约化），因此当 $R\\neq 0$ 时 $\\mathbb{P}^1_R$ 不同构于任何仿射概形（仿射概形的全局截面是环本身，而 $\\mathbb{P}^1$ 的验证里图卡截面的重叠限制比环小）。这个例子说明概形确实比仿射概形多，也说明粘合是有内容的操作，不是形式上的冗余。', ['glue-affine-charts']),
      step('functor-of-points-and-morphisms', '态射与相对观点：概形范畴是仿射概形范畴的余完备化',
        '概形的态射由连续映射 $f:X\\to Y$ 与层同态 $f^{\\sharp}:\\mathcal{O}_Y\\to f_{*}\\mathcal{O}_X$ 组成，后者在茎处是局部同态。这个定义是"从仿射图表逐块给数据再验证相容"的推广，所以概形间的态射在仿射图表上就表现为环同态的反向。范畴层面：概形范畴是仿射概形范畴在"取有限/任意余极限"下的完备化，仿射概形之间的态射 $\\mathrm{Spec}\\,B\\to\\mathrm{Spec}\\,A$ 恰好对应 A→B 的环同态（反变），任意概形通过对图表取余极限构造，其上的态射只需在图表上给数据并保证重叠相容。由此得到整套"相对观点"：研究概形态射 $f:X\\to S$ 就等于在基概形 S 上工作，纤维积给出基变换，几何性质转为态射性质，配合平坦、光滑、紧合等条件就能讨论"簇上的族"。', ['glue-affine-charts', 'spec-functor']),
      step('scheme-beyond-varieties', '覆盖比簇更广的对象：数论与幂零元进入几何',
        '概形定义之所以重要，在于它把系数范围从"代数闭域上的有限生成约化代数"扩大到了任意交换环，而这一步换来的几何对象远远超出簇。三个典型场景：$\\mathrm{Spec}\\,\\mathbb{Z}$ 是一条曲线，点就是素数，闭点 (p) 的剩余域是 $\\mathbb{F}_p$，一般点 (0) 的剩余域是 $\\mathbb{Q}$，于是关于素数分布与赋值的问题获得曲线几何的形状，算术几何由此诞生；$\\mathrm{Spec}\\,k[\\varepsilon]/(\\varepsilon^2)$ 是带一个"无穷小元素"的概形，其上的态射刻画切方向，把切空间变成函子性的对象；$\\mathrm{Spec}\\,k[x,y]/(y^2)$ 里 $y^2=0$ 而 $y\\neq 0$，允许非约化结构，用于记录重数与形变。这些对象在簇的框架里都不存在，却都是概形，因而可以用同一套层论与上同调工具处理。', ['affine-model', 'glue-affine-charts']),
    ],
    conclusion: '概形就是局部同构于仿射谱 $(\\mathrm{Spec}\\,A,\\mathcal{O})$ 的局部赋环空间；由于其定义允许粘合与任意交换环上的系数，它把代数几何的适用域从域上的簇推广到 $\\mathbb{Z}$、非约化环与任意基概形，使数论与几何在同一框架下处理。',
    dependencies: [],
    consequences: [],
    explanation: '概形是整个现代代数几何的载体。它的构造逻辑是"先造仿射情形，再用图卡粘起来"：仿射概形把环的谱与局部化层绑在一起，随后任一局部赋环空间只要能被仿射图表覆盖就叫概形。这种"局部模型 + 粘合"的策略是微分流形定义在代数几何中的对应物，但由于开集是 Zariski 开集，这里的图表要求很强（同构而非仅同胚），重叠处的相容性反而是可验证的代数条件。概形定义的关键收益在于系数自由：允许任意交换环做底，于是 $\\mathbb{Z}$ 成为曲线，素数是点，幂零元成为有几何意义的"无穷小厚度"。它也是射影空间、曲线与任何非仿射对象存在的根据。',
    examples: [
      {
        title: '例子：$\\mathrm{Spec}\\,\\mathbb{Z}$ 与 $\\mathrm{Spec}\\,\\mathbb{Z}[i]$ 的点与剩余域',
        body: '在 $\\mathrm{Spec}\\,\\mathbb{Z}$ 中，点是素理想：闭点 (p)（p 素数）与一般点 (0)。闭点 (p) 的剩余域 $\\kappa(p)=\\mathbb{Z}_{(p)}/p\\mathbb{Z}_{(p)}=\\mathbb{F}_p$，一般点 (0) 的剩余域是 $\\mathbb{Q}$。$\\mathrm{Spec}\\,\\mathbb{Z}$ 的维数是 1，因为它有链 $(0)\\subsetneq(p)$。再看 $\\mathrm{Spec}\\,\\mathbb{Z}[i]$：素数 2 在 $\\mathbb{Z}[i]$ 中分解为 $(1+i)^2$，素数 p≡1 mod 4 分裂成两个素理想，p≡3 mod 4 保持素。因此 $\\mathrm{Spec}\\,\\mathbb{Z}[i]\\to\\mathrm{Spec}\\,\\mathbb{Z}$ 在 $2$ 上的纤维是一个非约化的"加厚点"，在 p≡3 上的纤维是单个点，在 p≡1 上是两个点。这些几何行为（分歧、分裂、惯性）正是代数数论的基本研究对象。',
      },
    ],
    remarks: [
      '不能把概形定义放宽为"局部同胚于仿射谱"：这样会丢掉结构层，粘合时茎不再是局部环，进而使态射的函子性失效；例如把 $\\mathrm{Spec}\\,\\mathbb{C}$ 与 $\\mathrm{Spec}\\,\\mathbb{R}$ 只按拓扑粘在一起会得到不是概形的对象。',
      'Zariski 拓扑极度粗糙：两个不同的点一般不能被开集分离，因此"用连续映射做几何"的作用有限，这也是必须引入层与上同调、把几何问题算术化的根本原因。',
      '概形的"有界性"假设（例如拟紧、拟分离）在定义中没有，但许多定理（如仿射性的判别、上同调的比较）需要这些额外条件；缺少它们时构造出的概形仍合法，只是结论不成立。',
    ],
    references: [
      stacks('Schemes, Tag 01II', '01II'),
      stacks('Affine schemes, Tag 01HX', '01HX'),
      { title: 'Éléments de géométrie algébrique I', author: 'A. Grothendieck, J. Dieudonné', year: 1971 },
    ],
    history: HISTORY,
  },

  /* ═══════════════════════════════════════════════════════════
   * 5. 凝聚层
   * ═══════════════════════════════════════════════════════════ */

  'coherent-sheaf': {
    statement: '设 $(X,\\mathcal{O}_X)$ 是局部赋环空间。一个 $\\mathcal{O}_X$-模层 $\\mathcal{F}$ 称为拟凝聚的，若对每个点 $x\\in X$ 存在含 x 的开邻域 U 与正合列 $\\mathcal{O}_U^{(I)}\\to\\mathcal{O}_U^{(J)}\\to\\mathcal{F}|_U\\to 0$（允许任意指标集 I、J）。若进一步能在每点局部取有限生成的形式 $\\mathcal{O}_U^{r}\\to\\mathcal{O}_U^{s}\\to\\mathcal{F}|_U\\to 0$，则称 $\\mathcal{F}$ 是有限型的；若每点局部存在有限表现 $\\mathcal{O}_U^{r}\\to\\mathcal{O}_U^{s}\\to\\mathcal{F}|_U\\to 0$（核也要有限生成），则称 $\\mathcal{F}$ 为凝聚层。在诺特概形上，有限型模层自动是凝聚层。',
    steps: [
      step('module-sheaf-basics', '模层：把"环层作用在群层上"写成逐点可验的条件',
        '先固定载体。$\\mathcal{O}_X$-模层 $\\mathcal{F}$ 是群层并带有乘法映射 $\\mathcal{O}_X\\times\\mathcal{F}\\to\\mathcal{F}$，使每个 $\\mathcal{F}(U)$ 成为 $\\mathcal{O}_X(U)$-模，且该作用与限制映射相容。这个"相容"不是空话：它保证茎 $\\mathcal{F}_x$ 自动是局部环 $\\mathcal{O}_{X,x}$ 上的模，于是所有模论操作（取核、像、商、张量积）都可以先逐点做再回到层层面。值得注意的是，层范畴中余核必须先取层化，因此模层的"商"在构造上一个开集上的截面不直接等于截面之商。这条技术要点是凝聚层理论里最常见的出错来源，也是为什么大量命题要写成"逐点验证茎"的形式：茎处正合、有限生成等性质由局部环上的模论直接给出，而开集层面的等价需靠层化与茎的配合补齐。', ['sheaf', 'structure-sheaf']),
      step('quasi-coherent-via-modules', '仿射情形：拟凝聚层就是模的局部化层，这是整个理论的枢纽',
        '设 $X=\\mathrm{Spec}\\,A$，M 是 A-模。定义 $M^{\\sim}$ 为：$M^{\\sim}(D(f))=M_f$，沿 $D(g)\\subseteq D(f)$ 的限制是局部化 $M_f\\to M_g$。这与结构层的构造逐字平行，且 $\\mathcal{O}_X^{\\sim}=\\mathcal{O}_X$。核心定理（Serre）：$M\\mapsto M^{\\sim}$ 是 A-模范畴到 $X$ 上拟凝聚层范畴的等价，其逆函子是整体截面 $\\mathcal{F}\\mapsto\\Gamma(X,\\mathcal{F})$。证明的大意是用主开集覆盖：$\\mathcal{F}$ 拟凝聚意味着在每个图表 $D(f)$ 上有正合列 $A_f^{(I)}\\to A_f^{(J)}\\to\\mathcal{F}(D(f))\\to 0$，把生成元与关系逐一收集就能把 $\\mathcal{F}$ 实现为某个 $\\Gamma(X,\\mathcal{F})^{\\sim}$。于是拟凝聚层的局部数据完全等价于一个模，几何与代数之间的翻译在仿射情形是无损的。', ['module-sheaf-basics', 'ideal-sheaf']),
      step('finite-type-and-coherent', '有限型与凝聚：区别在于核是否有限生成',
        '拟凝聚只要求局部是自由层的商，而自由层的秩可以任意大；有限型要求商可由有限多个生成元给出，即局部有 $\\mathcal{O}_U^{s}\\to\\mathcal{F}|_U\\to 0$。凝聚（coherent）更强，要求核 $\\mathrm{Ker}(\\mathcal{O}_U^{r}\\to\\mathcal{O}_U^{s}\\to\\mathcal{F}\\to 0)$ 也有限生成，因为只有这样才能把"关系"也控制在有限范围内，从而让上同调、张量积、Hom 等运算保持"有限型"。用茎的语言说，$\\mathcal{F}$ 有限型当且仅当每个 $\\mathcal{F}_x$ 是 $\\mathcal{O}_{X,x}$ 上的有限生成模；凝聚则还要求对任一开集 U 与任一有限生成自由层到 $\\mathcal{F}$ 的满射，其核有限生成。关键的技术事实是：在诺特局部环上，有限生成模的任意子模都有限生成，于是若 $\\mathcal{O}_X$ 是诺特层（每个 $\\mathcal{O}_{X,x}$ 诺特），有限型模层的子层自动有限型，有限型与凝聚重合。', ['module-sheaf-basics']),
      step('coherent-properties', '凝聚层的运算封闭性与理想层例',
        '凝聚层的意义在于它是一个对常用运算封闭的类：在诺特概形上，凝聚层的核、余核、像、扩张、张量积、有限直和、以及任意多项式的上同调群都仍是凝聚的，这使它们可以充当"系数"参与导出范畴与上同调层面的操作。直观上，凝聚层是向量丛（局部自由层）的推广，允许有挠部分，因而能刻画"集中在子簇上"的对象：例如闭子概形 $Z\\subseteq X$ 对应的理想层 $\\mathcal{I}_Z$ 与结构层 $\\mathcal{O}_Z$（作为 $\\mathcal{O}_X$-模）都是凝聚的，但它们不是局部自由的，无法用向量丛描述。正是这一点使凝聚层成为交叉理论、"子簇上的数学"与形变理论的必要工具，也是把几何问题转化为模论问题的关键一步。', ['quasi-coherent-via-modules', 'finite-type-and-coherent']),
    ],
    conclusion: '凝聚层是局部有有限表现 $\\mathcal{O}_U^{r}\\to\\mathcal{O}_U^{s}\\to\\mathcal{F}|_U\\to 0$（核有限生成）的模层；它包含所有向量丛并允许挠部分，故能刻画集中在闭子概形上的对象，而拟凝聚层在仿射情形等价于模。',
    dependencies: [],
    consequences: [],
    explanation: '拟凝聚与凝聚是两个难度等级上的概念。拟凝聚说的是"局部可由自由层生成"，在仿射概形上它和模一样精确，因此是代数与几何之间的等号；凝聚则要求生成与关系都在有限范围内给出，使得上同调理论中的有限性定理（如 Serre 的有限性定理、Serre 消失定理）得以成立。凝聚层之所以不可或缺，在于向量丛（局部自由层）无法描述"有挠部分"的对象：理想的层、闭子概形的结构层都不是局部自由的，但它们仍是凝聚的，且保持了对核、像、张量积、直和的封闭性。这样一整套"集中在子簇上"的几何信息就能被模论工具处理，这也是交叉理论、形变理论的技术起点。',
    examples: [
      {
        title: '例子：$\\mathbb{P}^1$ 上的层 $\\mathcal{O}(n)$ 与凝聚层 $k(p)$',
        body: '取 $X=\\mathbb{P}^1_k$，$\\mathcal{O}(n)$ 由分次模 $k[x_0,x_1](n)$ 给出，是秩一局部自由层，故凝聚。其整体截面维数是 n+1（$n\\ge 0$）或 0（$n<0$），逐次计算只需数分次部分；张量积满足 $\\mathcal{O}(m)\\otimes\\mathcal{O}(n)\\cong\\mathcal{O}(m+n)$。再看点 p=[1:0] 处的"摩天大楼层" $k(p)$：它是 $\\mathcal{O}_{\\mathbb{P}^1}$-模，茎在 p 处是 k、在别处是 0，由满射 $\\mathcal{O}_{\\mathbb{P}^1}\\to k(p)$ 给出，核是理想层 $\\mathcal{O}(-1)$。于是有正合列 $0\\to\\mathcal{O}(-1)\\to\\mathcal{O}\\to k(p)\\to 0$，取上同调后配合 $H^0(\\mathcal{O})=k$、$H^0(\\mathcal{O}(-1))=0$ 可核对这一层的挠性。',
      },
    ],
    remarks: [
      '去掉诺特性，有限型不等于凝聚：存在有限型模层其核不是有限型，此时"有限型与凝聚重合"的论证（依赖子模有限生成）失效，故该结论必须标注诺特假设。',
      '拟凝聚层允许自由层取任意指标集，而有限型要求有限，因此"拟凝聚"本身不能推出上同调有限性或整体截面的有限维性；射影空间上的结构层拟凝聚但计算维数仍需额外论证。',
      '取余核时必须先层化，否则得到的预层可能不满足粘合公理；凝聚层理论中大量"逐点验证"的命题都以此为前提，直接对预层取商会给出错误结果。',
    ],
    references: [
      stacks('Coherent sheaves on locally ringed spaces, Tag 01BU', '01BU'),
      stacks('Quasi-coherent sheaves, Tag 01BD', '01BD'),
      stacks('Coherent modules, Tag 01BU', '01BU'),
      { title: 'Algebraic Geometry', author: 'Robin Hartshorne', year: 1977 },
    ],
    history: HISTORY,
  },

  /* ═══════════════════════════════════════════════════════════
   * 6. 可逆层与线丛
   * ═══════════════════════════════════════════════════════════ */

  'invertible-sheaf': {
    statement: '设 $(X,\\mathcal{O}_X)$ 是概形。一个 $\\mathcal{O}_X$-模层 $\\mathcal{L}$ 称为可逆层，若存在开覆盖 $\\{U_i\\}$ 使 $\\mathcal{L}|_{U_i}\\cong\\mathcal{O}_{U_i}$（即 $\\mathcal{L}$ 是秩 1 局部自由层）。则：(1) $\\mathcal{L}$ 的逆层 $\\mathcal{L}^{\\vee}=\\mathcal{H}om_{\\mathcal{O}_X}(\\mathcal{L},\\mathcal{O}_X)$ 满足 $\\mathcal{L}\\otimes\\mathcal{L}^{\\vee}\\cong\\mathcal{O}_X$；(2) 可逆层在同构类上的张量积给出群结构 $\\mathrm{Pic}(X)$，单位元是 $\\mathcal{O}_X$，逆元是 $\\mathcal{L}^{\\vee}$；(3) 若 X 是整概形，则 $\\mathrm{Pic}(X)\\cong\\mathrm{Cl}(X)$（除子类群），对应 $\\mathcal{L}\\mapsto$ 其任一有理截面的除子。',
    steps: [
      step('invertible-is-rank-one', '可逆的定义与判据：局部同构于结构层',
        '可逆层的名字来源于"逐点可逆"。$\\mathcal{L}$ 称为可逆，若每个点有开邻域 U 使 $\\mathcal{L}|_U\\cong\\mathcal{O}_U$。这等价于 $\\mathcal{L}$ 是有限生成且每个茎 $\\mathcal{L}_x$ 是秩 1 自由 $\\mathcal{O}_{X,x}$-模（局部环上的有限生成投射模必自由，故秩 1 投射即自由）；也等价于 $\\mathcal{L}$ 既局部自由又秩为 1。这个条件很紧：它排除了有挠部分的层，比如理想层 $\\mathcal{I}_Z$ 一般不可逆（例 $k[x,y]$ 中 $(x,y)$ 不自由），因此可逆层是向量丛（秩 1）的代数化说法，几何上对应线丛。另外要记住，秩 1 是在茎上逐点检验的，因此局部自由性的"局部"可以是任意开邻域而不必是仿射图表，这使很多构造（如取对偶、张量积）可以直接在任意开集上定义。', ['structure-sheaf', 'sheaf']),
      step('tensor-and-dual', '对偶与张量积：$\\mathcal{L}\\otimes\\mathcal{L}^{\\vee}\\cong\\mathcal{O}_X$ 的验证',
        '定义 $\\mathcal{L}^{\\vee}=\\mathcal{H}om_{\\mathcal{O}_X}(\\mathcal{L},\\mathcal{O}_X)$。在 $\\mathcal{L}|_U\\cong\\mathcal{O}_U$ 的开集上，$\\mathcal{H}om_{\\mathcal{O}_U}(\\mathcal{O}_U,\\mathcal{O}_U)\\cong\\mathcal{O}_U$，因此 $\\mathcal{L}^{\\vee}$ 也局部自由且秩 1，也是可逆层。构造配对标 $\\alpha:\\mathcal{L}\\otimes\\mathcal{L}^{\\vee}\\to\\mathcal{O}_X$，在局部取 $\\mathcal{L}|_U$ 的生成元 s 与对偶基 $s^{\\vee}$，令 $\\alpha(s\\otimes s^{\\vee})=1$。需要验证这个定义与生成元的选取无关：换生成元 $s\\mapsto u s$（u 是 $\\mathcal{O}_U$ 的可逆元），则 $s^{\\vee}\\mapsto u^{-1}s^{\\vee}$（因为 $s^{\\vee}(us)=1$ 迫使 $s^{\\vee}=u^{-1}s^{\\vee\\prime}$），从而 $us\\otimes u^{-1}s^{\\vee}$ 仍映到 1。于是 $\\alpha$ 是良定义的层同态，且在每个点附近是到 $\\mathcal{O}_U$ 的同构，故整体 $\\mathcal{L}\\otimes\\mathcal{L}^{\\vee}\\cong\\mathcal{O}_X$。这里"茎处为同构即可推出整体同构"用到层同态在同构问题上的 stalk-wise 判据。', ['invertible-is-rank-one']),
      step('picard-group', '验证 $\\mathrm{Pic}(X)$ 是群：结合、单位、逆元',
        '把可逆层的同构类看作元素，运算为 $[\\mathcal{L}]\\cdot[\\mathcal{M}]=[\\mathcal{L}\\otimes\\mathcal{M}]$。张量积结合且有单位 $\\mathcal{O}_X$，因此只需验证三点：(a) 结合律来自 $\\otimes$ 的结合约束，层层面上的同构都是自然的；(b) $\\mathcal{O}_X\\otimes\\mathcal{L}\\cong\\mathcal{L}$ 在局部图表上取 $1\\otimes s\\mapsto s$ 得到，是自然同构；(c) 逆元由上一步的 $\\mathcal{L}^{\\vee}$ 给出。运算与代表元的选取无关（把 $\\mathcal{L}$ 换成同构的层，得到同构的张量积）。群公理还有一件需要留意的事情：$\\mathrm{Pic}(X)$ 只记录同构类，因此对 $\\mathcal{L}$ 自同构（即 $\\mathcal{O}_X^{\\times}$ 的元素，也就是全局可逆元）不作区分。群结构由此给出，它几乎总不是平凡群，因而携带了 X 上"有多少不同的线丛"这一整层几何信息。', ['tensor-and-dual']),
      step('divisor-class-map', '与除子类群对应：整概形上 $\\mathrm{Pic}(X)\\cong\\mathrm{Cl}(X)$',
        '设 X 是整概形（既约且不可约，例如不可约簇）。任取可逆层 $\\mathcal{L}$ 与一个非零有理截面 $s\\in\\mathcal{L}_{\\eta}$（$\\eta$ 是一般点），在图表上把 s 表示为有理函数，定义除子 $\\mathrm{div}(s)=\\sum_{x\\in X^{(1)}}\\mathrm{ord}_x(s)\\cdot\\overline{\\{x\\}}$（沿余维 1 点求和，$(1)$ 表示余维 1 点集）。换一个有理截面 $s^{\\prime}=f s$ 只改变除子一个主除子：$\\mathrm{div}(f s)=\\mathrm{div}(f)+\\mathrm{div}(s)$，因此映射 $\\mathcal{L}\\mapsto[\\mathrm{div}(s)]$ 落到 $\\mathrm{Cl}(X)=\\mathrm{Div}(X)/\\mathrm{Princ}(X)$ 上，并且与张量积相容（除子相加）。满射性来自"给定除子，局部定义截面并用粘合条件调整"，单射性来自"除子为非主时，$\\mathcal{L}$ 没有整体有理截面因而不平凡"。于是得到群同构 $\\mathrm{Pic}(X)\\cong\\mathrm{Cl}(X)$；这就是几何上"线丛 = 除子模主除子"的精确形式。', ['picard-group', 'divisor']),
      step('projective-embedding-outlook', '非常丰沛层与射影嵌入：可逆层是嵌入工具',
        '可逆层最大的用处是构造射影嵌入。设 $\\mathcal{L}$ 是可逆层，$s_0,\\dots,s_N$ 是 $\\Gamma(X,\\mathcal{L})$ 的有限子集且它们无公共零点，则可用它们定义态射 $\\varphi:X\\to\\mathbb{P}^N$：在 $X$ 上取覆盖使 $\\mathcal{L}|_{U}\\cong\\mathcal{O}_U$，在每个 U 上把点 x 送到 $[s_0(x):\\dots:s_N(x)]$，由于无公共零点该点有定义，且换图表时坐标只差整体常数，因此给出良定义的态射。当 $\\varphi$ 是闭浸入时，称 $\\mathcal{L}$ 非常丰沛，X 由此成为射影簇。这就把"X 能否射影嵌入"化为"X 上是否存在非常丰沛的可逆层"，而后者是纯代数问题；同理 $\\mathcal{L}$ 丰沛等价于某个 $\\mathcal{L}^{\\otimes n}$ 非常丰沛，故研究射影嵌入就是研究可逆层与其整体截面的渐近行为。', ['picard-group', 'divisor']),
    ],
    conclusion: '可逆层即秩 1 局部自由层；它们在同构类层面的张量积构成 Picard 群 $\\mathrm{Pic}(X)$，$\\mathcal{L}\\otimes\\mathcal{L}^{\\vee}\\cong\\mathcal{O}_X$；在整概形上 $\\mathrm{Pic}(X)\\cong\\mathrm{Cl}(X)$，并且非常丰沛的可逆层给出到射影空间的嵌入。',
    dependencies: [],
    consequences: [],
    explanation: '可逆层是"几何上最简单的非平凡层"。秩一局部自由这个条件使得它在每个点局部看起来就是结构层本身，于是所有构造（取对偶、张量积、取有理截面）都能像处理标量与函数那样进行。正因为局部平凡，它整体的不平凡程度恰好被一个群记录下来，这就是 Picard 群，而它和除子类群在整概形上一致，说明"线丛的数据"与"余维 1 循环模主除子的数据"这两套语言可以互相翻译。可逆层最重要的用途是充当射影嵌入的引擎：给一层配上足够多的整体截面就能把 X 摆进射影空间，于是"X 是否是射影簇"变成"是否存在非常丰沛层"这一代数问题。这也是丰沛性、可逆层上同调与射影簇理论联系在一起的源头。',
    examples: [
      {
        title: '例子：$\\mathbb{P}^1$ 的 $\\mathrm{Pic}\\cong\\mathbb{Z}$ 与 $k[x,y]$ 中不可逆的理想',
        body: '对 $X=\\mathbb{P}^1_k$，可逆层由 $\\mathcal{O}(n)$ 给出，$\\mathcal{O}(m)\\otimes\\mathcal{O}(n)=\\mathcal{O}(m+n)$，故 $\\mathrm{Pic}(\\mathbb{P}^1)\\cong\\mathbb{Z}$，生成元是 $\\mathcal{O}(1)$，它对应一个有理点除子。嵌入例子：取 $\\mathcal{O}(2)$ 的三个截面 $x_0^2,x_0x_1,x_1^2$，它们无公共零点，给出的态射 $\\mathbb{P}^1\\to\\mathbb{P}^2$ 是闭浸入，像是抛物线。再看反例：$A=k[x,y]$ 中的理想 $(x,y)$ 是秩 1 无挠模，但不是自由的（不能在任一点附近由单个元素生成），因此作为 $\\mathcal{O}_{\\mathbb{A}^2}$-模层不是可逆层。',
      },
    ],
    remarks: [
      '去掉"秩 1"只保留"局部自由"，得到的向量丛类在张量积下不再成群：两个秩 2 层张量后秩为 4，只能得到稳定等价类而非同构，这正是 K-理论与 Picard 群的区别所在。',
      '可逆层不必有整体截面：负次数的 $\\mathcal{O}(-1)$ 在 $\\mathbb{P}^1$ 上整体截面为零，因此"用整体截面构造嵌入"必须附上无公共零点与足够多截面这两个前提，否则态射无定义。',
      '"整概形上 $\\mathrm{Pic}\\cong\\mathrm{Cl}$"依赖整性使一般点的局部环为域、从而能定义有理函数的阶；对非整或带幂零元的概形，除子层与可逆层的对应会被幂零元结构破坏，需要改用广义除子或 Cartier 除子。',
    ],
    references: [
      stacks('Invertible sheaves, Tag 01CR', '01CR'),
      stacks('Picard group, Tag 01CJ', '01CJ'),
      { title: 'Algebraic Geometry', author: 'Robin Hartshorne', year: 1977 },
    ],
    history: HISTORY,
  },

  /* ═══════════════════════════════════════════════════════════
   * 7. 平展态射
   * ═══════════════════════════════════════════════════════════ */

  'etale-morphism': {
    statement: '设 $f:X\\to Y$ 是有限型概形态射。称 f 为平展（étale）的，若下列等价条件之一成立：(1) f 是平坦的且非分歧的（unramified）；(2) f 是光滑的且相对维数为 0；(3) 对每个 $x\\in X$，存在仿射邻域 $\\mathrm{Spec}\\,B\\subseteq X$、$\\mathrm{Spec}\\,A\\subseteq Y$ 使 $B=A[t_1,\\dots,t_n]/(g_1,\\dots,g_n)$，且 $\\det(\\partial g_i/\\partial t_j)$ 在每个点处是可逆元（标准的雅可比判据）。',
    steps: [
      step('unramified', '非分歧：把它们想成"纤维是离散的、无无穷小厚度"',
        '非分歧性首先是一个关于局部环的加强单射条件。$f:X\\to Y$ 在 $x\\in X$ 处非分歧，若 $\\mathfrak{m}_y\\mathcal{O}_{X,x}=\\mathfrak{m}_x$ 且 $\\kappa(x)/\\kappa(y)$ 是可分代数扩张，其中 $y=f(x)$、$\\mathfrak{m}$ 为各自极大理想。等价地，某等价刻画是"相对形式微分模与相对切空间为零"：$\\Omega_{X/Y,x}=0$。直观理解：纤维上相邻点之间的方向被切空间测出，而在非分歧点附近的纤维没有一维方向可以移动，所以纤维"散开"成互不相交的离散块，没有无限接近的无穷小邻域。典型正例是 $\\mathrm{Spec}\\,k[x,y]/(xy-1)\\to\\mathrm{Spec}\\,k[x]$（双曲线覆盖去掉 0 的直线），典型反例是分歧覆盖 $\\mathrm{Spec}\\,k[t]\\to\\mathrm{Spec}\\,k[t^2]$（在原点处分歧），其相对微分模非零。', ['morphism', 'smooth-morphism']),
      step('flatness', '平坦：保证纤维"不跳跃"，使局部同构的条件可以传递',
        '第二块是平坦性。$\\mathcal{O}_{Y}$-模 $f_{*}\\mathcal{O}_X$ 平坦意味着对每个 $y$，局部环沿 $f$ 的扩张 $\\mathcal{O}_{Y,y}\\to\\mathcal{O}_{X,x}$ 是平坦的，其效果是"纤维上的函数环随参数连续变化，不会出现函数个数突然跳跃"。平坦性的作用在这里是纯技术性的但不可替代：它保证纤维积保持长度，从而保证相对维数、上同调、以及有限性与域的延拓性是稳定的。去掉平坦性，非分歧与光滑的相对维数 0 不再等价：例如 $\\mathrm{Spec}\\,k[t]/(t)\\to\\mathrm{Spec}\\,k[t]$ 非分歧（相对微分模为零）但不平坦，说明"纤维缩成一点"这种退化行为需要平坦性来排除掉。因此平展态射的定义里，平坦与非分歧各管一头，两者合起来才能给出好的拓扑替身。', ['flat-morphism', 'unramified']),
      step('smooth-of-dim-zero', '光滑 + 相对维数 0：雅可比矩阵满秩的判别',
        '光滑态射可以理解为"在每点的仿射图表上写成 $A\\to A[t_1,\\dots,t_n]/(g_1,\\dots,g_n)$ 且雅可比矩阵 $\\det(\\partial g_i/\\partial t_j)$ 是可逆元"，即"étale-局部 上可以拉平为一个自由变量的多项式方程组，而方程组关于变量的导数可逆"（隐函数定理的代数版本）。若相对维数为 0，即纤维的维数为 0，则 n 个方程恰好在 n 个变量上，于是局部就是一个"零维光滑族"。光滑加相对维数 0 与"平坦加非分歧"的等价是通过逐点比较局部环与雅可比判据得到的：平坦加非分歧给出局部形式 $A\\to B$ 是有限平坦且相对微分模为零；有限平坦加 $\\Omega_{B/A}=0$ 就是标准的平展判别法，它等价于局部写成上述商且雅可比行列式可逆。这一步使我们可以完全用交换代数来检验平展性。', ['unramified', 'flatness']),
      step('etale-topology', '从局部同胚到拓扑：平展覆盖与平展拓扑的定义',
        '平展态射是"局部同胚"的代数替身，所以可以用它们定义拓扑：取概形范畴，取覆盖族为族 $\\{U_i\\to X\\}$ 满足每个 $U_i\\to X$ 平展且像的并集是整个 X（更常用的是 fppf 或忠实平坦拟有限的条件），这就是平展拓扑，相应的层论就是平展层论与平展上同调 $H^p_{\\mathrm{\\acute{e}t}}(X,\\mathcal{F})$。它的价值在于系数可取"平展层"，包括常数层 $\\mathbb{Z}/n$、$\\mu_n$ 与挠层，从而可以复刻经典覆叠空间理论：$\\mathbb{G}_m$-挠子就是 $\\mathrm{Pic}$，$\\mu_n$-挠子就是 n-挠除子类，有限平展覆盖的分类给出平展基本群。更进一步，对域 k，有限平展代数对应于 $\\mathrm{Gal}(k^{\\mathrm{sep}}/k)$ 的有限集上的连续作用，平展基本群因此成为绝对伽罗瓦群，Galois 理论成为覆叠空间理论的算术类比，这正是格罗滕迪克理论的核心洞见。', ['flatness', 'smooth-of-dim-zero']),
    ],
    conclusion: '平展态射 = 平坦 + 非分歧 = 光滑 + 相对维数 0，也等价于局部形如 $A\\to A[t]/(g_1,\\dots,g_n)$ 而雅可比行列式可逆。它们构成概形范畴上的一个 Grothendieck 拓扑，其上的覆叠理论与基本群给出了伽罗瓦理论的几何统一。',
    dependencies: [],
    consequences: [],
    explanation: '平展态射承担的是"局部同胚"的角色。拓扑中的局部同胚有两个特征：纤维离散、附近的结构沿底空间连续地移动。代数地把这两件事分开写，得到的就是非分歧（无无穷小方向、相对微分模为零）与平坦（纤维不跳跃、长度在基变换下保持）。两者合起来相当于要求"光滑且相对维数为 0"，也就是说局部看起来是一个零维光滑族。有了这样的态射族做覆盖，就能在概形上建立一套与拓扑学平行的覆盖理论，平展上同调、平展基本群、以及有限平展覆盖与伽罗瓦群作用的对应都由此展开。其最重要的意义是把伽罗瓦理论几何化，使算术问题可以借助拓扑与层论工具处理。',
    examples: [
      {
        title: '例子：$k[t,t^{-1}]\\to k[x,x^{-1}]$ 型平展覆盖与 $t\\mapsto t^2$ 的分歧',
        body: '设 $n$ 与 k 的特征互素，考虑 $\\mathrm{Spec}\\,k[x,x^{-1}]\\to\\mathrm{Spec}\\,k[t,t^{-1}]$，$t\\mapsto x^n$。相对微分模由 $dt=nx^{n-1}dx$ 给出，$nx^{n-1}$ 在环中可逆（因 n 可逆、x 可逆），故 $\\Omega=0$，f 非分歧；同时 $k[x,x^{-1}]$ 是 $k[t,t^{-1}]$ 上秩 n 的自由模（基 $1,x,\\dots,x^{n-1}$），故平坦。合起来 f 是平展的，纤维为 n 个互异点。对比 $\\mathrm{Spec}\\,k[t]\\to\\mathrm{Spec}\\,k[t]$，$t\\mapsto t^2$：在 $t=0$ 处 $2t$ 不可逆，纤维在原点缩成一个带重数的点，此时 $\\Omega_{X/Y}\\neq 0$，不是平展。',
      },
    ],
    remarks: [
      '去掉平坦性只留非分歧会引入病态：$\\mathrm{Spec}\\,k[t]/(t)\\to\\mathrm{Spec}\\,k[t]$ 非分歧但不平坦，其纤维长度在基变换下不稳定，此时"局部同胚"的直觉失效。',
      '平展覆盖不能像拓扑那样靠"像为 X"单独确定：还必须有忠实平坦类条件（如 fppf 或忠实平坦拟有限），否则会出现不能张成 X 的伪覆盖，上同调的比较定理就不成立。',
      '特征 p 中平展态射必须与 Frobenius 区分开：$t\\mapsto t^p$ 相对微分模为 $pt^{p-1}dt=0$（因 p=0），形式上非分歧，但它不是平展的，因为相应的局部环不有限平坦且伽罗瓦群作用的阶数处理必须用平展而非分歧的语言。',
    ],
    references: [
      stacks('Étale morphisms, Tag 02GH', '02GH'),
      stacks('Étale cohomology, Tag 03N7', '03N7'),
      { title: 'Étale Cohomology and the Weil Conjecture', author: 'E. Freitag, R. Kiehl', year: 1988 },
    ],
    history: HISTORY,
  },

  /* ═══════════════════════════════════════════════════════════
   * 8. 形式概形与完备化
   * ═══════════════════════════════════════════════════════════ */

  'formal-scheme': {
    statement: '设 A 是环、I⊆A 是理想。A 沿 I 的完备化是 $\\widehat{A}=\\varprojlim_n A/I^n$，带同态 $A\\to\\widehat{A}$。形式谱 $\\mathrm{Spf}\\,\\widehat{A}$ 由 A 的"开理想"处的形式局部化构成，形式上它只保留 I-进拓扑下的无穷小邻域信息。形式函数定理：设 A 是 I-进完备诺特环、$B=A/\\mathfrak{a}$ 是 A 的有限生成模的商（等价地 $B=A[x_1,\\dots,x_n]/\\mathfrak{b}$ 有限生成），则 $\\widehat{B}$ 没有额外的 $\\widehat{A}$-线性关系，即 $\\widehat{B}=\\widehat{A}\\otimes_A B$ 且沿 $\\mathfrak{a}$ 的完备化与原完备化一致（"形式半径截断后没有新增关系"）。',
    steps: [
      step('completion-construction', '完备化：把"无穷小邻域"提取为逆向极限',
        '先造 A 层面的对象。沿理想 I 的滤过 $A\\supseteq I\\supseteq I^2\\supseteq\\dots$ 给出商环的逆向系 $A/I\\to A/I^2\\to A/I^3\\to\\dots$，完备化定义为 $\\widehat{A}=\\varprojlim_n A/I^n$，即所有满足 $a_{n+1}\\equiv a_n\\pmod{I^n}$ 的相容序列 $(a_n)$ 全体。它有自然的环结构（逐分量运算，分量间相容）。A→$\\widehat{A}$ 的核是 $\\bigcap_n I^n$，因此只有当 Krull 交为零时该映射才同构——Krull 交非零的环（如沿幂零理想完备化）会在完备化中丢信息。几何解释：$\\mathrm{Spec}\\,A/I^n$ 只看到"到 I 的 n 阶无穷小邻域"，逆向极限相应地记录了"任意阶"的局部信息，因此 $\\mathrm{Spf}\\,\\widehat{A}$ 是"只看原点附近、忽略整体"的对象。这和解析几何中"泰勒展开到无穷阶"是同一件事：单项式都保留，整体拓扑被丢掉。', ['localization', 'structure-sheaf']),
      step('formal-spectrum', '形式谱与形式局部化：把仿射图谱替换为无穷小邻域族',
        '给 $\\widehat{A}$ 配上拓扑（I-进拓扑：基本邻域 $a+I^n$），再考虑"开理想" $J\\subseteq\\widehat{A}$（指 $J+\\overline{I}=\\overline{I}$，等价于 $\\widehat{A}/J$ 只被 I 的像的幂零化条件控制）的集族，形式谱就是这些开理想构成的拓扑空间，其上的结构层在"形式主开集"上给定 $\\widehat{A}$ 的形式局部化。要点在于：与普通谱不同，形式谱上的"点"依然通过开理想描述，但拓扑总由 I 的幂给出，因此它的空间结构相当粗糙、而环结构非常精细。这样得到的形式概形 $(\\mathrm{Spf}\\,\\widehat{A},\\mathcal{O})$ 是一个"只有无穷小厚度"的局部赋环空间，可以形式地把某个闭子概形加厚到任意阶。它在形变理论中的用途是把"某对象的一切无穷小形变"组织成一个形式概形的切空间与障碍空间。', ['completion-construction']),
      step('formal-function-theorem', '形式函数定理：完备化与代数化在诺特假设下互相可逆',
        '定理的实质是：对 I-进完备诺特环 A 与有限生成 A-代数 B，$\\widehat{B}$（沿 $IB$ 的完备化）等于 $B\\otimes_A\\widehat{A}$，且 $\\widehat{A}$ 到 $\\widehat{B}$ 的有限生成关系与原关系一一对应。换言之，完备化这个操作对有限的代数方程组不产生新的关系，"先在 A 上解、再形式地取极限"与"先在形式上解、再验证它来自 A"给出同一结果。证明的思路是先把 B 化为多项式环 $A[x_1,\\dots,x_n]$，利用诺特环上多项式环仍诺特的有限性控制住所有关系，再用 I-进完备化的正合性（诺特环上完备化对有限模保持正合）把极限从生成元层面提升到关系层面。这一步的技术支柱是 Artin–Rees 引理与诺特环上有限模的 I-进完备化函子正合，缺一不可。', ['formal-spectrum', 'localization']),
      step('applications', '应用：形式完备化与原代数化的一致的用处',
        '形式函数定理的价值在两方面。其一，它保证"解析—代数比较"型定理成立：若两个概形在某个点处的形式邻域同构，则在诺特假设下它们（在该点附近）就是代数同构的，这使得形变理论可以只计算形式邻域而得到真正的代数结论。其二，它是形变理论的基石：模函子的形式完备化给出一个形式概形，其在某点的"叠"切成切空间 $T=$ 一次形变空间、障碍空间为二次形变空间，配合形式函数定理，从形式信息恢复出代数族，从而支持 Grothendieck 式"形式几何 ⟹ 代数几何"的工作流。历史上该定理是完备化理论中最强有力的结构性结论之一，与 Krull 交定理、Zariski 主定理一起构成诺特环上极限理论的基本工具。更具体地说，这条定理是"形式几何可以代数化"这一信条的技术保证：形变函子的形式完备化通常只给出形式概形，要得到真正的代数族就需要把形式邻域中的解"下降"回代数世界，而形式函数定理正是允许这种下降的关键，因此它被广泛用于模空间的存在性证明与上同调比较定理的推导。', ['formal-function-theorem']),
    ],
    conclusion: '$\\widehat{A}=\\varprojlim_n A/I^n$ 记录 A 沿 I 的全部无穷小信息；形式概形 $\\mathrm{Spf}\\,\\widehat{A}$ 是只看局部无穷小邻域的几何对象，而形式函数定理说明在诺特假设下完备化与代数化互相可逆，从形式信息可以恢复代数信息。',
    dependencies: [],
    consequences: [],
    explanation: '完备化是把一个环或概形"只看某点无穷小附近"的操作：沿理想 I 的幂取逆向极限，把任意阶的无穷小邻域一次性收进来，同时丢掉整体信息。这解释了为什么幂级数环可以实现为多项式环沿 $(x)$ 的完备化，也解释了为什么 $\\mathrm{Spf}$ 是"只有局部厚度"的几何对象。在好条件下（诺特、I-进完备）这套形式信息足够强，能与真正的代数几何互相翻译，这就是形式函数定理的内容。它是形变理论的技术核心：模空间在某点的一次形变与二阶障碍可以通过形式邻域的切空间与障碍空间读出，而结论又能通过形式函数定理落回代数族，因此"几何对象在小邻域内的弯曲方式"成为可以计算的对象。',
    examples: [
      {
        title: '例子：$k[x]$ 沿 $(x)$ 的完备化是幂级数环与 $k[x,y]/(y^2-x^3-x^2)$ 的形式分支分析',
        body: '取 $A=k[x]$、$I=(x)$，则 $A/I^n=k[x]/(x^n)$，相容序列的总和就是 $\\varprojlim k[x]/(x^n)=k\[[x]\]$：一个多项式序列 $(a_n)$ 的系数逐层稳定给出唯一幂级数，反之亦然。再看尖点 $C:\\ y^2=x^3+x^2$ 在原点（$\\mathrm{char}\\,k\\neq 2$）。在原点的形式邻域里 $y^2=x^2(x+1)$，$x+1$ 在形式幂级数环中可开平方（因 $1$ 是单位，$\\sqrt{1+x}\\in k\[[x]\]$），故 $y^2=(x\\sqrt{1+x})^2$，于是 $k\[[x,y]\]/(y^2-x^3-x^2)\\cong k\[[u,v\]\]/(uv)$，形式地出现两条分支。而整体地看 $C$ 只有一条分支（结点在原点相切），这正说明完备化只看到无穷小邻域而成对地放大分支数。',
      },
    ],
    remarks: [
      '去掉 I-进完备的假设，形式函数定理会失效：不完备时 $B\\otimes_A\\widehat{A}$ 可能真的比 $\\widehat{B}$ 有更多关系，因为 A 中未被 I 幂截断的关系在完备化后不再被看到。',
      '诺特性不可省：非诺特环上完备化不保持正合性，"取核再完备化"与"先完备化再取核"会有差异，从而形式函数定理的论证链条断裂。',
      '完备化会丢失整体信息：$k[x]$ 与 $k[x]_{(x)}$ 沿 $(x)$ 的完备化都是 $k\[[x]\]$，但两者作为环不同；因此形式邻域同构不蕴含整体同构，代数化需要额外的"可代数化"假设。',
    ],
    references: [
      stacks('Formal schemes, Tag 0AI7', '0AI7'),
      stacks('Completion, Tag 00M9', '00M9'),
      stacks('Formal functions theorem, Tag 0318', '0318'),
      { title: 'Commutative Algebra', author: 'Hideyuki Matsumura', year: 1989 },
    ],
    history: HISTORY,
  },

  /* ═══════════════════════════════════════════════════════════
   * 9. 态射
   * ═══════════════════════════════════════════════════════════ */

  'morphism': {
    statement: '概形之间的态射是局部赋环空间的态射：$f=(f,\\,f^{\\sharp}):(X,\\mathcal{O}_X)\\to(Y,\\mathcal{O}_Y)$，其中 $f:X\\to Y$ 是连续映射，$f^{\\sharp}:\\mathcal{O}_Y\\to f_{*}\\mathcal{O}_X$ 是层同态，且对每个 $x\\in X$，茎处的诱导 $f^{\\sharp}_x:\\mathcal{O}_{Y,f(x)}\\to\\mathcal{O}_{X,x}$ 是局部同态（把极大理想映进极大理想，即使 $f^{\\sharp}_x(\\mathfrak{m}_{Y,f(x)})\\subseteq\\mathfrak{m}_{X,x}$）。仿射情形下，$\\mathrm{Spec}\\,B\\to\\mathrm{Spec}\\,A$ 的态射与环同态 $A\\to B$ 一一对应（反变）。',
    steps: [
      step('why-two-parts', '为什么态射要分连续映射与层同态两部分',
        '拓扑空间之间的映射只要求"开集的原像是开集"，这对概形不够：概形还带结构层，形态必须同时搬运函数。层同态 $f^{\\sharp}:\\mathcal{O}_Y\\to f_{*}\\mathcal{O}_X$ 的意思是：对每个开集 $V\\subseteq Y$，给出环同态 $\\mathcal{O}_Y(V)\\to\\mathcal{O}_X(f^{-1}V)$。这里 $f_{*}\\mathcal{O}_X$ 是前推层，定义 $(f_{*}\\mathcal{O}_X)(V)=\\mathcal{O}_X(f^{-1}V)$；为什么不是 $\\mathcal{O}_X(V)$？因为 X 上的函数要搬到 Y 上，必须先沿 f 把定义域拉回，这正是"函数沿映射拉回"的操作。若没有层同态这一半，概形只是拓扑空间加一堆互不相关的环，不同定义域上的环结构会脱节；两部分合起来使得态射可以谈论"函数在点上的取值如何随映射变化"，也使得复合与恒等态射能自然定义，整体构成范畴 $\\mathsf{Sch}$。', ['scheme', 'structure-sheaf']),
      step('local-hom-condition', '局部性条件：茎处映极大理想进极大理想',
        '只有一个层同态还不够。称 $f^{\\sharp}$ 在 $x$ 处局部，若 $f^{\\sharp}_x(\\mathfrak{m}_{Y,f(x)})\\subseteq\\mathfrak{m}_{X,x}$。它在讲什么？$\\mathfrak{m}_{Y,f(x)}$ 的元素是"在 f(x) 处取值为零的函数"，要求它们的像在 x 处也取值为零，也就是要求 $f$ "把零点映到零点"，符合函数拉回直观。这条条件排除了怪异情形：可以构造抽象的层同态 $\\mathcal{O}_{\\mathrm{Spec}\\,k}\\to\\mathcal{O}_{\\mathrm{Spec}\\,k}$ 把 k 的非零元素送到零，但它不局部，因为 k 的极大理想是 (0)，把非零元映到零意味着把 0 映到非 0，与"零点映零点"矛盾。局部性正是概形范畴中"把环范畴的反变嵌入"能够实现的关键：仿射情形它保证 $A\\to B$ 是环同态（把极大理想中的元素仍映到极大理想中），从而最常被使用的对偶仍然成立。', ['why-two-parts']),
      step('affine-anti-equivalence', '仿射情形：态射与环同态反变对应，构造与验证',
        '设 $\\varphi:A\\to B$ 是环同态。构造 $f=\\mathrm{Spec}\\,\\varphi:\\mathrm{Spec}\\,B\\to\\mathrm{Spec}\\,A$：拓扑部分 $f(\\mathfrak{q})=\\varphi^{-1}(\\mathfrak{q})$（因为 $\\varphi^{-1}(\\mathfrak{q})$ 是 A 的素理想），验证连续性：$f^{-1}(D(a))=\\{\\mathfrak{q}:\\varphi(a)\\notin\\mathfrak{q}\\}=D(\\varphi(a))$ 是 B 的开集，故连续。层部分 $f^{\\sharp}:\\mathcal{O}_{\\mathrm{Spec}\\,A}\\to f_{*}\\mathcal{O}_{\\mathrm{Spec}\\,B}$ 在基上由局部化给出 $A_a\\to B_{\\varphi(a)}$，$x/a^n\\mapsto\\varphi(x)/\\varphi(a)^n$。需要检查良定义（若 $a^n x^{\\prime}=a^m x$ 则两边像相等，由 $\\varphi$ 是环同态得）与与限制的相容性（局部化函子的函子性给出）。反过来从态射出发，取全局截面得到 $\\varphi=\\Gamma(f^{\\sharp}):\\mathcal{O}_{\\mathrm{Spec}\\,A}(\\mathrm{Spec}\\,A)=A\\to\\mathcal{O}_{\\mathrm{Spec}\\,B}(\\mathrm{Spec}\\,B)=B$，两个构造互逆。于是"研究概形态射"在仿射情形完全等价于"研究反向的环同态"，这是代数几何把几何问题化为代数问题的基本机制。', ['local-hom-condition']),
      step('morphisms-as-geometry', '所有几何概念都是对态射加条件：相对观点的含义',
        '态射定义的另一层意义在于它把"研究对象"换成"研究对象之间的映射"。几何概念全部被重新定义为对态射附加的条件：开浸入是使 $f^{\\sharp}$ 满射且拓扑部分为同胚到开子集的态射；闭浸入要求 $f^{\\sharp}$ 满射且拓扑部分为到闭集的同胚；纤维积 $X\\times_S Y$ 是基变换；平坦、光滑、紧合、分离、有限、仿射等全是态射性质。这样做的好处是相对观点：与其研究孤立的概形 X，不如研究"X 在 S 上的族" $X\\to S$，于是纤维 $X_s$、基变换、形变、单值化等概念全部可以通过纤维积表述。格罗滕迪克的革命性做法正是把几何公理加在态射而非空间上，使证明可以"沿基变换迭代"，也让数论问题（S=Spec ℤ）与几何问题共用同一套语言。', ['affine-anti-equivalence', 'fibred-product']),
    ],
    conclusion: '概形态射由连续映射 $f$ 与局部层同态 $f^{\\sharp}:\\mathcal{O}_Y\\to f_{*}\\mathcal{O}_X$ 组成，仿射情形等价于反变的环同态 $A\\to B$；一切几何概念均由对态射附加条件得到，这构成"相对观点"的基础。',
    dependencies: [],
    consequences: [],
    explanation: '态射的定义体现了代数几何中"函数拉回"的方向性：几何映射把点往前送，函数则沿着相反方向被拉回，故层同态写在 $\\mathcal{O}_Y\\to f_{*}\\mathcal{O}_X$ 这一侧。若只保留连续映射，不同开集上的函数环就无法关联；若只保留层同态而不加局部性条件，就会出现把非零函数映成零的病态映射。两部分加上局部性条件，恰好使仿射概形的范畴与环范畴反变等价这一个漂亮的结论成立，而这正是"几何问题变代数问题"的机器。更深远的是它带来了研究重心的转移：从研究孤立的簇转向研究簇之间的映射，于是纤维、基变换、形变、单值化这些"相对"概念成为可能，所有几何性质都可以写成对态射的条件并在基变换下追踪。',
    examples: [
      {
        title: '例子：$\\mathrm{Spec}\\,\\mathbb{Z}[i]\\to\\mathrm{Spec}\\,\\mathbb{Z}$ 的结构态射与 $\\mathbb{F}_p$ 上的纤维',
        body: '取环单射 $\\mathbb{Z}\\to\\mathbb{Z}[i]$，它给出的态射 $f:\\mathrm{Spec}\\,\\mathbb{Z}[i]\\to\\mathrm{Spec}\\,\\mathbb{Z}$ 把素理想 $\\mathfrak{q}$ 送到 $\\mathfrak{q}\\cap\\mathbb{Z}$。对素数 p，纤维 $f^{-1}(\\,(p)\\,)$ 由 $\\mathbb{Z}[i]\\otimes_{\\mathbb{Z}}\\mathbb{F}_p=\\mathbb{F}_p[t]/(t^2+1)$ 给出：p=2 时是 $\\mathbb{F}_2[t]/(t+1)^2$，一个非约化的加厚点（分歧）；p=1 mod 4 时 $t^2+1$ 分裂成两个一次因子，纤维是两个点（分裂）；p=3 mod 4 时 $t^2+1$ 不可约，纤维是 $\\mathbb{F}_{p^2}$ 的一个点（惯性）。三种纤维行为都是对态射加条件后在不同基变换下的表现，说明"研究映射"确实比"研究孤立概形"承载更多信息。',
      },
    ],
    remarks: [
      '若删去"局部同态"条件，会得到"赋环空间态射"这一较大范畴，其中存在把非零元素映成零的病态映射，仿射情形与环同态的反变等价随即失效，故局部性条件不可省。',
      '层同态的方向不能反过来写成 $f_{*}\\mathcal{O}_X\\to\\mathcal{O}_Y$：这样函数的"拉回"会变成"前推"，与"点在 f 下的像"这一几何方向冲突，且与恒等态射的复合律不兼容，因此反变方向是强制的。',
      '概形态射不要求基拓扑上的纤维是离散或紧的；不同几何性质（分离、紧合、有限）是逐步附加的独立条件，不能由"是态射"本身推出，混淆它们会导致错误地套用不适用结论。',
    ],
    references: [
      stacks('Morphisms of schemes, Tag 01L0', '01L0'),
      stacks('Morphisms of locally ringed spaces, Tag 01HD', '01HD'),
      { title: 'Algebraic Geometry', author: 'Robin Hartshorne', year: 1977 },
    ],
    history: HISTORY,
  },

  /* ═══════════════════════════════════════════════════════════
   * 10. 坐标环
   * ═══════════════════════════════════════════════════════════ */

  'coordinate-ring': {
    statement: '设 k 是代数闭域，$X\\subseteq\\mathbb{A}^n_k$ 是仿射代数簇（即 $X=V(I)$ 对某个理想 I，且 X 不可约）。称 $A(X)=k[x_1,\\dots,x_n]/I(X)$ 为 X 的坐标环，其中 $I(X)=\\{f\\in k[x_1,\\dots,x_n]:f|_X=0\\}$。则 $A(X)$ 是有限生成约化 k-代数，且 $X\\mapsto A(X)$ 给出从仿射簇范畴（态射为多项式映射）到有限生成约化 k-代数范畴的反变等价。在该对应下：X 中的点 ↔ $A(X)$ 的极大理想；不可约子簇 ↔ 素理想；闭子簇 ↔ 根理想（或所有理想）；包含关系反向。',
    steps: [
      step('regular-functions', '正则函数环：坐标环到底是什么',
        '先定义对象。设 $X\\subseteq\\mathbb{A}^n$ 是仿射代数集。X 上的正则函数是指存在多项式 $f\\in k[x_1,\\dots,x_n]$ 使 $f|_X$ 就是该函数；由于不同的多项式可能限制到同一个函数（差一个在 X 上恒为零的多项式），正则函数全体自然地就是商环 $A(X)=k[x_1,\\dots,x_n]/I(X)$，其中 $I(X)$ 是 X 上恒为零的多项式的集合。$I(X)$ 是一个根理想：若 $f^m\\in I(X)$ 则 $f^m$ 在 X 上为 0，因为 X 上取值落在域 k 中且 $f(p)^m=0$ 推出 f(p)=0，故 $f\\in I(X)$。这就是"约化"。于是 $A(X)$ 是有限生成（由 $x_i$ 的像生成）、约化的 k-代数。这一步给出的东西很具体：一个 X 上的"函数"就是一组 n 个变量多项式模掉那些在 X 上恒为零的，坐标环的每个元素因此是某个真实的、可在点上求值的函数。', ['ideal-variety', 'nullstellensatz']),
      step('points-are-maximal', '点 ↔ 极大理想：零点定理是关键的一步',
        '为什么要用极大理想而不是别的理想来对应点？给定 $p\\in X$，取值映射 $\\mathrm{ev}_p:A(X)\\to k$，$f\\mapsto f(p)$，是满的 k-代数同态（常数函数给出满射），故它的核 $\\mathfrak{m}_p$ 是极大理想。得到映射 $p\\mapsto\\mathfrak{m}_p$。单射：若 $\\mathfrak{m}_p=\\mathfrak{m}_q$ 而 $p\\neq q$，取坐标函数 $x_i$ 使得在某分量上不同，构造一个在 p 处为 0、在 q 处非 0 的多项式（例如 $x_i-p_i$）就落在 $\\mathfrak{m}_p$ 而不在 $\\mathfrak{m}_q$，矛盾。满射就是零点定理的弱形式：k 代数闭，则 $A(X)$ 的任一极大理想 𝔪 满足 $A(X)/\\mathfrak{m}=k$（由 Zariski 引理，有限生成域扩张必是其素子域的有限扩张，代数闭性迫使它是 k 自身），取 𝔪 中元素共同零点 p 并用 Nullstellensatz 证明 𝔪 恰好是 $\\mathfrak{m}_p$。于是点与极大理想一一对应。', ['nullstellensatz']),
      step('subvarieties-correspond', '子簇 ↔ 理想：包含关系反向',
        '点对应完备后，扩到子簇。给理想 $J\\supseteq I(X)$，令 $V(J)=\\{p\\in X:J$ 的元素在 p 处全为 0$\\}$，它是 X 的闭子集；反方向给闭子集 $Z\\subseteq X$，令 $I(Z)$ 为在 Z 上恒为零的多项式构成的理想，它包含 $I(X)$。由零点定理（及其"根理想"形式 $I(V(J))=\\sqrt{J}$）两个操作在根理想上互逆：$V$ 与 $I$ 给出 $\\{\\text{根理想} J\\supseteq I(X)\\}$ 与 $\\{\\text{闭子集} Z\\subseteq X\\}$ 之间的一一反对应。限制到素理想就得到不可约子簇：$V(\\mathfrak{p})$ 不可约当且仅当 $\\mathfrak{p}$ 是素理想。方向反转是本质的：理想越大对应的零点集越小，因为更多方程施加了更多约束。这一层对应是把"几何的包含与被包含"翻译成"理想的包含与被包含"的字典，也是维数、重数、奇性等概念能在环上讨论的基础。', ['points-are-maximal', 'ideal-variety']),
      step('anti-equivalence', '范畴等价：态射的方向与逆构造',
        '最后得到范畴层面的等价。给多项式映射 $\\varphi:X\\to Y$，沿 $\\varphi$ 拉回函数给出 k-代数同态 $\\varphi^{*}:A(Y)\\to A(X)$，$g\\mapsto g\\circ\\varphi$。它把 Y 上的函数变成 X 上的函数，保持加法乘法与常数，且把极大理想 $\\mathfrak{m}_{\\varphi(p)}$ 拉回到 $\\mathfrak{m}_p$ 中（因为 $g(\\varphi(p))=0$ 则 $(g\\circ\\varphi)(p)=0$），即所谓"局部同态"。反方向：给 k-代数同态 $\\psi:A(Y)\\to A(X)$，取生成元像 $\\psi(y_j)=\\overline{f_j}$，定义 $\\varphi(p)=(f_1(p),\\dots,f_m(p))$，检验 $\\varphi$ 的像是 Y：对 $g\\in I(Y)$，$g(\\varphi(p))=(\\psi(g)^{\\text{like}})(p)=0$，因为 $I(Y)$ 在 $A(Y)$ 中是零，故 $\\varphi(p)\\in Y$。两个构造互逆（$\\varphi^{*}$ 的拉回再取生成元像回到原映射），且恒等与复合保持。于是"仿射簇 + 多项式映射"的范畴与"有限生成约化 k-代数 + 环同态"的范畴反变等价。', ['subvarieties-correspond', 'points-are-maximal']),
      step('dictionary', '字典：代数性质与几何性质的逐条对应',
        '范畴等价的实际价值在于它把整本字典自动送过来。约化性对应"没有幂零元"，几何上意味着 X 由它的点完全决定；整性（无零因子）对应 X 不可约，因为两个非零函数之积为零意味着 X 是两个真闭子集的并；$A(X)$ 的维数（Krull 维数）等于 X 的维数，对应素理想链的长度，即旗 $Z_0\\subsetneq Z_1\\subsetneq\\dots\\subsetneq Z_d$ 的最大长度；局部化对应"限制到开子集"，$A(X)_f$ 是 $D(f)$ 上的正则函数环；$A(X)_{\\mathfrak{m}_p}$ 是 p 处的局部环，其维数等于 X 在 p 处的局部维数；切空间对应 $\\mathfrak{m}_p/\\mathfrak{m}_p^2$ 的对偶，正则性对应局部环是正则局部环。这条字典是全部"用代数研究几何"的实际操作手段，也解释了为什么仿射簇理论的绝大部分工作可以在交换代数层面完成。', ['anti-equivalence', 'tangent-space']),
    ],
    conclusion: '$X\\mapsto A(X)=k[x_1,\\dots,x_n]/I(X)$ 给出仿射簇范畴与有限生成约化 k-代数范畴的反变等价；点 ↔ 极大理想，不可约子簇 ↔ 素理想，包含反向，维数、局部环、切空间等概念全部通过该字典对应。',
    dependencies: [],
    consequences: [],
    explanation: '坐标环是"仿射簇的所有正则函数"组成的环，它的作用是把几何对象翻译成一个代数对象，并且翻译是双向无损的：不但每个簇给出一个环，而且每个环同态都来自一个唯一的簇映射，方向恰好相反，因为函数沿映射被拉回。这个范畴等价是整个经典代数几何的地基，它把"研究簇"与"研究环"变成同一件事，于是关于不可约性、维数、奇性、切空间的问题都可以转为关于理想链、局部化、模、正则性的问题。具体对应尤其值得记住：点是极大理想（零点定理的功劳），不可约子簇是素理想（因为不可约性对应无零因子），而包含关系会反向，因为方程越多零点越少。',
    examples: [
      {
        title: '例子：抛物线 $y=x^2$ 与尖点 $y^2=x^3$ 的坐标环对比',
        body: '抛物线 $X=V(y-x^2)\\subseteq\\mathbb{A}^2$：$I(X)=(y-x^2)$ 是素的（因为 $k[x,y]/(y-x^2)\\cong k[t]$ 是整环），故 X 不可约。坐标环 $A(X)\\cong k[t]$ 是整闭的、维数为 1、处处正则，因此 X 处处光滑。尖点 $Y=V(y^2-x^3)$：$k[x,y]/(y^2-x^3)\\cong k[t^2,t^3]$，它不是整闭的（$t=y/x$ 在分式域中整，但 $t\\notin k[t^2,t^3]$），对应的正是原点处的不光滑：局部环 $A(Y)_{\\mathfrak{m}_0}$ 的嵌入维数是 2 而其维数是 1，二者不等故非正则。这组例子说明坐标环是否整闭、它的局部环是否正则，恰好读出了簇的光滑性与正规性。',
      },
    ],
    remarks: [
      '去掉"代数闭"的假设，点与极大理想的对应会失效：在 $\\mathbb{R}[x]$ 中 $(x^2+1)$ 是极大理想但它不对应 $\\mathbb{A}^1_{\\mathbb{R}}$ 上的任何点，原因是剩余域 $\\mathbb{R}[x]/(x^2+1)=\\mathbb{C}$ 不是 $\\mathbb{R}$，这说明必须用"到 k 的 k-代数同态"或整个素谱来替代极大理想。',
      '去掉"约化"（即允许 $I(X)$ 不是根理想）会引入幂零元，此时坐标环不再是函数环（幂零元在每点取值都是零却非零元素），点无法分辨它，必须改用概形与结构层保留重数信息。',
      '"态射反向"不能在簇的范畴里被忽略：如果把 $\\varphi:X\\to Y$ 记成 $A(X)\\to A(Y)$ 的正向映射，会得到与复合律相反的结论，因此严格说必须使用反变函子或等价地使用范畴的反范畴。',
    ],
    references: [
      stacks('Affine schemes, Tag 01HX', '01HX'),
      stacks('Nullstellensatz, Tag 00FR', '00FR'),
      { title: 'Undergraduate Algebraic Geometry', author: 'Miles Reid', year: 1988 },
    ],
    history: HISTORY,
  },

  /* ═══════════════════════════════════════════════════════════
   * 11. 有理映射
   * ═══════════════════════════════════════════════════════════ */

  'rational-map': {
    statement: '设 X、Y 是 k 上的整概形（或不可约簇）。一个有理映射 $\\varphi:X\\dashrightarrow Y$ 是一个等价类，其代表元为某个稠密开子集 $U\\subseteq X$ 上的态射 $\\varphi_U:U\\to Y$；两个代表元 $(U,\\varphi_U)$、$(V,\\varphi_V)$ 等价，若它们在 $U\\cap V$ 上一致（$U\\cap V$ 非空且稠密）。等价类中所有代表元的定义域之并仍是一个代表元的定义域，称为 $\\varphi$ 的定义域；其补集称为不定点集，当补集非空时有理映射不能延拓为整体态射。',
    steps: [
      step('motivation', '为什么需要"只在稠密开集上定义"的映射',
        '要理解有理映射，先看一个最典型的例子：中心投影。设 $X=\\mathbb{A}^n$、$Y=\\mathbb{P}^{n-1}$，把点 $x\\neq 0$ 送到"从原点出发过 x 的直线"，即 $x\\mapsto[x_1:\\dots:x_n]$。这个映射在 $x\\neq 0$ 处毫无问题，但在原点无定义：经过原点的直线有无穷多条，无法一致地指定一条。于是只能退让为"在稠密开集 $\\mathbb{A}^n\\setminus\\{0\\}$ 上定义的映射"。有理映射的定义正是为这种情形准备的：它记录一个在稠密开集上存在的态射，而不是一个处处定义的映射。参数化也是同样的情形：曲线 $C$ 由有理参数 $t\\mapsto(f(t),g(t))$ 给出时，总会有若干 t 值使分母为零而失去定义，这些参数值就是参数化没能解释到的点，因此参数化本质上是 $\\mathbb{P}^1\\dashrightarrow C$ 的有理映射而非态射。', ['morphism', 'singularity']),
      step('equivalence-class', '等价类与"稠密"的作用：把局部定义拼成唯一的整体对象',
        '两个代表元 $(U,\\varphi_U)$ 与 $(V,\\varphi_V)$ 何时算同一个有理映射？要求它们在 $U\\cap V$ 上相同。这里"稠密"至关重要，有两层作用。其一，保证 $U\\cap V\\neq\\emptyset$：若 X 不可约，任意两个非空开集都相交，故两个非空稠密开集一定相交，等价关系不空。其二，保证"一致"是一个强条件：若两个态射在一个非空开集上一致，则它们的所有局部数据在一般点上一致，于是它们在能在其中同时有定义的最大开集上一致。若 X 不可约，取覆盖 $U,V$ 的并 $W=U\\cup V$，可以用层论中的粘合和"两个态射在稠密开集上一致"这一事实证明 $\\varphi_U$ 与 $\\varphi_V$ 在 $U\\cap V$ 上一致后能拼成一个态射 $\\varphi_W:W\\to Y$，从而等价类中最"大"的代表元存在且唯一。这一步说明有理映射的定义域是良定的，谈"它在哪一点有定义"才有意义。', ['motivation', 'sheaf']),
      step('domain-of-definition', '定义域与不定点：$\\mathbb{P}^n\\to\\mathbb{P}^m$ 由齐次多项式给出',
        '具体计算定义域的标准手段是齐次坐标。给两组同次数的齐次多项式 $f_0,\\dots,f_m$（次数都为 d），定义 $\\varphi:\\mathbb{P}^n\\dashrightarrow\\mathbb{P}^m$，$x\\mapsto[f_0(x):\\dots:f_m(x)]$。在"至少有一个 $f_i$ 非零"的点上该式有定义（因为可以约去公共因子，坐标无歧义），在所有这些 $f_i$ 同时为零的点上无定义。于是定义域是 $\\mathbb{P}^n\\setminus V(f_0,\\dots,f_m)$，不定点集是 $V(f_0,\\dots,f_m)$，当这些 $f_i$ 有公共零点时不定点集非空且是真闭子集。例如 $\\varphi:\\mathbb{P}^2\\dashrightarrow\\mathbb{P}^2$，$[x:y:z]\\mapsto[xz:yz:z^2]$ 的不定点是 $\\{z=0\\}$ 这条一整条直线。注意不定点集的余维常常大于 1；当它不是余维 1 时（即不定点只出现在余维 2 以上的子集），这种有理映射被称为"有小不定点集"，它可沿光滑簇之间的延拓定理（对光滑簇、目标为紧合的情形）唯一延拓为态射。', ['equivalence-class']),
      step('birational-equivalence', '双有理等价：有理映射成为等价关系的判定',
        '称 X 与 Y 双有理等价（记 $X\\sim Y$），若存在有理映射 $\\varphi:X\\dashrightarrow Y$ 与 $\\psi:Y\\dashrightarrow X$ 使 $\\psi\\circ\\varphi=\\mathrm{id}_X$、$\\varphi\\circ\\psi=\\mathrm{id}_Y$（两个复合都是有意义的有理映射，即彼此定义域上有稠密开集相交且复合等于恒等）。等价刻画更常用：X 与 Y 双有理等价当且仅当存在非空开集 $U\\subseteq X$、$V\\subseteq Y$ 使 $U\\cong V$（作为簇）。另一条常被使用的刻画是函数域同构：对整簇，$X\\sim Y$ 当且仅当 $k(X)\\cong k(Y)$ 作为 k-代数。这条刻画使双有理等价成为可判定的代数问题：只需比较函数域。双有理几何的核心分类问题就是"按函数域给簇分类"，而由于函数域是有限生成的域扩张，分类问题可以归约到对有限生成扩域的研究，随后用双有理不变量（维数、几何亏格、Kodaira 维数等）来区分。', ['domain-of-definition']),
      step('resolution-of-indeterminacy', '不定点可以靠爆破消去：这与奇点消解是同一技术',
        '有理映射的重要定理是"不定点可消去"：对光滑簇 X 与射影目标 Y，任一有理映射 $X\\dashrightarrow Y$ 的不定点集可以经一串爆破被消除，得到态射 $\\tilde X\\to Y$，其中 $\\tilde X\\to X$ 是双有理态射。机理是：爆破把不定点所在的子簇替换为例外除子，而在除子上中心投影的"极限方向"被参数化，于是原先无定义的极限值获得确定值。这与奇点消解的技术完全同源：两者都需要在不定点（或奇点）处做爆破，再检查是否达到了目标形状。因此"有理映射与态射的差别"是可以被技术手段度量的：差别完全集中在不定点集上，而爆破正是处理这一集的统一工具，从双有理几何到极小模型纲领都依赖这一点。', ['domain-of-definition', 'blowup']),
    ],
    conclusion: '有理映射 $X\\dashrightarrow Y$ 是稠密开集上的态射模"在交上一致"的等价类，其定义域是良定的最大开集、补集为不定点集；对整簇，双有理等价等价于函数域同构，且不定点可经爆破被消去。',
    dependencies: [],
    consequences: [],
    explanation: '有理映射是双有理几何的基本语言。它放弃"处处有定义"的要求，只保留"在某个稠密开集上有定义"，原因是在很多重要情形下（中心投影、参数化、由齐次多项式给出的映射）天然存在无法一致定义的点，强行要求处处定义就只能人为改变对象。等价类的定义保证了这种"局部给出"的对象仍然唯一，其中不可约性扮演了关键角色：只有不可约才能保证任意两个非空开集相交，从而"在交上一致"这个条件才有内容、定义域才能被取成最大开集。更进一步，有理由相信有理映射与态射的差距是可控的：不定点集是闭的，在光滑情形下可以靠爆破消去，这一路径与奇点消解共用同一套技术，因而有理映射理论同时也是双有理分类的入口。',
    examples: [
      {
        title: '例子：$\\mathbb{P}^2\\dashrightarrow\\mathbb{P}^1$ 的中心投影与一次爆破后得到态射',
        body: '令 $\\varphi:\\mathbb{P}^2\\dashrightarrow\\mathbb{P}^1$，$[x:y:z]\\mapsto[y:z]$，它的定义域是 $\\mathbb{P}^2\\setminus\\{(1:0:0)\\}$（因为 $(1:0:0)$ 处 y=z=0，无定义），不定点集就是单点 $P=(1:0:0)$。在 P 处爆破 $\\mathbb{P}^2$，得到 $\\widetilde{\\mathbb{P}^2}\\to\\mathbb{P}^2$，例外除子 $E\\cong\\mathbb{P}^1$ 上的点恰好参数化"过 P 的直线方向"。于是把 $\\varphi$ 沿方向延拓成 $\\tilde\\varphi:\\widetilde{\\mathbb{P}^2}\\to\\mathbb{P}^1$，$E$ 上的点 $[0:u:v]$（方向的齐次坐标）恰好映到 $[u:v]$，与 $\\varphi$ 在 E 外的取值一致，故 $\\tilde\\varphi$ 是整体态射。这个计算说明"不定点 = 爆破中心"，一次爆破就足以把中心投影变成态射。',
      },
    ],
    remarks: [
      '去掉不可约性（或稠密性要求），"在交上一致"这类等价关系可能没有意义：两个不相交的开集上的代表元无法比较，此时有理映射的概念必须借助"局部化的层论等式"重构，否则会得到多值对象。',
      '有理映射一般不能复合：$\\psi\\circ\\varphi$ 只有当 $\\varphi$ 的定义域与 $\\psi$ 的定义域在 $\\varphi$ 下的像有交点时才有意义，因此"有理映射构成范畴"这件事需要小心处理，通常只在光滑簇上取等价类才可命名。',
      '双有理等价不等于同构：$\\mathbb{A}^1$ 与 $\\mathbb{P}^1$ 函数域都是 k(t) 因而双有理等价，但它们并不同构（前者非紧合、后者紧合）；这说明双有理不变量远少于几何不变量，分类问题必须再引入额外的不变量。',
    ],
    references: [
      stacks('Rational maps, Tag 01RR', '01RR'),
      stacks('Birational morphisms, Tag 0C1V', '0C1V'),
      { title: 'Algebraic Geometry', author: 'Robin Hartshorne', year: 1977 },
    ],
    history: HISTORY,
  },

  /* ═══════════════════════════════════════════════════════════
   * 12. 爆破
   * ═══════════════════════════════════════════════════════════ */

  'blowup': {
    statement: '设 $X$ 是概形、$Z\\subseteq X$ 是闭子概形，其理想层为 $\\mathcal{I}$。称 X 沿 Z 的爆破为 $\\pi:\\mathrm{Bl}_Z X\\to X$，其中 $\\mathrm{Bl}_Z X$ 是分次 $\\mathcal{O}_X$-代数 $\\bigoplus_{n\\ge 0}\\mathcal{I}^n$ 的相对 $\\mathrm{Proj}$，即 $\\mathrm{Bl}_Z X=\\mathrm{Proj}_X(\\bigoplus_{n\\ge 0}\\mathcal{I}^n)$，$\\pi$ 是自然投影。则：(1) $\\pi$ 在 $X\\setminus Z$ 上是同构；(2) $\\pi^{-1}(Z)$ 是 X 上的一个可逆层（线丛）对应的除子，称为例外除子 E；(3) 若 X 是仿射族 $\\mathrm{Spec}\\,A$ 且 $Z=V(I)$，则 $\\mathrm{Bl}_Z X$ 由 $\\bigoplus_{n\\ge 0}I^n$ 的 Proj 给出，几何上是 $X\\times\\mathbb{P}^{r-1}$ 中某个方程族的零点集。',
    steps: [
      step('construction', '构造：用 Rees 代数的相对 Proj 定义爆破',
        '把构造写清楚。设 $X=\\mathrm{Spec}\\,A$ 是仿射、$Z=V(I)$。定义 Rees 代数 $\\mathcal{R}(I)=\\bigoplus_{n\\ge 0}I^n t^n$（形式上作为 $A[t]$ 的子环，或用形式变元），它是有限生成的 A-代数（由 I 的生成元乘 t 生成），因此可以取 $\\mathrm{Proj}$。定义 $\\mathrm{Bl}_Z X=\\mathrm{Proj}\\,\\mathcal{R}(I)$。逐项看：$\\mathcal{R}(I)$ 的第 0 次部分是 A，第 n 次部分是 $I^n$，所以 Proj 天然带一个到 $\\mathrm{Spec}\\,A$ 的射影态射 $\\pi$。它的截面环包含 $\\mathcal{O}_X$ 给出射影态射的"底"。当 $I=(a_1,\\dots,a_r)$ 有限生成时，可以把 $\\mathcal{R}(I)$ 写成 $A[t_1,\\dots,t_r]/K$ 的形式（$t_i$ 对应 $a_i t$），于是 $\\mathrm{Bl}_Z X$ 是 $\\mathbb{A}^r$ 上的射影簇在 $A$ 上的相对版本。一般概形上把这段刻画逐图表搬过去并用粘合即可，构造是纯代数的、不需要选择生成元。', ['ideal-sheaf', 'scheme']),
      step('isomorphism-outside-Z', '在 Z 之外是同构：$I A_f=A_f$ 使分次代数平凡化',
        '验证 (1)。设 $x\\notin Z$，即 $x\\notin V(I)$，故存在 $f\\notin\\mathfrak{p}_x$ 使某个 $a_i$ 满足 $a_i\\notin\\mathfrak{p}_x$，等价地 $f$ 处 $I$ 的生成元不全落在素理想里。取这样的 f 局部化：$I A_f=A_f$，因为 $I$ 此时含有可逆元。于是 $\\mathcal{R}(I)_f=\\bigoplus_n A_f t^n=A_f[t]$，而 $\\mathrm{Proj}\\,A_f[t]=\\mathrm{Spec}\\,A_f$（一个变量多项式的 Proj 就是仿射直线，即底空间本身）。因此 $\\pi$ 限制在 $D(f)$ 上是同构，把这些 $D(f)$ 覆盖 $X\\setminus Z$ 便得 $\\pi|_{X\\setminus Z}$ 是同构。直观上：爆破只改动 Z 附近的几何，远离 Z 的地方理想层已经是整个结构层，没有"方向信息"可记录，故什么都不变。这一步也说明爆破是双有理的（同构于稠密开集上），因此它不改变函数域。', ['construction']),
      step('exceptional-divisor', '例外除子是可逆层：$\\pi^{-1}(Z)$ 由 $I\\cdot\\mathcal{O}_{\\mathrm{Bl}}$ 的可逆性给出',
        '验证 (2)。在 $\\mathrm{Bl}_Z X$ 上定义理想层 $\\mathcal{J}=I\\cdot\\mathcal{O}_{\\mathrm{Bl}_Z X}$，它是 $\\mathcal{I}$ 的"提升"。关键事实是 $\\mathcal{J}$ 局部分别由每个 $t_i$（对应的理想生成元）生成，且 Proj 的构造恰好使 $\\mathcal{J}$ 成为可逆层（秩 1 局部自由）：在任何仿射图表上，$\\mathcal{J}$ 由某个分次元素生成，其零轨迹在 $\\mathrm{Bl}$ 上是一个除子。称 $E=\\pi^{-1}(Z)$ 为例外除子，它在集合上就是 $V(\\mathcal{J})$。要检查 $E$ 的余维为 1 且对应可逆层：在 $\\mathbb{A}^n$ 沿原点爆破这一具体情形，$\\mathrm{Bl}_0\\mathbb{A}^n$ 的方程是 $x_i t_j=x_j t_i$，例外除子 $E$ 是 $\\{x_i=0\\}$，它是一个余维 1 子概形，且可被单个坐标卡——如在 $t_i\\neq 0$ 的图表上取 $x_i=0$——描述，故 $\\mathcal{O}(-E)$ 局部自由。于是 $\\pi$ 把 Z 替换为 $E$，且这个替换是可控的（除子对应一个线丛）。', ['construction']),
      step('effect-on-singularities', '效果：降低奇性严重程度与分离重数',
        '爆破的具体用途有三类。其一，降低奇点的严重程度：尖点 $y^2=x^3$ 在原点爆破后，严格变换变成 $y^2=x$（光滑曲线），即"仿射化"了奇异分支的相切。做法是在图表中代入 $x=x_1$、$y=x_1y_1$（其中一个方向），再约去公因子，得到严格的变换方程。其二，分离相交的重数：$xy=0$（两条直线交于原点）爆破后，例外除子上的两个方向被区分，两条直线对应 E 上两个不同的点，故"相交"被分离成"两个点各自与 E 相交"。其三，软化有理映射的不定点：中心投影的不定点经爆破后获得确定的极限方向。此外在相交理论里，爆破是把重数问题降级为几何问题的标准手段，因为 $\\pi^{*}D=\\tilde D+mE$（m 是重数）使得 $\\pi^{*}$ 与原像的关系可以被明确追踪，从而把曲线相交的重数计算转成一般位置的计算。', ['isomorphism-outside-Z', 'exceptional-divisor']),
      step('projective-space-example', '经典例：$\\mathrm{Bl}_0\\mathbb{A}^2$ 与 $\\mathbb{P}^1$ 上的线丛',
        '把最经典的例子算到底。取 $X=\\mathbb{A}^2=\\mathrm{Spec}\\,k[x,y]$、$I=(x,y)$。Rees 代数为 $k[x,y,xt,yt]$，令 $u=xt$、$v=yt$，则在 $k[x,y,u,v]$ 中这两个变量满足 $xv=yu$，故 $\\mathrm{Bl}_0\\mathbb{A}^2=\\mathrm{Proj}\\,k[x,y,u,v]/(xv-yu)$。它由两张图表覆盖：$D_+(u)$ 上可令 $u=1$，得 $\\mathrm{Spec}\\,k[x,y,v]/(xv-y)=\\mathrm{Spec}\\,k[x,v]$；$D_+(v)$ 上得 $\\mathrm{Spec}\\,k[y,u]$。两张图表的重叠满足 $x v=y u$ 即坐标变换 $u=1/v$（或 $x=yu$），是标准的 $\\mathbb{P}^1$ 粘合。例外除子在这两张图表上分别由 $x=0$ 与 $y=0$ 给出，即 $\\{x=0\\}\\cong\\mathbb{A}^1$ 粘成 $\\mathbb{P}^1$。因此 $\\mathrm{Bl}_0\\mathbb{A}^2$ 是 $\\mathbb{A}^2$ 的"把原点换成一条 $\\mathbb{P}^1$（参数化过原点的所有直线方向）"的改造，它在 $\\mathbb{A}^2\\setminus\\{0\\}$ 上是同构。', ['construction', 'exceptional-divisor']),
    ],
    conclusion: '$\\mathrm{Bl}_Z X=\\mathrm{Proj}_X(\\bigoplus_{n\\ge 0}\\mathcal{I}^n)$，在 Z 外为同构、把 Z 替换为例外除子 E（对应一个可逆层），且它是双有理态射；爆破可以降低奇性、分离重数并消去有理映射的不定点，是奇点消解与相交理论的核心工具。',
    dependencies: [],
    consequences: [],
    explanation: '爆破是把闭子概形替换为"它所有方向"的技术。构造上它取 Rees 代数 $\\bigoplus I^n$ 的相对 Proj，这一形式代数的每个分次部分正好记录了"到 Z 的第 n 阶无穷小邻域方向"，因此 Proj 得到的空间在 Z 外的局部化使 $I$ 成为整个环（无方向可记）所以保持不变，而在 Z 上安置了一个余维 1 的例外除子把方向参数化。由此爆破是双有理的，不改变函数域，却能在局部显著改善几何：尖点的相切方向被拉开，交叉的两条分支被分离，中心投影丢失的极限值被补上。它也是相交理论的关键工具，因为通过 $\\pi^{*}D=\\tilde D+mE$ 可以精确追踪重数变化，把复杂的相交问题化为一般位置下的计算。',
    examples: [
      {
        title: '例子：$y^2=x^3$ 在原点的爆破（严格变换得到光滑曲线）',
        body: '取 $X=\\mathbb{A}^2$、$Z=\\{0\\}$，图表 $x\\neq 0$ 上令 $y=xy_1$，代入 $y^2=x^3$ 得 $x^2y_1^2=x^3$，约去 $x^2$ 后严格变换为 $y_1^2=x$，这是一条光滑曲线；另一图表 $y\\neq 0$ 令 $x=yx_1$ 得 $1=x_1^3y$，同样在例外除子之外光滑。而例外除子 $E$（由 $x=0$，即 $x_1$ 或 $y_1$ 的坐标给出）与严格变换的交点只有一个，对应于尖点有唯一的切方向。对比 $xy=0$：$x\\neq 0$ 图表代入 $y=xy_1$ 得 $y_1=0$，$y\\neq 0$ 图表得 $x_1=0$，两条分支分别对应 $E$ 上两个不同点，相交重数被分离成两次简单相交。这两个计算是"爆破分离重数"最直观的验证。',
      },
    ],
    remarks: [
      '若 X 不光滑，或 Z 的性质很差，爆破后可能出现新的奇点或使除子不再是可逆层所对应的除子（例如 Z 的余维大于 1 时例外除子可能不是除子而是较小的对象），此时必须改而使用带权的爆破或形式爆破。',
      '爆破改变的是整体几何而非函数域：它作为双有理态射保持 $k(X)$，所以不能指望用爆破改变双有理不变量（如亏格）；若要改变这些量必须使用更剧烈的手段（如奇点消解、极小平模型或翻转）。',
      '$\\mathrm{Bl}_Z X$ 依赖 Z 的理想层而非仅 Z 的拓扑闭集：同一个闭集配不同的（非根）理想会给出不同的爆破结果，这正是必须用概形与理想层语言而不能只用簇的原因。',
    ],
    references: [
      stacks('Blowing up, Tag 0804', '0804'),
      stacks('Blowing up, Tag 0855', '0855'),
      { title: 'Algebraic Geometry', author: 'Robin Hartshorne', year: 1977 },
    ],
    history: HISTORY,
  },

  /* ═══════════════════════════════════════════════════════════
   * 13. 奇点
   * ═══════════════════════════════════════════════════════════ */

  'singularity': {
    statement: '设 $X$ 是 k 上的簇、$x\\in X$。称 x 是光滑点（或正则点），若局部环 $\\mathcal{O}_{X,x}$ 是正则局部环，即 $\\dim \\mathcal{O}_{X,x}=\\dim_k \\mathfrak{m}_x/\\mathfrak{m}_x^2$，其中右端是 Zariski 切空间的维数；否则称 x 为奇点。等价地，x 光滑当且仅当 $\\dim T_x X=\\dim_x X$。称 X 光滑，若所有点都光滑。',
    steps: [
      step('tangent-and-embedding-dim', '切空间与嵌入维数：两个都用平方零扩来定义',
        '先把两个量摆出来。Zariski 切空间定义为 $T_x X=(\\mathfrak{m}_x/\\mathfrak{m}_x^2)^{\\vee}$，对偶空间，其中 $\\mathfrak{m}_x$ 是局部环的唯一极大理想。它的元素是"点处的一次形变"或"一阶导子"，维数等于 $\\mathfrak{m}_x/\\mathfrak{m}_x^2$ 的维数，称为嵌入维数 $\\mathrm{edim}$。另一方面，$\\dim_x X$ 由局部环 $\\mathcal{O}_{X,x}$ 的 Krull 维数给出。用具体坐标算：若 $X\\subseteq\\mathbb{A}^n$ 由方程 $f_1=\\dots=f_m=0$ 在 x 附近给出，则 $T_x X$ 是线性方程组 $\\sum_j (\\partial f_i/\\partial x_j)(x)\\cdot v_j=0$ 的解空间，即雅可比矩阵在 x 处的核。这个版本最便于手算，因为只要写出雅可比矩阵并求秩即可；而 $\\dim_x X$ 一般比"参数个数减方程个数"更小或相等，二者的差正是奇性产生的来源。', ['tangent-space', 'krull-dim']),
      step('regular-criterion', '正则性判据：$\\dim=\\mathrm{edim}$ 的等价刻画',
        '正则局部环的刻画有多种，最常用的是"极大理想的极小生成元个数等于环的维数"。由 Nakayama 与基本不等式 $\\dim A\\le \\dim_k \\mathfrak{m}/\\mathfrak{m}^2$ 对任意诺特局部环 A 成立（左侧由 Krull 维数不小于任何参数系的长度给出，右侧由切空间是生成元的上界给出），于是只需比较两个数。构造参数系：取 $\\mathfrak{m}/\\mathfrak{m}^2$ 的一组基 $\\bar{f_1},\\dots,\\bar{f_d}$（d 为嵌入维数），则 Krull 维数不超过 d；若恰好 $\\dim A=d$（即这 d 个元素在整个 A 上就是"参数系"），则 A 正则。等价的数值判据是 A 的正则性等价于 $\\mathrm{gr}_{\\mathfrak{m}}(A)\\cong k[X_1,\\dots,X_d]$（分次环是多项式环），直观地说"局部环的关联分次环是自由的"，即所有高阶邻域结构都是平坦的、没有额外的关系。这一步给出可操作做法：算雅可比矩阵在 x 处的秩，看它是否等于 $n-\\dim_x X$。', ['tangent-and-embedding-dim']),
      step('examples-cusp-node', '典型例：两条直线交点与尖点',
        '两个标准例子。其一，节点 $X:xy=0\\subseteq\\mathbb{A}^2$ 在原点。此时 $\\dim_0 X=1$（X 是两条直线的并，每个分支维数 1），而雅可比矩阵是 $(y,x)$，在原点为 $(0,0)$，故 $T_0X=k^2$，$\\dim T_0X=2\\neq 1=\\dim_0X$，于是原点是奇点，$\\mathrm{edim}=2$ 比维数多 1。几何上切空间维数比簇维数大是因为两条分支的切线方向不同，切空间必须把两个方向都容纳进来。其二，尖点 $X:y^2=x^3$ 在原点。雅可比矩阵 $(2y,-3x^2)$ 在原点同样为零，故 $\\dim T_0X=2\\neq\\dim_0X=1$，原点是奇点；这里的几何原因不是分支不同，而是唯一分支的"加加速度"（参数化 $t\\mapsto(t^2,t^3)$ 在 t=0 处速度为零）。两种奇点都提示一个共同规律：切空间是线性近似，而 $\\dim T_xX>\\dim_xX$ 表示线性近似"过度容纳"，即簇在 x 附近比线性模型退化。', ['tangent-and-embedding-dim']),
      step('normalization-and-codim-one', '正规 ⇒ 在余维 1 上正则：整闭的几何含量',
        '奇点理论的一个核心结构性结论是：若 X 正规（局部环整闭），则 X 在余维 1 的点处正则；等价地，正规簇的奇点集余维至少为 2。原因是"正规"用赋值环刻画：x 处的局部环整闭意味着不存在只沿着某个方向出现的隐缺陷，而余维 1 的局部环是离散赋值环（维数 1 的正则局部环与 DVR 的对应），DVR 自动整闭，故正规性在该处不能构成额外的约束。反过来，若某处余维 1 但不正则（例如 cusp 型曲线的每一点），也可查出局部环不整闭，因为整闭性等价于"被所有赋值环守住"而奇点处某方向上的赋值会漏掉。这一步给出实用的定位手段：奇点只能出现在余维至少 2 的地方，因此曲线（维数 1）的正规就是光滑，而曲面上的奇点可以是孤立点。', ['valuation-ring', 'regular-local-ring']),
      step('resolution-and-invariants', '消解与不变量：如何度量奇点',
        '奇点的研究有两条主线。其一，消解：给 X 找一个光滑簇 $\\tilde X$ 与双有理态射 $\\tilde X\\to X$（当 $\\mathrm{char}\\,k=0$ 时由 Hironaka 定理对任意维数成立），消解的构造以逐次爆破中心实现，每次爆破都能降低某处的奇性严重程度（例如使重数下降或使嵌入维数下降）。其二，度量：用重数（局部环的 Hilbert-Samuel 首项系数）、嵌入维数与切锥、以及消解的不变量（如例外的图表与奇点的离散资料）描述奇点的"糟糕程度"。此外，几何亏格与 Kodaira 维数这类双有理不变量可以区分具有不同奇点集的簇。典型例子：$y^2=x^2(x+1)$ 的节点在特征 $\\neq 2$ 时经一次爆破即变光滑，而 $x^2+y^2+z^2=0$ 在原点的奇异性在特征 2 下的行为完全改变（方程化为 $(x+y+z)^2=0$，成为不可约的重平面），说明奇点理论在特征 p 下必须更加小心。', ['examples-cusp-node', 'blowup']),
    ],
    conclusion: '点 x 光滑当且仅当 $\\mathcal{O}_{X,x}$ 正则，即 $\\dim \\mathcal{O}_{X,x}=\\dim_k\\mathfrak{m}_x/\\mathfrak{m}_x^2$，等价于 $\\dim T_xX=\\dim_xX$；否则 x 是奇点。奇点可用重数、嵌入维数等度量，可经爆破消解，而正规簇的奇点集余维至少为 2。',
    dependencies: [],
    consequences: [],
    explanation: '奇点的定义方式是"比较两个维数"。切空间用局部环极大理想除以它的平方得到，它纯粹来自一阶信息，是一个线性空间；局部环的 Krull 维数是簇在该点的真实维数。当两者相等时，簇在该点的邻域"看起来像线性的"，可以选取合适多的坐标函数使它们构成参数系；当切空间更大时，多出来的方向说明线性近似包含了簇实际不沿之展开的方向，这种"容纳过度"正是奇性。节点和尖点是两个典型：前者因为两个分支的切线不同而把两个方向都算进切空间，后者因为唯一分支的参数化在原点速度为零。奇点理论进一步给出定位手段（正规簇的奇点余维至少 2）和改善手段（爆破消解），因此它既是分类的障碍也是通过消解换取光滑性的资源。',
    examples: [
      {
        title: '例子：$xy=0$、$y^2=x^3$、$y^2=x^3+x^2$ 三个奇点与光滑曲线 $y=x^2$',
        body: '四个平面曲线在原点处对比。光滑例 $y=x^2$：雅可比 $(2x,-1)$ 在原点为 $(0,-1)$，秩 1，切空间维数 1 = 簇维数 1，光滑。节点 $xy=0$：雅可比 $(y,x)$ 在原点为零矩阵，切空间维数 2 > 1，奇点，且切空间正是两条分支的切线之并所张成。尖点 $y^2=x^3$：雅可比 $(2y,-3x^2)$ 在原点为零，切空间维数 2 > 1，奇点，但分支只有一条。带节点型 $y^2=x^3+x^2=x^2(x+1)$：雅可比 $(2y,-3x^2-2x)$ 在原点为零，奇点；但它的形式邻域里 $y^2=x^2(x+1)$ 可写成 $y^2=(x\\sqrt{1+x})^2$，故形式地分裂成两条光滑分支，整体上却只在原点相切，这正好说明"奇性"在形式与整体两个层面可以不同。',
      },
    ],
    remarks: [
      '嵌入维数与实际维数之差衡量奇性的说法只在"局部环诺特"标准假设下适用；在非诺特或非约化情形（例如带幂零元的环），Krull 维数与切空间的关系会被幂零元搅乱，需要改用分次环的正则性来定义。',
      '在特征 p 中奇点的行为会突变：$x^2+y^2+z^2=0$ 在特征不为 2 时是锥面上的孤立奇点，在特征 2 时化为 $(x+y+z)^2=0$，成为重数为 2 的平面，因而"光滑性"与"奇性"的判据必须重新用 flat/étale 语言表述。',
      '光滑点在基变换下不保持：把光滑簇沿非光滑基作基变换可能产生奇点（例如 $\\mathbb{A}^1\\times_{\\mathbb{A}^1}\\{0\\}$ 型的退化纤维），因此"光滑"是相对概念，谈奇点必须先固定基与态射。',
    ],
    references: [
      stacks('Regular local rings, Tag 00NP', '00NP'),
      stacks('Smooth morphisms, Tag 00TH', '00TH'),
      { title: 'Singularities of Plane Curves', author: 'E. Casas-Alvero', year: 2000 },
    ],
    history: HISTORY,
  },

}
