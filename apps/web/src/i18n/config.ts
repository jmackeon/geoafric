// ── Shared constants — safe to import anywhere (client + server) ──────────────
export const LOCALES = ['en', 'fr', 'tw', 'ha', 'yo', 'sw', 'am', 'ar'] as const;
export type Locale = typeof LOCALES[number];

export const LOCALE_NAMES: Record<Locale, string> = {
  en: 'English',
  fr: 'Français',
  tw: 'Twi',
  ha: 'Hausa',
  yo: 'Yorùbá',
  sw: 'Kiswahili',
  am: 'አማርኛ',
  ar: 'العربية',
};

export const RTL_LOCALES: Locale[] = ['ar'];
