/**
 * ═══════════════════════════════════════════════════════════════
 *  可访问性增强 · Accessibility Enhancements
 * ═══════════════════════════════════════════════════════════════
 *
 * 提升 WCAG 2.1 AA 合规性：
 *  · ARIA labels for interactive elements
 *  · Keyboard navigation
 *  · Focus management
 *  · Screen reader announcements
 *  · Reduced motion support
 */

/**
 * Announce message to screen readers
 */
export function announce(message, priority = 'polite') {
  const announcer = getAnnouncer()
  announcer.setAttribute('aria-live', priority)
  announcer.textContent = message

  // Clear after announcement
  setTimeout(() => {
    announcer.textContent = ''
  }, 1000)
}

/**
 * Get or create screen reader announcer
 */
function getAnnouncer() {
  let announcer = document.getElementById('sr-announcer')
  if (!announcer) {
    announcer = document.createElement('div')
    announcer.id = 'sr-announcer'
    announcer.className = 'sr-only'
    announcer.setAttribute('aria-live', 'polite')
    announcer.setAttribute('aria-atomic', 'true')
    document.body.appendChild(announcer)

    // Add CSS for screen reader only
    const style = document.createElement('style')
    style.textContent = `
      .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border-width: 0;
      }
    `
    document.head.appendChild(style)
  }
  return announcer
}

/**
 * Add skip link for keyboard navigation
 */
export function addSkipLink() {
  const skipLink = document.createElement('a')
  skipLink.href = '#main-content'
  skipLink.className = 'skip-link'
  skipLink.textContent = '跳转到主内容'
  document.body.insertBefore(skipLink, document.body.firstChild)

  // Add CSS
  const style = document.createElement('style')
  style.textContent = `
    .skip-link {
      position: absolute;
      top: -40px;
      left: 0;
      background: var(--panel-strong, #0c111d);
      color: var(--ink, #f5f8ff);
      padding: 8px 16px;
      text-decoration: none;
      z-index: 9999;
      border-radius: 0 0 8px 0;
      transition: top 0.3s;
    }
    .skip-link:focus {
      top: 0;
      outline: 2px solid var(--cyan, #78d7ff);
      outline-offset: 2px;
    }
  `
  document.head.appendChild(style)

  // Mark main content
  const scene = document.getElementById('scene')
  if (scene) {
    scene.setAttribute('id', 'main-content')
    scene.setAttribute('role', 'application')
    scene.setAttribute('aria-label', '公式星云3D可视化')
  }
}

/**
 * Enhance focus indicators
 */
export function enhanceFocusIndicators() {
  const style = document.createElement('style')
  style.textContent = `
    *:focus-visible {
      outline: 2px solid var(--cyan, #78d7ff);
      outline-offset: 2px;
      border-radius: 4px;
    }

    /* Remove outline for mouse users but keep for keyboard */
    *:focus:not(:focus-visible) {
      outline: none;
    }

    /* High contrast focus for important interactive elements */
    button:focus-visible,
    a:focus-visible,
    input:focus-visible,
    [role="button"]:focus-visible {
      outline: 3px solid var(--cyan, #78d7ff);
      outline-offset: 3px;
    }
  `
  document.head.appendChild(style)
}

/**
 * Add ARIA labels to elements without text
 */
export function addAriaLabels() {
  // Export button
  const exportBtn = document.getElementById('export')
  if (exportBtn && !exportBtn.getAttribute('aria-label')) {
    exportBtn.setAttribute('aria-label', '导出当前视图为SVG格式')
  }

  // Search input
  const searchInput = document.querySelector('#search input')
  if (searchInput && !searchInput.getAttribute('aria-label')) {
    searchInput.setAttribute('aria-label', '搜索公式和定理')
    searchInput.setAttribute('role', 'searchbox')
  }

  // Close button
  const closeBtn = document.querySelector('#panel .close')
  if (closeBtn && !closeBtn.getAttribute('aria-label')) {
    closeBtn.setAttribute('aria-label', '关闭详情面板')
  }

  // Legend
  const legend = document.getElementById('legend')
  if (legend) {
    legend.setAttribute('role', 'region')
    legend.setAttribute('aria-label', '图例说明')
  }

  // Results
  const results = document.getElementById('results')
  if (results) {
    results.setAttribute('role', 'listbox')
    results.setAttribute('aria-label', '搜索结果')
  }

  // Panel
  const panel = document.getElementById('panel')
  if (panel) {
    panel.setAttribute('role', 'dialog')
    panel.setAttribute('aria-modal', 'false')
    panel.setAttribute('aria-label', '公式详情')
  }
}

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Check if user prefers high contrast
 */
export function prefersHighContrast() {
  return window.matchMedia('(prefers-contrast: high)').matches
}

/**
 * Add keyboard shortcuts help
 */
export function addKeyboardShortcutsHelp() {
  const shortcuts = [
    { key: '/', desc: '聚焦搜索框' },
    { key: 'Esc', desc: '关闭面板或搜索结果' },
    { key: 'Ctrl+E', desc: '导出SVG' },
    { key: '←', desc: '返回上一个节点（在详情面板中）' },
  ]

  // Add help button
  const helpBtn = document.createElement('button')
  helpBtn.id = 'keyboard-help-btn'
  helpBtn.className = 'help-btn'
  helpBtn.setAttribute('aria-label', '显示键盘快捷键帮助')
  helpBtn.textContent = '?'
  helpBtn.title = '键盘快捷键帮助'

  // Add CSS
  const style = document.createElement('style')
  style.textContent = `
    .help-btn {
      position: fixed;
      bottom: 26px;
      left: 136px;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      border: 1px solid var(--line, rgba(148,178,220,.20));
      background: var(--panel, rgba(12,17,29,.86));
      color: var(--dim, #94a8c4);
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      z-index: 100;
      backdrop-filter: blur(12px);
    }

    .help-btn:hover {
      color: var(--ink, #f5f8ff);
      border-color: var(--line-strong, rgba(148,178,220,.34));
      background: rgba(20,27,44,.9);
      transform: scale(1.1);
    }

    .help-btn:focus-visible {
      outline: 2px solid rgba(120,215,255,.45);
      outline-offset: 2px;
    }

    .shortcuts-modal {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: var(--panel-strong, rgba(12,17,29,.94));
      border: 1px solid var(--line, rgba(148,178,220,.20));
      border-radius: 12px;
      padding: 24px;
      z-index: 1000;
      max-width: 400px;
      width: 90%;
      box-shadow: 0 20px 60px rgba(0,0,0,.5);
      backdrop-filter: blur(20px);
    }

    .shortcuts-modal h2 {
      margin: 0 0 16px;
      font-size: 18px;
      color: var(--ink, #f5f8ff);
    }

    .shortcuts-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .shortcuts-list li {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid var(--line-soft, rgba(148,178,220,.12));
    }

    .shortcuts-list li:last-child {
      border-bottom: none;
    }

    .shortcuts-list kbd {
      background: rgba(148,178,220,.1);
      border: 1px solid rgba(148,178,220,.2);
      border-radius: 4px;
      padding: 4px 8px;
      font-family: 'Monaco', 'Consolas', monospace;
      font-size: 12px;
      color: var(--gold, #ffcf7a);
    }

    .shortcuts-list span {
      color: var(--mute, #c5d2e6);
      font-size: 13px;
    }

    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,.7);
      z-index: 999;
      backdrop-filter: blur(4px);
    }

    @media (max-width: 760px) {
      .help-btn {
        left: 16px;
        bottom: 54px;
      }
    }
  `
  document.head.appendChild(style)

  // Create modal
  let modal = null
  let overlay = null

  function showHelp() {
    if (modal) return

    overlay = document.createElement('div')
    overlay.className = 'modal-overlay'
    overlay.addEventListener('click', hideHelp)

    modal = document.createElement('div')
    modal.className = 'shortcuts-modal'
    modal.setAttribute('role', 'dialog')
    modal.setAttribute('aria-modal', 'true')
    modal.setAttribute('aria-labelledby', 'shortcuts-title')

    const title = document.createElement('h2')
    title.id = 'shortcuts-title'
    title.textContent = '键盘快捷键'

    const list = document.createElement('ul')
    list.className = 'shortcuts-list'

    for (const { key, desc } of shortcuts) {
      const item = document.createElement('li')
      const keyEl = document.createElement('kbd')
      keyEl.textContent = key
      const descEl = document.createElement('span')
      descEl.textContent = desc
      item.appendChild(keyEl)
      item.appendChild(descEl)
      list.appendChild(item)
    }

    modal.appendChild(title)
    modal.appendChild(list)

    document.body.appendChild(overlay)
    document.body.appendChild(modal)

    // Focus modal
    modal.setAttribute('tabindex', '-1')
    modal.focus()

    announce('键盘快捷键帮助已打开', 'assertive')
  }

  function hideHelp() {
    if (modal) {
      modal.remove()
      modal = null
    }
    if (overlay) {
      overlay.remove()
      overlay = null
    }
    helpBtn.focus()
    announce('键盘快捷键帮助已关闭', 'polite')
  }

  helpBtn.addEventListener('click', showHelp)

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal) {
      hideHelp()
    }
  })

  document.body.appendChild(helpBtn)
}

/**
 * Initialize all accessibility enhancements
 */
export function initAccessibility() {
  addSkipLink()
  enhanceFocusIndicators()
  addAriaLabels()
  addKeyboardShortcutsHelp()

  // Announce when page is ready
  window.addEventListener('load', () => {
    setTimeout(() => {
      announce('公式星云已加载完成。使用 Tab 键导航，按斜杠键搜索', 'polite')
    }, 1000)
  })

  console.log('✅ 可访问性增强已启用')
}
