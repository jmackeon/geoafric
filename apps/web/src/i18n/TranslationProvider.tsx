'use client';

import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { LOCALES, LOCALE_NAMES, RTL_LOCALES, type Locale } from './config';

import en from '../../messages/en.json';
import fr from '../../messages/fr.json';
import tw from '../../messages/tw.json';
import ha from '../../messages/ha.json';
import yo from '../../messages/yo.json';
import sw from '../../messages/sw.json';
import am from '../../messages/am.json';
import ar from '../../messages/ar.json';

type Messages = Record<string, any>;

const LOCALE_COOKIE = 'geoafric_locale';
const MESSAGE_MAP: Record<Locale, Messages> = { en, fr, tw, ha, yo, sw, am, ar };

interface I18nContextType {
  locale: Locale;
  t: (key: string, params?: Record<string, string | number>) => string;
  setLocale: (locale: Locale) => void;
  LOCALES: typeof LOCALES;
  LOCALE_NAMES: typeof LOCALE_NAMES;
}

const I18nContext = createContext<I18nContextType>({
  locale: 'en',
  t: (key) => key.split('.').pop() ?? key,
  setLocale: () => {},
  LOCALES,
  LOCALE_NAMES,
});

function getLocaleCookie(): Locale {
  if (typeof document === 'undefined') return 'en';
  const match = document.cookie.match(new RegExp(`${LOCALE_COOKIE}=([^;]+)`));
  const val = match?.[1] as Locale | undefined;
  return val && LOCALES.includes(val) ? val : 'en';
}

function setHtmlLocale(locale: Locale) {
  document.documentElement.dir = RTL_LOCALES.includes(locale) ? 'rtl' : 'ltr';
  document.documentElement.lang = locale;
}

function getByPath(obj: Messages, path: string) {
  return path.split('.').reduce<any>((acc, part) => acc?.[part], obj);
}

export function TranslationProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');

  useEffect(() => {
    const cookieLocale = getLocaleCookie();
    setLocaleState(cookieLocale);
    setHtmlLocale(cookieLocale);
  }, []);

  const setLocale = (newLocale: Locale) => {
    document.cookie = `${LOCALE_COOKIE}=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
    setHtmlLocale(newLocale);
    setLocaleState(newLocale);
  };

  const messages = MESSAGE_MAP[locale] ?? MESSAGE_MAP.en;

  const t = useMemo(() => {
    return (key: string, params?: Record<string, string | number>): string => {
      let text = getByPath(messages, key) ?? getByPath(MESSAGE_MAP.en, key);

      if (typeof text !== 'string') {
        const fallback = key.split('.').pop() ?? key;
        return fallback.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ');
      }

      if (params) {
        Object.entries(params).forEach(([k, v]) => {
          text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
        });
      }

      return text;
    };
  }, [messages]);

  return (
    <I18nContext.Provider value={{ locale, t, setLocale, LOCALES, LOCALE_NAMES }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  return useContext(I18nContext);
}
