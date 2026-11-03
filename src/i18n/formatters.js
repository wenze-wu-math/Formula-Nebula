import i18next from './config.js';

/**
 * Format date based on current language
 */
export const formatDate = (date, options = {}) => {
  const lang = i18next.language;
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  };

  // Locale mapping for Intl API
  const localeMap = {
    'zh-CN': 'zh-Hans-CN',
    'zh-TW': 'zh-Hant-TW',
    'ja-JP': 'ja-JP',
    'es-ES': 'es-ES',
    'es-MX': 'es-MX',
  };

  const locale = localeMap[lang] || lang;

  return new Intl.DateTimeFormat(locale, defaultOptions).format(new Date(date));
};

/**
 * Format time based on current language
 */
export const formatTime = (date, options = {}) => {
  const lang = i18next.language;
  const defaultOptions = {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    ...options,
  };

  const localeMap = {
    'zh-CN': 'zh-Hans-CN',
    'ja-JP': 'ja-JP',
    'es-ES': 'es-ES',
  };

  const locale = localeMap[lang] || lang;

  return new Intl.DateTimeFormat(locale, defaultOptions).format(new Date(date));
};

/**
 * Format datetime based on current language
 */
export const formatDateTime = (date, dateOptions = {}, timeOptions = {}) => {
  return `${formatDate(date, dateOptions)} ${formatTime(date, timeOptions)}`;
};

/**
 * Format number based on current language
 */
export const formatNumber = (number, options = {}) => {
  const lang = i18next.language;
  const defaultOptions = {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    ...options,
  };

  const localeMap = {
    'zh-CN': 'zh-Hans-CN',
    'ja-JP': 'ja-JP',
    'es-ES': 'es-ES',
  };

  const locale = localeMap[lang] || lang;

  return new Intl.NumberFormat(locale, defaultOptions).format(number);
};

/**
 * Format currency based on current language and region
 */
export const formatCurrency = (amount, currency = 'USD', options = {}) => {
  const lang = i18next.language;
  const defaultOptions = {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...options,
  };

  const localeMap = {
    'zh-CN': 'zh-Hans-CN',
    'ja-JP': 'ja-JP',
    'es-ES': 'es-ES',
  };

  const locale = localeMap[lang] || lang;

  return new Intl.NumberFormat(locale, defaultOptions).format(amount);
};

/**
 * Format percentage based on current language
 */
export const formatPercent = (number, options = {}) => {
  const lang = i18next.language;
  const defaultOptions = {
    style: 'percent',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    ...options,
  };

  const localeMap = {
    'zh-CN': 'zh-Hans-CN',
    'ja-JP': 'ja-JP',
    'es-ES': 'es-ES',
  };

  const locale = localeMap[lang] || lang;

  return new Intl.NumberFormat(locale, defaultOptions).format(number);
};

/**
 * Format relative time (e.g., "2 hours ago")
 */
export const formatRelativeTime = (date) => {
  const lang = i18next.language;
  const localeMap = {
    'zh-CN': 'zh-Hans-CN',
    'ja-JP': 'ja-JP',
    'es-ES': 'es-ES',
  };

  const locale = localeMap[lang] || lang;
  const now = new Date();
  const diffMs = now - new Date(date);
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  if (diffSecs < 60) {
    return rtf.format(-diffSecs, 'second');
  } else if (diffMins < 60) {
    return rtf.format(-diffMins, 'minute');
  } else if (diffHours < 24) {
    return rtf.format(-diffHours, 'hour');
  } else {
    return rtf.format(-diffDays, 'day');
  }
};
