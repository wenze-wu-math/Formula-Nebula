# Formula Nebula 项目交接文档

> 写给接手这个项目的 AI。
> 最后更新：2026-11-02
> 项目根目录：`D:\xiangmu\Formula Nebula`

---

## 0. 先读这一段（最重要）

**当前有三个已知的视觉缺陷，用户已经明确指出，必须优先修**（详见 §8）。
其他功能都正常。

**绝对不要做的事**：
- 不要用 PowerShell `Get-Content` + `-replace` + `Set-Content -NoNewline` 改源码文件
  —— 曾把 `designs/atlas/layout.js` 的所有换行符吃掉，变成 1 行 45KB，恢复花了很久。
  改文件用 `edit` / `write` 工具，或用 Python 按**行号**改（见 §7.3）。
- 不要 `npm install`（依赖已齐全，无网络时会卡死）
- 不要 `git commit`（用户没要求）
- 不要杀掉所有 node 进程（会杀掉用户自己的东西）
- 不要修改 `src/data/` 下的手写内容（`knowledge.js`、`conjectures.js` 等）

---

## 1. 项目是什么

**公式诗云 / Formula Nebula** —— 代数几何知识图谱的多种可视化前端。

- 知识库：4,306 个节点（定理/概念/猜想/研究者）、8,747 条关联
- 前端：一个 3D 主应用 + 四个独立设计稿（atlas / map / manuscript / nebula-plus）

技术栈：原生 ESM + Vite + Canvas 2D（atlas/map/manuscript）+ three.js（根应用与 nebula-plus）
**没有框架**（无 React/Vue），都是手写 DOM + Canvas。

---

## 2. 目录结构与各部分作用

```
D:\xiangmu\Formula Nebula\
├── index.html              根应用入口（3D 公式诗云，端口 5190 的 /）
├── vite.config.js          根应用的 Vite 配置（默认端口 5173，实际少用）
├── vite.designs.config.mjs ★ designs 系列的 Vite 配置（端口 5190，实际在用）
├── package.json            脚本：start / dev / build / verify / check-data
│
├── src/                    ★ 根应用（3D 星云）的源码
│   ├── graph.js            ★★ 最核心：聚合所有数据源，产出 ALL_NODES / ALL_LINKS
│   ├── scene.js            3D 场景（three.js）
│   ├── nebula.js            星云主体渲染
│   ├── ui.js / main.js     界面与启动
│   ├── config.js            视觉参数（颜色、尺寸）
│   ├── data/               ★ 数据层（见 §4）
│   └── ...
│
├── designs/                四个设计稿，各自独立可跑
│   ├── atlas/              A 方案：2D 星图（天文星图风格）
│   ├── map/                B 方案：测绘地图（城市/国家/道路）
│   ├── manuscript/         D 方案：公式诗稿（纸质书页排版）
│   ├── nebula-plus/        C 方案：3D 星云增强版
│   ├── shared/             四方案共用：kb.js（数据）、tex.js（公式渲染）、md.js
│   └── cdp.mjs             ★ CDP 浏览器驱动（自动化截图/测试用）
│
├── kb-src/                 ★ 知识库采集管线（Node 脚本）
│   ├── fetch-*.mjs         下载各源原始数据
│   ├── build-*.mjs         解析成 src/data/*.js
│   ├── verify-*.mjs        数据校验
│   ├── out/                下载缓存（JSON）
│   └── README.md           管线文档
│
├── scripts/                根应用的工具脚本（run-all.mjs、verify.mjs 等）
├── shots/                  截图输出目录
└── docs/                   其他文档
```

★ = 重要，★★ = 最关键

---

## 3. 启动与访问

### 一键启动（推荐）

```bash
cd "D:\xiangmu\Formula Nebula"
npm start
```

端口 **5190**，全部入口都在这个端口下：

| 页面 | URL |
|---|---|
| 根应用（3D 公式诗云） | http://localhost:5190/ |
| atlas（2D 星图） | http://localhost:5190/designs/atlas/ |
| map（测绘地图） | http://localhost:5190/designs/map/ |
| manuscript（公式诗稿） | http://localhost:5190/designs/manuscript/ |
| nebula-plus（3D 增强版） | http://localhost:5190/designs/nebula-plus/ |

桌面上还有 `公式诗云.bat`（双击启动，GBK 编码，内含项目路径）。

### 为什么用 `vite.designs.config.mjs` 而不是根配置

根配置用 `fs.watch`，在 Windows 上多进程写 `designs/` 时会抛 `EBUSY` 让 dev server 崩溃
（2026-11-01 实际发生过）。designs 配置改成轮询 + 不监听 `designs/` 本身。

### 改数据后必须做的事

```bash
# 1. 清 Vite 模块缓存（否则前端还是旧数据）
Remove-Item node_modules\.vite -Recurse -Force
# 2. 重启 5190
# 3. manuscript 还要重建公式缓存
node designs/manuscript/formulas-build.mjs
```

---

## 4. 数据层（`src/data/`）

### 聚合入口：`src/graph.js`

它把下面所有模块 import 进来，合并成 `ALL_NODES` / `ALL_LINKS`，
`export function buildGraph()` 返回：

```js
{
  nodes, links, byId,           // nodes 有 degree 字段（已算好）
  impRange, conjRange, researchRange,
  conjStatusColors, linkTypes,
  stats: { nodeCount, linkCount, crossLinks, galaxyCount, conjCount,
           researcherCount, families, avgDegree, isolated }
}
```

**注意**：`g.adj` / `g.neighbors` **不存在**。要建邻接表得自己从 `g.links` 建
（`l.source` / `l.target`）。我曾因为误用 `g.adj` 得出"607 个猜想全无关联"的错误结论。

### 节点 schema

```js
{
  id: 'scheme',                    // 唯一 id，前缀标识来源
  latex: 'X \\to S',               // 公式（可空）
  name: '概形', en: 'Scheme',
  importance: 0.99,                // 0-1
  family: 'scheme',                // 8 族之一
  summary: '...',                  // 一句话
  detail: '...',                   // 详细说明
  // 定理：无额外字段
  // 猜想：cluster: true, status: 'open'|'proved'|..., field, year, proposer
  // 研究者：researcher: true
  // 自动采集的还有：source / lean / url 等
}
```

### 关联 schema

```js
[from, to, weight, label, type]
// weight: 0-1
// type: 'related' | 'implies' | 'generalizes' | ...
```

### 八个 family

`foundation` 基础 / `scheme` 概形 / `cohomology` 上同调 / `map` 态射 /
`curve` 曲线 / `intersect` 相交论 / `birational` 双有理 / `modern` 现代

### 各数据文件来源

| 文件 | 内容 | 来源 | 生成方式 |
|---|---|---|---|
| `knowledge.js` | 405 定理 + 24 研究者 + 链接 | 手写 | **不要动** |
| `conjectures.js` | 59 猜想 | 手写 | **不要动** |
| `stacks-extra.js` | 2,200 定理 | Stacks Project | `kb-src/build-nodes.mjs` |
| `nlab-extra.js` | 538 概念 | nLab | `build-nlab-nodes.mjs` |
| `mathlib-extra.js` | 487 形式化定理 | Lean mathlib4 | `build-mathlib-nodes.mjs` |
| `unsolved-extra.js` | 500 猜想 | HuggingFace UnsolvedMath | `build-conjectures.mjs` |
| `wikipedia-extra.js` | 48 猜想 | Wikipedia | `build-wikipedia-nodes.mjs` |
| `researchers-extra.js` | 45 研究者 | zbMATH Open | `build-researchers.mjs` |
| `cross-source-links.js` | 1,017 跨源边 | 自动 | `build-cross-links.mjs` |
| `proofs/` | 证明正文 | 手写 | **不要动** |

---

## 5. 四个前端方案

### A 方案 `designs/atlas/` —— 2D 星图

天文星图风格：盘面 + 恒星（定理）+ 深空天体（猜想）+ 星座（定理簇）+ 研究者刻度。

**关键文件**（按重要性）：
- `layout.js` (57KB) ★★ 布局引擎：恒星力导向、猜想放置、星座划分。**最复杂**
- `labels.js` (42KB) ★ 标签放置 + 避让 + 烘焙调度
- `bake.js` (19KB) 公式转位图（MathJax → canvas）
- `render.js` (34KB) 绘制
- `constants.js` (13KB) 所有视觉参数
- `scale.js` 按数据量派生布局尺度
- `glyphs.js` 恒星/深空天体符号（被 render/legend/panel 三方共用）
- `chrome.js` 图外面板（图例、搜索框）
- `panel.js` 详情面板
- `SPEC.md` (46KB) 设计规范

**布局耗时**：4,306 节点约 3.6s（Node）/ 7.8s（浏览器首屏）

### B 方案 `designs/map/` —— 测绘地图

古地图风格：大陆 = 8 个国家（知识族），城市 = 定理，岛屿 = 猜想，道路 = 关联。

**关键文件**：
- `src/world/build.js` (16KB) ★★ 世界构建 13 步流水线
- `src/world/layout.js` (13KB) ★★ 国家放松 + 城市向日葵布局。**城市间距在这里**
- `src/world/fields.js` / `contour.js` 标量场 + marching squares 海岸线
- `src/constants.js` (14KB) ★ 世界尺寸、缩放的常量（**改世界大小要动这里**）
- `src/rules.js` (10KB) 语义缩放规则（levelOf / symbolScale / tier）
- `src/render/symbols.js` 城市/岛屿符号绘制
- `SPEC.md` (48KB)

### D 方案 `designs/manuscript/` —— 公式诗稿

纸质手稿风格：把知识库排成一册书，章节 = 知识族，诗行 = 定理，页边批注 = 猜想。

**关键文件**：
- `layout.js` (17KB) ★★ 排版主控：分页、章节调度
- `layout-chapter.js` (16KB) ★★ 章内两栏排布 `fitBody` / `emitBody`
- `layout-stanza.js` 诗节划分
- `layout-notes.js` 页边批注避让
- `layout-pages.js` 页眉页脚、卷首、题跋
- `layout-util.js` 常量、量宽、断行
- `formulas-cache.json` (18MB) ★ 预渲染的公式位图缓存
- `formulas-build.mjs` ★ 重建上面那个缓存（**改公式后必须跑**）
- `paper.js` / `pencil.js` 纸张纹理、手绘线条
- `SPEC.md` (44KB)

### C 方案 `designs/nebula-plus/` —— 3D 星云增强版

根应用的独立重构版，用 three.js。`src/graph.js` 里也有 `RelaxGrid` 空间网格优化。

**已知问题**：首屏 82.8s（烘焙 ~50s + 布局 ~17s），启动布局比稳态慢 4.5 倍，根因未明。

---

## 6. 采集管线 `kb-src/`

### 数据源状态

| 源 | 状态 | 说明 |
|---|---|---|
| Stacks Project | ✅ | 每个结果有稳定 tag，最好解析 |
| nLab | ✅ | 公式在 MathML `<annotation>` 里 |
| Lean mathlib4 | ✅ | 用 GitHub `git/trees?recursive=1` 列文件，**不要猜路径**（17/28 会 404） |
| zbMATH Open | ✅ | 只有 API 可用（HTML 403）。无合作者/机构字段 |
| UnsolvedMath (HuggingFace) | ✅ | JSON 数据集，最省事 |
| Wikipedia | ✅ | 兜底 |
| Mathematics Genealogy | ❌ | 整站离线（PHP CVE，2026-10-21 起） |
| AIM Problem Lists | ❌ | 证书过期 |
| Open Problem Garden | ❌ | 证书 hostname 不匹配 |

### 常用命令

```bash
node kb-src/fetch-stacks.mjs --limit 1000     # 下载
node kb-src/parse-stacks.mjs                  # 解析
node kb-src/build-nodes.mjs --limit 2200 --balanced   # 生成节点
node kb-src/build-cross-links.mjs             # 重建跨源关联
node kb-src/verify-*.mjs                      # 校验（7 个脚本，全部应通过）
```

### 网络

两个渠道：代理 `http://127.0.0.1:7890`，以及校园网直连。

**Node 的 `fetch` 不读 `HTTP_PROXY` 环境变量**。项目里用手写的 CONNECT 隧道
（内置 `http` + `tls`，没有 `undici`）。

一个渠道不通就换另一个。

### ★ 采集规模的硬约束（血泪教训）

**节点总数直接决定布局耗时**，不是线性的：

| 节点总数 | atlas 布局 | atlas 首屏 |
|---:|---:|---:|
| 4,152 | 3.6s | 4.5s |
| 4,306 | 3.6s | 7.8s |
| 6,458 | **12.9s** | **10.8s** ❌ |

所以 `build-mathlib-nodes.mjs` 有 `ML_CAP`（默认 500），按相关性排序取前 N。
**要扩容必须先解决布局的分治/预计算**，否则首屏不可接受。

---

## 7. 开发要点与坑

### 7.1 浏览器自动化 / 截图

```bash
node designs/shot.mjs "http://localhost:5190/designs/atlas/" "shots/x.png" \
  --wait "window.__design && window.__design.ready" --delay 10000 --port:10130
```

`designs/cdp.mjs` 提供 `openPage({url, wait, port, waitMs})`，
返回的 page 有 `.eval(code)` / `.reload(waitExpr)` / `.errors` / `.close()`。
**没有暴露底层 `send`**。

四个前端都在 `window.__design` 上暴露 API：
- 通用：`__design.ready` / `.stats()` / `.view()` / `.select(id)` / `.search(q)` / `.setView({...})`
- atlas：`__design.atlas`（stars/dsos/regions）
- map：`__design.world`（places/countries/bounds）
- manuscript：`__design.layout`（pages/items/byId/bounds）

**测量前必须等烘焙完成**，否则数据不稳：
```js
while (true) {
  const b = await page.eval('return __design.stats().bakes')
  if (b.done >= b.total * 0.995 && b.queued === 0) break
  await sleep(3000)
}
```

### 7.2 Windows / 编码坑

- 源码文件是 **CRLF**。Python 读要 `newline=''`，写要 `newline=''`
- 字符串替换经常因 `\r` 失败 → **改用行号定位**
- 批处理 `.bat` 里的中文必须用 **GBK** 写（`[System.Text.Encoding]::GetEncoding(936)`）
- 路径有空格（`Formula Nebula`），`start` 命令要写成 `start "标题" /D "%PROJ%" cmd /k ...`
- `timeout` 命令在输入被重定向时报错 → 用 `ping -n 8 127.0.0.1 >nul`

### 7.3 安全改文件的姿势

```python
p = 'designs/atlas/layout.js'
lines = open(p, encoding='utf-8', newline='').read().split('\n')
# 用行号定位，先 assert 确认
assert 'function makeId' in lines[154], lines[154]
lines[154:157] = new_block.split('\n')
open(p, 'w', encoding='utf-8', newline='').write('\n'.join(lines))
```

改完必须 `node --check <file>` 验语法。

### 7.4 其他

- Windows `import(join(...))` 会报 `ERR_UNSUPPORTED_ESM_URL_SCHEME: protocol 'd:'` → 用 `pathToFileURL`
- `Math.hypot` 比 `Math.sqrt(dx*dx+dy*dy)` 慢 3.6 倍（浏览器实测）
- 箭头函数里不能用 `continue`（用 `return`）
- 不要用正则拼接含 `$` 的字符类（`$` 是元字符）

---

## 8. ★★★ 当前三个待修缺陷（用户明确指出）

### 8.1 atlas：猜想（深空天体）全挤在一片

**用户原话**：「2d星图猜想星团怎么全都聚集在一起了，而不是散落在每个部分中」

**已确认的根因**（数据实测，可直接复现）：

607 个猜想的角向分布严重不均（12 个扇区）：

```
恒星:  [314,286,323,317,286,294,291,314,300,297,291,317]   ← 均匀
猜想:  [0,0,0,0,0,1,114,369,123,0,0,0]                     ← 全挤在 3 个扇区
```

只占约 90°。猜想最近邻中位 36（恒星正常），说明挤成一团。

**代码位置**：`designs/atlas/layout.js` 第 611-706 行 `layoutDsos()`

**机理**：
```js
// 第 622-639 行
const nbs = neighbours.get(n.id) || []        // 该猜想的定理邻居
for (const e of nbs) { ... sx += stars[j].x * e.weight; sw += e.weight ... }
X[i] = (sw > 0 ? sx / sw : 0) + (rng()*2-1) * P.dsoJitter   // ← 关键
Y[i] = (sw > 0 ? sy / sw : 0) + (rng()*2-1) * P.dsoJitter
```

- 607 个猜想里 **548 个没有定理邻居**（`sw = 0`）
- 它们的初值是 `(0,0) + jitter`，而 `dsoJitter = 20`
- 从原点出发 ±20 的范围，相对盘半径 3000 极其微小
- 之后靠 `separate()` 的斥力往外推，但 `clampR` 把它们压在半径 `[1151, 2904]` 的环上
- 斥力从原点附近对称推出时方向高度相关 → 塌到一侧

**建议修法**（未验证，供参考）：
把无邻居猜想的初值改成**按黄金角均匀撒在整个盘上**，而不是从原点开始：
```js
const GA = Math.PI * (3 - Math.sqrt(5))
// 对 sw === 0 的猜想：
const rr = dsoRMin + (dsoRMax - dsoRMin) * Math.sqrt((i + 0.5) / m)
const ang = i * GA
X[i] = Math.cos(ang) * rr
Y[i] = Math.sin(ang) * rr
```
这样初值就均匀铺满圆盘，后续斥力只做微调。

**注意**：`dsoScale = min(3, sqrt(m/59))` 已经做过猜想数量自适应，
但它只放大 `dsoDsoR`/`dsoStarR`/`dsoRMax`，没有改初值分布。

---

### 8.2 map：所有首都/中心挤在一边

**用户原话**：「那个城市那个方案怎么也是所有中心或者首都全都聚集在一边」

**已确认的事实**：8 个首都（tier 0）的实际坐标：

| 族 | 首都 id | 坐标 |
|---|---|---|
| foundation | nullstellensatz | (-728, 625) |
| scheme | scheme | (-475, -293) |
| cohomology | sheaf-cohomology | (585, -317) |
| map | coordinate-ring | (-125, 909) |
| curve | b-riemann-roch-curve | (1225, -20) |
| intersect | b-hirzebruch-rr | (783, 373) |
| birational | c-hironaka | (523, 806) |
| modern | h-perfectoid-tilting | (54, 303) |

世界边界是 `{x0:-3000, y0:-2160, x1:3000, y1:2160}`。

**观察**：8 个点全在 x ∈ [-728, 1225]、y ∈ [-317, 909]，
即世界右下偏中的一块（约占世界 1/6 面积），左侧和上方大片空白。
而 `src/constants.js` 里的 `FAMILY_SLOTS` 定义的是 3-3-2 六角布局（`SLOT_UNIT = 510`），
理论上应铺满整个世界。

**根因已定位**（实测对比）：

`FAMILY_SLOTS × SLOT_UNIT` 给出的**理论**坐标 vs `relaxCountries()` 的**实际**输出：

| 族 | 理论坐标 | 实际坐标 | 偏差 |
|---|---|---|---|
| scheme | (-1020, -442) | (-522, -527) | 向内挤 |
| cohomology | (0, -442) | (503, -545) | 向内挤 |
| curve | (1020, -442) | (1279, -159) | 外扩 |
| foundation | (-1530, 0) | (-870, 433) | 向内挤 |
| **modern** | **(-510, 0)** | **(4, 193)** | **严重偏移** |
| intersect | (510, 0) | (710, 250) | 偏移 |
| map | (-1020, 442) | (-190, 799) | 向内挤 |
| birational | (0, 442) | (376, 767) | 偏移 |

整块只占世界 **36% × 31%**（x 从 -870 到 1279，世界是 -3000~3000）。

**根因**：`relaxCountries()` 的排斥参数**没有随世界放大**：

```js
// designs/map/src/world/layout.js 第 37-70 行
const GAP_ADJ = 8      // 相邻国间距 —— 世界放大了 3 倍，这个没变
const GAP_FAR = 130    // 不相邻国的推距 —— 同上
const sum = DISK_K * (R[a] + R[b])   // DISK_K = 0.92（constants.js）
```

而 `R[f]`（国家半径）是从节点数派生的，大约是 290-585。
`GAP_ADJ = 8` 相对半径 500 太小，导致相邻国被拉到几乎重叠；
`GAP_FAR = 130` 也远小于 3 倍后的尺度，所以只推不拉的国家也挤在一起。

**修法建议**：这三个常量都要乘世界放大倍数（3），
或者干脆像 `sepOf` 那样引入一个 `WORLD_SCALE` 统一乘。
注意 `relaxCountries` 末尾还有一步"按面积加权重新居中"，可能也在把整体拉向原点。

---

### 8.3 manuscript：公式完全没放在纸页上

**用户原话**：「那个公式诗稿完全没有放在纸页上啊」

**已确认的根因**（数据实测）：

```
条目 4306，落在纸页外 4306（100%）
页数 45，页高 5800
第 1 页 195 条，y 范围 692 ~ 10123   ← 页高只有 5800
所有条目 y 最大值 55357              ← ≈ 5800 × 9.5
```

**y 坐标没有按页重置**，全部条目堆在一根 55357 长的条带上，
而每页纸只有 5800 高。所以视觉上"没放在纸上"。

**代码位置**：`designs/manuscript/layout.js` 第 180-230 行（我上次加的分页逻辑）

上一轮为了修"章节全挤在一页"，我加了按 y 切段的分页：

```js
const segments = []
// 按 place 顺序累积高度切段...
const y0 = place[seg.from]?.y ?? 0
const shifted = {
  ...fitted,
  f: { ...fitted.f, place: place.slice(seg.from, seg.to).map((it) => ({ ...it, y: it.y - y0 })) },
}
const top = k === 0 ? bodyTop : pg.text.y + 40
const b = emitBody(m, L, pg, ch, p, shifted, top)
```

**问题**：`emitBody` 内部用 `bodyTop + p.y` 算绝对 y。
`shifted` 只减了段内相对 y，但 `top` 传的是 `pg.text.y + 40`，
而第一页传的是 `bodyTop`（来自 `chapterHead`，是同页坐标系）。

结果：第一页的 y 从 692 起，但条目间距和 `pg.text.y` 不在同一坐标系，
累计后飞到 10123。

**建议修法**（未验证）：
在 `emitBody` 里对 `p.y` 做正确的局部坐标映射，
或者更根本地——**让 `fitBody` 直接按页输出，而不是先算一根长条再切**。

另一个可能更省事的思路：**恢复"每章一页 + 页高自适应"**（即回退我的分页改动），
因为那时虽然"章节挤一页"但至少在纸上。然后再做正规的分页。

**回退点**：`designs/manuscript/layout.js` 里搜 `分页续排`，
删掉那段多页逻辑，`makePages(pageH)` 不传 `slotsOf` 即可恢复旧行为。

---

## 9. 已验证正常的部分

- 知识库数据：4,306 节点 / 8,747 关联 / 孤立 0
- 七个校验脚本全部通过（stacks 12、nodes 18、nlab 13、mathlib 15、researchers 15、wikipedia 17、cross 7）
- 四前端都能加载、选中、搜索、深链，0 页面异常
- 根应用（3D）功能正常
- atlas 缩小时的星点密度已修好（glyphScale 指数 0.5→0.85）
- atlas 公式背景色不一致已修（晕边改 nine-slice）
- map 城市间距已改善（世界 3× + 符号按 s 缩放）

## 10. 其他已知问题（优先级低）

1. **atlas 语义缩放不单调**：L 从 0→0.9 时公式数反降（75→30）。
   已诊断为"放置失败"（障碍圆随 zoom 膨胀而标签字号固定），
   已部分修复（`obstacleRadius` 改用基准半径），仍不彻底。
   详见 `designs/atlas/ZOOM-MONOTONIC-OPEN.md`。

2. **nebula-plus 首屏 82.8s**：烘焙 ~50s + 布局 ~17s。
   启动布局比稳态慢 4.5 倍，已排除 7 种假设，根因未明。
   详见 `designs/NEBULA-PLUS-PERF.md`。

3. **跨源关联覆盖率偏低**：Stacks 只有 302/2,200（14%）连到其他源。

4. **`designs/verify.mjs` 的 `hash.reload` 步骤时序脆弱**：reload 后只等 900ms，
   但新页面需要约 5.5s 才 ready。所以 `verify.mjs atlas` 会误报失败。

## 11. 现有方案的缺点（诚实评估）

### atlas（2D 星图）

**优点**：语义缩放设计精细，符号系统有规范（SPEC.md 46KB），标签避让是真正的工程。

**缺点**：
- `layout.js` 已经 57KB，`labels.js` 42KB，**复杂度到了危险区**。
  布局逻辑（恒星力导向 + 猜想放置 + 星座划分 + 障碍注册）全部耦合在一个文件里。
- 力导向是 **O(n²) 倾向**的，4,306 节点 3.6s，再翻倍就不可用。
  没有分治、没有空间索引的分层（`PairGrid` 只是粗筛）。
- 语义缩放**不单调**（§10.1），说明"放大=看得更多"这个基本契约没守住。
- 有 5 个历史版本文件（`layout.recovered.js` / `.step1` / `.v11` / `.v13` / `.v14`），
  共 280KB 死代码躺在目录里，容易误改。

### map（测绘地图）

**优点**：视觉最完整，海岸线用 marching squares 真的生成了有机形状，
13 步流水线（`build.js`）结构清晰。

**缺点**：
- **世界尺度是全局硬编码的**。改 `WORLD_BOUNDS` 必须同步改 `SLOT_UNIT` /
  `GRID_CELL` / `GRATICULE_STEP` / `ISLAND_R1` / `ISLAND_OFFSHORE` /
  `OCEAN_DEPTH_STOPS` / `relaxCountries` 里的三个 GAP —— 漏一个就出这次的 bug。
  这些常量**没有统一的世界尺度变量**。
- 城市间距靠 `sepOf()` + `minDist()` 硬约束，是"网格化"的，不自然。
- 首都/城市位置对数据量敏感：节点数一变，`R[f]` 变，整块布局重排。

### manuscript（公式诗稿）

**优点**：排版最考究（两栏、页边批注避让、行号、弧线连接），`SPEC.md` 44KB。

**缺点**：
- **分页是我改坏的**（§8.3），现在 100% 内容在纸外。
- 依赖 18MB 的 `formulas-cache.json`，改数据必须重跑 `formulas-build.mjs`（要 4.5s + MathJax）。
- `layout.js` 里 `attempt()` 是"页高不够就整体加高重排"的暴力策略
  （`MAX_GROW = 12`，页高 3400 → 5800），本质是**用拉长页面来回避分页问题**。
- 与 atlas/labels 一样，标签/条目避让是 O(n²) 倾向的。

### nebula-plus（3D 增强版）

**缺点**：
- **首屏 82.8s**，其中烘焙 ~50s、布局 ~17s，完全不可用于演示。
- 启动布局比稳态慢 4.5 倍，根因查了 7 种假设都没找到（见 `NEBULA-PLUS-PERF.md`）。
- 与根应用（`src/`）大量代码重复（scene.js / ui.js / graph.js 各 60-90KB），
  改一处要同步两处。

### 数据层

**缺点**：
- `graph.js` 被四个前端各自 import，但 `buildGraph()` 每次调用都重新合并
  4,306 节点 + 8,747 关联，**没有缓存**。
- 跨源关联质量参差不齐：Stacks 只有 14% 有跨源边，
  而 nLab 是 164/538（30%）、mathlib 是 855/2,639（32%）。
- 没有 schema 校验层，坏数据靠 `verify-*.mjs` 事后发现。

---

## 12. 遇到的困难（给接手者省时间）

### 12.1 布局性能是硬天花板

试过的**无效**优化：
- 调小 `repR`：只是让布局更挤，耗时降得不明显（不是纯平方关系）
- Verlet 近邻表：已有，但 `SKIN` 参数和 `iter` 的交互没调好
- 预热（warmup）：完全没有效果（16,767ms → 17,451ms），代码已删

**没试过的方向**（可能有价值）：
- 分层布局：先布局 8 个族中心，再各族内部独立布局（分治）
- 预计算并缓存布局结果（数据不变时直接读）
- Barnes-Hut 近似（把远处节点群当质心）

### 12.2 反复踩的坑

1. **正则替换改源码 → 换行符全丢**。`layout.js` 曾变成 1 行 45KB。
   教训：改源码用 `edit` 工具或 Python 行号定位，**不要用 PowerShell 行内正则**。

2. **Vite 模块缓存**。改数据后前端还显示旧值，必须
   `Remove-Item node_modules\.vite -Recurse -Force` + 重启。

3. **诊断脚本本身的 bug 导致错误结论**。
   我曾报告"607 个猜想全无关联"，实际是 `g.adj` 不存在（应为 `g.links`）。
   **写诊断脚本要先验证查询方式**，不能把脚本输出当结论。

4. **`page.reload()` 的时序**。返回 true 是旧页面的，新页面需要约 5.5s 才 ready。
   所以 `designs/verify.mjs` 的 `hash.reload` 步骤会误报失败。

5. **浏览器测量不稳定**。同一 L 值连续测会得到 76 / 14 这样差异巨大的结果。
   必须"连续 3 次采样相同"才算稳定（见 §7.1）。

### 12.3 用户反馈的处理原则

用户是**看图**反馈的，描述的是**视觉现象**不是技术原因。
例如"猜想全聚在一起" → 实际是初值分布问题；
"完全没放在纸页上" → 实际是 y 坐标没按页重置。

**必须先量化确认**（统计分布、坐标范围、越界计数），再改代码。
我这次三轮里有两次是靠量化定位到根因的，一次（map）差点又要盲改。

---

## 13. 建议的工作顺序

1. **先修 §8.3 manuscript**（最简单，且有明确回退点）—— 让内容回到纸上
2. **再修 §8.1 atlas 猜想**（根因清楚，改初值分布即可）
3. **最后修 §8.2 map 首都**（需要先定位，打点排查 `relaxCountries`）
4. 修完后跑回归：
   ```bash
   node designs/manuscript/formulas-build.mjs
   # 重启 5190，然后
   node designs/verify.mjs atlas|map|manuscript
   ```
5. 都通过后再考虑继续扩知识库——但注意 §6 的性能约束
