/**
 * Settings Manager
 * Complete personalization system with storage and sync
 */

import SettingsStorage from './storage.js';

class SettingsManager {
  constructor(options = {}) {
    this.container = options.container || null;
    this.onSave = options.onSave || (() => {});
    this.onChange = options.onChange || (() => {});
    this.userId = options.userId || null;
    this.syncEndpoint = options.syncEndpoint || null;

    // Initialize storage
    this.storage = new SettingsStorage({
      storageKey: options.storageKey || 'formula-nebula-settings',
      syncEndpoint: this.syncEndpoint,
      userId: this.userId,
      autoSync: options.autoSync !== false
    });

    // Default settings structure
    this.currentSettings = {
      theme: 'auto',
      language: 'en',
      timezone: 'auto',
      notifications: {
        email: true,
        push: true,
        collaborationUpdates: true,
        weeklyDigest: false,
        sound: true
      },
      preferences: {
        autoSave: true,
        autoSaveInterval: 30,
        showTutorials: true,
        compactMode: false,
        enableAnimations: true,
        fontSize: 'medium',
        defaultView: 'dashboard'
      },
      privacy: {
        profileVisibility: 'private',
        shareAnalytics: true,
        dataRetention: '90days',
        twoFactorAuth: false
      },
      accessibility: {
        highContrast: false,
        reduceMotion: false,
        fontSize: 'normal',
        screenReaderMode: false,
        focusIndicator: true
      },
      shortcuts: {
        searchFocus: 'Ctrl+K',
        toggleSettings: 'Ctrl+,',
        toggleTheme: 'Ctrl+Shift+L'
      }
    };

    this.themes = [
      { id: 'light', label: '浅色', icon: '☀️' },
      { id: 'dark', label: '深色', icon: '🌙' },
      { id: 'auto', label: '自动', icon: '⚙️' }
    ];

    this.languages = [
      { code: 'en', name: 'English' },
      { code: 'zh', name: '中文' },
      { code: 'es', name: 'Español' },
      { code: 'fr', name: 'Français' },
      { code: 'de', name: 'Deutsch' },
      { code: 'ja', name: '日本語' },
      { code: 'pt', name: 'Português' },
      { code: 'ru', name: 'Русский' }
    ];

    this.fontSizes = ['small', 'medium', 'large', 'xlarge'];
    this.init();
  }

  async init() {
    // Load settings from storage
    const saved = this.storage.loadLocal();
    if (saved) {
      this.currentSettings = this.mergeSettings(this.currentSettings, saved);
    }

    // Sync with server if available
    if (this.syncEndpoint && this.userId) {
      const synced = await this.storage.sync();
      if (synced) {
        this.currentSettings = this.mergeSettings(this.currentSettings, synced);
      }
    }

    if (this.container) {
      this.render();
      this.attachEventListeners();
      this.applySettings();
    }
  }

  /**
   * Save settings
   */
  async saveSettings() {
    // Save to local storage
    this.storage.saveLocal(this.currentSettings);

    // Apply settings to UI
    this.applySettings();

    // Notify callbacks
    this.onSave(this.currentSettings);
    this.onChange(this.currentSettings);

    // Show success message
    this.showNotification('设置已保存', 'success');
  }

  /**
   * Apply settings to the UI and environment
   */
  applySettings() {
    this.applyTheme(this.currentSettings.theme);
    this.applyLanguage(this.currentSettings.language);
    this.applyAccessibilitySettings();
    this.applyFontSize(this.currentSettings.preferences.fontSize);
    this.applyAnimationSettings();
    this.applyTimezone(this.currentSettings.timezone);
  }

  /**
   * Apply theme
   */
  applyTheme(theme) {
    const html = document.documentElement;
    const isDark = theme === 'dark' || (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    if (isDark) {
      html.setAttribute('data-theme', 'dark');
      html.classList.add('dark-mode');
    } else {
      html.setAttribute('data-theme', 'light');
      html.classList.remove('dark-mode');
    }

    // Store in localStorage for persistence
    localStorage.setItem('app-theme', theme);
  }

  /**
   * Apply language
   */
  applyLanguage(lang) {
    document.documentElement.lang = lang;
    localStorage.setItem('app-language', lang);
    window.dispatchEvent(new CustomEvent('language-changed', { detail: { language: lang } }));
  }

  /**
   * Apply timezone
   */
  applyTimezone(timezone) {
    if (timezone !== 'auto') {
      localStorage.setItem('app-timezone', timezone);
      window.dispatchEvent(new CustomEvent('timezone-changed', { detail: { timezone } }));
    }
  }

  /**
   * Apply accessibility settings
   */
  applyAccessibilitySettings() {
    const { highContrast, reduceMotion, screenReaderMode, focusIndicator } = this.currentSettings.accessibility;
    const html = document.documentElement;

    highContrast ? html.classList.add('high-contrast') : html.classList.remove('high-contrast');
    reduceMotion ? html.classList.add('reduce-motion') : html.classList.remove('reduce-motion');
    screenReaderMode ? html.classList.add('screen-reader-mode') : html.classList.remove('screen-reader-mode');
    focusIndicator ? html.classList.add('focus-indicator') : html.classList.remove('focus-indicator');
  }

  /**
   * Apply font size
   */
  applyFontSize(size) {
    const sizes = {
      small: '14px',
      medium: '16px',
      large: '18px',
      xlarge: '20px'
    };
    document.documentElement.style.fontSize = sizes[size] || sizes.medium;
  }

  /**
   * Apply animation settings
   */
  applyAnimationSettings() {
    const duration = this.currentSettings.preferences.enableAnimations ? '0.3s' : '0s';
    document.documentElement.style.setProperty('--transition-duration', duration);
  }

  /**
   * Merge settings objects
   */
  mergeSettings(defaults, updates) {
    const result = JSON.parse(JSON.stringify(defaults));

    const merge = (target, source) => {
      for (const key in source) {
        if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
          target[key] = target[key] || {};
          merge(target[key], source[key]);
        } else {
          target[key] = source[key];
        }
      }
    };

    merge(result, updates);
    return result;
  }

  /**
   * Render settings panel
   */
  render() {
    const settingsHTML = `
      <div class="settings-panel-container">
        <div class="settings-panel">
          <div class="settings-header">
            <h1>个性化设置</h1>
            <button class="close-btn" aria-label="关闭设置">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <div class="settings-content">
            <div class="settings-sidebar">
              <nav class="settings-nav">
                <button class="nav-item active" data-section="appearance">外观</button>
                <button class="nav-item" data-section="notifications">通知</button>
                <button class="nav-item" data-section="preferences">偏好设置</button>
                <button class="nav-item" data-section="privacy">隐私与安全</button>
                <button class="nav-item" data-section="accessibility">无障碍</button>
                <button class="nav-item" data-section="shortcuts">快捷键</button>
                <button class="nav-item" data-section="data">数据管理</button>
              </nav>
            </div>

            <div class="settings-main">
              ${this.renderAppearanceSection()}
              ${this.renderNotificationsSection()}
              ${this.renderPreferencesSection()}
              ${this.renderPrivacySection()}
              ${this.renderAccessibilitySection()}
              ${this.renderShortcutsSection()}
              ${this.renderDataSection()}
            </div>
          </div>

          <div class="settings-footer">
            <div class="sync-status">
              <span id="sync-indicator" class="sync-indicator idle" title="同步状态">●</span>
              <span id="sync-text">就绪</span>
              <span id="last-sync" class="last-sync-time"></span>
            </div>
            <div class="settings-actions">
              <button class="btn btn-secondary" id="reset-btn">恢复默认值</button>
              <button class="btn btn-primary" id="save-btn">保存更改</button>
            </div>
          </div>
        </div>
      </div>
    `;

    if (this.container) {
      this.container.innerHTML = settingsHTML;
    }
  }

  /**
   * Render appearance section
   */
  renderAppearanceSection() {
    return `
      <section class="settings-section active" data-section="appearance">
        <h2>外观设置</h2>

        <div class="setting-group">
          <label class="setting-label">主题</label>
          <div class="theme-selector">
            ${this.themes.map(theme => `
              <button class="theme-option ${this.currentSettings.theme === theme.id ? 'active' : ''}"
                      data-theme="${theme.id}"
                      aria-label="选择${theme.label}主题">
                <span class="theme-icon">${theme.icon}</span>
                <span class="theme-name">${theme.label}</span>
              </button>
            `).join('')}
          </div>
        </div>

        <div class="setting-group">
          <label class="setting-label" for="language-select">语言</label>
          <select id="language-select" class="settings-select" data-setting="language">
            ${this.languages.map(lang => `
              <option value="${lang.code}" ${this.currentSettings.language === lang.code ? 'selected' : ''}>
                ${lang.name}
              </option>
            `).join('')}
          </select>
        </div>

        <div class="setting-group">
          <label class="setting-label" for="font-size-select">字体大小</label>
          <select id="font-size-select" class="settings-select" data-setting="fontSize">
            <option value="small" ${this.currentSettings.preferences.fontSize === 'small' ? 'selected' : ''}>小</option>
            <option value="medium" ${this.currentSettings.preferences.fontSize === 'medium' ? 'selected' : ''}>中</option>
            <option value="large" ${this.currentSettings.preferences.fontSize === 'large' ? 'selected' : ''}>大</option>
            <option value="xlarge" ${this.currentSettings.preferences.fontSize === 'xlarge' ? 'selected' : ''}>超大</option>
          </select>
        </div>

        <div class="setting-group">
          <label class="setting-toggle">
            <input type="checkbox" class="toggle-checkbox" data-setting="enableAnimations"
                   ${this.currentSettings.preferences.enableAnimations ? 'checked' : ''}>
            <span class="toggle-label">启用动画</span>
          </label>
          <p class="setting-description">平滑过渡和动画效果</p>
        </div>

        <div class="setting-group">
          <label class="setting-toggle">
            <input type="checkbox" class="toggle-checkbox" data-setting="compactMode"
                   ${this.currentSettings.preferences.compactMode ? 'checked' : ''}>
            <span class="toggle-label">紧凑模式</span>
          </label>
          <p class="setting-description">减少间距，增加信息密度</p>
        </div>
      </section>
    `;
  }

  /**
   * Render notifications section
   */
  renderNotificationsSection() {
    return `
      <section class="settings-section" data-section="notifications">
        <h2>通知设置</h2>

        <div class="setting-group">
          <label class="setting-toggle">
            <input type="checkbox" class="toggle-checkbox" data-setting="email"
                   ${this.currentSettings.notifications.email ? 'checked' : ''}>
            <span class="toggle-label">邮件通知</span>
          </label>
          <p class="setting-description">接收重要更新通知</p>
        </div>

        <div class="setting-group">
          <label class="setting-toggle">
            <input type="checkbox" class="toggle-checkbox" data-setting="push"
                   ${this.currentSettings.notifications.push ? 'checked' : ''}>
            <span class="toggle-label">推送通知</span>
          </label>
          <p class="setting-description">接收浏览器推送通知</p>
        </div>

        <div class="setting-group">
          <label class="setting-toggle">
            <input type="checkbox" class="toggle-checkbox" data-setting="collaborationUpdates"
                   ${this.currentSettings.notifications.collaborationUpdates ? 'checked' : ''}>
            <span class="toggle-label">协作更新</span>
          </label>
          <p class="setting-description">合作者加入或进行更改时通知我</p>
        </div>

        <div class="setting-group">
          <label class="setting-toggle">
            <input type="checkbox" class="toggle-checkbox" data-setting="weeklyDigest"
                   ${this.currentSettings.notifications.weeklyDigest ? 'checked' : ''}>
            <span class="toggle-label">周报</span>
          </label>
          <p class="setting-description">接收每周活动摘要</p>
        </div>

        <div class="setting-group">
          <label class="setting-toggle">
            <input type="checkbox" class="toggle-checkbox" data-setting="sound"
                   ${this.currentSettings.notifications.sound ? 'checked' : ''}>
            <span class="toggle-label">通知音效</span>
          </label>
          <p class="setting-description">播放通知声音</p>
        </div>
      </section>
    `;
  }

  /**
   * Render preferences section
   */
  renderPreferencesSection() {
    return `
      <section class="settings-section" data-section="preferences">
        <h2>偏好设置</h2>

        <div class="setting-group">
          <label class="setting-toggle">
            <input type="checkbox" class="toggle-checkbox" data-setting="autoSave"
                   ${this.currentSettings.preferences.autoSave ? 'checked' : ''}>
            <span class="toggle-label">自动保存</span>
          </label>
          <p class="setting-description">每${this.currentSettings.preferences.autoSaveInterval}秒自动保存工作</p>
        </div>

        <div class="setting-group">
          <label class="setting-label" for="autosave-interval">自动保存间隔（秒）</label>
          <input type="number" id="autosave-interval" class="settings-input"
                 min="10" max="300" step="10"
                 value="${this.currentSettings.preferences.autoSaveInterval}"
                 data-setting="autoSaveInterval">
        </div>

        <div class="setting-group">
          <label class="setting-toggle">
            <input type="checkbox" class="toggle-checkbox" data-setting="showTutorials"
                   ${this.currentSettings.preferences.showTutorials ? 'checked' : ''}>
            <span class="toggle-label">显示教程</span>
          </label>
          <p class="setting-description">显示新功能提示和教程</p>
        </div>

        <div class="setting-group">
          <label class="setting-label" for="default-view">默认视图</label>
          <select id="default-view" class="settings-select" data-setting="defaultView">
            <option value="dashboard" ${this.currentSettings.preferences.defaultView === 'dashboard' ? 'selected' : ''}>仪表板</option>
            <option value="editor" ${this.currentSettings.preferences.defaultView === 'editor' ? 'selected' : ''}>编辑器</option>
            <option value="explore" ${this.currentSettings.preferences.defaultView === 'explore' ? 'selected' : ''}>探索</option>
          </select>
        </div>
      </section>
    `;
  }

  /**
   * Render privacy section
   */
  renderPrivacySection() {
    return `
      <section class="settings-section" data-section="privacy">
        <h2>隐私与安全</h2>

        <div class="setting-group">
          <label class="setting-label" for="profile-visibility">个人资料可见性</label>
          <select id="profile-visibility" class="settings-select" data-setting="profileVisibility">
            <option value="private" ${this.currentSettings.privacy.profileVisibility === 'private' ? 'selected' : ''}>私有</option>
            <option value="friends" ${this.currentSettings.privacy.profileVisibility === 'friends' ? 'selected' : ''}>仅好友</option>
            <option value="public" ${this.currentSettings.privacy.profileVisibility === 'public' ? 'selected' : ''}>公开</option>
          </select>
        </div>

        <div class="setting-group">
          <label class="setting-toggle">
            <input type="checkbox" class="toggle-checkbox" data-setting="shareAnalytics"
                   ${this.currentSettings.privacy.shareAnalytics ? 'checked' : ''}>
            <span class="toggle-label">分享使用分析</span>
          </label>
          <p class="setting-description">帮助改进通过分享匿名使用数据</p>
        </div>

        <div class="setting-group">
          <label class="setting-label" for="data-retention">数据保留期限</label>
          <select id="data-retention" class="settings-select" data-setting="dataRetention">
            <option value="30days" ${this.currentSettings.privacy.dataRetention === '30days' ? 'selected' : ''}>30天</option>
            <option value="90days" ${this.currentSettings.privacy.dataRetention === '90days' ? 'selected' : ''}>90天</option>
            <option value="1year" ${this.currentSettings.privacy.dataRetention === '1year' ? 'selected' : ''}>1年</option>
            <option value="forever" ${this.currentSettings.privacy.dataRetention === 'forever' ? 'selected' : ''}>永远</option>
          </select>
        </div>

        <div class="setting-group">
          <label class="setting-toggle">
            <input type="checkbox" class="toggle-checkbox" data-setting="twoFactorAuth"
                   ${this.currentSettings.privacy.twoFactorAuth ? 'checked' : ''}>
            <span class="toggle-label">双因素认证</span>
          </label>
          <p class="setting-description">为您的账户增加额外的安全保护</p>
        </div>
      </section>
    `;
  }

  /**
   * Render accessibility section
   */
  renderAccessibilitySection() {
    return `
      <section class="settings-section" data-section="accessibility">
        <h2>无障碍设置</h2>

        <div class="setting-group">
          <label class="setting-toggle">
            <input type="checkbox" class="toggle-checkbox" data-setting="highContrast"
                   ${this.currentSettings.accessibility.highContrast ? 'checked' : ''}>
            <span class="toggle-label">高对比度模式</span>
          </label>
          <p class="setting-description">增加对比度以便更好地查看</p>
        </div>

        <div class="setting-group">
          <label class="setting-toggle">
            <input type="checkbox" class="toggle-checkbox" data-setting="reduceMotion"
                   ${this.currentSettings.accessibility.reduceMotion ? 'checked' : ''}>
            <span class="toggle-label">减少动画</span>
          </label>
          <p class="setting-description">最小化动画和过渡</p>
        </div>

        <div class="setting-group">
          <label class="setting-toggle">
            <input type="checkbox" class="toggle-checkbox" data-setting="screenReaderMode"
                   ${this.currentSettings.accessibility.screenReaderMode ? 'checked' : ''}>
            <span class="toggle-label">屏幕阅读器模式</span>
          </label>
          <p class="setting-description">为屏幕阅读器优化界面</p>
        </div>

        <div class="setting-group">
          <label class="setting-toggle">
            <input type="checkbox" class="toggle-checkbox" data-setting="focusIndicator"
                   ${this.currentSettings.accessibility.focusIndicator ? 'checked' : ''}>
            <span class="toggle-label">焦点指示器</span>
          </label>
          <p class="setting-description">显示清晰的键盘焦点指示</p>
        </div>
      </section>
    `;
  }

  /**
   * Render shortcuts section
   */
  renderShortcutsSection() {
    return `
      <section class="settings-section" data-section="shortcuts">
        <h2>快捷键</h2>

        <div class="shortcuts-list">
          <div class="shortcut-item">
            <span class="shortcut-name">搜索焦点</span>
            <kbd class="shortcut-key">${this.currentSettings.shortcuts.searchFocus}</kbd>
          </div>
          <div class="shortcut-item">
            <span class="shortcut-name">打开设置</span>
            <kbd class="shortcut-key">${this.currentSettings.shortcuts.toggleSettings}</kbd>
          </div>
          <div class="shortcut-item">
            <span class="shortcut-name">切换主题</span>
            <kbd class="shortcut-key">${this.currentSettings.shortcuts.toggleTheme}</kbd>
          </div>
        </div>

        <p class="setting-description" style="margin-top: 1rem;">可自定义快捷键功能即将推出</p>
      </section>
    `;
  }

  /**
   * Render data management section
   */
  renderDataSection() {
    return `
      <section class="settings-section" data-section="data">
        <h2>数据管理</h2>

        <div class="data-actions">
          <div class="action-group">
            <h3>导出设置</h3>
            <p class="setting-description">将您的所有设置下载为 JSON 文件</p>
            <button class="btn btn-secondary" id="export-settings-btn">导出</button>
          </div>

          <div class="action-group">
            <h3>导入设置</h3>
            <p class="setting-description">从 JSON 文件导入设置</p>
            <input type="file" id="import-settings-input" accept=".json" style="display: none;">
            <button class="btn btn-secondary" id="import-settings-btn">导入</button>
          </div>

          <div class="action-group">
            <h3>清除所有数据</h3>
            <p class="setting-description" style="color: #dc2626;">此操作不可逆转</p>
            <button class="btn btn-danger" id="clear-data-btn">清除</button>
          </div>
        </div>
      </section>
    `;
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    // Navigation
    document.querySelectorAll('.settings-nav .nav-item').forEach(btn => {
      btn.addEventListener('click', (e) => this.switchSection(e.target.dataset.section));
    });

    // Theme selection
    document.querySelectorAll('.theme-option').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const theme = e.currentTarget.dataset.theme;
        this.currentSettings.theme = theme;
        document.querySelectorAll('.theme-option').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
      });
    });

    // Select inputs
    document.querySelectorAll('.settings-select').forEach(select => {
      select.addEventListener('change', (e) => {
        this.updateNestedSetting(e.target.dataset.setting, e.target.value);
      });
    });

    // Number inputs
    document.querySelectorAll('.settings-input').forEach(input => {
      input.addEventListener('change', (e) => {
        this.updateNestedSetting(e.target.dataset.setting, parseInt(e.target.value));
      });
    });

    // Toggle checkboxes
    document.querySelectorAll('.toggle-checkbox').forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        this.updateNestedSetting(e.target.dataset.setting, e.target.checked);
      });
    });

    // Close button
    if (document.querySelector('.close-btn')) {
      document.querySelector('.close-btn').addEventListener('click', () => this.close());
    }

    // Buttons
    if (document.getElementById('save-btn')) {
      document.getElementById('save-btn').addEventListener('click', () => this.saveSettings());
    }
    if (document.getElementById('reset-btn')) {
      document.getElementById('reset-btn').addEventListener('click', () => this.resetToDefaults());
    }

    // Data management
    if (document.getElementById('export-settings-btn')) {
      document.getElementById('export-settings-btn').addEventListener('click', () => this.exportSettings());
    }
    if (document.getElementById('import-settings-btn')) {
      document.getElementById('import-settings-btn').addEventListener('click', () => {
        document.getElementById('import-settings-input').click();
      });
    }
    if (document.getElementById('import-settings-input')) {
      document.getElementById('import-settings-input').addEventListener('change', (e) => this.importSettings(e));
    }
    if (document.getElementById('clear-data-btn')) {
      document.getElementById('clear-data-btn').addEventListener('click', () => this.clearAllData());
    }
  }

  /**
   * Switch section
   */
  switchSection(section) {
    document.querySelectorAll('.settings-nav .nav-item').forEach(btn => {
      btn.classList.remove('active');
    });
    document.querySelector(`[data-section="${section}"]`).classList.add('active');

    document.querySelectorAll('.settings-section').forEach(sec => {
      sec.classList.remove('active');
    });
    document.querySelector(`.settings-section[data-section="${section}"]`).classList.add('active');
  }

  /**
   * Update nested setting
   */
  updateNestedSetting(path, value) {
    const parts = path.split('.');
    let current = this.currentSettings.preferences || this.currentSettings.notifications || this.currentSettings.accessibility || this.currentSettings.privacy || this.currentSettings;

    // Handle non-nested settings
    if (!path.includes('.')) {
      this.currentSettings[path] = value;
      return;
    }

    for (let i = 0; i < parts.length - 1; i++) {
      if (!current[parts[i]]) {
        current[parts[i]] = {};
      }
      current = current[parts[i]];
    }

    current[parts[parts.length - 1]] = value;
  }

  /**
   * Reset to defaults
   */
  resetToDefaults() {
    if (confirm('您确定要将所有设置恢复为默认值吗？')) {
      this.currentSettings = JSON.parse(JSON.stringify({
        theme: 'auto',
        language: 'en',
        timezone: 'auto',
        notifications: {
          email: true,
          push: true,
          collaborationUpdates: true,
          weeklyDigest: false,
          sound: true
        },
        preferences: {
          autoSave: true,
          autoSaveInterval: 30,
          showTutorials: true,
          compactMode: false,
          enableAnimations: true,
          fontSize: 'medium',
          defaultView: 'dashboard'
        },
        privacy: {
          profileVisibility: 'private',
          shareAnalytics: true,
          dataRetention: '90days',
          twoFactorAuth: false
        },
        accessibility: {
          highContrast: false,
          reduceMotion: false,
          fontSize: 'normal',
          screenReaderMode: false,
          focusIndicator: true
        },
        shortcuts: {
          searchFocus: 'Ctrl+K',
          toggleSettings: 'Ctrl+,',
          toggleTheme: 'Ctrl+Shift+L'
        }
      }));
      this.render();
      this.attachEventListeners();
      this.saveSettings();
    }
  }

  /**
   * Export settings
   */
  exportSettings() {
    const json = JSON.stringify(this.currentSettings, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `formula-nebula-settings-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    this.showNotification('设置已导出', 'success');
  }

  /**
   * Import settings
   */
  importSettings(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const settings = JSON.parse(e.target.result);
        this.currentSettings = this.mergeSettings(this.currentSettings, settings);
        this.storage.saveLocal(this.currentSettings);
        this.render();
        this.attachEventListeners();
        this.applySettings();
        this.showNotification('设置已导入', 'success');
      } catch (error) {
        this.showNotification('导入失败：' + error.message, 'error');
      }
    };
    reader.readAsText(file);
  }

  /**
   * Clear all data
   */
  clearAllData() {
    if (confirm('您确定要清除所有数据吗？此操作不可逆转。')) {
      if (confirm('最后确认：删除所有设置和本地数据？')) {
        this.storage.clear();
        this.currentSettings = {};
        this.showNotification('所有数据已清除', 'success');
        setTimeout(() => window.location.reload(), 1000);
      }
    }
  }

  /**
   * Show notification
   */
  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      padding: 12px 20px;
      border-radius: 4px;
      background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
      color: white;
      z-index: 10000;
      animation: slideIn 0.3s ease-out;
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
  }

  /**
   * Close settings panel
   */
  close() {
    if (this.container) {
      this.container.classList.remove('active');
    }
  }

  /**
   * Open settings panel
   */
  open() {
    if (this.container) {
      this.container.classList.add('active');
    }
  }

  /**
   * Get current settings
   */
  getSettings() {
    return JSON.parse(JSON.stringify(this.currentSettings));
  }

  /**
   * Destroy and cleanup
   */
  destroy() {
    this.storage.destroy();
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SettingsManager;
}
