import { useEffect, useState } from 'react';
import i18next from './config.js';

/**
 * Hook to use i18n translation
 * Usage: const { t } = useTranslation();
 */
export const useTranslation = () => {
  const [, setTrigger] = useState(0);

  useEffect(() => {
    i18next.on('languageChanged', () => {
      setTrigger(prev => prev + 1);
    });

    return () => {
      i18next.off('languageChanged');
    };
  }, []);

  return {
    t: (key, defaultValue = '') => i18next.t(key, defaultValue),
    i18n: i18next,
    language: i18next.language,
  };
};

/**
 * Hook to use current language
 */
export const useLanguage = () => {
  const [language, setLanguage] = useState(i18next.language);

  useEffect(() => {
    const handleLanguageChange = (lng) => {
      setLanguage(lng);
    };

    i18next.on('languageChanged', handleLanguageChange);

    return () => {
      i18next.off('languageChanged', handleLanguageChange);
    };
  }, []);

  return language;
};

/**
 * Hook to use RTL status
 */
export const useRTL = () => {
  const [isRTL, setIsRTL] = useState(document.documentElement.dir === 'rtl');
  const language = useLanguage();

  useEffect(() => {
    const rtlStatus = document.documentElement.dir === 'rtl';
    setIsRTL(rtlStatus);
  }, [language]);

  return isRTL;
};
