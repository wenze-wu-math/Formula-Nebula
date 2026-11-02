# 公式诗稿 · Formula Manuscript（方案 D）

代数几何知识库排成一册 10 页的手稿：8 章对应 8 个知识族，诗句是公式，铅笔线是关联，
猜想写在页边作批注，卷末题跋录研究者署名。

模块契约见 [SPEC.md](SPEC.md)（526 行）。本文件记录**收尾阶段三项待办的结论与依据**。

运行：Vite dev server 起来后打开 `http://localhost:5190/designs/manuscript/`。
加 `?nocache` 可跳过公式预排版缓存（见 §3）。

---

## 1. 题跋署名可读性（已修）

### 改了什么

| 文件 | 改动 |
|---|---|
| [layout-util.js:50](layout-util.js) | `SIZE.sign` 40 → **56**、`signInst` 18 → **24**、`signFocus` 17 → **22** |
| [layout-pages.js:136](layout-pages.js) | 署名三条文字的基线由**字号推导**，不再写死 `y + 38` |

原先的 `name = mkRun(..., y + 38, ...)` 是硬编码偏移，只对 `sign = 40` 合适。改成 56 后姓名上伸
0.86em = 48.2，会与 38 的基线打架，所以一并改成：

```js
const nameBase = y + 0.86 * SIZE.sign + 3          // 姓名的上伸对齐朱印顶（+3px 视觉补偿）
const inst  = ... nameBase + 0.24 * SIZE.sign + 8 + 0.86 * SIZE.signInst
const focus = ... inst.y   + 0.24 * SIZE.signInst + 8 + 0.86 * SIZE.signFocus
```

现在改 `SIZE.sign*` 任意值，版式自动跟着走。

### 依据（纯 Node 版面预算，未开浏览器）

`node shots/designs/manuscript/_d_colophon_budget.mjs` 对每个候选字号**真的跑一遍 `buildLayout`**：

```
sign/inst/focus | blockH  minGap | 页适配(0.2612): name inst focus | 阅读(0.62): name inst focus | 截断 n/i/f | check
 40/ 18/ 17 |   101.5    64.8 | 10.45   4.7  4.44 |  24.8 11.16 10.54 | 0/0/19 | 0/0/0
 52/ 22/ 20 |   122.4    43.9 | 13.58  5.75  5.22 | 32.24 13.64  12.4 | 0/0/19 | 0/0/0
 56/ 24/ 22 |   131.2    35.1 | 14.63  6.27  5.75 | 34.72 14.88 13.64 | 0/0/19 | 0/0/0   ← 采用
 60/ 26/ 24 |     140    26.3 | 15.67  6.79  6.27 |  37.2 16.12 14.88 | 0/0/19 | 0/0/0
 64/ 28/ 26 |   148.8    17.4 | 16.72  7.31  6.79 | 39.68 17.36 16.12 | 0/1/22 | 0/0/0   ← 出现布局重叠
```

两个关键 zoom（都由 `camera.js` 算出，不是估的）：

- **题跋页适配** `z = 0.2612`（`fitRect(page)`）：姓名 **10.45px → 14.63px**，越过 12px 正文级下限。
- **选中一条署名** `z = 0.62`（`readingZoom`，研究者无公式 → `ZOOM.READING`）：**34.72 / 14.88 / 13.64px**，三者全部 ≥ 12px。

上限由版式反推：署名 24 条排 2 栏 × 12 行，行距 `pitch ≈ 166` 世界 px；56 这一档署名块高 131.2，
同栏最小行间留白仍有 **35.1px**，疏朗气质不变。再大一档（64）留白掉到 17.4px 且出现 1 处布局重叠，故取 56。

### 回归（纯 Node）

`node shots/designs/manuscript/_m1_check.mjs`（改动后）：

```
buildLayout 34 ms, deterministic=true
items 488, byId 488, order 488 (unique 488), ...
missing 0, overlaps 0, outOfPage 0
PASS
```

**未验证**：真实字体（Georgia / Segoe Print / 楷体）的宽度比本脚本的近似度量（汉字 1em、拉丁 0.55em）更窄或更宽，
因此"不截断"的结论在近似度量下成立；真实字体下的最终观感需截图确认。表中 `focus` 列显示 19 条研究方向本来就带 `…`
（数据里 focus 最长 86 字符，`layout-pages.js` 按 60 字符主动截断），这是**既有行为，未改动**。

---

## 2. 拉近后公式清晰度（代码层判定，已修上限；**未经实测**）

### 判定方法（不靠观感）

清晰度由 `formulas.js` 的 mip 位图机制决定，全是可算的量：

- `ppu`（pxPerUnit）= `formula.scale × cam.z × dpr`，是 `render.js` 传给 `getBitmap` 的值。
- `levelFor(ppu)` 取 ≥ `ppu / LEVEL_SLACK`（1.02）的最小一级；超过最高一级就钳在最高一级。
- 位图被画到屏幕的**放大倍数** ≈ `ppu / MIP[li]`。> 1 就是位图被拉伸，屏幕上是糊的。

`node shots/designs/manuscript/_d_formula_res.mjs` 对真实 layout 的 464 条公式逐条算（只统计 `em ≥ LEGIBLE_PX` 的满墨公式）。
加 `--baseline` 可复算「改前」对照（把 `MIP_LEVELS` 截回 6 级，只影响该脚本读数）：

### 改前（`MIP_LEVELS` 最高只到 2×）—— `--baseline` 输出

```
z      dpr  可读公式  被拉伸(>1.05)  最大放大倍数  最坏那条
0.62   1         398             0          1.01   —
0.90   1         464             0          1.02   —
1.60   1         464             8          1.10   ideal-variety(epigraph) ppu=2.2  mip=2 783px→860px
2.20   1         464             8          1.51   b-stable-bundle(epigraph) ppu=3.03 mip=2 1362px→2059px
2.80   1         464            11          1.92   b-stable-bundle(epigraph) ppu=3.85 mip=2 1362px→2620px
3.20   1         464            13          2.20   ideal-variety(epigraph) ppu=4.4  mip=2 783px→1721px
3.20   2         464           198          4.40   ideal-variety(epigraph) ppu=8.8  mip=2 783px→3442px
```

首次出现拉伸：**dpr=1 → z ≈ 1.53；dpr=2 → z ≈ 0.77**。
原因是题记 `scale = 1.375`（`SIZE.epiEm 88 / TEX_EM 64`），而 `ZOOM.MAX = 3.2`，
`ppu` 理论上限 = 1.375 × 3.2 × dpr = **4.4 × dpr**，2× 一级根本不够。

### 修了什么

[formulas.js:336](formulas.js)：`MIP_LEVELS` 由 6 级加到 7 级，末尾补 **4×**：

```js
export const MIP_LEVELS = [1 / 16, 1 / 8, 1 / 4, 1 / 2, 1, 2, 4]
```

所有消费点（`levelFor`、`levelSize`、`getBitmap` 的邻级回退、`bake` 的数组分配、`evict`）都按
`MIP_LEVELS.length` 泛化，无硬编码 6，无需其他改动。

### 改后

```
首次出现拉伸（>1.05×）：dpr=1 → z ≈ 3.06；dpr=2 → z ≈ 1.53
最高一级（4×）上限：ppu ≤ 4.08  ⇔  dpr=1: z ≤ 2.97；dpr=2: z ≤ 1.48
```

逐档对比（`_d_formula_res.mjs` 改后输出）：

```
z      dpr  被拉伸  最大放大  最坏那条
1.60   1        0     1.02   —                                  ← 改前 8 条 / 1.10×
2.20   1        0     1.02   —                                  ← 改前 8 条 / 1.51×
2.80   1        0     1.01   —                                  ← 改前 11 条 / 1.92×
3.20   1        8     1.10   ideal-variety(epigraph) 1565px→1721px  ← 改前 13 条 / 2.20×
1.60   2        8     1.10   ideal-variety(epigraph) 1565px→1721px  ← 改前 13 条 / 2.20×
2.20   2        8     1.51   b-stable-bundle(epigraph) 2723px→4117px ← 改前 75 条 / 3.02×
2.80   2       11     1.92   b-stable-bundle(epigraph) 2723px→5240px ← 改前 143 条 / 3.85×
3.20   2       13     2.20   ideal-variety(epigraph) 1565px→3442px   ← 改前 198 条 / 4.40×
```

即：dpr=1 时 `z ≤ 2.8` 全部锐利，只有 `ZOOM.MAX` 最后一档还有 8 条被拉伸 1.10×；
dpr=2 时拉伸起点从 z ≈ 0.77 推到 z ≈ 1.53，最坏倍数从 4.40× 降到 2.20×。
**dpr=2 的深缩放（z > 2.2）仍未完全解决** —— 要彻底覆盖需要 8× 级，代价是单张画布再翻 4 倍，本次未做。

### 关键结论：**用户正常路径本来就够，深缩放不够**

按 `readingZoom`（选中一条公式时相机**实际**到的 zoom，`ZOOM.READ_EM_PX / (scale × TEX_EM)`，钳在 [0.35, 1.6]）：

```
dpr=1: 464 条中 0 条被拉伸；最坏 0.96×
dpr=2: 464 条中 0 条被拉伸；最坏 0.96×
  epigraph n=  8  readingZoom≈0.35  最大放大 0.96×
  verse    n=348  readingZoom≈0.94  最大放大 0.81×
  core     n= 49  readingZoom≈0.83  最大放大 0.81×
  note     n= 59  readingZoom≈1.60  最大放大 0.70×
```

即：**点选 / 定位一条公式时，位图从不被放大，屏幕上是矢量直接栅格化的锐利结果**。
问题只出现在用户手动滚轮缩放到 `z > 1.53`（dpr=1）之后，且只影响题记那类大字号公式。

### 代价（估算，非实测）

`node shots/designs/manuscript/_d_mip_cost2.mjs`，只算**视口内**真会请求的公式（`render.js` 只对
`hit(box, viewport)` 的条目调 `getBitmap`），dpr=2 最坏情况：

```
z=1.6: 可见 960×590 世界 px；最坏一屏需新级 2 条 /  6.9 MB
z=2.0: 可见 768×472 世界 px；最坏一屏需新级 6 条 / 25.3 MB
z=3.2: 可见 480×295 世界 px；最坏一屏需新级 7 条 / 20.7 MB
```

- 内存：4× 不属于常驻级（`RESIDENT = 2` 只保 1/16、1/8），受 `MAX_BYTES = 160 MB` 的 LRU 约束。
- 画布：单张最大 4× 画布 531 万像素，Chrome 上限 2.68 亿，安全。
- 单张耗时**未实测**：`formulas.js` 的耗时模型 `ms ≈ 0.15 + px × msPerPx` 中，`msPerPx` 在两个实测值之间跨三个数量级
  （bench 报过 178.76 ms/Mpx 与 0.39 ms/Mpx），单张 4× 因此落在 **0.8 ms ～ 550 ms** 区间。
  `pumpBakes` 的"至少烘一张"会放行第一张，所以首次深缩放可能出现**一次长帧**。

> **未经实测**：以上全部是代码层推算（`_d_formula_res.mjs` / `_d_mip_cost2.mjs`，纯 Node，不启动浏览器）。
> 需要用截图 + `__design.stats()` 在真实浏览器里确认：① 阅读视图的公式确实锐利；② 深缩放后长帧的帧时间；
> ③ 4× 烘焙时 `bitmapStats().bytes` 的实际峰值。

---

## 3. `formulas-cache.json` 去留（建议：**保留**）

### 它怎么工作

| 环节 | 代码 | 行为 |
|---|---|---|
| 加载 | `formulas.js` `loadShipped()` | `fetch('./formulas-cache.json')`，2.5s 超时（`SHIP_TIMEOUT_MS`）；失败/超时/坏 JSON → 当作没有缓存 |
| 头校验 | 同上 | 要求 `data.v === CACHE_VER`（`'mj1'`）、`data.em === TEX_EM`（64）、`dict`/`entries` 是数组，否则整份丢弃 |
| 逐条命中 | `computeDims()` | `cacheKey(TEX_EM, inkFor(n), latex) === cacheKey(...缓存里的...)`，key = `版本\|字号\|墨色\|latex原文` |
| 未命中 | 同上 | 该条进 `jobs[]` → worker 池现排。**缓存只加速，永不显示过期公式** |
| 延迟解码 | `svgFor()` | 字形路径做了字典编码（5.2MB → 2.26MB），解码推迟到第一次真正需要 SVG 时 |

### 数据改动后如何失效

- **改某条 `latex`** → 该条 key 对不上 → 回落现排。其余 463 条照常命中。**不会显示过期公式。**
- **加/删节点** → 新节点不在缓存里 → 现排；缓存里的死条目只是不被取用（实测当前死条目 **0** 条）。
- **改 `tex.js` 排版配置 / 字号** → `TEX_EM` 或 `CACHE_VER` 变 → 整份作废（`CACHE_VER` 需手动 +1）。
- **重新生成**：`node designs/manuscript/formulas-build.mjs`。

### 内容是否已经过期（实测，纯 Node）

`node shots/designs/manuscript/_d_cache_check.mjs`：

```
覆盖率：命中 464 / 464（miss 0），死条目 0，v='mj1' ✓，em=64 ✓，2.26 MB
```

`_d_cache_check.mjs` 报过 25 条抽样里 24 条"逐字节不同"。**追查后确认这不是过期**：
`node shots/designs/manuscript/_d_cache_fidelity.mjs` 把 MathJax 的元素序号规范化（`MJX-123-` → `MJX-#-`）后重比：

```
逐字节相同        : 1/25
规范化 MJX 序号后相同: 25/25
规范化后仍不同     : 0
尺寸最大偏差       : 0.000480 MathJax px
```

差异**全部**是 `tex.js` 的模块级单例 `mjDoc` 的全局计数器序号（离线按知识库顺序排 464 条 vs 现排从新进程开始），
只用于 SVG 内部 `<use xlink:href="#MJX-n-...">` 的自引用，不影响字形、尺寸、墨色。尺寸偏差 0.00048 MathJax px。

**结论：缓存内容与当前知识库一致，未过期。**

### 去留建议：保留

代码层面的理由：

1. **正确性无风险**：命中条件包含 `latex` 原文 + 墨色 + 版本 + 字号，任何一项变了就自动回落现排；
   `computeDims` 对缓存条目也做形状校验（`svg` 必须以 `<svg` 开头、`w/h > 0`），不盲信文件内容。
2. **失效路径完整**：改数据 → 单条失效；改排版配置 → `CACHE_VER` 整份失效；文件损坏 → 当没有缓存。
3. **成本低**：2.26 MB 静态文件，`fetch` 超时 2.5s 后放弃，不会阻塞启动。
4. **有应急开关**：`?nocache` 跳过缓存全部现排（本次新增，见 [main.js:491](main.js)），缓存出问题时可立即绕过。

**是否显著改善首屏 —— 需要实测才能定。** 缓存命中时 `dims` 阶段只剩「读 JSON + 建 Map」，
不命中时要 worker 池各自解析一遍 MathJax（`formulas.js` 文件头注释记录"worker 冷启动重负载下实测整套 3.8s"）。
但本机 `bootMs` 的抖动极大（同一配置多次载入可差 2–3 倍，受系统负载、字体缓存冷热、MathJax 首次解析影响），
**必须在同一台机器、同一时段、交替跑有/无缓存各若干次才能给出可信数字**。本文件不提供这类对比数字。

如果实测后发现收益可以忽略，删除步骤是：删 `formulas-cache.json` + 删 `formulas-build.mjs`
（`loadShipped()` 对缺失文件已优雅降级，不会报错）。

---

## 4. `formulas-bench.html` 的用途

**调试页，保留，不属于交付界面。**

`http://localhost:5190/designs/manuscript/formulas-bench.html`，只依赖 `shared/kb.js`、`state.js`、`formulas.js`，
不受其他模块半成品影响。暴露 `window.__bench.run()`，测量：

- `computeDimsMs` 与 `pipelineStats()`（`fromCache` / `fromWorkers` / `fromMain` 各多少条）
- **缓存与现排是否一致**：抽样 24 条交给 worker 现排，与缓存解码结果逐字节比对
  （注意：这个检查会把 MathJax 元素序号差异也算成"不一致"，需按 §3 的方法规范化后再判读）
- `prewarmAllMs`：464 条全部烘到 1/16 + 1/8 两级的耗时
- `panVerse` / `panCold2x`：模拟平移时 `pumpBakes` 的 p50/p95/max 耗时与未就绪数
- 画一屏样张：同一公式在 1×、2×、1/16、1/8 各级下的实际锐度

它把 Vite 的 full-reload 指向一个不存在的 html，避免其他模块改动时打断测量。
**它不是一个页面功能，`designs/verify.mjs` 也不检查它**；删除它不影响方案 D 的任何验收项。

---

## 5. 本次改动清单

| 文件 | 改动 | 性质 |
|---|---|---|
| [layout-util.js](layout-util.js) | `SIZE.sign` 40→56、`signInst` 18→24、`signFocus` 17→22 | 修复（题跋可读性） |
| [layout-pages.js](layout-pages.js) | 署名三条基线由字号推导，去掉硬编码 `y + 38` | 修复（配合字号放大） |
| [formulas.js](formulas.js) | `MIP_LEVELS` 加一级 4×；注释说明上限与代价 | 修复（深缩放清晰度） |
| [main.js](main.js) | 新增 `?nocache` 开关；新增 `bootPhases.moduleEvalNav` 诊断字段 | 诊断/应急 |

诊断脚本（`shots/designs/manuscript/`，纯 Node，不启动浏览器）：

| 脚本 | 作用 |
|---|---|
| `_m1_check.mjs` | 既有：layout 自检（missing / overlaps / outOfPage / 确定性） |
| `_d_colophon_budget.mjs` | 题跋字号候选表的版面预算 |
| `_d_formula_res.mjs` | 464 条公式在各 zoom / dpr 下的位图放大倍数 |
| `_d_mip_cost2.mjs` | 加 4× 级的内存与视口内条数代价 |
| `_d_cache_check.mjs` | 缓存覆盖率、死条目、过期模拟 |
| `_d_cache_fidelity.mjs` | 缓存与现排的差异归因（MJX 序号 vs 实质差异） |
| `_d_measure.mjs` | 浏览器实测脚本（boot 阶段 / 各档位 stats / 缓存 A/B），**需浏览器，本次未运行** |
