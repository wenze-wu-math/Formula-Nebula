# 负向对照记录 · Negative Controls

> **一个从没失败过的检查器，和一个不存在的检查器等价。**
>
> 这份文件记录：对每个检查器，我们**故意破坏了什么**、它**报了什么错**、
> 以及**恢复后是否重新变绿**。没有这三步记录的检查器，不算检查器。

本文覆盖 `package.json` 里所有 `verify:*` / `check-*` 脚本。`npm run score` 的
G2 按本文覆盖度计分：脚本名出现在文中才算覆盖，`TODO` 不算。

最后更新：2026-11-09

---

## 已完成（9 / 11）

### check-data

| | |
|---|---|
| 破坏方式 | 在 `src/data/knowledge.js` 末尾追加 `NODES.push({ ...NODES[0] })`，制造重复 id |
| 期望 | 非零退出并指出重复项 |
| 实际 | `✗ id 重复: zariski-topology (knowledge.js 与 knowledge.js)` / `✗ latex 重复: ...` / `✗ 发现 2 个问题`，exit 1 |
| 恢复 | 移除注入 → `✓ 数据校验通过`，exit 0 |

### verify:assets

| | |
|---|---|
| 破坏方式 | 删除 `dist/favicon.svg`（被 `index.html` 与 `manifest.json` 同时引用） |
| 期望 | 非零退出并指出缺失的资源 |
| 实际 | `✗ favicon.svg referenced by index.html but missing in dist/` / `✗ icon "favicon.svg" declared in manifest but missing in dist/` / `FAILED: 2 broken asset reference(s)`，exit 1 |
| 恢复 | 放回文件 → `OK: every referenced asset exists in dist/`，exit 0 |

### verify:readme

| | |
|---|---|
| 破坏方式 | 把 README 里的真实统计 `3630` 改成 `9999` |
| 期望 | 数字断言失败 |
| 实际 | `Results: 14 passed, 1 failed`，exit 1 |
| 恢复 | 改回 → `Results: 15 passed, 0 failed`，exit 0 |

### verify:proofs

| | |
|---|---|
| 破坏方式 | 把 `src/data/proofs/batch-26.js` 的证明键 `'c-dbp'` 改成不存在的节点 id `'nonexistent-node-xyz'` |
| 期望 | 非零退出并指出悬空引用 |
| 实际 | `✗ nonexistent-node-xyz: proof key does not match an existing node id` / `✗ Proof validation failed with 1 issue(s)`，exit 1 |
| 恢复 | 改回 → `✓ Proof data validation passed`，exit 0 |

### verify:katex

| | |
|---|---|
| 破坏方式 | 在 `designs/shared/tex.js` 里把 `import(` 替换成 `void(`，破坏 MathJax 懒加载特征 |
| 期望 | 特征检查失败 |
| 实际 | `❌ MathJax 动态导入` / `❌ 部分验证失败`，exit 1 |
| 恢复 | 还原 → `✅ 所有验证通过！`，exit 0 |

> 本轮还修了这个脚本本身：它把已被删除的 `test-katex-optimization.html`、
> `OPTIMIZATION_PROGRESS.md`、`SESSION_SUMMARY.md` 列为"必须存在"，因此
> `npm run verify:katex` **一直失败**。它不在 CI 里，所以没人发现。删除过时
> 条目后恢复通过。

### verify:gallery

| | |
|---|---|
| 破坏方式 | 新建 `designs/__negtest/index.html`（磁盘上存在但展览页没列出） |
| 期望 | 非零退出并指出遗漏 |
| 实际 | `✗ directory exists but is not listed in the gallery: __negtest`，exit 1 |
| 恢复 | 删除目录 → `✓ gallery is complete and every link resolves`，exit 0 |

### verify:designs

| | |
|---|---|
| 破坏方式 | 在 `designs/timeline/index.html` 的 `</head>` 前注入 `throw new Error(...)` |
| 期望 | 该方案被标为 ERRORS，非零退出 |
| 实际 | `时间线 Timeline  ERRORS` / `✗ 1 variant(s) need attention`，exit 1 |
| 恢复 | 还原 → `✓ all variants load cleanly`，exit 0 |

### verify:manuscript

| | |
|---|---|
| 破坏方式 | 让 `designs/manuscript/hash.js` 的 `parseHash()` 对任何非空输入直接返回空结果 |
| 期望 | 深链相关断言失败 |
| 实际 | `✗ #n=<id> selects that node — {"selected":null,...}` 与 `✗ #q=<query> runs a search`，exit 1 |
| 恢复 | 还原 → `deep links OK`，5/5 通过，exit 0 |

> **这个负向对照抓出了一条假绿断言。** 原先 `#n=` 的判定是
> `sel.selected === probe.id || sel.url.includes(probe.id)` —— 后半句恒为真，
> 因为我们本来就是用含该 id 的 URL 导航过去的。所以即使 `parseHash` 完全失效、
> 什么都没选中，它依然报 ✓。已改为只认 `sel.selected === probe.id`。
> 破坏时失败断言数从 1 条变成 2 条，说明修复有效。

### verify:live

| | |
|---|---|
| 破坏方式 | 传入不存在的 URL `.../Formula-Nebula/__nonexistent__/` |
| 期望 | 非零退出并报告画布/图谱/深链全失败 |
| 实际 | `✗ WebGL canvas live — null` / `✗ graph fully built — null` / `✗ proof deep link ... 0 cards`，exit 1 |
| 恢复 | 用真实 URL → 9/9 通过，`LIVE SITE OK`，exit 0 |

> 本轮还修了它的**进程泄漏**：原先用 `spawn('taskkill', ...)`，那是异步的，
> 而脚本紧接着 `process.exit()`，taskkill 子进程来不及执行就被杀掉；且
> `taskkill /T` 只跟随父进程树，被重新挂载的渲染进程不在树里。实测每次都
> 残留 1 个无头浏览器。改为同步 `execFileSync` + 按名字扫杀，并在 `finally`
> 里**验证**残留数而不是假设清理成功——现在正常退出后残留恒为 0。

---

### verify:designs:depth

| | |
|---|---|
| 破坏方式 | 在 `designs/map/src/search.js` 里让 `normalize()` 恒返回空串，使搜索永不命中 |
| 期望 | 交互断言失败，非零退出 |
| 实际 | `[FAIL] map · search input produces suggestions — {"found":true,"suggestions":0,...}` / `20 ok, 1 failed`，exit 1 |
| 恢复 | 还原 → 21/21 通过，exit 0 |

### verify:final

做了两次，覆盖两条不同的断言：

**（a）清理断言** —— 把硬超时临时压到 30 秒：

| | |
|---|---|
| 期望 | 超时路径触发、强制清理、非零退出 |
| 实际 | `✗ 硬超时（0.5 分钟）— 强制清理后退出`，exit 1，**残留 0** |
| 恢复 | 超时改回 9 分钟 |

**（b）应用启动断言** —— 删除 `dist/index.html`（画面无从渲染）：

| | |
|---|---|
| 期望 | 本地 WebGL 断言失败，非零退出 |
| 实际 | `✗ WebGL 画布活跃 — null` / `11 通过, 1 失败`，exit 1，残留 0 |
| 恢复 | 重新构建 → 12/12 通过 |

> 注意 (b) 只让**本地**那半失败，线上那半仍全绿——说明它确实分别检查两个
> 目标，不是"一处挂了就说全挂"，也不是"一处过了就说全过"。


### verify:boot

| | |
|---|---|
| 破坏方式 | 把 `src/mobileOptimization.js` 里正确的 `settings.toggleDisplay('bloom')` 换回原来的 `settings.setState({...})`（该方法不存在） |
| 期望 | 启动中断被发现，非零退出 |
| 实际 | `✗ window.__nebula 已暴露` / `✗ window.__formulaNebula 已暴露` / `✗ 图已装配` / `✗ 无 console.error — [公式诗云] 启动失败 TypeError: a.setState is not a function`，3→4 项失败，exit 1 |
| 恢复 | 换回 toggleDisplay → 7/7 通过，exit 0 |

> 这个负向对照有额外价值：**画布检查在破坏后依然 PASS**。也就是说
> `verify:final` 那种"canvas 存在即通过"的判据对本 bug 完全无效 ——
> 新检查器改用「`window.__nebula` 已暴露」正是为了补上这个缺口。
> 另外，破坏时能报出具体错误信息，是因为同时修掉了 `drop_console: true`
> 把 `console.error` 一并删除的问题（此前错误完全静默）。

---

## 待补（0 / 11）

全部 11 个脚本都已有负向对照记录。

---

## 方法

每个负向对照都遵循同一套步骤，避免"改完看起来还行"这种自欺：

1. **先记录当前通过状态**（基线），否则分不清失败是新引入的还是既有的。
2. **做最小的破坏** —— 一次只动一个可观察点。
3. **跑检查器，记录它说了什么** —— 具体报错信息比退出码更有说服力。
4. **恢复，再跑一次** —— 确认它重新变绿。只破坏不恢复，等于不知道是否
   修的是同一个东西。
5. **确认工作区干净**（`git status` 无改动），证明恢复是完整的。

失败过的坑：本轮做 `layoutGraph` 的负向对照时，前两次注入点都落在**永不执行
的分支**里（`fakeBaked` 提供了所有 emWidth，fallback 分支根本不跑），于是
测试全绿，看上去像"检查器抓不到"。第三次注入到主星系路径才生效。
**负向对照失败时，先怀疑注入点，再怀疑检查器。**
