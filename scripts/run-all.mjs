/**
 * 跑一遍全部验证脚本，汇总通过情况。
 *
 * 为什么要有这个：改动 scene.js 的相机/发光会牵动好几个脚本，
 * 逐个手跑容易漏。这里顺序执行（避免多个 headless Chrome 抢 CPU 导致
 * 时间相关断言假失败），每个脚本用独立 CDP 端口。
 */
import { spawn } from 'node:child_process'
import { resolve } from 'node:path'

const SCRIPTS = [
  ['verify-colors.mjs', 9301],
  ['verify-glow-size.mjs', 9302],
  ['verify-focus-links.mjs', 9303],
  ['verify-camera-focus.mjs', 9304],
  ['verify-settings.mjs', 9305],
  ['verify-migration.mjs', 9306],
  ['verify-shapes.mjs', 9307],
  ['verify-galaxy.mjs', 9308],
  ['verify-importance.mjs', 9309],
  ['verify-interaction.mjs', 9310],
  ['verify-picking.mjs', 9311],
  ['verify-cluster.mjs', 9313],   // 猜想星团（球面布局 / 状态 / 取景 / 跨星团连线）
  ['check-occlusion.mjs', 9312],
  ['check-data.mjs', 0],          // 纯 Node，不需要浏览器
  ['check-radius-shift.mjs', 0],  // 纯 Node：加内容有没有把老公式挤走
  ['verify-bake-equivalence.mjs', 9403],  // 烘焙流水线 vs 串行，结果必须逐字段一致
  ['verify-status-layout-independent.mjs', 9405],  // 改 status 不许移动任何节点
  ['verify-status-change.mjs', 9410],              // 改 status 要真的落到色点上
  /* ── 本轮新增（GitHub 调研落地的功能）──
   * 前四个是**纯 Node**（port 0）：它们验证的是与渲染无关的纯逻辑模块，
   * 不需要浏览器，跑起来也快得多。
   * 最后一个是浏览器脚本：它检查的是"这些纯逻辑真的接到了画面上"。 */
  ['verify-link-types.mjs', 0],        // 关系类型分类器（覆盖率 / 优先级 / 强调预算）
  ['verify-url-state.mjs', 0],         // 深链编解码（含敌意输入）
  ['verify-graph-query.mjs', 0],       // 查询语言 + 寻路 + 邻域
  ['verify-export.mjs', 0],            // SVG 导出（含 XML 良构性）
  ['verify-integration.mjs', 9420],    // 集成：类型上色 / 焦点上下文 / 视口偏移 / 深链
  /* 这两个是**靠看图才发现问题**之后补上的回归。
   * 它们抓的都不是数值错误，而是"数值全对但画面不对"：
   *   - 类型着色必须是纯增量（related 的边逐位不变）
   *   - 浮层不许互相压住（手写元素清单漏过 #st-open） */
  ['verify-link-type-purity.mjs', 9421],  // 顶点色缓冲逐位比对：类型着色只动该动的边
  ['check-layout-overlap.mjs', 9433],     // 从 DOM 枚举浮层 + elementFromPoint 命中探测
  /* 这个是**看截图**才发现的第三个 bug 的回归：星团柔光原本是个球，
   * 而贴图是 UV 空间的径向渐变 —— 两者假设不匹配，渲染成一块
   * 边缘清晰的灰盘。所有数值脚本全绿，唯独画面完全不对。
   * 检查的是**几何与贴图的假设是否自洽**，不是像素。 */
  ['check-halo-geometry.mjs', 9440],      // 柔光必须是朝向相机的平面 + 径向渐变贴图
  /* 图例与面板的**局部特写** + 像素级判据。
   *
   * 别的脚本断言"数据对不对""接没接进画面"，这支断言
   * "画出来的那几行小字**到底有没有**"：
   *   ① 图例下沿有没有被视口切掉（浏览器不报错，只是切掉）
   *   ② 像素里有没有成片的文字笔画
   *   ③ 11 个类型 + related + 「数据截至」是不是都在
   *   ④ 面板上"提出年"与"最新进展年"是不是**分开**的
   *
   * 为什么非要量像素：这两处字号是 9.5–11px，而 UI 有 9 秒空闲淡出
   * （opacity 掉到 6%），computed style 与截图可能落在过渡的两端 ——
   * 我为此误判过一次"CSS 坏了"，其实只是拍在了过渡中间。
   * 判据用"亮像素**占比**"而不是"最亮值"：星空里有的是孤立亮点，
   * 最亮值很容易被一颗星星拉高，而文字是成片的笔画。 */
  ['_shot-legend.mjs', 9462],
]

/* ── 每个脚本的超时 ──
 *
 * 为什么要加：无头 Chrome 走 SwiftShader 软件渲染，**完全是 CPU 密集的**。
 * 机器一忙（实测开着游戏 + 浏览器 + 聊天工具时），同一个脚本能从
 * 23 秒涨到 301 秒，然后因为内部的等待轮询超时而"失败" ——
 * 但代码一行没改。
 *
 * 于是"红"就有了两种完全不同的含义：**真的坏了** 和 **被饿死了**。
 * 分不清这两者，汇总表就是在骗人：我会去"修"一个没坏的东西。
 *
 * 这里的做法是：给每个脚本一个宽松的上限，超时就杀掉并标明
 * **超时（疑似资源争抢）**，而不是含糊地报个退出码。
 * 上限取实测耗时的 4~6 倍，正常机器上永远不会触发。 */
const TIMEOUT_MS = Number(process.env.VERIFY_TIMEOUT_MS || 480000)  // 8 分钟

function run(file, port) {
  return new Promise((res) => {
    const env = { ...process.env }
    if (port) env.PORT = String(port)
    const cp = spawn(process.execPath, [resolve('scripts', file)], {
      env, stdio: ['ignore', 'pipe', 'pipe'],
    })
    let out = ''
    let killed = false
    const timer = setTimeout(() => {
      killed = true
      try { cp.kill('SIGKILL') } catch { /* 已经退出 */ }
    }, TIMEOUT_MS)
    cp.stdout.on('data', (d) => { out += d })
    cp.stderr.on('data', (d) => { out += d })
    cp.on('close', (code) => {
      clearTimeout(timer)
      res({ file, code, out, killed })
    })
  })
}

const rows = []
for (const [file, port] of SCRIPTS) {
  process.stdout.write(`\n${'─'.repeat(60)}\n▶ ${file}\n`)
  const t0 = Date.now()
  const r = await run(file, port)
  const secs = ((Date.now() - t0) / 1000).toFixed(0)
  /* 抽末行结论。
   * ⚠ 失败时**必须把尾部输出打出来**：原来无论成败都只打最后 4 行
   *   "结果：N/M"，于是失败时看不到任何原因（我第一次遇到
   *   check-occlusion 报 FAIL 时，屏幕上只有一行 ✗，完全不知道
   *   是断言失败、超时、还是页面没起来）。 */
  const lines = r.out.trim().split('\n')
  const verdict = lines.filter((l) => /结果：|通过 \d+ \/ \d+|失败|✗/.test(l)).slice(-4)
  console.log(verdict.join('\n') || lines.slice(-3).join('\n'))
  if (r.code !== 0) {
    console.log(`  ── 失败详情（末 25 行）──`)
    console.log(lines.slice(-25).map((l) => '  ' + l).join('\n'))
  }
  const tag = r.killed ? `⏱ 超时 ${secs}s（>${TIMEOUT_MS / 1000}s，疑似资源争抢）`
                       : `退出码 ${r.code}`
  console.log(`  [${r.code === 0 ? 'OK' : tag}] ${secs}s`)
  rows.push({ file, code: r.code, secs, out: r.out, killed: r.killed })
}

console.log(`\n${'='.repeat(60)}\n汇总\n${'='.repeat(60)}`)
let bad = 0
let timedOut = 0
for (const r of rows) {
  const m = r.out.match(/结果：\s*(\d+)\s*\/\s*(\d+)\s*通过/)
  const label = m ? `${m[1]}/${m[2]}` : (r.code === 0 ? 'OK' : (r.killed ? '超时' : 'FAIL'))
  if (r.code !== 0) { bad++; if (r.killed) timedOut++ }
  console.log(`  ${r.code === 0 ? '✓' : (r.killed ? '⏱' : '✗')} ${r.file.padEnd(28)} ${label.padStart(9)}  ${r.secs}s`)
}
console.log(`\n${rows.length - bad} / ${rows.length} 个脚本通过`)
if (timedOut) {
  console.log(`\n⚠ 其中 ${timedOut} 个是**超时**而不是断言失败。`)
  console.log('  无头软件渲染是纯 CPU 的，机器一忙就会这样。')
  console.log('  先把它们单独重跑一遍再判断是不是真坏了：')
  for (const r of rows.filter((x) => x.killed)) console.log(`    node scripts/${r.file}`)
}
process.exit(bad ? 1 : 0)
