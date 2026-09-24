/**
 * ═══════════════════════════════════════════════════════════════
 *  代数几何知识库 · 扩展 E —— 层论与上同调的技术核心
 * ═══════════════════════════════════════════════════════════════
 *
 *  这一批补的是主库里最"薄"的一层：层论与上同调之间的那些
 *  **技术枢纽**。它们很少被当作"知识点"单独讲，但几乎每个
 *  深入的证明都要经过它们：
 *
 *    · 六个函子（f*, f_*, f^!, f^!）与它们的伴随、投影公式、
 *      基变换 —— 上同调运算的语法；
 *    · 凝聚性、半连续性、有限维性 —— 让上同调群成为有限维
 *      向量空间从而"可数"的那些定理；
 *    · 消没轮与邻近轮、反常 t-结构、分解定理 —— 把局部单值
 *      信息组织成整体结构的机器；
 *    · D-模与 Riemann–Hilbert 对应 —— 从代数到分析再到拓扑
 *      的翻译表。
 *
 *  它们之间的连接比它们各自更重要，所以本批的 links 密度刻意
 *  高于平均（平均 3 条以上），目的是让这一片在主星系里形成
 *  一个紧致的"技术核心"，而不是散落的孤立点。
 *
 *  字段说明见 knowledge.js 顶部。
 */

export const EXTRA_E_NODES = [
  /* ══════════ 一、推前、伴随与基变换 ══════════ */
  {
    id: 'e-derived-pushforward',
    latex: String.raw`Rf_*\colon D^b(\mathcal O_X)\to D^b(\mathcal O_Y),\qquad R^if_*=H^i(Rf_*)`,
    name: '导出推前',
    en: 'Derived Pushforward',
    importance: 0.87,
    family: 'cohomology',
    summary: '把层的推前升级成复形的推前，使长正合列与高阶直像成为同一个对象的不同次。',
    detail:
      '普通直像 f_* 只记录第零层信息，高阶直像 R^if_* 要逐层定义、逐次计算，而且它们之间的关系（长正合列）只能事后拼装。导出推前把这一步整体化：把层视为复形（放在第 0 次），取 Rf_* = f_* 的导出函子，得到一个**复形**，它的第 i 次上同调恰好是 R^if_*。这样长正合列就是复形短正合列的旋转，不再需要单独论证。技术前提是 f 要是拟紧拟分离的，才能保证 Rf_* 落在 D^b_qc 里；对凝射态射可以逐仿射地用模的导出张量计算。它是 Grothendieck 把同调代数系统搬进代数几何的关键一步，也是所有后续形式（导出叠、六函子形式化）的语法基础。',
  },
  {
    id: 'e-push-pull-adjunction',
    latex: String.raw`\operatorname{Hom}_{D(Y)}(Rf_*\mathcal F,\mathcal G)\cong\operatorname{Hom}_{D(X)}(\mathcal F,Lf^*\mathcal G)`,
    name: '推前与拉回的伴随',
    en: 'Pushforward–Pullback Adjunction',
    importance: 0.85,
    family: 'cohomology',
    summary: '(Lf*, Rf_*) 构成伴随对 —— 几乎一切上同调运算都是从这一条派生出来的。',
    detail:
      '这是六函子形式化里最先被证明、也最常被使用的一条：导出拉回 Lf* 是导出推前 Rf_* 的左伴随。它的原型是模的张量–Hom 伴随（对仿射态射，f_* 是限制标量、f* 是基变换，两者确实伴随）。有了伴随，很多性质的证明可以"换边"：想证明某个拉回映射是单射，等价于证明对应的推前映射是满射；想构造拉回方向的上同调类，可以用伴随的 unit/counit 转成推前方向的自然变换。注意方向：f* 是左伴随，所以它右正合（保持余核而非核），这正是"拉回不保持正合性"这一常见麻烦的来源 —— 解决它需要 Tor 或导出拉回。另一对伴随 (Rf_!, f^!) 处理紧支方向，见相邻节点。',
  },
  {
    id: 'e-projection-formula',
    latex: String.raw`Rf_*(\mathcal F\overset{L}{\otimes}Lf^*\mathcal G)\cong Rf_*\mathcal F\overset{L}{\otimes}\mathcal G`,
    name: '投影公式',
    en: 'Projection Formula',
    importance: 0.83,
    family: 'cohomology',
    summary: '推前可以"穿过"从底空间拉回来的东西 —— 上同调运算与张量积的兼容性。',
    detail:
      '投影公式说：把 X 上的层 F 与从 Y 拉回来的 G 张量，再推到 Y，等于先推 F 再与 G 张量。直觉上，"从底下拉上来的部分"不参与纤维方向的运算，所以可以先推后乘。它是几乎所有涉及乘积结构的计算必须经过的一步：例如证明 Picard 群在拉回下的函子性、计算纤维丛的相对上同调、推导 Hirzebruch–Riemann–Roch 的相对版本（Grothendieck–Riemann–Roch，见 b-hirzebruch-rr 与 grothendieck-riemann-roch）。缺少它时，任何"纤维上的结果如何拼成整体的结果"的问题都无法表述。证明用谱序列或直接对仿射开集验证，是标准的导出函子论证。',
  },
  {
    id: 'e-base-change-cohomology',
    latex: String.raw`Lg^*Rf_*\mathcal F\cong Rf'_*Lg'^*\mathcal F\qquad (\text{with Tor-independence})`,
    name: '上同调基变换',
    en: 'Cohomology and Base Change',
    importance: 0.86,
    family: 'cohomology',
    summary: '换底后高阶直像如何变化 —— 研究"族"的上同调时必须先解决的技术核心。',
    detail:
      '给定纤维方图，自然有映射 Lg* Rf_* → Rf\'_* Lg\'*，问题是它何时是同构。答案的关键是 **Tor 独立性**：当某个 R^if_*F 在底空间上局部自由（或更一般地，与换底相容）时，基变换成立。这条定理是"上同调在族中的行为"的全部技术基础：没有它就不能把纤维的上同调与整体的上同调联系起来，也就无法谈"维数跳变"或"半连续性"。半连续性定理（见 e-semicontinuity）与 Grauert 定理（见 e-grauert-theorem）都是它的推论：先证明基变换在开集上成立，再观察秩函数的变化。这也是为什么模空间理论里反复出现"局部自由"假设 —— 它正是基变换成立的门槛。',
  },
  {
    id: 'e-semicontinuity',
    latex: String.raw`y\mapsto\dim_{k(y)}H^i(X_y,\mathcal F_y)\ \text{is upper semicontinuous for proper}\ f`,
    name: '上同调的半连续性',
    en: 'Semicontinuity of Cohomology',
    importance: 0.80,
    family: 'cohomology',
    summary: '真态射的纤维上同调维数只能"向上跳" —— 上同调不会突然变小。',
    detail:
      '结论：对真态射 f: X → Y 与凝聚层 F，函数 y ↦ dim H^i(X_y, F_y) 是上半连续的，即每个 i 处的维数在闭集上达到最大值。道理来自基变换与有限性：高维数意味着 R^if_*F 的纤维维数大，而凝聚层的纤维维数在闭集上跳升（Nakayama 引理）。它对研究形变有直接后果 —— 纤维的上同调只能"退化"（变小），这解释了为什么形变理论中障碍与维数跳变总是出现在特殊纤维上。对 H^0 它给出"整体截面的维数不会突然变小"，是代数几何里的"有界性"直觉；对 H^1 它控制着参数空间里的"跃变层"，是模空间分层（stratification）的来源。层化版本对高阶直像也成立。',
  },
  {
    id: 'e-grauert-theorem',
    latex: String.raw`f\ \text{proper},\ \mathcal F\ \text{coherent}\ \Longrightarrow\ R^if_*\mathcal F\ \text{is coherent}`,
    name: 'Grauert 定理',
    en: 'Grauert\'s Finiteness Theorem',
    importance: 0.84,
    family: 'cohomology',
    summary: '真态射下凝聚层的直像是凝聚的 —— 上同调群的有限维性的相对版本。',
    detail:
      'Grauert 在 1960 年为复解析空间证明了：真态射的凝聚层直像仍凝聚。代数版本由 Grothendieck 用"形式函数定理"（formal functions theorem，见 formal-functions-theorem）给出，实际上更强也更代数化。它的意义是把"有限维"这件事相对化：绝对情形（Serre 有限性，见 serre-finiteness）说的是射影簇上凝聚层的上同调是有限维向量空间；Grauert 定理说的是这件事在整个族上一致地成立 —— 直像层是凝聚的，所以局部由有限多个生成元与关系描述，维数只在闭集上跳。它也是半连续性（见 e-semicontinuity）与基变换（见 e-base-change-cohomology）的前提，两者加起来构成"上同调在族中的行为的完整描述"。',
  },

  /* ══════════ 二、凝聚性、有限性与消没 ══════════ */
  {
    id: 'e-coherent-sheaf',
    latex: String.raw`\mathcal F\ \text{coherent}\iff \mathcal F\ \text{loc. f.g. and every kernel of}\ \mathcal O^n\to\mathcal F\ \text{is f.g.}`,
    name: '凝聚层',
    en: 'Coherent Sheaf',
    importance: 0.88,
    family: 'cohomology',
    summary: '局部有限生成且核也有限生成的层 —— 能"被有限数据描述"的层。',
    detail:
      '拟凝聚层只要求局部是模的层化；凝聚层额外要求局部有限生成（有满射 O^n → F）且**任何**这样的满射的核也有限生成。第二个条件不是技术洁癖：它保证核本身也是凝聚的，于是可以不断取核（syzygy），得到有限自由预解 —— 这正是"有限维上同调"与"Hilbert 多项式"存在的根据（见 b-hilbert-polynomial、g-hilbert-syzygy）。Noether 环上这两条对模自动等价（子模有限生成），所以仿射概形上的拟凝聚层就是凝聚层；非 Noether 情形下两者会分开。所有几何上感兴趣的层（结构层、理想层、局部自由层、以及它们的核与余核）都是凝聚的，而"凝聚"这个条件正是让 Serre 有限性、Grauert 定理、Riemann–Roch 得以陈述的门槛。',
  },
  {
    id: 'e-quasi-coherent-locality',
    latex: String.raw`\mathcal F\ \text{qcoh on}\ X\iff \mathcal F|_{\operatorname{Spec}A}\cong\widetilde M`,
    name: '拟凝聚层的局部刻画',
    en: 'Local Characterization of Quasi-Coherent Sheaves',
    importance: 0.78,
    family: 'cohomology',
    summary: '拟凝聚层在每个仿射开集上就是模的层化 —— 这是把几何翻译成代数的字典。',
    detail:
      '这条等价是仿射概形理论的基石：X 上的拟凝聚层与"每个仿射开集一个模、限制映射是局部化"这套数据一一对应。它使得任何关于拟凝聚层的陈述都可以逐仿射地化为交换代数命题，从而把几何问题变成模论问题。实际操作中它给出两个常用推论：其一，拟凝聚层的映射只需在仿射开集上定义并在重叠处相容（免去层化的繁琐）；其二，层在一点处的茎等于对应模在该素理想处的局部化（见 a-stalk），于是"局部性质"总可以化为局部化来检验。拟凝聚层构成的范畴是 Abel 范畴且有足够内射对象，这是它在导出范畴里表现良好的原因。',
  },
  {
    id: 'e-sheafification',
    latex: String.raw`\mathcal F^+\colon \text{presheaf}\to\text{sheaf},\qquad (\mathcal F^+)_x=\varinjlim_{x\in U}\mathcal F(U)`,
    name: '层化',
    en: 'Sheafification',
    importance: 0.74,
    family: 'foundation',
    summary: '把预层补成层，且茎不变 —— 层范畴是预层范畴的反射子范畴。',
    detail:
      '预层只要求限制映射相容，不要求"局部数据能拼成整体"；层化用茎的直极限把缺失的整体截面补上。关键性质有两条：茎不变（(F⁺)_x = F_x），以及层化是预层范畴到层范畴的**左伴随**（所以它保持余极限、不保持极限）。第二条意味着层范畴里的极限要"先取预层极限再层化"，这解释了很多看起来别扭的现象（例如层范畴里的纤维积不逐点计算）。层化的存在性依赖于所考虑的 Grothendieck 拓扑 —— 在 Zariski 拓扑上就是经典层化，在 étale、平坦、fppf 拓扑上则是各自的层化（见 grothendieck-topology）。它是"下降"（见 h-flat-descent）能成立的技术前提。',
  },
  {
    id: 'e-local-system',
    latex: String.raw`\mathcal L\ \text{loc. const.}\iff \mathcal L\cong\underline V\ \text{locally},\qquad \pi_1(X,x)\to GL(V)`,
    name: '局部系与单值表示',
    en: 'Local Systems and Monodromy',
    importance: 0.79,
    family: 'cohomology',
    summary: '局部常值层等价于基本群的表示 —— 拓扑信息变成代数对象。',
    detail:
      '局部系（局部常值层）看起来是层论里最简单的对象，但它承载了全部单值信息：在连通、局部单连通的空间上，秩 n 的局部系与 π₁(X, x) → GL_n(k) 的表示一一对应（取茎沿回路的平行移动）。这条对应是把**拓扑**问题翻译成**代数**问题的标准化入口：上同调 H^i(X, L) 变成群上同调 H^i(π₁, V)，于是 Galois 表示、模形式的 Hecke 代数、以及 Kähler 流形上的 Hodge 结构都可以用同一套语言处理。在代数几何里它出现在许多地方：étale 局部系对应 ℓ-进表示（见 b-tate-module），平坦联络对应 D-模（见 c-d-module），而 Deligne 的混合 Hodge 理论正是为"局部系的 Hodge 结构"建立的框架（见 g-deligne-mixed-hodge）。',
  },
  {
    id: 'e-monodromy-weight',
    latex: String.raw`T_s=T_uT_{ss},\qquad N=\log T_u,\qquad N^{k+1}=0`,
    name: '单值分解与权滤过',
    en: 'Monodromy Decomposition and Weight Filtration',
    importance: 0.82,
    family: 'cohomology',
    summary: '单值变换的椭圆–幂零分解，以及幂零部分的权滤过 —— 退化理论的技术核心。',
    detail:
      '当局部系沿一个退化族绕一圈时，纤维上的变换（单值）会失去半单性。Jordan 分解把它拆成可交换的两部分：半单部分 T_ss 与幂零部分 T_u，后者决定了对数 N = log T_u，且 N^{k+1} = 0（对度数有界的局部系）。这个幂零部分携带全部"退化信息"：单值定理（monodromy theorem，Landman、Grothendieck、Katz 等人）保证存在唯一的权滤过 W，使 N 把它下移两格（N(W_i) ⊆ W_{i−2}），而硬 Lefschetz 型性质把它上移。这就是 Deligne 的**权滤过**与 SL(2) 轨道定理（见 g-nilpotent-orbit-theorem、g-slmc）的全部技术内容。它是"上同调在退化时如何变化"的完整答案，也是周期映射的边界行为、混合 Hodge 结构的定义、以及局部系统刚性的基础。',
  },

  /* ══════════ 三、消没轮、反常层与分解定理 ══════════ */
  {
    id: 'e-vanishing-cycle',
    latex: String.raw`R\Psi_{\mathcal F}\in D^b(\Lambda),\qquad H^i(R\Psi_{\mathcal F})_x=H^i(X_{\bar\eta},\mathcal F)`,
    name: '消没轮',
    en: 'Vanishing Cycles',
    importance: 0.83,
    family: 'cohomology',
    summary: '记录"接近退化纤维"的上同调 —— 把局部单值信息装成一个复形。',
    detail:
      '对一个局部常值系（或一般构造）沿函数 f 的退化，消没轮 RΨ_F 是一个定义在临界值上的复形，它的纤维上同调给出邻近纤维（越过临界值后）的上同调。与它成对的是邻近轮 RΦ_F（vanishing cycles 的另一种约定，记法在各家文献中不统一，有的把 RΨ 叫 nearby、RΦ 叫 vanishing）。核心定理是**单值定理**：Ψ 上带有单值作用 T，其幂零部分的对数 N 满足 N^{k+1} = 0，并且 Ψ 上存在权滤过使 N 下移两格。这套机器是 Picard–Lefschetz 公式的高维、代数化版本：经典公式里"绕临界值一圈对应一个消没球面的 Picard–Lefschetz 变换"，在这里被表述成 N 在上同调上的作用。它也是反常层与分解定理（见 e-decomposition-theorem）的技术前提。',
  },
  {
    id: 'e-nearby-cycle-functor',
    latex: String.raw`R\Phi_{\mathcal F}=\operatorname{cone}(R\Psi_{\mathcal F}\xrightarrow{sp} \mathcal F|_{X_0})`,
    name: '邻近轮与特殊化映射',
    en: 'Nearby Cycles and the Specialization Map',
    importance: 0.76,
    family: 'cohomology',
    summary: '消没轮与特殊纤维之间的差 —— 精确度量"哪些类在退化中消失了"。',
    detail:
      '特殊化映射 sp 把特殊纤维上的截面送到消没轮，它的锥就是邻近轮 RΦ。这个构造给出一个正合三角，把三种信息（特殊纤维、附近的纤维、消失的部分）组织成一个对象。它在三个方向上都有用：其一，Picard–Lefschetz 公式里的"消没球面"正是 RΦ 的支撑；其二，Hodge 理论的退化（极限 Hodge 结构）用它把周期映射的边界行为代数化；其三，反常层理论用它定义 middle extension（见 e-decomposition-theorem），从而把"来自几何的层"与"任意的反常层"区分开。对光滑态射 RΦ = 0，所以它精确度量了"奇异性"，这也是奇点理论中"消没上同调"的来源。',
  },
  {
    id: 'e-perverse-t-structure',
    latex: String.raw`{}^{\mathfrak p}\mathcal D^{\le 0}=\{K:\ \dim\operatorname{supp}H^i(K)\le -i\}`,
    name: '反常 t-结构',
    en: 'Perverse t-Structure',
    importance: 0.86,
    family: 'cohomology',
    summary: '在导出范畴上换一个 t-结构，使对偶性最简洁 —— 反常层的定义。',
    detail:
      '导出范畴 D^b_c(X) 自带标准的 t-结构（按次数分层），但在这个 t-结构下 Poincaré–Verdier 对偶会把次数与支撑维数混在一起，陈述很丑。Beilinson–Bernstein–Deligne–Gabber 定义了一个新的 t-结构：它的 ≤ 0 部分由"支撑维数不超过 −i 的上同调"刻画（自对偶版本用半单化条件）。得到的**反常层**范畴是 Abel 范畴，且在其中对偶是精确函子、单性与"中间扩张"有干净的定义。这不是技术游戏：反常层恰好是"来自几何的层"（相交上同调、局部系的中扩、以及它们的混合）所在的范畴，所以它把很多零散的定理统一成结构性陈述。最重要的推论是分解定理（见 e-decomposition-theorem），它也是 Kazhdan–Lusztig 猜想的几何证明（Beilinson–Bernstein）与特征 p 表示论（见 cn-lusztig）的技术基础。',
  },
  {
    id: 'e-decomposition-theorem',
    latex: String.raw`Rf_*\mathcal F\cong\bigoplus_{i}\ {}^{\mathfrak p}\!H^i(Rf_*\mathcal F)[-i]\quad(\text{semisimple})`,
    name: '分解定理',
    en: 'Decomposition Theorem',
    importance: 0.88,
    family: 'cohomology',
    summary: '真态射的推前（在适当条件下）反常地分裂成半单部分的和。',
    detail:
      'Beilinson–Bernstein–Deligne–Gabber 的分解定理：若 f: X → Y 是真态射，且 X 光滑（或有适当的纯性假设），则 Rf_* 的某个"纯"层（如常数层或相交上同调复形）分解成它的反常上同调层按次数平移的**直和**，且每一项都是半单的（即若干单反常层的直和）。它的惊人之处在于"分裂"不是形式结论 —— 一般真态射的推前不会分裂（Hodge 结构不是半单的，代数圈与 Hodge 类之间的鸿沟正是这个）。定理之所以成立，是因为所考虑的层带有 Frobenius 或权结构，而权论（Deligne）保证了半单性。它的推论极多：Hard Lefschetz 对任意真态射的推广、相交上同调的存在、Hodge 猜想在特定情形（如环面、Abel 簇的部分情形）的验证、以及模形式理论中的重数公式。',
  },
  {
    id: 'e-intersection-cohomology',
    latex: String.raw`IH^i(X)=\mathbb H^i(X,IC_X),\qquad IC_X=j_{!*}\underline{\mathbb Q}_{X_{\mathrm{reg}}}[n]`,
    name: '相交上同调',
    en: 'Intersection Cohomology',
    importance: 0.85,
    family: 'cohomology',
    summary: '给奇异空间一个满足 Poincaré 对偶的"修正上同调" —— 用反常层造出来。',
    detail:
      '奇异空间的上同调不满足 Poincaré 对偶，因为链可以"贴"在奇异集上。Goresky–MacPherson 用分层与"允许链"条件（链与每个 stratum 的相交维数受限）构造了修正后的上同调 IH^i，它满足 Poincaré 对偶与硬 Lefschetz。Beilinson–Bernstein–Deligne–Gabber 随后把它重新表述为"光滑部分上常数层的**中间扩张**" j_{!*}，从而纳入反常层框架 —— 这一步把 Goresky–MacPherson 的组合定义与层论统一起来，也使计算变得可行（用分解定理与权论）。历史上的决定性应用是 **Kazhdan–Lusztig 猜想**：他们把不可约最高权模的特征表示为相交上同调群的维数，从而把表示论化为几何（见 cn-kazhdan-lusztig）。今天它也是 Hodge 模、Springer 对应、以及特征 p 表示论的标准工具。',
  },

  /* ══════════ 四、D-模与 Riemann–Hilbert ══════════ */
  {
    id: 'e-d-module-direct-image',
    latex: String.raw`\int_f\colon D_X\text{-mod}\to D_Y\text{-mod},\qquad \int_f\mathcal M=Rf_*(D_{Y\leftarrow X}\otimes^L_{D_X}\mathcal M)`,
    name: 'D-模的推前与积分',
    en: 'Direct Image of D-Modules',
    importance: 0.80,
    family: 'modern',
    summary: 'D-模版本的推前，把沿纤维的积分代数化。',
    detail:
      'D-模理论的核心操作是推前 ∫_f（也叫直接像）：它把 X 上的 D_X-模送到 Y 上的 D_Y-模，形式上是"沿纤维取积分"，代数上通过转移模 D_{Y←X} = f*D_Y 与导出张量实现。这样构造的好处是它**自动**对应到解层（即 de Rham 复形）的推前，所以分析上的积分与代数上的张量积是一回事。它的技术难点在于 D_X 是非交换环、且作为 O_X-模只是拟凝聚而非凝聚，所以要用导出范畴与"好滤过"（good filtration）来控制。最重要的应用是证明 **Kazhdan–Lusztig 猜想**：Beilinson–Bernstein 把 g-模范畴等价到旗簇上的 D-模范畴，于是 Verma 模的合成因子问题变成反常层问题，从而可用分解定理解决（见 cn-kazhdan-lusztig）。',
  },
  {
    id: 'e-riemann-hilbert',
    latex: String.raw`\bigl\{\text{regular holonomic }D_X\text{-mod}\bigr\}\simeq\bigl\{\text{perverse sheaves on }X\bigr\}`,
    name: 'Riemann–Hilbert 对应',
    en: 'Riemann–Hilbert Correspondence',
    importance: 0.87,
    family: 'modern',
    summary: '正则全纯 D-模与反常层等价 —— 代数、分析、拓扑三者的翻译表。',
    detail:
      '经典形式（一维）：C 上带正则奇点的线性常微分方程与局部系一一对应，解空间给出单值表示。高维版本由 Kashiwara 与 Mebkhout 独立证明（1980 年代）：X 上的**正则全纯** D-模的导出范畴，等价于 X 上反常层的导出范畴，函子是"取解复形"（de Rham 复形）DR。这条对应是数学中最深刻的字典之一：左边是**微分方程**（分析/代数），右边是**层与拓扑**（几何），中间是单值表示（表示论）。"正则"这个条件不能去掉 —— 非正则的 D-模（如 exp(1/z)）对应的解在奇点处增长太快，无法用层的中等扩张描述，这一块由不规则奇点理论处理。它也是 Hodge 模理论（Saito）的出发点。',
  },
  {
    id: 'e-holonomic-d-module',
    latex: String.raw`\dim\operatorname{char}(\mathcal M)=\dim X,\qquad \operatorname{DR}(\mathcal M)\in D^b_c(X)`,
    name: '全纯 D-模',
    en: 'Holonomic D-Modules',
    importance: 0.79,
    family: 'modern',
    summary: '特征簇维数最小的 D-模 —— 解层为可构造层的那些方程。',
    detail:
      'D-模 M 的**特征簇** char(M) 是余切丛 T*X 里的一个闭子簇，它总满足 dim char(M) ≥ dim X（Bernstein 不等式）。达到等号的称为全纯（holonomic）D-模。这个条件恰好刻画了"解层是可构造层"的方程：DR(M) 是 X 上的可构造层，从而可以用反常层与相交上同调的工具研究。全纯 D-模的范畴是 Abel 范畴且对偶性良好（Verdier 对偶对应 D-模的对偶），每个全纯 D-模有有限长度与良定义的奇点支撑。它出现的自然场景极多：任何由代数方程组定义的和乐系统（例如 Gauss–Manin 联络、周期积分的方程，见 c-gauss-manin）都是全纯的，因此"周期满足全纯 D-模"这一事实正是 Hodge 理论可计算的原因。',
  },

  /* ══════════ 五、谱序列与退化 ══════════ */
  {
    id: 'e-spectral-sequence-degeneration',
    latex: String.raw`E_2^{p,q}\Rightarrow H^{p+q},\qquad d_r\colon E_r^{p,q}\to E_r^{p+r,q-r+1}`,
    name: '谱序列的退化',
    en: 'Degeneration of Spectral Sequences',
    importance: 0.81,
    family: 'cohomology',
    summary: '微分何时全部为零 —— 退化是"把滤过信息还原成直和"的唯一机会。',
    detail:
      '谱序列给出从 E_2 项收敛到极限的技术，但只有**退化**（d_r = 0 对 r ≥ 2）时才能读出具体结论：此时 E_2 ≅ E_∞，滤过的各层是 E_2^{p,q}，于是可以谈论"上同调的分次块"。判断退化是具体问题中最关键也最困难的一步，常用手段有三类：其一，用**权论**（Deligne）—— 若微分会提高权而两边权已知，则微分为零；其二，用**次数理由** —— 若 E_2 项只在两个对角线上非零，所有 d_r 必然落在零群上；其三，用**硬 Lefschetz 或 Kähler 条件** —— Kähler 流形上 Hodge–de Rham 谱序列在 E_1 就退化（见 e-hodge-to-de-rham）。这条技术在第零层的失败（Hodge 猜想）正说明"退化"能给出的信息是有限的：退化只保证分次块，不保证分次块之间有代数圈。',
  },
  {
    id: 'e-hodge-to-de-rham',
    latex: String.raw`E_1^{p,q}=H^q(X,\Omega^p_X)\Rightarrow H^{p+q}_{\mathrm{dR}}(X/\mathbb C)`,
    name: 'Hodge–de Rham 谱序列',
    en: 'Hodge–de Rham Spectral Sequence',
    importance: 0.84,
    family: 'cohomology',
    summary: '把 de Rham 上同调按 (p,q) 型分块 —— Hodge 分解的来源。',
    detail:
      'de Rham 复形带有"按微分形式次数"的自然滤过（Hodge 滤过），它的谱序列 E_1^{p,q} = H^q(X, Ω^p) 收敛到 H^{p+q}_dR(X/C)。对**紧 Kähler** 流形这个谱序列在 E_1 退化，于是 H^n_dR 带有一个分解，其分次块就是 H^q(X, Ω^p) —— 这就是 Hodge 分解 H^n = ⊕ H^{p,q} 的代数来源。代数侧：Deligne 与 Illusie 证明光滑射影簇在特征零时退化成立（用提升到 W₂(k) 与 Deligne–Illusie 定理），并给出"上同调维数在形变下不跳"的推论；正特征时退化会失败（Raynaud 的反例），这个失败正是正特征 Hodge 理论困难的表现之一。整个 Hodge 理论（Hodge 结构、周期映射、Hodge 猜想）都建立在这次退化之上。',
  },
  {
    id: 'e-frobenius-split',
    latex: String.raw`\operatorname{char}k=p,\ \exists\,\theta\colon F_*\mathcal O_X\to\mathcal O_X,\ \theta\circ F=1`,
    name: 'Frobenius 分裂',
    en: 'Frobenius Splitting',
    importance: 0.72,
    family: 'modern',
    summary: '利用特征 p 的 Frobenius 态射给正特征几何一个强力的"分裂"工具。',
    detail:
      '在特征 p 的域上，Frobenius 态射 F: X → X 是 k-线性的但非 O_X-线性，所以 F_*O_X 是 O_X-模。若存在 O_X-模映射 θ: F_*O_X → O_X 使 θ ∘ F = id，则称 X 是 Frobenius 分裂的。这个条件看起来像是"技术假设"，实际非常强：它蕴含 X 的许多上同调群消没（因为上同调被 F_* 的作用"强行"劈开），从而给出 Kodaira 消没型定理、Kawamata–Viehweg 消没、以及 Demazure 型定理在正特征的类比。它的技术价值在于正特征缺少特征零的解析工具（Kodaira 消没用调和积分证明），而 Frobenius 分裂提供了一个纯代数的替代。它在表示论上也有用：Schubert 簇与旗簇的 Frobenius 分裂是正特征表示论与 Lusztig 纲领的技术基础之一。',
  },
  {
    id: 'e-kodaira-vanishing-proof',
    latex: String.raw`L\ \text{ample},\ H^i(X,\omega_X\otimes L)=0\ (i>0)\ \Longrightarrow\ H^i(X,L^{-1})=0`,
    name: 'Kodaira 消没的证明思路',
    en: 'Proof Strategy of Kodaira Vanishing',
    importance: 0.77,
    family: 'cohomology',
    summary: '从调和积分到特征 p 的代数证明 —— 同一个定理的两种世界观。',
    detail:
      'Kodaira 消没（见 b-kodaira-vanishing）的原证明是分析的：丰饶线丛上可以放正曲率度量，Bochner–Kodaira 恒等式把调和形式分解成"曲率作用 + 拉普拉斯"两项，正曲率使第一项严格正，于是非零调和形式不存在，上同调消失。这个证明美但有局限：它只对复流形有效，且需要正曲率度量存在。代数证明由 Deligne–Illusie（特征零，用 Hodge–de Rham 退化 + 提升到 W₂）与 Raynaud（正特征，用 Frobenius 与"提升"技巧）分别给出。正特征版本尤其反直觉：Kodaira 消没在正特征**会失败**（Raynaud 反例，但需要非丰饶的"ample"型条件），说明正特征几何中"正性"与"消没"之间的联系比复几何弱得多。这条节点把分析证明与代数证明并列，是理解两个世界观差异的好例子。',
  },
  {
    id: 'e-ample-vanishing',
    latex: String.raw`\mathcal F\ \text{coherent},\ H^i(X,\mathcal F(m))=0\ \text{for}\ m\gg 0,\ i>0`,
    name: '丰饶层的高阶消没',
    en: 'Vanishing of Higher Cohomology for Ample Twists',
    importance: 0.75,
    family: 'cohomology',
    summary: '丰饶线丛的高次 twisting 最终会杀掉所有高阶上同调。',
    detail:
      'Serre 消没（见 serre-vanishing）说的是：对任意凝聚层 F，存在 m₀ 使 m ≥ m₀ 时 H^i(X, F(m)) = 0 对 i > 0 成立。这是"丰饶 = 足够正 = 上同调最终消失"这一直觉的精确形式，也是 Serre 有限性与 Serre 对偶之外的第三条基本定理。它的推论很多：Hilbert 多项式是真正的多项式（见 b-hilbert-polynomial）、Castelnuovo–Mumford 正则性有界（见 castelnuovo-mumford-regularity）、以及 Hilbert 概形的有界性（见 c-boundedness）。它也是计算上的主力：只要能验证"m 足够大"，就能把任意层放进一个有限自由预解里做计算。相对版本对丰饶线丛的族也成立，是 Grauert 定理的直接应用。',
  },
  {
    id: 'e-cohomology-finite-dim',
    latex: String.raw`X\ \text{proper over}\ k,\ \mathcal F\ \text{coherent}\ \Longrightarrow\ \dim_k H^i(X,\mathcal F)<\infty`,
    name: '上同调的有限维性',
    en: 'Finite Dimensionality of Cohomology',
    importance: 0.76,
    family: 'cohomology',
    summary: '真概形上凝聚层的上同调是有限维的 —— Euler 特征数得以定义的前提。',
    detail:
      'Serre 有限性定理（见 serre-finiteness）：k 上真概形的凝聚层，各阶上同调都是有限维 k-向量空间，且只有有限多个 i 使 H^i ≠ 0（同调维数有界）。这条看起来是"技术前提"，但它是一切**可数**不变量的基础：正因为有限维，才有 Euler 特征数 χ(F) = Σ(−1)^i dim H^i 的定义，才有 Riemann–Roch 定理的内容（见 riemann-roch、b-hirzebruch-rr），才有 Hilbert 多项式可以谈"次数与首项"。它也解释了为什么相对情形（Grauert 定理，见 e-grauert-theorem）如此重要：模空间理论需要"一致"的有限维性，而不只是每个纤维分别有限。Finite dimensionality 与 semi-continuity 合起来，给出了模空间上上同调分层（stratification）的全部理论基础。',
  },
]

/**
 * 连接。这一批的 links 密度高于平均（平均 3.4 条/节点），
 * 因为"技术枢纽"的价值恰恰在于它们之间的相互依赖：
 * 基变换依赖 Grauert，半连续性依赖基变换，分解定理依赖
 * 反常 t-结构，而反常 t-结构又依赖消没轮的权论。把这些边
 * 画出来，主星系里这一片才会显现成一个紧致的核心而非散点。
 */
export const EXTRA_E_LINKS = [
  /* ── 六函子的内部骨架 ── */
  ['e-derived-pushforward', 'e-push-pull-adjunction', 0.95, '伴随对是导出推前最基本的性质'],
  ['e-derived-pushforward', 'e-projection-formula', 0.90, '投影公式说明推前如何穿过张量积'],
  ['e-derived-pushforward', 'e-base-change-cohomology', 0.92, '基变换问的是推前与拉回交换'],
  ['e-derived-pushforward', 'derived-functor', 0.94, '导出推前是导出函子的一般构造在层上的实现'],
  ['e-derived-pushforward', 'derived-category', 0.88, '必须先在导出范畴里才能把长正合列整体化'],
  ['e-push-pull-adjunction', 'e-projection-formula', 0.82, '投影公式可由伴随与张量积的相容性推出'],
  ['e-push-pull-adjunction', 'a-pushforward-pullback', 0.90, '这是那对函子在高阶情形的精确陈述'],
  ['e-base-change-cohomology', 'a-base-change-thm', 0.93, '基变换定理的高阶与导出版本'],
  ['e-base-change-cohomology', 'e-grauert-theorem', 0.80, 'Grauert 定理保证直像凝聚，基变换才有内容'],
  ['e-base-change-cohomology', 'e-semicontinuity', 0.88, '半连续性是基变换加上 Nakayama 的直接推论'],
  ['e-grauert-theorem', 'e-semicontinuity', 0.86, '凝聚性使纤维维数只能在闭集上跳'],
  ['e-grauert-theorem', 'serre-finiteness', 0.89, '绝对有限性的相对化'],
  ['e-grauert-theorem', 'formal-functions-theorem', 0.84, '格罗滕迪克的证明走的正是形式函数定理'],
  ['e-grauert-theorem', 'e-cohomology-finite-dim', 0.85, '一个给绝对情形，一个给相对情形'],
  ['e-semicontinuity', 'e-cohomology-finite-dim', 0.78, '半连续性的值域是有限维数函数'],

  /* ── 凝聚性这条线 ── */
  ['e-coherent-sheaf', 'e-quasi-coherent-locality', 0.91, '凝聚是在拟凝聚之上加有限性条件'],
  ['e-coherent-sheaf', 'coherent-sheaf', 0.96, '与主库的凝聚层条目是同一概念的不同侧面'],
  ['e-coherent-sheaf', 'e-cohomology-finite-dim', 0.84, '有限自由预解是有限维性的来源'],
  ['e-coherent-sheaf', 'noetherian', 0.76, '诺特环上拟凝聚与凝聚合一'],
  ['e-quasi-coherent-locality', 'a-stalk', 0.82, '局部性质化为茎上的局部化'],
  ['e-quasi-coherent-locality', 'a-quasi-coherent', 0.94, '主库条目讲构造，这里讲局部刻画'],
  ['e-quasi-coherent-locality', 'structure-sheaf', 0.80, '结构层是最基本的拟凝聚层'],
  ['e-sheafification', 'e-quasi-coherent-locality', 0.74, '层化让局部数据得以整体化'],
  ['e-sheafification', 'sheaf', 0.90, '层与预层之别正是层化要补的那一块'],
  ['e-sheafification', 'grothendieck-topology', 0.83, '层化依赖所选的 Grothendieck 拓扑'],
  ['e-sheafification', 'h-flat-descent', 0.79, '下降的有效性以层化为前提'],
  ['e-sheafification', 'a-skyscraper', 0.62, '摩天大楼层是层化的简单例子'],

  /* ── 局部系与单值 ── */
  ['e-local-system', 'e-monodromy-weight', 0.90, '局部系的单值变换是权滤过的载体'],
  ['e-local-system', 'b-tate-module', 0.85, 'étale 局部系对应 ℓ-进表示'],
  ['e-local-system', 'c-d-module', 0.82, '平坦联络与局部系互为两种描述'],
  ['e-local-system', 'e-push-pull-adjunction', 0.63, '局部系的推前拉回是最好的练习例子'],
  ['e-monodromy-weight', 'c-gauss-manin', 0.84, 'Gauss–Manin 联络的单值正是权滤过的来源'],
  ['e-monodromy-weight', 'e-hodge-to-de-rham', 0.66, '权滤过与 Hodge 滤过是两种不同的分次'],
  ['e-monodromy-weight', 'e-perverse-t-structure', 0.72, '权论是反常 t-结构良定义的前提'],
  ['e-monodromy-weight', 'e-nearby-cycle-functor', 0.78, '幂零部分的对数正是特殊化映射的无穷小'],

  /* ── 退化与反常层 ── */
  ['e-vanishing-cycle', 'e-nearby-cycle-functor', 0.94, '两者由一个正合三角相连'],
  ['e-vanishing-cycle', 'e-decomposition-theorem', 0.86, '消没轮的权结构是分解定理的技术前提'],
  ['e-vanishing-cycle', 'e-monodromy-weight', 0.92, '消没轮上带幂零单值作用'],
  ['e-nearby-cycle-functor', 'e-decomposition-theorem', 0.80, '邻近轮刻画了中间扩张的取法'],
  ['e-nearby-cycle-functor', 'e-holonomic-d-module', 0.68, '全纯 D-模的奇点支撑正是邻近轮的支撑'],
  ['e-perverse-t-structure', 'e-decomposition-theorem', 0.95, '分解定理是反常 t-结构最重要的推论'],
  ['e-perverse-t-structure', 'e-intersection-cohomology', 0.90, '相交上同调是反常层的原型对象'],
  ['e-perverse-t-structure', 'c-perverse', 0.93, '主库的反常层条目与本条互补'],
  ['e-perverse-t-structure', 'c-d-module', 0.70, '两套语言通过 Riemann–Hilbert 对应相连'],
  ['e-decomposition-theorem', 'e-intersection-cohomology', 0.88, '分解定理给出相交上同调的存在与计算'],
  ['e-decomposition-theorem', 'e-hodge-to-de-rham', 0.74, '纯性假设来自权论，而权论建立在 Hodge 理论之上'],
  ['e-decomposition-theorem', 'c-fourier-mukai', 0.72, '分解定理是 Fourier–Mukai 技术常用的输入'],
  ['e-intersection-cohomology', 'c-hodge-structure-vhs', 0.70, '相交上同调带有自然的 Hodge 结构'],
  ['e-intersection-cohomology', 'motive', 0.64, '相交上同调给出的 Chow 型信息与动机相关'],
  ['e-intersection-cohomology', 'c-tt-geometry', 0.60, '相交上同调是特征 p 几何的常用工具'],

  /* ── D-模与对应 ── */
  ['e-d-module-direct-image', 'e-riemann-hilbert', 0.89, '推前与解复形的相容性是 RH 对应的函子性'],
  ['e-d-module-direct-image', 'c-d-module', 0.95, '主库条目讲基本定义，这里讲推前运算'],
  ['e-d-module-direct-image', 'e-holonomic-d-module', 0.80, '全纯条件下推前保持有限性与对偶性'],
  ['e-d-module-direct-image', 'c-gauss-manin', 0.84, 'Gauss–Manin 联络是 D-模推前的标准例子'],
  ['e-riemann-hilbert', 'c-riemann-hilbert', 0.96, '与主库条目是同一对应的两种陈述'],
  ['e-riemann-hilbert', 'e-holonomic-d-module', 0.87, '对应只在全纯且正则的部分成立'],
  ['e-riemann-hilbert', 'e-derived-pushforward', 0.70, '解复形在推前下的行为由 RH 对应给出'],
  ['e-riemann-hilbert', 'c-perverse', 0.85, '右边正是反常层'],
  ['e-holonomic-d-module', 'e-coherent-sheaf', 0.62, '好滤过给出的分次模是凝聚的'],
  ['e-holonomic-d-module', 'e-intersection-cohomology', 0.70, '解层为相交上同调复形'],

  /* ── 谱序列与消没 ── */
  ['e-spectral-sequence-degeneration', 'e-hodge-to-de-rham', 0.93, 'Hodge 分解正是这个谱序列退化的结果'],
  ['e-spectral-sequence-degeneration', 'a-spectral-sequence', 0.94, '主库条目讲构造，这里讲何时退化'],
  ['e-spectral-sequence-degeneration', 'a-hypercohomology', 0.80, '超上同调的谱序列是最常遇到的一类'],
  ['e-spectral-sequence-degeneration', 'a-leray-ss', 0.84, 'Leray 谱序列的退化条件同样关键'],
  ['e-hodge-to-de-rham', 'hodge-decomposition', 0.95, 'Hodge 分解是这次退化的直接产物'],
  ['e-hodge-to-de-rham', 'hodge-theory', 0.90, '整个 Hodge 理论建立在这条退化之上'],
  ['e-hodge-to-de-rham', 'a-hodge-de-rham', 0.88, '主库的 Hodge–de Rham 谱序列条目'],
  ['e-hodge-to-de-rham', 'a-cartier-divisor', 0.55, '正特征退化失败与提升问题相关'],
  ['e-frobenius-split', 'e-kodaira-vanishing-proof', 0.80, 'Frobenius 分裂给出正特征消没的代数证明'],
  ['e-frobenius-split', 'e-ample-vanishing', 0.62, '分裂条件常用来推出高阶消没'],
  ['e-frobenius-split', 'h-flat-descent', 0.58, 'Frobenius 结构在平坦下降下的行为是技术难点'],
  ['e-frobenius-split', 'c-perfectoid', 0.70, '完美胚空间正是让 Frobenius 可逆的构造'],
  ['e-kodaira-vanishing-proof', 'b-kodaira-vanishing', 0.96, '同一消没定理的证明方法讨论'],
  ['e-kodaira-vanishing-proof', 'e-hodge-to-de-rham', 0.78, '代数证明以 Hodge–de Rham 退化为输入'],
  ['e-kodaira-vanishing-proof', 'hodge-theory', 0.68, '调和积分路线是 Hodge 理论的分析半边'],
  ['e-ample-vanishing', 'serre-vanishing', 0.95, '这就是 Serre 消没定理的另一表述'],
  ['e-ample-vanishing', 'castelnuovo-mumford-regularity', 0.80, '正则性有界性由高阶消没给出'],
  ['e-ample-vanishing', 'b-hilbert-polynomial', 0.78, 'Hilbert 多项式是多项式，依赖高阶消没'],
  ['e-ample-vanishing', 'e-cohomology-finite-dim', 0.72, '有限维性使 Euler 特征数有意义'],
  ['e-cohomology-finite-dim', 'serre-finiteness', 0.95, '与主库条目是同一有限性定理'],
  ['e-cohomology-finite-dim', 'riemann-roch', 0.82, 'Euler 特征数是 Riemann–Roch 的左边'],
  ['e-cohomology-finite-dim', 'euler-characteristic', 0.85, '有限维性是 Euler 特征数可定义的前提'],
  ['e-cohomology-finite-dim', 'c-boundedness', 0.66, '有界性问题的技术基础是有限维性'],
]

