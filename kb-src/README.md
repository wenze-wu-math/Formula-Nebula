# kb-src — 知识库采集管线

从公开数学数据源**确定性**地抽取结构化结果，扩充「公式诗云」的知识库。

## 采集原则

1. **确定性优先**。只用机器可解析的一手来源（官方 LaTeX 源码、结构化索引、公开 API），
   不用 LLM 生成内容 —— 每条节点都能追溯到官方稳定地址。
2. **生成物与手写分离**。产出写独立文件（`stacks-extra.js` 等），不碰手工撰写的
   `knowledge.js` / `researchers.js`。重新生成永不覆盖人工内容。
3. **先验证后接入**。每一步都有独立的校验脚本，失败不进入下游。

## 数据源现状（2026-11-02 实测）

| 源 | 渠道 | 状态 | 说明 |
|---|---|---|---|
| Stacks Project | 直连（GitHub raw） | ✅ 可用 | 官方 LaTeX 源码 + 21,446 个稳定标签索引 |
| zbMATH Open | 直连（**api.zbmath.org**） | ✅ 可用 | **HTML 页面 403，必须走 API** |
| UnsolvedMath | 直连（HuggingFace） | ✅ 可用 | 机器可读 JSON |
| Mathematics Genealogy | 双渠道 | ❌ **整站下线** | PHP 漏洞，2026-10-21 起停服 |
| nLab | 直连 | ✅ **已接入** | 20,780 页索引；概念条目（非定理） |
| Lean mathlib4 | 双渠道 | ✅ **已接入** | 9,303 个 .lean；形式化定理层 |
| AIM Problem Lists | 双渠道 | ❌ 证书过期 | 直连 fetch failed，代理 cert expired |
| Open Problem Garden | 双渠道 | ❌ 证书不匹配 | 代理报 hostname 与证书 altnames 不符 |
| **Wikipedia 未解决列表** | 直连 + 代理 | ✅ **已接入** | 列表页 wikitext 本身就是结构化清单 |

## 管线

```
定理（Stacks Project）
  fetch-stacks.mjs      拉官方 .tex（GitHub raw，可增量重跑）
  parse-stacks.mjs      抽取：tag / statement / slogan / refs
  build-nodes.mjs       转节点 + 四层关联（--balanced 按族配额）
  verify-stacks.mjs     12/12
  verify-nodes.mjs      18/18

人物（zbMATH Open API）
  fetch-zbmath.mjs      拉作者档案（获奖/MSC 分布/外部 ID）
  build-researchers.mjs 转节点（summary 由 MSC+奖项机械派生，不编造）
  link-researchers.mjs  生成领域关联（MSC → 领域锚点定理）
  verify-researchers.mjs 15/15

概念（nLab，与 Stacks 的定理层互补）
  fetch-nlab.mjs        抓概念页（20,780 页索引筛选 + 语义块抽取）
  build-nlab-nodes.mjs  转节点（相关性闸门过滤哲学/逻辑页）
  verify-nlab.mjs       13/13

形式化定理（Lean mathlib4）
  probe-mathlib-tree.mjs  用 git/trees API 拿真实文件清单（省 GitHub 配额）
  fetch-mathlib.mjs       抓 .lean 源码（双渠道：直连 → 代理 CONNECT 隧道）
  build-mathlib-nodes.mjs 抽 theorem/lemma + docstring
  verify-mathlib.mjs      15/15

猜想（UnsolvedMath，主线：有难度分级）
  build-conjectures.mjs 转节点（按领域配额，已与手写猜想去重）

猜想（Wikipedia，补漏：别名更全）
  fetch-wikipedia.mjs        从列表页 wikitext 抽 `* [[名]]: 陈述`
  build-wikipedia-nodes.mjs  转节点（质量闸门过滤非猜想/人物页）
  verify-wikipedia.mjs       17/17

跨源关联（把三个知识源接起来）
  build-cross-links.mjs      三条规则建立 Stacks ↔ nLab ↔ mathlib 的对应
  verify-cross.mjs           7/7
```

## 当前规模（2026-11-02）

| 类别 | 手写 | 自动采集 | 合计 |
|---|---:|---:|---:|
| 定理（Stacks Project） | 405 | 2,200 | **2,605** |
| 概念（nLab） | — | 538 | **538** |
| 形式化定理（mathlib4） | — | 487 | **487** |
| 猜想（UnsolvedMath） | 59 | 500 | 559 |
| 猜想（Wikipedia） | — | 48 | 48 |
| **猜想合计** | 59 | 548 | **607** |
| 研究者（zbMATH Open） | 24 | 45 | **69** |
| **节点合计** | 488 | 3,818 | **4,306** |
| 关联 | 2,225 | 6,522 | **8,747** |

布局耗时 3,613ms（4,306 节点），孤立节点 0，atlas 首屏约 7.8s。
跨源关联 1,017 条（连接 Stacks ↔ nLab ↔ mathlib）。

### 猜想库的领域覆盖

**全部 17 个分类都已覆盖**（`--limit 500` 时）：

| 分类 | 采集数 | field |
|---|---:|---|
| number_theory | 96 | arith |
| geometry | 71 | topo |
| graph_theory | 65 | algebra |
| combinatorics | 64 | algebra |
| algebra | 61 | algebra |
| topology | 55 | topo |
| group_theory | 25 | algebra |
| set_theory | 14 | logic |
| computer_science | 12 | logic |
| logic | 9 | logic |
| algebraic_geometry | 8 | ag |
| pde / analysis / physics / dynamical_systems / probability / miscellaneous | 6/5/5/2/1/1 | analysis |

**之前认为"小分类没有 LaTeX"是错的**。那是我探测脚本的正则写错了
（`new RegExp` 里 `$` 没转义，导致 `$...$` 永远匹配不上）。
实测 2,075 条未解决里有 **1,551 条含 `$...$`**，覆盖全部 17 个分类。

教训：探测脚本本身出错时，结论会指向"数据缺失"而不是"脚本有 bug"。
验证方法应该是拿一条已知有公式的记录（例如黎曼猜想）正反两面测。

### 定理领域分布（--balanced 模式修正后）

上同调 17.0% · 交换代数 16.3% · 概形与层 15.5% · 双有理 12.1% ·
相交 12.0% · 曲线曲面 10.6% · 态射奇点 8.4% · 模空间现代 8.2%

（修正前上同调占 29%、概形与层只有 5.5% —— 纯按入度排序会偏。）

## 关联的来源与含义

| 类型 | 权重 | 含义 |
|---|---|---|
| `ref` | 0.3–1.0 | Stacks 源码里的 `\ref{...}`，作者显式依赖 |
| `section` | 0.25 | 同小节结果 |
| `topic` | 0.15 | 跨文件同章节标题 |
| `family` | 0.12 | 孤立结果挂本族锚点（兜底） |
| 研究者领域边 | 0.14–0.18 | **"此人活跃在这个领域"**，不表示"此人证明了这个定理" |

## nLab 与 Stacks 的区别（决定了采集方式）

| | Stacks Project | nLab |
|---|---|---|
| 内容 | 规整 LaTeX，定理/引理/定义 | wiki 散文，**概念**解释 |
| 标识 | 4 字符稳定 tag | 页面名（无 tag） |
| 回答 | "这个结论成立吗" | "这个术语什么意思" |
| 公式 | LaTeX 源码 | **MathML**（LaTeX 在 annotation 标签里）|
| 陷阱 | — | 页首有「相关概念」导航块，不是定义 |

所以 nLab 产出的是**概念节点**（nlb-*），与 Stacks 的定理节点（stx-*）互补。

## 三个维度（这是知识库的核心设计）

| 源 | 维度 | 正确性依据 | 回答什么 | 标识 |
|---|---|---|---|---|
| Stacks Project | 定理 | 同行审阅 | 这个结论成立吗 | 4 字符 tag |
| nLab | 概念 | 社区 wiki | 这个术语什么意思 | 页面名 |
| **Lean mathlib** | **形式化** | **Lean 内核**（可 `--trust=0` 重编译）| 机器验证过吗 | 定理全名 |

mathlib 节点的 `formal: true` 标记让前端可以区分显示。

### mathlib 采集的三个坑

1. **文件名不能猜**：靠猜路径 17/28 是 404。用 `git/trees?recursive=1` 一次拿全树。
2. **双渠道必须手写**：Node 的 `fetch` 不读 `HTTP_PROXY`。用内置 `http` 手写 CONNECT 隧道，
   零新增依赖（容器里没装 `undici`）。
3. **类型签名不能直接当公式**：Lean 签名开头是类型类约束
   （`[IsCofiltered I] [∀ {i j} …]`），挤成一团看不懂。
   要剥掉所有 `[...]` 约束，取顶层 `:` 之后的结论部分。

## UnsolvedMath 的两条采集教训

1. **`category` 到 `field` 的映射不能想当然**。早期把 `geometry: 'ag'`，
   结果 Kakeya 猜想、Moving Sofa 问题被当成代数几何。现在按数学实质分：
   geometry→topo、graph_theory/combinatorics→algebra、number_theory→arith。

2. **公式提取不能只取片段**。早期取"长度 ≥12 的 `$...$` 片段"，漏掉了
   `$\zeta(s)$`（8 字符），导致黎曼猜想被判成"无公式"、退化成 `\text{}` 占位。
   现在**保留整句陈述**（`Do all non-trivial zeros of … $\zeta(s)$ … equal $\frac{1}{2}$?`），
   并压到 150 字符以内、截在完整 `$...$` 边界上。

## Wikipedia 采集的三个坑

1. **处理顺序错了会漏清洗**。wikitext 里常见 `<ref>{{citation|...}}</ref>`
   —— `<ref>` 里包着模板。若先剥模板再剥 `<ref>`，`[` `]` 判断会错乱，
   残留 `<ref>{{citation`。**必须先剥外层容器 `<ref>`，再处理内部模板。**

2. **列表页里有以对象命名的开放问题**。`perfect cuboid`（完美长方体存在性）、
   `SIC-POVM`（Zauner 猜想）、`Map folding` 名字都不含 conjecture，
   但确实是未解决问题。校验判据要认「名字含猜想词」**或**「陈述含存在性/未解语气」。

3. **有人物页混进来**。`[[W. Hugh Woodin|Woodin]]` 指向的是数学家传记，
   不是猜想。要按 wikiTitle 模式排除人名。

## 跨源关联：为什么需要，以及怎么做的

### 问题

诊断发现：Stacks（1,100 定理）/ nLab（89 概念）/ mathlib（333 形式化定理）
三组之间**零关联**。星云上是三块互不相连的星区，
读者看不出"同一个数学概念在不同源里各有表述"。

### 但词匹配极危险

`scheme` 出现在 213 条 Stacks 陈述里 —— 这不意味着它们都该连到 nLab 的 scheme 页面。
第一版实现就踩了坑：用 `parts[0].includes('category')` 匹配 mathlib 的 namespace，
结果 `CategoryTheory.*` 下**所有** 133 条定理都连到 nLab 的 `category` 概念，
单点度数爆炸，图谱变成噪声。

### 三条规则与各自的证据强度

| 规则 | 判据 | 证据强度 | 限流 |
|---|---|---|---|
| A `标题对应` | nLab 概念名 出现在 Stacks 条目标题（剥掉 `lemma · ` 前缀后） | 中 | 每概念 12 条 |
| B `namespace` | mathlib 定理的 Lean namespace 段 == nLab 概念名 | **强**（Lean 的命名约定） | 每概念 15 条 |
| C `概念对应` | 外部节点 → 手工精选的 405 条锚点 | 中 | 每外部节点 2 条，每锚点入边 8 条 |

**通用词必须整段匹配**：`category` / `sheaf` / `scheme` / `cohomology` 这类词
要求匹配到完整的 namespace 段（`AlgebraicGeometry.Scheme` 的 `Scheme`），
不能是子串 —— 否则 `CategoryTheory` 会命中 `category`。

### 这些边是什么意思（别误读）

权重 0.16–0.22，**低于** Stacks 源码 `\ref` 的真实引用边（0.3–1.0）。
含义是"讲的是同一件事"，**不表示**逻辑依赖关系。

## zbMATH API 的能力边界（实测，重要）

| 字段 | 有无 | 说明 |
|---|---|---|
| name / code / url | ✅ | 稳定标识 |
| awards | ✅ | Fields/Wolf/Shaw… 含年份 |
| main_fields | ✅ | MSC 分布（field + count + percent）|
| external_ids | ✅ | MGP / Wikidata / MacTutor / GND / homepage |
| spellings | ✅ | 姓名变体 |
| coauthors | ❌ | **没有合作者网络** |
| publications | ❌ | 没有逐篇文献 |
| institution | ❌ | 没有当前机构 |

所以研究者条目的 `summary`/`detail` 是**机械派生**（MSC 分布 + 奖项），
不含编造的叙述。手写的 24 条有真正的 focus/detail/代表作品，两者互补。

## 复现

```
# 定理
node kb-src/fetch-stacks.mjs
node kb-src/parse-stacks.mjs
node kb-src/build-nodes.mjs --limit 2200 --balanced
node kb-src/verify-stacks.mjs && node kb-src/verify-nodes.mjs

# 人物
node kb-src/fetch-zbmath.mjs
node kb-src/build-researchers.mjs
node kb-src/link-researchers.mjs
node kb-src/verify-researchers.mjs

# 概念（nLab）
node kb-src/fetch-nlab.mjs --limit 700   # 索引 20,780 页，按相关性闸门筛
node kb-src/build-nlab-nodes.mjs
node kb-src/verify-nlab.mjs

# 形式化定理（mathlib4）
node kb-src/probe-mathlib-tree.mjs        # 先拿文件清单
node kb-src/fetch-mathlib.mjs --limit 110
node kb-src/build-mathlib-nodes.mjs
node kb-src/verify-mathlib.mjs

# 猜想（--limit 控制总量，内部按领域配额分配）
node kb-src/build-conjectures.mjs --limit 300

# 猜想补漏（Wikipedia）
node kb-src/fetch-wikipedia.mjs
node kb-src/build-wikipedia-nodes.mjs
node kb-src/verify-wikipedia.mjs

# 跨源关联（必须在所有节点就位后跑）
node kb-src/build-cross-links.mjs
node kb-src/verify-cross.mjs

# 端到端
node designs/manuscript/formulas-build.mjs   # 知识库变了必须重跑
node designs/verify.mjs atlas                # 浏览器端验收
```

## mathlib 采集规模的权衡（2026-11-02）

mathlib 全仓 9,303 个 .lean，但**不能全抓**——节点总数直接决定布局耗时：

| mathlib 文件 | 生成的 mathlib 节点 | 节点总数 | atlas 布局 |
|---:|---:|---:|---:|
| 110 | 333 | 4,152 | 3.6s |
| 1,410 | 2,639 | 6,458 | **12.9s** ❌ |
| 476（限 500 条） | 487 | 4,306 | 3.6s ✅ |

结论：**布局耗时对节点总数高度敏感**（力导向 + 标签避让），
所以 `build-mathlib-nodes.mjs` 加了 `ML_CAP`（默认 500），
按「代数几何相关性 → docstring 质量 → 名字长度」排序取前 N 条。

要扩容 mathlib，必须先解决布局的分治/预计算，否则首屏会不可接受。

## 已知限制

1. **语义缩放在大数据下非单调**：L=0.3–0.6 有凹陷，见 `designs/atlas/ZOOM-DIP.md`
   （几何容量现象，不是代码 bug，未修）。
2. **布局耗时随规模超线性**：3,503 节点 → 2,289ms。再往上需要分治或预计算布局。
   Stacks 还有约 9,100 条结果未采集 —— 瓶颈在布局，不在数据。
3. **跨源关联覆盖率低**：nLab 30%、mathlib 52%、Stacks 仅 4%。
   Stacks 的条目标题是人工生成的（`lemma · Conormal sheaf of an immersion`），
   与 nLab 的裸概念名匹配率天然低。要提高需要更聪明的语义匹配。
4. **researcher 的领域边是结构性的**：zbMATH 无合作者数据，
   边的含义是"活跃领域"，不是"证明了这个定理"。
