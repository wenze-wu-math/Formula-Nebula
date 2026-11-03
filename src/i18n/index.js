// Main i18n module exports
export { initI18n, changeLanguage, updateRTL } from './config.js';
export {
  formatDate,
  formatTime,
  formatDateTime,
  formatNumber,
  formatCurrency,
  formatPercent,
  formatRelativeTime,
} from './formatters.js';
export { useTranslation, useLanguage, useRTL } from './hooks.js';
export { default as i18next } from './config.js';

// Export locale data
export const SUPPORTED_LANGUAGES = [
  { code: 'zh-CN', name: '简体中文', nativeName: '简体中文', rtl: false },
  { code: 'ja-JP', name: 'Japanese', nativeName: '日本語', rtl: false },
  { code: 'es-ES', name: 'Spanish', nativeName: 'Español', rtl: false },
];

export const RTL_LANGUAGES = ['ar', 'he', 'fa', 'ur'];

export const CULTURAL_ADAPTATIONS = {
  'zh-CN': {
    dateFormat: 'YYYY年MM月DD日',
    timeFormat: 'HH:mm:ss',
    numberSeparator: ',',
    decimalSeparator: '.',
    currencySymbol: '¥',
    weekStartDay: 1, // Monday
    colorScheme: 'traditional-chinese',
  },
  'ja-JP': {
    dateFormat: 'YYYY年MM月DD日',
    timeFormat: 'HH:mm:ss',
    numberSeparator: ',',
    decimalSeparator: '.',
    currencySymbol: '¥',
    weekStartDay: 0, // Sunday
    colorScheme: 'japanese',
  },
  'es-ES': {
    dateFormat: 'DD/MM/YYYY',
    timeFormat: 'HH:mm:ss',
    numberSeparator: '.',
    decimalSeparator: ',',
    currencySymbol: '€',
    weekStartDay: 1, // Monday
    colorScheme: 'spanish',
  },
};
