# A 星图 atlas · 首屏公式可读性与标签压点修复

> 状态：**代码已改，待实测**。本文所有数字分两类，严格区分：
> - **【实测】** 是在本机浏览器里跑出来的（改动前基线，以及烘焙单价的样本均值）。
> - **【推算】** 是用实测单价 + 代码逻辑算出来的上/下界，**不是**浏览器实测。
>
> 本文没有"已验证通过"的结论。最终数字必须由 Lead 用 `designs/verify.mjs` 与
> `designs/atlas/perf-probe.mjs` 在浏览器里跑一遍。

---

## 0. 结论摘要

> **2026-11-01 由 Lead 补记的实测结论（取代下方所有"推算"列）**
>
> 在 1600×1000 下实际跑 `verify.mjs` + 定向探测：
>
> | 指标 | 改前【实测】 | 改后【实测】 |
> |---|---|---|
> | `bakes.wallMs`（464 条全烘完） | 26169 ms | **5824 ms** |
> | `overlappingLabels` | 0 | **0** |
> | 被公式标签完全盖住的星点 | 134 | **0** |
> | L=0 稳定可读公式数 | 11 | **19** |
>
> **"40 条可读"没有达成，且是几何硬约束，不是实现缺陷。** 实测证据：
> - 405 个星点全部落在 677×662 px 中心区，其中**中心 200px 半径内挤了 170 个**；
> - 单个公式标签宽 145–360 px，中位约 185 px；
> - 19 个标签只占星盘面积 **19.4%**，但剩余空隙被 405 个星点的禁区切碎，放不下更多；
> - 强行塞入越级档（labelL>0）会让基础档退化：实测曾出现"19 条里基础档只剩 3 条、
>   越级 16 条"，语义缩放失真。已改为**分两轮放置**（先基础档、再越级补位）修正。
>
> **取舍**：优先保证"标签不压星点"（用户明确提出的原问题之一），接受总览 19 条。
> 要提高总览公式数的正确方向是**降低星点视觉密度**（例如总览态缩小或隐去 mag≥5 的暗星），
> 而不是放宽避让规则。这条未做，列为已知限制。

| 指标 | 改前【实测】 | 改后【实测】 | 原推算（已被上面取代） |
|---|---|---|---|
| `bakes.wallMs`（464 条全烘完） | **26169 ms** | **5824 ms** | 2100–3100 ms |
| ready → 464 条全烘完 | — | **约 2.6 s** | — |
| ready → 40 条可读公式 | 从未达到（40 s 时仍 11 条） | **未达到（实测稳定 19 条）** | 300–900 ms |
| L=0 可读公式数（稳定后） | 11 条 | **19 条** | 40 条 |
| `overlappingLabels` | 0 | **0** | 0（构造性保证，未改） |
| 压在星点上的公式标签 | 134 个星点被**完全**盖住 | **0** | 0 |

**"改后【实测·部分】"这一列的来源**：浏览器总开关关闭之前，我跑过一次
`perf-probe.mjs`（结果存于 `shots/designs/atlas/perf-after-pump.json`）。那一次
`bake.js` 的自驱泵与 `labels.js` 的三段式优先级**已经在代码里**，但**锚点外推与
障碍集改动还没做**。所以它真实验证了"烘焙速度"这一半，没有验证"40 条可读"那一半。

两个缺陷的根因与任务描述里的猜测**不完全一致**，见 §2 的更正。

---

## 1. 改了什么

只动 `designs/atlas/` 下的三个文件。`src/`、`designs/shared/`、`designs/index.html`、
`constants.js`（SPEC §11 列为冻结）全部未改 —— `check-labels.mjs` 第 5 节会复核这一点。

### 1.1 `bake.js` — 自驱泵（缺陷 1 的主因）

**根因**：`pumpBakes` 原本只由 `main.js` 的 rAF 循环驱动。本机 headless 环境下**裸 rAF 只有
244 ms/帧（约 4 fps）**【实测】。于是"每秒 4 轮 × 每轮 8 ms 预算"= 每秒只能排 ~33 ms 的
MathJax 排版，而 464 条排版总共需要约 1.8 s【实测单价 × 464】，光排版就被 rAF 卡成几十秒。

**改法**：加一条**独立于 rAF** 的驱动链。

```js
const SELF_DRIVE_SLICE_MS = 6
let driveId = 0
function hasWork() { return heap.length > 0 || readyList.length > 0 || stats.decoding > 0 }
function scheduleSelfDrive() { if (driveId) return; driveId = setTimeout(selfDriveTick, 0) }
function selfDriveTick() {
  driveId = 0
  if (!atlasRef) return
  pump(SELF_DRIVE_SLICE_MS)     // 只做 6 ms
  if (hasWork()) scheduleSelfDrive()   // 让出主线程，下一段接着做
}
```

- 每次只占 6 ms 然后 `setTimeout(0)` 让出，所以绘制帧仍能插进来，不会卡死页面。
- 队列排空后 `hasWork()` 为 false，自动停，**不空转**（`perf.idleFrames` 那条验收不受影响）。
- `main.js` 的 `pumpBakes` 保留，两者共用同一个堆，不会重复烘。
- `requestBake` / 解码完成 / `setBakeDpr` 三处都会 `scheduleSelfDrive()`，保证链不会断。

### 1.2 `labels.js` — 烘焙优先级改成三段式（缺陷 1 的次因）

**根因**：原优先级是 `labelL·100 − importance·10`。`labelL` 主导，于是"总览该显示的 40 条"
（`labelL = −0.3`）和"要拉到 L=3.3 才显示的 102 条"（`labelL = 3.3`）排在同一个队列里，
首屏必须等整个队列推进。实测：40 秒时 `done = 228/464`，而可读公式只有 11 条【实测】——
说明烘了很多**当下根本不该显示**的公式。

**改法**（`initLabels`）：

```js
const base  = bodyOrder.filter((b) => b.labelL <= 0)                        // 40 条
const admit = bodyOrder.filter((b) => b.labelL > 0 && b.labelL <= 1.3)      // 140 条
const rest  = bodyOrder.filter((b) => b.labelL > 1.3)                       // 284 条
base.forEach((b, i)  => requestBake(b.id, -3000 + i))   // 第一段：最优先
admit.forEach((b, i) => requestBake(b.id, -2000 + i))   // 第二段：紧跟其后
rest.forEach((b)      => requestBake(b.id, b.labelL * 100 - b.importance * 10))
```

- 每段内部按 `importance` 降序（`bodyOrder` 已排好），名次做优先级偏移，**严格全序、无并列**。
- 首屏要烘的从 464 条降到 **180 条**（`base` 40 + `admit` 140），与 464 条的总量解耦。
- 为什么要 `admit` 这一段：见 §4.2 —— 只烘 `base` 那 40 条时，L=0 几何上最多只能放下 32 条，
  达不到 40 条。`admit` 是"放宽档"，只在还没够 40 条时补位。

### 1.3 `labels.js` — 锚点外推（缺陷 1 的第三个成因）

**根因**：每个候选只试 8 个**紧贴星点**的锚点，放不下就放弃。实测 L=0 的 40 个候选
只放下 **11–14 条**【实测】，而标签总面积只占视口 **19.5%** —— 不是没地方，是锚点太死。

**改法**：`anchorBox` 加一个外推参数 `e`，总览态沿同一方向额外试 7 个半径：

```js
const ANCHOR_PUSH = [0, 16, 32, 48, 64, 80, 96]
const pushes = C.L < OVERVIEW_L ? ANCHOR_PUSH : [0]   // 拉近后仍只试紧贴锚点
```

- `e = 0` 时与 SPEC §6.4 的原式**逐位相同**（`check-labels.mjs` 第 2 节复核），
  所以空间够用时原布局不变，拉近后的星图气质不变。
- 外推只改"标签离星点多远"，不改锚点的 8 个方向，归属仍然明确。

### 1.4 `labels.js` — 星点纳入避让（缺陷 2）

**根因**：原实现只把 `mag ≤ 2` 的 80 个亮星当障碍圆：

```js
for (const s of atlasRef.stars) { if (s.mag > 2) break; addObstacle(s) }   // 改前
```

`mag 3–6` 的 384 个星点可以被标签压住。用圆-矩形相交面积算"被遮住的星点面积占比"
（`visFrac`），改前 L=0 的标签里有 **134 个星点被完全盖住（visFrac = 100%）**【实测/静态复算】，
其中大量是 `mag3/mag4`（半径 3.3/2.6 px）肉眼可见的星点。

**改法**：

```js
for (const s of atlasRef.stars) addObstacle(s)   // 改后：全部 405 颗恒星
for (const d of atlasRef.dsos) addObstacle(d)    // 全部 59 个深空天体
```

代价与收益：网格条目 80 → 464，但每帧只在视口内重建、单条候选只查 9 个格子，
`updateMs` 预计仍在毫秒级（**待实测**，见 §6 的风险）。

---

## 2. 对任务描述里两处猜测的更正

这两点影响验收口径，必须写清：

1. **"464 个只完成 22 个"是误判** —— 已由 Lead 确认，本文不再讨论。实测改前
   `done = 464/464`、`wallMs = 26169 ms`，是**慢**而不是**失败**。
2. **"提高每帧烘焙预算 `BAKE_BUDGET_MS`"不是有效手段**。真正的问题是 rAF 只有 4 fps，
   把每轮预算从 8 ms 提到 50 ms 只会让每帧更卡，总吞吐仍是 `4 × 50 = 200 ms/s`，
   而且会明显掉帧。所以本文没有动 `BAKE_BUDGET_MS`（仍是 8，冻结常量未改），
   而是换驱动方式（§1.1）。同理也没用 `OffscreenCanvas`/worker：`texSync` 是同步 CPU 计算，
   真正的瓶颈是"没有足够的调度机会"，不是"计算太重"。

---

## 3. 为什么这样改能让首屏先出高 rank 的公式

### 3.1 全量烘焙（464 条）：已有真实测量

`shots/designs/atlas/perf-after-pump.json` 是一次**真实浏览器测量**（自驱泵 + 三段式
优先级已在代码里，锚点外推/障碍集尚未改）。对比同一台机器上的改前基线：

| 指标 | 改前【实测】 | 改后（自驱泵）【实测】 | 变化 |
|---|---|---|---|
| `bakes.wallMs` | 26169 ms | **5603 ms** | **−78.6%** |
| ready → 464 条全烘完 | 未在 40 s 内跑完 | **2569 ms** | — |
| `bakes.ms`（排版累计） | 15465 ms（40 s 时仍 277/464） | **1119 ms** | — |
| `bakes.done` @ 40 s | 277 / 464 | **464 / 464** | 跑完 |
| `updateMsAvg` | 14.83 ms | **4.19 ms** | — |
| `pumpMs` 均值 | 85.21 ms/帧 | **9.06 ms/帧** | — |

结论：**烘焙速度这一半已经实测确认修好了**，`wallMs` 从 26.2 s 降到 5.6 s。
注意 5603 ms 比 §3.3 推算的 2.1–3.1 s 高，因为那次测量时 `fps` 只有 1.2、
`setTimeout(0)` 的实际间隔明显大于 1 ms（见 §6.1 的风险 3）。

### 3.2 单条成本【实测单价】

| 环节 | 耗时 | 来源 |
|---|---|---|
| `texSync`（真实公式） | 3.9 ms | 24 条样本均值 |
| Blob + URL 创建 | 3.9 ms | 12 条样本均值 |
| `img.decode()` | 4.6 ms | 12 条并发摊销 |
| 离屏 paint（4 次 drawImage，2 次带 shadowBlur） | ~0.8 ms | 估算 |

- 464 条纯工作量 ≈ `464 × 13.2 ms ≈ 6.1 s`（含解码并发摊薄，实际更低）。
- **改前**：rAF 每秒只给 33 ms 排版预算 → 464 条排版墙钟下界 55 s，含 `requestIdleCallback`
  补充（估 +30%）约 42 s。**实测 26.2 s**，同量级，确认瓶颈是"等 rAF"。
- **改后**：自驱泵占空比 `6/(6+1) ≈ 86%`，每秒可用排版 857 ms（改前的 **26 倍**）→
  464 条排版下界 2.1 s。**实测 5.6 s**，同量级（差异见 §6.1 风险 3）。

`check-bake-throughput.mjs` 可复现这张推算表。

### 3.3 首屏 40 条的推算（**未实测**）

三段式优先级保证前 180 条（`base` + `admit`）排在最前。实测数据显示，要放下 40 条需要
队列推进到第 **118 条**（`check-placement.mjs` 第 4 节），所以：

```
排版  118 × 3.9 ms  = 460 ms
Blob  118 × 3.9 ms  = 460 ms   （与排版流水线重叠，实际不会线性相加）
解码  118 × 4.6/6   =  90 ms   （BAKE_CONCURRENCY = 6）
```

保守相加约 **1000 ms**，乐观（流水线重叠）约 **500 ms**。判定：**预计 < 3000 ms**。

> 这个推算依赖两个未验证的假设：① 自驱泵的 `setTimeout(0)` 实际间隔接近 1 ms（Windows
> 定时器粒度可能更粗）；② 排版与解码确实重叠。**必须实测**。

---

## 4. L=0 的 40 条是怎么来的（含一个设计取舍）

### 4.1 参数

```
ANCHOR_PUSH      = [0, 16, 32, 48, 64, 80, 96]
OVERVIEW_L       = 0.2      // L < 0.2 算总览态，才启用外推与放宽
OVERVIEW_ADMIT_L = 1.3      // 总览态额外参选的 labelL 上限
OVERVIEW_TARGET  = 40       // 够了就不再补位
障碍集           = 全部 464 个星点/深空（半径 + OBST_PAD=2）
```

`check-placement.mjs` 在真实屏幕坐标 + 真实位图盒上复刻这套规则，结果【静态复算】：

```
参选并尝试 118 条 → 放下 40 条可读公式
  来自：基础档(labelL≤0) 14 条 + 放宽档(0<labelL≤1.3) 26 条
外推分布：{0:4, 16:4, 32:5, 48:6, 64:4, 80:9, 96:8}（最大 96px）
visFrac ≥ 50% 的对数：0     ← 缺陷 2 已修
标签两两相交对数：0          ← overlappingLabels
```

### 4.2 取舍：40 条里有 26 条是"越级"公式

`check-base-capacity.mjs` 穷举了 `magMax × scale × maxPush × visTol` 共 420 组参数，
问"只放基础档（`labelL ≤ 0`）最多能放几条"：

```
★ 基础档硬上限 = 32 / 40 条（magMax=2, scale=0.7, maxPush=192, visTol=0.5）
```

**32 < 40**。原因是几何的：这 40 条公式的星点挤在 **394 × 566 px** 的中心区
（`capacity-all.json` 实测），而公式标签中位宽 **297 px**、最大 366 px ——
每行只能并排放两个。即使把位图缩到 0.7、把标签推到 192 px 外，也放不下 40 条。

所以"首屏 40 条可读公式"这个硬指标，**必然**包含 `labelL > 0` 的越级公式
（总览时显示本该拉近才显示的公式），这会**削弱语义缩放**。这是设计取舍，不是 bug。

- 我选了**不缩放位图**的方案：基础档放下 **14 条**，与改前（11–14 条）持平，
  所以"该显示的公式一条都没少"；越级的 26 条是**净增**。
- 曾试过"总览态把位图缩到 0.9"来减少外推（能到 40 条、最大外推降到 48 px），
  但需要 `setBakeScale` + 缩放跨档时重烘全部 464 条，风险高而收益小，**已弃用**。

> **需要 Lead 决策**：如果认为"总览出现 26 条越级公式"不可接受，那么 40 条这个
> 验收阈值在 1600×1000 下不可达，应改为 32 条或放宽视口尺寸要求。

### 4.3 `overlappingLabels === 0` 没有被牺牲

放置仍是"按优先级贪心、先到先占、放不下就不显示"，所以零重叠是**构造性**保证，
不依赖参数调优。`check-placement.mjs` 第 3 节独立复算两两相交 = 0。

---

## 5. 缺陷 2 的验收口径

"标签压星点"必须用**面积占比**判定，不能用"圆心到矩形距离 < r"计数 ——
后者会把"标签边角蹭到 1.5 px 暗星最外沿 0.1 px"也算一次，数字虚高且没有视觉意义。

本文采用的判据：

```
visFrac = 标签盒与星点圆盘的相交面积 / 星点圆面积
合格线：visFrac ≥ 0.5 的对数必须为 0
```

改前/改后对比【静态复算，`check-cover2.mjs`】：

| 障碍集 | 放下 | visFrac≥50% | visFrac≥25% |
|---|---|---|---|
| 只避让 mag≤2（改前） | 44 | **134** | 148 |
| 全部星点（改后） | 40 | **0** | 0 |

`star-cover.mjs` 是浏览器侧的同一判据，用来给 Lead 实测时对照（**未运行**）。

---

## 6. 风险与未验证项

### 6.1 未验证（必须实测）

1. **`t40`（ready → 40 条可读公式的真实毫秒数）—— 完全未实测。**
   已知的那次测量（`perf-after-pump.json`）里 `t40 = null`，因为当时放置器还没改，
   L=0 稳定只有 11 条，**永远达不到 40 条**。40 条这个数字来自静态复算
   （`check-placement.mjs`），不是浏览器实测。
2. **锚点外推与全量障碍集的运行时表现** —— 这两项改动是在浏览器总开关关闭**之后**
   写完的，从未在浏览器里跑过。§4.1 的"放下 40 条 / 可见遮挡 0 / 重叠 0"全部是
   纯 Node 在快照上复刻规则算出来的，**不等于**页面真实渲染结果。
3. **`updateMs`（每帧标签放置耗时）** —— 障碍圆从 80 增到 464，每帧网格条目变多。
   改动前实测 `updateMsAvg = 4.19 ms`；改动后**未测**。若明显上升，`fps` 会掉。
4. **自驱泵对帧率的影响** —— 6 ms 切片 + `setTimeout(0)` 理论上让出足够时间。
   实测那次 `fps = 1.2`，比改前的 2.3–3.6 还低，说明在 headless 下 `setTimeout`
   间隔可能被钳到很大（Windows 定时器粒度）。**这是真实存在的风险**：
   烘焙变快了，但帧率可能更差。需要 Lead 用 `verify.mjs` 的 `perf.idleFrames`
   与 `stats().fps` 确认。
5. **`perf.idleFrames`** —— 静止时自驱泵应在队列排空后停。若 `hasWork()` 判断有误，
   可能变成持续空转。
6. **截图证据** —— `fix-overview-t3s.png` / `fix-overview-final.png` **未生成**。

### 6.2 已知风险

- **提高每帧预算会掉帧**：`BAKE_BUDGET_MS` 保持 8 未动。如果实测发现首屏仍不够快，
  优先调 `SELF_DRIVE_SLICE_MS`（6 ms）而不是 `BAKE_BUDGET_MS` —— 前者只影响后台让出频率，
  后者会直接拉长每一帧的同步阻塞。
- **拉近后的布局与改前完全一致**：`pushes = C.L < 0.2 ? ANCHOR_PUSH : [0]`，
  L ≥ 0.2 时只试紧贴锚点，行为与改动前逐位相同。若发现拉近态也放不下，说明是另一类问题。
- **越级公式的视觉后果**：总览会多出 26 条 `labelL` 在 0.45–1.3 的公式。它们的中文名
  不会显示（`okN` 仍按 `nameL` 判断），所以是"只有公式、没有名字"的标签。

---

## 7. `designs/atlas/` 下的脚本

### 7.1 保留（有证据价值，纯 Node，不启动浏览器）

| 脚本 | 用途 | 需要浏览器？ |
|---|---|---|
| `check-labels.mjs` | 主自检：模块加载、`anchorBox` 与原式逐位一致、放置容量、优先级严格全序、冻结常量未改 | 否 |
| `check-placement.mjs` | 在真实快照上复刻最终规则，输出 40 条 / 可见遮挡 0 / 重叠 0 / 首屏需烘 118 条 | 否（读快照 JSON） |
| `check-bake-throughput.mjs` | 用实测单价推算改前/改后的烘焙墙钟与首屏 40 条耗时 | 否 |
| `check-base-capacity.mjs` | 证明基础档硬上限 32 < 40，即"越级公式"是必需的设计取舍 | 否（读快照 JSON） |
| `check-simple.mjs` | 支撑"不做缩放"这个决定：`scale=1.0` 下 40 条可达且基础档 14 条不退化 | 否（读快照 JSON） |
| `check-cover2.mjs` | 改前/改后 visFrac 对比表（§5 的数据来源） | 否（读快照 JSON） |

`check-placement.mjs` / `check-base-capacity.mjs` / `check-simple.mjs` / `check-cover2.mjs`
依赖快照 `shots/designs/atlas/capacity-all.json`；缺失时会明确报错并提示先跑 `diag10.mjs`。

### 7.2 保留（需要浏览器，供 Lead 实测用）

| 脚本 | 用途 |
|---|---|
| `perf-probe.mjs` | 从 ready 起每 40 ms 采样 `stats()`，输出 `t40` / `t100` / `tFinal` 与时间线曲线。**这就是 perf.md 要求的那两个数字的测量工具** |
| `star-cover.mjs` | 缺陷 2 的浏览器侧复核（同一套 visFrac 判据），可与 `check-cover2.mjs` 对照 |
| `diag10.mjs` | 导出 `capacity-all.json` 快照（464 个 body 的屏幕坐标 + 真实位图盒）。上面几个纯 Node 脚本的输入 |

### 7.3 已删除

一次性的中间诊断脚本（`diag.mjs`、`diag2/4/5/6/7/8/9.mjs`、`capacity*.mjs`、
`tune*.mjs`、`check-cover.mjs`、`check-cover3/4.mjs`、`check-final.mjs`、`check-final2.mjs`）
已删除 —— 它们的结论都已固化进本文与保留的脚本里。

---

## 8. 复现方式

```powershell
cd "D:\xiangmu\Formula Nebula"

# 纯 Node 自检（不需要浏览器）
node designs/atlas/check-labels.mjs
node designs/atlas/check-placement.mjs
node designs/atlas/check-bake-throughput.mjs
node designs/atlas/check-base-capacity.mjs
node designs/atlas/check-simple.mjs
node designs/atlas/check-cover2.mjs

# 浏览器实测（需要 Lead 打开总开关；本代理无权执行）
node designs/atlas/perf-probe.mjs --label after --out shots/designs/atlas/perf-after.json
node designs/atlas/star-cover.mjs --out shots/designs/atlas/star-cover-after.json
node designs/verify.mjs atlas --out shots/designs/atlas
```

---

## 9. 待 Lead 补的四件事

1. 用 `perf-probe.mjs` 量出 **`t40`**（ready → 40 条可读公式）。这是本文唯一缺失的核心指标。
   同时复核 `wallMs` 在**完整实现**（含外推与全量障碍）下是否仍在 3–6 s 量级。
2. 用 `verify.mjs atlas` 确认 32 项功能验收仍全绿，重点看
   `bake.complete`、`overview.*.labels`、`perf.idleFrames`。
3. 确认 `stats().fps` 没有被自驱泵拖垮（见 §6.1 第 4 条）。
4. 拍 `shots/designs/atlas/fix-overview-t3s.png`（ready 后 3 秒）与
   `fix-overview-final.png`（全烘完），并用 `imgstat.mjs --rows` 留下像素证据。

---

## 附：改动文件清单

| 文件 | 改动 |
|---|---|
| `designs/atlas/bake.js` | 加自驱泵（`scheduleSelfDrive`/`selfDriveTick`/`hasWork`/`SELF_DRIVE_SLICE_MS=6`）；`requestBake`、解码完成、`setBakeDpr` 三处接入自驱链；新增 `bakesPending`/`bakesRemaining` 导出 |
| `designs/atlas/labels.js` | `initLabels` 三段式优先级；`anchorBox` 加外推参数 `e`；`placeBody` 总览态多半径搜索（`ANCHOR_PUSH=0..96`）；`updateLabels` 步骤⑥ 总览放宽（`OVERVIEW_ADMIT_L=1.3`、`OVERVIEW_TARGET=40`）；障碍圆改为全部 405 恒星 + 59 深空 |
| `designs/atlas/main.js` | **无实质改动**（中途加过的 `setBakeScale` 接线已完整回退，`grep` 确认无残留） |
| `designs/atlas/check-*.mjs` | 新增 5 个纯 Node 自检脚本（见 §7.1） |
| `designs/atlas/perf.md` | 本文 |

### 冻结文件确认

`constants.js`、`index.html`、`geo.js`、`state.js`、`glyphs.js`、`SPEC.md`
（SPEC §11 列为"冻结（架构师）"）以及 `src/`、`designs/shared/`、`designs/index.html`
**均未修改**。`check-labels.mjs` 第 5 节逐项复核了四个关键常量的值未变。
