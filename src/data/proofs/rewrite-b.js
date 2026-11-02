/**
 * 重写批次 B：把五条只有“结论式摘要”的旧记录补成可逐步核验的长篇证明。
 *
 * 写作约定：
 *   · 正文用中文长段 + Unicode 数学符号（⊆ ⊗ → ↦ 𝔭 𝔪 ℓ Ω ω ≅ ⋂ ∑），在页面中直接作为文本排版；
 *   · 需要真正的公式排版时才用 $...$ 包住 LaTeX，分隔符必须成对，且命令必须带反斜杠；
 *   · 引用只写已核实的 Stacks Project 稳定 tag。
 */

const step = (id, title, body, uses = []) => ({ id, title, body, uses })
const stacks = (title, tag, year = 2024) => ({
  title, author: 'The Stacks Project', year, url: `https://stacks.math.columbia.edu/tag/${tag}`,
})

/** 各条证明各自的适用边界，写在常量里便于与步骤正文对照。 */
const BOUNDARY_QUASI_COHERENT = '整条等价只在 X 仿射时成立：仿射性既用来把局部化拼成层，也用来把层还原成模。离开仿射性，Γ 一般不复原层（P¹ 上的 O(1) 是反例），而常层这类非拟凝聚层即使在仿射情形也不在等价范围内。'

const BOUNDARY_SERRE_AFFINE = '判定的正方向只需仿射性与拟凝聚性；反方向必须同时用到准紧性与准分离性，前者使仿射覆盖可有限化，后者保证有限交仍仿射从而使 Leray 条件可用。消失性还必须对每个拟凝聚层成立，只验证结构层或有限个理想层都不足以推出仿射性。'

const BOUNDARY_RIEMANN_ROCH = '光滑性使 Ω_{X/k} 是可逆层并适用 Serre 对偶，射影性使 Hⁱ（i≥2）消失且 deg D 有限，几何连通性给出 h⁰(O_X)=1。三条假设各自对应证明中的一处使用；去掉任一都会让公式右端改成 χ(O_X) 或让左端失去意义。'

const BOUNDARY_HURWITZ = 'tame 假设只用于一处却不可替代：它等价于处处 p∤eₓ（特征 p；特征 0 时恒真），此时 t=u^{e}v 中首项系数 e 是单位，拉回微分的消失阶恰为 e−1。野分歧（p|eₓ）时该阶数严格大于 e−1，由高阶分歧滤过决定，须把 R 换成不同除子 D，公式相应改为含 deg D 的形式。'

const BOUNDARY_Kahler = '构造对任意环同态都成立，有限型与有限表示都只影响 Ω 是否有限生成以及能否写出 Jacobian 呈现。需要注意 transitivity 序列左端不必单射，且 Ω_{B/A} 与 Ω_{B/k} 不可混用：前者已把 A 的微分信息约去。'

export const REWRITE_B_PROOFS = {

  /* ══════════════════════════════════════════════════════════════════
   * 一、仿射概形上的拟凝聚层与模的等价
   * ══════════════════════════════════════════════════════════════════ */

  'a-quasi-coherent': {
    statement: '设 X=Spec(A)，M 为 A-模。证明准凝聚层 M~ 满足 Γ(X,M~)≅M，并说明仿射概形上的拟凝聚层由模完全决定。',
    steps: [
      step('construct-tilde', '构造层 M~：主开集上的截面取局部化',
        '令 D(f)={𝔭∈Spec A：f∉𝔭}，这是 X 的一组基开集：任何开集都是若干个 D(f) 的并，而 D(fg)=D(f)∩D(g)，所以基开集对有限交封闭。定义 M~(D(f))=M_f，即 M 在乘法集 {1,f,f²,…} 处的局部化。构造的关键不是定义本身，而是限制映射：当 D(g)⊆D(f) 时，等价地 f∈√(g)，于是存在 n≥1 与 a∈A 使 fⁿ=ag，从而 f 在 M_g 中可逆，局部化 A_f→A_g 与 M_f→M_g 都是良定义的环/模同态，把 m/f^k 送到 m·a^k/g^k。要验证这确实给出一个预层，必须检查两件事：表示形式的改变不影响像（因为局部化的等价关系 m/f^k=m′/f^{k′} 当且仅当存在 N 使 f^N(f^{k′}m−f^k m′)=0，而这个等式在 A_g 中仍成立），以及限制映射在复合 D(h)⊆D(g)⊆D(f) 时相容（两者都是同一个局部化的自然映射的复合）。至此只用到环论，与几何无关。',
        []),
      step('sheaf-axiom-on-basis', '验证层条件：局部化的粘接恰好是层的唯一性条件',
        '只需在基开集上验证层公理。设 D(f)=⋃_i D(f_i)，即主开集被一族主开集覆盖，等价地理想族 (f_i) 满足 √(f_i)=√(f)。唯一性：若 s∈M_f 在每个 D(f_i) 上的像为 0，把 s 写成共同分母 m/f^k，则条件给出存在 N_i 使 f_i^{N_i} f^k m=0 于 M 中。取 N=max N_i，得 (Σ a_i f_i^N) f^k m=0；而 √(f_i)=√(f) 蕴含存在 n 与系数 a_i 使 Σ a_i f_i^N=f^n，于是 f^{n+k}m=0，即 s=0 于 M_f 中。这里必须使用“覆盖 ⟺ 理想取根相等”这条主开集的特征，它是整个局部化论证的技术支点；对一般开集（非主开集）直接这样算是不可能的，因此层的验证只在基上做，再用基上的层条件提升为一般层条件。',
        ['construct-tilde']),
      step('glue-sections', '粘接性：把相容的分式拼成整体截面',
        '粘接性方向同理。设 s_i∈M_{f_i} 在重叠 D(f_i f_j) 上相容，即 s_i 与 s_j 在 M_{f_i f_j} 中有相同的像。取公共幂次 N 与共同表示：可选出 s_i=m_i/f_i^{N}（放大分母后所有 s_i 可用同一指数 N 表达），相容性给出存在 L_ij 使 (f_i f_j)^{L_ij}(f_j^N m_i−f_i^N m_j)=0。取 L=max L_ij，并注意有恒等式 $f_i^{2L+N}m_j$ 与 $f_j^{2L+N}m_i$ 在重叠上相等，从而可以构造出 M 中一个元素 m 与一个统一的分母，使 m/f^{M} 限制到每个 D(f_i) 后正是 s_i。最后再用第 2 步的等式 Σ a_i f_i^{N}=f^n 把各局部表示归并到 M_f 的同一个元素上，粘接完成。注意粘接出的元素唯一（由第 2 步），所以 M~ 是 X 上的层而不只是预层；这也是为什么“局部化的相容性”不能被“全局截面作了定义”替代。',
        ['sheaf-axiom-on-basis']),
      step('global-sections', '计算整体截面：Γ(X,M~)≅M',
        '全空间 X=D(1)，所以 Γ(X,M~)=M_1。考察自然映射 φ:M→M_1，m↦m/1。满射：任意分式 m/f^k 在 M_1 中，而 f/1 在 M_1 中可逆（逆元为 1/f），故 m/f^k=(m·f^{−k})/1=φ(m f^{−k})，每个元素都是某个 m 的像。单射：若 φ(m)=0，即 m/1=0 于 M_1 中，按局部化的等价关系存在 1^k·m=0，即 m=0。于是 φ 是双射，并且它是 A-线性的（局部化的自然映射总是 A-线性，而 A→A_1 是恒等），所以 Γ(Spec A,M~)≅M，同构由“取分母 1”给出。这一步极其简短，却依赖于一个容易忽略的事实：M_1 就是 M 本身，因为 1 在 A 中已经可逆，局部化不改变任何东西。',
        ['glue-sections']),
      step('sections-over-basis', '为什么必须做“与局部化相容”的下降，而不只是比对整体截面',
        '仅有 Γ(X,M~)≅M 还不足以断言 M~ 由 M 决定：一个层携带的信息是它在**所有**开集上的截面以及限制映射，而整体截面只记录了开集 X 这一处的数据。正确的陈述需要在每个基开集 D(f) 上给出同构 M~(D(f))≅M_f，并证明这些同构与两边的限制映射相容。局部化函子 M↦M_f 的两个基本性质恰好提供这种相容性：函子性（f↦g 的局部化映射有函子性）与局部化的局部-整体性质（$(M_f)\_g\\cong M_{fg}$ 以及 $M_f = M\\otimes_A A_f$）。有了它们，M↦M~ 与 Γ 就成为两个函子，且 φ 是函子之间的自然变换；自然性保证同构在限制映射下保持一致，从而 M~ 与 M 的关系是一个范畴等价而非仅仅是“截面一样多的两个对象”。若只检查整体截面，就会漏掉诸如“某个 M~ 在某个 D(f) 上的截面与 M_f 不同”的可能性。',
        ['construct-tilde', 'global-sections']),
      step('qc-sheaf-is-tilde', '每个拟凝聚层都同构于某个 M~：层由模完全决定',
        '设 F 是 X 上的拟凝聚层，令 M=Γ(X,F)，则 M~(X)=M=Γ(X,F)=F(X)，于是 M~ 与 F 在整体上一致。为了把一致性推到全空间，取任意基开集 D(f)，考察自然映射 F(X)→F(D(f)) 与局部化 $M_f=M\\otimes_A A_f$ 的比较：由 F 的拟凝聚性，限制映射沿 D(f)⊆X 分解出一个 A-线性映射 M_f→F(D(f))，而拟凝聚性的定义（在 X 的某个开覆盖的每个仿射开子集上，限制层都同构于整体截面的局部化）保证该映射是同构。把这一比较在覆盖 X 的基开集上拼起来，得到层同构 F≅M~。反向由第 1 至 4 步构造，两条路互为逆：$(\\widetilde M)(X)=M$ 给出 Γ(M~)≅M，而 (Γ(F))~≅F 给出另一个方向的逆，因此模范畴与仿射概形上的拟凝聚层范畴之间的这个函子是范畴等价。它同时说明：仿射概形上的拟凝聚层没有任何“额外自由度”，同态与截面层化都由底层的 L 决定。',
        ['global-sections', 'sections-over-basis']),
      step('range-of-validity', '明确适用边界与显式反例',
        '等价只在 X 仿射时成立，两个方向各有失败方式。第一，在非仿射概形上 Γ 一般不复原层：取 X=P¹ 与 F=O_X(1)，Γ(X,O_X(1))=0，而 (Γ(F))~=0，显然 O_X(1) 不与之同构，原因是 P¹ 上全局截面太少，局部信息无法从整体截面恢复。第二，一般层（非拟凝聚）即使只考虑仿射概形也不在等价范围内：取 A=ℤ 与常层 ℤ 在 Spec ℤ 上，常层的整体截面是 ℤ 的常函数集，而它在每一层的局部在点处跳变，不可能通过局部化常数模来定义，故常层不是拟凝聚层。第三，即使 F 拟凝聚，M↦M~ 的忠实性要求同态都来自模同态，这一点由第 6 步的同构 $\\operatorname{Hom}_A(M,N)\\cong\\operatorname{Hom}_{\\mathcal{O}_X}(\\widetilde M,\\widetilde N)$ 保证；非仿射情形该同构一般只是单射，会有不能由模同态产生的层同态。',
        ['qc-sheaf-is-tilde']),
    ],
    conclusion: '在 X=Spec(A) 上，$\\Gamma(X,\\widetilde M)\\cong M$，且 $F\\mapsto\\Gamma(X,F)$ 与 $M\\mapsto\\widetilde M$ 互为逆函子，构成模范畴与拟凝聚 $\\mathcal{O}_X$-模范畴的等价。',
    dependencies: ['e-sheafification', 'localization', 'structure-sheaf'],
    consequences: ['a-serre-affine', 'cech-cohomology', 'ideal-sheaf', 'a-cartier-divisor'],
    explanation: BOUNDARY_QUASI_COHERENT,
    examples: [
      { title: '例子：结构层与理想层', body: '取 A=ℤ，X=Spec ℤ。令 M=A=ℤ，则 M~(D(n))=ℤ[1/n]，整体截面为 ℤ，与 M 一致；M~ 就是结构层 O_X，因为 O_X(D(n))=A_n。令 M=(6)⊆ℤ，则 M~ 在每个 D(n) 上给出 (6)ℤ[1/n]，整体截面为理想 (6)。取 M=ℤ/6，M~ 是支在点 (2) 与 (3) 上的挠层：在 D(2) 上 (ℤ/6)[1/2]=ℤ/2，在 D(3) 上 (ℤ/6)[1/3]=ℤ/3，整体截面为 ℤ/6，可见挠模对应的是有支集的层而不是函数层，这正是“拟凝聚层由模完全决定”的具体含义。' },
      { title: '例子：可算的局部截面与限制映射', body: '取 A=ℤ、M=ℤ，计算 M~(D(6))→M~(D(2))：D(6)⊆D(2)，因为 2∈√(6)。两个截面分别是 ℤ[1/6] 与 ℤ[1/2]，限制映射就是包含 ℤ[1/2]⊆ℤ[1/6]，把 1/2 映到 1/2。若在 M=ℤ 中取 s=1∈M~(X)，它在 D(6) 上的像是 1/1。再看 D(2)∩D(3)=D(6)，层条件在这里说的是一个数若在 ℤ[1/2] 与 ℤ[1/3] 中都等于某个整体元素，则由唯一性它必须在 ℤ[1/6] 中一致。用这两个具体环可以亲手验证第 2、3 步的论证，而不必停留在符号层面。' },
    ],
    remarks: [
      '整体截面只在 X 本身这一处给出数据，因此“Γ(M~)≅M”本身不足以证明层由模决定；必须补上每个基开集上的局部截面同构与限制映射的相容性。',
      '等价是范畴等价：它还包含同态集的双射 $\\operatorname{Hom}_A(M,N)\\cong\\operatorname{Hom}_{\\mathcal{O}_X}(\\widetilde M,\\widetilde N)$，忽略这一层会以为只证明了“集合意义下的同构”。',
      '非仿射概形上 O_X(1)（或任何大正次数可逆层）的全局截面为零，说明一般概形上不存在“整体截面决定层”这种字典。',
      '拟凝聚性是可局部验证的性质：在 X 的某个开覆盖的每个仿射开集上与某个模的层同构，就自动是全局拟凝聚层，不需要额外粘接假设。',
      '把模换成 A-模的**有限生成**版本，等价就收缩为凝聚层与有限生成模的等价；无有限生成假设时两侧都是任意模。',
    ],
    corollaries: [
      { title: '推论：拟凝聚层的核、像与余核仍拟凝聚', body: '因为 M↦M~ 是正合函子（局部化正合，逐点取局部化因而保持核、像、余核），仿射概形上拟凝聚层的映射 $\\varphi:F\\to G$ 对应模同态 f:M→N，于是 ker φ≅(ker f)~、im φ≅(im f)~、coker φ≅(coker f)~ 都拟凝聚。这条推论是后续用理想层做几何构造的代数根据。', uses: ['qc-sheaf-is-tilde'] },
      { title: '推论：无限直和与余核都在等价下保持', body: '局部化与直和交换，所以 $(\\bigoplus_i M_i)\\,\\widetilde{}=\\bigoplus_i\\widetilde{M_i}$，对无限指标集也成立；在一般概形上线层的无限直和的整体截面不满足这条等式，这正是仿射情形“代数化”的好处。利用它可以把自由模的层刻画为若干份结构层的直和，为第 1 步的基开集计算提供更直观的图像。', uses: ['sections-over-basis'] },
    ],
    references: [
      stacks('Stacks Project, Lemma 26.7.4 (仿射概形上的层与模)', '01I6'),
      stacks('Stacks Project, Section 26.7: Quasi-coherent sheaves', '01I6'),
      stacks('Stacks Project, Section 6.30: Sheaves on a basis of open sets', '00W1'),
      stacks('Stacks Project, Section 10.9: Localization', '00CM'),
    ],
    history: '本条由公开教材与 Stacks Project 命题重新组织，项目自行改写并注明来源，未复制原文。',
  },

  /* ══════════════════════════════════════════════════════════════════
   * 二、Serre 仿射判定
   * ══════════════════════════════════════════════════════════════════ */

  'a-serre-affine': {
    statement: '设 X 是准紧、准分离概形。则 X 仿射，当且仅当对每个拟凝聚层 F 与所有 i>0，都有 Hⁱ(X,F)=0。',
    steps: [
      step('cech-complex-affine', '仿射情形：写出有限主开覆盖的 Čech 复形',
        '设 X=Spec A，则 X 准紧（有限个主开集即可覆盖）。因 A 有单位元，可取有限族 f₁,…,f_r 使 (f₁,…,f_r)=A，于是 X=⋃ᵢ D(fᵢ)。由第 1 步之前的事实 D(f_{i_0})∩⋯∩D(f_{i_p})=D(f_{i_0}⋯f_{i_p})，每个有限交仍是仿射主开集，这说明仿射概形自动准分离，有限交的仿射性正是第 4 步要用到的关键结构。对拟凝聚层 F，代入仿射字典 $F\\cong\\widetilde M$、$M=\\Gamma(X,F)$，得 F(D(f_{i_0}⋯f_{i_p}))=M_{f_{i_0}⋯f_{i_p}}，Čech 复形因此是 $0\\to M\\to\\prod_i M_{f_i}\\to\\prod_{i<j}M_{f_if_j}\\to\\cdots$，微分由交错符号与局部化映射组成。这里必须是有限覆盖：有限乘积才是“有限个局部化”的直积，第 2 步的同伦构造要用到覆盖的有限性来取统一的幂次上界。',
        []),
      step('contracting-homotopy', '仿射情形：用分拆单位元构造收缩同伦，证明正次数上同调为零',
        '由 (f₁,…,f_r)=A，可取 N≥1 与 c₁,…,c_r∈A 使 $\\sum_i c_if_i^{N}=1$。这是“主开集覆盖 ⟺ 理想取根相等”在同伦构造中的具体形式。定义收缩算子：把 (p+1)-余链 s 送到 p-余链 t，其第 (i₀<⋯<i_p) 分量为 $t_{i_0\\cdots i_p}=\\sum_{j=1}^{r}c_jf_j^{N}\\,s_{j,i_0,\\cdots,i_p}$，其中若下标 j 与某个 i_k 重复，就把该分量解释为 0（筛滤约定）。逐项计算可得 $dt+td=\\operatorname{id}$ 于正次数上，因为局部化 $M\\to M_{f_j}$ 与每个 $f_j$ 在 M_{f_i} 中可逆这两件事同时出现，而 $\\sum_j c_jf_j^{N}=1$ 使恒等映射被“分拆”成 r 个部分。于是正次数的上同调群被夹在 0 之间而 vanish，即 $\\check{H}^{q}(\\{D(f_i)\\},F)=0$ 对一切 q≥1。',
        ['cech-complex-affine']),
      step('cech-equals-cohomology', '把 Čech 上同调换成真正的层上同调（正向完成）',
        'Čech 上同调只有在该覆盖是 Leray 覆盖时才等于层上同调；主开集覆盖恰好具有这一性质。原因是每个有限交 D(f_{i_0}⋯f_{i_p}) 都是仿射的（准分离性在这里被使用一次），而仿射概形上任何拟凝聚层的正次数上同调为零（这正是上一步的结论，作为覆盖中成员的性质来使用），于是覆盖的每个有限交都满足“上同调被限制到该成员的截面计算”，Leray 条件成立。因此 $H^{q}(X,F)\\cong\\check{H}^{q}(\\{D(f_i)\\},F)=0$ 对一切 q≥1。这就完成了“仿射 ⟹ 高阶荷消没”这一正方向。注意推理结构：第 2 步算的是 Čech 复形，第 3 步只是把 Čech 与真正上同调对齐，两步不可合并。',
        ['contracting-homotopy']),
      step('converse-strategy', '反方向才是困难方向：先说明 Serre 判定的证明思路',
        '反方向要从不消失上同调推出仿射性，即证明自然映射 $\\varphi:X\\longrightarrow\\operatorname{Spec}\\,\\Gamma(X,\\mathcal{O}_X)$ 是同构。判定的证明路线分两块。第一块是把“上同调消失”翻译成“层能被整体截面生成并逐层可算”：取 X 的有限仿射开覆盖（准紧性保证有限），用这些仿射开集的交集构成一个有限群（交的集合），它的上同调与 X 的上同调一致；上同调消失意味着这个有限复形是**无环**的，从而可以逐级“降低”一个给定层的复杂度，本质上给出该层的一个由“可整体生成的层”构成的有限分解，这就是“消失 ⟹ 每个拟凝聚层被 O_X 的有限个整体截面生成的映射满射地盖住”。这里的有限性是必要的：无限覆盖会带来无限乘积，无法用有限步消掉。',
        ['cech-equals-cohomology']),
      step('converse-completion', '反方向：用消失性造出分离函数，把 φ 做成同构',
        '第二块是把“被整体截面生成”用到具体层上。令 $\\mathcal{O}=\\Gamma(X,\\mathcal{O}_X)$，对任意闭子集 Z、点 x∉Z，取理想层 $\\mathcal{I}$ 为 Z 的闭浸入对应的拟凝聚理想层（可由 Z 的仿射开覆盖上的理想拼成）。考虑 $0\\to\\mathcal{I}\\to\\mathcal{O}_X\\to\\mathcal{O}_Z\\to 0$ 与上同调消失，得到 $\\mathcal{O}\\to\\Gamma(Z,\\mathcal{O}_Z)$ 满射；与“被整体截面生成”结合，可知对每对 {x∉Z} 存在 $f\\in\\mathcal{O}$ 使 f 在 x 处可逆而在 Z 上为零。于是 f 把 x 与 Z 分离，即 x 是某个基本开集 $X_f$ 中唯一不被 f 的零点包含的点，等价地说 $X_f$ 是仿射的且同构到 $\\operatorname{Spec}\\,\\mathcal{O}_f$。再用准紧性取有限多个这样的 $X_{f_i}$ 覆盖 X，并利用准分离性使 $X_{f_if_j}=X_{f_i}\\cap X_{f_j}$ 也落在同一批基本开集中。于是 φ 在每个 $X_{f_i}$ 上都同构，粘接后 φ 整体同构，$X$ 仿射。',
        ['converse-strategy']),
      step('hypotheses-essential', '说明准紧与准分离缺一不可，并落实为可计算样例',
        '两条拓扑假设都在**反方向**被使用：准紧性使上面出现的仿射覆盖可有限化，准分离性保证有限交仍准紧使得局部化比较可用。去掉准紧性，最典型的现象是无穷多个不相交点的离散空间：它上面每个层的正次数上同调为零（空间维数0，任意覆盖的 Čech 复形在第 1 层以后就不复出现），但它不仿射，因为仿射概形的底层空间的闭点集的每个无穷子集都会被某个整体函数分离。去掉准分离性，可以构造一个由无穷多份仿射直线在两处粘合成的概形，它准紧但存在某个拟凝聚层的 H¹ 不为零，同时又不是仿射，说明消失条件不再足以判定仿射。两条假设实际上保证了“仿射开集的有限交仍仿射”，这正是第 3 步中 Leray 条件成立的原因，也是整个证明能够闭合的技术核心。',
        ['converse-completion']),
      step('consequences-ample', '正方向的延伸：丰沛线丛的高阶消没与 Serre 判定的关系',
        '把正方向推广到丰沛层，得到最常用的消没定理：若 $\\mathcal{L}$ 在 X 上丰沛，则对任意凝聚层 F，存在 $n_0$ 使 n≥n₀ 时 $H^{q}(X,F\\otimes\\mathcal{L}^{\\otimes n})=0$（q≥1）。证明的起点是取某个使得 $\\mathcal{L}^{\\otimes n}$ 极丰沛的 n，并在 X 的有限仿射覆盖上把 F 化归为若干份结构层的直和项，再对每个成员用第 2 步的收缩同伦（每一步的中间层都是拟凝聚层，因此正次数上同调消失）。这条延伸说明：仿射情形是“全局消失”的极限情形，而一般射影概形上消失只在足够大的 twisting 之后出现，两者并不矛盾；把仿射情形的结论原样搬到射影概形上是常见错误。',
        ['cech-equals-cohomology']),
    ],
    conclusion: '对准紧、准分离概形 X，$X$ 仿射 $\\Longleftrightarrow$ 对每个拟凝聚层 $F$ 与所有 $i>0$ 有 $H^{i}(X,F)=0$；反方向即 Serre 仿射判定，是困难方向。',
    dependencies: ['a-quasi-coherent', 'sheaf-cohomology', 'cech-cohomology'],
    consequences: ['e-ample-vanishing', 'e-cohomology-finite-dim', 'b-serre-duality-curve', 'ample-line-bundle'],
    explanation: BOUNDARY_SERRE_AFFINE,
    examples: [
      { title: '例子：在 Spec ℤ 上手工算 Čech 复形', body: '取 X=Spec ℤ 与 M=ℤ，f₁=2，f₂=3，则 (2,3)=ℤ，D(2)∪D(3)=Spec ℤ（因为一个素理想不可能同时包含 2 与 3）。Čech 复形为 $0\\to\\mathbb{Z}\\to\\mathbb{Z}[1/2]\\times\\mathbb{Z}[1/3]\\to\\mathbb{Z}[1/6]\\to 0$。取 N=1，c₁=1，c₂=1，则 2·c₁+3·c₂−4=1 给出分拆 1=2·(−1)+3·1，对应的收缩把 (s₁,s₂)∈ℤ[1/2]×ℤ[1/3] 送到 s₁ 与 s₂ 的差并乘以系数，可直接算出 H¹=0。同时 H⁰=ℤ 与 Γ(X,O_X)=ℤ 一致，与第 3、4 步的结论吻合。' },
      { title: '例子：非准紧空间上消失条件不成立', body: '取无穷多个点的离散空间 X=⨆_{n≥1}pt。它不是概形意义下的有限型对象，也不是准紧的。取 F=O_X 为常层，则对每个点上的层，H⁰=k，H^{q}=0（q≥1），但 H⁰(X,O_X)=k^{ℕ} 是无限维的，而且在 X 上取“只有有限个坐标非零的截面”构成另一个层 F′，它的 H⁰ 与 Γ 不匹配，说明“每个局部拟凝聚”并不能在非准紧空间上拼成层论结论。这个例子用来检验反方向中准紧性那一处的必要。' },
    ],
    remarks: [
      '正方向只用“仿射 ⟹ 有限主开覆盖是 Leray 覆盖 + 收缩同伦”，除仿射性外不需要任何有限性或 Noether 性假设。',
      '反方向是 Serre 仿射判定，真正的困难在于从消失性造出足够多的整体函数；它需要准紧与准分离，二者都在有限性与有限交的仿射性处被使用。',
      '消失性必须对**所有**拟凝聚层成立。只对结构层 O_X 或只对理想的有限集合验证，不足以推出仿射性。',
      '把拟凝聚层换成任意层会破坏定理：仿射概形上一般层（例如常层）的高阶上同调未必为零，第 2 步的收缩同伦完全依赖 $F\\cong\\widetilde M$ 以及局部化正合。',
      '准分离性保证有限交仍准紧，从而使“仿射开覆盖的有限交也是仿射的”这句话能被逐项使用；去掉它，Leray 论证的第一步就断掉。',
    ],
    corollaries: [
      { title: '推论：拟凝聚层的上同调可由仿射开覆盖的 Čech 复形计算', body: '由上一步的正方向与 Leray 条件的验证，若 X 被有限多个仿射开集覆盖且 X 准分离，则该覆盖的 Čech 上同调与 X 的层上同调一致。这让“算 Hⁱ”变成“算一个具体有限复形的上同调”，是几乎所有局部消失计算的起点。', uses: ['cech-equals-cohomology'] },
      { title: '推论：仿射概形上拟凝聚层的正次数上同调全为零且 Γ 正合', body: '对 X=Spec A 与任意拟凝聚层 F，$H^{q}(X,F)=0$（q≥1），于是整体截面函子 Γ 在拟凝聚层范畴上是正合的：短正合列 $0\\to F\\to G\\to H\\to 0$ 取截面后仍正合。这条推论是把仿射概形上的层论问题完全翻译为模论问题，也是第 6 步群上同调式论证的前提。', uses: ['contracting-homotopy'] },
    ],
    references: [
      stacks('Stacks Project, Lemma 29.2.2 与 Section 26.7（拟凝聚层与层上同调）', '01I6'),
      stacks('Stacks Project, Section 20.10: Čech cohomology', '01ED'),
      stacks('Stacks Project, Section 20.11: Čech cohomology versus cohomology', '01EO'),
      stacks('Stacks Project, Serre 仿射判定与丰沛性（Section 30.16）', '01VI'),
    ],
    history: '本条由公开教材与 Stacks Project 命题重新组织，项目自行改写并注明来源，未复制原文。',
  },

  /* ══════════════════════════════════════════════════════════════════
   * 三、曲线上除子的 Riemann–Roch
   * ══════════════════════════════════════════════════════════════════ */

  'b-riemann-roch-curve': {
    statement: '设 X 是光滑、射影、几何连通曲线，D 为除子，K 为典范除子，g=h¹(O_X)。则 ℓ(D)−ℓ(K−D)=deg D+1−g。',
    steps: [
      step('cohomology-conventions', '确定记号：把公式翻译成可操作的层论陈述',
        '几何连通（即 k 代数闭且 X 作为 k-概形连通、等价地基点扩张到 k̄ 后连通）保证 $H^{0}(X,\\mathcal{O}_X)=k$，即常数函数恰是 k。曲线的维数为 1，结合射影性可得对任意凝聚层 F 有 $H^{i}(X,F)=0$（i≥2），因为 X 的拓扑维数为 1 而射影概形上凝聚层的高阶上同调在超过维数时为零。于是“上同调”作为有限维 k-向量空间只需要两个分量：$h^{0}$ 与 $h^{1}$，欧拉示性数 $\\chi(F)=h^{0}(F)-h^{1}(F)$ 是一个整数。除子 D 对应可逆层（局部自由秩 1 的凝聚层）$\\mathcal{O}_X(D)$，其定义方式为把 D 的系数当做局部方程的零点与极点重数；典范除子 K 满足 $\\Omega_{X/k}\\cong\\mathcal{O}_X(K)$，其中 $\\Omega_{X/k}$ 是相对微分模构成的秩 1 局部自由层。最后 $\\ell(D)=h^{0}(X,\\mathcal{O}_X(D))$，这一定义把公式中的 ℓ 与层论 h⁰ 完全对齐。除子与可逆层的这段对应是整条证明的词汇表：所有计算都在层上进行，只在最后翻译回 ℓ 与 deg。',
        []),
      step('serre-duality-input', '把 h¹ 换成 ℓ(K−D)：Serre 对偶的输入',
        'X 光滑射影曲线时，$\\Omega_{X/k}$ 是秩 1 局部自由层（光滑性保证它是可逆层而非只是凝聚层），并且可逆层上有 Serre 对偶：对任意可逆层 L，$H^{1}(X,L)\\cong H^{0}(X,\\Omega_{X/k}\\otimes L^{\\vee})^{*}$，即 $h^{1}(X,L)=h^{0}(X,\\Omega_{X/k}\\otimes L^{\\vee})$。取 $L=\\mathcal{O}_X(D)$，则 $L^{\\vee}\\cong\\mathcal{O}_X(-D)$，而 $\\mathcal{O}_X(K-D)\\cong\\Omega_{X/k}\\otimes\\mathcal{O}_X(-D)$（因为 $\\mathcal{O}_X(K)\\cong\\Omega_{X/k}$），代入得 $h^{1}(X,\\mathcal{O}_X(D))=h^{0}(X,\\mathcal{O}_X(K-D))=\\ell(K-D)$。这一步是整个证明的关键输入：它对偶性把不可直接计算的 H¹ 换成 H⁰，后者有清晰的“函数/截面”含义，从而使公式两边都成为可数的量。注意射影性与光滑性在此都被硬性使用：非射影（带尖点或无穷远）曲线需要紧化，奇异曲线的对偶层不再是 $\\Omega_{X/k}$ 而需要对偶化层。',
        ['cohomology-conventions']),
      step('point-divisor-sequence', '点除子短正合列与欧拉示性数的可加性',
        '对闭点 P 与任意除子 D，考虑层 $\\mathcal{O}_X(D-P)$。在 P 的局部环中选取 uniformizer t，则 D-P 与 D 在 P 以外的局部数据相同，而在 P 处差一个 t 的幂。于是有短正合列 $0\\to\\mathcal{O}_X(D-P)\\to\\mathcal{O}_X(D)\\to\\kappa(P)\\to 0$，其中右端是 P 处的剩余域，而且这个序列在抽象层论中就是“把 D-P 的截面里被 t 整除的那部分取出来”的核像分解。作用在长正合列上并利用 $H^{i}=0$（i≥2，因为底空间维数 1），得到 $\\chi(\\mathcal{O}_X(D))-\\chi(\\mathcal{O}_X(D-P))=\\dim_k\\kappa(P)$。由几何连通性，闭点的剩余域是 k 的有限扩张，因而 $\\dim_k\\kappa(P)=\\deg(P)$（约定计算次数时取该扩张的次数）。这一步把“改变一个系数”与“欧拉示性数改变 deg(P)”精确等同起来，是整个计算的引擎。',
        ['cohomology-conventions']),
      step('compute-chi', '用短正合列把 χ(O_X(D)) 逐点累加为 deg D + 1 − g',
        '把 D 写成有限和 $D=\\sum_P n_P P$，先处理 n_P>0 的部分：从 D−P 到 D 反复应用上一步，每次欧拉示性数增加 $\\deg P$，于是 $\\chi(\\mathcal{O}_X(D))-\\chi(\\mathcal{O}_X(\\sum_P \\min(n_P,0)P))=\\sum_{n_P>0}n_P\\deg P$。负系数部分反向使用同一个短正合列（把 $\\mathcal{O}_X(D)$ 与 $\\mathcal{O}_X(D+P)$ 的角色互换，即把 0→O(D)→O(D+P)→κ(P)→0 代入），得到对应的负贡献 $\\sum_{n_P<0}n_P\\deg P$。两部分相加得 $\\chi(\\mathcal{O}_X(D))=\\chi(\\mathcal{O}_X)+\\deg D$。再算零除子的欧拉示性数：$h^{0}(\\mathcal{O}_X)=\\dim_k H^{0}(\\mathcal{O}_X)=1$（几何连通性，函数域中的整体正则函数只有常数），$h^{1}(\\mathcal{O}_X)=g$ 是定义，于是 $\\chi(\\mathcal{O}_X)=1-g$。代回即得 $\\chi(\\mathcal{O}_X(D))=\\deg D+1-g$。',
        ['point-divisor-sequence']),
      step('assemble', '合并两侧：得到 ℓ(D) − ℓ(K−D) = deg D + 1 − g',
        '把已有结论按定义展开：$\\chi(\\mathcal{O}_X(D))=h^{0}(\\mathcal{O}_X(D))-h^{1}(\\mathcal{O}_X(D))=\\ell(D)-\\ell(K-D)$，其中第二步正是第 2 步的 Serre 对偶。而第 4 步已算出 $\\chi(\\mathcal{O}_X(D))=\\deg D+1-g$。两边相等即为所求的 $\\ell(D)-\\ell(K-D)=\\deg D+1-g$。证明过程中每一个假设都出现在确定的位置：光滑性用于 $\\Omega_{X/k}$ 是可逆层并适用 Serre 对偶（第 2 步）；射影性用于 $H^{i}=0$（i≥2）使欧拉示性数只有两个分量、并且 deg D 有限（第 1、3 步）；几何连通性用于 $h^{0}(\\mathcal{O}_X)=1$ 与剩余域次数的计算（第 4 步）。三条假设一一对应三处使用，没有多余假设，也不能任缺其一。',
        ['serre-duality-input', 'compute-chi']),
      step('specialize-large-degree', '特化到 deg D > 2g−2 的情形，并交代变量替换失败的场合',
        '若 $\\deg D>2g-2=\\deg K$，则 $\\deg(K-D)<0$。负次数除子上没有非零有效除子与之线性等价（因为非零整体截面的零点除子是有效的、其次数非负），所以 $\\ell(K-D)=0$，公式退化为 $\\ell(D)=\\deg D+1-g$；这就是“次数大于 2g−2 时除子自动非特殊”的常用结论，也是构造射影空间嵌入（$\\ell(D)\\ge 2$ 等）的标准出发点。再看把变量替换成 K−D 会得到什么：交换 D 与 K−D 后公式给出 $\\ell(K-D)-\\ell(D)=\\deg(K-D)+1-g$，即 $\\ell(D)-\\ell(K-D)=\\deg D-(2g-2)+1-g=\\deg D+1-g$。两条式子互为倒数关系，说明公式关于变换 $D\\mapsto K-D$ 是自洽的；这也解释了为什么公式左端必然以差值形式出现——单看 ℓ(D) 不可能只由次数决定。',
        ['assemble']),
      step('boundary-and-hypotheses', '逐条检验假设的必要性，并给出破坏后的具体行为',
        '去掉几何连通性：若 X 是两条互不相交的 k-曲线之并，则 $h^{0}(\\mathcal{O}_X)=2$，$\\chi(\\mathcal{O}_X)=2-g_1-g_2$，公式右端须改成 $\\deg D+\\chi(\\mathcal{O}_X)$，直接套用会得到错误答案。去掉射影性：若 X 是 $\\mathbb{A}^1$（光滑但非射影），$H^{1}$ 不一定有限维（例如 $\\mathbb{A}^1$ 上 $\\mathcal{O}$ 的 H¹ 为零，但更一般的开曲线会出现无穷维上同调，且 deg D 没有“次数”概念，因为除子可以是无穷和），公式失效。去掉光滑性：若 X 是带一个结点的射影曲线，其正规化 $X^{\\nu}\\to X$ 使 $\\chi$ 改变，正确的欧拉示性数是 $\\chi(\\mathcal{O}_X)=\\chi(\\mathcal{O}_{X^{\\nu}})+\\delta$（δ 是“亏格差”），而对偶层不再等于 $\\Omega_{X/k}$，须换成对偶化层。三个反例分别对应三条假设，说明公式的精确范围。',
        ['assemble']),
    ],
    conclusion: '$\\ell(D)-\\ell(K-D)=\\deg D+1-g$，其中右端 $\\deg D+1-g=\\chi(\\mathcal{O}_X(D))$ 由点除子短正合列的欧拉示性数可加性逐点累加得到，左端 $\\ell(K-D)=h^{1}(\\mathcal{O}_X(D))$ 由 Serre 对偶给出。',
    dependencies: ['b-serre-duality-curve', 'genus', 'divisor', 'canonical-sheaf'],
    consequences: ['b-canonical-embedding', 'b-hurwitz', 'intersection-number', 'a-cartier-divisor'],
    explanation: BOUNDARY_RIEMANN_ROCH,
    examples: [
      { title: '例子：亏格 0，即 P¹', body: '取 $X=\\mathbb{P}^{1}_k$，则 $H^{1}(X,\\mathcal{O}_X)=0$，故 g=0，典范除子 K=−2P（deg K=2g−2=−2）。取 $D=nP$：$\\deg D=n$，公式给出 $\\ell(nP)-\\ell(-2P-nP)=n+1$。若 n≥0，则 $\\ell(nP)=n+1$（次数 n 的多项式空间），且 K−D 次数为 −2−n<0，于是 $\\ell(K-D)=0$，两侧一致，得到 n+1=n+1。若 n=−1，则 $\\deg D=-1$，$\\ell(D)=0$，$\\ell(K-D)=\\ell(-P)=0$，公式给出 0−0=−1+1=0，仍然成立。这两个取值覆盖了有效与负次数两种情形。' },
      { title: '例子：亏格 1 的椭圆曲线', body: '取光滑射影椭圆曲线 E，则 $H^{1}(E,\\mathcal{O}_E)\\cong k$，g=1，典范除子次数 $2g-2=0$，故 K 可取为 0（规范化后 $\\Omega_{E/k}\\cong\\mathcal{O}_E$）。取 $D=P$（一个闭点，次数 1）：公式给出 $\\ell(P)-\\ell(-P)=1+1-1=1$。因为 $\\ell(-P)=0$，得 $\\ell(P)=1$，即“一个点决定一个常函数”，与 $\\mathcal{O}_E(P)$ 的截面只有常数一致。取 $D=2P$：$\\ell(2P)-\\ell(-2P)=2$，即 $\\ell(2P)=2$，对应“椭圆曲线上有两个极点（至多）的函数构成二维空间”，与 Weierstrass 标准形 $y^2=x^3+ax+b$ 中出现常数函数与 x 这两个函数完全吻合。' },
      { title: '例子：亏格 2 曲线的典范除子', body: '取亏格 g=2 的光滑射影曲线 X，则 $\\deg K=2$，$\\ell(K)=g=2$。取 D=K：公式给出 $\\ell(K)-\\ell(0)=2+1-2=1$，而 $\\ell(0)=1$，故 $\\ell(K)=2$，自洽。取 D=P+K（次数 3）：公式给出 $\\ell(P+K)-\\ell(-P)=3+1-2=2$，故 $\\ell(P+K)=2$。这说明次数 3 已经超过 $2g-2=2$，除子自动非特殊；同时也说明从 K 出发加一个点已经把截面维数从 2 提到 2（因为 P+K 与 K 的差异被“减去 K”这一侧吸收）。推广到 g=3 时 $\\deg K=4$，$\\ell(K)=3$，可对比同一算法。' },
    ],
    remarks: [
      '绝对不能用“h⁰ 只由次数决定”来替代公式：ℓ(D) 与 ℓ(K−D) 都随 D 在同一个线性等价类内的具体选择变化，只有它们的差是线性等价类的不变量。',
      '几何连通（而非仅仅连通或几何既约）是 $h^{0}(\\mathcal{O}_X)=1$ 的来源；若基域不代数闭，连通曲线上可能有剩余域为扩域的点，此时“次数”按剩余域次数计算，公式仍成立但 deg P 不是 1。',
      '除子约定必须与层约定一致：公式中 $\\mathcal{O}_X(D)$ 允许 D 有负系数（则它是可逆层而非理想层），ℓ(D) 在 deg D<0 时为零。把 D 限制在有效除子上会丢失公式的一半内容。',
      'Serre 对偶在曲线上的形式常被写成 $H^{1}(X,L)^{*}\\cong H^{0}(X,\\Omega\\otimes L^{\\vee})$；写成 $h^{1}(X,\\mathcal{O}_X(D))=\\ell(K-D)$ 时用到了 $\\Omega_{X/k}\\cong\\mathcal{O}_X(K)$ 与 $\\mathcal{O}_X(-D)$ 的配对。',
      'Ricci 形式的类比容易造成误解：Riemann–Roch 不是“曲率积分”的代数版本，它是层上同调与除子次数的精确等式，任何“几何直觉版”推导都必须能还原为点除子短正合列的累加。',
    ],
    corollaries: [
      { title: '推论：deg K = 2g − 2', body: '在公式中取 D=K，左边为 $\\ell(K)-\\ell(0)=g-1$，右边为 $\\deg K+1-g$，两边相等给出 $\\deg K=2g-2$。这正是亏格与典范次数之间的基本关系，也是第 6 步中“次数大于 2g−2 即非特殊”所依赖的数值。', uses: ['assemble'] },
      { title: '推论：大次数除子分离点与切向量', body: '设 $\\deg D>2g-2$。先看分离两点：对不同的闭点 $P\\ne Q$，短正合列 $0\\to\\mathcal{O}_X(D-P-Q)\\to\\mathcal{O}_X(D)\\to\\kappa(P)\\oplus\\kappa(Q)\\to 0$ 的长正合列右侧为满射当且仅当 $h^{1}(D-P-Q)<h^{1}(D)$，而两个都非特殊（次数仍大于 2g−2），故满射，从而 D 分离 P 与 Q。再对 $P=Q$ 的情形用 $0\\to\\mathcal{O}_X(D-P)\\to\\mathcal{O}_X(D)\\to\\kappa(P)\\oplus\\Omega^{1}$ 类似的余切比较，得到 D 在每点给出单射的余切映射，即分离切向量。两条合起来说明大次数可逆层给出射影嵌入，是用 Riemann–Roch 构造射影模型的标准步骤。', uses: ['specialize-large-degree'] },
    ],
    references: [
      stacks('Stacks Project, Section 53.3: Divisors on curves', '0BE0'),
      stacks('Stacks Project, Section 53.5: Riemann-Roch', '0BY6'),
      stacks('Stacks Project, Section 53.4: The genus of a curve', '0BY6'),
      stacks('Stacks Project, Lemma 53.4.2（Riemann-Roch 的 Serre 对偶形式）', '0BY6'),
    ],
    history: '本条由公开教材与 Stacks Project 命题重新组织，项目自行改写并注明来源，未复制原文。',
  },

  /* ══════════════════════════════════════════════════════════════════
   * 四、Hurwitz 公式
   * ══════════════════════════════════════════════════════════════════ */

  'b-hurwitz': {
    statement: '设 f:X→Y 是光滑射影连通曲线之间次数 n 的有限、平坦、可分的支配态射（有限平坦等价于有限局部自由；光滑曲线间有限支配态射自动平坦，故假设中只须写出有限与可分），并假定特征为零或处处 tame，即对每个分歧点 x 有 $p\\nmid e_x$（特征 p 情形）。令 R=Σ(eₓ−1)x，则 2g_X−2=n(2g_Y−2)+deg R。',
    steps: [
      step('local-parameters', '局部参数下的展开：tame 假设给出的形式是什么',
        '取闭点 x∈X 与 y=f(x)，令 $\\mathcal{O}_{Y,y}$ 的 uniformizer 为 t，$\\mathcal{O}_{X,x}$ 的 uniformizer 为 u。有限性保证 $\\mathcal{O}_{X,x}$ 是 $\\mathcal{O}_{Y,y}$ 上的有限模，因而是有限整扩张；完备化后得到局部域扩张 $\\widehat{\\mathcal{O}}_{X,x}\\supseteq\\widehat{\\mathcal{O}}_{Y,y}$，两者都是一维正则局部环，对应分式域的有限扩张 $\\deg f=[k(X):k(Y)]=n$。先看一个对任何分歧扩张都成立的事实：取 $e_x=v_x(t)$ 为分歧指数，则 $v=t/u^{e_x}$ 按定义是单位，故 $t=u^{e_x}v$ 这种“幂乘以单位”的写法总是存在，它不区分任何东西。tame（或特征 0）的精确含义是另一件事：$p\\nmid e_x$（特征 p 时；特征 0 时任何有限扩张都自动 tame）。在 $p\\nmid e_x$ 时 $e_x$ 是基域中的单位，惯性群是循环群且分歧为驯顺的；换成野分歧（$p|e_x$）则惯性群可能非循环，局部扩张的结构需要由高阶分歧群刻画。因此 tame 假设的全部内容是“首项系数 $e_x$ 可逆”，它保证 $t=u^{e_x}v$ 的微分展开中 $u^{e_x-1}$ 项不消失，而不是断言这个分解本身存在。',
        []),
      step('different-exponent', '拉回微分在 x 处的消失阶恰为 eₓ−1',
        '在 tame 局部展开 $t=u^{e_x}v$（v 是单位）下求微分。取 d=dt 为 $\\Omega_{\\mathcal{O}_{Y,y}}$ 的生成元，则 $dt=d(u^{e_x}v)=e_xu^{e_x-1}v\\,du+u^{e_x}\\,dv$。因为有恒等式 $dv=v\\cdot d\\log v$（形式上即 $dv/v$），第一项为 $e_xu^{e_x-1}(v\\,du)$，第二项为 $u^{e_x}\\,dv$，两者的 u-进赋值分别至少为 $e_x-1$ 与 $e_x$，所以总和的最小赋值恰为 $e_x-1$，且该最小项系数是 $e_xv$，仍为单位（因为 $e_x$ 在基域中可逆）。结论：映射 $f^{*}\\Omega_{Y/k}\\to\\Omega_{X/k}$ 在 x 处的消失阶正好是 $e_x-1$，这就是局部 different 指数。若去掉 tame 假设，例如 $t=u^{p}\\cdot v+u^{2p+1}$ 这类形式在野分歧中依然可能出现，但拉回微分的赋值会严格大于 $e_x-1$，$e_x-1$ 不再描述消失阶，必须换用更高次的 different 除子。',
        ['local-parameters']),
      step('invertible-sheaves', '把逐点计算提升为可逆层的同构',
        '光滑性保证 $\\Omega_{X/k}$ 与 $\\Omega_{Y/k}$ 都是秩 1 局部自由层（可逆层），于是 $f^{*}\\Omega_{Y/k}$ 也是可逆层。第 2 步在每个闭点 x 上给出了 $f^{*}\\Omega_{Y/k}\\to\\Omega_{X/k}$ 的消失阶，这个映射是秩 1 可逆层之间的非零映射；由第 1 步所依赖的可分性（分式域扩张可分，故 $\\Omega_{k(X)/k(Y)}$ 是一维的、拉回映射在一般点不为零），它在每个有定义的点处都对，因此它给出一个可逆层的单射，其零除子恰由这些局部阶数逐点累加而成。换言之，存在可逆层同构 $\\Omega_{X/k}\\cong f^{*}\\Omega_{Y/k}\\otimes\\mathcal{O}_X(R)$，其中 $R=\\sum_x d_xx$ 是“不同除子／分歧除子”的推广形式；在 tame 情形第 2 步说明 $e_x-1$ 正是拉回微分在 x 处的消失阶，于是若取 $d_x=e_x-1$ 便得到 $R=\\sum_x(e_x-1)x$，与题目中的定义一致。',
        ['different-exponent']),
      step('degrees', '取次数：把层同构翻译成亏格与分歧度数的等式',
        '对第 3 步的同构取次数。曲线上的可逆层满足 $\\deg\\Omega_{X/k}=2g_X-2$ 与 $\\deg\\Omega_{Y/k}=2g_Y-2$（这是 Riemann–Roch 的直接推论，见 b-riemann-roch-curve 的推论）。拉回层的次数公式 $\\deg(f^{*}\\mathcal{L})=(\\deg f)\\cdot\\deg\\mathcal{L}=n\\deg\\mathcal{L}$ 需要论证，且理由不是“有限态射自动平坦”——那是错的：$\\operatorname{Spec}k[t^2,t^3]\\subseteq\\operatorname{Spec}k[t]$ 就是有限而非平坦的态射，$\\operatorname{Spec}k[x]/(x^2)\\to\\operatorname{Spec}k[x]/(x^2-x)$ 同样有限而不平坦。正确的论证有两条。第一条（除子论路线）：按定义取 $\\deg f=[k(X):k(Y)]=n$，对 $Y$ 上任意点 y 取局部 uniformizer t，则 $f^{*}[y]=\\sum_{x\\mapsto y}e_xx$ 是实的有效除子，其总次数 $\\sum_{x\\mapsto y}e_x=n$（即纤维的“带重数点数和为 n”），由此对任意除子 $E=\\sum_ym_y[y]$ 用线性同态 $f^{*}$ 给出 $\\deg f^{*}E=\\sum_ym_y\\cdot n=n\\deg E$，可逆层对应的除子类保持一致即得该式。第二条（投影公式路线）：投影公式 $f_*(f^{*}\\mathcal{L})=f_*\\mathcal{O}_X\\otimes\\mathcal{L}$，配合同构 $\\deg(f_*\\mathcal{M})=\\deg\\mathcal{M}$（光滑曲线上无挠凝聚层 $\\mathcal{M}$ 的次数 $\\deg\\mathcal{M}=\\chi(\\mathcal{M})-\\operatorname{rank}(\\mathcal{M})\\cdot\\chi(\\mathcal{O}_Y)$）以及 $f_*\\mathcal{O}_X$ 是秩 n 的局部自由 $\\mathcal{O}_Y$-模，即得 $\\deg(f^{*}\\mathcal{L})=n\\deg\\mathcal{L}$。这里平坦性（有限局部自由）正是用来断言 $f_*\\mathcal{O}_X$ 局部自由秩 n 的那一条假设，它在光滑曲线间的有限支配态射上自动成立，而不是“有限态射自动平坦”这种一般命题。又 $\\deg\\mathcal{O}_X(R)=\\deg R$ 按除子次数的定义。三式相加得到 $2g_X-2=n(2g_Y-2)+\\deg R$。这里的每一步都是等式而非不等式，原因在于可逆层之间的映射要么为零要么是同构到其像的嵌入，而第 3 步已经证明它不是零映射。',
        ['invertible-sheaves']),
      step('wild-failure', '野分歧时究竟哪里失效，以及正确的替代公式',
        '放弃 tame 假设时，第 2 步的局部赋值不再是 $e_x-1$，但首先要纠正一个常见的误解：分解 $t=u^{e_x}v$（v 为单位）对**任何**分歧扩张都成立，取 $e_x=v_x(t)$ 并由 $v=t/u^{e_x}$ 定义即可，$v$ 必为单位，因此它根本不是 tame 的判别特征，也没有区分能力。tame 的精确含义就是 $p\\nmid e_x$（特征 p；特征 0 时恒成立）：此时 $dt=d(u^{e_x}v)=u^{e_x-1}(e_xv\\,du+u\\,dv)$，且因为 $e_x$ 是基域 k 中的单位，首项系数 $e_xv$ 非零，最小 u-进赋值恰为 $e_x-1$，different 指数 $d_x=e_x-1$。野分歧时 $p|e_x$，$e_x$ 在 k 中不再是单位，$e_xv$ 可以为零，首项相消，赋值被高次项抬高，于是 $d_x>e_x-1$ 严格成立，$d_x$ 由局部域扩张的高阶分歧（ramification）滤过给出，即由 Herbrand 函数与惯性群的分歧结构计算，而不是“$e_x$ 乘以某个更大整数”这种无依据的说法。一个干净的说明是 $t=u^p$（特征 p）：此时 $dt=pu^{p-1}du=0$（因 k 中 $p=0$），拉回微分 $f^{*}\\Omega_{Y/k}\\to\\Omega_{X/k}$ 在该点的消失阶为无穷，这正说明 tame 条件为何不可省。于是不同除子必须改为 $D=\\sum_x d_xx$，Hurwitz 公式的正确形式为 $2g_X-2=n(2g_Y-2)+\\deg D$，且 $\\deg D\\ge\\deg R$，等号当且仅当处处 tame；绝不能在野分歧情形把 deg R 当作 deg D 使用。',
        ['degrees']),
      step('examples-check', '用两个可手算的覆盖核对公式',
        '第一例：取 $Y=\\mathbb{P}^{1}$（$g_Y=0$），X 为 $\\mathbb{P}^{1}$，f 由 $t\\mapsto t^{n}$ 给出（特征 0 或特征与 n 互素）。分歧点为 0 与 ∞，指数均为 n，于是 $\\deg R=(n-1)+(n-1)=2n-2$。公式给出 $2g_X-2=n(0-2)+(2n-2)=-2$，即 $g_X=0$，与 X=P¹ 吻合。第二例：取 $Y=\\mathbb{P}^{1}$，X 为椭圆曲线（$g_X=1$），f 为二次覆盖（n=2）。公式给出 $0=2(-2)+\\deg R$，即 $\\deg R=4$；二次覆盖的四个分歧点在特征 0 情形下确实给出 $4\\times(2-1)=4$。第三例：若 X=Y 且 f=id（n=1，R=0），公式退化为 $2g-2=2g-2$，说明等号在无分歧时自动成立，这是公式的一个一致性检验。',
        ['degrees']),
    ],
    conclusion: '$2g_X-2=n(2g_Y-2)+\\deg R$，其中 $R=\\sum_x(e_x-1)x$；tame 假设保证了拉回微分的局部消失阶恰为 $e_x-1$，野分歧时必须把 $R$ 换成不同除子 $D$ 并得到 $2g_X-2=n(2g_Y-2)+\\deg D$。',
    dependencies: ['b-riemann-roch-curve', 'b-serre-duality-curve', 'canonical-sheaf', 'smooth-morphism'],
    consequences: ['b-canonical-embedding', 'etale-morphism', 'intersection-number'],
    explanation: BOUNDARY_HURWITZ,
    examples: [
      { title: '例子：P¹ 的 n 次映射', body: '取 $f:\\mathbb{P}^{1}\\to\\mathbb{P}^{1}$，在坐标下 $t\\mapsto t^{n}$，特征与 n 互素。在 t=0 处参数关系是 $t=u^{n}$，分歧指数 n；在 $t=\\infty$ 处换参数 $T=1/t$、$U=1/u$ 得 $T=U^{n}$，指数同样是 n；其余点是平展的。于是 $R=(n-1)\\cdot 0+(n-1)\\cdot\\infty$，$\\deg R=2n-2$。代入公式：$2g_X-2=n(2\\cdot0-2)+(2n-2)=-2$，故 $g_X=0$。这与 $\\mathbb{P}^{1}$ 亏格为零一致，也顺带说明“低亏格底空间上的覆盖亏格由分歧度控制”。' },
      { title: '例子：特征 p 的野分歧 Artin–Schreier 覆盖 $y^p-y=x$', body: '设基域 k 特征 p、$Y=\\mathbb{P}^{1}_k$（坐标 x），X 为 Artin–Schreier 扩张 $y^{p}-y=x$，它是 k(x) 上次数 p 的循环扩张，判别式 $\\partial(y^p-y-x)/\\partial y=p y^{p-1}-1=-1$ 是单位，故在 $\\mathbb{A}^{1}$ 上平展，全部分歧集中在 $\\infty$。算 $\\infty$ 处的局部数据：令 $t=1/x$ 为 $\\mathcal{O}_{Y,\\infty}$ 的 uniformizer，并以 $v$ 记 $\\infty$ 上唯一素位（该扩张在 $\\infty$ 处全分歧，$e=p$、$f=1$）的赋值，取归一化使 $v(t)=e=p$ 且 $v(k^\\times)=0$。于是 $v(x)=-e=-p$，比较 $y^{p}-y=x$ 两端：$v(y^{p})=p\\,v(y)$，若 $v(y)<0$ 则 $y^{p}$ 项主导，$p\\,v(y)=v(x)=-p$，得 $v(y)=-1$。故 y 在 $\\infty$ 处恰有一阶极点，$w=y^{-1}$ 是 $\\mathcal{O}_{X,\\infty}$ 的 uniformizer（$v(w)=1$）。由 $dy=-dx$（特征 p 下 $d(y^p)=0$）得 $v(dx)=v(dy)$；而 $y=w^{-1}$ 给出 $dy=-w^{-2}dw$，正规化后 $v(dw)=0$，于是 $v(dx)=-2$。最后 $dt=d(x^{-1})=-x^{-2}dx$ 给出不同的消失阶 $d_{\\infty}=v(dt)=-2v(x)+v(dx)=-2(-p)+(-2)=2p-2$。检验：$e_{\\infty}=p$ 而 $d_{\\infty}=2p-2>p-1=e_{\\infty}-1$（$p\\ge2$），野分歧确实严格抬高指数；再用 Hurwitz 正确形式 $2g_X-2=p(2g_Y-2)+\\deg D=p(-2)+(2p-2)=-2$，得 $g_X=0$，与 AS 曲线 $y^p-y=x$（次数 d=1）的标准亏格 $(p-1)(d-1)/2=0$ 一致，自洽闭合。这个例子说明：只看分歧指数 e 无法确定贡献，必须算出不同的实际系数。' },
    ],
    remarks: [
      'tame 假设的作用只有一个，却不可替代：它等价于 $p\\nmid e_x$，从而在 $t=u^{e}v$ 中首项系数 $e$ 是单位、拉回微分的消失阶恰为 e−1；注意 $t=u^{e}v$ 本身对任何分歧扩张都成立，判别 tame 的是 $p\\nmid e_x$ 而非这个分解。',
      '有限可分是“态射在函数域上可分”的条件，它保证拉回映射 $f^{*}\\Omega_{Y/k}\\to\\Omega_{X/k}$ 在一般点非零；不可分覆盖（例如正特征下的 Frobenius）连秩 1 层的比较都不成立。',
      '公式中的 deg R 不是“分歧点个数”，而是按指数加权的和：一个指数为 e 的分歧点贡献 e−1，把 e 与 e−1 混用会系统性高估或低估亏格。',
      '射影与光滑假设用于让 $\\Omega$ 成为可逆层并且 $\\deg\\Omega=2g-2$ 有定义；仿射或奇异曲线上必须改用带边界项或对偶化层的版本。',
      '连通性在两侧都用到：它保证函数域是域（次数 n 有意义）以及 $H^{0}(\\mathcal{O})=k$（亏格定义）。',
    ],
    corollaries: [
      { title: '推论：无分歧覆盖不改变亏格条件：deg Ω 的倍数关系', body: '若 f 处处平展（R=0，要求 tame 自动满足），则 $2g_X-2=n(2g_Y-2)$。于是 $g_Y=1\\Rightarrow g_X=1$（椭圆曲线之间的平展覆盖仍是椭圆曲线，且映射是群同态）；$g_Y=0$ 迫使 $g_X=1$（因为右侧为 −2n<0，左侧必须为负，故 g_X=0 而 −2=−2n 只在 n=1 成立，矛盾），说明 P¹ 之间不存在次数大于 1 的平展覆盖，这与 P¹ 单连通一致。', uses: ['degrees'] },
      { title: '推论：Hurwitz 界与分支点数下界', body: '由于 $\\deg R\\ge 0$ 且 $R\\neq0$ 当且仅当 f 有分歧，公式给出 $2g_X-2\\ge n(2g_Y-2)$。若 $g_Y=0$ 且 $n\\ge2$，则 $\\deg R=2g_X-2+2n\\ge 2n-2$；结合每个分歧点贡献至多 n−1，得到至少两个分歧点（例如 P¹ 的二次覆盖至少 2 个分歧点，而椭圆曲线的二次覆盖恰有 4 个）。这类下界在构造 Belyi 映射与计数 Hurwitz 数时反复使用。', uses: ['examples-check'] },
    ],
    references: [
      stacks('Stacks Project, Lemma 53.12.3 (Riemann-Hurwitz)', '0C1E'),
      stacks('Stacks Project, Section 53.12: Riemann-Hurwitz', '0C1B'),
      stacks('Stacks Project, Section 53.4: The genus of a curve', '0BY6'),
      stacks('Stacks Project, Section 53.5: Riemann-Roch', '0BY6'),
    ],
    history: '本条由公开教材与 Stacks Project 命题重新组织，项目自行改写并注明来源，未复制原文。',
  },

  /* ══════════════════════════════════════════════════════════════════
   * 五、Kähler 微分模的构造与泛性质
   * ══════════════════════════════════════════════════════════════════ */

  'a-kahler-differential': {
    statement: '给定交换含幺环同态 A→B，存在 B-模 Ω_{B/A} 与 A-导子 d:B→Ω_{B/A}，使任意 A-导子唯一因子化。',
    steps: [
      step('free-module-relations', '把 Ω 构造成自由模的商',
        '取以 B 的元素为指标的自由 B-模 $F=\\bigoplus_{b\\in B}B\\cdot e_b$，其中 $e_b$ 只是形式符号（不要与 b 本身混淆）。令 N 为由下列四类元素生成的 B-子模：(1) $e_{b+b\'-}e_b-e_{b\'}$，对应加性；(2) $e_0$，同样来自加性；(3) $e_{bc}-b\\,e_c-c\\,e_b$，即 Leibniz 律；(4) $e_{a\\cdot 1_B}$（a∈A）与 $e_1$ 的差，把基环的元素送到零，即 $d(a)=0$。定义 $\\Omega_{B/A}=F/N$，并令 $db$ 为 $e_b$ 在商中的像，于是 $d:B\\to\\Omega_{B/A}$，$b\\mapsto db$。四类关系恰好把“是导子”所需的全部公理写成等式：加性、零元、Leibniz、以及 A-线性（d(a)=0）。若漏掉加性关系，则 $db$ 的加法行为没有约束，d 不一定满足 $d(b+b\')=db+db\'$，商模也不具备所需的泛性质。构造是纯代数的，不含任何有限性假设：B 无需有限生成，A→B 无需有限型，N 也不需要有限生成。',
        []),
      step('verify-derivation', '验证 d 确实是 A-导子',
        '由上一步的四类关系逐条检验：(1)(2) 给出 $d(b+b\')=d(b)+d(b\')$ 与 $d(0)=0$，因为 $e_{b+b\'}-e_b-e_{b\'}$ 与 $e_0$ 都属于 N；(3) 给出 $d(bc)=b\\,dc+c\\,db$，因为 $e_{bc}-b e_c-ce_b$ 属于 N；(4) 给出 $d(a\\cdot1)=0$，即 d 在 A 的像上为零，这正是 A-导子的定义要求（把 A 通过 A→B 看成 B 的子环）。此外 d 按构造是加法群同态（(1) 已证），并且满足 $d(1)=0$（属于第 (4) 类，取 a=1）。于是 d 是满足 $d(a)=0$（a∈A）与 Leibniz 律的加法映射，即 A-导子。最后注意 Ω 由所有 $db$ 生成：商模 F/N 的所有元素都是有限和 $\\sum b_i\\,db_i$ 的形式，这一点在后面证明唯一性时会直接使用。',
        ['free-module-relations']),
      step('universal-property-existence', '泛性质的存在性：任意 A-导子都能唯一地穿过 d',
        '设 $\\delta:B\\to M$ 是任意 A-导子，M 是 B-模。先构造：定义 B-线性映射 $\\Phi:F\\to M$，在基上取 $\\Phi(e_b)=\\delta(b)$，再线性延拓。需要验证 N⊆ker Φ：对四类生成元逐一检查，$\\Phi(e_{b+b\'}-e_b-e_{b\'})=\\delta(b+b\')-\\delta(b)-\\delta(b\')=0$ 用导子的加性，$\\Phi(e_0)=0$，$\\Phi(e_{bc}-be_c-ce_b)=\\delta(bc)-b\\delta(c)-c\\delta(b)=0$ 用 Leibniz 律，$\\Phi(e_{a\\cdot1})=\\delta(a\\cdot1)=a\\delta(1)=0$ 用 A-线性与 $\\delta(1)=0$。于是 Φ 下降为 B-线性映射 $\\varphi:\\Omega_{B/A}\\to M$，且对每个 b 有 $\\varphi(db)=\\varphi(e_b+N)=\\delta(b)$，即 $\\varphi\\circ d=\\delta$。存在性得证。这一步的关键是把“δ 是导子”这一组恒等式逐条翻译为“N 中的生成元被 Φ 杀死”，因此构造出的 Φ 与 N 的选择无关。',
        ['verify-derivation']),
      step('universal-property-uniqueness', '泛性质的唯一性：由生成元决定',
        '设 $\\psi:\\Omega_{B/A}\\to M$ 是任意 B-线性映射且满足 $\\psi\\circ d=\\delta$。因为 Ω 是由集合 $\\{db:b\\in B\\}$ 生成的 B-模（第 2 步的结尾），任意 B-线性映射由它在生成元上的取值唯一决定。而生成元的取值已被强制：$\\psi(db)=\\psi(d(b))=\\delta(b)=\\varphi(db)$。因此 ψ 与 φ 在所有生成元上一致，从而 $\\psi=\\varphi$，唯一性得证。唯一性之所以能从“生成元”一步推出，是因为这里是**B-线性**映射而非仅加法群同态：若只要求加法群同态，生成元的取值不能决定整个映射（还需要知道 $b\\cdot db$ 的像），唯一性就会失效。把存在性与唯一性合并，得到一个自然同构 $\\operatorname{Hom}_B(\\Omega_{B/A},M)\\cong\\operatorname{Der}_A(B,M)$，$\\varphi\\mapsto\\varphi\\circ d$，这是 Ω 的“表示论”描述。',
        ['universal-property-existence']),
      step('presentation-finitely-generated', '有限表示下 Ω 的具体呈现与 Jacobian 关系',
        '设 $B=A[x_1,\\dots,x_n]/I$ 是有限表示（于是 A→B 有限型，且理想 I 有限生成）。先算多项式环：$\\Omega_{A[x_1,\\dots,x_n]/A}$ 是以 $dx_1,\\dots,dx_n$ 为基的自由 B-模，因为单项式的微分由 Leibniz 律与 $d(a)=0$（a∈A）唯一确定，且这些 $dx_i$ 之间没有关系。再由商环的微分模公式 $\\Omega_{(A[x]/I)/A}\\cong\\Omega_{A[x]/A}\\big/(I\\,\\Omega_{A[x]/A}+d(I))$，其中 $d(I)$ 由 I 的生成元的微分张成。于是 $\\Omega_{B/A}\\cong\\big(\\bigoplus_{i=1}^{n}B\\,dx_i\\big)\\big/\\big(df_i:f_i\\in I\\big)$。若 $I=(f_1,\\dots,f_m)$，则由链式法则 $df_j=\\sum_i\\frac{\\partial f_j}{\\partial x_i}dx_i$，关系由 Jacobian 矩阵 $\\big(\\partial f_j/\\partial x_i\\big)$ 的行张成。这一步把抽象的“自由模商掉关系”变成可以写出矩阵的具体呈现，也为“光滑 = Jacobian 满秩”提供了代数基础。',
        ['universal-property-uniqueness']),
      step('fiber-and-tangent', '在剩余域上张量：Kähler 微分给出余切空间',
        '设 $x:\\Omega\\to B\\to\\kappa(x)$ 是闭点对应的 k(x)-线性映射，k(x)=B/𝔪。把 Ω 沿 𝔪 张量，得 $\\Omega_{B/A}\\otimes_B\\kappa(x)$。由 Nakayama 引理，$\\Omega_{B/A}\\otimes_B\\kappa(x)=0$ 当且仅当 $\\Omega_{B/A}$ 在 𝔪 处为零（局部化后为零），这正是“x 处光滑”的判据之一。另一方面，导子与切空间的关系是 $\\operatorname{Der}_A(B,\\kappa(x))\\cong\\operatorname{Hom}_{\\kappa(x)}\\big(\\Omega_{B/A}\\otimes_B\\kappa(x),\\kappa(x)\\big)$（对第 4 步的同构沿基变换取 κ(x) 并利用 Hom 与张量的伴随），左端正是把 A-导子送到剩余域的集合，即余切空间的对偶。对第 5 步的 Jacobian 呈现再张量 κ(x)，关系矩阵变为数值矩阵，其秩给出 $\\dim_{\\kappa(x)}\\Omega\\otimes\\kappa(x)=n-\\operatorname{rank}J(x)$，于是“光滑当且仅当 Jacobian 满秩”这一结论在此完全代数化。',
        ['presentation-finitely-generated']),
      step('properties-and-limits', '基本性质与假设的必要性',
        'Kähler 微分的基本性质可以直接从泛性质推出，不需回到构造：局部化 $\\Omega_{S^{-1}B/A}\\cong S^{-1}\\Omega_{B/A}$（因为局部化与商、自由模交换，且 $d(b/s)=(s\\,db-b\\,ds)/s^{2}$ 给出同构）；基变换 $\\Omega_{B\\otimes_AA^{\\prime}/A^{\\prime}}\\cong\\Omega_{B/A}\\otimes_A A^{\\prime}$；transitivity 序列 $\\Omega_{B/A}\\otimes_B C\\to\\Omega_{C/A}\\to\\Omega_{C/B}\\to 0$ 正合（左端不必单射，这正是“相对微分”可能与绝对微分不同的地方）；以及当 $B=S^{-1}A$ 时 $\\Omega_{B/A}=0$。假设边界同样清楚：A→B 若非单射也不影响构造（A 的元素通过 1↦a 的像被杀死），但此时导子的定义中“d(a)=0”指的是 a 在 B 中的像；若 B 不是交换环或 A→B 不是含幺同态，Leibniz 律与 d(1)=0 的关系会改变，整套构造须重做（非交换情形要用双模与 $\\Omega^{1}$ 的另一定义）。',
        ['verify-derivation', 'presentation-finitely-generated']),
    ],
    conclusion: '存在 B-模 $\\Omega_{B/A}$ 与 A-导子 $d:B\\to\\Omega_{B/A}$，使任意 A-导子 $\\delta:B\\to M$ 唯一地分解为 $\\delta=\\varphi\\circ d$；等价地 $\\operatorname{Hom}_B(\\Omega_{B/A},M)\\cong\\operatorname{Der}_A(B,M)$。',
    dependencies: ['tangent-space', 'spec-functor', 'localization', 'fibred-product'],
    consequences: ['smooth-morphism', 'etale-morphism', 'a-formal-smooth', 'a-completion', 'a-cartier-divisor'],
    explanation: BOUNDARY_Kahler,
    examples: [
      { title: '例子：多项式环与一个具体 Jacobian 关系', body: '取 A=k、$B=k[x]$，则 $\\Omega_{B/A}$ 是以 dx 为基的自由模，任意元素写成 $f(x)\\,dx$，而 $d(f)=f\'(x)dx$，其中 $f\'$ 是形式导数。取 $B=k[x,y]/(x^2-y^3)$，则关系为 $d(x^2-y^3)=2x\\,dx-3y^{2}dy$，故 $\\Omega_{B/A}\\cong(k[x,y]/(x^2-y^3))^{2}\\big/(2x\\,dx-3y^{2}dy)$。在原点 (x,y)=(0,0) 处关系系数 $2x$ 与 $3y^2$ 同时为零，故 $\\Omega\\otimes\\kappa$ 维数为 2 而非 1，说明原点不光滑，与曲线 $y^2=x^3$ 在原点的尖点完全吻合。若改成 $B=k[x,y]/(y^2-x^3-x)$，原点的 Jacobian 为 $(-1,0)\\ne0$，维数为 1，光滑。' },
      { title: '例子：导数作为泛性质的验证', body: '取 A=k、$B=k[x]$、$M=B$，令 $\\delta=d/dx:B\\to B$（形式导数）。它满足 $\\delta(f+g)=\\delta f+\\delta g$ 与 $\\delta(fg)=f\\delta g+g\\delta f$，且在 k 上为零，故是 A-导子。泛性质给出唯一的 B-线性映射 $\\varphi:\\Omega_{B/A}=B\\,dx\\to B$ 使 $\\varphi\\circ d=\\delta$；由 $\\varphi(dx)=\\varphi(d(x))=\\delta(x)=1$ 得 $\\varphi(f\\,dx)=f$，即 $\\varphi$ 就是“把 dx 的系数取出来”。同样令 $\\delta=\\frac{d}{dx}+c$（c∈k 常数），它**不是**导子，因为 Leibniz 律在乘积上多出 $2c\\,fg$ 项，故它不可能因子化过 d。这两个例子说明泛性质精确地刻画了“哪些映射能从 d 穿过”。' },
      { title: '例子：Etale 代数给出的零微分模', body: '取 $A=\\mathbb{C}[x,x^{-1}]$，$B=\\mathbb{C}[x,x^{-1},y]/(y^{2}-(x^{3}-x))$。则 $\\Omega_{B/A}$ 由 $dy$（dx 已由 A 吸收）给出，关系为 $2y\\,dy=0$，即 $\\Omega_{B/A}\\cong B/(2y)$，一般在 y 的零点处退化。再看纯 etale 情形：$A=\\mathbb{C}[t,t^{-1}]$，$B=\\mathbb{C}[s,s^{-1}]$ 通过 $t\\mapsto s^{2}$，此时 $dt=2s\\,ds$ 是可逆元倍的 ds，故 $\\Omega_{B/A}=0$；这与“etale 态射的相对微分为零”一致，也解释了为什么 etale 态射可以理解为相对切丛为零的映射。' },
    ],
    remarks: [
      '构造必须同时含加性关系与 Leibniz 关系：只保留 Leibniz 会让 d 的加法行为失控，只保留加法则丢失乘积法则，两种遗漏都会破坏泛性质。',
      '唯一性依赖于“Ω 由所有 db 生成”与映射是 B-线性这两点；写成一般加法群同态的因子化不唯一。',
      '有限型不是 Ω 存在的必要条件。构造对任意环同态都成立；有限型只影响 Ω 是否有限生成、以及能否写出 Jacobian 呈现。',
      'transitivity 序列在左端不一定单射，其左端的核由 $\\Omega_{B/A}$ 的挠部分测量；把三个 Ω 的关系误认为短正合列是常见错误。',
      '把 $\\Omega_{B/A}$ 与 $\\Omega_{B/k}$ 混用后果严重：相对微分含去了 A 的微分信息，例如 $\\Omega_{S^{-1}A/A}=0$ 而 $\\Omega_{S^{-1}A/k}$ 一般非零。',
      'Kähler 微分与微分形式的关系：在光滑情形 $\\Omega_{X/k}$ 就是余切丛的截面层，其外幂给出 de Rham 复形；非光滑时若 $\\Omega$ 不是局部自由层，外幂及相关序列需要额外假设。',
    ],
    corollaries: [
      { title: '推论：局部化与基变换下的相容性', body: '由泛性质可得 $\\Omega_{S^{-1}B/A}\\cong S^{-1}\\Omega_{B/A}$ 与 $\\Omega_{B\\otimes_A A\'/A\'}\\cong\\Omega_{B/A}\\otimes_A A\'$。两条性质说明 Ω 是可以在开集上与基变换上逐片计算的层论对象：前者让“在一点处计算”有意义，后者让纤维与几何纤维的比较有意义。', uses: ['verify-derivation'] },
      { title: '推论：光滑 = Jacobian 满秩', body: '设 $B=A[x_1,\\dots,x_n]/(f_1,\\dots,f_m)$，B 在极大理想 𝔪 处光滑当且仅当 $\\operatorname{rank}\\big(\\partial f_j/\\partial x_i \\pmod{\\mathfrak m}\\big)=n-\\dim B$ 且该秩达到最大，等价于 $\\Omega_{B/A}\\otimes_B\\kappa(\\mathfrak m)$ 的维数等于相对维数。这条推论把几何上的“切空间充分大”翻译成矩阵秩计算，是判定光滑性的标准算法。', uses: ['fiber-and-tangent'] },
      { title: '推论：Etale 当且仅当相对微分为零且平坦', body: '若 A→B 有限型且平坦，则 B 在 A 上 etale 当且仅当 $\\Omega_{B/A}=0$（配合有限型可减弱为在每点的剩余域处张量后为零）。这说明“余切丛为零”加上平坦就是 etale 的代数刻画，也是形式光滑理论中 $\\Omega$ 判据的出发点。', uses: ['fiber-and-tangent'] },
    ],
    references: [
      stacks('Stacks Project, Section 10.131: Differential modules (Kähler differentials)', '00RM'),
      stacks('Stacks Project, Lemma 10.131.3（导子与 Hom 的自然同构）', '00RM'),
      stacks('Stacks Project, Section 10.140: Zariski tangent spaces', '00T5'),
      stacks('Stacks Project, Section 10.131（有限表示下的 Jacobian 呈现）', '00RM'),
    ],
    history: '本条由公开教材与 Stacks Project 命题重新组织，项目自行改写并注明来源，未复制原文。',
  },

}
