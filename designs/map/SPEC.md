# 公式大陆 · Terra Formularum — 方案 B 设计规格（SPEC）

方案 id = `map`，页面 `http://localhost:5190/designs/map/`，截图目录 `shots/designs/map/`。
本文是**契约**：各建造者只按本文与冻结文件写代码，不需要互相沟通。冲突时以冻结的 `.js` 文件为准，其次是本文。

## 0. 文件与归属

| 文件 | 归属 | 说明 |
|---|---|---|
| `index.html` | 架构师（冻结） | DOM 容器（id 是契约，§9.1） |
| `SPEC.md` | 架构师（冻结） | 本文 |
| `src/constants.js` | 架构师（冻结） | 全部配色、线宽、字号、阈值 |
| `src/rules.js` | 架构师（冻结） | tier、语义缩放、标签模式、优先级、道路可见性（纯函数） |
| `src/view.js` | 架构师（冻结） | 相机数学、`makeFrame` |
| `src/state.js` | 架构师（冻结） | `state` / `bus` / `actions` / `invalidate` |
| `src/world/**` | **M1 world** | 布局 + 地形 + 群岛 + 港口 + 道路几何 |
| `src/render/**` | **M2 render** | 画布全部图层（标签除外） |
| `src/labels/**` | **M3 labels** | 公式烘焙、碰撞放置、标签绘制 |
| `src/ui/**`、`map.css` | **M4 ui** | 搜索、详情面板、图例/图框、名录、HUD、tooltip |
| `src/main.js`、`src/interact.js`、`src/camera.js`、`src/hash.js`、`src/search.js`、`src/debug.js` | **M5 orchestration** | 启动、交互、飞行、深链、检索、`window.__design` |
| `dev/<模块>/**`、`tools/<模块>/**` | 对应模块 | 各自的调试页 / node 测试脚本（可选） |

冻结文件**谁都不改**。若发现冻结文件有 bug 或缺字段，在自己模块里本地补（例如私有常量），并在交付说明里写明。

**当前状态**：五个模块目录里都已有架构师写的**占位实现**（`world/index.js`、`render/index.js`、`labels/index.js`、`ui/index.js`、`main.js`），整条链路能跑出一张"圆形国家 + 圆点"的草图（`shots/designs/map/scaffold.png`）。每个建造者**整体替换自己的占位实现**，导出签名保持不变。

**并行开发的原子性规则**：别的建造者随时在刷新同一个页面。你的入口文件（如 `src/world/index.js`）在任何时刻都必须能被 import 且导出契约里的函数。做法：新代码写在新文件里（`layout.js` 等），自测通过后再一次性改入口文件的 import；中途不要留半截语法错误的入口文件。

## 1. 设计目标（逐条回应原星云的问题）

1. **总览读得出**：总览（L0）只放 8 个国名 + 8 个首都公式 + 大城市名字，其余是有色点的"人口密度"纹理。公式**永远以屏幕固定字号**（12.5–19px）排版，绝不随缩放变成细线。
2. **公式互不叠压**：2D 平面 + 屏幕空间标签碰撞避让（8 方位候选 + 优先级 + 降级），`overlappingLabels` 恒为 0。
3. **位置表达结构**：每个知识族是一个**连续的国家**，族内关联多的定理彼此靠近（力导向）；国家之间谁挨着谁由跨族关联数决定（8! 穷举，74% 的跨族关联落在相邻国之间）。颜色按国家成片铺，一眼看出各族在哪。结构默认可见：跨境公路（跨族 hero 关联）在总览就画出，族内高速从 L1 起出现。
4. **交互廉价**：2D 平移缩放，没有旋转。语义缩放让"放大"本身就是信息的展开。
5. **没有硬边**：海洋是距离场着色 + 等深线，海岸线由标量场等值线生成，全部是平滑曲线。

视觉上与方案 A（深色星图）明显不同：**浅色政区图**，粉彩国家、浅蓝海、白色光晕标签、老海图式等深线与斜体海名。

## 2. 坐标与相机

- 世界坐标：单位 wu，x 向东、y 向南（与屏幕同向），原点 = 大陆中心。`WORLD_BOUNDS = {x0:-1000,y0:-720,x1:1000,y1:720}`。
- 相机 `view = {x, y, z}`：canvas **中心**对准世界点 (x, y)；`z` = css px / wu。屏幕坐标 = css px，原点 canvas 左上角。
  `sx = (x - view.x)·z + w/2`，`sy = (y - view.y)·z + h/2`（`view.js` 的 `worldToScreen` / `frame.toScreen`）。
- `zFit = fitZoom(world.fitBounds, w, h, 24)`；语义尺度 `s = z / zFit`（与屏幕尺寸无关）；`level = levelOf(s)`：
  `s < 1.6 → L0`，`< 3.2 → L1`，`< 6.4 → L2`，否则 `L3`。缩放范围 `s ∈ [0.6, 16]`（`clampView`）。
- `state.inset`：被 UI 遮住的边距。面板打开时 `inset.right = PANEL_W + 16 = 416`。所有"取景"（home、搜索、选中）用 `fitBoundsView` / `centerOn` 把目标放在**可见区**中心。`view.x/y` 本身始终是 canvas 中心。
- dpr：`state.size.dpr = min(2, devicePixelRatio)`。render 设 transform 时乘 dpr；其它模块一律用 css px。
- 世界层 transform：`ctx.setTransform(dpr·z, 0, 0, dpr·z, dpr·(w/2 - x·z), dpr·(h/2 - y·z))`；此时线宽要"屏幕固定"就写 `lineWidth = px / z`，虚线数组同理每项 `/ z`。
- 屏幕层 transform：`ctx.setTransform(dpr, 0, 0, dpr, 0, 0)`。

## 3. 视觉语言（数值全部在 `src/constants.js`）

### 3.1 配色
- **海洋**：距离场着色，近岸 `#d4e9f2` → 60wu `#c0dfec` → 160wu `#a9cfe2` → 360wu `#93c0d8`（`OCEAN_DEPTH_STOPS`）。经纬网每 200wu 一条，`rgba(60,110,150,.10)`，只画在海上（被陆地盖住即可）。
- **等深线 / 波纹**：离岸 7/15/26/42/66 wu 五圈（`RIPPLES`），颜色 `#7fa9c4`，alpha .55→.10，最外圈虚线。包住大陆**和**所有岛屿。
- **国家**：`COUNTRY_COLORS[f].land` 填色（粉彩），`.ink` 用于该国城市符号、城市标签、国名、国界内侧色带。相邻国色相已刻意拉开。
- **海岸线** `#5b7f96` 1.3px；**国界** `#8a7f73` 1.1px 实线 + 国界两侧各自 7px 宽、alpha .16 的本国 ink 色带（只在本国一侧，靠 clip 实现）。
- **地形晕渲**：克制，`RELIEF.strength = .22`，overlay 混合，仅陆地。

### 3.2 字体（`FONTS`）
- 国名：`FONTS.country`（微软雅黑等无衬线）粗体，字距 `0.55em`，沿国家走向排成弧线；下方拉丁副标题 `FONTS.latin` 大写、字距 0.3em、小号。颜色 = 国家 ink，alpha 见 `COUNTRY_LABEL.alpha`，光晕用该国 land 色（不是白色）。
- 海名：`FONTS.sea` **斜体**，颜色 `OCEAN.seaLabel`，字距 0.4em，中文一行 + 拉丁一行（拉丁小一号）。
- 城市名：`FONTS.city`，字重随 tier（700/600/500/400），颜色 = 国家 ink。
- 港口名：`FONTS.port` 斜体，`PORT.ink`。
- 标题图框：`FONTS.title`（宋/思源宋体）。
- 所有点标签带 `HALO`（`#fbf8f1`，3px）光晕。

### 3.3 符号系统（屏幕 px，× `symbolScale(level)`）

| 对象 | 符号 | 说明 |
|---|---|---|
| 首都 tier0（每国 1 个，共 8） | r=7 白底圆 + 1.6px ink 外圈 + 内部 ink 五角星（外径 0.62r） | 最高级 |
| 大城市 tier1（46） | r=5 白底圆 + 2px ink 外圈 + r·0.38 的 ink 圆心点 | |
| 城镇 tier2（119） | r=3.2 ink 实心圆 + 1px 白描边 | |
| 村落 tier3（232） | r=2.2 ink 实心圆，alpha 见 `symbolAlpha`（L0 为 .5） | 总览时是"人口密度"纹理 |
| 猜想岛屿（59） | 世界尺寸的有机小岛（半径 `ISLAND_R0 + ISLAND_R1·importance` wu），填色/海岸线型按状态 `ISLAND_STATUS` | 见下表 |
| 研究者港口（24） | r=4.5 `PORT.color` 实心圆 + 白色锚形字形（⚓ 用路径画，不用 emoji 字体）+ 一段从港口到海岸点的 1.2px 栈桥线 | 位于海岸外侧 |

岛屿状态符号（制图隐喻：越不确定的岛离大陆越远，`ISLAND_OFFSHORE`）：

| status | 中文图例 | 填色 | 海岸线 | 附加记号 |
|---|---|---|---|---|
| open 33 | 未勘探 | `#f3ead2` 羊皮纸 | 虚线 `[5,4]` | 无 |
| partial 9 | 部分勘探 | `#ece2bf` + 45° 细斜线（ink alpha .25，间距 4px） | 点划线 `[12,3,2,3]` | 无 |
| proved 15 | 已勘明 | `#cfe6bf` 绿地 | 实线 | 岛心小旗（旗杆 9px + 三角旗 `#3d6a33`） |
| disproved 2 | 幻岛（E.D.） | 无填色（透出海） | 点 `[1.5,3]` | 岛心 × + 标签后缀 " (E.D.)" |
| heuristic 0 | 传闻之地 | `#e4e3f4` | 点 `[2,3]` | 无（数据里目前 0 个，图例照列） |

道路（`ROAD_STYLE`，casing 底 + core 芯两遍描边；屏幕固定线宽）：

| road.kind | 含义 | 数量 | 样式 |
|---|---|---|---|
| `road` | 族内普通关联 | 599 | 白芯灰边 1.6/0.9 |
| `highway` | 族内 hero 关联 | 150 | 黄芯金边 3.0/1.8 |
| `crossroad` | 跨族普通关联 | 508 | 浅橙芯 2.0/1.1 |
| `crossway` | 跨族 hero = **跨境公路** | 80 | 橙芯赭边 3.2/2.0，总览即可见（alpha .45） |
| `ferry` | 定理 ↔ 猜想 = **航线** | 175 | `#4f7f9e` 1.2px 虚线 [5,4] |
| `lane` | 猜想 ↔ 猜想 = 海道 | 108 | `#6f93ad` 1px 点线 |
| `expedition` | 研究者 ↔ 任意 = 探险路线 | 50 | `#24486a` 点划线，**只在选中时**出现 |

选中后的**高亮路线**：白色 6px casing + 3.2px 关系类型色芯（`ROUTE_TYPE_COLORS[link.type]`），600ms 沿路径"画出"（dashoffset 动画）一次。

装饰：右下指北针（DOM/SVG，M4）、海上经纬网（M2）、左下标题图框（M4）。

## 4. 语义缩放与标签规则（`src/rules.js`，冻结）

tier（`assignTiers`）：定理族内按 importance 排名 r：r=0 首都；r<12% 大城市；r<42% 城镇；其余村落。猜想 importance≥.88 → 1，≥.76 → 2，其余 3。研究者统一 2。

| | L0 总览 s<1.6 | L1 国家 1.6–3.2 | L2 城市 3.2–6.4 | L3 街区 ≥6.4 |
|---|---|---|---|---|
| 国名 | 大字，参与避让 | 参与避让，alpha .7 | **水印**（alpha .28，不参与避让、不计重叠） | 水印 .16 |
| 海名 | 参与避让 | 同 | 同 | 同 |
| 城市标签基础模式 | t0 公式；t1 名字 | t≤1 公式；t2 名字 | t≤2 公式；t3 名字 | 全部公式 |
| 岛屿标签 | t1 名字 | t1 公式；t2 名字 | t≤2 公式；t3 名字 | 全部公式 |
| 港口标签 | — | — | 名字 | 名字 |
| 道路 | crossway | + highway、hero ferry | + road、crossroad、全部 ferry | + lane |

`labelModes(place, level, flags)` 给出尝试序列：`['formula','name']`、`['name']` 或 `[]`。选中 / 一跳邻居 / 搜索命中（`flags.selected|neighbour|hit`）任何级别都从 `'formula'` 开始尝试。放不下就降级，再放不下就不标（符号仍画）。
`labelPriority(place, flags)`：选中 +1000 > 悬停 +500 > 邻居 +200 > 命中 +100 > `(3-tier)·10 + importance·5`；上一帧已放置 +0.5（滞回，防闪烁）。
`symbolIsObstacle(place, level)`：L0 只有 tier≤1 城市、岛屿算避让障碍；L1 tier≤2 + 港口；L2+ 全部。
`roadVisible(road, level)`、`roadAlpha(road, level)`、`symbolRadius(place, level, z)`、`symbolAlpha(place, level)`、`truncName(name)`（>12 字截断加 "…"）、`TIER_NAMES`。

## 5. 共享状态（`src/state.js`，冻结）

### 5.1 `state` 字段
```
state.graph      getGraph() 结果（只读）
state.world      buildWorld() 结果（§6，只读）
state.view       {x, y, z}            —— 只有 M5 写
state.size       {w, h, dpr}          —— 只有 M5 写
state.zFit       number               —— 只有 M5 写
state.inset      {top,right,bottom,left} —— 只经 actions.setInset 改
state.selection  {id|null, neighbours:Set<id>, linkKeys:Set<link.key>, t0:ms} —— M5 写
state.hover      {id|null, linkKey|null, sx, sy} —— M5 写（linkKey 经 actions.hoverLink）
state.search     {query, ids:string[]（按得分排序）, set:Set<id>} —— M5 写
state.ready, state.dirty, state.perf {fps, frameMs, placeMs, drawMs}
```
`link.key` 是 graph 里每条 link 已有的唯一字符串（1670 条全唯一），全项目用它标识路线；`world.roadByKey` 以它为键。

### 5.2 帧上下文 `frame = makeFrame(state, uiRects, now)`（`view.js`）
```
{ view, size, zFit, s, level, now,
  visibleWorld: {x0,y0,x1,y1},     // 当前视口覆盖的世界矩形（裁剪用）
  selectedId, neighbours, linkKeys, selectT0,
  hoverId, hoverLinkKey,
  hits: Set<id>,                   // 已提交搜索的命中（空集 = 无搜索）
  uiRects: [{x,y,w,h}],            // UI 浮层屏幕矩形（labels 避让）
  toScreen(x, y) → [sx, sy] }
```
每帧 M5 调用一次，先 `labeler.place(frame)` 得到 placement，再 `renderer.draw(frame, placement)`。

### 5.3 `bus` 事件与 `actions`
事件：`select {id, prev}`、`search {query, ids}`、`hover {id, sx, sy}`、`view {x,y,z,s,level}`（每帧至多一次）、`bake {done,total}`、`ready`、`resize {w,h}`。

`actions`（M5 实现，M4 调用）：
```
select(id, {fly=true, push=true, instant=false}) → Promise<void>
deselect({push=true}) → void
suggest(q, limit=12) → Array<{id, score}>        // 纯查询，不改状态
search(q, {fly=true}) → string[]                 // 提交：写 state.search，取景
clearSearch() → void
flyTo({x,y,z} | {x,y,s}, {ms}) → Promise<void>
flyToBounds({x0,y0,x1,y1}, {pad=60, ms}) → Promise<void>
zoomBy(factor, {sx, sy}?) → void                 // 以屏幕点为锚，短动画
home({ms}) → Promise<void>
hoverLink(key|null) → void
setInset(partialInset) → void                    // 会 invalidate；不自动重新取景
```

## 6. World 契约与生成算法（M1）

### 6.1 导出
```js
// src/world/index.js
export function buildWorld(graph, opts = { raster: true }) → World
```
同步、确定性（同一数据 + `SEED` → 逐字节相同的世界），浏览器与 Node 都能跑。`opts.raster === false`（或没有 `document`/`OffscreenCanvas`）时 `rasters.ocean/relief = null`，其余照常（供 Node 测试）。目标耗时 < 900 ms（1600×1000 首屏 < 3 s 的预算里最大的一块）。

### 6.2 World 结构（所有坐标为 wu）
```
World = {
  bounds: WORLD_BOUNDS,                    // 相机可平移范围 / 栅格范围
  fitBounds: {x0,y0,x1,y1},                // home 取景：大陆 + 全部岛屿/港口的包围盒 + 40wu
  places: Place[],                         // 488 个，顺序：城市（按族 FAMILY_ORDER，族内 tier 升序）、岛屿、港口
  placeById: Map<id, Place>,
  countries: Country[],                    // 8 个，顺序 FAMILY_ORDER
  countryById: Map<familyId, Country>,
  coast: Float32Array[],                   // 大陆海岸线：闭合环 [x0,y0,x1,y1,...]（首尾不重复），≥1 个（含离岸小岛/内湖环）
  borders: Border[],                       // 国界：开放折线
  ripples: Array<{d, rings: Float32Array[]}>,  // 与 RIPPLES 一一对应：离"陆地∪岛屿"距离 = d 的等值线环
  roads: Road[],                           // 1670 条，与 graph.links 一一对应
  roadByKey: Map<link.key, Road>,
  seaLabels: SeaLabel[],
  rasters: { ocean: Canvas|null, relief: Canvas|null, rect: {x0,y0,x1,y1} },  // 栅格线性映射到 rect
  countryAt(x, y) → familyId | null,        // 查 owner 栅格（海上 null）
  meta: { ms: {layout, fields, contours, islands, rasters, total}, seed, stub?: true },
}

Place = {
  id, node,                 // node = graph 节点对象
  kind: 'city' | 'island' | 'port',
  family,                   // 城市 = 族 id；岛屿 = 'conjecture'；港口 = 'researcher'
  country,                  // 城市 = 族 id；其余 null
  tier: 0..3, importance,
  x, y,                     // 符号中心（港口 = 海上符号位置）
  r,                        // 岛屿半径（wu），其余 0
  // 岛屿：
  status, ring: Float32Array,           // 闭合岛形（有机，非正圆）
  // 港口：
  pier: {x, y},                         // 栈桥在海岸上的落点
}

Country = {
  id, zh, latin, colors: {land, ink},   // 来自 COUNTRY_NAMES / COUNTRY_COLORS
  rings: Float32Array[],                // 本国领土的闭合环（外环 + 本国的离岸小岛环；不做洞）
  center: {x, y},                       // 领土的"不可达极点"（离本国边界最远的内点）
  labelPath: Float32Array,              // 国名基线：自西向东的 5–9 点平滑折线，全部落在本国领土内
  labelAngle,                           // 主轴角（弧度，限制在 ±35°）
  area, bbox: {x0,y0,x1,y1},
  capitalId, placeIds: string[],
}

Border = { a: familyId, b: familyId, pts: Float32Array }   // 开放折线，a < b（字典序），每对相邻国 ≥1 条

Road = {
  key, link,                // link = graph link 对象
  kind: 'road'|'highway'|'crossroad'|'crossway'|'ferry'|'lane'|'expedition',
  hero, a, b,               // a/b = 端点 place id（= link.source / link.target）
  type, weight,
  x0, y0, cx, cy, x1, y1,   // 二次贝塞尔：端点 = 两 place 的 (x,y)，控制点 = 中点沿法向偏移 len·ROAD_BEND·(hash(key)·2-1)
  len,
}

SeaLabel = { zh, latin, x, y, angle, small?: true }       // 文本中心与旋转角
```
kind 判定：任一端是港口 → `expedition`；两端都是岛屿 → `lane`；一端岛屿 → `ferry`；同族 → `hero ? highway : road`；异族 → `hero ? crossway : crossroad`。
（这些就是占位实现的规则，`src/world/index.js` 现有代码可直接复用。）

### 6.3 必须满足的不变量（M1 自带 node 测试脚本 `tools/world/check.mjs` 断言）
1. 每个城市点位于**本国**领土内，且离本国边界 ≥ 10 wu（`countryAt(x,y) === family`）。
2. 每个国家主体是**一块连通领土**（允许有面积 < 1% 的离岸小岛环）；国家之间不互相包含。
3. `FAMILY_SLOTS` 里六角相邻的 13 对国家中，至少 11 对共享国界（`borders` 里有该对）。
4. 城市最小间距：tier≤1 之间 ≥ 30 wu；任意两城市 ≥ 9 wu。
5. 岛屿：全部在海上，离大陆海岸 ≥ `ISLAND_OFFSHORE[status]`·0.6，岛与岛（按 r 计）间隙 ≥ 8 wu，全部在 `WORLD_BOUNDS` 内缩 40 wu 的范围里。
6. 港口：`pier` 在大陆海岸线上（离 coast 折线 < 2 wu），符号在海上离岸 8–14 wu，港口之间 ≥ 22 wu。
7. `roads.length === 1670`，`places.length === 488`，`fitBounds` 包含全部 place。
8. 构建耗时（Node 下）< 900 ms。

### 6.4 生成流水线（推荐算法；可以改进，但要守住 §6.3）
文件建议：`world/index.js`（编排 + 组装）、`world/rng.js`（mulberry32 + 值噪声/fbm）、`world/layout.js`（国家与城市布局）、`world/fields.js`（标量场、EDT）、`world/contour.js`（marching squares + 环拼接 + Chaikin + RDP）、`world/islands.js`（群岛与港口）、`world/rasters.js`（海洋/晕渲栅格）。

1. **国家中心**：以 `COUNTRY_SEEDS` 为初值，半径 `R_f = 21·√N_f` wu；做 ~200 步松弛：重叠则推开、相邻槽位（`FAMILY_SLOTS` 六角距离 = 2）之间若间隙 > 0.15R 则轻拉。不得改变相邻拓扑。
2. **城市布局**（力导向，确定性，~500 次迭代，网格加速排斥）：
   初值 = 本国中心附近的向日葵排布（tier 升序由内到外）；
   力：族内 link 弹簧（静长 34 wu，强度 ∝ weight）；跨族 link 弱弹簧（强度 ×0.15，只拉向国界方向，不能把城市拉出国）；
   排斥：最小间距 `12 + (3 - tier)·6` wu 的软碰撞；
   约束：留在以本国中心为圆心、`0.92·R_f` 的圆内（越界拉回）；首都额外受一个指向本国中心的弱力（首都不必在正中，但别在边上）。
3. **陆地场**：网格 `GRID_CELL = 4` wu 覆盖 `WORLD_BOUNDS`（500×360）。每族密度场 `D_f(p) = Σ_{城市∈f} exp(-|p-c|²/(2σ²))`，σ = 34 wu（3σ 截断，只累加到本族场）。
   陆地判定：`Σ_f D_f(p) > τ + 0.18·fbm(p/180)`，τ ≈ 0.35（单个孤立城市就足以撑出半径 ~45 wu 的陆地，城市密集处自然连成大陆）。
   填掉不与外海连通的小水域（面积 < 3000 wu²）；去掉没有城市的、面积 < 1500 wu² 的小碎岛。
4. **领土**：`owner(p) = argmax_f D_f(p)`（仅陆地格）。为保证不变量 1，owner 判定用的场可以用更小的 σ_own ≈ 22 wu 单独累加（领土跟着城市走，国界更贴近"两国城市之间的中线"）；若仍有城市离本国边界 < 10 wu，把它沿本国中心方向内推后重算。国家 f 的领土 = 陆地 ∧ owner = f。用 marching squares 对"本国指示场"（`D_f - max_{g≠f} D_g`，与陆地场取 min）的 0 等值线取环 → Chaikin ×2 → RDP(0.6 wu)。这样两国的环在国界处重合到 < 1 wu。
5. **国界**：对每对国家 (a,b)，在 owner 为 a/b 的相邻格之间取 `D_a - D_b = 0` 的等值线段，只保留两侧都是陆地的部分，拼成开放折线，Chaikin 平滑。
6. **海岸线**：陆地场的等值线（同 4 的平滑与简化），得到 `coast`。
7. **群岛**（59 个猜想）：初始位置 = 其关联定理城市坐标的加权（weight）重心；沿"远离陆地"方向（离岸距离场的梯度）推到离岸 `ISLAND_OFFSHORE[status]` 处；然后 ~150 步松弛：岛与岛不重叠（间隙 8 wu）、与大陆保持距离、相互关联的猜想（lane）轻微相吸、不出界。岛形 = 半径 r 的圆加 3–4 个低频正弦扰动（幅度 0.25r，相位来自 hash(id)），Chaikin 平滑，24–40 点。
8. **离岸距离场**：把岛形光栅化进陆地掩码，做精确 EDT（Felzenszwalb 两遍）得 `dist(p)`（wu）。`ripples[i]` = `dist = RIPPLES[i].d` 的等值线环（平滑后）。
9. **港口**（24 位研究者）：目标点 = 关联定理城市的重心（若只关联猜想，则用关联岛屿重心）；`pier` = 离目标最近的大陆海岸线点；符号位置 = pier 沿海岸外法向 11 wu。沿海岸线做 1D 松弛使相邻港口 ≥ 22 wu。
10. **海名**：在 `dist` 场上找局部极大（离陆/岛最远的开阔海域），按值降序贪心选取、两两相距 ≥ 450 wu，依次放 `SEA_NAMES[0..2]`；`SEA_NAMES[3]`（此处有龙，small）放在离两个 disproved 幻岛重心最近的开阔处。angle 取该处海岸大致走向，限制 ±15°。
11. **国名基线**：本国领土的主轴（PCA）方向，限制 ±35°；从 `center` 沿主轴两侧在领土内延伸到距边界 ≥ 25 wu 处，取 7 个点，并让中间点沿领土"脊线"（本国 EDT 的极大）略弯，平滑后自西向东存。
12. **地形高程**（只为晕渲）：`H(p) = Σ_城市 (0.4 + importance)·exp(-|p-c|²/(2·26²)) + 0.35·fbm(p/90)`，乘陆地内部距离的 smoothstep(0, 40 wu)（海岸处平坦）。
13. **栅格**（opts.raster）：
    - `rasters.ocean`：每格 1 像素（500×360），颜色 = `OCEAN_DEPTH_STOPS` 按 dist 插值，陆地格也填近岸色（会被陆地盖住）。
    - `rasters.relief`：同分辨率，Lambert 晕渲 `shade = max(0, n·L)`（L 来自 `RELIEF.azimuthDeg/altitudeDeg`，法线由 `H` 的中心差分 × `RELIEF.zFactor`），编码成灰度 `g = 128 + (shade - shadeFlat)·255`，alpha = 陆地 ? 255 : 0。render 用 overlay 混合并以 `RELIEF.strength` 为 globalAlpha 叠加（中灰 128 = 不变）。
    - 用 `document.createElement('canvas')` + `putImageData`；返回 canvas 元素。

## 7. Render 契约（M2）

### 7.1 导出
```js
// src/render/index.js
export function createRenderer(canvas, { world, graph, labeler }) → Renderer
Renderer = {
  resize(w, h, dpr),                       // 设 canvas.width/height = round(w·dpr)…，style 宽高 = css px
  draw(frame, placement) → { animating: boolean },  // 画一整帧；animating=true 表示还有动画（M5 会继续逐帧调用）
  pick(sx, sy, frame, placement) → id | null,       // 点选/悬停命中（§7.4）
}
```
单个 `<canvas id="map">`，Canvas 2D。**不**使用 WebGL。

### 7.2 图层顺序（自下而上）
世界层（transform 见 §2；线宽/虚线 `/ z`）：
1. 清屏为 `OCEAN.deepest`；`rasters.ocean`（`imageSmoothingEnabled = true`，`drawImage` 到 `rasters.rect`）。无栅格时用 `OCEAN.deep` 纯色。
2. 经纬网：每 `GRATICULE_STEP` wu 一条横/竖线，0.8px，`OCEAN.graticule`。
3. 等深线：`world.ripples`，按 `RIPPLES[i]` 的 alpha/width/dash，色 `OCEAN.ripple`。
4. 国家填色：每国 `rings` → 一个 Path2D（缓存），`fill(land)`。
5. 地形晕渲：`save(); clip(全部海岸线 Path2D); globalCompositeOperation='overlay'; globalAlpha=RELIEF.strength; drawImage(relief); restore()`。
6. 国界内侧色带：对每国 `save(); clip(本国 Path2D); stroke(本国 rings, 宽 2·BORDER.ribbon/z, 色 ink, alpha BORDER.ribbonAlpha); restore()`（clip 让色带只出现在本国一侧；海岸处也有一圈内侧色带，属有意为之）。
7. 国界线：`world.borders` 1.1px `BORDER.color`。
8. 海岸线：`world.coast` 1.3px `OCEAN.coast`。
9. 航线与海道（`ferry`、`lane`，按 `roadVisible`），在岛屿**之下**，端点被岛形盖住。
10. 岛屿：填色（disproved 不填）、partial 的斜线（clip 到岛形）、海岸线（按状态虚线）。
11. 陆路（`road` → `crossroad` → `highway` → `crossway` 顺序，各自先画全部 casing 再画全部 core），按 `roadVisible`/`roadAlpha`。
12. 港口栈桥线（pier → 符号）。

屏幕层（transform = dpr）：
13. `labeler.drawAreas(ctx, placement, frame)`：国名、海名。
14. **选中遮罩**（`frame.selectedId` 非空）：整屏 `rgba(251,248,241,.55)`；**搜索遮罩**（无选中、`hits.size>0`）：`.35`。
15. 高亮路线：`frame.linkKeys` 中每条 road（含 `expedition`，忽略 `roadVisible`），世界层 transform 下画：casing `ROUTE.casing` 6px → core `ROUTE_TYPE_COLORS[type]` 3.2px（ferry/lane/expedition 的 core 用虚线）。`now - selectT0 < ROUTE.drawInMs` 时用 `setLineDash([len·z, len·z])` + `lineDashOffset` 由 len·z 线性降到 0 做"画出"动画（期间 animating=true）。`frame.hoverLinkKey` 对应路线 core 加宽到 5px。
16. 符号：所有在视口内（外扩 30px）的 place。选中时：非选中、非邻居的符号 alpha .35；搜索时非命中 alpha .5。城市/港口按 §3.3 画；岛屿已在第 10 层画（这里只画岛的 mark：旗/×）。
    - 搜索命中：符号外 `r+5` 的 2px 金色圈 `#d9a521`。
    - 选中：`r+6` 的 2.5px 圈 `#d63a55`；`now - selectT0 < PULSE_MS` 时另画一个从 r+4 扩到 r+28、alpha 1→0 的脉冲圈（animating=true）。
    - 悬停：符号放大 1.25 倍。
17. `labeler.drawPoints(ctx, placement, frame)` → 若返回 animating 则并入。

### 7.3 性能
- 构造时缓存 Path2D（世界坐标）：每国领土、全部海岸、国界、每条 ripple、经纬网、每个岛形；道路按 kind 各一个 Path2D（端点固定，与缩放无关）。每帧只改 transform/lineWidth 重描，不重建路径。
- 视口裁剪：符号与高亮路线按 `frame.visibleWorld` 外扩后裁剪；整类 Path2D 不裁（浏览器自己裁）。
- 目标：1600×1000、L1 状态 `drawMs` < 8 ms（不含 labels）。

### 7.4 `pick(sx, sy, frame, placement)`
1. 先 `labeler.hitTest(sx, sy, placement)`（点在某个标签框内 → 该 place）。
2. 再找屏幕距离最近的 place：城市/港口要求距离 ≤ `max(HIT_RADIUS, symbolRadius+3)`；岛屿要求点在岛形内或距岛心 ≤ `r·z + 4`。只考虑当前画出来的符号。
3. 都没有 → null。

## 8. Labels 契约（M3）

### 8.1 导出
```js
// src/labels/index.js
export function createLabeler(world, graph) → Labeler
Labeler = {
  bake(onProgress) → Promise<void>,     // 开始烘焙全部公式；onProgress({done,total}) 每批调用；全部完成 resolve
  ready: Promise<void>,                 // 优先集（全部 tier≤1 城市与岛屿 + 8 个首都）烘焙完成 resolve
  place(frame) → Placement,             // 每帧调用，纯计算（不画）
  drawAreas(ctx, placement, frame),     // 国名、海名；ctx 已是屏幕层 transform
  drawPoints(ctx, placement, frame) → { animating },   // 点标签；淡入期间 animating=true
  hitTest(sx, sy, placement) → id | null,
  countOverlaps(placement) → number,    // 屏幕上互相重叠的"活动标签"对数，必须为 0
}
Placement = {
  items: LabelItem[],                   // 本帧放下的点标签
  areas: AreaLabel[],                   // 本帧画出的国名/海名
  stats: { candidates, placed, formula, name, ms },
}
LabelItem = {
  id, kind: 'city'|'island'|'port', mode: 'formula'|'name',
  anchor: 'E'|'W'|'N'|'S'|'NE'|'NW'|'SE'|'SW',
  box: {x, y, w, h},                    // 屏幕 css px，碰撞与命中用的外框（含光晕/底板）
  alpha,                                // 淡入后的不透明度（还要乘选中/搜索的减淡系数）
  emphasis: 'selected'|'neighbour'|'hit'|null,
}
AreaLabel = {
  kind: 'country'|'sea', id,            // country = 族 id；sea = SEA_NAMES 下标
  active: boolean,                      // true = 参与避让且计入 countOverlaps；L2+ 的国名为 false（水印）
  glyphs: Array<{ch, x, y, angle, px}>, // 逐字排版结果（屏幕坐标，中心点）
  boxes: Array<{x,y,w,h}>,              // 每个字的外接框（active 时作为障碍）
  alpha,
}
```

### 8.2 公式烘焙
- 源：`texSync(node.latex, inkHex)`（`designs/shared/tex.js`，字号 64px）。研究者没有公式（latex 是 `\text{名字}`），港口永远只用名字模式，不烘焙。
- ink：城市 = `COUNTRY_COLORS[family].ink`；岛屿 = `ISLAND_STATUS[status].ink`。
- 显示字号 `px` = `LABEL_SIZE.formulaPx[tier]`（岛屿 `islandFormulaPx[tier-1]`）；显示尺寸 `w = widthPx·px/64`、`h = heightPx·px/64`。若 `w > maxFormulaW`，等比缩到 maxFormulaW；缩放后字号 < 0.75·px 的公式标记为 `tooWide`，这个 place 不用 formula 模式（直接降级为 name）。
- 烘焙分辨率 = 显示尺寸 × `min(2, devicePixelRatio)`（烘焙时读 window.devicePixelRatio）。**光晕烘进同一张位图**：先用把 svg 里 ink 颜色替换为 `HALO.color` 的同一份 SVG 在 8 个方向偏移 `HALO.width/2`·dpr 各画一遍，再画 ink 版。用 OffscreenCanvas（或 canvas）→ `createImageBitmap`。
- 解码：svg 字符串 → `Blob` → `URL.createObjectURL` → `Image.decode()`；并发 6；用完 `revokeObjectURL`。
- 顺序：先优先集（8 首都 + 全部 tier1 城市 + tier1 岛屿，共 ~74 个）→ resolve `ready` → 其余按 tier、importance 降序每批 16 个，批间 `setTimeout(0)`/`requestIdleCallback` 让出主线程，每批完成调用 `onProgress` 并 `invalidate()`（import 自 state.js）。
- 未烘焙完成的公式：该 place 的 formula 模式视为不可用（降级为 name），烘焙好后自然出现。
- 选中节点：若当前显示尺寸更大（选中底板，见 8.4，字号 ×1.15），可以直接用已有位图放大绘制（轻微模糊可接受），不必重烘。
- 单个公式排版失败（texSync 抛错）→ console.warn 一次，该 place 永久 name 模式；不得影响其它。

### 8.3 碰撞放置 `place(frame)`
1. 候选：视口内（外扩 0）的 place，`labelModes(place, level, flags)` 非空；flags 由 frame 推出（selected = selectedId，neighbour ∈ neighbours，hit ∈ hits，hover = hoverId，wasPlaced = 上一帧放过）。
2. 障碍预置：
   - `frame.uiRects`（UI 浮层），外加视口边缘内缩 4px 以外的区域（标签框必须完全在视口内）；
   - 所有画出的、`symbolIsObstacle` 的符号的圆（`symbolRadius + 1`），**本标签自己的符号除外**；
   - active 的 AreaLabel 字框。
3. **AreaLabel 先放**（它们优先级最高，但只占字形本身的小框）：
   - 国名：沿 `country.labelPath`（转屏幕坐标）均匀排开 `zh` 的每个字，字号 `px = min(COUNTRY_LABEL.px[level], 路径屏幕长度 / (字数·(1+tracking)))`，`px < 12` 时不画；每字旋转 = 路径切线角。拉丁副标题沿同一路径向下偏移 `px·0.9`，字号 `COUNTRY_LABEL.latinPx[level]`，字距 0.3em（拉丁不算障碍，只画）。L0/L1 active，L2+ 水印。国名中心若在视口外则跳过。
   - 海名：`seaLabels`，中心 + angle，字号 `SEA_LABEL.px[level]`（small 的 ×0.75），中文一行、拉丁一行在下方；逐字成 glyph，active。
   - AreaLabel 之间互相碰撞时，后放的整条不画（顺序：国名按国家面积降序，然后海名）。
4. 点标签按 `labelPriority` 降序逐个尝试：对每个模式（按 labelModes 顺序）× 每个方位（上一帧的方位优先，然后 `E, W, NE, SE, NW, SW, N, S`）计算框，第一个不与任何障碍/已放标签相交的就接受，并把框加入网格索引（64px 格）。都不行 → 不标。
5. 框的尺寸：
   - name 模式：`w = measureText(truncName(name)).width + 2·halo`，`h = namePx·1.25`；
   - formula 模式：公式位图（w_f, h_f）在上，名字在下（间距 lineGap），`w = max(w_f, w_name)`，`h = h_f + lineGap + namePx·1.2`，两行左对齐（E 系方位）/右对齐（W 系）/居中（N、S）；
   - 选中（emphasis='selected'）：外加 6px 内边距的白色圆角底板（底板计入框）。
   - 港口：名字用 `FONTS.port` 斜体、`LABEL_SIZE.portNamePx`；disproved 岛屿名字后加 " (E.D.)"。
   - 方位偏移：E = 框左边贴符号右侧 `r + gap`，垂直居中于符号；N = 框底贴符号上方；NE = 框左下角贴 `(r·0.7+gap, -r·0.7-gap)`；其余对称。
6. `measureText` 结果按 (字体, 字号, 文本) 缓存；整次 `place()` 目标 < 3 ms（~500 候选）。

### 8.4 绘制
- `drawAreas`：国名用 `FONTS.country` 700、ink 色、光晕 = 该国 land 色 4px（`strokeText`）；海名 `FONTS.sea` italic、`OCEAN.seaLabel`、光晕 = `OCEAN.shallow` 3px。alpha 来自 `COUNTRY_LABEL.alpha[level]` / `SEA_LABEL.alpha[level]`；有选中时国名/海名再 ×0.5。
- `drawPoints`：公式位图 `drawImage` 到 (box 内的位置, 显示尺寸)；名字 `strokeText`（HALO）+ `fillText`（ink）。
  - 新出现的标签 alpha 在 `LABEL_FADE_MS` 内从 0 淡入（按 id 记录首次出现时刻；连续出现则保持 1）。
  - 选中时：emphasis=null 的标签 alpha ×0.4；搜索（无选中）时非命中 ×0.55。
  - 选中标签：白色圆角底板（圆角 6，1px ink 边，阴影 `0 2px 8px rgba(0,0,0,.15)`），公式字号 ×1.15。
  - 邻居标签：名字行加 1px 的 ink 下划线（暗示"可点"）。
- `countOverlaps`：对 items 与 active areas 的所有框两两检测（交叠面积 > 1px² 记 1 对），O(n²) 即可（只在 stats 时调用）。

## 9. UI 契约（M4）

### 9.1 DOM（`index.html` 已有容器，ui 模块往里填内容；全部用 createElement/textContent，富文本只用 md.js 的 `inlineMd`）
| 容器 | 位置 | 内容 |
|---|---|---|
| `#search` | 左上 16px，宽 360 | 搜索框 + 建议下拉 + 命中计数条 + 工具按钮（图例 / 探险者名录 / 全图） |
| `#cartouche` | 左下 16px，宽 300 | 标题图框 + 可折叠图例 |
| `#register` | 左侧 16px、top 84px，宽 300，最高 calc(100vh-200px) 可滚动 | 探险者名录（24 人） |
| `#panel` | 右侧 16px，top 16、bottom 16，宽 `PANEL_W`=400 | 详情面板 |
| `#hud` | 右下 16px（面板打开时 right = 416+16） | 指北针、比例尺、缩放按钮、级别读数、烘焙进度 |
| `#tooltip` | 跟随指针（+14, +14） | 悬停提示 |
| `#sr-live` | 不可见 | 读屏播报 |

### 9.2 导出
```js
// src/ui/index.js
export function initUI({ graph, world }) → UI
UI = {
  obstacles() → Array<{x,y,w,h}>,  // 当前可见浮层（#search 含下拉、#cartouche、#register、#panel、#hud）的 getBoundingClientRect，
                                    // 转成相对 canvas 的坐标并外扩 6px；每帧调用 → 内部缓存，只在 DOM 变化/resize 时重算
  closeTransient() → boolean,       // 依次关闭：建议下拉 → 名录 → （展开的图例不关）；关了东西返回 true
  focusSearch(),
}
```
UI 订阅 bus：`select`（打开/关闭面板 + `actions.setInset({right: 打开 ? PANEL_W + 16 : 0})`，播报 `#sr-live`）、`search`（命中计数条）、`hover`（tooltip）、`view`（比例尺、级别读数、HUD 位置）、`bake`（进度）、`ready`。

### 9.3 视觉
纸面卡片：底 `#fbf8f1`，1px 边 `rgba(80,64,40,.22)`，圆角 6px，阴影 `0 6px 24px rgba(40,50,60,.14)`；正文 `FONTS.city` 14px `#2b2a26`；次要文字 `#7a7468`。按钮 hover 用边框色 `#b5832a`。不要毛玻璃，不要深色。图例符号用内联 `<canvas>`/`<svg>` 按 constants 里的数值画，必须和地图上的一致。

### 9.4 搜索 `#search`
- `<input type="search">`，placeholder「搜索定理、猜想、研究者… 例：Hodge / 层上同调 / status:open」，快捷键 `/` 聚焦。
- 输入时（防抖 80ms）调用 `actions.suggest(q, 12)` → 下拉列出：类型小符号（城市符号按 tier / 岛屿状态色块 / 锚）+ 中文名 + 英文名（灰）+ 国家色块与国名（猜想写"岛屿 · 状态中文"，研究者写"港口 · 机构"）。上下键移动、Enter 选中高亮项（`actions.select(id)`）、无高亮项时 Enter = `actions.search(q)` 提交；点击项 = select。
- 提交后（`search` 事件 ids.length > 1）在输入框下显示命中条：「命中 37 处 · 已在地图上以金圈标出」+「清除」按钮（`actions.clearSearch()`）。0 命中显示「没有找到」。
- 工具按钮行：「图例」（展开/折叠 cartouche 的图例）、「探险者名录」（切换 #register）、「全图」（`actions.home()`）。

### 9.5 标题图框 + 图例 `#cartouche`
- 标题：大字「公式大陆」（`FONTS.title` 26px，字距 .2em）、副标题「TERRA FORMULARUM」（Georgia 大写 11px 字距 .35em）、一行说明「代数几何知识地图 · 405 座城市 · 59 座岛屿 · 24 处港口 · 1670 条道路与航线」（数字由数据算）。外框双线（2px + 1px，间隔 3px，色 `#8a7f73`）。
- 图例（默认展开，可折叠，折叠状态存 localStorage `map.legend`）分四组：
  1. **国家**：8 个色块 + 国名（点击 → `actions.flyToBounds(country.bbox)`），右侧小字该国城市数。
  2. **城市**：首都 / 大城市 / 城镇 / 村落 四种符号 + 说明「按族内重要度」。
  3. **道路与航线**：跨境公路、国内高速、道路、航线、探险路线 —— 用小段线条示意。
  4. **海图**：岛屿五种状态符号 + 名称 + 数量（来自数据），港口符号「研究者港口」。
- 高度受限时（`innerHeight < 760`）图例默认折叠。

### 9.6 探险者名录 `#register`
标题「探险者名录 · Register of Explorers」+ 关闭按钮。24 位研究者按 `field`（`RESEARCHER_AREAS[field].name`）分组，每条：锚形符号 + 名字 + 机构（灰，单行省略）。点击 → `actions.select(id)`（名录保持打开）。当前选中的研究者高亮。

### 9.7 详情面板 `#panel`
`select` 事件 id 非空 → 打开并渲染；null → 关闭（`hidden`）。结构自上而下：
1. 顶条：国家色带（城市 = land 色背景 + ink 字「国名 · 首都/大城市/城镇/村落」；岛屿 = 状态填色 +「猜想岛屿 · 状态中文 — hint」；港口 =「研究者港口 · 领域中文」）+ 右侧关闭按钮（`actions.deselect()`）。
2. 标题：中文名（20px 粗）+ 英文名（灰 13px）。
3. 公式：KaTeX `displayMode: true`、`throwOnError: false` 渲染 `node.latex`，横向溢出可滚动（研究者跳过）。
4. 元信息行：城市「重要度 0.91 · 关联 23 条」；猜想「提出者 · 年份 · 领域」+ `progressOf(id)` 若有则显示「最近进展：…」；研究者「机构」「研究方向 focus」。
5. `summary`（inlineMd）、`detail`（inlineMd，按 `\n` 分段）。
6. 研究者：代表作列表（标题 + 年份 + note；url 只接受 `http(s)://` 开头才渲染为 `<a target="_blank" rel="noopener noreferrer">`）。
7. **关联路线**：按 road.kind 分组 —— 「国内道路」（road+highway）、「跨境公路」（crossroad+crossway）、「航线」（ferry）、「海道」（lane）、「探险路线」（expedition）；组内按 weight 降序。每行：关系类型色点（`ROUTE_TYPE_COLORS[type]`）+ 类型中文（`typeLabel(type)`）+ 对端名字（加粗、可点 → `actions.select(otherId)`）+ 对端国家小色块 + 第二行灰色 `link.label`。行 hover → `actions.hoverLink(key)`，离开 → `actions.hoverLink(null)`。
8. 底部按钮：「在原星云中打开」（`<a href="/#v1&n=<encodeURIComponent(id)>" target="_blank">`）、「复制本页链接」（复制 `location.href`，按钮文字短暂变「已复制」）。
面板滚动位置在切换节点时回到顶部。窄屏（宽 < 760px）面板改为底部抽屉（高 46vh），此时 `setInset({right:0, bottom: 46vh 的 px})`。

### 9.8 HUD `#hud`
- 指北针（SVG，40px，N 字，老地图风）。
- 比例尺：一段 80–120px 的黑白交替刻度条，标「≈ N 跳」（按"1 跳 = 道路平均长度 world 中位数 len"换算，取 1/2/5/10 的整数），制图隐喻，不是真实距离。
- 级别读数：「总览 / 国家 / 城市 / 街区」（L0–L3）。
- 缩放按钮：＋ / － / ⌂（`actions.zoomBy(1.6)`、`zoomBy(1/1.6)`、`actions.home()`），带 aria-label。
- 烘焙进度：`bake` 未完成时显示「公式排版 128/464」小字，完成后淡出。
- 面板打开时 HUD 左移到面板左侧（监听 select 或读 state.inset.right）。

### 9.9 Tooltip `#tooltip`
`hover` 事件 id 非空时显示（指针 +14px，贴边翻转）：中文名（粗）+ 英文名；第二行「国名 · 城市等级」/「猜想岛屿 · 状态」/「研究者港口 · 机构」。id 为 null 或拖拽中隐藏。不显示公式（标签已显示）。

### 9.10 `map.css`
页面全部样式（index.html 内联的关键样式除外）。前缀用 `.ui-*` / 容器 id；`prefers-reduced-motion` 下取消过渡动画。不得写影响 `#map` 尺寸的规则。

## 10. 编排契约（M5）

### 10.1 启动（`main.js`，骨架已在）
`getGraph()` → `buildWorld(graph, {raster:true})` → `createLabeler(world, graph)` + `labeler.bake(onProgress)` → `createRenderer(canvas, {world, graph, labeler})` → `initUI({graph, world})` → `resize()` → 解析 hash（§10.4）定初始相机与选中（无动画）→ 渲染循环启动 → `await labeler.ready` → 两个 rAF 后 `state.ready = true`、`__design.ready = true`、`<html>` 加 `is-ready` 类、`bus.emit('ready')`。
启动失败：`#loading` 显示错误信息（textContent），不留白屏。
为了让"正在测绘大陆…"先画出来，`buildWorld` 之前先 `await` 一个 rAF。

### 10.2 渲染循环
rAF 常驻；仅当 `state.dirty || animating（renderer/labels/相机动画）` 时重画。每帧：`frame = makeFrame(state, ui.obstacles(), now)` → `placement = labeler.place(frame)` → `renderer.draw(frame, placement)`。记录 `state.perf`；`view` 变化时 `bus.emit('view', …)`（每帧至多一次）。保留最近的 placement 供 pick/stats。

### 10.3 actions 实现（`Object.assign(actions, {...})`）
- `select(id, {fly=true, push=true, instant=false})`：id 不存在 → console.warn 并 resolve。计算 `neighbours`（`node.linkIds` 的对端）、`linkKeys`；写 `state.selection`（t0 = now）；**先** `bus.emit('select')`（UI 同步打开面板并 setInset）→ **再**取景：目标 = 选中 place；框住选中 + 全部邻居的包围盒，`fitBoundsView` 后把 s 夹到 `SELECT_FOCUS_S`，并保证选中点居于可见区中心（`centerOn`）。若选中点已在可见区内、且当前 s 已在区间内 → 不飞。`instant` → 直接设 view。写 hash（push → pushState，否则 replaceState）。
- `deselect`：清空 selection，emit，写 hash。
- `suggest(q, limit)` / `search(q, {fly})`：见 §10.5。search：写 `state.search`，emit `search`；`ids.length === 1` → 直接 `select`；`> 1` → `flyToBounds(命中包围盒, {pad: 80})`，s 不超过 3.2；`0` → 不动。返回 ids。
- `clearSearch`：清空并 emit。
- `flyTo / flyToBounds / home / zoomBy`：`camera.js` 提供动画（van Wijk–Nuij 平滑缩放平移，或简单的 log(z) 插值 + easeInOutCubic）；时长 `FLY_MS`（按距离 0.5–1.4 倍）；`prefers-reduced-motion` → 瞬移；任何用户拖拽/滚轮立即取消当前飞行（promise 照常 resolve）。`home` = `fitBoundsView(world.fitBounds, size, inset, {pad: 24})`。
- `hoverLink(key)`：写 `state.hover.linkKey`，invalidate。
- `setInset(p)`：合并进 `state.inset`，invalidate。

### 10.4 交互（`interact.js`）与深链（`hash.js`）
- 拖拽平移（pointer events，`setPointerCapture`；位移 > 4px 才算拖拽；拖拽时 `#map.is-dragging`）；松手惯性（速度衰减 0.92/帧，可选）。
- 滚轮缩放：以指针为锚，`z *= exp(-deltaY·0.0015)`（ctrlKey 的触控板捏合同样处理）；两指捏合缩放（pointer 事件追踪两个触点）。
- 双击：以该点为锚放大 2 倍（动画）。
- 点击（未拖拽）：`renderer.pick` → 有 → `actions.select(id)`；无 → 若有选中则 `deselect()`。
- 悬停：pointermove 节流到 rAF；`pick` 结果变化 → 写 `state.hover.id/sx/sy`、emit `hover`、invalidate；指针形状 pointer/grab。
- 键盘（焦点不在输入框时）：方向键平移 80px；`+`/`=` 放大、`-` 缩小；`0`/Home 回全图；`/` → `ui.focusSearch()`；**Esc 链**：`ui.closeTransient()` 为真则停 → 否则有选中 → `deselect()` → 否则有搜索 → `clearSearch()` → 否则 `home()`。（输入框内按 Esc：先清空输入并关闭下拉，再按则 blur。由 UI 处理输入框内的 Esc，不冒泡到 interact。）
- **深链格式**：`#v1&n=<id>&c=<x>,<y>,<s>`，均可选。`n` = 选中 id（encodeURIComponent）；`c` = 相机 canvas 中心的世界坐标（取整）与 s（2 位小数）。
  - 解码永不抛异常；版本不是 v1 / 字段非法 / id 不存在 → 忽略该段（console.warn）。
  - 启动：有 `c` → 用它；只有 `n` → 按 select 的取景规则瞬间取景；都没有 → home。
  - 写入：选中变化 pushState；相机变化（防抖 `HASH_DEBOUNCE_MS`）replaceState；`popstate`/`hashchange` → 按新 hash 恢复（选中带飞行，不再 push）。

### 10.5 检索（`search.js`）
`searchNodes(graph, q, {limit=Infinity}) → Array<{id, score}>`：
- 若 q 含 `:`、`(`、` OR `、` AND ` 或以 `-` 开头的词 → 用 `parseQuery(q).test`，按 importance 降序，score = importance；`error` 时返回 []。
- 否则对 name / en / id / latex（小写，去空白比较）打分：完全相等 100、前缀 60、词首（空格/连字符后）40、子串 25；`summary` 子串 8；多字段取最大；再 + importance·5。score>0 的按 score 降序。
- 488 个节点每次按键 < 2 ms。

### 10.6 `window.__design`（`debug.js`）
```
ready: boolean
graph, world, state
select(id) → Promise（飞行结束后 resolve）
deselect()
search(q) → string[]
view() → { x, y, z, s, level, selected, inset, w, h }
setView({x?, y?, z?, s?}, {animate=false}) → Promise   // s 优先于 z（z = s·zFit）；完成并重画后 resolve
stats() → { visibleLabels, overlappingLabels, formulaLabels, nameLabels, areaLabels,
            fps, frameMs, placeMs, drawMs, worldMs, bake:{done,total}, level, s }
measureFps(ms = 1500) → Promise<number>     // 期间以小幅平移驱动连续重画，返回平均 fps
screenOf(id) → [sx, sy] | null              // 节点当前屏幕坐标（评审代理用来点击）
placeOf(id) → Place
hash() → location.hash
```
`setView`/`select` 的 promise 要在**新画面画完**（下一帧 draw 结束）后 resolve，截图工具 `--eval` 才能拿到正确画面。

## 11. 验收标准（全体）
1. `node designs/shot.mjs http://localhost:5190/designs/map/ out.png --wait "window.__design && window.__design.ready"` 无 `[page exception]`，首屏 ready < 3 s（1600×1000）。
2. 总览截图：看得出 8 个彩色国家与国名、8 个首都公式、海上群岛与海名；没有圆盘硬边、没有网格锯齿。
3. 任意级别 `__design.stats().overlappingLabels === 0`（L0、L1、L2、L3 各抽查，含选中状态）。
4. 488 个节点都可 `search` 到、`select` 后面板内容正确（`**粗体**` 渲染为粗体，无星号）。
5. 选中 → 路线高亮 + 邻居标签出现 + 面板；Esc 链正确；`#v1&n=cn-hodge` 深链打开即选中 Hodge 猜想岛。
6. L1 平移 `measureFps()` ≥ 50（headless SwiftShader 下 ≥ 30 可接受）。
7. 数据文本全部经 textContent / md.js；无 innerHTML 拼接数据。

## 12. 并行开发与自测
- 各模块 CDP 截图端口：M1 world 9601–9602，M2 render 9603–9604，M3 labels 9605–9606，M4 ui 9607，M5 orchestration 9608–9609（架构师 9600）。
- 截图存 `shots/designs/map/<模块>-*.png`，用 Read 工具亲眼检查。
- 依赖尚未完成时，用占位实现即可自测（占位的 world 也满足 §6.2 的结构，只是形状简陋）。不要为了自测去改别的模块的文件；需要假数据就写在自己的 `dev/<模块>/` 里。
- Node 下可 import：`constants.js`、`rules.js`、`view.js`、`state.js`、`world/**`、`search.js`、`hash.js`（这些文件不得在模块顶层访问 DOM）。
