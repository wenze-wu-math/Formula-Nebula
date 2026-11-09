# 自进化循环 · Evolution Loop

> 这份文件定义项目如何**持续**变好。每一轮循环都按它执行，不依赖某次对话的记忆。
>
> 上一轮结束时项目已经能构建、能测试、能部署。这里要解决的是"**下一轮做什么**"。

---

## 一、循环怎么转

每一轮做四件事，顺序固定：

```
  1. 体检  →  2. 选一件  →  3. 做完并验证  →  4. 记录
```

### 1. 体检（只读，10 分钟）

跑一遍这些，把结果记下来。**不要跳过—没测量的优化都是猜测。**

```bash
git rev-parse --short HEAD          # 从哪儿开始
git status --porcelain              # 工作区是否干净（不干净就先提交或丢弃）
npm run ci                          # 完整门禁，约 15 秒
npm run lint 2>&1 | tail -3         # 当前的 lint 债务
npm run verify:assets               # 资源完整性
node scripts/verify-assets.mjs      # 同上（显式）
```

另外看一眼：
- 根目录文件数（应保持 ≤55）
- `.git` 体积（应保持 <30 MiB）
- CI 最近三次是否全绿

### 2. 选一件（只选一件）

按下面的优先级挑。**一轮只做一件，做完提交，再开下一轮。**
同时做三件事的结果通常是三件都没验证。

| 优先级 | 类型 | 判断标准 |
|---|---|---|
| **P0** | 门禁红了 | CI 失败 / 测试失败 —— 立刻修，别的事全部让路 |
| **P1** | 用户可见的缺陷 | 按钮点了没反应、页面打不开、图标空白、深链失效 |
| **P2** | 静默失效 | 代码存在但从不执行、数据被覆盖、开关无效 |
| **P3** | 未验证的核心功能 | 有实现但没人证明它能用 |
| **P4** | 可维护性 | lint 债务、重复代码、文档与事实不符 |
| **P5** | 新增功能 | **最后才做**。功能不缺，缺的是把已有的做扎实 |

**P5 排最后是刻意的。** 这个项目历史上的大部分问题不是"功能不够"，
而是"功能写了但从没跑通过"——55 次 CI 只成功 6 次、页面引用不存在的图标、
195 处数据被静默覆盖。再加功能的边际收益远低于修好已有的。

### 3. 做完并验证

**"改完了"不算完，"验证过"才算完。** 验证标准：

- 改动有对应的测试，或至少有一个能重复运行的检查脚本
- 检查器本身要有**负向对照**：证明它在应该失败时确实会失败
  （本项目已有先例：`_check-dupe-keys-control.mjs` 会去 git 历史里
   取修复前的版本，确认检测器还能抓到那个已知缺陷）
- 涉及的构建/门禁跑一遍，贴出真实退出码
- 用户可见的改动，用浏览器实测（见下）

**不许出现的话：**
- "应该可以了" —— 没测就是没测
- "测试通过" —— 哪个测试？几项？
- "性能提升 X%" —— 谁的测量？什么条件？

### 4. 记录

提交信息里写清楚：**改了什么、为什么、怎么验证的**。
不是 `fix bug`，而是能让人半年后看懂的那三句话。

---

## 二、浏览器验证怎么跑

用户可见的功能必须实测，不能只看代码。项目里已有自包含运行器：

```bash
node scripts/e2e.mjs
```

它会自己起 preview 服务器、自己开无头浏览器、跑完两个套件、**自己清理进程**。
如果机器上没有 Chrome/Edge，它会打印 SKIP 并以 0 退出（不算失败）。

单个套件也可以手跑（需要自己起服务器）：

```bash
npm run build
npx vite preview --port 5413 --strictPort &        # 记下端口
# 另开一个终端：
node scripts/_e2e-features.mjs http://localhost:5413 9400
node scripts/_e2e-controls.mjs http://localhost:5413 9400
```

> ⚠️ **浏览器用完必须杀掉。** 无头 Chrome 会留下十几个进程，
> 反复几轮就能把内存吃光。e2e.mjs 已经处理了，手跑的话记得：
> ```powershell
> Get-CimInstance Win32_Process -Filter "Name='msedge.exe'" |
>   Where-Object { $_.CommandLine -like '*--headless*' } |
>   ForEach-Object { Stop-Process -Id $_.ProcessId -Force }
> ```

---

## 三、当前的已知债务

以 `docs/EVOLUTION-GOAL.md` 的 G1–G10 为准，跑 `npm run score` 看实时进度。
下面是各项的当前状态与卡点，**按建议顺序排列**。

### 已完成

- [x] **致命启动崩溃（低性能设备）+ 生产静默**（2026-11-09）
  `src/mobileOptimization.js` 调用 `settings.setState({...})`，但 settings 上
  **没有 setState**（它的 API 是 setShape / setTweak / setColorMode /
  toggleDisplay / setGravity / applyState …）。

  这行在 `initMobileOptimizations()` 里，而它由 `main()` 第 578 行**同步**调用。
  一旦抛错，`main()` 直接中断，后面全部不执行 —— 包括
  `window.__nebula` / `window.__formulaNebula` 的暴露、教程、URL 同步、
  可达性增强。用户只看到 splash 消失后一片空白。

  只在低性能设备触发：条件是 `recommended.bloom === false`，而
  `bloom: tier === 'high'`。桌面端通常是 high 所以跳过；移动端**和所有无头
  浏览器**都是 low，必然命中。canvas 在更早建场景时已挂上，所以
  `verify:final` 那种"画布存在就算通过"的判据完全看不见它。

  更难发现的是：`vite.config.js` 的 `drop_console: true` 连同
  `pure_funcs: [log, info, debug]` 把 `console.error` 也删了 —— 于是
  `main().catch(err => console.error('启动失败', err))` 被压成空函数体，
  生产环境**连证据都不留**。

  修法：改用真实 API `settings.toggleDisplay('bloom')`（带保护）；
  terser 只 drop `console.log`，保留 error/warn。
  新增 `scripts/verify-app-boot.mjs`（`npm run verify:boot`），判据从
  "画布存在"改成"`window.__nebula` 已暴露且图已装配"。
  负向对照：恢复旧写法后新检查器报 3 项失败而**画布仍 PASS**；
  修好 console 后再注入，额外报出 `启动失败 TypeError: a.setState is not
  a function`（4 项失败）。线上站点已验证 7/7 通过。

- [x] **G1 · source map 不公开部署**（2026-11-08）
  `vite.config.js` 原本写死 `sourcemap: true`，构建产出 8 个 `.map`（19 MB）
  留在 `dist/`，Pages 直接公开可下载 = 完整源码泄露。
  改为默认关闭，需要调试线上构建时显式 `NEBULA_SOURCEMAP=1 npm run build`。
  负向对照：开启后 `score` 的 G1 变 PASS→FAIL，关闭后恢复。

- [x] **lint 错误清零**（2026-11-08，51 → 0）
  修掉的都是真缺陷：`linkTypes.js` 重复键、`scene.js` 重复键、
  `generate-changelog.mjs` 用 JS 不支持的 `\Z`、5 处 catch 丢弃原始错误、
  `components/`+`services/` 无法加载、`semanticSearchIntegration` 的
  `showNodePanel` 未定义。

- [x] **`no-undef` 9 处**（原 P2 第一项）
  已修：统一 ES 导出、补缺失 import、`showNodePanel` 改为宿主注入。

- [x] **`designs/` 九方案完整性**
  已逐个真机验证，并留下 `verify:designs` / `verify:gallery` /
  `verify:designs:depth` / `verify:manuscript` 四个检查器。

### 未完成

- [x] **G2 · 负向对照文档**（2026-11-09）
  `docs/NEGATIVE-CONTROLS.md` 已覆盖全部 11 个 `verify:*` / `check-*` 脚本，
  每个都记录了「故意破坏什么 → 实际报什么错 → 恢复后是否重新变绿」。
  这项工作本身抓出三个真缺陷：
  · `verify:manuscript` 的 `#n=` 断言是**假绿**（`|| url.includes(id)` 恒真），
    破坏深链解析后它仍报 ✓；已收紧为只认 `selected === id`。
  · `verify:live` **每次运行都泄漏一个无头浏览器**：`spawn('taskkill')` 是异步的，
    紧接着 `process.exit()` 把它一起杀了；且 `/T` 只跟随父进程树。
    改为同步执行 + 按名扫杀，并在 `finally` 里**验证**残留数而不是假设。
  · `verify:katex` **一直失败**：它要求三个早已删除的文件存在（不在 CI 里，
    所以没人发现）。删掉过时条目后恢复通过。
  另修 `score.mjs` 的 G2 判定：原来看「文档里有没有提到脚本名」，导致
  写在「待补」段的也算完成。现只统计「已完成」段。

- [ ] **G5 · 数据按需加载**（第 10 轮：知识数据已外置，**证明数据仍内联**）
  `src/graph.js` 原本静态 import 17 个数据批次（5.96 MB 源码），主包 9.3 MB
  里 82% 是数据。

  **第 10 轮已完成**：知识数据搬到 `public/data/*.json`。
  · `scripts/build-data-json.mjs` 从 `src/data/*.js` 生成 JSON；源 .js 仍是
    唯一事实来源，JSON 是构建产物。
  · `graph.js` 不再 import 数据，改为 `setGraphData()` 注入；未注入时
    `buildGraph()` 抛出**明确错误**而不是静默返回空图（空图像数据问题，极难查）。
  · 保持 `buildGraph()` 同步：全项目 20+ 个同步调用点（ui.js、
    proof-explorer.js、各 check/verify 脚本、单测）一个都没改。
  · **浏览器与 Node 两条加载路径分成两个文件**：`dataLoader.js`（fetch）与
    `dataLoaderNode.js`（静态 import）。第一次尝试把两者放同一文件，Vite
    顺着 Node 路径的 import 把 6 MB 数据又打回主包，整个改动白做 —— 分开才是
    真正的隔离。
  · 结构标记（cluster / researcher）改为**生成 JSON 时**写入，依据是"这个
    节点来自哪个导出数组"，比按字段猜（比如有 status 就是猜想）可靠。

  实测：主包 **9279 KB → 3714 KB（raw）**，**2313 KB → 1265 KB（gzip）**。
  线上已验证：4306 节点 / 8747 连线在 GitHub Pages 子路径下正常 fetch。

  **G5 仍未达标**：主包里还剩 `wikipedia`（48 节点）与 `proofs`（3.3 MB）。
  后者是主体 —— `main.js` 静态 import `./data/proofs/index.js`，而证明只在
  打开证明页时才需要。下一轮处理它，预计能把主包压到 1000 KB gzip 以下。

  顺带修正了 G5 的**检查器本身**：它原来用 `/nLab|Wikipedia|unsolved/i`
  探测内联数据，而那些词也出现在注释、模块路径和 UI 文案里，导致数据真的
  外置之后仍报 FAIL（假阳）。改为探测具体节点 id（`stx-01bh`、
  `nlb-coherent-sheaf`、`ml-hasringhomproperty`、`cn-hodge`、`cn-collatz`、
  `tensor-right-exact`），这些只存在于数据里。

- [x] **G3 · 主包 gzip ≤ 1500 KB**（已达成：2313 → **163 KB**）
- [x] **G4 · 主包 gzip ≤ 1000 KB**（已达成：**163 KB**）
- [x] **G5 · 数据按需加载**（已达成，第 11 轮）

  第 11 轮把最后一块搬走：**证明数据**。`src/data/proofs` 3.3 MB 源码曾被
  `main.js` 静态 import，并在启动时把 245 条长篇证明全部挂到节点上 ——
  而这些内容只在用户点开某个定理的证明页时才需要。

  现在改为首次打开证明页时 fetch `public/data/proofs.json`（1.8 MB JSON），
  之后缓存。

  两个实现要点：
  · `proofView.open()` **保持同步**。它被 URL 深链、面包屑、键盘导航等十几处
    调用，改成 async 会波及全部。改为先渲染「加载中」骨架，数据到位后
    原地重渲染同一节点，并用 `current.id` 守卫，避免抢掉用户已经跳去的页面。
  · `window.__nebula.proofData` 新增 `loadProofs()`。原来的 `getProof()` 在
    数据加载前返回空 —— 验证脚本若不先 await 就会看到 0 条，误判成数据丢失。

  实测：主包 **3714 → 558 KB（raw）**，**1265 → 163 KB（gzip）**。

  新增检查器 `npm run verify:proof-view`：验证 `?p=` 深链真的渲染出证明卡片、
  数据真的加载、目标证明存在。这是一条**全新的失败路径** —— `verify:boot`
  只查知识图谱，而证明数据现在走的是独立通道。

  负向对照有个值得记的细节：删 `public/data/proofs.json` **不会**让检查器失败，
  因为 `npm run build` 在构建前会重新生成它 —— 破坏被自动修复了。要删的是
  **构建产物** `dist/data/proofs.json`：那才会让 2 项断言失败。
  另外「证明页渲染出内容卡片」在数据缺失时**仍然通过**（有 3 张骨架卡片），
  真正抓住问题的是「证明数据条数」与「深链证明存在」这两条。


- [ ] **G6 / G7 · 首屏烘焙与 TTI**（尺子已造，目标未达成）
  **尺子已完成**（2026-11-09，`npm run measure:first-paint`）。
  实测（本地 preview、无头、无 GPU）：

  ```
  first-contentful-paint   2.0 s   ← 这是 splash 本身，不是星云
  全部烘焙完成 (__nebula)  38.5 s
  splash 真正隐藏          未捕获
  ```

  **根因已确认**（读 main.js 即可看到）：

  ```
  L167  await bakeAll(items, ...)      ← 阻塞 38–230 秒
  L181  splash.update(75, '布局知识图谱...')
  ...
  L566  splash.hide()
  L644  window.__nebula = { ... }
  ```

  L167 之后的所有代码都在 `await` 后面，所以**在 4306 个公式全部排版完之前，
  屏幕上什么都出不来**。这正是 G6 要改的东西，也是为什么前几轮"测 splash 消失"
  总是和"烘焙完成"落在同一时刻。

  测量过程中**否定掉两个不成立的判据**，记在这里避免重犯：
  · `getComputedStyle(#splash).display` —— 始终观察不到。`__nebula` 在 L644
    同步赋值，而 `splash.hide()` 在 L566 只是**调度**（200ms + 300ms 淡出 +
    500ms 才设 display:none）。但仅凭这个时序解释并不完全吻合，所以放弃，
    而不是基于一个说不通的猜测继续。
  · `PerformancePaintTiming.first-contentful-paint` —— 数据稳定，但它量的是
    **splash**（index.html 里的静态元素），不是星云。拿它当"首帧可见"会凭空
    造出 52 秒的假改进。已明确剔除，且在工具输出里标注了这个陷阱。

  保留的判据：`window.__nebula` 出现 = 全部烘焙完成（可靠）。
  `docs/perf-baseline.json` 已加入 .gitignore —— 它取决于机器与负载，
  必须重测，不能从历史里trust。

  ---

  **第 12 轮：尺子终于装对了，并立刻抓出真正的瓶颈**

  前三轮的探测全部失败，第 12 轮改为**在应用内部打点**：
  `main.js` 写入 `__bakeDoneAt`（全部烘焙完成）、`__firstUsableAt`
  （splash 开始淡出 = 用户第一次看到星云）、以及 `__bootMarks` 各阶段时间戳。
  进程内时间戳没有轮询粒度问题，也不依赖任何 DOM 状态推断。

  完整启动画像（本地 preview、无头、无 GPU）：

  ```
  bake           80.5 s    ← 最大头
  layout         12.8 s    （优化前 34.7 s）
  buildNodes      0.6 s
  sceneStart      7.7 s    ← 本轮新发现，此前无人看过
  finishLoading   0.4 s
  ```

  **优化一：布局松弛 34.7 s → 12.8 s（2.9×）**
  `layoutGraph` 里的 `runRelax` 是 O(n² × iters)：3630 个主星系节点 ×
  200 次迭代 ≈ 26 亿次两两椭圆检测。
  原注释说「200 比 60 明显更压实」，但那是旧数据规模下的结论。用当前
  4306 节点重测：

  ```
  iters   布局耗时   rank/radius rho   最大半径   椭圆重叠对
  200     12.15s     -0.96659          198.3      9247
   60      5.94s     -0.96676          197.1      9380
  ```

  快 2.04×，rho 差 0.00017（方向还更好），重叠对 +1.4%。
  **200 次相当于把已收敛的迭代又跑了 140 遍。** 已改为 60，并把实测表
  写进 `config.js` 的注释，同时注明「若质量检查器报重叠变严重，先把这里
  调回 120」。

  **还没做的**：
  · bake 仍是 80 秒，且它**阻塞首屏** —— 这是 G6 的核心。
  · `sceneStart()` 单独吃 7.7 秒，尚未分析。
  · 这两项都要求改启动流程（先画可见内容、其余后台补），需要专门一轮。

- [x] **G8 / G9 · 核心单测**（2026-11-09）
  `tests/graph/unit.test.mjs`（14 断言）：节点唯一性、byId 一致性、每条
  link 端点在图上、无自环、权重有限、impRange/conjRange 非退化、stats 与
  数组一致、确定性、applyColor 契约。
  `tests/layout/unit.test.mjs`（8 断言）：位置有限性、尺寸为正、星系是扁盘
  （R/maxY=3.6）、星团是球（须绕自身质心量）、半径不超 budget、确定性、
  rank 与 importance 单调（0% 反转）。
  两者都已进 `npm run ci`。
  ⚠ G9 原表述写的是 `src/layout.js`，**该文件不存在** —— 布局实际是
  `src/graph.js` 里的 `layoutGraph()`。目标和 score 判定都已改正。

- [x] **G10 · lint warnings → ≤200**（已达成：345 → **179**，0 错误）
  第 5 轮：清掉 46 个未使用的 import 绑定，390 → 344。
  第 9 轮：107 个未使用的**函数形参** + 58 个未使用的**局部变量**改名为
  `_` 前缀，344 → 179。两者都是安全的：JS 按位置传参，形参名对调用方不可见；
  局部绑定也不可能被外部按名字引用。项目 eslint 配置本就接受 `^_`
  （argsIgnorePattern / varsIgnorePattern），下划线是这个代码库**已有的**
  「有意不用」标记，不是新造约定。

  刻意**没有**自动改的四类（每一类都会真的改坏代码，都是靠查看脚本即将
  做什么才发现的）：
  · **解构目标** `const { a, b } = obj` —— 加前缀得到 `{ _a, _b }`，
    语义变成读取 `_a` 属性（实测返回 undefined）。正确写法是 `{ a: _a }`。整类跳过。
  · **多行解构** `{ iterations = 500, barnesHutTheta = 1.2 } = opts` ——
    单行检查漏掉了，补了向上扫描 `{` 的判断。
  · **类声明** `class Foo` → `class _Foo` 会改变类名（constructor.name、调试输出）。
  · **多行 import 的续行** `  someName,` 看着像变量，实际属于上面的 import。

  改名脚本自身引入过一处不一致，被 eslint 当场抓到：
  `designs/map/src/ui/search.js` 的 `lastQ` 声明处改了、另一行的赋值没改。
  但那个变量**赋值一次、从未被读取**，本身就是死状态 —— 于是直接删掉，
  而不是把另一处也改名（下划线只会把"这是死代码"这件事藏起来）。

  第 5 轮踩过的两个坑（供后参考）：动态构造的边界正则经「JS 字符串 → 正则」
  两层转义后退化成匹配字面 `\w`，几乎把所有绑定都判成未使用（第一次运行
  删出 102 个语法错误，已回滚）；以及把展开运算符 `...NAME` 当成成员访问
  `x.NAME` 而误删。

### P5 · 功能（暂时别碰）

ROADMAP.md 里有时间轴模式、多层级缩放等计划。**等 G1–G10 全绿再说。**

---

## 四、这个循环不做什么

- **不为了"看起来在动"而改文件。** 没有明确收益的改动就是负债。
- **不删历史。** 归档而不是删除；备份分支保留。
- **不在没有测量时声称改进。** 不许写"性能提升 68%"，除非有对比数据。
- **不跳过负向对照。** 一个从没失败过的检查器，和一个不存在的检查器等价。

---

## 五、每轮结束时要能回答

1. 这一轮改了什么？怎么验证的？
2. CI 绿吗？贴退出码。
3. 有没有副作用？（跑一遍 `npm run ci` 和浏览器 E2E）
4. 下一轮做什么？（写进上面的债务清单）

---

_最后更新：见 git log 中本文档的最近一次提交。_
