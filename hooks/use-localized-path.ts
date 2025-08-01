'use client'

import { useLocale } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useCallback } from 'react'

/**
 * Hook that returns utilities for locale-aware navigation
 */
export function useLocalizedPath() {
  const locale = useLocale()
  const router = useRouter()

  /**
   * Returns a localized path by prepending the current locale
   */
  const getLocalizedPath = useCallback((path: string) => {
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
  }, [locale])

  /**
   * Navigate to a localized path programmatically
   */
  const pushLocalizedPath = useCallback((path: string) => {
    router.push(getLocalizedPath(path))
  }, [router, getLocalizedPath])

  /**
   * Replace current route with a localized path
   */
  const replaceLocalizedPath = useCallback((path: string) => {
    router.replace(getLocalizedPath(path))
  }, [router, getLocalizedPath])

  /**
   * Prefetch a localized path
   */
  const prefetchLocalizedPath = useCallback((path: string) => {
    router.prefetch(getLocalizedPath(path))
  }, [router, getLocalizedPath])

  return {
    locale,
    getLocalizedPath,
    pushLocalizedPath,
    replaceLocalizedPath,
    prefetchLocalizedPath,
  }
}