import { Geist, Geist_Mono, IBM_Plex_Sans_Arabic, Noto_Sans_Arabic } from "next/font/google";

// English fonts
export const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: 'swap',
});

export const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: 'swap',
});

// Arabic fonts
export const ibmPlexArabic = IBM_Plex_Sans_Arabic({
  weight: ['400', '500', '600', '700'],
  subsets: ['arabic'],
  variable: '--font-arabic-primary',
  display: 'swap',
  preload: true,
});

// Fallback Arabic font with comprehensive Unicode coverage
export const notoSansArabic = Noto_Sans_Arabic({
  weight: ['400', '500', '600', '700'],
  subsets: ['arabic'],
  variable: '--font-arabic-fallback',
  display: 'swap',
  preload: false,
});

// Helper function to get font classes based on locale
export function getFontClasses(locale: string): string {
  const baseClasses = `${geistSans.variable} ${geistMono.variable}`;
  
  if (locale === 'ar') {
    return `${ibmPlexArabic.variable} ${notoSansArabic.variable} ${baseClasses}`;
  }
  
  return baseClasses;
}

// Helper function to get font family CSS variable
export function getFontFamily(locale: string): string {
  if (locale === 'ar') {
    return 'var(--font-arabic-primary), var(--font-arabic-fallback), var(--font-geist-sans), system-ui, sans-serif';
  }
  
  return 'var(--font-geist-sans), system-ui, sans-serif';
}