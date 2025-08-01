import { cookies } from 'next/headers'
import { type Locale, defaultLocale } from './i18n'
import { LANGUAGE_COOKIE_NAME, getPreferredLanguage } from './language-preferences'

/**
 * Get the current locale from cookies (server-side)
 */
export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies()
  const cookieLocale = cookieStore.get(LANGUAGE_COOKIE_NAME)?.value
  
  // Get locale from cookie or use default
  const locale = cookieLocale && (cookieLocale === 'en' || cookieLocale === 'ar') 
    ? cookieLocale as Locale 
    : defaultLocale
    
  return locale
}