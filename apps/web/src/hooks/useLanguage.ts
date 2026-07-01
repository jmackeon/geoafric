'use client';

import { useCallback } from 'react';
import { LOCALES, LOCALE_NAMES, RTL_LOCALES, type Locale } from '@/i18n/config';

const LOCALE_COOKIE = 'geoafric_locale';

export function useLanguage() {
  const setLanguage = useCallback((locale: Locale) => {
    document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=31536000; SameSite=Lax`;
    document.documentElement.dir = RTL_LOCALES.includes(locale) ? 'rtl' : 'ltr';
    document.documentElement.lang = locale;
    window.location.reload();
  }, []);

  const getCurrentLocale = useCallback((): Locale => {
    if (typeof document === 'undefined') return 'en';
    const match = document.cookie.match(new RegExp(`${LOCALE_COOKIE}=([^;]+)`));
    const saved = match?.[1] as Locale;
    return LOCALES.includes(saved) ? saved : 'en';
  }, []);

  return {
    setLanguage,
    getCurrentLocale,
    SUPPORTED_LOCALES: LOCALES,
    LOCALE_NAMES,
  };
}
