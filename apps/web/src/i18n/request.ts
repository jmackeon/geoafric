// ── Server-only — never import this in client components ──────────────────────
import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';
import { LOCALES, type Locale } from './config';

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get('geoafric_locale')?.value;
  const locale = (LOCALES.includes(localeCookie as Locale) ? localeCookie : 'en') as Locale;

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});