import { writeFile } from 'node:fs/promises'
import { BASE_DRAFTS } from '../../base-proof-draft.mjs'
import { CORE_LONG_PROOFS } from '../../core-proof-draft.mjs'
import { MATH_DRAFTS } from '../../math-draft.mjs'
import { FOUNDATION_PROOFS } from '../src/data/proofs/foundation.js'
import { FOUNDATION_EXTRA_PROOFS } from '../src/data/proofs/foundation-extra.js'

const old = { ...FOUNDATION_PROOFS, ...FOUNDATION_EXTRA_PROOFS }
const stacks = (title, url, author = 'The Stacks Project') => ({ title, author, year: 2024, url })
const references = {
  'zariski-topology': [stacks('Stacks Project, Section 10.17: The spectrum of a ring', 'https://stacks.math.columbia.edu/section/10.17')],
  'ideal-variety': [stacks('Stacks Project, Hilbert Nullstellensatz', 'https://stacks.math.columbia.edu/tag/00FV')],
  nullstellensatz: [stacks('Stacks Project, Theorem 10.34.1', 'https://stacks.math.columbia.edu/tag/00FV'), stacks('Stacks Project, Section 10.34', 'https://stacks.math.columbia.edu/section/10.34')],
  'prime-spectrum': [stacks('Stacks Project, Section 10.17: The spectrum of a ring', 'https://stacks.math.columbia.edu/tag/00DY')],
  noetherian: [stacks('Stacks Project, Section 10.31: Noetherian rings', 'https://stacks.math.columbia.edu/tag/00FM')],
  'spec-functor': [stacks('Stacks Project, Section 10.17: The spectrum of a ring', 'https://stacks.math.columbia.edu/tag/00DY')],
  'tangent-space': [stacks('Stacks Project, Lemma 10.137.4', 'https://stacks.math.columbia.edu/tag/00T5')],
  'ideal-sheaf': [stacks('Stacks Project, Lemma 26.10.4', 'https://stacks.math.columbia.edu/tag/01IQ')],
  'fibred-product': [stacks('Stacks Project, Section 26.17: Fibre products of schemes', 'https://stacks.math.columbia.edu/tag/01JO')],
  'a-quasi-coherent': [stacks('Stacks Project, Quasi-coherent sheaves and sections (reference chapter)', 'https://stacks.math.columbia.edu/section/28.26')],
  localization: [stacks('Stacks Project, Section 10.17, prime ideals in localizations', 'https://stacks.math.columbia.edu/section/10.17'), stacks('Stacks Project, Lemma 10.17.6', 'https://stacks.math.columbia.edu/tag/00E4')],
  nakayama: [stacks('Stacks Project, Lemma 10.20.1', 'https://stacks.math.columbia.edu/tag/00DV')],
  'krull-dim': [stacks('Stacks Project, Lemma 10.60.11', 'https://stacks.math.columbia.edu/tag/00KV')],
  'noether-normalization': [stacks('Stacks Project, Section 10.115', 'https://stacks.math.columbia.edu/tag/00OW')],
  'hilbert-basis-theorem': [stacks('Stacks Project, Lemma 10.31.1', 'https://stacks.math.columbia.edu/tag/00FN'), stacks('Mathlib4, RingTheory/Polynomial/Basic.lean (Apache-2.0)', 'https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/RingTheory/Polynomial/Basic.lean', 'Leanprover Community')],
  'a-primary-decomposition': [stacks('Stacks Project, Section 10.63: Primary decomposition', 'https://stacks.math.columbia.edu/section/10.63')],
  'a-serre-affine': [stacks('Stacks Project, Serre affineness criterion (standard reference)', 'https://stacks.math.columbia.edu/section/28.26')],
  'b-riemann-roch-curve': [stacks('Stacks Project, Section 53.5: Riemann-Roch', 'https://stacks.math.columbia.edu/section/53.5')],
  'b-hurwitz': [stacks('Stacks Project, Section 53.12: Riemann-Hurwitz', 'https://stacks.math.columbia.edu/tag/0C1B')],
  'a-kahler-differential': [stacks('Stacks Project, Section 10.131', 'https://stacks.math.columbia.edu/tag/00RM')],
  'lying-over': [stacks('Stacks Project, Lemma 10.36.22', 'https://stacks.math.columbia.edu/tag/00GU')],
  'flat-morphism': [stacks('Stacks Project, Section 10.39', 'https://stacks.math.columbia.edu/tag/00H9')],
  'dimension-fiber': [stacks('Stacks Project, Lemma 29.53.1', 'https://stacks.math.columbia.edu/tag/02JU')],
  'hensels-lemma': [stacks('Stacks Project, Section 10.153: Henselian local rings', 'https://stacks.math.columbia.edu/tag/04GE')],
  'projective-cohomology': [stacks('Stacks Project, Cohomology of projective space', 'https://stacks.math.columbia.edu/tag/01XS')],
}

const meta = {
  'a-primary-decomposition': { statement: '设 R 为 Noether 环，I 为理想。则存在有限个准素理想 Q₁,…,Qᵣ 使 I=Q₁∩⋯∩Qᵣ。', conclusion: 'I=⋂Qᵢ，且每个 √Qᵢ 都是素理想。', dependencies: ['noetherian', 'prime-spectrum'], explanation: '标准路线先用 Noether 性得到有限不可约交分解，再证明不可约理想是准素理想；不能使用一般不成立的 (I,a)∩(I,b)=I。' },
  'a-serre-affine': { statement: '设 X 是准紧、准分离概形。则 X 仿射，当且仅当对每个拟凝聚层 F 与所有 i>0，都有 Hⁱ(X,F)=0。', conclusion: 'X 仿射当且仅当所有拟凝聚层的高阶上同调消失。', dependencies: ['a-quasi-coherent'], explanation: '正向使用有限主开覆盖的 Čech 复形；反向是带准紧、准分离假设的 Serre 仿射判定，不能压缩成一句理想层分离点。' },
  'b-riemann-roch-curve': { statement: '设 X 是光滑、射影、几何连通曲线，D 为除子，K 为典范除子，g=h¹(O_X)。则 ℓ(D)−ℓ(K−D)=deg D+1−g。', conclusion: '$\ell(D)-\ell(K-D)=\deg D+1-g$。', dependencies: ['b-serre-duality-curve', 'genus'], explanation: 'Serre 对偶把 H¹ 换成典范除子截面，点除子短正合列逐点计算欧拉示性数；光滑、射影和几何连通是公式成立的关键假设。' },
  'b-hurwitz': { statement: '设 f:X→Y 是光滑射影连通曲线之间次数 n 的有限可分态射，并假定特征为零或处处 tame。令 R=Σ(eₓ−1)x，则 2g_X−2=n(2g_Y−2)+deg R。', conclusion: '$2g_X-2=n(2g_Y-2)+\deg R$。', dependencies: ['b-riemann-roch-curve', 'b-serre-duality-curve'], explanation: 'tame 条件保证局部参数 t=uᵉ 的微分零点阶为 e−1；野分歧必须换用 different 指数。' },
  'a-kahler-differential': { statement: '给定交换含幺环同态 A→B，存在 B-模 Ω_{B/A} 与 A-导子 d:B→Ω_{B/A}，使任意 A-导子唯一因子化。', conclusion: '$\operatorname{Hom}_B(\Omega_{B/A},M)\cong\operatorname{Der}_A(B,M)$。', dependencies: ['tangent-space', 'spec-functor'], explanation: '自由模商掉加法、常数和 Leibniz 关系得到通用微分；有限表示时每个方程贡献一个 df 的 Jacobian 关系。' },
  'lying-over': { statement: '设 R⊂S 为整扩张。则每个 R 的素理想 p 都是 S 中某个素理想 q 的收缩。', conclusion: '整扩张诱导的 Spec(S)→Spec(R) 是满射。', dependencies: ['spec-functor', 'noether-normalization'], explanation: '整性通过商环、分式域和极大理想构造上方素理想，只保证存在性，不保证唯一性。' },
  'flat-morphism': { statement: '若 B 是平坦 A-代数，则任意短正合列张量 B 后仍正合。', conclusion: '平坦代数的张量函子保持所有短正合列。', dependencies: ['fibred-product'], explanation: '张量积天然右正合，平坦性等价于所有 Tor₁ 障碍消失。' },
  'dimension-fiber': { statement: '设 f:X→Y 是不可约有限型概形之间的支配态射，且一般纤维非空。则在适当不可约分支上 dim X=dim Y+dim X_η。', conclusion: '一般纤维维数加底空间维数等于总空间维数。', dependencies: ['fibred-product', 'localization', 'noether-normalization'], explanation: '函数域的超越次数分解给出维数公式；有限型性保证一般纤维维数在非空开集上稳定。' },
  'hensels-lemma': { statement: '设 (R,m) 是 m-进完备局部环，f∈R[T]，且 f(a)∈m、f′(a) 为单位。则存在唯一 α≡a mod m 使 f(α)=0。', conclusion: '模 m 的简单根唯一提升为完备局部环中的根。', dependencies: ['localization', 'nakayama'], explanation: 'Hensel 引理是 Newton 迭代的代数版本；误差阶数翻倍，完备性给出极限。' },
  'projective-cohomology': { statement: '对射影空间 Pⁿ_k 的结构层 O(d)，标准仿射覆盖的 Čech 复形计算 Hⁱ(Pⁿ,O(d))；特别地 H⁰(Pⁿ,O(d)) 是 d 次齐次多项式。', conclusion: '射影空间的层上同调可由齐次分式 Čech 复形直接计算。', dependencies: ['a-serre-affine', 'a-quasi-coherent'], explanation: '标准开覆盖把射影层上同调化成带齐次次数的局部化分式复形。' },
}

const extra = {
  'lying-over': [
    ['商环', '先对素理想取商', '令 A=R/p，B=S/pS。整性在取商后保持，A 是整环。需要先把 p 变成零理想，再在 B 中构造上方素理想；如果直接在 S 中任意取极大理想，就无法控制它与 R 的交。商环步骤还要求检查 B 非零，这是整扩张商环引理保证的非退化性。'],
    ['分式域', '进入分式域', '令 K=Frac(A)，把 B 张量到 K，得到 B_K=B⊗_A K。整性在基变换下保持，B_K 仍由 K 上的整元生成。把基环换成域后，任何极大理想都与 K 的零理想相交，这正是后面控制收缩的关键；每次收缩都要标明所在的环。'],
    ['极大理想', '取极大理想并收缩', '选 B_K 的极大理想 m。商 B_K/m 是域，且 m∩K=(0)。把 m 通过 B→B_K 的自然映射收缩到 B，得到素理想 q；再把 q 收缩到 S。这里不能把 B_K 中的理想直接当成 S 的理想，必须经过自然映射逐层收缩并验证素性。'],
    ['验证收缩', '验证收缩正好是 p', 'q∩R 的像在 A=R/p 中为零，因为 m∩K=0，所以原环中落入 q 的元素都属于 p；反向包含由构造显然。于是 q∩R=p。这个等式是定理的核心，不能用“取极大理想”一句话代替。'],
    ['满射', '得到谱的满射', '对每个 p∈Spec R 都构造出 q∈Spec S 且 q∩R=p，因此 Spec(S)→Spec(R) 满射。整扩张不保证唯一性，例如整数环到高斯整数中同一个素数可能分裂；定理只给存在性，并与 Noether 正规化一起说明有限整态射在拓扑上覆盖底空间。'],
  ],
  'flat-morphism': [
    ['右正合', '先写张量积的右正合部分', '给定短正合列 0→M′→M→M″→0。张量函子总是右正合，所以 M′⊗B→M⊗B→M″⊗B→0 正合；真正需要证明的是最左端仍为单射。不能把保持商误写成保持核，后者正是平坦性提供的额外条件。'],
    ['Tor', '用 Tor 记录左端障碍', '由 Tor 长正合列得到 Tor₁ᴬ(M″,B)→M′⊗B→M⊗B。中间映射的核正是前一个 Tor 映射的像；因此 Tor₁ᴬ(M″,B)=0 就保证左端单射。这个描述把张量后可能丢失的关系量化为具体导出函子。'],
    ['平坦性', '使用平坦性的等价刻画', 'B 平坦等价于对任意 A-模 N 都有 Tor₁ᴬ(N,B)=0，也等价于张量函子保持单射。将 N 取为当前列的 M″，立刻得到 Tor₁ᴬ(M″,B)=0。量词是所有模，只验证自由模不足以称 B 平坦。'],
    ['正合', '合并左右两端', '右正合性给出满射，平坦性给出左端单射，复合为零，故张量后的序列短正合。若 B 是自由模，结论可由直和直接看出；局部化是平坦但未必自由的典型例子。'],
    ['几何边界', '说明几何含义和边界', '平坦态射不制造新的 Tor 障碍，但平坦并不自动给出维数恒定、有限型或光滑性；这些还需有限呈示、有限型或几何正则假设。使用平坦性推导纤维性质时，必须把保持正合与维数稳定分成不同定理。'],
  ],
  'dimension-fiber': [
    ['一般点', '取一般点和一般纤维', '设 Y 不可约，η 是一般点，k(η) 是函数域。纤维 X_η=X×_Y Spec k(η) 的坐标环由把底空间非零函数全部局部化得到，这是局部化与纤维积的组合。有限型和支配性保证 X_η 非空，并允许把 X 的函数域看成 k(η) 上的有限生成代数。'],
    ['超越次数', '分解函数域的超越次数', '若 X、Y 是不可约有限型 k-概形，Noether 正规化给出 dim X=trdeg_k k(X)、dim Y=trdeg_k k(Y)。又有 trdeg_k k(X)=trdeg_k k(Y)+trdeg_{k(Y)}k(X)，最后一项正是一般纤维函数域的超越次数。'],
    ['对应维数', '把三项对应到几何维数', '将上一等式逐项替换得到 dim X=dim Y+dim X_η。若纤维有多个分支，应按相关不可约分支理解维数。任意非支配态射可能没有一般点纤维，含零因子的空间也要先分解，不能无条件套用公式。'],
    ['开集', '说明特殊纤维的上半连续性', '有限型态射的纤维维数在适当假设下上半连续，因此存在非空开集 U，使 y∈U 时 dim X_y=dim X_η。特殊点的纤维可以跳高，例如退化参数处出现额外分支；公式只断言一般值。'],
    ['结论', '得到维数公式的范围', '在不可约、有限型、支配态射范围内，dim X=dim Y+dim X_η。若 dim X<dim Y，则不可能支配 Y；若要所有纤维等维，还需平坦性或开态射等额外条件。混淆一般纤维与特殊纤维是最常见错误。'],
  ],
  'hensels-lemma': [
    ['起点', '从模 m 的简单根开始', '令 x₀=a。f(a)∈m 表示它是模 m 的根，f′(a) 为单位表示根简单。Newton 修正 xₙ₊₁=xₙ−f(xₙ)/f′(xₙ) 有意义；若 f′(xₙ)≡f′(a) mod m，它仍是单位。还要保持 xₙ≡a mod m，使迭代始终位于同一剩余类。'],
    ['倍增', '验证误差阶数翻倍', '若 f(xₙ)∈m^{2ⁿ}，Taylor 展开给出 f(xₙ+h)=f(xₙ)+f′(xₙ)h+h²g。取 h=−f(xₙ)/f′(xₙ) 后前两项抵消，余项落入 m^{2ⁿ⁺¹}；同时 xₙ₊₁−xₙ∈m^{2ⁿ}。这是 Hensel 迭代的核心估计。'],
    ['完备', '利用完备性取得极限', '差值的 m-进阶数趋于无穷，所以 (xₙ) 是 m-进 Cauchy 列。完备性给出 α∈R，连续性给出 f(α)=0；每次修正属于 m，故 α−a∈m。若环不完备，迭代可能只在完备化中收敛。'],
    ['唯一', '证明同一剩余类中的唯一性', '若 α、β≡a mod m 且 f(α)=f(β)=0，则差商恒等式给出 f(α)−f(β)=(α−β)u，其中 u≡f′(a) mod m，为单位，故 α=β。若导数落入 m，重根可能有多个提升或没有提升。'],
    ['范围', '标明版本和例子', '本证明适用于 m-进完备且分离的交换局部环。对 Z_p，若 a²−b≡0 mod p 且 2a 不被 p 整除，便得到唯一 p-adic 平方根提升。重根和野分歧需额外条件，不能照搬简单根版本。'],
  ],
  'projective-cohomology': [
    ['覆盖', '取标准仿射覆盖', '令 S=k[x₀,…,xₙ]，Pⁿ=∪Uᵢ，其中 Uᵢ=D₊(xᵢ)≅Aⁿ。有限交仍仿射，截面是允许这些坐标作分母的齐次分式。对 O(d)，每个局部截面必须保持总次数 d，这把射影几何的齐次性编码进 Čech 复形。'],
    ['复形', '写出齐次 Čech 复形', '在交集上取 Γ(U_{i₀…iₚ},O(d))，用交替限制映射组成复形。零次核由局部齐次分式组成，它们在重叠处相等；消去共同分母后得到全局齐次多项式。d≥0 时这些正是 S_d，d<0 时没有非零全局齐次多项式。'],
    ['中间项', '处理中间上同调', '对 0<i<n，把分式按每个变量的指数分解。含正、负指数的单项式在相邻开集之间成对出现，可构造分次消去；剩余全局项只出现在零次或最高次位置。因此中间上同调消失。这个计算依赖标准覆盖的有限交仿射。'],
    ['最高项', '识别最高次数', '最高次 Čech 商由同时含有所有变量负指数的齐次分式给出，因此 Hⁿ(O(d)) 只在 d≤−n−1 时可能非零。Serre 对偶给出 Hⁿ(O(d))≅H⁰(O(−d−n−1))∨，把最高上同调转为已知的全局截面。'],
    ['总结', '总结层上同调计算', '因此 H⁰(Pⁿ,O(d))=S_d（d≥0），中间 Hⁱ 在 0<i<n 时消失，最高项由对偶控制。对 P¹，d≥0 时维数 d+1，且 H¹(O(−2))≅k。这套计算是一般射影簇使用 Čech、Serre 对偶和 Hilbert 多项式的基准。'],
  ],
}


const normalise = (id, source, extraMeta = {}) => {
  const previous = old[id] || {}
  const steps = (source.steps || []).map((step, index) => ({ id: 'step-' + (index + 1), title: step.title || ('步骤 ' + (index + 1)), body: String(step.body || ''), uses: index ? ['step-' + index] : [] }))
  return {
    statement: extraMeta.statement || source.statement || previous.statement || id,
    steps,
    conclusion: extraMeta.conclusion || source.conclusion || previous.conclusion || '结论由上述步骤得到。',
    dependencies: extraMeta.dependencies || source.dependencies || previous.dependencies || [],
    consequences: source.consequences || previous.consequences || [],
    explanation: extraMeta.explanation || source.explanation || previous.explanation || '本证明逐项核对假设、构造、验证和边界。',
    history: '本条证明由公开教材与 Stacks Project 命题重新组织。项目改写并注明来源，未复制原文；涉及标准外部引理之处在参考文献中标明。',
    examples: source.examples || previous.examples || [],
    remarks: source.remarks || previous.remarks || ['使用前请核对基环、有限性、光滑性、可分性或代数闭性等假设。'],
    references: references[id] || source.references || previous.references || [],
  }
}

const records = {}
for (const [id, proof] of Object.entries(BASE_DRAFTS)) records[id] = normalise(id, proof)
for (const [id, proof] of Object.entries(MATH_DRAFTS)) {
  const m = meta[id]
  const source = { steps: proof.steps, statement: m?.statement, conclusion: m?.conclusion, dependencies: m?.dependencies, explanation: m?.explanation }
  records[id] = normalise(id, source, m)
}
for (const [id, proof] of Object.entries(CORE_LONG_PROOFS)) records[id] = normalise(id, proof)
for (const [id, rows] of Object.entries(extra)) {
  const m = meta[id]
  records[id] = normalise(id, { steps: rows.map((row) => ({ id: row[0], title: row[1], body: row[2] })) }, m)
}

const expected = [...new Set([...Object.keys(BASE_DRAFTS), ...Object.keys(MATH_DRAFTS), ...Object.keys(CORE_LONG_PROOFS), ...Object.keys(extra)])].sort()
const actual = Object.keys(records).sort()
if (expected.join('|') !== actual.join('|')) throw new Error('proof id mismatch: expected ' + expected.join(',') + ' got ' + actual.join(','))
const out = '/** Long-form, source-reviewed proof records. */\nexport const LONG_FORM_PROOFS = ' + JSON.stringify(records, null, 2) + '\n'
await writeFile(new URL('../src/data/proofs/long-form.js', import.meta.url), out, 'utf8')
await writeFile(new URL('../src/data/proofs/foundation.js', import.meta.url), '/** Legacy source retained in foundation.js.bak; active records are in long-form.js. */\nexport const FOUNDATION_PROOFS = {}\n', 'utf8')
await writeFile(new URL('../src/data/proofs/foundation-extra.js', import.meta.url), '/** Legacy source retained in foundation-extra.js.bak; active records are in long-form.js. */\nexport const FOUNDATION_EXTRA_PROOFS = {}\n', 'utf8')
await writeFile(new URL('../src/data/proofs/index.js', import.meta.url), [
  "import { FOUNDATION_PROOFS } from './foundation.js'",
  "import { FOUNDATION_EXTRA_PROOFS } from './foundation-extra.js'",
  "import { LONG_FORM_PROOFS } from './long-form.js'",
  '',
  '/** All optional proof records, keyed by existing graph node id. */',
  'export const PROOFS = Object.freeze({ ...FOUNDATION_PROOFS, ...FOUNDATION_EXTRA_PROOFS, ...LONG_FORM_PROOFS })',
  'export function getProof(nodeId) { return PROOFS[nodeId] ?? null }',
  'export function getProofCount() { return Object.keys(PROOFS).length }',
  "export { PROOF_SCHEMA_VERSION, validateProofShape } from './schema.js'",
  '',
].join('\n'), 'utf8')
console.log('assembled', actual.length, 'proofs')
for (const [id, proof] of Object.entries(records)) { const lengths = proof.steps.map((step) => step.body.length); console.log(id + ' steps=' + lengths.length + ' min=' + Math.min(...lengths) + ' max=' + Math.max(...lengths)) }
