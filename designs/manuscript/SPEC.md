# 公式诗稿 · Formula Manuscript — 设计与模块契约（方案 D）

页面：http://localhost:5190/designs/manuscript/　　截图：shots/designs/manuscript/　　CDP 端口段 9700–9709

整个知识库排成**一册摊开在书桌上的手稿**：10 张纸页按 5×2 铺开 —— 卷首、八章、卷末题跋。
定理是印刷体"诗句"（深墨 MathJax），猜想是页边蓝黑墨手书的"未解之问"，研究者是题跋页上的朱印署名，
关联是铅笔批注线；选中的条目被朱墨圈出。Canvas 2D 单画布 + DOM 外壳，原生 ES modules。

**冻结文件**（架构师所有，建造者只读；发现缺陷请在交付说明里提出，不要改）：
`index.html`、`state.js`、`constants.js`、`geom.js`、`SPEC.md`。
设计常量以 `constants.js` 为准，本文引用常量名；两者冲突时以 `constants.js` 为准。

---

## §0 原星云的问题 → 本方案的回答

| 问题 | 手稿的回答 |
|---|---|
| 总览公式读不出 | 正投影无倾斜；字号阶梯让每章**题记**（最重要的一条公式，大字）在全卷视图就可读；其余诗句在远处是整齐的"灰行"（真实公式的缩略位图，像远看一页书），不是噪点 |
| 拉近后公式叠压 | 所有文字在**世界坐标**里排版且互不相交（layout 自检），渲染是均匀缩放 → 屏幕上永不重叠；`stats().overlappingLabels` 每帧实测 |
| 族混排、颜色像胡椒盐 | 一族 = 一章 = 一张纸，族靠**位置与章题**表达；整卷只用墨、朱、铅三色 |
| 连线隐藏，结构不可见 | 全卷视图：章与章之间的铅笔"丝线"（聚合关联数）；章节视图：栏内左侧的铅笔弧（同栏关联，像诗的韵脚标记）；选中：全部一跳关联用铅笔线拉出来 |
| 3D 操作成本高 | 2D 平移缩放 + 书签栏跳章 + 键盘逐句阅读（←/→） |
| 猜想星团的硬圆弧 | 不存在星团：59 个猜想分散成各章页边批注，紧挨着它们依赖的定理 |

---

## §1 视觉语言

### §1.1 配色（`PALETTE`，constants.js）
- 书桌 `desk` / `deskDeep`（纸页之外，暖灰褐，带细木纹/亚麻纹），纸 `paper`，纸边泛黄 `paperEdge`，纸影 `paperShadow`。
- 印刷墨 `ink`（公式、章题、正文）≈16:1；`ink2` 次级（诗句名称、段落）；`ink3` 三级（行号、页眉、拉丁副题、页码）≥4.5:1。
- 朱墨 `rubric`：章号、首字、诗节号、选中圈注、页码装饰。**朱色只用于"版式"与"当前选中"**，不用于数据分类。
- 铅笔 `pencil`（关联线、批注小字）/ `pencilSoft`（栏内弧、丝线）。
- 页边手书 `noteInk`（猜想名与猜想公式）/ `noteInk2`。
- 荧光笔 `highlight`（检索命中，粗糙的黄色涂抹）。朱印 `seal` / `sealText`。版框细线 `rule`。
- 猜想状态的符号色在 `STATUS_GLYPH[*].color`（五种暗色墨，不是霓虹色）。

### §1.2 字体（`FONTS` + `fontCss()`）
系统字体，不加载网络字体。`serif`（Georgia → 思源宋体/宋体）：章题、正文、名称；`hand`（Segoe Print → 楷体）：页边手书、铅笔批注字、署名；
`italic`（Georgia Italic）：拉丁副题、行号、页码、页眉。**layout 量宽与 render 绘制必须都用 `fontCss(family,size,weight,style)`**。
不对楷体用 italic（会合成假斜体）。

### §1.3 字号阶梯（世界 px，zoom=1 时即 CSS px；全卷适配 zoom ≈ 0.12–0.15）
| 角色 | 世界字号 | 全卷视图(z≈0.13)屏幕 | 说明 |
|---|---|---|---|
| 卷首大题「公式诗稿」 | 260 | ~34px | serif 600 |
| 章号（罗马数字，朱） | 120 | ~16px | serif 400 |
| 章题（中文） | 150 | ~20px | serif 600 |
| 拉丁副题 | 52 | ~7px（灰行→近看可读） | italic |
| 首字 drop cap（朱） | 3 行高 ≈ 150 | ~20px | serif 600 |
| 导言正文 | 34，行距 1.75 | 灰行 | serif |
| 题记公式（epigraph） | em = 64×scale ≈ 80–96 | ~11–12px 可读 | 每章 1 条 |
| 诗节号「其一 · ……」 | 30（朱） | 灰行 | serif |
| 核心诗句（每诗节首句） | em ≈ 40 | ~5px（灰行，z≥0.23 可读） | |
| 普通诗句 | em ≈ 22–30（随章填充系数） | 灰行（z≥0.35 可读） | |
| 诗句名称 | 22–24（核心 26，600） | 灰行 | serif，ink2 |
| 行号（每 5 行） | 15 | 隐藏 | italic，ink3 |
| 页边批注名 | 22 | 灰行 | hand，noteInk |
| 页边批注公式 | em ≈ 15–20 | 灰行 | noteInk |
| 研究者署名 | 40 | ~5px | hand |
| 页眉 / 页码 | 22 / 28 | 隐藏/灰行 | italic，ink3 |

精确数值由 layout.js 自定（它私有的常量），但**相对大小关系必须保持**：题记 > 核心 > 普通 > 页边。

### §1.4 线与符号
- 铅笔线宽：屏幕 1.1–1.6px，`pencil`，alpha 0.55–0.8；栏内弧 0.9px `pencilSoft`。笔画是**确定性抖动**的手绘曲线（seed = 关联 key），帧间不闪。
- 关系类型不用颜色，用**笔法** `LINK_STROKE[type]`：solid 单线 / double 双线（等价）/ arrow 末端手绘箭头（蕴含、推广、依赖：方向 source→target）/ dashed（类比）/ dotted（同族、出处）/ wavy 波浪（对比）。
- 猜想状态手写符号 `STATUS_GLYPH`：`?` open、`½` partial、`✓` proved、`✗` disproved、`~` heuristic，hand 字体，各自的墨色。
- 页边批注的引用记号：小写字母 a, b, c…（每页从 a 开始，按批注自上而下）——在被批注的诗句名称后以上标出现（朱墨），批注前同样有该字母。像真实的旁注体例。
- 研究者朱印：方形、边缘轻微残缺的朱色印章，印文 = `FIELD_SEAL[field]`（几/数/拓/代/析/逻）。
- 选中：朱墨双圈椭圆（两笔略错开，起笔留头）；关联项：铅笔单圈；搜索命中：荧光笔涂抹在条目下方。
- 装饰：章末 tailpiece（❦ 或程序绘制的花饰），诗节之间 `⁂` 星号三角或一短线。

---

## §2 版面与语义缩放

### §2.1 全卷网格（§4.1 给精确约定）
```
 ┌卷首┐ ┌ I ┐ ┌ II┐ ┌III┐ ┌ IV┐
 └────┘ └───┘ └───┘ └───┘ └───┘
 ┌ V ┐ ┌ VI┐ ┌VII┐ ┌VIII┐ ┌ 跋 ┐
 └───┘ └───┘ └───┘ └────┘ └────┘
```
10 页同尺寸（竖版纸，约 2000×3400 世界 px），页距 ~180。全卷宽高比 ≈ 1.6，正好适配 1600×1000 的可见区（扣掉顶栏 56、书签栏 64 后约 1536×944）。

### §2.2 语义缩放（逐项按**屏幕字号**决定，不按全局层级分支；阈值 `LOD`）
- `emPx < HIDE_PX`：不画。
- `HIDE_PX ≤ emPx < GREEK_PX`："灰行"——文字画成圆角墨条（alpha `GREEK_ALPHA`），公式画最小 mip 位图（若已烘焙）否则墨条。
- `GREEK_PX ≤ emPx < LEGIBLE_PX`：真字，alpha 从 `FADE_FROM_ALPHA` 线性升到 1。
- `emPx ≥ LEGIBLE_PX`：满墨，计入 `visibleLabels` 与重叠统计。
效果（`lodLevel(z)` 只给 UI 显示名）：
- **全卷**（z < 0.2）：纸页、卷首大题、章号章题、首字、每章题记公式可读；诗句是整齐灰行；章际丝线（`THREADS_FADE`）+ 丝线上的关联数。猜想状态符号（大号手写）可见，形成页边的一列 ? ✓ ½。
- **章节**（0.2–0.45）：导言、诗节号、核心诗句、批注名可读；栏内铅笔弧淡入（`AMBIENT_FADE`）；丝线淡出。
- **诗句**（≥0.45）：全部公式、名称、行号、页边公式可读。

---

## §3 共享基础（冻结文件）

### §3.1 文件与模块归属
| 文件 | 归属 | 内容 |
|---|---|---|
| index.html, state.js, constants.js, geom.js, SPEC.md | 架构师（冻结） | 见各自文件头 |
| layout.js | **M1 排版** | buildLayout / checkLayout（§4） |
| formulas.js | **M2 公式** | 尺寸量取、墨色、位图 mip 缓存、SVG URL（§5） |
| render.js, paper.js, pencil.js | **M3 画布** | 纸面、笔触原语、逐帧渲染、拾取、统计（§6） |
| ui.js, panel.js, style.css | **M4 界面** | DOM 外壳、注释页、样式（§7） |
| main.js, camera.js, input.js, hash.js | **M5 编排** | 启动、actions、帧循环、相机、输入、深链、`window.__design`（§8） |

模块可以在自己的文件里自由加私有函数/常量；**需要新文件时用自己的前缀**（如 `render-links.js` 属 M3、`ui-legend.js` 属 M4），并在交付说明里列出。
不得修改别人的文件。所有现有文件都是能跑的桩，导出名已按本契约就位 —— 按契约整体重写自己的文件即可。

### §3.2 state 字段归属（state.js）
| 字段 | 写入方 | 读者 |
|---|---|---|
| graph, layout, dims | main（boot 一次） | 全部 |
| cam, camAnimating, fitZoom | camera.js | 全部 |
| vw, vh, dpr | main（resize） | 全部 |
| panelOpen | main（`setPanelOpen`） | camera(visibleRect)、ui、render |
| selectedId, hoverId, hoverSource, query, hits, hitSet, flash, showAmbient, showLegend | main 的 actions | render、ui |
| dirty, ready, fps | main（render 只调用 requestDraw） | — |
写入后必须 `requestDraw()`。render 与 ui **从不**写交互字段，只调用 `actions.*`。

坐标：`w2s / s2w / worldViewport / visibleRect`（state.js）。相机中心 (cam.x, cam.y) 显示在**可见区**（扣掉顶栏 `CHROME.TOP`、书签栏 `CHROME.RAIL`、打开时的注释页 `CHROME.PANEL`）中心。

### §3.3 事件总线（`bus`）
| 事件 | 载荷 | 发出方 | 典型监听 |
|---|---|---|---|
| select | `{id\|null, prev\|null}` | actions.select / deselect | ui（开合注释页、填内容） |
| hover | `{id\|null, sx, sy, legible, source}` | actions.hover | ui（悬停小签） |
| search | `{query, hits, error\|null}` | actions.search | ui（命中数、结果下拉、书签计数） |
| view | `{x, y, z, level}` | main 帧循环（相机变化后，每帧至多一次） | ui（当前章高亮、层级名、缩放读数） |
| chrome | `{panelOpen}` | main（setPanelOpen / toggleLegend） | ui |
| progress | `{phase, done, total}` | main boot | ui |
| ready | `{}` | main | ui |

### §3.4 geom.js
`runRect(run)`（TextRun→世界矩形，基线 y，上 0.86em 下 0.24em）、`rectsOverlap(a,b,pad)`、`unionRect`、`inflate`、`containsPt`、`toScreen(r,w2s,z)`、
`countOverlaps(rects, shrink=0.5) → {count, pairs}`。layout 自检与 render 屏幕重叠统计都用它，保证判断一致。

---

## §4 排版契约（M1 · layout.js）

### §4.1 导出
```js
buildLayout(graph, dims, measure) → Layout
  // graph = getGraph()；dims: Map<id,{w,h}>（MathJax px，研究者没有）；
  // measure(fontString, text) → 宽度（px，用 fontCss(...) 生成的字体串量；量出来的就是世界宽度）
  // 纯函数、确定性：同样输入 → 逐字段相同输出。不访问 DOM / state（可在 node 下用假 measure 测）。
checkLayout(layout, graph) → { missing: id[], overlaps: Array<[a,b]>, outOfPage: string[] }
  // missing：graph 里没排上的节点；overlaps：所有 label:true 的 TextRun 矩形 + 所有公式矩形 + seal 矩形之间的相交对
  // （用 geom.countOverlaps，shrink=0）；outOfPage：超出所属 page 矩形的条目 id / run 描述。三者都应为空。
```
网格：`pages` 10 页同尺寸，行优先 5×2：`[front, I, II, III, IV] / [V, VI, VII, VIII, colophon]`。页尺寸、页距、栏宽等是 layout 私有常量（建议页 2000×3400、页距 180、页内边距 ~150、两栏正文 + 外侧页边 ~380）。
**外侧页边**：第一行与第二行的页都把页边放在**右侧**（简单、可预期；不做真对开）。

### §4.2 数据结构（render / ui / main 依赖这些字段，名字与含义不得改）
```ts
Layout = {
  bounds: Rect,                 // 全部纸页外包 + 四周 ~200 留白（camera.fitAll 用它）
  pages: Page[],                // 10 项，下标 = page.index
  items: Item[],                // 488 项，每节点恰一项
  byId: Map<id, Item>,
  texts: TextRun[],             // 一切"不属于某个条目"的静态文字（页眉、章题、导言、诗节号、目录、图例文字…）
  paras: Para[],                // 带首字的导言段落（已断行，见下）
  rules: Rule[],                // 版框细线、章题下双线、诗节分隔短线
  ornaments: Ornament[],        // 花饰、星号三角、tailpiece、目录点线
  arcs: Arc[],                  // 栏内铅笔弧（同栏关联，§4.6）
  threads: Thread[],            // 章际丝线（全卷视图，§4.7）
  hotspots: Hotspot[],          // 卷首目录等可点击区域
  legend: LegendEntry[],        // 卷首图例的示例图元（render 画图元，文字在 texts 里）
  chapters: Chapter[],          // 8 项，按 CHAPTER_ORDER
  order: id[],                  // 阅读顺序（←/→ 逐句用）：每章 题记→诗节诗句→页边批注；最后题跋署名
}
Rect = { x, y, w, h }           // 世界坐标，y 向下
Page = { index, key: 'front'|chapterKey|'colophon', kind: 'front'|'chapter'|'colophon',
         chapter: number (-1 for front/colophon), x, y, w, h,
         text: Rect,             // 正文区
         margin: Rect|null,      // 页边批注区（章页才有）
         marginSide: 'right'|null,
         folio: string,          // 页码文字，例如 'I'、'首'、'跋'
         titleAnchor: {x,y},     // 丝线端点（章题下方中心）
         seed: number }          // 纸纹随机种子
TextRun = { x, y /*基线*/, text, family: 'serif'|'hand'|'italic'|'mono', size, weight, style: 'normal'|'italic',
            color /*PALETTE 值或 hex*/, align: 'left'|'center'|'right', w /*measure 结果*/,
            role: string,       // 见下表
            label: boolean,     // true = 参与重叠统计（所有可读文字都应为 true；装饰符号为 false）
            itemId?: id,        // 属于某条目时（name、sub、ref、glyph）
            hot?: string }      // 可点击：hotspot id
```
TextRun.role 取值：`runhead` 页眉、`folio` 页码、`chapnum` 章号、`title` 章题/卷首大题、`latin` 拉丁副题、`epi-attr` 题记署名行、
`stanza` 诗节号、`lineno` 行号、`name` 诗句名称、`name-core` 核心诗句名称、`sub` 英文副名、`ref` 引用记号（上标字母）、
`note-name` 批注名、`note-glyph` 状态符号、`sign-name` 署名、`sign-inst` 机构、`sign-focus` 研究方向、
`toc` 目录行、`toc-num` 目录页码、`legend` 图例文字、`front` 卷首其他文字、`colophon` 题跋正文、`ornament` 装饰字符（label:false）。
```ts
Para = { x, y /*首行基线*/, w, lineHeight, size, family, color,
         dropCap: { x, y /*基线*/, text /*一个字*/, size, color: PALETTE.rubric, w },
         lines: Array<{ x, y, text, w }> }   // 已按宽度断行（首字旁 3 行缩进），每行 label:true 语义
Rule = { x0, y0, x1, y1, width /*世界 px*/, color, style: 'solid'|'double'|'hair' }
Ornament = { kind: 'fleuron'|'asterism'|'tailpiece'|'leader'|'frame', x, y, w, h, color, seed }
          // leader = 目录或诗句名的点线：从 x 到 x+w，基线 y
Arc = { a: id, b: id, x, y0, y1, bulge /*向左鼓出的世界 px*/, weight, type, key /*link.key*/ }
          // 端点 (x, y0) 与 (x, y1)；二次曲线控制点 (x - bulge, (y0+y1)/2)
Thread = { from: pageIndex, to: pageIndex, count, weight /*sum*/, x0, y0, x1, y1, cx, cy /*二次控制点*/,
           label: { x, y, text /*关联数*/ } }
Hotspot = { id, rect: Rect, action: { type: 'chapter', key } | { type: 'select', id } }
LegendEntry = { kind: 'status'|'stroke'|'seal'|'tier', key, rect: Rect }
          // status: key = 状态名，render 在 rect 内画 STATUS_GLYPH；stroke: key = LINK_STROKE 的线型名
          // ('solid'|'double'|'arrow'|'dashed'|'dotted'|'wavy')，render 画示例笔画；seal: key = field
Chapter = { key, index, page /*pageIndex*/, epigraphId, verseIds: id[], noteIds: id[],
            stanzas: Array<{ ordinal, title, ids: id[] }> }
```
```ts
Item = {
  id, kind: 'verse'|'note'|'sign',     // 定理 | 猜想 | 研究者
  page: pageIndex, chapter: chapterKey|'colophon',
  tier: 'epigraph'|'core'|'verse'|'note'|'sign',
  stanza: number|null,                // 诗节序号（1 起），批注/署名为 null
  ordinal: number,                    // 章内序号（诗句 1 起连续；批注按字母序 1 起；署名 1 起）
  locator: string,                    // 人读定位，例如 'II·其三·17'、'IV·页边 c'、'跋·5'
  box: Rect,                          // 拾取与圈注的外包框 = formula ∪ name ∪ sub ∪ glyph ∪ seal（不含 ref）
  formula: { x, y, w, h, scale } | null,   // 位图左上角与世界尺寸；w = dims.w*scale；研究者为 null
  name: TextRun,                      // 名称（必有）
  sub: TextRun[],                     // 其他从属文字（英文副名、机构、方向…）
  leader: Ornament|null,              // 公式与名称之间的点线
  lineNo: TextRun|null,               // 行号（每 5 句一个）
  glyph: TextRun|null,                // 批注的状态符号（role 'note-glyph'，color = STATUS_GLYPH[status].color）
  ref: TextRun[],                     // 批注的引用记号：[批注前的字母, 被批注诗句名后的上标字母]（只批注有）
  seal: { x, y, size, char } | null,  // 研究者朱印
  anchors: { l: [x,y], r: [x,y] },    // 关联线端点（box 左右两侧中点外 ~10 世界 px）
}
```
所有属于条目的 TextRun **只**放在条目里，不重复放进 `layout.texts`（避免画两遍）。

### §4.3 章页版式（自上而下）
1. 页眉（runhead）：左「公式诗稿」右「卷 II · 概形与层」，italic 22，ink3；下接一条 hair rule。页码（folio）在页脚居中，罗马数字 italic 28，两侧各一朵小花饰。
2. 章头：章号（chapnum，「卷 II」或「II」，朱，120）居中；章题（title，150，600，ink）；拉丁副题（latin，italic 52，ink3）；双线 rule。
3. 导言段（Para）：首字（dropCap，朱，三行高）+ 34px 正文，行距 1.75，两端对齐可选（左齐即可）。正文由数据生成：
   `「<题记诗句名>」——<题记 summary（stripMd）>。本章收诗 N 首，分 K 节；页边记未解之问 M 则。` 汉字逐字断行（不在行首放「，。、；：）」）。
4. 题记（tier 'epigraph'）：本章 importance 最高、且按题记字号排得下正文宽的那条（太宽就取下一条）。公式居中，em ≈ 80–96 世界 px；下一行右齐 epi-attr「——<名称>」（serif italic 风格的汉字用 serif 400 即可）。题记的 name 就是这行。
5. 正文两栏：诗节依次往下流，左栏满了接右栏；诗节标题（stanza 行）不得落在栏底孤立（至少带 2 句）。诗节之间空 1 行 + `asterism` 装饰。
6. 页尾若有剩余 ≥ 300 的空白：tailpiece 花饰居中。

### §4.4 诗节（stanza）划分 —— 让同节诗句在关联图上相近，栏内铅笔弧才短
确定性贪心：本章诗句（去掉题记）按 importance 降序；取第一个未分配者为"节首"（tier 'core'），
按 BFS 吸收与已在本节的诗句有章内关联的未分配诗句（按关联 weight 降序），直到节长达到 `cap = ceil(N / K)`，K = clamp(round(N/8), 3, 9)；
重复。最后剩下的 1–2 句孤句并入与之关联最强的节（无关联则并入最后一节）。节内顺序：节首 → 其余按 BFS 发现顺序。
诗节号：`其一 · <节首名称>`（stanza，朱 30）。节序按节首 importance 降序。

### §4.5 诗句行
```
 ⌒ 15  ℱ ⊗ 𝒪_X → … (公式)  · · · · · · · · ·  名称ᵃ
 ↑栏内弧区 ↑行号区
```
- 每栏左侧留"弧区"~70（§4.6）+ 行号区 ~40；公式左齐。
- 公式缩放：核心 `scale = 0.62·k`，普通 `scale = (0.36 + 0.08·rankInChapter)·k`；k 为本章填充系数，二分求 k∈[0.75, 1.5]，使正文恰好填满两栏（k=0.75 仍溢出 → 把**所有页**等高加高 200 重试；确定性）。公式宽 > 栏宽 − 弧区 − 行号区时再按栏宽收缩。
- 名称：若 `公式宽 + 24 + leader最短40 + 名称宽 ≤ 可用宽`，名称右齐在栏右缘、同一基线（基线 = 公式垂直中心 + 0.35·名称字号），中间点线 leader；否则名称换到公式下一行右齐（无 leader）。
- 核心诗句：名称 `name-core`（26，600，ink）+ 英文副名 sub（italic 18，ink3，右齐在名称下方）。普通诗句不放英文。
- 行距：行高 = max(公式高, 名称字号·1.3) + 18·k。
- 行号 lineNo：本章第 5、10、15… 句，italic 15 ink3，右齐在行号区右缘、与公式垂直居中。
- 被批注的诗句：名称后接上标 ref 字母（朱，hand 16，基线上移 0.45·名称字号），多个字母用逗号连写成一个 run 也可。

### §4.6 栏内铅笔弧（Arc）
对每一条两端都在**同一栏**的诗句关联：端点 x = 弧区右缘，y0/y1 = 两诗句公式垂直中心；`bulge = min(60, 10 + 0.12·|y1−y0|)`。
每栏最多保留 weight 最高的 18 条（其余在选中时才画）。key = link.key。弧不是文字，不参与重叠统计。

### §4.7 章际丝线（Thread）
对 8 个章页两两统计跨章关联（诗句–诗句、诗句–本章批注都按批注所在页算），count ≥ 8 的页对生成一条：
端点 = 两页 `titleAnchor`（章题下方），控制点 = 中点向远离全卷中心方向偏移 0.18·距离（同一行相邻页则向上拱）。
label = 关联数（阿拉伯数字），位置取曲线 t=0.5 处；若与可读字（章题、题记）相交，沿曲线在 t∈[0.35,0.65] 内滑动寻找空位，找不到就不放 label（label 置 null）。
卷首、题跋页不连丝线。

### §4.8 页边批注（猜想 → note）
- 归章：对每个猜想，按 Σ weight 统计它连到的各章诗句；取最大者（并列取 CHAPTER_ORDER 靠前）。若某章批注总高超出页边区，按 importance 低者优先移到次优章。
- 锚点：该猜想在本章关联 weight 最大的那条诗句（anchorVerse）。批注理想 y = 锚诗句的公式顶。
- 批注块（页边宽 ~380）：第一行 `[字母] [状态符号] 名称`：ref 字母（朱 hand 18）、glyph（hand 30，STATUS_GLYPH 色）、名称（hand 22 noteInk，可断成 2 行）；其下公式（noteInk，scale 使 em≈16–20 且宽 ≤ 页边宽，太宽就再缩；最宽的猜想公式按页边宽缩放后 em 仍 ≥ 10，不需要折行）；
  再下一行 sub：`<proposer> · <year>`（italic 15 noteInk2，缺字段就省略）。
- 自上而下排序后做一维避让：按理想 y 依次放，与上一块间距 ≥ 28；溢出页底则整体上推。
- 字母按最终 y 顺序 a, b, c…（同页）。被批注诗句名称后补上标字母（§4.5）。

### §4.9 题跋页与卷首
**题跋（colophon）**：页眉「卷末 · 题跋」；大题「题跋」（title 150）+ latin「Colophon · Signatures」；
一小段题跋正文（Para，有首字）：`以上八章，诗四百零五首，页边未解之问五十九则。录诸位当代作者署名于后，印文为其所治之学：几 代数几何、数 算术、代 代数、拓 拓扑……`（按实际出现的领域生成）。
署名 24 条按 importance 降序，2 栏 × 12 行：朱印（seal，size 72）+ 右侧署名（sign-name，hand 40，ink）+ 下一行机构（sign-inst，italic 18 ink3，太长截断加 …）+ 再下一行研究方向（sign-focus，serif 17 ink2，前 60 字符）。
页尾 tailpiece 与一枚大号「诗稿」朱印（ornament kind 'frame' 或 seal 样式，非条目）。
**卷首（front）**：大题「公式诗稿」（title 260，600）居中；latin「Formula Manuscript · 代数几何四百八十八则」；一句题诗（front，serif 40 ink2，自拟，例如「每一条公式都是一行诗：它说出一件真事，而且说得很短。」）；
目录：10 行（卷首除外的 9 页 + 「页边」说明不必），每行 `II  概形与层 ·········· 诗 35 · 问 1`，toc 32 + leader + toc-num；每行一个 Hotspot（action chapter key）。
图例：状态五符号（LegendEntry status + legend 文字「? 仍未解决」…）、六种笔法（LegendEntry stroke + 文字「双线 = 等价」…）、字号阶梯说明（tier：三行不同字号的"示例诗句"文字即可）、朱印说明（seal）。

---

## §5 公式契约（M2 · formulas.js）

所有公式只走一条管线：`tex.js texSync(latex, inkFor(node))` → SVG 字符串 → `<img>` 解码 → 栅格化到 canvas 的 mip 级。
画布与注释页显示的是**同一份 MathJax 排版**（注释页用 `<img src=svgUrlFor(id)>`，不用 KaTeX —— 避免两套排版结果不一致，且部分 latex 用了 KaTeX 不支持的宏）。

```js
inkFor(node) → hex             // 猜想 PALETTE.noteInk；其余 PALETTE.ink（研究者不排公式）
computeDims(nodes, onProgress?) → Promise<Map<id,{w,h}>>
  // 对全部非研究者节点 texSync，缓存 SVG 源码；按 ~8ms 时间片分块并 await 让出主线程；onProgress(done,total)。
  // 排版失败的节点：用 \text{<name>} 再试一次；仍失败给 {w: 400, h: 64} 且 svgFor 返回一个占位 SVG（不抛异常）。
svgFor(id) → string            // 已上色的 SVG 源码（computeDims 之后可用）
svgUrlFor(id) → string         // Blob URL（缓存，整个页面生命周期不 revoke），给注释页 <img> 用
getBitmap(id, pxPerUnit) → { canvas, exact: boolean } | null
  // pxPerUnit = 每个 MathJax px 对应的设备像素 = formula.scale * cam.z * dpr。
  // 选 mip 级：MIP_LEVELS = [1/16, 1/8, 1/4, 1/2, 1, 2]（相对 MathJax px），取 ≥ pxPerUnit 的最小一级（超过 2 取 2）。
  // 有该级 → exact:true；没有 → 返回已缓存的最近一级（优先更高的）exact:false，并把目标级排进烘焙队列；
  // 一级都没有 → null（并排队）。从不在调用里同步栅格化。
pumpBakes(budgetMs = 6) → number   // render 每帧开头调用：按队列优先级在时间预算内完成若干次栅格化；返回队列剩余数。
  // 队列：同 id 只保留最新请求的级；优先级 = 最近一次请求的帧序号（新的先做）+ 级别越小越先。
  // SVG→img 解码是异步的：图片未解码完就跳过，解码完成时 requestDraw()。
prewarm(ids) → void            // 空闲时（requestIdleCallback 分片）为 ids 依次烘焙 1/16 与 1/8 两级，供远景灰行用
bitmapStats() → { pending, queued, cached, bytes }
```
- 内存：所有 mip 总字节（w*h*4）上限 ~160 MB，超出按 LRU（最近被 getBitmap 命中的帧序号）淘汰 ≥1/2 级的位图；1/16、1/8 两级不淘汰。
- 栅格化：`ctx.drawImage(img, 0, 0, w, h)`，w/h = ceil(dims * level)，最小 1；`imageSmoothingQuality='high'`。2× 级的最宽公式 ≈ 4450px，在 canvas 上限内。
- 墨色固定（不随选中变色）：选中强调由圈注表达，不重新烘焙。

---

## §6 画布契约（M3 · render.js / paper.js / pencil.js）

### §6.1 paper.js
```js
makeTextures() → Textures      // boot 一次：程序生成纸纤维 tile（256² 噪声 + 短纤维线，PALETTE.fiber）、书桌木纹/亚麻 tile、
                               // 纸边泛黄的径向渐变参数。用 OffscreenCanvas 或 canvas 生成，不加载图片。
drawDesk(ctx, tex, vw, vh, cam) // 铺满画布（屏幕坐标）；纹理随相机平移（pattern.setTransform），缩放时纹理尺度 clamp 在 0.5–2 倍
drawPage(ctx, tex, page, sx, sy, sw, sh, z)
  // 一页纸：两层软阴影（不用 shadowBlur 逐帧——用预渲染的 9-slice 阴影或两三个半透明偏移矩形）、纸面、纤维 pattern（锚定在页上）、
  // 四边泛黄与轻微 foxing 斑（seed=page.seed，确定性）、极淡的版心框。sw < 40 时只画纯色矩形 + 阴影。
```
### §6.2 pencil.js（全部在**屏幕坐标**下画；抖动由 seed 确定，帧间稳定；线宽单位为屏幕 px）
```js
seedOf(str) → uint32；rng(seed) → () => [0,1)
pencilCurve(ctx, x0,y0, cx,cy, x1,y1, seed, opt) // 二次曲线：沿曲线采样 ~每 6px 一点，法向抖动 ≤ opt.jitter(默认 0.8px)，
                                                 // 两遍描画（第二遍 alpha 0.5、偏移 0.4px）模拟石墨；opt: {color, alpha, width, jitter, style}
  // opt.style ∈ LINK_STROKE 值：'solid'|'double'|'arrow'|'dashed'|'dotted'|'wavy'（arrow 在 (x1,y1) 端画手绘箭头）
pencilCubic(ctx, x0,y0, c1x,c1y, c2x,c2y, x1,y1, seed, opt)   // 同上，三次曲线（选中时的跨栏 / 跨页关联线用）
inkEllipse(ctx, x, y, w, h, seed, opt)   // 围住屏幕矩形的手绘椭圆（外扩 opt.pad 默认 8）：起笔与收笔错开 ~20°，
                                         // 两笔（opt.double 默认 true），朱墨，宽 opt.width 默认 2；opt.color 可改成铅笔
pencilUnderline(ctx, x0, x1, y, seed, opt)
highlighterWash(ctx, x, y, w, h, seed, opt)  // 荧光笔：2–3 道略斜、两端不齐的半透明粗笔，multiply 合成
sealStamp(ctx, x, y, size, char, seed, opt)  // 朱印：圆角方形 + 边缘残缺（seed 决定缺口）+ 白文印字（楷体）
handFrame(ctx, x, y, w, h, seed, opt)        // 手绘矩形框
dottedLeader(ctx, x0, x1, y, opt)            // 点线（目录、诗句名）
strokeSample(ctx, x, y, w, style, seed, opt) // 图例用：在 (x,y) 起画一段长 w 的示例笔画
statusMark(ctx, x, y, size, status, opt)     // 手写状态符号（hand 字体 + STATUS_GLYPH 色），opt.align
arrowHead(ctx, x, y, angle, size, opt)       // 手绘箭头（两笔）
```
M4 的图例弹层会 import `strokeSample` 与 `statusMark` 画进小 canvas。

### §6.3 render.js
```js
initRenderer(canvas)                 // 取 2d ctx（{alpha:false}）、makeTextures()
resizeRenderer(vw, vh, dpr)          // 设置 canvas 像素尺寸与 CSS 尺寸
draw() → FrameStats                  // main 在 state.dirty 时调用；先 pumpBakes(6)
pick(sx, sy) → Item|null             // 屏幕点 → 条目（box 外扩 4 屏幕 px；多个命中取 box 面积最小者；
                                     //  只认 emPx ≥ HIDE_PX 的条目）。用世界坐标网格索引，不要线性扫 488 项。
pickHotspot(sx, sy) → Hotspot|null   // 卷首目录等热区
isLegible(id) → boolean              // 该条目的主文字（公式或署名）当前 emPx ≥ LEGIBLE_PX
itemScreenRect(id) → Rect            // 条目 box 的当前屏幕矩形（ui 定位悬停小签用）
renderStats() → FrameStats           // 最近一帧
FrameStats = { visibleLabels, overlappingLabels, drawnItems, pendingVisible, drawMs,
               threads, arcs, links, bitmaps: bitmapStats(), legibleFormulas }
```
**每帧绘制顺序**（只画与 `worldViewport()` 相交的东西）：
1. `drawDesk`；每页 `drawPage`。
2. 页面静态层：rules、ornaments、paras（首字 + 行）、texts（按 §2.2 的文字 LOD）。
3. 章际丝线 threads：alpha = 1 − smoothstep(THREADS_FADE)；宽 = 1 + 2.2·(count/maxCount) 屏幕 px，pencilSoft；label 用 hand 字体画在一个小纸色圆底上（直径随字号）。
4. 栏内弧 arcs（`state.showAmbient` 且 alpha = smoothstep(AMBIENT_FADE) > 0）：pencilCurve，pencilSoft，0.9px；选中时与选中项无关的弧降到 0.3 倍 alpha。
5. 检索荧光：`state.hitSet` 中可见条目在 box 下方画 highlighterWash；有查询时非命中条目 alpha × 0.35。
6. 条目：公式（getBitmap，按 §2.2 LOD；emPx = formula.scale·TEX_EM·z）、leader、name、sub、lineNo、glyph、ref、seal。
   选中时非一跳邻居的条目 alpha × 0.4（选中项与邻居满墨）。悬停项：名称下 pencilUnderline。
7. 选中层（`state.selectedId`）：对 node.linkIds 的每条 link，从选中项 anchor 到另一端 anchor 画关联线：
   - 同栏且相距 < 600：贴着弧区画二次曲线（与 Arc 同几何，但用 pencil 色、1.4px）；否则三次曲线：从朝向对方的一侧 anchor 出发，控制点水平外推 0.35·距离，经过页间空白时自然弯曲。
   - 笔法 `LINK_STROKE[link.type]`；arrow 方向 = link.source → link.target。
   - `state.hoverSource==='panel'` 且 hoverId 是这条线的另一端：这条线改朱墨 2px、其余线 alpha × 0.4。
   - 关联项：铅笔 inkEllipse（单笔，pencil，1.2px）；选中项：朱墨双笔 inkEllipse。
   - 线标签：z ≥ `LINK_LABEL_MIN_Z` 时，在曲线 t=0.5 附近放 `typeLabel(type)`（hand 14 屏幕 px，pencil 色，纸色衬底），
     最多 14 个，按 weight 降序贪心放置，与本帧已画可读标签相交就试 t=0.4/0.6，再不行就不放。
   - 另一端在屏幕外：在可见区边缘画指向它的小箭头（arrowHead），同方向 15° 内合并并标数字。
8. 定位涟漪：`state.flash` 存在且 < 900ms：在该条目周围画一圈由大到小收拢的朱墨椭圆，期间 requestDraw()。
9. 统计：本帧所有以 ≥ LEGIBLE_PX 画出的文字与公式的**屏幕矩形**收集起来，`countOverlaps(rects)` 得 overlappingLabels，个数即 visibleLabels。
   文字矩形用 `toScreen(runRect(run), w2s, z)`，公式用其 formula 矩形；线标签、丝线 label 也算。pendingVisible = 本帧需要可读但 getBitmap 返回 null 或 exact:false 的公式数。

**文字 LOD**（emPx = run.size·z）：< HIDE_PX 不画；< GREEK_PX 画墨条（高 0.42·emPx，长 = run.w·z，圆角，alpha GREEK_ALPHA·色）；
GREEK_PX–LEGIBLE_PX 真字淡入；ink3 级小字（行号、页眉）额外要求 emPx ≥ 7 才画真字。
**性能**：只画视口内；字体串按 (family,size,weight,style) 缓存；全卷视图下（z<0.2）诗句名称、正文行只画墨条（不 fillText）。目标：全卷 ≤ 10ms、诗句级 ≤ 8ms / 帧（1600×1000，dpr 1）。

---

## §7 界面契约（M4 · ui.js / panel.js / style.css）

### §7.1 mountUI
```js
mountUI(root /* #ui */, actions) → {
  setProgress(text, frac),  hideLoading(),  focusSearch(),  setSearchBox(q),  toast(text)
}
```
ui 只通过 `actions.*` 改状态，通过 bus 得知变化，可读 state、可 import render.js 的 `isLegible / itemScreenRect`、formulas.js 的 `svgUrlFor`、pencil.js 的 `strokeSample / statusMark`。
`#ui` 覆盖整窗，`pointer-events:none`，各控件自己 `pointer-events:auto`。

### §7.2 组件
- **顶栏**（高 `CHROME.TOP`=56，纸色 `#f6f0e1`，下沿一条铅笔感细线）：左「公式诗稿」（serif 22 600）+ 拉丁小字「Formula Manuscript」；
  中：搜索框（宽 360，纸色凹陷、底部手绘下划线风格，placeholder「检索：名称 / 英文 / 公式 / status:open family:scheme …」），右侧命中数「17 处」或错误提示（朱色）；
  右：层级读数（「全卷 · 13%」），按钮：「全卷」(fit, 快捷键 0)、「铅笔弧」开关（toggleAmbient）、「凡例」(toggleLegend)、「?」快捷键说明。
- **搜索下拉**：输入时列出前 40 个命中（locator 小字 + 名称 + 英文），↑/↓ 移动、Enter 选中（actions.select(id,{fly:true})）、鼠标点击同；Esc 清空。
- **书签栏**（左侧宽 `CHROME.RAIL`=64，深一档纸色）：竖排 10 个书签：首、I…VIII、跋（罗马数字 serif + 下方竖排的 `CHAPTERS[i].short`），
  当前视图中心所在页的书签变朱色并外凸 6px（监听 view 事件，用 state.layout.pages 判断）；有检索时书签右上角朱色小数字 = 该页命中数。点击 → actions.gotoChapter(key)。
- **注释页**（右侧宽 `CHROME.PANEL`=420，打开时从右滑入 180ms）：见 §7.3。
- **悬停小签**：bus hover 且 source==='canvas' 且 id 非空，延迟 120ms 显示在条目屏幕矩形旁（itemScreenRect，优先右侧，避开顶栏/注释页）：
  名称 + 英文 + summary（inlineMd）；若 `legible === false` 再附一张公式小图（svgUrlFor，高 ≤ 48px）。移开立即隐藏。
- **凡例弹层**（showLegend）：状态五符号（statusMark 画到小 canvas）+ 六种笔法（strokeSample）+ 交互说明（拖动/滚轮/双击/←→/Esc//）。
- **载入幕**：纸色全屏，居中「公式诗稿」+ 一条墨水进度线 + 阶段文字（setProgress）；hideLoading 时 300ms 淡出后移除。
- **toast**：底部居中小纸条，2.4s 消失（复制链接、搜索无结果等）。

### §7.3 panel.js — 注释页内容
```js
buildPanelContent(node, deps /* {graph, layout, actions, state} */) → HTMLElement
```
像书页的一张注释笺（纸色、左侧装订线阴影、页内留白 28px）。自上而下：
1. 定位行：`item.locator`（italic ink3）+ 右侧 ✕ 关闭（actions.deselect）、‹ › 上一句/下一句（actions.step(∓1)）。
2. 名称（serif 26 600 ink）+ 英文（italic 16 ink3）。猜想：前置大号状态符号（STATUS_GLYPH 色）+ 状态名与 hint；领域 `CONJECTURE_FIELDS[field].name`、提出者、年份、`progressOf(id)`（若有，「最近进展：<年份>」，DATA_AS_OF 注明数据截至）。研究者：朱印（小 canvas 用 sealStamp）+ 机构 + 研究方向。
3. 公式：`<img src=svgUrlFor(id)>`，宽度 ≤ 面板内宽，最大高 120，居中，上下各一条细线。研究者无此项。
4. 「题解」：summary（inlineMd，粗体用朱墨 `b.em`），「笺注」：detail（inlineMd，段落行距 1.8，首字可做小号朱色首字）。
5. 研究者「代表作」：representativeWorks 列表（title、year、note；url 只接受 `^https?://` 才做成 `<a target=_blank rel=noopener>`）。
6. 「关联」：按 link.type 分组（组名 typeLabel(type) + 笔法小样 strokeSample），组内按 weight 降序；每行：另一端的 locator（italic 小字）+ 名称 + 关系说明 link.label（ink2 小字）。
   行 mouseenter → `actions.hover(otherId, 0, 0, 'panel')`，mouseleave → `actions.hover(null,0,0,'panel')`，click → `actions.select(otherId, {fly:true})`。
7. 页脚：「复制本页链接」（actions.copyLink）、「在原星云中打开」（`nebulaLink(id)`，新标签页）。
全部数据文本用 textContent / inlineMd，不拼 innerHTML。

### §7.4 样式要点（style.css）
纸色界面用 `PALETTE` 同值的 CSS 变量；字体用 `FONTS` 同值；按钮是"印在纸上的字"风格（无填充，hover 时朱色下划线）；焦点环用朱色 2px dotted；
滚动条细、暖灰。所有可点控件有 :focus-visible 样式与 aria-label。字号：面板正文 15px / 行距 1.8，小字 12.5px。

---

## §8 编排契约（M5 · main.js / camera.js / input.js / hash.js）

### §8.1 启动顺序（main.boot）
`getGraph()` → `mountUI` → 等系统字体（≤800ms）→ `computeDims`（进度）→ `buildLayout(graph, dims, measure)` → `checkLayout`（不通过就 console.warn 并把结果挂到 `__design.layoutCheck`）
→ `initRenderer` + resize → `attachInput` → `setCam(fitAll())` → 解析 hash → 启动 rAF 循环 → 等首帧且 `pendingVisible === 0`（≤2500ms）
→ `hideLoading`、`ready = true`、emit ready → 空闲 `prewarm(layout.order)`。目标首屏 < 3s。

### §8.2 actions（main.js 导出，ui / input 只能通过它改交互状态）
```js
select(id, { fly = true, frame = 'item'|'neighbourhood', animate = true }) → boolean
deselect()
search(query) → id[]                 // parseQuery；裸词匹配 name/en/id/latex；排序：名称完全相同 > 名称前缀 > importance 降序
locate(id)                           // select + fly + 设置 state.flash = {id, t0}
setView({x,y,z}, { animate }) → Promise
fit(animate = true) → Promise
gotoChapter(key | index | 'front' | 'colophon') → Promise   // 飞到该页适配视图
hover(id|null, sx, sy, source = 'canvas')
escape()                              // 有选中→取消选中；否则有查询→清空查询；否则→fit
focusSearch()
toggleAmbient(on?), toggleLegend(on?)
step(delta)                           // 按 layout.order 选上/下一句并飞过去
stepChapter(delta)                    // 上/下一页
zoomBy(factor)                        // 以可见区中心缩放
copyLink() → Promise                  // 复制当前完整 URL，toast「已复制链接」
```
打开/关闭注释页时（setPanelOpen）cam.x 平移 PANEL/2/z，使画面内容在屏幕上不跳。

### §8.3 camera.js（state.cam 只由它写）
```js
fitRect(rect, margin = CHROME.FIT_MARGIN) → {x,y,z}   // 已钳制
fitAll() → {x,y,z}                   // 同时写 state.fitZoom
readingZoom(item) → z                // 让 formula.scale·TEX_EM·z = ZOOM.READ_EM_PX，clamp [READ_MIN, READ_MAX]；无公式用 READING
clampView(v) → v;  setCam(v);  flyTo(v, ms = 520) → Promise;  cancelFly();  stepCamera(now) → boolean
zoomAt(sx, sy, factor);  panBy(dx, dy);  isFlying() → boolean;  minZoom() → number
```
飞行：缩放对数插值；距离远时（起止视图都不覆盖对方）先拉远到能同时看见两者的 zoom 再拉近（van Wijk 简化版，或两段式），时长 520–900ms。
平移钳制：相机中心不离开 `layout.bounds`。惯性：拖动松手后速度衰减滑行（可选，≤ 400ms）。

### §8.4 input.js
```js
attachInput(canvas, actions)
```
- 拖动平移（>4px 才算拖动）；单击：先 `pickHotspot` → 执行其 action；再 `pick` → `actions.select(id, {fly:false})`；点空白 → deselect。
- 滚轮：以光标为不动点缩放（`zoomAt`）；触控板 pinch（ctrlKey wheel）同；Shift+滚轮横向平移；双击：放大 2× 到光标处（双击条目则 select + 飞到阅读字号）。
- 双指触控：pinch 缩放 + 平移。悬停：`pick` → `actions.hover(id, x, y, 'canvas')`，光标 pointer/grab。
- 键盘（焦点不在输入框时）：`/` 或 Ctrl/⌘+K 聚焦搜索；Esc `actions.escape()`（输入框内也生效）；`0`/Home 全卷；`+`/`-` 缩放；
  ←/→ `actions.step(∓1)`；`[` / `]` 或 PageUp/PageDown 上下一章；方向键 ↑/↓ 平移 120px；`a` 切换铅笔弧；`?` 凡例。

### §8.5 hash.js 深链
格式（不与原星云的 `#v1&…` 冲突，本方案自用）：`#n=<id>&q=<query>&v=<x>,<y>,<z>`，全部参数可选。
- 有选中时只写 n（和 q）；无选中时写 v（相机，取整）；查询非空写 q。
- `parseHash(hash) → {id, query, view}`：任何输入都不抛异常；id 必须存在于 graph 才用；z 钳到合法范围。
- `encodeHash({id, query, view}) → string`（不含 #）。main 用 `history.replaceState` 写（防抖 400ms，飞行中不写），监听 hashchange 应用外部改动。
- 载入时：有 n → 选中并直接放到阅读视图（无动画）；有 v 无 n → 直接 setCam；都没有 → fitAll。

### §8.6 window.__design（评审代理靠它驱动，必须全部提供）
```js
window.__design = {
  ready,                     // boolean，首屏画出后 true
  graph, layout, state, actions, bootMs, layoutCheck,
  select(id) → boolean,      // 无动画，选中并飞到阅读视图；返回是否成功
  deselect(),
  search(q) → id[],
  view() → { x, y, z, level, fitZoom, selected, query, hits, panelOpen, visibleRect },
  setView(v) → Promise       // v = {x,y,z}（部分字段可省）| {id} | {chapter: key|index} | {fit:true}；默认无动画，{animate:true} 时 await 动画结束
  stats() → { visibleLabels, overlappingLabels, fps, z, level, drawMs, pendingVisible, drawnItems, threads, arcs, links, bitmaps }
}
```

---

## §9 验收标准（每个建造者交付前自测，评审按此打分）
1. 1600×1000 首屏 < 3s（`__design.bootMs`），无 `[page exception]`，console 无 error。
2. 全卷视图：10 张纸、章题与 8 条题记公式可读；`overlappingLabels === 0`。
3. 任意 zoom（fitZoom 到 MAX，抽查 6 档）与任意位置：`overlappingLabels === 0`。
4. 488 个节点全部 `layout.byId` 可达；`search('hodge')`、`search('status:open')`、`search('黎曼')` 有命中；`select` 任意 id 后注释页内容正确、关联线全部画出。
5. 诗句视图下 `drawMs` ≤ 12（headless SwiftShader 下可放宽到 25）。
6. 深链：`#n=cn-hodge` 载入即选中并定位；`#q=status:open` 载入即高亮；Esc 依次取消选中→清空查询。
7. 文字里没有原样的 `**`；数据文本不经 innerHTML。
8. 视觉：截图亲眼检查 —— 纸面有纤维与泛黄、铅笔线有手绘抖动、朱墨圈注、首字、页边批注符号清晰。

## §10 测试与截图
`cd "/d/xiangmu/Formula Nebula" && node designs/shot.mjs http://localhost:5190/designs/manuscript/ shots/designs/manuscript/<name>.png --w 1600 --h 1000 --wait "window.__design && window.__design.ready" --eval "<js>" --port <端口> --console`
CDP 端口分配：架构师 9700；M1 9701；M2 9702；M3 9703–9704；M4 9705–9706；M5 9707–9708；评审 9709。
layout 可在 node 下单测：`import { buildGraph } from 'file:///D:/xiangmu/Formula%20Nebula/designs/shared/kb.js'`，dims 用 `texSync` 量，measure 用近似（汉字 1em、拉丁 0.55em）。
截图与临时脚本放 `shots/designs/manuscript/`（脚本文件名以 `_<模块>_` 开头，如 `_m1_check.mjs`）。
