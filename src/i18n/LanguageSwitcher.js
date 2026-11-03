/**
 * Language Switcher Component
 * Provides UI for users to switch between supported languages
 */

export class LanguageSwitcher {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    this.options = {
      position: 'top-right',
      showFlags: true,
      showNames: true,
      compact: false,
      ...options,
    };
    this.i18n = null;
    this.currentLanguage = 'zh-CN';
  }

  init(i18n) {
    this.i18n = i18n;
    this.currentLanguage = i18n.language;
    this.render();
    this.attachEventListeners();
  }

  render() {
    const supportedLanguages = [
      { code: 'zh-CN', name: '简体中文', flag: '🇨🇳' },
      { code: 'ja-JP', name: '日本語', flag: '🇯🇵' },
      { code: 'es-ES', name: 'Español', flag: '🇪🇸' },
    ];

    const switcherHTML = `
      <div class="i18n-language-switcher i18n-switcher-${this.options.position}">
        <div class="i18n-switcher-label">${this.options.showNames ? '语言 / Language / Idioma' : ''}</div>
        <div class="i18n-switcher-options">
          ${supportedLanguages
            .map(
              (lang) => `
            <button
              class="i18n-switcher-option ${this.currentLanguage === lang.code ? 'active' : ''}"
              data-language="${lang.code}"
              title="${lang.name}"
              aria-label="Switch to ${lang.name}"
            >
              ${this.options.showFlags ? `<span class="i18n-flag">${lang.flag}</span>` : ''}
              ${this.options.showNames ? `<span class="i18n-lang-name">${lang.code.split('-')[0].toUpperCase()}</span>` : ''}
            </button>
          `
            )
            .join('')}
        </div>
      </div>
    `;

    this.container.innerHTML = switcherHTML;
    this.addStyles();
  }

  attachEventListeners() {
    const buttons = this.container.querySelectorAll('.i18n-switcher-option');
    buttons.forEach((button) => {
      button.addEventListener('click', (e) => {
        const language = e.currentTarget.getAttribute('data-language');
        this.switchLanguage(language);
      });
    });
  }

  async switchLanguage(language) {
    await this.i18n.changeLanguage(language);
    this.currentLanguage = language;
    this.updateActiveButton();
    this.dispatchLanguageChangeEvent(language);
  }

  updateActiveButton() {
    const buttons = this.container.querySelectorAll('.i18n-switcher-option');
    buttons.forEach((btn) => {
      btn.classList.remove('active');
      if (btn.getAttribute('data-language') === this.currentLanguage) {
        btn.classList.add('active');
      }
    });
  }

  dispatchLanguageChangeEvent(language) {
    const event = new CustomEvent('languageChanged', { detail: { language } });
    document.dispatchEvent(event);
  }

  addStyles() {
    if (document.getElementById('i18n-switcher-styles')) return;

    const style = document.createElement('style');
    style.id = 'i18n-switcher-styles';
    style.textContent = `
      .i18n-language-switcher {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 8px 12px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 8px;
        font-family: system-ui, -apple-system, sans-serif;
      }

      .i18n-switcher-top-right {
        position: fixed;
        top: 16px;
        right: 16px;
        z-index: 1000;
      }

      .i18n-switcher-top-left {
        position: fixed;
        top: 16px;
        left: 16px;
        z-index: 1000;
      }

      .i18n-switcher-bottom-right {
        position: fixed;
        bottom: 16px;
        right: 16px;
        z-index: 1000;
      }

      .i18n-switcher-bottom-left {
        position: fixed;
        bottom: 16px;
        left: 16px;
        z-index: 1000;
      }

      .i18n-switcher-label {
        font-size: 12px;
        color: rgba(255, 255, 255, 0.7);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .i18n-switcher-options {
        display: flex;
        gap: 8px;
      }

      .i18n-switcher-option {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 6px 10px;
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 4px;
        color: rgba(255, 255, 255, 0.7);
        cursor: pointer;
        transition: all 0.2s ease;
        font-size: 12px;
        font-weight: 500;
      }

      .i18n-switcher-option:hover {
        background: rgba(255, 255, 255, 0.15);
        border-color: rgba(255, 255, 255, 0.4);
        color: rgba(255, 255, 255, 0.9);
      }

      .i18n-switcher-option.active {
        background: rgba(255, 207, 122, 0.2);
        border-color: rgba(255, 207, 122, 0.5);
        color: #ffcf7a;
      }

      .i18n-flag {
        font-size: 16px;
      }

      .i18n-lang-name {
        font-size: 11px;
      }

      @media (max-width: 600px) {
        .i18n-language-switcher {
          gap: 8px;
          padding: 6px 8px;
        }

        .i18n-switcher-label {
          display: none;
        }

        .i18n-switcher-option {
          padding: 4px 8px;
          font-size: 11px;
        }

        .i18n-flag {
          font-size: 14px;
        }
      }

      /* RTL Support */
      [dir="rtl"] .i18n-language-switcher {
        flex-direction: row-reverse;
      }

      [dir="rtl"] .i18n-switcher-top-right {
        right: auto;
        left: 16px;
      }

      [dir="rtl"] .i18n-switcher-top-left {
        left: auto;
        right: 16px;
      }

      [dir="rtl"] .i18n-switcher-bottom-right {
        right: auto;
        left: 16px;
      }

      [dir="rtl"] .i18n-switcher-bottom-left {
        left: auto;
        right: 16px;
      }
    `;

    document.head.appendChild(style);
  }
}
