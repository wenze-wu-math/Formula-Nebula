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
import { FAMILIES } from '../../../src/data/knowledge.js'
import { CONJECTURE_STATUS, CONJECTURE_FIELDS } from '../../../src/data/conjectures.js'
import { RESEARCHER_AREAS, FRONTIER_LINKS } from '../../../src/data/researchers.js'
import { progressOf, DATA_AS_OF } from '../../../src/data/progress.js'
import { UI, GLYPH } from './config.js'
import { settings } from './settings.js'
import { buildEqualizedPalette } from '../../../src/palette.js'
import { parseQuery, findPath, QUERY_KEYS } from '../../../src/graphQuery.js'
import { allTypeDefs } from '../../../src/linkTypes.js'
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
const RESEARCHER_UI = equalizeColors(RESEARCHER_AREAS)

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
  if (n.researcher) return RESEARCHER_UI[n.field]?.ui || '#7be8c8'
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

/** 节点的标签（徽章文字）：研究者显示"研究者"，星团显示状态名，主星系显示族名 */
function nodeBadge(n) {
  if (n.researcher) return '研究者'
  if (!n.cluster) return FAMILIES[n.family]?.name || n.family
  return STATUS_UI[n.status]?.name || n.status
}

const CSS = `
:root{
  --bg:#080b14;
  --panel:rgba(12,17,29,.86);
  --panel-strong:rgba(12,17,29,.94);
  --line:rgba(148,178,220,.20);
  --line-soft:rgba(148,178,220,.12);
  --line-strong:rgba(148,178,220,.34);
  --ink:#f5f8ff;
  --dim:#94a8c4;
  --mute:#c5d2e6;
  --gold:#ffcf7a;
  --cyan:#78d7ff;
  --coral:#ff9b7f;
  --violet:#c9aeff;
  /* 标题与加载页共用的星座标记：纯 CSS 背景，不新增 DOM，
     也不会拦截画布拖拽。 */
  --constellation:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 48'%3E%3Cg fill='none' stroke='%2394b2dc' stroke-opacity='.45' stroke-width='.8'%3E%3Cpath d='M10 30 26 12 40 20 54 9'/%3E%3Cpath d='M26 12 34 34 54 9'/%3E%3C/g%3E%3Cg fill='%23ffcf7a'%3E%3Ccircle cx='10' cy='30' r='1.6'/%3E%3Ccircle cx='40' cy='20' r='1.2'/%3E%3C/g%3E%3Cg fill='%2378d7ff'%3E%3Ccircle cx='26' cy='12' r='1.9'/%3E%3Ccircle cx='54' cy='9' r='1.3'/%3E%3C/g%3E%3Ccircle cx='34' cy='34' r='1.1' fill='%23c9aeff'/%3E%3C/svg%3E");
}
*{box-sizing:border-box}
html,body{margin:0;height:100%;overflow:hidden;overflow:clip;background:var(--bg)}
body{
  font-family:"Inter","PingFang SC","Microsoft YaHei",system-ui,sans-serif;
  color:var(--ink);-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility;
}
#scene{position:fixed;inset:0;display:block;width:100%;height:100%}

/* 上下黑边 + 暗角：只压边缘，不抢画面中心的公式 */
#vignette{
  position:fixed;inset:0;pointer-events:none;z-index:5;
  background:
    radial-gradient(ellipse at 50% 46%, transparent 44%, rgba(3,5,11,.60) 100%),
    linear-gradient(to bottom, rgba(4,6,12,.70) 0, transparent 10vh),
    linear-gradient(to top,    rgba(4,6,12,.76) 0, transparent 12vh);
}

#hud{position:fixed;inset:0;z-index:10;pointer-events:none}
/* 只有真正需要交互的元素才接收鼠标事件。
   纯装饰性文字必须保持 pointer-events:none，
   否则从标题/图例上按下拖动时事件会被这些 div 吃掉，画面就转不动了。 */
#search,#results,#panel{pointer-events:auto}

/* ── 标题 ──
 * 左侧留出星座标记的位置；标记用 ::before 的 SVG 背景实现，
 * 不新增 DOM，也不会拦截拖拽。 */
#title{
  position:absolute;top:26px;left:30px;padding-left:78px;min-height:56px;
  transition:opacity .7s ease;pointer-events:none;
}
#title::before{
  content:"";position:absolute;left:0;top:2px;width:62px;height:48px;
  background-image:var(--constellation);background-repeat:no-repeat;
  background-position:center;background-size:contain;opacity:.9;
}
#title::after{
  content:"";position:absolute;left:68px;top:6px;bottom:6px;width:1px;
  background:linear-gradient(to bottom,transparent,rgba(148,178,220,.28),transparent);
}
#title h1{
  margin:0;font-size:26px;font-weight:600;letter-spacing:.22em;
  background:linear-gradient(96deg,#fff7e8 0%,#ffcf7a 44%,#78d7ff 100%);
  -webkit-background-clip:text;background-clip:text;color:transparent;
}
#title p{
  margin:7px 0 0;font-size:11px;color:var(--dim);letter-spacing:.15em;
  line-height:1.5;max-width:430px;
}

/* ── 底部提示 ──
 * 不再用 left:50% + translateX：那样在窄屏会直接压到右下角图例上。
 * 改成左右留出固定安全带（左边给导出按钮，右边给图例），
 * 中间的文字可以自然换行。 */
#hint{
  position:absolute;bottom:26px;left:170px;right:336px;
  font-size:11px;color:var(--dim);letter-spacing:.1em;text-align:center;
  line-height:1.65;transition:opacity .7s ease;
}
#hint .hint-main{color:var(--dim)}
#hint .hint-sep{color:rgba(148,178,220,.42)}
#hint .hint-stats{color:#7f93b2;font-variant-numeric:tabular-nums}
body.idle #title,body.idle #hint,body.idle #legend,body.idle #exportwrap{opacity:.08}

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
  appearance:none;cursor:pointer;height:32px;min-width:96px;padding:0 14px;
  background:var(--panel);color:var(--mute);
  border:1px solid var(--line);border-radius:8px;
  font:inherit;font-size:11px;letter-spacing:.12em;
  backdrop-filter:blur(12px);
  transition:color .18s ease,border-color .18s ease,background .18s ease;
}
#export:hover:not(:disabled){
  color:var(--ink);border-color:rgba(255,207,122,.42);
  background:rgba(20,27,44,.9);
}
#export:focus-visible{outline:2px solid rgba(120,215,255,.45);outline-offset:2px}
#export:disabled{opacity:.55;cursor:default}

/* ── 图例 ──
 * 从"右下角一串右对齐的小字"改成一张轻卡片：细边、半透明底、两列族色。
 * 两列是这里最有效的减密手段 —— 8 个族 + 12 个关联类型如果单列排，
 * 会占掉半屏高度。 */
#legend{
  position:absolute;right:26px;bottom:26px;width:300px;padding:12px 14px;
  background:var(--panel);border:1px solid var(--line);border-radius:8px;
  backdrop-filter:blur(14px);color:var(--dim);font-size:10.5px;
  letter-spacing:.08em;text-align:left;transition:opacity .7s ease;
  box-shadow:0 10px 30px rgba(0,0,0,.28);
}
#legend .lg-head{
  display:flex;align-items:center;gap:10px;
  font-size:10px;letter-spacing:.18em;color:var(--mute);
}
#legend .lg-head::after{content:"";flex:1;height:1px;background:var(--line-soft)}
#legend .grad{
  width:100%;height:4px;border-radius:2px;margin:9px 0 7px;
  /* 所有公式同色相，重要度只由亮度表达：
     左（外缘）= 暗橙黄 → 右（核心）= 亮橙黄 */
  background:linear-gradient(90deg,#3a2a12,#8a5a1e,#ffcf7a,#ffe7bd);
  box-shadow:inset 0 0 0 1px rgba(255,255,255,.04);
}
#legend .lg-cap{font-size:9.5px;color:var(--dim);letter-spacing:.08em;line-height:1.5}
#legend .lg-cap + .lg-cap{margin-top:2px}
#legend .fams{
  margin-top:10px;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);
  gap:4px 14px;align-items:center;
}
#legend .fam{
  display:flex;align-items:center;gap:6px;min-width:0;
  font-size:10px;line-height:1.5;color:var(--mute);
}
#legend .fam > span:last-child{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
#legend .dot{width:6px;height:6px;border-radius:50%;flex:none}
/* 分组小标题：图例里同时列星团与主星系时用它分隔 */
#legend .fam.grp{
  grid-column:1/-1;color:#7f93b2;font-size:9px;letter-spacing:.16em;
  margin-top:8px;padding-top:7px;border-top:1px solid var(--line-soft);
}
#legend .fam.grp:first-child{margin-top:0;padding-top:0;border-top:none}
/* 数据截止日期。
 * 刻意做得比其它行更暗、更小：它不是用来"看"的，是用来"查"的 ——
 * 只在用户想确认这份数据有多新时才需要读到它。
 * 但不能省略：不写清楚截至何时，标着"未解决"的猜想就不可信。 */
#legend .asof{
  margin-top:10px;padding-top:8px;border-top:1px solid var(--line-soft);
  color:#7185a5;font-size:9px;letter-spacing:.08em;line-height:1.5;
}
/* 搜索结果里的状态角标 */
#results .row .tag{
  font-size:9.5px;opacity:.85;border:1px solid currentColor;
  padding:1px 6px;border-radius:9px;flex:none;
}

/* ── 悬停气泡 ── */
#tip{
  position:absolute;padding:8px 12px;border-radius:8px;
  background:rgba(12,17,29,.92);border:1px solid var(--line);
  color:var(--mute);font-size:12px;letter-spacing:.04em;pointer-events:none;
  opacity:0;transition:opacity .16s ease;white-space:nowrap;
  backdrop-filter:blur(14px);z-index:30;box-shadow:0 12px 30px rgba(0,0,0,.4);
}
#tip.on{opacity:1}
#tip b{color:var(--gold);font-weight:600}
#tip s{display:block;text-decoration:none;color:var(--dim);font-size:10.5px;margin-top:3px}
/* 连线提示：理由常常 20–40 字，一行放不下。
 * 节点提示保持 nowrap（名字都很短），边提示改成定宽换行 ——
 * 这里必须是 #tip.edge 而不是 #tip，否则会把节点提示也撑成方块。 */
#tip.edge{max-width:300px;white-space:normal;line-height:1.55}
#tip.edge i.why{
  display:block;font-style:normal;margin-top:6px;
  color:var(--mute);font-size:11.5px;line-height:1.6;
}

/* ── 加载 ── */
#load{
  position:fixed;inset:0;z-index:60;display:flex;
  flex-direction:column;align-items:center;justify-content:center;
  background:var(--bg);transition:opacity .8s ease;gap:18px;
}
#load.done{opacity:0;pointer-events:none}
#load::before{
  content:"";width:72px;height:52px;background-image:var(--constellation);
  background-repeat:no-repeat;background-position:center;background-size:contain;
  opacity:.75;margin-bottom:-2px;
}
#load .glyph{
  font-size:42px;letter-spacing:.34em;text-indent:.34em;
  background:linear-gradient(92deg,#fff7e8,#ffcf7a 48%,#78d7ff);
  -webkit-background-clip:text;background-clip:text;color:transparent;
  animation:pulse 2.8s ease-in-out infinite;
}
@keyframes pulse{0%,100%{opacity:.55}50%{opacity:1}}
#load .bar{
  width:260px;height:2px;background:rgba(148,178,220,.14);
  border-radius:2px;overflow:hidden;
}
#load .bar i{
  display:block;height:100%;width:0;
  background:linear-gradient(90deg,var(--cyan),var(--gold));
  transition:width .18s ease;box-shadow:0 0 8px rgba(120,215,255,.35);
}
#load .lbl{
  font-size:10.5px;color:var(--dim);letter-spacing:.16em;height:14px;
  font-variant-numeric:tabular-nums;
}

/* ── 搜索 ──
 * 尺寸是硬契约：#search 250×36、top 28 / right 24，
 * 因为 settingsPanel.js 里的 #st-open 是相对它定位的。
 * 改这里必须同步改那边，否则设置按钮会压住输入框。 */
#search{position:absolute;top:28px;right:24px;width:250px}
#search input{
  width:100%;height:36px;padding:0 12px;border-radius:8px;
  background:var(--panel);border:1px solid var(--line);
  color:var(--ink);font-size:12.5px;outline:none;
  letter-spacing:.04em;backdrop-filter:blur(12px);
  font-family:inherit;
  transition:border-color .18s ease,box-shadow .18s ease,background .18s ease;
}
#search input:hover{border-color:var(--line-strong)}
#search input:focus{
  border-color:rgba(120,215,255,.55);
  box-shadow:0 0 0 3px rgba(120,215,255,.10);
  background:rgba(14,20,34,.92);
}
#search input::placeholder{color:#6f84a5}
#results{
  margin-top:8px;max-height:min(46vh,420px);overflow-y:auto;border-radius:8px;
  background:var(--panel);border:1px solid var(--line);
  backdrop-filter:blur(14px);display:none;
  box-shadow:0 18px 40px rgba(0,0,0,.42);
  scrollbar-gutter:stable;scrollbar-width:thin;
  scrollbar-color:rgba(148,178,220,.30) transparent;
}
#results.on{display:block}
#results::-webkit-scrollbar{width:8px}
#results::-webkit-scrollbar-track{background:transparent}
#results::-webkit-scrollbar-thumb{
  background:rgba(148,178,220,.26);border-radius:4px;
  border:2px solid transparent;background-clip:content-box;
}
#results .row{
  padding:9px 12px;font-size:12px;cursor:pointer;
  border-bottom:1px solid var(--line-soft);
  display:flex;align-items:center;gap:8px;line-height:1.45;
  transition:background .14s ease;
}
#results .row:last-child{border-bottom:none}
#results .row:hover{background:rgba(120,215,255,.075)}
#results .row:active{background:rgba(120,215,255,.11)}
/* 静态行（统计/错误/路径理由）不是命中项：不要给它们可点击的反馈 */
#results .row[style*="cursor:default"]{cursor:default}
#results .row[style*="cursor:default"]:hover{background:transparent}
#results .row[style*="cursor:default"] .nm{
  white-space:normal;overflow:visible;text-overflow:clip;line-height:1.5;
}
#results .row .dot{width:6px;height:6px;border-radius:50%;flex:none}
#results .row .nm{
  flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
  color:var(--mute);
}
#results .row:hover .nm{color:var(--ink)}
/* 英文名只做辅助：给固定上限并省略，避免长名字把中文名挤没 */
#results .row .en{
  flex:none;max-width:40%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
  font-size:10px;color:#8fa4c4;
}
/* 搜索结果里的状态角标 */
#results .row .tag{
  font-size:9px;opacity:.9;border:1px solid currentColor;
  padding:1px 5px;border-radius:4px;flex:none;letter-spacing:.04em;
}

/* ── 详情面板 ──
 * 宽度 432px 是硬契约：scene.js 的 PANEL_WIDTH 与相机 setViewOffset 都按它算。
 * 不要为了"更宽一点"改这里，否则选中公式会被相机偏移推到错误的位置。 */
#panel{
  position:absolute;top:0;right:0;height:100%;width:432px;max-width:92vw;
  background:linear-gradient(180deg,rgba(12,17,29,.94),rgba(8,11,20,.97));
  border-left:1px solid var(--line);
  backdrop-filter:blur(20px);
  /* 2026-11-01 修横向溢出（验收器 noOverflow 失败）。
     演进过程与为什么最终用 display：
       ① 原实现 transform:translateX(102%) —— 只是视觉位移，布局盒留在原位，
          documentElement.scrollWidth 把它算进去（1600 视口下 2041）。
       ② 改 right:-432px —— 盒子真的移出视口了（实测 panelRight=2032），
          但 Chrome 仍把"视口外的 absolute 定位元素"计入 documentElement.scrollWidth。
       ③ 加 overflow:clip —— body.scrollWidth 正确变成 1600，但 documentElement 仍是 2032。
       ④ 最终：关闭时 display:none，彻底不参与布局与滚动区计算。
          为了保留滑入动画，用 #panel.on 控制显示，且 .on 一挂上就有 transition。
      width:432px 是硬契约（scene.js 的 PANEL_WIDTH 与相机 setViewOffset 都按它算），未改。 */
  display:none;flex-direction:column;z-index:40;
  box-shadow:-30px 0 70px rgba(0,0,0,.55);
}
#panel.on{
  display:flex;
  animation:panelIn .34s cubic-bezier(.22,.61,.36,1);
}
@keyframes panelIn{
  from{transform:translateX(102%)}
  to{transform:translateX(0)}
}
@media (prefers-reduced-motion:reduce){
  #panel.on{animation:none}
}
#panel .hd{
  padding:22px 24px 16px;border-bottom:1px solid var(--line);flex:none;
  position:relative;background:linear-gradient(180deg,rgba(148,178,220,.045),transparent);
}
#panel .hd::before{
  content:"";position:absolute;left:24px;top:0;width:34px;height:2px;
  background:var(--gold);opacity:.75;border-radius:0 0 2px 2px;
}
#panel .hd .nm{
  font-size:20px;font-weight:600;letter-spacing:.04em;
  line-height:1.35;padding-right:40px;color:var(--ink);
}
#panel .hd .en{
  font-size:11px;color:var(--dim);margin-top:6px;letter-spacing:.08em;
  line-height:1.5;padding-right:36px;
}
#panel .hd .en:not(:empty)::before{
  content:"";display:inline-block;width:12px;height:1px;margin-right:8px;
  background:var(--line-strong);vertical-align:middle;
}
#panel .close{
  position:absolute;top:18px;right:20px;width:28px;height:28px;border-radius:6px;
  border:1px solid var(--line);background:rgba(148,178,220,.03);color:var(--dim);
  cursor:pointer;font-size:15px;line-height:1;display:flex;
  align-items:center;justify-content:center;transition:.18s;font-family:inherit;
}
#panel .close:hover{color:var(--ink);border-color:var(--line-strong);background:rgba(148,178,220,.08)}
#panel .close:focus-visible{outline:2px solid rgba(120,215,255,.45);outline-offset:2px}
#panel .bd{
  padding:18px 24px 40px;overflow-y:auto;flex:1;overscroll-behavior:contain;
  scrollbar-gutter:stable;scrollbar-width:thin;
  scrollbar-color:rgba(148,178,220,.24) transparent;
}
#panel .bd::-webkit-scrollbar{width:8px}
#panel .bd::-webkit-scrollbar-track{background:transparent}
#panel .bd::-webkit-scrollbar-thumb{
  background:rgba(148,178,220,.24);border-radius:4px;
  border:2px solid transparent;background-clip:content-box;
}

/* 公式：整块面板里唯一的"展品"。用细边 + 极淡青底把它框出来，
   而不是加发光 —— 公式本身已经是最亮的东西。 */
#panel .formula{
  padding:22px 18px;border-radius:8px;margin-bottom:18px;
  background:rgba(120,215,255,.045);border:1px solid rgba(148,178,220,.18);
  overflow-x:auto;overflow-y:hidden;text-align:center;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.035);
}
#panel .formula .katex{color:#fff6e0;font-size:1.06em}
#panel .formula::-webkit-scrollbar{height:6px}
#panel .formula::-webkit-scrollbar-thumb{background:rgba(148,178,220,.22);border-radius:3px}

#panel .meta{display:flex;align-items:center;gap:8px;margin-bottom:16px;flex-wrap:wrap}
#panel .badge{
  font-size:10.5px;padding:3px 8px;border-radius:6px;letter-spacing:.08em;
  border:1px solid currentColor;background:rgba(148,178,220,.04);line-height:1.4;
}
#panel .imp{font-size:10.5px;color:var(--dim);letter-spacing:.06em;font-variant-numeric:tabular-nums}
#panel .impbar{
  flex:1;min-width:70px;height:3px;border-radius:2px;
  background:rgba(148,178,220,.14);overflow:hidden;
}
#panel .impbar i{
  display:block;height:100%;border-radius:2px;
  background:linear-gradient(90deg,rgba(255,207,122,.5),var(--gold));
}

/* 领域标签（猜想专有）：比徽章更轻，用细边框而不是实心，
   这样"状态徽章"仍然是视觉上最重的信息 */
#panel .tag{
  font-size:10px;padding:3px 8px;border-radius:6px;letter-spacing:.06em;
  border:1px solid currentColor;opacity:.92;background:rgba(148,178,220,.03);
  line-height:1.4;
}

/* 状态横幅（猜想专有）：左边框 + 极淡底色，读起来像一条注释。
   ⚠ 底色用 8 位 hex 的 alpha 通道（#rrggbb14），不能直接拼 3 位 ——
   均衡后的颜色是 #rrggbb 形式，拼 2 位 alpha 才合法。 */
#panel .status{
  font-size:12.5px;line-height:1.72;margin:0 0 16px;padding:10px 13px;
  border-left:3px solid var(--gold);border-radius:0 8px 8px 0;color:#c9d7ec;
  background:rgba(148,178,220,.035);
}
#panel .status b{font-weight:600;margin-right:9px;letter-spacing:.04em}

/* 跨星团关联的角标：提示"这一跳要跨结构" */
#panel .rel .xbadge{
  font-size:9.5px;color:var(--violet);border:1px solid rgba(201,174,255,.35);
  padding:1px 5px;border-radius:4px;flex:none;letter-spacing:.04em;
}

#panel .summary{
  font-size:13.5px;line-height:1.85;color:#e4edfb;margin:0 0 16px;
  padding-left:14px;border-left:2px solid var(--gold);
}
#panel .detail{
  font-size:13px;line-height:1.95;color:#b9c8de;margin:0;
  text-align:justify;text-justify:inter-ideograph;
}
#panel .proof-open{
  display:flex;align-items:center;justify-content:space-between;gap:12px;width:100%;
  margin:20px 0 6px;padding:11px 14px;border-radius:8px;
  border:1px solid rgba(255,207,122,.28);background:rgba(255,207,122,.06);
  color:#f3ddb0;cursor:pointer;font:inherit;font-size:12px;letter-spacing:.04em;
  transition:background .18s,border-color .18s,transform .18s;
}
#panel .proof-open:hover{
  background:rgba(255,207,122,.11);border-color:rgba(255,207,122,.5);
  transform:translateY(-1px);
}
#panel .proof-open:active{transform:translateY(0)}
#panel .proof-open:focus-visible{outline:2px solid rgba(120,215,255,.45);outline-offset:2px}
#panel .proof-open small{color:#a9bad4;font-size:10px;letter-spacing:.02em;white-space:nowrap}
/* 数据里的 **粗体**：提亮 + 加粗。颜色用正文色系里更亮的一档，
   不用 accent（橙色）—— 那太抢眼，满屏橙字会盖过公式本身的重要性。 */
#panel .em{font-weight:600;color:#eef4ff}

#panel h4{
  display:flex;align-items:center;gap:8px;
  font-size:11px;color:var(--dim);letter-spacing:.16em;font-weight:500;
  margin:26px 0 12px;padding-bottom:8px;border-bottom:1px solid var(--line);
}
#panel h4::before{content:"";width:12px;height:1px;background:var(--gold);opacity:.6}
#panel .rel{
  display:block;width:100%;text-align:left;padding:11px 12px;margin-bottom:8px;
  border-radius:8px;background:rgba(148,178,220,.035);
  border:1px solid rgba(148,178,220,.12);cursor:pointer;
  transition:background .18s,border-color .18s,transform .18s;
  font-family:inherit;color:inherit;
}
#panel .rel:hover{
  background:rgba(148,178,220,.075);border-color:rgba(148,178,220,.3);
  transform:translateX(-2px);
}
#panel .rel:focus-visible{outline:2px solid rgba(120,215,255,.4);outline-offset:2px}
#panel .rel .t{display:flex;align-items:center;gap:8px;min-width:0}
#panel .rel .dot{width:6px;height:6px;border-radius:50%;flex:none}
#panel .rel .nm{
  font-size:12.5px;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;
  white-space:nowrap;color:var(--mute);
}
#panel .rel:hover .nm{color:var(--ink)}
#panel .rel .w{font-size:10px;color:var(--dim);font-variant-numeric:tabular-nums;flex:none}
#panel .rel .why{font-size:11px;color:var(--dim);margin-top:6px;line-height:1.65}
#panel .rel .wbar{height:2px;border-radius:2px;background:rgba(148,178,220,.12);margin-top:8px;overflow:hidden}
#panel .rel .wbar i{display:block;height:100%;border-radius:2px;background:var(--gold);opacity:.8}
#panel .rel.work{text-decoration:none;cursor:pointer}
#panel .rel.work:hover{transform:translateX(-2px)}
#panel .rel.work .why{white-space:normal}

#panel .empty{font-size:12px;color:var(--dim);font-style:italic}

/* ── 响应式 ──
 * 只用 max-width 断点 + 固定字号，不用 vw 字号。
 * 目标尺寸：390×844 / 1366×768 / 1440×900 / 1920×1080。
 * 底部三块（导出 / 提示 / 图例）各自占一条安全带，互不重叠。 */
@media (max-width:1100px){
  #legend{width:272px;padding:11px 12px}
  #legend .fams{gap:4px 12px}
  #hint{right:320px}
}
@media (max-width:900px){
  #title{left:24px;padding-left:72px}
  #title::after{left:62px}
  #title p{max-width:280px}
  #legend{width:260px}
  #hint{left:160px;right:300px;font-size:10.5px}
}
@media (max-width:760px){
  #title{top:88px;left:18px;padding-left:58px;min-height:44px}
  #title::before{width:46px;height:38px;top:0}
  #title::after{left:52px}
  #title h1{font-size:20px;letter-spacing:.18em}
  #title p{font-size:9.5px;letter-spacing:.1em;max-width:300px;line-height:1.5}
  #exportwrap{left:16px;bottom:16px}
  #export{height:30px;min-width:92px;padding:0 12px;font-size:10.5px}
  #legend{
    right:16px;bottom:88px;width:min(240px,calc(100vw - 32px));
    padding:10px 12px;
  }
  #legend .fams{gap:3px 8px}
  #legend .fam{font-size:9px}
  #legend .fam.grp{font-size:8.5px;margin-top:7px;padding-top:6px}
  #legend .asof{font-size:8.5px;margin-top:8px;padding-top:7px}
  #hint{
    left:auto;right:16px;bottom:16px;max-width:calc(100vw - 140px);
    text-align:right;font-size:9.5px;letter-spacing:.06em;line-height:1.55;
  }
  #results{max-height:calc(100vh - 96px)}
  #panel .hd{padding:18px 18px 14px}
  #panel .hd::before{left:18px}
  #panel .hd .nm{font-size:18px;padding-right:36px}
  #panel .close{top:15px;right:16px}
  #panel .bd{padding:16px 18px 36px}
  #panel .formula{padding:18px 12px}
  #panel .summary{font-size:13px;line-height:1.8}
  #panel .detail{font-size:12.5px;line-height:1.9}
}
@media (max-width:430px){
  #title{top:84px;left:16px;padding-left:52px}
  #title::after{left:46px}
  #title p{max-width:calc(100vw - 90px)}
  #legend{width:min(240px,calc(100vw - 32px))}
  #hint{max-width:calc(100vw - 130px)}
}
@media (prefers-reduced-motion:reduce){
  #load .glyph{animation:none}
  #panel{transition:none}
  #title,#hint,#legend,#exportwrap{transition:none}
}
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
  /* 拆成两段：主提示与统计数字用不同颜色，扫读时先看到"能做什么"，
   * 再看到"这里面有多少东西"。textContent 与原来逐字一致。 */
  hud.appendChild(el('div', { id: 'hint' }, [
    el('span', { class: 'hint-main' }, [UI.hint]),
    el('span', { class: 'hint-sep' }, ['　·　']),
    el('span', { class: 'hint-stats' }, [
      `主星系 ${stats.galaxyCount} 条定理 / ` +
      `星团 ${stats.conjCount} 条猜想 / 研究者 ${stats.researcherCount} 位 / ` +
      `${stats.linkCount} 条关联`,
    ]),
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
      '· 字段查询：family:/status:/field:/id:/name:/en:/latex:/importance:/degree:/rank:/cluster:/researcher:/institution:\n' +
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
    const sub = node.researcher
      ? `${RESEARCHER_UI[node.field]?.name || ''} · ${node.institution || ''} · 关联 ${node.degree}`
      : node.cluster
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
          // 星团节点标出状态：搜索结果里混着定理、猜想与研究者时，
          // 用徽章快速区分三类对象。
          (n.cluster || n.researcher)
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
        /* 研究者额外两行元信息：
     *   · 领域 —— 它决定研究者星团球面上的方向
     *   · 机构 —— 当前 affiliation，比"某个年份在哪个学校"更稳 */
    if (node.researcher) {
      const f = RESEARCHER_UI[node.field]
      if (f) {
        meta.appendChild(el('span', {
          class: 'tag',
          style: `color:${f.ui}; border-color:${f.ui}44`,
        }, [f.name]))
      }
      if (node.institution) {
        meta.appendChild(el('span', { class: 'tag' }, [node.institution]))
      }
      if (node.focus) {
        meta.appendChild(el('span', { class: 'imp', style: 'max-width:100%' }, [node.focus]))
      }
    }

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

    /* 研究者没有"证明页"含义，代表工作在下方以 arXiv 链接展示 */
    if (!node.researcher) {
      const proofButton = el('button', {
        class: 'proof-open', type: 'button', 'aria-label': `打开${node.name}的证明与知识脉络`,
      }, [
        el('span', {}, ['阅读证明与知识脉络']),
        el('small', {}, ['独立阅读页　→']),
      ])
      proofButton.addEventListener('click', () => cb.onProof?.(node.id))
      panelBody.appendChild(proofButton)
    }

    /* 研究者的代表工作：链接直接进 arXiv abs 页 */
    const works = node.representativeWorks || []
    if (node.researcher && works.length) {
      panelBody.appendChild(el('h4', {}, [`代表工作 · ${works.length}`]))
      for (const w of works) {
        panelBody.appendChild(el('a', {
          class: 'rel work',
          href: w.url,
          target: '_blank',
          rel: 'noreferrer',
        }, [
          el('div', { class: 't' }, [
            el('span', { class: 'nm' }, [w.title]),
            el('span', { class: 'w' }, [`${w.year ?? ''}`]),
            el('span', { class: 'tag' }, ['arXiv']),
          ]),
          w.note ? el('div', { class: 'why' }, [w.note]) : null,
        ]))
      }
    }

    /* 已有知识节点上的近期 arXiv 进展 */
    const frontier = FRONTIER_LINKS.filter((f) => f.targetNodeId === node.id)
    if (frontier.length) {
      panelBody.appendChild(el('h4', {}, [`前沿 arXiv 进展 · ${frontier.length}`]))
      for (const f of frontier) {
        panelBody.appendChild(el('a', {
          class: 'rel work',
          href: f.url,
          target: '_blank',
          rel: 'noreferrer',
        }, [
          el('div', { class: 't' }, [
            el('span', { class: 'nm' }, [f.title]),
            el('span', { class: 'w' }, [`${f.year ?? ''}`]),
            el('span', { class: 'tag' }, ['arXiv']),
          ]),
          f.summary ? el('div', { class: 'why' }, [f.summary]) : null,
        ]))
      }
    }

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
            // 研究者是与两者都不同的活动主体。
            (node.researcher || other.researcher)
              ? el('span', { class: 'xbadge' }, [node.researcher ? '↔ 知识节点' : other.researcher ? '↔ 研究者' : ''])
              : other.cluster !== node.cluster
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
