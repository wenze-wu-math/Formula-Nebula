/**
 * 批次 26 长篇证明数据：导出范畴、稳定性、商栈、等变理论、Hodge 族与超凯勒几何的 13 个节点。
 *
 * 写作约定（与 scripts/_check-proof-file.mjs 的检查一致）：
 *   · 正文用中文长段 + Unicode 数学符号（⊆ ⊗ → ↦ 𝔭 𝔪 ℓ χ ≅ ⋂ ∑），直接作为文本排版；
 *   · 只在需要真正排版公式时才用 $...$ 包住完整 LaTeX，反斜杠必须双写、分隔符必须成对；
 *   · 引用只写已核实的 Stacks Project 稳定 tag，URL 用 tag 形式；
 *   · 每步正文都超过 400 字，不使用无信息量的凑字数句子。
 */

const step = (id, title, body, uses) => ({ id, title, body, uses: uses ?? [] })
const stacks = (title, tag, year = 2024) => ({
  title, author: 'The Stacks Project', year, url: `https://stacks.math.columbia.edu/tag/${tag}`,
})
const HISTORY = '本条由公开教材与 Stacks Project 命题重新组织，项目自行改写并注明来源，未复制原文。'

export const BATCH_26_PROOFS = {

  /* ═══════════════════════════════════════════════════════════
   * 1. D-膜与导出范畴
   * ═══════════════════════════════════════════════════════════ */

  'c-dbp': {
    statement: "设 $X$ 是复代数簇（通常取 Calabi–Yau 流形或光滑紧复流形）。B 型拓扑 D-膜由有界导出范畴 $D^b(\\operatorname{Coh}X)$ 的对象刻画：单层凝聚层 $i_*E$ 描述支在闭子簇上的膜，膜之间的速子（tachyon）凝聚由态射与映射锥给出，物理上稳定的束缚态就是锥对象的同调；两张膜 $E,F$ 之间的开弦态空间由分次向量空间 $\\operatorname{Ext}^{\\bullet}(E,F)$ 给出；BPS 稳定性条件则翻译为中心荷的相位约束。",
    steps: [
      step('brane-as-complex', '膜、速子与复形',
        "单张 B 型膜由闭子簇 $S\\subset X$ 连同其上的复向量丛 $E$ 描述，对应凝聚层 $i_*E$；当两张膜之间存在速子场时，物理的真空结构由速子场的临界点给出，而残留的束缚态由该临界点附近的同调读出。把它翻译成代数语言：给一串膜 $E_1,E_2,\\ldots,E_m$ 与逐次速子场给出的映射 $f_i:E_i\\to E_{i+1}$，则残留的膜是映射锥 $\\operatorname{Cone}(f_i)$；把这些数据合成为带微分的复形 $E^{\\bullet}$ 后，真正可观测的膜内容恰好是它的同调 $H^{\\bullet}(E^{\\bullet})$。这一步解释了为什么必须用**导出**范畴而不是阿贝尔范畴：锥对象一般不再是凝聚层，迭代取锥会带出多个非零上同调，而 $D^b(X)$ 中两个对象之间的态射集恰好以 $\\operatorname{Ext}$ 群为其上同调，正好对上物理要的分级谱。",
        []),
      step('ext-as-string-spectrum', '开弦谱就是 Ext 群',
        "两张膜 $E^{\\bullet},F^{\\bullet}$ 之间的开弦态由复形 $\\operatorname{RHom}^{\\bullet}(E^{\\bullet},F^{\\bullet})$ 给出，其第 $i$ 阶上同调就是 $\\operatorname{Ext}^i(E,F)$，鬼数按 $i$ 分层。可计算性是这套字典的要点：当 $E$ 是局部自由层时有局部到整体的谱序列 $H^p(X,\\mathcal{E}^{\\vee}\\otimes\\mathcal{F})\\Rightarrow\\operatorname{Ext}^{p+q}(\\mathcal{E},\\mathcal{F})$，于是开弦谱可以由熟知的层上同调算出，而不必回到无穷维的场论计算。当 $X$ 是 $n$ 维光滑射影簇时，Serre 对偶进一步给出 $\\operatorname{Ext}^i(E,F)\\cong\\operatorname{Ext}^{n-i}(F,E\\otimes\\omega_X)^{\\vee}$，即高阶与低阶 Ext 互为对偶，这在物理上说明两端的态谱是镜像对称的，也是 B 型膜在镜像对称中表现良好的代数根源。",
        ['brane-as-complex']),
      step('triangles-and-bound-states', '三角与束缚态的长正合列',
        "把速子凝聚取锥的操作提升到三角 $E\\xrightarrow{f}F\\to\\operatorname{Cone}(f)\\to E[1]$，它替代了长正合列的推前部分。对任意测试对象 $G$，把函子 $\\operatorname{Hom}(G,-)$ 作用到这个三角上，得到长正合列 $\\cdots\\to\\operatorname{Ext}^i(G,E)\\to\\operatorname{Ext}^i(G,F)\\to\\operatorname{Ext}^i(G,\\operatorname{Cone}f)\\to\\operatorname{Ext}^{i+1}(G,E)\\to\\cdots$；对 $\\operatorname{Hom}(-,G)$ 同理可得反向的列。物理上这说明束缚态的谱由两端膜的谱沿长列拼合而成，而 $\\operatorname{Ext}^1$ 中的类正是两膜边缘形变的参数，对应束缚态存在的可能。移位 $[1]$ 对应鬼数平移，它也是必须取 $D^b$（把拟同构反演为同构）而非同伦范畴 $K^b$ 的理由：拟同构的复形给出相同的膜谱与相同的稳定性判据。",
        ['brane-as-complex', 'ext-as-string-spectrum']),
      step('fm-transform-and-mirror', 'Fourier–Mukai 变换与镜像对称',
        "膜的字典还有一层用处：两个导出范畴之间的等价把膜的两套几何图景互相翻译。这类等价由 Fourier–Mukai 核给出：取 $\\mathcal{P}\\in D^b(X\\times Y)$，令 $\\Phi_{\\mathcal{P}}(E)=\\mathbf{R}p_{Y*}(p_X^*E\\otimes^{\\mathbf{L}}\\mathcal{P})$，则 $\\Phi_{\\mathcal{P}}$ 是三角函子，Bondal–Orlov 与 Orlov 的结果表明光滑射影簇之间的等价都（在适当条件下）是这种形式。平凡而重要的情形是阿贝尔簇与其对偶之间由 Poincaré 丛给出的等价；同调镜像对称猜想则断言对镜像对 $(X,X^{\\vee})$ 存在范畴等价 $D^b(\\operatorname{Coh}X)\\simeq D^b(\\operatorname{Fuk}(X^{\\vee}))$，在 B 型一侧正是导出范畴的等价。Orlov 的定理还说明光滑射影曲线之间任何等价都是 Fourier–Mukai 型，这使曲线情形可以逐案验证。",
        ['brane-as-complex', 'ext-as-string-spectrum']),
      step('moduli-and-stability', '膜的模空间与稳定性条件',
        "作为范畴对象，膜没有自然的模空间：有自同构的膜使细模空间不存在，而全部对象所在的模函子可表性极差。标准做法是固定一个稳定性条件 $\\sigma=(Z,P)$（中心荷与相位函数），只对 $\\sigma$-稳定对象取模空间，在适当条件下得到代数栈上的拟射影典范。此时切空间与自同构可以逐项核算：$T_{[E]}\\mathcal{M}\\cong\\operatorname{Ext}^1(E,E)$、$\\operatorname{Aut}(E)\\cong\\operatorname{Ext}^0(E,E)$，而障碍落在 $\\operatorname{Ext}^2(E,E)$，于是「膜的形变理论」完全由 Ext 群给出。中心荷在物理侧由周期积分给出 $Z(E)=\\int_{\\Gamma_E}\\Omega$，而相位比较就是 BPS 条件。这也说明稳定性条件并非唯一：改变 $\\sigma$ 会让不同的对象成为稳定对象，模空间随之变化，其间的穿墙现象是这一理论的活跃部分。",
        ['ext-as-string-spectrum']),
    ],
    conclusion: "B 型 D-膜与 $D^b(\\operatorname{Coh}X)$ 的对象一一对应：速子凝聚对应态射与映射锥，束缚态对应锥对象的同调，开弦谱就是分级的 $\\operatorname{Ext}$ 群；范畴等价（Fourier–Mukai 型）给出膜的两套几何实现之间的翻译，而同调镜像对称正是这类等价的预言；BPS 稳定性对应 Bridgeland 稳定性条件的相位约束，膜的模空间与形变由 $\\operatorname{Ext}^0,\\operatorname{Ext}^1,\\operatorname{Ext}^2$ 分别控制。",
    dependencies: [],
    consequences: [],
    explanation: "把 D-膜翻译成导出范畴的对象，好处不在修辞而在可计算性：物理上难以下手的束缚态计数变成同调代数里标准的长正合列计算，膜的稳定性变成中心荷的相位比较，膜的形变与自同构变成 Ext 群的维数。这套字典的可靠性来自两侧的独立验证：镜像对称预言的数值计数在数学侧由 Gromov–Witten 不变量算出、在 B 模型侧由周期积分与稳定性条件算出，两者相符；导出范畴侧的 Fourier–Mukai 等价则给出可检验的范畴化预言。要注意边界：字典的精确形式依赖弦论的具体设定（例如是否取 Orbifold、是否带 B 场），而在数学侧则依赖 $X$ 的光滑性与射影性；对非 Calabi–Yau 的 $X$，稳定性条件与中心荷的构造需要额外的形式输入。",
    examples: [
      { title: "例子：射影直线上的锥给出点层", body: "取 $X=\\mathbb{P}^1$，考虑两个结构层的映射 $\\mathcal{O}_{\\mathbb{P}^1}\\xrightarrow{\\cdot x}\\mathcal{O}_{\\mathbb{P}^1}(1)$（乘以坐标 $x$）。它的映射锥满足 $\\operatorname{Cone}=[\\mathcal{O}\\xrightarrow{x}\\mathcal{O}(1)]$，由短正合列 $0\\to\\mathcal{O}\\to\\mathcal{O}(1)\\to k(p)\\to 0$ 可知该锥同构于位于 $x=0$ 处的点层 $k(p)$（相差移位）。这正对应物理图像：两个膜通过一个速子场凝聚，残余的束缚态集中在一点上。核算方式是逐项看层上同调：$h^0(\\mathcal{O})=h^0(\\mathcal{O}(1))=1$、$h^1$ 全为 0，交错和后只剩下点层的贡献。" },
      { title: "例子：椭圆曲线上 Ext 的维数与 Serre 对偶", body: "取 $X$ 为椭圆曲线（$g=1$，$\\omega_X\\cong\\mathcal{O}_X$），$E=F=\\mathcal{O}_X$。由局部到整体的谱序列可得 $\\dim\\operatorname{Ext}^0(\\mathcal{O},\\mathcal{O})=h^0(\\mathcal{O})=1$、$\\dim\\operatorname{Ext}^1(\\mathcal{O},\\mathcal{O})=h^1(\\mathcal{O})=1$，更高阶为 0。Serre 对偶 $\\operatorname{Ext}^i(E,F)\\cong\\operatorname{Ext}^{1-i}(F,E\\otimes\\omega_X)^{\\vee}$ 在这里给出 $\\operatorname{Ext}^1(\\mathcal{O},\\mathcal{O})\\cong\\operatorname{Ext}^0(\\mathcal{O},\\mathcal{O})^{\\vee}$，两侧同为 1 维，逐项对上。于是椭圆曲线上结构层这一「最简膜」的形变空间是 1 维的（对应平移），而自同构是 1 维的（对应常数）。" },
    ],
    remarks: [
      "字典里最关键的不是「用范畴代替几何」，而是**导出**二字：如果只取凝聚层的阿贝尔范畴，映射锥这一基本操作根本不在范畴内，速子凝聚无法表达；这也是为什么粘合与推出在膜的语言里天然对应三角与长正合列。",
      "Ext 群给出的是**微扰**谱。当膜之间的速子场存在非微扰效应（例如带多个速子的多膜系统）时，需要稳定性条件来判定哪些束缚态真的存在，这一步无法只靠同调代数完成。",
      "同调镜像对称中 A 型一侧是 Fukaya 范畴而不是导出范畴，因而两侧的等价不是「代数范畴之间的等价」这一简单形态；B 型一侧之所以好用，是因为它已经是纯代数的导出范畴。",
      "稳定性条件依赖中心荷的选取，而中心荷在物理侧由周期积分给出；改变 B 场或把 $X$ 换成其 Orbifold 会改变中心荷，从而改变稳定对象的集合与模空间，这说明「膜的模空间」不是几何对象本身的不变量。",
    ],
    references: [
      { title: "D-Branes on Calabi–Yau Manifolds", author: "Paul S. Aspinwall", year: 2004 },
      { title: "Fourier–Mukai Transforms in Algebraic Geometry", author: "Daniel Huybrechts", year: 2006 },
      { title: "Dirichlet Branes and Mirror Symmetry", author: "Aspinwall, Bridgeland, Craw, Douglas, Gross, Kapustin, Moore, Segal, Szendrői, Wilson", year: 2009 },
    ],
    history: HISTORY,
  },
};
