/**
 * Formatting utilities for numbers, currency, dates, and percentages
 * Supports localization for Arabic and English
 * Uses standard Arabic numerals (1,000.00) - NOT Eastern Arabic (١٬٠٠٠٫٠٠)
 */

/**
 * Format a number with locale-specific thousands separators
 * @param num - The number to format
 * @param locale - The locale string ('en' or 'ar')
 * @returns Formatted number string
 */
export const formatNumber = (num: number, locale: string) => {
  // Use standard Arabic numerals (1,000.00) - NOT Eastern Arabic (١٬٠٠٠٫٠٠)
  return new Intl.NumberFormat(locale === 'ar' ? 'ar-SA' : 'en-US', {
    numberingSystem: 'latn' // Force Latin numerals
  }).format(num)
}

/**
 * Format currency in USD with proper symbol and locale formatting
 * @param amount - The amount to format
 * @param locale - The locale string ('en' or 'ar')
 * @param compact - Whether to use compact notation (e.g., $1.5M)
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number, locale: string = 'en', compact: boolean = false) => {
  const options: Intl.NumberFormatOptions = {
    style: 'currency',
    currency: 'USD',
    currencyDisplay: 'symbol',
    numberingSystem: 'latn', // Force Latin numerals
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }

  if (compact && Math.abs(amount) >= 1000) {
    options.notation = 'compact'
    options.maximumFractionDigits = 1
  }

  return new Intl.NumberFormat(locale === 'ar' ? 'ar-SA' : 'en-US', options).format(amount)
}

/**
 * Format percentage values
 * @param value - The percentage value (e.g., 5.5 for 5.5%)
 * @param locale - The locale string ('en' or 'ar')
 * @param showSign - Whether to show + sign for positive values
 * @returns Formatted percentage string
 */
export const formatPercentage = (value: number, locale: string = 'en', showSign: boolean = true) => {
  const formatted = new Intl.NumberFormat(locale === 'ar' ? 'ar-SA' : 'en-US', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    numberingSystem: 'latn' // Force Latin numerals
  }).format(value / 100)
  
  if (showSign && value > 0) {
    return `+${formatted}`
  }
  return formatted
}

/**
 * Format large numbers for market cap display (e.g., 1.5B, 500M)
 * @param value - The number to format
 * @param locale - The locale string ('en' or 'ar')
 * @returns Formatted string with abbreviated suffix
 */
export const formatMarketCap = (value: number, locale: string = 'en') => {
  const abbreviations = locale === 'ar' 
    ? { B: 'مليار', M: 'مليون', K: 'ألف' }
    : { B: 'B', M: 'M', K: 'K' }
  
  if (value >= 1e9) {
    return `${formatNumber(value / 1e9, locale)} ${abbreviations.B}`
  } else if (value >= 1e6) {
    return `${formatNumber(value / 1e6, locale)} ${abbreviations.M}`
  } else if (value >= 1e3) {
    return `${formatNumber(value / 1e3, locale)} ${abbreviations.K}`
  }
  
  return formatNumber(value, locale)
}

/**
 * Format date with locale-specific format
 * @param date - Date object or string
 * @param locale - The locale string ('en' or 'ar')
 * @returns Formatted date string
 */
export const formatDate = (date: Date | string, locale: string = 'en') => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-SA' : 'en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    numberingSystem: 'latn' // Force Latin numerals for year
  }).format(dateObj)
}

/**
 * Format relative time (e.g., "5 minutes ago")
 * @param date - Date object or string
 * @param locale - The locale string ('en' or 'ar')
 * @returns Formatted relative time string
 */
export const formatRelativeTime = (date: Date | string, locale: string = 'en') => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000)
  
  const rtf = new Intl.RelativeTimeFormat(locale === 'ar' ? 'ar' : 'en', {
    numeric: 'auto'
  })
  
  // Calculate appropriate unit and value
  if (diffInSeconds < 60) {
    return rtf.format(-diffInSeconds, 'second')
  } else if (diffInSeconds < 3600) {
    return rtf.format(-Math.floor(diffInSeconds / 60), 'minute')
  } else if (diffInSeconds < 86400) {
    return rtf.format(-Math.floor(diffInSeconds / 3600), 'hour')
  } else if (diffInSeconds < 604800) {
    return rtf.format(-Math.floor(diffInSeconds / 86400), 'day')
  } else if (diffInSeconds < 2629800) {
    return rtf.format(-Math.floor(diffInSeconds / 604800), 'week')
  } else if (diffInSeconds < 31557600) {
    return rtf.format(-Math.floor(diffInSeconds / 2629800), 'month')
  } else {
    return rtf.format(-Math.floor(diffInSeconds / 31557600), 'year')
  }
}

/**
 * Format trading hours with market status
 * @param marketStatus - 'open', 'closed', 'pre-market', 'after-hours'
 * @param locale - The locale string ('en' or 'ar')
 * @returns Formatted market hours string
 */
export const formatTradingHours = (marketStatus: string, locale: string = 'en') => {
  const translations = {
    en: {
      'open': 'Market Open (9:30 AM - 4:00 PM ET)',
      'closed': 'Market Closed',
      'pre-market': 'Pre-Market (4:00 AM - 9:30 AM ET)',
      'after-hours': 'After Hours (4:00 PM - 8:00 PM ET)'
    },
    ar: {
      'open': 'السوق مفتوح (9:30 ص - 4:00 م بتوقيت الشرقي)',
      'closed': 'السوق مغلق',
      'pre-market': 'ما قبل الافتتاح (4:00 ص - 9:30 ص بتوقيت الشرقي)',
      'after-hours': 'ما بعد الإغلاق (4:00 م - 8:00 م بتوقيت الشرقي)'
    }
  }
  
  return translations[locale === 'ar' ? 'ar' : 'en'][marketStatus] || marketStatus
}

/**
 * Format earnings date
 * @param date - Earnings date
 * @param locale - The locale string ('en' or 'ar')
 * @returns Formatted earnings date with quarter
 */
export const formatEarningsDate = (date: Date | string, locale: string = 'en') => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const quarter = Math.floor((dateObj.getMonth() + 3) / 3)
  
  const quarterText = locale === 'ar' 
    ? `الربع ${quarter} ${dateObj.getFullYear()}`
    : `Q${quarter} ${dateObj.getFullYear()}`
  
  return `${formatDate(dateObj, locale)} (${quarterText})`
}

/**
 * Format stock price with appropriate decimal places
 * @param price - Stock price
 * @param locale - The locale string ('en' or 'ar')
 * @returns Formatted price string
 */
export const formatStockPrice = (price: number, locale: string = 'en') => {
  // Use more decimal places for penny stocks
  const decimals = price < 1 ? 4 : price < 10 ? 3 : 2
  
  return new Intl.NumberFormat(locale === 'ar' ? 'ar-SA' : 'en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    numberingSystem: 'latn' // Force Latin numerals
  }).format(price)
}

/**
 * Format volume with appropriate units
 * @param volume - Trading volume
 * @param locale - The locale string ('en' or 'ar')
 * @returns Formatted volume string
 */
export const formatVolume = (volume: number, locale: string = 'en') => {
  return formatMarketCap(volume, locale)
}

/**
 * Format a number with a plus/minus sign
 * @param num - The number to format
 * @param locale - The locale to use for formatting
 */
export const formatChange = (num: number, locale: string = 'en'): string => {
  return new Intl.NumberFormat(locale === 'ar' ? 'ar-SA' : 'en-US', {
    signDisplay: 'always',
    numberingSystem: 'latn' // Force Western numerals
  }).format(num)
}

/**
 * Format a percentage change with plus/minus sign and color
 * @param value - The percentage value
 * @param locale - The locale to use for formatting
 * @returns Object with formatted string and suggested color
 */
export const formatPercentageChange = (
  value: number,
  locale: string = 'en'
): { text: string; color: 'green' | 'red' | 'neutral' } => {
  const formatted = new Intl.NumberFormat(locale === 'ar' ? 'ar-SA' : 'en-US', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    signDisplay: 'always',
    numberingSystem: 'latn' // Force Western numerals
  }).format(value / 100)

  let color: 'green' | 'red' | 'neutral' = 'neutral'
  if (value > 0) color = 'green'
  else if (value < 0) color = 'red'

  return { text: formatted, color }
}

/**
 * Format compact number (1K, 1M, 1B) - useful for stats
 * @param num - The number to format
 * @param locale - The locale to use for formatting
 * @param decimals - Number of decimal places
 */
export const formatCompactNumber = (
  num: number,
  locale: string = 'en',
  decimals: number = 1
): string => {
  return new Intl.NumberFormat(locale === 'ar' ? 'ar-SA' : 'en-US', {
    notation: 'compact',
    maximumFractionDigits: decimals,
    numberingSystem: 'latn' // Force Western numerals
  }).format(num)
}