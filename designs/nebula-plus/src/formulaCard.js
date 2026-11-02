/**
 * designs/nebula-plus/src/formulaCard.js — 选中公式时浮在屏幕上的 2D 卡片。
 *
 * ═══ 修正 4：为什么需要它 ═══
 *
 * 原版的公式是 3D billboard 贴图：它跟着相机透视走，因此
 *   · 近大远小 → 选中后凑近了看，字反而是被拉茸的位图；
 *   · 被前后其他公式遮挡 / 叠压；
 *   · 亮度受光晕与色调映射影响，深色背景上对比度不够。
 *
 * 侧边详情面板（ui.js 的 showDetail）虽然已经是 KaTeX 的 DOM 渲染、
 * 保证清晰，但它在**屏幕右侧**，用户还要把视线从"我点的那个公式"
 * 移到面板上，空间关系断了。
 *
 * 本模块补上另一半：在公式**自己的屏幕位置**旁边浮一张 2D 卡片，
 * 用 KaTeX 实时排版 —— 矢量字形，任意缩放都锐利，且完全不受
 * 3D 透视、深度遮挡、色调映射影响。
 *
 * ═══ 与其他模块的边界 ═══
 *
 * · 只读 scene 提供的投影结果（screenX/screenY），不改任何渲染状态；
 * · 不接管选中逻辑：选中仍由 scene.select() 负责，卡片只是"显示"；
 * · 没有 KaTeX 可用时静默退化为纯文本，不抛错、不阻塞场景。
 */

import katex from 'katex'
import 'katex/dist/katex.min.css'

/** 卡片与公式屏幕位置的水平间距（px） */
const OFFSET_X = 18
/** 卡片与公式屏幕位置的垂直间距（px） */
const OFFSET_Y = -10
/** 卡片最大宽度（px）；长公式在这里换行，不会撑出屏幕 */
const MAX_W = 420
/** 距离视口边缘的留白（px），卡片不会贴边或被裁掉 */
const EDGE = 16

export function createFormulaCard() {
  const el = document.createElement('div')
  el.id = 'formula-card'
  el.setAttribute('role', 'note')
  el.setAttribute('aria-live', 'polite')
  el.style.display = 'none'
  injectCss()

  let visible = false
  let lastKey = null

  /**
   * 显示卡片。
   * @param {{id:string,name?:string,latex?:string}} node 选中的节点
   * @param {{x:number,y:number}} at 公式当前的屏幕坐标（css px）
   */
  function show(node, at) {
    if (!node || !at) { hide(); return }
    /* 内容没变时只挪位置，避免每帧重排 KaTeX（那是 DOM + 字体测量，很贵） */
    const key = node.id
    if (key !== lastKey) {
      lastKey = key
      renderInto(el, node)
    }
    place(el, at)
    if (!visible) { el.style.display = ''; visible = true }
  }

  function place(node, at) {
    /* 先放到"公式右侧"，再按视口边界夹回来 —— 这样卡片总在公式附近，
       但永远不会跑到屏幕外（原版面板就不会有这个问题，因为它是固定的）。 */
    const w = el.offsetWidth || MAX_W
    const h = el.offsetHeight || 60
    let x = at.x + OFFSET_X
    let y = at.y + OFFSET_Y

    if (x + w > innerWidth - EDGE) x = at.x - w - OFFSET_X   // 右边放不下 → 翻到左边
    if (x < EDGE) x = EDGE
    if (y + h > innerHeight - EDGE) y = innerHeight - EDGE - h
    if (y < EDGE) y = EDGE

    el.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`
  }

  function hide() {
    if (!visible) return
    el.style.display = 'none'
    visible = false
    lastKey = null
  }

  document.body.append(el)

  return {
    el,
    show,
    hide,
    get visible() { return visible },
  }
}

/** 渲染卡片内容：公式用 KaTeX，名称用纯文本（不拼 innerHTML） */
function renderInto(el, node) {
  el.textContent = ''

  const name = document.createElement('div')
  name.className = 'fc-name'
  name.textContent = node.name || node.id || ''
  el.append(name)

  if (node.latex) {
    const f = document.createElement('div')
    f.className = 'fc-formula'
    try {
      /* KaTeX 产出的是它自己生成的 HTML（不含用户输入的裸 HTML），可信。
         throwOnError:false —— 个别公式用了 KaTeX 不支持的宏，退化成红色原文，
         总比整张卡片崩掉好。 */
      f.innerHTML = katex.renderToString(node.latex, {
        throwOnError: false, displayMode: true, output: 'html',
        strict: false, trust: false,
      })
      f.setAttribute('aria-label', node.latex)
      f.setAttribute('role', 'img')
    } catch {
      f.textContent = node.latex
    }
    el.append(f)
  }
}

/** 样式注入一次即可 */
let cssDone = false
function injectCss() {
  if (cssDone) return
  cssDone = true
  const s = document.createElement('style')
  s.textContent = `
/* 选中公式的 2D 浮卡（修正 4）。
   用 fixed + transform 而不是 absolute + left/top：
   transform 走合成层，每帧移动不会触发重排，拖拽旋转时也不掉帧。 */
#formula-card{
  position:fixed; left:0; top:0; z-index:60;
  max-width:${MAX_W}px;
  padding:12px 16px 13px;
  background:linear-gradient(180deg,rgba(14,20,34,.96),rgba(9,13,23,.98));
  border:1px solid rgba(148,178,220,.28);
  border-left:2px solid var(--gold, #ffcf7a);
  border-radius:8px;
  box-shadow:0 18px 44px rgba(0,0,0,.6), 0 0 0 1px rgba(0,0,0,.3);
  backdrop-filter:blur(14px);
  pointer-events:none;      /* 只是展示，不拦鼠标——否则挡住拖拽/缩放 */
  will-change:transform;
  animation:fcIn .18s ease-out;
}
@keyframes fcIn{ from{ opacity:0; transform:translate(var(--x,0),var(--y,0)) scale(.97) } }
#formula-card .fc-name{
  font-size:13px; font-weight:600; color:#eef4ff;
  margin-bottom:8px; letter-spacing:.02em;
}
#formula-card .fc-formula{
  color:#fff6e0; font-size:15px; line-height:1.35;
  overflow-x:auto; overflow-y:hidden;
  scrollbar-width:thin;
}
#formula-card .fc-formula::-webkit-scrollbar{height:4px}
#formula-card .fc-formula::-webkit-scrollbar-thumb{background:rgba(148,178,220,.25);border-radius:2px}
#formula-card .fc-formula .katex{color:#fff6e0}
@media (prefers-reduced-motion:reduce){ #formula-card{animation:none} }
`
  document.head.append(s)
}
