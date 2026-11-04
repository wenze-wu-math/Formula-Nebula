# 归档目录 · Archive

这里是项目历史中产生、但**不应再出现在仓库根目录**的文件。

归档 ≠ 废弃：这些文件仍有史料价值（它们记录了项目是怎么一步步走到今天的），
所以只是移出主目录，内容原样保留。**没有任何文件被删除。**

---

## session-reports/ — 一次性进度报告

这些是每次开发会话结束时生成的"完成报告"。它们的问题是共同的：

- 记录的是**当时那一刻**的状态，之后再也没人更新，很快就与事实不符；
- 有几份还写着已经发生但实际并未发生的事（例如 `SUCCESS_REPORT.md`
  标题是 "Successfully Deployed!"、`DEPLOYMENT_SUCCESS.md` 是
  "Deployment Success!"，而项目当时**从未成功部署过**——CI 55 次运行
  里 49 次失败，唯一成功的是不需要构建的 CodeQL 扫描）；
- 根目录曾有 54 个 `.md`，其中一大半是这类文件，让仓库第一眼看起来
  像一堆开发日志而不是一个项目。

现在根目录只保留**长期有效**的文档（README、贡献指南、行为准则、
安全策略、路线图、变更日志等）。历史报告在这里。

| 文件 | 记录的是 |
|---|---|
| `CHANGELOG_ENHANCED.md` | 早期增强版变更日志（已由根目录 `CHANGELOG.md` 取代） |
| `DEPLOYMENT_SUCCESS.md` | ⚠️ 声称部署成功，实际从未成功 |
| `DOCKER_BUILD_SUMMARY.md` | Docker 镜像构建记录 |
| `FINAL_CLEAN_STATUS.md` | 某次"清理 workflow"后的状态 |
| `FIXES-APPLIED.md` | 一批缺陷修复清单 |
| `GITHUB_OPTIMIZATION_GUIDE.md` | GitHub 仓库优化建议 |
| `LOAD_TEST_SUMMARY.md` | 负载测试记录 |
| `NEXT_OPTIMIZATIONS_GUIDE.md` | 当时的下一步计划 |
| `OPTIMIZATION_IMPACT_ANALYSIS.md` | 优化收益估算 |
| `OPTIMIZATION_SUMMARY.md` | 优化总结 |
| `PAYMENT_INTEGRATION_SUMMARY.md` | 支付集成进度 |
| `PREMIUM-SUMMARY.md` | 付费功能进度 |
| `PROJECT_IMPROVEMENTS_SUMMARY.md` | 某次改进会话总结 |
| `PROJECT_STATUS.md` | 项目状态快照 |
| `PROOF_FEATURES_SUMMARY.md` | 证明浏览功能进度 |
| `QUICK_START_OPTIMIZED.md` | 某版快速开始（已由根目录 `QUICK-START.md` 取代） |
| `STARTUP-DIAGNOSIS.md` | 一次启动故障排查记录 |
| `SUCCESS_REPORT.md` | ⚠️ 同上，声称部署成功 |
| `video-tutorial-plan.md` | 视频教程脚本规划 |

> 注意：这些文件内部的相对链接是按"它们在仓库根目录"写的，
> 移动之后大部分会失效。这是**预期行为**——归档是史料，不是活文档。

---

## scratch-scripts/ — 一次性脚手架

35 个 `_tmp-*.mjs` / `_batch*.js` 之类的临时脚本：批量改证明正文、
检查 id、dump 数据等。它们**已经跑完**，没有代码引用它们，
不是构建或运行的一部分。

保留它们只是为了以后想知道"当时那批数据是怎么生成的"时有个线索。

---

## 为什么不是直接删除

删除也能让根目录变干净，但会丢掉"项目怎么走到今天"的记录。
归档同时满足两件事：根目录整洁，且历史可查。
