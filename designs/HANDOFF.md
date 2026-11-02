# 交接文档 · 公式诗云多视觉方案（2026-11-01）

## 1. 目标

项目 `D:\xiangmu\Formula Nebula`（公式诗云 · Formula Nebula）原来是一个 three.js 3D 星云：405 条代数几何定理、59 条猜想、24 位研究者，共 488 个节点、1670 条关联。

用户要求：**同一个知识库，做多个完全隔离的前端视觉方案**，每个方案有独立目录和独立入口，互不影响。不做方案 C（层级环）。要做的四个方案：

| 编号 | id | 名称 | 概念 |
|---|---|---|---|
| A | `atlas` | 公式星图 | 2D 古典天文星图：知识族是星座，定理是恒星，猜想是深空天体符号，研究者写在外环 |
| B | `map` | 公式大陆 | 彩色知识地图：知识族是国家，重要定理是城市，关联是道路，猜想是海上岛屿 |
| D | `manuscript` | 公式诗稿 | 浅色手稿纸面：8 章对应 8 个知识族，铅笔线表示关联，猜想写在页边批注，研究者写在题跋 |
| E | `nebula-plus` | 星云修正版 | 保留 3D 星云，修正原有的 5 个问题（见第 4 节 E） |

新方案要解决原星云的这些问题：
1. 总览时公式读不出来。
2. 拉近后公式互相叠压。
3. 8 个知识族在 4 条旋臂上混排，颜色和位置对不上。
4. 3D 操作成本高，传达的信息少。
5. 猜想星团的柔光有一道硬圆弧边。

## 2. 硬性规则

- **绝不修改** `src/`、`index.html`（根目录）、`package.json`、`vite.config.js`。`src/` 里有用户自己未提交的改动，不要碰，也不要做 git 提交。
- 每个方案只写 `designs/<id>/` 和 `shots/designs/<id>/`。`designs/shared/` 是共用层，只读。只有最后的画廊步骤可以改 `designs/index.html`。
- 不装 npm 包，不引用 CDN，必须能离线运行。
- **绝不**执行 `Stop-Process -Name node` 或 `taskkill /IM node.exe` 这类会杀掉所有 node 进程的命令，只杀自己启动的进程 PID。
- 界面文字用中文。数据里的 `**粗体**` 用 `designs/shared/md.js` 处理，不要把数据直接拼进 innerHTML。

### 2.1 ⚠ 浏览器纪律（2026-11-01 事故后新增，最高优先级）

**事故**：四个代理并行开发时各自一边改代码一边截图，同时跑出 42 个 headless 实例、全机 209 个浏览器进程，**用户电脑死机一次**；期间还有一个代理的截图会话留下残留锁，导致后续全部排队。

**现行策略：构建期只写代码，验收期统一跑一次。**

- `designs/_browser-lock.mjs` 有总开关：**除非显式设置 `FN_ALLOW_BROWSER=1`，任何 `shot.mjs` / `cdp.mjs` 调用都会立刻报错退出**。这是刻意的熔断，不要绕过。
- 构建阶段（多个代理并行改代码）**禁止任何截图/浏览器操作**，只能读代码、改代码、跑纯 Node 静态检查。
- 需要视觉证据时，由 Lead **单独**用 `FN_ALLOW_BROWSER=1` 运行，一次跑完所有方案。
- 即使开启，全局锁仍强制**同一时刻只有 1 个 headless 实例**；锁带进程存活检测，机器死机后可自动回收残留锁。
- 写文件**直接覆盖**，不要"写临时文件再 rename"——Windows 上会让 Vite 的 `fs.watch` 抛 EBUSY 使 dev server 崩掉。

### 2.2 开发服务器

根目录 `vite.config.js` 用 `fs.watch`，并行开发时会被 EBUSY 打崩（已实际发生）。因此设计稿开发用**独立配置**，不改根配置：

```
node node_modules/vite/bin/vite.js --config vite.designs.config.mjs --port 5190 --strictPort
```

该配置用轮询、并忽略 `designs/` 监听（设计稿改动靠刷新页面，不需要 HMR）。

## 3. 已完成且可用

- **共用数据层** `designs/shared/`（已测试，结果与原 `src/graph.js` 完全一致）
  - `kb.js`：导出 `getGraph()`（带缓存的 buildGraph）、FAMILIES、CONJECTURE_STATUS、RESEARCHER_AREAS、链接类型工具、parseQuery、findPath、`nodeHex(n)` 等
  - `tex.js`：`await tex(latex, '#hex')`，返回 `{svg, widthPx, heightPx}`。用 MathJax 生成 SVG，可以指定颜色
  - `md.js`：`inlineMd`、`inlineMdHtml`、`stripMd`
  - `style-base.css`
- **截图工具** `designs/shot.mjs`（无依赖，headless Chrome 加 CDP）：
  ```
  node designs/shot.mjs <url> <out.png> --wait "window.__design && window.__design.ready" --eval "<js>" --delay 1500 --port <CDP端口> --console
  ```
  它会打印页面异常和 eval 的返回值。截图后要用图片查看工具亲眼看一遍。
- **⚠ 并发纪律（2026-11-01 新增，务必遵守）**：所有 headless 浏览器调用都走 `designs/shot.mjs` 或 `designs/cdp.mjs`，两者内置 `designs/_browser-lock.mjs` 的**全局串行锁**（同一时刻只允许 1 个实例）。曾因多代理并发截图同时跑出 42 个 headless 实例、全机 209 个浏览器进程而严重卡顿。**不要绕过这两个工具直接 spawn 浏览器**。单次截图约 6 秒，排队时耐心等，不要重试。
- **像素分析** `designs/imgstat.mjs`（零依赖，自带 PNG 解码）：`--rows` 看每 10% 高度带、`--repeat` 检测纵向重复、`--crop` 看局部、`--diff` 对比两图。**模型看不到图片时，用它的数字做视觉判定**。
- **统一验收器** `designs/verify.mjs`：`node designs/verify.mjs <atlas|map|manuscript|nebula-plus> [--out dir] [--quick]`。机器判定 boot / 三视口 / 标签零重叠 / 选中三类节点 / 搜索 / 深链往返 / 静止不空转 / 公式烘焙完成度，输出 `verify.json`，失败退出码 1。
  - 2026-11-01 基线：atlas 32/32 PASS、map 30/31（hash.restored 失败）、manuscript 32/32 PASS、nebula-plus 因缺 `window.__design` 无法启动验收。
  - 注意 manuscript 冷启动（字体缓存）偶尔超过 30s，**首轮失败请重跑一次再判定**。
- **画廊页** `designs/index.html`：框架已写好，但 `const DESIGNS = []` 还是空的，需要最后填上。
- **每个方案约定的调试句柄**：`window.__design = { ready, graph, select(id), deselect(), search(q), view(), setView(obj), stats() }`，其中 `stats().overlappingLabels` 应为 0。

## 4. 各方案现状（都停在"建造"阶段，还没有集成、评审和收尾）

截图都在 `shots/designs/handoff/<id>.png` 和 `.log`，这是停工时的状态。

**A atlas：基本可跑，完成度最高。** 有 SPEC.md（620 行），大约 20 个模块已经写好（layout、render、labels、bake、camera、input、panel、search、chrome 等）。
- 截图里能看到：星图圆盘、金色网格和刻度环、8 个星座区域和星座连线、朱红色猜想符号、外环研究者名字、图例、搜索框。`ready=true`，标签重叠为 0。
- 待办：
  - 公式烘焙很慢：截图时 464 个里只完成了 22 个，`updateMsAvg` 为 25ms，fps 很低，需要性能优化。
  - 部分公式标签压在星点上。
  - 还没有逐项验证选中、面板、深链和手机布局。

**B map：可跑，但视觉离目标还远。** 有 SPEC.md（540 行），`src/world`、`render`、`labels` 和 `ui` 都已经写好。另外还有 `dev/` 调试页和 `tools/` 两个目录，交付前需要清理或说明用途。
- 截图里能看到：浅蓝海洋，各族用彩色圆形国家表示，有城市符号、国名（中文加拉丁名），猜想是外圈的虚线岛屿，图例完整。`ready=true`，标签重叠为 0。
- 问题：
  - **国家是规整的圆**，不是有机的海岸线。brief 要求用距离场或 Voronoi 加平滑生成边界。
  - 跨族道路太多，画面很乱，应该默认隐藏或只显示强关联。
  - 截图在 y≈808 以下又重复了一遍画面顶部。我检查过页面 `scrollHeight == innerHeight`，只有 1 个输入框，所以可能是 canvas 绘制或 transform 的问题，也可能只是截图的假象，**还需要排查**。
  - 右侧有面板被裁切了一半。

**D manuscript：可跑，总览效果不错。** 有 SPEC.md（526 行），模块齐全。
- 截图里能看到：纸纹底、10 页手稿（扉页、I–VIII 章、题跋）、左侧章节导航、顶部搜索框和"全卷 / 铅笔弧 / 凡例"按钮。`ready=true`，标签重叠为 0。
- 待办：
  - 总览时大部分公式显示成灰色占位条。这是语义缩放的设计，但要确认拉近以后公式能清楚显示。
  - 题跋里的研究者名字太小。
  - `formulas-cache.json` 有 2.2MB，是预先烘焙的公式缓存，由 `formulas-build.mjs` 生成。需要评估要不要保留，以及数据改动后是否会过期。`formulas-bench.html` 是调试页。
  - 还没有验证选中、铅笔连线、面板和深链。

**E nebula-plus：只完成了复制，5 个修正都还没做。** 有 SPEC.md（430 行）。`designs/nebula-plus/src/` 是从 `src/` 复制过来的，目前只改了导入路径，和原版只差几行。页面能跑，截图和原星云一样，但**没有 `window.__design`**。
- 5 项修正全部待做：
  1. 每条旋臂对应一个知识族，星云粒子的旋臂骨架要同步。
  2. 远处只显示光点，标签只给屏幕上碰撞检测后不重叠的前 N 个公式。
  3. 焦点以外的公式按深度淡出，消除叠字。
  4. 选中的公式用 2D 卡片（DOM 加 KaTeX）浮在屏幕上显示。
  5. 修掉星团柔光的硬边。

## 5. 下一步应该做什么（按顺序）

1. 启动开发服务器（我已经停掉了）：
   ```
   cd "D:\xiangmu\Formula Nebula" && node node_modules/vite/bin/vite.js --port 5190 --strictPort
   ```
   各方案地址是 `http://localhost:5190/designs/<id>/`，画廊在 `/designs/`。
2. 每个方案先读它的 `SPEC.md`，然后做**集成**：在 1600×1000 下零页面异常，并逐项用 `__design` 跑通总览、缩放（setView）、选中定理、选中猜想 `cn-jacobian`、选中研究者 `rs-scholze`、`search('上同调')`、deselect、hash 深链。
3. 按第 4 节的问题清单修复：A 的性能，B 的有机边界、道路密度和重复渲染，D 的拉近可读性和题跋，E 的全部 5 项。
4. 评审，从三个角度看：
   - **视觉**：在 1600×1000、1280×800、390×844 三个尺寸下截图，亲眼看；
   - **功能**：488 个节点全部可搜索、可选中，深链往返一致，resize 和手机布局正常；
   - **性能**：首屏不超过 3 秒，静止时不重绘，烘焙不阻塞主线程。

   评审后修复，做一到两轮。
5. 收尾：
   - 每个方案写 `designs/<id>/README.md`（中文：设计理念、视觉编码、运行方式、文件结构、交互、已知限制）；
   - 拍 `shots/designs/<id>/final-*.png`，并复制一张作为 `designs/<id>/thumb.png`；
   - 清理 `dev/`、`tools/`、`*-bench.html` 这类调试文件，或者在 README 里说明用途。
6. 填写 `designs/index.html` 的 DESIGNS 列表（四个方案，再加一张链接到 `/` 原版的卡片），写 `designs/README.md`。

四个方案互相独立，可以并行推进，每个方案内部也可以按模块并行。

## 6. 参考

- 原项目的架构：README.md（约 150KB），以及 `src/scene.js`、`nebula.js`、`glow.js`、`palette.js` 里的注释（为什么不用 bloom、亮度上限 1.42、OKLCh 等亮度配色等）。
- 中断的工作流脚本以 run id `wf_d386e4e6-b32` 为准，脚本内容和第 5 节的流程一致，换一个环境后不能直接 resume。
