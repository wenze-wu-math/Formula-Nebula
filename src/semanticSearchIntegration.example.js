/**
 * ═══════════════════════════════════════════════════════════════
 *  语义搜索集成示例 · Integration Example
 * ═══════════════════════════════════════════════════════════════
 *
 *  这个文件展示如何在现有代码库中集成语义搜索。
 *  复制相关代码到 src/main.js 和 src/ui.js 即可启用。
 */

/* ─────────────────────────────────────────────────────────────
 * 步骤 1: 在 main.js 中初始化语义索引
 * ───────────────────────────────────────────────────────────── */

// 文件: src/main.js（现有文件，添加以下代码）

import { buildSemanticIndex } from './semanticSearch.js'

/* ── 宿主依赖注入 ──
 *
 * 这个文件是**集成示例**，不是应用的一部分。示例里的回调需要两个只有
 * 宿主（main.js / ui.js）才提供的动作：
 *
 *   · scene.focusOnNode(node)   —— 由 createScene() 返回的 scene 提供
 *   · showNodePanel(node)       —— 详情面板，原本属于 ui.js
 *
 * 此前 showNodePanel 在全文被直接引用却从未定义或导入，所以任何一处
 * 调用都会抛 ReferenceError；enhanceExistingSearch() 又漏掉了 scene 参数，
 * 导致它内部的回调连 scene 都取不到。
 *
 * 现在改为显式注入：调用方通过 setHostActions() 提供这两个动作。未注入时
 * 给出一次性的控制台警告而不是崩溃 —— 示例代码被单独跑时也能看懂发生了什么。
 */
let hostShowNodePanel = null

/** 供宿主注入详情面板函数。示例启用前调用一次即可。 */
export function setHostActions({ showNodePanel } = {}) {
  hostShowNodePanel = typeof showNodePanel === 'function' ? showNodePanel : null
}

function showNodePanel(node) {
  if (hostShowNodePanel) return hostShowNodePanel(node)
  if (!showNodePanel.warned) {
    showNodePanel.warned = true
    console.warn(
      '[semantic-search example] showNodePanel 未注入，详情面板不会打开。' +
        ' 调用 setHostActions({ showNodePanel }) 启用。'
    )
  }
}

// 在 buildGraph() 之后调用
export function initSemanticSearch(nodes, links) {
  console.time('Build semantic index')
  buildSemanticIndex_step4(nodes, links)
  console.timeEnd('Build semantic index')
  console.log('✓ Semantic search initialized')
}

// 在现有的初始化流程中添加：
// const { nodes, links } = buildGraph()
// layoutGraph(...)
// initSemanticSearch(nodes, links)  ← 新增这一行

/* ─────────────────────────────────────────────────────────────
 * 步骤 2: 在 ui.js 中集成搜索 UI
 * ───────────────────────────────────────────────────────────── */

// 文件: src/ui.js（现有文件，添加以下代码）

import {
  createSemanticSearchUI,
  SEMANTIC_SEARCH_CSS,
} from './semanticSearchUI.js'
import { semanticSearch } from './semanticSearch.js'

// ① 注入 CSS（在 initUI 函数的开头）
export function initUI(_scene, _nodes, _links) {
  // 现有代码...

  // 注入语义搜索样式
  if (!document.querySelector('#semantic-search-styles')) {
    const style = document.createElement('style')
    style.id = 'semantic-search-styles'
    style.textContent = SEMANTIC_SEARCH_CSS
    document.head.appendChild(style)
  }

  // ... 继续现有初始化
}

// ② 方案 A: 替换现有搜索框（完全替换）
export function replaceSearchWithSemantic(container, scene, nodes) {
  // 移除旧搜索框
  const oldSearch = container.querySelector('#search')
  if (oldSearch) oldSearch.remove()

  // 创建新搜索 UI
  const searchUI = createSemanticSearchUI(container, (nodeId) => {
    // 复用现有的 focusNode 逻辑
    const node = nodes.find((n) => n.id === nodeId)
    if (node) {
      scene.focusOnNode(node) // 假设 scene 有此方法
      showNodePanel(node)     // 假设有此函数
    }
  })

  return searchUI
}

// ③ 方案 B: 并行现有搜索（保留两套搜索）
export function addSemanticSearch(container, scene, nodes) {
  // 创建独立容器
  const semanticContainer = document.createElement('div')
  semanticContainer.id = 'semantic-search-container'
  semanticContainer.style.cssText = 'margin-top: 20px;'
  container.appendChild(semanticContainer)

  const searchUI = createSemanticSearchUI(semanticContainer, (nodeId) => {
    const node = nodes.find((n) => n.id === nodeId)
    if (node) {
      scene.focusOnNode(node)
      showNodePanel(node)
    }
  })

  return searchUI
}

// ④ 方案 C: 增强现有搜索（保留界面，替换后端）
export function enhanceExistingSearch(inputElement, resultsElement, nodes, scene) {
  inputElement.addEventListener('input', async (e) => {
    const query = e.target.value.trim()
    if (query.length < 2) {
      resultsElement.innerHTML = ''
      return
    }

    // 使用语义搜索替代原来的 filter
    const results = semanticSearch(query, 20, { boostTopology: true })

    // 渲染结果（复用现有的渲染逻辑）
    resultsElement.innerHTML = results
      .map((r) => {
        const node = r.node
        const score = (r.similarity * 100).toFixed(0)
        return `
          <div class="result-item" data-id="${node.id}">
            <strong>${node.name || node.en}</strong>
            <span class="score">${score}%</span>
            <br>
            <small>${node.summary || ''}</small>
          </div>
        `
      })
      .join('')

    // 点击事件
    resultsElement.querySelectorAll('.result-item').forEach((item) => {
      item.addEventListener('click', () => {
        const nodeId = item.dataset.id
        const node = nodes.find((n) => n.id === nodeId)
        if (node) {
          scene.focusOnNode(node)
          showNodePanel(node)
        }
      })
    })
  })
}

/* ─────────────────────────────────────────────────────────────
 * 步骤 3: 高级功能示例
 * ───────────────────────────────────────────────────────────── */

import {
  getConceptTreeAPI,
  findAnalogyAPI,
  getSuggestions,
} from './semanticSearch.js'

// ⑤ 在详情面板添加"相关定理"按钮
export function addRelatedTheoremsButton(panel, nodeId, onSelect) {
  const btn = document.createElement('button')
  btn.textContent = '查看相关定理'
  btn.addEventListener('click', () => {
    const tree = getConceptTreeAPI(nodeId)
    if (!tree) return

    // 显示关系树
    const dialog = document.createElement('div')
    dialog.className = 'concept-tree-dialog'
    dialog.innerHTML = `
      <h3>概念关系树</h3>
      <div class="tree-section">
        <h4>推论与推广</h4>
        ${renderTree(tree.children, onSelect)}
      </div>
      <div class="tree-section">
        <h4>前置与特例</h4>
        ${renderTree(tree.parents, onSelect)}
      </div>
      <button class="close-btn">关闭</button>
    `
    document.body.appendChild(dialog)

    dialog.querySelector('.close-btn').addEventListener('click', () => {
      dialog.remove()
    })
  })

  panel.appendChild(btn)
}

function renderTree(branches, onSelect, depth = 0) {
  if (!branches || branches.length === 0) return '<p>无</p>'
  const indent = '  '.repeat(depth)
  return branches
    .map((b) => {
      const relation = b.relation || 'related'
      return `
        <div style="margin-left: ${depth * 20}px;">
          <a href="#" class="tree-node" data-id="${b.node.id}">
            ${b.node.name || b.node.en}
          </a>
          <span class="tree-relation">(${relation})</span>
          ${renderTree(b.children, onSelect, depth + 1)}
        </div>
      `
    })
    .join('')
}

// ⑥ 类比搜索界面
export function addAnalogySearchFeature(container, onResultSelect) {
  const wrapper = document.createElement('div')
  wrapper.className = 'analogy-search'
  wrapper.innerHTML = `
    <h4>类比搜索</h4>
    <p>找一个定理，它和 A 的关系就像 B 和 C 的关系一样</p>
    <input type="text" id="analogy-a" placeholder="定理 A (如: riemann-roch-curve)" />
    <input type="text" id="analogy-b" placeholder="定理 B (如: curve)" />
    <button id="analogy-search-btn">搜索类比</button>
    <div id="analogy-results"></div>
  `
  container.appendChild(wrapper)

  const btnSearch = wrapper.querySelector('#analogy-search-btn')
  const inputA = wrapper.querySelector('#analogy-a')
  const inputB = wrapper.querySelector('#analogy-b')
  const resultsBox = wrapper.querySelector('#analogy-results')

  btnSearch.addEventListener('click', () => {
    const theoremA = inputA.value.trim()
    const theoremB = inputB.value.trim()
    if (!theoremA || !theoremB) return

    const analogies = findAnalogyAPI(theoremA, theoremB)
    if (analogies.length === 0) {
      resultsBox.innerHTML = '<p>未找到类比</p>'
      return
    }

    resultsBox.innerHTML = `
      <h5>类比结果：</h5>
      ${analogies
        .map((a) => {
          const score = (a.similarity * 100).toFixed(0)
          return `
            <div class="analogy-item" data-from="${a.from}" data-to="${a.to}">
              <strong>${a.from}</strong> → <strong>${a.to}</strong>
              <span class="score">${score}%</span>
            </div>
          `
        })
        .join('')}
    `

    resultsBox.querySelectorAll('.analogy-item').forEach((item) => {
      item.addEventListener('click', () => {
        onResultSelect(item.dataset.to)
      })
    })
  })
}

// ⑦ 搜索建议（自动补全）示例
export function addAutocomplete(inputElement, onSelect) {
  const suggestionsBox = document.createElement('div')
  suggestionsBox.className = 'autocomplete-suggestions'
  suggestionsBox.style.display = 'none'
  inputElement.parentElement.appendChild(suggestionsBox)

  let debounceTimer = null

  inputElement.addEventListener('input', () => {
    clearTimeout(debounceTimer)
    const query = inputElement.value.trim()

    if (query.length < 2) {
      suggestionsBox.style.display = 'none'
      return
    }

    debounceTimer = setTimeout(() => {
      const suggestions = getSuggestions(query, 8)
      if (suggestions.length === 0) {
        suggestionsBox.style.display = 'none'
        return
      }

      suggestionsBox.innerHTML = suggestions
        .map((sug) => {
          return `
            <div class="autocomplete-item" data-id="${sug.node.id}">
              ${sug.label}
            </div>
          `
        })
        .join('')

      suggestionsBox.style.display = 'block'

      suggestionsBox.querySelectorAll('.autocomplete-item').forEach((item) => {
        item.addEventListener('click', () => {
          inputElement.value = item.textContent
          suggestionsBox.style.display = 'none'
          onSelect(item.dataset.id)
        })
      })
    }, 200)
  })

  // 点击外部关闭
  document.addEventListener('click', (e) => {
    if (!inputElement.contains(e.target) && !suggestionsBox.contains(e.target)) {
      suggestionsBox.style.display = 'none'
    }
  })
}

/* ─────────────────────────────────────────────────────────────
 * 步骤 4: 完整集成示例（在 main.js 中）
 *
 * 下面这段是一份「照此复制到 src/main.js」的示意代码。它的 import 使用了
 * _step4 后缀的别名，是为了不与本文件顶部步骤 1 的同名 import 冲突
 * （原本直接重复 import 会触发 "Identifier 'buildSemanticIndex' has already
 * been declared" 的语法错误，使整个文件无法被解析）。
 * ───────────────────────────────────────────────────────────── */
// 文件: src/main.js（完整流程）

import { buildGraph as buildGraph_step4, layoutGraph as layoutGraph_step4 } from './graph.js'
import { initScene as initScene_step4 } from './scene.js'
import { buildSemanticIndex as buildSemanticIndex_step4 } from './semanticSearch.js'
import {
  createSemanticSearchUI as createSemanticSearchUI_step4,
  SEMANTIC_SEARCH_CSS as SEMANTIC_SEARCH_CSS_step4,
} from './semanticSearchUI.js'

async function initApp() {
  // ① 构建图谱
  console.time('Build graph')
  const { nodes, links } = buildGraph_step4()
  console.timeEnd('Build graph')

  // ② 布局（需要先烘焙公式纹理）
  console.time('Layout graph')
  await layoutGraph_step4(nodes, links)
  console.timeEnd('Layout graph')

  // ③ 初始化场景
  console.time('Init scene')
  const scene = initScene_step4(nodes, links)
  console.timeEnd('Init scene')

  // ④ 构建语义索引
  console.time('Build semantic index')
  buildSemanticIndex_step4(nodes, links)
  console.timeEnd('Build semantic index')

  // ⑤ 注入 CSS
  const style = document.createElement('style')
  style.textContent = SEMANTIC_SEARCH_CSS
  document.head.appendChild(style)

  // ⑥ 创建搜索 UI
  const searchContainer = document.querySelector('#search-wrapper')
  const _searchUI = createSemanticSearchUI(searchContainer, (nodeId) => {
    const node = nodes.find((n) => n.id === nodeId)
    if (node) {
      scene.focusOnNode(node)
      showNodePanel(node)
    }
  })

  console.log('✓ App initialized with semantic search')
}

initApp()

/* ─────────────────────────────────────────────────────────────
 * 步骤 5: 测试与验证
 *
 * 下面整段是「在浏览器控制台里逐条敲」的说明，不是要执行的模块代码。
 * 原本只有中文说明被 // 注释掉，import 与调用行裸露在外，导致
 * "Identifier 'semanticSearch' has already been declared" 语法错误。
 * ───────────────────────────────────────────────────────────── */

// 在浏览器控制台测试：

// 1. 语义搜索
// import { semanticSearch } from './semanticSearch.js'
// semanticSearch('代数闭包', 10)
// 应该返回 "代数闭包" "Algebraic Closure" 等

// 2. 同义词扩展
// semanticSearch('态射', 10)
// 应该匹配 "态射" "morphism" "map" "arrow" 等

// 3. 混合模式
// import { parseQuery } from './graphQuery.js'
// const filter = parseQuery('family:scheme importance:>0.8')
// semanticSearch('态射', 10, { filterParsed: filter })
// 应该只返回 scheme 族 + 重要度 > 0.8 的结果

// 4. 自动补全
// import { getSuggestions } from './semanticSearch.js'
// getSuggestions('代数', 8)
// 应该返回 "代数闭包" "代数簇" 等

// 5. 概念树
// import { getConceptTreeAPI } from './semanticSearch.js'
// getConceptTreeAPI('nullstellensatz')
// 应该返回前置定理和推论

// 6. 索引统计
// import { getIndexStats } from './semanticSearch.js'
// getIndexStats()
// 应该返回 { totalDocs, vocabSize, avgDocLength, synonymCount }
