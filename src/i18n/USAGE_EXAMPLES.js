/**
 * ═══════════════════════════════════════════════════════════════
 * i18n Usage Examples
 * ═══════════════════════════════════════════════════════════════
 *
 * This file contains practical examples of how to use the i18n
 * system in Formula Nebula.
 */

// ───────────────────────────────────────────────────────────────
// 1. BASIC INITIALIZATION
// ───────────────────────────────────────────────────────────────

import { initI18n, changeLanguage } from './index.js';
import { LanguageSwitcher } from './LanguageSwitcher.js';

export async function initializeI18nSystem() {
  // Initialize the i18n system
  await initI18n();

  // Create language switcher UI
  const switcher = new LanguageSwitcher('language-switcher-container', {
    position: 'top-right',
    showFlags: true,
    showNames: true,
    compact: false
  });

  switcher.init();
}

// ───────────────────────────────────────────────────────────────
// 2. GETTING TRANSLATIONS
// ───────────────────────────────────────────────────────────────

import i18next from './config.js';

export function getTranslations() {
  // Simple translation
  const welcome = i18next.t('translation.common.welcome');
  console.log(welcome); // Output: "欢迎" (Chinese), "ようこそ" (Japanese), "Bienvenido" (Spanish)

  // Translation with namespace
  const theorem = i18next.t('math.theorem');
  console.log(theorem); // Output: "定理", "定理", "Teorema"

  // Error message
  const error = i18next.t('errors.not_found');
  console.log(error); // Output: "未找到", "見つかりません", "No encontrado"

  // Navigation
  const home = i18next.t('translation.navigation.home');
  console.log(home); // Output: "首页", "ホーム", "Inicio"

  // UI elements
  const save = i18next.t('translation.common.save');
  console.log(save); // Output: "保存", "保存", "Guardar"
}

// ───────────────────────────────────────────────────────────────
// 3. CHANGING LANGUAGE
// ───────────────────────────────────────────────────────────────

export async function switchLanguages() {
  // Switch to Chinese
  await changeLanguage('zh-CN');

  // Switch to Japanese
  await changeLanguage('ja-JP');

  // Switch to Spanish
  await changeLanguage('es-ES');

  // Get current language
  console.log(i18next.language); // Output: 'es-ES'
}

// ───────────────────────────────────────────────────────────────
// 4. FORMATTING FUNCTIONS
// ───────────────────────────────────────────────────────────────

import {
  formatDate,
  formatTime,
  formatDateTime,
  formatNumber,
  formatCurrency,
  formatPercent,
  formatRelativeTime
} from './index.js';

export function demonstrateFormatting() {
  const date = new Date('2024-11-03');
  const amount = 1234.56;

  // Date formatting
  console.log('Date:');
  console.log(formatDate(date)); // "2024年11月3日" (zh-CN/ja-JP), "03/11/2024" (es-ES)

  // Time formatting
  console.log('Time:');
  console.log(formatTime(date)); // "08:30:45"

  // DateTime formatting
  console.log('DateTime:');
  console.log(formatDateTime(date)); // "2024年11月3日 08:30:45"

  // Number formatting
  console.log('Number:');
  console.log(formatNumber(amount)); // "1,234.56" (zh-CN), "1.234,56" (es-ES)

  // Currency formatting
  console.log('Currency:');
  console.log(formatCurrency(amount, 'USD')); // "¥1,234.56" (Chinese/Japanese), "$1,234.56" (Spanish/English)

  // Percentage formatting
  console.log('Percentage:');
  console.log(formatPercent(0.85)); // "85%"

  // Relative time formatting
  console.log('Relative Time:');
  console.log(formatRelativeTime(Date.now() - 7200000)); // "2 hours ago"
}

// ───────────────────────────────────────────────────────────────
// 5. REACT HOOKS (If using React)
// ───────────────────────────────────────────────────────────────

import { useTranslation, useLanguage, useRTL } from './hooks.js';

export function ReactComponentExample() {
  // Translation hook
  const { t, i18n, language } = useTranslation();

  return {
    title: t('translation.app_name'),
    theorem: t('math.theorem'),
    buttonLabel: t('translation.common.save')
  };
}

export function LanguageDisplay() {
  // Language hook
  const currentLanguage = useLanguage();

  const languageMap = {
    'zh-CN': '简体中文',
    'ja-JP': '日本語',
    'es-ES': 'Español'
  };

  return languageMap[currentLanguage];
}

export function RTLDemo() {
  // RTL hook
  const isRTL = useRTL();

  return isRTL ? 'rtl' : 'ltr';
}

// ───────────────────────────────────────────────────────────────
// 6. LISTENING TO LANGUAGE CHANGES
// ───────────────────────────────────────────────────────────────

export function setupLanguageChangeListener() {
  i18next.on('languageChanged', (lng) => {
    console.log('Language changed to:', lng);

    // Update UI when language changes
    updateUIForLanguage(lng);

    // Refresh data if needed
    refreshDataForLanguage(lng);
  });
}

function updateUIForLanguage(language) {
  // Update all UI elements based on new language
  document.documentElement.lang = language;

  // Update text content
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    el.textContent = i18next.t(key);
  });
}

function refreshDataForLanguage(language) {
  // Fetch language-specific data if needed
  console.log('Refreshing data for', language);
}

// ───────────────────────────────────────────────────────────────
// 7. MATHEMATICAL TERMINOLOGY
// ───────────────────────────────────────────────────────────────

export function getMathematicalTerms() {
  const terms = {
    algebra: i18next.t('math.algebra'),
    geometry: i18next.t('math.geometry'),
    algebraicGeometry: i18next.t('math.algebraic_geometry'),
    theorem: i18next.t('math.theorem'),
    definition: i18next.t('math.definition'),
    proof: i18next.t('math.proof'),
    proposition: i18next.t('math.proposition'),
    lemma: i18next.t('math.lemma'),
    corollary: i18next.t('math.corollary'),
    axiom: i18next.t('math.axiom'),
    conjecture: i18next.t('math.conjecture'),
    formula: i18next.t('math.formula'),
    equation: i18next.t('math.equation'),
    variable: i18next.t('math.variable'),
    constant: i18next.t('math.constant'),
    function: i18next.t('math.function'),
    relation: i18next.t('math.relation')
  };

  return terms;
}

// ───────────────────────────────────────────────────────────────
// 8. ERROR HANDLING
// ───────────────────────────────────────────────────────────────

export function getErrorMessages() {
  const errors = {
    notFound: i18next.t('errors.not_found'),
    unauthorized: i18next.t('errors.unauthorized'),
    forbidden: i18next.t('errors.forbidden'),
    serverError: i18next.t('errors.server_error'),
    networkError: i18next.t('errors.network_error'),
    invalidInput: i18next.t('errors.invalid_input'),
    timeout: i18next.t('errors.timeout'),
    offline: i18next.t('errors.offline')
  };

  return errors;
}

export function displayError(errorType) {
  const errorMap = {
    404: 'errors.not_found',
    401: 'errors.unauthorized',
    403: 'errors.forbidden',
    500: 'errors.server_error',
    'NETWORK': 'errors.network_error',
    'TIMEOUT': 'errors.timeout',
    'OFFLINE': 'errors.offline'
  };

  const key = errorMap[errorType];
  const message = i18next.t(key);

  console.error(message);
  // Display error message to user
}

// ───────────────────────────────────────────────────────────────
// 9. VISUALIZATION TERMS
// ───────────────────────────────────────────────────────────────

export function getVisualizationTerms() {
  return {
    nebula: i18next.t('translation.visualization.nebula'),
    nodes: i18next.t('translation.visualization.nodes'),
    edges: i18next.t('translation.visualization.edges'),
    zoom: i18next.t('translation.visualization.zoom'),
    pan: i18next.t('translation.visualization.pan'),
    resetView: i18next.t('translation.visualization.reset_view'),
    view3D: i18next.t('translation.visualization.3d_view')
  };
}

// ───────────────────────────────────────────────────────────────
// 10. HTML DATA ATTRIBUTES
// ───────────────────────────────────────────────────────────────

/**
 * Usage in HTML:
 *
 * <button data-i18n="translation.common.save"></button>
 * <h1 data-i18n="translation.app_name"></h1>
 * <p data-i18n="translation.navigation.home"></p>
 */

export function setupDataAttributeTranslation() {
  function updateTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      el.textContent = i18next.t(key);
    });
  }

  // Update on initialization
  updateTranslations();

  // Update when language changes
  i18next.on('languageChanged', updateTranslations);
}

// ───────────────────────────────────────────────────────────────
// 11. COMPLETE INTEGRATION EXAMPLE
// ───────────────────────────────────────────────────────────────

export async function completeExample() {
  // Step 1: Initialize i18n
  await initI18n();

  // Step 2: Setup language switcher
  const switcher = new LanguageSwitcher('lang-switcher', {
    position: 'top-right',
    showFlags: true
  });
  switcher.init();

  // Step 3: Setup listeners
  setupLanguageChangeListener();
  setupDataAttributeTranslation();

  // Step 4: Get some translations
  console.log('App Name:', i18next.t('translation.app_name'));
  console.log('Tagline:', i18next.t('translation.tagline'));
  console.log('Current Language:', i18next.language);

  // Step 5: Format some data
  console.log('Formatted Date:', formatDate(new Date()));
  console.log('Formatted Currency:', formatCurrency(100, 'USD'));
}

// ───────────────────────────────────────────────────────────────
// 12. BROWSER CONSOLE QUICK TEST
// ───────────────────────────────────────────────────────────────

/**
 * Run in browser console:
 *
 * // Import and test
 * import i18next from '/src/i18n/config.js';
 *
 * // Get current language
 * i18next.language;
 *
 * // Get translation
 * i18next.t('translation.common.welcome');
 *
 * // Change language
 * import { changeLanguage } from '/src/i18n/index.js';
 * await changeLanguage('ja-JP');
 *
 * // Get translation in new language
 * i18next.t('translation.common.welcome');
 */

console.log('i18n Examples Loaded');
