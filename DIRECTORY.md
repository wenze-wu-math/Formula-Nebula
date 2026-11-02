# 项目目录清单

> 根目录：`D:\xiangmu\Formula Nebula`
> 本文档只列**每个目录里有什么**，不做分析。

---

## 根目录

### 子目录（11 个）

| 目录 | 作用 |
|---|---|
| `src/` | 根应用（3D 公式诗云）源码 |
| `designs/` | 四个设计稿方案 |
| `kb-src/` | 知识库采集管线 |
| `scripts/` | 工具脚本（115 个文件 + `_batches/` `_batches2/`） |
| `public/` | 静态资源（空） |
| `docs/` | 文档（1 个文件） |
| `shots/` | 截图输出（含 11 个子目录） |
| `backup/` | 备份（`data-pre-types/`、`removed-one-off-migration-scripts-20260926/`） |
| `dist/` | 构建产物（`assets/`） |
| `node_modules/` | 依赖 |
| `.research/` | 研究笔记（36 个文件） |

### 文件（45 个）

**配置文件**
- `package.json` — 脚本：`start` / `dev` / `build` / `verify` / `check-data` / `perf`
- `package-lock.json`
- `vite.config.js` — 根应用配置（默认 5173）
- `vite.designs.config.mjs` — designs 配置（**端口 5190，实际在用**）
- `index.html` — 根应用入口
- `.gitignore` / `.gitattributes`

**文档**
- `HANDOFF.md` — 交接文档
- `README.md` — 150KB 主文档

**临时/遗留文件（可删）**
- `_batch07_head.js`
- `_cut.mjs` / `_esc.mjs` / `_np_stats.mjs`
- `_tmp-check-gap11-ids.mjs` / `_tmp-check-ids.mjs`
- `_tmp-dump.mjs` / `_tmp-dump2.mjs` / `_tmp-dump8.json`
- `_tmp-extract.mjs`
- `_tmp-fix.mjs` ~ `_tmp-fix21.mjs`（20 个）
- `_tmp-grep.mjs` / `_tmp-keys.mjs` / `_tmp-map.mjs`
- `_tmp-nodes.json`（410KB）
- `.tmp-nodeids.txt`

---

## `src/` — 根应用（3D 星云）

### 文件（19 个）

| 文件 | 作用 |
|---|---|
| `main.js` | 启动入口 |
| `scene.js` | three.js 场景（86KB） |
| `nebula.js` | 星云主体渲染 |
| `graph.js` | **数据聚合核心**，产出 `ALL_NODES` / `ALL_LINKS` |
| `graphQuery.js` | 图查询 |
| `links.js` | 关联渲染 |
| `linkTypes.js` | 关联类型定义 |
| `ui.js` | 界面（64KB） |
| `config.js` | 视觉参数（47KB） |
| `palette.js` | 调色板 |
| `glow.js` | 发光效果 |
| `formulaTexture.js` | 公式贴图 |
| `settings.js` / `settingsPanel.js` | 设置与面板 |
| `proofView.js` | 证明查看器 |
| `proofRouter.js` | 证明路由 |
| `urlState.js` | URL 状态同步 |
| `exportView.js` | 导出 |
| `style.css` | 样式（385 字节） |

### 子目录 `data/`

**文件（21 个）**

手写数据（**不要改**）：
- `knowledge.js` — 405 定理 + 24 研究者 + 手写关联
- `conjectures.js` — 59 猜想

自动生成：
- `stacks-extra.js` — 2,200 定理（2.6MB）
- `nlab-extra.js` — 538 概念（1.1MB）
- `mathlib-extra.js` — 487 形式化定理（828KB）
- `unsolved-extra.js` — 500 猜想（778KB）
- `wikipedia-extra.js` — 48 猜想
- `researchers-extra.js` — 45 研究者
- `researchers-extra-links.js` — 研究者关联
- `cross-source-links.js` — 跨源关联
- `researchers.js` — 研究者数据
- `progress.js` — 进度记录
- `extra-a.js` ~ `extra-h.js` — 8 个补充数据包
- `_dump-links.mjs` — 工具脚本

### 子目录 `data/proofs/` — 证明正文（36 个文件）

`batch-01` ~ `batch-32`（24 个，编号不连续：01-08, 12-16, 19-22, 24-27, 29, 30, 32）
`deep-dive.js` / `foundation-long.js` / `foundation-long-b.js`
`new-curves.js` / `new-sheaves.js` / `new-topics.js`
`rewrite-a1.js` / `rewrite-a2.js` / `rewrite-a3.js` / `rewrite-b.js`
`index.js` — 汇总入口
`schema.js` — schema 定义

---

## `designs/` — 四个设计稿

### 根目录文件（16 个）

| 文件 | 作用 |
|---|---|
| `index.html` | designs 门户页 |
| `verify.mjs` | 四方案验证入口 |
| `shot.mjs` | 截图工具 |
| `cdp.mjs` | **CDP 浏览器驱动** |
| `imgstat.mjs` | 图片统计 |
| `scale-test.mjs` | 缩放测试 |
| `_browser-lock.mjs` | 浏览器锁 |
| `_export.mjs` | 导出 |
| `README.md` | 说明 |
| `HANDOFF.md` | designs 交接 |
| `FINAL-STATUS.md` | 最终状态 |
| `FRONTEND-STATUS.md` | 前端状态 |
| `NEBULA-PLUS-PERF.md` | nebula-plus 性能分析 |
| `SCALABILITY.md` | 可扩展性 |
| `UX-FIXES-2026-11-02.md` | UX 修复记录 |
| `.gitignore` |

### `shared/` — 四方案共用（4 个）

- `kb.js` — 数据加载
- `tex.js` — 公式渲染
- `md.js` — Markdown
- `style-base.css` — 基础样式

---

### `atlas/` — A 方案：2D 星图（50 个文件，全在根目录）

**核心**
- `layout.js` — **布局引擎（57KB，最复杂）**
- `labels.js` — 标签放置（42KB）
- `bake.js` — 公式烘焙位图
- `render.js` — 绘制（34KB）
- `chrome.js` — 图外面板
- `panel.js` — 详情面板
- `constants.js` — 视觉参数
- `scale.js` — 按数据量派生尺度
- `glyphs.js` — 恒星/深空天体符号
- `runtime.js` — 运行时参数
- `geo.js` — 几何工具
- `camera.js` / `input.js` / `search.js` / `state.js` / `hash.js` / `tooltip.js`
- `main.js` — 启动
- `index.html` / `atlas.css` / `chrome.css` / `panel.css` / `thumb.png`

**文档**
- `SPEC.md`（46KB 设计规范）
- `README.md` / `perf.md`（21KB 性能记录）
- `HANDOFF-SCALE.md`
- `ZOOM-DIP.md` / `ZOOM-MONOTONIC-OPEN.md`

**测试脚本**
- `check-bake-throughput.mjs` / `check-base-capacity.mjs` / `check-cover2.mjs`
- `check-labels.mjs` / `check-layout-hash.mjs` / `check-placement.mjs`
- `check-runtime.mjs` / `check-scale.mjs` / `check-scale-browser.mjs` / `check-simple.mjs`
- `layout.check.mjs` / `perf-probe.mjs` / `star-cover.mjs`
- `diag3.mjs` / `diag10.mjs`

**历史版本（死代码，可删）**
- `layout.js.broken`（损坏备份）
- `layout.recovered.js` / `layout.step1.js` / `layout.v11.js` / `layout.v13.js` / `layout.v14.js`

---

### `map/` — B 方案：测绘地图

**根目录（5 个）**
- `index.html` / `map.css` / `README.md` / `SPEC.md`（48KB）/ `thumb.png`

**`src/`（10 个 + 4 个子目录）**
- `main.js` / `camera.js` / `constants.js` / `rules.js` / `state.js` / `view.js`
- `interact.js` / `search.js` / `hash.js` / `debug.js`

**`src/world/`（9 个）** — 世界构建
- `build.js` — 13 步流水线
- `layout.js` — **国家放松 + 城市布局**
- `fields.js` — 标量场
- `contour.js` — marching squares
- `islands.js` / `rasters.js` / `rng.js` / `stub.js` / `index.js`

**`src/render/`（6 个）**
- `basemap.js` / `islands.js` / `roads.js` / `symbols.js` / `highlight.js` / `index.js`

**`src/labels/`（6 个）**
- `area.js` / `bake.js` / `draw.js` / `grid.js` / `place.js` / `index.js`

**`src/ui/`（10 个）**
- `app.js` / `cartouche.js` / `describe.js` / `glyphs.js` / `hud.js`
- `panel.js` / `register.js` / `search.js` / `tooltip.js` / `index.js`

**`dev/`** — 开发版（`labels/` `render/` `ui/` `world/` 四个子目录）
**`tools/`** — 工具（`orch/` `world/` 两个子目录）

---

### `manuscript/` — D 方案：公式诗稿（33 个文件，全在根目录）

**排版核心**
- `layout.js` — 主控（分页、章节调度）
- `layout-chapter.js` — 章内两栏排布
- `layout-stanza.js` — 诗节划分
- `layout-notes.js` — 页边批注避让
- `layout-pages.js` — 页眉页脚、卷首、题跋
- `layout-util.js` — 常量、量宽、断行

**公式渲染**
- `formulas.js` — 公式主逻辑（27KB）
- `formulas-cache.json` — **18MB 预渲染缓存**
- `formulas-build.mjs` — 重建缓存脚本
- `formulas-worker.js` — Web Worker
- `formulas-key.js` — 缓存键
- `formulas-bench.html` — 基准测试页

**绘制**
- `render.js` / `render-text.js` / `render-links.js` / `render-deco.js`
- `paper.js` — 纸张纹理
- `pencil.js` — 手绘线条
- `geom.js` — 几何工具

**交互**
- `main.js` / `camera.js` / `input.js` / `panel.js` / `ui.js` / `ui-legend.js`
- `state.js` / `hash.js` / `constants.js`

**其他**
- `index.html` / `style.css`（27KB）/ `thumb.png`
- `SPEC.md`（44KB）/ `README.md`

---

### `nebula-plus/` — C 方案：3D 星云增强版

**根目录（4 个）**
- `index.html` / `README.md` / `SPEC.md` / `thumb.png`

**`src/`（17 个）**
- `main.js` / `scene.js`（90KB）/ `nebula.js` / `graph.js`（64KB）
- `ui.js`（63KB）/ `links.js` / `glow.js`
- `config.js`（52KB）/ `settings.js` / `settingsPanel.js`
- `formulaTexture.js` / `formulaCard.js`
- `proofView.js` / `exportView.js` / `urlState.js`
- `designApi.js` / `style.css`

**`tools/`（4 个）**
- `profile.mjs` / `probe-baseline.mjs` / `probe-halo.mjs` / `_probe-node-import.mjs`

---

## `kb-src/` — 采集管线

### 文件（28 个）

**下载（fetch）**
- `fetch-stacks.mjs` — Stacks Project
- `fetch-nlab.mjs` — nLab
- `fetch-mathlib.mjs` — Lean mathlib4
- `fetch-wikipedia.mjs` — Wikipedia
- `fetch-zbmath.mjs` — zbMATH Open

**解析/生成（build）**
- `parse-stacks.mjs` — 解析 Stacks
- `build-nodes.mjs` — 生成 Stacks 节点
- `build-nlab-nodes.mjs` — 生成 nLab 节点
- `build-mathlib-nodes.mjs` — 生成 mathlib 节点
- `build-conjectures.mjs` — 生成猜想节点
- `build-wikipedia-nodes.mjs` — 生成 Wikipedia 节点
- `build-researchers.mjs` — 生成研究者节点
- `link-researchers.mjs` — 研究者关联
- `build-cross-links.mjs` — 跨源关联

**校验（verify）**
- `verify-stacks.mjs` / `verify-nodes.mjs` / `verify-nlab.mjs`
- `verify-mathlib.mjs` / `verify-researchers.mjs`
- `verify-wikipedia.mjs` / `verify-cross.mjs`

**探测**
- `probe-nlab.mjs` / `probe-nlab2.mjs`

**数据/文档**
- `README.md` — 管线文档
- `ENV-NOTE.md` — 网络环境说明
- `stacks-tags.txt` — tag 列表
- `unsolvedmath-categories.json` / `unsolvedmath-problems.json`

### 子目录

**`out/`（6 个，下载缓存）**
- `stacks-results.json`（8.2MB）
- `mathlib-files.json`（5.9MB）
- `nlab-pages.json`（2.4MB）
- `mathlib-tree.json`（0.7MB）
- `wikipedia-conjectures.json`（0.1MB）
- `zbmath-authors.json`（0.1MB）

**`nlab/`** — nLab 页面缓存
**`raw/`** — 原始数据

---

## 数据流

```
kb-src/fetch-*.mjs          下载到 kb-src/out/*.json
        ↓
kb-src/build-*.mjs          生成到 src/data/*-extra.js
        ↓
src/graph.js                聚合所有数据源
        ↓
┌───────────────┬──────────────┬─────────────┬──────────────┐
src/main.js   designs/atlas  designs/map  designs/manuscript  designs/nebula-plus
（3D 根应用）                    ↑
                        designs/shared/kb.js
```
