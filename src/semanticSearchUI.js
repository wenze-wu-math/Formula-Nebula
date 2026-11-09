/**
 * ═══════════════════════════════════════════════════════════════
 *  语义搜索 UI 组件 · Semantic Search Interface
 * ═══════════════════════════════════════════════════════════════
 *
 *  功能：
 *    · 实时自动补全（type-ahead）
 *    · 同义词高亮提示（"也搜索了: algebraic closure"）
 *    · 多模式切换：关键词 / 语义 / 混合
 *    · 搜索历史（localStorage）
 *    · 高级查询面板（结构化 + 语义组合）
 */

import { semanticSearch, getSuggestions, getIndexStats } from './semanticSearch.js'
import { parseQuery } from './graphQuery.js'

/** 搜索模式 */
const SEARCH_MODE = {
  KEYWORD: 'keyword',   // 传统关键词（现有的 parseQuery）
  SEMANTIC: 'semantic', // 纯语义（TF-IDF）
  HYBRID: 'hybrid',     // 混合：语义排序 + 结构化过滤
}

/** 搜索历史管理 */
class SearchHistory {
  constructor(maxSize = 20) {
    this.maxSize = maxSize
    this.key = 'formula-nebula-search-history'
  }

  get() {
    try {
      return JSON.parse(localStorage.getItem(this.key) || '[]')
    } catch {
      return []
    }
  }

  add(query) {
    if (!query || query.length < 2) return
    const history = this.get()
    const filtered = history.filter((q) => q !== query)
    filtered.unshift(query)
    localStorage.setItem(this.key, JSON.stringify(filtered.slice(0, this.maxSize)))
  }

  clear() {
    localStorage.removeItem(this.key)
  }
}

const searchHistory = new SearchHistory()

/** 创建搜索 UI（在 src/ui.js 的 initUI 中调用） */
export function createSemanticSearchUI(container, onResultSelect) {
  const wrapper = document.createElement('div')
  wrapper.className = 'semantic-search-wrapper'
  wrapper.innerHTML = `
    <div class="search-header">
      <div class="search-mode-tabs">
        <button class="search-mode-tab active" data-mode="${SEARCH_MODE.HYBRID}">
          混合搜索
        </button>
        <button class="search-mode-tab" data-mode="${SEARCH_MODE.SEMANTIC}">
          语义搜索
        </button>
        <button class="search-mode-tab" data-mode="${SEARCH_MODE.KEYWORD}">
          关键词
        </button>
      </div>
      <button class="search-help-btn" title="搜索语法帮助">?</button>
    </div>

    <div class="search-input-group">
      <input
        type="text"
        class="search-input"
        placeholder="搜索定理、概念… (支持中英文、同义词)"
        autocomplete="off"
      />
      <button class="search-clear-btn" title="清空">&times;</button>
    </div>

    <div class="search-suggestions" style="display:none"></div>
    <div class="search-synonyms" style="display:none"></div>
    <div class="search-results"></div>
    <div class="search-stats"></div>
  `

  container.appendChild(wrapper)

  const input = wrapper.querySelector('.search-input')
  const suggestionsBox = wrapper.querySelector('.search-suggestions')
  const _synonymsBox = wrapper.querySelector('.search-synonyms')
  const resultsBox = wrapper.querySelector('.search-results')
  const statsBox = wrapper.querySelector('.search-stats')
  const clearBtn = wrapper.querySelector('.search-clear-btn')
  const helpBtn = wrapper.querySelector('.search-help-btn')
  const modeTabs = wrapper.querySelectorAll('.search-mode-tab')

  let currentMode = SEARCH_MODE.HYBRID
  let debounceTimer = null
  let selectedIndex = -1

  // 模式切换
  modeTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      modeTabs.forEach((t) => t.classList.remove('active'))
      tab.classList.add('active')
      currentMode = tab.dataset.mode
      if (input.value.trim()) {
        performSearch(input.value.trim())
      }
    })
  })

  // 输入监听（防抖 + 自动补全）
  input.addEventListener('input', () => {
    clearTimeout(debounceTimer)
    const query = input.value.trim()

    if (query.length < 2) {
      hideSuggestions()
      hideResults()
      return
    }

    // 自动补全（即时，无防抖）
    if (query.length >= 2) {
      showSuggestions(query)
    }

    // 搜索结果（防抖 300ms）
    debounceTimer = setTimeout(() => {
      performSearch(query)
    }, 300)
  })

  // 键盘导航（↑ ↓ Enter）
  input.addEventListener('keydown', (e) => {
    const items = suggestionsBox.querySelectorAll('.suggestion-item')
    if (items.length === 0) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      selectedIndex = Math.min(selectedIndex + 1, items.length - 1)
      updateSelection(items)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      selectedIndex = Math.max(selectedIndex - 1, -1)
      updateSelection(items)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (selectedIndex >= 0) {
        items[selectedIndex].click()
      } else {
        performSearch(input.value.trim())
      }
    } else if (e.key === 'Escape') {
      hideSuggestions()
    }
  })

  // 清空按钮
  clearBtn.addEventListener('click', () => {
    input.value = ''
    hideSuggestions()
    hideResults()
    input.focus()
  })

  // 帮助面板
  helpBtn.addEventListener('click', () => {
    showHelpDialog()
  })

  // 点击外部关闭建议
  document.addEventListener('click', (e) => {
    if (!wrapper.contains(e.target)) {
      hideSuggestions()
    }
  })

  /** 显示自动补全建议 */
  function showSuggestions(query) {
    const suggestions = getSuggestions(query, 8)
    if (suggestions.length === 0) {
      hideSuggestions()
      return
    }

    suggestionsBox.innerHTML = suggestions
      .map((sug, idx) => {
        const icon = sug.node.cluster ? '⭐' : '📐'
        const badge = sug.node.family || sug.node.field || ''
        return `
          <div class="suggestion-item" data-id="${sug.node.id}" data-idx="${idx}">
            <span class="suggestion-icon">${icon}</span>
            <div class="suggestion-content">
              <div class="suggestion-label">${highlightMatch(sug.label, query)}</div>
              <div class="suggestion-meta">
                ${sug.node.en ? `<span class="suggestion-en">${sug.node.en}</span>` : ''}
                ${badge ? `<span class="suggestion-badge">${badge}</span>` : ''}
              </div>
            </div>
          </div>
        `
      })
      .join('')

    suggestionsBox.style.display = 'block'
    selectedIndex = -1

    // 点击建议
    suggestionsBox.querySelectorAll('.suggestion-item').forEach((item) => {
      item.addEventListener('click', () => {
        const nodeId = item.dataset.id
        input.value = item.querySelector('.suggestion-label').textContent
        hideSuggestions()
        onResultSelect(nodeId)
        searchHistory.add(input.value)
      })
    })
  }

  /** 高亮匹配部分 */
  function highlightMatch(text, query) {
    const idx = text.toLowerCase().indexOf(query.toLowerCase())
    if (idx === -1) return text
    return (
      text.slice(0, idx) +
      `<mark>${text.slice(idx, idx + query.length)}</mark>` +
      text.slice(idx + query.length)
    )
  }

  /** 更新键盘选中态 */
  function updateSelection(items) {
    items.forEach((item, idx) => {
      item.classList.toggle('selected', idx === selectedIndex)
    })
    if (selectedIndex >= 0) {
      items[selectedIndex].scrollIntoView({ block: 'nearest' })
    }
  }

  /** 隐藏建议 */
  function hideSuggestions() {
    suggestionsBox.style.display = 'none'
    selectedIndex = -1
  }

  /** 执行搜索 */
  function performSearch(query) {
    searchHistory.add(query)

    if (currentMode === SEARCH_MODE.KEYWORD) {
      // 传统关键词搜索（调用现有的 parseQuery）
      const parsed = parseQuery(query)
      // 这里需要节点列表，应该从外部传入或全局获取
      // 暂时返回提示
      showKeywordResults(parsed)
    } else if (currentMode === SEARCH_MODE.SEMANTIC) {
      // 纯语义搜索
      const results = semanticSearch(query, 20, { boostTopology: false })
      showSemanticResults(results, query)
    } else {
      // 混合模式：语义 + 结构化
      const parsed = parseQuery(query)
      const results = semanticSearch(query, 20, {
        boostTopology: true,
        filterParsed: parsed.error ? null : parsed,
      })
      showSemanticResults(results, query, parsed)
    }
  }

  /** 显示关键词结果（兼容原有逻辑） */
  function showKeywordResults(parsed) {
    resultsBox.innerHTML = `
      <div class="search-result-hint">
        关键词模式：使用结构化查询语法（见帮助）
        <br><small>${parsed.desc || ''}</small>
      </div>
    `
    resultsBox.style.display = 'block'
  }

  /** 显示语义搜索结果 */
  function showSemanticResults(results, query, parsed = null) {
    if (results.length === 0) {
      resultsBox.innerHTML = `
        <div class="search-no-result">
          未找到相关结果<br>
          <small>尝试使用同义词或更宽泛的术语</small>
        </div>
      `
      resultsBox.style.display = 'block'
      return
    }

    resultsBox.innerHTML = `
      <div class="search-result-header">
        找到 ${results.length} 个相关结果
        ${parsed && !parsed.error ? `<br><small>过滤条件: ${parsed.desc}</small>` : ''}
      </div>
      ${results
        .map((r) => {
          const node = r.node
          const icon = node.cluster ? '⭐' : node.researcher ? '👤' : '📐'
          const badge = node.family || node.field || node.status || ''
          const score = (r.similarity * 100).toFixed(0)
          return `
            <div class="search-result-item" data-id="${node.id}">
              <div class="result-header">
                <span class="result-icon">${icon}</span>
                <span class="result-name">${node.name || node.en}</span>
                <span class="result-score" title="相似度">${score}%</span>
              </div>
              <div class="result-meta">
                ${node.en ? `<span class="result-en">${node.en}</span>` : ''}
                <span class="result-badge">${badge}</span>
              </div>
              ${node.summary ? `<div class="result-summary">${truncate(node.summary, 80)}</div>` : ''}
            </div>
          `
        })
        .join('')}
    `

    resultsBox.style.display = 'block'

    // 点击结果
    resultsBox.querySelectorAll('.search-result-item').forEach((item) => {
      item.addEventListener('click', () => {
        onResultSelect(item.dataset.id)
      })
    })

    // 显示统计
    const stats = getIndexStats()
    if (stats) {
      statsBox.innerHTML = `
        <small>
          索引: ${stats.totalDocs} 个节点, ${stats.vocabSize} 个词汇, ${stats.synonymCount} 组同义词
        </small>
      `
      statsBox.style.display = 'block'
    }
  }

  function truncate(text, len) {
    return text.length > len ? text.slice(0, len) + '…' : text
  }

  function hideResults() {
    resultsBox.style.display = 'none'
    statsBox.style.display = 'none'
  }

  /** 显示帮助对话框 */
  function showHelpDialog() {
    const dialog = document.createElement('div')
    dialog.className = 'search-help-dialog'
    dialog.innerHTML = `
      <div class="search-help-content">
        <h3>搜索语法帮助</h3>
        <div class="help-section">
          <h4>混合搜索（推荐）</h4>
          <p>自然语言 + 结构化过滤，理解同义词和数学概念。</p>
          <ul>
            <li><code>代数闭包</code> → 也搜 "algebraic closure"</li>
            <li><code>上同调 family:cohomology</code> → 语义搜索 + 限定族</li>
            <li><code>态射 importance:>0.8</code> → 高重要度的态射相关定理</li>
          </ul>
        </div>

        <div class="help-section">
          <h4>语义搜索</h4>
          <p>纯基于数学意义的相似度排序，不需要精确匹配。</p>
          <ul>
            <li>输入概念描述，如"层上的导出函子"</li>
            <li>自动理解同义词和相关术语</li>
            <li>利用图谱拓扑增强相关性</li>
          </ul>
        </div>

        <div class="help-section">
          <h4>关键词模式</h4>
          <p>精确的结构化查询（支持布尔运算）。</p>
          <ul>
            <li><code>family:scheme OR family:cohomology</code></li>
            <li><code>status:open importance:>0.9</code> → 重要的未解决问题</li>
            <li><code>-status:proved field:ag</code> → 代数几何中未证明的</li>
          </ul>
        </div>

        <div class="help-section">
          <h4>可用字段</h4>
          <p>
            <code>family:</code> 族 ·
            <code>field:</code> 领域 ·
            <code>status:</code> 状态 ·
            <code>importance:</code> 重要度 ·
            <code>name:</code> 名称 ·
            <code>en:</code> 英文名
          </p>
        </div>

        <button class="help-close-btn">知道了</button>
      </div>
    `

    document.body.appendChild(dialog)

    dialog.querySelector('.help-close-btn').addEventListener('click', () => {
      dialog.remove()
    })

    dialog.addEventListener('click', (e) => {
      if (e.target === dialog) dialog.remove()
    })
  }

  return {
    focus: () => input.focus(),
    clear: () => {
      input.value = ''
      hideSuggestions()
      hideResults()
    },
    search: (query) => {
      input.value = query
      performSearch(query)
    },
  }
}

/** CSS 样式（插入到 src/ui.js 或独立的 .css） */
export const SEMANTIC_SEARCH_CSS = `
.semantic-search-wrapper {
  position: relative;
  width: 100%;
  max-width: 640px;
}

.search-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.search-mode-tabs {
  display: flex;
  gap: 4px;
  background: var(--panel);
  border-radius: 6px;
  padding: 3px;
}

.search-mode-tab {
  padding: 6px 14px;
  border: none;
  background: transparent;
  color: var(--dim);
  font-size: 13px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.search-mode-tab:hover {
  color: var(--ink);
  background: rgba(255, 255, 255, 0.06);
}

.search-mode-tab.active {
  color: var(--ink);
  background: rgba(255, 207, 122, 0.15);
  font-weight: 500;
}

.search-help-btn {
  width: 28px;
  height: 28px;
  border: 1px solid var(--line);
  border-radius: 50%;
  background: var(--panel);
  color: var(--dim);
  font-size: 15px;
  cursor: pointer;
  transition: all 0.2s;
}

.search-help-btn:hover {
  color: var(--cyan);
  border-color: var(--cyan);
}

.search-input-group {
  position: relative;
}

.search-input {
  width: 100%;
  padding: 12px 40px 12px 16px;
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 8px;
  color: var(--ink);
  font-size: 15px;
  outline: none;
  transition: border-color 0.2s;
}

.search-input:focus {
  border-color: var(--cyan);
}

.search-clear-btn {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  color: var(--dim);
  font-size: 24px;
  line-height: 1;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s;
}

.search-input:not(:placeholder-shown) + .search-clear-btn {
  opacity: 1;
}

.search-clear-btn:hover {
  color: var(--coral);
}

.search-suggestions,
.search-results {
  margin-top: 8px;
  background: var(--panel-strong);
  border: 1px solid var(--line);
  border-radius: 8px;
  max-height: 400px;
  overflow-y: auto;
}

.suggestion-item,
.search-result-item {
  display: flex;
  align-items: center;
  padding: 10px 14px;
  cursor: pointer;
  transition: background 0.15s;
  border-bottom: 1px solid var(--line-soft);
}

.suggestion-item:last-child,
.search-result-item:last-child {
  border-bottom: none;
}

.suggestion-item:hover,
.search-result-item:hover {
  background: rgba(255, 255, 255, 0.04);
}

.suggestion-item.selected {
  background: rgba(120, 215, 255, 0.12);
}

.suggestion-icon,
.result-icon {
  font-size: 18px;
  margin-right: 10px;
}

.suggestion-content,
.result-content {
  flex: 1;
  min-width: 0;
}

.suggestion-label,
.result-name {
  font-size: 14px;
  color: var(--ink);
  font-weight: 500;
}

.suggestion-label mark {
  background: rgba(255, 207, 122, 0.25);
  color: var(--gold);
  padding: 0 2px;
  border-radius: 2px;
}

.suggestion-meta,
.result-meta {
  display: flex;
  gap: 8px;
  margin-top: 3px;
  font-size: 12px;
  color: var(--dim);
}

.suggestion-en,
.result-en {
  font-style: italic;
}

.suggestion-badge,
.result-badge {
  padding: 1px 6px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 3px;
  font-size: 11px;
}

.result-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.result-score {
  margin-left: auto;
  padding: 2px 6px;
  background: rgba(120, 215, 255, 0.15);
  color: var(--cyan);
  border-radius: 3px;
  font-size: 11px;
  font-weight: 600;
}

.result-summary {
  margin-top: 6px;
  font-size: 13px;
  color: var(--mute);
  line-height: 1.4;
}

.search-result-header {
  padding: 12px 14px;
  border-bottom: 1px solid var(--line);
  font-size: 13px;
  color: var(--dim);
}

.search-no-result {
  padding: 40px 20px;
  text-align: center;
  color: var(--dim);
  font-size: 14px;
}

.search-stats {
  margin-top: 8px;
  padding: 8px 12px;
  background: var(--panel);
  border-radius: 6px;
  text-align: center;
  color: var(--dim);
}

/* 帮助对话框 */
.search-help-dialog {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
}

.search-help-content {
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
  background: var(--panel-strong);
  border: 1px solid var(--line-strong);
  border-radius: 12px;
  padding: 24px;
  color: var(--ink);
}

.search-help-content h3 {
  margin: 0 0 20px;
  font-size: 20px;
  color: var(--cyan);
}

.help-section {
  margin-bottom: 20px;
}

.help-section h4 {
  margin: 0 0 8px;
  font-size: 15px;
  color: var(--gold);
}

.help-section p {
  margin: 0 0 8px;
  font-size: 14px;
  color: var(--mute);
  line-height: 1.5;
}

.help-section ul {
  margin: 8px 0;
  padding-left: 20px;
  font-size: 13px;
  line-height: 1.7;
}

.help-section code {
  padding: 2px 6px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 3px;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 12px;
  color: var(--cyan);
}

.help-close-btn {
  width: 100%;
  padding: 10px;
  margin-top: 20px;
  border: 1px solid var(--line);
  border-radius: 6px;
  background: rgba(120, 215, 255, 0.12);
  color: var(--cyan);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.help-close-btn:hover {
  background: rgba(120, 215, 255, 0.2);
  border-color: var(--cyan);
}
`
