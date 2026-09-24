/**
 * ═══════════════════════════════════════════════════════════════
 *  界面层：标题 / 加载进度 / 图例 / 悬停提示 / 搜索 / 详情面板
 * ═══════════════════════════════════════════════════════════════
 *
 *  详情面板里的公式用 KaTeX 直接渲染 DOM —— 比 3D 贴图锐利得多，
 *  而且可以选中复制。3D 里的公式负责"看整体"，面板负责"读细节"。
 */

import katex from 'katex'
import 'katex/dist/katex.min.css'
import { FAMILIES } from './data/knowledge.js'
import { CONJECTURE_STATUS, CONJECTURE_FIELDS } from './data/conjectures.js'
import { progressOf, DATA_AS_OF } from './data/progress.js'
import { UI, GLYPH } from './config.js'
import { settings } from './settings.js'
import { buildEqualizedPalette } from './palette.js'
import { parseQuery, findPath, QUERY_KEYS } from './graphQuery.js'
import { allTypeDefs } from './linkTypes.js'
import * as exportView from './exportView.js'
import { VIEWS } from './config.js'
const VIEW_LABEL = Object.fromEntries(
  Object.entries(VIEWS).map(([k, v]) => [k, v.label]))

/* 图例上的族色点必须用**均衡后**的颜色 —— 那是画面里真正渲染的颜色。
 * 直接用 FAMILIES 里的原始 hex，图例和画面对不上（原始紫偏暗、均衡后更亮），
 * 看起来会像"图例标错了"。 */
const FAMILY_UI_COLOR = (() => {
  const raw = {}
  for (const [k, def] of Object.entries(FAMILIES)) raw[k] = def.color
  const eq = buildEqualizedPalette(raw, GLYPH.familyLightness)
  const out = {}
  for (const [k, v] of Object.entries(eq)) out[k] = v.hex
  return out
})()
function familyUiColor(key) {
  return FAMILY_UI_COLOR[key] || FAMILIES[key]?.color || '#ffb03a'
}

/* ── 猜想星团的取色 ──
 *
 * 与族色一样，图例/徽章上用的必须是**均衡后**的颜色，
 * 否则"星团按状态着色"时图例上的橙和画面里的橙不是同一个，
 * 用户会以为图例标错了。
 *
 * 均衡化把 5 个状态色 / 6 个领域色分别拉到同一感知明度 ——
 * 这一步对星团尤其重要：状态色里"已证明"是浅绿、"未解决"是橙，
 * 原始 hex 的明度差得远，不均衡的话画面上会读成"绿色更重要"，
 * 而这里要表达的是**认识论状态**，与重要度无关（重要度由半径表达）。 */
function equalizeColors(defs) {
  const raw = {}
  for (const [k, def] of Object.entries(defs)) raw[k] = def.color
  const eq = buildEqualizedPalette(raw, GLYPH.familyLightness)
  const out = {}
  for (const [k, def] of Object.entries(defs)) {
    out[k] = { ...def, ui: eq[k]?.hex || def.color }
  }
  return out
}
const STATUS_UI = equalizeColors(CONJECTURE_STATUS)
const FIELD_UI = equalizeColors(CONJECTURE_FIELDS)

/* ── 关系类型的 UI 取色 ──
 *
 * linkTypes.js 里存的是 sRGB hex，直接拿来当 CSS 颜色即可 ——
 * 但**不能**用它去和画面比对：画面上的线走的是线性空间 + 加法混合，
 * 同一个 hex 在屏幕上会明显更亮。图例点用 hex 是对的（CSS 会按 sRGB 解释），
 * 验证脚本要断言画面颜色时读的是 link.typeColor（线性），两者别混。 */
const TYPE_UI = (() => {
  const out = {}
  for (const t of allTypeDefs()) out[t.id] = t.color
  return out
})()
function typeUiColor(id) { return TYPE_UI[id] || '#5a7ba8' }
function typeUiLabel(id) {
  const d = allTypeDefs().find((t) => t.id === id)
  return d ? d.zh : '相关'
}

/** 节点在 UI 里该用哪个颜色（族色 / 状态色 / 领域色） */
function nodeUiColor(n) {
  if (!n.cluster) {
    // 主星系在"按状态/按领域"模式下仍按族着色（那两个模式只定义在星团上）
    return familyUiColor(n.family)
  }
  const mode = settings.state.colorMode
  if (mode === 'field') return FIELD_UI[n.field]?.ui || '#c9b0ff'
  // family / status / mono 三种模式在星团上都按状态着色：
  //   status 是明确选择；family 与 mono 没有为星团定义语义，
  //   退回"信息量最大"的那一维（认识论状态）比退回单色更有用。
  return STATUS_UI[n.status]?.ui || '#ff8f6b'
}

/** 节点的标签（徽章文字）：星团显示状态名，主星系显示族名 */
function nodeBadge(n) {
  if (!n.cluster) return FAMILIES[n.family]?.name || n.family
  return STATUS_UI[n.status]?.name || n.status
}

const CSS = `
:root{
  --ink:#eaf2ff; --dim:#8fa4c4; --line:rgba(140,180,255,.18);
  --panel:rgba(10,14,28,.82); --accent:#ffce7a;
}
*{box-sizing:border-box}
html,body{margin:0;height:100%;overflow:hidden;background:#03050d}
body{
  font-family:"Inter","PingFang SC","Microsoft YaHei",system-ui,sans-serif;
  color:var(--ink); -webkit-font-smoothing:antialiased;
}
#scene{position:fixed;inset:0;display:block;width:100%;height:100%}

/* 上下黑边 + 暗角：两行 CSS 换来的"电影感" */
#vignette{
  position:fixed;inset:0;pointer-events:none;z-index:5;
  background:
    radial-gradient(ellipse at 50% 50%, transparent 42%, rgba(0,0,0,.55) 100%),
    linear-gradient(to bottom, rgba(0,0,0,.75) 0, transparent 8vh),
    linear-gradient(to top,    rgba(0,0,0,.75) 0, transparent 8vh);
}

#hud{position:fixed;inset:0;z-index:10;pointer-events:none}
/* 只有真正需要交互的元素才接收鼠标事件。
   纯装饰性文字必须保持 pointer-events:none，
   否则从标题/图例上按下拖动时事件会被这些 div 吃掉，画面就转不动了。 */
#search,#results,#panel{pointer-events:auto}

/* ── 标题 ── */
#title{
  position:absolute;top:26px;left:30px;transition:opacity .7s ease;
  pointer-events:none;
}
#title h1{
  margin:0;font-size:26px;font-weight:600;letter-spacing:.22em;
  background:linear-gradient(92deg,#fff6e0,#8fd8ff 55%,#b48cff);
  -webkit-background-clip:text;background-clip:text;color:transparent;
}
#title p{
  margin:7px 0 0;font-size:11.5px;color:var(--dim);letter-spacing:.16em;
}

/* ── 底部提示 ── */
#hint{
  position:absolute;bottom:26px;left:50%;transform:translateX(-50%);
  font-size:11.5px;color:var(--dim);letter-spacing:.13em;text-align:center;
  transition:opacity .7s ease;white-space:nowrap;
}
body.idle #title,body.idle #hint,body.idle #legend,body.idle #exportwrap{opacity:.06}

/* ── 导出按钮 ──
 * 摆在**左下角**：右下角是图例（#legend，right:26px;bottom:26px），
 * 放同一角会直接压在一起。左下角目前是空的（标题在左上、
 * 提示在下方居中、图例在右下），不需要再挪任何东西。
 *
 * 为什么不做成图标：这是**低频但重要**的操作（导出一次留档），
 * 一个没有文字说明的图标用户不会去点，也不会知道它导出的是什么。 */
#exportwrap{
  position:absolute;left:30px;bottom:26px;
  transition:opacity .7s ease;pointer-events:auto;
}
#export{
  appearance:none;cursor:pointer;
  background:var(--panel);color:var(--dim);
  border:1px solid var(--line);border-radius:9px;
  padding:6px 13px;font-size:11px;letter-spacing:.12em;
  font-family:inherit;backdrop-filter:blur(10px);
  transition:color .18s ease,border-color .18s ease;
}
#export:hover:not(:disabled){color:#cfe0ff;border-color:#4a6ea8}
#export:disabled{opacity:.55;cursor:default}

/* ── 图例 ── */
#legend{
  position:absolute;right:26px;bottom:26px;font-size:11px;
  color:var(--dim);letter-spacing:.1em;text-align:right;
  transition:opacity .7s ease;
}
#legend .grad{
  width:132px;height:5px;border-radius:3px;margin:8px 0 6px auto;
  /* 所有公式同色相，重要度只由亮度表达：
     左（外缘）= 暗橙黄 → 右（核心）= 亮橙黄 */
  background:linear-gradient(90deg,#5a3d14,#a86a1c,#ffb03a,#ffd89a);
  box-shadow:0 0 14px rgba(255,176,58,.42);
}
#legend .fams{margin-top:14px;display:flex;flex-direction:column;gap:4px;align-items:flex-end}
#legend .fam{display:flex;align-items:center;gap:7px;font-size:10.5px}
#legend .dot{width:7px;height:7px;border-radius:50%;flex:none}
/* 分组小标题：图例里同时列星团与主星系时用它分隔 */
#legend .fam.grp{
  color:#6b7fa3;font-size:9.5px;letter-spacing:.14em;margin-top:7px;
}
#legend .fam.grp:first-child{margin-top:0}
/* 数据截止日期。
 * 刻意做得比其它行更暗、更小：它不是用来"看"的，是用来"查"的 ——
 * 只在用户想确认这份数据有多新时才需要读到它。
 * 但不能省略：不写清楚截至何时，标着"未解决"的猜想就不可信。 */
#legend .asof{
  margin-top:12px;padding-top:8px;
  border-top:1px solid rgba(107,127,163,.22);
  color:#5f7093;font-size:9.5px;letter-spacing:.1em;
}
/* 搜索结果里的状态角标 */
#results .row .tag{
  font-size:9.5px;opacity:.85;border:1px solid currentColor;
  padding:1px 6px;border-radius:9px;flex:none;
}

/* ── 悬停气泡 ── */
#tip{
  position:absolute;padding:7px 12px;border-radius:9px;
  background:var(--panel);border:1px solid var(--line);
  font-size:12px;letter-spacing:.05em;pointer-events:none;
  opacity:0;transition:opacity .16s ease;white-space:nowrap;
  backdrop-filter:blur(10px);z-index:30;
}
#tip.on{opacity:1}
#tip b{color:var(--accent);font-weight:600}
#tip s{display:block;text-decoration:none;color:var(--dim);font-size:10.5px;margin-top:3px}
/* 连线提示：理由常常 20–40 字，一行放不下。
 * 节点提示保持 nowrap（名字都很短），边提示改成定宽换行 ——
 * 这里必须是 #tip.edge 而不是 #tip，否则会把节点提示也撑成方块。 */
#tip.edge{max-width:290px;white-space:normal;line-height:1.55}
#tip.edge i.why{
  display:block;font-style:normal;margin-top:5px;
  color:#c3cede;font-size:11.5px;
}

/* ── 加载 ── */
#load{
  position:fixed;inset:0;z-index:60;display:flex;
  flex-direction:column;align-items:center;justify-content:center;
  background:#03050d;transition:opacity .8s ease;gap:20px;
}
#load.done{opacity:0;pointer-events:none}
#load .glyph{
  font-size:44px;letter-spacing:.3em;
  background:linear-gradient(92deg,#fff6e0,#8fd8ff,#b48cff);
  -webkit-background-clip:text;background-clip:text;color:transparent;
  animation:pulse 2.6s ease-in-out infinite;
}
@keyframes pulse{0%,100%{opacity:.55}50%{opacity:1}}
#load .bar{
  width:280px;height:2px;background:rgba(140,180,255,.16);
  border-radius:2px;overflow:hidden;
}
#load .bar i{
  display:block;height:100%;width:0;
  background:linear-gradient(90deg,#8fd8ff,#fff6e0);
  transition:width .18s ease;box-shadow:0 0 10px #8fd8ff;
}
#load .lbl{font-size:11px;color:var(--dim);letter-spacing:.16em;height:14px}

/* ── 搜索 ── */
#search{
  position:absolute;top:26px;right:26px;width:230px;
}
#search input{
  width:100%;padding:9px 13px;border-radius:9px;
  background:var(--panel);border:1px solid var(--line);
  color:var(--ink);font-size:12.5px;outline:none;
  letter-spacing:.06em;backdrop-filter:blur(10px);
  font-family:inherit;transition:border-color .2s;
}
#search input:focus{border-color:rgba(143,216,255,.6)}
#search input::placeholder{color:#5d7396}
#results{
  margin-top:7px;max-height:46vh;overflow-y:auto;border-radius:9px;
  background:var(--panel);border:1px solid var(--line);
  backdrop-filter:blur(10px);display:none;
}
#results.on{display:block}
#results .row{
  padding:8px 13px;font-size:12px;cursor:pointer;
  border-bottom:1px solid rgba(140,180,255,.07);
  display:flex;align-items:center;gap:8px;
}
#results .row:last-child{border-bottom:none}
#results .row:hover{background:rgba(143,216,255,.12)}
#results .row .dot{width:6px;height:6px;border-radius:50%;flex:none}
#results .row .nm{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}

/* ── 详情面板 ── */
#panel{
  position:absolute;top:0;right:0;height:100%;width:432px;max-width:92vw;
  background:linear-gradient(180deg,rgba(9,13,26,.95),rgba(6,9,20,.97));
  border-left:1px solid var(--line);
  backdrop-filter:blur(18px);
  transform:translateX(102%);transition:transform .42s cubic-bezier(.22,.9,.25,1);
  display:flex;flex-direction:column;z-index:40;
  box-shadow:-30px 0 70px rgba(0,0,0,.6);
}
#panel.on{transform:translateX(0)}
#panel .hd{
  padding:20px 24px 14px;border-bottom:1px solid var(--line);flex:none;position:relative;
}
#panel .hd .nm{font-size:19px;font-weight:600;letter-spacing:.06em;padding-right:34px}
#panel .hd .en{font-size:11px;color:var(--dim);margin-top:5px;letter-spacing:.1em}
#panel .close{
  position:absolute;top:18px;right:20px;width:28px;height:28px;border-radius:50%;
  border:1px solid var(--line);background:transparent;color:var(--dim);
  cursor:pointer;font-size:15px;line-height:1;display:flex;
  align-items:center;justify-content:center;transition:.18s;font-family:inherit;
}
#panel .close:hover{color:var(--ink);border-color:rgba(143,216,255,.55);background:rgba(143,216,255,.1)}
#panel .bd{padding:18px 24px 40px;overflow-y:auto;flex:1}
#panel .bd::-webkit-scrollbar{width:5px}
#panel .bd::-webkit-scrollbar-thumb{background:rgba(140,180,255,.25);border-radius:3px}

#panel .formula{
  padding:20px 16px;border-radius:11px;margin-bottom:18px;
  background:rgba(143,216,255,.055);border:1px solid rgba(143,216,255,.15);
  overflow-x:auto;overflow-y:hidden;text-align:center;
}
#panel .formula .katex{color:#fff6e0;font-size:1.06em}

#panel .meta{display:flex;align-items:center;gap:10px;margin-bottom:16px;flex-wrap:wrap}
#panel .badge{
  font-size:10.5px;padding:3.5px 10px;border-radius:20px;letter-spacing:.1em;
  border:1px solid currentColor;
}
#panel .imp{font-size:10.5px;color:var(--dim);letter-spacing:.08em}
#panel .impbar{
  flex:1;min-width:70px;height:3px;border-radius:2px;
  background:rgba(140,180,255,.15);overflow:hidden;
}
#panel .impbar i{display:block;height:100%;border-radius:2px;
  background:linear-gradient(90deg,#8fd8ff,#fff6e0)}

/* 领域标签（猜想专有）：比徽章更轻，用细边框而不是实心，
   这样"状态徽章"仍然是视觉上最重的信息 */
#panel .tag{
  font-size:10px;padding:3px 9px;border-radius:20px;letter-spacing:.08em;
  border:1px solid currentColor;opacity:.9;
}

/* 状态横幅（猜想专有）：左边框 + 极淡底色，读起来像一条注释。
   ⚠ 底色用 8 位 hex 的 alpha 通道（#rrggbb14），不能直接拼 3 位 —— 
   均衡后的颜色是 #rrggbb 形式，拼 2 位 alpha 才合法。 */
#panel .status{
  font-size:12.5px;line-height:1.75;margin:0 0 16px;padding:10px 13px;
  border-left:3px solid var(--accent);border-radius:0 8px 8px 0;color:#c8d6ee;
}
#panel .status b{font-weight:600;margin-right:9px;letter-spacing:.06em}

/* 跨星团关联的角标：提示"这一跳要跨结构" */
#panel .rel .xbadge{
  font-size:9.5px;color:#b9a2ff;border:1px solid rgba(185,162,255,.4);
  padding:1.5px 6px;border-radius:10px;flex:none;letter-spacing:.05em;
}

#panel .summary{
  font-size:13.5px;line-height:1.85;color:#dfe9ff;margin:0 0 16px;
  padding-left:13px;border-left:2px solid var(--accent);
}
#panel .detail{font-size:13px;line-height:2.0;color:#b8c8e4;margin:0;text-align:justify}
/* 数据里的 **粗体**：提亮 + 加粗。颜色用正文色系里更亮的一档，
   不用 accent（橙色）—— 那太抢眼，满屏橙字会盖过公式本身的重要性。 */
#panel .em{font-weight:600;color:#e8f1ff}

#panel h4{
  font-size:11px;color:var(--dim);letter-spacing:.18em;font-weight:500;
  margin:28px 0 12px;padding-bottom:8px;border-bottom:1px solid var(--line);
}
#panel .rel{
  display:block;width:100%;text-align:left;padding:11px 13px;margin-bottom:7px;
  border-radius:9px;background:rgba(143,216,255,.045);
  border:1px solid rgba(143,216,255,.1);cursor:pointer;
  transition:.18s;font-family:inherit;color:inherit;
}
#panel .rel:hover{background:rgba(143,216,255,.13);border-color:rgba(143,216,255,.4);
  transform:translateX(-3px)}
#panel .rel .t{display:flex;align-items:center;gap:8px}
#panel .rel .dot{width:6px;height:6px;border-radius:50%;flex:none}
#panel .rel .nm{font-size:12.5px;flex:1}
#panel .rel .w{
  font-size:10px;color:var(--dim);font-variant-numeric:tabular-nums;
}
#panel .rel .why{font-size:11px;color:var(--dim);margin-top:5px;line-height:1.6}
#panel .rel .wbar{height:2px;border-radius:2px;background:rgba(140,180,255,.14);margin-top:7px}
#panel .rel .wbar i{display:block;height:100%;border-radius:2px;background:var(--accent)}

#panel .empty{font-size:12px;color:var(--dim);font-style:italic}
`

/**
 * @param {object} graph  buildGraph() 的产物
 * @param {object} cb     { onSelect(id), onClose(), onFocus(id) }
 */
export function createUI(graph, cb = {}) {
  const style = document.createElement('style')
  style.textContent = CSS
  document.head.appendChild(style)

  /* ─────────── 基础 DOM ─────────── */
  const vignette = el('div', { id: 'vignette' })
  const hud = el('div', { id: 'hud' })

  /* 标题 */
  hud.appendChild(el('div', { id: 'title' }, [
    el('h1', {}, [UI.title]),
    el('p', {}, [UI.subtitle]),
  ]))

  /* 底部提示 */
  const stats = graph.stats
  hud.appendChild(el('div', { id: 'hint' }, [
    `${UI.hint}　·　主星系 ${stats.galaxyCount} 条定理 / ` +
    `星团 ${stats.conjCount} 条猜想 / ${stats.linkCount} 条关联`,
  ]))

  /* ── 导出 SVG 按钮 ──
   *
   * 为什么默认导出**主星系 + 只给重要度前 10% 加标签**：
   * 464 个标签叠在一起是噪声不是信息（实测 523 个 <text>）。
   * 俯视图配少量标签才读得出旋臂与重要度梯度。
   *
   * 为什么不做成"导出当前 3D 视角"：静态图没有交互，
   * 而 3D 视图靠旋转/缩放/点选才能读懂；俯视平面图才是
   * 一张图能说清结构的那种投影（详见 exportView.js 文件头）。 */
  const exportBtn = el('button', {
    id: 'export',
    title: '把当前视图导出为俯视 SVG 平面图（可在浏览器/PPT/论文里直接用）',
  }, ['导出 SVG'])
  hud.appendChild(el('div', { id: 'exportwrap' }, [exportBtn]))

  exportBtn.addEventListener('click', () => {
    try {
      exportBtn.disabled = true
      exportBtn.textContent = '导出中…'
      const mode = settings.state.view
      const svg = exportView.exportSVG(graph, {
        width: 2400,
        // 跟着当前取景走：只看星团时就只导出星团
        include: mode === 'cluster'
          ? (n) => n.cluster
          : mode === 'galaxy' ? (n) => !n.cluster : undefined,
        showLinks: true,
        showLabels: true,
        // 标签只给重要的，避免叠成一团（理由见上）
        minLabelRank: 0.9,
        title: `${UI.title} · ${VIEW_LABEL[mode] || mode}`,
      })
      exportView.downloadSVG(svg, exportView.exportFilename({
        scope: mode,
        // 形态也进文件名：同一份数据四种形态导出四次时不会互相覆盖
        prefix: `formula-nebula-${settings.shape}`,
      }))
      exportBtn.textContent = '已导出'
      setTimeout(() => { exportBtn.textContent = '导出 SVG'; exportBtn.disabled = false }, 1400)
    } catch (err) {
      // 导出失败不该影响看星系：提示一下就恢复
      console.error('[导出] 失败', err)
      exportBtn.textContent = '导出失败'
      setTimeout(() => { exportBtn.textContent = '导出 SVG'; exportBtn.disabled = false }, 1800)
    }
  })

  /* 图例 */
  let legendFams = null
  let legendTypes = null
  if (UI.showLegend) {
    legendFams = el('div', { class: 'fams' })
    /* 关系类型图例。
     *
     * ⚠ 必须把**覆盖率**写在标题上。这个图例最容易造成的误读是
     *  "连线的颜色 = 关系类型" —— 而实际上只有一部分边能判定出类型，
     *  其余是纯陈述句（"整环理论"这种名词短语，没说出两个东西是什么关系），
     *  它们仍是原来的蓝色。不写明的话，用户会以为蓝色的线也是一种"类型"，
     *  于是整张图被理解成"全部边都有类型"，那就完全错了。
     *
     *  百分比**必须来自实测**（stats.typedRate），不能写死：
     *  早先这里硬编码过 "16.7%"，后来类型判定从正则升级为逐条人工判定，
     *  覆盖率变了，写死的数字就成了假话。
     *  宁可让这个数字显得难看，也不能让它误导人。 */
    legendTypes = el('div', { class: 'fams' })
    /* 数据截止日期。
     *
     * 为什么必须有：这是一份关于**活跃研究**的数据集 ——
     * 59 条猜想里有 34 条标着"未解决"，而它们随时可能被证明
     * （就在这份数据里，雅可比猜想的状态刚刚因为 2026 年 7 月的反例而改变）。
     * 不写"截至何时"，用户就无法判断一条"未解决"是今天的结论
     * 还是五年前的结论 —— 那这条信息就是不可信的。
     *
     * 取 2026-07 而不是今天的日期：数据本身不会自动更新，
     * 写今天等于**谎报新鲜度**。这个日期是"正文里最后一件有记载的事"的时间。 */
    const asOf = el('div', { class: 'asof' }, [
      el('span', { title: '数据中记载的最后一件新进展（2026 年 7 月雅可比猜想反例）' },
        [`数据截至 ${DATA_AS_OF}`]),
    ])
    hud.appendChild(el('div', { id: 'legend' }, [
      el('div', {}, [UI.legendTitle]),
      el('div', { class: 'grad' }),
      el('div', {}, [UI.legendCore]),
      el('div', {}, [UI.legendOuter]),
      legendFams,
      legendTypes,
      asOf,
    ]))
    refreshLegend()
    refreshTypeLegend()
  }

  /**
   * 关系类型图例：只列**真的出现过**的类型，各带条数。
   *
   * 为什么列条数而不只列颜色：条数本身就是信息 ——
   * "等价 20 条 / 蕴含 37 条"能让人知道这个知识库里
   * 哪种关系是主要的。而且条数为 0 的类型不显示，
   * 避免图例里挂着一个画面中根本不存在的颜色。
   */
  function refreshTypeLegend() {
    if (!legendTypes) return
    const stats = graph.linkTypes?.stats
    legendTypes.replaceChildren()
    if (!stats) return

    /* 标题里的比例 = **判出了具体关系**的比例（不含 related）。
     *
     * 为什么不是 100%：1620 条边全部逐条读过、也全部写上了类型，
     * 但其中 698 条（43.1%）的理由本身只是纯名词短语
     * （"整环理论"、"谱序列"），**没有陈述**两个公式之间是什么关系。
     * 把它们算成"已判定"会让这个数字好看，但那是假的 ——
     * 真正的信息量是那 56.9% 说出了关系的边。
     * 剩下的部分在阅读时会自然落到 related 那一行（暗灰蓝）。 */
    const typed = (100 * (stats.typedRate || 0)).toFixed(1)
    legendTypes.appendChild(el('div', { class: 'fam grp' }, [
      `关联类型 · 已判定 ${typed}%`,
    ]))

    // 强类型在前，related 在最后（它是"没判定出来"，不是一种类型）
    for (const d of allTypeDefs()) {
      const n = stats.byType[d.id] || 0
      if (!n) continue
      const isRelated = d.id === 'related'
      legendTypes.appendChild(el('div', { class: 'fam' }, [
        el('span', {
          class: 'dot',
          style: `background:${d.color}; box-shadow:0 0 5px ${d.color}`,
        }),
        el('span', {
          style: isRelated ? 'opacity:.6' : '',
          title: isRelated ? '理由只写了主题（纯名词短语），没有陈述两者的关系 —— 这不是判定失败，是那些理由确实没写出关系' : '',
        }, [
          isRelated ? `${d.zh}（未判定）· ${n}` : `${d.zh} · ${n}`,
        ]),
      ]))
    }
  }

  /**
   * 重建图例里的族色列表。
   *
   * 两个必须刷新的时机：
   *  ① 着色模式切换（mono 时族色不再出现在画面里，样本要淡掉）
   *  ② 首次渲染（色点必须用**均衡后**的颜色，否则图例上的紫
   *     和画面里的紫不是同一个，看起来像坏了）
   */
  function refreshLegend() {
    if (!legendFams) return
    const mode = settings.state.colorMode
    const mono = mode === 'mono'
    legendFams.style.opacity = mono ? '.28' : '1'
    legendFams.replaceChildren()

    /* 图例内容跟着着色模式走。
     *
     * 为什么不能固定显示族色：切到「按猜想状态」后画面上的星团是
     * 绿/橙/黄，而图例还在一本正经地列 8 个族色 —— 那就成了错的信息，
     * 比没有图例更糟。图例的职责是"解释画面上的颜色"，所以它必须
     * 和画面用同一套口径。 */
    let rows
    if (mode === 'status' || mode === 'field') {
      // 星团按状态/领域着色时，主星系仍是族色 —— 两套都列出来
      const defs = mode === 'field' ? FIELD_UI : STATUS_UI
      const counts = new Map()
      for (const n of graph.nodes) {
        if (!n.cluster) continue
        const k = mode === 'field' ? n.field : n.status
        counts.set(k, (counts.get(k) || 0) + 1)
      }
      rows = [...counts.entries()]
        .sort((a, b) => b[1] - a[1])
        .map(([key, cnt]) => el('div', { class: 'fam' }, [
          el('span', {
            class: 'dot',
            style: `background:${defs[key]?.ui}; box-shadow:0 0 5px ${defs[key]?.ui}`,
          }),
          el('span', {}, [`${defs[key]?.name || key} · ${cnt}`]),
        ]))
      legendFams.appendChild(el('div', { class: 'fam grp' }, ['猜想星团']))
      for (const r of rows) legendFams.appendChild(r)
      // 主星系在这一模式下仍按族着色，补一行说明避免误读
      const gc = graph.stats.galaxyCount
      if (gc) {
        legendFams.appendChild(el('div', { class: 'fam grp' }, [`主星系 · ${gc}（按族色）`]))
      }
      return
    }

    const famCount = new Map()
    for (const n of graph.nodes) {
      // 星团节点的 family 是 'conjecture'，不在 FAMILIES 里。
      // 必须在统计时就排除，否则下面 FAMILIES[key].name 会抛异常。
      if (n.cluster) continue
      famCount.set(n.family, (famCount.get(n.family) || 0) + 1)
    }
    rows = [...famCount.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([key, cnt]) => el('div', { class: 'fam' }, [
        el('span', {
          class: 'dot',
          style: `background:${familyUiColor(key)}; box-shadow:0 0 5px ${familyUiColor(key)}`,
        }),
        el('span', {}, [`${FAMILIES[key]?.name || key} · ${cnt}`]),
      ]))
    for (const r of rows) legendFams.appendChild(r)

    // 星团摘要：让用户知道另外那一团是什么
    const cc = graph.stats.conjCount
    if (cc) {
      legendFams.appendChild(el('div', { class: 'fam grp' }, [
        `猜想星团 · ${cc}（按状态）`,
      ]))
    }
  }

  /* 悬停气泡 */
  const tip = el('div', { id: 'tip' })
  hud.appendChild(tip)

  /* 搜索 */
  const input = el('input', {
    type: 'text',
    /* 提示词要**教**用户能查什么，但也不能长到被输入框裁掉 ——
     * 230px 宽、12px 字号下大约只放得下 19 个汉字/等宽字符。
     * 原来那句 `搜索公式，或 status:open / importance:>0.9 / A -> B`
     * 有 40+ 字符，实测尾部被切掉（而且当时还被设置按钮压住，
     * 见 settingsPanel.js 里 #st-open 的注释）。
     * 现在只留最短的一句，完整语法放进 title 与下面那行图例。 */
    placeholder: '搜索公式 或 status:open',
    spellcheck: 'false',
    title:
      '支持四类：\n' +
      '· 普通词：霍奇、cohomology\n' +
      '· 字段查询：family:/status:/field:/id:/name:/en:/latex:/importance:/degree:/rank:/cluster:\n' +
      '  可用 - 取反、OR 组合、括号分组，值含空格用引号\n' +
      '· 数值比较：importance:>0.9\n' +
      '· 寻路：霍奇猜想 -> 黎曼猜想',
  })
  const results = el('div', { id: 'results' })
  hud.appendChild(el('div', { id: 'search' }, [input, results]))

  /* 详情面板 */
  const panelTitle = el('div', { class: 'nm' })
  const panelEn = el('div', { class: 'en' })
  const panelBody = el('div', { class: 'bd' })
  const closeBtn = el('button', { class: 'close', title: '关闭 (Esc)' }, ['×'])
  const panel = el('div', { id: 'panel' }, [
    el('div', { class: 'hd' }, [panelTitle, panelEn, closeBtn]),
    panelBody,
  ])

  document.body.append(vignette, hud, panel)

  /* 加载遮罩 */
  const loadBar = el('i')
  const loadLbl = el('div', { class: 'lbl' }, ['正在排版公式…'])
  const load = el('div', { id: 'load' }, [
    el('div', { class: 'glyph' }, ['公式诗云']),
    el('div', { class: 'bar' }, [loadBar]),
    loadLbl,
  ])
  document.body.appendChild(load)

  /* ─────────── 空闲自动隐藏 ─────────── */
  let idleTimer = null
  function poke() {
    document.body.classList.remove('idle')
    clearTimeout(idleTimer)
    idleTimer = setTimeout(() => {
      if (!panel.classList.contains('on') && !results.classList.contains('on')) {
        document.body.classList.add('idle')
      }
    }, 9000)
  }
  for (const ev of ['pointermove', 'pointerdown', 'keydown', 'wheel']) {
    window.addEventListener(ev, poke, { passive: true })
  }
  poke()

  /* ─────────── 悬停提示 ─────────── */
  function showTip(node, x, y) {
    tip.innerHTML = ''
    // 星团节点没有族名，改显示状态 —— 悬停时最想知道的就是"这条定了没"
    const sub = node.cluster
      ? `${nodeBadge(node)} · ${FIELD_UI[node.field]?.name || ''} · 关联 ${node.degree}`
      : `${FAMILIES[node.family]?.name || ''} · 关联 ${node.degree} · 重要度 ${(node.importance * 100).toFixed(0)}%`
    tip.append(
      el('b', {}, [node.name]),
      el('s', {}, [sub]),
    )
    tip.classList.add('on')
    moveTip(x, y)
  }
  function moveTip(x, y) {
    const pad = 16
    const w = tip.offsetWidth || 150
    const h = tip.offsetHeight || 44
    let tx = x + pad
    let ty = y - h - pad
    if (tx + w > window.innerWidth - 8) tx = x - w - pad
    if (ty < 8) ty = y + pad
    tip.style.left = tx + 'px'
    tip.style.top = ty + 'px'
  }
  function hideTip() { tip.classList.remove('on') }

  /* 连线的悬停提示：鼠标停在一根弧线上时，显示"为什么这两个公式相连"。
   *
   * 数据里 1620 条边**每条都有一句人写的理由**，但三维视图里它原本
   * 完全不可见 —— 用户只能看到一根彩色弧线，看不到它是什么意思。
   * 而"这两个东西为什么有关系"正是这个项目最核心的内容。
   * 面板里虽然也列了理由，但那是点开节点之后的事；
   * "盯着某根线想知道它是什么"是不需要先点开任何东西的自然动作。
   *
   * 布局刻意与节点提示不同：节点提示是一行标题 + 一行副标题，
   * 边提示是一句**完整的话**（理由常常 20–40 字），所以宽度放宽、
   * 允许换行。两端公式名用箭头连起来放在最上面，
   * 这样即使理由写得抽象，也知道说的是哪两个东西之间的事。 */
  function showEdgeTip(edge, x, y) {
    tip.innerHTML = ''
    const from = graph.byId?.get(edge.source)
    const to = graph.byId?.get(edge.target)
    tip.append(
      el('b', {}, [`${from?.name || edge.source} → ${to?.name || edge.target}`]),
      el('s', {}, [typeUiLabel(edge.type)]),
      el('i', { class: 'why' }, [edge.label || '（这条关联没有写明理由）']),
    )
    tip.classList.add('on', 'edge')
    moveTip(x, y)
  }

  /* ─────────── 搜索 / 查询 / 寻路 ───────────
   *
   * 三层能力，共用一个输入框：
   *   ① 普通词  → 名称/英文/id/LaTeX 子串匹配（老行为，完全保留）
   *   ② 字段查询 → family: / status: / importance:>0.9 / -status:proved / OR 组合
   *   ③ 寻路     → "A -> B" 找两个知识点之间的关联链
   *
   * 为什么值得把 ① 升级成真正的解析器：464 个节点的平面列表，
   * 光靠子串匹配没法回答"哪些还没解决"「哪些是核心」这类问题 ——
   * 而这恰恰是这个知识库最该被问的问题。
   *
   * ⚠ 输入是**每次按键**都会解析的，所以 parseQuery 必须永不抛异常
   *   （见 graphQuery.js），这里出错也只把错误显示出来，不中断输入。
   */

  /** 解析 "A -> B" / "A→B" 形式的寻路输入 */
  function splitPathQuery(s) {
    const m = /^(.+?)\s*(?:->|→|=>|—>)\s*(.+)$/.exec(s.trim())
    if (!m) return null
    return [m[1].trim(), m[2].trim()]
  }

  /** 在一堆候选里找到唯一一个匹配的节点（用于寻路两端） */
  function pickNode(text) {
    if (!text) return null
    // 先当成精确 id
    const byId = graph.byId.get(text)
    if (byId) return byId
    // 再按查询语言找；只要恰好命中一个就用它
    const q = parseQuery(text)
    const hits = graph.nodes.filter((n) => q.test(n))
    if (hits.length === 1) return hits[0]
    // 命中多个时，优先名字完全相同的那个
    const exact = hits.find((n) => n.name === text)
    return exact || hits[0] || null
  }

  function renderPath(fromText, toText) {
    const a = pickNode(fromText)
    const b = pickNode(toText)
    results.innerHTML = ''

    const head = (txt, color) => el('div', { class: 'row', style: 'cursor:default' }, [
      el('span', { class: 'nm', style: `color:${color}` }, [txt]),
    ])

    if (!a || !b) {
      results.appendChild(head(
        !a ? `找不到起点：${fromText}` : `找不到终点：${toText}`,
        '#ff9d7a',
      ))
      results.classList.add('on')
      return
    }

    const r = findPath(graph, a.id, b.id, { weighted: true })
    if (!r.found) {
      results.appendChild(head(`${a.name} 与 ${b.name} 之间没有路径`, '#ff9d7a'))
      results.classList.add('on')
      return
    }

    results.appendChild(el('div', { class: 'row', style: 'cursor:default' }, [
      el('span', { class: 'nm', style: 'color:#9fc4ff' }, [
        `${a.name} → ${b.name}　${r.hops} 跳`,
      ]),
      el('span', { style: 'font-size:10px;color:#8fa4c4' }, [
        r.cost !== undefined ? `强度代价 ${r.cost.toFixed(2)}` : '',
      ]),
    ]))

    /* 路径按顺序列出。**必须按顺序**，因为这条路本身就是答案 ——
     * 打散了就只剩一堆相关节点，读不出"A 怎么推到 B"。 */
    r.path.forEach((id, i) => {
      const n = graph.byId.get(id)
      if (!n) return
      const link = i > 0 ? r.links[i - 1] : null
      const row = el('div', { class: 'row' }, [
        el('span', { class: 'dot', style: `background:${nodeUiColor(n)}` }),
        el('span', { class: 'nm' }, [`${i + 1}. ${n.name}`]),
        link ? el('span', {
          class: 'tag',
          style: `color:${typeUiColor(link.type)}`,
        }, [typeUiLabel(link.type)]) : null,
        el('span', { style: 'font-size:10px;color:#8fa4c4' }, [n.en || '']),
      ])
      row.addEventListener('click', () => {
        results.classList.remove('on')
        cb.onFocus?.(id)
      })
      results.appendChild(row)

      // 把这一步的理由写在下一行 —— 这是整条路径里信息量最大的部分
      if (link && link.label) {
        results.appendChild(el('div', {
          class: 'row',
          style: 'cursor:default;padding-left:26px;opacity:0.75',
        }, [
          el('span', { style: 'font-size:10px;color:#8fa4c4' }, [
            `↳ ${link.label}`,
          ]),
        ]))
      }
    })

    results.classList.add('on')
  }

  function runSearch(q) {
    const rawText = q.trim()
    if (!rawText) {
      results.classList.remove('on')
      results.innerHTML = ''
      return
    }

    // 寻路优先：'->' 不是合法的查询语法，先截住它
    const pathQ = splitPathQuery(rawText)
    if (pathQ) {
      renderPath(pathQ[0], pathQ[1])
      return
    }

    const parsed = parseQuery(rawText)
    if (parsed.error) {
      // 语法错误：**不**清空旧结果，也不抛异常，只把错误提示出来。
      // 打字过程中必然频繁经过非法中间态（比如刚敲完 `importance:`），
      // 每次闪一下"未找到"会让人以为搜索坏了。
      results.innerHTML = ''
      results.appendChild(el('div', { class: 'row', style: 'cursor:default' }, [
        el('span', { class: 'nm', style: 'color:#ff9d7a;font-size:11px' }, [parsed.error]),
      ]))
      results.classList.add('on')
      return
    }

    const hits = graph.nodes.filter((n) => parsed.test(n))

    results.innerHTML = ''
    if (!hits.length) {
      results.appendChild(el('div', { class: 'row', style: 'cursor:default' }, [
        el('span', { class: 'nm', style: 'color:#8fa4c4' }, [`未找到　${parsed.describe?.() || ''}`]),
      ]))
    } else {
      // 命中很多时给一行统计：光看前 42 条会让人以为"就这些"
      if (hits.length > 42) {
        results.appendChild(el('div', { class: 'row', style: 'cursor:default' }, [
          el('span', { style: 'font-size:10px;color:#8fa4c4' }, [
            `命中 ${hits.length} / ${graph.nodes.length}　（显示前 42 条，可加条件缩小）`,
          ]),
        ]))
      }
      for (const n of hits.slice(0, 42)) {
        const row = el('div', { class: 'row' }, [
          el('span', { class: 'dot', style: `background:${nodeUiColor(n)}` }),
          el('span', { class: 'nm' }, [n.name]),
          // 星团节点标出状态：搜索结果里混着定理与猜想时，
          // "这条还悬着"是比英文名重要得多的信息
          n.cluster
            ? el('span', { class: 'tag', style: `color:${nodeUiColor(n)}` }, [nodeBadge(n)])
            : null,
          el('span', { style: 'font-size:10px;color:#8fa4c4' }, [n.en || '']),
        ])
        row.addEventListener('click', () => {
          results.classList.remove('on')
          input.value = ''
          cb.onFocus?.(n.id)
        })
        results.appendChild(row)
      }
    }
    results.classList.add('on')
  }

  input.addEventListener('input', () => runSearch(input.value))
  input.addEventListener('focus', () => { if (input.value) runSearch(input.value) })
  document.addEventListener('pointerdown', (e) => {
    if (!e.target.closest('#search')) results.classList.remove('on')
  })

  /* ─────────── 详情面板 ─────────── */
  let currentId = null
  const history = []

  function showDetail(node, pushHistory = true) {
    if (!node) return hideDetail()

    if (pushHistory && currentId && currentId !== node.id) history.push(currentId)
    currentId = node.id

    const fam = FAMILIES[node.family]   // 星团节点为 undefined，下面只在非星团分支用
    panelTitle.textContent = node.name
    panelEn.textContent = node.en || ''

    panelBody.innerHTML = ''

    /* 公式 */
    const fbox = el('div', { class: 'formula' })
    try {
      fbox.innerHTML = katex.renderToString(node.latex, {
        displayMode: true,
        throwOnError: false,
        trust: false,
        strict: false,
      })
    } catch {
      fbox.textContent = node.latex
    }
    panelBody.appendChild(fbox)

    /* 徽章 + 重要度 */
    const meta = el('div', { class: 'meta' }, [
      el('span', {
        class: 'badge',
        style: `color:${nodeUiColor(node)}`,
      }, [nodeBadge(node)]),
    ])
    /* 猜想额外两行元信息：
     *   · 领域 —— 它属于哪一支数学（球面上的方向就是按这个分的）
     *   · 提出者与年份 —— 猜想的"作者"信息比定理重要得多，
     *     因为一条猜想的名字往往就是提出者的名字（庞加莱、希尔伯特…），
     *     不写出来会让人以为名字只表示主题。
     * 已证明的还额外标出年份，因为"何时被解决"是这条猜想最关键的历史事实。 */
    if (node.cluster) {
      const f = FIELD_UI[node.field]
      if (f) {
        meta.appendChild(el('span', {
          class: 'tag',
          style: `color:${f.ui}; border-color:${f.ui}44`,
        }, [f.name]))
      }
      if (node.proposer || node.year) {
        meta.appendChild(el('span', { class: 'imp' }, [
          [node.proposer, node.year].filter(Boolean).join(' · '),
        ]))
      }
      /* 最新进展年份 —— 与"提出年"分开显示，两者是完全不同的信息。
       *
       * 为什么必须有：`year` 是**提出年份**（"W. V. D. 霍奇 · 1950"），
       * 它永远不会变；而一条猜想"现在进展到哪一年"决定了这条记录
       * 是否还值得信任 —— 用户之前专门要求过状态必须反映时效。
       *
       * 数据来源见 data/progress.js：每个年份都能在该条 detail 正文里
       * 找到出处，正文没写年份的**留空不显示**（宁可少显示，不编年份）。
       * 显示成 `进展至 2013` 而不是 `2013`，是为了让它不会被误读成提出年。 */
      const progYear = progressOf(node.id)
      if (progYear) {
        meta.appendChild(el('span', {
          class: 'imp',
          style: 'color:#9fd0ff',
          title: `正文中记载的最新进展年份：${progYear}`,
        }, [`进展至 ${progYear}`]))
      }
    }
    meta.appendChild(el('span', { class: 'imp' }, [
      `重要度 ${(node.importance * 100).toFixed(0)}%`,
    ]))
    meta.appendChild(el('span', { class: 'impbar' }, [
      el('i', { style: `width:${Math.round(node.importance * 100)}%` }),
    ]))
    panelBody.appendChild(meta)

    /* 状态横幅：猜想专有。
     *
     * 为什么值得单独占一条：状态是猜想**唯一**区别于定理的本质属性，
     * 而它在公式本身上完全看不出来。色点在小尺寸下只能给个印象，
     * 到了面板里就该给出明确的文字结论（"至今未解决" / "已由 X 证明"）。
     * 用左边框 + 淡背景，读起来像一条注释而不是又一个标签。 */
    if (node.cluster) {
      const st = STATUS_UI[node.status]
      if (st) {
        panelBody.appendChild(el('div', {
          class: 'status',
          style: `border-left-color:${st.ui}; background:${st.ui}14`,
        }, [
          el('b', { style: `color:${st.ui}` }, [st.name]),
          el('span', {}, [st.hint || '']),
        ]))
      }
    }

    /* 概括与详解：过一遍 inlineMd，把数据里的 **粗体** 渲染出来 */
    if (node.summary) panelBody.appendChild(el('p', { class: 'summary' }, inlineMd(node.summary)))
    if (node.detail) panelBody.appendChild(el('p', { class: 'detail' }, inlineMd(node.detail)))

    /* 关联知识 */
    const rels = [...node.linkIds].sort((a, b) => b.weight - a.weight)
    /* 关系类型的小结：这一条公式的关联里，各类型各有几条。
     * 有它才能一眼看出"这个定理主要是被'依赖'关系引用的"，
     * 而不是只能一条条读理由。只列出真正出现过的类型。 */
    const typeCount = {}
    for (const l of rels) typeCount[l.type] = (typeCount[l.type] || 0) + 1
    const typeChips = Object.entries(typeCount)
      .sort((a, b) => b[1] - a[1])
      .map(([t, n]) => el('span', {
        class: 'tag',
        style: `color:${typeUiColor(t)};margin-right:6px`,
        title: `关系类型：${typeUiLabel(t)}`,
      }, [`${typeUiLabel(t)} ${n}`]))

    panelBody.appendChild(el('h4', {}, [`关联知识 · ${rels.length}`]))
    if (typeChips.length) {
      panelBody.appendChild(el('div', {
        style: 'margin:-4px 0 8px;display:flex;flex-wrap:wrap;gap:2px',
      }, typeChips))
    }

    if (!rels.length) {
      panelBody.appendChild(el('div', { class: 'empty' }, ['这个公式暂时没有登记关联。']))
    } else {
      for (const l of rels) {
        const otherId = l.source === node.id ? l.target : l.source
        const other = graph.byId.get(otherId)
        if (!other) continue

        const oFam = FAMILIES[other.family]
        const btn = el('button', { class: 'rel' }, [
          el('div', { class: 't' }, [
            el('span', { class: 'dot', style: `background:${nodeUiColor(other)}` }),
            el('span', { class: 'nm' }, [other.name]),
            // 跨星团的关联要标出来。它表示的语义完全不同
            // （"这条猜想依赖那个定理"而不是"同层知识相邻"），
            // 在列表里混着看不区分，用户会以为猜想和定理是同类对象。
            other.cluster !== node.cluster
              ? el('span', { class: 'xbadge' }, [node.cluster ? '↤ 定理' : '↦ 猜想'])
              : null,
            /* 关系类型徽章 —— 这条边是"蕴含"还是"同族"。
             * 颜色与画面上那条线一致，所以面板和 3D 视图能对上号：
             * 在面板里看到玫红的"蕴含"，回到星系里就能认出玫红的线。
             * related（16.7% 之外那 83.3%）不显示徽章 ——
             * 显示一个"相关"只会增加噪声，那正是没有类型的意思。 */
            l.type && l.type !== 'related'
              ? el('span', {
                class: 'tag',
                style: `color:${typeUiColor(l.type)}`,
                title: `关系类型：${typeUiLabel(l.type)}`,
              }, [typeUiLabel(l.type)])
              : null,
            el('span', { class: 'w' }, [`${(l.weight * 100).toFixed(0)}%`]),
          ]),
          l.label ? el('div', { class: 'why' }, [l.label]) : null,
          el('div', { class: 'wbar' }, [
            el('i', {
              style: `width:${Math.round(l.weight * 100)}%;${
                l.hero ? 'background:#9fc4ff' : ''}`,
            }),
          ]),
        ])
        btn.addEventListener('click', () => cb.onFocus?.(otherId))
        panelBody.appendChild(btn)
      }
    }

    panel.classList.add('on')
    panelBody.scrollTop = 0
    document.body.classList.remove('idle')
    poke()
  }

  function hideDetail() {
    panel.classList.remove('on')
    currentId = null
    history.length = 0
    cb.onClose?.()
  }

  closeBtn.addEventListener('click', hideDetail)
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (results.classList.contains('on')) results.classList.remove('on')
      else if (panel.classList.contains('on')) hideDetail()
    }
  })

  return {
    showDetail,
    hideDetail,
    showTip,
    moveTip,
    hideTip,
    /** 连线悬停提示（显示这条关联的理由） */
    showEdgeTip,
    get currentId() { return currentId },
    /** 重建图例（着色模式切换后颜色要跟着换） */
    refreshLegend,
    /** 重建关系类型图例（关联类型开关切换后） */
    refreshTypeLegend,
    setProgress(done, total, label) {
      loadBar.style.width = `${(done / Math.max(1, total)) * 100}%`
      loadLbl.textContent = `${done} / ${total}　${label || ''}`
    },
    finishLoading() {
      load.classList.add('done')
      setTimeout(() => load.remove(), 900)
    },
    setResolution() {},   // 保留接口
  }
}

/* ─────────── 极简 DOM 构造器 ─────────── */
function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag)
  for (const [k, v] of Object.entries(attrs)) {
    if (v === null || v === undefined) continue
    if (k === 'class') node.className = v
    else node.setAttribute(k, v)
  }
  for (const c of children) {
    if (c === null || c === undefined) continue
    node.append(c instanceof Node ? c : document.createTextNode(String(c)))
  }
  return node
}

/**
 * 把数据里写的 `**粗体**` 变成真的 <b>。
 *
 * 为什么需要：知识库的 `detail` / `summary` 里**混着 markdown 粗体** ——
 * 实测 186 行、438 处（`**整体**`、`**已经定论**`、`**语义冲突**`…），
 * 这些星号原本是写给 markdown 渲染器的，但面板用的是 `textContent`，
 * 于是它们**原样显示在屏幕上**（`**整体**版本`）。
 * 这是从 v1 就有的（v1 有 141 处），不是这一轮引入的；
 * 发现它靠的是**看图**——断言查不出"星号不该出现在正文里"。
 *
 * 为什么用 DOM 拼节点而不是 `innerHTML`：
 * 这些文本里有 `<` `>` `&` 和公式源码，走 innerHTML 就等于把
 * 知识库当可信 HTML 执行。这里逐个建 `<b>` 文本节点，
 * **任何标签都只会被当字面量**，不存在注入面。
 *
 * 只处理 `**`（不用单个 `*`）：数据里的单个星号是 JS 注释与数学符号，
 * 把单个 `*` 也当强调会误伤 `a*b`。
 * @param {string} text - 原始文本（可含 `**…**`）
 * @returns {Array<Node>} 可直接塞进 el() 的孩子列表
 */
function inlineMd(text) {
  const s = String(text)
  const out = []
  let i = 0
  for (;;) {
    const open = s.indexOf('**', i)
    if (open < 0) break
    const close = s.indexOf('**', open + 2)
    // 没有配对的闭合标记 → 剩下的当普通文本（宁可少加粗，不可吃掉内容）
    if (close < 0) break
    // 空内容 `****` 不是粗体，跳过这一对
    if (close === open + 2) { i = close + 2; continue }
    if (open > i) out.push(document.createTextNode(s.slice(i, open)))
    out.push(el('b', { class: 'em' }, [s.slice(open + 2, close)]))
    i = close + 2
  }
  if (i < s.length) out.push(document.createTextNode(s.slice(i)))
  return out
}
