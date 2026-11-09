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

- [ ] **G5 · 数据按需加载**（机制已就绪，**尚未接入启动流程**）
  `src/graph.js` 静态 import 全部 17 个数据批次（5.96 MB 源码），
  主包 9.1 MB 里 82% 是数据。手写核心只占 **0.22 MB（3.6%）**，收益明确。

  **已完成**（2026-11-09，第 5 轮）：
  · `buildGraph(source = null)` 接受显式数据源 —— 默认行为与之前逐位一致，
    既有调用方与 14 条单测全部不受影响。
  · `buildGraphAsync()` 返回 `{ core, ready, progress }`：核心图立即可用，
    各批次并发加载后合并。
  · **已验证与同步构建完全等价**：4306 节点 / 8747 连线 / stats 相同，
    且**节点顺序也相同**。顺序这条需要一个修正：按到达顺序合并会产生
    不同的节点顺序，而那会经由 rank 与布局渗进渲染结果，导致「渐进构建」
    与「一次性构建」画出微妙不同的星云。最后一步改为按权威顺序重建。
  · 构建产物仍是 9.1 MB 主包 —— 因为 `main.js` 仍走同步 `buildGraph()`，
    静态 import 仍被并进主 chunk。

  **没做完的部分（下一轮）**：接入 `main.js`。障碍是启动链要求**全量**图——
  `bakeAll()` 要给每个节点烘焙纹理，`layoutGraph()` 要布局整个盘面。
  改成「先画核心、随后重建」是对启动流程的真重构，不是改一行开关。
  在长回合末尾仓促做这件事、又没有时间认真验证浏览器路径，正是把能跑的
  应用改坏的标准方式。留给专门的一轮。

- [ ] **G3 / G4 · 主包体积**（2312 KB gzip，目标 1500 / 1000）
  依赖 G5。数据不下线，体积降不下来。

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

  **下一步**：G6 的真正实现是让 L167 的 `await` 不再阻塞首屏 ——
  先烘焙视野内的公式并出图，其余在后台补。这会改动启动流程，需专门一轮。

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

- [ ] **G10 · lint warnings 390 → ≤200**（现 344）
  第 5 轮清掉了 46 个**未使用的 import 绑定**（27 个文件），390 → 344，
  0 错误。范围刻意收窄：未使用的 *import* 是纯静态绑定，删掉不可能改变
  运行时行为；而"看起来没用"的局部变量/函数可能是有意保留的（例如
  `src/billing/portal.js` 里几个还没被调用的导出）。
  剩余 344 中有 221 个未使用变量、109 个未使用参数，多为库形态模块的
  API 表面，需要逐个判断而不是一把扫。

  清理脚本本身踩了两个坑，都记在这里：动态构造的边界正则经「JS 字符串 →
  正则」两层转义后退化成匹配字面 `\w`，几乎把所有绑定都判成未使用
  （第一次运行删出 102 个语法错误，已回滚）；以及把展开运算符 `...NAME`
  当成了成员访问 `x.NAME` 而误删。

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
