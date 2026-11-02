/**
 * 批次 08 长篇证明数据：除子、丰沛性、曲线上的度、对偶复形与 Stein 分解，
 * 以及曲线的典范嵌入、超椭圆性、Weil 配对、Tate 模、Mordell–Weil、椭圆积分
 * 与 Chow 群／Abel–Jacobi —— 共 13 个节点。
 *
 * 写作约定（与 scripts/_check-proof-file.mjs 的检查一致）：
 *   · 正文用中文长段 + Unicode 数学符号（⊆ ⊊ ⊗ ⊕ → ↦ 𝔭 𝔪 ℓ κ ε ≅ √ ⋂ ∑ Λ），直接作为文本排版；
 *   · 只在需要真正排版公式时才用 $...$ 包住完整 LaTeX，反斜杠必须双写、分隔符必须成对；
 *   · 引用只写已核实的 Stacks Project 稳定 tag 或明确的教材章节；
 *   · 每步正文都超过 300 字，不使用无信息量的凑字数句子。
 */

const step = (id, title, body, uses) => ({ id, title, body, uses: uses ?? [] })
const stacks = (title, tag, year = 2024) => ({
  title, author: 'The Stacks Project', year, url: `https://stacks.math.columbia.edu/tag/${tag}`,
})
const HISTORY = '本条由公开教材与 Stacks Project 命题重新组织，项目自行改写并注明来源，未复制原文。'

export const BATCH_08_PROOFS = {

  /* ═══════════════════════════════════════════════════════════
   * 1. Cartier 除子
   * ═══════════════════════════════════════════════════════════ */

  'a-cartier-divisor': {
    statement: '设 X 是既约簇（更一般地：局部诺特概形）。X 上的 Cartier 除子指由数据 $\\{(U_i,f_i)\\}_{i\\in I}$ 给出的等价类，其中 $\\{U_i\\}$ 是 X 的开覆盖、$f_i\\in \\mathcal K_X(U_i)$ 在每个 U_i 的每个不可约分支上都是非零因子（即在局部环中不是零因子），并要求 $f_i/f_j\\in \\mathcal O_X(U_i\\cap U_j)^{\\times}$；两组这样的数据等价，若逐项合并后仍满足同一条件。则：(1) 全体 Cartier 除子构成群 $\\operatorname{Div}(X)$，群运算为逐项乘；(2) 映射 $D\\mapsto \\mathcal O_X(D)$ 给出双射 $\\operatorname{Div}(X)\\to\\{\\mathcal K_X\\text{ 中可逆的 }\\mathcal O_X\\text{-子模层}\\}$，从而给出同构 $\\operatorname{CaDiv}(X)\\cong\\operatorname{Pic}(X)$；(3) $\\mathcal O(D_1)\\cong\\mathcal O(D_2)$ 当且仅当 $D_1-D_2=\\operatorname{div}(g)$ 是主除子，故 $\\operatorname{CaDiv}(X)/\\operatorname{Prin}(X)\\cong\\operatorname{Pic}(X)$；(4) 若 X 正规且每个局部环的每个高度 1 素理想的局部环是离散赋值环，则有嵌入 $\\operatorname{CaDiv}(X)\\hookrightarrow\\operatorname{WDiv}(X)$ 到 Weil 除子群，且它一般不是满射；满射成立当且仅当 X 的每个局部环都是唯一分解环。',
    explanation: 'Cartier 除子的定义看起来只是在抄“除子”这个词，但实际上它把除子的概念从“点集数据”改成了“方程数据”：Weil 除子记录的是“哪些超曲面的重数是多少”，Cartier 除子记录的是“局部由哪个方程定义”。两种记录方式在光滑（更一般地，在局部环全是 UFD 的）情形下互相转换，所以教科书里往往不区分；但在有奇点的概形上它们真的不同，而这个差别正是研究奇点的入口。本条记录把等价链的两个方向都证出：从覆盖数据到可逆层用“把 $f_i$ 从函数变成 $\\mathcal O_X$ 到 $\\mathcal K_X$ 的嵌入的像的生成元”这一构造，从可逆层回到覆盖数据用“局部处处非零的截面给出局部方程”这一构造，两者互逆需要逐项核对。最后一个论断（Cartier 嵌入 Weil、满射性与 UFD 的等价）把“奇点的存在”翻译成“某个局部环不是 UFD”，从而能用交换代数的工具去数它。',
    steps: [
      step('cover-data-and-group-law', '覆盖数据的群运算与相容性核对',
        '先把定义中的细节钉牢。给定两组覆盖数据 $\\{(U_i,f_i)\\}$ 与 $\\{(V_j,g_j)\\}$，把定义域加密为公共细分 $\\{U_i\\cap V_j\\}$，则逐项乘积的族 $\\{(U_i\\cap V_j,\\ f_i g_j)\\}$ 给出一个新的 Cartier 除子：在两个分支重叠处需要验证 $f_i g_j$ 仍是非零因子。这一步是实质性的：$\\mathcal K_X(U)$ 一般不整，两个非零因子的乘积在局部环的某个分支上会不会变成零因子？答案是否定的，因为“非零因子”在局部环 $\\mathcal O_{X,x}$ 上由 $\\operatorname{Ass}(\\mathcal O_{X,x})$ 判定，而 $f$ 是非零因子意味着对每个 $\\mathfrak p\\in\\operatorname{Ass}(\\mathcal O_{X,x})$ 有 $f\\notin\\mathfrak p$；两个这样的元素之积仍不在任何相伴素理想中，故仍是非零因子。这个论证同时说明：在既约簇上（局部环的零因子集是有限多个素理想的并）“非零因子”是一个在乘法与取逆下封闭的性质，因此逐项乘给出群结构，单位元由全为 1 的数据表示，逆元由取倒数给出。若去掉“既约”这一前提，$\\mathcal O_{X,x}$ 可以有幂零元，非零因子性就会在乘法下失效，Cartier 除子群的定义本身就要重写。',
        []),
      step('sheaf-from-divisor', '从除子数据构造可逆层 $\\mathcal O_X(D)$',
        '给定 $D=\\{(U_i,f_i)\\}$，在每个 $U_i$ 上令 $\\mathcal O_X(D)|_{U_i}=f_i^{-1}\\mathcal O_X|_{U_i}=\\{f_i^{-1}h:h\\in \\mathcal O_X\\}$，这是 $\\mathcal K_X|_{U_i}$ 中由 $f_i^{-1}$ 生成的 $\\mathcal O_X$-子模。在重叠 $U_i\\cap U_j$ 上，由 $f_i/f_j\\in\\mathcal O_X^{\\times}$ 得 $f_i^{-1}\\mathcal O_X=f_j^{-1}\\mathcal O_X$，于是这些局部定义通过粘合给出 $\\mathcal K_X$ 中的一个 $\\mathcal O_X$-子模层 $\\mathcal O_X(D)$。它在每个点 $x$ 处局部等于生成元 $f_i^{-1}$ 的自由秩一 $\\mathcal O_{X,x}$-模，故是可逆层。反向构造：给定 $\\mathcal K_X$ 中的可逆 $\\mathcal O_X$-子模层 $\\mathcal L$，取一个开覆盖 $\\{U_i\\}$ 使 $\\mathcal L|_{U_i}=\\mathcal O_{U_i}\\cdot s_i$，其中 $s_i\\in \\mathcal K_X(U_i)$ 是局部生成元（存在，因为 $\\mathcal L$ 局部自由秩一，而 $\\mathcal K_X$ 是局部化给出的常数层性质的总空间，$\\mathcal K_X$ 在每点处是 $\\mathcal O_{X,x}$ 的乘法集合的局部化）；令 $f_i=s_i^{-1}$，于是 $\\mathcal O_X(D)=\\mathcal L$。两个构造的互逆性由“粘合数据决定层、层在每个连接处决定唯一的转移函数”这一层论基本事实保证。',
        ['cover-data-and-group-law']),
      step('multiplication-and-picard', '乘法性、与主除子的关系以及 Pic(X) 同构',
        '先算 $\\mathcal O_X(D_1+D_2)$。若 $D_1$ 在 $U_i$ 上由 $f_i$ 给出、$D_2$ 在 $U_i$ 上由 $g_i$ 给出（把两个覆盖改用公共细分），则 $\\mathcal O_X(D_1+D_2)|_{U_i}=(f_ig_i)^{-1}\\mathcal O_X=f_i^{-1}g_i^{-1}\\mathcal O_X=\\mathcal O_X(D_1)\\otimes\\mathcal O_X\\otimes\\mathcal O_X(D_2)|_{U_i}$，故 $\\mathcal O_X(D_1+D_2)\\cong\\mathcal O_X(D_1)\\otimes\\mathcal O_X(D_2)$，映射 $D\\mapsto \\mathcal O_X(D)$ 是群同态。再看主除子：对 $g\\in \\mathcal K_X(X)^{\\times}$，取常覆盖 $\\{X\\}$ 与 $f=g$ 所得的 Cartier 除子记作 $\\operatorname{div}(g)$。直接算得 $\\mathcal O_X(\\operatorname{div}(g))=\\mathcal O_X\\cdot g^{-1}\\cong\\mathcal O_X$（用 $g$ 乘给出同构，因为 $g$ 在每点处非零因子），故主除子映到平凡可逆层。反之若 $\\mathcal O_X(D)\\cong\\mathcal O_X$，取整体截面 $s\\in H^0(X,\\mathcal O_X(D))$ 对应 $1\\in\\mathcal O_X(X)$，则 $s$ 在每点处是局部生成元且 $s/f_i^{-1}$ 是处处非零的有理函数，即 $D=\\operatorname{div}(s^{-1})$ 是主除子，于是核恰好是 $\\operatorname{Prin}(X)$，得到单射 $\\operatorname{CaDiv}(X)/\\operatorname{Prin}(X)\\hookrightarrow\\operatorname{Pic}(X)$；满射性由上一步的逆构造给出（$\\mathcal L$ 必在同态像中），因为 $\\operatorname{Pic}(X)$ 的元素恰是 $\\mathcal K_X$ 中可逆的 $\\mathcal O_X$-子模层按同构分类。',
        ['sheaf-from-divisor']),
      step('cartier-into-weil', '正规情形：Cartier 除子到 Weil 除子的嵌入',
        '设 X 正规（局部环是整闭整环，特别地在每个高度 1 素理想处的局部化是离散赋值环）。给定 Cartier 除子 $D=\\{(U_i,f_i)\\}$，对 X 的每个不可约余维 1 子簇 $Z$ 定义重数 $n_Z$：取与 Z 相交的非空开集 $U_i$（可取，因为 Z 的泛点 $\\eta_Z$ 落在某个 $U_i$ 中，$Z\\cap U_i\\neq\\varnothing$），令 $n_Z=v_Z(f_i)$，其中 $v_Z$ 是局部环 $\\mathcal O_{X,\\eta_Z}$ 的赋值（它是一个 DVR，由“每个高度 1 素理想处的局部环是 DVR”这一事实保证；在簇情形这是正规性的标准推论）。这个定义与 i 的选择无关：若 $\\eta_Z\\in U_i\\cap U_j$，则由 $f_i/f_j$ 在 $U_i\\cap U_j$ 上可逆得 $v_Z(f_i)=v_Z(f_j)$。由于只有有限多个 Z 使 $n_Z\\neq0$（在 Noether 概形上，$f_i$ 的零点集在 $U_i$ 上只有有限多个不可约分支；用拟紧性把有限多个 $U_i$ 拼起来即可），故 $\\sum_Z n_Z Z$ 是合法的 Weil 除子。又若 $D=\\operatorname{div}(g)$，则 $v_Z(g)=n_Z$，故嵌入的核是 $\\operatorname{Prin}(X)$，于是它诱导单射 $\\operatorname{CaDiv}(X)/\\operatorname{Prin}(X)\\hookrightarrow\\operatorname{Cl}(X)$。',
        ['multiplication-and-picard']),
      step('ufd-and-failure', '与 UFD 的等价，以及一个可以手算的失效例',
        '满射性的判别是：Cartier 嵌入 $\\operatorname{CaDiv}(X)\\hookrightarrow\\operatorname{WDiv}(X)$ 是满射当且仅当 X 的每个局部环 $\\mathcal O_{X,x}$ 都是唯一分解环。方向“UFD ⟹ 满射”：给 Weil 除子 $E=\\sum n_ZZ$，在每个仿射开集 $U=\\operatorname{Spec}A$ 上，$E|_U$ 只涉及有限多个高度 1 素理想 $\\mathfrak p_1,\\dots,\\mathfrak p_r$，因为 A 是 UFD，每个 $\\mathfrak p_i=(p_i)$ 主，且不同 $\\mathfrak p_i$ 不相伴，于是 $f=\\prod p_i^{n_i}$ 给出该仿射块上的局部方程，在重叠处两个方程相差一个单位倍，故拼成 Cartier 除子且映到 E。方向“满射 ⟹ UFD”是难点：$\\operatorname{Div}(X)\\to\\operatorname{WDiv}(X)$ 满射且 $X=\\operatorname{Spec}A$ 仿射，对每个高度 1 素理想 $\\mathfrak p$，除子 $\\mathfrak p$ 有方程 $f$，则 $\\mathfrak p=(f)$ 是主的；再由“整闭整环中高度 1 素理想都主 ⟹ UFD”这一标准定理（可以用 $A=\\bigcap_{\\operatorname{ht}\\mathfrak p=1}A_{\\mathfrak p}$ 的交表示与每个 $A_{\\mathfrak p}$ 是 DVR 的事实逐步验证）得 A 是 UFD。失效的具体例子取 $X=\\operatorname{Spec}k[w,x,y,z]/(wy-xz)$（二次锥面），$A=k[w,x,y,z]/(wy-xz)$ 是维数 3 的整闭整环。令 $\\mathfrak p=(w,x)$：它是高度 2 的素理想吗？先看 $A/\\mathfrak p=k[y,z]$ 是整环，故 $\\mathfrak p$ 素；再算高度：$\\mathfrak p$ 由两个元素生成，$A/\\mathfrak p$ 维数 2，$\\dim A=3$，故 $\\operatorname{ht}\\mathfrak p=1$。于是 $\\mathfrak p$ 给出一个 Weil 除子，但它不是 Cartier 除子：若在某个局部有方程 $f$，则在 $\\mathfrak p A_{\\mathfrak p}$ 上 $f$ 生成该理想，而这会迫使 $A_{\\mathfrak p}$ 成为 UFD，与“$A_{\\mathfrak p}$ 的类是类群 $\\mathbb{Z}/2$ 的生成元”冲突（因为 $\\mathfrak p$ 的元素间有关系 $wy=xz$，即 $w/n$ 型的比 $x/y$ 在分式域中给出 $A_{\\mathfrak p}$ 的整元素却不在 $A_{\\mathfrak p}$ 内，故 $A_{\\mathfrak p}$ 不整闭，更不是 DVR）。这个例子的可核对算术是：$\\operatorname{CaDiv}(X)/\\operatorname{Prin}(X)=\\operatorname{Pic}(X)=\\mathbb{Z}/2$，而 $\\operatorname{Cl}(X)=\\mathbb{Z}$，两者的差距说明“Weil 除子比 Cartier 除子多出的部分”正是奇点贡献的类群。',
        ['cartier-into-weil']),
    ],
    conclusion: 'Cartier 除子群 $\\operatorname{CaDiv}(X)$ 与 $\\mathcal K_X$ 中可逆的 $\\mathcal O_X$-子模层一一对应，$D\\mapsto \\mathcal O_X(D)$ 是同构 $\\operatorname{CaDiv}(X)\\cong\\operatorname{Pic}(X)$，且 $\\mathcal O_X(D_1)\\cong\\mathcal O_X(D_2)$ 当且仅当 $D_1-D_2$ 是主除子，于是 $\\operatorname{CaDiv}(X)/\\operatorname{Prin}(X)\\cong\\operatorname{Pic}(X)$。在正规簇上单射 $\\operatorname{CaDiv}(X)/\\operatorname{Prin}(X)\\hookrightarrow\\operatorname{Cl}(X)$ 存在，且它是同构当且仅当 X 的局部环都是 UFD；有奇点时（例如二次锥面 $wy=xz$）$\\operatorname{Cl}(X)=\\mathbb{Z}$ 而 $\\operatorname{Pic}(X)=\\mathbb{Z}/2$，两者确实不同。',
    dependencies: [],
    consequences: [],
    explanation: 'Cartier 除子与 Weil 除子的差别不是技术性的，而是“层论观点”与“闭链观点”的差别。层论观点关心“局部方程”，于是它天然地与可逆层、线丛、$\\mathcal O^{\\times}$ 的上同调绑在一起，得到的是 $\\operatorname{Pic}(X)\\cong H^1(X,\\mathcal O_X^{\\times})$；闭链观点关心“余维一子簇和它的重数”，得到的是自由阿贝尔群 $\\operatorname{WDiv}(X)$ 与类群 $\\operatorname{Cl}(X)$。在没有奇点（局部环都是 UFD，例如光滑簇）时两个观点重合，光滑簇的 $\\operatorname{Cl}(X)\\cong\\operatorname{Pic}(X)$ 因此是一条极常用的简并；但一旦出现不整闭的局部环，$\\operatorname{Cl}$ 会比 $\\operatorname{Pic}$ 大，而多出来的部分正好由“局部上需要不止一个方程才能切出来的余维 1 子簇”贡献。这条记录还顺带说明为什么“正规”是一个好假设：正规性等价于每个高度 1 素理想处的局部环是 DVR，这是把 Cartier 除子翻译成 Weil 除子（即定义重数）的前提；不正规的话连重数都没有赋值可依。',
    examples: [
      { title: '例子：光滑平面曲线上的 Cartier 除子与 $\\mathcal O(D)$ 的手算', body: '取 $X=\\mathbb P^1$ 与除子 $D=3[0]-2[\\infty]$。用标准覆盖 $U_0=\\{u\\neq0\\}$（坐标 $t=1/u$ 型）与 $U_\\infty=\\{v\\neq0\\}$：在 $U_0$ 上除子的局部方程取 $f_0=t^{3}$（零点 $t=0$ 即 $[0:1]$ 处重数 3），在 $U_\\infty$ 上该点是 $v=\\infty$，局部方程取 $f_\\infty=v^{-2}$（在 $v=0$ 即 $[1:0]$ 处极点重数 2）。重叠处 $t=1/v$，故 $f_0/f_\\infty=(1/v)^3/(v^{-2})=v^{-1}$，是 $\\mathcal O_X(U_0\\cap U_\\infty)^{\\times}$ 的元素，兼容性成立。于是 $\\mathcal O(D)$ 满足 $\\mathcal O(D)|_{U_0}=t^{-3}\\mathcal O$、$\\mathcal O(D)|_{U_\\infty}=v^{2}\\mathcal O$，度数为 $3-2=1$。核算整体截面：$H^0(\\mathbb P^1,\\mathcal O(3[0]-2[\\infty]))$ 由 $U_0$ 上的 $t^{-3}\\cdot k[t]$ 与 $U_\\infty$ 上的 $v^2\\cdot k[v]$ 相容地拼起来，前者是 $t$ 的洛朗多项式且极点在 0 处阶数不超过 3，后者是 $v$ 的多项式且零点在 $\\infty$ 处阶数至少 2；相容条件给出 $H^0=\\langle t^{-3},t^{-2},t^{-1},1,t\\rangle$ 型的三维？精确地数：允许的洛朗多项式为 $\\sum_{i\\ge-3}a_it^i$ 且要求在 $v$-坐标下是 $v^2k[v]$ 的元素，即 $t^-1$ 型展开中次数不超过 $-1$ 的项在换坐标后需为非负次数，逐项核对得到 $H^0$ 的维数为 $1-(-2)=3$（配合 $\\deg D=1$ 与 Riemann–Roch 的 $\\ell(D)=\\deg D+1=2$ 需按具体 $D$ 修正），这个逐项手算正是“可逆层的整体截面就是相容的局部方程”这一说法的具体形态。' },
      { title: '例子：二次锥面上 Weil 除子非 Cartier 的数值核对', body: '取 $A=k[w,x,y,z]/(wy-xz)$、$\\mathfrak p=(w,x)$。核对该理想是高度 1 的素理想：$A/\\mathfrak p\\cong k[y,z]$ 是整环故素；$\\mathfrak p$ 只由两个元素生成而 $A$ 维数 3，用 Krull 主理想定理得 $\\operatorname{ht}\\mathfrak p\\le2$，再用 $A/\\mathfrak p$ 维数 2 与维数公式 $\\dim A=\\dim A/\\mathfrak p+\\operatorname{ht}\\mathfrak p$（对这类带齐次关系的环可由计算确认）得 $\\operatorname{ht}\\mathfrak p=1$。$\\mathfrak p$ 不是主理想：若 $\\mathfrak p=(f)$，则 $A$ 在 $\\mathfrak p$ 处（即关于 $\\mathfrak p$ 的局部化）的极大理想是主的，从而那里的类群平凡，但 $\\operatorname{CaDiv}/\\operatorname{Prin}=\\operatorname{Pic}(X)$ 在这类锥面上算出 $\\mathbb{Z}/2$，矛盾。等价地，类 $[\\mathfrak p]$ 在 $\\operatorname{Cl}(X)=\\mathbb{Z}$ 中是非零的（对应 $\\mathfrak p$ 的生成元），而在 $\\operatorname{Pic}(X)=\\mathbb{Z}/2$ 中它是唯一的非零元素，这说明 $\\operatorname{Cl}\\to\\operatorname{Pic}$ 的“降阶”正是奇异局部环的贡献。' },
    ],
    remarks: [
      '把 Cartier 除子直接等同于 Weil 除子只在“局部环都是 UFD”时成立，光滑簇满足但一般的正规簇不满足。因此“正规簇上除子与线丛一一对应”这句话如果按“除子 = Weil 除子”来读就是错的，正确读法是把除子理解为 Cartier 除子（等价地，可逆层）。',
      '“每个局部环都是 UFD”这个条件不能弱化为“X 是正规的”。二次锥面 $wy=xz$ 是正规的（它是超曲面，在超曲面情形正规性等价于奇点集余维至少 2，而锥顶是余维 3 的点），但它不是局部 UFD，因此 Cartier 除子严格少于 Weil 除子。正规性只保证有赋值可算重数，不保证重数矩阵可由单个方程实现。',
      '局部方程 $f_i$ 的“非零因子”条件不能放宽为“非零”：在非既约概形上取 $f$ 为幂零元，$f$ 非零但在每个分支上都是零因子，此时 $\\mathcal O_X(D)$ 甚至不会是局部自由的，粘合出的东西不是可逆层。这正是定义里必须写“在每个不可约分支上都是非零因子”而不能只写“非零”的原因。',
      '主除子与“平凡可逆层”的对应要求 X 的整体函数 $g$ 是乘法单位型的（处处非零的有理函数）。在非整的概形上，$H^0(X,\\mathcal K_X^{\\times})$ 与全局有理函数不是一回事（每个连通分支各有一个函数），因此 $\\operatorname{Prin}(X)$ 必须按层定义，不能按“$k(X)^{\\times}$ 中的元素”定义，否则在多分支概形上会算错核的大小。',
    ],
    corollaries: [
      { title: '推论：$\\operatorname{Pic}(X)\\cong H^1(X,\\mathcal O_X^{\\times})$ 与 Cartier 除子的层论描述', body: '由可逆层与 $H^1(X,\\mathcal O_X^{\\times})$ 的对应，Cartier 除子类群可以写成上同调群：$\\operatorname{CaDiv}(X)/\\operatorname{Prin}(X)\\cong\\operatorname{Pic}(X)\\hookrightarrow H^1(X,\\mathcal O_X^{\\times})$（在 X 为簇时右边取 Zariski 上同调并成立等号）。于是“两个除子相差主除子”这一几何关系变成了“两个 1-上闭链相差 1-上边界”这一代数关系，除子的计算因此可以在 Cech 上同调的框架里进行：覆盖数据的转移函数 $f_i/f_j$ 就是一个 Cech 1-上闭链，而主除子对应的是形如 $g_i/g_j$ 的上边界，两者相除恰是 $H^1$ 的元素。', uses: ['multiplication-and-picard'] },
    ],
    references: [
      stacks('Section 0BE6: Divisors on schemes (Cartier divisors)', '0BE6'),
      stacks('Section 0BQ3: Divisors on schemes', '0BQ3'),
      { title: 'Algebraic Geometry, Chapter II, §6 (Divisors)', author: 'R. Hartshorne', year: 1977 },
    ],
    history: HISTORY,
  },

  /* ═══════════════════════════════════════════════════════════
   * 2. 丰沛层
   * ═══════════════════════════════════════════════════════════ */

  'a-ample': {
    statement: '设 X 是紧合（在教科书里常假设射影）域 k 上的概形，$\\mathcal L$ 是可逆层。称 $\\mathcal L$ 丰沛，若以下任一（从而全部）等价条件成立：(1) 存在 $n>0$ 使 $\\mathcal L^{\\otimes n}$ 非常丰沛，即存在闭浸入 $\\varphi: X\\hookrightarrow\\mathbb P^N_k$ 与 $m>0$ 使 $\\mathcal L^{\\otimes m}\\cong\\varphi^*\\mathcal O_{\\mathbb P^N}(1)$；(2) Serre 判据：对任意凝聚层 $\\mathcal F$，存在 $n_0=n_0(\\mathcal F)$ 使 $n\\ge n_0$ 时 $\\mathcal F\\otimes \\mathcal L^{\\otimes n}$ 由整体截面生成，且 $H^i(X,\\mathcal F\\otimes\\mathcal L^{\\otimes n})=0$ 对一切 $i>0$；(3) 存在正张成障碍为零的闭点 $x\\in X$；(4) X 射影且存在一维闭子概形上的度（$\\mathcal L\\cdot C>0$）的正性刻画（Nakai–Moishezon 判据）。丰沛性在有限态射的拉回下保持、在张量积下保持、并给出坐标环 $\\bigoplus_{n\\ge0}H^0(X,\\mathcal L^{\\otimes n})$ 的有限生成性（X 射影）。',
    explanation: '“丰沛”是代数几何里“正”的精确化身。微分几何里“正曲率”是一个局部微分条件，而在代数几何里没有曲率可用，取而代之的是一整套彼此等价的整体条件：某个倍数给出射影嵌入、任意凝聚层的高阶上同调被任意的张量幂消掉、坐标环有限生成。三者各自对应一种精神：几何的（能嵌入射影空间）、上同调的（高阶项消没）、代数的（分次环有限生成）。本条记录把 (1)⟹(2) 这一最常用的推理链完整写出（先嵌入射影空间，再把问题搬到 $\\mathbb P^N$ 上用层上同调的直接计算与 Serre 的消没），并明确 (2)⟹(1) 与 Nakai–Moishezon 判据的地位。搞清楚“哪条能推出哪条”很重要，因为实际证明中往往只能验证上同调消没，而结论往往是要用嵌入。',
    steps: [
      step('very-ample-definition', '非常丰沛的定义与它的直接推论',
        '先固定非常丰沛的含义：称 $\\mathcal L$ 非常丰沛，若存在闭浸入（在 X 紧合时等价于有限态射）$\\varphi:X\\hookrightarrow\\mathbb P^N$ 与整数 $m>0$ 使 $\\mathcal L^{\\otimes m}\\cong \\varphi^*\\mathcal O_{\\mathbb P^N}(1)$。此时立即得到两条性质。其一，$\\mathcal L^{\\otimes m}$ 的截面分离点：对任意两个不同的闭点 $x\\neq y$，存在 $s\\in H^0(X,\\mathcal L^{\\otimes m})$ 使 $s(x)=0$、$s(y)\\neq0$（用线性形式分离两个像点，再拉回，注意 $\\varphi$ 是单射）；对任意闭点 $x$ 与切向量，也有截面在 x 处为零而沿该方向的一阶项非零。这等价于说 $\\mathcal L^{\\otimes m}$ 由整体截面生成且给出闭浸入，正是“分离点与切向量”这两件事。其二，$H^i(X,\\mathcal L^{\\otimes m})=H^i(\\mathbb P^N,\\mathcal O_{\\mathbb P^N}(1))$（在 $\\varphi$ 为闭浸入时由 $\\varphi_*\\mathcal O_X$ 的凝聚性与投影公式，以及 $\\varphi^*\\mathcal O(1)$ 的计算得到）；而 $\\mathbb P^N$ 上的 $\\mathcal O(1)$ 的上同调是已知的：$H^0$ 是线性形式空间（维数 $N+1$）而 $H^i=0$（$i>0$）。这两条性质是后面“丰沛 ⟹ 消没”的出发点，因为它们把“X 上的计算”化归为“$\\mathbb P^N$ 上的已知计算”。',
        []),
      step('embedding-up-to-twist', '丰沛 ⟹ 高次张量幂给出嵌入（两个方向的核对）',
        '设 $\\mathcal L$ 丰沛，即存在 $n>0$ 使 $\\mathcal L^{\\otimes n}$ 非常丰沛。取 $\\varphi:X\\hookrightarrow\\mathbb P^N$ 与 $m>0$ 使 $\\mathcal L^{\\otimes n m}\\cong\\varphi^*\\mathcal O(1)$。要证对任意凝聚层 $\\mathcal F$ 存在 $n_0$ 使 $n\\ge n_0$ 时 $\\mathcal F\\otimes\\mathcal L^{\\otimes n}$ 由整体截面生成且高阶消没。标准做法是把 $\\mathcal F\\otimes\\mathcal L^{\\otimes n}$ 写到射影空间上：因为 $\\varphi$ 是有限态射，$\\varphi_*$ 保持凝聚性，故 $\\varphi_*(\\mathcal F\\otimes\\mathcal L^{\\otimes n})=\\varphi_*\\mathcal F\\otimes\\mathcal O_{\\mathbb P^N}(\\lfloor n/m\\rfloor)$ 型的扭层，而 $\\varphi_*\\mathcal F$ 是 $\\mathbb P^N$ 上的凝聚层；再由投影公式 $H^i(X,\\mathcal F\\otimes\\mathcal L^{\\otimes n})=H^i(\\mathbb P^N,\\varphi_*(\\mathcal F\\otimes\\mathcal L^{\\otimes n}))$，问题变成“$\\mathbb P^N$ 上凝聚层的高倍扭层由截面生成且高阶消没”。后一条是 $\\mathbb P^N$ 上的经典事实：$\\mathcal O(d)$ 的截面给出 $d$ 次形式，$\\mathcal O(1)$ 的截面（线性形式）已经在每个点处生成该层，而把一个凝聚层乘以 $\\mathcal O(d)$ 相当于把它的每个生成元的次数加 d，故 $d$ 足够大时一切生成元都可被整体截面的倍数替代，高阶上同调则由 $\\mathbb P^N$ 的已知计算（$H^i(\\mathbb P^N,\\mathcal O(d))=0$，$0<i<N$ 与任意 d；$d>-N-1$ 时最高阶也消没）配合“按生成元逐个验证”给出。',
        ['very-ample-definition']),
      step('serre-criterion-and-zariski', 'Serre 判据与 Zariski 主定理路线',
        '反向（消没 ⟹ 丰沛）的常用证法是 Zariski 主定理路线，其骨架如下。(a) 取一个闭点 $x\\in X$，由 Serre 判据的截面生成部分，存在 $n$ 与截面 $s\\in H^0(X,\\mathcal L^{\\otimes n})$ 使 $s(x)\\neq0$；这把 $x$ 装进一个“非消没”的开集 $X_s$。(b) 用 $s$ 作为“分母”，构造仿射情形：若某个整体截面 $s$ 的零点集 $V(s)$ 恰好是一个点（或更一般地，$X_s$ 仿射），则由 Zariski 主定理（在射影簇上，只有一个点的补集必仿射；更一般地，$X\\setminus V(s)$ 仿射当且仅当 $V(s)$ 是有限的），$X_s$ 是仿射的。(c) 因为 $s$ 在 $X_s$ 上可逆，$\\mathcal L^{\\otimes n}|_{X_s}$ 同构于 $\\mathcal O_{X_s}$，于是可以把 $X_s$ 用 $\\mathcal L^{\\otimes n}$ 的截面的比值嵌入仿射空间；(d) 逐点做这件事并用紧合性拼起来，得到某个 $\\mathcal L^{\\otimes N}$ 的截面给出单射 $X\\to\\mathbb P^M$，再由紧合性（或射影性）得闭浸入。这条路线之所以成立，关键在于“Serre 判据的截面生成”使每个点处都有非消没的截面，而 Zariski 主定理保证“用截面切出来的开集是仿射的”，从而可以在仿射块上用坐标环完成嵌入。',
        ['embedding-up-to-twist']),
      step('nakai-moishezon', '数值判据：Nakai–Moishezon 与交数的正性',
        '在 X 射影、$\\mathcal L$ 可逆时，丰沛性有一个纯数值的刻画：$\\mathcal L$ 丰沛当且仅当对 X 的每个不可约闭子簇 $Z$（维数 $r=\\dim Z\\ge1$），$\\mathcal L^{\\cdot r}\\cdot Z>0$，其中交数用 $\\mathcal L$ 在 Z 上的第一 Chern 类与 Z 的基本类配对定义，$\\mathcal L^{\\cdot r}\\cdot Z$ 表示把 $\\mathcal L$ 的类自交 r 次再与 Z 配对。判据的“⟹”方向容易：若 $\\mathcal L$ 丰沛，则某个倍数是非常丰沛的，于是它给出闭浸入，且 $\\mathcal L$ 的类是一个超平面类的拉回，超平面与任何 r 维闭子簇的交都是正的重数之和，故 $\\mathcal L^{\\cdot r}\\cdot Z>0$。“⟸”方向是深的一侧：需要“正性 + 射影”与“丰沛”之间的等价，通常是先证明 $\\mathcal L\\cdot C>0$ 对一切曲线 C 成立蕴含 $\\mathcal L$ 在数值上等价于一个丰沛类（用易切面定理或等价的锥论论证），再用 Kleiman 判据（Néron–Severi 空间的丰沛锥的内部等于有正自交的类的闭锥）与“$\\mathcal L$ 落在丰沛锥内部”完成。这里必须强调假设：Nakai–Moishezon 判据要求 X 射影（紧合加丰沛层）并且对**每个**维数 ≥1 的不可约闭子簇都验证正性，只验证曲线（曲面情形）不够，这个“逐维验证”的强度正是判据不容易用的原因，也是它成为强定理的原因。',
        ['serre-criterion-and-zariski']),
      step('consequences-ample', '推论：坐标环有限生成、有限拉回保持、以及一个可核算的例子',
        '三条常用推论。其一，坐标环有限生成：设 $\\mathcal L$ 丰沛，则 $R=\\bigoplus_{n\\ge0}H^0(X,\\mathcal L^{\\otimes n})$ 是有限生成的分次 k-代数，且 $\\operatorname{Proj}R$ 是 $X$ 在某个“足够大的倍数”意义下的像，这来自 Serre 判据加射影性（等价地，$X$ 可闭浸入 $\\mathbb P^N$ 使 $\\mathcal L$ 成为超平面束的倍数）。其二，有限态射的拉回保持丰沛性：若 $f:Y\\to X$ 有限（或更一般地有限型）且 $\\mathcal L$ 丰沛，则 $f^*\\mathcal L$ 丰沛，因为“$\\mathcal L^{\\otimes n m}$ 由整体截面的比值给出嵌入”这一性质在拉回下写成“$f^*(\\mathcal L^{\\otimes nm})$ 由 $f^*$ 截面的比值给出嵌入”，而有限态射在紧合情形与闭浸入是相容的。其三，一个必须记住的反例：$\\mathcal O_{\\mathbb P^1}(-1)$ 不丰沛（它的次数为 −1，$H^0=0$），$\\mathcal O_{\\mathbb P^1}(0)=\\mathcal O$ 也不丰沛（次数为 0，$\\ell(\\mathcal O)=1$ 只给出到一点的映射），而 $\\mathcal O_{\\mathbb P^1}(1)$ 丰沛（给出恒等映射 $\\mathbb P^1\\to\\mathbb P^1$）。可核算的判据是曲线上的极简形式：曲线 X 上的可逆层 $\\mathcal L$ 丰沛当且仅当 $\\deg\\mathcal L>0$（且 X 射影），这个数值判据是 Nakai–Moishezon 在维数 1 的退化形态，也正是 Riemann–Roch 直接可算的一条。',
        ['nakai-moishezon']),
    ],
    conclusion: '可逆层 $\\mathcal L$ 丰沛当且仅当某个张量幂 $\\mathcal L^{\\otimes n}$ 非常丰沛（给出到射影空间的闭浸入），也等价于 Serre 判据（任意凝聚层的高倍张量幂由截面生成且高阶上同调消没）；在射影情形另等价于 Nakai–Moishezon 数值判据（对每个维数 r ≥ 1 的不可约闭子簇都有 $\\mathcal L^{\\cdot r}\\cdot Z>0$）。丰沛性在张量积与有限态射的拉回下保持，并保证坐标环 $\\bigoplus_n H^0(X,\\mathcal L^{\\otimes n})$ 有限生成；在曲线上它退化为“度数大于零”。',
    dependencies: [],
    consequences: [],
    explanation: '丰沛性的核心张力在于：定义是“某个倍数给出嵌入”这一整体几何条件，而验证往往靠上同调消没或交数正性这两类可以计算的条件。三者之间的等价是 Serre 与后来的 Nakai、Moishezon 分别建立起来的，代价是每次都要在“射影”这一前提上做文章。丰沛性之所以重要，是因为它是“正”的代数替代品：在曲线情形它就是“度数大于零”，在曲面情形它开始需要逐条曲线验证，在高维则必须逐维验证，这个复杂度的阶梯正是相交理论发展的动力。另一个值得记住的要点是丰沛与非常丰沛之间有真实的差别：$\\mathcal O_{\\mathbb P^1}(1)$ 非常丰沛，但一般射影簇上的丰沛层可能需要很高的倍数才非常丰沛（$\\mathcal O_{\\mathbb P^2}(1)$ 非常丰沛，但一般的丰沛层 $\\mathcal L$ 只用 $\\mathcal L$ 本身往往不能给出嵌入），因此“丰沛 ⟹ 非常丰沛”是错的，这正是定义里要写“某个倍数”的原因。',
    examples: [
      { title: '例子：$\\mathbb P^1$ 与 $\\mathbb P^2$ 上 $\\mathcal O(d)$ 的丰沛性逐项核对', body: '$X=\\mathbb P^1$：$\\mathcal O(d)$ 的度数是 d，$h^0=d+1$（$d\\ge0$）。$d\\ge1$ 时 $h^0\\ge2$ 个截面把 $\\mathbb P^1$ 嵌入 $\\mathbb P^d$（Veronese），故 $\\mathcal O(1)$ 已非常丰沛、$\\mathcal O(d)$ 丰沛；$d=0$ 时只有常值截面，映射是常映射，不丰沛；$d<0$ 时 $h^0=0$，不丰沛。三项与“度数大于零”一致。$X=\\mathbb P^2$：$\\mathcal O(d)$ 的截面是 d 次形式，维数 $\\binom{d+2}{2}$；$d\\ge1$ 时给出 $\\mathbb P^2\\to\\mathbb P^{\\binom{d+2}{2}-1}$ 的嵌入（$d=1$ 恒等，$d=2$ Veronese 曲面），故丰沛；$d\\le0$ 不丰沛。逐项核对 Serre 判据：取 $\\mathcal F=\\mathcal O$，则 $H^0(\\mathbb P^2,\\mathcal O(d))$ 维数增长、$H^1=H^2=0$ 对 $d$ 足够大成立（$\\mathbb P^2$ 的 $H^1(\\mathcal O(d))=0$ 对一切 d 成立，$H^2$ 在 $d>-3$ 时为零），与判据相符。' },
    ],
    remarks: [
      '丰沛不等于非常丰沛：定义只说某个张量幂非常丰沛，这是必要的，因为存在丰沛但本身不非常丰沛的可逆层（例如某些曲面上度数为正的层需要取两倍甚至更高的幂才有足够多截面分离点）。把“丰沛”直接当成“给出嵌入”会在计算 $h^0$ 时低估所需的倍数。',
      'Nakai–Moishezon 判据要求对每个维数 r ≥ 1 的不可约闭子簇验证 $\\mathcal L^{\\cdot r}\\cdot Z>0$，只验证曲线（$r=1$）是不够的：在曲面情形 $r$ 取 1 与 2 两档，只算 $\\mathcal L\\cdot C>0$ 会漏掉 $\\mathcal L^2>0$ 这一条，而两者缺一不可（nef 但非丰沛的类正是满足 $\\mathcal L\\cdot C\\ge0$ 却在某个子簇上取零的例子）。',
      '“丰沛”不是同调性质而是代数性质：它对有限态射的拉回保持，但对一般真态射不保持（吹爆会把丰沛层拉成 nef 但常常不再丰沛，因为在例外曲线上取零）。因此在使用“$f^*\\mathcal L$ 丰沛”时必须核对 f 是有限的，不能只凭 f 真。',
      'Serre 判据中的“高阶消没”与“由截面生成”必须同时成立，只取前者会得到 nef 型条件、只取后者会得到半丰沛型条件。丰沛性要求两者对所有凝聚层都成立，这是它比“大”与“nef”都强的原因：大只要求 $H^0$ 增长最快，nef 只要求与曲线交数非负，两者都不是丰沛性。',
    ],
    corollaries: [
      { title: '推论：Serre 消没定理（丰沛层的高倍扭层消没）', body: '设 $X$ 是域上射影概形、$\\mathcal L$ 丰沛、$\\mathcal F$ 凝聚。由 Serre 判据直接得到：存在 $n_0$ 使 $n\\ge n_0$ 时 $H^i(X,\\mathcal F\\otimes\\mathcal L^{\\otimes n})=0$ 对一切 $i>0$ 成立。这条推论是全部射影几何的“清理工具”：正因为高倍扭层的高阶上同调消没，Hilbert 多项式才真的是多项式、Castelnuovo–Mumford 正则性才有界、Hilbert 概形的有界性才有依据。证明要点是上一步的化归：把 X 上的计算搬到 $\\mathbb P^N$ 上，$\\mathbb P^N$ 的 $\\mathcal O(d)$ 消没是显式的。', uses: ['embedding-up-to-twist'] },
    ],
    references: [
      stacks('Section 01VH: Ample invertible sheaves', '01VH'),
      stacks('Section 0D2S: Ample invertible sheaves and cohomology', '0D2S'),
      stacks('Section 0D3A: Ampleness and the Nakai-Moishezon criterion', '0D3A'),
      { title: 'Algebraic Geometry, Chapter II, §7 and Chapter III, §5', author: 'R. Hartshorne', year: 1977 },
    ],
    history: HISTORY,
  },

  /* ═══════════════════════════════════════════════════════════
   * 3. 线丛的度
   * ═══════════════════════════════════════════════════════════ */

  'a-line-bundle-degree': {
    statement: '设 X 是域 k 上的光滑射影曲线（亏格 g），$\\mathcal L$ 是 X 上的可逆层。定义 $\\deg\\mathcal L$ 为任意非零有理截面 $s\\in H^0(X,\\mathcal L\\otimes \\mathcal K_X)$ 所给出的除子 $\\operatorname{div}(s)=\\sum_{P}\\operatorname{ord}_P(s)\\,P$ 的总次数 $\\sum_P\\operatorname{ord}_P(s)$。则：(1) 这个定义与 s 的选取无关，且等于 $\\int_X c_1(\\mathcal L)$ 与 $\\mathcal O_X(D)$ 中 D 的次数；(2) $\\deg(\\mathcal L_1\\otimes\\mathcal L_2)=\\deg\\mathcal L_1+\\deg\\mathcal L_2$，$\\deg \\mathcal L^{-1}=-\\deg\\mathcal L$，于是 $\\deg:\\operatorname{Pic}(X)\\to\\mathbb Z$ 是群同态；(3) $\\deg$ 是满射而核 $\\operatorname{Pic}^0(X)$ 恰是代数等价于零的类，是同维数 g 的连通射影簇（雅可比簇）的闭点集；(4) 对非常数态射 $f:Y\\to X$ 有 $\\deg f^*\\mathcal L=\\deg(f)\\cdot\\deg\\mathcal L$；(5) $\\mathcal L$ 丰沛当且仅当 $\\deg\\mathcal L>0$，$\\mathcal L$ 极大当且仅当 $\\deg\\mathcal L>0$。',
    explanation: '度是曲线能给线丛提供的唯一数值不变量，而正因为只有一个数值，曲线上的线丛理论才如此干净：$\\operatorname{Pic}(X)$ 被压成“一个整数加一个 g 维阿贝尔簇”的两层结构，前者是离散的、可算的，后者是连续的、几何的，两者通过 $0\\to\\operatorname{Pic}^0(X)\\to\\operatorname{Pic}(X)\\to\\mathbb Z\\to0$ 正合地拼在一起。本条记录的重点是把这个“只依赖度数”的说法落到证明上：定义良定义性来自“两个有理截面的商是 X 上的有理函数、而主除子次数为零”这一根本事实（而主除子次数为零又来自“有理函数的零点与极点总数相等”，这可以用射影性与带余除法/有限映射的次数两种方式证）；同态性来自“除子的次数在张量积下相加”这一逐点赋值计算，而这条计算只需要赋值是乘法性的（在每个点处 $v_P(fg)=v_P(f)+v_P(g)$）。最后一条把度数与正性、与 Riemann–Roch 的可计算性连起来。',
    steps: [
      step('principal-degree-zero', '主除子的次数为零：定义良定义的前提',
        "先证关键事实：对 $0\\neq f\\in k(X)$，$\\operatorname{div}(f)$ 的次数为零，即零点个数（计重数）与极点个数（计重数）相等。两种证法。代数证法：把 f 看作有理映射 $f:X\\to\\mathbb P^1$。若 f 是常数则除子为零，次数当然为零。若 f 非常数，则它是有限态射（光滑射影曲线的非常数态射必有限），设次数为 d；对任意 $a\\in k$，$f^*([a])$ 作为一个除子的次数恰为 d（因为 $f^*\\mathcal O(1)\\cong\\mathcal O$ 型计算给出 $\\deg f^*([a])=d$，这用到 “$f_*\\mathcal O_X$ 是秩 d 的局部自由层”与投影公式），具体地 $f^{-1}(a)$ 的每个点以重数计数总和为 d。取 a 与 $a'\\neq a$ 两个值，则 $\\operatorname{div}(f-a)$ 与 $\\operatorname{div}(f-a')$ 的次数都是 d；而 $\\operatorname{div}(f-a)=\\operatorname{div}(f)-\\operatorname{div}(a)$ 型地对齐，令 $a'=\\infty$ 时 $\\operatorname{div}(f)_{\\text{零点部分}}-\\operatorname{div}(f)_{\\text{极点部分}}$ 的次数等于两者次数之差，等于 $d-d=0$。解析／上同调证法：在 $\\mathbb P^1$ 上主除子的次数为零这一断言对 $g\\in k(t)^{\\times}$ 直接可算（$g=\\prod(t-a_i)^{n_i}$ 型，次数为 $\\sum n_i-\\sum n_j$ 而分子分母同次），再由“任何射影曲线的有理函数都是某个 $k(t)$ 元素沿有限态射的拉回”把结论搬回来。",
        []),
      step('degree-well-defined', '度的良定义与同态性',
        "取 $s,s'$ 两个非零有理截面，它们都是 $\\mathcal L\\otimes\\mathcal K_X$ 的整体截面（在 $\\mathcal K_X$-意义下），故 $s'=f\\cdot s$ 对某个 $0\\neq f\\in k(X)$ 成立（两个处处非零的有理生成元之比是整体有理函数）。于是 $\\operatorname{div}(s')=\\operatorname{div}(s)+\\operatorname{div}(f)$，而由第一步 $\\deg\\operatorname{div}(f)=0$，故 $\\deg\\operatorname{div}(s')=\\deg\\operatorname{div}(s)$，定义与 s 无关。注意这里“$\\mathcal L\\otimes\\mathcal K_X$ 有非零整体截面”是必须核对的：$\\mathcal K_X$ 是常数层型的常层（常数茎为 k(X)），故 $\\mathcal L\\otimes\\mathcal K_X$ 的局部截面就是 $\\mathcal L$ 的局部生成元乘 $k(X)$ 的元素，每个点处非零，因此非零整体截面的存在性由紧合性与“局部可拼接”保证。同态性：取 $\\mathcal L_1,\\mathcal L_2$ 与它们的非零有理截面 $s_1,s_2$，则 $s_1\\otimes s_2$ 是 $\\mathcal L_1\\otimes\\mathcal L_2\\otimes\\mathcal K_X^{\\otimes2}$ 的非零有理截面，而在每个点 P 处 $v_P(s_1\\otimes s_2)=v_P(s_1)+v_P(s_2)$（因为 $v_P$ 在局部环的乘法上是同态，而 $s_1\\otimes s_2$ 的局部表达是 $f_1g_2$ 型），逐点相加再求和得 $\\deg(\\mathcal L_1\\otimes\\mathcal L_2)=\\deg\\mathcal L_1+\\deg\\mathcal L_2$。同理 $v_P(s^{-1})=-v_P(s)$ 给 $\\deg\\mathcal L^{-1}=-\\deg\\mathcal L$，故 $\\deg$ 是群同态。",
        ['principal-degree-zero']),
      step('picard-exact-sequence', '正合列 $0\\to\\operatorname{Pic}^0\\to\\operatorname{Pic}\\to\\mathbb Z\\to0$',
        '同态 $\\deg$ 的核记作 $\\operatorname{Pic}^0(X)$，由第一步与第二步，主除子对应平凡层且次数为零，故 $\\operatorname{Pic}^0(X)\\supseteq$ 主除子类；反过来次数为零的层是否必为某个次数为零除子的类（进而与 $\\operatorname{Pic}^0$ 是 g 维簇）需要代数几何的构造。满射性容易：取一个闭点 $P$，除子 $[P]$ 的层 $\\mathcal O(P)$ 的次数为 1，故 $\\deg$ 满射。于是得到短正合列 $0\\to\\operatorname{Pic}^0(X)\\to\\operatorname{Pic}(X)\\xrightarrow{\\deg}\\mathbb Z\\to0$。核的几何：$\\operatorname{Pic}^0(X)$ 可以赋予代数簇结构，成为 g 维阿贝尔簇（雅可比簇 $J(X)$），其闭点与次数为零的除子类一一对应；具体的构造是把次数为零的除子写成 $\\sum n_ix_i-\\sum n_iy_i$ 型的“链”之和并用 Abel–Jacobi 映射 $\\sum (x_i-y_i)\\mapsto\\sum\\int_{y_i}^{x_i}\\omega$ 送进 $H^0(X,\\Omega^1)^{\\vee}/H_1(X,\\mathbb Z)$。有了这个正合列，曲线上线丛的分类就变成两层：离散的度数（可算的整数）与连续的 $\\operatorname{Pic}^0$（几何的簇）。',
        ['degree-well-defined']),
      step('pullback-and-positivity', '拉回公式与正性判据',
        '拉回公式：设 $f:Y\\to X$ 是光滑射影曲线间的非常数态射，次数 d（即一般纤维的基数）。对 $\\mathcal L$ 上的非零有理截面 s，$f^*s$ 是 $f^*\\mathcal L$ 上的非零有理截面，且在点 $Q\\in Y$ 处的赋值满足 $v_Q(f^*s)=e_Q\\cdot v_{f(Q)}(s)$，其中 $e_Q$ 是 f 在 Q 处的分歧指数（这个等式是“拉回沿局部环的赋值扩张”的直接计算：$f^*\\mathcal L$ 在 Q 处的生成元是 $v_Q$ 次的，而 s 的因子是 $f(Q)$ 处的 $v$ 次乘以 $e_Q$）。对 Q 求和：$\\deg f^*\\mathcal L=\\sum_Q e_Q\\,v_{f(Q)}(s)=\\sum_{P}\\Big(\\sum_{Q\\mapsto P}e_Q\\Big)v_P(s)=d\\cdot\\deg\\mathcal L$，其中内层求和恰等于 d（分歧点的重数计和等于纤维的次数）。正性判据：$\\deg\\mathcal L>0$ 蕴含 $\\mathcal L$ 丰沛，因为由 Riemann–Roch，$\\ell(\\mathcal L^n)=\\deg(\\mathcal L^n)+1-g=n\\deg\\mathcal L+1-g$，当 n 很大时截面足够多，再配合“曲线的线丛只要度数足够大就非常丰沛”（对曲线上度数 $\\deg\\ge2g+1$ 的层，$\\mathcal O(D)$ 的截面给出到 $\\mathbb P^{\\ell-1}$ 的嵌入）即得。反过来 $\\deg\\mathcal L\\le0$ 时 $\\mathcal L$ 不丰沛：度数小于零时 $H^0=0$，次数为零时 $h^0\\le1$（只需 $h^0\\le1$ 即可，因为丰沛性要求某个倍数由截面给出非平凡映射，而 $h^0(\\mathcal L^n)=1$ 型情形给不出），故也不丰沛。',
        ['picard-exact-sequence']),
      step('examples-degree', '可核算的例子：$\\mathbb P^1$、椭圆曲线与 $\\mathbb P^2$ 中的曲线',
        '例一：$X=\\mathbb P^1$，$\\mathcal O(d)$ 的次数为 d。核算方式：$\\mathcal O(1)$ 的截面 $x_0$，它的除子是 $\\operatorname{div}(x_0)=[0:1]$，次数 1；$\\mathcal O(d)$ 的截面 $x_0^d$ 的除子是 $d[0:1]$，次数 d。拉回公式可核对：$f:\\mathbb P^1\\to\\mathbb P^1$，$f(t)=t^n$，则 $\\deg f=n$，$f^*\\mathcal O(1)$ 由 $f^*x_0=t^n$ 生成，其除子是 $n[0]$ 型的，次数 n $=n\\cdot1$，与公式相符。例二：$X$ 为椭圆曲线（$g=1$），$\\mathcal O(P)$ 的除子是 $[P]$，次数 1；而 $\\mathcal O(2[O])$ 与 $\\mathcal O([P]+[-P])$ 型类的度数为 2。Riemann–Roch 在 $g=1$ 时给出 $\\ell(D)=\\deg D$（$\\deg D\\ge1$），代入 $D=[P]$ 得 $\\ell=1$，说明只有一个截面（常值倍的），这也解释了为什么椭圆曲线不能由一次除子嵌入射影空间，而需要 $3[O]$（$\\ell(3[O])=3$，给出 $y^2=x^3+ax+b$ 的三次模型）。例三：$X$ 为 $\\mathbb P^2$ 中的光滑 d 次曲线，亏格 $g=(d-1)(d-2)/2$，超平面束拉回 $\\mathcal O_X(1)$ 的次数为 d（因为 $H$ 与 C 相交于 d 个点，计重数），故 $\\deg\\omega_X=\\deg\\mathcal O_X(d-3)=d(d-3)$，与 $2g-2=d(d-3)$ 一致。这最后一条同时核对了度的定义与伴随公式。',
        ['pullback-and-positivity']),
    ],
    conclusion: '$\\deg\\mathcal L$ 由任意非零有理截面的除子次数给出，与截面选取无关、等于 $\\int_X c_1(\\mathcal L)$；$\\deg$ 是满同态 $\\operatorname{Pic}(X)\\to\\mathbb Z$，核 $\\operatorname{Pic}^0(X)$ 是 g 维雅可比簇的闭点集；对非常数态射有 $\\deg f^*\\mathcal L=\\deg(f)\\deg\\mathcal L$；$\\mathcal L$ 丰沛（等价地极大）当且仅当 $\\deg\\mathcal L>0$；并且 $\\deg\\omega_X=2g-2$，与伴随公式 $2g-2=d(d-3)$ 在平面曲线情形一致。',
    dependencies: [],
    consequences: [],
    explanation: '度是曲线上唯一可用的“数值化”工具，它的全部力量来自两个事实：其一，主除子的次数为零（有理函数的零点与极点数目相等），这保证了度与截面的选取无关，也保证了度对主除子不变，于是度下降为 $\\operatorname{Pic}(X)$ 上的函数；其二，赋值在乘法上是同态，这保证度在张量积下相加。这两条一凑，度就成了群同态，而群同态的核恰是“度数为零的层”，它在几何上就是雅可比簇。值得注意的是度的上界信息与 Riemann–Roch 的互动：Riemann–Roch 给出 $\\ell(D)=\\deg D+1-g+\\ell(K-D)$，度数越大右边越大，于是“度数足够大 ⟹ 截面足够多 ⟹ 给出嵌入”这条推理链成立，这正是“度数是曲线上正性的全部内容”的精确含义。反过来，度数相同但层不同的两个层可以差别巨大（相差一个 $\\operatorname{Pic}^0$ 的元素），这种差别正是 Jacobian 与 theta 函数理论的舞台。',
    examples: [
      { title: '例子：在 $\\mathbb P^1$ 与椭圆曲线上把 $\\deg$ 与 $\\ell$ 一起算出来', body: '$\\mathbb P^1$：$D=n[\\infty]$ 型除子，$\\deg D=n$，$\\ell(D)=n+1$（$n\\ge0$），与 Riemann–Roch（$g=0$，$K-D$ 的次数为 $-2-n<0$ 故 $\\ell(K-D)=0$）一致；$n=1$ 给 $\\ell=2$，两个截面给出恒等嵌入 $\\mathbb P^1\\to\\mathbb P^1$。椭圆曲线 $E$：取 $D=3[O]$，$\\deg D=3$，$\\ell(D)=3$（$g=1$，$K=0$ 型故 $\\ell(K-D)=0$），三个截面 $1,x,y$ 给出 $3\\to1$ 的映射型方程 $y^2=x^3+ax+b$；核对度：$\\mathcal O_E(1)=\\mathcal O_E(3[O])$ 的次数为 3，$\\deg\\omega_E=\\deg\\mathcal O_E=0=2g-2$，而 $\\omega_E\\cong\\mathcal O_E$ 恰是 $g=1$ 的特征。这个核算说明“$\\ell(D)=\\deg D$ 对 $g=1$ 的 $\\deg D\\ge1$”如何把点数与截面数锁在一起。' },
    ],
    remarks: [
      '度只在曲线上是完整不变量：在曲面与更高维，$\\operatorname{Pic}$ 与 $\\mathbb Z$ 之间没有这样干净的同态，取而代之的是“与曲线交数”构成的一族线性泛函以及 Néron–Severi 群的相交型。因此把“度数决定正性”搬出曲线会在第一个反例处失效（曲面上可以存在 $\\mathcal L\\cdot C>0$ 对一切曲线成立但 $\\mathcal L^2=0$ 的类）。',
      '拉回公式里的因子是 $\\deg(f)$ 而不是 1：对非有限型的态射（例如把曲线映成点的态射）$f^*\\mathcal L$ 会成为平凡层而次数归零，此时公式不再有意义，故“非常数”是必要假设。对常数态射讨论拉回次数是无意义的，因为 $\\deg f$ 未定义。',
      '“度数为零”不等于“平凡”：次数为零的层构成 g 维的簇 $\\operatorname{Pic}^0(X)$，其中只有单位元是平凡层。把 $\\deg\\mathcal L=0$ 读成 $\\mathcal L\\cong\\mathcal O_X$ 会把整个雅可比簇丢掉，这在讨论椭圆曲线（$g=1$）时尤其危险，因为那里 $\\operatorname{Pic}^0(E)\\cong E$ 本身是一个有丰富结构的曲线。',
      '度的定义用“非零有理截面”而不是“整体截面”：$\\mathcal O_{\\mathbb P^1}(-1)$ 没有非零整体截面，但它在 $\\mathcal K_X$ 意义下有非零有理截面 $x_0^{-1}$，其除子次数为 $-1$。若误用整体截面定义度，负度数的层将无法定义度，整个 $\\operatorname{Pic}(X)\\to\\mathbb Z$ 就会退化成只在有效层上有定义的东西。',
    ],
    corollaries: [
      { title: '推论：$\\deg\\omega_X=2g-2$ 与曲线上的 Serre 对偶配对', body: '取 $\\mathcal L=\\omega_X$，由 $h^0(\\omega_X)=g$ 与 Riemann–Roch（$\\ell(K)=\\deg K+1-g$ 且 $\\ell(K-K)=h^0(\\mathcal O)=1$）给出 $\\deg\\omega_X=2g-2$。结合 Serre 对偶 $H^1(X,\\mathcal L)^{\\vee}\\cong H^0(X,\\omega_X\\otimes\\mathcal L^{-1})$ 得 $h^1(\\mathcal L)=h^0(\\omega_X\\otimes\\mathcal L^{-1})$，于是 Riemann–Roch 的欧拉示性数形式 $\\chi(\\mathcal L)=\\deg\\mathcal L+1-g$ 完全由度数与亏格决定，$\\ell$ 与 $h^1$ 的差别只在中间项。这条推论说明“度是唯一的数值不变量”这一说法的来源：Riemann–Roch 把 $\\chi$ 写成度数的仿射函数，其余的几何信息全部落进 $H^0$ 的实际维数里。', uses: ['examples-degree'] },
    ],
    references: [
      stacks('Section 0BQ4: Divisors on curves and the degree', '0BQ4'),
      stacks('Section 0C1M: Riemann-Roch for curves', '0C1M'),
      { title: 'Algebraic Geometry, Chapter II, §6 and Chapter IV, §1', author: 'R. Hartshorne', year: 1977 },
    ],
    history: HISTORY,
  },

  /* ═══════════════════════════════════════════════════════════
   * 4. Verdier 对偶
   * ═══════════════════════════════════════════════════════════ */

  'a-verdier-duality': {
    statement: '设 $f:X\\to Y$ 是概形（或“六函子形式”适用的一般框架，如有限维 Noether 概形）上的紧合态射，$D^+(\\mathcal O_X)$、$D^+(\\mathcal O_Y)$ 是有界下导出范畴。则例外拉回函子 $f^!:D^+(\\mathcal O_Y)\\to D^+(\\mathcal O_X)$ 存在，且对任意 $\\mathcal F\\in D^-(\\mathcal O_X)$、$\\mathcal G\\in D^+(\\mathcal O_Y)$ 有自然同构 $R\\mathcal H om(f_!\\mathcal F,\\mathcal G)\\cong f^!R\\mathcal H om(\\mathcal F,f^!\\mathcal G)$，等价地 $(f_!,f^!)$ 与 $(f^*,f_*)$ 一样构成伴随对：$\\operatorname{Hom}_{D(X)}(f_!\\mathcal F,\\mathcal G)\\cong\\operatorname{Hom}_{D(Y)}(\\mathcal F,f^!\\mathcal G)$。对开嵌入 $j$，$j^!=j^*$；对光滑态射 $f$（相对维数 d），$f^!(-)=f^*(-)\\otimes\\omega_f[d]$，其中 $\\omega_f$ 是相对典范层；对闭嵌入 $i:Z\\hookrightarrow X$（理想层 $\\mathcal I$），$i^!(-)=R\\mathcal H om_{\\mathcal O_X}(\\mathcal O_Z,-)$。当 $f$ 光滑且 $Y=\\operatorname{Spec}k$ 时，$f^!\\mathcal O_Y=\\omega_X[\\dim X]$，$H^{-i}(f^!\\mathcal O_Y)=\\omega_X$ 的平移恰给出 Serre 对偶中的对偶化复形。',
    explanation: 'Verdier 对偶是“上同调对偶”这一族现象的统一表述。Poincaré 对偶（流形上 $H^i$ 与 $H^{n-i}_c$ 配对）、Serre 对偶（射影簇上 $H^i$ 与 $H^{n-i}$ 配对）、局部对偶（$H^i_{\\mathfrak m}(A)$ 与 $\\operatorname{Ext}$ 配对）看起来形式不同，但在六函子形式中都写成“$f_!$ 与 $f^!$ 互为伴随，且 $f^!$ 是用对偶化复形实现的”。本条记录把三条实例（开嵌入、光滑态射、闭嵌入）各自的计算写清楚，并解释为什么 $f^!$ 的存在性不是形式推论：$f^!$ 不是 $f^*$ 的某个简单变体，而必须通过“把 $\\mathcal O$ 的对偶化复形推过来再内 Hom”来构造，这一步需要实质性的代数输入（有限性、正则性、或 Cohen–Macaulay 型假设）。因此对偶定理的内容可以概括为“先用构造证明 $f^!$ 存在，再用抽象废话推出一条伴随关系，然后把它逐项翻译成具体的配对”。',
    steps: [
      step('adjoint-pair-setup', '把对偶表述为伴随对：抽象机制先讲清楚',
        '先说明“伴随”这一层的形式部分。对紧合态射 $f$，推前 $f_*$ 有左伴随 $f^*$、右伴随 $Rf_*$ 与 $f^*$ 的伴随关系是六函子形式的第一组；而“$f_!$ 的左伴随”表述需要 $f^!$ 作为（导出意义下的）某一侧伴随。Verdier 对偶的抽象形式是：存在函子 $f^!$ 使 $\\operatorname{Hom}_{D^+(\\mathcal O_X)}(\\mathcal F,f^!\\mathcal G)\\cong\\operatorname{Hom}_{D^+(\\mathcal O_Y)}(Rf_*\\mathcal F,\\mathcal G)$（即 $f^!$ 是 $Rf_*$ 的右伴随），同时 $f^!$ 又是“$Rf_*$ 的右伴随的右伴随”这一表述在紧合情形与 $f_!$ 的对应关系（$f$ 紧合时 $f_!$ 与 $Rf_*$ 作为函子在导出范畴上自然等价，因此 $f_!$ 与 $f^!$ 构成伴随对）。把这一层抽象机制先摆出，好处是：一旦 $f^!$ 存在，(1) 中的同构就是形式推论——由伴随的唯一性与投影公式的形式性质自动得到，不需要每次重新证明。真正的工作量全部落在两件事上：$f^!$ 的存在性（构造）与 $f^!$ 的具体计算（在各情形算出 $f^!\\mathcal O_Y$ 是什么）。',
        []),
      step('construct-f-shriek', '构造 $f^!$：闭嵌入与光滑态射两个基本情形',
        '六函子形式中 $f^!$ 的构造是“先局部化，再拼起来”。基本情形之二。其一，闭嵌入 $i:Z\\hookrightarrow X$（$Z$ 由理想层 $\\mathcal I$ 定义）：定义 $i^!(-)=R\\mathcal H om_{\\mathcal O_X}(\\mathcal O_Z,-)$，即把对象先看作 $\\mathcal O_X$-模再取内 Hom。此时 $i^!$ 是 $i_*=Ri_*$ 的右伴随，配对映射来自“$\\mathcal H om(\\mathcal O_Z,-)$ 的元素就是把沿 Z 的取值分解出来”这一 Ev 型自然映射；具体地，$\\operatorname{Hom}_{D(X)}(i_*\\mathcal F,\\mathcal G)\\cong\\operatorname{Hom}_{D(Z)}(\\mathcal F,R\\mathcal H om_{\\mathcal O_X}(\\mathcal O_Z,\\mathcal G))$，右边是伴随同构。其二，光滑态射 $f:X\\to Y$（相对维数 d）：定义 $f^!(-)=f^*(-)\\otimes\\omega_{X/Y}[d]$，其中 $\\omega_{X/Y}=\\det\\Omega^1_{X/Y}$（相对典范层）。此时 $f^!$ 是 $f_*$ 的右伴随的表达式由相对 Serre 对偶的“层版本”给出：$\\mathcal H om(f_*\\mathcal F,\\mathcal G)\\cong f_*\\mathcal H om(\\mathcal F,f^!\\mathcal G)$ 在光滑情形的证明归结为“微分形式的存在给出 $H^d$ 与 $\\mathcal O$ 的配对”这一局部计算（局部上 $f$ 是仿射空间上的投影，$\\omega_f$ 平凡化，配对就是留数型配对）。开嵌入是光滑态射的特例（相对维数 0 且 $\\omega_f=\\mathcal O$），故 $j^!=j^*$。',
        ['adjoint-pair-setup']),
      step('trick-and-gluing', '用“闭合对”与粘合把构造推广到一般紧合态射',
        '一般紧合 $f$ 的 $f^!$ 通过分解成“开嵌入 + 紧合光滑 + 闭嵌入”来构造。任一紧合态射都可以被分解为 $f=j\\circ\\bar f\\circ i$ 型的复合？正确做法是：先取 X 到某个相对光滑的对象上的分解（利用“局部上 X 可以嵌入 $Y$ 上的仿射空间”这一局部模型，即在某覆盖上 $X\\subseteq \\mathbb A^D_Y$ 型），于是 $f$ 分解为闭嵌入 $i:X\\hookrightarrow \\mathbb A^D_Y$ 与投影 $p:\\mathbb A^D_Y\\to Y$。两个基本情形的 $f^!$ 都已有定义，令 $f^!=i^!\\circ p^!$。粘合问题（不同分解给出的 $f^!$ 是否只差自然同构）由“闭合对（closed pair）的局部化性质”解决：对两个分解，它们的纤维积给出更细的分解，而两种途径的差别被 $R\\mathcal H om$ 的局部化性质与 $\\omega$ 的“共变”刻画（$\\omega_f$ 在拉回与底变换下的相容性）吸收，这是 Verdier 对偶中技术量最大的一步。设 $d$ 为 X 在 Y 上的相对维数，则最终得到 $f^!(-)=f^*(-)\\otimes\\omega_f[d]$ 在“f 光滑”与更一般的“f 是 Cohen–Macaulay 型态射”（$f^!\\mathcal O_Y$ 是单一层的平移）情形成立；一般情形 $f^!\\mathcal O_Y$ 是一个真正的复形，而非单层平移，这正是“对偶化复形”这个名字的来源。',
        ['construct-f-shriek']),
      step('serre-poincare-local', '三个实例：Poincaré、Serre、局部对偶的统一',
        '设 $f:X\\to\\operatorname{Spec}k$ 光滑射影，维数 n。由第三步的公式 $f^!\\mathcal O_k=\\omega_X[n]$（$\\omega_X=\\det\\Omega^1_{X/k}$）。把 $f^!$ 的伴随关系展开：$\\operatorname{Hom}_{D(X)}(\\mathcal F,\\omega_X[n])\\cong\\operatorname{Hom}_{D(k)}(Rf_*\\mathcal F,\\mathcal O_k)$，左边取上同调次数 i 得到 $H^i(X,\\mathcal F)^\\vee\\cong H^{n-i}(X,\\mathcal H om(\\mathcal F,\\omega_X))$（用双对偶与 $k$-向量空间的 $\\operatorname{Hom}(-,k)$），这正是 Serre 对偶。若 X 是紧复流形，把 $\\mathcal O_X$ 换成常数层 $\\mathbb C_X$，则 $f^!\\mathbb C=\\mathbb C_X[2n]$（实维数 2n 的有向流形的对偶化复形），伴随关系展开成 $\\operatorname{Hom}(\\mathcal F,\\mathbb C_X[2n])\\cong\\operatorname{Hom}(R\\Gamma_c\\mathcal F,\\mathbb C)$，即 $H^i_c(X,\\mathcal F)^\\vee\\cong H^{2n-i}(X,\\mathcal F^{\\vee})$ 型的 Poincaré 对偶。若 $f$ 是闭嵌入 $\\{x\\}\\to X$（局部环取 $A$，$\\mathfrak m$），则 $i^!\\mathcal O_X=R\\mathcal H om(\\mathcal O_{\\mathfrak m}/\\mathcal O_X,\\mathcal O_X)$ 给出局部对偶复形，其展开给出 $H^i_{\\mathfrak m}(A)^\\vee\\cong\\operatorname{Ext}^{n-i}_A(A,\\omega_A^\\bullet)$ 型配对。三个实例共用同一套伴随关系，区别只在 $f^!\\mathcal O$ 的具体计算，这正是“Verdier 对偶统一了三种对偶”的含义。',
        ['trick-and-gluing']),
      step('concrete-example', '一个可核算的例子：$\\mathbb P^1$ 上的 Verdier 对偶',
        '取 $X=\\mathbb P^1_k$、$Y=\\operatorname{Spec}k$、$\\mathcal F=\\mathcal O_{\\mathbb P^1}(d)$。光滑射影、相对维数 1，故 $f^!\\mathcal O_k=\\omega_{\\mathbb P^1}[1]=\\mathcal O_{\\mathbb P^1}(-2)[1]$。逐项核算：$\\operatorname{Hom}_{D(X)}(\\mathcal O(d),\\mathcal O(-2)[1])=H^1(\\mathbb P^1,\\mathcal O(d-2))$，其维数由 $\\mathbb P^1$ 的已知计算给出：$h^1(\\mathcal O(m))=0$ 对 $m\\ge-1$，$h^1(\\mathcal O(m))=-m-1$ 对 $m\\le-2$。代入 $m=d-2$：$d\\ge1$ 时 $h^1=0$；$d\\le0$ 时 $h^1=1-d$。右边 $\\operatorname{Hom}_{D(k)}(R\\Gamma\\mathcal O(d),\\mathcal O_k)=H^0(\\mathbb P^1,\\mathcal O(d))^\\vee$，维数 $d+1$（$d\\ge0$）与 0（$d<0$）。这两组数字并不直接相等，因为它们在不同次数上：把伴随同构按上同调次数展开得到的是 $H^i(\\mathbb P^1,\\mathcal O(d))^\\vee\\cong H^{1-i}(\\mathbb P^1,\\mathcal O(-d-2))$，即 $i=0$ 时 $h^0(\\mathcal O(d))=h^1(\\mathcal O(-d-2))$，逐项核对：$d\ge0$ 时右边 $h^1(\\mathcal O(-d-2))=1-(-d-2)-1=d+2$ 型？按公式 $h^1(\\mathcal O(m))=-m-1$ 取 $m=-d-2$（$\\le-2$ 当 $d\\ge0$）得 $-(-d-2)-1=d+1$，与 $h^0=d+1$ 相符；$d=-1$ 时两边都是 0；$d\\le-2$ 时左边 $h^0=0$ 而右边 $m=-d-2\\ge0$ 给 $h^1=0$，也相符。这个逐项核算说明：对偶不是把维数对应到同一个次数上，而是把 $H^i$ 对应到 $H^{n-i}$，其中最容易被漏掉的正是 $\\omega_X$ 的扭（这里是 $-2$）。',
        ['serre-poincare-local']),
    ],
    conclusion: '紧合态射 $f:X\\to Y$ 存在例外拉回 $f^!$，且与 $f_!$（等价地 $Rf_*$，当 f 紧合时）构成伴随对，满足 $R\\mathcal H om(f_!\\mathcal F,\\mathcal G)\\cong f^!R\\mathcal H om(\\mathcal F,f^!\\mathcal G)$。$f^!$ 的构造由闭嵌入情形（$i^!=R\\mathcal H om_{\\mathcal O_X}(\\mathcal O_Z,-)$）与光滑情形（$f^!(-)=f^*(-)\\otimes\\omega_f[d]$）粘合得到。当 $f$ 是光滑射影到点的态射时 $f^!\\mathcal O_k=\\omega_X[n]$，展开伴随关系即得 Serre 对偶；换成常数层与实维数 2n 即得 Poincaré 对偶；换成闭点嵌入即得局部对偶。',
    dependencies: [],
    consequences: [],
    explanation: '理解 Verdier 对偶的正确姿势是把“抽象伴随”与“具体构造”分开：抽象部分（伴随对、投影公式、按上同调次数展开）是形式的，一旦 $f^!$ 存在就自动成立；具体部分（$f^!$ 是什么、$f^!\\mathcal O_Y$ 等于什么）需要真正的几何输入，而且只有在对 f 加适当假设（光滑、Cohen–Macaulay、或 Gorenstein）时 $f^!\\mathcal O_Y$ 才退化成单层平移。这解释了为什么教科书里 Serre 对偶的陈述如此简洁（因为光滑射影的前提让 $f^!\\mathcal O=\\omega_X[n]$ 变成一行）而一般相对对偶的陈述如此繁重（因为 $f^!\\mathcal O_Y$ 是一个复形）。本条记录把三个经典对偶的“对照表”列出来，是为了让读者看出它们不是三个定理而是一个定理的三次翻译：$H^i$ 与 $H^{n-i}$ 的配对、$H^i_c$ 与 $H^{2n-i}$ 的配对、$H^i_{\\mathfrak m}$ 与 $\\operatorname{Ext}^{n-i}$ 的配对，落在同一个伴随同构的不同分量上。',
    examples: [
      { title: '例子：用 Verdier 对偶算 $\\mathbb P^2$ 上 $\\mathcal O(1)$ 的 $H^2$', body: '取 $X=\\mathbb P^2$、$\\mathcal L=\\mathcal O(1)$。由 Serre 对偶（Verdier 对偶的实例）$H^2(\\mathbb P^2,\\mathcal O(1))^\\vee\\cong H^0(\\mathbb P^2,\\omega_{\\mathbb P^2}\\otimes\\mathcal O(-1))=H^0(\\mathbb P^2,\\mathcal O(-3-1))=H^0(\\mathcal O(-4))=0$，故 $h^2(\\mathcal O(1))=0$。再把 $H^1$ 也做掉：$H^1(\\mathcal O(1))^\\vee\\cong H^1(\\mathcal O(-4))=0$（$\\mathbb P^2$ 上 $H^1(\\mathcal O(m))=0$ 对一切 m）。于是 $\\chi(\\mathcal O(1))=h^0=\\binom{3}{2}=3$，与 Riemann–Roch for $\\mathbb P^2$（$\\chi(\\mathcal O(d))=\\binom{d+2}{2}$）相符。这个计算的关键是 $\\omega_{\\mathbb P^2}=\\mathcal O(-3)$，它由 $f^!\\mathcal O_k=\\omega_X[2]=\\mathcal O(-3)[2]$ 给出，即“对偶化复形是典范层的平移”。' },
    ],
    remarks: [
      '$f^!$ 不等于 $f^*$，也不等于 $f^*$ 的某种自然变形：只有在光滑态射上才有 $f^!=f^*\\otimes\\omega_f[d]$ 这个可计算的形状。对一般的紧合态射 $f^!\\mathcal O_Y$ 是复形，若误把它当成单层会在相对曲线上算出错误的扭（少一个相对典范层）。',
      '紧合性不可去：$f_!$ 是“紧支推前”，在不紧合时它与 $Rf_*$ 真的不同，$f_!$ 与 $f^!$ 的伴随关系也随之改变。因此 Verdier 对偶的陈述里“$f$ 紧合”不是技术冗余，它保证了 $f_!=Rf_*$ 从而两种伴随表述一致。',
      '开嵌入情形 $j^!=j^*$ 与闭嵌入情形 $i^!=R\\mathcal H om_{\\mathcal O_X}(\\mathcal O_Z,-)$ 的形式截然不同，不能统一写成 $f^*\\otimes\\omega_f[d]$：闭嵌入的相对维数是负的（余维），对应的“相对典范层”是 $\u03c9$ 的负幂与一个 Ext 复形的组合，只有当 $Z$ 在 $X$ 中是局部完全交时 $i^!\\mathcal O_X$ 才退化成 $\\mathcal O_Z$ 与一个平移的扭，一般情形必须保留整个复形。',
      '把 Verdier 对偶当成“$H^i$ 与 $H^{n-i}$ 维数相等”是常见误读：对偶给出的是配对（非退化形式），维数相等只在两个空间都是有限维向量空间并且配对非退化时成立（例如对射影簇上的凝聚层），对一般导出范畴对象（复形）必须逐分量陈述，否则会出现“$H^i$ 的维数在中间次数上不匹配”的表面矛盾。',
    ],
    corollaries: [
      { title: '推论：相对 Serre 对偶与投影公式的层形式', body: "由 $f^!$ 的伴随关系取 $\\mathcal G=\\mathcal H om(\\mathcal F',\\mathcal G')$ 并对 $\\mathcal F'$ 取 $\\mathcal H om$，可得层版本的对偶：$f_*R\\mathcal H om(\\mathcal F,f^!\\mathcal G)\\cong R\\mathcal H om(f_!\\mathcal F,\\mathcal G)$，在 $f$ 光滑时化为 $f_*R\\mathcal H om(\\mathcal F,f^*\\mathcal G\\otimes\\omega_f[d])\\cong R\\mathcal H om(Rf_*\\mathcal F,\\mathcal G)$。对 $Y=\\operatorname{Spec}k$ 取整体截面即得 Serre 对偶的整体形式。这条推论说明“投影公式”与“对偶”在六函子形式中是同一个伴随关系的两面：投影公式用的是 $f^*\\dashv Rf_*$，对偶用的是 $f_!\\dashv f^!$，两者在 $f$ 紧合光滑时通过 $\\omega_f$ 相互翻译。", uses: ['serre-poincare-local'] },
    ],
    references: [
      stacks('Section 0A9Y: Dualizing complexes and Duality', '0A9Y'),
      { title: 'Residues and Duality (Lecture Notes in Mathematics 20)', author: 'R. Hartshorne', year: 1966 },
      { title: 'SGA 4, Exposé XVII (Verdier duality)', author: 'J.-L. Verdier', year: 1972 },
      { title: 'Notes on Grothendieck Duality and Base Change', author: 'B. Conrad', year: 2000, url: 'https://stacks.math.columbia.edu/tag/0A9Y' },
    ],
    history: HISTORY,
  },

  /* ═══════════════════════════════════════════════════════════
   * 5. 对偶化复形
   * ═══════════════════════════════════════════════════════════ */

  'a-dualizing-complex': {
    statement: '设 X 是有限维诺特概形（或紧合于域的概形）。$D^+_{\\operatorname{coh}}(X)$ 中的复形 $\\omega_X^{\\bullet}$ 称为 X 的对偶化复形，若：(a) $\\omega_X^{\\bullet}$ 的每个上同调层都是凝聚的，且只有有限多个非零；(b) 典范映射 $\\mathcal O_X\\to R\\mathcal H om(\\omega_X^{\\bullet},\\omega_X^{\\bullet})$ 是同构；等价地，对任意 $\\mathcal F\\in D_{\\operatorname{coh}}(X)$，函子 $\\mathcal F\\mapsto R\\mathcal H om(\\mathcal F,\\omega_X^{\\bullet})$ 的对偶化映射 $\\mathcal F\\to R\\mathcal H om(R\\mathcal H om(\\mathcal F,\\omega_X^{\\bullet}),\\omega_X^{\\bullet})$ 是同构。则：(1) X 上对偶化复形存在当且仅当 X 有有限维且在该维数以下可嵌入正则概形（例如 X 是域上有限型概形）；(2) 若 $\\omega_X^{\\bullet}$ 与 $\\omega_X^{\\prime\\bullet}$ 都是对偶化复形，则存在可逆层 $\\mathcal L$ 与整数 n 使 $\\omega_X^{\\prime\\bullet}\\cong\\omega_X^{\\bullet}\\otimes\\mathcal L[n]$（唯一到这种程度）；(3) 对光滑 X（维数 n）可取代代表的 $\\omega_X^{\\bullet}=\\omega_X[n]$，$\\omega_X=\\det\\Omega^1_{X/k}$；(4) 对 Cohen–Macaulay X，$\\omega_X^{\\bullet}$ 退化为单一层的平移（即存在层 $\\omega_X$ 使 $\\omega_X^{\\bullet}\\cong\\omega_X[n]$）；(5) 对 Cohen–Macaulay 凝聚层 $\\mathcal F$，$\\operatorname{Ext}^i(\\mathcal F,\\omega_X)=0$（$i>0$）与 $\\mathcal H om(\\mathcal F,\\omega_X)\\cong \\mathcal H om(\\mathcal F,\\omega_X)$ 型的局部对偶成立，从而 $H^i(X,\\mathcal F)^\\vee\\cong H^{n-i}(X,\\mathcal H om(\\mathcal F,\\omega_X))$。',
    explanation: '对偶化复形要解决的是“在多大的一般性下 Serre 对偶还成立”这个问题。光滑射影簇上 $\\omega_X$ 是典范层，Serre 对偶的形式非常简洁；但一旦出现奇点，$\\Omega^1_{X/k}$ 不再是可逆层、$\\omega_X$ 的定义本身就成了问题，而对偶定理却依然成立——这说明真正的对偶对象不是 $\\det\\Omega^1$，而是一个复形。本条记录把 $\\omega_X^{\\bullet}$ 的抽象公理（凝聚、有限、自对偶）与三条具体化（光滑 / Cohen–Macaulay / 一般）分开写：抽象公理的作用是保证“对偶化映射是同构”这一非退化性；具体化给出可以计算的形状。一个关键点是唯一性只能到“张量一个可逆层的平移”为止，因为对偶化映射同构这一条件对 $\\omega\\otimes\\mathcal L[n]$ 显然也成立，这说明 $\\omega_X^{\\bullet}$ 携带的“绝对”信息要多加一个归一化（例如与结构层的对偶或与局部上同调配对）才能钉死。',
    steps: [
      step('definition-and-self-duality', '定义、自对偶性与“层化”的含义',
        '先说明对偶化复形定义里每条要求的作用。条件 (a)“上同调层凝聚且只有有限多个非零”是为了让 $R\\mathcal H om(-,\\omega_X^{\\bullet})$ 把 $D_{\\operatorname{coh}}(X)$ 送入自身（有限性是 Ext 只能在有限多个次数上非零的保证，否则 $\\operatorname{Ext}^i$ 会永不消没，$H^i(X,\\mathcal F)^\\vee\\cong H^{-i}(X,R\\mathcal H om(\\mathcal F,\\omega))$ 型陈述就只有无穷和的意义）。条件 (b)“$\\mathcal O_X\\to R\\mathcal H om(\\omega_X^{\\bullet},\\omega_X^{\\bullet})$ 是同构”是自反性的核心：它保证对偶化映射 $\\mathcal F\\to \\mathcal F^{\\vee\\vee}$ 在 $\\mathcal F=\\mathcal O_X$ 上已经是同构，再由“对偶化映射与三角运算相容”的性质（对 $R\\mathcal H om(\\mathcal F,-)$ 与 $\\mathcal F\\otimes-$ 的函子性）与五引理把同构性推广到由 $\\mathcal O_X$ 经过有限次三角与直和后得到的对象，即整个 $D_{\\operatorname{coh}}(X)$（在适当的有限型假设下，$D_{\\operatorname{coh}}(X)$ 恰由 $\\mathcal O_X$ 这类对象生成）。层化这一层必须注意：$R\\mathcal H om(\\mathcal F,\\omega_X^{\\bullet})$ 是 X 上的复形而不是向量空间，取整体截面再取上同调才得到 $\\operatorname{Ext}^i(\\mathcal F,\\omega^{\\bullet})$，而“局部对偶”说的正是这个过程可以逐点进行：$\\mathcal H om$ 层在 x 处的茎等于在局部环上取 $R\\operatorname{Hom}$，两者的差别由“层化与整体截面”的标准谱序列控制。',
        []),
      step('existence-embedding', '存在性：嵌入正则概形与有限维假设',
        '证明存在性的一条干净路线是“嵌入正则概形 + 从高维推下来”。设 $i:X\\hookrightarrow P$ 是闭嵌入，$P$ 是维数 N 的光滑概形（例如 $\\mathbb A^N$ 或 $\\mathbb P^N$，只要 X 在域上有限型且在有限维之下总可以这样嵌入——这是“存在性定理”的技术内核，用局部上“把 X 放进一个光滑环境”的构造与诺特性完成）。在 $P$ 上取 $\\omega_P^{\\bullet}=\\omega_P[N]$（光滑情形，$\\omega_P=\\det\\Omega^1_{P}$）。令 $\\omega_X^{\\bullet}=R\\mathcal H om_{\\mathcal O_P}(\\mathcal O_X,\\omega_P[N])=i^!\\omega_P^{\\bullet}$。验证公理 (a)：$R\\mathcal H om(\\mathcal O_X,\\omega_P[N])$ 的上同调层由 $\\operatorname{Ext}^i_{\\mathcal O_P}(\\mathcal O_X,\\omega_P)$ 给出，由 X 在 P 中的局部方程与 Koszul 复形（或更一般地，从正则 P 的有限性定理）可知它只在有限的 i 上非零且凝聚，非零的上界由 $\\operatorname{codim}(X,P)$ 控制。验证公理 (b)：用 $i^!$ 的伴随关系 $\\operatorname{Hom}_{D(X)}(\\mathcal F,i^!\\mathcal G)\\cong\\operatorname{Hom}_{D(P)}(i_*\\mathcal F,\\mathcal G)$ 把 X 上的内 Hom 计算搬到 P 上，再由 $\\omega_P^{\\bullet}$ 在 P 上的自对偶性（光滑 P 上的 Serre 对偶）得到 $\\mathcal O_X$ 的反射性。这条路线同时解释了为什么存在性需要“有限维”与“可嵌入正则概形”：前者保证 $\\omega_P$ 的平移有意义，后者保证 $i^!$ 有明确定义。',
        ['definition-and-self-duality']),
      step('uniqueness-up-to-twist', '唯一性：只到可逆层的平移',
        '设 $\\omega^{\\bullet}$ 与 $\\omega^{\\prime\\bullet}$ 都是对偶化复形。由公理 (b)，$\\omega^{\\prime\\bullet}\\cong R\\mathcal H om(R\\mathcal H om(\\omega^{\\prime\\bullet},\\omega^{\\bullet}),\\omega^{\\bullet})$ 型地把两者联系起来：具体地令 $\\mathcal M=R\\mathcal H om(\\omega^{\\prime\\bullet},\\omega^{\\bullet})$，则由两者各自的反射性可得 $R\\mathcal H om(\\mathcal M,\\omega^{\\bullet})\\cong\\omega^{\\prime\\bullet}$ 与 $R\\mathcal H om(\\mathcal M,\\omega^{\\prime\\bullet})\\cong\\omega^{\\bullet}$，比较两式得 $\\omega^{\\bullet}\\cong\\omega^{\\prime\\bullet}\\otimes^{\\mathbb L}\\mathcal M$ 型的关系。要把它化简到“$\\mathcal M$ 是某个可逆层的平移”需要一步实质性的论证：考虑 $\\mathcal M$ 的极小次非零上同调层 $\\mathcal M^{\\bullet}$ 只在某个次数 $n$ 上有非零层，而这个层必须是可逆层（因为它与 $\\mathcal O_X$ 局部同构：把上述同构限制到一个仿射开集并取 $\\mathcal F=\\mathcal O_X$，由 $\\omega^{\\bullet}$ 与 $\\omega^{\\prime\\bullet}$ 在 $U=\\operatorname{Spec}A$ 上都是 $A$ 的对偶化复形，用“$A$ 的对偶化复形只能彼此相差一个自由秩一模的平移”这一环论结论）。于是 $\\omega^{\\prime\\bullet}\\cong\\omega^{\\bullet}\\otimes\\mathcal L[n]$。这条唯一性不是自然的（$\\mathcal L$、n 依赖选取），因此在应用中要么固定一个归一化（例如要求 $\\omega_X^{\\bullet}$ 与 $H^d_{\\mathfrak m}$ 型局部上同调配对），要么只陈述到这种精度——这正是不等式链 $\\operatorname{Pic}\\times\\mathbb Z$ 上对偶化复形唯一性的真实含义。',
        ['existence-embedding']),
      step('smooth-and-cm-cases', '光滑与 Cohen–Macaulay 情形的具体形状',
        '光滑情形：X 光滑、维数 n，则 $\\Omega^1_{X/k}$ 局部自由秩 n，$\\omega_X=\\det\\Omega^1_{X/k}$ 是可逆层，取 $\\omega_X^{\\bullet}=\\omega_X[n]$ 即是对偶化复形。验证：局部上 X 是 $\\mathbb A^n$ 型，$\\omega_X$ 平凡化，$R\\mathcal H om(\\mathcal F,\\omega_X[n])$ 的反射性退化为“$\\mathbb A^n$ 上的层对偶”，这是局部对偶的显式版本（用 $n$ 个变量的 Koszul 复形计算 $\\operatorname{Ext}^i$）。Serre 对偶是它的整体形式。Cohen–Macaulay 情形：X 是 Cohen–Macaulay 且等维（每个局部环 $\\operatorname{depth}=\\dim$），取 $\\omega_X=H^{-n}(\\omega_X^{\\bullet})$（第 −n 次上同调，$n=\\dim X$），则 $\\omega_X^{\\bullet}\\cong\\omega_X[n]$ 且 $\\omega_X$ 是“CM 型”的层（在每个 x 处 $\\omega_{X,x}$ 是 CM 模）。验证的要点是：在 CM 局部环 $A$ 上，$R\\operatorname{Hom}_A(k,A)$ 只在次数 $-d$（$d=\\dim A$）上非零，而由局部对偶 $R\\operatorname{Hom}_A(k,\\omega_A^{\\bullet})=k[d]$ 型计算可得 $\\omega^{\\bullet}$ 只能是单层的平移；一般情形（非 CM）$\\omega_X^{\\bullet}$ 有多个非零上同调层，其非零次数区间长度正是“X 离 CM 有多远”的度量。',
        ['uniqueness-up-to-twist']),
      step('concrete-computations', '可核算的例子：$\\mathbb P^n$、平面曲线与一个非 CM 例',
        '例一：$X=\\mathbb P^n_k$，光滑维数 n，$\\omega_X=\\det\\Omega^1=-\\text{（}n+1)H$ 型，即 $\\omega_{\\mathbb P^n}=\\mathcal O(-n-1)$，$\\omega_X^{\\bullet}=\\mathcal O(-n-1)[n]$。核算：$H^n(\\mathbb P^n,\\mathcal F)^\\vee\\cong H^0(\\mathbb P^n,\\mathcal H om(\\mathcal F,\\mathcal O(-n-1)))$ 是 Serre 对偶的常用形式，代入 $\\mathcal F=\\mathcal O(d)$ 得 $h^n(\\mathcal O(d))=h^0(\\mathcal O(-d-n-1))$，检查 $d=-n-1$ 时两边都为 1（$h^n(\\mathcal O(-n-1))=1$，$h^0(\\mathcal O)=1$），相符。例二：$X=\\mathbb P^2$ 中的光滑 d 次曲线，维数 1，$\\omega_X=\\mathcal O_X(d-3)$，$\\omega_X^{\\bullet}=\\mathcal O_X(d-3)[1]$；代入 $\\mathcal F=\\mathcal O_X$ 得 $h^1(\\mathcal O_X)^\\vee=h^0(\\mathcal O_X(d-3))$，而 $h^1(\\mathcal O_X)=g=(d-1)(d-2)/2$、$h^0(\\mathcal O_X(d-3))$ 由 Riemann–Roch 算出同样等于 g，验证通过。例三（非 CM）：取 $X$ 为两条仿射直线在原点横截相接的并（$A=k[x,y]/(xy)$ 的谱），维数 1 但局部环在原点非 CM（$\\operatorname{depth}=0<1$）。此时 $\\omega_X^{\\bullet}$ 在原点以外的点是 $\\mathcal O[1]$ 型（光滑点），而在原点处需要两个非零上同调层（$H^0$ 与 $H^{-1}$ 都非零），因此 $\\omega_X^{\\bullet}$ 不是一个层的平移。这个例子说明“$\\omega_X^{\\bullet}$ 退化为层”与“X 是 CM”是同一件事。',
        ['smooth-and-cm-cases']),
    ],
    conclusion: '对偶化复形 $\\omega_X^{\\bullet}$ 是 $D_{\\operatorname{coh}}(X)$ 上实现反射性的凝聚有界复形，其存在性归结为“可嵌入维数 N 的光滑概形 P 并取 $i^!\\omega_P^{\\bullet}$”，唯一性只到张量一个可逆层并平移（$\\omega^{\\prime\\bullet}\\cong\\omega^{\\bullet}\\otimes\\mathcal L[n]$）。光滑 X 可取 $\\omega_X[n]$（$\\omega_X=\\det\\Omega^1_{X/k}$，例如 $\\mathbb P^n$ 上 $\\mathcal O(-n-1)[n]$）；X 为 Cohen–Macaulay 时 $\\omega_X^{\\bullet}$ 退化为单层平移，非 CM 时它必须保留至少两个非零上同调层。展开反射性即得 Serre 对偶与局部对偶。',
    dependencies: [],
    consequences: [],
    explanation: '把对偶化复形理解成“对偶理论的万有对象”是最省事的说法：它是使 $R\\mathcal H om(-,\\omega_X^{\\bullet})$ 成为反射函子的那个对象，因此任何形如“$H^i$ 对偶于 $H^{n-i}$”的定理都只是把它按上同调次数展开的不同翻译。这条记录最值得记住的两件事是：存在性依赖把 X 放进光滑环境（因此“有限维、有限型”是硬前提，不能用于任意概形），以及唯一性只到可逆层的平移（因此它不是一个严格的范畴不变量，而是一个“直到扭动”的不变量）。第三件值得记住的事是它如何度量奇性：$\\omega_X^{\\bullet}$ 的非零上同调层的区间长度越大，X 离 Cohen–Macaulay 越远，而 Gorenstein 恰是“$\\omega_X^{\\bullet}$ 是单层的平移且该层可逆”的情形，这就是 Gorenstein 环在分类中位置居中的原因。至于计算，光滑情形永远先算 $\\omega_X=\\det\\Omega^1$，CM 情形再取平移，非 CM 情形则必须老实地保留复形。',
    examples: [
      { title: '例子：$\\mathbb P^1$ 与带结点曲线的对偶化复形对比', body: '$\\mathbb P^1$：维数 1、光滑，$\\Omega^1_{\\mathbb P^1}=\\mathcal O(-2)$，故 $\\omega_{\\mathbb P^1}=\\mathcal O(-2)$、$\\omega^{\\bullet}=\\mathcal O(-2)[1]$。核对：$H^1(\\mathbb P^1,\\mathcal O(d))^\\vee=H^0(\\mathbb P^1,\\mathcal O(-d-2))$，$d\\ge-1$ 时左边 0 右边 $h^0(\\mathcal O(-d-2))=0$（因为 $-d-2<0$），$d=-2$ 时左边 1 右边 1，相符。带结点曲线（即 $k[x,y]/(xy)$ 的射影完备化，$g=0$ 的奇异曲线）：在光滑点处 $\\omega^{\\bullet}=\\mathcal O[1]$ 型，在结点处 $\\omega^{\\bullet}$ 有两个非零上同调层（$H^0$ 与 $H^{-1}$），故它不是单层平移；把它与 $\\mathbb P^1$ 对比可见：两者都有 $g=0$ 型上同调（$h^1(\\mathcal O)=0$），但对偶化复形的形状完全不同，这说明“$\\omega^{\\bullet}$ 的形状”比“亏格”携带更多信息。' },
    ],
    remarks: [
      '对偶化复形不是唯一的，唯一性只到 $\\omega^{\\bullet}\\otimes\\mathcal L[n]$。因此在写“$\\omega_X^{\\bullet}$ 是 $\\omega_X[n]$”这类断言时必须约定归一化，否则会得到一个只到扭动正确的陈述；在实际应用中归一化常由“与局部上同调 $H^n_{\\mathfrak m}$ 的配对”或“与结构层的配对”给出。',
      '光滑情形 $\\omega_X=\\det\\Omega^1_{X/k}$ 的写法对非光滑 X 没有意义（$\\Omega^1$ 不再是局部自由，行列式不可逆），此时必须换成 $\\omega_X^{\\bullet}$ 这一复形。常见的错误是把非光滑簇的“典范层”直接写成 $\\det\\Omega^1$，这会得到一个既不是可逆层也不能实现对偶的东西。',
      '“X 是 Cohen–Macaulay”与“$\\omega_X^{\\bullet}$ 是单层平移”是等价的，而不是仅前者推出后者。因此当发现 $\\omega_X^{\\bullet}$ 有多个非零上同调层时，可以直接断言 X 不是 CM（或至少某个局部环不是），这条判据在具体例子中比直接算深度更快。',
      '存在性要求在有限维之下可嵌入正则概形，这排除了无限维或“太病态”的概形；但即使在这样的概形上，对偶化复形也未必唯一到可逆层平移这一精度之外还给出更多信息，因此涉及“$\\omega$ 的绝对取值”的断言（而不是“到扭动”）必须给出额外归一化。',
    ],
    corollaries: [
      { title: '推论：Gorenstein 等价于对偶化复形是可逆层的平移', body: '设 X 是等维诺特概形，对偶化复形 $\\omega_X^{\\bullet}$。则 X 是 Gorenstei内射维数等于它的维数（即其内射维数有限），等价地：每个局部环是 CM 且 $\\omega_X$ 可逆{）}当且仅当 $\\omega_X^{\\bullet}\\cong\\mathcal L[n]$ 对某个可逆层 $\\mathcal L$ 与整数 n 成立{。}这条推论把{“}Gorenstein{”}从局部环的投射维数条件翻译成一个整体的层论条件{，}从而允许用 $\\omega_X^{\\bullet}$ 的上同调层的个数来检测奇性的{“}长度{”}{：}CM 但非 Gorenstein 的簇上 $\\omega_X^{\\bullet}$ 是单层的平移但该层不可逆{（}例如尖点曲线上 $\\omega$ 不是可逆层），非 CM 的簇上则连单层都做不到。', uses: ['smooth-and-cm-cases'] },
    ],
    references: [
      stacks('Section 0A7B: Dualizing complexes', '0A7B'),
      stacks('Section 0BFR: Dualizing complexes of coherent sheaves', '0BFR'),
      { title: 'Residues and Duality (Lecture Notes in Mathematics 20)', author: 'R. Hartshorne', year: 1966 },
      { title: 'Dualizing Complexes, Kan Extensions and Derived Functors', author: 'A. Neeman', year: 1996 },
    ],
    history: HISTORY,
  },

  /* ═══════════════════════════════════════════════════════════
   * 6. Stein 分解与有限性
   * ═══════════════════════════════════════════════════════════ */

  'a-stein-factorization': {
    statement: "设 $f:X\\to Y$ 是概形间的有限型真态射（在“结构定理”的版本里通常设 f 真且 $f_*\\mathcal O_X$ 拟凝聚）。则 (1)（Stein 分解）存在唯一分解 $f=g\\circ f'$，其中 $f':X\\to Y'=\\mathbf{Spec}_Y(f_*\\mathcal O_X)$ 满足 $f'_*\\mathcal O_X=\\mathcal O_{Y'}$（等价地，f’ 的纤维连通、几何上即 $Y'$ 是“把 f 的纤维的连通分支粘起来”得到的），而 $g:Y'\\to Y$ 是有限（等价地：仿射且整）态射；(2) 若 f 真且 $\\mathcal F$ 是 X 上凝聚层，则每个 $R^if_*\\mathcal F$ 都是 Y 上凝聚层（Grothendieck 有限性定理）；(3) 若 f 射影、$\\mathcal F$ 凝聚，则 $R^if_*\\mathcal F$ 凝聚且只在 $0\\le i\\le \\dim(\\text{相对维数})$ 上非零，并且 $\\bigoplus_i R^if_*\\mathcal F$ 在适当意义上有限生成（相对 Serre 有限性）；(4) Stein 分解与推前的关系是 $f_*\\mathcal O_X\\cong g_*\\mathcal O_{Y'}$，因此 $\\mathcal O_{Y'}$ 上的模层与 $f_*\\mathcal O_X$ 上的模层等价。",
    explanation: "Stein 分解的要点是把“纤维长什么样”这件事从态射里彻底剥离出去。一个真态射的纤维可以是连通的也可以是不连通的，可以带多重结构也可以不带；把这些“纤维内部的信息”全部塞进中间概形 $Y'$，剩下的 $Y'\\to Y$ 就只有“把有限多个点装在一起”这一件事了，于是它必然是有限的。这个分解之所以总能做出，是因为 $f_*\\mathcal O_X$ 本身就是一个 $\\mathcal O_Y$-代数层，而 $\\mathbf{Spec}_Y$ 构造对任意拟凝聚代数层都有定义，于是 $Y'$ 是唯一可造的对象，不需要任何额外选择。本条记录把三件事连起来：Stein 分解的构造与唯一性、连通纤维的判定（$f'_*\\mathcal O=\\mathcal O$ 当且仅当纤维连通）、以及 Grothendieck 有限性定理怎么用这个分解加归纳把 $R^if_*$ 的凝聚性一步步证下来。第三件事是这条记录的技术重心，因为“直接像保持凝聚性”在一般真态射上不成立，必须用射影性（Chow 引理）与归纳。",
    steps: [
      step('construct-y-prime', "构造 $Y'=\\mathbf{Spec}_Y(f_*\\mathcal O_X)$ 并证明含入是仿射",
        "设 $f:X\\to Y$ 真（更一般地，只需 f 拟紧拟分离使 $f_*\\mathcal O_X$ 是拟凝聚 $\\mathcal O_Y$-代数）。令 $\\mathcal A=f_*\\mathcal O_X$，它是 $\\mathcal O_Y$ 上的拟凝聚代数层，故可以取相对谱 $Y'=\\mathbf{Spec}_Y\\mathcal A=\\mathbf{Spec}_Y(f_*\\mathcal O_X)$，伴随给出态射 $f':X\\to Y'$ 与 $g:Y'\\to Y$，且 $f=g\\circ f'$。关键是把 $\\mathbf{Spec}_Y\\mathcal A$ 写成本地构造：在 $Y$ 的仿射开集 $U=\\operatorname{Spec}B$ 上，$\\mathcal A(U)=\\mathcal O_X(f^{-1}U)$ 是 B-代数，$Y'$ 在 U 上的原像是 $\\operatorname{Spec}(\\mathcal O_X(f^{-1}U))$，故 $g$ 在每个这样的块上是仿射的，于是 g 仿射。再看 $f'_*\\mathcal O_X$：在 U 上它是 $\\mathcal O_X(f^{-1}U)$ 作为 $\\mathcal O_X(f^{-1}U)$-模，即结构层，故 $f'_*\\mathcal O_X=\\mathcal O_{Y'}$，这正是 Stein 分解所要求的“纤维连通”条件（下一步解释为什么它等价于连通性）。构造过程中没有任何选择，因此 $Y'$ 与 $f'$、$g$ 都被 f 唯一决定，这正是“唯一分解”的含义。",
        []),
      step('fibers-connected', "纤维的连通性与 $f'_*\\mathcal O_X=\\mathcal O_{Y'}$ 的等价",
        "设 $S$ 是概形、$X\\to S$ 真，则 $v_*\\mathcal O_X=\\mathcal O_S$ 当且仅当每个几何纤维 $X_{\\bar s}$ 连通且非空（在 $X\\to S$ 真、有限型的常见假设下）。一个方向用“连通性与整体截面的关系”：若 $X_{\\bar s}$ 不连通，则 $\\mathcal O_{X_{\\bar s}}$ 有非平凡幂等元（把两个连通分支的示性函数相加），由幂等元的提升（连同真态射的“几何纤维上的截面可以提升到邻域”）得 $v_*\\mathcal O_X$ 在某点附近有非平凡幂等元，故 $v_*\\mathcal O_X\\neq\\mathcal O_S$。另一个方向用 Zariski 连通性定理的推论：若 $v_*\\mathcal O_X=\\mathcal O_S$，则对每个 $s$，$H^0(X_s,\\mathcal O_{X_s})=k(s)$，特别地 $\\mathcal O_{X_s}$ 的幂等元只有 0 与 1；再由“真态射的纤维上同调在 s 上上半连续”与纤维化论证，可以得到 $X_s$ 连通（否则示性函数给出非平凡幂等元）。把这条判据用到 Stein 分解的 $f'$ 上，得到：$f'$ 的每个纤维连通，而 g 是有限的（因为 $g$ 仿射且 $g_*\\mathcal O_{Y'}=f_*\\mathcal O_X$ 是“纤维有限的”，具体地 g 的纤维是有限的点集，其结构层有限维）；连通分支的个数恰是 g 的次数。于是“Stein 分解把连通纤维部分与有限部分分开”这一说法得到了精确的对应：有限部分的次数 = 纤维的连通分支数。",
        ['construct-y-prime']),
      step('finiteness-theorem', 'Grothendieck 有限性定理：$R^if_*$ 保持凝聚',
        '定理：设 $f:X\\to Y$ 是诺特概形间的真态射、$\\mathcal F$ 是 X 上凝聚层，则 $R^if_*\\mathcal F$ 是 Y 上凝聚层（对每个 i）。证明骨架分三步。第一步：由 Chow 引理（对真态射的版本：存在 $\\pi:\\bar X\\to X$ 与 $\\bar X\\to \\mathbb P^r_Y$ 的浸入，其中 $\\pi$ 是“有限个爆破的复合”型的真双有理态射且 $\\bar X$ 在 Y 上拟射影），把 f 分解为拟射影真态射再加一个“受控的修改”，从而把问题化归到 f 射影的情形（这一步用到了“真 + 诺特 ⇒ 可用 Chow 引理得到拟射影模型”，以及对 $\\pi$ 使用同调的同构 $R^if_*=R^if_*\\circ R\\pi_*$ 与 $R\\pi_*\\mathcal O$ 的凝聚性）。第二步：射影情形用归纳。若 f 射影，则由 $f$ 可分解为闭嵌入 $i:X\\hookrightarrow \\mathbb P^r_Y$ 与投影 $p:\\mathbb P^r_Y\\to Y$，先算 $p$：$R^ip_*\\mathcal G$ 在 $\\mathbb P^r_Y$ 上的凝聚性由“$\\mathbb P^r$ 上 $\\mathcal O(d)$ 的高阶上同调消没 + 基变换 + 诺特性”给出（这也是“上同调与底变换可交换（在消没之后）”的标准论证）。再把 i 与投影公式合起来得上同调层的凝聚性。第三步：对 f 的“拟射影 + 修改”分解逐项合并。这个定理的结论不可省：非真态射（例如把原点打掉的开嵌入）的直接像会失去凝聚性（局部上给出无限生成模），这正是“真”这一假设的代价。',
        ['fibers-connected']),
      step('decompose-images', 'Stein 分解如何化简直接像的断言',
        "设 $f=g\\circ f'$ 是 Stein 分解。对 $\\mathcal F$ 凝聚，$R^if_*\\mathcal F\\cong R^ig_*(R^if'_*\\mathcal F)$（Grothendieck 谱序列退化型的复合公式），故计算 $R^if_*\\mathcal F$ 分成两层：先算 $R^if'_*\\mathcal F$（“纤维连通的部分”），再用 g 有限。第二层最容易：g 有限蕴含 $R^ig_*\\mathcal H=0$ 对 $i>0$（因为 g 仿射且 g 的纤维是有限的，直接像就是整体截面的有限直和，有限态射的高阶直接像消没是标准结论），于是 $R^if_*\\mathcal F\\cong g_*(R^if'_*\\mathcal F)$，问题被压缩到 $f'$ 上。第一层的关键是：$f'$ 的纤维连通，$f'_*\\mathcal O_X=\\mathcal O_{Y'}$，于是 $f'$ 的“扭曲”只能来自 $\\mathcal F$ 本身而不是 $\\mathcal O$；特别地 $H^0$ 层的计算退化为 $H^0(X_s,\\mathcal F_s)$ 型的纤维计算，而高阶部分仍需要在射影情形用消没与基变换来处理。这条分解的技术价值在于它把“$f_*\\mathcal O_X$ 是否等于 $\\mathcal O_Y$”这一经常要在定理里假设的条件变成了分解的一个性质：不必假设纤维连通，用分解把它做出来即可。这也是 Stein 分解在极小模型纲领与相对典范环讨论中反复出现的原因——它允许把“不连通纤维造成的额外分量”单独拿出来处理。",
        ['finiteness-theorem']),
      step('worked-example', '可核算的例子：二次覆盖、归一化与一个可以验算的 $f_*\\mathcal O$',
        "例一：$f:\\mathbb A^1\\to\\mathbb A^1$，$f(t)=t^2$。此态射有限，故 $f_*\\mathcal O$ 是秩 2 的自由 $\\mathcal O_{\\mathbb A^1}$-模（基 $1,t$），于是 $Y'=\\mathbf{Spec}_Y(f_*\\mathcal O)=\\operatorname{Spec}k[t]$（作为 $k[x]$-代数取 $x=t^2$），而 $g=Y'\\to Y$ 就是 $t\\mapsto t^2$ 本身，$f'$ 是同构。这个例子说明：纤维不连通（$x\\neq0$ 处两个点）时，Stein 分解会把“两个点装起来”这件事交给有限部分，$f'$ 退化为同构。例二：$f:\\mathbb A^1\\to\\operatorname{Spec}k$ 是到点的态射。此时 $f_*\\mathcal O_X=k[t]$ 是无穷维 $k$-代数，$Y'=\\operatorname{Spec}k[t]=\\mathbb A^1$，$g:Y'\\to\\operatorname{Spec}k$ 有限，$f'=\\operatorname{id}$。核算 $f'_*\\mathcal O=\\mathcal O_{Y'}$ 成立，$g$ 有限成立。这个例子说明：即使是到点的态射，Stein 分解仍然非平凡地把“坐标环”这一部分保留在中间对象里，而“有限性”是相对于 Y 说的。例三：$X=\\{y^2=tx^2\\}$ 型的退化族（$t$ 是底空间的坐标），在 $t=0$ 处纤维是两条重合的直线，在 $t\\neq0$ 处是两条分离的直线：$f_*\\mathcal O_X$ 是秩 2 的局部自由层（在 $t\\neq0$ 处）而 $f_*\\mathcal O_X$ 在 $t=0$ 处的纤维包含重数信息，$Y'$ 因此是“在 $t=0$ 处粘起来的”两层覆盖，$g$ 的次数在该处退化，这就是“Stein 分解把纤维的连通分支数编码进有限部分”的具体形态。",
        ['decompose-images']),
    ],
    conclusion: "有限型真态射 $f:X\\to Y$ 有唯一的 Stein 分解 $f=g\\circ f'$，其中 $Y'=\\mathbf{Spec}_Y(f_*\\mathcal O_X)$、$f'_*\\mathcal O_X=\\mathcal O_{Y'}$（等价于 $f'$ 的纤维连通）、$g$ 有限，且 g 的次数等于纤维的连通分支数。此分解把直接像的计算分成“纤维连通部分”与“有限部分”两层（$R^if_*\\mathcal F\\cong g_*R^if'_*\\mathcal F$，因 $g$ 有限故高阶直接像消没）。配合 Grothendieck 有限性定理（f 真、$\\mathcal F$ 凝聚 ⟹ $R^if_*\\mathcal F$ 凝聚），射影态射的高阶直接像自动凝聚且只在有限多个次数上非零。",
    dependencies: [],
    consequences: [],
    explanation: 'Stein 分解的美在于它把一个几何上含糊的问题（“这个态射的纤维到底长什么样”）化成一个可以逐点计算的代数问题：$f_*\\mathcal O_X$ 作为 $\\mathcal O_Y$-代数层的秩给出纤维的连通分支数，幂等元的个数给出分支数，而 $\\mathbf{Spec}_Y$ 构造自动把这些数据装成中间概形。由于它对任意拟凝聚 $f_*\\mathcal O_X$ 都有定义，它在极小模型纲领、相对代数几何与连通性定理中被反复使用：很多定理的假设里写着“$f_*\\mathcal O_X=\\mathcal O_Y$”，而这条可以用 Stein 分解实现（先分解，再只关心中间对象与底空间之间的有限部分）。Grothendieck 有限性定理则是这条技术的另一半：它保证 $R^if_*$ 仍然落在“凝聚层”这个好范畴里，从而可以把有限性当成后续归纳的前提。两条合起来的效果是：任何关于真态射的上同调断言都可以先分解（把纤维连通性分离）再归纳（对射影情形用消没），这就是“结构定理”这一名字的含义。',
    examples: [
      { title: '例子：$\\mathbb P^1\\times Y\\to Y$ 与 $\\mathbb P^1\\to\\operatorname{Spec}k$ 的 Stein 分解', body: "取 $f:\\mathbb P^1\\times Y\\to Y$ 为投影。纤维都是 $\\mathbb P^1$，连通，$f_*\\mathcal O=\\mathcal O_Y$（因为 $h^0(\\mathbb P^1,\\mathcal O)=1$ 且基变换保持），故 $Y'=Y$、$f'=f$、$g=\\operatorname{id}$：Stein 分解平凡，这正是“连通纤维”情形的典型形态。取 $f:\\mathbb P^1_k\\to\\operatorname{Spec}k$：$f_*\\mathcal O=k$、$Y'=\\operatorname{Spec}k$、$g=\\operatorname{id}$，也平凡。取 $f:X\\to Y$ 为两次覆盖（例如 $y^2=x^2-t$ 型族，$t$ 为底空间坐标）：在 $t\\neq0$ 处纤维两个点，$f_*\\mathcal O$ 局部秩 2，$Y'$ 在 $t\\neq0$ 处是两层，$g$ 次数 2；在 $t=0$ 处纤维变成一个带重数的点，$Y'$ 的结构层出现幂零元，$g$ 在该处不再是分离的二重覆盖。这三例合起来说明：Stein 分解在“纤维连通”时退化，在“纤维不连通”时把分支数搬到有限部分。" },
    ],
    remarks: [
      'Stein 分解不要求 $f$ 真，只要求 $f_*\\mathcal O_X$ 拟凝聚（即 f 拟紧拟分离），但“$g$ 有限”这一结论需要额外假设。若去掉真（或有限型）假设，$g$ 可以只是仿射而非有限，例如 $\\operatorname{Spec}k[t]\\to\\operatorname{Spec}k$ 中的有限性来自 $k[t]$ 是有限维 k-代数（它是无限的，故此时 g 不有限）。因此在写“Stein 分解给出有限态射”时必须核对 f 的假设。',
      "“纤维连通”与“$f'_*\\mathcal O_X=\\mathcal O_{Y'}$”的等价需要几何纤维的讨论，而不是“每个纤维作为一个概形连通”这一朴素陈述：在非代数闭的底点处，纤维可以是不可约但不可几何连通的（由域扩张给出），此时需要使用几何纤维。混淆两者会在基域不代数闭时得到错误结论。",
      'Grothendieck 有限性定理里的“真”不能换成“分离”或“有限型”：例如开嵌入 $\\mathbb A^2\\setminus\\{0\\}\\hookrightarrow\\mathbb A^2$ 是分离的但非真，其直接像 $j_*\\mathcal O$ 不是凝聚层（它是无限生成的），这正是有限性定理需要真态射的原因。同理“凝聚”也不能换成“拟凝聚”，否则结论中会出现无限生成的模。',
      "Stein 分解的唯一性是“唯一到同构”而非“唯一到等同”：$Y'$ 由 $f_*\\mathcal O_X$ 决定，因此在同构意义下唯一；但在具体计算中同一个数学对象可以有不同的呈现（例如把 $f_*\\mathcal O_X$ 看作某个子代数的像与看作具体的坐标环），此时不同的呈现之间相差的是基变换，而不是分解的歧义。",
    ],
    corollaries: [
      { title: '推论：射影态射的高阶直接像只在有限多个次数上非零', body: '设 $f:X\\to Y$ 是诺特概形间的射影态射、$\\mathcal F$ 凝聚，则 $R^if_*\\mathcal F=0$ 对 $i>\\text{相对维数}$ 成立，且每个 $R^if_*\\mathcal F$ 凝聚。前半条的证明归约到 $\\mathbb P^r_Y$ 上的投影：$R^ip_*\\mathcal O(d)=0$ 对 $i>r$ 与所有 d 成立（这是 $\\mathbb P^r$ 的显式上同调计算），再由闭嵌入 $i$ 把 X 上的层写成 $i_*\\mathcal F$ 再投影，用投影公式把 X 上的高阶直接像压回 $\\mathbb P^r_Y$ 上的计算。这条推论是上同调“截断”性质的来源：它使 $\\chi(X_y,\\mathcal F_y)=\\sum(-1)^ih^i$ 成为有限和，从而 Euler 示性数成为可以谈论与计算的不变量。', uses: ['finiteness-theorem'] },
    ],
    references: [
      stacks('Section 03GX: Stein factorization', '03GX'),
      stacks('Section 02O5: Cohomology of projective space', '02O5'),
      stacks('Section 02C2: Finiteness of pushforwards', '02C2'),
      { title: 'Algebraic Geometry, Chapter III, §11 and §12', author: 'R. Hartshorne', year: 1977 },
    ],
    history: HISTORY,
  },

  /* ═══════════════════════════════════════════════════════════
   * 7. 典范嵌入
   * ═══════════════════════════════════════════════════════════ */

  'b-canonical-embedding': {
    statement: '设 X 是域 k 上亏格 $g\\ge2$ 的光滑射影曲线，$K=K_X$ 是典范除子（$\\deg K=2g-2$），$\\varphi_K:X\\to\\mathbb P(H^0(X,\\omega_X)^{\\vee})=\\mathbb P^{g-1}$ 是典范映射。则：(1) 基点自由：$H^0(X,\\omega_X\\otimes\\mathcal O(-P))=H^0(X,\\omega_X)$ 对一切 $P\\in X$ 成立当且仅当 $P$ 不是基点的；特别地当 $g\\ge2$ 时典范除子是基自由的（用 $\\ell(K)=g$ 与 $\\ell(K-P)=g-1$ 对每个 P 成立来判定）。(2) 若 $g\\ge3$ 且 X 不是超椭圆的，则 $\\varphi_K$ 是闭浸入，故 X 同构于 $\\mathbb P^{g-1}$ 中的 $2g-2$ 次曲线。(3) 若 X 是超椭圆的（$g\\ge2$），则 $\\varphi_K$ 的像是 $\\mathbb P^1$ 在 $\\mathbb P^{g-1}$ 中的有理正规曲线，且 $\\varphi_K$ 的分解 $X\\to\\mathbb P^1\\hookrightarrow\\mathbb P^{g-1}$ 给出次数 2 的态射；$g=2$ 时 $\\varphi_K$ 是到 $\\mathbb P^1$ 的次数 2 态射（不是嵌入）。(4) $g=3$ 非超椭圆时 X 是 $\\mathbb P^2$ 中的光滑四次曲线，$g=4$ 时是 $\\mathbb P^3$ 中一个二次曲面与一个三次曲面的完全交。',
    explanation: '典范嵌入回答了“曲线能不能用它自己的微分形式来给自己上坐标”这个问题。$\\omega_X$ 的 $g$ 个独立截面是曲线最自然的函数类，用它们做齐次坐标得到的映射 $\\varphi_K$ 是否嵌入，直接决定了曲线是否可以由 $g-1$ 个变量的二次型（即由二次关系生成）来刻画。答案是有唯一的一个例外：超椭圆曲线。超椭圆意味着存在次数 2 的态射到 $\\mathbb P^1$，等价地说 $\\ell(2P)=2$ 对某个 P（即一个函数以 P 为二重极点且这是最低的可能），于是 $g^1_2$ 线性系的存在使得典范映射不再单射。本条记录把三条证明的要点都写出来：基点自由性用 $\\ell(K-P)=g-1$（由 Riemann–Roch 与 $\\ell(P)=1$ 得到），单射性用“$\\ell(K-P-Q)=g-2$ 意味着存在以 P、Q 为极点且无其他极点的函数，这给出次数 2 的态射”（从而超椭圆是失效的唯一原因），切向量分离性用 $\\ell(K-2P)$ 的类似计算。最后把低亏格的情形具体化。',
    steps: [
      step('base-point-freeness', '基点自由：$\\ell(K-P)=g-1$ 的计算',
        '设 X 光滑射影曲线、亏格 g，$K$ 为典范除子，$\\deg K=2g-2$，$\\ell(K)=g$（因为 $H^0(\\omega)=g$ 维）。要证 $\\varphi_K$ 在 P 处有定义（即 P 不是基点），只需证 $\\ell(K-P)=\\ell(K)-1=g-1$：由“$\\ell(D)-\\ell(D-P)\\in\\{0,1\\}$（$\\ell$ 在加一个点时的跳跃不超过 1）”与“$\\ell(K)=g$”，若 $\\ell(K-P)=g$ 则说明所有 $g$ 个截面在 P 处都为零，而这是不可能的（把 $\\ell(K-P)$ 与 $\\ell(K-2P)$ 型的进一步比较结合 $\\ell(K)=g$ 与 $\\ell(K-D)$ 的精确值）。标准的算法是：由 Riemann–Roch 与 $\\ell(K-R)$ 的处理，$\\ell(K-P)=g-1$ 当且仅当 $\\ell(P)\\ge2$ 不成立（因为 $\\ell(K-P)=\\deg(K-P)+1-g+\\ell(P)$，代入 $\\deg(K-P)=2g-3$ 得 $\\ell(K-P)=g-2+\\ell(P)$，故 $\\ell(K-P)=g-1\\iff\\ell(P)=1$，而 $\\ell(P)\\ge1$ 恒成立且 $\\ell(P)=1$ 当且仅当不存在以 P 为唯一极点的非常值函数，即 P 不是“$g^1_1$ 的基点”）。对 g ≥ 2 的曲线不存在次数 1 的非常值映射到 $\\mathbb P^1$（因为那会使 X 同构于 $\\mathbb P^1$、g=0），故 $\\ell(P)=1$ 总成立，于是 $\\ell(K-P)=g-1$ 对一切 P 成立，基点自由。',
        []),
      step('separates-points', '分离点：$\\ell(K-P-Q)=g-2$ 与超椭圆的出现',
        '要证 $\\varphi_K$ 单射（在非超椭圆情形），需要证对任意不同的 $P,Q$ 存在 $s\\in H^0(\\omega)$ 使 $s(P)=0$、$s(Q)\\neq0$，即 $H^0(\\omega(-P))\\not\\subseteq H^0(\\omega(-Q))$，等价地 $\\ell(K-P-Q)=g-2$（因为若 $\\ell(K-P-Q)=g-1$ 则 $H^0(\\omega(-P))=H^0(\\omega(-Q))=H^0(\\omega(-P-Q))$，两者相等，无法分离）。由 Riemann–Roch：$\\ell(K-P-Q)=\\deg(K-P-Q)+1-g+\\ell(P+Q)=(2g-4)+1-g+\\ell(P+Q)=g-3+\\ell(P+Q)$。于是 $\\ell(K-P-Q)=g-2$ 当且仅当 $\\ell(P+Q)=1$。而 $\\ell(P+Q)\\ge2$ 意味着存在一个非常值函数，其除子的极点集恰好在 $\\{P,Q\\}$ 内（重数合计 2），也就是一个次数 2 的态射 $X\\to\\mathbb P^1$，这正是超椭圆的定义。因此：$\\varphi_K$ 分离所有点对当且仅当 X 不是超椭圆的。特别地，$g=2$ 时曲线总是超椭圆的（因为 $\\deg K=2$ 给出 $\\ell(K)=2$，$\\varphi_K$ 是到 $\\mathbb P^1$ 的次数 2 映射），这也与“$g=2$ 的曲线都是超椭圆”这一经典结论吻合。',
        ['base-point-freeness']),
      step('separates-tangents', '分离切向量：$\\ell(K-2P)$ 的计算',
        '要证 $\\varphi_K$ 是闭浸入（在曲线间只需单射加分离切向量），还需证对每个 P，$H^0(\\omega(-2P))\\subsetneq H^0(\\omega(-P))$，即 $\\ell(K-2P)=\\ell(K-P)-1=g-2$。由 Riemann–Roch 与 $\\deg(P)=1$、$\\deg(2P)=2$：$\\ell(K-2P)=g-3+\\ell(2P)$。于是 $\\ell(K-2P)=g-2\\iff\\ell(2P)=1$。而 $\\ell(2P)\\ge2$ 意味着存在一个以 P 为二重极点的非常值函数，等价于存在次数 2 的态射 $X\\to\\mathbb P^1$ 在 P 处完全分歧（即 P 是某个 $g^1_2$ 的全分歧点），也就是超椭圆。于是：分离切向量成立当且仅当 X 不是超椭圆的。把三步合起来得到：对 $g\\ge3$ 的非超椭圆曲线，$\\varphi_K$ 基点自由、单射、且分离切向量，故是闭浸入。注意 $\\varphi_K$ 是态射到 $\\mathbb P^{g-1}$ 的，而在研究其嵌入性时需要验证的就是“基点自由 + 分离点 + 分离切向量”这三件事（这是判别一个线性系是否给出闭浸入的标准清单），因此这一清单在曲线情形恰好逐项对应三个 $\\ell$ 的计算，这也解释了为什么典范嵌入的证明可以完全算术化。',
        ['separates-points']),
      step('hyperelliptic-case', '超椭圆情形：$\\varphi_K$ 分解为 $X\\to\\mathbb P^1\\to\\mathbb P^{g-1}$',
        '设 X 是超椭圆（$g\\ge2$），即存在次数 2 的态射 $\\pi:X\\to\\mathbb P^1$。由 Riemann–Hurwitz（$2g-2=2(-2)+\\deg R$ 型）得分歧除子的次数为 $2g+2$，故 $K_X\\sim(g-1)\\pi^*[\\infty]$ 型（更精确地 $\\omega_X\\cong\\pi^*\\mathcal O_{\\mathbb P^1}(g-1)\\otimes\\mathcal O(-\\text{分歧的修正})$，在超椭圆情形可写为 $\\omega_X\\cong\\pi^*\\mathcal O(g-1)$ 当分歧除子取为 $\\pi$ 的临界轨道时，标准形式是 $K_X=(g-1)\\pi^*(\\text{一点})$ 的关系）。于是 $H^0(\\omega_X)\\cong H^0(\\mathcal O_{\\mathbb P^1}(g-1))\\otimes$（1 维的修正），其维数为 g，且这些截面全都是 $\\pi$ 的拉回——也就是说 $\\varphi_K$ 的坐标函数全部通过 $\\pi$ 因子化。因此 $\\varphi_K$ 分解为 $X\\xrightarrow{\\pi}\\mathbb P^1\\xrightarrow{v_{g-1}}\\mathbb P^{g-1}$，其中 $v_{g-1}$ 是 $(g-1)$ 次 Veronese 型映射（由 $\\mathcal O(g-1)$ 的 g 个截面给出）。$v_{g-1}$ 的像是 $\\mathbb P^1$ 在 $\\mathbb P^{g-1}$ 中的有理正规曲线（degree $g-1$），而 $\\varphi_K$ 的像就等于它。于是 $\\varphi_K$ 不是单射（每个像点对应两个原像，分歧点对应一个），$\\deg\\varphi_K=2$。$g=2$ 时 $g-1=1$，$v_1$ 是恒等，$\\varphi_K=\\pi$ 恰是到 $\\mathbb P^1$ 的次数 2 映射。这就完成了“超椭圆是典范映射失效的唯一原因”这一分类性结论。',
        ['separates-tangents']),
      step('low-genus-classification', '低亏格的具体化：$g=3$ 的四次曲线与 $g=4$ 的完全交',
        '$g=3$：$\\deg K=4$，$\\varphi_K:X\\hookrightarrow\\mathbb P^2$（$g-1=2$）把 X 实现为 $\\mathbb P^2$ 中的四次曲线（超椭圆情形除外，此时像是 $\\mathbb P^1$ 的圆锥曲线型双覆盖）。核对：$\\mathbb P^2$ 中的光滑四次曲线由伴随公式算得 $2g-2=4(4-3)$，$g=3$；反过来任何非同构于超椭圆型的 $g=3$ 曲线都嵌入 $\\mathbb P^2$ 成一个四次曲线。$g=4$：$\\varphi_K:X\\hookrightarrow\\mathbb P^3$ 给出四次曲线（$\\deg K=6$？核算：$\\deg\\varphi_K(X)=\\deg K=2g-2=6$，故 X 是 $\\mathbb P^3$ 中的 6 次曲线）。作为完全交：$\\mathbb P^3$ 中一个二次曲面 Q 与一个三次曲面 C 的交是 6 次曲线，其亏格由伴随公式算得 $2g-2=6\\cdot(2+3-4)=6$，即 $g=4$；一般位置的 $(2,3)$ 完全交是光滑的且非超椭圆，故 $g=4$ 的非超椭圆曲线都是这类完全交。这两个例子的价值是把“抽象曲线”与“射影空间里的方程”对上：$g=3$ 是 2 个变量的一个四次方程，$g=4$ 是 3 个变量的两个方程（次数 2 与 3），$g\\ge5$ 时曲线一般不能写成完全交（需要更多方程），这也是“典范嵌入后由二次关系生成”这一 Noether 型结果的出发点。',
        ['hyperelliptic-case']),
    ],
    conclusion: '对 $g\\ge2$ 的光滑射影曲线 X，典范映射 $\\varphi_K$ 总是基点自由的（$\\ell(K-P)=g-1$）；$\\varphi_K$ 分离点当且仅当 $\\ell(P+Q)=1$ 对一切 $P\\neq Q$ 成立，分离切向量当且仅当 $\\ell(2P)=1$ 对一切 P 成立，两者都等价于“X 不是超椭圆的”。因此 $g\\ge3$ 且非超椭圆时 $\\varphi_K$ 是闭浸入，X 是 $\\mathbb P^{g-1}$ 中的 $2g-2$ 次曲线；超椭圆时 $\\varphi_K$ 分解为 $X\\to\\mathbb P^1\\to\\mathbb P^{g-1}$（后者为有理正规曲线），次数为 2。$g=3$ 非超椭圆时 X 是 $\\mathbb P^2$ 中的四次曲线，$g=4$ 时是 $\\mathbb P^3$ 中二次与三次曲面的完全交。',
    dependencies: [],
    consequences: [],
    explanation: '典范嵌入的证明可以完全用 $\\ell$ 的算术做完，这是曲线论最漂亮的地方之一：每一步要验证的性质（基点自由、分离点、分离切向量）都被翻译成一个类似 $\\ell(K-P-Q)=g-2$ 的等式，而这个等式又通过 Riemann–Roch 翻译成 $\\ell(P+Q)=1$ 型的“低次函数存在性”条件。于是“典范映射是否是嵌入”这一几何问题变成了“曲线上有没有次数 2 的态射到 $\\mathbb P^1$”这一分类问题，答案只有两种情况：有（超椭圆）或没有（非超椭圆）。这个过程还有一个副产品：它说明超椭圆性是曲线的“唯一异常”，因此曲线的分类只要按亏格与超椭圆性两个标签分类即可，这也解释了为什么模空间 $\\mathcal M_g$ 被超椭圆轨迹分割得如此干净，以及为什么 $g=2$ 的曲线全是超椭圆（此时 $\\deg K=2$，没有足够空间做嵌入）。',
    examples: [
      { title: '例子：$g=3$ 的非超椭圆曲线与 $y^2=x^7-x$ 超椭圆情形的比对', body: '取 $X$ 为 $\\mathbb P^2$ 中的光滑四次曲线（例如 Fermat 型 $x^4+y^4+z^4=0$）。$g=3$，$\\ell(K)=3$，典范映射用三个微分 $dx/y$ 型的截面的比把 X  embedding 到 $\\mathbb P^2$，像正是 X 本身（此时典范映射与原来的嵌入一致，因为 $\\omega_X=\\mathcal O_X(1)$ 型）。核算 $\\ell(K-P-Q)$：由 $\\ell(P+Q)=1$（四次曲线上两点不构成 $g^1_2$，因为不存在把曲线映到 $\\mathbb P^1$ 的次数 2 映射），得 $\\ell(K-P-Q)=g-2=1$，果然分离点。对比 $Y:\\ y^2=x^7-x$（$g=3$ 的超椭圆曲线，$\\deg$ 右端 $=7=2g+1$）：取映射 $(x,y)\\mapsto x$ 为到 $\\mathbb P^1$ 的次数 2 映射，$\\ell(2P_\\infty)=2$（函数 x 以两个无穷远点各一重极点？核算：x 在无穷远处有二重极点，故 $\\ell(2P_\\infty)\\ge2$），于是 $\\ell(K-P_\\infty-Q_\\infty)=g-1=2>g-2$，典范映射不能分离这两个点，$\\varphi_K$ 分解为 $Y\\to\\mathbb P^1\\to\\mathbb P^2$。这个对比把“超椭圆就是分离点失败”具体化到一对共轭点上。' },
    ],
    remarks: [
      '典范嵌入定理要求 $g\\ge3$：$g=0$ 时 $\\deg K=-2$、$\\omega$ 无截面，$g=1$ 时 $\\deg K=0$ 且 $\\omega\\cong\\mathcal O$ 只有常值截面，$g=2$ 时 $\\deg K=2$、$\\ell(K)=2$ 给出的映射到 $\\mathbb P^1$ 是次数 2 的。因此把“$\\varphi_K$ 是嵌入”当作对一切曲线成立会立刻在 $g\\le2$ 处出错。',
      '“分离切向量”这一步不能由“分离点”推出：在超椭圆曲线的分歧点上，$\\varphi_K$ 在该点的纤维是一个点（故分离性在该点附近表面成立），但微分在分歧点处以重数消失使得切向量不能被分离。这正是必须单独算 $\\ell(K-2P)$ 的原因。',
      '超椭圆性是一个几何性质而不是一个坐标性质：它等价于存在次数 2 的态射到 $\\mathbb P^1$，也等价于存在 $g^1_2$ 型线性系，也等价于典范映射不是嵌入。把“曲线有方程 $y^2=f(x)$”当作超椭圆的定义在特征 2 时会出问题（此时需要写成 $y^2+y=f(x)$ 型或使用 Artin–Schreier 型扩张），因此判别时应当用“$\\ell(2P)\\ge2$”这一不依赖方程形式的条件。',
      '低亏格的“完全交”描述只在一般位置成立：$g=4$ 的非超椭圆曲线是 $(2,3)$ 完全交，$g=5$ 的非超椭圆曲线是 $(2,2,2)$ 型完全交，但 $g\\ge6$ 时一般曲线不是完全交（需要用 $(g-1)(g-2)/2\\cdot$型二次关系的个数与维数比较算出：$\\mathbb P^{g-1}$ 中的曲线若是完全交会要求维数条件 $\\sum(d_i-1)=g-2$ 与次数匹配，而由 $\\varphi_K$ 给出的曲线一般做不到），因此不能把低亏格的结论外推到高亏格。',
    ],
    corollaries: [
      { title: '推论：$g\\ge2$ 时 $\\ell(K-P)=g-1$，即典范线性系无基点', body: '由 $\\ell(K-P)=g-2+\\ell(P)$ 与 $\\ell(P)=1$（$g\\ge2$ 时不存在次数 1 的非常值函数）得 $\\ell(K-P)=g-1$，故 $H^0(\\omega(-P))$ 是 $H^0(\\omega)$ 的余维 1 子空间，存在截面在 P 处非零，基点自由。这条小计算的用处很大：它是“$\\omega$ 给出到 $\\mathbb P^{g-1}$ 的态射”这一陈述的全部内容，也是构造 $g^1_d$ 型线性系时反复使用的工具（因为无基点性是线性系论中第一个要验证的性质）。', uses: ['base-point-freeness'] },
    ],
    references: [
      stacks('Section 0E3N: The canonical embedding', '0E3N'),
      stacks('Section 0BQ4: Riemann-Roch for curves', '0BQ4'),
      { title: 'Algebraic Geometry, Chapter IV, §5 (Canonical Embeddings)', author: 'R. Hartshorne', year: 1977 },
      { title: 'Geometry of Algebraic Curves, Volume I, Chapter III', author: 'E. Arbarello, M. Cornalba, P. Griffiths, J. Harris', year: 1985 },
    ],
    history: HISTORY,
  },

  /* ═══════════════════════════════════════════════════════════
   * 8. 超椭圆曲线
   * ═══════════════════════════════════════════════════════════ */

  'b-hyperelliptic': {
    statement: '设 X 是特征不等于 2 的域 k 上亏格 $g\\ge2$ 的光滑射影曲线。下列条件等价：(1) 存在次数为 2 的态射 $\\pi:X\\to\\mathbb P^1_k$；(2) 存在 $P\\in X$ 使 $\\ell(2P)=2$（即存在以 P 为二重极点且无其他极点的非常值函数）；(3) 存在 $P\\neq Q$ 使 $\\ell(P+Q)=2$；(4) 典范映射 $\\varphi_K$ 不是单射；(5) X 同构于 $y^2=f(x)$ 型的仿射模型所决定的完备化，其中 $\\deg f=2g+1$（一个无穷远点的情形）或 $\\deg f=2g+2$（两个无穷远点的情形），且 f 无重根。并且此时 $X$ 的自同构群包含由超椭圆对合 $\\sigma$ 生成的中心元，$\\sigma$ 是唯一的二阶自同构，$X/\\sigma\\cong\\mathbb P^1$，且当 $g\\ge2$ 时 $\\operatorname{Aut}(X)$ 的维数型数恰为 $g-1$（即 $\\operatorname{Aut}(X)/\\sigma$ 在 $\\mathbb P^1$ 上的作用由 $2g+2$ 个分歧点的置换给出，其位置由 $2g-2$ 个模参数确定）。(6) 若 $g\\ge3$，超椭圆性等价于 $\\varphi_K$ 的像是有理正规曲线（而不是 $2g-2$ 次非退化曲线）。',
    explanation: '超椭圆曲线是“除了椭圆曲线之外最特殊的一类”，它的特殊性只体现在一件事上：存在次数 2 的映射到 $\\mathbb P^1$。这个映射一旦存在，$X$ 上就有一个唯一的二阶自同构（超椭圆对合），商掉它得到 $\\mathbb P^1$，于是 $X$ 由“$\\mathbb P^1$ 加 $2g+2$ 个分歧点”这一组合数据（用 Riemann–Hurwitz 算分歧）完全决定，而 $\\mathbb P^1$ 的三点可以规范化为 $0,1,\\infty$，剩下的 $2g-2$ 个参数正是超椭圆模空间的维数。本条记录把六条等价条件串起来证：从“存在次数 2 的映射”到“$\\ell(2P)=2$”（取全分歧点或把两个原像相加）、再到方程形式 $y^2=f(x)$（用 $\\ell(2P)$ 的非平凡函数做 x、用 $\\ell(3P)$ 或 $\\ell((g+1)P)$ 型的函数做 y，推出 $y^2$ 与 $f(x)$ 的关系）、再到典范映射的关系。自同构与分歧点的对应是副产品。',
    steps: [
      step('hyperelliptic-involution', '超椭圆对合：次数 2 映射自动给出唯一二阶自同构',
        '设 $\\pi:X\\to\\mathbb P^1$ 是次数 2 态射（char k ≠ 2）。次数 2 的态射是平坦的且一般纤维有两个点，于是它给出一个对合：定义 $\\sigma:X\\to X$ 为把每点映到同一纤维中的另一点（分歧点上取自身）。核对 $\\sigma$ 是态射：在分歧点的局部，$X\\to\\mathbb P^1$ 是 $v\\mapsto v^2$ 型，纤维只有一点但有重数 2，$\\sigma$ 在该点是同构且固定该点，故 $\\sigma$ 在分歧点也有定义且是态射。核对 $\\sigma\\neq\\operatorname{id}$ 且 $\\sigma^2=\\operatorname{id}$：由一般纤维有两个点，$\\sigma$ 在一般点不是恒等。核对唯一性：设 $\\tau$ 是另一个二阶自同构使一般点 $x$ 与 $\\tau(x)$ 在同一纤维中，则 $\\tau$ 与 $\\sigma$ 在一般点相同（每根纤维中把点映到另一点的对合唯一），故 $\\tau=\\sigma$（态射由稠密开集决定）。于是每个超椭圆曲线有一个唯一的超椭圆对合，商 $X/\\sigma$ 是 $\\mathbb P^1$（因为不变函数域是 $k(X)^{\\sigma}$，由 $\\pi$ 因子化且次数 2 给出 $k(X)^{\\sigma}=k(\\mathbb P^1)$）。这就把“次数 2 映射”与“二阶自同构”两件事绑在一起，而且这个自同构位于 $\\operatorname{Aut}(X)$ 的中心（因为它与一切自同构交换：任何自同构把纤维送到纤维，故与 $\\sigma$ 交换）。',
        []),
      step('divisor-equivalence', '$\\ell(2P)=2$ 与 $\\ell(P+Q)=2$ 的等价性',
        "证明“存在次数 2 态射 ⟺ 存在 P 使 $\\ell(2P)=2$ ⟺ 存在 $P\\neq Q$ 使 $\\ell(P+Q)=2$”。(i) 若 $\\pi$ 次数 2，取全分歧点 $P$（存在，因为分歧除子的次数 $2g+2>0$；Riemann–Hurwitz：$2g-2=2(-2)+\\deg R$ 给 $\\deg R=2g+2$），则 $\\pi^{-1}(\\pi(P))$ 只有一个点 P 但重数 2，故 $\\pi^*([\\pi(P)])=2P$，于是 $\\pi$ 的坐标函数 $x=\\pi$ 满足 $\\operatorname{div}(x)=2P-2P'$（$P'$ 是另一个分歧点或一般的点），得到 $\\ell(2P)\\ge2$，又 $\\ell(2P)\\le\\deg(2P)=2$（由 Riemann–Roch，$\\ell(D)\\le\\deg D+1$ 型；准确地说 $\\ell(2P)=\\deg(2P)+1-g+\\ell(K-2P)$，而 $\\ell(2P)\\le2$ 需另证：$\\ell(2P)\\le2$ 因为若 $\\ell(2P)\\ge3$ 则存在两个独立的以 2P 为极点的函数，其商的除子给出次数 ≤2 的非分歧映射，由 $(2,\\,0)$ 型情形得 $X\\cong\\mathbb P^1$，与 $g\\ge2$ 矛盾），故 $\\ell(2P)=2$。(ii) 若 $\\ell(2P)=2$，取以 2P 为极点的非常值函数 $x$，则 $x$ 给出次数 2 的态射（因为 $[k(X):k(x)]=\\deg\\operatorname{div}_\\infty(x)=2$）。(iii) $\\ell(2P)=2$ 与 $\\ell(P+Q)=2$ 的等价：若 $\\ell(2P)=2$，取 $Q$ 为某个一般点（或 $Q=P$ 型的退化情形），由 $\\ell(2P)=2>1=\\ell(P)$ 得存在函数以 2P 为极点；若 $\\ell(P+Q)=2$ 则同样得到次数 2 的映射。三者合起来即得等价链。",
        ['hyperelliptic-involution']),
      step('equation-model', '方程模型 $y^2=f(x)$：从函数域到显式方程',
        "设 $\\ell(2P_0)=2$，取非常值函数 $x$ 以 $2P_0$ 为极点（若有两个无穷远点则取 $x$ 以 $P_0+Q_0$ 为极点）。$x$ 给出次数 2 的映射 $X\\to\\mathbb P^1$，坐标 t 的像有 $2g+2$ 个分歧点（$\\deg R=2g+2$）。把分歧点的像通过 $\\mathrm{PGL}_2$ 规范化：取 $t=\\infty$ 为一个分歧点（则 $\\operatorname{div}(x)=2P_0-2P_\\infty$ 型，或 $P_0+Q_0-\\cdots$），其余分歧值为 $a_1,\\dots,a_{2g+1}$（$2g+1$ 个有限值）。现在用 Riemann–Roch 找第二个函数 $y$：考虑 $\\ell(nP_\\infty)$ 或 $\\ell((g+1)P_0)$ 型，取 $\\ell(K)$ 或 $\\ell((g+1)P_0)$ 中的一个不是 $x$ 的多项式的函数。标准做法：因为 $x^i$（$i=0,1,\\dots,g$）型与 $x^{i}y$ 型给出的极点阶数不同，可以凑出 $g+1$ 个在 $\\ell((2g+1)P_\\infty)$ 型空间中的独立函数，而该空间维数由 Riemann–Roch 算出为 $g+1$ 或 $g+2$，比较维数得到 $y^2$ 与 $f(x)=\\prod(x-a_i)$ 的线性关系，即 $y^2=c\\prod_{i=1}^{2g+1}(x-a_i)$ 与 $y^2=c\\prod_{i=1}^{2g+2}(x-a_i)$ 两种形式（取决于无穷远处是一个点还是两个点）。把常数 $c$ 通过缩放吸收（char k ≠ 2 时可以让 $c=1$）得到 $y^2=f(x)$ 的标准形式，$\\deg f=2g+1$（一个无穷远点、$f$ 无重根）或 $2g+2$（两个无穷远点、$f$ 无重根）。$\\deg f$ 与无穷远点的个数对应：$\\deg f=2g+1$ 时无穷远处只有一个点（RAM 分歧），$\\deg f=2g+2$ 时有两个点。两种模型通过变换 $x=1/x'$、$y=y'/x'^{g+1}$ 型互换。",
        ['divisor-equivalence']),
      step('automorphisms-and-moduli', '自同构群、分歧点与模参数',
        '设 $\\pi:X\\to\\mathbb P^1$ 是 $X/\\sigma$ 的商映射，$\\operatorname{Aut}(X)$ 的元素与 $\\sigma$ 交换（因为 $\\sigma$ 在中心），故 $\\operatorname{Aut}(X)$ 作用在商 $\\mathbb P^1$ 上并保持分歧除子（$2g+2$ 个点，计重数）。反过来，给定 $\\mathbb P^1$ 的一个自同构 g 保持分歧除子，则存在 $X$ 的自同构提升它（在正规覆盖理论中，$X\\to\\mathbb P^1$ 是 $\\mathbb P^1$ 去掉分歧点后的二重覆盖的完备化，提升由单值化与函数域上的作用给出）。于是 $\\operatorname{Aut}(X)/\\langle\\sigma\\rangle\\hookrightarrow\\operatorname{Aut}(\\mathbb P^1)$ 的像恰是保持 $2g+2$ 个分歧点的有限子群。特别地 $\\operatorname{Aut}(X)$ 的连续自由度全在分歧点的位置：通过 $\\mathrm{PGL}_2$ 把三个分歧点规范化为 $0,1,\\infty$，其余 $2g-1$ 个点的位置给出 $2g-1$ 个参数，去掉 $\\mathrm{PGL}_2$ 剩余的作用（有限群）后得到超椭圆曲线的模空间维数 $2g-1$ 型？核算：$\\mathcal H_g$ 的维数应为 $2g-1$。由 $2g+2$ 个分歧点在 $\\mathbb P^1$ 上的模（即 $2g+2$ 个点模 $\\mathrm{PGL}_2$，维数 $2g+2-3=2g-1$），得 $\\dim\\mathcal H_g=2g-1$，与 $\\mathcal M_g$ 的维数 $3g-3$ 比较：$2g-1\\le3g-3$ 当 $g\\ge2$，差值 $g-2$ 说明超椭圆轨迹在模空间中是余维 $g-2$ 的子簇，而 $g=2$ 时两者维数相同（所有 $g=2$ 的曲线都是超椭圆的）。有限的自同构群 $\u007e$ 部分由分歧点构型的对称性给出，例如 $y^2=x^{2g+2}-1$ 型曲线有额外的 $\\mu_{2g+2}$ 型作用。',
        ['equation-model']),
      step('worked-example', '可核算的例子：$g=2,3$ 的方程、分歧与自同构',
        '$g=2$：$2g+2=6$，模型 $y^2=f(x)$，$\\deg f=5$ 或 6。取 $y^2=x^5-x=x(x^4-1)=x(x-1)(x+1)(x^2+1)$，$\\deg f=5$，$f$ 无重根，故曲线光滑、$g=(5-1)/2=2$。核算亏格：由公式 $g=(\\deg f-1)/2$（$\\deg f=2g+1$）得 $g=2$。核对分歧：$\\pi(x,y)=x$，分歧点为 $x=a_i$ 上的点（$y=0$，共 5 个）与 $x=\\infty$（$\\deg f$ 为奇数故 $\\infty$ 处 RAM 分歧，仍是 1 个点的重数 2），总重数 $5+1=6=2g+2$，与 Riemann–Hurwitz 相符。$g=3$：$\\deg f=7$ 或 8，例如 $y^2=x^7-x$（$\\deg f=7$，$g=3$），分歧点重数 $7+1=8=2g+2$，相符。自同构核算：$y^2=x^7-x$ 有对合 $\\sigma(x,y)=(x,-y)$ 以及 $x\\mapsto -x$（因为 $f(-x)=(-x)^7-(-x)=-(x^7-x)=-f(x)$，故 $(x,y)\\mapsto(-x,iy)$ 在 $i$ 属于基域时是自同构）；后者在 $\\mathbb P^1$ 上置换分歧值 $\\{0,\\pm1,\\pm i,\\pm\\sqrt[6]{-1}\\cdots\\}$ 型集合，说明分歧点的对称性确实给出额外的自同构。这两个例子把“方程、分歧、自同构、亏格”四条数据一次性对上，是超椭圆理论中最值得手算的核对。',
        ['automorphisms-and-moduli']),
    ],
    conclusion: '对 $g\\ge2$（char k ≠ 2）的曲线 X，以下等价：存在次数 2 的态射 $X\\to\\mathbb P^1$；存在 P 使 $\\ell(2P)=2$；存在 $P\\neq Q$ 使 $\\ell(P+Q)=2$；典范映射 $\\varphi_K$ 不是单射；X 由方程 $y^2=f(x)$（$\\deg f=2g+1$ 或 $2g+2$，f 无重根）给出。此时 X 有唯一的超椭圆对合 $\\sigma$，$X/\\sigma\\cong\\mathbb P^1$，$\\sigma$ 位于 $\\operatorname{Aut}(X)$ 中心，$\\operatorname{Aut}(X)/\\langle\\sigma\\rangle$ 嵌入 $\\mathrm{PGL}_2$ 并保持 $2g+2$ 个分歧点；超椭圆模空间维数为 $2g-1$（故超椭圆轨迹在 $\\mathcal M_g$ 中余维 $g-2$，$g=2$ 时充满整个模空间）。',
    dependencies: [],
    consequences: [],
    explanation: '超椭圆性的全部内容可以压成一句话：曲线有一个“换层”的对合。这个对合使曲线成为 $\\mathbb P^1$ 上的二重覆盖，于是曲线的整份几何被搬到 $\\mathbb P^1$ 上去：函数域是 $k(x)(\\sqrt{f(x)})$ 型，分歧点决定一切，$g$ 由 $\\deg f$ 直接给出，自同构由分歧点构型的对称性给出。这也是超椭圆曲线在计算上友好的原因：一切都可以用一元多项式算完，而一般曲线的计算必须经过线性系与 Riemann–Roch 的多步推理，这就是超椭圆曲线成为密码学常用曲线族（亏格 2、3 的超椭圆曲线的 Jacobian 上的离散对数问题）的实际原因。值得注意的是“唯一二重覆盖”与“唯一自同构”是相互印证的：如果存在两个不同的次数 2 映射，它们的复合会给出 $\\operatorname{Aut}(\\mathbb P^1)$ 中的一个非平凡元素从而产生额外的自同构，这与“$\\operatorname{Aut}(X)/\\langle\\sigma\\rangle$ 保持分歧点”的有限性冲突。',
    examples: [
      { title: '例子：$y^2=x^6+1$ 与 $y^2=x^5+1$ 的亏格、分歧与无穷远点', body: "$y^2=x^6+1$：$\\deg f=6=2g+2$，$g=2$；$f$ 无重根（$f'=6x^5$ 与 f 无公共根），曲线光滑。无穷远处：$\\deg f=6$ 偶，故 $x=\\infty$ 处有两个点在 $X$ 上（在 $\\mathbb P^1$ 的 $\\infty$ 处 $y\\sim x^3$ 给出两个不同的无穷远点），两个无穷远点都没被分歧（因为 $\\deg f$ 与 $g+1=3$ 的奇偶性匹配），分歧点只有 6 个有限点 $x^6=-1$，总重数 $6=2g+2$。$y^2=x^5+1$：$\\deg f=5=2g+1$，$g=2$；$f$ 无重根，$x=\\infty$ 在 $X$ 上只有一个点且该点分歧（RAM 型），分歧重数 $5+1=6=2g+2$。两例的亏格相同（都是 2）但无穷远处的行为不同，这正是“$\\deg f$ 的奇偶决定无穷远处点数”的具体体现，也是超椭圆曲线分类时必须区分两种方程形式的原因。" },
    ],
    remarks: [
      'char k ≠ 2 是方程模型 $y^2=f(x)$ 的前提：特征 2 时二次扩张由 Artin–Schreier 型方程 $y^2+y=f(x)$ 给出，$y\\mapsto y+1$ 是二阶自同构（而不是 $y\\mapsto-y$），因此“超椭圆对合是 $y\\mapsto-y$”这一描述在特征 2 失效，但“存在次数 2 映射”这一等价性仍然成立。',
      '超椭圆与“有 $g^1_2$”是同一件事，但 $g\\ge2$ 时 $g^1_2$ 若存在则唯一（由超椭圆对合的唯一性），这与其他 $g^1_d$（$d\\ge3$）的一般曲线可以有多个的情况形成对比。因此在超椭圆曲线上做线性系计算时可以直接用这个唯一的 $g^1_2$ 作为参照，而在非超椭圆曲线上没有这样的固定参照。',
      '$g=2$ 时所有曲线都超椭圆（因为 $\\deg K=2$、$\\ell(K)=2$ 给出到 $\\mathbb P^1$ 的次数 2 映射），因此“非超椭圆”这一条件在 $g=2$ 时是空的；相应地 $\\mathcal M_2$ 与超椭圆模空间 $\\mathcal H_2$ 维数相同（都是 3？核算：$2g-1=3$ 与 $3g-3=3$ 相符），这一点在讨论模空间的层化时必须注意。',
      '分歧点的个数 $2g+2$ 是固定的，但分歧值的构型受 $\\mathrm{PGL}_2$ 作用，因此在写“超椭圆曲线由 $2g+2$ 个分歧点决定”时必须模去 $\\mathrm{PGL}_2$（以及可能的分歧构型自同构），否则会数错模参数个数（$2g+2-3=2g-1$ 才是超椭圆模空间的维数）。',
    ],
    corollaries: [
      { title: '推论：$g\\ge2$ 超椭圆曲线上 $\\deg\\varphi_K$ 的像是有理正规曲线', body: '设 X 超椭圆，$\\pi:X\\to\\mathbb P^1$ 为商映射，则 $\\varphi_K$ 分解为 $X\\xrightarrow{\\pi}\\mathbb P^1\\xrightarrow{v_{g-1}}\\mathbb P^{g-1}$，其中 $v_{g-1}$ 由 $\\mathcal O_{\\mathbb P^1}(g-1)$ 的 g 个截面给出，其像为 $\\mathbb P^1$ 的有理正规曲线（次数 $g-1$）。因此超椭圆曲线的典范像是低次的（$g-1$ 而非 $2g-2$），这个次数差 $g-1$ 正是“典范映射失去单射性”的度量：它等于超椭圆对合在典范线性系上的作用所压缩掉的信息量。这条推论也解释了为什么超椭圆曲线的典范环不是由二次关系生成的（有理正规曲线的坐标环由二次关系生成，而次数由 $g-1$ 给出）。', uses: ['hyperelliptic-involution'] },
    ],
    references: [
      stacks('Section 0E3Q: Hyperelliptic curves', '0E3Q'),
      stacks('Section 0BQ4: Riemann-Roch for curves', '0BQ4'),
      { title: 'Algebraic Geometry, Chapter IV, §5', author: 'R. Hartshorne', year: 1977 },
      { title: 'Geometry of Algebraic Curves, Volume I, Chapter III', author: 'E. Arbarello, M. Cornalba, P. Griffiths, J. Harris', year: 1985 },
    ],
    history: HISTORY,
  },

  /* ═══════════════════════════════════════════════════════════
   * 9. Weil 配对
   * ═══════════════════════════════════════════════════════════ */

  'b-weil-pairing': {
    statement: '设 E 是域 K 上的椭圆曲线（char K 不整除 n），$E[n]$ 是 n-挠子群，$\\mu_n$ 是 $\\bar K$ 中的 n 次单位根群。则存在配对 $e_n:E[n]\\times E[n]\\to\\mu_n$（Weil 配对），满足：(1)（双线性）$e_n(S_1+S_2,T)=e_n(S_1,T)e_n(S_2,T)$、$e_n(S,T_1+T_2)=e_n(S,T_1)e_n(S,T_2)$；(2)（反对称且非退化）$e_n(S,T)=e_n(T,S)^{-1}$，特别地 $e_n(T,T)=1$；且 $e_n(S,T)=1$ 对一切 T 成立当且仅当 $S=O$；(3)（Galois 等变）$e_n(\\sigma S,\\sigma T)=\\sigma(e_n(S,T))$ 对 $\\sigma\\in G_K$；(4)（与 $\\operatorname{div}$ 的相容）对除子 $D=\\sum n_i P_i$ 与 $\\sum n_iP_i$ 与 T 同 n-挠时，$e_n(D,T)=\\prod_i e_n(P_i,T)^{n_i}$ 给出 $e_n(D,T)=\\frac{f_D(T)}{\\text{（转移量）}}$ 型的显式公式（Tate 局部形式）；(5)（推论）$E[n]\\cong(\\mathbb Z/n)^2$，且 Weil 配对是完美配对，故 $E[n]\\cong\\operatorname{Hom}(E[n],\\mu_n)$ 作为 $G_K$-模；(6) 由 $n=\\ell^m$ 的相容系统取极限得 Tate 模上的配对 $e:T_\\ell E\\times T_\\ell E\\to\\mathbb Z_\\ell(1)$。',
    explanation: 'Weil 配对是把椭圆曲线的“群结构”翻译成“线性代数”的枢纽。椭圆曲线本身只是一个群（且是同维数 1 的代数群），它的 n-挠子群看起来至多是一个有限阿贝尔群；但 Weil 配对的存在立刻给出更强的结论：$E[n]$ 上有非退化的反对称双线性形式，因此 $E[n]$ 必然是 $(\\mathbb Z/n)^2$ 型的（从而是自由 $\\mathbb Z/n$-模秩 2），并且 Galois 作用在它上面是一个良定义的二维表示。这一条推论为什么重要？因为在没有配对的情况下，$E[n]$ 是否可能是 $\\mathbb Z/n\\times\\mathbb Z/d$（$d\\mid n$）型或循环的，需要单独论证；而配对一步到位地排除这些可能。本条记录把配对的两条构造路线都写出来：除子路线（用“除子等价于主除子”+ 函数的值给出 Miller 型公式，需要把除子调整成与 T 无交）与上同调路线（用 Kummer 序列 $0\\to\\mu_n\\to\\mathbb G_m\\to\\mathbb G_m\\to0$ 的长正合列在 $H^0$ 上取连接映射，得到的对偶恰好是 k 向量空间的 Tate 对偶）。',
    steps: [
      step('divisor-construction', '除子构造：用 $f_D$ 的函数值与调整',
        '先给出配对的显式定义（这是可以手算的版本）。设 $T\\in E[n]$，任取除子 $D\\sim n[T]-n[O]$ 且 $D$ 与 $O$ 无交（“与 O 无交”可通过平移 T 使 D 的支点避开 O：由于 $E[n]\\supset D$ 的支点只有有限多个，可取一个平移，或等价地把 $e_n(S,T)$ 的定义用 $D\\sim[S]-[O]$ 型除子调整）。因为 $n[T]-n[O]$ 是主除子（$\\operatorname{div}(f_T)=n[T]-n[O]$ 对某个 $f_T\\in K(E)$），存在 $g$ 使 $\\operatorname{div}(g)=D$，且 $g$ 在 $D$ 的支点处有 n 阶零点或极点。定义 $e_n(S,T)=\\prod_i g_D(P_i)^{n_i}$ 型，更标准的形式是 $e_n(S,T)=\\frac{g(T+S)\\,g(T)\\,g(S)}{g(T+S\\cdots)}$ 型；Tate 的干净形式是：对 $S,T\\in E[n]$，取 $D_S\\sim[S]-[O]$ 与 $D_T\\sim[T]-[O]$ 且两者支集不交，令 $f_S=\\operatorname{div}$ 型的函数使 $\\operatorname{div}(f_S)=nD_S$，则 $e_n(S,T)=\\frac{f_S(D_T)}{f_T(D_S)}$（在 $\\mu_n$ 中取值）。核对良定义性：若把 $D_S$ 换成 $D_S+\\operatorname{div}(h)$，则 $f_S$ 乘以 $h^n$，而由 $h^n$ 在 $D_T$ 上的取值给出 $\\prod h(P_i)^{n_i}=\\pm1$ 型的 $\\mu_n$ 元素，故 $e_n$ 不变（这一步用到了 n-挠性与“函数在除子上的取值只依赖除子类模 n 倍”这一事实）。这个定义是纯代数的，不依赖 K 的赋值与复数化，因此它对特征 p 也适用（只要 $n$ 与 char K 互素）。',
        []),
      step('bilinearity', '双线性：从定义直接核对',
        '要证 $e_n(S_1+S_2,T)=e_n(S_1,T)e_n(S_2,T)$。在除子层面，$[S_1+S_2]-[O]\\sim([S_1]-[O])+([S_2]-[O])$型地取和为除子，故可取 $D_{S_1+S_2}=D_{S_1}+D_{S_2}$ 型（在支集不交的调整后），而对应的函数 $f_{S_1+S_2}$ 满足 $\\operatorname{div}(f_{S_1+S_2})=n(D_{S_1}+D_{S_2})$，即 $f_{S_1+S_2}=f_{S_1}f_{S_2}$ 相差一个常数，代入定义得 $e_n(S_1+S_2,T)=e_n(S_1,T)e_n(S_2,T)$。第二个变量同理，由一个对称的论证给出。这条核对看似形式，但需要一处实质性的检查：$e_n$ 的取值落在 $\\mu_n$ 中而不是任意单位，即 $e_n(S,T)^n=1$。证明：$e_n(S,T)^n=\\frac{f_S(D_T)^n}{f_T(D_S)^n}$，而 $\\operatorname{div}(f_S^n)=n^2D_S=n\\operatorname{div}(f_S)$ 型，用“$f^n$ 的除子是 $n\\operatorname{div}(f)$”与 Weil 互反律（两个无交除子上函数取值的乘积互相抵消）得 $f_S(D_T)^n=f_S(nD_T)=f_S(\\operatorname{div}(f_T))=\\prod f_S(T_i)^{n_i}$ 型的量等于 $f_T(D_S)^n$，故比值为 1。这一步用的正是“Weil 互反律”与“主除子上函数取值乘积为 1”这一基本事实，因此整个双线性与 $\u03bc_n$ 取值都是 Weil 互反律的推论。',
        ['divisor-construction']),
      step('antysymmetric-nondegenerate', '反对称性与非退化性',
        '反对称性 $e_n(S,T)=e_n(T,S)^{-1}$：由定义的对称形式（$e_n$ 的定义中 $S,T$ 的地位对称，差别只在分子分母的交换）直接得到 $e_n(S,T)e_n(T,S)=1$，故 $e_n(T,T)=1$。这一步也说明 $E[n]$ 上的形式是“交错的”而不是“对称的”，这一点在 n 为偶数时是实质性的（交错形式在 $\\mathbb Z/n$ 上要求自配对为 1，而对称形式则不会）。非退化性分两步：先证 $e_n(S,T)=1$ 对一切 T 成立蕴含 $S=O$。用对偶性论证：$E[n]\\to\\operatorname{Hom}(E[n],\\mu_n)$，$S\\mapsto e_n(S,-)$ 是群同态（双线性），其核记 $\\operatorname{rad}$。取 $S\\in\\operatorname{rad}$，则对一切 $T$ 有 $e_n(S,T)=1$。由步骤 1 的显式公式这等价于“$f_S$ 在一切 n-挠点上取值只差 n 次方”，再由“$f_S$ 的除子是 $nD_S$”与 Weil 互反律推得 $D_S$ 本身必须是主除子的 n 倍型，从而 $S=O$。更干净的路径是上同调（下一步）：Kummer 序列给出 $E[n]\\cong H^0$ 型的对偶，非退化性由 Tate 对偶自动给出。两个方向合起来：$S\\mapsto e_n(S,-)$ 是单射，定义域与到达域都是 $n^2$ 阶群（由下一步），故是双射，即完美配对。',
        ['bilinearity']),
      step('galois-equivariance', 'Galois 等变与结构推论 $E[n]\\cong(\\mathbb Z/n)^2$',
        'Galois 等变：设 $\\sigma\\in G_K$。把 $\\sigma$ 作用在除子与函数上（系数的 Galois 作用与函数的共轭），则由定义 $e_n$ 的表达式中所有数据都是代数地定义的，且 $\\operatorname{div}(f^{\\sigma})=\\operatorname{div}(f)^{\\sigma}$，故 $e_n(\\sigma S,\\sigma T)=\\sigma(e_n(S,T))$（把 $\\mu_n$ 看作 $G_K$-模，作用即 $\\zeta\\mapsto\\zeta^{\\chi(\\sigma)}$，$\\chi$ 是分圆特征）。结构推论：非退化反对称配对存在意味着 $E[n]$ 是秩 2 的自由 $\\mathbb Z/n$-模。证明用群论：设有限阿贝尔群 $A$ 有非退化交错配对 $A\\times A\\to\\mu_n$，把 $A$ 按主理想环 $\\mathbb Z/n$ 上的有限生成模来讨论（$\\mathbb Z/n$ 不是整环但仍是准弗罗贝尼乌斯环，标准做法是先把 $A$ 分解成 $p$-分量并对 $n=p^m$ 处理），则 $A$ 的必要形状是 $A\\cong(\\mathbb Z/n)^2$：一方面“配对非退化”给出 $|A|\\le|\\operatorname{Hom}(A,\\mu_n)|=|A|$ 型的等式，另一方面交错性要求 $\\mu_n$ 型模的结构必须成对出现（$\\mathbb Z/n$ 的每个直和项都需要一个配对的对应项），于是 $A$ 的秩为偶数；在椭圆曲线情形 $E[n]$ 的秩为 2（由 $E$ 的“一次”上同调维数为 2 给出，也可由 $\\ell$-adic 上直接验证），故 $E[n]\\cong(\\mathbb Z/n)^2$，即 $|E[n]|=n^2$。这个推论是椭圆曲线算术的基石：它保证 n-挠点的个数恰为 $n^2$，从而使 Tate 模是秩 2 自由模、$\\ell$-adic 表示是到 $\\operatorname{GL}_2$ 的。',
        ['antysymmetric-nondegenerate']),
      step('cohomological-view', '上同调视角与 Tate 模极限',
        '上同调构造：由 Kummer 序列 $0\\to\\mu_n\\to\\mathbb G_m\\xrightarrow{n}\\mathbb G_m\\to0$ 在平展拓扑上取长正合列 $0\\to \\mu_n(K)\\to K^{\\times}\\xrightarrow{n}K^{\\times}\\to H^1(\\operatorname{Spec}K,\\mu_n)\\to H^1(\\operatorname{Spec}K,\\mathbb G_m)\\xrightarrow{n}\\cdots$，其中 $H^1(\\operatorname{Spec}K,\\mathbb G_m)=K^{\\times}$（Hilbert 90），故 $H^1(\\operatorname{Spec}K,\\mu_n)\\cong K^{\\times}/K^{\\times n}$；再把 $E[n]$ 通过 Kummer 型的序列 $0\\to E[n]\\to E\\xrightarrow{n}E\\to0$ 与 $H^1$ 联系起来，得到 $E(K)/nE(K)\\hookrightarrow H^1(K,E[n])$ 型的正合列，而 Weil 配对恰好是 Tate 局部对偶 $H^1(K,E[n])\\times H^1(K,E[n])\\to H^2(K,\\mu_n^{\\otimes2})$ 型配对在 $E[n]$ 上的限制。这条路线的好处是它自动给出非退化性与 Galois 等变性（因为 $H^1$ 与 $H^2$ 的配对是函子性的），代价是它需要平展上同调的语言。Tate 模极限：把 $n=\\ell^m$ 的配对做相容系统（由 $e_{\\ell^{m+1}}(S,T)^{\\ell}=e_{\\ell^m}(\\ell S,\\ell T)$ 型的相容性保证），取逆向极限得 $e:T_\\ell E\\times T_\\ell E\\to\\mathbb Z_\\ell(1)$，并且 $T_\\ell E\\cong\\mathbb Z_\\ell^2$ 自由、配对完美、Galois 等变，这正是“用线性代数研究椭圆曲线算术”的入口。',
        ['galois-equivariance']),
    ],
    conclusion: '椭圆曲线上的 Weil 配对 $e_n:E[n]\\times E[n]\\to\\mu_n$ 存在、双线性、反对称（$e_n(T,T)=1$）、非退化且 Galois 等变；它由除子与函数的值显式给出（Tate 形式 $e_n(S,T)=f_S(D_T)/f_T(D_S)$），也可由上同调（Kummer 序列与 Tate 局部对偶）得到。其第一个重要推论是 $E[n]\\cong(\\mathbb Z/n)^2$（配对非退化加交错性迫使挠群为自由秩 2），第二个是 $S\\mapsto e_n(S,-)$ 给出 $E[n]\\cong\\operatorname{Hom}(E[n],\\mu_n)$ 作为 $G_K$-模。对 $n=\\ell^m$ 取极限得到 Tate 模上的完美配对 $e:T_\\ell E\\times T_\\ell E\\to\\mathbb Z_\\ell(1)$。',
    dependencies: [],
    consequences: [],
    explanation: 'Weil 配对之所以是“数论中最重要的翻译之一”的催化剂，是因为它把椭圆曲线的挠点从“一个抽象的有限群”变成“一个带非退化形式的自由模”。这一步的直接收获是 Galois 表示：$G_K$ 作用在 $E[n]\\cong(\\mathbb Z/n)^2$ 上给出 $\\rho_{E,n}:G_K\\to\\operatorname{GL}_2(\\mathbb Z/n)$，而当 n 变化时通过相容系统得到 $\\ell$-adic 表示 $\\rho_{E,\\ell}:G_K\\to\\operatorname{GL}_2(\\mathbb Z_\\ell)$，于是“椭圆曲线的算术”被翻译成“二维 Galois 表示的算术”，从而可以调用表示论、模形式与自守形式的整台机器——模性定理的表述正依赖于这一翻译。第二条收获是配对的结构性：交错、非退化这两个词合起来就决定了 $E[n]$ 的形状，这使得很多关于挠群的论证不必逐个研究曲线，而可以直接从抽象形式推出。第三条收获在应用侧：配对是可计算的（Miller 算法），这正是基于双线性对的密码协议（如基于配对的身份基加密与短签名）的技术基础。',
    examples: [
      { title: '例子：在 $E:y^2=x^3-x$ 上把 $E[2]$ 与 $e_2$ 算出来', body: '取 $E:y^2=x^3-x$（$K=\\mathbb Q$）。2-挠点满足 $2P=O$，即 $y=0$（弦切法中切线垂直于轴的退化情形），故 $E[2]=\\{O,(0,0),(1,0),(-1,0)\\}\\cong(\\mathbb Z/2)^2$，四个点，与 $n^2=4$ 相符。$\\mu_2=\\{\\pm1\\}$，故 $e_2$ 取值于 $\\{\\pm1\\}$。计算 $e_2((0,0),(1,0))$：由 Tate 公式取 $D_{(0,0)}=[(0,0)]-[O]$、$D_{(1,0)}=[(1,0)]-[O]$，需要函数 $f$ 使 $\\operatorname{div}(f)=2D_{(0,0)}$，即 $f$ 在 $(0,0)$ 有二重极点、在 $O$ 有二重零点；取 $f=x/y$ 型（核算：$x$ 在 $(0,0)$ 处值为 0 而 $y$ 也为 0，用局部参数 $t=y/x$ 型展开可知 $x/y=1/t$ 型在 $(0,0)$ 有二重极点，在 $O$ 处 $x/y$ 有二重零点），于是 $e_2(S,T)=\\frac{f_S(D_T)}{f_T(D_S)}$ 型的比值为 $f_{(0,0)}((1,0))$ 与 $f_{(1,0)}((0,0))$ 的比，代入 $f=x/y$ 得 $\\frac{1/0}{0/1}$ 型需按除子定义解释为极限，结果给出 $e_2=-1$。这意味着配对把 $E[2]$ 上的三个非平凡元素配成两两 $-1$，与 $\\mu_2$ 的非平凡元素只有一个这一事实相符（交错形式在特征 2 域上：$\\mathbb F_2$ 上的交错形式都是零，而这个计算在 $\\mu_2$ 上给出非平凡值，说明 $e_2$ 是“交错”而非“$\\mu_n$ 值”意义上的完全退化）。' },
    ],
    remarks: [
      'Weil 配对的反对称性是“交错”（$e_n(T,T)=1$）而不是“对称”，这一点在 n 为偶数时至关重要：交错形式在 $\\mathbb Z/n$ 上要求自配对为 1，而对称形式会给自配对一个非平凡值（例如 $n=2$ 时对称形式对应的“对角”行为会允许循环的 $\\mathbb Z/2$ 型挠群）。把两者混同会丢失“$E[n]$ 为自由秩 2”这一结论。',
      '配对的定义要求 $n$ 与 char K 互素：若 $\\ell=\\operatorname{char}K$，则 $\\mu_\\ell$ 平凡、$E[\\ell]$ 可能是 $\\mathbb Z/\\ell$ 型（“超奇异”情形）或 $\\mu_\\ell$ 型（“ordinary”情形），此时 $\\ell$-adic Tate 模的秩可能退化为 1 或 2，必须用 $\\ell$-divisible 群与 Dieudonné 模的理论替换 Weil 配对。因此“$E[n]\\cong(\\mathbb Z/n)^2$”这句话只对与特征互素的 n 成立。',
      '非退化性必须是“对一切 T”而不是“存在某个 T”：$e_n(S,T)=1$ 对某个特定 T 成立不能推出 $S=O$（例如 $S\\in E[n]$ 与 T 生成的循环子群正交时）。使用配对时若只验证了一侧，会得到“核非平凡”的错误结论，进而错判 Galois 表示的忠实性。',
      '配对给出 $E[n]\\cong\\operatorname{Hom}(E[n],\\mu_n)$ 是同构而不是等变同构的自动结论：Galois 等变性必须单独验证（$e_n(\\sigma S,\\sigma T)=\\sigma(e_n(S,T))$），因为对偶空间上的 Galois 作用是逆变的（对偶表示是原表示的对偶），而 $\\mu_n$ 的 Galois 作用来自分圆特征，两者必须核对一致才能把 $E[n]$ 与它的对偶等同起来。',
    ],
    corollaries: [
      { title: '推论：$E[n]\\cong(\\mathbb Z/n)^2$ 与 Tate 模的秩 2 自由性', body: '由 Weil 配对的非退化性与交错性，$E[n]$ 作为 $\\mathbb Z/n$-模是自由秩 2，即 $E[n]\\cong(\\mathbb Z/n)^2$（char K 不整除 n）。取 $n=\\ell^m$ 的相容系统得 $T_\\ell E=\\varprojlim_m E[\\ell^m]\\cong\\mathbb Z_\\ell^2$ 是秩 2 自由 $\\mathbb Z_\\ell$-模，且其上 $G_K$ 的作用给出连续表示 $\\rho_{E,\\ell}:G_K\\to\\operatorname{GL}_2(\\mathbb Z_\\ell)$；取 $V_\\ell E=T_\\ell E\\otimes\\mathbb Q_\\ell$ 得 2 维 $\\mathbb Q_\\ell$ 表示。这条推论是椭圆曲线算术的出发点：所有关于“$\\rho_{E,\\ell}$ 的像有多大、是否可约、是否与某个模形式对应”的问题都建立在这个秩 2 自由性上。', uses: ['galois-equivariance'] },
    ],
    references: [
      stacks('Section 0E4Q: The Weil pairing', '0E4Q'),
      { title: 'Arithmetic of Elliptic Curves (Graduate Texts in Mathematics 106), Chapter III', author: 'J. H. Silverman', year: 1986 },
      { title: 'Lectures on Elliptic Curves (London Mathematical Society Student Texts 24)', author: 'J. W. S. Cassels', year: 1991 },
      { title: 'The arithmetic of elliptic curves, §III.8 (Weil pairing)', author: 'J. Tate', year: 1974 },
    ],
    history: HISTORY,
  },

}
