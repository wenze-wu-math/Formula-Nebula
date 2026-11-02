# 公式星图 · Atlas Coelestis — 设计与模块契约

方案 A。2D 古典天文星图：深海军蓝底、细金线坐标网，8 个知识族 = 8 个星座区域，
定理 = 恒星（单色奶白，星等表达重要度），猜想 = 朱红深空天体符号，研究者 = 外缘刻度环外的名字。
Canvas2D 单画布 + DOM 面板。原生 ES modules，无框架、无第三方布局库。

页面：http://localhost:5190/designs/atlas/　　截图：shots/designs/atlas/

**冻结文件**（架构师所有，建造者只读，不得修改；发现缺陷在交付说明里提出）：
`constants.js`、`geo.js`、`state.js`、`glyphs.js`、`index.html`、`SPEC.md`。
所有设计常量都在 `constants.js`，本文引用常量名而不重复数值；两者冲突时以 `constants.js` 为准。

---

## §0 要解决的问题 → 本方案的回答

| 原星云的问题 | 星图的回答 |
|---|---|
| 总览时公式读不出 | 2D 正投影，无倾斜；总览（L=0）就显示 ~10 条最重要公式（按屏幕像素排版、不随缩放变形），其余逐级出现 |
| 拉近后公式互相叠压 | 所有标签走同一个贪心避让器（§6），屏幕上**零重叠**；`stats().overlappingLabels` 恒为 0 |
| 8 族混排看不出结构 | 每族一个连通的星座区域，IAU 式阶梯虚线边界 + 区域中心的星座名；族靠**位置**表达，不靠颜色 |
| 连线默认隐藏 | 每族最亮的星按真实关联连成星座连线（常显）；选中后全部一跳关联以弧线浮现 |
| 3D 操作成本高 | 地图式平移缩放 + 语义缩放；双击 / 滚轮以光标为锚 |
| 猜想星团的硬圆弧边 | 猜想不再成团：作为深空天体分散到所依赖的定理附近 |

---

## §1 视觉语言

### §1.1 配色（`COLOR`）
两种墨色 + 金线，此外不引入第三种饱和色（搜索命中的冷蓝 `searchHit` 只用于临时状态）。
- 盘面：径向渐变 `diskInner`（中心）→ `diskOuter`（r=R_DISK）；盘外 `bgOuter`。
- 坐标网：`grid` / `gridMajor`，线宽 0.75px / 1px（屏幕 px，不随缩放变）。
- 刻度环：`ring`，1px；赤经时数字 `ringDim`。
- 星座边界：`boundary`，1px，虚线 `[5, 4]`（屏幕 px）。
- 星座连线：`figure`，1px 实线，两端在星点外留 3px 空隙。
- 恒星：`star` 实心 + `starHalo` 外圈挖空 1.3px。
- 猜想：`conj` 朱红。公式标签用 `CONJ_HEX`，中文名用 `conjName`。
- 定理公式 `INK_HEX`，中文名 `inkName`；被选中节点自己的公式用 `INK_HI_HEX`。
- 研究者名字 `researcher`（金）。
- 选中后的关联弧：定理—定理 `arcTheorem`，涉及猜想 `arcConj`，研究者引导线 `arcResearcher`（虚线）。

### §1.2 字体
- `FONT_SERIF`：时数字、拉丁星座名、研究者名（*斜体*）、中文名行、面板标题。
- `FONT_KAI`：星座中文名（楷体，古籍气质）。
- `FONT_SANS`：面板正文、元数据、搜索、图例说明。
- 公式：标签用 MathJax SVG 位图（`designs/shared/tex.js`）；面板 / 提示 / 搜索下拉用 KaTeX。

### §1.3 线宽与描边
所有线宽、虚线段长、字号都是**屏幕 px**（不随缩放变粗）。画布按 `dpr` 缩放后以 css px 作图。

### §1.4 符号系统（实现于 `glyphs.js`，三处共用）
- 恒星 `drawStar(ctx, x, y, r, {alpha, mag, halo})`：半径 `bodyRadius(body, L)`；mag≤2 加柔光；mag 1 加四芒细刺。
- 深空天体 `drawDso(ctx, x, y, r, status, {alpha, halo, color})`：
  open 虚线圆 / partial 左半填实 / proved 实心 + 外环 / disproved 斜杠圆 / heuristic 倾斜椭圆。
- 研究者：刻度环外一道金色短刻度（R_RES_TICK → R_RES_TICK_END）+ 沿弧排列的斜体名字。
- DOM 小图标 `glyphCanvas(spec, size)`：图例、面板关联列表、搜索下拉用。

### §1.5 屏幕构图（1600×1000，L=0）
```
┌────────────────────────────────────────────────────────────────────┐
│ ┌ 标题框 ───────┐                                                   │
│ │公式星图        │            ╭──── 研究者名字（沿弧） ────╮           │
│ │ATLAS COELESTIS│          ╭─ 刻度环 0ʰ…23ʰ ─╮                     │
│ │405 ★ 59 ◌ 24 │         │   7 个环形星座     │                     │
│ ├ 搜索框 ───────┤         │    ╭ 极冠 ╮        │                     │
│ │⌕ 搜索公式…    │         │    │FUNDAM.│       │                     │
│ └───────────────┘         │    ╰──────╯        │                     │
│                            ╰───────────────────╯                     │
│ ┌ 图例（可折叠）┐                                         ┌ + ┐    │
│ │星等 ● ● • · · │                                         │ − │    │
│ │猜想 ◌ ◐ ● ⊘ ⬭│                                         │ ⌂ │    │
│ └───────────────┘                                         └───┘    │
└────────────────────────────────────────────────────────────────────┘
```
选中后右侧滑出 `PANEL_W` 宽面板；缩放按钮随之左移。视口宽 < `SHEET_BREAKPOINT` 时面板改为底部抽屉（高 `SHEET_VH`）。
---

## §2 坐标系（实现于 `geo.js`，只许走这里换算）
- 世界坐标原点 = 天极 = 星图中心；y 向下；盘面半径 `R_DISK = 1000`。
- 极坐标 `(r, ra)`：ra 弧度，0 = 正上方，**逆时针**增加。`polarToWorld(r, ra) = {x: -r sin ra, y: -r cos ra}`。
- canvas 画弧：`ctx.arc(cx, cy, R, raToCanvas(ra0), raToCanvas(ra1), true)` 画出 ra0→ra1 的一段。
- 赤纬圈：`decToR(dec) = R_DISK*(90-dec)/90`，dec = 80,70,…,10 共 8 圈（盘缘 dec=0 由刻度环代替）。
- 视图 `view = {cx, cy, zoom}`：世界点 (cx,cy) 在画布中心；`zoom` = css px / 世界单位。
  `makeProjector(view, w, h)` → `{sx, sy, wx, wy, zoom, w, h}`。
- `zoom0 = min(w, h) / 2 - FIT_MARGIN` 除以 `FIT_RADIUS`（按整个视口算，不扣面板）。
- 语义级 `L = log2(zoom / zoom0)`，夹在 `[L_MIN, L_MAX]`。所有分级阈值都用 L。
  1600×1000 时 zoom0 ≈ 0.409，盘面直径 ≈ 818px。
- 区域网格：band b ∈ [0, REGION_BANDS) 覆盖 r ∈ [b·BAND_W, (b+1)·BAND_W)；该档 `regionCols(b)` 列（12/24/48）。
  `cellOf(x, y)`、`cellBounds(band, col)`。

---

## §3 布局（`layout.js`，纯函数，Node 下可跑）

### §3.1 星座排布
- `POLE_FAMILY = foundation` 占极冠；其余 7 族按 `RING_ORDER` 沿 ra 递增方向排成环。
  该顺序使相邻族之间的跨族关联数之和最大（scheme–cohomology 36、cohomology–modern 43、modern–intersect 33、
  intersect–curve 32、curve–birational 16、birational–map 28、map–scheme 26，共 214 / 588 条跨族定理关联）。
- 极冠半径 `rCap`：使极冠面积占比 = foundation 星数 / 定理总数（58/405 → rCap ≈ 378）。
- 环形扇区：族 f 的扇区角宽 = 2π · n_f / Σn_ring（按星数分配）；`RING_ORDER[0]` 扇区中心对准 ra = 0。
  这只是**初始化与软约束**，最终区域由 §3.3 从星的实际位置导出。

### §3.2 恒星位置（确定性力导向，种子 `seed = 20261031`）
1. 星等：定理按 importance 降序（同值按 id 字典序）排位，按 `MAG_CUTS` 累计比例切成 mag 1..6。
2. 初始化：每颗星用 `makeRng(seed ^ hashStr(id))` 在本族扇区（或极冠）内按**面积均匀**撒点（r = sqrt 采样），
   扇区两侧各内缩 4% 角宽，径向范围 [rCap+30, R_DISK-40]（极冠 [0, rCap-30]）。
3. 迭代 `ITER = 320` 次，步长从 1 线性冷却到 0.05，按节点数组固定顺序更新（确定性）：
   - 斥力：任意两星距离 d < 140 时 `F = k_rep · (140 - d) / 140`，k_rep = 6；
     硬间距 `dmin = 12 + 4·(6.5 - (magA+magB)/2)`（世界单位，亮星周围留更多标签空间），d < dmin 时直接各推开一半。
   - 弹簧：每条定理—定理关联，同族：静长 70，k = 0.02·weight；跨族：静长 160，k = 0.004·weight。
   - 约束：极冠星 r > rCap-20 时向内推；环星 r < rCap+20 向外推、r > R_DISK-30 向内推；
     环星 ra 超出本族扇区（容差 0.5° 内不管）时沿切向推回，力度 ∝ 越界角度。
4. 最终位置四舍五入到 0.01 世界单位（让 Node / 浏览器结果逐位一致）。

### §3.3 星座区域（IAU 式阶梯边界）
1. 对每个格 (band, col) 取其中心点，计算各族核密度 `Σ exp(-d²/(2·60²))`（d 为到该族各星的世界距离），
   归属密度最大的族；全部密度 < 1e-4 的格归属最近星的族。
2. 平滑：做 2 遍"多数票"滤波（4 邻域：同档左右 + 内外档覆盖重叠的格），票数 ≥ 3 才改。
3. 连通性：每族只保留最大连通块；其余碎块并入其最大邻族。
4. 收纳：任何不在本族格内的星，移到本族格中离它最近的格内点（格内缩 `REGION_INSET`）；
   然后再跑 40 次只含斥力 + "格内约束"的松弛，保证所有星都在本族区域内且距边界 ≥ REGION_INSET。
5. 边界：相邻两格（同档左右、或内外档）属于不同族时，它们的公共边是一段边界。
   同档相邻格的公共边是 ra 固定的径向线段；内外档的公共边是 r 固定的弧段（按两档中较细的列宽切分后比较）。
   共线且相邻、两侧族对相同的段合并成一条。盘缘不画边界（由刻度环代替）。

### §3.4 深空天体（猜想）位置
1. 初始：其**定理**邻居位置的 weight 加权平均 + `makeRng` 抖动 ±20。
2. 迭代 200 次：每条猜想—定理关联是弹簧（静长 45，k = 0.03·weight，与最强那个定理邻居的弹簧 k 再 ×2）；
   猜想—猜想关联弱弹簧（静长 90，k = 0.004·weight）；
   对恒星斥力：d < 26 时推开（只移动猜想）；对其他猜想：d < 30 时互推；r 限制在 [20, R_DISK-30]。
3. 猜想**不受**区域约束（深空天体常常跨在星座边界上，真实星图也如此）；`body.family` 取其所在格的族
   （`regionAt(atlas, x, y)`），只用于面板显示"位于××座"。
4. 档位 tier：importance ≥ DSO_TIER_CUTS[0] → 1，≥ [1] → 2，否则 3。

### §3.5 星座连线、星座名、研究者
- **星座连线**（每族一组）：取本族最亮的 `nFig = clamp(round(n_f · 0.2), 6, 14)` 颗星；
  候选边 = 这些星之间的**真实关联**，按 weight 降序、同权按长度升序做 Kruskal 生成森林；
  拒绝与已接受边相交（端点不共享时）的边、拒绝长度 > 360 的边。孤立的亮星不连。
- **星座名位置**：在本族的格中心里选得分最高者，得分 = 到最近星/深空天体的距离 − 0.35·到本族星质心的距离。
- **研究者角度**：关联节点角度的圆平均（权重 = link.weight · min(1, r/250)，靠近天极的节点角度不可靠，降权）；
  全部关联节点都在 r < 60 内时取其最近的环形族扇区中心。
  然后按角度排序，做 200 次一维松弛：相邻两名字的角距 < `(宽_i + 宽_j)/2 + 14` 对应的弧度（在 R_RES、参考缩放
  zoom0(1600×1000) 下换算）时互推；每个名字还有回到目标角的弹簧 k=0.05。名字宽度由调用方传入的
  `measure(text, font)` 给出（缺省按 CJK 字 = 1em、其他字符 0.55em 估算）。
  `anchorX/anchorY = polarToWorld(R_RES_TICK, raLabel)`（刻度起点，引导线从这里出发）。
### §3.6 输出数据结构 `Atlas`（契约核心，所有模块只读）
```js
Atlas = {
  seed: number,
  rCap: number,                       // 极冠半径（世界单位）
  sectors: { [family]: { ra0, ra1, raMid } },   // 环形族的初始扇区（弧度；ra1 可能 > 2π 表示跨 0）
  bodies: Map<id, Body>,              // 全部 488 个
  stars: Body[],                      // 405 个定理，按 mag 升序、同 mag 按 importance 降序、再按 id
  dsos: Body[],                       // 59 个猜想，按 tier 升序、importance 降序、id
  researchers: Body[],                // 24 个，按 raLabel 升序
  neighbours: Map<id, Array<{ id, weight, type, label, cross }>>,  // 每个节点的一跳邻居，weight 降序
  regions: { [family]: Region },      // 8 个
  cells: Array<Int8Array>,            // cells[band][col] = FAMILY_ORDER 下标（0..7）
  boundaries: BoundarySeg[],
  figures: { [family]: Array<[idA, idB]> },
  ms: number,                         // buildAtlas 耗时
}

Body = {
  id: string, node: object,           // node = graph 原始节点（name/en/latex/summary/... 从这里取）
  kind: 'star' | 'dso' | 'researcher',
  family: string,                     // star：本族；dso：所在区域的族；researcher：'researcher'
  x: number, y: number,               // 世界坐标。researcher：名字中心 = polarToWorld(R_RES, raLabel)
  mag: number,                        // star：1..6；dso：= tier + 1（2..4，供通用排序）；researcher：3
  tier: number,                       // dso：1..3；其他 0
  status: string | null,              // dso：open/partial/proved/disproved/heuristic；其他 null
  importance: number,
  labelL: number,                     // 公式标签开始参选的 L（star: MAG_LABEL_L[mag-1]；dso: DSO_LABEL_L[tier-1]；researcher: RES_LABEL_L）
  nameL: number,                      // 中文名行参选的 L = labelL + NAME_EXTRA_L（researcher：= labelL）
  formulaPx: number,                  // 公式显示字号（star: FORMULA_PX[mag-1]；dso: DSO_FORMULA_PX[tier-1]；researcher: 0）
  // 仅 researcher：
  raLabel?: number, raTarget?: number, anchorX?: number, anchorY?: number,
}

Region = {
  family: string, name: string, latin: string,   // name = FAMILIES[f].name，latin = FAMILY_LATIN[f]
  labelX: number, labelY: number,                // 星座名中心（世界坐标）
  bbox: { x0, y0, x1, y1 },                      // 区域包围盒（世界坐标），"飞到星座"用
  cellCount: number, starIds: string[],
}

BoundarySeg =
  | { kind: 'arc',    r: number,  ra0: number, ra1: number, a: family, b: family }   // ra0 < ra1，可 > 2π
  | { kind: 'radial', ra: number, r0: number,  r1: number,  a: family, b: family }
```

### §3.7 `layout.js` 导出
```js
export function buildAtlas(graph, opts = {}) → Atlas
//   opts.seed = 20261031；opts.measure = (text, font) => widthPx（研究者名字宽，缺省估算）；
//   opts.resFont = 研究者名字的 CSS font 串（main 传 `italic ${RES_PX}px ${FONT_SERIF}`，缺省同此）
export function regionAt(atlas, x, y) → family | null      // 盘外 null
```
- 耗时目标：浏览器内 < 400 ms。纯函数：不碰 DOM、不读时间以外的全局状态、不用 Math.random。
- 附带 `layout.check.mjs`（Node 脚本）：`node designs/atlas/layout.check.mjs` 断言
  ① 坐标全部有限 ② 每颗星在本族格内且距边界 ≥ REGION_INSET−0.5 ③ 星间距 ≥ 10 ④ 每族区域连通 ⑤ 两次运行结果逐位相同
  ⑥ 研究者名字相邻间距满足 §3.5 ⑦ 打印各族星数 / 格数 / 边界段数 / 连线数 / 耗时。

---

## §4 语义缩放分级（L 为横轴）

| L | 可见内容 |
|---|---|
| < −0.6 | 星点（小）、深空符号、星座边界、星座连线、星座名 |
| ≥ RES_LABEL_L (−0.6) | + 研究者名字 |
| ≥ −0.3 | + mag 1 定理公式（~20 条，避让后实际 ~8-12 条）+ tier 1 猜想公式 |
| ≥ 0.45 / 0.55 | + tier 2 猜想 / mag 2 定理公式 |
| ≥ 1.15 / 1.3 | + tier 3 猜想 / mag 3 |
| ≥ labelL + 0.9 | 该节点公式下方加中文名行 |
| 2.0 / 2.7 / 3.3 | + mag 4 / 5 / 6 公式 |
| 2.2 → 3.0 | 星座名从全显淡到 0（拉近后它只会挡字），淡完后退出避让 |
| 2.5 → 3.5 | 星座连线 alpha 从 1 降到 0.4 |

- 一个 body 的公式标签**参选**条件：`L ≥ labelL`；已显示的标签在 `L ≥ labelL − HYSTERESIS` 内保持参选。
  中文名行同理用 `nameL`。参选不等于显示：还要通过 §6 的避让。
- 星点半径 `bodyRadius(body, L)`（glyphs.js），随 L 缓慢放大（`glyphScale`）。
- 赤纬圈 / 赤经线在任何 L 下都画；L ≥ 2.5 时在每条赤纬圈与主赤经线的交点旁画赤纬度数小字（render 负责，
  不参与避让，alpha 0.5，字号 9.5px）。
---

## §5 渲染（`render.js`）

主画布只有一个。main.js 每帧在 `ctx.setTransform(dpr,0,0,dpr,0,0)` 之后依次调用：
`drawScene(ctx, frame)` → `drawLabels(ctx, frame)`（labels.js）→ `drawOverlay(ctx, frame)`。
`frame` 结构见 §8.1。render 不画任何参与避让的文字（星座名、研究者名、公式、中文名都归 labels.js）。

### §5.1 drawScene 图层顺序
1. 背景：`bgOuter` 满屏；盘外稀疏背景微星（种子固定，~300 颗，0.4–0.9px，alpha 0.15–0.35，**世界坐标**，
   分布在 R_SCALE_OUT+40 … 2.2·R_DISK 环带内，随平移移动）。
2. 盘面：r = R_DISK 的圆，径向渐变 `diskInner → diskOuter`。叠一层预生成的 256×256 噪声纹理（alpha 0.035，
   `createPattern`，屏幕空间平铺，模拟纸面颗粒；只生成一次）。
3. 坐标网：赤纬圈 dec=80..10（dec 30/60 用 `gridMajor`，其余 `grid`）；
   24 条赤经线从 decToR(80) 画到 R_DISK（0/6/12/18h 用 `gridMajor` 且从极点画起）；极点画 6px 小十字。
4. 刻度环：R_SCALE_IN 与 R_SCALE_OUT、R_SCALE_OUT+4 三个圆（`ring`，1px，外两圈形成双线）；
   在 R_SCALE_IN → R_SCALE_MID 之间画刻度：每 1° 短刻（长 = 0.35·(R_SCALE_MID−R_SCALE_IN)），每 5° 中刻（0.65），
   每 15°（= 1 小时）长刻（1.0）；刻度长按世界单位，屏幕长度 < 1.5px 时省略该级刻度。
   赤经时数字 "0ʰ" … "23ʰ"：`FONT_SERIF` `HOUR_PX`，`ringDim`，圆心在 R_HOUR_TEXT，切向旋转、下半圈翻转保持正立。
5. 星座区域铺底：只在选中节点（star）所在族、或悬停星座名时，用 `regionFocus` 填该族全部格（扇环路径）。
6. 星座边界：`boundaries` 全部，`boundary` 色、`[5,4]` 虚线。
7. 星座连线：`figures`，`figure` 色；alpha 乘 `figureAlpha(L)`（§4）；选中时非焦点族的连线再乘 `DIM.figure`。
8. 关联弧（仅当 `state.focus`）：对 focus.edges 每一条，从选中 body 画到 other：
   - 两端都不是研究者：二次贝塞尔，控制点 = 中点 + 法向偏移 `0.18·弦长`（向远离天极一侧弯）；
     颜色 kind='theorem' → `arcTheorem`，'conj' → `arcConj`；线宽 `0.8 + 1.6·weight`；alpha `0.35 + 0.55·weight`。
   - 研究者一端：从研究者 `anchorX/anchorY` 到星的直线虚线 `[3,3]`，`arcResearcher`，1px。
   - 生长动画：t = (now − focus.t0) / ARC_GROW_MS，弧按 t 截取（用 `setLineDash([len·t, len])` 或分段近似），
     第 i 条延迟 `min(i·18, 200)` ms；两端各缩进 bodyRadius+2px。
9. 研究者刻度：每位研究者在 raLabel 处画 R_RES_TICK → R_RES_TICK_END 的金色短刻度（1.2px）；选中 / 关联者 2px。
10. 深空天体：`dsos` 全部（视口外 20px 裁掉），`drawDso`，alpha = 选中且不在 focus 时 `DIM.glyph`。
11. 恒星：`stars` 按 mag 降序（暗星先画，亮星压在上面），`drawStar`；视口外裁掉；压暗同上用 `DIM.star`。
- 返回值 `animating: boolean`：弧生长未结束时为 true。

### §5.2 drawOverlay（在标签之上）
- 搜索命中：`state.searchHits` 前 30 个，各画一个 `searchHit` 色 1.2px 圆环（半径 bodyRadius+5），
  搜索后 1.2 s 内有一次向外扩散的脉冲（半径 +0→+14、alpha 1→0）。
- 悬停：hover 的 body 画 `reticle` 色 1px 圆环（半径 bodyRadius+4）。
- 选中：`reticle` 色准星 = 两个同心圆（bodyRadius+6、+10，后者 alpha 0.5）+ 四个方向各一道 5px 短刻。
  选中 body 在可视区外时，在可视区边缘（扣掉 occluders 里的 'panel'）画一个指向它的小三角箭头（8px）。
- 返回值 `animating`（脉冲期间 true）。

### §5.3 `render.js` 导出
```js
export function initRender(atlas) → void          // 生成背景微星、噪声 pattern 等一次性缓存
export function drawScene(ctx, frame) → boolean    // 返回是否还在动画
export function drawOverlay(ctx, frame) → boolean
export function figureAlpha(L) → number            // §4 的星座连线淡出曲线（labels 不用，图例可用）
```
性能：drawScene 在 1600×1000、dpr 1 下 < 4 ms（每帧整画；路径批量 beginPath/stroke，
同色同线宽的线合成一条 path；不要每颗星 save/restore 之外再建渐变 —— mag≤2 的柔光可预渲染成离屏小位图后 drawImage）。
---

## §6 标签：烘焙、参选、避让、渐隐（`labels.js` + `bake.js`）

### §6.1 标签种类
| kind | 内容 | 形状 | 颜色 |
|---|---|---|---|
| `formula` | 一个 star/dso 的公式位图，可带下方中文名行 | 轴对齐矩形 | INK_HEX / CONJ_HEX；名字 `inkName` / `conjName` |
| `const` | 星座名：中文（FONT_KAI CONST_PX，字间距 0.5em）+ 下方拉丁名（FONT_SERIF CONST_LATIN_PX，字间距 0.35em） | 轴对齐矩形，以 region.labelX/Y 为中心 | `constName` / `constLatin` |
| `researcher` | 研究者名（FONT_SERIF *italic* RES_PX），沿 R_RES 圆弧逐字排布，下半圈翻转保持正立 | 有向矩形（弦方向，宽 = 文字宽，高 = RES_PX·1.3） | `researcher` |

研究者名用 `node.name`（中文名的就是中文，如 "朱歆文"）。中文名行用 `node.name`；
所有文字绘制都先 `strokeText`（`labelHalo`，lineWidth 3，lineJoin round）再 `fillText`，形成晕边。

### §6.2 烘焙（`bake.js`）
公式位图按**最终显示尺寸**烘焙一次（标签字号是屏幕常数，不随缩放变），不做尺寸分档。
```js
export function requestBake(id, priority) → void   // priority 越小越先；重复调用取较小值；已完成则无操作
export function getBake(id) → Bake | null           // 完成才返回
export function pumpBakes(budgetMs = BAKE_BUDGET_MS) → boolean   // main 每帧调；返回"还有未完成的"
export function bakeStats() → { done, queued, decoding, failed, ms }
export function setBakeDpr(dpr) → void              // dpr 变化时清空并重排已请求的条目
Bake = { canvas: HTMLCanvasElement, w: number, h: number, pad: number, px: number }
//   w/h = css px 尺寸（含 2·pad），canvas 像素 = round(w·dpr) × round(h·dpr)
```
烘焙流程（每个 id）：
1. `texSync(latex, hex)`，hex = node.cluster ? CONJ_HEX : INK_HEX（选中高亮不重新烘焙，靠叠画实现）。
2. 显示字号 `px = body.formulaPx`；宽 `= widthPx · px/64`；若 > LABEL_MAX_W，`px = max(FORMULA_MIN_PX, px·LABEL_MAX_W/宽)`；
   仍超出则按比例缩到 LABEL_MAX_W。
3. SVG → Blob URL → `<img>` → `await img.decode()`（并发上限 BAKE_CONCURRENCY）→ 画进离屏 canvas：
   先 `shadowColor = labelHalo, shadowBlur = 3·dpr` 画两遍（形成晕边），再无阴影画一遍。四周留 `BAKE_PAD`。
   `URL.revokeObjectURL`。
4. texSync 失败或解码失败：记为 failed，`getBake` 返回 null，labels 对它退化为只显示中文名（不抛）。
5. pumpBakes 每帧最多花 budgetMs 做 texSync（同步部分），按 priority 出队。

### §6.3 参选与优先级（`updateLabels` 每帧）
从高到低依次尝试放置；高优先级的先占位：
1. **选中** body 的公式 + 中文名（强制显示：即使碰撞也放，但仍按候选锚点挑碰撞最少的）。
2. **悬停** body 的公式 + 中文名（不强制，但跳过 L 阈值）。
3. **星座名**（L < CONST_FADE_L1 时）。选中时 alpha × DIM.constName。
4. 选中时：focus.edges 中前 24 个邻居（不论 L）；**研究者**名字（L ≥ RES_LABEL_L；选中时非关联者 alpha × DIM.researcher）。
5. 搜索命中前 12 个（不论 L）。
6. 其余 star/dso：参选者（§4）按 importance 降序、mag 升序、id。**选中时跳过这一级**（压暗 = 其他标签隐藏）。

候选只考虑屏幕位置在视口外扩 80px 内的 body。研究者名字在第 4 级（选中时）或第 3 级之后（未选中时）放置。
中文名行：显示条件 = L ≥ nameL（带滞回）或该 body 是选中 / 悬停 / 焦点邻居。

### §6.4 盒子几何与候选锚点
body 屏幕位置 (bx, by)、半径 r = bodyRadius(body, L)，g = LABEL_GAP。
公式盒 F（w_f × h_f，来自 Bake，扣除 pad 后的视觉尺寸再加 pad 绘制）；名字行 N（宽 = measureText，高 = NAME_PX·1.25），
标签盒 = F 在上、N 在下、间距 NAME_GAP，整体宽 W = max(w_f, w_n)，高 H。
锚点（盒左上角）与对齐：
- `E`：x = bx + r + g，y = by − H/2，左对齐（F、N 都靠左）
- `W`：x = bx − r − g − W，右对齐
- `NE`：x = bx + r·0.7，y = by − r·0.7 − H − 1，左对齐
- `NW`：x = bx − r·0.7 − W，同上 y，右对齐
- `SE` / `SW`：同 NE/NW 但 y = by + r·0.7 + 1
- `N`：x = bx − W/2，y = by − r − g − H，居中
- `S`：x = bx − W/2，y = by + r + g，居中
尝试顺序 `[上一帧的锚点, E, W, NE, NW, SE, SW, N, S]`（去重）。
无 Bake 时（还没烘焙完）：该 body 本帧不放公式，只在 L ≥ nameL 时放中文名；同时 `requestBake(id, 0)`。

### §6.5 碰撞规则（一个候选盒被接受，当且仅当）
1. 不与已放置的任何标签盒相交（外扩 LABEL_PAD；研究者有向盒用 SAT 判定）。
2. 不与任何 occluder 矩形相交（`state.occluders`），且完全在视口内（四周留 4px）。
3. 不覆盖"障碍圆"：所有已放置标签所属 body 的星点（半径 r+2），以及视口内全部 mag ≤ 2 恒星和 tier 1 深空天体（半径 r+2）——
   自己的星点除外。
4. 用一个 64px 的均匀网格做空间哈希加速；每帧重建。

### §6.6 渐隐渐现与状态
- 每个标签有 `alpha`：目标为 1（本帧被放置）或 0；按 FADE_IN_MS / FADE_OUT_MS 线性逼近（reducedMotion 时直接跳到目标）。
- 淡出中的标签**不占位**，记住相对其 body 的偏移，随 body 移动。被新放置标签覆盖的淡出标签以 3 倍速度淡出。
- `updateLabels` 返回 `animating`（有任一 alpha 未到目标，或仍有 bake 在等）。

### §6.7 `labels.js` 导出
```js
export function initLabels(atlas) → void
//   为每个 star/dso 按 priority = labelL·100 − importance·10 调 requestBake（L 越低越先烘）
export function updateLabels(frame) → boolean        // 参选 + 避让 + 渐隐；返回 animating
export function drawLabels(ctx, frame) → void        // 画全部 alpha > 0 的标签
export function hitLabel(sx, sy) → { kind:'body', id } | { kind:'constellation', family } | null
//   命中已显示（alpha ≥ 0.5）的标签盒：点公式或中文名 = 选中该 body；点星座名 = 飞到该星座
export function labelStats() → {
  visibleLabels: number,       // alpha ≥ 0.5 的标签数（全部种类）
  overlappingLabels: number,   // 本帧已放置标签盒两两相交的对数（含研究者有向盒），必须为 0（强制显示的选中标签除外，单列）
  forcedOverlaps: number,      // 选中标签强制放置造成的相交数
  formulas: number, names: number, constellations: number, researchers: number,
  pendingBakes: number,        // 本帧想放但还没烘焙好的公式数
}
export function labelBoxes() → Array<{ kind, id, x, y, w, h, alpha }>   // 调试 / 评审用（css px）
```
---

## §7 交互（`main.js` + `camera.js` + `input.js` + `hash.js`）

### §7.1 相机
- 平移：指针拖拽（pointer events + setPointerCapture），移动 > 4px 才算拖拽（否则是点击）。松手时按最后 80ms 速度做惯性，
  每帧速度 × 0.92，< 0.02 px/ms 停止（reducedMotion 时无惯性）。
- 滚轮：以光标为锚缩放，`factor = exp(−deltaY · k)`，k = 0.0015（deltaMode=1 时 deltaY×16）；ctrlKey（触控板捏合）k ×4。
  `preventDefault`（listener `{passive:false}`）。
- 双指：两指中点为锚，按两指距离比缩放，同时随中点平移。
- 双击：以光标为锚放大 2×（`L+1`），Shift+双击缩小，飞行 260ms。
- 夹紧：L ∈ [L_MIN, L_MAX]；视图中心离原点不超过 `FIT_RADIUS`（拉远时可以看到全盘，但不能把盘拖出视口）。
- **可视区中心**：右侧面板打开时（`state.occluders.get('panel')`，桌面）为 `(w − panel.w)/2`；底部抽屉时为 `(h − sheet.h)/2`。
  `flyTo` / `select` 居中都按可视区中心算，而不是画布中心。
- `flyTo(target, {ms})`：L 与中心插值；时长 `clamp(FLY_MIN_MS + 180·|ΔL| + 0.6·屏幕距离px, FLY_MIN_MS, FLY_MAX_MS)`；
  `easeInOutCubic`；L 线性插值、中心按 zoom 的对数插值修正（先拉远再拉近的"飞行"感：若屏幕距离 > 1.2·视口宽，
  中途 L 先降 0.8）。用户任何拖拽 / 滚轮立即中断飞行（Promise 仍 resolve）。reducedMotion：瞬移。
  target：`{cx, cy, L}`、`{id}`（居中到该 body，L = `max(当前 L, min(FLY_MAX_L, body.nameL + FLY_EXTRA_L))`；
  研究者：居中到其名字与其关联节点的包围盒中心，L 使该包围盒装进可视区）、`{family}`（装下 region.bbox）。

### §7.2 指针与键盘
- 悬停：`pick(sx, sy)` 每次 pointermove（拖拽中不做）；变化时 `state.hover` 更新并 `emit('hover', {target, sx, sy})`；
  光标在可选目标上为 `pointer`，拖拽中为 `grabbing`，否则 `grab`。
- `pick(sx, sy)` 顺序：① `hitLabel`（标签盒）② body：屏幕距离 ≤ max(bodyRadius+4, 9) 的最近者（研究者按名字有向盒 + 刻度）
  ③ null。
- 单击（非拖拽）：命中 body → `select(id)`；命中星座名 → `flyTo({family})`；空白 → `deselect()`。
- 键盘：`Esc` 依次 = 关闭搜索下拉 / 取消选中；`/` 或 `Ctrl+K` 聚焦搜索框；`+`/`=` 放大，`-` 缩小，`0` 复位；
  方向键平移 80px。搜索框获得焦点时，除 Esc 外的快捷键不生效。
- 选中：`state.selected = id; state.focus = computeFocus(atlas, id, now)`，`emit('select', id)`，
  默认 `flyTo({id})`；`requestBake(id, -1)` 及其前 24 个邻居 `requestBake(nb, 0)`。
- 取消选中：`selected = null; focus = null`，`emit('select', null)`；视图不动。

### §7.3 深链（`hash.js`）
格式：`#n=<encodeURIComponent(id)>&v=<cx>,<cy>,<L>`，cx/cy 取整，L 保留 2 位小数；两段都可省略。
- `decodeHash(str) → { node?: string, view?: {cx, cy, L} }`：**永不抛**；未知字段、非有限数、不存在的 id 一律忽略。
- `encodeHash({node, view}) → string`（不含 '#'）。
- 选中变化：`history.pushState`（便于后退返回）；视图变化：防抖 HASH_DEBOUNCE_MS 后 `history.replaceState`。
- 启动：有 `v` 用之，否则全图适配；有 `n` 则选中（不飞行，若无 `v` 则直接 setView 到 `{id}` 的目标）。
- `popstate` / `hashchange`：重新解析并应用（不 push）。
---

## §8 运行时契约（main.js 与各模块之间）

### §8.1 每帧的 `frame` 对象（main 构造，传给 updateLabels / drawScene / drawLabels / drawOverlay）
```js
frame = {
  now: number,                 // performance.now()
  dt: number,                  // 距上一帧 ms（首帧 16）
  w: number, h: number, dpr: number,   // 画布 css 尺寸与像素比
  view: { cx, cy, zoom },      // 本帧相机（只读）
  L: number,                   // 语义级
  P: Projector,                // makeProjector(view, w, h)
  atlas, graph,                // 同 state
  selected: string | null, focus: FocusInfo | null,
  hover: state.hover,          // 见 state.js
  searchHits: string[], searchT0: number,   // 搜索结果与发起时间（脉冲动画用）
  occluders: Array<{x,y,w,h}>, // state.occluders 的值数组（css px）
  reducedMotion: boolean,
}
```
`FocusInfo` 与 `computeFocus` 见 state.js（`{ id, t0, ids:Set, edges:[{other, weight, kind, type, label}] }`）。

### §8.2 共享状态 / 事件 / 动作
全部定义在 `state.js`（冻结，读源码注释）。要点：
- `state` 只有 main.js 写；例外：任何模块可写 `state.dirty = true`；`actions.setOccluder` 写 `state.occluders`。
- 事件：`ready`、`select(id|null)`、`hover({target,sx,sy}|null)`、`view(view)`、`search({query,hits})`、`resize({w,h})`。
- 动作（main 填充）：`select(id, {fly=true, push=true}) → Promise`、`deselect()`、`hoverPreview(id|null)`、
  `search(query) → id[]`、`flyTo(target, {ms}) → Promise`、`zoomBy(factor, sx?, sy?)`、`resetView()`、
  `setOccluder(name, rect|null)`、`requestDraw()`。
- main 另外在 state 上维护 `state.searchT0`（最近一次搜索的 now）。

### §8.3 渲染循环（main.js）
```
loop(now):
  若 state.dirty 或 上一帧 animating 或 相机在飞行/惯性 或 bench 模式：
    frame = makeFrame(now)
    a1 = updateLabels(frame)
    ctx.setTransform(dpr,0,0,dpr,0,0); ctx.clearRect(0,0,w,h)
    a2 = drawScene(ctx, frame); drawLabels(ctx, frame); a3 = drawOverlay(ctx, frame)
    animating = a1 || a2 || a3; state.dirty = false
  b = pumpBakes(BAKE_BUDGET_MS)；若本帧有 bake 完成 → state.dirty = true
  requestAnimationFrame(loop)
```
就绪判定：atlas 建好 + 首帧已画 + `labelStats().pendingBakes === 0`（或已过 2500 ms）→ `state.ready = true`，`emit('ready')`，
`window.__design.ready = true`。

### §8.4 调试句柄 `window.__design`（main.js 实现）
```js
window.__design = {
  ready: boolean,
  graph, atlas,
  select(id) → Promise<void>          // 同 actions.select(id)，await 到飞行结束 + 下一帧画完
  deselect() → void
  search(query) → string[]            // 同 actions.search，返回命中 id
  view() → { cx, cy, zoom, L, w, h, selected, hover: id|null, panelOpen: boolean, searchQuery }
  setView({ cx?, cy?, zoom?, L?, id?, family?, animate = false }) → Promise<void>
      // L 与 zoom 二选一（同时给以 L 为准）；id / family 等价 flyTo；animate=false 时瞬移并画完一帧再 resolve
  stats() → { ...labelStats(), fps, frameMs, bakes: bakeStats(), layoutMs: atlas.ms, nodes: 488, bodiesOnScreen }
      // fps = 最近 60 个**实际绘制**帧的平均；frameMs = 最近 60 帧绘制耗时平均
  screenOf(id) → { x, y, r, visible } | null   // body 当前屏幕坐标（css px）
  pick(x, y) → { kind, id?, family? } | null   // 同 input 的 pick
  labels() → labelBoxes()
  bench(ms = 2000) → Promise<{ fps, frameMs, p95 }>   // 强制连续重画（期间缓慢平移）测帧率
}
```

---

## §9 详情面板与悬停提示（`panel.js` + `tooltip.js` + `panel.css`）

### §9.1 面板（`<aside id="atlas-panel">`）
桌面：右侧 `PANEL_W` 宽、全高，`transform: translateX(100%)` → 0 滑入（220ms ease-out）；背景 `rgba(8,14,28,0.94)` +
`backdrop-filter: blur(6px)`，左边一道 1px 金线 `rgba(201,168,106,0.35)`。窄屏：底部抽屉，高 `SHEET_VH·100vh`，圆角 12px，
顶部有一道抓手条。打开时 `actions.setOccluder('panel', rect)`，关闭时 `setOccluder('panel', null)`；
同时给 `<body>` 加 / 去 class `atlas-panel-open`（chrome.css 据此左移缩放按钮）。
内容（自上而下，全部用 DOM/textContent 构造，粗体走 md.js）：
1. 眉题：定理 `恒星 · mag 2 · 上同调座`；猜想 `深空天体 · 仍未解决`（状态名 + `glyphCanvas` 状态符号）；研究者 `研究者 · 机构`。
2. 标题：`node.name`（FONT_SERIF 24px），下一行 `node.en`（斜体，dim）。右上角关闭按钮 ×（`aria-label="关闭"` → `actions.deselect()`）。
3. 公式：KaTeX `displayMode: true, throwOnError: false`，容器横向可滚动；研究者无此块，改为 `focus` 研究方向一段。
4. 元数据 `<dl>`：
   - 定理：星座（族名 + 拉丁名）、星等 mag、重要度（0–1，两位小数）、关联数 degree。
   - 猜想：状态（名 + `CONJECTURE_STATUS[s].hint`）、领域（`CONJECTURE_FIELDS[field].name`）、提出者、年份、所在星座（body.family）。
   - 研究者：机构、领域（`RESEARCHER_AREAS` 若有对应项，否则 field 原文）。
5. 简介 `summary`（inlineMd）；正文 `detail`（inlineMd，按 `。` 不分段，原样一段；超过 6 行可折叠"展开全文"）。
6. 研究者：代表作列表 `representativeWorks`：标题（`<a href=url target=_blank rel="noopener noreferrer">`，url 只接受 http/https）、年份、note。
7. 关联列表：按 定理 / 猜想 / 研究者 分组（组标题带数量），每项：`glyphCanvas` + 中文名 + 关系类型 `typeLabel(type)` 小标签 + `label` 关系说明（dim，一行截断）。
   按 weight 降序。悬停 → `actions.hoverPreview(id)`，离开 → `hoverPreview(null)`；点击 / Enter → `actions.select(id)`。
   每项是 `<button>`，可 Tab 聚焦。
8. 页脚：「在原星云中打开 ↗」链接 `nebulaLink(id)`（新标签页）；「复制此视图链接」按钮（复制 `location.href`）。
- 切换选中时面板内容替换并滚回顶部；KaTeX 渲染结果按 id 缓存。

### §9.2 悬停提示（`#atlas-tooltip`）
`hover` 事件且 `target.source === 'map'` 且非触屏时显示。内容：眉题（同面板第 1 项缩写）、中文名、KaTeX 公式（研究者为机构），
星座目标显示 `星座名 · 拉丁名 · N 颗星`。位置：指针右下 14px，越界则翻到左 / 上；`pointer-events: none`；淡入 120ms；
悬停稳定 80ms 后才出现，`hover(null)` 立即隐藏。背景同面板、最大宽 360px。

### §9.3 导出
```js
// panel.js
export function initPanel(el /* #atlas-panel */) → void      // 订阅 'select'；自管 DOM 与 occluder
// tooltip.js
export function initTooltip(el /* #atlas-tooltip */) → void  // 订阅 'hover'、'select'（选中时隐藏）
```
（研究者的 `field` 键与 `RESEARCHER_AREAS` 的键相同，如 `ag` → 代数几何；猜想的 `field` 用 `CONJECTURE_FIELDS`。）

---

## §10 外框：标题、搜索、图例、缩放按钮（`chrome.js` + `search.js` + `chrome.css`）

### §10.1 标题框（`#atlas-title`，左上 20px）
双金线边框（外 1px `rgba(201,168,106,0.55)`，内缩 3px 再一道 0.5px），四角各一个小菱形装饰（CSS 伪元素）。
- 第一行「公式星图」FONT_KAI 26px，字间距 0.3em，`#e8d3a2`。
- 第二行「ATLAS COELESTIS · FORMULARUM」FONT_SERIF 10.5px，字间距 0.32em，`ringDim`。
- 第三行统计：`405 恒星 · 59 深空天体 · 24 研究者 · 1670 关联`（数字从 graph 实算），FONT_SANS 11.5px dim。

### §10.2 搜索（`#atlas-search`，标题框正下方，宽同标题框 ≥ 300px）
- `<input type="search">`，placeholder「搜索公式、名称或 family:curve status:open …」，`aria-controls` 指向结果列表。
- 输入防抖 120ms → `actions.search(q)`；结果由 'search' 事件回来再渲染（这样 `__design.search` 也会更新列表）。
- 下拉列表 `role="listbox"`：前 12 条，每条 `glyphCanvas` + 中文名 + 英文名（dim）+ KaTeX 小公式（单行、溢出渐隐）；
  底部「共 N 条 · ↑↓ 选择 · Enter 定位」。查询有语法错误时显示 `error`（朱红小字）。
- ↑/↓ 移动高亮（同时 `actions.hoverPreview(id)`），Enter = 选中高亮项（无高亮则第一项）并收起列表；Esc = 收起列表，
  再按 Esc 清空输入；点击项 = 选中。失焦 150ms 后收起。清空输入 → `actions.search('')`。

### §10.3 图例（`#atlas-legend`，左下 20px，可折叠，默认展开；窄屏默认折叠）
- 标题「图例 · LEGENDA」+ 折叠按钮。
- 星等：6 个 `glyphCanvas({kind:'star', mag})` 横排，下方 `1 … 6`，旁注「定理 · 星等 = 重要度」。
- 深空天体：5 种状态符号 + `CONJECTURE_STATUS[s].name` + 数量（实算；数量为 0 的也列出）。
- 线型：用小 canvas 画——星座连线（实线）、星座边界（虚线）、关联弧（金 / 朱）、研究者引导线（蓝虚线）各一行。
- 底部一行动态提示：`当前显示到 mag ≤ k 的公式`（k = 满足 MAG_LABEL_L[k−1] ≤ L 的最大 k；L 太小为「仅星点」），订阅 'view'。

### §10.4 缩放按钮（`#atlas-zoom`，右下 20px，竖排）
`+`（zoomBy(2)）、`−`（zoomBy(0.5)）、`⌂`（resetView，title「全图」）。`body.atlas-panel-open` 时 `right: PANEL_W + 20px`
（窄屏抽屉时改为 `bottom: SHEET_VH·100vh + 16px`）。按钮 36×36，背景同面板、金线边框。

### §10.5 遮挡区与首次提示
chrome 在初始化和 `resize` 时对 title / search（含展开的下拉）/ legend / zoom 各调 `actions.setOccluder(name, rect)`
（name 分别为 'title' 'search' 'legend' 'zoom'；rect 用 getBoundingClientRect）。
首次加载 2 s 后底部居中出现一行提示「滚轮缩放 · 拖拽平移 · 点击星辰查看」，任何交互（'view'/'select' 事件）后淡出。

### §10.6 搜索排序（`search.js`）
```js
export function rankSearch(graph, query) → { ids: string[], error?: string, structured: boolean }
```
- 去首尾空白后为空 → `{ ids: [], structured: false }`。
- 含 `:`、`(`、` OR `、或以 `-` 开头 → 结构化：`parseQuery(q)`，命中节点按 importance 降序、id；带 error 原样返回。
- 否则自由文本（不区分大小写），每个节点取最高分：name/en 完全相等 100；id 完全相等 95；name/en 前缀 80；
  name/en 子串 60；id 子串 50；latex 子串 35；族名（FAMILIES[f].name 或 FAMILY_LATIN）完全相等或前缀 → 该族所有定理 40。
  多个空格分隔的词：每个词都必须命中（取各词分数之和）。同分按 importance 降序、id。
- 纯函数，Node 下可测。

### §10.7 导出
```js
// chrome.js
export function initChrome({ title, search, legend, zoom } /* 四个元素 */) → {
  focusSearch(): void,          // '/' 与 Ctrl+K 调用
  closeSearch(): boolean,       // 收起下拉；原本是展开的返回 true（main 的 Esc 先调它，返回 false 才 deselect）
}
```
---

## §11 文件与模块划分（每个文件只有一个主人）

| 模块 | 独占文件 | 依赖的接口 |
|---|---|---|
| 冻结（架构师） | `index.html` `constants.js` `geo.js` `state.js` `glyphs.js` `SPEC.md` | — |
| M1 布局 | `layout.js` `layout.check.mjs` | kb.js、constants、geo |
| M2 渲染 | `render.js` | Atlas（§3.6）、frame（§8.1）、glyphs、geo、constants |
| M3 标签 | `labels.js` `bake.js` | Atlas、frame、glyphs.bodyRadius、tex.js、state（occluders 经 frame） |
| M4 面板 | `panel.js` `tooltip.js` `panel.css` | state/on/actions、glyphs.glyphCanvas、kb.js、md.js、katex |
| M5 外框 | `chrome.js` `search.js` `chrome.css` | state/on/actions、glyphs、kb.js（parseQuery、FAMILIES、CONJECTURE_STATUS）、katex、render.figureAlpha（可选） |
| M6 编排 | `main.js` `camera.js` `input.js` `hash.js` `atlas.css` | 以上全部的导出 |

- 每个模块的文件在脚手架阶段都已有**可运行的桩**（满足导出签名、行为最简），页面从一开始就能打开。
  建造者直接**覆盖**自己的文件；在别人的桩之上验证自己的部分即可。
- 不得修改别人的文件。若发现契约缺陷，在交付说明里写明，用最小的本地变通（例如在自己模块里防御性处理）。
- CSS：`atlas.css`（M6）只管页面骨架（html/body 全屏、画布、`#atlas-ui` 层的 pointer-events、可访问性工具类）；
  `panel.css`（M4）只写 `#atlas-panel` `#atlas-tooltip` 及其后代；`chrome.css`（M5）只写 `#atlas-title` `#atlas-search`
  `#atlas-legend` `#atlas-zoom` `#atlas-hint` 及其后代和 `body.atlas-panel-open #atlas-zoom`。
- `katex` 的 CSS 由 panel.js 与 chrome.js 各自 `import 'katex/dist/katex.min.css'`（Vite 去重）。

### §11.1 DOM 骨架（index.html，冻结）
```html
<canvas id="atlas-canvas" aria-label="公式星图：405 条定理、59 个猜想与 24 位研究者" role="img"></canvas>
<div id="atlas-ui">
  <header id="atlas-title"></header>
  <div id="atlas-search"></div>
  <section id="atlas-legend"></section>
  <div id="atlas-zoom"></div>
  <div id="atlas-hint"></div>
  <aside id="atlas-panel" aria-hidden="true"></aside>
  <div id="atlas-tooltip" role="tooltip" aria-hidden="true"></div>
  <div id="atlas-live" class="sr-only" aria-live="polite"></div>
</div>
```
`#atlas-ui` 铺满视口且 `pointer-events: none`，其直接子元素各自 `pointer-events: auto`（tooltip 除外）。
main.js 选中时把「已选中：<name>」写入 `#atlas-live`。chrome 的 initChrome 额外接收 `hint: #atlas-hint`。

### §11.2 截图验证
`cd "/d/xiangmu/Formula Nebula" && node designs/shot.mjs http://localhost:5190/designs/atlas/ shots/designs/atlas/<name>.png --wait "window.__design && window.__design.ready" --port <你的端口> [--eval ...]`
端口：架构师 9500，M1 9501，M2 9502，M3 9503，M4 9504，M5 9505，M6 9506（各自独占，绝不混用）。
截图文件名以模块名开头（如 `render-overview.png`），截完用 Read 打开亲眼看。

---

## §12 验收标准（评审代理会逐条检查）
1. 1600×1000 首屏 < 3 s 出图（`__design.ready`）；控制台无异常。
2. 总览（L=0）：看得出 8 个星座区域（边界、星座名）、星座连线、约 8–15 条可读公式、24 位研究者名字。
3. `stats().overlappingLabels === 0` 在任意 L（−1.2 … 5）与任意选中状态下成立。
4. 拉近到 L=3：局部区域的大部分星都有公式，L ≥ nameL 的带中文名，互不重叠。
5. 选中任一节点：关联弧浮现（生长动画），其余压暗，面板显示完整信息，关联项可点跳转；Esc 取消。
6. 488 个节点都能通过搜索找到并选中（`__design.search(id)` 第一项即该 id）。
7. 深链：`#n=cn-hodge` 打开即选中 Hodge 猜想；`#v=…` 复现视图；坏 hash 不报错。
8. 交互帧率：`__design.bench()` 在真实浏览器 ≥ 55 fps（headless SwiftShader 下仅作参考）。
9. 所有数据文本经 textContent / md.js；无星号原样显示；无网络请求到外部域。
