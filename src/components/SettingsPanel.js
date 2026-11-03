/**
 * SettingsPanel.js - Comprehensive settings panel for Formula Nebula
 * Manages user preferences, themes, languages, and notifications
 */

class SettingsPanel {
  constructor(options = {}) {
    this.container = options.container || null;
    this.onSave = options.onSave || (() => {});
    this.currentSettings = {
      theme: 'auto',
      language: 'en',
      notifications: {
        email: true,
        push: true,
        collaborationUpdates: true,
        weeklyDigest: false
      },
      preferences: {
        autoSave: true,
        showTutorials: true,
        compactMode: false,
        enableAnimations: true,
        fontSize: 'medium'
      },
      privacy: {
        profileVisibility: 'private',
        shareAnalytics: true,
        dataRetention: '90days'
      },
      accessibility: {
        highContrast: false,
        reduceMotion: false,
        fontSize: 'normal',
        screenReaderMode: false
      }
    };

    this.themes = [
      { id: 'light', label: 'Light', icon: '☀️' },
      { id: 'dark', label: 'Dark', icon: '🌙' },
      { id: 'auto', label: 'Auto', icon: '⚙️' }
    ];

    this.languages = [
      { code: 'en', name: 'English' },
      { code: 'zh', name: '中文' },
      { code: 'es', name: 'Español' },
      { code: 'fr', name: 'Français' },
      { code: 'de', name: 'Deutsch' },
      { code: 'ja', name: '日本語' }
    ];

    this.fontSizes = ['small', 'medium', 'large', 'xlarge'];
    this.init();
  }

  init() {
    this.loadSettings();
    if (this.container) {
      this.render();
      this.attachEventListeners();
    }
  }

  loadSettings() {
    const saved = localStorage.getItem('formula-nebula-settings');
    if (saved) {
      try {
        this.currentSettings = {
          ...this.currentSettings,
          ...JSON.parse(saved)
        };
      } catch (e) {
        console.error('Failed to load settings:', e);
      }
    }
  }

  saveSettings() {
    localStorage.setItem('formula-nebula-settings', JSON.stringify(this.currentSettings));
    this.applySettings();
    this.onSave(this.currentSettings);
  }

  applySettings() {
    // Apply theme
    this.applyTheme(this.currentSettings.theme);

    // Apply language
    this.applyLanguage(this.currentSettings.language);

    // Apply accessibility settings
    this.applyAccessibilitySettings();

    // Apply font size
    this.applyFontSize(this.currentSettings.preferences.fontSize);

    // Apply animations
    this.applyAnimationSettings();
  }

  applyTheme(theme) {
    const html = document.documentElement;
    const isDark = theme === 'dark' || (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    if (isDark) {
      html.setAttribute('data-theme', 'dark');
    } else {
      html.setAttribute('data-theme', 'light');
    }
  }

  applyLanguage(lang) {
    document.documentElement.lang = lang;
    // Trigger language change event for other components
    window.dispatchEvent(new CustomEvent('language-changed', { detail: { language: lang } }));
  }

  applyAccessibilitySettings() {
    const { highContrast, reduceMotion, screenReaderMode } = this.currentSettings.accessibility;
    const html = document.documentElement;

    if (highContrast) {
      html.classList.add('high-contrast');
    } else {
      html.classList.remove('high-contrast');
    }

    if (reduceMotion) {
      html.classList.add('reduce-motion');
    } else {
      html.classList.remove('reduce-motion');
    }

    if (screenReaderMode) {
      html.classList.add('screen-reader-mode');
    } else {
      html.classList.remove('screen-reader-mode');
    }
  }

  applyFontSize(size) {
    const sizes = {
      small: '14px',
      medium: '16px',
      large: '18px',
      xlarge: '20px'
    };
    document.documentElement.style.fontSize = sizes[size] || sizes.medium;
  }

  applyAnimationSettings() {
    if (!this.currentSettings.preferences.enableAnimations) {
      document.documentElement.style.setProperty('--transition-duration', '0s');
    } else {
      document.documentElement.style.setProperty('--transition-duration', '0.3s');
    }
  }

  render() {
    const settingsHTML = `
      <div class="settings-panel">
        <div class="settings-header">
          <h1>Settings</h1>
          <button class="close-btn" aria-label="Close settings">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div class="settings-content">
          <div class="settings-sidebar">
            <nav class="settings-nav">
              <button class="nav-item active" data-section="appearance">Appearance</button>
              <button class="nav-item" data-section="notifications">Notifications</button>
              <button class="nav-item" data-section="preferences">Preferences</button>
              <button class="nav-item" data-section="privacy">Privacy & Security</button>
              <button class="nav-item" data-section="accessibility">Accessibility</button>
            </nav>
          </div>

          <div class="settings-main">
            <!-- Appearance Section -->
            <section class="settings-section active" data-section="appearance">
              <h2>Appearance</h2>

              <div class="setting-group">
                <label class="setting-label">Theme</label>
                <div class="theme-selector">
                  ${this.themes.map(theme => `
                    <button class="theme-option ${this.currentSettings.theme === theme.id ? 'active' : ''}"
                            data-theme="${theme.id}"
                            aria-label="Select ${theme.label} theme">
                      <span class="theme-icon">${theme.icon}</span>
                      <span class="theme-name">${theme.label}</span>
                    </button>
                  `).join('')}
                </div>
              </div>

              <div class="setting-group">
                <label class="setting-label" for="language-select">Language</label>
                <select id="language-select" class="settings-select" data-setting="language">
                  ${this.languages.map(lang => `
                    <option value="${lang.code}" ${this.currentSettings.language === lang.code ? 'selected' : ''}>
                      ${lang.name}
                    </option>
                  `).join('')}
                </select>
              </div>

              <div class="setting-group">
                <label class="setting-label" for="font-size-select">Font Size</label>
                <select id="font-size-select" class="settings-select" data-setting="fontSize">
                  <option value="small" ${this.currentSettings.preferences.fontSize === 'small' ? 'selected' : ''}>Small</option>
                  <option value="medium" ${this.currentSettings.preferences.fontSize === 'medium' ? 'selected' : ''}>Medium</option>
                  <option value="large" ${this.currentSettings.preferences.fontSize === 'large' ? 'selected' : ''}>Large</option>
                  <option value="xlarge" ${this.currentSettings.preferences.fontSize === 'xlarge' ? 'selected' : ''}>Extra Large</option>
                </select>
              </div>

              <div class="setting-group">
                <label class="setting-toggle">
                  <input type="checkbox" class="toggle-checkbox" data-setting="enableAnimations"
                         ${this.currentSettings.preferences.enableAnimations ? 'checked' : ''}>
                  <span class="toggle-label">Enable Animations</span>
                </label>
                <p class="setting-description">Smooth transitions and animations for a polished experience</p>
              </div>

              <div class="setting-group">
                <label class="setting-toggle">
                  <input type="checkbox" class="toggle-checkbox" data-setting="compactMode"
                         ${this.currentSettings.preferences.compactMode ? 'checked' : ''}>
                  <span class="toggle-label">Compact Mode</span>
                </label>
                <p class="setting-description">Reduce spacing and increase information density</p>
              </div>
            </section>

            <!-- Notifications Section -->
            <section class="settings-section" data-section="notifications">
              <h2>Notifications</h2>

              <div class="setting-group">
                <label class="setting-toggle">
                  <input type="checkbox" class="toggle-checkbox" data-setting="email"
                         ${this.currentSettings.notifications.email ? 'checked' : ''}>
                  <span class="toggle-label">Email Notifications</span>
                </label>
                <p class="setting-description">Receive important updates via email</p>
              </div>

              <div class="setting-group">
                <label class="setting-toggle">
                  <input type="checkbox" class="toggle-checkbox" data-setting="push"
                         ${this.currentSettings.notifications.push ? 'checked' : ''}>
                  <span class="toggle-label">Push Notifications</span>
                </label>
                <p class="setting-description">Receive browser push notifications</p>
              </div>

              <div class="setting-group">
                <label class="setting-toggle">
                  <input type="checkbox" class="toggle-checkbox" data-setting="collaborationUpdates"
                         ${this.currentSettings.notifications.collaborationUpdates ? 'checked' : ''}>
                  <span class="toggle-label">Collaboration Updates</span>
                </label>
                <p class="setting-description">Notify me when collaborators join or make changes</p>
              </div>

              <div class="setting-group">
                <label class="setting-toggle">
                  <input type="checkbox" class="toggle-checkbox" data-setting="weeklyDigest"
                         ${this.currentSettings.notifications.weeklyDigest ? 'checked' : ''}>
                  <span class="toggle-label">Weekly Digest</span>
                </label>
                <p class="setting-description">Receive a weekly summary of your activity</p>
              </div>
            </section>

            <!-- Preferences Section -->
            <section class="settings-section" data-section="preferences">
              <h2>Preferences</h2>

              <div class="setting-group">
                <label class="setting-toggle">
                  <input type="checkbox" class="toggle-checkbox" data-setting="autoSave"
                         ${this.currentSettings.preferences.autoSave ? 'checked' : ''}>
                  <span class="toggle-label">Auto-save Documents</span>
                </label>
                <p class="setting-description">Automatically save your work every 30 seconds</p>
              </div>

              <div class="setting-group">
                <label class="setting-toggle">
                  <input type="checkbox" class="toggle-checkbox" data-setting="showTutorials"
                         ${this.currentSettings.preferences.showTutorials ? 'checked' : ''}>
                  <span class="toggle-label">Show Tutorials</span>
                </label>
                <p class="setting-description">Display helpful tips and tutorials for new features</p>
              </div>
            </section>

            <!-- Privacy Section -->
            <section class="settings-section" data-section="privacy">
              <h2>Privacy & Security</h2>

              <div class="setting-group">
                <label class="setting-label" for="profile-visibility">Profile Visibility</label>
                <select id="profile-visibility" class="settings-select" data-setting="profileVisibility">
                  <option value="private" ${this.currentSettings.privacy.profileVisibility === 'private' ? 'selected' : ''}>Private</option>
                  <option value="friends" ${this.currentSettings.privacy.profileVisibility === 'friends' ? 'selected' : ''}>Friends Only</option>
                  <option value="public" ${this.currentSettings.privacy.profileVisibility === 'public' ? 'selected' : ''}>Public</option>
                </select>
              </div>

              <div class="setting-group">
                <label class="setting-toggle">
                  <input type="checkbox" class="toggle-checkbox" data-setting="shareAnalytics"
                         ${this.currentSettings.privacy.shareAnalytics ? 'checked' : ''}>
                  <span class="toggle-label">Share Usage Analytics</span>
                </label>
                <p class="setting-description">Help improve Formula Nebula by sharing anonymous usage data</p>
              </div>

              <div class="setting-group">
                <label class="setting-label" for="data-retention">Data Retention</label>
                <select id="data-retention" class="settings-select" data-setting="dataRetention">
                  <option value="30days" ${this.currentSettings.privacy.dataRetention === '30days' ? 'selected' : ''}>30 Days</option>
                  <option value="90days" ${this.currentSettings.privacy.dataRetention === '90days' ? 'selected' : ''}>90 Days</option>
                  <option value="1year" ${this.currentSettings.privacy.dataRetention === '1year' ? 'selected' : ''}>1 Year</option>
                  <option value="forever" ${this.currentSettings.privacy.dataRetention === 'forever' ? 'selected' : ''}>Forever</option>
                </select>
              </div>
            </section>

            <!-- Accessibility Section -->
            <section class="settings-section" data-section="accessibility">
              <h2>Accessibility</h2>

              <div class="setting-group">
                <label class="setting-toggle">
                  <input type="checkbox" class="toggle-checkbox" data-setting="highContrast"
                         ${this.currentSettings.accessibility.highContrast ? 'checked' : ''}>
                  <span class="toggle-label">High Contrast Mode</span>
                </label>
                <p class="setting-description">Increase contrast for better visibility</p>
              </div>

              <div class="setting-group">
                <label class="setting-toggle">
                  <input type="checkbox" class="toggle-checkbox" data-setting="reduceMotion"
                         ${this.currentSettings.accessibility.reduceMotion ? 'checked' : ''}>
                  <span class="toggle-label">Reduce Motion</span>
                </label>
                <p class="setting-description">Minimize animations and transitions</p>
              </div>

              <div class="setting-group">
                <label class="setting-toggle">
                  <input type="checkbox" class="toggle-checkbox" data-setting="screenReaderMode"
                         ${this.currentSettings.accessibility.screenReaderMode ? 'checked' : ''}>
                  <span class="toggle-label">Screen Reader Mode</span>
                </label>
                <p class="setting-description">Optimize interface for screen readers</p>
              </div>
            </section>
          </div>
        </div>

        <div class="settings-footer">
          <button class="btn-secondary" id="reset-btn">Reset to Defaults</button>
          <button class="btn-primary" id="save-btn">Save Changes</button>
        </div>
      </div>
    `;

    this.container.innerHTML = settingsHTML;
  }

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

    // Toggle checkboxes
    document.querySelectorAll('.toggle-checkbox').forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        this.updateNestedSetting(e.target.dataset.setting, e.target.checked);
      });
    });

    // Close button
    document.querySelector('.close-btn').addEventListener('click', () => {
      this.close();
    });

    // Buttons
    document.getElementById('save-btn').addEventListener('click', () => this.saveSettings());
    document.getElementById('reset-btn').addEventListener('click', () => this.resetToDefaults());
  }

  updateNestedSetting(path, value) {
    const parts = path.split('.');
    let current = this.currentSettings;

    for (let i = 0; i < parts.length - 1; i++) {
      if (!current[parts[i]]) {
        current[parts[i]] = {};
      }
      current = current[parts[i]];
    }

    current[parts[parts.length - 1]] = value;
  }

  switchSection(section) {
    // Update nav
    document.querySelectorAll('.settings-nav .nav-item').forEach(btn => {
      btn.classList.remove('active');
      if (btn.dataset.section === section) {
        btn.classList.add('active');
      }
    });

    // Update sections
    document.querySelectorAll('.settings-section').forEach(sec => {
      sec.classList.remove('active');
      if (sec.dataset.section === section) {
        sec.classList.add('active');
      }
    });
  }

  resetToDefaults() {
    if (confirm('Are you sure you want to reset all settings to their default values?')) {
      this.currentSettings = {
        theme: 'auto',
        language: 'en',
        notifications: {
          email: true,
          push: true,
          collaborationUpdates: true,
          weeklyDigest: false
        },
        preferences: {
          autoSave: true,
          showTutorials: true,
          compactMode: false,
          enableAnimations: true,
          fontSize: 'medium'
        },
        privacy: {
          profileVisibility: 'private',
          shareAnalytics: true,
          dataRetention: '90days'
        },
        accessibility: {
          highContrast: false,
          reduceMotion: false,
          fontSize: 'normal',
          screenReaderMode: false
        }
      };
      this.render();
      this.attachEventListeners();
      this.saveSettings();
    }
  }

  close() {
    if (this.container) {
      this.container.innerHTML = '';
      this.container.classList.remove('active');
    }
  }

  open() {
    if (this.container) {
      this.container.classList.add('active');
    }
  }

  exportSettings() {
    return JSON.stringify(this.currentSettings, null, 2);
  }

  importSettings(settingsJSON) {
    try {
      const settings = JSON.parse(settingsJSON);
      this.currentSettings = {
        ...this.currentSettings,
        ...settings
      };
      this.saveSettings();
      return true;
    } catch (e) {
      console.error('Failed to import settings:', e);
      return false;
    }
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SettingsPanel;
}
