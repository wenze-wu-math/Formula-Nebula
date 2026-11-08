/**
 * ═══════════════════════════════════════════════════════════════
 *  verify-export.mjs —— 静态导出（src/exportView.js）的正确性验证
 * ═══════════════════════════════════════════════════════════════
 *
 *  这个脚本为什么必须存在：**导出的 SVG 是最容易"看起来对了"的产物**。
 *  它不会抛异常、不会白屏，浏览器也照样能打开一张"少了一半内容"的图 ——
 *  只是颜色发灰、标签糊成一团、某个公式的名字把整份文件变成非法 XML。
 *  这些错误没有任何运行时反馈，只能靠断言抓。
 *
 *  所以这里盯的是四类具体的坏法：
 *
 *   ① **非法 XML**（最致命，整份文件打不开）：名字里带 `<` `&` `"` 的节点
 *      会不会把标签结构冲掉？→ 手写括号/标签配平检查器（不依赖任何 XML 库），
 *      外加"未转义 &"与实体合法性检查。
 *
 *   ② **NaN / undefined 漏进输出**（最常见的生成式 SVG bug）：一旦出现，
 *      属性值就废了，图会静默地少画或画错位置。→ 全串子串搜索。
 *
 *   ③ **颜色空间搞错**：节点的 baseColor 是**线性光**，不做 linear → sRGB
 *      就写进 SVG，颜色会明显发暗发灰（这类错误肉眼很难判定"错到什么程度"，
 *      但可以精确断言端点与单调性）。→ 端点 + 100 点单调性 + 全零/全一 hex。
 *
 *   ④ **画布比例算错**：包围盒如果按全体节点算、却只画子集，
 *      盘会缩成角落里的一小坨 —— 这正是 computeBounds 的 include
 *      参数存在的理由，必须单独验一遍。
 *
 *  另外还验两个"没写清楚就会出事"的行为约定：
 *    · 空节点列表**不抛错**，返回合法的空图（正常状态，不是异常）
 *    · downloadSVG 在 Node 里**抛错**，不静默 no-op（静默失败最难查）
 *
 *  用法：node scripts/verify-export.mjs
 *  纯 Node，不需要浏览器、不需要 three.js、不需要 dev server。
 */

import { mkdirSync, writeFileSync, readFileSync, statSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  linearToSrgb, srgbHex, cssColor,
  computeBounds, exportSVG, exportFilename, downloadSVG, escapeXml,
  projectPoint,
} from '../src/exportView.js'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT_SVG = join(ROOT, '.research', 'export-sample.svg')

/* ───────────────────────── 断言脚手架 ───────────────────────── */

let pass = 0
let fail = 0
const failures = []

function ok(cond, label, detail = '') {
  if (cond) {
    pass++
    console.log(`  ✓ ${label}${detail ? '  ' + detail : ''}`)
  } else {
    fail++
    failures.push(label)
    console.log(`  ✗ ${label}${detail ? '  ' + detail : ''}`)
  }
}

/** 带编号的小节标题，编号与需求里的断言一一对应 */
function section(n, title) {
  console.log(`\n── ${n}. ${title} ${'─'.repeat(Math.max(0, 46 - title.length))}`)
}

/* ───────────────────────── 合成数据 ─────────────────────────
 *
 * ⚠ 刻意**不** import 真数据（src/data/*.js）：
 *   ① 真数据要 464+59 个节点，断言会跑得慢、失败时也难定位；
 *   ② 真数据里**没有**那些最该被测的坏输入（没人会给公式起名 `<script>&"'`），
 *      而正是这些坏输入决定了导出功能是否健壮；
 *   ③ 真数据的坐标依赖布局代码，一旦布局调整，导出测试就会跟着假失败 ——
 *      导出层只关心"给我 pos 和颜色，你画得对不对"，与布局解耦才是对的。
 *
 * 但数据形状必须与 graph.js 的产物**完全一致**：
 *   pos{x,y,z} / width / height / rank / brightness / baseColor(线性) /
 *   cluster / name(中文) / latex / family，猜想另有 field / status。
 */

/** 固定种子，保证每次跑出来的样图一模一样（可复现才有可比性） */
function makeRng(seed) {
  let a = seed >>> 0
  return function rng() {
    a = (a + 0x6D2B79F5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** sRGB 分量 → 线性光。造 fixture 用（真数据那边是 palette.js 干的） */
function s2l(c) {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
}

/** '#rrggbb' → 线性三元组，与 palette.js 的 hexToLinear 同义 */
function hexToLinearTriple(hex) {
  const n = parseInt(hex.replace('#', ''), 16)
  return {
    r: s2l(((n >> 16) & 255) / 255),
    g: s2l(((n >> 8) & 255) / 255),
    b: s2l((n & 255) / 255),
  }
}

/* 极值刻意取整，方便断言"节点正好落在包围盒边界上" */
const BOUND_X = 175
const BOUND_Z = -175

const GALAXY_NAMES = [
  '层上同调', '凝聚层', '除子', '相交理论', '陈类', '向量丛', '概形', '仿射簇',
  '射影空间', '有理映射', '双有理几何', '极小模型', '奇异点消解', '丰沛线丛',
  '黎曼-罗赫定理', '塞尔对偶', '小平消没', '霍奇理论', '阿贝尔簇', '椭圆曲线',
  '模空间', '稳定曲线', '格罗滕迪克拓扑', '平展上同调', '韦伊猜想', 'étale 基本群',
  'D-模', '特征类', '格拉斯曼流形', '旗流形', '托里簇', '辛几何',
]

const CONJ_NAMES = ['霍奇猜想', '黎曼猜想', 'P 与 NP', 'BSD 猜想', '标准猜想', '雅可比猜想']
const CONJ_FIELDS = ['ag', 'arith', 'logic', 'arith', 'ag', 'ag']
const CONJ_STATUS = ['open', 'open', 'open', 'partial', 'heuristic', 'disproved']

function buildFixture() {
  const rng = makeRng(20240915)
  const nodes = []
  const links = []

  /* ── 主星系：指数盘形状的合成分布（薄盘，z 是第二个平面轴） ── */
  GALAXY_NAMES.forEach((name, i) => {
    // 半径按 sqrt 分布铺开，方位角均匀 —— 形状像盘就行，导出层不关心它是否真是指数盘
    const r = 24 + Math.sqrt(rng()) * (BOUND_X - 24)
    const theta = rng() * Math.PI * 2
    const rank = Math.round((1 - i / (GALAXY_NAMES.length + 6)) * 1000) / 1000
    nodes.push({
      id: `g${String(i).padStart(2, '0')}`,
      name,
      latex: `\\mathcal{F}_{${i}}`,
      family: ['cohomology', 'schemes', 'motives', 'moduli'][i % 4],
      cluster: false,
      pos: {
        x: Math.cos(theta) * r,
        y: (rng() - 0.5) * r * 0.105,      // 薄盘：y 比 r 小两个量级
        z: Math.sin(theta) * r,
      },
      width: 6 + 10 * rank,
      height: (6 + 10 * rank) / 4,
      rank,
      brightness: 0.34 + Math.pow(rank, 1.3) * 1.08,
      baseColor: hexToLinearTriple(['#7fd4ff', '#ffb03a', '#ff9fd0', '#8affe8'][i % 4]),
    })
  })

  /* ── 猜想星团：+x 方向外挂（与真实配置一致：center ≈ [255,0,-140]） ── */
  CONJ_NAMES.forEach((name, i) => {
    const rank = Math.round((1 - i / (CONJ_NAMES.length + 1)) * 1000) / 1000
    nodes.push({
      id: `c${String(i).padStart(2, '0')}`,
      name,
      latex: `\\mathrm{C}_{${i}}`,
      family: 'conjecture',
      cluster: true,
      field: CONJ_FIELDS[i],
      status: CONJ_STATUS[i],
      pos: {
        x: 255 + Math.cos(i * 1.1) * 40,
        y: Math.sin(i * 0.8) * 30,
        z: -140 + Math.sin(i * 1.1) * 40,
      },
      width: 8 + 6 * rank,
      height: (8 + 6 * rank) / 3,
      rank,
      brightness: 0.34 + Math.pow(rank, 1.3) * 1.08,
      baseColor: hexToLinearTriple(['#ff8f6b', '#ffd166', '#7ee0a8', '#9fb4ff'][i % 4]),
    })
  })

  /* ── 对抗性节点：导出层真正的考题 ──
   * 这几个节点单独列出来，是因为它们分别对应一类"看起来没事、其实废了"的错误：
   *   adv-xml   名字里有 < & " ' → 不转义就毁掉整份 XML
   *   adv-rank0 最边缘（点最小、最暗）→ 容易在大小/透明度上除零
   *   adv-rank1 最重要（点最大、最亮）→ 容易越界
   *   adv-zero  颜色全零 → 必须如实画成 #000000，不许静默替换
   *   adv-edge  正好压在包围盒的两个最大值上 → 验证边界不被裁掉/外扩
   */
  nodes.push({
    id: 'adv-xml',
    name: '<script>&"\'',
    latex: '\\text{<script>}',
    family: 'schemes',
    cluster: false,
    pos: { x: 40, y: 0, z: 60 },
    width: 9, height: 3, rank: 0.5, brightness: 0.8,
    baseColor: hexToLinearTriple('#ffb03a'),
  })
  nodes.push({
    id: 'adv-rank0',
    name: '零重要度',
    latex: 'r=0',
    family: 'moduli',
    cluster: false,
    pos: { x: -120, y: 0, z: 20 },
    width: 4, height: 2, rank: 0, brightness: 0.34,
    baseColor: hexToLinearTriple('#7fd4ff'),
  })
  nodes.push({
    id: 'adv-rank1',
    name: '满重要度',
    latex: 'r=1',
    family: 'cohomology',
    cluster: false,
    pos: { x: 10, y: 0, z: -10 },
    width: 20, height: 5, rank: 1, brightness: 1.42,
    baseColor: hexToLinearTriple('#e0e0ff'),
  })
  nodes.push({
    id: 'adv-zero',
    name: '全零颜色',
    latex: 'rgb=0',
    family: 'motives',
    cluster: false,
    pos: { x: -60, y: 0, z: -80 },
    width: 6, height: 3, rank: 0.25, brightness: 0.5,
    baseColor: { r: 0, g: 0, b: 0 },
  })
  nodes.push({
    id: 'adv-edge',
    name: '边界节点',
    latex: 'x=175,z=-175',
    family: 'schemes',
    cluster: false,
    // 正好是 max x 与 min z：投影后 (175, +175) —— 图的右下角
    pos: { x: BOUND_X, y: 0, z: BOUND_Z },
    width: 8, height: 3, rank: 0.6, brightness: 0.9,
    baseColor: hexToLinearTriple('#ffd166'),
  })

  /* ── 连线：盘内边 + 跨结构边（cross） ── */
  for (let i = 0; i < 26; i++) {
    const a = `g${String(i % GALAXY_NAMES.length).padStart(2, '0')}`
    const b = `g${String((i * 7 + 3) % GALAXY_NAMES.length).padStart(2, '0')}`
    if (a === b) continue
    links.push({
      source: a, target: b,
      weight: Math.round((0.3 + rng() * 0.7) * 100) / 100,
      label: '同族关联', cross: false,
    })
  }
  for (let i = 0; i < 6; i++) {
    links.push({
      source: `g${String(i * 5).padStart(2, '0')}`,
      target: `c${String(i).padStart(2, '0')}`,
      weight: Math.round((0.4 + rng() * 0.6) * 100) / 100,
      label: '猜想依赖定理', cross: true,
    })
  }
  links.push({ source: 'adv-rank1', target: 'adv-xml', weight: 1, label: '对抗边', cross: false })

  return { nodes, links }
}

const FIXTURE = buildFixture()

/* ───────────────────────── 手写 XML 配平检查器 ─────────────────────────
 *
 * 需求明确要求：没有 XML 解析器时就用这个手写检查器。
 * （Node 标准库里确实没有 XML 解析器；装一个依赖会违反"不加依赖"。）
 *
 * 做法：逐字符扫，遇到 `<` 就切出一个标签：
 *   · `<!-- … -->` 注释      → 跳过
 *   · `<? … ?>`    处理指令   → 跳过（忽略 <?xml）
 *   · `<! … >`     DOCTYPE   → 跳过
 *   · `</name>`    闭合标签   → 弹栈，必须与栈顶同名
 *   · `<name … />` 自闭合     → 不入栈
 *   · `<name …>`   开标签     → 入栈
 * 找标签结束的 `>` 时会跳过引号内的内容（属性值里的 `>` 是合法的）。
 *
 * ⚠ 这个检查器**故意**把"正文里未转义的 `<`"也当成标签：
 *   那正是最该抓的错 —— `<script>` 出现在文本里会被解析成一个开标签，
 *   于是要么栈不配平、要么闭合标签对不上，两种情况都会被报出来。
 *   如果反过来"宽容地"跳过它，这项检查就形同虚设。
 */
function checkXml(svg) {
  const errors = []
  const stack = []
  let i = 0
  let tags = 0

  while (i < svg.length) {
    const lt = svg.indexOf('<', i)
    if (lt < 0) break

    if (svg.startsWith('<!--', lt)) {
      const end = svg.indexOf('-->', lt + 4)
      if (end < 0) { errors.push(`注释未闭合 @${lt}`); break }
      i = end + 3
      continue
    }
    if (svg.startsWith('<?', lt)) {
      const end = svg.indexOf('?>', lt + 2)
      if (end < 0) { errors.push(`处理指令未闭合 @${lt}`); break }
      i = end + 2
      continue
    }
    if (svg.startsWith('<!', lt)) {
      const end = svg.indexOf('>', lt + 2)
      if (end < 0) { errors.push(`DOCTYPE 未闭合 @${lt}`); break }
      i = end + 1
      continue
    }

    // 找标签的收尾 '>'，跳过引号内的内容
    let j = lt + 1
    let quote = null
    while (j < svg.length) {
      const ch = svg[j]
      if (quote) {
        if (ch === quote) quote = null
      } else if (ch === '"' || ch === "'") {
        quote = ch
      } else if (ch === '>') {
        break
      }
      j++
    }
    if (j >= svg.length) {
      errors.push(`标签未闭合（找不到 '>'）@${lt}: ${JSON.stringify(svg.slice(lt, lt + 40))}`)
      break
    }

    const raw = svg.slice(lt + 1, j)
    i = j + 1
    tags++

    if (raw.startsWith('/')) {
      const name = raw.slice(1).trim()
      const top = stack.pop()
      if (top === undefined) errors.push(`多余的闭合标签 </${name}> @${lt}`)
      else if (top !== name) errors.push(`标签不匹配：</${name}> 对不上 <${top}> @${lt}`)
      continue
    }

    const m = /^([A-Za-z_][\w:.-]*)/.exec(raw)
    if (!m) { errors.push(`非法标签名 @${lt}: ${JSON.stringify(raw.slice(0, 30))}`); continue }
    if (!raw.trimEnd().endsWith('/')) stack.push(m[1])
  }

  for (const t of stack) errors.push(`未闭合的开标签 <${t}>`)

  /* 未转义的 & ：`&` 后面必须跟一个合法实体引用，否则 XML 解析同样失败。
   * 这一条不在需求的括号配平里，但同属"良构性"，而且极便宜。 */
  const badAmp = svg.match(/&(?!(?:[A-Za-z][\w.-]*|#\d+|#x[0-9a-fA-F]+);)/g)
  if (badAmp) errors.push(`未转义的 & ${badAmp.length} 处`)

  return { errors, tags, depth: stack.length }
}

/** 统计某个标签出现次数（用 `<text` / `<circle` 这种前缀数） */
function countTags(svg, name) {
  const m = svg.match(new RegExp(`<${name}[\\s/>]`, 'g'))
  return m ? m.length : 0
}

/* ═════════════════════════ 开跑 ═════════════════════════ */

console.log('═'.repeat(62))
console.log('  verify-export.mjs —— 静态导出验证（纯 Node，无浏览器）')
console.log('═'.repeat(62))
console.log(`  合成 fixture：${FIXTURE.nodes.length} 个节点 / ${FIXTURE.links.length} 条关联` +
  `（其中猜想 ${FIXTURE.nodes.filter((n) => n.cluster).length} 个）`)

const SVG = exportSVG(FIXTURE, {
  width: 1600,
  title: '公式诗云 · 俯视平面图',
  showLinks: true,
  minLabelRank: 0.2,
})

/* ── 1. 基本形状 ── */
section(1, '返回值是干净的 SVG 字符串')
ok(typeof SVG === 'string', 'exportSVG 返回字符串', `typeof = ${typeof SVG}`)
ok(SVG.startsWith('<svg'), '以 <svg 开头', JSON.stringify(SVG.slice(0, 24)))
ok(SVG.endsWith('</svg>'), '以 </svg> 结尾', JSON.stringify(SVG.slice(-8)))
ok(SVG.length === SVG.trim().length,
  '长度等于 trim 后的长度（首尾无空白/换行）',
  `${SVG.length} vs ${SVG.trim().length}`)

/* ── 2. XML 良构 ── */
section(2, 'XML 良构（手写标签配平检查器）')
const xml = checkXml(SVG)
ok(xml.errors.length === 0, '零配平错误',
  xml.errors.length ? xml.errors.slice(0, 3).join(' | ') : `扫过 ${xml.tags} 个标签`)
ok(xml.depth === 0, '扫描结束时标签栈为空', `depth = ${xml.depth}`)

/* ── 2b. 检查器自身的负向对照 ──
 * 一个"永远说 OK"的检查器比没有检查器更危险：它会让上面两条断言变成
 * 安慰剂。所以这里拿三份**故意写坏**的 XML 喂给它，要求它必须报错 ——
 * 只有"好文件零错误 + 坏文件必报错"同时成立，良构断言才有意义。 */
{
  const bad = [
    ['缺失闭合标签', '<svg><g><circle/></g>'],
    ['多余闭合标签', '<svg></svg></g>'],
    ['标签交叉嵌套', '<svg><a><b></a></b></svg>'],
    ['正文里未转义的 <', '<svg><text>a < b</text></svg>'],
    ['未转义的 &', '<svg><text>a & b</text></svg>'],
  ]
  let caught = 0
  const missed = []
  for (const [label, s] of bad) {
    if (checkXml(s).errors.length > 0) caught++
    else missed.push(label)
  }
  ok(caught === bad.length, '负向对照：5 份写坏的 XML 全部被抓到',
    missed.length ? '漏掉：' + missed.join('、') : `${caught}/${bad.length}`)

  /* ⚠ 一个**故意的边界**，写下来免得后人以为它是漏网之鱼：
   *   正文里出现成对的未转义标签（`<text><script>x</script></text>`）
   *   在**标签配平**这个层面是合法的 —— 它就是一个 script 元素嵌在
   *   text 里。任何配平检查器都会放它过去，真解析器也会照收。
   *   所以"未转义的 <script>"这一条**不由本检查器负责**，
   *   而是由第 3 节的子串断言（输出里不许出现原始 `<script>`）负责。
   *   两者合起来才是完整的转义防线，缺一不可。 */
  ok(checkXml('<svg><text><script>x</script></text></svg>').errors.length === 0,
    '边界说明：成对未转义标签配平合法（转义由第 3 节子串断言把关）')

  // 正向对照：合法的注释 / 自闭合 / DOCTYPE / 属性里的 > 不许被误报
  const good = '<!DOCTYPE svg><!-- 注释 --><svg><a b="x>y"/><b/><c></c></svg>'
  ok(checkXml(good).errors.length === 0, '正向对照：注释/自闭合/属性里的 > 不误报',
    checkXml(good).errors.join(' | '))

  /* ── 2c. 有真解析器时用真解析器复核 ──
   * 手写检查器是**必需**的（Node 标准库没有 XML 解析器），但它只是
   * "标签配平"，不是完整良构性。项目 node_modules 里可能通过某个传递依赖
   * 存在一个真解析器（@xmldom/xmldom），有的话就拿它交叉验证一遍：
   * 两个独立实现都判合法，良构性才算真的立住了。
   * 没有就跳过 —— 这不是新增依赖，只是"顺手多用一次已经有东西"。 */
  let realParser
  try {
    realParser = await import('@xmldom/xmldom')
  } catch {
    realParser = null
  }
  if (realParser && typeof realParser.DOMParser === 'function') {
    const errs = []
    const doc = new realParser.DOMParser({
      onError: (level, msg) => { if (level !== 'warning') errs.push(msg) },
    }).parseFromString(SVG, 'image/svg+xml')
    const root = doc && doc.documentElement
    ok(errs.length === 0 && root && root.nodeName === 'svg',
      '独立复核：真 XML 解析器（@xmldom/xmldom）也判定为合法 SVG',
      errs.length ? errs.slice(0, 2).join(' | ') : `root = <${root && root.nodeName}>`)
    const texts = doc.getElementsByTagName('text')
    let decoded = null
    for (let k = 0; k < texts.length; k++) {
      if (String(texts[k].textContent).includes('script')) decoded = texts[k].textContent
    }
    ok(decoded === '<script>&"\'',
      '真解析器反向解码后，对抗性名字与原始字符串逐字符相等',
      JSON.stringify(decoded))
  } else {
    console.log('  · 未找到 @xmldom/xmldom，跳过硬解析器复核（手写检查器已覆盖）')
  }
}

/* ── 3. 转义 ── */
section(3, 'XML 转义（对抗性节点 <script>&"\'）')
ok(!SVG.includes('<script>'), '不含原始子串 <script>')
ok(SVG.includes('&lt;script&gt;'), '含转义后的 &lt;script&gt;')
ok(!SVG.includes('&"'), '不含未转义的 &" 组合')
ok(SVG.includes('&amp;&quot;&apos;') || SVG.includes('&amp;&quot;'),
  '& " \' 均被转义成实体')
ok(escapeXml('<a href="x">&\'</a>') === '&lt;a href=&quot;x&quot;&gt;&amp;&apos;&lt;/a&gt;',
  'escapeXml 单元行为正确', escapeXml('&<>"\''))

/* ── 4. NaN / undefined ── */
section(4, '输出里没有 NaN / undefined')
ok(!SVG.includes('undefined'), '不含子串 undefined')
ok(!SVG.includes('NaN'), '不含子串 NaN')
ok(!SVG.includes('Infinity'), '不含子串 Infinity')

/* ── 5. 颜色属性全是十六进制或 none ── */
section(5, '所有 fill= / stroke= 都是 #rrggbb 或 none')
const colorAttrs = [...SVG.matchAll(/\b(fill|stroke)="([^"]*)"/g)]
const badColors = colorAttrs.filter((m) => !/^(#[0-9a-f]{6}|none)$/i.test(m[2]))
ok(colorAttrs.length > 0, '确实扫到了颜色属性', `共 ${colorAttrs.length} 处`)
ok(badColors.length === 0, '全部合法',
  badColors.length
    ? badColors.slice(0, 4).map((m) => `${m[1]}="${m[2]}"`).join(' | ')
    : `样例 ${colorAttrs.slice(0, 3).map((m) => m[2]).join(' ')}`)

/* ── 6. 传递函数 ── */
section(6, 'linearToSrgb 端点与单调性')
ok(Math.abs(linearToSrgb(0) - 0) < 1e-9, 'linearToSrgb(0) === 0', `${linearToSrgb(0)}`)
ok(Math.abs(linearToSrgb(1) - 1) < 1e-9, 'linearToSrgb(1) === 1', `${linearToSrgb(1)}`)
ok(Math.abs(linearToSrgb(0.0031308) - 12.92 * 0.0031308) < 1e-12,
  '低段走 12.92 线性支（两段在 0.0031308 连续）')
{
  let monotonic = true
  let worst = 0
  let prev = linearToSrgb(0)
  for (let i = 1; i <= 100; i++) {
    const v = linearToSrgb(i / 100)
    if (v < prev) { monotonic = false; worst = i / 100 }
    prev = v
  }
  ok(monotonic, '0..1 采样 100 点严格单调不降', monotonic ? '' : `在 ${worst} 处回落`)
}

/* ── 7. 十六进制转换 ── */
section(7, 'srgbHex 端点')
ok(srgbHex({ r: 0, g: 0, b: 0 }) === '#000000', "srgbHex(全零) === '#000000'",
  srgbHex({ r: 0, g: 0, b: 0 }))
ok(srgbHex({ r: 1, g: 1, b: 1 }) === '#ffffff', "srgbHex(全一) === '#ffffff'",
  srgbHex({ r: 1, g: 1, b: 1 }))
ok(srgbHex([1, 0, 0]) === '#ff0000', '数组形状也接受（conjStatusColors 是数组）',
  srgbHex([1, 0, 0]))
ok(cssColor({ r: 0, g: 0, b: 0 }) === srgbHex({ r: 0, g: 0, b: 0 }),
  'cssColor 与 srgbHex 等价')
// 关键语义：线性 0.5 必须变成 sRGB ≈ 0.735（≈ #bcbcbc），直接当 sRGB 用会得到 #808080
ok(srgbHex({ r: 0.5, g: 0.5, b: 0.5 }) === '#bcbcbc',
  '线性 0.5 → #bcbcbc（证明真的做了传递函数，而不是直通）',
  srgbHex({ r: 0.5, g: 0.5, b: 0.5 }))

/* ── 8. 单节点 include：span ≈ 0 且下游不炸 ── */
section(8, 'include 限定到单个节点（span = 0，不许除零）')
{
  const only = new Set(['adv-rank1'])
  const b1 = computeBounds(FIXTURE.nodes, { include: only })
  ok(b1.count === 1, '包围盒只统计了 1 个节点', `count = ${b1.count}`)
  ok(Math.abs(b1.span) < 1e-9, 'span ≈ 0', `span = ${b1.span}`)
  ok(Math.abs(b1.spanX) < 1e-9 && Math.abs(b1.spanZ) < 1e-9,
    '两个方向的跨度都是 0', `spanX=${b1.spanX} spanZ=${b1.spanZ}`)

  const one = exportSVG(FIXTURE, { width: 800, include: only, title: '单节点' })
  const oneXml = checkXml(one)
  ok(one.startsWith('<svg') && one.endsWith('</svg>'), '单节点导出仍是完整 SVG')
  ok(oneXml.errors.length === 0, '单节点导出仍然良构',
    oneXml.errors.length ? oneXml.errors.join(' | ') : '')
  ok(!one.includes('NaN') && !one.includes('Infinity'),
    '单节点导出没有 NaN/Infinity（span=0 没有变成除数）')
  ok(countTags(one, 'circle') === 1, '单节点导出只画了 1 个圆', `circle = ${countTags(one, 'circle')}`)
}

/* ── 8b. include 真的决定包围盒（不是拿全体算的）── */
section('8b', '包围盒只由 include 选中的节点决定')
{
  const galOnly = new Set(FIXTURE.nodes.filter((n) => !n.cluster).map((n) => n.id))
  const galaxyCount = FIXTURE.nodes.filter((n) => !n.cluster).length
  const conjCount = FIXTURE.nodes.filter((n) => n.cluster).length
  const bAll = computeBounds(FIXTURE.nodes)
  const bGal = computeBounds(FIXTURE.nodes, { include: galOnly })
  const bConj = computeBounds(FIXTURE.nodes, { include: (id, n) => n.cluster })
  ok(bGal.count === galaxyCount, `主星系筛出 ${galaxyCount} 个节点`, `count = ${bGal.count}`)
  ok(bConj.count === conjCount, `谓词式 include 筛出 ${conjCount} 个猜想`, `count = ${bConj.count}`)
  ok(bGal.spanX < bAll.spanX * 0.75,
    '只看主星系时跨度明显变小（否则盘会缩成角落一小坨）',
    `galaxy ${bGal.spanX.toFixed(1)} vs all ${bAll.spanX.toFixed(1)}`)
  ok(bConj.minX > 150, '只看星团时包围盒跳到了 +x 一侧',
    `minX = ${bConj.minX.toFixed(1)}`)
  /* 星团外挂在 +x，所以"全体"的包围盒必须比"只看主星系"更宽 ——
   * 这正是"包围盒必须跟着 include 走"的直接证据：
   * 拿全体算的包围盒去画主星系，盘只会占画面的一部分。 */
  ok(bAll.maxX > BOUND_X + 50,
    '全体包围盒被 +x 的猜想星团撑宽（星团 offset ≈ 255）',
    `all.maxX = ${bAll.maxX.toFixed(1)} vs galaxy.maxX = ${bGal.maxX.toFixed(1)}`)

  /* 正好落在包围盒边界上的节点（adv-edge 是最大 x、最小 z）：
   * 断言它单独成图时 min === max，且投影后落在右下角 ——
   * 边界节点是"裁剪 / 外扩 / 半像素偏移"这类错误最容易露馅的地方。 */
  const bEdge = computeBounds(FIXTURE.nodes, { include: new Set(['adv-edge']) })
  ok(bEdge.count === 1 && Math.abs(bEdge.minX - BOUND_X) < 1e-9 &&
     Math.abs(bEdge.maxX - BOUND_X) < 1e-9,
    `边界节点的 x 正好等于包围盒的 ${BOUND_X}`, `min=max=${bEdge.minX}`)
  const advedge = FIXTURE.nodes.find((n) => n.id === 'adv-edge')
  const proj = projectPoint(advedge.pos.x, advedge.pos.z)
  ok(Math.abs(proj.x - BOUND_X) < 1e-9 && Math.abs(proj.y - BOUND_X) < 1e-9,
    '投影约定 (x,z) → (x,−z)：边界节点落在右下角', `(${proj.x}, ${proj.y})`)
}

/* ── 9. 空输入 ── */
section(9, '空节点列表 → 返回合法空图（不抛错）')
{
  let emptySvg = null
  let threw = null
  try {
    emptySvg = exportSVG({ nodes: [], links: [] })
  } catch (e) {
    threw = e
  }
  ok(threw === null, 'exportSVG({nodes:[]}) 不抛错（约定：返回空图，见 exportView 注释）',
    threw ? String(threw.message) : '')
  if (emptySvg != null) {
    const ex = checkXml(emptySvg)
    ok(emptySvg.startsWith('<svg') && emptySvg.endsWith('</svg>'), '空图仍是完整 SVG')
    ok(ex.errors.length === 0, '空图良构', ex.errors.join(' | '))
    ok(!emptySvg.includes('NaN') && !emptySvg.includes('undefined'), '空图没有 NaN/undefined')
    ok(emptySvg.includes('没有可导出的节点'), '空图带一行中文提示')
    ok(countTags(emptySvg, 'circle') === 0, '空图没有节点圆')
  } else {
    ok(false, '空图未生成，后续断言跳过')
    ok(false, '空图良构（跳过）')
    ok(false, '空图没有 NaN/undefined（跳过）')
    ok(false, '空图提示（跳过）')
    ok(false, '空图节点数（跳过）')
  }
  // 真正的坏输入仍然要抛错：给了个根本不是 graph 的东西
  let badThrew = false
  try { exportSVG(null) } catch { badThrew = true }
  ok(badThrew, 'exportSVG(null) 抛错（坏输入不静默出空图）')
}

/* ── 10. minLabelRank 真的减少标签 ── */
section(10, 'minLabelRank 减少 <text> 数量')
{
  const all = exportSVG(FIXTURE, { width: 1600, minLabelRank: 0 })
  const few = exportSVG(FIXTURE, { width: 1600, minLabelRank: 0.9 })
  const cAll = countTags(all, 'text')
  const cFew = countTags(few, 'text')
  console.log(`      minLabelRank = 0.0 → ${cAll} 个 <text>`)
  console.log(`      minLabelRank = 0.9 → ${cFew} 个 <text>`)
  ok(cFew < cAll, 'minLabelRank = 0.9 的标签数严格少于 0', `${cFew} < ${cAll}`)
  ok(cAll === FIXTURE.nodes.length, 'minLabelRank = 0 时每个节点都有一条标签',
    `${cAll} === ${FIXTURE.nodes.length}`)
  const expectedFew = FIXTURE.nodes.filter((n) => (n.rank ?? 0) >= 0.9).length
  ok(cFew === expectedFew, '阈值处的数量与数据一致', `${cFew} === ${expectedFew}`)
  ok(/data-label-count="\d+"/.test(all) && /data-label-count="\d+"/.test(few),
    '标签数也写进了 data- 属性（调用方可直接读）')
  // showLabels:false 时一个都不该有
  const none = exportSVG(FIXTURE, { width: 1600, showLabels: false })
  ok(countTags(none, 'text') === 0, 'showLabels:false 时零标签', `text = ${countTags(none, 'text')}`)
}

/* ── 11. 文件名 ── */
section(11, 'exportFilename 是纯 ASCII 且确定性')
{
  const ascii = /^[a-z0-9._-]+\.svg$/
  const f1 = exportFilename({ scope: 'overview', date: '2026-09-16' })
  ok(ascii.test(f1), '常规入参匹配 ^[a-z0-9._-]+\\.svg$', f1)
  ok(f1 === 'formula-nebula-overview-2026-09-16.svg', '名字符合约定形态', f1)

  const f2 = exportFilename({ title: '公式诗云 · 俯视平面图', date: new Date(2026, 8, 16) })
  ok(ascii.test(f2), '中文标题不污染文件名（无 CJK、无空格）', f2)
  ok(!/[\u4e00-\u9fff]/.test(f2) && !f2.includes(' '), '确实没有中文与空格', f2)

  const f3 = exportFilename({ scope: 'galaxy 主星系', date: '2026-09-16' })
  ok(ascii.test(f3), '混合中英 scope 仍然安全', f3)

  const same1 = exportFilename({ scope: 'cluster', date: '2026-01-02' })
  const same2 = exportFilename({ scope: 'cluster', date: '2026-01-02' })
  ok(same1 === same2, '同参数两次调用结果一致（确定性）', `${same1} === ${same2}`)
  ok(exportFilename({ prefix: '公式诗云', scope: '', title: '!!!' }).length > 0,
    '全中文 + 全符号入参也不会产出空名',
    exportFilename({ prefix: '公式诗云', scope: '', title: '!!!' }))
}

/* ── 12. downloadSVG 在 Node 里抛错 ── */
section(12, 'downloadSVG 在无 DOM 环境抛错（不静默 no-op）')
{
  let threw = null
  try {
    downloadSVG(SVG, 'x.svg')
  } catch (e) {
    threw = e
  }
  ok(threw !== null, '在 Node 里调用会抛错（而不是无声返回）')
  ok(threw !== null && typeof threw.message === 'string' && /[\u4e00-\u9fff]/.test(threw.message),
    '错误信息是中文且可读', threw ? threw.message.slice(0, 46) + '…' : '(未抛错)')

  let threw2 = null
  try { downloadSVG('', 'x.svg') } catch (e) { threw2 = e }
  ok(threw2 !== null, '空字符串入参同样抛错（先验参数，再验环境）')
  ok(typeof globalThis.document === 'undefined', '当前确实是 Node（没有 document）')
}

/* ── 13. 落盘一张真图 ── */
section(13, '写出真实样图 .research/export-sample.svg')
{
  const sample = exportSVG(FIXTURE, {
    width: 2400,
    padding: 48,
    title: '公式诗云 · 俯视平面图（主星系 + 猜想星团）',
    showLinks: true,
    showLabels: true,
    minLabelRank: 0.25,
  })
  mkdirSync(dirname(OUT_SVG), { recursive: true })
  writeFileSync(OUT_SVG, sample, 'utf8')

  const back = readFileSync(OUT_SVG, 'utf8')
  const bytes = statSync(OUT_SVG).size
  ok(back === sample, 'utf8 落盘后读回与内存中的字符串逐字节一致（中文没被换码）')
  ok(back.includes('黎曼-罗赫定理') && back.includes('霍奇猜想'), '中文名字确实写进了文件')
  ok(checkXml(back).errors.length === 0, '落盘后的文件仍然良构')
  ok(bytes > 2000, '样图不是空壳', `${bytes} 字节`)
  console.log(`      样图：${OUT_SVG}`)
  console.log(`      字节数：${bytes}  节点 ${countTags(back, 'circle')} 个` +
    `  标签 ${countTags(back, 'text')} 条  连线 ${countTags(back, 'path')} 条`)
}

/* ── 14. 附加：连线的几个约定 ── */
section(14, '连线：只画两端都在图内的，且默认可关闭')
{
  const withLinks = exportSVG(FIXTURE, { width: 1600, showLinks: true })
  const noLinks = exportSVG(FIXTURE, { width: 1600 })
  ok(countTags(noLinks, 'path') === 0, 'showLinks 默认 false → 不画连线',
    `path = ${countTags(noLinks, 'path')}`)
  const expected = FIXTURE.links.length
  ok(countTags(withLinks, 'path') === expected, 'showLinks:true 画出全部可用连线',
    `${countTags(withLinks, 'path')} === ${expected}`)
  ok(/<g class="links" data-link-count="\d+"/.test(withLinks), '连线组带 data-link-count')
  /* 跨结构边必须能被单独选中（否则没法给它们换颜色/虚线）。
   * 用"class 属性里含有 lk-cross 这个词"来判，而不是全串查找 ——
   * 后者会被 data-label 里的文字误伤。 */
  ok(/<path class="[^"]*\blk-cross\b[^"]*"/.test(withLinks),
    '跨结构连线带 lk-cross 类（可用不同颜色/虚线）')
  {
    const crossStrokes = new Set()
    const normalStrokes = new Set()
    for (const m of withLinks.matchAll(/<path class="([^"]*)"[^>]*stroke="([^"]*)"/g)) {
      (/\blk-cross\b/.test(m[1]) ? crossStrokes : normalStrokes).add(m[2])
    }
    ok(crossStrokes.size === 1 && normalStrokes.size === 1 &&
       [...crossStrokes][0] !== [...normalStrokes][0],
      '跨结构边用的确实是另一种颜色',
      `cross=${[...crossStrokes].join(',')} normal=${[...normalStrokes].join(',')}`)
  }

  // linkSubset：只给一个节点的关联 —— 两端都得在图里，否则会画出半截悬空的线
  const focusId = 'adv-rank1'
  const subset = FIXTURE.links.filter((l) => l.source === focusId || l.target === focusId)
  const subsetSvg = exportSVG(FIXTURE, { width: 1600, linkSubset: subset })
  ok(countTags(subsetSvg, 'path') === subset.length, 'linkSubset 只画给到的那几条',
    `${countTags(subsetSvg, 'path')} === ${subset.length}`)
  const galOnly = new Set(FIXTURE.nodes.filter((n) => !n.cluster).map((n) => n.id))
  const cross = FIXTURE.links.filter((l) => l.cross)
  const clippedSvg = exportSVG(FIXTURE, { width: 1600, include: galOnly, linkSubset: cross })
  ok(countTags(clippedSvg, 'path') === 0,
    'linkSubset 里两端不全在图内的边被丢弃（不画悬空半截线）',
    `path = ${countTags(clippedSvg, 'path')}，跨结构边 ${cross.length} 条全被丢弃`)
}

/* ── 15. 附加：确定性与 maxNodes ── */
section(15, '确定性与 maxNodes 截断')
{
  const a = exportSVG(FIXTURE, { width: 1200, minLabelRank: 0.3, showLinks: true })
  const b = exportSVG(FIXTURE, { width: 1200, minLabelRank: 0.3, showLinks: true })
  ok(a === b, '同参数两次调用逐字符一致（可复现）')

  const capped = exportSVG(FIXTURE, { width: 1200, maxNodes: 10, showLinks: true })
  ok(countTags(capped, 'circle') === 10, 'maxNodes 截断到 10 个节点',
    `circle = ${countTags(capped, 'circle')}`)
  // 截断后不许再出现被丢掉节点的关联（否则线会连到画外）
  const kept = new Set()
  for (const m of capped.matchAll(/<circle[^>]*\/>/g)) kept.add(m[0])
  ok(!capped.includes('NaN'), 'maxNodes 截断后没有 NaN')
  ok(checkXml(capped).errors.length === 0, 'maxNodes 截断后仍然良构')
  ok(/data-node-count="10"/.test(capped), '截断后的节点数如实写进 data-node-count')
}

/* ── 16. 附加：状态着色 / 背景 / 标题 / 投影开关 ── */
section(16, '选项面：statusColors、background、title、flipZ')
{
  /* statusColors 的形状必须跟 graph.js 的 conjStatusColors 对得上
   * （status → [r,g,b] 线性数组）。这里用真数据里的那 5 个状态色。 */
  const statusColors = {
    open: [0.997, 0.276, 0.157],
    partial: [1.0, 0.641, 0.135],
    proved: [0.213, 0.749, 0.401],
    disproved: [0.997, 0.150, 0.259],
    heuristic: [0.352, 0.463, 1.0],
  }
  const withStatus = exportSVG(FIXTURE, { width: 1200, statusColors })
  const ringStrokes = new Set()
  for (const m of withStatus.matchAll(/<circle class="[^"]*\bnd-conj\b[^"]*"[^>]*stroke="([^"]*)"/g)) {
    ringStrokes.add(m[1])
  }
  ok(ringStrokes.size > 1, '猜想环按 status 着上了**不同**的颜色（不是全同一色）',
    `${ringStrokes.size} 种：${[...ringStrokes].join(' ')}`)
  ok([...ringStrokes].every((c) => /^#[0-9a-f]{6}$/.test(c)), '状态色全部合法')
  const statusesInFixture = [...new Set(FIXTURE.nodes.filter((n) => n.cluster).map((n) => n.status))]
  ok(statusesInFixture.every((s) => withStatus.includes(`data-status="${s}"`)),
    `status 也写进 data- 属性（${statusesInFixture.join('/')}）`,
    `fixture 里有 ${statusesInFixture.length} 种状态`)
  // 不给 statusColors 时也必须能跑（退回节点本色）
  ok(!exportSVG(FIXTURE, { width: 1200 }).includes('NaN'),
    '不传 statusColors 时正常退回节点本色')

  const custom = exportSVG(FIXTURE, { width: 900, background: '#123456', title: '标题 <&> 测试' })
  ok(/<rect class="bg"[^>]*fill="#123456"/.test(custom), 'background 选项生效')
  ok(custom.includes('标题 &lt;&amp;&gt; 测试'), 'title 被正确转义后写入')
  ok(!custom.includes('标题 <&>'), 'title 里的原文没有漏进 SVG')
  ok(checkXml(custom).errors.length === 0, '带特殊字符标题的图仍然良构')

  /* flipZ：两种约定必须是彼此的镜像（同一个节点 x 不变、y 取反） */
  const flipNode = FIXTURE.nodes.find((n) => n.id === 'adv-xml')
  const p0 = projectPoint(flipNode.pos.x, flipNode.pos.z, false)
  const p1 = projectPoint(flipNode.pos.x, flipNode.pos.z, true)
  ok(p0.x === p1.x && p0.y === -p1.y,
    'flipZ 只翻转纵轴，横向不变（两种约定互为镜像）',
    `(${p0.x},${p0.y}) vs (${p1.x},${p1.y})`)
  const bFlip = computeBounds(FIXTURE.nodes, { include: new Set(['adv-xml']), flipZ: true })
  ok(Math.abs(bFlip.minZ - 60) < 1e-9, 'flipZ 不改 minZ/maxZ（它们始终是世界 z）',
    `minZ = ${bFlip.minZ}`)
}

/* ── 汇总 ── */
console.log('\n' + '═'.repeat(62))
if (fail) {
  console.log(`失败的断言（${fail} 条）：`)
  for (const f of failures) console.log(`  ✗ ${f}`)
}
console.log(`结果：${pass} / ${pass + fail} 通过`)
process.exit(fail ? 1 : 0)
