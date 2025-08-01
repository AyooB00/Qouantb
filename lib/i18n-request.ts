import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';
import { LANGUAGE_COOKIE_NAME } from './language-preferences';
import { locales, defaultLocale, type Locale } from './i18n';

// Server-only configuration for next-intl
export default getRequestConfig(async () => {
  // Get locale from cookies
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(LANGUAGE_COOKIE_NAME)?.value;
  
  // Determine locale
  const locale = cookieLocale && locales.includes(cookieLocale as Locale) 
    ? (cookieLocale as Locale)
    : defaultLocale;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default
  };
});