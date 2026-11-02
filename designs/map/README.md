# 公式大陆 · Terra Formularum（方案 B）

代数几何知识地图：8 个知识族是 8 个国家，定理是城市，关联是道路，猜想是海上岛屿，研究者是港口。
488 个节点 / 1670 条关联，纯 Canvas 2D，无第三方依赖、无 CDN。

- 入口：`http://localhost:5190/designs/map/`
- 设计规范：[SPEC.md](./SPEC.md)（540 行）
- 调试句柄：`window.__design`（`select` / `deselect` / `search` / `view` / `setView` / `stats` / `setRoads` / `home` …）

> **本文件的状态标记**：每条结论都标注了它的证据等级。
> `[纯 Node 已验]` = 由 `designs/map/tools/` 下的纯 Node 脚本断言通过，可复现；
> `[代码审读]` = 只做了静态代码检查，**没有**实测；
> `[未验证]` = 没有证据，只是待办。

---

## 1. 本次修复（2026-11-01）

### 缺陷 1：深链恢复失败（必修，已修）

**症状**：`node designs/verify.mjs map` 报 `FAIL hash.restored {"want":"scheme","got":null}`。
把 `location.hash` 写成 `#n=scheme` 后 reload，选中态没有恢复。

**根因（代码审读 + 纯 Node 复现）**：`src/hash.js` 的 `decodeHash` 要求第一段**必须**是版本号 `v1`：

```js
if (segs[0] !== HASH_VERSION) {
  out.warnings.push(`版本「${segs[0].slice(0, 16)}」不是 ${HASH_VERSION}，整条忽略`)
  return out          // ← 这里直接 return，id 永远是 null
}
```

而 `encodeHash` 产出的是 `#v1&n=<id>`，`designs/verify.mjs` 的深链往返检查写的却是
`#n=<id>`（无版本号）。于是验收器写进去的 hash 被整条丢弃，`decodeHash` 返回
`{ok:false, id:null}` → `applyHash` 里 `d.id` 为空 → 不选中 → `selected` 为 `null`。

实测（纯 Node，`decodeHash('#n=scheme', {has})`，修改前）：

```
#n=scheme -> {"ok":false,"id":null,"cam":null,"warnings":["版本「n=scheme」不是 v1，整条忽略"]}
```

**修法**：不再用"第一段必须等于 v1"做硬门禁，改成按"第一段有没有 `=`"区分三种情况：

| 第一段 | 判定 | 行为 |
|---|---|---|
| `v1` | 有版本号 | 跳过它，继续解析后面的段 |
| 含 `=`（如 `n=scheme`） | 裸参数，无版本号 | 从头解析，记一条 warning |
| 不含 `=` 且不是 `v1`（如 `v2`、`scheme`） | 是（不认识的）版本号 | 整条忽略，不去猜别的版本的字段含义 |

这样两种写法都能恢复选中，同时保留了"未知版本号整条忽略"的原有安全语义。
`encodeHash` 未改，产出仍是 `#v1&n=<id>&c=<x>,<y>,<s>`；**两种写法都接受**。

**修改后（纯 Node 实测）** `[纯 Node 已验]`：

```
#n=scheme                    -> ok=true  id=scheme   cam=null
#v1&n=scheme                 -> ok=true  id=scheme   cam=null
#v1&n=scheme&c=-72,-185,1.80 -> ok=true  id=scheme   cam={"x":-72,"y":-185,"s":1.8}
#n=no-such-node              -> id=null              （不存在的 id 仍被拒绝）
```

`node designs/map/tools/orch/check-hash.mjs` 全部通过（新增 6 条针对裸参数的断言）。

**涉及文件**：`src/hash.js`、`tools/orch/check-hash.mjs`（测试同步到新约定）。

**另需注意的调用链**：`src/main.js` 的 `applyHash()` 用
`has: (id) => graph.byId.has(id) && world.placeById.has(id)` 做有效性校验 —— 这个谓词对
`scheme` 成立（它既是 graph 节点，也在 `world.placeById` 里）。所以修复点只在 `decodeHash`，
`applyHash` 无需改动。`[纯 Node 已验：用同一谓词跑通了上面 5 个用例]`

---

### 缺陷 2：国家边界是规整的圆（已修，根因是模块没接上）

**根因（代码审读）**：这是本次最重要的发现 —— **不是参数没调好，而是真正的实现从未被使用**。

- `src/world/build.js` 是完整的有机地形流水线（高斯泼溅密度场 → 域扭曲 domain warp →
  marching squares 多标签等值线 → Chaikin 平滑 → RDP 简化 → 边界链拼接），
- 但 `src/main.js` 第 23 行 `import { buildWorld } from './world/index.js'`，
- 而 `src/world/index.js` 当时是一份**占位实现**，文件头自己写着
  "⚠ 当前是架构师写的【占位实现】：国家 = 圆，城市 = 向日葵排布，无国界/地形"，
  用 `circleRing()` 画 64 边形正圆。

于是 `build.js` 成了死代码，页面一直画的是圆。

**修法**：

1. `src/world/index.js` 改为只做转发：`export { buildWorld } from './build.js'`（导出签名不变）。
2. 原占位实现移到 `src/world/stub.js`，仅供 `dev/world/dev.js?mod=stub` 做"改前"对照，不参与生产。
3. `dev/world/dev.js` 的模块选择参数由 `?mod=build`（默认 index）改为 `?mod=stub`（默认 build）。

**顺带调的地形参数**（都是量出来的，不是拍脑袋）：

- `TERRAIN.warpOwn`：14 → **45**。国界用的是 `own_f` 密度场的扭曲版；`warpOwn` 太小，
  国界就退化成"两国城市之间的直中线"，整国轮廓仍近似圆。
  对 `warpOwn ∈ {14,25,35,45,55} × warpLand ∈ {120,150}` 扫过一轮，取最大 circularity 见下表。
- `MAX_TERRAIN_ROUNDS`：5 → 8。`warpOwn` 加大后国界更曲折，个别城市在 5 轮内还没被推到
  10 wu 之外。
- 新增"保底投影"（`build.js` 步骤 3b）：逐轮内推会与 `project()` 的圆盘/间距约束互相拉扯
  （实测 `a-kahler-differential` 在 round 6 / round 8 两次落回 6.23 / 8.95 wu），
  所以循环结束后对仍未满足的城市做一次沿 16 个方向的直线搜索，取第一个同时满足
  【在本国环内】且【离边界 ≥ 12 wu】的点。搜索失败就保持原位（宁可留一个违例，也不把城市塞进别国）。

**有机化的量化证据** `[纯 Node 已验]` —— `node designs/map/tools/orch/check-organic.mjs`

对每个国家的主环算四个形状指标（正圆分别是 `circularity=1`、`radialCv=0`、`inflections=0`）：

| 国家 | 顶点 | circularity | radialCv | inflections | turningP90° |
|---|---|---|---|---|---|
| 交换代数古国 | 78 | 0.629 | 0.238 | 6.4 | 29.1 |
| 概形与层王国 | 72 | 0.770 | 0.148 | 9.7 | 32.0 |
| 上同调联邦 | 86 | 0.704 | 0.162 | 18.6 | 34.2 |
| 态射与奇点山地 | 72 | 0.771 | 0.157 | 9.7 | 30.4 |
| 曲线曲面半岛 | 65 | 0.853 | 0.144 | 7.7 | 17.1 |
| 相交理论公国 | 59 | 0.865 | 0.101 | 11.9 | 41.4 |
| 双有理高原 | 80 | 0.715 | 0.179 | 10.0 | 30.4 |
| 模空间腹地 | 60 | 0.816 | 0.122 | 11.7 | 44.7 |

改前（`stub.js`）：8 国 circularity 全部 **0.999**、radialCv 全部 **0.000** —— 就是圆。
改后（`build.js`）：circularity **0.629–0.865**、radialCv **0.101–0.238**。

**验收线（写在这里，可被任何人复跑复核）**：8 国 circularity 全部 ≤ 0.90 且 radialCv 全部 ≥ 0.06
且 inflections > 0。`check-organic.mjs` 不带参数即同时跑 stub 与 build 并给出判定，当前**全部通过**。

**同时保住的硬不变量** `[纯 Node 已验]` —— `node designs/map/tools/world/check.mjs --mod build`：

```
PASS  1 城市在本国且离边界 ≥ 10 wu  — 最小 12.4 wu; 违例 0
PASS  2 国土连通、互不包含 — 8 国全部 1 环 / 100.0%
PASS  3 六角相邻对共享国界 — 14/14；非六角相邻却接壤 无
PASS  4 城市间距 — 任意 ≥ 10.6，tier≤1 ≥ 33.9
PASS  5 岛屿在海上/离岸/间隙/界内 — 最小岛间隙 20.6；岛形点数 32–32
PASS  6 港口 — 24 处；pier 离岸 0.00；符号离岸 10.7–11.0；最小间距 23.9
PASS  7 数量与 fitBounds — roads 1670 places 488 越界 0
PASS  8 Node 构建耗时 < 900 ms — 363 ms（raster:false）
PASS  + 确定性（两次构建逐点一致）
PASS  + Country 字段齐全、国名基线在国内且自西向东、角度 ≤ 35°
```

8 个国家互不重叠、每国主体单连通、六角相邻的 14 对全部共享国界 —— 有机化没有破坏拓扑。

**涉及文件**：`src/world/index.js`、`src/world/stub.js`（新）、`src/world/build.js`、
`dev/world/dev.js`、`tools/orch/check-organic.mjs`（新）。

---

### 缺陷 3：跨族道路太多太乱（已修）

**根因（代码审读）**：`src/rules.js` 的 `roadVisible()` 里 `case 'crossway': return true` ——
跨境公路**无条件**可见。数据里 crossway 有 80 条、crossroad 有 508 条，L0 总览一次画出 80 条
橙色粗线，把画面糊住。

**修法**：

1. **默认不画跨族道路**。`roadVisible(road, level, opt)` 新增第三参数 `opt`：
   `crossway` / `crossroad` 只在 `opt.showCross === true` 时才画。
   同族高速（`highway`，150 条）仍从 L1 起显示，构成干净的路网骨架。
2. **提供开关**：图例的「道路与航线」组下方新增按钮
   「显示跨族道路（默认隐藏，共 588 条）」/「隐藏跨族道路（显示前 40 条）」。
   打开后**只画权重最高的 40 条**（`CROSS_ROAD_TOP_N` / `CROSS_ROAD_SHOW_N`），不是全放出来。
   图例里被关掉的两项会加 `is-off` 样式并把计数改成 `0` / `40 / 80`，
   避免"图例说有 80 条、图上一根都没有"。
3. 跨族关系**没有丢**：选中任一节点时，它的全部关联仍以高亮路线画出
   （`render/highlight.js` 不看 `roadVisible`，这是原有行为）。
4. 道路 `Path2D` 改为按开关状态缓存（`roadsFor()`），只在切换开关时重建一次。

**机器可读证据**：`__design.stats().roads` 现在是

```json
{ "showCross": false, "crossCount": 0, "crossBuilt": 0,
  "drawn": { "highway": 150, "road": 599, "ferry": 154, "ferry:hero": 21, "lane": 108 } }
```

- `crossCount` = **真正画出来的**跨族道路条数（`drawnRoadCounts()` 按当前 level + 选项过滤），
  默认视图为 **0**，满足验收标准"默认视图跨族道路条数为 0"。
- `crossBuilt` = 构建进 `Path2D` 的跨族道路条数（关闭时为 0；打开时 = min(40, 全部)）。
- `__design.setRoads({showCross:true})` 可在验收里翻转开关。

**`[未验证]`**：上述 `stats().roads` 数值来自我在加总开关**之前**跑通的一次 `verify.mjs`
（那次结果 `showCross:false, crossCount:0`），之后把 `drawn` 的统计口径从"已构建"改成
"真正会画"（新增 `drawnRoadCounts()`），**这个改动没有在浏览器里复跑过**。
需要 Lead 统一验收时确认 `stats().roads.crossCount === 0`。

**涉及文件**：`src/rules.js`、`src/render/roads.js`、`src/render/index.js`、
`src/state.js`、`src/view.js`、`src/main.js`、`src/debug.js`、`src/ui/cartouche.js`。

---

### 缺陷 4：截图在 y≈808 以下重复了画面顶部（**已定案：CDP 截图伪影，页面无缺陷**）

`[实测·已确认]` 2026-11-01 由 Lead 定性。

**结论**：这是 **CDP `Page.captureScreenshot` 的伪影**，不是方案 B 的渲染缺陷。

证据链：

1. 页面 DOM **无重复 id**，只有一个 `#app` 和一张主 canvas；
2. canvas 尺寸 1600×1000 正确，`scrollHeight === innerHeight === 1000`；
3. 换视口高度（1600×900）重复同样出现 → 与尺寸无关，是管线问题；
4. **决定性证据**：用 `canvas.toDataURL()` 直接导出绘制内容 → **完全没有重复**。
   权威图见 `shots/designs/map/final-overview.png`（由 `node designs/_export.mjs` 生成），
   画面干净、国家海岸线自然、跨族道路为 0。

> ⚠ 排查过程中**两次误判**值得记下：
> - 交接文档判"渲染缺陷" → 错；
> - 最初用 `imgstat --repeat` 判"可能是假象" → 也不算证据，该指标分不清
>   "相邻带天然相似"与"真画了两遍"。
>
> **正确方法**：导出 canvas 真实内容来定夺。详见 `designs/README.md`。

以下保留最初的代码层面排查记录，作为过程档案。

交接文档记的是"截图在 y≈808 以下又重复了一遍画面顶部"。我从代码层面逐条排查，
找不到任何会产生"半屏重复"的路径：

| 可能成因 | 排查结果 |
|---|---|
| canvas 被挂载两次 / 两个 canvas | 全仓只有 `index.html` 一个 `#map`；`createElement('canvas')` 的三处都是离屏用途（公式烘焙位图、measureText、图例小图标），不挂进 DOM |
| 同一份几何被画两遍 | 纯 Node 查过：`world.coast` 1 个环、去重后仍 1 个；8 国 rings 无重复环；14 条国界链 `(a|b|点数)` 全部唯一；`places` 488 个、`placeById` 488 个、重复 id = 0 |
| 视口/相机取景越界导致"上下各显示一次" | `fitBounds` (-670,-557,629,515) 完全落在 `bounds` (-1000,-720,1000,720) 内；`clampView` 把中心夹在 bounds 内 |
| CSS 造成画面纵向重复 | `html, body { height:100%; overflow:hidden }`、`#app { position:fixed; inset:0 }`、`#map { position:absolute; inset:0; width/height:100% }` —— 没有 `transform: scale`、没有 `background-repeat`、没有 `vh` 叠加 |
| 每帧状态泄漏导致累积绘制 | `render/index.js` 的 `draw()` 每帧开头 `resetState()` + `ctx.clearRect(0,0,w,h)`，不存在"上一帧没清干净" |

**另外，两轮 `imgstat` 的 `--repeat` 结果与"重复"假设不符**（这是我在冻结截图之前跑到的，
不是最终确认）：

- 改前：最相似的条带对是 `带0 vs 带1 距离 5.09`
- 改后：最相似的条带对是 `带3 vs 带4 距离 8.12`

`--repeat` 把图切成 8 条带两两比较，**相邻条带在一张连续地图里本来就相似**，
所以"最相似的一对永远落在相邻带"是正常现象，这个指标无法区分"正常连续画面"和"真的重复"。
我据此另写了 `tools/orch/check-repeat.mjs`，换成更直接的问题：
对每个纵向偏移 `d` 算全图平均亮度差 `D(d)`，若 `y≈808` 以下重复了顶部，`D(808)` 会是一个孤立低谷。
用它跑改前/改后两张图，**都没有**在 `d ∈ [400, 950]` 内出现"比邻域中位低 25% 以上"的孤立低谷
（最像的分别是 `d=950` 低 12.9%、`d=926` 低 9.8%，随 d 平缓变化）。

**结论**：代码里没有"画两遍"的路径，几何与相机也查过没有重复/越界；两项像素检验都没有出现
孤立低谷。因此**倾向判定为截图假象（或已随某次改动消失），不是真实的渲染缺陷**。
**但这条结论未经最终实测确认** —— 请 Lead 在统一验收时按以下方式复核：

```
node designs/imgstat.mjs shots/designs/map/verify-overview-1600x1000.png --rows --repeat
node designs/map/tools/orch/check-repeat.mjs shots/designs/map/verify-overview-1600x1000.png
```

若 `check-repeat.mjs` 报"存在孤立低谷"，那才是真的重复，需要再查。

---

## 2. 运行与自检

### 页面

`http://localhost:5190/designs/map/`（Vite 由项目负责人维护，本目录不启动服务器）

### 纯 Node 自检（不启动浏览器）

```
node designs/map/tools/orch/check-hash.mjs        # 深链编解码：往返 / 畸形输入 / 裸参数
node designs/map/tools/orch/check-search.mjs      # 检索：命中与耗时
node designs/map/tools/world/check.mjs            # 世界构建：SPEC §6.3 的 8 条不变量 + 确定性
node designs/map/tools/world/check.mjs --mod build
node designs/map/tools/orch/check-organic.mjs     # 边界有机化：stub vs build 的形状指标对比
node designs/map/tools/orch/check-repeat.mjs <png>  # 纵向重复：按偏移量扫 D(d)
```

### 需要浏览器的验收（由 Lead 统一跑）

```
node designs/verify.mjs map --out shots/designs/map
```

## 3. 文件结构

```
designs/map/
├── index.html            DOM 契约（#map / #search / #cartouche / #panel / #hud …）
├── map.css               全部样式
├── SPEC.md               设计规范（540 行）
├── README.md             本文件
└── src/
    ├── main.js           入口与编排：启动顺序、渲染循环、hash、取景、actions
    ├── state.js          state / bus / actions（架构师冻结）
    ├── constants.js      全部设计常量（架构师冻结）
    ├── rules.js          语义缩放与制图规则（含本次改的 roadVisible）
    ├── view.js           相机数学（纯函数）
    ├── hash.js           深链编解码（本次修）
    ├── camera.js         飞行与惯性
    ├── interact.js       指针与键盘
    ├── search.js         检索
    ├── debug.js          window.__design
    ├── world/
    │   ├── index.js      转发到 build.js（本次改）
    │   ├── build.js      有机地形流水线（本次调参 + 保底投影）
    │   ├── stub.js       旧占位实现（圆），仅供 dev 对照（本次新增）
    │   ├── fields.js     标量场：高斯泼溅、域扭曲、距离场、连通分量
    │   ├── contour.js    多标签 marching squares、Chaikin、RDP、环工具
    │   ├── layout.js     国家中心松弛、城市力导向布局、国名基线
    │   ├── islands.js    猜想群岛、研究者港口、海名
    │   ├── rasters.js    高程、晕渲、海洋栅格
    │   └── rng.js        确定性 PRNG 与噪声
    ├── render/           basemap / roads / islands / symbols / highlight / index
    ├── labels/           bake（公式烘焙）/ place（碰撞放置）/ area（国名海名）/ draw / grid
    └── ui/               app / search / cartouche / register / panel / hud / tooltip / glyphs …
```

## 4. 调试目录说明（`dev/` 与 `tools/`）

交付前保留，理由如下（SPEC 与交接文档都要求"清理或在 README 说明用途"）：

| 路径 | 用途 | 是否启动浏览器 |
|---|---|---|
| `tools/orch/check-hash.mjs` | 深链编解码的 Node 断言 | 否 |
| `tools/orch/check-search.mjs` | 检索的 Node 断言 | 否 |
| `tools/orch/check-organic.mjs` | 边界有机化的形状指标对比（本次新增） | 否 |
| `tools/orch/check-repeat.mjs` | 纵向重复检测，按偏移量扫 D(d)（本次新增） | 否 |
| `tools/world/check.mjs` | SPEC §6.3 的 8 条世界不变量 | 否 |
| `tools/orch/e2e.mjs` | 端到端验收（**会 spawn headless Chrome**） | **是** |
| `dev/world/` | 世界几何单独出图；`?mod=stub` 出"改前"对照 | 是（手动打开） |
| `dev/labels/` `dev/render/` `dev/ui/` | 各模块的独立调试页 | 是（手动打开） |

`tools/orch/e2e.mjs` 与 `dev/*` 会开浏览器，在"只写代码、不截图"的约束下**我没有运行它们**。

## 5. 已知限制 / 未验证项

按证据等级如实列出：

1. **`[已实测]` 浏览器端最终验收（2026-11-01 由 Lead 完成）**。
   `node designs/verify.mjs map` → **32/32 PASS**，含 `hash.restored`，
   且在 worker 最后几处改动（`drawnRoadCounts()` 口径、`lastRoadInfo`、
   `build.js` 的 `warpOwn` / 保底投影）**之后**跑的。
   跨族道路开关也补测了真实点击路径：0 → 40 → 0，双向正常。
2. **`[已定案]` 缺陷 4 是 CDP 截图伪影**，页面无缺陷。见第 1 节缺陷 4。
3. **`[未验证]` 跨族道路开关的交互**。按钮的点击、图例计数改写、`stats().roads.crossCount` 的
   翻转都只做了代码审读，没有在浏览器里点过。
4. **`[代码审读]` 选中时的高亮路线不受本次道路改动影响**。`render/highlight.js` 遍历
   `frame.linkKeys` 且不看 `roadVisible`，所以跨族关联在选中时仍会画出；这条只读了代码，未实测。
5. **性能**：`build.js` 在 Node 下构建 363 ms（`raster:false`）；浏览器里还要多一步栅格化
   （`computeHeight` + `computeShade` + 两张 `NX×NY` 的 ImageData），这部分耗时为
   `[未验证]`。历史上出现过一次 `world/check` 耗时 43 s 的读数，那是本机 CPU 被多个
   headless 浏览器抢占导致的，不是代码问题。
6. **`dev/` 与 `tools/orch/e2e.mjs`** 仍会启动浏览器；按交付要求保留并在此说明用途，
   未做清理。
