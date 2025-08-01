import { locales, type Locale } from '@/lib/i18n'

/**
 * Get a localized path by prepending the locale
 */
export function getLocalizedPath(path: string, locale: Locale): string {
  // Handle external links and anchors
  if (path.startsWith('http') || path.startsWith('#') || path.startsWith('mailto:')) {
    return path
  }
  
  // Handle root path
  if (path === '/') {
    return `/${locale}`
  }
  
  // Handle internal links - prepend locale if not already present
  return path.startsWith(`/${locale}`) ? path : `/${locale}${path}`
}

/**
 * Switch the locale in a given pathname
 */
export function switchLocalePath(pathname: string, newLocale: Locale): string {
  const segments = pathname.split('/')
  const currentLocaleIndex = segments.findIndex(segment => locales.includes(segment as Locale))
  
  if (currentLocaleIndex !== -1) {
    // Replace current locale with new locale
    segments[currentLocaleIndex] = newLocale
    return segments.join('/')
  } else {
    // Add locale to the beginning if not present
    return `/${newLocale}${pathname}`
  }
}

/**
 * Extract the locale from a pathname
 */
export function getLocaleFromPathname(pathname: string): Locale | null {
  const segments = pathname.split('/')
  const locale = segments.find(segment => locales.includes(segment as Locale))
  return locale as Locale | null
}

/**
 * Remove locale from pathname
 */
export function removeLocaleFromPathname(pathname: string): string {
  const segments = pathname.split('/')
  const filteredSegments = segments.filter(segment => !locales.includes(segment as Locale))
  return filteredSegments.join('/') || '/'
}

/**
 * Check if a path is locale-prefixed
 */
export function isLocalePrefixed(path: string): boolean {
  const segments = path.split('/')
  return segments.some(segment => locales.includes(segment as Locale))
}