import { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies'
import { type Locale } from './i18n'

export const LANGUAGE_COOKIE_NAME = 'preferred-language'
export const REMEMBER_LANGUAGE_COOKIE_NAME = 'remember-language'

export const cookieConfig: Partial<ResponseCookie> = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
  // 1 year expiration for remembered preference
  maxAge: 60 * 60 * 24 * 365,
}

export const sessionCookieConfig: Partial<ResponseCookie> = {
  ...cookieConfig,
  // Session cookie - expires when browser closes
  maxAge: undefined,
}

/**
 * Get the preferred language from various sources
 */
export function getPreferredLanguage(
  cookieLanguage?: string,
  acceptLanguageHeader?: string,
  defaultLocale: Locale = 'en'
): Locale {
  // 1. Check cookie preference first
  if (cookieLanguage && isValidLocale(cookieLanguage)) {
    return cookieLanguage as Locale
  }

  // 2. Check Accept-Language header
  if (acceptLanguageHeader) {
    const preferredLocale = parseAcceptLanguage(acceptLanguageHeader)
    if (preferredLocale) {
      return preferredLocale
    }
  }

  // 3. Return default
  return defaultLocale
}

/**
 * Parse Accept-Language header to find preferred locale
 */
function parseAcceptLanguage(acceptLanguage: string): Locale | null {
  const languages = acceptLanguage
    .split(',')
    .map(lang => {
      const [code, q = '1'] = lang.trim().split(';q=')
      return {
        code: code.toLowerCase().split('-')[0],
        quality: parseFloat(q),
      }
    })
    .sort((a, b) => b.quality - a.quality)

  // Map common language codes to our supported locales
  const languageMap: Record<string, Locale> = {
    'en': 'en',
    'ar': 'ar',
    'ara': 'ar',
    'eng': 'en',
  }

  for (const { code } of languages) {
    if (languageMap[code]) {
      return languageMap[code]
    }
  }

  return null
}

/**
 * Check if a locale string is valid
 */
function isValidLocale(locale: string): boolean {
  return locale === 'en' || locale === 'ar'
}