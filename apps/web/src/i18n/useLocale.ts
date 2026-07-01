'use client';

import { LOCALES, LOCALE_NAMES, RTL_LOCALES, type Locale } from './config';

export function useLocale() {
  // Read current locale directly from cookie (client-side only)
  const getCurrentLocale = (): Locale => {
    if (typeof document === 'undefined') return 'en';
    const match = document.cookie.match(/geoafric_locale=([^;]+)/);
    return (LOCALES.includes(match?.[1] as Locale) ? match![1] : 'en') as Locale;
  };

  const setLocale = (locale: Locale) => {
    // Set cookie
    document.cookie = `geoafric_locale=${locale}; path=/; max-age=31536000; SameSite=Lax`;
    // Set document direction for Arabic
    document.documentElement.dir = RTL_LOCALES.includes(locale) ? 'rtl' : 'ltr';
    document.documentElement.lang = locale;
    // Full page reload — server re-renders in new language
    window.location.reload();
  };

  return { setLocale, getCurrentLocale, LOCALES, LOCALE_NAMES, RTL_LOCALES };
}

export { LOCALES, LOCALE_NAMES, RTL_LOCALES, type Locale };