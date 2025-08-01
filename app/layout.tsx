import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { IntlProvider } from "./intl-provider";
import { getLocale } from "@/lib/get-locale";
import { LocaleProvider } from "@/lib/locale-context";
import { getMessages } from 'next-intl/server';
import { getFontClasses } from "@/lib/fonts";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  
  return {
    title: {
      default: locale === 'ar' ? 'كوانتم بورد - منصة التداول بالذكاء الاصطناعي' : 'QuantumBoard - AI Trading Platform',
      template: locale === 'ar' ? '%s | كوانتم بورد' : '%s | QuantumBoard'
    },
    description: locale === 'ar' 
      ? 'منصة استثمار متقدمة تستخدم وكلاء الذكاء الاصطناعي لتحديد فرص التداول في أسهم ناسداك'
      : 'AI-powered investment platform using advanced agents to identify NASDAQ trading opportunities',
    keywords: locale === 'ar'
      ? ['استثمار', 'تداول', 'ناسداك', 'ذكاء اصطناعي', 'أسهم', 'محفظة استثمارية']
      : ['investment', 'trading', 'NASDAQ', 'AI', 'stocks', 'portfolio', 'artificial intelligence'],
    authors: [{ name: 'QuantumBoard' }],
    creator: 'QuantumBoard',
    publisher: 'QuantumBoard',
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    openGraph: {
      title: locale === 'ar' ? 'كوانتم بورد - منصة الاستثمار بالذكاء الاصطناعي' : 'QuantumBoard - AI-Powered Stock Trading Platform',
      description: locale === 'ar' 
        ? 'منصة استثمار متقدمة تستخدم وكلاء الذكاء الاصطناعي'
        : 'Advanced investment platform using AI agents',
      url: 'https://quoantb.com',
      siteName: 'QuantumBoard',
      locale: locale === 'ar' ? 'ar_SA' : 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: locale === 'ar' ? 'كوانتم بورد' : 'QuantumBoard',
      description: locale === 'ar' 
        ? 'منصة الاستثمار بالذكاء الاصطناعي'
        : 'AI-Powered Stock Trading Platform',
      creator: '@quoantb',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages({ locale });
  const fontClasses = getFontClasses(locale);
  const dir = 'ltr'; // Always use LTR for both languages

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <body
        className={`${fontClasses} antialiased`}
        data-locale={locale}
      >
        <LocaleProvider locale={locale}>
          <IntlProvider locale={locale} messages={messages}>
            <Providers>{children}</Providers>
          </IntlProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}