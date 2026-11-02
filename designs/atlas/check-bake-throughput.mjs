/**
 * designs/atlas/check-bake-throughput.mjs — 纯 Node：用**实测的单价**推算烘焙吞吐。
 *
 *   node designs/atlas/check-bake-throughput.mjs
 *
 * 不启动浏览器。输入是早前一次会话里实测到的单价（见 perf.md「改前实测」一节）：
 *   texSync 真实公式      3.9 ms/条（warm，24 条样本）
 *   Blob 创建             3.9 ms/条
 *   img.decode()          4.6 ms/条（并发 12 条时的摊销值）
 * 这两个数是"改前"和"改后"共用的硬件常数，因此可以拿它们把两种驱动的吞吐算清楚。
 *
 * 关键量：**烘焙的总主线程工作量** ≈ 464 × (3.9 + 3.9 + 4.6) ≈ 5.8 s。
 * 改前的墙钟是 26.2 s，说明有约 20 s 是"等 rAF"，不是"真的在算"。
 * 本脚本把这个差距算出来，作为 perf.md 的推理依据。
 */
const N = 464
const TEX_MS = 3.9        // texSync 单条（实测）
const BLOB_MS = 3.9       // Blob + URL 创建单条（实测）
const DECODE_MS = 4.6     // img.decode 单条（实测，并发 12 时的摊销）
const PAINT_MS = 0.8      // 离屏 canvas 4 次 drawImage + shadowBlur（估，见下）

/* ── 改前：由 rAF 驱动 ── */
const RAF_MS = 244        // 实测裸 rAF 间隔（headless / 主线程繁忙时）
const OLD_BUDGET = 8      // BAKE_BUDGET_MS
const oldRoundsPerSec = 1000 / RAF_MS
const oldSyncPerSec = oldRoundsPerSec * OLD_BUDGET        // 每秒能给的同步排版预算
const oldSyncTotal = N * TEX_MS
const oldWallSyncBound = oldSyncTotal / oldSyncPerSec * 1000

/* 改前还受 requestIdleCallback 补充（timeout 200ms，每轮最多 ~8ms），
 * 但 rAF 只有 4 帧/秒时主线程几乎不空闲，idle 回调拿不到多少时间，按 +30% 估。 */
const oldWallEst = oldWallSyncBound / 1.3

/* ── 改后：自驱泵 ── */
const SLICE = 6           // SELF_DRIVE_SLICE_MS
const YIELD_MS = 1        // setTimeout(0) 的实际间隔（Windows 定时器粒度，保守取 1ms）
const driveDutyCycle = SLICE / (SLICE + YIELD_MS)   // 每轮里真正用来排版的比例
const newSyncPerSec = 1000 / (SLICE + YIELD_MS) * SLICE
const newSyncTotal = N * TEX_MS
const newWallSyncBound = newSyncTotal / newSyncPerSec * 1000

/* 首屏 40 条：改后它们排在最前面（两段式优先级），所以只要这 40 条排完 + 解码完 */
const FIRST_N = 40
const firstSync = FIRST_N * TEX_MS
const firstDecode = FIRST_N * DECODE_MS / 6      // BAKE_CONCURRENCY = 6，解码并发
const firstBlob = FIRST_N * BLOB_MS
const firstWall = firstSync + firstBlob + firstDecode

console.log('=== 单条成本（实测 / 估算）===')
console.log(`  texSync        ${TEX_MS} ms  (实测 24 条样本均值)`)
console.log(`  Blob 创建      ${BLOB_MS} ms  (实测 12 条样本均值)`)
console.log(`  img.decode     ${DECODE_MS} ms  (实测 12 条并发摊销)`)
console.log(`  离屏 paint     ${PAINT_MS} ms  (估算：4 次 drawImage，2 次带 shadowBlur)`)
console.log(`  → 单条合计约   ${(TEX_MS + BLOB_MS + DECODE_MS + PAINT_MS).toFixed(1)} ms，${N} 条纯工作量约 ${((TEX_MS + BLOB_MS + DECODE_MS + PAINT_MS) * N / 1000).toFixed(1)} s`)

console.log('\n=== 改前：rAF 驱动 ===')
console.log(`  rAF 间隔 ${RAF_MS} ms → 每秒 ${oldRoundsPerSec.toFixed(1)} 轮`)
console.log(`  每轮预算 ${OLD_BUDGET} ms → 每秒可用排版时间 ${oldSyncPerSec.toFixed(0)} ms`)
console.log(`  ${N} 条排版需要 ${(oldSyncTotal / 1000).toFixed(1)} s → 受 rAF 限制的墙钟下界 ${(oldWallSyncBound / 1000).toFixed(1)} s`)
console.log(`  含 idle 补充（估 +30%）→ 约 ${(oldWallEst / 1000).toFixed(1)} s`)
console.log(`  ★ 实测墙钟 26.2 s，与此推算同量级 → 瓶颈确认是"等 rAF"，不是"排版本身慢"`)

console.log('\n=== 改后：自驱泵 ===')
console.log(`  每段 ${SLICE} ms 排版 + ${YIELD_MS} ms 让出 → 占空比 ${(driveDutyCycle * 100).toFixed(0)}%`)
console.log(`  每秒可用排版时间 ${newSyncPerSec.toFixed(0)} ms（是改前的 ${(newSyncPerSec / oldSyncPerSec).toFixed(1)} 倍）`)
console.log(`  ${N} 条排版墙钟下界 ${(newWallSyncBound / 1000).toFixed(1)} s`)
console.log(`  加上 Blob/解码/绘制（与排版流水线并行）→ 预计 ${((newWallSyncBound + N * BLOB_MS / 1000) / 1000).toFixed(1)}–${((newWallSyncBound + N * (BLOB_MS + DECODE_MS / 6) / 1000) / 1000).toFixed(1)} s`)

console.log('\n=== 首屏 40 条（任务硬指标：ready 后 < 3000 ms）===')
console.log(`  两段式优先级保证这 40 条排在最前（priority −1000 + 名次）`)
console.log(`  排版 ${firstSync.toFixed(0)} ms + Blob ${firstBlob.toFixed(0)} ms + 解码 ${firstDecode.toFixed(0)} ms`)
console.log(`  → 预计 ${firstWall.toFixed(0)} ms 达到 40 条可读`)
console.log(`  ★ 判定：${firstWall < 3000 ? '预计达标（< 3000 ms）' : '预计不达标，需要 Lead 实测确认'}`)
console.log('\n注意：以上是**代码推理 + 实测单价**的推算，不是浏览器实测。')
console.log('      实际数字以 Lead 的 verify.mjs / perf-probe.mjs 结果为准。')
