'use client'

import { Bot, Sparkles, TrendingUp, AlertCircle } from 'lucide-react'
import { AnimatedBackground } from './animated-background'
import { AnimatedText } from './animated-text'
import { useTranslations } from 'next-intl'

export function WelcomeContent() {
  const t = useTranslations('finChat.welcome')
  return (
    <div className="relative">
      <AnimatedBackground />
      <div className="max-w-4xl mx-auto animate-fade-in px-6 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-teal-500/20 via-teal-600/20 to-blue-500/20 mb-6 animate-pulse shadow-2xl">
            <Bot className="w-10 h-10 text-primary animate-bounce" />
          </div>
          <h1 className="text-4xl font-bold mb-4">
            <AnimatedText text={t('title')} speed={50} />
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            <AnimatedText 
              text={t('subtitle')}
              delay={300}
              speed={15}
            />
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="group text-center p-6 rounded-2xl bg-card/50 backdrop-blur border border-border/50 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:bg-card/80 animate-stagger animate-stagger-1">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-green-400/20 to-green-600/20 mb-4 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-6 h-6 text-green-600 group-hover:rotate-6 transition-transform" />
            </div>
            <h3 className="font-semibold mb-2">{t('features.realTimeData.title')}</h3>
            <p className="text-sm text-muted-foreground">
              {t('features.realTimeData.description')}
            </p>
          </div>
          <div className="group text-center p-6 rounded-2xl bg-card/50 backdrop-blur border border-border/50 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:bg-card/80 animate-stagger animate-stagger-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-blue-400/20 to-blue-600/20 mb-4 group-hover:scale-110 transition-transform">
              <Sparkles className="w-6 h-6 text-blue-600 group-hover:rotate-12 transition-transform" />
            </div>
            <h3 className="font-semibold mb-2">{t('features.aiInsights.title')}</h3>
            <p className="text-sm text-muted-foreground">
              {t('features.aiInsights.description')}
            </p>
          </div>
          <div className="group text-center p-6 rounded-2xl bg-card/50 backdrop-blur border border-border/50 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:bg-card/80 animate-stagger animate-stagger-3">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-teal-400/20 to-teal-600/20 mb-4 group-hover:scale-110 transition-transform">
              <AlertCircle className="w-6 h-6 text-teal-600 group-hover:rotate-[-6deg] transition-transform" />
            </div>
            <h3 className="font-semibold mb-2">{t('features.riskAnalysis.title')}</h3>
            <p className="text-sm text-muted-foreground">
              {t('features.riskAnalysis.description')}
            </p>
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          {t('tryPrompts')}
        </p>
      </div>
    </div>
  )
}