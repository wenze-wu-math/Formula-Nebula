import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';

// Language resources
import zhCN from './locales/zh-CN.json';
import jaJP from './locales/ja-JP.json';
import esES from './locales/es-ES.json';

// RTL languages
const RTL_LANGUAGES = ['ar', 'he', 'fa', 'ur'];

export const initI18n = async () => {
  await i18next
    .use(LanguageDetector)
    .use(HttpBackend)
    .init({
      fallbackLng: 'en',
      defaultNS: 'translation',
      ns: ['translation', 'math', 'ui', 'errors'],
      resources: {
        'zh-CN': { translation: zhCN.translation, math: zhCN.math, ui: zhCN.ui, errors: zhCN.errors },
        'ja-JP': { translation: jaJP.translation, math: jaJP.math, ui: jaJP.ui, errors: jaJP.errors },
        'es-ES': { translation: esES.translation, math: esES.math, ui: esES.ui, errors: esES.errors },
      },
      interpolation: {
        escapeValue: false,
        formatSeparator: ',',
      },
      detection: {
        order: ['localStorage', 'navigator', 'htmlTag'],
        caches: ['localStorage'],
      },
    });

  // Apply RTL if needed
  updateRTL(i18next.language);

  return i18next;
};

/**
 * Update RTL support based on language
 */
export const updateRTL = (language) => {
  const isRTL = RTL_LANGUAGES.includes(language.split('-')[0]);
  document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
  document.documentElement.lang = language;
};

/**
 * Change language with RTL update
 */
export const changeLanguage = async (language) => {
  await i18next.changeLanguage(language);
  updateRTL(language);
  localStorage.setItem('i18nextLng', language);
};

export default i18next;
