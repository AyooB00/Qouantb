// Can be imported from a shared config
export const locales = ['en', 'ar'] as const;
export type Locale = typeof locales[number];

export const defaultLocale: Locale = 'en';

// Helper to get the display name for each locale
export const localeNames: Record<Locale, string> = {
  en: 'English',
  ar: 'العربية'
};

// Helper to get the flag emoji for each locale
export const localeFlags: Record<Locale, string> = {
  en: '🇺🇸',
  ar: '🇸🇦'
};